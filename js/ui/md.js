/* Tiny Markdown subset + KaTeX.
 * Inline: **bold**, *italic*, `code`, [text](href), $inline math$, $$display math$$.
 * Block (md()): paragraphs separated by blank lines, "- " bullet lists, "1. " numbered lists.
 * Math and code are pulled out before HTML-escaping so their contents are never mangled. */
(function (root) {
  'use strict';

  const MACROS = {
    '\\R': '\\mathbb{R}',
    '\\bw': '\\mathbf{w}',
    '\\bx': '\\mathbf{x}',
    '\\by': '\\mathbf{y}',
    '\\bX': '\\mathbf{X}',
    '\\bv': '\\mathbf{v}',
    '\\bu': '\\mathbf{u}',
    '\\bz': '\\mathbf{z}',
    '\\argmax': '\\operatorname*{argmax}',
    '\\argmin': '\\operatorname*{argmin}',
    '\\indep': '\\perp\\!\\!\\!\\perp',
    '\\sgn': '\\operatorname{sgn}',
    '\\VC': '\\operatorname{VC}',
  };

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  const katexErrors = [];
  function tex(src, display) {
    if (!root.katex) return '<code>' + esc(src) + '</code>';
    try {
      return root.katex.renderToString(src, {
        displayMode: !!display, throwOnError: true, trust: true, strict: 'ignore', macros: Object.assign({}, MACROS),
      });
    } catch (e) {
      katexErrors.push({ src: src, message: e.message });
      if (root.console) root.console.warn('KaTeX:', e.message, '\n', src);
      return '<span class="katex-error" title="' + esc(e.message) + '" style="color:var(--bad)">' + esc(src) + '</span>';
    }
  }

  const TOKEN = /`([^`]+)`|\$\$([\s\S]+?)\$\$|\$((?:\\\$|[^$])+?)\$/g;

  /* Term pop-ups: [[shown text]] or [[shown text|glossary key]] (key matched case-insensitively). */
  const TERM = /\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]/g;
  const termKey = (k) => String(k).trim().toLowerCase().replace(/&amp;/g, '&');
  const termStore = {};
  const terms = {
    define(list) { (Array.isArray(list) ? list : [list]).forEach((t) => { [t.en].concat(t.alias || []).forEach((k) => { termStore[termKey(k)] = Object.assign(termStore[termKey(k)] || {}, t); }); }); },
    get(k) { return termStore[termKey(k)]; },
    all() { return termStore; },
    TERM: TERM, key: termKey,
  };

  function inline(src) {
    if (src == null) return '';
    const holes = [];
    const hold = (html) => '\u0000' + (holes.push(html) - 1) + '\u0000';
    let s = String(src).replace(TOKEN, (m, code, dmath, imath) => {
      if (code != null) return hold('<code>' + esc(code) + '</code>');
      if (dmath != null) return hold('<span class="math-block">' + tex(dmath, true) + '</span>');
      return hold(tex(imath, false));
    });
    s = esc(s)
      .replace(TERM, (m, text, key) => '<button type="button" class="term" data-k="' + esc(termKey(key || text)) + '">' + text + '</button>')
      .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*\s][^*]*?)\*(?!\*)/g, '$1<em>$2</em>')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, text, href) => '<a href="' + href + '">' + text + '</a>')
      .replace(/\n/g, '<br>');
    return s.replace(/\u0000(\d+)\u0000/g, (m, i) => holes[+i]);
  }

  function md(src) {
    if (src == null) return '';
    const blocks = String(src).trim().split(/\n\s*\n/);
    return blocks.map((b) => {
      const lines = b.split('\n');
      if (lines.every((l) => /^\s*[-•]\s+/.test(l))) {
        return '<ul>' + lines.map((l) => '<li>' + inline(l.replace(/^\s*[-•]\s+/, '')) + '</li>').join('') + '</ul>';
      }
      if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l))) {
        return '<ol>' + lines.map((l) => '<li>' + inline(l.replace(/^\s*\d+[.)]\s+/, '')) + '</li>').join('') + '</ol>';
      }
      if (/^\$\$[\s\S]+\$\$$/.test(b.trim())) return inline(b.trim());
      return '<p>' + inline(b) + '</p>';
    }).join('');
  }

  root.SML = root.SML || {};
  root.SML.md = { md: md, inline: inline, tex: tex, esc: esc, errors: katexErrors, MACROS: MACROS };
  root.SML.terms = terms;
})(typeof window !== 'undefined' ? window : globalThis);
