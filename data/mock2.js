/* 新题模考：每道题对应一个高频题型，但换了图和数字，网站其他页面没有这些题的答案。
 * 所有答案都由 js/core 计算并在 tests/core.test.js 之外单独核对过（见 COURSE_MAP §9 记录）。 */
(function (root) {
  'use strict';
  const SML = root.SML;
  const T = String.raw;

  /* --- tiny SVG helpers (pure strings, no DOM) --- */
  function graphSvg(nodes, edges, directed, w, h) {
    const r = 17;
    const mk = directed ? '<defs><marker id="arrM2" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>' : '';
    const lines = edges.map(([a, b]) => {
      const p = nodes[a], q = nodes[b], dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy);
      const x1 = p[0] + dx / L * r, y1 = p[1] + dy / L * r, x2 = q[0] - dx / L * (r + (directed ? 2 : 0)), y2 = q[1] - dy / L * (r + (directed ? 2 : 0));
      return '<line class="edge" x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '"' + (directed ? ' marker-end="url(#arrM2)"' : '') + '/>';
    }).join('');
    const circles = Object.keys(nodes).map((k) => '<g class="node"><circle cx="' + nodes[k][0] + '" cy="' + nodes[k][1] + '" r="' + r + '"/><text x="' + nodes[k][0] + '" y="' + nodes[k][1] + '">' + k + '</text></g>').join('');
    return '<svg class="graph" viewBox="0 0 ' + w + ' ' + h + '" style="max-width:300px">' + mk + lines + circles + '</svg>';
  }

  function planeSvg(points, boundaryX) {
    const S = 30, O = 30, X = (v) => O + v * S, Y = (v) => O + (10 - v) * S;
    let g = '';
    for (let i = 0; i <= 10; i++) {
      g += '<line class="gridline" x1="' + X(i) + '" y1="' + Y(0) + '" x2="' + X(i) + '" y2="' + Y(10) + '"/>';
      g += '<line class="gridline" x1="' + X(0) + '" y1="' + Y(i) + '" x2="' + X(10) + '" y2="' + Y(i) + '"/>';
      g += '<text class="tick" x="' + X(i) + '" y="' + (Y(0) + 16) + '">' + i + '</text><text class="tick" x="' + (X(0) - 14) + '" y="' + Y(i) + '">' + i + '</text>';
    }
    g += '<line class="boundary" x1="' + X(boundaryX) + '" y1="' + Y(-0.2) + '" x2="' + X(boundaryX) + '" y2="' + Y(10.2) + '"/>';
    points.forEach((p) => {
      g += p.y < 0
        ? '<circle class="neg" cx="' + X(p.x[0]) + '" cy="' + Y(p.x[1]) + '" r="11"/>'
        : '<rect class="pos" x="' + (X(p.x[0]) - 11) + '" y="' + (Y(p.x[1]) - 11) + '" width="22" height="22"/>';
      g += '<text x="' + X(p.x[0]) + '" y="' + Y(p.x[1]) + '">' + p.id + '</text>';
    });
    return '<svg class="plane" viewBox="0 0 360 370" style="max-width:320px">' + g + '</svg>';
  }

  function cnnSvg() {
    const layers = [9, 6, 3, 2], W = 420, gapY = 80;
    const pos = layers.map((n, li) => Array.from({ length: n }, (_, i) => [W / 2 + (i - (n - 1) / 2) * 42, 300 - li * gapY]));
    let s = '';
    // convolution: unit j sees inputs j..j+3
    for (let j = 0; j < 6; j++) for (let k = 0; k < 4; k++) s += '<line x1="' + pos[0][j + k][0] + '" y1="' + (pos[0][j + k][1] - 12) + '" x2="' + pos[1][j][0] + '" y2="' + (pos[1][j][1] + 12) + '"/>';
    // fully connected (partially drawn, like the exam figure)
    [[0, 0], [5, 2], [4, 2], [3, 2]].forEach(([a, b]) => { s += '<line x1="' + pos[1][a][0] + '" y1="' + (pos[1][a][1] - 12) + '" x2="' + pos[2][b][0] + '" y2="' + (pos[2][b][1] + 12) + '"/>'; });
    [[0, 0], [2, 1]].forEach(([a, b]) => { s += '<line x1="' + pos[2][a][0] + '" y1="' + (pos[2][a][1] - 12) + '" x2="' + pos[3][b][0] + '" y2="' + (pos[3][b][1] + 12) + '"/>'; });
    pos.forEach((L) => L.forEach(([x, y]) => { s += '<circle cx="' + x + '" cy="' + y + '" r="12"/>'; }));
    s += '<text x="' + (W - 10) + '" y="' + (300 - gapY + 4) + '" text-anchor="end">Convolutional</text>';
    s += '<text x="' + (W - 10) + '" y="' + (300 - 2 * gapY + 4) + '" text-anchor="end">Fully connected …</text>';
    s += '<text x="' + (W - 10) + '" y="' + (300 - 3 * gapY + 4) + '" text-anchor="end">Fully connected …</text>';
    return '<svg class="net" viewBox="0 0 ' + W + ' 330" style="max-width:420px">' + s + '</svg>';
  }

  const SVM_PTS = [
    { id: 1, x: [1, 5], y: -1 }, { id: 2, x: [3, 8], y: -1 }, { id: 5, x: [3, 2], y: -1 },
    { id: 3, x: [9, 9], y: 1 }, { id: 4, x: [8, 1], y: 1 }, { id: 6, x: [7, 5], y: 1 },
  ];
  const BN = { A: [60, 35], B: [190, 35], C: [125, 110], D: [255, 110], E: [190, 185], F: [190, 260] };
  const MRF = { A: [150, 30], B: [75, 105], C: [225, 105], D: [150, 180], E: [300, 180], F: [225, 255] };
  const VC_ROWS = ['11000', '00101', '01001', '00010', '10101', '10010', '00111', '10011', '11110'];

  const Q = (src, marks, q, extra, sol, qzh, azh) => ({ t: 'past', src: src, marks: marks, q: q, qzh: qzh, azh: azh, blocks: extra || [], sol: sol });

  SML.content.add({
    id: 'mock2',
    title: '新题模考（没见过的题）',
    lead: '和 2026 practice 卷结构相同、题型相同，但**图和数字全部换过**，网站其他页面没有这些题的答案，所以能测出你是不是真的会做，而不是记住了答案。限时 50 分钟，闭卷，不用计算器；做完再展开"查看完整解答"。',
    blocks: [
      { t: 'viz', id: 'mock-timer', opts: { minutes: 50 } },
      { t: 'warn', md: '**先别展开解答。** 在纸上写完整的英文答案，时间到再逐题对照、打分。得分 ≥ 25 / 50 刚好达到 hurdle（一半）；考场上会紧张、题目也会更新，所以目标是 **≥ 35** 才算有余量（见文末评分表）。' },

      { t: 'h2', text: 'Section A [10 marks]', id: 'a' },
      Q('A1(a)', 2, 'In words or a mathematical expression, what is the difference between the MLE and the MAP estimate of a parameter $\\theta$?', null, [
        { t: 'exam', md: T`MLE maximises the likelihood, $\hat\theta_{\rm MLE}=\arg\max_\theta p(D\mid\theta)$; MAP maximises the posterior, $\hat\theta_{\rm MAP}=\arg\max_\theta p(D\mid\theta)\,p(\theta)$, i.e. it adds the log prior (acting as a regulariser). With a uniform prior they coincide.` },
        '评分要点：两个公式各 1 分；提到"MAP 多了先验"即可。见 [L02](#/L02)。',
      ],
      T`用文字或数学表达式回答：参数 $\theta$ 的最大似然估计（MLE）和最大后验估计（MAP estimate）有什么区别？`,
      T`MLE 最大化似然（likelihood），$\hat\theta_{\rm MLE}=\arg\max_\theta p(D\mid\theta)$；MAP 最大化后验（posterior），$\hat\theta_{\rm MAP}=\arg\max_\theta p(D\mid\theta)\,p(\theta)$，也就是多加了对数先验（log prior）这一项，相当于一个正则化项（regulariser）。先验为均匀先验（uniform prior）时，两者相同。`),
      Q('A1(b)', 2, 'Explain why a convolutional layer usually has far fewer parameters than a fully connected layer with the same number of inputs and outputs.', null, [
        { t: 'exam', md: T`A convolutional layer applies the same small filter at every position (weight sharing) and each output depends only on a local patch, so its parameter count depends on the filter size and number of channels, not on the input size; a fully connected layer has a separate weight for every input–output pair.` },
        '评分要点："weight sharing" + "local connectivity"。见 [T3](#/T03)。',
      ],
      T`解释为什么在输入和输出数量相同的情况下，卷积层（convolutional layer）的参数通常远少于全连接层（fully connected layer）。`,
      T`卷积层在每个位置都使用同一个小滤波器（filter），即权重共享（weight sharing），并且每个输出只依赖一个局部区域（local patch），所以它的参数数量取决于滤波器大小和通道（channel）数，而不取决于输入大小；全连接层则为每一对输入–输出都设一个单独的权重。`),
      Q('A1(c)', 3, 'The figure shows a dataset with the hard-margin linear SVM decision boundary $x_1=5$ (circles = class −1 on the left, squares = class +1 on the right). Which points (by index) are the support vectors? What is the margin (distance from the boundary to the closest points)?',
        [{ t: 'html', html: planeSvg(SVM_PTS, 5) }], [
          { t: 'table', head: ['点', '坐标', '到 $x_1=5$ 的距离'], rows: [['1', '(1,5)', '4'], ['2', '(3,8)', '**2**'], ['5', '(3,2)', '**2**'], ['3', '(9,9)', '4'], ['4', '(8,1)', '3'], ['6', '(7,5)', '**2**']] },
          { t: 'exam', md: T`Support vectors: points **2, 5 and 6**, the closest points to the boundary on each side (distance 2); the margin is 2 (in canonical form $\mathbf w=(0.5,0)$, $b=-2.5$, so $1/\|\mathbf w\|=2$).` },
          '易错：只选 2 和 6，漏掉同样距离为 2 的点 5。',
        ],
        T`图中是一个数据集，以及硬间隔线性 SVM（hard-margin linear SVM）的决策边界（decision boundary）$x_1=5$（圆圈 = 左侧的 −1 类，方块 = 右侧的 +1 类）。哪些点（用编号表示）是支持向量（support vectors）？间隔（margin）是多少，即边界到最近点的距离是多少？`,
        T`支持向量（support vectors）：点 **2、5 和 6**，它们是每一侧离边界最近的点（距离为 2）；间隔（margin）为 2（在规范形式（canonical form）下 $\mathbf w=(0.5,0)$，$b=-2.5$，所以 $1/\|\mathbf w\|=2$）。`),
      Q('A1(d)', 3, 'How many parameters (excluding biases) does the network below have? The convolutional layer uses a single shared filter; all of its connections are drawn, while the fully connected layers are only partially drawn ("…").',
        [{ t: 'html', html: cnnSvg() }], [
          { t: 'steps', items: ['数单元：输入 9 → 卷积 6 → 全连接 3 → 输出 2。', '每个卷积单元连 4 个相邻输入 ⇒ filter 宽 4；检查 $9-4+1=6$ ✓。卷积参数 = **4**（共享）。', '全连接：$6\\times3=18$，$3\\times2=6$。', '合计 $4+18+6=$ **28**。'] },
          '易错：卷积算成 $6\\times4=24$（不共享），总数会变成 48。',
        ],
        T`下面这个网络有多少个参数？不计偏置（biases）。卷积层（convolutional layer）使用单个共享的滤波器（filter），它的所有连接都画出来了；而全连接层（fully connected layers）只画了一部分（“…”）。`),

      { t: 'h2', text: 'Section B [30 marks]', id: 'b' },
      Q('B2', 6, 'A 4-armed bandit with binary rewards. So far: Arm 1 pulled 81 times with 60 rewards; Arm 2 pulled 4 times with 3 rewards; Arm 3 pulled 4 times with 1 reward; Arm 4 never pulled. Unpulled arms have value $Q_0=+\\infty$. (a) Using UCB, which arm is pulled next? (b) If Arm 4 did not exist, compute the UCB value of each arm and state which arm is pulled. *($\\ln 89\\approx4.5$, $\\ln 90\\approx4.5$, $\\ln 4\\approx1.4$, $\\ln 81\\approx4.4$; $Q_{t-1}(i)=\\hat\\mu_{t-1}(i)+\\sqrt{2\\ln t/N_{t-1}(i)}$.)*', null, [
        '(a) Arm 4 没拉过，$Q=Q_0=+\\infty$，一定选 **Arm 4**。',
        '(b) $t=81+4+4+1=90$，$2\\ln t\\approx9$：',
        { t: 'table', head: ['', 'Arm 1', 'Arm 2', 'Arm 3'], rows: [['$\\hat\\mu$', '$60/81\\approx0.741$', '$3/4=0.75$', '$1/4=0.25$'], ['bonus', '$\\sqrt{9/81}=1/3$', '$\\sqrt{9/4}=1.5$', '$1.5$'], ['$Q$', '$\\approx1.074$', '**2.25**', '1.75']] },
        { t: 'exam', md: T`(a) Arm 4, since an unpulled arm has $Q_0=+\infty$. (b) $t=90$: $Q_1\approx0.741+1/3\approx1.07$, $Q_2=0.75+1.5=2.25$, $Q_3=0.25+1.5=1.75$; pull Arm 2, which has the highest upper confidence bound (a good mean and a large exploration bonus from only 4 pulls).` },
        '易错：(b) 里 $t$ 仍然是 90（总共拉了 89 次），不是 4 或 81。',
      ],
      T`一个奖励为二值（binary rewards）的 4 臂老虎机（4-armed bandit）。到目前为止：臂 1（Arm 1）拉了 81 次，得到 60 次奖励；臂 2 拉了 4 次，得到 3 次奖励；臂 3 拉了 4 次，得到 1 次奖励；臂 4 从未拉过。没拉过的臂取值 $Q_0=+\infty$。(a) 用 UCB，下一步拉哪个臂？(b) 如果臂 4 不存在，计算每个臂的 UCB 值，并说明拉哪个臂。*($\ln 89\approx4.5$, $\ln 90\approx4.5$, $\ln 4\approx1.4$, $\ln 81\approx4.4$; $Q_{t-1}(i)=\hat\mu_{t-1}(i)+\sqrt{2\ln t/N_{t-1}(i)}$.)*`,
      T`(a) 臂 4（Arm 4），因为没拉过的臂 $Q_0=+\infty$。(b) $t=90$：$Q_1\approx0.741+1/3\approx1.07$，$Q_2=0.75+1.5=2.25$，$Q_3=0.25+1.5=1.75$；拉臂 2，它的置信上界（upper confidence bound）最高：均值不错，而且只拉了 4 次，探索奖励（exploration bonus）很大。`),
      Q('B3', 8, 'Five points $x_1,\\dots,x_5$; the classifier family $\\mathcal G$ produces exactly the dichotomies below. Calculate $\\mathrm{VC}(\\mathcal G)$ and show a corresponding shattered set.',
        [{ t: 'table', cls: 'mono compact', head: ['$x_1$', '$x_2$', '$x_3$', '$x_4$', '$x_5$'], rows: VC_ROWS.map((r) => r.split('')) }], [
          '9 行 ⇒ $\\VC\\le\\lfloor\\log_2 9\\rfloor=3$。找 3 元集：',
          { t: 'table', cls: 'mono compact', head: ['行', '$(x_1,x_3,x_4)$'], rows: [['1', '100'], ['2', '010'], ['3', '000'], ['4', '001'], ['5', '110'], ['6', '101'], ['7', '011'], ['8', '101 ✗重复'], ['9', '111']] },
          '去重后 8 种组合全齐 ⇒ $\\{x_1,x_3,x_4\\}$ 被 shatter，$\\VC(\\mathcal G)=3$（4 个点至少要 16 行，不可能）。这也是唯一被 shatter 的 3 元集。',
          { t: 'exam', md: T`$\mathrm{VC}(\mathcal G)=3$. Restricted to $(x_1,x_3,x_4)$ the dichotomies give $100,010,000,001,110,101,011,111$ — all $2^3=8$ labellings — so $\{x_1,x_3,x_4\}$ is shattered. No set of 4 points can be shattered because there are only 9 < 16 dichotomies.` },
        ],
        T`五个点 $x_1,\dots,x_5$；分类器族（classifier family）$\mathcal G$ 恰好产生下表中的这些二分（dichotomies）。计算 $\mathrm{VC}(\mathcal G)$，并给出一个相应的被打散（shattered）的点集。`,
        T`$\mathrm{VC}(\mathcal G)=3$。把这些二分（dichotomies）限制到 $(x_1,x_3,x_4)$ 上，得到 $100,010,000,001,110,101,011,111$——全部 $2^3=8$ 种标注（labellings）——所以 $\{x_1,x_3,x_4\}$ 被打散（shattered）。任何 4 个点的集合都不可能被打散，因为总共只有 9 < 16 个二分。`),
      Q('B4', 8, 'Consider the Bayesian network below. (a) Does $A\\perp D\\mid B$ hold? (b) Does $A\\perp D\\mid F$ hold? Justify using the ancestral moral graph.',
        [{ t: 'html', html: graphSvg(BN, [['A', 'C'], ['B', 'C'], ['C', 'E'], ['D', 'E'], ['E', 'F']], true, 310, 290) }], [
          '边：$A\\to C$，$B\\to C$，$C\\to E$，$D\\to E$，$E\\to F$。',
          '(a) $\\{A,D,B\\}$ 都没有父节点，祖先图就是这三个点，**没有边** ⇒ 分离 ⇒ $A\\perp D\\mid B$ **成立**。',
          '(b) $F$ 的祖先是全部 6 个点。结婚：$A$—$B$（$C$ 的父母），$C$—$D$（$E$ 的父母）。删掉 $F$ 后路径 $A$—$C$—$D$ 仍在 ⇒ **不成立**。',
          { t: 'exam', md: T`(a) Yes: the ancestral graph of $\{A,D,B\}$ contains only $A,B,D$ and no edges, so $A$ and $D$ are separated given $B$. (b) No: the ancestral graph of $\{A,D,F\}$ is the whole network; moralising adds $A$–$B$ and $C$–$D$; after removing $F$ the path $A$–$C$–$D$ remains, so $A\perp D\mid F$ does not hold (observing $F$, a descendant of the collider $E$, couples $C$ and $D$).` },
          '易错：(a) 想当然地认为"$A$ 和 $D$ 通过 $C,E$ 相连，所以不独立"——没观测 collider（或其后代）时，它不在祖先图里。',
        ],
        T`考虑下面的贝叶斯网络（Bayesian network）。(a) $A\perp D\mid B$ 是否成立？(b) $A\perp D\mid F$ 是否成立？用祖先道德图（ancestral moral graph）说明理由。`,
        T`(a) 成立：$\{A,D,B\}$ 的祖先图（ancestral graph）只包含 $A,B,D$，且没有边，所以给定 $B$ 时 $A$ 和 $D$ 被分离。(b) 不成立：$\{A,D,F\}$ 的祖先图是整个网络；道德化（moralising）加上 $A$–$B$ 和 $C$–$D$ 两条边；删去 $F$ 后路径 $A$–$C$–$D$ 仍然存在，所以 $A\perp D\mid F$ 不成立（观测到对撞节点（collider）$E$ 的后代 $F$，会使 $C$ 和 $D$ 产生关联）。`),
      Q('B5', 8, 'For the Markov random field below, use the elimination order $A, F, B, C, D, E$. Give the fill-in edges and the cliques of the junction tree.',
        [{ t: 'html', html: graphSvg(MRF, [['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'D'], ['C', 'E'], ['D', 'F'], ['E', 'F']], false, 340, 285) }], [
          '边：$A$—$B$，$A$—$C$，$B$—$D$，$C$—$D$，$C$—$E$，$D$—$F$，$E$—$F$。',
          { t: 'table', head: ['删', '当前邻居', 'fill-in', '团'], rows: [['$A$', '$B,C$', '$B$—$C$', '$\\{A,B,C\\}$'], ['$F$', '$D,E$', '$D$—$E$', '$\\{D,E,F\\}$'], ['$B$', '$C,D$（$C$ 来自 fill-in）', '无（$C$—$D$ 已有）', '$\\{B,C,D\\}$'], ['$C$', '$D,E$', '无（$D$—$E$ 已加）', '$\\{C,D,E\\}$'], ['$D$', '$E$', '无', '$\\{D,E\\}$ ⊂'], ['$E$', '—', '无', '$\\{E\\}$ ⊂']] },
          { t: 'exam', md: T`Fill-in edges: $B$–$C$ (eliminating $A$) and $D$–$E$ (eliminating $F$). Junction-tree cliques: $\{A,B,C\}$, $\{D,E,F\}$, $\{B,C,D\}$, $\{C,D,E\}$ (a chain with separators $\{B,C\}$, $\{C,D\}$, $\{D,E\}$).` },
        ],
        T`对于下面的马尔可夫随机场（Markov random field），使用消元顺序（elimination order）$A, F, B, C, D, E$。给出填充边（fill-in edges）以及联结树（junction tree）的团（cliques）。`,
        T`填充边（fill-in edges）：$B$–$C$（消去 $A$ 时产生）和 $D$–$E$（消去 $F$ 时产生）。联结树（junction tree）的团（cliques）：$\{A,B,C\}$、$\{D,E,F\}$、$\{B,C,D\}$、$\{C,D,E\}$（构成一条链，分隔集（separators）为 $\{B,C\}$、$\{C,D\}$、$\{D,E\}$）。`),

      { t: 'h2', text: 'Section C [10 marks]', id: 'c' },
      Q('C6', 10, 'A clinic wants a model for a disease $D$. Being old ($O$) makes the disease more likely. The disease causes fever ($F$) and cough ($C$), and a lab test ($T$) is positive more often when the disease is present. All variables are binary. (a) Draw a directed PGM over $O,D,F,C,T$. [3] (b) How many CPTs are needed, what are their dimensions, and how many free parameters are there in total? Compare with the full joint table. [3] (c) Six patients were observed with $(D,T)$ = (1,1), (1,1), (1,0), (0,0), (0,0), (0,1). Give the MLE of $P(T=1\\mid D)$. [2] (d) What would the CPT of $T$ look like if the test were perfect? [2]', null, [
          '(a) 因 → 果：$O\\to D$，$D\\to F$，$D\\to C$，$D\\to T$。（年龄影响患病；疾病导致症状和检测结果。箭头从"原因"指向"被它影响的观测"。）',
          {
            t: 'html', html: graphSvg({ O: [150, 30], D: [150, 110], F: [60, 195], C: [150, 195], T: [240, 195] }, [['O', 'D'], ['D', 'F'], ['D', 'C'], ['D', 'T']], true, 300, 225),
          },
          '(b) 5 张 CPT：$P(O)$ 为 $2\\times1$；$P(D\\mid O)$、$P(F\\mid D)$、$P(C\\mid D)$、$P(T\\mid D)$ 各为 $2\\times2$。自由参数 $1+2+2+2+2=$ **9**；全联合表 $2^5-1=$ **31** 个。',
          '(c) $D=1$ 的 3 人里 $T=1$ 有 2 人 ⇒ $\\hat P(T{=}1\\mid D{=}1)=2/3$；$D=0$ 的 3 人里 $T=1$ 有 1 人 ⇒ $\\hat P(T{=}1\\mid D{=}0)=1/3$。',
          '(d) 确定性：$P(T{=}1\\mid D{=}1)=1$，$P(T{=}1\\mid D{=}0)=0$（全是 0/1）。其他表不受影响。',
          { t: 'exam', md: T`(a) $O\to D$, $D\to F$, $D\to C$, $D\to T$; joint $P(O)P(D\mid O)P(F\mid D)P(C\mid D)P(T\mid D)$.
(b) Five CPTs: $P(O)$ is $2\times1$; the other four are $2\times2$. Free parameters $1+2+2+2+2=9$, versus $2^5-1=31$ for the full joint.
(c) $\hat P(T=1\mid D=1)=2/3$, $\hat P(T=1\mid D=0)=1/3$ (relative frequencies within each parent value).
(d) The CPT of $T$ becomes deterministic: $P(T=1\mid D=1)=1$ and $P(T=1\mid D=0)=0$.` },
          '对照：这和山火题是同一套路（[T7](#/T07/bushfire)）——画因果箭头、数表、数数做 MLE、"完美/准确" ⇒ 0/1 的 CPT。',
        ],
        T`一家诊所想为疾病 $D$ 建模。年老（$O$）会使患病的可能性更大。该疾病会导致发烧（$F$）和咳嗽（$C$），并且患病时化验检测 $T$（lab test）更常呈阳性。所有变量都是二值的（binary）。(a) 画出关于 $O,D,F,C,T$ 的有向 PGM（directed PGM）。[3] (b) 需要多少个 CPT（条件概率表），它们的维度是多少，总共有多少个自由参数（free parameters）？与完整联合概率表（full joint table）比较。[3] (c) 观测到 6 名病人，其 $(D,T)$ = (1,1), (1,1), (1,0), (0,0), (0,0), (0,1)。给出 $P(T=1\mid D)$ 的最大似然估计（MLE）。[2] (d) 如果检测是完美的，$T$ 的 CPT 会是什么样？[2]`,
        T`(a) $O\to D$，$D\to F$，$D\to C$，$D\to T$；联合分布（joint）为 $P(O)P(D\mid O)P(F\mid D)P(C\mid D)P(T\mid D)$。
(b) 五张 CPT：$P(O)$ 是 $2\times1$；其余四张都是 $2\times2$。自由参数（free parameters）共 $1+2+2+2+2=9$ 个，而完整联合分布（full joint）需要 $2^5-1=31$ 个。
(c) $\hat P(T=1\mid D=1)=2/3$，$\hat P(T=1\mid D=0)=1/3$（在父节点的每个取值内部计算相对频率（relative frequencies））。
(d) $T$ 的 CPT 变成确定性的（deterministic）：$P(T=1\mid D=1)=1$，$P(T=1\mid D=0)=0$。`),

      { t: 'h2', text: '评分', id: 'score' },
      {
        t: 'table', head: ['得分（/50）', '含义', '下一步'], rows: [
          ['≥ 35', '稳过', '练 [T13 简答](#/T13) 加分'],
          ['25–34', '刚好过线，没有余量', '错题对应的题型页，把随机练习做到连续 3 题全对'],
          ['< 25', '有挂科风险', '先回 [零基础入门](#/primer)，再从 T1、T2、T3 的入门题开始'],
        ],
      },
    ],
  });

  SML.catalog.meta.mock2 = { title: '新题模考（推荐）', countable: false };
  SML.catalog.meta.mock = { title: '原卷复现（2026 practice）', countable: false };
  const guide = SML.catalog.zones[0].items;
  guide.splice(guide.indexOf('mock'), 0, 'mock2');
})(window);
