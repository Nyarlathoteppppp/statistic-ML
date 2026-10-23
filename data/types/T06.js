/* T6 — Variable elimination order → junction tree cliques (L22 p5–p33; message passing L21). */
(function (root) {
  'use strict';
  const T = String.raw;
  /* 2026 practice Q5 的 MRF，布局照原题图。 */
  const Q5 = { nodes: { T: [150, 30], U: [60, 85], W: [240, 85], V: [150, 140], X: [60, 200], Z: [240, 200], Y: [150, 255] } };
  const q5 = (edges, cls, caption) => Object.assign({}, Q5, { edges: edges, cls: cls, caption: caption });
  /* 有向图真题（图都来自 Travis 学生笔记），布局照笔记里的图。 */
  const G22 = { nodes: { F: [60, 30], G: [30, 110], H: [140, 100], C: [250, 100], E: [340, 30], D: [340, 165], B: [250, 190], A: [310, 255] } };
  const g22 = (edges, cls, caption) => Object.assign({}, G22, { edges: edges, cls: cls, caption: caption });
  const G23 = { nodes: { L: [65, 40], B: [230, 40], G: [405, 55], C: [140, 90], F: [300, 95], K: [30, 135], A: [230, 140], H: [405, 155], J: [85, 185], D: [165, 215], E: [310, 210], I: [230, 268] } };
  /* 正七边形：7 个点两两相连时用（团）。ids 按顺时针、从顶上开始。 */
  const HEPT = [[100, 20], [163, 50], [178, 118], [135, 172], [65, 172], [22, 118], [37, 50]];
  const hept = (ids) => { const o = {}; ids.forEach((id, k) => { o[id] = HEPT[k]; }); return o; };
  const GAF = { nodes: { A: [40, 30], B: [180, 30], C: [320, 30], F: [110, 130], E: [250, 165], D: [390, 130] } };
  const gaf = (edges, cls, caption) => Object.assign({}, GAF, { edges: edges, cls: cls, caption: caption });
  /* MRF 势表题的图。 */
  const M16 = { A: [110, 30], B: [40, 130], C: [180, 130], D: [270, 70] };
  const M21 = { A: [100, 30], B: [30, 130], C: [170, 130], D: [240, 30], E: [310, 130] };

  root.SML.content.add({
    id: 'T06',
    eyebrow: '题型 T6 · 8–14 分 · 已对照 L22 课件',
    title: '消元顺序 → junction tree 的团',
    en: 'Elimination order → cliques of the junction tree',
    chips: [
      { text: 'L22 p6–p22', href: '#/L22', cls: 'src' }, { text: 'L21 消息传递', href: '#/L21', cls: 'src' }, { text: 'L20 p29（clique）', href: '#/L20', cls: 'src' },
      { text: '2026 practice Q5', cls: 'hot' }, { text: '2021 exam Q18b', cls: 'src' },
      { text: '2022 exam Q2（有向图，14 分）', href: '#/T06/directed', cls: 'hot' },
      { text: 'Workshop 12 Q4', href: '#/T06/ws12', cls: 'src' },
      { text: 'MRF 势表算 Z（2016 Q9 等）', href: '#/T06/mrf-z', cls: 'src' },
    ],
    lead: '给一个无向图（MRF）和一个消元顺序，按顺序一个个删点：删之前把它的邻居两两连起来，记下"这个点 + 它的邻居"。最后去掉被包含的集合，剩下的就是 junction tree 的团。给的是有向图（BN）时，先 moralize 再消元（第 3 节后半）。第 5 节是同一思路的小计算：由团的势表算 $Z$ 和边缘概率。',
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
          '**列出所有边**（防止读图出错）。给的是有向图（BN）就先 moralize：有共同孩子的父节点两两连边，再去掉箭头（L22 p4）。',
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
          { t: 'table', head: ['顺序', '发生了什么', '最大团'], rows: [['$B,C,D,E,F,G,H,L,A$（先删外围）', '每次删的点至多两个邻居，有两个时它们已经相连，**不加任何边**；极大团是 4 个三角形', '3 个点'], ['$A,B,\\dots,L$（先删中心）', '删 $A$ 时它的 8 个邻居 $B,\\dots,L$ 要两两相连：两两共 $8\\times7/2=28$ 条，已有 $BC,DE,FG,HL$ 4 条，**加 $28-4=24$ 条**；第一个团就是 $A$ + 8 个邻居 = 全部 9 个点', '9 个点']] },
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
          { t: 'graphs', r: 17, caption: '按 $T,X,Z,U$ 的顺序消元（黄 = 正在消，浅色 = 已消掉，紫色虚线 = 消元时加的 fill-in 边）。后面的 $W,V,Y$ 记录的团都被前面更大的团包含，最后会划掉。', items: [
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
          { t: 'graph', r: 26, nodes: { c4: [200, 120], c1: [60, 40], c2: [60, 200], c3: [360, 120] }, labels: { c1: 'c₁', c2: 'c₂', c3: 'c₃', c4: 'c₄' }, notes: { c1: '{T,U,W}', c2: '{U,X,Y}', c3: '{V,W,Y,Z}', c4: '{U,V,W,Y}' }, edges: 'c4-c1:hl={U,W} c4-c2:hl={U,Y} c4-c3:hl={V,W,Y}', w: 440, caption: '一个合法的 junction tree：其余 3 个极大团都和 $\\{U,V,W,Y\\}$ 相连，边上写的是 separator（两团的交集）。边权 = 共享变量个数：$\\{U,W\\}$ 2、$\\{U,Y\\}$ 2、$\\{V,W,Y\\}$ 3，合计 7；其它团对只共享 1 个变量，换掉任何一条都会变小，所以这是最大权重生成树（4 个团、3 条边、无环）。题目只问团时，树可以不画。' },
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

      { t: 'h3', text: '有向图（BN）版：先 moralize，再按顺序消元', id: 'directed' },
      T`2022 年起的卷子还给**有向图**，问"重构图（reconstructed graph）"、最大团和复杂度。课件 L22 p4 的做法：BN 先变成无向图，也就是 moralize（[c55](#/c55)：有共同孩子的父节点两两连边，再去掉箭头），得到道德图（moral graph）；然后在这张图上照第 2 节的表格消元。`,
      {
        t: 'steps', items: [
          T`抄下所有有向边，找出有 2 个及以上父节点的点。`,
          T`moralize：这些点的父节点两两连边（moral 边），再把所有箭头去掉。`,
          T`照第 2 节消元：被删节点 | 当前邻居 | fill-in | 团。邻居按当前的图算，moral 边和前面的 fill-in 都算。`,
          T`重构图 = 原图所有边（去掉方向）+ moral 边 + 全部 fill-in 边；被消掉的点也留在图里。全部节点都消完时，最大团就是消元表里最大的那个团；题目只消掉部分节点时，还要检查剩下的图里有没有更大的团。`,
          T`复杂度：每一步要处理"团里所有变量的取值组合"，二元变量时最多 $2^k$ 个（$k$ = 最大团大小），所以是 $O(n\,2^{k})$：随 $k$ 指数增长（[c59](#/c59)）。`,
        ],
      },
      { t: 'note', md: T`**为什么必须先 moralize？** 删一个点 = 把含它的因子相乘再对它求和。BN 的因子 $P(\text{子}\mid\text{父}_1,\text{父}_2)$ 同时含两个父节点：删其中一个父节点时，另一个父节点也在这个求和里，所以它也算"邻居"。不先连 moral 边，就会漏掉这个邻居，团写小了。` },
      {
        t: 'past', src: '2022 S1 exam Q2（图来自学生笔记）', marks: '8 + 3 + 3', topic: 'L22 p4 moralize · p6–p17 消元 · p26 复杂度',
        q: T`Consider the following directed probabilistic graphical model (PGM) with Boolean-valued random variables. (a) What is the reconstructed graph (aka moral graph) of this PGM, for alphabetical elimination ordering leaving just $H$, i.e. $A,B,C,D,E,F,G$? [8 marks] (b) What is the maximum clique size in the reconstructed graph? [3 marks] (c) Write the runtime complexity of the elimination algorithm, eliminating the nodes in the given order, in terms of the maximum clique size. [3 marks]`,
        qzh: T`考虑下面这个布尔变量的有向概率图模型（directed PGM）。(a) 按字母顺序消元、只留下 $H$（即依次消去 $A,B,C,D,E,F,G$）时，这个 PGM 的重构图（reconstructed graph，也叫道德图 moral graph）是什么？[8 分] (b) 重构图里最大团的大小是多少？[3 分] (c) 按给定顺序消元时，用最大团大小写出消元算法的运行时间复杂度。[3 分]`,
        azh: T`(a) 先 moralize：$C$ 的父节点是 $H,E,D$，加 $H$–$E$、$H$–$D$、$D$–$E$，再去掉方向。按 $A,B,C,D,E,F,G$ 消元：$A$（邻居 $B$）、$B$（邻居 $C$）、$C$（邻居 $D,E,H$，已两两相连）、$D$（$E,H$）、$E$（$H$）、$F$（$H$）、$G$（$H$）——不需要任何填补边（fill-in edge）。所以重构图就是道德图，无向边为 $A$–$B$、$B$–$C$、$C$–$D$、$C$–$E$、$C$–$H$、$D$–$E$、$D$–$H$、$E$–$H$、$F$–$H$、$G$–$H$。
(b) 4：最大团是 $\{C,D,E,H\}$（消去 $C$ 时产生）。
(c) $O(n\,2^{k})$，$k=4$ 是最大团大小：每一步消元最多对一张 $2^k=16$ 格的表求和，所以代价随最大团大小指数增长（随变量个数 $n$ 线性增长）。`,
        blocks: [
          Object.assign({ t: 'graph', w: 320 }, g22('H>F H>G H>C E>C D>C C>B B>A', {}, '题图（8 个布尔变量）：$H\\to F$，$H\\to G$，$H\\to C$，$E\\to C$，$D\\to C$，$C\\to B$，$B\\to A$。')),
          { t: 'note', md: '转载网页上这张图失效了，图来自学生笔记，未与原卷核对。' },
        ],
        sol: [
          { t: 'h4', text: '第 0 步：抄边，找"多父节点"的点' },
          T`有向边 7 条：$H\to F$，$H\to G$，$H\to C$，$E\to C$，$D\to C$，$C\to B$，$B\to A$。父节点个数：$C$ 有 3 个（$H,E,D$），其余每个点最多 1 个。`,
          { t: 'h4', text: '第 1 步：moralize' },
          T`只有 $C$ 需要"结婚"：它的父节点 $H,E,D$ 两两连边，加 $H$—$E$、$H$—$D$、$D$—$E$ 三条，再去掉所有箭头。`,
          {
            t: 'graphs', r: 16, items: [
              g22('H>F H>G H>C E>C D>C C>B B>A', {}, '① 原图'),
              g22('H-F H-G H-C E-C D-C C-B B-A H-E:moral H-D:moral D-E:moral', {}, '② moralize：$C$ 的三个父节点两两连边（橙色虚线），去掉箭头'),
              g22('H-F H-G H-C:hl E-C:hl D-C:hl C-B B-A H-E:hl H-D:hl D-E:hl', { C: 'hl', D: 'hl', E: 'hl', H: 'hl' }, '③ 重构图：消元没有加任何边；蓝色是最大团 $\\{C,D,E,H\\}$'),
            ],
          },
          { t: 'h4', text: '第 2 步：按 $A,B,C,D,E,F,G$ 消元' },
          {
            t: 'table', head: ['删', '当前邻居', 'fill-in', '团'], rows: [
              ['$A$', '$B$', '无', T`$\{A,B\}$`],
              ['$B$', '$C$（$A$ 已删）', '无', T`$\{B,C\}$`],
              ['$C$', '$D,E,H$（$B$ 已删）', '无（moralize 已经把三者两两连上）', T`$\{C,D,E,H\}$`],
              ['$D$', '$E,H$', '无', T`$\{D,E,H\}$ ⊂ 上一个团`],
              ['$E$', '$H$', '无', T`$\{E,H\}$ ⊂`],
              ['$F$', '$H$', '无', T`$\{F,H\}$`],
              ['$G$', '$H$', '无', T`$\{G,H\}$`],
            ],
          },
          T`整个过程一条 fill-in 都没加，所以 (a) 的重构图就是 moralize 之后的图（题目说的 "aka moral graph"）：10 条无向边 $A$—$B$，$B$—$C$，$C$—$D$，$C$—$E$，$C$—$H$，$D$—$E$，$D$—$H$，$E$—$H$，$F$—$H$，$G$—$H$。`,
          { t: 'h4', text: '(b) 最大团' },
          T`消元表里最大的团是 $\{C,D,E,H\}$，4 个点。核对：再大就要有 5 个两两相连的点；$H$ 的邻居里 $F$、$G$ 只连着 $H$，加不进来，所以最大团大小是 **4**。`,
          { t: 'h4', text: '(c) 复杂度' },
          T`每消一个变量，要把含它的因子相乘再求和，涉及的变量正好是它的团。$k$ 个布尔变量的团有 $2^k$ 种取值组合，所以每一步最多算 $2^k$ 个数，$n$ 步一共 $O(n\,2^{k})$。这里 $k=4$：每一步最多 $2^4=16$ 个数。要点是"对最大团大小**指数**"（L22 p26）。`,
          {
            t: 'exam', md: T`(a) Moralise first: $C$ has parents $H,E,D$, so add $H$–$E$, $H$–$D$, $D$–$E$ and drop directions. Eliminating in order $A,B,C,D,E,F,G$: $A$ (neighbour $B$), $B$ (neighbour $C$), $C$ (neighbours $D,E,H$, already pairwise connected), $D$ ($E,H$), $E$ ($H$), $F$ ($H$), $G$ ($H$) — no fill-in edges are needed. So the reconstructed graph is the moral graph, with undirected edges $A$–$B$, $B$–$C$, $C$–$D$, $C$–$E$, $C$–$H$, $D$–$E$, $D$–$H$, $E$–$H$, $F$–$H$, $G$–$H$.
(b) 4: the largest clique is $\{C,D,E,H\}$ (formed when eliminating $C$).
(c) $O(n\,2^{k})$ with $k=4$ the maximum clique size: each elimination step sums over a table of at most $2^k=16$ entries, so the cost is exponential in the maximum clique size (and linear in the number of variables $n$).`,
          },
          { t: 'warn', md: T`- 不要只画消元后剩下的 $H$：重构图包含**所有**节点和边（原图的边去掉方向 + moral 边 + fill-in）。
- (c) 写 $O(2^{k})$ 或 $O(n\,2^{k})$ 都要点明 $k$ 是最大团大小、代价对它是指数的；只写"很慢"拿不到分。` },
        ],
      },
      {
        t: 'past', src: '2023 S1 exam PGM 题 (b)(c)（据学生笔记）', marks: '(b) 未注明 + (c) 5', topic: 'L22 p4 moralize · p6–p17 消元',
        q: T`Consider the following directed probabilistic graphical model (PGM) with Boolean-valued random variables. (b) Consider now eliminating two nodes from the original directed PGM, first $A$ then $E$. Compared to the original directed PGM, how many additional edges does the reconstructed graph (aka moral graph) have? Explain how you arrived at your answer. (c) Consider the reconstructed graph from the previous question part. List all of its largest maximal cliques. (Hint: a maximal clique is a clique that cannot be made larger by adding more nodes while still being a clique. Largest means there are no larger cliques in the graph.) [5 marks]`,
        qzh: T`考虑下面这个布尔变量的有向概率图模型。(b) 现在从原始有向 PGM 中消去两个节点：先消 $A$，再消 $E$。和原始有向 PGM 相比，重构图（reconstructed graph，也叫道德图 moral graph）多了几条边？说明你是怎么得到的。(c) 对上一问的重构图，列出它所有最大的极大团（maximal clique）。（提示：极大团是不能再加入节点、仍保持为团的团；"最大"指图中没有更大的团。）[5 分]`,
        azh: T`(b) 先 moralize：$E$ 的父节点是 $A$ 和 $H$，加 $A$–$H$（1 条）。消去 $A$：它的邻居是 $B,C,D,E,F,H$；15 对里只有 $E$–$H$ 已存在，所以加 14 条填补边（团 $\{A,B,C,D,E,F,H\}$）。消去 $E$：它此刻的邻居是 $B,C,D,F,H,I$；$B,C,D,F,H$ 已两两相连，所以加 5 条边 $I$–$B$、$I$–$C$、$I$–$D$、$I$–$F$、$I$–$H$（团 $\{B,C,D,E,F,H,I\}$）。一共多 $1+14+5=20$ 条边（10 条 → 30 条）。
(c) 最大的极大团有 7 个节点：$\{A,B,C,D,E,F,H\}$ 和 $\{B,C,D,E,F,H,I\}$。它们不能合并，因为 $A$ 和 $I$ 不相连；其余极大团（$\{G,H\}$、$\{D,J\}$、$\{J,L\}$、$\{K\}$）更小。`,
        blocks: [
          Object.assign({ t: 'graph', w: 380 }, G23, { edges: 'F>A A>B A>C A>D A>E G>H H>E D>J J>L E>I', caption: '题图：$F\\to A$；$A\\to B,C,D,E$；$G\\to H\\to E$；$E\\to I$；$D\\to J\\to L$；$K$ 是孤立点。' }),
          { t: 'note', md: '题目和图来自学生笔记（Travis），未与原卷核对。(a) 问 Markov blanket，课件没讲、题干也没给定义，略。' },
        ],
        sol: [
          { t: 'h4', text: '第 0–1 步：抄边，moralize' },
          T`有向边 10 条：$F\to A$，$A\to B$，$A\to C$，$A\to D$，$A\to E$，$G\to H$，$H\to E$，$D\to J$，$J\to L$，$E\to I$。只有 $E$ 有两个父节点（$A$ 和 $H$），所以 moralize 只加 1 条：$A$—$H$。`,
          Object.assign({ t: 'graph', w: 380, r: 17 }, G23, { edges: 'F-A A-B A-C A-D A-E G-H H-E D-J J-L E-I A-H:moral', cls: { A: 'cur', B: 'hl', C: 'hl', D: 'hl', E: 'hl', F: 'hl', H: 'hl' }, caption: 'moralize 后（橙色虚线 = $A$—$H$）。黄 = 先要删的 $A$；蓝 = 它此刻的 6 个邻居，$H$ 就是 moralize 带来的。' }),
          { t: 'h4', text: '第 2 步：先删 $A$，再删 $E$' },
          {
            t: 'table', head: ['删', '当前邻居', 'fill-in', '团'], rows: [
              ['$A$', '$B,C,D,E,F,H$（6 个）', T`6 个点两两共 $6\times5/2=15$ 对，已有 $E$—$H$ 1 对，**加 14 条**`, T`$\{A,B,C,D,E,F,H\}$`],
              ['$E$', '$B,C,D,F,H$（删 $A$ 时连上的）+ $I$', T`前 5 个已两两相连；$I$ 和它们都没连，**加 5 条** $I$—$B$、$I$—$C$、$I$—$D$、$I$—$F$、$I$—$H$`, T`$\{B,C,D,E,F,H,I\}$`],
            ],
          },
          T`多出来的边：moralize 1 条 + 删 $A$ 14 条 + 删 $E$ 5 条 = **20 条**。原图 10 条边，重构图 30 条。`,
          { t: 'h4', text: '(c) 最大的极大团' },
          {
            t: 'graphs', r: 15, items: [
              { nodes: hept(['A', 'B', 'C', 'D', 'E', 'H', 'F']), edges: 'A-B A-C A-D A-E A-F E-H A-H:moral B-C:fill B-D:fill B-E:fill B-F:fill B-H:fill C-D:fill C-E:fill C-F:fill C-H:fill D-E:fill D-F:fill D-H:fill E-F:fill F-H:fill', cls: { A: 'cur' }, caption: T`删 $A$ 记下的团 $\{A,B,C,D,E,F,H\}$：7 个点两两相连，共 $7\times6/2=21$ 条边 = 原有 6 条（实线）+ moral 1 条（橙）+ fill-in 14 条（紫）` },
              { nodes: hept(['I', 'B', 'C', 'D', 'E', 'H', 'F']), edges: 'E-I E-H B-C B-D B-E B-F B-H C-D C-E C-F C-H D-E D-F D-H E-F F-H I-B:fill I-C:fill I-D:fill I-F:fill I-H:fill', cls: { E: 'cur' }, caption: T`删 $E$ 记下的团 $\{B,C,D,E,F,H,I\}$：实线是删 $E$ 之前就有的边，紫色虚线是这一步新加的 5 条` },
            ],
          },
          T`两个团都是 7 个点，而且都是极大团：要把它们合成 8 个点，需要 $A$—$I$ 这条边，但删 $A$ 时 $I$ 还不是 $A$ 的邻居，删 $E$ 时 $A$ 已经删掉了，这条边始终没有。剩下的极大团 $\{G,H\}$、$\{D,J\}$、$\{J,L\}$、$\{K\}$ 都更小。所以答案是这两个 7 点团。`,
          {
            t: 'exam', md: T`(b) Moralise: $E$ has parents $A$ and $H$, so add $A$–$H$ (1 edge). Eliminate $A$: its neighbours are $B,C,D,E,F,H$; of the 15 pairs only $E$–$H$ exists, so add 14 fill-in edges (clique $\{A,B,C,D,E,F,H\}$). Eliminate $E$: its neighbours are now $B,C,D,F,H,I$; $B,C,D,F,H$ are already pairwise connected, so add the 5 edges $I$–$B$, $I$–$C$, $I$–$D$, $I$–$F$, $I$–$H$ (clique $\{B,C,D,E,F,H,I\}$). In total $1+14+5=20$ additional edges (10 → 30 edges).
(c) The largest maximal cliques have 7 nodes: $\{A,B,C,D,E,F,H\}$ and $\{B,C,D,E,F,H,I\}$. They cannot be merged because $A$ and $I$ are not connected; the remaining maximal cliques ($\{G,H\}$, $\{D,J\}$, $\{J,L\}$, $\{K\}$) are smaller.`,
          },
          { t: 'warn', md: T`- 忘了 moralize：删 $A$ 时就看不到邻居 $H$，会答成 19 条边、团 $\{A,B,C,D,E,F\}$。删 $A$ 的求和里有因子 $P(E\mid A,H)$，$H$ 确实在里面。
- 漏掉 $D$：$A\to D$ 也是 $A$ 的边，$A$ 有 4 个孩子 $B,C,D,E$ 和 1 个父节点 $F$。` },
        ],
      },
      {
        t: 'past', src: '“2022 S1” PGM 题 (a)(b)（据学生笔记；年份标签存疑）', topic: 'L22 p4 moralize · p6–p17 消元 · p26 复杂度',
        q: T`Given the following directed probabilistic graphical model over binary random variables: (a) For the alphabetical elimination order $A,B,C,\dots,F$ show the resulting graph after running the elimination algorithm. (b) What is the time complexity of the elimination algorithm for the graph with alphabetical elimination order, as given above? Explain your answer.`,
        qzh: T`给定下面这个二元随机变量的有向概率图模型：(a) 按字母顺序 $A,B,C,\dots,F$ 消元，画出运行消元算法之后得到的图。(b) 按上述字母顺序消元时，消元算法的时间复杂度是多少？解释你的答案。`,
        azh: T`(a) 先 moralize：$B$ 的父节点 $A,E$ → 加 $A$–$E$；$C$ 的父节点 $B,D$ → 加 $B$–$D$。消去 $A$（邻居 $B,E,F$）：加 $B$–$F$，团 $\{A,B,E,F\}$。消去 $B$（邻居 $C,D,E,F$）：加 $C$–$E$、$C$–$F$、$D$–$F$，团 $\{B,C,D,E,F\}$。消去 $C$（$D,E,F$）、$D$（$E,F$）、$E$（$F$）、$F$：不再加边。得到的图：除 $A$–$C$ 和 $A$–$D$ 外所有点对都相连（13 条边）。
(b) 产生的最大团是 $\{B,C,D,E,F\}$，大小 $k=5$，所以消元代价为 $O(n\,2^{k})=O(6\cdot2^5)$：随最大团大小指数增长，最大的中间表有 $2^5=32$ 格。`,
        blocks: [
          Object.assign({ t: 'graph', w: 340 }, gaf('A>B B>C F>A E>F E>B D>E D>C', {}, '题图：$A\\to B\\to C$，$F\\to A$，$E\\to F$，$E\\to B$，$D\\to E$，$D\\to C$。')),
          { t: 'note', md: '题目和图来自学生笔记（Travis），笔记标的是 2022 S1，但和 2022 S1 卷的 Q2 不是同一张图，年份存疑，未与原卷核对。(c) 问 Markov blanket，课件没讲，略。' },
        ],
        sol: [
          { t: 'h4', text: '第 0–1 步：抄边，moralize' },
          T`有向边 7 条：$A\to B$，$B\to C$，$F\to A$，$E\to F$，$E\to B$，$D\to E$，$D\to C$。父节点：$B$ 有 $A,E$；$C$ 有 $B,D$；其余各 1 个或 0 个。moralize 加 2 条：$A$—$E$、$B$—$D$。`,
          {
            t: 'graphs', r: 16, items: [
              gaf('A-B B-C A-F E-F B-E D-E C-D A-E:moral B-D:moral', {}, '① moralize（橙色虚线），去掉箭头'),
              gaf('A-B B-C A-F E-F B-E D-E C-D A-E:moral B-D:moral B-F:fill', { A: 'cur' }, '② 删 $A$：邻居 $B,E,F$；$B$—$E$、$E$—$F$ 已有，加 $B$—$F$'),
              gaf('A-B:gone A-F:gone A-E:gone B-C B-E B-D:moral B-F:fill E-F D-E C-D C-E:fill C-F:fill D-F:fill', { A: 'done', B: 'cur' }, '③ 删 $B$：邻居 $C,D,E,F$（$F$ 来自上一步），缺 $C$—$E$、$C$—$F$、$D$—$F$，加 3 条'),
            ],
          },
          {
            t: 'table', head: ['删', '当前邻居', 'fill-in', '团'], rows: [
              ['$A$', '$B,E,F$（$E$ 来自 moralize）', '$B$—$F$', T`$\{A,B,E,F\}$`],
              ['$B$', '$C,D,E,F$（$D$ 来自 moralize，$F$ 来自上一步）', '$C$—$E$，$C$—$F$，$D$—$F$', T`$\{B,C,D,E,F\}$`],
              ['$C$', '$D,E,F$', '无', T`$\{C,D,E,F\}$ ⊂ 上一个团`],
              ['$D$', '$E,F$', '无', T`$\{D,E,F\}$ ⊂`],
              ['$E$', '$F$', '无', T`$\{E,F\}$ ⊂`],
              ['$F$', '—', '无', T`$\{F\}$ ⊂`],
            ],
          },
          Object.assign({ t: 'graph', w: 340 }, gaf('A-B B-C A-F E-F B-E D-E C-D A-E:moral B-D:moral B-F:fill C-E:fill C-F:fill D-F:fill', { B: 'hl', C: 'hl', D: 'hl', E: 'hl', F: 'hl' }, '(a) 的答案：原有 7 条（实线）+ moral 2 条（橙）+ fill-in 4 条（紫）= 13 条。6 个点两两共 15 对，只缺 $A$—$C$、$A$—$D$。蓝 = 最大团 $\\{B,C,D,E,F\\}$。')),
          T`(b) 消元时记下的最大团是删 $B$ 时的 $\{B,C,D,E,F\}$，$k=5$。每一步最多处理 $2^5=32$ 种取值组合，6 个变量一共 $O(n\,2^{k})=O(6\cdot2^5)$：对最大团大小是指数的。`,
          {
            t: 'exam', md: T`(a) Moralise: $B$'s parents $A,E$ give $A$–$E$; $C$'s parents $B,D$ give $B$–$D$. Eliminate $A$ (neighbours $B,E,F$): add $B$–$F$, clique $\{A,B,E,F\}$. Eliminate $B$ (neighbours $C,D,E,F$): add $C$–$E$, $C$–$F$, $D$–$F$, clique $\{B,C,D,E,F\}$. Eliminating $C$ ($D,E,F$), $D$ ($E,F$), $E$ ($F$) and $F$ adds nothing. Resulting graph: every pair of nodes is connected except $A$–$C$ and $A$–$D$ (13 edges).
(b) The largest clique created is $\{B,C,D,E,F\}$, of size $k=5$, so elimination costs $O(n\,2^{k})=O(6\cdot2^5)$: exponential in the largest clique size, with the biggest intermediate table having $2^5=32$ entries.`,
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

      { t: 'h2', text: '5. MRF 势表：算 Z 和边缘概率', id: 'mrf-z' },
      T`另一类小计算题，2016、2019 和一份标 2021 的卷子都出过（每问 1–2 分）：给一个无向 PGM（MRF，[c55](#/c55)）和每个团的势表（potential table），问配分函数（partition function，也叫归一化常数 normalising constant）$Z$ 和某几个变量的概率。势表里的数是打分，不是概率，可以大于 1，也可以是 0。`,
      T`算 $Z$ 用的就是消元的想法（[c56](#/c56)；本页第 2 节"删一个点 = 对它求和"）：只出现在一张表里的变量，先在那张表里就地加掉；两张表只在共享变量上"接头"。下面以两张表 $f(A,B,C)$、$g(C,D)$ 只共享 $C$ 为例。`,
      {
        t: 'steps', items: [
          T`**写联合分布**：$\Pr(A=a,B=b,C=c,D=d)=\frac1Z\,f(a,b,c)\,g(c,d)$。每个团在自己的表里查一个分数，相乘，再除以 $Z$（L20 p37）。`,
          T`**按共享变量分组求和**：对共享变量 $C$ 的每个取值，分别算 $\bar f(c)=\sum_{a,b}f(a,b,c)$（$f$ 表里 $C=c$ 的那几行相加）和 $\bar g(c)=\sum_{d}g(c,d)$。$\bar g(c)$ 就是把 $D$ 消掉得到的消息。`,
          T`**算 $Z$**：$Z=\sum_c \bar f(c)\,\bar g(c)$。二元的 $C$ 只要两次乘法、一次加法，不用列出全部 $2^4=16$ 项（列 16 项结果一样，只是慢、容易漏）。`,
          T`**算边缘概率**：题目固定的变量代入取值，其余变量照样求和（能分组就分组），得到分子；再除以 $Z$。`,
          T`**检查**：结果在 0 和 1 之间；势为 0 的组合概率就是 0；同一个变量各取值的概率加起来等于 1。`,
        ],
      },
      { t: 'warn', md: T`- 势表不是概率表：不能拿一张表单独归一化（例如只看 $g$ 表，把 $g(T,T)+g(F,T)$ 除以 $g$ 表的总和当成 $\Pr(D=T)$），一定要乘上另一张表在同一个 $C$ 上的分组和。
- 求边缘时别忘了对没被问到的变量求和：$\Pr(A=F,B=T,C=F)$ 还要对 $D$ 求和。` },
      {
        t: 'past', src: '2016 S2 exam Q9（9.1–9.3）', marks: '1 + 1 + 1', topic: 'L20 p37 Hammersley–Clifford · L21 消元',
        q: T`Consider the following undirected PGM, where the truth tables associated with cliques are the model's potentials $f(A,B,C)$ and $g(C,D)$ respectively, and as such are not normalised conditional probability tables (as you get for directed PGMs). 1. For arbitrary truth values $a,b,c,d$, write an expression for $\Pr(A=a,B=b,C=c,D=d)$ in terms of $f(a,b,c)$, $g(c,d)$, and normalising constant $Z=\sum_{A,B,C,D}f(A,B,C)\,g(C,D)$ only (just using these three expressions, without using the truth tables). [1 mark] 2. Now using the tables, calculate the normalising constant $Z=\sum_{A,B,C,D}f(A,B,C)\,g(C,D)$. [1 mark] 3. Calculate $\Pr(A=F,C=F)$. You may leave your answer as a fraction. (If you were unable to compute the normalising constant in the previous part, leave it as $Z$ in your workings here.) [1 mark]`,
        qzh: T`考虑下面的无向 PGM，与各团对应的真值表是模型的势函数（potential）$f(A,B,C)$ 和 $g(C,D)$，因此它们不是归一化的条件概率表（有向 PGM 里才是）。1. 对任意真值 $a,b,c,d$，只用 $f(a,b,c)$、$g(c,d)$ 和归一化常数 $Z=\sum_{A,B,C,D}f(A,B,C)\,g(C,D)$（不用真值表）写出 $\Pr(A=a,B=b,C=c,D=d)$。[1 分] 2. 用表算出归一化常数 $Z$。[1 分] 3. 计算 $\Pr(A=F,C=F)$，可以写成分数（上一问没算出 $Z$ 就保留 $Z$）。[1 分]`,
        azh: T`1. $\Pr(A=a,B=b,C=c,D=d)=\frac1Z\,f(a,b,c)\,g(c,d)$。
2. 按共享变量 $C$ 分组：$Z=\sum_c\big(\sum_{a,b}f(a,b,c)\big)\big(\sum_d g(c,d)\big)=(5+3+3+1)(0+4)+(3+1+1+0)(4+0)=12\cdot4+5\cdot4=68$。
3. $\Pr(A=F,C=F)=\frac1Z\sum_{b,d}f(F,b,F)\,g(F,d)=\frac{(1+0)(4+0)}{68}=\frac{4}{68}=\frac1{17}$。`,
        blocks: [
          { t: 'graph', nodes: M16, edges: 'A-B A-C B-C C-D', w: 240, caption: '团：$\\{A,B,C\\}$（势 $f$）和 $\\{C,D\\}$（势 $g$），只共享 $C$。' },
          { t: 'table', cls: 'compact', head: ['$A$', '$B$', '$C$', '$f(A,B,C)$'], rows: [['T', 'T', 'T', '5'], ['T', 'T', 'F', '3'], ['T', 'F', 'T', '3'], ['T', 'F', 'F', '1'], ['F', 'T', 'T', '3'], ['F', 'T', 'F', '1'], ['F', 'F', 'T', '1'], ['F', 'F', 'F', '0']] },
          { t: 'table', cls: 'compact', head: ['$C$', '$D$', '$g(C,D)$'], rows: [['T', 'T', '0'], ['T', 'F', '4'], ['F', 'T', '4'], ['F', 'F', '0']] },
        ],
        sol: [
          { t: 'h4', text: '9.1 写联合分布' },
          T`MRF 的分布 = 各团势函数之积 ÷ $Z$（L20 p37）。这里两个团 $\{A,B,C\}$、$\{C,D\}$：$\Pr(A=a,B=b,C=c,D=d)=\frac1Z\,f(a,b,c)\,g(c,d)$。`,
          { t: 'h4', text: '9.2 算 Z：按 C 分组' },
          T`$f$ 和 $g$ 只共享 $C$。把 $f$ 表按 $C$ 分成两组各自加起来，$g$ 表也按 $C$ 把 $D$ 加掉：`,
          {
            t: 'table', head: ['$C$', T`$\bar f(C)=\sum_{A,B}f(A,B,C)$`, T`$\bar g(C)=\sum_D g(C,D)$`, T`$\bar f(C)\,\bar g(C)$`], rows: [
              ['T', '$5+3+3+1=12$', '$0+4=4$', '$48$'],
              ['F', '$3+1+1+0=5$', '$4+0=4$', '$20$'],
              ['合计', '', '', '$Z=48+20=68$'],
            ],
          },
          T`为什么可以这样分组：$Z=\sum_{c}\sum_{a,b}\sum_{d}f(a,b,c)\,g(c,d)$，$C$ 固定后 $f$ 不含 $D$、$g$ 不含 $A,B$，两个求和可以拆开相乘：$\sum_{a,b}f(a,b,c)\cdot\sum_d g(c,d)$。$\sum_d g(c,d)$ 就是消掉 $D$ 后发给 $C$ 的消息。`,
          { t: 'h4', text: '9.3 算 Pr(A=F, C=F)' },
          T`固定 $A=F$、$C=F$，对没被问到的 $B$、$D$ 求和：$\Pr(A=F,C=F)=\frac1Z\sum_{b,d}f(F,b,F)\,g(F,d)=\frac1Z\Big(\sum_b f(F,b,F)\Big)\Big(\sum_d g(F,d)\Big)$。查表：$f(F,T,F)=1$，$f(F,F,F)=0$，和为 1；$g(F,T)=4$，$g(F,F)=0$，和为 4。所以 $\Pr(A=F,C=F)=\frac{1\times4}{68}=\frac{4}{68}=\frac1{17}$。`,
          {
            t: 'exam', md: T`1. $\Pr(A=a,B=b,C=c,D=d)=\frac1Z\,f(a,b,c)\,g(c,d)$.
2. Group by the shared variable $C$: $Z=\sum_c\big(\sum_{a,b}f(a,b,c)\big)\big(\sum_d g(c,d)\big)=(5+3+3+1)(0+4)+(3+1+1+0)(4+0)=12\cdot4+5\cdot4=68$.
3. $\Pr(A=F,C=F)=\frac1Z\sum_{b,d}f(F,b,F)\,g(F,d)=\frac{(1+0)(4+0)}{68}=\frac{4}{68}=\frac1{17}$.`,
          },
        ],
      },
      {
        t: 'past', src: '2019 exam Q8（据学生笔记）', marks: '2 + 2', topic: 'L20 p37 · 同上的分组求和',
        q: T`Consider the following undirected probabilistic graphical model (PGM) on four Boolean-valued variables, where the clique potentials $f(A,B,C)$ and $g(C,D)$ are unnormalised. 1. Using these tables, calculate the normalising constant $Z=\sum_{A\in\{T,F\}}\sum_{B\in\{T,F\}}\sum_{C\in\{T,F\}}\sum_{D\in\{T,F\}}f(A,B,C)\,g(C,D)$. [2 marks] 2. Calculate $\Pr(A=F,B=T,C=F)$. You may leave your answer as a fraction. (If you were unable to answer the previous part, leave the constant as $Z$ in your workings here.) [2 marks]`,
        qzh: T`考虑下面这个四个布尔变量上的无向概率图模型，团势函数（clique potential）$f(A,B,C)$ 和 $g(C,D)$ 未归一化。1. 用表计算归一化常数 $Z$。[2 分] 2. 计算 $\Pr(A=F,B=T,C=F)$，可以写成分数（上一问没算出就保留 $Z$）。[2 分]`,
        azh: T`1. 按共享变量 $C$ 分组：$Z=\sum_c\big(\sum_{a,b}f(a,b,c)\big)\big(\sum_d g(c,d)\big)=(3+1+2+4)(3+0)+(1+6+4+0)(0+3)=30+33=63$。
2. $\Pr(A=F,B=T,C=F)=\frac1Z f(F,T,F)\sum_d g(F,d)=\frac{4\times(0+3)}{63}=\frac{12}{63}=\frac{4}{21}$。`,
        blocks: [
          { t: 'graph', nodes: M16, edges: 'A-B A-C B-C C-D', w: 240, caption: '和 2016 Q9 同一张图，只是势表的数不同。' },
          { t: 'table', cls: 'compact', head: ['$A$', '$B$', '$C$', '$f(A,B,C)$'], rows: [['T', 'T', 'T', '3'], ['T', 'T', 'F', '1'], ['T', 'F', 'T', '1'], ['T', 'F', 'F', '6'], ['F', 'T', 'T', '2'], ['F', 'T', 'F', '4'], ['F', 'F', 'T', '4'], ['F', 'F', 'F', '0']] },
          { t: 'table', cls: 'compact', head: ['$C$', '$D$', '$g(C,D)$'], rows: [['T', 'T', '3'], ['T', 'F', '0'], ['F', 'T', '0'], ['F', 'F', '3']] },
          { t: 'note', md: '题目和表来自学生笔记（Travis，图片名标 2019 Q8，学期不明），未与原卷核对。' },
        ],
        sol: [
          { t: 'h4', text: '1. 算 Z' },
          {
            t: 'table', head: ['$C$', T`$\sum_{A,B}f(A,B,C)$`, T`$\sum_D g(C,D)$`, '乘积'], rows: [
              ['T', '$3+1+2+4=10$', '$3+0=3$', '$30$'],
              ['F', '$1+6+4+0=11$', '$0+3=3$', '$33$'],
              ['合计', '', '', '$Z=63$'],
            ],
          },
          { t: 'h4', text: '2. 算 Pr(A=F, B=T, C=F)' },
          T`$A,B,C$ 都固定了，只剩 $D$ 要求和：$\Pr(A=F,B=T,C=F)=\frac1Z\,f(F,T,F)\sum_d g(F,d)=\frac{4\times(0+3)}{63}=\frac{12}{63}=\frac{4}{21}$。漏掉对 $D$ 的求和会写成 $\frac{4}{63}$。`,
          {
            t: 'exam', md: T`1. Group by the shared variable $C$: $Z=\sum_c\big(\sum_{a,b}f(a,b,c)\big)\big(\sum_d g(c,d)\big)=(3+1+2+4)(3+0)+(1+6+4+0)(0+3)=30+33=63$.
2. $\Pr(A=F,B=T,C=F)=\frac1Z f(F,T,F)\sum_d g(F,d)=\frac{4\times(0+3)}{63}=\frac{12}{63}=\frac{4}{21}$.`,
          },
        ],
      },
      {
        t: 'past', src: '“2021 S1” U-PGM 题（据学生笔记；年份标签存疑）', topic: 'L20 p37 · 两张三元势表',
        q: T`Consider the following undirected probabilistic graphical model (U-PGM) on five Boolean-valued variables, where the clique potentials $f(A,B,C)$ and $g(C,D,E)$ are shown below. (a) Using the given clique potential tables, calculate the normalising constant (aka partition function) for the joint distribution on $A,B,C,D,E$. (b) Calculate $\Pr(A=F,B=F,C=F)$. You may leave your answer as a fraction. (If you were unable to answer the previous part, leave the constant as $Z$ in your workings here.)`,
        qzh: T`考虑下面这个五个布尔变量上的无向概率图模型（U-PGM），团势函数 $f(A,B,C)$ 和 $g(C,D,E)$ 如下表。(a) 用给定的团势表计算 $A,B,C,D,E$ 联合分布的归一化常数（也叫配分函数 partition function）。(b) 计算 $\Pr(A=F,B=F,C=F)$，可以写成分数（上一问没算出就保留 $Z$）。`,
        azh: T`(a) 按共享变量 $C$ 分组：$Z=\sum_c\big(\sum_{a,b}f(a,b,c)\big)\big(\sum_{d,e}g(c,d,e)\big)$。$C=T$ 时 $g$ 的和为 0，所以这一组贡献 0；$C=F$ 时 $\sum_{a,b}f=3+3+3+3=12$，$\sum_{d,e}g=2+4+4+1=11$。所以 $Z=20\cdot0+12\cdot11=132$。
(b) $\Pr(A=F,B=F,C=F)=\frac1Z f(F,F,F)\sum_{d,e}g(F,d,e)=\frac{3\times11}{132}=\frac{33}{132}=\frac14$。`,
        blocks: [
          { t: 'graph', nodes: M21, edges: 'A-B A-C B-C C-D C-E D-E', w: 280, caption: '两个三角形 $\\{A,B,C\\}$、$\\{C,D,E\\}$，只共享 $C$。' },
          { t: 'table', cls: 'compact', head: ['$A$', '$B$', '$C$', '$f(A,B,C)$'], rows: [['T', 'T', 'T', '9'], ['T', 'T', 'F', '3'], ['T', 'F', 'T', '4'], ['T', 'F', 'F', '3'], ['F', 'T', 'T', '5'], ['F', 'T', 'F', '3'], ['F', 'F', 'T', '2'], ['F', 'F', 'F', '3']] },
          { t: 'table', cls: 'compact', head: ['$C$', '$D$', '$E$', '$g(C,D,E)$'], rows: [['T', 'T', 'T', '0'], ['T', 'T', 'F', '0'], ['T', 'F', 'T', '0'], ['T', 'F', 'F', '0'], ['F', 'T', 'T', '2'], ['F', 'T', 'F', '4'], ['F', 'F', 'T', '4'], ['F', 'F', 'F', '1']] },
          { t: 'note', md: '题目和表来自学生笔记（Travis），笔记标 2021 S1，但 2021 S1 正式卷里没有这道题，年份存疑，未与原卷核对。' },
        ],
        sol: [
          T`做法和上面完全一样，只是第二张表有三个变量：按 $C$ 分组时，$g$ 那边要把 $D,E$ 两个变量都加掉（4 行相加）。`,
          {
            t: 'table', head: ['$C$', T`$\sum_{A,B}f(A,B,C)$`, T`$\sum_{D,E}g(C,D,E)$`, '乘积'], rows: [
              ['T', '$9+4+5+2=20$', '$0+0+0+0=0$', '$0$'],
              ['F', '$3+3+3+3=12$', '$2+4+4+1=11$', '$132$'],
              ['合计', '', '', '$Z=132$'],
            ],
          },
          T`$g$ 在 $C=T$ 的四行全是 0，所以 $C=T$ 的所有组合概率都是 0，这一半直接跳过。(b) 固定 $A=F,B=F,C=F$，对 $D,E$ 求和：$\Pr(A=F,B=F,C=F)=\frac1Z f(F,F,F)\sum_{d,e}g(F,d,e)=\frac{3\times11}{132}=\frac{33}{132}=\frac14$。`,
          {
            t: 'exam', md: T`(a) Group by the shared variable $C$: $Z=\sum_c\big(\sum_{a,b}f(a,b,c)\big)\big(\sum_{d,e}g(c,d,e)\big)$. For $C=T$ the $g$ entries sum to 0, so that group contributes 0; for $C=F$, $\sum_{a,b}f=3+3+3+3=12$ and $\sum_{d,e}g=2+4+4+1=11$. Hence $Z=20\cdot0+12\cdot11=132$.
(b) $\Pr(A=F,B=F,C=F)=\frac1Z f(F,F,F)\sum_{d,e}g(F,d,e)=\frac{3\times11}{132}=\frac{33}{132}=\frac14$.`,
          },
        ],
      },
      {
        t: 'quiz', items: [
          {
            id: 'mrf1', type: 'num', q: T`2016 S2 Q9 的两张表（$Z=68$）。求 $\Pr(D=T)$（可以填分数）。`, answer: 20 / 68,
            explain: T`固定 $D=T$，对 $A,B,C$ 求和，按 $C$ 分组：$C=T$ 时 $\sum_{A,B}f=12$，$g(T,T)=0$，贡献 $12\times0=0$；$C=F$ 时 $\sum_{A,B}f=5$，$g(F,T)=4$，贡献 $5\times4=20$。分子 $=0+20=20$，所以 $\Pr(D=T)=\frac{20}{68}=\frac5{17}\approx0.294$。常见错误：只看 $g$ 表，算成 $\frac{0+4}{0+4+4+0}=\frac12$。$g$ 不是概率表，不能单独归一化，还要乘上 $f$ 在同一个 $C$ 上的分组和（12 和 5）。`,
          },
          {
            id: 'mrf2', q: T`"2021 S1" U-PGM 那题里，$g(C,D,E)$ 在 $C=T$ 的四行全是 0。$\Pr(C=T)$ 等于多少？`,
            options: ['$0$', '$20/132$', '$1/2$', '算不出来，要先知道 $D,E$ 的值'], answer: 0,
            explain: T`$\Pr(C=T)=\frac1Z\sum_{A,B,D,E}f(A,B,T)\,g(T,D,E)$，每一项都乘了一个 $g(T,\cdot,\cdot)=0$，所以分子是 0，$\Pr(C=T)=0$。势为 0 的组合概率就是 0，不管 $f$ 那边的分数多大。选 $20/132$ 是只加了 $f$ 在 $C=T$ 的四行（$9+4+5+2=20$），忘了乘 $g$；$D,E$ 没被问到，求和掉就行，不需要知道它们的值。也正因为这一半全是 0，算 $Z$ 时可以直接跳过：$Z=12\times11=132$。`,
          },
        ],
      },

      { t: 'h2', text: '6. 随机练习', id: 'practice' },
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
