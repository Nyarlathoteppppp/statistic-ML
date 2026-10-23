/* T7 — PGM design, CPT sizes, MLE of CPTs (L20, L02). */
(function (root) {
  'use strict';
  const T = String.raw;

  root.SML.content.add({
    id: 'T07',
    eyebrow: '题型 T7 · Section C 设计题核心 · 10–20 分',
    title: 'PGM 建模、CPT 规模与 MLE',
    en: 'Design a directed PGM, count its CPTs, estimate them by MLE',
    chips: [
      { text: 'L20 p8–p14, p27', href: '#/L20', cls: 'src' }, { text: 'L02 MLE', href: '#/L02', cls: 'src' },
      { text: '2026 practice Q6', cls: 'hot' }, { text: '2025 practice Q1d–e, Q4, Q6', cls: 'hot' }, { text: '2021 exam Q14', cls: 'src' },
      { text: '2017 exam Q11 · 2016 exam Q12', href: '#/T07/more', cls: 'src' },
    ],
    lead: '这一类题分值最高，套路也最固定：**画图 → 写因子分解 → 数 CPT → 填 0/1 或数数估计 → 解释怎么用模型做决定**。山火题（Dandenongs / Bayesville）在 2025 和 2026 都出现了，务必背熟。全页缩写：PGM = 概率图模型（probabilistic graphical model），CPT = 条件概率表（conditional probability table），MLE = 最大似然估计（maximum likelihood estimate）。',
    blocks: [
      { t: 'h2', text: '1. 基础：图 ↔ 因子分解 ↔ CPT', id: 'basics' },
      {
        t: 'fx', title: 'Bayesian network 的定义（L20 p27）',
        tex: T`P(x_1,\dots,x_n)=\prod_{i=1}^{n}\htmlClass{fx-p1}{P(x_i\mid \htmlClass{fx-p2}{x_{pa_i}})}`,
        parts: [
          { label: '每个节点一张 CPT', note: '图里有几个节点，就有几张条件概率表（conditional probability table）。根节点的表就是它的边缘分布 $P(x_i)$。' },
          { label: '父节点', note: '$pa_i$ 是指向 $x_i$ 的那些节点。画图时，$P(D\\mid A,B)$ 就意味着 $A\\to D$ 和 $B\\to D$ 两条边。' },
        ],
      },
      {
        t: 'table', head: ['给定', '怎么做', '例子'], rows: [
          ['因子分解 → 画图', '每个 $P(X\\mid \\text{parents})$ 画"parents → X"', '2021 Q14a：$P(A)P(B)P(C|A)P(D|A,B)P(E|D)P(F|C,E)$ ⇒ $A\\to C$，$A\\to D$，$B\\to D$，$D\\to E$，$C\\to F$，$E\\to F$'],
          ['图 → 因子分解', '每个节点写 $P(\\text{节点}\\mid\\text{它的父节点})$，乘起来', '$A\\to C\\leftarrow B$ ⇒ $P(A)P(B)P(C\\mid A,B)$'],
          ['图 → CPT 规模', '见下一节', ''],
        ],
      },

      { t: 'h2', text: '2. 数 CPT：三种口径都要会', id: 'count' },
      '先约定记号：$k$ 是变量 $X$ 的取值个数（布尔变量——只取 0/1、真/假——则 $k=2$）；$c$ 是父节点的取值组合数（各父节点的取值个数相乘；没有父节点时 $c=1$，即只有一种组合）。下面三种「口径」就是同一张表的三种数法。',
      {
        t: 'table', head: ['口径', '公式', '布尔变量、2 个父节点时', '什么时候用'], rows: [
          ['表的形状（L20 p11 的画法）', '$k\\times c$：行是 $X$ 的取值，列是父节点组合', '$2\\times4$', '问"dimensions of the table"'],
          ['概率条目数 / 列出所有赋值的行数', '$k\\cdot c$', '8', '问"how many rows"'],
          ['自由参数（independent parameters，英文答案也写成 free parameters，是同一个东西）', '$(k-1)\\cdot c$（每列和为 1，少一个）', '4', '问"how many parameters"'],
        ],
      },
      {
        t: 'good', title: '卷面策略',
        md: '口径不确定时，**写出你用的口径，再顺手给出另一种**。例如（用的就是第 3 节山火题的 5 个传感器网络）："$P(A\\mid S_1,\\dots,C_2)$ is a $2\\times32$ table (32 parent configurations), i.e. 64 entries / 32 free parameters." 阅卷人按哪种口径都能找到对应的数。',
      },
      {
        t: 'past', src: '2025 S1 practice Q1(d)(e)', marks: '5 + 5', topic: 'L20 p9–p11',
        q: '(d) 4 Boolean random variables $X,Y,Z,V$, no independence assumed: how many rows in the probability table of the joint distribution? (e) If $X,Y,Z$ are independent of each other and $V$ depends on $X,Y$, how many rows do we need?',
        qzh: '(d) 4 个布尔随机变量 $X,Y,Z,V$，不假设任何独立性：联合分布（joint distribution）的概率表有多少行？(e) 如果 $X,Y,Z$ 彼此独立，且 $V$ 依赖于 $X,Y$，我们需要多少行？',
        azh: T`(d) $2^4=16$ 行（每种联合赋值一行；由于概率之和为 1，自由参数（free parameter）为 15 个）。
(e) 联合分布分解为 $P(X)P(Y)P(Z)P(V\mid X,Y)$，所以需要存储 $2+2+2+2^3=14$ 行（自由参数只有 $1+1+1+4=7$ 个）。`,
        blocks: [{ t: 'graph', nodes: { X: [40, 40], Y: [150, 40], Z: [260, 40], V: [95, 150] }, edges: 'X>V Y>V', w: 300, caption: '(e) 的图：$X,Y,Z$ 互相独立（没有父节点），$V$ 的父节点是 $X,Y$。每个节点存一张"给定父节点"的表。' }],
        sol: [
          '(d) 全联合表：4 个布尔变量，$2^4=2\\times2\\times2\\times2=$ **16** 行（概率加起来为 1，所以 $16-1=15$ 个自由参数）。',
          '(e) $P(X)P(Y)P(Z)P(V\\mid X,Y)$：$X,Y,Z$ 没有父节点，各存 2 行（取 0、取 1）；$V$ 的表有 2 个取值 × 父节点 $X,Y$ 的 4 种组合，共 $2^3=8$ 个条目（这里把它们全部列出来，所以算 8"行"；若按第 2 节"行 = $X$ 的取值"的口径，它是 $2\\times4$ 的表、只有 2 行）。合计 $2+2+2+8=$ **14** 行（题目问的是行数）。自由参数每张表每列少 1 个：$1+1+1+4=7$。(d) 的 15 是 $16-1$。',
          { t: 'exam', md: T`(d) $2^4=16$ rows (one per joint assignment; 15 free parameters since they sum to 1).
(e) The joint factorises as $P(X)P(Y)P(Z)P(V\mid X,Y)$, so we store $2+2+2+2^3=14$ rows (only $1+1+1+4=7$ free parameters).` },
        ],
      },
      { t: 'viz', id: 'cpt-counter', opts: { preset: 'EX2026Q6' } },

      { t: 'h2', text: '3. 山火题（2026 Q6 / 2025 Q6）', id: 'bushfire' },
      {
        t: 'past', src: '2026 S2 practice Q6（2025 S1 practice Q6 同题，多 (d)(e)）', marks: '10（2025：20）', topic: 'L20 p14, p27',
        q: 'Design a system for alerting residents of the Dandenongs that they should evacuate for an impending bushfire. If any of three sensors $S_1,S_2,S_3$ are ‘on’ then residents should evacuate. However if either of the closer sensors $C_1,C_2$ are ‘on’ then residents should stay put. (a) Model the problem as a directed PGM relating $S_1,S_2,S_3,C_1,C_2$ and an additional random variable $A$ for alerting residents to evacuate. (b) How many CPTs should be specified, and what should these tables’ dimensions be? (c) Suppose the sensors are always accurate. What could you say about your CPTs? *(2025 also:)* (d) How would you change your model if sensor $S_1$ is not perfectly accurate? (e) Given this final model, how would you use it to drive the alarm?',
        qzh: '设计一个系统，在山火（bushfire）即将来临时提醒丹德农山区（Dandenongs）的居民撤离。如果三个传感器 $S_1,S_2,S_3$ 中任意一个为"开"（on），居民就应撤离。但如果较近的两个传感器 $C_1,C_2$ 中任意一个为"开"，居民就应留在原地。(a) 把这个问题建模为一个有向概率图模型（directed PGM），关联 $S_1,S_2,S_3,C_1,C_2$ 以及一个额外的随机变量 $A$（提醒居民撤离）。(b) 需要指定多少张条件概率表（CPT），这些表的维度应是多少？(c) 假设传感器总是准确的。关于你的 CPT 能说些什么？*（2025 年还有：）* (d) 如果传感器 $S_1$ 不是完全准确的，你会怎样修改模型？(e) 有了这个最终模型，你会如何用它来驱动警报？',
        azh: T`(a) 节点 $S_1,S_2,S_3,C_1,C_2,A$；边 $S_1\to A$、$S_2\to A$、$S_3\to A$、$C_1\to A$、$C_2\to A$，即 $P(S_1)P(S_2)P(S_3)P(C_1)P(C_2)P(A\mid S_1,S_2,S_3,C_1,C_2)$。
(b) 六张 CPT：五张传感器的 $2\times1$ 表，以及一张给定五个父节点时 $A$ 的 $2\times2^5=2\times32$ 表。（2025 原题按变量数算列：传感器表各 1 列，$A$ 的表 6 列。）
(c) $A$ 的 CPT 变成确定性的（deterministic，所有条目都是 0 或 1）：当且仅当至少一个 $S_i$ 为开、且 $C_1,C_2$ 都为关时，$P(A=1\mid\cdot)=1$；传感器的先验（prior）不受影响。
(d) 加一个隐变量（latent variable）$F_1$（$S_1$ 附近是否真的有火），边为 $F_1\to S_1$，并用 $F_1\to A$ 替换 $S_1\to A$；$P(S_1\mid F_1)$ 对误报（false positive）和漏报（false negative）建模。
(e) 观测所有传感器读数，通过对 $F_1$ 求和（边缘化，marginalising）计算 $P(A=1\mid s_1,s_2,s_3,c_1,c_2)$；超过阈值就发出警报。`,
        sol: [
          { t: 'h4', text: '(a) 画图' },
          '五个传感器都是根节点，都指向 $A$：$S_1,S_2,S_3,C_1,C_2\\to A$。$A$ 的规则：$A=1$ 当且仅当 $(S_1\\lor S_2\\lor S_3)\\land\\lnot C_1\\land\\lnot C_2$（$\\lor$ = 或，$\\land$ = 并且，$\\lnot$ = 非：三个远处传感器至少一个响，并且两个近处传感器都不响）。',
          {
            t: 'html', html: '<svg class="graph" viewBox="0 0 360 150" role="img" aria-label="S1 S2 S3 C1 C2 指向 A"><defs><marker id="arrT7" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>' +
              [[40, 'S1'], [110, 'S2'], [180, 'S3'], [250, 'C1'], [320, 'C2']].map(([x, l]) => {
                const dx = 180 - x, dy = 92, len = Math.hypot(dx, dy), ex = 180 - dx / len * 20, ey = 120 - dy / len * 20, sx = x + dx / len * 18, sy = 28 + dy / len * 18;
                return '<line class="edge" x1="' + sx.toFixed(1) + '" y1="' + sy.toFixed(1) + '" x2="' + ex.toFixed(1) + '" y2="' + ey.toFixed(1) + '" marker-end="url(#arrT7)"/>' +
                  '<g class="node"><circle cx="' + x + '" cy="28" r="18"/><text x="' + x + '" y="28">' + l + '</text></g>';
              }).join('') + '<g class="node"><circle cx="180" cy="120" r="20"/><text x="180" y="120">A</text></g></svg>',
          },
          { t: 'h4', text: '(b) 数 CPT' },
          '6 个节点 ⇒ **6 张 CPT**：$P(S_1),P(S_2),P(S_3),P(C_1),P(C_2)$ 各是 $2\\times1$（2 个取值 × 只有 1 种父节点组合：根节点没有父节点，$c=1$）；$P(A\\mid S_1,S_2,S_3,C_1,C_2)$ 是 $2\\times2^5=2\\times32$。',
          { t: 'note', md: '两套口径数的是同一张表。**课件口径**（上面）：行 = $A$ 的取值（2 行），列 = 5 个父节点的组合 $2^5=32$，形状 $2\\times32$，共 64 格、32 个自由参数。**2025 题的口径**问"每张表几**列**"，把表里出现的变量各算一列：5 张根节点表各 1 列，$A$ 的表 6 列（$A$ 加 5 个父节点）；把所有赋值一行一行列出来共 $2^6=64$ 行——这 64 行就是上面那 64 格，只是换了排法。' },
          { t: 'good', title: '官方答案的写法（2026 practice 解答）', md: '官方把表画成"一行 = 一种父节点组合，只写取 True 的概率"（False 的概率就是 1 减它）：5 个传感器的表各 **1 行**（只有 $P(S_i=\\text{True})$）；$A$ 的表有 6 列（5 个父节点 + $A$）、**32 行**（$2^5=32$ 种父节点组合，每行给 $P(A=\\text{True}\\mid\\cdot)$）。和上面课件口径的 $2\\times32$ 是同一张表，只是转置、并省掉了"1 减"的那一半。考试按任一种写都行，写清楚行和列各代表什么。' },
          { t: 'h4', text: '(c) 传感器绝对准确' },
          '$A$ 的 CPT 变成**确定性**的：每个条目都是 0 或 1。32 种父节点组合中：三个 $S$ 有 $2^3=8$ 种，去掉全 off 的 1 种，"至少一个为 1"有 7 种；$C_1=C_2=0$ 只有 1 种；所以 $7\\times1=7$ 种父节点组合下 $P(A{=}1\\mid s_1,s_2,s_3,c_1,c_2)=1$，其余 $32-7=25$ 种组合下这个条件概率为 0。传感器本身的先验 $P(S_i),P(C_j)$ **不**变成 0/1（"准确"不代表火灾不随机）。',
          { t: 'h4', text: '(d) $S_1$ 不准确' },
          '加一个隐变量 $F_1$ = $S_1$ 位置真实是否有火。$F_1\\to S_1$（**原因 → 观测**：先有真实火情，传感器读数才随之出现，误报 / 漏报是测量噪声；不要画成 $S_1\\to F_1$），并把 $S_1\\to A$ 换成 $F_1\\to A$（应该根据真实火情决定）。新增 CPT：$P(F_1)$ 和 $P(S_1\\mid F_1)$（$2\\times2$，表示误报率与漏报率，不是 0/1）。$A$ 的规则不变，只是用 $F_1$ 代替 $S_1$。',
          { t: 'note', md: '这和"传感器会出错"的通用做法一样：观测到的读数可能有噪声时，不把它当成真值，而是加一个"真实状态"节点，再用一张不全是 0/1 的表 $P(\\text{读数}\\mid\\text{真实状态})$ 表示出错的概率，这里就是 $P(S_1\\mid F_1)$。' },
          { t: 'h4', text: '(e) 怎么用模型报警' },
          '$F_1$（真实火情）看不到，所以要求和掉；$s_1$ 是读到的传感器 $S_1$ 的取值（0 或 1；$s_2,c_1$ 等小写字母同理，都是对应变量被观测到的值）。$A$ 的父节点现在是 $F_1,S_2,S_3,C_1,C_2$（不含 $S_1$）；为什么 $P(f\\mid s_1,\\dots,c_2)=P(f\\mid s_1)$：$F_1$ 和其他读数 $S_2,\\dots,C_2$ 只通过 $A$ 连在一起（$F_1\\to A\\leftarrow S_2$ 这种形状），$A$ 是它们的共同孩子而且没被观测，这条路是断的（[D-separation](#/T05) 的 v-structure 规则）。所以知道 $s_1$ 以后，其他读数不再提供 $F_1$ 的信息。$P(f\\mid s_1)$ 用 Bayes 公式由先验 $P(f)$ 和 $P(s_1\\mid f)$ 算出。$f$ 只有 0、1 两项。观测到五个读数后，对隐变量 $F_1$ 求和，算后验 $P(A=1\\mid s_1,s_2,s_3,c_1,c_2)=\\sum_{f}P(A=1\\mid f,s_2,s_3,c_1,c_2)\\,P(f\\mid s_1)$。超过阈值就报警。题目没给阈值：最朴素的选择是 0.5（后验大于一半就报警），也可以按漏报 / 误报的代价来定。若 $C_1$ 或 $C_2$ 为 1，求和里两项的 $P(A=1\\mid\\cdot)$ 都是 0，后验为 0，不报警。',
          {
            t: 'exam', title: 'Exam phrasing · (a)–(e) 要点',
            md: T`(a) Nodes $S_1,S_2,S_3,C_1,C_2,A$; edges $S_1\to A$, $S_2\to A$, $S_3\to A$, $C_1\to A$, $C_2\to A$, i.e. $P(S_1)P(S_2)P(S_3)P(C_1)P(C_2)P(A\mid S_1,S_2,S_3,C_1,C_2)$.
(b) Six CPTs: five $2\times1$ tables for the sensors and one $2\times2^5=2\times32$ table for $A$ given its five parents (counting variable columns as in the 2025 question: one column per sensor table and six for $A$'s table).
(c) The CPT of $A$ becomes deterministic (all entries 0 or 1): $P(A=1\mid\cdot)=1$ iff at least one $S_i$ is on and both $C_1,C_2$ are off; the sensor priors are unaffected.
(d) Add a latent variable $F_1$ (true fire near $S_1$) with $F_1\to S_1$ and $F_1\to A$ replacing $S_1\to A$; $P(S_1\mid F_1)$ models false positives/negatives.
(e) Observe all sensor readings and compute $P(A=1\mid s_1,s_2,s_3,c_1,c_2)$ by marginalising $F_1$; raise the alarm if it exceeds a threshold.`,
          },
        ],
      },

      { t: 'h2', text: '4. MLE 估计 CPT（数数）', id: 'mle' },
      '完整观测（每个变量都观测到）时，MLE 就是**计数比例**（和 L02 的 Bernoulli MLE 一样：$\\hat\\theta=k/n$，其中 $n$ = 样本数，$k$ = "成功"出现的次数，$\\hat\\theta$ = 成功概率的估计；Bernoulli 指只有 0/1 两种结果的变量。注意这里的 $k$ 和第 2 节"$X$ 有 $k$ 种取值"的 $k$ 无关；MLE 在这里只是把样本按父节点组合分组）。某个父节点组合在数据里一次都没出现时，计数比例是 $0/0$，数据定不下这一列（任何归一化的分布似然都一样大），需要额外约定（例如平滑：每个计数都加一个伪计数，比如 1，就不会出现 0/0）。下面公式里 $\\#\\{\\cdots\\}$ 读作"满足条件的数据点个数"（$\\#$ 就是"数个数"），$x$ 是 $X$ 的某个具体取值，$\\text{pa}=u$ 表示父节点取某一组具体取值，$u$ 是那组取值的代号：',
      { t: 'math', tex: T`\hat P(X=x\mid \text{pa}=u)=\frac{\#\{X=x,\ \text{pa}=u\}}{\#\{\text{pa}=u\}}` },
      {
        t: 'past', src: '2025 S1 practice Q4', marks: '5 + 5 + 5', topic: 'L20 p9–p11, L02 MLE',
        q: 'Consider the directed PGM $A\\to C\\leftarrow B$ with Boolean variables. (a) Write the format (with empty values) of the conditional probability tables. (b) Suppose we observe $n$ sets of values of $A,B,C$ (complete observations). What does the maximum-likelihood principle say to do? (c) Suppose we observe 5 training examples for $(A,B,C)$: $(F,F,F)$; $(F,F,T)$; $(F,T,F)$; $(T,F,T)$; $(T,T,T)$. Determine maximum-likelihood estimates for your tables.',
        qzh: T`考虑布尔变量的有向概率图模型（directed PGM）$A\to C\leftarrow B$。(a) 写出条件概率表（conditional probability table）的格式（数值留空）。(b) 假设我们观测到 $n$ 组 $A,B,C$ 的取值（完整观测，complete observations）。最大似然原则（maximum-likelihood principle）要求怎么做？(c) 假设我们观测到 5 个 $(A,B,C)$ 训练样本（$T$ = True = 真，$F$ = False = 假）：$(F,F,F)$；$(F,F,T)$；$(F,T,F)$；$(T,F,T)$；$(T,T,T)$。求你的表的最大似然估计（maximum-likelihood estimate）。`,
        azh: T`(b) 选择使观测数据的似然（likelihood）$\prod_{i=1}^{n}P(a_i)P(b_i)P(c_i\mid a_i,b_i)$ 最大（等价地，使对数似然最大）的 CPT 条目，约束是每个分布之和为 1。在完整数据下，这个问题按表分解（decouple），解就是相对频率（relative frequency）：每个条目等于该取值（在该父节点配置下）的计数除以该父节点配置的计数。`,
        blocks: [{ t: 'fig', src: 'assets/figures/ex2025_q4_bn.png', w: 220 }],
        sol: [
          { t: 'h4', text: '(a) 表格格式' },
          {
            t: 'table', head: ['表', '格式'], rows: [
              ['$P(A)$', '$P(A{=}T)=\\_\\_$，$P(A{=}F)=\\_\\_$'],
              ['$P(B)$', '$P(B{=}T)=\\_\\_$，$P(B{=}F)=\\_\\_$'],
              ['$P(C\\mid A,B)$', '2 行 $C\\in\\{F,T\\}$ × 4 列 $(A,B)\\in\\{FF,FT,TF,TT\\}$，**每列**和为 1（L20 p9–p11 的格式：行 = 子节点取值，列 = 父节点配置）'],
            ],
          },
          { t: 'h4', text: '(b) MLE 原则' },
          { t: 'exam', md: T`Choose the CPT entries that maximise the likelihood of the observed data, $\prod_{i=1}^{n}P(a_i)P(b_i)P(c_i\mid a_i,b_i)$ (equivalently the log-likelihood), subject to each distribution summing to one. With complete data this decouples per table, and the solution is the relative frequency: each entry equals the count of that value (for that parent configuration) divided by the count of the parent configuration.` },
          { t: 'h4', text: '(c) 计数' },
          {
            t: 'table', head: ['表', '计数', 'MLE'], rows: [
              ['$P(A{=}T)$', '$A=T$：2/5', '**0.4**（$P(A{=}F)=0.6$）'],
              ['$P(B{=}T)$', '$B=T$：2/5', '**0.4**（$P(B{=}F)=0.6$）'],
              ['$P(C{=}T\\mid A{=}F,B{=}F)$', '(F,F,F), (F,F,T)：1/2', '**0.5**'],
              ['$P(C{=}T\\mid A{=}F,B{=}T)$', '(F,T,F)：0/1', '**0**'],
              ['$P(C{=}T\\mid A{=}T,B{=}F)$', '(T,F,T)：1/1', '**1**'],
              ['$P(C{=}T\\mid A{=}T,B{=}T)$', '(T,T,T)：1/1', '**1**'],
            ],
          },
          { t: 'note', md: '原题文字版把最后一条印成 "(T, T; T)"，图片是 (T,T,T)。另外这道题数据少，所以估计出了 0 和 1；这正是 MLE 在小样本下过度自信的例子（简答题可能问）。' },
        ],
      },
      { t: 'viz', id: 'mle-counter', opts: { preset: 'EX2025Q4c' } },

      { t: 'h2', text: '5. 2021 卷的变体', id: 'variants' },
      {
        t: 'past', src: '2021 S1 exam Q14(b)', marks: 6, topic: 'Gibbs sampling（L1–L22 课件未讲；用 L20 的因子分解推导）',
        q: 'For the Bayesian network $P(A)P(B)P(C\\mid A)P(D\\mid A,B)P(E\\mid D)P(F\\mid C,E)$ (all Boolean), Gibbs sampling resamples one variable at a time given the current values of all the others. Give the distribution used to resample $E$, simplified as far as possible.',
        qzh: T`对于贝叶斯网络 $P(A)P(B)P(C\mid A)P(D\mid A,B)P(E\mid D)P(F\mid C,E)$（全部为布尔变量），吉布斯抽样（Gibbs sampling）每次在给定其他所有变量当前值的条件下重新抽样一个变量。给出用于重新抽样 $E$ 的分布，并尽可能化简。`,
        azh: T`从 $E$ 的完全条件分布（full conditional）中重新抽样 $E$，它正比于所有含 $E$ 的因子之积（其他因子全部约掉）：$P(E=e\mid A,B,C,D,F)=\dfrac{P(e\mid D)\,P(F\mid C,e)}{\sum_{e'}P(e'\mid D)\,P(F\mid C,e')}$。它只依赖于 $E$ 的马尔可夫毯（Markov blanket）$\{D,C,F\}$；计算两个未归一化的权重，归一化，然后抽样。`,
        blocks: [{ t: 'graph', nodes: { A: [60, 30], B: [200, 30], C: [30, 130], D: [170, 130], E: [170, 230], F: [60, 300] }, edges: 'A>C A>D B>D D>E C>F E>F', cls: { E: 'cur', D: 'hl', F: 'hl', C: 'hl' }, w: 240, caption: '$P(A)P(B)P(C\\mid A)P(D\\mid A,B)P(E\\mid D)P(F\\mid C,E)$ 的图。黄 = 要重新抽样的 $E$；蓝 = 它的 Markov blanket（父 $D$、子 $F$、子的另一个父 $C$）。' }],
        sol: [
          '**思路**：Gibbs 每次从"给定其他所有变量时 $E$ 的条件分布"里抽 $E$。联合分布里不含 $E$ 的因子在分子分母里一样，会约掉，只剩含 $E$ 的因子：$P(E\\mid D)$ 和 $P(F\\mid C,E)$。具体：分子是 $P(A)P(B)P(C\\mid A)P(D\\mid A,B)P(E=e\\mid D)P(F\\mid C,E=e)$，分母是把 $e$ 换成 0 和 1 的两个式子相加；$P(A)P(B)P(C\\mid A)P(D\\mid A,B)$ 上下都有、约掉。"归一化"就是除以这两项之和，让 $e=0,1$ 的两个概率加起来等于 1。',
          { t: 'math', tex: 'P(E=e\\mid A,B,C,D,F)=\\frac{P(E=e\\mid D)\\,P(F\\mid C,E=e)}{\\sum_{e\'\\in\\{0,1\\}}P(E=e\'\\mid D)\\,P(F\\mid C,E=e\')}' },
          '只依赖 $E$ 的 **Markov blanket（马尔可夫毯）**：父节点 $D$、子节点 $F$、子节点的另一个父节点 $C$；$A,B$ 不出现。实际抽样：算出 $e=0$ 和 $e=1$ 两个权重，归一化后按这个概率抽。',
          { t: 'exam', md: 'Resample $E$ from its full conditional, which is proportional to the product of the factors containing $E$ (all other factors cancel): $P(E=e\\mid A,B,C,D,F)=\\dfrac{P(e\\mid D)\\,P(F\\mid C,e)}{\\sum_{e\'}P(e\'\\mid D)\\,P(F\\mid C,e\')}$. It depends only on $E$\'s Markov blanket $\\{D,C,F\\}$; compute the two unnormalised weights, normalise, and sample.' },
          { t: 'note', md: 'Gibbs sampling 在 L1–L22 里没有讲。如果 L23–L24 讲到，再按课件的说法核对。' },
        ],
      },
      {
        t: 'past', src: '2021 S1 exam Q14(c)', marks: 4, topic: 'L04 logistic, L20 CPT',
        q: 'Instead of implementing $P(D\\mid A,B)$ as a large conditional probability table, we decide to use a logistic regression model with three parameters (one for each of the two conditioning variables, and a bias term). Besides reducing the number of parameters, state another important consequence of this change.',
        qzh: T`我们不把 $P(D\mid A,B)$ 实现为一张大的条件概率表，而是决定使用一个有三个参数的逻辑回归（logistic regression：把线性分数 $w_0+w_AA+w_BB$ 用 sigmoid $\sigma(s)=1/(1+e^{-s})$ 压成 0–1 之间的概率）模型（两个条件变量各一个参数，外加一个偏置项（bias term））。除了减少参数数量之外，说出这一改变的另一个重要后果。`,
        azh: T`CPT 可以表示父节点配置上的任意条件分布，而逻辑回归 $P(D=1\mid A,B)=\sigma(w_0+w_AA+w_BB)$ 把对数几率（log-odds）限制为 $A$ 和 $B$ 的线性函数。因此模型失去了表达能力（expressiveness）：$A$ 和 $B$ 之间的交互作用（例如类似 XOR 的依赖关系）不再能被表示，也就是说模型的偏差（bias）更大（这里的 bias 指"模型太简单带来的系统性误差"，和上面那个偏置项 bias term 不是一回事）。作为交换，参数在不同父节点配置之间共享，可能降低估计的方差；训练中从未出现过的配置也能给出预测，但不保证准确。`,
        sol: [
          '中文要点：$\\sigma(s)=1/(1+e^{-s})$ 把分数压到 0 和 1 之间；logistic 的分数只有 $w_0+w_AA+w_BB$（$A,B$ 取 0 或 1），$A$ 和 $B$ 的影响只能**相加**。CPT 可以给 4 种父节点组合各填一个任意概率；logistic 做不到"$A,B$ 不同时 $D=1$、相同时 $D=0$"这种 XOR 式的依赖。',
          { t: 'exam', md: T`The CPT can represent any conditional distribution over the parent configurations, whereas logistic regression $P(D=1\mid A,B)=\sigma(w_0+w_AA+w_BB)$ restricts the log-odds to be linear in $A$ and $B$. So the model loses expressiveness: interactions between $A$ and $B$ (e.g. an XOR-like dependence) can no longer be represented, i.e. the model is more biased. In exchange, parameters are shared across parent configurations, which can reduce estimation variance, and configurations never seen in training still get a prediction (though not necessarily an accurate one).` },
        ],
      },

      { t: 'h2', text: '6. 更多往年设计题：2017 流感、2016 求职', id: 'more' },
      T`两道老卷 Section D 的设计题，套路和山火题一样：逐句把题意翻成箭头（原因 → 结果）→ 写因子分解 → 数 CPT → 会出错的东西用"真实值 → 观测值"加一层 → 用推断回答问题。plate 记号今年没教，$N$ 个同类变量就画几个节点，再写"…"。`,
      {
        t: 'past', src: '2017 S2 exam Q11', marks: '2 + 1 + 1 + 1', topic: 'L20 p8–p14, p27 · L23 完整数据 MLE',
        q: T`Influenza is a common disease, commonly known as the flu. It manifests with symptoms including muscle pain, coughing, fever and sneezing. A doctor will make a judgement about whether or not a patient has the flu, on the grounds of an individual's symptoms. The doctor may also make use of a clinical diagnostic test. These tests provide more reliable information than using symptoms alone, but are not perfect, in that they can return false positive or false negative results. (a) Draw a directed probabilistic graphical model (PGM) to best model the above scenario, based on the following random variables: $F$, whether the individual has the flu; $S_i$, the presence of symptom type $i$, $i=1\dots I$; and $T$ the result of the test. All random variables are binary valued. You may choose to include other random variables, as needed. [2 marks] (b) Now incorporate $D$, the doctor's diagnosis. How might the PGM differ if the doctor is known to be perfectly accurate, or inaccurate, when making their diagnosis based on the evidence? You may choose to include other random variables, as needed. [1 mark] (c) In making a diagnosis, the PGM can be used to compute a distribution over $F$. State the desired distribution, based on an individual attending the doctor with specific symptoms. [1 mark] (d) The parameters of the PGM are in the form of conditional probability tables. Explain how these parameters can be learned from data, and what kind of data would be required. [1 mark]`,
        qzh: T`流感（influenza，俗称 flu）是常见病，症状包括肌肉痛、咳嗽、发烧和打喷嚏。医生根据病人的症状判断他是否得了流感，也可能借助临床诊断检测。检测比只看症状更可靠，但并不完美：可能出现假阳性（false positive）或假阴性（false negative）。(a) 用以下随机变量画一个有向概率图模型（directed PGM），尽量好地描述这个情境：$F$ 是否得流感；$S_i$ 第 $i$ 种症状是否出现，$i=1\dots I$；$T$ 检测结果。所有变量都是二元的，需要的话可以加其他变量。[2 分] (b) 现在加入医生的诊断 $D$。如果已知医生根据证据做诊断时完全准确，或者不准确，PGM 会有什么不同？需要的话可以加其他变量。[1 分] (c) 做诊断时可以用 PGM 算出 $F$ 的一个分布。对一个带着特定症状来看病的人，写出要算的分布。[1 分] (d) PGM 的参数是条件概率表（CPT）。说明怎样从数据学到这些参数，需要什么样的数据。[1 分]`,
        azh: T`(a) 节点 $F$、$S_1,\dots,S_I$、$T$，边为对每个 $i$ 的 $F\to S_i$ 以及 $F\to T$：$P(F)\prod_i P(S_i\mid F)\,P(T\mid F)$。流感导致症状和检测结果；检测不完美，由非确定性的 CPT $P(T\mid F)$ 表示，其中 $P(T=1\mid F=0)$ 和 $P(T=0\mid F=1)$ 分别是假阳性率和假阴性率。
(b) 医生只能看到证据，所以医生不准确时，加入 $D$，父节点为 $S_1,\dots,S_I,T$，CPT $P(D\mid S_1,\dots,S_I,T)$ 的条目严格介于 0 和 1 之间。如果医生完全准确，$D$ 总等于 $F$：加 $F\to D$，CPT 是确定性的（$P(D=f\mid F=f)=1$），$D$ 只是 $F$ 的副本。
(c) 后验 $P(F\mid S_1=s_1,\dots,S_I=s_I)$（如果做了检测，也以 $T=t$ 为条件），即 $P(F=1\mid s_{1:I})\propto P(F=1)\prod_i P(s_i\mid F=1)$，再对 $F\in\{0,1\}$ 归一化。
(d) 收集以往病人的完整记录（症状、检测结果、诊断以及确诊的流感状态）。完整数据下，最大似然按表分解，每个 CPT 条目就是相对频率，例如 $\hat P(S_i=1\mid F=1)=\#\{S_i=1,F=1\}/\#\{F=1\}$、$\hat P(T=1\mid F=0)=\#\{T=1,F=0\}/\#\{F=0\}$。`,
        sol: [
          { t: 'h4', text: '(a) 画图：原因 → 结果' },
          T`流感 $F$ 是原因，症状 $S_1,\dots,S_I$ 和检测结果 $T$ 都是它的结果，所以箭头都从 $F$ 出发：每个 $i$ 一条 $F\to S_i$，再加 $F\to T$。因子分解：`,
          { t: 'math', tex: T`P(F,S_1,\dots,S_I,T)=P(F)\prod_{i=1}^{I}P(S_i\mid F)\;P(T\mid F)` },
          T`"检测会出错"体现在 CPT 上：$P(T\mid F)$ 是一张不全是 0/1 的 $2\times2$ 表，$P(T{=}1\mid F{=}0)$ 是假阳性率（false positive rate），$P(T{=}0\mid F{=}1)$ 是假阴性率（false negative rate）。上面那个因子分解（也就是下图的结构）还表示"知道是不是流感以后，各症状和检测结果互相独立"，和山火题一样是"一个原因、多个结果"。`,
          { t: 'graph', nodes: { F: [210, 30], S1: [60, 140], S2: [160, 140], S3: [260, 140], T: [370, 140] }, labels: { S1: 'S₁', S2: 'S₂', S3: 'S₃' }, edges: 'F>S1 F>S2 F>S3 F>T', w: 340, caption: '$I=3$ 时的画法：$I$ 种症状就画 $I$ 个 $S$ 节点。' },
          { t: 'warn', md: T`方向别画反：设计题按因果方向建模，流感引起症状，所以是 $F\to S_i$；画成 $S_i\to F$ 就成了"症状导致流感"。题目给的变量要全部用上，$T$ 也要和 $F$ 相连。` },
          { t: 'h4', text: '(b) 加上医生的诊断 D' },
          T`关键：医生看不到真实的 $F$，只看到证据（症状和检测结果）。`,
          {
            t: 'ul', items: [
              T`**医生不完全准确**：$D$ 的父节点是证据 $S_1,\dots,S_I,T$，CPT $P(D\mid S_1,\dots,S_I,T)$ 的条目在 0 和 1 之间（同样的证据，医生有时判对、有时判错）。这张表的父节点是 $I$ 个症状加 1 个检测结果 $T$，共 $I+1$ 个布尔变量，所以有 $2^{I+1}$ 种父节点组合。`,
              T`**医生完全准确**：$D$ 永远等于真实的 $F$。最简单的画法是 $F\to D$，CPT 是确定性的（deterministic）：$P(D{=}f\mid F{=}f)=1$，其余为 0。这时 $D$ 只是 $F$ 的副本，观测到 $D$ 就等于知道了 $F$。`,
            ],
          },
          {
            t: 'graphs', r: 16, items: [
              { nodes: { F: [210, 30], S1: [60, 140], S2: [160, 140], S3: [260, 140], T: [370, 140], D: [215, 250] }, labels: { S1: 'S₁', S2: 'S₂', S3: 'S₃' }, edges: 'F>S1 F>S2 F>S3 F>T S1>D S2>D S3>D T>D', cls: { D: 'hl' }, caption: '医生不准确：$D$ 由证据决定，CPT 是 0 到 1 之间的概率' },
              { nodes: { F: [210, 30], S1: [60, 140], S2: [160, 140], S3: [260, 140], T: [370, 140], D: [215, 250] }, labels: { S1: 'S₁', S2: 'S₂', S3: 'S₃' }, edges: 'F>S1 F>S2 F>S3 F>T F>D', cls: { D: 'hl' }, caption: '医生完全准确：$D$ 是 $F$ 的副本，$P(D\\mid F)$ 全是 0/1' },
            ],
          },
          { t: 'note', md: '和山火题（[第 3 节](#/T07/bushfire) 的 (c)(d)）同一个思路：准确 ⇒ CPT 全是 0/1；不准确 ⇒ 表里是 0 到 1 之间的概率。' },
          { t: 'h4', text: '(c) 要算的分布' },
          T`用模型做诊断，要的是：给定这位病人的症状，$F$ 的后验分布（posterior）$P(F\mid S_1=s_1,\dots,S_I=s_I)$；做了检测就把 $T=t$ 也放进条件。按 Bayes 规则算，分母就是对 $F$ 的两个取值求和：`,
          { t: 'math', tex: T`P(F=1\mid s_1,\dots,s_I)=\frac{P(F=1)\prod_{i}P(s_i\mid F=1)}{\sum_{f\in\{0,1\}}P(F=f)\prod_{i}P(s_i\mid F=f)}` },
          T`条件里不放 $D$：模型本身就是用来给出诊断的，医生的诊断不是这里的输入。`,
          { t: 'h4', text: '(d) 怎么学 CPT' },
          T`收集以往病人的完整记录：每人的症状 $S_1,\dots,S_I$、检测结果 $T$、医生诊断 $D$，以及后来确诊的真实 $F$（例如化验结果）。完整数据下 MLE 就是数数（[第 4 节](#/T07/mle)），每张表按父节点组合分组算比例：`,
          {
            t: 'ul', items: [
              T`$\hat P(F{=}1)=\#\{F=1\}/n$（$n$ = 病人数）`,
              T`$\hat P(S_i{=}1\mid F{=}f)=\#\{S_i=1,\ F=f\}/\#\{F=f\}$`,
              T`$\hat P(T{=}1\mid F{=}0)=\#\{T=1,\ F=0\}/\#\{F=0\}$（假阳性率），假阴性率同理`,
            ],
          },
          T`（如果数据里根本没有真实的 $F$，它就成了隐变量，要用 EM，今年不考，这里不展开。）`,
          {
            t: 'exam', md: T`(a) Nodes $F$, $S_1,\dots,S_I$, $T$ with edges $F\to S_i$ for every $i$ and $F\to T$: $P(F)\prod_i P(S_i\mid F)\,P(T\mid F)$. The flu causes the symptoms and the test result; the imperfect test is captured by a non-deterministic CPT $P(T\mid F)$, whose entries $P(T=1\mid F=0)$ and $P(T=0\mid F=1)$ are the false positive and false negative rates.
(b) The doctor only sees the evidence, so for an inaccurate doctor add $D$ with parents $S_1,\dots,S_I,T$ and a CPT $P(D\mid S_1,\dots,S_I,T)$ with entries strictly between 0 and 1. If the doctor is perfectly accurate, $D$ always equals $F$: add $F\to D$ with a deterministic CPT ($P(D=f\mid F=f)=1$), so $D$ is just a copy of $F$.
(c) The posterior $P(F\mid S_1=s_1,\dots,S_I=s_I)$ (also conditioning on $T=t$ if the test was done), i.e. $P(F=1\mid s_{1:I})\propto P(F=1)\prod_i P(s_i\mid F=1)$, normalised over $F\in\{0,1\}$.
(d) Collect complete records of past patients (symptoms, test result, diagnosis and the confirmed flu status). With complete data, maximum likelihood decouples per table and each CPT entry is a relative frequency, e.g. $\hat P(S_i=1\mid F=1)=\#\{S_i=1,F=1\}/\#\{F=1\}$ and $\hat P(T=1\mid F=0)=\#\{T=1,F=0\}/\#\{F=0\}$.`,
          },
        ],
      },
      {
        t: 'past', src: '2016 S2 exam Q12（12.1–12.4）', marks: '1 + 1 + 1 + 1（全题 5 分；12.5 学 CPT 见 c61 原题）', topic: 'L20 p8–p14, p27 · L21 推断',
        q: T`Your task is to design a probabilistic graphical model (PGM) to capture a real-world scenario. Consider the problem of a student graduating from University and looking for a graduate job, by writing a CV and having a lecturer write them a reference letter. The CV is based on the student's marks for the $N$ subjects they have taken, and each mark is a reflection of the student's general skill. The reference letter is written by a lazy lecturer, basing their assessment purely on the mark obtained by the student in their subject. 1. Design a PGM to capture the above scenario, using as random variables: $M_i$: mark on subject $i$, with $i\in[1,N]$; $C$: quality of their CV; $S$: skill level; $R$: recommendation of reference letter. [1 mark] 2. Assuming each variable is binary (i.e., each value is high or low; or true or false), state the number of conditional probability tables and the number of free parameters in each table needed to specify the model. [1 mark] 3. CVs are not always written honestly, in that the marks may not always be reported correctly. Propose a change to the model and/or its parameterisation to best capture this situation. [1 mark] 4. Consider the role of a recruiter who wants to employ honest and skilful workers. Their task is to find the skill of the student and whether or not they are honest. What method might they use to determine these values, and what inputs would be required? [1 mark]`,
        qzh: T`你的任务是设计一个概率图模型（PGM）来描述一个真实情境：学生大学毕业找工作，要写简历（CV），并请一位讲师写推荐信。简历基于学生修过的 $N$ 门课的成绩，每门成绩反映学生的总体能力（skill）。推荐信由一位"偷懒"的讲师写，他只根据学生在他那门课的成绩来评价。1. 用以下随机变量设计 PGM：$M_i$ 第 $i$ 门课的成绩，$i\in[1,N]$；$C$ 简历质量；$S$ 能力水平；$R$ 推荐信的推荐程度。[1 分] 2. 假设所有变量都是二元的（高/低，或真/假），写出确定这个模型需要几张条件概率表、每张表有几个自由参数。[1 分] 3. 简历不一定诚实：成绩可能报得不对。提出对模型和/或参数化的修改来最好地描述这种情况。[1 分] 4. 招聘方想雇诚实又有能力的人，要判断学生的能力以及是否诚实。他们可以用什么方法，需要哪些输入？[1 分]`,
        azh: T`1. 对 $i=1,\dots,N$ 有 $S\to M_i$（每门成绩反映能力）；$M_1,\dots,M_N\to C$（简历基于成绩）；只有 $M_k\to R$，$k$ 是讲师教的那门课（偷懒的讲师只看这一个成绩）。联合分布：$P(S)\prod_i P(M_i\mid S)\,P(C\mid M_1,\dots,M_N)\,P(R\mid M_k)$。
2. $N+3$ 张 CPT：$P(S)$ 有 1 个自由参数；$N$ 张 $P(M_i\mid S)$ 各 2 个；$P(C\mid M_1,\dots,M_N)$ 有 $2^N$ 个；$P(R\mid M_k)$ 有 2 个——合计 $2^N+2N+3$ 个。
3. 把真实成绩 $M_i$ 和简历上报的成绩 $M_i'$ 分开，并加一个诚实变量 $H$：$M_i\to M_i'\leftarrow H$，简历取决于报的成绩（$M_1',\dots,M_N'\to C$），$R$ 仍取决于真实成绩 $M_k$。$H$ 为诚实时 $P(M_i'\mid M_i,H)$ 是确定性的（$M_i'=M_i$）；不诚实时允许虚报，例如 $P(M_i'=\text{high}\mid M_i=\text{low},H=\text{dishonest})>0$。
4. 概率推断（probabilistic inference）：把报的成绩（或简历质量）和推荐信当作观测证据，计算后验 $P(S\mid m',r)$ 和 $P(H\mid m',r)$，例如用变量消元把未观测的真实成绩求和掉。输入：观测到的简历和推荐信，加上模型结构及其（事先学好的）CPT。`,
        blocks: [{ t: 'note', md: T`第 5 问（CPT 怎么从数据学）略：能力 $S$ 和是否诚实在数据里永远观测不到，要用 EM，今年不考。` }],
        sol: [
          { t: 'h4', text: '12.1 画图：逐句翻成箭头' },
          {
            t: 'ul', items: [
              T`"each mark is a reflection of the student's general skill"：能力是原因，$S\to M_i$（每门课一条）。`,
              T`"The CV is based on the student's marks"：$M_1,\dots,M_N\to C$。`,
              T`"lazy lecturer … purely on the mark … in their subject"：$R$ 只有一个父节点，就是讲师自己那门课的成绩 $M_k$；不连 $S$，也不连别的成绩。`,
            ],
          },
          { t: 'math', tex: T`P(S,M_1,\dots,M_N,C,R)=P(S)\prod_{i=1}^{N}P(M_i\mid S)\;P(C\mid M_1,\dots,M_N)\;P(R\mid M_k)` },
          { t: 'graph', nodes: { S: [200, 30], M1: [90, 130], M2: [200, 130], M3: [310, 130], C: [200, 240], R: [40, 240] }, labels: { M1: 'M₁', M2: 'M₂', M3: 'M₃' }, edges: 'S>M1 S>M2 S>M3 M1>C M2>C M3>C M1>R', w: 320, caption: '$N=3$ 时的画法（$N$ 门课就画 $N$ 个 $M$，不用 plate）；设讲师教第 1 门，所以 $R$ 只连 $M_1$。' },
          { t: 'h4', text: '12.2 数 CPT（全部二元）' },
          T`每个节点一张 CPT；自由参数 =（取值数 − 1）× 父节点组合数（[第 2 节](#/T07/count)）：`,
          {
            t: 'table', head: ['节点', 'CPT', '形状', '自由参数'], rows: [
              ['$S$', '$P(S)$', '$2\\times1$', '1'],
              ['$M_i$（$N$ 个）', '$P(M_i\\mid S)$', '$2\\times2$', '每张 2，共 $2N$'],
              ['$C$', '$P(C\\mid M_1,\\dots,M_N)$', '$2\\times2^N$', '$2^N$'],
              ['$R$', '$P(R\\mid M_k)$', '$2\\times2$', '2'],
              ['合计', '$N+3$ 张', '', '$2^N+2N+3$'],
            ],
          },
          T`例如 $N=3$：6 张表，自由参数 $1+6+8+2=17$ 个（1 来自 $P(S)$；6 = 3 张 $P(M_i\mid S)$ 各 2 个；8 = $C$ 的表的 $2^3$ 种父节点组合；2 来自 $P(R\mid M_k)$）。$C$ 的表最大，因为它有 $N$ 个父节点。`,
          { t: 'h4', text: '12.3 简历不诚实' },
          T`"成绩可能报错"就是：简历上写的成绩不一定是真实成绩。把两者分开，再加一个"是否诚实"的变量：`,
          {
            t: 'ul', items: [
              T`真实成绩 $M_i$ 照旧由能力决定：$S\to M_i$。`,
              T`新变量 $H$（学生是否诚实）；简历上写的成绩 $M_i'$ 由真实成绩和诚实度决定：$M_i\to M_i'$，$H\to M_i'$。`,
              T`简历质量看写出来的成绩：$M_1',\dots,M_N'\to C$。`,
              T`讲师知道真实成绩：$R$ 仍然只连真实的 $M_k$。`,
            ],
          },
          T`参数化：$H=$ 诚实时，$P(M_i'\mid M_i,H)$ 是确定性的（$M_i'=M_i$，条目全是 0/1）；$H=$ 不诚实时允许"低报成高"，例如 $P(M_i'=\text{high}\mid M_i=\text{low},H=\text{dishonest})=q>0$。`,
          { t: 'graph', nodes: { S: [220, 30], M1: [120, 115], M2: [220, 115], M3: [320, 115], H: [440, 115], R: [30, 205], P1: [120, 205], P2: [220, 205], P3: [320, 205], C: [220, 295] }, labels: { M1: 'M₁', M2: 'M₂', M3: 'M₃', P1: 'M₁′', P2: 'M₂′', P3: 'M₃′' }, edges: 'S>M1 S>M2 S>M3 M1>P1 M2>P2 M3>P3 H>P1 H>P2 H>P3 P1>C P2>C P3>C M1>R', cls: { H: 'hl', P1: 'hl', P2: 'hl', P3: 'hl' }, w: 380, caption: T`改后的模型（$N=3$）：蓝色是新加的 $H$ 和简历上的成绩 $M_i'$；推荐信 $R$ 仍连真实成绩 $M_1$。` },
          { t: 'note', md: '和山火题 (d) 一个套路：把"观测到的值"（简历上的成绩）和"真实值"（真成绩）分开，中间那张 CPT 描述"会出错"。' },
          { t: 'h4', text: '12.4 招聘方怎么判断' },
          T`用概率推断（probabilistic inference）。能看到的是简历上的成绩 $M_i'$（或简历质量 $C$）和推荐信 $R$，把它们当观测，算后验 $P(S\mid m',r)$ 和 $P(H\mid m',r)$；看不到的真实成绩 $M_i$ 用消元算法求和掉（L21）。输入：这些观测值，加上模型结构和事先学好的 CPT。`,
          T`直觉：推荐信只看真实成绩 $M_k$。如果简历上 $M_k'$ 写得很高，推荐信却很一般，$P(H=\text{dishonest})$ 就会上升。`,
          {
            t: 'exam', md: T`1. $S\to M_i$ for $i=1,\dots,N$ (each mark reflects skill); $M_1,\dots,M_N\to C$ (the CV is based on the marks); only $M_k\to R$, where $k$ is the lecturer's subject (the lazy lecturer uses only that mark). Joint: $P(S)\prod_i P(M_i\mid S)\,P(C\mid M_1,\dots,M_N)\,P(R\mid M_k)$.
2. $N+3$ CPTs: $P(S)$ with 1 free parameter; $N$ tables $P(M_i\mid S)$ with 2 each; $P(C\mid M_1,\dots,M_N)$ with $2^N$; $P(R\mid M_k)$ with 2 — in total $2^N+2N+3$.
3. Separate the true mark $M_i$ from the reported mark $M_i'$ and add an honesty variable $H$: $M_i\to M_i'\leftarrow H$, the CV depends on the reported marks ($M_1',\dots,M_N'\to C$), and $R$ still depends on the true mark $M_k$. $P(M_i'\mid M_i,H)$ is deterministic ($M_i'=M_i$) when $H$ is honest, and allows inflated marks, e.g. $P(M_i'=\text{high}\mid M_i=\text{low},H=\text{dishonest})>0$, otherwise.
4. Probabilistic inference: treat the reported marks (or the CV quality) and the reference letter as evidence and compute the posteriors $P(S\mid m',r)$ and $P(H\mid m',r)$, e.g. by variable elimination summing out the unobserved true marks. Inputs: the observed CV and letter, plus the model structure and its (previously learned) CPTs.`,
          },
        ],
      },

      { t: 'h2', text: '7. 随机练习', id: 'practice' },
      { t: 'practice', gen: 'cpt', title: 'CPT 计数随机题' },
      {
        t: 'quiz', items: [
          {
            q: '$X$ 有 3 种取值，父节点 $A$（2 种取值）和 $B$（4 种取值）。$P(X\\mid A,B)$ 有多少个自由参数？', type: 'num', answer: 16,
            explain: '父节点组合 $c=2\\times4=8$，每个组合下 $X$ 的分布有 $3-1=2$ 个自由数：$2\\times8=16$。',
          },
          {
            q: '图 $A\\to B\\to C$（都是布尔变量）。因子分解共有多少个自由参数？比全联合表少几个？', type: 'show',
            answerText: '$1+2+2=5$ 个；全联合 $2^3-1=7$ 个，少 2 个。',
            explain: '$P(A)$：1；$P(B\\mid A)$：2；$P(C\\mid B)$：2。',
          },
        ],
      },
    ],
  });
})(window);
