/* T3 — Counting CNN parameters (L13, WS08/WK08). */
(function (root) {
  'use strict';
  const T = String.raw;

  root.SML.content.add({
    id: 'T03',
    eyebrow: '题型 T3 · 同一张图考了两次 · 3–10 分',
    title: 'CNN 参数计数',
    en: 'How many parameters does this CNN have?',
    chips: [
      { text: 'L13 p6–p17', href: '#/L13', cls: 'src' }, { text: 'WS08 / WK08', cls: 'src' },
      { text: '2026 practice Q1d', cls: 'hot' }, { text: '2025 practice Q5', cls: 'hot' },
    ],
    lead: '核心只有一句话：**卷积层的权重是共享的**（weight sharing），一个 filter 不管滑到哪里都用同一组参数。所以卷积层的参数数 = filter 的大小，和输出有多少个单元无关。',
    blocks: [
      { t: 'h2', text: '1. 三条公式', id: 'rules' },
      '符号：1D 里 $n$ 是输入长度、$k$ 是 filter 宽（每次连看几个数）、$s$ 是 stride（窗口每次滑几格，没写就是 1）。2D 里 $H$ 是输入的高（宽用同一个公式）、$K$ 是正方形 filter 的边长、$P$ 是 padding（四周补几圈 0，没写就是 0）、$S$ 是 stride、$C_{in}$ 是输入通道数（黑白 1、RGB 3）、$C_{out}$ 是 filter 个数（= 输出通道数）。bias 是每个 filter / 每个输出单元额外加的一个常数。最终输出写成"高 × 宽 × 通道"，如 $28\\times28\\times6$。',
      {
        t: 'table', head: ['层', '权重（weights）', 'bias', '输出大小'], rows: [
          ['1D 卷积，宽 $k$，1 个 filter', '$k$', '$1$', '$\\lfloor (n-k)/s\\rfloor+1$'],
          ['2D 卷积，$C_{out}$ 个 $K\\times K$ filter，输入 $C_{in}$ 通道', '$C_{out}\\cdot C_{in}\\cdot K^2$', '$C_{out}$', '$\\lfloor (H+2P-K)/S\\rfloor+1$'],
          ['全连接 $n_{in}\\to n_{out}$', '$n_{in}\\cdot n_{out}$', '$n_{out}$', '$n_{out}$'],
          ['Max pooling', '0', '0', '$\\lfloor (H-K)/S\\rfloor+1$'],
        ],
      },
      '来源：卷积和 weight sharing 见 L13 p9–p17；参数计数公式 $C_{out}C_{in}K^2+C_{out}$ 和输出尺寸公式见 WS08 / worksheet 8。题目说 *exclude the bias* 时不加 bias 列。',

      { t: 'h2', text: '2. 读图步骤', id: 'steps' },
      { t: 'fig', src: 'assets/figures/ex2026_q1d_cnn.png', caption: '2026 practice Q1d / 2025 practice Q5 原图：从下到上 7、5、4、5 个圆。图上的"…"表示中间的连线没画全，不是没有那些边。题目要求不算 bias。', w: 460 },
      {
        t: 'steps', items: [
          '**从下往上数每层的单元数。** 2026/2025 卷的图：输入 7 个 → 卷积层 5 个 → 全连接 4 个 → 输出 5 个。',
          '**卷积层：看一个输出单元连了几个输入。** 每个卷积单元有 3 条入边 ⇒ filter 宽度 $k=3$。验证：$7-3+1=5$，和卷积层的 5 个单元对上（stride 1，无 padding）。',
          '**卷积层参数 = $k$ = 3**（共享，不是 $5\\times3$）。',
          '**全连接层：两层单元数相乘。** "…" 和"Fully connected"字样表示所有边都存在，只是没画全。$5\\times4=20$，$4\\times5=20$。',
          '**加起来**：$3+20+20=43$（原题要求 exclude bias；如果要算 bias：卷积 +1、两层全连接 +4、+5，共 $43+10=53$）。',
        ],
      },
      {
        t: 'exam', md: T`Layer sizes (bottom to top): 7 inputs → 5 convolutional units → 4 hidden units → 5 outputs.
Convolutional layer: each unit sees 3 consecutive inputs ($7-3+1=5$ outputs), and the 3 filter weights are shared across positions: **3** parameters.
First fully connected layer: $5\times4=$ **20**. Second fully connected layer: $4\times5=$ **20**.
Total (excluding biases): $3+20+20=$ **43**.`,
      },
      {
        t: 'warn', title: '最常见的错',
        md: '把卷积层算成 $5\\times3=15$。那是**不共享权重**的 locally connected 层。卷积的定义就是同一个 filter 在所有位置重复使用（L13 p6 "parameter sharing"）。如果把卷积层算成 15，总数会写成 55，丢分。',
      },

      { t: 'h2', text: '3. 计数器', id: 'solver' },
      '1D 标签页复现真题图（颜色相同的边是同一个共享权重）；2D 标签页算多层 CNN 的输出尺寸和参数。',
      { t: 'viz', id: 'cnn-counter', opts: { preset: 'EX2026Q1d' } },

      { t: 'h2', text: '4. 2D 例子（课件原数）', id: '2d' },
      {
        t: 'table', head: ['层', '计算', '输出', '参数'], rows: [
          ['输入', '', '$32\\times32\\times1$', '0'],
          ['Conv：6 个 $5\\times5$ filter，stride 1，无 padding', '$(32-5)/1+1=28$（高、宽一样）；权重 $C_{out}C_{in}K^2=6\\cdot1\\cdot5^2=6\\times25=150$（$C_{in}=1$ 是输入 $32\\times32\\times1$ 的最后那个 1；RGB 就是 $6\\times3\\times25=450$），bias 6', '$28\\times28\\times6$', '150（+6）'],
        ],
      },
      '来源：L13 p17。如果再接一个 $2\\times2$、stride 2 的 max pooling：$\\lfloor(28-2)/2\\rfloor+1=13+1=14$，宽同样是 14，通道不变 ⇒ 输出 $14\\times14\\times6$；pooling 只取最大值，没有要学的数，参数 0（WS08 LeNet 例子里的 $28\\to14$ 同理）。',
      {
        t: 'deep', title: '展开详解：为什么 CNN 参数少、为什么要 pooling', hint: '简答题角度',
        blocks: [
          '**和全连接对比。** 7 个输入接 5 个隐藏单元：全连接要 $7\\times5=35$ 个权重；locally connected（每个单元只看 3 个输入，但不共享）要 15 个；卷积（共享）只要 3 个。图像上差距更大：$32\\times32$ 输入接 $28\\times28\\times6$ 的全连接层要 $1024\\times4704\\approx4.8$ 百万个权重，卷积只要 150 个。',
          {
            t: 'ul', items: [
              '**Weight sharing（权重共享）/ translation equivariance（平移等变）**：同一个 pattern（比如一条边）出现在图像任何位置，都由同一个 filter 检测，不需要在每个位置重新学（L13 p4–p6）；图案平移，特征图跟着平移（stride 1、忽略边界）。平移**不变**要靠后面的 pooling，而且只是有限的。',
              '**Max pooling**：把 $m\\times m$ 区域换成最大值，降低分辨率、减少后面全连接层的参数，并带来有限的平移不变性（p22–p24）。没有参数；反向传播只把梯度传给取到最大值的那个位置（sub-gradient，p23）。',
              '**多通道**：每个 filter 覆盖输入的全部 $C_{in}$ 个通道，所以权重是 $C_{in}\\cdot K^2$（p18）；有 $C_{out}$ 个 filter 就有 $C_{out}$ 个输出通道（p17）。',
            ],
          },
          {
            t: 'exam', title: 'Exam phrasing · 为什么卷积比全连接参数少',
            md: 'A convolutional layer applies the same small filter at every position (weight sharing), so its number of weights depends only on the filter size and the numbers of input/output channels, not on the size of the input. A fully connected layer needs one weight per input–output pair.',
          },
        ],
      },

      { t: 'h2', text: '5. 随机练习', id: 'practice' },
      { t: 'practice', gen: 'cnn', title: 'CNN 参数随机题' },
      {
        t: 'quiz', items: [
          {
            q: '输入 10 个单元，1D 卷积 filter 宽 4，stride 2，1 个 filter，**含 bias**。输出几个单元？参数几个？', type: 'show',
            answerText: '输出 $\\lfloor(10-4)/2\\rfloor+1=4$ 个；参数 $4+1=5$。',
            explain: '共享权重：一个 filter 4 个权重 + 1 个 bias，与输出个数无关。',
          },
          {
            q: '输入 $28\\times28\\times3$，卷积层 16 个 $3\\times3$ filter，stride 1，padding 1。不含 bias 的参数个数？', type: 'num', answer: 432,
            explain: '$C_{out}C_{in}K^2=16\\times3\\times3^2=16\\times3\\times9=432$。输出 $\\lfloor(28+2\\times1-3)/1\\rfloor+1=27+1=28$（$+2$ 是两边各补 $P=1$ 圈 0），即 $28\\times28\\times16$（输出大小不影响参数数）。',
          },
          {
            q: '一个 $2\\times2$ max pooling 层有多少个可学习参数？', type: 'num', answer: 0,
            explain: 'Pooling 只取最大值，没有权重。',
          },
        ],
      },
    ],
  });
})(window);
