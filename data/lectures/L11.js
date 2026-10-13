(function (root) {
  'use strict';
  const T = String.raw;
  root.SML.content.add(root.SML.lecture({
    id: 'L11',
    eyebrow: '单元 4 · Jiang',
    chips: ['L11 p1–p32', { text: 'T10 Backprop', href: '#/T10' }],
    lead: '多层感知机 = 线性层 + 非线性激活的堆叠。隐藏层可以看成学出来的特征变换（2021 Q4）。训练靠 backpropagation，也就是对复合函数用链式法则。',
    oneLiner: {
      zh: 'MLP 每层算 $\\mathbf u=g(V\'\\bx)$，输出层在 $\\mathbf u$ 上算线性打分（可能再接一个输出激活），所以隐藏层是可学习的非线性 basis。backprop 用链式法则逐层往回传误差 $\\delta$。',
      en: T`A multilayer perceptron composes linear maps with non-linear activations; the hidden layers compute a learned non-linear representation $\mathbf u=\varphi(\mathbf x)$ on which the output layer computes a linear score (optionally followed by an output activation). Gradients are computed by backpropagation, i.e. the chain rule applied layer by layer, reusing error terms $\delta$ from the layer above.`,
    },
    why: [
      '感知机只能表示线性边界（XOR 做不到）。加一个隐藏层就能组合出任意布尔函数（最多 $2^m$ 个隐藏单元，p15），并且足够宽的单隐层网络能逼近任意连续函数（universal approximation，p11–p12）。',
      '深度的好处：用更少的单元表示复杂函数，逐层学到越来越抽象的特征（p14–p24）。',
    ],
    defs: [
      ['activation', 'step、sign、logistic $\\frac1{1+e^{-s}}$、tanh、ReLU $\\max(0,s)$', 'p7'],
      ['隐藏单元', '$u_j=g(r_j)$，$r_j=\\sum_{i=0}^m x_iv_{ij}$', 'p9'],
      ['输出', '$z=h(s)$，$s=\\sum_{j=0}^p u_jw_j$', 'p9'],
      ['$\\delta$', '$\\partial L/\\partial s=\\frac{\\partial L}{\\partial z}\\frac{\\partial z}{\\partial s}$；平方损失 + 恒等输出时 $\\delta=z-y$', 'p28'],
      ['$\\varepsilon_j$', '$\\partial L/\\partial r_j=\\delta\\,w_j\\,g\'(r_j)$', 'p28'],
    ],
    formulas: [
      {
        t: 'fx', title: '隐藏层权重的梯度（L11 p27–p31）',
        tex: T`\frac{\partial L}{\partial v_{ij}}=\htmlClass{fx-p1}{\frac{\partial L}{\partial z}\frac{\partial z}{\partial s}}\ \htmlClass{fx-p2}{\frac{\partial s}{\partial u_j}}\ \htmlClass{fx-p3}{\frac{\partial u_j}{\partial r_j}}\ \htmlClass{fx-p4}{\frac{\partial r_j}{\partial v_{ij}}}=\htmlClass{fx-p1}{\delta}\,\htmlClass{fx-p2}{w_j}\,\htmlClass{fx-p3}{g'(r_j)}\,\htmlClass{fx-p4}{x_i}`,
        intro: '$L$ 不直接含 $v_{ij}$，但 $v_{ij}\\to r_j\\to u_j\\to s\\to z\\to L$ 一路相连，链式法则把每一环的导数乘起来。',
        parts: [
          { label: '$\\delta$', note: '输出端的误差，$=z-y$（平方损失、恒等输出）。所有隐藏层梯度都复用它。' },
          { label: '$w_j$', note: '$s=\\sum_ju_jw_j$ 对 $u_j$ 的导数。' },
          { label: "$g'(r_j)$", note: '激活函数的导数。logistic 时 $=u_j(1-u_j)$。' },
          { label: '$x_i$', note: '$r_j=\\sum_ix_iv_{ij}$ 对 $v_{ij}$ 的导数。' },
        ],
      },
      { t: 'math', tex: T`\frac{\partial L}{\partial w_j}=\delta\,u_j` },
    ],
    pitfalls: [
      ['深层网络只要线性层叠加就够强', '没有非线性，多层线性 = 一层线性'],
      ['隐藏层权重和 loss 没关系，梯度为 0', '通过链式法则间接相关'],
    ],
    types: ['T10', 'T13'],
    quiz: [
      { q: '为什么网络需要非线性激活？', type: 'show', answerText: '线性函数的复合仍是线性的；没有非线性激活，多层网络等价于一个线性模型。' },
      { q: 'logistic 激活在 $r=0$ 处的导数？', type: 'num', answer: 0.25, explain: '$g\'(r)=g(r)(1-g(r))=0.5\\times0.5$。' },
    ],
  }));
})(window);
