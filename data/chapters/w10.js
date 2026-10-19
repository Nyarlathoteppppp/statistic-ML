/* W10 · L19 Bayesian classification + L20 Probabilistic graphical models — chapters c51–c55 and review r10. */
(function (root) {
  'use strict';
  const SML = root.SML;
  const T = String.raw;
  const add = (c) => SML.content.add(SML.chapter(c));

  /* Figures reused across W10 (drawn by the render.js graph block). */
  const ALARM = { nodes: { E: [80, 40], B: [260, 40], R: [80, 150], A: [260, 150], L: [170, 255] }, notes: { E: '地震', B: '盗窃', R: '电台报道', A: '警报', L: '下班离开' } };
  const ALARM_EDGES = 'E>R E>A B>A R>L A>L';
  const ALARM_KEY = '字母：$E$ 地震、$B$ 盗窃、$R$ 电台报道、$A$ 警报、$L$ 下班离开。';
  const COIN = { nodes: { x1: [60, 40], x2: [240, 40], x3: [150, 150] }, labels: { x1: 'x₁', x2: 'x₂', x3: 'x₃' } };
  const fig = (base, extra) => Object.assign({ t: 'graph' }, base, extra);

  /* =====================================================================
   * c51 · 生成模型、Beta–Binomial、共轭（L19 p2–p18）
   * ===================================================================== */
  add({
    id: 'c51', week: 'W10', lec: 'L19', pages: 'L19 p2–p18', star: 2,
    keyEn: [
      T`Generative models learn $P(\mathbf x,y)$, i.e. how the data are generated (e.g. naive Bayes); discriminative models learn $P(y\mid\mathbf x)$ or the classifier directly (e.g. logistic regression).`,
      T`Beta–Binomial: prior $\mathrm{Beta}(\alpha,\beta)$ and $k$ successes in $n$ trials give the posterior $\mathrm{Beta}(k+\alpha,\ n-k+\beta)$, mean $\frac{k+\alpha}{n+\alpha+\beta}$: add the counts to the parameters.`,
      T`A conjugate prior（共轭先验）keeps the posterior in the prior's family, so the update and the evidence are closed-form (Normal–Normal, Beta–Binomial, Dirichlet–Multinomial).`,
      T`Sunrise problem: with a uniform prior, after $k$ consecutive sunrises $P(\text{rise tomorrow})=\frac{k+1}{k+2}$, never exactly 1.`,
      T`A $100(1-\alpha)\%$ equal-tailed credible interval leaves posterior mass $\alpha/2$ in each tail, so the parameter lies in it with posterior probability $1-\alpha$; a frequentist confidence interval is random and covers the fixed true value in $100(1-\alpha)\%$ of repeated samples.`,
    ],
    keyZh: [
      T`生成模型（generative）学联合分布 $P(\bx,y)$，把数据怎么生成的整个模仿一遍（如 naive Bayes）；判别模型（discriminative）只学 $P(y\mid\bx)$ 或直接学分类器（如 logistic regression）。`,
      T`Beta–Binomial：后验就是把成功次数 $k$ 加到 $\alpha$ 上、失败次数 $n-k$ 加到 $\beta$ 上，$\alpha,\beta$ 像事先假想看到的正、反面次数；后验均值把假想计数也算进去。`,
      T`共轭先验（conjugate prior）：后验和先验是同一族分布，只是参数变了，所以更新和证据（evidence）都有闭式解。三对常见组合：Normal–Normal、Beta–Binomial、Dirichlet–Multinomial。`,
      T`日出问题：均匀先验下，太阳连续升起 $k$ 天，明天升起的概率取后验均值 $\frac{k+1}{k+2}$。永远到不了 1：先验那一次"假想的没升起"一直留在分母里。`,
      T`等尾可信区间（credible interval）在后验两侧各留 $\alpha/2$（这里 $\alpha$ 是 0.05 这类小概率），参数落在区间内的后验概率是 $1-\alpha$。置信区间（confidence interval）里参数固定、区间随数据变，$1-\alpha$ 指重复抽样时盖住真值的比例。`,
    ],
    title: '生成模型、Beta–Binomial、共轭', en: 'Generative models, Beta–Binomial conjugacy, the sunrise problem',
    summary: '**Generative model（生成模型）** 学 $P(\\bx,y)$，模仿"数据是怎么生成的"：先抛一枚有偏硬币决定类别 $y$，再按类别生成特征 $\\bx$。离散数据上 Bayesian 方法的核心例子是 **Beta–Binomial 共轭**：先验 $\\mathrm{Beta}(\\alpha,\\beta)$，看到 $n$ 次里 $k$ 次正面，后验就是 $\\mathrm{Beta}(k+\\alpha,\\ n-k+\\beta)$——**把计数加到参数上**。Laplace 的日出问题：太阳连续升起 $k$ 天，明天升起的概率是 $\\frac{k+1}{k+2}$，不是 1。',
    prereq: ['c08', 'c09'],
    symbols: [
      [T`$q$`, T`一次抛硬币正面的概率（未知参数）`],
      [T`$n,\ k$`, T`抛了 $n$ 次，其中 $k$ 次正面`],
      [T`$\binom nk$`, T`组合数："$n$ 个里选 $k$ 个"的方法数`],
      [T`$\mathrm{Beta}(q;\alpha,\beta)$`, T`Beta 分布：$q\in[0,1]$ 上的分布，形状由 $\alpha,\beta>0$ 决定`],
      [T`$\Gamma(\cdot)$`, T`Gamma 函数，阶乘的推广：$\Gamma(m)=(m-1)!$（$m$ 为正整数）。只出现在归一化常数里`],
      [T`$E[q]$`, T`$q$ 的期望（均值）`],
      [T`$\propto$`, T`正比于：两边只差一个和 $q$ 无关的常数倍`],
      [T`$\theta$`, T`生成模型的全部参数（包括 $q$ 和各类别的分布参数）`],
      [T`$\delta(y,1)$`, T`示性：$y=1$ 时为 1，否则 0`],
    ],
    goals: [
      '区分 generative（学 $P(\\bx,y)$）和 discriminative（学 $P(y\\mid\\bx)$ 或直接学分类器）（L19 p3、p10）',
      '写出 Binomial 似然、Beta 先验，推出后验 $\\mathrm{Beta}(k+\\alpha,n-k+\\beta)$（L19 p11–p13）',
      '用"正比于一个已知分布 ⇒ 就是它"的技巧识别后验（L19 p14）',
      '算日出问题 $\\frac{k+1}{k+2}$，说出常见共轭对（L19 p15–p17）',
      '说出等尾 credible interval 的定义，以及它和 confidence interval 在解释上的区别（Workshop 2）',
    ],
    types: ['T09', 'T13'],
    what: [
      T`**两种分类思路**（L19 p3）：`,
      { t: 'ul', items: [
        T`**Discriminative（判别式）**：模型是一族分类器，挑一个在训练集上分得好的 $f$，预测 $y=f(\bx)$。如 logistic regression（学 $p(y\mid\bx)$）、SVM。`,
        T`**Generative（生成式）**：模型是一族联合分布 $P(\bx,y;\theta)$，挑一个让训练数据"最像是从它生成的"，预测时取让 $P(\bx,y;\theta)$ 最大的 $y$。如 naive Bayes。`,
      ] },
      { t: 'graphs', r: 18, items: [
        { nodes: { y: [100, 40], x: [100, 150] }, edges: 'y>x', notes: { y: '① 先抛硬币定类别', x: '② 再按类别生成特征' }, caption: '**生成式**：建模 $P(y)\\,P(\\bx\\mid y)=P(\\bx,y)$，数据"怎么来的"整个模仿一遍' },
        { nodes: { x: [100, 40], y: [100, 150] }, edges: 'x>y', notes: { x: '特征给定', y: '只学怎么判类别' }, caption: '**判别式**：只建模 $P(y\\mid\\bx)$（或直接学分类器），不管 $\\bx$ 从哪来' },
      ] },
      T`**生成的过程**（L19 p5–p8）：先抛一枚有偏硬币决定类别——$P(y=1)=q$，$P(y=-1)=1-q$（Bernoulli），课件写成一个式子 $P(y;\theta)=q^{\delta(y,1)}(1-q)^{\delta(y,-1)}$（$y=1$ 时第一个指数是 1、第二个是 0，就得到 $q$）；再从这个类别自己的分布里生成特征 $\bx$（如一团 Gaussian 点云，参数 $\mu_{\pm1},\sigma_{\pm1}$）。训练 = 估计 $q$ 和每类的分布参数。`,
      { t: 'slide', src: 'L19/p05', caption: '左：类别的分布 $P(y)$（一枚有偏硬币）；右：每个类别各自的特征分布 $P(\\bx\\mid y)$（两团点云）。' },
      T`训练一个生成式分类器，要估计"类别硬币"的 $q$ 和每类点云的参数。课件先把分类放一放，专门练那枚决定类别的硬币：c50 用"整条后验"回答过"权重是多少"；这里的 $q$ 只能在 $[0,1]$ 里，同一套"先验 × 似然 = 后验"换成 Beta–Binomial。`,
      T`**抛硬币**（L19 p10–p11）：只有一串结果、没有类别标签。抛 $n$ 次、$k$ 次正面，正面概率 $q$：`,
      { t: 'math', tex: T`\text{似然（Binomial）：}\ p(k\mid n,q)=\binom nk q^k(1-q)^{n-k}\qquad\text{先验（Beta）：}\ p(q)=\frac{\Gamma(\alpha+\beta)}{\Gamma(\alpha)\Gamma(\beta)}q^{\alpha-1}(1-q)^{\beta-1}` },
      T`Beta 的均值 $E[q]=\frac{\alpha}{\alpha+\beta}$（L19 p12）。$\alpha=\beta=1$ 是 $[0,1]$ 上的均匀分布。不同的 $\alpha,\beta$ 表达对 $q$ 的不同"先入之见"：`,
      { t: 'viz', id: 'beta-shapes' },
      T`**先定一个具体问题**：事先觉得硬币大致公平，用 $\mathrm{Beta}(2,2)$（均值 $1/2$）；抛 10 次看到 7 次正面。MLE 只回答一个数 $7/10$；我们要的是"看过这些结果之后，$q$ 还可能是哪些值、各有多可能"——这就是后验 $p(q\mid k,n)$。和 c08、c50 一样，后验 $\propto$ 似然 × 先验：`,
      T`**后验**（L19 p13）：扔掉所有和 $q$ 无关的常数，把剩下的 $q$ 的幂次乘起来：`,
      { t: 'math', tex: T`p(q\mid k,n)\propto\underbrace{q^k(1-q)^{n-k}}_{\text{似然}}\cdot\underbrace{q^{\alpha-1}(1-q)^{\beta-1}}_{\text{先验}}=q^{k+\alpha-1}(1-q)^{n-k+\beta-1}\ \propto\ \mathrm{Beta}(q;\ k+\alpha,\ n-k+\beta)` },
      T`**Conjugate prior（共轭先验）**：后验和先验是**同一族**（都是 Beta），只是参数变了。Beta 对 Binomial 共轭。`,
      T`**Uniqueness up to normalisation（归一化唯一性）**（L19 p14）：如果一个没归一化的函数 $f(\theta)$ **正比于**一个已知分布 $g(\theta)$，那么把 $f$ 归一化后**就是** $g$。所以上面看出 $q^{k+\alpha-1}(1-q)^{n-k+\beta-1}$ 的形状，就能直接说后验是那个 Beta，不用真的去积分。`,
    ],
    why: [
      T`Beta–Binomial 是"共轭让 Bayesian 计算变简单"最干净的例子，和 c50 的 Normal–Normal 是同一个道理，简答题（2021 Q10 共轭与 MAP、T13 "什么是共轭先验"）常用它举例。生成式 vs 判别式也是 W1 起反复出现的概念题。`,
    ],
    intuition: [
      T`**$\alpha,\beta$ = 假想的计数。** 后验均值 $E[q]=\frac{k+\alpha}{n+\alpha+\beta}$：就像在真实数据之外，**事先多看到了 $\alpha$ 次正面和 $\beta$ 次反面**。$\alpha=\beta=1$ 就是"各加 1 次"——著名的 **add-one smoothing（加一平滑，也叫 Laplace 平滑）**。先验越强（$\alpha+\beta$ 越大），需要越多真实数据才能把它推开。`,
      T`**数据越多，先验越不重要——但永远不会完全消失**（L19 p16）。日出问题里每天都升起（$n=k$），后验 $\mathrm{Beta}(k+1,\ 1)$ 的第二个参数永远是 1：那一次"假想的没升起"一直都在。`,
      T`**为什么扔掉常数是合法的？** 后验必须积分为 1。只要知道它的**形状**和某个已知分布一样，归一化常数就唯一确定了——p14 的唯一性。`,
      { t: 'think', q: '先验 $\\mathrm{Beta}(1,1)$，抛 2 次都是正面。MLE 说 $q=1$，后验均值是多少？哪个更合理？', a: T`后验 $\mathrm{Beta}(3,1)$，均值 $3/4=0.75$。MLE 说"以后永远是正面"，只凭两次就下这么绝对的结论显然太自信；后验均值保留了出现反面的可能。` },
      { t: 'story', title: 'Laplace 的日出问题', md: 'Pierre-Simon Laplace 在 1814 年的《概率的哲学随笔》里问：如果太阳已经连续升起了 $k$ 天，明天还升起的概率是多少？他的答案 $\\frac{k+1}{k+2}$ 后来叫 rule of succession（继承法则）。课件 L19 p15–p16 就是这个例子：一岁时 $\\frac{366}{367}\\approx0.997$。' },
    ],
    math: [
      { t: 'h3', text: '日出问题（L19 p15–p16）' },
      T`后验是 $q$ 的一整条分布，可很多时候要报的是一个数："**下一次**还是正面的概率"。下一次仍是一次成功率为 $q$ 的抛掷，而 $q$ 还不确定，就把 $q$ 按后验平均一下——后验均值就是答案。Laplace 的日出问题是个极端情形：从来没失败过，明天的概率是 1 吗？`,
      T`$q=P(\text{太阳升起})$，均匀先验 $\alpha=\beta=1$。观察者活了 $k$ 天，每天都升起：$n=k$。后验 $\mathrm{Beta}(k+1,\ 1)$，明天升起的概率取后验均值：`,
      { t: 'math', tex: T`E[q\mid k]=\frac{k+1}{k+2}` },
      { t: 'table', cls: 'compact', head: ['天数 $n=k$', '$k+\\alpha$', '$n-k+\\beta$', '$E[q]$'], rows: [
        ['0', '1', '1', '0.5'], ['1', '2', '1', '0.667'], ['2', '3', '1', '0.75'], ['365', '366', '1', '0.997'],
        ['2920（8 年）', '2921', '1', '$2921/2922\\approx0.9997$'],
      ] },
      { t: 'slide', src: 'L19/p16', caption: '日出问题：天数越多，后验 $\\mathrm{Beta}(k+1,1)$ 越挤向 $q=1$，但永远到不了 1。' },
      T`（课件 p16 最后一行印的是 0.99997，按公式算是 $2921/2922\approx0.99966$，课件这一格是笔误。）`,
      { t: 'h3', text: '三种估计对比（Beta–Binomial）' },
      T`日出问题报的是后验**均值**，但同一条后验还有别的读法：MLE 只看 $k/n$，MAP 取后验的**众数**（最高点）。用开头的例子（先验 $\mathrm{Beta}(2,2)$，10 次 7 正）把三个数并排比一比——数据越多，三者越接近：`,
      { t: 'table', cls: 'compact', head: ['估计', '公式', '先验 Beta(2,2)，$n=10,k=7$'], rows: [
        ['MLE', '$k/n$', '$0.7$'],
        ['MAP（后验众数；要求 $k+\\alpha>1$ 且 $n-k+\\beta>1$）', '$\\frac{k+\\alpha-1}{n+\\alpha+\\beta-2}$', '$8/12\\approx0.667$'],
        ['后验均值', '$\\frac{k+\\alpha}{n+\\alpha+\\beta}$', '$9/14\\approx0.643$'],
      ] },
      T`MAP 那一格：后验是 $\mathrm{Beta}(9,5)$，密度正比于 $q^{8}(1-q)^{4}$（指数比参数少 1）。$q^a(1-q)^b$ 的最高点在 $q=\frac{a}{a+b}$（取对数求导：$\frac{a}{q}-\frac{b}{1-q}=0$，即 $a(1-q)=bq$）；这里 $a=8$、$b=4$，最高点在 $\frac{8}{8+4}=\frac{9-1}{9+5-2}=\frac{8}{12}$。代入计数就是 $\frac{7+2-1}{10+2+2-2}=\frac8{12}\approx0.667$。后验参数仍是 $k+\alpha=9$；"减 1"只出现在找峰值时。要求 $k+\alpha>1$ 且 $n-k+\beta>1$，是为了峰在 0 和 1 之间；不满足时峰不在 0 和 1 之间（贴在边界上，或像 $\mathrm{Beta}(1,1)$ 那样处处一样高），不能直接套这个分数。`,
      T`**报一个范围：credible interval（可信区间）**（Workshop 2 bonus）。上面三个估计都只是一个数。想报一个范围，就在后验上切两刀：等尾（equal-tailed）的 $100(1-\alpha)\%$ 可信区间 $[l,u]$，让 $l$ 左边和 $u$ 右边各留 $\alpha/2$ 的后验质量，中间正好 $1-\alpha$（这里的 $\alpha$ 是 0.05 这样的小概率，不是 Beta 的参数 $\alpha$）。例：后验 $\mathrm{Beta}(9,5)$ 的 95% 区间约 $[0.39,\ 0.86]$，两侧各 2.5%（端点要用软件求分位数，考试不会让你手算）。它的意思是：给定先验和这批数据，$q$ 落在区间里的概率是 95%；$q$ 是随机的，区间是固定的。频率学派的 confidence interval（置信区间）正好反过来：$q$ 是一个固定的未知数，随机的是区间（每份数据算出一个）；"95%"指重复抽很多份数据时，约 95% 的区间会盖住真值，对手里这一个区间不能说"$q$ 有 95% 的概率在里面"。Workshop 2 特别提醒两者不要混。`,
      { t: 'h3', text: '常见共轭对（L19 p17）' },
      { t: 'table', cls: 'compact', head: ['用途', '似然', '共轭先验'], rows: [
        ['回归', 'Normal', 'Normal（均值；c50）'],
        ['回归', 'Normal', 'Inverse Gamma（方差）/ Inverse Wishart（协方差）'],
        ['分类', 'Binomial', 'Beta'],
        ['分类', 'Multinomial', 'Dirichlet'],
        ['计数', 'Poisson', 'Gamma'],
      ] },
    ],
    fx: [
      {
        title: 'Beta–Binomial 后验（L19 p13）', tex: T`p(q\mid k,n)=\mathrm{Beta}\big(q;\ \htmlClass{fx-p1}{k}+\htmlClass{fx-p2}{\alpha},\ \htmlClass{fx-p3}{n-k}+\htmlClass{fx-p4}{\beta}\big)`,
        parts: [
          { label: 'k', note: '真实观测到的正面次数。' },
          { label: 'α', note: '先验的"假想正面次数"。' },
          { label: 'n−k', note: '真实观测到的反面次数。' },
          { label: 'β', note: '先验的"假想反面次数"。后验均值 $=\\frac{k+\\alpha}{n+\\alpha+\\beta}$。' },
        ],
      },
    ],
    example: [
      { t: 'h3', text: '例：先验 Beta(2,2)，10 次里 7 次正面' },
      { t: 'video', id: 'beta' },
      { t: 'steps', items: [
        T`后验参数：$k+\alpha=7+2=9$，$n-k+\beta=3+2=5$ ⇒ $\mathrm{Beta}(9,5)$。`,
        T`后验均值 $9/(9+5)=9/14\approx0.643$；MLE $7/10=0.7$。先验（均值 0.5）把估计往 0.5 拉了一点。`,
        T`如果再抛 10 次又是 7 次正面（反面 $10-7=3$ 次）：从 $\mathrm{Beta}(9,5)$ 接着加，$9+7=16$，$5+3=8$，后验 $\mathrm{Beta}(16,8)$，均值 $16/24\approx0.667$——离 0.7 更近，先验影响变小。（一次看 20 次、14 正面、反面 $20-14=6$，再加先验的 2、2，结果相同：$\mathrm{Beta}(14+2,\ 6+2)$。）`,
      ] },
      { t: 'fade', title: '分步练习：Beta 后验', plan: ['读出 $n$、$k$ 和先验 $\\alpha,\\beta$', '后验 $\\mathrm{Beta}(k+\\alpha,\\ n-k+\\beta)$', '后验均值 $\\frac{k+\\alpha}{n+\\alpha+\\beta}$'], items: [
        { md: T`先验 $\mathrm{Beta}(2,2)$，抛 10 次 7 次正面。`, steps: [
          { md: T`$n=10,k=7,\alpha=\beta=2$` }, { md: T`$\mathrm{Beta}(9,5)$` }, { md: T`$9/14\approx0.643$` },
        ] },
        { md: T`均匀先验 $\mathrm{Beta}(1,1)$，抛 4 次 3 次正面。`, steps: [
          { ask: '后验的第一个参数 $k+\\alpha$ = ?', answer: 4, show: '$3+1$', sg: 2 },
          { ask: '后验的第二个参数 $n-k+\\beta$ = ?', answer: 2, show: '$1+1$', sg: 2 },
          { ask: '后验均值 = ?', answer: 0.6667, tol: 0.002, show: '$4/6$', sg: 3 },
        ] },
        { md: T`先验 $\mathrm{Beta}(3,3)$，抛 6 次全是反面（$n=6$，正面次数 $k=0$）。`, steps: [
          { ask: '后验均值 = ?', answer: 0.25, show: T`$\mathrm{Beta}(0+3,\ 6+3)=\mathrm{Beta}(3,9)$，$3/12$。MLE 是 0（"永远不出正面"），后验更谨慎`, sg: 3 },
        ] },
        { md: '日出问题：太阳连续升起了 3 天（均匀先验）。', steps: [
          { ask: '明天升起的概率 = ?', answer: 0.8, show: '$(3+1)/(3+2)=4/5$', sg: 3 },
        ] },
      ] },
    ],
    viz: [
      { id: 'beta-coins', how: '灰线是先验 $\\mathrm{Beta}(\\alpha,\\beta)$，绿线是看过数据后的后验。按"+ 正面 / + 反面"添加观测，绿色竖线是后验均值，黑色竖线是 MLE $k/n$。',
        try: '① 均匀先验（$\\alpha=\\beta=1$）下点两次正面：后验 $\\mathrm{Beta}(3,1)$，均值 0.75，而 MLE 已经是 1。② 把先验调成 $\\alpha=\\beta=10$（很强的"硬币是公平的"信念），再点"+10 次"几次：后验均值离 0.5 移动得很慢。③ 点"日出问题"：365 天后均值 0.997，曲线全挤在 $q=1$ 附近，但不是 1。' },
    ],
    compare: [
      { t: 'table', head: ['', 'Discriminative', 'Generative'], rows: [
        ['建模对象', '$p(y\\mid\\bx)$ 或分类器 $f$', '联合分布 $P(\\bx,y)$'],
        ['预测', '$y=f(\\bx)$', '$\\argmax_yP(\\bx,y)$'],
        ['例子', 'logistic regression、SVM', 'naive Bayes、类条件 Gaussian'],
        ['能生成新数据吗', '不能', '能'],
      ] },
      { t: 'exam', md: T`**What is a conjugate prior? Give an example.** A prior is conjugate to a likelihood if the resulting posterior is in the same family as the prior, so the update is closed-form (and the evidence is available from the known normalising constant). Example: a Beta$(\alpha,\beta)$ prior on the success probability $q$ with a Binomial likelihood ($k$ successes in $n$ trials) gives the posterior Beta$(k+\alpha,\ n-k+\beta)$; similarly a Normal prior on the weights with a Normal likelihood gives a Normal posterior in Bayesian linear regression.` },
    ],
    pitfalls: [
      ['后验是 $\\mathrm{Beta}(k+\\alpha-1,\\ n-k+\\beta-1)$', '指数是 $k+\\alpha-1$，所以参数是 $k+\\alpha$（Beta 密度本身就带 $-1$）。'],
      ['后验均值就是 MLE $k/n$', '是 $\\frac{k+\\alpha}{n+\\alpha+\\beta}$：先验的假想计数也要算进去。'],
      ['数据够多先验影响就完全消失', '越来越小，但不会彻底消失（日出问题里 $\\beta$ 那一次一直在）。'],
      ['Naive Bayes 是判别式模型', '生成式（学 $P(\\bx,y)$）；logistic regression 才是判别式。'],
    ],
    quiz: [
      { type: 'num', q: '先验 $\\mathrm{Beta}(1,3)$，抛 6 次 4 次正面。后验均值？', answer: 0.5, explain: T`要算的是看过数据后正面概率 $q$ 的后验均值。题目给出先验 $\alpha=1,\ \beta=3$，抛 $n=6$ 次、正面 $k=4$ 次，所以反面 $n-k=6-4=2$ 次。**后验 = Beta(正面次数 + $\alpha$，反面次数 + $\beta$)**：$\mathrm{Beta}(4+1,\ 2+3)=\mathrm{Beta}(5,5)$，均值 $\frac{5}{5+5}=0.5$。MLE（最大似然估计）是 $4/6\approx0.667$，先验（均值 $\frac{1}{1+3}=0.25$）把估计往下拉到了 0.5。常见错误：第二个参数加成正面次数 $k$，而不是反面次数 $n-k$。` },
      { type: 'num', q: '日出问题：连续升起 8 天，明天升起的概率？', answer: 0.9, explain: T`要算的是日出问题里"明天还升起"的概率，也就是后验均值。用均匀先验 $\mathrm{Beta}(1,1)$（$\alpha=\beta=1$）；8 天每天都升起，所以 $n=k=8$，没升起 $0$ 次。后验 $\mathrm{Beta}(8+1,\ 0+1)=\mathrm{Beta}(9,1)$，均值 $\frac{9}{9+1}=0.9$，正是公式 $\frac{k+1}{k+2}=\frac{9}{10}$。**答案不是 1**：先验那一次"假想的没升起"一直留在分母里；直接写 $8/8=1$ 是 MLE 的答案。` },
      { type: 'mc', q: 'Multinomial 似然的共轭先验是：', options: ['Beta', 'Gamma', 'Dirichlet', 'Normal'], answer: 2, explain: T`Multinomial（多项分布）是 Binomial 的多类版本：每次结果落在 $K$ 类之一，参数是一组加起来为 1 的概率 $(q_1,\dots,q_K)$。它的 conjugate prior（共轭先验）是 Dirichlet，也就是 Beta 的多类版本：把每一类的计数加到对应参数上，后验仍是 Dirichlet。最容易混的是 Beta：它只描述一个 $q\in[0,1]$，配的是只有两类结果的 Binomial。Gamma 配 Poisson（计数），Normal 配 Normal（均值）。L19 p17。` },
      { type: 'mc', q: '"$f(\\theta)\\propto g(\\theta)$ 且 $g$ 是分布 ⇒ $f$ 归一化后就是 $g$"，这让我们可以：', options: ['不用先验', '扔掉常数、只看形状来认出后验', '跳过似然', '直接得到 MLE'], answer: 1, explain: T`$f\propto g$ 的意思是 $f=C\cdot g$，$C$ 是和 $\theta$ 无关的常数；两边积分得 $\int f\,d\theta=C$（$g$ 是分布，积分为 1），所以 $f/\int f\,d\theta=g$。这就是 uniqueness up to normalisation（归一化唯一性）：算后验时可以扔掉所有和 $q$ 无关的常数（组合数、Gamma 函数、分母 $p(k)$），看到剩下的形状 $q^{k+\alpha-1}(1-q)^{n-k+\beta-1}$ 就认出它是 $\mathrm{Beta}(k+\alpha,\ n-k+\beta)$，不用真的去积分。它并不能省掉先验或似然——这个形状正是二者相乘得来的；它也和 MLE 无关。L19 p14。` },
      { type: 'mc', q: '后验 $\\mathrm{Beta}(9,5)$ 的 95% 等尾 credible interval 约为 $[0.39,\\ 0.86]$。哪个说法正确？', options: ['给定先验和数据，$q$ 落在 $[0.39,0.86]$ 里的后验概率是 0.95', '重复抽很多份数据，约 95% 这样算出的区间会盖住真实的 $q$', '区间左右两侧各有 5% 的后验质量', '区间以 MLE $0.7$ 为中心'], answer: 0, explain: T`credible interval（可信区间）是在后验上切出来的：$q$ 被当成随机变量，区间固定，所以可以直接说"给定先验和数据，$q$ 在区间里的概率是 0.95"。第二项是频率学派 confidence interval（置信区间）的解释：那里 $q$ 固定、区间随数据而变，95% 指重复抽样时盖住真值的比例。第三项算错了：等尾区间两侧各留 $\alpha/2=0.05/2=0.025$，即各 2.5%，加起来才是 5%。第四项：等尾区间只管两侧尾巴的质量，不以任何点估计为中心；$\mathrm{Beta}(9,5)$ 是偏的，区间端点更精确是 $0.386$ 和 $0.861$，中点 $(0.386+0.861)/2\approx0.62$，既不是 MLE $7/10=0.7$，也不是后验均值 $9/14\approx0.643$。Workshop 2 bonus。` },
    ],
  });

  /* =====================================================================
   * c52 · Bayesian logistic regression 与近似（L19 p19–p24）
   * ===================================================================== */
  add({
    id: 'c52', week: 'W10', lec: 'L19', pages: 'L19 p19–p24', star: 1,
    keyEn: [
      T`The logistic likelihood $q=\sigma(\mathbf x'\mathbf w)$ has no known conjugate prior, so the posterior and its normalising constant have no closed form and must be approximated.`,
      T`Approximations: Monte Carlo (sample from the posterior), variational (optimise a simple distribution to be close to the posterior), or the Laplace approximation.`,
      T`Laplace approximation: $p(\mathbf w\mid\text{data})\approx\mathrm{Normal}(\mathbf w_{\text{MAP}},(-H)^{-1})$, a Normal at the posterior mode; fast, but poor for multi-modal, skewed or heavy-tailed posteriors.`,
    ],
    keyZh: [
      T`logistic 似然没有已知的共轭先验（conjugate prior）：Gaussian 先验 × sigmoid 似然不是任何已知分布，后验和它的归一化常数都没有闭式解，只能近似。`,
      T`三类近似：蒙特卡洛（Monte Carlo）从后验抽样，把推断变成抽样；变分（variational）在简单分布族里找最接近后验的一个，把推断变成优化；还有 Laplace 近似。`,
      T`拉普拉斯近似（Laplace approximation）：在后验最高点（众数，即 MAP）放一个 Normal，宽度由那里的二阶导数（Hessian）决定，越弯越窄。很快，但后验多峰、偏斜或长尾时盖不住。`,
    ],
    title: 'Bayesian logistic 与近似', en: 'Bayesian logistic regression, non-conjugacy and the Laplace approximation',
    summary: 'Logistic regression 也有参数不确定性，但它的似然 $q=\\sigma(\\bx\'\\bw)$ 是 sigmoid，**没有已知的共轭先验**：后验没有闭式解，归一化常数算不出来。只能**近似**：Monte Carlo（抽样）、variational（变分：找一个最接近的简单分布）、或 **Laplace approximation（拉普拉斯近似）**——在后验的众数处放一个 Normal，用众数处的二阶导数定宽度。',
    prereq: ['c15', 'c50', 'c51'],
    symbols: [
      [T`$\mathbf X,\ \by$`, T`训练数据：设计矩阵（每行一个样本）、标签向量`],
      [T`$\sigma(\cdot)$`, T`logistic sigmoid 函数 $\sigma(s)=\frac1{1+e^{-s}}$（不是标准差）`],
      [T`$q=\sigma(\bx'\bw)$`, T`给定 $\bx$ 时 $y=1$ 的概率`],
      [T`$y\in\{0,1\}$`, T`本章 logistic 的标签写法（c51 生成模型里用 $\pm1$）`],
      [T`$\bw_{\text{MAP}}$`, T`**MAP（maximum a posteriori，最大后验）**估计 = 后验的众数（最高点），Laplace 近似的中心`],
      [T`$H$`, T`Hessian：log 后验在众数处的二阶导数（矩阵）。一维时就是一个数`],
      [T`$p(x),\ q(x)$`, T`（p23 图）真实分布、近似分布。这里的 $q$ 和 Bernoulli 的 $q$ 无关`],
    ],
    goals: [
      '说出 Bayesian logistic regression 为什么没有闭式后验（没有共轭先验）（L19 p19–p21）',
      '区分 Monte Carlo 和 variational 两类近似（L19 p22）',
      '描述 Laplace approximation 的做法、优点和失败情形（L19 p23）',
    ],
    types: ['T13'],
    notExam: 'Variational 方法的具体算法、Bernstein–von Mises 定理的证明不要求。',
    what: [
      T`**问题**（L19 p20–p21）：logistic regression 的输出本身就是概率，已经带有"预测的不确定性"；但**参数** $\bw$ 的不确定性和回归里一样存在——很多条分界线都和数据相容。Bayesian 做法：给 $\bw$ 先验（常用 Gaussian），求后验。`,
      { t: 'slide', src: 'L19/p20', caption: '左：和数据相容的分界线有很多条（参数不确定）；右：用 MAP 一组参数得到的 $p(y=1\\mid\\bx)$。' },
      T`想要 $\bw$ 的后验，就要"似然 × 先验"。先看清似然：logistic regression 的每个样本仍是一次"抛硬币"，只是成功概率 $q$ 不是自由参数，而是 $q=\sigma(\bx'\bw)$（这里标签写成 $0/1$）：`,
      { t: 'math', tex: T`p(y\mid q,\bx)=q^y(1-q)^{1-y},\qquad q=\sigma(\bx'\bw)` },
      T`**卡在哪**：Beta–Binomial 的共轭是对 $q$ 本身放先验；这里 $q$ 被 sigmoid 和 $\bw$ 绑在一起，先验只能放在 $\bw$ 上。**没有已知的共轭先验**：Gaussian 先验 × sigmoid 似然一般不是任何已知分布，分母 $p(\by\mid\mathbf X)$ 的积分算不出来（多分类的 softmax 同理）。`,
      T`**两类近似**（L19 p22）：`,
      { t: 'ul', items: [
        T`**Monte Carlo（蒙特卡洛）**：从后验里抽样，用样本平均近似期望。把推断变成**抽样**。`,
        T`**Variational（变分）**：在一个好算的分布族里（Gaussian、独立 Bernoulli 的乘积……）找"最接近"真实后验 $p$ 的 $q$。把推断变成**优化**。`,
      ] },
      T`上面两类是大方向，具体算法不考。课件要你能讲清楚的是第三种、最简单的办法：不去算那个算不出来的积分，只在后验的**最高点**附近用一个 Normal 把它"盖住"——Normal 自己的归一化常数是现成的，分母算不出来也能往下做。`,
      T`**Laplace approximation**（L19 p23）：假设后验在众数附近**近似是 Normal**：`,
      { t: 'ul', items: [
        T`中心 = 后验的众数，也就是 MAP 估计 $\bw_{\text{MAP}}$（MAP 好算：优化 log 似然 + log 先验即可）。`,
        T`宽度 = 由 log 后验在众数处的**二阶导数**（Hessian）决定：弯得越厉害，Normal 越窄。一维时方差 $=-1/(\text{二阶导数})$；多维时协方差 $=(-H)^{-1}$。`,
        T`**为什么是"$-1/$二阶导"？** 方差为 $s^2$ 的 Normal，log 密度 $=\text{常数}-\frac{(w-m)^2}{2s^2}$，对 $w$ 求两次导恰好是 $-1/s^2$。让这个 Normal 在山顶和真实 log 后验**弯曲程度一样**（二阶导相等）：$-1/s^2=\text{二阶导}$ ⇒ $s^2=-1/\text{二阶导}$。多维时"二阶导"换成 Hessian 矩阵 $H$，"$-1/$"换成取负再求逆：$(-H)^{-1}$。例（"数学定义"一节有完整步骤）：c51 里 Beta(2,2) 先验 + 10 次 7 正得到的后验 $\mathrm{Beta}(9,5)$，众数 $q=2/3$，那里 log 密度的二阶导是 $-54$ ⇒ 近似 Normal 的方差 $1/54$。`,
        T`优点：快——只要一次最大化加一个 Hessian。之后 Normal 的归一化常数已知，还能直接抽样。`,
        T`缺点：后验**长尾、多峰、偏斜**时很差（一个 Normal 只有一个峰、左右对称）。理论支撑：数据 $n\to\infty$ 时"表现良好"的后验会渐近 Normal（Bernstein–von Mises 定理）。`,
      ] },
      { t: 'slide', src: 'L19/p23', caption: '上：近似 $q(x)$ 在众数附近贴合真实的 $p(x)$；左下：真实分布有两个峰时，一个 Normal 盖不住。' },
    ],
    why: [
      T`往年考过的是概念："为什么 Bayesian logistic regression 要近似"、"Laplace 近似是什么、什么时候不好"（T13 题库）。和 c50 的对比最重要：**线性回归 + Normal 先验 = 共轭，有闭式解；logistic + Normal 先验 = 非共轭，必须近似。**`,
    ],
    intuition: [
      T`**Laplace 近似 = 在山顶贴一个钟形曲线。** 找到后验最高点（众数），量一下山顶有多尖（二阶导数），然后用一个同样位置、同样尖的 Normal 代替整座山。山如果本来就是单峰、对称的，近似很好；如果山有两个峰或一边拖很长的尾巴，钟形曲线就盖不住。`,
      T`**为什么二阶导数决定宽度？** Normal 的 log 密度是 $-\frac{(w-\mu)^2}{2s^2}+$常数，二阶导数恰好是 $-1/s^2$。所以让近似和真实 log 后验在众数处二阶导数相同，就是令 $-1/s^2=$ 那个二阶导数。`,
      { t: 'think', q: '对 Bayesian **线性**回归做 Laplace 近似，结果会怎样？', a: T`完全精确。线性回归的后验本来就是 Normal（c50），它的 log 密度就是二次函数，在众数处做二阶展开没有任何误差。` },
      { t: 'story', title: 'Laplace 又来了', md: '同一个 Pierre-Simon Laplace：1774 年他在研究"根据观测反推原因的概率"时，用"在最大值附近把积分近似成 Gaussian 积分"的办法处理算不出来的积分——这就是今天的 Laplace approximation，比日出问题（c51）还早 40 年。' },
    ],
    math: [
      { t: 'h3', text: '一维 Laplace 近似：拿 Beta(9,5) 试一试' },
      T`c51 的例子：先验 $\mathrm{Beta}(2,2)$，抛 10 次 7 次正面，后验是 $\mathrm{Beta}(2+7,\ 2+3)=\mathrm{Beta}(9,5)$。我们知道它的精确形状，正好检验近似有多准。log 密度 $=8\ln q+4\ln(1-q)+$常数——Beta$(\alpha,\beta)$ 的密度正比于 $q^{\alpha-1}(1-q)^{\beta-1}$，指数比参数少 1：$8=9-1$，$4=5-1$。`,
      { t: 'steps', items: [
        T`**众数**：一阶导 $\frac8q-\frac4{1-q}=0$ ⇒ $q=8/12=2/3$。`,
        T`**二阶导**：$-\frac{8}{q^2}-\frac{4}{(1-q)^2}$，在 $q=2/3$ 处 $=-\frac{8}{4/9}-\frac{4}{1/9}=-18-36=-54$。（$q^2=(2/3)^2=4/9$，$(1-q)^2=(1/3)^2=1/9$；除以分数 = 乘倒数：$8\times\frac94=18$，$4\times9=36$。）`,
        T`**近似**：$\mathrm{Normal}(2/3,\ 1/54)$，标准差 $\approx0.136$。`,
        T`对比精确的 Beta(9,5)：均值 $0.643$，标准差 $\approx0.124$。中心和宽度都接近但不完全一样——因为 Beta(9,5) 有点偏斜。数据越多，后验越接近 Normal，近似越准。`,
      ] },
      T`拖动 $a,b$ 看近似什么时候好、什么时候差：$a,b$ 都大时（数据多）两条曲线几乎重合；$a,b$ 差得多时（偏斜）近似明显不准。`,
      { t: 'viz', id: 'laplace-approx' },
    ],
    fx: [
      {
        title: 'Laplace approximation', tex: T`p(\bw\mid\text{data})\approx\mathrm{Normal}\big(\htmlClass{fx-p1}{\bw_{\text{MAP}}},\ \htmlClass{fx-p2}{(-H)^{-1}}\big)`,
        parts: [
          { label: 'w_MAP', note: '后验众数：优化 log 似然 + log 先验得到（不需要归一化常数）。' },
          { label: '(−H)⁻¹', note: '$H$ 是 log 后验在众数处的 Hessian（负定）。越弯 ⇒ $-H$ 越大 ⇒ 方差越小。一维时就是 $-1/(\\text{二阶导数})$。' },
        ],
      },
    ],
    example: [
      { t: 'fade', title: '分步练习：一维 Laplace 近似', plan: ['写出 log 密度，令一阶导为 0 求众数', '算众数处的二阶导数', T`近似 $\mathrm{Normal}(\text{众数},\ -1/\text{二阶导})$`], items: [
        { md: T`$\mathrm{Beta}(9,5)$：log 密度 $8\ln q+4\ln(1-q)$。`, steps: [
          { md: '众数 $2/3$' }, { md: '$-54$' }, { md: T`$\mathrm{Normal}(2/3,\ 1/54)$` },
        ] },
        { md: T`$\mathrm{Beta}(3,3)$：log 密度 $2\ln q+2\ln(1-q)$。`, steps: [
          { ask: '众数 = ?', answer: 0.5, show: T`$\frac2q=\frac2{1-q}$ ⇒ $q=0.5$` },
          { ask: '众数处的二阶导数 = ?', answer: -16, show: T`$-\frac{2}{0.25}-\frac{2}{0.25}=-16$` },
          { ask: '近似 Normal 的方差 = ?', answer: 0.0625, tol: 0.0005, show: '$1/16$' },
        ] },
        { md: T`$\mathrm{Beta}(5,2)$：log 密度 $4\ln q+\ln(1-q)$。`, steps: [
          { ask: '众数 = ?', answer: 0.8, show: T`$\frac4q=\frac1{1-q}$ ⇒ $q=4/5$` },
          { ask: '近似 Normal 的方差 = ?', answer: 0.032, tol: 0.0005, show: T`二阶导 $-\frac{4}{0.64}-\frac{1}{0.04}=-31.25$，方差 $1/31.25=0.032$。（Beta(5,2) 偏斜明显，这个近似比较粗。）`, sg: 3 },
        ] },
      ] },
    ],
    viz: [
      { id: 'beta-coins', opts: { alpha: 2, beta: 2, k: 7, n: 10 }, how: '用 c51 的工具看 Beta(9,5) 这条后验：它稍微向左偏（左边尾巴长）。Laplace 近似会用一条以众数 $2/3$ 为中心、左右对称的钟形曲线代替它。',
        try: '这张图的滑块是**先验** $\\alpha,\\beta$，按钮是加抛硬币的结果。想看一个很偏的后验：先验调成 $\\alpha=2,\\beta=1$，点"清空数据"，后验就是 $\\mathrm{Beta}(2,1)$，峰贴在 $q=1$ 的边上——对称的 Normal 怎么可能贴合它？这就是 L19 p23 说的"skewed 时近似很差"。要直接看近似曲线，用上面的 Laplace 图，把 $a,b$ 调成 $2$ 和 $8$。' },
    ],
    compare: [
      { t: 'table', head: ['', 'Bayesian 线性回归（c50）', 'Bayesian logistic regression'], rows: [
        ['似然', 'Normal', 'Bernoulli + sigmoid'],
        ['先验', 'Normal', 'Normal（只是为了方便，不共轭）'],
        ['共轭？', '是', '否（没有已知共轭先验）'],
        ['后验', '闭式 Normal$(\\bw_N,\\mathbf V_N)$', '没有闭式解，需要近似'],
      ] },
      { t: 'table', head: ['近似方法', '把推断变成', '特点'], rows: [
        ['Monte Carlo', '抽样', '样本够多就准，但慢'],
        ['Variational', '优化', '在简单分布族里找最接近的'],
        ['Laplace', '一次优化 + 一个 Hessian', '最快；只适合单峰、近似对称的后验'],
      ] },
      { t: 'exam', md: T`**Why must Bayesian logistic regression be approximated, and what is the Laplace approximation?** There is no known (tractable) conjugate prior for the logistic (Bernoulli–sigmoid) likelihood; with e.g. a Gaussian prior on $\mathbf w$ the posterior is not a standard distribution and the posterior and its normalising constant (evidence) generally have no closed form. It is approximated by Monte Carlo sampling, variational methods, or the Laplace approximation: a Normal centred at the posterior mode $\mathbf w_{\text{MAP}}$ with covariance given by the inverse negative Hessian of the log posterior at the mode. It is fast (one optimisation and one Hessian) but poor when the posterior is multi-modal, skewed or heavy-tailed.` },
    ],
    pitfalls: [
      ['Logistic regression 的输出已经是概率，所以不需要 Bayesian', '输出概率表示的是预测的随机性，参数 $\\bw$ 的不确定性仍然存在（L19 p20）。'],
      ['Gaussian 先验对 logistic 似然是共轭的', '不是；没有已知的共轭先验（L19 p21）。'],
      ['Laplace 近似以后验均值为中心', '以后验**众数**（MAP）为中心。'],
      ['Laplace 近似对多峰后验也很好', '一个 Normal 只有一个峰，多峰、偏斜、长尾时都差。'],
    ],
    quiz: [
      { type: 'mc', q: 'Laplace 近似需要的两样东西：', options: ['后验均值和方差', '后验众数和众数处的二阶导数', '先验和似然的积分', '很多后验样本'], answer: 1, explain: T`Laplace approximation（拉普拉斯近似）用一个 Normal 盖住后验：中心放在后验的 mode（众数，即 MAP 估计、曲线最高点），宽度由 log 后验在众数处的二阶导数决定（一维时方差 $=-1/\text{二阶导}$，多维时 $(-H)^{-1}$）。众数只要做一次优化就能找到，不需要归一化常数，所以这个方法快。最容易选错的是"后验均值和方差"：要算它们就得先把后验归一化，而这正是算不出来的那一步；"很多后验样本"是 Monte Carlo 的做法。L19 p23。` },
      { type: 'mc', q: 'Variational 方法把推断变成：', options: ['抽样', '优化', '积分', '计数'], answer: 1, explain: T`Variational method（变分方法）先选一个好算的分布族（如 Gaussian、独立 Bernoulli 的乘积），再在族里找和真实后验 $p$ "最接近"的那个 $q$。"找最接近的"就是调 $q$ 的参数让差距最小，所以是一个优化问题。最容易混的是"抽样"：那是 Monte Carlo（蒙特卡洛）方法，从后验抽样本、用样本平均近似期望。一句话记：Monte Carlo = 抽样，variational = 优化。L19 p22。` },
      { type: 'num', q: '某一维后验的 log 密度在众数处的二阶导数是 $-25$。Laplace 近似的标准差？', answer: 0.2, explain: T`要算的是 Laplace 近似那个 Normal 的标准差。题目给的 $-25$ 是 log 后验在众数处的二阶导数（山顶有多弯）。一维时方差 $=-1/\text{二阶导}=-1/(-25)=1/25=0.04$，标准差 $=\sqrt{0.04}=0.2$。道理：方差为 $s^2$ 的 Normal，log 密度的二阶导恰好是 $-1/s^2$，令它等于 $-25$ 就得到 $s^2=1/25$。陷阱：答成方差 0.04，或漏掉负号得到负的方差。` },
      { type: 'show', q: '（英文）How do Monte Carlo and variational approximations differ?', answer: T`Monte Carlo methods draw samples from the (unnormalised) posterior and approximate expectations by sample averages — inference becomes sampling; they become exact as the number of samples grows but can be slow. Variational methods choose a tractable family (e.g. Gaussians or a product of independent factors) and optimise the member closest to the posterior — inference becomes optimisation; they are fast but limited by the chosen family.`, qzh: '蒙特卡洛（Monte Carlo）近似和变分（variational）近似有什么区别？', azh: '蒙特卡洛方法从（未归一化的）后验中抽样，用样本平均来近似期望——推断（inference）变成了抽样；随着样本数增加，它会趋于精确，但可能很慢。变分方法选定一个易处理的分布族（tractable family，例如高斯分布，或独立因子的乘积），并优化出该族中最接近后验的成员——推断变成了优化；它很快，但受限于所选的分布族。' },
    ],
  });

  /* =====================================================================
   * c53 · Bayesian network、因子分解、CPT（L20 p3–p14, p26–p27）
   * ===================================================================== */
  add({
    id: 'c53', week: 'W10', lec: 'L20', pages: 'L20 p3–p14, p26–p27', star: 3,
    keyEn: [
      T`A Bayesian network is a DAG plus one CPT per node; the joint factorises as $P(x_1,\dots,x_n)=\prod_iP(x_i\mid x_{pa_i})$, each node conditioned only on its parents.`,
      T`CPT format: rows = values of the child, columns = parent configurations, each column sums to 1; a binary node with $p$ binary parents has $2^{p+1}$ entries and $2^p$ free parameters.`,
      T`A full joint table over $n$ binary variables has $2^n$ rows ($2^n-1$ free parameters); the factorisation replaces it with small local tables.`,
      T`MLE with complete data: the likelihood splits per CPT, so each entry is a relative frequency $\hat P(x\mid u)=\#(X=x,\,pa=u)/\#(pa=u)$; a known deterministic rule gives a 0/1 CPT.`,
    ],
    keyZh: [
      T`贝叶斯网络（Bayesian network）= 有向无环图（DAG）+ 每个节点一张条件概率表（CPT）。联合分布等于每个节点"给定父节点"的条件概率连乘，每个节点只看自己的父节点。`,
      T`CPT 的课件格式：行是子节点的取值，列是父节点的每种取值组合，每一列和为 1。二元节点带 $p$ 个二元父节点：表里 $2^{p+1}$ 个数，每列少一个自由的，自由参数 $2^p$ 个。`,
      T`$n$ 个二元变量的完整联合表有 $2^n$ 行（总和为 1，所以自由参数少一个），随 $n$ 指数增长；因子分解把它换成很多张小表。`,
      T`数据完整时，MLE 按 CPT 拆开，每格就是数频率：在父节点取值为 $u$ 的那些行里，数子节点取 $x$ 的比例。已知的确定性规则（如山火题里警报何时响）给出只含 0 和 1 的 CPT。`,
    ],
    examQ: [
      { src: '2025 practice Q1(d)(e)', q: T`Four Boolean random variables $X,Y,Z,V$. (d) With no independence assumed, how many rows are in the probability table of their joint distribution? (e) If $X,Y,Z$ are independent of each other and $V$ depends on $X,Y$, how many rows do we need?`,
        a: T`(d) $2^4=16$ rows (15 free parameters, since they sum to 1). (e) The joint factorises as $P(X)P(Y)P(Z)P(V\mid X,Y)$, so we store $2+2+2+2^3=14$ rows, one per table entry (only $1+1+1+4=7$ free parameters).`,
        qzh: T`四个布尔随机变量（Boolean random variables）$X,Y,Z,V$。(d) 不假设任何独立性时，它们的联合分布（joint distribution）的概率表有多少行？(e) 如果 $X,Y,Z$ 相互独立，而 $V$ 依赖于 $X,Y$，需要多少行？`,
        azh: T`(d) $2^4=16$ 行（因为总和为 1，自由参数 free parameters 有 15 个）。(e) 联合分布分解（factorises）为 $P(X)P(Y)P(Z)P(V\mid X,Y)$，所以要存 $2+2+2+2^3=14$ 行，每个表项一行（自由参数只有 $1+1+1+4=7$ 个）。` },
      { src: '2025 practice Q4(b)', q: T`For the directed PGM $A\to C\leftarrow B$ (Boolean variables), suppose we observe $n$ sets of values of $A,B,C$ (complete observations). What does the maximum-likelihood principle say to do?`,
        a: T`Choose the CPT entries that maximise the likelihood of the data, $\prod_iP(a_i)P(b_i)P(c_i\mid a_i,b_i)$, subject to each distribution summing to 1. With complete data this decouples per table, giving relative frequencies, e.g. $\hat P(C=c\mid A=a,B=b)=\#(a,b,c)/\#(a,b)$.`,
        qzh: T`对于有向概率图模型（directed PGM）$A\to C\leftarrow B$（布尔变量 Boolean variables），假设我们观测到 $n$ 组 $A,B,C$ 的取值（完全观测 complete observations）。最大似然原则（maximum-likelihood principle）告诉我们该怎么做？`,
        azh: T`选择使数据似然（likelihood）$\prod_iP(a_i)P(b_i)P(c_i\mid a_i,b_i)$ 最大的条件概率表（CPT）取值，约束是每个分布之和为 1。在完全数据下，这个问题按表拆开（decouples per table），解就是相对频率（relative frequencies），例如 $\hat P(C=c\mid A=a,B=b)=\#(a,b,c)/\#(a,b)$。` },
      { src: '2026 practice Q6(c) = 2025 practice Q6(c)', q: T`Bushfire alert model with sensors $S_1,S_2,S_3,C_1,C_2$ and alert $A$ (evacuate if any $S_i$ is on, but stay put if $C_1$ or $C_2$ is on). Suppose you are told the sensors are always accurate. What could you say about your CPTs?`,
        a: T`It says nothing about how often the sensors are on, so the sensor tables are unaffected. But we can trust the sensors, so the CPT of $A$ becomes deterministic (all 0/1): $A=(S_1\lor S_2\lor S_3)\land\lnot(C_1\lor C_2)$.`,
        qzh: T`山火警报模型（bushfire alert model）：传感器为 $S_1,S_2,S_3,C_1,C_2$，警报为 $A$（任一 $S_i$ 亮起就疏散，但 $C_1$ 或 $C_2$ 亮起时原地不动）。假设有人告诉你这些传感器总是准确的。关于你的条件概率表（CPTs），你能说些什么？`,
        azh: T`这条信息没有说明传感器多久亮一次，所以传感器自己的表不受影响。但我们可以信任传感器，所以 $A$ 的 CPT 变成确定性的（deterministic，全是 0/1）：$A=(S_1\lor S_2\lor S_3)\land\lnot(C_1\lor C_2)$。` },
      { src: '2025 practice Q6(d)', q: T`(Bushfire model) How would you change your model if the sensor $S_1$ is not perfectly accurate?`,
        a: T`Add a latent variable $F_1$ (true fire at the location of $S_1$) with edge $F_1\to S_1$, and replace $S_1\to A$ by $F_1\to A$. New CPTs $P(F_1)$ and $P(S_1\mid F_1)$, which is not 0/1 and models false positives and false negatives.`,
        qzh: T`（山火模型 bushfire model）如果传感器 $S_1$ 并非完全准确，你会怎样修改模型？`,
        azh: T`加一个隐变量（latent variable）$F_1$（$S_1$ 所在位置是否真的有火），加边 $F_1\to S_1$，并把 $S_1\to A$ 换成 $F_1\to A$。新的 CPT 为 $P(F_1)$ 和 $P(S_1\mid F_1)$；后者不是 0/1，用来刻画误报（false positives）和漏报（false negatives）。` },
      { src: '2025 practice Q6(e)', q: T`(Bushfire model) Given this final model, with all CPTs trained, how would you use it to drive the alarm to evacuate?`,
        a: T`Observe the five sensor readings and compute $P(A=1\mid s_1,s_2,s_3,c_1,c_2)=\sum_fP(A=1\mid f,s_2,s_3,c_1,c_2)\,P(f\mid s_1)$ by marginalising the latent $F_1$; raise the alarm if it exceeds a threshold (e.g. 0.5, or one set by the costs of errors).`,
        qzh: T`（山火模型 bushfire model）给定这个最终模型，并且所有 CPT 都已训练好，你会如何用它来驱动疏散警报（alarm to evacuate）？`,
        azh: T`观测五个传感器的读数，通过对隐变量（latent variable）$F_1$ 求和边缘化（marginalising）来计算 $P(A=1\mid s_1,s_2,s_3,c_1,c_2)=\sum_fP(A=1\mid f,s_2,s_3,c_1,c_2)\,P(f\mid s_1)$；如果它超过某个阈值（threshold）就拉响警报（例如 0.5，或根据各类错误的代价设定的阈值）。` },
      { src: '2021 Q14(c)', q: T`Instead of implementing $P(D\mid A,B)$ as a large conditional probability table, we use a logistic regression model with three parameters (one for each conditioning variable and a bias). Besides reducing the number of parameters, state another important consequence of this change.`,
        a: T`Logistic regression $P(D=1\mid A,B)=\sigma(w_0+w_AA+w_BB)$ forces the log-odds to be linear in $A$ and $B$, so the model loses expressiveness: interactions such as an XOR-like dependence cannot be represented (higher bias). In exchange, parameters are shared across parent configurations, so estimates are more stable and unseen configurations still get sensible probabilities.`,
        qzh: T`我们不把 $P(D\mid A,B)$ 实现为一张大的条件概率表（conditional probability table），而是用一个有三个参数（每个条件变量一个，再加一个偏置 bias）的逻辑回归（logistic regression）模型。除了减少参数个数之外，写出这个改动的另一个重要后果。`,
        azh: T`逻辑回归 $P(D=1\mid A,B)=\sigma(w_0+w_AA+w_BB)$ 强制对数几率（log-odds）是 $A$ 和 $B$ 的线性函数，所以模型失去了表达能力（expressiveness）：像 XOR 那样的交互作用（interactions）无法表示（偏差 bias 更高）。作为交换，参数在不同的父节点取值组合（parent configurations）之间共享，所以估计更稳定，没见过的取值组合也能得到合理的概率。` },
    ],
    title: 'Bayesian network、因子分解、CPT', en: 'Bayesian networks: DAGs, factorisation, CPTs, parameter counting and MLE',
    summary: '**Bayesian network（贝叶斯网络）** = 一张 **DAG（有向无环图）** + 每个节点一张 **CPT（条件概率表）**。联合分布等于每个节点"给定父节点"的条件概率之积：$P(x_1,\\dots,x_n)=\\prod_iP(x_i\\mid x_{pa_i})$。这让一张 $2^n$ 行的大表拆成很多小表。往年 Section C 的大题（山火警报、2025 Q4、2025 Q1d–e）都考：**画图、写因子分解、数 CPT 大小、用数数做 MLE**。',
    prereq: ['c02', 'c06'],
    symbols: [
      [T`$x_i$（或大写 $X_i$）`, T`第 $i$ 个随机变量（图中一个节点）`],
      [T`$pa_i$`, T`节点 $i$ 的父节点集合；$x_{pa_i}$ 是这些父节点的取值`],
      [T`$P(x_i\mid x_{pa_i})$`, T`节点 $i$ 的 CPT：给定父节点取值时它的分布`],
      [T`$X\perp Y$`, T`$X$ 与 $Y$ 独立：$P(X,Y)=P(X)P(Y)$`],
      [T`$X\perp Y\mid Z$`, T`给定 $Z$ 时 $X$ 与 $Y$ 条件独立：$P(X,Y\mid Z)=P(X\mid Z)P(Y\mid Z)$`],
      [T`$\hat P$`, T`从数据估计出的概率（MLE）`],
      [T`$\#(\cdot)$`, T`数据里满足条件的行数（计数）`],
    ],
    goals: [
      '说出 BN 的两部分：图 + 概率分布；认出 DAG、环、父 / 子 / 祖先 / 后代（L20 p4–p7）',
      '从图写因子分解，从因子分解画图（L20 p27；2021 Q14a）',
      '按课件格式画 CPT（行 = 子节点取值，列 = 父节点配置，每列和为 1），数表的大小和自由参数个数（L20 p9–p11；2025 Q1d–e、Q4a；2026 Q6b）',
      '用计数做 CPT 的 MLE（2025 Q4b–c）；会写确定性的 0/1 CPT（2026 Q6c）',
    ],
    types: ['T07', 'T05'],
    what: [
      { t: 'h3', text: '① Bayesian network 是什么（L20 p4）' },
      T`变量一多，联合分布的表就大得存不下（5 个二元变量 32 行，30 个就十亿行）。**Bayesian network（贝叶斯网络，BN）** 的办法是把"谁直接影响谁"画成一张图，再给每个变量配一张小表。课件的说法：BN = **① 一张图**（说明变量之间怎么关联）**+ ② 一个概率分布**（用数字说明依赖有多强）。用途：诊断推理（看到症状推病因）、医学和计算生物学里的发现、用户建模。`,
      { t: 'h3', text: '② 先看一个例子：两枚硬币和一个报告人（L20 p8–p11）' },
      T`两个人各抛一枚公平硬币（$x_1,x_2\in\{0,1\}$），第三个人报告两枚硬币是否相同（$x_3=1$ 表示"相同"），他 90% 的时候说对。谁直接影响谁？报告人看的是两枚硬币，所以箭头从 $x_1$、$x_2$ 指向 $x_3$；两枚硬币之间没有箭头（互不影响）。`,
      fig(COIN, { edges: 'x1>x3 x2>x3', w: 270, notes: { x1: '硬币 1', x2: '硬币 2', x3: '报告"相同吗"' }, caption: '硬币例子的图：$x_1\\to x_3\\leftarrow x_2$。' }),
      T`每个节点配一张 **CPT（conditional probability table，条件概率表）**：给定它的父节点（箭头指向它的那些节点）时它的分布。$x_1$、$x_2$ 没有父节点，表就是 $(0.5,\ 0.5)$。$x_3$ 有两个父节点：`,
      { t: 'table', cls: 'compact', head: ['$P(x_3\\mid x_1,x_2)$', '$x_1x_2=00$', '$01$', '$10$', '$11$'], rows: [
        ['$x_3=0$', '0.1', '0.9', '0.9', '0.1'],
        ['$x_3=1$', '0.9', '0.1', '0.1', '0.9'],
      ] },
      T`课件格式：**行 = 子节点的取值，列 = 父节点的每一种取值组合，每一列加起来等于 1**。读法：硬币是 00（相同）时，报告"相同"（$x_3=1$）的概率是 0.9。整个联合分布就是三张表相乘：$P(x_1,x_2,x_3)=P(x_1)\,P(x_2)\,P(x_3\mid x_1,x_2)$。例：$P(x_1=0,x_2=1,x_3=1)=0.5\times0.5\times0.1=0.025$。`,
      { t: 'h3', text: '③ 这种图的规矩：有向、无环（DAG）（L20 p5–p6）' },
      T`硬币的图已经画出来了：箭头表示"谁直接影响谁"，$x_1,x_2$ 没有谁影响它们，所以没有父节点。这种图有一条硬性规矩：**不能有环**——要把联合分布写成"每个变量只看它的父节点"的乘积，节点必须能排出先后，环会让谁先谁后说不清。`,
      T`**有向图**：圆圈是节点（变量），箭头是有向边。顺着箭头走、能回到出发点，就是**环（cycle）**。没有环的有向图叫 **DAG（directed acyclic graph，有向无环图）**。BN 的图**必须**是 DAG——"A 影响 B、B 又影响 A"在 BN 里不允许。`,
      { t: 'graphs', items: [
        { nodes: { a: [40, 40], b: [160, 40], c: [100, 140] }, edges: 'a>b b>c a>c', caption: 'DAG：顺着箭头走不回原点' },
        { nodes: { a: [40, 40], b: [160, 40], c: [100, 140] }, edges: 'a>b b>c c>a:path', caption: '有环：a→b→c→a（红色那条让它回到起点），不能做 BN' },
      ] },
      { t: 'h3', text: '④ 父、子、祖先、后代（L20 p7）' },
      T`上面一直在说"父节点"。把家族关系的说法一次讲全（祖先、后代下一章 c54 判断独立性时才用到，这里先认识）：`,
      fig({ nodes: { s1: [60, 40], s2: [200, 40], x1: [60, 150], x2: [200, 150] }, labels: { s1: 's₁', s2: 's₂', x1: 'x₁', x2: 'x₂' } }, { edges: 's1>s2 s1>x1 s2>x2', w: 260, caption: '课件 p7 的图：$s_1\\to s_2$，$s_1\\to x_1$，$s_2\\to x_2$。' }),
      { t: 'ul', items: [
        T`$a\to b$：$a$ 是 $b$ 的 **parent（父节点）**，$b$ 是 $a$ 的 **child（子节点）**。图中 $s_1$ 是 $x_1$ 的父节点。`,
        T`沿箭头**反方向**能走到的都是 **ancestors（祖先）**：$x_2$ 的祖先是 $s_2$ 和 $s_1$（$x_1$ 不是）。`,
        T`沿箭头**正方向**能走到的都是 **descendants（后代）**：$s_1$ 的后代是 $x_1,s_2,x_2$。`,
      ] },
      { t: 'h3', text: '⑤ 图本身就告诉我们独立性（L20 p12–p13）' },
      T`不看任何数字，只看图就能说：两枚硬币**互相独立**（$X_1\perp X_2$）；但**知道报告结果以后**，它们就不再独立了（$X_1\perp X_2\mid X_3$ 不成立：报告说"相同"、又知道 $x_1=1$，你几乎能断定 $x_2=1$）。怎么从任意一张图读出这种结论，是下一章 D-separation 的内容（c54）。`,
      { t: 'h3', text: '⑥ 第二个例子：alarm 网络（L20 p14）' },
      T`上一节把"怎么从图读独立性"留给了下一章。这个例子换一个练习目的：硬币的 CPT 是普通小数，alarm 的 CPT 大部分是 0 或 1，表示"地震了电台**一定**报道"这种确定性规则——考试会让你写出这种 CPT，并照着图把联合分布写成"每个节点给定父节点"的乘积。（听到警报后 $L$ 和 $B$ 还独不独立，仍留给 c54。）`,
      fig(ALARM, { edges: ALARM_EDGES, w: 300, caption: '$P(E,B,R,A,L)=P(E)\\,P(B)\\,P(R\\mid E)\\,P(A\\mid E,B)\\,P(L\\mid R,A)$：每个节点一个因子，竖线右边是它的父节点。' }),
      T`都是 0/1 变量。先验：$P(E=1)=0.01$，$P(B=1)=0.01$。其余 CPT 都是**确定性**的（只含 0 和 1）：$P(A=1\mid E,B)=1$ 当且仅当 $E=1$ 或 $B=1$；$E=1$ 时 $P(R=1\mid E)=1$、$E=0$ 时为 0（有地震电台就报道）；$P(L=1\mid R,A)=1$ 当且仅当 $A=1$ 且 $R=0$（警报响了、但电台没说地震，才赶紧回家）。课件接着问：听到警报以后，我下不下班和有没有盗窃还有关系吗（$L\perp B\mid A$？）——这也是 c54 的内容。`,
      { t: 'h3', text: '⑦ 正式定义：联合分布 = 每个节点给定父节点的条件概率之积（L20 p26–p27）' },
      { t: 'math', tex: T`P(x_1,\dots,x_n)=\prod_{i=1}^nP(x_i\mid x_{pa_i})` },
      T`$pa_i$ 是节点 $i$ 的父节点集合。没有父节点的因子就是 $P(x_i)$。课件 p27：任何满足图里全部条件独立性的分布都能写成这种形式；反过来，按这个式子写出的分布自动满足图里的所有独立性（c54）。上面两个例子的联合分布都是这个式子的特例。`,
    ],
    why: [
      T`这是 Section C 设计题的核心（[T7](#/T07)）：2026 practice Q6、2025 practice Q6（山火警报，10–20 分）、2025 practice Q4（CPT 格式 + MLE，15 分）、Q1(d)(e)（数表的行数，10 分）、2021 Q14(a)（从因子分解画图）。分数多、套路固定。`,
    ],
    intuition: [
      T`**为什么要拆成小表？** 5 个二元变量的完整联合表有 $2^5=32$ 行。BN 只需要每个节点"看自己的父节点"：只按 alarm 网络的图结构计数（不管 p14 那些确定性的 0/1 规则），5 张 CPT 一共 $2+2+4+8+8=24$ 个数，其中自由参数 $1+1+2+4+4=12$ 个（每列和为 1，少一个），而完整联合表要 31 个。变量越多，省得越多——父节点少时是线性增长，而联合表是指数增长。（按图对上：$E$、$B$ 没有父节点，各 2 格；$R$ 的父节点是 $E$，$2\times2=4$ 格；$A$ 的父节点是 $E,B$，$2\times4=8$ 格；$L$ 的父节点是 $R,A$，也是 8 格。）`,
      T`**箭头 ≈ "直接影响"。** 一个节点只直接依赖它的父节点；和其他变量的关联都要通过图里的路径传过去。没有箭头的地方，就是在声明某种独立性——c54 教怎么从图里读出它们。`,
      T`上面的 CPT 数字都是题目直接给的。考试也常给一张**完整的数据表**，要你把 CPT 的格子填出来——不用任何优化，只要在"父节点恰好是这个取值"的那些行里数频率：`,
      T`**MLE = 数数。** 数据完整（每一行都观测到所有变量）时，似然按 CPT 拆开，每张表单独估计：$\hat P(x_i=v\mid x_{pa_i}=u)=\dfrac{\#(x_i=v,\ x_{pa_i}=u)}{\#(x_{pa_i}=u)}$——在父节点取值为 $u$ 的那些行里，数 $x_i=v$ 的比例。`,
      { t: 'think', q: '一个节点有 3 个二元父节点，它自己也是二元的。按课件格式它的 CPT 有几行几列？几个自由参数？', a: T`2 行（子节点 0/1）× $2^3=8$ 列（父节点的 8 种组合），共 16 个数；每列和为 1，所以自由参数 8 个。` },
      { t: 'story', title: 'Judea Pearl', md: 'Bayesian network 这个名字和它的推理算法来自 Judea Pearl（1980 年代，1988 年的《Probabilistic Reasoning in Intelligent Systems》）。他因为"概率与因果推理"方面的贡献获得 2011 年图灵奖。课件的 alarm 例子是 Pearl 书里经典"盗窃警报"例子的变体。' },
    ],
    math: [
      { t: 'h3', text: '数 CPT 的三种口径' },
      T`设每个变量有 $r$ 个取值（二元时 $r=2$），节点 $i$ 有 $|pa_i|$ 个父节点：`,
      { t: 'table', cls: 'compact', head: ['口径', '节点 $i$ 的 CPT', '二元时'], rows: [
        ['表格形状（课件）', '$r$ 行 × $r^{|pa_i|}$ 列', '$2\\times2^{|pa_i|}$'],
        ['表中的数（entries）', '$r^{|pa_i|+1}$', '$2^{|pa_i|+1}$'],
        ['自由参数（每列和为 1）', '$(r-1)\\,r^{|pa_i|}$', '$2^{|pa_i|}$'],
      ] },
      T`完整联合表：$r^n$ 行（自由参数 $r^n-1$）。题目问"rows"时看清它指哪种；2025 Q1(e) 的标准答案按 entries 数：$2+2+2+8=14$——$X,Y,Z$ 没有父节点，各一张 2 格的表；$V$ 的父节点是 $X,Y$，表是 $2\times4=8$ 格（自由参数是 $1+1+1+4=7$）。图见下面练习题 2。`,
      { t: 'h3', text: 'MLE（2025 Q4b）' },
      T`完整数据 $D=\{\bx^{(1)},\dots,\bx^{(m)}\}$ 的似然 $\prod_j\prod_iP(x_i^{(j)}\mid x_{pa_i}^{(j)})$ 按 CPT 拆开，每张表各自最大化 ⇒ 每个格子取**经验频率**（计数 ÷ 父节点配置的计数）。没有父节点的就是计数 ÷ 总行数。数据里某个父节点配置一次都没出现，那一列的计数公式是 $0/0$：似然根本不依赖这一列，任何合法的列都同样好，MLE 不唯一（这时可以加先验做平滑，即 c51 的 Beta 伪计数）。`,
    ],
    fx: [
      {
        title: 'Bayesian network 的联合分布（L20 p27）', tex: T`P(x_1,\dots,x_n)=\prod_{i=1}^n\htmlClass{fx-p1}{P(x_i\mid\htmlClass{fx-p2}{x_{pa_i}})}`,
        parts: [
          { label: 'CPT', note: '每个节点一张表：自己给定父节点的条件分布。' },
          { label: 'parents', note: '只看父节点。根节点没有父节点，因子就是 $P(x_i)$。' },
        ],
      },
    ],
    example: [
      { t: 'h3', text: '例 1：用 alarm 网络算一个联合概率' },
      T`$P(E=0,B=1,R=0,A=1,L=1)=P(E=0)P(B=1)P(R=0\mid E=0)P(A=1\mid E=0,B=1)P(L=1\mid R=0,A=1)=0.99\times0.01\times1\times1\times1=0.0099$。`,
      { t: 'h3', text: '例 2：从因子分解画图（2021 Q14a）' },
      T`$P(A)P(B)P(C\mid A)P(D\mid A,B)P(E\mid D)P(F\mid C,E)$：每个因子竖线右边的就是父节点 ⇒ 边 $A\to C$，$A\to D$，$B\to D$，$D\to E$，$C\to F$，$E\to F$。`,
      { t: 'h3', text: '例 3：MLE 数数' },
      T`图 $A\to B$，6 行完整数据 $(A,B)$：$(T,T),(T,T),(T,F),(F,F),(F,T),(F,F)$。`,
      { t: 'table', cls: 'compact', head: ['', '计数', 'MLE'], rows: [
        ['$P(A=T)$', '$A=T$ 有 3 行 / 共 6 行', '$3/6=0.5$'],
        ['$P(B=T\\mid A=T)$', '$A=T$ 的 3 行里 $B=T$ 有 2 行', '$2/3$'],
        ['$P(B=T\\mid A=F)$', '$A=F$ 的 3 行里 $B=T$ 有 1 行', '$1/3$'],
      ] },
      { t: 'graphs', r: 16, caption: '下面练习用到的三张图（不用翻回去）。题 1 ' + ALARM_KEY, items: [
        Object.assign({}, ALARM, { notes: {}, edges: ALARM_EDGES, caption: '题 1：alarm 网络' }),
        { nodes: { X: [40, 40], Y: [150, 40], Z: [260, 40], V: [95, 150] }, edges: 'X>V Y>V', caption: '题 2：$X,Y,Z$ 互相独立，$V$ 依赖 $X,Y$（2025 Q1e）' },
        { nodes: { A: [60, 30], B: [200, 30], C: [30, 130], D: [170, 130], E: [170, 230], F: [60, 300] }, edges: 'A>C A>D B>D D>E C>F E>F', caption: '题 3：2021 Q14a 的图' },
      ] },
      { t: 'fade', title: '分步练习：数 CPT 大小', plan: ['写出因子分解，列出每个节点的父节点', '每个节点：表中数 $2^{|pa_i|+1}$（自由参数 $2^{|pa_i|}$）', '求和；对比完整联合表 $2^n$'], items: [
        { md: T`Alarm 网络（5 个二元变量）。`, steps: [
          { md: T`$E,B$ 无父；$R$：$E$；$A$：$E,B$；$L$：$R,A$` }, { md: T`表中数 $2,2,4,8,8$（自由 $1,1,2,4,4$）` }, { md: T`24 个数（12 个自由参数）；完整联合表 32 行（31 个自由）` },
        ] },
        { md: T`4 个二元变量，$X,Y,Z$ 互相独立，$V$ 依赖 $X,Y$（2025 Q1e）。`, steps: [
          { ask: '$V$ 的 CPT 有几个数？', answer: 8, show: T`$2^{2+1}=8$（2 行 × 4 列）`, sg: 2 },
          { ask: '所有 CPT 一共几个数？', answer: 14, show: T`$2+2+2+8$`, sg: 3 },
          { ask: '完整联合表有几行？', answer: 16, show: T`$2^4$`, sg: 3 },
        ] },
        { md: T`2021 Q14a 的图（6 个二元变量：$A,B$ 无父；$C$：$A$；$D$：$A,B$；$E$：$D$；$F$：$C,E$）。`, steps: [
          { ask: '自由参数一共几个？', answer: 14, show: T`$1+1+2+4+2+4=14$（完整联合表要 $2^6-1=63$）`, sg: 3 },
        ] },
      ] },
    ],
    viz: [
      { id: 'cpt-counter', opts: { preset: 'EX2025Q1e' }, how: '每行写一个节点和它的父节点（格式 `V: X, Y`）。工具画出每张 CPT 的形状，并数表中的数和自由参数，和完整联合表对比。',
        try: '① 切换到 EX2026Q6（山火题：A 有 5 个父节点）：$A$ 的 CPT 有 $2\\times32$ 格。② 自己输入 alarm 网络：`E` / `B` / `R: E` / `A: E, B` / `L: R, A`，核对 24 和 12。' },
      { id: 'mle-counter', opts: { preset: 'EX2025Q4c' }, how: '输入图的结构和完整数据，工具按"计数 ÷ 父节点配置计数"填出每张 CPT 的 MLE（分数形式）。',
        try: '把例 3 的数据输进去（规格 `A` / `B: A`，数据表头 `A,B`），核对 $1/2$、$2/3$、$1/3$。' },
    ],
    compare: [
      { t: 'table', head: ['', '完整联合表', 'Bayesian network'], rows: [
        ['存什么', '每种取值组合一个概率', '每个节点一张 CPT'],
        ['大小（$n$ 个二元变量）', '$2^n$', '$\\sum_i2^{|pa_i|+1}$（父节点少时远小于 $2^n$）'],
        ['独立性', '看不出来', '从图读出（D-separation）'],
        ['MLE', '数每种组合的频率', '每张 CPT 单独数频率'],
      ] },
      { t: 'exam', md: T`**(2025 Q4b) What does maximum likelihood say to do with $n$ complete observations?** Choose the CPT entries that maximise the likelihood of the data. Because the joint factorises as $P(A)P(B)P(C\mid A,B)$, the likelihood $\prod_{i}P(a^{(i)})P(b^{(i)})P(c^{(i)}\mid a^{(i)},b^{(i)})$ splits into one term per table, so each CPT is fitted separately by relative frequencies: $\hat P(A=a)=\#(A=a)/n$, and $\hat P(C=c\mid A=a,B=b)=\#(A=a,B=b,C=c)/\#(A=a,B=b)$.` },
      T`（山火题的图：远处传感器 $S_1,S_2,S_3$ 和近处传感器 $C_1,C_2$ 都没有父节点，五个箭头都指向警报 $A$。$A=1$ 当且仅当远处至少一个响、近处两个都不响：$(S_1\lor S_2\lor S_3)\land\lnot(C_1\lor C_2)$。$A$ 的父节点有 $2^5=32$ 种取值组合。完整题目和图见 [T7](#/T07)。）`,
      { t: 'exam', md: T`**(2026 Q6c) If the sensors are always accurate, what can be said about the CPTs?** Accuracy fixes the alert rule, not how often each sensor fires: the five sensor marginals $P(S_1),\dots,P(C_2)$ remain unknown (one free parameter each). Only the CPT of the alert becomes deterministic: for each of its 32 parent configurations, $P(A=1\mid S_1,S_2,S_3,C_1,C_2)=1$ if $(S_1\lor S_2\lor S_3)\land\lnot(C_1\lor C_2)$ and $0$ otherwise, with $P(A=0\mid\cdot)=1-P(A=1\mid\cdot)$, so that table has no free parameters (as for the alarm CPT in L20 p14).` },
    ],
    pitfalls: [
      ['BN 里可以有环', '必须是 DAG（无环）。'],
      ['"传感器永远准确" ⇒ 所有 CPT 都是 0/1', '只有警报 $A$ 的 CPT 变成确定性的；传感器自己的先验 $P(S_i)$ 仍是未知参数（2026 Q6c）。'],
      ['CPT 的每一行和为 1', '课件格式是**每一列**（每个父节点配置）和为 1。'],
      ['$P(V\\mid X,Y)$ 只要 4 个数', '二元时 $2\\times4=8$ 个数（自由参数才是 4）。'],
      ['因子分解里写 $P(x_i\\mid$ 所有前面的变量$)$', '只条件在**父节点**上。'],
      ['MLE 时把所有行放一起算 $P(C)$', '$P(C\\mid A,B)$ 要按父节点配置分组，每组单独数。'],
    ],
    quiz: [
      { type: 'num', q: '6 个二元变量的完整联合表有几行？', answer: 64, explain: T`完整联合表给每一种取值组合一行。每个二元变量有 2 种取值，6 个变量的组合数是 $2\times2\times2\times2\times2\times2=2^6=64$，所以有 64 行（所有行加起来必须是 1，自由参数 $64-1=63$ 个）。变量每多一个，整张表就翻一倍——这正是 Bayesian network（贝叶斯网络）要把它拆成很多张小 CPT 的原因。` },
      { type: 'num', q: '二元节点有 4 个二元父节点，它的 CPT 有几个自由参数？', answer: 16, explain: T`按课件格式，CPT（条件概率表）的每一列是父节点的一种取值组合，每一行是子节点的一个取值。4 个二元父节点有 $2^4=16$ 种组合，所以 16 列；子节点二元，所以 2 行，表中共 $2\times16=32$ 个数。每一列的两个数加起来必须是 1，知道一个就能算出另一个，所以每列只有 1 个自由参数：$16\times1=16$。陷阱：答 32 是数了表中所有的数（entries），不是自由参数。` },
      { type: 'num', q: '硬币例子：$P(x_1=0,x_2=1,x_3=1)=?$', answer: 0.025, explain: T`按 BN 的因子分解 $P(x_1,x_2,x_3)=P(x_1)\,P(x_2)\,P(x_3\mid x_1,x_2)$，把三张表里对应的格子乘起来。两枚公平硬币：$P(x_1=0)=0.5$，$P(x_2=1)=0.5$。$x_1x_2=01$ 两枚不同，而 $x_3=1$ 是报告"相同"，即报告说错了，CPT 里那一格是 $0.1$。所以 $0.5\times0.5\times0.1=0.025$。陷阱：把 $x_3=1$ 当成"报告正确"而取 0.9。` },
      { type: 'mc', q: '$P(A)P(B\\mid A)P(C\\mid A,B)$ 对应的图：', options: ['$A\\to B\\to C$', '$A\\to B$，$A\\to C$，$B\\to C$', '$C\\to A$，$C\\to B$', '$A\\to C\\leftarrow B$'], answer: 1, explain: '每个因子竖线右边的变量都指向左边的变量。' },
    ],
  });

  /* =====================================================================
   * c54 · D-separation（L20 p12–p25）
   * ===================================================================== */
  add({
    id: 'c54', week: 'W10', lec: 'L20', pages: 'L20 p12–p25', star: 3,
    keyEn: [
      T`$A\perp B\mid C$ means $P(A,B\mid C)=P(A\mid C)P(B\mid C)$: once $C$ is known, $B$ gives no further information about $A$; it neither implies nor is implied by $A\perp B$.`,
      T`To test $X\perp Y\mid S$: take the ancestral graph of $X\cup Y\cup S$, moralise (marry parents of a common child), drop directions, delete $S$; if $X,Y$ are disconnected, the independence holds.`,
      T`Chain and fork: the ends are independent given the middle node. Collider: two independent parents can become dependent once their common child (or a descendant) is observed (explaining away).`,
      T`If a path still connects $X$ and $Y$, the graph does not imply the independence: write "does not hold" and name the path.`,
    ],
    keyZh: [
      T`条件独立（conditional independence）：已经知道 $C$ 之后，再知道 $B$ 对猜 $A$ 毫无帮助。它和不加条件的独立 $A\perp B$ 互不蕴含，谁也推不出谁。`,
      T`判断方法（D-separation）：取 $X,Y,S$ 及其所有祖先组成的祖先图（ancestral graph）→ moralize（共同孩子的父母连边）→ 去掉方向 → 删掉 $S$。$X$、$Y$ 不再连通，独立性就成立。`,
      T`链和分叉：知道中间节点，两端就被隔开、变独立。汇合（collider）正相反：两个本来独立的父节点，观测到共同孩子（或它的后代）后会变相关，叫解释排除（explaining away）。`,
      T`删完 $S$ 后如果还有路连着 $X$ 和 $Y$，图就不保证独立：写 "does not hold"，并写出那条路径（如 alarm 例子里的 $L$—$R$—$E$—$B$）。`,
    ],
    examQ: [
      { src: '2025 practice Q1(c)', q: T`In words, what does $\Pr(A,B\mid C)=\Pr(A\mid C)\Pr(B\mid C)$ say about the dependence of $A,B,C$?`,
        a: T`$A$ and $B$ are conditionally independent given $C$: once $C$ is known, learning $B$ gives no further information about $A$ (and vice versa). It does not imply that $A$ and $B$ are marginally independent.`,
        qzh: T`用文字说明：$\Pr(A,B\mid C)=\Pr(A\mid C)\Pr(B\mid C)$ 关于 $A,B,C$ 之间的依赖关系（dependence）说明了什么？`,
        azh: T`给定 $C$ 时，$A$ 和 $B$ 条件独立（conditionally independent）：一旦已知 $C$，再得知 $B$ 不会提供关于 $A$ 的任何进一步信息（反之亦然）。这并不意味着 $A$ 和 $B$ 边缘独立（marginally independent）。` },
    ],
    title: 'D-separation', en: 'Reading conditional independence from a Bayesian network: D-separation',
    summary: '给一张 BN，问"$X\\perp Y\\mid S$ 成立吗"——不用 CPT 的数字，只看图。课件的方法（**往年 8 分必考，T5**）：**① 取祖先图 → ② moralize（给共同孩子的父母连边）→ ③ 去掉方向 → ④ 删掉 $S$ 里的节点 → ⑤ 看 $X$、$Y$ 还连不连通**：不连通就独立，连通就不能保证独立。最反直觉的一点：两个独立的原因，在**观测到它们的共同结果之后**会变得相关。',
    prereq: ['c53', 'c02'],
    symbols: [
      [T`$X\perp Y\mid S$`, T`给定集合 $S$ 时，$X$ 和 $Y$ 条件独立`],
      [T`$S$`, T`条件集：已经观测到（已知）的变量`],
      [T`ancestral graph`, T`祖先图：只保留 $X,Y,S$ 以及它们的所有祖先`],
      [T`moralize`, T`"结婚"：凡是有共同孩子的两个父节点之间连一条无向边`],
      [T`A—B`, T`无向边（moralize 之后的图里用）`],
      [T`$E,B,R,A,L$`, T`课件 alarm 网络（c53）：E 地震、B 盗窃、R 电台报道地震、A 警报响、L 下班离开；边 $E\to R$，$E\to A$，$B\to A$，$R\to L$，$A\to L$`],
    ],
    goals: [
      '读懂 $A\\perp B$ 和 $A\\perp B\\mid C$ 的定义（L20 p12–p13；2025 Q1c）',
      '用"祖先图 → moralize → 去方向 → 删条件集 → 看连通"判断条件独立（L20 p17；2026 Q4）',
      '复述课件两个例子：$L\\perp B\\mid A$ 不成立、$R\\perp A\\mid E$ 成立（L20 p18–p25）',
      '解释"给定共同孩子，父节点变相关"（硬币例子）',
    ],
    types: ['T05'],
    notExam: '教科书的 active trail / Bayes ball 说法课件没教；结论相同，但考试按课件的四步写。',
    what: [
      { t: 'h3', text: '① 先弄清问题：独立和条件独立（L20 p12–p13）' },
      T`c53 留下了两个没回答的问题：两枚硬币本来独立，**知道报告以后**还独立吗？听到警报以后，下不下班和有没有盗窃还有关系吗？要回答"独立吗"，先把这句话写成概率的等式：`,
      T`**独立** $A\perp B$：$P(A,B)=P(A)P(B)$——知道 $B$ 对猜 $A$ 毫无帮助。**条件独立** $A\perp B\mid C$：$P(A,B\mid C)=P(A\mid C)P(B\mid C)$——**在已经知道 $C$ 的前提下**，再知道 $B$ 对猜 $A$ 毫无帮助。两者互不蕴含：本来独立的可以在知道 $C$ 后变得相关，本来相关的也可以在知道 $C$ 后变得独立。`,
      T`这一章要回答的问题：**给一张 BN 和一句"$X\perp Y\mid S$"，它成立吗？**课件强调：不用看 CPT 里的任何数字，**只看图**就能判断。`,
      { t: 'h3', text: '② 硬币例子：本来独立，知道报告后不独立（L20 p11–p13）' },
      fig(COIN, { edges: 'x1>x3 x2>x3', w: 260, notes: { x1: '硬币 1', x2: '硬币 2', x3: '报告' }, caption: '$X_1\\perp X_2$ 成立：两枚硬币各抛各的。$X_1\\perp X_2\\mid X_3$ 不成立：报告说"相同"、又知道 $x_1=1$，就几乎能断定 $x_2=1$。' }),
      { t: 'h3', text: '③ Alarm 的问题：听到警报后，下不下班还和盗窃有关吗？（L20 p15–p16）' },
      fig(ALARM, { edges: ALARM_EDGES, cls: { A: 'given', L: 'x', B: 'y' }, w: 300, caption: '灰色 = 已知（这里已知警报响了）。问：$L\\perp B\\mid A$ 成立吗？要用数字验证，得对 $L,B,A$ 的每一种取值检查 $P(L,B\\mid A)=P(L\\mid A)P(B\\mid A)$——太麻烦。' }),
      { t: 'h3', text: '④ 先看路上的三种形状' },
      T`③ 说用数字逐格验证太麻烦，所以改看图。图上任何一条路，拆开来只有三种"三个点"的形状。先记住每种形状里"**知道中间那个点之后，两边还独不独立**"，下面的判断方法就是把这三条一次查完（课件没单独列出这三种，但它解释了为什么要"结婚"和"删条件节点"）：`,
      { t: 'graphs', r: 16, items: [
        { nodes: { A: [30, 40], B: [130, 40], C: [230, 40] }, edges: 'A>B B>C', cls: { B: 'given' }, caption: '**链** $A\\to B\\to C$（下雨→地湿→滑倒）：知道 $B$（灰）就把 $A$、$C$ 隔开' },
        { nodes: { B: [130, 30], A: [40, 130], C: [220, 130] }, edges: 'B>A B>C', cls: { B: 'given' }, caption: '**分叉** $A\\leftarrow B\\to C$（地震→电台、地震→警报）：知道共同原因 $B$ 就隔开' },
        { nodes: { A: [40, 30], C: [220, 30], B: [130, 130] }, edges: 'A>B C>B', cls: { B: 'given' }, caption: '**汇合** $A\\to B\\leftarrow C$（地震→警报←盗窃）：反过来！**不**知道 $B$ 时独立，知道 $B$（或它的后代）后变相关' },
      ] },
      { t: 'table', cls: 'compact', head: ['结构', '不给 $B$ 时 $A,C$', '给定 $B$ 时 $A,C$', '下面的判断法里怎么体现'], rows: [
        ['链 $A\\to B\\to C$', '可能相关', '**独立**', '删掉 $B$ 后路径断开'],
        ['分叉 $A\\leftarrow B\\to C$', '可能相关', '**独立**', '删掉 $B$ 后路径断开'],
        ['汇合 $A\\to B\\leftarrow C$', '**独立**', '可能相关（"解释排除"）', '$B$ 在祖先图里 ⇒ $A$—$C$ 结婚，删 $B$ 也断不开；$B$ 既不在 $X,Y,S$ 里、也不是它们的祖先 ⇒ 不在祖先图里，不结婚'],
      ] },
      T`**汇合（v-structure）为什么反过来？** 警报响了（$B$ 已知）。如果又听说发生了地震，那么"是盗窃引起的"这个可能性就**下降**了——地震已经解释了警报。两个原因本来无关，观测到共同结果后就"竞争解释"，变得相关。这叫 **explaining away（解释排除）**。（相关也可以是正向的：硬币例子里报告说"相同"时，知道 $x_1=1$ 会**提高** $x_2=1$ 的概率，见下面的思考题。）"可能相关"的意思是：图**不保证**独立；具体数值下仍可能碰巧独立。`,
      { t: 'h3', text: '⑤ D-separation：把三种形状一次查完（L20 p17）' },
      T`**D-separation**："$X$ 和 $Y$ 在给定 $S$ 时被 D-separated" ⇒ $X\perp Y\mid S$。判断就在一张改造过的无向图（**moralized ancestral graph，道德化的祖先图**）上看它们还连不连通：`,
      { t: 'steps', items: [
        T`**祖先图**：只保留 $X$、$Y$、$S$ 里的节点，以及它们的**所有祖先**（父、父的父……）。其余节点和边全删掉。`,
        T`**Moralize（"父母结婚"）**：在祖先图里，对每个节点，把它的父节点两两连上无向边。`,
        T`**去方向**：所有有向边变成无向边。`,
        T`**删掉 $S$**：去掉条件集里的节点和连着它们的边。`,
        T`**看连通**：$X$ 和 $Y$ 之间没有路径了 ⇒ $X\perp Y\mid S$ 成立；还有路径 ⇒ 不成立（图不能保证独立），写出那条路径。`,
      ] },
      { t: 'video', id: 'dsep' },
      { t: 'h3', text: '⑥ 课件例 1：$L\\perp B\\mid A$？（L20 p18–p21）' },
      { t: 'graphs', r: 16, caption: ALARM_KEY + '蓝圈 = $X$，绿圈 = $Y$，灰底 = 给定的条件节点。', items: [
        Object.assign({}, ALARM, { notes: {}, edges: ALARM_EDGES, cls: { A: 'given', L: 'x', B: 'y' }, caption: '① 祖先图：$L$ 的祖先是 $R,A,E,B$，5 个点全保留' }),
        Object.assign({}, ALARM, { notes: {}, edges: ALARM_EDGES + ' E-B:moral R-A:moral', cls: { A: 'given', L: 'x', B: 'y' }, caption: '② moralize：$A$ 的父母 $E$—$B$、$L$ 的父母 $R$—$A$ 结婚（虚线）' }),
        Object.assign({}, ALARM, { notes: {}, edges: 'E-R R-L E-B:moral E-A:gone B-A:gone R-A:gone A-L:gone', cls: { A: 'removed', L: 'x', B: 'y' }, caption: '③ 去方向，删掉 $A$（浅色的边随 $A$ 一起删掉）' }),
        Object.assign({}, ALARM, { notes: {}, edges: 'E-R:path R-L:path E-B:path E-A:gone B-A:gone R-A:gone A-L:gone', cls: { A: 'removed', L: 'x', B: 'y' }, caption: '④ $L$—$R$—$E$—$B$ 仍然连通 ⇒ **不成立**' }),
      ] },
      T`直觉：知道警报响了以后，"是不是地震"和"是不是盗窃"互相牵制（地震能解释警报，盗窃的可能就小）；而我下不下班取决于电台有没有报地震。所以盗窃 ↔ 地震 ↔ 电台 ↔ 下班，这条链没被 $A$ 挡住。`,
      { t: 'h3', text: '⑦ 课件例 2：$R\\perp A\\mid E$？（L20 p22–p25）' },
      { t: 'graphs', r: 16, caption: ALARM_KEY, items: [
        Object.assign({}, ALARM, { notes: {}, edges: 'E>R E>A B>A R>L:gone A>L:gone', cls: { E: 'given', R: 'x', A: 'y', L: 'out' }, caption: '① 祖先图 $\\{E,B,R,A\\}$：$L$ 不是 $R,A,E$ 的祖先，删掉' }),
        Object.assign({}, ALARM, { notes: {}, edges: 'E>R E>A B>A E-B:moral', cls: { E: 'given', R: 'x', A: 'y', L: 'out' }, caption: '② moralize：只有 $A$ 的父母 $E$—$B$ 结婚（$L$ 已删，$R$、$A$ 不结婚）' }),
        Object.assign({}, ALARM, { notes: {}, edges: 'E-R:gone E-A:gone E-B:gone B-A', cls: { E: 'removed', R: 'x', A: 'y', L: 'out' }, caption: '③ 去方向，删掉 $E$' }),
        Object.assign({}, ALARM, { notes: {}, edges: 'E-R:gone E-A:gone E-B:gone B-A', cls: { E: 'removed', R: 'x', A: 'y', L: 'out' }, caption: '④ $R$ 成了孤立点，到不了 $A$ ⇒ **成立**' }),
      ] },
      T`直觉：电台报道和警报的共同原因是地震。地震已知以后，电台报不报只取决于地震，和警报再无联系。`,
    ],
    why: [
      T`**T5 往年必考**：2026 practice Q4（8 分）"Does $S\perp Z\mid V,W$ hold?"；2025 practice Q1(c)（解释条件独立的式子）；2021 Q18(a)（HMM 里哪些变量和 $a_1$ 独立）。方法固定，按步骤写满就是满分。完整真题见 [T5](#/T05)。`,
    ],
    intuition: [
      T`**先把硬币例子的数字摆出来**（c53）：两枚公平硬币 $P(x_1=1)=P(x_2=1)=0.5$；报告 $x_3=1$ 表示"两枚相同"，说对的概率 0.9。所以四种组合 $x_1x_2=00,01,10,11$ 下，$P(x_3=1\mid x_1,x_2)$ 分别是 $0.9,\ 0.1,\ 0.1,\ 0.9$；每种组合本身的概率是 $0.5\times0.5=\frac14$。`,
      { t: 'think', q: '硬币例子：$P(x_1=1\\mid x_3=1)$ 和 $P(x_1=1\\mid x_2=1,x_3=1)$ 分别是多少？说明了什么？', a: T`$P(x_3=1)=\frac14(0.9+0.1+0.1+0.9)=0.5$，$P(x_1=1,x_3=1)=\frac14(0.1+0.9)=0.25$，所以 $P(x_1=1\mid x_3=1)=0.5$。而 $P(x_1=1\mid x_2=1,x_3=1)=0.9$（报告说相同、$x_2=1$，那 $x_1=1$ 的概率就是报告准确率）。知道 $x_2$ 改变了对 $x_1$ 的判断 ⇒ 给定 $x_3$ 时不独立。` },
      { t: 'story', title: '"D" 是什么', md: 'D-separation 的 "D" 是 directed（有向）。这个概念由 Judea Pearl 和学生在 1980 年代末提出；"先取祖先图、再 moralize、再看普通分离"的等价判法来自 Lauritzen 等人 1990 年的工作——课件教的正是这个版本。' },
    ],
    math: [
      { t: 'h3', text: '为什么顺序是"祖先图 → 结婚 → 删条件集"' },
      { t: 'ul', items: [
        T`**先取祖先图**：没被观测、也不是观测节点祖先的"共同孩子"不该让父母相关（汇合结构不观测时独立）。取祖先图把这样的孩子删掉，它就没机会让父母结婚。`,
        T`**再结婚**：被观测的共同孩子（或它的后代被观测，于是它在祖先图里）会让父母相关——结婚边表示这件事。`,
        T`**最后删 $S$**：已知的中间节点挡住链和分叉上的信息。如果先删 $S$ 再结婚，就会漏掉"观测孩子后父母相关"的边。`,
      ] },
      { t: 'h3', text: '用数字验证硬币例子（可选）' },
      T`（数字来自 c53 的硬币表：每种 $x_1x_2$ 组合概率 $\frac14=0.5\times0.5$；两枚相同时 $P(x_3=1)=0.9$，不同时 $0.1$。）$P(x_3=1)=\tfrac14(0.9+0.1+0.1+0.9)=0.5$；$P(x_1=1,x_3=1)=\tfrac14(0.1+0.9)=0.25$（$x_1=1$ 的两种组合 10、11），所以 $P(x_1=1\mid x_3=1)=0.25/0.5=0.5$。再加上 $x_2=1$：只剩组合 11，报告"相同"说对的概率 0.9，于是 $P(x_1=1\mid x_2=1,x_3=1)=\frac{0.25\times0.9}{0.25\times0.9+0.25\times0.1}=0.9$。`,
      T`小结：$P(x_1=1\mid x_3=1)=0.5$，但 $P(x_1=1\mid x_2=1,x_3=1)=0.9$——知道 $x_2$ 改变了对 $x_1$ 的判断，所以给定 $x_3$ 时不独立，和四步法的结论一致（硬币图里 $x_1$—$x_2$ 结婚，删掉 $x_3$ 后仍相连）。`,
    ],
    fx: [],
    example: [
      { t: 'graphs', r: 16, caption: '下面练习用到的图：灰色 = 已知（条件集）。', items: [
        Object.assign({}, COIN, { edges: 'x1>x3 x2>x3', cls: { x3: 'given' }, caption: '题 1–2：硬币图（题 2 不观测 $x_3$）' }),
        { nodes: { A: [40, 40], B: [200, 40], C: [120, 140], D: [120, 240] }, edges: 'A>C B>C C>D', cls: { D: 'given' }, caption: '题 3：$A\\to C\\leftarrow B$，$C\\to D$；只观测 $D$' },
        { nodes: { A: [30, 40], B: [140, 40], C: [250, 40] }, edges: 'A>B B>C', cls: { B: 'given' }, caption: '题 4：链 $A\\to B\\to C$，观测 $B$' },
      ] },
      { t: 'fade', title: '分步练习：D-separation 五步', plan: ['祖先图：$X,Y,S$ 及所有祖先', 'Moralize：共同孩子的父母连边', '去方向，删掉 $S$', '$X$、$Y$ 还连通？连通 ⇒ 不成立'], items: [
        { md: T`硬币图 $x_1\to x_3\leftarrow x_2$，问 $X_1\perp X_2\mid X_3$。`, steps: [
          { md: T`$\{x_1,x_2,x_3\}$（全部）` }, { md: T`$x_1$—$x_2$` }, { md: T`剩 $x_1$—$x_2$` }, { md: '连通 ⇒ 不成立' },
        ] },
        { md: T`同一张图，问 $X_1\perp X_2$（$S$ 为空）。（1 = 成立，0 = 不成立）`, steps: [
          { ask: '祖先图里有几个节点？', answer: 2, show: T`只有 $x_1,x_2$；$x_3$ 不是它们的祖先，删掉`, sg: 1 },
          { ask: '需要结婚的边有几条？', answer: 0, show: '祖先图里没有共同孩子', sg: 2 },
          { ask: '独立性成立吗？（1 = 成立，0 = 不成立）', answer: 1, show: T`$x_1,x_2$ 之间没有边 ⇒ 成立`, sg: 4 },
        ] },
        { md: T`图 $A\to C\leftarrow B$，$C\to D$。问 $A\perp B\mid D$（只观测了共同孩子的**后代**）。`, steps: [
          { ask: '祖先图有几个节点？', answer: 4, show: T`$D$ 的祖先 $C,A,B$，全保留`, sg: 1 },
          { ask: '独立性成立吗？（1 = 成立，0 = 不成立）', answer: 0, show: T`$C$ 的父母 $A,B$ 结婚；删掉 $D$ 后 $A$—$B$ 还在 ⇒ 不成立。观测共同孩子的后代也会打开"解释排除"`, sg: 4 },
        ] },
        { md: T`链 $A\to B\to C$，问 $A\perp C\mid B$。`, steps: [
          { ask: '独立性成立吗？（1 = 成立，0 = 不成立）', answer: 1, show: T`祖先图 $\{A,B,C\}$，无共同孩子；删掉 $B$ 后 $A$、$C$ 不连通 ⇒ 成立`, sg: 4 },
        ] },
      ] },
    ],
    viz: [
      { id: 'dsep-stepper', opts: { preset: 'alarm-LBA' }, how: '一步一步执行五步法：每一步高亮被删的节点、新加的结婚边，最后显示 $X$、$Y$ 之间是否还有路径。可以换课件的 alarm 两个问题、硬币例子和 2026 真题，也可以自己选 $X$、$Y$、$S$。',
        try: '① 先跑 alarm $L\\perp B\\mid A$：看哪条路径没被挡住。② 换 alarm $R\\perp A\\mid E$：注意第一步就把 $L$ 删掉了。③ 硬币：把条件集清空，再加上 $X_3$，对比结论。' },
    ],
    compare: [
      { t: 'table', head: ['条件集里有……', '链 / 分叉的中间节点', '汇合节点（或它的后代）'], rows: [
        ['效果', '挡住路径（变独立）', '打开路径（变相关）'],
        ['判断法里体现为', '删掉 $S$ 后路径断开', '祖先图保留了它 ⇒ 父母结婚的边还在'],
      ] },
      { t: 'exam', md: T`**(2025 Q1c) What does $\Pr(A,B\mid C)=\Pr(A\mid C)\Pr(B\mid C)$ say?** $A$ and $B$ are conditionally independent given $C$: once $C$ is known, learning $B$ gives no further information about $A$ (and vice versa). It does not imply that $A$ and $B$ are marginally independent, nor that either is independent of $C$.` },
      { t: 'exam', md: T`**Template answer for "Does $X\perp Y\mid S$ hold?"** Take the ancestral graph of $X\cup Y\cup S$; moralise it by connecting every pair of parents of a common child; drop edge directions; delete the nodes in $S$. If no path connects $X$ and $Y$, they are D-separated and $X\perp Y\mid S$ holds; otherwise the statement is not implied by the graph (give the remaining path, e.g. $L$–$R$–$E$–$B$ for $L\perp B\mid A$ in the alarm network).` },
    ],
    pitfalls: [
      ['先删 $S$ 再 moralize', '顺序：祖先图 → moralize → 去方向 → 删 $S$。先删会漏掉"观测孩子后父母相关"的边。'],
      ['在整张图上 moralize', '只在祖先图里结婚；不在祖先图里的孩子不会让父母相关。'],
      ['观测了共同原因，两个结果仍相关', '分叉：给定共同原因后独立（$R\\perp A\\mid E$）。'],
      ['两个独立的原因，观测结果后仍独立', '汇合：观测结果（或其后代）后变相关（硬币、$L\\perp B\\mid A$）。'],
      ['连通 ⇒ 一定相关', '严格说是"图不保证独立"；考试写"does not hold"并给出路径即可。'],
    ],
    quiz: [
      { type: 'mc', q: 'Alarm 网络中 $E\\perp B$（什么都不观测）成立吗？', options: ['成立', '不成立'], answer: 0, explain: T`按 D-separation（D 分离）的步骤：① ancestral graph（祖先图）：$X=E$、$Y=B$、条件集为空，$E$ 和 $B$ 都没有父节点，所以祖先图只有 $E,B$ 两个点；② moralize：它们的共同孩子 $A$ 不在祖先图里，不结婚；③④ 去方向，没有要删的点。$E$ 和 $B$ 之间没有任何边，不连通 ⇒ 成立。直觉：地震和盗窃各发生各的，**只有观测到共同结果 $A$（或它的后代 $L$）后才会变相关**。选"不成立"是把这题和 $E\perp B\mid A$ 弄混了。` },
      { type: 'mc', q: 'Alarm 网络中 $E\\perp B\\mid A$ 成立吗？', options: ['成立', '不成立'], answer: 1, explain: '$A$ 是共同孩子；moralize 后 $E$—$B$ 直接相连。' },
      { type: 'mc', q: 'Alarm 网络中 $R\\perp B$ 成立吗？', options: ['成立', '不成立'], answer: 0, explain: '祖先图 $\\{R,E,B\\}$，$E\\to R$，$B$ 孤立（$A$ 不在祖先图里，$E,B$ 不结婚）。' },
      { type: 'mc', q: '链 $A\\to B\\to C\\to D$，$A\\perp D\\mid C$ 成立吗？', options: ['成立', '不成立'], answer: 0, explain: T`按 D-separation 的步骤：① 祖先图：$D$ 的祖先是 $C,B,A$，四个点全保留；② moralize：链上每个点最多一个父节点，没有共同孩子，不加边；③ 去方向得 $A$—$B$—$C$—$D$；④ 删掉条件节点 $C$，剩下 $A$—$B$ 和孤立的 $D$。$A$ 到 $D$ 没有路 ⇒ 成立。这是链结构：知道中间的 $C$ 就挡住了信息。条件节点不必紧挨着 $A$，只要它在 $A$ 到 $D$ 唯一的那条路上就够了。` },
    ],
  });

  /* =====================================================================
   * c55 · MRF、clique、BN→MRF（L20 p28–p41）
   * ===================================================================== */
  add({
    id: 'c55', week: 'W10', lec: 'L20', pages: 'L20 p28–p41', star: 2,
    keyEn: [
      T`An MRF is an undirected graphical model: $X\perp Y\mid S$ holds if deleting $S$ disconnects $X$ from $Y$ (plain graph separation, no ancestral graph or moralising).`,
      T`Hammersley–Clifford: $P(\mathbf x)=\frac1Z\prod_c\psi_c(\mathbf x_c)$ over the cliques, with positive potentials $\psi_c$ (scores, not probabilities); the partition function（配分函数）$Z=\sum_{\mathbf x}\prod_c\psi_c(\mathbf x_c)$ normalises.`,
      T`BN to MRF: moralise, drop directions, put each CPT into the potential of a clique containing its variables ($Z=1$); some independences, e.g. of two parents of an unobserved child, are lost.`,
    ],
    keyZh: [
      T`马尔可夫随机场（MRF）是无向图模型，读独立性只看普通的图分离：删掉 $S$ 后 $X$、$Y$ 不连通，就有 $X\perp Y\mid S$。不用取祖先图，也不用结婚（moralize）。`,
      T`Hammersley–Clifford：分布写成每个团（clique）上正值势函数（potential）的乘积。势函数是打分不是概率，可以大于 1；最后除以配分函数 $Z$（所有取值组合的打分之和）才归一化。`,
      T`BN 转 MRF：先 moralize 再去方向，每个 CPT 放进一个包含它全部变量的团，此时 $Z=1$。代价是丢失一些独立性，如未观测的共同孩子的两个父节点，结婚后就读不出独立了。`,
    ],
    title: 'MRF、clique、BN→MRF', en: 'Markov random fields: cliques, potentials, partition function, converting BNs',
    summary: '**MRF（Markov random field，马尔可夫随机场）** 是**无向**图模型：边没有方向，独立性就是普通的图分离——删掉 $S$ 后 $X$、$Y$ 不连通 ⇒ $X\\perp Y\\mid S$。分布写成**团（clique）**上的正值 **potential（势函数）** 之积，再除以 **partition function（配分函数）** $Z$ 归一化（Hammersley–Clifford）。BN 可以转成 MRF：**moralize + 去方向**，每个 CPT 放进一个包含它的团里。下一周（W11）的推断算法都在 MRF 上做。',
    prereq: ['c53', 'c54'],
    symbols: [
      [T`$X\text{—}Y$`, T`无向边`],
      [T`clique $c$`, T`团：两两之间都有边的一组节点`],
      [T`$\mathcal C$`, T`图中所有（极大）团的集合`],
      [T`$x_c$`, T`团 $c$ 里那些变量的取值`],
      [T`$\psi_c(x_c)$`, T`团 $c$ 上的 potential：一个**非负**的打分函数（Hammersley–Clifford 定理要求严格为正），越大表示这种组合越"受欢迎"。它**不是**概率`],
      [T`$E,B,R,A,L$`, T`alarm 网络的变量（见 c53）：地震、盗窃、电台报道、警报、下班离开`],
      [T`$\theta_{ij}(x_i,x_j)$`, T`（房间温度例子）边上的实数值打分；$\psi_{ij}=\exp(\theta_{ij})$`],
      [T`$Z$`, T`partition function：对所有取值组合求和的归一化常数`],
    ],
    goals: [
      '找出无向图的团和极大团（L20 p29）',
      '用图分离读 MRF 的条件独立（L20 p32、p36）',
      '写出 MRF 的分布 $\\frac1Z\\prod_c\\psi_c(x_c)$，会算小例子的 $Z$（L20 p35–p38）',
      '把 BN 转成 MRF（moralize + 去方向 + 分配 CPT），知道可能丢失独立性（L20 p39–p40）',
      '说出 BN 和 MRF 各自能表达、另一方表达不了的独立性（L20 p30–p33）',
    ],
    types: ['T06'],
    what: [
      { t: 'h3', text: '① 没有方向的关系：无向图与 MRF（L20 p28）' },
      T`BN 用箭头表示"谁影响谁"。但有些关系没有方向：相邻两个房间的温度互相影响，谁也不是谁的原因。这时用**无向图**——边就是一条线，没有箭头。**MRF（Markov random field，马尔可夫随机场）** 就是基于无向图的概率模型。`,
      { t: 'h3', text: '② MRF 怎么表示独立：图分离（L20 p30–p32）' },
      T`MRF 的规则比 D-separation 简单得多：**删掉 $S$ 以后，$X$ 和 $Y$ 不连通 ⇒ $X\perp Y\mid S$**（每条从 $X$ 到 $Y$ 的路都要经过 $S$）。不用取祖先图，也不用结婚。反过来，还连通只说明图**不保证**独立。`,
      { t: 'graphs', r: 16, items: [
        { nodes: { A: [40, 40], B: [150, 40], C: [95, 130], D: [205, 130], E: [310, 130] }, edges: 'A-B A-C B-C C-D:gone D-E:gone', cls: { D: 'removed', A: 'x', E: 'y' }, caption: '删掉 $D$：$E$ 被隔开 ⇒ $A\\perp E\\mid D$' },
        { nodes: { A: [40, 40], B: [150, 40], C: [95, 130], D: [205, 130], E: [310, 130] }, edges: 'A-B:gone A-C:path B-C:gone C-D:path D-E', cls: { B: 'removed', A: 'x', D: 'y' }, caption: '删掉 $B$：$A$—$C$—$D$ 仍连通 ⇒ $A\\perp D\\mid B$ 不成立' },
      ] },
      { t: 'slide', src: 'L20/p36', caption: '课件的图：删掉灰色的条件节点 $S$ 后，$X$ 和 $Y$ 不再连通 ⇒ $X\\perp Y\\mid S$。这一步只判断独不独立，概率怎么写是下一节。' },
      { t: 'h3', text: '③ 概率怎么写：打分表与 partition function（L20 p34–p36）' },
      T`图分离只回答"独不独立"，还写不出概率。BN 可以写 $P(\text{子}\mid\text{父})$；无向图没有箭头，没有谁是"父"，只能给相邻变量的每种取值搭配**打一个分**（potential，势函数）。先看最小的情形：`,
      T`**最小的例子。** 两个 0/1 变量、一条边，$P(x_1,x_2)=\frac1Z\psi(x_1,x_2)$。potential 就是一张"每种组合打几分"的表：`,
      { t: 'graph', nodes: { x1: [40, 40], x2: [220, 40] }, labels: { x1: 'x₁', x2: 'x₂' }, edges: 'x1-x2=ψ(x₁,x₂)', w: 280, caption: '一条边 = 一个团 = 一张 potential 表' },
      { t: 'table', cls: 'compact', head: ['$x_1$', '$x_2$', '$\\psi(x_1,x_2)$（打分）', '$P=\\psi/Z$'], rows: [
        ['0', '0', '3', '$3/10=0.3$'],
        ['0', '1', '1', '$1/10=0.1$'],
        ['1', '0', '1', '$1/10=0.1$'],
        ['1', '1', '5', '$5/10=0.5$'],
        ['合计', '', '$Z=3+1+1+5=10$', '$1$'],
      ] },
      T`打分可以是任意正数（5 也行），单独看不是概率；全部加起来得到 $Z$，每个打分除以 $Z$ 才是概率。图有多个团时，同一组取值在每个团的表里各查一个分数，**乘起来**再除以 $Z$。`,
      T`课件的大例子是一层楼的房间温度（L20 p34–p36）：`,
      T`楼层平面图，每个房间一个节点 $x_i\in\{-1,1\}$（冷 / 热），相邻房间连边。边上的 $\theta_{ij}(x_i,x_j)$ 给"这两个房间这种冷热搭配"打分（如 $\theta_{ij}(1,1)=2.9$ 表示两间都热比较常见，$\theta_{ij}(-1,1)=-5.7$ 表示一冷一热很少见；这些数只是举例，不用记）。`,
      { t: 'math', tex: T`P(x_1,\dots,x_n)=\frac{1}{Z}\exp\Big(\sum_{(i,j)\in E}\theta_{ij}(x_i,x_j)\Big),\qquad Z=\sum_{x_1,\dots,x_n}\exp\Big(\sum_{(i,j)\in E}\theta_{ij}(x_i,x_j)\Big)` },
      T`打分不是概率，所以最后要除以 **partition function（配分函数）** $Z$：把所有取值组合的分数加起来，保证总概率为 1。`,
      { t: 'h3', text: '④ 一般形式：按团打分（Hammersley–Clifford，L20 p28–p29、p37–p38）' },
      T`上面每个分数都写在**一条边**上。可如果图里有三角形，三个变量两两相连，打分就应该写在三个点的**组合**上。"可以一起打分的一组点"叫团：`,
      T`**Clique（团）**：一组节点，其中**每两个**之间都有边。**Maximal clique（极大团）**：不能再加入任何节点、仍保持是团（不被别的团包含）。`,
      { t: 'graphs', r: 16, items: [
        { nodes: { A: [40, 40], B: [150, 40], C: [95, 130], D: [205, 130], E: [310, 130] }, edges: 'A-B A-C B-C C-D D-E', cls: { A: 'hl', B: 'hl' }, caption: '$\\{A,B\\}$ 是团，但能再加 $C$ ⇒ **不是**极大团' },
        { nodes: { A: [40, 40], B: [150, 40], C: [95, 130], D: [205, 130], E: [310, 130] }, edges: 'A-B:hl A-C:hl B-C:hl C-D D-E', cls: { A: 'hl', B: 'hl', C: 'hl' }, caption: '$\\{A,B,C\\}$：三条边都在，加 $D$ 不行（缺 $A$—$D$）⇒ 极大团' },
        { nodes: { A: [40, 40], B: [150, 40], C: [95, 130], D: [205, 130], E: [310, 130] }, edges: 'A-B A-C B-C C-D:hl D-E', cls: { C: 'hl2', D: 'hl2' }, caption: '$\\{C,D\\}$ 也是极大团（$\\{D,E\\}$ 同理）' },
      ] },
      T`**Hammersley–Clifford 定理**（L20 p37）：任何和无向图一致的（正）分布，都必须按图的（极大）团分解——每个团一张打分表，全部相乘再除以 $Z$：`,
      { t: 'math', tex: T`P(x_1,\dots,x_n)=\frac1Z\prod_{c\in\mathcal C}\psi_c(x_c),\qquad\psi_c(x_c)>0` },
      T`房间例子的图没有三角形，所以每个**极大团**都是一条边，$\psi_{ij}=\exp(\theta_{ij})$，两种写法是同一个分布（L20 p38）。`,
      { t: 'h3', text: '⑤ 把 BN 变成 MRF（L20 p39–p40）' },
      T`下一周的推断算法都在无向图上做，所以 BN 要先转成 MRF。两步：① 图：**moralize**（共同孩子的父母连边）再去掉方向；② 概率：把每个 CPT 分到一个**包含它全部变量**的团的 potential 里（分配方式不唯一）。`,
      { t: 'graphs', r: 16, items: [
        { nodes: { x1: [40, 40], x2: [40, 150], x3: [180, 40], x4: [180, 150] }, labels: { x1: 'x₁', x2: 'x₂', x3: 'x₃', x4: 'x₄' }, edges: 'x1>x2 x2>x4 x3>x4', caption: 'BN：$P(x_1)P(x_2\\mid x_1)P(x_3)P(x_4\\mid x_2,x_3)$' },
        { nodes: { x1: [40, 40], x2: [40, 150], x3: [180, 40], x4: [180, 150] }, labels: { x1: 'x₁', x2: 'x₂', x3: 'x₃', x4: 'x₄' }, edges: 'x1-x2:path x2-x4 x3-x4 x2-x3:moral', cls: { x2: 'hl', x3: 'hl', x4: 'hl' }, caption: 'MRF：$x_4$ 的父母 $x_2$—$x_3$ 结婚（虚线）。极大团：蓝色三角 $\\{x_2,x_3,x_4\\}$，以及粗线 $x_1$—$x_2$ 两端的 $\\{x_1,x_2\\}$' },
      ] },
      { t: 'math', tex: T`\psi_{12}(x_1,x_2)=P(x_1)P(x_2\mid x_1),\qquad\psi_{234}(x_2,x_3,x_4)=P(x_3)P(x_4\mid x_2,x_3),\qquad Z=1` },
      T`$Z=1$ 是因为这些因子乘起来正好是已经归一化的 BN 联合分布（不是一般规律）。代价：可能**丢失独立性**——BN 里 $x_2\perp x_3$ 成立（$x_4$ 没观测），MRF 里多了 $x_2$—$x_3$ 这条边，就读不出来了。`,
      T`**BN 和 MRF 谁表达力更强？** 上面结婚边让 $x_2\perp x_3$ 读不出来，这不是粗心，而是两种图本来就各有对方说不出的话：`,
      T`**都不是**（L20 p30–p33）：`,
      { t: 'graphs', r: 16, items: [
        { nodes: { x1: [40, 40], x2: [160, 40], x3: [40, 150], x4: [160, 150] }, labels: { x1: 'x₁', x2: 'x₂', x3: 'x₃', x4: 'x₄' }, edges: 'x1-x2 x2-x4 x4-x3 x3-x1', caption: '4-环（L20 p32）：表达 $X_1\\perp X_4\\mid X_2,X_3$ 和 $X_2\\perp X_3\\mid X_1,X_4$。**没有任何 BN** 恰好只表达这两条（p31）。' },
        { nodes: { x1: [40, 40], x2: [200, 40], x3: [120, 150] }, labels: { x1: 'x₁', x2: 'x₂', x3: 'x₃' }, edges: 'x1>x3 x2>x3', caption: 'v-structure（p33）：$X_1\\perp X_2$，但给定 $X_3$ 不独立。**没有任何 MRF** 能做到：无向图里 $x_1,x_2$ 要么被分开（给定 $x_3$ 也分开），要么连着（就不独立）。' },
      ] },
    ],
    why: [
      T`W11 的推断（消元、message passing、junction tree）都在无向图上做，BN 要先转成 MRF——所以 moralize 和"找团"是 T6（消元顺序 → junction tree 的团，2026 Q5，8 分）的前置技能。MRF 本身的概念（团、partition function、BN vs MRF 表达力）是简答素材。`,
    ],
    intuition: [
      T`**为什么 potential 不是概率？** BN 的 CPT 有明确含义（给定父节点的条件概率），因为箭头规定了"谁影响谁"。无向图里没有方向，两个相邻房间谁也不是谁的原因，只能说"这种搭配有多受欢迎"。所以用任意正数打分，最后整体除以 $Z$ 归一化。`,
      T`**$Z$ 为什么难算？** 要对**所有**取值组合求和：$n$ 个二元变量就是 $2^n$ 项。楼层有 20 个房间就是一百多万项。这正是下一周推断算法要对付的问题。`,
      { t: 'think', q: '两个二元变量 $x_1,x_2\\in\\{0,1\\}$，一条边，$\\psi(x_1,x_2)=2$（相同时）、$1$（不同时）。$Z$ 是多少？$P(x_1=x_2)$ 呢？', a: T`四种组合：$00\to2$，$01\to1$，$10\to1$，$11\to2$，$Z=6$。$P(x_1=x_2)=(2+2)/6=2/3$。potential 越大的组合概率越大，但要除以 $Z$ 才是概率。` },
      { t: 'story', title: 'Ising 模型', md: '房间温度的例子其实就是物理里的 Ising 模型：Wilhelm Lenz 1920 年提出、他的学生 Ernst Ising 1925 年研究的磁铁模型——每个原子的自旋只有 ±1 两种状态，相邻自旋倾向于同向。"partition function" 这个名字也来自统计物理，$Z$ 是德语 Zustandssumme（状态和）的首字母。' },
    ],
    math: [
      { t: 'h3', text: '把 alarm 网络转成 MRF' },
      fig(ALARM, { notes: {}, r: 16, edges: 'E-R E-A B-A R-L A-L E-B:moral R-A:moral', w: 260, caption: ALARM_KEY + 'moralize：$A$ 的父母 $E$—$B$、$L$ 的父母 $R$—$A$ 结婚，再去方向。极大团 $\\{E,B,A\\}$、$\\{E,R,A\\}$、$\\{R,A,L\\}$；$P(L\\mid R,A)$ 只能放进 $\\{R,A,L\\}$。' }),
    ],
    fx: [
      {
        title: 'Hammersley–Clifford（L20 p37）', tex: T`P(x_1,\dots,x_n)=\frac{1}{\htmlClass{fx-p1}{Z}}\prod_{c\in\mathcal C}\htmlClass{fx-p2}{\psi_c(x_c)}`,
        parts: [
          { label: 'Z', note: '$Z=\\sum_{\\text{所有取值}}\\prod_c\\psi_c(x_c)$，保证总概率为 1。全局的，要对所有组合求和。' },
          { label: 'ψ_c', note: '每个（极大）团一个正的打分函数。不是概率，可以大于 1。' },
        ],
      },
    ],
    example: [
      { t: 'graphs', r: 16, caption: '下面练习用到的图。', items: [
        { nodes: { x1: [40, 40], x2: [40, 150], x3: [180, 40], x4: [180, 150] }, labels: { x1: 'x₁', x2: 'x₂', x3: 'x₃', x4: 'x₄' }, edges: 'x1>x2 x2>x4 x3>x4', caption: '题 1：L20 p39 的 BN' },
        Object.assign({}, ALARM, { notes: {}, edges: ALARM_EDGES, caption: '题 2：alarm 网络' }),
        { nodes: { x1: [40, 60], x2: [180, 60] }, labels: { x1: 'x₁', x2: 'x₂' }, edges: 'x1-x2', caption: '题 3：两个变量、一条边的 MRF' },
      ] },
      { t: 'fade', title: '分步练习：BN → MRF', plan: ['Moralize：每个节点的父节点两两连边', '去掉方向，列出极大团', '把每个 CPT 放进一个包含它全部变量的团'], items: [
        { md: T`L20 p39：$x_1\to x_2$，$x_2\to x_4$，$x_3\to x_4$。`, steps: [
          { md: T`$x_4$ 的父母 $x_2,x_3$ 连边` }, { md: T`极大团 $\{x_1,x_2\}$、$\{x_2,x_3,x_4\}$` }, { md: T`$\psi_{12}=P(x_1)P(x_2\mid x_1)$，$\psi_{234}=P(x_3)P(x_4\mid x_2,x_3)$` },
        ] },
        { md: T`Alarm 网络：$E\to R$，$E\to A$，$B\to A$，$R\to L$，$A\to L$。`, steps: [
          { ask: 'Moralize 新加几条边？', answer: 2, show: T`$E$—$B$（$A$ 的父母），$R$—$A$（$L$ 的父母）`, sg: 1 },
          { ask: '极大团有几个？', answer: 3, show: T`$\{E,B,A\}$、$\{E,R,A\}$、$\{R,A,L\}$（$E$—$R$、$E$—$A$、$R$—$A$ 组成三角形）`, sg: 2 },
          { ask: T`$P(L\mid R,A)$ 放进哪个团？（1 = EBA，2 = ERA，3 = RAL）`, answer: 3, show: T`只有 $\{R,A,L\}$ 包含 $L,R,A$ 全部三个变量`, sg: 3 },
        ] },
        { md: T`MRF：$x_1,x_2\in\{0,1\}$，$\psi(0,0)=3$，$\psi(0,1)=1$，$\psi(1,0)=1$，$\psi(1,1)=5$。`, steps: [
          { ask: T`$Z=?$`, answer: 10, show: '$3+1+1+5$', sg: 0 },
          { ask: T`$P(x_1=1,x_2=1)=?$`, answer: 0.5, show: '$5/10$', sg: 0 },
        ] },
      ] },
    ],
    viz: [
      { id: 'moralize', how: '把 BN 一步步变成 MRF：先给共同孩子的父母连边（虚线），再去掉方向，最后标出极大团。可以选 v-structure、课件的 alarm 网络和一个有两个 v-structure 的 5 节点图。',
        try: '选"两个 v-structures"：数一数新加了几条边，再数极大团。想一想：原来 BN 里成立、但 MRF 里读不出来的独立性有哪些？（这张图是 $A\\to C\\leftarrow B$、$C\\to E\\leftarrow D$。结婚加 $A$—$B$、$C$—$D$ 两条边；BN 里 $A\\perp B$、$C\\perp D$ 都成立，MRF 里被这两条边连上就读不出来了。）' },
    ],
    compare: [
      { t: 'table', head: ['', 'Bayesian network', 'Markov random field'], rows: [
        ['图', '有向无环（DAG）', '无向'],
        ['参数', 'CPT（条件概率，已归一化）', 'potential（正的打分，未归一化）'],
        ['联合分布', '$\\prod_iP(x_i\\mid x_{pa_i})$', '$\\frac1Z\\prod_c\\psi_c(x_c)$'],
        ['需要 $Z$？', '不需要（自动为 1）', '需要（通常难算）'],
        ['读独立性', 'D-separation（祖先图 + moralize）', '普通图分离'],
        ['能表达而对方不能的', 'v-structure 的"边缘独立、条件相关"', '4-环的两条条件独立'],
      ] },
      { t: 'exam', md: T`**Converting a Bayesian network to an MRF:** Moralise the DAG by connecting every pair of parents that share a child, then drop all edge directions. Each conditional probability $P(x_i\mid x_{pa_i})$ involves $x_i$ and its parents, which form a clique in the moral graph, so assign each CPT to a potential of a clique that contains those variables; the product of potentials then equals the BN joint and $Z=1$. Some conditional independencies of the BN (e.g. the marginal independence of two parents of an unobserved common child) can be lost, because the added moral edges connect them.` },
      { t: 'exam', md: T`**MRF factorisation (Hammersley–Clifford):** A strictly positive distribution that satisfies the conditional independences of an undirected graph (separation) factorises over the graph's (maximal) cliques: $P(\mathbf x)=\frac1Z\prod_c\psi_c(\mathbf x_c)$ with $\psi_c>0$. The potentials are compatibility scores, not probabilities, and need not be normalised individually; the partition function $Z=\sum_{\mathbf x}\prod_c\psi_c(\mathbf x_c)$ normalises their product.` },
    ],
    pitfalls: [
      ['Potential 是概率，要在 0 和 1 之间', '只要求非负（Hammersley–Clifford 定理要求为正），可以任意大；除以 $Z$ 才是概率。'],
      ['MRF 读独立性也要取祖先图、结婚', '不用：直接看删掉 $S$ 后是否连通。'],
      ['BN 转 MRF 只要去掉方向', '先 moralize（父母结婚），再去方向。'],
      ['BN 转 MRF 不会损失任何信息', '可能丢失独立性（如 v-structure 的边缘独立）。'],
      ['MRF 总是 $Z=1$', '一般要计算。从 BN 转来时 potential 之积正好是已归一化的 BN 联合分布，所以 $Z=1$；其他 potential 也可能碰巧 $Z=1$，但不能默认。'],
    ],
    quiz: [
      { type: 'num', q: '4 个节点两两全连（完全图）。有几个极大团？', answer: 1, explain: '整个 4 个节点就是一个团。' },
      { type: 'num', q: '无向链 $A$—$B$—$C$—$D$ 有几个极大团？', answer: 3, explain: T`clique（团）是两两之间都有边的一组点；maximal clique（极大团）是再加任何一个点就不再是团的团。链上只有三条边 $A$—$B$、$B$—$C$、$C$—$D$，没有三角形：例如 $\{A,B,C\}$ 缺 $A$—$C$ 这条边，不是团。所以每条边各是一个极大团：$\{A,B\},\{B,C\},\{C,D\}$，共 3 个。单个点（如 $\{B\}$）也是团，但能扩成 $\{A,B\}$，不算极大。` },
      { type: 'mc', q: '无向链 $A$—$B$—$C$，$A\\perp C\\mid B$ 成立吗？', options: ['成立', '不成立'], answer: 0, explain: T`MRF（马尔可夫随机场）读独立性只用普通的图分离：删掉条件集里的点，看 $X$、$Y$ 还连不连通。这里删掉 $B$ 后，$A$ 到 $C$ 唯一的路 $A$—$B$—$C$ 断了，不连通 ⇒ $A\perp C\mid B$ 成立。无向图不用取祖先图、也不用 moralize，那些步骤只属于 BN 的 D-separation。` },
      { type: 'mc', q: '哪种独立性 MRF 表达不了？', options: ['4-环的两条条件独立', 'v-structure 的"边缘独立但条件相关"', '链的条件独立', '完全独立'], answer: 1, explain: T`v-structure（汇合结构）$x_1\to x_3\leftarrow x_2$ 表达的是：$X_1\perp X_2$ 成立，但给定 $X_3$ 后不再独立。MRF 只能用"删掉条件集后是否连通"表达独立：$x_1$、$x_2$ 之间若没有路，给定 $x_3$ 后也照样分开；若有路，什么都不给时它们就连着，读不出 $X_1\perp X_2$。所以没有任何无向图能做到"不给时独立、给了反而相关"。最容易误选的"4-环的两条条件独立"正好相反：那是 MRF 能表达、BN 表达不了的。L20 p33。` },
    ],
  });

  /* =====================================================================
   * r10 · W10 复习
   * ===================================================================== */
  SML.content.add(SML.review({
    id: 'r10', week: 'W10', title: 'W10 复习：Bayesian 分类与图模型', en: 'Week 10 review',
    summary: '必拿分：**D-separation（T5，8 分）**——祖先图 → moralize → 去方向 → 删 $S$ → 看连通；**BN 建模与 CPT（T7，10–20 分）**——因子分解、CPT 格式（列和为 1）、数表大小、MLE 数数、确定性 0/1 CPT。其次：Beta–Binomial 后验 $\\mathrm{Beta}(k+\\alpha,n-k+\\beta)$、日出问题、Laplace 近似、BN → MRF、团与 $Z$。',
    keypoints: [
      [T`生成式学 $P(\bx,y)$、判别式学 $p(y\mid\bx)$；Beta–Binomial 共轭：后验 $\mathrm{Beta}(k+\alpha,\ n-k+\beta)$，均值 $\frac{k+\alpha}{n+\alpha+\beta}$；日出 $\frac{k+1}{k+2}$；共轭对表。`, 'c51'],
      [T`Logistic 似然没有已知的共轭先验 ⇒ 近似：Monte Carlo（抽样）、variational（优化）、Laplace（众数处的 Normal，方差 $=(-H)^{-1}$；多峰 / 偏斜时差）。`, 'c52'],
      [T`BN：DAG + CPT，$P=\prod_iP(x_i\mid x_{pa_i})$；CPT 行 = 子节点取值、列 = 父配置、列和为 1；二元节点 $2^{|pa_i|+1}$ 个数、$2^{|pa_i|}$ 个自由参数；MLE = 按父配置分组数频率。`, 'c53'],
      [T`D-separation：祖先图 → moralize → 去方向 → 删 $S$ → 不连通则独立。链 / 分叉给定中间节点独立；汇合给定孩子（或后代）变相关。`, 'c54'],
      [T`MRF：无向图，独立 = 图分离；$P=\frac1Z\prod_c\psi_c$（Hammersley–Clifford）；BN → MRF = moralize + 去方向 + CPT 放进团（可能丢独立性）。`, 'c55'],
    ],
    map: [
      { t: 'graphs', r: 16, caption: '本周反复出现的两张图（复习卡里的 $E,B,R,A,L$、$x_1,x_2,x_3$ 指的就是它们）。', items: [
        Object.assign({}, ALARM, { edges: ALARM_EDGES, caption: 'alarm 网络（c53–c55）' }),
        Object.assign({}, COIN, { edges: 'x1>x3 x2>x3', notes: { x1: '硬币 1', x2: '硬币 2', x3: '报告' }, caption: '硬币例子（c53–c54）' }),
      ] },
      { t: 'table', head: ['问题', '工具', '本周章节'], rows: [
        ['参数的不确定性（离散）', 'Beta–Binomial 共轭', 'c51'],
        ['非共轭时怎么办', 'Monte Carlo / variational / Laplace', 'c52'],
        ['很多变量的联合分布怎么存', 'BN 因子分解 / MRF 团分解', 'c53、c55'],
        ['从图读独立性', 'D-separation / 图分离', 'c54、c55'],
        ['（下周）怎么算边缘概率', '消元、message passing、junction tree', 'W11'],
      ] },
    ],
    recall: [
      { q: 'Beta–Binomial 后验？后验均值？', a: T`$\mathrm{Beta}(k+\alpha,\ n-k+\beta)$；$\frac{k+\alpha}{n+\alpha+\beta}$。`, ch: 'c51' },
      { q: '日出问题的答案？为什么不是 1？', a: T`$\frac{k+1}{k+2}$；均匀先验相当于一次假想的"没升起"，永远不会消失。`, ch: 'c51' },
      { q: '列出三个共轭对。', a: 'Normal–Normal（均值）；Binomial–Beta；Multinomial–Dirichlet；Poisson–Gamma；Normal–Inverse Gamma（方差）。', ch: 'c51' },
      { q: '为什么 Bayesian logistic regression 要近似？', a: '没有已知的共轭先验，后验和归一化常数没有闭式解。', ch: 'c52' },
      { q: 'Laplace 近似怎么做？何时不好？', a: '在后验众数（MAP）处放 Normal，协方差 = $(-H)^{-1}$；多峰、偏斜、长尾时差。', ch: 'c52' },
      { q: 'BN 的联合分布？', a: T`$P(x_1,\dots,x_n)=\prod_iP(x_i\mid x_{pa_i})$。`, ch: 'c53' },
      { q: 'CPT 的课件格式？', a: '行 = 子节点取值，列 = 父节点的每种配置，每列和为 1。', ch: 'c53' },
      { q: '完整数据下 BN 的 MLE？', a: '每张 CPT 单独估计：计数 ÷ 父节点配置的计数（相对频率）。', ch: 'c53' },
      { q: 'D-separation 的步骤？', a: '祖先图 → moralize（父母结婚）→ 去方向 → 删条件集 → 不连通则独立。', ch: 'c54' },
      { q: 'Alarm：$L\\perp B\\mid A$？$R\\perp A\\mid E$？', a: '前者不成立（$L$—$R$—$E$—$B$）；后者成立。', ch: 'c54', qzh: T`在警报（Alarm）网络中，$L\perp B\mid A$ 是否成立？$R\perp A\mid E$ 是否成立？` },
      { q: '什么是 explaining away？', a: '两个独立原因在观测到共同结果（或其后代）后变相关：知道一个原因会改变另一个的概率。典型的"或"型警报里，一个原因成立会降低另一个的可能性。', ch: 'c54' },
      { q: 'MRF 的分布和独立性？', a: T`$\frac1Z\prod_c\psi_c(x_c)$；删掉 $S$ 后不连通 ⇒ 独立。`, ch: 'c55' },
      { q: 'BN → MRF 的步骤？', a: 'moralize、去方向；每个 CPT 放进包含它全部变量的团的 potential；$Z=1$。可能丢失独立性。', ch: 'c55' },
    ],
    formulas: [
      ['$\\mathrm{Beta}(q;k+\\alpha,n-k+\\beta)$，$E[q]=\\frac{k+\\alpha}{n+\\alpha+\\beta}$', 'Beta–Binomial 后验', 'L19 p13'],
      ['$\\frac{k+1}{k+2}$', '日出问题', 'L19 p15'],
      ['$P(x_1,\\dots,x_n)=\\prod_iP(x_i\\mid x_{pa_i})$', 'BN 因子分解', 'L20 p27'],
      ['$P(A,B\\mid C)=P(A\\mid C)P(B\\mid C)$', '条件独立', 'L20 p13'],
      ['$P=\\frac1Z\\prod_{c}\\psi_c(x_c)$，$Z=\\sum_x\\prod_c\\psi_c$', 'MRF / Hammersley–Clifford', 'L20 p35–p37'],
    ],
    exam: [
      ['D-separation', '2026 practice Q4、2025 practice Q1c、2021 Q18a', '[T5](#/T05)'],
      ['BN 建模、CPT、MLE', '2026 practice Q6、2025 practice Q1d–e、Q4、Q6、2021 Q14', '[T7](#/T07)'],
      ['共轭、Laplace', 'T13 题库', '[T13](#/T13)'],
    ],
    quiz: [
      { type: 'num', q: '先验 $\\mathrm{Beta}(2,3)$，抛 5 次 3 次正面。后验均值？', answer: 0.5, explain: '$\\mathrm{Beta}(5,5)$。' },
      { type: 'num', q: '二元节点有 2 个二元父节点，CPT 表中有几个数？', answer: 8, explain: '2 行 × 4 列。' },
      { type: 'num', q: '图 $A\\to B$，数据 $(A,B)$：$(T,F),(T,T),(T,T),(F,F)$。$\\hat P(B=T\\mid A=T)=?$', answer: 0.6667, tol: 0.002, explain: '$A=T$ 的 3 行里 $B=T$ 有 2 行。' },
      { type: 'mc', q: '图 $A\\to C\\leftarrow B$，$C\\to D$。$A\\perp B$ 成立吗？', options: ['成立', '不成立'], answer: 0, explain: '祖先图只有 $A,B$（$C$ 没被观测，不在祖先图里）。' },
      { type: 'mc', q: '同一张图，$A\\perp B\\mid D$？', options: ['成立', '不成立'], answer: 1, explain: '$D$ 的祖先包括 $C$，$A,B$ 结婚。' },
      { type: 'show', q: '（英文）Why does conditioning on a common child make two independent parents dependent?', answer: T`Once the common effect is observed, information about one parent changes the probability of the other, because both must be consistent with the observed effect. In competing-cause examples (e.g. an alarm triggered by burglary or earthquake) learning that one cause is present makes the other less necessary ("explaining away"); the dependence can also be positive. E.g. in $x_1\to x_3\leftarrow x_2$ with independent coins and $x_3$ reporting whether they match, $X_1\perp X_2$ holds but $X_1\perp X_2\mid X_3$ does not. In the D-separation procedure this is represented by moralisation, which connects the two parents.`, qzh: '为什么以共同孩子（common child）为条件，会让两个原本独立的父节点变得相关？', azh: T`一旦观测到共同的结果，关于一个父节点的信息就会改变另一个父节点的概率，因为两者都必须与观测到的结果一致。在相互竞争的原因的例子里（例如警报可能由盗窃或地震触发），得知其中一个原因存在，会让另一个原因变得不那么必要（"解释排除"，explaining away）；这种相关也可以是正相关。例如在 $x_1\to x_3\leftarrow x_2$ 中，两枚硬币相互独立，$x_3$ 报告它们是否相同，则 $X_1\perp X_2$ 成立，但 $X_1\perp X_2\mid X_3$ 不成立。在 D-separation 的步骤中，这一点由道德化（moralisation）表示，即把两个父节点连起来。` },
    ],
    next: '下一周（W11）：在图模型上做推断——消元（variable elimination）、message passing、junction tree，以及消元顺序为什么重要（T6）。',
  }));
})(window);
