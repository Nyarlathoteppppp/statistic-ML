/* Weekly review page builder (v2). One page per week, placed after that week's chapters.
 *
 *   SML.review({
 *     id: 'r01', week: 'W1', title, summary,
 *     keypoints: [[md, chapterId]],          // 1 一页总结
 *     map: md | [blocks],                     // 2 概念之间怎么连起来
 *     recall: [{ q: md, a: md|[blocks], ch }],// 3 主动回忆卡（先想再翻）
 *     formulas: [[md formula, md meaning, src]], // 4 必背公式
 *     exam: [[how it is asked, where, link]],  // 5 考试怎么考
 *     quiz: [items],                          // 6 综合自测
 *     next: md                                // 7 下一步
 *   })
 * Recall card state ("会了 / 再看") is stored per viewer in localStorage. */
(function (root) {
  'use strict';
  const SML = root.SML;
  const asBlocks = (x) => (x == null ? [] : Array.isArray(x) ? x : [x]);

  SML.review = function (r) {
    const B = [];
    const S = [];
    const sec = (id, label) => { S.push([id, label]); B.push({ t: 'h2', id: id, text: S.length + ' · ' + label }); };
    B.push({ t: 'reviewHead', week: r.week, chapters: (r.keypoints || []).map((k) => k[1]).filter((v, i, a) => v && a.indexOf(v) === i), sections: S });
    if (r.keypoints) {
      sec('summary', '一页总结');
      B.push({ t: 'kp', items: r.keypoints });
    }
    if (r.map) { sec('map', '概念之间怎么连起来'); asBlocks(r.map).forEach((b) => B.push(b)); }
    if (r.recall) {
      sec('recall', '主动回忆卡');
      B.push({ t: 'note', title: '怎么用', md: '先**盖住答案自己说一遍**（最好用英文关键词），再点开对照。答出来点"会了"，没答全点"再看"。只看"再看"的卡反复刷，直到全部变绿。' });
      B.push({ t: 'recall', id: r.id, items: r.recall });
    }
    if (r.formulas) {
      sec('formulas', '必背公式');
      B.push({ t: 'table', head: ['公式', '含义 / 什么时候用', '出处'], rows: r.formulas });
    }
    if (r.exam) {
      sec('exam', '考试怎么考');
      B.push({ t: 'table', head: ['考法', '往年 / 来源', '去练'], rows: r.exam });
    }
    if (r.quiz) { sec('quiz', '综合自测'); B.push({ t: 'quiz', label: '综合', items: r.quiz }); }
    if (r.next) { sec('next', '下一步'); B.push(r.next); }
    B.push({ t: 'notes', id: r.id });
    return { id: r.id, eyebrow: r.week + ' · 本周复习', title: r.title, en: r.en, lead: r.summary, blocks: B };
  };

  const R = SML.render.blocks;

  R.reviewHead = function (b) {
    const { el } = SML.render;
    const box = el('div', 'chapter-head');
    const prog = SML.store.progress();
    const read = b.chapters.filter((c) => prog[c] && (prog[c].read || prog[c].done)).length;
    let h = '<div class="ch-badges"><span class="badge key">本周复习</span><span class="badge">本周章节已读 ' + read + ' / ' + b.chapters.length + '</span></div>';
    h += '<p class="small muted" style="margin:0 0 8px">建议：学完本周所有章节后做一遍；考前一周再刷一遍"主动回忆卡"和"综合自测"。</p>';
    h += '<nav class="ch-nav">' + b.sections.map((s, i) => '<a href="#' + SML.app.routeOf(SML.app.current()) + '/' + s[0] + '"><span>' + (i + 1) + '</span>' + s[1] + '</a>').join('') + '</nav>';
    box.innerHTML = h;
    return box;
  };

  R.kp = function (b) {
    const { inline, esc } = SML.md;
    return SML.render.el('ol', 'kp', b.items.map((k) => '<li>' + inline(k[0]) + (k[1] ? ' <a class="chip" href="#/' + k[1] + '">' + esc(SML.app.metaOf(k[1]).tag ? '第 ' + SML.app.metaOf(k[1]).tag + ' 章' : k[1]) + '</a>' : '') + '</li>').join(''));
  };

  /* ---- spaced repetition (Leitner boxes). state: { 'r01#3': { box, due } } ---- */
  const DAY = 864e5;
  const GAPS = [0, 1, 3, 7, 14, 30]; // days until next review for box 0..5
  const srs = {
    all() { return SML.store.get('srs', {}); },
    get(k) { return srs.all()[k]; },
    grade(k, ok) {
      const st = srs.all();
      const cur = st[k] || { box: 0 };
      const box = ok ? Math.min(5, cur.box + 1) : 0;
      st[k] = { box: box, due: Date.now() + (ok ? GAPS[box] * DAY : 0), seen: Date.now() };
      SML.store.set('srs', st);
      return st[k];
    },
    reset(prefix) { const st = srs.all(); Object.keys(st).forEach((k) => { if (k.indexOf(prefix) === 0) delete st[k]; }); SML.store.set('srs', st); },
    cls(k) { const s = srs.get(k); return !s ? '' : s.box > 0 ? 'known' : 'again'; },
    due(k) { const s = srs.get(k); return !!s && s.due <= Date.now(); },
  };
  SML.srs = srs;

  /* One flip card. it = { q, a, ch }, k = storage key. */
  function card(it, k, ctx, onGrade) {
    const { el, renderBlocks } = SML.render;
    const { md } = SML.md;
    const box = el('div', 'rcard ' + srs.cls(k));
    const q = el('div', 'rq'); q.appendChild(el('div', null, md(it.q)));
    const a = el('div', 'ra'); a.hidden = true;
    let built = false;
    const open = (v) => {
      if (!built) {
        built = true;
        if (Array.isArray(it.a)) a.appendChild(renderBlocks(it.a, ctx)); else a.appendChild(el('div', null, md(it.a)));
        const row = el('div', 'rbtn');
        const yes = el('button', 'btn', '✓ 会了'); yes.type = 'button';
        const no = el('button', 'btn', '再看'); no.type = 'button';
        const info = el('span', 'small muted');
        const show = () => { const s = srs.get(k); info.textContent = s ? (s.box ? '下次复习：' + GAPS[s.box] + ' 天后' : '今天再来一次') : ''; };
        yes.addEventListener('click', () => { srs.grade(k, true); box.className = 'rcard known'; show(); onGrade && onGrade(true); });
        no.addEventListener('click', () => { srs.grade(k, false); box.className = 'rcard again'; show(); onGrade && onGrade(false); });
        row.append(yes, no, info);
        if (it.ch) { const l = el('a', 'rlink', '回到第 ' + (SML.app.metaOf(it.ch).tag || it.ch) + ' 章 →'); l.href = '#/' + it.ch; row.appendChild(l); }
        a.appendChild(row); show();
      }
      a.hidden = v === undefined ? !a.hidden : !v;
    };
    q.addEventListener('click', () => open());
    box.append(q, a);
    return { box: box, open: open, k: k };
  }

  R.recall = function (b, ctx) {
    const { el } = SML.render;
    const wrap = el('div', 'recall');
    const bar = el('div', 'recall-bar');
    const onlyAgain = el('button', 'btn', '隐藏"会了"'); onlyAgain.type = 'button';
    const showAll = el('button', 'btn', '全部翻开'); showAll.type = 'button';
    const reset = el('button', 'btn', '重置本页'); reset.type = 'button';
    const count = el('span', 'muted small');
    bar.append(onlyAgain, showAll, reset, count);
    wrap.appendChild(bar);
    let filter = false;
    const cards = b.items.map((it, i) => card(it, b.id + '#' + i, ctx, paint));
    cards.forEach((c) => wrap.appendChild(c.box));
    function paint() {
      count.textContent = '会了 ' + cards.filter((c) => srs.cls(c.k) === 'known').length + ' / ' + cards.length;
      cards.forEach((c) => { c.box.hidden = filter && srs.cls(c.k) === 'known'; });
    }
    onlyAgain.addEventListener('click', () => { filter = !filter; onlyAgain.textContent = filter ? '显示全部' : '隐藏"会了"'; paint(); });
    let allOpen = false;
    showAll.addEventListener('click', () => { allOpen = !allOpen; cards.forEach((c) => c.open(allOpen)); showAll.textContent = allOpen ? '全部合上' : '全部翻开'; });
    reset.addEventListener('click', () => { srs.reset(b.id + '#'); cards.forEach((c) => { c.box.className = 'rcard'; }); paint(); });
    paint();
    return wrap;
  };

  /* Daily deck: due cards from every week + up to 15 new cards from weeks whose review page was opened. Shuffled (interleaving). */
  R.daily = function (b, ctx) {
    const { el } = SML.render;
    const wrap = el('div', 'recall');
    const prog = SML.store.progress();
    const pool = [];
    Object.values(SML.content.all()).forEach((p) => (p.blocks || []).forEach((blk) => {
      if (blk.t !== 'recall') return;
      blk.items.forEach((it, i) => pool.push({ it: it, k: blk.id + '#' + i, week: p.id, opened: !!(prog[p.id] && prog[p.id].read) }));
    }));
    const due = pool.filter((c) => srs.due(c.k));
    const fresh = pool.filter((c) => !srs.get(c.k) && c.opened).slice(0, 15);
    const deck = due.concat(fresh);
    for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = deck[i]; deck[i] = deck[j]; deck[j] = t; }
    const learned = pool.filter((c) => srs.cls(c.k) === 'known').length;
    const head = el('div', 'recall-bar', '<span>今天：到期 <b>' + due.length + '</b> 张，新卡 <b>' + fresh.length + '</b> 张</span><span class="muted small">全部 ' + pool.length + ' 张，已进入长期记忆 ' + learned + ' 张</span>');
    wrap.appendChild(head);
    if (!deck.length) {
      wrap.appendChild(el('div', 'pending-box', pool.length ? '今天没有要复习的卡。新卡来自你**打开过的**"本周复习"页——学完一周后去打开那一页，卡片就会进入这里。' : '还没有回忆卡。'));
      return wrap;
    }
    let left = deck.length;
    const remain = el('div', 'small muted', '');
    const upd = () => { remain.textContent = '还剩 ' + left + ' 张没打分'; };
    deck.forEach((c) => {
      let graded = false;
      const cc = card({ q: c.it.q + '　*（' + (SML.app.metaOf(c.week).tag || '') + '）*', a: c.it.a, ch: c.it.ch }, c.k, ctx, () => { if (!graded) { graded = true; left--; upd(); } });
      wrap.appendChild(cc.box);
    });
    wrap.appendChild(remain); upd();
    return wrap;
  };

  SML.content.add({
    id: 'daily', title: '今日复习', en: 'Spaced retrieval practice',
    lead: '把各周"本周复习"里的回忆卡按**间隔重复**排程：答对的卡隔 1 → 3 → 7 → 14 → 30 天再出现，答错的今天再来。不同周的卡混在一起出（interleaving）。每天 10–15 分钟，比重读讲义有效得多。',
    blocks: [{ t: 'daily' }],
  });
})(window);
