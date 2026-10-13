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
    ],
    lead: '这一类题分值最高，套路也最固定：**画图 → 写因子分解 → 数 CPT → 填 0/1 或数数估计 → 解释怎么用模型做决定**。山火题（Dandenongs / Bayesville）在 2025 和 2026 都出现了，务必背熟。',
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
      '设变量 $X$ 有 $k$ 种取值，父节点的取值组合共 $c$ 种（各父节点取值数相乘，没有父节点时 $c=1$）。',
      {
        t: 'table', head: ['口径', '公式', '布尔变量、2 个父节点时', '什么时候用'], rows: [
          ['表的形状（L20 p11 的画法）', '$k\\times c$：行是 $X$ 的取值，列是父节点组合', '$2\\times4$', '问"dimensions of the table"'],
          ['概率条目数 / 列出所有赋值的行数', '$k\\cdot c$', '8', '问"how many rows"'],
          ['自由参数（independent parameters）', '$(k-1)\\cdot c$（每列和为 1，少一个）', '4', '问"how many parameters"'],
        ],
      },
      {
        t: 'good', title: '卷面策略',
        md: '口径不确定时，**写出你用的口径，再顺手给出另一种**。例如："$P(A\\mid S_1,\\dots,C_2)$ is a $2\\times32$ table (32 parent configurations), i.e. 64 entries / 32 free parameters." 阅卷人按哪种口径都能找到对应的数。',
      },
      {
        t: 'past', src: '2025 S1 practice Q1(d)(e)', marks: '5 + 5', topic: 'L20 p9–p11',
        q: '(d) 4 Boolean random variables $X,Y,Z,V$, no independence assumed: how many rows in the probability table of the joint distribution? (e) If $X,Y,Z$ are independent of each other and $V$ depends on $X,Y$, how many rows do we need?',
        blocks: [{ t: 'graph', nodes: { X: [40, 40], Y: [150, 40], Z: [260, 40], V: [95, 150] }, edges: 'X>V Y>V', w: 300, caption: '(e) 的图：$X,Y,Z$ 互相独立（没有父节点），$V$ 的父节点是 $X,Y$。每个节点存一张"给定父节点"的表。' }],
        sol: [
          '(d) 全联合表：4 个布尔变量，$2^4=2\\times2\\times2\\times2=$ **16** 行（概率加起来为 1，所以 $16-1=15$ 个自由参数）。',
          '(e) $P(X)P(Y)P(Z)P(V\\mid X,Y)$：$X,Y,Z$ 没有父节点，各存 2 行（取 0、取 1）；$V$ 的表是 $V$ 的 2 个取值 × 父节点 $X,Y$ 的 4 种组合 $=2^3=8$ 行。合计 $2+2+2+8=$ **14** 行（题目问的是行数）。自由参数每张表每列少 1 个：$1+1+1+4=7$。(d) 的 15 是 $16-1$。',
          { t: 'exam', md: T`(d) $2^4=16$ rows (one per joint assignment; 15 free parameters since they sum to 1).
(e) The joint factorises as $P(X)P(Y)P(Z)P(V\mid X,Y)$, so we store $2+2+2+2^3=14$ rows (only $1+1+1+4=7$ free parameters).` },
        ],
      },
      { t: 'viz', id: 'cpt-counter', opts: { preset: 'EX2026Q6' } },

      { t: 'h2', text: '3. 山火题（2026 Q6 / 2025 Q6）', id: 'bushfire' },
      {
        t: 'past', src: '2026 S2 practice Q6（2025 S1 practice Q6 同题，多 (d)(e)）', marks: '10（2025：20）', topic: 'L20 p14, p27',
        q: 'Design a system for alerting residents of the Dandenongs that they should evacuate for an impending bushfire. If any of three sensors $S_1,S_2,S_3$ are ‘on’ then residents should evacuate. However if either of the closer sensors $C_1,C_2$ are ‘on’ then residents should stay put. (a) Model the problem as a directed PGM relating $S_1,S_2,S_3,C_1,C_2$ and an additional random variable $A$ for alerting residents to evacuate. (b) How many CPTs should be specified, and what should these tables’ dimensions be? (c) Suppose the sensors are always accurate. What could you say about your CPTs? *(2025 also:)* (d) How would you change your model if sensor $S_1$ is not perfectly accurate? (e) Given this final model, how would you use it to drive the alarm?',
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
          '6 个节点 ⇒ **6 张 CPT**：$P(S_1),P(S_2),P(S_3),P(C_1),P(C_2)$ 各是 $2\\times1$；$P(A\\mid S_1,S_2,S_3,C_1,C_2)$ 是 $2\\times2^5=2\\times32$。',
          { t: 'note', md: '两套口径数的是同一张表。**课件口径**（上面）：行 = $A$ 的取值（2 行），列 = 5 个父节点的组合 $2^5=32$，形状 $2\\times32$，共 64 格、32 个自由参数。**2025 题的口径**问"每张表几**列**"，把表里出现的变量各算一列：5 张根节点表各 1 列，$A$ 的表 6 列（$A$ 加 5 个父节点）；把所有赋值一行一行列出来共 $2^6=64$ 行——这 64 行就是上面那 64 格，只是换了排法。' },
          { t: 'h4', text: '(c) 传感器绝对准确' },
          '$A$ 的 CPT 变成**确定性**的：每个条目都是 0 或 1。32 种父节点组合中：三个 $S$ 有 $2^3=8$ 种，去掉全 off 的 1 种，"至少一个为 1"有 7 种；$C_1=C_2=0$ 只有 1 种；所以 $7\\times1=7$ 种组合 $P(A{=}1)=1$，其余 $32-7=25$ 种 $P(A{=}1)=0$。传感器本身的先验 $P(S_i),P(C_j)$ **不**变成 0/1（"准确"不代表火灾不随机）。',
          { t: 'h4', text: '(d) $S_1$ 不准确' },
          '加一个隐变量 $F_1$ = $S_1$ 位置真实是否有火。$F_1\\to S_1$（**原因 → 观测**：先有真实火情，传感器读数才随之出现，误报 / 漏报是测量噪声；不要画成 $S_1\\to F_1$），并把 $S_1\\to A$ 换成 $F_1\\to A$（应该根据真实火情决定）。新增 CPT：$P(F_1)$ 和 $P(S_1\\mid F_1)$（$2\\times2$，表示误报率与漏报率，不是 0/1）。$A$ 的规则不变，只是用 $F_1$ 代替 $S_1$。',
          { t: 'note', md: '这和课件 L20 p8–p11 的硬币例子同一思路：第三人的报告 $X_3$ 只有 90% 准确，所以用 $P(X_3\\mid X_1,X_2)$ 这张非 0/1 的表来表示"报告有噪声"。' },
          { t: 'h4', text: '(e) 怎么用模型报警' },
          '$F_1$（真实火情）看不到，所以要求和掉；$s_1$ 是读到的传感器数。$A$ 的父节点现在是 $F_1,S_2,S_3,C_1,C_2$（不含 $S_1$）；没观测 $A$ 时 $F_1$ 只和 $S_1$ 有关，所以 $P(f\\mid s_1,\\dots,c_2)=P(f\\mid s_1)$。$f$ 只有 0、1 两项。观测到五个读数后，对隐变量 $F_1$ 求和，算后验 $P(A=1\\mid s_1,s_2,s_3,c_1,c_2)=\\sum_{f}P(A=1\\mid f,s_2,s_3,c_1,c_2)\\,P(f\\mid s_1)$。超过阈值（如 0.5，或按疏散的代价调整）就报警。若 $C_1$ 或 $C_2$ 为 1，求和里两项的 $P(A=1\\mid\\cdot)$ 都是 0，后验为 0，不报警。',
          {
            t: 'exam', title: 'Exam phrasing · (a)–(e) 要点',
            md: T`(a) Nodes $S_1,S_2,S_3,C_1,C_2,A$; edges $S_1\to A$, $S_2\to A$, $S_3\to A$, $C_1\to A$, $C_2\to A$, i.e. $P(S_1)P(S_2)P(S_3)P(C_1)P(C_2)P(A\mid S_1,S_2,S_3,C_1,C_2)$.
(b) Six CPTs: five $2\times1$ tables for the sensors and one $2\times2^5=2\times32$ table for $A$ given its five parents.
(c) The CPT of $A$ becomes deterministic (all entries 0 or 1): $P(A=1\mid\cdot)=1$ iff at least one $S_i$ is on and both $C_1,C_2$ are off; the sensor priors are unaffected.
(d) Add a latent variable $F_1$ (true fire near $S_1$) with $F_1\to S_1$ and $F_1\to A$ replacing $S_1\to A$; $P(S_1\mid F_1)$ models false positives/negatives.
(e) Observe all sensor readings and compute $P(A=1\mid s_1,s_2,s_3,c_1,c_2)$ by marginalising $F_1$; raise the alarm if it exceeds a threshold.`,
          },
        ],
      },

      { t: 'h2', text: '4. MLE 估计 CPT（数数）', id: 'mle' },
      '完整观测（每个变量都观测到）时，MLE 就是**计数比例**（和 L02 的 Bernoulli MLE $\\hat\\theta=k/n$ 一样，只是按父节点组合分组）。某个父节点组合在数据里一次都没出现时，分母为 0，MLE 无定义，需要额外约定（例如平滑）：',
      { t: 'math', tex: T`\hat P(X=x\mid \text{pa}=u)=\frac{\#\{X=x,\ \text{pa}=u\}}{\#\{\text{pa}=u\}}` },
      {
        t: 'past', src: '2025 S1 practice Q4', marks: '5 + 5 + 5', topic: 'L20 p9–p11, L02 MLE',
        q: 'Consider the directed PGM $A\\to C\\leftarrow B$ with Boolean variables. (a) Write the format (with empty values) of the conditional probability tables. (b) Suppose we observe $n$ sets of values of $A,B,C$ (complete observations). What does the maximum-likelihood principle say to do? (c) Suppose we observe 5 training examples for $(A,B,C)$: $(F,F,F)$; $(F,F,T)$; $(F,T,F)$; $(T,F,T)$; $(T,T,T)$. Determine maximum-likelihood estimates for your tables.',
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
        sol: [
          '中文要点：$\\sigma(s)=1/(1+e^{-s})$ 把分数压到 0 和 1 之间；logistic 的分数只有 $w_0+w_AA+w_BB$（$A,B$ 取 0 或 1），$A$ 和 $B$ 的影响只能**相加**。CPT 可以给 4 种父节点组合各填一个任意概率；logistic 做不到"$A,B$ 不同时 $D=1$、相同时 $D=0$"这种 XOR 式的依赖。',
          { t: 'exam', md: T`The CPT can represent any conditional distribution over the parent configurations, whereas logistic regression $P(D=1\mid A,B)=\sigma(w_0+w_AA+w_BB)$ restricts the log-odds to be linear in $A$ and $B$. So the model loses expressiveness: interactions between $A$ and $B$ (e.g. an XOR-like dependence) can no longer be represented, i.e. the model is more biased. In exchange, parameters are shared across parent configurations, so estimates are more stable and configurations never seen in training still get sensible probabilities.` },
        ],
      },

      { t: 'h2', text: '6. 随机练习', id: 'practice' },
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
