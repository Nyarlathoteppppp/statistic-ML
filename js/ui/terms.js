/* Term pop-ups: clicking a .term button (from [[...]] in Markdown) shows a plain-language card. */
(function (root) {
  'use strict';
  const SML = root.SML;
  let pop = null, owner = null;

  function close() { if (pop) { pop.remove(); pop = null; owner = null; } }
  function open(btn) {
    close();
    const t = SML.terms.get(btn.dataset.k);
    const { inline, esc } = SML.md;
    pop = document.createElement('div');
    pop.className = 'term-pop';
    pop.setAttribute('role', 'dialog');
    if (!t) pop.innerHTML = '<div class="tp-plain">（术语表里还没有这个词）</div>';
    else {
      const here = SML.app.current && SML.app.current();
      pop.innerHTML = '<div class="tp-head"><b>' + esc(t.en) + '</b><span>' + esc(t.zh || '') + '</span></div>' +
        '<div class="tp-plain">' + inline(t.plain || '') + '</div>' +
        '<div class="tp-foot">' + (t.ch && t.ch !== here ? '<a href="#/' + t.ch + '">详细讲解：第 ' + esc(SML.app.metaOf(t.ch).tag) + ' 章 ' + esc(SML.app.metaOf(t.ch).title) + ' →</a>' : '') +
        '<a href="#/glossary">术语表</a></div>';
    }
    document.body.appendChild(pop);
    owner = btn;
    const r = btn.getBoundingClientRect(), w = Math.min(340, root.innerWidth - 24);
    pop.style.width = w + 'px';
    let left = r.left + root.scrollX;
    left = Math.max(12 + root.scrollX, Math.min(left, root.scrollX + root.innerWidth - w - 12));
    pop.style.left = left + 'px';
    const below = r.bottom + root.scrollY + 6;
    pop.style.top = below + 'px';
    const ph = pop.offsetHeight;
    if (r.bottom + ph + 12 > root.innerHeight && r.top - ph - 6 > 0) pop.style.top = (r.top + root.scrollY - ph - 6) + 'px';
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('button.term');
    if (b) { e.preventDefault(); if (owner === b) close(); else open(b); return; }
    if (pop && !pop.contains(e.target)) close();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  root.addEventListener('hashchange', close);
})(window);

/* Auto-gloss: the first occurrence on a page of each glossary term written in English becomes a tappable
 * term, followed by its Chinese name in brackets — unless that Chinese name is already written nearby. */
(function (root) {
  'use strict';
  const SML = root.SML;
  const SKIP = new Set(['normal', 'precision', 'mean', 'density', 'joint', 'independent', 'tr', 'det', 'inf', 'sup', 'pd', 'sgn',
    'proportional', '∝', 'loss', 'indicator', 'inverse', 'invertible', 'singular', 'bias', 'recall', 'evidence', 'projection', 'basis', 'span', 'trace', 'variance', 'map', 'parent', 'child']);
  let re = null, byKey = null;
  function build() {
    byKey = {};
    Object.keys(SML.terms.all()).forEach((k) => {
      const t = SML.terms.get(k);
      if (!/[a-z]/i.test(k) || k.length < 3 || SKIP.has(k)) return;
      if (k !== SML.terms.key(t.en) && k.length < 6) return; // short aliases are too ambiguous
      byKey[k] = t;
    });
    const keys = Object.keys(byKey).sort((a, b) => b.length - a.length).map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    re = keys.length ? new RegExp('(^|[^A-Za-z\\-])(' + keys.join('|') + ')(?![A-Za-z])', 'i') : null;
  }
  // exact tag names (a substring test on a joined string used to skip P, B, I, … because they occur inside OPTION, BUTTON, INPUT)
  const NO = new Set('KATEX,CODE,BUTTON,A,H1,H2,H3,H4,TEXTAREA,INPUT,SELECT,OPTION,SCRIPT,STYLE,SVG,SUMMARY'.split(','));
  function skipEl(el) {
    for (let e = el; e; e = e.parentElement) {
      if (NO.has(e.tagName) || (e.classList && (e.classList.contains('katex') || e.classList.contains('exam-phrase') || e.classList.contains('term-pop') || e.classList.contains('solver') || e.classList.contains('chips') || e.classList.contains('ch-nav') || e.classList.contains('page-foot') || e.classList.contains('en-title') || e.classList.contains('outline')))) return true; // the handout has its own Chinese lines
      if (e.tagName === 'ARTICLE' || e.id === 'main') break;
    }
    return false;
  }
  SML.autoTerms = function (rootEl, seen) {
    if (!re) build();
    if (!re) return;
    seen = seen || new Set();
    const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT);
    const nodes = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode()) if (/[A-Za-z]{3}/.test(n.nodeValue) && !skipEl(n.parentElement)) nodes.push(n);
    nodes.forEach((n) => {
      let text = n.nodeValue, guard = 0;
      const frag = document.createDocumentFragment();
      let changed = false;
      while (guard++ < 20) {
        const m = re.exec(text);
        if (!m) break;
        const word = m[2], k = SML.terms.key(word), t = byKey[k];
        const start = m.index + m[1].length, end = start + word.length;
        if (!t || seen.has(t)) {
          frag.appendChild(document.createTextNode(text.slice(0, end))); text = text.slice(end); changed = changed || false; continue;
        }
        seen.add(t);
        frag.appendChild(document.createTextNode(text.slice(0, start)));
        const b = document.createElement('button'); b.type = 'button'; b.className = 'term'; b.dataset.k = k; b.textContent = word;
        frag.appendChild(b);
        const around = (n.parentElement ? n.parentElement.textContent : '') ;
        if (t.zh && around.indexOf(t.zh) < 0) { const z = document.createElement('span'); z.className = 'zh-gloss'; z.textContent = '（' + t.zh + '）'; frag.appendChild(z); }
        text = text.slice(end); changed = true;
      }
      if (!changed) return;
      frag.appendChild(document.createTextNode(text));
      n.parentNode.replaceChild(frag, n);
    });
  };
})(window);
