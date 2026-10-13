/* 3B1B-style scenes, batch A: eigenvectors (c04), message passing on a tree (c56), backpropagation (c34). */
(function (root) {
  'use strict';
  const SML = root.SML, A = SML.anim, C = A.C;

  /* ===================== c04 · eigenvectors as "directions that only stretch" ===================== */
  const I2 = [[1, 0], [0, 1]];
  const mixM = (P, Q, t) => P.map((row, i) => row.map((v, j) => v + (Q[i][j] - v) * t));
  const mul = (M, p) => [M[0][0] * p[0] + M[0][1] * p[1], M[1][0] * p[0] + M[1][1] * p[1]];

  A.scene('anim-eigen', {
    title: '特征向量：被矩阵"只拉伸、不转向"的方向',
    w: 640, h: 360,
    intro: '把矩阵看成"拉扯整张网格"的动作，特征向量就一眼能看出来。点 **▶ 播放** 或 **⏭ 下一步**。',
    setup(S) {
      const m = S.map(-8, 8, -4.5, 4.5);
      S.v.m = m;
      // a faint copy of the original grid stays put, so the eye can compare
      for (let k = -8; k <= 8; k++) S.line({ x1: m.X(k), y1: 0, x2: m.X(k), y2: S.H, color: '#22262e', width: 1 });
      for (let k = -4; k <= 4; k++) S.line({ x1: 0, y1: m.Y(k), x2: S.W, y2: m.Y(k), color: '#22262e', width: 1 });
      const segs = [];
      for (let k = -14; k <= 14; k++) { segs.push([[k, -14], [k, 14]]); segs.push([[-14, k], [14, k]]); }
      S.v.grid = segs.map((sg) => ({ sg, s: S.line({ color: sg[0][0] === 0 && sg[1][0] === 0 || sg[0][1] === 0 && sg[1][1] === 0 ? '#9fb3c8' : C.grid, width: sg[0][0] === 0 && sg[1][0] === 0 || sg[0][1] === 0 && sg[1][1] === 0 ? 1.6 : 1 }) }));
      S.v.track = [];                       // arrows that move with the matrix
      S.v.M = I2;
      S.v.setM = function (M) {
        S.v.M = M;
        S.v.grid.forEach(({ sg, s }) => { const a = m.P(mul(M, sg[0])), b = m.P(mul(M, sg[1])); s.set({ x1: a[0], y1: a[1], x2: b[0], y2: b[1] }); });
        S.v.track.forEach((t) => { const q = m.P(mul(M, t.p)); t.s.set({ x1: m.X(0), y1: m.Y(0), x2: q[0], y2: q[1] }); if (t.lab) { const r = m.P(mul(M, t.lp || t.p)); t.lab.set({ x: r[0] + (t.dx || 14), y: r[1] + (t.dy || -12) }); } });
      };
      S.v.morph = (M, ms) => { const M0 = S.v.M; return S.play(ms == null ? 1600 : ms, (t) => S.v.setM(mixM(M0, M, t))).then(() => { S.v.M = M; }); };
      S.v.vec = function (p, color, text, opt) {
        const s = S.arrow({ x1: m.X(0), y1: m.Y(0), x2: m.X(p[0]), y2: m.Y(p[1]), color, width: 3.2, opacity: opt && opt.hidden ? 0 : 1 });
        const t = { p, s, dx: opt && opt.dx, dy: opt && opt.dy };
        if (text) t.lab = S.label({ x: m.X(p[0]) + 14, y: m.Y(p[1]) - 12, text, color, opacity: opt && opt.hidden ? 0 : 1, size: 0.9 });
        S.v.track.push(t);
        S.v.setM(S.v.M);
        return t;
      };
      S.v.ihat = S.v.vec([1, 0], C.green, '$\\hat\\imath$');
      S.v.jhat = S.v.vec([0, 1], C.red, '$\\hat\\jmath$');
      S.v.title = S.label({ x: 14, y: 12, anchor: 'l', valign: 't', text: '', bg: 'rgba(22,23,28,.85)', opacity: 0 });
    },
    beats: [
      {
        say: '这是平面上的网格，绿色 $\\hat\\imath=(1,0)$、红色 $\\hat\\jmath=(0,1)$。矩阵 $\\mathbf A=\\begin{bmatrix}2&1\\\\1&2\\end{bmatrix}$ 是一种**变换**：把每个点 $\\mathbf v$ 搬到 $\\mathbf A\\mathbf v$。看整张网格被拉扯——$\\hat\\imath$ 落到 $\\mathbf A$ 的第 1 列 $(2,1)$，$\\hat\\jmath$ 落到第 2 列 $(1,2)$。',
        run: async (S) => {
          S.v.title.set({ text: '$\\mathbf A=\\begin{bmatrix}2&1\\\\1&2\\end{bmatrix}$' });
          await S.show(S.v.title);
          await S.v.morph([[2, 1], [1, 2]]);
        },
      },
      {
        say: '先放回原样，拿一个普通向量 $(1.5,\\ 0.5)$（黄色），虚线是它所在的直线。变换后它变成 $\\mathbf A(1.5,0.5)=(3.5,\\ 2.5)$——**离开了原来那条线**，方向变了。大多数向量都会这样被"转向"。',
        run: async (S) => {
          await S.v.morph(I2, 900);
          const m = S.v.m;
          S.v.yline = S.line({ x1: m.X(-12), y1: m.Y(-4), x2: m.X(12), y2: m.Y(4), color: C.yellow, width: 1.5, dash: '6 6', opacity: 0 });
          S.v.y = S.v.vec([1.5, 0.5], C.yellow, '', { hidden: true });
          await S.all(S.show(S.v.yline), S.show(S.v.y.s));
          await S.v.morph([[2, 1], [1, 2]]);
        },
      },
      {
        say: '但有一条特殊的直线：沿 $(1,1)$ 方向（青色）。这条线上的向量变换后**还在这条线上**，只是被拉长了 3 倍：$\\mathbf A\\begin{bmatrix}1\\\\1\\end{bmatrix}=\\begin{bmatrix}3\\\\3\\end{bmatrix}=3\\begin{bmatrix}1\\\\1\\end{bmatrix}$。',
        run: async (S) => {
          await S.v.morph(I2, 900);
          await S.all(S.hide(S.v.yline), S.hide(S.v.y.s));
          const m = S.v.m;
          S.v.l1 = S.line({ x1: m.X(-6), y1: m.Y(-6), x2: m.X(6), y2: m.Y(6), color: C.teal, width: 1.5, dash: '6 6', opacity: 0 });
          S.v.e1 = S.v.vec([1, 1], C.teal, '', { hidden: true });
          await S.all(S.draw(S.v.l1, 700), S.show(S.v.e1.s));
          await S.v.morph([[2, 1], [1, 2]]);
          S.v.k1 = S.label({ x: m.X(3) + 16, y: m.Y(3) - 6, anchor: 'l', text: '$\\times 3$', color: C.teal, size: 1.2, opacity: 0 });
          await S.show(S.v.k1);
        },
      },
      {
        say: '另一条：沿 $(1,-1)$ 方向（紫色）。这条线上的向量**一动不动**，拉伸 1 倍：$\\mathbf A\\begin{bmatrix}1\\\\-1\\end{bmatrix}=\\begin{bmatrix}1\\\\-1\\end{bmatrix}$。',
        run: async (S) => {
          await S.hide(S.v.k1, 250);
          await S.v.morph(I2, 900);
          const m = S.v.m;
          S.v.l2 = S.line({ x1: m.X(-6), y1: m.Y(6), x2: m.X(6), y2: m.Y(-6), color: C.purple, width: 1.5, dash: '6 6', opacity: 0 });
          S.v.e2 = S.v.vec([1, -1], C.purple, '', { hidden: true });
          await S.all(S.draw(S.v.l2, 700), S.show(S.v.e2.s));
          await S.v.morph([[2, 1], [1, 2]]);
          S.v.k2 = S.label({ x: m.X(1) + 14, y: m.Y(-1) + 14, anchor: 'l', text: '$\\times 1$', color: C.purple, size: 1.2, opacity: 0 });
          await S.all(S.show(S.v.k2), S.show(S.v.k1));
        },
      },
      {
        say: '这两个方向就是 $\\mathbf A$ 的 **eigenvector（特征向量）**，拉伸的倍数就是 **eigenvalue（特征值）**：$\\mathbf A\\mathbf v=\\lambda\\mathbf v$，这里 $\\lambda=3$ 和 $1$。两个都 $>0$——没有哪个方向被压扁或翻到背后，所以 $\\mathbf A$ 是 **PD（正定）**，可以撤销（可逆）。',
        run: async (S) => {
          S.v.formula = S.label({ x: S.W - 14, y: S.H - 14, anchor: 'r', valign: 'b', text: '$\\mathbf A\\mathbf v=\\lambda\\mathbf v$', size: 1.35, color: C.yellow, bg: 'rgba(22,23,28,.85)', opacity: 0 });
          await S.show(S.v.formula);
          await S.all(S.pulse(S.v.e1.s), S.pulse(S.v.e2.s));
        },
      },
      {
        say: '换成 $\\mathbf B=\\begin{bmatrix}1&1\\\\1&1\\end{bmatrix}$：方向 $(1,-1)$ 的特征值是 **0**——整个平面被**压扁成一条线**。压扁后很多不同的点落在同一位置，没法"撤销"，所以 $\\mathbf B$ **没有逆**。c04 的"米 / 厘米两列"让 $\\mathbf X\'\\mathbf X$ 不可逆，就是这种情况。',
        run: async (S) => {
          await S.all(S.hide(S.v.k1, 250), S.hide(S.v.k2, 250), S.hide(S.v.formula, 250));
          await S.v.morph(I2, 900);
          S.v.title.set({ text: '$\\mathbf B=\\begin{bmatrix}1&1\\\\1&1\\end{bmatrix}$' });
          await S.v.morph([[1, 1], [1, 1]], 1800);
          const m = S.v.m;
          S.v.k0 = S.label({ x: m.X(0) + 18, y: m.Y(0) + 26, anchor: 'l', text: '$(1,-1)\\to\\mathbf 0$，$\\lambda=0$', color: C.purple, size: 1.05, opacity: 0 });
          await S.show(S.v.k0);
        },
      },
    ],
  });

  /* ===================== c56 · message passing on the 5-room tree ===================== */
  const NODES = { x1: [110, 62], x2: [110, 182], x3: [290, 182], x4: [110, 302], x5: [290, 302] };
  const EDGES = [['x1', 'x2', '\\psi_{12}'], ['x2', 'x3', '\\psi_{23}'], ['x2', 'x4', '\\psi_{24}'], ['x4', 'x5', '\\psi_{45}']];
  const sub = { x1: 'x_1', x2: 'x_2', x3: 'x_3', x4: 'x_4', x5: 'x_5' };

  function treeSetup(S) {
    S.v.edge = {};
    EDGES.forEach(([a, b, lab]) => {
      const [x1, y1] = NODES[a], [x2, y2] = NODES[b];
      S.v.edge[a + b] = S.line({ x1, y1, x2, y2, color: C.grey, width: 2 });
      S.label({ x: (x1 + x2) / 2 + (x1 === x2 ? -22 : 0), y: (y1 + y2) / 2 + (y1 === y2 ? -14 : 0), text: '$' + lab + '$', color: C.grey, size: 0.8 });
    });
    S.v.node = {};
    Object.keys(NODES).forEach((id) => {
      const [x, y] = NODES[id];
      S.v.node[id] = S.circle({ cx: x, cy: y, r: 21, fill: '#20232b', color: id === 'x4' ? C.red : C.white, width: id === 'x4' ? 3 : 2 });
      S.label({ x, y, text: '$' + sub[id] + '$', size: 1.05 });
    });
    S.label({ x: 16, y: S.H - 14, anchor: 'l', valign: 'b', text: '消息的括号 =（热，冷）两个数', size: 0.78, color: C.grey });
    S.v.panel = [];
    S.v.say = function (lines) {          // right-hand working panel
      S.v.panel.forEach((l) => l.set({ opacity: 0 }));
      S.v.panel = lines.map((t, i) => S.label({ x: 372, y: 60 + i * 34, anchor: 'l', text: t, size: 0.92, opacity: 0, color: i === 0 ? C.yellow : C.white }));
      return S.all(S.v.panel.map((l, i) => S.wait(i * 160).then(() => S.show(l, 350))));
    };
    // a message is a little pill that flies along an edge
    S.v.msg = function (from, to, text, color) {
      const [x1, y1] = NODES[from], [x2, y2] = NODES[to];
      const pill = S.label({ x: x1, y: y1, text, color: '#16171c', bg: color || C.yellow, size: 0.85, opacity: 0 });
      const park = [x1 + (x2 - x1) * 0.55 + (x1 === x2 ? 34 : 0), y1 + (y2 - y1) * 0.55 + (y1 === y2 ? 20 : 0)];
      return S.show(pill, 200).then(() => S.to(pill, { x: park[0], y: park[1] }, 900)).then(() => pill);
    };
  }

  A.scene('anim-msgpass', {
    title: '树上的消息传递：从叶子把求和一路"打包"送到 $x_4$',
    w: 640, h: 360,
    intro: '课件 L21 的 5 个房间（同 c56 正文的打分表）。没有任何观测，问 $x_4$（红圈）热的概率。点 **▶ 播放** 或 **⏭ 下一步**。',
    setup: treeSetup,
    beats: [
      {
        say: '笨办法：其余 4 个房间 $x_1,x_2,x_3,x_5$ 各有热 / 冷两种，共 $2^4=16$ 种组合，每种把 4 张表的分数相乘再加起来。房间一多，这个数会爆炸。',
        run: async (S) => {
          const cells = [];
          for (let i = 0; i < 16; i++) cells.push(S.rect({ x: 380 + (i % 8) * 30, y: 130 + Math.floor(i / 8) * 30, w: 24, h: 24, rx: 4, fill: C.dim, opacity: 0 }));
          S.v.cells = cells;
          await S.v.say(['逐个枚举：16 种组合', '每种：4 个分数相乘', '再全部加起来']);
          for (let i = 0; i < 16; i++) { cells[i].set({ fill: C.blue }); await S.show(cells[i], 70); }
        },
      },
      {
        say: '换个做法：**从叶子开始**。$x_5$ 只连着 $x_4$，所以先把 $x_5$ 的两种情况加掉——$x_4$ 热时 $\\psi_{45}(\\text{热},\\text{热})+\\psi_{45}(\\text{热},\\text{冷})=3+1=4$，冷时 $1+2=3$。打包成一条**消息** $m_{5\\to4}=(4,3)$ 送给 $x_4$。',
        run: async (S) => {
          await S.all(S.v.cells.map((c) => S.hide(c, 300)));
          S.v.node.x5.set({ fill: '#4a3f1c' });
          await S.v.say(['$m_{5\\to4}$：把 $x_5$ 加掉', '$x_4$ 热：$3+1=4$', '$x_4$ 冷：$1+2=3$']);
          S.v.m54 = await S.v.msg('x5', 'x4', '$(4,3)$');
        },
      },
      {
        say: '同样，叶子 $x_1$ 把自己加掉，送给 $x_2$：$x_2$ 热时 $3+1=4$，冷时 $1+1=2$，消息 $(4,2)$。',
        run: async (S) => {
          S.v.node.x1.set({ fill: '#4a3f1c' });
          await S.v.say(['$m_{1\\to2}$：把 $x_1$ 加掉', '$x_2$ 热：$3+1=4$', '$x_2$ 冷：$1+1=2$']);
          S.v.m12 = await S.v.msg('x1', 'x2', '$(4,2)$');
        },
      },
      {
        say: '叶子 $x_3$ 也送给 $x_2$：热 $1+2=3$，冷 $1+1=2$，消息 $(3,2)$。',
        run: async (S) => {
          S.v.node.x3.set({ fill: '#4a3f1c' });
          await S.v.say(['$m_{3\\to2}$：把 $x_3$ 加掉', '$x_2$ 热：$1+2=3$', '$x_2$ 冷：$1+1=2$']);
          S.v.m32 = await S.v.msg('x3', 'x2', '$(3,2)$');
        },
      },
      {
        say: '$x_2$ 收齐了两条来信，先**逐项相乘**：热 $4\\times3=12$，冷 $2\\times2=4$。再乘上通往 $x_4$ 的 $\\psi_{24}$、把 $x_2$ 加掉：$x_4$ 热 $4\\times12+1\\times4=52$，冷 $1\\times12+2\\times4=20$。',
        run: async (S) => {
          const [x, y] = NODES.x2;
          await S.all(S.to(S.v.m12, { x: x + 52, y: y - 30 }, 600), S.to(S.v.m32, { x: x + 52, y: y - 30 }, 600));
          S.v.m12.set({ opacity: 0 });
          S.v.m32.set({ text: '$(12,4)$' });
          await S.pulse(S.v.m32);
          S.v.node.x2.set({ fill: '#4a3f1c' });
          await S.v.say(['$m_{2\\to4}$：乘来信，再把 $x_2$ 加掉', '来信相乘：$(4\\cdot3,\\ 2\\cdot2)=(12,4)$', '$x_4$ 热：$4\\cdot12+1\\cdot4=52$', '$x_4$ 冷：$1\\cdot12+2\\cdot4=20$']);
          await S.hide(S.v.m32, 300);
          S.v.m24 = await S.v.msg('x2', 'x4', '$(52,20)$');
        },
      },
      {
        say: '到达 $x_4$：两条来信相乘 $(52\\times4,\\ 20\\times3)=(208,\\ 60)$，归一化：$P(x_4=\\text{热})=\\frac{208}{268}\\approx0.78$。和逐个枚举 16 种组合**结果完全一样**，但只做了十来次小加法和乘法——把求和"往里推"，就是 variable elimination。',
        run: async (S) => {
          const [x, y] = NODES.x4;
          await S.all(S.to(S.v.m24, { x: x + 64, y: y + 34 }, 600), S.to(S.v.m54, { x: x + 64, y: y + 34 }, 600));
          S.v.m24.set({ opacity: 0 });
          S.v.m54.set({ text: '$(208,60)$', bg: C.red, color: '#fff' });
          await S.pulse(S.v.m54);
          await S.v.say(['$x_4$：来信相乘', '$(52\\cdot4,\\ 20\\cdot3)=(208,60)$', '归一化：$208/268\\approx0.78$']);
          const base = 300, hHot = 0.78 * 120, hCold = 0.22 * 120;
          const b1 = S.rect({ x: 400, y: base, w: 46, h: 0, rx: 3, fill: C.red });
          const b2 = S.rect({ x: 470, y: base, w: 46, h: 0, rx: 3, fill: C.blue });
          S.label({ x: 423, y: base + 14, text: '热', size: 0.85 }); S.label({ x: 493, y: base + 14, text: '冷', size: 0.85 });
          await S.all(S.to(b1, { y: base - hHot, h: hHot }, 800), S.to(b2, { y: base - hCold, h: hCold }, 800));
          S.label({ x: 423, y: base - hHot - 14, text: '0.78', size: 0.85, color: C.red });
          S.label({ x: 493, y: base - hCold - 14, text: '0.22', size: 0.85, color: C.blue });
        },
      },
    ],
  });

  /* ===================== c34 · backpropagation on the T10 example network ===================== */
  const NN = { x0: [70, 110], x1: [70, 250], u0: [300, 52], u1: [300, 170], u2: [300, 290], z: [520, 170] };
  const NE = [['x0', 'u1', '0.5'], ['x0', 'u2', '-0.5'], ['x1', 'u1', '1'], ['x1', 'u2', '1'], ['u0', 'z', '0'], ['u1', 'z', '1'], ['u2', 'z', '-1']];
  const nnName = { x0: 'x_0', x1: 'x_1', u0: 'u_0', u1: 'u_1', u2: 'u_2', z: 'z' };

  A.scene('anim-backprop', {
    title: '反向传播：数值先往前流，误差再往回流',
    w: 640, h: 340,
    intro: '用 T10 的数值例子：输入 $x_0=1$（偏置）、$x_1=1$，两个 ReLU 隐藏单元，恒等输出，目标 $y=0$，平方损失。边上的数是权重。',
    setup(S) {
      S.v.e = {};
      NE.forEach(([a, b, w]) => {
        const [x1, y1] = NN[a], [x2, y2] = NN[b];
        S.v.e[a + b] = S.line({ x1, y1, x2, y2, color: C.dim, width: 2.2 });
        const t = 0.32;
        S.label({ x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t - 10, text: w, size: 0.75, color: C.grey });
      });
      S.v.n = {}; S.v.val = {};
      Object.keys(NN).forEach((id) => {
        const [x, y] = NN[id];
        S.v.n[id] = S.circle({ cx: x, cy: y, r: 22, fill: '#20232b', color: C.white, width: 2 });
        S.label({ x, y, text: '$' + nnName[id] + '$', size: 0.95 });
        S.v.val[id] = S.label({ x: x, y: y + 36, text: '', size: 0.85, color: C.yellow, opacity: 0 });
      });
      S.v.val.x0.set({ text: '1', opacity: 1 }); S.v.val.x1.set({ text: '1', opacity: 1 }); S.v.val.u0.set({ text: '1（偏置）', opacity: 1 });
      S.v.side = S.label({ x: 410, y: 300, anchor: 'l', text: '', size: 0.9, opacity: 0 });
      // a dot that travels along an edge
      S.v.flow = function (a, b, color, back) {
        const [x1, y1] = back ? NN[b] : NN[a], [x2, y2] = back ? NN[a] : NN[b];
        const dot = S.circle({ cx: x1, cy: y1, r: 6, fill: color, opacity: 1 });
        S.v.e[a + b].set({ color });
        return S.to(dot, { cx: x2, cy: y2 }, 900).then(() => S.hide(dot, 200));
      };
      S.v.grad = function (a, b, text) {
        const [x1, y1] = NN[a], [x2, y2] = NN[b];
        const g = S.label({ x: x1 + (x2 - x1) * 0.66, y: y1 + (y2 - y1) * 0.66 + 12, text, size: 0.78, color: '#16171c', bg: C.red, opacity: 0 });
        return S.show(g, 300);
      };
    },
    beats: [
      {
        say: '**前向第 1 步**：每个隐藏单元先算加权和 $r_j=\\sum_i x_iv_{ij}$。$r_1=0.5\\cdot1+1\\cdot1=1.5$，$r_2=-0.5\\cdot1+1\\cdot1=0.5$。ReLU 让正数原样通过：$u_1=1.5$，$u_2=0.5$。',
        run: async (S) => {
          await S.all(S.v.flow('x0', 'u1', C.blue), S.v.flow('x1', 'u1', C.blue), S.v.flow('x0', 'u2', C.blue), S.v.flow('x1', 'u2', C.blue));
          S.v.val.u1.set({ text: '$r_1=1.5\\to u_1=1.5$' }); S.v.val.u2.set({ text: '$r_2=0.5\\to u_2=0.5$' });
          await S.all(S.show(S.v.val.u1), S.show(S.v.val.u2));
        },
      },
      {
        say: '**前向第 2 步**：输出 $s=w_0u_0+w_1u_1+w_2u_2=0\\cdot1+1\\cdot1.5+(-1)\\cdot0.5=1$，恒等输出 $z=s=1$。损失 $L=\\frac12(z-y)^2=\\frac12(1-0)^2=0.5$。',
        run: async (S) => {
          await S.all(S.v.flow('u0', 'z', C.blue), S.v.flow('u1', 'z', C.blue), S.v.flow('u2', 'z', C.blue));
          S.v.val.z.set({ text: '$z=1,\\ L=0.5$' });
          await S.show(S.v.val.z);
        },
      },
      {
        say: '**反向从输出开始**。损失对输出的敏感度 $\\delta=\\dfrac{\\partial L}{\\partial s}=z-y=1$（平方损失 + 恒等输出时）。这个 $\\delta$ 会被后面所有梯度反复用到。',
        run: async (S) => {
          Object.keys(S.v.e).forEach((k) => S.v.e[k].set({ color: C.dim }));
          await S.to(S.v.n.z, { color: C.red, width: 3.5 }, 500);
          S.v.side.set({ text: '$\\delta=z-y=1$', color: C.red });
          await S.show(S.v.side);
          await S.pulse(S.v.n.z);
        },
      },
      {
        say: '**输出层的梯度** = $\\delta\\times$ 这条边"上游送进来的值"：$\\dfrac{\\partial L}{\\partial w_j}=\\delta\\,u_j$，所以三条边分别是 $1\\times1=1$、$1\\times1.5=1.5$、$1\\times0.5=0.5$。',
        run: async (S) => {
          await S.all(S.v.flow('u0', 'z', C.red, true), S.v.flow('u1', 'z', C.red, true), S.v.flow('u2', 'z', C.red, true));
          await S.all(S.v.grad('u0', 'z', '1'), S.v.grad('u1', 'z', '1.5'), S.v.grad('u2', 'z', '0.5'));
        },
      },
      {
        say: '**继续往回传到隐藏单元**：$\\varepsilon_j=\\delta\\cdot w_j\\cdot g\'(r_j)$。ReLU 在正数处导数为 1，所以 $\\varepsilon_1=1\\cdot1\\cdot1=1$，$\\varepsilon_2=1\\cdot(-1)\\cdot1=-1$。',
        run: async (S) => {
          S.v.val.u1.set({ text: '$\\varepsilon_1=1$', color: C.red }); S.v.val.u2.set({ text: '$\\varepsilon_2=-1$', color: C.red });
          await S.all(S.to(S.v.n.u1, { color: C.red }, 500), S.to(S.v.n.u2, { color: C.red }, 500));
          await S.all(S.pulse(S.v.n.u1), S.pulse(S.v.n.u2));
        },
      },
      {
        say: '**最后是输入层的梯度**：$\\dfrac{\\partial L}{\\partial v_{ij}}=\\varepsilon_j\\,x_i$，四条边都是 $\\pm1$。注意每个梯度都只是"往回流的误差 × 往前流的值"——$\\delta$、$\\varepsilon$ 算一次就被所有下游复用，这就是 backprop 比逐个求导省的原因。',
        run: async (S) => {
          await S.all(S.v.flow('x0', 'u1', C.red, true), S.v.flow('x1', 'u1', C.red, true), S.v.flow('x0', 'u2', C.red, true), S.v.flow('x1', 'u2', C.red, true));
          await S.all(S.v.grad('x0', 'u1', '1'), S.v.grad('x1', 'u1', '1'), S.v.grad('x0', 'u2', '-1'), S.v.grad('x1', 'u2', '-1'));
        },
      },
    ],
  });
})(window);
