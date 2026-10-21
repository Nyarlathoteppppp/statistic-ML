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

      { t: 'h2', text: '5. Worksheet 8 全解：CNN 与 logistic regression', id: 'ws8' },
      'Worksheet 8 原题：在 CIFAR-10（$32\\times32$ 彩色图，10 类）上分别数 logistic regression 和下面这个 CNN 的参数（含 bias）。卷积 stride 1、无 padding；max pooling 是 $2\\times2$、stride 2，没有参数。worksheet 把尺寸写成"通道 × 高 × 宽"（如 $3\\times32\\times32$），本页按"高 × 宽 × 通道"写，数字一样。',
      {
        t: 'table', head: ['层', '输出', '参数（含 bias）', '不含 bias'], rows: [
          ['输入', '$32\\times32\\times3$', '0', '0'],
          ['Conv I：8 个 $5\\times5$', '$28\\times28\\times8$（$32-5+1=28$）', '$8\\times(5\\cdot5\\cdot3)+8=608$', '600'],
          ['Max pooling', '$14\\times14\\times8$', '0', '0'],
          ['Conv II：16 个 $5\\times5$', '$10\\times10\\times16$（$14-5+1=10$）', '$16\\times(5\\cdot5\\cdot8)+16=3216$', '3200'],
          ['Max pooling', '$5\\times5\\times16$，拉平成 $400$', '0', '0'],
          ['Dense I：$400\\to256$', '256', '$400\\times256+256=102656$', '102400'],
          ['Dense II：$256\\to10$', '10', '$256\\times10+10=2570$', '2560'],
          ['CNN 合计', '', '**109050**', '108760'],
          ['Logistic regression：拉平 $3072\\to10$', '10', '$3072\\times10+10=30730$', '30720'],
        ],
      },
      'Logistic regression 把 $32\\times32\\times3=3072$ 个像素拉平，每类一个权重向量（多类 softmax，见 [c15](#/c15)）。CNN 的参数约是它的 3.5 倍，但 94% 在 Dense I；两个卷积层合起来只有 $608+3216=3824$ 个，这就是权重共享。题目没说 bias 时写含 bias 的数，并注明不含 bias 的值。',

      { t: 'h2', text: '6. 方法：尺寸、反推 stride、感受野', id: 'size-rf' },
      T`前面几节数的是参数。同一张网络图还常这样问：每层输出多大、缺的 stride 是多少、能不能用几层小 filter 代替一层大 filter。公式与 [c38](#/c38)、[c39](#/c39) 一致：$n$ 是输入边长，$p$ 是每边补零的圈数（padding），$k$ 是 filter（或 pooling 窗口）的边长，$s$ 是 stride。`,
      {
        t: 'steps', items: [
          T`**逐层算边长。** 每层都用 $\lfloor(n+2p-k)/s\rfloor+1$（即第 1 节表里的 $\lfloor(H+2P-K)/S\rfloor+1$），高、宽各算一次。除不尽就向下取整：最后剩下的几列不够放一个窗口，直接丢掉。通道数：卷积层等于 filter 个数，pooling 层不变。`,
          T`**反推未知量（如 stride）。** 把已知数代进去，得到 $\lfloor(n+2p-k)/s\rfloor=\text{输出边长}-1$，再试 $s=1,2,3,\dots$，向下取整后对得上的就是答案。`,
          T`**每层参数。** 卷积层 $C_{out}\cdot C_{in}\cdot k^2$（另加 $C_{out}$ 个 bias），pooling 层 0。全连接层先把上一层拉平成 $H\times W\times C$ 个数，再乘输出单元数。`,
          T`**感受野（receptive field）。** 感受野是一个单元能"看到"的输入范围（L13 p26）。几层 stride 1 的卷积叠起来，宽度分别是 $k_1,\dots,k_L$，最上层一个单元的感受野宽度是 $1+\sum_i(k_i-1)$。全部同宽 $k$ 时，就是 c39 的 $1+L(k-1)$。`,
          T`**用小 filter 代替大 filter。** 要保持一个 $K\times K$ 卷积的感受野，选 $L\ge2$ 层，边长 $k_1,\dots,k_L$ 满足 $\sum_i(k_i-1)=K-1$。如果每层都是 $C$ 个通道进、$C$ 个 filter 出，参数是 $C^2\sum_ik_i^2$，比原来的 $C^2K^2$ 少。例如两层 $5\times5$ 代替 $9\times9$：$25+25=50<81$。每层 stride 1、padding $(k_i-1)/2$，输出边长就不变。`,
        ],
      },
      { t: 'slide', src: 'L13/p26', caption: '左图两层宽 3 的卷积叠起来，$g_3$ 看到 $x_1$–$x_5$ 共 5 个输入：$1+2+2=5$。' },

      { t: 'h2', text: '7. 真题全解：尺寸、stride、卷积手算、感受野', id: 'past-more' },
      { t: 'note', md: '这一节的 5 道题都只在学生笔记（Travis）里找到，**图来自学生笔记，未与原卷核对**；网络结构图在这里改画成表格。笔记里的学生答案有几处算错（例如 2020 Q5 的总参数），下面的答案全部重新算过。2022 S1 Q5（$3\\times3$ 图、$2\\times2$ filter、global max pooling，写函数并反传）放在 [T10](#/T10)。' },
      {
        t: 'past', src: '2020 Q5(a)(b)(c)（据学生笔记）', topic: 'L13 p17, p23, p26',
        q: T`Assume that you train a convolutional neural network (CNN) on a GPU. The size of each input image is 64x64x3 (3 channels). The figure shows the settings of the layers in the CNN. There are four layers: two convolutional layers (conv1 and conv2), with a max-pooling layer between them. The output feature map of conv2 is flattened into a vector, which is then fed to a fully-connected layer (FC) with 10 output units.

Note: the padding size is the number of rows/columns on each side of the input. For example, if the size of an input is 5 × 5 and the padding size is 1, then after padding the input becomes 7 × 7.

(a) Write the sizes of the output feature maps of Layer 1, Layer 2 and Layer 3 (in the form 'width × height × channels').

(b) How many parameters are in each of the four layers (exclude the bias) in the CNN? Show your working.

(c) How to replace conv2 to keep the same size of receptive field of conv2 with fewer parameters? Write three different replacements.`,
        qzh: T`在 GPU 上训练一个 CNN，每张输入图是 $64\times64\times3$（3 通道）。网络有四层：两个卷积层 conv1、conv2，中间夹一个 max pooling 层；conv2 的输出拉平成向量，送进有 10 个输出单元的全连接层（FC）。padding 是输入每一边补的行/列数，例如 $5\times5$ 补 1 后变成 $7\times7$。(a) 写出 Layer 1、2、3 输出特征图的尺寸（宽 × 高 × 通道）。(b) 四层各有多少参数（不含 bias）？写出过程。(c) 怎样替换 conv2，使感受野不变而参数更少？写出三种不同的替换。`,
        blocks: [{
          t: 'table', cls: 'compact', head: ['层', '类型', '设置（原图改画）'], rows: [
            ['输入', '图像', '$64\\times64\\times3$'],
            ['Layer 1（conv1）', '卷积', '64 个 filter，$11\\times11$，padding 0，stride 2'],
            ['Layer 2', 'max pooling', '$2\\times2$，padding 0，stride 2'],
            ['Layer 3（conv2）', '卷积', '64 个 filter，$9\\times9$，padding 4，stride 1'],
            ['Layer 4（FC）', '全连接', '拉平后接 10 个输出单元'],
          ],
        }],
        sol: [
          { t: 'h4', text: '(a) 逐层尺寸' },
          {
            t: 'table', head: ['层', '代入 $\\lfloor(n+2p-k)/s\\rfloor+1$', '输出（宽 × 高 × 通道）'], rows: [
              ['Layer 1', T`$\lfloor(64+0-11)/2\rfloor+1=\lfloor26.5\rfloor+1=26+1=27$`, T`$27\times27\times64$`],
              ['Layer 2', T`$\lfloor(27+0-2)/2\rfloor+1=\lfloor12.5\rfloor+1=12+1=13$`, T`$13\times13\times64$（pooling 不改通道数）`],
              ['Layer 3', T`$\lfloor(13+2\times4-9)/1\rfloor+1=12+1=13$`, T`$13\times13\times64$`],
            ],
          },
          T`Layer 1 的 $53/2=26.5$ 除不尽：窗口从第 1 列起每次跳 2 列，第 27 个窗口盖住第 53–63 列，第 64 列不够再放一个窗口，被丢掉。Layer 3 的 padding 4 正好是 $(9-1)/2$，所以边长不变。`,
          { t: 'h4', text: '(b) 每层参数（不含 bias）' },
          {
            t: 'table', head: ['层', '计算', '参数'], rows: [
              ['Layer 1', T`$C_{out}C_{in}k^2=64\times3\times11^2=64\times3\times121$`, '23232'],
              ['Layer 2', 'max pooling 没有参数', '0'],
              ['Layer 3', T`$64\times64\times9^2=4096\times81$（输入是 Layer 2 的 64 个通道）`, '331776'],
              ['Layer 4', T`拉平 $13\times13\times64=10816$ 个数，接 10 个单元：$10816\times10$`, '108160'],
              ['合计', '', '**463168**'],
            ],
          },
          '题目要求不含 bias。如果要算 bias，四层再分别加 64、0、64、10，合计 $463168+138=463306$。',
          { t: 'h4', text: '(c) 保持感受野、减少参数' },
          T`conv2 是 $9\times9$、stride 1，它的一个输出单元看 Layer 2 输出上 $9\times9$ 的区域。换成几层 stride 1 的小卷积，只要 $\sum_i(k_i-1)=9-1=8$，感受野就还是 9。每层都用 64 个 filter（64 通道进、64 通道出），参数 $=64\times64\times\sum_ik_i^2=4096\sum_ik_i^2$。`,
          {
            t: 'table', head: ['替换', '感受野 $1+\\sum(k_i-1)$', '参数（不含 bias）'], rows: [
              [T`原来：一层 $9\times9$`, '$1+8=9$', T`$4096\times81=331776$`],
              [T`两层 $5\times5$`, '$1+4+4=9$', T`$4096\times50=204800$`],
              [T`四层 $3\times3$`, '$1+2+2+2+2=9$', T`$4096\times36=147456$`],
              [T`$5\times5$ + $3\times3$ + $3\times3$`, '$1+4+2+2=9$', T`$4096\times43=176128$`],
              [T`$7\times7$ + $3\times3$`, '$1+6+2=9$', T`$4096\times58=237568$`],
            ],
          },
          T`任写三种即可。每层 padding 取 $(k_i-1)/2$（$3\times3$ 用 1，$5\times5$ 用 2，$7\times7$ 用 3），输出仍是 $13\times13\times64$，后面 FC 的参数不变。层与层之间还可以加非线性激活，表达能力更强。`,
          {
            t: 'exam', md: T`(a) Output size per side: $\lfloor(n+2p-k)/s\rfloor+1$. Layer 1: $\lfloor(64-11)/2\rfloor+1=27$, so $27\times27\times64$. Layer 2: $\lfloor(27-2)/2\rfloor+1=13$, so $13\times13\times64$. Layer 3: $(13+2\cdot4-9)/1+1=13$, so $13\times13\times64$.

(b) Layer 1: $11\cdot11\cdot3\cdot64=23232$. Layer 2 (max pooling): 0. Layer 3: $9\cdot9\cdot64\cdot64=331776$. Layer 4: the flattened input has $13\cdot13\cdot64=10816$ values, so $10816\cdot10=108160$. Total: $463168$.

(c) Stacking stride-1 convolutions of sizes $k_1,\dots,k_L$ gives a receptive field of $1+\sum_i(k_i-1)$, so any stack with $\sum_i(k_i-1)=8$ keeps the $9\times9$ receptive field. With 64 filters per layer and padding $(k_i-1)/2$ (output stays $13\times13\times64$): (i) two $5\times5$ layers, $64\cdot64\cdot50=204800$ parameters; (ii) four $3\times3$ layers, $64\cdot64\cdot36=147456$; (iii) one $5\times5$ and two $3\times3$ layers, $64\cdot64\cdot43=176128$. All are fewer than $331776$.`,
          },
        ],
        azh: T`(a) 每边输出尺寸 $\lfloor(n+2p-k)/s\rfloor+1$。Layer 1：$\lfloor(64-11)/2\rfloor+1=27$，即 $27\times27\times64$。Layer 2：$\lfloor(27-2)/2\rfloor+1=13$，即 $13\times13\times64$。Layer 3：$(13+2\cdot4-9)/1+1=13$，即 $13\times13\times64$。(b) Layer 1：$11\cdot11\cdot3\cdot64=23232$。Layer 2（max pooling）：0。Layer 3：$9\cdot9\cdot64\cdot64=331776$。Layer 4：拉平后的输入有 $13\cdot13\cdot64=10816$ 个数，所以 $10816\cdot10=108160$。合计 $463168$。(c) 叠起来的 stride 1 卷积边长为 $k_1,\dots,k_L$ 时，感受野（receptive field）是 $1+\sum_i(k_i-1)$，所以任何满足 $\sum_i(k_i-1)=8$ 的堆叠都保持 $9\times9$ 的感受野。每层 64 个 filter、padding $(k_i-1)/2$（输出仍是 $13\times13\times64$）：(i) 两层 $5\times5$，参数 $64\cdot64\cdot50=204800$；(ii) 四层 $3\times3$，$64\cdot64\cdot36=147456$；(iii) 一层 $5\times5$ 加两层 $3\times3$，$64\cdot64\cdot43=176128$。都少于 $331776$。`,
      },
      {
        t: 'past', src: '2023 Q5(a)(b)（据学生笔记；学期未标）', topic: 'L13 p17, p23',
        q: T`Consider the following toy convolutional neural network (CNN): a single-channel $32\times32$ pixel input image is first fed into a convolutional layer resulting in a $15\times15$ output, which is then fed into a max-pooling layer resulting in an output of unknown dimension. Prior to the convolutional layer, each of the four sides of the image is padded by 1 pixel. This layer has a single $5\times5$ filter/kernel with some unknown stride. The max pooling layer uses a $2\times2$ pool size, with $2\times2$ stride and no padding.

(a) What is the convolutional layer's missing stride value?

(b) What is the missing final feature map dimension?`,
        qzh: T`一个小 CNN：单通道 $32\times32$ 的输入图先进卷积层，得到 $15\times15$ 的输出，再进 max pooling 层，输出尺寸未知。卷积前图像四边各补 1 个像素；卷积层只有一个 $5\times5$ filter，stride 未知。max pooling 窗口 $2\times2$、stride $2\times2$、无 padding。(a) 卷积层缺的 stride 是多少？(b) 最后的特征图尺寸是多少？`,
        blocks: [{
          t: 'table', cls: 'compact', head: ['步骤（原图改画）', '设置'], rows: [
            ['输入', T`$32\times32$，单通道`],
            ['卷积', T`1 个 $5\times5$ filter，padding 1，stride **?**`],
            ['特征图', T`$15\times15$`],
            ['max pooling', T`$2\times2$，stride $2\times2$，padding 0`],
            ['特征图', '**?**'],
          ],
        }],
        sol: [
          T`(a) 代入 $\lfloor(n+2p-k)/s\rfloor+1$：$n=32$，$p=1$，$k=5$，输出 15，所以 $\lfloor(32+2-5)/s\rfloor+1=15$，即 $\lfloor29/s\rfloor=14$。逐个试：`,
          {
            t: 'table', cls: 'compact', head: ['$s$', '$29/s$', '向下取整 + 1', '等于 15？'], rows: [
              ['1', '29', '30', '否'], ['2', '14.5', '15', '**是**'], ['3', '9.67', '10', '否'],
            ],
          },
          T`所以 stride = 2。$29/2$ 不是整数也没关系：补零后宽 34，窗口起点是第 1, 3, …, 29 列，共 15 个；第 15 个窗口盖住第 29–33 列，第 34 列不够一个窗口，被丢掉。`,
          T`(b) pooling 也用同一个公式：$\lfloor(15+0-2)/2\rfloor+1=\lfloor6.5\rfloor+1=7$。只有一个通道，所以最后是 $7\times7$（即 $7\times7\times1$）。第 15 行、第 15 列凑不成 $2\times2$ 窗口，被丢掉。`,
          {
            t: 'exam', md: T`(a) Output size $=\lfloor(n+2p-k)/s\rfloor+1$, so $\lfloor(32+2\cdot1-5)/s\rfloor+1=15$, i.e. $\lfloor29/s\rfloor=14$. Only $s=2$ works ($s=1$ gives 30, $s=3$ gives 10), so the stride is 2.

(b) Max pooling: $\lfloor(15-2)/2\rfloor+1=7$, so the final feature map is $7\times7$ (one channel).`,
          },
        ],
        azh: T`(a) 输出尺寸 $=\lfloor(n+2p-k)/s\rfloor+1$，所以 $\lfloor(32+2\cdot1-5)/s\rfloor+1=15$，即 $\lfloor29/s\rfloor=14$。只有 $s=2$ 成立（$s=1$ 得 30，$s=3$ 得 10），所以 stride 是 2。(b) max pooling：$\lfloor(15-2)/2\rfloor+1=7$，所以最后的特征图是 $7\times7$（一个通道）。`,
      },
      {
        t: 'past', src: '“2021 S1” Q6(a)(b)（据学生笔记；年份标签存疑）', topic: 'L13 p17–p18, p26',
        q: T`Consider the following simple Convolutional Neural Network. The input is a RGB image (3 channels) with width and height equal to 224. The settings of the layers are shown in the figure. There are 32 filters in the convolutional layer and each filter has a size of $11\times11$.

(a) Compute the number of parameters in the convolutional layer (show the formula and give the final result).

(b) In order to reduce the number of parameters of the convolutional layer in the figure, while keeping the receptive field the same, one possible method is to stack one $3\times3$ convolutional layer and one $9\times9$ convolutional layer. Describe five different possible stackings, i.e., different combinations of multiple (can be two or more than two) convolutional layers. (Note: changing the order of the multiple convolutional layers is counted as the same stack, e.g., "Stacking a $9\times9$ and a $3\times3$ convolutional layer" is counted as the same stack as "Stacking a $3\times3$ and a $9\times9$ convolutional layer".)`,
        qzh: T`一个简单的 CNN：输入是 RGB 图（3 通道），宽、高都是 224，各层设置见下表。卷积层有 32 个 filter，每个 $11\times11$。(a) 算卷积层的参数个数（写出公式和最终结果）。(b) 为了减少卷积层的参数、同时保持感受野不变，一种做法是叠一层 $3\times3$ 卷积和一层 $9\times9$ 卷积。再写出五种不同的堆叠方式（两层或更多层的不同组合；只改变顺序算同一种）。`,
        blocks: [{
          t: 'table', cls: 'compact', head: ['层（原图改画）', '设置'], rows: [
            ['输入', T`$224\times224\times3$`],
            ['卷积', T`32 个 filter，$11\times11$，无 padding，stride $1\times1$`],
            ['max pooling', T`$2\times2$，有 padding，stride $2\times2$`],
            ['拉平 → FC', '5 个单元'],
          ],
        }],
        sol: [
          T`这个年份标签有冲突：2021 S1 正式卷的 Q6 是模型选择简答，不是这道题，所以只当作"某年的 CNN 题"。`,
          T`(a) 每个 filter 覆盖全部 3 个输入通道：$11\times11\times3=363$ 个权重，加 1 个 bias 是 364；共 32 个 filter：$32\times364=11648$。题目没说去掉 bias，所以写 11648，并注明不含 bias 是 $32\times363=11616$。`,
          T`(b) 感受野 11 要求 $\sum_i(k_i-1)=10$。题目的例子 $3\times3+9\times9$：$2+8=10$。只用奇数边长（常用，padding 能两边对称）时，每个 $k_i-1$ 都是偶数，问题就变成把 $10/2=5$ 拆成至少两个正整数之和。除去例子，正好还有 5 种：`,
          {
            t: 'table', head: ['堆叠（顺序无关）', '$\\sum(k_i-1)$', '每对通道的权重 $\\sum k_i^2$（原来 $11^2=121$）'], rows: [
              [T`$9\times9$ + $3\times3$（题目给的例子）`, '$8+2=10$', '90'],
              [T`$7\times7$ + $5\times5$`, '$6+4=10$', '74'],
              [T`$7\times7$ + $3\times3$ + $3\times3$`, '$6+2+2=10$', '67'],
              [T`$5\times5$ + $5\times5$ + $3\times3$`, '$4+4+2=10$', '59'],
              [T`$5\times5$ + $3\times3$ + $3\times3$ + $3\times3$`, '$4+2+2+2=10$', '52'],
              [T`五层 $3\times3$`, T`$2\times5=10$`, '45'],
            ],
          },
          {
            t: 'note', md: T`**"参数更少"有个前提。** $\sum k_i^2<121$ 比较的是每一对（输入通道，输出通道）上的权重，默认堆叠的各层输入、输出通道数相同。本题第一层的输入只有 3 个通道；如果中间层都用 32 个通道，$3\times3$（3→32）加 $9\times9$（32→32）共 $3\cdot9\cdot32+32\cdot81\cdot32=83808$ 个权重，反而比 11616 多。卷面照题意列出 5 种，再加一句假设即可。`,
          },
          {
            t: 'exam', md: T`(a) Parameters $=C_{out}\,(C_{in}k^2+1)=32\times(3\times11\times11+1)=32\times364=11648$ ($11616$ weights plus $32$ biases).

(b) Stacked stride-1 convolutions with sizes $k_1,\dots,k_L$ have a receptive field of $1+\sum_i(k_i-1)$, so we need $\sum_i(k_i-1)=10$. Five stackings (besides $3\times3$ + $9\times9$): (1) $7\times7$ + $5\times5$; (2) $7\times7$ + $3\times3$ + $3\times3$; (3) $5\times5$ + $5\times5$ + $3\times3$; (4) $5\times5$ + $3\times3$ + $3\times3$ + $3\times3$; (5) five $3\times3$ layers. Assuming every layer keeps the same numbers of input and output channels, the weights per channel pair are $\sum_ik_i^2=74,\,67,\,59,\,52,\,45$, all fewer than $11^2=121$.`,
          },
        ],
        azh: T`(a) 参数 $=C_{out}\,(C_{in}k^2+1)=32\times(3\times11\times11+1)=32\times364=11648$（$11616$ 个权重加 $32$ 个 bias）。(b) 边长为 $k_1,\dots,k_L$ 的 stride 1 卷积叠起来，感受野是 $1+\sum_i(k_i-1)$，所以需要 $\sum_i(k_i-1)=10$。除 $3\times3$ + $9\times9$ 外的五种：(1) $7\times7$ + $5\times5$；(2) $7\times7$ + $3\times3$ + $3\times3$；(3) $5\times5$ + $5\times5$ + $3\times3$；(4) $5\times5$ + $3\times3$ + $3\times3$ + $3\times3$；(5) 五层 $3\times3$。假设每层输入、输出通道数相同，每对通道上的权重 $\sum_ik_i^2=74,\,67,\,59,\,52,\,45$，都少于 $11^2=121$。`,
      },
      {
        t: 'past', src: '2020 Q4(a)（据学生笔记；年份按同题 (b) 的图名推断）', marks: 4, topic: 'L13 p11–p14',
        q: 'Assume that in the following figure (a) is an image patch and (b) is a kernel that is used to perform convolution (stride = 2, no padding) on the patch. Show the output feature map after convolution.',
        qzh: '下图 (a) 是一块图像 patch，(b) 是 kernel，用它对 patch 做卷积（stride 2，无 padding）。写出卷积后的输出特征图。',
        blocks: [{ t: 'math', tex: T`\text{(a)}\ \begin{bmatrix}1&0&1&0\\0&1&1&0\\0&0&0&1\\0&0&1&0\end{bmatrix}\qquad\text{(b)}\ \begin{bmatrix}1&0\\0&1\end{bmatrix}` }],
        sol: [
          T`输出边长 $\lfloor(4-2)/2\rfloor+1=2$，所以是 $2\times2$。stride 2 时窗口互不重叠，正好把 patch 切成 4 块 $2\times2$。卷积就是窗口和 kernel 逐元素相乘再求和（L13 p12、p14）。这个 kernel 只有左上、右下两格是 1，所以每块的结果 = 该块左上格 + 右下格。`,
          {
            t: 'table', head: ['输出格', 'patch 中的块', '左上 + 右下'], rows: [
              ['(1,1)', T`第 1–2 行、第 1–2 列 $\begin{bmatrix}1&0\\0&1\end{bmatrix}$`, '$1+1=2$'],
              ['(1,2)', T`第 1–2 行、第 3–4 列 $\begin{bmatrix}1&0\\1&0\end{bmatrix}$`, '$1+0=1$'],
              ['(2,1)', T`第 3–4 行、第 1–2 列 $\begin{bmatrix}0&0\\0&0\end{bmatrix}$`, '$0+0=0$'],
              ['(2,2)', T`第 3–4 行、第 3–4 列 $\begin{bmatrix}0&1\\1&0\end{bmatrix}$`, '$0+0=0$'],
            ],
          },
          '这个 kernel 旋转 180° 后还是它自己，所以即使按"先翻转 kernel"的严格卷积定义算，结果也一样。',
          {
            t: 'exam', md: T`Output size: $\lfloor(4-2)/2\rfloor+1=2$. With stride 2 the windows are the four non-overlapping $2\times2$ blocks; each output is the sum of the element-wise product of the block with the kernel: top-left $1\cdot1+0\cdot0+0\cdot0+1\cdot1=2$, top-right $1\cdot1+0\cdot0+1\cdot0+0\cdot1=1$, bottom-left $0$, bottom-right $0\cdot1+1\cdot0+1\cdot0+0\cdot1=0$. Output feature map: $\begin{bmatrix}2&1\\0&0\end{bmatrix}$.`,
          },
        ],
        azh: T`输出尺寸：$\lfloor(4-2)/2\rfloor+1=2$。stride 2 时窗口就是四块互不重叠的 $2\times2$ 块；每个输出等于该块与 kernel 逐元素相乘后求和：左上 $1\cdot1+0\cdot0+0\cdot0+1\cdot1=2$，右上 $1\cdot1+0\cdot0+1\cdot0+0\cdot1=1$，左下 $0$，右下 $0\cdot1+1\cdot0+1\cdot0+0\cdot1=0$。输出特征图（feature map）：$\begin{bmatrix}2&1\\0&0\end{bmatrix}$。`,
      },
      {
        t: 'past', src: '2020 Q4(b)（据学生笔记）', marks: 6, topic: 'L13 p11–p15',
        q: T`Assume that (a) and (b) in the following figure are two image patches. Now consider a $3\times3$ binary weight matrix (each element of the matrix is either 0 or 1) that is used as the kernel to perform convolution (stride = 1, no padding) on the two image patches. Assume that after convolution, the output feature maps are $K_a$ and $K_b$. What kernel can make the difference between $K_a$ and $K_b$ most significant (sum of all elements of $|K_a-K_b|$ is maximum)? List two such kernels.`,
        qzh: T`下图 (a)、(b) 是两块图像 patch。用一个 $3\times3$ 的二值权重矩阵（每个元素是 0 或 1）作 kernel，分别对两块 patch 做卷积（stride 1，无 padding），输出特征图记为 $K_a$、$K_b$。什么样的 kernel 能让两者差别最大（$|K_a-K_b|$ 所有元素之和最大）？写出两个这样的 kernel。`,
        blocks: [{ t: 'math', tex: T`\text{(a)}\ \begin{bmatrix}0&1&0\\1&1&1\\0&1&0\end{bmatrix}\qquad\text{(b)}\ \begin{bmatrix}1&0&1\\0&1&0\\1&0&1\end{bmatrix}` }],
        sol: [
          {
            t: 'steps', items: [
              T`**输出只有一个数。** $3\times3$ kernel 放在 $3\times3$ patch 上、无 padding，输出边长 $3-3+1=1$。所以 $K_a=\sum_{ij}w_{ij}a_{ij}$，$K_b=\sum_{ij}w_{ij}b_{ij}$。`,
              T`**相减。** $K_a-K_b=\sum_{ij}w_{ij}(a_{ij}-b_{ij})$，其中 $a-b=\begin{bmatrix}-1&1&-1\\1&0&1\\-1&1&-1\end{bmatrix}$：四条边的中点是 $+1$，四个角是 $-1$，中心是 0。`,
              T`**挑格子。** $w_{ij}$ 只能取 0 或 1，等于"挑一些格子，把它们的 $a-b$ 加起来"。正负混着挑会互相抵消，所以绝对值最大的做法是只挑 $+1$ 的四格（和为 4）或只挑 $-1$ 的四格（和为 $-4$）；中心是 0，挑不挑都行。最大值是 4，正好有 4 个 kernel 达到（已穷举全部 $2^9=512$ 个 kernel 核对）。`,
            ],
          },
          {
            t: 'table', head: ['kernel', '$K_a$', '$K_b$', '$|K_a-K_b|$'], rows: [
              [T`$\begin{bmatrix}0&1&0\\1&0&1\\0&1&0\end{bmatrix}$`, '4', '0', '4'],
              [T`$\begin{bmatrix}0&1&0\\1&1&1\\0&1&0\end{bmatrix}$（= patch (a)）`, '5', '1', '4'],
              [T`$\begin{bmatrix}1&0&1\\0&0&0\\1&0&1\end{bmatrix}$`, '0', '4', '4'],
              [T`$\begin{bmatrix}1&0&1\\0&1&0\\1&0&1\end{bmatrix}$（= patch (b)）`, '1', '5', '4'],
            ],
          },
          {
            t: 'exam', md: T`With a $3\times3$ kernel on a $3\times3$ patch (stride 1, no padding) each output is a single number, and $K_a-K_b=\sum_{ij}w_{ij}(a_{ij}-b_{ij})$ with $a-b=\begin{bmatrix}-1&1&-1\\1&0&1\\-1&1&-1\end{bmatrix}$. Since $w_{ij}\in\{0,1\}$, $|K_a-K_b|$ is maximised (value 4) by selecting all the $+1$ entries or all the $-1$ entries; the centre entry does not matter. Two such kernels: $\begin{bmatrix}0&1&0\\1&0&1\\0&1&0\end{bmatrix}$ ($K_a=4$, $K_b=0$) and $\begin{bmatrix}1&0&1\\0&0&0\\1&0&1\end{bmatrix}$ ($K_a=0$, $K_b=4$). (The same kernels with centre 1, i.e. patches (a) and (b) themselves, also work.)`,
          },
        ],
        azh: T`$3\times3$ kernel 作用在 $3\times3$ patch 上（stride 1，无 padding），每个输出只是一个数，且 $K_a-K_b=\sum_{ij}w_{ij}(a_{ij}-b_{ij})$，其中 $a-b=\begin{bmatrix}-1&1&-1\\1&0&1\\-1&1&-1\end{bmatrix}$。由于 $w_{ij}\in\{0,1\}$，只选全部 $+1$ 的格或只选全部 $-1$ 的格时 $|K_a-K_b|$ 最大（为 4）；中心格无关紧要。两个这样的 kernel：$\begin{bmatrix}0&1&0\\1&0&1\\0&1&0\end{bmatrix}$（$K_a=4$，$K_b=0$）和 $\begin{bmatrix}1&0&1\\0&0&0\\1&0&1\end{bmatrix}$（$K_a=0$，$K_b=4$）。（把中心改成 1 的同样两个 kernel，也就是 patch (a)、(b) 本身，也可以。）`,
      },
      {
        t: 'quiz', items: [
          {
            id: 'T03-rf-stack', q: T`想用几层 stride 1 的 $3\times3$ 卷积代替一层 $7\times7$ 卷积，并保持感受野不变。需要几层？`, type: 'num', answer: 3,
            explain: T`感受野 $1+L(k-1)=1+2L$，令它等于 7，得 $L=3$。每对通道上的权重是 $3\times9=27$，比 $7^2=49$ 少。`,
          },
          {
            id: 'T03-stride', q: T`输入 $28\times28$，四边各补 1 圈 0，用一个 $3\times3$ filter 卷积，输出 $14\times14$。stride 是多少？`, type: 'num', answer: 2,
            explain: T`$\lfloor(28+2-3)/s\rfloor+1=14$，即 $\lfloor27/s\rfloor=13$。$s=1$ 得 27；$s=2$ 得 $\lfloor13.5\rfloor=13$，对得上；$s=3$ 得 9。所以 $s=2$。`,
          },
        ],
      },

      { t: 'h2', text: '8. 随机练习', id: 'practice' },
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
            q: '（Worksheet 8）把 $32\\times32\\times3$ 的图拉平，做 10 类 logistic regression（含 bias）。参数个数？', type: 'num', answer: 30730,
            explain: '拉平后每张图是 $32\\times32\\times3=3072$ 个数。10 类各有一个 3072 维权重向量：$3072\\times10=30720$；每类再加 1 个 bias，共 10 个。合计 $30720+10=30730$。它比上面的 CNN（109050）少，但不看像素之间的空间关系，worksheet 里测试准确率不到 40%，CNN 约 65%。',
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
