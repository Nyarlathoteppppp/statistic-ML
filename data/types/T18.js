/* T18 — RNNs, attention and the Transformer (L14): short answers plus two small calculations. */
(function (root) {
  'use strict';
  const T = String.raw;

  root.SML.content.add({
    id: 'T18',
    eyebrow: '题型 T18 · 往年 2/7 份（2021 Q1；2022 Q1(b)(c) 各 5 分）',
    title: 'RNN、Attention、Transformer：简答为主',
    en: 'RNNs, attention and the Transformer',
    chips: [
      { text: 'L14 p3–p21', href: '#/L14', cls: 'src' }, { text: '2021 Q1', cls: 'hot' }, { text: '2022 Q1(b)(c)', cls: 'hot' },
    ],
    lead: T`往年只考简答，问法就三个：**RNN 在什么意义上"深"**、**处理序列时 RNN 比 CNN 好在哪**、**attention 怎么处理变长输入**。再补两个可能的小计算：RNN 参数个数（和 [T3](#/T03) CNN 计数同一个思路）和一步 attention 加权平均。背熟第 2 节四段英文，这一类就稳了。`,
    blocks: [
      { t: 'h2', text: '1. 必背', id: 'core' },
      {
        t: 'table', head: ['概念', '一句话', '出处'], rows: [
          ['RNN', '从左到右逐个读入 $\\bx^{(t)}$，隐藏状态 $\\mathbf h^{(t)}=\\tanh(\\mathbf b+W\\mathbf h^{(t-1)}+U\\bx^{(t)})$ 概括到 $t$ 为止的全部输入', 'L14 p7、p12'],
          ['为什么"深"', '展开后深度 = 序列长度，每层（每个时间步）共享同一组参数 $\\mathbf b,W,U,\\mathbf c,V$', 'L14 p8、p12'],
          ['三种用法', '序列分类（用最后的隐藏状态）、序列标注（每步一个输出）、encoder–decoder（翻译）', 'L14 p9–p11'],
          ['CNN 处理序列的缺点', '1D 卷积（time delay NN）的感受野受 filter 宽度限制，只能靠加深扩大', 'L14 p6'],
          ['BPTT 与梯度消失', '$\\partial\\mathbf h^{(T)}/\\partial\\mathbf h^{(1)}$ 含 $W^{T-1}$，最大特征值 $<1$ 消失、$>1$ 爆炸；学不到 10 步以上的依赖', 'L14 p13'],
          ['LSTM', '加一条细胞状态，由 sigmoid 门（forget 等）控制，信息可以近乎原样传很远，缓解梯度消失', 'L14 p14'],
          ['Attention', '$\\mathbf c=\\sum_j\\alpha_j\\mathbf h^{(j)}$，$\\alpha_j=\\frac{\\exp(e_j)}{\\sum_{j\'}\\exp(e_{j\'})}$，$e_j=f(\\mathbf h^{(j)})$：对所有隐藏状态加权平均', 'L14 p17–p18'],
          ['Self-attention / Transformer', '每个位置把自己当 query，对其余位置做 attention；不用循环、可并行；没有位置信息，要另加位置编码；加 residual、normalisation、多头、深堆叠', 'L14 p20–p21'],
        ],
      },

      { t: 'h2', text: '2. 简答写法', id: 'phrases' },
      {
        t: 'exam', title: 'RNN 在什么意义上是深的（2021 Q1）',
        md: T`When unrolled over a sequence of length $T$, an RNN becomes a feed-forward network with $T$ layers, one per time step, so its depth equals the sequence length; the layers share the same parameters, and gradients must be propagated back through all $T$ steps (BPTT), which is why it suffers from vanishing/exploding gradients like other very deep networks.`,
      },
      {
        t: 'exam', title: 'RNN 相对 CNN 的好处（2022 Q1(b)）',
        md: T`A CNN applied to a sequence only sees a fixed window: its receptive field is limited by the filter width and network depth. An RNN carries a hidden state $\mathbf h^{(t)}$ that summarises all inputs up to $t$, so in principle it can use information from arbitrarily far back and naturally handles sequences of any length with the same shared parameters.`,
      },
      {
        t: 'exam', title: 'Attention 处理变长输入（2022 Q1(c)）',
        md: T`Attention computes a score $e_j$ for every element (hidden state) of the input, normalises the scores with a softmax to weights $\alpha_j$ that sum to one, and returns the weighted average $\mathbf c=\sum_j\alpha_j\mathbf h^{(j)}$. Because the sum runs over however many elements there are, the output has a fixed size regardless of the input length, and it avoids squeezing the whole sequence into the last hidden state.`,
      },
      {
        t: 'exam', title: 'LSTM 为什么缓解梯度消失',
        md: T`The LSTM adds a cell state that is updated additively and scaled by a sigmoid forget gate rather than repeatedly multiplied by $W$; when the gate is close to 1, information and gradients pass through many time steps almost unchanged, so long-range dependencies can be learned.`,
      },

      { t: 'h2', text: '3. 两个可能的小计算', id: 'calc' },
      {
        t: 'steps', items: [
          T`**RNN 参数个数**（L14 p12 的参数是 $\mathbf b,W,U,\mathbf c,V$）：输入维度 $d$、隐藏维度 $h$、输出维度 $k$。$U$：$h\times d$，$W$：$h\times h$，$\mathbf b$：$h$，$V$：$k\times h$，$\mathbf c$：$k$。例 $d=3,h=4,k=2$：$12+16+4+8+2=42$。**与序列长度 $T$ 无关**（参数在时间步之间共享）。`,
          T`**一步 attention**：两个隐藏状态 $\mathbf h^{(1)}=(4,0)$、$\mathbf h^{(2)}=(0,4)$，分数 $e=(0,\ln3)$。softmax：$\alpha=\big(\frac{1}{1+3},\frac{3}{1+3}\big)=(0.25,0.75)$。$\mathbf c=0.25(4,0)+0.75(0,4)=(1,3)$。`,
        ],
      },

      { t: 'h2', text: '4. 往年原题（先自己写，再看答案）', id: 'past' },
      { t: 'examqPick', picks: [['c40', '2021 Q1'], ['c40', '2022 S1 Q1(b)'], ['c41', '2022 S1 Q1(c)']] },
      { t: 'note', md: '架构图（折叠 / 展开、三种用法、BPTT、LSTM）见 [c40](#/c40)；Transformer 结构见 [c41](#/c41)。' },

      { t: 'h2', text: '5. 易错点', id: 'pitfalls' },
      {
        t: 'table', head: ['错误', '正确'], rows: [
          ['RNN 的"深"指隐藏层很多', '指**沿时间展开**后深度 = 序列长度'],
          ['RNN 每个时间步有自己的参数', '所有时间步共享 $\\mathbf b,W,U,\\mathbf c,V$；参数个数与 $T$ 无关'],
          ['梯度消失只因为 sigmoid', 'RNN 里主要来自重复乘 $W$：$W^{T-1}$（L14 p13）'],
          ['self-attention 天然知道词序', '它对位置不敏感，要额外加位置信息（L14 p20）'],
          ['attention 的权重随便加起来', '先 softmax，权重非负且和为 1'],
        ],
      },
      {
        t: 'quiz', items: [
          { q: 'RNN：输入维度 5，隐藏维度 10，输出维度 3（都含偏置）。参数总数？', type: 'num', answer: 193, explain: '$U$ 50 + $W$ 100 + $\\mathbf b$ 10 + $V$ 30 + $\\mathbf c$ 3 = 193。' },
          { q: '三个分数 $e=(0,0,\\ln2)$。第三个位置的 attention 权重？', type: 'num', answer: 0.5, explain: '$\\exp(e)=(1,1,2)$，和为 4，权重 $(0.25,0.25,0.5)$。' },
          {
            q: '线性 RNN 中 $W$ 的最大特征值是 0.5，序列长 20。从最后一步传回第一步的梯度大致会：', type: 'mc',
            options: ['爆炸', '消失（约乘 $0.5^{19}$）', '不变', '变成负数'], answer: 1,
            explain: '梯度含 $W^{T-1}$，最大特征值小于 1 时按 $0.5^{19}$ 量级衰减。',
          },
        ],
      },
    ],
  });
})(window);
