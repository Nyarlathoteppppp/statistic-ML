(function (root) {
  'use strict';
  const T = String.raw;
  root.SML.content.add(root.SML.lecture({
    id: 'L10',
    eyebrow: '单元 3 · Bozorgi',
    chips: ['L10 p1–p47', 'WK05'],
    lead: '感知机是最简单的神经元：线性打分 + 阈值。训练规则只有一条：分错了就把样本加（或减）到权重上。数据线性可分时保证收敛。',
    oneLiner: {
      zh: '感知机预测 $\\sgn(\\bw\'\\bx)$；遇到 $y\\,\\bw\'\\bx\\le0$ 的样本就更新 $\\bw\\leftarrow\\bw+\\eta y\\bx$。这是对 perceptron loss $\\max(0,-sy)$ 做 SGD。线性可分时更新次数有限（$\\le R^2/\\gamma^2$），否则不收敛。',
      en: T`The perceptron predicts $\mathrm{sign}(\mathbf w'\mathbf x)$ and, whenever an example is misclassified ($y\,\mathbf w'\mathbf x\le0$), updates $\mathbf w\leftarrow\mathbf w+\eta y\mathbf x$ — SGD on the perceptron loss $\max(0,-y\,\mathbf w'\mathbf x)$. If the data are linearly separable it converges after at most $R^2/\gamma^2$ updates; otherwise it never converges.`,
    },
    defs: [
      ['score', '$s=\\sum_{j=0}^m w_jx_j=\\bw\'\\bx$，$x_0=1$ 是偏置输入', 'p7'],
      ['perceptron loss', '$L=\\max(0,-sy)$：分对为 0，分错为 $|s|$', 'p14'],
      ['梯度', '分对时 $\\mathbf 0$；分错时 $-y\\bx$', 'p17'],
      ['更新规则', '若 $sy\\le0$：$\\bw\\leftarrow\\bw+\\eta y\\bx$（$\\le$ 是为了处理 $\\bw=\\mathbf 0$ 的情况）', 'p18–p19'],
      ['收敛定理', '可分（margin $\\gamma$）、$\\|\\bx_i\\|\\le R$、从 $\\bw^{(0)}=\\mathbf 0$ 开始、$\\eta=1$ ⇒ 更新次数 $k\\le R^2/\\gamma^2$', 'p30–p31'],
      ['kernel perceptron', '$\\bw=\\sum_j\\alpha_jy_j\\bx_j$；分错时 $\\alpha_i\\leftarrow\\alpha_i+\\eta$，点积换成 $K$', 'p43–p46'],
    ],
    examples: [
      { t: 'h3', text: '课件例 2 手算（p33–p39，$\\eta=0.1$，权重 $(w_1,w_2,w_0)$）' },
      {
        t: 'table', head: ['样本', '$y$', '$y\\cdot s$', '更新？', '新权重 $(w_1,w_2,w_0)$'], rows: [
          ['初始', '', '', '', '$(0.2,\\ 0,\\ -0.1)$'],
          ['$(1,1)$', '$-1$', '$-(0.2+0-0.1)=-0.1\\le0$', '是：$\\bw-\\eta\\bx$', '$(0.1,\\ -0.1,\\ -0.2)$'],
          ['$(2,1)$', '$+1$', '$0.2-0.1-0.2=-0.1\\le0$', '是：$\\bw+\\eta\\bx$', '$(0.3,\\ 0,\\ -0.1)$'],
          ['$(1.5,0.5)$', '$+1$', '$0.45-0.1=0.35>0$', '否', '不变'],
        ],
      },
      { t: 'note', md: '偏置 $w_0$ 对应的输入恒为 1，所以它的更新是 $w_0\\pm\\eta$，不是 $\\pm\\eta x_1$。' },
    ],
    compare: [{
      t: 'table', head: ['', 'perceptron', 'SVM', 'logistic regression'], rows: [
        ['loss', '$\\max(0,-ys)$', '$\\max(0,1-ys)$（hinge）', '$\\log(1+e^{-ys})$'],
        ['分对但离边界很近', '无损失', '有损失', '有小损失'],
        ['解唯一', '否（取决于样本顺序）', '是（最大 margin）', '一般是（严格凸时；有共线特征则不唯一）'],
      ],
    }],
    pitfalls: [
      ['分对的样本也要更新', '只有 $ys\\le0$ 才更新'],
      ['不可分时会收敛到最好的线', '不收敛，会一直循环更新'],
    ],
    types: ['T13', 'T08'],
    quiz: [
      {
        q: '$\\bw=(0,0)$（无偏置），$\\eta=1$，样本 $\\bx=(2,-1)$，$y=-1$。更新后 $\\bw$ 的第一个分量？', type: 'num', answer: -2,
        explain: '$s=0$，$ys=0\\le0$ 要更新：$\\bw\\leftarrow\\bw+\\eta y\\bx=(-2,1)$。',
      },
      { q: '感知机收敛界 $R^2/\\gamma^2$ 说明了什么？', type: 'show', answerText: '数据的 margin $\\gamma$ 越大（越容易分开）、点的范数 $R$ 越小，需要的更新次数越少；与样本数和维数无关。' },
    ],
  }));
})(window);
