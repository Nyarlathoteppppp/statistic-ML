/* Learning-science blocks used by chapters.
 *   { t:'story', title?, md }                       短小真实的历史背景（帮助记忆）
 *   { t:'think', q: md, a: md|[blocks] }            先想一想：先自己回答 / 预测，再点开（self-explanation, pretesting）
 *   { t:'fade', title, plan:[subgoal md], items:[ {md, steps:[ {md, sg} | {ask: md, answer: number, tol, show: md, sg} ]} ] }
 *        faded worked examples：第 1 题全写出，后面的题逐步把步骤留空让你填（worked-example fading）。
 *        plan = 通用步骤结构（subgoal labeling）；每步按 sg（1 起）标注，缺省时与 plan 从末尾对齐。 */
(function (root) {
  'use strict';
  const SML = root.SML;
  const R = SML.render.blocks;

  R.story = function (b, ctx) {
    return R.callout(Object.assign({ cls: 'story', title: b.title ? '小故事 · ' + b.title : '小故事' }, b), ctx);
  };

  R.think = function (b, ctx) {
    const { el, renderBlocks } = SML.render;
    const { md } = SML.md;
    const box = el('div', 'think');
    box.appendChild(el('div', 'think-q', '<span class="think-tag">先想一想</span>' + md(b.q)));
    const btn = el('button', 'btn', '想好了，看答案'); btn.type = 'button';
    const ans = el('div', 'think-a'); ans.hidden = true;
    btn.addEventListener('click', () => {
      if (!ans.firstChild) { if (Array.isArray(b.a)) ans.appendChild(renderBlocks(b.a, ctx)); else ans.innerHTML = md(b.a); }
      ans.hidden = !ans.hidden; btn.textContent = ans.hidden ? '想好了，看答案' : '收起';
    });
    box.append(btn, ans);
    return box;
  };

  R.fade = function (b, ctx) {
    const { el } = SML.render;
    const { md, inline } = SML.md;
    const wrap = el('div', 'fade');
    if (b.title) wrap.appendChild(el('div', 'fade-title', inline(b.title)));
    const plan = b.plan || [];
    const CIRC = '①②③④⑤⑥⑦⑧⑨';
    if (plan.length) wrap.appendChild(el('div', 'fade-plan', '<b>通用步骤</b>' + plan.map((p, i) => '<span class="sgc">' + CIRC[i] + ' ' + inline(p) + '</span>').join('<span class="arr">→</span>')));
    const tag = (s, k, n) => {
      if (!plan.length) return '';
      const i = s.sg != null ? s.sg - 1 : plan.length - n + k;
      return i >= 0 && i < plan.length ? '<span class="sgc small">' + CIRC[i] + ' ' + inline(plan[i]) + '</span> ' : '';
    };
    const LABEL = ['看懂：完整示范', '半独立：最后几步你来', '独立：全部你来'];
    b.items.forEach((it, k) => {
      const card = el('div', 'fade-item');
      card.appendChild(el('div', 'fade-head', '<span class="fade-n">' + (k + 1) + '</span>' + (it.label || LABEL[Math.min(k, 2)])));
      card.appendChild(el('div', 'fade-q', md(it.md)));
      const ol = el('ol', 'fade-steps');
      it.steps.forEach((s, k) => {
        const li = el('li');
        const lab = tag(s, k, it.steps.length);
        if (!s.ask) { li.innerHTML = lab + md(s.md); ol.appendChild(li); return; }
        li.className = 'ask';
        li.innerHTML = lab + md(s.ask);
        const row = el('div', 'qinput');
        const input = el('input'); input.type = 'text'; input.placeholder = '填数字或分数';
        const go = el('button', 'btn primary', '核对'); go.type = 'button';
        const peek = el('button', 'btn', '看这一步'); peek.type = 'button';
        const out = el('div', 'fade-out');
        row.append(input, go, peek);
        li.append(row, out);
        const reveal = (ok) => {
          out.innerHTML = (ok === true ? '<span class="qverdict right">✓ 对</span> ' : ok === false ? '<span class="qverdict wrong">✗ 再想想，或点"看这一步"</span> ' : '') +
            (ok !== false ? md(s.show || ('答案：' + s.answer)) : '');
        };
        const check = () => {
          const v = SML.quiz.parseNum(input.value);
          const tol = s.tol != null ? s.tol : (Number.isInteger(s.answer) ? 1e-6 : 1e-6 + Math.abs(s.answer) * 2e-3);
          reveal(Math.abs(v - s.answer) <= tol);
        };
        go.addEventListener('click', check);
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') check(); });
        peek.addEventListener('click', () => reveal(null));
        ol.appendChild(li);
      });
      card.appendChild(ol);
      wrap.appendChild(card);
    });
    return wrap;
  };
})(window);
