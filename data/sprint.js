/* 两天必拿分: the last-two-days workbook, one page in strict priority order.
 * Each item = routine to memorise (套路 + 卷面写法) + this year's question + one random question.
 * Questions and solutions are shared with the T-pages, not copied: a renamed source throws at load and tests/site.check.js reports it.
 * Ticks live in this browser only (SML.store key 'checklist', { itemId: true }), so item ids must stay stable.
 * Order: tier first (1 the teacher's mock, 2 this year's quizzes, pinned first, then other workshop handwritten exercises, 3 last year's practice and core short answers, 4 older papers), the user's explicit rule.
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

    { id: 'vc-table', tier: 1, p: .9, m: 10, q: .8, ml: '8–12', title: 'VC 维 dichotomy 表', src: 'mock Q3 · 8 分 · 就是 W5 Ex1 原题', mins: 60, marks: 8,
      card: [routine(T`**认题**：给一张 0/1 表，求 VC 维并写出一个被打散的点集。

1. 去掉重复行剩 $m$ 行，$k=\lfloor\log_2m\rfloor$ 是上界，从 $k$ 开始试。
2. 按列预筛：能进 $k$ 元打散集的列，至少要有 $2^{k-1}$ 个 0 和 $2^{k-1}$ 个 1。
3. 候选的 $k$ 列：只看这几列，去重，凑齐 $2^k$ 种就是 shattered；缺的组合写出来就是"不是"。
4. $k$ 元集合一个都不行，就把 $k$ 减 1 再查。不能直接拿上界当答案。`),
      phrase(T`$\mathrm{VC}(F)=k$. The set $\{\dots\}$ is shattered: restricted to these points the rows give …, i.e. all $2^k$ labellings. No set of $k+1$ points is shattered: the table has only $m<2^{k+1}$ distinct rows (or: each such set misses a labelling, e.g. …). Hence $\mathrm{VC}(F)=k$.`)],
      work: [past('T01', '2026 S2 practice Q3'), random('vc', 'VC 随机题')] },

    { id: 'dsep', tier: 1, p: .85, m: 8, q: .8, ml: '约 8', title: 'D-separation', src: 'mock Q4 · 8 分 · 就是 W12 Q1 原题', mins: 60, marks: 8,
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

    { id: 'elim', tier: 1, p: .9, m: 10, q: .7, ml: '8–14', title: '消元 → junction tree', src: 'mock Q5 · 8 分 · 就是 W12 Q4 原题', mins: 75, marks: 8,
      card: [routine(T`**认题**：给图和消元顺序，问 junction tree 的团、最大团或复杂度。

1. 有向图先 moralize。
2. 每删一个点写一行：删的点 | **当前**邻居 | 新加的 fill-in 边 | 团（这个点 + 邻居）。邻居要算上前面加的 fill-in 边。
3. 划掉被别的团包含的团，剩下的就是 junction tree 的团。
4. 连树：每对团的交集大小是边权，从大到小选边，成环就跳过；每条边写 separator（两团的交集）。
5. 复杂度：最大团 $k$ 个二值变量，$O(n\,2^k)$，随最大团大小指数增长。`),
      phrase(T`Eliminate in the given order, each time connecting the current neighbours of the eliminated node (fill-in edges) and recording the clique "node + neighbours": (table). Removing cliques contained in larger ones, the junction tree cliques are …. Tree edges with separators: …. Inference cost is exponential in the size of the largest clique.`)],
      work: [past('T06', '2026 S2 practice Q5'), random('elim', '消元随机题')] },

    { id: 'pgm', tier: 1, p: .9, m: 20, q: .65, ml: '约 20', title: 'PGM 画图 + 数 CPT + 山火题', src: 'mock Q6 · 10 分 · 2025 practice Q6 同题', mins: 75, marks: 10,
      card: [routine(T`**认题**：一段故事（山火报警、流感、学生成绩），要画图、数表、说怎么用模型。2025、2026 都考了山火。

1. 画图：每个变量一个节点，原因 → 结果；没说有关系的不连。
2. 因子分解：每个节点写 $P(x\mid\text{parents})$，全部相乘。
3. 数 CPT：每个节点一张表，$r$ 个取值，父节点 $q$ 种组合，$r\times q$；自由参数 $(r-1)q$。Ed 上对这道题的答复（11/1）：32 行 2 列或 2 行 32 列都对，但要写清每行对应哪种父节点组合；也可以只存 $P(\text{True}\mid\text{parents})$。
4. 规则确定（传感器绝对准确）就填 0/1。
5. 读数会出错：加隐变量 $F\to S$，$P(S\mid F)$ 是误报 / 漏报率。
6. 做决定：代入读数，对看不到的变量求和，算 $P(A\mid\text{readings})$，超过阈值就行动。
7. 问 CPT 换成 logistic regression 的后果（2021 Q14(c)）：参数变少，但 log-odds 只能是父节点的线性函数，表示不了 XOR 式的交互，bias 更大。`),
      phrase(T`Nodes …; edges …, i.e. $P(\dots)=\prod_iP(x_i\mid\mathrm{pa}_i)$.
One CPT per node: $2\times1$ for a Boolean root node, $2\times2^m$ for a Boolean node with $m$ Boolean parents.
Perfect sensors make the CPT deterministic (all entries 0 or 1).
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
      card: [routine('每题一句结论，考前背这张表。'),
        { t: 'table', head: ['题', '中英关键词', '结论'], rows: [
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
        ] }],
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
4. 一整轮没有更新就停。列表写出每行的 $s$、预测、更新后的 $\mathbf w$。`),
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
6. **离线评估**：收集臂是均匀随机选的日志，用 replay 回放比较。

完整题和答案在 [T2 设计题](#/T02/design)。`)],
      work: [] },

    { id: 'mock-redo', tier: 5, last: true, title: 'mock 限时重做，Quiz 再过一遍', src: 'mock 全卷 · 50 分；Quiz 13 题', mins: 75,
      card: [],
      work: [{ t: 'good', title: '怎么做', md: '打开 [mock 原题](#/mock)，50 分钟，白纸闭卷做完 6 题，再对答案。错的那一类，回到本页再做 1 道随机题。然后到[平时小测合集](#/canvasquiz)把 Quiz 13 题过一遍，15 分钟。最后点页面顶部的"只看套路"过一遍。' }] },
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
  const chip = (s) => ({ cls: 'kw', text: s.replace(/^(.*?)\s*([一-鿿].*)$/, '**$1** $2') });
  const keywords = (s, label) => ({ t: 'chips', items: [{ cls: 'kw-label', text: label }].concat(s.split(' | ').map(chip)) });

  const TIERS = { 1: '第一档：老师 mock', 2: '第二档：今年 Quiz 和 workshop 手写题（没上 mock 的）', 3: '第三档：去年 practice 和必背简答', 4: '第四档：更早的卷，有时间再做', 5: '考试当天上午' };
  items.forEach((it) => {
    if (it.last) return;
    const n = it.qs || 1;
    it.ev = n * it.p * it.m * it.q;
    it.score = it.ev / (it.mins / 60);
    const hit = 1 - Math.pow(1 - it.p, n); // chance at least one of the questions appears
    it.likely = hit >= .75 ? '高' : hit >= .4 ? '中' : '低';
    it.hard = it.q >= .85 ? '易' : it.q >= .65 ? '中' : '难';
  });
  items.sort((a, b) => a.tier - b.tier || (b.pin ? 1 : 0) - (a.pin ? 1 : 0) || (b.score || 0) - (a.score || 0));

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
    const h = el('h2', null, b.n + '. ' + inline(b.title));
    h.id = b.id;
    box.append(h, el('p', 'sp-meta', inline(b.src) + ' · ' + b.mins + ' 分钟'));
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
    let tier = null;
    b.items.forEach((it) => {
      if (it.tier !== tier) {
        tier = it.tier;
        const group = b.items.filter((x) => x.tier === tier);
        // p and q run optimistic: the low end is what the 2021 and 2022 papers would give for the whole page
        const upto = b.items.filter((x) => x.tier <= tier).reduce((sum, x) => sum + (x.ev || 0), 0);
        const five = (x) => Math.round(x / 5) * 5;
        const est = tier < 5 ? ' · 累计估计 ' + five(upto * .65) + '–' + five(upto * .9) + ' 分' : '';
        const head = el('tr', 'day', '<td colspan="6">' + esc(TIERS[tier]) + '（约 ' + esc(hm(group.reduce((sum, x) => sum + x.mins, 0))) + est + '）</td>');
        body.appendChild(head);
      }
      const tr = el('tr', marked()[it.id] ? 'done' : null);
      const ck = el('td', 'ck');
      ck.appendChild(checkbox(it.id));
      tr.appendChild(ck);
      tr.insertAdjacentHTML('beforeend', '<td><a href="#/sprint/' + esc(it.id) + '">' + it.n + '. ' + inline(it.title) + '</a></td><td class="sm">' + esc(it.likely || '') + '</td><td class="sm">' + esc(it.ml || '') + '</td><td class="sm">' + esc(it.hard || '') + '</td><td class="sm">' + it.mins + ' 分钟</td>');
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
    { t: 'spLedger', items: items.map(({ tier, ev, score, last, likely, hard, ml, id, n, title, mins, marks }) => ({ tier, ev, score, last, likely, hard, ml, id, n, title, mins, marks })) },
    { t: 'note', title: '怎么排的，够不够', md: '**排序**：先看来源，今年优先：老师 mock → 今年 Quiz 和 workshop 手写题 → 去年 practice → 更早的卷。同一档内按每小时预期分排（可能性 × 真卷分值 × 做对率 ÷ 用时），可能性和做对率是我估的，不是官方信息。\n\n**为什么 Quiz 排第二档最前**：Ed 的考试帖写明 quiz 也考；13 题里有 5 题和 mock 考的是同一块（VC、CNN、bandit、D-separation、消元）。\n\n**为什么 workshop 排第二**：mock Section B 四道题全部是今年 workshop 手写题原题：Q2 = W10，Q3 = W5 Ex1，Q4 = W12 Q1，Q5 = W12 Q4。真卷 120 分、题更多，mock 只有 50 分，多出来的分很可能来自还没上 mock 的手写题，所以 BP、experts 虽然旧卷没考过，这里也提前了。这是我从规律推断的，老师没有这样说。\n\n**时间**：两天各约 5–6 小时：第 1 天做完第一档，第 2 天做第二、三档，第四档有多余时间再做。\n\n**够不够**：表里的累计估计按今年风格算，只做第一档不够 60，前三档才有把握。风险是真卷如果还像 2021、2022 旧卷，前三档只覆盖 66 分、35 分，要靠第四档补。\n\n**还没纳入**：Canvas 公告，我这边读不到。复习课没有找到：L24 说它是最后一节课，本地和 Ed 都没有复习课材料。考场节奏见[页底](#/sprint/exam-day)。' },
    keywords('Section A: Short Answer 简答 | Section B: Method & Calculation 方法与计算 | Section C: Design and Application 设计与应用 | Answer as briefly as possible 尽量简短 | in 1-3 lines 写 1–3 行 | In words or a mathematical expression 用文字或公式 | Consider 设有 | Suppose / Assume 假设 | given 已知 | Calculate / Compute 计算 | Determine 判断、求出 | Provide 给出 | State 写出 | Explain 解释原因 | Describe 描述 | Outline 概述 | Justify 说明理由 | Derive 推导 | Prove / Show that 证明 | Identify 指出 | Draw 画 | Design 设计 | How many 多少个 | what quantity 什么量 | Which of the following 下面哪个 | Select all 选出所有对的 | whether 是否 | Does … hold? 是否成立 | true / false 对 / 错 | at most / at least 最多 / 至少 | exclude / include 不算 / 算上 | respectively 分别 | corresponding 对应的 | otherwise 否则 | in terms of 用…表示 | need not 不必 | Why or why not? 为什么', '题干常用词'),
  ];
  items.forEach((it) => {
    blocks.push({ t: 'spHead', id: it.id, n: it.n, title: it.title, src: it.src, mins: it.mins });
    const card = KW[it.id] ? [keywords(KW[it.id], '关键词')].concat(it.card) : it.card;
    if (card.length) blocks.push({ t: 'spWrap', cls: 'sp-card', blocks: card });
    blocks.push({ t: 'spWrap', cls: 'sp-work', blocks: it.work.concat([{ t: 'spTick', id: it.id }]) });
  });
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
    lead: '目标：考试拿到 **60/120**。**今年优先**：老师 mock 排最前，其次今年 Quiz 和 workshop 手写题，最后才是旧卷。从上往下做，到时间就停。每一项只有四样：**中英关键词**（认卷子上的英文）、**套路**（背）、**卷面写法**（照着写）、**题**（合上答案，纸笔做）。其他页面都不用看。',
    blocks: blocks,
  });
})(window);
