(function (root) {
  'use strict';
  const T = String.raw;
  root.SML.content.add(root.SML.lecture({
    id: 'L12',
    eyebrow: '单元 4 · Jiang · 2021 Q7、Q9',
    chips: ['L12 p1–p32', 'WK07'],
    lead: '深度网络的训练目标是非凸的，所以要更好的优化器（momentum、Adagrad、Adam）和正则化。后半讲是 autoencoder：学一个压缩表示，线性情况下几乎就是 PCA。',
    oneLiner: {
      zh: 'SGD 在非凸目标上会卡在平坦区和鞍点；momentum 累积速度冲过去，Adagrad / Adam 给每个参数自适应步长。Autoencoder 让网络重建自己的输入，中间的瓶颈层就是学到的低维表示。',
      en: T`Deep-network objectives are non-convex, so plain SGD can stall on plateaus and saddle points. Momentum accumulates a velocity of past gradients to move through them; Adagrad and Adam adapt per-parameter learning rates. An autoencoder is trained to reconstruct its input through a bottleneck, learning a compressed representation; with linear layers and squared loss it is almost PCA (a linear projection, though not necessarily the principal axes).`,
    },
    defs: [
      ['SGD / mini-batch', '用单个样本 / 一小批的梯度更新，便宜、带噪声', 'p7–p9'],
      ['momentum', '$\\bv^{(t)}=\\alpha\\bv^{(t-1)}+\\eta\\nabla L$，$\\theta^{(t)}=\\theta^{(t-1)}-\\bv^{(t)}$', 'p12'],
      ['Adagrad', '累积平方梯度 $g_i$，步长 $\\eta/\\sqrt{g_i+\\epsilon}$：常更新的参数步长变小', 'p13'],
      ['Adam', 'momentum（一阶矩）+ 自适应步长（二阶矩）+ 偏差校正，$\\beta_1=0.9,\\beta_2=0.999$', 'p14'],
      ['正则化', 'L2 weight decay（梯度加 $2\\lambda w$）、early stopping、dropout', 'p17–p21'],
      ['autoencoder', '目标 $\\by_i=\\bx_i$；encoder 压缩到 bottleneck，decoder 重建', 'p22–p26'],
      ['PCA', '找方差最大的方向：$\\max\\mathbf p\'\\Sigma\\mathbf p$ s.t. $\\|\\mathbf p\\|=1$ ⇒ $\\Sigma$ 的特征向量', 'p28–p31'],
    ],
    compare: [{
      t: 'table', head: ['', 'PCA', 'autoencoder'], rows: [
        ['映射', '线性', '可以非线性'], ['求解', '特征分解（闭式）', '梯度下降'],
        ['关系', '线性单隐层 AE 几乎就是 PCA（课件 p30：不直接用特征值，解可能不同）', '非线性 AE 能学弯曲的结构'],
      ],
    }],
    pitfalls: [
      ['momentum 保证找到全局最优', '只是更容易冲过平坦区和小的局部极小，不保证'],
      ['瓶颈够窄，AE 就一定学到有用表示', '编码器 / 解码器太强时可以"记住"训练样本，学到无意义的编码（p26，2021 Q9）'],
      ['学习率越大越快', '太大会发散或来回振荡'],
    ],
    types: ['T13'],
    quiz: [
      {
        q: 'Adagrad 中，一个参数历史梯度平方和很大，它的有效学习率会？', options: ['变大', '变小', '不变'], answer: 1,
        explain: '步长 $\\eta/\\sqrt{g_i+\\epsilon}$，$g_i$ 大则步长小。',
      },
      { q: '为什么训练深度网络用 SGD / mini-batch 而不是全量梯度下降？', type: 'show', answerText: '每一步只用一个样本或一小批，计算便宜得多，可以在同样时间内更新很多次（L12 p8–p9）。卡在平坦区 / 鞍点的问题由 momentum 等方法缓解（p10–p12）。' },
    ],
  }));
})(window);
