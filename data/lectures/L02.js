(function (root) {
  'use strict';
  const T = String.raw;
  root.SML.content.add(root.SML.lecture({
    id: 'L02',
    eyebrow: '单元 1 · Bozorgi · 定义题来源',
    chips: ['L02 p1–p31'],
    lead: '三种"统计学派"给出三种学参数的方法：频率学派（MLE）、决策论（最小化风险 / ERM）、Bayesian（后验）。往年卷的定义题（marginal likelihood、MLE vs MAP）都从这里来。',
    oneLiner: {
      zh: '频率学派把参数当固定未知常数，用 MLE 估计；决策论选最小化期望损失的决策规则，实际用训练集上的经验风险（ERM）；Bayesian 把参数当随机变量，用先验 × 似然得到后验。',
      en: T`Frequentists treat parameters as fixed unknowns and estimate them by maximum likelihood; decision theory picks the rule minimising expected loss (risk), approximated by empirical risk minimisation; Bayesians treat parameters as random, combining prior and likelihood into a posterior $p(\theta\mid D)\propto p(D\mid\theta)p(\theta)$.`,
    },
    defs: [
      ['bias / variance of an estimator', '$E[\\hat\\theta]-\\theta$ / $\\mathrm{Var}(\\hat\\theta)$；样本均值无偏、方差 $\\sigma^2/n$', 'p6–p9'],
      ['consistency', '$n\\to\\infty$ 时估计收敛到真值', 'p9'],
      ['MLE', '$\\hat\\theta=\\argmax_\\theta\\prod_ip(x_i;\\theta)$："让观测数据最可能的参数"', 'p10–p14'],
      ['risk / ERM', '期望损失 $E[l(Y,f(X))]$；分布未知，用训练集平均损失代替', 'p16–p18'],
      ['prior / posterior / evidence', '$p(\\theta)$ / $p(\\theta\\mid D)$ / $p(D)=\\int p(D\\mid\\theta)p(\\theta)d\\theta$', 'p21–p24'],
      ['MAP', '后验众数；均匀先验时 = MLE', 'p25–p26'],
      ['parametric vs non-parametric', '参数个数固定 vs 随数据增长', 'p28–p29'],
      ['generative vs discriminative', '建模 $P(X,Y)$ vs 只建模 $P(Y\\mid X)$', 'p30'],
    ],
    formulas: [
      {
        t: 'deep', title: '展开详解：Bernoulli 的 MLE（考试可能让你推）', open: false, blocks: [
          '$n$ 次抛硬币，$k$ 次正面：$L(\\theta)=\\theta^k(1-\\theta)^{n-k}$。取对数 $k\\log\\theta+(n-k)\\log(1-\\theta)$，求导 $\\frac k\\theta-\\frac{n-k}{1-\\theta}=0$ ⇒ $\\hat\\theta=k/n$（L02 p11–p14）。',
          'MLE 的固定步骤：写似然（独立样本相乘）→ 取对数（单调，最大值点不变）→ 求导 = 0 → 解出参数（必要时检查二阶导）。',
        ],
      },
      { t: 'math', tex: T`E\big[(\theta-\hat\theta)^2\big]=\text{bias}(\hat\theta)^2+\mathrm{Var}(\hat\theta)\qquad(\text{L02 p19，平方损失下的参数估计})` },
    ],
    compare: [{
      t: 'table', head: ['', '频率学派', 'Bayesian'], rows: [
        ['参数', '固定未知常数', '随机变量（表达信念）'],
        ['结果', '点估计（MLE）', '整个后验分布'],
        ['先验', '不用', '必须指定'],
        ['点估计', 'MLE', '后验均值或 MAP（若一定要一个值）'],
      ],
    }],
    pitfalls: [
      ['MAP 和 MLE 是不同学派，没有关系', 'MAP = MLE + log prior；均匀先验时相同（p26）'],
      ['边缘似然是在最优参数处的似然', '是对参数**积分**（平均），不是取最大'],
    ],
    types: ['T09', 'T13'],
    quiz: [
      { q: 'Bernoulli 数据 10 次中 3 次为 1，MLE 是？', type: 'num', answer: 0.3, explain: '$\\hat\\theta=k/n$。' },
      { q: 'Logistic regression 是生成模型还是判别模型？', options: ['生成', '判别'], answer: 1, explain: '只建模 $P(y\\mid\\bx)$。' },
    ],
  }));
})(window);
