/* 必会送分题: the question types that are near-certain in the exam, one page.
 * Basis: the 2026 practice paper (set by this year's lecturers; every one of its questions is a type below)
 * plus the frequency over 7 past papers (route page table, reference/PASTPAPER_MAP.md).
 * SML.mustKnow is shared with the printable handout (js/ui/outline.js); steps are condensed from the T-pages
 * (keep them in sync when a T-page's steps change). Section A answers are pulled from the chapters' examQ by src
 * (examqPick, data/tools.js), so they live in one place. */
(function (root) {
  'use strict';
  const T = String.raw;
  const SML = root.SML;

  // one entry per type: n, title, card (card title if not the part before '：'), q (2026 practice question · marks), freq (past papers), page (T-page),
  // look (what the question looks like), steps, note (optional), go ([label, href] practice links)
  SML.mustKnow = [
    { n: '①', title: 'VC 维：dichotomy 表（+ 函数族）', short: 'VC 表', q: 'Q3 · 8 分', freq: '2020 年起每份都有', page: 'T01',
      look: T`给一张 0/1 表，每列对应一个数据点，每行是一个分类器在这些点上的输出，即一种标记组合（dichotomy）。如果某个点集的所有 0/1 标记组合都能由表中的某行实现，就说这个点集被打散（shattered）；VC 维就是能被打散的点集的最大点数。题目要求求 VC 维，并写出一个达到该点数的被打散点集。2022、2023 年同一大题的 (b)(c) 接着问"给一个用公式定义的分类器族（矩形、阈值函数），求 VC 维"。`,
      steps: [
        T`去掉重复的整行，剩 $m$ 行；$k$ 表示正在尝试的点集大小。打散 $k$ 个点需要 $2^k$ 种组合，而这张表最多提供 $m$ 种，所以 $2^k\le m$，即 $k\le\lfloor\log_2m\rfloor$。这里 $\lfloor a\rfloor$ 表示不超过 $a$ 的最大整数；从这个上界开始试 $k$。`,
        T`在上一步去掉重复整行后的表里按列预筛：要进大小为 $k$ 的 shattered 集，那一列至少要有 $2^{k-1}$ 个 0 和 $2^{k-1}$ 个 1。因为全部 $2^k$ 种组合中，每个点恰有一半标为 0、一半标为 1。这只是必要条件，通过预筛后仍要检查组合是否齐全。`,
        T`对候选的 $k$ 个点：只看这几列，去重，数组合是不是凑齐了 $2^k$ 种。`,
        T`找到一个 $k$ 元 shattered 集，并且所有 $k+1$ 元集合都不行，就是 $\mathrm{VC}=k$。如果 $k$ 元子集**一个都**打不散，就把 $k$ 减 1 再查，不能直接拿上界 $\lfloor\log_2m\rfloor$ 当答案。`,
        T`卷面写：VC 值、shattered 集、列出 $2^k$ 种组合、一句话说明更大的为什么不行。`,
      ],
      note: T`函数族题没有现成的表：先选 $k$ 个点，证明它们的全部 $2^k$ 种标记都能由族内某个分类器实现，得到 VC 维至少为 $k$；再证明任意 $k+1$ 个点总有一种标记无法实现，得到 VC 维至多为 $k$。上下界一致，才能写 VC 维为 $k$。`,
      go: [['步骤', '#/T01/steps'], ['真题全解', '#/T01/past'], ['函数族 VC', '#/T01/family'], ['随机练习', '#/T01/practice']] },
    { n: '②', title: 'UCB：算 Q 值、选臂', short: 'UCB', q: 'Q2 · 6 分', freq: '2021、2022、2026 有 bandit 题', page: 'T02',
      look: T`多臂老虎机（bandit）题中，一个「臂」就是一个可选动作，「拉臂」就是选这个动作一次。题目给每个臂被拉的次数和奖励总和，问 UCB（置信上界）策略下一轮选哪个臂；它会把平均奖励与探索奖励相加后比较。`,
      steps: [
        T`$t=\sum_iN_{t-1}(i)+1$：$t$ 是下一轮的编号，$i$ 是臂的编号，$N_{t-1}(i)$ 是前 $t-1$ 轮中臂 $i$ 被选的次数，$\sum_i$ 表示对所有臂求和。也就是把所有臂已被拉的次数相加，再加 1。`,
        T`每个臂的均值 $\hat\mu=$ 奖励 ÷ 次数。`,
        T`探索奖励（bonus）$=\sqrt{2\ln t/N}$；这里 $N=N_{t-1}(i)$，是正在计算的这个臂已被拉的次数，不是所有臂的总次数。$\ln$ 是自然对数；代入题目给的 $\ln t$，根号内的数通常凑成完全平方，不用计算器。`,
        T`$Q=\hat\mu+\text{bonus}$，列成表。`,
        T`选 $Q$ 最大的臂，**写一句为什么**（通常是：均值不是最高，但拉得少、bonus 大）。`,
      ],
      go: [['步骤', '#/T02/steps'], ['真题全解', '#/T02/past'], ['随机练习', '#/T02/practice']] },
    { n: '③', title: 'CNN 参数个数 / 输出尺寸', short: 'CNN 参数', q: 'Q1(d) · 3 分', freq: '2019 年起几乎每份', page: 'T03',
      look: T`给一张卷积神经网络（CNN）图（或一串层的描述），问参数个数，或者问某层的输出尺寸。`,
      steps: [
        T`从下往上，数出每层的单元数。`,
        T`卷积核（filter）的大小用 $K$ 表示：一维时是长度，二维方形核时是边长。一维单输入通道时，看**一个**输出单元连了几个相邻输入位置来确定 $K$。例如，已知输入长度为 7、每个输出单元连 3 个相邻输入位置、步长为 1 且无填充，则 $K=3$，输出长度为 $7-3+1=5$。不要把输出单元数 5 当成 $K$。`,
        T`卷积层**权重共享**：同一个卷积核在各位置重复使用同一组权重，不按输出位置重复计数。1D（一维、单输入通道、单个卷积核）权重数 $=K$；2D（二维）中，$C_{in}$ 是输入通道数，$C_{out}$ 是卷积核个数，也就是输出通道数，每个核的空间大小为 $K\times K$，权重数 $=C_{out}\times C_{in}\times K^2$。若计入 bias（偏置），每个卷积核再加 1 个参数：二维共加 $C_{out}$ 个，上述一维单核情况加 1 个。`,
        T`全连接层：两层单元数相乘（加 bias 再加输出单元数）。pooling（池化，例如在局部窗口取最大值或平均值）没有可训练参数。`,
        T`输出尺寸（每个空间方向分别算）：$\lfloor(n+2p-k)/s\rfloor+1$。$n$ 是该方向的输入长度，$p$ 是每侧的填充长度（padding），$k=K$ 是该方向的卷积核长度，$s$ 是步长（stride）；$\lfloor\cdot\rfloor$ 表示向下取整。若问总参数数，先看清题目算不算 bias（偏置），逐层算参数数再相加；不要把各层的输出尺寸加起来。2026 卷（7 个输入 → 卷积层 5 个单元 → 全连接 4 个 → 全连接 5 个，不算 bias）：卷积 3 + 全连接 $5\times4=20$ + 全连接 $4\times5=20$，共 $43$。`,
      ],
      go: [['读图步骤', '#/T03/steps'], ['尺寸与感受野', '#/T03/size-rf'], ['随机练习', '#/T03/practice']] },
    { n: '④', title: 'SVM：看图找 support vector', card: 'SVM 找 support vector', short: 'SVM 找 SV', q: 'Q1(c) · 3 分', freq: '6/7 有 SVM 题', page: 'T04',
      look: T`给一张图，上面有两类点和硬间隔支持向量机（hard-margin SVM）的边界；硬间隔指不允许分错或侵入边界两侧的间隔带。问哪些点是支持向量（support vector），也就是两类中各自离最优边界最近的点。`,
      steps: [
        T`确认边界（题目给了就直接用）。`,
        T`算每个点到边界的**垂直**距离；边界是竖线 $x=c$ 时，$c$ 是边界的横坐标，$x_i$ 是第 $i$ 个点的横坐标，距离就是 $|x_i-c|$。`,
        T`两类各自离边界最近的点就是 support vector；最近的点有几个并列，就全都是。`,
        T`检查：hard margin 的最优解，两侧最近距离相等。`,
      ],
      note: T`常跟着考概念：函数间隔（functional margin）是类别标签（取 $+1$ 或 $-1$）与分类器打分的乘积，不是实际距离。把分类器的所有权重和偏置同乘一个正数，边界不变；SVM 据此选择尺度，把最近点的函数间隔规定为 1。欧氏距离还要除以权重向量 $\mathbf w$ 的长度 $\|\mathbf w\|$，所以支持向量到边界的距离是 $1/\|\mathbf w\|$，不一定是 1。`,
      go: [['看图找 SV', '#/T04/read'], ['概念简答', '#/T04/concepts']] },
    { n: '⑤', title: 'D-separation：$X\\perp Y\\mid S$ 成立吗', short: 'D-separation', q: 'Q4 · 8 分', freq: '6/7', page: 'T05',
      look: T`给一个贝叶斯网络（Bayesian network，节点表示随机变量、有向边表示依赖关系），用 D-separation（D-分离，即按图检查条件独立）判断 $X\perp Y\mid S$ 是否成立。这里 $X$、$Y$ 是要判断的两个变量或变量集，$S$ 是已知取值的条件变量集；整个式子表示「给定 $S$ 后，$X$ 与 $Y$ 条件独立」。`,
      steps: [
        T`列出所有有向边。`,
        T`画祖先图：只留 $X$、$Y$、$S$ 中的节点和它们的**全部祖先**。祖先指能沿箭头一路走到这些节点的节点；从这些节点沿入边反向一直追溯，不只找直接父节点。保留这些节点之间原有的边。`,
        T`Moralize：有共同孩子的父节点两两连边，再去掉所有箭头。`,
        T`删掉 $S$ 里的节点和它们的边（$S$ 指竖线右边的条件集；2026 卷里恰好有个节点也叫 $S$，它是被判断的对象，不能删）。`,
        T`$X$、$Y$ 不再连通就**成立**；还连通就**不成立**，并写出那条路径。`,
      ],
      note: T`**每一步都写在卷面上**，能拿步骤分。最常见的错：先删 $S$ 再 moralize，会把答案做反。`,
      go: [['四步法', '#/T05/method'], ['真题全解', '#/T05/past'], ['Workshop 12', '#/T05/ws12'], ['随机练习', '#/T05/practice']] },
    { n: '⑥', title: '消元顺序 → junction tree 的团', short: '消元找团', q: 'Q5 · 8 分', freq: '2021 年起每份真题', page: 'T06',
      look: T`给一个图和一个消元顺序，问团树（junction tree）有哪些团。团是图中任意两点之间都有边的点集；团树把消元后得到的极大团作为树的节点，极大团指不能再被更大的团包含的团。有时还问最大团有几个变量、计算复杂度多少。`,
      steps: [
        T`列出所有边。给的是有向图（贝叶斯网络，BN），就先道德化（moralize）：把每个孩子的所有父节点两两连边，再去掉全部箭头，得到无向图；本来就是无向图则直接用。`,
        T`按给定顺序消元。每次先找待删点的当前邻居（与它直接有边、尚未删除的点），把这些邻居中原来没边的每一对连起来，新增的边叫填充边（fill-in）；记下「待删点 + 当前全部邻居」这个团，最后删掉该点及其相连的边。每消一个点写一行表：被删的点 | 当前邻居 | 新加的 fill-in 边 | 记下的团（这个点 + 它的邻居）。邻居要按**当前**的图算，包括前面加进来的 fill-in 边。`,
        T`去掉被别的团包含的团，剩下的就是 junction tree 的团。`,
        T`问 junction tree 时再连成树：把每个团当作一个树节点，每对团之间先列一条候选边，边权等于两团共享变量的个数。按边权从大到小选边，遇到会形成回路的边就跳过，直到所有团连通；这就是最大权生成树。边权并列时可任选不成环的边。每条树边的 separator（分隔集）就是两端团的交集，要写出共享变量的名字。`,
      ],
      note: T`若问复杂度：最大团含 $k$ 个变量、每个变量二元时，消元一步最多要处理 $2^k$ 种取值组合；共 $n$ 个变量，整体是 $O(n\,2^k)$，随最大团大小指数增长。所以好的消元顺序要让最大团尽量小。`,
      go: [['步骤', '#/T06/steps'], ['真题全解', '#/T06/past'], ['有向图版', '#/T06/directed'], ['随机练习', '#/T06/practice']] },
    { n: '⑦', title: 'PGM 建模、CPT 个数、MLE 数数', short: 'PGM 设计', q: 'Q6 · 10 分', freq: '6/7', page: 'T07',
      look: T`给一段故事（山火警报、学生成绩、流感），要你画图、数参数、填表、说明怎么用模型做决定。这是概率图模型（PGM）建模题：用节点表示随机变量，用边表示变量之间的依赖关系。`,
      steps: [
        T`定变量，按"原因 → 结果"画有向边。`,
        T`写因子分解：$P(x_1,\dots,x_n)=\prod_iP(x_i\mid\text{parents}_i)$。这里 $n$ 是节点数，$x_i$ 是第 $i$ 个变量的一种取值，$\text{parents}_i$ 指它所有父节点的取值；$\prod_i$ 表示把各节点对应的概率项相乘。没有父节点时，该项写成 $P(x_i)$。`,
        T`数 CPT（条件概率表）：每个节点一张表。设该节点有 $r$ 种取值，父节点共有 $q$ 种取值组合；把每种父节点组合当作一列、自身取值当作行，则表有 $rq$ 项概率。每列的概率和为 1，所以每列只需 $r-1$ 个自由参数，该节点共需 $q(r-1)$ 个。没有父节点时 $q=1$；全图的计数逐节点相加。`,
        T`填表：确定性的关系（例如"任一传感器报警就疏散"）直接填 0/1；需要从数据学的，用最大似然估计（MLE）数数据行：$\hat P(x\mid u)=\#(x,u)/\#(u)$。这里 $x$ 是当前节点的一种取值，$u$ 是其父节点的一种取值组合；$\#(x,u)$ 是两者同时出现的数据行数，$\#(u)$ 是父节点取值为 $u$ 的数据行数，$\hat P$ 表示据此估计的概率。`,
        T`用模型做决定：令 $A$ 为要判断的事件，$E$ 为已观察到的证据。用上面的因子分解计算 $P(A,E)$ 和 $P(E)$，对未观察且不关心的变量遍历取值并求和。再算后验概率 $P(A\mid E)=P(A,E)/P(E)$；超过题目给定的行动阈值就报警（或执行动作），用一两句英文写清楚比较结果。`,
      ],
      note: T`**山火题 2025 年和 2026 年都出现了**，务必背熟。`,
      go: [['基础', '#/T07/basics'], ['数 CPT', '#/T07/count'], ['山火题', '#/T07/bushfire'], ['MLE', '#/T07/mle'], ['随机练习', '#/T07/practice']] },
  ];
  // Section A short answers that recur across papers: [chapter, src prefix] into the chapters' examQ
  SML.mustAnswers = [
    ['c10', '2026 practice Q1a'], ['c08', '2026 practice Q1b'], ['c54', '2025 practice Q1(c)'], ['c53', '2025 practice Q1(d)(e)'],
    ['c26', '2016 S2 Q1.10'], ['c26', '2021 Q2'], ['c28', '2022 S1 Q1(f)'],
    ['c50', '2017 S2 Q5(b)'], ['c50', '2021 Q10'], ['c11', '2017 S2 Q2(c)'],
  ];

  const card = (m) => ({
    t: 'good', title: m.n + ' ' + (m.card || m.title.replace(/：.*$/, '')) + '（2026 ' + m.q.replace(' · ', '，') + '）',
    md: '**题目长什么样**：' + m.look + '\n\n' + m.steps.map((s, i) => (i + 1) + '. ' + s).join('\n') +
      (m.note ? '\n\n' + m.note : '') + '\n\n**去练**：' + m.go.map(([t, h]) => '[' + t + '](' + h + ')').join(' → '),
  });

  SML.content.add({
    id: 'must',
    title: '必会送分题：一定要会做的 8 类',
    lead: '2026 practice 卷是今年的老师出的，它的每一道题都属于下面 8 类，往年卷也几乎每份都有。这 8 类覆盖了 practice 卷的全部分数，步骤固定，练熟就是送分。**时间再紧，也先把这一页练到"每类连续 3 题全对"。**',
    blocks: [
      { t: 'h2', text: '1. 一页总表', id: 'table' },
      {
        t: 'table', head: ['#', '题型', '2026 practice', '往年出现（6/7 表示统计的 7 份中有 6 份出现）', '去哪练'],
        rows: SML.mustKnow.map((m) => [m.n, m.title, m.q, m.freq, '[' + m.page.replace('T0', 'T') + '](#/' + m.page + ')'])
          .concat([['⑧', 'Section A 必背简答（英文）', 'Q1(a)(b) · 4 分', 'Bayesian 概念 7/7', '[下面第 3 节](#/must/sa)']]),
      },
      { t: 'note', title: '怎么用', md: '每类先读下面的"几步做完"，再去对应题型页做"真题全解"，最后做"随机练习"，直到连续 3 题全对，就在本页底部点"标记为已掌握"。考前一天每类各做 1 道热身。' },

      { t: 'h2', text: '2. 每类：长什么样、几步做完', id: 'steps' },
    ].concat(SML.mustKnow.map(card), [
      { t: 'h2', text: '3. Section A 必背简答（英文答案背下来）', id: 'sa' },
      '这些是各份卷子反复出现的简答题。先读题，用英文说出（或写下）答案，再点"看答案"核对。同样的题也在各章顶部的"Key points in English"框里。',
      { t: 'examqPick', picks: SML.mustAnswers },

      { t: 'h2', text: '4. 常考，但 2026 practice 卷里没有', id: 'next' },
      {
        t: 'table', head: ['题型', '往年出现', '去哪练'], rows: [
          ['Beta–Binomial（贝塔先验 + 二项观测模型）后验更新、MAP（最大后验估计）与后验均值', 'Bayesian 7/7（多为简答）', '[T9](#/T09/beta)'],
          ['Kernel（核函数）合法性证明、XOR（异或：两个二值输入不同时为 1、相同时为 0）特征映射', '5/7', '[T8](#/T08)'],
          ['MRF（马尔可夫随机场，即无向概率图模型）：用势表（局部变量各取值组合的非负权重表）算归一化常数 $Z$ 和边缘概率', '考过 3 次；2024 S2 真题考生回忆里也有', '[T6 第 5 节](#/T06/mrf-z)'],
          ['Backprop（反向传播，按链式法则由输出层往输入层逐层传递梯度）推导、穿过 max-pool（最大池化，在局部窗口取最大值）求梯度', '4/7（神经网络基础）', '[T10](#/T10)'],
        ],
      },
      { t: 'note', md: '以上 4 类做完前面 8 类再练。各题型的考频统计见 [复习路线](#/route) 的"历年考了什么"。' },
    ]),
  });
})(window);
