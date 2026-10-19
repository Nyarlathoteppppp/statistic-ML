/* Block renderer. A page is { id, title, en, eyebrow, lead, chips, blocks }.
 * A block is either a string (Markdown paragraph(s)) or an object with a type field `t`.
 * Interactive blocks (fx, quiz, practice, viz) delegate to their own modules. */
(function (root) {
  'use strict';
  const SML = root.SML;
  const { md, inline, tex, esc } = SML.md;

  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function copyText(text, btn) {
    const done = () => { const o = btn.textContent; btn.textContent = '已复制'; setTimeout(() => { btn.textContent = o; }, 1400); };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, () => fallback());
      else fallback();
    } catch (e) { fallback(); }
    function fallback() {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { btn.textContent = '请手动复制'; }
      ta.remove();
    }
  }

  /* Long displays that join several equations with \qquad overflow on narrow screens.
   * Split them at top-level \qquad (outside braces, \left…\right and environments) and stack the parts. */
  function splitDisplay(src) {
    const s = String(src);
    if (s.length < 70 || s.indexOf('\\qquad') < 0) return [s];
    const parts = []; let depth = 0, start = 0, i = 0;
    while (i < s.length) {
      const c = s[i];
      if (c === '\\') {
        const m = /^\\([a-zA-Z]+)/.exec(s.slice(i));
        if (!m) { i += 2; continue; }
        const name = m[1];
        if (name === 'begin' || name === 'left') depth++;
        else if (name === 'end' || name === 'right') depth--;
        else if (name === 'qquad' && depth === 0) {
          parts.push(s.slice(start, i).replace(/,\s*$/, '')); start = i + m[0].length;
        }
        i += m[0].length; continue;
      }
      if (c === '{') depth++; else if (c === '}') depth--;
      i++;
    }
    parts.push(s.slice(start));
    // short pieces (\Rightarrow, \lambda>0, a page reference) stay on the line before them
    const out = [];
    parts.map((x) => x.trim()).filter(Boolean).forEach((x) => {
      const last = out.length ? out[out.length - 1] : null;
      if (last != null && (x.length < 24 || last.length < 24)) out[out.length - 1] = last + '\\qquad ' + x;
      else out.push(x);
    });
    return out.length > 1 && depth === 0 ? out : [s];
  }
  function mathBlock(src) {
    const parts = splitDisplay(src);
    return el('div', 'math-block' + (parts.length > 1 ? ' stacked' : ''), parts.map((x) => tex(x, true)).join(''));
  }

  const CALLOUT_TITLES = { note: '提示', warn: '易错', good: '要点', errata: '课件笔误', ext: '延伸（课件未讲，不考）' };

  const R = {
    p: (b) => el('div', 'prose', md(b.md)),
    h2: (b, ctx) => {
      const id = b.id || ('s' + (++ctx.h2));
      ctx.toc.push({ id: id, text: b.text });
      const h = el('h2', null, inline(b.text)); h.id = id; return h;
    },
    h3: (b) => { const h = el('h3', null, inline(b.text)); if (b.id) h.id = b.id; return h; },
    h4: (b) => el('h4', null, inline(b.text)),
    math: (b) => mathBlock(b.tex),
    ul: (b) => el('ul', null, b.items.map((i) => '<li>' + inline(i) + '</li>').join('')),
    ol: (b) => el('ol', null, b.items.map((i) => '<li>' + inline(i) + '</li>').join('')),
    steps: (b, ctx) => {
      const ol = el('ol', 'steps');
      b.items.forEach((it) => {
        const li = el('li'); const d = el('div');
        if (typeof it === 'string') d.innerHTML = md(it); else d.appendChild(renderBlocks(Array.isArray(it) ? it : [it], ctx));
        li.appendChild(d); ol.appendChild(li);
      });
      return ol;
    },
    table: (b) => {
      const wrap = el('div', 'table-wrap');
      const head = b.head ? '<thead><tr>' + b.head.map((h) => '<th>' + inline(h) + '</th>').join('') + '</tr></thead>' : '';
      const body = '<tbody>' + b.rows.map((r) => '<tr>' + r.map((c) => '<td>' + inline(c) + '</td>').join('') + '</tr>').join('') + '</tbody>';
      const cap = b.caption ? '<caption>' + inline(b.caption) + '</caption>' : '';
      wrap.innerHTML = '<table class="' + esc(b.cls || '') + '">' + cap + head + body + '</table>';
      return wrap;
    },
    callout: (b, ctx) => {
      const box = el('div', 'callout ' + (b.cls || b.t));
      const title = b.title || CALLOUT_TITLES[b.t] || '';
      if (title) box.appendChild(el('div', 'ctitle', inline(title)));
      if (b.md) box.appendChild(el('div', null, md(b.md)));
      if (b.blocks) box.appendChild(renderBlocks(b.blocks, ctx));
      return box;
    },
    exam: (b) => {
      const box = el('div', 'exam-phrase');
      const head = el('div', 'ctitle', '<span>✍ ' + esc(b.title || 'Exam phrasing · 卷面写法') + '</span>');
      const btn = el('button', 'copy-btn', '复制'); btn.type = 'button';
      head.appendChild(btn);
      const body = el('div', 'phrase', md(b.md));
      btn.addEventListener('click', () => copyText(body.innerText.trim(), btn));
      box.appendChild(head); box.appendChild(body);
      return box;
    },
    deep: (b, ctx) => {
      const d = el('details', 'deep');
      d.appendChild(el('summary', null, inline(b.title || '展开详解') + (b.hint ? ' <span class="hint">' + inline(b.hint) + '</span>' : '')));
      const body = el('div', 'deep-body');
      // Render lazily on first open: keeps initial page light and KaTeX work proportional to what is read.
      let built = false;
      const build = () => { if (!built) { built = true; body.appendChild(renderBlocks(b.blocks, ctx)); if (SML.autoTerms && ctx.seenTerms) SML.autoTerms(body, ctx.seenTerms); } };
      d.addEventListener('toggle', () => { if (d.open) build(); });
      if (b.open) { d.open = true; build(); }
      d.appendChild(body);
      d._build = build;
      return d;
    },
    fig: (b) => {
      const f = el('figure');
      const img = el('img'); img.src = b.src; img.alt = b.alt || b.caption || ''; img.loading = 'lazy';
      if (b.w) img.style.maxWidth = b.w + 'px';
      f.appendChild(img);
      if (b.caption) f.appendChild(el('figcaption', null, inline(b.caption)));
      return f;
    },
    chips: (b) => {
      const c = el('div', 'chips');
      b.items.forEach((i) => {
        const a = el(i.href ? 'a' : 'span', 'chip ' + (i.cls || ''), inline(i.text));
        if (i.href) a.href = i.href;
        c.appendChild(a);
      });
      return c;
    },
    html: (b) => el('div', null, b.html),
    /* Static graph figure. nodes: { A: [x, y] } ; edges: 'E>R A-B B-C:moral' (a>b directed, a-b undirected,
     * optional :cls such as moral / fill / path / gone, optional =label e.g. 'x1-x2=ψ12');
     * cls: { A: 'given' } node classes; labels / notes: display text and a small caption under a node. */
    graph: (b) => graphFigure(b),
    graphs: (b) => {
      const row = el('div', 'graph-row n' + (b.items || []).length);
      (b.items || []).forEach((g) => row.appendChild(graphFigure(Object.assign({ r: b.r, w: b.w }, g))));
      if (!b.caption) return row;
      const wrap = el('figure', 'graph-strip'); wrap.appendChild(row);
      wrap.appendChild(el('figcaption', null, inline(b.caption))); return wrap;
    },
    /* A page of the lecture slides, shown as the teacher drew it. src: 'L20/p19'. */
    slide: (b) => {
      const f = el('figure', 'slide-fig');
      const img = el('img'); img.src = 'reference/pages/' + b.src + '.jpg'; img.loading = 'lazy';
      img.alt = '课件 ' + b.src.replace('/', ' ');
      f.appendChild(img);
      f.appendChild(el('figcaption', null, inline('课件原图 ' + b.src.replace('/', ' ') + (b.caption ? '：' + b.caption : ''))));
      return f;
    },
    past: (b, ctx) => {
      const box = el('div', 'past');
      box.appendChild(el('div', 'past-head',
        '<span class="src">' + esc(b.src) + '</span>' +
        (b.topic ? '<span class="chip">' + inline(b.topic) + '</span>' : '') +
        (b.marks ? '<span class="marks">' + esc(b.marks) + ' marks</span>' : '')));
      const q = el('div', 'past-q');
      q.appendChild(el('div', 'en', md(b.q)));
      if (b.qzh) q.appendChild(el('div', 'qzh', md('题意：' + b.qzh)));
      if (b.blocks) q.appendChild(renderBlocks(b.blocks, ctx));
      box.appendChild(q);
      if (b.sol) {
        const d = el('details', 'sol');
        d.appendChild(el('summary', null, '查看完整解答'));
        const body = el('div', 'sol-body');
        let built = false;
        d.addEventListener('toggle', () => { if (d.open && !built) { built = true; body.appendChild(renderBlocks(b.sol, ctx)); if (b.azh) body.appendChild(el('div', 'azh', md('英文答案的中文意思：' + b.azh))); } });
        d.appendChild(body);
        box.appendChild(d);
      }
      return box;
    },
    fx: (b, ctx) => SML.formula.mount(b, ctx),
    quiz: (b, ctx) => SML.quiz.mountQuiz(b, ctx),
    practice: (b, ctx) => SML.quiz.mountPractice(b, ctx),
    viz: (b, ctx) => {
      const box = el('div', 'viz-box');
      const mount = SML.viz && SML.viz.get(b.id);
      if (!mount) { box.appendChild(el('div', 'pending-box', '交互模块 <code>' + esc(b.id) + '</code> 建设中')); return box; }
      try { mount(box, b.opts || {}, ctx); }
      catch (e) { box.appendChild(el('div', 'callout errata', '交互模块出错：' + esc(e.message))); if (root.console) root.console.error(e); }
      return box;
    },
    /* A Manim video with step captions (data/videos.js, js/ui/video.js). */
    video: (b) => SML.video.mount(b),
    pending: (b) => el('div', 'pending-box', md(b.md || '这一部分正在编写。')),
  };
  ['note', 'warn', 'good', 'errata', 'ext'].forEach((k) => { R[k] = R.callout; });

  function renderBlock(b, ctx) {
    if (typeof b === 'string') return R.p({ md: b }, ctx);
    const fn = R[b.t];
    if (!fn) return el('div', 'callout errata', '未知内容块类型：' + esc(b.t));
    return fn(b, ctx);
  }

  function graphFigure(b) {
    const nodes = {};
    Object.keys(b.nodes || {}).forEach((id) => { const p = b.nodes[id]; nodes[id] = { x: p[0], y: p[1] }; });
    const edges = String(b.edges || '').trim().split(/\s+/).filter(Boolean).map((tok) => {
      const eq = tok.indexOf('='), label = eq >= 0 ? tok.slice(eq + 1).replace(/_/g, ' ') : null;
      const body = eq >= 0 ? tok.slice(0, eq) : tok;
      const [pair, cls] = body.split(':');
      const directed = pair.indexOf('>') >= 0;
      const [a2, b2] = pair.split(directed ? '>' : '-');
      return { a: a2, b: b2, directed: directed, cls: cls || '', label: label };
    });
    const f = el('figure', 'graph-fig');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    SML.vizGraph.draw(svg, { nodes: nodes, edges: edges, nodeCls: b.cls || {}, labels: b.labels, notes: b.notes, r: b.r || 18 });
    if (b.w) svg.style.maxWidth = b.w + 'px';
    f.appendChild(svg);
    if (b.caption) f.appendChild(el('figcaption', null, inline(b.caption)));
    return f;
  }
  function renderBlocks(blocks, ctx) {
    const frag = document.createDocumentFragment();
    (Array.isArray(blocks) ? blocks : blocks ? [blocks] : []).forEach((b) => frag.appendChild(renderBlock(b, ctx)));
    return frag;
  }

  function renderPage(page, ctx) {
    ctx = Object.assign(ctx || {}, { h2: 0, toc: [], page: page, qn: 0 }, { seenTerms: (ctx && ctx.seenTerms) || null });
    const wrap = el('article', 'page');
    const head = el('header', 'page-head');
    if (page.eyebrow) head.appendChild(el('div', 'eyebrow', inline(page.eyebrow)));
    head.appendChild(el('h1', null, inline(page.title)));
    if (page.en) head.appendChild(el('div', 'en-title en', inline(page.en)));
    if (page.chips) head.appendChild(R.chips({ items: page.chips }));
    if (page.lead) head.appendChild(el('div', 'lead', md(page.lead)));
    wrap.appendChild(head);
    const tocSlot = el('nav', 'toc'); wrap.appendChild(tocSlot);
    wrap.appendChild(renderBlocks(page.blocks, ctx));
    const hasHead = (page.blocks || []).some((b) => b && (b.t === 'chapterHead' || b.t === 'reviewHead'));
    if (ctx.toc.length >= 3 && !hasHead) {
      tocSlot.innerHTML = '<b>本页目录</b><ol>' + ctx.toc.map((t) => '<li><a href="#' + SML.app.routeOf(page.id) + '/' + t.id + '">' + inline(t.text) + '</a></li>').join('') + '</ol>';
    } else tocSlot.remove();
    return wrap;
  }

  SML.render = { el: el, renderBlocks: renderBlocks, renderBlock: renderBlock, renderPage: renderPage, copyText: copyText, blocks: R };
})(window);
