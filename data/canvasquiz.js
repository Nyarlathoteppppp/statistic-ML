/* Canvas weekly quiz questions that appear both in a chapter quiz and in a T-page quiz.
 * Both places hold the same object, so the 平时小测合集 page (data/tools.js) shows each question once.
 * Loaded before data/types. Older quiz questions sit inline in their chapter quizzes. */
(function (root) {
  'use strict';
  const SML = root.SML;
  const T = String.raw;
  const GRID = { S: [140, 40], T: [240, 40], U: [40, 130], V: [140, 130], W: [240, 130], X: [40, 220], Y: [140, 220], Z: [240, 220] };

  SML.canvasQuiz = {
    // W11 quiz Q1 → c58, T06
    elimAH: {
      type: 'num',
      q: [
        T`（平时小测原题）Consider the following *Markov random field*. If the nodes are eliminated in order $A,B,C,D,E,F,G,H$, how many nodes does the largest clique in the *junction tree* have?`,
        { t: 'graph', nodes: { H: [130, 40], G: [220, 40], F: [40, 130], D: [130, 130], C: [220, 130], E: [40, 220], B: [130, 220], A: [220, 220] }, edges: 'H-G H-D F-D D-C F-E D-B D-A C-A B-A', w: 260 },
      ],
      qzh: T`按 $A,B,C,\dots,H$ 的顺序消元这个 MRF，junction tree 里最大的团有几个节点？`,
      answer: 4,
      explain: [
        T`每一步：删掉这个点，记下"它 + 它此刻的邻居"为一个团，邻居之间缺的边补上（fill-in）。`,
        {
          t: 'table', head: ['删', '当前邻居', 'fill-in', '团'], rows: [
            [T`$A$`, T`$B,C,D$`, T`$B$—$C$`, T`$\{A,B,C,D\}$`],
            [T`$B$`, T`$C,D$（$C$ 来自刚补的边）`, '—', T`$\{B,C,D\}$`],
            [T`$C$`, T`$D$`, '—', T`$\{C,D\}$`],
            [T`$D$`, T`$F,H$`, T`$F$—$H$`, T`$\{D,F,H\}$`],
            [T`$E$`, T`$F$`, '—', T`$\{E,F\}$`],
            [T`$F$`, T`$H$（来自刚补的边）`, '—', T`$\{F,H\}$`],
            [T`$G$`, T`$H$`, '—', T`$\{G,H\}$`],
            [T`$H$`, '无', '—', T`$\{H\}$`],
          ],
        },
        T`去掉被别的团包含的，留下极大团 $\{A,B,C,D\}$、$\{D,F,H\}$、$\{E,F\}$、$\{G,H\}$。最大的是 $\{A,B,C,D\}$，**答案 4**。`,
      ],
    },

    // W11 quiz Q2 → c54, T05
    dsepXT: {
      type: 'mc',
      q: [
        T`（平时小测原题）Consider the following *Bayesian network*. Does the conditional independence statement $X\perp T\mid V$ hold in this Bayesian network?`,
        { t: 'graph', nodes: GRID, edges: 'T>S S>V U>V X>U V>Z W>Z Y>Z', w: 280 },
      ],
      qzh: T`这个贝叶斯网络里，给定 $V$ 时 $X$ 与 $T$ 独立吗？`,
      options: [T`$X\perp T\mid V$ holds`, T`$X\perp T\mid V$ does not hold`, 'More information is needed to answer this question'],
      answer: 1,
      explain: [
        T`四步法：① 只留 $X,T,V$ 和它们的祖先：$V$ 的祖先是 $S,T,U,X$，删掉 $W,Y,Z$。② moralize：$V$ 的两个父节点 $U,S$ 连一条边，再去掉箭头。③ 删掉条件集里的 $V$。④ $X$—$U$—$S$—$T$ 还连着，所以 **does not hold**。`,
        { t: 'graph', nodes: { S: GRID.S, T: GRID.T, U: GRID.U, V: GRID.V, X: GRID.X }, edges: 'S-V:gone U-V:gone X-U:path U-S:path S-T:path', cls: { V: 'removed', X: 'x', T: 'y' }, w: 280, caption: T`删掉 $V$ 之后：$U$—$S$ 是结婚边，整条 $X$—$U$—$S$—$T$ 连通。` },
        T`直觉：$V$ 是 $U\to V\leftarrow S$ 的碰撞点（collider），观测了它反而把两边接通，所以 $X\to U\to V\leftarrow S\leftarrow T$ 整条路是通的。`,
      ],
    },
  };
})(window);
