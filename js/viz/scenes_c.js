/* 3B1B-style scenes, batch C: kernel lift (c29), maximum margin (c25), PCA (c37), elimination → junction tree (c58). */
(function (root) {
  'use strict';
  const SML = root.SML, A = SML.anim, C = A.C;
  const f2 = (v) => String(+v.toFixed(2));
  const rnd = (k) => { const x = Math.sin(k * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };

  /* ===================== c29 · lift a ring dataset with x3 = x1^2 + x2^2 ===================== */
  const INNER = [], OUTER = [];
  for (let i = 0; i < 14; i++) { const r = 0.25 + 0.65 * rnd(i), a = 2 * Math.PI * rnd(i + 50); INNER.push([r * Math.cos(a), r * Math.sin(a)]); }
  for (let i = 0; i < 20; i++) { const r = 1.75 + 0.5 * rnd(i + 100), a = 2 * Math.PI * (i / 20 + 0.03 * rnd(i + 150)); OUTER.push([r * Math.cos(a), r * Math.sin(a)]); }

  A.scene('anim-kernel-lift', {
    title: 'Kernel 的直觉：抬到高维，弯的边界就变成平的',
    w: 640, h: 360,
    intro: '中间一团蓝点、外面一圈红点（L09 p16 的例子）。',
    setup(S) {
      const cam = { az: 0, el: Math.PI / 2, cy: 180, k: 68, lift: 0 };
      S.v.cam = cam;
      const proj = (x, y, z) => {
        const xr = x * Math.cos(cam.az) - y * Math.sin(cam.az), yr = x * Math.sin(cam.az) + y * Math.cos(cam.az);
        const sy = yr * Math.sin(cam.el) + 0.55 * z * Math.cos(cam.el);
        return [320 + cam.k * xr, cam.cy - cam.k * sy];
      };
      S.v.proj = proj;
      S.v.rings = [0.5, 1, 1.5, 2, 2.5].map(() => S.path({ d: '', color: '#2e4756', width: 1.2, opacity: 0 }));
      S.v.axis = S.line({ x1: 0, y1: 0, x2: 0, y2: 0, color: C.dim, width: 1.5, opacity: 0 });
      S.v.plane = S.poly({ points: [], fill: 'rgba(244,211,94,.16)', color: C.yellow, width: 1.5, opacity: 0 });
      S.v.circle = S.path({ d: '', color: C.yellow, width: 3, opacity: 0 });
      S.v.circleZ = 2;
      S.v.pts = INNER.map((p) => ({ p, s: S.circle({ cx: 0, cy: 0, r: 6, fill: C.blue }) }))
        .concat(OUTER.map((p) => ({ p, s: S.circle({ cx: 0, cy: 0, r: 6, fill: C.red }) })));
      S.v.render = function () {
        S.v.pts.forEach(({ p, s }) => { const z = cam.lift * (p[0] * p[0] + p[1] * p[1]); const q = proj(p[0], p[1], z); s.set({ cx: q[0], cy: q[1] }); });
        [0.5, 1, 1.5, 2, 2.5].forEach((r, i) => {
          const pts = []; for (let k = 0; k <= 60; k++) { const a = k / 60 * 2 * Math.PI; pts.push(proj(r * Math.cos(a), r * Math.sin(a), cam.lift * r * r)); }
          S.v.rings[i].set({ d: 'M' + pts.map((q) => q.join(',')).join(' L') });
        });
        const o = proj(0, 0, 0), t = proj(0, 0, 6.5);
        S.v.axis.set({ x1: o[0], y1: o[1], x2: t[0], y2: t[1] });
        const L = 2.7;
        S.v.plane.set({ points: [[-L, -L], [L, -L], [L, L], [-L, L]].map((c) => proj(c[0], c[1], 2)) });
        const cz = S.v.circleZ, rr = Math.sqrt(2), cp = [];
        for (let k = 0; k <= 80; k++) { const a = k / 80 * 2 * Math.PI; cp.push(proj(rr * Math.cos(a), rr * Math.sin(a), cz)); }
        S.v.circle.set({ d: 'M' + cp.map((q) => q.join(',')).join(' L') });
      };
      S.v.cameraTo = (az, el, cy, lift, ms) => {
        const a0 = cam.az, e0 = cam.el, c0 = cam.cy, l0 = cam.lift;
        return S.play(ms || 1800, (t) => { cam.az = a0 + (az - a0) * t; cam.el = e0 + (el - e0) * t; cam.cy = c0 + (cy - c0) * t; cam.lift = l0 + (lift - l0) * t; S.v.render(); });
      };
      S.v.cap = S.label({ x: 16, y: 14, anchor: 'l', valign: 't', text: '原来的平面 $(x_1,x_2)$', size: 0.9, bg: 'rgba(22,23,28,.85)' });
      S.v.render();
    },
    beats: [
      {
        say: '在原来的平面上，**没有任何一条直线**能把蓝点和红点分开——分界应该是一个圆。',
        run: async (S) => {
          const tryLine = S.line({ x1: 140, y1: 320, x2: 520, y2: 40, color: C.grey, width: 2, dash: '6 6', opacity: 0 });
          await S.draw(tryLine, 700);
          await S.to(tryLine, { x1: 140, y1: 60, x2: 520, y2: 300 }, 900);
          await S.hide(tryLine, 300);
        },
      },
      {
        say: '加一个新特征 $x_3=x_1^2+x_2^2$（到原点距离的平方），把每个点**抬到高度 $x_3$**：中间的点离原点近，抬得低；外圈的点抬得高。灰色的圈是这个"碗"的等高线。',
        run: async (S) => {
          S.v.cap.set({ text: '三维特征空间 $(x_1,x_2,x_3)$，$x_3=x_1^2+x_2^2$' });
          await S.all(S.v.rings.map((r) => S.show(r, 400)), S.show(S.v.axis, 400));
          await S.v.cameraTo(0.5, 0.32, 300, 1, 2600);
        },
      },
      {
        say: '现在一个**水平平面** $x_3=2$ 就把两类分开了：蓝点全在平面下面，红点全在上面。在三维的新特征空间里，问题变成了**线性可分**——普通的线性分类器（SVM、perceptron）就能做。',
        run: async (S) => {
          await S.show(S.v.plane, 700);
          await S.v.cameraTo(0.9, 0.26, 300, 1, 1600);
        },
      },
      {
        say: '把这个平面"拍回"原来的平面：$x_3=2$ 就是 $x_1^2+x_2^2=2$——一个**圆**（黄色）。高维里的平面分界，回到原空间就是弯的边界。**kernel trick** 的意思是：算法只需要点积 $K(\\mathbf u,\\mathbf v)=\\varphi(\\mathbf u)\'\\varphi(\\mathbf v)$，不用真的把每个点抬起来。',
        run: async (S) => {
          await S.show(S.v.circle, 500);
          await S.hide(S.v.plane, 500);
          const z0 = S.v.circleZ;
          S.v.cap.set({ text: '回到原来的平面：分界是圆 $x_1^2+x_2^2=2$' });
          await S.all(S.v.cameraTo(0, Math.PI / 2, 180, 0, 2200), S.play(2200, (t) => { S.v.circleZ = z0 * (1 - t); S.v.render(); }), S.all(S.v.rings.map((r) => S.hide(r, 900))), S.hide(S.v.axis, 900));
        },
      },
    ],
  });

  /* ===================== c25 · maximum margin: rotate the separator, watch the band ===================== */
  const BLUE = [[3, 9], [3, 4], [1, 2]], RED = [[8, 8], [6, 6], [9, 3]];
  const NUM = { '3,9': 1, '3,4': 2, '1,2': 6, '8,8': 3, '6,6': 4, '9,3': 5 };
  function sep(a) {
    const n = [Math.cos(a), Math.sin(a)], dot = (p) => p[0] * n[0] + p[1] * n[1];
    const pb = Math.max(...BLUE.map(dot)), pr = Math.min(...RED.map(dot));
    return { n, c: (pb + pr) / 2, m: (pr - pb) / 2 };
  }
  A.scene('anim-svm-margin', {
    title: '最大 margin：把分界线放到离两类都最远的地方',
    w: 640, h: 360,
    intro: '这是 T4 真题（2026 Q1c）的六个点：蓝圆一类、红方一类。',
    setup(S) {
      const box = [150, 15, 330, 330];
      const m = S.map(0, 10, 0, 10, box);
      S.v.m = m;
      for (let k = 0; k <= 10; k += 2) { S.line({ x1: m.X(k), y1: m.Y(0), x2: m.X(k), y2: m.Y(10), color: '#23262e', width: 1 }); S.line({ x1: m.X(0), y1: m.Y(k), x2: m.X(10), y2: m.Y(k), color: '#23262e', width: 1 }); }
      S.v.band = S.clip(S.poly({ points: [], fill: 'rgba(88,196,221,.13)', opacity: 0 }), box);
      S.v.mA = S.clip(S.line({ x1: 0, y1: 0, x2: 0, y2: 0, color: C.blue, width: 1.6, dash: '6 5', opacity: 0 }), box);
      S.v.mB = S.clip(S.line({ x1: 0, y1: 0, x2: 0, y2: 0, color: C.blue, width: 1.6, dash: '6 5', opacity: 0 }), box);
      S.v.bd = S.clip(S.line({ x1: 0, y1: 0, x2: 0, y2: 0, color: C.green, width: 3, opacity: 0 }), box);
      S.v.rings = {};
      BLUE.forEach((p) => { S.circle({ cx: m.X(p[0]), cy: m.Y(p[1]), r: 9, fill: C.blue }); S.label({ x: m.X(p[0]) - 16, y: m.Y(p[1]) - 14, text: String(NUM[p]), size: 0.8, color: C.grey }); });
      RED.forEach((p) => { S.rect({ x: m.X(p[0]) - 8, y: m.Y(p[1]) - 8, w: 16, h: 16, fill: C.red }); S.label({ x: m.X(p[0]) + 16, y: m.Y(p[1]) - 14, text: String(NUM[p]), size: 0.8, color: C.grey }); });
      S.v.read = S.label({ x: S.W - 12, y: 40, anchor: 'r', text: '', size: 0.95, color: C.blue, opacity: 0 });
      S.v.a = 0.6;
      S.v.setA = function (a, withBand) {
        S.v.a = a;
        const { n, c, m: mg } = sep(a), d = [-n[1], n[0]];
        const seg = (cc) => { const p0 = [n[0] * cc, n[1] * cc]; return [m.P([p0[0] - 30 * d[0], p0[1] - 30 * d[1]]), m.P([p0[0] + 30 * d[0], p0[1] + 30 * d[1]])]; };
        const b = seg(c), u = seg(c + mg), l = seg(c - mg);
        S.v.bd.set({ x1: b[0][0], y1: b[0][1], x2: b[1][0], y2: b[1][1] });
        S.v.mA.set({ x1: u[0][0], y1: u[0][1], x2: u[1][0], y2: u[1][1] });
        S.v.mB.set({ x1: l[0][0], y1: l[0][1], x2: l[1][0], y2: l[1][1] });
        S.v.band.set({ points: [u[0], u[1], l[1], l[0]] });
        if (withBand) S.v.read.set({ text: '单侧 margin $=' + mg.toFixed(2) + '$' });
      };
      S.v.setA(0.6);
    },
    beats: [
      {
        say: '能把两类分开的直线有无数条，它们的训练误差都是 0。比如这条绿线。',
        run: async (S) => { await S.draw(S.v.bd, 800); },
      },
      {
        say: '给它画上 **margin**：从分界线往两边平移，直到碰到最近的点为止（虚线）。这条线的单侧 margin 只有约 0.39——新来的点稍微偏一点，就可能落到错的一边。',
        run: async (S) => {
          S.v.setA(S.v.a, true);
          await S.all(S.show(S.v.band), S.show(S.v.mA), S.show(S.v.mB), S.show(S.v.read));
        },
      },
      {
        say: '把直线转来转去（每个角度都放在两类正中间），看带子的宽度怎么变：越接近竖直，带子越宽。',
        run: async (S) => {
          const a0 = S.v.a;
          await S.play(2600, (t) => S.v.setA(a0 + (-0.45 - a0) * t, true), 'inout');
          await S.play(1400, (t) => S.v.setA(-0.45 + 0.45 * t, true), 'inout');
        },
      },
      {
        say: '最宽的那条：竖线 $x=4.5$，单侧 margin $=1.5$。**正好贴在虚线上**的点 1、2、4 就是 **support vectors**——只有它们决定了这条线；点 3、5、6 稍微挪一挪，答案都不变。SVM 的训练目标就是找这条线（c26 把它写成 $\\min\\frac12\\|\\mathbf w\\|^2$）。',
        run: async (S) => {
          S.v.setA(0, true);
          S.v.read.set({ color: C.yellow });
          const m = S.v.m;
          const sv = [[3, 9], [3, 4], [6, 6]].map((p) => S.circle({ cx: m.X(p[0]), cy: m.Y(p[1]), r: 15, color: C.yellow, width: 2.5, opacity: 0 }));
          await S.all(sv.map((c) => S.show(c, 400)));
          await S.all(sv.map((c) => S.pulse(c)));
        },
      },
    ],
  });

  /* ===================== c37 · PCA: rotate a direction, watch the projected variance ===================== */
  const PCA_PTS = (() => {
    // whiten a small pseudo-random sample so its covariance is EXACTLY [[2,1],[1,2]]
    // (variance 3 along (1,1), 1 along (1,-1)), otherwise 26 points drift away from 45°
    const g = [];
    for (let i = 0; i < 26; i++) {
      const u1 = Math.max(1e-6, rnd(i + 300)), u2 = rnd(i + 400), r = Math.sqrt(-2 * Math.log(u1));
      g.push([r * Math.cos(2 * Math.PI * u2), r * Math.sin(2 * Math.PI * u2)]);
    }
    const n = g.length, mx = g.reduce((s, p) => s + p[0], 0) / n, my = g.reduce((s, p) => s + p[1], 0) / n;
    const c = g.map((p) => [p[0] - mx, p[1] - my]);
    const a = c.reduce((s, p) => s + p[0] * p[0], 0) / n, b = c.reduce((s, p) => s + p[0] * p[1], 0) / n, d = c.reduce((s, p) => s + p[1] * p[1], 0) / n;
    const h = Math.sqrt(((a - d) / 2) ** 2 + b * b), l1 = (a + d) / 2 + h, l2 = (a + d) / 2 - h;
    let v1 = Math.abs(b) > 1e-12 ? [b, l1 - a] : (a >= d ? [1, 0] : [0, 1]);
    const nv = Math.hypot(v1[0], v1[1]); v1 = [v1[0] / nv, v1[1] / nv];
    const v2 = [-v1[1], v1[0]];
    // W = V diag(1/sqrt(l)) V'  (inverse square root of the sample covariance)
    const w = (p) => { const t1 = (p[0] * v1[0] + p[1] * v1[1]) / Math.sqrt(l1), t2 = (p[0] * v2[0] + p[1] * v2[1]) / Math.sqrt(l2); return [t1 * v1[0] + t2 * v2[0], t1 * v1[1] + t2 * v2[1]]; };
    return c.map((p) => { const z = w(p), A1 = z[0] * Math.sqrt(3), B1 = z[1]; return [(A1 + B1) / Math.SQRT2, (A1 - B1) / Math.SQRT2]; });
  })();
  const varAt = (a) => { const d = [Math.cos(a), Math.sin(a)]; return PCA_PTS.reduce((s, p) => s + Math.pow(p[0] * d[0] + p[1] * d[1], 2), 0) / PCA_PTS.length; };
  const BEST = (() => { let b = [0, 0]; for (let i = 0; i < 1800; i++) { const a = i / 1800 * Math.PI, v = varAt(a); if (v > b[1]) b = [a, v]; } return b; })();

  A.scene('anim-pca', {
    title: 'PCA：找一个方向，让投影后的数据铺得最开',
    w: 640, h: 360,
    intro: '一团二维数据，已经减去了均值（中心在原点）。',
    setup(S) {
      const m = S.map(-5.2, 5.2, -4.5, 4.5, [10, 10, 400, 340]);
      S.v.m = m;
      S.line({ x1: m.X(-5.2), y1: m.Y(0), x2: m.X(5.2), y2: m.Y(0), color: C.dim, width: 1 });
      S.line({ x1: m.X(0), y1: m.Y(-4.5), x2: m.X(0), y2: m.Y(4.5), color: C.dim, width: 1 });
      S.v.dir = S.line({ x1: 0, y1: 0, x2: 0, y2: 0, color: C.yellow, width: 2.5, opacity: 0 });
      S.v.drops = PCA_PTS.map(() => S.line({ x1: 0, y1: 0, x2: 0, y2: 0, color: '#6b6f7a', width: 1, dash: '3 3', opacity: 0 }));
      S.v.proj = PCA_PTS.map(() => S.circle({ cx: 0, cy: 0, r: 3.5, fill: C.yellow, opacity: 0 }));
      S.v.dots = PCA_PTS.map((p) => S.circle({ cx: m.X(p[0]), cy: m.Y(p[1]), r: 5, fill: C.blue }));
      // variance-vs-angle plot on the right
      const g = S.map(0, 180, 0, 3.6, [440, 70, 180, 160]);
      S.v.g = g;
      S.line({ x1: g.X(0), y1: g.Y(0), x2: g.X(180), y2: g.Y(0), color: C.grey, width: 1.2 });
      S.line({ x1: g.X(0), y1: g.Y(0), x2: g.X(0), y2: g.Y(3.6), color: C.grey, width: 1.2 });
      S.label({ x: g.X(90), y: g.Y(0) + 16, text: '方向的角度 0°–180°', size: 0.75, color: C.grey });
      S.label({ x: g.X(0) - 4, y: g.Y(3.6) - 12, anchor: 'l', text: '投影方差', size: 0.75, color: C.grey });
      S.v.curve = S.path({ d: '', color: C.yellow, width: 2.2 });
      S.v.cpts = [];
      S.v.read = S.label({ x: S.W - 12, y: 30, anchor: 'r', text: '', size: 0.85, color: C.yellow, opacity: 0 });
      S.v.setAngle = function (a, rec) {
        const d = [Math.cos(a), Math.sin(a)];
        S.v.dir.set({ x1: m.X(-6 * d[0]), y1: m.Y(-6 * d[1]), x2: m.X(6 * d[0]), y2: m.Y(6 * d[1]) });
        PCA_PTS.forEach((p, i) => { const t = p[0] * d[0] + p[1] * d[1], q = [t * d[0], t * d[1]]; S.v.drops[i].set({ x1: m.X(p[0]), y1: m.Y(p[1]), x2: m.X(q[0]), y2: m.Y(q[1]) }); S.v.proj[i].set({ cx: m.X(q[0]), cy: m.Y(q[1]) }); });
        const v = varAt(a);
        S.v.read.set({ text: '角度 $' + Math.round(a * 180 / Math.PI) + '^\\circ$，投影方差 $=' + v.toFixed(2) + '$' });
        if (rec) { S.v.cpts.push(g.P([a * 180 / Math.PI, v])); S.v.curve.set({ d: 'M' + S.v.cpts.map((q) => q.join(',')).join(' L') }); }
      };
      S.v.setAngle(0);
    },
    beats: [
      {
        say: 'PCA（主成分分析）想找一个方向：把数据**投影**到这个方向上以后，数据**铺得最开**（方差最大）。先试水平方向：每个点垂直投到黄线上（虚线），黄色小点有多分散，就是这个方向上的方差。',
        run: async (S) => {
          await S.draw(S.v.dir, 600);
          await S.all(S.v.drops.map((d) => S.show(d, 500)), S.v.proj.map((p) => S.show(p, 500)), S.show(S.v.read, 500));
        },
      },
      {
        say: '把黄线转半圈，右边把每个方向的投影方差记下来。可以看到方差随方向变化很大。',
        run: async (S) => {
          S.v.cpts = [];
          await S.play(4200, (t) => S.v.setAngle(t * Math.PI, true), 'linear');
        },
      },
      {
        say: '最大值出现在约 $45^\\circ$，也就是 $(1,1)$ 方向——**第一主成分 PC1**，这时的方差就是协方差矩阵**最大的特征值**（这组数据造的时候是 3）。它就是 c04 动画里那条"只被拉伸"的青色方向。和它垂直的方向方差最小，是 PC2。只保留 PC1，就把二维压成一维而丢失最少。',
        run: async (S) => {
          await S.play(1500, (t) => S.v.setAngle(Math.PI * (1 - t) + BEST[0] * t), 'inout');
          S.v.dir.set({ color: C.teal });
          const g = S.v.g, pk = g.P([BEST[0] * 180 / Math.PI, BEST[1]]);
          const mark = S.circle({ cx: pk[0], cy: pk[1], r: 6, fill: C.teal });
          S.label({ x: pk[0], y: pk[1] - 18, text: 'PC1：' + BEST[1].toFixed(2), size: 0.8, color: C.teal });
          const m = S.v.m, a2 = BEST[0] + Math.PI / 2, d2 = [Math.cos(a2), Math.sin(a2)];
          const pc2 = S.line({ x1: m.X(-4 * d2[0]), y1: m.Y(-4 * d2[1]), x2: m.X(4 * d2[0]), y2: m.Y(4 * d2[1]), color: C.purple, width: 2, dash: '6 5', opacity: 0 });
          await S.all(S.pulse(mark), S.draw(pc2, 700));
        },
      },
    ],
  });

  /* ===================== c58 · elimination order → cliques → junction tree ===================== */
  const P = { 1: [150, 46], 2: [62, 150], 3: [238, 150], 4: [62, 262], 5: [238, 262] };
  const E0 = [[1, 2], [1, 3], [2, 4], [3, 5], [4, 5]];
  A.scene('anim-elim-jt', {
    title: '消元找团 → 只留极大团 → 连成 junction tree',
    w: 640, h: 340,
    intro: 'L22 的例子，已经 moralize 好的无向图（橙色虚线 $x_3$—$x_4$ 是结婚边）。消元顺序 $x_1,x_2,x_3,x_4,x_5$。',
    setup(S) {
      S.v.e = {};
      const edge = (a, b, color, dash) => { const k = a + '-' + b; S.v.e[k] = S.line({ x1: P[a][0], y1: P[a][1], x2: P[b][0], y2: P[b][1], color, width: 2.2, dash }); return S.v.e[k]; };
      E0.forEach(([a, b]) => edge(a, b, C.grey));
      edge(3, 4, C.orange, '6 5');
      S.v.n = {};
      [1, 2, 3, 4, 5].forEach((i) => {
        S.v.n[i] = S.circle({ cx: P[i][0], cy: P[i][1], r: 20, fill: '#20232b', color: C.white, width: 2 });
        S.v['l' + i] = S.label({ x: P[i][0], y: P[i][1], text: '$x_' + i + '$' });
      });
      S.label({ x: 330, y: 22, anchor: 'l', text: '记下的团', size: 0.85, color: C.grey });
      S.v.cl = [];
      S.v.elim = async function (v, nbrs, fill, cliqueText) {
        await S.to(S.v.n[v], { fill: '#5a4a16', color: C.yellow, width: 3 }, 400);
        if (fill) {
          const f = S.line({ x1: P[fill[0]][0], y1: P[fill[0]][1], x2: P[fill[1]][0], y2: P[fill[1]][1], color: C.purple, width: 2.4, dash: '6 5', opacity: 0 });
          S.v.e[fill[0] + '-' + fill[1]] = f;
          await S.draw(f, 700);
        }
        await S.all(nbrs.map((u) => S.pulse(S.v.n[u], 500)));
        const pill = S.label({ x: P[v][0], y: P[v][1] - 30, text: cliqueText, bg: C.yellow, color: '#16171c', size: 0.9, opacity: 0 });
        await S.show(pill, 250);
        await S.to(pill, { x: 370, y: 56 + S.v.cl.length * 40 }, 700);
        S.v.cl.push(pill);
        // delete v and its edges
        const gone = Object.keys(S.v.e).filter((k) => k.split('-').map(Number).includes(v));
        await S.all(gone.map((k) => S.to(S.v.e[k], { opacity: 0.12 }, 400)), S.to(S.v.n[v], { opacity: 0.25 }, 400), S.to(S.v['l' + v], { opacity: 0.3 }, 400));
        gone.forEach((k) => delete S.v.e[k]);
      };
    },
    beats: [
      {
        say: '**消 $x_1$**：看它此刻的邻居 $x_2,x_3$——它们之间没有边，补一条 **fill-in**（紫色虚线）。记下团 $\\{1,2,3\\}$，然后把 $x_1$ 和它的边删掉。（消掉 = 对 $x_1$ 求和，结果同时依赖 $x_2,x_3$，所以它俩被"绑"在一起。）',
        run: async (S) => { await S.v.elim(1, [2, 3], [2, 3], '$c_1=\\{1,2,3\\}$'); },
      },
      {
        say: '**消 $x_2$**：此刻邻居是 $x_3$（刚补的边带来的）和 $x_4$，它们已经相连（结婚边），不用补。团 $\\{2,3,4\\}$。',
        run: async (S) => { await S.v.elim(2, [3, 4], null, '$c_2=\\{2,3,4\\}$'); },
      },
      {
        say: '**消 $x_3$**：邻居 $x_4,x_5$ 已相连。团 $\\{3,4,5\\}$。',
        run: async (S) => { await S.v.elim(3, [4, 5], null, '$c_3=\\{3,4,5\\}$'); },
      },
      {
        say: '**消 $x_4$、$x_5$**：团 $\\{4,5\\}$、$\\{5\\}$。消元结束，一共记下 5 个团。',
        run: async (S) => { await S.v.elim(4, [5], null, '$c_4=\\{4,5\\}$'); await S.v.elim(5, [], null, '$c_5=\\{5\\}$'); },
      },
      {
        say: '**只留极大团**：$\\{4,5\\}$ 和 $\\{5\\}$ 都被 $\\{3,4,5\\}$ 包含，划掉（它们的因子可以并进 $c_3$）。剩 $c_1,c_2,c_3$。',
        run: async (S) => {
          await S.all(S.v.cl.slice(3).map((p) => S.to(p, { opacity: 0.25 }, 500)));
          const strike = S.v.cl.slice(3).map((p) => S.line({ x1: 336, y1: p.get('y'), x2: 404, y2: p.get('y'), color: C.red, width: 2.5, opacity: 0 }));
          await S.all(strike.map((l) => S.draw(l, 400)));
        },
      },
      {
        say: '**团图（clique graph）**：共享变量的两个团之间连边，边权 = 共享变量个数：$c_1$—$c_2$ 共享 $\\{x_2,x_3\\}$（2），$c_2$—$c_3$ 共享 $\\{x_3,x_4\\}$（2），$c_1$—$c_3$ 只共享 $x_3$（1）。这是个三角形，有环。',
        run: async (S) => {
          const N = { 1: [470, 150], 2: [590, 150], 3: [530, 262] };
          S.v.cn = {};
          [1, 2, 3].forEach((i) => {
            S.v.cn[i] = S.circle({ cx: N[i][0], cy: N[i][1], r: 22, fill: '#20232b', color: C.yellow, width: 2, opacity: 0 });
            S.v['cl' + i] = S.label({ x: N[i][0], y: N[i][1], text: '$c_' + i + '$', opacity: 0 });
          });
          S.v.ce = {
            12: S.line({ x1: N[1][0], y1: N[1][1], x2: N[2][0], y2: N[2][1], color: C.teal, width: 2.5, opacity: 0 }),
            23: S.line({ x1: N[2][0], y1: N[2][1], x2: N[3][0], y2: N[3][1], color: C.teal, width: 2.5, opacity: 0 }),
            13: S.line({ x1: N[1][0], y1: N[1][1], x2: N[3][0], y2: N[3][1], color: C.teal, width: 2.5, opacity: 0 }),
          };
          S.v.cw = { 12: S.label({ x: 530, y: 136, text: '2', color: C.teal, opacity: 0 }), 23: S.label({ x: 574, y: 210, text: '2', color: C.teal, opacity: 0 }), 13: S.label({ x: 486, y: 210, text: '1', color: C.teal, opacity: 0 }) };
          await S.all([1, 2, 3].map((i) => S.all(S.show(S.v.cn[i]), S.show(S.v['cl' + i]))));
          for (const k of ['12', '23', '13']) await S.all(S.draw(S.v.ce[k], 450), S.show(S.v.cw[k], 300));
        },
      },
      {
        say: '**最大权重生成树**：留下权重最大、又不成环的边——去掉权 1 的 $c_1$—$c_3$。剩下的树就是 **junction tree**，边上写两团的交集（**separator**）：$\\{x_2,x_3\\}$ 和 $\\{x_3,x_4\\}$。$x_3$ 在三个团里都出现、而且沿树连续——这就是 running intersection。',
        run: async (S) => {
          await S.all(S.to(S.v.ce[13], { opacity: 0.1 }, 600), S.hide(S.v.cw[13], 400));
          S.v.cw[12].set({ text: '$\\{x_2,x_3\\}$' }); S.v.cw[23].set({ text: '$\\{x_3,x_4\\}$', x: 600 });
          await S.all(S.pulse(S.v.cw[12]), S.pulse(S.v.cw[23]));
        },
      },
    ],
  });
})(window);
