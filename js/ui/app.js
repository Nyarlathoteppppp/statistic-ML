/* App shell: content registry, sidebar navigation, hash router, progress, theme.
 * Routes: #/ID or #/ID/sectionId. Pages register with SML.content.add(page); the catalogue
 * (data/catalog.js) defines navigation order, so unwritten pages still appear as "建设中". */
(function (root) {
  'use strict';
  const SML = root.SML;
  const pages = {};

  SML.content = {
    add(list) { (Array.isArray(list) ? list : [list]).forEach((p) => { pages[p.id] = Object.assign(pages[p.id] || {}, p); }); },
    get(id) { return pages[id]; },
    all() { return pages; },
  };

  const routeOf = (id) => '/' + id;

  function metaOf(id) { return (SML.catalog.meta[id] || { title: id }); }
  function order() {
    const ids = [];
    SML.catalog.zones.forEach((z) => (z.units || [{ items: z.items }]).forEach((u) => u.items.forEach((id) => ids.push(id))));
    return ids;
  }

  /* ---------- sidebar ---------- */
  function buildNav() {
    const nav = document.getElementById('nav');
    const prog = SML.store.progress();
    nav.innerHTML = '';
    SML.catalog.zones.forEach((z) => {
      const d = document.createElement('details');
      d.className = 'nav-zone'; d.open = z.open !== false;
      d.innerHTML = '<summary>' + z.title + '</summary>';
      (z.units || [{ items: z.items }]).forEach((u) => {
        if (u.title) d.insertAdjacentHTML('beforeend', '<div class="nav-unit">' + u.title + '</div>');
        u.items.forEach((id) => {
          const m = metaOf(id);
          const a = document.createElement('a');
          a.className = 'nav-link' + ((m.pending || !pages[id]) ? ' pending' : '');
          a.href = '#' + routeOf(id); a.dataset.id = id;
          const st = prog[id] || {};
          a.innerHTML = (m.tag ? '<span class="tag">' + m.tag + '</span>' : '') +
            '<span>' + SML.md.inline(m.title) + ((m.hot >= 3 || m.star === 3) ? ' <span class="hot">★</span>' : '') + '</span>' +
            '<span class="dot ' + (st.done ? 'done' : st.read ? 'read' : '') + '"></span>';
          d.appendChild(a);
        });
      });
      nav.appendChild(d);
    });
  }

  function updateProgressPill() {
    const prog = SML.store.progress();
    const ids = order().filter((id) => pages[id] && !metaOf(id).pending && metaOf(id).countable !== false);
    const done = ids.filter((id) => prog[id] && prog[id].done).length;
    const pill = document.getElementById('progress');
    if (pill) pill.innerHTML = '已掌握 <b>' + done + '</b> / ' + ids.length;
  }

  /* ---------- page ---------- */
  function pageFor(id) {
    const m = metaOf(id);
    const p = pages[id];
    if (p) return Object.assign({ id: id, title: m.title, en: m.en, eyebrow: m.eyebrow }, p);
    return {
      id: id, title: m.title, en: m.en, eyebrow: m.eyebrow,
      blocks: [{ t: 'pending', md: m.pendingNote || (m.chapter ? '本章正在编写，按学习顺序推进。先看本周已完成的章节或右下角的"下一页"。' : '这一页正在编写。') }],
    };
  }

  function footer(id) {
    const { el } = SML.render;
    const ids = order();
    const k = ids.indexOf(id);
    const foot = el('div', 'page-foot');
    const prev = ids[k - 1], next = ids[k + 1];
    const link = (pid, dir) => pid ? '<a href="#' + routeOf(pid) + '"><span class="dir">' + dir + '</span>' + SML.md.inline(metaOf(pid).title) + '</a>' : '<span></span>';
    foot.innerHTML = link(prev, '← 上一页');
    const mid = el('div');
    if (metaOf(id).countable !== false && !metaOf(id).pending) {
      const prog = SML.store.progress()[id] || {};
      const b = el('button', 'btn' + (prog.done ? ' primary' : ''), prog.done ? '✓ 已掌握' : '标记为已掌握'); b.type = 'button';
      b.addEventListener('click', () => {
        const cur = SML.store.progress()[id] || {};
        if (cur.done) SML.store.unmark(id, 'done'); else SML.store.mark(id, 'done');
        show(id, null, true);
      });
      mid.appendChild(b);
    }
    foot.appendChild(mid);
    foot.insertAdjacentHTML('beforeend', link(next, '下一页 →'));
    return foot;
  }

  let current = null;
  function show(id, section, keepScroll) {
    if (!SML.catalog.meta[id] && !pages[id]) id = 'home';
    const main = document.getElementById('main');
    const y = root.scrollY;
    const page = pageFor(id);
    current = id;
    main.innerHTML = '';
    const ctx = { seenTerms: new Set() };
    main.appendChild(SML.render.renderPage(page, ctx));
    if (SML.autoTerms && id !== 'glossary') SML.autoTerms(main, ctx.seenTerms);
    main.appendChild(footer(id));
    document.querySelectorAll('.nav-link').forEach((a) => a.classList.toggle('active', a.dataset.id === id));
    const crumb = document.getElementById('crumb');
    if (crumb) crumb.innerHTML = SML.md.inline((metaOf(id).tag ? metaOf(id).tag + ' · ' : '') + metaOf(id).title);
    document.title = metaOf(id).title + ' · SML 期末复习';
    if (!metaOf(id).pending) SML.store.mark(id, 'read');
    buildNav(); updateProgressPill();
    document.querySelectorAll('.nav-link').forEach((a) => a.classList.toggle('active', a.dataset.id === id));
    document.body.classList.remove('nav-open');
    current = id;
    if (keepScroll) root.scrollTo(0, y);
    else if (section) {
      const target = document.getElementById(section);
      if (target) {
        const d = target.closest('details');
        if (d && !d.open) { d.open = true; if (d._build) d._build(); }
        target.scrollIntoView();
      }
    } else root.scrollTo(0, 0);
  }

  function route() {
    const h = (root.location.hash || '').replace(/^#\/?/, '');
    const [id, section] = h.split('/');
    if (id === current && section) {
      const t = document.getElementById(section);
      if (t) { t.scrollIntoView(); return; }
    }
    show(id || 'home', section);
  }

  /* ---------- theme ---------- */
  function applyTheme(t) {
    if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
    else delete document.documentElement.dataset.theme;
    const btn = document.getElementById('theme');
    if (btn) btn.textContent = t === 'dark' ? '☀ 浅色' : '☾ 深色';
  }

  function start() {
    applyTheme(SML.store.get('theme', 'light'));
    document.getElementById('theme').addEventListener('click', () => {
      const cur = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
      const nxt = cur === 'dark' ? 'light' : 'dark';
      SML.store.set('theme', nxt); applyTheme(nxt);
    });
    document.getElementById('menu').addEventListener('click', () => document.body.classList.toggle('nav-open'));
    // font size
    const sizes = [15, 16, 17, 18, 19];
    const applySize = (px) => { document.documentElement.style.fontSize = px + 'px'; };
    let size = SML.store.get('fontSize', 16); applySize(size);
    const fbtn = document.getElementById('fontsize');
    if (fbtn) fbtn.addEventListener('click', () => { size = sizes[(sizes.indexOf(size) + 1) % sizes.length] || 16; SML.store.set('fontSize', size); applySize(size); });
    // Alt + ←/→ : previous / next page
    root.addEventListener('keydown', (e) => {
      if (!e.altKey || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
      const ids = order(); const k = ids.indexOf(current);
      const nxt = ids[k + (e.key === 'ArrowRight' ? 1 : -1)];
      if (nxt) { e.preventDefault(); root.location.hash = '#/' + nxt; }
    });
    setupSearch();
    root.addEventListener('hashchange', route);
    buildNav();
    route();
  }

  /* ---------- full-text search over titles and content ---------- */
  function plain(x) {
    return JSON.stringify(x || '').replace(/\\[a-zA-Z]+/g, ' ').replace(/[{}$*`#_"\[\]|]/g, ' ').replace(/\s+/g, ' ');
  }
  let index = null;
  function buildIndex() {
    index = order().filter((id) => pages[id] && !metaOf(id).pending).map((id) => {
      const p = pages[id], m = metaOf(id);
      return { id: id, title: (m.tag ? m.tag + ' ' : '') + (m.title || p.title || id), text: (plain(p.title) + ' ' + plain(p.en) + ' ' + plain(p.lead) + ' ' + plain(p.blocks)).toLowerCase() };
    });
  }
  function setupSearch() {
    const input = document.getElementById('search');
    const box = document.getElementById('search-results');
    if (!input || !box) return;
    const close = () => { box.hidden = true; };
    input.addEventListener('input', () => {
      if (!index) buildIndex();
      const q = input.value.trim().toLowerCase();
      if (q.length < 2) { close(); return; }
      const hits = index.map((e) => {
        const i = e.text.indexOf(q), inTitle = e.title.toLowerCase().indexOf(q) >= 0;
        return (i < 0 && !inTitle) ? null : { e: e, score: (inTitle ? 0 : 1) + i / 1e6, i: i };
      }).filter(Boolean).sort((a, b) => a.score - b.score).slice(0, 12);
      box.innerHTML = hits.length ? hits.map((h) => {
        const s = h.i >= 0 ? h.e.text.slice(Math.max(0, h.i - 24), h.i + 48) : '';
        return '<a href="#/' + h.e.id + '"><b>' + SML.md.esc(h.e.title) + '</b><span>' + SML.md.esc(s) + '</span></a>';
      }).join('') : '<div class="muted small">没有找到</div>';
      box.hidden = false;
    });
    box.addEventListener('click', () => { close(); input.value = ''; });
    document.addEventListener('click', (e) => { if (!box.contains(e.target) && e.target !== input) close(); });
  }

  SML.app = { start: start, show: show, routeOf: routeOf, metaOf: metaOf, order: order, current: () => current };
})(window);
