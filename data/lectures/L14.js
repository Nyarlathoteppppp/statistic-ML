(function (root) {
  'use strict';
  const T = String.raw;
  root.SML.content.add(root.SML.lecture({
    id: 'L14',
    eyebrow: '单元 4 · Jiang · 2021 Q1',
    chips: ['L14 p1–p22', 'WK09'],
    lead: '处理变长序列：RNN 沿时间展开、共享参数；长序列有梯度消失，LSTM 用"复制 + 门控"缓解；attention 不再只依赖最后一个隐藏状态，Transformer 只用 self-attention，可以并行。',
    oneLiner: {
      zh: 'RNN 在每个时间步用同一组参数更新隐藏状态，展开后深度 = 序列长度，梯度要连乘很多次（线性 RNN 中就是 $W^{T-1}$），容易消失或爆炸。Attention 用对所有隐藏状态的加权平均作为上下文。',
      en: T`An RNN updates a hidden state $\mathbf h^{(t)}=\tanh(\mathbf W\mathbf h^{(t-1)}+\mathbf U\mathbf x^{(t)}+\mathbf b)$ with weights shared across time; unrolled, it is as deep as the sequence is long, so gradients are long products of recurrent Jacobians ($\mathbf W^{T-1}$ in the linear case) and tend to vanish or explode. LSTMs keep a gated cell state to preserve gradients; attention forms a context $\mathbf c=\sum_j\alpha_j\mathbf h^{(j)}$ with softmax weights, and Transformers rely on self-attention, processing sequences in parallel.`,
    },
    defs: [
      ['RNN', '$\\bm a^{(t)}=\\bm b+W\\bm h^{(t-1)}+U\\bx^{(t)}$，$\\bm h^{(t)}=\\tanh(\\bm a^{(t)})$，$\\bm o^{(t)}=\\bm c+V\\bm h^{(t)}$', 'p12'],
      ['unfold', '展开成一条链，深度 = 序列长度，参数在各层共享', 'p7–p8'],
      ['BPTT', 'backpropagation through time：每个位置的损失梯度一直传回开头', 'p13'],
      ['vanishing gradient', '线性 RNN 中 $\\partial\\bm h^{(T)}/\\partial\\bm h^{(1)}=W^{T-1}$，谱半径（特征值绝对值的最大值）<1 消失、>1 爆炸；非线性 RNN 还要乘激活函数的导数', 'p13'],
      ['LSTM', '状态自环靠复制 + sigmoid forget gate 缩放，保持梯度大小', 'p14'],
      ['attention', '$\\bm c=\\sum_j\\alpha_j\\bm h^{(j)}$，$\\alpha=\\mathrm{softmax}(e)$，$e_j=f(\\bm h^{(j)})$', 'p17'],
      ['self-attention', '序列中每个位置以自己为 query，关注其他所有位置', 'p20'],
      ['Transformer', 'self-attention + residual + normalization + multi-head，高度并行', 'p21'],
    ],
    compare: [{
      t: 'table', head: ['应用', '结构', '出处'], rows: [
        ['sequence classification', '用最后一个隐藏状态做分类', 'p9'],
        ['sequence tagging', '每个位置输出一个标签', 'p10'],
        ['encoder–decoder（翻译）', 'encoder 压成 context $C$，decoder 逐词生成', 'p11'],
      ],
    }],
    pitfalls: [
      ['RNN 的"深"是因为堆了很多层', '是沿时间展开的深度（2021 Q1）'],
      ['每个时间步有不同的参数', '$W,U,V,\\bm b,\\bm c$ 在所有时间步共享'],
    ],
    types: ['T13'],
    quiz: [
      { q: '序列长度 50 的 RNN 展开后有多"深"？', type: 'num', answer: 50, explain: '深度等于序列长度（L14 p8）。' },
      { q: 'Attention 解决了 encoder–decoder 的什么问题？', type: 'show', answerText: '不再把整个输入压进最后一个隐藏状态；每一步可以按需关注输入的不同位置，长序列信息不易丢失。' },
    ],
  }));
})(window);
