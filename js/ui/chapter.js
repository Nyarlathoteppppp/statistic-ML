/* Chapter builder (v2): the 10-section teaching layout used for every concept chapter.
 *
 *   SML.chapter({
 *     id, week, lec, pages, star: 3|2|1, notExam: md, title, en, summary,
 *     genesis: md,                                      // 为什么会有它：没有它时卡在哪（发生法，放在第 1 节前）
 *     keyEn: [md],                                      // English key points (exam wording); collapsed box on the page, printed in the outline
 *     examQ: [{ src, q, a }],                           // real past-exam concept questions for this chapter (English q + model answer)
 *     goals: [md], prereq: [chapterId], types: [T-page ids], symbols: [[md symbol, md meaning]],
 *     what, why, intuition, math: md | [blocks],      // sections 1–4
 *     fx: [fxBlock],                                    // 5 公式逐项解释
 *     example: md | [blocks],                           // 6 数值例子
 *     viz: [{ id, opts, how: md }],                     // 7 可交互可视化
 *     compare, pitfalls: [[wrong, right]], quiz: [items] // 8–10
 *   })
 * Any section may be omitted; numbering follows what is present. */
(function (root) {
  'use strict';
  const SML = root.SML;

  const STAR = {
    3: { cls: 'hot', text: '★★★ 必考', note: '往年卷直接出过这类题' },
    2: { cls: 'key', text: '★★ 重点', note: '概念 / 简答高频' },
    1: { cls: 'low', text: '★ 了解', note: '会用到，很少单独考' },
  };
  const asBlocks = (x) => (x == null ? [] : Array.isArray(x) ? x : [x]);
  const T_ex = (e) => ({ t: 'callout', cls: 'examq', title: e.src || '原题', md: '**Q.** ' + e.q + (e.qzh ? '\n\n题意：' + e.qzh : '') + '\n\n**A.** ' + e.a + (e.azh ? '\n\n中文意思：' + e.azh : '') });

  SML.chapter = function (c) {
    const SECTIONS = [
      ['what', '它是什么'], ['why', '为什么需要它'], ['intuition', '直觉'], ['math', '数学定义'],
      ['fx', '公式逐项解释'], ['example', '数值例子'], ['viz', '可交互可视化'], ['compare', '与相近概念比较'],
      ['pitfalls', '常见误区'], ['quiz', 'Quiz'],
    ];
    const present = SECTIONS.filter(([k]) => c[k] && (!Array.isArray(c[k]) || c[k].length));
    const B = [];

    // header box: exam badge, goals, prereq, section nav
    const star = STAR[c.star] || STAR[2];
    B.push({ t: 'chapterHead', star: star, notExam: c.notExam, goals: c.goals || [], prereq: c.prereq || [], types: c.types || [], pages: c.pages, symbols: c.symbols || [], sections: present.map(([k, label], i) => ({ id: k, n: i + 1, label: label })) });

    if ((c.keyEn && c.keyEn.length) || (c.examQ && c.examQ.length)) {
      const kb = [];
      if (c.keyEn && c.keyEn.length) kb.push({ t: 'ul', items: c.keyEn, zh: c.keyZh });
      if (c.examQ && c.examQ.length) { kb.push({ t: 'h4', text: '原题（概念题）' }); c.examQ.forEach((e) => kb.push(T_ex(e))); }
      B.push({ t: 'deep', title: 'Key points in English（考试英文要点）' + (c.examQ && c.examQ.length ? ' + 原题' : ''), hint: '点开看', blocks: kb });
    }
    if (c.genesis) B.push({ t: 'callout', cls: 'genesis', title: '为什么会有它', md: c.genesis });

    present.forEach(([k, label], i) => {
      B.push({ t: 'h2', id: k, text: (i + 1) + ' · ' + label });
      if (k === 'fx') c.fx.forEach((f) => B.push(Object.assign({ t: 'fx' }, f)));
      else if (k === 'viz') c.viz.forEach((v) => {
        if (v.how) B.push({ t: 'callout', title: '这个图在做什么', md: v.how, cls: 'how' });
        B.push({ t: 'viz', id: v.id, opts: v.opts || {} });
        if (v.try) B.push({ t: 'good', title: '动手试试', md: v.try });
      });
      else if (k === 'pitfalls') B.push({ t: 'table', head: ['常见错误', '正确理解'], rows: c.pitfalls });
      else if (k === 'quiz') B.push({ t: 'quiz', items: c.quiz });
      else asBlocks(c[k]).forEach((b) => B.push(b));
    });
    B.push({ t: 'notes', id: c.id });

    return {
      id: c.id, eyebrow: (c.week ? c.week + ' · ' : '') + (c.lec || ''), title: c.title, en: c.en,
      lead: c.summary, blocks: B, keyEn: c.keyEn, keyZh: c.keyZh, examQ: c.examQ,
    };
  };

  /* ---- custom blocks ---- */
  const R = SML.render.blocks;
  R.chapterHead = function (b) {
    const { el } = SML.render;
    const { inline, md } = SML.md;
    const box = el('div', 'chapter-head');
    let h = '<div class="ch-badges"><span class="badge ' + b.star.cls + '" title="' + b.star.note + '（根据往年卷判断，非官方）">' + b.star.text + '</span>';
    if (b.pages) h += '<span class="badge src">课件 ' + SML.md.esc(b.pages) + '</span>';
    (b.types || []).forEach((t) => { const m = SML.app.metaOf(t); h += '<a class="badge type" href="#/' + t + '">练 ' + m.tag + ' ' + SML.md.esc(m.title) + '</a>'; });
    h += '</div>';
    if (b.notExam) h += '<div class="callout ext"><div class="ctitle">不考的部分</div>' + md(b.notExam) + '</div>';
    if (b.goals.length) h += '<div class="ch-goals"><b>学完本章你应该能</b><ul>' + b.goals.map((g) => '<li>' + inline(g) + '</li>').join('') + '</ul></div>';
    if (b.prereq.length) h += '<div class="ch-prereq">先修：' + b.prereq.map((p) => '<a href="#/' + p + '">' + SML.md.esc(SML.app.metaOf(p).tag || p) + ' ' + SML.md.esc(SML.app.metaOf(p).title || '') + '</a>').join('，') + '</div>';
    if (b.symbols && b.symbols.length) {
      h += '<details class="ch-sym"><summary>本章符号速查（' + b.symbols.length + ' 个）<span class="hint">看不懂的符号先查这里</span></summary><table class="compact"><tbody>' +
        b.symbols.map((r) => '<tr><td class="sym">' + inline(r[0]) + '</td><td>' + inline(r[1]) + '</td></tr>').join('') + '</tbody></table></details>';
    }
    h += '<nav class="ch-nav">' + b.sections.map((s) => '<a href="#' + SML.app.routeOf(SML.app.current()) + '/' + s.id + '"><span>' + s.n + '</span>' + s.label + '</a>').join('') + '</nav>';
    box.innerHTML = h;
    return box;
  };

  R.notes = function (b) {
    const { el } = SML.render;
    const box = el('div', 'notes');
    box.innerHTML = '<h2 id="notes">我的笔记</h2><p class="small muted">只保存在这台电脑的浏览器里。写下卡住的地方、自己的话总结、想问的问题。</p>';
    const ta = el('textarea', 'notes-area');
    ta.rows = 5;
    const key = 'note.' + b.id;
    ta.value = SML.store.get(key, '');
    let t = null;
    ta.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => SML.store.set(key, ta.value), 300); });
    box.appendChild(ta);
    return box;
  };
})(window);
