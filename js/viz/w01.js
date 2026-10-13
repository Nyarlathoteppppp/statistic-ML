/* W1 chapter visualisations (L01–L02): pmf, bayes test, hyperplane, eigen 2×2, estimator simulation,
 * Bernoulli MLE, Gaussian prior→posterior. Plain script; uses SML.plot. */
(function (root) {
  'use strict';
  const SML = root.SML;
  const P = () => SML.plot;
  const f3 = (v) => (Number.isFinite(v) ? String(+v.toFixed(3)) : (v > 0 ? '∞' : v < 0 ? '−∞' : '—'));
  const f4 = (v) => (Number.isFinite(v) ? String(+v.toFixed(4)) : '—');

  function node(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function btn(text, fn, cls) { const b = node('button', cls || 'btn', text); b.type = 'button'; b.addEventListener('click', fn); return b; }
  function shell(el, title) {
    const s = node('div', 'solver'), h = node('div', 'solver-head');
    const tools = node('div', 'tools'), body = node('div', 'solver-body'), out = node('div', 'solver-out');
    h.append(node('span', 'title', title), tools); s.append(h, body, out); el.appendChild(s);
    return { tools: tools, body: body, out: out };
  }
  function row(parent) { const r = node('div', 'row'); parent.appendChild(r); return r; }
  function readout(pairs) {
    const { inline } = SML.md;
    return '<div class="readout">' + pairs.map((p) => '<div><span>' + inline(p[0]) + '</span><b>' + inline(String(p[1])) + '</b></div>').join('') + '</div>';
  }
  function md(s) { return SML.md.md(s); }
  function gauss() { let u = 0, v = 0; while (u === 0) u = Math.random(); while (v === 0) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  const npdf = (x, m, v) => Math.exp(-(x - m) * (x - m) / (2 * v)) / Math.sqrt(2 * Math.PI * v);

  /* ---------------- c01 · PMF, expectation, variance ---------------- */
  SML.viz.register('pmf-explorer', function (el, opts) {
    const PRESETS = {
      die: { name: '公平骰子', xs: [1, 2, 3, 4, 5, 6], ps: [1, 1, 1, 1, 1, 1].map(() => 1 / 6) },
      bet: { name: '押偶数（L01 p16）', xs: [-5, 5], ps: [0.5, 0.5] },
      loaded: { name: '灌铅骰子', xs: [1, 2, 3, 4, 5, 6], ps: [0.1, 0.1, 0.1, 0.1, 0.1, 0.5] },
      bern: { name: 'Bernoulli(0.3)', xs: [0, 1], ps: [0.7, 0.3] },
    };
    const ui = shell(el, '离散分布：期望与方差');
    const sel = node('select');
    Object.keys(PRESETS).forEach((k) => { const o = node('option', null, PRESETS[k].name); o.value = k; sel.appendChild(o); });
    sel.value = opts.preset || 'die';
    ui.tools.appendChild(sel);
    const edit = node('div', 'pmf-edit'); ui.body.appendChild(edit);
    const r = row(ui.body);
    const a = P().slider(r, '$a$ =', { min: -3, max: 3, step: 0.5, value: 1 }, draw);
    const b = P().slider(r, '$b$ =', { min: -5, max: 5, step: 1, value: 0 }, draw);
    r.querySelectorAll('span').forEach((s) => { s.innerHTML = SML.md.inline(s.textContent); });
    const plotBox = node('div'); ui.body.appendChild(plotBox);
    let xs = [], ps = [];

    function load() {
      const pr = PRESETS[sel.value]; xs = pr.xs.slice(); ps = pr.ps.slice();
      a.set(1); b.set(0);
      edit.innerHTML = '';
      xs.forEach((x, i) => {
        const l = node('label', null, '<span>P(X=' + x + ')</span>');
        const inp = node('input'); inp.type = 'number'; inp.step = '0.05'; inp.min = '0'; inp.max = '1'; inp.value = String(+ps[i].toFixed(4));
        inp.addEventListener('input', () => { const v = parseFloat(inp.value); ps[i] = Number.isFinite(v) && v >= 0 ? v : 0; draw(); });
        l.appendChild(inp); edit.appendChild(l);
      });
      draw();
    }
    function draw() {
      const A = +a.value, Bv = +b.value;
      const ys = xs.map((x) => A * x + Bv);
      const agg = {}; ys.forEach((y, i) => { const k = +y.toFixed(9); agg[k] = (agg[k] || 0) + ps[i]; });
      const ux = Object.keys(agg).map(Number), up = ux.map((k) => agg[k]);
      const tot = ps.reduce((s, p) => s + p, 0);
      const E = xs.reduce((s, x, i) => s + x * ps[i], 0);
      const E2 = xs.reduce((s, x, i) => s + x * x * ps[i], 0);
      const V = E2 - E * E;
      const EY = ys.reduce((s, y, i) => s + y * ps[i], 0);
      const VY = ys.reduce((s, y, i) => s + (y - EY) * (y - EY) * ps[i], 0);
      plotBox.innerHTML = '';
      const lo = Math.min.apply(null, ys.concat([EY - Math.sqrt(Math.max(VY, 0))])) - 1;
      const hi = Math.max.apply(null, ys.concat([EY + Math.sqrt(Math.max(VY, 0))])) + 1;
      const pmax = Math.max.apply(null, up);
      const pl = P().frame(plotBox, { w: 520, h: 230, x: [lo, hi], y: [0, Math.max(0.6, pmax + 0.12)], xlabel: (A === 1 && Bv === 0) ? 'x' : 'y = ax + b', ylabel: 'P' });
      const bw = Math.min(0.7, (hi - lo) / 14);
      ux.forEach((y, i) => pl.rect(y - bw / 2, 0, bw, up[i], 'bar'));
      const sd = Math.sqrt(Math.max(VY, 0));
      pl.line(EY, 0, EY, pmax + 0.05, 'ref r');
      pl.text(EY, pmax + 0.08, 'E = ' + f3(EY), 'note r');
      if (sd > 0) { pl.line(EY - sd, 0.02, EY + sd, 0.02, 'vec'); pl.text(EY + sd, 0.06, '±σ', 'note r', 'start'); }
      const warn = Math.abs(tot - 1) > 1e-6 ? '<div class="callout warn"><div class="ctitle">概率和不是 1</div>当前 ΣP = ' + f4(tot) + '。合法的 PMF 必须非负且加起来等于 1（L01 p15 公理）。</div>' : '';
      const transformed = (A !== 1 || Bv !== 0);
      // Moments of an unnormalised table are meaningless (Var can even go negative): show them only when ΣP = 1.
      if (Math.abs(tot - 1) > 1e-6) { ui.out.innerHTML = warn + readout([['$\\sum_x P(X=x)$', f4(tot)], ['期望、方差', '—（概率和不为 1，先调到和为 1）']]); return; }
      ui.out.innerHTML = warn + readout([
        ['$\\sum_x P(X=x)$', f4(tot)],
        ['$E[X]=\\sum_x x\\,P(X=x)$', f4(E)],
        ['$E[X^2]$', f4(E2)],
        ['$\\mathrm{Var}(X)=E[X^2]-E[X]^2$', f4(V)],
        ['$\\sigma=\\sqrt{\\mathrm{Var}}$', f4(Math.sqrt(Math.max(V, 0)))],
      ].concat(transformed ? [
        ['$E[aX+b]$（直接算）', f4(EY)], ['$aE[X]+b$', f4(A * E + Bv)],
        ['$\\mathrm{Var}(aX+b)$', f4(VY)], ['$a^2\\mathrm{Var}(X)$', f4(A * A * V)],
      ] : []));
    }
    sel.addEventListener('change', load);
    load();
  });

  /* ---------------- c02 · Bayes rule with natural frequencies ---------------- */
  SML.viz.register('bayes-test', function (el, opts) {
    const ui = shell(el, 'Bayes rule：检测阳性后真的有病的概率');
    const r1 = row(ui.body), r2 = row(ui.body);
    const prior = P().slider(r1, '患病率 P(D)', { min: 0.001, max: 0.5, step: 0.001, value: opts.prior || 0.01 }, draw);
    const sens = P().slider(r1, '灵敏度 P(+|D)', { min: 0.5, max: 1, step: 0.01, value: opts.sens || 0.9 }, draw);
    const fpr = P().slider(r2, '误报率 P(+|¬D)', { min: 0, max: 0.3, step: 0.005, value: opts.fpr != null ? opts.fpr : 0.05 }, draw);
    const grid = node('div', 'people'); ui.body.appendChild(grid);
    const leg = node('div', 'legend', '<span style="--c:#c9463d">有病且阳性 TP</span><span style="--c:color-mix(in srgb,#c9463d 35%,transparent)">有病但阴性 FN</span><span style="--c:var(--warn)">没病但阳性 FP</span><span style="--c:var(--line)">没病且阴性 TN</span>');
    ui.body.appendChild(leg);
    const dots = [];
    for (let i = 0; i < 1000; i++) { const d = node('i'); grid.appendChild(d); dots.push(d); }
    function draw() {
      const p = +prior.value, s = +sens.value, f = +fpr.value;
      const D = Math.round(1000 * p), TP = Math.round(D * s), FN = D - TP, FP = Math.round((1000 - D) * f), TN = 1000 - D - FP;
      dots.forEach((d, i) => { d.className = i < TP ? 'tp' : i < D ? 'fn' : i < D + FP ? 'fp' : 'tn'; });
      const pPos = s * p + f * (1 - p);
      const post = s * p / pPos;
      ui.out.innerHTML = md('**1000 个人里**：有病 ' + D + '（其中阳性 ' + TP + '），没病 ' + (1000 - D) + '（其中误报阳性 ' + FP + '）。阳性一共 ' + (TP + FP) + ' 人，真有病的占 $' + TP + '/' + (TP + FP) + '\\approx ' + f3(TP / Math.max(1, TP + FP)) + '$。') +
        md('**公式**：$P(D\\mid +)=\\dfrac{P(+\\mid D)P(D)}{P(+)}$，分母用边缘化 $P(+)=P(+\\mid D)P(D)+P(+\\mid\\neg D)P(\\neg D)=' + f4(s) + '\\times' + f4(p) + '+' + f4(f) + '\\times' + f4(1 - p) + '=' + f4(pPos) + '$') +
        readout([['先验 $P(D)$', f4(p)], ['后验 $P(D\\mid +)$', f4(post)], ['后验 / 先验', f3(post / p) + ' 倍']]);
    }
    draw();
  });

  /* ---------------- c03 · hyperplane, normal vector, signed distance ---------------- */
  SML.viz.register('hyperplane-2d', function (el, opts) {
    const ui = shell(el, '超平面 w\'x + b = 0、法向量与距离');
    const r1 = row(ui.body);
    const w1 = P().slider(r1, 'w₁', { min: -3, max: 3, step: 0.1, value: opts.w1 != null ? opts.w1 : 1 }, draw);
    const w2 = P().slider(r1, 'w₂', { min: -3, max: 3, step: 0.1, value: opts.w2 != null ? opts.w2 : 1 }, draw);
    const bb = P().slider(r1, 'b', { min: -6, max: 6, step: 0.1, value: opts.b != null ? opts.b : -2 }, draw);
    ui.tools.appendChild(btn('清空点', () => { pts = []; draw(); }));
    const box = node('div'); ui.body.appendChild(box);
    ui.body.appendChild(node('div', 'small muted', '点击图中任意位置放一个点（最多 6 个）。'));
    let pts = (opts.points || [[3, 2], [0, 0], [1, -2]]).map((p) => p.slice());
    function draw() {
      const W1 = +w1.value, W2 = +w2.value, B = +bb.value, nw = Math.hypot(W1, W2);
      box.innerHTML = '';
      const pl = P().frame(box, { w: 420, h: 420, x: [-5, 5], y: [-5, 5], margin: { l: 30, r: 10, t: 10, b: 26 }, maxWidth: 440, xlabel: 'x₁', ylabel: 'x₂' });
      pl.svg.addEventListener('click', (e) => { const p = pl.fromEvent(e); if (pts.length >= 6) pts.shift(); pts.push([+p[0].toFixed(1), +p[1].toFixed(1)]); draw(); });
      const rows = [];
      if (nw < 1e-9) { ui.out.innerHTML = md('$\\bw=\\mathbf 0$：没有超平面（所有点 $\\bw\'\\bx+b=b$ 都一样）。'); return; }
      // line endpoints
      const seg = [];
      if (Math.abs(W2) > 1e-9) { seg.push([-5, (-B - W1 * -5) / W2], [5, (-B - W1 * 5) / W2]); }
      else { seg.push([-B / W1, -5], [-B / W1, 5]); }
      pl.path(seg, 'boundary');
      const foot = [-B * W1 / (nw * nw), -B * W2 / (nw * nw)];
      pl.arrow(foot[0], foot[1], foot[0] + 1.6 * W1 / nw, foot[1] + 1.6 * W2 / nw, 'vec');
      pl.text(foot[0] + 1.9 * W1 / nw, foot[1] + 1.9 * W2 / nw + 0.2, 'w', 'note r');
      pts.forEach((p, i) => {
        const s = W1 * p[0] + W2 * p[1] + B, d = Math.abs(s) / nw;
        const proj = [p[0] - s * W1 / (nw * nw), p[1] - s * W2 / (nw * nw)];
        pl.line(p[0], p[1], proj[0], proj[1], 'ref');
        pl.dot(p[0], p[1], 6, 'pt ' + (s > 0 ? 'pos' : s < 0 ? 'neg' : 'ghost'));
        pl.text(p[0] + 0.35, p[1] + 0.3, 'P' + (i + 1), 'note', 'start');
        rows.push(['P' + (i + 1) + ' (' + p[0] + ', ' + p[1] + ')', '$' + f3(W1) + '\\cdot' + f3(p[0]) + (W2 >= 0 ? '+' : '') + f3(W2) + '\\cdot' + f3(p[1]) + (B >= 0 ? '+' : '') + f3(B) + '=' + f3(s) + '$', s > 0 ? '正侧（法向量指向的一侧）' : s < 0 ? '负侧' : '在超平面上', f3(d)]);
      });
      ui.out.innerHTML = md('$\\|\\bw\\|=\\sqrt{(' + f3(W1) + ')^2+(' + f3(W2) + ')^2}=' + f3(nw) + '$。点到超平面的距离 $=|\\bw\'\\bx+b|/\\|\\bw\\|$（L08 会用到）。') +
        SML.render.renderBlocks([{ t: 'table', cls: 'compact', head: ['点', '$\\bw\'\\bx+b$', '在哪一侧', '距离'], rows: rows }], { h2: 0, toc: [], qn: 0 }).firstChild.outerHTML;
    }
    draw();
  });

  /* ---------------- c04 · 2×2 symmetric matrix: eigen, PSD ---------------- */
  SML.viz.register('eigen-2d', function (el, opts) {
    const PRE = {
      a: ['[[2,1],[1,2]]（PD）', 2, 1, 2], b: ['[[1,2],[2,1]]（不定）', 1, 2, 1], c: ['[[1,1],[1,1]]（PSD，秩 1）', 1, 1, 1],
      d: ['单位矩阵 I', 1, 0, 1], e: ['[[3,0],[0,0.5]]（对角）', 3, 0, 0.5], f: ['X\'X，X=[[1,2],[0,1]]', 1, 2, 5],
    };
    const ui = shell(el, '2×2 对称矩阵：特征向量只被拉伸，不被旋转');
    const sel = node('select');
    Object.keys(PRE).forEach((k) => { const o = node('option', null, PRE[k][0]); o.value = k; sel.appendChild(o); });
    ui.tools.appendChild(sel);
    const r1 = row(ui.body), r2 = row(ui.body);
    const a = P().slider(r1, 'a₁₁', { min: -3, max: 6, step: 0.1, value: 2 }, draw);
    const b = P().slider(r1, 'a₁₂=a₂₁', { min: -3, max: 3, step: 0.1, value: 1 }, draw);
    const d = P().slider(r1, 'a₂₂', { min: -3, max: 6, step: 0.1, value: 2 }, draw);
    const ang = P().slider(r2, '探针 v 的角度', { min: 0, max: 360, step: 1, value: 20, fmt: (v) => v + '°' }, draw);
    const box = node('div'); ui.body.appendChild(box);
    sel.addEventListener('change', () => { const p = PRE[sel.value]; a.set(p[1]); b.set(p[2]); d.set(p[3]); draw(); });
    function draw() {
      const A = +a.value, Bv = +b.value, D = +d.value;
      const tr = A + D, disc = Math.sqrt(((A - D) / 2) * ((A - D) / 2) + Bv * Bv);
      const l1 = tr / 2 + disc, l2 = tr / 2 - disc;
      const vec = (l) => { let v = Math.abs(Bv) > 1e-9 ? [l - D, Bv] : (Math.abs(l - A) < 1e-9 ? [1, 0] : [0, 1]); const n = Math.hypot(v[0], v[1]); return [v[0] / n, v[1] / n]; };
      let e1 = vec(l1), e2 = vec(l2);
      if (Math.abs(Bv) < 1e-9 && Math.abs(A - D) < 1e-9) { e1 = [1, 0]; e2 = [0, 1]; }
      const R = Math.max(2, Math.abs(l1), Math.abs(l2)) * 1.15;
      box.innerHTML = '';
      const pl = P().frame(box, { w: 420, h: 420, x: [-R, R], y: [-R, R], margin: { l: 30, r: 10, t: 10, b: 26 }, maxWidth: 440 });
      const circ = [], img = [];
      for (let i = 0; i <= 180; i++) { const t = i / 180 * 2 * Math.PI, c = Math.cos(t), s = Math.sin(t); circ.push([c, s]); img.push([A * c + Bv * s, Bv * c + D * s]); }
      pl.path(circ, 'circle0', true);
      pl.path(img, 'ellipse', true);
      pl.arrow(0, 0, e1[0] * l1, e1[1] * l1, 'vec g'); pl.text(e1[0] * l1 * 1.08, e1[1] * l1 * 1.08 + 0.15, 'λ₁v₁', 'note g');
      pl.arrow(0, 0, e2[0] * l2, e2[1] * l2, 'vec g'); pl.text(e2[0] * l2 * 1.08, e2[1] * l2 * 1.08 + 0.15, 'λ₂v₂', 'note g');
      const t = +ang.value * Math.PI / 180, v = [Math.cos(t), Math.sin(t)], Av = [A * v[0] + Bv * v[1], Bv * v[0] + D * v[1]];
      pl.arrow(0, 0, v[0], v[1], 'vec b'); pl.text(v[0] * 1.2, v[1] * 1.2, 'v', 'note a');
      pl.arrow(0, 0, Av[0], Av[1], 'vec'); pl.text(Av[0] * 1.1, Av[1] * 1.1 + 0.15, 'Av', 'note r');
      const q = v[0] * Av[0] + v[1] * Av[1];
      const e = 1e-9;
      const kind = l2 > e ? '正定 PD（所有特征值 > 0）' : l2 > -e ? '半正定 PSD（特征值 ≥ 0，有 0）' : l1 < -e ? '负定（不是 PSD）' : l1 <= e ? '负半定（特征值 ≤ 0，不是 PSD）' : '不定（一正一负，不是 PSD）';
      ui.out.innerHTML = md('$\\mathbf A=\\begin{bmatrix}' + f3(A) + '&' + f3(Bv) + '\\\\' + f3(Bv) + '&' + f3(D) + '\\end{bmatrix}$，特征值 $\\lambda_{1,2}=\\frac{\\mathrm{tr}}{2}\\pm\\sqrt{(\\frac{a_{11}-a_{22}}{2})^2+a_{12}^2}=' + f3(l1) + ',\\ ' + f3(l2) + '$') +
        readout([['$\\det\\mathbf A=\\lambda_1\\lambda_2$', f3(A * D - Bv * Bv)], ['$\\mathrm{tr}\\,\\mathbf A=\\lambda_1+\\lambda_2$', f3(tr)], ['探针 $\\bv\'\\mathbf A\\bv$', f3(q)], ['结论', kind]]) +
        md(Math.abs(A * D - Bv * Bv) < 1e-9 ? '行列式 = 0：列线性相关（rank deficient），有零特征值，**不可逆**（L01 p41）。图里椭圆被压扁成一条线段。' : '');
    }
    draw();
  });

  /* ---------------- c05/c07 · estimator bias, variance, MSE by simulation ---------------- */
  SML.viz.register('estimator-sim', function (el, opts) {
    const EST = {
      mean: ['样本均值 $\\bar X$', (xs) => xs.reduce((s, x) => s + x, 0) / xs.length, (th, n) => [0, 1 / n]],
      first: ['只用第一个样本 $X_1$', (xs) => xs[0], (th, n) => [0, 1]],
      shrink: ['收缩 $0.5\\bar X$', (xs) => 0.5 * xs.reduce((s, x) => s + x, 0) / xs.length, (th, n) => [-0.5 * th, 0.25 / n]],
      plus: ['偏移 $\\bar X+0.3$', (xs) => 0.3 + xs.reduce((s, x) => s + x, 0) / xs.length, (th, n) => [0.3, 1 / n]],
    };
    const ui = shell(el, '估计量模拟：重复抽样 → 看 bias 和 variance');
    const sel = node('select');
    Object.keys(EST).forEach((k) => { const o = node('option', null, EST[k][0].replace(/\$|\\bar |\\/g, '')); o.value = k; sel.appendChild(o); });
    sel.value = opts.est || 'mean';
    ui.tools.append(sel, btn('重新抽样', run, 'btn primary'));
    const r1 = row(ui.body);
    const th = P().slider(r1, '真值 θ', { min: -1, max: 2, step: 0.1, value: opts.theta != null ? opts.theta : 0 }, run);
    const n = P().slider(r1, '样本量 n', { min: 1, max: 200, step: 1, value: opts.n || 20 }, run);
    const R = P().slider(r1, '重复次数', { min: 10, max: 400, step: 10, value: opts.reps || 40 }, run);
    const box = node('div'); ui.body.appendChild(box);
    sel.addEventListener('change', run);
    function run() {
      const e = EST[sel.value], TH = +th.value, N = +n.value, REP = +R.value;
      const est = [];
      for (let r = 0; r < REP; r++) { const xs = []; for (let i = 0; i < N; i++) xs.push(TH + gauss()); est.push(e[1](xs)); }
      const mean = est.reduce((s, v) => s + v, 0) / REP;
      const vr = est.reduce((s, v) => s + (v - mean) * (v - mean), 0) / REP;
      const mse = est.reduce((s, v) => s + (v - TH) * (v - TH), 0) / REP;
      const [tb, tv] = e[2](TH, N);
      box.innerHTML = '';
      const lo = Math.min(TH - 1.2, Math.min.apply(null, est)), hi = Math.max(TH + 1.2, Math.max.apply(null, est));
      const pl = P().frame(box, { w: 540, h: 240, x: [0, REP + 1], y: [lo - 0.1, hi + 0.1], xlabel: '第 i 次重复', ylabel: 'θ̂ᵢ' });
      est.forEach((v, i) => pl.dot(i + 1, v, REP > 150 ? 2 : 3.2, 'pt'));
      pl.line(0, TH, REP + 1, TH, 'ref'); pl.text(REP + 1, TH + 0.06 * (hi - lo), '真值 θ', 'note', 'end');
      pl.line(0, mean, REP + 1, mean, 'ref r'); pl.text(1, mean + 0.06 * (hi - lo), '估计值的平均', 'note r', 'start');
      ui.out.innerHTML = md('数据：每次从 $\\mathcal N(\\theta=' + TH + ',\\ \\sigma^2=1)$ 抽 $n=' + N + '$ 个点，用 ' + e[0] + ' 估计 $\\theta$，重复 ' + REP + ' 次（L02 p5–p8 的实验）。') +
        readout([
          ['模拟 bias $\\approx\\overline{\\hat\\theta}-\\theta$', f4(mean - TH)], ['理论 bias', f4(tb)],
          ['模拟 variance', f4(vr)], ['理论 variance', f4(tv)],
          ['模拟 MSE $\\overline{(\\hat\\theta-\\theta)^2}$', f4(mse)], ['bias² + variance（模拟）', f4((mean - TH) * (mean - TH) + vr)],
        ]);
    }
    run();
  });

  /* ---------------- c06 · Bernoulli MLE: log-likelihood curve ---------------- */
  SML.viz.register('mle-bernoulli', function (el, opts) {
    const ui = shell(el, 'Bernoulli MLE：让观测数据最可能的 θ');
    const mode = node('select');
    [['log', '画 log-likelihood'], ['lik', '画 likelihood（不取 log）']].forEach((e) => { const o = node('option', null, e[1]); o.value = e[0]; mode.appendChild(o); });
    ui.tools.append(mode, btn('+ 1 个数据', () => { if (data.length < 30) data.push(Math.random() < 0.5 ? 1 : 0); draw(); }), btn('− 1 个', () => { if (data.length > 1) data.pop(); draw(); }));
    const coins = node('div', 'coins'); ui.body.appendChild(coins);
    ui.body.appendChild(node('div', 'small muted', '点硬币切换 0 / 1（1 = 正面 / 成功）。'));
    const r1 = row(ui.body);
    const th = P().slider(r1, '试一个 θ', { min: 0.01, max: 0.99, step: 0.01, value: 0.5 }, draw);
    const box = node('div'); ui.body.appendChild(box);
    let data = (opts.data || [1, 0, 1, 1, 0, 1, 1, 0, 1, 1]).slice();
    mode.addEventListener('change', draw);
    function draw() {
      coins.innerHTML = '';
      data.forEach((x, i) => { const c = btn(String(x), () => { data[i] = 1 - data[i]; draw(); }, 'coin' + (x ? ' one' : '')); coins.appendChild(c); });
      const n = data.length, k = data.reduce((s, x) => s + x, 0), T = +th.value;
      const logL = (t) => (k ? k * Math.log(t) : 0) + (n - k ? (n - k) * Math.log(1 - t) : 0);
      const isLog = mode.value === 'log';
      const f = isLog ? logL : (t) => Math.exp(logL(t));
      const hat = k / n, top = f(hat);
      box.innerHTML = '';
      const ylo = isLog ? top - Math.max(6, n * 0.9) : 0, yhi = isLog ? top + 0.15 * Math.max(6, n * 0.9) : top * 1.15;
      const pl = P().frame(box, { w: 540, h: 260, x: [0, 1], y: [ylo, yhi], xlabel: 'θ', ylabel: isLog ? 'L(θ)' : 'p(data|θ)', yfmt: isLog ? null : (v) => v.toExponential(0), margin: { l: 52 } });
      const pts = []; for (let i = 0; i <= 400; i++) { const t = i / 400; pts.push([t, f(t)]); }
      pl.path(pts, 'curve');
      pl.line(hat, ylo, hat, Math.max(ylo, top), 'ref g'); pl.text(hat, yhi - 0.04 * (yhi - ylo), 'θ̂ = k/n = ' + f3(hat), 'note g');
      const fv = f(T); if (fv >= ylo) pl.dot(T, fv, 5, 'pt big'); else pl.text(T, ylo + 0.06 * (yhi - ylo), '↓ L(θ)=' + f3(fv) + '（在图下方）', 'note r');
      if (isLog && k > 0 && k < n) {
        const slope = k / T - (n - k) / (1 - T), dx = 0.12;
        pl.line(T - dx, fv - slope * dx, T + dx, fv + slope * dx, 'tangent');
      }
      const dL = k / T - (n - k) / (1 - T);
      ui.out.innerHTML = md('数据 $n=' + n + '$，正面 $k=\\sum x_i=' + k + '$。$L(\\theta)=k\\log\\theta+(n-k)\\log(1-\\theta)$，$\\dfrac{dL}{d\\theta}=\\dfrac{k}{\\theta}-\\dfrac{n-k}{1-\\theta}$') +
        readout([['当前 θ', f3(T)], ['$L(\\theta)$', f4(logL(T))], ['$dL/d\\theta$', f3(dL)], ['往哪走 L 变大', Math.abs(dL) < 0.05 ? '已在顶点' : dL > 0 ? '→ 增大 θ' : '← 减小 θ'], ['MLE $\\hat\\theta=k/n$', f4(hat)]]);
    }
    draw();
  });

  /* ---------------- c08 · Gaussian prior × likelihood → posterior ---------------- */
  SML.viz.register('gauss-posterior', function (el, opts) {
    const ui = shell(el, 'Bayesian 更新：先验 × 似然 → 后验（均值参数 θ）');
    const r1 = row(ui.body), r2 = row(ui.body);
    const m0 = P().slider(r1, '先验均值 μ₀', { min: -3, max: 3, step: 0.1, value: 0 }, draw);
    const v0 = P().slider(r1, '先验方差 σ₀²', { min: 0.1, max: 5, step: 0.1, value: 1 }, draw);
    const vs = P().slider(r2, '噪声方差 σ²', { min: 0.1, max: 5, step: 0.1, value: 1 }, draw);
    const dl = node('label', null, '数据 x（逗号分隔）'); const dIn = node('input'); dIn.type = 'text'; dIn.value = (opts.data || [1]).join(', '); dIn.style.width = '12em'; dl.appendChild(dIn); r2.appendChild(dl);
    dIn.addEventListener('input', draw);
    ui.tools.append(btn('L02 例子', () => { m0.set(0); v0.set(1); vs.set(1); dIn.value = '1'; draw(); }), btn('+ 随机点', () => { const xs = parse(); xs.push(+(1.5 + Math.sqrt(+vs.value) * gauss()).toFixed(2)); dIn.value = xs.join(', '); draw(); }));
    const box = node('div'); ui.body.appendChild(box);
    function parse() { return dIn.value.split(/[ ,，]+/).filter((s) => s !== '').map(Number).filter(Number.isFinite); }
    function draw() {
      const xs = parse(), n = xs.length, M0 = +m0.value, V0 = +v0.value, S2 = +vs.value;
      const sum = xs.reduce((s, x) => s + x, 0), xbar = n ? sum / n : NaN;
      const prec = 1 / V0 + n / S2, Vn = 1 / prec, Mn = Vn * (M0 / V0 + sum / S2);
      box.innerHTML = '';
      const ymax = Math.max(npdf(M0, M0, V0), npdf(Mn, Mn, Vn), n ? npdf(xbar, xbar, S2 / n) : 0) * 1.12;
      const pl = P().frame(box, { w: 540, h: 260, x: [-4, 4], y: [0, ymax], xlabel: 'θ', ylabel: '密度' });
      pl.fn((t) => npdf(t, M0, V0), 'curve prior');
      if (n) pl.fn((t) => npdf(t, xbar, S2 / n), 'curve lik');
      pl.fn((t) => npdf(t, Mn, Vn), 'curve post');
      pl.line(Mn, 0, Mn, npdf(Mn, Mn, Vn), 'ref g');
      if (n) { pl.line(xbar, 0, xbar, npdf(xbar, xbar, S2 / n), 'ref'); }
      xs.forEach((x) => { if (x >= -4 && x <= 4) pl.dot(x, ymax * 0.02, 4, 'pt hit'); });
      const leg = node('div', 'legend', '<span style="--c:var(--muted)">先验 p(θ)</span><span style="--c:var(--warn)">似然（归一化成 θ 的曲线）</span><span style="--c:var(--good)">后验 p(θ|x)</span><span style="--c:var(--bad)">数据点</span>');
      box.appendChild(leg);
      const wPrior = (1 / V0) / prec;
      ui.out.innerHTML = md('后验仍是 Gaussian：$\\dfrac1{\\sigma_n^2}=\\dfrac1{\\sigma_0^2}+\\dfrac n{\\sigma^2}$，$\\mu_n=\\sigma_n^2\\Big(\\dfrac{\\mu_0}{\\sigma_0^2}+\\dfrac{\\sum x_i}{\\sigma^2}\\Big)$ ⇒ $\\theta\\mid x\\sim\\mathcal N(' + f3(Mn) + ',\\ ' + f3(Vn) + ')$') +
        readout([['$n$', n], ['MLE $\\bar x$', n ? f3(xbar) : '（没有数据）'], ['MAP = 后验均值', f3(Mn)], ['后验方差', f3(Vn)], ['先验所占权重', f3(wPrior)], ['数据所占权重', f3(1 - wPrior)]]);
    }
    draw();
  });
})(window);
