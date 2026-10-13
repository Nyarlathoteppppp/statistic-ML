/* 3B1B-style scenes, batch B: gradient descent (c13), 1-D convolution (c38), attention (c41), ridge vs lasso (c17). */
(function (root) {
  'use strict';
  const SML = root.SML, A = SML.anim, C = A.C;
  const f2 = (v) => String(+v.toFixed(2));

  /* ===================== c13 · gradient descent ===================== */
  A.scene('anim-gd', {
    title: '梯度下降：顺着坡往下走，步子太大会来回乱跳',
    w: 640, h: 360,
    intro: '先在一维的碗 $L(\\theta)=\\theta^2$ 上看，再到二维。点 **▶ 播放** 或 **⏭ 下一步**。',
    setup(S) {
      const m = S.map(-5, 5, -1.5, 26, [40, 18, 560, 300]);
      S.v.m = m;
      const pts = [];
      for (let i = 0; i <= 200; i++) { const t = -5 + i * 0.05; pts.push(m.P([t, t * t])); }
      S.v.one = [];
      S.v.one.push(S.line({ x1: m.X(-5), y1: m.Y(0), x2: m.X(5), y2: m.Y(0), color: C.dim, width: 1.5 }));
      S.v.one.push(S.path({ d: 'M' + pts.map((p) => p.join(',')).join(' L'), color: C.blue, width: 3 }));
      S.v.one.push(S.label({ x: m.X(4.3), y: m.Y(22), text: '$L(\\theta)=\\theta^2$', color: C.blue }));
      S.v.ball = S.circle({ cx: m.X(4), cy: m.Y(16), r: 9, fill: C.yellow, opacity: 0 });
      S.v.tan = S.line({ x1: 0, y1: 0, x2: 0, y2: 0, color: C.red, width: 2.5, opacity: 0 });
      S.v.th = S.label({ x: m.X(4), y: m.Y(0) + 16, text: '', size: 0.85, color: C.yellow, opacity: 0 });
      S.v.note = S.label({ x: 28, y: 22, anchor: 'l', valign: 't', text: '', size: 0.95, bg: 'rgba(22,23,28,.85)', opacity: 0 });
      S.v.place = function (t) {             // put the ball (and its tangent) at theta = t
        const y = t * t, k = 2 * t, d = 1.1;
        S.v.ball.set({ cx: m.X(t), cy: m.Y(y) });
        S.v.tan.set({ x1: m.X(t - d), y1: m.Y(y - k * d), x2: m.X(t + d), y2: m.Y(y + k * d) });
        S.v.th.set({ x: m.X(t), text: '$\\theta=' + f2(t) + '$' });
      };
      S.v.jump = function (t0, t1, ms) {    // animate a GD step: slide along the axis, ride the curve
        const arrow = S.arrow({ x1: m.X(t0), y1: m.Y(0) - 4, x2: m.X(t0), y2: m.Y(0) - 4, color: C.yellow, width: 2.5 });
        return S.play(ms || 700, (u) => { const t = t0 + (t1 - t0) * u; S.v.place(t); arrow.set({ x2: m.X(t) }); })
          .then(() => S.hide(arrow, 250));
      };
      S.v.place(4);
    },
    beats: [
      {
        say: '损失 $L(\\theta)=\\theta^2$ 的最低点在 $\\theta=0$。我们现在站在 $\\theta=4$。红线是脚下的切线，**梯度就是它的斜率** $L\'(\\theta)=2\\theta=8$——正数，说明往右走会更高。',
        run: async (S) => {
          await S.all(S.show(S.v.ball), S.show(S.v.th));
          await S.draw(S.v.tan, 600);
          S.v.note.set({ text: '斜率 $L\'(4)=2\\times4=8$' });
          await S.show(S.v.note);
        },
      },
      {
        say: '梯度下降：朝斜率的**反方向**走，步长是斜率的 $\\eta$ 倍：$\\theta\\leftarrow\\theta-\\eta L\'(\\theta)$。取 $\\eta=0.25$：$4-0.25\\times8=2$，$2-0.25\\times4=1$，然后 $0.5$、$0.25$……越靠近谷底斜率越小，**步子自动变小**，稳稳滑到底。',
        run: async (S) => {
          let t = 4;
          for (let i = 0; i < 4; i++) {
            const t1 = t - 0.25 * 2 * t;
            S.v.note.set({ text: '$\\theta\\leftarrow' + f2(t) + '-0.25\\times' + f2(2 * t) + '=' + f2(t1) + '$' });
            await S.v.jump(t, t1, 650);
            t = t1;
          }
        },
      },
      {
        say: '步子太大会怎样？从 $\\theta=1$ 开始，$\\eta=1.1$：$1-1.1\\times2=-1.2$，$-1.2-1.1\\times(-2.4)=1.44$，再到 $-1.73$……每一步都**跨过谷底**，而且落点越来越高——**发散**。学习率要调，就是这个原因。',
        run: async (S) => {
          S.v.place(1);
          S.v.tan.set({ color: C.red });
          let t = 1;
          for (let i = 0; i < 4; i++) {
            const t1 = t - 1.1 * 2 * t;
            S.v.note.set({ text: '$\\theta\\leftarrow' + f2(t) + '-1.1\\times' + f2(2 * t) + '=' + f2(t1) + '$', color: C.red });
            await S.v.jump(t, t1, 600);
            t = t1;
          }
        },
      },
      {
        say: '多维时梯度是一个**向量**，指向最陡的上坡，并且**垂直于等高线**。下面是碗 $L=q_1^2+4q_2^2$ 的等高线（一圈圈椭圆，越往外越高）。$\\eta=0.1$：每步 $q_1$ 乘 $1-0.1\\times2=0.8$，$q_2$ 乘 $1-0.1\\times8=0.2$，从 $(4,2)$ 平稳滑进中心。',
        run: async (S) => {
          await S.all(S.v.one.concat([S.v.ball, S.v.tan, S.v.th, S.v.note]).map((o) => S.hide(o, 400)));
          const m2 = S.map(-5, 5, -2.8, 2.8, [40, 20, 560, 314]);
          S.v.m2 = m2;
          [1, 4, 9, 16, 25].forEach((c) => {
            const pts = [];
            for (let i = 0; i <= 120; i++) { const a = i / 120 * 2 * Math.PI; pts.push(m2.P([Math.sqrt(c) * Math.cos(a), Math.sqrt(c) / 2 * Math.sin(a)])); }
            const e = S.path({ d: 'M' + pts.map((p) => p.join(',')).join(' L') + 'Z', color: C.grid, width: 1.6, opacity: 0 });
            S.show(e, 500);
          });
          S.circle({ cx: m2.X(0), cy: m2.Y(0), r: 4, fill: C.white });
          await S.wait(500);
          S.v.path = async function (eta, color) {
            let q = [4, 2];
            const ball = S.circle({ cx: m2.X(q[0]), cy: m2.Y(q[1]), r: 7, fill: color });
            for (let i = 0; i < 9; i++) {
              const q1 = [q[0] * (1 - 2 * eta), q[1] * (1 - 8 * eta)];
              const seg = S.line({ x1: m2.X(q[0]), y1: m2.Y(q[1]), x2: m2.X(q1[0]), y2: m2.Y(q1[1]), color, width: 2.4, opacity: 0 });
              await S.all(S.draw(seg, 380), S.to(ball, { cx: m2.X(q1[0]), cy: m2.Y(q1[1]) }, 380));
              q = q1;
            }
          };
          await S.v.path(0.1, C.green);
        },
      },
      {
        say: '把 $\\eta$ 调到 $0.24$：陡的方向（$q_2$）每步乘 $1-8\\times0.24=-0.92$——**来回横跳**，很久都停不下来；平的方向（$q_1$）每步乘 $0.52$，慢慢挪。这种"狭长山谷"正是 c35 的 momentum、Adam 要解决的问题。',
        run: async (S) => { await S.v.path(0.24, C.red); },
      },
    ],
  });

  /* ===================== c38 · 1-D convolution sliding window ===================== */
  const IN = [1, 2, 3, 4, 5], W = [1, 0, -1], WC = [C.teal, C.purple, C.orange];
  A.scene('anim-conv', {
    title: '卷积：同一个小模板滑过每个位置',
    w: 640, h: 340,
    intro: '输入 $[1,2,3,4,5]$，filter $[1,0,-1]$（宽 3，stride 1，不补零）。',
    setup(S) {
      const cx = (i) => 150 + i * 80;
      S.v.cx = cx;
      S.label({ x: 40, y: 70, anchor: 'l', text: '输入', color: C.grey, size: 0.9 });
      S.label({ x: 40, y: 285, anchor: 'l', text: '输出', color: C.grey, size: 0.9 });
      S.v.inCells = IN.map((v, i) => { S.rect({ x: cx(i) - 27, y: 43, w: 54, h: 54, rx: 6, fill: '#20232b', color: C.blue, width: 2 }); return S.label({ x: cx(i), y: 70, text: String(v), size: 1.2 }); });
      S.v.outCells = [0, 1, 2].map((j) => {
        S.rect({ x: cx(j + 1) - 27, y: 258, w: 54, h: 54, rx: 6, fill: '#20232b', color: C.dim, width: 2 });
        return S.label({ x: cx(j + 1), y: 285, text: '', size: 1.2, color: C.yellow });
      });
      S.v.filt = S.group({ x: 0, y: 0, opacity: 0 });
      W.forEach((w, k) => {
        S.rect({ parent: S.v.filt, x: cx(k) - 27, y: 150, w: 54, h: 44, rx: 6, fill: '#20232b', color: WC[k], width: 2.5 });
      });
      S.v.wl = W.map((w, k) => S.label({ x: cx(k), y: 172, text: String(w), color: WC[k], size: 1.1, opacity: 0 }));
      S.v.prod = [0, 1, 2].map(() => S.label({ x: 0, y: 123, text: '', size: 0.9, opacity: 0 }));
      S.v.sum = S.label({ x: 0, y: 220, text: '', size: 1, color: C.yellow, opacity: 0 });
      S.v.pos = 0;
      S.v.moveTo = function (j, ms) {     // slide the filter so it covers inputs j..j+2
        const dx = (j - S.v.pos) * 80, from = S.v.filt.get('x');
        S.v.pos = j;
        return S.all(S.to(S.v.filt, { x: from + dx }, ms), W.map((w, k) => S.to(S.v.wl[k], { x: cx(j + k) }, ms)));
      };
      S.v.apply = async function (j) {
        const pr = W.map((w, k) => IN[j + k] * w);
        await S.all(pr.map((p, k) => { S.v.prod[k].set({ x: cx(j + k), text: '$' + IN[j + k] + '\\times' + (W[k] < 0 ? '(' + W[k] + ')' : W[k]) + '$' }); return S.show(S.v.prod[k], 300); }));
        const tot = pr.reduce((a, b) => a + b, 0);
        S.v.sum.set({ x: cx(j + 1), y: 220, text: '$' + pr.map((p) => (p < 0 ? '(' + p + ')' : p)).join('+') + '=' + tot + '$' });
        await S.show(S.v.sum, 300);
        await S.to(S.v.sum, { y: 285, opacity: 0 }, 600);
        S.v.outCells[j].set({ text: String(tot) });
        await S.pulse(S.v.outCells[j]);
        await S.all(S.v.prod.map((p) => S.hide(p, 200)));
      };
    },
    beats: [
      {
        say: '卷积用的是一个很小的模板（**filter / kernel**），这里宽 3，权重 $[1,0,-1]$。先把它对准输入的前三格。',
        run: async (S) => { await S.all(S.show(S.v.filt), S.v.wl.map((l) => S.show(l))); },
      },
      {
        say: '**逐格相乘再相加**：$1\\times1+2\\times0+3\\times(-1)=-2$，这就是第 1 个输出。',
        run: async (S) => { await S.v.apply(0); },
      },
      {
        say: '整体右移一格（stride 1），**还是同一组权重** $[1,0,-1]$：$2\\times1+3\\times0+4\\times(-1)=-2$。',
        run: async (S) => { await S.v.moveTo(1, 700); await S.v.apply(1); },
      },
      {
        say: '再移一格：$3-5=-2$。5 个输入、宽 3 的 filter、stride 1 ⇒ 能放 $5-3+1=3$ 个位置，所以输出 3 个数。（这个 filter 在找"左大右小"的变化，平稳上升的输入处处给出 $-2$。）',
        run: async (S) => { await S.v.moveTo(2, 700); await S.v.apply(2); },
      },
      {
        say: '换成网络图看：每个输出单元只连 3 个输入；同一种颜色的边在每个位置都是**同一个权重**（weight sharing）。所以不管输出有几个，这一层的参数只有 **3 个**——T3 真题里卷积层算 3、不算 $3\\times5$，就是这个原因。',
        run: async (S) => {
          await S.hide(S.v.filt, 300); S.v.wl.forEach((l) => l.set({ opacity: 0 }));
          const cx = S.v.cx, edges = [];
          for (let j = 0; j < 3; j++) for (let k = 0; k < 3; k++) {
            const e = S.line({ x1: cx(j + k), y1: 98, x2: cx(j + 1), y2: 257, color: WC[k], width: 2.6, opacity: 0 });
            edges.push(e);
          }
          for (let j = 0; j < 3; j++) await S.all(edges.slice(j * 3, j * 3 + 3).map((e) => S.draw(e, 500)));
          S.label({ x: 560, y: 160, anchor: 'l', text: '$w_1$', color: C.teal }); S.label({ x: 560, y: 190, anchor: 'l', text: '$w_2$', color: C.purple }); S.label({ x: 560, y: 220, anchor: 'l', text: '$w_3$', color: C.orange });
        },
      },
    ],
  });

  /* ===================== c41 · attention ===================== */
  const H = [[1, 1.5], [2, -0.5], [0, -2]], HC = [C.blue, C.green, C.purple];
  const E = H.map((h) => h[0]);                                        // q = (1,0) so q·h = h[0]
  const EX = E.map((e) => Math.exp(e)), Z = EX.reduce((a, b) => a + b, 0), AL = EX.map((e) => e / Z);
  const CTX = [0, 1].map((d) => H.reduce((s, h, j) => s + AL[j] * h[d], 0));
  A.scene('anim-attention', {
    title: 'Attention：打分 → softmax → 加权平均',
    w: 640, h: 340,
    intro: '解码器当前的状态是 query $\\mathbf q$（黄）；编码器在三个位置的隐藏状态是 $\\mathbf h_1,\\mathbf h_2,\\mathbf h_3$。为了好画，都是二维向量。',
    setup(S) {
      const m = S.map(-1, 3, -2.6, 2.4, [20, 10, 320, 320]);
      S.v.m = m;
      S.line({ x1: m.X(-1), y1: m.Y(0), x2: m.X(3), y2: m.Y(0), color: C.dim, width: 1.2 });
      S.line({ x1: m.X(0), y1: m.Y(-2.6), x2: m.X(0), y2: m.Y(2.4), color: C.dim, width: 1.2 });
      S.v.q = S.arrow({ x1: m.X(0), y1: m.Y(0), x2: m.X(1), y2: m.Y(0), color: C.yellow, width: 4 });
      S.label({ x: m.X(1) + 4, y: m.Y(0) + 16, text: '$\\mathbf q$', color: C.yellow });
      S.v.h = H.map((h, j) => {
        const a = S.arrow({ x1: m.X(0), y1: m.Y(0), x2: m.X(h[0]), y2: m.Y(h[1]), color: HC[j], width: 3 });
        S.label({ x: m.X(h[0]) + 16, y: m.Y(h[1]) - 6, text: '$\\mathbf h_' + (j + 1) + '$', color: HC[j] });
        return a;
      });
      // bar chart on the right
      S.v.bx = (j) => 410 + j * 72;
      S.v.base = 280;
      S.v.bars = H.map((h, j) => S.rect({ x: S.v.bx(j), y: S.v.base, w: 44, h: 0, rx: 3, fill: HC[j] }));
      S.v.bl = H.map((h, j) => S.label({ x: S.v.bx(j) + 22, y: S.v.base - 12, text: '', size: 0.85, opacity: 0, color: HC[j] }));
      H.forEach((h, j) => S.label({ x: S.v.bx(j) + 22, y: S.v.base + 16, text: '位置 ' + (j + 1), size: 0.8, color: C.grey }));
      S.v.head = S.label({ x: 400, y: 26, anchor: 'l', text: '', size: 0.95, color: C.white, opacity: 0 });
      S.v.setBars = (vals, scale, fmt, ms) => S.all(vals.map((v, j) => {
        S.v.bl[j].set({ text: fmt(v) });
        return S.all(S.to(S.v.bars[j], { y: S.v.base - v * scale, h: v * scale }, ms), S.to(S.v.bl[j], { y: S.v.base - v * scale - 12, opacity: 1 }, ms));
      }));
    },
    beats: [
      {
        say: '**第 1 步：打分**。用点积看每个位置和 query 有多"对得上"：$e_j=\\mathbf q\\cdot\\mathbf h_j$。$\\mathbf q=(1,0)$，点积就是 $\\mathbf h_j$ 在 $\\mathbf q$ 方向上的投影长度（虚线）：$e=(1,\\ 2,\\ 0)$。',
        run: async (S) => {
          const m = S.v.m;
          S.v.drops = H.map((h, j) => S.line({ x1: m.X(h[0]), y1: m.Y(h[1]), x2: m.X(h[0]), y2: m.Y(0), color: HC[j], width: 1.6, dash: '5 5', opacity: 0 }));
          await S.all(S.v.drops.map((d) => S.draw(d, 600)));
          S.v.head.set({ text: '分数 $e_j=\\mathbf q\\cdot\\mathbf h_j$' });
          await S.show(S.v.head);
          await S.v.setBars(E, 55, (v) => f2(v), 700);
        },
      },
      {
        say: '**第 2 步：softmax**。先取指数让它们都变成正数：$e^1=2.72$，$e^2=7.39$，$e^0=1$；再除以总和 $11.11$，变成加起来为 1 的**权重**：$\\alpha=(0.245,\\ 0.665,\\ 0.090)$。分数高的位置拿走大部分权重。',
        run: async (S) => {
          S.v.head.set({ text: '取指数 $e^{e_j}$' });
          await S.v.setBars(EX, 22, (v) => f2(v), 700);
          await S.wait(600);
          S.v.head.set({ text: '除以总和 $11.11$ ⇒ 权重 $\\alpha_j$' });
          await S.v.setBars(AL, 230, (v) => v.toFixed(3), 800);
        },
      },
      {
        say: '**第 3 步：加权平均**。每个 $\\mathbf h_j$ 先按自己的权重缩短，再首尾相接加起来，得到上下文向量 $\\mathbf c=\\sum_j\\alpha_j\\mathbf h_j\\approx(1.58,\\ -0.15)$（红）。它最像 $\\mathbf h_2$——query 主要在"看"位置 2。',
        run: async (S) => {
          const m = S.v.m;
          await S.all(S.v.h.map((a) => S.to(a, { opacity: 0.28 }, 400)), S.to(S.v.q, { opacity: 0.28 }, 400), (S.v.drops || []).map((d) => S.hide(d, 300)));
          let tail = [0, 0];
          for (let j = 0; j < 3; j++) {
            const tip = [tail[0] + AL[j] * H[j][0], tail[1] + AL[j] * H[j][1]];
            const a = S.arrow({ x1: m.X(0), y1: m.Y(0), x2: m.X(H[j][0]), y2: m.Y(H[j][1]), color: HC[j], width: 3 });
            await S.to(a, { x1: m.X(tail[0]), y1: m.Y(tail[1]), x2: m.X(tip[0]), y2: m.Y(tip[1]) }, 700);
            tail = tip;
          }
          const c = S.arrow({ x1: m.X(0), y1: m.Y(0), x2: m.X(0), y2: m.Y(0), color: C.red, width: 4.5 });
          await S.to(c, { x2: m.X(CTX[0]), y2: m.Y(CTX[1]) }, 800);
          S.label({ x: m.X(CTX[0]) + 6, y: m.Y(CTX[1]) + 26, text: '$\\mathbf c=\\sum_j\\alpha_j\\mathbf h_j$', color: C.red, size: 1 });
        },
      },
    ],
  });

  /* ===================== c17 · ridge vs lasso: contours meet the constraint region ===================== */
  const WH = [2.2, 0.55], Q = [[1.0, 0.45], [0.45, 1.6]];
  const qf = (d) => d[0] * (Q[0][0] * d[0] + Q[0][1] * d[1]) + d[1] * (Q[1][0] * d[0] + Q[1][1] * d[1]);
  function contact(pts) { let best = [Infinity, null]; pts.forEach((p) => { const v = qf([p[0] - WH[0], p[1] - WH[1]]); if (v < best[0]) best = [v, p]; }); return best; }
  const CIRC = [], DIAM = [];
  for (let i = 0; i < 3600; i++) { const a = i / 3600 * 2 * Math.PI; CIRC.push([Math.cos(a), Math.sin(a)]); }
  [[1, 0], [0, 1], [-1, 0], [0, -1]].forEach((a, k, arr) => { const b = arr[(k + 1) % 4]; for (let i = 0; i < 900; i++) { const t = i / 900; DIAM.push([a[0] * (1 - t) + b[0] * t, a[1] * (1 - t) + b[1] * t]); } });
  const RIDGE = contact(CIRC), LASSO = contact(DIAM);

  A.scene('anim-ridge-lasso', {
    title: 'Ridge vs lasso：为什么 lasso 会把权重压成恰好 0',
    w: 640, h: 340,
    intro: '左边 ridge、右边 lasso，坐标都是两个权重 $(w_1,w_2)$。',
    setup(S) {
      S.v.panels = [[20, 22, 290, 300], [330, 22, 290, 300]].map((box, i) => {
        const m = S.map(-1.5, 3.0, -1.6, 3.06, box);
        S.line({ x1: m.X(-1.5), y1: m.Y(0), x2: m.X(3), y2: m.Y(0), color: C.dim, width: 1.3 });
        S.line({ x1: m.X(0), y1: m.Y(-1.6), x2: m.X(0), y2: m.Y(3.06), color: C.dim, width: 1.3 });
        S.label({ x: m.X(2.85), y: m.Y(0) + 14, text: '$w_1$', size: 0.85, color: C.grey });
        S.label({ x: m.X(0) + 18, y: m.Y(2.9), text: '$w_2$', size: 0.85, color: C.grey });
        S.label({ x: box[0] + 8, y: box[1] + 6, anchor: 'l', valign: 't', text: i === 0 ? '**ridge**：$\\|\\bw\\|_2^2\\le t$' : '**lasso**：$\\|\\bw\\|_1\\le t$', size: 0.9 });
        const region = i === 0 ? CIRC : DIAM;
        const reg = S.path({ d: 'M' + region.filter((_, k) => k % 30 === 0).map((p) => m.P(p).join(',')).join(' L') + 'Z', color: i === 0 ? C.teal : C.orange, width: 2.5, fill: i === 0 ? 'rgba(92,208,179,.12)' : 'rgba(255,159,67,.12)', opacity: 0 });
        S.circle({ cx: m.X(WH[0]), cy: m.Y(WH[1]), r: 5, fill: C.white });
        S.label({ x: m.X(WH[0]) + 4, y: m.Y(WH[1]) - 16, text: '$\\hat{\\bw}$', size: 0.9 });
        const ell = S.clip(S.path({ d: '', color: C.blue, width: 2.2, opacity: 0 }), box);
        const ellAt = (c) => { const pts = []; for (let k = 0; k <= 160; k++) { const a = k / 160 * 2 * Math.PI, d = [Math.cos(a), Math.sin(a)], r = Math.sqrt(c / qf(d)); pts.push(m.P([WH[0] + r * d[0], WH[1] + r * d[1]])); } return 'M' + pts.map((p) => p.join(',')).join(' L') + 'Z'; };
        return { m, reg, ell, ellAt };
      });
    },
    beats: [
      {
        say: '白点 $\\hat{\\bw}$ 是最小二乘解（不加惩罚时最好的权重）。蓝色椭圆是 RSS 的**等高线**：同一个椭圆上 RSS 一样大，越往外 RSS 越大。',
        run: async (S) => {
          await S.all(S.v.panels.map((P) => { P.ell.set({ d: P.ellAt(0.25) }); return S.show(P.ell); }));
          await S.all(S.v.panels.map((P) => S.play(900, (t) => P.ell.set({ d: P.ellAt(0.25 + 0.6 * t) }))));
          await S.all(S.v.panels.map((P) => S.hide(P.ell, 300)));
        },
      },
      {
        say: '加惩罚，等价于规定解**必须落在一个区域里**（c17 的"约束形式"）：ridge 是圆 $\\|\\bw\\|_2^2\\le t$，lasso 是菱形 $\\|\\bw\\|_1\\le t$。菱形的**尖角在坐标轴上**。',
        run: async (S) => { for (const P of S.v.panels) await S.draw(P.reg, 800); },
      },
      {
        say: '从 $\\hat{\\bw}$ 开始把椭圆慢慢放大，**第一次碰到区域的那一点**就是带惩罚的解。ridge：碰在圆周的普通位置，约 $(0.88,\\ 0.47)$——两个权重都被**压小**，但都**不是 0**。',
        run: async (S) => {
          const P = S.v.panels[0];
          P.ell.set({ d: P.ellAt(0.01), opacity: 1 });
          await S.play(1600, (t) => P.ell.set({ d: P.ellAt(0.01 + (RIDGE[0] - 0.01) * t) }));
          const pt = P.m.P(RIDGE[1]);
          S.circle({ cx: pt[0], cy: pt[1], r: 7, fill: C.yellow });
          S.label({ x: pt[0] - 6, y: pt[1] + 20, text: '$(' + f2(RIDGE[1][0]) + ',\\ ' + f2(RIDGE[1][1]) + ')$', size: 0.85, color: C.yellow });
        },
      },
      {
        say: 'lasso：椭圆**先碰到菱形的尖角** $(1,\\ 0)$——$w_2$ **恰好等于 0**，这个特征被直接扔掉了。尖角在坐标轴上，椭圆从大多数方向过来都容易先撞到尖角，所以 lasso 的解常常是**稀疏**的；圆没有尖角，ridge 就做不到这一点。',
        run: async (S) => {
          const P = S.v.panels[1];
          P.ell.set({ d: P.ellAt(0.01), opacity: 1 });
          await S.play(1600, (t) => P.ell.set({ d: P.ellAt(0.01 + (LASSO[0] - 0.01) * t) }));
          const pt = P.m.P(LASSO[1]);
          const dot = S.circle({ cx: pt[0], cy: pt[1], r: 7, fill: C.yellow });
          S.label({ x: pt[0] + 4, y: pt[1] + 22, text: '$(1,\\ 0)$：$w_2=0$', size: 0.85, color: C.yellow });
          await S.pulse(dot);
        },
      },
    ],
  });
})(window);
