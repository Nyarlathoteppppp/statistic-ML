/* T5 — Conditional independence in Bayesian networks (L20 p12–p27). */
(function (root) {
  'use strict';
  const T = String.raw;
  const Q4 = { nodes: { S: [140, 40], T: [240, 40], U: [40, 130], V: [140, 130], W: [240, 130], X: [40, 220], Y: [140, 220], Z: [240, 220] } };
  /* Workshop 12：Q1 和 2026 Q4 是同一张 BN（沿用 Q4 的位置）；Q2 是 MRF，位置照 tutorial 原图。 */
  const WS1_EDGES = 'S>V S>W T>W U>V U>Y X>Y V>Z W>Z Y>Z';
  const WS1_MORAL = 'S-U:moral S-T:moral U-X:moral V-W:moral V-Y:moral W-Y:moral';
  const WS2 = { nodes: { T: [140, 40], U: [40, 130], V: [140, 130], W: [240, 130], X: [40, 220], Y: [140, 220], Z: [240, 220] } };
  const WS2_EDGES = 'T-W U-V V-W U-X V-Y W-Z X-Y Y-Z';

  root.SML.content.add({
    id: 'T05',
    eyebrow: '题型 T5 · 8 分 · 四步法，零失误',
    title: 'BN 条件独立：$X\\perp Y\\mid S$ 成立吗',
    en: 'Does a conditional independence statement hold in a Bayesian network?',
    chips: [
      { text: 'L20 p17–p25', href: '#/L20', cls: 'src' },
      { text: '2026 practice Q4', cls: 'hot' }, { text: '2025 practice Q1c', cls: 'src' }, { text: '2021 exam Q18a', cls: 'src' }, { text: '2017 exam Q9', cls: 'src' },
      { text: 'Workshop 12 Q1–Q2', href: '#/T05/ws12', cls: 'src' },
    ],
    lead: 'BN 是 Bayesian network（贝叶斯网络）的缩写：用节点表示随机变量，用有向边（箭头）表示依赖关系。箭头 $A\\to C$ 中 $A$ 是 $C$ 的父节点，$C$ 是 $A$ 的子节点；若 $A\\to C\\leftarrow B$，$C$ 就叫 $A$、$B$ 的共同孩子。moralize（道德化，俗称“结婚”）就是在共同孩子的两个父节点之间补一条无向边（不带箭头的边）。考试按这个方法写：**祖先图 → moralize → 去方向 → 删掉条件节点 → 看还连不连通**。每一步都写在卷面上，就能拿满步骤分。\n\n记号：$X,Y$ 是要判断的两个随机变量，$S$ 是条件集；这些是通用占位名，具体题目可能换成别的字母。$X\\perp Y\\mid S$ 读作“给定 $S$ 中变量的取值后，$X$ 与 $Y$ 条件独立”。竖线**右边**列出的就是条件节点（given，表示取值已知），合起来叫条件集。注意 2026 真题里恰好有一个节点也叫 $S$——那道题的条件集是 $\\{V,W\\}$，节点 $S$ 是要判断的对象之一，不要删它。',
    blocks: [
      { t: 'h2', text: '1. 先确认符号', id: 'notation' },
      T`下表的 $A,B,C$ 表示随机变量。$P(A)$ 表示 $A$ 的概率分布，$P(A,B)$ 表示两者的联合概率分布，$P(A\mid C)$ 表示已知 $C$ 的取值后 $A$ 的条件概率分布。$P$ 和 $\Pr$ 是含义相同的两种概率记号；并排的概率项表示相乘。边缘独立（marginal independence）就是不附加任何条件时的独立；条件独立（conditional independence）则是在指定条件已知时的独立。`,
      {
        t: 'table', head: ['写法', '读作', '含义（L20 p12–p13）'], rows: [
          ['$A\\perp B$', 'A and B are (marginally) independent', '$P(A,B)=P(A)P(B)$'],
          ['$A\\perp B\\mid C$', 'A and B are conditionally independent given C', '$P(A,B\\mid C)=P(A\\mid C)P(B\\mid C)$：知道 $C$ 以后，$B$ 不再提供关于 $A$ 的信息'],
        ],
      },
      {
        t: 'exam', title: 'Exam phrasing · 2025 practice Q1c（5 分）',
        md: T`$\Pr(A,B\mid C)=\Pr(A\mid C)\Pr(B\mid C)$ says that $A$ and $B$ are **conditionally independent given $C$**: once the value of $C$ is known, learning $B$ gives no further information about $A$ (and vice versa). It does **not** imply that $A$ and $B$ are marginally independent, nor that either is independent of $C$.`,
      },

      { t: 'h2', text: '2. 四步法（D-separation，d-分离：用图判断条件独立）', id: 'method' },
      T`动手前先把每条有向边抄成「父节点 $\to$ 子节点」（如 $E\to A$），防止读图漏边（解答里的「第 0 步」）。然后按下面四步做：`,
      {
        t: 'steps', items: [
          T`**祖先图（ancestral graph）。** 只保留 $X$、$Y$、条件集里的节点以及它们的**所有祖先**（父、父的父……）。其他节点和它们的边全部删掉（L20 p17）。`,
          T`**Moralize。** 在祖先图里，凡是有两个或更多父节点的孩子，把它的父节点两两连一条无向边（「结婚」；本来就相连的不用再加）。然后把所有边的方向去掉（p19–p20）。`,
          T`**删掉条件集里的节点**（竖线右边那些，以及和它们相连的边）。`,
          T`**看 $X$ 和 $Y$ 是否还连通**：能不能沿剩下的边一步步从 $X$ 走到 $Y$（这样走过的一串边叫路径）。走不到 ⇒ $X\perp Y\mid S$ 成立；走得到 ⇒ 这条独立性不成立（图不能保证独立），写出这条路径（p20–p25）。`,
        ],
      },
      {
        t: 'warn', title: '两个最容易错的地方',
        md: '- **顺序不能反**：必须先取祖先图、再 moralize、最后删条件集。先删条件节点再 moralize，就会漏掉"给定共同孩子以后两个父节点变相关"的那条边。\n- **只在祖先图里结婚**：一个点留不留，只看它是不是 $X$、$Y$、条件节点本身或它们的祖先；不在祖先图里的共同孩子不让父母结婚。所以共同孩子的后代（沿箭头往下能走到的点）被给定时，这个孩子是条件节点的祖先，必须留下，父母照样结婚。例：$A\\to C\\leftarrow B$，$C\\to D$，问 $A\\perp B\\mid D$：$C$ 是 $D$ 的父节点，留下，$A$—$B$ 结婚，删 $D$ 后仍相连 ⇒ 不成立。',
      },
      {
        t: 'deep', title: '展开详解：为什么要"结婚"和"取祖先图"（直觉）', hint: '看懂就不容易忘步骤',
        blocks: [
          '课件的硬币例子（L20 p8–p13）：两人各抛一枚公平硬币 $X_1,X_2$，第三人报告两枚是否相同 $X_3$（90% 准确），图是 $X_1\\to X_3\\leftarrow X_2$。',
          {
            t: 'ul', items: [
              '**不知道 $X_3$**：两枚硬币互不影响，$X_1\\perp X_2$ 成立。',
              '**知道 $X_3$="相同"**：如果再告诉你 $X_1$=正面，你就几乎能猜出 $X_2$ 也是正面。所以 $X_1\\perp X_2\\mid X_3$ **不成立**。',
            ],
          },
          '"给定共同孩子，父节点变得相关"——moralize 时给两个父节点连的边就是在表示这件事。删掉 $X_3$ 后 $X_1$—$X_2$ 那条边还在，所以判定为不独立。',
          '为什么要先取祖先图：如果共同孩子**不在**条件集里（也不是条件节点的祖先），两个父节点之间本来就没有信息流动。取祖先图会把这种孩子删掉，它就不会让父节点"结婚"。所以没有条件时 $X_1\\perp X_2$ 成立：祖先图只剩 $\\{X_1,X_2\\}$，两点之间没有边。',
          {
            t: 'ext', md: '等价的自查法：看 $X$ 到 $Y$ 的每条路径（沿边一步步走、不管箭头方向）上的每个中间点 $C$。链 $A\\to C\\to B$ 或分叉 $A\\leftarrow C\\to B$：$C$ 被给定，这条路就断；对撞点（collider）$A\\to C\\leftarrow B$ 正相反：$C$ 和它的所有后代都没被给定，这条路才断。每条路都断 ⇒ 成立，和四步法结论相同；图解见 [c54](#/c54)，考试仍按四步法写。',
          },
        ],
      },

      { t: 'h2', text: '3. 交互：一步一步看', id: 'solver' },
      '可以选课件的 alarm 例子、硬币例子和 2026 真题，自己换 $X$、$Y$ 和条件集。',
      { t: 'viz', id: 'dsep-stepper', opts: { preset: 'EX2026Q4' } },

      { t: 'h2', text: '4. 课件两个例子（L20 p14–p25）', id: 'lecture' },
      'Alarm 网络：$E\\to R$，$E\\to A$，$B\\to A$，$R\\to L$，$A\\to L$（E 地震、B 盗窃、R 电台报道、A 警报、L 离开公司）。',
      {
        t: 'table', head: ['问题', '祖先图', '结婚', '删掉条件集后', '结论'], rows: [
          ['$L\\perp B\\mid A$？', '全部 5 个点', '$E$—$B$（A 的父母），$R$—$A$（L 的父母）', '删 $A$ 和碰到 $A$ 的边（$E$—$A$、$B$—$A$、$A$—$L$、结婚边 $R$—$A$），剩 $L$—$R$、$R$—$E$、$E$—$B$ ⇒ $L$—$R$—$E$—$B$ 仍连通', '**不成立**'],
          ['$R\\perp A\\mid E$？', '$\\{R,A,E,B\\}$（L 不是谁的祖先，删掉）', '$E$—$B$', '删 $E$ 和碰到 $E$ 的边（$E$—$R$、$E$—$A$、$E$—$B$），剩 $B$—$A$；$R$ 没有边了 ⇒ 孤立点（祖先图没有 $L$，所以 $R$、$A$ 不结婚）', '**成立**'],
        ],
      },

      { t: 'h2', text: '5. 今年的题：2026 practice Q4、Canvas Quiz 6 Q2', id: 'past' },
      {
        t: 'past', src: '2026 S2 practice Q4', marks: 8, topic: 'L20 p17',
        q: 'Consider the following Bayesian network. Does the conditional independence statement $S\\perp Z\\mid V,W$ hold in this Bayesian network?',
        qzh: T`考虑下面的贝叶斯网络（Bayesian network）。在这个贝叶斯网络中，条件独立性（conditional independence）命题 $S\perp Z\mid V,W$ 是否成立？`,
        azh: T`不成立。$\{S,Z,V,W\}$ 的祖先图（ancestral graph）包含所有节点。道德化（moralise）会加上 $S$–$U$ 和 $S$–$T$（分别是 $V$ 和 $W$ 的父节点）、$U$–$X$（$Y$ 的父节点），以及 $V$–$W$、$V$–$Y$、$W$–$Y$（$Z$ 的父节点）。去掉方向并删除条件节点 $V,W$ 后，路径 $S$–$U$–$Y$–$Z$ 仍然连接 $S$ 和 $Z$。因此给定 $\{V,W\}$ 时 $S$ 和 $Z$ 没有被分隔，$S\perp Z\mid V,W$ **不**成立。`,
        blocks: [{ t: 'fig', src: 'assets/figures/ex2026_q4_bn.png', w: 260 }],
        sol: [
          T`对照记号：本题 $X=S$，$Y=Z$，条件集是 $\{V,W\}$。节点 $S$ 是要判断的一端，不是条件集，不能删。`,
          { t: 'h4', text: '第 0 步：边' },
          '$S\\to V,\\ S\\to W,\\ T\\to W,\\ U\\to V,\\ U\\to Y,\\ X\\to Y,\\ V\\to Z,\\ W\\to Z,\\ Y\\to Z$',
          { t: 'h4', text: '第 1 步：祖先图' },
          '$\\{S,Z,V,W\\}$ 的祖先：$Z$ 的父母 $V,W,Y$；$V$ 的父母 $S,U$；$W$ 的父母 $S,T$；$Y$ 的父母 $U,X$。所以**全部 8 个节点**都在祖先图里。',
          { t: 'h4', text: '第 2 步：moralize' },
          {
            t: 'table', head: ['孩子', '父节点', '新加的无向边'], rows: [
              ['$V$', '$S,U$', '$S$—$U$'], ['$W$', '$S,T$', '$S$—$T$'], ['$Y$', '$U,X$', '$U$—$X$'], ['$Z$', '$V,W,Y$', '$V$—$W$, $V$—$Y$, $W$—$Y$'],
            ],
          },
          { t: 'h4', text: '第 3 步：删掉 $V,W$' },
          '怎么减出来：去方向后的原边 $S$—$V$、$S$—$W$、$T$—$W$、$U$—$V$、$U$—$Y$、$X$—$Y$、$V$—$Z$、$W$—$Z$、$Y$—$Z$，加上结婚边 $S$—$U$、$S$—$T$、$U$—$X$、$V$—$W$、$V$—$Y$、$W$—$Y$。删 $V,W$ 时，凡是端点碰到 $V$ 或 $W$ 的边全部去掉。',
          '剩下的边：$S$—$U$，$S$—$T$，$U$—$X$，$U$—$Y$，$X$—$Y$，$Y$—$Z$。',
          { t: 'graphs', r: 16, caption: '2026 Q4 的三步（蓝圈 $S$、绿圈 $Z$ 是要判断的两点；灰 = 条件集 $V,W$；橙色虚线 = 结婚边；红 = 找到的路径）。', items: [
            Object.assign({}, Q4, { edges: 'S>V S>W T>W U>V U>Y X>Y V>Z W>Z Y>Z', cls: { V: 'given', W: 'given', S: 'x', Z: 'y' }, caption: '① 原图；祖先图 = 全部 8 个点' }),
            Object.assign({}, Q4, { edges: 'S-V S-W T-W U-V U-Y X-Y V-Z W-Z Y-Z S-U:moral S-T:moral U-X:moral V-W:moral V-Y:moral W-Y:moral', cls: { V: 'given', W: 'given', S: 'x', Z: 'y' }, caption: '② 结婚 + 去方向' }),
            Object.assign({}, Q4, { edges: 'S-V:gone S-W:gone T-W:gone U-V:gone V-Z:gone W-Z:gone V-W:gone V-Y:gone W-Y:gone S-T U-X X-Y S-U:path U-Y:path Y-Z:path', cls: { V: 'removed', W: 'removed', S: 'x', Z: 'y' }, caption: '③ 删 $V,W$：$S$—$U$—$Y$—$Z$ 仍连通 ⇒ 不成立' }),
          ] },
          { t: 'h4', text: '第 4 步：找路径' },
          '$S$—$U$—$Y$—$Z$ 仍然连通（$S$—$U$ 是因为 $V$ 被观测，$S$ 和 $U$ 作为 $V$ 的父母"结婚"）。',
          {
            t: 'exam', md: T`No. The ancestral graph of $\{S,Z,V,W\}$ contains all nodes. Moralising adds $S$–$U$ and $S$–$T$ (parents of $V$ and $W$), $U$–$X$ (parents of $Y$) and $V$–$W$, $V$–$Y$, $W$–$Y$ (parents of $Z$). After dropping directions and removing the conditioning nodes $V,W$, the path $S$–$U$–$Y$–$Z$ still connects $S$ and $Z$. Hence $S$ and $Z$ are not separated given $\{V,W\}$, and $S\perp Z\mid V,W$ does **not** hold.`,
          },
          { t: 'note', md: '直觉：条件集里有 $V$（$S$ 和 $U$ 的共同孩子；"条件集"只表示竖线右边写了它，判定时把它删掉，不需要知道它取 0 还是 1），$S$ 和 $U$ 变得相关；$U\\to Y\\to Z$ 不经过 $V,W$，信息就从 $S$ 流到了 $Z$。' },
        ],
      },
      { t: 'h3', text: 'Canvas Quiz 6 Q2（今年平时小测）' },
      { t: 'canvasQuiz', pick: ['6.2'] },

      { t: 'h2', text: '6. 今年的题：Workshop 12（Q1 BN、Q2 MRF）', id: 'ws12' },
      T`Workshop 12 的前两题都是「读条件独立」。Q1 是 BN，和 [上一节](#/T05/past) 的 2026 practice Q4 **是同一道题**（workshop 原题直接上了考卷），这里只补最常见的错法。Q2 换成 MRF（Markov random field，马尔可夫随机场，边没有箭头的无向图），四步只剩最后两步。`,
      {
        t: 'past', src: 'Workshop 12 Q1', topic: 'L20 p17 · WK12 p6',
        q: T`Consider the following Bayesian network. Does the conditional independence statement $S\perp Z\mid V,W$ hold in this Bayesian network?`,
        qzh: T`考虑下面的贝叶斯网络（Bayesian network）。在这个贝叶斯网络中，条件独立（conditional independence）命题 $S\perp Z\mid V,W$ 成立吗？`,
        azh: T`不成立。每个节点都是 $Z$ 的祖先，所以 $\{S,Z,V,W\}$ 的祖先图（ancestral graph）就是整张网络。道德化（moralise）把每个共同孩子的父节点两两相连：$S$–$U$（$V$ 的父节点）、$S$–$T$（$W$ 的父节点）、$U$–$X$（$Y$ 的父节点），以及 $V$–$W$、$V$–$Y$、$W$–$Y$（$Z$ 的父节点）；然后去掉所有边的方向。删除条件节点 $V$ 和 $W$ 后，剩下 $S$–$U$、$S$–$T$、$U$–$X$、$U$–$Y$、$X$–$Y$、$Y$–$Z$，仍能沿 $S$–$U$–$Y$–$Z$ 从 $S$ 走到 $Z$。因此给定 $\{V,W\}$ 时 $S$ 和 $Z$ 没有被分隔，$S\perp Z\mid V,W$ **不**成立。`,
        blocks: [Object.assign({ t: 'graph' }, Q4, { edges: WS1_EDGES, cls: { S: 'x', Z: 'y', V: 'given', W: 'given' }, w: 260, caption: '题图（位置照 tutorial 原图）。蓝圈 $S$、绿圈 $Z$ 是要判断的两点；灰色 $V,W$ 是条件集，也就是竖线右边的节点。' })],
        sol: [
          T`逐步解答（祖先图、6 条结婚边、删 $V,W$ 后剩下的边、路径 $S$—$U$—$Y$—$Z$）和英文答案都在 [上一节](#/T05/past) 的 2026 practice Q4，两题完全相同。这里只看最常见的错法。`,
          {
            t: 'warn', title: '易错：先删条件集、再结婚，会错答"成立"', blocks: [
              T`有人一上来就把 $V,W$ 删掉，再去找共同孩子结婚。这时 $V$ 已经不在了，$S$ 和 $U$ 不再有共同孩子，结婚边 $S$—$U$ 根本不会出现；$S$ 原来只有 $S\to V$、$S\to W$ 两条边，删完后 $S$ 成了孤立点，于是得出"成立"的错误结论。`,
              Object.assign({ t: 'graph' }, Q4, { edges: 'U-Y X-Y Y-Z U-X:moral', cls: { S: 'x', Z: 'y', V: 'removed', W: 'removed' }, w: 230, caption: '错误顺序的结果：$S$ 和 $T$ 都成了孤立点，$S$ 走不到 $Z$，于是误判"成立"。' }),
              T`为什么必须先结婚：$V$ 在条件集里，表示 $V$ 的值已经知道了；知道了共同孩子，它的两个父母 $S$、$U$ 就变得相关（第 2 节"展开详解"里的硬币例子）。结婚边 $S$—$U$ 记录的正是这一点，所以顺序永远是：祖先图 → 结婚 → 去方向 → 删条件集。`,
            ],
          },
        ],
      },
      {
        t: 'past', src: 'Workshop 12 Q2', topic: 'L20 p36 · WK12 p7',
        q: T`Consider the following Markov random field. Does the conditional independence statement $W\perp Y\mid V,Z$ hold in this Markov random field?`,
        qzh: T`考虑下面的马尔可夫随机场（Markov random field）。在这个马尔可夫随机场中，条件独立命题 $W\perp Y\mid V,Z$ 成立吗？`,
        azh: T`成立。在马尔可夫随机场中，如果删掉 $S$ 里的节点后 $X$ 和 $Y$ 被分开，那么 $X\perp Y\mid S$ 成立（普通的图分离（graph separation），不需要祖先图或道德化）。删掉 $V$ 和 $Z$ 后只剩边 $T$–$W$、$U$–$X$、$X$–$Y$，$W$ 只和 $T$ 相连，到不了 $Y$。因此 $W\perp Y\mid V,Z$ 成立。`,
        blocks: [Object.assign({ t: 'graph' }, WS2, { edges: WS2_EDGES, cls: { W: 'x', Y: 'y', V: 'given', Z: 'given' }, w: 260, caption: '题图：无向图，边没有箭头。蓝圈 $W$、绿圈 $Y$ 是要判断的两点；灰色 $V,Z$ 是条件集。' })],
        sol: [
          T`MRF 的边没有箭头，谈不上"父母"和"祖先"，所以四步法的前两步（取祖先图、结婚）直接跳过，只做后两步：删掉条件集，看还连不连通。课件 L20 p36 说的就是这条规则：删掉条件集以后两点不连通，就条件独立（详细讲解见 [c55](#/c55)）。`,
          { t: 'h4', text: '第 0 步：把边抄下来' },
          T`$T$—$W$，$U$—$V$，$V$—$W$，$U$—$X$，$V$—$Y$，$W$—$Z$，$X$—$Y$，$Y$—$Z$，一共 8 条。`,
          { t: 'h4', text: '第 1 步：删掉条件集 $V,Z$' },
          T`删 $V$ 带走 $U$—$V$、$V$—$W$、$V$—$Y$ 三条边；删 $Z$ 带走 $W$—$Z$、$Y$—$Z$ 两条。剩下 3 条：$T$—$W$，$U$—$X$，$X$—$Y$。`,
          { t: 'h4', text: '第 2 步：$W$ 还能走到 $Y$ 吗' },
          T`$W$ 只连着 $T$，而 $T$ 没有别的边；$Y$ 在 $U$—$X$—$Y$ 那一块。两块之间没有边，$W$ 走不到 $Y$，所以 $W\perp Y\mid V,Z$ 成立。`,
          { t: 'graphs', r: 15, caption: 'WK12 p7：删掉 $V,Z$ 后图断成两块。', items: [
            Object.assign({}, WS2, { edges: WS2_EDGES, cls: { W: 'x', Y: 'y', V: 'given', Z: 'given' }, caption: '① 原图：灰色 $V,Z$ 是条件集' }),
            Object.assign({}, WS2, { edges: 'U-V:gone V-W:gone V-Y:gone W-Z:gone Y-Z:gone T-W U-X X-Y', cls: { W: 'x', Y: 'y', V: 'removed', Z: 'removed' }, caption: T`② 删 $V,Z$：$\{T,W\}$ 和 $\{U,X,Y\}$ 不相连，成立` }),
          ] },
          {
            t: 'exam', md: T`Yes. In a Markov random field, $X\perp Y\mid S$ holds when removing the nodes in $S$ separates $X$ from $Y$ (ordinary graph separation; no ancestral graph or moralisation is needed). Removing $V$ and $Z$ leaves only the edges $T$–$W$, $U$–$X$ and $X$–$Y$, so $W$ is connected only to $T$ and cannot reach $Y$. Hence $W\perp Y\mid V,Z$ holds.`,
          },
          {
            t: 'warn', md: T`- **只删 $V$ 不够**：删掉 $V$ 后 $W$—$Z$—$Y$ 这条路还在，所以 $W\perp Y\mid V$ 不成立。快速检查法：$W$ 的邻居只有 $T,V,Z$，$T$ 是死胡同，$V$ 和 $Z$ 都被删了，$W$ 就出不去。
- 不要把 BN 的步骤搬过来：MRF 的边没有方向，没有"父母"，不用取祖先图，也不用结婚加边。多加的边可能把本来分开的两点连起来，答案就反了。`,
          },
        ],
      },

      { t: 'h2', text: '7. 往年真题（2021、2017）', id: 'past-old' },
      {
        t: 'past', src: '2021 S1 exam Q18(a)', marks: 6, topic: 'L20 p17（HMM 本身课件未讲）',
        q: 'A multiple-chain HMM has hidden chains $a_1\\to a_2\\to\\dots\\to a_T$ and $b_1\\to b_2\\to\\dots\\to b_T$, and observations $x_t$ with parents $a_t$ and $b_t$. What random variables are marginally independent of $a_1$? As we are considering marginal independence, no values of $x_t$ are observed. Explain your answer.',
        qzh: T`HMM 是 hidden Markov model（隐马尔可夫模型）的缩写，指隐藏状态随时间形成链、并产生观测变量的模型；本题只需按给出的有向图判断独立性。已知 $T$ 是总时间步数，$t=1,\dots,T$ 是时间下标。这个多链 HMM 的两条隐藏状态链（hidden chains）分别是$a_1\to a_2\to\dots\to a_T$ 和 $b_1\to b_2\to\dots\to b_T$，以及观测 $x_t$，其父节点为 $a_t$ 和 $b_t$。哪些随机变量与 $a_1$ 边缘独立（marginally independent）？由于考虑的是边缘独立，$x_t$ 的值都没有被观测。解释你的答案。`,
        azh: T`$b_1,\dots,b_T$ 全部（且只有它们）。两条链只通过 $x_t$ 相连，而 $x_t$ 是 $a_t$ 和 $b_t$ 的共同孩子（对撞点，collider）。在没有任何观测时，$\{a_1,b_t\}$ 的祖先图中不包含任何 $x$ 节点，所以不会加道德边（moral edge），$a_1$ 与 $b$ 链不连通：对每个 $t$ 都有 $a_1\perp b_t$。每个 $a_t$ 和 $x_t$ 都通过 $a$ 链与 $a_1$ 相连，所以它们与 $a_1$ 相关。`,
        blocks: [{ t: 'graph', nodes: { a1: [40, 40], a2: [150, 40], a3: [260, 40], x1: [40, 130], x2: [150, 130], x3: [260, 130], b1: [40, 220], b2: [150, 220], b3: [260, 220] }, labels: { a1: 'a₁', a2: 'a₂', a3: 'a₃', x1: 'x₁', x2: 'x₂', x3: 'x₃', b1: 'b₁', b2: 'b₂', b3: 'b₃' }, edges: 'a1>a2 a2>a3 b1>b2 b2>b3 a1>x1 b1>x1 a2>x2 b2>x2 a3>x3 b3>x3', cls: { a1: 'x' }, w: 320, caption: '双链 HMM（只画前 3 步）：上面一条链 $a$，下面一条链 $b$，每个观测 $x_t$ 有两个父节点 $a_t,b_t$。这一问**没有观测任何 $x$**，问哪些变量和 $a_1$（蓝圈）独立。' }],
        sol: [
          '用同一个四步法，条件集为空：',
          {
            t: 'ul', items: [
              '问 $a_1\\perp b_t$：祖先图只含 $a_1$ 和 $b_1,\\dots,b_t$（$x$ 都不是它们的祖先）。祖先图里没有任何共同孩子（$x_1$ 虽然是 $a_1$、$b_1$ 的共同孩子，但它是孩子不是祖先，进不了祖先图），不用结婚，$a_1$ 和 $b$ 链之间没有边 ⇒ **独立**。',
              '问 $a_1\\perp a_t$ 或 $a_1\\perp x_t$：祖先图里有 $a_1\\to a_2\\to\\dots$ 这条链（$x_1$ 则是直接边 $a_1\\to x_1$），直接连通 ⇒ 不独立。',
            ],
          },
          {
            t: 'exam', md: T`All of $b_1,\dots,b_T$ (and only those). The two chains are connected only through the $x_t$'s, which are common children (colliders) of $a_t$ and $b_t$. With nothing observed, the ancestral graph of $\{a_1,b_t\}$ contains no $x$ nodes, so no moral edges are added and $a_1$ is disconnected from the $b$ chain: $a_1\perp b_t$ for every $t$. Every $a_t$ and $x_t$ is connected to $a_1$ through the $a$ chain, so they are dependent on $a_1$.`,
          },
        ],
      },
      {
        t: 'past', src: '2017 S2 exam Q9(a)(b)', marks: '1 + 2', topic: 'L20 p17 · 因子分解见 c53',
        q: T`Consider the following directed probabilistic graphical model (PGM) over five binary-valued random variables, denoted $A,B,C,D$ and $E$. (a) State the form of the joint probability density function, $P(A,B,C,D,E)$. (b) State all the independence relations that hold between $B$ and $E$, considering both marginal and conditional independence.`,
        qzh: T`考虑下面这个有向概率图模型（directed probabilistic graphical model, PGM），有五个二值随机变量 $A,B,C,D,E$。(a) 写出联合概率分布 $P(A,B,C,D,E)$ 的形式。(b) 写出 $B$ 和 $E$ 之间成立的所有独立关系，边缘独立（marginal independence）和条件独立（conditional independence）都要考虑。`,
        azh: T`(a) $P(A,B,C,D,E)=P(B)\,P(A\mid B)\,P(C\mid B)\,P(D\mid B,C)\,P(E\mid C)$。(b) $B$ 和 $E$ 不是边缘独立的（有路径 $B\to C\to E$）。给定 $C$ 时它们条件独立：$B\perp E\mid C$；再同时给定 $A$ 和/或 $D$ 仍然成立：$B\perp E\mid A,C$；$B\perp E\mid C,D$；$B\perp E\mid A,C,D$。$B$ 和 $E$ 之间的每一条连接都经过 $C$（$B\to C\to E$ 和 $B\to D\leftarrow C\to E$）。道德化（moralise）不加新边，因为 $D$ 的父节点 $B,C$ 本来就相邻；所以删掉 $C$ 后 $E$ 与其余节点断开，而任何不含 $C$ 的条件集都留下 $B$–$C$–$E$ 这条通路。用 $\not\perp$ 表示独立性不成立（这里指图不能保证独立）。因此 $B\not\perp E$，$B\not\perp E\mid A$，$B\not\perp E\mid D$，$B\not\perp E\mid A,D$。`,
        blocks: [{ t: 'graph', nodes: { B: [140, 40], C: [250, 40], A: [40, 130], E: [250, 140], D: [140, 220] }, edges: 'B>A B>C B>D C>D C>E', cls: { B: 'x', E: 'y' }, w: 260, caption: '题图（照原卷重画）：$B\\to A$，$B\\to C$，$B\\to D$，$C\\to D$，$C\\to E$。蓝圈 $B$、绿圈 $E$ 是 (b) 要判断的两点。' }],
        sol: [
          { t: 'h4', text: '(a) 联合分布：每个节点乘一个"给定父节点"的因子' },
          {
            t: 'table', head: ['节点', '父节点', '因子'], rows: [
              ['$A$', '$B$', '$P(A\\mid B)$'], ['$B$', '无', '$P(B)$'], ['$C$', '$B$', '$P(C\\mid B)$'],
              ['$D$', '$B,C$', '$P(D\\mid B,C)$'], ['$E$', '$C$', '$P(E\\mid C)$'],
            ],
          },
          { t: 'math', tex: T`P(A,B,C,D,E)=P(B)\,P(A\mid B)\,P(C\mid B)\,P(D\mid B,C)\,P(E\mid C)` },
          T`规则见 [c53](#/c53)：有向图的联合分布 = 每个节点在给定父节点时的条件概率之积。没有父节点的 $B$ 只写 $P(B)$。`,
          { t: 'h4', text: '(b) 第 0 步：要判断哪些命题' },
          T`"between $B$ and $E$" 指形如 $B\perp E\mid S$ 的命题，$S$ 取其余三个变量 $\{A,C,D\}$ 的任一子集，每个变量都有“放进条件集”和“不放进条件集”两种选择，所以共有 $2\times2\times2=2^3=8$ 种；三个都不放时 $S$ 为空，就是边缘独立。每一种都用第 2 节的四步法判断。`,
          { t: 'h4', text: '(b) 第 1 步：先看全图的结构，一次判完 8 种' },
          {
            t: 'ul', items: [
              T`**结婚不加新边。** 唯一有两个父节点的是 $D$（父节点 $B,C$），而 $B$—$C$ 本来就有边，所以只需把祖先图里的边去掉方向；每种条件集的祖先图见下表第二列。`,
              T`$E$ 只和 $C$ 相连。所以条件集里有 $C$ 时，删掉 $C$ 后 $E$ 成了孤立点 ⇒ 独立。`,
              T`条件集里没有 $C$ 时，$B$—$C$ 和 $C$—$E$ 这两条边都碰不到条件集里的点，删完还在，$B$—$C$—$E$ 连通 ⇒ 不独立。`,
            ],
          },
          {
            t: 'table', head: ['条件集 $S$', '祖先图', '删掉 $S$ 后', '$B\\perp E\\mid S$？'], rows: [
              ['空（边缘）', '$\\{B,C,E\\}$', '$B$—$C$—$E$ 连通', '不成立'],
              ['$\\{A\\}$', '$\\{A,B,C,E\\}$', '$B$—$C$—$E$ 连通', '不成立'],
              ['$\\{D\\}$', '$\\{B,C,D,E\\}$', '$B$—$C$—$E$ 连通', '不成立'],
              ['$\\{A,D\\}$', '全部 5 个点', '$B$—$C$—$E$ 连通', '不成立'],
              ['$\\{C\\}$', '$\\{B,C,E\\}$', '$E$ 孤立', '**成立**'],
              ['$\\{A,C\\}$', '$\\{A,B,C,E\\}$', '$E$ 孤立', '**成立**'],
              ['$\\{C,D\\}$', '$\\{B,C,D,E\\}$', '$E$ 孤立', '**成立**'],
              ['$\\{A,C,D\\}$', '全部 5 个点', '$E$ 孤立', '**成立**'],
            ],
          },
          { t: 'graphs', r: 16, caption: '蓝圈 $B$、绿圈 $E$；被删掉的条件节点画成删除样式；红 = 找到的路径。', items: [
            { nodes: { B: [140, 40], C: [250, 40], A: [40, 130], E: [250, 140], D: [140, 220] }, edges: 'B-A B-C B-D C-D C-E', cls: { B: 'x', E: 'y' }, caption: '① 结婚 + 去方向：$D$ 的父母 $B,C$ 本来就相连，没有新边' },
            { nodes: { B: [140, 40], C: [250, 40], A: [40, 130], E: [250, 140], D: [140, 220] }, edges: 'B-A:gone B-D:gone C-D:gone B-C:path C-E:path', cls: { B: 'x', E: 'y', A: 'removed', D: 'removed' }, caption: '② 不含 $C$（例：给定 $A,D$）：$B$—$C$—$E$ 还连着 ⇒ 不独立' },
            { nodes: { B: [140, 40], C: [250, 40], A: [40, 130], E: [250, 140], D: [140, 220] }, edges: 'B-A:gone B-C:gone B-D:gone C-D:gone C-E:gone', cls: { B: 'x', E: 'y', A: 'removed', C: 'removed', D: 'removed' }, caption: '③ 含 $C$（例：给定 $A,C,D$）：$E$ 成了孤立点 ⇒ 独立' },
          ] },
          {
            t: 'exam', md: T`(a) $P(A,B,C,D,E)=P(B)\,P(A\mid B)\,P(C\mid B)\,P(D\mid B,C)\,P(E\mid C)$.

(b) $B$ and $E$ are **not** marginally independent (path $B\to C\to E$). They are conditionally independent given $C$: $B\perp E\mid C$, and this still holds when $A$ and/or $D$ are also given: $B\perp E\mid A,C$; $B\perp E\mid C,D$; $B\perp E\mid A,C,D$. Every connection between $B$ and $E$ passes through $C$ ($B\to C\to E$ and $B\to D\leftarrow C\to E$). Moralising adds no new edge because $D$'s parents $B,C$ are already adjacent, so removing $C$ disconnects $E$, while any conditioning set without $C$ leaves $B$–$C$–$E$ connected. Hence $B\not\perp E$, $B\not\perp E\mid A$, $B\not\perp E\mid D$ and $B\not\perp E\mid A,D$.`,
          },
          {
            t: 'warn', md: T`- 题目要 "all"：四条成立的都写出来，再写一句"不是边缘独立"。
- 不要写和 $B$、$E$ 无关的命题（比如 $A\perp E\mid B$），题目只问 $B$ 和 $E$ 之间。
- $D$ 是 $B$、$C$ 的共同孩子（collider）。只给定 $D$ 不会让 $B$、$E$ 独立：$B$ 到 $E$ 的每条连接都经过 $C$，删掉 $D$ 断不了 $B$—$C$—$E$。`,
          },
        ],
      },

      { t: 'h2', text: '8. 随机练习', id: 'practice' },
      '随机生成一张 DAG（directed acyclic graph，有向无环图：边有箭头，沿箭头走不能绕回出发点）和一个问题。先在纸上按四步法做，再看解答。',
      { t: 'practice', gen: 'dsep', title: 'D-separation 随机题' },
      {
        t: 'quiz', items: [
          {
            q: '图 $A\\to B\\to C$。$A\\perp C\\mid B$ 成立吗？',
            options: ['成立', '不成立'], answer: 0,
            explain: '祖先图 $\\{A,B,C\\}$，没有共同孩子，不用结婚。删掉 $B$ 后 $A$、$C$ 不连通 ⇒ 成立。',
          },
          {
            q: '图 $A\\to C\\leftarrow B$，$C\\to D$。$A\\perp B\\mid D$ 成立吗？',
            options: ['成立', '不成立'], answer: 1,
            explain: '$D$ 的祖先包括 $C$，而 $C$ 的父母 $A,B$ 结婚。删掉 $D$ 后 $A$—$B$ 直接相连 ⇒ 不成立。（观测 collider 的后代，同样会让父节点相关。）',
          },
          {
            q: '同一张图 $A\\to C\\leftarrow B$，$C\\to D$，条件集为空。$A\\perp B$ 成立吗？',
            options: ['成立', '不成立'], answer: 0,
            explain: '祖先图只有 $\\{A,B\\}$（$C,D$ 不是它们的祖先），没有边 ⇒ 成立。',
          },
          {
            q: T`Workshop 12 Q1（和 2026 practice Q4 同一题）：删掉 $V,W$ 以后，路径 $S$—$U$—$Y$—$Z$ 的第一段 $S$—$U$ 是从哪里来的？`,
            options: [T`原图里就有边 $S\to U$`, T`$V$ 的两个父节点 $S,U$ 结婚`, T`$W$ 的两个父节点 $S,T$ 结婚`, T`$Z$ 的父节点两两结婚`], answer: 1,
            explain: T`原图里 $S$ 只有两条边 $S\to V$、$S\to W$，没有 $S\to U$。$V$ 有两个父节点 $S$ 和 $U$，moralize 时给它们连上 $S$—$U$；这条边不碰 $V$ 和 $W$，删条件集时留了下来，于是 $S$ 能沿 $S$—$U$—$Y$—$Z$ 走到 $Z$。$W$ 的父母结婚得到的是 $S$—$T$，但删掉 $W$ 后 $T$ 只连着 $S$，是死胡同。$Z$ 的父母结婚得到 $V$—$W$、$V$—$Y$、$W$—$Y$，每条都碰到 $V$ 或 $W$，全被删掉了。`,
          },
          {
            q: T`Workshop 12 Q2 的 MRF（边：$T$—$W$，$U$—$V$，$V$—$W$，$U$—$X$，$V$—$Y$，$W$—$Z$，$X$—$Y$，$Y$—$Z$），条件集只剩 $V$。$W\perp Y\mid V$ 成立吗？`,
            options: ['成立', '不成立'], answer: 1,
            explain: T`MRF 只看普通的图分离：删掉 $V$ 和它的 3 条边（$U$—$V$、$V$—$W$、$V$—$Y$），剩下 $T$—$W$、$U$—$X$、$W$—$Z$、$X$—$Y$、$Y$—$Z$。$W$—$Z$—$Y$ 这条路还在，$W$ 能走到 $Y$，所以不成立。原题把 $Z$ 也放进条件集，这条路才断开，原题因此成立。`,
          },
        ],
      },
    ],
  });
})(window);
