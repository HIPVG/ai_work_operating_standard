/* Pure selection logic shared by the standalone HTML and Node verification. */
(function (root) {
  'use strict';
  function evaluate(catalog, answers, depth) {
    if (![0, 1, 2].includes(depth)) throw new Error('Invalid depth');
    const known = new Set(catalog.selection.questions.map(q => q.id));
    for (const [key, value] of Object.entries(answers)) {
      if (!known.has(key) || ![null, 0, 1, 2].includes(value)) throw new Error('Invalid answer: ' + key);
    }
    return catalog.templates.map(t => {
      const clauses = t.selection_rules.map(([minimumDepth, when]) => {
        const terms = Object.entries(when);
        const ruledOut = terms.some(([key, level]) => answers[key] != null && answers[key] < level);
        const unknown = terms.filter(([key]) => answers[key] == null).map(([key]) => key);
        return {minimumDepth, when, status: ruledOut ? 'no' : unknown.length ? 'unknown' : 'yes', unknown};
      });
      const matches = clauses.filter(c => c.status === 'yes').sort((a, b) => a.minimumDepth - b.minimumDepth);
      const possible = clauses.filter(c => c.status === 'unknown');
      const eligible = matches.filter(c => c.minimumDepth <= depth);
      const unresolved = possible.filter(c => c.minimumDepth <= depth);
      // A known recommendation takes priority; unknown never means not applicable.
      const status = eligible.length ? 'candidate' : unresolved.length ? 'unknown' : matches.length ? 'deeper' : possible.length ? 'unknown' : 'outside';
      return {...t, status, matches, possible, minimumDepth: matches[0]?.minimumDepth ?? null};
    });
  }
  function reason(catalog, values, clause) {
    const terms = Object.keys(clause.when);
    const text = terms.length ? terms.map(id => {
      const q = catalog.selection.questions.find(q => q.id === id);
      return q.title + ' ' + (values[id] == null ? 'まだ分からない' : q.options[values[id]]);
    }).join(' ／ ') : '目的・進める範囲・解決したい問題を共有するため';
    return text + (clause.minimumDepth ? ' → ' + catalog.selection.depths[clause.minimumDepth].name + '以上で詳しく確認。' : '');
  }
  function createExport(catalog, values, depth, createdAt = new Date().toISOString()) {
    const rows = evaluate(catalog, values, depth);
    const answers = catalog.selection.questions.map(q => {
      const value = values[q.id] ?? null;
      const notUsed = !!q.requires && values[q.requires] === 0;
      return {id:q.id,question:q.title,value,answer:notUsed ? '対象外（AIを使わないため）' : value === null ? 'まだ分からない' : q.options[value],status:notUsed ? 'not_applicable' : value === null ? 'unknown' : 'answered'};
    });
    return {
      export_schema_version:'0.1',tool_version:catalog.selection.version,created_at:createdAt,
      scope:'現在の回答と確認の詳しさから選ばれた候補一覧。採用・承認の記録ではなく、テンプレート本文は含まない。',
      depth:{id:catalog.selection.depths[depth].id,name:catalog.selection.depths[depth].name},
      source_hashes:catalog.source_hashes,answers,
      unknown_question_count:answers.filter(q => q.status === 'unknown').length,
      counts:Object.fromEntries(['candidate','deeper','unknown','outside'].map(status => [status,rows.filter(t => t.status === status).length])),
      documents:rows.filter(t => t.status === 'candidate').map(t => {
        const matches = t.matches.filter(c => c.minimumDepth <= depth);
        return {id:t.id,title:t.title,category:t.category,role:t.role,reason:reason(catalog,values,matches[0]),
          integration:t.integration,template_path:'templates/'+t.path,standard_refs:t.standard_refs,
          source_sha256:t.source_sha256,matched_conditions:matches.map(c => ({minimum_depth:catalog.selection.depths[c.minimumDepth].id,minimum_answers:c.when}))};
      })
    };
  }
  function csvCell(value) {
    let text = String(value ?? '');
    // Keep spreadsheet applications from treating a label as a formula.
    if (/^[\s\uFEFF]*[=+@-]/u.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g,'""') + '"';
  }
  function toCsv(snapshot) {
    const conditions = snapshot.answers.map(q => q.question + ' ' + q.answer).join(' ／ ');
    const header = ['文書ID','文書名','分類','この文書の役割','候補になった理由','今ある資料にまとめるなら','テンプレートの場所（リポジトリ内）','運用標準の参考対応先','確認の詳しさ','まだ分からない質問の数','質問への回答','保存データの作成日時（UTC）','ツール版','一覧の位置付け'];
    const rows = snapshot.documents.map(t => [t.id,t.title,t.category,t.role,t.reason,t.integration,t.template_path,t.standard_refs,snapshot.depth.name,snapshot.unknown_question_count,conditions,snapshot.created_at,snapshot.tool_version,snapshot.scope]);
    return '\uFEFF' + [header,...rows].map(row => row.map(csvCell).join(',')).join('\r\n') + '\r\n';
  }
  const api = {evaluate,reason,createExport,toCsv};
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.TemplateSelector = api;
})(globalThis);
