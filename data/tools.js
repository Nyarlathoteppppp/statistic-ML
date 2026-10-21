/* Tool pages. Formula sheet, phrases and glossary are filled by data/formulas.js etc. when written. */
(function (root) {
  'use strict';
  const SML = root.SML;

  SML.render.blocks.mistakes = function () {
    const { el } = SML.render;
    const box = el('div');
    const list = SML.store.mistakes();
    if (!list.length) { box.appendChild(el('div', 'pending-box', '还没有错题。做小测答错时会自动收录到这里，之后答对会自动移除。')); return box; }
    const rows = list.map((m) => '<tr><td><a href="#/' + m.page + '">' + SML.md.esc(m.title || m.page) + '</a></td><td>' + SML.md.inline(m.q || '') + '</td><td class="small muted">' + new Date(m.ts).toLocaleDateString() + '</td></tr>').join('');
    box.innerHTML = '<div class="table-wrap"><table><thead><tr><th>页面</th><th>题目</th><th>日期</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
    const clear = el('button', 'btn', '清空错题本'); clear.type = 'button';
    clear.addEventListener('click', () => { SML.store.set('mistakes', []); SML.app.show('mistakes', null, true); });
    box.appendChild(clear);
    return box;
  };

  /* Walk every registered page and collect blocks of a given type (including nested ones). */
  function collect(type) {
    const out = [];
    const walk = (blocks, page) => (blocks || []).forEach((b) => {
      if (!b || typeof b !== 'object') return;
      if (b.t === type) out.push({ page: page, block: b });
      ['blocks', 'sol', 'explain'].forEach((k) => { if (Array.isArray(b[k])) walk(b[k], page); });
      if (b.t === 'steps') (b.items || []).forEach((it) => { if (Array.isArray(it)) walk(it, page); });
      if (b.t === 'quiz') (b.items || []).forEach((it) => { if (Array.isArray(it.explain)) walk(it.explain, page); });
    });
    SML.app.order().forEach((id) => { const p = SML.content.get(id); if (p && ['phrases', 'pastindex', 'mock', 'mock2'].indexOf(id) < 0) walk(p.blocks, id); });
    return out;
  }

  SML.render.blocks.phraseIndex = function (b, ctx) {
    const { el, renderBlocks } = SML.render;
    const box = el('div');
    let last = null;
    collect('exam').forEach(({ page, block }) => {
      if (page !== last) {
        last = page;
        const m = SML.app.metaOf(page);
        box.insertAdjacentHTML('beforeend', '<h3><a href="#/' + page + '">' + SML.md.inline((m.tag ? m.tag + ' · ' : '') + m.title) + '</a></h3>');
      }
      box.appendChild(renderBlocks([block], ctx));
    });
    return box;
  };

  SML.render.blocks.pastIndex = function () {
    const { el } = SML.render;
    const rows = collect('past').map(({ page, block }) => {
      const m = SML.app.metaOf(page);
      return '<tr><td>' + SML.md.esc(block.src) + '</td><td>' + SML.md.esc(String(block.marks || '')) + '</td><td><a href="#/' + page + '">' +
        SML.md.inline((m.tag ? m.tag + ' ' : '') + m.title) + '</a></td><td>' + SML.md.inline(block.topic || '') + '</td></tr>';
    });
    const box = el('div');
    box.innerHTML = '<div class="table-wrap"><table><thead><tr><th>真题</th><th>分值</th><th>在哪一页</th><th>课件</th></tr></thead><tbody>' + rows.join('') + '</tbody></table></div>';
    // chapter concept questions (examQ) — real past-exam short answers
    const eq = [];
    const shown = pastKeys();
    examQs().forEach(({ id, page }) => page.examQ.forEach((e) => { if (!isShown(e.src, shown)) eq.push({ id, e }); }));
    if (eq.length) {
      box.insertAdjacentHTML('beforeend', '<h3>概念简答原题（在各章"Key points in English"框里，汇总见 <a href="#/T13/examq">T13</a>）</h3>');
      const erows = eq.map(({ id, e }) => { const m = SML.app.metaOf(id); return '<tr><td>' + SML.md.esc(e.src || '') + '</td><td><a href="#/' + id + '">' + SML.md.inline((m.tag ? m.tag + ' ' : '') + m.title) + '</a></td></tr>'; });
      box.insertAdjacentHTML('beforeend', '<div class="table-wrap"><table><thead><tr><th>真题</th><th>在哪一章</th></tr></thead><tbody>' + erows.join('') + '</tbody></table></div>');
    }
    // Canvas weekly quiz questions (tagged （平时小测原题） in chapter quizzes) — examinable too
    const quiz = [];
    collect('quiz').forEach(({ page, block }) => (block.items || []).forEach((it) => { if (/平时小测原题/.test(it.q || '')) quiz.push({ page, it }); }));
    if (quiz.length) {
      box.insertAdjacentHTML('beforeend', '<h3>平时小测原题（Canvas quiz）</h3><p class="small muted">官方说 quiz 也在考试范围内。点章节名去那一章的小测里做。</p>');
      const qrows = quiz.map(({ page, it }) => {
        const m = SML.app.metaOf(page);
        const q = String(it.q).replace(/（平时小测原题）\s*/, '');
        return '<tr><td><a href="#/' + page + '/quiz">' + SML.md.inline((m.tag ? m.tag + ' ' : '') + m.title) + '</a></td><td>' + SML.md.inline(q.length > 140 ? q.slice(0, 140) + '…' : q) + '</td></tr>';
      });
      box.insertAdjacentHTML('beforeend', '<div class="table-wrap"><table><thead><tr><th>章节</th><th>题目</th></tr></thead><tbody>' + qrows.join('') + '</tbody></table></div>');
    }
    return box;
  };

  /* All chapter examQ (real past concept questions), grouped by chapter in course order.
   * Question shown, answer folded (self-test). Used on T13 and the past index. */
  function examQs() {
    const out = [];
    SML.app.order().forEach((id) => { const p = SML.content.get(id); if (p && p.examQ && p.examQ.length) out.push({ id: id, page: p }); });
    return out;
  }
  // "2025 practice Q1(c)" and "2025 Q1c" name the same question: year + exam/practice + question + part.
  // 2025 and 2026 papers are practice papers even when the label omits the word. A label may name several papers.
  const QRE = /(\d{4})\s*(?:S\d\s*)?(practice\s*)?(?:exam\s*)?,?\s*Q(\d+(?:\.\d+)?)\s*\(?([a-z])?\)?/gi;
  function qkeys(src) {
    const out = [];
    for (const m of String(src || '').matchAll(QRE)) {
      const prac = m[2] || m[1] === '2025' || m[1] === '2026' ? 'P' : 'E';
      out.push(m[1] + prac + m[3] + (m[4] || '').toLowerCase());
    }
    return out;
  }
  // keys of the past questions already shown as past blocks (T-pages); a whole question ("Q6", "Q10") covers all its parts ("Q6(c)", "Q10.3")
  function pastKeys() {
    const keys = new Set();
    collect('past').forEach(({ block }) => qkeys(block.src).forEach((k) => keys.add(k)));
    return keys;
  }
  // a key is covered by itself or by its whole question: "2016E1.10" ← "2016E1"; "2026P1c" ← "2026P1"
  const parentKeys = (k) => { const out = [k]; let x = k; while (/[a-z]$|\.\d+$/.test(x)) { x = x.replace(/[a-z]$|\.\d+$/, ''); out.push(x); } return out; };
  const isShown = (src, keys) => qkeys(src).some((k) => parentKeys(k).some((x) => keys.has(x)));

  SML.render.blocks.examqIndex = function () {
    const { el } = SML.render;
    const { md, inline } = SML.md;
    const box = el('div', 'examq-index');
    const shown = pastKeys();
    let n = 0;
    examQs().forEach(({ id, page }) => {
      const list = page.examQ.filter((e) => !isShown(e.src, shown));
      if (!list.length) return;
      const m = SML.app.metaOf(id);
      box.insertAdjacentHTML('beforeend', '<h3><a href="#/' + id + '">' + inline((m.tag ? m.tag + ' · ' : '') + (m.title || page.title)) + '</a></h3>');
      list.forEach((e) => {
        n++;
        const card = el('div', 'callout examq');
        card.innerHTML = '<div class="ctitle"><span>' + SML.md.esc(e.src || '原题') + '</span></div>' + md('**Q.** ' + e.q) + (e.qzh ? md('题意：' + e.qzh) : '');
        const d = el('details');
        d.innerHTML = '<summary>看答案</summary>' + md('**A.** ' + e.a) + (e.azh ? md('中文意思：' + e.azh) : '');
        card.appendChild(d);
        box.appendChild(card);
      });
    });
    box.insertAdjacentHTML('afterbegin', '<p class="small muted">共 ' + n + ' 道（本页第 1 节或题型页"真题全解"里已经完整讲过的不重复列出），按章节顺序；先自己答，再点"看答案"。每道也出现在对应章节顶部的"Key points in English"框里。</p>');
    return box;
  };

  /* Selected chapter examQ by [chapterId, src prefix] (the 必会 page): question shown, answer folded, link to the chapter. */
  SML.render.blocks.examqPick = function (b) {
    const { el } = SML.render;
    const { md, inline } = SML.md;
    const box = el('div', 'examq-index');
    (b.picks || []).forEach(([id, src]) => {
      const p = SML.content.get(id);
      const e = p && (p.examQ || []).find((x) => String(x.src || '').indexOf(src) === 0);
      if (!e) { box.appendChild(el('div', 'callout errata', '找不到原题：' + SML.md.esc(id + ' ' + src))); return; }
      const m = SML.app.metaOf(id);
      const card = el('div', 'callout examq');
      card.innerHTML = '<div class="ctitle"><span>' + SML.md.esc(e.src) + ' · <a href="#/' + id + '">' + inline((m.tag ? m.tag + ' ' : '') + (m.title || p.title)) + '</a></span></div>' +
        md('**Q.** ' + e.q) + (e.qzh ? md('题意：' + e.qzh) : '');
      const d = el('details');
      d.innerHTML = '<summary>看答案</summary>' + md('**A.** ' + e.a) + (e.azh ? md('中文意思：' + e.azh) : '');
      card.appendChild(d);
      box.appendChild(card);
    });
    return box;
  };

  SML.content.add([
    { id: 'mistakes', title: '错题本', lead: '小测答错的题。点页面名回去重做。', blocks: [{ t: 'mistakes' }] },
    { id: 'phrases', title: '英文答题句式库', lead: '全站所有"卷面写法"（紫色框）汇总在这里，按页面分组。考前通读一遍，重点背关键词。', blocks: [{ t: 'phraseIndex' }] },
    { id: 'pastindex', title: '真题索引', lead: '三份往年卷的每道题在网站哪一页有完整解答；下面另列平时小测（Canvas quiz）原题。', blocks: [{ t: 'pastIndex' }] },
  ]);
})(window);
