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
    const box = el('div', 'table-wrap');
    box.innerHTML = '<table><thead><tr><th>真题</th><th>分值</th><th>在哪一页</th><th>课件</th></tr></thead><tbody>' + rows.join('') + '</tbody></table>';
    return box;
  };

  SML.content.add([
    { id: 'mistakes', title: '错题本', lead: '小测答错的题。点页面名回去重做。', blocks: [{ t: 'mistakes' }] },
    { id: 'phrases', title: '英文答题句式库', lead: '全站所有"卷面写法"（紫色框）汇总在这里，按页面分组。考前通读一遍，重点背关键词。', blocks: [{ t: 'phraseIndex' }] },
    { id: 'pastindex', title: '真题索引', lead: '三份往年卷的每道题在网站哪一页有完整解答。', blocks: [{ t: 'pastIndex' }] },
  ]);
})(window);
