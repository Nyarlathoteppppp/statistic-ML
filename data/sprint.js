/* 两天必拿分 (in fact a day and a half): the final workbook, one page in strict priority order.
 * Each item = routine to memorise (套路 + 卷面写法) + this year's question + one random question.
 * Questions and solutions are shared with the T-pages, not copied: a renamed source throws at load and tests/site.check.js reports it.
 * Ticks live in this browser only (SML.store key 'checklist', { itemId: true }), so item ids must stay stable.
 * Order: tier first (1 the teacher's mock, 2 this year's quizzes, pinned first, then other workshop handwritten exercises, 3 last year's practice and core short answers, 4 older papers), the user's explicit rule.
 * The ledger groups items into time segments (a full day, a half day, spare time, 30 minutes before leaving); DAY1 lists the tier-2 items that fit into the full day.
 * Inside a tier the order is computed from each item's estimate: p (chance it appears, per question when qs > 1) x m (marks on a real paper) x q (chance of getting it right) / hours.
 * m comes from reference/PASTPAPER_MAP.md and the papers; p and q are judgement calls.
 * Coverage figures and the day split in the note were counted by hand from those papers; recount when items or estimates change. */
(function (root) {
  'use strict';
  const T = String.raw;
  const SML = root.SML;

  function past(page, prefix) {
    const hit = SML.content.get(page).blocks.find((b) => b && b.t === 'past' && String(b.src).indexOf(prefix) === 0);
    if (!hit) throw new Error('sprint: no past question ' + page + ' ' + prefix);
    return hit;
  }
  function section(page, id) {
    const bs = SML.content.get(page).blocks;
    const i = bs.findIndex((b) => b && b.t === 'h2' && b.id === id);
    if (i < 0) throw new Error('sprint: no section ' + page + '#' + id);
    const j = bs.findIndex((b, k) => k > i && b && b.t === 'h2');
    return bs.slice(i + 1, j < 0 ? undefined : j);
  }
  // the blocks under an h3, up to the next heading
  function under(page, text) {
    const bs = SML.content.get(page).blocks;
    const i = bs.findIndex((b) => b && b.t === 'h3' && String(b.text).indexOf(text) === 0);
    if (i < 0) throw new Error('sprint: no h3 ' + page + ' ' + text);
    const j = bs.findIndex((b, k) => k > i && b && (b.t === 'h2' || b.t === 'h3'));
    return bs.slice(i + 1, j < 0 ? undefined : j);
  }
  const ofType = (blocks, ...types) => blocks.filter((b) => b && types.indexOf(b.t) >= 0);
  const pick = (...cq) => ({ t: 'canvasQuiz', pick: cq });
  const random = (gen, title) => ({ t: 'practice', gen: gen, title: title });
  const routine = (md) => ({ t: 'good', title: '套路（背下来）', md: md });
  const phrase = (md) => ({ t: 'exam', title: '卷面这样写', md: md });
  // the teacher's Q1(c)(d) have no past block with a solution: question from the mock paper, solution from the T-page
  function paperQ(src, marks, sol) {
    const m = past('mock', src);
    return { t: 'past', src: '2026 S2 practice ' + src, marks: marks, q: m.q, qzh: m.qzh, blocks: m.blocks.filter((b) => b.t === 'fig'), sol: sol };
  }

  // id, estimate (see the header; ml = marks label), title, src (where the marks come from), mins, marks (of the teacher's 50), card (memorise), work (do)
  const items = [
    { id: 'cnn', tier: 1, p: .85, m: 8, q: .85, ml: '3–14', title: 'CNN 参数个数', src: 'mock Q1(d) · 3 分', mins: 30, marks: 3,
      card: [routine(T`**认题**：给一张 CNN 图或一串层，问参数个数或输出尺寸。

1. 从下往上数每层的单元数。
2. 卷积层权重共享：看**一个**输出单元连几个输入，得到 $k$。1D 单核的参数 $=k$；2D $=C_{out}\times C_{in}\times k^2$。
3. 全连接层 $=n_{in}\times n_{out}$；接在卷积后面先拉平（高 × 宽 × 通道）。
4. pooling 没有参数，只改尺寸，通道数不变。
5. bias：每个 filter 1 个，全连接层每个输出单元 1 个；题目写 exclude 就不加。
6. 输出边长 $\lfloor(n+2p-k)/s\rfloor+1$。最后逐层相加。`),
      phrase(T`Layer sizes (bottom to top): …
Convolutional layer: each unit sees $k$ consecutive inputs and the filter weights are shared across positions, so it has $k$ parameters ($C_{out}C_{in}k^2$ in 2D).
Fully connected layer: $n_{in}\times n_{out}$ parameters. Pooling has no parameters.
Total (excluding biases): … = …`)],
      work: [paperQ('Q1(d)', 3, ofType(section('T03', 'steps'), 'steps', 'exam', 'warn')), random('cnn', 'CNN 随机题')] },

    { id: 'svm-sv', tier: 1, p: .75, m: 5, q: .9, ml: '约 5', title: 'SVM 看图找支持向量', src: 'mock Q1(c) · 3 分', mins: 15, marks: 3,
      card: [routine(T`**认题**：图上有两类点和边界，问哪些点是 support vector。

1. 算每个点到边界的垂直距离。竖线 $x=c$ 时就是 $|x_i-c|$。
2. 两类各取最近的点；并列最近的全选。
3. 检查：两侧最近距离相等。
4. soft margin：margin 线上、margin 内、分错的点都是 support vector。`),
      phrase(T`The support vectors are points …. They are the closest points to the decision boundary on each side (distance …), i.e. they lie on the margin boundaries and satisfy $y_i(\mathbf w'\mathbf x_i+b)=1$. Removing any other point would not change the solution.`)],
      work: [paperQ('Q1(c)', 3, ofType(section('T04', 'read'), 'table', 'exam')), past('T04', '2019 S2 practice Q4(b)')] },

    { id: 'ucb', tier: 1, p: .85, m: 8, q: .9, ml: '约 8', title: 'UCB 算 Q 值选臂', src: 'mock Q2 · 6 分 · 就是 W10 手写题原题', mins: 30, marks: 6,
      card: [routine(T`**认题**：给每个臂的次数和奖励，问下一轮拉哪个。公式和 $\ln$ 值卷面会给，$t$ 要自己定。

1. $t$ = 所有臂的总次数 + 1，所有臂共用一个 $t$。
2. $\hat\mu$ = 奖励和 ÷ 次数。
3. bonus $=\sqrt{2\ln t/N}$，$N$ 是这个臂自己的次数；分子分母分别开方。
4. $Q=\hat\mu+$ bonus，列表，选最大，写一句理由。没拉过的臂直接取 $Q_0$。
5. 问探索机制时答两条（2021 Q17，8 分）：没拉过的臂用乐观初值 $Q_0$；bonus 在拉得少时大，被冷落的臂 bonus 随 $\log t$ 增长，迟早再被拉。`),
      phrase(T`$t=\sum_iN(i)+1=\dots$, $\ln t\approx\dots$
$Q(i)=\hat\mu(i)+\sqrt{2\ln t/N(i)}$: $Q(1)=\dots$, $Q(2)=\dots$, $Q(3)=\dots$
Pull arm …: it has the largest UCB value. Its empirical mean is not the highest, but it has been pulled few times, so its exploration bonus dominates (optimism in the face of uncertainty).`)],
      work: [past('T02', '2026 S2 practice Q2'), random('ucb', 'UCB 随机题')] },

    { id: 'vc-table', tier: 1, p: .9, m: 10, q: .8, ml: '8–12', title: 'VC 维 dichotomy 表', src: 'mock Q3 · 8 分 · 就是 W5 Ex1 原题', mins: 45, marks: 8,
      card: [routine(T`**认题**：给一张 0/1 表，求 VC 维并写出一个被打散的点集。

1. 去掉重复行剩 $m$ 行，$k=\lfloor\log_2m\rfloor$ 是上界，从 $k$ 开始试。
2. 按列预筛：能进 $k$ 元打散集的列，至少要有 $2^{k-1}$ 个 0 和 $2^{k-1}$ 个 1。
3. 候选的 $k$ 列：只看这几列，去重，凑齐 $2^k$ 种就是 shattered；缺的组合写出来就是"不是"。
4. $k$ 元集合一个都不行，就把 $k$ 减 1 再查。不能直接拿上界当答案。`),
      phrase(T`$\mathrm{VC}(F)=k$. The set $\{\dots\}$ is shattered: restricted to these points the rows give …, i.e. all $2^k$ labellings. No set of $k+1$ points is shattered: the table has only $m<2^{k+1}$ distinct rows (or: each such set misses a labelling, e.g. …). Hence $\mathrm{VC}(F)=k$.`)],
      work: [past('T01', '2026 S2 practice Q3'), random('vc', 'VC 随机题')] },

    { id: 'dsep', tier: 1, p: .85, m: 8, q: .8, ml: '约 8', title: 'D-separation', src: 'mock Q4 · 8 分 · 就是 W12 Q1 原题', mins: 45, marks: 8,
      card: [routine(T`**认题**：给 BN，问 $X\perp Y\mid S$ 是否成立。每一步都写在卷面上。

0. 抄下所有有向边。
1. 祖先图：只留 $X$、$Y$、条件集和它们的**所有祖先**。
2. Moralize：同一个孩子的父节点两两连边，去掉箭头。
3. 删掉条件集的节点和它们的边。
4. 还连通就**不成立**，写出路径；不连通就**成立**。

顺序不能反。无向图（MRF）不用 1、2 步，直接删条件集看连通。`),
      phrase(T`The ancestral graph of $\{X,Y\}\cup S$ contains …. Moralising adds … (parents of …). After dropping directions and removing the conditioning nodes …, the path … still connects $X$ and $Y$, so $X\perp Y\mid S$ does **not** hold.
(If no path remains: $X$ and $Y$ are separated given $S$, so the statement holds.)`)],
      work: [past('T05', '2026 S2 practice Q4'), random('dsep', 'D-separation 随机题')] },

    { id: 'elim', tier: 1, p: .9, m: 10, q: .7, ml: '8–14', title: '消元 → junction tree', src: 'mock Q5 · 8 分 · 就是 W12 Q4 原题', mins: 60, marks: 8,
      card: [routine(T`**认题**：给图和消元顺序，问 junction tree 的团、最大团或复杂度。

1. 有向图先 moralize。
2. 每删一个点写一行：删的点 | **当前**邻居 | 新加的 fill-in 边 | 团（这个点 + 邻居）。邻居要算上前面加的 fill-in 边。
3. 划掉被别的团包含的团，剩下的就是 junction tree 的团。
4. 连树：每对团的交集大小是边权，从大到小选边，成环就跳过；每条边写 separator（两团的交集）。
5. 复杂度：最大团 $k$ 个二值变量，$O(n\,2^k)$，随最大团大小指数增长。`),
      phrase(T`Eliminate in the given order, each time connecting the current neighbours of the eliminated node (fill-in edges) and recording the clique "node + neighbours": (table). Removing cliques contained in larger ones, the junction tree cliques are …. Tree edges with separators: …. Inference cost is exponential in the size of the largest clique.`)],
      work: [past('T06', '2026 S2 practice Q5'), random('elim', '消元随机题')] },

    { id: 'pgm', tier: 1, p: .9, m: 20, q: .65, ml: '约 20', title: 'PGM 画图 + 数 CPT + 山火题', src: 'mock Q6 · 10 分 · 2025 practice Q6 同题', mins: 60, marks: 10,
      card: [routine(T`**认题**：一段故事（山火报警、流感、学生成绩），要画图、数表、说怎么用模型。2025、2026 都考了山火。

1. 画图：每个变量一个节点，原因 → 结果；没说有关系的不连。
2. 因子分解：每个节点写 $P(x\mid\text{parents})$，全部相乘。
3. 数 CPT：每个节点一张表，$r$ 个取值，父节点 $q$ 种组合，$r\times q$；自由参数 $(r-1)q$。**老师官方答案的写法**（布尔变量）：每种父节点组合一行，只写 True 的概率（False = 1 减它）；没有父节点就 1 行，$m$ 个父节点就 $2^m$ 行，列 = $m$ 个父节点 + 这个变量本身。Ed 上对这道题的答复（11/1）：32 行 2 列或 2 行 32 列也都对，但要写清每行对应哪种父节点组合。
4. 规则确定（传感器绝对准确）就填 0/1。
5. 读数会出错：加隐变量 $F\to S$，$P(S\mid F)$ 是误报 / 漏报率。
6. 做决定：代入读数，对看不到的变量求和，算 $P(A\mid\text{readings})$，超过阈值就行动。
7. 问 CPT 换成 logistic regression 的后果（2021 Q14(c)）：参数变少，但 log-odds 只能是父节点的线性函数，表示不了 XOR 式的交互，bias 更大。`),
      phrase(T`Nodes …; edges …, i.e. $P(\dots)=\prod_iP(x_i\mid\mathrm{pa}_i)$.
One table per random variable. A Boolean root node: one row, the probability that it is True (False is one minus this). A Boolean node with $m$ Boolean parents: $2^m$ rows, one per parent configuration, with $m+1$ columns (the parents and the node).
Perfect sensors make the CPT deterministic (all entries 0 or 1); they say nothing about the sensors' own tables.
For a noisy sensor, add a latent true state $F$ with $F\to S$; $P(S\mid F)$ models false positives and negatives.
To decide: observe the readings, marginalise the unobserved variables, compute $P(A=1\mid\text{readings})$ and act if it exceeds a threshold.`)],
      work: [past('T07', '2026 S2 practice Q6'), random('cpt', 'CPT 计数随机题')] },

    { id: 'q1ab', tier: 1, qs: 2, p: .6, m: 5, q: .9, ml: '每道约 5', title: 'Q1(a)(b) 回归目标、marginal likelihood', src: 'mock Q1(a)(b) · 4 分', mins: 10, marks: 4,
      card: [routine('Section A 每题写 1–3 行英文：**一句定义 + 一句原因**，关键词优先。先读题，用英文写出要点，再点"看答案"。题干写 In words or a mathematical expression，写公式就够。'),
        { t: 'examqPick', picks: SML.mustAnswers.filter(([, src]) => src.indexOf('2026') === 0) }],
      work: [] },

    { id: 'sa', tier: 3, qs: 8, p: .25, m: 5, q: .75, ml: '每道约 5', title: '必背简答 8 道', src: '2025 practice Q1 和多份卷反复出现的主题', mins: 45,
      card: [routine('1–3 行英文：一句定义 + 一句原因。前两道是去年 practice 原题，后面是 SVM、Bayesian、回归这几个每年都考的主题。'),
        { t: 'examqPick', picks: SML.mustAnswers.filter(([, src]) => src.indexOf('2026') !== 0) }],
      work: [] },

    { id: 'cq', tier: 2, pin: true, qs: 13, p: .11, m: 5, q: .8, ml: '每道约 5', title: '今年 Quiz：6 次全部 13 题', src: 'Canvas Quiz 1–6 原题，Ed 考试帖写明 quiz 也考', mins: 35,
      card: [routine('先做下面 13 题，对完答案再展开结论表；考前背这张表。'),
        { t: 'deep', title: '13 题结论表', hint: '做完下面的题再展开', blocks: [{ t: 'table', head: ['题', '中英关键词', '结论'], rows: [
          ['1.1', '**MLE** 极大似然，**MAP** 最大后验，**prior** 先验，**uniform prior** 均匀先验', 'MAP 多一个先验；uniform prior 时两者相同'],
          ['1.2', '**minimiser** 最小值点，**strictly increasing** 严格递增，**monotonic** 单调', '因为 log 严格递增，不是因为乘积变求和'],
          ['1.3', '**Newton–Raphson** 牛顿法，**converge** 收敛，**initial point** 初始点，**global minimum** 全局最小', T`一步到 $w^*=y/x$，和 $w_1$ 无关`],
          ['2.1', '**linear combination** 线性组合，**irrelevant feature** 无关特征，**instance** 样本', T`$x_2=-2x_3$，所以 $x_2,x_3$ 可以，$x_1$ 不行`],
          ['2.2', '**dichotomy** 一种标注，**shatter** 打散，**VC dimension** VC 维，**deduce** 推出', T`9 行 $<2^4$，所以 VC $\le3$；只看 $k$ 列，$2^k$ 种组合齐全才算打散`],
          ['3.1', '**autoencoder** 自编码器，**PCA** 主成分分析，**linear activation** 线性激活，**orthonormal basis** 标准正交基', '单隐藏层 + 线性激活时和 PCA 同一子空间，基不一定正交'],
          ['3.2', '**perceptron** 感知机，**learning rate** 学习率，**update rule** 更新规则，**loss** 损失', T`分对（$sy>0$）不更新，$w_2$ 还是 2`],
          ['4.1', '**filter** 卷积核，**stride** 步长，**no padding** 不填充，**max-pooling** 最大池化，**grayscale** 灰度，**fully-connected** 全连接', '卷积 18 + pooling 0 + 全连接 150 + 输出 3 = 171'],
          ['4.2', '**Weighted Majority** 加权多数，**expert** 专家，**mistake** 错误次数，**bound** 上界，**optimal** 最优', T`求导令 0：$\epsilon=\sqrt{\ln n/m}$，平衡两项`],
          ['5.1', '**greedy** 贪心，**arm** 臂，**pull** 拉，**bounded reward** 有界奖励，**expected reward** 期望奖励', '先拉到谁就一直拉谁，最差的臂最多 100 次'],
          ['5.2', '**posterior** 后验，**uniform prior** 均匀先验，**Bernoulli** 伯努利，**consecutive** 连续的', T`$\mathrm{Beta}(1,1)$ + 5000 次成功 = $\mathrm{Beta}(5001,1)$`],
          ['6.1', '**Markov random field** 马尔可夫随机场，**eliminated** 被消元，**largest clique** 最大团，**junction tree** 连结树', T`第一步的团 $\{A,B,C,D\}$ 最大，答案 4`],
          ['6.2', '**Bayesian network** 贝叶斯网络，**conditional independence** 条件独立，**hold** 成立，**collider** 碰撞点', T`$V$ 是 collider，观测后 $U$—$S$ 接通，不成立`],
        ] }] }],
      work: [pick('1.1', '1.2', '1.3', '2.1', '2.2', '3.1', '3.2', '4.1', '4.2', '5.1', '5.2', '6.1', '6.2')] },

    { id: 'sa2', tier: 4, qs: 14, p: .1, m: 5, q: .7, ml: '每道约 5', title: '高频简答 14 道', src: '按考频选，2021、2022 正式卷 Section A 为主', mins: 45,
      card: [routine('同上：1–3 行英文。每组标题里的 x/7 是 7 份完整卷里出现这个主题的份数。'),
        { t: 'h3', text: 'Bayesian（7/7）' },
        { t: 'examqPick', picks: [['c08', '2016 S2 Q1.5'], ['c50', '2017 S2 Q1(h)']] },
        { t: 'h3', text: 'SVM 与 kernel（6/7、5/7）' },
        { t: 'examqPick', picks: [['c28', '2021 Q3'], ['c27', '2020 S2 practice Q2(b)'], ['c29', '2016 S2 Q8.1']] },
        { t: 'h3', text: '独立性与图模型（6/7）' },
        { t: 'examqPick', picks: [['c02', '2019 S2 practice Q1(e)'], ['c55', '2022 S1 Q1(d)']] },
        { t: 'h3', text: '神经网络与优化器（4/7、3/7）' },
        { t: 'examqPick', picks: [['c33', '2021 Q4'], ['c34', '2021 Q13(b)'], ['c35', '2021 Q7'], ['c35', '2022 S1 Q1(a)']] },
        { t: 'h3', text: 'RNN、attention、autoencoder（各 2/7）' },
        { t: 'examqPick', picks: [['c40', '2022 S1 Q1(b)'], ['c41', '2022 S1 Q1(c)'], ['c37', '2021 Q9']] }],
      work: [] },

    { id: 'mle', tier: 3, p: .6, m: 10, q: .9, ml: '约 10', title: 'MLE 数 CPT', src: '2025 practice Q4 · 15 分', mins: 20,
      card: [routine(T`1. 分母：数父节点取值为 $u$ 的行（根节点就是总行数）。
2. 分子：在这些行里再数 $X=x$ 的行。
3. 分子 ÷ 分母。父节点组合没出现过是 $0/0$，数据定不下这一列。`),
      phrase(T`Choose the CPT entries that maximise the likelihood of the data, subject to each distribution summing to 1. With complete data this decouples table by table and the solution is the relative frequency: $\hat P(X=x\mid\mathrm{pa}=u)=\#\{X=x,\mathrm{pa}=u\}/\#\{\mathrm{pa}=u\}$.`)],
      work: [past('T07', '2025 S1 practice Q4')] },

    { id: 'vc-family', tier: 2, p: .55, m: 8, q: .6, ml: '约 8', title: 'W5 Ex2 矩形 VC = 4，VC 函数族', src: 'W5 手写题，紧跟 mock Q3 那张表；2023 S1 同一张表后面也接矩形', mins: 30,
      card: [routine(T`1. 下界：举一组 $d$ 个点，每种标注写出实现它的分类器。
2. 上界：**任意** $d+1$ 个点，都有一种标注做不出来。

结论要背：轴对齐矩形的 VC $=4$：菱形 4 点可打散；任意 5 点，最左、最右、最上、最下标 $+$，剩下一点标 $-$，做不出。阈值 $I_t$ 的 VC $=1$，$(1,0)$ 做不出。阈值 + 反阈值的 VC $=2$，$(1,0,1)$ 做不出。`),
      phrase(T`Lower bound: the points … are shattered: (a classifier for each labelling). Upper bound: for any $d+1$ points, the labelling … cannot be produced, because …. Hence the VC dimension is $d$.`)],
      work: [past('T01', '2023 S1 Q3(b)(c)'), past('T01', '2022 S1 exam Q3(b)(c)')] },

    { id: 'ins-t8', tier: 2, p: .35, m: 10, q: .65, ml: '10–12', title: 'W6 kernel 合法性证明', src: 'W6 手写题（Prove），2021 Q15 · 12 分', mins: 20,
      card: [routine(T`合法 kernel = 能写成 $\varphi(\mathbf u)^\top\varphi(\mathbf v)$。

1. 写出已知 kernel 的特征映射；集合、计数这类直接构造指示向量（W6）。
2. 构造新的 $\varphi$：和 → 拼接；$cK$ → $\sqrt c\,\varphi$。
3. 验证内积等于新 kernel。

也可以直接引用组合规则：$K_1+K_2$、$K_1K_2$、$cK_1$、$f(\mathbf u)K_1(\mathbf u,\mathbf v)f(\mathbf v)$ 都合法。`),
      phrase(T`Since $k_1,k_2$ are valid, there exist feature maps with $k_1(\mathbf u,\mathbf v)=\varphi_1(\mathbf u)^\top\varphi_1(\mathbf v)$ and $k_2(\mathbf u,\mathbf v)=\varphi_2(\mathbf u)^\top\varphi_2(\mathbf v)$. Define $\varphi_3=\dots$. Then $\varphi_3(\mathbf u)^\top\varphi_3(\mathbf v)=\dots=k_3(\mathbf u,\mathbf v)$, so $k_3$ is an inner product in the feature space of $\varphi_3$ and is therefore a valid kernel.`)],
      work: [past('T08', 'Worksheet 6'), past('T08', '2021 S1 exam Q15')] },

    { id: 'xor', tier: 3, p: .5, m: 10, q: .85, ml: '约 10', title: 'XOR 加一个特征就可分', src: '2025 practice Q2 · 10 分', mins: 15,
      card: [routine(T`XOR 在原空间线性不可分。加特征 $x_1x_2$：$\varphi(\mathbf x)=(x_1,x_2,x_1x_2)$，取 $\mathbf w=(1,1,-2)$，$b=-0.5$，把四个点代进去逐个验证符号。`)],
      work: [past('T08', '2025 S1 practice Q2')] },

    // this year's handwritten exercises that did not make the mock
    { id: 'mrf', tier: 2, p: .55, m: 8, q: .9, ml: '约 8', title: 'W12 Q2 MRF 条件独立', src: 'W12 手写题，同一份 tutorial 的 Q1、Q4 都上了 mock', mins: 10,
      card: [routine(T`MRF 的边没有箭头，**不用祖先图，也不用结婚**。

1. 抄下所有边。
2. 删掉条件集的节点和它们的边。
3. $X$ 和 $Y$ 不连通就**成立**；还连通就**不成立**，写出路径。`),
      phrase(T`In a Markov random field, conditional independence is graph separation. After removing the conditioning nodes … the remaining edges are …. $X$ and $Y$ lie in different components, so $X\perp Y\mid S$ holds. (If a path remains: the path … still connects them, so it does not hold.)`)],
      work: [past('T05', 'Workshop 12 Q2')] },

    { id: 'bp', tier: 2, p: .55, m: 8, q: .7, ml: '约 8', title: 'W12 Q3 BP：边缘和消息', src: 'W12 手写题，同一份 tutorial 里没上 mock；旧卷没考过', mins: 25,
      card: [routine(T`**认题**：给一张 MRF，问 BP 跑完后怎么算边缘、怎么发消息。不算数字，只写公式的形状。

1. 边缘：$P(V)\propto$ $V$ 的**所有**邻居发来的消息相乘，再归一化。
2. 消息 $m_{V\to S}(S)$：外出势 $\psi_{VS}(V,S)$ × $V$ 收到的消息（**不含** $S$ 发来的），再**对 $V$ 求和**，结果是 $S$ 的函数。
3. 为什么不乘 $m_{S\to V}$：这条边已经由 $\psi_{VS}$ 代表了（Ed 上的答复）。`),
      phrase(T`$P(V)\propto\prod_{u\in N(V)}m_{u\to V}(V)$: after BP every neighbour has sent its message to $V$, and the marginal is their product, normalised.
$m_{V\to S}(S)=\sum_V\psi_{VS}(V,S)\prod_{u\in N(V)\setminus\{S\}}m_{u\to V}(V)$: the outgoing potential times the incoming messages from all neighbours except $S$, summed over $V$.`)],
      work: [past('c57', 'Workshop 12 Q3')] },

    { id: 'ws8', tier: 2, p: .35, m: 6, q: .85, ml: '约 6', title: 'W8 数 CNN 和 logistic regression 的参数', src: 'W8 手写题，数字可手算', mins: 15,
      card: [routine(T`比 mock Q1(d) 多三件事：2D 卷积 $C_{out}C_{in}k^2$（另加 $C_{out}$ 个 bias）；每层先算输出边长，pooling 改尺寸不改通道；全连接前先拉平。logistic regression 把像素拉平，$d\times$ 类数 + 类数。`)],
      work: [{ t: 'past', src: 'Workshop 8', topic: 'L13 · WK08',
        q: T`Calculate the number of parameters in the logistic regression model and the convolutional network below (CIFAR-10: $32\times32\times3$ input, 10 classes; include biases). CNN: Conv I with 8 $5\times5$ filters → $2\times2$ max pooling with stride 2 → Conv II with 16 $5\times5$ filters → $2\times2$ max pooling with stride 2 → Dense 256 → Dense 10. Convolutions use stride 1 and no padding.`,
        qzh: T`数出 logistic regression 模型和下面这个卷积网络的参数个数（CIFAR-10：输入 $32\times32\times3$，10 类；含 bias）。CNN：Conv I 8 个 $5\times5$ filter → $2\times2$ max pooling（stride 2）→ Conv II 16 个 $5\times5$ filter → $2\times2$ max pooling（stride 2）→ 全连接 256 → 全连接 10。卷积 stride 1、无 padding。`,
        sol: section('T03', 'ws8') }] },

    { id: 'experts', tier: 2, p: .35, m: 8, q: .7, ml: '约 8', title: 'W9 experts：regret 和上界', src: 'W9 手写题，和 mock 一样给 ln 值；旧卷没考过', mins: 20,
      card: [routine(T`**认题**：$n$ 个专家，给 $\varepsilon$、算法累计损失 $L$、最好专家累计损失 $L^*$。

1. Regret $=L-L^*$。
2. 定理上界 $L\le\dfrac{\ln n}{\varepsilon}+(1+\varepsilon)L^*$，代入。
3. 平凡上界：每轮损失最多 1，$T$ 轮最多 $T$。定理的界比它大，就说这个界没有提供信息（vacuous）。
4. 证明思路：总权重 $W$ 当势函数。上界 $W\le n\prod_t(1-\varepsilon L_t)$，下界 $W\ge(1-\varepsilon)^{L^*}$，两边取 $\ln$ 再化简。`),
      phrase(T`Use the total weight $W$ as a potential. Each round $W(t+1)\le(1-\varepsilon L_t)W(t)$, so $W\le n\prod_t(1-\varepsilon L_t)$; the best expert's weight gives $W\ge(1-\varepsilon)^{L^*}$. Taking logs gives $L\le\frac{\ln n}{\varepsilon}+(1+\varepsilon)L^*$.
Regret $=L-L^*=\dots$. Upper bound: $\dots$. Trivial maximum: $T\times1=\dots$. (A bound above the trivial maximum is vacuous for this $T$.)`)],
      work: [{ t: 'past', src: 'Workshop 9', topic: 'L16 · WK09',
        q: T`Explain the technique to establish bounds for the probabilistic experts algorithm. Suppose using 3 experts and $\epsilon=0.1$, the algorithm has a cumulative loss of 4 after 10 rounds and the best expert in hindsight has a cumulative loss of 2. Calculate the regret of the algorithm. What upper bound on the algorithm's cumulative loss is given by the theorem? If each round's loss lies in $[0,1]$, what is the trivial maximum cumulative loss over 10 rounds? (Some possibly useful values: $\ln0.1\approx-2.3$, $\ln2\approx0.7$, $\ln3\approx1.1$, $\ln4\approx1.4$)`,
        qzh: T`说明为 probabilistic experts 算法建立上界的方法。设有 3 个专家、$\epsilon=0.1$，算法 10 轮后累计损失为 4，事后最好的专家累计损失为 2。算出 regret。定理给出的累计损失上界是多少？若每轮损失都在 $[0,1]$ 内，10 轮的平凡最大累计损失是多少？`,
        sol: ofType(under('c46', 'Worksheet 9 手算题'), 'steps') }] },

    { id: 'perceptron', tier: 2, p: .25, m: 8, q: .85, ml: '约 8', title: 'W5 Ex3 perceptron 手算', src: 'W5 手写题，今年 Quiz 3 也考 perceptron', mins: 20,
      card: [routine(T`**认题**：给 $\mathbf X$（第一列是 bias）、$\mathbf y$、$\eta$，求权重。

1. $\mathbf w$ 从 $\mathbf 0$ 开始，按行扫样本。
2. $s=\mathbf w'\mathbf x$；$s\ge0$ 判 $+1$，否则判 $-1$。
3. 判错才更新：$\mathbf w\leftarrow\mathbf w+\eta y\mathbf x$。
4. 一整轮没有更新就停。列表写出每行的 $s$、预测、更新后的 $\mathbf w$。
5. $s=0$ 的边界：课件规则是 $y\cdot s\le0$ 就更新（$s=0$ 也算错）；题目指定了规则就照题目。W5 Ex3 用两种规则，最后都是 $(-0.1,0.1,0.1)$。`),
      phrase(T`Start from $\mathbf w=\mathbf 0$ and scan the examples in order: compute $s=\mathbf w'\mathbf x$, predict $+1$ if $s\ge0$ and $-1$ otherwise; if the prediction is wrong, set $\mathbf w\leftarrow\mathbf w+\eta y\mathbf x$. (table) A full epoch makes no update, so we stop with $\mathbf w=\dots$.`)],
      work: [{ t: 'past', src: 'Workshop 5 Ex3', topic: 'L10 · WK05',
        q: T`Find weights of a perceptron of the following dataset, with learning rate $\eta=0.1$. $\mathbf X$ has rows $(1,1,1),(1,1,2),(1,0,0),(1,-1,0)$ and $\mathbf y=(1,1,-1,-1)$. Use the update rule in the pseudocode.`,
        qzh: T`用学习率 $\eta=0.1$ 求下面数据集上 perceptron 的权重。$\mathbf X$ 的四行是 $(1,1,1),(1,1,2),(1,0,0),(1,-1,0)$，$\mathbf y=(1,1,-1,-1)$。用 pseudocode 里的更新规则。`,
        sol: under('T11', 'Worksheet 5 Ex3 全解') }] },

    { id: 'w11', tier: 2, qs: 2, p: .3, m: 5, q: .7, ml: '每道约 5', title: 'W11 预测方差、evidence 选模型', src: 'W11 讨论题，2021 Q11 考过预测方差', mins: 15,
      card: [routine(T`1. 预测方差 $\sigma^2+\mathbf x_*'\mathbf V_N\mathbf x_*$：第一项是噪声，第二项是权重的不确定性，离训练点越远越大。
2. 选模型：选 evidence 最大的模型族。训练误差随模型变复杂一路下降，evidence 不会一直升：W11 里 2 次多项式的 evidence 最高。`),
      phrase(T`Compute the evidence $p(\mathbf y\mid\mathbf X,\mathcal M)=\int p(\mathbf y\mid\mathbf X,\mathbf w)\,p(\mathbf w\mid\mathcal M)\,d\mathbf w$ for each candidate model and pick the largest. Training error keeps falling as flexibility grows, but the evidence averages the likelihood over the prior: a flexible model spreads its prior probability over many possible data sets, so it gives less probability to the observed one unless the extra flexibility is needed (Occam's razor).`),
        { t: 'examqPick', picks: [['c50', '2021 Q11']] }],
      work: [] },

    { id: 'derive', tier: 2, p: .2, m: 8, q: .65, ml: '约 8', title: 'W3、W4 推导 normal equations 和 ridge', src: 'W3 Ex1、W4 Ex1 都写着 Attempt the derivation', mins: 20,
      card: [routine(T`三步：展开目标函数；求梯度令它为 0；整理出解。线性回归是 $\lambda=0$ 的特例，两道题写法一样。`),
      phrase(T`$L(\mathbf w)=\|\mathbf y-\mathbf X\mathbf w\|^2+\lambda\|\mathbf w\|^2=\mathbf y'\mathbf y-2\mathbf w'\mathbf X'\mathbf y+\mathbf w'\mathbf X'\mathbf X\mathbf w+\lambda\mathbf w'\mathbf w$.
$\nabla L=-2\mathbf X'\mathbf y+2\mathbf X'\mathbf X\mathbf w+2\lambda\mathbf w=\mathbf 0$.
Hence $(\mathbf X'\mathbf X+\lambda\mathbf I)\mathbf w=\mathbf X'\mathbf y$, so $\mathbf w^*=(\mathbf X'\mathbf X+\lambda\mathbf I)^{-1}\mathbf X'\mathbf y$. With $\lambda=0$ this is the least-squares solution.`)],
      work: [] },

    { id: 'ins-t15', tier: 4, p: .25, m: 8, q: .8, ml: '约 8', title: '正则化与模型选择模板', src: '2021 Q6、Q13(a) · 8 分，2017 Q1、Q2；W4 也讨论过', mins: 25,
      card: [routine(T`背下面 4 个模板。再加一句（2021 Q13(a)）：要让 $-\log P+\lambda r(\theta)$ 的最小点是 MAP，先验就是 $p(\theta)\propto\exp(-\lambda r(\theta))$；ridge 对应 Gaussian 先验，lasso 对应 Laplace 先验。`)]
        .concat(ofType(section('T15', 'templates'), 'exam')),
      work: [] },

    { id: 'ins-t9', tier: 2, p: .35, m: 6, q: .85, ml: '约 6', title: 'W2 Beta 后验、MAP、MLE', src: 'W2 Ex1–3 手写题，今年 Quiz 5 Q2', mins: 20,
      card: [routine(T`先验 $\theta\sim\mathrm{Beta}(a,b)$，$n$ 次抛掷 $n_H$ 次正面：

1. 证明后验（W2 Ex1、Ex2）：后验 ∝ 似然 × 先验 $=\theta^{n_H}(1-\theta)^{n-n_H}\cdot\theta^{a-1}(1-\theta)^{b-1}$，指数相加，认出 $\mathrm{Beta}(n_H+a,\ n-n_H+b)$。
2. MAP、MLE（W2 Ex3）：分别对 log 后验、log 似然求导令 0。$\hat\theta_{\text{MAP}}=\dfrac{n_H+a-1}{n+a+b-2}$，$\hat\theta_{\text{MLE}}=\dfrac{n_H}{n}$。$a=b=1$ 时两者相同；$n$ 增大时趋于同一个值。
3. 后验均值 $\dfrac{n_H+a}{n+a+b}$。`)].concat(ofType(section('T09', 'beta'), 'exam')),
      work: [random('beta', 'Beta 后验随机题')] },

    { id: 'slack', tier: 4, p: .35, m: 8, q: .85, ml: '约 8', title: 'soft margin：看图判断 ξ', src: '2022 Q4(b)(c) · 12 分', mins: 10,
      card: [routine(T`每个样本一个 $\xi_i=\max(0,\ 1-y_i(\mathbf w'\mathbf x_i+b))$，就是它的 hinge loss（Ed 上的答复），不可能小于 0。除了 $\xi=0$ 且在 margin 外的点，其余都是 support vector。`),
        { t: 'table', head: ['$\\xi_i$', '点在哪'], rows: [
          ['$\\xi_i=0$', '分对，在 margin 外或正好在 margin 线上'],
          ['$0<\\xi_i<1$', '分对，但进了 margin'],
          ['$\\xi_i=1$', '正好在决策边界上'],
          ['$1<\\xi_i<2$', '分错，还没越过对面的 margin 线'],
          ['$\\xi_i>2$', '分错，越过了对面的 margin 线'],
        ] }],
      work: [] },

    { id: 'ins-t2d', tier: 4, p: .1, m: 20, q: .4, ml: '约 20', title: 'contextual bandit 设计题', src: '2022 Q6 · 20 分', mins: 15,
      card: [routine(T`Section C 如果不考 PGM，就可能是这题。把 6 个要素逐条对上题目场景：

1. **reward**：业务目标在一轮里的增量（点击 = 1，没点 = 0）。
2. **arms**：每轮可选的选项（如一个"标题 + 图片"组合）。
3. **round**：一次选择并看到 reward（如一个用户打开首页）。
4. **context**：用户特征和臂特征拼成向量；用回归学 $E[R\mid\mathbf X]$，加不确定性 bonus，选最大。
5. **i.i.d. 假设**：说清哪里不成立，context 能补救多少。
6. **离线评估**：收集臂是均匀随机选的日志，用 replay 回放比较。`)],
      work: [past('T02', '2022 S1 exam Q6')] },

    { id: 'final', tier: 5, last: true, title: '出门前 30 分钟：只背不做', src: '本页', mins: 30,
      card: [{ t: 'good', title: '怎么做', md: '1. 点页面最上面的"只看套路"，从第 1 项扫到最后：每项只看关键词、套路、卷面写法。20 分钟。\n2. 第 9 项 Quiz 的结论表再看一遍。5 分钟。\n3. 页面最上面的题干常用词扫一遍。5 分钟。' }],
      work: [] },
  ];

  // the words the English paper uses for each item, shown at the top of its card; Chinese matches data/glossary.js
  const KW = {
    cnn: 'convolutional neural network 卷积神经网络 | parameters 参数 | exclude the bias 不算偏置项 |filter 卷积核 | stride 步长 | padding 填充 | pooling 池化 | fully connected / dense 全连接 | flatten 拉平 | channel 通道 | weight sharing 权重共享',
    'svm-sv': 'support vector 支持向量 | hard margin 硬间隔 | soft margin 软间隔 | decision boundary 决策边界 | margin 间隔 | classified as 被判为 | by index 按编号',
    ucb: 'multi-armed bandit 多臂老虎机 | arm 臂 | pull 拉 | reward 奖励 | round 轮 | upper confidence bound 置信上界 | empirical mean 样本均值 | exploration 探索 | exploitation 利用 | exploration bonus 探索奖励 | optimism in the face of uncertainty 不确定时保持乐观',
    'vc-table': 'VC dimension 即 VC 维 |dichotomy 一种标注（表的一行） | shatter 打散 | shattered set 被打散的点集 | binary classifier family 二分类器族 | input domain 输入域 | labelling 标注 | distinct rows 不同的行 | upper bound 上界',
    dsep: 'Bayesian network 贝叶斯网络 | conditional independence 条件独立 | hold 成立 | ancestor 祖先 | ancestral graph 祖先图 | moralize 道德化（父节点连边） | parent 父节点 | child 子节点 | conditioning set 条件集 | path 路径 | separated 被分隔 | collider 碰撞点',
    elim: 'Markov random field 马尔可夫随机场 | undirected 无向 | elimination order 消元顺序 | clique 团 | largest clique 最大团 | junction tree 连结树 | neighbour 邻居 | fill-in edge 填补边 | separator 分隔集 | complexity 复杂度 | exponential 指数级',
    pgm: 'probabilistic graphical model (PGM) 概率图模型 | directed 有向 | random variable 随机变量 | conditional probability table (CPT) 条件概率表 | dimensions 行列数 | parent configuration 父节点组合 | factorisation 因子分解 | deterministic 确定性 | latent variable 隐变量 | false positive / negative 误报 / 漏报 | marginalise 求和消去 | threshold 阈值 | bushfire 山火 | sensor 传感器 | evacuate 疏散 | residents 居民 | alert 警报 | stay put 留在原地 | accurate 准确',
    q1ab: 'quantity 量 | minimise 最小化 | linear regression 线性回归 | sum of squared errors 平方误差和 | residual 残差 | least squares 最小二乘 | marginal likelihood 边缘似然 | evidence 证据 | integrate out 积分消去 | prior 先验 | likelihood 似然',
    sa: 'conditionally independent 条件独立 | dependence 依赖 | Boolean 布尔 | joint distribution 联合分布 | Euclidean 欧氏 | weak duality 弱对偶 | primal optimum 原始问题最优值 | dual optimum 对偶问题最优值 | coincide 相等 | conjugacy 共轭 | full Bayesian inference 完整贝叶斯推断 | equivalent 等价 | zero-mean Gaussian noise 零均值高斯噪声',
    sa2: "Bayes' rule 贝叶斯公式 | posterior 后验 | sequential updating 序贯更新 | quadratic kernel 二次核 | not linearly separable 线性不可分 | kernel trick 核技巧 | chain rule 链式法则 | independence assumption 独立性假设 | non-linear basis function 非线性基函数 | backpropagation 反向传播 | feed-forward 前馈 | hidden layer 隐藏层 | momentum 动量 | local optima 局部最优 | saddle point 鞍点 | non-convex 非凸 | dynamic learning rate 动态学习率 | recurrent neural network 循环神经网络 | attention 注意力 | autoencoder 自编码器",
    mle: 'maximum likelihood 极大似然 | complete data 完整数据 | relative frequency 相对频率 | CPT entry 表里的一格 | parent configuration 父节点组合 | sum to 1 和为 1',
    'vc-family': 'axis-aligned rectangle 轴对齐矩形 | threshold 阈值 | lower bound 下界 | upper bound 上界 | shatter 打散 | labelling 标注 | for any 对任意 | there exists 存在',
    'ins-t8': 'valid kernel 合法核 | feature map 特征映射 | inner product 内积 | prove 证明 | there exist 存在 | concatenate 拼接 | closure rules 组合规则',
    xor: 'XOR 异或 | linearly separable 线性可分 | feature 特征 | feature map 特征映射 | weights 权重 | bias 偏置项',
    mrf: 'Markov random field 马尔可夫随机场 | conditional independence 条件独立 | graph separation 图分隔 | conditioning nodes 条件节点 | connected component 连通分量 | path 路径 | hold 成立',
    bp: 'belief propagation 信念传播 | marginal 边缘分布 | message 消息 | potential 势函数 | neighbour 邻居 | normalise 归一化 | sum over 对它求和 | outgoing 外出的 | incoming 收到的',
    ws8: 'logistic regression 逻辑回归 | include biases 算上偏置项 |max pooling 最大池化 | stride 步长 | flatten 拉平 | dense 全连接 | input channel 输入通道 | classes 类别数',
    experts: 'expert 专家 | probabilistic experts 概率专家算法 | regret 遗憾 | cumulative loss 累计损失 | best expert in hindsight 事后最好的专家 | upper bound 上界 | trivial maximum 平凡最大值 | vacuous 没有信息量 | potential 势函数 | round 轮',
    perceptron: 'perceptron 感知机 | learning rate 学习率 | update rule 更新规则 | misclassified 分错 | epoch 一整轮 | weights 权重 | pseudocode 伪代码 | dataset 数据集',
    w11: 'predictive variance 预测方差 | noise 噪声 | uncertainty 不确定性 | evidence 证据 | model selection 模型选择 | training error 训练误差 | flexibility 灵活度 | polynomial 多项式 | Occam’s razor 奥卡姆剃刀',
    derive: 'derivation 推导 | normal equations 正规方程 | objective function 目标函数 | gradient 梯度 | set to zero 令为 0 | ridge regression 岭回归 | least squares 最小二乘 | invertible 可逆',
    'ins-t15': 'regularisation 正则化 | penalty 惩罚项 | ill-posed 不适定（无唯一解） |collinear 共线 | singular 奇异 | overfitting 过拟合 | underfitting 欠拟合 | cross-validation 交叉验证 | held-out 留出的 | fold 折 | model selection 模型选择 | generalisation 泛化 | bias–variance trade-off 偏差-方差权衡 | lasso 套索（L1 正则） | ridge 岭回归（L2 正则）',
    'ins-t9': 'prior 先验 | likelihood 似然 | posterior 后验 | conjugate 共轭 | Beta distribution 贝塔分布 |Bernoulli 伯努利 | coin flip 抛硬币 | proportional to 正比于 | posterior mean 后验均值 | uniform prior 均匀先验',
    slack: 'slack variable 松弛变量 | hinge loss 合页损失 | soft margin 软间隔 | margin boundary 间隔线 | decision boundary 决策边界 | misclassified 分错 | support vector 支持向量',
    'ins-t2d': 'contextual bandit 带上下文的老虎机 | context 上下文 | arm 臂 | reward 奖励 | round 轮 | feature vector 特征向量 | i.i.d. 独立同分布 | offline evaluation 离线评估 | replay 回放 | uniformly at random 均匀随机 | log 日志',
  };
  // other years' questions of the same type, newest first, folded at the end of the item (user: open one only to do it).
  // Leaves out what the page already shows: the mock, workshop questions identical to it, and short answers in the 必背 / 高频 items.
  const MORE = {
    'vc-table': [['T01', '2022 S1 exam Q3(a)'], ['T01', '2021 S1 exam Q16'], ['T01', '2020 Q7(a)']],
    'vc-family': [['T01', '2022 S2 Q5(a)(b)'], ['T01', '2020 Q7(b)']],
    ucb: [['T02', '2021 S1 exam Q17']],
    cnn: [['T03', '2023 Q5(a)(b)'], ['T10', '2022 S1 exam Q5'], ['T03', '“2021 S1” Q6(a)(b)'], ['T03', '2020 Q5(a)(b)(c)'], ['T03', '2020 Q4(a)'], ['T03', '2020 Q4(b)']],
    'svm-sv': [['T04', '2017 S2 exam Q3(a)'], ['T04', '2017 S2 exam Q1(d)']],
    dsep: [['T05', '2021 S1 exam Q18(a)'], ['T05', '2017 S2 exam Q9(a)(b)']],
    elim: [['T06', '2023 S1 exam PGM'], ['T06', '2022 S1 exam Q2'], ['T06', '“2022 S1” PGM'], ['T06', '2021 S1 exam Q18(b)'], ['T06', '“2021 S1” U-PGM'], ['T06', '2019 exam Q8'], ['T06', '2016 S2 exam Q9']],
    pgm: [['T07', '2021 S1 exam Q14(c)'], ['T07', '2017 S2 exam Q11'], ['T07', '2016 S2 exam Q12']],
    'ins-t8': [['T08', '2017 S2 exam Q3(b)'], ['T08', '2017 S2 exam Q10(b)'], ['T08', '2016 S2 exam, Q8.2'], ['T08', '2016 S2 exam, Q1.9']],
    'ins-t9': [['T09', '2016 S2 exam Q10']],
    perceptron: [['T11', '2016 S2 Q7']],
  };
  const more = (picks) => ({ t: 'deep', title: '其他年份同类题（' + picks.length + ' 道）', hint: '想做再展开', blocks: picks.map(([page, src]) => past(page, src)) });

  // the knowledge each question type rests on, shown between the keywords and the routine (user: "一个题型和知识点的东西能不能安排放在一起").
  // Concepts and the "why" behind the routine, not its steps. The storyline page (data/storyline.js) is the map across items.
  const KNOW = {
    q1ab: T`- Linear regression 最小化**残差平方和** $\sum_i(y_i-\hat y_i)^2=\|\mathbf y-\mathbf X\mathbf w\|^2$；这正是假设 Gaussian 噪声 $y=\mathbf w'\mathbf x+\varepsilon$ 时的 MLE。
- 闭式解 $(\mathbf X'\mathbf X)^{-1}\mathbf X'\mathbf y$；再加 $\lambda\|\mathbf w\|^2$ 就是 ridge，等于 Gaussian prior 下的 MAP。
- Marginal likelihood（evidence）$p(D)=\int p(D\mid\theta)\,p(\theta)\,d\theta$：用先验把参数积分掉之后数据的概率，也就是 Bayes rule 的分母（归一化常数）。
- 它不含 $\theta$，所以求 MAP 时可以不管；比较模型时就用它，因为它自带复杂度惩罚。`,
    'svm-sv': T`- SVM 在所有能分开两类的直线里，选 **margin 最大**的那条。点到边界的距离是 $\frac{y_i(\mathbf w'\mathbf x_i+b)}{\|\mathbf w\|}$。
- Hard margin：$\min\frac12\|\mathbf w\|^2$ s.t. $y_i(\mathbf w'\mathbf x_i+b)\ge1$，最近的点正好取到 $=1$。
- Support vector = dual 里 $\lambda_i>0$ 的点。KKT 互补松弛：约束没有取等的点 $\lambda_i=0$。
- 边界只由 support vector 决定：删掉别的点，解不变。所以 hard margin 时，SV 就是两类各自离边界最近、贴在 margin 线上的点。
- Soft margin 时，进了 margin 或分错的点也是 support vector。`,
    ucb: T`- Bandit：每轮拉一个臂，**只看到这个臂的奖励**（experts 能看到所有专家的结果）。目标是 cumulative regret 小。
- Explore 和 exploit 的取舍：greedy 只 exploit，可能一直卡在差臂上；ε-greedy 以概率 ε 随机探索，但不管哪个臂更没把握。
- UCB = optimism in the face of uncertainty：$Q=\hat\mu+\sqrt{2\ln t/N}$。第二项衡量"有多没把握"：拉得少 $N$ 小，加分就大。
- 一个臂一直不被拉，它的 $N$ 不变而 $\ln t$ 在增长，bonus 越来越大，迟早会再被拉。没拉过的臂用初值 $Q_0$。`,
    pgm: T`- Bayesian network = 有向无环图 + 每个节点一张 CPT $P(x_i\mid\text{parents})$。联合分布 $=\prod_iP(x_i\mid x_{pa_i})$。
- 为什么省参数：$n$ 个二值变量的完整联合表要 $2^n-1$ 个数，BN 每个节点只要 $(r-1)q$ 个。
- 箭头表示直接影响（原因 → 结果）；两点之间没有边，就是假设它们没有直接依赖。
- 看不到的量（真实火情）是隐变量，读数是它的孩子，读数的误差写在 $P(\text{读数}\mid\text{真值})$ 里。
- 用模型做决定就是推断：$P(\text{query}\mid\text{evidence})$ = 联合分布对其余变量求和，再归一化。`,
    cnn: T`- 卷积：一个小 filter 在整张图上滑动，所有位置**共用同一组权重**（weight sharing），所以参数个数只和 filter 大小、通道数有关，和图多大无关。
- 每个 filter 覆盖**所有输入通道**：$C_{in}\times k\times k$ 个权重 + 1 个 bias，输出一张 feature map；$C_{out}$ 个 filter 输出 $C_{out}$ 张（Ed 11/2 答复）。
- 全连接层每对输入、输出各有一个权重，所以参数往往集中在最后的全连接层。
- Pooling（max / average）只缩小尺寸，没有参数，通道数不变，带来一点平移不变性。
- Stride、padding 只影响输出尺寸，不影响参数个数。`,
    'vc-table': T`- Dichotomy：分类器族在一组点上做出的一种标注。表里每行是一种标注，每列是一个点。
- Shattered：$k$ 个点的 $2^k$ 种标注全都做得出来。
- VC dimension：**存在**一组被打散的点的最大个数。只要找到一组就行，不需要所有点集都被打散。
- 有限的表：不同行最多 $m$ 种，要打散 $k$ 个点需要 $2^k\le m$，所以 $k\le\lfloor\log_2 m\rfloor$。
- 为什么重要：VC 维代替 $\log|\mathcal F|$ 进入泛化界。VC 越大，模型越复杂，需要的数据越多。`,
    'vc-family': T`- 证 VC $=d$ 要两半。**下界**：**存在**一组 $d$ 个点能被打散，点自己挑，挑得好就行。**上界**：**任意** $d+1$ 个点都打散不了，只举一组不够。
- 上界常用的论证：总有一种标注做不出来。矩形就是把最外面的 4 个点标 $+$、中间那个标 $-$。
- 要背的结论：stump（阈值）VC = 1 或 2（看是否允许反向）；平面直线 VC = 3；$\mathbb R^d$ 线性分类器（带 bias）VC = $d+1$；轴对齐矩形 VC = 4。
- Growth function $S_{\mathcal F}(n)$：$n$ 个点上最多能做出几种标注。$S_{\mathcal F}(n)=2^n$ 的最大 $n$ 就是 VC 维。`,
    dsep: T`- BN 的条件独立靠看图判断，基本结构只有三种。
- Chain $A\to B\to C$ 和 fork $A\leftarrow B\to C$：观测 $B$ 就**断开**。
- Collider（v-structure）$A\to B\leftarrow C$：**不观测** $B$ 及其后代时是断开的，观测后反而**接通**（explaining away）。
- 祖先图 + moralize 是把这三条一次做完：给 collider 的父节点连边，正好表示"观测了孩子，父节点之间就相关了"。
- 最后删掉条件集，不连通就是独立，连通就不独立。`,
    elim: T`- 推断要对很多变量求和。Variable elimination 一次消掉一个变量：把含它的因子相乘，再对它求和，得到一个关于它所有邻居的新因子。
- 新因子把这些邻居绑在一起，在图上就是把邻居两两连边（fill-in edge）。被消的点加上它的邻居，构成一个团（clique）。
- 计算量由最大的团决定，随团的大小指数增长。消元顺序不同，团的大小就不同；找最优顺序很难（computationally hard），所以考试会给顺序。
- 把消元得到的极大团连成树（边权 = 交集大小，取最大权生成树）就是 junction tree，在树上传消息，所有边缘一次全算出来。`,
    mrf: T`- MRF 是无向图：$P=\frac1Z\prod_c\psi_c(\mathbf x_c)$。Potential 不是概率，要除以配分函数 $Z$ 才归一（global normalisation；BN 是每张 CPT 各自归一）。
- 条件独立看 separation：删掉条件集后 $X$、$Y$ 不连通，就有 $X\perp Y\mid S$。
- 无向图没有 collider 这种特殊情况，所以不用祖先图，也不用 moralize。
- 给定一个点的全部邻居，它和其余所有点独立。`,
    w11: T`- Bayesian 线性回归：先验 $\mathbf w\sim\mathcal N(\mathbf 0,\gamma^2I)$，似然是 Gaussian，后验 $\mathcal N(\mathbf w_N,V_N)$ 仍是 Gaussian（共轭）。后验均值就是 $\lambda=\sigma^2/\gamma^2$ 的 ridge 解。
- 预测时对后验积分，而不是只代一个点估计：$y_*\sim\mathcal N(\mathbf x_*'\mathbf w_N,\ \sigma^2+\mathbf x_*'V_N\mathbf x_*)$。
- Evidence $p(\mathbf y\mid\mathbf X)$：模型太简单，拟合不了数据；太复杂，概率摊到太多可能的数据集上。两头都低，相当于自动的 Occam 剃刀，不需要 validation set。
- 训练误差（最大似然）随复杂度只降不升，不能拿它选模型。`,
    bp: T`- 树上推断：消元的中间结果可以重复用，这就是"消息"。$m_{i\to j}(x_j)$ 是 $i$ 那一侧子树对 $x_j$ 的汇总。
- 每条边两个方向各发一次消息，所有节点的边缘就都有了，比对每个节点单独消元省得多。
- 一个点能向 $j$ 发消息的前提：已经收到除 $j$ 以外所有邻居的消息，所以从叶子开始发。
- 有 evidence 时，把观测变量固定在观测值上，最后归一化，得到的就是条件分布。图里有环就先变成 junction tree。`,
    ws8: T`- Logistic regression 多分类（softmax）：每一类一个权重向量加一个 bias，参数 $(d+1)\times K$；二分类只要一个 $\mathbf w$，$d+1$ 个。
- 图片输入要先拉平：$H\times W\times C$ 个像素就是 $d$。
- CNN 的参数在卷积 filter 和全连接层；pooling 没有参数。卷积靠权重共享利用图像的局部结构，但最后的全连接层仍可能占大头。
- 卷积输出要拉平成 $H'\times W'\times C_{out}$ 维，才能接全连接层。`,
    'ins-t8': T`- Kernel $K(\mathbf u,\mathbf v)=\varphi(\mathbf u)'\varphi(\mathbf v)$ 就是特征空间里的点积。Kernel trick 只算 $K$、不显式算 $\varphi$（$\varphi$ 可能很高维，RBF 甚至是无限维）。
- 为什么能这样做：SVM 的 dual 和预测里，数据只以点积的形式出现。
- **L09 老师原话 "that's what we expect from this class"：会手展开二次核。** 取 $c=0$、二维：$(\mathbf u'\mathbf v)^2=(u_1v_1+u_2v_2)^2=u_1^2v_1^2+2u_1u_2v_1v_2+u_2^2v_2^2$，所以 $\varphi(\mathbf u)=(u_1^2,\ \sqrt2\,u_1u_2,\ u_2^2)$。一般 $d$ 次的证明老师说不要求。
- 判断合法有两条路：构造出 $\varphi$；或者用组合规则。Mercer 条件：对任意一组点，Gram 矩阵都是对称半正定的。`,
    experts: T`- 设定：每轮 $n$ 个专家给建议，你综合后做决定，然后看到**每个**专家的损失（full information，这一点和 bandit 不同）。
- 不对数据做任何分布假设，和**事后最好的专家**比：regret $=L-L^*$。
- Weighted majority：每个专家一个权重，有损失就乘 $(1-\varepsilon)$；probabilistic 版本按权重比例随机跟一个专家。
- 界的两项：$\frac{\ln n}{\varepsilon}$ 是找出好专家的代价，$(1+\varepsilon)L^*$ 是跟着最好专家也要付的代价。$\varepsilon$ 大，学得快但更抖；Quiz 4.2 求的最优 $\varepsilon=\sqrt{\ln n/m}$ 平衡了这两项。
- 有完美专家时用 halving，错误次数 $\le\log_2 n$。`,
    perceptron: T`- 线性分类器 $\hat y=\mathrm{sign}(\mathbf w'\mathbf x)$；$\mathbf x$ 的第一维是 1，对应 bias。
- 训练就是对 perceptron loss $\max(0,-sy)$ 做 SGD，$\eta$ 是步长。分对时 loss 是 0、梯度也是 0，所以不更新。
- 收敛定理：数据线性可分时，有限步内一定收敛（更新次数 $\le R^2/\gamma^2$）；不可分时永远停不下来，要设最多轮数。
- 和 SVM 比：perceptron 找到任意一条能分开的线，SVM 找 margin 最大的；hinge loss 比 perceptron loss 多一个 1，就是在要求 margin。
- 一个 perceptron 分不开 XOR，所以要叠成 MLP。`,
    derive: T`- 最小二乘目标 $\|\mathbf y-\mathbf X\mathbf w\|^2$，ridge 再加 $\lambda\|\mathbf w\|^2$。两者都是凸二次函数，梯度为 0 的点就是全局最小。
- 求导要用的两条：$\nabla_{\mathbf w}(\mathbf w'A\mathbf w)=2A\mathbf w$（$A$ 对称），$\nabla_{\mathbf w}(\mathbf b'\mathbf w)=\mathbf b$。
- 特征共线或 $n<d$ 时 $\mathbf X'\mathbf X$ 不可逆，最小二乘没有唯一解；加上 $\lambda I$ 之后一定可逆。
- 概率视角：最小二乘 = Gaussian 噪声下的 MLE，ridge = 再加 Gaussian prior 的 MAP。
- **L02 老师说是 "part of the requirements"：Normal 分布的 MLE。** $\hat\mu=\frac1n\sum_ix_i$，$\hat\sigma^2=\frac1n\sum_i(x_i-\hat\mu)^2$。老师的提示：把 $\sigma^2$ 当作参数求导，不要对 $\sigma$ 求导。`,
    xor: T`- XOR：$(0,0),(1,1)$ 是一类，$(0,1),(1,0)$ 是另一类。平面上没有一条直线能分开，所以线性模型（perceptron、logistic、线性 SVM）都做不到。
- 三条出路，正好是课程的三条特征线：手工加特征（basis expansion，加 $x_1x_2$）；kernel（隐式加特征，二次核里就有 $u_1u_2v_1v_2$ 这一项）；MLP 的隐藏层自己学特征。
- 加了特征之后，模型对 $\mathbf w$ 仍然是线性的，训练方法不用变。`,
    mle: T`- 数据完整时，BN 的似然按节点、按父节点组合拆开，每一列 CPT 可以单独做 MLE。每一列就是一个 categorical / Bernoulli 分布，MLE 就是频率。L23 老师说这和 L02 抛硬币的 $k/n$ "是同一件事"。
- 父节点组合从没出现是 $0/0$，估不出来；某个取值没出现会被估成 0，这是过拟合。Bayesian 做法（Dirichlet 先验，相当于加伪计数）可以缓解。
- **Ed 11/4 老师答复**：加父节点，MLE 下的对数似然**不会下降**（新 CPT 可以忽略多出来的父节点），可能不变，不一定严格增加。所以只看似然会选最复杂的图，要用 BIC $=l-\frac{(r_i-1)q_i}{2}\log T$；加父节点时 BIC 不一定增加。`,
    'ins-t9': T`- 共轭：先验是 Beta，似然是 Bernoulli / Binomial，后验仍是 Beta，更新只是把成功、失败次数加到 $a$、$b$ 上。$a$、$b$ 可以看成先验里"假想的"成功、失败次数。
- 三种估计：MLE 只看数据；MAP 取后验的众数；后验均值。数据少时先验影响大，$n\to\infty$ 时三者趋于同一个值。
- 均匀先验 $\mathrm{Beta}(1,1)$ 下 MAP = MLE（Quiz 1.1、5.2）。
- 完整的 Bayesian 预测用后验均值，例如 Laplace 日出问题的 $\frac{k+1}{k+2}$。`,
    slack: T`- Soft margin：数据分不开时允许违反 margin，每个点一个 slack $\xi_i\ge0$，目标是 $\frac12\|\mathbf w\|^2+C\sum_i\xi_i$。
- $C$ 是违反的代价：$C$ 大，尽量不违反，margin 窄，容易 overfit；$C$ 小，margin 宽，容忍更多错误。$C\to\infty$ 就回到 hard margin。
- 等价于 hinge loss + L2 正则，$\xi_i$ 就是这个点的 hinge loss。
- Dual 里多了上界 $0\le\lambda_i\le C$（box constraint）；$\lambda_i=C$ 的点在 margin 内或者分错了。`,
    'ins-t15': T`- Overfitting：训练误差低、测试误差高。模型越复杂越容易发生。
- 两类办法：一是限制模型（regularisation，或者选更简单的模型族）；二是选模型（validation、k-fold CV、evidence、BIC）。
- Bias–variance：$\lambda$ 大，模型更简单，bias 上升、variance 下降。
- Lasso 能把一些权重压到正好 0（L1 在 0 处有尖角），所以能做特征选择；ridge 只会缩小，不会置 0。
- Test set 只用来报告最终结果，不能拿来调 $\lambda$。`,
    'ins-t2d': T`- 和普通 bandit 的区别：每轮先看到 context（特征），最好的臂随 context 变化。所以要学的是 $E[R\mid\text{context},\text{arm}]$，这是一个回归问题。
- 和 RL 的区别：动作不影响下一轮的 context（状态）。
- 仍然要在 explore 和 exploit 之间取舍：在回归预测上加一个不确定性 bonus（UCB 的思路），或者用 ε-greedy。
- 离线评估：旧日志里的臂是旧策略选的，有偏。如果日志里的臂是均匀随机选的，就可以 replay：只保留新策略的选择和日志一致的那些轮。`,
  };
  const know = (md) => ({ t: 'note', title: '这题要懂的知识点', md: md });

  // What the lecturers said in class about this item, quotes checked against the L02–L24 transcripts (txt/, reference/transcripts).
  // STAR items were named outright ("remember", "important … at the end of the semester", "what we expect"): they sort first in their tier and join the first segment.
  const STAR = ['dsep', 'elim', 'bp', 'ins-t8', 'derive'];
  const TEACHER = {
    dsep: T`**L20**："please remember this step, this is really important to know. It will be important to you at the end of the semester." 说的就是这套步骤：祖先图 → moralise → 去掉方向 → 删掉条件节点 → 看还连不连通。这是所有讲稿里最直接的考试暗示。`,
    elim: T`- **L22**："you need to know that the elimination ordering it matters"：顺序决定团的大小，也就决定计算量；最优顺序很难找（computationally hard），所以用启发式。
- **L22 收尾**：要知道"why we need to have a tree to do the belief propagation, that's the most important part"，还有为什么好的消元顺序难找。
- Running intersection property "quite important"，但证明不考。
- **不考**：Prim、Kruskal 求生成树的细节（"we won't talk about the details in this subject"）。最大权生成树这个做法要会。`,
    bp: T`- **L21**："please remember the two rules … It will become really, really useful … in this subject"。两条规则：外出消息 = 收到的消息（不含对方发来的）× 外出势，再求和；边缘 = 收到的消息全部相乘。
- **L22**："why we want to use a belief propagation and why we need to have a tree … that's the most important part"。
- **不考**：loopy BP（L22 "you don't need to know this loopy belief propagation"）；BP 为什么对，老师故意不证。`,
    'ins-t8': T`**L09**："that's what we expect from this class"：会手展开二次核，写出 $\varphi$（见下面知识点）。**不考**：一般 $d$ 次多项式核的证明（"I don't really expect you to understand all of this"）。`,
    'svm-sv': T`**L09** 没证强对偶（"I'm not gonna prove to you why that is"），**证明不考**。**要会结论**：SVM 是凸二次规划、约束是线性的，所以强对偶成立，primal 和 dual 的最优值相等，可以改解 dual；dual 里数据只以点积出现，所以能换成 kernel。`,
    slack: T`**L09** 没推 soft margin 的 dual（"I'm not gonna derive it here in class"），**推导不考**。**要会结论**：和 hard margin 的 dual 一样，只多了上界 $0\le\lambda_i\le C$（box constraint）。`,
    'ins-t15': T`**L05** 偏差–方差分解的证明 "outside the scope of the subject"，**不考**。**要会结论**：期望平方误差 = bias² + variance + 不可约噪声；模型越复杂（$\lambda$ 越小），bias 越低、variance 越高。`,
    'vc-table': T`**L06** 泛化界里 $\varepsilon$ 怎么推出来："not … part of the exam"，**不考**。**要会结论**：至少以 $1-\delta$ 的概率，$R[\hat f_D]\le\hat R_D[\hat f_D]+\sqrt{\frac{\log|\mathcal F|+\log(1/\delta)}{2n}}$；无限类把 $\log|\mathcal F|$ 换成和 VC 维有关的量。数据越多界越紧，模型越复杂界越松。`,
    mle: T`**L23** Bayesian score 的闭式解："you also don't need to know how to derive it"，**推导不考**。**要会**：给了公式会用；score 按节点拆开（decomposable），改一条边只要重算受影响那个节点的局部分数。`,
    mrf: T`**L24** 讲 MRF 怎么学参数，下面三处推导都没讲，**不考**，知道结论就行：
- 对数似然对某个势的梯度 = 观测计数 − 模型预测的期望计数（L24 的例子：30 − 20 = 10），所以每一步都要做推断。
- 树结构 MRF 的联合分布可以直接用边、点的经验概率写出来，不用迭代优化。
- 结构未知时，边权取互信息，求最大权生成树（Chow–Liu）。`,
    derive: T`**L02**：方差未知的 Normal MLE 是 "part of the requirements"（见下面知识点最后一条）。`,
    w11: T`- **L18**："very important that we choose a normal distribution as the prior … also important that our likelihood is also a normal distribution"：两边都是 Gaussian（共轭），后验才有闭式解。
- **不考**：后验均值和协方差怎么配方推出来（"a great exercise. It's not examinable"）。老师说 "the important thing is that we can obtain this close form solution"，记结果就行；Fisher information 那页（绿色页，"not examinable"）；方差也未知时用 inverse gamma 先验（"You don't need to know"）。`,
    'ins-t9': T`**L19**："the conjugate priors are very important for our computations"：Beta–Bernoulli 和上一讲的 Normal–Normal 都是共轭，后验和先验同一族，更新只是改参数。**不考**：Laplace approximation 那页（绿色页）。`,
    ucb: T`**L17**："we are not going to prove this bound, but we are going to use it"：UCB 的 bonus 来自这个界，会用公式算就行。`,
    experts: T`**L16**："We will never put an exam question about proofs"：错误上界的证明不考，算法和界的公式要会用（W9 和 mock 都给 ln 值让你代）。不等式工具那页是绿色页，"not examinable"。`,
    sa2: T`**L14**："very important to know that … W and U … are the same across every time step"：RNN 每个时间步共用同一组权重。**不考**：Transformer 结构那页（"it's a green slide, so it's not examinable"）。`,
  };
  const teacher = (id) => ({ t: 'warn', title: STAR.indexOf(id) >= 0 ? '★ 老师课上点名' : '老师课上说的', md: TEACHER[id] });

  // 考场版答案: a short, plain-English answer to memorise and write on the paper, plus one Chinese line (user: "解答都要配合一个简单易懂的回答方便我记住考场写").
  // Keyed by the question's src as shown on this page (past blocks) or the pick's src (short answers). The full solution stays below it.
  // A key that matches no question on the page throws at load.
  const EASY = {
    '2026 practice Q1a': T`The sum of squared errors: $\sum_i(y_i-\mathbf w'\mathbf x_i)^2$.

中文：预测值和真值之差的平方，全部加起来。`,
    '2026 practice Q1b': T`$p(D)=\int p(D\mid\theta)\,p(\theta)\,d\theta$: the probability of the data, averaged over the prior. It is the denominator of Bayes' rule.

中文：用先验把参数平均掉之后数据的概率，就是 Bayes 公式的分母。`,
    '2026 S2 practice Q1(c)': T`Points 1, 2 and 4. They are the closest points to the boundary on each side (distance 1.5), so they lie on the margin.

中文：两边离边界最近的点（距离都是 1.5）就是支持向量。`,
    '2019 S2 practice Q4(b) / 2020 S2 practice Q3(b) / 2021 S1 practice Q3(b)': T`Zero. Point 3 is on the correct side and outside the margin (distance 3.5 > 1.5), so $y(\mathbf w'\mathbf x+b)\ge1$ and the hard-margin loss is 0.

中文：分对了而且在 margin 外，损失就是 0（hard-margin loss 只有 0 和 ∞ 两种值）。`,
    '2026 S2 practice Q2': T`$t=64+16+4+1=85$, so $2\ln t\approx9$.
- Arm 1: $0.625+\sqrt{9/64}=0.625+0.375=1.0$
- Arm 2: $0.625+\sqrt{9/16}=0.625+0.75=1.375$
- Arm 3: $0.5+\sqrt{9/4}=0.5+1.5=2.0$

Pull arm 3: it has the highest UCB value. It was pulled only 4 times, so its uncertainty bonus is the largest.

中文：$t$ = 总次数 + 1 = 85；算出三个 $Q$，选最大的 arm 3，因为它拉得最少、最没把握。`,
    '2026 S2 practice Q6（2025 S1 practice Q6 同题，多 (d)(e)）': [
      { t: 'graph', nodes: { S1: [40, 30], S2: [110, 30], S3: [180, 30], C1: [250, 30], C2: [320, 30], A: [180, 130] }, labels: { S1: 'S₁', S2: 'S₂', S3: 'S₃', C1: 'C₁', C2: 'C₂' }, edges: 'S1>A S2>A S3>A C1>A C2>A', w: 300, caption: '(a) 卷面画这个（和老师官方答案的图一样）：5 个传感器都指向 $A$；(b) 就按这张图数，6 个节点 = 6 张表。' },
      { t: 'graph', nodes: { F1: [40, 30], S2: [120, 30], S3: [200, 30], C1: [280, 30], C2: [360, 30], S1: [40, 140], A: [200, 140] }, labels: { F1: 'F₁', S1: 'S₁', S2: 'S₂', S3: 'S₃', C1: 'C₁', C2: 'C₂' }, edges: 'F1>S1 F1>A S2>A S3>A C1>A C2>A', cls: { F1: 'hl' }, w: 330, caption: '(d) 改成这样：蓝色 $F_1$ 是真实火情（隐变量），$S_1$ 只是它的读数。' },
      T`(a)(b)(c) follow the teacher's official answer to the 2026 mock.

- (a) $S_1,S_2,S_3,C_1,C_2\to A$: five sensors, each pointing to $A$.
- (b) One table per random variable, so 6 tables. Each sensor's table has one column and one row: the probability that it is True (False is one minus this). The CPT for $A$ has 6 columns (one per parent sensor, one for $A$) and $2^5=32$ rows, one per parent configuration.
- (c) This says nothing about the sensors' tables (not how often they are on). But we can trust the sensors, so the CPT for $A$ is exact (0/1): $A=(S_1\lor S_2\lor S_3)\land\lnot(C_1\lor C_2)$.
- (d) (2025 only, no official answer.) Let $A$ = residents should evacuate. Add a hidden node $F_1$ = real fire at $S_1$, with $F_1\to S_1$, and use $F_1\to A$ instead of $S_1\to A$. $P(S_1\mid F_1)$ holds the false positive / negative rates.
- (e) Plug in the readings, sum out $F_1$: $P(A{=}1\mid\text{readings})=\sum_fP(A{=}1\mid f,s_2,s_3,c_1,c_2)\,P(f\mid s_1)$. Raise the alarm if it is above a threshold (e.g. 0.5).

中文：(a)(b)(c) 照老师答案：6 张表；传感器的表 1 行，$A$ 的表 32 行 6 列；"准确"只说明 $A$ 的表全是 0/1，传感器的表还是不知道。(d)(e) 只有 2025 卷有，没有官方答案：先写清 $A$ 是"该不该撤离"，加隐变量"真火" $F_1$，$A$ 看真火；报警时对 $F_1$ 求和算后验。`],
    '2026 S2 practice Q1(d)': T`Conv layer: filter width 3, weights shared, so 3. Fully connected: $5\times4=20$ and $4\times5=20$. Total $3+20+20=43$.

中文：卷积层共享权重，只算 3 个，不是 $5\times3=15$。`,
    '2026 S2 practice Q3（= 2025 S1 practice Q3 = 2023 S1 Q3(a)）': T`VC = 2.
- $\{x_1,x_3\}$ is shattered: its columns show 00, 01, 10, 11 (all 4 patterns).
- No 3 points are shattered: a shattered column needs at least four 0s and four 1s, and only $x_3,x_4$ have that, so no 3 columns show all 8 patterns.

中文：找到两列 4 种组合全齐，所以至少 2；凑不出 3 列 8 种组合，所以就是 2。`,
    '2026 S2 practice Q4': T`No.
- The ancestral graph contains all nodes.
- Moralise (marry parents): $S$–$U$, $S$–$T$, $U$–$X$, $V$–$W$, $V$–$Y$, $W$–$Y$. Drop the arrows.
- Remove $V,W$. The path $S$–$U$–$Y$–$Z$ is still there, so $S\perp Z\mid V,W$ does not hold.

中文：结婚边 $S$—$U$ 把 $S$ 和 $Z$ 连通了，所以不成立。`,
    '2026 S2 practice Q5': T`Eliminating $T,X,Z$ adds the fill-in edges $U$–$W$, $U$–$Y$, $W$–$Y$.
Junction tree cliques: $\{T,U,W\}$, $\{U,X,Y\}$, $\{V,W,Y,Z\}$, $\{U,V,W,Y\}$.
The later cliques $\{V,W,Y\}$, $\{V,Y\}$, $\{Y\}$ are inside these, so they are dropped.

中文：每删一个点，把它的邻居两两连起来，"这个点 + 邻居"就是一个团；最后去掉被包含的小团。`,
    'Workshop 12 Q2': T`Yes. In an MRF, just remove $V$ and $Z$. Then $W$ is only connected to $T$ and cannot reach $Y$, so $W\perp Y\mid V,Z$ holds.

中文：删掉条件节点，两点不连通就是独立。`,
    '2021 Q11': T`The variance is $\sigma^2+\mathbf x_*'V_N\mathbf x_*$. The noise $\sigma^2$ is the same everywhere. The second part depends on $\mathbf x_*$: small near the training data, large far from it. So the model is more unsure where it has seen little data.

中文：噪声那一项不变；第二项离训练数据越远越大。`,
    'Workshop 12 Q3': T`- $P(V)\propto m_{R\to V}\,m_{S\to V}\,m_{T\to V}\,m_{U\to V}\,m_{W\to V}\,m_{Y\to V}$: the product of all 6 incoming messages, then normalise.
- $m_{V\to S}(S)=\sum_V\psi_{VS}(V,S)\,m_{R\to V}\,m_{T\to V}\,m_{U\to V}\,m_{W\to V}\,m_{Y\to V}$: all messages into $V$ except the one from $S$, times the edge potential, summed over $V$.

中文：边缘 = 所有来信相乘；发给 $S$ 的信 = 除了 $S$ 以外的来信 × 这条边的势，再对 $V$ 求和。`,
    'Workshop 8': T`- Logistic regression: $3072\times10+10=30730$.
- CNN: Conv I $8\times(5\cdot5\cdot3)+8=608$; Conv II $16\times(5\cdot5\cdot8)+16=3216$; Dense $400\times256+256=102656$; Dense $256\times10+10=2570$; pooling 0. Total $109050$.

中文：卷积层 = filter 个数 ×（$k\cdot k\cdot$ 输入通道）+ filter 个数；全连接 = 输入 × 输出 + 输出；pooling 是 0。`,
    'Worksheet 6（同类练习）': T`Let $\varphi(A)$ be a 0/1 vector: entry $j$ is 1 if element $j$ is in $A$. Then $\varphi(A_1)'\varphi(A_2)$ counts the elements in both sets, which is $|A_1\cap A_2|$. It is a dot product of features, so it is a valid kernel.

中文：用"在不在集合里"的 0/1 向量当特征，点积正好是交集的大小。`,
    '2021 S1 exam Q15': T`$k_1,k_2$ are valid, so $k_1=\varphi_1(\mathbf a)^\top\varphi_1(\mathbf a')$ and $k_2=\varphi_2(\mathbf b)^\top\varphi_2(\mathbf b')$.
Stack them: $\varphi_3(\mathbf x)=[\varphi_1(\mathbf a);\ \varphi_2(\mathbf b)]$.
Then $\varphi_3(\mathbf x)^\top\varphi_3(\mathbf x')=k_1+k_2=k_3$. So $k_3$ is a dot product of features, hence a valid kernel.

中文：把两个特征向量拼起来，拼接后的点积就是两个 kernel 之和。`,
    'Workshop 9': T`- Technique: track the total weight $W$. Upper bound: $W$ shrinks whenever the algorithm has loss. Lower bound: $W\ge$ the best expert's weight $(1-\epsilon)^{L^*}$. Take logs of both bounds.
- Regret $=4-2=2$.
- Bound $=\frac{\ln3}{0.1}+1.1\times2=11+2.2=13.2$.
- Trivial maximum $=10\times1=10$. The bound (13.2) is bigger than 10, so here it tells us nothing.

中文：regret = 自己的损失 − 最好专家的损失；代公式；平凡上界 = 轮数；定理的界比它还大，就没有用。`,
    '2023 S1 Q3(b)(c)（据学生笔记）': T`- (b) VC = 4. Four points in a diamond (left, right, top, bottom) can be labelled in all 16 ways: a rectangle around only the $+$ points never contains a $-$ point.
- (c) Take any 5 points. Label the leftmost, rightmost, top and bottom points $+$, and one other point $-$. Any rectangle containing the $+$ points contains all 5 points, including the $-$ one. This labelling is impossible, so VC < 5.

中文：菱形的 4 个点能做出所有标注；任意 5 个点，把最外面 4 个标 $+$、中间一个标 $-$，就做不到。`,
    '2022 S1 exam Q3(b)(c)': T`- (b) VC = 1. One point works: with $t$ below it we get 1, with $t$ above it we get 0. For two points $x_1<x_2$, the labelling $(1,0)$ is impossible, because $I_t$ always gives 0s then 1s.
- (c) VC = 2. Two points: $I_t$ gives $(0,0),(0,1),(1,1)$, and $1-I_t$ gives $(1,0)$. Three points: $(1,0,1)$ is impossible for both kinds.

中文：$I_t$ 只能"先 0 后 1"；加上反过来的 $1-I_t$ 后两个点都能做；三个点的 $1,0,1$ 做不到。`,
    'Workshop 5 Ex3': T`Start with $\mathbf w=(0,0,0)$. Predict $+1$ if $s\ge0$. Update only when wrong: $\mathbf w\leftarrow\mathbf w+0.1\,y\mathbf x$.
- Epoch 1: $(1,0,0)$ is wrong, so $\mathbf w=(-0.1,0,0)$.
- Epoch 2: $(1,1,1)$ is wrong, so $\mathbf w=(0,0.1,0.1)$; then $(1,0,0)$ is wrong, so $\mathbf w=(-0.1,0.1,0.1)$.
- Epoch 3: all correct, so stop. Answer: $\mathbf w=(-0.1,0.1,0.1)$.

中文：分错才更新；一整轮都没错就停。`,
    '2025 S1 practice Q2': T`Add the feature $x_1x_2$: $\varphi(\mathbf x)=(x_1,x_2,x_1x_2)$, with $\mathbf w=(1,1,-2)$ and $b=-0.5$.
Scores: $(0,0)\to-0.5$, $(0,1)\to0.5$, $(1,0)\to0.5$, $(1,1)\to-0.5$. Positive means class 1, so all 4 points are correct: the data are now linearly separable.

中文：加一个乘积特征，写出 $\mathbf w$ 和 $b$，四个点逐个代入验算。`,
    '2025 S1 practice Q4': T`- (a) $P(A)$ and $P(B)$: 2 entries each. $P(C\mid A,B)$: $2\times4$, one column per value of $(A,B)$, and each column sums to 1.
- (b) MLE: choose the table values that make the observed data most likely. With complete data, each entry = count / count of its parent setting.
- (c) $P(A{=}T)=2/5$, $P(B{=}T)=2/5$; $P(C{=}T\mid A,B)$: $FF\ 1/2$, $FT\ 0$, $TF\ 1$, $TT\ 1$.

中文：先画出表的格式；MLE 就是数频率；按父节点的取值分组来数。`,
    '2025 practice Q1(c)': T`$A$ and $B$ are independent given $C$: once we know $C$, knowing $B$ tells us nothing more about $A$.

中文：给定 $C$ 之后，$A$ 和 $B$ 独立。`,
    '2025 practice Q1(d)(e)': [
      { t: 'graph', nodes: { X: [40, 40], Y: [150, 40], Z: [260, 40], V: [95, 150] }, edges: 'X>V Y>V', w: 300, caption: '(e) 的图：$X,Y,Z$ 没有父节点，$V$ 的父节点是 $X,Y$。' },
      T`(d) $2^4=16$ rows. (e) The joint is $P(X)P(Y)P(Z)P(V\mid X,Y)$, so $2+2+2+8=14$ rows.

中文：完整联合表 $2^4$ 行；分解以后每张小表的行数加起来。`],
    '2016 S2 Q1.10': T`The training points that lie on the margin (with a soft margin, also points inside the margin or misclassified). They have $\lambda_i>0$, and only they decide the boundary.

中文：贴在 margin 上的点；只有它们决定边界。`,
    '2021 Q2': T`The 1 is not a distance. It is $y_i(\mathbf w'\mathbf x_i+b)=1$, a scale we choose for $\mathbf w$. The real distance is $1/\|\mathbf w\|$, which can be larger than 1.

中文：这个 1 是我们规定的缩放，真正的距离是 $1/\|\mathbf w\|$。`,
    '2022 S1 Q1(f)': T`The SVM problem is convex (a quadratic objective with linear constraints), so strong duality holds: the primal optimum equals the dual optimum.

中文：凸问题满足强对偶，两个最优值相等。`,
    '2017 S2 Q5(b)': T`MAP uses only one value: the peak of the posterior. Full Bayes keeps the whole posterior and averages predictions over it. They differ when data are few: with 2 heads in 2 tosses and a uniform prior, MAP says P(head) = 1, full Bayes says 3/4.

中文：MAP 只取后验的峰值，完整的 Bayes 对整个后验取平均；数据少的时候差别大。`,
    '2021 Q10': T`Conjugacy lets us write the full posterior (and its normaliser) in closed form. MAP only needs the peak, $\arg\max_\theta[\log p(D\mid\theta)+\log p(\theta)]$. The normaliser does not affect the peak, so we can just optimise numerically, without conjugacy.

中文：MAP 只是求最大值，不用算分母，所以不需要共轭。`,
    '2017 S2 Q2(c)': T`$p(y_i\mid\mathbf x_i,\mathbf w)=\mathcal N(y_i\mid\mathbf x_i'\mathbf w,\sigma^2)$.

$\log\prod_ip(y_i\mid\mathbf x_i,\mathbf w)=-\frac n2\log(2\pi\sigma^2)-\frac1{2\sigma^2}\sum_i(y_i-\mathbf x_i'\mathbf w)^2$.

The first term does not depend on $\mathbf w$, so maximising this is the same as minimising $\sum_i(y_i-\mathbf x_i'\mathbf w)^2$: least squares.

中文：写出似然，取 log，和 $\mathbf w$ 有关的只剩平方误差那一项。`,
    '2016 S2 Q1.5': T`$p(\theta\mid D)=\dfrac{p(D\mid\theta)\,p(\theta)}{p(D)}$, where $\theta$ = parameters and $D$ = data. Posterior $p(\theta\mid D)$; likelihood $p(D\mid\theta)$; prior $p(\theta)$; evidence $p(D)=\int p(D\mid\theta)p(\theta)\,d\theta$.

中文：后验 = 似然 × 先验 ÷ 证据；四个名字各对应一项。`,
    '2017 S2 Q1(h)': T`Start with the prior. When new data arrive, posterior ∝ likelihood × prior. This posterior becomes the prior for the next data, and so on.

中文：这一次的后验就是下一次的先验。`,
    '2021 Q3': T`Use the primal when the number of training points $n$ is much larger than the number of quadratic features. The dual grows with $n$ (an $n\times n$ kernel matrix); the primal grows with the number of features.

中文：样本数远大于特征数时用 primal。`,
    '2020 S2 practice Q2(b)': T`(1) Soft margin: slack variables $\xi_i$ let some points break the margin, at a cost $C\sum_i\xi_i$. (2) Kernel: map the data to a higher-dimensional space where it is (nearly) separable.

中文：两种办法：允许出错（soft margin），或者用 kernel 升维。`,
    '2016 S2 Q8.1': T`The SVM dual uses the data only through dot products $\mathbf x_i'\mathbf x_j$. Replace them by $K(\mathbf x_i,\mathbf x_j)=\varphi(\mathbf x_i)'\varphi(\mathbf x_j)$. Benefit: a linear model in a high-dimensional space (a non-linear boundary) without ever computing $\varphi$, so it is cheap.

中文：把点积换成 kernel；好处是在高维空间做线性分类，却不用真的算出高维特征。`,
    '2019 S2 practice Q1(e)': T`A joint is a product of conditionals: $P(A,B,C)=P(A\mid B,C)\,P(B\mid C)\,P(C)$.

中文：联合分布 = 一串条件概率相乘。`,
    '2022 S1 Q1(d)': T`No. The v-structure $A\to C\leftarrow B$ says $A\perp B$ but not $A\perp B\mid C$. No undirected graph says exactly this: without the edge $A$–$B$ it says $A\perp B\mid C$; with the edge it loses $A\perp B$.

中文：v-structure 的独立关系，无向图表示不出来。`,
    '2021 Q4': T`The hidden layers turn $\mathbf x$ into new features $\varphi(\mathbf x)$, and the output layer is a linear model on these features. Unlike fixed basis functions, these features are learned from the data.

中文：隐藏层就是基函数，输出层是线性模型；区别是这些基函数是学出来的。`,
    '2021 Q13(b)': T`Use the chain rule through the layers. Output weight: $\frac{\partial L}{\partial w_j}=\delta\,u_j$. Hidden weight: $\frac{\partial L}{\partial v_{ij}}=\frac{\partial L}{\partial z}\frac{\partial z}{\partial s}\frac{\partial s}{\partial u_j}\frac{\partial u_j}{\partial r_j}\frac{\partial r_j}{\partial v_{ij}}=\delta\,w_j\,g'(r_j)\,x_i$. Do a forward pass, compute $\delta$ at the output, then pass it backwards.

中文：链式法则一层一层往回乘；先前向算一遍，再从输出把误差 $\delta$ 往回传。`,
    '2021 Q7': T`Momentum adds up past gradients into a velocity. At a saddle point or a small local minimum the gradient is near 0, but the velocity keeps the parameters moving, so they can roll through.

中文：动量把过去的梯度累积起来，梯度接近 0 的地方也能靠惯性冲过去。`,
    '2022 S1 Q1(a)': T`Adagrad gives each parameter its own learning rate $\eta/\sqrt{g_i+\epsilon}$, where $g_i$ is the sum of its past squared gradients. Parameters with big gradients take smaller steps; rarely updated ones keep bigger steps. So one global learning rate does not need careful tuning.

中文：每个参数各有自己的步长，梯度累积得越多步长越小。`,
    '2022 S1 Q1(b)': T`A CNN only sees a fixed window (its receptive field). An RNN's hidden state carries information from all earlier inputs, so it can capture long-range dependencies and works for any sequence length.

中文：CNN 只看固定宽度的窗口，RNN 的隐藏状态记着前面所有的输入。`,
    '2022 S1 Q1(c)': T`Attention scores each input with the same function, turns the scores into weights with softmax, and outputs the weighted sum $\mathbf c=\sum_j\alpha_j\mathbf h_j$. This works for any number of inputs and always gives a fixed-size output.

中文：给每个输入打分、softmax 成权重、加权求和；输入多长都行，输出大小固定。`,
    '2021 Q9': T`A very powerful encoder and decoder can just memorise the training data, like a lookup table. The reconstruction error is tiny, but the code learns no useful structure and does not generalise.

中文：太强的网络会把训练数据背下来，学不到有用的结构。`,
    '2022 S1 exam Q6（全题 20 分）': T`- (a) Arm = one (headline, picture) choice for an article. Round = one user opens the front page. Reward = 1 if clicked, 0 if not, so total reward = total clicks.
- (b) Context = user features (location, past clicks, favourite categories, device, time) + arm features (article category, headline words, picture type).
- (c) i.i.d. is not realistic: click rates change with the user and over time (news gets old). Context helps: given the context, rewards are closer to i.i.d.
- (d) Log rounds where the arm was chosen uniformly at random, with the context and the click. Then evaluate any bandit offline by replay: keep only the rounds where its choice matches the logged arm.

中文：臂、轮、奖励对上题目；context = 用户特征 + 文章特征；i.i.d. 不现实，有 context 会好一些；用均匀随机的日志做 replay 离线评估。`,
    // the other-year questions folded under each item (MORE)
    '2017 S2 exam Q3(a)': T`In the dual, the SVM keeps one $\lambda_i$ per training point and predicts with $\sum_i\lambda_iy_iK(\mathbf x_i,\mathbf x)+b$, so it must store the support vectors. The number of parameters grows with the data instead of being fixed. (With an RBF kernel the feature space is infinite, so no fixed weight vector exists.)

中文：对偶形式每个训练点一个 $\lambda_i$，参数个数随数据增长，所以算非参数。`,
    '2017 S2 exam Q1(d)': T`The perceptron stops at any line that separates the data; which one depends on the starting weights and the order of the examples. The hard-margin SVM finds the one line with the largest margin, so its answer is unique and more robust.

中文：感知机找到任意一条能分开的线就停；SVM 找 margin 最大的那一条。`,
    '2021 S1 exam Q17': T`- (1) Optimistic start: an arm never pulled gets the value $Q_0$; with $Q_0=\infty$ every arm is tried at least once.
- (2) The bonus $\sqrt{\rho\log t/N_{t-1}(i)}$: few pulls (small $N$) means a big bonus. For an arm left alone, $\log t$ keeps growing while $N$ stays the same, so its bonus grows until it is pulled again. Larger $\rho$ = more exploration.

中文：两个机制：没拉过的臂初值设得很大；拉得少的臂加分大，而且一直不拉，加分会越来越大。`,
    '2021 S1 exam Q14(c)': T`A full table can represent any $P(D\mid A,B)$. Logistic regression $P(D{=}1\mid A,B)=\sigma(w_0+w_AA+w_BB)$ forces the log-odds to be linear in $A$ and $B$, so it cannot represent interactions such as XOR: more bias. In return it has less variance (shared parameters), and it still predicts for parent values never seen in training.

中文：表能表示任意分布；logistic regression 只能是线性的，表达能力下降（偏差变大），但方差变小。`,
    '2017 S2 exam Q11': [
      { t: 'graph', nodes: { F: [210, 30], S1: [60, 140], S2: [160, 140], S3: [260, 140], T: [370, 140] }, labels: { S1: 'S₁', S2: 'S₂', S3: 'S₃' }, edges: 'F>S1 F>S2 F>S3 F>T', w: 340, caption: '(a) 卷面画这个（$I=3$ 时）：流感指向每个症状和检测结果。' },
      T`- (a) $F\to S_i$ for every $i$, and $F\to T$. Joint: $P(F)\prod_iP(S_i\mid F)\,P(T\mid F)$. The test can be wrong, so $P(T\mid F)$ is not all 0/1: $P(T{=}1\mid F{=}0)$ is the false positive rate, $P(T{=}0\mid F{=}1)$ the false negative rate.
- (b) The doctor only sees the evidence. Inaccurate: $S_1,\dots,S_I,T\to D$, table entries between 0 and 1. Perfectly accurate: $F\to D$ with a 0/1 table ($D=F$).
- (c) The posterior $P(F\mid S_1=s_1,\dots,S_I=s_I,T=t)$ (leave out $T$ if no test was done).
- (d) Records of past patients with every variable, including the true $F$ (confirmed later). MLE = counting, e.g. $\hat P(T{=}1\mid F{=}0)=\#\{T=1,F=0\}/\#\{F=0\}$.

中文：流感指向症状和检测；检测会错 → 表里不全是 0/1；诊断就是算后验；有完整数据就数频率。`],
    '2016 S2 exam Q12（12.1–12.4）': [
      { t: 'graph', nodes: { S: [200, 30], M1: [90, 130], M2: [200, 130], M3: [310, 130], C: [200, 240], R: [40, 240] }, labels: { M1: 'M₁', M2: 'M₂', M3: 'M₃' }, edges: 'S>M1 S>M2 S>M3 M1>C M2>C M3>C M1>R', w: 320, caption: '12.1 卷面画这个（$N=3$，讲师教第 1 门）；12.2 按这张图数表。' },
      T`- 1. $S\to M_i$ for every subject; $M_1,\dots,M_N\to C$; only $M_k\to R$ ($k$ = the lecturer's subject).
- 2. $N+3$ tables. $P(S)$: 1 free parameter. Each $P(M_i\mid S)$: 2. $P(C\mid M_1,\dots,M_N)$: $2^N$. $P(R\mid M_k)$: 2. Total $2^N+2N+3$.
- 3. Separate the true mark $M_i$ from the mark written on the CV, $M_i'$. Add $H$ (honest or not): $M_i\to M_i'\leftarrow H$, and $M_1',\dots,M_N'\to C$. Honest: $M_i'=M_i$ (0/1 table). Dishonest: a low mark may be written as high.
- 4. Probabilistic inference. Observe the CV marks $M_i'$ and the letter $R$; compute $P(S\mid m',r)$ and $P(H\mid m',r)$, summing out the true marks (elimination). Inputs: these observations, the graph and the learned CPTs.

中文：逐句翻成箭头；二元变量每张表的自由参数 = 父节点组合数；不诚实 → 把真实值和写出来的值分开；招聘方做推断算后验。`],
    '2023 Q5(a)(b)（据学生笔记；学期未标）': T`- (a) Output $=\lfloor(n+2p-k)/s\rfloor+1$: $\lfloor(32+2-5)/s\rfloor+1=15$, so $\lfloor29/s\rfloor=14$, so $s=2$.
- (b) Pooling uses the same formula: $\lfloor(15-2)/2\rfloor+1=7$, so $7\times7$.

中文：套输出尺寸公式，反解 stride；pooling 也用同一个公式。`,
    '2022 S1 exam Q5': T`- 1. The feature map is $2\times2$ ($3-2+1=2$). Parameters: the filter $w_{1,1},w_{1,2},w_{2,1},w_{2,2}$ and a bias $b$. Write all four, e.g. $h_{1,1}=w_{1,1}x_{1,1}+w_{1,2}x_{1,2}+w_{2,1}x_{2,1}+w_{2,2}x_{2,2}+b$; in general $h_{i,j}=\sum_{a,c}w_{a,c}\,x_{i+a-1,\,j+c-1}+b$. Output $y=\max_{i,j}h_{i,j}$.
- 2. Let $\delta=\partial L/\partial y$. Max pooling sends the gradient only to the winner $(i^*,j^*)$; the other three get 0. So $\frac{\partial L}{\partial w_{a,c}}=\delta\,x_{i^*+a-1,\,j^*+c-1}$ and $\frac{\partial L}{\partial b}=\delta$. Update $w_{a,c}\leftarrow w_{a,c}-\eta\,\frac{\partial L}{\partial w_{a,c}}$.

中文：写出 4 个格子的公式再取 max；反传时梯度只走 max 的赢家，filter 的梯度 = $\delta$ × 赢家那个输入窗口。`,
    '“2021 S1” Q6(a)(b)（据学生笔记；年份标签存疑）': T`- (a) $C_{out}(C_{in}k^2+1)=32\times(3\times121+1)=32\times364=11648$ (11616 without bias).
- (b) The receptive field stays 11 if $\sum_i(k_i-1)=10$. Five stacks: $7+5$; $7+3+3$; $5+5+3$; $5+3+3+3$; five $3\times3$. Per channel pair they use fewer weights than $11^2=121$ (74, 67, 59, 52, 45).

中文：参数 = 输出通道 ×（输入通道 × $k^2$ + 1）；能替换的条件是各层的 $k-1$ 加起来等于 10。`,
    '2020 Q5(a)(b)(c)（据学生笔记）': T`- (a) $\lfloor(n+2p-k)/s\rfloor+1$. Layer 1: $\lfloor(64-11)/2\rfloor+1=27$, so $27\times27\times64$. Layer 2: $\lfloor(27-2)/2\rfloor+1=13$, so $13\times13\times64$. Layer 3: $13+8-9+1=13$, so $13\times13\times64$.
- (b) Layer 1: $64\times3\times11^2=23232$. Layer 2 (pooling): 0. Layer 3: $64\times64\times9^2=331776$. Layer 4: $13\cdot13\cdot64\times10=108160$.
- (c) Keep $\sum_i(k_i-1)=8$ with stride 1: two $5\times5$; four $3\times3$; $5\times5+3\times3+3\times3$ (or $7\times7+3\times3$).

中文：尺寸套公式；参数 = 输出通道 × 输入通道 × $k^2$；pooling 没有参数；换成小卷积只要 $k-1$ 加起来等于 8。`,
    '2020 Q4(a)（据学生笔记；年份按同题 (b) 的图名推断）': T`Output size $\lfloor(4-2)/2\rfloor+1=2$. Stride 2 cuts the patch into four non-overlapping $2\times2$ blocks. Each output = multiply the block and the kernel entry by entry, then add: $\begin{bmatrix}2&1\\0&0\end{bmatrix}$.

中文：stride 2 就是切成四块不重叠的 2×2，每块和 kernel 对应相乘再相加。`,
    '2020 Q4(b)（据学生笔记）': T`A $3\times3$ kernel on a $3\times3$ patch gives one number, and $K_a-K_b=\sum_{ij}w_{ij}(a_{ij}-b_{ij})$. Put $w=1$ exactly where $a-b=+1$ (or exactly where $a-b=-1$); the difference is then 4. Two kernels: $\begin{bmatrix}0&1&0\\1&0&1\\0&1&0\end{bmatrix}$ and $\begin{bmatrix}1&0&1\\0&0&0\\1&0&1\end{bmatrix}$.

中文：先算 $a-b$，只在同号的格子放 1，差值最大。`,
    '2022 S1 exam Q3(a)': T`$\mathrm{VC}(F)=3$. $\{x_2,x_3,x_4\}$ is shattered: on these columns the 8 rows give all $2^3=8$ patterns. 4 points would need $2^4=16$ rows, but the table has only 8.

中文：找到 3 列八种组合都出现；8 行不够 shatter 4 个点。`,
    '2021 S1 exam Q16': T`- (a) $\mathrm{VC}=3$, e.g. $\{x_1,x_3,x_4\}$ shows all 8 patterns. 8 rows cannot shatter 4 points ($8<16$).
- (b) Size 0: $\varnothing$ (1). Size 1: every $\{x_i\}$ (6). Size 2: 11 pairs, all except $\{x_1,x_5\},\{x_2,x_5\},\{x_3,x_5\},\{x_4,x_6\}$. Size 3: $\{x_1,x_3,x_4\},\{x_1,x_3,x_6\}$ (2). Total 20 with the empty set (19 without).

中文：先找最大的 shattered 集；再按大小逐个列，每个 pair 只看那两列四种组合齐不齐。`,
    '2020 Q7(a)（据学生笔记）': T`$\mathrm{VC}(F)=3$. $\{x_2,x_4,x_5\}$ is shattered: the 8 rows give all 8 patterns. 4 points would need 16 rows, but there are only 8.

中文：和上一题一样：找 3 列八种组合齐全；8 行不够 4 个点。`,
    '2021 S1 exam Q18(a)': T`All of $b_1,\dots,b_T$, and only them. The two chains meet only at the $x_t$, which are colliders ($a_t\to x_t\leftarrow b_t$). With no $x$ observed, every path from $a_1$ to the $b$ chain is blocked. The other $a_t$ and the $x_t$ are linked to $a_1$ through the $a$ chain, so they are dependent.

中文：两条链只在 $x_t$ 碰头，$x_t$ 是 collider，不观测就挡住，所以 $a_1$ 和整条 $b$ 链独立。`,
    '2017 S2 exam Q9(a)(b)': T`- (a) $P(A,B,C,D,E)=P(B)\,P(A\mid B)\,P(C\mid B)\,P(D\mid B,C)\,P(E\mid C)$.
- (b) $B$ and $E$ are not independent ($B\to C\to E$). $B\perp E\mid C$, and also with $A$ and/or $D$ added: $B\perp E\mid A,C$; $B\perp E\mid C,D$; $B\perp E\mid A,C,D$. Every path from $B$ to $E$ goes through $C$.

中文：每个节点乘上"给定父节点"的概率；$B$ 到 $E$ 必经 $C$，只要给定 $C$ 就独立。`,
    '2023 S1 exam PGM 题 (b)(c)（据学生笔记）': T`- (b) Moralise: $E$'s parents $A,H$, add $A$–$H$ (1). Eliminate $A$: connect all its neighbours $B,C,D,E,F,H$; only $E$–$H$ exists, so add 14. Eliminate $E$: connect $I$ to $B,C,D,F,H$, add 5. Total $1+14+5=20$ extra edges.
- (c) Two cliques of 7 nodes: $\{A,B,C,D,E,F,H\}$ and $\{B,C,D,E,F,H,I\}$.

中文：先 moralise，再每消一个点就把它的邻居两两连上，数新加的边。`,
    '2022 S1 exam Q2（图来自学生笔记）': T`- (a) Moralise: $C$ has parents $H,E,D$, so add $H$–$E$, $H$–$D$, $D$–$E$, then drop the arrows. Eliminating $A,B,\dots,G$ in order adds no new edge (each node's remaining neighbours are already connected), so the result is the moral graph.
- (b) 4: $\{C,D,E,H\}$.
- (c) $O(n\,2^{k})$ with $k=4$ (binary variables): exponential in the largest clique size.

中文：先把共同父节点连起来；按顺序消元，邻居两两连；复杂度对最大 clique 是指数级。`,
    '“2022 S1” PGM 题 (a)(b)（据学生笔记；年份标签存疑）': T`- (a) Moralise: add $A$–$E$ (parents of $B$) and $B$–$D$ (parents of $C$). Eliminate $A$ (neighbours $B,E,F$): add $B$–$F$. Eliminate $B$ (neighbours $C,D,E,F$): add $C$–$E$, $C$–$F$, $D$–$F$. The rest add nothing. Result: every pair connected except $A$–$C$ and $A$–$D$.
- (b) Largest clique $\{B,C,D,E,F\}$, $k=5$, so $O(n\,2^5)$: exponential in the largest clique size.

中文：和上一题同样的步骤：moralise → 依次消元、连邻居 → 数最大 clique。`,
    '2021 S1 exam Q18(b)': T`- Factors: $\psi(a_1)=P(a_1)$, $\psi(b_1)=P(b_1)$, $\psi(a_1,a_2)=P(a_2\mid a_1)$, $\psi(b_1,b_2)=P(b_2\mid b_1)$, $\psi(x_1,a_1,b_1)=P(x_1\mid a_1,b_1)$, …
- Step 1, eliminate $X_1$ (observed): no sum, just plug in the value: $m_{x_1}(a_1,b_1)=\psi(x_1,a_1,b_1)$, a slice of the table.
- Step 2, eliminate $A_1$: multiply every factor containing $a_1$, then sum over $a_1$: $m_{a_1}(a_2,b_1)=\sum_{a_1}\psi(a_1)\,\psi(a_1,a_2)\,m_{x_1}(a_1,b_1)$. As matrices: $m_{a_1}=A^\top\mathrm{diag}(p)\,M$, with $A[a_1,a_2]=P(a_2\mid a_1)$, $p(a_1)=P(a_1)$, $M[a_1,b_1]=m_{x_1}(a_1,b_1)$.

中文：观测变量直接代值，取出一个切片；其他变量：含它的因子相乘再求和，写成矩阵乘法。`,
    '“2021 S1” U-PGM 题（据学生笔记；年份标签存疑）': T`- (a) Group by $C$: $Z=\sum_c\big(\sum_{a,b}f(a,b,c)\big)\big(\sum_{d,e}g(c,d,e)\big)$. $C=T$: the $g$ part sums to 0, so 0. $C=F$: $12\times11=132$. So $Z=132$.
- (b) $\Pr(A{=}F,B{=}F,C{=}F)=\frac1Z f(F,F,F)\sum_{d,e}g(F,d,e)=\frac{3\times11}{132}=\frac14$.

中文：按共享变量 $C$ 分组，两边分别求和再相乘；问到的变量固定，剩下的变量求和掉。`,
    '2019 exam Q8（据学生笔记）': T`- 1. Group by $C$: $Z=(3+1+2+4)(3+0)+(1+6+4+0)(0+3)=30+33=63$.
- 2. $\Pr(A{=}F,B{=}T,C{=}F)=\frac1Z f(F,T,F)\sum_dg(F,d)=\frac{4\times3}{63}=\frac4{21}$. Don't forget to sum over $D$.

中文：$Z$ 按 $C$ 分组算；问到的变量固定，没问到的 $D$ 求和。`,
    '2016 S2 exam Q9（9.1–9.3）': T`- 1. $\Pr(a,b,c,d)=\frac1Z f(a,b,c)\,g(c,d)$.
- 2. Group by $C$: $Z=(5+3+3+1)(0+4)+(3+1+1+0)(4+0)=48+20=68$.
- 3. $\Pr(A{=}F,C{=}F)=\frac1Z\big(\sum_bf(F,b,F)\big)\big(\sum_dg(F,d)\big)=\frac{1\times4}{68}=\frac1{17}$.

中文：联合 = 势函数相乘 ÷ $Z$；$Z$ 按 $C$ 分组算；没问到的 $B$、$D$ 求和。`,
    '2017 S2 exam Q3(b)': T`$K_1(\mathbf u,\mathbf v)=\varphi_1(\mathbf u)'\varphi_1(\mathbf v)$ and $K_2(\mathbf u,\mathbf v)=\varphi_2(\mathbf u)'\varphi_2(\mathbf v)$. Stack the features: $\varphi(\mathbf u)=\begin{bmatrix}\varphi_1(\mathbf u)\\\varphi_2(\mathbf u)\end{bmatrix}$. Then $\varphi(\mathbf u)'\varphi(\mathbf v)=\varphi_1(\mathbf u)'\varphi_1(\mathbf v)+\varphi_2(\mathbf u)'\varphi_2(\mathbf v)=K_1+K_2$. A dot product in a feature space, so $K_1+K_2$ is a kernel.

中文：把两个特征向量拼在一起，点积正好是两个 kernel 相加。`,
    '2017 S2 exam Q10(b)': T`A kernel gives a non-linear boundary. Buying depends on combinations of previews (e.g. many sci-fi and many action), which a linear classifier on the raw features cannot capture; the kernel works in a high-dimensional space with these combinations without building them. It can also compare preview histories directly, e.g. $K(A_1,A_2)=|A_1\cap A_2|$ (movies both users previewed).

中文：kernel 能学非线性（特征的组合），还能直接在预览记录这种集合上定义相似度。`,
    '2016 S2 exam, Q8.2': T`$k$ is a kernel, so $k(\mathbf u,\mathbf v)=\varphi(\mathbf u)'\varphi(\mathbf v)$. Since $c>0$, let $\psi(\mathbf u)=\sqrt c\,\varphi(\mathbf u)$. Then $\psi(\mathbf u)'\psi(\mathbf v)=c\,\varphi(\mathbf u)'\varphi(\mathbf v)=c\,k(\mathbf u,\mathbf v)$, a dot product, so $c\,k$ is a kernel.

中文：特征乘 $\sqrt c$，点积就乘 $c$。`,
    '2016 S2 exam, Q1.9': T`A kernel is a function $K(\mathbf u,\mathbf v)=\varphi(\mathbf u)'\varphi(\mathbf v)$: the dot product after mapping the inputs to a feature space. The SVM dual uses the data only through dot products, so we replace them with $K$ and never compute $\varphi$.

中文：kernel = 映射到特征空间以后的点积。`,
    '2016 S2 exam Q10（10.1–10.3）': T`- 1. Posterior ∝ likelihood × prior $=\frac{\lambda^xe^{-\lambda}}{x!}\cdot\frac{\lambda^{\alpha-1}e^{-\lambda\beta}}{Z(\alpha,\beta)}\propto\lambda^{(\alpha+x)-1}e^{-\lambda(\beta+1)}$ (drop every factor without $\lambda$). This has the Gamma form, so the posterior is Gamma: conjugate.
- 2. $\alpha'=\alpha+x$, $\beta'=\beta+1$.
- 3. The full posterior is more informative: the mode is one number, the distribution also shows the uncertainty. With few data the posterior is wide and the mode loses a lot; with many data it is narrow around the mode, so the difference is small.

中文：似然 × 先验，合并同底的幂，认出 Gamma 的形状；后验分布比众数信息多，数据越多差别越小。`,
    '2022 S2 Q5(a)(b)（据学生笔记）': T`- (a) $\mathrm{VC}(\bar F)=\mathrm{VC}(F)$. On any set of points, the labellings of $\bar F$ are the flipped labellings of $F$. Flipping is one-to-one, so $F$ gets all $2^{|S|}$ labellings exactly when $\bar F$ does: they shatter the same sets.
- (b) $\mathrm{VC}(F_{n,k})=k$. Any $k$ points: every labelling has at most $k$ positives, so it is in the family: shattered. Any $k+1$ points: all positive is impossible: not shattered.

中文：(a) 取反不改变能做出的标注个数；(b) $k$ 个点随便标都行，$k+1$ 个点标不出全正。`,
    '2020 Q7(b)（据学生笔记）': T`$\mathrm{VC}(H)=\mathrm{VC}(F)+\mathrm{VC}(G)$. The two domains are separate, so $H$ labels the first part with any $f$ and the second part with any $g$, independently. A set shattered by $F$ plus a set shattered by $G$ is shattered by $H$. And any set shattered by $H$ splits into a part shattered by $F$ and a part shattered by $G$, so it cannot be bigger.

中文：两个定义域互不相干，可以分别随便标，所以 VC 相加。`,
    '2016 S2 Q7': T`No bias: $s=\mathbf w'\mathbf x=2(-2)+3(3)+4(1)=9>0$, so we predict $+1$ but $y=-1$: wrong, so update. $\mathbf w\leftarrow\mathbf w+\eta y\mathbf x=\mathbf w-\eta\mathbf x$. Introduce the learning rate $\eta=1$: $\mathbf w=(4,0,3)$. (With $\eta=0.1$: $(2.2,2.7,3.9)$.)

中文：先算分数判断对错；错了就 $\mathbf w\leftarrow\mathbf w+\eta y\mathbf x$；学习率要自己设并写明。`,
  };
  const usedEasy = {};
  const easyFor = (src) => { if (EASY[src]) usedEasy[src] = true; return EASY[src]; };
  // copies of this page's question blocks with the exam answer attached; the shared originals are not touched
  const withEasy = (bs) => bs.map((b) => {
    if (!b) return b;
    if (b.t === 'past' && easyFor(b.src)) return Object.assign({}, b, { easy: EASY[b.src] });
    if (b.t === 'examqPick') return Object.assign({}, b, { picks: b.picks.map(([id, src]) => (easyFor(src) ? [id, src, EASY[src]] : [id, src])) });
    if (b.t === 'deep' && b.blocks) return Object.assign({}, b, { blocks: withEasy(b.blocks) });
    return b;
  });

  const chip = (s) => ({ cls: 'kw', text: s.replace(/^(.*?)\s*([一-鿿].*)$/, '**$1** $2') });
  const keywords = (s, label) => ({ t: 'chips', items: [{ cls: 'kw-label', text: label }].concat(s.split(' | ').map(chip)) });

  // a day and a half: the full day takes the mock and this year's shortest workshop items, the half day the rest of this year and 2025
  const DAY1 = ['cq', 'mrf', 'w11', 'bp', 'ws8'];
  const SEGS = { 1: '第一段：一整天（老师 mock、Quiz、★ 老师点名、W8、W11、W12）', 2:'第二段：半天（其余 workshop 手写题、去年 practice、必背简答）', 3: '有空再做：更早的卷（前两段做完还有时间才做）', 4: '出门前 30 分钟（不管做到哪，这项都要做）' };
  items.forEach((it) => {
    it.star = STAR.indexOf(it.id) >= 0;
    it.seg = it.tier === 1 || it.star || DAY1.indexOf(it.id) >= 0 ? 1 : it.tier <= 3 ? 2 : it.tier === 4 ? 3 : 4;
    if (it.last) return;
    const n = it.qs || 1;
    it.ev = n * it.p * it.m * it.q;
    it.score = it.ev / (it.mins / 60);
    const hit = 1 - Math.pow(1 - it.p, n); // chance at least one of the questions appears
    it.likely = hit >= .75 ? '高' : hit >= .4 ? '中' : '低';
    it.hard = it.q >= .85 ? '易' : it.q >= .65 ? '中' : '难';
  });
  items.sort((a, b) => a.seg - b.seg || a.tier - b.tier || (b.pin ? 1 : 0) - (a.pin ? 1 : 0) || (b.star ? 1 : 0) - (a.star ? 1 : 0) || (b.score || 0) - (a.score || 0));

  const marked = () => SML.store.get('checklist', {});
  function sync() {
    const m = marked();
    document.querySelectorAll('input[data-sp]').forEach((c) => {
      const on = !!m[c.dataset.sp];
      c.checked = on;
      const row = c.closest('tr, .sp-tick');
      if (row) row.classList.toggle('done', on);
    });
    const count = document.querySelector('.sp-count');
    if (count) count.innerHTML = countText(m);
  }
  function countText(m) {
    const got = items.filter((it) => m[it.id]);
    const all = items.reduce((s, it) => s + (it.marks || 0), 0);
    return '已勾 <b>' + got.length + '</b> / ' + items.length + ' 项 · mock 已拿下 <b>' + got.reduce((s, it) => s + (it.marks || 0), 0) + '</b> / ' + all + ' 分';
  }
  function checkbox(id) {
    const c = document.createElement('input');
    c.type = 'checkbox';
    c.dataset.sp = id;
    c.checked = !!marked()[id];
    c.addEventListener('change', () => {
      const m = marked();
      if (c.checked) m[id] = true; else delete m[id];
      SML.store.set('checklist', m);
      sync();
    });
    return c;
  }
  const hm = (mins) => (mins >= 60 ? Math.floor(mins / 60) + ' 小时' : '') + (mins % 60 ? ' ' + (mins % 60) + ' 分钟' : '');

  // not an h2 block: the ledger is this page's table of contents, so nothing goes into the auto TOC
  SML.render.blocks.spHead = function (b) {
    const { el } = SML.render;
    const { inline } = SML.md;
    const box = el('div', 'sp-head');
    const h = el('h2', null, b.n + '. ' + (b.star ? '★ ' : '') + inline(b.title));
    h.id = b.id;
    // which stop of the storyline page this item belongs to (SML.storyStops, data/storyline.js loads after this file)
    const s = (SML.storyStops || []).find((x) => x.items.indexOf(b.id) >= 0);
    box.append(h, el('p', 'sp-meta', inline(b.src) + ' · ' + b.mins + ' 分钟' + (s ? ' · <a href="#/storyline/' + s.id + '">第 ' + s.n + ' 站：' + s.title + '</a>' : '')));
    return box;
  };

  SML.render.blocks.spWrap = function (b, ctx) {
    const box = SML.render.el('div', b.cls);
    box.appendChild(SML.render.renderBlocks(b.blocks, ctx));
    return box;
  };

  SML.render.blocks.spTick = function (b) {
    const { el } = SML.render;
    const label = el('label', 'sp-tick' + (marked()[b.id] ? ' done' : ''));
    label.append(checkbox(b.id), el('span', null, '合上页面能做对、能写出来，就打勾'));
    return label;
  };

  SML.render.blocks.spLedger = function (b) {
    const { el } = SML.render;
    const { inline, esc } = SML.md;
    const box = el('div', 'sp-ledger');
    const bar = el('div', 'sp-bar');
    const toggle = el('button', 'btn', '只看套路（考前背）');
    toggle.type = 'button';
    document.body.classList.remove('sp-recite');
    toggle.addEventListener('click', () => {
      const on = document.body.classList.toggle('sp-recite');
      document.querySelectorAll('.sp-card details').forEach((d) => { d.open = on; });
      toggle.textContent = on ? '显示题目' : '只看套路（考前背）';
    });
    bar.append(el('p', 'sp-count', countText(marked())), toggle);
    box.appendChild(bar);
    const table = el('table');
    table.innerHTML = '<thead><tr><th></th><th>题型</th><th>可能性</th><th>真卷分值</th><th>难度</th><th>用时</th></tr></thead>';
    const body = el('tbody');
    let seg = null;
    b.items.forEach((it) => {
      if (it.seg !== seg) {
        seg = it.seg;
        const group = b.items.filter((x) => x.seg === seg);
        // p and q run optimistic: the low end is what the 2021 and 2022 papers would give for the whole page
        const upto = b.items.filter((x) => x.seg <= seg).reduce((sum, x) => sum + (x.ev || 0), 0);
        const five = (x) => Math.round(x / 5) * 5;
        const est = seg < 4 ? ' · 累计估计 ' + five(upto * .65) + '–' + five(upto * .9) + ' 分' : '';
        const head = el('tr', 'day', '<td colspan="6">' + esc(SEGS[seg]) + '（约 ' + esc(hm(group.reduce((sum, x) => sum + x.mins, 0))) + est + '）</td>');
        body.appendChild(head);
      }
      const tr = el('tr', marked()[it.id] ? 'done' : null);
      const ck = el('td', 'ck');
      ck.appendChild(checkbox(it.id));
      tr.appendChild(ck);
      tr.insertAdjacentHTML('beforeend', '<td><a href="#/sprint/' + esc(it.id) + '">' + it.n + '. ' + (it.star ? '★ ' : '') + inline(it.title) + '</a></td><td class="sm">' + esc(it.likely || '') + '</td><td class="sm">' + esc(it.ml || '') + '</td><td class="sm">' + esc(it.hard || '') + '</td><td class="sm">' + it.mins + ' 分钟</td>');
      body.appendChild(tr);
    });
    table.appendChild(body);
    const wrap = el('div', 'table-wrap');
    wrap.appendChild(table);
    box.appendChild(wrap);
    return box;
  };

  items.forEach((it, i) => { it.n = i + 1; });

  const blocks = [
    { t: 'good', title: '先读：一条线串起来（25 分钟）', md: '全课 7 站：每站解决什么问题、带出什么新问题、这一页哪几项考它。读完知道每一项在整门课里的位置，再从第 1 项开始做。[打开 →](#/storyline)' },
    { t: 'warn', title: '老师课上说的：★ 要会的，和不考的', md: T`来源：L02–L24 的讲稿（L01、L03、L07、L08、L10–L13 没有讲稿，没查）。每项卡片最上面的黄框写了这一项老师的原话。

**★ 老师点名要会**：d-separation 的步骤（L20："important to you at the end of the semester"）；消元顺序决定计算量、为什么要变成树再跑 BP（L22："the most important part"）；BP 的两条规则（L21："please remember the two rules"）；手展开二次核（L09）；方差未知的 Normal MLE（L02）。另外 L15：t 检验如果考，"we'll give you the formulas"，只要代数字。

**整块不考，直接跳过**：绿色背景的页（L14、L16、L18 都说 "green slide … not examinable"）；Transformer 结构（L14）；Fisher information（L18）；方差未知时的 inverse gamma 先验（L18）；Laplace approximation（L19）；loopy BP（L22）；Prim、Kruskal 的细节（L22）。

**证明不考**：L16 "We will never put an exam question about proofs"，L06 也说不会让你们证明。包括偏差–方差分解的证明（L05）、泛化界的推导（L06）、强对偶和一般 $d$ 次 kernel 的证明（L09）、UCB 背后的界（L17）、Bayesian 线性回归后验的配方推导（L18）、BP 为什么对（L21）、running intersection（L22）、Bayesian score 闭式解（L23）、MRF 的 $Z$ 求导（L24）。**结论和计算照样考**：MLE 求导、展开二次核、代公式算 UCB 和界，都要会。` },
    { t: 'spLedger', items: items.map(({ seg, tier, ev, score, last, likely, hard, ml, id, n, title, mins, marks, star }) => ({ seg, tier, ev, score, last, likely, hard, ml, id, n, title, mins, marks, star })) },
    { t: 'note', title: '怎么排的，够不够', md: '**排序**：先看来源，今年优先：老师 mock → 今年 Quiz 和 workshop 手写题 → 去年 practice → 更早的卷。同一来源内，老师课上点名的（★）排最前，并且都放进第一段；其余按每小时预期分排（可能性 × 真卷分值 × 做对率 ÷ 用时），可能性和做对率是我估的，不是官方信息。\n\n**为什么 Quiz 紧跟 mock**：Ed 的考试帖写明 quiz 也考；13 题里有 5 题和 mock 考的是同一块（VC、CNN、bandit、D-separation、消元）。\n\n**为什么 workshop 排在旧卷前面**：mock Section B 四道题全部是今年 workshop 手写题原题：Q2 = W10，Q3 = W5 Ex1，Q4 = W12 Q1，Q5 = W12 Q4。真卷 120 分、题更多，mock 只有 50 分，多出来的分很可能来自还没上 mock 的手写题，所以 BP、experts 虽然旧卷没考过，这里也提前了。这是我从规律推断的，老师没有这样说。\n\n**时间（一天半）**：第一段一整天，约 7 小时；第二段半天，约 3 小时；出门前 30 分钟只背不做。每项的用时已经算上对答案。一题卡住超过 10 分钟就看答案，合上再自己写一遍，然后往下走。\n\n**够不够**：表里的累计估计按今年风格算。只做第一段约 45–65 分，不稳；两段都做完 65–85 分，才有把握。风险是真卷如果还像 2021、2022 旧卷，两段只覆盖 66 分、35 分，要靠"有空再做"那段补。\n\n**还没纳入**：Canvas 公告，我这边读不到。复习课没有找到：L24 说它是最后一节课，本地和 Ed 都没有复习课材料。考场节奏见[页底](#/sprint/exam-day)。' },
    keywords('Section A: Short Answer 简答 | Section B: Method & Calculation 方法与计算 | Section C: Design and Application 设计与应用 | Answer as briefly as possible 尽量简短 | in 1-3 lines 写 1–3 行 | In words or a mathematical expression 用文字或公式 | Consider 设有 | Suppose / Assume 假设 | given 已知 | Calculate / Compute 计算 | Determine 判断、求出 | Provide 给出 | State 写出 | Explain 解释原因 | Describe 描述 | Outline 概述 | Justify 说明理由 | Derive 推导 | Prove / Show that 证明 | Identify 指出 | Draw 画 | Design 设计 | How many 多少个 | what quantity 什么量 | Which of the following 下面哪个 | Select all 选出所有对的 | whether 是否 | Does … hold? 是否成立 | true / false 对 / 错 | at most / at least 最多 / 至少 | exclude / include 不算 / 算上 | respectively 分别 | corresponding 对应的 | otherwise 否则 | in terms of 用…表示 | need not 不必 | Why or why not? 为什么', '题干常用词'),
  ];
  items.forEach((it) => {
    blocks.push({ t: 'spHead', id: it.id, n: it.n, title: it.title, src: it.src, mins: it.mins, star: it.star });
    const card = (TEACHER[it.id] ? [teacher(it.id)] : []).concat(KW[it.id] ? [keywords(KW[it.id], '关键词')] : [], KNOW[it.id] ? [know(KNOW[it.id])] : [], it.card);
    if (card.length) blocks.push({ t: 'spWrap', cls: 'sp-card', blocks: withEasy(card) });
    blocks.push({ t: 'spWrap', cls: 'sp-work', blocks: withEasy(it.work.concat(MORE[it.id] ? [more(MORE[it.id])] : [], [{ t: 'spTick', id: it.id }])) });
  });
  Object.keys(EASY).forEach((src) => { if (!usedEasy[src]) throw new Error('sprint: exam answer for a question not on this page: ' + src); });
  blocks.push(
    { t: 'h2', text: '考场怎么做', id: 'exam-day' },
    { t: 'steps', items: [
      '120 分、120 分钟，**1 分钟 1 分**。一题超时就先跳过。',
      '阅读时间圈出上面见过的题型。先做固定步骤的计算题，再做 PGM，最后写简答。',
      '计算题每一步都写，最后的答案画框，争取步骤分。不能用计算器，也用不上；复杂公式和 $\\ln$ 这类近似值卷面会给（Ed）。',
      '简答用 1–3 行英文：先写定义，再写一句原因。不会的题也写相关定义，不留空。',
    ] },
  );

  SML.content.add({
    id: 'sprint',
    title: '两天必拿分',
    lead: '目标：考试拿到 **60/120**。时间只有一天半：第一段一整天，第二段半天，出门前 30 分钟只背不做。**今年优先**：老师 mock 排最前，其次今年 Quiz 和 workshop 手写题，最后才是旧卷。从上往下做，到时间就停。每一项只有四样：**中英关键词**（认卷子上的英文）、**套路**（背）、**卷面写法**（照着写）、**题**（合上答案，纸笔做）。开始前先读一遍下面的「一条线串起来」，之后只看这一页。',
    blocks: blocks,
  });
})(window);
