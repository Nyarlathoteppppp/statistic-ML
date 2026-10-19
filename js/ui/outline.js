/* Printable outline: { t:'outline' } builds a compact paper handout (target ≤ 15 A4 pages) from the site's own data.
 * Exam words are in English. Per week: the week's storyline (b.storyline). Per chapter: English title, English key
 * points (keyEn), every formula with an English label (b.fxEn maps the site's Chinese labels; folded not-examinable
 * parts skipped), past concept questions (examQ, English) and the top pitfall, beside a blank notes column.
 * Then the exam types' solving steps. Explanations stay on the site. Print with the browser (A4). */
(function (root) {
  'use strict';
  const SML = root.SML;
  const R = SML.render.blocks;

  const noRef = (s) => String(s || '').replace(/（(?:L|WK|Worksheet)[^）]*）/g, '').trim();

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

  // every formula of a page in reading order: fx cards first, then math blocks, skipping folded not-examinable parts.
  // A formula under the generic "1 · 它是什么" heading gets the key 'cNN:k' (its k-th one) so it can be named per chapter.
  function formulas(page) {
    const out = [], seen = new Set();
    let what = 0;
    const add = (label, t) => {
      const k = t.replace(/\\htmlClass\{[^}]*\}/g, '').replace(/\s+/g, '');
      if (seen.has(k)) return;
      seen.add(k);
      const l = noRef(label);
      out.push({ label: /^1 · /.test(l) ? page.id + ':' + (++what) : l, tex: t });
    };
    (page.blocks || []).forEach((b) => { if (b && b.t === 'fx') add(b.title || '', b.tex); });
    let sec = '', h = '';
    const walk = (b, skip) => {
      if (!b || typeof b !== 'object') return;
      if (Array.isArray(b)) { b.forEach((x) => walk(x, skip)); return; }
      if (b.t === 'h2') { sec = b.id || ''; h = b.text || ''; return; }
      if (b.t === 'h3') { h = b.text || ''; return; }
      const sk = skip || b.t === 'fold' || b.t === 'ext' || (b.t === 'deep' && /notexam|storyfold/.test(b.cls || ''));
      if (!sk && sec !== 'quiz' && b.t === 'math') add(h, b.tex);
      (b.blocks || []).forEach((x) => walk(x, sk));
    };
    walk(page.blocks, false);
    return out;
  }

  R.outline = function (b) {
    const { el } = SML.render;
    const { md, inline, tex } = SML.md;
    const pages = SML.content.all();
    const meta = SML.catalog.meta;
    const fxEn = b.fxEn || {};
    const fxWhat = b.fxWhat || {};
    const wrap = el('div', 'outline');

    const bar = el('div', 'ol-bar noprint');
    const btn = el('button', 'btn primary', '打印 / 存成 PDF'); btn.type = 'button';
    btn.addEventListener('click', () => root.print());
    bar.append(btn, el('span', 'muted small', '纸张选 A4、纵向、缩放 100%。公式和考点都已印好；右边空白一栏只写你自己的补充。'));
    wrap.appendChild(bar);

    const row = (left) => { const r = el('div', 'ol-row'); r.append(left, el('div', 'ol-notes')); return r; };
    const label = (text) => '<span class="ol-label">' + text + '</span>';

    // ---- head: exam facts and how to use ----
    const head = el('div', 'ol-head');
    head.innerHTML = '<div class="ol-h1">COMP90051 Statistical Machine Learning · Exam outline</div>' +
      md('**Exam** Fri 6 Nov 16:30, Royal Exhibition Building West · 15 min reading + 120 min writing · closed book, no calculator, complex formulas are given. ' +
        '每章标题后的 `#/c23` 是网站地址，解释和练习都在网站上；这里只印要背、要写的东西，英文照抄即可。');
    wrap.appendChild(row(head));

    // ---- one section per week: storyline, then chapters ----
    const course = SML.catalog.zones.find((z) => z.id === 'course');
    const story = b.storyline || [];
    course.units.forEach((u, wi) => {
      const sec = el('section', 'ol-week');
      const st = story[wi];
      const top = el('div');
      top.appendChild(el('div', 'ol-wtitle', inline(st ? st[0] : u.title)));
      if (st) top.appendChild(el('div', 'ol-story', inline(st[1])));
      sec.appendChild(row(top));
      u.items.filter((id) => /^c\d+/.test(id)).forEach((id) => {
        const p = pages[id];
        if (!p) return;
        const ch = (p.blocks || []).find((x) => x && x.t === 'chapterHead') || {};
        const left = el('div');
        const star = meta[id].star ? '★'.repeat(meta[id].star) : '';
        const types = (ch.types || []).map((t) => (meta[t] ? meta[t].tag : t)).join(' ');
        left.appendChild(el('div', 'ol-ctitle', '<b>' + (meta[id].tag || id) + ' ' + inline(p.en || p.title) + '</b> <span class="ol-zht">' + inline(p.title) + '</span>' +
          ' <span class="ol-meta">' + star + (types ? ' · ' + types : '') + ' · #/' + id + '</span>'));
        if (p.keyEn && p.keyEn.length) {
          const ul = el('ul', 'ol-key');
          p.keyEn.forEach((k) => { const li = el('li'); li.innerHTML = inline(k); ul.appendChild(li); });
          left.appendChild(ul);
        }
        // group formulas by English name, so a name prints once
        const groups = new Map();
        formulas(p).forEach((x) => {
          const name = fxWhat[x.label] || fxEn[x.label] || x.label;
          if (!groups.has(name)) groups.set(name, []);
          groups.get(name).push(x.tex);
        });
        if (groups.size) {
          const f = el('div', 'ol-fxs');
          f.innerHTML = label('Formulas') + [...groups].map(([name, ts]) => '<span class="ol-f"><span class="ol-fxt">' + inline(name) + ':</span> ' + ts.map((t) => tex(t, false)).join('<span class="ol-sep">;</span> ') + '</span>').join('');
          left.appendChild(f);
        }
        (p.examQ || []).forEach((e) => left.appendChild(el('div', 'ol-exq', label('Past ' + inline(e.src || '')) + '<b>Q.</b> ' + inline(e.q) + ' <b>A.</b> ' + inline(e.a))));
        const pit = sectionBlocks(p, 'pitfalls').find((x) => x && x.t === 'table');
        if (pit && pit.rows && pit.rows.length) left.appendChild(el('div', 'ol-pit1', label('易错') + '✗ ' + inline(pit.rows[0][0]) + ' → ✓ ' + inline(pit.rows[0][1])));
        const box = el('div', 'ol-ch');
        box.appendChild(row(left));
        sec.appendChild(box);
      });
      wrap.appendChild(sec);
    });

    // ---- exam types: solving steps ----
    const types = SML.catalog.zones.find((z) => z.id === 'types');
    if (types) {
      const sec = el('section', 'ol-week');
      const top = el('div');
      top.appendChild(el('div', 'ol-wtitle', 'Exam question types · 题型解题步骤'));
      top.appendChild(el('div', 'ol-story', '往年原题已印在各章 "Past" 里；T13 简答题库在网站 #/T13。'));
      sec.appendChild(row(top));
      types.items.filter((id) => id !== 'T13').forEach((id) => {
        const p = pages[id];
        if (!p) return;
        const left = el('div');
        left.appendChild(el('div', 'ol-ctitle', '<b>' + (meta[id].tag || id) + ' ' + inline(meta[id].en || p.title) + '</b> <span class="ol-zht">' + inline(p.title) + '</span> <span class="ol-meta">#/' + id + '</span>'));
        // the method: the first steps block outside a worked example; otherwise the page's first table
        let h2 = '', steps = null, table = null;
        (p.blocks || []).forEach((x) => {
          if (!x) return;
          if (x.t === 'h2') { h2 = x.text || ''; return; }
          if (x.t === 'steps' && !steps && !/例子|例题|全解/.test(h2)) steps = x;
          if (x.t === 'table' && !table) table = x;
        });
        if (steps) {
          const ol = el('ol', 'ol-steps');
          steps.items.forEach((x) => { const li = el('li'); li.innerHTML = typeof x === 'string' ? inline(x) : ''; ol.appendChild(li); });
          left.appendChild(ol);
        } else if (table && table.rows) {
          const ul = el('ul', 'ol-key');
          table.rows.forEach((r) => { const li = el('li'); li.innerHTML = r.map((c) => inline(String(c))).join(' · '); ul.appendChild(li); });
          left.appendChild(ul);
        }
        const fs = formulas(p);
        if (fs.length) left.appendChild(el('div', 'ol-fxs', label('Formulas') + fs.map((x) => '<span class="ol-f">' + tex(x.tex, false) + '</span>').join('')));
        const box = el('div', 'ol-ch');
        box.appendChild(row(left));
        sec.appendChild(box);
      });
      wrap.appendChild(sec);
    }
    return wrap;
  };
})(window);
