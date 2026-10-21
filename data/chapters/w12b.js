/* W12 (cont.) · L24 Learning Markov random fields — chapters c63–c64. */
(function (root) {
  'use strict';
  const SML = root.SML;
  const T = String.raw;
  const add = (c) => SML.content.add(SML.chapter(c));

  /* Figures (render.js graph blocks).
   * CHAIN = the 3-variable chain used for every hand computation in c63 (and reused in c64);
   * TREE10 = the L24 p10 tree; MW = the L24 p15–p19 four-node example; TOY = the c64 BIC example (A, B, C). */
  const sub = { x1: 'x₁', x2: 'x₂', x3: 'x₃', x4: 'x₄' };
  const g = (base, extra) => Object.assign({}, base, extra);
  const CHAIN = { nodes: { x1: [30, 40], x2: [160, 40], x3: [290, 40] }, labels: sub };
  const TREE10 = { nodes: { x1: [60, 30], x2: [60, 120], x3: [170, 120], x4: [60, 210] }, labels: sub };
  const MW = { nodes: { x1: [40, 40], x2: [200, 40], x3: [40, 190], x4: [260, 190] }, labels: sub };
  const TOY = { nodes: { A: [40, 40], B: [220, 40], C: [130, 170] } };

  /* The 8 samples of c63 (chain x1—x2—x3, binary). Counts: n12 = n23 = (3,1,1,3), n13 = (2,2,2,2). */
  const DATA8 = { t: 'table', cls: 'compact', caption: '自编的 8 条完整数据（$T=8$）：每行是一个样本，三个变量都观测到了。', head: ['样本 $t$', '$x_1$', '$x_2$', '$x_3$'], rows: [
    ['1', '0', '0', '0'], ['2', '0', '0', '0'], ['3', '0', '0', '1'], ['4', '0', '1', '1'],
    ['5', '1', '1', '1'], ['6', '1', '1', '1'], ['7', '1', '1', '0'], ['8', '1', '0', '0'],
  ] };

  /* =====================================================================
   * c63 · MRF 参数学习：moment matching（L24 p3–p12）
   * ===================================================================== */
  add({
    id: 'c63', week: 'W12', lec: 'L24', pages: 'L24 p3–p12', star: 1,
    keyEn: [
      T`Learning the parameters (or the structure) of an MRF requires inference even with complete observations, because the distribution is globally normalised: $Z(\theta)$ depends on every parameter.`,
      T`With the graph fixed, $l(D;\theta)=\sum_{(i,j)\in E}\sum_{x_i,x_j}\hat n(x_i,x_j)\,\theta_{ij}(x_i,x_j)-T\log Z(\theta)$; the pairwise counts $\hat n(x_i,x_j)$ are sufficient statistics, and $l$ is concave, so it has no local optima that are not global.`,
      T`Gradient: $\partial l/\partial\theta_{kl}(x'_k,x'_l)=\hat n(x'_k,x'_l)-T\,P(x'_k,x'_l;\theta)$, estimated counts from the data minus predicted counts from the model. At the optimum (not unique) they are equal: moment matching, achieved only for the edges included in the graph.`,
      T`Trees: the ML estimates are read off from local statistics, $P(\mathbf x)=\prod_i\hat P_i(x_i)\prod_{(i,j)\in E}\frac{\hat P_{ij}(x_i,x_j)}{\hat P_i(x_i)\hat P_j(x_j)}$ with $\hat P_{ij}=\hat n_{ij}/T$ and $\hat P_i=\hat n_i/T$.`,
    ],
    keyZh: [
      T`数据完整也要做推断：$Z(\theta)$ 把所有参数绑在一起，改一个参数，所有概率都会跟着变。`,
      T`对数似然只通过成对计数 $\hat n$ 用到数据（充分统计量）；它是凹函数，局部最优就是全局最优。`,
      T`梯度 = 数据里的计数 − 模型预测的计数；最优时两者相等，叫 moment matching，只对图里的边成立。`,
      T`树是例外：数出两两计数和单个计数，代入树的分解式就是 MLE，不用迭代，也不用推断。`,
    ],
    genesis: T`W10 学 BN 的参数很简单：数据完整时每张 CPT 各自数频率（c53，L23 的 c61 也是这样）。能这样做，是因为 BN 的每张 CPT 自己就归一化，似然按表拆开、互不干扰。MRF 的 potential 只是打分，概率要整体除以 $Z(\theta)$——而 $Z$ 里同时含有所有参数，改一条边的参数，所有概率都跟着变，"各数各的"行不通。L24 换一个思路：写出对数似然、求导，得到一个干净的条件——**调参数，直到模型预测的计数和数据里的计数一样**（moment matching）。要知道模型"预测"多少，就得做推断（W11），所以 MRF 学参数离不开推断；只有树例外，计数可以直接写出答案。`,
    title: 'MRF 参数学习：moment matching', en: 'Learning MRF parameters: maximum likelihood and moment matching',
    summary: '图已经定好、数据完整（每个样本的每个变量都观测到），怎么定 MRF 每条边的参数 $\\theta_{ij}(x_i,x_j)$？用最大似然（maximum likelihood）。写出来，对数似然只通过"每条边上每种取值组合出现了几次"（计数 $\\hat n$）用到数据；求导得到“数据计数 − 模型预测计数 = 0”，即 **moment matching（矩匹配）**。难点是"模型预测计数"要做推断，因为 $Z(\\theta)$ 牵连所有参数。树是例外：直接数频率代入就是答案（L24 p10–p12）。',
    prereq: ['c53', 'c55', 'c56'],
    symbols: [
      [T`$T$`, T`样本个数（第 $t$ 个样本 $x_t=(x_{t1},\dots,x_{tn})$）。c53 里写作数据行数 $m$`],
      [T`$n,\ E$`, T`变量个数；图的边集，$(i,j)\in E$ 表示 $x_i$—$x_j$ 有边`],
      [T`$\theta_{ij}(x_i,x_j)$`, T`边 $(i,j)$ 上、取值组合 $(x_i,x_j)$ 的实数参数（c55 房间例子的打分）；$\psi_{ij}=\exp(\theta_{ij})$`],
      [T`$Z(\theta)$`, T`partition function：所有取值组合的 $\prod\exp(\theta)$ 之和（c55）`],
      [T`$\hat n(x_i,x_j)$`, T`计数：数据里 $x_{ti}=x_i$ 且 $x_{tj}=x_j$ 的样本数；p11 写作 $\hat n_{ij}(x_i,x_j)$，就是 c53 的 $\#(\cdot)$`],
      [T`$\hat n_i(x_i)$`, T`单个变量的计数：$x_{ti}=x_i$ 的样本数`],
      [T`$x'_k,x'_l$`, T`撇号 = 某一个固定的取值（求导时盯住的那一格）`],
      [T`$P(x'_k,x'_l;\theta)$`, T`参数为 $\theta$ 时，模型给 "$x_k=x'_k$ 且 $x_l=x'_l$" 的概率（一个边缘概率，要靠推断算）`],
      [T`$\hat P_{ij},\ \hat P_i$`, T`经验概率（频率）：$\hat n_{ij}/T$、$\hat n_i/T$`],
      [T`$l(D;\theta)$`, T`数据 $D$ 在参数 $\theta$ 下的对数似然（log-likelihood）`],
    ],
    goals: [
      '说出为什么数据完整时，学 MRF 也需要做推断（L24 p4）',
      '把对数似然写成"计数 × 参数 − $T\\log Z$"，说出什么是充分统计量（sufficient statistics）（L24 p6）',
      '写出梯度"数据计数 − 模型预测计数"，解释 moment matching，以及为什么只匹配图里有的边（L24 p7–p9）',
      '树的特殊情况：用计数直接写出 MLE，并核对预测计数 = 数据计数（L24 p10–p12）',
    ],
    types: ['T07'],
    what: [
      { t: 'h3', text: '① 这一周在做什么：从数据学出图模型（L24 p3–p4）' },
      T`W10–W11 一直假设**模型已经给定**：图画好了，CPT 或 potential 的数也都有了，我们只做推断（求概率）。W12 反过来：手里只有数据，要把模型学出来。学习分两件事：`,
      { t: 'table', cls: 'compact', head: ['', 'Bayesian network（L23）', 'Markov random field（L24）'], rows: [
        ['① 参数学习：图固定，定参数', '每张 CPT 数频率（c53、[c61](#/c61)）', '**本章**：moment matching；树可以直接数'],
        ['② 结构学习：边该连哪些', 'BIC / Bayesian score + 启发式搜索，一般很难（[c62](#/c62)）', '[c64](#/c64)：只找树，用最大权生成树，又快又准'],
      ] },
      { t: 'h3', text: '② 数据和模型（L24 p4、p6）' },
      T`**数据**是一张表：每行一个样本，每列一个变量（p4 的表取值 1、2、3）。"complete observations（完整观测）"指每个样本的每个变量都有值，没有缺失。共 $T$ 个样本。`,
      T`**模型**是 c55 房间例子那种只有边因子的 MRF（pairwise MRF）：每条边 $(i,j)$ 给每种取值组合一个实数参数 $\theta_{ij}(x_i,x_j)$，取 $\exp$ 变成正的 potential，乘起来再除以 $Z(\theta)$：`,
      { t: 'math', tex: T`P(x_1,\dots,x_n;\theta)=\frac{1}{Z(\theta)}\prod_{(i,j)\in E}\exp\big(\theta_{ij}(x_i,x_j)\big),\qquad Z(\theta)=\sum_{x_1,\dots,x_n}\prod_{(i,j)\in E}\exp\big(\theta_{ij}(x_i,x_j)\big)` },
      T`图（边集 $E$）先当作已知，要学的是所有 $\theta_{ij}(x_i,x_j)$。二元变量时每条边有 4 个参数（$2\times2$ 种组合）。`,
      { t: 'h3', text: '③ 为什么不能像 BN 那样各数各的（L24 p4）' },
      T`BN 的每张 CPT 自己归一化（每列和为 1），所以似然可以按表拆开，每张表单独数频率。MRF 没有"自己归一化"的小表，只有最后整体除以 $Z(\theta)$——课件 p4 说它是 globally normalized（全局归一化）。后果是：改任何一个参数，$Z$ 就变，**所有**概率都跟着变。用一条链 $x_1$—$x_2$—$x_3$（0/1 变量）看一个最小的例子：`,
      g(CHAIN, { t: 'graph', edges: 'x1-x2=θ₁₂ x2-x3=θ₂₃', w: 340, caption: '链：两条边，各 4 个参数。' }),
      { t: 'steps', items: [
        T`所有 $\theta=0$（所有 $\psi=e^0=1$）：8 种取值组合的打分都是 1，$Z=8$，每种组合概率 $1/8$。$P(x_2=1,x_3=1)$ 包含 $(0,1,1)$ 和 $(1,1,1)$ 两种组合，$=2/8=1/4$。`,
        T`**只改边 (1,2) 的一个参数**：$\theta_{12}(1,1)=\ln3$，即 $\psi_{12}(1,1)=3$，其他不动。$x_1=x_2=1$ 的两种组合 $(1,1,0)$、$(1,1,1)$ 打分变成 3，其余 6 种仍是 1，$Z=6\times1+2\times3=12$。`,
        T`再看边 (2,3)：$P(x_2=1,x_3=1)$ = 组合 $(0,1,1)$ 的打分 1 加上组合 $(1,1,1)$ 的打分 3，再除以 $Z$：$\frac{1+3}{12}=\frac13$。边 (2,3) 的参数一个没动，它上面的概率却从 $1/4$ 变成了 $1/3$。`,
      ] },
      T`所以"数 $(x_2,x_3)$ 的频率来定 $\theta_{23}$"行不通：边 (2,3) 上的概率还取决于 $\theta_{12}$。所有参数只能**一起**定，而且要知道当前参数下模型给出的概率——这就是 p4 那句话：learning the parameters / structure of MRFs requires inference even when we have complete observations。`,
      { t: 'h3', text: '④ 写出对数似然：数据只通过计数出现（L24 p5–p6）' },
      T`方法还是最大似然（maximum likelihood）：选 $\theta$ 让观测到的数据最可能出现。对数似然是每个样本的 $\log P$ 之和。课件 p6 分三步化简：`,
      { t: 'math', tex: T`\begin{aligned}l(D;\theta)&=\sum_{t=1}^T\log P(x_{t1},\dots,x_{tn};\theta)\\&=\sum_{t=1}^T\Big[\sum_{(i,j)\in E}\theta_{ij}(x_{ti},x_{tj})-\log Z(\theta)\Big]\\&=\sum_{(i,j)\in E}\sum_{x_i,x_j}\hat n(x_i,x_j)\,\theta_{ij}(x_i,x_j)-T\log Z(\theta)\end{aligned}` },
      { t: 'steps', items: [
        T`第一行 → 第二行：$\log$ 把乘积变成和，$\log\exp(\theta)=\theta$，$\log\frac1Z=-\log Z$。`,
        T`第二行 → 第三行：把相同的项合并。样本 $t$ 在边 $(i,j)$ 上贡献 $\theta_{ij}(x_{ti},x_{tj})$；有 $\hat n(x_i,x_j)$ 个样本在这条边上取 $(x_i,x_j)$，这一项就出现 $\hat n(x_i,x_j)$ 次。$-\log Z$ 每个样本一份，共 $T$ 份。`,
      ] },
      T`**数据只通过计数 $\hat n(x_i,x_j)$ 进入似然**——只要每条边上每种组合的出现次数相同，两份数据给出完全一样的似然。所以这些计数叫 sufficient statistics（充分统计量）：知道它们，就不需要原始数据了。`,
      T`课件还说：这是参数的 concave（凹，"convex down"）函数，所以没有局部最优解。意思是：凹函数像一座只有一个山顶区域的山，任何"局部山顶"就是全局最高点，沿梯度往上爬一定能爬到最好。`,
      { t: 'h3', text: '⑤ 求导：数据计数 − 模型预测计数（L24 p7）' },
      T`盯住一个参数：边 $(k,l)$ 上取值组合 $(x'_k,x'_l)$ 的 $\theta_{kl}(x'_k,x'_l)$，对它求导：`,
      { t: 'math', tex: T`\frac{\partial l(D;\theta)}{\partial\theta_{kl}(x'_k,x'_l)}=\hat n(x'_k,x'_l)-T\cdot P(x'_k,x'_l;\theta)` },
      { t: 'steps', items: [
        T`第一部分 $\sum\sum\hat n\,\theta$ 是一堆"计数 × 参数"的和，只有一项含 $\theta_{kl}(x'_k,x'_l)$，求导剩下它的系数 $\hat n(x'_k,x'_l)$。`,
        T`第二部分 $-T\log Z(\theta)$：课件直接给出 $\frac{\partial\log Z}{\partial\theta_{kl}(x'_k,x'_l)}=P(x'_k,x'_l;\theta)$，乘上 $-T$。推导见下面的折叠框（补充）。`,
      ] },
      { t: 'deep', title: '补充推导：为什么 $\\partial\\log Z/\\partial\\theta=P$（课件没有推导，只用了结论）', hint: '想知道来历再点开', blocks: [
        T`记 $s(\mathbf x)=\sum_{(i,j)\in E}\theta_{ij}(x_i,x_j)$，则 $Z=\sum_{\mathbf x}e^{s(\mathbf x)}$。参数 $\theta_{kl}(x'_k,x'_l)$ 只出现在"$x_k=x'_k$ 且 $x_l=x'_l$"的那些组合的 $s(\mathbf x)$ 里（系数 1），其他组合与它无关。`,
        { t: 'math', tex: T`\frac{\partial Z}{\partial\theta_{kl}(x'_k,x'_l)}=\sum_{\mathbf x:\ x_k=x'_k,\ x_l=x'_l}e^{s(\mathbf x)},\qquad\frac{\partial\log Z}{\partial\theta_{kl}(x'_k,x'_l)}=\frac1Z\sum_{\mathbf x:\ x_k=x'_k,\ x_l=x'_l}e^{s(\mathbf x)}=P(x'_k,x'_l;\theta)` },
        T`最后一步：$e^{s(\mathbf x)}/Z$ 就是组合 $\mathbf x$ 的概率，把所有满足 $x_k=x'_k,x_l=x'_l$ 的组合加起来，就是这两个变量取这对值的边缘概率。`,
      ] },
      T`两项的含义（p7 的红框、蓝框）：$\hat n(x'_k,x'_l)$ 是数据里这种组合出现的次数——estimated counts from the data；$T\cdot P(x'_k,x'_l;\theta)$ 是"如果数据真由当前模型生成，$T$ 个样本里**预计**出现几次"——predicted counts from the model。`,
      { t: 'h3', text: '⑥ Moment matching（L24 p8–p9）' },
      T`最优处梯度为 0（p7），对每条边、每种取值组合都有：`,
      { t: 'math', tex: T`\underbrace{\hat n(x'_k,x'_l)}_{\text{数据里的计数}}=\underbrace{T\cdot P(x'_k,x'_l;\theta)}_{\text{模型预测的计数}}` },
      T`课件 p8：参数估计就是让**从数据算出的统计量和模型预测的统计量相等**——moment matching（矩匹配）。"moment（矩）"泛指频率、均值这类统计量；这里匹配的就是每条边上的成对计数。`,
      T`p9 补一句：The matching is achieved only for parameters (edges) included in the model (graph)。只有图里有边的那些变量对才有参数、才有这个方程；**没有边的变量对，模型的预测计数一般和数据对不上**（下面数值例子里 $x_1,x_3$ 就是这样）。`,
      T`p7 还注明最优参数 not unique（不唯一）。原因：把一条边的四个 $\theta$ 都加同一个常数 $c$，每个组合的分子都乘 $e^c$，$Z$ 也乘 $e^c$，概率一点不变。`,
      T`**怎么真的解出来？** 课件只给了这个条件。补充理解：自然的做法是梯度上升——每一步 $\theta_{kl}(x'_k,x'_l)\leftarrow\theta_{kl}(x'_k,x'_l)+\eta\,[\hat n(x'_k,x'_l)-T\,P(x'_k,x'_l;\theta)]$（$\eta>0$ 是步长，即 learning rate），模型预测少了就调高、多了就调低。每一步都要算 $P(x'_k,x'_l;\theta)$，这是一次推断（W11 的 c56–c58）。这就是 p4 说"学习需要推断"的具体原因。`,
      { t: 'h3', text: '⑦ 特殊情况：树（L24 p10–p12）' },
      T`p10：如果图是一棵**树**，参数可以直接从局部统计量（计数）读出来，MRF 也一样。先看课件的图：同一个形状，左边是 BN（有向树），右边是 MRF（无向树）。`,
      { t: 'graphs', r: 16, items: [
        g(TREE10, { edges: 'x1>x2 x2>x3 x2>x4', caption: 'BN：$P(x_1)P(x_2\\mid x_1)P(x_3\\mid x_2)P(x_4\\mid x_2)$' }),
        g(TREE10, { edges: 'x1-x2 x2-x3 x2-x4', caption: 'MRF：$\\psi_{12}(x_1,x_2)\\psi_{23}(x_2,x_3)\\psi_{24}(x_2,x_4)$' }),
      ] },
      T`把 BN 的条件概率写成"联合 ÷ 边缘"：$P(x_2\mid x_1)=\frac{P_{12}(x_1,x_2)}{P_1(x_1)}$，$P(x_3\mid x_2)=\frac{P_{23}}{P_2}$，$P(x_4\mid x_2)=\frac{P_{24}}{P_2}$。代进去：`,
      { t: 'math', tex: T`P(x_1)\frac{P_{12}}{P_1}\frac{P_{23}}{P_2}\frac{P_{24}}{P_2}=\big[P_1P_2P_3P_4\big]\cdot\frac{P_{12}}{P_1P_2}\cdot\frac{P_{23}}{P_2P_3}\cdot\frac{P_{24}}{P_2P_4}` },
      T`（右边展开约分：分子 $P_1P_2P_3P_4P_{12}P_{23}P_{24}$，分母 $P_1P_2\cdot P_2P_3\cdot P_2P_4$，约掉后剩 $\frac{P_{12}P_{23}P_{24}}{P_2P_2}$，和左边一样。）这正是 p12 的一般公式：任何树形分布都能**只用单变量边缘和相邻两点的边缘**写出来：`,
      { t: 'math', tex: T`P(x_1,\dots,x_n)=\Big[\prod_{i=1}^nP_i(x_i)\Big]\prod_{(i,j)\in E}\frac{P_{ij}(x_i,x_j)}{P_i(x_i)P_j(x_j)}` },
      T`右边每个因子只含一个或两个变量，正好可以分进 MRF 各条边的 potential（单变量的 $P_i$ 并进任意一条含 $x_i$ 的边），所以它也是那棵无向树上的 MRF，而且 $Z=1$。`,
      T`p11–p12：把计数变成频率 $\hat P_{ij}(x_i,x_j)=\frac{\hat n_{ij}(x_i,x_j)}{T}$、$\hat P_i(x_i)=\frac{\hat n_i(x_i)}{T}$，代进上式——These are valid maximum likelihood parameter estimates for the tree。为什么是 MLE？在这个写法下，模型给每条边 $(i,j)$ 的成对概率恰好就是 $\hat P_{ij}$，于是预测计数 $T\hat P_{ij}=\hat n_{ij}$，**梯度为 0**；对数似然是凹的，梯度为 0 的点就是最大值。不用迭代，也不用推断——这就是 p10 说的 read off directly from local statistics。`,
      T`p12 最后留了一个问题：$\mathbb E_{x_1,\dots,x_n\sim P}[\log P(x_1,\dots,x_n)]$ 长什么样？答案在 [c64](#/c64)：拟合好的树，对数似然等于"熵 + 互信息"，这是挑选树结构的依据。`,
    ],
    why: [
      T`**考试情况**：往年卷（2021、2025 practice、2026 practice）都没有出过 L24 的题——这是新内容，没有往年题可参考；按官方范围（lectures 全部内容）仍要会。最可能的考法是概念简答："为什么完整数据下学 MRF 还要推断"、"什么是 moment matching"、"树为什么能直接数"。树的 MLE 本质上和 BN 的 CPT 数数（[T7](#/T07)）是同一种手算。`,
      T`**在主线里的位置**：W12 的主线是"先学参数、再学结构"，BN（L23）和 MRF（L24）各走一遍。本章是 MRF 的"学参数"；它的树形特例直接通向 [c64](#/c64) 的结构学习——c64 先用本章的树 MLE 把每棵候选树拟合好，再比较哪棵树最好。`,
    ],
    intuition: [
      T`**像调恒温器。** 对每条边、每种取值组合各有一个旋钮 $\theta$。数据里 $(x_k,x_l)=(1,1)$ 出现 30 次，模型只预测 20 次——旋钮往上拧；预测 40 次——往下拧；预测正好 30 次——不动。所有旋钮都不动了，就是 MLE。`,
      T`**为什么旋钮互相牵连？** $Z$ 像一块总共只有 1 的"概率蛋糕"：调高某些组合的打分，它们分到的蛋糕变多，其他所有组合的份额都被压缩——包括别的边上的组合。所以拧一个旋钮，别的边的预测计数也变了，只能反复调（树除外）。`,
      T`**补充理解：和 logistic regression 是同一个模式。** c15 的梯度是 $\sum_i(y_i-\theta(\mathbf x_i))\mathbf x_i$：真实标签减模型预测。这里是数据计数减模型预测计数。"数据 − 模型预测"是这一类（exponential family，指数族）模型对数似然梯度的共同形状。`,
      { t: 'think', q: '链 $x_1$—$x_2$—$x_3$ 用 MLE 拟合后，模型对 $(x_1,x_3)$ 这一对的预测计数会等于数据里的计数吗？', a: T`不一定。$x_1$ 和 $x_3$ 之间没有边，没有参数 $\theta_{13}$，也就没有"$\hat n(x_1,x_3)=T\,P(x_1,x_3)$"这个方程（p9：只匹配图里的边）。下面的数值例子里，数据中 $(x_1,x_3)=(0,0)$ 出现 2 次，模型预测 2.5 次。` },
      { t: 'think', q: '为什么树可以直接写出答案，而有环的图不行？', a: T`树形分布能写成"单点边缘 × 相邻两点边缘 ÷ 单点边缘"的乘积（p12），把频率代进去，模型在每条边上的成对概率恰好等于频率，moment matching 一步就满足。有环的图没有这种写法：把频率直接拼起来，环上各条边的概率会互相"打架"，模型的成对边缘不再等于频率，只能迭代调参，每一步都要推断。` },
    ],
    math: [
      { t: 'h3', text: '归纳：参数学习的三个公式' },
      { t: 'steps', items: [
        T`模型（p4、p6）：$P(\mathbf x;\theta)=\frac1{Z(\theta)}\prod_{(i,j)\in E}\exp(\theta_{ij}(x_i,x_j))$。`,
        T`对数似然（p6）：$l(D;\theta)=\sum_{(i,j)\in E}\sum_{x_i,x_j}\hat n(x_i,x_j)\theta_{ij}(x_i,x_j)-T\log Z(\theta)$，凹函数。`,
        T`最优条件（p7–p9）：对每条边 $(k,l)\in E$、每种取值 $(x'_k,x'_l)$，$\hat n(x'_k,x'_l)=T\cdot P(x'_k,x'_l;\theta)$。`,
        T`树（p11–p12）：$\hat P_{ij}=\hat n_{ij}/T$，$\hat P_i=\hat n_i/T$，$P(\mathbf x)=\prod_i\hat P_i(x_i)\prod_{(i,j)\in E}\frac{\hat P_{ij}(x_i,x_j)}{\hat P_i(x_i)\hat P_j(x_j)}$。`,
      ] },
      T`**和 c53 的记号对照**：c53 写 $\hat P(x\mid u)=\#(X=x,pa=u)/\#(pa=u)$，这里的 $\hat n$ 就是 $\#$，$T$ 就是数据行数。树形 MRF 的 MLE 和 BN 的 CPT 数数是同一件事：把树的任一节点当根、把边定上方向，$\frac{\hat P_{ij}}{\hat P_i}$ 就是 CPT $\hat P(x_j\mid x_i)$。`,
    ],
    fx: [
      {
        title: '对数似然与充分统计量（L24 p6）', tex: T`l(D;\theta)=\sum_{(i,j)\in E}\sum_{x_i,x_j}\htmlClass{fx-p1}{\hat n(x_i,x_j)}\,\htmlClass{fx-p2}{\theta_{ij}(x_i,x_j)}-\htmlClass{fx-p3}{T\log Z(\theta)}`,
        parts: [
          { label: '计数', note: '数据里边 $(i,j)$ 取 $(x_i,x_j)$ 的样本数。数据只通过它进入似然——sufficient statistics。' },
          { label: '参数', note: '要学的东西：每条边、每种取值组合一个实数。' },
          { label: '归一化', note: '每个样本都要除以 $Z(\\theta)$，取 log 后是 $T$ 个 $\\log Z$。$Z$ 含所有参数，是参数互相牵连的根源。' },
        ],
      },
      {
        title: '梯度：数据计数 − 预测计数（L24 p7–p8）', tex: T`\frac{\partial l(D;\theta)}{\partial\theta_{kl}(x'_k,x'_l)}=\htmlClass{fx-p1}{\hat n(x'_k,x'_l)}-\htmlClass{fx-p2}{T\cdot P(x'_k,x'_l;\theta)}=0`,
        parts: [
          { label: 'estimated counts from the data', note: '数据里 $x_k=x\'_k$、$x_l=x\'_l$ 同时出现的次数，数一下就有。' },
          { label: 'predicted counts from the model', note: '当前参数下，$T$ 个样本里预计出现的次数。$P(x\'_k,x\'_l;\\theta)$ 是边缘概率，要做推断才能算。两者相等 = moment matching。' },
        ],
      },
      {
        title: '树的 MLE（L24 p11–p12）', tex: T`P(x_1,\dots,x_n)=\htmlClass{fx-p1}{\Big[\prod_{i=1}^n\hat P_i(x_i)\Big]}\prod_{(i,j)\in E}\htmlClass{fx-p2}{\frac{\hat P_{ij}(x_i,x_j)}{\hat P_i(x_i)\hat P_j(x_j)}},\qquad\htmlClass{fx-p3}{\hat P_{ij}=\frac{\hat n_{ij}}{T},\ \hat P_i=\frac{\hat n_i}{T}}`,
        parts: [
          { label: '单变量频率', note: '每个变量自己的分布，$n$ 个都乘上。' },
          { label: '每条边一个比值', note: '"一起出现的频率"除以"假如独立时的频率"：两变量越相关，这个比值离 1 越远。' },
          { label: '数出来的频率', note: '只要计数，不用迭代、不用推断。' },
        ],
      },
    ],
    example: [
      { t: 'h3', text: '完整算一遍：链 $x_1$—$x_2$—$x_3$，8 条数据' },
      T`图固定为链 $x_1$—$x_2$—$x_3$（边集 $E=\{(1,2),(2,3)\}$），变量取 0/1。数据（自编）：`,
      DATA8,
      { t: 'h4', text: '第 1 步：数充分统计量' },
      { t: 'table', cls: 'compact', head: ['计数', '(0,0)', '(0,1)', '(1,0)', '(1,1)', '哪些样本'], rows: [
        [T`$\hat n_{12}(x_1,x_2)$`, '3', '1', '1', '3', '(0,0)：1,2,3；(0,1)：4；(1,0)：8；(1,1)：5,6,7'],
        [T`$\hat n_{23}(x_2,x_3)$`, '3', '1', '1', '3', '(0,0)：1,2,8；(0,1)：3；(1,0)：7；(1,1)：4,5,6'],
        [T`$\hat n_{13}(x_1,x_3)$（不是边）`, '2', '2', '2', '2', '(0,0)：1,2；(0,1)：3,4；(1,0)：7,8；(1,1)：5,6'],
      ] },
      T`单个变量：$x_1,x_2,x_3$ 各有 4 个 0、4 个 1（$\hat n_i(0)=\hat n_i(1)=4$）。例如 $x_2=0$ 的是样本 1,2,3,8。`,
      { t: 'h4', text: '第 2 步：从 $\\theta=0$ 出发，看梯度往哪推' },
      T`所有 $\theta=0$ 时模型是均匀的：8 种组合各 $1/8$，任一条边上每种组合的概率是 $2/8=1/4$，预测计数 $T\cdot\frac14=8\times\frac14=2$。梯度 = 数据计数 − 预测计数：`,
      { t: 'table', cls: 'compact', head: ['边 (1,2) 的组合', '(0,0)', '(0,1)', '(1,0)', '(1,1)'], rows: [
        ['数据计数 $\\hat n$', '3', '1', '1', '3'],
        ['预测计数 $T\\cdot P$', '2', '2', '2', '2'],
        ['梯度', '$3-2=+1$', '$1-2=-1$', '$1-2=-1$', '$3-2=+1$'],
      ] },
      T`意思：模型低估了"$x_1,x_2$ 相同"（数据 3 次，模型只预测 2 次），所以 $\theta_{12}(0,0)$、$\theta_{12}(1,1)$ 要调高，另外两个调低。边 (2,3) 的计数一样，梯度也一样。一般的图要这样一步步迭代；**这是树**，可以直接写出答案。`,
      { t: 'h4', text: '第 3 步：树的 MLE——直接代频率' },
      T`$\hat P_{12}=(\frac38,\frac18,\frac18,\frac38)$，$\hat P_{23}$ 相同，$\hat P_2=(\frac12,\frac12)$。链的 p12 公式约分后是 $P(\mathbf x)=\hat P_1\hat P_2\hat P_3\cdot\frac{\hat P_{12}}{\hat P_1\hat P_2}\cdot\frac{\hat P_{23}}{\hat P_2\hat P_3}=\frac{\hat P_{12}(x_1,x_2)\,\hat P_{23}(x_2,x_3)}{\hat P_2(x_2)}$。逐个算 8 种组合：`,
      { t: 'table', cls: 'compact', head: ['$(x_1,x_2,x_3)$', '$\\hat P_{12}\\times\\hat P_{23}\\div\\hat P_2$', '$P(\\mathbf x)$'], rows: [
        ['(0,0,0)', T`$\frac38\times\frac38\div\frac12$`, T`$\frac{9}{32}$`],
        ['(0,0,1)', T`$\frac38\times\frac18\div\frac12$`, T`$\frac{3}{32}$`],
        ['(0,1,0)', T`$\frac18\times\frac18\div\frac12$`, T`$\frac{1}{32}$`],
        ['(0,1,1)', T`$\frac18\times\frac38\div\frac12$`, T`$\frac{3}{32}$`],
        ['(1,0,0)', T`$\frac18\times\frac38\div\frac12$`, T`$\frac{3}{32}$`],
        ['(1,0,1)', T`$\frac18\times\frac18\div\frac12$`, T`$\frac{1}{32}$`],
        ['(1,1,0)', T`$\frac38\times\frac18\div\frac12$`, T`$\frac{3}{32}$`],
        ['(1,1,1)', T`$\frac38\times\frac38\div\frac12$`, T`$\frac{9}{32}$`],
      ] },
      T`自检：$9+3+1+3+3+1+3+9=32$，总和 $\frac{32}{32}=1$，不用再除 $Z$。（例：$(0,0,0)$：$\frac38\times\frac38=\frac{9}{64}$，除以 $\frac12$ 即乘 2，得 $\frac{18}{64}=\frac{9}{32}$。）`,
      { t: 'h4', text: '第 4 步：核对 moment matching' },
      { t: 'table', cls: 'compact', head: ['变量对', '组合', '模型概率（把对应组合加起来）', '预测计数 $8\\times P$', '数据计数'], rows: [
        ['(1,2) 有边', '(0,0)', T`$P(0,0,0)+P(0,0,1)=\frac{9+3}{32}=\frac{12}{32}$`, '3', '3 ✓'],
        ['(1,2) 有边', '(0,1)', T`$\frac{1+3}{32}=\frac{4}{32}$`, '1', '1 ✓'],
        ['(1,2) 有边', '(1,0)', T`$\frac{3+1}{32}=\frac{4}{32}$`, '1', '1 ✓'],
        ['(1,2) 有边', '(1,1)', T`$\frac{3+9}{32}=\frac{12}{32}$`, '3', '3 ✓'],
        ['(2,3) 有边', '(0,0)', T`$P(0,0,0)+P(1,0,0)=\frac{9+3}{32}$`, '3', '3 ✓'],
        ['(2,3) 有边', '(1,1)', T`$P(0,1,1)+P(1,1,1)=\frac{3+9}{32}$`, '3', '3 ✓'],
        ['(1,3) 无边', '(0,0)', T`$P(0,0,0)+P(0,1,0)=\frac{9+1}{32}=\frac{10}{32}$`, '2.5', '2 ✗'],
        ['(1,3) 无边', '(0,1)', T`$P(0,0,1)+P(0,1,1)=\frac{3+3}{32}=\frac{6}{32}$`, '1.5', '2 ✗'],
      ] },
      T`（(2,3) 的 (0,1)、(1,0) 两格同理都是 $\frac{4}{32}\to1$ ✓；(1,3) 的 (1,0)、(1,1) 分别是 1.5、2.5，也对不上 2。）两条边上全部匹配，梯度为 0，这就是 MLE；没有边的 $(x_1,x_3)$ 不匹配——正是 p9 说的 only for parameters (edges) included in the model。`,
      { t: 'h4', text: '第 5 步：写成 $\\theta$，看"不唯一"' },
      T`一种取法：$\psi_{12}=\hat P_{12}$，$\psi_{23}=\hat P_{23}/\hat P_2=\hat P(x_3\mid x_2)=(\frac34,\frac14,\frac14,\frac34)$，此时 $Z=1$。取 log：$\theta_{12}(0,0)=\ln\frac38\approx-0.981$，$\theta_{12}(0,1)=\ln\frac18\approx-2.079$；$\theta_{23}(0,0)=\ln\frac34\approx-0.288$，$\theta_{23}(0,1)=\ln\frac14\approx-1.386$（另两格对称）。把 $\theta_{12}$ 四格都加 $\ln2$（即 $\psi_{12}$ 全乘 2）：每个组合的打分翻倍，$Z$ 变成 2，概率完全不变——参数不唯一（p7）。`,
      { t: 'h4', text: '第 6 步：似然真的变大了吗' },
      T`拟合后的对数似然：样本 1,2 是 $(0,0,0)$，5,6 是 $(1,1,1)$，概率都是 $\frac{9}{32}$；样本 3,4,7,8 的概率都是 $\frac{3}{32}$。所以 $l=4\ln\frac{9}{32}+4\ln\frac{3}{32}=4\times(-1.2685)+4\times(-2.3671)=-5.0740-9.4685=-14.5425$。均匀模型（$\theta=0$）：$8\ln\frac18=8\times(-2.0794)=-16.6355$。$-14.54>-16.64$ ✓。这个 $-14.54$ 在 c64 里还会用"熵 + 互信息"的公式再算一次。`,
      { t: 'fade', title: '分步练习：树形 MRF 的 MLE', plan: ['数成对计数和单个计数', '代入 $P=\\hat P_{12}\\hat P_{23}/\\hat P_2$', '核对边上的预测计数 = 数据计数'], items: [
        { md: T`本章的 8 条数据，求拟合后的 $P(x_1=0,x_2=0,x_3=0)$，并核对一个格子。`, steps: [
          { md: T`$\hat P_{12}(0,0)=\frac38$，$\hat P_{23}(0,0)=\frac38$，$\hat P_2(0)=\frac48=\frac12$` },
          { md: T`$P(0,0,0)=\frac38\times\frac38\div\frac12=\frac{9}{32}$` },
          { md: T`边 (1,2) 的 (0,0) 格：$8\times[P(0,0,0)+P(0,0,1)]=8\times\frac{9+3}{32}=3=\hat n_{12}(0,0)$ ✓` },
        ] },
        { label: '独立：全部你来', md: T`链 $A$—$B$—$C$，$T=10$。数据里：$\hat n_{AB}(1,1)=4$，$\hat n_{BC}(1,1)=3$，$\hat n_B(1)=5$。`, steps: [
          { ask: T`$\hat P_{AB}(1,1)=?$`, answer: 0.4, show: T`$4/10=0.4$`, sg: 1 },
          { ask: T`树的 MLE 下 $P(A=1,B=1,C=1)=?$`, answer: 0.24, tol: 0.002, show: T`$\hat P_{AB}(1,1)\,\hat P_{BC}(1,1)/\hat P_B(1)=0.4\times0.3/0.5=0.24$`, sg: 2 },
        ] },
      ] },
    ],
    compare: [
      { t: 'table', head: ['', 'BN（c53、c61）', '一般 MRF', '树形 MRF'], rows: [
        ['归一化', '每张 CPT 自己归一化（局部）', '整体除以 $Z(\\theta)$（全局）', '写成边缘之比，$Z=1$'],
        ['似然能否按因子拆开', '能：每张表单独最大化', '不能：$\\log Z$ 含全部参数', '能（结果就是频率）'],
        ['MLE 怎么得到', '数频率，闭式解', 'moment matching：迭代求解', '数频率，闭式解'],
        ['要不要推断', '不要', '要：每步都要 $P(x_k,x_l;\\theta)$', '不要'],
        ['最优参数唯一吗', '唯一（前提：每种父配置都在数据里出现过；出现 0 次的那一列怎么填都行）', '不唯一（可整体平移）', '不唯一（取频率是其中一组）'],
      ] },
      { t: 'exam', md: T`**Why does maximum-likelihood learning of an MRF require inference even with complete data, and what is moment matching?** The MRF $P(\mathbf x;\theta)=\frac1{Z(\theta)}\prod_{(i,j)\in E}\exp(\theta_{ij}(x_i,x_j))$ is globally normalised: $Z(\theta)$ sums over all joint assignments and depends on every parameter, so the likelihood does not decompose into separate local problems. The log-likelihood $l(D;\theta)=\sum_{(i,j)\in E}\sum_{x_i,x_j}\hat n(x_i,x_j)\theta_{ij}(x_i,x_j)-T\log Z(\theta)$ is concave, with gradient $\hat n(x'_k,x'_l)-T\,P(x'_k,x'_l;\theta)$: the counts in the data minus the counts predicted by the model. Setting it to zero means the model's pairwise marginals must match the empirical ones for every edge in the graph (moment matching). Evaluating $P(x'_k,x'_l;\theta)$ requires inference at every step. For tree-structured models the ML estimates are read off directly: $P(\mathbf x)=\prod_i\hat P_i(x_i)\prod_{(i,j)\in E}\hat P_{ij}(x_i,x_j)/(\hat P_i(x_i)\hat P_j(x_j))$.` },
    ],
    pitfalls: [
      ['MRF 也能像 BN 一样，每个 potential 各数各的频率', '一般图不行：$Z(\\theta)$ 把所有参数绑在一起，改一条边会影响所有概率。只有树能直接数。'],
      ['数据完整就不需要推断', 'MRF 的梯度里有模型边缘 $P(x\'_k,x\'_l;\\theta)$，每一步都要推断（L24 p4）。'],
      ['moment matching 让模型匹配所有变量对的计数', '只匹配图里有边的对（p9）；没有边的对一般对不上。'],
      ['凹函数有很多局部最优，要多试几个起点', '凹函数的局部最优就是全局最优（p6）；只是最优参数不唯一（p7）。'],
      ['参数不唯一，所以学到的模型是随机的', '不唯一的只是 $\\theta$ 的写法（例如整体平移），对应的概率分布一样。'],
      ['$\\hat P_{ij}/(\\hat P_i\\hat P_j)$ 是条件概率', '它是"联合 ÷ 两个边缘之积"；条件概率是 $\\hat P_{ij}/\\hat P_i$。'],
    ],
    quiz: [
      { type: 'mc', q: '数据完整（没有缺失值）时，为什么学 MRF 的参数仍然需要推断？', options: ['$Z(\\theta)$ 依赖所有参数，梯度里要用模型的边缘概率 $P(x\'_k,x\'_l;\\theta)$', '因为数据有隐变量', '因为 potential 必须是概率', '因为 MRF 没有充分统计量'], answer: 0,
        explain: T`MRF 是 globally normalized（全局归一化）：$P=\frac1{Z(\theta)}\prod\exp(\theta)$，而 $Z(\theta)$ 对所有取值组合求和，含有每一个参数。对数似然的梯度是 $\hat n(x'_k,x'_l)-T\,P(x'_k,x'_l;\theta)$，其中模型的边缘概率只能通过推断算出（L24 p4、p7）。"隐变量"不对：题目说数据完整。"potential 必须是概率"不对：potential 只是正的打分。MRF 当然有充分统计量——就是成对计数 $\hat n$。` },
      { type: 'num', q: '边 $(k,l)$，$T=50$。数据里 $(x_k,x_l)=(1,1)$ 出现 $\\hat n(1,1)=20$ 次；当前参数下模型给 $P(x_k=1,x_l=1;\\theta)=0.3$。对数似然对 $\\theta_{kl}(1,1)$ 的梯度是多少？', answer: 5,
        explain: T`梯度 = 数据计数 − 模型预测计数 $=\hat n(1,1)-T\cdot P(1,1;\theta)=20-50\times0.3=20-15=5$。正数：模型低估了这种组合（预测 15 次，实际 20 次），所以梯度上升会把 $\theta_{kl}(1,1)$ 调高。陷阱：忘了乘 $T$，算成 $20-0.3$。` },
      { type: 'num', q: '树 $A$—$B$—$C$，$T=20$。计数 $\\hat n_{AB}(0,0)=6$，$\\hat n_{BC}(0,1)=4$，$\\hat n_B(0)=8$。树的 MLE 下 $P(A=0,B=0,C=1)=?$', answer: 0.15, tol: 0.002,
        explain: T`链的 MLE：$P(a,b,c)=\hat P_{AB}(a,b)\,\hat P_{BC}(b,c)/\hat P_B(b)$（p12 公式约分后的样子）。频率：$\hat P_{AB}(0,0)=6/20=0.3$，$\hat P_{BC}(0,1)=4/20=0.2$，$\hat P_B(0)=8/20=0.4$。代入：$0.3\times0.2/0.4=0.06/0.4=0.15$。也可以读成 BN 的写法 $\hat P(A=0,B=0)\,\hat P(C=1\mid B=0)=0.3\times\frac48=0.15$。` },
      { type: 'mc', q: '链 $x_1$—$x_2$—$x_3$ 用 MLE 拟合后，下面哪个**不一定**成立？', options: ['模型对 $(x_1,x_2)$ 每种组合的预测计数 = 数据计数', '模型对 $(x_2,x_3)$ 每种组合的预测计数 = 数据计数', '模型对 $(x_1,x_3)$ 每种组合的预测计数 = 数据计数', '对数似然的梯度为 0'], answer: 2,
        explain: T`moment matching 只对图里有边的变量对成立（L24 p9）：$(1,2)$、$(2,3)$ 有边、有参数，最优处梯度为 0 正是这两条边上"预测 = 数据"。$x_1$ 和 $x_3$ 之间没有边，没有对应的方程。本章例子里数据中 $(x_1,x_3)=(0,0)$ 出现 2 次，模型预测 $8\times\frac{10}{32}=2.5$ 次。` },
      { type: 'mc', q: 'L24 p6 说对数似然是参数的 concave 函数。由此可以得出：', options: ['任何局部最大值都是全局最大值', '最优参数唯一', '可以直接写出闭式解', '不需要推断'], answer: 0,
        explain: T`凹函数（concave，"convex down"）的局部最大值就是全局最大值，所以课件说 no locally optimal solutions（没有"卡住"的局部最优），梯度上升一定能到达最优。但凹不等于严格凹：p7 明说最优参数 not unique（例如一条边的四个 $\theta$ 同加一个常数，分布不变）。凹也不意味着有闭式解，梯度里的 $P(x'_k,x'_l;\theta)$ 仍要推断。` },
      { type: 'show', q: '（英文）Explain moment matching for MRF parameter estimation.', answer: T`With the graph fixed, the log-likelihood is $\sum_{(i,j)\in E}\sum_{x_i,x_j}\hat n(x_i,x_j)\theta_{ij}(x_i,x_j)-T\log Z(\theta)$. Its derivative with respect to $\theta_{kl}(x'_k,x'_l)$ is $\hat n(x'_k,x'_l)-T\,P(x'_k,x'_l;\theta)$, the count estimated from the data minus the count predicted by the model. At the maximum-likelihood solution the gradient is zero, so for every edge in the graph and every pair of values the model's predicted counts equal the empirical counts: the parameters are chosen to match the statistics (moments) of the data. The matching holds only for edges included in the graph, and computing the model's marginals requires inference.`, qzh: '解释 MRF 参数估计中的 moment matching（矩匹配）。', azh: T`图固定时，对数似然是 $\sum_{(i,j)\in E}\sum_{x_i,x_j}\hat n(x_i,x_j)\theta_{ij}(x_i,x_j)-T\log Z(\theta)$。它对 $\theta_{kl}(x'_k,x'_l)$ 的导数是 $\hat n(x'_k,x'_l)-T\,P(x'_k,x'_l;\theta)$，即数据里的计数减去模型预测的计数。最大似然解处梯度为 0，所以对图中每条边、每对取值，模型预测的计数都等于数据里的计数：参数被选成让模型匹配数据的统计量（矩）。这种匹配只对图里有的边成立，而计算模型的边缘概率需要推断。` },
    ],
  });

  /* =====================================================================
   * c64 · MRF 结构学习：最大权生成树（L24 p13–p23）
   * ===================================================================== */
  const MW_ALL = 'x1-x2=1.5 x2-x4=0.9 x3-x4=1 x1-x3=3 x1-x4=0.7 x2-x3=2';
  add({
    id: 'c64', week: 'W12', lec: 'L24', pages: 'L24 p13–p23', star: 1,
    keyEn: [
      T`For a tree with its ML parameters, $l(D;\hat\theta)=T\big[-\sum_{i=1}^n\hat H(X_i)+\sum_{(i,j)\in E}\hat I(X_i;X_j)\big]$; the sum of entropies is the same for all trees, so the best-scoring tree includes edges with high (empirical) mutual information.`,
      T`Maximum weighted spanning tree: start with an empty tree and iteratively add the candidate edge with the maximum weight if it does not create a cycle, until $n-1$ edges have been added.`,
      T`The log-likelihood does not suffice as a selection criterion ($\hat I\ge0$, so it always fills a spanning tree); the BIC score of an edge is $T\hat I(X_i;X_j)-\frac{r_ir_j-r_i-r_j+1}{2}\log T$.`,
      T`The highest-scoring tree (forest) is found by a maximum weighted spanning tree algorithm over the edges with positive BIC scores; only the empirical $\hat P_{ij}$ and $\hat P_i$ for all pairs are needed.`,
      T`The same algorithm builds the junction tree (c58), but there the edge weights are the numbers of variables shared by two cliques; here they are mutual information (or BIC scores) between two variables.`,
    ],
    keyZh: [
      T`树的对数似然 = 熵项（所有树都一样）+ 各条边互信息之和，所以要选互信息总和最大的树。`,
      T`最大权生成树：从空树开始，每次加剩下权重最大的边，会成环就跳过，加满 $n-1$ 条为止。`,
      T`只看似然不够：互信息总是 ≥0，加边从不吃亏，总会连满一整棵树；BIC 给每条边扣一个罚分。`,
      T`只在 BIC 为正的边上跑最大权生成树，结果可能是森林；整个过程只需要两两计数。`,
      T`junction tree 也用最大权生成树，但权重是两团共享的变量个数；这里是两个变量的互信息或 BIC。`,
    ],
    genesis: T`c63 解决了"图已知、学参数"。可图本身往往也不知道：哪些变量之间该连边？L23 学 BN 结构时（[c62](#/c62)），要在所有可能的图里找得分最高的，这是 NP-hard 问题，只能用启发式搜索，还不保证找到最好的。L24 换一个思路：**只在树里找**。树的好处是 c63 已经给出了闭式的 MLE，代进去后对数似然拆成"所有树都一样的常数 + 每条边一个互信息"——比较树就是比较边上互信息的总和。于是"找最好的树"变成图论里的老问题：最大权生成树，从大到小贪心加边就能精确找到。最后再用 BIC 罚掉没用的弱边。`,
    title: 'MRF 结构学习：互信息与最大权生成树', en: 'Learning the structure of tree MRFs: mutual information, maximum weighted spanning tree and BIC',
    summary: '要从数据学出**哪些边**该连，L24 只在树里找。把 c63 的树 MLE 代进对数似然：$l=T[-\\sum_i\\hat H(X_i)+\\sum_{(i,j)\\in E}\\hat I(X_i;X_j)]$，熵那一项对所有树都一样，所以**最好的树 = 边上互信息（mutual information）总和最大的树**。找它用最大权生成树（maximum weighted spanning tree）：从空树开始，每次加权重最大、且不成环的边。只看似然会把所有边都连上（互信息 ≥ 0），所以改用 BIC：每条边扣罚分，只在 BIC 为正的边上跑，结果可能是森林（forest）。',
    prereq: ['c63', 'c58', 'c62'],
    symbols: [
      [T`$\hat H(X_i)$`, T`变量 $x_i$ 的经验熵（entropy）：它有多"不确定"；$x_i\in\{1,\dots,r_i\}$`],
      [T`$\hat I(X_i;X_j)$`, T`$x_i$ 和 $x_j$ 的经验互信息（mutual information）：知道一个，对另一个少了多少不确定；$\ge0$，独立时为 0`],
      [T`$r_i$`, T`变量 $x_i$ 的取值个数（二元变量 $r_i=2$）`],
      [T`$T$`, T`样本个数；$\log T$ 出现在 BIC 罚分里`],
      [T`$\log$`, T`课件没写底数；本章数值一律用自然对数 $\ln$（只要熵、互信息、$\log T$ 用同一个底，结论不变）`],
      [T`$E$`, T`树的边集；$n$ 个变量的树恰好 $n-1$ 条边`],
      [T`MWST`, T`maximum weighted spanning tree，最大权（重）生成树：连通所有节点、没有环、边权之和最大`],
      [T`forest`, T`森林：没有环、但不一定连通的图（几棵树放在一起）`],
      [T`$BIC(D;\hat\theta)$`, T`Bayesian information criterion：对数似然减去"参数个数 $/2\times\log T$"（L23，[c61](#/c61)）`],
    ],
    goals: [
      '解释为什么比较不同的树只需要看边上的互信息（L24 p14）',
      '会用计数算一个变量的熵、两个变量的互信息',
      '手动执行最大权生成树，说出每一步为什么加或跳过（L24 p15–p19）',
      '写出树的 BIC，算单条边的 BIC，说明为什么只看似然不够、结果可能是森林（L24 p20）',
      '说出 C. elegans 例子的流程，并和 c58 junction tree 的最大权生成树比较（L24 p21–p23）',
    ],
    types: [],
    what: [
      { t: 'h3', text: '① 问题：结构也不知道（L24 p13）' },
      T`c63 默认图（哪些变量之间有边）已知。现在连图也要从数据里学：structure search，找 the highest scoring tree。为什么只找**树**？补充理解：$n$ 个带编号的节点能组成的树有 $n^{n-2}$ 棵（Cayley 公式）——4 个变量 16 棵，25 个变量约 $1.4\times10^{32}$ 棵，一棵一棵比不可能。但树有两个好性质：MLE 有闭式解（c63 p12），而且对数似然能按边拆开（下面 ②）。两者合起来，最好的树可以**精确又高效**地找到（p10："Even the highest scoring tree structure can be found efficiently"）。对比 L23 的一般 BN：搜索是 computationally hard（[c62](#/c62)）。`,
      { t: 'h3', text: '② 怎么比较两棵树：熵与互信息（L24 p14）' },
      T`对每一棵候选树，都先用 c63 的方法把参数拟合好（代频率），再看它的对数似然有多高。课件 p14 给出结果：`,
      { t: 'math', tex: T`l(D;\hat\theta)=T\Big[-\sum_{i=1}^n\hat H(X_i)+\sum_{(i,j)\in E}\hat I(X_i;X_j)\Big]` },
      T`这里出现了两个新量，先用大白话说：`,
      { t: 'math', tex: T`\hat H(X_i)=-\sum_{x_i=1}^{r_i}\hat P_i(x_i)\log\hat P_i(x_i),\qquad\hat I(X_i;X_j)=\sum_{x_i=1}^{r_i}\sum_{x_j=1}^{r_j}\hat P_{ij}(x_i,x_j)\log\frac{\hat P_{ij}(x_i,x_j)}{\hat P_i(x_i)\hat P_j(x_j)}` },
      { t: 'ul', items: [
        T`**熵（entropy）$\hat H(X_i)$**：变量 $x_i$ 有多"难猜"。总是取同一个值，$\hat H=0$；两个值各一半，$\hat H=\ln2\approx0.693$，最难猜。"empirical estimate"指概率用数据频率 $\hat P_i$ 代替。`,
        T`**互信息（mutual information）$\hat I(X_i;X_j)$**：知道 $x_i$ 之后，猜 $x_j$ 变容易了多少。log 里面是"实际一起出现的频率 ÷ 假如独立时应有的频率"：两变量独立（数据上）时每格比值都是 1、$\log1=0$，$\hat I=0$；越相关，$\hat I$ 越大。它总是 $\ge0$。`,
      ] },
      T`关键观察（p14 蓝字）：The sum of H's is the same for all trees。每棵树都包含全部 $n$ 个变量，$-\sum_i\hat H(X_i)$ 和选哪些边无关，比较时抵消。**能拉开差距的只有 $\sum_{(i,j)\in E}\hat I(X_i;X_j)$**：所以"Best scoring tree" therefore should include edges with high mutual information——把每条可能的边的权重设为 $\hat I(X_i;X_j)$，找边权之和最大的树。`,
      T`**用 c63 的 8 条数据核对这个公式**。三个变量都是 4 个 0、4 个 1：$\hat H=-(\frac12\ln\frac12+\frac12\ln\frac12)=\ln2=0.6931$。互信息 $\hat I(X_1;X_2)$：四格 $\hat P_{12}=(\frac38,\frac18,\frac18,\frac38)$，独立时每格应为 $\frac12\times\frac12=\frac14$，比值 $\frac{3/8}{1/4}=1.5$ 或 $\frac{1/8}{1/4}=0.5$：`,
      { t: 'math', tex: T`\begin{aligned}\hat I(X_1;X_2)&=2\times\tfrac38\ln1.5+2\times\tfrac18\ln0.5\\&=0.75\times0.4055+0.25\times(-0.6931)=0.3041-0.1733=0.1308\end{aligned}` },
      T`$\hat I(X_2;X_3)$ 相同（计数一样）$=0.1308$；$\hat I(X_1;X_3)$：四格都是 $\frac28=\frac14$，比值全是 1，$=0$。链 $x_1$—$x_2$—$x_3$ 的对数似然 $=8\times[-3\times0.6931+0.1308+0.1308]=8\times(-2.0794+0.2616)=8\times(-1.8178)=-14.54$——和 c63 第 6 步直接算的 $-14.5425$ 一样 ✓。如果改用树 $x_1$—$x_3$—$x_2$，边权 $0+0.1308$，似然更低：这份数据最好的树就是原来那条链。`,
      { t: 'deep', title: '补充推导：p12 的问题怎么变成 p14 的公式（课件没有写出中间步骤）', hint: '想知道来历再点开', blocks: [
        T`把 c63 的树 MLE $P(\mathbf x)=\prod_i\hat P_i(x_i)\prod_{(i,j)\in E}\frac{\hat P_{ij}(x_i,x_j)}{\hat P_i(x_i)\hat P_j(x_j)}$ 代入 $l=\sum_t\log P(\mathbf x_t)$，log 把乘积拆成和：`,
        { t: 'math', tex: T`l=\sum_i\underbrace{\sum_t\log\hat P_i(x_{ti})}_{(1)}+\sum_{(i,j)\in E}\underbrace{\sum_t\log\frac{\hat P_{ij}(x_{ti},x_{tj})}{\hat P_i(x_{ti})\hat P_j(x_{tj})}}_{(2)}` },
        T`(1)：按 $x_i$ 的取值把样本分组，取值 $x_i$ 出现 $\hat n_i(x_i)=T\hat P_i(x_i)$ 次，所以 $(1)=\sum_{x_i}T\hat P_i(x_i)\log\hat P_i(x_i)=-T\hat H(X_i)$。`,
        T`(2)：同理按 $(x_i,x_j)$ 分组，出现 $T\hat P_{ij}(x_i,x_j)$ 次，所以 $(2)=T\sum_{x_i,x_j}\hat P_{ij}\log\frac{\hat P_{ij}}{\hat P_i\hat P_j}=T\hat I(X_i;X_j)$。`,
        T`合起来就是 $l=T[-\sum_i\hat H(X_i)+\sum_{(i,j)\in E}\hat I(X_i;X_j)]$。p12 问的 $\mathbb E_{x\sim P}[\log P(x)]$ 正是 $l/T$：在"按数据频率抽样"的分布下，$\log P$ 的平均值。`,
      ] },
      { t: 'h3', text: '③ 最大权生成树，一步一步（L24 p15–p19）' },
      T`**生成树（spanning tree）**：用 $n-1$ 条边把 $n$ 个节点全部连起来、没有环。最大权：在所有生成树里，边权之和最大的那棵。课件的算法（p15）：`,
      { t: 'steps', items: [
        T`We start with an empty tree：一条边都没有。`,
        T`We iteratively add the candidate edge with maximum weight to the tree, if it does not create a cycle：每次从剩下的候选边里取权重最大的，加进来不成环就加，成环就扔掉。`,
        T`（补充）加满 $n-1$ 条边，所有节点都连通了，就结束。这个贪心算法叫 Kruskal 算法，课件没提名字。`,
      ] },
      T`课件的例子：4 个变量，6 条候选边的权重是互信息 $I(x_1,x_3)=3$，$I(x_2,x_3)=2$，$I(x_1,x_2)=1.5$，$I(x_3,x_4)=1$，$I(x_2,x_4)=0.9$，$I(x_1,x_4)=0.7$。黑线是候选边，红色粗线是已经选进树的边：`,
      { t: 'graphs', r: 17, items: [
        g(MW, { edges: MW_ALL, caption: 'p15：空树。从大到小排：3 > 2 > 1.5 > 1 > 0.9 > 0.7' }),
        g(MW, { edges: 'x1-x2=1.5 x2-x4=0.9 x3-x4=1 x1-x3:path=3 x1-x4=0.7 x2-x3=2', caption: 'p16：最大的 $x_1$—$x_3$（3）：加入' }),
        g(MW, { edges: 'x1-x2=1.5 x2-x4=0.9 x3-x4=1 x1-x3:path=3 x1-x4=0.7 x2-x3:path=2', caption: 'p17：$x_2$—$x_3$（2）：$x_2$ 还没连上，加入' }),
        g(MW, { edges: 'x1-x2:fill=1.5 x2-x4=0.9 x3-x4=1 x1-x3:path=3 x1-x4=0.7 x2-x3:path=2', caption: 'p18：$x_1$—$x_2$（1.5）：$x_1$、$x_2$ 已经经过 $x_3$ 连通，加了成环 $x_1$—$x_3$—$x_2$—$x_1$（creates a cycle if added）：跳过' }),
        g(MW, { edges: 'x1-x2:gone=1.5 x2-x4:gone=0.9 x3-x4:path=1 x1-x3:path=3 x1-x4:gone=0.7 x2-x3:path=2', caption: 'p19：$x_3$—$x_4$（1）：加入。已有 $4-1=3$ 条边，完成' }),
      ] },
      T`最终的树：$x_1$—$x_3$、$x_2$—$x_3$、$x_3$—$x_4$，总权重 $3+2+1=6$。剩下的 0.9、0.7 两条不用再看：树已经连通，再加任何边都会成环。（核对：4 个节点一共 16 棵生成树，第二好的是 $x_1$—$x_3$、$x_2$—$x_3$、$x_2$—$x_4$，总权重 $3+2+0.9=5.9<6$。）`,
      T`**注意 1.5 那条**：它比最后选进来的 1 大，却没被选——"取权重最大的 $n-1$ 条边"（3、2、1.5）是错的，那会成环、而且 $x_4$ 没连上。每次都要检查是否成环。`,
      { t: 'h3', text: '④ 只看似然不够：BIC（L24 p20）' },
      T`p20 第一句：The log-likelihood value does not suffice as a selection criterion for edges to include in the tree。原因：互信息总是 $\ge0$，多一条边对数似然只会增加或不变，所以只看似然时**一定会连满 $n-1$ 条边**——哪怕某两个变量的"相关"只是数据里的噪声。这是过拟合（c18）：模型越复杂，训练数据上的似然越高。L23 用 BIC 处理过同样的问题（[c61](#/c61)：对数似然减去"自由参数个数 $/2\times\log T$"），这里照搬：`,
      { t: 'math', tex: T`\begin{aligned}BIC(D;\hat\theta)=&\underbrace{-T\sum_{i=1}^n\hat H(X_i)-\sum_{i=1}^n\frac{r_i-1}{2}\log T}_{\text{所有树都一样}}\\&+\sum_{(i,j)\in E}\underbrace{\Big(T\hat I(X_i;X_j)-\frac{r_ir_j-r_i-r_j+1}{2}\log T\Big)}_{\text{BIC score for an edge}}\end{aligned}` },
      T`**罚分从哪来**（补充理解）：树形模型的自由参数 = 每个变量自己的 $r_i-1$ 个 + 每条边多出的 $(r_i-1)(r_j-1)$ 个（课件写成展开式 $r_ir_j-r_i-r_j+1$，就是 $(r_i-1)(r_j-1)$）。可以用 BN 来数：把树定一个根，根的 CPT 有 $r-1$ 个自由参数；孩子 $j$ 在父亲 $i$ 下的 CPT 有 $(r_j-1)r_i=(r_j-1)+(r_j-1)(r_i-1)$ 个。每个参数罚 $\frac12\log T$，所以每条边罚 $\frac{(r_i-1)(r_j-1)}{2}\log T$。`,
      T`于是每条边有一个自己的分数：$T\hat I(X_i;X_j)$（似然的增益）减去罚分。**分数可以是负的**：互信息太小，带来的似然增益抵不上多出来的参数。二元变量时 $(r_i-1)(r_j-1)=1$，边的 BIC $>0$ 等价于 $\hat I(X_i;X_j)>\frac{\log T}{2T}$。`,
      T`p20 最后：The highest scoring tree (forest) can be found via a maximum weighted spanning tree algorithm over edges with positive BIC scores。只在 BIC 为正的边上跑最大权生成树；负分的边不加，所以结果可能不连通——是一个**森林（forest）**。`,
      { t: 'h3', text: '⑤ 真实例子：C. elegans（L24 p21–p22）' },
      T`p21：25 个二元变量，描述线虫 C. elegans 在 926 次基因扰动（gene disruption）实验中的表型变化（如 motility，运动能力）。$T=926$，$n=25$。这和 L23 学 BN 结构时用的是同一份数据（[c62](#/c62)：限制每个变量最多 4 个父节点，仍要为大量候选父节点集合算分数再搜索）。树的做法简单得多：`,
      { t: 'steps', items: [
        T`对所有 $\binom{25}{2}=300$ 对变量数计数，得到 $\hat P_{ij}$、$\hat P_i$（"it suffices to get the empirical probability estimates for all pairs"）。`,
        T`算每一对的 $\hat I$ 和边的 BIC 分数。二元变量、$T=926$：罚分 $\frac12\ln926=\frac12\times6.831=3.415$，所以只有 $\hat I>3.415/926\approx0.0037$ 的边分数为正。`,
        T`把分数交给最大权生成树算法（课件写作 MWSP，应指 MWST）。`,
      ] },
      { t: 'slide', src: 'L24/p22', caption: 'L24 p22：得到的最高分树形模型。16 号变量是中心，连着 9 个变量；线的粗细深浅不同（课件没解释，看起来表示边的强弱）。' },
      T`**补充观察**（课件没说）：图上只有 24 个编号，没有 10 号，边一共 23 条。在课件能看到的几行数据里，$x_{10}$ 全是 0——一个几乎不变的变量，和谁的互信息都很小，BIC 都是负的，就成了孤立点。这正好是"结果可能是森林"的样子。`,
      { t: 'h3', text: '⑥ Mini summary（L24 p23）' },
      { t: 'ul', items: [
        T`Parameter estimation based on maximum likelihood leads to moment matching（[c63](#/c63)）。`,
        T`Finding the highest scoring tree can be done efficiently via maximum weighted spanning tree（本章）。`,
      ] },
    ],
    why: [
      T`**考试情况**：往年卷（2021、2025 practice、2026 practice）都没有出过 L24 的题，没有往年题可参考；按官方范围仍要会。最像考题的是：给几条边的互信息，手动跑最大权生成树（和 T6 里取 junction tree 的那一步是同一个动作）；给 $T$、$r_i$、$\hat I$，算一条边的 BIC 判断要不要加；以及概念简答"为什么只看互信息""为什么要 BIC""为什么结果可能是森林"。`,
      T`**在主线里的位置**：W12 = 学参数 → 学结构。BN 的结构搜索（[c62](#/c62)）是 NP-hard，只能启发式；MRF 限制成树后，c63 的闭式 MLE 让似然按边拆开，结构搜索变成精确可解的最大权生成树。`,
    ],
    intuition: [
      T`**$n-1$ 个名额，留给最有用的边。** 一棵树只能有 $n-1$ 条边。互信息衡量"这条边能帮模型多猜对多少"，所以名额当然先给互信息最大的边——但不能浪费在已经连通的两点之间（成环那条只是重复的信息通道）。`,
      T`**为什么贪心不会错？**（补充理解）假设某一步选了当前最大的不成环边 $e$，而最优树 $T^*$ 没有它。把 $e$ 加进 $T^*$ 会出现一个环，环上一定有一条边 $f$ 在当时还没被选（否则 $e$ 会成环）。$f$ 当时也是候选边，所以 $w(f)\le w(e)$；用 $e$ 换掉 $f$，仍是生成树，总权重不降。一路这样换下去，贪心的结果不比最优差。`,
      T`**BIC 像"入场费"。** 每条边要交 $\frac{(r_i-1)(r_j-1)}{2}\log T$ 的入场费，带来的收益是 $T\hat I$。收益抵不上入场费的边不让进。数据越多（$T$ 越大），收益 $T\hat I$ 涨得比入场费 $\log T$ 快，弱一点的真实关系也能被留下。`,
      { t: 'think', q: '课件 p18 的 $x_1$—$x_2$（1.5）比最后选中的 $x_3$—$x_4$（1）权重大，为什么不选它？', a: T`那时 $x_1$—$x_3$、$x_2$—$x_3$ 已经在树里，$x_1$ 和 $x_2$ 已经通过 $x_3$ 连通。再加 $x_1$—$x_2$ 会形成环 $x_1$—$x_3$—$x_2$—$x_1$，树不允许有环。$x_4$ 还没连上，所以后面要用 $x_3$—$x_4$ 把它接进来。` },
      { t: 'think', q: '二元变量、$T=100$。一条边的互信息 $\\hat I=0.02$，BIC 会留下它吗？', a: T`边的 BIC $=100\times0.02-\frac12\ln100=2-2.303=-0.303<0$，不留。门槛是 $\hat I>\frac{\ln100}{200}=0.0230$。如果数据变成 $T=1000$（互信息不变）：$1000\times0.02-\frac12\ln1000=20-3.454=16.55>0$，就留下了。` },
      { t: 'story', title: 'Chow–Liu 树', md: 'C. K. Chow 和 C. N. Liu 在 1968 年证明：要用一棵树去近似一个多变量分布，最好的树就是以互信息为边权的最大权生成树——正是本章的算法，文献里叫 Chow–Liu 算法（课件没用这个名字）。贪心求最小 / 最大生成树的方法则是 Joseph Kruskal 1956 年提出的。' },
    ],
    math: [
      { t: 'h3', text: '归纳：树形 MRF 的结构学习（L24 p20–p21）' },
      { t: 'steps', items: [
        T`数所有变量对的计数，得到 $\hat P_{ij}(x_i,x_j)=\hat n_{ij}/T$ 和 $\hat P_i(x_i)=\hat n_i/T$。`,
        T`对每一对算互信息 $\hat I(X_i;X_j)$，再算边的 BIC：$T\hat I(X_i;X_j)-\frac{(r_i-1)(r_j-1)}{2}\log T$。`,
        T`去掉 BIC $\le0$ 的边，在剩下的边上跑最大权生成树：从大到小加边，跳过成环的。结果是树或森林。`,
        T`参数就用 c63 的树 MLE（代频率），不需要再学。`,
      ] },
      T`**两个总分的关系**：对数似然 $=T[-\sum\hat H+\sum_E\hat I]$；BIC $=$ 对数似然 $-\frac{\text{参数个数}}2\log T$，参数个数 $=\sum_i(r_i-1)+\sum_{(i,j)\in E}(r_i-1)(r_j-1)$。只比较树的话，前面的部分都相同，只需比较边分数之和。`,
    ],
    fx: [
      {
        title: '树的对数似然（L24 p14）', tex: T`l(D;\hat\theta)=T\Big[\htmlClass{fx-p1}{-\sum_{i=1}^n\hat H(X_i)}+\htmlClass{fx-p2}{\sum_{(i,j)\in E}\hat I(X_i;X_j)}\Big]`,
        parts: [
          { label: '熵之和', note: '每棵树都有全部 $n$ 个变量，这一项对所有树相同（"The sum of H\'s is the same for all trees"），比较时抵消。' },
          { label: '边上互信息之和', note: '只和选了哪些边有关。最好的树让它最大：以 $\\hat I$ 为边权的最大权生成树。' },
        ],
      },
      {
        title: '经验互信息（L24 p14）', tex: T`\hat I(X_i;X_j)=\sum_{x_i=1}^{r_i}\sum_{x_j=1}^{r_j}\htmlClass{fx-p1}{\hat P_{ij}(x_i,x_j)}\log\htmlClass{fx-p2}{\frac{\hat P_{ij}(x_i,x_j)}{\hat P_i(x_i)\hat P_j(x_j)}}`,
        parts: [
          { label: '权重', note: '每种取值组合按它在数据里出现的频率加权。' },
          { label: '实际 ÷ 独立时', note: '比值 > 1：比独立时更常一起出现；< 1：更少。独立时处处为 1、log 为 0，整体 $\\hat I=0$。' },
        ],
      },
      {
        title: '树的 BIC（L24 p20）', tex: T`\begin{aligned}BIC(D;\hat\theta)=&\htmlClass{fx-p1}{-T\sum_{i=1}^n\hat H(X_i)-\sum_{i=1}^n\frac{r_i-1}{2}\log T}\\&+\sum_{(i,j)\in E}\Big(\htmlClass{fx-p2}{T\hat I(X_i;X_j)}-\htmlClass{fx-p3}{\frac{r_ir_j-r_i-r_j+1}{2}\log T}\Big)\end{aligned}`,
        parts: [
          { label: '所有树都一样', note: '熵项和每个变量自己的 $r_i-1$ 个参数的罚分；只和变量有关，和边无关。' },
          { label: '边的似然增益', note: '加这条边，对数似然增加 $T\\hat I$（$\\ge0$）。' },
          { label: '边的罚分', note: '$r_ir_j-r_i-r_j+1=(r_i-1)(r_j-1)$：这条边多出的自由参数个数，每个罚 $\\frac12\\log T$。二元变量时就是 $\\frac12\\log T$。' },
        ],
      },
    ],
    example: [
      { t: 'h3', text: 'BIC 把弱边砍掉：三个二元变量，$T=100$（自编数据）' },
      T`三个二元变量 $A,B,C$，100 条数据。只需要两两计数（p21：it suffices to get the empirical probability estimates for all pairs）：`,
      { t: 'table', cls: 'compact', head: ['变量对', '(0,0)', '(0,1)', '(1,0)', '(1,1)'], rows: [
        ['$\\hat n_{AB}$', '40', '10', '10', '40'],
        ['$\\hat n_{BC}$', '30', '20', '20', '30'],
        ['$\\hat n_{AC}$', '26', '24', '24', '26'],
      ] },
      T`（这三张表来自同一份 100 条的数据：8 种组合 $(A,B,C)$ 的计数是 000:25，001:15，010:1，011:9，100:5，101:5，110:19，111:21，按两个变量分组相加就得到上表。例如 $\hat n_{AB}(0,0)=25+15=40$。）每个变量都是 50 个 0、50 个 1，所以 $\hat P_i=(\frac12,\frac12)$，独立时每格应为 $\frac14$。`,
      { t: 'h4', text: '第 1 步：算三个互信息（自然对数）' },
      { t: 'steps', items: [
        T`$\hat I(A;B)$：频率 $(0.4,0.1,0.1,0.4)$，比值 $\frac{0.4}{0.25}=1.6$、$\frac{0.1}{0.25}=0.4$。$\hat I=2\times0.4\ln1.6+2\times0.1\ln0.4=0.8\times0.4700+0.2\times(-0.9163)=0.3760-0.1833=0.1927$。`,
        T`$\hat I(B;C)$：频率 $(0.3,0.2,0.2,0.3)$，比值 1.2、0.8。$\hat I=0.6\ln1.2+0.4\ln0.8=0.6\times0.1823+0.4\times(-0.2231)=0.1094-0.0893=0.0201$。`,
        T`$\hat I(A;C)$：频率 $(0.26,0.24,0.24,0.26)$，比值 1.04、0.96。$\hat I=0.52\ln1.04+0.48\ln0.96=0.52\times0.0392+0.48\times(-0.0408)=0.0204-0.0196=0.0008$。`,
      ] },
      { t: 'h4', text: '第 2 步：只看似然（边权 = 互信息）' },
      T`从大到小：$A$—$B$（0.1927）加入；$B$—$C$（0.0201）加入；已有 $3-1=2$ 条边，完成（$A$—$C$ 会成环）。结果：链 $A$—$B$—$C$。`,
      { t: 'h4', text: '第 3 步：改用边的 BIC' },
      T`二元变量，每条边罚分 $\frac{(2-1)(2-1)}{2}\ln100=\frac12\times4.6052=2.3026$（门槛 $\hat I>2.3026/100=0.0230$）：`,
      { t: 'table', cls: 'compact', head: ['边', '$T\\hat I$', '− 罚分', '边的 BIC', '结论'], rows: [
        ['$A$—$B$', '$100\\times0.1927=19.27$', '$-2.30$', '$16.97$', '正，可以加'],
        ['$B$—$C$', '$100\\times0.0201=2.01$', '$-2.30$', '$-0.29$', '负，不加'],
        ['$A$—$C$', '$100\\times0.0008=0.08$', '$-2.30$', '$-2.22$', '负，不加'],
      ] },
      T`只在正分的边上跑最大权生成树：只有 $A$—$B$。结果是**森林**：$A$—$B$ 一棵，$C$ 单独一个。$B$ 和 $C$ 的相关太弱（30/20 的分布），100 条数据不足以证明它不是噪声。`,
      { t: 'graphs', r: 18, items: [
        g(TOY, { edges: 'A-B:path=0.1927 B-C:path=0.0201 A-C:gone=0.0008', caption: '只看似然（边权 $\\hat I$）：连满 2 条边' }),
        g(TOY, { edges: 'A-B:path=16.97 B-C:gone=−0.29 A-C:gone=−2.22', caption: '用 BIC（边权 = 边的 BIC）：只剩 $A$—$B$，$C$ 孤立' }),
      ] },
      { t: 'h4', text: '第 4 步：用整棵树的 BIC 核对' },
      T`三个变量的熵都是 $\ln2=0.6931$，$\sum\hat H=2.0794$。`,
      { t: 'table', cls: 'compact', head: ['模型', '对数似然 $T[-\\sum\\hat H+\\sum_E\\hat I]$', '自由参数', '罚分 $\\frac{k}{2}\\ln100$', 'BIC'], rows: [
        ['链 $A$—$B$—$C$', '$100\\times(-2.0794+0.1927+0.0201)=-186.66$', '$3+2=5$', '$11.51$', '$-198.17$'],
        ['森林 $A$—$B$，$C$', '$100\\times(-2.0794+0.1927)=-188.67$', '$3+1=4$', '$9.21$', '$-197.88$'],
      ] },
      T`链的似然更高（$-186.66>-188.67$），但 BIC 更低（$-198.17<-197.88$）：森林胜出。两者 BIC 之差 $-198.17-(-197.88)=-0.29$，正好是 $B$—$C$ 这条边的 BIC 分数——验证了"树的 BIC = 所有树都一样的部分 + 各边分数之和"。`,
      { t: 'fade', title: '分步练习：四个变量的最大权生成树与 BIC', plan: ['按互信息从大到小加边，跳过成环的', '算每条边的 BIC，去掉 ≤ 0 的', '在剩下的边上重跑，数森林的边'], items: [
        { md: T`上面的例子：$A,B,C$，$\hat I$ 分别为 $AB=0.1927$，$BC=0.0201$，$AC=0.0008$，$T=100$。`, steps: [
          { md: T`只看似然：$AB$ 加，$BC$ 加，已有 2 条边，完成（$AC$ 会成环）` },
          { md: T`罚分 $\frac12\ln100=2.30$：$AB=19.27-2.30=16.97$，$BC=2.01-2.30=-0.29$，$AC=0.08-2.30=-2.22$` },
          { md: T`只剩 $AB$ 为正：森林 $\{A\text{—}B\}$ 加孤立的 $C$，1 条边` },
        ] },
        { label: '独立：全部你来', md: T`四个二元变量，题目给出 $\hat I$：$AB=0.30$，$AC=0.25$，$BC=0.20$，$AD=0.05$，$CD=0.04$，$BD=0.03$；$T=20$。`, steps: [
          { ask: '只看似然：最大权生成树的总权重是多少？', answer: 0.6, tol: 0.001, show: T`$AB$（0.30）加；$AC$（0.25）加；$BC$（0.20）会成环 $B$—$A$—$C$—$B$，跳过；$AD$（0.05）加，3 条边完成。总权重 $0.30+0.25+0.05=0.60$`, sg: 2 },
          { ask: T`边 $A$—$D$ 的 BIC 分数？（$\ln20=2.9957$）`, answer: -0.498, tol: 0.003, show: T`$20\times0.05-\frac12\times2.9957=1-1.4979=-0.498$，负分`, sg: 3 },
          { ask: '只用 BIC 为正的边，结果有几条边？', answer: 2, show: T`正分的边：$AB=6-1.498=4.50$，$AC=5-1.498=3.50$，$BC=4-1.498=2.50$；$D$ 的三条边都 $<0$（$CD=0.8-1.498$，$BD=0.6-1.498$）。最大权生成树：$AB$、$AC$，$BC$ 成环跳过。2 条边，$D$ 孤立：森林`, sg: 4 },
        ] },
      ] },
    ],
    viz: [
      { id: 'mwst-stepper', opts: { preset: 'L24' }, how: '每点一次"下一步"，算法看一条边：剩下权重最大的那条。红色粗线 = 已选进树；虚线 = 刚刚因成环被跳过；浅色 = 不再需要。下方表格记下每一步的决定和树的总权重。可以改边权，或换成本章的 BIC 例子、练习题和 c58 的 junction tree。',
        try: '① 课件预设：先自己写出加边顺序，再点"下一步"核对；注意第 3 步跳过 1.5。② 把 $x_1$—$x_2$ 的权重改成 3.5：树变成什么？总权重多少？（$x_1$—$x_2$、$x_1$—$x_3$、$x_3$—$x_4$，$3.5+3+1=7.5$）③ 选"c64 例子"，关掉再打开"按 BIC 打分"，看结果从树变成森林；把 $T$ 改成 1000 再看 $B$—$C$ 能不能留下（$1000\\times0.0201-\\frac12\\ln1000=20.1-3.45>0$，能）。④ 选"c58 对照"：同一个算法，权重换成共享变量个数。' },
    ],
    compare: [
      { t: 'table', head: ['', 'junction tree（c58，L22）', '树形 MRF 结构学习（本章，L24）'], rows: [
        ['图的节点', '极大团（一组变量）', '单个变量'],
        ['边权', '两团共享的变量个数 $|c_i\\cap c_j|$', '互信息 $\\hat I(X_i;X_j)$ 或边的 BIC'],
        ['目的', '推断：让团组成树（满足 running intersection）', '学习：选出得分最高的树结构'],
        ['权重可以是负的吗', '不会', 'BIC 可以，负分的边不加 ⇒ 可能得到森林'],
        ['算法', '最大权生成树：从大到小加边，跳过成环的', '同一个算法'],
      ] },
      { t: 'table', head: ['', 'BN 结构学习（c62，L23）', '树形 MRF 结构学习（本章）'], rows: [
        ['在什么里找', '所有 DAG（例子里每个节点最多 4 个父节点）', '只在树（森林）里找'],
        ['分数', 'BIC 或 Bayesian score，按节点分解', 'BIC，按边分解（似然只看互信息）'],
        ['怎么找', 'local / stochastic / exact (costly) search；NP-hard', '最大权生成树：精确且高效'],
        ['约束', '不能有有向环（全局约束）', '不能有环——贪心时检查即可'],
      ] },
      { t: 'exam', md: T`**How is the highest-scoring tree-structured MRF learned from complete data?** Estimate $\hat P_{ij}(x_i,x_j)=\hat n_{ij}(x_i,x_j)/T$ and $\hat P_i(x_i)=\hat n_i(x_i)/T$ for all pairs; for any tree these are the ML parameters. The resulting log-likelihood is $T[-\sum_i\hat H(X_i)+\sum_{(i,j)\in E}\hat I(X_i;X_j)]$, and the entropy term is the same for all trees, so trees differ only through the summed empirical mutual information of their edges. The log-likelihood alone always prefers a full spanning tree since $\hat I\ge0$, so we score each edge with BIC, $T\hat I(X_i;X_j)-\frac{(r_i-1)(r_j-1)}{2}\log T$, and run a maximum weighted spanning tree algorithm (start from an empty tree, repeatedly add the highest-weight edge that does not create a cycle) over the edges with positive BIC scores. The result is the highest-scoring tree, or a forest if some variables have no edge with a positive score.` },
    ],
    pitfalls: [
      ['直接取权重最大的 $n-1$ 条边', '每次都要检查是否成环；课件例子里 1.5 比 1 大却被跳过（p18）。'],
      ['比较树时要算每个变量的熵', '熵之和对所有树都一样（p14），只需要比较边上的互信息。'],
      ['似然最高的树就是最好的', '似然总会连满 $n-1$ 条边（$\\hat I\\ge0$），会过拟合；要用 BIC（p20）。'],
      ['BIC 之后结果一定是一棵连通的树', '负分的边不加，可能得到森林（p20 "tree (forest)"）。'],
      ['互信息可以是负的', '$\\hat I\\ge0$，独立时为 0；可以为负的是边的 BIC 分数。'],
      ['边的罚分是 $\\frac{r_ir_j}{2}\\log T$', '是 $\\frac{r_ir_j-r_i-r_j+1}{2}\\log T=\\frac{(r_i-1)(r_j-1)}{2}\\log T$，二元变量时为 $\\frac12\\log T$。'],
      ['junction tree 的边权也是互信息', 'junction tree（c58）的边权是两团共享的变量个数；只有算法相同。'],
    ],
    quiz: [
      { type: 'num', q: '4 个变量，候选边权重：$A$—$B$ 5，$B$—$C$ 4，$A$—$C$ 3.5，$B$—$D$ 2，$C$—$D$ 1，$A$—$D$ 0.5。最大权生成树的总权重是多少？', answer: 11,
        explain: T`从大到小：$A$—$B$（5）加入；$B$—$C$（4）加入；$A$—$C$（3.5）：$A$、$C$ 已经经过 $B$ 连通，会成环，跳过；$B$—$D$（2）加入，已有 $4-1=3$ 条边，完成。总权重 $5+4+2=11$。陷阱：直接取最大的三条 $5+4+3.5=12.5$——那三条组成环，而且 $D$ 没连上。` },
      { type: 'mc', q: 'L24 p18 中，$I(x_1,x_2)=1.5$ 为什么没有被加进树？', options: ['$x_1$ 和 $x_2$ 已经通过 $x_3$ 连通，加了会成环', '它的权重太小', '它的 BIC 分数是负的', '树已经有 3 条边了'], answer: 0,
        explain: T`此时树里有 $x_1$—$x_3$（3）和 $x_2$—$x_3$（2），$x_1$ 和 $x_2$ 已经经过 $x_3$ 连通，再加 $x_1$—$x_2$ 会形成环 $x_1$—$x_3$—$x_2$—$x_1$（课件："creates a cycle if added"）。"权重太小"不对：1.5 比后来加进去的 $x_3$—$x_4$（1）还大。这个例子没有用 BIC。此时树只有 2 条边，还没满 3 条。` },
      { type: 'num', q: '$x_i$ 有 3 个取值，$x_j$ 有 2 个取值，$T=100$，$\\hat I(X_i;X_j)=0.04$（自然对数）。这条边的 BIC 分数是多少？', answer: -0.605, tol: 0.01,
        explain: T`边的 BIC $=T\hat I-\frac{r_ir_j-r_i-r_j+1}{2}\ln T$。罚分系数：$3\times2-3-2+1=2$，即 $(3-1)(2-1)=2$ 个参数，$\frac22\ln100=4.6052$。似然增益 $100\times0.04=4$。分数 $4-4.6052=-0.605<0$：不加这条边。陷阱：把罚分写成 $\frac{r_ir_j}{2}\ln T=3\ln100=13.8$。` },
      { type: 'mc', q: '为什么只看对数似然不足以决定树里该放哪些边？', options: ['互信息 $\\ge0$，加边从不降低似然，所以总会连满 $n-1$ 条边，包括只是噪声的弱边', '对数似然无法计算', '互信息可能为负，会选错边', '熵之和在不同的树之间不同'], answer: 0,
        explain: T`拟合好的树的对数似然 $=T[-\sum\hat H+\sum_E\hat I]$，每条边贡献 $T\hat I\ge0$。所以似然只会让我们连满一整棵生成树，哪怕某些变量对的相关只是有限样本的噪声——这是过拟合（c18）。BIC 给每条边减去 $\frac{(r_i-1)(r_j-1)}{2}\log T$，弱边的分数变负就不加（L24 p20）。另外三项都和课件相反：似然能算；互信息 $\ge0$；熵之和对所有树相同。` },
      { type: 'num', q: '用 c63 的 8 条数据（$T=8$，二元变量），$\\hat I(X_1;X_2)=0.1308$。这条边的 BIC 分数是多少？（$\\ln8=2.0794$）', answer: 0.0068, tol: 0.001,
        explain: T`边的 BIC $=T\hat I-\frac{(2-1)(2-1)}{2}\ln T=8\times0.1308-\frac12\times2.0794=1.0465-1.0397=0.0068$。刚好为正，所以这条边勉强留下：只有 8 条数据时，罚分几乎吃掉了全部似然增益。` },
      { type: 'show', q: '（英文）Compare the use of a maximum weighted spanning tree in building a junction tree (L22) and in learning a tree-structured MRF (L24).', answer: T`Both use the same greedy algorithm: start from an empty tree and repeatedly add the highest-weight edge that does not create a cycle. In a junction tree the nodes are maximal cliques and the edge weight is the number of variables two cliques share; the spanning tree is used for inference and gives the running intersection property. In structure learning the nodes are the variables and the weight of an edge is the empirical mutual information $\hat I(X_i;X_j)$ (or its BIC score $T\hat I-\frac{(r_i-1)(r_j-1)}{2}\log T$), because the log-likelihood of a fitted tree is a constant plus the sum of the mutual information on its edges. BIC scores can be negative; such edges are left out, so the result can be a forest.`, qzh: '比较最大权生成树在构造联结树（junction tree，L22）和学习树形 MRF（L24）中的用法。', azh: T`两者用同一个贪心算法：从空树开始，反复加入权重最大且不成环的边。在联结树里，节点是极大团（maximal cliques），边权是两个团共享的变量个数；这棵生成树用于推断，并保证 running intersection 性质。在结构学习里，节点是变量，边权是经验互信息 $\hat I(X_i;X_j)$（或它的 BIC 分数 $T\hat I-\frac{(r_i-1)(r_j-1)}{2}\log T$），因为拟合好的树的对数似然 = 常数 + 树上各边互信息之和。BIC 分数可以为负，这样的边不加，所以结果可能是森林（forest）。` },
    ],
  });
})(window);
