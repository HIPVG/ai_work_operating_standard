// Regenerate derived catalog and self-contained HTML from the editable sources.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const here = __dirname;
const root = path.dirname(here);
const normalize = text => text.replace(/\r\n/g, '\n');
const read = p => normalize(fs.readFileSync(path.join(root, p), 'utf8'));
const sha = text => crypto.createHash('sha256').update(text).digest('hex');
const policy = JSON.parse(read('support/selector-rules.json'));
const list = read('templates/README.md');
const pattern = /^\| \[(T\d{2}) (.+?)\]\(([^)]+)\) \| (.+?) \| (.+?) \| (.+?) \| (.+?) \| (.+?) \|$/gm;
const labels = {'必須':'required','推奨':'recommended','尚可':'optional'};
const rows = [...list.matchAll(pattern)];
if (rows.length !== 50 || new Set(rows.map(m => m[1])).size !== 50) throw new Error('Expected 50 unique templates');
const templates = rows.map(m => {
  const [,id,title,relative,light,medium,large,trigger,refs] = m;
  const source = read('templates/' + relative);
  function field(label) {
    const line = source.split(/\r?\n/).find(l => l.startsWith('- ' + label + ': '));
    if (!line) throw new Error(id + ': missing ' + label);
    return line.slice(label.length + 4);
  }
  if (!policy.rules[id]) throw new Error('No selection rule: ' + id);
  return {id,title,category:relative[0].toUpperCase(),path:relative,
    guidance:[light,medium,large].map(l => {if (!labels[l]) throw new Error(l); return labels[l];}),
    role:field('使う判断'),trigger,inputs:field('主な入力'),outputs:field('次へ渡すもの'),integration:field('統合先の例'),
    standard_refs:refs,selection_rules:policy.rules[id],source_sha256:sha(source)};
}).sort((a,b) => a.id.localeCompare(b.id));
const {rules, ...selection} = policy;
const catalog = {
  schema_version:'0.2',status:'non-normative-index',
  canonical_sources:{template_contents:'../templates/',selection_guidance:'../templates/README.md',governing_standard:'../01-ai_work_operating_standard_integrated_v1_0_2026-09.md',selection_rules:'selector-rules.json'},
  field_notes:{guidance:'Original [lightweight, medium, large] reference labels, NOT Loose/Medium/Tight or normative requirements.',selection_rules:'Editorial selection suggestions, separate from the standard and project decisions.',source_sha256:'SHA256 of UTF-8 template text with CRLF normalized to LF. Source hashes use the same normalization.'},
  source_hashes:{template_list:sha(list),selection_rules:sha(read('support/selector-rules.json'))},selection,templates
};
const frame = read('support/selector-page.html');
const safeJson = JSON.stringify(catalog).replace(/</g,'\\u003c');
const outputs = {
  'template-catalog.json': JSON.stringify(catalog,null,2) + '\n',
  'template-selector.html': frame.replace('/* CATALOG */',() => 'const catalog = ' + safeJson + ';')
    .replace('/* ENGINE */',() => read('support/selector-engine.js'))
};
let stale = false;
for (const [name, content] of Object.entries(outputs)) {
  const target = path.join(here,name);
  if (process.argv.includes('--check')) {
    if (!fs.existsSync(target) || normalize(fs.readFileSync(target,'utf8')) !== content) {console.error('Out of date: ' + name); stale = true;}
  } else fs.writeFileSync(target,content,'utf8');
}
if (stale) process.exitCode = 1;
else console.log(process.argv.includes('--check') ? 'Catalog and standalone HTML match their sources.' : 'Generated catalog and standalone HTML (50 templates).');
