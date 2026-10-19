/* W4 · L07 VC 维 + L08 支持向量机 — chapters c22–c27 and review r04. */
(function (root) {
  'use strict';
  const SML = root.SML;
  const T = String.raw;
  const add = (c) => SML.content.add(SML.chapter(c));

  /* =====================================================================
   * c22 · Dichotomy、growth function、decision stumps（L07 p1–p21）
   * ===================================================================== */
  add({
    id: 'c22', week: 'W4', lec: 'L07', pages: 'L07 p1–p21', star: 2,
    keyEn: [
      T`A dichotomy is the label vector $(f(x_1),\dots,f(x_n))\in\{-1,+1\}^n$ a classifier gives to $n$ points; the growth function $S_\mathcal F(n)=\sup_{|\mathcal X|=n}|\mathcal F(\mathcal X)|\le2^n$ is the maximum number of distinct dichotomies.`,
      T`An infinite class such as decision stumps (any real threshold $\beta$, two directions) still gives finitely many dichotomies: $S(n)=2(n+1)-2=2n$.`,
      T`Best stump: sort the points, try every midpoint between neighbouring points (plus the two ends) in both directions, and count the training errors.`,
      T`Growth-function bound (replacing $\log|\mathcal F|$): $R[\hat f_D]\le\hat R_D[\hat f_D]+\sqrt{8\,\frac{\log S_\mathcal F(2n)+\log(4/\delta)}{n}}$; it never shrinks if $S_\mathcal F(n)=2^n$, so growth must be polynomial.`,
    ],
    keyZh: [
      T`二分（dichotomy）= 一个分类器给 $n$ 个点打出的一串 $\pm1$ 标签；增长函数（growth function）$S_\mathcal F(n)$ = 挑最有利的 $n$ 个点时最多能做出几种不同的标签串，不超过 $2^n$。`,
      T`决策树桩（decision stump）的阈值可取任意实数，分类器有无穷多个，但在 $n$ 个点上只有 $2n$ 种标签：每个方向 $n+1$ 种，"全 $+$"和"全 $-$"两个方向各算了一次，要减 2。`,
      T`找最佳 stump：先把点排序，阈值只需试相邻两点的中点（再加最左、最右两端），两个方向都试，数训练错误，取最少的。`,
      T`泛化界：把有限类界里的 $\log|\mathcal F|$ 换成 $\log S_\mathcal F(2n)$。若 $S_\mathcal F(n)=2^n$，惩罚项不随 $n$ 变小、学不到东西，所以增长函数必须按多项式增长。`,
    ],
    title: 'Dichotomy、growth function、stumps', en: 'Decision stumps, dichotomies, growth function',
    summary: '无限的模型类（如阈值可取任意实数的 **decision stump（决策树桩）**）在 $n$ 个具体的点上只能产生有限多种标签组合。这些组合叫 **dichotomy（二分）**，最多能产生多少种叫 **growth function（增长函数）** $S_\\mathcal F(n)$。它取代 $|\\mathcal F|$ 成为新的复杂度度量。',
    prereq: ['c21'],
    symbols: [
      [T`$\beta$`, T`stump 的阈值（任意实数）`],
      [T`$\mathcal X=\{x_1,\dots,x_n\}$`, T`一组具体的样本点`],
      [T`$\mathcal F(\mathcal X)$`, T`$\mathcal F$ 中所有分类器在 $\mathcal X$ 上产生的**不同**标签向量的集合`],
      [T`$S_\mathcal F(n)$`, T`growth function：所有大小为 $n$ 的点集上 $|\mathcal F(\mathcal X)|$ 的最大值`],
      [T`$\sup$`, T`上确界，这里可以当作"最大值"`],
      [T`$2^n$`, T`$n$ 个点的所有 $\pm1$ 标签组合个数`],
      [T`$\mathcal F$`, T`模型类：所有候选分类器的集合（第 20 章）`],
      [T`$R[f]$, $\hat R_D[f]$`, T`真实风险、训练集 $D$ 上的经验风险（第 20 章）`],
      [T`$\hat f_D$`, T`ERM 在训练集 $D$ 上选出的分类器`],
      [T`$n$, $\delta$`, T`训练样本数；失败概率（界以至少 $1-\delta$ 的概率成立，第 21 章）`],
      [T`$\log$`, T`自然对数 $\ln$（考试会给 $\ln$ 的数值）`],
    ],
    goals: [
      '解释为什么有限类的界对无限类失效',
      '用 L07 p11–p15 的数据手动找最佳 stump（试所有相邻中点、两个方向）',
      '定义 dichotomy 和 growth function，并说明 $S_\\mathcal F(n)\\le2^n$、$\\le|\\mathcal F|$',
      '推出 stumps 的 $S(n)=2n$，并写出 growth-function 泛化界（L07 p20）',
    ],
    types: ['T01'],
    notExam: 'Growth-function 定理的证明不在范围内（L07 p20–p21），只需会读、会代入。',
    what: [
      { t: 'h3', text: '① 问题：分类器有无穷多个时怎么办（L07 p8–p9）' },
      T`**问题**（L07 p8–p9）：$f(\bx)=\sgn(w_1x_1+w_2x_2)$，$w$ 取所有实数——分类器有无穷多个，$\log|\mathcal F|=\infty$，c21 的界没用了。但 L07 的关键观察：**在给定的 $n$ 个点上，分类器再多，能产生的标签组合也有限**（最多 $2^n$）。`,
      { t: 'h3', text: '② 最简单的无限类：decision stump（L07 p11）' },
      T`两个实数权重的线性分类器，"能分出几种标签"不好手算。先拿一个最简单的无限类练手：只看**一个**数 $x$ 和一个阈值，阈值左边一类、右边另一类（方向也可以反过来）。阈值可以是任意实数，所以分类器有无穷多个；但下面会看到，在排好序的点上，阈值落在同一对相邻点之间，给出的标签就完全一样。`,
      T`**Decision stump（决策树桩）**（L07 p11–p15）：只用一个连续特征 $x$ 和一个阈值 $\beta$ 的分类器，两个方向：`,
      { t: 'math', tex: T`f(x)=\sgn(x-\beta)=\begin{cases}+1,&x>\beta\\-1,&x\le\beta\end{cases}\qquad\text{或}\qquad f(x)=\sgn(\beta-x)=\begin{cases}+1,&x<\beta\\-1,&x\ge\beta\end{cases}` },
      T`$\beta$ 可以是任意实数，所以 stump 类是**不可数无限**的（L07 p15）。`,
      { t: 'h3', text: '③ 课件例子：在 6 个点上找最佳 stump（L07 p11–p15）' },
      T`6 个样本 $(x,y)$：$(0,+1),(4,-1),(-2,+1),(1,+1),(-3,-1),(2,-1)$。`,
      { t: 'steps', items: [
        T`**排序**：$-3(-),\ -2(+),\ 0(+),\ 1(+),\ 2(-),\ 4(-)$。`,
        T`**候选阈值** = 相邻中点：$-2.5,\ -1,\ 0.5,\ 1.5,\ 3$。`,
        T`**两个方向都数错误**：$\sgn(x-\beta)$ 的错误数 $2,3,4,5,4$；$\sgn(\beta-x)$ 的错误数 $4,3,2,1,2$。`,
        T`**最佳**：$f(x)=\sgn(1.5-x)$，只错 1 个（$x=-3$ 被判 $+1$）。`,
      ] },
      { t: 'h3', text: '④ 关键观察：分类器无限，"行为"有限（L07 p16–p18）' },
      T`**分类器无限，"行为"有限。** 在 6 个排好序的点上，stump 的阈值放在两个相邻点之间的哪里都一样——只有"在哪两个点之间"这件事重要。所以只需要试**相邻中点**（L07 p12）。`,
      T`**Dichotomy（二分）**（L07 p17）：一个分类器在 $\mathcal X=\{x_1,\dots,x_n\}$ 上给出的标签向量 $(f(x_1),\dots,f(x_n))\in\{-1,+1\}^n$。$\mathcal F(\mathcal X)$ = 所有**不同**的 dichotomy。`,
      T`**Growth function（增长函数）**（L07 p18）：`,
      { t: 'math', tex: T`S_\mathcal F(n)=\sup_{|\mathcal X|=n}|\mathcal F(\mathcal X)|\le2^n,\qquad\text{有限类时还有 }S_\mathcal F(n)\le|\mathcal F|` },
      T`**为什么 stump 是 $2n$？** 一个方向：阈值从最左移到最右，有 $n+1$ 个位置，产生"左边全 −、右边全 +"的 $n+1$ 种模式；另一个方向也是 $n+1$ 种。两组里"全 −"和"全 +"各重复一次，所以 $2(n+1)-2=2n$（L07 p16、p19）。`,
      { t: 'h3', text: '⑤ 用 growth function 代替 $|\\mathcal F|$ 的泛化界（L07 p20）' },
      T`c21 的惩罚项里是 $\log|\mathcal F|$，分类器无穷多时它是无穷大。growth function 数的是"$n$ 个点上**实际能出现**几种标签"，永远有限，所以拿它替换 $|\mathcal F|$。证明不考，考试直接代入下面的式子。注意式子里是 $S_\mathcal F(2n)$ 而不是 $S_\mathcal F(n)$——$2n$、前面的 8 和 $4/\delta$ 都是证明过程中放宽出来的常数，不用自己推。`,
      T`对 $n$ 个 i.i.d. 样本、0-1 loss，以至少 $1-\delta$ 的概率（对 ERM 选出的 $\hat f_D$）：`,
      { t: 'math', tex: T`R[\hat f_D]\le\hat R_D[\hat f_D]+\sqrt{8\,\frac{\log S_\mathcal F(2n)+\log(4/\delta)}{n}}` },
      T`和有限类的界同形状：$\log|\mathcal F|$ 换成 $\log S_\mathcal F(2n)$，常数变大（8 乘整个分数）。**关键**：如果 $S_\mathcal F(n)=2^n$（指数增长），$\frac{\log S(2n)}{n}=2\log2$ 不随 $n$ 下降——界永远不会变小，学不到东西（L07 p20）。所以需要 growth function 是**多项式**增长的——这正是 VC 维（c23–c24）保证的。`,
    ],
    why: [
      T`growth function 是从"有限类"走向"VC 维"（c23，往年每年必考的 T1 计算题）的桥梁。dichotomy 表就是 T1 题目给的那张 0/1 表——每一行是一个 dichotomy。`,
    ],
    intuition: [
      { t: 'think', q: T`3 个点排成一行，stump 能产生全部 $2^3=8$ 种标签吗？缺哪几种？`, a: T`$S(3)=6<8$，缺 $(+1,-1,+1)$ 和 $(-1,+1,-1)$——"中间和两边不同"的交替模式，一个阈值切不出来（L07 p24）。` },
      { t: 'story', title: 'Stump 的名字', md: '"decision stump" 就是只有一层的决策树——像被砍得只剩树桩。它单独很弱，但在 1990 年代 Freund 和 Schapire 提出的 AdaBoost 里，把许多 stump 加权投票组合起来（boosting：一个接一个地训练弱分类器，每次更关注前面分错的样本）能得到很强的分类器，所以它成了 boosting 最常用的"弱学习器"。（不考）' },
    ],
    math: [
      T`**数 dichotomy 的通用做法**：把 $n$ 个点排序，阈值只有"落在哪两个相邻点之间"这 $n+1$ 种本质不同的位置（含最左、最右）；每个位置两个方向，再去掉重复的（全 $+$、全 $-$ 各被两个方向各算一次）⇒ $2(n+1)-2=2n$。`,
    ],
    fx: [
      {
        title: 'Growth function', tex: T`S_\mathcal F(n)=\htmlClass{fx-p1}{\sup_{|\mathcal X|=n}}\,\big|\htmlClass{fx-p2}{\mathcal F(\mathcal X)}\big|\ \htmlClass{fx-p3}{\le2^n}`,
        parts: [
          { label: 'sup', note: '对所有大小为 $n$ 的点集取**最大**：挑最有利的点的位置。' },
          { label: 'F(X)', note: '在这组点上实际出现的**不同**标签向量（重复的只算一次）。' },
          { label: '≤ 2ⁿ', note: '$n$ 个二元标签最多 $2^n$ 种组合，不管 $\\mathcal F$ 多大。' },
        ],
      },
    ],
    example: [
      { t: 'h3', text: '数 dichotomy' },
      T`4 个点 $x_1<x_2<x_3<x_4$ 上的 stumps：方向 $\sgn(x-\beta)$ 给 $----,\ ---+,\ --++,\ -+++,\ ++++$（5 种）；方向 $\sgn(\beta-x)$ 给 $++++,\ +++-,\ ++--,\ +---,\ ----$（5 种）。去掉重复的 $----$、$++++$：共 $8=2\times4$。`,
      { t: 'fade', title: '分步练习：数 growth function', plan: ['列出阈值能放的位置（$n+1$ 个）', '每个方向写出产生的模式', '合并、去重、计数'], items: [
        { md: T`单向阈值类 $f(x)=\sgn(x-\beta)$（只有一个方向），$n=3$。`, steps: [
          { md: '位置：最左、1-2 之间、2-3 之间、最右，共 4 个' },
          { md: '模式 $+++,\\ -++,\\ --+,\\ ---$' },
          { md: '$S(3)=4=n+1$' },
        ] },
        { md: T`Stumps（两个方向），$n=5$。`, steps: [
          { ask: '每个方向产生几种模式？', answer: 6, show: '$n+1=6$' },
          { ask: '去重后 $S(5)=?$', answer: 10, show: '$2\\times6-2=10=2n$' },
        ] },
        { md: T`（延伸）**interval classifier（区间分类器）**：$[a,b]$ 内为 $+1$、外面为 $-1$，$n=3$ 个点在一行上。能产生的模式就是"连续的一段为 +"。`, steps: [
          { ask: '"连续一段为 +" 的非空模式有几种？', answer: 6, show: '一段 + 由起点和终点决定：长度 1 的段 3 种（起点 = 终点），长度 ≥2 的段要从 3 个点里选 2 个作两端 $\\binom32=3$ 种，共 6 种：$+--,-+-,--+,++-,-++,+++$' },
          { ask: '加上全 − 后 $S(3)=?$', answer: 7, show: '$6+1=7$，只缺 $+-+$' },
          { ask: '$2^3$ 全部做到了吗？（是填 1，否填 0）', answer: 0, show: '没有：$7<8$' },
        ] },
      ] },
    ],
    viz: [
      { id: 'stump-explorer', how: '用滑块选阈值的档位（相邻两点之间各一档，外加两端的常数分类器），用下拉框选方向（右侧 +1 / 右侧 −1），读这个 stump 在 L07 的 6 个点上错几个；下方的表列出所有不同的 dichotomy（应为 $2n=12$ 种）。',
        try: '把阈值从最左拖到最右，数一数出现过多少种不同的标签模式；切换方向再数一遍；合起来应该是 $2n$。' },
      { id: 'growth-fn', how: '选一个分类器类型和点数 $m$，列出所有能实现的标签模式（chips），并和 $2^m$ 比较（读数里的 Sauer–Shelah 上界第 24 章再讲）。',
        try: '① 选 decision stump，$m$ 从 1 拉到 8：$S(m)=2m$；$m\\le2$ 时等于 $2^m$（全部做到），$m=3$ 开始做不到。② 选 interval：$S(m)$ 比 stump 多，但仍远小于 $2^m$。' },
    ],
    compare: [
      { t: 'table', head: ['', '有限类（c21）', '无限类（本章起）'], rows: [
        ['复杂度度量', '$|\\mathcal F|$', '$S_\\mathcal F(n)$（之后是 VC 维）'],
        ['惩罚里的项', '$\\log|\\mathcal F|$', '$\\log S_\\mathcal F(2n)$'],
        ['例子', 'L06 的 4 / 8 条规则', 'stumps、实数权重的线性分类器'],
      ] },
    ],
    pitfalls: [
      ['stump 类是有限的', '$\\beta$ 取任意实数，类是不可数无限的；只是在 $n$ 个点上的 dichotomy 有限。'],
      ['要试所有实数阈值', '只需试相邻中点（加上最左、最右）。'],
      ['$S_\\mathcal F(n)$ 是在**某一组**给定点上的计数', '是对所有大小为 $n$ 的点集取**最大**。'],
      ['只试一个方向', 'stump 有两个方向，都要试（L07 p13–p14）。'],
    ],
    quiz: [
      { type: 'num', q: 'Decision stumps 的 $S(7)=?$', answer: 14, explain: T`要算的是 7 个点上 decision stump（决策树桩）最多能给出几种不同的标签组合。把 7 个点从小到大排好，阈值本质上只有"落在哪两个相邻点之间"这 $7+1=8$ 个位置（含最左、最右）；一个方向给 8 种模式，两个方向共 $2\times8=16$ 种。但"全 $+$"和"全 $-$"两个方向都做得出来，各被算了两次，要减 2：$16-2=14$。**这就是 $S(n)=2n=2\times7=14$**，远小于 $2^7=128$，别把 $2^n$ 当成答案。` },
      { type: 'num', q: 'L07 的 6 个样本里，$\\sgn(x-0.5)$ 错几个？', answer: 4, explain: 'p13 表：阈值 0.5 时错 4 个。' },
      { type: 'mc', q: '为什么 $S_\\mathcal F(n)\\le2^n$ 对任何类都成立？', options: ['因为 $\\mathcal F$ 有限', '因为 $n$ 个二元标签最多 $2^n$ 种组合', '因为 Hoeffding', '因为分类器是线性的'], answer: 1, explain: 'L07 p17–p18。' },
      { type: 'show', q: '（英文）Define a dichotomy and the growth function.', answer: T`A dichotomy is the vector of labels $(f(x_1),\dots,f(x_n))\in\{-1,+1\}^n$ that a classifier $f$ assigns to a set of $n$ points. The growth function $S_{\mathcal F}(n)$ is the maximum, over all sets of $n$ points, of the number of distinct dichotomies that classifiers in $\mathcal F$ can produce; it is at most $2^n$.`, qzh: '给出二分（dichotomy）和增长函数（growth function）的定义。', azh: T`二分（dichotomy）是分类器 $f$ 给一组 $n$ 个点分配的标签向量 $(f(x_1),\dots,f(x_n))\in\{-1,+1\}^n$。增长函数（growth function）$S_{\mathcal F}(n)$ 是：在所有 $n$ 点集合中取最大值的、$\mathcal F$ 中分类器能产生的不同二分的个数；它至多为 $2^n$。` },
    ],
  });

  /* =====================================================================
   * c23 · Shattering 与 VC 维（L07 p22–p29）
   * ===================================================================== */
  add({
    id: 'c23', week: 'W4', lec: 'L07', pages: 'L07 p22–p29', star: 3,
    keyEn: [
      T`A set of $n$ points is shattered by $\mathcal F$ if all $2^n$ labellings are realised; $\mathrm{VC}(\mathcal F)$ is the size of the largest set that $\mathcal F$ can shatter (some set, not every set).`,
      T`From a dichotomy table: upper bound $\mathrm{VC}\le\lfloor\log_2(\#\text{distinct rows})\rfloor$; then restrict to $k$ columns, remove duplicate rows, and check that all $2^k$ patterns appear.`,
      T`At least $2^k$ rows is necessary, not sufficient: always exhibit $k$ columns showing all $2^k$ patterns and state that shattered set (2026/2025 practice Q3: 8 rows, but VC $=2$).`,
      T`Decision stumps: VC $=2$; lines in $\mathbb R^2$: VC $=3$ (no 4 points can be shattered: in convex position the XOR labelling fails; if one point is inside the triangle of the other three, labelling it opposite to them fails); linear classifiers in $\mathbb R^d$: VC $=d+1$.`,
      T`Axis-aligned rectangles in $\mathbb R^2$: VC $=4$. Four points in a diamond are shattered (the bounding box of the positive points contains no negative point); for any 5 points, labelling the leftmost, rightmost, top and bottom points $+$ and another point $-$ is impossible, because any rectangle containing the extremes contains the bounding box of all 5 points.`,
    ],
    keyZh: [
      T`打散（shatter）：$n$ 个点的全部 $2^n$ 种标签都能被 $\mathcal F$ 做出来。VC 维 = 能被打散的最大点集大小；只要存在一组这样的点就算，不要求所有点集。`,
      T`从 dichotomy 表求 VC 维：先用不同行数定上界（$2^k$ 不能超过行数）；再只留选中的 $k$ 列、划掉重复行，看 $2^k$ 种 0/1 组合是否全齐。`,
      T`行数至少 $2^k$ 只是必要条件，不能证明 VC $\ge k$：一定要写出具体哪 $k$ 列凑齐了全部 $2^k$ 种组合。2026/2025 Q3 的表有 8 行，VC 却只有 2。`,
      T`要背的三个值：stump 是 2；平面直线是 3（4 点成凸四边形时做不到对角同色的 XOR；一点在另三点的三角形内时，做不到"内点与外三点异号"）；$\mathbb R^d$ 线性分类器是 $d+1$。`,
      T`轴对齐矩形 VC = 4：菱形 4 点能打散（框住所有 $+$ 点的最小矩形碰不到 $-$ 点）；任何 5 点都不行：四个极值点标 $+$、另一点标 $-$，框住极值点的矩形一定把它也框进去。`,
    ],
    genesis: T`c22 把"无穷多个分类器"换成了"在 $n$ 个点上最多分得出几种标签"，即 growth function $S_\mathcal F(n)$。可它是一整串数（$n=1,2,3,\dots$ 各一个），每个都要单独去算。观察这串数会发现：$n$ 小的时候 $S_\mathcal F(n)=2^n$，什么标签都分得出；一旦在某个 $n$ 上做不到 $2^n$，之后更大的 $n$ 也再做不到（$n+1$ 个点要被打散，其中任意 $n$ 个点得先被打散）。**这个分界点就是 VC 维：用一个数概括模型类有多灵活。** c24 的 Sauer–Shelah 引理再用这一个数给整串 growth function 一个上界。`,
    title: 'Shattering 与 VC 维', en: 'Shattering and the VC dimension',
    summary: '**Shatter（打散）**：一组点的所有 $2^n$ 种标签都能被某个分类器实现。**VC dimension（VC 维）** = 能被 shatter 的最大点集的大小。往年每年都考：给一张 dichotomy 表，求 VC 维并写出一个被 shatter 的点集（T1）。',
    prereq: ['c22'],
    symbols: [
      [T`$\mathrm{VC}(\mathcal F)$`, T`VC 维 $=\max\{n:S_\mathcal F(n)=2^n\}$`],
      [T`$|\mathcal F(\mathcal X)|=2^n$`, T`$\mathcal X$ 被 shatter`],
      [T`0 / 1 或 − / +`, T`题目里两种标签写法等价`],
      [T`$\mathbb R^d$`, T`$d$ 维特征空间`],
    ],
    goals: [
      '定义 shattering 和 VC 维，说清"存在一组点"而不是"所有点"',
      '从 dichotomy 表求 VC 维：上界 → 去列去重 → 找最大 shattered 子集（L07 p29 方法）',
      '说出 stumps 的 VC = 2、$\\mathbb R^2$ 线性分类器 VC = 3、$\\mathbb R^d$ 线性分类器 VC = $d+1$；证明轴对齐矩形 VC = 4（Worksheet 5）',
      '解释为什么 4 个点不能被直线 shatter（XOR）',
    ],
    types: ['T01'],
    what: [
      { t: 'h3', text: '① 问题：怎么用一个数衡量模型类有多\"灵活\"（L07 p22–p23）' },
      T`c22 的 growth function 数的是"$n$ 个点最多能被分出多少种不同的标签"，最多 $2^n$ 种。如果某组点的 $2^n$ 种标签**全都**能被模型类做出来，就说这组点被 **shatter（打散）** 了。**VC 维** = 最多能 shatter 几个点：模型类越灵活，VC 维越大。课件的例子：平面上的直线能 shatter 任意不共线的 3 个点，但没有 4 个点能被 shatter，所以 VC 维 = 3。`,
      { t: 'slide', src: 'L07/p28', caption: '不共线的 3 个点被直线 shatter（8 种标签都能做出来）；共线的 3 个点、或 4 个点做不到。' },
      { t: 'h3', text: '② 把"打散"和"VC 维"说精确（L07 p23–p28）' },
      T`**Shattered（被打散）**（L07 p23）：点集 $\mathcal X$（$|\mathcal X|=n$）能被**所有可能的方式**分类，即 $|\mathcal F(\mathcal X)|=2^n$。`,
      T`**VC dimension（VC 维）**（L07 p23）：`,
      { t: 'math', tex: T`\mathrm{VC}(\mathcal F)=\max\{n:\ S_\mathcal F(n)=2^n\}=\text{能被 }\mathcal F\text{ shatter 的最大点集的大小}` },
      T`要证明 $\mathrm{VC}=d$：① **存在**一组 $d$ 个点能被 shatter；② **任何** $d+1$ 个点都不能被 shatter。`,
      T`**三个例子**（L07 p24–p28）：`,
      { t: 'ul', items: [
        T`**Stumps**：$S(n)=2n$；$2n=2^n$ 的最大解 $n=2$ ⇒ VC = 2。（表：$n=1$：2 = 2；$n=2$：4 = 4；$n=3$：6 < 8。）`,
        T`**$\mathbb R^2$ 中的直线**：3 个不共线的点能分出全部 8 种（p25）⇒ VC ≥ 3。4 个点（四边形）分不出"对角同色"的 XOR 两种，只能 14 种 < 16（p27）⇒ VC = 3。`,
        T`**$\mathbb R^d$ 中的线性分类器**：VC = $d+1$（L07 p33）。`,
      ] },
      { t: 'video', id: 'vc-shatter' },
      { t: 'h3', text: '③ 再练一个：轴对齐矩形，VC = 4（Worksheet 5 Ex2）' },
      T`**矩形分类器**：$f_{abcd}(\bx)=+1$ 当且仅当 $a\le x_1\le b$ 且 $c\le x_2\le d$，即点落在一个边与坐标轴平行的矩形里，否则 $-1$。结论 VC = 4。证明和上面"直线 VC = 3"一样分两步。`,
      T`**VC ≥ 4（存在 4 个点）**：把 4 个点摆成菱形：最左、最右、最上、最下各一个。任给一种标注，取所有 $+$ 点的 bounding box（外接框：包住这些点的最小轴对齐矩形），稍微放大一点。每个点都在自己的方向上"突出"，所以这个框碰不到任何 $-$ 点；全是 $-$ 时把矩形放到远处。16 种标注都做得到。不是任意 4 点都行：正方形的 4 个角就不行，对角两点标 $+$ 时，框住它们的矩形就是整个正方形。`,
      T`**VC < 5（任何 5 个点都不行）**：在 5 个点里取最左、最右、最上、最下的点（最多 4 个）标 $+$，剩下的点里任取一个标 $-$。包含这几个极值点的矩形一定包含它们的外接框，而这个框就是全部 5 个点的外接框，所以也包含那个 $-$ 点。这种标注做不到，任何 5 个点都不能被 shatter。英文答案见 [T13](#/T13/predicted)。`,
      { t: 'html', html: '<div class="graph-row">' +
        '<figure class="graph-fig"><svg class="graph" viewBox="0 0 200 200" role="img" aria-label="菱形四点，一个矩形框住左、上两个正类点">' +
        '<rect class="edge fill" x="27" y="27" width="86" height="86" rx="3"/>' +
        [[40, 100, '+'], [100, 40, '+'], [160, 100, '−'], [100, 160, '−']].map(([x, y, l]) => '<g class="node' + (l === '+' ? ' hl' : '') + '"><circle cx="' + x + '" cy="' + y + '" r="13"/><text x="' + x + '" y="' + y + '">' + l + '</text></g>').join('') +
        '</svg><figcaption>菱形 4 点：任一种标注，框住 + 点的矩形都碰不到 − 点（图为其中一种）。</figcaption></figure>' +
        '<figure class="graph-fig"><svg class="graph" viewBox="0 0 200 200" role="img" aria-label="五个点，框住四个极值点的矩形也框住了中间的负类点">' +
        '<rect class="edge fill" x="17" y="17" width="166" height="166" rx="3"/>' +
        [[30, 100, '+'], [170, 100, '+'], [100, 30, '+'], [100, 170, '+'], [112, 112, '−']].map(([x, y, l]) => '<g class="node' + (l === '+' ? ' hl' : ' q') + '"><circle cx="' + x + '" cy="' + y + '" r="13"/><text x="' + x + '" y="' + y + '">' + l + '</text></g>').join('') +
        '</svg><figcaption>任 5 点：最左、最右、最上、最下标 +，剩下的标 −。框住 4 个 + 的矩形必然也框住 −。</figcaption></figure></div>' },
    ],
    why: [
      T`**T1 是往年最稳定的考点**：2026 Q3、2025 Q3、2021 Q16 都是"给一张 dichotomy 表，求 VC 维并写出一个 shattered set"，8–12 分，方法完全机械。本章把方法讲透，[T1 页](#/T01) 有全部真题解答和交互求解器。`,
      T`理论上，VC 维有限 ⇔ growth function 多项式增长 ⇔ 能泛化（c24）。`,
    ],
    intuition: [
      T`**"存在"不是"所有"。** 共线的 3 个点不能被直线 shatter（只有 6 种：做不到中间点和两边点异号的 $+-+$ 和 $-+-$，L07 p26），但这**不影响** VC ≥ 3——只要**有一组** 3 个点能被 shatter 就行（p25 的不共线三角形）。这是最常见的误解（L07 p23–p28 反复强调）。`,
      T`**VC 维 = 模型的"自由度"。** 直线在平面上有 3 个参数（$w_1,w_2,b$），VC 维正好是 3；$\mathbb R^d$ 中 $d+1$ 个参数，VC = $d+1$。（不是所有模型都这么巧，但这是好的直觉。）`,
      { t: 'think', q: '一张 dichotomy 表有 10 行（全不相同）。VC 维最多可能是多少？为什么？', a: T`$\lfloor\log_2 10\rfloor=3$。要 shatter $k$ 个点至少需要 $2^k$ 个不同的行（限制到这 $k$ 列后），$2^4=16>10$，所以 $k\le3$。这是做 T1 题的第一步"上界"。` },
      { t: 'story', title: 'VC 这两个字母', md: 'VC 是 Vapnik 和 Chervonenkis 两人姓氏的首字母。他们在 1968 年的短文和 1971 年的论文里提出了这个概念，用来回答"经验风险什么时候会一致地收敛到真实风险"。几十年后它成为统计学习理论的基石。' },
    ],
    math: [
      { t: 'h3', text: '从 dichotomy 表求 VC 维（L07 p29 的方法 = 考试方法）' },
      T`L07 p29：4 个点 $x_1..x_4$，表里每行是一个分类器给出的 0/1 标签（共 10 行）：`,
      { t: 'table', cls: 'mono compact', head: ['$x_1$', '$x_2$', '$x_3$', '$x_4$'], rows: ['0000', '0110', '1001', '1101', '0100', '1010', '1111', '0011', '0101', '1110'].map((r) => r.split('')) },
      { t: 'steps', items: [
        T`**上界**：10 行 < $2^4=16$ ⇒ 4 个点不能被 shatter；$\lfloor\log_2 10\rfloor=3$ ⇒ VC ≤ 3。`,
        T`**删列**：试 3 元子集。删掉 $x_3$ 这一列，每行只保留 $x_1,x_2,x_4$ 三位（行的顺序不变）：`,
        T`这张表**横着读**：表头每一格是原表的一整行 $(x_1,x_2,x_3,x_4)$，下面那一格是把第 3 位 $x_3$ 删掉后剩下的 $(x_1,x_2,x_4)$。例：表头 $0110$ 下面是 $010$——丢掉了第 3 位的 $1$。`,
        { t: 'table', cls: 'mono compact', head: ['原行', '0000', '0110', '1001', '1101', '0100', '1010', '1111', '0011', '0101', '1110'], rows: [['$(x_1,x_2,x_4)$', '000', '010', '101', '111', '010', '100', '111', '001', '011', '110']] },
        T`**去重**：第二个 $010$、第二个 $111$ 重复，划掉。`,
        T`**计数**：剩 8 种 $=\{000,001,010,011,100,101,110,111\}$ 全齐 ⇒ $\{x_1,x_2,x_4\}$ 被 shatter。`,
        T`**结论**：VC = 3，一个 shattered set 是 $\{x_1,x_2,x_4\}$。`,
      ] },
      { t: 'table', cls: 'compact', caption: '2026 practice Q3 的表（8 种 dichotomy × 5 个点）', head: ['行', '$x_1$', '$x_2$', '$x_3$', '$x_4$', '$x_5$'], rows: [
        ['1', '0', '0', '0', '0', '1'],
        ['2', '1', '0', '0', '0', '1'],
        ['3', '0', '1', '0', '1', '0'],
        ['4', '0', '1', '1', '0', '1'],
        ['5', '0', '1', '0', '1', '1'],
        ['6', '1', '0', '1', '1', '1'],
        ['7', '1', '1', '1', '0', '1'],
        ['8', '0', '1', '1', '1', '1']
      ] },
      { t: 'warn', title: '必要条件 ≠ 充分条件', md: '行数 $\\ge2^k$ 只是必要条件。上表有 8 行（$=2^3$），看起来可能 VC = 3，但 5 个点里选 3 个共 10 种选法，**没有一种**凑齐 000–111 全部 8 种：最接近的 $\\{x_1,x_3,x_4\\}$ 只出现 7 种（缺 101），$\\{x_1,x_2,x_3\\}$ 缺 001 和 110。而 $\\{x_1,x_2\\}$ 四种 00、10、01、11 都有 ⇒ **VC = 2**。必须真的找到一组列。完整解答见 [T1](#/T01)。' },
      { t: 'h3', text: '快速预筛（T1 技巧）' },
      T`一列要进 $k$ 元 shattered 集，这一列里 0 和 1 都至少要出现 $2^{k-1}$ 次（因为另外 $k-1$ 列的 $2^{k-1}$ 种组合，每一种都要和这一列的 0 配一次、和 1 配一次）。这只是**必要条件**：0 或 1 太少的列可以先排除，但次数够也不保证能进。`,
    ],
    fx: [
      {
        title: 'VC 维', tex: T`\mathrm{VC}(\mathcal F)=\htmlClass{fx-p1}{\max}\{\,n:\ \htmlClass{fx-p2}{S_\mathcal F(n)=2^n}\,\}`,
        parts: [
          { label: 'max', note: '最大的那个 $n$。比它大的 $n$ 都做不到。' },
          { label: 'S(n)=2ⁿ', note: '等价于"存在一组 $n$ 个点被 shatter"（因为 $S$ 是对点集取最大）。' },
        ],
      },
    ],
    example: [
      { t: 'h3', text: 'Stumps 的 VC 维（L07 p24）' },
      { t: 'table', cls: 'compact', head: ['$n$', '$S(n)=2n$', '$2^n$', 'shatter？'], rows: [['1', '2', '2', '✓'], ['2', '4', '4', '✓'], ['3', '6', '8', '✗（缺 $+-+$、$-+-$）']] },
      T`⇒ VC(stumps) = 2。`,
      { t: 'fade', title: '分步练习：从表求 VC 维', plan: [T`上界 $\lfloor\log_2(\text{行数})\rfloor$`, '选列、去重', '数是否 $=2^k$', '写结论（VC 和一个 shattered set）'], items: [
        { md: T`L07 p29 的表（上面）。`, steps: [
          { md: '10 行 ⇒ VC ≤ 3' }, { md: T`取 $(x_1,x_2,x_4)$，去掉重复的 010、111` }, { md: '剩 8 种 $=2^3$' }, { md: T`VC = 3，$\{x_1,x_2,x_4\}$` },
        ] },
        { md: T`3 个点，表的行：$000,011,101,110,111$。`, steps: [
          { ask: '上界：VC ≤ ?', answer: 2, show: T`5 行，$\lfloor\log_25\rfloor=2$` },
          { ask: T`只看 $(x_1,x_2)$：不同组合有几种？`, answer: 4, show: '$00,01,10,11$（11 出现两次）' },
          { ask: '$2^2=4$ 吗？于是 VC = ?', answer: 2, show: T`$\{x_1,x_2\}$ 被 shatter，VC = 2` },
        ] },
        { md: T`4 个点，行：$0000,1100,1010,0110,1110,0001$。`, steps: [
          { ask: '上界：VC ≤ ?', answer: 2, show: T`6 行，$\lfloor\log_26\rfloor=2$` },
          { ask: T`$(x_1,x_2)$ 的不同组合几种？`, answer: 4, show: '$00,11,10,01$ 全齐' },
          { ask: T`$(x_1,x_4)$ 的不同组合几种？`, answer: 3, show: '$00,10,01$，缺 11 ⇒ 这一对没被 shatter' },
          { ask: 'VC = ?', answer: 2, show: T`$\{x_1,x_2\}$ 被 shatter，VC = 2` },
        ] },
      ] },
    ],
    viz: [
      { id: 'vc-solver', opts: { preset: 'L07p29' }, how: '这就是考试的 dichotomy 表。选中若干列（点），工具会把表限制到这些列、划掉重复行、检查是否凑齐 $2^k$ 种。下方列出所有被 shatter 的子集和 VC 维。可以点格子改表。',
        try: '① 先**自己**按上面的步骤做 L07 p29，再选 $x_1,x_2,x_4$ 验证。② 切到 2026 Q3 预设：8 行却 VC = 2——试着找一个 3 元子集，看缺哪些组合。③ 改几个格子，看 VC 怎么变。' },
      { id: 'growth-fn', how: '对比几种分类器的 $S(m)$ 和 $2^m$。',
        try: '找出每种分类器"最后一个 $S(m)=2^m$ 的 $m$"——那就是它的 VC 维。' },
    ],
    compare: [
      { t: 'table', head: ['模型类', 'VC 维', '理由'], rows: [
        ['Decision stumps（一维）', '2', '$2n=2^n$ 最大解'],
        ['$\\mathbb R^2$ 中直线', '3', '三角形 3 点可 shatter；$S(4)=14<16$ ⇒ 任何 4 点都不行（凸四边形缺对角同色的 XOR；若一点在另三点围成的三角形内，缺的是"内点与外三点异号"）'],
        ['$\\mathbb R^d$ 中线性分类器', '$d+1$', 'L07 p33'],
        ['$\\mathbb R^2$ 中轴对齐矩形', '4', '菱形 4 点可 shatter；任 5 点：4 个极值点标 +、其余一点标 − 做不到（Worksheet 5）'],
        ['有限类 $\\mathcal F$', '$\\le\\log_2|\\mathcal F|$', '每个分类器只给一行'],
      ] },
      { t: 'exam', md: T`**VC dimension (answer template):** The VC dimension is the size of the largest set of points that $\mathcal F$ can shatter, i.e. label in all $2^n$ possible ways. Here the table has $N$ distinct rows, so $\mathrm{VC}\le\lfloor\log_2N\rfloor$. Restricting to $\{x_a,x_b,x_c\}$ and removing duplicate rows gives all $2^3=8$ patterns $\{000,\dots,111\}$, so this set is shattered; no set of 4 points can be shattered (fewer than 16 rows). Hence $\mathrm{VC}(\mathcal F)=3$. (Template for the L07 p29 table: always conclude with the largest $k$ for which some $k$ columns actually show all $2^k$ patterns. Having at least $2^k$ rows is not enough — the 8-row table in 2026P Q3 / 2025P Q3 has no 3 columns with all 8 patterns, so there VC $=2$.)` },
    ],
    pitfalls: [
      ['要求所有 $d$ 个点的集合都被 shatter', '只需**存在**一个（共线 3 点失败不影响直线 VC = 3）。'],
      ['行数 $\\ge2^k$ 就说 VC ≥ $k$', '必须真找到 $k$ 列凑齐全部 $2^k$ 种（2026 Q3 的陷阱）。'],
      ['忘了去重', '限制到子集后，重复的行只算一次（L07 p29）。'],
      ['VC 维 = 参数个数', '只是直觉，对线性分类器成立，一般不成立。'],
      ['只写 VC 值', '题目通常要求"show a shattered set"——要写出子集并列出 $2^k$ 种模式。'],
      ['问"一共有几个 shattered set"时忘了空集和单点', '空集按定义被 shatter（$2^0=1$ 种标签）；某列里 0 和 1 都出现过，这个单点就被 shatter。答题时写明"含空集 / 不含空集"两个数（2021 Q16(b)，见 T1）。'],
    ],
    quiz: [
      {
        type: 'set',
        q: [
          T`（平时小测原题）The table lists all 9 unique dichotomies of a family $\mathcal F$ on $\mathcal X=\{x_1,x_2,x_3,x_4\}$ (labels in $\{0,1\}$). Select all true facts about $\mathrm{VC}(\mathcal F)$ that can be deduced from the table (you are not asked for the exact value). 1: Based on the number of rows, the VC dimension cannot be more than 3. 2: $\mathcal F$ shatters $\{x_1,x_3\}$. 3: $\mathcal F$ shatters $\{x_2,x_4\}$.`,
          { t: 'table', cls: 'mono compact', head: ['$x_1$', '$x_2$', '$x_3$', '$x_4$'], rows: ['0001', '0101', '0110', '0111', '1001', '1011', '1101', '1110', '1111'].map((r) => r.split('')) },
        ],
        qzh: T`表里是分类器族 $\mathcal F$ 在 4 个点上能做出的全部 9 种不同标签。下面哪些结论能从表里推出（不要求算出确切的 VC 维）？1：按行数，VC 维不超过 3。2：$\mathcal F$ 打散 $\{x_1,x_3\}$。3：$\mathcal F$ 打散 $\{x_2,x_4\}$。`,
        answer: ['1', '2'],
        explain: T`1 对：打散 4 个点要 $2^4=16$ 种不同的行，这里只有 9 行；$2^3=8\le9$，所以 VC 最多 3（这只是上界）。2 对：只看 $x_1,x_3$ 两列，读出 00、00、01、01、10、11、10、11、11，四种组合都出现，被打散。3 错：只看 $x_2,x_4$，读出 01、11、10、11、01、01、11、10、11，**缺 00**，没被打散。答案 1、2。`,
      },
      { type: 'num', q: '$\\mathbb R^5$ 中线性分类器的 VC 维？', answer: 6, explain: T`$\mathbb R^d$ 中线性分类器的 VC 维是 $d+1$（L07 p33）。这里输入是 5 维，$d=5$，所以 VC $=5+1=6$。直觉：分类器 $\sgn(\bw'\bx+b)$ 有 5 个权重加 1 个截距 $b$，共 6 个可调参数，正好能 shatter（打散）6 个位置合适的点。**常见错误是答 5，漏掉了截距 $b$ 带来的那 1 个自由度。**` },
      { type: 'num', q: 'dichotomy 表有 7 个不同的行。VC 维最多？', answer: 2, explain: T`要 shatter（打散）$k$ 个点，表里只看这 $k$ 列时必须凑齐全部 $2^k$ 种 0/1 组合；而只看其中几列时，不同的行只会合并变少，不会超过原来的 7 行。所以需要 $2^k\le7$：$2^2=4\le7$ 可以，$2^3=8>7$ 不行，最大 $k=2$，即 $\lfloor\log_27\rfloor=2$。**这只是上界**：还要真的找到 2 列同时出现 00、01、10、11 四种，VC 维才是 2，否则更小。` },
      { type: 'mc', q: '三个**共线**的点不能被直线 shatter。这说明：', options: ['直线的 VC < 3', '直线的 VC 可能仍是 3（只要有别的 3 点能被 shatter）', '直线的 VC = 2', '直线不能分类 3 个点'], answer: 1, explain: 'L07 p26–p28。' },
      { type: 'mc', q: '为什么 4 个点不能被 $\\mathbb R^2$ 的直线 shatter？', options: ['点太多计算不了', 'XOR 那种对角同色的标签无法用一条直线分开', '因为 $2^4$ 太大', '因为 stumps 的 VC 是 2'], answer: 1, explain: 'L07 p27：凸四边形时缺 XOR 两种，只有 14 种 < 16。（若一点在另三点的三角形内部，缺的是"内点与外三点异号"的标签。）$S(4)=14<16$ 说明没有任何 4 点能被 shatter。' },
      { type: 'show', q: '（英文）What does it mean for a set of points to be shattered?', answer: T`A set of $n$ points is shattered by a class $\mathcal F$ if, for every one of the $2^n$ possible labellings of the points, some classifier in $\mathcal F$ produces exactly that labelling.`, qzh: '一组点被打散（shattered）是什么意思？', azh: T`如果对这 $n$ 个点所有 $2^n$ 种可能的标注（labelling）中的每一种，$\mathcal F$ 中都有某个分类器恰好产生这种标注，就称这 $n$ 个点被函数类 $\mathcal F$ 打散（shattered）。` },
    ],
  });

  /* =====================================================================
   * c24 · VC 泛化界（L07 p30–p34）
   * ===================================================================== */
  add({
    id: 'c24', week: 'W4', lec: 'L07', pages: 'L07 p30–p34', star: 2,
    keyEn: [
      T`Sauer–Shelah lemma: if $\mathrm{VC}(\mathcal F)=d<\infty$ then $S_\mathcal F(n)\le\sum_{i=0}^{d}\binom ni\le(n+1)^d$, so the growth function is polynomial rather than $2^n$.`,
      T`VC bound: with probability at least $1-\delta$ (i.i.d. data, 0-1 loss, ERM), $R[\hat f_D]\le\hat R_D[\hat f_D]+\sqrt{8\,\frac{\mathrm{VC}(\mathcal F)\log(2n+1)+\log(4/\delta)}{n}}$.`,
      T`The penalty is $O\big(\sqrt{\mathrm{VC}\log n/n}\big)\to0$, so a finite VC dimension implies generalisation (equivalently, PAC learnability); the bound holds for any distribution but is loose.`,
      T`Structural risk minimisation (SRM): among model classes, choose the one minimising empirical risk plus the VC penalty.`,
    ],
    keyZh: [
      T`Sauer–Shelah 引理：VC 维 $d$ 有限时，增长函数被上面的组合数之和压住，最多按 $n^d$ 多项式增长，而不是 $2^n$ 指数增长。`,
      T`VC 泛化界：真实风险 ≤ 训练风险 + 根号惩罚；惩罚里用 $\mathrm{VC}\log(2n+1)$ 取代 $\log|\mathcal F|$，8 乘整个分数。前提：i.i.d. 样本、0-1 loss、ERM 选出的分类器，以至少 $1-\delta$ 的概率成立。`,
      T`惩罚项约为 $\sqrt{\mathrm{VC}\log n/n}$，随 $n$ 增大趋于 0，所以 VC 维有限就能泛化（等价于 PAC 可学）。界对任何数据分布都成立（distribution-free），但很松、很悲观。`,
      T`结构风险最小化（SRM）：在几个模型类之间，选"训练误差 + VC 惩罚"之和最小的那个；简单类误差大、惩罚小，复杂类相反。`,
    ],
    title: 'VC 泛化界', en: 'Sauer–Shelah lemma and the VC generalisation bound',
    summary: '**Sauer–Shelah lemma（引理）**：VC 维有限时 growth function 只是多项式增长，$S_\\mathcal F(n)\\le\\sum_{i=0}^{\\mathrm{VC}}\\binom ni$。代入 growth-function 界得到 **VC 泛化界**：惩罚 $\\approx\\sqrt{\\mathrm{VC}\\log n/n}$，随 $n$ 下降——无限类也能泛化。',
    prereq: ['c22', 'c23'],
    symbols: [
      [T`$\binom ni$`, T`组合数"$n$ 选 $i$"$=\frac{n!}{i!(n-i)!}$`],
      [T`$O(\cdot)$`, T`数量级（忽略常数）`],
      [T`$\delta$`, T`失败概率`],
    ],
    goals: [
      '写出 Sauer–Shelah 上界并代数验证（如 stumps）',
      '写出 VC 泛化界，说出它和有限类界的对应关系',
      '用 VC 界做 SRM（structural risk minimisation，结构风险最小化）；说出"有限 VC 维 ⇔ PAC 可学"',
    ],
    types: ['T12'],
    notExam: 'Sauer–Shelah 的证明、growth-function 定理的证明都不在范围内（L07 p20、p30）。p34 提到的 fat shattering、PAC-Bayes、Rademacher complexity 只是"其他理论框架"的名字，**完全不考**，看到不用紧张。',
    what: [
      { t: 'h3', text: '① 问题：有了 VC 维，泛化界怎么用它（L07 p30–p31）' },
      T`c22 的泛化界里要的是 growth function $S_\mathcal F(2n)$，而 c23 算出来的是 VC 维 $d$。**Sauer–Shelah 引理**把两者连起来：VC 维有限时，$S_\mathcal F(n)$ 最多按 $n^d$ 增长（多项式），远小于 $2^n$。代进泛化界，惩罚项随 $n$ 增大而变小——VC 维有限的模型类"学得会"。`,
      { t: 'h3', text: '② 两步：Sauer–Shelah 换掉 growth function，代入得到 VC 界（L07 p30–p32）' },
      T`**Sauer–Shelah lemma**（L07 p30）：VC 维有限时，对任意 $n$：`,
      { t: 'math', tex: T`S_\mathcal F(n)\le\sum_{i=0}^{\mathrm{VC}(\mathcal F)}\binom ni\le(n+1)^{\mathrm{VC}(\mathcal F)}\quad\Rightarrow\quad\log S_\mathcal F(n)\le\mathrm{VC}(\mathcal F)\log(n+1)` },
      T`**VC 泛化界**（L07 p31–p32）：以至少 $1-\delta$ 的概率，`,
      { t: 'math', tex: T`R[\hat f_D]\le\hat R_D[\hat f_D]+\sqrt{8\,\frac{\mathrm{VC}(\mathcal F)\log(2n+1)+\log(4/\delta)}{n}}` },
      { t: 'slide', src: 'L07/p31', caption: '老师的原页：结构和有限类的界一样（训练误差 + 根号惩罚），只是 $\\log|\\mathcal F|$ 换成了 $\\mathrm{VC}(\\mathcal F)\\log(2n+1)$；最下面一行就是 Sauer–Shelah 给的那一步替换。' },
      T`（推导：把 Sauer–Shelah 的 $\log S(2n)\le\mathrm{VC}\log(2n+1)$ 代入 c22 的 growth-function 界。）对 $\mathbb R^d$ 的线性分类器，偏差是 $O\big(\sqrt{\mathrm{VC}\log n/n}\big)$（p33）。`,
    ],
    why: [
      T`这一章完成了 L06–L07 的故事：**有限 VC 维 ⇒ growth function 多项式 ⇒ 惩罚项随 $n$ 趋于 0 ⇒ ERM 能泛化**。L07 p34：有限 VC 维 ⇔ **PAC learnability（PAC 可学）**。这也给出了"为什么 SVM 要最大化 margin"的理论动机之一（复杂度控制）。`,
    ],
    intuition: [
      T`**从 $2^n$ 到 $n^{\mathrm{VC}}$。** 点数超过 VC 维后，模型就"跟不上"所有标签组合了，能实现的组合数从指数增长掉到多项式增长。多项式的 log 只是 $\mathrm{VC}\cdot\log n$，除以 $n$ 后趋于 0。`,
      { t: 'think', q: '如果某个模型类的 VC 维是无穷，VC 界还能用吗？', a: T`不能：$\mathrm{VC}=\infty$ 时 $S(n)=2^n$ 对所有 $n$ 成立，惩罚项不随 $n$ 下降（c22 的指数例子），界给不出有意义的保证。L07 p34 提到有些问题本身 VC 维无穷，需要别的框架。` },
      { t: 'story', title: '一个引理，三组人', md: '这个上界由 Sauer（1972）和 Shelah（1972）分别独立发表，Perles 也独立得到过（未发表），Vapnik 和 Chervonenkis 在 1971 年也得到了同样的结果——所以有时也叫 Sauer–Shelah–Perles 引理或 VC 引理。' },
    ],
    math: [
      { t: 'h3', text: '验证 Sauer–Shelah' },
      T`Stumps：VC = 2，$n=5$：上界 $\binom50+\binom51+\binom52=1+5+10=16$；实际 $S(5)=10\le16$ ✓。`,
      T`$\mathbb R^2$ 直线：VC = 3，$n=4$：上界 $1+4+6+4=15$；实际 $S(4)=14\le15$ ✓（L07 p27）。`,
      { t: 'h3', text: 'SRM（L07 p32）' },
      T`和 c21 一样：在几个模型类之间，选"经验风险 + VC 惩罚"最小的。简单类：经验风险大、惩罚小；复杂类相反；样本多时惩罚变小，可以承担更复杂的类。`,
      { t: 'h3', text: '三个界放在一起' },
      { t: 'table', head: ['', '复杂度项', '适用'], rows: [
        ['有限类（L06 p17）', '$\\sqrt{\\frac{\\log|\\mathcal F|+\\log(1/\\delta)}{2n}}$', '$|\\mathcal F|$ 有限'],
        ['Growth function（L07 p20）', '$\\sqrt{8\\frac{\\log S_\\mathcal F(2n)+\\log(4/\\delta)}{n}}$', '任意类'],
        ['VC（L07 p31）', '$\\sqrt{8\\frac{\\mathrm{VC}\\log(2n+1)+\\log(4/\\delta)}{n}}$', 'VC 维有限'],
      ] },
    ],
    fx: [
      {
        title: 'VC 泛化界', tex: T`R[\hat f_D]\le\hat R_D[\hat f_D]+\sqrt{\htmlClass{fx-p1}{8}\,\frac{\htmlClass{fx-p2}{\mathrm{VC}(\mathcal F)\log(2n+1)}+\htmlClass{fx-p3}{\log(4/\delta)}}{\htmlClass{fx-p4}{n}}}`,
        parts: [
          { label: '8', note: '乘整个分数的常数（来自证明技巧，L07 p20）。' },
          { label: 'VC·log(2n+1)', note: '由 Sauer–Shelah 得到的 $\\log S(2n)$ 上界：复杂度 × 对数样本量。' },
          { label: 'log(4/δ)', note: '置信度代价。' },
          { label: 'n', note: '分母是 $n$，整体约 $\\sqrt{\\mathrm{VC}\\log n/n}\\to0$。' },
        ],
      },
    ],
    example: [
      { t: 'h3', text: '代数字' },
      T`VC = 3，$\delta=0.05$：$n=1000$ 时惩罚 $\sqrt{8\times\frac{3\ln2001+\ln80}{1000}}$（$\log(4/\delta)=\ln80$）。考试会给对数值：$\ln2001\approx7.601$，乘 3 得 $22.80$；$\ln80\approx4.38$。$22.80+4.38=27.18$，$8\times27.18/1000\approx0.217$，开方 $\approx0.466$——很松；$n=100000$ 时约 0.057。VC 界通常很悲观，但趋势是对的。`,
      { t: 'fade', title: '分步练习：Sauer–Shelah 上界', plan: ['确定 VC 维 $d$ 和 $n$', T`算 $\sum_{i=0}^d\binom ni$`, '与实际 $S(n)$ 或 $2^n$ 比较'], items: [
        { md: T`Stumps，$n=5$。`, steps: [
          { md: '$d=2$' }, { md: '$1+5+10=16$' }, { md: '$S(5)=10\\le16\\le32$' },
        ] },
        { md: T`$\mathbb R^2$ 直线，$n=5$。`, steps: [
          { ask: T`上界 $\sum_{i=0}^3\binom5i=?$`, answer: 26, show: '$1+5+10+10=26$' },
          { ask: T`$2^5=?$`, answer: 32, show: '上界 26 < 32：已经做不到全部组合' },
        ] },
        { md: T`VC = 1 的类，$n=4$。`, steps: [
          { ask: '$d=?$', answer: 1, show: '1' },
          { ask: '上界 = ?', answer: 5, show: T`$\binom40+\binom41=5=n+1$` },
          { ask: '它比 $2^4$ 小多少？', answer: 11, show: '$16-5=11$' },
        ] },
      ] },
    ],
    viz: [
      { id: 'growth-fn', how: '读数里同时显示实际 $S(m)$、$2^m$ 和 Sauer–Shelah 上界 $\\sum_{i\\le d}\\binom mi$。',
        try: '对 stump（$d=2$）把 $m$ 从 1 拉到 8：$m\\le2$ 时三者相等；之后 $2^m$ 指数爆炸，上界只按 $m^2$ 增长，实际 $S(m)=2m$ 更小。' },
    ],
    compare: [
      { t: 'exam', md: T`**Why does a finite VC dimension imply generalisation?** By the Sauer–Shelah lemma, if $\mathrm{VC}(\mathcal F)=d<\infty$ the growth function is polynomial, $S_{\mathcal F}(n)\le\sum_{i=0}^d\binom ni\le(n+1)^d$. Plugging $\log S_{\mathcal F}(2n)\le d\log(2n+1)$ into the growth-function bound gives, with probability at least $1-\delta$ over $n$ i.i.d. samples (0-1 loss), $R[\hat f]\le\hat R[\hat f]+\sqrt{8\,\frac{d\log(2n+1)+\log(4/\delta)}{n}}$, whose penalty is $O(\sqrt{d\log n/n})\to0$, so the gap between empirical and true risk of the ERM classifier shrinks to 0 as $n$ grows.` },
    ],
    pitfalls: [
      ['VC 界里的 8 只乘 VC 那一项', '乘整个分数（L07 p20 digest 特别注明）。'],
      ['Sauer–Shelah 给出 $S(n)$ 的精确值', '只是上界。'],
      ['VC 界很紧', '通常很悲观（宽松）。它对任何数据分布都成立（distribution-free），但前提是 i.i.d. 样本、0-1 loss，结论针对 ERM 选出的分类器，并且只以至少 $1-\\delta$ 的概率成立。'],
      ['要会证明 Sauer–Shelah', '不考（L07 p30）。'],
    ],
    quiz: [
      { type: 'num', q: 'VC = 2，$n=6$。Sauer–Shelah 上界？', answer: 22, explain: T`Sauer–Shelah 引理给 growth function（增长函数）一个上界 $S(n)\le\sum_{i=0}^{\mathrm{VC}}\binom{n}{i}$。这里 VC $=2$、$n=6$，要加 $i=0,1,2$ 三项：$\binom{6}{0}=1$，$\binom{6}{1}=6$，$\binom{6}{2}=\frac{6\times5}{2}=15$，合计 $1+6+15=22$。对比 $2^6=64$：点数超过 VC 维以后，能实现的标签组合只按多项式增长。**求和从 $i=0$ 开始、到 $i=\mathrm{VC}$ 为止**，漏掉 $\binom{6}{0}=1$ 就会算成 21。` },
      { type: 'mc', q: '有限 VC 维等价于：', options: ['模型类有限', 'PAC 可学', '训练误差为 0', '数据线性可分'], answer: 1, explain: T`L07 p34：有限 VC 维等价于 PAC（probably approximately correct，大概率近似正确）可学。原因是一条链：VC 维有限 ⇒ Sauer–Shelah 让 growth function 只按多项式增长 ⇒ VC 界的惩罚项约 $\sqrt{\mathrm{VC}\log n/n}$，随 $n$ 增大趋于 0 ⇒ 样本够多时，真实风险和训练风险的差距以高概率变得任意小。**最诱人的错项是"模型类有限"**：有限类的 VC 维一定有限（$\le\log_2|\mathcal F|$），但反过来不成立——stump、直线都有无穷多个分类器，VC 维却只有 2、3，所以两者不等价。L07 p34。` },
      { type: 'mc', q: 'VC 界中惩罚项的数量级？', options: ['$O(\\sqrt{\\mathrm{VC}/n})$', '$O(\\sqrt{\\mathrm{VC}\\log n/n})$', '$O(2^n)$', '$O(\\mathrm{VC}\\cdot n)$'], answer: 1, explain: T`VC 界的惩罚项是 $\sqrt{8\,\frac{\mathrm{VC}\log(2n+1)+\log(4/\delta)}{n}}$。看数量级时去掉常数 8；$\log(4/\delta)$ 不随 $n$ 变；$\log(2n+1)$ 和 $\log n$ 同阶。剩下的就是 $O\big(\sqrt{\mathrm{VC}\log n/n}\big)$。最容易误选的是 $O(\sqrt{\mathrm{VC}/n})$：**它漏了 $\log n$，而这个 $\log n$ 来自 Sauer–Shelah 的 $\log S(2n)\le\mathrm{VC}\log(2n+1)$**。L07 p33。` },
    ],
  });

  /* =====================================================================
   * c25 · 最大 margin 与点到超平面距离（L08 p1–p18）
   * ===================================================================== */
  add({
    id: 'c25', week: 'W4', lec: 'L08', pages: 'L08 p1–p18', star: 3,
    keyEn: [
      T`Many separators have zero training error; the SVM picks the one maximising the margin, the distance from the boundary to the closest training point, which is more robust to sampling effects.`,
      T`Distance of $\bx_i$ to the hyperplane $\bw'\bx+b=0$ is $\frac{|\bw'\bx_i+b|}{\|\bw\|}$; with $y_i\in\{-1,+1\}$ it is $\frac{y_i(\bw'\bx_i+b)}{\|\bw\|}$, positive for correctly classified points.`,
      T`SVM objective: $\max_{\bw,b}\min_i\frac{y_i(\bw'\bx_i+b)}{\|\bw\|}$; the support vectors are the closest points. The margin is one-sided: the gap between the two margin lines is twice it.`,
      T`Functional margin $y_i(\bw'\bx_i+b)$ scales with $(\bw,b)$; the geometric margin divides it by $\|\bw\|$: a scale-invariant signed distance, equal to the true distance for correctly classified points.`,
    ],
    keyZh: [
      T`能分开数据、训练误差为 0 的线有很多条；SVM 选间隔（margin，边界到最近训练点的距离）最大的那条：它离点远，新数据稍有抖动也不容易分错，更稳健。`,
      T`点到超平面的距离 = 得分的绝对值除以 $\|\bw\|$；乘上标签 $y_i=\pm1$ 就能去掉绝对值：分对的点结果为正，分错为负。`,
      T`SVM 目标：调 $\bw,b$，让离边界最近的那个点的距离尽量大；这些最近的点就是支持向量（support vectors）。本课 margin 只算单侧，两条虚线之间的宽度是它的 2 倍。`,
      T`函数间隔（functional margin）$y_i(\bw'\bx_i+b)$ 会随 $(\bw,b)$ 一起缩放；几何间隔（geometric margin）再除以 $\|\bw\|$，缩放不变，对分对的点就是真实距离。`,
    ],
    title: '最大 margin 与点到超平面距离', en: 'Maximum-margin idea and point-to-hyperplane distance',
    summary: '能完美分开数据的直线有无穷多条，训练误差都是 0。**SVM** 选离两类点都最远的那条：最大化 **margin（间隔）**——边界到最近点的距离。点到超平面的带符号距离 $\\frac{y_i(\\bw\'\\bx_i+b)}{\\|\\bw\\|}$ 是本章核心公式。',
    prereq: ['c03', 'c15'],
    symbols: [
      [T`$s=\bw'\bx+b$`, T`线性得分（score）`],
      [T`$\bx_p$`, T`$\bx$ 在超平面上的投影点（projection）`],
      [T`$\boldsymbol r=\bx_p-\bx$`, T`从点指向投影点的向量，与 $\bw$ 平行`],
      [T`$y_i\in\{-1,+1\}$`, T`SVM 的标签约定（不是 0/1）`],
      [T`$\frac{y_i(\bw'\bx_i+b)}{\|\bw\|}$`, T`带标签的距离：分对时为正`],
      [T`margin`, T`本课定义：决策边界到最近点的距离（单侧）$=\min_i\frac{y_i(\bw'\bx_i+b)}{\|\bw\|}$。在 canonical scaling（c26，让最近点的 $y_i(\bw'\bx_i+b)=1$）之后才等于 $1/\|\bw\|$；两条虚线之间的总宽度是它的 2 倍，即 $2/\|\bw\|$`],
    ],
    goals: [
      '解释为什么"训练误差都是 0"时还要选最大 margin（L08 p6–p11）',
      '复现距离推导 $\\|\\boldsymbol r\\|=\\pm\\frac{\\bw\'\\bx+b}{\\|\\bw\\|}$（L08 p14–p16）',
      '用标签把距离写成 $\\frac{y_i(\\bw\'\\bx_i+b)}{\\|\\bw\\|}$，写出"最大化最小距离"目标',
      '手算一个数据集上某条直线的 margin 和最近点',
    ],
    types: ['T04'],
    what: [
      { t: 'h3', text: '① 问题：很多条线都能分开数据，选哪条？（L08 p6–p9）' },
      T`训练数据线性可分时，能把两类分开的直线有无数条，它们的训练错误都是 0。但它们不一样可靠：一个新点落在两条线之间，就会被其中一条分错（L08 p8）。直觉上，**离两边的点都尽量远**的那条线最稳——新点稍微偏一点也不会被分错。SVM 就是去找这条线。`,
      { t: 'fig', src: 'reference/pages/L08/p08.jpg', caption: 'L08 p8：A、B 两条线训练误差都是 0；新来的红点被 A 分对，却落在 B 的错误一侧', w: 520 },
      { t: 'slide', src: 'L08/p09', caption: '虚线碰到两侧最近的点，中间的空隙就是 margin。SVM 选让这个空隙最大的分界线。' },
      { t: 'video', id: 'svm-margin' },
      { t: 'h3', text: '② 把直觉写成术语：SVM、margin、支持向量（L08 p5、p13）' },
      T`**SVM（support vector machine，支持向量机）**（L08 p5）：线性二分类器，得分 $s=b+\bw'\bx$，$s\ge0$ 判 A 类、否则 B 类。决策边界就是超平面 $\bw'\bx+b=0$（c03）。`,
      T`**Margin（间隔）**（L08 p13）：决策边界到**最近**数据点的距离。（注意：课件把 margin 定义为"边界到最近点"，不是两条虚线之间的整个宽度。）**SVM 的训练目标就是最大化 margin。**`,
      T`**Support vectors（支持向量）**：离边界最近、正好落在 margin 边界（虚线）上的点（L08 p13）。`,
    ],
    why: [
      T`SVM 是本课的核心模型之一，占 W4–W5 四章，往年题型 T4（看图找支持向量、算 margin）和 T8（kernel）都从这里来。这一章先把几何讲清楚，下一章（c26）把"最大化 margin"变成一个可以求解的优化问题。`,
    ],
    intuition: [
      T`**"离得远 = 稳"。** 训练数据只是从分布里抽的样本；新数据会在训练点附近抖动。边界离所有训练点都远，对这种抖动最不敏感（L08 p10–p11：robust to sampling effects）。`,
      T`**距离公式就是 c03 那个。** c03 学过点到超平面距离 $|\bw'\bx+b|/\|\bw\|$。乘上标签 $y_i\in\{\pm1\}$ 可以去掉绝对值：分对的点 $y_i$ 和 $\bw'\bx_i+b$ 同号，乘积为正，正好就是距离。`,
      { t: 'think', q: T`如果某条直线把一个点分错了，$\frac{y_i(\bw'\bx_i+b)}{\|\bw\|}$ 会是什么符号？那么"所有点上的最小值"是什么符号？`, a: '负的（$y_i$ 与得分异号）。最小值也是负的——所以"最大化最小距离"会自然地先把分错的点纠正过来；对可分数据，最优解的最小距离为正，就是 margin。' },
    ],
    math: [
      { t: 'h3', text: '点到超平面的距离（L08 p14–p16）' },
      { t: 'steps', items: [
        T`设 $\bx_p$ 是 $\bx$ 在边界上的投影，$\boldsymbol r=\bx_p-\bx$ 垂直于边界，所以 $\boldsymbol r\parallel\bw$：$\bx_p=\bx+\|\boldsymbol r\|\frac{\bw}{\|\bw\|}$（图中这个点在负侧，投影方向与 $\bw$ 同向）。`,
        T`$\bx_p$ 在边界上：$0=\bw'\bx_p+b=\bw'\bx+\|\boldsymbol r\|\frac{\bw'\bw}{\|\bw\|}+b=\bw'\bx+\|\boldsymbol r\|\,\|\bw\|+b$（用 $\bw'\bw=\|\bw\|^2$）。`,
        T`解出 $\|\boldsymbol r\|=-\frac{\bw'\bx+b}{\|\bw\|}$；在另一侧符号相反。统一写 $\|\boldsymbol r\|=\pm\frac{\bw'\bx+b}{\|\bw\|}$：点在正侧取 $+$，在负侧取 $-$——下一步用标签 $y_i=\pm1$ 正好替代这个符号。`,
      ] },
      { t: 'h3', text: '用标签消掉 ±（L08 p17–p18）' },
      T`对完美分开的边界，正类 $\bw'\bx_i+b>0$，负类 $<0$，所以`,
      { t: 'math', tex: T`\|\boldsymbol r_i\|=\frac{y_i(\bw'\bx_i+b)}{\|\bw\|},\qquad\text{SVM：}\ \max_{\bw,b}\ \min_{i=1..n}\ \frac{y_i(\bw'\bx_i+b)}{\|\bw\|}` },
      T`"让最近的点尽量远"。这个目标不好直接优化（非凸，而且解不唯一，见 c26），下一章用 canonical scaling 把它变成标准形式。`,
    ],
    fx: [
      {
        title: '带标签的距离', tex: T`\|\boldsymbol r_i\|=\frac{\htmlClass{fx-p1}{y_i}\,\htmlClass{fx-p2}{(\bw'\bx_i+b)}}{\htmlClass{fx-p3}{\|\bw\|}}`,
        parts: [
          { label: 'y_i', note: '$\\pm1$。乘上它，分对的点结果为正（去掉绝对值）。' },
          { label: "w'x+b", note: '得分。分子 $y_i(\\bw\'\\bx_i+b)$ 叫 **functional margin（函数间隔）**。' },
          { label: '‖w‖', note: '除以它变成真实的几何距离：**geometric margin（几何间隔）**。' },
        ],
      },
    ],
    example: [
      { t: 'h3', text: '算一条直线的 margin' },
      T`$\bw=(1,1)$，$b=-3$（直线 $x_1+x_2=3$），$\|\bw\|=\sqrt2$。三个点：`,
      { t: 'table', cls: 'compact', head: ['点', '$y$', '$\\bw\'\\bx+b$', '$y(\\bw\'\\bx+b)$', '距离'], rows: [
        ['$(1,1)$', '−1', '−1', '1', '$1/\\sqrt2\\approx0.707$'],
        ['$(3,2)$', '+1', '2', '2', '$2/\\sqrt2\\approx1.414$'],
        ['$(2,2)$', '+1', '1', '1', '$\\approx0.707$'],
      ] },
      T`这条线的 margin = 最小距离 ≈ 0.707，最近的点是 $(1,1)$ 和 $(2,2)$。`,
      { t: 'fade', title: '分步练习：一条直线的 margin', plan: [T`每个点算 $y_i(\bw'\bx_i+b)$`, T`除以 $\|\bw\|$ 得距离`, '取最小值 = margin'], items: [
        { md: T`上面的例子。`, steps: [
          { md: '$1,2,1$' }, { md: '$0.707,1.414,0.707$' }, { md: 'margin ≈ 0.707' },
        ] },
        { md: T`$\bw=(3,4)$，$b=0$，点 $(1,1)$ 标签 $+1$、$(-1,0)$ 标签 $-1$。`, steps: [
          { ask: T`第二个点的 $y(\bw'\bx+b)=?$`, answer: 3, show: T`得分 $\bw'\bx+b=3\times(-1)+4\times0+0=-3$，再乘标签：$(-1)\times(-3)=3$` },
          { ask: '第一个点的距离 = ?', answer: 1.4, show: T`第一个点得分 $3\times1+4\times1=7$（标签 $+1$，乘完还是 7）；$\|\bw\|=\sqrt{3^2+4^2}=5$；距离 $7/5=1.4$` },
          { ask: 'margin = ?', answer: 0.6, show: T`第二个点距离 $3/5=0.6$；margin 取最小：$\min(1.4,\ 0.6)=0.6$` },
        ] },
        { md: T`$\bw=(0,2)$，$b=-2$（直线 $x_2=1$），点 $(0,3)$ $+1$、$(5,2)$ $+1$、$(1,0)$ $-1$。`, steps: [
          { ask: T`$\|\bw\|=?$`, answer: 2, show: '2' },
          { ask: T`三个点的距离中最小的（margin）= ?`, answer: 1, show: T`$(0,3)$：$f=4$，距离 2；$(5,2)$：$f=2$，距离 1；$(1,0)$：$y f=(-1)(-2)=2$，距离 1。margin = 1，最近点是后两个。` },
        ] },
      ] },
    ],
    viz: [
      { id: 'margin-svm', how: '平面上是可分的红蓝两类点。用角度和偏移两个滑块摆一条分界线，虚线是穿过两侧最近点的平行线，读数显示几何 margin $\\min_i y_i(\\bw\'\\bx_i+b)/\\|\\bw\\|$（分错时为负）。',
        try: '① 先手动摆出一条能分开、但贴着某个点的线：margin 很小。② 慢慢转动和平移，让 margin 变大。③ 点"max-margin"看最优解，被高亮的点就是 support vectors——通常只有 2–3 个。' },
      { id: 'hyperplane-2d', opts: { w1: 1, w2: 1, b: -3, points: [[1, 1], [3, 2], [2, 2]] }, how: '第 3 章的距离工具，预设成上面例题的直线和点。',
        try: '验证表格里的三个距离。' },
    ],
    compare: [
      { t: 'table', head: ['', 'Functional margin', 'Geometric margin'], rows: [
        ['公式', '$y_i(\\bw\'\\bx_i+b)$', '$\\frac{y_i(\\bw\'\\bx_i+b)}{\\|\\bw\\|}$'],
        ['$(\\bw,b)$ 乘 2 时', '翻倍', '不变'],
        ['几何意义', '无（依赖缩放）', '真实距离'],
        ['SVM 中', '固定最近点为 1（c26）', 'canonical scaling 之后要最大化的量 $=1/\\|\\bw\\|$'],
      ] },
    ],
    pitfalls: [
      ['margin 是两条虚线之间的宽度', 'L08 p13 定义为边界到最近点的距离（单侧）；两条虚线间宽度是它的 2 倍（canonical scaling 之后 $=2/\\|\\bw\\|$）。'],
      ['训练误差都是 0 的边界一样好', '离点更远的更稳健（L08 p8）。'],
      ['SVM 标签用 0/1', '用 $\\pm1$，才能用 $y_i(\\cdot)$ 统一两侧。'],
      ['functional margin 就是距离', '要除以 $\\|\\bw\\|$（往年 2021 Q2 就考这个区别）。'],
    ],
    quiz: [
      { type: 'num', q: '$\\bw=(6,8)$，$b=-10$，点 $(2,1)$ 标签 $+1$。几何距离？', answer: 1, explain: T`要算点到边界的几何距离（geometric margin，几何间隔）$\frac{y(\bw'\bx+b)}{\|\bw\|}$。代入题目：得分 $\bw'\bx+b=6\times2+8\times1-10=12+8-10=10$；标签 $y=+1$，乘完还是 10；$\|\bw\|=\sqrt{6^2+8^2}=\sqrt{36+64}=10$。距离 $=10/10=1$，结果为正，说明这个点在正确的一侧。**忘了除以 $\|\bw\|$ 就会得到 10**，那是下一题的 functional margin。` },
      { type: 'num', q: '同上，functional margin？', answer: 10, explain: T`Functional margin（函数间隔）就是距离公式的分子 $y(\bw'\bx+b)$，不除以 $\|\bw\|$。上一题已算出得分 $\bw'\bx+b=10$，标签 $y=+1$，所以 functional margin $=1\times10=10$。它也等于几何距离乘 $\|\bw\|$：$1\times10=10$。**它会随 $(\bw,b)$ 的缩放而变，所以不是真实距离。**` },
      { type: 'mc', q: '把 $(\\bw,b)$ 都乘 5，几何 margin：', options: ['×5', '÷5', '不变', '×25'], answer: 2, explain: T`把 $(\bw,b)$ 换成 $(5\bw,5b)$，边界 $5\bw'\bx+5b=0$ 和 $\bw'\bx+b=0$ 是**同一条线**，点到它的距离当然不变。用公式看：分子 $y(5\bw'\bx+5b)$ 变成 5 倍，分母 $\|5\bw\|=5\|\bw\|$ 也变成 5 倍，正好抵消。最容易误选"×5"：那是 functional margin $y(\bw'\bx+b)$ 的变化，它没有除以 $\|\bw\|$。` },
      { type: 'show', q: '（英文）Why does the SVM prefer the maximum-margin boundary when several boundaries have zero training error?', answer: T`A boundary far from all training points is more robust: new points drawn near the training data are less likely to fall on the wrong side, so the maximum-margin separator is expected to generalise better than one passing close to some training points.`, qzh: '当有多条边界的训练误差都为 0 时，为什么 SVM 偏好最大间隔（maximum-margin）边界？', azh: '离所有训练点都远的边界更稳健（robust）：在训练数据附近抽到的新点不太容易落到错误的一侧，所以最大间隔分隔面（maximum-margin separator）预期会比贴近某些训练点的边界泛化（generalise）得更好。' },
    ],
  });

  /* =====================================================================
   * c26 · Hard-margin SVM（L08 p19–p27）
   * ===================================================================== */
  add({
    id: 'c26', week: 'W4', lec: 'L08', pages: 'L08 p19–p27', star: 3,
    keyEn: [
      T`Scaling $(\bw,b)$ by any $\alpha>0$ leaves the boundary unchanged, so fix the canonical scale $\min_iy_i(\bw'\bx_i+b)=1$; the margin is then $1/\|\bw\|$.`,
      T`Hard-margin SVM primal: $\min_{\bw,b}\frac12\|\bw\|^2$ s.t. $y_i(\bw'\bx_i+b)\ge1$ for all $i$ (maximising $1/\|\bw\|$ $\Leftrightarrow$ minimising $\frac12\|\bw\|^2$).`,
      T`Support vectors satisfy $y_i(\bw'\bx_i+b)=1$: functional margin 1, but Euclidean distance $1/\|\bw\|$. The solution depends only on them.`,
      T`As regularised ERM: $\frac12\|\bw\|^2$ is the regulariser and the constraints act as a 0-or-$\infty$ loss; if the data are not linearly separable there is no solution.`,
    ],
    keyZh: [
      T`$(\bw,b)$ 同乘一个正数，边界不变，所以可以自己选刻度：规定最近点的 $y_i(\bw'\bx_i+b)=1$（canonical scaling，规范化缩放），此时 margin $=1/\|\bw\|$。`,
      T`硬间隔 SVM 原问题（primal）：最大化 $1/\|\bw\|$ 等价于最小化 $\frac12\|\bw\|^2$（平方光滑、好求导）；约束要求每个点都分对，且函数间隔至少为 1。`,
      T`支持向量（support vectors）是约束取等号的点：函数间隔为 1，但欧氏距离是 $1/\|\bw\|$，不一定是 1（2021 Q2）。解只由它们决定，其他点稍微挪动不影响解。`,
      T`看成正则化 ERM：$\frac12\|\bw\|^2$ 是正则项，约束相当于损失：满足为 0、违反为 ∞（分对但太近也算违反）。数据线性不可分时约束满足不了，问题无解。`,
    ],
    examQ: [
      { src: '2021 Q2', q: T`For the hard-margin support vector machine, data points that are support vectors have a margin of 1 from the decision boundary. Explain how this can be the case even when support vectors are further than 1 unit away from the decision boundary in Euclidean space.`,
        a: T`The 1 is the functional margin $y_i(\bw'\bx_i+b)=1$: since rescaling $(\bw,b)$ does not change the boundary, the scale is fixed so that the closest points have functional margin 1 (canonical form). Their Euclidean distance is $1/\|\bw\|$, which can exceed 1.`,
        qzh: T`对于硬间隔支持向量机（hard-margin support vector machine），作为支持向量（support vectors）的数据点到决策边界（decision boundary）的间隔（margin）为 1。请解释：即使支持向量在欧氏空间（Euclidean space）中离决策边界超过 1 个单位，这为什么仍然成立。`,
        azh: T`这里的 1 是函数间隔（functional margin）$y_i(\bw'\bx_i+b)=1$：因为对 $(\bw,b)$ 整体缩放不会改变边界，所以把尺度固定成让最近的点函数间隔恰好为 1（规范形式 canonical form）。这些点的欧氏距离是 $1/\|\bw\|$，它可以大于 1。` },
      { src: '2026 practice Q1c', q: T`Consider the data shown with the hard-margin linear SVM decision boundary between the two classes (figure on the [T4](#/T04) page). Which points (by index 1–6) would be the support vectors of the SVM?`,
        a: T`Points 1, 2 and 4, as they all lie on the margin: they are the closest points to the boundary on each side, with $y_i(\bw'\bx_i+b)=1$.`,
        qzh: T`考虑图中的数据，以及两类之间的硬间隔线性 SVM（hard-margin linear SVM）决策边界（decision boundary），图见 [T4](#/T04) 页。哪些点（按编号 1–6）会是这个 SVM 的支持向量（support vectors）？`,
        azh: T`点 1、2 和 4，因为它们都落在间隔（margin）上：它们是两侧离边界最近的点，满足 $y_i(\bw'\bx_i+b)=1$。` },
    ],
    title: 'Hard-margin SVM', en: 'Hard-margin SVM: canonical scaling and the primal problem',
    summary: '$(\\bw,b)$ 乘任意正数不改变边界，所以固定"最近点的 functional margin = 1"（**canonical scaling**）。于是 margin $=1/\\|\\bw\\|$，最大化 margin ⇔ 最小化 $\\frac12\\|\\bw\\|^2$，约束 $y_i(\\bw\'\\bx_i+b)\\ge1$。等号成立的点是 support vectors。',
    prereq: ['c25'],
    symbols: [
      [T`$\alpha>0$`, T`任意正的缩放因子`],
      [T`$\tilde\bw=\alpha\bw$`, T`缩放后的参数（同一条边界）`],
      [T`$l_\infty$`, T`hard-margin 的损失：0 或 ∞`],
      [T`$\text{s.t.}$`, T`subject to（约束）`],
    ],
    goals: [
      '解释 canonical scaling 为什么合法、它把目标变成什么（L08 p19–p21）',
      '写出 hard-margin SVM 的 primal 问题',
      '把它看成 regularised ERM：$\\|\\bw\\|^2$ 是正则项，约束是 0/∞ 的损失（L08 p23–p27）',
      '能回答 2021 Q2：支持向量"margin 为 1"但欧氏距离不是 1 的原因',
    ],
    types: ['T04', 'T13'],
    what: [
      { t: 'h3', text: '① 问题：最大化 margin 的式子太难直接解（L08 p17–p19）' },
      T`c25 的目标是"让最近点到分界线的距离最大"，式子里同时有 $\bw$、$b$ 和"哪个点最近"，很难直接优化。L08 p19 的观察：把 $\bw$ 和 $b$ 同时乘一个正数，分界线 $\bw'\bx+b=0$ 根本不变。既然刻度可以随便选，就选一个方便的：**让最近点的 $y_i(\bw'\bx_i+b)$ 恰好等于 1**。这样 margin 只剩 $1/\|\bw\|$，问题变成一个干净的"在约束下最小化 $\|\bw\|^2$"。`,
      { t: 'h3', text: '② 做法：固定刻度，让 margin 变成 1/‖w‖（L08 p19–p21）' },
      T`**缩放不变**（L08 p19）：$\bw'\bx+b=0$ 和 $\alpha\bw'\bx+\alpha b=0$（$\alpha>0$）是**同一条边界、同一个分类器**。所以 c25 的目标有无穷多个解，不唯一。`,
      T`**Canonical scaling（规范化缩放）**（L08 p20）：选一个 $\alpha$ 让最近点的 functional margin 恰好为 1：$\min_iy_i(\bw'\bx_i+b)=1$。于是：`,
      { t: 'ul', items: [
        T`所有点满足 $y_i(\bw'\bx_i+b)\ge1$；等号成立的就是 **support vectors**。`,
        T`margin（最近点距离）$=\frac{1}{\|\bw\|}$。`,
        T`最大化 $\frac1{\|\bw\|}$ ⇔ 最小化 $\|\bw\|$ ⇔ 最小化 $\frac12\|\bw\|^2$（单调变换，后者光滑好算，L08 p21）。`,
      ] },
      { t: 'math', tex: T`\textbf{Hard-margin SVM:}\quad\argmin_{\bw,b}\ \frac12\|\bw\|^2\quad\text{s.t.}\quad y_i(\bw'\bx_i+b)\ge1,\ \ i=1,\dots,n` },
      T`**Hard margin** 的意思：所有训练点都必须在 margin 之外、并且在正确的一侧（L08 p21）。$b$ 不出现在目标里，通过约束间接被优化。`,
    ],
    why: [
      T`这是 SVM 的标准形式（**primal problem，原问题**）。c28 会用 Lagrangian 推出它的 **dual（对偶）**，进而引出 kernel trick（c29）。往年 2021 Q2 原题就考 canonical scaling；2026 Q1c 考看图找支持向量（[T4](#/T04)）。`,
    ],
    intuition: [
      T`**为什么能"规定"最近点是 1？** 因为缩放 $(\bw,b)$ 不改变分类器。就像量身高可以用米也可以用厘米——选一个方便的单位。规定之后，"让最近点离得远"就变成"让 $\|\bw\|$ 小"。`,
      T`**SVM = 正则化 ERM**（L08 p24–p27）：对比 ridge $\sum(y_i-\bw'\bx_i)^2+\lambda\|\bw\|^2$。SVM 的 $\frac12\|\bw\|^2$ 就是正则项；约束相当于一个损失：满足 $y_i(\bw'\bx_i+b)\ge1$ 损失为 0，否则为 **∞**（不允许）。注意：分对但离边界太近（$<1/\|\bw\|$）也是 ∞——"太近也不行"。`,
      { t: 'think', q: '（2021 Q2）硬间隔 SVM 里支持向量"margin 为 1"，可它们离边界的欧氏距离明显不是 1，为什么？', a: T`"1"是 **functional margin** $y_i(\bw'\bx_i+b)=1$，不是距离。真正的欧氏距离是 $1/\|\bw\|$。因为 $(\bw,b)$ 可以任意正缩放，SVM 用 canonical scaling 把最近点的 functional margin 固定为 1，几何距离由 $\|\bw\|$ 决定。` },
      { t: 'story', title: 'SVM 的诞生', md: '"最大间隔超平面"的想法最早见于 Vapnik 和 Lerner、Chervonenkis 在 1960 年代的工作（"generalized portrait"，广义肖像法）。1992 年 Boser、Guyon 和 Vapnik 把它和 kernel trick 结合（第 29 章），1995 年 Cortes 和 Vapnik 提出 soft margin（第 27 章），SVM 随后成为 2000 年代最流行的分类器之一。' },
    ],
    math: [
      { t: 'h3', text: 'Hard-margin 损失（L08 p25–p26）' },
      { t: 'math', tex: T`l_\infty=\begin{cases}0,&1-y_i(\bw'\bx_i+b)\le0\\\infty,&1-y_i(\bw'\bx_i+b)>0\end{cases}` },
      T`于是 hard-margin SVM $=\argmin_{\bw,b}\ \sum_il_\infty+\frac12\|\bw\|^2$：正则项 + 损失。L08 p24 的通用建模套路："选模型 → 选损失 → 最小化训练损失"。`,
      { t: 'h3', text: '手算 canonical 解（一维 / 对称情形）' },
      T`一维：负类 $x=1$，正类 $x=3$。边界显然在 2。canonical：$3w+b=1$，$1\cdot w+b=-1$ ⇒ $w=1$，$b=-2$。margin $=1/|w|=1$（正好是两点距离的一半）✓。`,
      T`二维：负类 $(0,0)$，正类 $(2,2)$。只有两个点时，最大 margin 边界是两点连线的**垂直平分线**；法向量 $\bw$ 垂直于边界，也就是**平行于两点的连线**，连线方向是 $(2,2)-(0,0)\propto(1,1)$，所以 $\bw\parallel(1,1)$。设 $\bw=(a,a)$。两个支持向量都满足 $y(\bw'\bx+b)=1$：负类 $(0,0)$：$(-1)\cdot(0+b)=1$ ⇒ $b=-1$；正类 $(2,2)$：$2a+2a+b=4a+b=1$ ⇒ $4a-1=1$ ⇒ $a=0.5$，$\bw=(0.5,0.5)$，$\|\bw\|=\frac{\sqrt2}{2}$，margin $=\sqrt2\approx1.414$ = 两点距离 $2\sqrt2$ 的一半 ✓。`,
    ],
    fx: [
      {
        title: 'Hard-margin SVM primal', tex: T`\argmin_{\bw,b}\ \htmlClass{fx-p1}{\tfrac12\|\bw\|^2}\quad\text{s.t.}\quad\htmlClass{fx-p2}{y_i(\bw'\bx_i+b)\ge1}`,
        parts: [
          { label: '½‖w‖²', note: '最小化 $\\|\\bw\\|$ = 最大化 margin $1/\\|\\bw\\|$。$\\frac12$ 和平方只为求导方便。也是正则项。' },
          { label: '约束', note: '每个点都在正确一侧且 functional margin ≥ 1。等号成立 ⇔ 支持向量。数据不可分时**无解**——需要 soft margin（c27）。' },
        ],
      },
    ],
    example: [
      { t: 'h3', text: '看图找支持向量（2026 Q1c 题型）' },
      T`一维数据：负类 $x=0,1$，正类 $x=4,5$。最大 margin 边界在 1 和 4 的中点 2.5，支持向量是 $x=1$ 和 $x=4$（最近的那两个）。其他点（0、5）挪动一点不影响解——**解只依赖支持向量**。真题的完整解答见 [T4](#/T04)。`,
      { t: 'fade', title: '分步练习：canonical 参数与 margin', plan: ['找边界位置（最近两点的中垂线）', T`用 $y(\bw'\bx+b)=1$ 在支持向量上列方程解 $\bw,b$`, T`margin $=1/\|\bw\|$`], items: [
        { md: T`一维：负类 $x=1$，正类 $x=3$。`, steps: [
          { md: '边界 $x=2$' }, { md: T`$3w+b=1$，$w+b=-1$ ⇒ $w=1,b=-2$` }, { md: 'margin $=1$' },
        ] },
        { md: T`一维：负类 $x=0$，正类 $x=4$。边界 $x=2$。`, steps: [
          { ask: T`$w=?$`, answer: 0.5, show: T`负类 $x=0$（标签 $-1$）：$(-1)(0\cdot w+b)=1$ ⇒ $b=-1$；正类 $x=4$：$4w+b=1$ ⇒ $4w-1=1$ ⇒ $w=0.5$` },
          { ask: 'margin = ?', answer: 2, show: '$1/0.5=2$（两点距离 4 的一半）' },
        ] },
        { md: T`二维：负类 $(1,0)$，正类 $(3,0)$。`, steps: [
          { ask: T`边界 $x_1=?$`, answer: 2, show: '中点' },
          { ask: T`$w_1=?$（$\bw=(w_1,0)$）`, answer: 1, show: T`$3w_1+b=1$，$w_1+b=-1$ ⇒ $w_1=1$，$b=-2$` },
          { ask: 'margin = ?', answer: 1, show: '$1/1=1$' },
        ] },
      ] },
    ],
    viz: [
      { id: 'svm-grid', opts: { preset: 'EX2026Q1c' }, how: '2026 practice Q1c 的数据点（网格坐标）。工具画出最大 margin 边界、两条 margin 线，并标出支持向量。',
        try: '先遮住答案自己判断哪几个点是支持向量，再看工具结果。点击删掉一个**非**支持向量的点，再在 margin 外面点一个新的格子加回去：边界不变。（工具里点空格交点 = 加点，点已有的点 = 删点。）' },
      { id: 'margin-svm', how: '和第 25 章同一个工具：点"max-margin"后，读数是 $\\|\\bw\\|=1$ 时的几何 margin。它在数值上等于 canonical scaling 之后的 $1/\\|\\bw_{\\text{can}}\\|$（滑块上的 $\\bw$ 是单位向量，不是 canonical 参数）。',
        try: '找到最优解后，确认高亮的支持向量到边界距离都相等。' },
    ],
    compare: [
      { t: 'table', head: ['', 'Ridge regression', 'Hard-margin SVM'], rows: [
        ['数据项（损失）', '$\\sum(y_i-\\bw\'\\bx_i)^2$', '$\\sum l_\\infty$（0 或 ∞）'],
        ['正则项', '$\\lambda\\|\\bw\\|^2$', '$\\frac12\\|\\bw\\|^2$'],
        ['任务', '回归', '分类'],
        ['解依赖', '所有点', '只依赖支持向量'],
      ] },
      { t: 'exam', md: T`**Hard-margin SVM (2021 Q2 style):** Since scaling $(\mathbf w,b)$ by any $\alpha>0$ leaves the decision boundary unchanged, we fix the scale so that the closest points satisfy $y_i(\mathbf w'\mathbf x_i+b)=1$ (canonical form). The margin is then $1/\|\mathbf w\|$, so maximising it is equivalent to $\min_{\mathbf w,b}\frac12\|\mathbf w\|^2$ subject to $y_i(\mathbf w'\mathbf x_i+b)\ge1$ for all $i$. The "margin of 1" of the support vectors is this functional margin; their Euclidean distance to the boundary is $1/\|\mathbf w\|$.` },
    ],
    pitfalls: [
      ['支持向量到边界的欧氏距离是 1', '是 $1/\\|\\bw\\|$；1 是 functional margin。'],
      ['最大化 margin = 最大化 $\\|\\bw\\|$', '最小化 $\\|\\bw\\|$。'],
      ['$b$ 也在目标里被惩罚', '目标只有 $\\frac12\\|\\bw\\|^2$，$b$ 只出现在约束里。'],
      ['数据不可分时 hard-margin 也能给出解', '约束无法满足，问题无解（L08 p29）。'],
    ],
    quiz: [
      { type: 'num', q: 'Canonical 形式下 $\\|\\bw\\|=0.25$。margin（边界到最近点）？', answer: 4, explain: T`Canonical scaling（规范化缩放）把最近点的 functional margin 固定为 $y_i(\bw'\bx_i+b)=1$，所以最近点到边界的距离就是 $\frac{1}{\|\bw\|}$。代入 $\|\bw\|=0.25$：$1/0.25=4$。**本课的 margin 指边界到最近点（单侧）**；若算成 $2/\|\bw\|=8$，那是两条虚线之间的总宽度。` },
      { type: 'num', q: '一维：负类 $x=-1$，正类 $x=1$。canonical $w=?$', answer: 1, explain: T`只有两个点时，它们都是支持向量，都满足 canonical 条件 $y(wx+b)=1$。正类 $x=1$、$y=+1$：$(+1)(w\cdot1+b)=1$ ⇒ $w+b=1$；负类 $x=-1$、$y=-1$：$(-1)(w\cdot(-1)+b)=1$ ⇒ $-w+b=-1$。两式相加 $2b=0$ ⇒ $b=0$，代回得 $w=1$。验算：margin $=1/|w|=1$，正好是两点距离 2 的一半，边界在中点 $x=0$。**负类的方程别漏了乘 $y=-1$**，否则会写成 $-w+b=1$。` },
      { type: 'mc', q: '下面哪个点是支持向量？（canonical 形式）', options: ['$y_i(\\bw\'\\bx_i+b)=3$', '$y_i(\\bw\'\\bx_i+b)=1$', '$y_i(\\bw\'\\bx_i+b)=-1$', '$y_i(\\bw\'\\bx_i+b)=0$'], answer: 1, explain: T`Canonical 形式下，所有点都满足约束 $y_i(\bw'\bx_i+b)\ge1$。**支持向量就是约束取等号（$=1$）的点**：它们正好落在 margin 线（虚线）上，离边界 $1/\|\bw\|$，是最近的点。$=3$ 的点离得更远，不是支持向量；$=0$ 表示点在决策边界上，$=-1$ 表示分错，两者都违反了 hard margin 的约束 $\ge1$，最优解里不会出现。常见误解是以为支持向量在决策边界上（$=0$），其实它们在 margin 线上。` },
      { type: 'mc', q: 'Hard-margin 损失对"分对但离边界太近"的点是：', options: ['0', '1', '∞', '负数'], answer: 2, explain: 'L08 p26–p27：太近也不允许。' },
      { type: 'show', q: '（英文）Write the hard-margin SVM optimisation problem and identify the support vectors.', answer: T`$\min_{\mathbf w,b}\frac12\|\mathbf w\|^2$ subject to $y_i(\mathbf w'\mathbf x_i+b)\ge1$ for $i=1,\dots,n$. The support vectors are the training points for which the constraint is tight, $y_i(\mathbf w'\mathbf x_i+b)=1$, i.e. those lying on the margin boundaries.`, qzh: '写出硬间隔 SVM（hard-margin SVM）的优化问题，并指出哪些点是支持向量（support vectors）。', azh: T`$\min_{\mathbf w,b}\frac12\|\mathbf w\|^2$，约束条件（subject to）为对 $i=1,\dots,n$ 有 $y_i(\mathbf w'\mathbf x_i+b)\ge1$。支持向量（support vectors）是约束取等号（tight）的训练点，即 $y_i(\mathbf w'\mathbf x_i+b)=1$，也就是位于间隔边界（margin boundaries）上的点。` },
    ],
  });

  /* =====================================================================
   * c27 · Soft margin、hinge、slack（L08 p28–p35）
   * ===================================================================== */
  add({
    id: 'c27', week: 'W4', lec: 'L08', pages: 'L08 p28–p35', star: 2,
    keyEn: [
      T`Soft-margin SVM: $\min_{\bw,b,\boldsymbol\xi}\frac12\|\bw\|^2+C\sum_i\xi_i$ s.t. $y_i(\bw'\bx_i+b)\ge1-\xi_i$, $\xi_i\ge0$; slack variables let points violate the margin at a linear cost.`,
      T`Equivalent form: hinge loss $\sum_i\max\big(0,1-y_i(\bw'\bx_i+b)\big)$ plus $\lambda\|\bw\|^2$, with $C\propto1/\lambda$; at the optimum each $\xi_i$ equals its hinge loss.`,
      T`$\xi_i=0$: on or outside the margin; $0<\xi_i<1$: correct but inside the margin; $\xi_i=1$: on the boundary; $\xi_i>1$: misclassified.`,
      T`Large $C$: violations are expensive, so the margin is narrow, close to hard margin if the data are separable (risk of overfitting); small $C$: wider margin, more violations, stronger regularisation.`,
    ],
    keyZh: [
      T`软间隔 SVM（soft-margin SVM）：给每个点一个松弛变量（slack）$\xi_i\ge0$，允许它进入 margin 甚至被分错，但目标里按 $C\xi_i$ 线性罚款。`,
      T`等价写法：合页损失（hinge loss）之和 + $\lambda\|\bw\|^2$，和 ridge 同结构；$C$ 与 $1/\lambda$ 成正比。最优时每个 $\xi_i$ 正好等于该点的 hinge loss。`,
      T`用 $\xi_i$ 判断点的位置：等于 0 在 margin 外或正好在线上；在 0 和 1 之间是分对但进了 margin；等于 1 正好在决策边界上；大于 1 才是分错。`,
      T`$C$ 大：违规贵，margin 窄，数据可分时接近 hard margin，可能过拟合；$C$ 小：违规便宜，margin 宽、违规多，正则更强。方向和 $\lambda$ 相反。`,
    ],
    title: 'Soft margin、hinge loss、slack', en: 'Soft-margin SVM, hinge loss, slack variables',
    summary: '真实数据很少完全可分。**Soft-margin SVM** 允许点进入 margin 甚至分错，但按违反程度罚：把 ∞ 损失换成 **hinge loss（合页损失 / 铰链损失）** $\\max(0,1-y_i(\\bw\'\\bx_i+b))$，等价地引入 **slack variables（松弛变量）** $\\xi_i$。$C$ 控制"宽 margin"和"少违规"的权衡。',
    prereq: ['c26'],
    symbols: [
      [T`$\xi_i$`, T`第 $i$ 个点的 slack（松弛量），$\xi_i\ge0$`],
      [T`$C$`, T`惩罚系数：越大越接近 hard margin`],
      [T`$l_h$`, T`hinge loss`],
      [T`$\lambda$`, T`正则系数；$C$ 与 $1/\lambda$ 成正比`],
    ],
    goals: [
      '解释 hard margin 为什么在真实数据上不行，以及三种对策（L08 p29）',
      '写出 hinge loss，并计算一个点的 hinge loss / slack',
      '写出 soft-margin SVM 的两种等价形式（hinge + 正则；slack + 约束）',
      '说出 $C$ 大 / 小时 margin 和违规点数怎么变',
    ],
    types: ['T04'],
    what: [
      T`**问题**（L08 p29）：数据混在一起时，没有直线能满足所有 hard-margin 约束——问题无解。三种对策：① 变换数据（kernel，c29）；② 放松约束（本章）；③ 两者结合。`,
      T`c26 的约束要求**每个**点都在 margin 外并且分对，违反一点就"判死刑"（当成损失无穷大），数据一混在一起就无解。放松的意思是：**违反一点，罚一点**。一个点的 $y_i(\bw'\bx_i+b)$ 要求至少是 1；差多少罚多少，已经 $\ge1$ 就罚 0。注意分对但贴着边界的点（比如 $y_i(\bw'\bx_i+b)=0.5$）也要罚 $0.5$——SVM 要的不只是分对，还要留出 margin。这个罚法就是：`,
      T`**Hinge loss（合页损失）**（L08 p31–p32）：`,
      { t: 'math', tex: T`l_h=\max\big(0,\ 1-y_i(\bw'\bx_i+b)\big)=\begin{cases}0,&y_i(\bw'\bx_i+b)\ge1\ \ (\text{在 margin 外、分对})\\1-y_i(\bw'\bx_i+b),&\text{否则（线性罚）}\end{cases}` },
      T`**Soft-margin SVM，形式 1（正则化 ERM）**（L08 p32）：$\argmin_{\bw,b}\ \sum_il_h(\bx_i,y_i,\bw,b)+\lambda\|\bw\|^2$——和 ridge 结构一样。`,
      T`形式 1 和 ridge 一个样子（损失 + $\lambda\|\bw\|^2$）。考试更常见的是带约束的写法，它和 c26 的 hard margin 长得更像：给每个点一个**松弛量** $\xi_i\ge0$，允许约束放松成 $y_i(\bw'\bx_i+b)\ge1-\xi_i$，再在目标里按 $\xi_i$ 罚款。最优时 $\xi_i$ 正好等于这个点的 hinge loss，所以两种写法是同一件事。`,
      T`**形式 2（slack variables，松弛变量）**（L08 p33–p34）：给每个点一个 $\xi_i\ge l_h$：`,
      { t: 'math', tex: T`\argmin_{\bw,b,\boldsymbol\xi}\ \frac12\|\bw\|^2+C\sum_{i=1}^n\xi_i\quad\text{s.t.}\quad y_i(\bw'\bx_i+b)\ge1-\xi_i,\ \ \xi_i\ge0` },
      T`"soft" 指约束可以被 $\xi_i$ 违反。课件说 $C=1/\lambda$（严格对比两种形式其实是 $C=\frac{1}{2\lambda}$，差一个常数 2）。**考试按课件写 $C=1/\lambda$ 即可**，要点是 $C$ 越大 ⇔ 正则越弱。`,
    ],
    why: [
      T`soft margin 才是实际使用的 SVM。hinge loss 也让你看到 SVM、logistic regression、感知机其实都是"线性模型 + 不同损失"（c15、c31），这是简答题常用的比较角度。`,
    ],
    intuition: [
      T`**$\xi_i$ 的几种情况**：$\xi_i=0$：在 margin 外（或正好在 margin 线上）、分对；$0<\xi_i<1$：分对了但进了 margin；$\xi_i=1$：正好在决策边界上；$\xi_i>1$：分错了（越过了边界）。下图（L08 p30）里橙色线段的长度就是违规量 $\xi_i=\max(0,1-y_i(\bw'\bx_i+b))$。`,
      { t: 'slide', src: 'L08/p30', caption: 'Soft margin：橙色线段 = 每个违规点的 slack $\\xi_i$（进了 margin 或越过边界的距离）。' },
      T`**$C$ 的作用**：$C$ 大 → 违规很贵 → 尽量不违规 → margin 窄（接近 hard margin，可能过拟合）；$C$ 小 → 违规便宜 → margin 宽、容忍更多违规（更强正则，可能欠拟合）。和 $\lambda$ 的方向相反。`,
      { t: 'think', q: 'hinge loss 和 0-1 loss 比，对"分对但离边界很近（$y f=0.5$）"的点怎么处理？对"分得很对（$yf=3$）"呢？', a: 'hinge 对 $yf=0.5$ 罚 0.5（0-1 loss 不罚）——它要求的不只是分对，还要有 margin。对 $yf=3$ 两者都是 0。对分错的点，hinge 按错的程度线性罚，0-1 loss 只罚 1。' },
      { t: 'story', title: 'Support-vector networks', md: 'Soft margin 来自 Corinna Cortes 和 Vladimir Vapnik 1995 年的论文 "Support-Vector Networks"。它让 SVM 能处理有噪声、不可分的真实数据，是 SVM 在实践中成功的关键一步。' },
    ],
    math: [
      { t: 'h3', text: '从 hinge 到 slack（L08 p33）' },
      T`$\xi_i\ge\max(0,1-y_i(\bw'\bx_i+b))$ ⇔ $\xi_i\ge1-y_i(\bw'\bx_i+b)$ 且 $\xi_i\ge0$。在最优解处 $\xi_i$ 会压到等号（否则减小它目标更小），所以两种形式等价。整理约束得 $y_i(\bw'\bx_i+b)\ge1-\xi_i$（L08 p34）。`,
      { t: 'h3', text: '三种损失对比（横轴 $y\\cdot f(\\bx)$）' },
      { t: 'table', head: ['$y f(\\bx)$', '0-1 loss', 'hinge', 'hard-margin $l_\\infty$'], rows: [
        ['2', '0', '0', '0'], ['1', '0', '0', '0'], ['0.5', '0', '0.5', '∞'], ['0（正好在边界上）', '1 或 0（边界上的点判给哪一类，看约定）', '1', '∞'], ['−1', '1', '2', '∞'],
      ] },
    ],
    fx: [
      {
        title: 'Soft-margin SVM', tex: T`\min\ \htmlClass{fx-p1}{\tfrac12\|\bw\|^2}+\htmlClass{fx-p2}{C}\sum_i\htmlClass{fx-p3}{\xi_i}\quad\text{s.t.}\ \ y_i(\bw'\bx_i+b)\ge1-\xi_i,\ \ \xi_i\ge0`,
        parts: [
          { label: '½‖w‖²', note: '宽 margin（正则项）。' },
          { label: 'C', note: '违规的代价。数据线性可分时，$C\\to\\infty$ 退化为 hard margin；不可分时 hard margin 本身无解。' },
          { label: 'ξ_i', note: '第 $i$ 个点违规的量 = 它的 hinge loss（最优时）。' },
        ],
      },
    ],
    example: [
      { t: 'h3', text: '算 slack 和目标值' },
      T`$\bw=(1,0)$，$b=-2$（边界 $x_1=2$，margin 线 $x_1=1$ 和 $x_1=3$），$C=1$：`,
      { t: 'table', cls: 'compact', head: ['点', '$y$', '$f=\\bw\'\\bx+b$', '$yf$', '$\\xi=\\max(0,1-yf)$', '情况'], rows: [
        ['$(4,0)$', '+1', '2', '2', '0', 'margin 外'],
        ['$(2.5,1)$', '+1', '0.5', '0.5', '0.5', '分对但进了 margin'],
        ['$(1.5,0)$', '+1', '−0.5', '−0.5', '1.5', '分错'],
        ['$(0,3)$', '−1', '−2', '2', '0', 'margin 外'],
      ] },
      T`$\|\bw\|^2=1^2+0^2=1$，所以目标 $=\frac12\times1+1\times(0+0.5+1.5+0)=2.5$。`,
      { t: 'fade', title: '分步练习：hinge loss / slack', plan: [T`算得分 $f=\bw'\bx+b$`, T`乘标签得 $yf$`, T`$\xi=\max(0,1-yf)$`], items: [
        { md: T`$\bw=(1,0)$，$b=-2$，点 $(2.5,1)$，$y=+1$。`, steps: [
          { md: '$f=0.5$' }, { md: '$yf=0.5$' }, { md: '$\\xi=0.5$' },
        ] },
        { md: T`同一模型，点 $(2,5)$，$y=-1$。`, steps: [
          { ask: '$yf=?$', answer: 0, show: T`$f=0$，$yf=0$` },
          { ask: T`$\xi=?$`, answer: 1, show: '$1-0=1$（正好在边界上）' },
        ] },
        { md: T`$\bw=(2,1)$，$b=-1$，点 $(0,0)$，$y=+1$。`, steps: [
          { ask: '$f=?$', answer: -1, show: '$-1$' },
          { ask: '$yf=?$', answer: -1, show: '$-1$（分错）' },
          { ask: T`$\xi=?$`, answer: 2, show: '$1-(-1)=2$' },
        ] },
      ] },
    ],
    viz: [
      { id: 'soft-margin', how: '不可分的数据。滑块是 $\\log_{10}C$。实线是边界，虚线是 $\\bw\'\\bx+b=\\pm1$，每个违规点旁边标出它的 $\\xi_i$，读数给出支持向量个数、$\\sum\\xi_i$、margin 宽度 $2/\\|\\bw\\|$。',
        try: '① $C$ 很小（左端）：margin 很宽，很多点有 slack，支持向量多。② $C$ 很大（右端）：margin 变窄，尽量把每个点挤出 margin，接近 hard margin。③ 观察 margin 宽度和 $\\sum\\xi$ 此消彼长。' },
      { id: 'hinge-loss', how: '横轴是 $s=y f(\\bx)$，三条曲线分别是 hinge、0-1、logistic loss。滑块读出三者的值。',
        try: '把 $s$ 从 3 拉到 −2：hinge 在 $s\\ge1$ 时为 0，之后线性上升；0-1 loss 在 0 处跳变；logistic loss 处处光滑、永远大于 0。' },
    ],
    compare: [
      { t: 'table', head: ['', 'Hard margin', 'Soft margin'], rows: [
        ['约束', '$y_i(\\bw\'\\bx_i+b)\\ge1$', '$\\ge1-\\xi_i$，$\\xi_i\\ge0$'],
        ['损失', '$l_\\infty$（0/∞）', 'hinge（线性）'],
        ['不可分数据', '无解', '有解'],
        ['超参数', '无', '$C$'],
        ['支持向量', 'margin 线上的点', '满足 $y_if(\\bx_i)\\le1$ 的点：margin 线上（$\\xi_i=0$）+ margin 内 + 分错的点'],
      ] },
      { t: 'exam', md: T`**Soft-margin SVM:** It relaxes the hard-margin constraints with slack variables, $\min_{\mathbf w,b,\boldsymbol\xi}\frac12\|\mathbf w\|^2+C\sum_i\xi_i$ s.t. $y_i(\mathbf w'\mathbf x_i+b)\ge1-\xi_i$, $\xi_i\ge0$; equivalently it minimises the hinge loss $\sum_i\max(0,1-y_i(\mathbf w'\mathbf x_i+b))$ plus an $L_2$ penalty. Points may lie inside the margin or be misclassified at a linear cost; a large $C$ penalises violations heavily (narrow margin, close to hard margin), a small $C$ allows more violations and a wider margin.` },
    ],
    pitfalls: [
      ['$C$ 大 = 正则强', '$C$ 大 = 违规贵 = 正则**弱**（$C\\propto1/\\lambda$）。'],
      ['$\\xi_i>0$ 就是分错', '$0<\\xi_i<1$ 是分对但在 margin 内；$\\xi_i=1$ 在边界上；$\\xi_i>1$ 才是分错。'],
      ['hinge loss 对分对的点都是 0', '分对但 $yf<1$ 时仍有损失。'],
      ['soft margin 和 hard margin 的目标完全不同', '多了 $C\\sum\\xi_i$ 和松弛约束；数据可分时 $C\\to\\infty$ 回到 hard margin。'],
    ],
    quiz: [
      { type: 'num', q: '$yf(\\bx)=0.3$，hinge loss？', answer: 0.7, explain: T`Hinge loss（合页损失）是 $\max\big(0,\ 1-yf(\bx)\big)$。题目给了 $yf(\bx)=0.3$，所以 $\max(0,\ 1-0.3)=\max(0,\ 0.7)=0.7$。$0<0.3<1$ 说明这个点分对了，但离边界太近、进了 margin，所以仍要罚。**分对不等于损失为 0**：只有 $yf\ge1$ 时 hinge loss 才是 0。`, qzh: T`已知 $yf(\bx)=0.3$，合页损失（hinge loss）是多少？` },
      { type: 'num', q: '$yf(\\bx)=-0.5$，slack $\\xi$ 的最小可行值？', answer: 1.5, explain: T`Soft margin 的约束是 $yf(\bx)\ge1-\xi$ 和 $\xi\ge0$。移项得 $\xi\ge1-yf(\bx)=1-(-0.5)=1.5$，再和 $\xi\ge0$ 一起取较大者：$\max(0,\ 1.5)=1.5$。这个最小值就是该点的 hinge loss；$\xi>1$ 说明点越过了决策边界，分错了。**注意 $1-(-0.5)$ 是加 0.5**，算成 $1-0.5=0.5$ 是最常见的符号错误。` },
      { type: 'mc', q: '增大 $C$ 通常会：', options: ['margin 变宽、违规变多', 'margin 变窄、违规变少', '没有影响', '让问题无解'], answer: 1, explain: T`目标是 $\frac12\|\bw\|^2+C\sum_i\xi_i$，$C$ 是每单位违规的"罚款单价"。**$C$ 变大 ⇒ 违规更贵 ⇒ 优化宁可让 $\|\bw\|$ 变大，也要把 $\sum\xi_i$ 压小**；margin 宽度 $2/\|\bw\|$ 随之变窄，结果越来越接近 hard margin。"margin 变宽、违规变多"是 $C$ 变小时的情况；把 $C$ 当成正则系数 $\lambda$ 才会选反（课件 $C\propto1/\lambda$）。` },
      { type: 'mc', q: '$\\xi_i=0.4$ 的点：', options: ['在 margin 外分对', '分对但在 margin 内', '分错', '是唯一的支持向量'], answer: 1, explain: T`由 $\xi=\max(0,\ 1-yf)$，$\xi=0.4$ 意味着 $1-yf=0.4$，即 $yf=0.6$。$yf=0.6>0$：点在正确一侧，分对了；$yf=0.6<1$：点还没到 margin 线，进了 margin 内部。**四种情况的分界：$\xi=0$ 在 margin 外，$0<\xi<1$ 分对但在 margin 内，$\xi=1$ 在边界上，$\xi>1$ 分错。** 误选"分错"是把 $\xi>0$ 当成了分错，其实要 $\xi>1$ 才分错。` },
      { type: 'show', q: '（英文）What is the hinge loss and why is it used in soft-margin SVMs?', answer: T`The hinge loss is $\max(0,1-y(\mathbf w'\mathbf x+b))$: zero for points correctly classified outside the margin and increasing linearly with the margin violation otherwise. It replaces the hard-margin infinite loss, so non-separable data can be handled while still encouraging a margin.`, qzh: '什么是合页损失（hinge loss）？为什么软间隔 SVM（soft-margin SVM）要用它？', azh: T`合页损失（hinge loss）是 $\max(0,1-y(\mathbf w'\mathbf x+b))$：对分类正确且位于间隔之外的点为 0，否则随违反间隔的程度（margin violation）线性增长。它取代了硬间隔中的无穷大损失（infinite loss），因此能处理不可分（non-separable）的数据，同时仍然鼓励留出间隔（margin）。` },
    ],
  });

  /* =====================================================================
   * r04 · W4 复习
   * ===================================================================== */
  SML.content.add(SML.review({
    id: 'r04', week: 'W4', title: 'W4 复习：VC 维与 SVM', en: 'Week 4 review',
    summary: '本周一半是**往年必考计算题 T1（VC 维）**，一半是 **SVM 的几何与优化**（T4 看图找支持向量、2021 Q2 functional margin）。VC 题按"上界 → 选列去重 → 凑齐 $2^k$ → 写 shattered set"四步走，几乎不会错。',
    keypoints: [
      [T`无限类在 $n$ 个点上只有有限个 dichotomy；growth function $S(n)\le2^n$；stumps $S(n)=2n$；找 stump 试相邻中点、两个方向。`, 'c22'],
      [T`VC 维 = 能被 shatter 的最大点集（"存在"一组即可）；stumps 2，$\mathbb R^2$ 直线 3，$\mathbb R^d$ 线性 $d+1$，轴对齐矩形 4；从表求 VC：上界 $\lfloor\log_2\text{行数}\rfloor$ → 去列去重 → 凑齐 $2^k$。`, 'c23'],
      [T`Sauer–Shelah：$S(n)\le\sum_{i\le\mathrm{VC}}\binom ni$；VC 界 $\sqrt{8\frac{\mathrm{VC}\log(2n+1)+\log(4/\delta)}{n}}$；有限 VC ⇔ PAC 可学。`, 'c24'],
      [T`Margin = 边界到最近点的距离；带标签距离 $\frac{y_i(\bw'\bx_i+b)}{\|\bw\|}$；SVM 最大化最小距离。`, 'c25'],
      [T`Canonical scaling：最近点 functional margin = 1 ⇒ margin $=1/\|\bw\|$ ⇒ $\min\frac12\|\bw\|^2$ s.t. $y_i(\bw'\bx_i+b)\ge1$；等号点 = 支持向量。`, 'c26'],
      [T`Soft margin：hinge $\max(0,1-yf)$ + 正则；或 $\frac12\|\bw\|^2+C\sum\xi_i$；$C$ 大 → 接近 hard margin。`, 'c27'],
    ],
    map: [
      T`**为什么 VC 维和 SVM 放在同一周？** 两者都是在回答"怎么控制复杂度"：VC 理论说复杂度越低泛化越好；SVM 的大 margin 正是一种低复杂度——把 $\|\bw\|$ 压小，相当于 c16 的 ridge 正则。`,
      { t: 'table', head: ['模型', '损失', '正则', '章节'], rows: [
        ['Ridge', 'square', '$\\lambda\\|\\bw\\|^2$', 'c16'],
        ['Logistic（+L2）', 'cross-entropy', '$\\lambda\\|\\bw\\|^2$', 'c15'],
        ['Hard-margin SVM', '$l_\\infty$（0/∞）', '$\\frac12\\|\\bw\\|^2$', 'c26'],
        ['Soft-margin SVM', 'hinge', '$\\lambda\\|\\bw\\|^2$ / $C$', 'c27'],
      ] },
    ],
    recall: [
      { q: 'Dichotomy 和 growth function 的定义？', a: T`分类器在 $n$ 个点上的标签向量；$S(n)=\sup_{|\mathcal X|=n}|\mathcal F(\mathcal X)|\le2^n$。`, ch: 'c22' },
      { q: 'Stumps 的 $S(n)$ 和 VC 维？', a: '$2n$；VC = 2（$2n=2^n$ 最大解）。', ch: 'c22' },
      { q: '找最佳 stump 的步骤？', a: '排序 → 试相邻中点 → 两个方向都数错误 → 取最少的。', ch: 'c22' },
      { q: 'Shatter 的定义？', a: '一组点的全部 $2^n$ 种标签都能被某个分类器实现。', ch: 'c23' },
      { q: 'VC 维的定义？证明 VC = d 要证哪两件事？', a: '能被 shatter 的最大点集大小；存在 $d$ 个点能被 shatter + 任何 $d+1$ 个点都不能。', ch: 'c23' },
      { q: '从 dichotomy 表求 VC 的四步？', a: '上界 $\\lfloor\\log_2N\\rfloor$ → 选列（删其余列）→ 去重 → 是否凑齐 $2^k$；写出 VC 和一个 shattered set。英文：*restrict the table to the chosen columns, remove duplicate rows, check that all $2^k$ patterns appear.*', ch: 'c23' },
      { q: '$\\mathbb R^2$ 直线的 VC 维是多少？为什么 4 点不行？', a: '3；XOR 那种对角同色的两种标签无法用直线实现（只有 14 < 16）。', ch: 'c23' },
      { q: 'Sauer–Shelah 上界？', a: T`$S(n)\le\sum_{i=0}^{\mathrm{VC}}\binom ni\le(n+1)^{\mathrm{VC}}$。`, ch: 'c24' },
      { q: 'VC 泛化界？', a: T`$R\le\hat R+\sqrt{8\frac{\mathrm{VC}\log(2n+1)+\log(4/\delta)}{n}}$，概率 $\ge1-\delta$。`, ch: 'c24' },
      { q: '点到超平面的带标签距离？', a: T`$\frac{y_i(\bw'\bx_i+b)}{\|\bw\|}$。`, ch: 'c25' },
      { q: 'Functional vs geometric margin？', a: T`$y_i(\bw'\bx_i+b)$（随缩放变）vs 除以 $\|\bw\|$ 的真实距离（不变）。`, ch: 'c25', qzh: '函数间隔（functional margin）与几何间隔（geometric margin）有什么区别？' },
      { q: 'Hard-margin SVM primal？', a: T`$\min\frac12\|\bw\|^2$ s.t. $y_i(\bw'\bx_i+b)\ge1\ \forall i$。`, ch: 'c26', qzh: '硬间隔 SVM（hard-margin SVM）的原始问题（primal）是什么？', azh: T`最小化 $\frac12\|\bw\|^2$，约束条件（s.t.）为对所有 $i$ 有 $y_i(\bw'\bx_i+b)\ge1$。` },
      { q: '（2021 Q2）为什么支持向量 margin 为 1 但距离不是 1？', a: T`1 是 functional margin（canonical scaling 固定的）；欧氏距离是 $1/\|\bw\|$。`, ch: 'c26' },
      { q: 'Hinge loss？slack 的三种情况？', a: T`$\max(0,1-yf)$；$\xi=0$ margin 外，$0<\xi<1$ margin 内分对，$\xi=1$ 在边界上，$\xi>1$ 在错误一侧。`, ch: 'c27' },
      { q: 'Soft-margin 的 slack 形式？$C$ 大小的影响？', a: T`$\min\frac12\|\bw\|^2+C\sum\xi_i$ s.t. $y_i(\bw'\bx_i+b)\ge1-\xi_i,\ \xi_i\ge0$；$C$ 大 → margin 窄、违规少。`, ch: 'c27' },
    ],
    formulas: [
      ['$S_\\mathcal F(n)=\\sup_{|\\mathcal X|=n}|\\mathcal F(\\mathcal X)|\\le2^n$', 'growth function', 'L07 p18'],
      ['$\\mathrm{VC}(\\mathcal F)=\\max\\{n:S_\\mathcal F(n)=2^n\\}$', 'VC 维', 'L07 p23'],
      ['$S(n)\\le\\sum_{i=0}^{\\mathrm{VC}}\\binom ni$', 'Sauer–Shelah', 'L07 p30'],
      ['$R\\le\\hat R+\\sqrt{8\\frac{\\mathrm{VC}\\log(2n+1)+\\log(4/\\delta)}{n}}$', 'VC 界', 'L07 p31'],
      ['$\\frac{y_i(\\bw\'\\bx_i+b)}{\\|\\bw\\|}$', '带标签距离', 'L08 p17'],
      ['$\\min\\frac12\\|\\bw\\|^2$ s.t. $y_i(\\bw\'\\bx_i+b)\\ge1$', 'hard-margin SVM', 'L08 p21'],
      ['$\\max(0,1-y_i(\\bw\'\\bx_i+b))$', 'hinge loss', 'L08 p32'],
      ['$\\min\\frac12\\|\\bw\\|^2+C\\sum\\xi_i$ s.t. $y_i(\\cdot)\\ge1-\\xi_i,\\ \\xi_i\\ge0$', 'soft-margin SVM', 'L08 p34'],
    ],
    exam: [
      ['给 dichotomy 表求 VC 维 + shattered set', '2026 Q3、2025 Q3、2021 Q16（每年必考，8–12 分）', '[T1](#/T01)'],
      ['看图找支持向量 / 判断 margin', '2026 Q1c', '[T4](#/T04)'],
      ['functional margin vs 欧氏距离', '2021 Q2', '[T4](#/T04)'],
      ['VC 界 / SRM 代数', 'T12', '[T12](#/T12)'],
    ],
    quiz: [
      { type: 'num', q: '表的行（3 点）：$001,010,100,011,111$。VC = ?', answer: 2, explain: '5 行 ⇒ ≤2；$(x_2,x_3)$：$01,10,00,11,11$ 全齐 ⇒ 2。' },
      { type: 'num', q: '$\\mathbb R^3$ 线性分类器 VC = ?', answer: 4, explain: '$d+1$。' },
      { type: 'num', q: 'Stumps 在 6 个点上最多几种 dichotomy？', answer: 12, explain: '$2n$。' },
      { type: 'num', q: '$\\bw=(0,5)$，$b=0$，点 $(3,2)$ 标签 $-1$。带标签距离？', answer: -2, explain: '得分 $\\bw\'\\bx+b=0\\times3+5\\times2+0=10$；$\\|\\bw\\|=\\sqrt{0^2+5^2}=5$；带标签距离 $=y\\times10/5=(-1)\\times2=-2$，负号表示分错。' },
      { type: 'num', q: '一维 canonical：负类 $x=2$，正类 $x=6$。margin？', answer: 2, explain: '两点距离的一半；$w=0.5$，$1/w=2$。' },
      { type: 'num', q: '$yf=-0.2$ 的 hinge loss？', answer: 1.2, explain: '$1-(-0.2)$。' },
      { type: 'mc', q: '三个共线点不能被直线 shatter，所以：', options: ['直线 VC ≤ 2', '这不影响直线 VC = 3', 'VC 维不存在', '要用 Sauer–Shelah'], answer: 1, explain: '只需存在一组被 shatter。' },
      { type: 'show', q: '（英文）Explain the role of $C$ in a soft-margin SVM.', answer: T`$C$ weights the total slack (hinge loss) against the margin term $\frac12\|\mathbf w\|^2$. Large $C$ makes violations expensive, giving a narrower margin and behaviour close to the hard-margin SVM (risk of overfitting); small $C$ tolerates more violations for a wider margin (stronger regularisation).`, qzh: '解释软间隔 SVM（soft-margin SVM）中 $C$ 的作用。', azh: T`$C$ 用来权衡总松弛量（total slack，即 hinge loss）与间隔项 $\frac12\|\mathbf w\|^2$。$C$ 大时违反间隔的代价高，间隔变窄，行为接近硬间隔 SVM（hard-margin SVM），有过拟合风险；$C$ 小时容忍更多违反，换取更宽的间隔（正则化更强，stronger regularisation）。` },
    ],
    next: '下一周（W5）：kernel 与 perceptron。你会看到 SVM 的 dual 形式只用到数据的点积，于是可以换成 kernel——XOR 这类不可分问题就解决了。',
  }));
})(window);
