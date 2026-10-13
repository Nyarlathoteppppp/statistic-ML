/* Builds a lecture page in the fixed concise layout:
 * 1 一句话 → 2 为什么/直觉 → 3 定义与公式 → 4 课件例子 → 5 对比 → 6 易错与笔误 → 7 小测 + 相关题型.
 * Every section is optional; `extra` blocks can be appended to any section. */
(function (root) {
  'use strict';
  const SML = root.SML;

  SML.lecture = function (s) {
    const B = [];
    const sec = (id, text) => B.push({ t: 'h2', id: id, text: text });
    const add = (x) => { if (x) (Array.isArray(x) ? x : [x]).forEach((b) => B.push(b)); };

    if (s.oneLiner) {
      B.push({ t: 'good', title: '一句话', md: s.oneLiner.zh });
      if (s.oneLiner.en) B.push({ t: 'exam', title: 'One-liner（可直接用于简答）', md: s.oneLiner.en });
    }
    if (s.why) { sec('why', '为什么 / 直觉'); add(s.why); }
    if (s.defs || s.formulas) {
      sec('core', '定义与公式');
      if (s.defs) B.push({ t: 'table', head: ['术语', '定义', '出处'], rows: s.defs });
      add(s.formulas);
    }
    if (s.examples) { sec('examples', '课件例子'); add(s.examples); }
    if (s.compare) { sec('compare', '对比'); add(s.compare); }
    if (s.pitfalls || s.errata) {
      sec('pitfalls', '易错点');
      if (s.pitfalls) B.push({ t: 'table', head: ['常见错误', '正确理解'], rows: s.pitfalls });
      (s.errata || []).forEach((e) => B.push({ t: 'errata', md: e }));
    }
    if (s.exam) { sec('exam', '考试怎么考'); add(s.exam); }
    if (s.quiz || s.types) {
      sec('quiz', '小测');
      if (s.types) B.push({ t: 'chips', items: s.types.map((id) => ({ text: '→ ' + SML.app.metaOf(id).tag + ' ' + SML.app.metaOf(id).title, href: '#/' + id })) });
      if (s.quiz) B.push({ t: 'quiz', items: s.quiz });
    }
    return {
      id: s.id, eyebrow: s.eyebrow, lead: s.lead,
      chips: (s.chips || []).map((c) => (typeof c === 'string' ? { text: c, cls: 'src' } : c)),
      blocks: B,
    };
  };
})(window);
