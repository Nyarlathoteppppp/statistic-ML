/* 3B1B-style scenes, batch E: perceptron updates (c31 / T11), two-phase belief propagation (c57). */
(function (root) {
  'use strict';
  const SML = root.SML, A = SML.anim, C = A.C;
  const f2 = (v) => String(+(+v).toFixed(2));
  const sgnTxt = (v) => (v < 0 ? '(' + f2(v) + ')' : f2(v));

  /* ===================== c31 · perceptron: each mistake pushes the boundary ===================== */
  const PTS = [{ x: [1, 1], y: -1 }, { x: [2, 1], y: 1 }, { x: [1.5, 0.5], y: 1 }];
  const ETA = 0.1, W0 = [-0.1, 0.2, 0];
  A.scene('anim-perceptron', {
    title: '感知机：每分错一个点，就把分界线朝它推一下',
    w: 640, h: 360,
    intro: '课件 L10 例 2（T11 题型）：初始 $(w_0,w_1,w_2)=(-0.1,\\ 0.2,\\ 0)$，$\\eta=0.1$。红方块标签 $+1$，蓝圆标签 $-1$；浅红色区域是当前判 $+1$ 的一侧。',
    setup(S) {
      const box = [30, 16, 400, 328];
      const m = S.map(-0.5, 3, -0.5, 2.5, box);
      S.v.m = m;
      for (let k = 0; k <= 3; k++) S.line({ x1: m.X(k), y1: m.Y(-0.5), x2: m.X(k), y2: m.Y(2.5), color: '#23262e', width: 1 });
      for (let k = 0; k <= 2; k++) S.line({ x1: m.X(-0.5), y1: m.Y(k), x2: m.X(3), y2: m.Y(k), color: '#23262e', width: 1 });
      S.line({ x1: m.X(-0.5), y1: m.Y(0), x2: m.X(3), y2: m.Y(0), color: C.dim, width: 1.4 });
      S.line({ x1: m.X(0), y1: m.Y(-0.5), x2: m.X(0), y2: m.Y(2.5), color: C.dim, width: 1.4 });
      S.label({ x: m.X(2.9), y: m.Y(0) + 14, text: '$x_1$', size: 0.8, color: C.grey });
      S.label({ x: m.X(0) + 16, y: m.Y(2.4), text: '$x_2$', size: 0.8, color: C.grey });
      S.v.region = S.clip(S.poly({ points: [], fill: 'rgba(252,98,85,.13)' }), box);
      S.v.bd = S.clip(S.line({ x1: 0, y1: 0, x2: 0, y2: 0, color: C.green, width: 3 }), box);
      S.v.pt = PTS.map((p, i) => {
        const [px, py] = m.P(p.x);
        const sh = p.y > 0 ? S.rect({ x: px - 8, y: py - 8, w: 16, h: 16, fill: C.red }) : S.circle({ cx: px, cy: py, r: 9, fill: C.blue });
        S.label({ x: px + 18, y: py - 14, text: '$(' + p.x.join(',') + ')$', size: 0.75, color: C.grey });
        return S.circle({ cx: px, cy: py, r: 16, color: C.yellow, width: 2.5, opacity: 0 });
      });
      S.v.wlab = S.label({ x: 430, y: 32, anchor: 'l', text: '', size: 0.95, color: C.green });
      S.v.lines = [];
      S.v.work = function (rows) {
        S.v.lines.forEach((l) => l.set({ opacity: 0 }));
        S.v.lines = rows.map((t, i) => S.label({ x: 430, y: 80 + i * 32, anchor: 'l', text: t, size: 0.85, opacity: 0, color: i === rows.length - 1 ? C.yellow : C.white }));
        return S.all(S.v.lines.map((l, i) => S.wait(i * 150).then(() => S.show(l, 300))));
      };
      const corners = [[-0.5, -0.5], [3, -0.5], [3, 2.5], [-0.5, 2.5]];
      S.v.setW = function (w) {
        S.v.w = w;
        const f = (p) => w[0] + w[1] * p[0] + w[2] * p[1];
        // positive half-plane clipped to the plot box
        const poly = [];
        for (let i = 0; i < 4; i++) {
          const a = corners[i], b = corners[(i + 1) % 4], fa = f(a), fb = f(b);
          if (fa >= 0) poly.push(a);
          if ((fa >= 0) !== (fb >= 0)) { const t = fa / (fa - fb); poly.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]); }
        }
        S.v.region.set({ points: poly.map((p) => m.P(p)) });
        let p1, p2;
        if (Math.abs(w[2]) > 1e-9) { p1 = [-1, -(w[0] + w[1] * -1) / w[2]]; p2 = [4, -(w[0] + w[1] * 4) / w[2]]; }
        else { const x = -w[0] / w[1]; p1 = [x, -1]; p2 = [x, 3]; }
        const a = m.P(p1), b = m.P(p2);
        S.v.bd.set({ x1: a[0], y1: a[1], x2: b[0], y2: b[1] });
        S.v.wlab.set({ text: '$\\mathbf w=(' + w.map(f2).join(',\\ ') + ')$' });
      };
      S.v.visit = async function (i) {
        const p = PTS[i], w = S.v.w, s = w[0] + w[1] * p.x[0] + w[2] * p.x[1], ys = p.y * s;
        S.v.pt.forEach((r) => r.set({ opacity: 0 }));
        await S.show(S.v.pt[i], 250);
        const rows = ['点 $(' + p.x.join(',') + ')$，$y=' + (p.y > 0 ? '+1' : '-1') + '$',
          '$s=' + f2(w[0]) + '+' + sgnTxt(w[1]) + '\\times' + p.x[0] + '+' + sgnTxt(w[2]) + '\\times' + p.x[1] + '=' + f2(s) + '$'];
        if (ys <= 0) {
          const nw = [w[0] + ETA * p.y, w[1] + ETA * p.y * p.x[0], w[2] + ETA * p.y * p.x[1]];
          rows.push('$y\\cdot s=' + f2(ys) + '\\le0$：分错，更新');
          rows.push('$\\mathbf w\\leftarrow\\mathbf w' + (p.y > 0 ? '+' : '-') + '0.1\\,(1,' + p.x.join(',') + ')$');
          rows.push('$=(' + nw.map(f2).join(',\\ ') + ')$');
          await S.v.work(rows);
          await S.play(1100, (t) => S.v.setW(w.map((v, k) => v + (nw[k] - v) * t)));
          S.v.setW(nw);
        } else {
          rows.push('$y\\cdot s=' + f2(ys) + '>0$：分对，不动');
          await S.v.work(rows);
        }
      };
      S.v.setW(W0);
    },
    beats: [
      {
        say: '**第 1 轮，点 $(1,1)$**（标签 $-1$）。先算得分 $s=w_0\\cdot1+w_1x_1+w_2x_2=-0.1+0.2+0=0.1$，$y\\cdot s=-0.1\\le0$：分错了。更新 $\\mathbf w\\leftarrow\\mathbf w+\\eta y\\mathbf x$（$\\mathbf x$ 前面补一个偏置输入 1）：$(-0.1,0.2,0)-0.1\\times(1,1,1)=(-0.2,\\ 0.1,\\ -0.1)$。看分界线转动，把这个点推到 $-1$ 那一侧。',
        run: async (S) => { await S.v.visit(0); },
      },
      {
        say: '**点 $(2,1)$**（标签 $+1$）：用**更新后**的 $\\mathbf w$ 算，$s=-0.2+0.1\\times2+(-0.1)\\times1=-0.1$，分错 ⇒ $\\mathbf w+0.1\\times(1,2,1)=(-0.1,\\ 0.3,\\ 0)$。',
        run: async (S) => { await S.v.visit(1); },
      },
      {
        say: '**点 $(1.5,0.5)$**（标签 $+1$）：$s=-0.1+0.3\\times1.5+0=0.35>0$，分对，**不动**。第 1 轮结束——但用现在的线再看 $(1,1)$：$s=-0.1+0.3=0.2$，它又站到了错的一边。所以还要再跑一轮。',
        run: async (S) => { await S.v.visit(2); },
      },
      {
        say: '**第 2 轮，点 $(1,1)$**：$s=0.2$，$y\\cdot s=-0.2$，分错 ⇒ $(-0.1,0.3,0)-0.1\\times(1,1,1)=(-0.2,\\ 0.2,\\ -0.1)$。',
        run: async (S) => { await S.v.visit(0); },
      },
      {
        say: '继续检查：$(2,1)$ 得分 $0.1$、$(1.5,0.5)$ 得分 $0.05$，都分对。第 3 轮三个点全部分对、一次都没更新 ⇒ **停**。数据线性可分时感知机一定会停下来（c32 的收敛定理），但停在哪条线取决于初始值和点的顺序——它只找"一条能分开的线"，不找 margin 最大的那条。',
        run: async (S) => { await S.v.visit(1); await S.v.visit(2); },
      },
    ],
  });

  /* ===================== c57 · belief propagation: collect, then distribute ===================== */
  const N = { x1: [110, 62], x2: [110, 182], x3: [290, 182], x4: [110, 302], x5: [290, 302] };
  const SUB = { x1: 'x_1', x2: 'x_2', x3: 'x_3', x4: 'x_4', x5: 'x_5' };
  const EDG = [['x1', 'x2'], ['x2', 'x3'], ['x2', 'x4'], ['x4', 'x5']];
  A.scene('anim-bp', {
    title: 'Belief propagation：先收（collect）再发（distribute），一次得到所有边缘',
    w: 640, h: 360,
    intro: '和 c56 同一棵树、同一组打分表。c56 只算了 $x_4$；现在想要**每个**房间的边缘。括号 =（热，冷）。',
    setup(S) {
      EDG.forEach(([a, b]) => S.line({ x1: N[a][0], y1: N[a][1], x2: N[b][0], y2: N[b][1], color: C.grey, width: 2 }));
      S.v.node = {};
      Object.keys(N).forEach((id) => {
        S.v.node[id] = S.circle({ cx: N[id][0], cy: N[id][1], r: 21, fill: '#20232b', color: id === 'x4' ? C.yellow : C.white, width: id === 'x4' ? 3 : 2 });
        S.label({ x: N[id][0], y: N[id][1], text: '$' + SUB[id] + '$', size: 1.05 });
      });
      S.label({ x: N.x4[0] - 46, y: N.x4[1] + 2, text: 'root', size: 0.75, color: C.yellow });
      S.v.panel = [];
      S.v.say = function (lines) {
        S.v.panel.forEach((l) => l.set({ opacity: 0 }));
        S.v.panel = lines.map((t, i) => S.label({ x: 372, y: 52 + i * 32, anchor: 'l', text: t, size: 0.88, opacity: 0, color: i === 0 ? C.yellow : C.white }));
        return S.all(S.v.panel.map((l, i) => S.wait(i * 140).then(() => S.show(l, 300))));
      };
      // collect pills sit on one side of an edge, distribute pills on the other
      S.v.msg = function (from, to, text, color, side, ms) {
        const [x1, y1] = N[from], [x2, y2] = N[to], vertical = x1 === x2;
        const mid = [(x1 + x2) / 2, (y1 + y2) / 2];
        const park = vertical ? [mid[0] + side * 44, mid[1]] : [mid[0], mid[1] + side * 22];
        const pill = S.label({ x: x1, y: y1, text, color: color === C.red ? '#fff' : '#16171c', bg: color, size: 0.78, opacity: 0 });
        return S.show(pill, 150).then(() => S.to(pill, { x: park[0], y: park[1] }, ms || 800)).then(() => pill);
      };
    },
    beats: [
      {
        say: '**第 1 阶段 collect（收）**：选 root $=x_4$，从叶子往 root 发消息——这就是 c56 做过的四条：$m_{5\\to4}=(4,3)$，$m_{1\\to2}=(4,2)$，$m_{3\\to2}=(3,2)$，$m_{2\\to4}=(52,20)$（黄色）。',
        run: async (S) => {
          await S.all(S.v.msg('x5', 'x4', '$(4,3)$', C.yellow, -1, 700), S.v.msg('x1', 'x2', '$(4,2)$', C.yellow, -1, 700), S.v.msg('x3', 'x2', '$(3,2)$', C.yellow, -1, 700));
          await S.v.msg('x2', 'x4', '$(52,20)$', C.yellow, -1, 700);
          await S.v.say(['collect 完成', 'root $x_4$ 收齐：$(52\\cdot4,\\ 20\\cdot3)=(208,60)$']);
        },
      },
      {
        say: '**第 2 阶段 distribute（发）**：从 root 往回发，规则不变——发送者把"**除了收件人以外**"的来信相乘，乘上通往收件人的打分表，再把自己加掉。$x_4\\to x_5$：只用 $m_{2\\to4}=(52,20)$，$x_5$ 热：$52\\times3+20\\times1=176$，冷：$52\\times1+20\\times2=92$（红色）。',
        run: async (S) => {
          await S.v.say(['$m_{4\\to5}$：只乘 $m_{2\\to4}=(52,20)$', '$x_5$ 热：$52\\cdot3+20\\cdot1=176$', '$x_5$ 冷：$52\\cdot1+20\\cdot2=92$']);
          await S.v.msg('x4', 'x5', '$(176,92)$', C.red, 1);
        },
      },
      {
        say: '$x_4\\to x_2$：只用 $m_{5\\to4}=(4,3)$（不能用 $x_2$ 自己发来的 $(52,20)$），$x_2$ 热：$4\\times4+3\\times1=19$，冷：$4\\times1+3\\times2=10$。',
        run: async (S) => {
          await S.v.say(['$m_{4\\to2}$：只乘 $m_{5\\to4}=(4,3)$', '$x_2$ 热：$4\\cdot4+3\\cdot1=19$', '$x_2$ 冷：$4\\cdot1+3\\cdot2=10$']);
          await S.v.msg('x4', 'x2', '$(19,10)$', C.red, 1);
        },
      },
      {
        say: '$x_2$ 再往两片叶子发。给 $x_3$：乘 $m_{1\\to2}\\cdot m_{4\\to2}=(4\\cdot19,\\ 2\\cdot10)=(76,20)$，再过 $\\psi_{23}$ 得 $(96,172)$；给 $x_1$：乘 $m_{3\\to2}\\cdot m_{4\\to2}=(57,20)$，再过 $\\psi_{12}$ 得 $(191,77)$。',
        run: async (S) => {
          await S.v.say(['$m_{2\\to3}$：$(4\\cdot19,\\ 2\\cdot10)=(76,20)$', '过 $\\psi_{23}$：$(76+20,\\ 2\\cdot76+20)=(96,172)$', '$m_{2\\to1}$：$(3\\cdot19,\\ 2\\cdot10)=(57,20)$', '过 $\\psi_{12}$：$(3\\cdot57+20,\\ 57+20)=(191,77)$']);
          await S.all(S.v.msg('x2', 'x3', '$(96,172)$', C.red, 1), S.v.msg('x2', 'x1', '$(191,77)$', C.red, 1));
        },
      },
      {
        say: '现在**每条边两个方向各有一条消息**。每个节点把收到的**所有**来信相乘，就是它的边缘：$x_1$：$(191,77)$，$x_3$：$(96,172)$，$x_5$：$(176,92)$，$x_2$：$(4\\cdot3\\cdot19,\\ 2\\cdot2\\cdot10)=(228,40)$，$x_4$：$(208,60)$。**自检**：每一对加起来都是 $268=Z$。只比 c56 多算了 4 条消息，就得到了全部 5 个边缘。',
        run: async (S) => {
          await S.v.say(['每个节点：所有来信相乘', '$x_1:(191,77)$　$x_2:(228,40)$', '$x_3:(96,172)$　$x_4:(208,60)$', '$x_5:(176,92)$', '每对之和都是 $268=Z$ ✓']);
          await S.all(Object.keys(S.v.node).map((id) => S.pulse(S.v.node[id])));
        },
      },
    ],
  });
})(window);
