/* W10 chapter visualisation (L19): Beta prior + coin flips → Beta posterior (Beta–Binomial conjugacy). */
(function (root) {
  'use strict';
  const SML = root.SML;
  const P = () => SML.plot;
  const f3 = (v) => (Number.isFinite(v) ? String(+v.toFixed(3)) : '—');
  function node(tag, cls, html) { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function btn(text, fn, cls) { const b = node('button', cls || 'btn', text); b.type = 'button'; b.addEventListener('click', fn); return b; }
  function shell(el, title) {
    const s = node('div', 'solver'), h = node('div', 'solver-head');
    const tools = node('div', 'tools'), body = node('div', 'solver-body'), out = node('div', 'solver-out');
    h.append(node('span', 'title', title), tools); s.append(h, body, out); el.appendChild(s);
    return { tools: tools, body: body, out: out };
  }
  function row(parent) { const r = node('div', 'row'); parent.appendChild(r); return r; }
  function readout(pairs) { const { inline } = SML.md; return '<div class="readout">' + pairs.map((p) => '<div><span>' + inline(p[0]) + '</span><b>' + inline(String(p[1])) + '</b></div>').join('') + '</div>'; }
  const md = (s) => SML.md.md(s);

  /* log Γ(x) by the Lanczos approximation (g = 7), accurate to ~1e-13 for x > 0. */
  const LG = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  function logGamma(x) {
    if (x < 0.5) return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) - logGamma(1 - x);
    x -= 1; let a = LG[0]; const t = x + 7.5;
    for (let i = 1; i < 9; i++) a += LG[i] / (x + i);
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
  }
  /* Beta density including the endpoint limits: 0 if the exponent is positive, the normaliser if it is 0, +∞ if negative. */
  function betaPdf(q, a, b) {
    const logC = logGamma(a + b) - logGamma(a) - logGamma(b);
    if (q <= 0) return a > 1 ? 0 : a === 1 ? Math.exp(logC + (b - 1) * Math.log(1)) : Infinity;
    if (q >= 1) return b > 1 ? 0 : b === 1 ? Math.exp(logC) : Infinity;
    return Math.exp(logC + (a - 1) * Math.log(q) + (b - 1) * Math.log(1 - q));
  }
  /* Mode of Beta(a, b), covering the boundary cases. */
  function betaMode(a, b) {
    if (a > 1 && b > 1) return f3((a - 1) / (a + b - 2));
    if (a === 1 && b === 1) return '均匀分布：每个 q 都是众数';
    if (a < 1 && b < 1) return '两端（0 和 1）密度都趋于无穷';
    if (a <= 1 && b >= 1) return '0（左端点）';
    return '1（右端点）';
  }

  /* ---------------- c51 · Beta–Binomial update ---------------- */
  SML.viz.register('beta-coins', function (el, opts) {
    opts = opts || {};
    const ui = shell(el, 'Beta 先验 × 抛硬币 → Beta 后验');
    const r1 = row(ui.body);
    const alpha = P().slider(r1, 'α（先验的"假想正面"）', { min: 0.5, max: 10, step: 0.5, value: opts.alpha || 1 }, draw);
    const beta = P().slider(r1, 'β（先验的"假想反面"）', { min: 0.5, max: 10, step: 0.5, value: opts.beta || 1 }, draw);
    let k = opts.k || 0, n = opts.n || 0;
    ui.tools.append(
      btn('+ 正面', () => { k++; n++; draw(); }, 'btn primary'),
      btn('+ 反面', () => { n++; draw(); }),
      btn('+10 次（7 正 3 反）', () => { k += 7; n += 10; draw(); }),
      btn('日出问题', () => { alpha.set(1); beta.set(1); k = 365; n = 365; draw(); }),
      btn('清空数据', () => { k = 0; n = 0; draw(); })
    );
    const box = node('div'); ui.body.appendChild(box);
    function draw() {
      const a = +alpha.value, b = +beta.value, a2 = k + a, b2 = n - k + b;
      // Dense grid with the endpoints, so sharply peaked posteriors (e.g. the sunrise Beta(366,1)) keep their true height.
      const grid = []; for (let i = 0; i <= 2000; i++) grid.push(i / 2000);
      const prior = grid.map((q) => [q, betaPdf(q, a, b)]), post = grid.map((q) => [q, betaPdf(q, a2, b2)]);
      const finite = post.concat(prior).map((p) => p[1]).filter(Number.isFinite);
      const infinite = finite.length < post.length + prior.length;
      // Divergent endpoints (a parameter below 1) get a capped axis; finite peaks are always shown in full.
      const ymax = infinite ? Math.max(2.5, Math.min(Math.max(...finite) * 1.1, 8)) : Math.max(2.5, Math.max(...finite) * 1.1);
      const clip = (pts) => pts.map((p) => [p[0], Number.isFinite(p[1]) ? p[1] : ymax * 2]);
      box.innerHTML = '';
      const pl = P().frame(box, { w: 540, h: 270, x: [0, 1], y: [0, ymax], xlabel: 'q = P(正面)', ylabel: '概率密度' });
      pl.path(clip(prior), 'curve prior'); pl.path(clip(post), 'curve post');
      const mean = a2 / (a2 + b2);
      const anchorAt = (x) => (x > 0.8 ? 'end' : x < 0.2 ? 'start' : 'middle');
      pl.line(mean, 0, mean, ymax, 'ref g'); pl.text(mean, ymax * 0.94, 'E[q]=' + f3(mean) + ' ', 'note g', anchorAt(mean));
      if (n > 0) { const mle = k / n; pl.line(mle, 0, mle, ymax * 0.8, 'ref'); pl.text(mle, ymax * 0.84, 'k/n=' + f3(mle) + ' ', 'note', anchorAt(mle)); }
      box.appendChild(node('div', 'legend', '<span style="--c:var(--muted)">先验 Beta(α, β)</span><span style="--c:var(--good)">后验 Beta(k+α, n−k+β)</span>'));
      const mode = betaMode(a2, b2);
      ui.out.innerHTML = md('数据：$n=' + n + '$ 次，正面 $k=' + k + '$ 次。后验 $=\\mathrm{Beta}(k+\\alpha,\\ n-k+\\beta)=\\mathrm{Beta}(' + f3(a2) + ',\\ ' + f3(b2) + ')$：先验参数加上计数就行（L19 p13）。') +
        readout([
          ['先验均值 $\\alpha/(\\alpha+\\beta)$', f3(a / (a + b))],
          ['后验均值 $(k+\\alpha)/(n+\\alpha+\\beta)$', f3(mean)],
          ['MLE $k/n$', n ? f3(k / n) : '无数据'],
          ['后验众数（MAP；两个参数都 > 1 时 $=\\frac{k+\\alpha-1}{n+\\alpha+\\beta-2}$）', mode],
        ]);
    }
    draw();
  });

  /* ---------------- c51 · Beta densities for several (α, β)（L19 p12） ---------------- */
  SML.viz.register('beta-shapes', function (el) {
    const ui = shell(el, 'Beta(α, β) 长什么样（L19 p12 的几组参数）');
    const sets = [[1, 1, 'var(--muted)'], [2, 2, 'var(--accent)'], [5, 1, 'var(--good)'], [2, 5, 'var(--warn)'], [0.5, 0.5, 'var(--bad)']];
    const box = node('div'); ui.body.appendChild(box);
    const pl = P().frame(box, { w: 540, h: 260, x: [0, 1], y: [0, 3.2], xlabel: 'q', ylabel: '概率密度' });
    sets.forEach(([a, b, c]) => {
      const pts = []; for (let i = 1; i < 400; i++) { const q = i / 400; pts.push([q, Math.min(betaPdf(q, a, b), 6.4)]); }
      const path = pl.path(pts, 'curve'); if (path && path.style) path.style.stroke = c;
    });
    box.appendChild(node('div', 'legend', sets.map(([a, b, c]) => '<span style="--c:' + c + '">Beta(' + a + ',' + b + ')，均值 ' + f3(a / (a + b)) + '</span>').join('')));
    ui.out.innerHTML = md('$\\alpha=\\beta=1$ 是一条水平线（均匀：对 $q$ 没有任何偏好）；$\\alpha=\\beta=2$ 在 0.5 处鼓起（相信硬币大致公平）；$\\alpha>\\beta$ 偏向 1、$\\alpha<\\beta$ 偏向 0；$\\alpha=\\beta=0.5$ 是 U 形（相信硬币很偏，但不知道偏向哪边）。均值总是 $\\frac{\\alpha}{\\alpha+\\beta}$。');
  });

  /* ---------------- c52 · Laplace approximation of a Beta posterior（L19 p23） ---------------- */
  SML.viz.register('laplace-approx', function (el) {
    const ui = shell(el, 'Laplace 近似：在众数处贴一个 Normal');
    const r1 = row(ui.body);
    const A = P().slider(r1, 'a', { min: 1.5, max: 30, step: 0.5, value: 9 }, draw);
    const B = P().slider(r1, 'b', { min: 1.5, max: 30, step: 0.5, value: 5 }, draw);
    const box = node('div'); ui.body.appendChild(box);
    function draw() {
      const a = +A.value, b = +B.value;
      const mode = (a - 1) / (a + b - 2);
      const h = -(a - 1) / (mode * mode) - (b - 1) / ((1 - mode) * (1 - mode)); // 2nd derivative of log density at the mode
      const v = -1 / h, sd = Math.sqrt(v);
      const exact = [], approx = [];
      for (let i = 1; i < 600; i++) { const q = i / 600; exact.push([q, betaPdf(q, a, b)]); approx.push([q, Math.exp(-(q - mode) * (q - mode) / (2 * v)) / Math.sqrt(2 * Math.PI * v)]); }
      const ymax = Math.max(...exact.map((p) => p[1]), ...approx.map((p) => p[1])) * 1.12;
      box.innerHTML = '';
      const pl = P().frame(box, { w: 540, h: 260, x: [0, 1], y: [0, ymax], xlabel: 'q', ylabel: '概率密度' });
      pl.path(exact, 'curve post'); pl.path(approx, 'curve lik');
      pl.line(mode, 0, mode, ymax, 'ref');
      box.appendChild(node('div', 'legend', '<span style="--c:var(--good)">真实后验 Beta(a,b)</span><span style="--c:var(--warn)">Laplace 近似 Normal(众数, −1/二阶导)</span>'));
      const mean = a / (a + b), tv = a * b / ((a + b) * (a + b) * (a + b + 1));
      ui.out.innerHTML = md('log 密度 $=(a-1)\\ln q+(b-1)\\ln(1-q)+$常数。众数 $=\\frac{a-1}{a+b-2}$，二阶导 $=-\\frac{a-1}{q^2}-\\frac{b-1}{(1-q)^2}$。') +
        readout([['众数（近似的中心）', f3(mode)], ['众数处二阶导', f3(h)], ['近似的标准差 $\\sqrt{-1/h}$', f3(sd)], ['真实均值', f3(mean)], ['真实标准差', f3(Math.sqrt(tv))]]);
    }
    draw();
  });
})(window);
