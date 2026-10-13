(function (root) {
  'use strict';
  const T = String.raw;
  root.SML.content.add(root.SML.lecture({
    id: 'L20',
    eyebrow: '单元 6 · Honorio · 考试权重很高',
    chips: ['L20 p1–p41', { text: 'T5 BN 条件独立', href: '#/T05' }, { text: 'T7 PGM 建模', href: '#/T07' }, { text: 'T6 junction tree', href: '#/T06' }],
    lead: '这一讲撑起了三个题型（T5、T6、T7），往年卷每份都有 15 分以上来自这里。概念不多：**图怎么表示独立性**，以及**分布怎么按图分解**。',
    oneLiner: {
      zh: 'Bayesian network = 有向无环图 + 每个节点一张"给定父节点"的条件概率表，联合分布等于这些表的乘积；独立性用 D-separation 从图上直接读。MRF 是无向图版本，独立性就是普通的图分离。',
      en: T`A Bayesian network is a DAG over random variables together with a conditional distribution for each node given its parents; the joint factorises as $P(x_1,\dots,x_n)=\prod_i P(x_i\mid x_{pa_i})$, and conditional independences can be read from the graph by D-separation. A Markov random field is undirected, factorises over cliques, $P=\frac1Z\prod_c\psi_c(x_c)$, and independence is plain graph separation.`,
    },
    why: [
      'n 个布尔变量的全联合表要 $2^n-1$ 个自由参数（2025 Q1d 考过：4 个变量 16 行），指数爆炸。图模型利用"很多变量之间只有局部依赖"：按 L20 p27 的因子分解，每个变量只需要一张给定父节点的小表。',
      '图本身还告诉我们哪些变量独立，**不用看任何数字**（p16："one only needs the graph"）。',
    ],
    defs: [
      ['DAG', '有向、无环的图', 'p5–p6'],
      ['parent / child / ancestor / descendant', '$s_1\\to x_1$：$s_1$ 是 $x_1$ 的 parent；沿箭头往回走能到的是 ancestor', 'p7'],
      ['$A\\perp B\\mid C$', '$P(A,B\\mid C)=P(A\\mid C)P(B\\mid C)$', 'p13'],
      ['ancestral graph', '只保留 $X,Y,S$ 及其所有祖先', 'p17'],
      ['moral graph', '同一个孩子的父节点两两连边（"结婚"）', 'p17、p19'],
      ['D-separation', '在 moralized ancestral graph 中，去掉 $S$ 后 $X,Y$ 不连通', 'p17'],
      ['clique / maximal clique', '两两相连的节点集 / 不能再扩大的 clique', 'p29'],
      ['MRF', '无向图模型；$S$ 把 $X,Y$ 隔开 ⇒ $X\\perp Y\\mid S$', 'p32、p36'],
      ['potential / partition function', '团上的正函数 $\\psi_c$；归一化常数 $Z$', 'p34–p38'],
    ],
    formulas: [
      { t: 'math', tex: T`\text{BN: } P(x_1,\dots,x_n)=\prod_{i=1}^n P(x_i\mid x_{pa_i})\qquad\text{MRF: } P(x_1,\dots,x_n)=\frac1Z\prod_{c\in\mathcal C}\psi_c(x_c)` },
      { t: 'note', md: 'Hammersley–Clifford（p37）：与无向图一致的（正）分布一定能按（极大）团分解。' },
    ],
    examples: [
      { t: 'h3', text: '硬币例子（p8–p13）：v-structure' },
      '两枚独立公平硬币 $X_1,X_2$，第三人报告是否相同 $X_3$（90% 准确）：$X_1\\to X_3\\leftarrow X_2$。',
      {
        t: 'table', head: ['$P(x_3\\mid x_1x_2)$', '00', '01', '10', '11'], rows: [
          ['$x_3=0$（不同）', '0.1', '0.9', '0.9', '0.1'], ['$x_3=1$（相同）', '0.9', '0.1', '0.1', '0.9'],
        ],
      },
      '结论：$X_1\\perp X_2$ 成立；$X_1\\perp X_2\\mid X_3$ **不**成立（知道"相同"后，知道一枚就能猜另一枚）。',
      { t: 'h3', text: 'Alarm 例子（p14–p25）' },
      '$E\\to R$，$E\\to A$，$B\\to A$，$R\\to L$，$A\\to L$。$L\\perp B\\mid A$ 不成立（路径 $L$—$R$—$E$—$B$）；$R\\perp A\\mid E$ 成立。完整四步见 [T5](#/T05/lecture)。',
      { t: 'h3', text: 'BN → MRF（p39–p40）' },
      '$x_1\\to x_2\\to x_4\\leftarrow x_3$：moralize 加 $x_2$—$x_3$，去方向。$P(x_1)P(x_2\\mid x_1)$ 并入 $\\psi_{12}$，$P(x_3)P(x_4\\mid x_2,x_3)$ 并入 $\\psi_{234}$，此时 $Z=1$。代价：会丢掉一些独立性（$x_2\\perp x_3$ 在 MRF 里看不出来了）。',
    ],
    compare: [
      {
        t: 'table', head: ['', 'Bayesian network', 'Markov random field'], rows: [
          ['图', '有向无环（DAG）', '无向'],
          ['分解', '$\\prod_i P(x_i\\mid x_{pa_i})$，每个因子已归一化', '$\\frac1Z\\prod_c\\psi_c(x_c)$，需要全局 $Z$'],
          ['读独立性', 'D-separation（祖先图 → moralize → 分离）', '直接看分离'],
          ['表达不了的', '4-cycle 的两条条件独立（p30–p31）', 'v-structure 的边缘独立 $X_1\\perp X_2$（p33）'],
        ],
      },
    ],
    pitfalls: [
      ['在原图上直接删条件节点看连不连通', '必须先取祖先图、再 moralize；collider 被观测时父节点会变相关'],
      ['把不在祖先图里的孩子也拿来结婚', 'moralize 只在祖先图里做'],
      ['BN 的 CPT 每列都要求和为 1，所以"条目数 = 参数数"', '自由参数 = (取值数 − 1) × 父配置数'],
      ['把 MRF 的 $\\psi$ 当概率', '$\\psi$ 只需为正，不必归一化；归一化靠 $Z$'],
    ],
    exam: [
      '三类题：**判断条件独立**（[T5](#/T05)）、**建模 + 数 CPT + MLE**（[T7](#/T07)）、**消元 / junction tree**（[T6](#/T06)，依赖 L21）。简答可能问"为什么用图模型"、"BN 和 MRF 区别"（见 [T13](#/T13/predicted)）。',
    ],
    types: ['T05', 'T07', 'T06'],
    quiz: [
      {
        q: '$P(A)P(B\\mid A)P(C\\mid A)P(D\\mid B,C)$ 对应的图有几条边？', type: 'num', answer: 4,
        explain: '$A\\to B$，$A\\to C$，$B\\to D$，$C\\to D$。每个条件里的变量各画一条指向被条件变量的边。',
      },
      {
        q: '图 $A\\to B\\leftarrow C$。下列哪项成立？', options: ['$A\\perp C$', '$A\\perp C\\mid B$', '两个都成立', '都不成立'], answer: 0,
        explain: 'v-structure：不观测 $B$ 时 $A,C$ 独立；观测 $B$ 后，$A,C$ 结婚，不独立。',
      },
      {
        q: 'MRF 中 $X\\perp Y\\mid S$ 怎么判断？', type: 'show',
        answerText: '删掉 $S$ 里的节点后，$X$ 和 $Y$ 之间没有路径。',
        explain: '无向图不需要 moralize（L20 p32、p36）。',
      },
    ],
  }));
})(window);
