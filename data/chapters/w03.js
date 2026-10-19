/* W3 · L05 正则化与 bias-variance + L06 有限类泛化 — chapters c16–c21 and review r03. */
(function (root) {
  'use strict';
  const SML = root.SML;
  const T = String.raw;
  const add = (c) => SML.content.add(SML.chapter(c));

  /* =====================================================================
   * c16 · 共线性与 Ridge（L05 p3–p16）
   * ===================================================================== */
  add({
    id: 'c16', week: 'W3', lec: 'L05', pages: 'L05 p3–p16', star: 2,
    title: '共线性与 Ridge', en: 'Irrelevant features, ill-posed problems, ridge regression',
    summary: '特征共线（multicollinearity，多重共线性）或样本太少时，$\\mathbf X\'\\mathbf X$ 不可逆，最小二乘有无穷多解、权重没法解释。**Ridge regression（岭回归）** 在 RSS 上加 $\\lambda\\|\\bw\\|_2^2$，等价于给 $\\mathbf X\'\\mathbf X$ 的每个特征值加 $\\lambda$，从而总可逆、解唯一。',
    prereq: ['c04', 'c11'],
    symbols: [
      [T`$\mathbf X_{\cdot j}$`, T`数据矩阵的第 $j$ 列（所有样本的第 $j$ 个特征）`],
      [T`$\lambda$`, T`正则化强度（regularisation parameter），$\lambda>0$；本章它**不是**特征值`],
      [T`$\|\bw\|_2^2$`, T`$\sum_jw_j^2$，权重的平方 $L_2$ 范数`],
      [T`$\mathbf I$`, T`单位矩阵`],
      [T`$\delta$`, T`本章表示任意一个实数扰动量`],
      [T`RSS`, T`residual sum of squares（残差平方和）$\|\by-\mathbf X\bw\|_2^2$（c10）`],
      [T`PSD`, T`positive semi-definite（半正定）：$\bv'\mathbf A\bv\ge0$，特征值全 $\ge0$（c04）`],
    ],
    goals: [
      '说出 **regularisation（正则化）** 的三个作用（L05 p3）',
      '用 L05 p6 的"克隆特征"例子解释为什么共线会让解不唯一、权重不可解释',
      '区分 **ill-posed（不适定）** 和 **ill-conditioned（病态，数值不稳定）**',
      '写出 ridge 的目标和闭式解 $(\\mathbf X\'\\mathbf X+\\lambda\\mathbf I)^{-1}\\mathbf X\'\\by$，并说明为什么总可逆',
    ],
    types: ['T13'],
    what: [
      T`c11 的最小二乘有一个隐患：公式 $(\mathbf X'\mathbf X)^{-1}\mathbf X'\by$ 里的逆**不一定存在**（c04 的"米 / 厘米"例子）。课件给了两种会坏掉的情况，其实是同一件事：$\mathbf X'\mathbf X$ 有 0 特征值、不可逆，RSS 的谷底是**平的**，好多组 $\bw$ 预测得一样好，"哪个特征更重要"也说不清。先把坏掉的情形看清楚，再看怎么修。`,
      T`**问题 1：无关/重复特征**（L05 p5–p9）。课件例子：$\mathbf X$ 的第 1、2 列完全相同（"克隆"了一个特征）：`,
      { t: 'math', tex: T`\mathbf X=\begin{bmatrix}3&3&7\\6&6&9\\21&21&79\\34&34&2\end{bmatrix}` },
      T`若某个解是 $(\hat w_1,\hat w_2,\hat w_3)$，那么 $(\hat w_1+\delta,\ \hat w_2-\delta,\ \hat w_3)$ 对任意 $\delta$ 给出**完全一样的预测**（因为 $x_1=x_2$，$(w_1+\delta)x_1+(w_2-\delta)x_2=(w_1+w_2)x_1$）。所以解有无穷多个，"哪个特征更重要"也无从谈起（L05 p6–p8）。`,
      T`更一般地，**multicollinearity（多重共线性）**：某一列是其他列的线性组合 $\mathbf X_{\cdot j}=\sum_{l\ne j}\alpha_l\mathbf X_{\cdot l}$ ⇔ $\mathbf X'\mathbf X$ 有零特征值、$\det=0$、不可逆（L05 p9）。`,
      T`**问题 2：数据太少**（L05 p10）。只有 1 个点却要拟合斜率和截距两个参数——过这个点的直线有无穷多条。$n<p$ 时同样不可逆（**underdetermined system，欠定方程组**）。`,
      T`**怎么修**：平谷底上的解都一样好，那就再加一条偏好——**权重越小越好**。在 RSS 上加 $\lambda\|\bw\|_2^2$（$\lambda>0$），相当于叠上一个以原点为中心的碗，把平谷底"翘"成唯一的最低点。代数上：$\mathbf X'\mathbf X$ 的每个特征值都加了 $\lambda$，全部 $\ge\lambda>0$，所以 $\mathbf X'\mathbf X+\lambda\mathbf I$ 一定可逆，闭式解总存在。这就是：`,
      T`**Ridge regression（岭回归）**（L05 p14）：`,
      { t: 'math', tex: T`\hat\bw=\argmin_\bw\ \|\by-\mathbf X\bw\|_2^2+\lambda\|\bw\|_2^2=(\mathbf X'\mathbf X+\lambda\mathbf I)^{-1}\mathbf X'\by,\qquad\lambda>0` },
      T`$\lambda$ 越大，权重越被压向 0。这种"给学习问题加一条额外偏好"的做法有一个总称：`,
      T`**Regularisation（正则化）**（L05 p3）：给学习问题加入额外信息，用来解决 ill-posed 问题或防止 overfitting。课件列了三个作用：① 数值上：修好"病态"的计算（**ill-conditioning**）；② 统计上：防止 **overfitting（过拟合）**；③ 加入先验知识（**prior knowledge**）。`,
    ],
    why: [
      T`L05 讲者反复强调："Regularization is very, very important… you'll see it come again and again"——正则化会以不同形式贯穿后面所有内容：lasso（c17）、多项式过拟合（c18）、SVM 的 $\|\bw\|^2$（c26）、神经网络的 weight decay 和 dropout（c36）。`,
      T`考试角度：*Why does ridge help with collinear features?* 是 T13 的高概率简答题。`,
    ],
    intuition: [
      T`**平底山谷 vs 碗。** 共线时 RSS 曲面沿着 $w_1+w_2=$ 常数的方向是**平的**（L05 p11：一条水平的谷底）——凸但不严格凸，谷底每一点都是最优。加上 $\lambda\|\bw\|^2$（一个以原点为中心的碗）后，整个曲面在所有方向都向上弯，变成**严格凸**，最低点唯一（L05 p14）。`,
      T`**特征值加 $\lambda$。** $\mathbf X'\mathbf X$ 是 PSD，特征值 $\ge0$；有 0 就不可逆。$\mathbf X'\mathbf X+\lambda\mathbf I$ 的特征值是原来的每个加 $\lambda$（若 $\bv$ 是 $\mathbf A$ 的特征向量、特征值 $\mu$，则 $(\mathbf A+\lambda\mathbf I)\bv=\mathbf A\bv+\lambda\bv=(\mu+\lambda)\bv$——同一个特征向量，特征值加 $\lambda$），全部 $\ge\lambda>0$ ⇒ 正定 ⇒ 可逆。`,
      { t: 'think', q: T`在克隆特征的例子里，ridge 会怎么在 $w_1$ 和 $w_2$ 之间"分配"？`, a: T`平均分配。因为 $w_1+w_2$ 固定时，$w_1^2+w_2^2$ 在 $w_1=w_2$ 时最小——ridge 惩罚偏好"把权重摊开"。下面例 1 就算出 $w_1=w_2$。` },
      { t: 'story', title: 'Ridge 名字的由来', md: 'Hoerl 和 Kennard 在 1970 年提出 ridge regression，用来处理工程数据里的共线问题。名字来自他们分析时画的"ridge trace"（岭迹）——系数随 $\\lambda$ 变化的曲线。同样的想法在数学里更早就有，叫 Tikhonov 正则化。' },
    ],
    math: [
      { t: 'h3', text: '推导闭式解' },
      { t: 'steps', items: [
        T`目标 $L(\bw)=\|\by-\mathbf X\bw\|^2+\lambda\bw'\bw$。`,
        T`梯度 $\nabla L=-2\mathbf X'\by+2\mathbf X'\mathbf X\bw+2\lambda\bw$（第三项：$\nabla(\bw'\bw)=2\bw$）。`,
        T`令为 0：$(\mathbf X'\mathbf X+\lambda\mathbf I)\bw=\mathbf X'\by$ ⇒ $\hat\bw=(\mathbf X'\mathbf X+\lambda\mathbf I)^{-1}\mathbf X'\by$。`,
      ] },
      T`和 c11 的 normal equations 只差一个 $\lambda\mathbf I$。$\lambda\to0$ 回到最小二乘；$\lambda\to\infty$ 时 $\hat\bw\to\mathbf 0$。`,
      { t: 'h3', text: 'Ill-posed vs ill-conditioned（L05 p3，讲者强调）' },
      T`上面两种情况（克隆特征、$n<p$）都是特征值**正好为 0**：解不唯一，叫 ill-posed（不适定）。如果两列只是**几乎**相同，解仍然唯一，但数据稍微一动，权重就跳得很远，叫 ill-conditioned（病态）。ridge 对两种都有效：每个特征值加 $\lambda$，0 变成正数，接近 0 的也不再接近 0。`,
      { t: 'table', head: ['', 'Ill-posed（不适定）', 'Ill-conditioned（病态 / 数值不稳定）'], rows: [
        ['是什么', '数学上解不存在或不唯一', '解唯一，但对微小扰动极其敏感'],
        ['$\\mathbf X\'\\mathbf X$', '有特征值**等于** 0（不可逆）', '有特征值**接近** 0'],
        ['例子', '完全相同的两列；$n<p$', '两列几乎相同'],
        ['ridge 的作用', '让解存在且唯一', '让解数值稳定'],
      ] },
      { t: 'note', title: '关于截距', md: T`实践中通常**不惩罚截距** $w_0$（否则平移 $y$ 会改变结果）。课件公式写的是对整个 $\bw$ 加 $\lambda\mathbf I$，考试按课件写即可。` },
    ],
    fx: [
      {
        title: 'Ridge 的闭式解', tex: T`\hat\bw=\big(\htmlClass{fx-p1}{\mathbf X'\mathbf X}+\htmlClass{fx-p2}{\lambda\mathbf I}\big)^{-1}\htmlClass{fx-p3}{\mathbf X'\by}`,
        parts: [
          { label: "X'X", note: 'PSD 矩阵，共线或 $n<p$ 时有零特征值。' },
          { label: 'λI', note: '对角线全加 $\\lambda$ ⇒ 每个特征值加 $\\lambda$ ⇒ 全部 $\\ge\\lambda>0$，**一定可逆**。$\\lambda$ 越大，权重被压得越小。' },
          { label: "X'y", note: '和最小二乘一样。' },
        ],
      },
    ],
    example: [
      { t: 'h3', text: '例 1：克隆特征 + ridge' },
      T`$\mathbf X=\begin{bmatrix}1&1\\2&2\end{bmatrix}$（两列相同，无截距），$\by=(1,2)'$。`,
      { t: 'steps', items: [
        T`$\mathbf X'\mathbf X=\begin{bmatrix}5&5\\5&5\end{bmatrix}$（两列都是 $(1,2)'$，每格都是 $1^2+2^2=5$），特征值 10 和 0（c04 公式：中点 5、半径 5，$5\pm5$）⇒ 不可逆。两列相同，预测是 $(w_1+w_2)\times(1,2)'$，要等于 $\by=(1,2)'$ 只需 $w_1+w_2=1$——所以最小二乘的解是所有满足 $w_1+w_2=1$ 的点。`,
        T`$\lambda=1$：$\mathbf X'\mathbf X+\mathbf I=\begin{bmatrix}6&5\\5&6\end{bmatrix}$，特征值 11 和 1，可逆。`,
        T`$(\cdot)^{-1}=\frac1{11}\begin{bmatrix}6&-5\\-5&6\end{bmatrix}$，$\mathbf X'\by=(5,5)'$ ⇒ $\hat\bw=\frac1{11}(30-25,\ -25+30)=(\frac5{11},\frac5{11})\approx(0.455,0.455)$。`,
        T`两个克隆特征平分权重；和 $0.909<1$——被往 0 方向压缩了一点。`,
      ] },
      { t: 'h3', text: '例 2：一维看 shrinkage（收缩）' },
      T`无截距，$x=(1,2,3)$，$y=(2,4,6)$：$\bx'\bx=14$，$\bx'\by=28$。最小二乘 $w=28/14=2$；ridge $w=\frac{28}{14+\lambda}$：$\lambda=1\Rightarrow1.867$，$\lambda=14\Rightarrow1$，$\lambda\to\infty\Rightarrow0$。**永远不会恰好等于 0**——这点和 lasso（c17）不同。`,
      { t: 'fade', title: '分步练习：一维 ridge', plan: [T`算 $\bx'\bx$、$\bx'\by$`, T`$w=\bx'\by/(\bx'\bx+\lambda)$`], items: [
        { md: T`$x=(1,2,3)$，$y=(2,4,6)$，$\lambda=1$。`, steps: [
          { md: T`$\bx'\bx=1^2+2^2+3^2=14$，$\bx'\by=1\times2+2\times4+3\times6=28$` },
          { md: T`$w=28/15\approx1.867$` },
        ] },
        { md: T`$x=(1,1)$，$y=(1,3)$，$\lambda=2$。已知 $\bx'\bx=2$，$\bx'\by=4$。`, steps: [
          { ask: '$w=?$', answer: 1, show: T`$4/(2+2)=1$（最小二乘是 2）` },
        ] },
        { md: T`$x=(1,2)$，$y=(3,1)$，$\lambda=5$。`, steps: [
          { ask: T`$\bx'\by=?$`, answer: 5, show: '$3+2=5$' },
          { ask: '$w=?$', answer: 0.5, show: T`$\bx'\bx=5$，$5/(5+5)=0.5$` },
        ] },
      ] },
    ],
    viz: [
      { id: 'reg-path', how: '5 个特征的真实权重是 $(3,-2,0,0,1.5)$。横轴是 $\\log_{10}\\lambda$，每条曲线是一个权重随 $\\lambda$ 的变化（ridge trace，岭迹），竖线是当前 $\\lambda$。',
        try: '选 ridge，把 $\\lambda$ 从最小拉到最大：所有权重平滑地一起收缩到 0 附近，但都不恰好为 0。先记住这个样子，第 17 章切到 lasso 对比。' },
      { id: 'poly-fit', opts: { degree: 9, ridge: true, test: true }, how: '9 次多项式拟合 12 个点（和第 12 章同一个工具），这次多了 ridge 的 $\\lambda$ 滑块。',
        try: '$\\lambda=0$ 时曲线剧烈摆动、测试 MSE 很大；把 $\\lambda$ 慢慢加大，曲线变平滑、$\\|\\bw\\|$ 变小、测试 MSE 先降后升。这就是 L05 p27 Bishop 图的内容。' },
    ],
    compare: [
      { t: 'table', head: ['', '最小二乘', 'Ridge'], rows: [
        ['目标', '$\\|\\by-\\mathbf X\\bw\\|^2$', '$\\|\\by-\\mathbf X\\bw\\|^2+\\lambda\\|\\bw\\|_2^2$'],
        ['解', '$(\\mathbf X\'\\mathbf X)^{-1}\\mathbf X\'\\by$（若可逆）', '$(\\mathbf X\'\\mathbf X+\\lambda\\mathbf I)^{-1}\\mathbf X\'\\by$（总可逆）'],
        ['共线 / $n<p$', '无穷多解', '唯一解'],
        ['损失曲面', '可能有平底（凸但非严格凸）', '严格凸'],
        ['权重', '可能很大、不稳定', '被压小（shrinkage）'],
      ] },
      { t: 'exam', md: T`**Why does ridge regression help when features are (nearly) collinear?** With collinear features $\mathbf X'\mathbf X$ has (near-)zero eigenvalues, so it is singular or ill-conditioned and least squares has no unique/stable solution. Ridge adds $\lambda\|\mathbf w\|_2^2$, giving $\hat{\mathbf w}=(\mathbf X'\mathbf X+\lambda\mathbf I)^{-1}\mathbf X'\mathbf y$; adding $\lambda>0$ to every eigenvalue makes the matrix positive definite, hence invertible, so the solution is unique and stable with smaller weights.` },
    ],
    pitfalls: [
      ['共线时最小二乘没有解', '有解，只是**无穷多个**（不唯一）。'],
      ['Ridge 会把无关特征的权重压成 0', '通常只压小、得到非稀疏（dense）解；它没有 lasso 那种把系数"截断"为 0 的机制（个别数据下系数可能碰巧为 0）。要稀疏用 lasso。'],
      ['$\\lambda$ 越大越好', '太大会欠拟合（$\\hat\\bw\\to\\mathbf 0$）；用验证集 / CV 选（c43）。'],
      ['ill-posed 和 ill-conditioned 是一回事', '一个是解不唯一/不存在，一个是解唯一但数值不稳定。'],
    ],
    quiz: [
      {
        type: 'set',
        q: [
          T`（平时小测原题）Irrelevant features can cause problems with computation, interpretation and statistical performance. The table shows three features (columns) for four instances (rows). Which features can be written as a linear combination of the other two? (Select all: 1 = $x_1$, 2 = $x_2$, 3 = $x_3$.)`,
          { t: 'table', head: ['$x_1$', '$x_2$', '$x_3$'], rows: [['−2', '−2', '1'], ['0.5', '1', '−0.5'], ['8', '8', '−4'], ['−6', '−6', '3']] },
        ],
        qzh: T`无关或多余的特征会给计算、解释和统计效果带来麻烦。表里是 4 个样本（行）的 3 个特征（列）。哪些特征能写成另外两个特征的线性组合？（多选，填编号：1 = $x_1$，2 = $x_2$，3 = $x_3$。）`,
        answer: ['2', '3'],
        explain: T`"能写成线性组合"就是存在系数 $a,b$ 让这一列 $=a\times$另一列 $+b\times$第三列。逐行比：$x_2=(-2,1,8,-6)$ 正好是 $x_3=(1,-0.5,-4,3)$ 的 $-2$ 倍，所以 $x_2=0\cdot x_1-2x_3$，反过来 $x_3=0\cdot x_1-0.5x_2$。$x_1$ 不行：$x_2$、$x_3$ 指向同一个方向，它们怎么组合都只是 $x_3$ 的倍数，而 $x_1$ 和 $x_3$ 的逐项比值是 $-2,-1,-2,-2$，不全相等，不是 $x_3$ 的倍数。**答案 2、3**。这种"列线性相关"会让 $\mathbf X'\mathbf X$ 不可逆，正是本章 ridge 要解决的问题。`,
      },
      { type: 'num', q: '$\\mathbf X\'\\mathbf X$ 的特征值是 4 和 0，$\\lambda=0.5$。$\\mathbf X\'\\mathbf X+\\lambda\\mathbf I$ 的最小特征值？', answer: 0.5, explain: '每个特征值加 $\\lambda$：4.5 和 0.5。' },
      { type: 'num', q: '一维无截距 ridge：$\\bx\'\\bx=10$，$\\bx\'\\by=20$，$\\lambda=10$。$w=?$', answer: 1, explain: T`一维无截距的 ridge regression（岭回归）的解是 $w=\dfrac{\bx'\by}{\bx'\bx+\lambda}$：和最小二乘 $w=\bx'\by/\bx'\bx$ 相比，只是分母多加了 $\lambda$。题目给 $\bx'\by=20$、$\bx'\bx=10$、$\lambda=10$。$w=\dfrac{20}{10+10}=\dfrac{20}{20}=1$。对比最小二乘 $w=20/10=2$：**惩罚把权重从 2 压到了 1**，这就是 shrinkage（收缩）。` },
      { type: 'mc', q: '下面哪个**不是** L05 p3 列出的正则化作用？', options: ['改善 ill-conditioning', '防止 overfitting', '加入先验知识', '保证训练误差为 0'], answer: 3, explain: '正则化通常会**增加**训练误差。' },
      { type: 'mc', q: '只有 1 个训练点却要拟合 $y=w_0+w_1x$，最小二乘会：', options: ['唯一解', '无解', '无穷多解（欠定）', '解是 0'], answer: 2, explain: 'L05 p10：过一个点的直线有无穷多条。' },
      { type: 'show', q: '（英文）What is the difference between an ill-posed and an ill-conditioned problem?', answer: T`An ill-posed problem has no solution or no unique solution (e.g. $\mathbf X'\mathbf X$ singular because of collinear features or $n<p$). An ill-conditioned problem has a unique solution, but $\mathbf X'\mathbf X$ has near-zero eigenvalues, so tiny perturbations of the data cause large changes in the solution.`, qzh: '不适定（ill-posed）问题和病态（ill-conditioned）问题有什么区别？', azh: T`不适定（ill-posed）问题没有解或解不唯一（例如由于特征共线（collinear features）或 $n<p$，导致 $\mathbf X'\mathbf X$ 奇异（singular））。病态（ill-conditioned）问题有唯一解，但 $\mathbf X'\mathbf X$ 有接近 0 的特征值（eigenvalues），因此数据的微小扰动会让解发生很大变化。` },
    ],
  });

  /* =====================================================================
   * c17 · Lasso、正则化 = MAP（L05 p15–p19）
   * ===================================================================== */
  add({
    id: 'c17', week: 'W3', lec: 'L05', pages: 'L05 p15–p19', star: 3,
    title: 'Lasso、正则化 = MAP', en: 'Lasso, sparsity, and regularisation as MAP',
    summary: '**Lasso** 用 $L_1$ 惩罚 $\\lambda\\|\\bw\\|_1$，能把一些权重压成**恰好 0**（稀疏 sparse，自动做特征选择）。两种正则化都是 MAP：ridge = Gaussian 先验，lasso = Laplace 先验。这是"第三条路"——Bayesian 视角下的正则化。',
    prereq: ['c08', 'c16'],
    symbols: [
      [T`$\|\bw\|_1$`, T`$\sum_j|w_j|$，$L_1$ 范数`],
      [T`$\bw\sim\mathcal N(\mathbf 0,\frac1\lambda\mathbf I)$`, T`每个权重独立、均值 0、方差 $1/\lambda$ 的 Gaussian 先验`],
      [T`$p(\bw)\propto e^{-\alpha\|\bw\|_1}$`, T`Laplace prior（拉普拉斯先验）：在 0 处尖峰；$\alpha$ 是先验参数`],
      [T`MAP`, T`maximum a posteriori（最大后验估计），c08`],
      [T`$R(\boldsymbol\theta)$`, T`本章：正则项（regulariser）。注意第 20 章的 $R[f]$ 是真实风险，不是一回事`],
      [T`$\text{s.t.}$`, T`subject to（约束条件）`],
    ],
    goals: [
      '写出 lasso 目标，说出它和 ridge 的三点区别（稀疏、无闭式解、先验）',
      '用"菱形 vs 圆"的几何图解释为什么 $L_1$ 产生稀疏解',
      '推导：Gaussian 先验下的 MAP = ridge（L05 p15–p16）',
      '默写 L05 p18 的三列对比表',
    ],
    types: ['T13', 'T09'],
    what: [
      { t: 'h3', text: '① 问题：ridge 只会把权重压小，压不成 0' },
      T`c16 的 ridge 修好了"不可逆"，但留下一个缺口：一维时它的解是 $w=\bx'\by/(\bx'\bx+\lambda)$——只是分母变大、$w$ 变小，除非 $\bx'\by$ 本来就是 0，否则**永远不会恰好等于 0**。如果有很多特征根本没用，我们更希望它们的权重**直接是 0**，等于自动把它们扔掉（特征选择）。办法：把惩罚从"平方和"换成"绝对值之和"。平方在 0 附近是圆滑的，最优点停在 0 旁边；绝对值在 0 处有一个尖角，最优点可以正好卡在 0 上。`,
      { t: 'h3', text: '② 换成 $L_1$ 惩罚：lasso（L05 p17）' },
      T`**Lasso**（Least Absolute Shrinkage and Selection Operator，L05 p17–p18）：`,
      { t: 'math', tex: T`\hat\bw=\argmin_\bw\ \|\by-\mathbf X\bw\|_2^2+\lambda\|\bw\|_1` },
      T`特点：解是**稀疏的（sparse）**——很多权重恰好为 0，相当于自动做了**特征选择（feature selection）**；**没有闭式解**（$|w|$ 在 0 处不可导），要数值优化；适合 $p\gg n$（特征远多于样本）的高维数据。`,
      T`**约束形式**（L05 p17）：等价地可以写成"在一个范数球里找 RSS 最小的点"：ridge 是 $\min\|\by-\mathbf X\bw\|^2$ s.t. $\|\bw\|_2^2\le t$（圆 / 球），lasso 是 s.t. $\|\bw\|_1\le t$（菱形）。（课件约束里也用 $\lambda$ 表示约束的大小，这里改写成 $t$，以免和惩罚系数 $\lambda$ 混淆。适当选择 $t$ 和 $\lambda$ 两种形式能得到同一个解，但参数之间一般不是一一对应：例如一维 lasso 中所有 $\lambda\ge2\bx'\by$ 都给出 $w=0$。）`,
      T`**几何：等高线先碰到哪里。** RSS 的等高线是以最小二乘解为中心的椭圆。把椭圆从中心慢慢放大，第一次碰到约束区域的点就是解。圆（$L_2$）是光滑的，碰点一般不在坐标轴上；菱形（$L_1$）有**尖角在坐标轴上**，椭圆往往先碰到尖角 ⇒ 某个坐标恰好为 0（L05 p17，讲者强调）。`,
      { t: 'fig', src: 'reference/pages/L05/p17.jpg', caption: 'L05 p17：左 ridge（圆），右 lasso（菱形）。椭圆是 RSS 等高线，碰到菱形的角 ⇒ $w_1=0$', w: 600 },
      { t: 'video', id: 'ridge-lasso' },
      { t: 'h3', text: '③ 惩罚 = 先验：ridge 是 Gaussian 先验下的 MAP（L05 p15–p16）' },
      T`ridge 和 lasso 的惩罚项看起来是"人为加的"。课件 L05 p15–p19 说明：它们其实就是 c08 的 **MAP（最大后验）**——给 $\bw$ 一个先验，再求后验的众数，log 先验就是惩罚项。先看 ridge：`,
      T`似然：$y\mid\bx,\bw\sim\mathcal N(\bx'\bw,\sigma^2)$（c11）。先验：$\bw\sim\mathcal N(\mathbf 0,\frac1\lambda\mathbf I)$，即 $p(\bw)\propto\exp(-\frac\lambda2\|\bw\|^2)$。`,
      { t: 'steps', items: [
        T`MAP：$\hat\bw=\argmax_\bw\big[\log p(\by\mid\mathbf X,\bw)+\log p(\bw)\big]$（分母 evidence 与 $\bw$ 无关，c08）。`,
        T`$\log p(\by\mid\mathbf X,\bw)=-\frac{1}{2\sigma^2}\|\by-\mathbf X\bw\|^2+C_1$；$\log p(\bw)=-\frac\lambda2\|\bw\|^2+C_2$。`,
        T`最大化它们的和 ⇔ 最小化 $\frac{1}{2\sigma^2}\|\by-\mathbf X\bw\|^2+\frac\lambda2\|\bw\|^2$。取 $\sigma^2=1$（课件隐含）并乘 2：$\|\by-\mathbf X\bw\|^2+\lambda\|\bw\|^2$——正是 ridge。`,
      ] },
      { t: 'note', title: '课件的简化', md: T`若保留 $\sigma^2$，等效的正则系数是 $\lambda\sigma^2$。课件 p16 省略了 $\sigma^2$（相当于设为 1），p18 的先验也省略了归一化常数和 $\frac12$。考试按课件结论写：**Gaussian prior ⇒ ridge，Laplace prior ⇒ lasso**。` },
      { t: 'h3', text: '④ Lasso 也是 MAP：Laplace 先验（L05 p18）' },
      T`把 Gaussian 先验换成在 0 处有尖角的 **Laplace 先验**，同样的三步就得到 lasso：`,
      T`$p(\bw)\propto e^{-\alpha\|\bw\|_1}$，取 log 得 $-\alpha\|\bw\|_1$。和 Gaussian 似然 $-\frac{1}{2\sigma^2}\text{RSS}$ 相加后乘 $2\sigma^2$，就是 $\text{RSS}+\lambda\|\bw\|_1$，其中 $\lambda=2\sigma^2\alpha$（课件简写成同一个 $\lambda$，常数因子不影响结论）。为什么稀疏：$\log$ 先验 $-\alpha|w|$ 在 0 处有一个**尖角**（不可导），这个尖角能把最优点"卡"在 $w=0$；Gaussian 的 $-w^2$ 在 0 处是平滑的，没有这个效果。`,
    ],
    why: [
      T`这一章把 W1 的 Bayesian（c08）和 W3 的正则化连起来：**"加惩罚项" ⇔ "加先验"**。这是课程里最常被考的"联系"之一（T13：MLE vs MAP、ridge vs lasso）。`,
      T`稀疏性在实践中很重要：上千个基因里找出与疾病相关的几十个、上万个词里找出关键词——lasso 直接告诉你哪些特征没用（权重为 0）。`,
    ],
    intuition: [
      T`**一维代数直觉。** 一维时 lasso 的解是"软阈值"：$w=\frac{\text{soft}(\bx'\by,\lambda/2)}{\bx'\bx}$，其中 $\text{soft}(z,c)=\sgn(z)\max(|z|-c,0)$。当 $|\bx'\by|\le\lambda/2$ 时直接为 0；ridge 的 $w=\frac{\bx'\by}{\bx'\bx+\lambda}$ 只是除以更大的数，除非 $\bx'\by$ 本来就是 0，否则不会变成 0。阈值为什么是 $\lambda/2$：一维目标 $\|\by-w\bx\|^2+\lambda|w|$ 对 $w>0$ 求导得 $-2\bx'\by+2w\bx'\bx+\lambda=0$，即 $w=(\bx'\by-\lambda/2)/\bx'\bx$，要 $w>0$ 就需要 $\bx'\by>\lambda/2$。`,
      { t: 'think', q: '什么时候选 ridge，什么时候选 lasso？（L05 讲者的建议）', a: '认为所有特征都有贡献、只想让权重别太大、别让某个特征主导 → ridge。想自动扔掉无关特征（特征选择），尤其是特征很多、样本很少（$p\\gg n$）→ lasso。' },
      { t: 'story', title: 'LASSO 这个名字', md: 'Robert Tibshirani 在 1996 年的论文里提出 lasso，名字是 "Least Absolute Shrinkage and Selection Operator" 的缩写，也暗合"套索"——把重要特征套住、其余扔掉。' },
    ],
    math: [
      { t: 'h3', text: '通用写法（L05 p26）' },
      T`ridge 和 lasso 其实是同一个模板：**数据拟合项 + 一个只看参数、不看数据的惩罚**。下一章（c18）就用它来控制模型复杂度——惩罚太弱，会把噪声也拟合进去；太强，会把有用的权重也压没。所以 $\lambda$ 不能在训练集上挑。`,
      { t: 'math', tex: T`\hat{\boldsymbol\theta}\in\argmin_{\boldsymbol\theta\in\Theta}\Big(L(\text{data},\boldsymbol\theta)+\lambda R(\boldsymbol\theta)\Big)` },
      T`$R(\boldsymbol\theta)$ 只依赖参数、不依赖数据。所有正则化方法都是这个模板。`,
    ],
    fx: [
      {
        title: 'Lasso', tex: T`\hat\bw=\argmin_\bw\ \htmlClass{fx-p1}{\|\by-\mathbf X\bw\|_2^2}+\htmlClass{fx-p2}{\lambda}\,\htmlClass{fx-p3}{\|\bw\|_1}`,
        parts: [
          { label: 'RSS', note: '数据拟合项，和线性回归一样。' },
          { label: 'λ', note: '惩罚强度。越大，越多权重变成 0。用 CV 选。' },
          { label: '‖w‖₁', note: '$\\sum|w_j|$：在 0 处有尖角 ⇒ 稀疏；不可导 ⇒ 无闭式解。对应 Laplace 先验。' },
        ],
      },
    ],
    example: [
      { t: 'h3', text: '一维：ridge 和 lasso 对比' },
      T`$\bx'\bx=14$，$\bx'\by=28$（最小二乘 $w=2$）。`,
      { t: 'table', cls: 'compact', head: ['$\\lambda$', 'Ridge $\\frac{28}{14+\\lambda}$', 'Lasso $\\frac{\\max(28-\\lambda/2,0)}{14}$'], rows: [
        ['0', '2', '2'],
        ['14', '1', '1.5'],
        ['56', '0.4', '**0**'],
        ['100', '0.246', '**0**'],
      ] },
      T`lasso 在 $\lambda\ge56$（$=2\bx'\by$）时恰好为 0；ridge 永远只是变小。`,
      { t: 'fade', title: '分步练习：一维 lasso（软阈值）', plan: [T`算 $\bx'\bx$、$\bx'\by$`, T`软阈值：$\max(|\bx'\by|-\lambda/2,0)$`, T`除以 $\bx'\bx$（带上符号）`], items: [
        { md: T`$\bx'\bx=14$，$\bx'\by=28$，$\lambda=14$。`, steps: [
          { md: '已给出' },
          { md: T`$28-7=21$` },
          { md: T`$w=21/14=1.5$` },
        ] },
        { md: T`$\bx'\bx=10$，$\bx'\by=6$，$\lambda=4$。`, steps: [
          { ask: '软阈值后 = ?', answer: 4, show: T`$6-2=4$` },
          { ask: '$w=?$', answer: 0.4, show: T`$4/10=0.4$` },
        ] },
        { md: T`$x=(1,2)$，$y=(1,1)$，$\lambda=8$。`, steps: [
          { ask: T`$\bx'\by=?$`, answer: 3, show: '$1+2=3$' },
          { ask: '软阈值后 = ?', answer: 0, show: T`$3-4<0$ ⇒ 0` },
          { ask: '$w=?$', answer: 0, show: '恰好为 0——这个特征被 lasso 扔掉了' },
        ] },
      ] },
    ],
    viz: [
      { id: 'reg-path', how: '和第 16 章同一个图，这次选 lasso。真实权重 $(3,-2,0,0,1.5)$，其中第 3、4 个特征无关。',
        try: '① 选 lasso，从小到大拉 $\\lambda$：权重一个接一个地**撞到 0 后停住**，无关的 $w_3,w_4$ 最先归零。② 切回 ridge 对比：没有任何一个恰好为 0。③ 读数里看"恰好为 0 的个数"。' },
      { id: 'l1-l2-geometry', how: '平面上是两个权重 $(w_1,w_2)$。椭圆是 RSS 等高线（中心是不加正则的最优解），阴影是约束区域：$L_1$ 菱形或 $L_2$ 圆。标出的点是约束下的最优解。',
        try: '① 选 $L_1$，把半径 $t$ 调小：最优点跳到菱形的**角**上（某个坐标为 0）。② 换 $L_2$：最优点在圆周上滑动，几乎不会正好落在坐标轴上。③ 移动无约束最优点，看什么位置能让 $L_1$ 解不在角上。' },
    ],
    compare: [
      { t: 'table', head: ['', 'Linear regression', 'Ridge', 'Lasso'], rows: [
        ['目标', '$\\|\\by-\\mathbf X\\bw\\|_2^2$', '$+\\lambda\\|\\bw\\|_2^2$', '$+\\lambda\\|\\bw\\|_1$'],
        ['正则项（regulariser）', '无', 'squared $L_2$ norm（平方 $L_2$ 范数）$\\|\\bw\\|_2^2$（约束区域是圆）', '$L_1$ norm $\\|\\bw\\|_1$（菱形）'],
        ['解', '$(\\mathbf X\'\\mathbf X)^{-1}\\mathbf X\'\\by$', '$(\\mathbf X\'\\mathbf X+\\lambda\\mathbf I)^{-1}\\mathbf X\'\\by$', '无闭式解；稀疏'],
        ['先验（prior）', '无（均匀）', 'Gaussian $e^{-\\lambda\\|\\bw\\|_2^2}$', 'Laplace $e^{-\\lambda\\|\\bw\\|_1}$'],
      ] },
      T`（表里 Gaussian 写成 $e^{-\lambda\|\bw\|_2^2}$，上面推导是 $e^{-\frac\lambda2\|\bw\|^2}$：课件这张表把 $\frac12$ 吸进了 $\lambda$ 的定义里，不是错误。）`,
      T`（L05 p18 的总结表，考前默写一遍。）`,
      { t: 'exam', md: T`**Lasso vs ridge:** Both shrink weights to reduce variance. The $L_1$ penalty (lasso) has corners on the axes, so it drives some weights exactly to zero, giving sparse models and automatic feature selection, but it has no closed-form solution; it corresponds to MAP with a Laplace prior. The $L_2$ penalty (ridge) shrinks all weights smoothly and typically gives dense (non-sparse) solutions, with no thresholding mechanism that sets coefficients to zero, has the closed form $(\mathbf X'\mathbf X+\lambda\mathbf I)^{-1}\mathbf X'\mathbf y$, and corresponds to MAP with a zero-mean Gaussian prior.` },
    ],
    pitfalls: [
      ['Lasso 有闭式解', '没有；$|w|$ 在 0 处不可导，需要数值方法（如坐标下降）。'],
      ['Ridge 对应 Laplace 先验', '反了：ridge ↔ Gaussian，lasso ↔ Laplace。'],
      ['稀疏 = 权重很小', '稀疏是权重**恰好为 0**。'],
      ['正则项依赖数据', '$R(\\boldsymbol\\theta)$ 只依赖参数（L05 p26）。'],
    ],
    quiz: [
      { type: 'mc', q: '哪个惩罚会产生稀疏解？', options: ['$\\lambda\\|\\bw\\|_2^2$', '$\\lambda\\|\\bw\\|_1$', '两者都会', '两者都不会'], answer: 1, explain: '$L_1$ 的菱形尖角在坐标轴上。' },
      { type: 'mc', q: 'Ridge regression 等价于哪种先验下的 MAP？', options: ['均匀先验', 'Laplace 先验', '零均值 Gaussian 先验', 'Beta 先验'], answer: 2, explain: 'L05 p15–p16。' },
      { type: 'num', q: '一维 lasso：$\\bx\'\\bx=4$，$\\bx\'\\by=10$，$\\lambda=8$。$w=?$', answer: 1.5, explain: T`一维 lasso 的解是软阈值：$w=\dfrac{\text{soft}(\bx'\by,\lambda/2)}{\bx'\bx}$，即先把 $\bx'\by$ 往 0 的方向减去 $\lambda/2$（减过头就停在 0），再除以 $\bx'\bx$。题目给 $\bx'\by=10$，$\lambda=8$ 所以 $\lambda/2=4$，$\bx'\bx=4$。$\text{soft}(10,4)=10-4=6$，$w=6/4=1.5$。阈值是 $\lambda/2$ 而不是 $\lambda$，因为目标 $\|\by-w\bx\|^2+\lambda|w|$ 对 $w>0$ 求导时，平方项带出系数 2：$-2\bx'\by+2w\bx'\bx+\lambda=0$。**陷阱是减去整个 $\lambda$**，得到 $(10-8)/4=0.5$。` },
      { type: 'num', q: '同上，$\\lambda$ 至少多大时 $w=0$？', answer: 20, explain: T`Lasso 的权重变成 0 的条件是：软阈值把 $\bx'\by$ 减到 0 或以下，即 $|\bx'\by|\le\lambda/2$。题目 $\bx'\by=10$，所以需要 $\lambda/2\ge10$，即 $\lambda\ge2\times10=20$。**这就是 lasso 产生稀疏解的机制：$\lambda$ 够大时权重恰好等于 0**；ridge 的 $w=\bx'\by/(\bx'\bx+\lambda)$ 无论 $\lambda$ 多大都只会趋近 0。答 10 是忘了阈值里的 $\frac12$。` },
      { type: 'show', q: '（英文）Show that ridge regression is MAP estimation with a Gaussian prior.', answer: T`With likelihood $y\mid\mathbf x,\mathbf w\sim\mathcal N(\mathbf x'\mathbf w,\sigma^2)$ and prior $\mathbf w\sim\mathcal N(\mathbf 0,\lambda^{-1}\mathbf I)$, the log-posterior is $-\frac{1}{2\sigma^2}\|\mathbf y-\mathbf X\mathbf w\|^2-\frac{\lambda}{2}\|\mathbf w\|^2+\text{const}$. Maximising it is equivalent (taking $\sigma^2=1$) to minimising $\|\mathbf y-\mathbf X\mathbf w\|^2+\lambda\|\mathbf w\|^2$, the ridge objective.`, qzh: '证明岭回归（ridge regression）就是使用 Gaussian 先验（Gaussian prior）的 MAP 估计。', azh: T`取似然（likelihood）$y\mid\mathbf x,\mathbf w\sim\mathcal N(\mathbf x'\mathbf w,\sigma^2)$、先验（prior）$\mathbf w\sim\mathcal N(\mathbf 0,\lambda^{-1}\mathbf I)$，则对数后验（log-posterior）为 $-\frac{1}{2\sigma^2}\|\mathbf y-\mathbf X\mathbf w\|^2-\frac{\lambda}{2}\|\mathbf w\|^2+\text{const}$。最大化它等价于（取 $\sigma^2=1$）最小化 $\|\mathbf y-\mathbf X\mathbf w\|^2+\lambda\|\mathbf w\|^2$，这正是岭回归的目标函数（ridge objective）。` },
    ],
  });

  /* =====================================================================
   * c18 · 过拟合与模型复杂度（L05 p20–p28）
   * ===================================================================== */
  add({
    id: 'c18', week: 'W3', lec: 'L05', pages: 'L05 p20–p28', star: 2,
    title: '过拟合与模型复杂度', en: 'Underfitting, overfitting, model selection',
    summary: '模型太简单 → **underfitting（欠拟合）**：训练和测试误差都大；太复杂 → **overfitting（过拟合）**：训练误差很小、测试误差很大。两种控制复杂度的办法：显式选模型（用验证集选多项式次数）或正则化（固定复杂模型、加惩罚、选 $\\lambda$）。',
    prereq: ['c12', 'c16'],
    symbols: [
      [T`$d$`, T`多项式次数（模型复杂度）`],
      [T`$D_{\text{train}}$, $D_{\text{validate}}$`, T`训练集、验证集`],
      [T`$E_{\text{RMS}}$`, T`均方根误差 $\sqrt{\text{MSE}}$`],
      [T`$\ln\lambda$`, T`$\lambda$ 的自然对数；$\ln\lambda=-\infty$ 表示 $\lambda=0$`],
    ],
    goals: [
      '定义 underfitting / overfitting，并用训练误差、测试误差描述',
      '描述两种模型选择方法（L05 p25–p26）的步骤',
      '解读 Bishop 9 次多项式 + ridge 的三张图和误差曲线（L05 p27）',
      '解释"训练误差随复杂度单调下降，测试误差呈 U 形"',
    ],
    types: ['T13'],
    what: [
      T`c16 说正则化能防止 overfitting（过拟合），但"太简单"和"太复杂"在数据上分别长什么样，还没看过。看课件的同一批带噪声的数据：`,
      T`**L05 p21–p24 的例子**：50 个点来自 $y=x\sin x$ 加噪声。`,
      { t: 'ul', items: [
        T`**Underfitting（欠拟合）**（p22）：用直线 $y=wx+b$ 拟合——模型太简单，抓不住波浪形，训练误差和测试误差都大。`,
        T`**Overfitting（过拟合）**（p23）：用一条穿过每个点的光滑曲线（非参数平滑）——训练误差为 0，但曲线在点之间乱摆，测试误差极大。`,
        T`**合适**（p24）：真实函数 $x\sin x$ 抓住了大的波形，忽略点对点的噪声。`,
      ] },
      T`怎么找到"合适"的复杂度？不能看训练误差：模型越复杂，训练误差几乎总是越低，用它来挑次数或 $\lambda$，永远会挑最复杂的。必须留一批**没参与训练**的数据来打分。下面两种做法都是这个思路，而且挑完之后都要用全部数据把选中的模型重新训练一遍：`,
      T`**两种控制复杂度的方法**：`,
      { t: 'ol', items: [
        T`**显式模型选择（explicit model selection）**（L05 p25）：把训练数据分成 $D_{\text{train}}$ 和 $D_{\text{validate}}$；对每个次数 $d=1,\dots,d_{\max}$ 在 $D_{\text{train}}$ 上训练、在 $D_{\text{validate}}$ 上评估；选验证表现最好的 $\hat d$；最后用**全部**数据重新训练 $f_{\hat d}$。`,
        T`**正则化（regularisation）**（L05 p26）：直接用一个足够复杂的模型，目标加 $\lambda R(\boldsymbol\theta)$；用验证集 / 交叉验证选 $\hat\lambda$；再用全部数据拟合。`,
      ] },
    ],
    why: [
      T`过拟合是机器学习的头号敌人。后面几乎每个技术都和它有关：bias–variance（c19）解释它从哪来，泛化界（c21、c24）给它定量的上界，交叉验证（c43）是实际检测和选模型的工具，dropout / early stopping（c36）是深度学习里的对策。`,
    ],
    intuition: [
      T`**"背答案" vs "学方法"。** 过拟合的模型把训练集里的**噪声**也当成规律记住了。换一批数据（考试题），记住的噪声全都不再成立。`,
      T`**训练误差骗人。** 模型越复杂，训练误差几乎总是越小（L05 p31）——只看训练误差会一直选最复杂的模型。所以必须用没参与训练的数据（验证集）来选。`,
      { t: 'think', q: '训练误差一定能降到 0 吗？（L05 p31 的问题）', a: '不一定。如果数据里有两个**完全相同的输入**却有**不同的标签**，任何函数都不可能同时拟合两者。除此之外，足够复杂的模型通常能把训练误差降到 0。' },
      { t: 'story', title: '"用四个参数我能拟合一头大象"', md: '物理学家 Freeman Dyson 回忆：1953 年他向 Fermi 展示一个参数很多的拟合结果，Fermi 引用 von Neumann 的话说："With four parameters I can fit an elephant, and with five I can make him wiggle his trunk."（四个参数能拟合一头大象，五个能让它摇鼻子）——参数足够多，什么都能拟合，所以"拟合得好"本身不能证明模型对。' },
    ],
    math: [
      { t: 'h3', text: 'Bishop 的例子（L05 p27）' },
      T`10 个点来自 $\sin(2\pi x)$ 加噪声，模型是 9 次多项式 $\hat f=\sum_{j=0}^9w_jx^j$，加 $\lambda\|\bw\|_2^2$：`,
      { t: 'table', head: ['$\\ln\\lambda$', '曲线', '诊断'], rows: [
        ['$-\\infty$（$\\lambda=0$）', '穿过每个点、剧烈振荡', 'overfit'],
        ['$-18$', '平滑地贴近 $\\sin$', '合适'],
        ['$0$', '几乎压成水平线', 'underfit'],
      ] },
      T`误差曲线：训练 $E_{\text{RMS}}$ 随 $\lambda$ 增大而单调上升；测试 $E_{\text{RMS}}$ 先降后升，在 $\ln\lambda\approx-18$ 附近最小。`,
      { t: 'h3', text: '训练 vs 测试误差（L05 p39）' },
      T`横轴从简单到复杂：训练误差单调下降趋于 0；测试误差呈 **U 形**。左边是 underfit 区，右边是 overfit 区，最低点是最佳复杂度。`,
      { t: 'note', title: '最后一步别忘了', md: '模型选择完成后要**用全部数据（训练 + 验证）重新训练**选中的模型（L05 p25 第 4 步）。' },
    ],
    fx: [
      {
        title: '正则化的模型选择', tex: T`\hat{\boldsymbol\theta}\in\argmin_{\boldsymbol\theta\in\Theta}\Big(\htmlClass{fx-p1}{L(\text{data},\boldsymbol\theta)}+\htmlClass{fx-p2}{\lambda}\,\htmlClass{fx-p3}{R(\boldsymbol\theta)}\Big)`,
        parts: [
          { label: '数据项', note: '训练误差（经验风险）。单独最小化会过拟合。' },
          { label: 'λ', note: '超参数（hyperparameter）：用验证集或交叉验证选，不能在训练集上选（否则永远选 0）。' },
          { label: 'R(θ)', note: '复杂度惩罚，只依赖参数。' },
        ],
      },
    ],
    example: [
      { t: 'h3', text: '读一张验证结果表' },
      { t: 'table', cls: 'compact', head: ['次数 $d$', '训练 MSE', '验证 MSE'], rows: [
        ['1', '8.1', '8.6'], ['3', '2.0', '2.4'], ['5', '1.1', '**1.6**'], ['7', '0.6', '2.9'], ['9', '0.0', '15.2'],
      ] },
      { t: 'steps', items: [
        T`训练 MSE 单调下降到 0——不能用它选。`,
        T`验证 MSE 在 $d=5$ 最小 ⇒ $\hat d=5$。`,
        T`$d=1$：两者都大 ⇒ underfit；$d=9$：训练 0、验证巨大 ⇒ overfit。`,
        T`最后用全部数据训练 5 次多项式。`,
      ] },
    ],
    viz: [
      { id: 'poly-fit', opts: { degree: 1, test: true }, how: '12 个训练点（蓝），灰色小点是测试点，灰虚线是真实函数 $x\\sin x$。拖次数滑块看训练 MSE 和测试 MSE。',
        try: '① 次数 1：直线，两个 MSE 都大（underfit）。② 次数 4–5：贴近真实函数，测试 MSE 最小。③ 次数 9：训练 MSE 进一步下降（12 个点、10 个系数，一般不会恰好穿过每个点），曲线在边缘剧烈摆动、测试 MSE 暴涨（overfit）。（L05 p27 Bishop 的例子是 10 个点配 9 次多项式，所以能穿过全部点。）④ 点"换一批训练数据"：高次数曲线变得面目全非——这就是第 19 章的 variance。' },
    ],
    compare: [
      { t: 'table', head: ['', 'Underfitting', '合适', 'Overfitting'], rows: [
        ['训练误差', '大', '较小', '很小（≈0）'],
        ['测试误差', '大', '最小', '大'],
        ['原因', '模型太简单', '—', '模型太复杂 / 数据太少'],
        ['对策', '更复杂的模型、更多特征', '—', '正则化、更多数据、更简单的模型'],
        ['bias / variance（c19）', '高 bias', '平衡', '高 variance'],
      ] },
    ],
    pitfalls: [
      ['训练误差小 = 模型好', '可能是过拟合；看验证 / 测试误差。'],
      ['用测试集选 $\\lambda$ 或次数', '测试集只能最后用一次；选模型用验证集或交叉验证。'],
      ['选好模型后直接用训练集那部分的参数', '应该用全部数据重新训练（L05 p25）。'],
      ['正则化只能用于线性模型', '对任何参数化模型都适用（多项式、神经网络……）。'],
    ],
    quiz: [
      { type: 'mc', q: '训练误差 0.01，测试误差 3.5。最可能是：', options: ['underfitting', 'overfitting', '刚好', '数据有错'], answer: 1, explain: T`训练误差 0.01 几乎为 0，测试误差 3.5 是它的 350 倍：模型在训练集上表现极好，换到没见过的数据就很差。这正是 overfitting（过拟合）：**模型把训练数据里的噪声也背了下来，所以训练误差小、测试误差大**。underfitting（欠拟合）的特征是训练误差和测试误差都大，而这里训练误差很小，所以排除。` },
      { type: 'mc', q: 'Bishop 例子中 $\\ln\\lambda=0$ 的 9 次多项式：', options: ['剧烈振荡', '平滑贴近真实', '几乎是水平线', '穿过所有点'], answer: 2, explain: '惩罚太强 ⇒ 权重被压到接近 0 ⇒ underfit。' },
      { type: 'mc', q: '下面哪个可以降低过拟合？', options: ['增加多项式次数', '减小 $\\lambda$', '增加训练数据', '只看训练误差选模型'], answer: 2, explain: '更多数据降低 variance。' },
      { type: 'show', q: '（英文）Define overfitting and underfitting.', answer: T`Underfitting: the model class is too simple to capture the underlying pattern, so both training and test errors are high. Overfitting: the model is so flexible that it fits the noise in the training data, giving low training error but high test (generalisation) error.`, qzh: '给出过拟合（overfitting）和欠拟合（underfitting）的定义。', azh: '欠拟合（underfitting）：模型类太简单，无法捕捉潜在规律，因此训练误差和测试误差都高。过拟合（overfitting）：模型过于灵活，连训练数据中的噪声也拟合了，导致训练误差低、但测试误差（即泛化误差，generalisation error）高。' },
    ],
  });

  /* =====================================================================
   * c19 · Bias–variance trade-off（L05 p29–p40）
   * ===================================================================== */
  add({
    id: 'c19', week: 'W3', lec: 'L05', pages: 'L05 p29–p40', star: 3,
    title: 'Bias–variance trade-off', en: 'Bias–variance decomposition and trade-off',
    summary: '把训练集看成随机的：换一批数据，学到的模型就变。平方损失下，测试误差 = **bias²**（平均预测偏离多少）+ **variance**（换数据时预测晃多大）+ **irreducible error**（噪声，不可约误差）。简单模型高 bias 低 variance，复杂模型反过来。',
    prereq: ['c05', 'c07', 'c18'],
    symbols: [
      [T`$\hat f_D(x_0)$`, T`用训练集 $D$ 学到的模型在测试点 $x_0$ 的预测（简写 $\hat f$）`],
      [T`$Y$`, T`测试点 $x_0$ 处的真实标签（随机，因为有噪声）`],
      [T`$\mathbb E[\hat f]$`, T`对所有可能的训练集求平均的预测`],
      [T`$\mathrm{Var}[Y]$`, T`噪声方差 = 不可约误差`],
      [T`$D\perp Y$`, T`训练集与测试标签独立`],
    ],
    goals: [
      '写出 bias–variance 分解（L05 p37）并指出每一项',
      '能按 L05 p38 的步骤推导分解（用 $\\mathbb E[Z^2]=\\mathrm{Var}[Z]+(\\mathbb E Z)^2$）',
      '说出简单 / 复杂模型、正则化强弱分别对 bias 和 variance 的影响',
      '手算：给几个训练集上的预测，算 bias²、variance、期望测试误差',
    ],
    types: ['T13'],
    what: [
      T`c18 里测试误差随复杂度**先降后升**（U 形）。为什么不是越复杂越好？因为训练数据本身是随机的：换一批数据，复杂模型学出的曲线大变样，简单模型几乎不变、但总是偏。把测试误差拆成"**平均偏了多少**"（bias）和"**换数据晃多大**"（variance），就能看见这个此消彼长。先看讲者的思想实验：`,
      T`**L05 讲者的"周一、周二、周三"思想实验**：三天各采集一批数据，各训练一个模型，然后比较这三个模型。`,
      { t: 'ul', items: [
        T`**简单模型（直线）**：三天学到的直线几乎一样（**低 variance**），但都离真实曲线很远（**高 bias**）。`,
        T`**复杂模型（高次多项式）**：三天学到的曲线天差地别（**高 variance**），但它们的平均正好在真实曲线附近（**低 bias**）。`,
      ] },
      { t: 'video', id: 'bias-variance' },
      { t: 'fig', src: 'reference/pages/L05/p36.jpg', caption: 'L05 p36：随复杂度增加，bias² 下降、variance 上升，测试误差（两者之和 + 噪声）呈 U 形', w: 560 },
      { t: 'slide', src: 'L05/p34', caption: '只盯住一个测试点 $x_0$：左边三天的直线在 $x_0$ 处几乎给出同一个预测（variance 小）；右边三条复杂曲线在 $x_0$ 处各说各的（variance 大）。' },
      { t: 'slide', src: 'L05/p35', caption: '同一个 $x_0$：红点是真实值。直线的预测离它很远（bias 大）；复杂曲线平均下来正好在它附近（bias 小）。' },
      T`把这个画面写成公式：`,
      T`**关键视角**（L05 p32–p35）：训练数据本身是随机的（换一个月采集就不一样，L06 讲者也强调）。所以学到的模型 $\hat f_D$ 也是随机的。固定一个测试点 $x_0$：`,
      { t: 'ul', items: [
        T`**Bias（偏差）**：所有可能训练集上的平均预测 $\mathbb E[\hat f]$ 离测试点的真实期望 $\mathbb E[Y]$ 多远（$x_0$ 固定，所以 $\mathbb E[Y]$ 就是 $\mathbb E[Y\mid x_0]$，课件省略了条件）。`,
        T`**Variance（方差）**：换训练集时预测 $\hat f$ 的波动 $\mathrm{Var}[\hat f]$。`,
        T`**Irreducible error（不可约误差）**：$\mathrm{Var}[Y]$，数据本身的噪声，任何模型都消除不了。下式左边的 $\mathbb E$ **同时**对训练集 $D$ 的随机性（影响 $\hat f$）和测试标签的噪声（影响 $Y$）求平均。`,
      ] },
      { t: 'math', tex: T`\mathbb E\big[(Y-\hat f)^2\big]=\underbrace{\big(\mathbb E[Y]-\mathbb E[\hat f]\big)^2}_{\text{bias}^2}+\underbrace{\mathrm{Var}[\hat f]}_{\text{variance}}+\underbrace{\mathrm{Var}[Y]}_{\text{irreducible error}}\qquad(\text{L05 p37})` },
    ],
    why: [
      T`这是往年简答的高频题（T13 预测："State the bias–variance decomposition and what increases each term"）。它也是理解正则化、模型选择、集成方法（如 bagging 降 variance）的统一框架。`,
      T`和 c07 的区别：c07 分解的是**参数估计** $\hat\theta$ 的 MSE（两项）；这里分解的是**对新样本的预测**误差，多了噪声项（三项）。`,
    ],
    intuition: [
      { t: 'think', q: '正则化（加大 $\\lambda$）会让 bias 和 variance 分别怎么变？', a: 'bias 上升（模型被约束、平均预测偏离真实）、variance 下降（权重被压小，对训练数据的变化不敏感）。选 $\\lambda$ 就是在两者之间找平衡点。' },
      { t: 'story', title: '"bias/variance dilemma"', md: '这个名字因 Geman、Bienenstock 和 Doursat 1992 年的论文 "Neural Networks and the Bias/Variance Dilemma" 而广为人知。他们用它解释为什么神经网络需要大量数据：模型越灵活，variance 越大。' },
    ],
    math: [
      { t: 'h3', text: '推导（L05 p38，四步）' },
      T`记 $\hat f=\hat f_D(x_0)$。用到：$\mathbb E[Z^2]=\mathrm{Var}[Z]+(\mathbb E[Z])^2$（c01 方差公式移项），以及测试标签 $Y$ 与训练集 $D$ 独立 ⇒ $\hat f\perp Y$ ⇒ $\mathbb E[Y\hat f]=\mathbb E[Y]\mathbb E[\hat f]$。`,
      { t: 'steps', items: [
        T`展开：$\mathbb E[(Y-\hat f)^2]=\mathbb E[Y^2]+\mathbb E[\hat f^2]-2\mathbb E[Y\hat f]$`,
        T`用方差公式和独立性：$=\mathrm{Var}[Y]+(\mathbb EY)^2+\mathrm{Var}[\hat f]+(\mathbb E\hat f)^2-2\,\mathbb EY\,\mathbb E\hat f$`,
        T`重新分组：$=\mathrm{Var}[Y]+\mathrm{Var}[\hat f]+\big[(\mathbb EY)^2-2\,\mathbb EY\,\mathbb E\hat f+(\mathbb E\hat f)^2\big]$`,
        T`方括号是完全平方：$=\mathrm{Var}[Y]+\mathrm{Var}[\hat f]+(\mathbb EY-\mathbb E\hat f)^2$ ∎`,
      ] },
      T`三项都 $\ge0$，所以测试误差永远 $\ge\mathrm{Var}[Y]$（噪声下限）。`,
    ],
    fx: [
      {
        title: 'Bias–variance 分解', tex: T`\htmlClass{fx-p1}{\mathbb E[(Y-\hat f)^2]}=\htmlClass{fx-p2}{(\mathbb E[Y]-\mathbb E[\hat f])^2}+\htmlClass{fx-p3}{\mathrm{Var}[\hat f]}+\htmlClass{fx-p4}{\mathrm{Var}[Y]}`,
        parts: [
          { label: '期望测试误差', note: '对两种随机性求平均：训练集 $D$ 的随机（影响 $\\hat f$）和测试标签噪声（影响 $Y$）。' },
          { label: 'bias²', note: '系统误差：模型类太简单、或正则太强时大。' },
          { label: 'variance', note: '对训练集的敏感度：模型太复杂、数据太少时大。' },
          { label: '不可约误差', note: '噪声方差。与模型无关，是测试误差的下限。' },
        ],
      },
    ],
    example: [
      { t: 'h3', text: '手算：两个模型在同一个测试点' },
      T`测试点 $x_0$：$\mathbb E[Y]=2$，噪声 $\mathrm{Var}[Y]=0.25$。各用 4 个不同训练集训练：`,
      { t: 'table', cls: 'compact', head: ['', '4 次预测', '平均', 'bias²', 'variance', '期望测试误差'], rows: [
        ['复杂模型', '1.5, 2.5, 1.0, 3.0', '2.0', '0', '$\\frac{0.25+0.25+1+1}{4}=0.625$', '$0+0.625+0.25=0.875$'],
        ['简单模型', '1.2, 1.4, 1.3, 1.1', '1.25', '$(2-1.25)^2=0.75^2=0.5625$', '$\\frac{0.05^2+0.15^2+0.05^2+0.15^2}{4}=\\frac{0.05}{4}=0.0125$（离平均 1.25 的差：$-0.05,0.15,0.05,-0.15$）', '$0.5625+0.0125+0.25=0.825$'],
      ] },
      T`这里简单模型反而略好——它的低 variance 弥补了高 bias。哪个好取决于两者之和。`,
      { t: 'fade', title: '分步练习：bias²、variance、测试误差', plan: ['平均预测 $\\mathbb E[\\hat f]$', 'bias² $=(\\mathbb E Y-\\mathbb E\\hat f)^2$', 'variance = 预测离平均的平方的平均', '相加（+ 噪声）'], items: [
        { md: T`$\mathbb EY=3$，$\mathrm{Var}Y=0.5$，预测 $2,4$。`, steps: [
          { md: '平均 $3$' }, { md: 'bias² $=0$' }, { md: T`variance $=\frac{1+1}{2}=1$` }, { md: '测试误差 $=0+1+0.5=1.5$' },
        ] },
        { md: T`$\mathbb EY=1$，$\mathrm{Var}Y=0.1$，预测 $1.5,1.5,2.0,2.0$。平均 $1.75$。`, steps: [
          { ask: 'bias² = ?', answer: 0.5625, show: T`$(1-1.75)^2=0.5625$` },
          { ask: 'variance = ?', answer: 0.0625, show: T`偏离 $\pm0.25$，平方 0.0625` },
          { ask: '期望测试误差 = ?', answer: 0.725, show: '$0.5625+0.0625+0.1=0.725$' },
        ] },
        { md: T`$\mathbb EY=0$，$\mathrm{Var}Y=0.2$，预测 $-1,0,1,0$。`, steps: [
          { ask: '平均 = ?', answer: 0, show: '$0$' },
          { ask: 'bias² = ?', answer: 0, show: '$0$' },
          { ask: 'variance = ?', answer: 0.5, show: T`$\frac{1+0+1+0}{4}=0.5$` },
          { ask: '期望测试误差 = ?', answer: 0.7, show: '$0+0.5+0.2=0.7$' },
        ] },
      ] },
    ],
    viz: [
      { id: 'bias-variance-sim', how: '20 个不同的训练集（每个 15 个点，来自 $\\sin x$ 加噪声），各自用 $k$ 次多项式拟合：细线是 20 条拟合曲线，粗线是它们的平均，虚线是真实函数。读数给出 bias²、variance、噪声和它们的和。',
        try: '① $k=0$ 或 1：细线挤在一起（variance 小），但平均线离真实很远（bias² 大）。② $k=3$：两者都小，总和最低。③ $k=9$：平均线几乎贴着真实函数（bias² 很小），细线却四处乱飞（variance 暴涨）。④ 记下每个 $k$ 的总和，画出来就是 L05 p36 的 U 形曲线。' },
    ],
    compare: [
      { t: 'table', head: ['', '简单模型 / 强正则 / 少特征', '复杂模型 / 弱正则 / 多特征'], rows: [
        ['bias', '高', '低'],
        ['variance', '低', '高'],
        ['典型问题', 'underfit', 'overfit'],
        ['更多训练数据的帮助', '小（bias 降不下来）', '大（降低 variance）'],
      ] },
      { t: 'exam', md: T`**Bias–variance decomposition:** For squared loss at a test point $x_0$, the expected test error over random training sets and label noise is $\mathbb E[(Y-\hat f_D(x_0))^2]=(\mathbb E[Y]-\mathbb E[\hat f])^2+\mathrm{Var}[\hat f]+\mathrm{Var}[Y]$, i.e. bias$^2$ + variance + irreducible error. Simple models (or strong regularisation) have high bias and low variance; complex models have low bias and high variance, so test error is U-shaped in model complexity.` },
    ],
    pitfalls: [
      ['variance 指数据的方差', '指**模型预测**在不同训练集之间的方差 $\\mathrm{Var}[\\hat f]$。'],
      ['好模型可以把测试误差降到 0', '最少还有不可约误差 $\\mathrm{Var}[Y]$。'],
      ['bias 和 variance 可以同时任意小', '固定数据量下通常此消彼长（trade-off）。'],
      ['推导里 $\\mathbb E[Y\\hat f]=\\mathbb EY\\,\\mathbb E\\hat f$ 总成立', '需要 $Y$ 与训练集独立（新的测试点）。'],
    ],
    quiz: [
      { type: 'num', q: '$\\mathbb E Y=5$，$\\mathrm{Var}Y=1$，$\\mathbb E\\hat f=4$，$\\mathrm{Var}\\hat f=0.5$。期望测试误差？', answer: 2.5, explain: T`平方损失下，期望测试误差 = bias² + variance + irreducible error（不可约误差），即 $(\mathbb E[Y]-\mathbb E[\hat f])^2+\mathrm{Var}[\hat f]+\mathrm{Var}[Y]$。从题目读出：$\mathbb EY=5$、$\mathbb E\hat f=4$，所以 bias² $=(5-4)^2=1$；variance $=\mathrm{Var}\hat f=0.5$；噪声 $=\mathrm{Var}Y=1$。合计 $1+0.5+1=2.5$。**陷阱是漏掉噪声项 $\mathrm{Var}Y$**，得到 1.5。` },
      { type: 'mc', q: '增大 ridge 的 $\\lambda$ 通常会：', options: ['bias↑ variance↑', 'bias↑ variance↓', 'bias↓ variance↑', 'bias↓ variance↓'], answer: 1, explain: T`$\lambda$ 越大，对权重的惩罚越强，权重被压向 0，模型变得不灵活。这有两个后果：换一批训练数据，学出来的 $\hat f$ 变化更小，所以 variance（方差）↓；但模型也更难贴近真实函数，平均预测系统性地偏离，所以 bias（偏差）↑。**正则化是用 bias 的上升换 variance 的下降**，两者不会同时变小，所以"bias↓ variance↓"不对。极端情况 $\lambda\to\infty$ 时 $\hat\bw\to\mathbf 0$：预测完全不随数据变（variance 为 0），偏差最大。` },
      { type: 'mc', q: '下面哪项**不能**通过换模型减小？', options: ['bias²', 'variance', 'irreducible error', '训练误差'], answer: 2, explain: T`Irreducible error（不可约误差）就是 $\mathrm{Var}[Y]$，即标签本身带的噪声。它的公式里根本没有 $\hat f$，**所以不管换成什么模型，这一项都不变**。bias² 和 variance 都含有 $\hat f$，换模型（改复杂度、加正则化）就能调节；训练误差更是可以用很复杂的模型压到接近 0。` },
      { type: 'show', q: '（英文）What happens to bias and variance as model complexity increases?', answer: T`As complexity increases, bias decreases (the model class can fit the true function better on average) while variance increases (predictions become more sensitive to the particular training set). Test error = bias$^2$ + variance + noise is therefore U-shaped, minimised at an intermediate complexity.`, qzh: '随着模型复杂度（model complexity）增加，偏差（bias）和方差（variance）会怎样变化？', azh: '复杂度增加时，偏差（bias）下降（模型类平均而言能更好地拟合真实函数），而方差（variance）上升（预测对具体用到的那份训练集更敏感）。因此测试误差 = bias$^2$ + variance + noise（噪声）呈 U 形，在中等复杂度处最小。' },
    ],
  });

  /* =====================================================================
   * c20 · 经验风险、真实风险、ERM（L06 p1–p15）
   * ===================================================================== */
  add({
    id: 'c20', week: 'W3', lec: 'L06', pages: 'L06 p1–p15', star: 2,
    title: '经验风险、真实风险、ERM', en: 'Empirical risk, true risk, finite model classes',
    summary: '**Empirical risk（经验风险）** = 训练集上的平均损失，能算；**true risk（真实风险）** = 在真实分布上的期望损失，是我们真正关心的，但算不出。ERM 选经验风险最小的分类器。L06 的问题：两者差多少？先从**有限**的模型类开始。',
    prereq: ['c07', 'c18'],
    symbols: [
      [T`$\mathcal F$`, T`模型类（classifier set）：所有候选分类器的集合`],
      [T`$|\mathcal F|$`, T`有限集合里元素的个数`],
      [T`$\hat R_D[f]$`, T`分类器 $f$ 在训练集 $D$ 上的经验风险`],
      [T`$R[f]$`, T`真实风险 $\mathbb E\,l(Y,f(X))$`],
      [T`$\hat f_D$`, T`ERM 选出的分类器（依赖 $D$，所以是随机的）`],
      [T`$l(y,y')$`, T`0-1 loss：错为 1、对为 0`],
    ],
    goals: [
      '区分 **estimation（估计）** 和 **model selection（模型选择）**（L06 p4）',
      '写出经验风险、真实风险、ERM 的定义（L06 p12–p14）',
      '列出 L06 p9–p10 的 4 个单特征 / 8 个多特征分类器，并手算 ERM',
      '用经验风险、真实风险描述 underfit / overfit（L06 p15）',
    ],
    types: ['T12'],
    notExam: 'L06 p8 的可数 / 不可数集合只是数学背景：知道"有限集合可以数出个数 $|S|$"即可。',
    what: [
      { t: 'h3', text: '① 问题：训练误差能代表"真本事"吗？' },
      T`c18 里模型一复杂，训练误差可以很小，换一批数据却很大。这一章（L06）先给这两个数起准确的名字，下一章（c21）再问：**它们最多能差多少？** 先看一个能手算的小例子。`,
      { t: 'h3', text: '② 两种风险：算得出的和算不出的（L06 p12–p15）' },
      T`两个特征 $x_1,x_2$，标签 $\pm1$，训练集只有 4 个点：$(1,2)\to+1$，$(2,-1)\to+1$，$(-1,1)\to-1$，$(-2,-1)\to-1$。拿规则 $f=\sgn(x_1)$（$x_1>0$ 判 $+1$）去分：四个点的预测是 $+,+,-,-$，全对，错 0 个，平均每个点错 $0/4=0$。换成 $\sgn(x_2)$：预测 $+,-,+,-$，错 2 个，平均 $0.5$。`,
      T`这个"在训练集上的平均损失"叫 **empirical risk（经验风险）** $\hat R_D[f]$——手上有数据，**算得出**。可我们真正关心的是规则在**新数据**上的平均损失，叫 **true risk（真实风险）** $R[f]$：它是对真实数据分布求期望，而分布不知道，所以**算不出**（L06 p12–p14）。用这两个词，c18 的现象就能说准确：**欠拟合** = 两种风险都大；**过拟合** = 经验风险小、真实风险大（L06 p15）。这里的损失 $l$ 用 0-1 loss（错记 1、对记 0）：`,
      { t: 'math', tex: T`\hat R_D[f]=\frac1n\sum_{i=1}^n l\big(y_i,f(\bx_i)\big)\qquad\text{（经验风险：训练集上数错误）}` },
      { t: 'math', tex: T`R[f]=\mathbb E\,l\big(Y,f(X)\big)\qquad\text{（真实风险：新数据上的期望错误率）}` },
      { t: 'h3', text: '③ ERM：在一份固定的"菜单"里挑训练误差最小的（L06 p9–p13）' },
      T`既然真实风险算不出，就用算得出的经验风险代替：从一份**事先固定**的候选规则里，挑经验风险最小的那条——这就是 c07 的 **ERM（empirical risk minimisation，经验风险最小化）**（L06 p13）：`,
      { t: 'math', tex: T`\hat f_D=\argmin_{f\in\mathcal F}\hat R_D[f]` },
      T`$\mathcal F$ 叫 **model class（模型类）**，就是这份候选"菜单"。L06 先从最简单的**有限**菜单讲起（p9–p10）：`,
      { t: 'ul', items: [
        T`**单特征类** $|\mathcal F|=4$：$\sgn(x_1),\ \sgn(-x_1),\ \sgn(x_2),\ \sgn(-x_2)$。`,
        T`**多特征类** $|\mathcal F|=8$：上面 4 个 + $\sgn(x_1+x_2),\ \sgn(x_1-x_2),\ \sgn(-x_1+x_2),\ \sgn(-x_1-x_2)$。`,
        T`约定：$\sgn(z)=+1$ 若 $z>0$，$-1$ 若 $z\le0$（L06 讲者强调 0 处取 $-1$）。这些分类器**没有可学的权重**，就是 8 条固定规则。`,
      ] },
      T`上面的小例子里，8 条规则逐条数错误（下面"例子"一节有完整的表），$\sgn(x_1)$ 和 $\sgn(x_1+x_2)$ 都错 0 个，ERM 任选其一。`,
      { t: 'h3', text: '④ 在菜单里挑 vs 挑哪份菜单（L06 p4）' },
      T`**Estimation（估计）vs model selection（模型选择）**：在一份固定菜单里挑最好的规则叫 **estimation**（如 logistic regression 在所有线性分类器里挑一个）；在几份菜单之间挑（4 条的单特征菜单 vs 8 条的多特征菜单，或线性 / 二次 / 三次）叫 **model selection**。两者都只能用训练数据——所以都要面对同一个问题：训练误差低，真实风险也低吗？下一章回答。`,
    ],
    why: [
      T`c07 说过：真实风险算不出，只能用 ERM。可 ERM 选出的 $\hat f_D$ 真实表现到底怎样？L06–L07 给出答案：**以高概率，真实风险 ≤ 经验风险 + 一个复杂度惩罚**。这一章搭好定义，c21 给出有限类的界，c22–c24 推广到无限类（VC 维，往年必考 T1）。`,
    ],
    intuition: [
      T`**数据是随机变量。**（L06 讲者）同一家医院 1000 个病人的数据，这个月采和五年后采就不一样。所以经验风险、ERM 选出的分类器都是随机的。对**固定**的 $f$，$R[f]$ 是常数；但代入数据依赖的 $\hat f_D$ 后，$R[\hat f_D]$ 也变成随机的。`,
      T`**经验风险是真实风险的"有噪声的估计"。** 样本越多越准（大数定律，c05）。但 ERM 是在**很多**分类器里挑经验风险最小的——候选越多，越可能挑到一个"碰巧在训练集上表现好"的，这就是过拟合的来源。`,
      { t: 'think', q: '我们真正关心经验风险还是真实风险？（L06 p11）', a: '真实风险——它衡量在没见过的数据上的表现。但它算不出（分布 $P$ 未知），所以只能用经验风险去估计，并用理论（c21）给出两者差距的上界。' },
      { t: 'story', title: '统计学习理论的起点', md: 'Vladimir Vapnik 和 Alexey Chervonenkis 在 1960–70 年代的苏联建立了这套理论：什么时候经验风险会"一致地"接近真实风险。这套理论后来催生了 SVM（第 25–30 章），VC 维（第 23 章）就是以他们两人的名字命名的。' },
    ],
    math: [
      { t: 'h3', text: 'Under-fitting / over-fitting 的风险描述（L06 p15）' },
      { t: 'table', head: ['', '经验风险 $\\hat R$', '真实风险 $R$'], rows: [
        ['Under-fitting', '大', '大'],
        ['Over-fitting', '**小**', '**大**'],
        ['理想', '小', '小（且接近 $\\hat R$）'],
      ] },
      T`真实风险的定义（L06 p14）：$R[f]=\int l(Y,f(X))\,P(X,Y)\,dX\,dY$。对 0-1 loss，它就是**泛化误差（generalisation error，期望测试错误率）**。`,
    ],
    fx: [
      {
        title: 'ERM', tex: T`\hat f_D=\argmin_{f\in\htmlClass{fx-p1}{\mathcal F}}\ \htmlClass{fx-p2}{\frac1n\sum_{i=1}^n l\big(y_i,f(\bx_i)\big)}`,
        parts: [
          { label: '模型类', note: '候选分类器的集合。这一章是有限的（4 个或 8 个）。' },
          { label: '经验风险', note: '训练集上的错误率（0-1 loss 时）。能算。' },
        ],
      },
    ],
    example: [
      { t: 'h3', text: '手算 ERM（8 个分类器）' },
      T`训练集 4 个点：`,
      { t: 'table', cls: 'compact', head: ['$i$', '$(x_1,x_2)$', '$y$'], rows: [
        ['1', '$(1,2)$', '+1'], ['2', '$(2,-1)$', '+1'], ['3', '$(-1,1)$', '−1'], ['4', '$(-2,-1)$', '−1'],
      ] },
      T`每一格：把该行的式子代入对应的点，结果 $>0$ 记 $+$，$\le0$ 记 $-$（$\sgn(0)=-1$）。例：$\sgn(x_1-x_2)$ 在点 1 $(1,2)$：$1-2=-1\le0$，记 $-$；在点 2 $(2,-1)$：$2-(-1)=3>0$，记 $+$。再和标签 $(+,+,-,-)$ 逐个比，数错几个。`,
      { t: 'table', cls: 'compact', head: ['分类器', '预测 (1,2,3,4)', '错几个', '$\\hat R$'], rows: [
        ['$\\sgn(x_1)$', '+ + − −', '0', '**0**'],
        ['$\\sgn(-x_1)$', '− − + +', '4', '1'],
        ['$\\sgn(x_2)$', '+ − + −', '2', '0.5'],
        ['$\\sgn(-x_2)$', '− + − +', '2', '0.5'],
        ['$\\sgn(x_1+x_2)$', '+ + − −', '0', '**0**'],
        ['$\\sgn(x_1-x_2)$', '− + − −', '1', '0.25'],
        ['$\\sgn(-x_1+x_2)$', '+ − + +', '3', '0.75'],
        ['$\\sgn(-x_1-x_2)$', '− − − +', '3', '0.75'],
      ] },
      T`ERM：$\sgn(x_1)$ 和 $\sgn(x_1+x_2)$ 并列最优（经验风险 0），任选其一。注意点 3 的 $x_1+x_2=0$：$\sgn(x_1+x_2)$ 和 $\sgn(-x_1-x_2)$ 在这里**都**给 $-1$（因为 $\sgn(0)=-1$），所以后者不是前者简单取反。（$\sgn(x_1-x_2)$ 在点 1：$1-2=-1\le0$ ⇒ $-1$，错。）`,
      { t: 'fade', title: '分步练习：算经验风险', plan: ['逐点算预测（$z\\le0$ 给 $-1$）', '数错误个数', '$\\hat R$ = 错误数 / $n$'], items: [
        { md: T`$f=\sgn(x_2)$，上面的 4 个点。`, steps: [
          { md: '预测 $+,-,+,-$' }, { md: '点 2、3 错，共 2 个' }, { md: '$\\hat R=2/4=0.5$' },
        ] },
        { md: T`$f=\sgn(x_1-x_2)$，点 $(1,0),(0,1),(2,2)$，标签 $+1,-1,+1$。预测 $+1,-1,-1$（第三个 $z=0$）。`, steps: [
          { ask: '错误个数 = ?', answer: 1, show: '第 3 个错' },
          { ask: T`$\hat R=?$`, answer: 0.3333, tol: 0.002, show: '$1/3$' },
        ] },
        { md: T`$f=\sgn(-x_1-x_2)$，点 $(1,1),(-1,0),(0,0),(3,-4)$，标签 $-1,+1,+1,+1$。`, steps: [
          { ask: '第 3 个点的预测 = ?（输入 1 或 −1）', answer: -1, show: '$z=0\\le0$ ⇒ $-1$（错）' },
          { ask: '错误个数 = ?', answer: 1, show: '预测 $-,+,-,+$，只有第 3 个错' },
          { ask: T`$\hat R=?$`, answer: 0.25, show: '$1/4$' },
        ] },
      ] },
    ],
    viz: [
      { id: 'poly-fit', opts: { degree: 6, test: true }, how: '训练 MSE 是**经验风险**（能算）；大量测试点上的 MSE 近似**真实风险**（理论上需要无穷多测试点）。',
        try: '把次数从 1 拉到 9：经验风险一路下降，真实风险（测试 MSE）先降后升。两者的**差距**在复杂模型上最大。c21 会在"有限模型类、损失在 $[0,1]$、i.i.d."的条件下给这个差距一个理论上界——注意这张图是平方损失 + 实数系数的多项式，不满足那些条件，所以只用来直观感受。' },
    ],
    compare: [
      { t: 'table', head: ['', 'Empirical risk', 'True risk'], rows: [
        ['定义', '$\\frac1n\\sum l(y_i,f(\\bx_i))$', '$\\mathbb E\\,l(Y,f(X))$'],
        ['需要', '训练数据', '真实分布 $P$（未知）'],
        ['能算吗', '能', '不能'],
        ['0-1 loss 时叫', '训练错误率', '泛化误差 / 期望测试错误率'],
        ['随机吗', '是（$D$ 随机）', '固定 $f$ 时是常数'],
      ] },
    ],
    pitfalls: [
      ['$\\sgn(0)=+1$', 'L06 约定 $\\sgn(0)=-1$。'],
      ['真实风险可以用训练集算', '训练集只能算经验风险。'],
      ['ERM 选出的分类器真实风险最小', '只保证经验风险最小；真实风险需要泛化界来控制。'],
      ['L06 的 8 个分类器有权重要学', '没有，它们是固定规则；"学习"就是从中挑一个。'],
    ],
    quiz: [
      { type: 'num', q: 'L06 的多特征类有多少个分类器？', answer: 8, explain: T`L06 的多特征类由两部分组成。第一部分是单特征类的 4 个：$\sgn(x_1)$、$\sgn(-x_1)$、$\sgn(x_2)$、$\sgn(-x_2)$。第二部分同时用两个特征：$x_1$、$x_2$ 前面各取 $+$ 或 $-$，共 $2\times2=4$ 种，即 $\sgn(x_1+x_2)$、$\sgn(x_1-x_2)$、$\sgn(-x_1+x_2)$、$\sgn(-x_1-x_2)$。合计 $4+4=8$，所以 $|\mathcal F|=8$。**多特征类包含单特征类的 4 个**，只数后面 4 个是常见错误。` },
      { type: 'num', q: '分类器在 20 个训练样本上错了 3 个。0-1 loss 下经验风险？', answer: 0.15, explain: T`0-1 loss 下的 empirical risk（经验风险）$\hat R_D[f]$ 就是训练集上的错误率：错一个记 1、对一个记 0，再取平均。题目里错了 3 个，训练样本数 $n=20$。$\hat R_D[f]=3/20=0.15$。注意这是算得出的训练风险，**不是真实风险 $R[f]$**，后者要对未知的数据分布求期望，算不出来。` },
      { type: 'mc', q: '"经验风险小、真实风险大"叫：', options: ['under-fitting', 'over-fitting', 'ERM', 'model selection'], answer: 1, explain: T`L06 p15 用两种风险定义两种失败：under-fitting（欠拟合）是经验风险 $\hat R_D[f]$ 和真实风险 $R[f]$ 都大；over-fitting（过拟合）是经验风险小、真实风险大。**题目说的"经验风险小、真实风险大"正是 over-fitting**：模型在训练集上看着很好，在没见过的数据上很差。under-fitting 不对，因为它的经验风险也大；ERM 和 model selection 是方法的名字，不是现象。L06 p15。` },
      { type: 'show', q: '（英文）What is the difference between empirical risk and true risk?', answer: T`Empirical risk is the average loss of a classifier on the training sample, $\hat R_D[f]=\frac1n\sum_i l(y_i,f(\mathbf x_i))$, which we can compute. True risk is the expected loss under the (unknown) data distribution, $R[f]=\mathbb E\,l(Y,f(X))$, which measures performance on unseen data but cannot be computed.`, qzh: '经验风险（empirical risk）和真实风险（true risk）有什么区别？', azh: T`经验风险（empirical risk）是分类器在训练样本上的平均损失 $\hat R_D[f]=\frac1n\sum_i l(y_i,f(\mathbf x_i))$，我们能算出来。真实风险（true risk）是在（未知的）数据分布下的期望损失 $R[f]=\mathbb E\,l(Y,f(X))$，它衡量模型在未见数据上的表现，但无法计算。` },
    ],
  });

  /* =====================================================================
   * c21 · 有限类泛化界、SRM（L06 p16–p33）
   * ===================================================================== */
  add({
    id: 'c21', week: 'W3', lec: 'L06', pages: 'L06 p16–p33', star: 2,
    title: '有限类泛化界、SRM', en: 'Generalisation bound for finite classes; structural risk minimisation',
    summary: '有限模型类、损失在 $[0,1]$ 时：以至少 $1-\\delta$ 的概率，$R[\\hat f_D]\\le\\hat R_D[\\hat f_D]+\\sqrt{\\frac{\\log|\\mathcal F|+\\log(1/\\delta)}{2n}}$。模型类越大惩罚越大，样本越多惩罚越小。**SRM** 就是选使右边最小的模型类。',
    prereq: ['c20'],
    symbols: [
      [T`$R,\ \hat R_D,\ \mathcal F,\ \hat f_D$`, T`沿用第 20 章：真实风险、训练集 $D$ 上的经验风险（训练误差）、模型类（候选分类器的集合）、在 $D$ 上训练出来的分类器`],
      [T`$\delta$`, T`失败概率（如 0.1），$1-\delta$ 是置信度`],
      [T`$\varepsilon$`, T`误差上界（复杂度惩罚项）`],
      [T`$\log$`, T`自然对数 $\ln$`],
      [T`$\Pr[A\text{ or }B]$`, T`$A$ 或 $B$ 至少一个发生的概率`],
      [T`$e^{-2n\varepsilon^2}$`, T`Hoeffding 不等式给的尾概率上界`],
    ],
    goals: [
      '写出有限类泛化界，逐项解释（$|\\mathcal F|$、$\\delta$、$n$ 的作用）',
      '代数字算 $\\varepsilon$；用 SRM 在两个模型类之间做选择',
      '知道证明思路的三个积木：union bound、Hoeffding、对所有 $f$ 一致（不要求会证）',
      '说出这个界的局限（只对有限类；损失须在 $[0,1]$；可能很悲观）',
    ],
    types: ['T12'],
    notExam: 'L06 讲者明确说证明"不会让你们证"（p20–p31 的 proof sketch 只为理解来源）；Hoeffding 不等式的证明也不在范围内（p23）。',
    what: [
      { t: 'h3', text: '① 问题：训练误差低，真实风险就低吗？（L06 p16）' },
      T`c20 选出了训练误差（经验风险）最小的分类器 $\hat f$。但我们真正关心的是它在**新数据**上的表现（真实风险）。两者能差多少？这一章给一个数：**真实风险 ≤ 训练风险 + 一个惩罚项**。`,
      T`先看数字：c20 的单特征类有 $|\mathcal F|=4$ 个分类器，$n=100$ 个训练样本，要求 95% 的把握（$\delta=0.05$）。惩罚项 $=\sqrt{\frac{\ln4+\ln20}{200}}\approx0.148$。也就是说：在 95% 的训练集上，挑出来的分类器真实风险最多比训练风险高 0.148。`,
      { t: 'h3', text: '② 定理：真实风险 ≤ 训练误差 + 复杂度惩罚（L06 p17）' },
      T`**定理**（L06 p17）：模型类 $\mathcal F$ 有限、且在看到数据**之前**就固定，训练集是 $n$ 个 [[i.i.d.]] 样本，损失在 $[0,1]$（如 0-1 loss，p32）。则以至少 $1-\delta$ 的概率（对训练集的随机性而言）：`,
      { t: 'math', tex: T`R[\hat f_D]\le\hat R_D[\hat f_D]+\sqrt{\frac{\log|\mathcal F|+\log(1/\delta)}{2n}}` },
      { t: 'slide', src: 'L06/p17', caption: '老师的原页：左边真实风险（算不出来）≤ 训练误差（算得出来）+ 根号里的"复杂度惩罚"。下方是 $|\\mathcal F|=8,\\ \\delta=0.1$ 的代入例子。' },
      T`特点（L06 p17、p19）：**不需要知道分布 $P$**；是**高概率**保证而非必然（训练集可能"不走运"）；对所有分布都成立（worst-case）；$|\mathcal F|$ 是第一个"模型复杂度"的度量。`,
      T`**逐项读公式**（讲者建议"一次看一项"）：`,
      { t: 'ul', items: [
        T`$|\mathcal F|$ 变大 ⇒ 惩罚变大：候选越多，越可能挑到"碰巧好"的。但只以 $\log$ 增长——候选翻倍只多一点点。`,
        T`$\delta$ 变小（要求更确定）⇒ $\log(1/\delta)$ 变大 ⇒ 惩罚变大。`,
        T`$n$ 变大 ⇒ 惩罚按 $1/\sqrt n$ 下降。讲者："More samples never hurt you."`,
      ] },
      { t: 'h3', text: '③ 用它来选模型类：SRM（L06 p18）' },
      T`**Structural Risk Minimisation（SRM，结构风险最小化）**（L06 p18）：有多个候选模型类时（如单特征类 vs 多特征类），选使"经验风险 + 惩罚项"最小的那个类。`,
      T`**SRM 的权衡**（L06 p18）：简单类经验风险大、惩罚小；复杂类经验风险小、惩罚大——和 c19 的 bias–variance 是同一个故事的另一种讲法。`,
    ],
    why: [
      T`这是第一次给"过拟合"一个**定量**的回答：真实风险最多比训练风险高 $\varepsilon$，而 $\varepsilon$ 由模型复杂度和样本量决定。T12 的泛化界计算题就基于它；c24 的 VC 界是同一个形状，只是把 $\log|\mathcal F|$ 换成和 VC 维相关的量。`,
    ],
    intuition: [
      { t: 'think', q: '样本量变成 4 倍，$\\varepsilon$ 变成原来的几倍？', a: T`$\varepsilon\propto1/\sqrt n$，所以变成 $1/2$。` },
      { t: 'story', title: 'Hoeffding 与 PAC', md: 'Hoeffding 不等式来自 Wassily Hoeffding 1963 年的论文。把它和 union bound 结合来分析学习算法，是 Leslie Valiant 1984 年提出的 PAC（Probably Approximately Correct）学习框架的核心思想——"大概率（probably）近似正确（approximately correct）"正是这个界的形状。Valiant 因此获得 2010 年图灵奖。' },
    ],
    math: [
      { t: 'h3', text: '证明思路（了解即可，L06 p20–p31）' },
      { t: 'ol', items: [
        T`**Union bound（联合界）**（p21–p22）：$\Pr[A_1\text{ or }\cdots\text{ or }A_k]\le\sum_j\Pr[A_j]$（重叠部分被重复计算，所以是上界）。`,
        T`**Hoeffding's inequality（Hoeffding 不等式）**（p23）：$Z_1,\dots,Z_n$ i.i.d.、取值在 $[0,1]$，则 $\Pr\big[\mathbb EZ-\frac1n\sum_iZ_i>\varepsilon\big]\le e^{-2n\varepsilon^2}$。经验平均不太可能比期望低很多。`,
        T`对**固定**的 $f$，$l(y_i,f(\bx_i))$ 就是这样的 $Z_i$，所以 $\Pr[R[f]-\hat R_D[f]>\varepsilon]\le e^{-2n\varepsilon^2}$（p30）。`,
        T`但 $\hat f_D$ 依赖数据，不是固定的。所以要求**对所有** $f\in\mathcal F$ 同时成立（"最高的人都不比 X 高，那么所有人都不比 X 高"，p25–p26）。坏事件"某个 $f$ 偏差 $>\varepsilon$"用 union bound：概率 $\le|\mathcal F|e^{-2n\varepsilon^2}$（p29–p31）。`,
        T`令 $\delta=|\mathcal F|e^{-2n\varepsilon^2}$，解出 $\varepsilon=\sqrt{\frac{\log|\mathcal F|+\log(1/\delta)}{2n}}$（p31）。`,
      ] },
      { t: 'h3', text: '局限（L06 p32–p33）' },
      { t: 'ul', items: [
        T`只对**有限**类。$f(\bx)=\sgn(w_1x_1+w_2x_2)$（$w$ 取所有实数）有无穷多个分类器，$\log|\mathcal F|=\infty$，界失效 → L07 用 VC 维解决。`,
        T`需要损失在 $[0,1]$、数据 i.i.d.。`,
        T`对任何学习算法都成立，所以可能很**悲观**（宽松）。`,
      ] },
    ],
    fx: [
      {
        title: '有限类泛化界', tex: T`\htmlClass{fx-p1}{R[\hat f_D]}\le\htmlClass{fx-p2}{\hat R_D[\hat f_D]}+\sqrt{\frac{\htmlClass{fx-p3}{\log|\mathcal F|}+\htmlClass{fx-p4}{\log(1/\delta)}}{\htmlClass{fx-p5}{2n}}}`,
        parts: [
          { label: '真实风险', note: '我们关心但算不出的量。' },
          { label: '经验风险', note: '训练错误率，能算。' },
          { label: 'log|F|', note: '模型类的复杂度。候选越多惩罚越大（对数增长）。' },
          { label: 'log(1/δ)', note: '置信度的代价：想更确定（$\\delta$ 小），界就更松。' },
          { label: '2n', note: '样本量在分母：$n$ 越大，惩罚以 $1/\\sqrt n$ 下降。' },
        ],
      },
    ],
    example: [
      { t: 'h3', text: '例 1：L06 p17 的数字' },
      T`$|\mathcal F|=8$，$\delta=0.1$，$n=100$：$\varepsilon=\sqrt{\frac{\ln8+\ln10}{200}}=\sqrt{\frac{2.079+2.303}{200}}=\sqrt{0.0219}\approx0.148$。若训练错误率 0.05，则以 90% 概率真实风险 $\le0.198$。$n=5000$ 时 $\varepsilon\approx0.021$。`,
      { t: 'h3', text: '例 2：SRM' },
      T`$n=100$，要求整体 90% 置信。单特征类 $|\mathcal F|=4$，最好的经验风险 0.20；多特征类 $|\mathcal F|=8$，最好的经验风险 0.15。`,
      { t: 'steps', items: [
        T`**同时比较两个类**：两个界都要成立，用 union bound 把 $\delta=0.1$ 分给两个类，各 $\delta_j=0.05$（$\ln(1/0.05)=\ln20$）。`,
        T`（考试会给对数值：$\ln4\approx1.386$，$\ln8\approx2.079$，$\ln20\approx2.996$。）单特征：$\varepsilon=\sqrt{\frac{\ln4+\ln20}{200}}=\sqrt{\frac{4.382}{200}}=\sqrt{0.0219}\approx0.148$，上界 $0.20+0.148=0.348$`,
        T`多特征：$\varepsilon=\sqrt{\frac{\ln8+\ln20}{200}}=\sqrt{\frac{5.075}{200}}=\sqrt{0.0254}\approx0.159$，上界 $0.15+0.159=0.309$`,
        T`SRM 选上界更小的**多特征类**。（课件 p18 只示意比较两类，没讨论同时置信度；严格做法是候选类事先固定，并让 $\sum_j\delta_j\le\delta$。）`,
      ] },
      { t: 'fade', title: '分步练习：算泛化界（考试会给 $\\ln$ 值）', plan: [T`算 $\ln|\mathcal F|+\ln(1/\delta)$`, T`除以 $2n$ 再开根号得 $\varepsilon$`, T`上界 $=\hat R+\varepsilon$`], items: [
        { md: T`$|\mathcal F|=8$，$\delta=0.1$，$n=1000$，$\hat R=0.1$（$\ln8\approx2.079$，$\ln10\approx2.303$）。`, steps: [
          { md: '$2.079+2.303=4.382$' }, { md: T`$\sqrt{4.382/2000}\approx0.0468$` }, { md: '上界 $\\approx0.147$' },
        ] },
        { md: T`$|\mathcal F|=16$，$\delta=0.1$，$n=200$（$\ln16\approx2.773$）。`, steps: [
          { ask: '分子 = ?', answer: 5.076, tol: 0.01, show: '$2.773+2.303=5.076$' },
          { ask: T`$\varepsilon=?$`, answer: 0.1126, tol: 0.002, show: T`$\sqrt{5.076/400}\approx0.113$` },
        ] },
        { md: T`$|\mathcal F|=8$，$\delta=0.05$，$n=400$，$\hat R=0.2$（$\ln20\approx2.996$）。`, steps: [
          { ask: '分子 = ?', answer: 5.075, tol: 0.01, show: '$2.079+2.996=5.075$' },
          { ask: T`$\varepsilon=?$`, answer: 0.0796, tol: 0.002, show: T`$\sqrt{5.075/800}\approx0.0796$` },
          { ask: '上界 = ?', answer: 0.2796, tol: 0.003, show: '$0.2+0.0796\\approx0.280$' },
        ] },
      ] },
    ],
    viz: [
      { id: 'gen-bound', how: '横轴是样本量 $n$（对数刻度），曲线是惩罚项 $\\varepsilon$。可以改 $|\\mathcal F|$、$\\delta$ 和经验风险，读数给出"以 $1-\\delta$ 概率，$R\\le\\hat R+\\varepsilon$"。',
        try: '① 把 $|\\mathcal F|$ 从 8 改成 800：曲线只上移一点（$\\log$ 增长）。② $\\delta$ 从 0.1 改到 0.01：同样只上移一点。③ 把 $n$ 从 100 拉到 10000：$\\varepsilon$ 降到原来的 1/10（$1/\\sqrt n$）。结论：样本量的影响最大。' },
    ],
    compare: [
      { t: 'table', head: ['', 'Bias–variance（c19）', '泛化界（本章）'], rows: [
        ['依赖数据分布？', '是（要知道 $\\mathbb E Y$ 等）', '否（对所有分布成立）'],
        ['有限样本？', '是期望意义', '是，有限 $n$ 的高概率保证'],
        ['复杂度度量', '没有明确定义', '$|\\mathcal F|$（之后是 VC 维）'],
        ['给出什么', '误差的分解', '真实风险的上界'],
      ] },
      T`（L06 p6：之前的统计理论多是渐近的、依赖分布的；这里想要有限样本、与分布无关、与学习器无关的理论。）`,
      { t: 'exam', md: T`**Interpreting the finite-class bound:** For a finite class $\mathcal F$ fixed before seeing the data, $n$ i.i.d. examples and a loss in $[0,1]$, with probability at least $1-\delta$ over the training sample (simultaneously for all $f\in\mathcal F$, in particular the ERM choice $\hat f$), $R[\hat f]\le\hat R[\hat f]+\sqrt{(\log|\mathcal F|+\log(1/\delta))/(2n)}$. The class size and the confidence enter logarithmically inside the square root, and the penalty shrinks as $1/\sqrt n$ with more data. Structural risk minimisation chooses the model class minimising this upper bound, trading training error against complexity.` },
    ],
    pitfalls: [
      ['界以概率 1 成立', '以至少 $1-\\delta$ 的概率成立。'],
      ['$|\\mathcal F|$ 加倍，惩罚加倍', '只在根号内的 $\\log$ 里加 $\\log2$。'],
      ['适用于线性分类器（权重为实数）', '那是无限类，要用 VC 维（c24）。'],
      ['要会证明 Hoeffding', '不考（L06 p23）；知道它说"经验平均不太可能远低于期望"即可。'],
      ['$\\log$ 是以 10 为底', '自然对数 $\\ln$。'],
    ],
    quiz: [
      { type: 'num', q: '$|\\mathcal F|=1$，$\\delta=e^{-4}$，$n=8$。$\\varepsilon=?$', answer: 0.5, explain: T`要算有限类泛化界里的惩罚项 $\varepsilon=\sqrt{\frac{\log|\mathcal F|+\log(1/\delta)}{2n}}$（log 是自然对数 ln）。逐项代入：$|\mathcal F|=1$ ⇒ $\ln1=0$；$\delta=e^{-4}$ ⇒ $1/\delta=e^{4}$ ⇒ $\ln(1/\delta)=4$；$n=8$ ⇒ $2n=16$。$\varepsilon=\sqrt{(0+4)/16}=\sqrt{0.25}=0.5$。含义：以至少 $1-e^{-4}\approx98\%$ 的概率，真实风险最多比训练风险高 0.5。**陷阱是分母忘了乘 2**，用 8 会得到 $\sqrt{0.5}\approx0.707$。`, qzh: T`已知 $|\mathcal F|=1$，$\delta=e^{-4}$，$n=8$，求 $\varepsilon$。` },
      { type: 'mc', q: '$n$ 变为原来的 9 倍，$\\varepsilon$ 变为：', options: ['1/9', '1/3', '1/81', '不变'], answer: 1, explain: T`惩罚项 $\varepsilon=\sqrt{\frac{\log|\mathcal F|+\log(1/\delta)}{2n}}$ 里 $n$ 在根号下的分母，所以 $\varepsilon\propto1/\sqrt n$。$n$ 变成 $9n$，$\varepsilon$ 就变成原来的 $1/\sqrt9=1/3$。**陷阱是忘了根号，选 1/9**。同理，想把 $\varepsilon$ 减半，样本要增加到 4 倍。` },
      { type: 'mc', q: 'SRM 选择的是：', options: ['经验风险最小的类', '模型类最小的类', '经验风险 + 复杂度惩罚最小的类', '测试误差最小的类'], answer: 2, explain: T`SRM（structural risk minimisation，结构风险最小化）在几个候选模型类之间选择时，看的是泛化界的右边 $\hat R_D[\hat f_D]+\sqrt{\frac{\log|\mathcal F|+\log(1/\delta)}{2n}}$，即经验风险加复杂度惩罚。简单类经验风险大、惩罚小，复杂类正好相反，**SRM 选两者之和最小的类**。只看经验风险会总选最复杂的类（过拟合）；只看类的大小会偏向太简单的类（欠拟合）；测试误差不能拿来做选择。L06 p18。` },
      { type: 'mc', q: '证明里为什么要对**所有** $f\\in\\mathcal F$ 同时成立？', options: ['因为 $\\hat f_D$ 依赖数据，事先不知道是哪个', '为了让界更紧', '因为 Hoeffding 只对一个 $f$ 成立就够了', '因为 $|\\mathcal F|$ 无穷'], answer: 0, explain: 'L06 p25–p28。' },
      { type: 'show', q: '（英文）Why does the finite-class bound not apply to linear classifiers with real weights?', answer: T`The class $\{\mathrm{sgn}(\mathbf w'\mathbf x)\}$ with real-valued weights is infinite (uncountable), so $\log|\mathcal F|=\infty$ and the bound is vacuous. We need a complexity measure that stays finite for infinite classes, such as the growth function / VC dimension (L07).`, qzh: '为什么有限函数类的泛化界（finite-class bound）不适用于权重为实数的线性分类器（linear classifiers）？', azh: T`权重取实数值时，函数类 $\{\mathrm{sgn}(\mathbf w'\mathbf x)\}$ 是无限的（不可数，uncountable），所以 $\log|\mathcal F|=\infty$，这个界变得没有意义（vacuous）。我们需要一种对无限函数类也保持有限的复杂度度量，例如增长函数（growth function）/ VC 维（VC dimension）（L07）。` },
    ],
  });

  /* =====================================================================
   * r03 · W3 复习
   * ===================================================================== */
  SML.content.add(SML.review({
    id: 'r03', week: 'W3', title: 'W3 复习：正则化与泛化（有限类）', en: 'Week 3 review',
    summary: '本周两条线：**正则化**（ridge / lasso / MAP）解决不可逆和过拟合；**泛化**（bias–variance、经验 vs 真实风险、有限类界）解释过拟合从哪来、能控制到什么程度。往年高频简答：ridge 为什么有用、lasso vs ridge、bias–variance 分解、正则化 = MAP。',
    keypoints: [
      [T`共线 / $n<p$ ⇒ $\mathbf X'\mathbf X$ 不可逆（ill-posed）；ridge $(\mathbf X'\mathbf X+\lambda\mathbf I)^{-1}\mathbf X'\by$ 给每个特征值加 $\lambda$，总可逆。`, 'c16'],
      [T`Lasso $+\lambda\|\bw\|_1$：稀疏、特征选择、无闭式解；ridge ↔ Gaussian 先验 MAP，lasso ↔ Laplace 先验 MAP。`, 'c17'],
      [T`Underfit：训练测试都差；overfit：训练好测试差。选模型用验证集（显式选次数或选 $\lambda$），最后用全部数据重训。`, 'c18'],
      [T`$\mathbb E[(Y-\hat f)^2]=\text{bias}^2+\text{variance}+\mathrm{Var}[Y]$；复杂度↑ ⇒ bias↓ variance↑；正则↑ ⇒ bias↑ variance↓。`, 'c19'],
      [T`经验风险能算、真实风险不能；ERM 选经验风险最小的；L06 的 4 / 8 个固定分类器，$\sgn(0)=-1$。`, 'c20'],
      [T`有限类：$R\le\hat R+\sqrt{(\log|\mathcal F|+\log(1/\delta))/(2n)}$（概率 $\ge1-\delta$，损失 $\in[0,1]$）；SRM 选右边最小的类。`, 'c21'],
    ],
    map: [
      { t: 'table', head: ['同一个现象', '正则化视角', 'Bayesian 视角', '理论视角'], rows: [
        ['模型太灵活', '加惩罚 $\\lambda R(\\bw)$', '加先验 $p(\\bw)$', '复杂度项 $\\log|\\mathcal F|$ 大'],
        ['数据太少', '需要更大 $\\lambda$', '先验更重要', '$\\varepsilon\\propto1/\\sqrt n$ 大'],
        ['结果', 'bias↑ variance↓', 'MAP 被拉向先验', '界变紧（若经验风险没涨太多）'],
      ] },
      T`一句话：**正则化 = 先验 = 控制复杂度 = 用一点 bias 换大量 variance。**`,
    ],
    recall: [
      { q: 'L05 p3 正则化的三个作用？', a: '改善 ill-conditioning；防止 overfitting；加入先验知识。', ch: 'c16' },
      { q: '克隆特征为什么让权重不可解释？', a: T`$(w_1+\delta,w_2-\delta)$ 对任意 $\delta$ 预测完全一样，解有无穷多个。`, ch: 'c16' },
      { q: 'Ridge 的闭式解？为什么总可逆？', a: T`$(\mathbf X'\mathbf X+\lambda\mathbf I)^{-1}\mathbf X'\by$；PSD 的 $\mathbf X'\mathbf X$ 每个特征值加 $\lambda>0$ ⇒ 正定。`, ch: 'c16' },
      { q: 'Ill-posed vs ill-conditioned？', a: '解不存在/不唯一 vs 解唯一但对扰动极敏感（特征值接近 0）。', ch: 'c16', qzh: '不适定（ill-posed）与病态（ill-conditioned）有什么区别？' },
      { q: 'L05 p18 三列表：先验分别是？', a: '线性回归：无；ridge：Gaussian $e^{-\\lambda\\|\\bw\\|_2^2}$；lasso：Laplace $e^{-\\lambda\\|\\bw\\|_1}$。', ch: 'c17' },
      { q: '为什么 lasso 稀疏？', a: '$L_1$ 菱形的尖角在坐标轴上，RSS 椭圆往往先碰到尖角 ⇒ 某坐标为 0。', ch: 'c17' },
      { q: '一维 lasso 的解？', a: T`$w=\mathrm{soft}(\bx'\by,\lambda/2)/\bx'\bx$；$|\bx'\by|\le\lambda/2$ 时为 0。`, ch: 'c17' },
      { q: '显式模型选择的 4 步？', a: '分 train/validate → 每个候选在 train 上训练 → validate 上评估选最好 → 用全部数据重训。', ch: 'c18' },
      { q: 'Bishop 例子 $\\ln\\lambda=-\\infty,-18,0$ 分别？', a: 'overfit 振荡、合适、underfit 近水平线。', ch: 'c18' },
      { q: '写出 bias–variance 分解。', a: T`$\mathbb E[(Y-\hat f)^2]=(\mathbb EY-\mathbb E\hat f)^2+\mathrm{Var}\hat f+\mathrm{Var}Y$。`, ch: 'c19' },
      { q: '推导 bias–variance 用到哪两个事实？', a: T`$\mathbb E Z^2=\mathrm{Var}Z+(\mathbb EZ)^2$；测试 $Y$ 与训练集独立 ⇒ $\mathbb E[Y\hat f]=\mathbb EY\,\mathbb E\hat f$。`, ch: 'c19' },
      { q: '经验风险 vs 真实风险？', a: T`$\frac1n\sum l(y_i,f(\bx_i))$ 能算 vs $\mathbb E\,l(Y,f(X))$ 不能算。`, ch: 'c20' },
      { q: 'L06 多特征类的 8 个分类器？', a: T`$\sgn(\pm x_1)$、$\sgn(\pm x_2)$、$\sgn(\pm x_1\pm x_2)$。`, ch: 'c20' },
      { q: '有限类泛化界？成立条件？', a: T`以概率 $\ge1-\delta$：$R\le\hat R+\sqrt{(\log|\mathcal F|+\log(1/\delta))/(2n)}$；有限类、i.i.d.、损失 $\in[0,1]$。`, ch: 'c21' },
      { q: '证明的两个积木？', a: 'Union bound（对所有 $f$）+ Hoeffding（对每个固定 $f$）。', ch: 'c21' },
    ],
    formulas: [
      ['$\\hat\\bw=(\\mathbf X\'\\mathbf X+\\lambda\\mathbf I)^{-1}\\mathbf X\'\\by$', 'ridge', 'L05 p14'],
      ['$\\min\\|\\by-\\mathbf X\\bw\\|^2+\\lambda\\|\\bw\\|_1$', 'lasso', 'L05 p18'],
      ['$\\argmin L(\\text{data},\\boldsymbol\\theta)+\\lambda R(\\boldsymbol\\theta)$', '正则化模板', 'L05 p26'],
      ['$\\mathbb E[(Y-\\hat f)^2]=(\\mathbb EY-\\mathbb E\\hat f)^2+\\mathrm{Var}\\hat f+\\mathrm{Var}Y$', 'bias–variance', 'L05 p37'],
      ['$\\hat R_D[f]=\\frac1n\\sum l(y_i,f(\\bx_i))$', '经验风险', 'L06 p12'],
      ['$R[\\hat f]\\le\\hat R[\\hat f]+\\sqrt{\\frac{\\log|\\mathcal F|+\\log(1/\\delta)}{2n}}$', '有限类泛化界', 'L06 p17'],
      ['$\\Pr[\\mathbb EZ-\\bar Z>\\varepsilon]\\le e^{-2n\\varepsilon^2}$', 'Hoeffding', 'L06 p23'],
    ],
    exam: [
      ['Ridge 为什么解决共线 / 不可逆', 'T13 预测高频', '[T13](#/T13/predicted)'],
      ['Lasso vs ridge 区别', 'T13 预测高频', '[T13](#/T13/predicted)'],
      ['Bias–variance 分解与影响因素', 'T13 预测高频；2021 Q8（何时想要高 bias 的估计量）', '[T13](#/T13)'],
      ['正则化 = MAP（先验对应关系）', '2021 Q13(a) 相关；T9', '[T9](#/T09)'],
      ['泛化界代数、SRM 选择', 'T12', '[T12](#/T12)'],
    ],
    quiz: [
      { type: 'num', q: '$\\mathbf X\'\\mathbf X=\\begin{bmatrix}2&2\\\\2&2\\end{bmatrix}$，$\\lambda=1$，$\\mathbf X\'\\by=(4,4)\'$。ridge 的 $\\hat w_1$？', answer: 0.8, explain: '$(\\mathbf X\'\\mathbf X+\\mathbf I)=\\begin{bmatrix}3&2\\\\2&3\\end{bmatrix}$，逆：行列式 $3\\times3-2\\times2=5$，主对角对调、副对角变号、除以 5 ⇒ $\\frac15\\begin{bmatrix}3&-2\\\\-2&3\\end{bmatrix}$；乘 $(4,4)\'$：$\\hat w_1=\\frac15(3\\times4-2\\times4)=\\frac15(12-8)=0.8$。' },
      { type: 'num', q: '一维 lasso：$\\bx\'\\bx=5$，$\\bx\'\\by=-6$，$\\lambda=2$。$w=?$', answer: -1, explain: '软阈值：$\\sgn(-6)\\max(6-1,0)=-5$，$w=-5/5=-1$。' },
      { type: 'num', q: '$\\mathbb EY=0$，$\\mathrm{Var}Y=0.3$，三个训练集上的预测 $0.5,0.5,0.5$。期望测试误差？', answer: 0.55, explain: 'bias² 0.25，variance 0，噪声 0.3。' },
      { type: 'num', q: '$|\\mathcal F|=20$（$\\ln20\\approx3$），$\\ln(1/\\delta)=1$，$n=50$。$\\varepsilon\\approx?$', answer: 0.2, tol: 0.003, explain: '$\\sqrt{(3+1)/100}=0.2$。', qzh: T`已知 $|\mathcal F|=20$（$\ln20\approx3$），$\ln(1/\delta)=1$，$n=50$，求 $\varepsilon$ 的近似值。` },
      { type: 'mc', q: '下面哪个组合正确？', options: ['ridge ↔ Laplace 先验', 'lasso ↔ 有闭式解', 'ridge ↔ Gaussian 先验', 'lasso ↔ 圆形约束'], answer: 2, explain: 'L05 p18。' },
      { type: 'mc', q: '模型复杂度增加时，训练误差和测试误差通常：', options: ['都下降', '训练↓，测试先↓后↑', '都上升', '训练↑，测试↓'], answer: 1, explain: 'L05 p39。' },
      { type: 'show', q: '（英文）Why does increasing the regularisation parameter increase bias but reduce variance?', answer: T`A larger $\lambda$ constrains the weights more strongly towards zero, so the model is less able to fit the true function (higher bias), but its predictions depend less on the particular training sample (lower variance).`, qzh: '为什么增大正则化参数（regularisation parameter）会增大偏差（bias）、但减小方差（variance）？', azh: T`更大的 $\lambda$ 更强地把权重约束向 0，因此模型更难拟合真实函数（偏差更高，higher bias），但它的预测对具体训练样本的依赖更小（方差更低，lower variance）。` },
    ],
    next: '下一周（W4）：VC 维与 SVM。你会把本周的有限类界推广到无限类（线性分类器），这正是往年必考的 VC 维计算题（T1）的理论来源。',
  }));
})(window);
