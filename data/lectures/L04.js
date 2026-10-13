(function (root) {
  'use strict';
  const T = String.raw;
  root.SML.content.add(root.SML.lecture({
    id: 'L04',
    eyebrow: '单元 1 · Bozorgi',
    chips: ['L04 p1–p32'],
    lead: '大多数模型没有闭式解，只能迭代优化：一阶的梯度下降、二阶的 Newton-Raphson。Logistic regression 是第一个例子：模型是线性的，但必须迭代求解。',
    oneLiner: {
      zh: 'Logistic regression 用 sigmoid 把 $\\bw\'\\bx$ 变成 $P(y=1\\mid\\bx)$，按 Bernoulli 似然做 MLE（等价于最小化 cross-entropy）；决策边界仍是线性的；没有闭式解，用 GD 或 Newton 求。',
      en: T`Logistic regression models $P(y=1\mid\mathbf x)=\sigma(\mathbf w'\mathbf x)=1/(1+e^{-\mathbf w'\mathbf x})$ and is fitted by maximum likelihood under a Bernoulli model, equivalently by minimising cross-entropy. Its decision boundary $\mathbf w'\mathbf x=0$ is linear. There is no closed form, so it is trained iteratively (gradient descent or Newton–Raphson); the negative log-likelihood is convex.`,
    },
    defs: [
      ['argmin vs min', '训练要的是**参数**（minimizer），不是损失的最小值', 'p6'],
      ['log trick', '$\\log$ 单调，最大化 $\\log L$ 与最大化 $L$ 同解', 'p7'],
      ['gradient descent', '$\\theta\\leftarrow\\theta-\\eta\\nabla L(\\theta)$', 'p9–p10'],
      ['SGD / mini-batch', '每步只用一个样本 / 一小批的梯度', 'p10'],
      ['Newton-Raphson', '$\\theta\\leftarrow\\theta-(\\nabla^2L)^{-1}\\nabla L$，用曲率', 'p12–p16'],
      ['sigmoid', '$\\sigma(s)=1/(1+e^{-s})$，把实数压到 $(0,1)$', 'p22'],
      ['cross-entropy', '$-\\sum_i[y_i\\log\\mu_i+(1-y_i)\\log(1-\\mu_i)]$', 'p29–p31'],
    ],
    compare: [{
      t: 'table', head: ['', 'Gradient descent', 'Newton-Raphson'], rows: [
        ['用到', '一阶导', '一阶 + Hessian'],
        ['每步代价', '$O(p)$', '$O(p^3)$（求逆）+ $O(p^2)$ 内存'],
        ['收敛', '迭代多，可能在狭长山谷里 zigzag', '迭代少（局部二次近似）'],
        ['调参', '要选步长 $\\eta$', '通常不需要步长'],
      ],
    }, {
      t: 'table', head: ['', 'linear regression', 'logistic regression'], rows: [
        ['$y\\mid\\bx$', '$\\mathcal N(\\bx\'\\bw,\\sigma^2)$', '$\\mathrm{Bernoulli}(\\sigma(\\bx\'\\bw))$'],
        ['MLE 等价于', '最小二乘', '最小化 cross-entropy'],
        ['闭式解', '有（列满秩时）', '无（负对数似然是凸的；没有共线特征时严格凸，p27–p28）'],
      ],
    }],
    examples: ['p19–p21：用 BMI 预测 2 型糖尿病。用线性回归做分类时，离边界很远但分类正确的点会因平方损失被重罚，把边界拉偏。Logistic 回归用概率建模，避免这个问题。'],
    pitfalls: [
      ['logistic regression 是非线性分类器', 'sigmoid 是非线性的，但决策边界 $\\bw\'\\bx=0$ 是线性的'],
      ['Newton 总是更好', '高维时 Hessian 求逆太贵，而且离最优点远时可能不稳定'],
    ],
    types: ['T13'],
    quiz: [
      { q: '$\\sigma(0)$ 等于多少？', type: 'num', answer: 0.5, explain: '$1/(1+e^0)=1/2$；这就是决策边界的位置。' },
      { q: 'Logistic regression 为什么不能像线性回归那样直接解出 $\\bw$？', type: 'show', answerText: '令梯度为零得到的方程含 sigmoid，是非线性的，没有闭式解，只能迭代求解（目标是凸的，所以 GD 能到全局最优）。' },
    ],
  }));
})(window);
