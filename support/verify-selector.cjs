'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {execFileSync} = require('node:child_process');
const here = __dirname;
execFileSync(process.execPath,[path.join(here,'build-selector.cjs'),'--check'],{stdio:'inherit'});
const c = JSON.parse(fs.readFileSync(path.join(here,'template-catalog.json'),'utf8'));
const {evaluate,createExport,toCsv,reason} = require('./selector-engine.js');
const ids = Array.from({length:50},(_,i)=>'T'+String(i+1).padStart(2,'0'));
assert.deepEqual(c.templates.map(t=>t.id),ids);
const qids = c.selection.questions.map(q=>q.id);
assert.equal(new Set(qids).size,16);
const answers = (overrides={},fill=0) => Object.fromEntries(qids.map(id=>[id,Object.hasOwn(overrides,id)?overrides[id]:fill]));
const candidates = (a,d) => evaluate(c,a,d).filter(t=>t.status==='candidate').map(t=>t.id);
for (const t of c.templates) {
  assert.ok(fs.existsSync(path.join(here,'../templates',t.path)),t.path);
  for (const field of ['role','trigger','inputs','outputs','integration','standard_refs']) assert.ok(t[field],t.id+': '+field);
  assert.ok(t.selection_rules.length,t.id);
  for (const [depth,when] of t.selection_rules) {
    assert.ok([0,1,2].includes(depth),t.id);
    for (const [id,value] of Object.entries(when)) {assert.ok(qids.includes(id),id);assert.ok([1,2].includes(value),t.id);}
  }
}
const simple = answers({work:2,ai:1});
const team = answers({work:2,team:1,budget:1,uncertainty:1,users:1,change:1,structure:1,data:1,privacy:1,quality:1,attack:1,delivery:1,operations:1,ai:1,autonomy:1});
const agent = answers({work:2,team:2,budget:2,uncertainty:1,users:1,change:2,structure:2,data:2,privacy:1,quality:2,attack:2,delivery:2,operations:2,ai:2,autonomy:2,model:1});
// Assertions express domain boundaries, not just the number of current rules.
for (const d of [0,1,2]) {
  const noAi = candidates(answers({ai:0,model:2,autonomy:2},2),d);
  for (const id of ['T41','T42','T45','T46','T47','T49','T50']) assert.ok(!noAi.includes(id),'AI absent: '+id);
  assert.ok(candidates(answers({privacy:1}),d).includes('T28'),'Personal data at all depths');
  assert.ok(candidates(answers({budget:2}),d).includes('T03'),'Contract decision at all depths');
  assert.ok(candidates(answers({ai:1,autonomy:1}),d).includes('T49'),'Delegated actions at all depths');
  assert.ok(!candidates(answers(),d).includes('T32'),'Investigation alone has no implementation plan');
  assert.ok(!candidates(answers(),d).includes('T37'),'No tests without a relevant condition');
  assert.ok(candidates(answers({work:2}),d).includes('T32'));
  assert.ok(candidates(answers({work:2}),d).includes('T37'));
  assert.notEqual(candidates(simple,d).length,candidates(team,d).length,'Conditions must affect every depth');
}
assert.ok(!candidates(answers({ai:2,delivery:0}),2).includes('T46'),'System card requires provision');
assert.ok(candidates(answers({ai:2,delivery:2}),0).includes('T46'));
assert.ok(!candidates(answers({ai:1,model:0}),2).includes('T45'),'Simple model use references supplier documents');
assert.ok(candidates(answers({ai:1,model:1}),0).includes('T45'));
assert.ok(!candidates(answers({quality:2}),2).includes('T48'),'Quality alone is not an adversarial-test trigger');
assert.ok(candidates(answers({attack:2}),0).includes('T48'));
const unknown = evaluate(c,answers({},null),2);
assert.ok(unknown.find(t=>t.id==='T28').status==='unknown');
assert.equal(unknown.filter(t=>t.status==='outside').length,0);
assert.equal(evaluate(c,answers({ai:0},null),2).find(t=>t.id==='T45').status,'outside','False dominates unknown in an AND clause');
assert.equal(evaluate(c,answers({privacy:null}),0).find(t=>t.id==='T28').status,'unknown');
assert.equal(evaluate(c,answers({privacy:0}),0).find(t=>t.id==='T28').status,'outside');
assert.ok(!candidates(answers({},null),2).includes('T28'),'Unknown never promoted into a confirmed candidate');
assert.throws(()=>evaluate(c,answers({privacy:3}),0));
assert.throws(()=>evaluate(c,answers(),3));
// Reachability by concrete question conditions, without an unconditional show-all mode.
const reached = new Set();
const cases = [simple,team,agent,answers(),answers({},2),answers({},null)];
for (const id of qids) for(const value of [0,1,2,null]) cases.push(answers({[id]:value}));
let seed=726;
for(let i=0;i<250;i++) cases.push(Object.fromEntries(qids.map(id=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return[id,[0,1,2,null][seed>>>30]];})));
for (const a of cases) {
  const sets = [0,1,2].map(d=>new Set(candidates(a,d)));
  for(const id of sets[0]) assert.ok(sets[1].has(id),'Loose subset of Medium: '+id);
  for(const id of sets[1]) assert.ok(sets[2].has(id),'Medium subset of Tight: '+id);
  for(const id of sets[2]) reached.add(id);
  for(const d of [0,1,2]) {
    const rows=evaluate(c,a,d);
    assert.equal(new Set(rows.map(t=>t.id)).size,50);
    assert.ok(rows.every(t=>['candidate','deeper','unknown','outside'].includes(t.status)));
  }
}
assert.deepEqual([...reached].sort(),ids,'All 50 are reachable from conditions');
// Increasing a known condition cannot silently remove candidates.
for (const q of qids) for(const d of [0,1,2]) for(const level of [0,1]) {
  const lower=candidates({...team,[q]:level},d),upper=candidates({...team,[q]:level+1},d);
  for(const id of lower) assert.ok(upper.includes(id),'Condition monotonicity: '+q+'/'+id);
}
const h=fs.readFileSync(path.join(here,'template-selector.html'),'utf8');
const script=h.match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(script);
const embedded=JSON.parse(script.match(/const catalog = (.*);/)[1]);
assert.deepEqual(embedded,c);
assert.ok(!/\b(fetch|XMLHttpRequest|WebSocket|localStorage|sessionStorage)\b/.test(script));
// Exercise the shipped event handlers with an in-memory DOM substitute.
// This checks answer/mode wiring, not browser rendering or accessibility layout.
function element(value='?') {return {value,disabled:false,innerHTML:'',textContent:'',events:{},addEventListener(name,fn){this.events[name]=fn;}};}
const nodes=Object.fromEntries(qids.flatMap(id=>[['#q-'+id,element()],['#answer-'+id,element()]]));
for(const id of ['questions','modes','summary','results','count-0','count-1','count-2','export-json','export-csv','export-status']) nodes['#'+id]=element();
const chosenDepth=element('1');
const buttons=['small','team','agent','unknown'].map(key=>Object.assign(element(),{dataset:{preset:key}}));
const downloads=[],blobs=new Map();
const context=vm.createContext({
 Blob:class {constructor(parts,options){this.text=parts.join('');this.type=options.type;}},
 URL:{createObjectURL(blob){const url='blob:test-'+blobs.size;blobs.set(url,blob);return url;},revokeObjectURL(url){blobs.delete(url);}},
 setTimeout(fn){fn();},
 document:{
 body:{appendChild(){}},
 createElement(tag){assert.equal(tag,'a');return {remove(){},click(){downloads.push({filename:this.download,...blobs.get(this.href)});}};},
 querySelector(selector){if(selector==='input[name="depth"]:checked')return chosenDepth;if(!nodes[selector])throw new Error('Missing selector '+selector);return nodes[selector];},
 querySelectorAll(selector){assert.equal(selector,'[data-preset]');return buttons;}
}});
vm.runInContext(script,context);
assert.match(nodes['#summary'].textContent,/まだ分からない質問 16問/);
assert.equal(downloads.length,0,'Never save without a click');
assert.equal((nodes['#questions'].innerHTML.match(/<select /g)||[]).length,16);
for(const [key,expected] of Object.entries({small:simple,team,agent})) {
 buttons.find(b=>b.dataset.preset===key).events.click();
 for(const d of [0,1,2]) {
  chosenDepth.value=String(d);nodes['#modes'].events.change();
  assert.equal(nodes['#count-'+d].textContent,candidates(expected,d).length+'件の候補');
  assert.match(nodes['#summary'].textContent,new RegExp('候補 '+candidates(expected,d).length+'件'));
 }
}
buttons[0].events.click();
chosenDepth.value='0';nodes['#modes'].events.change();
const oldCount=nodes['#count-0'].textContent;
nodes['#q-privacy'].value='1';nodes['#questions'].events.change();
assert.notEqual(nodes['#count-0'].textContent,oldCount,'Changing an answer updates Loose immediately');
nodes['#q-ai'].value='0';nodes['#questions'].events.change();
assert.equal(nodes['#q-model'].disabled,true);
assert.equal(nodes['#q-autonomy'].value,'0');
nodes['#q-ai'].value='1';nodes['#questions'].events.change();
assert.equal(nodes['#q-model'].disabled,false);
assert.equal(nodes['#q-model'].value,'?','Re-enabled dependent answer must be confirmed again');
buttons.find(b=>b.dataset.preset==='unknown').events.click();
assert.match(nodes['#summary'].textContent,/まだ分からない質問 16問/);
// Data exports carry candidates only, answer provenance, unknowns and the selected depth.
for(const a of [simple,team,agent,answers({},null)]) for(const depth of [0,1,2]) {
 const snapshot=createExport(c,a,depth,'2026-09-26T00:00:00.000Z');
 assert.deepEqual(snapshot.documents.map(t=>t.id),candidates(a,depth));
 assert.equal(snapshot.counts.candidate,snapshot.documents.length);
 assert.equal(Object.values(snapshot.counts).reduce((sum,v)=>sum+v,0),50);
 assert.equal(snapshot.answers.length,16);
 assert.equal(snapshot.depth.id,c.selection.depths[depth].id);
 for(const t of snapshot.documents) {
  assert.ok(!Object.hasOwn(t,'body') && !Object.hasOwn(t,'content'),'No template attachment');
  const row=evaluate(c,a,depth).find(r=>r.id===t.id);
  assert.equal(t.reason,reason(c,a,row.matches.find(m=>m.minimumDepth<=depth)));
 }
 assert.deepEqual(JSON.parse(JSON.stringify(snapshot)),snapshot);
}
assert.equal(createExport(c,answers({},null),0).unknown_question_count,16);
const noAiExport=createExport(c,answers({ai:0}),0);
assert.equal(noAiExport.answers.find(q=>q.id==='model').status,'not_applicable');
assert.equal(noAiExport.answers.find(q=>q.id==='autonomy').answer,'対象外（AIを使わないため）');
// Independent CSV parser checks quoting, newlines, Unicode and cell boundaries.
function parseCsv(csv) {
 const rows=[];let row=[],cell='',quoted=false;
 for(let i=1;i<csv.length;i++) {
  const ch=csv[i];
  if(ch==='"') {if(quoted && csv[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}
  else if(ch===',' && !quoted){row.push(cell);cell='';}
  else if(ch==='\r' && csv[i+1]==='\n' && !quoted){row.push(cell);rows.push(row);row=[];cell='';i++;}
  else cell+=ch;
 }
 assert.equal(quoted,false);assert.equal(cell,'');return rows;
}
const csvSnapshot=createExport(c,simple,1,'2026-09-26T00:00:00.000Z');
csvSnapshot.documents[0].title='日本語, "引用"\r\n次の行';
csvSnapshot.documents[0].role='=1+1';
const csv=toCsv(csvSnapshot);
assert.equal(csv.charCodeAt(0),0xFEFF);
assert.equal(Buffer.from(csv,'utf8').subarray(0,3).toString('hex'),'efbbbf');
const parsed=parseCsv(csv);
assert.equal(parsed.length,csvSnapshot.documents.length+1);
assert.ok(parsed.every(row=>row.length===14));
assert.equal(parsed[1][1],csvSnapshot.documents[0].title);
assert.equal(parsed[1][3],"'=1+1");
assert.deepEqual(parsed.slice(1).map(row=>row[0]),csvSnapshot.documents.map(t=>t.id));
assert.equal(parsed[1][8],'Medium');
assert.match(parsed[1][10],/今回は、どこまで進めますか？/);
buttons[0].events.click();chosenDepth.value='0';nodes['#modes'].events.change();
nodes['#export-json'].events.click();
assert.equal(downloads.length,1);
assert.match(downloads[0].filename,/^template-selection-loose-.*\.json$/);
assert.equal(downloads[0].type,'application/json;charset=utf-8');
assert.deepEqual(JSON.parse(downloads[0].text).documents.map(t=>t.id),candidates(simple,0));
nodes['#q-privacy'].value='1';nodes['#questions'].events.change();
chosenDepth.value='2';nodes['#modes'].events.change();
nodes['#export-csv'].events.click();
assert.equal(downloads.length,2);
assert.match(downloads[1].filename,/^template-selection-tight-.*\.csv$/);
assert.equal(downloads[1].type,'text/csv;charset=utf-8');
assert.deepEqual(parseCsv(downloads[1].text).slice(1).map(row=>row[0]),candidates({...simple,privacy:1},2));
assert.equal(blobs.size,0,'Temporary download URLs are released');
assert.match(nodes['#export-status'].textContent,/ダウンロードします/);
// Static page/source coherence and local links (dynamic template links checked above).
for(const m of h.matchAll(/href="([^"$]+)"/g)) {
  assert.ok(!/^https?:/.test(m[1]),'No external URL');
  assert.ok(fs.existsSync(path.resolve(here,m[1])),m[1]);
}
for (const file of ['README.md','OPERATIONS_HANDBOOK.md','EFFECTIVENESS_EVALUATION_PLAN.md']) {
  const text=fs.readFileSync(path.join(here,file),'utf8');
  for(const m of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) assert.ok(fs.existsSync(path.resolve(here,m[1])),file+': '+m[1]);
}
for (const [name,a] of Object.entries({small:simple,team,agent})) console.log(name+': Loose / Medium / Tight = '+[0,1,2].map(d=>candidates(a,d).length).join(' / '));
console.log(`PASS: 50 templates reachable; ${cases.length} condition combinations; domain boundaries, monotonicity, event/download handlers (DOM substitute), JSON/CSV exports, data/source sync, syntax and local links. Browser layout, actual browser file saving and real-project effectiveness are not covered.`);
