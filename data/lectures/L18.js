(function (root) {
  'use strict';
  const T = String.raw;
  root.SML.content.add(root.SML.lecture({
    id: 'L18',
    eyebrow: '单元 6 · Jiang · 2021 Q5、Q11',
    chips: ['L18 p1–p27', { text: 'T9 Bayesian', href: '#/T09/blr' }],
    lead: '点估计（MLE / MAP）不表达不确定性。Bayesian 线性回归保留整个后验，预测时对所有可能的 $\\bw$ 取平均，于是预测方差会随测试点变化：离数据越远越不确定。',
    oneLiner: {
      zh: 'Normal 先验 × Normal 似然 → Normal 后验（共轭），有闭式解 $\\bw_N,V_N$。后验众数就是 ridge（MAP）；完整 Bayesian 预测是 $\\mathcal N(\\bx_*\'\\bw_N,\\ \\sigma^2+\\bx_*\'V_N\\bx_*)$。',
      en: T`With prior $\mathbf w\sim\mathcal N(\mathbf 0,\gamma^2I)$ and likelihood $y\sim\mathcal N(\mathbf x'\mathbf w,\sigma^2)$ the posterior is Gaussian (conjugacy): $\mathbf w\mid D\sim\mathcal N(\mathbf w_N,V_N)$ with $V_N=\sigma^2(\mathbf X'\mathbf X+\frac{\sigma^2}{\gamma^2}I)^{-1}$ and $\mathbf w_N=\frac1{\sigma^2}V_N\mathbf X'\mathbf y$. Its mode is the ridge/MAP solution; the predictive distribution $\mathcal N(\mathbf x_*'\mathbf w_N,\sigma^2+\mathbf x_*'V_N\mathbf x_*)$ is more uncertain far from the training data.`,
    },
    why: [
      '数据少时，很多条直线都和数据一致。点估计只挑一条，等于假装很确定（p5–p11）。Bayesian 的说法：**不要只选一个解，按后验概率给所有解加权**，好处是小数据下更不容易过拟合（p11）。',
    ],
    defs: [
      ['Fisher information', '$\\mathcal I=\\frac1{\\sigma^2}\\bX\'\\bX$，负对数似然在 $\\hat\\bw$ 处的曲率（频率学派的"确定程度"）', 'p7'],
      ['posterior', '$p(\\bw\\mid\\bX,\\by)=\\frac{p(\\by\\mid\\bX,\\bw)p(\\bw)}{p(\\by\\mid\\bX)}$', 'p15'],
      ['conjugate', 'Normal–Normal：后验仍是 Normal，有闭式解', 'p17'],
      ['sequential update', '每来一个数据点，后验变成新的先验；后验越来越窄', 'p20–p21'],
      ['predictive', '$p(y_*\\mid\\bx_*,D)=\\int p(y_*\\mid\\bx_*,\\bw)p(\\bw\\mid D)d\\bw$', 'p23–p24'],
    ],
    formulas: [
      { t: 'math', tex: T`V_N=\sigma^2\Big(\bX'\bX+\frac{\sigma^2}{\gamma^2}I_D\Big)^{-1},\qquad \bw_N=\frac{1}{\sigma^2}V_N\bX'\by,\qquad y_*\sim\mathcal N\big(\bx_*'\bw_N,\ \sigma^2+\bx_*'V_N\bx_*\big)` },
    ],
    compare: [{
      t: 'table', head: ['', 'MAP', 'approximate Bayes', 'exact Bayes'], rows: [
        ['用后验的什么', '众数', '采样平均（Monte Carlo）', '解析期望'],
        ['预测带宽', '固定', '随 $\\bx_*$ 变', '随 $\\bx_*$ 变'],
        ['出处', 'p22', 'p22–p23', 'p22–p24'],
      ],
    }],
    examples: ['p25：$y=x\\sin x$ 数据、三次多项式模型。MLE 和 MAP 的预测带宽度固定；Bayesian 的预测带在没有数据的地方变宽，后验采样的曲线在数据外散开。'],
    pitfalls: [
      ['MAP 也算 Bayesian 预测', 'MAP 只取一个点，不保留不确定性'],
      ['$V_N$ 随测试点变化', '$V_N$ 训练完就固定了，随测试点变化的是 $\\bx_*\'V_N\\bx_*$'],
      ['噪声方差 $\\sigma^2$ 也是学出来的', '本讲假设 $\\sigma^2$ 已知；未知时用 Inverse-Gamma 先验，课件 p26 说预测变成 Student-t'],
    ],
    types: ['T09', 'T13'],
    quiz: [
      { q: '先验方差 $\\gamma^2\\to\\infty$（无信息先验）时，$\\bw_N$ 变成什么？', type: 'show', answerText: '普通最小二乘解 $(\\bX\'\\bX)^{-1}\\bX\'\\by$（正则项 $\\sigma^2/\\gamma^2\\to0$）。' },
      { q: '数据越来越多，后验会怎样？', options: ['越来越宽', '越来越窄，趋于一点', '不变'], answer: 1, explain: '数据在每个参数方向上都有信息时如此。L18 p21：sequential update 后验越来越尖。' },
    ],
  }));
})(window);
