/* Printable outline: { t:'outline' } builds a paper handout from the site's own data, so it always matches the site.
 * Per week: the week's storyline (review page "概念之间怎么连起来") and one block per chapter with
 * its one-line summary, the week's key point for it, formula cards, top mistakes, and a ruled column for notes.
 * Ends with the exam-type pages' solving steps. Print with the browser (A4); the toolbar is hidden on paper. */
(function (root) {
  'use strict';
  const SML = root.SML;
  const R = SML.render.blocks;

  const textBlocks = (blocks) => (blocks || []).filter((b) => typeof b === 'string');

  // blocks between the h2 with this id and the next h2
  function sectionBlocks(page, id) {
    const out = [];
    let on = false;
    (page.blocks || []).forEach((b) => {
      if (b && b.t === 'h2') { on = b.id === id; return; }
      if (on) out.push(b);
    });
    return out;
  }

  R.outline = function (b, ctx) {
    const { el } = SML.render;
    const { md, inline, tex } = SML.md;
    const pages = SML.content.all();
    const meta = SML.catalog.meta;
    const wrap = el('div', 'outline');

    const bar = el('div', 'ol-bar noprint');
    const btn = el('button', 'btn primary', '打印 / 存成 PDF'); btn.type = 'button';
    btn.addEventListener('click', () => root.print());
    bar.append(btn, el('span', 'muted small', '纸张选 A4、纵向；打印设置里勾上"背景图形"，右边的笔记横线才会印出来。'));
    wrap.appendChild(bar);

    const notes = (lines) => { const n = el('div', 'ol-notes'); n.style.minHeight = (lines * 1.6) + 'em'; return n; };
    const row = (left, lines) => { const r = el('div', 'ol-row'); r.append(left, notes(lines)); return r; };

    // ---- cover: how to use + map of weeks, chapters and exam types ----
    const cover = el('section', 'ol-cover');
    const intro = el('div');
    intro.innerHTML = md('**怎么用**：左边是网站上的脉络和要点，右边留白写你自己的补充。每章标题后面的 `#/c23` 就是网站上那一章的地址（在网址末尾输入即可跳过去）。学完一章，在标题下面的方框里打勾。') +
      md('**考试**：11 月 6 日（周五）16:30，Royal Exhibition Building West；阅读 15 分钟 + 作答 120 分钟；闭卷、不用计算器，复杂公式会给；讲过的都考（lectures、workshops、quizzes）。');
    cover.appendChild(row(intro, 6));
    const course = SML.catalog.zones.find((z) => z.id === 'course');
    const map = el('table', 'ol-map compact');
    map.innerHTML = '<thead><tr><th>周</th><th>章节（网站编号）</th></tr></thead>';
    const tb = el('tbody');
    course.units.forEach((u) => {
      const tr = el('tr');
      const chs = u.items.filter((id) => /^c\d+/.test(id)).map((id) => (meta[id].tag || id) + ' ' + meta[id].title + (meta[id].star === 3 ? ' ★' : ''));
      tr.innerHTML = '<td>' + inline(u.title) + '</td><td>' + chs.map((c) => inline(c)).join('；') + '</td>';
      tb.appendChild(tr);
    });
    map.appendChild(tb);
    cover.appendChild(map);
    wrap.appendChild(cover);

    // ---- one section per week ----
    course.units.forEach((u) => {
      const sec = el('section', 'ol-week');
      sec.appendChild(el('h2', 'ol-wtitle', inline(u.title)));
      const rid = u.items.find((id) => /^r\d+/.test(id));
      const rv = rid && pages[rid];
      const kp = rv ? ((rv.blocks || []).find((x) => x && x.t === 'kp') || { items: [] }).items : [];
      if (rv) {
        const story = el('div', 'ol-story');
        story.appendChild(el('div', 'ol-label', '本周脉络'));
        if (rv.lead) story.appendChild(el('div', null, md(rv.lead)));
        textBlocks(sectionBlocks(rv, 'map')).slice(0, 3).forEach((t) => story.appendChild(el('div', null, md(t))));
        sec.appendChild(row(story, 5));
      }
      u.items.filter((id) => /^c\d+/.test(id)).forEach((id) => {
        const p = pages[id];
        if (!p) return;
        const head = (p.blocks || []).find((x) => x && x.t === 'chapterHead') || {};
        const box = el('div', 'ol-ch');
        const left = el('div');
        const types = (head.types || []).map((t) => '练 ' + (meta[t] ? meta[t].tag : t)).join(' · ');
        left.appendChild(el('div', 'ol-ctitle', '<b>第 ' + (meta[id].tag || id) + ' 章 · ' + inline(p.title) + '</b>' +
          ' <span class="ol-meta">' + (head.star ? head.star.text : '') + ' · 网站 #/' + id + (types ? ' · ' + types : '') + '</span>'));
        left.appendChild(el('div', 'ol-check', '□ 读完　□ 小测全对　□ 题型练过　□ 复习过'));
        const gen = (p.blocks || []).find((x) => x && x.t === 'callout' && x.cls === 'genesis');
        if (gen) left.appendChild(el('div', 'ol-item', '<span class="ol-label">为什么有它</span>' + md(gen.md)));
        if (p.lead) left.appendChild(el('div', 'ol-item', '<span class="ol-label">一句话</span>' + md(p.lead)));
        kp.filter((k) => k[1] === id).forEach((k) => left.appendChild(el('div', 'ol-item', '<span class="ol-label">要点</span>' + md(k[0]))));
        const fx = (p.blocks || []).filter((x) => x && x.t === 'fx');
        if (fx.length) {
          const f = el('div', 'ol-item');
          f.appendChild(el('span', 'ol-label', '公式'));
          fx.forEach((x) => {
            const one = el('div', 'ol-fx');
            one.innerHTML = '<span class="ol-fxt">' + inline(x.title || '') + '</span>' + tex(x.tex, true);
            f.appendChild(one);
          });
          left.appendChild(f);
        }
        const pit = sectionBlocks(p, 'pitfalls').find((x) => x && x.t === 'table');
        if (pit && pit.rows && pit.rows.length) {
          const ul = el('ul', 'ol-pit');
          pit.rows.slice(0, 3).forEach((r) => { const li = el('li'); li.innerHTML = '✗ ' + inline(r[0]) + ' → ✓ ' + inline(r[1]); ul.appendChild(li); });
          const it = el('div', 'ol-item'); it.appendChild(el('span', 'ol-label', '易错')); it.appendChild(ul);
          left.appendChild(it);
        }
        box.appendChild(row(left, 8));
        sec.appendChild(box);
      });
      wrap.appendChild(sec);
    });

    // ---- exam types: solving steps ----
    const types = SML.catalog.zones.find((z) => z.id === 'types');
    if (types) {
      const sec = el('section', 'ol-week');
      sec.appendChild(el('h2', 'ol-wtitle', '题型：解题步骤'));
      types.items.forEach((id) => {
        const p = pages[id];
        if (!p) return;
        const left = el('div');
        left.appendChild(el('div', 'ol-ctitle', '<b>' + (meta[id].tag || id) + ' · ' + inline(p.title) + '</b> <span class="ol-meta">网站 #/' + id + '</span>'));
        if (p.lead) left.appendChild(el('div', 'ol-item', md(p.lead)));
        const steps = (p.blocks || []).find((x) => x && x.t === 'steps');
        if (steps) {
          const ol = el('ol', 'ol-steps');
          steps.items.forEach((s) => { const li = el('li'); li.innerHTML = typeof s === 'string' ? inline(s) : ''; ol.appendChild(li); });
          left.appendChild(ol);
        }
        const box = el('div', 'ol-ch');
        box.appendChild(row(left, 6));
        sec.appendChild(box);
      });
      wrap.appendChild(sec);
    }
    return wrap;
  };
})(window);
