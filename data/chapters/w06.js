/* W6 · L11 神经网络基础 + L12 训练深度网络与自编码器 — chapters c33–c37 and review r06. */
(function (root) {
  'use strict';
  const SML = root.SML;
  const T = String.raw;
  const add = (c) => SML.content.add(SML.chapter(c));

  /* =====================================================================
   * c33 · MLP、激活、万能逼近（L11 p2–p24）
   * ===================================================================== */
  add({
    id: 'c33', week: 'W6', lec: 'L11', pages: 'L11 p2–p24', star: 2,
    title: 'MLP、激活函数、万能逼近', en: 'Multilayer perceptrons, activation functions, universal approximation',
    summary: '单个 perceptron 是线性分类器，解决不了 XOR。把它们**叠起来**、中间加**非线性激活函数**，就是 **MLP（multilayer perceptron，多层感知机）**——函数的复合。一个足够宽的隐藏层就能逼近任意连续函数（universal approximation）；更深的网络则学到逐层复杂的**表示（representation）**。',
    prereq: ['c12', 'c31'],
    symbols: [
      [T`$x_i$, $u_j$, $z_k$`, T`输入层、隐藏层、输出层的值（L11 记号）`],
      [T`$v_{ij}$`, T`输入 $i$ → 隐藏单元 $j$ 的权重`],
      [T`$w_{jk}$`, T`隐藏单元 $j$ → 输出 $k$ 的权重（单输出时写 $w_j$）`],
      [T`$r_j$, $s_k$`, T`隐藏单元、输出单元的加权输入（激活之前）`],
      [T`$g,\ h$`, T`隐藏层、输出层的激活函数`],
      [T`$m,\ p$`, T`输入个数、隐藏单元个数（都不含 bias 节点）`],
      [T`$x_0=1,\ u_0=1$`, T`**bias（偏置）**节点：恒等于 1 的假输入，它的权重就是截距。注意和 W3 的 Bias（偏差，估计的系统误差）不是一回事`],
      [T`$A$`, T`第一层权重矩阵，形状 $m\times p$，第 $i$ 行第 $j$ 列就是 $v_{ij}$`],
      [T`$A^\top\bx$`, T`矩阵乘向量：$p\times m$ 乘 $m$ 维 $=$ $p$ 维，一次算完 $p$ 个隐藏单元的 $r_j$`],
    ],
    goals: [
      '画出 feed-forward 网络，写出 $u_j=g(r_j)$、$z_k=h(s_k)$ 的前向计算',
      '写出 step / sign / logistic / tanh / ReLU 五种激活函数',
      '用两层 step 单元构造 XOR；解释为什么需要非线性激活',
      '说出 universal approximation 的内容，以及"深 vs 宽"、representation learning 的意思',
    ],
    types: ['T13', 'T03'],
    what: [
      { t: 'h3', text: '① 问题：一个 perceptron 解决不了 XOR（L11 p5–p6）' },
      T`**问题**（L11 p5–p6）：perceptron 是线性分类器；AND、OR 线性可分，XOR 不可分。办法：把多个 perceptron **组合**——$x_1\ \text{XOR}\ x_2=(x_1\ \text{OR}\ x_2)\ \text{AND}\ \text{NOT}(x_1\ \text{AND}\ x_2)$。`,
      { t: 'slide', src: 'L11/p06', caption: 'AND、OR 都能用一条直线分开，XOR 不行。' },
      { t: 'h3', text: '② 先用手把 XOR 搭出来（L11 p15）' },
      T`上面只是把 XOR 写成了 OR、AND、NOT 的组合，还没真的算过。用 **step 单元**（加权和 $\ge0$ 输出 1，否则输出 0）把这几个门搭出来：每个门就是一个 perceptron，第一层算 OR 和 AND，第二层把它们组合起来：`,
      { t: 'graph', r: 22, nodes: { x1: [40, 40], x2: [40, 200], u1: [250, 40], u2: [250, 200], z: [440, 120] }, labels: { x1: 'x₁', x2: 'x₂', u1: 'u₁', u2: 'u₂', z: 'z' }, notes: { u1: 'OR', u2: 'AND', z: 'XOR' }, edges: 'x1>u1 x2>u1 x1>u2 x2>u2 u1>z=+1 u2>z=−1', cls: { u1: 'hl', u2: 'hl' }, w: 460, caption: '两层网络算 XOR。输入到隐藏层的权重都是 1：$u_1=g(x_1+x_2-0.5)$ 是 OR，$u_2=g(x_1+x_2-1.5)$ 是 AND（蓝）；输出 $z=g(u_1-u_2-0.5)$ 就是"OR 且 非 AND"。' },
      T`step 单元 $g(r)=1$ 若 $r\ge0$：OR：$u=g(x_1+x_2-0.5)$；AND：$u=g(x_1+x_2-1.5)$；NOT：$u=g(-x_1)$。XOR：隐藏层 $u_1=\text{OR}$、$u_2=\text{AND}$，输出 $z=g(u_1-u_2-0.5)$。`,
      { t: 'table', cls: 'compact', head: ['$(x_1,x_2)$', '$u_1$ = OR', '$u_2$ = AND', '$u_1-u_2-0.5$', '$z$'], rows: [
        ['$(0,0)$', '0', '0', '−0.5', '0'], ['$(0,1)$', '1', '0', '0.5', '1'], ['$(1,0)$', '1', '0', '0.5', '1'], ['$(1,1)$', '1', '1', '−0.5', '0'],
      ] },
      T`四个角的输出 $0,1,1,0$ 正是 XOR——两层 perceptron 做到了一层做不到的事。下面给这种结构起名字，再看把 step 换成别的函数会怎样。`,
      { t: 'h3', text: '③ 激活函数：每个单元外面套的那个函数（L11 p7）' },
      T`刚才每个单元都是"加权和，再套一个 step"。step 只能输出 0/1；网络的输出还可能需要任意实数（回归）或 $(0,1)$ 里的概率，而且训练要求导（c34），step 在 0 处跳变、其余地方导数为 0，没法用。所以把 step 换成别的函数，统称：`,
      T`**Activation functions（激活函数）**（L11 p7）：`,
      { t: 'table', cls: 'compact', head: ['名字', '$f(s)$', '值域'], rows: [
        ['step（阶跃）', '$1$ if $s\\ge0$ else $0$', '$\\{0,1\\}$'],
        ['sign（符号函数）', '$1$ if $s\\ge0$ else $-1$', '$\\{-1,1\\}$'],
        ['logistic / sigmoid（S 形函数）', '$\\frac1{1+e^{-s}}$', '$(0,1)$'],
        ['tanh（双曲正切）', '$\\frac{e^s-e^{-s}}{e^s+e^{-s}}$', '$(-1,1)$'],
        ['ReLU（rectified linear unit，线性整流）', '$\\max\\{0,s\\}$', '$[0,\\infty)$'],
      ] },
      { t: 'h3', text: '④ 一般写法：前馈网络（L11 p8–p9）' },
      T`XOR 网络推广一下：任意多个输入、任意多个隐藏单元、任意激活函数。**Feed-forward network（前馈网络）**（L11 p8–p9）：输入层 → 隐藏层 → 输出层，计算只往前流。$g$ 是隐藏层的激活函数，$h$ 是输出层的：`,
      { t: 'math', tex: T`r_j=\sum_{i=0}^m x_iv_{ij},\quad u_j=g(r_j);\qquad s_k=\sum_{j=0}^p u_jw_{jk},\quad z_k=h(s_k)` },
      T`（$x_0=1$、$u_0=1$ 是 bias 节点。）整个网络就是**函数的复合（function composition）** $z=h(\sum_jw_j\,g(\sum_iv_{ij}x_i))$。`,
      { t: 'h3', text: '⑤ 一层隐藏层就够了吗？万能逼近（L11 p11–p12）' },
      T`前向公式只说明网络**在算什么**，还没回答它**能表示哪些函数**。课件 p11–p12 拿两条曲线 $z=x^4$ 和 $z=\sin x$ 试：同一套"加权和再套 tanh"，几个隐藏单元的输出叠加起来，就能把两条曲线都描出来。一般的结论是：`,
      T`**Universal approximation theorem（万能逼近定理）**（L11 p12）：在激活函数满足温和条件下，**一个**有限宽的隐藏层就能以任意精度逼近任意给定**有界闭区域**（紧集）上的连续函数——输入可以是 $\mathbb R^n$ 中的向量。`,
      { t: 'h3', text: '⑥ 隐藏层在做什么：学出来的特征（L11 p14–p17）' },
      T`定理只说"存在"一组好的权重，没说隐藏层到底学到了什么。回想 c12：人先选定特征 $\varphi(\bx)$，再做线性模型。网络里的隐藏层恰好能充当这个 $\varphi$，而且它的参数也从数据里学：`,
      T`**隐藏层 = 学出来的 basis expansion。** c12 里我们人工选特征 $\varphi(\bx)$ 再做线性模型；MLP 的隐藏层输出 $\mathbf u=\varphi(\bx)$，最后一层就是在 $\mathbf u$ 上的线性模型（L11 p17）。区别：$\varphi$ 的参数 $v_{ij}$ 是**从数据学出来的**。这就是 **representation learning（表示学习）**。`,
      { t: 'h3', text: '⑦ 深 vs 宽（L11 p16–p22）' },
      T`**深 vs 宽**（L11 p15、p22）：理论上一个足够宽的隐藏层就够（任何布尔函数最多用 $2^m$ 个隐藏单元）；但实践中**更深**的网络更有效，逐层组合出更复杂的特征（L11 p22 的"眼睛"类比：先检测边缘和色块，再组合成形状，再组合成纹理和人脸）。代价：很深的网络会有 **vanishing gradient（梯度消失）**：训练时梯度要从输出层一层层往回乘（c34 的 backprop），每一层乘一个激活函数的导数；sigmoid 的导数最大只有 $0.25$，乘上十几层就接近 0，靠前的层几乎学不动。`,
      { t: 'math', tex: T`\mathbf z=D^\top\tanh\big(C^\top\tanh(B^\top\tanh(A^\top\bx))\big)` },
      T`三个隐藏层（**depth（深度）**= 隐藏层数 = 3），每层"矩阵乘 + 逐元素激活"。省略了 bias。`,
    ],
    why: [
      T`神经网络是现代 ML 的主力。这一周（W6）讲"怎么搭、怎么训练"，下一周（W7）讲 CNN / RNN / Transformer 这些特殊结构。往年考点：2021 Q4（神经网络如何充当线性模型的非线性 basis）、Q13(b)（隐藏层权重的梯度）、Q7/Q9（下两章的优化器与 autoencoder）、T3（CNN 参数计数要先会数 MLP 参数）。`,
    ],
    intuition: [
      T`**为什么非线性激活必不可少？** 如果所有激活都是线性的，$h(\cdot)$ 和 $g(\cdot)$ 都是恒等，那么 $z=\sum_jw_j\sum_iv_{ij}x_i=\sum_i(\sum_jv_{ij}w_j)x_i$——还是一个线性模型，叠多少层都一样。`,
      { t: 'think', q: '一个 3 层网络，所有激活函数都是 $f(s)=2s$。它能学会 XOR 吗？', a: '不能。线性函数的复合还是线性函数，整个网络等价于一个线性模型，而 XOR 线性不可分。' },
      { t: 'story', title: '万能逼近定理', md: 'George Cybenko 在 1989 年证明了用 sigmoid 激活的单隐藏层网络能逼近任意连续函数；Kurt Hornik 1991 年把结论推广到更一般的激活函数。定理只说"存在"这样的网络，不说怎么找到它、需要多宽——这正是训练（下一章）要解决的。' },
    ],
    math: [
      { t: 'h3', text: '输出层怎么选（常见配法）' },
      { t: 'table', cls: 'compact', head: ['任务', '输出个数', '输出激活', 'loss'], rows: [
        ['一元回归', '1', '恒等', 'squared loss'],
        ['多元回归', '$q$', '恒等', 'squared loss'],
        ['二分类', '1', 'sigmoid', 'cross-entropy'],
        ['多分类', '类别数', 'softmax', 'cross-entropy'],
      ] },
      T`L11 p10 只说"要按任务选输出维数、输出激活和 loss"，并没有规定上表——上表是业界标准配法，帮你建立直觉。softmax、cross-entropy 不在 L11/L12 课件里，了解即可：**softmax** 把一组得分 $o_1,\dots,o_K$ 变成概率 $\frac{e^{o_k}}{\sum_je^{o_j}}$（非负、加起来为 1），第 41 章 attention 里会详细用到。`,
      { t: 'h3', text: '数参数' },
      T`全连接层：每个输出单元有"输入个数 + 1（bias）"个参数。例：3 输入 → 4 隐藏 → 2 输出（$m=3,\ p=4$）：$(3+1)\times4+(4+1)\times2=16+10=26$。对应矩阵写法：$A$ 是 $3\times4$（12 个权重）+ 4 个 bias $=16$；第二层 $4\times2$（8 个）+ 2 个 bias $=10$。第 38 章的 CNN 参数计数会用到同样的思路。`,
    ],
    fx: [
      {
        title: '一个隐藏单元的前向计算', tex: T`u_j=\htmlClass{fx-p1}{g}\Big(\htmlClass{fx-p2}{\sum_{i=0}^m x_iv_{ij}}\Big)`,
        parts: [
          { label: 'g', note: '非线性激活：sigmoid、tanh、ReLU……没有它，多层等于一层。' },
          { label: 'Σ x v', note: '加权输入 $r_j$，$i=0$ 是 bias（$x_0=1$）。就是一个 perceptron 的得分。' },
        ],
      },
    ],
    example: [
      { t: 'fade', title: '分步练习：前向计算', plan: [T`$r_j=\sum_ix_iv_{ij}$（含 bias）`, T`$u_j=g(r_j)$`, T`$s=\sum_ju_jw_j$（含 bias）`, T`$z=h(s)$`], items: [
        { md: T`上面的 XOR 网络，输入 $(1,0)$。`, steps: [
          { md: T`$r_1=1+0-0.5=0.5$，$r_2=1+0-1.5=-0.5$` }, { md: T`$u_1=1$，$u_2=0$` }, { md: T`$s=1-0-0.5=0.5$` }, { md: T`$z=g(0.5)=1$` },
        ] },
        { md: T`一个输入 $x_1=2$；ReLU 隐藏层：单元 1 bias 1、权重 1；单元 2 bias 0、权重 $-1$；输出恒等，bias 0，权重 $(1,1)$。已知 $r_1=3$，$r_2=-2$。`, steps: [
          { ask: T`$u_2=?$`, answer: 0, show: T`$\max(0,-2)=0$` },
          { ask: T`$s=?$`, answer: 3, show: '$3+0=3$' },
          { ask: T`$z=?$`, answer: 3, show: '恒等输出' },
        ] },
        { md: T`$\bx=(1,1)$；ReLU 隐藏层：单元 1 权重 $(1,-1)$、bias 0；单元 2 权重 $(2,1)$、bias $-1$；输出恒等，权重 $(-1,0.5)$、bias 1。`, steps: [
          { ask: T`$r_2=?$`, answer: 2, show: '$2+1-1=2$' },
          { ask: T`$u_1=?$`, answer: 0, show: T`$r_1=0$，ReLU 得 0` },
          { ask: T`$s=?$`, answer: 2, show: '$1+(-1)(0)+0.5\\times2=2$' },
          { ask: T`$z=?$`, answer: 2, show: '恒等' },
        ] },
      ] },
    ],
    viz: [
      { id: 'mlp-playground', how: '2-H-1 网络用梯度下降学一个二维数据集。背景颜色是网络预测的类别概率，点是训练数据。',
        try: '① XOR 数据、$H=1$：边界基本是直线，学不会。② 把 $H$ 调到 3–4，多按几次 train：边界弯曲，正确率接近 100%。③ 换成 circle 数据，比较 tanh 和 ReLU 的边界形状。' },
      { id: 'activation-fns', how: '实线是激活函数，虚线是它的导数；滑块读出某个 $s$ 处的值。',
        try: '把 $s$ 拉到 ±5：sigmoid 和 tanh 的导数几乎为 0（饱和），ReLU 在正半轴导数恒为 1——这是 ReLU 缓解梯度消失的原因。sigmoid 导数 $\\sigma\'(s)=\\sigma(s)(1-\\sigma(s))$ 在 $s=0$ 处最大，也只有 $0.5\\times0.5=0.25$。' },
    ],
    compare: [
      { t: 'table', head: ['', 'Basis expansion（c12）', 'Kernel SVM（c29）', 'MLP'], rows: [
        ['特征 $\\varphi$', '人工选', 'kernel 隐式决定', '**学出来**'],
        ['优化', '凸（闭式解）', '凸（QP）', '非凸'],
        ['可解释性', '高', '中', '低'],
      ] },
      { t: 'exam', md: T`**How can a neural network act as a non-linear basis for a linear model?** The hidden layers compute $\mathbf u=\varphi(\mathbf x)$, a non-linear transformation of the input (weighted sums followed by non-linear activations), and the output layer is a linear model $z=\mathbf w'\mathbf u$ on these features. Unlike fixed basis expansion, the transformation's parameters are learned from data by backpropagation (representation learning).` },
    ],
    pitfalls: [
      ['多层线性网络比单层强', '线性函数的复合仍是线性的；必须有非线性激活。'],
      ['万能逼近定理说一层网络总能训练好', '只说**存在**近似得很好的网络，不保证能找到、也不说要多宽。'],
      ['深度 = 网络总层数', 'L11 p16：深度指**隐藏层**的数量。'],
      ['数参数时忘了 bias', '每个单元多一个 bias 参数。'],
    ],
    quiz: [
      { type: 'num', q: '全连接网络 5 输入 → 3 隐藏 → 1 输出（都有 bias）。参数总数？', answer: 22, explain: '$(5+1)\\times3+(3+1)\\times1=18+4=22$。' },
      { type: 'num', q: 'ReLU：$f(-3)=?$', answer: 0, explain: '$\\max(0,-3)$。' },
      { type: 'mc', q: '下面哪个**不能**单靠一个 perceptron 实现？', options: ['AND', 'OR', 'NOT', 'XOR'], answer: 3, explain: 'XOR 线性不可分。' },
      { type: 'mc', q: 'L11 p22 说深网络相比单个很宽的隐藏层：', options: ['理论上更强', '经验上通常更准确', '没有梯度消失', '参数一定更少'], answer: 1, explain: '理论上一层就够，经验上深更好。' },
      { type: 'show', q: '（英文）Why do neural networks need non-linear activation functions?', answer: T`Without them every layer is a linear map, and a composition of linear maps is linear, so the whole network would be equivalent to a single linear model and could not represent non-linearly separable functions such as XOR. Non-linear activations make the composition non-linear, giving universal approximation capability.` },
      { type: 'show', q: '（英文）If one wide hidden layer is a universal approximator, why use deep networks?', answer: T`Universal approximation only says a network with one hidden layer of sufficient width exists; it may need very many units and says nothing about learning it. Deep networks represent compositional structure more efficiently (simple features combined into more complex ones layer by layer) and work better in practice, at the cost of harder optimisation such as vanishing gradients.` },
    ],
  });

  /* =====================================================================
   * c34 · Backpropagation（L11 p25–p31）
   * ===================================================================== */
  add({
    id: 'c34', week: 'W6', lec: 'L11', pages: 'L11 p25–p31', star: 3,
    title: 'Backpropagation', en: 'Backpropagation (chain rule through the network)',
    summary: '训练网络要 $\\partial L/\\partial$ 每个权重。**Backpropagation（反向传播）** 就是沿着网络用链式法则：先前向算出所有中间值，再从输出端算误差 $\\delta=z-y$，往回传：$\\partial L/\\partial w_j=\\delta u_j$，$\\varepsilon_j=\\delta w_jg\'(r_j)$，$\\partial L/\\partial v_{ij}=\\varepsilon_jx_i$。往年 2021 Q13(b) 考过推导（T10）。',
    prereq: ['c13', 'c33'],
    symbols: [
      [T`$L=\frac12(z-y)^2$`, T`单个样本的平方损失（回归，恒等输出 $z=s$）`],
      [T`$\delta=\frac{\partial L}{\partial s}$`, T`输出层误差项`],
      [T`$\varepsilon_j=\frac{\partial L}{\partial r_j}$`, T`隐藏单元 $j$ 的误差项`],
      [T`$g'(r_j)$`, T`隐藏激活的导数；sigmoid 时 $=u_j(1-u_j)$，ReLU 时 $r_j>0$ 为 1、否则 0`],
      [T`$\frac{\partial L}{\partial z}\frac{\partial z}{\partial s}\cdots$`, T`链式法则：沿依赖路径把局部导数相乘`],
    ],
    goals: [
      '解释为什么需要链式法则（$L$ 不直接依赖隐藏层权重）',
      '写出 L11 p27–p31 的三个公式，并说出每个因子的来源',
      '对一个小网络完整手算一次前向 + 反向',
      '说出 backprop 为什么高效（复用中间值、一次前向一次反向）',
    ],
    types: ['T10'],
    what: [
      { t: 'h3', text: '① 训练要什么：每个权重的梯度（L11 p25–p26）' },
      T`**目标**（L11 p26）：用 SGD 训练 $\boldsymbol\theta^{(k+1)}=\boldsymbol\theta^{(k)}-\eta\nabla L(\boldsymbol\theta^{(k)})$，需要每个 $\partial L/\partial w_j$（输出层）和 $\partial L/\partial v_{ij}$（隐藏层）。`,
      T`**Backpropagation（反向传播，"backward propagation of errors"）**（L11 p25）：在网络这个函数复合上反复用**链式法则（chain rule）**。`,
      { t: 'h3', text: '② 难点：损失不直接依赖隐藏层权重（L11 p26–p27）' },
      T`**依赖链**：隐藏层权重 $v_{ij}$ 影响 $r_j$ → 影响 $u_j$ → 影响 $s$ → 影响 $z$ → 影响 $L$。链式法则：沿这条链把每一步的"局部导数"乘起来。`,
      { t: 'h3', text: '③ 沿依赖链用链式法则，逐项求局部导数（L11 p27–p29）' },
      T`先只看最外面一层，算一个数。设 $L=\frac12(z-y)^2$、恒等输出 $z=s$，并且先只留一项 $s=u_1w_1$。取 $y=0$、$u_1=2$、$w_1=0.5$，则 $z=1$。$w_1$ 增加一点点，$s$（也就是 $z$）增加 $u_1$ 倍；$z$ 增加一点点，$L$ 增加 $(z-y)$ 倍。两个"局部倍数"相乘：$\partial L/\partial w_1=(z-y)\cdot u_1=1\times2=2$。下面的连乘就是把这种局部导数一路乘下去，从 $L$ 乘到 $w_j$、再乘到更靠前的 $v_{ij}$（课件同样固定平方损失和恒等输出）：`,
      { t: 'math', tex: T`\frac{\partial L}{\partial w_j}=\frac{\partial L}{\partial z}\frac{\partial z}{\partial s}\frac{\partial s}{\partial w_j},\qquad \frac{\partial L}{\partial v_{ij}}=\frac{\partial L}{\partial z}\frac{\partial z}{\partial s}\frac{\partial s}{\partial u_j}\frac{\partial u_j}{\partial r_j}\frac{\partial r_j}{\partial v_{ij}}\qquad(\text{L11 p27})` },
      { t: 'table', cls: 'compact', head: ['因子', '值', '理由'], rows: [
        ['$\\partial L/\\partial z$', '$z-y$', '$L=\\frac12(z-y)^2$ 求导'],
        ['$\\partial z/\\partial s$', '1', '恒等输出 $z=s$（sigmoid 输出时是 $z(1-z)$）'],
        ['$\\partial s/\\partial w_j$', '$u_j$', '$s=\\sum_ju_jw_j$'],
        ['$\\partial s/\\partial u_j$', '$w_j$', '同上'],
        ['$\\partial u_j/\\partial r_j$', "$g'(r_j)$", '$u_j=g(r_j)$'],
        ['$\\partial r_j/\\partial v_{ij}$', '$x_i$', '$r_j=\\sum_ix_iv_{ij}$'],
      ] },
      { t: 'h3', text: '④ 给公共部分起名字：δ 和 ε（L11 p28）' },
      T`把公共部分起名字（L11 p28）：$\delta\equiv\frac{\partial L}{\partial s}$，$\varepsilon_j\equiv\frac{\partial L}{\partial r_j}$。对平方损失 + 恒等输出（$z=s$）：`,
      { t: 'math', tex: T`\delta=z-y,\qquad \frac{\partial L}{\partial w_j}=\delta\,u_j,\qquad \varepsilon_j=\delta\,w_j\,g'(r_j),\qquad \frac{\partial L}{\partial v_{ij}}=\varepsilon_j\,x_i` },
      T`**"反向"和"复用"**：$\delta$ 在输出端算一次，所有输出层梯度都用它；$\varepsilon_j$ 由 $\delta$ 算出，所有连向单元 $j$ 的输入权重都用它。层数再多，也是从后往前一层一层传，每个中间量只算一次（L11 p30–p31）。现代深度学习框架用 **autodiff（自动微分）** 做的就是这件事。`,
      T`把 ③④ 放到一个真的小网络上，看数值先往前流、误差再往回流（数字和 T10 的例子相同）：`,
      { t: 'video', id: 'backprop' },
      { t: 'h3', text: '⑤ 算法（L11 p30–p31）' },
      { t: 'steps', items: [
        T`**前向**：用当前权重算并保存 $r_j,u_j,s,z$。`,
        T`**输出误差**：$\delta=z-y$。`,
        T`**输出层梯度**：$\partial L/\partial w_j=\delta u_j$。`,
        T`**往回传**：$\varepsilon_j=\delta w_jg'(r_j)$。`,
        T`**隐藏层梯度**：$\partial L/\partial v_{ij}=\varepsilon_jx_i$。`,
        T`用所有梯度做一步 SGD 更新（全部用**旧**权重算出的梯度）。`,
      ] },
      { t: 'note', title: '多个输出 / 多层时', md: T`如果单元 $j$ 连向下一层的多个单元，$\varepsilon_j$ 要把所有路径的贡献**加起来**：$\varepsilon_j=g'(r_j)\sum_k\delta_kw_{jk}$。更深的层同理一层层往回传。` },
    ],
    why: [
      T`没有 backprop 就没有深度学习：它让计算所有梯度的代价和一次前向计算差不多。考试角度：2021 Q13(b)（6 分）原题——"$L$ 不直接依赖隐藏层权重，backprop 怎么算 $\partial L/\partial w$？写出公式"。见 [T10](#/T10)。`,
    ],
    intuition: [
      T`**每个公式的直觉**：$\partial L/\partial w_j=\delta u_j$——输出错得越多（$\delta$ 大）、这个隐藏单元越活跃（$u_j$ 大），这条连线的权重就该改得越多。`,
      { t: 'think', q: T`如果隐藏单元用 ReLU，而某个样本让 $r_j<0$，那么连向这个单元的输入权重 $v_{ij}$ 在这个样本上的梯度是多少？`, a: T`0。因为 $g'(r_j)=0$（ReLU 在负半轴平坦），$\varepsilon_j=\delta w_j\cdot0=0$。这个单元对这个样本"关闭"了。如果对所有样本都关闭，它就再也学不动——"dead ReLU"。` },
      { t: 'story', title: '反向传播的历史', md: '反向模式自动微分最早由 Seppo Linnainmaa 在 1970 年提出，Paul Werbos 1974 年的博士论文把它用于神经网络。真正让它流行起来的是 Rumelhart、Hinton 和 Williams 1986 年发表在《Nature》上的论文 "Learning representations by back-propagating errors"。' },
    ],
    math: [
      T`下面"数值例子"用课件 L11 的记号把一次前向 + 反向完整算一遍（和 [T10](#/T10) 同一个网络）。`,
    ],
    fx: [
      {
        title: '隐藏层权重的梯度', tex: T`\frac{\partial L}{\partial v_{ij}}=\underbrace{\htmlClass{fx-p1}{\delta}\ \htmlClass{fx-p2}{w_j}\ \htmlClass{fx-p3}{g'(r_j)}}_{\varepsilon_j}\ \htmlClass{fx-p4}{x_i}`,
        parts: [
          { label: 'δ', note: '输出端的误差 $z-y$，已经算好，直接复用。' },
          { label: 'w_j', note: '隐藏单元 $j$ 对输出的影响有多大。' },
          { label: "g'(r_j)", note: '激活函数在当前输入处的斜率。sigmoid 饱和时接近 0 → 梯度消失。' },
          { label: 'x_i', note: '这条连线的输入值。$x_i=0$ 时这条权重不用改。' },
        ],
      },
    ],
    example: [
      { t: 'h3', text: '完整手算（和 T10 同一个例子）' },
      T`输入 $x_0=1$（bias）、$x_1=1$；2 个 ReLU 隐藏单元；恒等输出；$y=0$。$v_{01}=0.5,\ v_{11}=1$；$v_{02}=-0.5,\ v_{12}=1$；输出 $(w_0,w_1,w_2)=(0,1,-1)$。`,
      { t: 'steps', items: [
        T`前向：$r_1=0.5+1=1.5$，$r_2=-0.5+1=0.5$；$u_1=1.5$，$u_2=0.5$；$s=0+1.5-0.5=1=z$；$L=\frac12(1-0)^2=0.5$。`,
        T`$\delta=z-y=1$。`,
        T`输出层：$\partial L/\partial w_j=\delta u_j$ ⇒ $(1,\ 1.5,\ 0.5)$（$u_0=1$）。`,
        T`$\varepsilon_1=\delta w_1g'(r_1)=1\cdot1\cdot1=1$；$\varepsilon_2=1\cdot(-1)\cdot1=-1$（ReLU 正区间导数 1）。`,
        T`隐藏层：$\partial L/\partial v_{ij}=\varepsilon_jx_i$ ⇒ $\partial L/\partial v_{01}=\partial L/\partial v_{11}=1$，$\partial L/\partial v_{02}=\partial L/\partial v_{12}=-1$。`,
      ] },
      { t: 'fade', title: '分步练习：反向传播', plan: ['前向：$r_j,u_j,s,z$', '$\\delta=z-y$', '$\\partial L/\\partial w_j=\\delta u_j$', "$\\varepsilon_j=\\delta w_jg'(r_j)$", '$\\partial L/\\partial v_{ij}=\\varepsilon_jx_i$'], items: [
        { md: '上面的例子。', steps: [
          { md: T`$u=(1.5,0.5)$，$z=1$` }, { md: '$\\delta=1$' }, { md: '$(1,1.5,0.5)$' }, { md: T`$\varepsilon=(1,-1)$` }, { md: '$\\pm1$' },
        ] },
        { md: T`同一个网络，但 $y=2$。前向不变：$u=(1.5,0.5)$，$z=1$。`, steps: [
          { ask: T`$\delta=?$`, answer: -1, show: '$1-2=-1$', sg: 2 },
          { ask: T`$\partial L/\partial w_1=?$`, answer: -1.5, show: T`$\delta u_1=-1.5$`, sg: 3 },
          { ask: T`$\varepsilon_1=?$`, answer: -1, show: T`$-1\cdot1\cdot1$`, sg: 4 },
          { ask: T`$\partial L/\partial v_{11}=?$`, answer: -1, show: T`$\varepsilon_1x_1=-1$`, sg: 5 },
        ] },
        { md: T`一个输入 $x=2$（无 bias），一个 sigmoid 隐藏单元 $v=0.5$，恒等输出 $w=2$，$y=1$。`, steps: [
          { ask: T`$u=\sigma(1)=?$`, answer: 0.7311, tol: 0.002, show: '$\\sigma(1)=\\frac{1}{1+e^{-1}}$，$e^{-1}\\approx0.3679$，$1/1.3679\\approx0.7311$', sg: 1 },
          { ask: T`$\delta=z-y=?$`, answer: 0.4621, tol: 0.002, show: T`$z=2\times0.7311=1.4621$，$\delta=0.4621$`, sg: 2 },
          { ask: T`$\partial L/\partial w=?$`, answer: 0.3378, tol: 0.002, show: T`$0.4621\times0.7311$`, sg: 3 },
          { ask: T`$\varepsilon=\delta w\,u(1-u)=?$`, answer: 0.1817, tol: 0.002, show: T`$0.4621\times2\times0.7311\times0.2689$`, sg: 4 },
          { ask: T`$\partial L/\partial v=?$`, answer: 0.3634, tol: 0.002, show: T`$0.1817\times2$`, sg: 5 },
        ] },
      ] },
    ],
    viz: [
      { id: 'backprop-trace', how: '2 输入、2 个 sigmoid 隐藏单元、线性输出的小网络。每点"下一步"执行一个计算：先前向（$r_j\\to u_j\\to z\\to L$），再反向（$\\delta\\to$ 输出层梯度 $\\to\\varepsilon_j\\to$ 输入层梯度），最后统一更新。当前步涉及的节点和边会高亮，公式里代入了具体数字。',
        try: '先遮住读数，自己算下一步的值再点"下一步"核对。特别注意 $\\varepsilon_j$ 那两步：它复用了已经算好的 $\\delta$，这就是"反向传播"的意思。' },
    ],
    compare: [
      { t: 'exam', md: T`**2021 Q13(b) — how is $\partial L/\partial w$ computed for hidden-layer weights?** (Notation: the exam's hidden-layer weight $w$ is the lecture's $v_{ij}$. The lecture's $w_j$ is the *output* weight, and $\partial L/\partial w_j=\delta u_j$ is the wrong layer for this question.) The loss depends on a hidden weight $v_{ij}$ only indirectly, through $v_{ij}\to r_j\to u_j\to s\to z\to L$. Backpropagation applies the chain rule along this path: $\frac{\partial L}{\partial v_{ij}}=\frac{\partial L}{\partial z}\frac{\partial z}{\partial s}\frac{\partial s}{\partial u_j}\frac{\partial u_j}{\partial r_j}\frac{\partial r_j}{\partial v_{ij}}=\delta\,w_j\,g'(r_j)\,x_i$, where $\delta=\partial L/\partial s$ (e.g. $z-y$ for squared loss with identity output). A forward pass stores $r_j,u_j$; the output error $\delta$ is computed first and propagated backwards, so each layer reuses the error term of the layer above (summing over all units it feeds).` },
    ],
    pitfalls: [
      ['$\\partial L/\\partial v_{ij}=\\delta x_i$', '漏了 $w_jg\'(r_j)$；中间要经过隐藏单元。'],
      ['先更新输出层权重，再用新权重算隐藏层梯度', '所有梯度都用**旧**权重算完再统一更新。'],
      ['sigmoid 的导数是 $\\sigma(r)$', "$g'(r)=\\sigma(r)(1-\\sigma(r))=u(1-u)$。"],
      ['$\\delta$ 总是 $z-y$', '只在平方损失 + 恒等输出时；其他组合要重新求 $\\partial L/\\partial s$（如 sigmoid + cross-entropy 恰好也是 $z-y$）。'],
    ],
    quiz: [
      { type: 'num', q: '平方损失、恒等输出，$z=0.3$，$y=1$。$\\delta=?$', answer: -0.7, explain: '$z-y$。' },
      { type: 'num', q: '接上，$u_2=0.5$。$\\partial L/\\partial w_2=?$', answer: -0.35, explain: '$\\delta u_2$。' },
      { type: 'num', q: "接上，$w_2=2$，sigmoid 隐藏层 $u_2=0.5$。$\\varepsilon_2=?$", answer: -0.35, explain: "$-0.7\\times2\\times0.5\\times0.5=-0.35$。" },
      { type: 'mc', q: 'Backprop 高效的主要原因：', options: ['用了二阶导', '误差项在层间复用，一次反向遍历算出全部梯度', '只更新输出层', '不需要前向计算'], answer: 1, explain: 'L11 p30–p31。' },
    ],
  });

  /* =====================================================================
   * c35 · 训练：SGD、momentum、Adagrad、Adam（L12 p2–p16）
   * ===================================================================== */
  add({
    id: 'c35', week: 'W6', lec: 'L12', pages: 'L12 p2–p16', star: 2,
    title: '训练：SGD、momentum、Adagrad、Adam', en: 'Training deep networks: SGD, mini-batches, momentum, Adagrad, Adam',
    summary: '神经网络的损失是**非凸**的，学习率很难调。几个改进：**mini-batch**（折中 SGD 和 GD）、**momentum（动量）**（带惯性冲过小坑、减少震荡）、**Adagrad**（每个参数自适应步长）、**Adam**（动量 + 自适应，默认首选）。',
    prereq: ['c13', 'c34'],
    symbols: [
      [T`$\boldsymbol\theta^{(t)}$`, T`第 $t$ 步的参数`],
      [T`$\mathbf v^{(t)}$`, T`momentum 的"速度"；Adam 里是二阶矩（梯度平方的滑动平均）`],
      [T`$\alpha$`, T`momentum 衰减系数（如 0.9）`],
      [T`$g_i^{(t)}$`, T`Adagrad：参数 $i$ 至今梯度平方的累加和`],
      [T`$\mathbf m^{(t)}$, $\beta_1,\beta_2$`, T`Adam 的一阶矩（梯度滑动平均）和两个衰减率（0.9、0.999）`],
      [T`$\epsilon$`, T`防止除以 0 的极小数（$10^{-8}$）`],
    ],
    goals: [
      '比较 GD、SGD、mini-batch SGD 的优缺点（L12 p9）',
      '写出 momentum、Adagrad、Adam 的更新式（L12 p12–p14），手算一两步',
      '解释学习率太大 / 太小的后果，以及非凸带来的局部最优、鞍点',
    ],
    types: ['T13'],
    notExam: 'L12 p15 列出的其他优化器（BFGS、Nesterov、RMSprop、AMSGrad…）只需知道"选择很多"，不考细节。',
    what: [
      T`c34 只回答了"梯度怎么算"。真正更新时还要决定：这一步的梯度用**全部**样本算、用**一个**样本算，还是用**一小批**？三种做法的差别只在这里：`,
      T`**三种梯度下降**（L12 p8–p9）：`,
      { t: 'table', cls: 'compact', head: ['', '每步用多少数据', '特点'], rows: [
        ['GD（batch）', '全部 $N$', '稳定但慢、计算贵'],
        ['SGD', '1 个（随机顺序）', '梯度方差大，更新快且多'],
        ['Mini-batch SGD', '$1<b<N$（如 100）', '折中；可在 GPU 上并行'],
      ] },
      T`**非凸**（L12 p10–p11）：线性回归的损失是碗（凸），神经网络的损失一般**非凸**，有局部最优和鞍点；学习率太大会震荡/发散，太小几乎不动、也难跳出局部最优。`,
      T`下面三种改进都在对付"学习率很难调"。第一种：普通更新每步只看**当前**梯度。在狭长的山谷里，陡的方向一步迈太大就来回晃，平的方向却几乎不动。动量给参数一个"速度" $\mathbf v$，把最近几步的梯度累加起来：方向一直一致的轴越走越快，来回晃的轴正负抵消。`,
      T`**Momentum（动量）**（L12 p12）：`,
      { t: 'math', tex: T`\mathbf v^{(t)}=\alpha\,\mathbf v^{(t-1)}+\eta\nabla L(\boldsymbol\theta^{(t-1)}),\qquad \boldsymbol\theta^{(t)}=\boldsymbol\theta^{(t-1)}-\mathbf v^{(t)}` },
      T`第二种：动量让步子有惯性，但所有参数仍共用一个学习率 $\eta$。有的权重梯度一直很大，有的很少动，一个 $\eta$ 顾此失彼。Adagrad 给每个参数**各记一本账** $g_i$（过去梯度平方的累加），过去梯度一直大的参数，以后步子就小：`,
      T`**Adagrad**（L12 p13）：每个参数单独累加梯度平方，步长按它缩小：`,
      { t: 'math', tex: T`g_i^{(t)}=g_i^{(t-1)}+\big[\nabla L(\boldsymbol\theta^{(t-1)})_i\big]^2,\qquad \theta_i^{(t)}=\theta_i^{(t-1)}-\frac{\eta}{\sqrt{g_i^{(t)}+\epsilon}}\,\nabla L(\boldsymbol\theta^{(t-1)})_i` },
      T`第三种把前两种合起来：动量只记梯度的**方向**，Adagrad 只记梯度的**大小**，而且 Adagrad 的平方和只增不减，后期步子会小到走不动。Adam 两样都用**滑动平均**（旧值乘 $\beta$、新值乘 $1-\beta$，越旧的梯度权重越小）：$\mathbf m$ 记方向，$\mathbf v$ 记大小。`,
      T`**Adam**（L12 p14）：动量 + 自适应，带偏差校正（逐元素运算）：`,
      { t: 'math', tex: T`\mathbf m^{(t)}=\beta_1\mathbf m^{(t-1)}+(1-\beta_1)\nabla L,\qquad \mathbf v^{(t)}=\beta_2\mathbf v^{(t-1)}+(1-\beta_2)(\nabla L)^2` },
      { t: 'math', tex: T`\hat{\mathbf m}^{(t)}=\frac{\mathbf m^{(t)}}{1-\beta_1^t},\quad \hat{\mathbf v}^{(t)}=\frac{\mathbf v^{(t)}}{1-\beta_2^t},\qquad \boldsymbol\theta^{(t)}=\boldsymbol\theta^{(t-1)}-\frac{\eta}{\sqrt{\hat{\mathbf v}^{(t)}+\epsilon}}\,\hat{\mathbf m}^{(t)}` },
      T`（$\hat{\mathbf m},\hat{\mathbf v}$ 是**偏差校正（bias correction）**后的值：$\mathbf m,\mathbf v$ 从 0 开始累积，前几步偏小，除以 $1-\beta^t$ 补回来。课件 L12 p14 把 $\epsilon$ 放在根号里面（考试按这个写）；很多教材放在根号外面。只有当 $\hat{\mathbf v}$ 远大于 $\epsilon$ 时两者才近似相同；$\hat{\mathbf v}$ 接近 0 时步长会差很多。）`,
    ],
    why: [
      T`实际训练神经网络几乎都用 mini-batch + Adam（L12 p14："good work-horse"）。考试多考概念对比：SGD vs GD、momentum 的作用、Adam = momentum + adaptive learning rate。`,
    ],
    intuition: [
      T`**Momentum = 滚下山的球**（L12 p12）：速度 $\mathbf v$ 累积过去的梯度，方向一致的维度越滚越快，来回震荡的维度互相抵消。还能凭惯性冲过小的局部最优。`,
      T`**Adagrad = 常走的路走慢点。** 某个参数的梯度一直很大，累加和 $g_i$ 变大，步长 $\eta/\sqrt{g_i}$ 变小；很少更新的参数保持大步长。好处是不用手调统一的学习率；缺点是 $g_i$ 只增不减，后期步长可能太小（L12 p13 "conservative"）。`,
      T`**Adam 第一步的步长恰好约等于 $\eta$**：$t=1$ 时偏差校正后 $\hat{\mathbf m}=\nabla L$，$\hat{\mathbf v}=(\nabla L)^2$，每个坐标的第一步更新为 $-\eta\,g_i/\sqrt{g_i^2+\epsilon}$（$g_i$ 是该坐标的梯度）。当 $g_i^2\gg\epsilon$ 时它约等于 $-\eta\cdot\mathrm{sign}(g_i)$，幅度约为 $\eta$；梯度极小时（如 $g_i=10^{-6}$、$\epsilon=10^{-8}$）幅度只有约 $0.01\eta$。所以 $\eta$ 大致是"梯度不太小时第一步走多远"，不保证之后每步都这么远。`,
      { t: 'think', q: '为什么 Adam 要除以 $1-\\beta_1^t$（偏差校正）？', a: T`$\mathbf m^{(0)}=\mathbf 0$，前几步的滑动平均偏向 0（例如第一步 $\mathbf m=0.1\nabla L$）。除以 $1-\beta_1^t$（第一步是 0.1）把它校正回来。$t$ 很大时 $\beta_1^t\to0$，校正消失。` },
      { t: 'story', title: 'Adam', md: 'Adam（"adaptive moment estimation"）由 Diederik Kingma 和 Jimmy Ba 在 2014 年提出（ICLR 2015 发表），很快成为深度学习默认的优化器。它的前身包括 Adagrad（Duchi、Hazan、Singer，2011）和 RMSprop。' },
    ],
    math: [
      { t: 'h3', text: '三者的关系' },
      { t: 'table', cls: 'compact', head: ['', '记忆过去的梯度？', '每个参数不同步长？'], rows: [
        ['SGD', '否', '否'], ['Momentum', '是（一阶：速度）', '否'], ['Adagrad', '是（平方和）', '是'], ['Adam', '是（一阶 + 二阶滑动平均）', '是'],
      ] },
    ],
    fx: [
      {
        title: 'Momentum', tex: T`\mathbf v^{(t)}=\htmlClass{fx-p1}{\alpha\,\mathbf v^{(t-1)}}+\htmlClass{fx-p2}{\eta\nabla L(\boldsymbol\theta^{(t-1)})},\qquad\boldsymbol\theta^{(t)}=\boldsymbol\theta^{(t-1)}-\htmlClass{fx-p3}{\mathbf v^{(t)}}`,
        parts: [
          { label: 'αv', note: '保留上一步速度的一部分（$\\alpha=0.9$ 时保留 90%）。' },
          { label: 'η∇L', note: '当前梯度的贡献，和普通 SGD 一样。' },
          { label: '−v', note: '沿速度方向走。梯度方向稳定时，速度会累积到约 $\\eta\\nabla L/(1-\\alpha)$（10 倍）。' },
        ],
      },
    ],
    example: [
      { t: 'fade', title: '分步练习：优化器手算', plan: ['更新累积量（$\\mathbf v$ / $g$ / $\\mathbf m,\\mathbf v$）', '算这一步的步长', '$\\theta\\leftarrow\\theta-$步长'], items: [
        { md: T`Momentum：$\alpha=0.9$，$\eta=0.1$，$\theta^{(0)}=0$，$v^{(0)}=0$，梯度恒为 1。`, steps: [
          { md: T`第 1 步：$v=0.9\cdot0+0.1\cdot1=0.1$` }, { md: '步长 0.1' }, { md: T`$\theta=-0.1$；第 2 步 $v=0.19$，$\theta=-0.29$（越走越快）` },
        ] },
        { md: T`Adagrad：$\eta=0.1$，$\epsilon\approx0$，$\theta^{(0)}=1$，第 1 步梯度 3，第 2 步梯度 4。`, steps: [
          { ask: T`$\theta^{(1)}=?$`, answer: 0.9, show: T`$g=9$，步长 $0.1/3\times3=0.1$`, sg: 3 },
          { ask: T`$\theta^{(2)}=?$`, answer: 0.82, show: T`$g=9+16=25$，步长 $0.1/5\times4=0.08$`, sg: 3 },
        ] },
        { md: T`Adam：$\eta=0.01$，$\beta_1=0.9$，$\beta_2=0.999$，第 1 步梯度 5，$\epsilon\approx0$。`, steps: [
          { ask: T`$m^{(1)}=?$`, answer: 0.5, show: T`$0.1\times5$`, sg: 1 },
          { ask: T`校正后 $\hat m=m/(1-0.9)=?$`, answer: 5, show: '5', sg: 2 },
          { ask: '步长 = ?', answer: 0.01, show: T`梯度平方 $5^2=25$；$v^{(1)}=(1-0.999)\times25=0.025$，校正 $\hat v=0.025/(1-0.999)=25$，$\sqrt{\hat v}=5$；步长 $0.01\times\hat m/\sqrt{\hat v}=0.01\times5/5=0.01$——第一步步长就是 $\eta$`, sg: 2 },
        ] },
      ] },
    ],
    viz: [
      { id: 'optimizers', how: '同一个旋转的狭长二次碗、同一个起点，四种优化器同时跑。等高线中心是最小值。',
        try: '① 默认 $\\eta=0.08$ 点几次 step 10：GD 在窄方向直接收缩、在宽方向走得很慢（还不震荡）。把 $\\eta$ 调到约 0.15，GD 才在窄方向来回震荡；（这个图的损失是 $L=\\frac12(10q_1^2+q_2^2)$，窄方向的弯曲程度是 10，GD 每步在这个方向上把 $q_1$ 乘以 $1-10\\eta$。）$\\eta=0.2$ 时窄方向的系数 $1-10\\eta=-1$，来回跳但幅度不变（不收敛）；$\\eta>0.2$ 时越跳越远（发散）。momentum 先冲过头再回来，但总体更快；Adagrad 和 Adam 对两个方向自动用不同步长，路径更直。② 调大学习率，看哪个先发散。' },
      { id: 'opt-2d', opts: { method: 'sgd', eta: 0.08, cond: 10 }, how: '第 13 章的工具，切到 SGD：每步梯度带噪声。',
        try: '对比 GD 和 SGD 的路径：SGD 抖动，但大方向一致——这就是"高方差、快更新"。' },
    ],
    compare: [
      { t: 'exam', md: T`**Momentum vs Adagrad vs Adam:** Momentum accumulates a velocity $\mathbf v\leftarrow\alpha\mathbf v+\eta\nabla L$ and steps by $-\mathbf v$, which dampens oscillations and can carry the parameters past shallow local optima or saddle points: near a shallow minimum or saddle the gradient is almost zero, but the velocity $\mathbf v$ still moves $\boldsymbol\theta$, and directions that stay consistent are reinforced. This can help, but it does not guarantee escape or a global optimum. Adagrad scales each parameter's step by $1/\sqrt{\sum\text{(past squared gradients)}}$, giving per-parameter adaptive learning rates (but steps shrink over time). Adam combines both: exponential moving averages of the gradient (momentum) and of its square (adaptive scaling), with bias correction.` },
    ],
    pitfalls: [
      ['SGD 每步用全部数据', '用 1 个样本；全部数据是 batch GD。'],
      ['Adagrad 的步长会自动变大', '$g_i$ 只增不减，步长只会变小。'],
      ['神经网络损失是凸的', '一般非凸，有局部最优和鞍点（L12 p10）。'],
      ['Momentum 公式里减的是梯度', '减的是速度 $\\mathbf v$（包含了历史梯度）。'],
    ],
    quiz: [
      { type: 'num', q: 'Momentum $\\alpha=0.5$，$\\eta=1$，$v=2$，当前梯度 1。新的 $v=?$', answer: 2, explain: '$0.5\\times2+1=2$。' },
      { type: 'mc', q: 'Mini-batch SGD 的主要好处：', options: ['梯度精确', '在稳定性和计算量之间折中，可并行', '保证全局最优', '不需要学习率'], answer: 1, explain: 'L12 p9。' },
      { type: 'mc', q: 'Adam 结合了：', options: ['SGD 和 Newton', 'momentum 和自适应学习率', 'dropout 和 weight decay', 'GD 和 early stopping'], answer: 1, explain: 'L12 p14。' },
      { type: 'show', q: '（英文）Compare batch gradient descent, SGD and mini-batch SGD.', answer: T`Batch GD uses the gradient of the loss over the whole training set: each step is accurate and stable but expensive for large data. SGD uses the gradient of a single example: each update is very cheap but noisy (high variance), which can also help escape shallow local optima and saddle points. Mini-batch SGD averages the gradient over a small batch: it reduces the noise relative to SGD while keeping updates cheap, and it uses vectorised / parallel hardware efficiently, so it is the standard choice for training neural networks.` },
    ],
  });

  /* =====================================================================
   * c36 · 深度网络正则化（L12 p17–p21）
   * ===================================================================== */
  add({
    id: 'c36', week: 'W6', lec: 'L12', pages: 'L12 p17–p21', star: 2,
    title: '深度网络正则化', en: 'Regularising deep networks: early stopping, weight decay, dropout',
    summary: '神经网络参数极多、非常灵活，容易过拟合。三种对策：**early stopping（早停）**（验证误差开始上升就停）、**weight decay（权重衰减）**（加 $L_2$ 惩罚，梯度多一项 $2\\lambda w$）、**dropout**（训练时随机屏蔽一部分单元，测试时不屏蔽并调整权重）。',
    prereq: ['c16', 'c18', 'c34'],
    symbols: [
      [T`$\lambda$`, T`$L_2$ 惩罚系数`],
      [T`$2\lambda w$`, T`weight decay 加到梯度上的项`],
      [T`$p$（dropout）`, T`每个单元被屏蔽（drop）的概率`],
      [T`$q=1-p$`, T`保留（keep）概率；测试时把权重乘 $q$`],
      [T`mask`, T`0/1 掩码：哪些单元这次被保留`],
    ],
    goals: [
      '解释为什么 DNN 容易过拟合（L12 p18）',
      '描述 early stopping 的做法；知道它是一种 implicit regularisation（隐式正则化）',
      '写出 weight decay 的目标和梯度（L12 p19），手算一步更新',
      '描述 dropout 训练与测试的做法，以及它为什么有效（L12 p20）',
    ],
    types: ['T13'],
    what: [
      T`**为什么需要**（L12 p18）：DNN 非常灵活、通常**over-parameterised（过参数化）**，参数比样本还多，很容易把训练集背下来。`,
      T`**Early stopping（早停）**：训练时盯着验证集误差，它不再下降（开始上升）就停止，用那时的权重。L12 把它归为 **implicit regularisation（隐式正则化）**：权重从接近 0 的小值开始，早停让它们没机会长大；对 sigmoid/tanh 这类在 0 附近近似线性的激活，网络会被"拉向"一个线性模型。`,
      T`早停不改损失函数，只是不让训练跑太久（权重从接近 0 出发，停得早就没机会长得很大）。如果想**直接**惩罚大权重、并且能用 $\lambda$ 调力度，就像 c16 的 ridge 一样在损失上加权重平方和。平方的导数是 $2\lambda w$，所以反传得到的梯度多加这一项：`,
      T`**Weight decay / $L_2$ regularisation（显式正则化）**（L12 p19）：`,
      { t: 'math', tex: T`\min\ L+\lambda\Big(\sum_{i,j}v_{ij}^2+\sum_jw_j^2\Big)\quad\Rightarrow\quad\frac{\partial}{\partial w_j}\text{ 多一项 }2\lambda w_j` },
      T`权重衰减只管"权重别太大"，不管网络是不是**死靠某几个单元**。单元很多时，少数单元就能把训练集背下来。下面的做法是训练时随机关掉一部分单元，逼剩下的单元也能独立工作：`,
      T`**Dropout**（L12 p20）：训练时，每次呈现样本都**随机屏蔽**一部分单元（每次的 mask 不同）；测试时不屏蔽，但相应调整权重（保留概率为 $q$ 时把权重乘 $q$，让期望输出一致）。`,
    ],
    why: [
      T`这是 c16–c19 的正则化思想在深度学习里的版本。简答题常问"dropout 为什么能防止过拟合"、"列举 DNN 的正则化方法"。`,
    ],
    intuition: [
      T`**Weight decay 的名字**：更新 $w\leftarrow w-\eta(\partial L/\partial w+2\lambda w)=(1-2\eta\lambda)w-\eta\,\partial L/\partial w$——每步先把权重乘一个略小于 1 的数（"衰减"），再按梯度走。它就是神经网络版的 ridge（c16），对应 Gaussian 先验（c17）。`,
      T`**Dropout 为什么有效**（L12 p20）：① 任何单元都可能被关掉，网络不能依赖个别单元，被迫学**冗余（redundancy）**的表示；② 每次屏蔽得到一个不同的子网络，等于同时训练指数多个共享权重的网络，测试时相当于它们的**集成（ensemble）**；③ 实践中得到更小的权重。`,
      { t: 'think', q: 'Dropout 训练时保留概率 0.5，测试时为什么要调整权重（或输出）？', a: '训练时每个单元平均只有一半时间在工作，下一层收到的输入期望值是"全开"时的一半。测试时全部打开，如果不把权重乘 0.5，下一层的输入会比训练时大一倍，分布对不上。' },
      { t: 'story', title: 'Dropout', md: 'Dropout 由 Geoffrey Hinton 团队在 2012 年提出（arXiv），2014 年 Srivastava 等人在 JMLR 上正式发表。据 Hinton 说，灵感之一来自银行轮换柜员以防合谋：不让任何一组"员工"长期固定搭配。' },
    ],
    math: [
      { t: 'h3', text: '三种方法对比' },
      { t: 'table', cls: 'compact', head: ['方法', '改了什么', '类型'], rows: [
        ['Early stopping', '训练时长', '隐式'],
        ['Weight decay ($L_2$)', '损失函数 + $\\lambda\\|\\boldsymbol\\theta\\|^2$', '显式'],
        ['Dropout', '训练时的网络结构（随机屏蔽）', '随机屏蔽 / 集成效果（不是显式惩罚）'],
      ] },
    ],
    fx: [
      {
        title: 'Weight decay 的更新', tex: T`w\leftarrow w-\eta\Big(\htmlClass{fx-p1}{\frac{\partial L}{\partial w}}+\htmlClass{fx-p2}{2\lambda w}\Big)=\htmlClass{fx-p3}{(1-2\eta\lambda)}\,w-\eta\frac{\partial L}{\partial w}`,
        parts: [
          { label: '∂L/∂w', note: '普通的数据梯度（backprop 算出）。' },
          { label: '2λw', note: '$L_2$ 惩罚 $\\lambda w^2$ 的导数。' },
          { label: '(1−2ηλ)', note: '每步把权重按比例缩小——"衰减"。' },
        ],
      },
    ],
    example: [
      { t: 'fade', title: '分步练习：weight decay 一步', plan: [T`总梯度 $=\partial L/\partial w+2\lambda w$`, T`$w\leftarrow w-\eta\times$总梯度`], items: [
        { md: T`$w=1$，$\partial L/\partial w=0.5$，$\lambda=0.1$，$\eta=0.1$。`, steps: [
          { md: '$0.5+0.2=0.7$' }, { md: T`$w=1-0.07=0.93$` },
        ] },
        { md: T`$w=-2$，$\partial L/\partial w=0$，$\lambda=0.05$，$\eta=0.5$。`, steps: [
          { ask: '总梯度 = ?', answer: -0.2, show: T`$0+2\times0.05\times(-2)=-0.2$` },
          { ask: T`新的 $w=?$`, answer: -1.9, show: T`$-2+0.1=-1.9$（即使数据梯度为 0，权重也向 0 收缩）` },
        ] },
        { md: T`$w=0.4$，$\partial L/\partial w=-1$，$\lambda=0.5$，$\eta=0.1$。`, steps: [
          { ask: '总梯度 = ?', answer: -0.6, show: T`惩罚项的梯度 $2\lambda w=2\times0.5\times0.4=0.4$；总梯度 = 数据梯度 + 惩罚梯度 $=-1+0.4=-0.6$` },
          { ask: T`新的 $w=?$`, answer: 0.46, show: T`$w-\eta\times(-0.6)=0.4+0.06=0.46$` },
        ] },
      ] },
    ],
    viz: [
      { id: 'poly-fit', opts: { degree: 9, ridge: true, test: true }, how: 'weight decay 就是 ridge：同样的 9 次多项式，用 $\\lambda$ 惩罚权重。',
        try: '$\\lambda$ 从 0 开始加大：$\\|\\bw\\|$ 变小、曲线变平滑、测试误差先降后升——和神经网络里调 weight decay 是同一回事。' },
      { id: 'mlp-playground', how: '隐藏单元很多时，网络能把训练点分得非常细。',
        try: '把 $H$ 调到 8、训练很多步：边界会绕着个别点弯曲（过拟合的迹象）。想象在验证误差开始上升时停下——那就是 early stopping。' },
    ],
    compare: [
      { t: 'exam', md: T`**Why does dropout reduce overfitting?** During training each unit is randomly removed (with a new mask for every presentation), so the network cannot rely on any single unit and must learn redundant representations; training effectively averages an exponential number of weight-sharing sub-networks, giving an ensemble effect at test time (when all units are used with appropriately scaled weights). It also tends to produce smaller weights.` },
    ],
    pitfalls: [
      ['测试时也随机屏蔽', '测试时不屏蔽，调整权重 / 输出（L12 p20）。'],
      ['每个 epoch 用同一个 dropout mask', '每次呈现样本都换新的 mask。'],
      ['Early stopping 看训练误差', '看**验证**误差。'],
      ['Weight decay 只惩罚输出层', 'L12 p19 对 $v_{ij}$ 和 $w_j$ 都惩罚。'],
    ],
    quiz: [
      { type: 'num', q: 'Weight decay：$w=2$，数据梯度 0，$\\lambda=0.25$，$\\eta=0.1$。新的 $w=?$', answer: 1.9, explain: '总梯度 $2\\times0.25\\times2=1$，$2-0.1=1.9$。' },
      { type: 'mc', q: '下面哪个是 implicit regularisation？', options: ['dropout', 'weight decay', 'early stopping', '$L_1$ 惩罚'], answer: 2, explain: 'L12 p18。' },
      { type: 'mc', q: 'Weight decay 在 Bayesian 视角下对应：', options: ['Laplace 先验', 'Gaussian 先验', '均匀先验', 'Beta 先验'], answer: 1, explain: '$L_2$ 惩罚 = Gaussian 先验（c17）。' },
    ],
  });

  /* =====================================================================
   * c37 · Autoencoder 与 PCA（L12 p22–p31）
   * ===================================================================== */
  add({
    id: 'c37', week: 'W6', lec: 'L12', pages: 'L12 p22–p31', star: 2,
    title: 'Autoencoder 与 PCA', en: 'Autoencoders and principal component analysis',
    summary: '**Autoencoder（自编码器）**：让网络把输入重建出来（目标 $\\mathbf y=\\bx$），中间加一个窄的 **bottleneck（瓶颈）**，逼它学到压缩的表示——无监督学习。**PCA（主成分分析）**：找方差最大的正交方向，解就是协方差矩阵的特征向量。线性激活、一个隐藏层的 autoencoder 几乎就是 PCA。',
    prereq: ['c04', 'c28', 'c33'],
    symbols: [
      [T`$\mathbf u$`, T`bottleneck 层的输出（编码 code）`],
      [T`$\mathbf z(\bx)$`, T`重建结果，目标是 $\approx\bx$`],
      [T`$\Sigma_x$`, T`（中心化后）数据的协方差矩阵`],
      [T`$\mathbf p_1$`, T`第一主成分方向（单位向量）`],
      [T`$\lambda_1$`, T`本章：拉格朗日乘子 = $\Sigma_x$ 的最大特征值 = 沿 $\mathbf p_1$ 的方差`],
    ],
    goals: [
      '解释 autoencoder 的设置，以及 bottleneck / 加噪 / 稀疏 为什么能防止"直接复制"',
      '区分 undercomplete 和 overcomplete（L12 p26）',
      '推导 PCA：最大化 $\\mathbf p_1\'\\Sigma_x\\mathbf p_1$ s.t. $\\|\\mathbf p_1\\|=1$ ⇒ 特征向量（L12 p29）',
      '比较 PCA 与线性 autoencoder（L12 p30），列出 autoencoder 的用途',
    ],
    types: ['T13'],
    what: [
      T`**Autoencoder**（L12 p23–p25）：手上只有无标签数据 $\bx_1..\bx_n$。设目标 $\mathbf y_i\equiv\bx_i$，训练网络从 $\bx_i$ 预测 $\bx_i$。"这不是没意义吗？"（p23）——关键是中间加约束，让它不能直接复制：`,
      { t: 'ul', items: [
        T`**Bottleneck（瓶颈）**：中间层 $\mathbf u$ 比输入窄（**undercomplete（欠完备）**），必须压缩信息才能重建。`,
        T`给输入**加噪声**（**denoising（去噪）** autoencoder：输入带噪声、目标是干净的原图）、要求 $\mathbf u$ **稀疏（sparse）**（大多数单元为 0）、或让表示对输入的小扰动不敏感（**contractive（收缩）** autoencoder）。`,
      ] },
      T`**Undercomplete（欠完备）vs overcomplete（过完备）**（L12 p26）：瓶颈比输入窄 → 被迫压缩，限制了表示的维数（但**不保证**学到有用的结构，见下一段）；比输入宽 → 可以直接复制输入，所以通常需要额外约束（去噪、稀疏等）才能学到有用的表示。`,
      T`**陷阱（2021 Q9）：窄瓶颈也不保证学到好表示。** 如果编码器和解码器都非常复杂（非线性、参数很多），网络可以把训练集**背下来**：给每个训练样本分配一个任意的编码（比如编号），解码器像查表一样存下对应的重建结果。训练重建误差几乎为 0，但编码没有任何意义、也不能泛化。所以实践中还要加 denoising、sparsity 等约束。`,
      T`autoencoder 要的是"压缩后再重建，误差要小"。最简单的一种：只有一个隐藏层、激活是线性的、损失用平方误差。它学到的就是数据**铺得最开**的那几个方向——这正是一个经典方法要找的东西。先把这个方法讲清楚，再回来对比：`,
      T`**PCA（principal component analysis，主成分分析）**（L12 p28–p29）：找一组新坐标轴，让数据的方差集中在前几个轴上；保留前 $l<m$ 个轴实现降维。`,
      { t: 'video', id: 'pca' },
      T`**先看一个二维例子。** 数据已经减去均值，协方差矩阵 $\Sigma_x=\begin{bmatrix}2&1\\1&2\end{bmatrix}$。把数据投到一个单位方向 $\mathbf p$ 上，投影的方差是 $\mathbf p'\Sigma_x\mathbf p$。怎么算：$\mathbf p'\Sigma_x\mathbf p=\sum_{i,j}p_i\,(\Sigma_x)_{ij}\,p_j$，就是矩阵的每一格乘上"它所在行的 $p_i$ × 所在列的 $p_j$"再全部加起来。沿 $\mathbf p=(1,1)/\sqrt2$：每个 $p_ip_j=\frac12$，四格 $2,1,1,2$ 各乘 $\frac12$：$\frac12(2+1+1+2)=3$。沿 $(1,-1)/\sqrt2$：对角的 $p_ip_j=\frac12$，非对角的 $p_1p_2=-\frac12$，所以中间两个 1 变号：$\frac12(2-1-1+2)=1$。所以 $(1,1)$ 方向铺得最开，一条轴就解释了 $3/(3+1)=75\%$ 的方差。（$3$ 和 $1$ 正是 c04 里同一个矩阵的两个特征值。）一般情况就是下面这个带约束的最大化，解是最大特征值对应的特征向量：`,
      { t: 'math', tex: T`\max_{\mathbf p_1}\ \mathbf p_1'\Sigma_x\mathbf p_1\quad\text{s.t.}\ \mathbf p_1'\mathbf p_1=1\qquad\Rightarrow\qquad\Sigma_x\mathbf p_1=\lambda_1\mathbf p_1` },
      T`**回到 autoencoder**：投影方差最大，等价于"投影后丢掉的部分"（重建误差）最小——这正是 autoencoder 在最小化的量。所以线性、单隐藏层、平方误差的 autoencoder（训练到最优时）张成的子空间和 PCA 前几个主成分的子空间相同；但它的权重本身不一定两两正交、也不按方差排序——课件 p30 称之为 "almost PCA"：PCA 找的是按方差排好的标准正交基，网络可能找到另一组基。`,
    ],
    why: [
      T`无监督学习、降维、预训练都会用到。PCA 的推导把 c04（特征值）和 c28（拉格朗日乘子）连在一起，是很好的综合题。`,
    ],
    intuition: [
      T`**PCA = 找数据最"长"的方向。** 把数据投影到单位方向 $\mathbf p$ 上，投影的方差是 $\mathbf p'\Sigma_x\mathbf p$。哪个方向方差最大？答案是 $\Sigma_x$ 最大特征值的特征向量，而且最大方差就等于那个特征值。`,
      T`**为什么"最大方差" = "最小重建误差"？** 每个点到这条线的距离平方 + 投影长度平方 = 点到原点距离平方（勾股定理，常数）。所以投影方差最大 ⇔ 丢掉的部分（重建误差）最小——这正是 autoencoder 的目标，所以线性 autoencoder ≈ PCA。`,
      { t: 'think', q: 'PCA 的第二主成分怎么求？（L12 p28）', a: T`把数据在 $\mathbf p_1$ 方向上的分量去掉（project out），对剩下的数据重复同样的步骤。结果就是 $\Sigma_x$ 第二大特征值的特征向量，它与 $\mathbf p_1$ 正交。` },
      { t: 'story', title: 'PCA', md: 'Karl Pearson 在 1901 年就提出了"找最佳拟合直线/平面"的方法，Harold Hotelling 在 1933 年独立发展并命名为"principal components"。一百多年后它仍是最常用的降维方法。' },
    ],
    math: [
      { t: 'h3', text: 'PCA 推导（L12 p29，用 c28 的拉格朗日乘子）' },
      { t: 'steps', items: [
        T`先**中心化**：每个特征减去均值。`,
        T`Lagrangian：$L=\mathbf p_1'\Sigma_x\mathbf p_1-\lambda_1(\mathbf p_1'\mathbf p_1-1)$。`,
        T`求导令为 0：$2\Sigma_x\mathbf p_1-2\lambda_1\mathbf p_1=\mathbf 0$ ⇒ $\Sigma_x\mathbf p_1=\lambda_1\mathbf p_1$——$\mathbf p_1$ 是特征向量。`,
        T`代回：投影方差 $\mathbf p_1'\Sigma_x\mathbf p_1=\lambda_1\mathbf p_1'\mathbf p_1=\lambda_1$。要最大 ⇒ 取**最大**特征值。`,
        T`后续主成分：去掉 $\mathbf p_1$ 方向后重复（L12 p28）。`,
      ] },
      { t: 'h3', text: 'PCA vs autoencoder（L12 p30–p31）' },
      { t: 'table', cls: 'compact', head: ['', 'PCA', 'Autoencoder'], rows: [
        ['变换', '线性', '可以非线性'],
        ['求解', '特征分解（闭式）', '梯度下降（backprop）'],
        ['基', '正交、按方差排序', '不一定正交（线性单隐层时张成同一子空间，"almost PCA"）'],
        ['用途', '降维、可视化', '压缩、降维、无监督预训练、发现潜在特征'],
      ] },
    ],
    fx: [
      {
        title: 'PCA 的最优性条件', tex: T`\htmlClass{fx-p1}{\Sigma_x}\,\mathbf p_1=\htmlClass{fx-p2}{\lambda_1}\,\htmlClass{fx-p3}{\mathbf p_1}`,
        parts: [
          { label: 'Σ_x', note: '中心化数据的协方差矩阵（对称、PSD）。' },
          { label: 'λ₁', note: '拉格朗日乘子 = 特征值 = 沿 $\\mathbf p_1$ 的投影方差。取最大的那个。' },
          { label: 'p₁', note: '第一主成分方向（单位特征向量）。' },
        ],
      },
    ],
    example: [
      { t: 'h3', text: '二维 PCA' },
      T`$\Sigma_x=\begin{bmatrix}2&1\\1&2\end{bmatrix}$：特征值 3 和 1（c04 例 1）。PC1 方向 $\frac{1}{\sqrt2}(1,1)$，方差 3；PC2 方向 $\frac1{\sqrt2}(1,-1)$，方差 1。只保留 PC1 能解释 $3/(3+1)=75\%$ 的方差。`,
      { t: 'fade', title: '分步练习：主成分', plan: ['写出协方差 $\\Sigma_x$', T`求特征值、特征向量（2×2 用 c04 的公式）`, T`最大特征值 → PC1；解释方差比例 $=\lambda_1/\sum\lambda$`], items: [
        { md: T`$\Sigma_x=\begin{bmatrix}2&1\\1&2\end{bmatrix}$。`, steps: [
          { md: '已给出' }, { md: T`$\lambda=3,1$；$(1,1)/\sqrt2$、$(1,-1)/\sqrt2$` }, { md: '75%' },
        ] },
        { md: T`$\Sigma_x=\begin{bmatrix}4&0\\0&1\end{bmatrix}$。`, steps: [
          { ask: T`$\lambda_1=?$`, answer: 4, show: '对角矩阵，PC1 就是 $x_1$ 轴' },
          { ask: '解释方差比例 = ?', answer: 0.8, show: '$4/5$' },
        ] },
        { md: T`$\Sigma_x=\begin{bmatrix}3&2\\2&3\end{bmatrix}$。`, steps: [
          { ask: T`$\lambda_1=?$`, answer: 5, show: T`对角相等的 $\begin{bmatrix}a&b\\b&a\end{bmatrix}$ 特征值是 $a\pm b$：$3+2=5$、$3-2=1$（用 c04 的公式：中点 $3$，半径 $\sqrt{0^2+2^2}=2$，同样是 $3\pm2$）` },
          { ask: '解释方差比例 = ?', answer: 0.8333, tol: 0.002, show: '$5/6$' },
        ] },
      ] },
    ],
    viz: [
      { id: 'pca-ae', how: '二维点云（已中心化）。滑块选一个方向 $\\mathbf u$，每个点投影到这条线上（细线是投影误差）。读数：重建误差之和、投影方差。',
        try: '① 慢慢转动角度：投影方差最大的时候，重建误差恰好最小（勾股定理）。② 点"PCA"直接跳到第一主成分——它就是线性 autoencoder 学到的方向。' },
      { id: 'eigen-2d', opts: {}, how: '第 4 章的特征值工具：协方差矩阵的特征向量就是主成分方向。', try: '选 [[2,1],[1,2]]，最长的绿色箭头就是 PC1。' },
    ],
    compare: [
      { t: 'exam', md: T`**2021 Q9 — can an undercomplete autoencoder still learn a useless code?** Yes. A very complex non-linear encoder/decoder can memorise the training set: the encoder assigns an arbitrary code to each training input and the decoder stores the corresponding reconstruction, like a lookup table. Training reconstruction error is then tiny, but the code captures no useful structure and does not generalise. Undercompleteness alone does not prevent this; constraints such as denoising or sparsity are used.` },
      { t: 'exam', md: T`**Autoencoder vs PCA:** An autoencoder is trained to reconstruct its input through a bottleneck layer, learning a compressed (possibly non-linear) representation without labels. PCA finds orthonormal directions of maximum variance by solving $\Sigma_x\mathbf p=\lambda\mathbf p$ (keeping the top eigenvectors). With linear activations, one hidden layer and squared reconstruction loss, an autoencoder learns essentially the same subspace as PCA, but its weights need not be orthonormal or ordered by variance, and it is trained by gradient descent rather than eigen-decomposition.` },
    ],
    pitfalls: [
      ['Autoencoder 是监督学习', '它不需要标签（目标就是输入本身），属于无监督学习。'],
      ['Overcomplete 的 autoencoder 学得更好', '瓶颈比输入宽时可以直接复制输入；不加去噪、稀疏等约束通常学不到有用的表示。反过来，undercomplete 也不保证学到有用的表示。'],
      ['PCA 取最小特征值的方向', '取**最大**特征值（方差最大）。'],
      ['PCA 不需要中心化', '必须先减均值（L12 p29）。'],
    ],
    quiz: [
      { type: 'num', q: '协方差特征值 6、3、1。保留前两个主成分解释的方差比例？', answer: 0.9, explain: '$9/10$。' },
      { type: 'mc', q: 'PCA 中 $\\mathbf p_1\'\\Sigma_x\\mathbf p_1$ 在最优点等于：', options: ['0', '1', '最大特征值', '迹'], answer: 2, explain: '$\\lambda_1$。' },
      { type: 'mc', q: '下面哪个**不能**防止 autoencoder 直接复制输入？', options: ['窄的 bottleneck', '对输入加噪声', '让 $\\mathbf u$ 稀疏', '让 bottleneck 比输入更宽'], answer: 3, explain: 'L12 p25–p26。' },
    ],
  });

  /* =====================================================================
   * r06 · W6 复习
   * ===================================================================== */
  SML.content.add(SML.review({
    id: 'r06', week: 'W6', title: 'W6 复习：神经网络与训练', en: 'Week 6 review',
    summary: '核心是 **backpropagation**（2021 Q13(b) 考过推导）：会写（单输出、平方损失 $L=\\frac12(z-y)^2$、恒等输出时的）$\\delta=z-y$、$\\partial L/\\partial w_j=\\delta u_j$、$\\varepsilon_j=\\delta w_jg\'(r_j)$、$\\partial L/\\partial v_{ij}=\\varepsilon_jx_i$，并能对小网络手算。其余是概念：非线性激活、万能逼近、优化器、正则化、autoencoder vs PCA。',
    keypoints: [
      [T`MLP = 叠 perceptron + 非线性激活（函数复合）；隐藏层 = 学出来的 basis；万能逼近：一层够宽就能逼近连续函数；深比宽经验上更好。`, 'c33'],
      [T`Backprop（单输出、平方损失、恒等输出）：前向存 $r_j,u_j$；$\delta=z-y$（一般是 $\delta=\frac{\partial L}{\partial z}h'(s)$）；$\partial L/\partial w_j=\delta u_j$；$\varepsilon_j=\delta w_jg'(r_j)$；$\partial L/\partial v_{ij}=\varepsilon_jx_i$。`, 'c34'],
      [T`Mini-batch 折中；momentum $\mathbf v=\alpha\mathbf v+\eta\nabla L$；Adagrad 按梯度平方和缩放；Adam = 动量 + 自适应 + 偏差校正。`, 'c35'],
      [T`DNN 易过拟合：early stopping（隐式）、weight decay（梯度 $+2\lambda w$）、dropout（训练随机屏蔽、测试不屏蔽并缩放；冗余 + 集成）。`, 'c36'],
      [T`Autoencoder：重建输入 + bottleneck；PCA：$\Sigma_x\mathbf p=\lambda\mathbf p$，取最大特征值；线性单隐层 AE ≈ PCA。`, 'c37'],
    ],
    map: [
      T`**一条线串起来**：网络结构（c33）决定前向计算 → backprop（c34）给出梯度 → 优化器（c35）用梯度更新 → 正则化（c36）防止过拟合 → autoencoder（c37）把同一套机器用在无监督任务上。`,
    ],
    recall: [
      { q: '五种激活函数？', a: 'step、sign、logistic $\\frac1{1+e^{-s}}$、tanh、ReLU $\\max(0,s)$。', ch: 'c33' },
      { q: '为什么需要非线性激活？', a: '线性的复合还是线性，多层等于一层，学不了 XOR。', ch: 'c33' },
      { q: 'Universal approximation theorem？', a: '激活满足温和条件时，一个有限隐藏层就能任意精度逼近连续函数（只说存在）。', ch: 'c33' },
      { q: '数全连接网络参数：3→4→2（含 bias）？', a: '$(3+1)4+(4+1)2=26$。', ch: 'c33' },
      { q: 'Backprop 的四个公式（平方损失 + 恒等输出）？', a: T`$\delta=z-y$；$\partial L/\partial w_j=\delta u_j$；$\varepsilon_j=\delta w_jg'(r_j)$；$\partial L/\partial v_{ij}=\varepsilon_jx_i$。`, ch: 'c34' },
      { q: '（2021 Q13b）$L$ 不直接依赖隐藏层权重，怎么求导？', a: '沿 $v_{ij}\\to r_j\\to u_j\\to s\\to z\\to L$ 用链式法则相乘；先算输出误差 $\\delta$，再往回传复用。', ch: 'c34' },
      { q: 'Sigmoid 的导数？', a: T`$\sigma(r)(1-\sigma(r))$，最大 0.25。`, ch: 'c34' },
      { q: 'GD vs SGD vs mini-batch？', a: '全部数据（稳慢）/ 1 个（快、方差大）/ $1<b<N$（折中、可并行）。', ch: 'c35' },
      { q: 'Momentum 和 Adagrad 的更新式？', a: T`$\mathbf v=\alpha\mathbf v+\eta\nabla L$，$\boldsymbol\theta\mathrel{-}=\mathbf v$；$g_i\mathrel{+}=(\nabla L)_i^2$，$\theta_i\mathrel{-}=\frac{\eta}{\sqrt{g_i+\epsilon}}(\nabla L)_i$。`, ch: 'c35' },
      { q: 'Adam = ?', a: 'momentum（一阶矩）+ 自适应步长（二阶矩）+ 偏差校正。', ch: 'c35' },
      { q: 'DNN 的三种正则化？', a: 'early stopping、weight decay（$L_2$）、dropout。', ch: 'c36' },
      { q: 'Dropout 为什么有效？测试时怎么做？', a: '迫使冗余表示、相当于指数多个子网络的集成、权重更小；测试时不屏蔽并按保留概率缩放权重。', ch: 'c36' },
      { q: 'Undercomplete vs overcomplete autoencoder？', a: '瓶颈比输入窄（被迫压缩）vs 宽（可直接复制）。', ch: 'c37' },
      { q: 'PCA 的推导结论？', a: T`最大化 $\mathbf p'\Sigma\mathbf p$ s.t. $\|\mathbf p\|=1$ ⇒ $\Sigma\mathbf p=\lambda\mathbf p$，取最大特征值；方差 = $\lambda$。`, ch: 'c37' },
    ],
    formulas: [
      ['$r_j=\\sum_ix_iv_{ij}$，$u_j=g(r_j)$，$s=\\sum_ju_jw_j$', '前向', 'L11 p9'],
      ['$\\delta=z-y$，$\\frac{\\partial L}{\\partial w_j}=\\delta u_j$，$\\frac{\\partial L}{\\partial v_{ij}}=\\delta w_jg\'(r_j)x_i$', 'backprop', 'L11 p28–p31'],
      ['$\\mathbf v=\\alpha\\mathbf v+\\eta\\nabla L$；$\\boldsymbol\\theta\\mathrel{-}=\\mathbf v$', 'momentum', 'L12 p12'],
      ['$\\theta_i\\mathrel{-}=\\frac{\\eta}{\\sqrt{g_i+\\epsilon}}\\nabla_i$', 'Adagrad', 'L12 p13'],
      ['$\\hat m=\\frac{m}{1-\\beta_1^t},\\ \\hat v=\\frac{v}{1-\\beta_2^t},\\ \\theta\\mathrel{-}=\\frac{\\eta}{\\sqrt{\\hat v+\\epsilon}}\\hat m$', 'Adam', 'L12 p14'],
      ['$L+\\lambda\\|\\boldsymbol\\theta\\|^2$，梯度 $+2\\lambda w$', 'weight decay', 'L12 p19'],
      ['$\\Sigma_x\\mathbf p_1=\\lambda_1\\mathbf p_1$', 'PCA', 'L12 p29'],
    ],
    exam: [
      ['Backprop 推导 / 解释', '2021 Q13(b)（6 分）', '[T10](#/T10)'],
      ['神经网络作为学习出来的 basis', '2021 Q4', '[T13](#/T13)'],
      ['深度学习概念（激活、dropout、优化器、autoencoder）', '2021 Q4、Q7、Q9、Q13(b)', '[T13](#/T13)'],
      ['参数计数（为 CNN 打基础）', 'T3', '[T3](#/T03)'],
    ],
    quiz: [
      { type: 'num', q: '4 输入 → 5 隐藏 → 3 输出（含 bias），参数数？', answer: 43, explain: '每个单元多一个 bias。第一层：每个隐藏单元连 4 个输入 + 1 个 bias，共 $(4+1)\\times5=25$；第二层：每个输出单元连 5 个隐藏单元 + 1 个 bias，共 $(5+1)\\times3=18$。合计 $43$。' },
      { type: 'num', q: 'Backprop（单输出，平方损失 $L=\\frac12(z-y)^2$，恒等输出）：$z=2$，$y=3$，$w_1=0.5$，ReLU 且 $r_1>0$，$x_2=4$。$\\partial L/\\partial v_{21}=?$', answer: -2, explain: '$\\delta=-1$，$\\varepsilon_1=-1\\times0.5\\times1=-0.5$，$\\times4=-2$。' },
      { type: 'num', q: 'Adagrad：$\\eta=1$，$\\epsilon\\approx0$，同一个参数前两步的梯度是 3、4，第三步梯度是 5。第三步的步长？', answer: 0.7071, tol: 0.002, explain: '累加梯度平方：$g=3^2+4^2+5^2=9+16+25=50$。步长 $=\\eta\\times5/\\sqrt{g}=5/\\sqrt{50}$；$\\sqrt{50}=5\\sqrt2\\approx7.071$，所以 $\\approx0.707$。' },
      { type: 'num', q: 'PCA：$\\Sigma=\\begin{bmatrix}5&0\\\\0&5\\end{bmatrix}$，PC1 解释方差比例？', answer: 0.5, explain: '两个特征值相等，各 50%（方向不唯一）。' },
      { type: 'mc', q: '下面哪个说法**错误**？', options: ['dropout 测试时不屏蔽', 'early stopping 看验证误差', 'weight decay 等价于 Laplace 先验', 'Adam 有偏差校正'], answer: 2, explain: 'Weight decay（$L_2$）对应 Gaussian 先验。' },
      { type: 'show', q: '（英文）Explain the vanishing gradient problem in deep networks.', answer: T`Backpropagated gradients are products of many local derivatives; with saturating activations such as sigmoid ($\sigma'\le0.25$) or tanh, these factors are often small, so gradients for early layers shrink exponentially with depth and those layers learn very slowly. ReLU (derivative 1 for positive inputs) and architectures such as LSTMs/residual connections mitigate this.` },
    ],
    next: '下一周（W7）：CNN 和 RNN/Transformer。CNN 参数计数（T3）是往年必考计算题。',
  }));
})(window);
