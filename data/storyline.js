/* 一条线串起来: the whole course as one storyline, read once before the sprint page (user: "这个脉络太散了，我没有一个连贯的认知").
 * Seven stops in lecture order. Each stop = the problem it meets, the idea (one or two formulas), the new problem that leads to the next stop,
 * and the sprint items that examine it. SML.storyStops is the single map from sprint item to stop: this page lists the items from it and
 * the sprint page's item headings link back through it. Sprint numbers are read from the sprint page, so they follow its order.
 * Formula folds reuse SML.formulaChain (data/formula-chain.js). Out-of-scope topics never appear here. */
(function (root) {
  'use strict';
  const T = String.raw;
  const SML = root.SML;
  const P = (...ps) => ps.join('\n\n');

  const STOPS = [
    { id: 's1', n: '①', week: 'W1–W2', title: '从数据估计参数', sub: 'MLE · Bayesian（prior → posterior → MAP）· linear / logistic regression · gradient descent',
      next: '加特征、加参数，训练误差一直降，但新数据上反而变差（overfitting）',
      items: ['q1ab', 'derive', 'xor'], chs: ['c06', 'c07', 'c08', 'c10', 'c11', 'c12', 'c13', 'c15'] },
    { id: 's2', n: '②', week: 'W3–W4', title: '控制模型复杂度', sub: 'regularisation（ridge / lasso）· bias–variance · 泛化界 · VC dimension',
      next: '能把训练数据完全分开的线性分类器有无穷多条，选哪条最稳？',
      items: ['ins-t15', 'vc-table', 'vc-family'], chs: ['c16', 'c17', 'c19', 'c21', 'c22', 'c23', 'c24'] },
    { id: 's3', n: '③', week: 'W4–W5', title: '最稳的线性分类器：SVM 与 kernel', sub: 'max margin · soft margin · dual · kernel trick · perceptron',
      next: 'kernel 要人来挑；能不能让模型自己学特征？',
      items: ['svm-sv', 'slack', 'ins-t8', 'perceptron'], chs: ['c25', 'c26', 'c27', 'c28', 'c29', 'c30', 'c31'] },
    { id: 's4', n: '④', week: 'W6–W7', title: '自己学特征：神经网络', sub: 'MLP · backprop · 训练技巧 · autoencoder · CNN · RNN / attention',
      next: '模型这么多，怎么比？数据一条一条来、每步都要做决定，怎么办？',
      items: ['cnn', 'ws8'], chs: ['c33', 'c34', 'c38', 'c39', 'c41'] },
    { id: 's5', n: '⑤', week: 'W8–W9', title: '评估与边学边决策', sub: 'k-fold CV · experts · bandits · UCB · contextual bandit',
      next: 'UCB 给"没把握"的臂加分；能不能把"有多没把握"正式算出来？',
      items: ['experts', 'ucb', 'ins-t2d'], chs: ['c46', 'c47', 'c48'] },
    { id: 's6', n: '⑥', week: 'W9–W10', title: '把不确定性算出来：Bayesian', sub: 'Bayesian linear regression · 预测方差 · evidence · Beta–Binomial',
      next: '变量一多，联合分布的表大到写不下、也学不出来',
      items: ['w11', 'ins-t9'], chs: ['c50', 'c51'] },
    { id: 's7', n: '⑦', week: 'W10–W12', title: '很多变量：概率图模型', sub: '表示（BN、D-separation、MRF）· 推断（消元、message passing、junction tree）· 学习（数数、打分）',
      items: ['pgm', 'dsep', 'mrf', 'elim', 'bp', 'mle'], chs: ['c53', 'c54', 'c55', 'c56', 'c57', 'c58', 'c59', 'c60', 'c61', 'c62', 'c63', 'c64'] },
  ];
  SML.storyStops = STOPS;

  const heads = SML.content.get('sprint').blocks.filter((b) => b && b.t === 'spHead');
  const head = (id) => {
    const h = heads.find((x) => x.id === id);
    if (!h) throw new Error('storyline: no sprint item ' + id);
    return h;
  };
  STOPS.forEach((s) => s.items.forEach(head));
  const stop = (k) => STOPS[k - 1];

  // the stop's exam items, in sprint order, as links into the sprint page
  const exam = (k, quiz) => ({ t: 'chips', items: [{ cls: 'kw-label', text: '冲刺页' }]
    .concat(stop(k).items.map(head).sort((a, b) => a.n - b.n).map((h) => ({ cls: 'kw', text: h.n + '. ' + h.title, href: '#/sprint/' + h.id })))
    .concat(quiz ? [{ cls: 'kw', text: '第 ' + head('cq').n + ' 项 Quiz ' + quiz, href: '#/sprint/cq' }] : []) });

  // this stop's steps of the formula storyline; each step says how it follows from the one before
  const chain = (k) => {
    const chs = stop(k).chs;
    const rows = [];
    SML.formulaChain.forEach((s) => s.steps.forEach((st) => { if (chs.indexOf(st.ch) >= 0) rows.push([st.name, '$' + st.tex + '$', st.how]); }));
    return { t: 'deep', title: '这一站的公式链（' + rows.length + ' 条）', hint: '每条写了它和上一条的关系，想看再展开', blocks: [{ t: 'table', head: ['名称', '公式', '和上一条的关系'], rows: rows }] };
  };

  const next = (k) => ({ t: 'warn', title: '带出的新问题 → 第 ' + stop(k + 1).n + ' 站', md: stop(k).next + '。' });

  const map = '<div class="st-flow">' + STOPS.map((s) =>
    '<a class="st-stop" href="#/storyline/' + s.id + '"><b>' + s.n + ' ' + s.week + ' · ' + s.title + '</b><span>' + s.sub + '</span></a>' +
    (s.next ? '<div class="st-why">' + s.next + '</div>' : '')).join('') + '</div>';

  const h = (k) => ({ t: 'h2', text: stop(k).n + ' ' + stop(k).title + '（' + stop(k).week + '）', id: stop(k).id });

  SML.content.add({
    id: 'storyline',
    eyebrow: '冲刺前先读 · 25 分钟',
    title: '一条线串起来',
    en: 'The course as one story',
    lead: '整门课只回答一个问题：**只有有限的数据，怎么学出一个在没见过的数据上也对的模型**。12 周是沿着这个问题走的 7 站：每一站解决上一站留下的问题，又带出一个新问题，新问题就是下一站。先看下面这张图（1 分钟），再按站读（每站 3 分钟），最后看"四条线"和"同一个东西换了名字"。每站末尾是冲刺页里考这一站的题，点了直接跳过去。',
    blocks: [
      { t: 'h2', text: '一张图', id: 'map' },
      { t: 'html', html: map },

      h(1),
      { t: 'p', md: P(
        T`**问题**：手上只有一堆样本，想知道产生它们的分布或函数的参数 $\theta$。有两条路：`,
        T`- frequentist 的 **MLE**：$\theta$ 是固定的未知数，选让数据最可能出现的那个，$\hat\theta=\argmax_\theta\sum_i\log p(x_i\mid\theta)$。抛硬币 $k$ 正 $n-k$ 反，MLE 是 $k/n$，也就是**数频率**。第 ⑦ 站学 CPT 还会用到它。
- **Bayesian**：$\theta$ 也是随机变量。先有 prior $p(\theta)$，看到数据后用 Bayes rule 得到 posterior $p(\theta\mid D)\propto p(D\mid\theta)\,p(\theta)$；只取后验的峰值就是 **MAP**。分母 $p(D)$ 叫 marginal likelihood（evidence），第 ⑥ 站用它选模型。`,
        T`**第一个模型：linear regression**，最小化平方误差。这不是拍脑袋定的：假设 $y=\bw'\bx+\varepsilon$、噪声 $\varepsilon$ 是 Gaussian，做 MLE 推出来**正好就是最小二乘**，有闭式解 normal equations $\hat{\bw}=(\bX'\bX)^{-1}\bX'\by$。数据是弯的就做 basis expansion（加 $x^2$、RBF 这类特征），模型对 $\bw$ 仍然是线性的。XOR 加一个特征 $x_1x_2$ 就能分开，就是这个道理。`,
        T`**换成分类：logistic regression**，$P(y=1\mid\bx)=\sigma(\bw'\bx)$。同样做 MLE（Bernoulli 似然取负 log 就是 cross-entropy loss），但没有闭式解，只能迭代：gradient descent 沿负梯度走一步，SGD 每次只用一个样本，Newton–Raphson 再用上二阶导。`) },
      next(1),
      exam(1, '1.1–1.3（Bayesian、MLE、Newton–Raphson）'),
      chain(1),

      h(2),
      { t: 'p', md: P(
        T`**实践上的办法：regularisation**。在损失后面加惩罚项。ridge 加 $\lambda\|\bw\|_2^2$，闭式解 $(\bX'\bX+\lambda I)^{-1}\bX'\by$，顺便解决了特征共线、$\bX'\bX$ 不可逆的问题；lasso 加 $\lambda\|\bw\|_1$，会把一些权重压成 0。**这就是第 ① 站的 MAP**：ridge 对应 Gaussian prior，lasso 对应 Laplace prior。"加惩罚"和"加先验"是同一件事，这是全课第一个大连接。$\lambda$ 越大模型越简单，用 validation 选（第 ⑤ 站）。`,
        T`**解释为什么会 overfit：bias–variance**。期望平方误差 = $\text{bias}^2$ + variance + 不可约的噪声。简单模型 bias 大（学不像），复杂模型 variance 大（换一批数据结果就变），所以测试误差随复杂度先降后升，呈 U 形。`,
        T`**理论上能保证多少：泛化界**。真实风险 $R[f]$ 看不到，只能看训练集上的经验风险 $\hat R[f]$。ERM 选 $\hat R$ 最小的那个，但这个数偏乐观。单个 $f$ 用 Hoeffding 就能说明二者差不多；有限个模型再加 union bound，得到 $R[\hat f]\le\hat R[\hat f]+\sqrt{\frac{\log|\mathcal F|+\log(1/\delta)}{2n}}$。**模型类越大，界越松；数据越多，界越紧。**`,
        T`**线性分类器有无穷多个**，$\log|\mathcal F|$ 就没法用了。关键观察：无穷多个分类器在 $n$ 个点上能分出的标签组合（dichotomy）最多只有 $2^n$ 种。数这个种数就是 growth function $S_{\mathcal F}(n)$；$n$ 个点的 $2^n$ 种全能实现，叫 shattered；能 shatter 的最大 $n$ 就是 **VC dimension**。拿它代替 $\log|\mathcal F|$，就得到 VC 界。考试就是画 dichotomy 表、证明 VC 维（平面上的轴对齐矩形是 4）。`) },
      next(2),
      exam(2, '2.1、2.2（共线性与 ridge、VC 维）'),
      chain(2),

      h(3),
      { t: 'p', md: P(
        T`**SVM 的回答：选 margin 最大的那条**。点到超平面的距离是 $\frac{y_i(\bw'\bx_i+b)}{\|\bw\|}$。把离边界最近的点的距离（margin）做到最大，等价于 $\min\tfrac12\|\bw\|^2$ s.t. $y_i(\bw'\bx_i+b)\ge1$，这是 hard margin。margin 大，对扰动就不敏感，这也是在控制复杂度。边界只由贴在 margin 上的点决定，这些点叫 **support vectors**（mock 看图找支持向量考的就是这个）。`,
        T`**分不开怎么办：soft margin**。允许点越界，越界的量记作 slack $\xi_i$，目标加上 $C\sum_i\xi_i$。$\xi_i=0$ 分对且在 margin 外；$0<\xi_i<1$ 分对但进了 margin；$\xi_i=1$ 正好在决策边界上；$\xi_i>1$ 分错。它等价于 hinge loss $\max(0,1-y_i(\bw'\bx_i+b))$ 加 $\|\bw\|^2$ 正则：$C$ 越大，正则越弱，又回到第 ② 站。`,
        T`**对偶（dual）与 kernel trick**。用 Lagrangian 和 KKT 把问题换成 dual：$\max_\lambda\sum_i\lambda_i-\tfrac12\sum_i\sum_j\lambda_i\lambda_jy_iy_j\,\bx_i'\bx_j$，只有 support vectors 的 $\lambda_i>0$。dual 里数据**只以点积 $\bx_i'\bx_j$ 出现**，把点积换成 $K(\bx_i,\bx_j)=\varphi(\bx_i)'\varphi(\bx_j)$，就等于在高维特征空间里做线性分类，却不用真的算出 $\varphi$。kernel 就是第 ① 站 basis expansion 的隐式版本。$K$ 必须合法（Mercer：Gram 矩阵半正定），证明靠构造规则：和、积、正数倍、$f(\bu)K(\bu,\bv)f(\bv)$ 都仍然合法。`,
        T`**Perceptron：最简单的线性分类器**。一次看一个点，$y\,s\le0$（分错或正好在边界上）就更新 $\bw\leftarrow\bw+\eta y\bx$。这就是对 perceptron loss $\max(0,-sy)$ 做 SGD；它和 hinge loss 只差那个 1，perceptron 不要求 margin。数据线性可分时一定收敛，更新次数 $\le R^2/\gamma^2$。它的更新也只用到点积，同样能 kernel 化。`) },
      next(3),
      exam(3, '3.2（perceptron）'),
      chain(3),

      h(4),
      { t: 'p', md: P(
        T`**把 perceptron 叠起来**。一个 perceptron 只能画一条直线，XOR 分不开。中间加一层隐藏单元，配上非线性激活（sigmoid、ReLU），就是 **MLP**。隐藏层就是**自己学出来的特征**：第 ① 站是人工加特征，第 ③ 站是人工挑 kernel，这里让网络自己学。`,
        T`**训练还是第 ① 站的套路**：定一个 loss，用 (S)GD 走。难点是求每个权重的梯度，**backpropagation** 就是链式法则：先前向算出每层的输出，再从输出往回传误差 $\delta$；每个权重的梯度 = 后一层的 $\delta$ × 前一层的输出。`,
        T`**训练技巧**：优化器（momentum、Adagrad、Adam）让步长更聪明；正则化防 overfitting，weight decay 就是第 ② 站的 ridge，另外还有 dropout、early stopping。**Autoencoder** 让网络把输入压成低维再还原，中间那层就是降维结果；单隐藏层、线性激活、平方误差时，它学到的子空间和 PCA 相同，但基不一定正交、也不按方差排序。`,
        T`**按数据的结构设计网络**。图像用 **CNN**：一个小卷积核在整张图上滑，权重共享，参数只有 $C_{out}\cdot C_{in}\cdot K^2\,(+C_{out})$，和图多大无关；pooling 缩小尺寸，带来一点平移不变性。序列用 RNN / LSTM：同一组权重沿时间重复用，LSTM 用门缓解梯度消失。整句压成一个向量会丢信息，**attention** 让每一步对所有位置加权求和，Transformer 全靠 attention。`) },
      next(4),
      exam(4, '3.1、4.1（autoencoder 与 PCA、卷积）'),
      chain(4),

      h(5),
      { t: 'p', md: P(
        T`**评估**：按任务选指标（accuracy、precision / recall 等）；超参数用 validation 选，数据少就用 **k-fold CV**（轮流留一折做验证，取平均）；比较两个算法要看差异是否显著（t 检验）。test set 只在最后用一次。`,
        T`**在线学习：learning with expert advice**。每轮 $n$ 个专家各给一个预测，你综合出自己的预测，然后能看到**所有专家**的对错。用 mistake bound 衡量：你犯错的次数最多比最好的专家多多少。有完美专家时，多数投票、删掉犯错的专家（halving），$M\le\log_2 n$；没有完美专家就用 **weighted majority**：犯错专家的权重乘 $(1-\varepsilon)$，$M\le2(1+\varepsilon)m+\frac{2\ln n}{\varepsilon}$，$m$ 是最好专家的错误数。`,
        T`**Bandits：只看到自己选的那个**。每轮拉一个臂（arm），只看到这个臂的奖励，别的臂看不到，这是和 experts 的根本区别。所以必须在 **explore**（试没把握的臂）和 **exploit**（拉目前最好的臂）之间取舍，好坏用 cumulative regret 衡量。greedy 只 exploit，可能永远卡在差臂上；ε-greedy 以概率 ε 随机探索；**UCB** 更聪明：$Q_{t-1}(i)=\hat\mu_{t-1}(i)+\sqrt{\frac{2\ln t}{N_{t-1}(i)}}$，拉得少的臂 $N$ 小、加分大，对"没把握"的臂乐观。`,
        T`**Contextual bandit**：每轮先看到特征（比如用户信息），估奖励变成回归问题（第 ① 站），再加 UCB 式的探索奖励。再进一步，动作会影响下一个状态，就是 reinforcement learning。`) },
      next(5),
      exam(5, '4.2、5.1（experts、bandits）'),
      chain(5),

      h(6),
      { t: 'p', md: P(
        T`**回到第 ① 站的 Bayesian 那条路，这次走到底**。MLE 和 MAP 都只给一个点估计；完整的 Bayesian 保留整个后验 $p(\bw\mid D)$，预测时对所有 $\bw$ 加权平均。`,
        T`**Bayesian linear regression**：Gaussian prior $\bw\sim\mathcal N(\mathbf 0,\gamma^2I)$ 乘 Gaussian 似然，后验仍是 Gaussian（共轭），后验均值 $\bw_N$ 正好是 $\lambda=\sigma^2/\gamma^2$ 的 ridge 解，又一次"正则 = 先验"。预测分布 $y_*\sim\mathcal N(\bx_*'\bw_N,\ \sigma^2+\bx_*'V_N\bx_*)$：方差 = 噪声 + 参数的不确定性，离训练数据越远第二项越大，**模型知道自己哪里没把握**。`,
        T`**用 evidence 选模型**：marginal likelihood $p(\by\mid\bX)=\int p(\by\mid\bX,\bw)\,p(\bw)\,d\bw$ 对所有参数取平均。模型太简单拟合不好，太复杂会把概率摊薄，所以它自带复杂度惩罚，可以直接拿来选模型或超参数。`,
        T`**共轭（conjugacy）**：prior 和 posterior 属于同一族，更新只是改参数。Beta–Binomial：先验 $\mathrm{Beta}(\alpha,\beta)$，看到 $k$ 次成功、$n-k$ 次失败，后验是 $\mathrm{Beta}(\alpha+k,\ \beta+n-k)$，**就是把计数加到参数上**。MLE $\frac kn$、MAP $\frac{k+\alpha-1}{n+\alpha+\beta-2}$、后验均值 $\frac{\alpha+k}{\alpha+\beta+n}$ 三者的区别是常考点。Bayesian logistic regression 没有共轭先验，后验只能近似。`) },
      next(6),
      exam(6, '5.2（Beta–Binomial）'),
      chain(6),

      h(7),
      { t: 'p', md: P(
        T`**核心想法：用条件独立把一张大表拆成很多小表**。$n$ 个二值变量的联合分布要 $2^n-1$ 个数；如果每个变量只直接依赖少数几个变量，就只需要很多张小表。`,
        T`**表示（W10）**
- **Bayesian network**（有向无环图）：$P(x_1,\dots,x_n)=\prod_iP(x_i\mid x_{pa_i})$，每个节点一张 CPT，自由参数 $(k-1)\prod_{p\in pa}k_p$。mock Q6、2025 Q6 就是：读题画图，写因子分解，数 CPT 参数。
- **D-separation** 从图上直接读条件独立：祖先图 → moralize（父节点两两连边）→ 去方向 → 删掉条件节点 → 不连通就独立。
- **MRF**（无向图）：没有方向的关系用团上的 potential 相乘再归一化，$P=\frac1Z\prod_c\psi_c(\mathbf x_c)$。判条件独立更简单：删掉条件节点后不连通就独立。`,
        T`**推断（W11）**：模型建好后用来回答 $P(\text{query}\mid\text{evidence})$。直接对联合分布求和是指数级。**Elimination** 一次消一个变量：把含它的因子乘起来再求和，代价取决于消元顺序。在树上把它组织成 **message passing**（belief propagation），每条边两个方向的消息都算完，所有节点的边缘分布就都有了。图里有环时，按消元顺序记下产生的团（删点前把它的邻居两两相连），只留极大团，按交集大小连最大权生成树，得到 **junction tree**，再在树上传消息。`,
        T`**学习（W12）**：前两周图和参数都是给定的，现在从数据里学。BN 参数的 MLE 就是**数数**：$\hat\theta=\frac{\#(x_i=k,\ pa_i=j)}{\#(pa_i=j)}$，也就是第 ① 站抛硬币的 $k/n$，按父节点的取值分组来数。结构靠打分加搜索：BIC = 对数似然 − 参数个数 × $\frac{\log T}{2}$（又是"拟合好"对"别太复杂"，和第 ② 站是同一件事），或者 Bayesian score（第 ⑥ 站的 evidence）。骨架和 v-structure 都相同的图是等价的，数据分不出来。MRF 的参数满足 moment matching；树结构用互信息当边权，取最大权生成树。`) },
      { t: 'good', title: '绕回起点', md: '第 ⑦ 站学参数用的是第 ① 站的 MLE；选结构用的是第 ② 站的"拟合 vs 复杂度"和第 ⑥ 站的 evidence。整门课是一个圈。' },
      exam(7, '6.1、6.2（消元找团、D-separation）'),
      chain(7),

      { t: 'h2', text: '四条线：站与站怎么连', id: 'threads' },
      { t: 'table', head: ['线', '经过的站', '一句话'], rows: [
        ['**概率线**', 'MLE（①）→ MAP（①②）→ 完整后验（⑥）→ 很多变量的联合分布（⑦）', '从"估一个数"到"估一个分布"，再到"估一张图上的分布"；学 CPT 又回到 MLE 数数。'],
        ['**复杂度线**', 'regularisation、bias–variance、VC（②）→ max margin、$C$（③）→ weight decay、dropout（④）→ evidence（⑥）→ BIC（⑦）', '每一站都在平衡"拟合训练数据"和"模型别太复杂"。'],
        ['**特征线**', '线性、basis expansion（①）→ kernel（③）→ 神经网络自己学（④）→ CNN / RNN 按数据结构设计（④）', '都是先把数据变换到线性可分的空间，再用线性模型。'],
        ['**决策线**', 'experts 看到全部（⑤）→ bandits 只看到自己选的（⑤）→ contextual bandit 带特征（⑤）', '看到的信息越少，越要探索；UCB 的加分就是不确定性，接到 ⑥。'],
      ] },

      { t: 'h2', text: '同一个东西换了名字', id: 'same' },
      { t: 'p', md: '简答题最爱考这些对应关系。每条括号里是出现的站。' },
      { t: 'ul', items: [
        T`最小二乘 = Gaussian 噪声下的 MLE（①）`,
        T`ridge = Gaussian prior 的 MAP = Bayesian 线性回归的后验均值 = 神经网络的 weight decay（② ⑥ ④）`,
        T`lasso = Laplace prior 的 MAP（②）`,
        T`cross-entropy loss = Bernoulli 似然取负 log（① ④）`,
        T`perceptron loss $\max(0,-sy)$ 和 hinge loss $\max(0,1-sy)$ 只差 margin 的那个 1（③）`,
        T`kernel = 隐式的 basis expansion（① ③）`,
        T`CPT 的 MLE = 抛硬币的 MLE，数频率（① ⑦）`,
        T`Beta–Binomial 后验 = 把计数加到先验参数上（⑥）`,
        T`regularisation、VC 界、evidence、BIC 都是"拟合 + 复杂度惩罚"（② ⑥ ⑦）`,
      ] },

      { t: 'good', title: '读完怎么算懂了', md: '合上页面，按顺序说出 7 站，再说出 6 个箭头各是什么新问题。说不出的那一站回去再读一遍，然后去[冲刺页](#/sprint)从第 1 项开始做。冲刺页每一项的标题下面也写着它属于第几站，做题时卡住可以点回来看。' },
    ],
  });
})(window);
