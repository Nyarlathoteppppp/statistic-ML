(function (root) {
  'use strict';
  const T = String.raw;
  root.SML.content.add(root.SML.lecture({
    id: 'L03',
    eyebrow: '单元 1 · Bozorgi · Q1a 必考定义',
    chips: ['L03 p1–p28', { text: 'T8 XOR 特征', href: '#/T08/xor' }],
    lead: '线性回归的两种推导（最小化平方误差 / Gaussian 噪声下的 MLE）得到同一个正规方程。basis expansion 让线性模型处理非线性数据，是 kernel 和神经网络的前身。',
    oneLiner: {
      zh: '线性回归最小化残差平方和，解是 $\\hat\\bw=(\\bX\'\\bX)^{-1}\\bX\'\\by$；它等价于 Gaussian 噪声下的 MLE。basis expansion $\\varphi(\\bx)$ 后模型对参数仍是线性的。',
      en: T`Linear regression minimises the residual sum of squares $\sum_i(y_i-\mathbf w'\mathbf x_i)^2$, with closed-form solution $\hat{\mathbf w}=(\mathbf X'\mathbf X)^{-1}\mathbf X'\mathbf y$; this is also the MLE under i.i.d. Gaussian noise. With a basis expansion $\varphi(\mathbf x)$ the model stays linear in the parameters but can fit non-linear functions.`,
    },
    defs: [
      ['RSS', '$\\sum_i(y_i-\\bw\'\\bx_i)^2=\\|\\by-\\bX\\bw\\|^2$', 'p6–p10'],
      ['dummy feature', '$x_0=1$ 把截距并入 $\\bw$', 'p9'],
      ['正规方程', '$\\bX\'\\bX\\hat\\bw=\\bX\'\\by$；$\\bX\'\\bX$ 可逆（列满秩）时才有唯一解 $(\\bX\'\\bX)^{-1}\\bX\'\\by$', 'p17'],
      ['basis expansion', '$\\varphi:\\mathbb R^m\\to\\mathbb R^k$，在新特征上做线性模型', 'p20–p22'],
      ['RBF', '$\\varphi(\\bx)=\\psi(\\|\\bx-\\bm z\\|)$，如 $\\exp(-\\frac1\\sigma\\|\\bx-\\bm z\\|^2)$', 'p25'],
    ],
    formulas: [
      {
        t: 'deep', title: '展开详解：为什么 MLE = 最小二乘', blocks: [
          '$y_i=\\bw\'\\bx_i+\\varepsilon_i$，$\\varepsilon_i\\sim\\mathcal N(0,\\sigma^2)$ 独立。对数似然：',
          { t: 'math', tex: T`\log\prod_i\frac{1}{\sqrt{2\pi\sigma^2}}e^{-\frac{(y_i-\bw'\bx_i)^2}{2\sigma^2}}=-\frac{n}{2}\log(2\pi\sigma^2)-\frac{1}{2\sigma^2}\sum_i(y_i-\bw'\bx_i)^2` },
          '第一项与 $\\bw$ 无关，最大化对数似然 ⇔ 最小化 $\\sum_i(y_i-\\bw\'\\bx_i)^2$。对 $\\bw$ 求导为零：$\\bX\'(\\by-\\bX\\bw)=0$ ⇒ 正规方程（p15–p17）。',
        ],
      },
    ],
    examples: [
      '1D 例子（p4–p9）：用温度 $T$ 预测湿度 $H$，拟合直线 $H=25.3+0.77T$（L18 p6 也用了这个例子）。',
      'XOR 例子（p24）：4 个点线性不可分，用到 4 个角的距离作为新特征 $\\varphi_i(\\bx)=\\|\\bx-\\bm z_i\\|$，取 $\\bw=(1,0,0,1)$，A 类得分 $\\sqrt2$、B 类得分 2，线性可分。完整解见 [T8](#/T08/xor)。',
    ],
    pitfalls: [
      ['basis expansion 后模型就不是"线性回归"了', '对参数仍是线性的，仍然有闭式解'],
      ['特征共线时正规方程照样能解', '$\\bX\'\\bX$ 不可逆，解不唯一 → 需要正则化（L05）'],
      ['basis 越多越好', '基函数要事先选；放在所有训练点上会有 $n$ 个特征，计算量大、易过拟合（p26）'],
    ],
    types: ['T08', 'T13'],
    quiz: [
      {
        q: '$\\bX\'\\bX=\\begin{bmatrix}2&0\\\\0&4\\end{bmatrix}$，$\\bX\'\\by=\\begin{bmatrix}4\\\\2\\end{bmatrix}$。$\\hat w_2$ 是多少？', type: 'num', answer: 0.5,
        explain: '对角矩阵直接除：$\\hat w_1=4/2=2$，$\\hat w_2=2/4=0.5$。',
      },
      { q: '线性回归最小化的量是什么（英文一句话）？', type: 'show', answerText: 'The sum of squared residuals (errors) between targets and predictions, $\\sum_i(y_i-\\mathbf w\'\\mathbf x_i)^2$.' },
    ],
  }));
})(window);
