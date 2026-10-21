/* W7 · L13 卷积神经网络 + L14 RNN、Attention、Transformer — chapters c38–c41 and review r07. */
(function (root) {
  'use strict';
  const SML = root.SML;
  const T = String.raw;
  const add = (c) => SML.content.add(SML.chapter(c));

  /* =====================================================================
   * c38 · 卷积、filter、参数计数（L13 p2–p18）
   * ===================================================================== */
  add({
    id: 'c38', week: 'W7', lec: 'L13', pages: 'L13 p2–p18', star: 3,
    keyEn: [
      T`A convolutional layer slides a small filter over the input, taking an elementwise product and sum at each position; the same filter weights are used at every position (weight sharing).`,
      T`Parameters: $C_{out}\times C_{in}\times K^2$ weights plus $C_{out}$ biases, independent of the input size; never multiply by the number of output positions (one single-channel 1D width-3 filter has 3 weights).`,
      T`Output size $\lfloor(n+2p-k)/s\rfloor+1$; a fully connected layer has $n_{in}n_{out}$ weights (+ $n_{out}$ biases); pooling layers have no parameters.`,
      T`Fully connected nets on images ignore spatial structure, need huge numbers of parameters and must relearn a pattern at every location; convolution gives local connectivity, translation equivariance and far fewer parameters.`,
    ],
    keyZh: [
      T`卷积层：一个小 filter（滤波器）在输入上滑动，每个位置把对应元素相乘再求和，得到一个输出；所有位置用同一套 filter 权重，这叫权重共享（weight sharing）。`,
      T`参数 = filter 个数 × 输入通道数 × 每个通道上的 $K\times K$，再加每个 filter 一个 bias，与图像大小无关。绝不按输出位置重复计数：真题里单通道、宽 3 的 1D filter 只有 3 个权重。`,
      T`输出边长用上面的公式（padding 加 $2p$，别漏 +1）；全连接层权重 = 输入数 × 输出数，再加每个输出一个 bias；pooling 层没有参数。`,
      T`把图像拉平喂全连接网络：丢了相邻关系、参数爆炸，同一图案换个位置还得重学。卷积只连局部、到处共享权重，参数少得多，而且平移等变（图案平移，特征图跟着平移）。`,
    ],
    examQ: [
      { src: '2026 practice Q1d / 2025 practice Q5', q: T`How many parameters does the following convolutional neural network have (exclude the bias)? (Figure on the [T3](#/T03) page: 7 inputs → 1D convolutional layer of 5 units, each seeing 3 inputs → fully connected 4 → fully connected 5.)`,
        a: T`$3+5\cdot4+4\cdot5=43$. The convolutional layer uses one width-3 filter shared across all positions, so it has 3 weights (not $5\times3$); the fully connected layers have $5\times4=20$ and $4\times5=20$.`,
        qzh: T`下面这个卷积神经网络（convolutional neural network）有多少个参数（不计偏置 bias）？（图见 [T3](#/T03) 页：7 个输入 → 一维卷积层 1D convolutional layer，5 个单元，每个单元看 3 个输入 → 全连接层 fully connected，4 个单元 → 全连接层，5 个单元。）`,
        azh: T`$3+5\cdot4+4\cdot5=43$。卷积层（convolutional layer）只用一个宽度为 3 的滤波器（filter），在所有位置共享，所以只有 3 个权重（不是 $5\times3$）；两个全连接层（fully connected layers）分别有 $5\times4=20$ 和 $4\times5=20$ 个权重。` },
    ],
    title: '卷积、filter、参数计数', en: 'Convolution, filters, feature maps, counting CNN parameters',
    summary: '把图像拉平喂给全连接网络，既丢了空间结构、参数又爆炸。**CNN（卷积神经网络）** 用一个小的 **filter（滤波器 / 卷积核）** 在输入上滑动，每个位置做"逐元素相乘再求和"，**同一个 filter 在所有位置共享参数**。参数计数（T3）是往年必考计算题：卷积层**不按输出位置重复计数**——标准 2D 卷积的权重数为 $C_{out}C_{in}K^2$（含 bias 再加 $C_{out}$）；真题那种一维、单通道、单 filter 的卷积层只有 3 个权重。',
    prereq: ['c33'],
    symbols: [
      [T`$\mathbf a*\mathbf w$`, T`卷积（星号 * 不是乘法）`],
      [T`$a_i,\ w_i,\ b_i$`, T`1D：输入第 $i$ 个元素、filter 第 $i$ 个权重、输出第 $i$ 个元素`],
      [T`$c$`, T`1D filter 的**半宽**：filter 宽 $2c+1$（宽 3 时 $c=1$）`],
      [T`$\delta$`, T`偏移量，从 $-c$ 走到 $c$：$a_{i+\delta}$ 是以 $a_i$ 为中心的邻居`],
      [T`$A,\ W,\ B$`, T`2D：输入矩阵、filter 矩阵、输出矩阵`],
      [T`$c_1,\ c_2$`, T`2D filter 的行、列半宽（课件写作 $C,D$；这里改名，免得和通道数 $C_{in}$ 混淆）`],
      [T`$k$（或 $K\times K$）`, T`filter 的宽度（大小）`],
      [T`$C_{in},\ C_{out}$`, T`输入通道数（RGB 为 3）、filter 个数（= 输出通道数）`],
      [T`$s$, $p$`, T`stride（步长）、padding（补零的圈数）`],
      [T`$n$`, T`输入的宽（或高）`],
      [T`$\lfloor\cdot\rfloor$`, T`向下取整`],
    ],
    goals: [
      '解释为什么全连接网络不适合图像（L13 p3–p6）：没有平移不变性、参数太多',
      '手算 1D、2D 卷积（逐元素相乘再求和）',
      '用公式算输出尺寸 $\\lfloor(n+2p-k)/s\\rfloor+1$',
      '数卷积层参数：$C_{out}\\cdot C_{in}\\cdot K^2$（+ $C_{out}$ 个 bias）；会做 2026 Q1d / 2025 Q5 那张图',
    ],
    types: ['T03'],
    what: [
      T`**动机**（L13 p3–p6）：$9\times9$ 的图拉平成 81 维向量喂全连接网络——① 丢掉了"哪些像素相邻"的信息；② 同一个图案（比如一条竖线）出现在左上和右下，全连接网络要分别学两次（**没有平移不变性**）；③ 参数太多、容易过拟合。缺的就是 **weight sharing（权重共享）**。`,
      T`**Convolution（卷积）**（L13 p8–p11）：一个小的 **filter / kernel**（注意：和 SVM 的 kernel 无关，L13 p10）在输入上滑动，每个位置把对应元素相乘再求和，得到一个输出值：`,
      T`**先用三个数做一次**：输入 $[1,2,3,4,5]$，filter $[1,0,-1]$，对准第 2 格（左邻 1、自己 2、右邻 3）：$1\times1+2\times0+3\times(-1)=-2$。挪到第 3 格：$2\times1+3\times0+4\times(-1)=-2$；第 4 格同样是 $-2$。"小模板滑到每一格、逐格相乘再求和"就是卷积；下面公式里的 $\delta$ 只是把"左边、自己、右边"写成偏移量：`,
      { t: 'video', id: 'conv' },
      { t: 'math', tex: T`\text{1D: } b_i=\sum_{\delta=-c}^{c}a_{i+\delta}\,w_{\delta+c+1}\qquad\text{2D: } B_{ij}=\sum_{\delta_i=-c_1}^{c_1}\sum_{\delta_j=-c_2}^{c_2}A_{i+\delta_i,\,j+\delta_j}\,W_{\delta_i+c_1+1,\,\delta_j+c_2+1}` },
      T`**下标怎么读**：$\delta$ 从 $-c$ 走到 $c$，$a_{i+\delta}$ 就是以 $a_i$ 为中心的 $2c+1$ 个邻居。filter 的下标从 1 开始，所以写成 $w_{\delta+c+1}$：$\delta=-c$ 对应 $w_1$，$\delta=c$ 对应 $w_{2c+1}$。例：宽 3（$c=1$）时 $b_i=a_{i-1}w_1+a_iw_2+a_{i+1}w_3$。2D 同理，行、列各走一遍。`,
      T`（数学上的卷积要先把 filter **左右翻转**再滑动；深度学习里的"卷积"不翻转，严格说叫 **cross-correlation（互相关）**。filter 本来就是学出来的，翻不翻转只是参数的排列顺序不同，效果一样。考试按课件公式算即可。）`,
      T`**Feature map（特征图 / response map）**（L13 p16）：一个 filter 滑过整张图得到的输出图，显示"这个图案在哪里出现"。多个 filter 识别多种图案，输出就有多个 **channel（通道）**。`,
      T`**超参数**（L13 p17）：filter 大小、filter 个数（输出深度）、**stride（步长）**（每次滑多远）、**zero padding（补零）**。filter 里的数值是**学出来的参数**。`,
      T`**多通道**（L13 p18）：RGB 输入有 3 个通道；一个 filter 在 3 个通道上各有一套权重，三个通道的结果**逐元素相加**成一个输出通道。`,
      T`**数参数**（本章标题、T3 题型）：权重共享的直接后果是参数个数**不随图像大小变化**——一个 filter 在所有位置用同一套权重，所以**不能按输出格子重复计数**。标准 2D 卷积：$C_{\text{out}}$ 个 filter，每个在 $C_{\text{in}}$ 个输入通道上各有 $K\times K$ 个数，共 $C_{\text{out}}C_{\text{in}}K^2$ 个权重，每个 filter 再加 1 个 bias。真题那种一维、单通道、一个宽 3 的 filter，权重只有 3 个。`,
    ],
    why: [
      T`**T3 是往年最稳定的计算题之一**（2026 Q1d、2025 Q5：同一张 1D CNN 图，答案 43）。规则只有一句：**卷积层权重共享**。见 [T3](#/T03)。`,
      T`CNN 是计算机视觉的基础，ResNet、迁移学习等（c39）都建立在它上面。`,
    ],
    intuition: [
      T`**卷积 = 拿模板去比对。** filter 是一个小图案，滑到某处时"逐元素相乘再求和"就是两者的点积——图案越像，输出越大（L13 p14–p15：图案完全吻合时响应最高）。`,
      T`**权重共享 = 一个检测器到处用。** 竖线检测器在左上角有用，在右下角同样有用，所以用同一组参数。这既带来 **translation equivariance（平移等变性）**——输入里的图案平移，特征图上的响应也跟着平移同样的距离（假设 stride 1、忽略边界）；再配合 pooling 才得到一定程度的平移**不变**性（c39）——又极大减少参数（L13 p25：卷积相当于一种正则化）。`,
      { t: 'think', q: T`输入 7 个单元，1D 卷积层输出 5 个单元，每个输出连 3 个输入。这一层有多少个**权重**参数？`, a: T`3 个（不是 $5\times3=15$）。5 个输出单元共享同一个宽度为 3 的 filter。这正是 2026 Q1d 的陷阱：算成 15 就会把总数写成 55 而不是 43。` },
      { t: 'story', title: 'LeNet 和 AlexNet', md: 'Yann LeCun 在 1989 年用反向传播训练卷积网络识别手写邮编，1998 年的 LeNet-5（L13 p21 的那张结构图）用于银行支票识别。2012 年 Krizhevsky、Sutskever 和 Hinton 的 AlexNet 用 GPU 训练大 CNN，在 ImageNet 比赛上大幅领先，引爆了深度学习热潮。' },
    ],
    math: [
      { t: 'h3', text: '输出尺寸' },
      { t: 'math', tex: T`\text{output}=\Big\lfloor\frac{n+2p-k}{s}\Big\rfloor+1` },
      T`L13 p17：$32\times32\times1$ 输入，6 个 $5\times5$ filter，stride 1，无 padding ⇒ $(32-5)/1+1=28$ ⇒ 输出 $28\times28\times6$。`,
      { t: 'h3', text: '参数计数（T3 的三条公式）' },
      { t: 'table', head: ['层', '权重', 'bias'], rows: [
        ['1D 卷积，宽 $k$，1 个 filter', '$k$', '1'],
        ['2D 卷积，$C_{out}$ 个 $K\\times K$ filter，输入 $C_{in}$ 通道', '$C_{out}\\cdot C_{in}\\cdot K^2$', '$C_{out}$'],
        ['全连接 $n_{in}\\to n_{out}$', '$n_{in}\\cdot n_{out}$', '$n_{out}$'],
        ['Max pooling', '0', '0'],
      ] },
      T`对比：如果把 $32\times32$ 输入和 $28\times28\times6$ 输出**全连接**，需要 $1024\times4704\approx4.8$ 百万个权重；卷积只要 $6\times25=150$ 个。`,
    ],
    fx: [
      {
        title: '卷积层参数', tex: T`\#\text{params}=\htmlClass{fx-p1}{C_{out}}\times\htmlClass{fx-p2}{C_{in}}\times\htmlClass{fx-p3}{K^2}+\htmlClass{fx-p4}{C_{out}}`,
        parts: [
          { label: 'C_out', note: 'filter 的个数 = 输出通道数。' },
          { label: 'C_in', note: '每个 filter 在每个输入通道上都有一套 $K\\times K$ 权重。' },
          { label: 'K²', note: '一个 filter 在一个通道上的大小。**与输入、输出的宽高无关**（共享）。' },
          { label: 'bias', note: '每个 filter 一个。题目说 exclude bias 就不加。' },
        ],
      },
    ],
    example: [
      { t: 'h3', text: '1D 卷积' },
      T`$\mathbf a=[1,2,3,4,5]$，$\mathbf w=[1,0,-1]$（$c=1$）：$b_2=a_1w_1+a_2w_2+a_3w_3=1-3=-2$；$b_3=2-4=-2$；$b_4=3-5=-2$。输出长度 $5-3+1=3$。（$\mathbf w=[1,0,-1]$ 算的是 $a_{i-1}-a_{i+1}$：左邻减右邻。输入每格涨 1，所以处处是 $-2$；输入平坦的地方输出 0、下降的地方输出正数——它是一个"变化检测器"。）`,
      { t: 'h3', text: '2D 卷积' },
      T`$A=\begin{bmatrix}1&2&0&1\\0&1&3&1\\2&1&0&0\\1&0&1&2\end{bmatrix}$，竖边检测 $W=\begin{bmatrix}1&0&-1\\1&0&-1\\1&0&-1\end{bmatrix}$，stride 1、无 padding ⇒ 输出 $2\times2$：`,
      { t: 'steps', items: [
        T`左上：窗口 = $A$ 的第 1–3 行、第 1–3 列 $\begin{bmatrix}1&2&0\\0&1&3\\2&1&0\end{bmatrix}$。和 $W$ 逐格相乘：左列乘 1，中间列乘 0（直接消失），右列乘 −1。左列 $1+0+2=3$，右列 $0+3+0=3$，$B_{11}=3-3=0$。`,
        T`右上（窗口右移一格：第 1–3 行、第 2–4 列）：左列 $2+1+1=4$，右列 $1+1+0=2$，$B_{12}=4-2=2$。`,
        T`左下（第 2–4 行、第 1–3 列）：$(0+2+1)-(3+0+1)=-1$；右下（第 2–4 行、第 2–4 列）：$(1+1+0)-(1+0+2)=-1$。`,
        T`$B=\begin{bmatrix}0&2\\-1&-1\end{bmatrix}$。`,
      ] },
      { t: 'h3', text: 'Workshop 8 slide 的例子（附勘误）' },
      T`$A=\begin{bmatrix}2&3&5&0\\1&5&7&-9\\-5&2&1&1\\2&0&-2&4\end{bmatrix}$，$2\times2$ kernel $W=\begin{bmatrix}1&0\\0&-1\end{bmatrix}$，stride 1，bias 0 ⇒ 输出边长 $4-2+1=3$。这个 kernel 只留窗口的左上格、减去右下格：$B_{ij}=A_{ij}-A_{i+1,j+1}$。左上：$2\times1+3\times0+1\times0+5\times(-1)=-3$；中心：$5\times1+7\times0+2\times0+1\times(-1)=4$。全部 9 格：$B=\begin{bmatrix}-3&-4&14\\-1&4&6\\-5&4&-3\end{bmatrix}$。`,
      { t: 'errata', title: 'Workshop 8 slide 笔误', md: T`slide p5 把输出的中心格印成 5。按上面的算式是 $5-1=4$，考试写 4。` },
      { t: 'fade', title: '分步练习：输出尺寸与参数', plan: [T`输出尺寸 $\lfloor(n+2p-k)/s\rfloor+1$`, T`每个 filter 参数 $=K^2C_{in}$（+1 bias）`, T`乘以 filter 个数 $C_{out}$`], items: [
        { md: T`输入 $32\times32\times1$，6 个 $5\times5$ filter，$s=1$，$p=0$，含 bias。`, steps: [
          { md: '$28\\times28\\times6$' }, { md: '$25+1=26$' }, { md: '$6\\times26=156$' },
        ] },
        { md: T`输入 $28\times28\times6$，16 个 $5\times5$ filter，$s=1$，$p=0$，含 bias。`, steps: [
          { ask: '输出宽度 = ?', answer: 24, show: '$28-5+1=24$' },
          { ask: '每个 filter 参数（含 bias）= ?', answer: 151, show: T`$5\cdot5\cdot6+1=151$` },
          { ask: '总参数 = ?', answer: 2416, show: '$16\\times151$' },
        ] },
        { md: T`输入 $64\times64\times3$（RGB），10 个 $3\times3$ filter，$s=2$，$p=1$，含 bias。`, steps: [
          { ask: '输出宽度 = ?', answer: 32, show: T`公式 $\lfloor(W+2p-F)/s\rfloor+1$：$W=64$，$2p=2\times1=2$，$F=3$，$s=2$。$(64+2-3)/2=63/2=31.5$，向下取整得 31，再加 1 得 32` },
          { ask: '每个 filter 参数（含 bias）= ?', answer: 28, show: '$9\\times3+1=28$' },
          { ask: '总参数 = ?', answer: 280, show: '$10\\times28$' },
        ] },
      ] },
    ],
    viz: [
      { id: 'conv-2d', how: '左边是输入（灰格是 padding），中间是 filter，右边是输出特征图。每点"下一步"，filter 滑到下一个位置：高亮的窗口逐元素相乘再求和，得到右边高亮的输出格。下方给出输出尺寸公式。',
        try: '① 用"vertical edge"图像 + 竖边 filter：只有边缘处输出大。② 把 stride 改成 2，输出变小；padding 改成 1，输出变大。用公式验证。' },
      { id: 'cnn-counter', opts: { preset: 'EX2026Q1d' }, how: '往年真题的 1D CNN：卷积层的边用三种颜色标出，同色 = 同一个共享权重；全连接层的灰色边每条都是独立权重。2D 标签页可以算多层 CNN 的尺寸和参数。',
        try: '只数卷积层的彩色边有几种颜色——那就是卷积层的参数个数（3）；灰色的全连接边各算一个：$5\\times4+4\\times5=40$，合计 43。' },
    ],
    compare: [
      { t: 'table', head: ['', '全连接层', '卷积层'], rows: [
        ['每个输出连接', '所有输入', '一小块局部输入'],
        ['参数', '每条边一个', '一个 filter 在所有位置共享'],
        ['参数数量', '$n_{in}\\times n_{out}$', '$C_{out}C_{in}K^2$，与图像大小无关'],
        ['图案平移后', '要在新位置重新学', '特征图跟着平移（等变）；配合 pooling 得到一定的不变性（c39）'],
      ] },
      { t: 'exam', md: T`**Why do CNNs use far fewer parameters than fully connected networks?** A convolutional layer applies the same small filter at every spatial location (weight sharing) and each output unit connects only to a local patch, so its parameters are $C_{out}\times C_{in}\times K^2$ (+ $C_{out}$ biases), independent of the input size. This exploits local structure, gives translation-equivariant feature detection and acts as a regulariser, whereas a fully connected layer needs a separate weight for every input–output pair.` },
    ],
    pitfalls: [
      ['卷积层参数 = 输出单元数 × filter 大小', '权重共享：不按输出位置重复计数。权重 $=C_{out}C_{in}K^2$（含 bias 再加 $C_{out}$）；真题的单通道单 filter 层就是 filter 宽度 3。'],
      ['RGB 输入时 filter 只有 $K\\times K$ 个权重', '是 $K\\times K\\times3$：每个输入通道一套。'],
      ['CNN 的 kernel 和 SVM 的 kernel 是一回事', '完全无关（L13 p10）。'],
      ['输出尺寸是 $n-k$', '$\\lfloor(n+2p-k)/s\\rfloor+1$；别漏 +1。'],
    ],
    quiz: [
      {
        type: 'num', q: T`（平时小测原题）We want to create a model for a binary classification problem with $10\times10$ input grayscale (single-channel) images. We use a CNN with: a convolutional layer with two filters, each $3\times3$, stride 1, no padding; a max-pooling layer over $4\times4$ patches, stride 1, no padding; a fully-connected layer with 3 neurons (ReLU); an output layer with one node (sigmoid). None of the learnable layers includes bias terms. How many parameters does this model have?`,
        qzh: T`二分类，输入是 $10\times10$ 的单通道灰度图。网络：卷积层 2 个 $3\times3$ filter、步长 1、不补零；max-pooling 窗口 $4\times4$、步长 1、不补零；全连接层 3 个神经元（ReLU）；输出层 1 个节点（sigmoid）。所有层都没有 bias。这个模型一共多少个参数？`,
        answer: 171,
        explain: T`一层一层数。卷积层：输入单通道，每个 filter 有 $3\times3\times1=9$ 个权重，2 个 filter 共 $18$；输出边长 $(10-3)/1+1=8$，即 $8\times8\times2$。Max-pooling 没有参数；边长 $(8-4)/1+1=5$，输出 $5\times5\times2=50$ 个数，展平后是全连接层的 50 个输入。全连接层：3 个神经元各连 50 个输入，$50\times3=150$。输出层：1 个节点连 3 个，$3$。**合计 $18+150+3=171$**。常见错误：给 pooling 算参数，或把卷积按输出位置重复计数（$8\times8\times2\times9$）。`,
      },
      { type: 'num', q: '1D 输入 10 个单元，filter 宽 4，stride 1，无 padding。输出几个单元？', answer: 7, explain: T`求的是 filter（滤波器）在输入上能停几个位置，用输出尺寸公式 $\lfloor(n+2p-k)/s\rfloor+1$。代入题目：输入宽 $n=10$，filter 宽 $k=4$，无 padding 即 $p=0$，stride $s=1$：$(10+0-4)/1+1=6+1=7$。直观地数：filter 左端可以放在第 1、2、…、7 格，放在第 7 格时右端正好压在第 10 格。常见错误是只算 $10-4=6$，**漏了最后的 +1**。` },
      { type: 'num', q: '输入 $16\\times16\\times8$，32 个 $3\\times3$ filter，不含 bias。权重数？', answer: 2304, explain: T`求卷积层的权重个数，公式 $C_{out}\times C_{in}\times K^2$。filter 个数 $C_{out}=32$；输入的第三维 8 是通道数 $C_{in}$，每个 filter 在 8 个通道上各有一套 $3\times3$ 权重，所以一个 filter 有 $8\times9=72$ 个数；32 个 filter 共 $32\times72=2304$ 个。输入的宽高 $16\times16$ 不进公式：**weight sharing（权重共享）让参数个数与图像大小无关**。陷阱：忘乘通道数 8，会得到 $32\times9=288$。` },
      { type: 'num', q: '输入宽 7，filter 宽 3，stride 2，padding 1。输出宽？', answer: 4, explain: T`用输出尺寸公式 $\lfloor(n+2p-k)/s\rfloor+1$。代入：输入宽 $n=7$；padding $p=1$ 表示两边各补 1 格 0，所以加的是 $2p=2$；filter 宽 $k=3$；stride $s=2$。$(7+2-3)/2=6/2=3$，向下取整仍是 3，再加 1 得 4。核对：补零后长度 9，filter 左端可停在第 1、3、5、7 格，正好 4 个位置。易错点：只加 $p$ 不加 $2p$，或**忘了最后的 +1**。` },
      { type: 'num', q: '（真题）7 输入 → 1D 卷积（宽 3）→ 5 → 全连接 4 → 全连接 5，不含 bias。参数总数？', answer: 43, explain: '卷积层只有一个宽 3 的 filter，所有位置共享：权重 3 个（不是 $5\\times3$）。全连接 5→4：$5\\times4=20$；全连接 4→5：$4\\times5=20$。合计 $3+20+20=43$。' },
      { type: 'num', q: '（Worksheet 8 卷积 autoencoder 的第一层）输入 $32\\times32\\times3$，8 个 $4\\times4$ filter，stride 2，padding 1。输出宽？', answer: 16, explain: T`用输出尺寸公式 $\lfloor(n+2p-k)/s\rfloor+1$：$n=32$，$2p=2$，$k=4$，$s=2$。$(32+2-4)/2=30/2=15$，再加 1 得 16，输出 $16\times16\times8$。stride 2 让边长减半，所以这种卷积可以**代替 pooling 做下采样**。encoder 连做三层（filter 数 8、16、32）：$32\to16\to8\to4$，编码是 $4\times4\times32=512$ 个数（c37）。` },
      { type: 'mc', q: 'L13 p17 中 6 个 $5\\times5$ filter 作用于 $32\\times32\\times1$ 输入（s=1, p=0），输出是：', options: ['$32\\times32\\times6$', '$28\\times28\\times6$', '$28\\times28\\times1$', '$27\\times27\\times6$'], answer: 1, explain: '$32-5+1=28$，6 个 filter → 6 通道。' },
    ],
  });

  /* =====================================================================
   * c39 · Pooling 与 CNN 架构（L13 p20–p30）
   * ===================================================================== */
  add({
    id: 'c39', week: 'W7', lec: 'L13', pages: 'L13 p20–p30', star: 2,
    keyEn: [
      T`Max pooling replaces each $m\times m$ patch with its maximum: it lowers the resolution (and later layers' parameters), keeps the number of channels and has no parameters.`,
      T`Backpropagation through max pooling uses a sub-gradient: the gradient goes only to the input that attained the maximum (one chosen input if tied).`,
      T`Convolution is translation-equivariant; max pooling adds some, not guaranteed, translation invariance. Stacking $L$ stride-1 convolutions of width $k$ gives a receptive field of $1+L(k-1)$.`,
      T`ResNet residual blocks output $F(\bx)+\bx$; the identity path lets gradients pass, so very deep networks (152 layers) can be trained. Transfer learning: pretrain on a large dataset, then fine-tune.`,
    ],
    keyZh: [
      T`最大池化（max pooling）：每个 $m\times m$ 小块只留最大值。宽高变小，后面层的参数也随之变少；通道数不变；它自己没有参数。`,
      T`max 不是处处可导，反向传播用次梯度（sub-gradient）：梯度只传给前向时取到最大值的那个输入，其余为 0；有并列最大值时只挑其中一个。`,
      T`卷积是平移等变（图案平移，特征图跟着平移）；max pooling 再带来一定的平移不变性，但不保证（最大值跨出窗口时输出会变）。每叠一层宽 $k$ 的卷积，感受野（receptive field）宽度多 $k-1$。`,
      T`ResNet 残差块：输出 = 学到的变换 + 输入本身，梯度能沿这条直通路传回前面的层，152 层也能训练。迁移学习（transfer learning）：先在大数据集上预训练，再在目标任务上微调（fine-tune）。`,
    ],
    title: 'Pooling 与 CNN 架构', en: 'Max pooling, translation invariance, receptive fields, ResNet',
    summary: '**Max pooling（最大池化）** 把每个 $m\\times m$ 小块换成它的最大值：降低分辨率、减少后面的参数、带来一定的平移不变性；它没有参数，反向传播只把梯度传给那个最大值。CNN 的典型结构：卷积 → pooling → 卷积 → pooling → 全连接 → 输出。堆叠卷积层让 **receptive field（感受野）** 越来越大；**ResNet（残差网络）** 的残差连接让很深的网络能训练。',
    prereq: ['c34', 'c38'],
    symbols: [
      [T`$m\times m$`, T`pooling 窗口大小`],
      [T`$u_{ij}$`, T`pooling 窗口里第 $i$ 行第 $j$ 列的输入值`],
      [T`$v=\max(u_{11},\dots,u_{mm})$`, T`max pooling 的输出`],
      [T`$\partial v/\partial u_{ij}$`, T`sub-gradient：最大值（唯一时）处为 1，其余为 0；并列时只挑一个给 1`],
      [T`$L,\ k$`, T`堆叠的卷积层数、filter 宽度（感受野 $1+L(k-1)$）`],
      [T`C / S / F`, T`LeNet 图中的卷积层 / 下采样（pooling）层 / 全连接层`],
    ],
    goals: [
      '手算 max pooling（和 average pooling）',
      '说出 max pooling 的作用和它的反向传播（sub-gradient）',
      '解释卷积 + pooling 如何带来平移不变性，以及 receptive field 怎么随层数增大',
      '说出 ResNet 残差连接、迁移学习（预训练 + 微调）的思想',
    ],
    types: ['T03', 'T13'],
    notExam: 'L13 p27 的 filter 可视化、p29 的文本 1D CNN 只是展示，了解即可。',
    what: [
      T`**CNN**（L13 p20–p22）：卷积层提取局部特征 → **max pooling** 下采样 → 更多卷积 / pooling → 全连接层合并表示 → 输出层。LeNet-5（p21）用 C 表示卷积、S 表示下采样、F 表示全连接。`,
      T`卷积输出的图往往还很大，直接接全连接层，参数又会爆炸；而且很多时候只关心"这一块区域里**有没有**出现这个图案"，不关心它在哪一格。于是在卷积后面接一步"缩图"：`,
      T`**Max pooling**（L13 p23）：把每个 $m\times m$ 小块换成最大值 $v=\max(u_{11},\dots,u_{mm})$。例：$2\times2$ 窗口 $\begin{bmatrix}1&3\\4&2\end{bmatrix}$ 只留下 $4$。`,
      T`**作用**（L13 p22–p24）：降低分辨率、限制后面参数的爆炸；配合卷积带来**一定程度的** **translation invariance（平移不变性）**：pooling 只保留"窗口里有没有"，丢掉了"在窗口里哪一格"，所以图案在窗口内挪动时输出不变。但这**不是保证**：最大值跨过窗口边界时输出会变（例：1D 宽 2、stride 2 的 pooling，$[0,1,0,0]\to[1,0]$；右移一格成 $[0,0,1,0]\to[0,1]$）。`,
      T`**训练时怎么求导？** max pooling **不是处处可导**：最大值唯一时就是普通导数，几个输入并列最大时有拐点。统一用 **sub-gradient（次梯度）**：最大值唯一时，$\frac{\partial v}{\partial u_{ij}}=1$（$u_{ij}$ 就是那个最大值），其余为 0。若有**并列**最大值（如 $\{7,-1,3,7\}$），挑其中一个（通常是前向时记录的那个）给 1、其余给 0。前向时记下哪个位置最大，反向时只把梯度传给它。（课件 p23 写"$u_{ij}=v$ 时为 1"，并列时会给多个位置都是 1，严格说不是合法的次梯度。）`,
      T`pooling 让图变小，但后面的层还要认出比一个小窗口**更大**的图案（整张脸，而不只是一只眼睛）。一个单元能"看到"原始输入的多大范围，决定了它能认多大的东西：`,
      T`**Receptive field（感受野）**（L13 p26）：一个单元"看到"的输入范围。层层堆叠卷积，感受野越来越大，可以识别越来越大的图案（层次化特征：边 → 形状 → 物体）。`,
      T`感受野变大要靠把卷积层**叠深**，但层一多，反向传播的梯度连乘会消失（c33），训练反而更难。**ResNet（残差网络）**（L13 p28）的办法是 **residual connection（残差连接）**：每一块输出 $F(\bx)+\bx$——输入有一条直通路加回输出，梯度也能沿这条路直接传回去，152 层的网络也能优化。`,
      T`另一件相关但不同的事：目标任务的数据往往太少，不够从头训练这么深的网络。常见做法是先在大数据集上 **pretraining（预训练）**，再在小的目标任务上 **fine-tuning（微调）**——这叫 **transfer learning（迁移学习）**。`,
    ],
    why: [
      T`T3 计数题里 pooling 层**参数为 0**，但会改变后面层的尺寸，所以要会算。概念题会问 pooling 的作用、平移不变性、残差连接。`,
    ],
    intuition: [
      T`**Max pooling = "这片区域里有没有出现过这个图案"。** 卷积输出大 = 图案出现。取最大值只关心"有没有"，不关心"精确在哪一格"——所以图案在窗口内稍微挪一点，结果不变（跨出窗口就可能变）。`,
      T`**为什么残差连接有用？** 输出 $=F(\bx)+\bx$。即使 $F$ 学得不好，至少能把输入原样传下去；反向传播时梯度也能沿着"直通"的路径传到前面的层，不会在很多层的连乘中消失。`,
      { t: 'think', q: '两层 $3\\times3$ 卷积（stride 1）叠起来，第二层的一个单元能看到输入多大的范围？', a: T`$5\times5$。第二层的一个单元看第一层的 $3\times3$ 块（中心往每边 1 格）；这块边上的第一层单元又各自看输入的 $3\times3$（再往外 1 格）。所以从中心往每边一共扩 $1+1=2$ 格，宽度 $=1+2\times2=5$。每加一层 $k\times k$ 卷积，两边各多扩 $(k-1)/2$ 格，宽度多 $k-1$：$L$ 层的感受野是 $1+L(k-1)$。` },
      { t: 'story', title: 'ResNet', md: '何恺明等人 2015 年提出 ResNet（2016 年 CVPR 最佳论文）。在此之前，网络加深到二三十层后训练误差反而上升；加上残差连接，152 层的网络在 ImageNet 上拿了冠军。' },
    ],
    math: [
      { t: 'h3', text: '输出尺寸' },
      T`$m\times m$、stride $m$、无 padding 的 pooling：输出宽 $=\lfloor(n-m)/m\rfloor+1=\lfloor n/m\rfloor$，$m$ 整除 $n$ 时就是 $n/m$。例：$2\times2$ pooling 把 $28\times28\times6$ 变成 $14\times14\times6$（通道数不变，参数 0）；宽 5 则变成 $\lfloor5/2\rfloor=2$。`,
      { t: 'h3', text: '感受野（L13 p26）' },
      T`$L$ 层宽 $k$、stride 1 的卷积叠起来，最上层一个单元的感受野宽度 $=1+L(k-1)$（推导见上面的思考题）。例：3 层 $3\times3$ ⇒ $1+3\times2=7$。`,
      { t: 'h3', text: '平移不变性的来源（L13 p24–p25）' },
      { t: 'ul', items: [
        T`卷积：同一个 filter 到处用 ⇒ 图案平移，特征图**跟着平移同样的距离**。这叫 **equivariance（等变）**：输出随输入一起变。`,
        T`Max pooling：只保留窗口最大值、丢掉它在窗口内的位置 ⇒ 图案在窗口内挪动时输出**不变**。这叫 **invariance（不变）**：输出不随输入变。但跨窗口的移动仍会改变输出，所以只是"一定程度"的不变。`,
        T`L13 p25：卷积本身也是一种正则化——对应的局部配置共享权重，而全连接层每个位置都有独立权重。`,
      ] },
    ],
    fx: [
      {
        title: 'Max pooling 及其次梯度', tex: T`v=\htmlClass{fx-p1}{\max}(u_{11},\dots,u_{mm}),\qquad\frac{\partial v}{\partial u_{ij}}=\htmlClass{fx-p2}{\begin{cases}1,&u_{ij}=v\\0,&\text{otherwise}\end{cases}}`,
        parts: [
          { label: 'max', note: '每个窗口一个输出；没有可学参数。' },
          { label: 'sub-gradient', note: '梯度只流向最大的那个输入；前向时要记录它的位置（L13 p23）。如果窗口里有两个一样大（如 $\\{7,-1,3,7\\}$），不能两个都给 1：只给前向时记下的那一个 1，其余给 0。' },
        ],
      },
    ],
    example: [
      { t: 'h3', text: 'Pooling 手算' },
      T`$4\times4$ 输入 $\begin{bmatrix}1&3&2&0\\4&2&1&5\\0&1&3&2\\2&6&1&1\end{bmatrix}$，$2\times2$ 窗口、stride 2：`,
      { t: 'table', cls: 'compact', head: ['窗口', 'max', 'average'], rows: [['左上 $\\{1,3,4,2\\}$', '4', '2.5'], ['右上 $\\{2,0,1,5\\}$', '5', '2'], ['左下 $\\{0,1,2,6\\}$', '6', '2.25'], ['右下 $\\{3,2,1,1\\}$', '3', '1.75']] },
      T`Workshop 8 slide p6 的例子：$\begin{bmatrix}3&2&0&0\\0&7&1&3\\5&2&3&0\\0&9&2&3\end{bmatrix}$，$2\times2$、stride 2 ⇒ max $\begin{bmatrix}7&3\\9&3\end{bmatrix}$，average $\begin{bmatrix}3&1\\4&2\end{bmatrix}$（slide 只画出第一格 7 和 3）。slide 的说法：max 保留最强的特征，average 起平滑作用，选哪个要看数据和网络。`,
      { t: 'fade', title: '分步练习：pooling 与感受野', plan: ['划分窗口（stride = 窗口大小）', '每个窗口取 max（或平均）', '记录最大值位置（反向传播用）', T`感受野 $1+L(k-1)$`], items: [
        { md: '上面的 4×4 例子。', steps: [
          { md: '4 个 2×2 窗口', sg: 1 }, { md: T`$\begin{bmatrix}4&5\\6&3\end{bmatrix}$`, sg: 2 }, { md: '如左上的 4 在第 2 行第 1 列；反向时只有它收到梯度', sg: 3 },
        ] },
        { md: T`窗口 $\{7,-1,3,7\}$（有并列最大值）。`, steps: [
          { ask: 'max pooling 输出 = ?', answer: 7, show: '7（并列不影响输出；反向时只挑其中一个 7 给梯度 1）', sg: 2 },
          { ask: 'average pooling 输出 = ?', answer: 4, show: '$16/4=4$', sg: 2 },
        ] },
        { md: T`感受野：$L$ 层 $3\times3$ 卷积（stride 1）。`, steps: [
          { ask: '2 层的感受野宽度 = ?', answer: 5, show: '$1+2\\times2=5$', sg: 4 },
          { ask: '3 层的感受野宽度 = ?', answer: 7, show: '$1+3\\times2=7$', sg: 4 },
        ] },
      ] },
    ],
    viz: [
      { id: 'pooling', how: '$4\\times4$ 输入，$2\\times2$ 窗口、stride 2。切换 max / average，max 时高亮"赢"的那一格。',
        try: '① 把某个窗口里**非最大值**的数稍微改大或改小（不超过原最大值）：max pooling 输出不变——这就是 sub-gradient 只传给最大值的原因。② 把它改得比原最大值还大（如左上的 1 改成 8）：它成了新的 winner，输出从 4 变成 8。③ 切到 average：任何一个数改动都会影响输出，梯度平均分给 4 个数（各 1/4）。' },
    ],
    compare: [
      { t: 'table', head: ['', '卷积层', 'Max pooling 层', '全连接层'], rows: [
        ['参数', '$C_{out}C_{in}K^2(+C_{out})$', '0', '$n_{in}n_{out}(+n_{out})$'],
        ['作用', '检测局部图案', '下采样、不变性', '合并特征、分类'],
        ['可导', '是', '用 sub-gradient', '是'],
      ] },
      { t: 'exam', md: T`**Role of max pooling:** It replaces each $m\times m$ patch of a feature map with its maximum, reducing resolution and the number of parameters in later layers, and (together with weight-shared, translation-equivariant convolution) provides some robustness to small translations by discarding the precise location of the maximum within each window. It has no parameters; since max is not differentiable everywhere, backpropagation uses a sub-gradient, passing the gradient only to the input that attained the maximum (one chosen input if there is a tie).` },
      { t: 'exam', md: T`**Residual connections (ResNet):** A residual block outputs $\mathbf y=F(\mathbf x)+\mathbf x$, adding its input back to the learned transformation. The identity path lets the block default to (near) identity, and lets signals and gradients pass directly through many layers, which eases the vanishing-gradient and optimisation problems of very deep networks (L13 p28: 152-layer networks become trainable).` },
    ],
    pitfalls: [
      ['Pooling 层有参数', 'Max / average pooling 没有可学参数。'],
      ['Pooling 改变通道数', '只改变宽高，通道数不变。'],
      ['比窗口小的平移一定不改变 pooling 输出', '不一定：最大值跨过窗口边界时输出会变。pooling 只给"一定程度"的不变性（L13 p24）。'],
      ['卷积层本身是平移不变的', '卷积是平移**等变**：图案平移，特征图跟着平移；"不变"要靠 pooling，而且只是近似。'],
      ['反向传播时 max pooling 把梯度平均分给窗口里每个元素', '只给最大的那个（那是 average pooling 的做法）。'],
    ],
    quiz: [
      { type: 'num', q: '$24\\times24\\times16$ 经过 $2\\times2$、stride 2 的 max pooling，输出元素总数？', answer: 2304, explain: T`max pooling（最大池化）把每个 $2\times2$ 小块换成一个最大值；stride 2 表示小块互不重叠，所以宽、高各除以 2：$24/2=12$。pooling 在每个通道上单独做，**通道数不变**，仍是 16。输出是 $12\times12\times16$：$12\times12=144$，$144\times16=2304$ 个元素。常见错误是把通道数也除以 2，或只算 144 忘了乘通道数。` },
      { type: 'num', q: 'Pooling 层参数个数？', answer: 0, explain: T`pooling（池化）层只做固定的运算：max pooling 取窗口最大值，average pooling 取窗口平均值。这里面没有任何要靠训练调整的权重或 bias，所以**可学参数个数为 0**。它会把宽高变小，从而间接减少后面全连接层的参数，但它自己一个参数也没有。` },
      { type: 'mc', q: 'ResNet 残差连接主要解决：', options: ['参数太多', '很深的网络难以优化（梯度消失）', '平移不变性', '过拟合'], answer: 1, explain: T`residual connection（残差连接）让每一块输出 $F(\bx)+\bx$：输入沿一条直通路加回输出。反向传播时梯度也能沿这条路直接传回前面的层，不会在几十上百层的连乘里消失，所以**很深的网络（课件里 152 层）也能优化**。"过拟合"不对：不加残差时，深网络连训练误差都降不下来，这是优化问题而不是过拟合；"参数太多"也不对，残差连接并不减少参数。L13 p28。` },
      { type: 'show', q: '（英文）What is transfer learning (pretraining + fine-tuning)?', answer: T`Train a network on a large source dataset (e.g. ImageNet) so that it learns general, reusable features, then reuse those weights for a related target task with less data: replace or add the output layer and continue training (fine-tune) on the target data, often with a small learning rate. This exploits representations learned from abundant data.`, qzh: '什么是迁移学习（transfer learning），即预训练（pretraining）加微调（fine-tuning）？', azh: '先在一个大型源数据集（如 ImageNet）上训练网络，让它学到通用、可复用的特征；然后把这些权重用到一个数据较少的相关目标任务上：替换或新增输出层，在目标数据上继续训练（微调，fine-tune），通常使用较小的学习率。这样就利用了从大量数据中学到的表示（representation）。' },
    ],
  });

  /* =====================================================================
   * c40 · RNN、BPTT、LSTM（L14 p2–p15）
   * ===================================================================== */
  add({
    id: 'c40', week: 'W7', lec: 'L14', pages: 'L14 p2–p15', star: 2,
    keyEn: [
      T`An RNN reads a sequence step by step with the same parameters at every step, $\mathbf h^{(t)}=\tanh(\mathbf b+W\mathbf h^{(t-1)}+U\bx^{(t)})$; uses: sequence classification, sequence tagging, encoder–decoder.`,
      T`Unrolled over time it is a deep network with one layer per time step (depth = sequence length) and shared weights; it is trained by backpropagation through time (BPTT).`,
      T`Repeated multiplication by $W$ causes vanishing or exploding gradients: for a linear RNN $\partial\mathbf h^{(T)}/\partial\mathbf h^{(1)}=W^{T-1}$, vanishing if the spectral radius $\rho(W)<1$, exploding if $\rho(W)>1$.`,
      T`An LSTM passes its state through an additive copy self-loop scaled by a sigmoid forget gate (plus input and output gates), keeping gradients over 100+ steps instead of about 5–10.`,
    ],
    keyZh: [
      T`循环神经网络（RNN）逐个读入序列，每步用同一组参数，由上一步的隐藏状态和当前输入算出新的隐藏状态。三种用法：序列分类、序列标注、编码器–解码器。`,
      T`把循环沿时间展开，每个时间步是一层，深度 = 序列长度，各层共享权重（2021 Q1：在什么意义上"深"）；训练用随时间反向传播（BPTT）。`,
      T`反传时同一个 $W$ 被连乘很多次：线性 RNN 的梯度正好是 $W$ 的 $T-1$ 次方。谱半径（$W$ 特征值绝对值的最大者）小于 1 则梯度消失，大于 1 则爆炸。`,
      T`LSTM：旧状态乘 sigmoid 遗忘门（forget gate）后直接加到新状态上，靠加法而不是反复乘 $W$ 往下传，另有输入门、输出门；能保持 100+ 步的梯度，普通 RNN 只有约 5–10 步。`,
    ],
    examQ: [
      { src: '2021 Q1', q: T`A recurrent neural network is a type of deep artificial neural network. In what respect is it deep?`,
        a: T`It is deep in time: unrolled over the input sequence, the hidden state passes through one transformation per time step, so the unrolled network's depth equals the sequence length, with the same weights shared across all steps. Gradients must be backpropagated through all steps (BPTT), causing vanishing/exploding gradients.`,
        qzh: T`循环神经网络（recurrent neural network）是一种深度人工神经网络（deep artificial neural network）。它在什么意义上是“深”的？`,
        azh: T`它在时间上是深的（deep in time）：沿输入序列展开（unrolled）后，隐藏状态（hidden state）每个时间步都要经过一次变换，所以展开后网络的深度等于序列长度，并且所有时间步共享同一组权重。梯度必须反向传播穿过所有时间步（随时间反向传播 BPTT），由此导致梯度消失/爆炸（vanishing/exploding gradients）。` },
      { src: '2022 S1 Q1(b)', q: T`Both convolutional networks (CNNs) and recurrent networks (RNNs) can be applied to sequence inputs. Explain the key benefit that RNNs have over CNNs for this type of input.`,
        a: T`A CNN on a sequence (time delay neural network) has a fixed, finite receptive field set by the filter width and the number of layers, so dependencies longer than that window are missed. An RNN's hidden state $\mathbf h^{(t)}=f(\mathbf h^{(t-1)},\bx^{(t)})$ encodes all inputs up to $t$, so it can capture dependencies of any range, and its shared weights unroll to any sequence length.`,
        qzh: T`卷积网络（CNN）和循环网络（RNN）都可以用于序列输入。说明对这类输入，RNN 相对 CNN 的关键优势。`,
        azh: T`把 CNN 用在序列上（课件叫时延神经网络 time delay neural network），感受野（receptive field）固定且有限，大小由 filter 宽度和层数决定，超出这个窗口的长距离依赖就抓不到。RNN 的隐藏状态 $\mathbf h^{(t)}=f(\mathbf h^{(t-1)},\bx^{(t)})$ 编码了到 $t$ 为止的全部输入，所以能捕捉任意距离的依赖；而且共享的权重可以展开到任意序列长度。` },
    ],
    title: 'RNN、BPTT、LSTM', en: 'Recurrent neural networks, backpropagation through time, LSTM',
    summary: '序列（句子、音频、股价）长度不固定。**RNN（循环神经网络）** 从左到右逐个读入，每步用**同一组参数**更新隐藏状态 $\\mathbf h^{(t)}=\\tanh(\\mathbf b+W\\mathbf h^{(t-1)}+U\\bx^{(t)})$。展开后是一个深度 = 序列长度的网络（2021 Q1："RNN 在什么意义上是深的？"）。训练用 **BPTT**；长序列会梯度消失 / 爆炸，**LSTM** 用门控的"复制"路径缓解。',
    prereq: ['c34', 'c36'],
    symbols: [
      [T`$\bx^{(t)}$, $\mathbf h^{(t)}$`, T`第 $t$ 步的输入、隐藏状态（上标是时间，不是幂）`],
      [T`$U,\ W,\ V$`, T`输入→隐藏、隐藏→隐藏（循环）、隐藏→输出 的权重矩阵`],
      [T`$\mathbf b,\ \mathbf d$`, T`隐藏层、输出层的 bias（课件把输出 bias 写作 $\mathbf c$；这里改名 $\mathbf d$，因为下一章 $\mathbf c$ 是上下文向量）`],
      [T`$\mathbf a^{(t)},\ \mathbf o^{(t)},\ \hat{\by}^{(t)}$`, T`第 $t$ 步：激活前的加权和、输出层得分、softmax 后的预测概率`],
      [T`$\tanh$`, T`双曲正切：值域 $(-1,1)$，导数 $1-\tanh^2\le1$。常用值：$\tanh1\approx0.762$，$\tanh0.381\approx0.363$，$\tanh2\approx0.964$`],
      [T`$D,\ H,\ K$`, T`输入维数、隐藏维数、输出维数`],
      [T`$\tau$, $T$`, T`序列长度`],
      [T`$W^{T-1}$`, T`矩阵 $W$ 连乘 $T-1$ 次（只有**线性** RNN 的梯度恰好等于它）`],
      [T`$\rho(W)$`, T`谱半径：$W$ 所有特征值的**绝对值**里最大的那个`],
      [T`$\odot$`, T`逐元素相乘：两个向量对应位置相乘`],
      [T`$\mathbf c$（encoder–decoder）`, T`上下文向量：编码器对整个输入的总结（c41 细讲）`],
      [T`softmax`, T`把一组得分变成概率：$\frac{e^{o_k}}{\sum_je^{o_j}}$`],
    ],
    goals: [
      '说出全连接网络 / CNN 处理序列的问题（L14 p4–p6）',
      '写出 RNN 的参数化公式（L14 p12），手算两步隐藏状态',
      '解释"展开（unfold）"、参数共享，以及 RNN 为什么"深"（2021 Q1）',
      '说出三种应用结构：sequence classification、tagging、encoder–decoder',
      '解释 BPTT、梯度消失 / 爆炸（线性 RNN：$\\partial\\mathbf h^{(T)}/\\partial\\mathbf h^{(1)}=W^{T-1}$），以及 LSTM 怎么缓解',
    ],
    types: ['T13'],
    what: [
      T`**序列输入的问题**（L14 p4–p6）：全连接网络要固定长度（只能补"空词"），同一短语出现在不同位置要重学；1D CNN（L14 称为 **time delay neural network（时延神经网络）**）用 1D filter 沿时间共享参数，但感受野有限：单层只看 filter 宽度那么远；堆叠能扩大，但固定结构的感受野总是有限的（$L$ 层宽 $k$ 时为 $1+L(k-1)$，c39）。`,
      T`**RNN**（L14 p7）：根据输入序列动态构建的网络。从左到右处理 $\bx^{(1)},\bx^{(2)},\dots$，每步 $\mathbf h^{(t)}=f(\mathbf h^{(t-1)},\bx^{(t)})$；$\mathbf h^{(t)}$ 编码了到 $t$ 为止的全部输入。**展开（unfold）** 后是一条链，**深度 = 序列长度**，各层**共享参数**（L14 p8）。`,
      T`**先把向量收成一个数，走两步。** 设 $h^{(0)}=0$，$h^{(t)}=\tanh(w\,h^{(t-1)}+u\,x^{(t)})$，$w=0.5$，$u=1$，输入序列 $(1,\ 0)$。第 1 步：$h^{(1)}=\tanh(0.5\times0+1\times1)=\tanh(1)\approx0.76$；第 2 步**用同一组** $w,u$：$h^{(2)}=\tanh(0.5\times0.76+0)\approx0.36$——输入已经是 0 了，$h$ 里还"记得"第一步的 1。下面只是把 $wh+ux$ 写成矩阵，并加上 bias 和输出层：`,
      T`**参数化**（L14 p12，tagging RNN）：`,
      { t: 'math', tex: T`\mathbf a^{(t)}=\mathbf b+W\mathbf h^{(t-1)}+U\bx^{(t)},\quad\mathbf h^{(t)}=\tanh(\mathbf a^{(t)}),\quad\mathbf o^{(t)}=\mathbf d+V\mathbf h^{(t)},\quad\hat{\by}^{(t)}=\mathrm{softmax}(\mathbf o^{(t)})` },
      T`$\mathbf b,W,U,\mathbf d,V$ 与 $t$ 无关，所有位置共享——所以能处理任意长度。`,
      T`**三种用法**（L14 p9–p11）：`,
      { t: 'ul', items: [
        T`**Sequence classification（序列分类）**：只用最后一个隐藏状态 $\mathbf h^{(\tau)}$ 接分类器（如影评情感）。`,
        T`**Sequence tagging（序列标注）**：每个位置都输出一个标签、各有一个 loss（如词性标注）。`,
        T`**Encoder–decoder（编码器–解码器）**：编码器读完输入得到 **context vector（上下文向量）** $\mathbf c$，解码器据此逐个生成输出（如英译法，输入输出长度可不同）。`,
      ] },
      T`**BPTT（backpropagation through time，随时间反向传播）**（L14 p13）：对展开后的网络做反向传播，每个位置的 loss 的梯度都一路传回序列开头。`,
      T`BPTT 要把梯度从最后一步一路传回第一步，**同一组权重被连乘很多次**。先用一个数看后果：每步乘 $0.5$，传到 10 步之前只剩 $0.5^{10}\approx0.001$（消失）；每步乘 $1.5$，变成 $1.5^{10}\approx58$（爆炸）。下面的矩阵式是同一件事：`,
      T`**vanishing / exploding gradient（梯度消失 / 爆炸）**（L14 p13）：先看最简单的**线性 RNN**（去掉 tanh：$\mathbf h^{(t)}=W\mathbf h^{(t-1)}+U\bx^{(t)}$）。每一步对上一步的导数都是 $W$，链式法则连乘 $T-1$ 次：`,
      { t: 'math', tex: T`\frac{\partial\mathbf h^{(T)}}{\partial\mathbf h^{(1)}}=W^{T-1}\qquad(\text{只对线性 RNN；这是一个矩阵，叫 Jacobian})` },
      T`看 $W$ 的特征值的**绝对值**：最大的 $|\lambda|$（谱半径 $\rho(W)$）$<1$ ⇒ $W^{T-1}\to0$，梯度**消失**；$>1$ ⇒ 沿那个方向越乘越大，梯度**爆炸**。（标量例：$W=-2$ 虽然"$<1$"，但 $|-2|>1$，$(-2)^{10}=1024$ 照样爆炸。）带 tanh 的 RNN 每步还要乘 tanh 的导数（$\le1$）：$\frac{\partial\mathbf h^{(T)}}{\partial\mathbf h^{(1)}}=J_TJ_{T-1}\cdots J_2$，其中 $J_t=\mathrm{diag}\big(1-(\mathbf h^{(t)})^2\big)W$，通常衰减得更快。课件说普通 RNN 实际只能学到约 5–10 步的依赖（经验数字，不是定理）。`,
      T`消失的根源是"每步都**乘**一个常常小于 1 的数"。LSTM 的思路：让状态主要靠**加法**往下传——新状态 ≈ 遗忘门 × 旧状态 + 输入门放进来的新内容。遗忘门接近 1 时，旧状态几乎原样加过去，梯度也几乎原样传回来（和 c39 ResNet 的直通路是同一个主意）。`,
      T`**LSTM（long short-term memory）**（L14 p14）：引入一条基于"复制"的状态自环：上一步的状态被 sigmoid **forget gate（遗忘门）** 缩放后直接加到新状态上，梯度大小得以保持；另有 **input gate（输入门）**、**output gate（输出门）**。课件称能处理 100+ 步的依赖（普通 RNN 约 5–10 步；都是经验数字）。`,
    ],
    why: [
      T`往年 2021 Q1 原题："A recurrent neural network is a type of deep artificial neural network. In what respect is it deep?"。另外 RNN 的梯度消失是 c34–c36 讲过的问题在时间方向上的版本，LSTM 是简答高频。`,
    ],
    intuition: [
      T`**RNN = 一个带记忆的单元反复使用。** 读一个词，更新一次"记忆"$\mathbf h$；下一个词再用同一套规则更新。读完整句，$\mathbf h$ 就是对整句的总结。`,
      T`**为什么会梯度消失？** 反向传播穿过 $T$ 步，每步都乘一次 $W$（以及 $\tanh$ 的导数，$\le1$）。标量情形（$W$ 就是一个数）$0.5^{10}\approx0.001$，$1.5^{10}\approx58$——很快消失或爆炸。`,
      T`**LSTM 的关键是"加法"而不是"乘法"**：状态更新是 $\text{新状态}=\text{遗忘门}\odot\text{旧状态}+\text{输入门}\odot\text{新内容}$（$\odot$ = 逐元素相乘）。遗忘门接近 1 时，旧状态几乎原样传下去，梯度也几乎原样传回去（和 ResNet 的残差连接是同一个思想）。`,
      { t: 'think', q: '（2021 Q1）RNN 在什么意义上是"深"的？', a: '把循环展开后，每个时间步是一层，深度等于序列长度；梯度要穿过这么多层反传（BPTT）。和普通深网络不同的是：这些"层"共享同一组参数。' },
      { t: 'story', title: 'LSTM', md: 'LSTM 由 Sepp Hochreiter 和 Jürgen Schmidhuber 在 1997 年提出；Hochreiter 1991 年的硕士论文最早系统分析了 RNN 的梯度消失问题。2010 年代 LSTM 被广泛用于语音识别和机器翻译，直到 Transformer 出现。' },
    ],
    math: [
      { t: 'h3', text: '参数个数' },
      T`输入维 $D$、隐藏维 $H$、输出维 $K$：$U$ 有 $H\times D$，$W$ 有 $H\times H$，$\mathbf b$ 有 $H$，$V$ 有 $K\times H$，$\mathbf d$ 有 $K$（$\mathbf d$ = 课件写的输出 bias $\mathbf c$）。例：$D=3,H=4,K=2$：$12+16+4+8+2=42$——**与序列长度无关**。`,
      { t: 'h3', text: '三种结构对比（L14 p9–p11）' },
      { t: 'table', cls: 'compact', head: ['结构', '输出', 'loss', '例子'], rows: [
        ['Sequence classification', '只在最后一步', '一个', '情感分析'],
        ['Sequence tagging', '每一步', '每步一个', '词性标注'],
        ['Encoder–decoder', '解码器逐步生成', '每个输出一个', '机器翻译'],
      ] },
    ],
    fx: [
      {
        title: 'RNN 一步', tex: T`\mathbf h^{(t)}=\tanh\big(\htmlClass{fx-p1}{\mathbf b}+\htmlClass{fx-p2}{W\mathbf h^{(t-1)}}+\htmlClass{fx-p3}{U\bx^{(t)}}\big)`,
        parts: [
          { label: 'b', note: 'bias，所有时间步共享。' },
          { label: 'W h', note: '来自上一步的"记忆"。$W$ 在每一步都相同——反传时被连乘，导致梯度消失 / 爆炸。' },
          { label: 'U x', note: '当前输入的贡献。' },
        ],
      },
    ],
    example: [
      { t: 'fade', title: '分步练习：RNN 前向（标量）', plan: [T`$a^{(t)}=b+wh^{(t-1)}+ux^{(t)}$`, T`$h^{(t)}=\tanh(a^{(t)})$`, T`$o^{(t)}=d+vh^{(t)}$`], items: [
        { md: T`$w=0.5$，$u=1$，$b=0$，$v=2$，$d=0$，$h^{(0)}=0$，输入 $x=(1,0)$。第 1 步：`, steps: [
          { md: '$a^{(1)}=1$' }, { md: T`$h^{(1)}=\tanh1\approx0.7616$` }, { md: '$o^{(1)}\\approx1.5232$' },
        ] },
        { md: T`接上，第 2 步（$x^{(2)}=0$）。查表：$\tanh0.3808\approx0.3634$（考试不带计算器，这类值会给出）。`, steps: [
          { ask: T`$a^{(2)}=?$`, answer: 0.3808, tol: 0.002, show: T`$0+0.5\times0.7616+1\times0=0.3808$` },
          { ask: T`$h^{(2)}=?$`, answer: 0.3634, tol: 0.002, show: T`查表：$\tanh0.3808\approx0.3634$` },
          { ask: T`$o^{(2)}=?$`, answer: 0.7268, tol: 0.002, show: '$2\\times0.3634$' },
        ] },
        { md: T`$w=-1$，$u=2$，$b=0$，$h^{(0)}=0$，输入 $x=(1,1)$（$\tanh2\approx0.9640$，$\tanh1.036\approx0.7763$）。`, steps: [
          { ask: T`$h^{(1)}=?$`, answer: 0.964, tol: 0.002, show: T`$a^{(1)}=2\times1=2$，$h^{(1)}=\tanh2\approx0.964$`, sg: 2 },
          { ask: T`$a^{(2)}=?$`, answer: 1.036, tol: 0.002, show: T`$-1\times0.964+2\times1=1.036$`, sg: 1 },
          { ask: T`$h^{(2)}=?$`, answer: 0.7763, tol: 0.002, show: T`$\tanh(1.036)\approx0.7763$`, sg: 2 },
        ] },
      ] },
    ],
    viz: [
      { id: 'rnn-unroll', how: '标量 RNN $h_t=\\tanh(wh_{t-1}+ux_t)$ 展开成一条链，每个格子显示 $h_t$。下方的图是 $|\\partial h_T/\\partial h_k|$ 随 $k$ 的变化（对数刻度）：梯度从最后一步传回第 $k$ 步还剩多少。',
        try: '① $w=0.5$：越往前梯度越小（消失）。② $w$ 调到接近 1 或更大：梯度不再快速衰减，但 $\\tanh$ 饱和也会让它变小。③ 想象 LSTM 的遗忘门接近 1：相当于给梯度开了一条不衰减的通道。' },
    ],
    compare: [
      { t: 'table', head: ['', '全连接', 'CNN（1D）', 'RNN'], rows: [
        ['变长输入', '不行（要补齐）', '可以', '可以'],
        ['参数共享', '无', '沿位置共享', '沿时间共享'],
        ['看多远', '全部（但位置固定）', '单层受 filter 宽度限制；堆叠可扩大，但总是有限', '理论上全部（实际受梯度消失限制）'],
      ] },
      { t: 'exam', md: T`**(2021 Q1) In what respect is an RNN deep?** When unrolled over the input sequence, an RNN becomes a feed-forward network with one layer per time step, so its depth equals the sequence length and gradients must be backpropagated through all these steps (BPTT). Unlike a standard deep network, the same parameters ($W$, $U$, $V$, biases) are shared across all layers/time steps.` },
    ],
    pitfalls: [
      ['RNN 每个时间步有自己的参数', '所有时间步共享同一组参数（L14 p12）。'],
      ['RNN 的参数个数随序列长度增长', '与长度无关。'],
      ['LSTM 完全消除了梯度消失', '大大缓解（100+ 步），不是彻底消除。'],
      ['$\\mathbf h^{(t)}$ 的上标是幂', '上标 $(t)$ 表示时间步。'],
      ['$\\partial\\mathbf h^{(T)}/\\partial\\mathbf h^{(1)}=W^{T-1}$ 对所有 RNN 成立；最大特征值 $<1$ 就消失', '只对线性 RNN 成立（带 tanh 还要乘 $\\mathrm{diag}(1-h^2)$）；看的是特征值的**绝对值**，$W=-2$ 也会爆炸。'],
    ],
    quiz: [
      { type: 'num', q: '线性标量 RNN，$w=0.8$，$T=11$。$\\partial h^{(T)}/\\partial h^{(1)}=0.8^{?}$，指数是多少？', answer: 10, explain: T`线性 RNN 每一步是 $h^{(t)}=w\,h^{(t-1)}+u\,x^{(t)}$，所以 $h^{(t)}$ 对上一步 $h^{(t-1)}$ 的导数就是 $w$。从 $h^{(1)}$ 到 $h^{(11)}$ 要经过 1→2、2→3、…、10→11 共 $T-1=10$ 步，链式法则把 10 个 $w$ 连乘：$\partial h^{(11)}/\partial h^{(1)}=0.8^{10}\approx0.107$。易错点是答 11：**步数是 $T-1$**，起点 $h^{(1)}$ 本身不算一步。$0.8<1$，步数越多梯度越小，这就是 vanishing gradient（梯度消失）。` },
      { type: 'num', q: 'RNN：$D=2$，$H=3$，$K=1$（含两个 bias）。参数总数？', answer: 22, explain: T`RNN 的参数分五块，每块的大小由"从几维连到几维"决定。输入→隐藏的 $U$：$H\times D=3\times2=6$；隐藏→隐藏的循环矩阵 $W$：$H\times H=3\times3=9$；隐藏层 bias $\mathbf b$：$H=3$；隐藏→输出的 $V$：$K\times H=1\times3=3$；输出 bias $\mathbf d$：$K=1$。合计 $6+9+3+3+1=22$。**所有时间步共享这一组参数**，所以总数与序列长度无关；最容易漏的是循环矩阵 $W$。` },
      { type: 'mc', q: '情感分析（一句话 → 正/负）用哪种结构？', options: ['sequence classification', 'sequence tagging', 'encoder–decoder', '都不行'], answer: 0, explain: T`情感分析是整句话只要一个标签（正或负）。sequence classification（序列分类）正是这样：RNN 从头读到尾，**只把最后一个隐藏状态 $\mathbf h^{(\tau)}$ 送进分类器**，只有一个 loss。sequence tagging（序列标注）要给每个词各输出一个标签（如词性标注），这里不需要；encoder–decoder（编码器–解码器）用于输出也是一串、长度可变的任务（如翻译）。L14 p9。` },
      { type: 'mc', q: 'LSTM 缓解梯度消失靠的是：', options: ['ReLU 激活', '由遗忘门缩放的状态"复制"自环', '更大的学习率', 'dropout'], answer: 1, explain: T`普通 RNN 每步把上一步状态乘权重矩阵再过 tanh，反传时梯度被一步步连乘，越来越小。LSTM（long short-term memory，长短期记忆网络）加了一条状态自环：把上一步的状态**复制**过来，只乘一个 sigmoid forget gate（遗忘门）的值，再加上新内容。遗忘门接近 1 时状态几乎原样传下去，梯度也几乎原样传回，所以能处理 100+ 步的依赖（普通 RNN 约 5–10 步）。"ReLU 激活"是前馈网络缓解梯度消失的办法，不是 LSTM 的机制。L14 p14。` },
    ],
  });

  /* =====================================================================
   * c41 · Attention 与 Transformer（L14 p16–p22）
   * ===================================================================== */
  add({
    id: 'c41', week: 'W7', lec: 'L14', pages: 'L14 p16–p22', star: 2,
    keyEn: [
      T`Attention: scores $e_j$, softmax weights $\alpha_j=\frac{\exp(e_j)}{\sum_{j'}\exp(e_{j'})}$, context $\mathbf c=\sum_j\alpha_j\mathbf h^{(j)}$: a weighted average of all hidden states.`,
      T`In seq2seq each decoder step $i$ has its own context $\mathbf c_i$ with scores $e_{ij}=f(\mathbf s^{(i-1)},\mathbf h^{(j)})$; this removes the single fixed-size context bottleneck and gives interpretable alignments.`,
      T`Self-attention: item $i$ is used as the query against the other items $j\ne i$ (the lecture's wording; standard Transformers also include $i$ itself) via their keys, and its new representation is the attention-weighted sum of their values.`,
      T`Transformer: self-attention instead of recurrence, plus residual connections and layer normalisation, feed-forward layers, multiple heads and positional encoding (attention ignores order); positions are computed in parallel during training.`,
      T`Training uses teacher forcing: the decoder input is the target shifted right, [START, $y_1,\dots,y_{T-1}$], and all next tokens $[y_1,\dots,y_T{=}\text{EOS}]$ are predicted in parallel; a causal mask sets scores of future positions to $-\infty$ (weight 0 after softmax) and a padding mask hides <pad> tokens. At inference there is no target: greedy decoding appends the argmax token one step at a time until EOS.`,
    ],
    keyZh: [
      T`注意力（attention）三步：给每个位置打分 $e_j$；softmax 把分数变成非负、和为 1 的权重；把所有隐藏状态按权重加权平均，得到上下文向量（context vector）$\mathbf c$。`,
      T`翻译（seq2seq）时，解码器每一步都用上一步的状态重新给编码器各位置打分，得到这一步专属的上下文 $\mathbf c_i$；不再把整句塞进一个固定向量，权重热图还能看出词对齐。`,
      T`自注意力（self-attention）：第 $i$ 个元素用自己的 query 去和其他元素的 key 打分，再按权重加总它们的 value，作为自己的新表示。课件写 $j\ne i$，标准 Transformer 也包括它自己。`,
      T`Transformer 用自注意力代替循环，再加残差 + 层归一化、逐位置的前馈网络、多头注意力，以及位置编码（attention 本身不知道词序）；训练时所有位置并行计算。`,
      T`训练用教师强制（teacher forcing）：解码器输入是正确答案右移一位，所有位置并行预测下一个词；因果掩码把未来位置得分设为 $-\infty$（权重变 0），填充掩码挡住 <pad>。生成时没有答案，只能贪心解码：逐词取概率最大的接上，直到 EOS。`,
    ],
    examQ: [
      { src: '2022 S1 Q1(c)', q: T`Explain in words how Attention can be used to allow for neural models to process dynamic sized inputs.`,
        a: T`Attention scores each input element (e.g. each hidden state $\mathbf h^{(j)}$) with one shared scoring function, softmaxes the scores over however many elements there are, and outputs the weighted average $\mathbf c=\sum_j\alpha_j\mathbf h^{(j)}$. The parameters do not depend on the input length and $\mathbf c$ has a fixed size, so an input of any length becomes a fixed-size summary for the later layers.`,
        qzh: T`用文字说明：注意力（attention）怎样让神经网络模型处理大小可变（dynamic sized）的输入。`,
        azh: T`注意力用同一个打分函数给每个输入元素（例如每个隐藏状态 $\mathbf h^{(j)}$）打分，有多少个元素就在多少个元素上做 softmax，输出加权平均 $\mathbf c=\sum_j\alpha_j\mathbf h^{(j)}$。参数个数和输入长度无关，$\mathbf c$ 的大小也固定，所以任意长度的输入都被压成一个固定大小的总结，交给后面的层。（attention 的定义另见 [T13](#/T13) 的卡片。）` },
    ],
    title: 'Attention 与 Transformer', en: 'Attention, self-attention, the Transformer',
    summary: '**Attention（注意力）**：不只用最后一个隐藏状态，而是对所有隐藏状态做**加权平均**，权重 $\\alpha_j$ 是得分的 softmax——哪个位置相关就多看哪个。**Self-attention（自注意力）** 让序列里每个元素去关注其他元素；**Transformer** 用它代替 RNN，可以并行处理整个序列。',
    prereq: ['c40'],
    symbols: [
      [T`$e_j$`, T`位置 $j$ 的注意力**得分**（attention score，一个实数）。它和自然常数 $e\approx2.718$ 不是一回事，所以本章把 $e^x$ 统一写成 $\exp(x)$`],
      [T`$\exp(x)$`, T`$e^x$（$e\approx2.718$）。$\exp(\ln a)=a$，$\exp(0)=1$`],
      [T`$\alpha_j$`, T`注意力权重：$e_j$ 的 softmax，非负、和为 1`],
      [T`$\mathbf h^{(j)}$`, T`编码器第 $j$ 个位置的隐藏状态（被加权的"内容"）`],
      [T`$\mathbf c$`, T`**context vector（上下文向量）**：$\sum_j\alpha_j\mathbf h^{(j)}$`],
      [T`$i,\ j$`, T`$i$：解码器第几步；$j$：输入序列第几个位置`],
      [T`$\mathbf s^{(i)}$`, T`解码器第 $i$ 步的状态`],
      [T`$f$`, T`打分函数：衡量 query（当前要找什么）和位置 $j$ 有多匹配`],
      [T`$\mathbf q,\ \mathbf k,\ \mathbf v$`, T`query / key / value 向量（Transformer 的写法）`],
      [T`$d$`, T`query / key 向量的维数（缩放点积除以 $\sqrt d$，课件不要求）`],
    ],
    goals: [
      '写出 attention 的三步：得分 $e_j$ → softmax 权重 $\\alpha_j$ → 加权和 $\\mathbf c$（L14 p17），手算',
      '解释 seq2seq 中的 repeated attention：每个解码步有自己的上下文 $\\mathbf c_i$（L14 p18）',
      '解释 self-attention 和 Transformer 的组成、为什么能并行',
      '区分训练（teacher forcing + causal mask，所有位置并行）和生成（greedy decoding，逐词）（Worksheet 9）',
    ],
    types: ['T13'],
    notExam: 'L14 p19 的图像描述、p21 的 Transformer 细节结构图只需看懂思想；缩放点积 $\\mathbf q\\cdot\\mathbf k/\\sqrt d$ 等公式课件没给出，不要求。',
    what: [
      { t: 'h3', text: '① 问题：一个上下文向量装不下整句话（L14 p16）' },
      T`**瓶颈问题**：encoder–decoder 把整句话压进一个固定的上下文向量 $\mathbf c$（c40），句子一长就装不下。Attention 让解码器每一步都能"回头看"所有编码器状态，按需取用。`,
      { t: 'h3', text: '② Attention：对所有隐藏状态加权平均（L14 p17）' },
      T`三步：给每个位置打分 → 用 softmax 把分数变成权重 → 按权重把隐藏状态加起来。例：三个位置得分 $(1,2,0)$，权重约 $(0.245,0.665,0.090)$，第 2 个位置最受关注（完整手算见下面"数值例子"）。`,
      { t: 'video', id: 'attention' },
      { t: 'steps', items: [
        T`**得分**：对每个位置算 $e_j$（课件写成一般函数 $f$；在 Transformer 里通常是 query 和 key 的点积）。`,
        T`**归一化**：$\alpha_j=\exp(e_j)/\sum_{j'}\exp(e_{j'})$（softmax：非负、和为 1）。`,
        T`**加权求和**：$\mathbf c=\sum_j\alpha_j\mathbf h^{(j)}$。`,
      ] },
      T`**Attention**（L14 p17）：用所有隐藏状态的加权平均作为摘要。课件先写成最简形式，得分 $e_j$ 只写成 $\mathbf h^{(j)}$ 的函数：`,
      { t: 'math', tex: T`e_j=f(\mathbf h^{(j)}),\qquad\alpha_j=\frac{\exp(e_j)}{\sum_{j'}\exp(e_{j'})},\qquad\mathbf c=\sum_j\alpha_j\mathbf h^{(j)}` },
      T`这是示意，省略了"谁在问"。实际使用时得分一定还取决于一个 **query（查询）**：在 seq2seq 里是解码器上一步的状态 $\mathbf s^{(i-1)}$（下一段），在 Transformer 里是当前位置的 query 向量 $\mathbf q$，得分是点积 $\mathbf q\cdot\mathbf k_j$。`,
      T`**Softmax 权重 = 软性的"选择"**：得分高的位置权重接近 1，其他接近 0；但它是可导的（不像硬选择），能用反向传播训练。`,
      { t: 'h3', text: '③ 翻译时每一步都重新看一遍（L14 p18）' },
      T`**Repeated attention in seq2seq**（L14 p18，Bahdanau 等 2015）：解码器每一步 $i$ 都重新计算一组权重 $\alpha_{ij}$，得到专属的上下文 $\mathbf c_i$；得分取决于上一步解码器状态和每个编码器状态：$e_{ij}=f(\mathbf s^{(i-1)},\mathbf h^{(j)})$。权重热图揭示了翻译中的词对齐（L14 p18）。`,
      { t: 'slide', src: 'L14/p18', caption: '英译法时的注意力权重：亮的格子表示生成这个法语词时主要看哪个英语词——几乎就是逐词对齐。' },
      { t: 'h3', text: '④ Self-attention：序列里的词互相看（L14 p20）' },
      T`上面的 attention 仍挂在 RNN 上：第 $t$ 步必须等第 $t-1$ 步算完，长距离的信息还是要沿时间链一步步走。如果每个词都能**直接**去看句子里的其他词、一次算出自己的新表示，就不必按时间排队了：`,
      T`**Self-attention（自注意力）**（L14 p20）：序列中第 $i$ 个元素用自己当 **query（查询）**，去和其他位置 $j\ne i$（L14 p20）的 **key（键）** 比较打分，再按权重加权汇总它们的 **value（值）**，作为自己的新表示。（类比查字典：query 是你要找的词，key 是每个词条的标题，value 是词条内容；Transformer 里 $\mathbf q,\mathbf k,\mathbf v$ 都由输入乘不同的学习矩阵得到。）例：句子 "The animal didn't cross the street because it was too tired" 中，"it" 主要关注 "animal"。`,
      { t: 'h3', text: '⑤ Transformer：只用 attention，不用 RNN（L14 p21）' },
      T`**Transformer**（L14 p16、p21）：用 self-attention 代替 RNN 处理序列。下面的每个零件都是在补一个洞：self-attention 替代 RNN 的循环；**Add**（残差）防止层数一多梯度又消失；层归一化把每个位置的向量拉回同一尺度；多个注意力头 = 并行的几组 attention，各看一种关系；位置编码补上"第几个词"——只比内容的话，打乱词序，输出也只是跟着打乱。`,
      { t: 'ul', items: [
        T`**Encoder（编码器）块**：self-attention → Add & Normalize → **feed-forward（前馈网络）**（每个位置各自过一个小 MLP）→ Add & Normalize。**Add & Normalize** = 残差连接（把子层的输入加回输出）+ **layer normalisation（层归一化）**（把每个位置的向量减均值、除标准差）。`,
        T`**Decoder（解码器）块**：在 self-attention 和 feed-forward 之间**多一个 encoder–decoder attention（交叉注意力）**子层：query 来自解码器，key / value 来自编码器的输出。每个子层外面同样有 Add & Normalize。`,
        T`再加上多个 **attention heads（注意力头）**、很深的堆叠、输入加 **positional encoding（位置编码）**（因为 attention 本身不知道顺序）。`,
        T`**并行**：编码器、以及训练时（目标序列已知）的解码器，可以同时算所有位置；但生成（推理）时解码器仍要一个 token 一个 token 地产生，并用 **causal mask（因果掩码）** 挡住还没生成的位置。`,
      ] },
      T`**为什么 Transformer 能并行？** RNN 第 $t$ 步必须等第 $t-1$ 步算完。Self-attention 中每个位置的新表示只依赖上一层的所有位置，可以同时算——GPU 友好。任意两个位置之间只隔一次 attention，远距离信息不必沿着很长的时间链传递，避开了 vanilla RNN 的主要困难（但这不保证梯度永不消失）。`,
      { t: 'h3', text: '⑥ 训练 vs 生成：teacher forcing、mask、greedy decoding（Worksheet 9）' },
      T`上面说"训练时解码器可以并行"，靠的是 **teacher forcing（教师强制）**：训练时目标句已知，解码器每个位置的输入直接用正确答案右移一位，而不用模型自己（可能错的）预测。输入 $=[\text{START},y_1,\dots,y_{T-1}]$，目标 $=[y_1,\dots,y_T]$，$y_T$ 是句末符 EOS。Worksheet 9 的例子：德语 "Wie geht es dir" 译成 "How are you"，解码器输入 "<start> How are you"，目标 "How are you </s>"；每个位置预测下一个词，各算一个 cross-entropy，一次全部算完。`,
      T`位置 $t$ 不能偷看后面的正确答案，所以 self-attention 加 **causal mask（因果掩码）**：得分矩阵对角线以上（未来的位置）加 $-\infty$，softmax 后 $\exp(-\infty)=0$，权重为 0。例：第 2 个位置的得分 $(1,2,0)$ 被改成 $(1,2,-\infty)$，权重 $\approx(0.269,0.731,0)$。一个 batch 里句子长短不一，短句补 <pad> 凑齐长度；padding mask（填充掩码）用同样的办法把 <pad> 位置挡掉。`,
      T`生成（推理）时没有正确答案，只能 **greedy decoding（贪心解码）**：从 <start> 开始，每步取概率最大的词（argmax），接到输入末尾再预测下一个，直到生成 </s> 或到最大长度。所以生成必须逐个词进行。`,
      { t: 'table', cls: 'compact', head: ['', '训练', '生成（推理）'], rows: [
        ['解码器输入', '正确答案右移一位（teacher forcing）', '自己前面生成的词'],
        ['计算方式', '所有位置一次算完', '一个词一个词'],
        ['每个位置输出', '下一个词的分布，算 cross-entropy', '取 argmax 接到末尾（greedy）'],
        ['causal mask', '要：挡住后面的正确答案', '也用（后面的词本来就还没生成）'],
      ] },
    ],
    why: [
      T`Attention 是 2017 年以后几乎所有大模型（BERT、GPT 等）的核心。考试多为概念题：attention 解决了什么问题（单一上下文瓶颈）、self-attention 是什么、Transformer 为什么比 RNN 快。`,
    ],
    intuition: [
      { t: 'think', q: '如果所有得分 $e_j$ 都相等，attention 输出是什么？', a: T`所有 $\alpha_j=1/n$，$\mathbf c$ 就是所有隐藏状态的简单平均。` },
      { t: 'story', title: '"Attention Is All You Need"', md: '2017 年 Google 的 Vaswani 等人在同名论文里提出 Transformer，完全去掉了 RNN，只用 attention。BERT（2018）和 GPT 系列都基于它。attention 本身则来自 2014–2015 年 Bahdanau、Cho、Bengio 的机器翻译工作（L14 p18 引用的就是这篇）。' },
    ],
    math: [
      T`**和 c40 的关系**：RNN 的 encoder–decoder 只把最后一个隐藏状态 $\mathbf h^{(\tau)}$ 传给解码器；attention 改成传 $\sum_j\alpha_j\mathbf h^{(j)}$，而且解码器每一步的权重都不同。所有的 $\alpha_j$ 都由可导的运算（打分、softmax、加权和）得到，所以整个模型仍然用反向传播训练。`,
    ],
    fx: [
      {
        title: 'Attention', tex: T`\mathbf c=\sum_j\htmlClass{fx-p1}{\alpha_j}\,\htmlClass{fx-p2}{\mathbf h^{(j)}},\qquad\alpha_j=\htmlClass{fx-p3}{\frac{\exp(e_j)}{\sum_{j'}\exp(e_{j'})}}`,
        parts: [
          { label: 'α_j', note: '位置 $j$ 的权重，越相关越大。' },
          { label: 'h^(j)', note: '位置 $j$ 的隐藏状态（被加权的"内容"）。' },
          { label: 'softmax', note: '把任意实数得分变成和为 1 的正权重；得分差越大，权重越集中。' },
        ],
      },
    ],
    example: [
      { t: 'h3', text: '手算 attention' },
      T`三个隐藏状态 $\mathbf h^{(1)}=(1,0)$，$\mathbf h^{(2)}=(0,1)$，$\mathbf h^{(3)}=(1,1)$；得分 $e=(1,2,0)$。这里的分数和权重与上面的视频相同，但三条 $\mathbf h$ 不同，所以 $\mathbf c$ 也和视频里的不同。`,
      { t: 'steps', items: [
        T`$\exp(e_1)=\exp(1)\approx2.718$，$\exp(e_2)=\exp(2)\approx7.389$，$\exp(e_3)=\exp(0)=1$；和 $\approx11.107$。`,
        T`每个除以和：$\alpha_1=2.718/11.107\approx0.245$，$\alpha_2=7.389/11.107\approx0.665$，$\alpha_3=1/11.107\approx0.090$（三者和为 1）。`,
        T`向量的加权和要**按分量分别算**：第 1 个分量 $0.245\times1+0.665\times0+0.090\times1=0.335$；第 2 个分量 $0.245\times0+0.665\times1+0.090\times1=0.755$。所以 $\mathbf c\approx(0.335,\ 0.755)$。`,
      ] },
      { t: 'fade', title: '分步练习：attention', plan: ['算每个 $\\exp(e_j)$ 和它们的和', '$\\alpha_j=\\exp(e_j)/$和', '$\\mathbf c=\\sum\\alpha_j\\mathbf h^{(j)}$'], items: [
        { md: '上面的例子。', steps: [{ md: '11.107' }, { md: '(0.245, 0.665, 0.090)' }, { md: '(0.335, 0.755)' }] },
        { md: T`两个位置，得分 $e=(0,0)$，$h^{(1)}=2$，$h^{(2)}=4$（标量）。`, steps: [
          { ask: T`$\alpha_1=?$`, answer: 0.5, show: '$1/2$', sg: 2 },
          { ask: T`$c=?$`, answer: 3, show: '$0.5\\times2+0.5\\times4$', sg: 3 },
        ] },
        { md: T`两个位置，得分 $e=(\ln3,\ 0)$，$h^{(1)}=4$，$h^{(2)}=0$。（提示：$\exp(\ln3)=3$，exp 和 ln 互为反函数。）`, steps: [
          { ask: '$\\exp(e_1)+\\exp(e_2)=?$', answer: 4, show: '$3+1$', sg: 1 },
          { ask: T`$\alpha_1=?$`, answer: 0.75, show: '$3/4$', sg: 2 },
          { ask: T`$c=?$`, answer: 3, show: '$0.75\\times4$', sg: 3 },
        ] },
      ] },
    ],
    viz: [
      { id: 'attention-calc', how: '一个 query 和三个 key / value（二维向量，可编辑）。工具依次算得分（点积）、softmax 权重（柱状图）、加权和输出，每一步都写出数字。可以切换是否除以 $\\sqrt d$（Transformer 的标准做法，课件没要求）。',
        try: '① 提高某个 key 和 query 的**点积**（比如把它改成和 query 同方向、而且更长），让它的得分明显超过其他 key：它的权重接近 1。只改方向不够——方向和长度都会影响点积。② 把 query 从 (1,2) 改成 (3,6)（方向不变、放大 3 倍）：得分之间的差距被放大，权重变得更"尖"；但如果最高的两个得分本来并列，放大后仍然并列。' },
    ],
    compare: [
      { t: 'table', head: ['', 'RNN（+ attention）', 'Transformer'], rows: [
        ['顺序处理', '是（一步一步）', '训练时各位置并行；生成时仍逐 token'],
        ['长距离依赖', '受梯度消失影响', 'attention 直接连接任意两个位置'],
        ['位置信息', 'RNN 本身带顺序', '需要 positional encoding'],
        ['核心操作', '循环 + 可选 attention', 'self-attention + feed forward + 残差'],
      ] },
      { t: 'exam', md: T`**What does attention add to an encoder–decoder RNN?** Instead of compressing the whole input into a single final hidden state, at each decoding step the model computes scores $e_{ij}=f(\mathbf s^{(i-1)},\mathbf h^{(j)})$ between the previous decoder state $\mathbf s^{(i-1)}$ and every encoder hidden state $\mathbf h^{(j)}$, normalises them with a softmax into weights $\alpha_{ij}$, and uses the weighted average $\mathbf c_i=\sum_j\alpha_{ij}\mathbf h^{(j)}$ as a step-specific context. The decoder then updates its state $\mathbf s^{(i)}=g(\mathbf s^{(i-1)},y^{(i-1)},\mathbf c_i)$ and predicts the next output. This removes the fixed-size bottleneck, helps with long sequences, and yields interpretable alignments. Self-attention applies the same idea within one sequence, which the Transformer uses instead of recurrence, allowing parallel computation over positions during training.` },
      { t: 'exam', md: T`**Why does a Transformer need positional encoding?** Self-attention compares every pair of positions using only their content (query–key dot products), so it is permutation-equivariant: shuffling the input words just shuffles the outputs, and the model has no notion of word order. An RNN gets order for free by processing tokens sequentially. The Transformer therefore adds a positional encoding (a vector that depends on the position index) to each input embedding, so that attention can use both content and position.` },
    ],
    pitfalls: [
      ['Attention 权重可以是负数', 'softmax 输出非负且和为 1。'],
      ['Transformer 是 RNN 的一种', 'Transformer 不用循环，只用 attention（L14 p20–p21）。'],
      ['Self-attention 知道词的顺序', '本身对顺序不敏感，靠 positional encoding 加入位置信息。'],
      ['Transformer 生成文本时也完全并行', '训练时可并行；自回归生成时仍逐个 token 产生（decoder 用 causal mask）。'],
    ],
    quiz: [
      { type: 'num', q: '得分 $e=(\\ln4,\\ \\ln1)$，$\\alpha_1=?$', answer: 0.8, explain: T`$\alpha_1$ 是位置 1 的 attention weight（注意力权重），等于得分的 softmax：$\alpha_1=\exp(e_1)/\big(\exp(e_1)+\exp(e_2)\big)$。题目给 $e_1=\ln4$、$e_2=\ln1$；exp 和 ln 互为反函数，所以 $\exp(\ln4)=4$，$\exp(\ln1)=1$。$\alpha_1=4/(4+1)=0.8$，相应 $\alpha_2=1/5=0.2$，两者和为 1。陷阱：**先取 exp 再归一化**，直接拿得分相除会得到 $\ln4/(\ln4+0)=1$。` },
      { type: 'num', q: '接上，$h^{(1)}=10$，$h^{(2)}=5$，$c=?$', answer: 9, explain: T`context vector（上下文向量）$c$ 是隐藏状态按注意力权重的加权平均：$c=\alpha_1h^{(1)}+\alpha_2h^{(2)}$。权重沿用上一题 $\alpha_1=0.8$、$\alpha_2=1-0.8=0.2$，隐藏状态由题目给出 $h^{(1)}=10$、$h^{(2)}=5$。$c=0.8\times10+0.2\times5=8+1=9$。结果更靠近 10，因为位置 1 的权重大：attention 让模型多看得分高的位置。` },
      { type: 'mc', q: '（Worksheet 9）把 "Wie geht es dir" 译成 "How are you"。训练时用 teacher forcing，解码器的输入是：', options: ['"<start> How are you"', '"How are you </s>"', '模型上一步自己生成的词', '德语原句 "Wie geht es dir"'], answer: 0, explain: T`teacher forcing（教师强制）把**正确答案右移一位**当解码器输入：开头放 <start>，去掉最后的 </s>，即 $[\text{START},y_1,\dots,y_{T-1}]$。"How are you </s>" 是**目标**：每个位置要预测的下一个词。"模型上一步自己生成的词"是生成（推理）时 greedy decoding 的做法，训练时不这样做，所以训练能所有位置一次算完。德语原句是编码器的输入，解码器通过 cross-attention 看它。` },
      { type: 'mc', q: 'Transformer 比 RNN 训练快的主要原因：', options: ['参数更少', '序列中各位置可以并行计算', '不需要反向传播', '没有激活函数'], answer: 1, explain: T`RNN 第 $t$ 步要等第 $t-1$ 步的隐藏状态算完，只能一步一步顺序算。Transformer 用 self-attention（自注意力）代替循环：每个位置的新表示只依赖上一层的所有位置，**同一层里所有位置可以同时算**，正好适合 GPU。"参数更少"不对：快是因为能并行，和参数多少无关（大模型的参数往往更多）；它照样用反向传播训练，也有激活函数。L14 p16 就把 Transformer 定义为用 attention、高度可并行地处理序列的方法。` },
    ],
  });

  /* =====================================================================
   * r07 · W7 复习
   * ===================================================================== */
  SML.content.add(SML.review({
    id: 'r07', week: 'W7', title: 'W7 复习：CNN 与 RNN / Transformer', en: 'Week 7 review',
    summary: '必拿分：**CNN 参数计数**（T3，2026 Q1d / 2025 Q5：权重共享，卷积层不按输出位置重复计数——真题的单通道单 filter 层只有 3 个权重）和输出尺寸公式。概念题：pooling 的作用、平移不变性、RNN 为什么"深"（2021 Q1）、梯度消失与 LSTM、attention 解决了什么。',
    keypoints: [
      [T`卷积 = filter 滑动、逐元素相乘求和；权重共享；输出 $\lfloor(n+2p-k)/s\rfloor+1$；参数 $C_{out}C_{in}K^2(+C_{out})$。`, 'c38'],
      [T`Max pooling：取窗口最大值、无参数、sub-gradient 只传给最大值；卷积平移等变 + pooling ⇒ 一定程度的平移不变性；堆叠 ⇒ 感受野 $1+L(k-1)$；ResNet（残差网络）残差连接。`, 'c39'],
      [T`RNN：$\mathbf h^{(t)}=\tanh(\mathbf b+W\mathbf h^{(t-1)}+U\bx^{(t)})$，参数跨时间共享；展开深度 = 序列长度；BPTT；线性 RNN 的 $W^{T-1}$：$\rho(W)<1$ 消失、$>1$ 爆炸；LSTM 遗忘门复制路径。`, 'c40'],
      [T`Attention：$\alpha_j=\mathrm{softmax}(e_j)$，$\mathbf c=\sum\alpha_j\mathbf h^{(j)}$；seq2seq 每步一个 $\mathbf c_i$；self-attention + 并行 = Transformer；训练用 teacher forcing + causal mask（$-\infty$），生成用 greedy 逐词。`, 'c41'],
    ],
    map: [
      { t: 'table', head: ['数据', '结构', '共享参数的方式', '主要问题 / 对策'], rows: [
        ['图像', 'CNN', '沿空间（同一 filter 到处用）', '深了难训练 → ResNet（残差网络）'],
        ['序列', 'RNN', '沿时间（每步同一组 $U,W,V$）', '梯度消失 → LSTM'],
        ['序列', 'Transformer', '每个位置同一套 attention 参数', '不知道顺序 → positional encoding'],
      ] },
    ],
    recall: [
      { q: 'CNN 卷积层参数公式？', a: T`$C_{out}\times C_{in}\times K^2$（+ $C_{out}$ bias）。`, ch: 'c38' },
      { q: '输出尺寸公式？', a: T`$\lfloor(n+2p-k)/s\rfloor+1$。`, ch: 'c38' },
      { q: '（真题）7→conv(3)→5→FC 4→FC 5，不含 bias，参数数？', a: '$3+20+20=43$。', ch: 'c38' },
      { q: '为什么 CNN 比全连接参数少？', a: '局部连接 + 权重共享；参数与图像大小无关。', ch: 'c38' },
      { q: 'Max pooling 的作用和反向传播？', a: '下采样、减少后面层的参数、一定程度的平移不变性（窗口内挪动不影响）；自己无参数；梯度只传给最大值（sub-gradient，并列时挑一个）。', ch: 'c39' },
      { q: '$L$ 层 $k\\times k$（stride 1）卷积的感受野？', a: '$1+L(k-1)$。', ch: 'c39' },
      { q: 'ResNet 的残差连接做什么？', a: '把输入直接加到输出（$F(\\bx)+\\bx$），让很深的网络易于优化、缓解梯度消失。', ch: 'c39' },
      { q: 'RNN 参数化公式？', a: T`$\mathbf a^{(t)}=\mathbf b+W\mathbf h^{(t-1)}+U\bx^{(t)}$，$\mathbf h^{(t)}=\tanh(\mathbf a^{(t)})$，$\mathbf o^{(t)}=\mathbf d+V\mathbf h^{(t)}$（课件把输出 bias 写作 $\mathbf c$）。`, ch: 'c40' },
      { q: '（2021 Q1）RNN 在什么意义上是深的？', a: '展开后深度 = 序列长度，梯度要穿过所有时间步（BPTT）；各层共享参数。', ch: 'c40' },
      { q: '梯度消失 / 爆炸的公式和条件？', a: T`**线性** RNN：$\partial\mathbf h^{(T)}/\partial\mathbf h^{(1)}=W^{T-1}$；特征值**绝对值**的最大值 $>1$ 爆炸、$<1$ 消失。带 tanh 时每步还要乘 $\mathrm{diag}(1-h^2)$。`, ch: 'c40' },
      { q: 'LSTM 怎么缓解梯度消失？', a: '状态通过由遗忘门缩放的复制自环（加法）传递，梯度大小得以保持；可处理 100+ 步。', ch: 'c40' },
      { q: 'Attention 的三步？', a: T`得分 $e_j=f(\text{query},\mathbf h^{(j)})$ → 权重 $\alpha_j=\mathrm{softmax}(e)_j$ → 加权和 $\mathbf c=\sum_j\alpha_j\mathbf h^{(j)}$。`, ch: 'c41' },
      { q: 'Self-attention / Transformer 的要点？', a: '每个元素当 query 去关注其他元素；Transformer 用它代替 RNN，并行、配合残差 + 归一化、多头、位置编码。', ch: 'c41' },
    ],
    formulas: [
      ['$b_i=\\sum_{\\delta=-c}^{c}a_{i+\\delta}w_{\\delta+c+1}$', '1D 卷积（filter 宽 $2c+1$，$\\delta$ 是偏移）', 'L13 p10'],
      ['$\\lfloor(n+2p-k)/s\\rfloor+1$', '输出尺寸（$n$ 输入宽，$k$ filter 宽，$p$ padding，$s$ stride）', '与 Workshop 8 的表一致（32, k=5, s=1, p=0 → 28）'],
      ['$C_{out}C_{in}K^2+C_{out}$', '卷积参数（filter 数 × 输入通道 × filter 面积 + bias）', 'Workshop 8'],
      ['$v=\\max(u_{11},\\dots,u_{mm})$', 'max pooling', 'L13 p23'],
      ['$\\mathbf h^{(t)}=\\tanh(\\mathbf b+W\\mathbf h^{(t-1)}+U\\bx^{(t)})$', 'RNN', 'L14 p12'],
      ['$\\partial\\mathbf h^{(T)}/\\partial\\mathbf h^{(1)}=W^{T-1}$', '梯度消失 / 爆炸（仅线性 RNN）', 'L14 p13'],
      ['$\\alpha_j=\\frac{\\exp(e_j)}{\\sum_{j\'}\\exp(e_{j\'})}$，$\\mathbf c=\\sum\\alpha_j\\mathbf h^{(j)}$', 'attention（$e_j$ 是得分）', 'L14 p17'],
    ],
    exam: [
      ['CNN 参数计数（读图）', '2026 Q1d、2025 Q5', '[T3](#/T03)'],
      ['RNN 为什么是深的', '2021 Q1', '[T13](#/T13)'],
      ['深度学习概念（pooling、LSTM、attention）', '往年没单独出过；可能出简答', '[T13](#/T13)'],
    ],
    quiz: [
      { type: 'num', q: '输入 $32\\times32\\times3$，8 个 $5\\times5$ filter，含 bias。参数？', answer: 608, explain: '每个 filter 在 3 个输入通道上各有 $5\\times5$ 个数：$5\\times5\\times3=75$，再加 1 个 bias 是 76；8 个 filter：$8\\times76=608$。' },
      { type: 'num', q: '（Worksheet 8 原题）CNN：输入 $32\\times32\\times3$ → 8 个 $5\\times5$ 卷积 → $2\\times2$ max pooling（stride 2）→ 16 个 $5\\times5$ 卷积 → $2\\times2$ max pooling → 拉平 → 全连接 256 → 全连接 10。卷积 stride 1、无 padding，全部含 bias。参数总数？', answer: 109050, explain: T`先算尺寸：$32-5+1=28$，pooling 后 14；$14-5+1=10$，pooling 后 5；拉平 $5\times5\times16=400$。再逐层数参数：卷积 1：$8\times(5\times5\times3)+8=600+8=608$；卷积 2：$16\times(5\times5\times8)+16=3200+16=3216$；两个 pooling 都是 0；全连接 1：$400\times256+256=102400+256=102656$；全连接 2：$256\times10+10=2570$。合计 $608+3216+102656+2570=109050$（不含 bias 是 108760）。**94% 的参数在第一个全连接层**，两个卷积层合起来只有 3824 个。完整表格和 logistic regression 对比见 [T3](#/T03)。` },
      { type: 'num', q: '输入宽 32，filter 5，stride 1，padding 2。输出宽？', answer: 32, explain: '公式 $(W+2p-F)/s+1$：$2p=2\\times2=4$（两边各补 2 圈），$(32+4-5)/1+1=31+1=32$——输出和输入一样宽（"same" padding）。' },
      { type: 'num', q: '$28\\times28\\times6$ 经 $2\\times2$ stride 2 max pooling，再接 10 个输出的全连接层（含 bias）。全连接层参数？', answer: 11770, explain: '先 pooling：$28/2=14$，通道不变 ⇒ $14\\times14\\times6=1176$ 个数（拉平成向量）。再全连接：每个输出连 1176 个输入 + 1 个 bias ⇒ $10\\times(1176+1)=11770$。' },
      { type: 'num', q: 'RNN $H=10$，$D=5$，$K=3$（含 bias）。参数？', answer: 193, explain: '$U$（输入→隐藏）$H\\times D=10\\times5=50$；$W$（隐藏→隐藏）$H\\times H=100$；隐藏 bias $H=10$；$V$（隐藏→输出）$K\\times H=3\\times10=30$；输出 bias $K=3$。合计 $50+100+10+30+3=193$，和序列长度无关。' },
      { type: 'num', q: 'Attention 得分 $(\\ln2,\\ \\ln2,\\ \\ln4)$，第三个权重？', answer: 0.5, explain: '$\\exp(\\ln4)/\\big(\\exp(\\ln2)+\\exp(\\ln2)+\\exp(\\ln4)\\big)=4/(2+2+4)$。' },
      { type: 'show', q: '（英文）Why is weight sharing（权重共享）useful in CNNs?', answer: T`The same filter detects the same pattern at every location, so the network does not need to relearn a concept for each position (translation equivariance/invariance with pooling), and the number of parameters is independent of the image size, which reduces overfitting and computation.`, qzh: '为什么权重共享（weight sharing）在 CNN 中有用？', azh: '同一个滤波器（filter）在每个位置检测同一种模式，所以网络不需要为每个位置重新学习同一个概念（平移等变性（translation equivariance），配合池化（pooling）则得到平移不变性（invariance））；而且参数数量与图像大小无关，从而减少过拟合（overfitting）和计算量。' },
    ],
    next: '下一周（W8）：模型评估（交叉验证、指标）和 learning with expert advice。',
  }));
})(window);
