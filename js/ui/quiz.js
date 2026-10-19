/* Quiz (fixed questions) and Practice (random generators).
 * Quiz block: { t:'quiz', items:[ q ] } where q is one of
 *   { type:'mc',   q, options:[md], answer: index, explain }
 *   { type:'num',  q, answer: number, tol, unit, explain }
 *   { type:'set',  q, answer:[tokens], explain }            // e.g. support vectors "1,2,4" — order-free
 *   { type:'show', q, answer: md, explain }                 // self-check: reveal model answer
 *   any item may add qzh (题意, shown under the question) and azh (中文意思 of an English answer)
 * Practice block: { t:'practice', gen:'id', title, opts }; generator lives in SML.practice.generators[id]
 *   and returns { q: blocks, check: { type, answer, tol, options }, sol: blocks }. */
(function (root) {
  'use strict';
  const SML = root.SML;

  function seedRng(seed) {
    let s = seed >>> 0 || 1;
    return function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  }
  const normTokens = (s) => String(s).split(/[\s,，;、{}()\[\]]+/).filter(Boolean).map((x) => x.toLowerCase()).sort();

  function parseNum(s) {
    s = String(s).trim().replace(/\s+/g, '');
    const frac = s.match(/^(-?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);
    if (frac) return parseFloat(frac[1]) / parseFloat(frac[2]);
    const v = Number(s);
    return Number.isFinite(v) ? v : NaN;
  }

  /* Integer answers (counts, dimensions) must match exactly; decimals get a small relative tolerance. */
  const defaultTol = (ans, rel) => (Number.isInteger(ans) ? 1e-6 : 1e-6 + Math.abs(ans) * rel);

  /* Renders one question into `box`; calls onResult(correct) once answered. */
  function renderQuestion(box, q, ctx, onResult) {
    const { el, renderBlocks } = SML.render;
    const { md, inline } = SML.md;
    const qbody = el('div');
    if (Array.isArray(q.q)) qbody.appendChild(renderBlocks(q.q, ctx)); else qbody.innerHTML = md(q.q);
    box.appendChild(qbody);
    if (q.qzh) box.appendChild(el('div', 'qzh', md('题意：' + q.qzh)));
    const explain = el('div', 'qexplain'); explain.hidden = true;
    const showExplain = (verdict) => {
      explain.hidden = false;
      explain.innerHTML = '';
      if (verdict != null) explain.appendChild(el('div', 'qverdict ' + (verdict ? 'right' : 'wrong'), verdict ? '✓ 正确' : '✗ 不对'));
      const ansMd = q.answerText || ((q.type || (q.options ? 'mc' : 'show')) === 'show' && typeof q.answer === 'string' ? q.answer : null);
      if (ansMd) explain.appendChild(el('div', null, md('**答案：** ' + ansMd)));
      if (q.azh) explain.appendChild(el('div', 'azh', md('中文意思：' + q.azh)));
      if (Array.isArray(q.explain)) explain.appendChild(renderBlocks(q.explain, ctx));
      else if (q.explain) explain.appendChild(el('div', null, md(q.explain)));
    };
    const type = q.type || (q.options ? 'mc' : 'show');

    if (type === 'mc') {
      const opts = el('div', 'qopts');
      q.options.forEach((o, k) => {
        const btn = el('button', 'qopt', '<b>' + String.fromCharCode(65 + k) + '.</b> ' + inline(o)); btn.type = 'button';
        btn.addEventListener('click', () => {
          const correct = k === q.answer;
          opts.querySelectorAll('button').forEach((b2, j) => { b2.disabled = true; if (j === q.answer) b2.classList.add('right'); });
          if (!correct) btn.classList.add('wrong');
          showExplain(correct); onResult(correct);
        });
        opts.appendChild(btn);
      });
      box.appendChild(opts);
    } else if (type === 'num' || type === 'set' || type === 'text') {
      const row = el('div', 'qinput');
      const input = el('input'); input.type = 'text'; input.placeholder = type === 'set' ? '例如 1,2,4' : (type === 'num' ? '数字或分数，如 0.4 或 2/5' : '');
      const btn = el('button', 'btn primary', '提交'); btn.type = 'button';
      const reveal = el('button', 'btn', '看答案'); reveal.type = 'button';
      row.append(input, btn, reveal);
      if (q.unit) row.appendChild(el('span', 'muted', SML.md.inline(q.unit)));
      box.appendChild(row);
      const submit = () => {
        let correct;
        if (type === 'num') { const v = parseNum(input.value); correct = Math.abs(v - q.answer) <= (q.tol != null ? q.tol : defaultTol(q.answer, 1e-3)); }
        else if (type === 'set') correct = normTokens(input.value).join('|') === normTokens(q.answer.join ? q.answer.join(',') : q.answer).join('|');
        else correct = (q.accept || []).some((re) => new RegExp(re, 'i').test(input.value.trim()));
        showExplain(correct); onResult(correct);
      };
      btn.addEventListener('click', submit);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
      reveal.addEventListener('click', () => { showExplain(null); onResult(null); });
    } else {
      const reveal = el('button', 'btn', '显示参考答案'); reveal.type = 'button';
      reveal.addEventListener('click', () => { reveal.remove(); showExplain(null); onResult(null); });
      box.appendChild(reveal);
    }
    box.appendChild(explain);
  }

  function mountQuiz(b, ctx) {
    const { el } = SML.render;
    const wrap = el('div', 'quiz');
    b.items.forEach((q, k) => {
      const item = el('div', 'qitem');
      const qid = q.id || ('q' + (++ctx.qn));
      item.appendChild(el('div', 'qn', (b.label || '小测') + ' ' + (k + 1)));
      renderQuestion(item, q, ctx, (correct) => {
        if (correct === false) SML.store.addMistake({ page: ctx.page.id, qid: qid, title: ctx.page.title, q: typeof q.q === 'string' ? q.q.slice(0, 140) : '' });
        if (correct === true) SML.store.removeMistake(ctx.page.id, qid);
      });
      wrap.appendChild(item);
    });
    return wrap;
  }

  function mountPractice(b, ctx) {
    const { el, renderBlocks } = SML.render;
    const box = el('div', 'practice');
    const head = el('div', 'practice-head', '<span>🎲 ' + SML.md.inline(b.title || '随机练习') + '</span>');
    const again = el('button', 'btn', '换一题'); again.type = 'button';
    head.appendChild(again);
    const body = el('div', 'practice-body');
    box.append(head, body);
    const gen = SML.practice && SML.practice.generators[b.gen];
    let count = 0;
    function make() {
      body.innerHTML = '';
      if (!gen) { body.innerHTML = '<div class="pending-box">练习生成器 <code>' + b.gen + '</code> 建设中</div>'; return; }
      const seed = (Date.now() ^ (Math.random() * 1e9)) >>> 0;
      const item = gen(seedRng(seed), b.opts || {});
      count++;
      const q = Object.assign({ q: item.q, explain: item.sol, answerText: item.answerText }, item.check || { type: 'show' });
      renderQuestion(body, q, ctx, () => {});
      body.appendChild(el('div', 'small muted', '第 ' + count + ' 题 · seed ' + seed));
    }
    again.addEventListener('click', make);
    make();
    return box;
  }

  SML.quiz = { mountQuiz: mountQuiz, mountPractice: mountPractice, seedRng: seedRng, parseNum: parseNum };
  SML.practice = SML.practice || { generators: {} };
  SML.practice.register = function (id, fn) { SML.practice.generators[id] = fn; };
  SML.viz = SML.viz || (function () {
    const reg = {};
    return { register: (id, fn) => { reg[id] = fn; }, get: (id) => reg[id] };
  })();
})(window);
