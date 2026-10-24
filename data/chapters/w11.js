/* W11 · L21 Inference on trees + L22 Inference on general graphs — chapters c56–c59 and review r11. */
(function (root) {
  'use strict';
  const SML = root.SML;
  const T = String.raw;
  const add = (c) => SML.content.add(SML.chapter(c));

  /* Figures (render.js graph blocks). TREE = the L21 5-node tree; L22 = the L22 example graph; STAR = L22 p28. */
  const sub = { x1: 'x₁', x2: 'x₂', x3: 'x₃', x4: 'x₄', x5: 'x₅' };
  const TREE = { nodes: { x1: [90, 30], x2: [90, 125], x3: [210, 125], x4: [90, 220], x5: [210, 220] }, labels: sub };
  const L22 = { nodes: { x1: [130, 30], x2: [55, 115], x3: [205, 115], x4: [55, 205], x5: [205, 205] }, labels: sub };
  const STAR = { nodes: { L: [110, 30], B: [210, 30], H: [40, 105], C: [280, 105], A: [160, 155], G: [40, 205], D: [280, 205], F: [110, 280], E: [210, 280] } };
  const STAR_EDGES = 'A-B A-C A-D A-E A-F A-G A-H A-L B-C D-E F-G H-L';
  const STAR_FILL = (() => { const o = 'BCDEFGHL'.split(''), have = new Set(['BC', 'DE', 'FG', 'HL']), out = [];
    o.forEach((a, i) => o.slice(i + 1).forEach((b) => { if (!have.has(a + b)) out.push(a + '-' + b + ':fill'); })); return out.join(' '); })();
  const g = (base, extra) => Object.assign({}, base, extra);
  /* Workshop 12 Q3 的星形 MRF（c57 数值例子），位置照 tutorial 原图。 */
  const WS12Q3 = { nodes: { R: [40, 30], S: [140, 30], T: [240, 30], U: [40, 120], V: [140, 120], W: [240, 120], X: [40, 210], Y: [140, 210], Z: [240, 210] } };
  const WS12Q3_EDGES = 'R-V S-V T-V U-V W-V Y-V U-X W-Z';

  /* 本周手算用的同一个小例子：链 x1—x2—x3，变量取 0/1。PSI = 两张打分表（potential）；PSI_MAT = 同一组数的矩阵简写说明。 */
  const PSI = { t: 'table', cls: 'compact', caption: '两张打分表（potential）：每格是"前一个变量·后一个变量"这种组合的分数。例：$\\psi_{12}$ 的"1·0"格是 1，即 $\\psi_{12}(1,0)=1$——$x_1=1$、$x_2=0$ 这个组合打 1 分。', head: ['边', '0·0', '0·1', '1·0', '1·1'], rows: [
    [T`$\psi_{12}(x_1,x_2)$`, '3', '1', '1', '2'],
    [T`$\psi_{23}(x_2,x_3)$`, '2', '1', '1', '3'],
  ] };
  const PSI_MAT = T`同一张表也常**简写成矩阵**：$\psi_{12}=\begin{bmatrix}3&1\\1&2\end{bmatrix}$，$\psi_{23}=\begin{bmatrix}2&1\\1&3\end{bmatrix}$，第 1、2 行 = 前一个变量取 0、1，第 1、2 列 = 后一个变量取 0、1。这只是省地方的写法（练习题会这样给）；只有「数学定义」里的「矩阵写法」那一段才真的把它当矩阵来乘。`;

  /* =====================================================================
   * c56 · 树上消元与消息传递（L21 p3–p23）
   * ===================================================================== */
  add({
    id: 'c56', week: 'W11', lec: 'L21', pages: 'L21 p3–p23', star: 2,
    keyEn: [
      T`Inference: given evidence, compute the (posterior) marginal of the query variables; summing out all other variables directly costs exponentially many terms.`,
      T`Variable elimination on a tree: push each sum inside the product and eliminate from the leaves towards the query; each intermediate result is a message $m_{i\to j}(x_j)$, a function of $x_j$.`,
      T`Message $m_{i\to j}(x_j)=\sum_{x_i}\psi_{ij}(x_i,x_j)\prod_{k\in N(i)\setminus j}m_{k\to i}(x_i)$; marginal $P(x_i)\propto\prod_{k\in N(i)}m_{k\to i}(x_i)$, normalised at the end (no need for $Z$).`,
    ],
    keyZh: [
      T`推断（inference）：给定观测（evidence），求查询变量的（后验）边缘分布。直接把其余变量全部求和，项数随变量个数指数增长，变量一多就算不动。`,
      T`树上消元（variable elimination）：把求和号往里推，从叶子往查询节点一次消掉一个变量。每消掉一个，剩下一张只依赖邻居 $x_j$ 的小表，叫消息（message）$m_{i\to j}(x_j)$。`,
      T`发消息：发送者 $i$ 把除收件人 $j$ 以外的来信相乘，乘上两者之间的 potential，再对 $x_i$ 求和。节点的边缘正比于所有来信之积，最后除以总和归一化，不用算 $Z$。`,
    ],
    examQ: [
      { src: '2016 S2 Q1.2', q: T`What algorithm is used for efficient marginalisation on probabilistic graphical models (PGMs)?`,
        a: T`The (variable) elimination algorithm: push each sum inside the product of factors and sum out one variable at a time, passing the resulting small tables on as messages. On trees this is message passing (belief propagation); on general graphs it is organised by the junction tree algorithm.`,
        qzh: T`在概率图模型（PGM）上做高效的边缘化（marginalisation），用的是什么算法？`,
        azh: T`（变量）消元算法（variable elimination）：把求和号推进因子的乘积里，一次加掉一个变量，把得到的小表当作消息（message）往下传。在树上就是消息传递（[信念传播 belief propagation](#/c57)）；一般的图用[联结树（junction tree）算法](#/c58)来组织。` },
      { src: '2017 S2 Q1(f)', q: T`In a sentence each, describe what probabilistic inference and statistical inference are for.`,
        a: T`Probabilistic inference: with the model fully specified (graph and parameters known), compute probabilities of query variables given observed evidence, e.g. the posterior marginal $P(B=1\mid A=1)$. Statistical inference: use data to estimate the model's unknown parameters (and possibly its structure), e.g. the CPTs by maximum likelihood.`,
        qzh: T`各用一句话说明概率推断（probabilistic inference）和统计推断（statistical inference）是用来做什么的。`,
        azh: T`概率推断：模型（图和参数）已经完全给定，观测到证据（evidence）后，计算查询变量的概率，例如后验边缘分布 $P(B=1\mid A=1)$（本章 ①）。统计推断：用数据估计模型里未知的参数（也可能包括结构），例如用最大似然估计（maximum likelihood estimation，MLE）估计条件概率表（conditional probability table，CPT；列出变量在各组父节点取值下的条件概率），见 [c61](#/c61)。2026 的课件不用"statistical inference"这个词，它就是本章 ① 表里的"学习（learning）"。` },
      { src: '2017 S2 Q11(c)', q: T`(Flu model: $F$ = whether the individual has the flu; $S_i$ = presence of symptom $i$, $i=1\dots I$; $T$ = result of an imperfect clinical test; all binary.) In making a diagnosis, the PGM can be used to compute a distribution over $F$. State the desired distribution, based on an individual attending the doctor with specific symptoms.`,
        a: T`The posterior of $F$ given the observed evidence, $P(F\mid S_1=s_1,\dots,S_I=s_I)$ (also conditioning on $T=t$ if the test was done). It is obtained by inference: sum out the unobserved variables, then normalise over the two values of $F$.`,
        qzh: T`（流感模型：$F$ = 是否患流感；共有 $I$ 种症状，$S_i$ = 是否有第 $i$ 种症状，$i=1\dots I$；$T$ = 一项不完美的临床检测的结果；都是二值变量。实际观察到的症状值记为 $s_i$，即 $S_i=s_i$；若做了检测，检测的观测值记为 $t$，即 $T=t$。）做诊断时，可以用这个概率图模型算出 $F$ 的一个分布。对一个带着具体症状来看医生的人，写出要算的分布。`,
        azh: T`给定观测证据时 $F$ 的后验：$P(F\mid S_1=s_1,\dots,S_I=s_I)$（如果做了检测，再加上条件 $T=t$）。用推断求它：把没观测到的变量求和消掉，再在 $F$ 的两个取值上归一化。` },
    ],
    genesis: T`推断要回答"听到警报后，盗窃的概率是多少"这类问题。最直接的做法是对所有没被问到的变量求和：$n$ 个二元变量要加的项数是 $2^n$ 量级，5 个变量 32 项还能手算，30 个就是十亿项。可联合分布本来就是很多小因子的乘积（c53、c55），每个因子只涉及两三个变量。**把求和号往里推：只出现在一个因子里的变量，先在那个因子里就地加掉**，剩下的是一张小表（一条"消息"），交给邻居接着算。在树上从叶子开始一个一个这样消下去，计算量只随变量个数线性增长。`,
    title: '树上消元与消息传递', en: 'Variable elimination and message passing on trees',
    summary: '**Inference（推断）= 用建好的模型回答问题**：已知一部分变量的值（evidence，观测），求另一个变量取各个值的概率，即它的（后验）边缘分布；直接对其余所有变量求和，项数随变量个数指数增长。本章在树（连通、没有环的图）上，从叶子（只连着一条边的点）开始一次消掉一个变量（variable elimination），每步留下一张小表，叫 message（消息）$m_{i\\to j}(x_j)$。最后把这些步骤归纳成两条规则。',
    prereq: ['c55'],
    symbols: [
      [T`$x_i$`, T`第 $i$ 个变量（课件例子：房间温度 $\pm1$；本章手算例子取 0/1）`],
      [T`$\hat x_i$`, T`变量 $x_i$ 的观测值（已经知道的那个值）`],
      [T`$\delta(a,b)$`, T`指示函数：$a=b$ 时为 1，否则 0（c57 也用它加入观测）`],
      [T`$\psi_{ij}(x_i,x_j)$`, T`边 $i$—$j$ 上的 potential（正数打分），如 $\psi_{12}=\exp(\theta_{12})$。反向传消息仍用同一张表：$\psi_{ji}(x_j,x_i)=\psi_{ij}(x_i,x_j)$；下标换序时，参数也相应换序，不是新增一张表`],
      [T`$\sum_{x_i}$`, T`对 $x_i$ 的所有取值求和（二元变量就是两项相加）`],
      [T`$m_{i\to j}(x_j)$`, T`从 $i$ 发给 $j$ 的消息：把 $i$ 那一侧的变量都求和掉之后剩下的、只依赖 $x_j$ 的函数（$x_j$ 每个取值一个数）`],
      [T`$N(i)$`, T`节点 $i$ 的邻居集合；$N(i)\setminus j$ = 除了 $j$ 以外的邻居`],
      [T`$\prod$`, T`连乘：把列出的各项全部乘起来（$\sum$ 是全部加起来）`],
      [T`$\theta_{ij},\ \exp$`, T`边上的实数打分（c55 房间例子）；$\psi_{ij}=\exp(\theta_{ij})=e^{\theta_{ij}}$ 把它变成正数`],
      [T`$\propto$`, T`正比于：差一个常数倍，最后归一化（除以总和）即可`],
      [T`$Z$`, T`partition function（c55）：对所有组合求和的归一化常数`],
    ],
    goals: [
      '用一句话说出**推断**是什么、和"建模""学习"有什么不同（L21 p3–p5）',
      '写出推断要算的量：（后验）边缘分布，以及观测怎么用指示函数 $\\delta$ 放进去（L21 p5）',
      '说出为什么先在树上做推断（L21 p6）',
      '在课件的 5 节点树上按"从叶子到查询节点"的顺序做 variable elimination，写出每条消息（L21 p10–p22）',
      '记住两条规则：发出的消息 = 其他来信 × 外出 potential 再求和；边缘 ∝ 来信之积，最后归一化（L21 p22–p23）',
    ],
    types: ['T06'],
    what: [
      { t: 'h3', text: '① 推断是什么（L21 p3–p5）' },
      T`**Inference（推断）= 用已经建好的模型回答问题：知道了一部分变量的值，问其他变量取各个值的概率。** 知道的那部分叫 **evidence（证据 / 观测）**，被问的叫**查询变量（query）**。`,
      { t: 'graph', nodes: { E: [80, 40], B: [260, 40], R: [80, 150], A: [260, 150], L: [170, 255] }, notes: { E: '地震', B: '盗窃', R: '电台报道', A: '警报', L: '下班离开' }, edges: 'E>R E>A B>A R>L A>L', cls: { A: 'given', B: 'q' }, w: 300, caption: 'W10 的 alarm 网络（c53）。灰色 $A$ = 已知（警报响了），红圈 $B$ = 要问的（有没有盗窃）。CPT：$P(E=1)=P(B=1)=0.01$；只要地震或盗窃，警报一定响（$A=1$ 当且仅当 $E=1$ 或 $B=1$）；有地震电台一定报道。' },
      T`拿 W10 的 alarm 网络举例（c53）：图和 CPT 都已定好（见上图注）。**听到警报响了**（观测 $A=1$），问发生盗窃的概率 $P(B=1\mid A=1)$——这就是一次推断。警报不响当且仅当既没地震也没盗窃，$P(A=0)=0.99\times0.99$，所以 $P(A=1)=1-0.99^2=0.0199$；盗窃必触发警报，$P(B=1,A=1)=P(B=1)=0.01$，于是 $P(B=1\mid A=1)=\frac{0.01}{0.0199}\approx0.50$：警报一响，盗窃的概率从 1% 跳到约 50%。`,
      { t: 'table', cls: 'compact', head: ['', '做什么', '本课例子'], rows: [
        ['建模（modelling）', '定变量、画图、选因子的形式', 'L20：alarm 网络、房间温度马尔可夫随机场（Markov random field，MRF：用无向图及其因子表示联合分布的模型）'],
        ['学习（learning）', '从数据**估计参数**（CPT、potential）', 'c53 的 MLE 数数（2025 Q4）'],
        ['**推断（inference）**', '参数已知，给定观测**求概率**', '本章和 c57–c59'],
      ] },
      T`课件 p4 问的是同一类问题，只是换成 L20 的房间温度 MRF：知道某些房间的温度（比如一间热 $\hat x_i=1$、一间冷 $\hat x_j=-1$），问另一间 $x_k$ 是冷是热的概率。`,
      { t: 'h3', text: '② 手算一次：推断 = 划掉、加掉、归一化（L21 p5）' },
      T`alarm 能一眼算出来，是因为它的 CPT 几乎全是 0 和 1。一般的模型没有这种捷径，只能回到最笨、但永远正确的办法：**把联合分布整张表列出来，按"观测"和"问题"去操作这张表**。下面用一个能把表列全的小例子走一遍——本章后面一直用的链（一个 3 节点 MRF，变量取 0/1；c55 的最小例子只有两个变量）：`,
      { t: 'graph', nodes: { x1: [30, 40], x2: [160, 40], x3: [290, 40] }, labels: sub, edges: 'x1-x2=ψ₁₂ x2-x3=ψ₂₃', cls: { x1: 'given', x3: 'q' }, w: 340, caption: '灰色 $x_1$ = 已观测（$x_1=1$），红圈 $x_3$ = 要问的。' },
      PSI,
      PSI_MAT,
      T`联合分布 $P(x_1,x_2,x_3)=\frac1Z\,\psi_{12}(x_1,x_2)\,\psi_{23}(x_2,x_3)$。问题：**观测到 $x_1=1$，$x_3$ 取 0、取 1 的概率各是多少？** 先把 8 种组合的打分全列出来：`,
      { t: 'table', cls: 'compact', head: ['$x_1$', '$x_2$', '$x_3$', T`打分 $\psi_{12}\cdot\psi_{23}$`, '第 1 步'], rows: [
        ['0', '0', '0', T`$3\times2=6$`, '✗ 和 $x_1=1$ 矛盾'],
        ['0', '0', '1', T`$3\times1=3$`, '✗'],
        ['0', '1', '0', T`$1\times1=1$`, '✗'],
        ['0', '1', '1', T`$1\times3=3$`, '✗'],
        ['1', '0', '0', T`$1\times2=2$`, '✓ 保留'],
        ['1', '0', '1', T`$1\times1=1$`, '✓'],
        ['1', '1', '0', T`$2\times1=2$`, '✓'],
        ['1', '1', '1', T`$2\times3=6$`, '✓'],
      ] },
      { t: 'steps', items: [
        T`**划掉**和观测矛盾的行：只留 $x_1=1$ 的 4 行，打分 $2,1,2,6$。`,
        T`**加掉**不关心的变量 $x_2$：按 $x_3$ 分组相加——$x_3=0$：$2+2=4$；$x_3=1$：$1+6=7$。`,
        T`**归一化**：除以总和 $4+7=11$ ⇒ $P(x_3=0\mid x_1=1)=4/11\approx0.36$，$P(x_3=1\mid x_1=1)=7/11\approx0.64$。`,
      ] },
      T`$Z$ 从头到尾没用上：每一行都差同一个因子 $1/Z$，第 3 步除以总和时就约掉了。所以推断时只算打分（写成 $\propto$，"正比于"），最后归一化即可。`,
      T`**这三步算出来的东西有名字。** 第 2 步把其他变量加掉、只看一个变量自己的分布，叫 **marginal（边缘分布）**——就像在一张大表的"边上"写行和、列和（[c02 的求和法则（sum rule）](#/c02)：把其他变量的各个取值对应的概率加起来）。第 1 步先按观测筛选，得到的是看到证据**之后**的分布，叫 **posterior（后验）**。所以推断要算的就是查询变量的 **posterior marginal（后验边缘分布）**。课件 p5 把这三步写成一般公式（查询 $x_k$，观测 $\hat x_i,\hat x_j$）：`,
      { t: 'math', tex: T`P(x_k,\hat x_i,\hat x_j)=\sum_{\text{除 }x_k\text{ 外所有变量}}\delta(\hat x_i,x_i)\,\delta(\hat x_j,x_j)\,P(x_1,\dots,x_n)` },
      { t: 'math', tex: T`P(x_k\mid\hat x_i,\hat x_j)=\frac{P(x_k,\hat x_i,\hat x_j)}{\sum_{x_k}P(x_k,\hat x_i,\hat x_j)}` },
      T`**对照三步读公式**：$\delta(a,b)$ 是指示函数（$a=b$ 时为 1，否则 0），乘上它，和观测矛盾的行变成 0——第 1 步"划掉"；$\sum$ 对除 $x_k$ 以外的变量求和——第 2 步"加掉"；第二行除以总和——第 3 步"归一化"。链的例子里 $x_k=x_3$，观测是 $\hat x_1=1$。`,
      { t: 'h3', text: '③ 问题：表太大了，怎么省（L21 p5–p6）' },
      T`**笨办法的代价**：$n$ 个二元变量的表有 $2^n$ 行。3 个变量 8 行没问题；20 个房间就是一百多万行；100 个变量根本列不出来。这一讲要解决的就是：**不列整张表，也算出同样的结果。**`,
      T`**省的线索**：看没有观测时求 $P(x_3)$ 的和 $\sum_{x_1}\sum_{x_2}\psi_{12}(x_1,x_2)\,\psi_{23}(x_2,x_3)$。$\psi_{23}$ 里没有 $x_1$，对 $x_1$ 求和时它是常数，可以提到 $\sum_{x_1}$ 外面（就像 $3a+3b=3(a+b)$）；于是 $x_1$ 只剩在 $\psi_{12}$ 里，可以**先单独把它加掉**：`,
      { t: 'math', tex: T`\sum_{x_2}\psi_{23}(x_2,x_3)\Big[\underbrace{\sum_{x_1}\psi_{12}(x_1,x_2)}_{x_2=0\text{ 时 }3+1=4,\ x_2=1\text{ 时 }1+2=3}\Big]` },
      T`方括号算完只剩"$x_2$ 每个取值一个数"的小表 $(4,3)$——$x_1$ 那一侧被**压缩成两个数**，之后再也不用管 $x_1$。**一次消掉一个变量、把它压缩成一张小表**，就是 **variable elimination（消元）**；压缩出来的小表叫 **message（消息）**。整章就是把这个动作做得有条理。`,
      { t: 'h3', text: '④ 为什么先在树上做（L21 p6）' },
      T`先认四个词：两点之间有边，就互为「邻居」；沿边走、不走回头路又能回到起点，就是「环」（如三角形 A—B—C—A）；连通（任意两点都能沿边走到）、没有环的图叫**树**（等价说法：任意两点之间有且只有一条路径）；树里只有一个邻居的点叫「叶子」。链 $x_1$—$x_2$—$x_3$ 就是一棵树，叶子是两端的 $x_1$ 和 $x_3$。`,
      T`为什么从叶子消？叶子只连一条边，只出现在一个 potential 里，加掉它只留下邻居的一张小表（$x_1$ 加掉后只剩 $x_2$ 的两个数）；剩下的图还是一棵更小的树，又有新叶子可消，表永远不会变大。有环的图消到环上就没有叶子了（三角形里每个点都有两个邻居），消掉任何一个点都会把它的几个邻居绑进同一张新表，相当于在它们之间新连了边，图越消越密——这要到 [c58](#/c58) 才解决。`,
      { t: 'h3', text: '⑤ 课件的例子：一棵 5 节点的树（L21 p7–p8）' },
      T`链太短，看不出"好几个叶子、消息在中间汇合"。课件用的是一棵 5 个节点的树：5 个房间，$x_i\in\{-1,1\}$，边 $x_1$—$x_2$，$x_2$—$x_3$，$x_2$—$x_4$，$x_4$—$x_5$（这是一棵树：叶子 $x_1,x_3,x_5$）。每条边一个 potential，如 $\psi_{12}(x_1,x_2)=\exp(\theta_{12}(x_1,x_2))$。联合分布是所有因子之积除以 $Z$：`,
      { t: 'math', tex: T`P(x_1,\dots,x_5)=\frac1Z\,\psi_{12}(x_1,x_2)\,\psi_{23}(x_2,x_3)\,\psi_{24}(x_2,x_4)\,\psi_{45}(x_4,x_5)` },
      g(TREE, { t: 'graph', edges: 'x1-x2=ψ₁₂ x2-x3=ψ₂₃ x2-x4=ψ₂₄ x4-x5=ψ₄₅', cls: { x4: 'q' }, w: 260, caption: '课件 p10 的树：每条边一个 potential；红圈 $x_4$ 是要求边缘的查询变量。叶子是 $x_1,x_3,x_5$。' }),
      { t: 'note', title: '读这张图的三个要点（容易混）', md: T`① 圆圈里的 1–5 是**房间编号**。$\psi_{24}$ 的下标 "24" 指"连接房间 2 和房间 4 的那条边"，不是温度。② $\psi_{24}$ 是一张 $2\times2$ 的**打分表**：把 $(x_2,x_4)$ 的四种冷热组合（热热、热冷、冷热、冷冷）各打一个分——它列出所有可能，不是说 $x_2$ 同时又热又冷。③ 课件 p10–p23 这一段**没有观测任何房间**：$x_1,\dots,x_5$ 全都未知，所以算 $x_4$ 时，其他每个房间的"热"和"冷"两种情况都要加进去。"未知"不等于"冷"。p4 里"一间热、一间冷"是另一个问题（有观测），要到 p24（c57）才讲怎么处理。` },
      { t: 'h3', text: '⑥ 从叶子一个一个消 = variable elimination（L21 p10–p22）' },
      T`把"从叶子开始一个一个消"用在这棵树上。推断问题（p10）：**没有任何观测**，求 $x_4$ 的边缘 $P(x_4)$（有观测时做法几乎一样，见 c57）。先不管 $Z$——它是常数，最后归一化即可：$P(x_4)\propto\sum_{x_1,x_2,x_3,x_5}\psi_{12}\psi_{23}\psi_{24}\psi_{45}$。关键：**从叶子开始，一次只对一个变量求和**，只把含这个变量的因子拿出来：`,
      { t: 'steps', items: [
        T`叶子 $x_5$（p12–p13）：只有 $\psi_{45}$ 含它。求和结果记作 $m_{5\to4}(x_4)=\sum_{x_5}\psi_{45}(x_4,x_5)$——它只剩 $x_4$ 一个变量，叫**从 5 发给 4 的消息（message）**。`,
        T`叶子 $x_1$（p15–p16）：$m_{1\to2}(x_2)=\sum_{x_1}\psi_{12}(x_1,x_2)$。`,
        T`叶子 $x_3$（p18–p19）：$m_{3\to2}(x_2)=\sum_{x_3}\psi_{23}(x_2,x_3)$。`,
        T`$x_2$：$x_1,x_3$ 消掉后，它只剩邻居 $x_4$，成了新的叶子。含它的是 $\psi_{24}$ 和刚得到的两条消息，三者相乘再对 $x_2$ 求和：$m_{2\to4}(x_4)=\sum_{x_2}\psi_{24}(x_2,x_4)\,m_{1\to2}(x_2)\,m_{3\to2}(x_2)$。`,
        T`剩下的只含 $x_4$（p23）：$P(x_4)\propto m_{2\to4}(x_4)\,m_{5\to4}(x_4)$。最后归一化：除以 $x_4$ 两个取值的和。`,
      ] },
      { t: 'graphs', r: 16, items: [
        g(TREE, { edges: 'x1-x2 x2-x3 x2-x4 x5>x4:msg=m₅→₄', cls: { x4: 'q', x5: 'done' }, caption: '① 消掉 $x_5$，得到消息 $m_{5\\to4}$（绿色箭头）' }),
        g(TREE, { edges: 'x1>x2:msg=m₁→₂ x2-x3 x2-x4 x5>x4:msg', cls: { x4: 'q', x5: 'done', x1: 'done' }, caption: '② 消掉 $x_1$，得到 $m_{1\\to2}$' }),
        g(TREE, { edges: 'x1>x2:msg x3>x2:msg=m₃→₂ x2-x4 x5>x4:msg', cls: { x4: 'q', x5: 'done', x1: 'done', x3: 'done' }, caption: '③ 消掉 $x_3$，得到 $m_{3\\to2}$' }),
        g(TREE, { edges: 'x1>x2:msg x3>x2:msg x2>x4:msg=m₂→₄ x5>x4:msg', cls: { x4: 'q', x5: 'done', x1: 'done', x3: 'done', x2: 'done' }, caption: '④ 消掉 $x_2$：$m_{2\\to4}$ 用到它收到的两条消息和 $\\psi_{24}$。最后 $P(x_4)\\propto m_{2\\to4}\\,m_{5\\to4}$' }),
      ] },
      T`**用数字走一遍。** 课件只给符号。下面给四条边各配一张打分表（数字是自编的，只为演示；每条边有自己的偏好，不一定偏好同温——比如 $\psi_{23}$ 的"热·冷"是 2，反而比两个同温格都高），把上面四步真的算出来。每张表都是"前一个房间、后一个房间"的四种组合：`,
      { t: 'table', cls: 'compact', head: ['边（哪两个房间）', '热·热', '热·冷', '冷·热', '冷·冷'], rows: [
        [T`$\psi_{12}(x_1,x_2)$：房间 1–2`, '3', '1', '1', '1'],
        [T`$\psi_{23}(x_2,x_3)$：房间 2–3`, '1', '2', '1', '1'],
        [T`$\psi_{24}(x_2,x_4)$：房间 2–4`, '4', '1', '1', '2'],
        [T`$\psi_{45}(x_4,x_5)$：房间 4–5`, '3', '1', '1', '2'],
      ] },
      { t: 'video', id: 'msgpass' },
      { t: 'slide', src: 'L21/p21', caption: T`课件 p21：四步消元压成一张图。图中三个洋红箭头是已经算好的消息 $m_{1\to2}$、$m_{3\to2}$、$m_{5\to4}$；最后一个大方括号里，$\sum_{x_2}$ 乘上 $\psi_{24}$ 和 $x_2$ 收到的两条消息，括号整体就是 $m_{2\to4}(x_4)$，再乘上括号外的 $m_{5\to4}(x_4)$ 就是 $P(x_4)$。` },
      T`代入上面那张打分表，四步的数字是：`,
      { t: 'steps', items: [
        T`**叶子 $x_5$ → $x_4$**：$m_{5\to4}(x_4)=\sum_{x_5}\psi_{45}(x_4,x_5)$。$x_4$ 热：$\psi_{45}(\text{热},\text{热})+\psi_{45}(\text{热},\text{冷})=3+1=4$；$x_4$ 冷：$1+2=3$。消息 $=(\text{热 }4,\ \text{冷 }3)$。意思是："如果 $x_4$ 热，$x_5$ 那一侧不管冷热，一共贡献 4 分；$x_4$ 冷则贡献 3 分。"`,
        T`**叶子 $x_1$ → $x_2$**：$m_{1\to2}(x_2)=\sum_{x_1}\psi_{12}(x_1,x_2)$。$x_2$ 热：$\psi_{12}(\text{热},\text{热})+\psi_{12}(\text{冷},\text{热})=3+1=4$；$x_2$ 冷：$1+1=2$。消息 $=(4,\ 2)$。`,
        T`**叶子 $x_3$ → $x_2$**：$m_{3\to2}(x_2)=\sum_{x_3}\psi_{23}(x_2,x_3)$。$x_2$ 热：$1+2=3$；$x_2$ 冷：$1+1=2$。消息 $=(3,\ 2)$。`,
        T`**$x_2$ → $x_4$**：先把 $x_2$ 收到的两条消息乘起来——$x_2$ 热：$4\times3=12$，$x_2$ 冷：$2\times2=4$（"$x_2$ 取这个值时，$x_1,x_3$ 那一片一共贡献多少"）。再乘上通往 $x_4$ 的 $\psi_{24}$，对 $x_2$ 的两种取值求和：$x_4$ 热：$\psi_{24}(\text{热},\text{热})\times12+\psi_{24}(\text{冷},\text{热})\times4=4\times12+1\times4=52$；$x_4$ 冷：$1\times12+2\times4=20$。消息 $=(52,\ 20)$。`,
        T`**到达 $x_4$**：两条来信相乘：热 $52\times4=208$，冷 $20\times3=60$。归一化：$P(x_4=\text{热})=\frac{208}{208+60}=\frac{208}{268}\approx0.78$。`,
      ] },
      g(TREE, { t: 'graph', edges: 'x1>x2:msg=(4,2) x3>x2:msg=(3,2) x2>x4:msg=(52,20) x5>x4:msg=(4,3)', cls: { x4: 'q', x1: 'done', x3: 'done', x5: 'done', x2: 'done' }, w: 280, caption: '四条消息的数值，括号里是（热，冷）两个数。$x_4$ 把两条来信相乘：(208, 60)。' }),
      T`**核对**：直接枚举 $x_1,x_2,x_3,x_5$ 的 $2^4=16$ 种组合，每种把四个分数相乘，$x_4$ 热的 16 项加起来正好是 208，冷的是 60——结果完全一样，但消息传递只做了十来次小加法和乘法。`,
      { t: 'h3', text: '⑦ 把四步总结成两条规则（L21 p22–p23）' },
      T`回头看上面四条消息，它们的算法其实一模一样，课件把它归纳成两条：`,
      { t: 'ul', items: [
        T`**Observation 1——发消息**：$m_{i\to j}(x_j)=\sum_{x_i}\psi_{ij}(x_i,x_j)\prod_{k\in N(i)\setminus j}m_{k\to i}(x_i)$——发送者 $i$ 从**其他邻居**收到的消息（除了来自 $j$ 的），乘上"外出的" potential $\psi_{ij}$，再对 $x_i$ 求和。叶子没有收到消息，就只对 potential 求和。对照 ⑥ 第 4 步：$i=2$、$j=4$，$x_2$ 的邻居 $x_1,x_3,x_4$ 去掉收件人 $x_4$，剩 $N(2)\setminus 4=\{1,3\}$，所以乘 $m_{1\to2}\,m_{3\to2}$。`,
        T`**Observation 2——求边缘**：节点的边缘 $\propto$ 它收到的**所有**消息之积，最后归一化。本章只有查询节点 $x_4$ 收齐了所有邻居的来信；要让每个节点都收齐，见 [c57](#/c57) 的 belief propagation。`,
      ] },
    ],
    why: [
      T`推断是图模型的"用法"：W10 建好模型（c53–c55），这一周学怎么用它算概率。c57 的 belief propagation、c58 的 junction tree 都是"在树（或团组成的树）上传消息"。往年 2021 Q18(b) 考过写消元的前两步：要写出 $\psi$、$m$ 的形式**和每一步对应的线性代数运算**——被观测的变量不是求和掉，而是**取出对应的那一行**（切片）；没观测的变量求和掉，对两个变量的表来说就是**矩阵乘向量**（见下面的矩阵写法和 c57）。T6 的消元题也建立在"消元 = 一次消掉一个变量"之上。`,
    ],
    intuition: [
      T`**为什么能省？乘法分配律。** $\sum_a\sum_b f(a)\,g(b)=\big(\sum_a f(a)\big)\big(\sum_b g(b)\big)$：左边要算 $2\times2=4$ 个乘积再相加，右边只要两个两项和再乘一次。树上固定 $x_2,x_4$ 时，$\psi_{12}$ 只含 $x_1$、$\psi_{45}$ 只含 $x_5$（对 $x_1,x_5$ 来说 $\psi_{23},\psi_{24}$ 是常数，提到外面），所以 $\sum_{x_1}$ 和 $\sum_{x_5}$ 可以分开先做。消元就是反复用这一条，把每个求和推到只含它的那个因子旁边。`,
      T`**消息 = 一棵子树的总结。** $m_{2\to4}(x_4)$ 回答的是："如果 $x_4$ 取这个值，$x_4$ 上面那一整块（$x_1,x_2,x_3$）一共贡献多少分？"它已经把那一侧所有变量的所有组合都加好了，压缩成 $x_4$ 每个取值一个数。`,
      T`**为什么必须是树？** 树上去掉一个节点就把图分成互不相连的几块，每块各自总结成一条消息，互不干扰。有环的话，同一份信息会沿两条路绕回来被重复计算——c58 的 junction tree 就是来解决这个的。`,
      { t: 'graphs', r: 16, caption: '删掉一个节点，图还剩下几块？', items: [
        { nodes: { x1: [90, 30], x2: [90, 125], x3: [210, 125], x4: [90, 220], x5: [210, 220] }, labels: sub, edges: 'x1-x2 x2-x3 x2-x4 x4-x5', cls: { x2: 'removed' }, caption: T`树：删掉 $x_2$ 后剩下 $\{x_1\}$、$\{x_3\}$、$\{x_4,x_5\}$ 三块，互不相连 ⇒ 每块各自总结成一条发给 $x_2$ 的消息，不会重复` },
        { nodes: { A: [50, 40], B: [210, 40], C: [210, 180], D: [50, 180] }, edges: 'A-B B-C C-D D-A', cls: { B: 'removed' }, caption: T`有环：删掉 $B$ 后 $A$—$D$—$C$ 还连成一块，$A$ 那边和 $C$ 那边分不开 ⇒ $A$ 的信息既经 $B$、又经 $D$ 传到 $C$，被算了两遍` },
      ] },
      { t: 'think', q: '5 个二元变量直接求 $P(x_4)$，要把多少种组合加起来？用消息传递，每条消息要算几个数？', a: T`直接求和：$x_4$ 的每个取值下，其余 4 个变量有 $2^4=16$ 种组合。消息传递：每条消息是"$x_j$ 每个取值一个数"，每个数是对发送者两个取值的求和——4 条消息，每条只算 2 个两项和。变量越多，差距越是指数级。` },
      { t: 'story', title: 'Belief propagation 的来历', md: 'Judea Pearl 在 1982 年的论文 "Reverend Bayes on inference engines" 里提出了树上的消息传递算法（belief propagation），让每个节点只和邻居交换"消息"就能算出所有边缘概率。这就是今天所有图模型推断算法的起点。' },
    ],
    math: [
      { t: 'h3', text: '本章手算例子：链 $x_1$—$x_2$—$x_3$（取值 0/1）' },
      PSI,
      { t: 'graph', nodes: { x1: [30, 40], x2: [160, 40], x3: [290, 40] }, labels: sub, edges: 'x1>x2:msg=m₁→₂=(4,3) x2>x3:msg=m₂→₃=(11,13)', cls: { x3: 'q' }, w: 340, caption: '链上的消息：先从叶子 $x_1$ 发给 $x_2$，再由 $x_2$ 发给查询变量 $x_3$。' },
      T`求 $P(x_3)$：从叶子 $x_1$ 往 $x_3$ 传。`,
      { t: 'steps', items: [
        T`$m_{1\to2}(x_2)=\sum_{x_1}\psi_{12}(x_1,x_2)$：$x_2=0$ 时 $3+1=4$；$x_2=1$ 时 $1+2=3$。即 $m_{1\to2}=(4,\ 3)$。（就是 $\psi_{12}$ 每一列的和。）`,
        T`$m_{2\to3}(x_3)=\sum_{x_2}\psi_{23}(x_2,x_3)\,m_{1\to2}(x_2)$：$x_3=0$ 时 $2\times4+1\times3=11$；$x_3=1$ 时 $1\times4+3\times3=13$。`,
        T`$P(x_3)\propto m_{2\to3}(x_3)=(11,\ 13)$。归一化：总和 $24$ ⇒ $P(x_3=0)=11/24\approx0.458$，$P(x_3=1)=13/24\approx0.542$。`,
      ] },
      T`**矩阵写法**（为什么要看成矩阵：2021 Q18(b) 要求写出每一步"对应的线性代数运算"）：把打分表 $\psi_{12}$ 看成 $2\times2$ 矩阵（行 $x_1$、列 $x_2$），"对 $x_1$ 求和" = 把每一列加起来，写成矩阵就是 $m_{1\to2}=\psi_{12}^\top\mathbf 1$（上标 $\top$ 是转置 = 行列对调；$\mathbf 1=(1,1)^\top$ 是两个 1。矩阵转置后乘全 1 向量，就是把每一列加起来，得到 $(4,3)$——和上面手算的列和是同一个东西）；$m_{2\to3}=\psi_{23}^\top m_{1\to2}$——每条消息就是一次**矩阵乘向量**：$\begin{bmatrix}2&1\\1&3\end{bmatrix}\begin{bmatrix}4\\3\end{bmatrix}=\begin{bmatrix}11\\13\end{bmatrix}$（这里 $\psi_{23}$ 恰好对称，转置不变）。`,
      T`**核对**：直接枚举。$x_3=0$ 时，把 $x_2=0$ 和 $x_2=1$ 两种情况加起来：$x_2=0$ 时 $\sum_{x_1}\psi_{12}(x_1,0)\cdot\psi_{23}(0,0)=(3+1)\times2$，$x_2=1$ 时 $(1+2)\times\psi_{23}(1,0)=3\times1$，合计 $8+3=11$ ✓（也就是"$\psi_{12}$ 的列和 $(4,3)$"与"$\psi_{23}$ 的第一列 $(2,1)$"对应相乘再相加）。而且两个值的总和 24 正好是 $Z$。`,
    ],
    fx: [
      {
        title: '消息（L21 p22）', tex: T`m_{i\to j}(x_j)=\htmlClass{fx-p1}{\sum_{x_i}}\htmlClass{fx-p2}{\psi_{ij}(x_i,x_j)}\htmlClass{fx-p3}{\prod_{k\in N(i)\setminus j}m_{k\to i}(x_i)}`,
        parts: [
          { label: 'Σ', note: '把发送者 $x_i$ 求和掉——这就是"消元"。' },
          { label: '外出的 potential', note: '连接 $i$ 和收件人 $j$ 的那条边上的因子。' },
          { label: '其他来信', note: '$i$ 从**除 $j$ 以外**的邻居 $N(i)$ 收到的消息。叶子没有其他邻居，这一项就是 1。' },
        ],
      },
      {
        title: '边缘（L21 p23）', tex: T`P(x_i)\propto\prod_{k\in N(i)}m_{k\to i}(x_i)`,
        parts: [],
      },
    ],
    example: [
      { t: 'graphs', r: 16, caption: '下面练习用到的图。', items: [
        { nodes: { x1: [30, 40], x2: [150, 40], x3: [270, 40] }, labels: sub, edges: 'x1-x2=ψ₁₂ x2-x3=ψ₂₃', cls: { x3: 'q' }, caption: '题 1–2：链，查询 $x_3$（红圈）' },
        { nodes: { x1: [40, 40], x3: [240, 40], x2: [140, 140] }, labels: sub, edges: 'x1>x2:msg=m₁→₂ x3>x2:msg=m₃→₂', cls: { x2: 'q' }, caption: '题 3：星形，中心 $x_2$ 收到两条消息' },
      ] },
      { t: 'fade', title: '分步练习：沿链传消息', plan: ['叶子的消息：对 potential 求和（列和）', '中间节点：其他来信 × 外出 potential，再求和', '查询节点：来信相乘，再归一化'], items: [
        { md: T`链 $x_1$—$x_2$—$x_3$，$\psi_{12}=\begin{bmatrix}3&1\\1&2\end{bmatrix}$，$\psi_{23}=\begin{bmatrix}2&1\\1&3\end{bmatrix}$（打分表的矩阵简写：行 = 前一个变量取 0/1，列 = 后一个变量取 0/1），求 $P(x_3=1)$。`, steps: [
          { md: T`$m_{1\to2}$ = $\psi_{12}$ 每一列求和 $=(4,3)$` }, { md: T`$m_{2\to3}(0)=2\cdot4+1\cdot3=11$，$m_{2\to3}(1)=1\cdot4+3\cdot3=13$` }, { md: T`$13/(11+13)=13/24\approx0.542$` },
        ] },
        { md: T`换 potential：$\psi_{12}=\begin{bmatrix}1&1\\1&4\end{bmatrix}$，$\psi_{23}=\begin{bmatrix}1&2\\2&1\end{bmatrix}$（同样是打分表：行 = 前一个变量，列 = 后一个变量）。求 $P(x_3=1)$。`, steps: [
          { ask: T`$m_{1\to2}(x_2=1)=?$`, answer: 5, show: T`第二列 $1+4=5$（$m_{1\to2}(0)=1+1=2$）` },
          { ask: T`$m_{2\to3}(x_3=1)=?$`, answer: 9, show: T`$\psi_{23}(0,1)\cdot2+\psi_{23}(1,1)\cdot5=2\times2+1\times5=9$（$x_3=0$：$1\times2+2\times5=12$）` },
          { ask: T`$P(x_3=1)=?$`, answer: 0.4286, tol: 0.002, show: T`$9/(12+9)=3/7$` },
        ] },
        { md: T`星形树：$x_2$ 是中心，叶子 $x_1,x_3$，查询 $x_2$。已知 $m_{1\to2}=(4,3)$，$m_{3\to2}=(3,4)$。`, steps: [
          { ask: T`$P(x_2=0)=?$`, answer: 0.5, show: T`$P(x_2)\propto(4\times3,\ 3\times4)=(12,12)$，各 0.5`, sg: 3 },
        ] },
      ] },
    ],
    viz: [
      { id: 'msg-passing', how: '4 个二元节点，potential $\\psi=2$（两端相同）或 $1$（不同），$X_1$ 另有一个偏向 0 的**单点因子（unary factor：只含一个变量的因子，相当于对 $X_1$ 的先验偏好）** $(0.7,0.3)$。每点一次"下一步"发出一条消息：下方输出区把这条消息的求和逐项展开（精确分数），表格记下得到的向量 $[m(0),m(1)]$；最后一次点击给出各节点的边缘并和暴力枚举核对。预设 chain 表示链，star 表示星形；root（根节点）是任选的消息汇集点。collect（收集阶段）就是从叶子逐步向根节点传消息。',
        try: '① 选 chain、root = X4：先看 collect 阶段，消息从 X1 一路传到 X4，正是本章的消元。② 注意工具的规则多了单点因子：$m_{i\\to j}(x_j)=\\sum_{x_i}\\phi_i(x_i)\\,\\psi_{ij}(x_i,x_j)\\prod_{k\\in N(i)\\setminus j}m_{k\\to i}(x_i)$，其中 $\\phi_{X1}=(7/10,\\ 3/10)$（按 $X_1=0$、$X_1=1$ 的顺序：$X_1$ 自己偏好取 0），其他节点 $\\phi=1$（乘了也不变，所以正文的消息里没有 $\\phi$）。这个工具的 $\\psi$ 是"两端相同打 2、不同打 1"。第一条消息（也按 $X_2=0,1$ 的顺序）：$X_2=0$ 时，$X_1=0$ 相同贡献 $0.7\\times2$，$X_1=1$ 不同贡献 $0.3\\times1$。合起来：$m_{X1\\to X2}=(0.7\\cdot2+0.3\\cdot1,\\ 0.7\\cdot1+0.3\\cdot2)=(17/10,\\ 13/10)$——先自己算，再点下一步核对。③ 跑完后读 X4 的边缘，和暴力枚举对比。' },
    ],
    compare: [
      { t: 'table', head: ['', '暴力求和', '消元 / 消息传递（树）'], rows: [
        ['做法', '对所有其他变量的所有组合求和', '从叶子开始一次消掉一个变量'],
        ['$n$ 个二元变量的计算量', '约 $2^{n}$', '约 $n\\times$（每条边 $2\\times2$）'],
        ['适用', '任何图（但只适合很小的图）', '树（一般图见 c58）'],
      ] },
      { t: 'exam', md: T`**Variable elimination on a tree:** To compute a marginal such as $P(x_4)\propto\sum_{x_1,x_2,x_3,x_5}\psi_{12}\psi_{23}\psi_{24}\psi_{45}$, push each sum inside the product as far as possible and eliminate variables from the leaves towards the query: $m_{5\to4}(x_4)=\sum_{x_5}\psi_{45}(x_4,x_5)$, $m_{1\to2}(x_2)=\sum_{x_1}\psi_{12}(x_1,x_2)$, $m_{3\to2}(x_2)=\sum_{x_3}\psi_{23}(x_2,x_3)$, $m_{2\to4}(x_4)=\sum_{x_2}\psi_{24}(x_2,x_4)m_{1\to2}(x_2)m_{3\to2}(x_2)$. Then $P(x_4)\propto m_{2\to4}(x_4)\,m_{5\to4}(x_4)$, normalised over the values of $x_4$. Each message multiplies the sender's other incoming messages with the potential on the outgoing edge and sums out the sender.` },
    ],
    pitfalls: [
      ['消息是一个数', '是收件人变量的**函数**：收件人每个取值一个数。'],
      ['发消息时乘上所有来信', '不乘来自收件人自己的那条（只乘**其他**邻居的）。'],
      ['边缘 = 消息之积，已经是概率', '只是正比；要除以各取值之和归一化。'],
      ['必须先算出 $Z$', '不用：先算未归一化的，最后统一归一化（$Z$ 是常数）。'],
    ],
    quiz: [
      { type: 'num', q: '叶子 $x_1$，$\\psi_{12}=\\begin{bmatrix}2&5\\\\1&1\\end{bmatrix}$（打分表：行 = $x_1$ 取 0/1，列 = $x_2$ 取 0/1）。$m_{1\\to2}(x_2=1)=?$', answer: 6, explain: T`叶子发出的 message（消息）就是把自己求和掉：$m_{1\to2}(x_2)=\sum_{x_1}\psi_{12}(x_1,x_2)$。固定 $x_2=1$ 就是看第二列（列 = $x_2$ 取 1），再对 $x_1$ 的两种取值相加：$\psi_{12}(0,1)+\psi_{12}(1,1)=5+1=6$。叶子没有其他来信，不用再乘别的。陷阱：加成第二行 $1+1=2$——行是 $x_1$，对 $x_1$ 求和要按列加。` },
      { type: 'num', q: '节点 $x$（取 0/1）收到两条消息 $(2,3)$ 和 $(4,1)$（括号按 $(x=0,\\ x=1)$ 的顺序）。$P(x=0)=?$', answer: 0.7273, tol: 0.002, explain: '两条消息逐项相乘：$(2\\times4,\\ 3\\times1)=(8,3)$；归一化：$8/(8+3)=8/11\\approx0.727$。' },
      { type: 'mc', q: '在树上消元的顺序应该是：', options: ['从查询节点往叶子', '从叶子往查询节点', '随便', '按编号'], answer: 1, explain: T`叶子只有一个邻居、只出现在一个因子里，把它求和掉，得到的消息只依赖那一个邻居；剩下的图仍是一棵更小的树，可以接着消下一个叶子，表永远不会变大。最后只剩查询变量，把来信相乘、归一化就是它的边缘。"从查询节点往叶子"不行：查询变量要保留，不能先求和掉；从中间开始消，又会把它的几个邻居绑成一张更大的表。L21 p11（求 $P(x_4)$，从叶子 $x_1,x_3,x_5$ 开始）。` },
    ],
  });

  /* =====================================================================
   * c57 · Evidence 与 belief propagation（L21 p24–p37）
   * ===================================================================== */
  add({
    id: 'c57', week: 'W11', lec: 'L21', pages: 'L21 p24–p37', star: 2,
    keyEn: [
      T`Evidence: multiply each factor containing an observed variable by $\delta(x_i,\hat x_i)$ (modified factor $\tilde\psi$), eliminate as usual, then normalise to get the posterior marginal.`,
      T`Belief propagation on a tree: pick any root, collect messages from the leaves to the root, then distribute from the root back to the leaves; $2(n-1)$ messages give every node's marginal.`,
      T`Marginal of neighbours: $P(x_2,x_4)\propto m_{1\to2}(x_2)\,m_{3\to2}(x_2)\,\psi_{24}(x_2,x_4)\,m_{5\to4}(x_4)$, the other incoming messages times the potential between them.`,
      T`Graphs with cycles: junction tree (exact) or loopy belief propagation (approximate, since messages travel round loops and evidence is counted more than once).`,
    ],
    keyZh: [
      T`加入观测：把含观测变量的因子乘上指示函数 $\delta$（得到 modified factor $\tilde\psi$），即把和观测矛盾的那一行清零；之后照常消元，最后归一化，就是后验边缘。`,
      T`信念传播（belief propagation，简称 BP）：任选一个 root，先从叶子把消息收到 root（collect），再从 root 发回叶子（distribute）。每条边两个方向各一条，共 $2(n-1)$ 条消息，所有节点的边缘就都有了。`,
      T`相邻两点的联合边缘：两点各自从外面收到的消息，乘上两点之间的 potential。这条边上来回的两条消息不乘，否则同一份信息算了两遍。`,
      T`有环的图：用联结树（junction tree）得到精确结果；或者硬在环上跑 loopy belief propagation，结果是近似的，因为消息会绕着环转回来，证据被重复计算。`,
    ],
    title: 'Evidence 与 belief propagation', en: 'Incorporating evidence and two-phase belief propagation',
    summary: '有观测时，把**含观测变量的因子乘上指示函数** $\\delta(x_i,\\hat x_i)$（得到 modified factor $\\tilde\\psi$），然后照常消元。想要**所有**节点的边缘？不必对每个节点各做一次消元：**belief propagation（信念传播）** 任选一个节点当 root（消息的汇合点），**① 从叶子收消息到 root（collect），② 再从 root 发回叶子（distribute）**——每条边两个方向各一条消息，之后每个节点的边缘 $\\propto$ 收到的所有消息之积（再除以总和归一化）；相邻两点的联合边缘 $\\propto$ 外来消息 × 两点之间的 potential。',
    prereq: ['c56'],
    symbols: [
      [T`$x_i$`, T`第 $i$ 个节点的变量；房间例子中 $1$ 表示热、$-1$ 表示冷，后面的三节点链改用 0/1`],
      [T`$\psi_{ij}(x_i,x_j)$`, T`边 $i$—$j$ 的势函数（potential）：给两端变量的每种组合打分的小表，不是归一化概率。反向使用时仍是同一张表：$\psi_{ji}(x_j,x_i)=\psi_{ij}(x_i,x_j)$`],
      [T`$m_{i\to j}(x_j)$`, T`从节点 $i$ 发给节点 $j$ 的消息：把 $i$ 那一侧的变量加掉后，留下收件变量 $x_j$ 每个取值对应的一个分数`],
      [T`$\propto$`, T`正比于：右边先给未归一化分数，除以所有取值的分数总和才得到概率`],
      [T`$Z$`, T`归一化常数：把联合分布中所有变量组合的打分相加`],
      [T`$\sum_{x_i},\ \prod,\ N(i)\setminus j$`, T`分别表示对 $x_i$ 的所有取值相加、把列出的各项连乘、从节点 $i$ 的邻居集合中排除收件人 $j$`],
      [T`$\hat x_i$`, T`变量 $x_i$ 的观测值`],
      [T`$\delta(a,b)$`, T`指示函数：$a=b$ 时为 1，否则 0`],
      [T`$\tilde\psi_{ij}$`, T`modified factor：$\delta(x_i,\hat x_i)\,\psi_{ij}(x_i,x_j)$`],
      [T`root`, T`任选的一个节点；消息先汇向它，再从它发出`],
      [T`$N(i)$`, T`节点 $i$ 的邻居集合`],
    ],
    goals: [
      '用 modified factor 加入观测，算后验边缘（L21 p24–p27）',
      '执行两阶段 belief propagation，写出 distribute 阶段的消息（L21 p28–p33）',
      '从消息读出单点边缘和相邻两点的联合边缘（L21 p34–p35）',
      '说出非树图的两种办法：junction tree（精确）和 loopy BP（近似）（L21 p36）',
    ],
    types: ['T06'],
    what: [
      { t: 'h3', text: '① 接着 c56：有观测怎么办，所有节点的边缘怎么一次算完' },
      T`c56 只处理了「没有观测、只问一个节点 $x_4$」。本章补两件事：有观测时怎么消元；想要**每个**节点的边缘时，怎么不必对每个节点各做一次消元。`,
      { t: 'h3', text: '② 加入观测（L21 p24–p27）' },
      T`c56 ② 是在整张联合表上把和观测矛盾的行划掉。不列整张表时，这一步搬到**因子**上：观测到 $x_1=\hat x_1$，而 $x_1$ 只出现在 $\psi_{12}$ 里，所以只给 $\psi_{12}$ 乘上 $\delta(x_1,\hat x_1)$，其余因子和消元步骤都照旧：`,
      { t: 'math', tex: T`\tilde\psi_{12}(x_1,x_2)=\delta(x_1,\hat x_1)\,\psi_{12}(x_1,x_2),\qquad P(x_4\mid\hat x_1)\propto\sum_{x_1,x_2,x_3,x_5}\tilde\psi_{12}\,\psi_{23}\,\psi_{24}\,\psi_{45}` },
      T`$\delta$ 把 $x_1\ne\hat x_1$ 的项都变成 0——在 $\psi_{12}$ 的表里，就是把 $x_1\ne\hat x_1$ 的**那一整行**清零（如果观测的是列变量 $x_2$，就清零对应的列）。所以对 $x_1$ 求和时只剩 $x_1=\hat x_1$ 那一项。之后**完全照常**消元、归一化——观测不是新算法，只是改一下因子。`,
      g(TREE, { t: 'graph', edges: 'x1-x2=ψ̃₁₂ x2-x3=ψ₂₃ x2-x4=ψ₂₄ x4-x5=ψ₄₅', cls: { x1: 'given', x4: 'q' }, w: 260, caption: '观测到 $x_1$（灰色）：只是把它那条边上的因子换成修改过的 $\\tilde\\psi_{12}$，其他照旧。' }),
      { t: 'h3', text: '③ 一次算出所有节点的边缘：belief propagation（L21 p28–p35）' },
      T`**为什么还需要新算法？**（L21 p28）c56 的消元一次只得到**一个**节点的边缘。想要每个节点的边缘，就得对每个节点各做一次消元——但仔细看，这些消元里大部分消息是**重复**的（比如 $m_{1\to2}$ 不管查询 $x_4$ 还是 $x_5$ 都一样）。belief propagation 把所有可能用到的消息各算一次、存起来，两轮就够。`,
      T`**Belief propagation（信念传播）**（L21 p29）：要所有节点的边缘时，任选一个节点当 root（汇合点：消息先全部汇到它，相当于 c56 里的查询节点），分两轮：`,
      { t: 'steps', items: [
        T`**Collect（收）**：从叶子向 root 发消息（就是 c56 以 root 为查询节点的消元）。结束时 root 已经收到了所有其他节点的信息。`,
        T`**Distribute（发）**：从 root 向叶子发消息，规则不变——发送者把**除了收件人以外**的来信乘上外出 potential，再对自己求和。`,
      ] },
      { t: 'graphs', r: 16, items: [
        g(TREE, { edges: 'x1>x2:msg=m₁→₂ x3>x2:msg=m₃→₂ x2>x4:msg=m₂→₄ x5>x4:msg=m₅→₄', cls: { x4: 'hl2' }, caption: '第 1 阶段 collect：消息从叶子流向 root $x_4$（黄）。这一步就是 c56 的消元。' }),
        g(TREE, { edges: 'x2>x1:msg=m₂→₁ x2>x3:msg=m₂→₃ x4>x2:msg=m₄→₂ x4>x5:msg=m₄→₅', cls: { x4: 'hl2' }, caption: '第 2 阶段 distribute：消息从 root 流回叶子。现在每条边两个方向各有一条消息。' }),
      ] },
      T`**发消息像接力，不能跳步。** $m_{2\to1}$ 要用 $m_{4\to2}$，而 $m_{4\to2}$ 又必须先有 $m_{5\to4}$——所以第二阶段只能从 root 一层一层往外发，不能先发给叶子。collect 阶段同理：中间节点要等叶子先发完才能算。这样每条边两个方向各算一次就够：$n$ 个点的树恰好有 $n-1$ 条边（从一个点开始，每接上一个新点用一条边；再多连一条就成了环），所以一共 $2(n-1)$ 条消息。`,
      T`下面的视频和数值例子回到**没有观测**的情况（用原始 $\psi$，不是 $\tilde\psi$），打分表和 c56 相同：「热·冷」= 公式里前一个变量热、后一个变量冷，例如 $\psi_{24}$ 的「热·冷」= $x_2$ 热、$x_4$ 冷，打 1 分。`,
      { t: 'table', cls: 'compact', head: ['边（哪两个房间）', '热·热', '热·冷', '冷·热', '冷·冷'], rows: [
        [T`$\psi_{12}(x_1,x_2)$：房间 1–2`, '3', '1', '1', '1'],
        [T`$\psi_{23}(x_2,x_3)$：房间 2–3`, '1', '2', '1', '1'],
        [T`$\psi_{24}(x_2,x_4)$：房间 2–4`, '4', '1', '1', '2'],
        [T`$\psi_{45}(x_4,x_5)$：房间 4–5`, '3', '1', '1', '2'],
      ] },
      { t: 'video', id: 'bp' },
      T`**先用 c56 的数字把第二阶段算一遍**（同一棵树、同一组打分表，root $=x_4$，没有观测）。第一阶段就是 c56 算过的四条：$m_{1\to2}=(4,2)$，$m_{3\to2}=(3,2)$，$m_{2\to4}=(52,20)$，$m_{5\to4}=(4,3)$（括号里是（热，冷））。第二阶段从 $x_4$ 往回发，规则不变——**只乘「除了收件人以外」的来信**。下面消息向量相乘都指按同一取值逐项乘，不是向量内积；例如 $m_{1\to2}\cdot m_{4\to2}=(4\times19,\ 2\times10)=(76,20)$，两个分量仍分别对应热、冷：`,
      { t: 'table', cls: 'compact', head: ['消息', '乘哪些来信', '算（热，冷）', '结果'], rows: [
        [T`$m_{4\to5}$`, T`$m_{2\to4}=(52,20)$`, T`$x_5$ 热：$52\times3+20\times1$；冷：$52\times1+20\times2$`, '(176, 92)'],
        [T`$m_{4\to2}$`, T`$m_{5\to4}=(4,3)$`, T`$x_2$ 热：$4\times4+3\times1$；冷：$4\times1+3\times2$`, '(19, 10)'],
        [T`$m_{2\to3}$`, T`$m_{1\to2}\cdot m_{4\to2}=(76,20)$`, T`$x_3$ 热：$76\times1+20\times1$；冷：$76\times2+20\times1$`, '(96, 172)'],
        [T`$m_{2\to1}$`, T`$m_{3\to2}\cdot m_{4\to2}=(57,20)$`, T`$x_1$ 热：$57\times3+20\times1$；冷：$57\times1+20\times1$`, '(191, 77)'],
      ] },
      T`现在每个节点把**所有**来信相乘就是它的边缘：$P(x_5)\propto(176,92)$，$P(x_3)\propto(96,172)$，$P(x_1)\propto(191,77)$，$P(x_2)\propto m_{1\to2}m_{3\to2}m_{4\to2}=(4\cdot3\cdot19,\ 2\cdot2\cdot10)=(228,40)$，$P(x_4)\propto(208,60)$。**自检**：每一对加起来都是 $268=Z$。只多算了 4 条消息，就得到了全部 5 个节点的边缘。下面是同一套规则的符号写法：`,
      T`课件（root = $x_4$）第二阶段的消息（L21 p30–p33）：`,
      { t: 'math', tex: T`m_{4\to5}(x_5)=\sum_{x_4}m_{2\to4}(x_4)\,\psi_{45}(x_4,x_5),\qquad m_{4\to2}(x_2)=\sum_{x_4}m_{5\to4}(x_4)\,\psi_{24}(x_2,x_4)` },
      { t: 'math', tex: T`m_{2\to3}(x_3)=\sum_{x_2}m_{1\to2}(x_2)\,m_{4\to2}(x_2)\,\psi_{23}(x_2,x_3),\qquad m_{2\to1}(x_1)=\sum_{x_2}m_{3\to2}(x_2)\,m_{4\to2}(x_2)\,\psi_{12}(x_1,x_2)` },
      { t: 'table', cls: 'compact', head: ['消息', '发送者', '发送者的邻居', '乘哪些来信（去掉收件人那条）', '外出 potential'], rows: [
        ['$m_{4\\to5}$', '$x_4$', '$x_2,x_5$', '$m_{2\\to4}$', '$\\psi_{45}$'],
        ['$m_{4\\to2}$', '$x_4$', '$x_2,x_5$', '$m_{5\\to4}$', '$\\psi_{24}$'],
        ['$m_{2\\to3}$', '$x_2$', '$x_1,x_3,x_4$', '$m_{1\\to2},\\ m_{4\\to2}$', '$\\psi_{23}$'],
        ['$m_{2\\to1}$', '$x_2$', '$x_1,x_3,x_4$', '$m_{3\\to2},\\ m_{4\\to2}$', '$\\psi_{12}$'],
      ] },
      T`**读边缘**（L21 p34–p35）：单点 $P(x_i)\propto$ 所有来信之积，如 $P(x_2)\propto m_{1\to2}m_{3\to2}m_{4\to2}$、$P(x_5)\propto m_{4\to5}$。有时问的是**两个相邻变量一起**取某组值的概率（比如 $x_2$ 和 $x_4$ 同时热），就用相邻两点的公式：`,
      { t: 'math', tex: T`P(x_2,x_4)\propto m_{1\to2}(x_2)\,m_{3\to2}(x_2)\,\psi_{24}(x_2,x_4)\,m_{5\to4}(x_4)` },
      T`——为什么是这几项？只留 $x_2,x_4$、把其余变量加掉：$P(x_2,x_4)\propto\big[\sum_{x_1}\psi_{12}\big]\big[\sum_{x_3}\psi_{23}\big]\,\psi_{24}\,\big[\sum_{x_5}\psi_{45}\big]$，三个方括号正是 $m_{1\to2}$、$m_{3\to2}$、$m_{5\to4}$，中间的 $\psi_{24}$ 没被任何求和吃掉，所以单独乘。这条边上来回的两条消息 $m_{2\to4}$、$m_{4\to2}$ **不乘**：它们已经含有 $\psi_{24}$ 和对方那一侧，再乘就算了两遍。数字：$x_2,x_4$ 都热：$(4\cdot3)\times\psi_{24}(\text{热},\text{热})\times4=12\times4\times4=192$；热·冷 $12\times1\times3=36$；冷·热 $4\times1\times4=16$；冷·冷 $4\times2\times3=24$；合计又是 268。`,
      T`**不是树怎么办**（L21 p36）：① 把有环的那几个节点聚成一个团（c55：两两相连的一组点），得到"团的树"——junction tree（c58，精确）；② 硬在有环图上跑 BP——loopy belief propagation，消息会绕着环转回来、同一份证据被算了不止一次，所以结果是近似的。`,
      { t: 'slide', src: 'L21/p36', caption: T`虚线蓝框把三角形 $x_2$—$x_3$—$x_4$ 圈成一个团（当成一个超级节点）：框内怎么连都不影响外面，整个框对外只有两个出口——$x_2$ 接上方的 $x_1$，$x_4$ 接下方的 $x_5$。` },
      T`把框看成一个点，图就变成 $x_1$—团—$x_5$ 的一条链，还是一棵树。这就是 c58 的 junction tree：**把有环的那一小块塞进一个团里，团和团之间没有环**，c56 的两条消息规则照用，只是「节点」换成团，消息只对相邻两个团共有的变量打分（这些共有变量叫 separator，c58 细讲）。`,
    ],
    why: [
      T`概念题："belief propagation 分哪两个阶段、为什么两个阶段就够"、"怎么加入观测"、"有环怎么办"。junction tree（c58）上的 collect / distribute 和这里完全一样，只是节点换成团。`,
    ],
    intuition: [
      T`**为什么两轮就够？** 一个节点的边缘需要它**每个邻居方向**的一条来信。collect 之后，每条边上"朝 root 方向"的消息都有了；distribute 之后，"背离 root 方向"的也有了——树上每条边恰好两个方向各一条消息，所有节点的所有来信就齐了。$n$ 个节点的树只有 $n-1$ 条边，一共 $2(n-1)$ 条消息，就算出了**全部** $n$ 个边缘，而不是做 $n$ 次消元。`,
      T`**为什么不能把来自收件人的消息乘回去？** 那条消息里的信息本来就来自收件人那一侧；再发回去，收件人就把自己的信息数了两遍。`,
      { t: 'graphs', r: 16, caption: '一条消息像一次传话：只能沿边走，会不会绕回来？', items: [
        { nodes: { x1: [50, 40], x2: [130, 190], x3: [210, 40] }, labels: sub, edges: 'x1>x2:msg=m₁→₂ x2>x3:msg=m₂→₃', caption: T`树上：$x_1$ 的信息沿唯一路径传到 $x_3$，不会被送回 $x_1$` },
        { nodes: { A: [50, 40], B: [210, 40], C: [130, 190] }, edges: 'A>B:path B>C:path C>A:path', caption: T`环上：$A$ 发出的信息经 $B$、$C$ 绕一圈又回到 $A$，$A$ 自己的证据被算了两次` },
      ] },
      T`所以「有环 ⇒ 只是近似」不是算法粗糙，而是**同一份证据在图里被数了不止一次**；圈越长、绕回来的路越多，偏差通常越大（实践里常常仍够用，见下面的 story）。`,
      { t: 'think', q: '树有 5 个节点。belief propagation 一共要发多少条消息？', a: T`4 条边，每条两个方向，共 8 条（L21 p29–p33：collect 4 条、distribute 4 条）。` },
      { t: 'story', title: 'Loopy BP 与 turbo 码', md: '1993 年 Berrou 等人发明的 turbo 码在纠错编码里接近了理论极限，但没人完全明白它为什么好用。1998 年 McEliece、MacKay 和 Cheng 指出：turbo 解码其实就是在一个有环的图上跑 Pearl 的 belief propagation——loopy BP 虽然是近似，在实践中常常非常好用。今天的 5G、Wi-Fi 里的 LDPC 解码也是这一类算法。' },
    ],
    math: [
      { t: 'h3', text: '接 c56 的链：两阶段 BP（root = $x_3$）' },
      T`（上面的公式用的是课件的 5 节点树；下面换回 c56 的 3 节点链 $x_1$—$x_2$—$x_3$，方便手算。）`,
      PSI,
      { t: 'table', cls: 'compact', head: ['阶段', '消息', '计算', '结果（收件变量取 0、取 1）'], rows: [
        ['collect', '$m_{1\\to2}(x_2)$', '$\\psi_{12}$ 列和', '$(4,\\ 3)$'],
        ['collect', '$m_{2\\to3}(x_3)$', '$\\sum_{x_2}\\psi_{23}(x_2,x_3)m_{1\\to2}(x_2)$', '$(11,\\ 13)$'],
        ['distribute', '$m_{3\\to2}(x_2)$', '$\\sum_{x_3}\\psi_{23}(x_2,x_3)$（$x_3$ 没有其他来信）', '$(3,\\ 4)$'],
        ['distribute', '$m_{2\\to1}(x_1)$', '$\\sum_{x_2}\\psi_{12}(x_1,x_2)m_{3\\to2}(x_2)$', '$(13,\\ 11)$'],
      ] },
      T`$m_{2\to1}$ 的计算：$x_1=0$：$3\times3+1\times4=13$；$x_1=1$：$1\times3+2\times4=11$。`,
      { t: 'table', cls: 'compact', head: ['边缘', '来信之积', '归一化'], rows: [
        ['$P(x_1)$', '$m_{2\\to1}=(13,11)$', '$(13/24,\\ 11/24)$'],
        ['$P(x_2)$', '$m_{1\\to2}\\cdot m_{3\\to2}=(4\\times3,\\ 3\\times4)=(12,12)$', '$(0.5,\\ 0.5)$'],
        ['$P(x_3)$', '$m_{2\\to3}=(11,13)$', '$(11/24,\\ 13/24)$'],
      ] },
      T`三个边缘的未归一化总和都是 24 = $Z$——一个很好的自检。相邻两点：$P(x_1,x_2)\propto\psi_{12}(x_1,x_2)\,m_{3\to2}(x_2)=\begin{bmatrix}3\cdot3&1\cdot4\\1\cdot3&2\cdot4\end{bmatrix}=\begin{bmatrix}9&4\\3&8\end{bmatrix}$（打分表：行 = $x_1$ 取 0/1，列 = $x_2$ 取 0/1），总和同样是 24。`,
      { t: 'h3', text: '加入观测 $x_1=1$' },
      T`$\tilde\psi_{12}$ 只保留 $x_1=1$ 那一行 $(1,2)$，另一行变 0。$m_{1\to2}=(1,\ 2)$；$m_{2\to3}(x_3)$：$x_3=0$：$2\times1+1\times2=4$；$x_3=1$：$1\times1+3\times2=7$。所以 $P(x_3=1\mid x_1=1)=7/11\approx0.636$（没有观测时是 $0.542$），和 c56 ② 列整张表、划掉、加掉得到的 $7/11$ 一样——乘 $\delta$ 就是那一步「划掉」，只是不用列整张表。`,
      T`**线性代数的说法（2021 Q18b 要写这个）**：观测 $x_1=1$ 这一步不是求和，而是取出 $\psi_{12}$ 中 $x_1=1$ 的那一行 $(1,2)$（第二行；切片 / 索引）。接下来消 $x_2$ 是矩阵乘向量：$\psi_{23}^\top\begin{bmatrix}1\\2\end{bmatrix}=\begin{bmatrix}2\times1+1\times2\\1\times1+3\times2\end{bmatrix}=\begin{bmatrix}4\\7\end{bmatrix}$（$\top$ = 转置，c56 讲过；$\psi_{23}$ 对称，转置不变）。常见丢分：不管观测、照样对 $x_1$ 的所有取值求和——那等于没观测。`,
    ],
    fx: [
      {
        title: '相邻两点的边缘（L21 p35）', tex: T`P(x_2,x_4)\propto\htmlClass{fx-p1}{m_{1\to2}(x_2)\,m_{3\to2}(x_2)}\,\htmlClass{fx-p2}{\psi_{24}(x_2,x_4)}\,\htmlClass{fx-p3}{m_{5\to4}(x_4)}`,
        parts: [
          { label: 'x₂ 的外来信', note: '$x_2$ 从**除 $x_4$ 外**的邻居收到的消息。' },
          { label: 'ψ₂₄', note: '两点之间那条边的 potential。' },
          { label: 'x₄ 的外来信', note: '$x_4$ 从**除 $x_2$ 外**的邻居收到的消息。' },
        ],
      },
    ],
    example: [
      { t: 'fade', title: '分步练习：distribute 与读边缘', plan: ['确定发送者的"其他来信"', '× 外出 potential，对发送者求和', '来信相乘，归一化'], items: [
        { md: T`链 $x_1$—$x_2$—$x_3$，$\psi_{12}=\begin{bmatrix}3&1\\1&2\end{bmatrix}$，$\psi_{23}=\begin{bmatrix}2&1\\1&3\end{bmatrix}$（打分表：行 = 前一个变量取 0/1，列 = 后一个变量取 0/1），root $=x_3$，算 $m_{2\to1}$ 和 $P(x_1)$。`, steps: [
          { md: T`$x_2$ 的其他来信：$m_{3\to2}=(3,4)$` }, { md: T`$m_{2\to1}=(13,11)$` }, { md: T`$P(x_1=0)=13/24$` },
        ] },
        { md: T`同一条链，观测 $x_1=0$，求 $P(x_3=1\mid x_1=0)$。`, steps: [
          { ask: T`$m_{1\to2}(x_2=0)=?$`, answer: 3, show: T`只剩 $x_1=0$ 那一行 $(3,1)$`, sg: 1 },
          { ask: T`$m_{2\to3}(x_3=1)=?$`, answer: 6, show: T`用 $m_{1\to2}=(3,1)$：$\psi_{23}(0,1)\cdot3+\psi_{23}(1,1)\cdot1=1\times3+3\times1=6$（$x_3=0$：$2\times3+1\times1=7$）`, sg: 2 },
          { ask: T`$P(x_3=1\mid x_1=0)=?$`, answer: 0.4615, tol: 0.002, show: T`$6/13$`, sg: 3 },
        ] },
        { md: T`同一条链，无观测，求相邻两点 $P(x_2=1,x_3=1)$。（$x_2$ 的外来信 $m_{1\to2}=(4,3)$，$x_3$ 没有其他邻居。）`, steps: [
          { ask: T`未归一化值 $m_{1\to2}(1)\,\psi_{23}(1,1)=?$`, answer: 9, show: '$3\\times3$', sg: 2 },
          { ask: '归一化后的概率 = ?', answer: 0.375, show: T`要除以四种 $(x_2,x_3)$ 组合的总和，不是只看这一格：$m_{1\to2}(x_2)\,\psi_{23}(x_2,x_3)$ 四格是 $4\times2=8$、$4\times1=4$、$3\times1=3$、$3\times3=9$，总和 $24$（就是 $Z$）。$9/24=0.375$`, sg: 3 },
        ] },
      ] },
      { t: 'h3', text: 'Workshop 12 Q3：星形图上读边缘、写消息' },
      T`这道 workshop 原题不用算数字，只考两条规则的"形状"：边缘是哪几条消息相乘；发出去的消息乘哪几条、对谁求和。两条规则就是 [c56](#/c56) 最后归纳的 Observation 1 和 2（L21 p22–p23）。`,
      {
        t: 'past', src: 'Workshop 12 Q3', topic: 'L21 p22–p23 · WK12 p8',
        q: T`Consider the following Markov random field. After running the Belief Propagation algorithm, how should we correctly compute the marginal distribution $P(V)$? Assume we want to send a message from $V$ to $S$. How should we correctly compute the message $m_{V\to S}(S)$?`,
        qzh: T`考虑下面的马尔可夫随机场（Markov random field）。运行完信念传播（belief propagation）算法后，应该怎样正确地计算边缘分布（marginal distribution）$P(V)$？假设要从 $V$ 向 $S$ 发一条消息（message），应该怎样正确地计算 $m_{V\to S}(S)$？`,
        azh: T`运行完信念传播后，$V$ 的每个邻居都已经给 $V$ 发过消息，边缘正比于所有来信的乘积（再对 $V$ 的取值归一化）：

$$P(V)\propto m_{R\to V}(V)\,m_{S\to V}(V)\,m_{T\to V}(V)\,m_{U\to V}(V)\,m_{W\to V}(V)\,m_{Y\to V}(V)$$

从 $V$ 发给 $S$ 的消息：把外出的势函数（potential）$\psi_{VS}$ 乘上 $V$ 从除 $S$ 以外所有邻居收到的消息，再对 $V$ 求和：

$$\begin{aligned}m_{V\to S}(S)=\sum_{V}\psi_{VS}(V,S)\,&m_{R\to V}(V)\,m_{T\to V}(V)\\&\times m_{U\to V}(V)\,m_{W\to V}(V)\,m_{Y\to V}(V)\end{aligned}$$`,
        blocks: [g(WS12Q3, { t: 'graph', edges: WS12Q3_EDGES, cls: { V: 'q' }, w: 260, caption: '题图：$V$（红圈）在中心，连着 $R,S,T,U,W,Y$ 六个点；$X$ 只连 $U$，$Z$ 只连 $W$。没有环，是一棵树。' })],
        sol: [
          { t: 'h4', text: '第 0 步：数清 $V$ 的邻居' },
          T`和 $V$ 直接连边的点是 $R,S,T,U,W,Y$，一共 6 个，记作 $N(V)$。$X$ 和 $Z$ 不是 $V$ 的邻居：$X$ 挂在 $U$ 上，$Z$ 挂在 $W$ 上。这张图有 9 个点、8 条边、没有环，是一棵树，所以 BP 算出的边缘是精确的。`,
          T`"跑完 BP"的意思是 collect 和 distribute 两轮都做完了：8 条边、每条两个方向各一条消息，共 16 条。不管 root 选的是谁，$V$ 的 6 个邻居都已经各给 $V$ 发过一条消息。`,
          { t: 'h4', text: '第 1 问：边缘 $P(V)$ = 所有来信相乘' },
          T`规则（L21 p23，Observation 2）：一个节点的边缘正比于它收到的全部消息之积。$V$ 有 6 个邻居，就乘 6 条：`,
          { t: 'math', tex: T`P(V)\propto m_{R\to V}(V)\,m_{S\to V}(V)\,m_{T\to V}(V)\,m_{U\to V}(V)\,m_{W\to V}(V)\,m_{Y\to V}(V)` },
          T`这只是"正比于"：对 $V$ 的每个取值各算一个乘积，再除以这些乘积的总和，才是概率。$X$ 的信息已经装在 $m_{U\to V}$ 里，因为 $m_{U\to V}(V)=\sum_U\psi_{UV}(U,V)\,m_{X\to U}(U)$；$Z$ 的信息同样装在 $m_{W\to V}$ 里，所以不用另外再乘。`,
          { t: 'h4', text: T`第 2 问：消息 $m_{V\to S}(S)$ = 其他来信 × 外出 potential，再对 $V$ 求和` },
          T`规则（L21 p22，Observation 1）：$m_{i\to j}(x_j)=\sum_{x_i}\psi_{ij}(x_i,x_j)\prod_{k\in N(i)\setminus j}m_{k\to i}(x_i)$。这里发送者 $i=V$，收件人 $j=S$，除了 $S$ 以外的邻居是 $N(V)\setminus S=\{R,T,U,W,Y\}$：`,
          { t: 'math', tex: T`\begin{aligned}m_{V\to S}(S)=\sum_{V}\psi_{VS}(V,S)\,&m_{R\to V}(V)\,m_{T\to V}(V)\\&\times m_{U\to V}(V)\,m_{W\to V}(V)\,m_{Y\to V}(V)\end{aligned}` },
          {
            t: 'steps', items: [
              T`乘 5 条来信，不乘 $m_{S\to V}$：那条消息带的是 $S$ 那一侧的信息，再发回给 $S$ 就算了两遍。`,
              T`外出 potential 是 $V$ 和 $S$ 之间那条边的打分表 $\psi_{VS}(V,S)$。WK12 p8 写成 $\psi_{SV}(S,V)$，是同一张表，下标先写谁都行。`,
              T`对发送者 $V$ 求和：把 $V$ 的每个取值代进去算乘积，再加起来。求完以后 $V$ 消失了，结果只依赖 $S$，也就是 $S$ 每个取值一个数。`,
            ],
          },
          { t: 'graphs', r: 15, caption: '绿色箭头 = 用到的消息；红圈 = 要算的那个变量。', items: [
            g(WS12Q3, { edges: 'R>V:msg S>V:msg T>V:msg U>V:msg W>V:msg Y>V:msg U-X W-Z', cls: { V: 'q' }, caption: '① $P(V)$：6 条来信全部相乘' }),
            g(WS12Q3, { edges: 'R>V:msg T>V:msg U>V:msg W>V:msg Y>V:msg V>S:path U-X W-Z', cls: { V: 'hl2', S: 'q' }, caption: T`② $m_{V\to S}$：5 条来信（没有 $S$ 发来的那条）× $\psi_{VS}$，对 $V$ 求和，沿红箭头发给 $S$` }),
          ] },
          {
            t: 'exam', md: T`After belief propagation has finished, every neighbour of $V$ has sent $V$ a message, and the marginal of $V$ is proportional to the product of all its incoming messages (normalised over the values of $V$):

$$P(V)\propto m_{R\to V}(V)\,m_{S\to V}(V)\,m_{T\to V}(V)\,m_{U\to V}(V)\,m_{W\to V}(V)\,m_{Y\to V}(V)$$

The message from $V$ to $S$ multiplies the outgoing potential $\psi_{VS}$ with the messages $V$ receives from all its neighbours except $S$, and sums out $V$:

$$\begin{aligned}m_{V\to S}(S)=\sum_{V}\psi_{VS}(V,S)\,&m_{R\to V}(V)\,m_{T\to V}(V)\\&\times m_{U\to V}(V)\,m_{W\to V}(V)\,m_{Y\to V}(V)\end{aligned}$$`,
          },
          {
            t: 'warn', md: T`- **两条规则别混**：边缘乘全部 6 条（包括 $m_{S\to V}$）；只有发消息时才去掉收件人那一条。
- 发给 $S$ 的消息是对 $V$ 求和，不是对 $S$ 求和；结果必须是 $S$ 的函数。
- 不要写 $m_{X\to V}$、$m_{Z\to V}$：$X,Z$ 不是 $V$ 的邻居，这两条消息不存在。
- 边缘公式里没有 $\psi$：potential 只出现在发消息的求和里。`,
          },
        ],
      },
    ],
    viz: [
      { id: 'msg-passing', how: '沿用 [c56 的工具](#/c56)，但工具是另一个四节点模型，不是上面的三节点链或五房间树。预设 chain 表示链，star 表示星形。工具表中的 unary factor（单点因子）$\\phi_i(x_i)$ 是只给节点自己打分的一项：$X_1$ 取 0、1 的打分分别为 0.7、0.3，其余节点的单点打分都是 1。因此工具发消息时还要乘发送者的 $\\phi_i(x_i)$，读节点边缘时也要乘该节点自己的 $\\phi_i(x_i)$，再归一化；正文没有单点因子，相当于它们全为 1。这次一直点到 distribute 结束：每条边两个方向各一条消息。下方输出区最后给出每个节点的边缘，并和暴力枚举核对。',
        try: '① chain、root 选 X2：collect 有 3 条消息、distribute 有 3 条。② 换 root 为 X4：消息顺序变了，但最后所有边缘完全一样——root 可以任选。③ 星形图：中心节点的边缘要乘 3 条来信。' },
    ],
    compare: [
      { t: 'table', head: ['', 'Variable elimination（c56）', 'Belief propagation'], rows: [
        ['得到', '一个节点的边缘', '所有节点（和相邻点对）的边缘'],
        ['消息数（树，$n$ 个节点）', '$n-1$', '$2(n-1)$'],
        ['做法', '从叶子到查询节点', 'collect 到 root，再 distribute 回叶子'],
      ] },
      { t: 'table', head: ['图', '方法', '结果'], rows: [
        ['树', 'belief propagation', '精确'],
        ['有环', 'junction tree（c58）', '精确（但团可能很大）'],
        ['有环', 'loopy belief propagation', '近似'],
      ] },
      { t: 'exam', md: T`**Belief propagation on a tree:** Choose any root. (1) Collect: send messages from the leaves to the root, $m_{i\to j}(x_j)=\sum_{x_i}\psi_{ij}(x_i,x_j)\prod_{k\in N(i)\setminus j}m_{k\to i}(x_i)$. (2) Distribute: send messages from the root back to the leaves with the same rule. Every edge then carries one message in each direction, so each node's marginal is the normalised product of all its incoming messages, $P(x_i)\propto\prod_{k\in N(i)}m_{k\to i}(x_i)$, and the marginal of two neighbours is the product of their other incoming messages and the potential between them. Evidence is incorporated beforehand by multiplying the factors that involve observed variables by indicators $\delta(x_i,\hat x_i)$. On graphs with cycles one uses a junction tree (exact) or loopy BP (approximate).` },
    ],
    pitfalls: [
      ['观测要用一个专门的新算法', '只是把相关因子乘上 $\\delta$，然后照常消元（L21 p24）。'],
      ['Distribute 时也乘上来自收件人的消息', '不乘：只乘**其他**来信。例：算 $m_{4\\to2}(x_2)$ 只乘 $m_{5\\to4}$，不乘 $m_{2\\to4}$；$\\psi_{24}$ 只负责按 $x_2,x_4$ 的组合打分，不代表节点 2 整侧子树的信息；那一侧的信息不应在这条回信中再次传回。'],
      ['相邻两点的边缘要乘上所有 4 条消息', '只乘两点各自的外来信 + 中间的 potential；这条边上的两条消息不乘。'],
      ['Loopy BP 是精确的', '有环时是近似（L21 p36）。'],
      ['Root 选不同，边缘不同', '任意 root 结果都一样。'],
    ],
    quiz: [
      { type: 'num', q: '7 个节点的树做 belief propagation，一共发几条消息？', answer: 12, explain: T`belief propagation（信念传播）分两轮：collect（收）从叶子到 root，每条边朝 root 方向发一条消息；distribute（发）从 root 回到叶子，每条边反方向再发一条。所以消息数 = 边数 × 2。$n$ 个节点的树恰好有 $n-1$ 条边：$7-1=6$ 条，消息 $6\times2=12$ 条。陷阱：用节点数算成 $7\times2=14$，要数的是边。` },
      { type: 'num', q: '节点 $x$（取 0/1）有 3 个邻居，来信分别为 $(1,2)$、$(2,1)$、$(3,1)$（括号按 $(x=0,\\ x=1)$）。$P(x=1)=?$', answer: 0.25, explain: T`要算的是 $x$ 的边缘：$P(x)\propto$ 所有来信的乘积，每个取值分开乘。$x=0$ 取三条来信的第一个数：$1\times2\times3=6$；$x=1$ 取第二个数：$2\times1\times1=2$。乘积只是"正比于"，还要除以两个取值的总和：$P(x=1)=\frac{2}{6+2}=0.25$。陷阱：忘了归一化直接答 2，或者把三条来信相加而不是相乘。` },
      { type: 'mc', q: '在有环的图上直接跑 belief propagation 叫：', options: ['junction tree', 'loopy belief propagation', 'variable elimination', 'Gibbs sampling'], answer: 1, explain: 'L21 p36，结果是近似。' },
      { type: 'mc', q: T`Workshop 12 Q3 的星形 MRF：$V$ 的邻居是 $R,S,T,U,W,Y$，另外还有边 $U$—$X$、$W$—$Z$。计算 $m_{V\to S}(S)$ 时，除了 $\psi_{VS}(V,S)$，还要乘哪些消息？`, options: [
        T`$m_{R\to V},\ m_{T\to V},\ m_{U\to V},\ m_{W\to V},\ m_{Y\to V}$（5 条）`,
        T`$V$ 收到的全部 6 条，包括 $m_{S\to V}$`,
        T`上面 5 条，再加 $m_{X\to U}$ 和 $m_{Z\to W}$`,
        T`只乘 $m_{S\to V}$`,
      ], answer: 0, explain: T`发消息的规则（L21 p22）：发送者 $V$ 把除收件人 $S$ 以外所有邻居的来信相乘，乘上外出 potential $\psi_{VS}$，再对 $V$ 求和。$V$ 有 6 个邻居，去掉 $S$ 剩 5 条。第二项错：$m_{S\to V}$ 带的是 $S$ 那一侧的信息，再发回给 $S$ 就算了两遍；乘全部 6 条是求边缘 $P(V)$ 的做法。第三项错：$X$、$Z$ 不是 $V$ 的邻居，它们的信息已经装在 $m_{U\to V}$、$m_{W\to V}$ 里。第四项正好把该去掉的那条留下、该乘的 5 条全丢了。` },
    ],
  });

  /* =====================================================================
   * c58 · 消元找团、junction tree（L22 p4–p26）
   * ===================================================================== */
  add({
    id: 'c58', week: 'W11', lec: 'L22', pages: 'L22 p4–p26', star: 3,
    keyEn: [
      T`Cliques by elimination (moralise a BN first): for each variable in the given order, connect its current neighbours (fill-in edges), record the clique "variable + neighbours", then delete the variable.`,
      T`Keep only the maximal cliques; weight clique-graph edges by the number of shared variables and take a maximum-weight spanning tree; intersections of adjacent cliques are the separators（分隔集）.`,
      T`Running intersection property: a variable shared by two cliques appears in every clique on the path between them, so belief propagation on the cliques gives consistent, exact marginals.`,
      T`Clique messages depend only on the separator: $m_{i\to j}(s_{ij})=\sum_{c_i\setminus s_{ij}}\psi_i(c_i)\prod_{k\in N(i)\setminus j}m_{k\to i}(s_{ki})$.`,
    ],
    keyZh: [
      T`消元找团（BN 先 moralize）：按给定顺序，每消一个变量，先把它当前的邻居两两连上（缺的边叫填补边 fill-in edge），记下"它 + 邻居"这个团，再把它从图中删掉。`,
      T`只留极大团（maximal clique）。团之间按共享变量个数连边加权，取最大权重生成树，就是 junction tree；相邻两团的交集叫分隔集（separator）。`,
      T`连续交集性质（running intersection property）：两个团共有的变量，也出现在它们之间路径上的每一个团里。这保证同一变量在各团里看法一致，团上的 BP 给出精确边缘。`,
      T`团上的消息只依赖分隔集：团的 potential 乘上来自其他相邻团的消息，再把不在分隔集里的变量求和掉。规则和普通消息传递一样，只是节点换成团。`,
    ],
    title: '消元找团、junction tree', en: 'Finding cliques by elimination and building the junction tree',
    summary: '图有环时，把变量聚成团，让**团**组成一棵树——**junction tree（联结树）**，再在团上跑 belief propagation（BP，信念传播：就是 c56–c57 的消息传递，只是把节点换成团）。怎么找团（**T6 往年 8 分**）：按消元顺序一个个删变量；删之前**把它的邻居两两连上**（需要时加 fill-in 边），记下"它 + 它的邻居"这个团；最后**只保留极大团**。团之间按共享变量个数加权，取**最大权重生成树**，相邻团的交集叫 **separator（分隔集）**。',
    prereq: ['c55', 'c57'],
    symbols: [
      [T`$c_1,c_2,\dots$`, T`消元时记录下来的团（课件用下标集合写，如 $c_1=\{1,2,3\}$ 表示 $\{x_1,x_2,x_3\}$）`],
      [T`fill-in edge`, T`消元时为了把邻居连成团而**新加**的边`],
      [T`$|c_i\cap c_j|$`, T`两个团共享的变量个数（clique graph 的边权）`],
      [T`$s_{ij}$ / separator`, T`$s_{ij}=c_i\cap c_j$：junction tree 里相邻两团 $c_i,c_j$ 的交集；团上的消息只依赖这些变量`],
      [T`$\psi_i$`, T`团 $c_i$ 的 potential：把原模型的每个因子分给一个**包含它全部变量**的团，同一个团里的因子相乘（和 c55 的 BN → MRF 一样）`],
      [T`$m_{i\to j}(\cdot)$`, T`团 $c_i$ 发给团 $c_j$ 的消息，参数是它们的 separator 变量`],
    ],
    goals: [
      '说出一般图推断的流程：BN 先 moralize；消元找团；极大团；clique graph；最大权重生成树；在团上 BP（L22 p4–p26）',
      '按给定顺序做"图上的消元"，写出每一步的邻居、fill-in 边和团（T6；2026 practice Q5）',
      '只保留极大团，画 clique graph、选最大权重生成树，标出 separator（L22 p17–p22）',
      '说出 running intersection property 的含义（L22 p21）',
      '写出团上的 collect / distribute 消息和团的边缘（L22 p23–p25）',
    ],
    types: ['T06'],
    what: [
      { t: 'h3', text: '① 为什么要"团的树"（L22 p3–p4）' },
      T`c56–c57 的消息传递只在树上精确。树 = 连通、没有环的图；环 = 沿边走、不走回头路又回到出发点，比如下面 moralize 后的 $x_1$—$x_2$—$x_4$—$x_3$—$x_1$。有环时信息会绕环转回来被重复计算，所以 L22 把变量捆成一组一组（团），让团组成一棵树，再在这棵「团的树」上传消息，它叫 **junction tree（联结树）**。`,
      T`"团的树"要在**无向图**上找，因为要用无向边表示"在同一个因子里出现过"的变量之间的联系（包括共同孩子的父母）。所以第一步：如果给的是 BN，先 **moralize**（c55：共同孩子的父母连边，再去掉箭头）变成无向图；本来就是 MRF 就跳过。课件的例子：`,
      T`BN：$x_1\to x_2$，$x_1\to x_3$，$x_2\to x_4$，$x_3\to x_5$，$x_4\to x_5$。Moralize：$x_5$ 的父母 $x_3,x_4$ 连边。无向图边：$12,13,24,34,35,45$。消元顺序 $x_1,x_2,x_3,x_4,x_5$：`,
      { t: 'graphs', r: 16, items: [
        g(L22, { edges: 'x1>x2 x1>x3 x2>x4 x3>x5 x4>x5', caption: '课件 p4 的 BN' }),
        g(L22, { edges: 'x1-x2 x1-x3 x2-x4 x3-x5 x4-x5 x3-x4:moral', caption: 'moralize：$x_5$ 的父母 $x_3$—$x_4$ 结婚，再去方向' }),
      ] },
      { t: 'slide', src: 'L22/p26', caption: T`课件的总览图：左边是原来的 BN；中间一个箭头，上下分别标着 moralization（有向变无向）和 variable elimination（消元、顺手记团）；右边是 junction tree——三个椭圆是极大团 $c_1,c_2,c_3$，两团之间的小方框是 separator（分隔集）$(x_2,x_3)$、$(x_3,x_4)$。` },
      { t: 'h3', text: '② 怎么找团：按顺序在图上消元（L22 p5–p16）' },
      T`怎么找团？借用 c56 的消元：消掉一个变量 = 对它求和，得到一张只依赖它当前邻居的新表，这些邻居从此被"绑在一起"。现在先**不算**这张表，只在图上把"绑在一起"画出来——这就把变量分成了一组一组。`,
      T`按一个消元顺序，一个一个地「消掉」变量：取下一个变量，看它当前的邻居（此刻和它有边的点，前面加上的边也算），把邻居两两连上（缺的边叫 fill-in edge，填补边），记下「它 + 它的邻居」这组点，再把它和它的边从图中删掉。连完之后这组点两两都有边，正是**团（clique）**：每两个点之间都有边的一组点（c55）。课件用的顺序是 $x_1,x_2,x_3,x_4,x_5$：`,
      { t: 'graphs', r: 16, caption: '按 $x_1,x_2,x_3,x_4,x_5$ 消元（L22 p6–p16）：起点就是上面 moralize 后的图。黄色是正在消的变量，浅色是已消掉的；橙色虚线 $x_3$—$x_4$ 是 moralize 加的边（照常算邻居），紫色虚线是消元时加的 fill-in。', items: [
        g(L22, { edges: 'x1-x2 x1-x3 x2-x4 x3-x5 x4-x5 x3-x4:moral x2-x3:fill', cls: { x1: 'cur' }, caption: '① 消 $x_1$：邻居 $x_2,x_3$ 没连 ⇒ 加 fill-in；团 $\\{1,2,3\\}$' }),
        g(L22, { edges: 'x1-x2:gone x1-x3:gone x2-x4 x3-x5 x4-x5 x3-x4:moral x2-x3:fill', cls: { x1: 'done', x2: 'cur' }, caption: '② 消 $x_2$：邻居 $x_3,x_4$ 已相连；团 $\\{2,3,4\\}$' }),
        g(L22, { edges: 'x1-x2:gone x1-x3:gone x2-x4:gone x3-x5 x4-x5 x3-x4:moral x2-x3:gone', cls: { x1: 'done', x2: 'done', x3: 'cur' }, caption: '③ 消 $x_3$：邻居 $x_4,x_5$ 已相连；团 $\\{3,4,5\\}$' }),
        g(L22, { edges: 'x1-x2:gone x1-x3:gone x2-x4:gone x3-x5:gone x4-x5 x3-x4:gone x2-x3:gone', cls: { x1: 'done', x2: 'done', x3: 'done', x4: 'cur' }, caption: '④ 消 $x_4$：团 $\\{4,5\\}$；最后消 $x_5$：团 $\\{5\\}$' }),
      ] },
      { t: 'table', cls: 'compact', head: ['消', '当前邻居', 'fill-in', '团'], rows: [
        ['$x_1$', '$x_2,x_3$', '$x_2$—$x_3$', '$c_1=\\{1,2,3\\}$'],
        ['$x_2$', '$x_3,x_4$', '无（$34$ 已有）', '$c_2=\\{2,3,4\\}$'],
        ['$x_3$', '$x_4,x_5$', '无（$45$ 已有）', '$c_3=\\{3,4,5\\}$'],
        ['$x_4$', '$x_5$', '无', '$c_4=\\{4,5\\}$'],
        ['$x_5$', '无', '无', '$c_5=\\{5\\}$'],
      ] },
      T`**用两张小表看一遍。** 设 $x_1$ 连着 $x_2$ 和 $x_3$，打分表 $\psi_{12}=\begin{bmatrix}3&1\\1&2\end{bmatrix}$、$\psi_{13}=\begin{bmatrix}2&1\\1&4\end{bmatrix}$（行是 $x_1=0,1$，列是另一个变量），把 $x_1$ 求和掉：$(x_2,x_3)=(0,0)$ 时 $3\cdot2+1\cdot1=7$，四格都这样算，得到只依赖 $x_2,x_3$ 的新表 $\begin{bmatrix}7&7\\4&9\end{bmatrix}$。**新表必须同时知道 $x_2$ 和 $x_3$ 的取值才有分数**——两者被绑成了一个团，图上就补一条 $x_2$—$x_3$ 的边（fill-in）。所以记下的团 = 被消变量 + 它当时的全部邻居，表的大小 = 团的取值组合数。`,
      T`把 ② ③ 连起来动态看一遍（③ 的文字在动画下面）：`,
      { t: 'video', id: 'elim-jt' },
      { t: 'h3', text: '③ 只保留极大团，连成树（L22 p17–p22）' },
      T`上一步记下 5 个团，只留**极大团**：不被任何别的团整个包含的团。检查法：拿每个团和其他团比，它的变量全都出现在某一个别的团里就划掉——$\{4,5\}$、$\{5\}$ 都在 $\{3,4,5\}$ 里，划掉，剩 $c_1,c_2,c_3$。`,
      T`把剩下的团连成树。先画 clique graph：每个团一个点，有共同变量的两团连边，边权 = 共同变量个数（$|c_1\cap c_2|=2$，$|c_2\cap c_3|=2$，$|c_1\cap c_3|=1$）；再挑一部分边组成**生成树**（所有团连通、没有环，$n$ 个团正好 $n-1$ 条边），且边权总和最大。手算：从权最大的边加起，两端已能沿选好的边互通（再加会成环）就跳过，同权谁先都行，加够 $n-1$ 条就停——这里两条权 2 的边就够了 ⇒ $c_1$—$c_2$—$c_3$。树上相邻两团的交集叫 separator（分隔集），这里是 $\{x_2,x_3\}$ 和 $\{x_3,x_4\}$，消息只带这些变量。`,
      { t: 'graphs', r: 18, items: [
        { nodes: { c1: [40, 40], c2: [220, 40], c3: [130, 150] }, labels: { c1: 'c₁', c2: 'c₂', c3: 'c₃' }, notes: { c1: '{x₁,x₂,x₃}', c2: '{x₂,x₃,x₄}', c3: '{x₃,x₄,x₅}' }, edges: 'c1-c2=2 c2-c3=2 c1-c3=1', caption: 'clique graph：共享变量的团之间连边，边权 = 共享变量个数（p18–p20）' },
        { nodes: { c1: [40, 40], c2: [220, 40], c3: [130, 150] }, labels: { c1: 'c₁', c2: 'c₂', c3: 'c₃' }, notes: { c1: '{x₁,x₂,x₃}', c2: '{x₂,x₃,x₄}', c3: '{x₃,x₄,x₅}' }, edges: 'c1-c2:hl={x₂,x₃} c2-c3:hl={x₃,x₄} c1-c3:gone', caption: 'junction tree = 最大权重生成树（权 2+2）；边上写的是 separator（p20–p22）' },
      ] },
      T`**Running intersection property（连续交集性质）**：如果两个不相邻的团有共同变量，那这个变量也出现在它们之间路径上的每一个团里。例：$x_3$ 在 $c_1$ 和 $c_3$ 里，也在中间的 $c_2$ 里 ✓。它保证同一个变量在不同团里的「看法」能够一致。`,
      { t: 'graph', nodes: { c1: [40, 40], c3: [220, 40], c2: [130, 170] }, labels: { c1: 'c₁', c3: 'c₃', c2: 'c₂' }, notes: { c1: '{x₁,x₂,x₃}', c3: '{x₃,x₄,x₅}', c2: '{x₂,x₃,x₄}' }, edges: 'c1-c3:hl={x₃} c3-c2:hl={x₃,x₄}', cls: { c3: 'hl' }, w: 460, caption: T`反例：若为了省事保留权 1 的 $c_1$—$c_3$，树就变成 $c_3$ 夹在中间。$c_1$ 和 $c_2$ 共享 $x_2$，但 $c_1$ 的消息要送到 $c_2$ 只能经过 $c_3$，而 $c_3$ 里没有 $x_2$ ⇒ 违反 running intersection，$x_2$ 的信息根本传不过去。` },
      { t: 'h3', text: '④ 在团的树上传消息（L22 p23–p25）' },
      { t: 'slide', src: 'L22/p24', caption: T`课件 p24：三个椭圆是三个团，旁边是各自的 potential $\psi_1,\psi_2,\psi_3$，两团之间的小方框是 separator。橙色箭头是从 root $c_2$ 发出的两条消息，参数只有 separator 变量（$x_2,x_3$ 和 $x_3,x_4$）。下面公式的颜色对上了：粉色是正在算的 $m_{2\to1}$，蓝色是它用到的来信 $m_{3\to2}$，灰色的 $\sum_{x_4}$ 表示把**不在 separator 里**的 $x_4$ 求和掉。` },
      T`一句话：**团发出的消息 = 自己团的 potential × 其他团的来信，再把不在 separator 里的变量求和掉**。所以消息的「大小」永远由 separator 决定，和团有多大无关——这就是 c56 的规则能照搬到团上的原因。`,
      T`**树连好了，消息怎么算？先用最小的例子算一次。** 拿 c56 一直用的那条链 $x_1$—$x_2$—$x_3$（它本来就是树，团就是两条边），正好看清"团上的消息"和普通消息是一回事：`,
      PSI,
      { t: 'graph', nodes: { c1: [40, 40], c2: [260, 40] }, labels: { c1: 'c₁', c2: 'c₂' }, notes: { c1: '{x₁,x₂}，ψ₁=ψ₁₂', c2: '{x₂,x₃}，ψ₂=ψ₂₃' }, edges: 'c1-c2:hl=separator_{x₂}', w: 340, caption: '链的 junction tree：两个团，separator 是 $\\{x_2\\}$，所以两条消息都是"$x_2$ 每个取值一个数"。' },
      { t: 'steps', items: [
        T`$c_1\to c_2$：把 $c_1$ 里**不在 separator** 的 $x_1$ 求和掉：$m_{1\to2}(x_2)=\sum_{x_1}\psi_{12}(x_1,x_2)$ = 列和 $=(3+1,\ 1+2)=(4,\ 3)$。`,
        T`$c_2\to c_1$：把 $x_3$ 求和掉：$m_{2\to1}(x_2)=\sum_{x_3}\psi_{23}(x_2,x_3)$ = 行和 $=(2+1,\ 1+3)=(3,\ 4)$。`,
        T`团 $c_2$ 的边缘：$P(x_2,x_3)\propto m_{1\to2}(x_2)\,\psi_{23}(x_2,x_3)$：第一行乘 4、第二行乘 3，得新的打分表 $\begin{bmatrix}8&4\\3&9\end{bmatrix}$（行 $x_2$、列 $x_3$），总和 $24$（这个总和就是归一化常数 $Z$，见 [c56](#/c56)）⇒ 除以 24 就是概率。`,
        T`团 $c_1$ 的边缘：$P(x_1,x_2)\propto\psi_{12}(x_1,x_2)\,m_{2\to1}(x_2)$：第一列乘 3、第二列乘 4，得 $\begin{bmatrix}9&4\\3&8\end{bmatrix}$（行 $x_1$、列 $x_2$），总和也是 $24$。`,
      ] },
      T`**核对两件事**：① 从 $c_2$ 的表把 $x_2$ 加掉，得 $P(x_3)\propto(8+3,\ 4+9)=(11,\ 13)$——和 c56 用普通消息算的完全一样。② 两个团对共享变量 $x_2$ 的看法一致：$c_1$ 表的列和 $(9+3,\ 4+8)=(12,12)$，$c_2$ 表的行和 $(8+4,\ 3+9)=(12,12)$ ✓——这就是 running intersection 要保证的"同一个变量在不同团里看法一致"。下面 L22 的例子团更大（3 个变量），separator 有 2 个变量，消息就从"2 个数"变成"$2\times2$ 的小表"——规则不变，求和时丢掉的是**不在 separator 里**的变量。`,
      T`回到 L22 的例子。**团的 potential 从哪来**（课件 p23 直接说"once we have the clique potentials"，没给分配方法；做法同 c55）：原模型的每个因子都放进一个包含它全部变量的团，同一团的因子相乘。L22 的 BN 例子：$\psi_1(x_1,x_2,x_3)=P(x_1)P(x_2\mid x_1)P(x_3\mid x_1)$，$\psi_2(x_2,x_3,x_4)=P(x_4\mid x_2)$，$\psi_3(x_3,x_4,x_5)=P(x_5\mid x_3,x_4)$。`,
      T`**团上的消息**（L22 p23–p25），课件例子 $c_1=\{x_1,x_2,x_3\}$—$c_2=\{x_2,x_3,x_4\}$—$c_3=\{x_3,x_4,x_5\}$，以 $c_2$ 为 root（根：任选的那个汇总点）：消息先全部朝它汇总（collect），再从它发回各团（distribute）。$c_3$ 是叶子、没有来信，所以先算它的 $m_{3\to2}$：`,
      { t: 'math', tex: T`m_{3\to2}(x_3,x_4)=\sum_{x_5}\psi_3(x_3,x_4,x_5),\quad m_{1\to2}(x_2,x_3)=\sum_{x_1}\psi_1(x_1,x_2,x_3),\qquad m_{2\to1}(x_2,x_3)=\sum_{x_4}\psi_2(x_2,x_3,x_4)\,m_{3\to2}(x_3,x_4)` },
      { t: 'math', tex: T`P(x_1,x_2,x_3)\propto\psi_1(x_1,x_2,x_3)\,m_{2\to1}(x_2,x_3),\qquad P(x_2,x_3,x_4)\propto\psi_2(x_2,x_3,x_4)\,m_{1\to2}(x_2,x_3)\,m_{3\to2}(x_3,x_4)` },
      T`注意 $c_1$ 的边缘用的是 $m_{2\to1}$：它要等 root $c_2$ 收齐来信（collect）之后才能反向发出（distribute），所以上面的边缘公式要两个阶段都做完才成立。`,
    ],
    why: [
      T`**T6 往年必考**：2026 practice Q5（8 分）"给 MRF 和消元顺序 $T,X,Z,U,W,V,Y$，写出 junction tree 的团"。方法完全机械，按本章步骤列表就能拿满分。完整真题见 [T6](#/T06)。`,
    ],
    intuition: [
      T`**为什么只留极大团？** 小团的变量都在某个大团里，它的因子可以直接并进大团的 potential，不需要单独一个节点。`,
      T`**为什么要最大权重生成树？** clique graph 可能有环；生成树去掉多余的边。选共享变量最多的边，才能满足 running intersection——共享的变量沿着树一路传下去，不会"断"。`,
      { t: 'story', title: 'Junction tree', md: 'Steffen Lauritzen 和 David Spiegelhalter 在 1988 年的论文里提出了在"团的树"上做局部计算的方法，用来解决医学专家系统里的概率推理（他们的例子是一个诊断呼吸困难的小网络，后来被称为 "Asia" 网络）。今天的 junction tree 算法就源于这篇论文。' },
    ],
    math: [
      { t: 'h3', text: '⑤ 归纳成步骤（考试 T6 照这个写）' },
      T`**流程**（L22 p4、p26）：如果给的是 BN，先 **moralize**（c55）变成无向图。然后：`,
      { t: 'steps', items: [
        T`**选一个消元顺序**（课件："critical to get this right!"，见 c59）。`,
        T`**图上消元**（L22 p6–p16）：按顺序取下一个变量，把它**当前**的邻居两两连上（没有边就加，叫 fill-in），记录团 = {这个变量} ∪ {它的邻居}，然后把它从图中删掉（连同它的边）。这一步**只动图，不算数**。`,
        T`**只保留极大团**（L22 p17）：去掉所有是别的团子集的团。`,
        T`**Clique graph**（L22 p18）：每个极大团一个节点，共享变量的两团之间连边，边权 = 共享变量个数（p20）。`,
        T`**Junction tree** = clique graph 的最大权重生成树：从权最大的边加起，会成环的跳过，加够「团数 − 1」条就停，同权谁先都行。每条边上写 separator = 两团交集。`,
        T`**在团上跑 belief propagation**（L22 p23–p25）：每个团有 potential，消息只依赖 separator 变量。`,
      ] },
    ],
    fx: [
      {
        title: '团上的消息（L22 p23–p24）', tex: T`m_{i\to j}(\htmlClass{fx-p1}{s_{ij}})=\htmlClass{fx-p2}{\sum_{c_i\setminus s_{ij}}}\htmlClass{fx-p3}{\psi_i(c_i)}\prod_{k\in N(i)\setminus j}m_{k\to i}(s_{ki})`,
        parts: [
          { label: 'separator', note: '$s_{ij}=c_i\\cap c_j$。消息只是 separator 变量的函数。' },
          { label: '求和', note: '把团 $c_i$ 里**不在** separator 里的变量求和掉。' },
          { label: 'ψ_i', note: '团自己的 potential，乘上来自其他**相邻**团（$N(i)$，不含 $j$）的消息。' },
        ],
      },
    ],
    example: [
      { t: 'graph', nodes: { A: [40, 40], B: [170, 40], C: [170, 150], D: [40, 150], E: [40, 250] }, edges: 'A-B B-C C-D D-A D-E', w: 220, caption: '下面分步练习第 2 题用的图：4-环 $A$—$B$—$C$—$D$—$A$，再加 $D$—$E$。' },
      { t: 'fade', title: '分步练习：消元 → junction tree', plan: ['按顺序消元：连邻居、记团、删节点', '划掉非极大团', '按共享变量数连边，取最大权重生成树', '标出 separator'], items: [
        { md: T`L22 例子（边 $12,13,24,34,35,45$，顺序 $1,2,3,4,5$）。`, steps: [
          { md: T`团 $\{1,2,3\},\{2,3,4\},\{3,4,5\},\{4,5\},\{5\}$（fill-in $2$—$3$）` }, { md: T`剩 $\{1,2,3\},\{2,3,4\},\{3,4,5\}$` }, { md: T`$c_1$—$c_2$—$c_3$（权 2、2）` }, { md: T`$\{2,3\}$、$\{3,4\}$` },
        ] },
        { md: T`新图：4-环 $A$—$B$—$C$—$D$—$A$，再加 $D$—$E$。顺序 $A,B,C,D,E$。`, steps: [
          { ask: T`消 $A$ 时要加几条 fill-in 边？`, answer: 1, show: T`$A$ 的邻居 $B,D$ 没有边 ⇒ 加 $B$—$D$；团 $\{A,B,D\}$`, sg: 1 },
          { ask: T`消掉 $A$ 后剩下的边是 $B$—$C$、$B$—$D$（刚加的）、$C$—$D$、$D$—$E$。消 $B$ 时记录的团有几个变量？`, answer: 3, show: T`$B$ 的邻居 $C,D$（$C$—$D$ 已有）⇒ 团 $\{B,C,D\}$`, sg: 1 },
          { ask: '极大团一共几个？', answer: 3, show: T`记录：$\{A,B,D\},\{B,C,D\},\{C,D\},\{D,E\},\{E\}$；划掉 $\{C,D\}\subset\{B,C,D\}$、$\{E\}$，剩 3 个`, sg: 2 },
          { ask: T`$\{A,B,D\}$ 与 $\{B,C,D\}$ 之间的 separator 有几个变量？`, answer: 2, show: T`$\{B,D\}$。$\{D,E\}$ 和另外两个团都只共享 $D$（权 1），接哪个都行：接到 $\{A,B,D\}$ 时，$\{D,E\}$ 与 $\{B,C,D\}$ 的共同变量 $D$ 也在中间的 $\{A,B,D\}$ 里；接到 $\{B,C,D\}$ 时同理——两种都满足 running intersection`, sg: 4 },
        ] },
      ] },
    ],
    viz: [
      { id: 'elim-stepper', opts: { preset: 'L22' }, how: '课件 L22 的例子（已 moralize）。每点一次"下一步"消掉一个变量：高亮当前变量，新加的 fill-in 边会单独标出，表格记录邻居和团；最后给出极大团和 junction tree（含 separator）。',
        try: '① 先遮住表格，自己写出每一步的团再核对。② 把顺序改成 `3, 1, 2, 4, 5`：第一步就要连 $x_1,x_4,x_5$ 三个邻居，团变大了——体会 c59 "顺序很重要"。' },
      { id: 'elim-stepper', opts: { preset: 'EX2026Q5' }, how: '2026 practice Q5 原题：7 个变量的 MRF，消元顺序 $T,X,Z,U,W,V,Y$。',
        try: '先在纸上按四步做完，再一步步核对。特别注意每一步的邻居要看**当前**图（包括之前加的 fill-in 边）。' },
    ],
    compare: [
      { t: 'table', head: ['', 'c56–c57（树）', 'junction tree（一般图）'], rows: [
        ['节点', '单个变量', '团（一组变量）'],
        ['消息的参数', '收件人变量', 'separator 变量'],
        ['边缘（都要归一化）', '$\\propto$ 来信之积', '$\\propto$ 团的 potential × 来信'],
        ['计算量', '和边数成正比', '和最大团的大小**指数**相关'],
      ] },
      { t: 'exam', md: T`**Building a junction tree:** (1) If the model is a Bayesian network, moralise it. (2) Simulate variable elimination in the given order: for each variable, connect all its current neighbours (adding fill-in edges where needed), record the clique formed by the variable and its neighbours, then remove the variable. (3) Keep only the maximal cliques (drop cliques that are subsets of others). (4) Build the clique graph, weighting each edge by the number of shared variables, and take a maximum-weight spanning tree; the intersections of adjacent cliques are the separators. The resulting tree satisfies the running intersection property, so belief propagation (collect then distribute) on the cliques gives exact marginals.` },
      { t: 'exam', md: T`**Belief propagation on a junction tree:** For adjacent cliques $C_i,C_j$ with separator $S_{ij}=C_i\cap C_j$, the message is $m_{i\to j}(x_{S_{ij}})=\sum_{x_{C_i\setminus S_{ij}}}\psi_i(x_{C_i})\prod_{k\in N(i)\setminus j}m_{k\to i}(x_{S_{ki}})$: multiply the clique potential by the messages from its other neighbours and sum out the variables not in the separator. After collecting towards a root and distributing back, each clique's marginal is proportional to its potential times all incoming messages, normalised.` },
    ],
    pitfalls: [
      ['看原图找邻居', '每一步要看**当前**图：之前加的 fill-in 边算数，已删的节点不算。'],
      ['把所有记录的团都放进 junction tree', '只留极大团（L22 p17）。'],
      ['只保留最大的一个团', '保留所有极大团（不被别的团包含的都留）。'],
      ['Clique graph 的所有边都留', '取最大权重生成树。'],
      ['先删节点再记录团', '先连邻居、记录团，再删节点。'],
    ],
    quiz: [
      { type: 'num', q: '当前图里要消的变量有 3 个邻居，它们之间已有 1 条边。要加几条 fill-in 边？', answer: 2, explain: '3 个邻居两两之间共 3 条，已有 1 条。' },
      { type: 'num', q: '同上，记录的团有几个变量？', answer: 4, explain: T`消元时记录的团 = 被消的变量自己 ∪ 它当前的所有邻居。上一题这个变量有 3 个邻居，加上它自己：$1+3=4$ 个变量。加完 fill-in（填补边）后，这 4 个点两两相连，正好构成一个团。陷阱：只数邻居答 3，漏了被消的变量本身。` },
      { type: 'mc', q: 'Junction tree 的 separator 是：', options: ['任意两团的交集', '相邻两团的交集', '最大的团', '被删掉的团'], answer: 1, explain: T`separator（分隔集）是 junction tree（联结树）里**相邻**两个团的交集，画在两团之间的连线上。例：L22 的树 $c_1=\{x_1,x_2,x_3\}$—$c_2=\{x_2,x_3,x_4\}$—$c_3=\{x_3,x_4,x_5\}$，separator 是 $\{x_2,x_3\}$ 和 $\{x_3,x_4\}$；团之间的消息只依赖 separator 里的变量。"任意两团的交集"不对：$c_1$ 和 $c_3$ 共享 $x_3$，但它们在树里不相邻、之间没有边，这个交集不是 separator。L22 p22。` },
      { type: 'show', q: '（英文）State the running intersection property and why it matters.', answer: T`If two cliques of the junction tree share a variable, that variable appears in every clique on the path between them. This guarantees that information about a shared variable can flow along the tree through separators, so the beliefs about that variable in different cliques are consistent after message passing.`, qzh: '陈述交集连通性质（running intersection property），并说明它为什么重要。', azh: '如果联结树（junction tree）中的两个团（clique）共享某个变量，那么这个变量出现在它们之间路径上的每一个团中。这保证了关于共享变量的信息能沿着树、经由分隔集（separator）传递，因此消息传递（message passing）之后，不同团中关于该变量的信念（belief）是一致的。' },
    ],
  });

  /* =====================================================================
   * c59 · 消元顺序（L22 p26–p33）
   * ===================================================================== */
  add({
    id: 'c59', week: 'W11', lec: 'L22', pages: 'L22 p26–p33', star: 3,
    keyEn: [
      T`The cost of exact inference is exponential in the largest clique size $k$ ($2^k$ table entries for binary variables), and the cliques are determined by the elimination order (triangulation).`,
      T`Eliminating a highly connected variable early joins all its neighbours into one large clique; eliminating peripheral variables first keeps the cliques small.`,
      T`Finding the optimal order is computationally hard; the greedy (myopic) heuristic eliminates, at each step, the variable that creates the smallest clique, with no optimality guarantee.`,
    ],
    keyZh: [
      T`精确推断的代价随最大团的大小 $k$ 指数增长（二元时团的表有 $2^k$ 个数），而团由消元顺序决定（每个顺序对应一种三角化 triangulation）。`,
      T`先消一个邻居很多的变量，会把它的所有邻居绑成一个大团，还要加一堆填补边（fill-in）；先消外围、邻居少的变量，团都保持很小。`,
      T`找最优消元顺序在计算上很难；实践中用贪心（myopic，短视）启发式：每一步消掉会产生最小团的变量，通常好用，但不保证最优。`,
    ],
    title: '消元顺序', en: 'Elimination order, clique size and inference cost',
    summary: '推断的计算量取决于**团的大小**：$k$ 个二元变量的团，它的 potential（打分表 / 势函数）有 $2^k$ 个数要算。而团的大小由**消元顺序**决定（每个顺序加完 fill-in 后得到的图叫一种 triangulation，三角化）。同一张图，先消外围的变量，团都很小；先消中心变量，第一个团就包含所有节点。**找最优顺序是计算上困难的**（L22 p27），实践中用**贪心（myopic）启发式**：每一步消掉"会产生最小团"的那个变量。',
    prereq: ['c58'],
    symbols: [
      [T`$k$`, T`团里的变量个数（团的大小）`],
      [T`$2^k$`, T`$k$ 个二元变量的取值组合数 = 这个团的 potential 表的大小`],
      [T`triangulation`, T`三角化：按某个消元顺序加完 fill-in 边后得到的图（里面任何长度 ≥4 的环都有弦——弦 = 连接环上两个不相邻节点的边）。每个消元顺序对应一种三角化，所以课件写"elimination order (triangulation)"把二者并提`],
      [T`$\binom nk$`, T`组合数：$n$ 个里选 $k$ 个的方法数。$\binom n2=\frac{n(n-1)}2$ = $n$ 个点两两之间的边数`],
    ],
    goals: [
      '解释为什么推断复杂度取决于团的大小，而团的大小取决于消元顺序（L22 p26）',
      '对比课件好 / 坏两个顺序的团（L22 p28–p32）',
      '说出找最优顺序很难，以及 myopic 启发式（L22 p26–p27）',
    ],
    types: ['T06'],
    what: [
      { t: 'h3', text: '① 问题：c58 的顺序是题目给的，换一个顺序会怎样？（L22 p26）' },
      T`c58 按"给定的顺序"消元找团。可顺序是谁定的？同一张图换一个顺序，找到的团会不一样——而团的大小直接决定推断有多贵：`,
      T`**复杂度**（L22 p26）：junction tree 上每条消息要对团里的变量求和——团有 $k$ 个二元变量，就要处理 $2^k$ 种组合。所以**最大团的大小**决定了推断有多贵。`,
      T`**顺序决定团**（L22 p26）：消一个变量时要把它当前的所有邻居连成团。如果它邻居很多，就会产生大团，并加很多 fill-in 边，让后面的团也跟着变大。`,
      { t: 'graph', nodes: { A: [50, 40], B: [210, 40], C: [210, 180], D: [50, 180] }, edges: 'A-B B-C C-D D-A B-D:fill', cls: { A: 'cur' }, w: 300, caption: T`消 $A$ 时它的邻居只有 $B$ 和 $D$，于是补一条 $B$—$D$ 的 fill-in（虚线）⇒ 原来的 4-环被切成两个三角形 $ABD$、$BCD$：这就叫三角化（triangulation）。` },
      T`加完所有 fill-in 后，图里任何长度 ≥4 的环都被弦（连接环上两个不相邻点的边）切成三角形。不同顺序加的弦不同 ⇒ 三角化不同 ⇒ 团不同。`,
      { t: 'h3', text: '② 课件的例子：同一张图，好顺序 vs 坏顺序（L22 p28–p32）' },
      T`**课件例子**（L22 p28–p32）：中心 $A$ 和 4 个三角形 $\{A,B,C\}$、$\{A,D,E\}$、$\{A,F,G\}$、$\{A,H,L\}$（边 $AB,AC,AD,AE,AF,AG,AH,AL,BC,DE,FG,HL$）。`,
      { t: 'graphs', r: 15, items: [
        g(STAR, { edges: STAR_EDGES, caption: '原图（L22 p28）：中心 $A$ + 4 个三角形' }),
        g(STAR, { edges: STAR_EDGES, cls: { B: 'cur' }, caption: '好顺序第一步：消 $B$（黄），邻居 $C,A$ 本来就相连 ⇒ 不加边，记下团 $\\{B,C,A\\}$，然后才把 $B$ 和它的两条边删掉' }),
        g(STAR, { edges: STAR_EDGES.replace('A-B ', '').replace(' B-C', '') + ' A-B:gone B-C:gone', cls: { B: 'done', C: 'cur' }, caption: '第二步：消 $C$，此时只剩邻居 $A$ ⇒ 团 $\\{C,A\\}$，也不加边' }),
        g(STAR, { edges: STAR_EDGES + ' ' + STAR_FILL, cls: { A: 'cur' }, caption: '坏顺序第一步：消 $A$，8 个邻居两两相连 ⇒ 加 24 条 fill-in（虚线），团 = 全部 9 个点' }),
      ] },
      { t: 'ul', items: [
        T`**好顺序** $B,C,D,E,F,G,H,L,A$：每个外围变量被消去时至多有 2 个当前邻居，而且有两个时它们本来就相连：$B,D,F,H$ 各有两个邻居（如 $B$ 的 $C,A$），随后 $C,E,G,L$ 各只剩 $A$ 一个邻居，所以不用加任何边。团 $\{B,C,A\},\{C,A\},\{D,E,A\},\{E,A\},\dots,\{A\}$（消元时每一步都要记录，之后再统一划掉被包含的），极大团是 4 个大小为 3 的三角形。`,
        T`**坏顺序** $A,B,C,\dots$：先消 $A$，它有 8 个邻居，要把它们两两连起来——8 个邻居两两共 $\binom82=28$ 条边，其中 $BC,DE,FG,HL$ 4 条本来就有，所以加 $28-4=24$ 条 fill-in 边，第一个团就是**全部 9 个节点**。之后所有团都是它的子集。`,
      ] },
      T`二元变量时：好顺序最大的表 $2^3=8$；坏顺序 $2^9=512$。图再大一点，差距就是"能算"和"算不动"的区别。`,
      { t: 'h3', text: '③ 那怎么挑顺序？（L22 p26–p27）' },
      T`上面的好顺序每一步消掉的都是**当前邻居最少**的变量：外围先走，中心留到最后。这就是 myopic（短视 / 贪心）启发式：每一步消掉「会产生最小团」的变量，通常效果不错，但不保证最优；真正的最优顺序在计算上很难找。`,
    ],
    why: [
      T`简答题："为什么消元顺序重要"、"怎么选顺序"。T6 计算题给定顺序，但理解顺序如何影响团能帮你检查答案是否合理（团突然很大，多半是看漏了 fill-in 或顺序本身就差）。`,
    ],
    intuition: [
      T`**为什么"短视"？** 它只看这一步的团多大，不管这一步加的 fill-in 边会不会让以后的团变大。有时候眼前稍大一点的团能换来后面更小的团，贪心看不到。`,
      { t: 'story', title: '为什么"难"', md: 'Mihalis Yannakakis 在 1981 年证明了"加最少的 fill-in 边"（minimum fill-in，最小填补）是 NP-complete 问题；1987 年 Arnborg、Corneil 和 Proskurowski 又证明"让最大团尽量小"（即求图的 treewidth，树宽）也是 NP-hard。所以课件说找最优消元顺序 "computationally hard"，实践中只能用启发式。' },
    ],
    math: [
      { t: 'h3', text: '课件好顺序的完整记录（L22 p29–p30）' },
      { t: 'table', cls: 'compact', head: ['消', '当前邻居', 'fill-in', '团'], rows: [
        ['$B$', '$C,A$', '无', '$\\{B,C,A\\}$'], ['$C$', '$A$', '无', '$\\{C,A\\}$'],
        ['$D$', '$E,A$', '无', '$\\{D,E,A\\}$'], ['$E$', '$A$', '无', '$\\{E,A\\}$'],
        ['$F$', '$G,A$', '无', '$\\{F,G,A\\}$'], ['$G$', '$A$', '无', '$\\{G,A\\}$'],
        ['$H$', '$L,A$', '无', '$\\{H,L,A\\}$'], ['$L$', '$A$', '无', '$\\{L,A\\}$'],
        ['$A$', '无', '无', '$\\{A\\}$'],
      ] },
      T`极大团：4 个三角形。Junction tree（联结树：把极大团当节点连成的那棵树）：4 个团两两只共享 $\{A\}$，所有边权都是 1，所以任何一棵生成树（3 条边把 4 个团连通、没有环）总权都是 3，都是最大权重生成树，比如都连到 $\{B,C,A\}$。相邻团的交集 separator（分隔集）都是 $\{A\}$。`,
    ],
    fx: [],
    example: [
      { t: 'graphs', r: 15, caption: '下面练习用到的两张图（不用翻回去）。', items: [
        g(STAR, { edges: STAR_EDGES, cls: { A: 'cur' }, caption: '题 1：课件 L22 的图——中心 $A$ 连着 4 个三角形，$A$ 有 8 个邻居，它们之间只有 $BC,DE,FG,HL$ 4 条边' }),
        { nodes: { A: [150, 120], B: [150, 25], C: [245, 90], D: [210, 210], E: [90, 210], F: [55, 90] }, edges: 'A-B A-C A-D A-E A-F', cls: { A: 'cur' }, w: 240, caption: '题 2–3 的星形图：中心 $A$ 连着 5 个叶子，叶子之间没有边。' },
      ] },
      { t: 'fade', title: '分步练习：比较消元顺序', plan: ['看要消的变量当前有几个邻居', '它们之间缺几条边（fill-in）', '团大小 = 邻居数 + 1；记录最大团'], items: [
        { md: T`L22 例子，坏顺序先消 $A$。`, steps: [
          { md: '8 个邻居' }, { md: T`8 个邻居两两共 $\binom82=28$ 条边，已有 $BC,DE,FG,HL$ 4 条，加 24 条` }, { md: '团大小 9' },
        ] },
        { md: T`星形图：中心 $A$，叶子 $B,C,D,E,F$。先消 $A$。`, steps: [
          { ask: '要加几条 fill-in 边？', answer: 10, show: T`$\binom52=10$，叶子之间原来没有边`, sg: 2 },
          { ask: '记录的团大小？', answer: 6, show: '5 个邻居 + $A$', sg: 3 },
        ] },
        { md: T`同一个星形图，按 myopic 启发式选第一个消的变量。`, steps: [
          { ask: '它产生的团大小是多少？', answer: 2, show: T`任何一个叶子（只有 1 个邻居 $A$）：团大小 2；消 $A$ 会是 6`, sg: 3 },
          { ask: '二元变量时，先消 $A$ 的那个团的表有多大？', answer: 64, show: T`$2^6$；先消叶子时最大的表只有 $2^2=4$`, sg: 3 },
        ] },
      ] },
    ],
    viz: [
      { id: 'elim-stepper', opts: { preset: 'L22star' }, how: '课件 L22 p28–p32 的图（中心 $A$ + 4 个三角形），默认是好顺序 $B,C,D,E,F,G,H,L,A$。',
        try: '① 先走一遍好顺序：没有任何 fill-in，极大团是 4 个三角形。② 把顺序改成 `A, B, C, D, E, F, G, H, L`：第一步就加了一大片 fill-in 边，团包含全部 9 个节点。③ 自己设计一个"中等"顺序，比如先消 $B,C$ 再消 $A$，看团多大。' },
    ],
    compare: [
      { t: 'table', head: ['', '好顺序（先消外围）', '坏顺序（先消中心）'], rows: [
        ['fill-in 边', '0', '24'],
        ['最大团', '3', '9'],
        ['二元时最大表', '$2^3=8$', '$2^9=512$'],
      ] },
      { t: 'exam', md: T`**Why does the elimination order matter?** The cost of exact inference (variable elimination or junction-tree belief propagation) is exponential in the size of the largest clique, and the cliques are determined by the elimination order: eliminating a variable connects all of its current neighbours, so eliminating a highly connected variable early creates a large clique and many fill-in edges (e.g. eliminating the hub first in L22 produces a clique of all 9 nodes, while eliminating the peripheral nodes first gives cliques of size 3). Finding the optimal order is computationally hard, so a greedy (myopic) heuristic is used: at each step eliminate the variable that produces the smallest clique.` },
    ],
    pitfalls: [
      ['任何顺序得到的团都一样', '团（和计算量）强烈依赖顺序。'],
      ['Myopic 启发式保证最优', '只是贪心，常常好用，但不保证。'],
      ['计算量和团大小成正比', '和团大小**指数**相关（二元时 $2^k$）。'],
    ],
    quiz: [
      { type: 'num', q: '一个团有 4 个三值变量（每个 3 种取值），它的 potential 表有多少格？', answer: 81, explain: T`potential（势函数）表给团里变量的每一种取值组合一格。每个变量 3 种取值，4 个变量的组合数是 $3\times3\times3\times3=3^4=81$。一般地，$k$ 个变量、每个 $d$ 种取值就是 $d^k$ 格（二元时 $2^k$），团每多一个变量，表就再乘一个 $d$——这就是推断代价随最大团大小指数增长的原因。陷阱：把底数和指数弄反，算成 $4^3=64$。` },
      { type: 'mc', q: 'Myopic 启发式每一步消掉：', options: ['编号最小的', '邻居最多的', '会产生最小团的', '随机一个'], answer: 2, explain: T`Myopic heuristic（短视 / 贪心启发式）只看眼前这一步：在还没消的变量里，挑"消掉它时记录的团最小"的那个（也就是当前邻居最少的）先消。这样每一步的团都尽量小，而推断代价随最大团大小指数增长。"邻居最多的"正好相反：先消中心节点会把一大圈邻居连成大团，L22 的例子里先消 $A$，团就是全部 9 个点。L22 p26。` },
      { type: 'mc', q: '找最优消元顺序：', options: ['有多项式时间的精确算法', '计算上困难，用启发式', '总是先消编号小的', '和推断复杂度无关'], answer: 1, explain: T`同一张图，不同的消元顺序得到大小不同的团，而推断代价取决于最大团的大小，所以想要"最大团最小"的顺序。课件说找这个最优顺序是 computationally hard（计算上困难）：没有已知的高效精确算法，实践中用启发式，比如 myopic：每一步消掉会产生最小团的变量，通常效果不错但不保证最优。"和推断复杂度无关"也不对：顺序决定团，团决定复杂度。L22 p27。` },
    ],
  });

  /* =====================================================================
   * r11 · W11 复习
   * ===================================================================== */
  SML.content.add(SML.review({
    id: 'r11', week: 'W11', title: 'W11 复习：图模型推断', en: 'Week 11 review',
    summary: '必拿分：**T6 消元 → junction tree 的团（8 分）**——按顺序：连当前邻居、记团、删节点；留极大团；最大权重生成树；separator。概念：消息的两条规则、两阶段 belief propagation、观测用 $\\delta$ 改因子、loopy BP 是近似、消元顺序决定团大小和复杂度（找最优很难，用 myopic 启发式）。',
    keypoints: [
      [T`消元：从叶子到查询节点一次消一个变量；$m_{i\to j}(x_j)=\sum_{x_i}\psi_{ij}(x_i,x_j)\prod_{k\in N(i)\setminus j}m_{k\to i}(x_i)$；$P(x_i)\propto\prod$ 来信，最后归一化。`, 'c56'],
      [T`观测：$\tilde\psi=\delta(x_i,\hat x_i)\psi$ 后照常算；BP：collect 到任意 root 再 distribute，$2(n-1)$ 条消息得到全部边缘；相邻两点 = 外来信 × 中间 potential；有环用 junction tree（精确）或 loopy BP（近似）。`, 'c57'],
      [T`Junction tree：moralize → 按顺序消元（连邻居、记团、删）→ 极大团 → 按共享变量数加权的最大权重生成树 → separator；running intersection；团上的消息只依赖 separator。`, 'c58'],
      [T`复杂度随最大团大小 $k$ 指数增长：二元变量约 $2^k$（每个变量 $d$ 个取值时 $d^k$）；顺序决定 $k$；先消外围好、先消中心差；最优顺序难找，myopic：每步消产生最小团的变量。`, 'c59'],
    ],
    map: [
      { t: 'graphs', r: 16, caption: '本周的两个课件例子。', items: [
        g(TREE, { edges: 'x1-x2=ψ₁₂ x2-x3=ψ₂₃ x2-x4=ψ₂₄ x4-x5=ψ₄₅', caption: 'L21 的 5 节点树（c56–c57）' }),
        g(L22, { edges: 'x1-x2 x1-x3 x2-x4 x3-x5 x4-x5 x3-x4:moral', caption: 'L22 的例子（moralize 后），消元后保留的极大团是 $\\{1,2,3\\},\\{2,3,4\\},\\{3,4,5\\}$（另外两个 $\\{4,5\\},\\{5\\}$ 被包含，划掉；c58）' }),
      ] },
      { t: 'table', head: ['图', '精确推断', '近似推断'], rows: [
        ['树', '消元（一个边缘）/ BP（全部边缘）', '—'],
        ['一般图', 'junction tree（团上的 BP）', 'loopy BP'],
      ] },
      T`W10–W11 合起来就是一条线：**建模**（BN / MRF，c53–c55）→ **读独立性**（D-separation，c54）→ **转无向图**（moralize，c55）→ **推断**（消元、BP、junction tree，c56–c59）。`,
    ],
    recall: [
      { q: '消息的计算规则？', a: T`$m_{i\to j}(x_j)=\sum_{x_i}\psi_{ij}(x_i,x_j)\prod_{k\in N(i)\setminus j}m_{k\to i}(x_i)$：其他来信 × 外出 potential，对发送者求和。`, ch: 'c56' },
      { q: '节点边缘怎么从消息得到？', a: '所有来信之积，再归一化。', ch: 'c56' },
      { q: '怎么加入观测？', a: T`把含观测变量的因子乘上 $\delta(x_i,\hat x_i)$（modified factor），然后照常消元。`, ch: 'c57' },
      { q: 'Belief propagation 的两个阶段？', a: '选任意 root；collect：叶子 → root；distribute：root → 叶子。之后每个节点有全部来信。', ch: 'c57' },
      { q: '相邻两点的联合边缘？', a: '两点各自的外来信 × 两点之间的 potential（不乘这条边上的两条消息）。', ch: 'c57' },
      { q: '有环的图怎么推断？', a: 'junction tree（精确）或 loopy BP（近似）。', ch: 'c57' },
      { q: '消元找团的一步怎么做？', a: '取下一个变量，把它当前的邻居两两连上（fill-in），记录团 = 它 + 邻居，再删掉它。', ch: 'c58' },
      { q: '从团到 junction tree？', a: '只留极大团；共享变量的团之间连边、权 = 共享个数；取最大权重生成树；相邻团交集 = separator。', ch: 'c58' },
      { q: 'Running intersection property？', a: '两个团共有的变量也出现在它们之间路径上的每个团里；保证信念一致。', ch: 'c58', qzh: '什么是交集连通性质（running intersection property）？' },
      { q: '为什么消元顺序重要？怎么选？', a: '复杂度随最大团大小指数增长，团由顺序决定；最优顺序难找；myopic：每步消产生最小团的变量。', ch: 'c59' },
    ],
    formulas: [
      ['$m_{i\\to j}(x_j)=\\sum_{x_i}\\psi_{ij}(x_i,x_j)\\prod_{k\\in N(i)\\setminus j}m_{k\\to i}(x_i)$', '消息（$N(i)$：$i$ 的邻居）', 'L21 p22'],
      ['$P(x_i)\\propto\\prod_{k\\in N(i)}m_{k\\to i}(x_i)$', '节点边缘', 'L21 p23、p34'],
      ['$P(x_2,x_4)\\propto m_{1\\to2}m_{3\\to2}\\psi_{24}m_{5\\to4}$', '相邻两点边缘', 'L21 p35'],
      ['$\\tilde\\psi_{12}=\\delta(x_1,\\hat x_1)\\psi_{12}$', '观测', 'L21 p25–p26'],
      ['$m_{1\\to2}(x_2,x_3)=\\sum_{x_1}\\psi_1(x_1,x_2,x_3)$', '团上的消息', 'L22 p23'],
    ],
    exam: [
      ['消元顺序 → junction tree 的团', '2026 practice Q5', '[T6](#/T06)'],
      ['消元步骤、消息形式（观测 = 取行，消元 = 矩阵乘向量）', '2021 Q18(b)', '[T6](#/T06)'],
      ['BP / junction tree / 顺序的概念', 'T13 题库', '[T13](#/T13)'],
    ],
    quiz: [
      { type: 'num', q: '链 $x_1$—$x_2$，$\\psi_{12}=\\begin{bmatrix}1&3\\\\2&2\\end{bmatrix}$（打分表：行 = $x_1$ 取 0/1，列 = $x_2$ 取 0/1）。$P(x_2=1)=?$', answer: 0.625, explain: '$m_{1\\to2}$ = $\\psi_{12}$ 的列和 $=(1+2,\\ 3+2)=(3,5)$，$5/8$。' },
      { type: 'num', q: '接上，观测 $x_1=0$，$P(x_2=1\\mid x_1=0)=?$', answer: 0.75, explain: '只剩第一行 $(1,3)$，$3/4$。' },
      { type: 'num', q: '树有 10 个节点，BP 一共几条消息？', answer: 18, explain: '$9\\times2$。' },
      { type: 'num', q: '消元时要消的变量有 4 个邻居、它们之间已有 2 条边。fill-in 几条？', answer: 4, explain: '$\\binom42-2=4$。' },
      { type: 'mc', q: '下面哪一步**不属于**构造 junction tree？', options: ['moralize', '按顺序消元记录团', '去掉非极大团', '对团按大小排序后连成链'], answer: 3, explain: '应该取 clique graph 的最大权重生成树。' },
      { type: 'show', q: '（英文）Why is loopy belief propagation only approximate?', answer: T`Belief propagation is exact on trees because removing a node separates the graph, so each message summarises an independent part of the graph. In a graph with cycles, information sent from a node can travel around a loop and come back to it, so evidence is counted more than once and the messages are no longer exact summaries; the fixed point (if it converges) only approximates the true marginals. Exact inference instead clusters the variables into a junction tree.`, qzh: '为什么环状信念传播（loopy belief propagation）只是近似的？', azh: '信念传播（belief propagation）在树上是精确的，因为删掉一个节点就会把图分开，所以每条消息概括的是图中一个独立的部分。在有环的图中，从一个节点发出的信息可以绕环一圈再回到它自己，于是证据被重复计算，消息不再是精确的概括；（如果收敛的话）不动点（fixed point）也只是近似真实的边缘分布（marginals）。精确推断则是把变量聚成一棵联结树（junction tree）。' },
    ],
    next: '下一周 [W12](#/c60) 把方向反过来：图和参数都不给，从数据里**学**出来（L23 学 Bayesian network，L24 学 MRF）。另外 Workshop 12 的 Q1、Q4 分别就是 2026 practice Q4、Q5 的原题（Q2、Q3 是同类练习），见 [T5](#/T05/ws12)、[T6](#/T06/ws12)。',
  }));
})(window);
