/* W2 chapter visualisations (L03–L04): least squares on the weather data, polynomial basis fit,
 * XOR with distance basis, 2-D optimisers (GD / SGD / Newton), 1-D Newton on L', logistic vs linear. */
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

  /* solve small linear system (Gaussian elimination with partial pivoting) */
  function solve(A, b) {
    const n = b.length, M = A.map((r, i) => r.concat([b[i]]));
    for (let c = 0; c < n; c++) {
      let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      if (Math.abs(M[p][c]) < 1e-12) return null;
      const t = M[c]; M[c] = M[p]; M[p] = t;
      for (let r = 0; r < n; r++) if (r !== c) { const f = M[r][c] / M[c][c]; for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; }
    }
    return M.map((r, i) => r[n] / r[i]);
  }
  function lsq(X, y, lam) { // (X'X + lam I)^-1 X'y ; lam applied to all but first column
    const d = X[0].length, A = [], b = [];
    for (let i = 0; i < d; i++) { A.push([]); b.push(0); for (let j = 0; j < d; j++) { let s = 0; X.forEach((r) => { s += r[i] * r[j]; }); A[i].push(s + (i === j && i > 0 ? (lam || 0) : 0)); } X.forEach((r, k) => { b[i] += r[i] * y[k]; }); }
    return solve(A, b);
  }
  SML.vizMath = { solve: solve, lsq: lsq };

  /* ---------------- c10/c11 · least squares on the L03 weather data ---------------- */
  const WEATHER = [[85, 85], [80, 90], [83, 86], [70, 96], [68, 80], [65, 70], [64, 65], [72, 95], [69, 70], [75, 80]];
  SML.viz.register('ls-fit', function (el, opts) {
    const ui = shell(el, '最小二乘：拖动直线，让残差平方和最小');
    const r1 = row(ui.body);
    const a = P().slider(r1, '截距 a', { min: -40, max: 90, step: 0.1, value: opts.a != null ? opts.a : 60 }, draw);
    const b = P().slider(r1, '斜率 b', { min: -0.5, max: 1.6, step: 0.0001, value: opts.b != null ? opts.b : 0.3 }, draw);
    const noise = node('select');
    [['rss', '显示：残差平方'], ['gauss', '显示：Gaussian 噪声带 ±σ']].forEach((e) => { const o = node('option', null, e[1]); o.value = e[0]; noise.appendChild(o); });
    noise.value = opts.mode || 'rss';
    noise.addEventListener('change', draw);
    ui.tools.append(noise, btn('最小二乘解', () => { a.set(25.2992); b.set(0.7716); draw(); }, 'btn primary'), btn('课件四舍五入', () => { a.set(25.3); b.set(0.77); draw(); }));
    const box = node('div'); ui.body.appendChild(box);
    const n = WEATHER.length;
    function draw() {
      const A = +a.value, B = +b.value;
      box.innerHTML = '';
      const pl = P().frame(box, { w: 540, h: 300, x: [60, 90], y: [55, 105], xlabel: '温度 T', ylabel: '湿度 H' });
      let rss = 0;
      const gauss = noise.value === 'gauss';
      const sig = Math.sqrt(744.68 / n);
      if (gauss) {
        pl.path([[60, A + B * 60 + sig], [90, A + B * 90 + sig]], 'ref a');
        pl.path([[60, A + B * 60 - sig], [90, A + B * 90 - sig]], 'ref a');
      }
      WEATHER.forEach((d) => {
        const pred = A + B * d[0], r = d[1] - pred; rss += r * r;
        pl.line(d[0], d[1], d[0], pred, 'ref r');
        pl.dot(d[0], d[1], 5, 'pt');
      });
      pl.path([[60, A + B * 60], [90, A + B * 90]], 'boundary');
      const sigma2 = rss / n;
      ui.out.innerHTML = md('模型 $\\hat H=a+bT$。红竖线是残差 $H_i-\\hat H_i$' + (gauss ? '；蓝虚线是 $\\pm\\sigma$ 带（$\\sigma$ 取最优解的估计 $\\hat\\sigma=\\sqrt{\\text{RSS}/n}\\approx' + f3(sig) + '$）。' : '。RSS 就是这些竖线长度的平方和。')) +
        readout([['RSS $=\\sum(H_i-a-bT_i)^2$', f3(rss)], ['最优 RSS（精确解 a≈25.30, b≈0.7716）', '744.68'],
          ['Gaussian 对数似然（$\\sigma^2$ 固定为 74.47）', f3(-n / 2 * Math.log(2 * Math.PI * 74.468) - rss / (2 * 74.468))],
          ['预测 T=75', f3(A + B * 75)], ['预测 T=70', f3(A + B * 70)], ['当前 RSS/n', f3(sigma2)]]);
    }
    draw();
  });

  /* ---------------- c12/c18/c19 · polynomial basis expansion ---------------- */
  SML.viz.register('poly-fit', function (el, opts) {
    const ui = shell(el, 'Basis expansion：用多项式特征做"线性"回归');
    const r1 = row(ui.body);
    const deg = P().slider(r1, '多项式次数 k', { min: 0, max: 9, step: 1, value: opts.degree != null ? opts.degree : 1 }, draw);
    const lam = P().slider(r1, 'ridge λ（第 16 章）', { min: 0, max: 5, step: 0.01, value: 0, fmt: (v) => v.toFixed(2) }, draw);
    if (!opts.ridge) lam.parentNode.style.display = 'none';
    const showTest = node('label', null, '<input type="checkbox"> 显示测试点'); const cb = showTest.querySelector('input'); cb.checked = !!opts.test; cb.addEventListener('change', draw);
    ui.tools.append(showTest, btn('换一批训练数据', () => { seed++; gen(); draw(); }));
    const box = node('div'); ui.body.appendChild(box);
    let seed = opts.seed || 3, train = [], test = [];
    const truth = (x) => x * Math.sin(x);
    function gen() {
      const rng = SML.quiz.seedRng(seed * 7919);
      const g = () => { let u = 0, v = 0; while (u === 0) u = rng(); v = rng(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
      train = []; test = [];
      for (let i = 0; i < (opts.n || 12); i++) { const x = 10 * (i + 0.5) / (opts.n || 12) + (rng() - 0.5) * 0.5; train.push([x, truth(x) + g() * 1.2]); }
      for (let i = 0; i < 40; i++) { const x = rng() * 10; test.push([x, truth(x) + g() * 1.2]); }
    }
    gen();
    const feat = (x, k) => { const r = []; for (let j = 0; j <= k; j++) r.push(Math.pow(x / 5 - 1, j)); return r; }; // scaled for stability
    function draw() {
      const k = +deg.value, L = +lam.value;
      const w = lsq(train.map((d) => feat(d[0], k)), train.map((d) => d[1]), L) || new Array(k + 1).fill(0);
      const f = (x) => feat(x, k).reduce((s, v, j) => s + v * w[j], 0);
      const mse = (D) => D.reduce((s, d) => s + (d[1] - f(d[0])) * (d[1] - f(d[0])), 0) / D.length;
      box.innerHTML = '';
      const pl = P().frame(box, { w: 540, h: 280, x: [0, 10], y: [-10, 12], xlabel: 'x', ylabel: 'y' });
      pl.fn(truth, 'curve prior');
      if (cb.checked) test.forEach((d) => pl.dot(d[0], d[1], 3, 'pt ghost'));
      train.forEach((d) => pl.dot(d[0], d[1], 4.5, 'pt'));
      pl.fn(f, 'curve post', 400);
      const leg = node('div', 'legend', '<span style="--c:var(--muted)">真实函数 x·sin x</span><span style="--c:var(--accent)">训练点</span>' + (cb.checked ? '<span style="--c:var(--line-2)">测试点</span>' : '') + '<span style="--c:var(--good)">拟合曲线</span>');
      box.appendChild(leg);
      ui.out.innerHTML = md('特征 $\\varphi(x)=[1,x,x^2,\\dots,x^k]$（内部先把 $x$ 缩放到 $[-1,1]$ 保证数值稳定），然后对 $\\varphi$ 做**普通线性回归**——模型对参数 $\\bw$ 仍是线性的。') +
        readout([['特征个数（含常数）', k + 1], ['训练 MSE', f3(mse(train))], ['测试 MSE', cb.checked ? f3(mse(test)) : '（勾选"显示测试点"）'], ['$\\|\\bw\\|$', f3(Math.sqrt(w.reduce((s, v) => s + v * v, 0)))]]);
    }
    draw();
  });

  /* ---------------- c12 · XOR with distance basis (L03 p24) ---------------- */
  SML.viz.register('xor-basis', function (el) {
    const ui = shell(el, 'XOR：原空间线性不可分 → 换特征后可分（L03 p24）');
    const box = node('div', 'row'); box.style.alignItems = 'flex-start'; ui.body.appendChild(box);
    const left = node('div'), right = node('div'); left.style.flex = right.style.flex = '1 1 240px'; box.append(left, right);
    const pts = [[0, 0, 'A'], [0, 1, 'B'], [1, 0, 'B'], [1, 1, 'A']];
    const d = (p, z) => Math.hypot(p[0] - z[0], p[1] - z[1]);
    const thr = P().slider(row(ui.body), '分界阈值 c（$\\varphi_1+\\varphi_4=c$）', { min: 1, max: 2.5, step: 0.01, value: 1.7 }, draw);
    thr.parentNode.querySelector('span').innerHTML = SML.md.inline('分界阈值 $c$');
    function draw() {
      left.innerHTML = right.innerHTML = '';
      const a = P().frame(left, { w: 260, h: 260, x: [-0.4, 1.4], y: [-0.4, 1.4], xlabel: 'x₁', ylabel: 'x₂', margin: { l: 30, b: 26 } });
      pts.forEach((p) => { a.dot(p[0], p[1], 9, 'pt ' + (p[2] === 'A' ? 'pos' : 'neg')); a.text(p[0], p[1] - 0.04, p[2], 'note', 'middle'); });
      a.text(0.5, 1.33, '原空间：找不到一条直线分开', 'note r');
      const b = P().frame(right, { w: 260, h: 260, x: [-0.2, 1.8], y: [-0.2, 1.8], xlabel: 'φ₁=‖x−z₁‖', ylabel: 'φ₄=‖x−z₄‖', margin: { l: 30, b: 26 } });
      const c = +thr.value;
      b.path([[c - 1.8, 1.8], [c + 0.2, -0.2]], 'boundary');
      pts.forEach((p) => { const f1 = d(p, [0, 0]), f4 = d(p, [1, 1]); b.dot(f1, f4, 9, 'pt ' + (p[2] === 'A' ? 'pos' : 'neg')); });
      b.text(0.8, 1.72, '新空间：一条直线就分开', 'note g');
      const ok = Math.SQRT2 < c && c < 2;
      ui.out.innerHTML = md('$\\mathbf z_1=(0,0)$，$\\mathbf z_4=(1,1)$。A 类点 $(0,0),(1,1)$：$(\\varphi_1,\\varphi_4)=(0,\\sqrt2),(\\sqrt2,0)$，和 $=\\sqrt2\\approx1.414$；B 类点 $(0,1),(1,0)$：$(1,1)$，和 $=2$。课件取 $\\bw=[1,0,0,1]$ 正是 $\\varphi_1+\\varphi_4$。') +
        readout([['阈值 c', f3(c)], ['能否完美分开', ok ? '能（$\\sqrt2<c<2$）' : '不能']]);
    }
    draw();
  });

  /* ---------------- c13/c14 · 2-D optimisers ---------------- */
  SML.viz.register('opt-2d', function (el, opts) {
    const ui = shell(el, '在等高线上走：GD / SGD / Newton');
    const meth = node('select');
    [['gd', 'Gradient descent'], ['sgd', 'SGD（梯度带噪声）'], ['newton', 'Newton–Raphson']].forEach((e) => { const o = node('option', null, e[1]); o.value = e[0]; meth.appendChild(o); });
    meth.value = opts.method || 'gd';
    ui.tools.append(meth, btn('走一步', () => step(1), 'btn primary'), btn('走 10 步', () => step(10)), btn('重来', reset));
    const r1 = row(ui.body);
    const eta = P().slider(r1, '学习率 η', { min: 0.01, max: 1.1, step: 0.01, value: opts.eta || 0.1 }, reset);
    const cond = P().slider(r1, '碗的"扁"程度', { min: 1, max: 20, step: 1, value: opts.cond || 8 }, reset);
    meth.addEventListener('change', reset);
    const box = node('div'); ui.body.appendChild(box);
    // L(θ) = ½ θ' H θ with H rotated by 30°, eigenvalues 1 and cond
    let path = [], H = null;
    function makeH() { const c = Math.cos(Math.PI / 6), s = Math.sin(Math.PI / 6), l1 = 1, l2 = +cond.value; return [[l1 * c * c + l2 * s * s, (l1 - l2) * c * s], [(l1 - l2) * c * s, l1 * s * s + l2 * c * c]]; }
    const Lf = (t) => 0.5 * (t[0] * (H[0][0] * t[0] + H[0][1] * t[1]) + t[1] * (H[1][0] * t[0] + H[1][1] * t[1]));
    const grad = (t) => [H[0][0] * t[0] + H[0][1] * t[1], H[1][0] * t[0] + H[1][1] * t[1]];
    function reset() { H = makeH(); path = [[-3.5, 2.5]]; draw(); }
    function step(k) {
      for (let i = 0; i < k; i++) {
        const t = path[path.length - 1], g = grad(t), E = +eta.value;
        let nx;
        if (meth.value === 'newton') { const det = H[0][0] * H[1][1] - H[0][1] * H[1][0]; const inv = [[H[1][1] / det, -H[0][1] / det], [-H[1][0] / det, H[0][0] / det]]; nx = [t[0] - (inv[0][0] * g[0] + inv[0][1] * g[1]), t[1] - (inv[1][0] * g[0] + inv[1][1] * g[1])]; }
        else if (meth.value === 'sgd') { const nz = () => (Math.random() - 0.5) * 2.2; nx = [t[0] - E * (g[0] + nz() * (1 + Math.abs(g[0]) * 0.4)), t[1] - E * (g[1] + nz() * (1 + Math.abs(g[1]) * 0.4))]; }
        else nx = [t[0] - E * g[0], t[1] - E * g[1]];
        if (!Number.isFinite(nx[0]) || Math.abs(nx[0]) > 1e6) break;
        path.push(nx);
      }
      draw();
    }
    function draw() {
      box.innerHTML = '';
      const pl = P().frame(box, { w: 420, h: 360, x: [-4.5, 4.5], y: [-4, 4], xlabel: 'θ₁', ylabel: 'θ₂', maxWidth: 460, margin: { l: 30, b: 26 } });
      [0.25, 1, 2.5, 5, 9, 15, 24].forEach((c) => {
        const pts = [];
        for (let i = 0; i <= 120; i++) { const a = i / 120 * 2 * Math.PI, u = [Math.cos(a), Math.sin(a)]; const q = Lf(u); const r = Math.sqrt(c / q); pts.push([u[0] * r, u[1] * r]); }
        pl.path(pts, 'curve thin prior', true);
      });
      pl.dot(0, 0, 5, 'pt ok');
      pl.path(path, 'curve bad');
      path.forEach((t, i) => pl.dot(t[0], t[1], i === path.length - 1 ? 5 : 3, 'pt hit'));
      const t = path[path.length - 1], g = grad(t);
      const lmax = +cond.value;
      ui.out.innerHTML = md('目标 $L(\\boldsymbol\\theta)=\\frac12\\boldsymbol\\theta\'\\mathbf H\\boldsymbol\\theta$（一个旋转过的碗，最低点在原点，Hessian $\\mathbf H$ 的特征值 1 和 ' + lmax + '）。GD 更新 $\\boldsymbol\\theta\\leftarrow\\boldsymbol\\theta-\\eta\\nabla L$；Newton 更新 $\\boldsymbol\\theta\\leftarrow\\boldsymbol\\theta-\\mathbf H^{-1}\\nabla L$。') +
        readout([['步数', path.length - 1], ['当前 $L$', f3(Lf(t))], ['$\\|\\nabla L\\|$', f3(Math.hypot(g[0], g[1]))], ['GD 稳定条件 $\\eta<2/\\lambda_{\\max}$', '$\\eta<' + f3(2 / lmax) + '$']]);
    }
    reset();
  });

  /* ---------------- c14 · 1-D Newton on L'(θ) (L04 p13–p15) ---------------- */
  SML.viz.register('newton-1d', function (el) {
    const ui = shell(el, 'Newton–Raphson：在 L′(θ) 上用切线找零点');
    ui.tools.append(btn('走一步', () => { if (ts.length < 8) { const t = ts[ts.length - 1]; ts.push(t - d1(t) / d2(t)); } draw(); }, 'btn primary'), btn('重来', () => { ts = [+st.value]; draw(); }));
    const st = P().slider(row(ui.body), '起点 θ₀', { min: 0.4, max: 3, step: 0.05, value: 2.6 }, () => { ts = [+st.value]; draw(); });
    const box = node('div'); ui.body.appendChild(box);
    // L(θ) = θ^4/4 − 2θ  ⇒ L' = θ^3 − 2, L'' = 3θ^2 ; minimiser θ* = 2^{1/3}
    const d1 = (t) => t * t * t - 2, d2 = (t) => 3 * t * t;
    let ts = [2.6];
    function draw() {
      box.innerHTML = '';
      const last = ts[ts.length - 1], next = last - d1(last) / d2(last);
      // Axis range grows to keep every iterate and the next intercept visible (a start near 0.4 jumps to ≈4.4).
      const xmax = Math.max(3.2, next, ...ts) * 1.05, ymax = Math.max(20, ...ts.map(d1), d1(next)) * 1.05;
      const pl = P().frame(box, { w: 520, h: 280, x: [0, xmax], y: [-3, ymax], xlabel: 'θ', ylabel: "L′(θ)" });
      pl.fn(d1, 'curve');
      for (let i = 0; i < ts.length - 1; i++) {
        const t = ts[i], n = ts[i + 1];
        pl.line(t, 0, t, d1(t), 'ref'); pl.line(t, d1(t), n, 0, 'tangent'); pl.dot(t, d1(t), 4, 'pt hit');
      }
      // Current point sits ON the curve at (θ_t, L′(θ_t)); its tangent previews the next step before "走一步".
      pl.line(last, 0, last, d1(last), 'ref'); pl.line(last, d1(last), next, 0, 'tangent');
      pl.dot(last, d1(last), 5, 'pt big'); pl.dot(next, 0, 3, 'pt');
      pl.dot(Math.cbrt(2), 0, 4, 'pt ok');
      ui.out.innerHTML = md('$L(\\theta)=\\frac{\\theta^4}{4}-2\\theta$，所以 $L\'(\\theta)=\\theta^3-2$，$L\'\'(\\theta)=3\\theta^2$。更新 $\\theta_{t+1}=\\theta_t-\\dfrac{L\'(\\theta_t)}{L\'\'(\\theta_t)}$：沿切线（红）滑到与横轴的交点。真正的最小点 $\\theta^*=\\sqrt[3]2\\approx1.26$（绿点）。') +
        readout(ts.map((t, i) => ['$\\theta_' + i + '$', f3(t)]));
    }
    draw();
  });

  /* ---------------- c15 · linear vs logistic on BMI-like data (L04 p20–p22) ---------------- */
  SML.viz.register('logistic-vs-linear', function (el) {
    const ui = shell(el, '分类：线性回归 vs logistic regression（L04 p20–p22）');
    const cb = node('label', null, '<input type="checkbox"> 加一个很远的正类点（outlier）'); const out = cb.querySelector('input');
    out.addEventListener('change', draw); ui.tools.appendChild(cb);
    const box = node('div'); ui.body.appendChild(box);
    const base = [[18, 0], [20, 0], [22, 0], [24, 0], [27, 1], [29, 1], [31, 1], [33, 1]];
    function fitLogistic(D) {
      let w0 = 0, w1 = 0; const m = D.reduce((s, d) => s + d[0], 0) / D.length;
      for (let it = 0; it < 4000; it++) { let g0 = 0, g1 = 0; D.forEach((d) => { const p = 1 / (1 + Math.exp(-(w0 + w1 * (d[0] - m)))); g0 += d[1] - p; g1 += (d[1] - p) * (d[0] - m); }); w0 += 0.05 * g0 - 0.001 * w0; w1 += 0.005 * g1 - 0.001 * w1; }
      return [w0 - w1 * m, w1];
    }
    function draw() {
      const D = base.concat(out.checked ? [[60, 1]] : []);
      const lin = lsq(D.map((d) => [1, d[0]]), D.map((d) => d[1]));
      const lg = fitLogistic(D);
      box.innerHTML = '';
      const pl = P().frame(box, { w: 540, h: 280, x: [15, 62], y: [-0.3, 1.4], xlabel: 'BMI', ylabel: 'P(y=1)' });
      pl.line(15, 0.5, 62, 0.5, 'ref');
      pl.fn((x) => lin[0] + lin[1] * x, 'curve bad');
      pl.fn((x) => 1 / (1 + Math.exp(-(lg[0] + lg[1] * x))), 'curve post', 300);
      D.forEach((d) => pl.dot(d[0], d[1], 5, 'pt ' + (d[1] ? 'pos' : 'neg')));
      const tLin = (0.5 - lin[0]) / lin[1], tLog = -lg[0] / lg[1];
      pl.line(tLin, -0.3, tLin, 1.4, 'ref r'); pl.line(tLog, -0.3, tLog, 1.4, 'ref g');
      const errs = (t) => D.filter((d) => (d[0] >= t ? 1 : 0) !== d[1]).length;
      box.appendChild(node('div', 'legend', '<span style="--c:var(--bad)">线性回归 + 阈值 0.5</span><span style="--c:var(--good)">logistic 曲线</span>'));
      ui.out.innerHTML = readout([['线性回归的分界 BMI', f3(tLin)], ['线性回归错分', errs(tLin) + ' 个'], ['logistic 的分界 BMI', f3(tLog)], ['logistic 错分', errs(tLog) + ' 个']]) +
        md(out.checked ? '远处那个点"分对了却离得很远"，平方损失 $(1-\\bx\'\\bw)^2$ 很大，把直线拉平，红色分界右移，错分了正类点。logistic 曲线在 1 附近饱和，几乎不受影响。' : '没有 outlier 时两者都能分开。勾选上方复选框看看会发生什么。');
    }
    draw();
  });

  /* sigmoid explorer */
  SML.viz.register('sigmoid-2d', function (el) {
    const ui = shell(el, 'Logistic 回归的决策边界：σ(w₁x₁+w₂x₂+b)');
    const r = row(ui.body);
    const w1 = P().slider(r, 'w₁', { min: -4, max: 4, step: 0.1, value: 1 }, draw);
    const w2 = P().slider(r, 'w₂', { min: -4, max: 4, step: 0.1, value: 2 }, draw);
    const b = P().slider(r, 'b', { min: -4, max: 4, step: 0.1, value: 0 }, draw);
    const box = node('div'); ui.body.appendChild(box);
    function draw() {
      box.innerHTML = '';
      const W1 = +w1.value, W2 = +w2.value, B = +b.value;
      const pl = P().frame(box, { w: 400, h: 360, x: [-3, 3], y: [-3, 3], maxWidth: 440, margin: { l: 30, b: 26 }, xlabel: 'x₁', ylabel: 'x₂' });
      const N = 24;
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
        const x = -3 + 6 * (i + 0.5) / N, y = -3 + 6 * (j + 0.5) / N, p = 1 / (1 + Math.exp(-(W1 * x + W2 * y + B)));
        const r2 = pl.rect(x - 3 / N, y - 3 / N, 6 / N, 6 / N, 'bar'); r2.style.fill = 'color-mix(in srgb, #c9463d ' + Math.round(p * 70) + '%, color-mix(in srgb, #3b78c4 ' + Math.round((1 - p) * 70) + '%, transparent))';
      }
      const nw = Math.hypot(W1, W2);
      if (nw > 1e-6) {
        if (Math.abs(W2) > 1e-6) pl.path([[-3, (-B + 3 * W1) / W2], [3, (-B - 3 * W1) / W2]], 'boundary'); else pl.path([[-B / W1, -3], [-B / W1, 3]], 'boundary');
        const fx = -B * W1 / (nw * nw), fy = -B * W2 / (nw * nw);
        pl.arrow(fx, fy, fx + W1 / nw, fy + W2 / nw, 'vec');
      }
      ui.out.innerHTML = md('颜色 = $P(y=1\\mid\\bx)=\\sigma(\\bw\'\\bx+b)$：越红越接近 1，越蓝越接近 0。绿线是 $P=0.5$ 的决策边界，也就是超平面 $\\bw\'\\bx+b=0$；红箭头是 $\\bw$ 的方向。把 $w_1,w_2,b$ 一起放大，边界不动，但颜色过渡变陡（模型更"自信"）；只放大 $w_1,w_2$ 且 $b\ne0$ 时边界会平移。');
    }
    draw();
  });
})(window);
