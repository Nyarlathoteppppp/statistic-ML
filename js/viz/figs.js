/* Static figures (no controls): curves, regions and layouts the graph block cannot draw.
 * Use in a chapter as { t: 'viz', id: 'fig-…', opts: { caption: T`…` } }. Colours come from css/viz.css (svg.graph.fig). */
(function (root) {
  'use strict';
  const SML = root.SML;
  let uid = 0;

  // ---- tiny SVG string builders ----
  const T = (x, y, s, cls) => '<text class="lbl ' + (cls || '') + '" x="' + x + '" y="' + y + '">' + s + '</text>';
  const Rect = (x, y, w, h, cls) => '<rect class="blk ' + (cls || '') + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="3"/>';
  const Line = (x1, y1, x2, y2, cls, arrow) => '<line class="edge ' + (cls || '') + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"' + (arrow ? ' marker-end="url(#' + arrow + ')"' : '') + '/>';
  const n1 = (v) => (+v).toFixed(1);
  const Dot = (x, y, cls, r) => '<circle class="dot ' + (cls || '') + '" cx="' + n1(x) + '" cy="' + n1(y) + '" r="' + (r || 4.5) + '"/>';
  const Path = (pts, cls) => '<path class="' + cls + '" d="M' + pts.map((q) => n1(q[0]) + ',' + n1(q[1])).join(' L') + '"/>';
  const Box = (x, y, w, h, cls) => '<rect class="' + cls + '" x="' + n1(x) + '" y="' + n1(y) + '" width="' + n1(w) + '" height="' + n1(h) + '"/>';

  /* Plot axes. o = { x, y, w, h, xr: [a, b], yr: [c, d], xt / yt: ticks (value or [value, label]), xl, yl, grid }.
   * Returns { X, Y, s }: data → SVG coordinates, and the SVG of the frame. The x axis sits at y = 0 when 0 is in range. */
  function axes(o) {
    const X = (v) => o.x + (v - o.xr[0]) / (o.xr[1] - o.xr[0]) * o.w;
    const Y = (v) => o.y + o.h - (v - o.yr[0]) / (o.yr[1] - o.yr[0]) * o.h;
    const base = o.yr[0] <= 0 && o.yr[1] >= 0 ? Y(0) : o.y + o.h;
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
})(window);
