(function (root) {
  'use strict';
  const T = String.raw;
  root.SML.content.add(root.SML.lecture({
    id: 'L19',
    eyebrow: '单元 6 · Jiang · 2021 Q10',
    chips: ['L19 p1–p24', { text: 'T9 Bayesian', href: '#/T09/beta' }],
    lead: '分类的两条路（生成 vs 判别），离散数据的 Bayesian 更新（Beta–Binomial），以及没有共轭先验时（Bayesian logistic regression）怎么近似。',
    oneLiner: {
      zh: '生成模型建模 $P(\\bx,y)$，判别模型只建模 $P(y\\mid\\bx)$。Beta 是 Binomial 的共轭先验：后验 $\\mathrm{Beta}(\\alpha+k,\\beta+n-k)$。Logistic 似然没有共轭先验，后验只能近似（Monte Carlo、variational、Laplace）。',
      en: T`Generative classifiers model the joint $P(\mathbf x,y)$ and predict via Bayes' rule; discriminative ones model $P(y\mid\mathbf x)$ directly. For coin-flip data the Beta prior is conjugate to the Binomial likelihood, giving posterior $\mathrm{Beta}(\alpha+k,\beta+n-k)$. Bayesian logistic regression has no conjugate prior, so its posterior must be approximated by Monte Carlo sampling, variational inference or the Laplace approximation.`,
    },
    defs: [
      ['生成模型', '先抽 $y$（偏硬币），再按类别抽 $\\bx$；预测时选 $\\argmax_yP(\\bx,y)$', 'p3–p8'],
      ['Beta 分布', '$\\mathrm{Beta}(q;\\alpha,\\beta)\\propto q^{\\alpha-1}(1-q)^{\\beta-1}$，均值 $\\frac{\\alpha}{\\alpha+\\beta}$；$\\alpha=\\beta=1$ 是均匀分布', 'p11–p12'],
      ['proportionality', '如果 $f\\propto g$ 且 $g$ 是已知分布，归一化后 $f$ 就是 $g$——所以可以先丢掉常数', 'p14'],
      ['sunrise', '均匀先验、连续 $k$ 天日出：明天日出概率 $\\frac{k+1}{k+2}$，永远不到 1', 'p15–p16'],
      ['Laplace approximation', '在众数处用 Gaussian 近似，匹配一阶、二阶导数（求一个 Hessian）', 'p23'],
    ],
    formulas: [
      { t: 'math', tex: T`p(q\mid k,n)\propto\underbrace{q^k(1-q)^{n-k}}_{\text{Binomial}}\ \underbrace{q^{\alpha-1}(1-q)^{\beta-1}}_{\text{Beta}}=q^{k+\alpha-1}(1-q)^{n-k+\beta-1}\ \Rightarrow\ \mathrm{Beta}(k+\alpha,\ n-k+\beta)` },
    ],
    compare: [{
      t: 'table', head: ['似然', '共轭先验', '用途（p17）'], rows: [
        ['Normal（方差已知）', 'Normal', '回归'], ['Normal（方差未知）', 'Inverse-Gamma / Inverse-Wishart', '回归'],
        ['Binomial', 'Beta', '二分类'], ['Multinomial', 'Dirichlet', '多分类'], ['Poisson', 'Gamma', '计数'], ['Logistic', '无', '需要近似'],
      ],
    }],
    pitfalls: [
      ['没有共轭就不能做 MAP', 'MAP 只需优化 log 似然 + log 先验，不需要归一化常数（2021 Q10）'],
      ['Laplace 近似总是好的', '后验多峰、重尾时效果差（p23）'],
    ],
    types: ['T09', 'T13'],
    quiz: [
      { q: '均匀先验，连续观察到 98 次日出。明天日出的后验概率？', type: 'num', answer: 0.99, tol: 1e-6, explain: '$\\frac{98+1}{98+2}=0.99$。' },
      { q: 'Naive Bayes 属于？', options: ['生成模型', '判别模型'], answer: 0, explain: '它建模 $P(\\bx\\mid y)P(y)$（L19 p10）。' },
    ],
  }));
})(window);
