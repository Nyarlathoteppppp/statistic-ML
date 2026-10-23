/* Static figures (no controls): curves, regions and layouts the graph block cannot draw.
 * Use in a chapter as { t: 'viz', id: 'fig-…', opts: { caption: T`…` } }. Colours come from css/viz.css (svg.graph.fig). */
(function (root) {
  'use strict';
  const SML = root.SML;
  let uid = 0;

  // ---- tiny SVG string builders ----
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const T = (x, y, s, cls) => '<text class="lbl ' + (cls || '') + '" x="' + x + '" y="' + y + '">' + esc(s) + '</text>';
  const Rect = (x, y, w, h, cls) => '<rect class="blk ' + (cls || '') + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="3"/>';
  const Line = (x1, y1, x2, y2, cls, arrow) => '<line class="edge ' + (cls || '') + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"' + (arrow ? ' marker-end="url(#' + arrow + ')"' : '') + '/>';
  const n1 = (v) => (+v).toFixed(1);
  const Dot = (x, y, cls, r) => '<circle class="dot ' + (cls || '') + '" cx="' + n1(x) + '" cy="' + n1(y) + '" r="' + (r || 4.5) + '"/>';
  const Path = (pts, cls) => '<path class="' + cls + '" d="M' + pts.map((q) => n1(q[0]) + ',' + n1(q[1])).join(' L') + '"/>';
  const Box = (x, y, w, h, cls) => '<rect class="' + cls + '" x="' + n1(x) + '" y="' + n1(y) + '" width="' + n1(w) + '" height="' + n1(h) + '"/>';

  /* Plot axes. o = { x, y, w, h, xr: [a, b], yr: [c, d], xt / yt: ticks (value or [value, label]), xl, yl, grid, bottom }.
   * Returns { X, Y, s }: data → SVG coordinates, and the SVG of the frame. The x axis sits at y = 0 when 0 is in range, unless bottom. */
  function axes(o) {
    const X = (v) => o.x + (v - o.xr[0]) / (o.xr[1] - o.xr[0]) * o.w;
    const Y = (v) => o.y + o.h - (v - o.yr[0]) / (o.yr[1] - o.yr[0]) * o.h;
    const base = !o.bottom && o.yr[0] <= 0 && o.yr[1] >= 0 ? Y(0) : o.y + o.h;
    const left = o.xr[0] <= 0 && o.xr[1] >= 0 && o.yAtZero ? X(0) : o.x;
    let s = '';
    (o.xt || []).forEach((t) => {
      const v = Array.isArray(t) ? t[0] : t, l = Array.isArray(t) ? t[1] : t;
      if (o.grid) s += Line(n1(X(v)), o.y, n1(X(v)), o.y + o.h, 'grid');
      s += '<text class="tick" x="' + n1(X(v)) + '" y="' + n1(base + 13) + '">' + l + '</text>';
    });
    (o.yt || []).forEach((t) => {
      const v = Array.isArray(t) ? t[0] : t, l = Array.isArray(t) ? t[1] : t;
      if (o.grid) s += Line(o.x, n1(Y(v)), o.x + o.w, n1(Y(v)), 'grid');
      s += '<text class="tick end" x="' + n1(left - 6) + '" y="' + n1(Y(v)) + '">' + l + '</text>';
    });
    s += Line(o.x, n1(base), o.x + o.w, n1(base), 'ax') + Line(n1(left), o.y, n1(left), o.y + o.h, 'ax');
    if (o.xl) s += T(o.x + o.w, base + 30, o.xl, 'end');
    if (o.yl) s += T(left + 6, o.y - 8, o.yl, '');
    return { X: X, Y: Y, s: s };
  }
  // Sample f on [a, b] into SVG points.
  const samp = (A, f, a, b, n) => Array.from({ length: (n || 120) + 1 }, (_, i) => { const x = a + (b - a) * i / (n || 120); return [A.X(x), A.Y(f(x))]; });
  const curve = (A, f, a, b, cls, n) => Path(samp(A, f, a, b, n), 'ln ' + (cls || ''));
  // Region between f and g (g defaults to 0) on [a, b].
  function band(A, f, a, b, cls, g) {
    const top = samp(A, f, a, b), bot = samp(A, g || (() => 0), a, b).reverse();
    return Path(top.concat(bot), 'fl ' + (cls || '')) .replace('"/>', ' Z"/>');
  }

  // still(w, h, draw) returns a mount function; draw(arrowMarkerId) returns the SVG body.
  function still(w, h, draw) {
    return function (el, opts) {
      const mid = 'fg' + (++uid);
      const defs = '<defs><marker id="' + mid + 'k" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>';
      const f = document.createElement('figure');
      f.className = 'graph-fig';
      f.innerHTML = '<svg class="graph fig" viewBox="0 0 ' + w + ' ' + h + '" role="img">' + defs + draw(mid + 'k') + '</svg>';
      if (opts && opts.caption) {
        const c = document.createElement('figcaption');
        c.innerHTML = SML.md.inline(opts.caption);
        f.appendChild(c);
      }
      el.appendChild(f);
    };
  }

  /* c43 nested cross-validation: outer 5 folds (report), inner 4 folds inside one outer training set (choose C). */
  SML.viz.register('fig-nested-cv', still(680, 300, function (k) {
    const bw = 40, bh = 22, gap = 4;
    let s = T(150, 18, '外层 5 折：只负责最后打分', 'mid w');
    for (let r = 0; r < 5; r++) {
      const y = 36 + r * 30;
      s += T(40, y + bh / 2, '第 ' + (r + 1) + ' 轮', 'end');
      for (let c = 0; c < 5; c++) s += Rect(50 + c * (bw + gap), y, bw, bh, c === r ? 'te' : (r === 0 ? 'tr' : 'tr dim'));
    }
    // bracket over round 1's four training blocks
    const bx1 = 50 + bw + gap, bx2 = 50 + 5 * (bw + gap) - gap;
    s += '<path class="edge" d="M' + bx1 + ',32 L' + bx1 + ',28 L' + bx2 + ',28 L' + bx2 + ',32"/>';
    s += Line(bx2 + 6, 47, 372, 60, 'thin', k);
    s += T(150, 196, '每轮得 1 个分数，5 个分数取平均', 'mid w');
    s += T(150, 214, '= 报告出去的性能', 'mid');
    // inner folds
    s += T(510, 18, '内层：在第 1 轮的 4 块训练数据里再做 4 折', 'mid w');
    for (let r = 0; r < 4; r++) {
      const y = 36 + r * 30;
      s += T(370, y + bh / 2, '内 ' + (r + 1), 'end');
      for (let c = 0; c < 4; c++) s += Rect(380 + c * (bw + gap), y, bw, bh, c === r ? 'va' : 'tr');
      if (r === 0) s += T(560, y + bh / 2, '← 绿 = 验证块', '');
    }
    s += T(380, 168, '① 每个 C（0.1、1、10）都跑这 4 折，', '');
    s += T(380, 186, '　 平均验证误差最小的就是 Ĉ', '');
    s += T(380, 206, '② 用 Ĉ 在全部 4 块上重训一次', '');
    s += T(380, 226, '③ 在第 1 轮的橙色块上打分（它没参与挑 C）', '');
    s += T(380, 246, '每轮 4×3 + 1 = 13 个模型，5 轮共 65 个', 'w');
    // legend
    const lg = [['tr', '训练'], ['va', '内层验证（挑 C 用）'], ['te', '外层测试（只打分）']];
    lg.forEach((p, i) => { const x = 50 + i * 190; s += Rect(x, 274, 18, 14, p[0]) + T(x + 24, 281, p[1], ''); });
    return s;
  }));
  /* c48 UCB: solid bar = mean (exploit), light bar = bonus (explore); the top is Q. 2026 practice Q2 numbers. */
  SML.viz.register('fig-ucb-bars', still(720, 300, function () {
    const A = axes({ x: 60, y: 30, w: 340, h: 214, xr: [0.4, 3.6], yr: [0, 2.2], yt: [0, 0.5, 1, 1.5, 2], yl: 'Q = 平均 + bonus', grid: true });
    const arms = [[1, 64, 0.625, 0.375, '1.0'], [2, 16, 0.625, 0.75, '1.375'], [3, 4, 0.5, 1.5, '2.0']];
    let s = A.s, top = '';
    arms.forEach((a) => {
      const cx = A.X(a[0]), w = 64, q = a[2] + a[3];
      s += Box(cx - w / 2, A.Y(a[2]), w, A.Y(0) - A.Y(a[2]), 'bar c1');
      s += Box(cx - w / 2, A.Y(q), w, A.Y(a[2]) - A.Y(q), 'bar soft c1');
      top += T(cx, (A.Y(0) + A.Y(a[2])) / 2, String(a[2]), 'mid inv');
      top += T(cx, (A.Y(a[2]) + A.Y(q)) / 2, '+' + a[3], 'mid tc c1');
      top += Dot(cx, A.Y(q), 'c2', 5);
      if (a[0] < 3) top += T(cx + 10, A.Y(q) - 12, 'Q = ' + a[4], 'tc c2');
      top += T(cx, A.Y(0) + 14, '臂 ' + a[0], 'mid w') + T(cx, A.Y(0) + 30, 'N = ' + a[1], 'mid');
    });
    s += top + '<circle class="ring c2" cx="' + n1(A.X(3)) + '" cy="' + n1(A.Y(2)) + '" r="11"/>';
    s += T(A.X(3), A.Y(2) - 22, 'Q = 2.0 最高 ⇒ 拉臂 3', 'mid tc c2');
    const lx = 450;
    s += Box(lx, 40, 18, 14, 'bar c1') + T(lx + 26, 47, '实心 = 平均奖励（利用）', '');
    s += Box(lx, 64, 18, 14, 'bar soft c1') + T(lx + 26, 71, '浅色 = bonus √(2 ln t / N)（探索）', '');
    s += Dot(lx + 9, 95, 'c2', 5) + T(lx + 26, 95, '红点 = 顶端 = Q，比的是它', '');
    s += T(lx, 140, '臂 1、臂 2 平均一样（0.625），', '') + T(lx, 158, '臂 2 只拉了 16 次 ⇒ bonus 大一倍', '');
    s += T(lx, 192, '臂 3 平均最低，但只拉过 4 次，', '') + T(lx, 210, '最不确定 ⇒ bonus 1.5，顶端最高', '');
    s += T(lx, 244, 't = 85，2 ln t ≈ 9', 'w');
    return s;
  }));

  /* c27 slack: one axis y·f(x) reads off all cases of ξ = max(0, 1 − y f). */
  SML.viz.register('fig-slack-zones', still(660, 330, function () {
    const A = axes({ x: 70, y: 86, w: 540, h: 190, xr: [-1.6, 3.2], yr: [0, 2.8], xt: [-1, 0, 1, 2, 3], yt: [0, 1, 2], xl: 'yᵢ(w′xᵢ + b)', yl: 'ξᵢ' });
    const z = [[-1.6, 0, 'c2', '分错：ξ > 1', '越过了决策边界'], [0, 1, 'c4', '分对但进了 margin', '0 < ξ < 1'], [1, 3.2, 'c3', '分对且在 margin 外', 'ξ = 0']];
    let s = '';
    z.forEach((q) => {
      s += Box(A.X(q[0]), 14, A.X(q[1]) - A.X(q[0]), 40, 'fl ' + q[2]);
      s += Box(A.X(q[0]), A.Y(2.8), A.X(q[1]) - A.X(q[0]), A.Y(0) - A.Y(2.8), 'fl faint ' + q[2]);
      s += T((A.X(q[0]) + A.X(q[1])) / 2, 27, q[3], 'mid w tc ' + q[2]) + T((A.X(q[0]) + A.X(q[1])) / 2, 43, q[4], 'mid tc ' + q[2]);
    });
    s += A.s;
    [0, 1].forEach((v) => { s += Line(n1(A.X(v)), 10, n1(A.X(v)), n1(A.Y(0)), 'dash'); });
    s += curve(A, (x) => Math.max(0, 1 - x), -1.6, 3.2, 'c5');
    [[2, 0, 'ξ = 0', 0, -14], [0.6, 0.4, 'ξ = 0.4', 8, -14], [0, 1, 'ξ = 1：正好在决策边界上', 8, -16], [-1, 2, 'ξ = 2', 10, -12]].forEach((d) => {
      s += Dot(A.X(d[0]), A.Y(d[1]), 'c5') + T(A.X(d[0]) + d[3], A.Y(d[1]) + d[4], d[2], 'w');
    });
    s += T(A.X(1) + 6, 68, 'margin 线', '') + T(A.X(0) - 6, 68, '决策边界', 'end');
    return s;
  }));

  /* c31 perceptron loss max(0, −sy) vs hinge max(0, 1 − sy): same slope, hinge shifted right by 1. */
  SML.viz.register('fig-perceptron-hinge', still(620, 300, function () {
    const A = axes({ x: 60, y: 30, w: 400, h: 220, xr: [-2, 3], yr: [0, 3], xt: [-2, -1, 0, 1, 2, 3], yt: [0, 1, 2, 3], xl: 'z = s·y（s = w′x + b）', yl: 'loss' });
    let s = Box(A.X(0), A.Y(3), A.X(1) - A.X(0), A.Y(0) - A.Y(3), 'fl c1') + A.s;
    [0, 1].forEach((v) => { s += Line(n1(A.X(v)), A.Y(3), n1(A.X(v)), n1(A.Y(0)), 'dash'); });
    s += curve(A, (x) => Math.max(0, -x), -2, 3, 'c1 thick');
    s += curve(A, (x) => Math.max(0, 1 - x), -2, 3, 'c2');
    s += T(A.X(0), A.Y(3) - 10, '分对 / 分错', 'mid') + T(A.X(1), A.Y(3) - 10, 'margin 边界', 'mid');
    s += T((A.X(0) + A.X(1)) / 2, A.Y(2.3), 'perceptron', 'mid tc c1') + T((A.X(0) + A.X(1)) / 2, A.Y(2.3) + 16, '已经是 0', 'mid tc c1');
    s += T((A.X(0) + A.X(1)) / 2, A.Y(1.6), 'hinge', 'mid tc c2') + T((A.X(0) + A.X(1)) / 2, A.Y(1.6) + 16, '还在罚', 'mid tc c2');
    const lx = 480;
    s += Line(lx, 60, lx + 26, 60, 'ln c1 thick') + T(lx + 32, 60, 'perceptron', 'tc c1') + T(lx + 32, 77, 'max(0, −z)', '');
    s += Line(lx, 110, lx + 26, 110, 'ln c2') + T(lx + 32, 110, 'hinge (SVM)', 'tc c2') + T(lx + 32, 127, 'max(0, 1 − z)', '');
    s += T(lx, 175, '斜率都是 −1，', 'w') + T(lx, 193, 'hinge 整体右移 1：', 'w') + T(lx, 211, '要求 z ≥ 1 才不罚', '') + T(lx, 229, '多出来的就是 margin', '');
    return s;
  }));
  /* c05 bias vs variance as four targets: blue ring = average estimate, red dots = 8 repeated estimates. */
  SML.viz.register('fig-bv-dartboard', still(640, 470, function () {
    const U = [[0.9, 0.2], [-0.6, 0.7], [0.3, -0.9], [-0.8, -0.4], [0.5, 0.6], [-0.2, -0.6], [0.7, -0.3], [-0.5, 0.1]];
    const cells = [
      [160, 136, 0, 9, '低 bias + 低 variance', '无偏、抖得少（最好）'],
      [480, 136, 0, 34, '低 bias + 高 variance', '无偏、但抖得厉害'],
      [160, 332, 30, 9, '高 bias + 低 variance', '有偏、但抖得少'],
      [480, 332, 30, 34, '高 bias + 高 variance', '又偏又抖（最差）']];
    let s = T(320, 16, 'bias 看蓝圈离靶心多远，variance 看红点散得多开', 'mid w');
    s += '<path class="cross" d="M168,40 h12 M174,34 v12"/>' + T(186, 40, '靶心 = 真值 θ', '');
    s += Dot(290, 40, 'c2', 3.5) + T(298, 40, '8 次重复抽样的估计值', '');
    s += '<circle class="ring c1" cx="452" cy="40" r="6"/>' + T(462, 40, '8 个估计的平均', '');
    cells.forEach((c) => {
      const cx = c[0], cy = c[1], b = c[2], v = c[3];
      [68, 51, 34, 17].forEach((r) => { s += '<circle class="target" cx="' + cx + '" cy="' + cy + '" r="' + r + '"/>'; });
      s += '<path class="cross" d="M' + (cx - 7) + ',' + cy + ' h14 M' + cx + ',' + (cy - 7) + ' v14"/>';
      const pts = U.map((u) => [cx + b * 0.8 + u[0] * v, cy - b * 0.6 + u[1] * v]);
      pts.forEach((q) => { s += Dot(q[0], q[1], 'c2', 3.5); });
      const mx = pts.reduce((a, q) => a + q[0], 0) / 8, my = pts.reduce((a, q) => a + q[1], 0) / 8;
      s += '<circle class="ring c1" cx="' + n1(mx) + '" cy="' + n1(my) + '" r="6"/>';
      s += T(cx, cy + 84, c[4], 'mid w') + T(cx, cy + 100, c[5], 'mid');
    });
    s += T(160, 450, '左下：有偏，但 MSE = bias² + variance 可能比右上还小', 'mid tc c2');
    return s;
  }));

  /* c36 early stopping: training error keeps falling, validation error turns up; keep the weights at its minimum. */
  SML.viz.register('fig-early-stop', still(640, 300, function (k) {
    const tr = (x) => 0.15 + 0.75 * Math.exp(-x / 4), va = (x) => tr(x) + 0.08 + 0.0418 * x, xm = 6;
    const A = axes({ x: 60, y: 40, w: 440, h: 210, xr: [0, 20], yr: [0, 1.2], xt: [0, 5, 10, 15, 20], xl: 'epoch（训练轮数）', yl: 'loss' });
    let s = Box(A.X(xm), A.Y(1.2), A.X(20) - A.X(xm), A.Y(0) - A.Y(1.2), 'fl shade') + A.s;
    s += Line(n1(A.X(xm)), n1(A.Y(va(xm))), n1(A.X(xm)), n1(A.Y(0)), 'dash');
    s += curve(A, tr, 0, 20, 'c1') + curve(A, va, 0, 20, 'c2');
    s += Dot(A.X(xm), A.Y(va(xm)), 'c2', 6);
    s += T(A.X(xm), A.Y(va(xm)) - 34, '验证误差最低：停在这里', 'mid tc c2') + T(A.X(xm), A.Y(va(xm)) - 18, '保留这一轮的权重', 'mid');
    s += T(A.X(13), A.Y(1.12), '继续训练 → 过拟合', 'mid w');
    s += T(A.X(11), A.Y(va(11)) - 14, 'validation', 'mid tc c2') + T(A.X(11), A.Y(tr(11)) - 14, 'training', 'mid tc c1');
    s += '<path class="edge" d="M' + n1(A.X(18)) + ',' + n1(A.Y(tr(18)) - 6) + ' L' + n1(A.X(18)) + ',' + n1(A.Y(va(18)) + 8) + '" marker-end="url(#' + k + ')" marker-start="url(#' + k + ')"/>';
    s += T(A.X(18) - 8, (A.Y(tr(18)) + A.Y(va(18))) / 2, '差距越拉越大', 'end');
    const lx = 520;
    s += Line(lx, 70, lx + 24, 70, 'ln c1') + T(lx + 30, 70, 'training error', 'tc c1');
    s += Line(lx, 94, lx + 24, 94, 'ln c2') + T(lx + 30, 94, 'validation error', 'tc c2');
    s += T(lx, 140, '训练误差一直降，', '') + T(lx, 158, '看它没用；', '') + T(lx, 182, '要看验证误差', 'w') + T(lx, 200, '什么时候转头向上', 'w');
    return s;
  }));

  /* c24 SRM: empirical risk falls, VC penalty rises with class complexity; the bound is U-shaped. */
  SML.viz.register('fig-srm', still(720, 310, function () {
    const emp = (x) => 0.1 + 0.8 * Math.exp(-x / 2.2), pen = (x) => 0.035 * Math.pow(x, 1.4), pen2 = (x) => 0.5 * pen(x);
    const argmin = (f) => { let b = 0, bv = Infinity; for (let x = 0; x <= 10; x += 0.01) { const v = f(x); if (v < bv) { bv = v; b = x; } } return b; };
    const m1 = argmin((x) => emp(x) + pen(x)), m2 = argmin((x) => emp(x) + pen2(x));
    const A = axes({ x: 60, y: 30, w: 440, h: 220, xr: [0, 10], yr: [0, 1.2], xt: [[0.6, '简单（VC 小）'], [9.4, '复杂（VC 大）']], yl: '风险（的上界）' });
    let s = A.s;
    s += curve(A, pen2, 0, 10, 'c1 dashed') + curve(A, (x) => emp(x) + pen2(x), 0, 10, 'c4 dashed');
    s += curve(A, emp, 0, 10, 'c5') + curve(A, pen, 0, 10, 'c1') + curve(A, (x) => emp(x) + pen(x), 0, 10, 'c4');
    s += Line(n1(A.X(m1)), n1(A.Y(emp(m1) + pen(m1))), n1(A.X(m1)), n1(A.Y(0)), 'dash') + Dot(A.X(m1), A.Y(emp(m1) + pen(m1)), 'c4', 5.5);
    s += Dot(A.X(m2), A.Y(emp(m2) + pen2(m2)), 'c4', 4);
    s += T(A.X(m1), A.Y(0) + 14, 'SRM 选这里', 'mid tc c4');
    s += T(A.X(1.1), A.Y(emp(1.1)) - 12, '训练误差', 'tc c5');
    s += T(A.X(8.6), A.Y(pen(8.6)) + 14, 'VC 惩罚', 'end tc c1');
    s += T(A.X(8.8), A.Y(emp(8.8) + pen(8.8)) - 12, '两者之和（界）', 'end tc c4');
    s += T(A.X(9.9), A.Y(pen2(9.9)) + 14, 'n 变大', 'end tc c1');
    const lx = 520;
    s += T(lx, 60, '简单类：训练误差大，', '') + T(lx, 78, '惩罚小', '');
    s += T(lx, 110, '复杂类：训练误差小，', '') + T(lx, 128, '惩罚大', '');
    s += T(lx, 166, '虚线 = 样本更多（n 大）：', 'w') + T(lx, 184, '惩罚整体变小，和的最低点', '') + T(lx, 202, '右移 ⇒ 承担得起更复杂的类', '');
    return s;
  }));

  /* c29 RBF kernel width: K = exp(−γ d²) against distance d for three γ. */
  SML.viz.register('fig-rbf-gamma', still(700, 290, function () {
    const A = axes({ x: 60, y: 30, w: 400, h: 200, xr: [0, 4], yr: [0, 1.05], xt: [0, 1, 2, 3, 4], yt: [0, 0.5, 1], xl: 'd = ‖u − v‖（两点距离）', yl: 'K = exp(−γ d²)', grid: true });
    const G = [[0.1, 'c1', 'γ = 0.1：很宽'], [1, 'c4', 'γ = 1'], [10, 'c2', 'γ = 10：很窄']];
    let s = A.s + Line(n1(A.X(1)), A.Y(1.05), n1(A.X(1)), n1(A.Y(0)), 'dash');
    G.forEach((g) => { s += curve(A, (d) => Math.exp(-g[0] * d * d), 0, 4, g[1], 200); });
    s += Dot(A.X(0), A.Y(1), '', 5);
    G.forEach((g) => { s += Dot(A.X(1), A.Y(Math.exp(-g[0])), g[1], 4.5); });
    s += T(A.X(1) + 8, A.Y(Math.exp(-0.1)) - 10, '0.90', 'tc c1') + T(A.X(1) + 8, A.Y(Math.exp(-1)) - 2, '0.37', 'tc c4') + T(A.X(1) + 8, A.Y(0) - 10, '≈ 0', 'tc c2');
    s += T(A.X(3.1), A.Y(Math.exp(-0.1 * 9.61)) - 12, 'γ = 0.1：很宽', 'tc c1');
    s += T(A.X(1.6), A.Y(Math.exp(-1 * 2.56)) - 12, 'γ = 1', 'tc c4');
    s += T(A.X(0.42), A.Y(0.17), 'γ = 10：很窄', 'tc c2');
    const lx = 480;
    s += T(lx, 60, 'γ 是「多近才算像」的旋钮', 'w');
    s += T(lx, 90, 'γ 越大 → 钟形越窄 →', '') + T(lx, 108, '只有很近的点 K 才不为 0', '');
    s += T(lx, 140, '虚线 d = 1 处读三个 K：', '') + T(lx, 158, '0.90、0.37、0.00005', '');
    s += T(lx, 192, 'K 只看 γ·d²：c29 例子', '') + T(lx, 210, 'γ = 0.5、d² = 2 ⇒ γd² = 1，', '') + T(lx, 228, '和 γ = 1、d = 1 一样是 0.37', '');
    return s;
  }));
  /* c13 convexity: chord above the curve (convex) vs chord dipping under a hump (non-convex). */
  SML.viz.register('fig-convex', still(660, 290, function () {
    const A = axes({ x: 40, y: 50, w: 250, h: 180, xr: [-2, 2], yr: [-0.3, 4.2] });
    const f = (x) => x * x, a = -1.5, b = 1;
    let s = T(165, 16, '凸：碗形', 'mid w tc c3') + A.s + curve(A, f, -2, 2, 'c3');
    s += Line(n1(A.X(a)), n1(A.Y(f(a))), n1(A.X(b)), n1(A.Y(f(b))), 'ln c4 dashed');
    s += Dot(A.X(a), A.Y(f(a)), 'c4') + Dot(A.X(b), A.Y(f(b)), 'c4') + T(A.X(a) - 8, A.Y(f(a)), 'a', 'end') + T(A.X(b) + 8, A.Y(f(b)), 'b', '');
    s += T(A.X(-0.25), A.Y(2.35), '弦在曲线上方', 'mid tc c4');
    s += Dot(A.X(0), A.Y(0), 'c3', 5) + T(A.X(0), A.Y(0) + 14, '唯一的最低点 = 全局最小', 'mid');
    const B = axes({ x: 380, y: 50, w: 250, h: 180, xr: [-1.7, 1.7], yr: [-0.8, 3.4] });
    const g = (x) => x ** 4 - 2 * x * x + 0.4 * x + 1, p = -1.05, q = 0.95;
    s += T(505, 16, '非凸：有两个谷', 'mid w tc c2') + B.s + curve(B, g, -1.7, 1.7, 'c2');
    s += Line(n1(B.X(p)), n1(B.Y(g(p))), n1(B.X(q)), n1(B.Y(g(q))), 'ln c4 dashed');
    s += Dot(B.X(p), B.Y(g(p)), 'c4') + Dot(B.X(q), B.Y(g(q)), 'c4');
    s += T(B.X(0.05), B.Y(1.55), '弦跑到曲线下方', 'mid tc c4') + T(B.X(0.05), B.Y(1.55) + 16, '⇒ 不是凸函数', 'mid tc c4');
    s += T(B.X(p), B.Y(g(p)) + 16, '全局最小', 'mid') + T(B.X(q) - 2, B.Y(g(q)) + 18, '局部最小', '') + T(B.X(q) - 2, B.Y(g(q)) + 34, 'GD 可能卡这', '');
    return s;
  }));

  /* c28 one-dimensional KKT: minimise (x − 3)² subject to x ≤ 1. */
  SML.viz.register('fig-kkt-1d', still(730, 300, function () {
    const f = (x) => (x - 3) * (x - 3);
    const A = axes({ x: 50, y: 30, w: 420, h: 220, xr: [-0.3, 4], yr: [0, 11], xt: [0, 1, 2, 3, 4], yt: [0, 4, 8], xl: 'x', yl: 'f(x) = (x − 3)²' });
    let s = Box(A.X(-0.3), A.Y(11), A.X(1) - A.X(-0.3), A.Y(0) - A.Y(11), 'fl faint c3') + Box(A.X(1), A.Y(11), A.X(4) - A.X(1), A.Y(0) - A.Y(11), 'fl faint c2');
    s += T(A.X(0.35), A.Y(10.3), '可行：x ≤ 1', 'mid tc c3') + T(A.X(2.5), A.Y(10.3), '不可行：x > 1', 'mid tc c2');
    s += A.s + Line(n1(A.X(1)), A.Y(11), n1(A.X(1)), n1(A.Y(0)), 'dash');
    s += curve(A, f, -0.3, 4, 'c1');
    s += Line(n1(A.X(0.45)), n1(A.Y(4 + 4 * 0.55)), n1(A.X(1.5)), n1(A.Y(4 - 4 * 0.5)), 'ln c2');
    s += Dot(A.X(1), A.Y(4), 'c1', 6) + T(A.X(1) - 10, A.Y(4) + 4, '最优 x* = 1', 'end w');
    s += T(A.X(1.1), A.Y(1.5), '切线斜率', 'tc c2') + T(A.X(1.1), A.Y(1.5) + 16, 'f′(1) = −4', 'tc c2');
    s += '<path class="cross" d="M' + n1(A.X(3) - 6) + ',' + n1(A.Y(0) - 6) + ' l12,12 m0,-12 l-12,12"/>';
    s += T(A.X(3), A.Y(3.4), '无约束最低点 x = 3', 'mid') + T(A.X(3), A.Y(3.4) + 17, '但违反 x ≤ 1', 'mid');
    const lx = 490;
    s += T(lx, 50, '边界把解挡在 x = 1：', 'w');
    s += T(lx, 72, '这里 f 还想往右下滑（斜率 −4），', '') + T(lx, 90, '约束用力 λ 把它推回来。', '');
    s += T(lx, 124, 'L = f + λ(x − 1) 的导数为 0：', 'w') + T(lx, 146, 'f′(1) + λ = −4 + λ = 0', '') + T(lx, 164, '⇒ λ* = 4，正好抵消斜率', 'tc c2');
    s += T(lx, 198, '如果最低点本来就合法，', '') + T(lx, 216, '约束不用出力：λ = 0', '') + T(lx, 234, '（这就是互补松弛）', '');
    return s;
  }));

  /* c47 regret by arm: each pull of arm i loses gap_i = μ* − μ_i. Numbers from the chapter's worked example. */
  SML.viz.register('fig-regret-gap', still(700, 300, function (k) {
    const arms = [[0.2, 2, 'c2'], [0.5, 3, 'c4'], [0.7, 5, 'c3']], sd = 0.07;
    const A = axes({ x: 40, y: 50, w: 420, h: 190, xr: [0, 1], yr: [0, 6.6], xt: [0, 0.2, 0.5, 0.7, 1], xl: '一次拉臂得到的奖励', yl: '' });
    let s = A.s;
    arms.forEach((a, i) => {
      const pdf = (x) => Math.exp(-0.5 * ((x - a[0]) / sd) ** 2) / (sd * Math.sqrt(2 * Math.PI));
      s += band(A, pdf, Math.max(0, a[0] - 0.3), Math.min(1, a[0] + 0.3), 'faint ' + a[2]) + curve(A, pdf, Math.max(0, a[0] - 0.3), Math.min(1, a[0] + 0.3), a[2]);
      s += Line(n1(A.X(a[0])), n1(A.Y(0)), n1(A.X(a[0])), n1(A.Y(5.9)), 'ln thin ' + a[2]);
      s += i === 2 ? T(A.X(a[0]) - 4, A.Y(6.25), '臂 3：μ* = 0.7（最好）', 'tc ' + a[2]) : T(A.X(a[0]), A.Y(6.25), '臂 ' + (i + 1) + '：μ = ' + a[0], 'mid tc ' + a[2]);
    });
    const yg = [3.6, 2.3];
    [[0.2, 0.5, '0.5'], [0.5, 0.2, '0.2']].forEach((g, i) => {
      const y = A.Y(yg[i]);
      s += Line(n1(A.X(g[0]) + 3), n1(y), n1(A.X(0.7) - 3), n1(y), 'edge', k) + T((A.X(g[0]) + A.X(0.7)) / 2, y - 10, 'gap = ' + g[2], 'mid w');
    });
    const lx = 490;
    s += T(lx, 46, '拉一次臂 i，就比「每次都拉', '') + T(lx, 64, '最好臂」少赚 gapᵢ = μ* − μᵢ', 'w');
    s += T(lx, 104, '例：三个臂拉了 2、3、5 次', '');
    s += T(lx, 128, '臂 1：2 × 0.5 = 1.0', 'tc c2') + T(lx, 148, '臂 2：3 × 0.2 = 0.6', 'tc c4') + T(lx, 168, '臂 3：5 × 0 = 0', 'tc c3');
    s += T(lx, 196, 'regret = Σ Nᵢ × gapᵢ = 1.6', 'w');
    s += T(lx, 226, '差得越远的臂，每拉一次', '') + T(lx, 244, '亏得越多；拉最好臂不亏', '');
    return s;
  }));

  /* c17 regularisation path for one weight (x′x = 14, x′y = 28): ridge only shrinks, lasso hits exactly 0 at λ = 56. */
  SML.viz.register('fig-ridge-lasso-path', still(700, 290, function () {
    const r = (l) => 28 / (14 + l), la = (l) => Math.max(28 - l / 2, 0) / 14;
    const A = axes({ x: 50, y: 30, w: 420, h: 210, xr: [0, 100], yr: [0, 2.2], xt: [0, 14, 56, 100], yt: [0, 0.5, 1, 1.5, 2], xl: 'λ（正则化强度）', yl: '学到的 w', grid: true });
    let s = A.s + curve(A, r, 0, 100, 'c1') + curve(A, la, 0, 100, 'c2', 400);
    [[0, 2, 2], [14, 1, 1.5], [56, 0.4, 0], [100, 0.246, 0]].forEach((q) => {
      s += Dot(A.X(q[0]), A.Y(q[1]), 'c1') + Dot(A.X(q[0]), A.Y(q[2]), 'c2');
    });
    s += T(A.X(14) + 8, A.Y(1) + 12, '1', 'tc c1') + T(A.X(14) + 8, A.Y(1.5) - 10, '1.5', 'tc c2');
    s += T(A.X(56), A.Y(0.4) - 12, '0.4', 'mid tc c1') + T(A.X(100) - 4, A.Y(0.246) - 12, '0.246', 'end tc c1');
    s += T(A.X(56) + 6, A.Y(0) - 12, 'λ = 56：lasso 恰好 = 0', 'tc c2');
    s += T(A.X(80), A.Y(0.62), 'ridge：越来越小，但永远不到 0', 'mid tc c1');
    s += T(A.X(36), A.Y(1.2), 'lasso：分子减掉 λ/2，减到 0 就停', 'tc c2');
    const lx = 490;
    s += T(lx, 50, '正文例子：x′x = 14，x′y = 28', 'w');
    s += T(lx, 76, 'ridge  w = 28 / (14 + λ)', 'tc c1') + T(lx, 96, '→ 只是除以更大的数', '');
    s += T(lx, 124, 'lasso  w = max(28 − λ/2, 0) / 14', 'tc c2') + T(lx, 144, '→ 减成 0 后就一直是 0', '');
    s += T(lx, 184, '一维规律：|x′y| ≤ λ/2 时', '') + T(lx, 202, 'lasso 的 w 恰好为 0', 'w') + T(lx, 220, '（特征被扔掉 = 稀疏）', '');
    return s;
  }));
  /* c20 the 8 fixed classifiers of L06 on the 4-point example, one small panel each (sgn(0) = −1). */
  SML.viz.register('fig-classifiers8', still(700, 430, function () {
    const pts = [[1, 2, 1], [2, -1, 1], [-1, 1, -1], [-2, -1, -1]], L = 2.6, size = 130;
    const rules = [[[1, 0], 'sgn(x₁)'], [[0, 1], 'sgn(x₂)'], [[1, 1], 'sgn(x₁+x₂)'], [[1, -1], 'sgn(x₁−x₂)'],
      [[-1, 0], 'sgn(−x₁)'], [[0, -1], 'sgn(−x₂)'], [[-1, -1], 'sgn(−x₁−x₂)'], [[-1, 1], 'sgn(−x₁+x₂)']];
    // the half of the square [−L, L]² where w·x > 0 (Sutherland–Hodgman against one line)
    function half(w) {
      const sq = [[-L, -L], [L, -L], [L, L], [-L, L]], out = [], d = (q) => w[0] * q[0] + w[1] * q[1];
      sq.forEach((a, i) => {
        const b = sq[(i + 1) % 4], da = d(a), db = d(b);
        if (da >= 0) out.push(a);
        if ((da >= 0) !== (db >= 0)) { const t = da / (da - db); out.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]); }
      });
      return out;
    }
    let s = '';
    rules.forEach((r, k) => {
      const ox = 30 + (k % 4) * 168, oy = 34 + Math.floor(k / 4) * 196;
      const X = (v) => ox + (v + L) / (2 * L) * size, Y = (v) => oy + (L - v) / (2 * L) * size;
      const wrong = pts.filter((q) => (r[0][0] * q[0] + r[0][1] * q[1] > 0 ? 1 : -1) !== q[2]).length;
      s += Box(ox, oy, size, size, 'frame' + (wrong === 0 ? ' best' : ''));
      s += Path(half(r[0]).map((q) => [X(q[0]), Y(q[1])]), 'fl c1').replace('"/>', ' Z"/>');
      s += Line(X(-L), n1(Y(0)), X(L), n1(Y(0)), 'grid') + Line(n1(X(0)), Y(L), n1(X(0)), Y(-L), 'grid');
      const w = r[0], e = w[1] === 0 ? [[0, -L], [0, L]] : w[0] === 0 ? [[-L, 0], [L, 0]] : [[-L, L * w[0] / w[1]], [L, -L * w[0] / w[1]]];
      s += Line(n1(X(e[0][0])), n1(Y(e[0][1])), n1(X(e[1][0])), n1(Y(e[1][1])), 'ln ' + (wrong === 0 ? 'c3' : ''));
      pts.forEach((q) => {
        const pred = w[0] * q[0] + w[1] * q[1] > 0 ? 1 : -1;
        s += q[2] > 0 ? Dot(X(q[0]), Y(q[1]), 'c1', 5) : Box(X(q[0]) - 4.5, Y(q[1]) - 4.5, 9, 9, 'bar c2');
        if (pred !== q[2]) s += '<circle class="ring c4" cx="' + n1(X(q[0])) + '" cy="' + n1(Y(q[1])) + '" r="10"/>';
      });
      s += T(ox + size / 2, oy - 12, r[1], 'mid w');
      s += T(ox + size / 2, oy + size + 14, '错 ' + wrong + ' 个' + (wrong === 0 ? '：ERM 可选' : ''), 'mid' + (wrong === 0 ? ' tc c3' : ''));
    });
    s += Dot(40, 418, 'c1', 5) + T(50, 418, '标签 +1', '') + Box(115.5, 413.5, 9, 9, 'bar c2') + T(130, 418, '标签 −1', '');
    s += Box(196, 412, 16, 12, 'fl c1') + T(218, 418, '判成 +1 的一侧', '');
    s += '<circle class="ring c4" cx="330" cy="418" r="8"/>' + T(342, 418, '判错的点', '');
    s += T(420, 418, '上下两行同一条线、方向相反', '');
    return s;
  }));

  /* c10 the RSS bowl seen through two slices: RSS(a, b*) and RSS(a*, b) are parabolas with flat bottoms. */
  SML.viz.register('fig-rss-slices', still(700, 290, function () {
    const W = [[85, 85], [80, 90], [83, 86], [70, 96], [68, 80], [65, 70], [64, 65], [72, 95], [69, 70], [75, 80]];
    const a0 = 25.2992, b0 = 0.7716, rss = (a, b) => W.reduce((t, q) => t + (q[1] - a - b * q[0]) ** 2, 0), r0 = rss(a0, b0);
    const A = axes({ x: 60, y: 40, w: 240, h: 190, xr: [17, 34], yr: [560, 1500], xt: [20, [25.3, '25.3'], 30], yt: [700, 1000, 1300], xl: '截距 a', yl: 'RSS' });
    const B = axes({ x: 420, y: 40, w: 240, h: 190, xr: [0.65, 0.89], yr: [560, 1500], xt: [0.7, [0.7716, '0.77'], 0.85], yt: [700, 1000, 1300], xl: '斜率 b', yl: 'RSS' });
    let s = A.s + B.s;
    s += T(180, 16, '固定 b = 0.77，只动 a', 'mid w') + T(540, 16, '固定 a = 25.3，只动 b', 'mid w');
    s += curve(A, (a) => rss(a, b0), 17, 34, 'c1') + curve(B, (b) => rss(a0, b), 0.65, 0.89, 'c1');
    s += Line(n1(A.X(22)), n1(A.Y(r0)), n1(A.X(28.6)), n1(A.Y(r0)), 'ln c2') + Dot(A.X(a0), A.Y(r0), 'c2', 5);
    s += Line(n1(B.X(0.735)), n1(B.Y(r0)), n1(B.X(0.808)), n1(B.Y(r0)), 'ln c2') + Dot(B.X(b0), B.Y(r0), 'c2', 5);
    s += T(A.X(a0), A.Y(r0) + 22, '碗底：∂RSS/∂a = 0', 'mid tc c2') + T(B.X(b0), B.Y(r0) + 22, '碗底：∂RSS/∂b = 0', 'mid tc c2');
    s += T(A.X(a0), A.Y(1420), '最小 RSS ≈ 744.7', 'mid') + T(B.X(b0), B.Y(1420), '同一个最低点', 'mid');
    return s;
  }));

  /* c49 MAB → contextual bandit → RL: each step adds one thing. */
  SML.viz.register('fig-bandit-ladder', still(720, 245, function (k) {
    const bx = (x, y, w, t, cls) => Box(x, y, w, 30, 'node-box ' + (cls || '')) + T(x + w / 2, y + 15, t, 'mid w');
    const ar = (x1, y1, x2, y2, cls) => Line(n1(x1), n1(y1), n1(x2), n1(y2), 'edge ' + (cls || ''), k);
    let s = '';
    // ① MAB
    s += T(110, 18, '① 多臂老虎机 MAB', 'mid w');
    s += bx(30, 80, 70, '选一个臂') + ar(100, 95, 140, 95) + bx(142, 80, 66, '奖励 r');
    s += T(110, 150, '没有状态：', 'mid') + T(110, 168, '每一轮的情况都一样', 'mid');
    s += T(110, 212, '学：每个臂的平均奖励', 'mid tc c1');
    // ② contextual bandit
    const o = 245;
    s += T(o + 110, 18, '② 上下文老虎机', 'mid w');
    s += bx(o, 80, 64, '上下文 x') + ar(o + 64, 95, o + 84, 95) + bx(o + 86, 80, 56, '选臂') + ar(o + 142, 95, o + 162, 95) + bx(o + 164, 80, 56, '奖励 r');
    s += ar(o + 32, 44, o + 32, 78, 'dashed') + T(o + 40, 52, '下一轮的 x 自己来，', '') + T(o + 40, 68, '和你选哪个臂无关', '');
    s += T(o + 110, 150, '多了上下文：', 'mid') + T(o + 110, 168, '奖励随用户、网页变', 'mid');
    s += T(o + 110, 212, '学：从上下文回归奖励', 'mid tc c1');
    // ③ RL
    const q = 490;
    s += T(q + 115, 18, '③ 强化学习 RL', 'mid w');
    s += bx(q, 80, 64, '状态 s') + ar(q + 64, 95, q + 84, 95) + bx(q + 86, 80, 56, '动作') + ar(q + 142, 95, q + 162, 95) + bx(q + 164, 80, 56, '奖励 r');
    s += ar(q + 114, 110, q + 114, 128, 'red') + bx(q + 70, 130, 88, '下一个状态', 'hot');
    s += T(q + 66, 145, '由动作决定 →', 'end tc c2');
    s += T(q + 115, 186, '动作会改变以后的状态', 'mid');
    s += T(q + 115, 212, '学：value function，', 'mid tc c1') + T(q + 115, 230, '要把奖励往未来展开', 'mid tc c1');
    return s;
  }));

  /* c50 Workshop 11 (seed 1, 8 points, σ = 0.1, γ = 10): posterior mean ± 2 predictive sd for degree 1, 2, 9. */
  SML.viz.register('fig-evidence-fits', still(720, 320, function (k) {
    const X = [0.417022, 0.720324, 0.000114, 0.302333, 0.146756, 0.092339, 0.18626, 0.345561];
    const Y = [0.120968, 0.012561, 1.423909, 0.119241, 0.655811, 0.806002, 0.638374, -0.086757];
    const sigma = 0.1, gamma = 10;
    function inv(M) { // Gauss–Jordan with partial pivoting
      const n = M.length, A = M.map((r, i) => r.concat(Array.from({ length: n }, (_, j) => +(i === j))));
      for (let c = 0; c < n; c++) {
        let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
        [A[c], A[p]] = [A[p], A[c]];
        const d = A[c][c]; for (let j = 0; j < 2 * n; j++) A[c][j] /= d;
        for (let r = 0; r < n; r++) if (r !== c) { const f = A[r][c]; for (let j = 0; j < 2 * n; j++) A[r][j] -= f * A[c][j]; }
      }
      return A.map((r) => r.slice(n));
    }
    function fit(deg) {
      const phi = (x) => Array.from({ length: deg + 1 }, (_, j) => Math.pow(x, j)), P = X.map(phi), m = deg + 1;
      const G = Array.from({ length: m }, (_, i) => Array.from({ length: m }, (_, j) => P.reduce((t, r) => t + r[i] * r[j], 0) + (i === j ? (sigma / gamma) ** 2 : 0)));
      const V = inv(G).map((r) => r.map((v) => v * sigma * sigma));
      const py = Array.from({ length: m }, (_, i) => P.reduce((t, r, n) => t + r[i] * Y[n], 0));
      const w = V.map((r) => r.reduce((t, v, j) => t + v * py[j], 0) / (sigma * sigma));
      const mean = (x) => phi(x).reduce((t, v, j) => t + v * w[j], 0);
      const sd = (x) => { const f = phi(x); return Math.sqrt(sigma * sigma + f.reduce((t, a, i) => t + a * V[i].reduce((u, b, j) => u + b * f[j], 0), 0)); };
      return { mean: mean, sd: sd };
    }
    const panels = [[1, '1 次多项式', '0.614', '−29.40', ''], [2, '2 次多项式', '0.083', '−5.75', 'ev'], [9, '9 次多项式', '0.071', '−7.21', 'rss']];
    let s = T(360, 16, '训练 RSS 最小 ≠ 最好：选 evidence 最大的', 'mid w');
    panels.forEach((pn, i) => {
      const ox = 30 + i * 235, id = k + 'clip' + i;
      const A = axes({ x: ox, y: 40, w: 200, h: 180, xr: [0, 1], yr: [-1, 2.5], xt: [0, 0.5, 1], yt: i === 0 ? [0, 1, 2] : [] });
      const F = fit(pn[0]);
      s += '<clipPath id="' + id + '"><rect x="' + ox + '" y="40" width="200" height="180"/></clipPath>';
      s += '<g clip-path="url(#' + id + ')">' + band(A, (x) => F.mean(x) + 2 * F.sd(x), 0, 1, 'c3', (x) => F.mean(x) - 2 * F.sd(x));
      s += curve(A, (x) => 5 * (x - 0.5) ** 2, 0, 1, 'dashed') + curve(A, F.mean, 0, 1, 'c3', 300) + '</g>';
      s += A.s;
      X.forEach((x, n) => { s += Dot(A.X(x), A.Y(Y[n]), 'c1', 4); });
      s += T(ox + 100, 236, pn[1], 'mid w');
      s += T(ox + 100, 258, '训练 RSS ' + pn[2], 'mid' + (pn[4] === 'rss' ? ' tc c2' : '')) + T(ox + 100, 278, 'log evidence ' + pn[3], 'mid' + (pn[4] === 'ev' ? ' tc c2' : ''));
      if (pn[4] === 'ev') s += Box(ox + 26, 268, 148, 20, 'pick') + T(ox + 100, 302, '最大 ⇒ 选它', 'mid tc c2');
      if (pn[4] === 'rss') s += T(ox + 100, 302, 'RSS 最小，但没点的地方乱冲、带子爆宽', 'mid tc c2');
    });
    return s;
  }));
  /* c03 distance from a point to the line w′x + b = 0 with w = (1, 1), b = −2. */
  SML.viz.register('fig-hyperplane-dist', still(720, 320, function (k) {
    const A = axes({ x: 40, y: 20, w: 300, h: 280, xr: [-0.5, 4], yr: [-0.5, 3.7], yAtZero: true });
    const P = [3, 2.5], Q = [1.25, 0.75], N = [0.3, 0.4], u = Math.SQRT1_2;
    let s = A.s + Line(n1(A.X(-0.5)), n1(A.Y(2.5)), n1(A.X(2.5)), n1(A.Y(-0.5)), 'ln c3');
    s += T(A.X(2.55), A.Y(-0.25), 'x₁ + x₂ − 2 = 0', 'tc c3');
    s += Line(n1(A.X(P[0])), n1(A.Y(P[1])), n1(A.X(Q[0])), n1(A.Y(Q[1])), 'ln c2 dashed');
    // right-angle mark at Q
    const m = 0.16, a1 = [Q[0] + m * u, Q[1] + m * u], a2 = [Q[0] + m * u - m * u, Q[1] + m * u + m * u], a3 = [Q[0] - m * u, Q[1] + m * u];
    s += Path([a1, a2, a3].map((q) => [A.X(q[0]), A.Y(q[1])]), 'ax');
    s += Line(n1(A.X(0.3)), n1(A.Y(1.7)), n1(A.X(0.95)), n1(A.Y(2.35)), 'edge c4w', k) + T(A.X(0.95) - 6, A.Y(2.35) - 12, '法向量 w = (1, 1)', 'mid tc c4');
    s += Dot(A.X(P[0]), A.Y(P[1]), 'c2', 6) + T(A.X(P[0]) + 10, A.Y(P[1]) - 6, 'x = (3, 2.5)', 'tc c2');
    s += Dot(A.X(Q[0]), A.Y(Q[1]), '', 4) + T(A.X(Q[0]) + 10, A.Y(Q[1]) + 12, '垂足', '');
    s += T(A.X(2.55), A.Y(1.35), '距离 2.47', 'tc c2');
    s += Dot(A.X(N[0]), A.Y(N[1]), 'c1', 6) + T(A.X(N[0]) + 10, A.Y(N[1]) + 2, '(0.3, 0.4)', 'tc c1');
    s += T(A.X(3.1), A.Y(3.35), '正侧：w′x + b > 0', 'mid tc c2') + T(A.X(0.55), A.Y(-0.25), '负侧', 'mid tc c1');
    const lx = 370;
    s += T(lx, 34, '① 代入：w′x + b = 3 + 2.5 − 2 = 3.5', '');
    s += T(lx, 56, '② 除以 ‖w‖ = √2：3.5 / 1.414 ≈ 2.47', '');
    s += T(lx, 78, '③ 符号 > 0 ⇒ 在 w 指向的一侧', '');
    s += T(lx, 112, '蓝点：0.3 + 0.4 − 2 = −1.3 < 0', 'tc c1') + T(lx, 130, '⇒ 负侧，距离 1.3 / √2 ≈ 0.92', 'tc c1');
    s += T(lx, 172, '为什么一定要除以 ‖w‖？', 'w');
    s += T(lx, 194, '(2w, 2b) 是同一条线：2x₁ + 2x₂ − 4 = 0', '');
    s += T(lx, 214, '代入 x 得 7，翻了一倍；', '') + T(lx, 234, '但 ‖2w‖ = 2√2 也翻了一倍 ⇒ 7 / 2.83 ≈ 2.47', '');
    s += T(lx, 260, '只有除过 ‖w‖ 的才是真正的距离', 'w');
    return s;
  }));

  /* c11 least squares as projection, drawn for n = 2 samples and 1 feature (so y is a 2-D vector, X's column a line). */
  SML.viz.register('fig-ls-projection', still(700, 290, function (k) {
    const A = axes({ x: 30, y: 20, w: 330, h: 250, xr: [-0.4, 3.4], yr: [-0.5, 2.6] });
    const O = [0, 0], y = [2, 2.2], yh = [2.4, 0.6], P = (q) => [A.X(q[0]), A.Y(q[1])];
    let s = Line(n1(A.X(-0.4)), n1(A.Y(-0.1)), n1(A.X(3.4)), n1(A.Y(0.85)), 'ln c3');
    s += T(A.X(-0.3), A.Y(-0.08) + 20, 'X 的列：特征能给出的所有预测', 'tc c3');
    s += Line(n1(P(O)[0]), n1(P(O)[1]), n1(P(y)[0]), n1(P(y)[1]), 'edge c1w', k) + T(P(y)[0] - 8, P(y)[1] - 8, 'y（真实值）', 'end tc c1');
    s += Line(n1(P(O)[0]), n1(P(O)[1]), n1(P(yh)[0]), n1(P(yh)[1]), 'edge c3w', k) + T(P(yh)[0] + 6, P(yh)[1] + 16, 'ŷ = Xw（预测）', 'tc c3');
    s += Line(n1(P(yh)[0]), n1(P(yh)[1]), n1(P(y)[0]), n1(P(y)[1]), 'ln c2 dashed') + T((P(yh)[0] + P(y)[0]) / 2 + 10, (P(yh)[1] + P(y)[1]) / 2, 'r = y − ŷ（残差）', 'tc c2');
    const d = 0.2, ux = 2 / Math.hypot(2, 0.5), uy = 0.5 / Math.hypot(2, 0.5), vx = -uy, vy = ux;
    s += Path([[yh[0] - d * ux, yh[1] - d * uy], [yh[0] - d * ux + d * vx, yh[1] - d * uy + d * vy], [yh[0] + d * vx, yh[1] + d * vy]].map(P), 'ax');
    s += Dot(P(O)[0], P(O)[1], '', 4) + T(P(O)[0] - 6, P(O)[1] - 10, 'O', 'end');
    const lx = 390;
    s += T(lx, 40, '最小二乘 = 在绿线上找离 y 最近的点', 'w');
    s += T(lx, 64, '最近 ⇔ 残差 r 和绿线垂直（直角）', '');
    s += T(lx, 98, '垂直写成式子：X′r = 0', 'tc c2');
    s += T(lx, 120, '⇒ X′(y − Xw) = 0', '') + T(lx, 142, '⇒ X′Xw = X′y（正规方程）', 'w');
    s += T(lx, 184, 'r 是特征怎么组合都解释不了的部分，', '') + T(lx, 204, '已经没有能再被特征吃掉的成分', '');
    s += T(lx, 244, '（画的是 2 个样本、1 个特征：', '') + T(lx, 262, ' y 是 2 维向量，X 的列是一条线）', '');
    return s;
  }));

  /* c39 convolution is equivariant; max pooling (width 2, stride 2) is only partly invariant. */
  SML.viz.register('fig-equivariance', still(720, 330, function (k) {
    const cell = 30;
    const row = (x, y, vals, hot, cls) => vals.map((v, i) => Box(x + i * cell, y, cell - 2, cell - 2, 'cell' + (v === 0 ? ' zero' : '') + (hot && hot(i, v) ? ' hot' : '') + (cls ? ' ' + cls : '')) + T(x + i * cell + (cell - 2) / 2, y + (cell - 2) / 2, String(v), 'mid' + (v ? ' w' : ''))).join('');
    const maxOf = (v) => (i, x) => x === Math.max.apply(null, v) && x > 0;
    let s = T(210, 16, '卷积：平移等变（equivariance）', 'mid w');
    const x1 = [0, 0, 0, 5, 0, 0, 0, 0], f1 = [0, 5, 10, 5, 0, 0], x2 = [0, 0, 0, 0, 5, 0, 0, 0], f2 = [0, 0, 5, 10, 5, 0];
    s += T(82, 52, '输入', 'end') + row(90, 38, x1, maxOf(x1)) + T(112, 100, '卷积 [1,2,1]', 'end') + row(120, 86, f1, maxOf(f1));
    s += T(82, 168, '右移一格', 'end tc c4') + row(90, 154, x2, maxOf(x2)) + T(112, 216, '特征图', 'end') + row(120, 202, f2, maxOf(f2));
    s += T(210, 252, '图案右移 1 格 ⇒ 特征图也整体右移 1 格', 'mid w');
    s += T(210, 272, '形状完全一样：同一个 filter 在哪儿都一样地响应', 'mid');
    const ox = 400, win = (y) => [0, 2, 4, 6].map((i) => Line(ox + i * cell - 1, y - 4, ox + i * cell - 1, y + cell + 2, 'winb')).join('');
    s += T(560, 16, '+ max pooling（窗口 2、步长 2）：只是部分不变', 'mid w');
    const cases = [[[0, 0, 5, 0, 0, 0], [0, 5, 0], '原来'], [[0, 0, 0, 5, 0, 0], [0, 5, 0], '窗口内挪动 ⇒ 输出不变 ✓'], [[0, 0, 0, 0, 5, 0], [0, 0, 5], '跨过窗口边界 ⇒ 输出变了 ✗']];
    cases.forEach((c, i) => {
      const y = 44 + i * 84;
      s += row(ox, y, c[0], maxOf(c[0])) + win(y);
      s += Line(ox + 186, y + 14, ox + 206, y + 14, 'edge', k);
      s += row(ox + 212, y, c[1], maxOf(c[1]), 'pool');
      s += T(ox + 90, y + cell + 14, c[2], 'mid ' + (i === 2 ? 'tc c2' : i === 1 ? 'tc c3' : ''));
    });
    s += T(560, 300, '橙线 = 窗口边界；右边 3 格是每个窗口的最大值', 'mid');
    return s;
  }));

  /* c30 representer theorem: the prediction is a weighted sum of kernel bumps centred on training points. */
  SML.viz.register('fig-representer', still(700, 290, function () {
    const xs = [[-1.5, 2], [0, -1], [1.5, 1.5]], g = 1 / (2 * 0.6 * 0.6);
    const K = (x, c) => Math.exp(-g * (x - c) * (x - c)), f = (x) => xs.reduce((t, q) => t + q[1] * K(x, q[0]), 0);
    const A = axes({ x: 50, y: 30, w: 420, h: 220, xr: [-3, 3], yr: [-1.4, 2.4], xt: [-3, -1.5, 0, 1.5, 3], yt: [-1, 0, 1, 2], xl: 'x' });
    let s = A.s;
    xs.forEach((q) => { s += Line(n1(A.X(q[0])), A.Y(2.4), n1(A.X(q[0])), A.Y(-1.4), 'dash'); });
    const cl = ['c1', 'c2', 'c4'];
    xs.forEach((q, i) => { s += curve(A, (x) => q[1] * K(x, q[0]), -3, 3, cl[i] + ' dashed'); });
    s += curve(A, f, -3, 3, 'c5 heavy', 300);
    xs.forEach((q, i) => { s += T(A.X(q[0]), A.Y(q[1]) + (q[1] > 0 ? -12 : 14), 'αᵢyᵢ = ' + (q[1] > 0 ? '+' : '') + q[1], 'mid tc ' + cl[i]); });
    s += T(A.X(-2.9), A.Y(-1.1), 'f(x) = Σ αᵢyᵢ K(x, xᵢ)', 'tc c5');
    const lx = 490;
    s += T(lx, 50, '竖虚线 = 3 个训练点的位置；', '') + T(lx, 72, '彩色虚线：每个训练点上一个', '') + T(lx, 90, 'kernel 小山包，按 αᵢyᵢ 缩放', '') + T(lx, 108, '（负的就倒过来）', '');
    s += T(lx, 138, '紫色粗线：把它们逐点相加，', 'tc c5') + T(lx, 156, '就是学到的预测函数', 'tc c5');
    s += T(lx, 190, '离所有训练点都远的地方，', '') + T(lx, 208, '山包都没贡献 ⇒ 接近 0', '');
    s += T(lx, 240, '只要存训练点和 α，', 'w') + T(lx, 258, '不用写出特征 φ', 'w');
    return s;
  }));

  /* c41 teacher forcing (inputs = target shifted right) and the causal mask on a 4 × 4 score matrix. */
  SML.viz.register('fig-teacher-forcing', still(720, 340, function (k) {
    const inp = ['<start>', 'How', 'are', 'you'], tgt = ['How', 'are', 'you', '</s>'], w = 64;
    let s = T(180, 16, 'teacher forcing：正确答案右移一位当输入', 'mid w');
    inp.forEach((t, i) => {
      const x = 52 + i * (w + 8);
      s += Box(x, 150, w, 30, 'node-box' + (i === 0 ? ' hot2' : '')) + T(x + w / 2, 165, t, 'mid w');
      s += Line(x + w / 2, 148, x + w / 2, 92, 'edge', k);
      s += Box(x, 60, w, 30, 'node-box') + T(x + w / 2, 75, tgt[i], 'mid w tc c3');
    });
    s += T(44, 165, '输入', 'end') + T(44, 75, '目标', 'end');
    s += T(180, 120, '每一列：预测下一个词（4 列同时算）', 'mid');
    s += T(180, 210, '<start> 那格没有真实词，只表示「开始」', 'mid tc c1');
    s += T(180, 232, '目标就是输入左移一位，最后补 </s>', 'mid');
    const ox = 450, oy = 70, c = 50;
    s += T(ox + 100, 16, 'causal mask：不许看后面的词', 'mid w');
    const sc = [[0], [0.269, 0.731], [], []];
    for (let r = 0; r < 4; r++) {
      s += T(ox - 8, oy + r * c + c / 2, inp[r], 'end');
      for (let j = 0; j < 4; j++) {
        const masked = j > r;
        s += Box(ox + j * c, oy + r * c, c - 2, c - 2, 'cell' + (masked ? ' masked' : '')) ;
        const v = masked ? '−∞→0' : r === 1 ? String(sc[1][j]) : r === 0 ? '1' : '';
        if (v) s += T(ox + j * c + (c - 2) / 2, oy + r * c + (c - 2) / 2, v, 'mid' + (r === 1 && j === 1 ? ' tc c2' : ''));
      }
    }
    inp.forEach((t, j) => { s += T(ox + j * c + (c - 2) / 2, oy - 12, t, 'mid'); });
    s += T(ox + 100, oy + 4 * c + 16, '行 = 正在预测的位置，列 = 被看的位置', 'mid');
    s += T(ox + 100, oy + 4 * c + 36, '第 2 行：得分 (1, 2, −∞, −∞)', 'mid') + T(ox + 100, oy + 4 * c + 54, '⇒ 权重 (0.269, 0.731, 0, 0)', 'mid');
    return s;
  }));
  /* c37 "almost PCA": a linear autoencoder spans the PCA subspace but its basis need not be orthogonal or ordered. */
  SML.viz.register('fig-almost-pca', still(700, 316, function (k) {
    const pts = [];
    for (let i = 0; i < 30; i++) { const t = Math.sin(i * 12.9898) * 43758.5453, u = (t - Math.floor(t)) * 2 - 1, v = Math.sin(i * 78.233) * 1.1; pts.push([u * 1.7 + v * 0.25, u * 1.7 - v * 0.25]); }
    let s = '';
    [[30, 'PCA', 'c3'], [380, '线性 autoencoder 学到的基', 'c4']].forEach((pn, j) => {
      const A = axes({ x: pn[0], y: 40, w: 290, h: 200, xr: [-2.6, 2.6], yr: [-1.8, 1.8], yAtZero: true });
      s += T(pn[0] + 145, 20, pn[1], 'mid w tc ' + pn[2]) + A.s;
      pts.forEach((q) => { s += Dot(A.X(q[0]), A.Y(q[1]), 'mute', 3); });
      const O = [A.X(0), A.Y(0)];
      const vecs = j === 0 ? [[1.6, 1.6, 'p₁（方差大）'], [-0.55, 0.55, 'p₂']] : [[1.9, 0.9, 'w₁'], [0.75, 1.45, 'w₂']];
      vecs.forEach((v) => {
        const sc = j === 0 ? 0.62 : 1;
        const e = [A.X(v[0] * sc), A.Y(v[1] * sc)];
        s += Line(n1(O[0]), n1(O[1]), n1(e[0]), n1(e[1]), 'edge ' + pn[2] + 'w', k) + T(e[0] + 6, e[1] - 8, v[2], 'tc ' + pn[2]);
      });
      s += T(pn[0] + 145, 262, j === 0 ? '两个方向互相垂直，按方差从大到小排' : '同一个平面（子空间），但两个方向', 'mid');
      s += T(pn[0] + 145, 280, j === 0 ? '（标准正交基）' : '不必垂直、也不按方差排序', 'mid');
    });
    s += T(350, 306, '两幅图画的都是同一个平面：数据前 2 个主成分张成的子空间', 'mid w');
    return s;
  }));

  /* c51 credible interval (q random, interval fixed) vs confidence interval (q fixed, intervals random). */
  SML.viz.register('fig-credible-confidence', still(720, 318, function () {
    const lb = (a, b) => { let t = 0; for (let x = 0.0005; x < 1; x += 0.001) t += Math.pow(x, a - 1) * Math.pow(1 - x, b - 1) * 0.001; return t; }, Z = lb(9, 5);
    const pdf = (x) => Math.pow(x, 8) * Math.pow(1 - x, 4) / Z, lo = 0.39, hi = 0.86;
    const A = axes({ x: 30, y: 50, w: 300, h: 170, xr: [0, 1], yr: [0, 3.4], xt: [0, [lo, '0.39'], [hi, '0.86'], 1], xl: 'q' });
    let s = T(180, 16, 'Credible interval（Bayesian）', 'mid w') + T(180, 34, 'q 是随机的，区间固定', 'mid');
    s += band(A, pdf, 0, lo, 'shade') + band(A, pdf, hi, 1, 'shade') + band(A, pdf, lo, hi, 'c1') + A.s + curve(A, pdf, 0, 1, 'c1');
    s += T(A.X(0.2), A.Y(0.45), '2.5%', 'mid') + T(A.X(0.94), A.Y(0.45), '2.5%', 'mid') + T(A.X(0.64), A.Y(1.1), '95%', 'mid w tc c1');
    s += T(180, 260, '后验 Beta(9, 5)：q 落在 [0.39, 0.86]', 'mid') + T(180, 278, '里的概率是 0.95', 'mid');
    const ox = 390, q0 = 0.7, X = (v) => ox + v * 300;
    s += T(ox + 150, 16, 'Confidence interval（频率学派）', 'mid w') + T(ox + 150, 34, 'q 是固定的未知数，随机的是区间', 'mid');
    const iv = [[0.52, 0.83], [0.61, 0.9], [0.48, 0.79], [0.58, 0.88], [0.73, 0.97], [0.55, 0.86], [0.6, 0.91], [0.5, 0.81], [0.63, 0.93], [0.45, 0.76], [0.57, 0.87], [0.62, 0.92], [0.36, 0.66], [0.54, 0.84], [0.59, 0.89], [0.49, 0.8]];
    iv.forEach((r, i) => {
      const y = 64 + i * 9.4, hit = r[0] <= q0 && q0 <= r[1];
      s += Line(n1(X(r[0])), n1(y), n1(X(r[1])), n1(y), 'ln ' + (hit ? 'c1 thin2' : 'c2'));
    });
    s += Line(n1(X(q0)), 58, n1(X(q0)), 214, 'ln dashed') + T(X(q0), 50, '真值 q = 0.7（固定但未知）', 'mid');
    s += Line(ox, 214, ox + 300, 214, 'ax') + T(ox, 228, '0', 'mid') + T(ox + 300, 228, '1', 'mid');
    s += T(ox + 150, 258, '每份数据算出一条区间，约 95% 的区间盖住真值', 'mid');
    s += T(ox + 150, 278, '红色的两条没盖住；对手里的某一条，', 'mid tc c2') + T(ox + 150, 296, '不能说「q 有 95% 的概率在里面」', 'mid tc c2');
    return s;
  }));

  /* c45 halving proof as two bounds on log₂ W (n = 8 experts, best one makes m = 3 mistakes). */
  SML.viz.register('fig-halving-bound', still(700, 300, function () {
    const Mx = 6 / Math.log2(4 / 3);
    const A = axes({ x: 60, y: 30, w: 420, h: 220, xr: [0, 20], yr: [-6, 4], xt: [0, 5, 10, [Mx, '14.5'], 20], yt: [-6, -3, 0, 3], xl: '学习者已犯的错 M', yl: 'log₂ W（总权重）', bottom: true, grid: true });
    let s = Box(A.X(Mx), A.Y(4), A.X(20) - A.X(Mx), A.Y(-6) - A.Y(4), 'fl faint c2') + A.s;
    s += curve(A, (M) => 3 - Math.log2(4 / 3) * M, 0, 20, 'c1') + curve(A, () => -3, 0, 20, 'c2 dashed');
    s += Line(n1(A.X(Mx)), A.Y(4), n1(A.X(Mx)), A.Y(-6), 'dash') + Dot(A.X(Mx), A.Y(-3), '', 5);
    s += T(A.X(1), A.Y(3.2), '上界：每错一次，总权重至少剩 3/4', 'tc c1');
    s += T(A.X(0.5), A.Y(-3) + 16, '下界：最好的专家只错 m = 3 次，自己的权重 (1/2)³ 还在', 'tc c2');
    s += T(A.X(17.2), A.Y(2.4), '上界已低于下界：', 'mid tc c2') + T(A.X(17.2), A.Y(2.4) + 18, '不可能', 'mid tc c2');
    const lx = 500;
    s += T(lx, 50, 'n = 8 个专家，log₂ 8 = 3', 'w');
    s += T(lx, 80, '蓝线一路下滑，红线压不下去，', '') + T(lx, 98, '两线交点就是 M 的上限：', '');
    s += T(lx, 128, 'M ≤ (m + log₂ n) / log₂(4/3)', 'w') + T(lx, 148, '   = 6 / 0.415 ≈ 14.5', '');
    s += T(lx, 188, '错误次数要是更多，', '') + T(lx, 206, '两条界就互相矛盾了', '');
    return s;
  }));

  /* c46 weighted majority bound 2(1+ε)m + 2 ln n / ε for n = 10⁴, m = 3; the proof only covers ε ≤ 0.5. */
  SML.viz.register('fig-wm-epsilon', still(700, 300, function () {
    const m = 3, L = 2 * Math.log(1e4), a = (e) => 2 * (1 + e) * m, b = (e) => L / e;
    const A = axes({ x: 60, y: 30, w: 420, h: 220, xr: [0, 2], yr: [0, 200], xt: [0, 0.5, 1, 1.5, 2], yt: [0, 50, 100, 150, 200], xl: 'ε', yl: '错误次数上界 M' });
    let s = Box(A.X(0), A.Y(200), A.X(0.5) - A.X(0), A.Y(0) - A.Y(200), 'fl faint c3') + A.s;
    s += curve(A, a, 0.05, 2, 'c1') + curve(A, b, 0.093, 2, 'c2') + curve(A, (e) => a(e) + b(e), 0.096, 2, 'heavy');
    s += Dot(A.X(0.1), A.Y(a(0.1) + b(0.1)), '', 4.5) + T(A.X(0.1) + 8, A.Y(a(0.1) + b(0.1)), 'ε = 0.1：≈ 191', '');
    s += Dot(A.X(0.5), A.Y(a(0.5) + b(0.5)), '', 4.5) + T(A.X(0.5) + 8, A.Y(a(0.5) + b(0.5)) - 12, 'ε = 0.5：≈ 46', '');
    const em = Math.sqrt(L / (2 * m));
    s += Line(n1(A.X(em)), A.Y(200), n1(A.X(em)), A.Y(0), 'dash') + T(A.X(em), A.Y(185), '纯代数最小点 ε ≈ 1.75', 'mid') + T(A.X(em), A.Y(185) + 16, '（≈ 27，超出证明范围）', 'mid');
    s += T(A.X(0.25), A.Y(120), '证明成立', 'mid tc c3') + T(A.X(0.25), A.Y(120) + 16, 'ε ≤ 0.5', 'mid tc c3');
    const lx = 500;
    s += T(lx, 44, 'n = 10⁴ 个专家，', 'w') + T(lx, 62, '最好的专家错 m = 3 次', 'w');
    s += Line(lx, 92, lx + 22, 92, 'ln c1') + T(lx + 28, 92, 'm 项 2(1+ε)m', 'tc c1');
    s += Line(lx, 114, lx + 22, 114, 'ln c2') + T(lx + 28, 114, 'ln n 项 2 ln n / ε', 'tc c2');
    s += Line(lx, 136, lx + 22, 136, 'ln heavy') + T(lx + 28, 136, '两项之和 = 界', 'w');
    s += T(lx, 172, 'ε 小：m 的系数接近 2，但压', '') + T(lx, 190, '下坏专家要更多轮（红线高）', '') + T(lx, 214, '在绿色区间里黑线一路下降', '');
    return s;
  }));

  /* c61 Example 2: maximised log-likelihood l never drops as parents are added; BIC subtracts the penalty. */
  SML.viz.register('fig-bic-parents', still(700, 290, function () {
    const cand = [['∅', -3.819, -4.715], ['{x₂}', -2.773, -4.564], ['{x₃}', -2.773, -5.46], ['{x₂, x₃}', 0, -5.375]];
    const A = axes({ x: 60, y: 30, w: 400, h: 210, xr: [0.4, 4.6], yr: [-6.3, 0.4], yt: [-6, -5, -4, -3, -2, -1, 0], yl: '分数（越大越好）', bottom: true, grid: true });
    let s = A.s;
    cand.forEach((c, i) => {
      const x = A.X(i + 1);
      s += Line(n1(x), n1(A.Y(c[1])), n1(x), n1(A.Y(c[2])), 'ln c2 thin');
      s += Dot(x, A.Y(c[1]), 'c1', 5.5) + Dot(x, A.Y(c[2]), 'c2', i === 1 ? 7 : 5);
      s += T(x + 10, A.Y(c[1]), c[1] === 0 ? '0' : c[1].toFixed(3).replace('-', '−'), 'tc c1') + T(x + (i === 1 ? 14 : 10), A.Y(c[2]), c[2].toFixed(3).replace('-', '−'), 'tc c2');
      s += T(x, A.Y(-6.3) + 16, c[0], 'mid w');
    });
    s += '<circle class="ring c2" cx="' + n1(A.X(2)) + '" cy="' + n1(A.Y(-4.564)) + '" r="12"/>';
    s += T(A.X(2), A.Y(-4.564) + 24, 'BIC 最高：选 {x₂}', 'mid tc c2');
    const lx = 490;
    s += Dot(lx + 6, 50, 'c1', 5) + T(lx + 16, 50, '蓝点 = 对数似然 l', 'tc c1') + T(lx + 16, 68, '只看拟合，加父节点只升不降', '');
    s += Dot(lx + 6, 100, 'c2', 5) + T(lx + 16, 100, '红点 = BIC = l − 惩罚', 'tc c2') + T(lx + 16, 118, '竖线 = 惩罚（每个参数 0.896）', '');
    s += T(lx, 160, '只看蓝点会选 {x₂, x₃}（l = 0）；', '') + T(lx, 178, '扣掉惩罚后 {x₂} 最高', '');
    s += T(lx, 214, '横轴是 x₁ 的候选父节点集合', '');
    return s;
  }));
})(window);
