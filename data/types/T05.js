/* T5 — Conditional independence in Bayesian networks (L20 p12–p27). */
(function (root) {
  'use strict';
  const T = String.raw;
  const Q4 = { nodes: { S: [140, 40], T: [240, 40], U: [40, 130], V: [140, 130], W: [240, 130], X: [40, 220], Y: [140, 220], Z: [240, 220] } };

  root.SML.content.add({
    id: 'T05',
    eyebrow: '题型 T5 · 8 分 · 四步法，零失误',
    title: 'BN 条件独立：$X\\perp Y\\mid S$ 成立吗',
    en: 'Does a conditional independence statement hold in a Bayesian network?',
    chips: [
      { text: 'L20 p17–p25', href: '#/L20', cls: 'src' },
      { text: '2026 practice Q4', cls: 'hot' }, { text: '2025 practice Q1c', cls: 'src' }, { text: '2021 exam Q18a', cls: 'src' },
    ],
    lead: '课件只教了一种方法，考试就按这个方法写：**祖先图 → moralize → 去方向 → 删掉条件节点 → 看还连不连通**。每一步都写在卷面上，就能拿满步骤分。\n\n记号：$X\\perp Y\\mid S$ 里，竖线**右边**的就是"条件节点"（given 的节点），这一页把它们叫作**条件集**。注意 2026 真题里恰好有一个节点也叫 $S$——那道题的条件集是 $\\{V,W\\}$，节点 $S$ 是要判断的对象之一，不要删它。',
    blocks: [
      { t: 'h2', text: '1. 先确认符号', id: 'notation' },
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

      { t: 'h2', text: '2. 四步法（D-separation）', id: 'method' },
      {
        t: 'steps', items: [
          T`**列出所有边。** 先把图里每条有向边写成"父节点 $\to$ 子节点"的形式（如 $E\to A$），防止读图出错。`,
          T`**祖先图（ancestral graph）。** 只保留 $X$、$Y$、条件集里的节点以及它们的**所有祖先**（父、父的父……）。其他节点和它们的边全部删掉（L20 p17）。`,
          T`**Moralize。** 在祖先图里，凡是有共同孩子的两个父节点，连一条无向边（"结婚"）。然后把所有边的方向去掉（p19–p20）。`,
          T`**删掉条件集里的节点**（竖线右边那些，以及和它们相连的边）。`,
          T`**看 $X$ 和 $Y$ 是否还连通。** 没有路径 ⇒ $X\perp Y\mid S$ **成立**；还有路径 ⇒ 这条独立性**不成立**（图不能保证独立），写出这条路径（p20–p25）。`,
        ],
      },
      {
        t: 'warn', title: '两个最容易错的地方',
        md: '- **顺序不能反**：必须先取祖先图、再 moralize、最后删条件集。先删条件节点再 moralize，就会漏掉"给定共同孩子以后两个父节点变相关"的那条边。\n- **只在祖先图里结婚**：不在祖先图里的节点（例如 $X,Y,S$ 的后代）完全不考虑，它们的父母也不结婚。',
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
            t: 'ext', md: '很多教材用 active trail / v-structure 规则（chain、fork 给定中间节点就阻断；collider 给定它或其后代才打开）。和课件的四步法结论完全一样，但**课件没有教这套说法**，考试按四步法写。',
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

      { t: 'h2', text: '5. 真题全解', id: 'past' },
      {
        t: 'past', src: '2026 S2 practice Q4', marks: 8, topic: 'L20 p17',
        q: 'Consider the following Bayesian network. Does the conditional independence statement $S\\perp Z\\mid V,W$ hold in this Bayesian network?',
        blocks: [{ t: 'fig', src: 'assets/figures/ex2026_q4_bn.png', w: 260 }],
        sol: [
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
      {
        t: 'past', src: '2021 S1 exam Q18(a)', marks: 6, topic: 'L20 p17（HMM 本身课件未讲）',
        q: 'A multiple-chain HMM has hidden chains $a_1\\to a_2\\to\\dots\\to a_T$ and $b_1\\to b_2\\to\\dots\\to b_T$, and observations $x_t$ with parents $a_t$ and $b_t$. What random variables are marginally independent of $a_1$? As we are considering marginal independence, no values of $x_t$ are observed. Explain your answer.',
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

      { t: 'h2', text: '6. 随机练习', id: 'practice' },
      '随机生成一张 DAG 和一个问题。先在纸上按四步法做，再看解答。',
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
        ],
      },
    ],
  });
})(window);
