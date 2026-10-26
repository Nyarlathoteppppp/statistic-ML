/* Printable outline (精简复习版): { t:'outline' } builds the paper handout from the site's own data, in the layout of the
 * COMP90054 compact edition: a cover (exam facts, badge legend, course storyline), then ONE continuous two-column flow:
 *   1. 公式脉络 Formula storyline (SML.formulaChain, data/formula-chain.js),
 *   2. 必会题型 (SML.mustKnow / SML.mustAnswers, data/must.js) with the past papers each type came from (T-page past blocks),
 *   3. per week: week head + storyline (b.storyline), then each ★★/★★★ chapter (★ chapters are only named in one line): head with badges (star, 必会 · 2026 Qx, 原题 n, Quiz),
 *      every formula on its own line with an English name (b.fxEn / b.fxWhat; folded not-examinable parts skipped),
 *      □ English key points with their Chinese line (keyEn / keyZh), past concept questions and Canvas quiz questions
 *      (English Q/A + the question's Chinese meaning); a dashed note box closes each week.
 * Wide display formulas are shrunk to the column. Explanations stay on the site. Print with the browser (A4). */
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

  // first n characters of a question, cut at a word boundary and never inside $…$ (an unclosed formula would print as raw LaTeX)
  function clip(q, n) {
    if (q.length <= n) return q;
    let c = q.slice(0, n).replace(/\s+\S*$/, '');
    if ((c.match(/\$/g) || []).length % 2) c = c.slice(0, c.lastIndexOf('$')).replace(/\s+$/, '');
    return c + ' …';
  }

  // compare formulas by their content: no \htmlClass wrappers, spacing or bracket-size commands, braces or whitespace
  const norm = (t) => String(t || '').replace(/\\htmlClass\{[^}]*\}/g, '').replace(/\\(?:,|;|!|quad|qquad| )/g, '')
    .replace(/\\(?:[bB]igg?|left|right)(?![a-zA-Z])/g, '').replace(/\\[td]frac/g, '\\frac').replace(/[{}\s$]/g, '');

  // every formula of a page in reading order: fx cards first, then math blocks, skipping folded not-examinable parts.
  // A formula under a generic section heading ("1 · 它是什么", "4 · 数学定义") gets the key 'cNN:k' (its k-th one) so it can be named per chapter.
  function formulas(page) {
    const out = [], seen = new Set();
    let what = 0;
    const add = (label, t) => {
      const k = t.replace(/\\htmlClass\{[^}]*\}/g, '').replace(/\s+/g, '');
      if (seen.has(k)) return;
      seen.add(k);
      const l = noRef(label);
      out.push({ label: /^\d+ · /.test(l) ? page.id + ':' + (++what) : l, tex: t });
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
    // drop a formula that repeats another (same after normalising) or is contained in a longer one
    const ns = out.map((x) => norm(x.tex));
    return out.filter((x, i) => !ns.some((n, j) => j !== i && n.indexOf(ns[i]) >= 0 && (n.length > ns[i].length || j < i)));
  }

  // src labels of every past block on a page (nested ones too), in page order, without duplicates
  function pastSrcs(page) {
    const out = [];
    const walk = (b) => {
      if (!b || typeof b !== 'object') return;
      if (Array.isArray(b)) { b.forEach(walk); return; }
      if (b.t === 'past' && b.src) { const s = String(b.src).replace(/（.*$/, '').trim(); if (out.indexOf(s) < 0) out.push(s); }
      ['blocks', 'sol'].forEach((k) => { if (Array.isArray(b[k])) walk(b[k]); });
    };
    walk(page.blocks);
    return out;
  }

  /** Shrink display formulas that are wider than their column (sizes are em-based, so this also fits the A4 page). */
  function fitFormulas(scope) {
    scope.querySelectorAll('.pc-tex .katex-display').forEach((k) => {
      k.style.fontSize = '';
      const parent = parseFloat(getComputedStyle(k.parentElement).fontSize);
      for (let pass = 0; pass < 2 && k.scrollWidth > k.clientWidth + 1; pass++) {
        const cur = parseFloat(getComputedStyle(k).fontSize);
        k.style.fontSize = Math.max(0.45, cur * 0.97 * k.clientWidth / k.scrollWidth / parent).toFixed(3) + 'em';
      }
    });
  }

  R.outline = function (b) {
    const { el } = SML.render;
    const { md, inline, tex } = SML.md;
    const pages = SML.content.all();
    const meta = SML.catalog.meta;
    const fxEn = b.fxEn || {};
    const fxWhat = b.fxWhat || {};
    const must = SML.mustKnow || [];
    const mustByPage = {};
    must.forEach((m) => { mustByPage[m.page] = m; });
    const course = SML.catalog.zones.find((z) => z.id === 'course');
    const story = b.storyline || [];

    const wrap = el('div', 'outline pc');
    const bar = el('div', 'ol-bar noprint');
    const btn = el('button', 'btn primary', '打印 / 存成 PDF'); btn.type = 'button';
    btn.addEventListener('click', () => root.print());
    bar.append(btn, el('span', 'muted small', '纸张选 A4、纵向，缩放用默认（适合页面宽度）。公式、要点、原题都已印好；每周末尾有笔记框。'));
    wrap.appendChild(bar);

    const pill = (cls, text) => '<span class="pc-pill ' + cls + '">' + text + '</span>';
    const STAR = { 3: pill('hot', '★★★ 必考'), 2: pill('key', '★★ 重点'), 1: pill('low', '★ 了解') };

    // ---- cover ----
    const cover = el('section', 'pc-cover');
    cover.innerHTML = '<h1>COMP90051 Statistical Machine Learning · 精简复习版</h1>' +
      md('公式脉络 → 必会题型 → 按周排列的每一章：全部公式（英文名）、英文要点（下一行是中文意思）、往年原题和 Canvas 小测原题。考试要写的词用英文；每周末尾留了笔记框。章号与网站目录一致（`#/c23` 就是网站第 23 章）。') +
      '<p class="pc-legend">' + pill('new', '必会 · 2026 Q3') + '= 2026 practice 卷（今年老师出的）的题型，最优先 · ' + pill('hot', '★★★ 必考') +
      pill('key', '★★ 重点') + pill('low', '★ 了解') + '= 按 7 份往年卷的出现次数 · ' + pill('src', '原题 n') + '= 本章有 n 道往年简答原题 · ' + pill('src', 'Quiz') + '= Canvas 小测考过</p>' +
      md('**Exam** Fri 6 Nov 16:30, Royal Exhibition Building West · 15 min reading + 120 min writing · closed book, no calculator, complex formulas are given · lectures, workshops and quizzes are all examinable.');
    const flowLine = el('div', 'pc-chain');
    flowLine.innerHTML = course.units.map((u, i) => {
      const chs = u.items.filter((id) => /^c\d+/.test(id));
      const label = story[i] ? story[i][0].replace(/（.*?）/g, '') : u.title;
      return (i ? '<span class="pc-arrow">→</span>' : '') + '<span class="pc-chip">' + inline(label) + '<small>' + (meta[chs[0]].tag) + '–' + (meta[chs[chs.length - 1]].tag) + '</small></span>';
    }).join('');
    cover.appendChild(flowLine);
    wrap.appendChild(cover);

    const flow = el('div', 'pc-flow');

    // ---- 1. formula storyline ----
    const chain = SML.formulaChain || [];
    const chainSet = new Set(chain.reduce((a, st) => a.concat(st.steps.map((x) => norm(x.tex))), []));
    if (chain.length) {
      flow.appendChild(el('h2', 'pc-h2', '公式脉络 Formula storyline'));
      chain.forEach((st) => {
        flow.appendChild(el('h3', 'pc-h3', inline(st.title)));
        st.steps.forEach((s, i) => {
          const d = el('div', 'pc-fstep');
          d.innerHTML = '<div class="pc-fhead"><b>' + (i + 1) + '. ' + inline(s.name) + '</b><span class="pc-chref">' + (meta[s.ch] ? meta[s.ch].tag + ' ' + inline(meta[s.ch].title) : s.ch) + '</span></div>' +
            '<div class="pc-tex">' + tex(s.tex, true) + '</div>' + (s.how ? '<div class="pc-short">' + inline(s.how) + '</div>' : '');
          flow.appendChild(d);
        });
      });
    }

    // ---- 2. must-know types ----
    if (must.length) {
      flow.appendChild(el('h2', 'pc-h2', '必会题型：8 类送分题'));
      flow.appendChild(el('div', 'pc-sub', '2026 practice 卷的每一道题都属于下面这几类，往年也几乎每份都有。先保住这些分；网站 #/must 有练习入口。'));
      must.forEach((m) => {
        const d = el('div', 'pc-must');
        const srcs = pages[m.page] ? pastSrcs(pages[m.page]) : [];
        d.innerHTML = '<div class="pc-mhead"><b>' + m.n + ' ' + inline(m.title) + '</b>' + pill('new', '2026 ' + m.q) + pill('hot', m.freq) + '</div>' +
          '<div class="pc-look">' + inline(m.look) + '</div>' +
          '<ol class="pc-steps">' + m.steps.map((s) => '<li>' + inline(s) + '</li>').join('') + '</ol>' +
          (m.note ? '<div class="pc-look">' + inline(m.note) + '</div>' : '') +
          (srcs.length ? '<div class="pc-papers">原题：' + srcs.slice(0, 5).map((s) => SML.md.esc(s)).join('、') + (srcs.length > 5 ? ' 等 ' + srcs.length + ' 道' : '') + '（' + meta[m.page].tag + ' 页）</div>' : '');
        flow.appendChild(d);
      });
      const sa = el('div', 'pc-must');
      const picks = (SML.mustAnswers || []).map(([id, src]) => {
        const p = pages[id];
        const e = p && (p.examQ || []).find((x) => String(x.src || '').indexOf(src) === 0);
        return e ? '<li><span class="pc-qsrc">' + SML.md.esc(e.src) + '</span> ' + inline(clip(e.q, 60)) + ' <span class="pc-chref">→ 第 ' + meta[id].tag + ' 章</span></li>' : '';
      }).join('');
      sa.innerHTML = '<div class="pc-mhead"><b>⑧ Section A 必背简答</b>' + pill('new', '2026 Q1(a)(b) · 4 分') + pill('hot', 'Bayesian 概念 7/7') + '</div>' +
        '<div class="pc-look">这 10 道最常考；英文答案印在所标的那一章的原题里，背下来。</div><ul class="pc-qa">' + picks + '</ul>';
      flow.appendChild(sa);
    }

    // ---- 3. weeks ----
    course.units.forEach((u, wi) => {
      const st = story[wi];
      const wh = el('div', 'pc-weekhead', '<b>' + inline(st ? st[0] : u.title) + '</b>');
      flow.appendChild(wh);
      if (st) flow.appendChild(el('div', 'pc-story', inline(st[1])));
      const ids = u.items.filter((id) => /^c\d+/.test(id));
      // ★ (了解) chapters — never in the 7 past papers — are not printed; one line at the end of the week names them
      const light = ids.filter((id) => meta[id].star === 1);
      ids.filter((id) => meta[id].star !== 1).forEach((id) => {
        const p = pages[id];
        if (!p) return;
        const head = (p.blocks || []).find((x) => x && x.t === 'chapterHead') || {};
        const ch = el('div', 'pc-ch');
        const m = (head.types || []).map((t) => mustByPage[t]).find(Boolean);
        const quiz = [];
        sectionBlocks(p, 'quiz').filter((x) => x && x.t === 'quiz').forEach((qb) => (qb.items || []).forEach((it) => { if (/平时小测原题/.test(it.q || '')) quiz.push(it); }));
        const badges = [STAR[meta[id].star] || '', m ? pill('new', '必会 · 2026 ' + m.q.replace(/ · .*/, '')) : '',
          (p.examQ || []).length ? pill('src', '原题 ' + p.examQ.length) : '', quiz.length ? pill('src', 'Quiz') : ''].join('');
        let html = '<div class="pc-head"><span class="pc-num">' + (meta[id].tag || id) + '</span><b>' + inline(p.title) + '</b>' +
          (p.en ? '<span class="pc-en">' + inline(p.en) + '</span>' : '') + badges + '</div>';
        // formulas grouped by English name; each formula on its own line. Skip what is already printed in full:
        // a step of the formula storyline, or a formula written out inside one of this chapter's English key points.
        const keyText = (p.keyEn || []).map(norm).join('|');
        const groups = new Map();
        formulas(p).filter((x) => { const n = norm(x.tex); return !chainSet.has(n) && !(n.length > 8 && keyText.indexOf(n) >= 0); }).forEach((x) => {
          const name = fxWhat[x.label] || fxEn[x.label] || x.label;
          if (!groups.has(name)) groups.set(name, []);
          groups.get(name).push(x.tex);
        });
        [...groups].forEach(([name, ts]) => {
          html += '<div class="pc-formula"><div class="pc-fname">' + inline(name) + '</div>' + ts.map((t) => '<div class="pc-tex">' + tex(t, true) + '</div>').join('') + '</div>';
        });
        if (p.keyEn && p.keyEn.length) {
          html += '<ul class="pc-points">' + p.keyEn.map((k, i) => '<li>' + inline(k) + (p.keyZh && p.keyZh[i] ? '<div class="pc-zh">' + inline(p.keyZh[i]) + '</div>' : '') + '</li>').join('') + '</ul>';
        }
        const qa = [];
        (p.examQ || []).forEach((e) => qa.push('<li><span class="pc-qsrc">' + SML.md.esc(e.src || '原题') + '</span> <b>Q.</b> ' + inline(e.q) +
          (e.qzh ? '<div class="pc-zh">' + inline(e.qzh) + '</div>' : '') + ' <b>A.</b> ' + inline(e.a) + '</li>'));
        // a quiz question may be [text, {t:'table'}, {t:'graph'}, …]: text inline, tables as a small grid, graphs as their edge list
        const qText = (q) => (Array.isArray(q) ? q : [q]).map((x) => typeof x === 'string' ? inline(x.replace(/（平时小测原题）\s*/, ''))
          : x && x.t === 'graph' ? '（图的边：' + x.edges.split(/\s+/).filter(Boolean).map((e) => e.split(/[=:]/)[0].replace('>', '→').replace('-', '–')).join('，') + '）'
          : x && x.t === 'table' ? '<table class="pc-mini">' + (x.head ? '<tr>' + x.head.map((h) => '<th>' + inline(h) + '</th>').join('') + '</tr>' : '') +
            x.rows.map((r) => '<tr>' + r.map((c) => '<td>' + inline(String(c)) + '</td>').join('') + '</tr>').join('') + '</table>' : '').join(' ');
        quiz.forEach((it) => {
          const ans = it.type === 'mc' ? (it.options || [])[it.answer] : Array.isArray(it.answer) ? it.answer.join('、')
            : (it.answerText || (it.answer != null ? String(it.answer) : ''));
          qa.push('<li><span class="pc-qsrc">Quiz</span> <b>Q.</b> ' + qText(it.q) +
            (it.qzh ? '<div class="pc-zh">' + inline(it.qzh) + '</div>' : '') + ' <b>A.</b> ' + inline(ans || '') + '</li>');
        });
        if (qa.length) html += '<ul class="pc-qa">' + qa.join('') + '</ul>';
        ch.innerHTML = html;
        flow.appendChild(ch);
      });
      if (light.length) flow.appendChild(el('div', 'pc-light', '★ 了解（往年卷没考过，只在网站）：' + light.map((id) => meta[id].tag + ' ' + inline(meta[id].title)).join('；')));
      flow.appendChild(el('div', 'pc-notes', (st ? st[0].split(' ')[0] : u.title) + ' 笔记'));
    });

    wrap.appendChild(flow);
    // shrink over-wide formulas once laid out (fonts and columns settle late), and again right before printing
    const fit = () => { if (wrap.isConnected) fitFormulas(wrap); };
    [0, 300, 1200, 2500].forEach((t) => setTimeout(fit, t));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    root.addEventListener('beforeprint', fit);
    return wrap;
  };
})(window);
