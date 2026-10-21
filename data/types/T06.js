/* T6 — Variable elimination order → junction tree cliques (L22 p5–p33; message passing L21). */
(function (root) {
  'use strict';
  const T = String.raw;
  /* 2026 practice Q5 的 MRF，布局照原题图。 */
  const Q5 = { nodes: { T: [150, 30], U: [60, 85], W: [240, 85], V: [150, 140], X: [60, 200], Z: [240, 200], Y: [150, 255] } };
  const q5 = (edges, cls, caption) => Object.assign({}, Q5, { edges: edges, cls: cls, caption: caption });

  root.SML.content.add({
    id: 'T06',
    eyebrow: '题型 T6 · 8 分 · 已对照 L22 课件',
    title: '消元顺序 → junction tree 的团',
    en: 'Elimination order → cliques of the junction tree',
    chips: [
      { text: 'L22 p6–p22', href: '#/L22', cls: 'src' }, { text: 'L21 消息传递', href: '#/L21', cls: 'src' }, { text: 'L20 p29（clique）', href: '#/L20', cls: 'src' },
      { text: '2026 practice Q5', cls: 'hot' }, { text: '2021 exam Q18b', cls: 'src' },
      { text: 'Workshop 12 Q4', href: '#/T06/ws12', cls: 'src' },
    ],
    lead: '给一个无向图（MRF）和一个消元顺序，按顺序一个个删点：删之前把它的邻居两两连起来，记下"这个点 + 它的邻居"。最后去掉被包含的集合，剩下的就是 junction tree 的团。',
    blocks: [
      {
        t: 'good', title: '已对照课件核实',
        md: 'L22 p6–p22 的做法和本页完全一致：删点前连接邻居、记录团；**只保留极大团**（p17："drop all the cliques that are subsets of other cliques"）；junction tree 是团图上的**最大权重生成树**，权重 = 两个团共享的变量个数（p20）。2026 practice Q5 的答案不变。',
      },
      { t: 'h2', text: '1. 定义回顾', id: 'defs' },
      {
        t: 'table', head: ['术语', '含义'], rows: [
          ['clique', '两两之间都有边的一组节点（L20 p29）'],
          ['maximal clique', '不能再加入任何点仍保持是 clique 的团（p29）'],
          ['eliminate $v$', '把 $v$ 当前的所有邻居两两连起来（**fill-in edges**），然后删掉 $v$ 和它的边'],
          ['elimination clique', '删 $v$ 时的 $\\{v\\}\\cup N(v)$：$N(v)$ 是 $v$ **此刻**的全部邻居（包括前面几步加的 fill-in 边带来的邻居）'],
          ['clique graph', '极大团作节点，有共享变量的两个团之间连边（L22 p18）'],
          ['junction tree', '团图上的最大权重生成树，边权 = 共享变量个数（p20）；相邻两团的交集叫 separator（p22）'],
          ['running intersection', '两个不相邻的团有共同变量时，这个变量出现在它们之间路径上的每个团里（p21）'],
        ],
      },
      { t: 'h2', text: '2. 步骤', id: 'steps' },
      {
        t: 'steps', items: [
          '**列出所有边**（防止读图出错）。',
          '**按顺序消元**，每一步写一行表：被删节点 | 当前邻居 | 新加的 fill-in 边 | 记下的团 $\\{v\\}\\cup N(v)$。邻居要按**当前**的图算，包括前面加进来的 fill-in 边。',
          '**去掉被包含的团**：如果一个团是另一个团的子集，就删掉。剩下的就是 junction tree 的团。',
          '**连成树**（题目问 junction tree 时）：任意两个团之间的边权 = 共享变量个数，选总权重最大的生成树；写出每条边的 separator（两团交集）（L22 p18–p22）。',
        ],
      },
      { t: 'viz', id: 'elim-stepper', opts: { preset: 'EX2026Q5' } },

      { t: 'h2', text: '课件原例（L22 p6–p22）', id: 'lecture' },
      '图：$x_1$—$x_2$，$x_1$—$x_3$，$x_2$—$x_4$，$x_3$—$x_4$，$x_3$—$x_5$，$x_4$—$x_5$（来自 L22 p4 的 BN moralize 之后）。顺序 $x_1,x_2,x_3,x_4,x_5$。',
      {
        t: 'table', head: ['删', '当前邻居', 'fill-in', '团'], rows: [
          ['$x_1$', '$x_2,x_3$', '$x_2$—$x_3$', '$c_1=\\{1,2,3\\}$'], ['$x_2$', '$x_3,x_4$', '无（$x_3$—$x_4$ 已有）', '$c_2=\\{2,3,4\\}$'],
          ['$x_3$', '$x_4,x_5$', '无', '$c_3=\\{3,4,5\\}$'], ['$x_4$', '$x_5$', '无', '$\\{4,5\\}$ ⊂ 划掉'], ['$x_5$', '—', '无', '$\\{5\\}$ ⊂ 划掉'],
        ],
      },
      '团图三条边的权重：$|c_1\\cap c_2|=2$，$|c_2\\cap c_3|=2$，$|c_1\\cap c_3|=1$。最大权重生成树保留两条权重 2 的边：$c_1$—$c_2$（separator $\\{x_2,x_3\\}$）、$c_2$—$c_3$（separator $\\{x_3,x_4\\}$）（p20–p22）。',
      {
        t: 'deep', title: '展开详解：好的顺序 vs 坏的顺序（L22 p27–p32，简答题素材）', blocks: [
          '同一张图：中心 $A$ 连着 4 个三角形 $\\{A,B,C\\},\\{A,D,E\\},\\{A,F,G\\},\\{A,H,L\\}$。',
          { t: 'table', head: ['顺序', '发生了什么', '最大团'], rows: [['$B,C,D,E,F,G,H,L,A$（先删外围）', '每次删的点只有两个邻居且已相连，**不加任何边**；极大团是 4 个三角形', '3 个点'], ['$A,B,\\dots,L$（先删中心）', '删 $A$ 时它的 8 个邻居 $B,\\dots,L$ 要两两相连：两两共 $8\\times7/2=28$ 条，已有 $BC,DE,FG,HL$ 4 条，**加 $28-4=24$ 条**；第一个团就是 $A$ + 8 个邻居 = 全部 9 个点', '9 个点']] },
          '（推断 = 在图上算某个变量的概率，要把其他变量加起来消掉；团里有 $s$ 个二元变量，一次就要处理 $2^s$ 种组合。）推断代价随最大团大小指数增长，所以顺序很关键。找最优顺序是困难的问题；常用的近视启发式：**下一个删"会产生最小团"的点**（p26）。',
          { t: 'exam', md: T`The elimination order determines the fill-in edges and hence the cliques of the junction tree. Inference cost grows exponentially with the size of the largest clique, so a good order (e.g. eliminating peripheral nodes first) keeps cliques small, while a bad order (e.g. eliminating a hub first) can create one huge clique. Finding the optimal order is hard; a greedy heuristic eliminates next the variable that creates the smallest clique.` },
        ],
      },

      { t: 'h2', text: '3. 真题全解', id: 'past' },
      {
        t: 'past', src: '2026 S2 practice Q5', marks: 8, topic: 'L22 p6–p22',
        q: 'Consider the following Markov Random Field. Assume the following node elimination order: $T, X, Z, U, W, V, Y$. What are the cliques in the junction tree (by using the above elimination order)?',
        qzh: '考虑下面的马尔可夫随机场（Markov Random Field）。假设节点消元顺序（elimination order）为：$T, X, Z, U, W, V, Y$。（使用上述消元顺序时）联结树（junction tree）中的团（clique）有哪些？',
        azh: T`按顺序 $T,X,Z,U,W,V,Y$ 消元（把每个被消去节点的剩余邻居两两相连），会加上填补边（fill-in edge）$U$–$W$、$U$–$Y$、$W$–$Y$，并产生团 $\{T,U,W\}$、$\{U,X,Y\}$、$\{V,W,Y,Z\}$、$\{U,V,W,Y\}$、$\{V,W,Y\}$、$\{V,Y\}$、$\{Y\}$。去掉包含在更大团中的那些，联结树的团为
$\{T,U,W\},\ \{U,X,Y\},\ \{V,W,Y,Z\},\ \{U,V,W,Y\}$。
一棵合法的树：$\{U,V,W,Y\}$ 分别连接 $\{T,U,W\}$（分隔集（separator）$\{U,W\}$）、$\{U,X,Y\}$（分隔集 $\{U,Y\}$）和 $\{V,W,Y,Z\}$（分隔集 $\{V,W,Y\}$）。`,
        blocks: [{ t: 'fig', src: 'assets/figures/ex2026_q5_mrf.png', w: 240 }],
        sol: [
          '边：$T$—$U$，$T$—$W$，$U$—$V$，$U$—$X$，$V$—$W$，$V$—$Y$，$V$—$Z$，$W$—$Z$，$X$—$Y$，$Y$—$Z$。',
          { t: 'graphs', r: 17, caption: '按 $T,X,Z,U$ 的顺序消元（黄 = 正在消，浅色 = 已消掉，紫色虚线 = 消元时加的 fill-in 边）。后面的 $W,V,Y$ 不再产生新团。', items: [
            q5('T-U T-W U-V U-X W-V W-Z V-Y V-Z X-Y Y-Z U-W:fill', { T: 'cur' }, '① 消 $T$：邻居 $U,W$ 没连 ⇒ 加 $U$—$W$；团 $\\{T,U,W\\}$'),
            q5('T-U:gone T-W:gone U-V U-X W-V W-Z V-Y V-Z X-Y Y-Z U-W:fill U-Y:fill', { T: 'done', X: 'cur' }, '② 消 $X$：邻居 $U,Y$ 没连 ⇒ 加 $U$—$Y$；团 $\\{U,X,Y\\}$'),
            q5('T-U:gone T-W:gone U-V U-X:gone W-V W-Z V-Y V-Z X-Y:gone Y-Z U-W:fill U-Y:fill W-Y:fill', { T: 'done', X: 'done', Z: 'cur' }, '③ 消 $Z$：邻居 $V,W,Y$；$V$—$W$、$V$—$Y$ 已有，加 $W$—$Y$；团 $\\{V,W,Y,Z\\}$'),
            q5('T-U:gone T-W:gone U-V U-X:gone W-V W-Z:gone V-Y V-Z:gone X-Y:gone Y-Z:gone U-W:fill U-Y:fill W-Y:fill', { T: 'done', X: 'done', Z: 'done', U: 'cur' }, '④ 消 $U$：邻居 $V,W,Y$——$W$、$Y$ 是 ①② 加的 fill-in 带来的！三者已两两相连；团 $\\{U,V,W,Y\\}$'),
          ] },
          {
            t: 'table', head: ['删', '当前邻居', 'fill-in', '团'], rows: [
              ['$T$', '$U,W$', '$U$—$W$', '$\\{T,U,W\\}$'],
              ['$X$', '$U,Y$', '$U$—$Y$', '$\\{U,X,Y\\}$'],
              ['$Z$', '$V,W,Y$', '$W$—$Y$（$V$—$W$、$V$—$Y$ 已有）', '$\\{V,W,Y,Z\\}$'],
              ['$U$', '$V,W,Y$（$W$、$Y$ 来自前面的 fill-in）', '无（已两两相连）', '$\\{U,V,W,Y\\}$'],
              ['$W$', '$V,Y$', '无', '$\\{V,W,Y\\}$ ⊂ 上面的团'],
              ['$V$', '$Y$', '无', '$\\{V,Y\\}$ ⊂'],
              ['$Y$', '—', '无', '$\\{Y\\}$ ⊂'],
            ],
          },
          { t: 'graph', r: 26, nodes: { c4: [200, 120], c1: [60, 40], c2: [60, 200], c3: [360, 120] }, labels: { c1: 'c₁', c2: 'c₂', c3: 'c₃', c4: 'c₄' }, notes: { c1: '{T,U,W}', c2: '{U,X,Y}', c3: '{V,W,Y,Z}', c4: '{U,V,W,Y}' }, edges: 'c4-c1:hl={U,W} c4-c2:hl={U,Y} c4-c3:hl={V,W,Y}', w: 440, caption: '一个合法的 junction tree：4 个极大团都和 $\\{U,V,W,Y\\}$ 相连，边上写的是 separator（两团的交集）。边权 = 共享变量个数：$\\{U,W\\}$ 2、$\\{U,Y\\}$ 2、$\\{V,W,Y\\}$ 3，合计 7；其它团对只共享 1 个变量，换掉任何一条都会变小，所以这是最大权重生成树（4 个团、3 条边、无环）。题目只问团时，树可以不画。' },
          {
            t: 'exam', md: T`Eliminating in order $T,X,Z,U,W,V,Y$ (connecting the remaining neighbours of each eliminated node) adds fill-in edges $U$–$W$, $U$–$Y$, $W$–$Y$ and produces the cliques $\{T,U,W\}$, $\{U,X,Y\}$, $\{V,W,Y,Z\}$, $\{U,V,W,Y\}$, $\{V,W,Y\}$, $\{V,Y\}$, $\{Y\}$. Removing those contained in larger ones, the junction tree cliques are
$\{T,U,W\},\ \{U,X,Y\},\ \{V,W,Y,Z\},\ \{U,V,W,Y\}$.
A valid tree: $\{U,V,W,Y\}$ connected to $\{T,U,W\}$ (separator $\{U,W\}$), $\{U,X,Y\}$ (separator $\{U,Y\}$) and $\{V,W,Y,Z\}$ (separator $\{V,W,Y\}$).`,
          },
          { t: 'warn', md: '删 $U$ 时最容易漏掉 $W$ 和 $Y$：它们原本不是 $U$ 的邻居，是删 $T$、$X$ 时加的 fill-in 边让它们成了邻居。' },
        ],
      },
      {
        t: 'past', src: '2021 S1 exam Q18(b)', marks: 8, topic: 'L21 消息记法；HMM 本身课件未讲',
        q: 'We wish to use the elimination algorithm to perform inference in the multiple-chain HMM given observed $x$. Show the first two steps of the algorithm, for eliminating $X_1=x_1$ then $A_1$. As part of your answer, state the formulation of the $\\psi$ and $m$ functions and the linear algebraic operations used in each step.',
        qzh: T`我们希望在给定观测 $x$ 的情况下，用消元算法（elimination algorithm）在多链 HMM 中做推断（inference）。写出算法的前两步：先消去 $X_1=x_1$，再消去 $A_1$。作为答案的一部分，写出 $\psi$ 和 $m$ 函数的表达式，以及每一步用到的线性代数运算。`,
        blocks: [{ t: 'graph', nodes: { a1: [40, 40], a2: [150, 40], a3: [260, 40], x1: [40, 130], x2: [150, 130], x3: [260, 130], b1: [40, 220], b2: [150, 220], b3: [260, 220] }, labels: { a1: 'a₁', a2: 'a₂', a3: 'a₃', x1: 'x₁', x2: 'x₂', x3: 'x₃', b1: 'b₁', b2: 'b₂', b3: 'b₃' }, edges: 'a1>a2 a2>a3 b1>b2 b2>b3 a1>x1 b1>x1 a2>x2 b2>x2 a3>x3 b3>x3', cls: { x1: 'given', x2: 'given', x3: 'given' }, w: 320, caption: '同一个双链 HMM（只画前 3 步）。这一问 $x$ 全部已观测（灰色）；先消 $X_1$，再消 $A_1$。' }],
        sol: [
          { t: 'ext', md: '今年 L21 讲了同样的思路：消掉一个变量 = 把含它的因子相乘再对它求和，得到一条消息 $m$（L21 p12–p22）；观测变量用指示函数把因子"切片"（p24–p27）。HMM 这个模型本身今年没讲，下面按同样记法写。' },
          {
            t: 'steps', items: [
              T`势函数：$\psi(a_1)=P(a_1)$，$\psi(b_1)=P(b_1)$，$\psi(a_1,a_2)=P(a_2\mid a_1)$，$\psi(b_1,b_2)=P(b_2\mid b_1)$，$\psi(x_1,a_1,b_1)=P(x_1\mid a_1,b_1)$ …`,
              T`**消去 $X_1$（已观测为 $x_1$）**：不求和，直接代入观测值：$m_{x_1}(a_1,b_1)=\psi(x_1{=}x_1,a_1,b_1)$。线性代数上就是从 $2\times2\times2$ 的表里取出 $x_1$ 对应的 $2\times2$ 切片。（括号里左边的 $x_1$ 是因子里的变量，右边是已经读到的值——只代入、不求和。三个轴是 $x_1,a_1,b_1$，假定都取 0/1，答题时先声明；取出切片后剩下的表行是 $a_1$、列是 $b_1$。）`,
              T`**消去 $A_1$**：把所有含 $a_1$ 的因子相乘再对 $a_1$ 求和：$m_{a_1}(a_2,b_1)=\sum_{a_1}\psi(a_1)\,\psi(a_1,a_2)\,m_{x_1}(a_1,b_1)$。记转移矩阵 $A[a_1,a_2]=P(a_2\mid a_1)$、$M[a_1,b_1]=m_{x_1}(a_1,b_1)$、$p=\psi(a_1)$，则这一步就是矩阵乘法 $m_{a_1}=A^{\top}\,\mathrm{diag}(p)\,M$（结果按 $[a_2,b_1]$ 索引）。读法：$A$ 的行是 $a_1$、列是 $a_2$；$M$ 的行是 $a_1$、列是 $b_1$；$\mathrm{diag}(p)$ 是把 $p(0),p(1)$ 放在对角线上、其余为 0 的 $2\times2$ 表（作用是给每一行 $a_1$ 乘上 $p(a_1)$）；$A^\top$ 把行换成 $a_2$，左乘就是对 $a_1$ 求和——结果第 $[a_2,b_1]$ 格 $=\sum_{a_1}p(a_1)A[a_1,a_2]M[a_1,b_1]$，和上面的求和式一模一样。新因子连接 $a_2$ 和 $b_1$（产生 fill-in 边 $A_2$—$B_1$）。`,
            ],
          },
        ],
      },

      { t: 'h2', text: '4. Workshop 12 Q4', id: 'ws12' },
      T`Workshop 12 Q4 和 [上一节](#/T06/past) 的 2026 practice Q5 **是同一道题**（同一张图、同一个消元顺序），workshop 原题直接上了考卷。这里按 workshop 官方答案（WK12 p9）的格式写：每删一个点记一个团，最后划掉被包含的团。上一节还多画了 junction tree 本身。`,
      {
        t: 'past', src: 'Workshop 12 Q4', topic: 'L22 p6–p17 · WK12 p9',
        q: T`Consider the following Markov Random field. Assume the following node elimination order: $T, X, Z, U, W, V, Y$. (Eliminate the first node in the list, then eliminate the second node in the list, then eliminate the third node in the list, etc.) What are the cliques in the junction tree (by using the above elimination order)?`,
        qzh: T`考虑下面的马尔可夫随机场（Markov random field）。消元顺序（elimination order）为 $T, X, Z, U, W, V, Y$（先消去列表里的第一个节点，再消第二个，再消第三个……）。用这个消元顺序，联结树（junction tree）里的团（clique）有哪些？`,
        azh: T`按 $T,X,Z,U,W,V,Y$ 的顺序消元，每次把被消节点的当前邻居两两相连，并记下团（节点 + 邻居）：

- $T$：邻居 $U,W$，填补边（fill-in edge）$U$–$W$，团 $\{T,U,W\}$；
- $X$：邻居 $U,Y$，填补边 $U$–$Y$，团 $\{U,X,Y\}$；
- $Z$：邻居 $V,W,Y$，填补边 $W$–$Y$，团 $\{V,W,Y,Z\}$；
- $U$：邻居 $V,W,Y$，没有填补边，团 $\{U,V,W,Y\}$；
- $W$、$V$、$Y$：团 $\{V,W,Y\}$、$\{V,Y\}$、$\{Y\}$，它们是 $\{U,V,W,Y\}$ 的子集，丢掉。

联结树的团就是这些极大团（maximal clique）：$\{T,U,W\}$、$\{U,X,Y\}$、$\{V,W,Y,Z\}$、$\{U,V,W,Y\}$。`,
        blocks: [Object.assign({ t: 'graph', w: 240 }, q5('T-U T-W U-V U-X W-V W-Z V-Y V-Z X-Y Y-Z', {}, '题图（位置照 tutorial 原图）：7 个点、10 条边的无向图。'))],
        sol: [
          T`做法（L22 p6–p17）：按给定顺序一次删一个点。删之前先看它此刻的全部邻居，把还没连上的邻居两两连起来（新加的边叫 fill-in edge，填补边），记下"被删的点 + 它的邻居"作为一个团（clique），再把这个点和它的边删掉。全部删完后，**划掉被别的团包含的团**，剩下的极大团（maximal clique）就是 junction tree（联结树）的团。`,
          { t: 'h4', text: '第 0 步：把边抄下来' },
          T`$T$—$U$，$T$—$W$，$U$—$V$，$U$—$X$，$V$—$W$，$V$—$Y$，$V$—$Z$，$W$—$Z$，$X$—$Y$，$Y$—$Z$，一共 10 条。`,
          { t: 'h4', text: '第 1 步：按顺序消元，每步一行' },
          {
            t: 'table', head: ['被删节点', '当前邻居', 'fill-in 边', '团'], rows: [
              ['$T$', '$U,W$', '$U$—$W$', T`$\{T,U,W\}$`],
              ['$X$', '$U,Y$', '$U$—$Y$', T`$\{U,X,Y\}$`],
              ['$Z$', '$V,W,Y$', '$W$—$Y$（$V$—$W$、$V$—$Y$ 原来就有）', T`$\{V,W,Y,Z\}$`],
              ['$U$', '$V,W,Y$（$W$、$Y$ 是 fill-in 带来的）', '无（三者已两两相连）', T`$\{U,V,W,Y\}$`],
              ['$W$', '$V,Y$', '无', T`$\{V,W,Y\}$ ⊂ $\{U,V,W,Y\}$，划掉`],
              ['$V$', '$Y$', '无', T`$\{V,Y\}$ ⊂ $\{U,V,W,Y\}$，划掉`],
              ['$Y$', '—', '无', T`$\{Y\}$ ⊂ $\{U,V,W,Y\}$，划掉`],
            ],
          },
          {
            t: 'steps', items: [
              T`删 $T$：邻居 $U,W$ 原来不相连，补上 $U$—$W$，记团 $\{T,U,W\}$。`,
              T`删 $X$：邻居 $U,Y$ 原来不相连，补上 $U$—$Y$，记团 $\{U,X,Y\}$。`,
              T`删 $Z$：邻居 $V,W,Y$。$V$—$W$、$V$—$Y$ 原来就有，缺 $W$—$Y$，补上；记团 $\{V,W,Y,Z\}$。`,
              T`删 $U$：原图里 $U$ 的邻居是 $T,V,X$，其中 $T,X$ 已经删了；再加上前两步补的 $U$—$W$、$U$—$Y$，此刻的邻居是 $V,W,Y$。这三个点两两都连着（$W$—$Y$ 是上一步补的），不用加边；记团 $\{U,V,W,Y\}$。`,
              T`删 $W$、$V$、$Y$：此刻的邻居分别是 $V,Y$、只剩 $Y$、一个也没有，都不用加边。记下的 $\{V,W,Y\}$、$\{V,Y\}$、$\{Y\}$ 都装在 $\{U,V,W,Y\}$ 里。`,
            ],
          },
          { t: 'h4', text: '第 2 步：只留极大团' },
          T`7 个团里，后 3 个都是 $\{U,V,W,Y\}$ 的子集，不带新信息，划掉（L22 p17）。前 4 个谁也不包含谁，全部留下：$\{T,U,W\}$，$\{U,X,Y\}$，$\{V,W,Y,Z\}$，$\{U,V,W,Y\}$。`,
          Object.assign({ t: 'graph', w: 250 }, q5('T-U T-W U-V U-X W-V W-Z V-Y V-Z X-Y Y-Z U-W:fill U-Y:fill W-Y:fill', {}, T`核对：把 3 条 fill-in 边（紫色虚线）画回原图，4 个极大团 $\{T,U,W\}$、$\{U,X,Y\}$、$\{V,W,Y,Z\}$、$\{U,V,W,Y\}$ 在这张图里都是两两相连的。`)),
          {
            t: 'exam', md: T`Eliminate the nodes in the order $T,X,Z,U,W,V,Y$, each time connecting the current neighbours of the eliminated node (fill-in edges) and recording the clique "node + neighbours":

- $T$: neighbours $U,W$, fill-in $U$–$W$, clique $\{T,U,W\}$;
- $X$: neighbours $U,Y$, fill-in $U$–$Y$, clique $\{U,X,Y\}$;
- $Z$: neighbours $V,W,Y$, fill-in $W$–$Y$, clique $\{V,W,Y,Z\}$;
- $U$: neighbours $V,W,Y$, no fill-in, clique $\{U,V,W,Y\}$;
- $W$, $V$, $Y$: cliques $\{V,W,Y\}$, $\{V,Y\}$, $\{Y\}$, which are subsets of $\{U,V,W,Y\}$ and are dropped.

The cliques in the junction tree are the maximal cliques $\{T,U,W\}$, $\{U,X,Y\}$, $\{V,W,Y,Z\}$, $\{U,V,W,Y\}$.`,
          },
          {
            t: 'warn', md: T`- **删 $U$ 时只看原图的邻居**（$T,V,X$ 去掉已删的，只剩 $V$），会把团写成 $\{U,V\}$。邻居要按当前的图算，前面补的 fill-in 边也算。
- 不要把 $\{V,W,Y\}$、$\{V,Y\}$、$\{Y\}$ 写进最终答案：被别的团包含的团要划掉。
- 团要把被删的点自己写进去：删 $Z$ 记的是 $\{V,W,Y,Z\}$，不是 $\{V,W,Y\}$。`,
          },
        ],
      },

      { t: 'h2', text: '5. 随机练习', id: 'practice' },
      { t: 'practice', gen: 'elim', title: '消元随机题' },
      {
        t: 'quiz', items: [
          {
            q: '4-cycle $A$—$B$—$C$—$D$—$A$，消元顺序 $A,B,C,D$。第一步加哪条 fill-in 边？',
            options: ['$B$—$D$', '$A$—$C$', '不加边', '$B$—$C$'], answer: 0,
            explain: '删 $A$ 时它的邻居是 $B$ 和 $D$，两者原本不相连，所以加 $B$—$D$。团 $\\{A,B,D\\}$。之后删 $B$：邻居 $C,D$（已相连），团 $\\{B,C,D\\}$。极大团 $\\{A,B,D\\},\\{B,C,D\\}$。',
          },
          {
            q: '为什么消元顺序会影响答案？', type: 'show',
            answerText: '不同顺序产生的 fill-in 边不同，团的大小也不同。',
            explain: '好的顺序 fill-in 少、最大团小，推断代价就低（代价随最大团大小指数增长）。所以题目会指定顺序。',
          },
          {
            type: 'num', q: T`Workshop 12 Q4（顺序 $T,X,Z,U,W,V,Y$）：消掉 $T,X,Z$ 之后轮到 $U$。这一步记下的团有几个节点？`, answer: 4,
            explain: T`$U$ 在原图里的邻居是 $T,V,X$，其中 $T,X$ 已经删掉；但删 $T$ 时补了 fill-in 边 $U$—$W$，删 $X$ 时补了 $U$—$Y$，所以 $U$ 此刻的邻居是 $V,W,Y$。团 = $U$ 自己 + 当前邻居 = $\{U,V,W,Y\}$，共 4 个节点。这 4 个点已经两两相连（$W$—$Y$ 是删 $Z$ 时补的），不用再加边。只看原图会答成 $\{U,V\}$，也就是 2，这正是这道题设的坑。`,
          },
        ],
      },
    ],
  });
})(window);
