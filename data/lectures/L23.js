(function (root) {
  'use strict';
  const T = String.raw;
  root.SML.content.add(root.SML.lecture({
    id: 'L23',
    eyebrow: '单元 6 · Jiang · 学习 Bayesian network',
    chips: ['L23 p1–p34', { text: 'c60 BN 等价', href: '#/c60' }, { text: 'c61 MLE 与 BIC', href: '#/c61' }, { text: 'c62 Bayesian score 与搜索', href: '#/c62' }, { text: 'T7 CPT 与 MLE', href: '#/T07' }],
    lead: '前两周都假设图和 CPT 已知，只做推断。这一讲反过来：只有一张**完整的数据表**，要把 BN 学出来——既要学参数（CPT），也要学结构（图）。先弄清哪些图其实是同一个模型（等价类），再用"数数"估参数，用 BIC 或 Bayesian score 给图打分，最后在无环图里找分最高的那张。',
    oneLiner: {
      zh: '两张 DAG 等价 ⇔ 骨架相同且 immoral v 结构相同；数据只能分辨等价类。完整数据下 CPT 的 MLE 是每列的频率 $\\hat n_{1jk}/\\sum_l\\hat n_{1jl}$。最大似然随父节点增加只升不降，不能用来选结构，要用 BIC（减 $\\frac{(r_1-1)q_1}{2}\\log T$）或 Bayesian score（每列一个 Dirichlet 先验，对参数积分）。两种分数都可分解、等价图同分；但整张图必须无环，所以找最高分的 DAG 是计算上很难的问题。',
      en: T`Two DAGs are equivalent if and only if they have the same skeleton and the same immoral v-structures, so data can only identify an equivalence class. With complete data the likelihood splits per CPT and the MLE is the relative frequency $\hat\theta_{1jk}=\hat n_{1jk}/\sum_l\hat n_{1jl}$. The maximised likelihood never decreases when parents are added, so structures are compared with a penalised score: BIC, $l(\hat\theta)-\frac{(r_1-1)q_1}{2}\log T$, or the Bayesian score, which integrates the likelihood over a Dirichlet prior (one per CPT column, $\alpha_{1jk}=\alpha/(r_1q_1)$). Both scores are decomposable and equal for equivalent graphs, but the parent sets must form a DAG, so finding the highest-scoring graph is computationally hard (local, stochastic or exact search).`,
    },
    why: [
      '图模型要用起来，先得有图和参数。真实问题（课件 p31：25 个线虫表型、926 次实验）里两者都未知，只能从数据学。讲者："this is a two-fold problem"——学参数、学结构。',
      '只看似然选结构会过拟合：多一个父节点就多一列参数，训练数据上的似然只会更高（p19）。所以要么显式扣分（BIC，p20），要么把参数积分掉（Bayesian score，p23）。',
    ],
    defs: [
      ['equivalent graphs', '对变量做出的独立性假设完全相同的两张图', 'p4'],
      ['equivalence criterion', '两张 DAG 等价 ⇔ 骨架（忽略方向的边）相同 + immoral v 结构相同', 'p6'],
      ['immoral v-structure', '$a\\to c\\leftarrow b$，且 $a,b$ 之间没有边', 'p6（讲者）'],
      ['complete data', '数据表每一格都有值，没有缺失；本讲全部建立在这个假设上', 'p9'],
      ['parameter estimation / model selection / structure search', '图已知时估参数 / 给每张图打分 / 找分最高的图', 'p10–p12'],
      ['fully parameterized', 'CPT 除"每列和为 1"外没有别的约束', 'p15'],
      ['$r_i$, $j$, $q_1$, $\\theta_{1jk}$', '取值个数；父节点配置编号；配置个数 $q_1=r_2r_3$；$P(x_1=k\\mid(x_2,x_3)=j)$', 'p16'],
      ['$\\hat n_{1jk}$', '父节点配置 $j$ 后面跟着 $x_1=k$ 的行数', 'p17'],
      ['BIC score', '最大条件对数似然减 $\\frac{(r_1-1)q_1}{2}\\log T$', 'p20'],
      ['decomposable score', '$\\mathrm{score}(G;D)=\\sum_i\\mathrm{score}(i\\mid pa_i;D)$', 'p13, p21'],
      ['Bayesian score', '$\\log\\int P(\\theta)\\prod_tP(x_{t1}\\mid x_{t2},x_{t3};\\theta)\\,d\\theta$', 'p23'],
      ['three criteria', 'parameter independence、parameter modularity、likelihood equivalence ⇒ 只能用 Dirichlet', 'p25–p26'],
      ['equivalent sample size $\\alpha$', '先验总伪计数；均匀分配时 $\\alpha_{1jk}=\\alpha/(r_1q_1)$', 'p27'],
    ],
    formulas: [
      {
        t: 'fx', title: 'MLE 与 BIC（L23 p18、p20）',
        tex: T`\hat\theta_{1jk}=\frac{\hat n_{1jk}}{\sum_{l=1}^{r_1}\hat n_{1jl}}\qquad\mathrm{score}(1|2,3;D)=\htmlClass{fx-p1}{l(1|2,3;\hat\theta)}-\htmlClass{fx-p2}{\frac{(r_1-1)q_1}{2}\log(T)}`,
        intro: '$l(1|2,3;\\theta)=\\sum_t\\log P(x_{t1}\\mid x_{t2},x_{t3};\\theta)=\\sum_k\\sum_j\\hat n_{1jk}\\log\\theta_{1jk}$（p17）。',
        parts: [
          { label: 'fit', note: '用 MLE 参数时的最大条件对数似然。' },
          { label: 'penalty', note: '自由参数 $(r_1-1)q_1$ 个，每个罚 $\\frac12\\log T$；$T$ 是数据行数。' },
        ],
      },
      {
        t: 'fx', title: '闭式 Bayesian score（L23 p28，推导不考）',
        tex: T`\sum_{j=1}^{q_1}\Big[\htmlClass{fx-p1}{\log\frac{\Gamma(\alpha_{1j})}{\Gamma(\alpha_{1j}+\hat n_{1j})}}+\sum_{k=1}^{r_1}\htmlClass{fx-p2}{\log\frac{\Gamma(\alpha_{1jk}+\hat n_{1jk})}{\Gamma(\alpha_{1jk})}}\Big],\quad\alpha_{1jk}=\frac{\alpha}{r_1q_1}`,
        parts: [
          { label: 'per column', note: '$\\alpha_{1j}=\\sum_k\\alpha_{1jk}$，$\\hat n_{1j}$ = 配置 $j$ 出现的行数。' },
          { label: 'per cell', note: '伪计数 $\\alpha_{1jk}$ 加真实计数 $\\hat n_{1jk}$。' },
        ],
      },
    ],
    examples: [
      '课件数据（p9）前三列、前 6 行，$x_1$ 的父节点取 $(x_2,x_3)$：第 2、5 行都是 $(x_2,x_3)=(2,2)$（$j=4$）、$x_1=1$，所以 $\\log\\theta_{141}+\\log\\theta_{141}=2\\log\\theta_{141}$（p17）。完整计数和 MLE 见 [c61](#/c61) 例 1。',
      { t: 'table', cls: 'compact', head: ['$x_1$ 的父节点（$T=6$）', '$l(\\hat\\theta)$', 'BIC', 'Bayesian（$\\alpha=4$）'], rows: [
        ['$\\varnothing$', '−3.819', '−4.715', '−4.431'],
        ['$\\{x_2\\}$', '−2.773', '−4.564', '−4.500'],
        ['$\\{x_3\\}$', '−2.773', '−5.460', '−4.921'],
        ['$\\{x_2,x_3\\}$', '0', '−5.375', '−3.689'],
      ] },
      '似然一路升到 0（p19 的问题）；BIC 选 $\\{x_2\\}$。用 BIC 在这三列上枚举全部 25 张 DAG，最高分是 $x_1\\to x_2$ 和 $x_2\\to x_1$ 并列（$-17.663$），正好是一个等价类（[c62](#/c62) 例 2）。',
      { t: 'slide', src: 'L23/p07', caption: '3 个节点的 25 张 DAG 分成 11 个等价类。' },
    ],
    compare: [{
      t: 'table', head: ['', 'BIC', 'Bayesian score'], rows: [
        ['参数', '一组 MLE $\\hat\\theta$', '按先验对所有 $\\theta$ 积分'],
        ['复杂度控制', '显式惩罚 $\\frac{(r_1-1)q_1}{2}\\log T$', '积分自带'],
        ['可分解 / 等价图同分', '是 / 是（p21–p22）', '是 / 是（$\\alpha_{1jk}\\propto P_U$，p27）'],
      ],
    }],
    pitfalls: [
      ['箭头方向不同就不等价', '只比骨架和 immoral v 结构；链、反向链、分叉等价（p5–p7）'],
      ['用最大似然挑父节点', '只升不降，会选最复杂的图；要用 BIC 或 Bayesian score（p19）'],
      ['自由参数 $r_1q_1$', '每列和为 1，是 $(r_1-1)q_1$（p20）'],
      ['每张 CPT 一个 Dirichlet', '每一列一个（p26）'],
      ['分数可分解，各节点挑最好的父节点就行', '拼起来可能有环；无环是全局约束（p30）'],
    ],
    errata: [
      'p16–p17 没写父节点配置的编号规则，也没给 $r_2,r_3$。从 p17 的标注（$(2,1)\\to j=2$，$(1,1)\\to j=1$，$(2,2)\\to j=4$）反推是 $x_2$ 变得最快，$r_2=2$。p28 的 $\\hat n_{1j}$ 没有定义（讲者：配置 $j$ 出现的总行数）。p33 的学出的图里，4 与 24、16 与 18 之间画着两个方向的箭头，DAG 不可能同时有两个方向，课件没有解释。',
    ],
    types: ['T07'],
    quiz: [
      { q: '$A\\to B\\to C$ 和 $A\\to B\\leftarrow C$ 等价吗？', type: 'show', answerText: '不等价：骨架相同，但后者在 $B$ 有 immoral v 结构（$A,C$ 不相连），前者没有。链声明 $A\\perp C\\mid B$，v 结构声明 $A\\perp C$。' },
      { q: '$x_1$ 二元，父节点 $x_2$（2 值）和 $x_3$（3 值），$T=6$。BIC 的惩罚 $\\frac{(r_1-1)q_1}{2}\\ln T$ 是多少？（$\\ln6=1.792$）', type: 'num', answer: 5.375, tol: 0.01,
        explain: '$q_1=2\\times3=6$，自由参数 $(2-1)\\times6=6$ 个，惩罚 $\\frac62\\times1.792=5.375$。' },
      { q: '分数可分解，为什么找最高分的 DAG 仍然很难？', options: ['局部分数要积分', '各节点的父节点合起来必须无环（全局约束）', '等价图分数不同'], answer: 1,
        explain: 'L23 p30：局部最优的父节点选择拼起来可能有环，所以要在无环图里搜索；这是计算上很难（NP-hard）的问题。' },
    ],
  }));
})(window);
