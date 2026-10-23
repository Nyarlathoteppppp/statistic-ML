/* W1 · L01 数学复习 + L02 统计学派 — chapters c01–c09 and review r01. */
(function (root) {
  'use strict';
  const SML = root.SML;
  const T = String.raw;
  const add = (c) => SML.content.add(SML.chapter(c));

  /* =====================================================================
   * c01 · 概率：随机变量、期望、方差（L01 p11–p18）
   * ===================================================================== */
  add({
    id: 'c01', week: 'W1', lec: 'L01', pages: 'L01 p11–p18', star: 1,
    keyEn: [
      T`A probability space is $(\Omega,F,P)$: outcomes, events and a probability measure obeying three axioms: $P(f)\ge0$, countable additivity for disjoint events, $P(\Omega)=1$.`,
      T`A random variable is a function $X(\omega)\in\mathbb R$ of the outcome; its distribution is a PMF $p(x)=P(X=x)$ (discrete) or a PDF (continuous: a density, which can exceed 1).`,
      T`$E[X]=\sum_x x\,P(X=x)$ is linear: $E[aX+b]=aE[X]+b$ and $E[X+Y]=E[X]+E[Y]$ always hold, with no independence needed.`,
      T`$\mathrm{Var}(X)=E[(X-E[X])^2]=E[X^2]-(E[X])^2$ and $\mathrm{Var}(aX+b)=a^2\mathrm{Var}(X)$; variances add only for uncorrelated (e.g. independent) variables.`,
    ],
    keyZh: [
      T`概率空间（probability space）三件套：结果集合 $\Omega$、事件集合 $F$、概率 $P$；$P$ 要满足三条公理：不为负，互不重叠的事件可直接相加，全部结果合起来为 1。`,
      T`随机变量（random variable）不是"随机的数"，而是把结果映射成一个数的函数；离散的用 PMF（每个值一个概率），连续的用 PDF（是密度，面积才是概率，所以可以大于 1）。`,
      T`期望（expectation）= 按概率加权的平均。它是线性的：乘常数、加常数、两个变量相加都能直接拆开算，不需要独立。`,
      T`方差（variance）= 偏离均值的平方的平均，手算用"平方的期望 − 期望的平方"；乘 $a$ 方差变 $a^2$ 倍，加常数不变；只有不相关（如独立）时方差才能直接相加。`,
    ],
    title: '概率：随机变量、期望、方差', en: 'Probability, random variables, expectation, variance',
    summary: '整门课的语言。后面所有东西——likelihood、risk、bias/variance、bandit 的平均回报——都是"某个随机变量的期望"。这一章把这套语言讲清楚。',
    symbols: [
      [T`$\Omega$`, T`所有可能结果的集合（骰子：$\{1,\dots,6\}$）`],
      [T`$\omega$`, T`其中一个结果`],
      [T`$F$`, T`事件的集合；一个事件 = 若干结果`],
      [T`$\mathbb R$`, T`实数集`],
      [T`$X(\omega)$`, T`随机变量：把结果 $\omega$ 映射成一个数`],
      [T`$\bigcup_i A_i$`, T`并集：$A_1$ 或 $A_2$ 或 …… 至少发生一个`],
      [T`$\sum_x$`, T`对所有可能的 $x$ 求和`],
      [T`$\int\cdots dx$`, T`积分 = 连续版的求和，算曲线下面积`],
      [T`$E[X]$`, T`期望（平均值）`],
      [T`$\mathrm{Var}(X)$, $\sigma$`, T`方差；标准差 $\sigma=\sqrt{\mathrm{Var}}$`],
      [T`$\mathcal N(\mu,\sigma^2)$`, T`Gaussian（正态）分布，中心 $\mu$、方差 $\sigma^2$`],
    ],
    goals: [
      '说清 probability space 三件套 $(\\Omega, F, P)$ 和三条公理',
      '区分 random variable、PMF、PDF、CDF',
      '会手算离散分布的 $E[X]$、$\\mathrm{Var}(X)$，会用 $\\mathrm{Var}(X)=E[X^2]-E[X]^2$',
      '会用 linearity：$E[aX+b]=aE[X]+b$、$\\mathrm{Var}(aX+b)=a^2\\mathrm{Var}(X)$',
    ],
    types: [],
    what: [
      T`**概率论**是描述"不确定性"的数学。机器学习里，数据被看成是从某个**未知分布**里抽出来的样本，所以要先有一套能描述"抽样"的语言。`,
      T`先问一个能算的问题：公平骰子，掷出偶数的概率是多少？要回答，得先说清三件事——可能掷出什么、"偶数"指哪些结果、每个结果占多少。课件（L01 p14）把这三件事捆在一起，叫 **probability space（概率空间）**：`,
      { t: 'ul', items: [
        T`**outcome 集合** $\Omega$：所有可能结果。掷骰子：$\Omega=\{1,2,3,4,5,6\}$。`,
        T`**event 集合** $F$：结果的子集组成的集合，一个 event 就是"一些结果"。例如"掷出偶数" $=\{2,4,6\}$。`,
        T`**probability measure** $P:F\to\mathbb R$：给每个 event 一个数。公平骰子 $P(\{1\})=1/6$，$P(\{1,2\})=1/3$，$P(\emptyset)=0$。`,
      ] },
      T`这个数不能乱给（课件 p15 的三条公理，见"数学定义"一节）：不能为负；互不重叠的事件，概率可以直接相加；所有可能结果加起来必须是 1。开头的问题就用第二条：$P(\text{偶数})=P(\{2\})+P(\{4\})+P(\{6\})=3\times\frac16=\frac12$。`,
      T`接下来要把"结果"变成**数**——赢多少钱、身高多少——才能求平均、做计算：`,
      T`**[[Random variable]]（随机变量）** 不是"随机的变量"，而是一个**函数**：把 outcome 映射成一个数，$X(\omega)\in\mathbb R$（L01 p16）。课件的例子：押偶数，掷出 $\{2,4,6\}$ 赢 5 元，掷出 $\{1,3,5\}$ 输 5 元，于是 $X$ 只取 $\pm5$，各 $1/2$。`,
      T`随机变量的**分布**说的是"它取各个值的可能性"，有两种写法（L01 p17）。离散的（如 $\pm5$）：每个可能的值一个概率，列成表就行，这张表叫 **[[PMF]]（probability mass function，概率质量函数）** $p(x)=P(X=x)$。连续的（如身高）：取到某一个精确值的概率是 0，表列不出来，只能说"落在一小段里"的概率，用曲线下的**面积**来算，这条曲线叫 **PDF（probability density function，概率密度函数）** $p(x)$：$P(X\le x)=\int_{-\infty}^x p(a)\,da$（从最左边到 $x$ 的面积），这个 $P(X\le x)$ 叫 **CDF（累积分布函数）**。本课手算基本只用离散的表。`,
      T`一整张分布表往往太多了。后面几乎每章只需要两个问题的答案：**长期平均是多少**、**结果离这个平均有多散**（L01 p18）。第一个叫 **[[expectation]]（期望）** $E[X]$；第二个叫 **variance（方差）** $\mathrm{Var}(X)=E[(X-E[X])^2]$。例：公平骰子的期望 $=(1+2+3+4+5+6)/6=3.5$——3.5 掷不出来，期望不必是能取到的值；押偶数的 $X=\pm5$ 期望是 0，方差是 $25$（每次都离平均 5 元）。`,
    ],
    why: [
      T`你可能会问：为什么 ML 课第一周先复习概率？因为这门课叫 **Statistical** Machine Learning——几乎每个核心概念都是一个期望：`,
      { t: 'table', head: ['后面的概念', '本质上是谁的期望'], rows: [
        ['risk（风险，c07 / L06）', '损失函数 $l(\\delta(X),Y)$ 的期望'],
        ['estimator 的 bias（c05）', '$E[\\hat\\theta]-\\theta$'],
        ['bias–variance 分解（c19）', '平方误差的期望拆成两项'],
        ['bandit 的 arm 价值（c47）', '这只手臂奖励的期望 $\\mu_i$'],
        ['Bayesian 预测（c50）', '对参数后验求期望'],
      ] },
      T`所以这一章不难，但它是后面每一章的"语法"。看到 $E[\cdot]$ 不发怵，后面就顺了。`,
      { t: 'story', title: '概率论起源于赌桌', md: '1654 年，Pascal 和 Fermat 通信讨论"赌局中途停止，赌注该怎么分"（problem of points），这被看作概率论的起点——所以课件第一个例子就是押骰子。将近三百年后的 1933 年，Kolmogorov 在 *Grundbegriffe der Wahrscheinlichkeitsrechnung* 里用三条公理（就是 L01 p15 的非负、可数可加、$P(\\Omega)=1$）把概率论变成严格的数学。' },
    ],
    intuition: [
      T`**期望 = 长期平均 = 重心。** 把 PMF 画成一根根柱子，柱子高度是概率，把 x 轴当成一根杆、柱子当成重量，$E[X]$ 就是这根杆的平衡点。公平骰子平衡在 3.5——注意 3.5 根本掷不出来，期望不必是可能取到的值。`,
      T`**方差 = 平均"偏离的平方"。** 先算每个值离重心多远，平方（让正负偏离都算数，并且大偏离惩罚更重），再按概率加权平均。押偶数那个赌局：值总是 $\pm5$，离平均 0 都是 5，平方是 25，所以 $\mathrm{Var}=25$，标准差 $\sigma=5$。`,
      T`**PDF 不是概率。** 连续变量取到某一个精确值的概率是 0，PDF 的值是"概率密度"：在 $x$ 附近一小段 $\Delta$ 上的概率约等于 $p(x)\Delta$。所以 PDF 可以大于 1（比如很窄的 Gaussian），只要曲线下总面积是 1。`,
      { t: 'think', q: '掷两个骰子，点数之和的期望是多少？算的时候需要用到"两个骰子独立"吗？', a: T`$E[X_1+X_2]=E[X_1]+E[X_2]=3.5+3.5=7$。**不需要独立**——期望的 linearity 对任何随机变量都成立。方差就不同了：一般 $\mathrm{Var}(X_1+X_2)=\mathrm{Var}(X_1)+\mathrm{Var}(X_2)+2\mathrm{Cov}(X_1,X_2)$，只有协方差为 0（不相关；独立是常用的充分条件）时才直接相加。` },
    ],
    math: [
      { t: 'h3', text: '三条公理（L01 p15）' },
      { t: 'ol', items: [
        T`非负：$P(f)\ge0$ 对所有 event $f\in F$。`,
        T`可加：两两不相交的 event（可数个），并集的概率 = 各自概率之和：$P(\bigcup_f f)=\sum_f P(f)$。`,
        T`归一：$P(\Omega)=1$。`,
      ] },
      { t: 'h3', text: '期望与方差（L01 p18）' },
      { t: 'math', tex: T`E[X]=\sum_x x\,P(X=x)\quad(\text{离散})\qquad E[X]=\int x\,p(x)\,dx\quad(\text{连续})` },
      { t: 'math', tex: T`E[aX+b]=aE[X]+b,\qquad E[X+Y]=E[X]+E[Y],\qquad X\ge Y\Rightarrow E[X]\ge E[Y]` },
      { t: 'math', tex: T`\mathrm{Var}(X)=E\big[(X-E[X])^2\big]=E[X^2]-\big(E[X]\big)^2` },
      T`最后一个等号是手算神器。推导只用两条规则：**常数可以直接拿出期望**（$E[c]=c$，$E[cX]=cE[X]$），**和的期望 = 期望的和**。记 $\mu=E[X]$（一个常数）：`,
      { t: 'steps', items: [
        T`展开平方：$(X-\mu)^2=X^2-2\mu X+\mu^2$`,
        T`逐项求期望：$E[X^2]-E[2\mu X]+E[\mu^2]=E[X^2]-2\mu E[X]+\mu^2$`,
        T`代入 $E[X]=\mu$：$E[X^2]-2\mu^2+\mu^2=E[X^2]-\mu^2$ ✓`,
      ] },
      { t: 'deep', title: '再多两条常用性质', hint: '课件没单列，但后面推导会用', blocks: [
        T`$\mathrm{Var}(aX+b)=a^2\mathrm{Var}(X)$。推导：$E[aX+b]=a\mu+b$，所以偏离 $=(aX+b)-(a\mu+b)=a(X-\mu)$，平方后 $a^2(X-\mu)^2$，求期望得 $a^2\mathrm{Var}(X)$。直觉：平移（$+b$）不改变分散程度，放大 $a$ 倍则偏离放大 $a$ 倍、平方后是 $a^2$ 倍。`,
        T`若 $X,Y$ **独立**，$\mathrm{Var}(X+Y)=\mathrm{Var}(X)+\mathrm{Var}(Y)$，并且 $E[XY]=E[X]E[Y]$。c05 证明"样本均值的方差是 $\sigma^2/n$"就靠这一条。`,
        T`$E[X+Y]=E[X]+E[Y]$ **不需要**独立——这是 linearity 最好用的地方。`,
      ] },
    ],
    fx: [
      {
        title: '方差的两种写法', tex: T`\htmlClass{fx-p1}{\mathrm{Var}(X)}=\htmlClass{fx-p2}{E\big[(X-E[X])^2\big]}=\htmlClass{fx-p3}{E[X^2]}-\htmlClass{fx-p4}{\big(E[X]\big)^2}`,
        parts: [
          { label: 'Var(X)', note: '方差：衡量 $X$ 围绕均值的分散程度，单位是 $X$ 单位的平方。开根号得到标准差 $\\sigma$。' },
          { label: '定义式', note: '先求偏离 $X-E[X]$，平方，再求期望。适合理解，计算时要先算出均值。' },
          { label: 'E[X²]', note: '"平方的期望"：$\\sum_x x^2P(X=x)$。' },
          { label: '(E[X])²', note: '"期望的平方"。两者之差就是方差。因为方差 ≥ 0，所以总有 $E[X^2]\\ge(E[X])^2$。' },
        ],
      },
    ],
    example: [
      { t: 'h3', text: '例 1：公平骰子' },
      { t: 'steps', items: [
        T`$E[X]=\frac16(1+2+3+4+5+6)=\frac{21}{6}=3.5$`,
        T`$E[X^2]=\frac16(1+4+9+16+25+36)=\frac{91}{6}\approx15.167$`,
        T`$\mathrm{Var}(X)=\frac{91}{6}-3.5^2=\frac{91}{6}-\frac{49}{4}=\frac{182-147}{12}=\frac{35}{12}\approx2.917$`,
      ] },
      { t: 'h3', text: '例 2：押偶数（L01 p16）' },
      T`$X\in\{-5,5\}$ 各 $1/2$：$E[X]=0$，$E[X^2]=25$，$\mathrm{Var}(X)=25$。如果每局赌注翻倍（$Y=2X$），$\mathrm{Var}(Y)=4\times25=100$——风险按平方增长。`,
      { t: 'h3', text: '例 3：Bernoulli（后面天天用）' },
      T`$X\in\{0,1\}$，$P(X=1)=\theta$：$E[X]=\theta$，$E[X^2]=\theta$（因为 $0^2=0,1^2=1$），$\mathrm{Var}(X)=\theta-\theta^2=\theta(1-\theta)$。$\theta=0.5$ 时方差最大 0.25。c06 的 MLE 就从这个 [[Bernoulli]] 分布开始。`,
      { t: 'fade', title: '分步练习：方差手算（从看懂到独立）', plan: [T`求 $E[X]$`, T`求 $E[X^2]$`, T`$\mathrm{Var}=E[X^2]-E[X]^2$`], items: [
        { md: T`$X\in\{1,2,3\}$，概率 $0.5,0.3,0.2$。`, steps: [
          { md: T`$E[X]=1(0.5)+2(0.3)+3(0.2)=1.7$` },
          { md: T`$E[X^2]=1(0.5)+4(0.3)+9(0.2)=3.5$` },
          { md: T`$\mathrm{Var}(X)=3.5-1.7^2=3.5-2.89=0.61$` },
        ] },
        { md: T`$X\in\{0,2,4\}$，概率 $0.25,0.5,0.25$。已知 $E[X]=2$。`, steps: [
          { ask: T`$E[X^2]=?$`, answer: 6, show: T`$0+4(0.5)+16(0.25)=6$` },
          { ask: T`$\mathrm{Var}(X)=?$`, answer: 2, show: T`$6-2^2=2$` },
        ] },
        { md: T`$X\in\{-1,0,3\}$，概率 $0.3,0.5,0.2$。`, steps: [
          { ask: T`$E[X]=?$`, answer: 0.3, show: T`$-0.3+0+0.6=0.3$` },
          { ask: T`$E[X^2]=?$`, answer: 2.1, show: T`$0.3+0+9(0.2)=2.1$` },
          { ask: T`$\mathrm{Var}(X)=?$`, answer: 2.01, show: T`$2.1-0.09=2.01$` },
        ] },
      ] },
    ],
    viz: [
      { id: 'pmf-explorer', how: '上面每个输入框是一个取值的概率。柱子是 PMF，红色竖线是 $E[X]$，红色横线标出 $\\pm\\sigma$。下方实时算出 $E[X]$、$E[X^2]$ 和方差。滑块 $a$、$b$ 把 $X$ 变成 $aX+b$，用来验证 linearity。',
        try: '① 选"押偶数"，看 $E=0$、$\\mathrm{Var}=25$。② 把 $a$ 拉到 2，方差变成 100 而不是 50。③ 选"灌铅骰子"，把 $P(X=6)$ 改成 0.6——上方会提示概率和不等于 1，这违反了公理 3。' },
    ],
    compare: [
      { t: 'table', head: ['', 'PMF（离散）', 'PDF（连续）'], rows: [
        ['$p(x)$ 的含义', '$P(X=x)$，就是概率', '密度；$P(X=x)=0$'],
        ['取值范围', '$0\\le p(x)\\le1$', '$p(x)\\ge0$，**可以 > 1**'],
        ['归一', '$\\sum_x p(x)=1$', '$\\int p(x)dx=1$'],
        ['求期望', '$\\sum_x x\\,p(x)$', '$\\int x\\,p(x)dx$'],
        ['例子', 'Bernoulli、骰子、Binomial', 'Gaussian、Uniform、Beta'],
      ] },
    ],
    pitfalls: [
      ['PDF 的值是概率，所以不能大于 1', 'PDF 是密度，面积才是概率。$\\mathcal N(0,0.01)$ 在 0 处的密度约 3.99。'],
      ['$\\mathrm{Var}(X+Y)=\\mathrm{Var}(X)+\\mathrm{Var}(Y)$ 总成立', '需要独立（严格说是不相关）。$E[X+Y]=E[X]+E[Y]$ 才是总成立的。'],
      ['$\\mathrm{Var}(2X)=2\\mathrm{Var}(X)$', '$\\mathrm{Var}(aX)=a^2\\mathrm{Var}(X)$，是 4 倍。'],
      ['期望一定是能取到的值', '骰子期望 3.5 就取不到。'],
      ['Random variable 是"随机的数"', '它是从 outcome 到实数的**函数** $X(\\omega)$。'],
    ],
    quiz: [
      { type: 'num', q: '$X$ 取 0、1、2 的概率分别是 0.2、0.5、0.3。求 $E[X]$。', answer: 1.1, explain: T`要算的是 expectation（期望）$E[X]$：每个取值乘以它的概率，再全部加起来。题目给出取值 0、1、2，对应概率 0.2、0.5、0.3。$E[X]=0\times0.2+1\times0.5+2\times0.3=0+0.5+0.6=1.1$。**期望是按概率加权的平均，不是三个取值的简单平均**（$(0+1+2)/3=1$ 是错的）。1.1 本身取不到也没关系，它表示长期平均。` },
      { type: 'num', q: '接上题，求 $\\mathrm{Var}(X)$。', answer: 0.49, explain: T`要算 variance（方差），用手算公式 $\mathrm{Var}(X)=E[X^2]-(E[X])^2$。第一步算 $E[X^2]$：每个取值先平方再乘概率，$0^2\times0.2+1^2\times0.5+2^2\times0.3=0+0.5+1.2=1.7$。第二步用上题的 $E[X]=1.1$，平方得 $1.1^2=1.21$。所以 $\mathrm{Var}(X)=1.7-1.21=0.49$。**$E[X^2]$ 是"先平方再平均"，$(E[X])^2$ 是"先平均再平方"**，两者不同，它们的差才是方差；常见错误是用 $E[X]^2=1.21$ 代替 $E[X^2]$。` },
      { type: 'num', q: '$\\mathrm{Var}(X)=3$，求 $\\mathrm{Var}(-2X+7)$。', answer: 12, explain: '$a^2\\mathrm{Var}(X)=4\\times3=12$，常数 7 不影响方差，负号被平方掉。' },
      { type: 'mc', q: '下面哪个**不是** probability space 的组成部分？', options: ['outcome 集合 $\\Omega$', 'event 集合 $F$', 'probability measure $P$', 'random variable $X$'], answer: 3, explain: 'Probability space 是三元组 $(\\Omega,F,P)$（L01 p14）。Random variable 是定义在它之上的函数。' },
      { type: 'mc', q: '某个 PDF 在 $x=0$ 处的值是 2.5。这说明：', options: ['分布写错了，概率不能超过 1', '$P(X=0)=2.5$', '在 0 附近密度很高，分布很集中', '$E[X]=2.5$'], answer: 2, explain: 'PDF 是密度，可以大于 1；连续变量 $P(X=0)=0$。' },
    ],
  });

  /* =====================================================================
   * c02 · 条件概率、独立、Bayes rule、边缘化（L01 p19–p25）
   * ===================================================================== */
  add({
    id: 'c02', week: 'W1', lec: 'L01', pages: 'L01 p19–p25', star: 2,
    keyEn: [
      T`Sum rule (marginalisation): $P(A)=\sum_b P(A,B=b)=\sum_b P(A\mid B=b)P(B=b)$; product rule: $P(A,B)=P(A\mid B)P(B)=P(B\mid A)P(A)$.`,
      T`Conditioning: $P(A\mid B)=P(A,B)/P(B)$ for $P(B)>0$, i.e. keep the slice where $B$ holds and renormalise it.`,
      T`Bayes' theorem: $P(A\mid B)=\frac{P(B\mid A)P(A)}{P(B)}$ (posterior = likelihood times prior over evidence), where $P(B)=\sum_aP(B\mid A=a)P(A=a)$ by the sum rule.`,
      T`Independence: $P(X,Y)=P(X)P(Y)$; conditional independence $X\perp Y\mid Z$: $P(X,Y\mid Z)=P(X\mid Z)P(Y\mid Z)$. Neither implies the other.`,
    ],
    keyZh: [
      T`加法规则（sum rule，即边缘化 marginalisation）：把不关心的变量的所有取值加掉，得到剩下变量的概率；乘法规则（product rule）：联合概率 = 条件概率 × 被条件那一方的概率，两个方向都行。`,
      T`条件概率（conditioning）：只看 $B$ 成立的那一片，再除以 $P(B)$ 让它重新加起来为 1；所以要求 $P(B)>0$。`,
      T`贝叶斯定理（Bayes' theorem）把条件方向反过来：后验（posterior）= 似然（likelihood）× 先验（prior）÷ 证据（evidence）；分母 $P(B)$ 用加法规则，把所有能产生 $B$ 的情况加起来。`,
      T`独立（independence）：联合概率能拆成各自概率相乘；条件独立（conditional independence）：知道 $Z$ 之后才能这样拆。两者互不蕴含，可以只成立其中一个。`,
    ],
    examQ: [
      { src: '2016 S2 Q1.1', q: T`What is the difference between marginal and conditional probability distributions?`,
        a: T`A marginal distribution gives the probabilities of one variable on its own, obtained by summing (integrating) the joint over the other variables: $P(A)=\sum_bP(A,B=b)$. A conditional distribution gives the probabilities of $A$ once another variable is known: $P(A\mid B=b)=P(A,B=b)/P(B=b)$, the slice of the joint where $B=b$, renormalised.`,
        qzh: T`边缘概率分布（marginal probability distribution）和条件概率分布（conditional probability distribution）有什么区别？`,
        azh: T`边缘分布给出一个变量单独的概率，把联合分布对其他变量求和（连续时积分）得到：$P(A)=\sum_bP(A,B=b)$。条件分布给出已知另一个变量的取值后 $A$ 的概率：$P(A\mid B=b)=P(A,B=b)/P(B=b)$，即联合分布中 $B=b$ 的那一片，再重新归一化（renormalise）。` },
      { src: '2019 S2 practice Q1(e) / 2021 S1 practice Q1(e)', q: T`In words or a mathematical expression, what is the chain rule of probability?`,
        a: T`For any ordering of the random variables, the joint factorises into a product of conditionals: $\Pr(X_1,\dots,X_k)=\prod_{i=1}^k\Pr(X_i\mid X_{i+1},\dots,X_k)$, e.g. $\Pr(A,B,C)=\Pr(A\mid B,C)\Pr(B\mid C)\Pr(C)$. It follows from applying the product rule repeatedly.`,
        qzh: T`用文字或数学表达式说明：概率的链式法则（chain rule of probability）是什么？`,
        azh: T`对随机变量的任意一种排列顺序，联合分布都可以分解成条件概率的乘积：$\Pr(X_1,\dots,X_k)=\prod_{i=1}^k\Pr(X_i\mid X_{i+1},\dots,X_k)$，例如 $\Pr(A,B,C)=\Pr(A\mid B,C)\Pr(B\mid C)\Pr(C)$。它就是反复使用乘法规则（product rule）得到的。` },
    ],
    title: '条件概率、独立、Bayes rule、边缘化', en: 'Conditioning, independence, Bayes\' theorem, marginalisation',
    summary: '四个操作：joint（联合）、conditional（条件）、marginal（边缘）、Bayes（反转条件）。Bayesian 统计、Bayesian network、D-separation 全部建立在这四个操作上。',
    prereq: ['c01'],
    symbols: [
      [T`$P(A,B)$ = $P(A\cap B)$`, T`$A$ 和 $B$ 同时发生（$\cap$ = 交集，"且"）`],
      [T`$P(A\mid B)$`, T`已知 $B$ 时 $A$ 的概率（竖线读作 given）`],
      [T`$\neg D$`, T`非 $D$（没有病）`],
      [T`$X\perp Y$`, T`$X$ 与 $Y$ 独立`],
      [T`$X\perp Y\mid Z$`, T`给定 $Z$ 时 $X$、$Y$ 条件独立`],
      [T`$\sum_b$`, T`对 $B$ 的所有取值 $b$ 求和`],
      [T`$\propto$`, T`正比于（差一个常数倍）`],
    ],
    goals: [
      '从一张 joint 表算出 marginal 和 conditional',
      '用 product rule 和 sum rule 推出 Bayes\' theorem，并解释分母是什么',
      '判断两个变量是否 independent；知道 conditional independence 的写法',
      '手算"检测阳性后真正患病"类问题',
    ],
    types: ['T05', 'T09'],
    what: [
      T`先看一张表。记录很多天的天气 $X$（晴 sun / 雨 rain）和出门带不带伞 $Y$（umb / none），每种组合占的比例：`,
      { t: 'table', cls: 'compact', head: ['', 'umb（带伞）', 'none（不带）', '行和'], rows: [
        ['sun', '0.1', '0.5', '0.6'], ['rain', '0.3', '0.1', '0.4'], ['列和', '0.4', '0.6', '1'],
      ] },
      T`这张表本身叫 **[[joint distribution]]（联合分布）** $P(X,Y)$：两个变量**一起**取某组值的概率，例如 $P(\text{rain},\text{umb})=0.3$。从这张表出发能回答三类问题，每类有一个名字（L01 p19–p20, p23）：`,
      { t: 'ul', items: [
        T`**只问一个变量**："下雨的概率？"——把 rain 那一行加起来：$0.3+0.1=0.4$，不关心的 $Y$ 被"加掉"了。结果写在表的边上（行和、列和），所以叫 **marginal distribution（边缘分布）**：$P(X=x)=\sum_y P(X=x,Y=y)$。这个"加掉"的操作叫 **marginalisation / sum rule**。`,
        T`**已知一个，问另一个**："已知下雨，带伞的概率？"——只看 rain 那一行，再除以这一行的和，让它重新加起来为 1：$0.3/0.4=0.75$。这叫 **[[conditional distribution]]（条件分布）**：$P(Y=y\mid X=x)=\dfrac{P(X=x,Y=y)}{P(X=x)}$。常简写成 $P(Y\mid X)=\dfrac{P(X,Y)}{P(X)}$，意思是"对每一组 $x,y$ 都这样算"。`,
        T`**一个对另一个有没有帮助**：如果知道 $X$ 对预测 $Y$ 毫无帮助，就叫 **[[Independence]]（独立）**：$P(Y\mid X)=P(Y)$，等价地 joint 可以拆成乘积 $P(X,Y)=P(X)P(Y)$（L01 p20）。这张表里，已知下雨时带伞的概率是 $0.75$，不知道天气时只有 $0.4$——知道天气帮助很大，所以**不独立**（也可以检查乘积：$0.4\times0.4=0.16\ne0.3$）。`,
      ] },
      T`**把条件反过来。** 上面算的是"已知下雨，带伞的概率"。很多时候手里只有这种"正向"的数，想要的却是反方向：看到有人带伞，下雨的概率是多少？更重要的例子是体检：知道"有病时检测阳性的概率"，想知道"检测阳性时真的有病的概率"。**Bayes' theorem（贝叶斯定理）** 就做这件事（L01 p22）：`,
      { t: 'math', tex: T`P(A\mid B)=\frac{P(B\mid A)\,P(A)}{P(B)}` },
      T`分子 = 正向的条件概率 × $A$ 本身的概率；分母 $P(B)$ 用上面的 sum rule，把能产生 $B$ 的所有情况加起来：$P(B)=\sum_aP(B\mid A=a)P(A=a)$。带伞的例子：$P(\text{rain}\mid\text{umb})=\dfrac{0.75\times0.4}{0.4}=0.75$。体检的完整计算在下面"例子"一节。`,
      { t: 'story', title: '一篇死后才发表的论文', md: 'Thomas Bayes 是 18 世纪英国的一位牧师。他去世（1761）后，朋友 Richard Price 整理出他的手稿，1763 年发表为 "An Essay towards solving a Problem in the Doctrine of Chances"。真正把这个公式发展成通用推断方法的是 Laplace。所以"Bayes"这个名字背后其实是好几个人的工作。' },
    ],
    why: [
      T`ML 里我们常常**知道正向的**、**想要反向的**：`,
      { t: 'ul', items: [
        T`知道"参数是 $\theta$ 时数据长什么样" $P(\text{data}\mid\theta)$（这叫 likelihood），想要"看到数据后 $\theta$ 是多少" $P(\theta\mid\text{data})$。这就是 c08 的 Bayesian 推断，完全是 Bayes' theorem。`,
        T`知道"有病时检测阳性的概率"，想要"阳性时有病的概率"。`,
        T`知道每个节点在父节点给定时的分布（CPT），想算任意变量的 marginal——这是 c53–c58 的图模型推断，核心操作就是 marginalisation。`,
      ] },
      T`另外，Bayes 公式的**分母** $P(B)=\sum_a P(B\mid A=a)P(A=a)$ 用的就是 marginalisation。往年卷问过的 **marginal likelihood（边缘似然）**（2026 Q1b、2025 Q1b）是同一种操作，但专指**数据**在**参数**被先验积掉后的概率 $p(D)=\int p(D\mid\theta)p(\theta)d\theta$，c08 正式定义。`,
    ],
    intuition: [
      T`**Conditioning = 切一刀再放大。** 看 L01 p24 右图：在 joint 曲面上固定 $x_1$ 切一刀，得到一条曲线；这条曲线下面积不是 1，所以除以 $x_1$ 处的边缘密度 $p(x_1)$（要求 $>0$）重新归一化，就是 $p(x_2\mid x_1)=p(x_1,x_2)/p(x_1)$。离散情形同理，条件概率 $P(A\mid B)$ 要求 $P(B)>0$。`,
      T`**Marginalisation = 压扁。** 左图：沿着 $x_1$ 方向把所有切片加起来（红箭头），压到 $x_2$ 轴上，得到 $P(x_2)$。`,
      { t: 'fig', src: 'reference/pages/L01/p24.jpg', caption: 'L01 p24：左 = marginalisation（沿 $x_1$ 求和压扁），右 = conditioning（在某个 $x_1$ 处切片再归一化）', w: 620 },
      T`**Bayes = 用先验加权的"谁更能解释证据"。** 阳性结果既可能来自"有病"，也可能来自"没病但误报"。后验就是"有病这条路"占所有能产生阳性的路的比例。患病率极低时，即使误报率不高，误报那条路的人数也远多于真阳性，于是后验很小——这就是著名的"[[base rate fallacy]]"。`,
      { t: 'story', title: '为什么用 1000 个小圆点', md: '心理学家 Gigerenzer 和 Hoffrage（1995）发现：把"1% 患病率、90% 灵敏度"这种百分比，改写成"1000 人里 10 人有病，其中 9 人阳性"这种**自然频数（natural frequencies）**，人们做对 Bayes 题的比例大幅提高。下面可视化用 1000 个点就是这个思路——考试时也可以先在草稿上换成"1000 人"来算。' },
    ],
    math: [
      { t: 'h3', text: '两条基本规则' },
      { t: 'math', tex: T`\textbf{product rule:}\quad P(A\cap B)=P(A\mid B)P(B)=P(B\mid A)P(A)` },
      { t: 'math', tex: T`\textbf{sum rule:}\quad P(A)=\sum_b P(A,B=b)=\sum_b P(A\mid B=b)P(B=b)` },
      T`sum rule 的第二个等号只是对 joint 再用一次 product rule：$P(A,B=b)=P(A\mid B=b)P(B=b)$。考题里通常给的是条件概率（如 CPT），所以第二种写法更常用。`,
      T`Bayes' theorem 就是 product rule 两种写法相等再移项（L01 p22–p23）：$P(A\mid B)P(B)=P(B\mid A)P(A)$ ⇒ 两边除以 $P(B)$。`,
      { t: 'h3', text: '独立与条件独立' },
      { t: 'math', tex: T`X\perp Y \iff P(X,Y)=P(X)P(Y)\iff P(Y\mid X)=P(Y)` },
      { t: 'math', tex: T`X\perp Y\mid Z \iff P(X,Y\mid Z)=P(X\mid Z)P(Y\mid Z)` },
      T`第二行是 **conditional independence**：给定 $Z$ 之后 $X,Y$ 独立。它**不**蕴含 $X\perp Y$，反过来也不成立。2025 Q1c 直接考过这句话的含义，第 54 章（D-separation）整章都在判断它。`,
    ],
    fx: [
      {
        title: 'Bayes\' theorem 逐项', tex: T`\htmlClass{fx-p1}{P(A\mid B)}=\frac{\htmlClass{fx-p2}{P(B\mid A)}\;\htmlClass{fx-p3}{P(A)}}{\htmlClass{fx-p4}{P(B)}}=\frac{P(B\mid A)P(A)}{\htmlClass{fx-p5}{\sum_a P(B\mid A=a)P(A=a)}}`,
        parts: [
          { label: 'posterior', note: '看到证据 $B$ 之后对 $A$ 的信念。这是我们想要的。' },
          { label: 'likelihood', note: '如果 $A$ 成立，看到 $B$ 的可能性有多大。通常容易建模（"正向"方向）。' },
          { label: 'prior', note: '看到证据之前对 $A$ 的信念（如患病率）。' },
          { label: 'evidence', note: '证据本身的总概率，与 $A$ 取什么无关，只起归一化作用。' },
          { label: 'sum rule', note: '分母用 marginalisation 展开：把产生 $B$ 的所有"路"加起来。这一项在 Bayesian 统计里叫 **marginal likelihood**。' },
        ],
      },
    ],
    example: [
      { t: 'h3', text: '例 1：从 joint 表算一切' },
      T`天气 $X\in\{\text{sun},\text{rain}\}$，带伞 $Y\in\{\text{umb},\text{none}\}$，joint 如下：`,
      { t: 'table', cls: 'compact', head: ['', 'umb', 'none', '行和 = $P(X)$'], rows: [
        ['sun', '0.1', '0.5', '**0.6**'], ['rain', '0.3', '0.1', '**0.4**'], ['列和 = $P(Y)$', '**0.4**', '**0.6**', '1'],
      ] },
      { t: 'steps', items: [
        T`marginal：行和、列和。$P(\text{rain})=0.3+0.1=0.4$，$P(\text{umb})=0.1+0.3=0.4$。`,
        T`conditional：$P(\text{umb}\mid\text{rain})=\dfrac{0.3}{0.4}=0.75$。`,
        T`Bayes 反过来：$P(\text{rain}\mid\text{umb})=\dfrac{P(\text{umb}\mid\text{rain})P(\text{rain})}{P(\text{umb})}=\dfrac{0.75\times0.4}{0.4}=0.75$（也可以直接 $0.3/0.4$）。`,
        T`独立吗？$P(\text{rain})P(\text{umb})=0.16\ne0.3=P(\text{rain},\text{umb})$，**不独立**。`,
      ] },
      { t: 'h3', text: '例 2：检测阳性（经典 Bayes 题）' },
      { t: 'think', q: '先**凭直觉猜**：一种病患病率 1%，检测灵敏度 90%、误报率 5%。一个人检测阳性，他真的有病的概率大约是多少？写下你的猜测再往下看。', a: '大多数人猜 80%–90%。正确答案约 **15%**（下面算）。差距来自先验：没病的人太多了，5% 的误报绝对数量远超真阳性。' },
      T`患病率 $P(D)=0.01$，灵敏度 $P(+\mid D)=0.9$，误报率 $P(+\mid\neg D)=0.05$。`,
      { t: 'video', id: 'bayes-grid' },
      { t: 'steps', items: [
        T`分母（sum rule）：$P(+)=0.9\times0.01+0.05\times0.99=0.009+0.0495=0.0585$`,
        T`$P(D\mid+)=\dfrac{0.009}{0.0585}\approx0.154$`,
        T`解读：阳性后患病概率只有约 15%。因为 99% 的没病的人里 5% 误报 = 每千人 49.5 个误报，而真阳性只有 9 个。`,
      ] },
      { t: 'fade', title: '分步练习：检测题', plan: [T`分子 $P(+\mid D)P(D)$`, T`分母 $P(+)$（sum rule）`, T`相除得后验`], items: [
        { md: T`$P(D)=0.05$，$P(+\mid D)=0.8$，$P(+\mid\neg D)=0.1$，求 $P(D\mid +)$。`, steps: [
          { md: T`分子 $P(+\mid D)P(D)=0.8\times0.05=0.04$` },
          { md: T`分母 $P(+)=0.04+0.1\times0.95=0.04+0.095=0.135$` },
          { md: T`$P(D\mid +)=0.04/0.135\approx0.296$` },
        ] },
        { md: T`$P(D)=0.2$，$P(+\mid D)=0.9$，$P(+\mid\neg D)=0.2$。分子已算好：$0.9\times0.2=0.18$。`, steps: [
          { ask: '分母 $P(+)=?$', answer: 0.34, show: T`$0.18+0.2\times0.8=0.18+0.16=0.34$` },
          { ask: '$P(D\\mid +)=?$', answer: 0.5294, tol: 0.002, show: T`$0.18/0.34\approx0.529$` },
        ] },
        { md: T`罕见病：$P(D)=0.001$，$P(+\mid D)=0.99$，$P(+\mid\neg D)=0.01$。`, steps: [
          { ask: '分子 $P(+\\mid D)P(D)=?$', answer: 0.00099, tol: 0.00001, show: T`$0.99\times0.001=0.00099$` },
          { ask: '分母 $P(+)=?$', answer: 0.01098, tol: 0.00002, show: T`$0.00099+0.01\times0.999=0.00099+0.00999=0.01098$` },
          { ask: '$P(D\\mid +)=?$', answer: 0.0902, tol: 0.001, show: T`$\approx0.090$。99% 准的检测，阳性后也只有 9% 真有病。` },
        ] },
      ] },
    ],
    viz: [
      { id: 'bayes-test', how: '1000 个小圆点代表 1000 个人。深红 = 有病且阳性，浅红 = 有病但漏检，橙 = 没病但误报，灰 = 没病阴性。所有"阳性"的人 = 深红 + 橙；后验 $P(D\\mid+)$ 就是深红占其中的比例。',
        try: '① 默认参数下数一下：深红约 9 个，橙约 50 个。② 把患病率拉到 0.2，后验会跳到 80% 以上——先验影响巨大。③ 把误报率拉到 0，后验变成 1：没有误报，阳性就一定有病。' },
    ],
    compare: [
      { t: 'table', head: ['操作', '公式', '图上的动作', '后面在哪用'], rows: [
        ['marginalisation', '$P(x)=\\sum_y P(x,y)$', '压扁', 'evidence（c08）、变量消元（c56–c58）'],
        ['conditioning', '$P(y\\mid x)=P(x,y)/P(x)$', '切片 + 归一化', '判别模型 $P(y\\mid x)$（c09）、evidence 节点（c57）'],
        ['Bayes', '$P(a\\mid b)\\propto P(b\\mid a)P(a)$', '反转条件方向', '后验（c08、c50）'],
        ['independence', '$P(x,y)=P(x)P(y)$', 'joint = 外积', 'i.i.d. 数据（c05）、BN 因子分解（c53）'],
      ] },
    ],
    pitfalls: [
      ['$P(A\\mid B)=P(B\\mid A)$', '一般不等。阳性时患病（15%）≠ 患病时阳性（90%）。两者通过 Bayes 用先验连接。'],
      ['条件独立 ⇒ 独立', '不成立。$X\\perp Y\\mid Z$ 和 $X\\perp Y$ 是两回事，可以只有其中一个成立（c54 有反例）。'],
      ['Bayes 分母可以随便省', '求"最可能的 $A$"时可以省（它与 $A$ 无关）；要求具体概率值时必须算出来。'],
      ['独立 = 互斥', '互斥（不能同时发生）的两个非零概率事件一定**不**独立：知道一个发生就知道另一个没发生。'],
    ],
    quiz: [
      { type: 'num', q: '接例 1 的表，求 $P(\\text{sun}\\mid\\text{none})$。', answer: 0.8333, tol: 0.002, explain: '例 1 的表：sun 且 none 那一格是 $0.5$；none 那一列的和是 $0.5+0.1=0.6$。$P(\\text{sun}\\mid\\text{none})=0.5/0.6\\approx0.833$。' },
      { type: 'num', q: '患病率 0.1，灵敏度 0.8，误报率 0.1。求 $P(D\\mid+)$。', answer: 0.4706, tol: 0.002, explain: T`要算的是检测阳性后真正患病的概率 $P(D\mid+)$，用 Bayes' theorem（贝叶斯定理）$P(D\mid+)=\dfrac{P(+\mid D)P(D)}{P(+)}$。题目给出：患病率 $P(D)=0.1$，灵敏度 $P(+\mid D)=0.8$，误报率 $P(+\mid\neg D)=0.1$；没病的概率是 $P(\neg D)=1-0.1=0.9$。分母用 sum rule（加法规则，即边缘化）把两条"阳性路"加起来：$P(+)=0.8\times0.1+0.1\times0.9=0.08+0.09=0.17$。分子是"有病且阳性"这条路 $0.08$，所以 $P(D\mid+)=0.08/0.17\approx0.471$。**没病的人多，误报那条路（0.09）比真阳性（0.08）还大**，所以阳性的人里只有约 47% 真有病；常见陷阱是漏掉分母里的误报项，或直接答灵敏度 0.8。` },
      { type: 'mc', q: '$P(A,B\\mid C)=P(A\\mid C)P(B\\mid C)$ 说的是：', options: ['$A$、$B$ 独立', '给定 $C$ 时 $A$、$B$ 条件独立', '$A$、$B$、$C$ 两两独立', '$C$ 与 $A$、$B$ 独立'], answer: 1, explain: '这是 conditional independence 的定义，不蕴含 $A\\perp B$。原题：2025 Q1c。' },
      { type: 'mc', q: 'Bayes 公式中分母 $P(B)$ 通常如何计算？', options: ['直接假设等于 1', '用 sum rule：$\\sum_a P(B\\mid a)P(a)$', '等于 $P(A)$', '等于 $P(B\\mid A)$'], answer: 1, explain: 'marginalisation：把产生证据的所有情况加起来。' },
      { type: 'show', q: '（原题 2025 Q1c）In words, what does $\\Pr(A,B\\mid C)=\\Pr(A\\mid C)\\Pr(B\\mid C)$ say about the dependence of $A,B,C$?', answer: T`$A$ and $B$ are conditionally independent given $C$: once $C$ is known, learning $B$ gives no further information about $A$ (and vice versa). This does not imply that $A$ and $B$ are marginally independent.`, qzh: T`用文字说明：$\Pr(A,B\mid C)=\Pr(A\mid C)\Pr(B\mid C)$ 对 $A,B,C$ 之间的依赖关系说明了什么？`, azh: '给定 $C$ 时，$A$ 和 $B$ 条件独立（conditionally independent）：一旦知道了 $C$，再得知 $B$ 不会提供关于 $A$ 的任何额外信息（反之亦然）。这并不意味着 $A$ 和 $B$ 边缘独立（marginally independent）。' },
      { type: 'show', q: '用英文一句话解释 marginalisation。', answer: T`Marginalisation obtains the distribution of a subset of variables by summing (or integrating) the joint distribution over all values of the other variables: $P(x)=\sum_y P(x,y)$.` },
    ],
  });

  /* =====================================================================
   * c03 · 向量、点积、超平面、范数（L01 p26–p35）
   * ===================================================================== */
  add({
    id: 'c03', week: 'W1', lec: 'L01', pages: 'L01 p26–p35', star: 2,
    keyEn: [
      T`Dot product: $\bu'\bv=\sum_iu_iv_i=\|\bu\|\,\|\bv\|\cos\theta$; zero means orthogonal, negative means the angle exceeds $90^\circ$.`,
      T`A hyperplane is $\{\bx:\bw'\bx+b=0\}$; $\bw$ is its normal vector (perpendicular to it), and the sign of $\bw'\bx+b$ tells which side $\bx$ is on.`,
      T`Distance from $\bx$ to the hyperplane: $|\bw'\bx+b|/\|\bw\|$. Dividing by $\|\bw\|$ removes the scale freedom: $(c\bw,cb)$ with $c>0$ is the same hyperplane.`,
      T`Norms: $\|\mathbf a\|_2=\sqrt{\mathbf a'\mathbf a}$ (ridge penalises $\|\bw\|_2^2$) and $\|\mathbf a\|_1=\sum_i|a_i|$ (lasso penalises $\|\bw\|_1$).`,
    ],
    keyZh: [
      T`点积（dot product）两种算法：对应分量相乘再相加，或"长度 × 长度 × 夹角余弦"；等于 0 说明两向量垂直（正交），为负说明夹角大于 90°。`,
      T`超平面（hyperplane）= 满足 $\bw'\bx+b=0$ 的所有点；$\bw$ 是法向量（normal vector），垂直于超平面；把 $\bx$ 代入看正负，就知道它在哪一侧。`,
      T`点到超平面的距离 = 代入值的绝对值 ÷ $\|\bw\|$。必须除，因为 $\bw$、$b$ 同乘一个正数 $c$ 时超平面不动，代入值却变成 $c$ 倍。`,
      T`范数（norm）衡量向量长度：$L_2$ 是平方和开根号（ridge 惩罚它的平方），$L_1$ 是绝对值之和（lasso 惩罚它）。`,
    ],
    title: '线代：向量、点积、超平面、范数', en: 'Vectors, dot product, hyperplanes, norms',
    summary: '线性模型、SVM、perceptron 的几何全在这一章：一个线性分类器就是一个 hyperplane $\\bw\'\\bx+b=0$，$\\bw$ 是它的法向量，$\\bw\'\\bx+b$ 的符号告诉你在哪一侧。',
    prereq: [],
    symbols: [
      [T`$\bu$（粗体小写）`, T`向量（一列数）`],
      [T`$u_i$`, T`向量的第 $i$ 个分量`],
      [T`$\bu'$`, T`转置：列向量变行向量`],
      [T`$\bu'\bv$`, T`点积 $\sum_iu_iv_i$；$\bu'\bv=\bv'\bu$`],
      [T`$\bw,\ \bx$`, T`也是向量（粗体小写一律是向量）：$\bw$ = 模型的权重，$\bx$ = 一个样本的特征`],
      [T`$b$`, T`一个数（标量）：bias / 截距，把 hyperplane 整体平移`],
      [T`$\|\bu\|$, $\|\bu\|_1$`, T`$L_2$ 长度；$L_1$ 长度`],
      [T`$\theta$（本章）`, T`两个向量（起点放在一起）之间的夹角`],
      [T`$\mathbb R^m$`, T`$m$ 维实数向量的空间`],
      [T`$\sgn(z)$`, T`取符号：$z>0$ 给 $+1$，$z<0$ 给 $-1$`],
    ],
    goals: [
      '会算点积的两种形式（代数 / 几何）并判断正交、平行',
      '看到 $\\bw\'\\bx+b=0$ 能说出：这是 hyperplane，$\\bw$ 垂直于它，符号决定哪一侧',
      '会算 $L_1$、$L_2$ norm',
      '会算点到超平面的距离 $|\\bw\'\\bx+b|/\\|\\bw\\|$（L08 SVM 的核心）',
    ],
    types: ['T04'],
    what: [
      T`**向量** $\bu\in\mathbb R^m$ 是 $m$ 个数排成一列。课件统一用 **列向量**，[[转置|Transpose]]写成 $\bu'$（一撇 = transpose，有的书写 $\bu^\top$）。`,
      T`**[[点积|Dot product]]（dot product / inner product）**有两种等价定义（L01 p28–p29），其中 $\theta$ 是两个向量起点放在一起时的夹角。点积不分先后：$\bu'\bv=\bv'\bu$，所以课件写 $\bx'\bw$ 和 $\bw'\bx$ 是一回事。`,
      { t: 'math', tex: T`\bu'\bv=\sum_{i=1}^m u_iv_i\qquad(\text{algebraic})\qquad\qquad \bu'\bv=\|\bu\|\,\|\bv\|\cos\theta\qquad(\text{geometric})` },
      T`点积回答的是"两个箭头有多对齐"。它马上就有用：分类时我们想要一条**把点分开的线**——线的一边算正类，另一边算负类。这条线（高维里是一块"平板"）正好可以用点积写出来：`,
      T`**[[Hyperplane]]（超平面）**：由 $\bw\ne\mathbf 0$ 和 $b$ 决定的点集 $\{\bx:\ \bx'\bw+b=0\}$（L01 p31）。在 2D 里是一条直线，3D 里是一个平面，$m$ 维里是一个 $m-1$ 维的"平板"。$\bw$ 叫 **[[normal vector]]（法向量）**，它垂直于这个超平面。`,
      T`**[[Norm]]（范数）** 衡量向量的长度（L01 p34）：`,
      { t: 'math', tex: T`\|\mathbf a\|_2=\sqrt{a_1^2+\cdots+a_n^2}=\sqrt{\mathbf a'\mathbf a}\qquad\qquad \|\mathbf a\|_1=|a_1|+\cdots+|a_n|` },
    ],
    why: [
      { t: 'table', head: ['后面的内容', '用到这一章的什么'], rows: [
        ['线性回归（c10）', '预测 $\\hat y=\\bx\'\\bw$ 就是点积'],
        ['Perceptron、logistic（c15、c31）', '决策边界是超平面 $\\bw\'\\bx+b=0$，按符号分类'],
        ['SVM（c25–c27）', 'margin = 点到超平面距离 $|\\bw\'\\bx+b|/\\|\\bw\\|$；目标是最小化 $\\|\\bw\\|^2$'],
        ['Ridge / Lasso（c16–c17）', '$L_2$ 惩罚 $\\|\\bw\\|_2^2$、$L_1$ 惩罚 $\\|\\bw\\|_1$'],
        ['Kernel（c29）', 'kernel 就是"在特征空间里的点积"'],
      ] },
    ],
    intuition: [
      T`**点积 = 一个向量在另一个方向上的投影 × 长度。** 几何式里 $\|\bu\|\cos\theta$ 是 $\bu$ 在 $\bv$ 方向上的 **[[scalar projection]]**（L01 p29），所以 $\bu'\bv=(\text{投影长})\times\|\bv\|$。同向时点积最大，垂直时为 0，反向时为负（L01 p30）。`,
      { t: 'video', id: 'dot' },
      T`**为什么 $\bw$ 垂直于超平面？** 取超平面上任意两点 $\bx_1,\bx_2$，都有 $\bw'\bx_i+b=0$，相减得 $\bw'(\bx_1-\bx_2)=0$。$\bx_1-\bx_2$ 是超平面内部的任意方向，和 $\bw$ 点积为 0 ⇒ 垂直。`,
      T`**为什么符号决定哪一侧？** $\bw'\bx+b$ 本质上是"$\bx$ 沿着 $\bw$ 方向走了多远，再减去超平面所在的位置"。顺着 $\bw$ 方向越过超平面就为正，反方向为负。这就是线性分类器 $\hat y=\sgn(\bw'\bx+b)$（[[sgn]] = 取符号）的来历。`,
      { t: 'fig', src: 'reference/pages/L01/p33.jpg', caption: 'L01 p33：3D 里用平面分开点云、2D 里用直线分开点云——都是 hyperplane', w: 560 },
    ],
    math: [
      { t: 'h3', text: '点积的代数性质（L01 p28）' },
      { t: 'math', tex: T`(k\mathbf a)'\mathbf b=k(\mathbf a'\mathbf b)=\mathbf a'(k\mathbf b),\qquad \mathbf a'(\mathbf b+\mathbf c)=\mathbf a'\mathbf b+\mathbf a'\mathbf c` },
      { t: 'h3', text: '2D 超平面 = 直线（L01 p32）' },
      { t: 'math', tex: T`w_1x_1+w_2x_2+b=0\iff x_2=-\frac{w_1}{w_2}x_1-\frac{b}{w_2}` },
      T`（要求 $w_2\ne0$；$w_2=0$ 时是竖直线 $x_1=-b/w_1$。）斜率 $-w_1/w_2$，截距 $-b/w_2$。注意 $(\bw,b)$ 和 $(2\bw,2b)$ 描述的是**同一条线**——这个"缩放自由度"在 SVM 里会用来把 margin 固定成 1（c26）。`,
      { t: 'h3', text: '点到超平面的距离（L08 会正式推导）' },
      T`知道点在线的哪一侧，只够做分类。后面的 SVM 还要问"离线有多远"：离得远的点分得更稳。$\bw'\bx+b$ 本身还不是距离——上面说过 $(\bw,b)$ 放大成 $(2\bw,2b)$ 时线没动，这个数却翻倍了。除以 $\|\bw\|$ 把这个缩放抵消掉，才是真正的几何距离：`,
      { t: 'math', tex: T`\text{dist}(\bx,\ \{\bw'\bx+b=0\})=\frac{|\bw'\bx+b|}{\|\bw\|}` },
      T`推导：从 $\bx$ 沿单位法向量 $\bw/\|\bw\|$ 走距离 $t$ 落到超平面上（$t$ 可正可负）：`,
      { t: 'steps', items: [
        T`落点 $\bx-t\,\bw/\|\bw\|$ 在超平面上：$\bw'(\bx-t\,\bw/\|\bw\|)+b=0$`,
        T`展开：$\bw'\bx-t\,\frac{\bw'\bw}{\|\bw\|}+b=0$，而 $\bw'\bw=\|\bw\|^2$，所以中间项 $=t\|\bw\|$`,
        T`解出 $t=(\bw'\bx+b)/\|\bw\|$，走过的距离就是 $|t|$`,
      ] },
      { t: 'think', q: T`固定 $\bw$，把 $b$ 调大，超平面往哪个方向移动？（提示：超平面上的点满足 $\bw'\bx=-b$。）`, a: T`超平面在法向量方向上离原点的"带符号距离"是 $-b/\|\bw\|$。$b$ 变大 ⇒ 这个值变小 ⇒ 超平面**朝 $-\bw$ 方向**平移。可以在下面的可视化里拖 $b$ 验证。` },
    ],
    fx: [
      {
        title: '超平面与分类', tex: T`\hat y=\sgn\big(\htmlClass{fx-p1}{\bw}'\htmlClass{fx-p2}{\bx}+\htmlClass{fx-p3}{b}\big),\qquad \text{dist}=\frac{|\bw'\bx+b|}{\htmlClass{fx-p4}{\|\bw\|}}`,
        parts: [
          { label: 'w', note: '法向量：决定超平面的**朝向**。它指向的一侧 $\\bw\'\\bx+b>0$。' },
          { label: 'x', note: '要分类的点（特征向量）。' },
          { label: 'b', note: 'bias / 截距：决定超平面离原点多远（原点到它的距离是 $|b|/\\|\\bw\\|$）。$b=0$ 时超平面过原点。' },
          { label: '‖w‖', note: '除以 $\\|\\bw\\|$ 把"$\\bw\'\\bx+b$ 的值"换算成真实几何距离。不除的话把 $\\bw$ 放大 2 倍，值也放大 2 倍，但几何上什么都没变。' },
        ],
      },
    ],
    example: [
      { t: 'h3', text: '例 1：点积与范数' },
      T`$\bu=(3,4)'$，$\bv=(4,-3)'$。`,
      { t: 'steps', items: [
        T`$\bu'\bv=3\times4+4\times(-3)=0$ ⇒ 正交（垂直）。`,
        T`$\|\bu\|_2=\sqrt{9+16}=5$，$\|\bu\|_1=3+4=7$。`,
        T`$\bu'\bu=25=\|\bu\|_2^2$——平方 $L_2$ norm 就是自己和自己的点积。`,
      ] },
      { t: 'h3', text: '例 2：超平面、哪一侧、距离' },
      T`$\bw=(1,1)'$，$b=-2$：超平面是直线 $x_1+x_2=2$，$\|\bw\|=\sqrt2\approx1.414$。`,
      { t: 'table', cls: 'compact', head: ['点', '$\\bw\'\\bx+b$', '侧', '距离'], rows: [
        ['$(3,2)$', '$3+2-2=3$', '+', '$3/\\sqrt2\\approx2.121$'],
        ['$(0,0)$', '$-2$', '−', '$2/\\sqrt2\\approx1.414$'],
        ['$(1,-2)$', '$1-2-2=-3$', '−', '$3/\\sqrt2\\approx2.121$'],
        ['$(1,1)$', '$0$', '在线上', '0'],
      ] },
      { t: 'fade', title: '分步练习：点到超平面的距离', plan: [T`算 $\bw'\bx+b$（定侧）`, T`算 $\|\bw\|$`, T`距离 $=|\bw'\bx+b|/\|\bw\|$`], items: [
        { md: T`$\bw=(3,4)'$，$b=-5$，$\bx=(3,1)'$。`, steps: [
          { md: T`$\bw'\bx+b=9+4-5=8>0$ ⇒ 正侧` },
          { md: T`$\|\bw\|=\sqrt{9+16}=5$` },
          { md: T`距离 $=8/5=1.6$` },
        ] },
        { md: T`$\bw=(1,2,2)'$，$b=1$，$\bx=(1,1,0)'$。已知 $\bw'\bx+b=1+2+0+1=4$。`, steps: [
          { ask: T`$\|\bw\|=?$`, answer: 3, show: T`$\sqrt{1+4+4}=3$` },
          { ask: '距离 = ?', answer: 1.3333, tol: 0.002, show: T`$4/3\approx1.333$` },
        ] },
        { md: T`$\bw=(2,-1)'$，$b=3$，$\bx=(-1,4)'$。`, steps: [
          { ask: T`$\bw'\bx+b=?$`, answer: -3, show: T`$-2-4+3=-3$（负侧）` },
          { ask: T`$\|\bw\|=?$`, answer: 2.236, tol: 0.002, show: T`$\sqrt5\approx2.236$` },
          { ask: '距离 = ?', answer: 1.342, tol: 0.002, show: T`$3/\sqrt5\approx1.342$` },
        ] },
      ] },
    ],
    viz: [
      { id: 'hyperplane-2d', opts: { w1: 1, w2: 1, b: -2, points: [[3, 2], [0, 0], [1, -2]] }, how: '绿线是超平面 $w_1x_1+w_2x_2+b=0$，红箭头是法向量 $\\bw$（从线上指向正侧）。红点在正侧，蓝点在负侧，虚线是点到线的垂线。下表给出每个点的 $\\bw\'\\bx+b$ 和几何距离。点图可以加点。',
        try: '① 把 $w_1,w_2,b$ 都乘 2（2, 2, −4）：线不动、所有距离不变，但 $\\bw\'\\bx+b$ 的值翻倍——这就是为什么距离要除以 $\\|\\bw\\|$。② 把 $b$ 从 −2 调到 0，线平移过原点。③ 把 $w_2$ 调成 0，线变成竖直线 $x_1=-b/w_1$。' },
    ],
    compare: [
      { t: 'table', head: ['', '$L_2$ norm $\\|\\cdot\\|_2$', '$L_1$ norm $\\|\\cdot\\|_1$'], rows: [
        ['定义', '$\\sqrt{\\sum a_i^2}$', '$\\sum|a_i|$'],
        ['几何', '欧氏长度；单位球是圆', '"曼哈顿距离"；单位球是菱形'],
        ['可导性', '处处光滑（平方后）', '在 $a_i=0$ 处不可导'],
        ['作为惩罚', 'Ridge：把权重均匀压小（c16）', 'Lasso：把一些权重压成**恰好 0**（c17）'],
      ] },
      { t: 'story', title: '曼哈顿距离', md: '$L_1$ norm 也叫 **Manhattan distance / taxicab distance**：在曼哈顿那样横平竖直的街区里，出租车不能斜穿楼房，只能沿街走，走的距离就是各坐标差的绝对值之和。$L_2$ 则是"直线飞过去"的距离。' },
    ],
    pitfalls: [
      ['$\\bw\'\\bx+b$ 的值就是距离', '它除以 $\\|\\bw\\|$ 才是**带符号**距离，几何距离还要取绝对值：$|\\bw\'\\bx+b|/\\|\\bw\\|$。'],
      ['$\\bw$ 和超平面平行', '$\\bw$ **垂直**于超平面（法向量）。'],
      ['$(\\bw,b)$ 唯一确定且一一对应超平面', '$(c\\bw,cb)$ 对任何 $c>0$ 都是同一个超平面、同一侧朝向（$c<0$ 时同一超平面但正负侧互换）。'],
      ['$\\|\\bu\\|_2^2=\\sum|u_i|$', '$\\|\\bu\\|_2^2=\\sum u_i^2=\\bu\'\\bu$。'],
    ],
    quiz: [
      { type: 'num', q: '$\\bu=(1,2,-2)\'$。求 $\\|\\bu\\|_2$。', answer: 3, explain: T`$L_2$ norm（$L_2$ 范数，欧氏长度）是各分量平方相加再开根号：$\|\bu\|_2=\sqrt{u_1^2+u_2^2+u_3^2}$。代入 $\bu=(1,2,-2)'$：$\sqrt{1^2+2^2+(-2)^2}=\sqrt{1+4+4}=\sqrt9=3$。负号在平方后消失，所以 $-2$ 和 $2$ 贡献一样。3 就是从原点到点 $(1,2,-2)$ 的直线距离。` },
      { type: 'num', q: '同上，求 $\\|\\bu\\|_1$。', answer: 5, explain: T`$L_1$ norm（$L_1$ 范数）是各分量取绝对值再相加，不平方也不开根号：$\|\bu\|_1=|u_1|+|u_2|+|u_3|$。代入 $\bu=(1,2,-2)'$：$|1|+|2|+|-2|=1+2+2=5$。**陷阱是忘了取绝对值**，得到 $1+2-2=1$。几何上它是只能沿坐标轴走的"曼哈顿距离"，所以比上题的直线距离 3 更长。` },
      { type: 'num', q: '超平面 $3x_1+4x_2-10=0$。点 $(2,3)$ 到它的距离是？', answer: 1.6, explain: T`点到 hyperplane（超平面）的距离是 $|\bw'\bx+b|/\|\bw\|$：分子是把点代进方程得到的值，分母除掉 $\bw$ 的长度，才得到真正的几何距离。由方程 $3x_1+4x_2-10=0$ 读出 $\bw=(3,4)'$、$b=-10$，点是 $\bx=(2,3)'$。分子：$3\times2+4\times3-10=6+12-10=8$，绝对值是 8。分母：$\|\bw\|=\sqrt{3^2+4^2}=\sqrt{9+16}=5$。距离 $=8/5=1.6$。**常见错误是算出 8 就停下**：不除以 $\|\bw\|$ 的话，把方程整体乘 2，"距离"就翻倍，可直线根本没动。` },
      { type: 'mc', q: '两个非零向量点积为负，说明它们的夹角：', options: ['小于 90°', '等于 90°', '大于 90°', '无法判断'], answer: 2, explain: T`Dot product（点积）的几何定义是 $\bu'\bv=\|\bu\|\,\|\bv\|\cos\theta$。两个向量都非零，长度 $\|\bu\|$、$\|\bv\|$ 都是正数，所以点积的正负完全由 $\cos\theta$ 决定。点积为负 ⇒ $\cos\theta<0$ ⇒ $\theta$ 在 90° 到 180° 之间，**夹角大于 90°，两个向量大致指向相反方向**。"无法判断"不对：正因为长度一定为正，符号才能确定；夹角等于 90° 对应的是点积等于 0。` },
      { type: 'mc', q: '线性分类器 $\\sgn(\\bw\'\\bx+b)$ 中，把 $\\bw$ 和 $b$ 同时乘以 5：', options: ['决策边界和所有预测都不变', '边界平移', '边界旋转', '预测全部取反'], answer: 0, explain: '正数缩放不改变超平面，也不改变符号。' },
    ],
  });

  /* =====================================================================
   * c04 · 矩阵、特征值、PSD（L01 p36–p43）
   * ===================================================================== */
  add({
    id: 'c04', week: 'W1', lec: 'L01', pages: 'L01 p36–p43', star: 1,
    keyEn: [
      T`Vectors are linearly dependent if one is a linear combination of the others; linearly dependent columns of $\mathbf X$ mean a redundant feature.`,
      T`Eigenvalue: $\mathbf A\bv=\lambda\bv$, $\bv\ne\mathbf 0$. A symmetric $\mathbf A$ is PSD if $\bv'\mathbf A\bv\ge0$ for all $\bv$ (all eigenvalues $\ge0$) and PD if $\bv'\mathbf A\bv>0$ for $\bv\ne\mathbf 0$ (all $>0$).`,
      T`$\mathbf X'\mathbf X$ is always PSD since $\bv'\mathbf X'\mathbf X\bv=\|\mathbf X\bv\|^2\ge0$; it is PD (invertible) iff the columns of $\mathbf X$ are linearly independent.`,
      T`Dependent columns ⇒ zero eigenvalue ⇒ $\mathbf X'\mathbf X$ is not invertible; adding $\lambda\mathbf I$ raises every eigenvalue by $\lambda$ (ridge). A valid kernel's Gram matrix must be PSD.`,
    ],
    keyZh: [
      T`线性相关（linearly dependent）：某个向量能由其余向量各乘一个数再相加得到，即它是多余的；$\mathbf X$ 的列线性相关 = 有一个特征是多余的（如米和厘米两列）。`,
      T`特征值（eigenvalue）$\lambda$：矩阵作用在特征向量上只把它缩放 $\lambda$ 倍（$\lambda<0$ 时方向反过来），不会转到别的方向。对称矩阵的二次型对所有 $\bv$ 都 ≥ 0 叫 PSD（半正定，特征值全 ≥ 0）；对非零 $\bv$ 严格 > 0 叫 PD（正定，特征值全 > 0）。`,
      T`$\mathbf X'\mathbf X$ 一定是 PSD，因为它的二次型就是 $\|\mathbf X\bv\|^2$，平方长度不会为负；$\mathbf X$ 的列线性无关时它就是 PD（可逆），反过来也成立。`,
      T`链条：列线性相关 ⇒ 有特征值 0 ⇒ $\mathbf X'\mathbf X$ 不可逆；ridge 加上 $\lambda\mathbf I$，每个特征值抬高 $\lambda$，又可逆了。合法 kernel 的 Gram 矩阵必须是 PSD。`,
    ],
    title: '矩阵、特征值、PSD', en: 'Linear independence, matrices, eigenvalues, positive semidefinite',
    summary: '三个后面会反复出现的结论：① 列线性相关 ⇒ 矩阵不可逆（线性回归闭式解失效 → 需要 ridge）；② $\\mathbf X\'\\mathbf X$ 永远 PSD；③ 合法 kernel 的 Gram 矩阵必须 PSD（kernel 的合法性条件，第 29–30 章才讲，这里先记住"PSD"这个词）。',
    prereq: ['c03'],
    symbols: [
      [T`$\mathbf A$（粗体大写）`, T`矩阵`],
      [T`$A_{ij}$`, T`第 $i$ 行第 $j$ 列的元素`],
      [T`$\mathbf A'$`, T`转置；规则 $(\mathbf A\mathbf B)'=\mathbf B'\mathbf A'$`],
      [T`$\mathbf I$`, T`单位矩阵：对角线全 1，其余 0；$\mathbf I\bv=\bv$`],
      [T`$\mathbf A^{-1}$`, T`逆矩阵：$\mathbf A^{-1}\mathbf A=\mathbf I$`],
      [T`$\lambda$`, T`特征值（一个数）`],
      [T`$\det$, $\mathrm{tr}$`, T`行列式；迹（对角线之和）`],
      [T`$\forall$`, T`对所有`],
      [T`$\bv'\mathbf A\bv$`, T`二次型：结果是一个数`],
    ],
    goals: [
      '解释 linear independence、span、basis',
      '会算 2×2 对称矩阵的特征值，并判断 PSD / PD',
      '证明 $\\mathbf X\'\\mathbf X$ 是 PSD（一行证明）',
      '说出"rank deficient ⇒ 有零特征值 ⇒ 不可逆"这条链',
    ],
    types: ['T08'],
    notExam: 'L01 p44–p52 的 sequences、limits、supremum/infimum 是数学背景，不单独出题；知道 "sup = 最小上界，集合可能没有 max 但有 sup" 即可（后面泛化界用 sup）。',
    what: [
      { t: 'h3', text: '① 为什么要学这些：线性回归公式里的那个"逆"' },
      T`W2 的线性回归会给出一个公式 $\hat\bw=(\mathbf X'\mathbf X)^{-1}\mathbf X'\by$。里面有一个**矩阵的逆** $(\cdot)^{-1}$——就像数字的倒数：$0$ 没有倒数，有些矩阵也没有逆。**什么时候没有？会出什么事？** 这一章的几个概念（线性相关、特征值、PSD）就是为了回答这个问题；后面 ridge（c16）、kernel（c30）还会再用到它们。`,
      { t: 'h3', text: '② 线性相关：有一列是多余的（L01 p36–p37）' },
      T`先看一个例子：记录 3 个人的身高，一列用米 $(1.7,\ 1.6,\ 1.8)$，另一列用厘米 $(170,\ 160,\ 180)$。第二列就是第一列乘 100——它**没带来任何新信息**。用术语说：`,
      { t: 'ul', items: [
        T`**Linear combination（线性组合）**：$\sum_i a_i\bv_i$，把几个向量各乘一个数再相加。厘米列 $=100\times$ 米列，就是米列的一个线性组合。`,
        T`**Linearly dependent（线性相关）**：其中某个向量能写成其余向量的线性组合（有一个是多余的）。否则就是 **linearly independent（线性无关）**。`,
        T`**[[Span]]（张成空间）**：所有线性组合构成的集合——这几个向量"能到达的所有地方"。米列和厘米列 span 出来的只是一条直线，多了一列也没多到达任何地方。`,
        T`**[[Basis]]（基）**：一组线性无关、并且能 span 整个（子）空间的向量——"不多不少，刚好够用"。**Orthonormal basis（标准正交基）**：两两正交、每个长度为 1。`,
      ] },
      T`把数据排成矩阵 $\mathbf X$（每行一个人、每列一个特征），**列线性相关 = 有一个特征是多余的**。下面会看到，这正是 $\mathbf X'\mathbf X$ 没有逆的原因。`,
      { t: 'h3', text: '③ 矩阵、转置、逆（L01 p39）' },
      T`转置 $(\mathbf A')_{ij}=A_{ji}$（行列互换）；**symmetric（对称）** 指 $\mathbf A=\mathbf A'$；**invertible（可逆）** 指存在 $\mathbf A^{-1}$ 使 $\mathbf A^{-1}\mathbf A=\mathbf I$。`,
      T`把矩阵看成"把向量 $\bv$ 变成 $\mathbf A\bv$"的变换，逆就是**撤销**这个变换。要能撤销，变换就不能把某个方向**压成 0**——压扁了，原来的信息就丢了，回不去。哪些方向被压扁、每个方向被拉伸多少，要用特征值来看。`,
      { t: 'h3', text: '④ 特征值：矩阵在某些方向上只做拉伸（L01 p40）' },
      { t: 'math', tex: T`\mathbf A\bv=\lambda\bv,\qquad \bv\ne\mathbf 0` },
      T`方阵 $\mathbf A$ 作用在 **eigenvector（特征向量）** $\bv$ 上时**不改变方向，只拉伸** $\lambda$ 倍（$\lambda<0$ 时反向）。$\lambda$ 叫 **eigenvalue（特征值）**。`,
      T`**例子**：$\mathbf A=\begin{bmatrix}2&1\\1&2\end{bmatrix}$。$\mathbf A\begin{bmatrix}1\\1\end{bmatrix}=\begin{bmatrix}3\\3\end{bmatrix}=3\begin{bmatrix}1\\1\end{bmatrix}$，$\mathbf A\begin{bmatrix}1\\-1\end{bmatrix}=\begin{bmatrix}1\\-1\end{bmatrix}$：方向 $(1,1)$ 拉长 3 倍，方向 $(1,-1)$ 不变，特征值是 $3$ 和 $1$。再看 $\mathbf B=\begin{bmatrix}1&1\\1&1\end{bmatrix}$：$\mathbf B\begin{bmatrix}1\\1\end{bmatrix}=\begin{bmatrix}2\\2\end{bmatrix}$（特征值 2），而 $\mathbf B\begin{bmatrix}1\\-1\end{bmatrix}=\begin{bmatrix}0\\0\end{bmatrix}$——这个方向被**压成 0**，特征值 $0$，所以 $\mathbf B$ 没有逆。（一般怎么求特征值，见下面"数学定义"一节。）`,
      { t: 'video', id: 'eigen' },
      { t: 'story', title: 'eigen 是德语', md: '"eigen" 是德语，意思是"自己的、特有的"——eigenvector 就是"矩阵特有的方向"。这个叫法来自 20 世纪初 David Hilbert 等德国数学家的工作，中文译作"特征"。' },
      { t: 'h3', text: '⑤ PSD：二次型永远不小于 0（L01 p42）' },
      T`最后一个概念回答"损失函数是不是一只碗"。W2 的平方损失展开后有一项 $\bw'(\mathbf X'\mathbf X)\bw$——这种"向量 × 矩阵 × 同一个向量"的乘积叫 **quadratic form（二次型）**，结果是一个数。如果朝**任何**方向它都 $\ge0$，损失就像一只朝上的碗，一定有最低点。这样的对称矩阵叫 **PSD（positive semidefinite，半正定）**；严格 $>0$ 叫 **PD（positive definite，正定）**：`,
      { t: 'math', tex: T`\textbf{PSD: }\ \bv'\mathbf A\bv\ge0\ \ \forall\bv\qquad\qquad \textbf{PD: }\ \bv'\mathbf A\bv>0\ \ \forall\bv\ne\mathbf 0` },
      T`（$\mathbf A$ 对称。）等价地：PSD ⇔ 所有特征值 $\ge0$；PD ⇔ 所有特征值 $>0$。上面的 $\mathbf A$（特征值 3、1）是 PD；$\mathbf B$（特征值 2、0）是 PSD 但不是 PD——特征值为 0 的那个方向上碗底是**平的**，最低点不唯一，这也正是它不可逆的方向。`,
      T`**把链条串起来**（证明在下面"数学定义"一节）：$\mathbf X$ 的列线性相关（米 / 厘米两列）⇒ $\mathbf X'\mathbf X$ 有特征值 0 ⇒ PSD 但不是 PD ⇒ 没有逆 ⇒ 线性回归的公式失效（c10）。ridge 给它加上 $\lambda\mathbf I$，把所有特征值抬高 $\lambda$，0 变成 $\lambda>0$，就又可逆了（c16）。`,
    ],
    why: [
      { t: 'table', head: ['结论', '后面在哪用'], rows: [
        ['列线性相关 ⇒ $\\mathbf X\'\\mathbf X$ 不可逆', '线性回归 $\\hat\\bw=(\\mathbf X\'\\mathbf X)^{-1}\\mathbf X\'\\by$ 失效（c10）→ ridge 加 $\\lambda\\mathbf I$ 修好（c16）'],
        ['$\\mathbf X\'\\mathbf X$ 是 PSD', '平方损失是凸的，有全局最小（c10、c13）'],
        ['Gram 矩阵 PSD', '判断一个函数是不是合法 kernel（c30、往年 kernel 证明题 T8）'],
        ['PD ⇒ 特征值 > 0 ⇒ 可逆', '$\\mathbf X\'\\mathbf X+\\lambda\\mathbf I$ 对 $\\lambda>0$ 总是 PD（c16）'],
      ] },
    ],
    intuition: [
      T`**矩阵 = 一个空间变换。** 把单位圆上每个点 $\bv$ 变成 $\mathbf A\bv$，单位圆会变成一个椭圆（对称矩阵）。椭圆的两个主轴方向就是特征向量，主轴半长就是 $|\lambda|$。`,
      T`**PSD = 永不把向量"翻到背后"。** $\bv'\mathbf A\bv=\bv\cdot(\mathbf A\bv)$ 是"原向量和变换后向量"的点积。PSD 意味着任何 $\bv$ 变换后都不会和原方向夹角超过 90°。`,
      T`**零特征值 = 压扁一个维度。** 若 $\lambda=0$，那个方向被压成 0，信息丢失，自然无法"逆回去"——所以不可逆。`,
      { t: 'think', q: '为什么 PD 矩阵一定可逆？试着用定义说明。', a: T`如果不可逆，就存在 $\bv\ne\mathbf 0$ 使 $\mathbf A\bv=\mathbf 0$，于是 $\bv'\mathbf A\bv=0$，和 PD 要求的 $>0$ 矛盾。` },
    ],
    math: [
      { t: 'h3', text: '2×2 对称矩阵的特征值：从定义推出来' },
      { t: 'steps', items: [
        T`定义 $\mathbf A\bv=\lambda\bv$。右边写成 $\lambda\mathbf I\bv$（$\mathbf I$ 是单位矩阵，$\mathbf I\bv=\bv$），移项得 $(\mathbf A-\lambda\mathbf I)\bv=\mathbf 0$。`,
        T`我们要的是 $\bv\ne\mathbf 0$。如果 $\mathbf A-\lambda\mathbf I$ 可逆，两边乘它的逆就得到 $\bv=\mathbf 0$——所以它必须**不可逆**，即 $\det(\mathbf A-\lambda\mathbf I)=0$。`,
        T`2×2 行列式 $\det\begin{bmatrix}p&q\\r&s\end{bmatrix}=ps-qr$。对 $\mathbf A=\begin{bmatrix}a&b\\b&d\end{bmatrix}$：$(a-\lambda)(d-\lambda)-b^2=0$，展开就是下面的一元二次方程，用求根公式解出两个 $\lambda$。`,
      ] },
      { t: 'math', tex: T`\lambda^2-(a+d)\lambda+(ad-b^2)=0\ \Rightarrow\ \lambda_{1,2}=\frac{a+d}{2}\pm\sqrt{\Big(\frac{a-d}{2}\Big)^2+b^2}` },
      T`两个速查：$\lambda_1+\lambda_2=\mathrm{tr}(\mathbf A)=a+d$（[[trace]]，迹 = 对角线之和），$\lambda_1\lambda_2=\det\mathbf A=ad-b^2$（[[determinant]]）。所以 2×2 对称矩阵 PD ⇔ $a>0$ 且 $\det>0$。`,
      { t: 'h3', text: '$\\mathbf X\'\\mathbf X$ 是 PSD（L01 p42，要会写）' },
      { t: 'math', tex: T`\bv'(\mathbf X'\mathbf X)\bv=(\mathbf X\bv)'(\mathbf X\bv)=\|\mathbf X\bv\|^2\ge0` },
      T`另外 $(\mathbf X'\mathbf X)'=\mathbf X'(\mathbf X')'=\mathbf X'\mathbf X$，所以它是**对称**的（PSD 的定义要求对称）。第一个等号用的是转置规则 $(\mathbf X\bv)'=\bv'\mathbf X'$（"乘积的转置 = 各自转置、顺序反过来"）；第二个等号是 c03 的 $\bu'\bu=\|\bu\|^2$，这里 $\bu=\mathbf X\bv$ 是一个向量。`,
      T`而且只有当 $\mathbf X\bv=\mathbf 0$ 对某个 $\bv\ne\mathbf 0$ 成立时才会等于 0——这正是"$\mathbf X$ 的列线性相关"。所以：**列线性无关 ⇔ $\mathbf X'\mathbf X$ 是 PD ⇔ 可逆**。`,
      T`L01 p41 还说：**对称矩阵的特征值都是实数**；**方阵**列线性相关 ⇒ **[[rank deficient]]**（秩亏）、0 是特征值、不可逆。数据矩阵 $\mathbf X$ 通常不是方阵，要说的是：$\mathbf X$ 列相关 ⇒ $\mathbf X'\mathbf X$ 有零特征值、不可逆。`,
    ],
    fx: [
      {
        title: 'PSD 的定义', tex: T`\htmlClass{fx-p1}{\bv'}\,\htmlClass{fx-p2}{\mathbf A}\,\htmlClass{fx-p1}{\bv}\ \htmlClass{fx-p3}{\ge0}\quad\htmlClass{fx-p4}{\forall\bv}`,
        parts: [
          { label: "v' … v", note: '"二次型" quadratic form：把向量 $\\bv$ 代进去得到一个数，$\\sum_{i,j}v_iA_{ij}v_j$。' },
          { label: 'A', note: '对称方阵（kernel 里是 Gram 矩阵 $K_{ij}=k(\\bx_i,\\bx_j)$）。' },
          { label: '≥ 0', note: '半正定允许等于 0；正定要求严格 > 0（$\\bv\\ne\\mathbf 0$）。' },
          { label: '∀v', note: '必须对**所有**向量成立。要证明"不是 PSD"，只需找**一个**反例 $\\bv$。' },
        ],
      },
    ],
    example: [
      { t: 'h3', text: '例 1：PD' },
      T`$\mathbf A=\begin{bmatrix}2&1\\1&2\end{bmatrix}$：$\lambda=\frac{4}{2}\pm\sqrt{0+1}=3,1$。特征向量：$\lambda=3$ 对应 $(1,1)'$（验算 $\mathbf A(1,1)'=(3,3)'$ ✓），$\lambda=1$ 对应 $(1,-1)'$（$\mathbf A(1,-1)'=(1,-1)'$ ✓）。都 > 0 ⇒ **PD**。`,
      { t: 'h3', text: '例 2：PSD 但不可逆' },
      T`$\mathbf A=\begin{bmatrix}1&1\\1&1\end{bmatrix}$：$\lambda=1\pm1=2,0$。有 0 ⇒ PSD 但不是 PD；两列相同（线性相关）⇒ $\det=0$，不可逆。`,
      { t: 'h3', text: '例 3：不是 PSD（找反例）' },
      T`$\mathbf A=\begin{bmatrix}1&2\\2&1\end{bmatrix}$：$\lambda=1\pm2=3,-1$。取 $\bv=(1,-1)'$：$\bv'\mathbf A\bv=1-2-2+1=-2<0$。一个反例就够了。`,
      { t: 'fade', title: '分步练习：2×2 特征值', plan: [T`中点 $\frac{a+d}2$、半径 $\sqrt{(\frac{a-d}2)^2+b^2}$`, T`$\lambda=$ 中点 ± 半径，判 PD/PSD`], items: [
        { md: T`$\mathbf A=\begin{bmatrix}4&1\\1&4\end{bmatrix}$`, steps: [
          { md: T`$\frac{a+d}{2}=4$，$\sqrt{(\frac{a-d}{2})^2+b^2}=\sqrt{0+1}=1$` },
          { md: T`$\lambda=4\pm1=5,\,3$，都 > 0 ⇒ PD` },
        ] },
        { md: T`$\mathbf A=\begin{bmatrix}3&2\\2&0\end{bmatrix}$：$\frac{a+d}{2}=1.5$，$\sqrt{1.5^2+2^2}=\sqrt{6.25}=2.5$。`, steps: [
          { sg: 2, ask: '较大特征值 = ?', answer: 4, show: '$1.5+2.5=4$' },
          { sg: 2, ask: '较小特征值 = ?', answer: -1, show: '$1.5-2.5=-1$ ⇒ 不定，不是 PSD' },
        ] },
        { md: T`$\mathbf A=\begin{bmatrix}2&-2\\-2&5\end{bmatrix}$`, steps: [
          { sg: 2, ask: '较大特征值 = ?', answer: 6, show: T`$\frac{7}{2}+\sqrt{1.5^2+4}=3.5+2.5=6$` },
          { sg: 2, ask: '较小特征值 = ?', answer: 1, show: '$3.5-2.5=1$ ⇒ PD（验算：tr = 7 = 6+1，det = 10−4 = 6 = 6×1）' },
        ] },
      ] },
    ],
    viz: [
      { id: 'eigen-2d', how: '虚线圆是单位圆，绿色椭圆是它经过 $\\mathbf A$ 变换后的样子。绿箭头是 $\\lambda_1\\bv_1$、$\\lambda_2\\bv_2$（特征方向被拉伸后的结果）。蓝箭头是探针 $\\bv$，红箭头是 $\\mathbf A\\bv$——拖动角度，看红蓝两箭头一般**不共线**，只有转到特征方向时才共线。',
        try: '① 选"[[1,2],[2,1]]"，把探针转到 315°（方向 $(1,-1)$），$\\bv\'\\mathbf A\\bv$ 变负，红箭头指向反方向——不是 PSD。② 选"[[1,1],[1,1]]"，椭圆被压成线段（零特征值，不可逆）。③ 选 $\\mathbf X\'\\mathbf X$，怎么转探针 $\\bv\'\\mathbf A\\bv$ 都 ≥ 0。' },
    ],
    compare: [
      { t: 'table', head: ['', 'PD', 'PSD', '不定 (indefinite)'], rows: [
        ['$\\bv\'\\mathbf A\\bv$', '$>0$（$\\bv\\ne0$）', '$\\ge0$', '可正可负'],
        ['特征值', '全 > 0', '全 ≥ 0', '有正有负'],
        ['可逆？', '是', '不一定（有 0 特征值就不可逆）', '不一定'],
        ['例子', '$\\mathbf I$、$\\mathbf X\'\\mathbf X+\\lambda\\mathbf I$', '$\\mathbf X\'\\mathbf X$、合法 kernel 矩阵', '$\\begin{bmatrix}1&2\\\\2&1\\end{bmatrix}$'],
      ] },
    ],
    pitfalls: [
      ['所有元素非负 ⇒ PSD', '错。$\\begin{bmatrix}1&2\\\\2&1\\end{bmatrix}$ 元素全正，但有负特征值。'],
      ['PSD ⇒ 可逆', 'PSD 允许零特征值，零特征值就不可逆。PD 才保证可逆。'],
      ['证明 PSD 只需验证几个 $\\bv$', '需要对**所有** $\\bv$ 成立（一般用代数证明，如 $\\|\\mathbf X\\bv\\|^2\\ge0$）。证明**不是** PSD 才只需一个反例。'],
      ['特征向量唯一', '可以任意缩放（$\\bv$ 和 $2\\bv$ 都是）；重复特征值时方向也不唯一。'],
    ],
    quiz: [
      { type: 'num', q: '$\\mathbf A=\\begin{bmatrix}4&0\\\\0&-1\\end{bmatrix}$ 的较小特征值是？', answer: -1, explain: '对角矩阵的特征值就是对角元：4 和 −1。' },
      { type: 'mc', q: '$\\begin{bmatrix}3&1\\\\1&3\\end{bmatrix}$ 是：', options: ['PD', 'PSD 但不是 PD', '不定', '不对称所以无法判断'], answer: 0, explain: T`判断 PD（positive definite，正定）就看特征值是否全部 $>0$。对 $\begin{bmatrix}a&b\\b&d\end{bmatrix}$ 有 $\lambda=\frac{a+d}2\pm\sqrt{(\frac{a-d}2)^2+b^2}$；这里 $a=d=3$、$b=1$，所以 $\lambda=3\pm\sqrt{0+1}=3\pm1$，即 4 和 2，全为正，是 PD。也可以用速查：2×2 对称矩阵 PD ⇔ $a>0$ 且 $\det>0$；这里 $a=3>0$，$\det=3\times3-1\times1=8>0$。"PSD 但不是 PD"要求**有一个特征值恰好等于 0**，这里没有；矩阵的两个非对角元都是 1，是对称的，所以也能判断。` },
      { type: 'mc', q: '数据矩阵 $\\mathbf X$ 有两列完全相同。下面哪项**一定**成立？', options: ['$\\mathbf X\'\\mathbf X$ 是 PD', '$\\mathbf X\'\\mathbf X$ 不可逆', '$\\mathbf X\'\\mathbf X$ 有负特征值', '$\\mathbf X$ 是方阵'], answer: 1, explain: '列线性相关 ⇒ 存在 $\\bv\\ne0$ 使 $\\mathbf X\\bv=0$ ⇒ $\\mathbf X\'\\mathbf X$ 有零特征值 ⇒ 不可逆。它仍是 PSD，不会有负特征值。' },
      { type: 'show', q: '证明对任意矩阵 $\\mathbf X$，$\\mathbf X\'\\mathbf X$ 是 PSD。', answer: T`For any vector $\mathbf v$: $\mathbf v'\mathbf X'\mathbf X\mathbf v=(\mathbf X\mathbf v)'(\mathbf X\mathbf v)=\|\mathbf X\mathbf v\|^2\ge0$. Also $\mathbf X'\mathbf X$ is symmetric since $(\mathbf X'\mathbf X)'=\mathbf X'\mathbf X$. Hence it is positive semidefinite.` },
    ],
  });

  /* =====================================================================
   * c05 · 估计量：bias、variance、consistency（L02 p3–p9）
   * ===================================================================== */
  add({
    id: 'c05', week: 'W1', lec: 'L02', pages: 'L02 p3–p9', star: 2,
    keyEn: [
      T`Frequentist view: the parameter $\theta$ is a fixed unknown constant and the data are i.i.d. random, so an estimator $\hat\theta(X_1,\dots,X_n)$ is a random variable.`,
      T`Bias $B_\theta(\hat\theta)=E_\theta[\hat\theta]-\theta$ (unbiased if 0); variance $\mathrm{Var}_\theta(\hat\theta)=E_\theta[(\hat\theta-E_\theta[\hat\theta])^2]$, its spread over repeated samples.`,
      T`Consistent: $\hat\theta\to\theta$ in probability as $n\to\infty$; asymptotically efficient: its variance reaches the smallest possible value as $n\to\infty$.`,
      T`Sample mean: $E[\bar X]=\theta$ and $\mathrm{Var}(\bar X)=\sigma^2/n$, so it is consistent. Unbiased and consistent do not imply each other ($X_1$ is unbiased but not consistent).`,
    ],
    keyZh: [
      T`频率学派（frequentist）：参数 $\theta$ 是固定但未知的常数，随机的是 i.i.d. 抽出来的数据；估计量（estimator）是数据的函数，所以它也是随机变量。`,
      T`偏差（bias）= 估计量在所有可能数据集上的平均 − 真值，为 0 叫无偏（unbiased）；方差（variance）= 换一批数据时，估计量围绕自己的平均值晃动多大。`,
      T`一致（consistent）：样本无限多时估计量收敛到真值；渐近有效（asymptotically efficient）：样本无限多时，它的方差达到所有估计量里可能的最小值。`,
      T`样本均值无偏，方差 $\sigma^2/n$ 随 $n$ 变小，所以一致。无偏和一致互不蕴含：只用第一个样本 $X_1$ 也无偏，但方差不随 $n$ 下降，所以不一致。`,
    ],
    examQ: [
      { src: '2022 S1 Q1(g)', q: T`Why are both maximum-likelihood estimators and maximum a posteriori estimators both asymptotically efficient?`,
        a: T`Asymptotic efficiency: as $n\to\infty$ the estimator's variance converges to the smallest possible variance of any estimator; the MLE has this property (under standard regularity conditions). The MAP maximises $\sum_{i=1}^n\log p(x_i\mid\theta)+\log p(\theta)$: the log-likelihood grows with $n$ while the log prior stays fixed, so the prior's influence vanishes, MAP $\to$ MLE, and MAP inherits the MLE's asymptotic efficiency (if the prior is non-zero at the true $\theta$).`,
        qzh: T`为什么最大似然估计量（maximum-likelihood estimator）和最大后验估计量（maximum a posteriori estimator）都是渐近有效的（asymptotically efficient）？`,
        azh: T`渐近有效：样本数 $n\to\infty$ 时，估计量的方差收敛到所有估计量里可能的最小方差；MLE 在常规条件（regularity conditions）下具有这个性质。MAP 最大化 $\sum_{i=1}^n\log p(x_i\mid\theta)+\log p(\theta)$：对数似然随 $n$ 增长，对数先验固定不变，所以先验的影响逐渐消失，MAP 趋于 MLE，从而继承了 MLE 的渐近有效性（前提是先验在真实 $\theta$ 处不为 0）。` },
    ],
    title: '估计量：bias、variance、consistency', en: 'Estimators: bias, variance, consistency, efficiency',
    summary: '频率学派的核心想法：参数 $\\theta$ 是一个固定但未知的常数；用数据算出的估计 $\\hat\\theta$ 才是随机的。好估计量 = 平均起来对（bias 小）+ 不乱跳（variance 小）。',
    prereq: ['c01'],
    symbols: [
      [T`$\theta$`, T`真实参数（固定常数）`],
      [T`$\hat\theta$`, T`戴帽子 = 用数据算出的估计`],
      [T`$\bar X$`, T`样本均值 $\frac1n\sum_iX_i$（本站始终表示**平均**）`],
      [T`$X_i\overset{iid}{\sim}\mathcal N(\theta,\sigma^2)$`, T`$X_i$ 独立同分布，都服从均值 $\theta$、方差 $\sigma^2$ 的 Gaussian`],
      [T`$E_\theta[\cdot]$`, T`假设真参数是 $\theta$ 时，对所有可能数据集求期望`],
      [T`$\mathrm{Var}(cX)=c^2\mathrm{Var}(X)$`, T`常数提出来要平方（c01）`],
      [T`$n\to\infty$`, T`样本量趋于无穷`],
    ],
    goals: [
      '说清 frequentist 视角：参数固定、数据随机、所以估计量随机',
      '写出 bias、variance 的定义并解释 L02 p5–p8 的模拟图',
      '证明样本均值无偏、方差 $\\sigma^2/n$',
      '区分 unbiased 和 consistent，各举一个"是 A 不是 B"的例子',
    ],
    types: [],
    what: [
      T`**Frequentist statistics（频率学派）**：未知参数 $\theta$ 有一个**固定的真值**，只是我们不知道（L02 p3）。数据 $X_1,\dots,X_n$ 是从 $p_\theta$ 中 **[[i.i.d.]]**（independent and identically distributed，独立同分布）抽出来的。`,
      T`**[[Estimator]]（估计量）** $\hat\theta(X_1,\dots,X_n)$：任何一个"输入数据、输出一个猜测"的函数（L02 p4）。例如样本均值 $\hat\theta=\frac1n\sum_iX_i$。`,
      T`关键转念：**数据是随机的 ⇒ 估计量也是随机变量**。重新抽一批数据，$\hat\theta$ 就变了。所以可以问它的期望和方差：`,
      { t: 'ul', items: [
        T`**[[Bias]]（偏差）**：$B_\theta(\hat\theta)=E_\theta[\hat\theta]-\theta$（下标 $\theta$：假设真值是 $\theta$，对所有可能抽到的数据集求平均）。平均起来偏离真值多少（L02 p5）。$B=0$ 叫 **unbiased**。`,
        T`**Variance**：$\mathrm{Var}_\theta(\hat\theta)=E_\theta\big[(\hat\theta-E_\theta[\hat\theta])^2\big]$。换一批数据它晃动多大（L02 p7）。`,
        T`**Consistency**：$n\to\infty$ 时 $\hat\theta\to\theta$（[[in probability|Convergence in probability]]）（L02 p9）。数据无限多时能猜对。`,
        T`**[[Asymptotic efficiency]]**：$n\to\infty$ 时方差达到所有估计量里可能的最小值（L02 p9）。`,
      ] },
    ],
    why: [
      T`ML 的"训练"就是在构造估计量：线性回归的 $\hat\bw$、logistic 的 $\hat\bw$、神经网络的权重，全都是"数据的函数"。评价它们好不好，就是问 bias 和 variance。`,
      T`这一章是两个大考点的地基：`,
      { t: 'ul', items: [
        T`c07：平方误差 = $\text{bias}^2+\text{variance}$（L02 p19）。`,
        T`c19：模型的 **bias–variance trade-off**（L05 p29–p40，往年简答高频）——简单模型 bias 高、复杂模型 variance 高。`,
      ] },
    ],
    intuition: [
      T`**射箭比喻。** 真值 $\theta$ 是靶心。每抽一批数据就射一箭（得到一个 $\hat\theta$）。**bias** = 箭的平均落点离靶心多远；**variance** = 箭有多分散。可以"准而散"（无偏高方差），也可以"偏而紧"（有偏低方差）。`,
      T`**L02 p5–p8 的实验正是这样做的**：从 $\mathcal N(\theta=0,\sigma^2=1)$ 抽 20 个点算一次样本均值，重复 40 次，得到 40 个 $\hat\theta_i$（散布在 $-0.4$ 到 $0.4$）。它们的平均（红三角）几乎就在 0 ⇒ 无偏；它们平方的平均接近 $\sigma^2/20=0.05$ ⇒ 方差。`,
      { t: 'fig', src: 'reference/pages/L02/p06.jpg', caption: 'L02 p6：40 次重复的样本均值（点），红三角 = 它们的平均，黑三角 = 真值 0', w: 560 },
    ],
    math: [
      { t: 'h3', text: '样本均值无偏（只用 linearity）' },
      { t: 'math', tex: T`E[\bar X]=E\Big[\frac1n\sum_{i=1}^nX_i\Big]=\frac1n\sum_{i=1}^nE[X_i]=\frac1n\cdot n\theta=\theta\ \Rightarrow\ B(\bar X)=0` },
      { t: 'h3', text: '样本均值的方差（用到独立）' },
      { t: 'math', tex: T`\mathrm{Var}(\bar X)=\frac1{n^2}\mathrm{Var}\Big(\sum_iX_i\Big)\overset{\text{indep.}}{=}\frac1{n^2}\sum_i\mathrm{Var}(X_i)=\frac{n\sigma^2}{n^2}=\frac{\sigma^2}{n}` },
      T`方差随 $n$ 以 $1/n$ 下降，bias 始终为 0 ⇒ 样本均值是 **consistent** 的。`,
      { t: 'think', q: T`上面第二行推导里，"独立"用在哪一步？如果 $n$ 个样本其实是同一个数抄了 $n$ 遍（完全相关），$\mathrm{Var}(\bar X)$ 是多少？`, a: T`用在 $\mathrm{Var}(\sum X_i)=\sum\mathrm{Var}(X_i)$（独立时交叉的协方差项为 0）。如果全部相同，$\bar X=X_1$，方差还是 $\sigma^2$——再多"数据"也没用。这就是为什么 i.i.d. 假设重要。` },
      { t: 'story', title: '大数定律', md: 'Jacob Bernoulli 在遗著 *Ars Conjectandi*（猜测的艺术，1713 年出版）里首次严格证明：重复试验时，成功的**频率**会依概率收敛到真实概率 $p$。样本均值的 consistency 是同一思想的推广（一般情形由后来的大数定律给出）。' },
      { t: 'errata', md: T`L02 p9 写"we could calculate its exact bias (zero) and variance ($\sigma^2$)"。准确地说，样本均值的方差是 $\sigma^2/n$（p8 的模拟结果 $1/20=0.05$ 也是这么来的）。考试按 $\sigma^2/n$ 写。` },
      T`L02 p9 还提醒：对一般模型，**精确**的有限样本 bias/variance 很少能算出来，但 **asymptotic**（$n\to\infty$）性质常常成立——例如 MLE 在常规条件下 consistent 且 asymptotically efficient。`,
    ],
    fx: [
      {
        title: 'Bias 与 variance', tex: T`\htmlClass{fx-p1}{B_\theta(\hat\theta)}=\htmlClass{fx-p2}{E_\theta[\hat\theta(X_1,\dots,X_n)]}-\htmlClass{fx-p3}{\theta}\qquad \htmlClass{fx-p4}{\mathrm{Var}_\theta(\hat\theta)}=E_\theta\big[(\hat\theta-E_\theta[\hat\theta])^2\big]`,
        parts: [
          { label: 'bias', note: '系统性偏差：平均起来高估（>0）还是低估（<0）。' },
          { label: 'E_θ[θ̂]', note: '下标 $\\theta$ 表示"数据从参数为 $\\theta$ 的分布里抽"。期望是对**所有可能的数据集**取的——想象无数次重新抽样。' },
          { label: 'θ', note: '真值，固定常数（频率学派）。' },
          { label: 'variance', note: '估计量围绕**自己的**平均值的分散程度。注意中心是 $E[\\hat\\theta]$ 而不是 $\\theta$。' },
        ],
      },
    ],
    example: [
      T`数据 $X_1,\dots,X_n\overset{iid}{\sim}\mathcal N(\theta,1)$。四个估计量对比：`,
      { t: 'table', head: ['估计量', 'bias', 'variance', 'unbiased?', 'consistent?'], rows: [
        ['$\\bar X$', '0', '$1/n$', '✓', '✓'],
        ['$X_1$（只用第一个）', '0', '1', '✓', '✗（方差不随 $n$ 减小）'],
        ['$0.5\\bar X$', '$-0.5\\theta$', '$0.25/n$', '✗（除非 $\\theta=0$）', '✗（收敛到 $\\theta/2$）'],
        ['$\\bar X+1/n$', '$1/n$', '$1/n$', '✗', '✓（bias → 0）'],
      ] },
      T`结论：**unbiased 和 consistent 互不蕴含**。$X_1$ 无偏但不一致；$\bar X+1/n$ 有偏但一致。`,
      T`数值：$n=25$，$\sigma^2=4$，则 $\mathrm{Var}(\bar X)=4/25=0.16$，标准差 0.4。想把标准差减半需要 $n=100$（4 倍数据）。`,
      { t: 'fade', title: '分步练习：估计量的 bias / variance', plan: [T`bias $=E[\hat\theta]-\theta$`, T`variance（常数平方后提出）`, T`MSE $=$ bias² + variance`], items: [
        { md: T`$X_i\sim\mathcal N(\theta,16)$，$n=64$，用 $\bar X$。`, steps: [
          { sg: 1, md: 'bias = 0（样本均值无偏）' },
          { sg: 2, md: T`$\mathrm{Var}(\bar X)=16/64=0.25$，标准差 0.5` },
        ] },
        { md: T`$\sigma^2=4$，只用前两个样本：$\hat\theta=(X_1+X_2)/2$。bias = 0。`, steps: [
          { sg: 2, ask: 'variance = ?', answer: 2, show: T`$\frac14(4+4)=2$` },
        ] },
        { md: T`$\hat\theta=2\bar X$，真值 $\theta=3$，$\sigma^2=9$，$n=9$。`, steps: [
          { ask: 'bias = ?', answer: 3, show: T`$E[2\bar X]=6$，$6-3=3$` },
          { ask: 'variance = ?', answer: 4, show: T`$4\cdot\frac{9}{9}=4$（常数 2 被平方）` },
          { ask: 'MSE = bias² + variance = ?', answer: 13, show: '$9+4=13$（MSE 在第 7 章）' },
        ] },
      ] },
    ],
    viz: [
      { id: 'estimator-sim', opts: { theta: 0, n: 20, reps: 40, est: 'mean' }, how: '每个点是一次"抽 $n$ 个数据→算一次估计"的结果，横轴是第几次重复。黑虚线是真值 $\\theta$，红虚线是这些估计值的平均。两线的距离 ≈ bias，点的上下散布 ≈ variance。默认设置就是 L02 p5–p8 的实验。',
        try: '① 默认（样本均值，$n=20$）：红黑线几乎重合，模拟方差 ≈ 0.05。② 换成"只用第一个样本"：仍然无偏，但点散得多（方差 ≈ 1），把 $n$ 调大也不收窄——不一致。③ 换成"收缩 0.5×均值"，把 $\\theta$ 调到 1：红线明显低于黑线，bias ≈ −0.5。④ 回到样本均值，把 $n$ 从 5 拉到 200，看点云收窄。' },
    ],
    compare: [
      { t: 'table', head: ['', 'Frequentist（本章）', 'Bayesian（c08）'], rows: [
        ['参数 $\\theta$', '固定未知常数', '随机变量，有分布'],
        ['随机性来自', '数据（重复抽样）', '数据 + 对参数的不确定'],
        ['输出', '点估计 $\\hat\\theta$（及其 bias/variance）', '后验分布 $p(\\theta\\mid X)$'],
        ['典型方法', 'MLE（c06）、ERM（c07）', '后验、MAP、后验均值'],
      ] },
    ],
    pitfalls: [
      ['bias 是一次估计和真值的差', 'bias 是**期望**（所有可能数据集上平均）和真值的差。单次的差叫 error。'],
      ['无偏 ⇒ 好估计量', '可能方差巨大（如 $X_1$）。衡量整体好坏用 MSE = bias² + variance（c07）。'],
      ['unbiased ⇔ consistent', '互不蕴含，见上表。'],
      ['$\\mathrm{Var}(\\bar X)=\\sigma^2$', '是 $\\sigma^2/n$（L02 p9 的表述有误）。'],
      ['频率学派里 $\\theta$ 有分布', '频率学派里 $\\theta$ 是常数；有分布的是 $\\hat\\theta$。'],
    ],
    quiz: [
      { type: 'num', q: '$X_i\\overset{iid}{\\sim}\\mathcal N(\\theta,9)$，$n=36$。$\\mathrm{Var}(\\bar X)$ 是？', answer: 0.25, explain: T`要算的是样本均值 $\bar X$ 的方差，公式是 $\mathrm{Var}(\bar X)=\sigma^2/n$：$n$ 个独立样本取平均，方差缩小为单个样本的 $1/n$。题目 $\mathcal N(\theta,9)$ 的第二个参数就是方差，所以 $\sigma^2=9$；样本数 $n=36$。$\mathrm{Var}(\bar X)=9/36=0.25$。**$\mathcal N(\theta,9)$ 里的 9 已经是方差，不要再平方成 81**；也不要除以 $\sqrt n=6$，那是在算标准差 $\sigma/\sqrt n=3/6=0.5$。` },
      { type: 'num', q: '估计量 $\\hat\\theta=\\frac{n}{n+1}\\bar X$，真值 $\\theta=2$，$n=9$。bias 是多少？', answer: -0.2, explain: '$E[\\hat\\theta]=\\frac{9}{10}\\times2=1.8$；bias $=1.8-2=-0.2$。它有偏但 consistent（$n\\to\\infty$ 时系数 → 1）。' },
      { type: 'mc', q: '以下哪个估计量 unbiased 但**不** consistent？', options: ['$\\bar X$', '$X_1$', '$\\bar X+1/n$', '$0.5\\bar X$'], answer: 1, explain: '$E[X_1]=\\theta$ 无偏，但方差恒为 $\\sigma^2$，不随 $n$ 下降。' },
      { type: 'mc', q: '在 frequentist 统计里，哪个是随机变量？', options: ['$\\theta$', '$\\hat\\theta$', '两者都是', '两者都不是'], answer: 1, explain: '$\\theta$ 是固定常数；$\\hat\\theta$ 是数据的函数，数据随机所以它随机。' },
      { type: 'show', q: '用英文解释 estimator bias 和 variance。', answer: T`The bias of an estimator is the difference between its expected value (over repeated samples of the data) and the true parameter, $E_\theta[\hat\theta]-\theta$. Its variance measures how much the estimate fluctuates around its own mean across different samples, $E_\theta[(\hat\theta-E_\theta[\hat\theta])^2]$.` },
    ],
  });

  /* =====================================================================
   * c06 · 最大似然 MLE（L02 p10–p15）
   * ===================================================================== */
  add({
    id: 'c06', week: 'W1', lec: 'L02', pages: 'L02 p10–p15', star: 3,
    keyEn: [
      T`MLE: $\hat\theta\in\argmax_{\theta\in\Theta}\prod_{i=1}^np_\theta(x_i)$, the parameter under which the observed i.i.d. data are most probable.`,
      T`The likelihood is $p(x\mid\theta)$ viewed as a function of $\theta$ with the data fixed; it is not a probability distribution over $\theta$.`,
      T`Recipe: write the likelihood, take the log (monotone so the argmax is unchanged; products become sums; avoids underflow), set $dL/d\theta=0$ and solve, or use gradient ascent (descent on the negative log-likelihood) if no closed form.`,
      T`Bernoulli: $\hat\theta=k/n$ (a CPT entry's MLE is the conditional count ratio); Gaussian: $\hat\mu=\bar x$, $\hat\sigma^2=\frac1n\sum_i(x_i-\bar x)^2$, which is biased but consistent.`,
    ],
    keyZh: [
      T`MLE（最大似然估计）：在允许的参数范围里，挑让观测到的 i.i.d. 数据出现概率最大的那个 $\theta$；整批数据的概率 = 各个样本概率连乘。`,
      T`似然（likelihood）和概率是同一个式子，只是把数据固定、看成 $\theta$ 的函数；它对 $\theta$ 积分不一定为 1，所以不是 $\theta$ 的分布。`,
      T`固定步骤：写似然 → 取 log（单调，最优点不变；连乘变连加；防止下溢 underflow）→ 求导令为 0 解出参数；解不出闭式解就对负对数似然做梯度下降。`,
      T`Bernoulli 的 MLE = 成功次数 ÷ 总次数（CPT 的 MLE 就是条件计数比例）；Gaussian 的均值 MLE 是样本均值，方差 MLE 除以 $n$，有偏（偏小）但一致。`,
    ],
    examQ: [
      { src: '2016 S2 Q1.3', q: T`Name two methods (considered in the class) that can be used to find maximum likelihood estimate of parameters of a probabilistic model.`,
        a: T`(1) Analytic (closed-form) solution: set the derivative of the log-likelihood to zero and solve, e.g. $\hat\theta=k/n$ for a Bernoulli, or the normal equations for linear regression. (2) Iterative numerical optimisation of the negative log-likelihood when there is no closed form: gradient descent / SGD or Newton–Raphson, e.g. for logistic regression.`,
        qzh: T`说出两种（课上讲过的）可以用来求概率模型参数的最大似然估计（maximum likelihood estimate）的方法。（相近的预测题见 [T13](#/T13/predicted)。）`,
        azh: T`(1) 解析（闭式）解（analytic / closed-form solution）：令对数似然的导数为 0 并解出参数，例如 Bernoulli 的 $\hat\theta=k/n$、线性回归的正规方程（normal equations）。(2) 没有闭式解时，对负对数似然做迭代数值优化（iterative numerical optimisation）：梯度下降（gradient descent）/ SGD 或 Newton–Raphson，例如 logistic 回归。` },
    ],
    title: '最大似然 MLE', en: 'Maximum-likelihood estimation',
    summary: '"最好的参数 = 让观测数据最可能出现的参数。" 固定四步：写似然（相乘）→ 取 log（变相加）→ 求导 = 0 → 解出参数。线性回归（c11）、logistic（c15）、CPT 计数（c53）都是 MLE。',
    prereq: ['c01', 'c05'],
    symbols: [
      [T`$\prod_{i=1}^n$`, T`连乘：$a_1\times a_2\times\cdots\times a_n$`],
      [T`$p_\theta(x)$`, T`参数为 $\theta$ 时 $x$ 的概率（密度）`],
      [T`$\Theta$`, T`参数允许取值的范围（parameter space），如 $[0,1]$`],
      [T`$\argmax_\theta f$`, T`让 $f$ 最大的那个 $\theta$`],
      [T`$\log$`, T`自然对数；$\log(ab)=\log a+\log b$，$\log a^k=k\log a$`],
      [T`$\frac{dL}{d\theta}$`, T`$L$ 对 $\theta$ 的导数（斜率）`],
      [T`$k$`, T`成功（正面）的次数 $\sum_ix_i$`],
      [T`$\exp(z)=e^z$`, T`指数函数；$\log$ 的反函数`],
    ],
    goals: [
      '区分 probability 和 likelihood（同一个式子，不同的变量）',
      '独立推出 Bernoulli 的 MLE $\\hat\\theta=k/n$ 和 Gaussian 均值的 MLE $\\hat\\mu=\\bar x$',
      '解释为什么要取 log',
      '把同样的四步用在没见过的分布上',
    ],
    types: ['T07', 'T09'],
    what: [
      { t: 'h3', text: '① MLE 想回答什么问题' },
      T`手上有一批数据，假设它来自某个分布 $p_\theta$，但参数 $\theta$ 不知道。**该猜哪个 $\theta$？** MLE 的回答：**挑让这批数据"最可能出现"的那个 $\theta$。**`,
      T`例：一枚硬币抛 10 次，7 次正面（$\theta$ = 正面概率）。把几个候选 $\theta$ 代进去，算"恰好得到这串结果"的概率 $\theta^7(1-\theta)^3$：`,
      { t: 'table', cls: 'compact', head: ['候选 $\\theta$', '0.1', '0.3', '0.5', '0.7', '0.9'], rows: [
        ['$\\theta^7(1-\\theta)^3$', '$7\\times10^{-8}$', '$7.5\\times10^{-5}$', '$9.8\\times10^{-4}$', '$\\mathbf{2.2\\times10^{-3}}$', '$4.8\\times10^{-4}$'],
      ] },
      T`$\theta=0.7$ 让这批数据最可能出现，所以 MLE 猜 $\hat\theta=0.7$。下面把这个想法写成公式，再推出一般的答案 $k/n$。`,
      { t: 'h3', text: '② 定义（L02 p10）' },
      { t: 'math', tex: T`\hat\theta(x_1,\dots,x_n)\in\argmax_{\theta\in\Theta}\ \prod_{i=1}^n p_\theta(x_i)` },
      T`（$\prod$ 是连乘，$\argmax$ 是"让它最大的那个 $\theta$"，$\Theta$ 是 $\theta$ 允许的取值范围，见上面的符号速查。）$\prod_i p_\theta(x_i)$ 叫 **[[likelihood]]（似然）**：在参数 $\theta$ 下，整批数据出现的概率（数据 i.i.d.，所以是各个样本概率的乘积）。`,
      T`**Likelihood 和 probability 是同一个式子** $p(x\mid\theta)$，区别在于把谁当变量：固定 $\theta$、看 $x$ 的函数是 probability（对 $x$ 求和为 1）；固定观测到的数据、看 $\theta$ 的函数是 likelihood（对 $\theta$ 积分不一定为 1，所以它不是 $\theta$ 的分布）。上面那张表就是一个 likelihood：数据固定（7 正 3 反），$\theta$ 在变。`,
      { t: 'h3', text: '③ Bernoulli：推出 $\\hat\\theta=k/n$（L02 p11–p12）' },
      T`每次抛硬币：$p_\theta(x)=\theta^x(1-\theta)^{1-x}$，$x\in\{0,1\}$（$x=1$ 时是 $\theta$，$x=0$ 时是 $1-\theta$）。令 $k=\sum_ix_i$（正面次数），取 log（原因见 ⑤）：`,
      { t: 'math', tex: T`L(\theta)=\sum_{i=1}^n\big[x_i\log\theta+(1-x_i)\log(1-\theta)\big]=k\log\theta+(n-k)\log(1-\theta)` },
      { t: 'math', tex: T`\frac{dL}{d\theta}=\frac{k}{\theta}-\frac{n-k}{1-\theta}=0\ \Rightarrow\ k(1-\theta)=(n-k)\theta\ \Rightarrow\ \hat\theta=\frac kn` },
      T`10 次 7 正面：$\hat\theta=7/10=0.7$，和 ① 的表一致。（二阶导 $-\frac{k}{\theta^2}-\frac{n-k}{(1-\theta)^2}<0$，确实是最大值。）`,
      { t: 'warn', title: '课件记号', md: T`L02 p12 写 "$\bar X=\sum_{i=1}^n x_i$"，这里 $\bar X$ 指的是**和**（正面次数），不是平均。所以课件的 $\hat\theta=\bar X/n$ 和这里的 $k/n$ 是一回事。` },
      { t: 'h3', text: '④ Gaussian 均值：推出 $\\hat\\theta=\\bar x$（L02 p13）' },
      T`硬币的观测只有 0/1。如果观测是连续的实数（身高、温度），就不能再用 $\theta^x(1-\theta)^{1-x}$。课件下一个例子假设数据来自钟形的 Gaussian，方差已知为 1，只估中心——同样的四步，你会看到"最大化似然"变成了"最小化平方误差"。`,
      T`[[Gaussian]]（正态分布）是钟形曲线，$\mathcal N(\mu,\sigma^2)$ 中 $\mu$ 是中心、$\sigma^2$ 是方差。设方差已知为 1：$p_\theta(x)=\frac{1}{\sqrt{2\pi}}\exp\!\big(-\frac12(x-\theta)^2\big)$。`,
      { t: 'math', tex: T`L(\theta)=-\frac n2\log(2\pi)-\frac12\sum_i(x_i-\theta)^2,\qquad \frac{dL}{d\theta}=\sum_i(x_i-\theta)=0\ \Rightarrow\ \hat\theta=\frac1n\sum_ix_i` },
      T`求导细节：第一项是常数，导数 0；$-\frac12(x_i-\theta)^2$ 对 $\theta$ 求导用链式法则：$-\frac12\cdot2(x_i-\theta)\cdot(-1)=(x_i-\theta)$。令 $\sum_i(x_i-\theta)=0$ 即 $\sum_ix_i=n\theta$。**这一步的意义**：最大化 Gaussian 似然 ⇔ 最小化 $\sum_i(x_i-\theta)^2$（平方误差）——c11 会看到线性回归的 least squares 就是 Gaussian 噪声下的 MLE。`,
      { t: 'h3', text: '⑤ 归纳成四步（L02 p14）' },
      { t: 'steps', items: [
        T`假设数据由 $p_\theta$ 生成（选模型）。`,
        T`写出似然 $\prod_ip_\theta(x_i)$，通常取 log：$L(\theta)=\sum_i\log p_\theta(x_i)$。`,
        T`对 $\theta$ 求导，令其为 0。`,
        T`解析求解；解不出就用数值迭代（对负对数似然 $-L$ 做梯度**下降**，等价于对 $L$ 做梯度上升，第 13 章）。严谨时检查二阶导 < 0 确认是最大值。`,
      ] },
      T`**为什么取 log？**（L02 p14 问 "why?"）① log 单调递增，最大值点不变；② 连乘变连加，求导容易得多；③ 很多小于 1 的数连乘会 [[underflow]]（数值下溢成 0），连加不会。`,
    ],
    why: [
      T`MLE 是本课最通用的"从数据学参数"的方法，后面不断以新面貌出现：`,
      { t: 'table', head: ['后面的模型', '它的 MLE 长什么样'], rows: [
        ['线性回归（c11）', 'Gaussian 噪声下 MLE = 最小化平方误差（least squares）'],
        ['Logistic regression（c15）', 'Bernoulli 似然 → cross-entropy loss，无闭式解，用 GD/Newton'],
        ['Bayesian network CPT（c53、T7）', '每个条件概率的 MLE = 计数比例'],
        ['正则化（c17）', '加了先验就变成 MAP（c08）'],
      ] },
      T`往年卷 T7（CPT 的 MLE）几乎每年出现，而它就是本章 Bernoulli MLE 的推广："事件发生次数 ÷ 条件成立次数"。`,
    ],
    intuition: [
      T`**挑一个最能"解释"数据的参数。** 就是 ① 那张表的想法：每个候选 $\theta$ 都是一种"世界的样子"，看在哪种世界里你的观测最不奇怪。`,
      T`**为什么"求导 = 0"？** 光滑函数在内部最大值点导数为 0。求不出解析解时（如 logistic），就用 gradient descent 数值地找（L02 p14 "failing that, use gradient descent"）。`,
      { t: 'think', q: '抛 3 次硬币全是正面，Bernoulli 的 MLE 是多少？你觉得这个估计合理吗？', a: T`$\hat\theta=3/3=1$：MLE 断定"永远不会出反面"。数据太少时 MLE 会过度自信——c08 的 MAP 用先验来缓和这个问题。` },
      { t: 'story', title: 'likelihood 是特意和 probability 分开的', md: 'R. A. Fisher 在 1912 年提出"最大化联合密度"的准则，1921–1922 年（"On the mathematical foundations of theoretical statistics"）才把英文里本来就有的 **likelihood** 一词定为术语，用来强调：把数据固定、看参数的函数，不是参数的概率分布。这正是本章"常见误区"第一条。' },
    ],
    math: [
      { t: 'h3', text: '进一步：同时估计均值和方差' },
      { t: 'deep', title: 'L02 p13 的练习：同时估计 $\\mu$ 和 $\\sigma^2$', hint: '会推更好，考试更常考的是结论', blocks: [
        T`$p(x)=\frac{1}{\sqrt{2\pi\sigma^2}}\exp\!\big(-\frac{(x-\mu)^2}{2\sigma^2}\big)$，$L(\mu,\sigma^2)=-\frac n2\log(2\pi\sigma^2)-\frac{1}{2\sigma^2}\sum_i(x_i-\mu)^2$。`,
        T`对 $\mu$：$\frac{1}{\sigma^2}\sum_i(x_i-\mu)=0\Rightarrow\hat\mu=\bar x$。`,
        T`对 $\sigma^2$（把它当一个变量 $v$，记 $S=\sum_i(x_i-\mu)^2$）：$L=-\frac n2\log(2\pi)-\frac n2\log v-\frac{S}{2v}$。$\frac{d}{dv}(-\frac n2\log v)=-\frac{n}{2v}$，$\frac{d}{dv}(-\frac{S}{2v})=+\frac{S}{2v^2}$。令和为 0：$-\frac{n}{2v}+\frac{S}{2v^2}=0\Rightarrow v=S/n$，即 $\hat\sigma^2=\frac1n\sum_i(x_i-\bar x)^2$。`,
        T`连接 c05：$E[\hat\sigma^2]=\frac{n-1}{n}\sigma^2$，所以**方差的 MLE 是有偏的**（低估），但 $n\to\infty$ 时 bias → 0，consistent。无偏版本除以 $n-1$。`,
      ] },
    ],
    fx: [
      {
        title: 'Bernoulli 对数似然的导数', tex: T`\frac{dL}{d\theta}=\htmlClass{fx-p1}{\frac{k}{\theta}}-\htmlClass{fx-p2}{\frac{n-k}{1-\theta}}=0\ \Rightarrow\ \htmlClass{fx-p3}{\hat\theta=\frac kn}`,
        parts: [
          { label: 'k/θ', note: '来自 $k\\log\\theta$：$k$ 次"成功"推动 $\\theta$ 变大。' },
          { label: '(n−k)/(1−θ)', note: '来自 $(n-k)\\log(1-\\theta)$：$n-k$ 次"失败"推动 $\\theta$ 变小。' },
          { label: 'k/n', note: '两股力平衡的地方就是成功的比例。直觉和公式一致。' },
        ],
      },
    ],
    example: [
      { t: 'h3', text: '例 1：Bernoulli' },
      T`数据 1,0,1,1,0,1,1,0,1,1：$n=10$，$k=7$，$\hat\theta=0.7$。代回去：$L(0.7)=7\log0.7+3\log0.3\approx-2.497-3.612=-6.109$（自然对数：$\log0.7\approx-0.357$，$\log0.3\approx-1.204$）；对比 $L(0.5)=10\log0.5\approx10\times(-0.693)=-6.931$：$-6.109>-6.931$，$\hat\theta=0.7$ 的对数似然确实更大，符合"最大化"的目标。`,
      { t: 'h3', text: '例 2：Gaussian 的均值和方差' },
      T`数据 2, 4, 9：$\hat\mu=15/3=5$；$\hat\sigma^2=\frac13\big[(2-5)^2+(4-5)^2+(9-5)^2\big]=\frac{9+1+16}{3}=\frac{26}{3}\approx8.667$。（无偏版本是 $26/2=13$。）`,
      { t: 'h3', text: '例 3：把四步用到新分布（迁移练习）' },
      T`[[Exponential 分布|Exponential distribution]] $p_\theta(x)=\theta e^{-\theta x}$，$x\ge0$（这是对**数据**的限制；参数 $\theta>0$，解出来的 $1/\bar x$ 自然是正数）。数据 $x_1,\dots,x_n$：`,
      { t: 'steps', items: [
        T`$L(\theta)=\sum_i(\log\theta-\theta x_i)=n\log\theta-\theta\sum_ix_i$`,
        T`$\frac{dL}{d\theta}=\frac n\theta-\sum_ix_i=0$`,
        T`$\hat\theta=\frac{n}{\sum_ix_i}=\frac1{\bar x}$。数据 1, 2, 3 ⇒ $\hat\theta=3/6=0.5$。`,
      ] },
      { t: 'fade', title: '分步练习：MLE', plan: [T`写对数似然 $L(\theta)$`, T`求导令为 0`, T`解出 $\hat\theta$`], items: [
        { md: 'Bernoulli 数据 0, 1, 1, 0, 1。', steps: [
          { md: T`$n=5$，$k=3$；$L(\theta)=3\log\theta+2\log(1-\theta)$` },
          { md: T`$\frac{3}{\theta}-\frac{2}{1-\theta}=0\Rightarrow3(1-\theta)=2\theta$` },
          { md: T`$\hat\theta=3/5=0.6$` },
        ] },
        { md: T`做 40 次实验成功 10 次。$L(\theta)=10\log\theta+30\log(1-\theta)$，令导数 $\frac{10}{\theta}-\frac{30}{1-\theta}=0$。`, steps: [
          { ask: T`$\hat\theta=?$`, answer: 0.25, show: T`$10(1-\theta)=30\theta\Rightarrow\hat\theta=0.25$` },
        ] },
        { md: 'Gaussian 数据 3, 5, 13，同时估计均值和方差。', steps: [
          { sg: 3, ask: T`$\hat\mu=?$`, answer: 7, show: T`$21/3=7$` },
          { sg: 3, ask: T`$\hat\sigma^2=?$（MLE，除以 $n$）`, answer: 18.667, tol: 0.01, show: T`$\frac{16+4+36}{3}=\frac{56}{3}\approx18.67$` },
        ] },
      ] },
    ],
    viz: [
      { id: 'mle-bernoulli', how: '上排硬币是数据（点击切换 0/1）。曲线是 log-likelihood $L(\\theta)$，绿色竖线是最高点 $\\hat\\theta=k/n$。黑点是你用滑块试的 $\\theta$，红色短线是该点的切线（斜率 = $dL/d\\theta$；只在 log 模式、且硬币不全相同时画出）：斜率为正说明往右走 $L$ 会变大。',
        try: '① 把滑块拖到 0.7，切线变平（导数 = 0）。② 改成"画 likelihood"，曲线形状变了，但最高点位置**完全不变**——这就是"取 log 不改变 argmax"。③ 把所有硬币都点成 1，$\\hat\\theta=1$：MLE 认为"不可能出反面"——数据少时 MLE 会过度自信，c08 的先验可以缓解。' },
    ],
    compare: [
      { t: 'table', head: ['', 'MLE', 'MAP（c08）'], rows: [
        ['最大化什么', '$p(D\\mid\\theta)$', '$p(D\\mid\\theta)\\,p(\\theta)$'],
        ['用到先验吗', '否', '是'],
        ['Bernoulli 结果', '$k/n$', 'Beta 先验下 $\\frac{k+a-1}{n+a+b-2}$（$a,b$ 是 Beta 先验的两个参数，c08 讲；要求 $k+a>1$ 且 $n-k+b>1$，否则众数在边界）'],
        ['数据很少时', '容易极端（如 3/3 → 1）', '被先验拉向中间'],
        ['数据很多时', '两者趋同（先验不排除真值时）', '两者趋同'],
      ] },
    ],
    pitfalls: [
      ['likelihood 是 $\\theta$ 的概率分布', '它是 $\\theta$ 的函数，但对 $\\theta$ 积分不一定为 1，不是分布。要得到"$\\theta$ 的分布"需要 Bayes（c08）。'],
      ['取 log 会改变最优解', 'log 单调递增，argmax 不变。'],
      ['方差的 MLE 除以 $n-1$', 'MLE 除以 $n$（有偏）；除以 $n-1$ 的是无偏估计。'],
      ['导数 = 0 一定是最大值', '可能是最小值或鞍点；最优也可能在边界上而导数不为 0（如 $k=0$ 时 $L=n\\log(1-\\theta)$ 一路下降，MLE 是端点 $\\hat\\theta=0$）。'],
      ['连乘时把不同样本的参数写成不同', 'i.i.d. 假设：所有样本共享同一个 $\\theta$。'],
    ],
    quiz: [
      { type: 'num', q: '抛硬币 20 次，正面 13 次。Bernoulli 参数的 MLE？', answer: 0.65, explain: T`Bernoulli 参数 $\theta$ 是每次出现正面的概率，它的 MLE（maximum likelihood estimate，最大似然估计）是 $\hat\theta=k/n$：正面次数除以总次数。题目里正面 $k=13$ 次，总共 $n=20$ 次。$\hat\theta=13/20=0.65$。含义：在所有可能的 $\theta$ 里，**$\theta=0.65$ 让"20 次里 13 次正面"这批数据出现的概率最大**。` },
      { type: 'num', q: 'Gaussian 数据 1, 3, 5, 7。方差的 MLE 是？', answer: 5, explain: T`Gaussian 方差的 MLE 是 $\hat\sigma^2=\frac1n\sum_i(x_i-\bar x)^2$：先求均值，再求每个点离均值的距离的平方，最后除以 $n$。均值 $\bar x=(1+3+5+7)/4=16/4=4$。偏差平方：$(1-4)^2=9$，$(3-4)^2=1$，$(5-4)^2=1$，$(7-4)^2=9$，相加得 $20$。$n=4$，所以 $\hat\sigma^2=20/4=5$。**MLE 除以 $n$，不是 $n-1$**：除以 $n-1=3$ 得到的 $6.67$ 是无偏版本，不是 MLE（本章讲过方差的 MLE 有偏）。` },
      { type: 'mc', q: 'MLE 中取对数的主要原因**不包括**：', options: ['连乘变连加，便于求导', '避免数值下溢', 'log 单调，最优点不变', 'log 让似然变成概率分布'], answer: 3, explain: '取 log 后也不是 $\\theta$ 的分布。' },
      { type: 'num', q: '某 BN 中，"Rain = T"出现 40 次，其中"WetGrass = T"有 30 次。$P(\\text{Wet}=T\\mid\\text{Rain}=T)$ 的 MLE？', answer: 0.75, explain: 'CPT 的 MLE = 条件计数比例 $30/40$，即 Bernoulli MLE 在"Rain = T"的子集上。详见 T7。' },
      { type: 'show', q: '推导 $p_\\theta(x)=\\theta e^{-\\theta x}$ 的 MLE（写出关键步骤，英文）。', answer: T`Log-likelihood $L(\theta)=\sum_i(\log\theta-\theta x_i)=n\log\theta-\theta\sum_ix_i$. Setting $dL/d\theta=n/\theta-\sum_ix_i=0$ gives $\hat\theta=n/\sum_ix_i=1/\bar x$. The second derivative $-n/\theta^2<0$ confirms a maximum.` },
      {
        type: 'mc', q: T`（平时小测原题）Suppose $f(w)>0$ for all $w$, and we define $g(w)=\log f(w)$. Why do $f(w)$ and $g(w)$ have the same minimiser?`,
        qzh: T`设对所有 $w$ 都有 $f(w)>0$，令 $g(w)=\log f(w)$。为什么 $f(w)$ 和 $g(w)$ 的最小值点相同？`,
        options: [
          T`The logarithm is a concave function.`,
          T`The logarithm is a strictly increasing (monotonic) function`,
          T`The logarithm of a product is the sum of the logarithms`,
          T`The logarithm preserves the derivatives of f(w).`,
        ],
        answer: 1,
        explain: T`关键是单调性（monotonic）：log 严格递增，$f(w_1)<f(w_2)\iff\log f(w_1)<\log f(w_2)$，所以让 $f$ 最小的点也让 $\log f$ 最小，最大值点同理。这就是 MLE 里能"先取 log 再求最大"的原因。最容易选错的是第 3 项：乘积变求和是我们挑 log 的原因（好算），但不是最小值点不变的原因，Canvas 官方解释也特意强调了这一点。凹（concave）和这个性质无关；log 也不保持导数（$g'=f'/f$）。`,
      },
    ],
  });

  /* =====================================================================
   * c07 · 决策论、风险、ERM（L02 p16–p19）
   * ===================================================================== */
  add({
    id: 'c07', week: 'W1', lec: 'L02', pages: 'L02 p16–p19', star: 2,
    keyEn: [
      T`A decision rule $\delta(\bx)\in\mathcal A$ is judged by a loss, e.g. square loss $(\hat y-y)^2$ or 0-1 loss $\mathbb I(\hat y\ne y)$; its risk is the expected loss $R_\theta(\delta)=E_{(X,Y)\sim\theta}[l(\delta(X),Y)]$.`,
      T`Risk cannot be minimised directly because the data distribution is unknown; ERM instead minimises the empirical risk $\hat R(\delta)=\frac1n\sum_{i=1}^nl(\delta(X_i),Y_i)$ on the training data.`,
      T`Under square loss, $E_\theta[(\theta-\hat\theta)^2]=B(\hat\theta)^2+\mathrm{Var}_\theta(\hat\theta)$ (the cross term has zero expectation), so a biased estimator can have a lower MSE.`,
    ],
    keyZh: [
      T`决策规则（decision rule）$\delta$ = 看到数据后做的决定，用损失（loss）衡量好坏，如平方损失、0-1 损失（错记 1、对记 0）；风险（risk）= 在真实分布的新数据上的平均损失。`,
      T`风险没法直接最小化，因为真实数据分布未知；ERM（经验风险最小化）改为最小化训练集上的平均损失，用它来近似风险。`,
      T`平方损失下，估计量的 MSE = bias² + variance（交叉项期望为 0）；所以有偏估计量只要方差降得够多，MSE 反而可以更小。`,
    ],
    examQ: [
      { src: '2016 S2 Q1.6', q: T`Explain the view of frequentist supervised learning as an optimisation problem.`,
        a: T`Choose a model family $f_\theta$ and a loss $l$; the parameters are fixed unknowns, estimated by the minimiser $\hat\theta\in\argmin_\theta\frac1n\sum_{i=1}^nl(y_i,f_\theta(\bx_i))$ (plus a regulariser if used), i.e. empirical risk minimisation, as a proxy for the unknown true risk. MLE is the special case $l=-\log p_\theta(y\mid\bx)$; the minimiser is found analytically or by iterative optimisation (e.g. gradient descent).`,
        qzh: T`解释把频率学派的监督学习（frequentist supervised learning）看成一个优化问题（optimisation problem）的观点。`,
        azh: T`选定一个模型族 $f_\theta$ 和一个损失函数 $l$；参数是固定的未知量，用最小化解 $\hat\theta\in\argmin_\theta\frac1n\sum_{i=1}^nl(y_i,f_\theta(\bx_i))$（有正则项时再加上它）来估计，即经验风险最小化（empirical risk minimisation, ERM），用它近似未知的真实风险（true risk）。MLE 是 $l=-\log p_\theta(y\mid\bx)$ 时的特例；最小化解用解析方法或迭代优化（如梯度下降）求出。` },
    ],
    title: '决策论、风险、ERM', en: 'Decision theory, risk, empirical risk minimisation',
    summary: '把"学习"统一成"选一个决策规则，让期望损失（risk）最小"。真实分布未知，所以用训练集上的平均损失代替——这就是 ERM，几乎所有 ML 训练目标的模板。',
    prereq: ['c05'],
    symbols: [
      [T`$\delta(\bx)$`, T`决策规则：看到数据后的决定`],
      [T`$\mathcal A$`, T`所有可选决定的集合（action space）`],
      [T`$l(\hat y,y)$`, T`损失：预测 $\hat y$、真实 $y$ 时的代价`],
      [T`$R$, $\hat R$`, T`真实风险；经验（训练集）风险`],
      [T`$E_{(X,Y)\sim\theta}$`, T`对"从真实分布抽出的新数据 $(X,Y)$"求期望`],
      [T`$\mathbb I(\cdot)$`, T`示性函数：条件成立为 1，否则 0`],
    ],
    goals: [
      '说清 decision rule、action space、loss、risk 四个词',
      '写出 square loss、0-1 loss',
      '解释为什么不能直接最小化 risk，以及 ERM 怎么替代',
      '推导 $E[(\\theta-\\hat\\theta)^2]=B^2+\\mathrm{Var}$，并用它比较两个估计量',
    ],
    types: [],
    what: [
      T`c06 回答的是"哪个参数让数据最可能"，没说**猜错了要付多少代价**。这一章换个问题：做一个决定（给出一个预测），平均要付多少代价？先看两个能算的代价：真值是 2、你猜 2.5，平方损失（square loss）是 $(2.5-2)^2=0.25$；分类猜错一次，0-1 loss 记 1、猜对记 0。`,
      T`**Statistical decision theory（统计决策论）**（L02 p16–p17）把这件事拆成四个零件：`,
      { t: 'ul', items: [
        T`**[[Decision rule]]** $\delta(\bx)\in\mathcal A$：看到数据后做出的决定。可以是一个参数估计 $\hat\theta$，也可以是对新样本的预测 $\hat Y_{n+1}$。`,
        T`**Action space** $\mathcal A$：所有可选的决定。`,
        T`**[[Loss function]]** $l(\delta,X)$：这个决定有多糟。例如 **square loss** $l(\hat\theta,x)=(\hat\theta-x)^2$，**0-1 loss** $l(\hat y,y)=\mathbb I(\hat y\ne y)$（$\mathbb I$ 是 [[indicator function]]，预测错就记 1）。`,
        T`**[[Risk]]**（L02 p18）：期望损失 $R_\theta(\delta)=E_{(X,Y)\sim\theta}\big[l(\delta(X),Y)\big]$。下标 $(X,Y)\sim\theta$ 的意思是：对"从真实分布（参数 $\theta$）里抽出来的新数据"求平均。`,
      ] },
      T`目标：选 $\delta$ 使 risk 最小。**但不能直接做**——risk 是对真实分布 $\theta$ 求期望，而 $\theta$ 未知（L02 p18 "Can't directly! Why?"）。`,
      T`**Empirical Risk Minimisation (ERM)**：用训练数据的平均损失近似 risk：`,
      { t: 'math', tex: T`\hat R(\delta)=\frac1n\sum_{i=1}^n l\big(\delta(X_i),Y_i\big)` },
    ],
    why: [
      T`几乎所有 ML 的训练目标都是 ERM（有时加正则项）：`,
      { t: 'table', head: ['模型', 'loss', 'ERM 目标'], rows: [
        ['线性回归（c10）', 'square loss', '$\\frac1n\\sum(y_i-\\bw\'\\bx_i)^2$'],
        ['Logistic（c15）', 'log loss / cross-entropy', '负对数似然的平均'],
        ['SVM（c27）', 'hinge loss', '$\\frac1n\\sum\\max(0,1-y_i(\\bw\'\\bx_i+b))$ + 正则'],
        ['分类器评估', '0-1 loss', '训练错误率'],
      ] },
      T`而 L06（c20–c21）整周都在问一个问题：**经验风险 $\hat R$ 和真实风险 $R$ 差多少？**——这就是"泛化"。`,
    ],
    intuition: [
      T`**Risk = 在所有可能的未来数据上的平均代价。** 我们没法看到所有未来数据，只能看训练集。训练集足够大、和未来同分布时，平均损失接近期望损失（大数定律）——这是 ERM 的合理性。`,
      T`**MSE 分解的直觉**：估计量的误差有两个来源——瞄偏了（bias）和手抖（variance）。平方损失恰好把它们**干净地拆开相加**，没有交叉项。`,
      T`**一个反直觉的结论**：有偏估计量可以比无偏估计量的 MSE 更小——只要它减少的 variance 比增加的 bias² 多。这正是正则化（ridge，c16）"故意引入偏差"的道理。`,
      { t: 'think', q: '一个模型在训练集上 empirical risk = 0（全对）。它的真实 risk 一定很小吗？', a: '不一定。它可能把训练集"背"下来了（overfitting），在新数据上表现很差。经验风险和真实风险之间的差距就是 W3 的泛化理论（c18、c20、c21）要回答的问题。' },
      { t: 'story', title: '名字的来历', md: '把统计推断看成"在不确定下做决策、最小化期望损失"的框架，由 Abraham Wald 在 1939–1950 年间建立（*Statistical Decision Functions*, 1950）。"empirical risk minimisation" 这个名称则来自 Vapnik 的统计学习理论——也就是 W3–W4 泛化界、VC 维的那套理论。' },
    ],
    math: [
      { t: 'h3', text: '平方损失下的 bias–variance 分解（L02 p19）' },
      T`c05 分开定义了"瞄偏"（bias）和"手抖"（variance），但没说两个估计量**整体**谁更好。用平方损失算估计量的 risk，结果恰好是这两项相加（交叉项为 0）——所以可以直接比 bias² + variance；有偏的估计量，只要抖得少，整体也可以更好。`,
      { t: 'math', tex: T`E_\theta\big[(\theta-\hat\theta)^2\big]=\big[B(\hat\theta)\big]^2+\mathrm{Var}_\theta(\hat\theta)` },
      T`推导：记 $m=E[\hat\theta]$，在中间加减 $m$：`,
      { t: 'math', tex: T`\begin{aligned}E[(\theta-\hat\theta)^2]&=E\big[\big((\theta-m)+(m-\hat\theta)\big)^2\big]\\&=(\theta-m)^2+2(\theta-m)\underbrace{E[m-\hat\theta]}_{=0}+E[(m-\hat\theta)^2]\\&=B(\hat\theta)^2+\mathrm{Var}(\hat\theta)\end{aligned}` },
      T`交叉项：$\theta-m$ 是常数，可以提到期望外面（c01 的规则 $E[cX]=cE[X]$），剩下 $E[m-\hat\theta]=m-E[\hat\theta]=m-m=0$。所以只剩两项。`,
      { t: 'note', title: '和 c19 的关系', md: T`这里分解的是**参数估计**的误差（L02 p19）。c19（L05 p29–p40）分解的是**预测**的期望平方误差，多一项不可约噪声：$\text{bias}^2+\text{variance}+\text{noise}$。推导思路完全相同。` },
    ],
    fx: [
      {
        title: 'Risk 与 empirical risk', tex: T`\htmlClass{fx-p1}{R_\theta(\delta)}=\htmlClass{fx-p2}{E_{(X,Y)\sim\theta}}\big[\htmlClass{fx-p3}{l(\delta(X),Y)}\big]\ \approx\ \htmlClass{fx-p4}{\hat R(\delta)=\frac1n\sum_{i=1}^nl(\delta(X_i),Y_i)}`,
        parts: [
          { label: 'risk', note: '决策规则 $\\delta$ 的"真实表现"，测试集无穷大时的平均损失。' },
          { label: '对真实分布求期望', note: '需要知道 $\\theta$（数据的真实分布）——做不到。' },
          { label: 'loss', note: '单个样本上的代价：square loss、0-1 loss、hinge loss……' },
          { label: 'empirical risk', note: '训练集上的平均损失，能算。ERM = 选让它最小的 $\\delta$。' },
        ],
      },
    ],
    example: [
      { t: 'h3', text: '例 1：两个估计量谁更好？' },
      T`$X_i\sim\mathcal N(\theta,1)$，$n=20$。比较 $\bar X$ 和 $0.5\bar X$ 的 MSE：`,
      { t: 'table', cls: 'compact', head: ['', 'bias²', 'variance', 'MSE'], rows: [
        ['$\\bar X$（任何 $\\theta$）', '0', '$1/20=0.05$', '**0.05**'],
        ['$0.5\\bar X$，$\\theta=1$', '$0.5^2=0.25$', '$0.25/20=0.0125$', '**0.2625**'],
        ['$0.5\\bar X$，$\\theta=0.2$', '$0.1^2=0.01$', '$0.0125$', '**0.0225**'],
      ] },
      T`表里的数怎么来：$E[0.5\bar X]=0.5\theta$，所以 bias $=0.5\theta-\theta=-0.5\theta$：$\theta=1$ 时 $-0.5$，平方 $0.25$；$\theta=0.2$ 时 $-0.1$，平方 $0.01$。variance：$\mathrm{Var}(\bar X)=1/n=1/20$，乘常数 0.5 方差要乘 $0.5^2=0.25$，得 $0.25/20=0.0125$——这个 0.25 是 $0.5^2$，和 bias² 的 0.25 碰巧相同但不是一回事；方差不看真值，所以两行都是 0.0125。`,
      T`$\theta$ 接近 0 时，有偏的 $0.5\bar X$ 反而更好。哪个估计量好取决于真值——这就是为什么需要"先验信念"（c08）或"正则化"（c16）。`,
      { t: 'h3', text: '例 2：算 empirical risk' },
      T`回归：$\by=(1,2,3)$，预测 $(1.5,2,2)$。square loss 分别 $0.25,0,1$，$\hat R=1.25/3\approx0.417$。`,
      T`分类：5 个样本错 1 个，0-1 loss 的 $\hat R=1/5=0.2$（训练错误率）。`,
      { t: 'fade', title: '分步练习：MSE 与 empirical risk', plan: [T`bias $=E[\hat\theta]-\theta$`, T`variance`, T`MSE $=$ bias² + variance`], items: [
        { md: T`$\theta=2$，估计量 $0.8\bar X$，$\sigma^2=1$，$n=10$。`, steps: [
          { md: T`bias $=0.8\times2-2=-0.4$，bias² $=0.16$` },
          { md: T`variance $=0.64\times\frac{1}{10}=0.064$` },
          { md: 'MSE $=0.16+0.064=0.224$' },
        ] },
        { md: T`$\theta=1$，估计量 $\bar X+0.1$，$\sigma^2=4$，$n=20$。bias = 0.1。`, steps: [
          { ask: 'variance = ?', answer: 0.2, show: '$4/20=0.2$' },
          { ask: 'MSE = ?', answer: 0.21, show: '$0.01+0.2=0.21$' },
        ] },
        { md: T`回归：$\by=(2,0,1,3)$，预测 $(1,0,2,3)$，square loss。`, steps: [
          { sg: 0, ask: '四个 loss 之和 = ?', answer: 2, show: '$1+0+1+0=2$' },
          { sg: 0, ask: T`$\hat R=?$`, answer: 0.5, show: '$2/4=0.5$' },
        ] },
      ] },
    ],
    viz: [
      { id: 'estimator-sim', opts: { theta: 1, n: 20, reps: 100, est: 'shrink' }, how: '和第 5 章同一个模拟器，这次看最后一行：模拟的 MSE（每个估计值离真值的平方的平均）和 bias² + variance 是否相等。',
        try: '① 默认（$0.5\\bar X$，$\\theta=1$）：MSE ≈ 0.26。② 把 $\\theta$ 拉到 0.2，MSE 降到 ≈ 0.02，比样本均值的 0.05 还小。③ 切到样本均值对比。' },
    ],
    compare: [
      { t: 'table', head: ['', 'Risk $R$', 'Empirical risk $\\hat R$'], rows: [
        ['定义', '期望损失', '训练集平均损失'],
        ['需要什么', '真实分布（未知）', '训练数据（已知）'],
        ['能否计算', '否', '能'],
        ['关系', '目标', '$R$ 的估计；差距由泛化界控制（c21、c24）'],
      ] },
    ],
    pitfalls: [
      ['risk 就是训练误差', '训练误差是 **empirical** risk；risk 是在真实分布上的期望。'],
      ['无偏估计量总是 MSE 最小', '见例 1：有偏的可以更小。'],
      ['MSE 分解有交叉项', '交叉项期望为 0，所以干净地拆成两项。'],
      ['0-1 loss 适合用梯度下降优化', '它不连续、导数几乎处处为 0；实际用 log loss、hinge loss 等替代（c15、c27）。'],
    ],
    quiz: [
      { type: 'num', q: '估计量 bias = 0.3，variance = 0.16。它在平方损失下的 risk（MSE）？', answer: 0.25, explain: T`在平方损失下，估计量的 risk 就是 MSE（mean squared error，均方误差），它能拆成两项：$\text{MSE}=\text{bias}^2+\text{variance}$。题目给 bias $=0.3$，variance $=0.16$。$\text{MSE}=0.3^2+0.16=0.09+0.16=0.25$。**陷阱是 bias 忘了平方**，直接相加得 $0.3+0.16=0.46$；variance 已经是平方量，bias 也要平方才能和它相加。` },
      { type: 'num', q: '真实标签 (1, 0, 1, 1)，预测 (1, 1, 1, 0)。0-1 loss 的 empirical risk？', answer: 0.5, explain: T`Empirical risk（经验风险）就是在给定样本上的平均损失；0-1 loss 是"预测错记 1，预测对记 0"。逐个比较真实标签 (1, 0, 1, 1) 和预测 (1, 1, 1, 0)：第 1 个对（0），第 2 个错（1），第 3 个对（0），第 4 个错（1）。损失之和 $=0+1+0+1=2$，样本数 $n=4$。经验风险 $=2/4=0.5$，也就是**0-1 loss 下的经验风险等于训练错误率**，这里是 50%。` },
      { type: 'mc', q: '为什么不能直接最小化 risk $R_\\theta(\\delta)$？', options: ['loss 不可导', '真实数据分布 $\\theta$ 未知', '计算太慢', 'risk 总是 0'], answer: 1, explain: 'L02 p18。所以用训练集近似（ERM）。' },
      { type: 'show', q: '用英文写出 empirical risk minimisation 的定义。', answer: T`Since the true risk $R(\delta)=E[l(\delta(X),Y)]$ cannot be computed (the data distribution is unknown), ERM chooses the decision rule minimising the average loss on the training sample, $\hat R(\delta)=\frac1n\sum_{i=1}^n l(\delta(X_i),Y_i)$, as an approximation of the true risk.` },
    ],
  });

  /* =====================================================================
   * c08 · Bayesian：先验、后验、边缘似然、MAP（L02 p20–p27）
   * ===================================================================== */
  add({
    id: 'c08', week: 'W1', lec: 'L02', pages: 'L02 p20–p27', star: 3,
    keyEn: [
      T`Bayesian view: $\theta$ is a random variable expressing belief; posterior $p(\theta\mid D)=\frac{p(D\mid\theta)\,p(\theta)}{p(D)}\propto$ likelihood $\times$ prior.`,
      T`Marginal likelihood（边缘似然）/ evidence: $p(D)=\int p(D\mid\theta)\,p(\theta)\,d\theta$, the probability of the data with the parameters integrated out under the prior; the normalising constant of Bayes' rule.`,
      T`MAP: $\hat\theta=\argmax_\theta[\log p(D\mid\theta)+\log p(\theta)]$ (no evidence needed; the log prior acts as a regulariser). With a uniform prior, MAP $=$ MLE.`,
      T`Beta–Bernoulli: prior $\mathrm{Beta}(a,b)$ and $k$ heads in $n$ give posterior $\mathrm{Beta}(a+k,\,b+n-k)$, MAP $\frac{k+a-1}{n+a+b-2}$ (when $a+k>1$ and $b+n-k>1$), posterior mean $\frac{k+a}{n+a+b}$.`,
    ],
    keyZh: [
      T`贝叶斯（Bayesian）观点：参数 $\theta$ 是随机变量，它的分布表示我们的信念；后验（posterior）∝ 似然（likelihood）× 先验（prior）。`,
      T`边缘似然（marginal likelihood）/ 证据（evidence）：把参数按先验积分掉（平均掉）之后数据的概率，不是"最大的似然"；它就是 Bayes 公式的分母，起归一化作用。`,
      T`MAP（最大后验）：最大化"对数似然 + 对数先验"；分母与 $\theta$ 无关，不用算；对数先验起正则项的作用。先验均匀时 MAP = MLE。`,
      T`Beta–Bernoulli：先验 $\mathrm{Beta}(a,b)$，看到数据后后验仍是 Beta，只需把正面次数加到 $a$、反面次数加到 $b$；MAP 和后验均值套上面的公式（MAP 要求两个后验参数都 > 1）。`,
    ],
    examQ: [
      { src: '2026 practice Q1b / 2025 practice Q1b', q: T`In words or a mathematical expression, what is the marginal likelihood for a Bayesian probabilistic model?`,
        a: T`The probability of the data with the model parameters integrated out under the prior, $p(x)=\int p(x\mid\theta)p(\theta)\,d\theta$ ($x$ the data, $\theta$ the parameters), i.e. the expected likelihood under the prior; it is the normalising constant of Bayes' rule.`,
        qzh: T`用文字或数学表达式说明：对于贝叶斯概率模型（Bayesian probabilistic model），边缘似然（marginal likelihood）是什么？`,
        azh: T`在先验（prior）下把模型参数积分掉之后数据的概率，$p(x)=\int p(x\mid\theta)p(\theta)\,d\theta$（$x$ 为数据，$\theta$ 为参数），即似然在先验下的期望（expected likelihood under the prior）；它是贝叶斯公式（Bayes' rule）的归一化常数（normalising constant）。` },
      { src: '2016 S2 Q1.5', q: T`State Bayes' rule, as it applies to Bayesian modelling, and identify the posterior, likelihood, prior and marginal likelihood (or evidence). Define all mathematical symbols introduced.`,
        a: T`$p(\theta\mid D)=\frac{p(D\mid\theta)\,p(\theta)}{p(D)}$, where $\theta$ = the model parameters and $D$ = the observed data. Posterior $p(\theta\mid D)$; likelihood $p(D\mid\theta)$; prior $p(\theta)$; marginal likelihood (evidence) $p(D)=\int p(D\mid\theta)p(\theta)\,d\theta$.`,
        qzh: T`写出贝叶斯建模（Bayesian modelling）中的贝叶斯公式（Bayes' rule），并指出其中的后验（posterior）、似然（likelihood）、先验（prior）和边缘似然（marginal likelihood，或证据 evidence）。定义你引入的所有数学符号。（边缘似然的定义另见上一题。）`,
        azh: T`$p(\theta\mid D)=\frac{p(D\mid\theta)\,p(\theta)}{p(D)}$，其中 $\theta$ 是模型参数，$D$ 是观测数据。后验 $p(\theta\mid D)$；似然 $p(D\mid\theta)$；先验 $p(\theta)$；边缘似然（证据）$p(D)=\int p(D\mid\theta)p(\theta)\,d\theta$。` },
    ],
    genesis: T`c06 的 MLE 只看数据：一枚硬币抛 3 次全是正面，MLE 给出正面概率 $\hat\theta=3/3=1$，等于说"以后永远是正面"。没人会信——你早就知道硬币大多接近公平，可 MLE 里没有地方放这份"早就知道"。Bayesian 的想法是：**把"对参数的看法"也写成一个概率分布（先验），看到数据后用 Bayes rule 更新成后验。** 数据少时，先验把估计往常识那边拉；数据多了，数据说了算。（Bayes rule 来自 Thomas Bayes 的遗作，1763 年由 Richard Price 整理发表。）`,
    title: 'Bayesian：先验、后验、边缘似然、MAP', en: 'Bayesian statistics: prior, posterior, marginal likelihood, MAP',
    summary: '把参数当随机变量：先验 × 似然 ∝ 后验。分母是 **marginal likelihood**（往年原题）。只要一个数时取后验均值或 MAP；均匀先验下 MAP = MLE。',
    prereq: ['c02', 'c06'],
    symbols: [
      [T`$D$`, T`观测到的数据`],
      [T`$p(\theta)$, $p(\theta\mid D)$`, T`先验、后验（小写 $p$ 表示密度，大写 $P$ 表示概率；课件常混用，含义相同）`],
      [T`$\propto$`, T`正比于：差一个与 $\theta$ 无关的常数`],
      [T`$\int\cdots d\theta$`, T`对所有 $\theta$ 积分（离散时换成 $\sum$）`],
      [T`$\mathcal N(\mu,\sigma^2)$`, T`Gaussian，密度 $\propto\exp\!\big(-\frac{(\theta-\mu)^2}{2\sigma^2}\big)$`],
      [T`$\mathrm{Beta}(a,b)$`, T`$[0,1]$ 上的分布，密度 $\propto\theta^{a-1}(1-\theta)^{b-1}$`],
      [T`$\mu_0,\sigma_0^2$ / $\mu_n,\sigma_n^2$`, T`先验的均值方差 / 看了 $n$ 个数据后后验的均值方差`],
    ],
    goals: [
      '写出参数版 Bayes 公式，指出 prior、likelihood、posterior、evidence',
      '用英文定义 marginal likelihood（2026/2025 Q1b 原题）',
      '手算离散先验的后验；复现 L02 p23–p24 的 Gaussian 例子（结果 $\\mathcal N(0.5,0.5)$）',
      '区分 MLE、MAP、posterior mean，说出 MAP = MLE 的条件',
    ],
    types: ['T09', 'T13'],
    what: [
      { t: 'h3', text: '① Bayesian 的想法：参数也有分布（L02 p20–p21）' },
      T`**Bayesian statistics**（L02 p20–p21）：未知参数 $\theta$ 被当成**随机变量**，它的分布表达我们的**信念（belief）**。`,
      T`**先算一个例子，再记名字。** 一枚硬币，正面概率 $\theta$ 不知道；假设它只可能是 0.3、0.5、0.7，没看数据前觉得三种一样可能（各 1/3）。抛一次，出现正面。现在三种 $\theta$ 各有多可信？`,
      { t: 'table', cls: 'compact', head: ['$\\theta$', '原来的可信度', '这个 $\\theta$ 下出现正面的概率', '相乘', '÷ 总和 0.5'], rows: [
        ['0.3', '1/3', '0.3', '0.1', '0.2'],
        ['0.5', '1/3', '0.5', '0.1667', '0.333'],
        ['0.7', '1/3', '0.7', '0.2333', '0.467'],
        ['', '', '', '总和 0.5', '和 = 1'],
      ] },
      T`做法就是 c02 的 Bayes 公式：每一行"原来的可信度 × 这个 $\theta$ 下出现正面的概率"，再除以总和，让三行重新加起来为 1。$\theta=0.7$ 最能解释"出现了正面"，可信度从 $1/3$ 升到 $0.467$。`,
      { t: 'h3', text: '和 c02 的"检测阳性"是同一道题' },
      T`c02 算的是"检测阳性后，这个人真有病的概率"。把那道题一行行摆在硬币旁边，会发现**步骤完全一样，只是被猜的东西从"有没有病"换成了"$\theta$ 是多少"**：`,
      {
        t: 'table', head: ['', 'c02：看病', 'c08：硬币'], rows: [
          ['不知道、想猜的东西', '这个人有没有病（2 种可能）', '$\\theta$ 是 0.3、0.5 还是 0.7（3 种可能）'],
          ['看到的证据', '检测阳性', '抛出正面'],
          ['看证据之前，每种可能有多可信', '有病 1%，没病 99%（患病率）', '各 1/3'],
          ['每种可能下，出现这个证据的概率', '有病时阳性 90%；没病时误报 5%', '$\\theta$ 本身：0.3、0.5、0.7'],
          ['相乘', '$0.01\\times0.9=0.009$；$0.99\\times0.05=0.0495$', '0.1、0.1667、0.2333'],
          ['总和（证据本身的概率）', '$0.009+0.0495=0.0585$', '0.5'],
          ['除以总和：看证据之后有多可信', '有病 $0.009/0.0585\\approx15.4\\%$', '$\\theta=0.7$ 升到 0.467'],
        ],
      },
      T`所以 prior、likelihood、posterior 不是新算法，只是给这张表的几列起了名字：患病率就是 prior，"有病时阳性 90%"就是 likelihood，15.4% 就是 posterior。Bayesian 统计唯一的新想法，是**把模型的参数 $\theta$ 也当成"有没有病"那样的未知量**，同样用概率表示"它是各个值的可信度"，看到数据就用同一个公式更新。表里每一列的名字：`,
      { t: 'ul', items: [
        T`**[[Prior]]（先验）** $P(\theta)$：看数据之前的信念（第 2 列）。（课件里 $P$ 和 $p$ 混用：离散时是概率，连续时是密度，含义相同。）`,
        T`**Likelihood（似然）** $P(X\mid\theta)$：这个 $\theta$ 下观测到这批数据的概率（第 3 列），和 MLE 里的一样。`,
        T`**Posterior（后验）** $P(\theta\mid X)$：看到数据后更新的信念（第 5 列）。`,
        T`**[[Evidence]]（证据） / [[marginal likelihood]]（边缘似然）** $P(X)$：第 4 列的总和 $0.5$——"看到正面"这件事本身的概率：三种 $\theta$ 都可能产生正面，按先验加权加起来（c02 的 sum rule），也就是把 $\theta$ 用先验"平均掉"。`,
      ] },
      { t: 'h3', text: 'prior 是不是随便拿的？' },
      T`看病那道题的 prior 有来源：1% 是统计出来的患病率。可硬币的"三种 $\theta$ 各 1/3"像是凭空写的。这确实是 Bayesian 方法最常被批评的地方：**prior 是你自己选的，不同的人可以选不同的 prior。** 它通常从这三个地方来：`,
      { t: 'ul', items: [
        T`**以前的数据或常识**：硬币大多接近公平，就让 0.5 附近可信度高一些；患病率来自人口统计。`,
        T`**什么都不知道时用"均匀"的 prior**：每种可能一样可信。"各 1/3"的意思就是"我没有偏好"，不是"我知道它们各占 1/3"。`,
        T`**为了好算**：c51 的 Beta 先验和后验是同一类分布，更新只要改两个数。`,
      ] },
      T`那选错了怎么办？看下面这组数：同一枚硬币，两个人用不同的 prior，看到同样的数据（正面比例都是 70%）后，后验是：`,
      {
        t: 'table', head: ['', 'prior（$\\theta$=0.3 / 0.5 / 0.7）', '抛 1 次，1 次正面', '抛 10 次，7 次正面', '抛 100 次，70 次正面'], rows: [
          ['甲', '1/3 / 1/3 / 1/3', '0.20 / 0.33 / 0.47', '0.02 / 0.30 / 0.68', '0.00 / 0.00 / 1.00'],
          ['乙（偏信 0.3）', '0.6 / 0.3 / 0.1', '0.45 / 0.38 / 0.18', '0.08 / 0.52 / 0.40', '0.00 / 0.00 / 1.00'],
        ],
      },
      T`数据少时两人结论差很多，prior 说了算；数据一多，两人得到同一个答案，prior 被数据"冲掉"了。所以 prior 的作用是**在数据不够时给一个合理的起点**，数据够了它就不重要。c17 会看到，ridge 回归里那个惩罚项其实就是一个 prior：它看起来同样"凭空"，但能防止数据少时过拟合。`,
      T`**数据很多时，Bayesian 的结论会和 MLE 几乎一样。** 用 c51 的 Beta(2,2) 先验（偏向公平硬币），正面比例都是 70%：`,
      {
        t: 'table', head: ['抛的次数', 'MLE', '后验均值', '后验的标准差（有多不确定）'], rows: [
          ['10', '0.7', '0.643', '0.124'],
          ['100', '0.7', '0.692', '0.045'],
          ['10000', '0.7', '0.6999', '0.0046'],
        ],
      },
      T`那还要 Bayesian 干什么？两个原因。第一，数据少的时候它更靠谱，而实际问题里"数据少"很常见：参数一多，平均到每个参数头上的数据就少了（神经网络常常参数比样本还多），每个新病人、新用户、新老虎机臂刚开始也只有几条数据。第二，它除了给一个数，还给出"有多不确定"。后验是一整条曲线，标准差就是曲线的宽度：粗略按"均值 ± 2 个标准差"，抛 10 次时真实的 $\theta$ 大致在 0.40 到 0.89 之间（只是猜个大概），抛 10000 次时大致在 0.691 到 0.709 之间（几乎确定）。MLE 两次都只说 0.7，分不出这两种情况。c50 的 Bayesian 线性回归和 c48 的 UCB 用的都是这份"不确定"。`,
      { t: 'h3', text: '② Bayes 公式把它们连起来（L02 p22）' },
      { t: 'math', tex: T`P(\theta\mid X=x)=\frac{P(X=x\mid\theta)\,P(\theta)}{P(X=x)}=\frac{P(X=x\mid\theta)\,P(\theta)}{\sum_tP(X=x\mid\theta=t)P(\theta=t)}` },
      T`对照上表：分子 = 第 4 列（先验 × 似然），分母 = 第 4 列的总和。连续参数时 $\theta$ 有无穷多个取值，列不出表，分母的求和换成积分 $P(X=x)=\int P(X=x\mid\theta)P(\theta)\,d\theta$。`,
      { t: 'h3', text: '③ 课件例子：Gaussian 先验 + 一个观测（L02 p23–p24）' },
      T`课件的例子里 $\theta$ 可以是任意实数，就是这种列不出表的情况。好在先验和噪声都是 Gaussian（正态）时不用真的去积分：两个钟形相乘还是钟形，把指数**配方**就能读出后验的中心和宽度。看不懂配方可以先记结论：后验是 $\mathcal N(0.5,0.5)$，中心夹在先验中心 0 和数据 1 的正中间。`,
      T`先验 $\theta\sim\mathcal N(0,1)$，似然 $X\mid\theta\sim\mathcal N(\theta,1)$，观测 $X=1$：`,
      { t: 'math', tex: T`\begin{aligned}P(\theta\mid X=1)&\propto\exp\Big(-\frac{(1-\theta)^2}{2}\Big)\exp\Big(-\frac{\theta^2}{2}\Big)=\exp\Big(-\frac{2\theta^2-2\theta+1}{2}\Big)\\&=\exp\Big(-\frac{\theta^2-\theta+\frac12}{2\times\frac12}\Big)=\exp\Big(-\frac{(\theta-\frac12)^2+\frac14}{2\times\frac12}\Big)\propto\exp\Big(-\frac{(\theta-\frac12)^2}{2\times\frac12}\Big)\end{aligned}` },
      T`最后一个式子正是均值 $\frac12$、方差 $\frac12$ 的 Gaussian 核（$\propto$ 读作 [[正比于|Proportional to]]） ⇒ $\theta\mid X=1\sim\mathcal N(0.5,0.5)$。关键技巧是**配方（[[completing the square]]）**，并把与 $\theta$ 无关的常数全部扔进 $\propto$。上面一行压缩了好几步，逐步拆开：`,
      { t: 'steps', items: [
        T`**扔掉常数**：两个密度前面的 $\frac1{\sqrt{2\pi}}$ 与 $\theta$ 无关，放进 $\propto$。`,
        T`**合并指数**：$e^a\cdot e^b=e^{a+b}$，所以得到 $\exp\!\big(-\frac{(1-\theta)^2+\theta^2}{2}\big)$。`,
        T`**展开**：$(1-\theta)^2+\theta^2=1-2\theta+\theta^2+\theta^2=2\theta^2-2\theta+1$。`,
        T`**提出 2**：$-\frac{2\theta^2-2\theta+1}{2}=-(\theta^2-\theta+\frac12)$。为了和 Gaussian 的形状 $-\frac{(\theta-\mu)^2}{2\sigma^2}$ 对上，把它写成 $-\frac{\theta^2-\theta+\frac12}{2\times\frac12}$（分母"$2\sigma^2$"里的 $\sigma^2=\frac12$）。`,
        T`**配方**：$\theta^2-\theta+\frac12=(\theta-\frac12)^2-\frac14+\frac12=(\theta-\frac12)^2+\frac14$。`,
        T`**再扔常数**：$\exp\!\big(-\frac{(\theta-\frac12)^2+\frac14}{2\times\frac12}\big)=\exp\!\big(-\frac{(\theta-\frac12)^2}{2\times\frac12}\big)\times\underbrace{\exp\!\big(-\frac{1/4}{2\times\frac12}\big)}_{\text{与 }\theta\text{ 无关}}$，后一个因子进 $\propto$。`,
        T`**对照**：$\mathcal N(\mu,\sigma^2)$ 的密度 $\propto\exp\!\big(-\frac{(\theta-\mu)^2}{2\sigma^2}\big)$ ⇒ $\mu=\frac12$，$\sigma^2=\frac12$。`,
      ] },
      { t: 'note', title: '为什么可以随便扔常数', md: T`后验必须积分为 1。只要认出"形状"是 $\exp(-\frac{(\theta-\mu)^2}{2\sigma^2})$，正确的归一化常数自然就是 Gaussian 的那个——不用自己算。这也是为什么求后验时可以先不管分母 evidence。` },
      T`下面的图就是这个例子：灰色虚线是先验 $\mathcal N(0,1)$，橙线是似然（数据 $X=1$），绿线是后验 $\mathcal N(0.5,0.5)$——夹在先验中心 0 和数据 1 中间，而且比两者都窄。`,
      { t: 'viz', id: 'gauss-posterior', opts: { data: [1] } },
      { t: 'h3', text: '④ 只要一个数时：后验均值或 MAP（L02 p25）' },
      T`**点估计**（L02 p25）：Bayesian 更愿意保留整个后验，但必须给一个数时：**posterior mean** $E[\theta\mid X]$，或 **MAP**（maximum a posteriori，后验众数）$\hat\theta_{\text{MAP}}=\argmax_\theta P(\theta\mid X)$。`,
      { t: 'h3', text: '⑤ MAP 和 MLE 的关系（L02 p26）' },
      { t: 'math', tex: T`\hat\theta_{\text{MAP}}=\argmax_\theta P(\theta\mid X=x)=\argmax_\theta\frac{P(X=x\mid\theta)P(\theta)}{P(X=x)}=\argmax_\theta P(X=x\mid\theta)\,P(\theta)` },
      T`取 log：$\argmax_\theta\big[\underbrace{\log P(X\mid\theta)}_{\text{MLE 的目标}}+\underbrace{\log P(\theta)}_{\text{先验 = 正则项}}\big]$。若 $P(\theta)\propto1$，第二项是常数 ⇒ $\hat\theta_{\text{MAP}}=\hat\theta_{\text{MLE}}$。`,
      T`**均匀先验 ⇒ MAP = MLE**（L02 p26）：先验处处相等时，乘上它不改变 argmax。所以 MLE 可以看成"没有先验偏好的 MAP"。`,
    ],
    why: [
      { t: 'ul', items: [
        T`**数据少时防止极端**：3 次抛硬币全正面，MLE 说 $\hat\theta=1$；加一个"硬币大概是公平的"的先验，结果会温和得多。`,
        T`**表达不确定性**：后验的宽度告诉你"有多确定"。c50（Bayesian 线性回归）用它给出预测的置信程度，c48 的 UCB 也基于"不确定就多试试"的思想。`,
        T`**正则化 = 先验**：c17 会证明 ridge 就是 Gaussian 先验下的 MAP，lasso 是 Laplace 先验下的 MAP。`,
        T`**考点**：marginal likelihood 定义（2026 Q1b、2025 Q1b 原题）；MLE vs MAP 的区别；Beta–Bernoulli 更新（T9）。`,
      ] },
    ],
    intuition: [
      T`**后验 = 先验和数据的"加权妥协"。** 先验说"我觉得 $\theta$ 在这附近"，数据说"数据显示在那附近"。谁更确定（方差更小），后验就更靠近谁。数据越多，数据的权重越大，先验影响越小。`,
      T`**分母只是归一化常数。** 它不依赖 $\theta$，所以求 MAP 时可以扔掉：后验 $\propto$ 似然 × 先验。但它本身也有意义——它衡量"这个模型（含先验）整体上对数据的解释力"，可以用来比较模型。比较模型时应该用 evidence，而不是训练集上的最大似然——evidence 会对不必要的复杂度"扣分"（L18、T13 2021 Q6）。`,
      { t: 'think', q: '如果先验方差非常非常大（几乎没有先验信息），Gaussian 例子里的后验均值会接近什么？', a: T`接近数据的均值 $\bar x$，也就是 MLE。公式里 $1/\sigma_0^2\to0$，先验的权重消失。下面的可视化可以把先验方差拉到 5 验证。` },
      { t: 'story', title: '两大学派之争', md: '20 世纪上半叶，Fisher 等人批评 inverse probability（逆概率：用 Bayes 定理给参数赋概率，常配平坦先验），认为先验太任意，频率学派因此长期占主导。共轭模型（如 Beta–Bernoulli）一直可以手算；要到约 1990 年代计算机能大规模采样（MCMC），复杂的 Bayesian 模型才广泛进入应用。今天 ML 两派方法都用——这门课也两派都讲。' },
    ],
    math: [
      { t: 'deep', title: '通用公式：Gaussian 先验 + Gaussian 似然（已知噪声方差）', hint: '课件只给了数值例子；这个通式能直接套', blocks: [
        T`先验 $\theta\sim\mathcal N(\mu_0,\sigma_0^2)$，数据 $x_1,\dots,x_n\overset{iid}{\sim}\mathcal N(\theta,\sigma^2)$：`,
        { t: 'math', tex: T`\frac1{\sigma_n^2}=\frac1{\sigma_0^2}+\frac n{\sigma^2},\qquad \mu_n=\sigma_n^2\Big(\frac{\mu_0}{\sigma_0^2}+\frac{\sum_ix_i}{\sigma^2}\Big)` },
        T`"[[精度|Precision (Gaussian)]]（precision = 1/方差）相加；均值按精度加权平均。"代入 $\mu_0=0,\sigma_0^2=1,\sigma^2=1,n=1,x=1$：$1/\sigma_n^2=2$，$\mu_n=\frac12(0+1)=0.5$ ✓。`,
        T`Gaussian 后验对称单峰，所以 MAP = posterior mean = $\mu_n$。`,
      ] },
      { t: 'h3', text: 'Beta–Bernoulli（WK02，T9 的主力题）' },
      T`上面的 Gaussian 先验允许 $\theta$ 取任意实数。但硬币的 $\theta$ 是概率，只能在 0 和 1 之间。**Beta distribution（贝塔分布）** 就是放在 $[0,1]$ 上的分布：$a$、$b$ 可以理解成"还没抛之前，假想已经看过 $a-1$ 次正面、$b-1$ 次反面"。真的抛了 $n$ 次、$k$ 次正面，后验只要把次数加上去，仍然是 Beta：`,
      T`先验 $\theta\sim\mathrm{Beta}(a,b)\propto\theta^{a-1}(1-\theta)^{b-1}$，$n$ 次中 $k$ 次正面：`,
      { t: 'math', tex: T`\theta\mid D\sim\mathrm{Beta}(a+k,\ b+n-k),\qquad \hat\theta_{\text{MAP}}=\frac{k+a-1}{n+a+b-2},\qquad E[\theta\mid D]=\frac{k+a}{n+a+b}` },
      T`（MAP 公式要求后验参数 $a+k>1$ 且 $b+n-k>1$，这时后验在内部有唯一峰；考试题的数字一般满足。）$a=b=1$ 是均匀先验 ⇒ $\hat\theta_{\text{MAP}}=k/n=\hat\theta_{\text{MLE}}$。这种"后验和先验同一家族"的先验叫 **[[conjugate prior]]**（c51 详讲）。[[Beta distribution|Beta distribution]] 是 $[0,1]$ 上的分布，$a,b$ 像"先验里假想看过的正面、反面次数"。`,
    ],
    fx: [
      {
        title: '参数的 Bayes 公式', tex: T`\htmlClass{fx-p1}{p(\theta\mid D)}=\frac{\htmlClass{fx-p2}{p(D\mid\theta)}\ \htmlClass{fx-p3}{p(\theta)}}{\htmlClass{fx-p4}{p(D)=\int p(D\mid\theta)\,p(\theta)\,d\theta}}`,
        parts: [
          { label: 'posterior', note: '看到数据 $D$ 之后对参数的信念，是一个**分布**。' },
          { label: 'likelihood', note: '和 MLE 用的同一个函数。' },
          { label: 'prior', note: '看数据之前的信念。选择它是建模的一部分（主观）。' },
          { label: 'marginal likelihood / evidence（边缘似然 / 证据）', note: '对所有参数值按先验加权平均的似然 = 数据在这个模型下的总概率。与 $\\theta$ 无关，是后验的归一化常数。**往年原题：2026 Q1b、2025 Q1b。**' },
        ],
      },
    ],
    example: [
      { t: 'h3', text: '例 1：离散先验，完整手算（含 evidence）' },
      T`硬币偏差 $\theta$ 只可能是 0.3、0.5、0.7，先验各 1/3。抛一次，正面（$x=1$）。`,
      { t: 'table', cls: 'compact', head: ['$\\theta$', '先验', '似然 $P(x=1\\mid\\theta)=\\theta$', '先验 × 似然', '后验 = ÷ evidence'], rows: [
        ['0.3', '1/3', '0.3', '0.1', '0.1/0.5 = **0.2**'],
        ['0.5', '1/3', '0.5', '0.1667', '**0.333**'],
        ['0.7', '1/3', '0.7', '0.2333', '**0.467**'],
        ['', '', '', '求和 = **0.5** = evidence', '和 = 1'],
      ] },
      { t: 'steps', items: [
        T`Evidence $P(x=1)=\sum_t P(x=1\mid t)P(t)=0.5$。`,
        T`MAP $=0.7$（后验最大的那个）。`,
        T`Posterior mean $=0.3\times0.2+0.5\times0.333+0.7\times0.467\approx0.553$。`,
        T`对比 MLE：只看一次正面，MLE（在三个候选里）也是 0.7；但后验均值 0.553 更保守。`,
      ] },
      { t: 'h3', text: '例 2：Beta(2,2) 先验，10 次 7 正' },
      T`后验 $\mathrm{Beta}(9,5)$。MAP $=\frac{k+a-1}{n+a+b-2}=\frac{7+2-1}{10+2+2-2}=\frac{8}{12}\approx0.667$；后验均值 $=\frac{9}{14}\approx0.643$；MLE $=0.7$。先验（以 0.5 为中心）把估计往 0.5 拉了一点。`,
      { t: 'h3', text: '例 3：L02 的 Gaussian 例子再加一个点' },
      T`先验 $\mathcal N(0,1)$，噪声方差 1，数据 $x=1,3$。用上面的通用公式 $\frac1{\sigma_n^2}=\frac1{\sigma_0^2}+\frac n{\sigma^2}$、$\mu_n=\sigma_n^2\big(\frac{\mu_0}{\sigma_0^2}+\frac{\sum x_i}{\sigma^2}\big)$：先验精度 $1/1=1$，数据精度 $2/1=2$，后验精度 $1+2=3$ ⇒ $\sigma_n^2=1/3$；$\sum x_i=1+3=4$，$\mu_n=\frac13(0+4)=1.333$。MLE $\bar x=2$。后验被先验（中心 0）往回拉。`,
      { t: 'fade', title: '分步练习：后验与 evidence', plan: [T`后验 $\mathrm{Beta}(a+k,\,b+n-k)$，记 $\alpha=a+k$、$\beta=b+n-k$（后验的两个参数）`, T`MAP $=\frac{\alpha-1}{\alpha+\beta-2}$`, T`后验均值 $=\frac{\alpha}{\alpha+\beta}$`], items: [
        { md: 'Beta(3,3) 先验，10 次中 6 次正面。', steps: [
          { md: T`后验 $\mathrm{Beta}(3+6,\,3+4)=\mathrm{Beta}(9,7)$` },
          { md: T`MAP $=\frac{9-1}{9+7-2}=\frac{8}{14}\approx0.571$` },
          { md: T`后验均值 $=\frac{9}{16}=0.5625$；MLE $=0.6$` },
        ] },
        { md: T`Beta(2,5) 先验，6 次中 4 次正面。后验 $\mathrm{Beta}(6,7)$。`, steps: [
          { ask: 'MAP = ?', answer: 0.4545, tol: 0.002, show: T`$\frac{5}{11}\approx0.455$` },
          { ask: '后验均值 = ?', answer: 0.4615, tol: 0.002, show: T`$\frac{6}{13}\approx0.462$` },
        ] },
        { md: T`$\theta\in\{0.2,0.8\}$，先验各 0.5。连抛两次都是正面。`, steps: [
          { sg: 0, ask: 'evidence $P(D)=?$', answer: 0.34, show: T`$0.5\times0.2^2+0.5\times0.8^2=0.02+0.32=0.34$` },
          { sg: 0, ask: T`$P(\theta=0.8\mid D)=?$`, answer: 0.9412, tol: 0.002, show: T`$0.32/0.34\approx0.941$` },
        ] },
      ] },
    ],
    viz: [
      { id: 'gauss-posterior', how: '灰色虚线是先验，橙线是似然（作为 $\\theta$ 的函数并归一化，方便比较），绿线是后验。红点是数据。下方显示后验的均值、方差，以及先验和数据各占多少权重。点"L02 例子"复现 p23–p24。',
        try: '① 点"L02 例子"：后验 $\\mathcal N(0.5,0.5)$，正好在先验中心 0 和数据 1 中间。② 多点几次"+ 随机点"：数据越多，绿线越窄、越贴近橙线，先验权重趋近 0。③ 先点"L02 例子"，再把先验方差拉到 5（很不确定的先验）：后验均值从 0.5 移到 $5/6\\approx0.833$（先验精度 $1/5=0.2$，数据精度 $1$，后验精度 $1.2$；均值 $=(0.2\\times0+1\\times1)/1.2=5/6$），更接近 MLE = 1，但先验仍占 $0.2/1.2=1/6$ 的权重。④ 把先验方差拉到 0.1（很确定）：数据很难把后验拉走。' },
    ],
    compare: [
      { t: 'table', head: ['', 'MLE', 'MAP', 'Full Bayesian'], rows: [
        ['输出', '一个点', '一个点（后验众数）', '整个后验分布'],
        ['目标', '$\\argmax p(D\\mid\\theta)$', '$\\argmax p(D\\mid\\theta)p(\\theta)$', '$p(\\theta\\mid D)$'],
        ['先验', '无', '有', '有'],
        ['不确定性', '不表达', '不表达', '表达（后验宽度）'],
        ['等价关系', '= 均匀先验的 MAP', '+ log 先验 = 正则化（c17）', '预测时对后验积分（c50）'],
      ] },
    ],
    pitfalls: [
      ['marginal likelihood 是"最大的似然"', '是对参数**积分（平均）**后的似然 $\\int p(D\\mid\\theta)p(\\theta)d\\theta$，不是最大值。'],
      ['evidence 依赖于 $\\theta$', '它已经把 $\\theta$ 积掉了，是常数——所以求 MAP 时可以忽略。'],
      ['MAP 总等于 posterior mean', '一般不相等。后验关于峰对称（如 Gaussian）时两者相等。Beta(9,5)：0.667 vs 0.643。'],
      ['Bayesian 不需要数据量', '先验在数据少时作用大；数据多时 MAP、posterior mean、MLE 趋同。'],
      ['MAP = MLE 总成立', '均匀（平坦）先验**保证**两者相等；其他先验下一般不等（个别数据上可能碰巧相等）。'],
    ],
    quiz: [
      { type: 'num', q: '先验 $\\mathcal N(0,1)$，噪声方差 1，观测一个点 $x=2$。后验均值？', answer: 1, explain: T`Gaussian 先验加 Gaussian 噪声时，后验的规则是"precision（精度，= 1/方差）相加，均值按精度加权平均"：$\frac1{\sigma_n^2}=\frac1{\sigma_0^2}+\frac n{\sigma^2}$，$\mu_n=\sigma_n^2\big(\frac{\mu_0}{\sigma_0^2}+\frac{\sum_ix_i}{\sigma^2}\big)$。题目里先验 $\mathcal N(0,1)$ 给出 $\mu_0=0$、$\sigma_0^2=1$；噪声方差 $\sigma^2=1$；观测一个点，所以 $n=1$、$\sum_ix_i=2$。精度 $=1/1+1/1=2$，所以 $\sigma_n^2=1/2=0.5$。$\mu_n=0.5\times(0/1+2/1)=0.5\times2=1$。**先验和这一个数据点的精度都是 1，一样可信，所以后验均值落在先验均值 0 和观测 2 的正中间**，后验是 $\mathcal N(1,0.5)$。` },
      { type: 'num', q: 'Beta(1,1) 先验，4 次中 3 次正面。MAP？', answer: 0.75, explain: '$\\frac{3+0}{4+0}=0.75$——均匀先验 MAP = MLE。' },
      { type: 'num', q: '例 1 的设定，但观测到的是**反面**（$x=0$）。evidence $P(x=0)$？', answer: 0.5, explain: T`Evidence（证据，即 marginal likelihood 边缘似然）是：对每个可能的 $\theta$，算"先验 × 这个 $\theta$ 下出现该数据的概率"，再全部加起来。例 1 中 $\theta\in\{0.3,0.5,0.7\}$，先验各 $1/3$；**出现反面的概率是 $1-\theta$**，分别是 $0.7$、$0.5$、$0.3$。$P(x=0)=\frac13\times0.7+\frac13\times0.5+\frac13\times0.3=\frac13\times1.5=0.5$。这里三个 $\theta$ 关于 0.5 对称，所以反面的 evidence 和例 1 里正面的 evidence 一样，都是 0.5。` },
      { type: 'mc', q: '下面关于 MAP 的说法哪个正确？', options: ['MAP 最大化 $p(D\\mid\\theta)$', 'MAP 需要计算 evidence', '均匀先验时 MAP = MLE', 'MAP 输出后验分布'], answer: 2, explain: 'L02 p26。MAP 不需要 evidence（与 $\\theta$ 无关）。' },
      { type: 'show', q: '（往年原题 2026 Q1b）In words or a mathematical expression, what is the marginal likelihood for a Bayesian probabilistic model?', answer: T`The marginal likelihood (evidence) is the probability of the observed data under the model with the parameters integrated out according to the prior: $p(D)=\int p(D\mid\theta)\,p(\theta)\,d\theta$ (a sum for discrete $\theta$). It is the normalising constant (denominator) in Bayes' rule for the posterior.`, qzh: '用文字或数学表达式说明：对于一个贝叶斯概率模型（Bayesian probabilistic model），边缘似然（marginal likelihood）是什么？', azh: T`边缘似然（marginal likelihood），又称证据（evidence），是在该模型下观测数据出现的概率，其中参数已按先验（prior）积分掉：$p(D)=\int p(D\mid\theta)\,p(\theta)\,d\theta$（$\theta$ 离散时为求和）。它是用 Bayes 公式（Bayes' rule）求后验时的归一化常数（normalising constant），即分母。` },
      {
        type: 'mc', q: T`（平时小测原题）Which statement best describes the relationship between Maximum Likelihood Estimation (MLE) and Maximum A Posteriori (MAP) estimation?`,
        qzh: T`下面哪句话最准确地描述了极大似然估计（MLE）和最大后验估计（MAP）的关系？`,
        options: [
          T`MAP and MLE differ only when the likelihood function is non-convex.`,
          T`MLE can be viewed as MAP with a Gaussian prior centred at zero.`,
          T`MAP incorporates a prior over parameters, whereas MLE does not; under a uniform prior, they give the same estimate.`,
          T`MAP produces a more accurate parameter estimate than MLE because it uses the Bayes rule to find the solution.`,
        ],
        answer: 2,
        explain: T`MAP 最大化"似然 × 先验"：$\hat\theta_{\text{MAP}}=\argmax_\theta[\log p(D\mid\theta)+\log p(\theta)]$；MLE 只最大化 $\log p(D\mid\theta)$。先验是均匀分布（uniform prior）时，$\log p(\theta)$ 是常数，不改变 argmax，所以两者给出同一个估计。最容易选错的是第 2 项：零均值高斯先验对应的是 ridge（多了 L2 惩罚），不是 MLE；MLE 对应的是均匀先验。第 1 项：两者的区别来自先验，和似然是否凸无关。第 4 项：MAP 不一定更准，先验选得不好反而更差。`,
      },
    ],
  });

  /* =====================================================================
   * c09 · 参数/非参数、生成/判别（L02 p28–p31）
   * ===================================================================== */
  add({
    id: 'c09', week: 'W1', lec: 'L02', pages: 'L02 p28–p31（+ L01 p13, L19 p3, p10）', star: 2,
    keyEn: [
      T`Parametric: a fixed, finite number of parameters regardless of data size (e.g. linear or logistic regression); non-parametric: the number of parameters grows with the data (e.g. kNN), more flexible but less efficient.`,
      T`Generative: models the joint $P(\bx,y)=P(y)P(\bx\mid y)$ and classifies by Bayes' rule, $\hat y=\argmax_yP(y)P(\bx\mid y)$ (e.g. naive Bayes); it can generate new data.`,
      T`Discriminative: models $P(y\mid\bx)$ or a decision function directly (e.g. logistic regression, SVM), with fewer assumptions about the distribution of $\bx$.`,
      T`The two distinctions are orthogonal, and all four combinations exist in both frequentist and Bayesian statistics.`,
    ],
    keyZh: [
      T`参数化（parametric）：参数个数固定有限，不随数据量变（如线性回归、logistic 回归）；非参数化（non-parametric）：参数个数随数据增长（如 kNN），更灵活但效率更低。`,
      T`生成式（generative）：建模联合分布，先学每一类的数据怎么产生，再用 Bayes 公式选"先验 × 似然"最大的类（如朴素贝叶斯 naive Bayes）；它能生成新数据。`,
      T`判别式（discriminative）：直接建模 $P(y\mid\bx)$ 或一个决策函数（如 logistic 回归、SVM），不用描述 $\bx$ 的分布，所以假设更少。`,
      T`这两种分法互相独立（正交）：四种组合都存在，而且在频率学派和贝叶斯里都有。`,
    ],
    examQ: [
      { src: '2017 S2 Q3(a)', q: T`A method is called non-parametric if it does not rely on a fixed number of parameters. Explain why a SVM can be considered non-parametric.`,
        a: T`In its dual (kernelised) form the SVM is represented by one multiplier per training point: $\bw=\sum_i\lambda_iy_i\varphi(\bx_i)$ and predictions use $s=b+\sum_i\lambda_iy_iK(\bx_i,\bx)$, so the model must store its support vectors, whose number grows with the training set instead of being fixed in advance. With e.g. an RBF kernel the feature space is infinite-dimensional, so no fixed-size $\bw$ exists at all.`,
        qzh: T`如果一个方法不依赖固定个数的参数，就称它为非参数（non-parametric）方法。解释为什么 SVM 可以被看作非参数方法。`,
        azh: T`在对偶（核化）形式中，SVM 由每个训练点一个乘子来表示：$\bw=\sum_i\lambda_iy_i\varphi(\bx_i)$，预测用 $s=b+\sum_i\lambda_iy_iK(\bx_i,\bx)$，所以模型必须存下它的支持向量（support vectors），而支持向量的个数随训练集增大而增长，不是事先固定的。例如用 RBF 核时特征空间是无限维的，根本不存在固定大小的 $\bw$。` },
    ],
    title: '参数/非参数、生成/判别', en: 'Parametric vs non-parametric; generative vs discriminative',
    summary: '给模型分类的两把尺子。参数个数固定还是随数据增长？建模 $P(X,Y)$ 还是只建模 $P(Y\\mid X)$？两把尺子互相独立，频率学派和 Bayesian 里都有四种组合。',
    prereq: ['c02'],
    symbols: [
      [T`$P(\bx,y)$`, T`联合分布：生成式模型学这个`],
      [T`$P(y\mid\bx)$`, T`条件分布：判别式模型学这个`],
      [T`$\argmax_y$`, T`挑使后面最大的那个类别 $y$`],
      [T`$\sigma(z)$（本章）`, T`sigmoid 函数 $1/(1+e^{-z})$，把任意数压到 $(0,1)$（第 15 章）`],
    ],
    goals: [
      '用英文一句话定义 parametric / non-parametric、generative / discriminative',
      '各举课程里的例子（logistic regression vs naive Bayes；线性回归 vs kNN / kernel 方法）',
      '用生成模型 + Bayes rule 做一次分类',
    ],
    types: ['T13'],
    what: [
      { t: 'h3', text: '尺子 1：parametric vs non-parametric（L02 p29）' },
      { t: 'fig', src: 'reference/pages/L02/p29.jpg', caption: 'L02 p29', w: 520 },
      T`**Parametric**：模型由**固定、有限**个参数决定，与数据量无关（如线性回归有 $d+1$ 个权重）。**Non-parametric**：参数个数**随数据增长**，可能无限。`,
      { t: 'h3', text: '尺子 2：generative vs discriminative（L02 p30）' },
      T`第一把尺子只问"要记的参数会不会随数据变多"，没问模型**学的是什么**。监督学习里，想对新的 $X$ 预测 $Y$，最终要的是 $P(Y\mid X)$。有两条路能走到它，下面用同一批数据把两条路都走一遍。`,
      {
        t: 'table', caption: '1000 封邮件，问题：一封含 "free" 的新邮件是 spam 的概率？', head: ['', '含 "free"', '不含 "free"', '合计'], rows: [
          ['spam', '180', '120', '300'],
          ['正常', '70', '630', '700'],
          ['合计', '250', '750', '1000'],
        ],
      },
      T`**生成式：按行看，先学"每一类邮件长什么样"。** spam 占 $300/1000=0.3$；spam 里含 "free" 的占 $180/300=0.6$；正常邮件里占 $70/700=0.1$。学到的是 $P(Y)$ 和 $P(X\mid Y)$，也就是"每一类的数据是怎么产生的"。预测时用 Bayes 反推：$\frac{0.3\times0.6}{0.3\times0.6+0.7\times0.1}=\frac{0.18}{0.25}=0.72$。`,
      T`**判别式：按列看，直接学"看到这个特征时是哪一类"。** 含 "free" 的 250 封里 spam 有 180 封，$180/250=0.72$；不含的 750 封里 spam 有 120 封，$120/750=0.16$。学到的直接就是 $P(Y\mid X)$，不需要知道每一类邮件长什么样，也不用 Bayes。`,
      T`两条路答案一样（只有一个特征、数据完整时总是一样），区别在**学到的东西不同**：`,
      {
        t: 'table', head: ['', '生成式', '判别式'], rows: [
          ['学的是', '每一类的数据怎么产生：$P(Y)$、$P(X\\mid Y)$', '只学怎么分开：$P(Y\\mid X)$，或一条边界'],
          ['能不能"造"数据', '能：照着 spam 的规律可以随机生成像 spam 的邮件', '不能，只会判断是哪一类'],
          ['特征很多时', '要描述每一类里所有特征一起怎么出现，太难，只好加简化假设（朴素贝叶斯假设特征互相独立），假设不对就会出错', '不用管特征之间的关系，数据多时通常更准'],
          ['数据少时', '通常学得更快、更稳', '需要更多数据'],
          ['课里的例子', '朴素贝叶斯；第 51 章 Beta–Binomial；第 53 章贝叶斯网络', 'logistic 回归（第 15 章）、感知机、SVM、神经网络'],
        ],
      },
      T`一个类比：分辨猫和狗。生成式是先学会"画猫"和"画狗"，看到新图时问更像哪一种画出来的；判别式不学画，只学"耳朵尖、脸短的是猫"这种区分线索。课件的正式说法：`,
      { t: 'ul', items: [
        T`**[[Generative|Generative model]]（生成式）**：建模完整的 **joint** $P(X,Y)$，通常写成 $P(Y)P(X\mid Y)$。预测时选使 $P(\bx,y)$ 最大的 $y$（L19 p3）。`,
        T`**[[Discriminative|Discriminative model]]（判别式）**：只建模 **conditional** $P(Y\mid X)$（或直接学一个决策函数 $y=f(\bx)$）。`,
      ] },
      T`L02 p29–p30 都强调：**两种分类在频率学派和 Bayesian 里都存在**。`,
    ],
    why: [
      T`这两组概念是**简答题**的常客（预测高频，见 T13），也是理解后面模型定位的"地图"：`,
      { t: 'table', head: ['', 'Parametric', 'Non-parametric'], rows: [
        ['**Discriminative**', '线性回归、logistic regression（c15）、perceptron、固定结构的神经网络', '[[kNN]]、RBF kernel 这类无限维 kernel 方法（第 29–30 章）'],
        ['**Generative**', '[[Naive Bayes]]、Beta–Bernoulli 模型（c51）、Bayesian network 的 CPT（c53）', '（本课不重点讨论）'],
      ] },
      { t: 'note', title: '说明', md: '表中例子来自课程后面的讲次（L19 p10 明确对比了 logistic regression 与 Naïve Bayes），L02 本身只说 "examples to come"。RBF kernel 的特征空间是无限维，模型只能通过\"每个训练点一个系数\"来表示，系数个数随 $n$ 增长，所以算 non-parametric；线性核、固定次数多项式核的特征空间有限维，仍是 parametric。' },
    ],
    intuition: [
      T`**L01 p13 的三种模型**正好对应这里：`,
      { t: 'fig', src: 'reference/pages/L01/p13.jpg', caption: 'L01 p13：确定性 $\\hat y=f(x)$、条件 $P(y\\mid x)$、联合 $P(x,y)$', w: 600 },
      T`左图只给一个预测值；中图在每个 $x$ 处给 $y$ 的分布（**判别式**）；右图描述 $(x,y)$ 一起出现的分布（**生成式**），能"生成"新的 $(x,y)$ 对。`,
      T`**生成式 = 先学"每个类长什么样"，再用 Bayes 反推。** 判别式 = 直接学"边界在哪"。判别式只关心分类需要的东西，所以通常更省事；生成式多学了 $P(X)$，能生成数据、能处理缺失特征，但要对 $X$ 的分布做更多假设。`,
      T`**参数 vs 非参数 = 记住"规律" vs 记住"例子"。** 线性回归训练完只存 $\bw$，训练数据可以扔掉；kNN 必须一直存着全部训练数据，数据越多"参数"越多——更灵活，但更慢、需要更多数据（L02 p29 "less efficient"）。`,
      { t: 'think', q: 'kNN 在"训练"阶段做了什么？预测一个新点的计算量和训练集大小 $n$ 有什么关系？', a: '几乎什么都不做，只是把数据存起来。预测时要和全部 $n$ 个点算距离，代价随 $n$ 增长——这就是 non-parametric 的 "less efficient"。线性回归训练时花功夫，预测时只算一次点积，与 $n$ 无关。' },
    ],
    math: [
      { t: 'h3', text: '生成式分类器怎么预测' },
      { t: 'math', tex: T`\hat y=\argmax_y P(\bx,y)=\argmax_y P(y)\,P(\bx\mid y),\qquad P(y\mid\bx)=\frac{P(y)P(\bx\mid y)}{\sum_{y'}P(y')P(\bx\mid y')}` },
      T`对比判别式：直接给出 $P(y\mid\bx)$，例如 logistic regression $P(y=1\mid\bx)=\sigma(\bw'\bx)$，其中 $\sigma(z)=\frac{1}{1+e^{-z}}$ 是 [[sigmoid]] 函数，把超平面的"带符号距离" $\bw'\bx$ 压成 0 到 1 之间的概率（第 15 章详讲）。`,
    ],
    example: [
      { t: 'h3', text: '用生成式模型分类一封邮件' },
      T`先验 $P(\text{spam})=0.3$。在 spam 里出现单词 "free" 的概率 0.6，在正常邮件（ham）里 0.1。新邮件含 "free"：`,
      { t: 'steps', items: [
        T`$P(\text{spam},\text{free})=0.3\times0.6=0.18$；$P(\text{ham},\text{free})=0.7\times0.1=0.07$。`,
        T`$\argmax$ ⇒ 预测 spam。`,
        T`如要概率：$P(\text{spam}\mid\text{free})=\frac{0.18}{0.18+0.07}=0.72$。`,
      ] },
      T`判别式做法：直接拟合一个 $P(\text{spam}\mid\text{特征})$ 的函数（如 logistic），不去建模"spam 邮件里单词怎么分布"。`,
      { t: 'story', title: '垃圾邮件过滤', md: '2002 年 Paul Graham 在网上发表 "A Plan for Spam"，用基于 Bayes rule 的词频过滤器拦截垃圾邮件，报告效果明显好于当时的手写规则，让这类过滤器在程序员中流行起来。Naive Bayes 本身在此之前早已是机器学习里的标准生成式分类器。上面的例子是它的最简版。' },
      { t: 'fade', title: '分步练习：生成式分类', plan: [T`每类算 $P(y)P(\bx\mid y)$`, T`求和得 evidence $P(\bx)$`, T`后验 = 联合 / evidence`], items: [
        { md: T`$P(A)=0.4$，$P(\bx\mid A)=0.5$，$P(\bx\mid B)=0.25$。`, steps: [
          { sg: 1, md: T`$P(A,\bx)=P(A)P(\bx\mid A)=0.4\times0.5=0.2$；只有两类，$P(B)=1-0.4=0.6$，$P(B,\bx)=0.6\times0.25=0.15$ ⇒ $0.2>0.15$，预测 A` },
          { sg: 3, md: T`$P(A\mid\bx)=0.2/0.35\approx0.571$` },
        ] },
        { md: T`$P(A)=0.1$，$P(\bx\mid A)=0.9$，$P(\bx\mid B)=0.2$。已知 $P(A,\bx)=0.09$。`, steps: [
          { sg: 1, ask: T`$P(B,\bx)=?$`, answer: 0.18, show: T`$P(B)=1-P(A)=1-0.1=0.9$（这个 0.9 不是 $P(\bx\mid A)$）；$P(B,\bx)=0.9\times0.2=0.18>0.09$ ⇒ 预测 B` },
          { sg: 3, ask: T`$P(A\mid\bx)=?$`, answer: 0.3333, tol: 0.002, show: T`$0.09/0.27=1/3$` },
        ] },
        { md: T`三类，先验 $0.5,0.3,0.2$，$P(\bx\mid c)=0.1,0.4,0.5$（按顺序配对：类 1 是 $0.5$ 和 $0.1$，类 2 是 $0.3$ 和 $0.4$，类 3 是 $0.2$ 和 $0.5$）。`, steps: [
          { ask: T`evidence $P(\bx)=?$`, answer: 0.27, show: T`三个联合：$0.5\times0.1=0.05$，$0.3\times0.4=0.12$，$0.2\times0.5=0.10$；相加 $0.27$` },
          { ask: '最可能类别的后验概率 = ?', answer: 0.4444, tol: 0.002, show: T`第 2 类：$0.12/0.27\approx0.444$` },
        ] },
      ] },
    ],
    compare: [
      { t: 'table', head: ['', 'Generative', 'Discriminative'], rows: [
        ['建模', '$P(X,Y)=P(Y)P(X\\mid Y)$', '$P(Y\\mid X)$ 或 $f(X)$'],
        ['预测', '$\\argmax_y P(\\bx,y)$（Bayes）', '直接输出'],
        ['能生成新样本', '能', '不能'],
        ['需要的假设', '多（要描述 $X$ 的分布）', '少'],
        ['例子', 'Naive Bayes', 'Logistic regression、SVM'],
      ] },
      { t: 'exam', md: T`**Generative vs discriminative:** A generative model learns the joint distribution $P(\mathbf x,y)$ (e.g. $P(y)P(\mathbf x\mid y)$) and predicts via Bayes' rule, e.g. naive Bayes; a discriminative model learns $P(y\mid\mathbf x)$ or a decision function directly, e.g. logistic regression.

**Parametric vs non-parametric:** A parametric model has a fixed, finite number of parameters regardless of the amount of data; a non-parametric model's number of parameters grows with the data (potentially infinite), making it more flexible but less statistically and computationally efficient.` },
    ],
    pitfalls: [
      ['non-parametric = 没有参数', '是参数个数**不固定**、随数据增长。'],
      ['生成式 = Bayesian，判别式 = 频率', '两组概念正交，四种组合都有（L02 p29–p30）。'],
      ['生成式模型不能用于分类', '能，用 Bayes rule 从 $P(\\bx,y)$ 得 $P(y\\mid\\bx)$。'],
      ['参数多的模型就是 non-parametric', '大神经网络参数很多但**固定**，仍是 parametric。'],
    ],
    quiz: [
      { type: 'mc', q: 'Logistic regression 是：', options: ['generative, parametric', 'discriminative, parametric', 'generative, non-parametric', 'discriminative, non-parametric'], answer: 1, explain: '建模 $P(y\\mid\\bx)$，参数是固定维度的 $\\bw$。' },
      { type: 'mc', q: 'k-nearest neighbours 是 non-parametric，因为：', options: ['没有超参数', '要保存全部训练数据，"参数"随 $n$ 增长', '它是生成式', '它不用距离'], answer: 1, explain: '预测时要用所有训练点。' },
      { type: 'num', q: '只有 A、B 两类。先验 $P(A)=0.5$，$P(\\bx\\mid A)=0.2$，$P(\\bx\\mid B)=0.6$。生成式分类器给出 $P(A\\mid\\bx)$ = ?', answer: 0.25, explain: T`① 只有两类，$P(B)=1-0.5=0.5$。② 每一类算"先验 × 似然"：$P(A,\bx)=0.5\times0.2=0.1$，$P(B,\bx)=0.5\times0.6=0.3$。③ 相加得 $P(\bx)=0.1+0.3=0.4$。④ $P(A\mid\bx)=0.1/0.4=0.25$，所以判成 B（0.75）。换成人数：1000 个样本 A、B 各 500；A 里 20% 长成 $\bx$ 即 100 个，B 里 60% 即 300 个；长成 $\bx$ 的 400 个里 A 占 100 个 = 25%。` },
      { type: 'show', q: '用英文解释 generative 和 discriminative 的区别，并各举一例。', answer: T`A generative model learns the joint $P(\mathbf x,y)$ and classifies via Bayes' rule (e.g. naive Bayes); a discriminative model learns $P(y\mid\mathbf x)$ or a decision boundary directly (e.g. logistic regression, SVM).` },
    ],
  });

  /* =====================================================================
   * r01 · W1 复习
   * ===================================================================== */
  SML.content.add(SML.review({
    id: 'r01', week: 'W1', title: 'W1 复习：概率与统计学派', en: 'Week 1 review',
    summary: '本周两讲是整门课的"语言"：概率（期望、条件、Bayes）和三种从数据学参数的思路（MLE、ERM、Bayesian）。考试直接考的是 **marginal likelihood 定义**、**MLE vs MAP**、**generative vs discriminative**，以及后面每道计算题都会用到的 Bayes 和 MLE 计数。',
    keypoints: [
      [T`期望是加权平均；$\mathrm{Var}(X)=E[X^2]-E[X]^2$；$\mathrm{Var}(aX+b)=a^2\mathrm{Var}(X)$。`, 'c01'],
      [T`Sum rule $P(a)=\sum_bP(a,b)$、product rule、Bayes $P(a\mid b)=P(b\mid a)P(a)/P(b)$；条件独立 ≠ 独立。`, 'c02'],
      [T`超平面 $\bw'\bx+b=0$，$\bw$ 是法向量，符号决定侧，距离 $|\bw'\bx+b|/\|\bw\|$。`, 'c03'],
      [T`$\mathbf X'\mathbf X$ 总是 PSD；列线性相关 ⇒ 零特征值 ⇒ 不可逆。`, 'c04'],
      [T`频率学派：$\theta$ 固定，$\hat\theta$ 随机；bias、variance、consistency；$\mathrm{Var}(\bar X)=\sigma^2/n$。`, 'c05'],
      [T`MLE 四步：似然连乘 → 取 log → 求导 = 0 → 解；Bernoulli $\hat\theta=k/n$，Gaussian $\hat\mu=\bar x$。`, 'c06'],
      [T`Risk = 期望损失，未知分布 ⇒ ERM 用训练平均损失；$\text{MSE}=\text{bias}^2+\text{variance}$。`, 'c07'],
      [T`后验 ∝ 似然 × 先验；分母 = marginal likelihood $\int p(D\mid\theta)p(\theta)d\theta$；均匀先验 MAP = MLE。`, 'c08'],
      [T`Generative 建模 $P(X,Y)$，discriminative 建模 $P(Y\mid X)$；parametric 参数个数固定，non-parametric 随数据增长。`, 'c09'],
    ],
    map: [
      { t: 'table', head: ['问题', '频率学派', '决策论', 'Bayesian'], rows: [
        ['参数是什么', '固定未知常数', '（不关心，只关心决策好坏）', '随机变量'],
        ['怎么学', 'MLE：$\\argmax p(D\\mid\\theta)$', 'ERM：$\\min\\frac1n\\sum l$', '后验 $p(\\theta\\mid D)$；MAP / 后验均值'],
        ['怎么评价', 'bias、variance、consistency', 'risk（期望损失）', '后验的宽度'],
        ['后面变成', '线性回归 = Gaussian MLE（c11）', '所有训练目标；泛化界（c20）', 'ridge = MAP（c17）；Bayesian 回归（c50）'],
      ] },
      T`三条路在平方损失 + Gaussian 噪声下**汇合**：MLE = 最小化平方误差 = ERM（square loss），加 Gaussian 先验后 MAP = ridge。W2–W3 会逐一证明。`,
    ],
    recall: [
      { q: 'Probability space 的三个组成部分？', a: T`Outcome 集合 $\Omega$、event 集合 $F$、probability measure $P$（L01 p14）。`, ch: 'c01' },
      { q: '方差的"手算公式"？$\\mathrm{Var}(3X+1)$ 是 $\\mathrm{Var}(X)$ 的几倍？', a: T`$\mathrm{Var}(X)=E[X^2]-E[X]^2$；9 倍。`, ch: 'c01' },
      { q: '写出 Bayes theorem，并说出分母怎么算。', a: T`$P(A\mid B)=\frac{P(B\mid A)P(A)}{P(B)}$，分母用 sum rule $P(B)=\sum_aP(B\mid a)P(a)$。`, ch: 'c02' },
      { q: '$X\\perp Y\\mid Z$ 的数学定义？它能推出 $X\\perp Y$ 吗？（用英文说含义）', a: T`$P(X,Y\mid Z)=P(X\mid Z)P(Y\mid Z)$。不能。*Once $Z$ is known, $Y$ gives no further information about $X$; this does not imply marginal independence.*`, ch: 'c02' },
      { q: '点 $\\bx$ 到超平面 $\\bw\'\\bx+b=0$ 的距离？为什么 $\\bw$ 垂直于超平面？', a: T`$|\bw'\bx+b|/\|\bw\|$。超平面上任两点相减得 $\bw'(\bx_1-\bx_2)=0$。`, ch: 'c03' },
      { q: '证明 $\\mathbf X\'\\mathbf X$ 是 PSD。', a: T`$\bv'\mathbf X'\mathbf X\bv=\|\mathbf X\bv\|^2\ge0$。`, ch: 'c04' },
      { q: 'PSD 和 PD 用特征值怎么判断？哪个保证可逆？', a: '全部 ≥ 0 / 全部 > 0。PD 保证可逆。', ch: 'c04' },
      { q: 'Bias 和 variance 的定义？', a: T`$B=E[\hat\theta]-\theta$；$\mathrm{Var}=E[(\hat\theta-E\hat\theta)^2]$。`, ch: 'c05' },
      { q: '举一个无偏但不一致的估计量。', a: T`$\hat\theta=X_1$（只用第一个样本）：无偏，但方差不随 $n$ 下降。`, ch: 'c05' },
      { q: 'MLE 的四步？为什么取 log？', a: '写似然连乘 → 取 log → 求导 = 0 → 解（解不出就对 $-L$ 做梯度下降）。log 单调不改 argmax，乘变加易求导，防 underflow。', ch: 'c06' },
      { q: 'Bernoulli 的 log-likelihood 和 MLE？', a: T`$L=k\log\theta+(n-k)\log(1-\theta)$，$\hat\theta=k/n$。`, ch: 'c06' },
      { q: 'Gaussian 方差的 MLE？有偏吗？', a: T`$\frac1n\sum(x_i-\bar x)^2$；有偏（期望 $\frac{n-1}{n}\sigma^2$），但 consistent。`, ch: 'c06' },
      { q: 'Risk 和 empirical risk 的区别？为什么要 ERM？', a: '期望损失 vs 训练集平均损失；真实分布未知，risk 算不出来。', ch: 'c07' },
      { q: '推一下 $E[(\\theta-\\hat\\theta)^2]=B^2+\\mathrm{Var}$ 的关键一步。', a: T`中间加减 $m=E[\hat\theta]$，交叉项 $2(\theta-m)E[m-\hat\theta]=0$。`, ch: 'c07' },
      { q: '（原题）What is the marginal likelihood?', a: T`**还没确定参数是哪个值时，"看到这批数据"的总概率。** 对每个可能的 $\theta$ 算 $p(D\mid\theta)$，按先验 $p(\theta)$ 加权加起来（$\theta$ 连续时求和换成积分）；它就是 Bayes 公式的分母，除以它后验才加起来等于 1。例：第 8 章硬币表，$\theta=0.3/0.5/0.7$ 各 1/3，抛一次出正面：$\tfrac13(0.3)+\tfrac13(0.5)+\tfrac13(0.7)=0.5$。英文答法：The probability of the data with the parameters integrated out under the prior, $p(D)=\int p(D\mid\theta)p(\theta)\,d\theta$ (a sum for discrete $\theta$); the normalising constant of Bayes' rule.`, ch: 'c08', qzh: '什么是边缘似然（marginal likelihood）？', azh: T`（英文答法）按先验（prior）把参数积分掉之后、数据出现的概率，$p(D)=\int p(D\mid\theta)p(\theta)\,d\theta$（$\theta$ 离散时为求和）；它是 Bayes 公式（Bayes' rule）的归一化常数（normalising constant）。` },
      { q: 'MAP 和 MLE 什么时候相等？', a: '先验均匀（$p(\\theta)\\propto1$）时保证相等；数据量很大时也趋同（先验不排除真值时）。', ch: 'c08' },
      { q: 'Beta(a,b) 先验 + $n$ 次中 $k$ 次正面，后验和 MAP？', a: T`$\mathrm{Beta}(a+k,b+n-k)$；MAP $=\frac{k+a-1}{n+a+b-2}$（要求 $k+a>1$ 且 $n-k+b>1$；否则众数在边界上）。`, ch: 'c08' },
      { q: 'L02 的 Gaussian 例子：先验 $\\mathcal N(0,1)$，噪声方差 1，观测 $x=1$，后验？', a: T`$\mathcal N(0.5,0.5)$。`, ch: 'c08' },
      { q: 'Generative vs discriminative？各一例。', a: T`建模 $P(X,Y)$（naive Bayes）vs $P(Y\mid X)$（logistic regression）。`, ch: 'c09' },
      { q: 'Parametric vs non-parametric？', a: '参数个数固定有限 vs 随数据增长；后者更灵活但效率低。', ch: 'c09', qzh: '参数化（parametric）模型与非参数化（non-parametric）模型有什么区别？' },
    ],
    formulas: [
      ['$\\mathrm{Var}(X)=E[X^2]-E[X]^2$', '手算方差', 'L01 p18'],
      ['$P(a)=\\sum_bP(a,b)$', 'marginalisation（sum rule）', 'L01 p23'],
      ['$P(a\\mid b)=\\frac{P(b\\mid a)P(a)}{P(b)}$', 'Bayes theorem', 'L01 p22'],
      ['$\\frac{|\\bw\'\\bx+b|}{\\|\\bw\\|}$', '点到超平面距离（SVM 必用）', 'L08'],
      ['$\\bv\'\\mathbf A\\bv\\ge0\\ \\forall\\bv$', 'PSD 定义（kernel 合法性）', 'L01 p42'],
      ['$B=E[\\hat\\theta]-\\theta$，$\\mathrm{Var}(\\bar X)=\\sigma^2/n$', '估计量性质', 'L02 p5–p9'],
      ['$\\hat\\theta_{\\text{MLE}}=\\argmax_\\theta\\prod_ip_\\theta(x_i)$；Bernoulli $k/n$', 'MLE', 'L02 p10–p12'],
      ['$E[(\\theta-\\hat\\theta)^2]=B^2+\\mathrm{Var}$', 'MSE 分解', 'L02 p19'],
      ['$p(\\theta\\mid D)\\propto p(D\\mid\\theta)p(\\theta)$；$p(D)=\\int p(D\\mid\\theta)p(\\theta)d\\theta$', '后验与 marginal likelihood', 'L02 p22'],
      ['$\\mathrm{Beta}(a+k,b+n-k)$；MAP $\\frac{k+a-1}{n+a+b-2}$（两个后验参数都 $>1$ 时）', 'Beta–Bernoulli', 'WK02'],
    ],
    exam: [
      ['定义 marginal likelihood（2–5 分简答）', '2026 Q1b、2025 Q1b 原题', '[T13 简答](#/T13)'],
      ['MLE vs MAP 区别', 'T13 预测高频', '[T13](#/T13/predicted)'],
      ['Beta–Bernoulli 后验、MAP、MLE 计算', 'WK02；T9', '[T9 Bayesian 计算](#/T09)'],
      ['CPT 的 MLE = 计数比例', '几乎每年（Section B 图模型题）', '[T7](#/T07)'],
      ['Generative vs discriminative / parametric vs non-parametric', 'T13 预测', '[T13](#/T13/predicted)'],
      ['Bayes rule、条件独立的含义', '2025 Q1c；所有图模型题', '[T5](#/T05)'],
    ],
    quiz: [
      { type: 'num', q: 'Bernoulli 数据 1,1,0,1,1,1,0,1：MLE？', answer: 0.75, explain: '$6/8$。' },
      { type: 'num', q: '同一数据，Beta(2,2) 先验下的 MAP？', answer: 0.7, explain: '$\\frac{k+a-1}{n+a+b-2}=\\frac{6+2-1}{8+2+2-2}=\\frac{7}{10}=0.7$。' },
      { type: 'num', q: '$P(D)=0.02$，$P(+\\mid D)=0.95$，$P(+\\mid\\neg D)=0.1$。$P(D\\mid+)$？', answer: 0.1624, tol: 0.002, explain: '分子 $P(+\\mid D)P(D)=0.95\\times0.02=0.019$；没病的概率 $1-0.02=0.98$，误报贡献 $0.1\\times0.98=0.098$；分母 $0.019+0.098=0.117$；后验 $0.019/0.117\\approx0.162$。', qzh: T`已知 $P(D)=0.02$，$P(+\mid D)=0.95$，$P(+\mid\neg D)=0.1$，求 $P(D\mid+)$。` },
      { type: 'num', q: '估计量 bias $=-0.2$，variance $=0.05$，MSE？', answer: 0.09, explain: '$0.04+0.05$。' },
      { type: 'mc', q: '下面哪个**不需要**先验？', options: ['MAP', 'posterior mean', 'MLE', 'marginal likelihood'], answer: 2, explain: 'MLE 只用似然。' },
      { type: 'mc', q: '矩阵 $\\begin{bmatrix}2&2\\\\2&2\\end{bmatrix}$：', options: ['PD', 'PSD 但不可逆', '不定', '负定'], answer: 1, explain: '特征值 4、0。' },
      { type: 'num', q: '超平面 $x_1-x_2+1=0$，点 $(3,1)$ 的距离？（保留 3 位）', answer: 2.121, tol: 0.002, explain: '$|3-1+1|/\\sqrt2=3/\\sqrt2\\approx2.121$。' },
      { type: 'show', q: '（英文）Explain the difference between MLE and MAP estimation.', answer: T`MLE chooses $\theta$ maximising the likelihood $p(D\mid\theta)$; MAP maximises the posterior $p(\theta\mid D)\propto p(D\mid\theta)p(\theta)$, i.e. it adds the log prior, which acts like a regulariser. With a uniform prior they coincide, and (for a fixed prior with positive density near the true parameter, under regularity conditions) the prior's influence typically diminishes as the sample size grows.`, qzh: '解释最大似然估计（MLE）与最大后验估计（MAP）的区别。', azh: T`MLE 选择使似然（likelihood）$p(D\mid\theta)$ 最大的 $\theta$；MAP 最大化后验（posterior）$p(\theta\mid D)\propto p(D\mid\theta)p(\theta)$，也就是多加了一项对数先验（log prior），它的作用类似正则项（regulariser）。先验均匀（uniform prior）时两者相同；并且（对于在真实参数附近密度为正的固定先验，在正则性条件（regularity conditions）下）随着样本量增大，先验的影响通常会逐渐减弱。` },
    ],
    next: '下一周（W2）：线性回归。你会看到本周三条路第一次汇合——最小二乘 = Gaussian MLE = square-loss ERM。先确认本页的回忆卡至少 15/20 是"会了"。',
  }));
})(window);
