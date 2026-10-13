(function (root) {
  'use strict';
  const T = String.raw;
  root.SML.content.add(root.SML.lecture({
    id: 'L13',
    eyebrow: '单元 4 · Jiang · 参数计数 2/3 卷',
    chips: ['L13 p1–p30', { text: 'T3 CNN 参数', href: '#/T03' }],
    lead: 'CNN = 卷积层（共享权重的小 filter）+ pooling + 全连接。考试几乎一定考参数计数（[T3](#/T03)），简答可能问为什么用卷积 / pooling。',
    oneLiner: {
      zh: '卷积层用同一个小 filter 扫过整张图（weight sharing），参数只和 filter 大小、通道数有关；pooling 降分辨率、无参数；两者一起带来有限的平移不变性。',
      en: T`A CNN applies small learned filters across the whole input with shared weights, so a convolutional layer has $C_{out}C_{in}K^2$ weights regardless of image size; max pooling downsamples without parameters. Weight sharing plus pooling gives (limited) translation invariance and acts as a regulariser compared with fully connected layers.`,
    },
    why: [
      '把图像展平喂给全连接网络会丢掉空间结构，同一个图案在不同位置要重复学，参数还多、容易过拟合（p3–p5）。卷积用一个 filter 在所有位置检测同一种局部图案（p6）。',
    ],
    defs: [
      ['filter / kernel', '小的可学习权重矩阵（与 SVM 的 kernel 无关）', 'p10、p14'],
      ['feature map', '一个 filter 扫完整个输入得到的响应图', 'p16'],
      ['stride / padding', '每次滑动的步长 / 边界补零', 'p17'],
      ['channels', '输入通道（RGB = 3）；输出通道数 = filter 个数', 'p17–p18'],
      ['max pooling', '$m\\times m$ 区域取最大值；反向只把梯度给最大值位置（sub-gradient）', 'p23'],
      ['receptive field', '高层单元能"看到"的输入范围，层越深越大', 'p26'],
    ],
    formulas: [
      { t: 'math', tex: T`\text{params}=C_{out}\,C_{in}\,K^2\ (+C_{out}),\qquad \text{out}=\Big\lfloor\frac{H+2P-K}{S}\Big\rfloor+1` },
      '课件例子（p17）：$32\\times32\\times1$ 输入，6 个 $5\\times5$ filter，stride 1 → $28\\times28\\times6$，权重 150（+6 bias）。',
    ],
    compare: [{
      t: 'table', head: ['', '全连接', '卷积'], rows: [
        ['每个输出单元看', '全部输入', '局部 patch'],
        ['权重', '每条边独立', '同一 filter 共享'],
        ['参数量', '$n_{in}n_{out}$', '$C_{out}C_{in}K^2$'],
        ['平移不变性', '无', '有（配合 pooling）'],
      ],
    }],
    examples: [
      { t: 'ul', items: ['LeNet-5：C（卷积）→ S（下采样）→ … → F（全连接）（p21）。', 'ResNet：residual connection 把输入直接加到输出，缓解梯度消失，可训练 152 层（p28）。', '迁移学习：大数据集预训练，小任务上 fine-tune（p28）。', '1D 卷积也能用于文本，捕捉相邻词的模式（p29）。'] },
    ],
    pitfalls: [
      ['卷积层参数 = 输出单元数 × filter 大小', '权重共享，与输出位置数无关'],
      ['多通道时 filter 只看一个通道', '每个 filter 覆盖所有输入通道：$C_{in}K^2$ 个权重'],
      ['pooling 有参数', 'max pooling 没有参数'],
    ],
    types: ['T03'],
    quiz: [
      { q: 'RGB 输入，10 个 $3\\times3$ filter，含 bias 的参数个数？', type: 'num', answer: 280, explain: '$10\\times3\\times9+10=280$。' },
      { q: '为什么说卷积是一种正则化？', type: 'show', answerText: '它强制不同位置共享同一组权重，大大减少自由参数，限制了模型的表达能力，从而减少过拟合（L13 p25）。' },
    ],
  }));
})(window);
