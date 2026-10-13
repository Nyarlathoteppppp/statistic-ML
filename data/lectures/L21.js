(function (root) {
  'use strict';
  const T = String.raw;
  root.SML.content.add(root.SML.lecture({
    id: 'L21',
    eyebrow: '单元 6 · Honorio',
    chips: ['L21 p1–p37', { text: 'L22 一般图', href: '#/L22' }, { text: 'T6 消元', href: '#/T06' }],
    lead: '在 MRF 上回答"已知某些房间的温度，其他房间的温度分布是什么"——也就是求（后验）边缘分布。树上可以用**消息传递**高效完成：从叶子往目标点逐步求和，每一步的中间结果叫一条消息。',
    oneLiner: {
      zh: '求 $P(x_k)$ 就是把其他变量全部求和掉。在树上按"从叶子往里"的顺序求和，每消掉一个变量得到一条消息 $m_{i\\to j}(x_j)$；目标点的边缘分布 ∝ 所有流入它的消息相乘。两轮传递（叶→根、根→叶）就能得到所有点的边缘分布。',
      en: T`To get a marginal $P(x_k)$ we sum the joint over all other variables. On a tree, summing from the leaves inwards turns each partial sum into a message $m_{i\to j}(x_j)=\sum_{x_i}\psi_{ij}(x_i,x_j)\prod_{k\in N(i)\setminus j}m_{k\to i}(x_i)$; the marginal of a node is proportional to the product of its incoming messages. Belief propagation computes all marginals with two passes (leaves → root, root → leaves). Evidence is handled by multiplying factors by indicators that fix the observed values.`,
    },
    why: [
      '直接对 $n$ 个二值变量求和要 $2^{n-1}$ 项。把求和号往里推、先对叶子求和，每一步只涉及一条边上的两个变量，计算量随节点数线性增长（p10–p22）。',
    ],
    defs: [
      ['inference', '已知部分变量（evidence），求其他变量的（后验）边缘分布', 'p3–p5'],
      ['tree', '任意两点之间只有一条路径的图', 'p6'],
      ['potential', '边上的正函数，例如 $\\psi_{12}(x_1,x_2)=\\exp(\\theta_{12}(x_1,x_2))$', 'p7'],
      ['message $m_{i\\to j}(x_j)$', '把 $i$ 那一侧的变量全部求和掉之后，剩下的关于 $x_j$ 的函数', 'p13–p22'],
      ['evidence', '观测值：给相关因子乘上 $\\delta(x_i,\\hat x_i)$，得到修改后的因子 $\\tilde\\psi$，再照常计算', 'p24–p27'],
      ['belief propagation', '任选根：先叶→根传消息，再根→叶传消息，之后每个点的边缘分布都能算', 'p28–p35'],
      ['loopy BP', '在有环的图上直接用 BP，结果只是近似', 'p36'],
    ],
    formulas: [
      {
        t: 'fx', title: '消息与边缘分布（L21 p22–p23）',
        tex: T`m_{i\to j}(x_j)=\sum_{x_i}\htmlClass{fx-p1}{\psi_{ij}(x_i,x_j)}\htmlClass{fx-p2}{\prod_{k\in N(i)\setminus\{j\}}m_{k\to i}(x_i)}\qquad \htmlClass{fx-p3}{P(x_i)\propto\prod_{k\in N(i)}m_{k\to i}(x_i)}`,
        intro: 'Observation 1：发出的消息 = 收到的消息 × "要发出那条边"上的势函数，再对自己求和。Observation 2：边缘分布 = 收到的所有消息相乘。',
        parts: [
          { label: 'outgoing potential', note: '发送方 $i$ 和接收方 $j$ 之间那条边的势函数。' },
          { label: 'incoming messages', note: '$i$ 从**除了 $j$ 以外**的所有邻居收到的消息。叶子没有其他邻居，这一项为空，所以 $m_{5\\to4}(x_4)=\\sum_{x_5}\\psi_{45}(x_4,x_5)$。' },
          { label: 'marginal', note: '一个点的边缘分布 ∝ 它从所有邻居收到的消息之积；最后再归一化让概率和为 1（p10）。' },
        ],
      },
    ],
    examples: [
      '课件的树（p8）：边 $x_1$—$x_2$，$x_2$—$x_3$，$x_2$—$x_4$，$x_4$—$x_5$，$P\\propto\\psi_{12}\\psi_{23}\\psi_{24}\\psi_{45}$。求 $P(x_4)$：',
      {
        t: 'steps', items: [
          T`叶子先发：$m_{5\to4}(x_4)=\sum_{x_5}\psi_{45}(x_4,x_5)$，$m_{1\to2}(x_2)=\sum_{x_1}\psi_{12}(x_1,x_2)$，$m_{3\to2}(x_2)=\sum_{x_3}\psi_{23}(x_2,x_3)$。`,
          T`$x_2$ 收齐了 $x_1,x_3$ 的消息，再发给 $x_4$：$m_{2\to4}(x_4)=\sum_{x_2}\psi_{24}(x_2,x_4)\,m_{1\to2}(x_2)\,m_{3\to2}(x_2)$。`,
          T`$P(x_4)\propto m_{2\to4}(x_4)\,m_{5\to4}(x_4)$，最后归一化。`,
        ],
      },
      { t: 'note', md: '课件只给了一个数值：$\\theta_{12}=\\begin{bmatrix}2&-2\\\\-1&5\\end{bmatrix}$（$\\theta_{12}(1,-1)=-2$），消息都没有代数字计算（p7）。考试更可能让你**写出消息的表达式**，而不是算数。' },
    ],
    compare: [{
      t: 'table', head: ['', '树（L21）', '一般图（L22）'], rows: [
        ['方法', '直接在原图上传消息（BP）', '先消元 → 极大团 → junction tree，再在团上传消息'],
        ['消息的变量', '一个变量 $x_j$', 'separator 里的变量'],
        ['结果', '精确', '精确（直接在环上用 BP 则是近似）'],
      ],
    }],
    pitfalls: [
      ['发消息时把接收方发来的消息也乘进去', '只乘**除了接收方以外**的邻居的消息'],
      ['观测变量要单独处理', '给因子乘指示函数，然后算法完全不变（p24）'],
      ['每算一条消息都要归一化', '可以最后统一归一化（p10）'],
    ],
    types: ['T06'],
    quiz: [
      { q: '树 $A$—$B$—$C$，要求 $P(B)$。需要哪两条消息？', type: 'show', answerText: '$m_{A\\to B}(x_B)=\\sum_{x_A}\\psi_{AB}$ 和 $m_{C\\to B}(x_B)=\\sum_{x_C}\\psi_{BC}$；$P(B)\\propto m_{A\\to B}\\,m_{C\\to B}$。' },
      {
        q: 'Belief propagation 需要几轮消息传递才能得到所有节点的边缘分布？', options: ['1 轮', '2 轮（叶→根，根→叶）', '每个节点各一轮'], answer: 1,
        explain: 'L21 p29：第一轮结束时根已收到所有信息；第二轮把信息发回去，其他节点也就都有了。',
      },
    ],
  }));
})(window);
