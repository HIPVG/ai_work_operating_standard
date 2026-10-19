'use strict';
// Read-only checks. DOM substitutes do not prove browser layout, clipboard or disk saving.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.dirname(__dirname);
const html = fs.readFileSync(path.join(__dirname, 'test-policy-builder.html'), 'utf8');
const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)];
assert.equal(scripts.length, 1);
const script = scripts[0][1];
new vm.Script(script);
assert.ok(html.includes('../01-ai_work_operating_standard_v1_6_2026-10.md'));
assert.ok(!html.includes('v1.5'));
assert.ok(!/<script[^>]+src=|\b(?:fetch|XMLHttpRequest|localStorage|sessionStorage|sendBeacon)\b/.test(html));

const elements = new Map();
for (const [, id] of html.matchAll(/\bid="([^"]+)"/g)) {
  assert.ok(!elements.has(id), 'duplicate id: ' + id);
  const handlers = {};
  const classes = new Set();
  elements.set(id, {value:'', checked:false, hidden:false, disabled:false, textContent:'', handlers,
    selected:[], classList:{remove:c=>classes.delete(c), toggle:(c,on)=>on?classes.add(c):classes.delete(c)},
    addEventListener:(event,handler)=>{handlers[event]=handler;},
    querySelectorAll(){return this.selected.map(value=>({value}));},
    select(){this.wasSelected=true;}
  });
}
for (const [, id] of script.matchAll(/byId\('([^']+)'\)/g)) assert.ok(elements.has(id), 'missing DOM id: '+id);
const el = id => elements.get(id);
const stage = {value:'G0'};
let copied = null, blob = null, clicked = false, revoked = false, clipboardFails = false;
const timers = [];
const link = {click(){clicked=true;}};
const context = {
  document:{getElementById:el,querySelector:()=>stage,createElement:tag=>{assert.equal(tag,'a');return link;}},
  navigator:{clipboard:{async writeText(text){if(clipboardFails)throw Error('test denial');copied=text;}}},
  Blob:class {constructor(parts,options){this.parts=parts;this.options=options;}},
  URL:{createObjectURL(value){blob=value;return 'blob:test-only';},revokeObjectURL(value){assert.equal(value,'blob:test-only');revoked=true;}},
  setTimeout:callback=>timers.push(callback)
};
vm.createContext(context);
vm.runInContext(script, context);
const baseline = {stage:'G0',name:'',unit:'',purpose:'',scope:'',overall:'',delta:'',baselineState:'',baseline:'',limits:'',effects:[],effectsNone:false,routes:'',evidenceState:'',evidence:'',boundaries:[],effort:''};
let checks = 0;
function check(name, fn) {fn();checks++;console.log('PASS: '+name);}
const build = data => context.buildPolicy({...baseline,...data});

async function main() {
  check('blank G0 retains unknowns and does not request G5 inputs',()=>{
    const r=build({}); assert.ok(r.missing.length>=5); assert.ok(!r.missing.includes('検証工数の幅と前提')); assert.ok(r.text.includes('未承認'));
  });
  check('blank G5 retains required planning unknowns',()=>{
    const r=build({stage:'G5'}); assert.ok(r.missing.includes('G4 基本設計・制御設計の対象版と経路ID')); assert.ok(r.missing.includes('検証工数の幅と前提'));
  });
  check('conflicting impact choices are reported',()=>assert.ok(build({effects:['外部への送信・操作'],effectsNone:true}).missing.includes('影響の選択と「影響なし」の矛盾')));
  check('delta does not imply whole-product acceptance',()=>{
    const r=build({unit:'変更差分'}); assert.ok(r.missing.includes('変更部分の期待結果')); assert.ok(r.missing.includes('既存動作・品質への影響')); assert.ok(r.text.includes('製品全体を受け入れたことにはならない'));
  });
  check('trial limits and evidence location stay unknown when absent',()=>{
    assert.ok(build({purpose:'機能レビュー'}).missing.includes('レビュー・試行の利用制約'));
    assert.ok(build({stage:'G5',evidenceState:'あり'}).missing.includes('既存の確認結果の所在・条件'));
  });
  check('filled G5 is still unapproved and distinguishes estimate, authority and gate',()=>{
    const r=build({stage:'G5',unit:'提供範囲全体',purpose:'継続的な業務利用',scope:'指定した社内利用者',overall:'EX-REQ',effectsNone:true,routes:'EX-R01 v1',evidenceState:'なし',boundaries:['純粋ロジック'],effort:'1〜2時間'});
    assert.equal(r.missing.length,0);
    for(const s of ['v1.6','未承認','内容・証拠・許可は未照合','概算工数は実行の許可上限ではない','第6.11節','対象外又は代表試験','必要な実経路'])assert.ok(r.text.includes(s),s);
  });
  check('multiline and markup-like input remain plain draft text',()=>{
    const r=build({overall:'EX-A\nEX-B\n<script>test-only</script>'});assert.ok(r.text.includes('EX-A\n  - EX-B'));assert.ok(r.text.includes('<script>test-only</script>'));
    assert.ok(!script.includes('innerHTML'));
  });
  check('G0/G5 and delta controls switch independently',()=>{
    assert.equal(el('g5-fields').hidden,true);stage.value='G5';el('acceptance-unit').value='変更差分';el('baseline-state').value='あり';el('evidence-state').value='あり';context.refreshFields();
    for(const id of ['g5-fields','delta-fields','baseline-detail-field','evidence-detail-field'])assert.equal(el(id).hidden,false,id);
  });
  check('input changes preserve edits until explicit regeneration',()=>{
    el('output').value='EX-EDIT';el('builder-form').handlers.input();assert.equal(el('output').value,'EX-EDIT');assert.ok(el('status').textContent.includes('入力が変わりました'));
    el('generate').handlers.click();assert.notEqual(el('output').value,'EX-EDIT');assert.equal(el('download').disabled,false);assert.equal(el('copy').disabled,false);
  });
  check('form submission is suppressed without changing draft',()=>{
    el('output').value='EX-EDIT';let stopped=false;el('builder-form').handlers.submit({preventDefault(){stopped=true;}});assert.ok(stopped);assert.equal(el('output').value,'EX-EDIT');
  });
  el('output').value='EX-EDITED-DOWNLOAD';
  await el('copy').handlers.click();
  check('copy uses current edited draft',()=>assert.equal(copied,'EX-EDITED-DOWNLOAD'));
  clipboardFails=true;await el('copy').handlers.click();
  check('clipboard denial offers manual copy',()=>{assert.ok(el('output').wasSelected);assert.ok(el('message').textContent.includes('手動'));});
  check('download uses current draft and reports initiation only',()=>{
    el('download').handlers.click();assert.ok(clicked);assert.equal(link.download,'test-policy-draft.md');assert.equal(blob.parts[0],'EX-EDITED-DOWNLOAD');assert.ok(el('message').textContent.includes('開始しました'));assert.ok(!el('message').textContent.includes('保存しました'));timers.forEach(fn=>fn());assert.ok(revoked);
  });
  check('publication allowlist is unique, present and excludes preserved material',()=>{
    const scope=JSON.parse(fs.readFileSync(path.join(__dirname,'publication-scope-v1_6.json'),'utf8'));
    const included=scope.groups.flatMap(g=>g.paths);assert.equal(new Set(included).size,included.length);
    for(const p of included){assert.ok(!path.isAbsolute(p)&&!p.split('/').includes('..'));assert.ok(fs.existsSync(path.join(root,p)),p);}
    // Excluded local material is intentionally absent in a clean published checkout.
    for(const p of scope.excluded_preserve)assert.ok(!included.includes(p),p);
  });
  console.log('PASS: '+checks+' checks. DOM substitutes only; actual browser layout, clipboard and saved files are NOT verified.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
