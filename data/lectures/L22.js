(function (root) {
  'use strict';
  const T = String.raw;
  root.SML.content.add(root.SML.lecture({
    id: 'L22',
    eyebrow: '单元 6 · Jiang · 2026 Q5 的出处',
    chips: ['L22 p1–p33', { text: 'T6 消元与 junction tree', href: '#/T06' }],
    lead: '有环的图不能直接做 BP。办法是把变量分组成"团"，让团之间构成一棵树（junction tree），再在团上传消息。团怎么找？**模拟变量消元**。计算题全部在 [T6](#/T06)。',
    oneLiner: {
      zh: '（BN 先 moralize）按给定顺序消元：删点前把邻居两两连起来，记下"点 + 邻居"这个团；只保留极大团；团之间按共享变量个数加权，取最大权重生成树就是 junction tree，相邻团的交集是 separator。',
      en: T`To do exact inference on a graph with cycles we build a junction tree: (moralise a BN first,) simulate variable elimination in a chosen order — connect the neighbours of each eliminated variable and record the clique it forms — keep only the maximal cliques, weight each pair of cliques by the number of shared variables and take the maximum-weight spanning tree. Messages are then passed between cliques over their separators. Inference cost grows with the largest clique, which depends on the elimination order.`,
    },
    defs: [
      ['graph transformation', 'BN 先 moralize 成 MRF，再把变量分组成树状的团', 'p4'],
      ['elimination order', '删点的顺序，"critical to get this right"', 'p6'],
      ['elimination clique', '删点时"点 + 当时的邻居"', 'p7–p16'],
      ['maximal cliques', '划掉是其他团子集的团', 'p17'],
      ['clique graph', '极大团之间，凡有共享变量就连边', 'p18'],
      ['junction tree', '团图的最大权重生成树，权重 = 共享变量个数', 'p20'],
      ['running intersection', '两个不相邻的团有共同变量 ⇒ 路径上每个团都有这个变量；保证信念一致', 'p21'],
      ['separator', '相邻两团的交集；团之间的消息只依赖 separator 里的变量', 'p22'],
    ],
    formulas: [
      { t: 'note', md: '团上的 BP 和 L21 一样分两轮（collect：叶→根；distribute：根→叶），只是消息 $m_{i\\to j}$ 的自变量变成 separator 里的变量，例如 $m_{1\\to2}(x_2,x_3)=\\sum_{x_1}\\psi_1(x_1,x_2,x_3)$（p23–p25）。' },
    ],
    examples: [
      '课件原例：$x_1\\to x_2,\\ x_1\\to x_3,\\ x_2\\to x_4,\\ x_3\\to x_5,\\ x_4\\to x_5$ moralize 后加边 $x_3$—$x_4$；顺序 $x_1,\\dots,x_5$ 得到团 $\\{1,2,3\\},\\{2,3,4\\},\\{3,4,5\\},\\{4,5\\},\\{5\\}$，后两个被划掉；junction tree 为 $c_1$—$c_2$—$c_3$，separator $\\{x_2,x_3\\}$、$\\{x_3,x_4\\}$。逐步表格见 [T6](#/T06/lecture)。',
      { t: 'viz', id: 'elim-stepper', opts: { preset: 'L22' } },
    ],
    compare: [{
      t: 'table', head: ['顺序（L22 p28–p32）', 'fill-in', '最大团'], rows: [
        ['先删外围 $B,C,\\dots,L$，最后删中心 $A$', '0 条', '3（四个三角形）'],
        ['先删中心 $A$', '24 条', '9（所有点）'],
      ],
    }],
    pitfalls: [
      ['所有记录下来的团都是 junction tree 的节点', '只保留极大团（p17）'],
      ['团图里所有有交集的边都保留', '只取最大权重生成树；权重 1 的 $c_1$—$c_3$ 被去掉（p20）'],
      ['顺序随便选', '顺序决定团的大小和计算量；找最优顺序很难，常用"下一个删产生最小团的点"（p26–p27）'],
    ],
    types: ['T06'],
    quiz: [
      {
        q: '消元记录的团是 $\\{A,B,C\\},\\{B,C,D\\},\\{C,D\\},\\{D\\}$。junction tree 有几个团？', type: 'num', answer: 2,
        explain: '$\\{C,D\\}\\subset\\{B,C,D\\}$，$\\{D\\}$ 也被包含，划掉后剩 2 个。',
      },
      {
        q: '两个团 $\\{A,B,C\\}$ 和 $\\{B,C,D\\}$ 之间的边权是多少？', type: 'num', answer: 2,
        explain: '共享 $B,C$ 两个变量；separator 是 $\\{B,C\\}$。',
      },
    ],
  }));
})(window);
