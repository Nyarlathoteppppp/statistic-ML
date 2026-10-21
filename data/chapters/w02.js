/* W2 · L03 线性回归 + L04 迭代优化与 logistic regression — chapters c10–c15 and review r02. */
(function (root) {
  'use strict';
  const SML = root.SML;
  const T = String.raw;
  const add = (c) => SML.content.add(SML.chapter(c));

  /* =====================================================================
   * c10 · 线性回归与最小二乘（L03 p4–p10）
   * ===================================================================== */
  add({
    id: 'c10', week: 'W2', lec: 'L03', pages: 'L03 p4–p10', star: 3,
    keyEn: [
      T`Linear regression predicts a continuous response as $\hat y=\bx'\bw$; the dummy feature $x_0=1$ turns the intercept $w_0$ into an ordinary weight.`,
      T`It minimises the residual sum of squares (RSS): $\hat\bw=\argmin_\bw\sum_{i=1}^n(y_i-\bx_i'\bw)^2=\argmin_\bw\|\by-\mathbf X\bw\|^2$.`,
      T`Set the partial derivatives to zero; in 1D, $b=\frac{n\sum x_iy_i-\sum x_i\sum y_i}{n\sum x_i^2-(\sum x_i)^2}$ and $a=\bar y-b\bar x$.`,
      T`Squared loss is differentiable, gives a closed-form solution and equals the MLE under Gaussian noise, but it is sensitive to outliers.`,
    ],
    keyZh: [
      T`线性回归（linear regression）用特征的加权和预测一个连续数值；加一个恒为 1 的哑特征（dummy feature）$x_0=1$，截距 $w_0$ 就变成普通权重，可以写进点积。`,
      T`它最小化残差平方和（RSS）：每个点"真实值 − 预测值"平方后全部加起来；上面的求和写法和向量长度平方写法是同一个量。`,
      T`求法：对每个参数求偏导、令为 0。一维时斜率 $b$ 套上面的公式，截距 $a$ = $y$ 的平均 − $b$ × $x$ 的平均（所以直线一定穿过均值点）。`,
      T`用平方损失的好处：可导、有闭式解、等于高斯噪声（Gaussian noise）下的 MLE；缺点是对离群点（outlier）敏感，因为大误差平方后被放大。`,
    ],
    examQ: [
      { src: '2026 practice Q1a / 2025 practice Q1a', q: T`In words or a mathematical expression, what quantity is minimised by linear regression?`,
        a: T`The residual sum of squares between the targets and the predictions, $\sum_{i=1}^n(y_i-\hat y_i)^2=\|\by-\mathbf X\bw\|^2$ (equivalently the mean squared error); under Gaussian noise this is maximum likelihood.`,
        qzh: T`用文字或数学表达式说明：线性回归（linear regression）最小化的是什么量？`,
        azh: T`目标值与预测值之间的残差平方和（residual sum of squares），$\sum_{i=1}^n(y_i-\hat y_i)^2=\|\by-\mathbf X\bw\|^2$（等价地，也可以说是均方误差 mean squared error）；在高斯噪声（Gaussian noise）假设下，这就是最大似然（maximum likelihood）。` },
    ],
    genesis: T`要预测一个数（比如由温度预测湿度），最简单的猜法是一条直线。可数据点不会全落在一条线上，任何一条线都有误差，怎么挑"最好"的那条？得把一堆误差合成一个数来比：直接相加，正负会抵消；加绝对值不会抵消，但绝对值在 0 处有尖角，没法靠"求导等于 0"一步解出来。**加平方既不会抵消，又处处可导，最好的直线能用公式直接算出来**，这就是最小二乘。（Legendre 1805 年发表了最小二乘法；Gauss 1809 年把它和正态分布的误差联系起来，那是 c11 的内容。）`,
    title: '线性回归与最小二乘', en: 'Linear regression and least squares',
    summary: '用一条直线（高维是超平面）预测一个数。"最好的直线" = 让**残差平方和（RSS）**最小的那条。往年卷原题：*what quantity is minimised by linear regression?* 答案就是 RSS。',
    prereq: ['c03', 'c07'],
    symbols: [
      [T`$y_i$, $\hat y_i$`, T`第 $i$ 个样本的真实值、预测值`],
      [T`$\bx_i$`, T`第 $i$ 个样本的特征向量（含 $x_0=1$）`],
      [T`$\bw$`, T`权重向量；$w_0$ 是截距（intercept / bias）`],
      [T`$\bx'$（一撇）`, T`转置（transpose）：列向量变行向量，$\bx'\bw=\sum_jx_jw_j$ 是点积，结果是一个数（c03）`],
      [T`$\by$`, T`所有 $y_i$ 排成的列向量 $(y_1,\dots,y_n)'$`],
      [T`$\mathbf X$`, T`$n\times(m+1)$ 的数据矩阵，第 $i$ 行是 $\bx_i'$`],
      [T`$\|\cdot\|$`, T`向量长度（$L_2$ norm）；$\|\by-\mathbf X\bw\|^2$ = 所有残差的平方和`],
      [T`$\argmin_\bw$`, T`让后面最小的那个 $\bw$（不是最小值本身）`],
      [T`$\frac{\partial L}{\partial a}$`, T`偏导：只把 $a$ 当变量、其余当常数求导`],
    ],
    goals: [
      '说出线性回归最小化的量（RSS），并写出公式（往年原题）',
      '用 dummy feature $x_0=1$ 把截距并进点积',
      '对 1D 情形求偏导、写出两条方程并手算 $a,b$',
      '解释为什么用平方损失（可导、有闭式解、= Gaussian MLE）',
    ],
    types: ['T13'],
    what: [
      { t: 'h3', text: '① 问题：用温度预测湿度（L03 p5）' },
      T`**Linear regression**（L03 p5）：用特征（predictors / independent variables）预测一个**连续数值**的响应（response / dependent variable），假设两者是线性关系。`,
      T`课件的热身例子（L03 p5）：用温度 $T$ 预测湿度 $H$，10 个训练点。模型 $\hat H=a+bT$。`,
      { t: 'fig', src: 'reference/pages/L03/p05.jpg', caption: 'L03 p5：10 个 (温度, 湿度) 训练点', w: 520 },
      { t: 'h3', text: '② 什么叫"最好的直线"：残差平方和最小（L03 p6）' },
      T`对每个训练点，直线的预测 $a+bT_i$ 和真实湿度 $H_i$ 差多少（残差），平方后加起来——**RSS（residual sum of squares，残差平方和）**。最好的 $a,b$ 让它最小：`,
      { t: 'math', tex: T`L(a,b)=\sum_{i=1}^n(H_i-a-bT_i)^2` },
      { t: 'h3', text: '③ 求出 $a,b$：对两个参数求偏导、令为 0（L03 p7–p8）' },
      T`RSS 是 $a$、$b$ 的光滑函数，形状像一只碗。在碗底，朝 $a$ 的方向挪一点、朝 $b$ 的方向挪一点，RSS 都不再下降——也就是两个**偏导数都等于 0**。所以"找最好的直线"变成"解两个方程"。（还不熟偏导的话，先记住：令偏导 = 0，就是在找最低点。）`,
      { t: 'steps', items: [
        T`对 $a$：$\frac{\partial L}{\partial a}=-2\sum_i(H_i-a-bT_i)=0$（链式法则：外层平方求导得 $2(\cdot)$，内层对 $a$ 求导得 $-1$）`,
        T`对 $b$：$\frac{\partial L}{\partial b}=-2\sum_i(H_i-a-bT_i)T_i=0$（内层对 $b$ 求导得 $-T_i$）`,
        T`整理成两个方程两个未知数（L03 p8）：`,
      ] },
      { t: 'math', tex: T`\begin{pmatrix}n&\sum_iT_i\\\sum_iT_i&\sum_iT_i^2\end{pmatrix}\begin{pmatrix}a\\b\end{pmatrix}=\begin{pmatrix}\sum_iH_i\\\sum_iT_iH_i\end{pmatrix}` },
      T`解这个 2×2 方程组（记 $D=n\sum x_i^2-(\sum x_i)^2$，就是系数矩阵的行列式）。两种做法：① 先由第一行 $na+b\sum x_i=\sum y_i$ 得 $a=\bar y-b\bar x$，代入第二行解出 $b$；② 直接套下面的公式（克莱姆法则 Cramer's rule 的结果）：`,
      { t: 'math', tex: T`b=\frac{n\sum x_iy_i-\sum x_i\sum y_i}{D},\qquad a=\frac{\sum y_i\sum x_i^2-\sum x_i\sum x_iy_i}{D}` },
      T`课件数据代入得 $a=25.3$，$b=0.77$（L03 p8），即 $\hat H=25.3+0.77T$。`,
      { t: 'h3', text: '④ 推广到多个特征（L03 p9）' },
      T`**多维**（L03 p9）：$\hat y=w_0+\sum_{j=1}^m x_jw_j$。加一个恒为 1 的 **[[dummy feature]]** $x_0=1$，就能写成一个点积：`,
      { t: 'math', tex: T`\hat y=\sum_{j=0}^m x_jw_j=\bx'\bw` },
      T`**训练目标**（L03 p6）：让**残差平方和** RSS（residual sum of squares，也叫 sum of squared errors）最小：`,
      { t: 'math', tex: T`\hat\bw=\argmin_{\bw}\ \sum_{i=1}^n\big(y_i-\bx_i'\bw\big)^2=\argmin_{\bw}\ \|\by-\mathbf X\bw\|^2` },
      T`多维情形的矩阵推导在 c11（L03 p16–p17），结果是 **normal equations** $\mathbf X'\mathbf X\bw=\mathbf X'\by$。`,
    ],
    why: [
      T`线性回归是整门课的"母模型"：简单、计算快（有闭式解）、需要的数据少、容易解释（L03 p2）。后面的东西大多是在它上面加一层：`,
      { t: 'table', head: ['后面的章节', '在线性回归上改了什么'], rows: [
        ['c11', '同一个目标从 Gaussian MLE 推出来'],
        ['c12', '先把 $\\bx$ 变成 $\\varphi(\\bx)$ 再做线性回归 → 拟合曲线'],
        ['c15', '输出套 sigmoid → 分类（logistic regression）'],
        ['c16–c17', '在 RSS 上加惩罚项 → ridge / lasso'],
        ['c50', '给 $\\bw$ 加先验 → Bayesian 线性回归'],
      ] },
      T`它也是 c07 的 ERM 的第一个具体实例：决策规则 $\delta(\bx)=\bx'\bw$，损失是 square loss。`,
    ],
    intuition: [
      T`**残差 = 每个点到直线的竖直距离。** 平方之后求和，大误差被惩罚得特别重。下面的可视化里你可以亲手拖直线，看 RSS 怎么变。`,
      T`**为什么是"竖直"距离而不是垂直距离？** 因为我们要预测的是 $y$，误差就是 $y$ 方向上差多少。`,
      { t: 'think', q: '为什么用**平方**而不是绝对值 $|y_i-\\hat y_i|$？想两个理由。', a: '① 平方处处可导，求导 = 0 就能得到闭式解（下面的 normal equations）；绝对值在 0 处不可导，没有闭式解。② 平方损失恰好等于"Gaussian 噪声下的 MLE"（c11），有概率解释。代价是：平方对 outlier 很敏感（c15 会看到）。' },
      { t: 'story', title: '谁发明了最小二乘', md: 'Legendre 在 1805 年首先发表了最小二乘法。Gauss 说自己从 1795 年就在用，并用它从极少的观测里算出了小行星 Ceres（谷神星）的轨道，让天文学家在 1801 年底重新找到了它。两人为此有过优先权之争。' },
    ],
    math: [
      T`把 ③ 的两个方程写成矩阵形式，就是 normal equations 的一维特例：系数矩阵 $\begin{pmatrix}n&\sum T_i\\\sum T_i&\sum T_i^2\end{pmatrix}$ 正是 $\mathbf X'\mathbf X$（$\mathbf X$ 每行是 $(1,T_i)$），右边正是 $\mathbf X'\by$。c11 会用矩阵求导一次性推出一般情形。`,
    ],
    fx: [
      {
        title: '线性回归的目标', tex: T`\hat\bw=\argmin_{\htmlClass{fx-p1}{\bw}}\ \sum_{i=1}^n\big(\htmlClass{fx-p2}{y_i}-\htmlClass{fx-p3}{\bx_i'\bw}\big)^{\htmlClass{fx-p4}{2}}`,
        parts: [
          { label: 'w', note: '要学的参数：每个特征一个权重，加上截距 $w_0$（对应 dummy feature $x_0=1$）。' },
          { label: 'y_i', note: '第 $i$ 个训练样本的真实值。' },
          { label: "x_i'w", note: '模型的预测 $\\hat y_i$。$y_i-\\hat y_i$ 叫 **residual（残差）**。' },
          { label: '平方', note: '平方让正负误差都算数并重罚大误差；也让目标光滑可导，存在闭式解。' },
        ],
      },
    ],
    example: [
      { t: 'h3', text: '例 1：课件的天气数据（L03 p5、p8）' },
      T`$n=10$，$\sum T=731$，$\sum H=817$，$\sum T^2=53929$，$\sum TH=60103$。`,
      { t: 'steps', items: [
        T`$D=10\times53929-731^2=539290-534361=4929$`,
        T`$b=\frac{10\times60103-731\times817}{4929}=\frac{601030-597227}{4929}=\frac{3803}{4929}\approx0.772$`,
        T`$a=\bar H-b\bar T=81.7-\frac{3803}{4929}\times73.1\approx25.30$（第一行方程 $na+b\sum T=\sum H$ 两边除以 $n$；$81.7=817/10$、$73.1=731/10$ 是湿度、温度的平均；$3803/4929\approx0.7716$，乘 $73.1$ 得 $56.40$，$81.7-56.40=25.30$）`,
        T`精确解 $a\approx25.30,\ b\approx0.7716$：预测 $T=75\Rightarrow\hat H\approx83.17$，$T=70\Rightarrow\approx79.31$，最优 RSS $\approx744.68$。`,
        T`课件 p8 四舍五入成 $\hat H=25.3+0.77T$：预测 $83.05$ 和 $79.2$（RSS $\approx744.81$，比最优略大）。考试按题目给的系数算即可。`,
      ] },
      { t: 'fade', title: '分步练习：手算 1D 最小二乘', plan: [T`算 $\sum x,\sum y,\sum x^2,\sum xy$`, T`$D=n\sum x^2-(\sum x)^2$，求 $b$`, T`求 $a$`], items: [
        { md: T`点 $(0,1),(1,3),(2,4)$。`, steps: [
          { md: T`$n=3$，$\sum x=3$，$\sum y=8$，$\sum x^2=5$，$\sum xy=0+3+8=11$` },
          { md: T`$D=3\times5-3^2=6$；$b=\frac{3\times11-3\times8}{6}=1.5$` },
          { md: T`$a=\frac{8\times5-3\times11}{6}=\frac76\approx1.167$` },
        ] },
        { md: T`点 $(0,0),(1,2),(2,2)$：$n=3,\ \sum x=3,\ \sum y=4,\ \sum x^2=5,\ \sum xy=6$，$D=6$。`, steps: [
          { ask: '$b=?$', answer: 1, show: T`$\frac{3\times6-3\times4}{6}=1$` },
          { ask: '$a=?$', answer: 0.3333, tol: 0.002, show: T`$\frac{4\times5-3\times6}{6}=\frac13$` },
        ] },
        { md: T`点 $(1,2),(2,3),(3,5)$。`, steps: [
          { ask: T`$\sum xy=?$`, answer: 23, show: '$2+6+15=23$' },
          { ask: T`$b=?$（$\sum x=6,\ \sum y=10,\ \sum x^2=14$）`, answer: 1.5, show: T`$D=42-36=6$；$\frac{3\times23-6\times10}{6}=1.5$` },
          { ask: '$a=?$', answer: 0.3333, tol: 0.002, show: T`$\frac{10\times14-6\times23}{6}=\frac{2}{6}=\frac13$` },
        ] },
      ] },
    ],
    viz: [
      { id: 'ls-fit', how: '蓝点是 L03 p5 的 10 个训练点，绿线是当前的直线 $\\hat H=a+bT$，红竖线是每个点的残差。下方实时算 RSS。拖滑块让 RSS 尽量小，再点"最小二乘解"对比。',
        try: '① 先自己拖，看能把 RSS 压到多少（最优是 744.68）。② 点"最小二乘解"。③ 把斜率拉到 0：直线变成水平线，此时最优截距是 $\\bar H=81.7$——平均值就是"只有常数项"时的最小二乘解。' },
    ],
    compare: [
      { t: 'table', head: ['', '平方损失（本章）', '绝对值损失'], rows: [
        ['目标', '$\\sum(y_i-\\hat y_i)^2$', '$\\sum|y_i-\\hat y_i|$'],
        ['闭式解', '有（normal equations）', '没有'],
        ['概率解释', 'Gaussian 噪声的 MLE（c11）', 'Laplace 噪声的 MLE'],
        ['对 outlier', '敏感', '更稳健'],
      ] },
      { t: 'exam', md: T`**What quantity is minimised by linear regression?** The sum of squared residuals (errors) between the targets and the predictions: $\hat{\mathbf w}=\arg\min_{\mathbf w}\sum_{i=1}^n(y_i-\mathbf x_i'\mathbf w)^2=\arg\min_{\mathbf w}\|\mathbf y-\mathbf X\mathbf w\|^2$. (Under Gaussian noise this is equivalent to maximising the likelihood.)` },
    ],
    pitfalls: [
      ['残差是点到直线的垂直距离', '是**竖直**（$y$ 方向）距离 $y_i-\\hat y_i$。'],
      ['截距要单独处理', '加 dummy feature $x_0=1$ 后，$w_0$ 就是普通权重。'],
      ['线性回归只能拟合直线', '对**参数**线性即可；特征可以是 $x^2$、$\\sin x$ 等（c12）。'],
      ['最小化的是平均误差 / 绝对误差', '最小化**平方**误差之和（除以 $n$ 得 MSE，最优解不变）。'],
    ],
    quiz: [
      { type: 'num', q: '数据 $(0,2),(1,2),(2,5)$，用 $\\hat y=a+bx$。求 $b$。', answer: 1.5, explain: T`这是一维最小二乘的斜率，公式是 $b=\dfrac{n\sum x_iy_i-\sum x_i\sum y_i}{D}$，其中 $D=n\sum x_i^2-(\sum x_i)^2$。从三个点 $(0,2),(1,2),(2,5)$ 读出：$n=3$，$\sum x=0+1+2=3$，$\sum y=2+2+5=9$，$\sum x^2=0+1+4=5$，$\sum xy=0\times2+1\times2+2\times5=0+2+10=12$。$D=3\times5-3^2=15-9=6$。$b=\dfrac{3\times12-3\times9}{6}=\dfrac{36-27}{6}=\dfrac96=1.5$。**陷阱是漏掉分子第一项的 $n$**（写成 $12-27$），公式里是 $n\sum x_iy_i$。` },
      { type: 'num', q: '接上题，求 $a$。', answer: 1.5, explain: T`截距用 $a=(\sum y_i-b\sum x_i)/n$，也就是 $a=\bar y-b\bar x$（由方程组第一行 $na+b\sum x_i=\sum y_i$ 移项得到）。上题已经算出 $\sum y=9$、$\sum x=3$、$b=1.5$，且 $n=3$。$a=(9-1.5\times3)/3=(9-4.5)/3=4.5/3=1.5$。所以拟合直线是 $\hat y=1.5+1.5x$。**最小二乘直线一定穿过均值点** $(\bar x,\bar y)=(1,3)$，可以用来检验：$1.5+1.5\times1=3$ ✓。` },
      { type: 'num', q: '只用常数项 $\\hat y=w_0$ 拟合 $y=(1,2,6)$，最小二乘解 $w_0$？', answer: 3, explain: T`只有常数项时，模型对每个点都预测同一个数 $w_0$，要最小化的是 RSS（residual sum of squares，残差平方和）$\sum_i(y_i-w_0)^2$。对 $w_0$ 求导并令它为 0：$-2\sum_i(y_i-w_0)=0$，即 $\sum_iy_i=nw_0$，所以 $w_0=\bar y$。代入 $y=(1,2,6)$：$w_0=(1+2+6)/3=9/3=3$。**没有特征时，平方损失下最好的常数预测就是平均值**（如果换成绝对误差，答案会变成中位数 2）。` },
      { type: 'mc', q: 'Dummy feature $x_0=1$ 的作用是：', options: ['防止过拟合', '把截距 $w_0$ 写进点积 $\\bx\'\\bw$', '归一化特征', '让 $\\mathbf X\'\\mathbf X$ 可逆'], answer: 1, explain: T`模型本来是 $\hat y=w_0+\sum_{j=1}^m x_jw_j$，截距 $w_0$ 不乘任何特征，没法和其他项一起写成点积。加一个恒等于 1 的 dummy feature（哑特征）$x_0=1$ 后，$w_0=x_0w_0$，于是 $\hat y=\sum_{j=0}^m x_jw_j=\bx'\bw$，**截距变成了一个普通权重**，后面的矩阵公式不用再单独处理它。它不是正则化，所以不防止过拟合；它也不会让 $\mathbf X'\mathbf X$ 变得可逆，可逆与否取决于各列是否线性相关。L03 p9。` },
      { type: 'show', q: '（往年原题 2026 Q1a / 2025 Q1a）In words or a mathematical expression, what quantity is minimised by linear regression?', answer: T`The sum of squared residuals between the observed targets and the model's predictions, $\sum_{i=1}^n (y_i-\mathbf x_i'\mathbf w)^2=\|\mathbf y-\mathbf X\mathbf w\|^2$.`, qzh: '用文字或数学表达式说明：线性回归（linear regression）最小化的是什么量？', azh: T`观测目标值与模型预测值之间的残差平方和（sum of squared residuals）：$\sum_{i=1}^n (y_i-\mathbf x_i'\mathbf w)^2=\|\mathbf y-\mathbf X\mathbf w\|^2$。` },
    ],
  });

  /* =====================================================================
   * c11 · 线性回归 = Gaussian MLE（L03 p11–p19）
   * ===================================================================== */
  add({
    id: 'c11', week: 'W2', lec: 'L03', pages: 'L03 p11–p19', star: 2,
    keyEn: [
      T`Model: $y=\bx'\bw+\varepsilon$ with i.i.d. $\varepsilon\sim\mathcal N(0,\sigma^2)$; the log-likelihood is $-\frac{1}{2\sigma^2}\sum_i(y_i-\bx_i'\bw)^2+C$, so maximising it $\iff$ least squares.`,
      T`Normal equations: $\mathbf X'\mathbf X\bw=\mathbf X'\by$; if $\mathbf X'\mathbf X$ is invertible, $\hat\bw=(\mathbf X'\mathbf X)^{-1}\mathbf X'\by$.`,
      T`Invertibility needs $\mathbf X$ to have full column rank (no collinear features, $n\ge m+1$); otherwise there are infinitely many least-squares solutions.`,
      T`$\hat\sigma^2_{\text{MLE}}=\text{RSS}/n$. Adding a zero-mean Gaussian prior on $\bw$ and taking the MAP gives ridge regression.`,
    ],
    keyZh: [
      T`模型：$y$ = 直线上的值 + 均值为 0、方差都是 $\sigma^2$、互相独立（i.i.d.）的高斯噪声；取 log 后，似然里和 $\bw$ 有关的只剩"负的 RSS × 一个正常数"，所以最大化似然 ⇔ 最小二乘。`,
      T`正规方程（normal equations）：令 RSS 的梯度为 0 得到的方程组；$\mathbf X'\mathbf X$ 可逆时，两边乘它的逆就是闭式解 $\hat\bw$。`,
      T`可逆要求 $\mathbf X$ 列满秩（full column rank）：没有共线（重复）的特征，且样本数不少于参数个数；否则最小二乘解有无穷多个。`,
      T`噪声方差的 MLE = RSS ÷ $n$。再给 $\bw$ 加一个均值为 0 的高斯先验、求 MAP，就得到岭回归（ridge regression）。`,
    ],
    examQ: [
      { src: '2017 S2 Q2(c)', q: T`Show that the standard method for training a linear regression model (minimising the sum of squared errors) is equivalent to the maximum likelihood estimate for the graphical model $y\sim\bx'\bw+\epsilon$, where $y$ are the outputs, $\bx$ the inputs, $\bw$ the model parameters and $\epsilon$ is zero-mean Gaussian noise. Present your answer mathematically, and show the stages of your working. (Given: $\mathcal N(v\mid\mu,\sigma^2)=\frac{1}{(2\pi\sigma^2)^{1/2}}\exp\big\{-\frac{1}{2\sigma^2}(v-\mu)^2\big\}$.)`,
        a: T`(1) $\epsilon\sim\mathcal N(0,\sigma^2)$ i.i.d. ⇒ $p(y_i\mid\bx_i,\bw)=\mathcal N(y_i\mid\bx_i'\bw,\sigma^2)$. (2) Log-likelihood: $\log\prod_{i=1}^np(y_i\mid\bx_i,\bw)=-\frac n2\log(2\pi\sigma^2)-\frac{1}{2\sigma^2}\sum_{i=1}^n(y_i-\bx_i'\bw)^2$. (3) The first term and the factor $\frac{1}{2\sigma^2}>0$ do not depend on $\bw$, so $\argmax_\bw\log p=\argmin_\bw\sum_i(y_i-\bx_i'\bw)^2$: the MLE is the least-squares solution.`,
        qzh: T`证明：训练线性回归模型的标准方法（最小化误差平方和 sum of squared errors）等价于图模型 $y\sim\bx'\bw+\epsilon$ 的最大似然估计（maximum likelihood estimate），其中 $y$ 是输出，$\bx$ 是输入，$\bw$ 是模型参数，$\epsilon$ 是均值为 0 的高斯噪声（zero-mean Gaussian noise）。用数学写出答案，并写出各个步骤。（题目给出了高斯密度公式，见英文题干。）`,
        azh: T`(1) $\epsilon\sim\mathcal N(0,\sigma^2)$ 且 i.i.d. ⇒ $p(y_i\mid\bx_i,\bw)=\mathcal N(y_i\mid\bx_i'\bw,\sigma^2)$。(2) 对数似然（log-likelihood）：$\log\prod_{i=1}^np(y_i\mid\bx_i,\bw)=-\frac n2\log(2\pi\sigma^2)-\frac{1}{2\sigma^2}\sum_{i=1}^n(y_i-\bx_i'\bw)^2$。(3) 第一项和正的系数 $\frac{1}{2\sigma^2}$ 都与 $\bw$ 无关，所以 $\argmax_\bw\log p=\argmin_\bw\sum_i(y_i-\bx_i'\bw)^2$：MLE 就是最小二乘解。` },
    ],
    title: '线性回归 = Gaussian MLE', en: 'Linear regression as maximum likelihood; normal equations',
    summary: '假设 $y=\\bx\'\\bw+\\varepsilon$，噪声 $\\varepsilon\\sim\\mathcal N(0,\\sigma^2)$。写出似然、取 log，会发现最大化似然 ⇔ 最小化 RSS。再用矩阵求导得到闭式解 $\\hat\\bw=(\\mathbf X\'\\mathbf X)^{-1}\\mathbf X\'\\by$。',
    prereq: ['c06', 'c10', 'c04'],
    symbols: [
      [T`$\varepsilon$`, T`噪声（误差项），$\varepsilon\sim\mathcal N(0,\sigma^2)$`],
      [T`$y\mid\bx\sim\mathcal N(\bx'\bw,\sigma^2)$`, T`给定 $\bx$ 时 $y$ 服从中心在 $\bx'\bw$ 的 Gaussian`],
      [T`$\nabla L$`, T`梯度：把 $L$ 对每个 $w_j$ 的偏导排成一列`],
      [T`$\mathbf X'\mathbf X$`, T`$(m+1)\times(m+1)$ 方阵，PSD（c04）`],
      [T`$C$`, T`与 $\bw$ 无关的常数`],
    ],
    goals: [
      '写出线性回归的概率模型并推出"MLE = 最小二乘"',
      '展开 $\\|\\by-\\mathbf X\\bw\\|^2$、求梯度、写出 normal equations',
      '说出闭式解需要 $\\mathbf X\'\\mathbf X$ 可逆，以及不可逆的原因',
      '知道加 Gaussian 先验做 MAP 就得到 ridge（预告）',
    ],
    types: ['T13'],
    what: [
      T`c10 里"让 RSS 最小"是直接规定的。这一章换个角度：**假设数据是这样产生的**——真实 $y$ = 直线上的值 + 一点随机噪声，噪声是钟形（Gaussian）的。然后用 c06 的 MLE 去估计直线。结果会发现：MLE 给出的就是 RSS 最小的那条线。`,
      { t: 'h3', text: '① 先假设数据是怎么产生的：直线 + 钟形噪声（L03 p13）' },
      T`要用 MLE，先得有一个"数据怎么来"的概率模型（c06 里是"硬币以概率 $\theta$ 出正面"）。线性回归的模型（L03 p13）：`,
      { t: 'math', tex: T`y=\bx'\bw+\varepsilon,\quad \varepsilon\sim\mathcal N(0,\sigma^2)\qquad\Longleftrightarrow\qquad p(y\mid\bx)=\frac{1}{\sqrt{2\pi\sigma^2}}\exp\Big(-\frac{(y-\bx'\bw)^2}{2\sigma^2}\Big)` },
      T`意思是：真实的 $y$ 等于直线上的值加一点随机噪声，噪声是钟形的、中心为 0。例：直线是 $y=2x$、$\sigma=1$，那么在 $x=1$ 处观测到的 $y$ 大多落在 $2$ 附近（约 68% 落在 $1$ 到 $3$ 之间），离直线越远越少见。这是一个 **discriminative（判别式）**（只建模 $p(y\mid\bx)$）、**parametric（参数化）** 的模型（c09）。`,
      { t: 'h3', text: '② 写似然、取 log，看见 RSS（L03 p14–p15）' },
      T`有了模型，就能问 c06 的问题：哪条直线（哪个 $\bw$）让手上这批数据最可能出现？三步：每个点的概率是一个 Gaussian 密度 → 整批数据的似然是它们的连乘 → 取 log 后，和 $\bw$ 有关的只剩 $-\frac{1}{2\sigma^2}\sum_i(y_i-\bx_i'\bw)^2$：`,
      { t: 'math', tex: T`\log\prod_{i=1}^np(y_i\mid\bx_i)=\sum_{i=1}^n\Big[-\frac12\log(2\pi\sigma^2)-\frac{(y_i-\bx_i'\bw)^2}{2\sigma^2}\Big]=-\frac{1}{2\sigma^2}\sum_{i=1}^n(y_i-\bx_i'\bw)^2+C` },
      T`$C$ 和 $\frac{1}{2\sigma^2}>0$ 都不影响 argmax ⇒ $\argmax_\bw\text{log-lik}=\argmin_\bw\text{RSS}$。`,
      { t: 'h3', text: '③ 结论：平方损失不是拍脑袋选的' },
      T`**结论**（L03 p15）：在 i.i.d. 假设下，最大化这个似然**等价于**最小化 RSS。所以 c10 的"拍脑袋选平方损失"其实有统计学理由。`,
    ],
    why: [
      T`这是本课第一次看到"**同一个算法，两种推导**"：决策论（c07，选 square loss 做 ERM）和频率学派（c06，MLE）得到同一个答案。后面还会反复出现：logistic regression 的 MLE = cross-entropy ERM（c15），ridge = MAP（c17）。理解了这个模式，很多简答题就有了答题框架。`,
      T`另外，矩阵形式的 normal equations 是 ridge（c16）、kernel（c29）、Bayesian 回归（c50）的起点。`,
    ],
    intuition: [
      T`**为什么 Gaussian 噪声 ⇔ 平方误差？** Gaussian 密度里有 $\exp(-\text{误差}^2/(2\sigma^2))$。取 log 后 exp 消失，只剩 $-\text{误差}^2/(2\sigma^2)$。所以"让数据最可能" = "让误差平方和最小"。`,
      T`**$\mathbf X'\mathbf X\bw=\mathbf X'\by$ 的直觉**：最优时残差 $\by-\mathbf X\bw$ 和每一列特征都**正交**（$\mathbf X'(\by-\mathbf X\bw)=\mathbf 0$）——残差里已经没有任何能被特征解释的成分了。`,
      { t: 'think', q: '如果两个特征完全一样（比如同一个温度用摄氏和"摄氏×1"各记一次），$\\mathbf X\'\\mathbf X$ 还可逆吗？最小二乘解会怎样？', a: T`不可逆：两列相同 ⇒ 列线性相关 ⇒ $\mathbf X'\mathbf X$ 有零特征值（c04）。此时有**无穷多个**解（$w_1+w_2$ 固定，各自随便分），闭式解失效。c16 的 ridge 加 $\lambda\mathbf I$ 修好这个问题。` },
      { t: 'story', title: '"regression" 这个词', md: 'Francis Galton 在 19 世纪 80 年代研究父母和子女身高时发现：特别高的父母，孩子平均没那么高；特别矮的父母，孩子平均没那么矮——"regression towards mediocrity"（向平均回归）。"regression" 这个名字就这么留了下来，尽管今天它泛指"预测连续值"。' },
    ],
    math: [
      { t: 'h3', text: '矩阵求导得到 normal equations（L03 p16–p17）' },
      T`上面只说明了"该最小化 RSS"，还没真正把 $\bw$ 求出来。c10 对 $a,b$ 两个参数逐个求偏导；特征一多，逐个求太累。把 RSS 写成一个向量的长度，对整个 $\bw$ 一次求导，就得到所有权重要满足的一组方程，叫 **normal equations（正规方程）**：`,
      { t: 'steps', items: [
        T`把 RSS 写成向量长度：$L=\|\by-\mathbf X\bw\|^2=(\by-\mathbf X\bw)'(\by-\mathbf X\bw)$。`,
        T`展开（像 $(a-b)^2=a^2-2ab+b^2$）：$(\by-\mathbf X\bw)'(\by-\mathbf X\bw)=\by'\by-\by'\mathbf X\bw-(\mathbf X\bw)'\by+(\mathbf X\bw)'\mathbf X\bw$。其中 $(\mathbf X\bw)'=\bw'\mathbf X'$；$\by'\mathbf X\bw$ 和 $\bw'\mathbf X'\by$ 都是一个数且互为转置，所以相等，合并成 $2\by'\mathbf X\bw$：$L=\by'\by-2\by'\mathbf X\bw+\bw'\mathbf X'\mathbf X\bw$。`,
        T`求梯度。要用两条矩阵求导规则（记住即可；结果和 L03 p17 一致）：$\nabla_\bw(\mathbf a'\bw)=\mathbf a$（类比一元 $\frac{d}{dw}aw=a$），$\nabla_\bw(\bw'\mathbf A\bw)=2\mathbf A\bw$ 当 $\mathbf A$ 对称（类比 $\frac{d}{dw}aw^2=2aw$）。所以：$\nabla L=-2\mathbf X'\by+2\mathbf X'\mathbf X\bw$。`,
        T`（不放心第二条规则？在 2 维上手算核对一次。取 $\mathbf A=\begin{bmatrix}2&0\\0&1\end{bmatrix}$，$\bw=(w_1,w_2)$：$\bw'\mathbf A\bw=2w_1^2+w_2^2$。逐个分量求导：对 $w_1$ 得 $4w_1$，对 $w_2$ 得 $2w_2$，即梯度 $(4w_1,\ 2w_2)$；而 $2\mathbf A\bw=2(2w_1,\ w_2)=(4w_1,\ 2w_2)$ ✓。梯度就是"每个分量各求一次偏导，排成一列"。）`,
        T`令 $\nabla L=\mathbf 0$：$\mathbf X'\mathbf X\bw=\mathbf X'\by$（**normal equations**）。`,
        T`若 $\mathbf X'\mathbf X$ 可逆：$\hat\bw=(\mathbf X'\mathbf X)^{-1}\mathbf X'\by$。`,
      ] },
      T`**可逆的条件**：$\mathbf X$ 列线性无关（**full column rank，列满秩**），特别要求 $n\ge m+1$（样本数不少于参数个数）。实际计算时解线性方程组比求逆更稳定（WK03）。`,
      T`**$\sigma^2$ 的 MLE**：$\hat\sigma^2=\frac1n\sum_i(y_i-\bx_i'\hat\bw)^2=\text{RSS}/n$（和 c06 Gaussian 方差的 MLE 同一个道理）。`,
      { t: 'note', title: '预告（L03 p18）', md: T`如果再给 $\bw$ 一个 Gaussian 先验 $\bw\sim\mathcal N(\mathbf 0,\lambda^{-1}\sigma^2\mathbf I)$ 做 MAP（c08），目标会多出一项 $\lambda\|\bw\|^2$——这就是 **ridge regression**，第 16–17 章详讲。` },
    ],
    fx: [
      {
        title: 'Normal equations 的闭式解', tex: T`\hat\bw=\big(\htmlClass{fx-p1}{\mathbf X'\mathbf X}\big)^{\htmlClass{fx-p2}{-1}}\,\htmlClass{fx-p3}{\mathbf X'\by}`,
        parts: [
          { label: "X'X", note: '特征两两的点积之和组成的方阵，$(j,k)$ 元 $=\\sum_ix_{ij}x_{ik}$。总是 PSD（c04）。' },
          { label: '逆', note: '只有 $\\mathbf X\'\\mathbf X$ 可逆（$\\mathbf X$ 列线性无关）时才存在。否则需要正则化。' },
          { label: "X'y", note: '每个特征和目标的"相关程度"，第 $j$ 元 $=\\sum_ix_{ij}y_i$。' },
        ],
      },
    ],
    example: [
      { t: 'h3', text: '用矩阵重做 c10 的例子' },
      T`点 $(0,1),(1,3),(2,4)$，加 dummy feature：$\mathbf X=\begin{bmatrix}1&0\\1&1\\1&2\end{bmatrix}$，$\by=\begin{bmatrix}1\\3\\4\end{bmatrix}$。`,
      { t: 'steps', items: [
        T`$\mathbf X'\mathbf X=\begin{bmatrix}3&3\\3&5\end{bmatrix}$（左上 = $n$，右上 = $\sum x$，右下 = $\sum x^2$）`,
        T`$\mathbf X'\by=\begin{bmatrix}8\\11\end{bmatrix}$（$\sum y$、$\sum xy$）`,
        T`$(\mathbf X'\mathbf X)^{-1}=\frac16\begin{bmatrix}5&-3\\-3&3\end{bmatrix}$（2×2 求逆三步：先算行列式 $3\times5-3\times3=6$；主对角线的 3 和 5 对调；副对角线的两个 3 改成 $-3$；整块除以 6）`,
        T`$\hat\bw=\frac16\begin{bmatrix}5\times8-3\times11\\-3\times8+3\times11\end{bmatrix}=\begin{bmatrix}7/6\\1.5\end{bmatrix}$ ——和 c10 一样。`,
        T`预测 $\hat y=\frac76+\frac32x$：$x=0,1,2$ 时是 $\frac76,\ \frac83,\ \frac{25}6$。残差 = 真实值 − 预测：$1-\frac76=-\frac16$，$3-\frac83=\frac13$，$4-\frac{25}6=-\frac16$。RSS $=\frac1{36}+\frac4{36}+\frac1{36}=\frac16$；$\hat\sigma^2=\text{RSS}/n=\frac{1/6}{3}=\frac{1}{18}\approx0.056$。`,
      ] },
      { t: 'fade', title: '分步练习：$\\mathbf X\'\\mathbf X$、$\\mathbf X\'\\by$ 与解', plan: [T`写 $\mathbf X'\mathbf X$、$\mathbf X'\by$`, T`解 2×2 方程组得 $\hat\bw$`], items: [
        { md: T`$\mathbf X$ 的行 $[1,1],[1,2],[1,4]$，$\by=(2,3,5)$。`, steps: [
          { md: T`$\mathbf X'\mathbf X=\begin{bmatrix}3&7\\7&21\end{bmatrix}$，$\mathbf X'\by=\begin{bmatrix}10\\28\end{bmatrix}$` },
          { md: T`$\det=63-49=14$；$w_0=\frac{21\times10-7\times28}{14}=1$，$w_1=\frac{3\times28-7\times10}{14}=1$` },
        ] },
        { md: T`$\mathbf X$ 的行 $[1,0],[1,2],[1,2]$，$\by=(1,2,4)$。`, steps: [
          { sg: 1, ask: T`$\mathbf X'\mathbf X$ 右下角元素 $\sum x^2=?$`, answer: 8, show: '$0+4+4=8$' },
          { sg: 1, ask: T`$\mathbf X'\by$ 第二个元素 $\sum xy=?$`, answer: 12, show: '$0+4+8=12$' },
        ] },
        { md: T`某次拟合 $n=4$，残差为 $(1,-2,1,0)$。`, steps: [
          { sg: 0, ask: 'RSS = ?', answer: 6, show: '$1+4+1+0=6$' },
          { sg: 0, ask: T`$\hat\sigma^2$（MLE）= ?`, answer: 1.5, show: '$6/4=1.5$' },
        ] },
      ] },
    ],
    viz: [
      { id: 'ls-fit', opts: { a: 25.3, b: 0.77, mode: 'gauss' }, how: '同一组天气数据，但这次显示 Gaussian 噪声带：模型说每个点 = 直线上的值 + $\\mathcal N(0,\\sigma^2)$ 的噪声，蓝虚线是 $\\pm\\sigma$。读数里的"Gaussian 对数似然"随 RSS 变化——RSS 越小，似然越大。',
        try: '① 拖动截距或斜率，观察 RSS 和对数似然总是**反向**变化：RSS 降低时对数似然升高。（初始值是课件四舍五入的 25.3、0.77，不是精确最优，微调一下 RSS 可能还会稍降。）② 点"最小二乘解"，再向两侧调整：RSS 只会变大、对数似然只会变小——RSS 最小处就是似然最大处，这就是本章的结论。' },
    ],
    compare: [
      { t: 'table', head: ['推导路线', '假设', '目标', '结果'], rows: [
        ['决策论 / ERM（c10）', 'square loss', '$\\min\\sum(y_i-\\bx_i\'\\bw)^2$', '$\\hat\\bw=(\\mathbf X\'\\mathbf X)^{-1}\\mathbf X\'\\by$'],
        ['频率学派 / MLE（本章）', 'Gaussian 噪声', '$\\max\\prod p(y_i\\mid\\bx_i)$', '同上'],
        ['Bayesian / MAP（c17）', '+ Gaussian 先验', '$\\max p(\\bw\\mid D)$', 'ridge：$(\\mathbf X\'\\mathbf X+\\lambda\\mathbf I)^{-1}\\mathbf X\'\\by$'],
      ] },
    ],
    pitfalls: [
      ['$(\\mathbf X\'\\mathbf X)^{-1}$ 总存在', '需要列线性无关；重复特征或 $n<m+1$ 时不可逆。'],
      ['Gaussian 假设是对 $\\bx$ 的', '是对**噪声** / 给定 $\\bx$ 时的 $y$；对 $\\bx$ 的分布不做假设（判别式）。'],
      ['$\\sigma^2$ 会改变最优 $\\bw$', '不会，它只是给 RSS 乘一个正常数。'],
      ['展开 $\\|\\by-\\mathbf X\\bw\\|^2$ 时交叉项是 $\\by\'\\mathbf X\\bw$', '是 $-2\\by\'\\mathbf X\\bw$（两个交叉项相等，合并）。'],
    ],
    quiz: [
      { type: 'mc', q: '在线性回归的概率模型里，最大化似然等价于：', options: ['最小化绝对误差和', '最小化残差平方和', '最大化 $\\|\\bw\\|$', '最小化 $\\sigma^2$'], answer: 1, explain: T`L03 p15 假设 $y_i=\bx_i'\bw$ 加 Gaussian 噪声，每个点的似然是 $p(y_i\mid\bx_i)=\frac1{\sqrt{2\pi\sigma^2}}\exp\big(-\frac{(y_i-\bx_i'\bw)^2}{2\sigma^2}\big)$。取对数再对所有点求和，得 $\sum_i\log p(y_i\mid\bx_i)=-\frac1{2\sigma^2}\sum_i(y_i-\bx_i'\bw)^2+C$，其中 $C$ 与 $\bw$ 无关。前面是负号，**所以 log-likelihood（对数似然）最大，就是残差平方和最小**。"最小化绝对误差和"对应的是 Laplace 噪声，不是 Gaussian；$\sigma^2$ 是噪声大小，要学的参数是 $\bw$。L03 p15。` },
      { type: 'num', q: '$\\mathbf X\'\\mathbf X=\\begin{bmatrix}2&0\\\\0&4\\end{bmatrix}$，$\\mathbf X\'\\by=\\begin{bmatrix}6\\\\2\\end{bmatrix}$，求 $\\hat w_1$（第二个分量）。', answer: 0.5, explain: '对角矩阵的逆是对角元取倒数：$\\hat w_1=2/4=0.5$。' },
      { type: 'mc', q: '下面哪种情况 $\\mathbf X\'\\mathbf X$ **一定**不可逆？', options: ['$n=1000$，$m=5$', '有一个特征恒等于另一个特征的 3 倍', '特征都是正数', '$\\by$ 全是 0'], answer: 1, explain: T`$\mathbf X'\mathbf X$ 不可逆的原因是 $\mathbf X$ 的列线性相关（c04）。某个特征恒等于另一个的 3 倍，就是第 $j$ 列 $=3\times$ 第 $k$ 列；取 $\bv$ 第 $j$ 位为 1、第 $k$ 位为 $-3$、其余为 0，就有 $\mathbf X\bv=\mathbf 0$，于是 $\mathbf X'\mathbf X$ 有零特征值。**列线性相关 ⇒ 一定不可逆，和样本有多少无关。** $n=1000$、$m=5$ 是样本远多于特征，通常可逆，但不是"一定不可逆"；特征是不是正数与线性相关无关；$\by$ 根本不出现在 $\mathbf X'\mathbf X$ 里。` },
      { type: 'show', q: '用英文解释为什么线性回归可以看作 MLE。', answer: T`Assume $y=\mathbf x'\mathbf w+\varepsilon$ with i.i.d. Gaussian noise $\varepsilon\sim\mathcal N(0,\sigma^2)$. The log-likelihood is $-\frac{1}{2\sigma^2}\sum_i(y_i-\mathbf x_i'\mathbf w)^2+\text{const}$, so maximising it over $\mathbf w$ is equivalent to minimising the sum of squared errors, i.e. least squares.` },
    ],
  });

  /* =====================================================================
   * c12 · Basis expansion、RBF、XOR（L03 p20–p28）
   * ===================================================================== */
  add({
    id: 'c12', week: 'W2', lec: 'L03', pages: 'L03 p20–p28', star: 3,
    keyEn: [
      T`Basis expansion: replace $\bx$ by fixed non-linear features $\varphi(\bx)$ and fit $\hat y=\varphi(\bx)'\bw$; the model is linear in the parameters (normal equations still apply) but non-linear in $\bx$.`,
      T`Polynomial basis, e.g. $[1,x,x^2]$; RBF: $\varphi(\bx)=\psi(\|\bx-\mathbf z\|)$ depends only on the distance to a centre $\mathbf z$, e.g. $\exp(-\frac1\sigma\|\bx-\mathbf z\|^2)$.`,
      T`XOR is not linearly separable in the original space; with $\varphi_j(\bx)=\|\bx-\mathbf z_j\|$, the score $\varphi_1+\varphi_4$ is $\sqrt2$ for class A and 2 for class B, so a threshold (e.g. 1.7) separates them.`,
      T`Limitation: the basis must be chosen in advance, and one centre per training point gives $n$ features; neural networks learn $\varphi$, kernels avoid computing it.`,
    ],
    keyZh: [
      T`基函数展开（basis expansion）：先把 $\bx$ 换成固定的非线性新特征 $\varphi(\bx)$，再做线性模型；对参数 $\bw$ 仍是线性的（正规方程照用），对输入 $\bx$ 却可以是弯的。`,
      T`多项式基（polynomial basis）如 $1,x,x^2$；径向基函数（RBF）只看 $\bx$ 离某个中心 $\mathbf z$ 多远、不看方向，例如上面的 Gaussian 形式。`,
      T`XOR 在原空间里任何一条直线都分不开；换成"到中心的距离"特征后，用到 $(0,0)$ 和到 $(1,1)$ 的距离之和打分，A 类得 $\sqrt2$、B 类得 2，阈值取 1.7 就能分开。`,
      T`局限：基函数要事先人工选好；每个训练点放一个中心就有 $n$ 个特征，数据大时算不动。后续解法：神经网络从数据里学 $\varphi$，kernel 不用显式算 $\varphi$。`,
    ],
    title: 'Basis expansion、RBF、XOR', en: 'Basis expansion, radial basis functions, XOR',
    summary: '把输入 $\\bx$ 先变成新特征 $\\varphi(\\bx)$，再做线性模型。对参数仍是线性的（闭式解照样能用），但对 $\\bx$ 可以是曲线、曲面。经典例子：XOR 在原空间线性不可分，换成"到中心的距离"特征后可分（L03 p24，往年 T8）。',
    prereq: ['c10', 'c11'],
    symbols: [
      [T`$\varphi(\bx)$`, T`特征映射（basis expansion），把 $\bx\in\mathbb R^m$ 变成 $\mathbb R^k$ 中的新向量`],
      [T`$\varphi_j$`, T`第 $j$ 个新特征`],
      [T`$\mathbf z$`, T`RBF 的中心点（固定的）`],
      [T`$\|\bx-\mathbf z\|$`, T`$\bx$ 到中心 $\mathbf z$ 的欧氏距离`],
      [T`$\psi$`, T`任意一个一元函数`],
    ],
    goals: [
      '解释 basis expansion："对参数线性、对输入非线性"',
      '写出多项式基和 RBF（$\\varphi(\\bx)=\\psi(\\|\\bx-\\mathbf z\\|)$）',
      '复现 L03 p24 的 XOR 例子（特征值、分数 $\\sqrt2$ 与 2）',
      '说出 basis expansion 的局限与后续方向（神经网络、kernel、SVM）',
    ],
    types: ['T08'],
    what: [
      { t: 'h3', text: '① 问题：数据是弯的，直线拟合不了（L03 p20–p21）' },
      T`c10–c11 只能拟合直线（或平面）。如果数据明显是弯的，直线怎么调都不好。办法：先把输入**变换**成几个新特征（例如 $x\mapsto(1,x,x^2)$），再在新特征上做线性回归。模型对**参数 $\bw$** 仍然是线性的，所以 c10–c11 的最小二乘、normal equations 全部照用；对**原始输入 $x$** 却是弯的。`,
      { t: 'h3', text: '② 做法：先把特征变换，再用线性模型（L03 p20–p22）' },
      T`**Basis expansion**（L03 p20–p22）：选一个映射 $\varphi:\mathbb R^m\to\mathbb R^k$，用新特征 $\varphi(\bx)$ 代替 $\bx$：`,
      { t: 'math', tex: T`\hat y=\varphi(\bx)'\bw=\sum_{j}w_j\varphi_j(\bx)` },
      T`**Polynomial basis（多项式基）**（L03 p23）：一维 $x$，取 $\varphi_1(x)=x,\ \varphi_2(x)=x^2$，得到 $y=w_0+w_1x+w_2x^2$——二次曲线，但仍是"线性回归"：把 $\mathbf X$ 换成每行 $[1,x_i,x_i^2]$ 的矩阵，normal equations 照用。`,
      T`多项式基解决的是"回归曲线是弯的"。分类还有另一种卡住的情况，课件 p24 的 **XOR**：$(0,0),(1,1)$ 是一类，$(0,1),(1,0)$ 是另一类，任何一条直线都分不开。换一种特征就行：用"到 $(0,0)$ 的距离 + 到 $(1,1)$ 的距离"当新特征。$(0,0)$ 和 $(1,1)$ 都得 $0+\sqrt2=\sqrt2\approx1.41$，$(0,1)$ 和 $(1,0)$ 都得 $1+1=2$——用阈值 1.7 一刀就分开了。这种"只看离某个中心多远"的特征叫：`,
      T`**RBF（radial basis function，径向基函数）**（L03 p25）：形如 $\varphi(\bx)=\psi(\|\bx-\mathbf z\|)$，只依赖于到某个**中心** $\mathbf z$ 的距离。例：$\varphi(\bx)=\|\bx-\mathbf z\|$，或 Gaussian RBF $\varphi(\bx)=\exp\!\big(-\frac1\sigma\|\bx-\mathbf z\|^2\big)$。（这里是**显式**的基函数，一个输入一个特征值；c29 的 Gaussian RBF **kernel** $k(\bx,\bx')$ 是两个输入之间的核函数，别混。）`,
      { t: 'warn', title: '小心：σ 在本周有三种意思', md: T`c11 的 $\sigma^2$ 是噪声方差；这里 RBF 的 $\sigma$ 是宽度参数；c15 的 $\sigma(s)$ 是 sigmoid 函数。看到 $\sigma$ 先看上下文。` },
      { t: 'errata', md: T`L03 p25 的 Gaussian RBF 写成 $\exp(-\frac1\sigma\|\bx-\mathbf z\|^2)$。更常见的写法是 $\exp(-\frac{\|\bx-\mathbf z\|^2}{2\sigma^2})$（或用 $\gamma$ 参数）。考试按题目给的形式代入即可。` },
    ],
    why: [
      T`现实中的关系很少是直线。basis expansion 让线性模型拟合曲线和**非线性决策边界**，同时保留线性模型的所有好处（凸、闭式解、好解释）。`,
      T`它也是理解后面三大方法的钥匙（L03 p27）：`,
      { t: 'table', head: ['问题', '后面的解法'], rows: [
        ['$\\varphi$ 要人工选', '**神经网络**：从数据里学 $\\varphi$（c33）'],
        ['$\\varphi$ 维度太高、算不动', '**kernel trick**：不显式算 $\\varphi$，只算点积（c29）'],
        ['以每个训练点为中心有 $n$ 个特征，太多', '**SVM**：解只依赖少数 support vectors（c26）'],
      ] },
      T`往年卷 T8 考过：2025 practice Q2（为 XOR 设计特征映射）；2021 Q4 问"神经网络如何充当线性模型的非线性 basis"（第 33 章）。`,
    ],
    intuition: [
      T`**"弯曲空间，而不是弯曲直线"。** 在原空间里画不出的曲线边界，换到新特征空间后可能就是一条直线。下面的 XOR 可视化左右对照最直观。`,
      T`**XOR 问题**（L03 p24）：$(0,0),(1,1)$ 是 A 类，$(0,1),(1,0)$ 是 B 类。A 在一条对角线上，B 在另一条——任何一条直线都没法把它们分开。`,
      { t: 'think', q: 'basis expansion 之后，模型对**参数** $\\bw$ 还是线性的吗？对**输入** $\\bx$ 呢？', a: T`对 $\bw$ 仍是线性的（$\hat y=\sum_jw_j\varphi_j(\bx)$，每个 $w_j$ 一次方），所以 normal equations、凸性全部保留。对 $\bx$ 是非线性的（因为 $\varphi$ 非线性）。"线性模型"的"线性"指的是参数。` },
      { t: 'story', title: 'XOR 与"AI 寒冬"', md: '1969 年 Minsky 和 Papert 在《Perceptrons》一书中指出：单层感知机连 XOR 这么简单的问题都解决不了。这本书被普遍认为加剧了神经网络研究的低潮。解决办法正是本章的思想——先做特征变换（或加一层隐藏层，c33），再做线性分类。' },
    ],
    math: [
      { t: 'h3', text: 'L03 p24 的 XOR 例子，完整计算' },
      T`取四个训练点本身做中心：$\mathbf z_1=(0,0)$，$\mathbf z_2=(0,1)$，$\mathbf z_3=(1,0)$，$\mathbf z_4=(1,1)$，特征 $\varphi_j(\bx)=\|\bx-\mathbf z_j\|$：`,
      { t: 'table', cls: 'compact', head: ['点', '类', '$\\varphi_1$', '$\\varphi_2$', '$\\varphi_3$', '$\\varphi_4$', '$\\varphi\'\\bw$（$\\bw=[1,0,0,1]$）'], rows: [
        ['$(0,0)$', 'A', '0', '1', '1', '$\\sqrt2$', '$\\sqrt2\\approx1.414$'],
        ['$(0,1)$', 'B', '1', '0', '$\\sqrt2$', '1', '2'],
        ['$(1,0)$', 'B', '1', '$\\sqrt2$', '0', '1', '2'],
        ['$(1,1)$', 'A', '$\\sqrt2$', '1', '1', '0', '$\\sqrt2\\approx1.414$'],
      ] },
      T`A 类得分都是 $\sqrt2$，B 类都是 2 ⇒ 在新空间里用阈值（例如 1.7）就能**线性分开**。`,
      { t: 'h3', text: '局限（L03 p26）' },
      { t: 'ul', items: [
        T`变换要事先选好：多少个基函数、中心放哪里、$\sigma$ 取多少。`,
        T`如果每个训练点放一个中心（$\mathbf z_i=\bx_i$），就有 $n$ 个特征，大数据集算不动。`,
      ] },
    ],
    fx: [
      {
        title: 'RBF 特征', tex: T`\varphi(\bx)=\htmlClass{fx-p1}{\psi}\big(\htmlClass{fx-p2}{\|\bx-\mathbf z\|}\big),\qquad \text{e.g. }\ \exp\Big(-\frac{1}{\htmlClass{fx-p3}{\sigma}}\|\bx-\mathbf z\|^2\Big)`,
        parts: [
          { label: 'ψ', note: '任意一元函数：恒等函数（就是距离本身）、Gaussian 形状等。' },
          { label: '距离', note: '"radial"（径向）：只看离中心多远，不看方向。所有等距离的点特征值相同（以 $\\mathbf z$ 为圆心的圆）。' },
          { label: 'σ', note: '宽度参数：越大，特征随距离衰减越慢，影响范围越广。' },
        ],
      },
    ],
    example: [
      { t: 'h3', text: '多项式基的设计矩阵' },
      T`数据 $x=1,2,3$，二次基 $[1,x,x^2]$ ⇒ $\mathbf X=\begin{bmatrix}1&1&1\\1&2&4\\1&3&9\end{bmatrix}$。之后完全按 c11 求 $\hat\bw$。`,
      { t: 'h3', text: 'Gaussian RBF 的数值' },
      T`中心 $z=0$，$\sigma=1$（按课件形式 $\exp(-\|x-z\|^2/\sigma)$）：$x=0\Rightarrow1$；$x=1\Rightarrow e^{-1}\approx0.368$；$x=2\Rightarrow e^{-4}\approx0.018$。离中心越远特征越接近 0。`,
      { t: 'fade', title: '分步练习：特征映射', plan: [T`算距离特征 $\varphi_j=\|\bx-\mathbf z_j\|$`, T`得分 $\varphi_1+\varphi_4$ 与阈值比较`], items: [
        { md: T`XOR 新点 $\bx=(1,1)$，中心 $\mathbf z_1=(0,0)$、$\mathbf z_4=(1,1)$，得分 $\varphi_1+\varphi_4$。`, steps: [
          { md: T`$\varphi_1=\|(1,1)-(0,0)\|=\sqrt2$，$\varphi_4=0$` },
          { md: T`得分 $\sqrt2\approx1.414<1.7$ ⇒ A 类 ✓` },
        ] },
        { md: T`点 $\bx=(0,1)$，同样的两个中心。`, steps: [
          { sg: 1, ask: T`$\varphi_1=?$`, answer: 1, show: T`$\|(0,1)\|=1$` },
          { ask: T`$\varphi_1+\varphi_4=?$`, answer: 2, show: T`$\varphi_4=\|(0,1)-(1,1)\|=1$，和为 2 > 1.7 ⇒ B 类` },
        ] },
        { md: T`点 $\bx=(2,0)$，同样的两个中心 $\mathbf z_1=(0,0)$、$\mathbf z_4=(1,1)$（不是四个训练点），得分 $\varphi_1+\varphi_4$。`, steps: [
          { sg: 1, ask: T`$\varphi_1=?$`, answer: 2, show: '$2$' },
          { sg: 1, ask: T`$\varphi_4=?$`, answer: 1.414, tol: 0.002, show: T`$\|(1,-1)\|=\sqrt2$` },
          { sg: 2, ask: '得分 = ?', answer: 3.414, tol: 0.003, show: T`$2+\sqrt2\approx3.41>1.7$ ⇒ 判为 B 类` },
        ] },
      ] },
    ],
    viz: [
      { id: 'xor-basis', how: '左图是原空间：红色 A 类在一条对角线，蓝色 B 类在另一条，画不出分界直线。右图把每个点映射到 $(\\varphi_1,\\varphi_4)$ =（到 $(0,0)$ 的距离，到 $(1,1)$ 的距离）：两个 A 点落到 $(0,\\sqrt2)$、$(\\sqrt2,0)$，两个 B 点**重合**在 $(1,1)$。绿线是 $\\varphi_1+\\varphi_4=c$。',
        try: '拖动阈值 $c$：在 $\\sqrt2\\approx1.414$ 和 2 之间任何值都能完美分开；超出这个范围就不行。' },
      { id: 'poly-fit', opts: { degree: 2 }, how: '同一组数据，用 $[1,x,\\dots,x^k]$ 做特征的线性回归。灰虚线是真实函数，绿线是拟合结果。',
        try: '把次数从 0 拉到 3：曲线越来越贴合。先停在这里——拉到 9 会发生什么，是第 18 章"过拟合"的主题。' },
    ],
    compare: [
      { t: 'table', head: ['', '原始线性回归', 'Basis expansion'], rows: [
        ['模型', '$\\bx\'\\bw$', '$\\varphi(\\bx)\'\\bw$'],
        ['对参数', '线性', '线性'],
        ['对输入', '线性', '可以非线性'],
        ['求解', 'normal equations', '同样的 normal equations（$\\mathbf X\\to\\Phi$）'],
        ['难点', '只能拟合直线', '$\\varphi$ 要人工选；维度可能很高'],
      ] },
    ],
    pitfalls: [
      ['basis expansion 后就不是线性模型了', '对参数仍线性，所有线性回归工具都能用。'],
      ['XOR 一定要神经网络才能解', '换特征（basis expansion / kernel）就行（L03 p24）。'],
      ['RBF 特征和方向有关', '只和到中心的**距离**有关。'],
      ['特征越多越好', '特征太多会过拟合、计算量大（c18、L03 p26）。'],
    ],
    quiz: [
      { type: 'num', q: '一维 $x=3$，用基 $[1,x,x^2,x^3]$，特征向量的最后一个分量是？', answer: 27, explain: T`Basis expansion（基函数展开）把一个数 $x$ 变成特征向量 $\varphi(x)=[1,x,x^2,x^3]'$，每个分量就是把 $x$ 代进对应的基函数。题目 $x=3$，最后一个基函数是 $x^3$。所以最后一个分量 $=3^3=3\times3\times3=27$，**完整的特征向量是 $[1,3,9,27]'$**。` },
      { type: 'num', q: 'RBF $\\varphi(\\bx)=\\|\\bx-\\mathbf z\\|$，$\\mathbf z=(1,2)$，$\\bx=(4,6)$。$\\varphi=?$', answer: 5, explain: T`这个 RBF（radial basis function，径向基函数）的值就是 $\bx$ 到中心 $\mathbf z$ 的欧氏距离 $\|\bx-\mathbf z\|$。先算差向量：$\bx-\mathbf z=(4-1,\ 6-2)=(3,4)$。再求 $L_2$ 长度：$\sqrt{3^2+4^2}=\sqrt{9+16}=\sqrt{25}=5$。**要先相减再求长度**，不是 $\|\bx\|-\|\mathbf z\|$。`, qzh: T`径向基函数（RBF）$\varphi(\bx)=\|\bx-\mathbf z\|$，其中 $\mathbf z=(1,2)$，$\bx=(4,6)$，求 $\varphi$。` },
      { type: 'mc', q: '关于 XOR，下面正确的是：', options: ['原空间里可以用一条直线分开', '用 $\\varphi_1+\\varphi_4$（到 $(0,0)$ 和 $(1,1)$ 的距离和）后可以用阈值分开', '必须用非线性的 $\\bw$', 'basis expansion 后需要梯度下降才能求解'], answer: 1, explain: 'L03 p24：A 得分 $\\sqrt2$，B 得分 2。' },
      { type: 'show', q: '用英文写出 basis expansion 的思想及一个局限。', answer: T`Basis expansion maps the input through fixed non-linear functions $\varphi(\mathbf x)$ and fits a linear model $\varphi(\mathbf x)'\mathbf w$ in the new feature space; the model stays linear in the parameters (so least squares still applies) but can be non-linear in $\mathbf x$, e.g. making XOR linearly separable. A limitation is that the basis (number, centres, widths) must be chosen in advance, and using one basis function per training point gives $n$ features, which scales poorly.` },
    ],
  });

  /* =====================================================================
   * c13 · 迭代优化：GD、SGD（L04 p3–p11）
   * ===================================================================== */
  add({
    id: 'c13', week: 'W2', lec: 'L04', pages: 'L04 p3–p11', star: 2,
    keyEn: [
      T`Training is optimisation: we want the minimiser (argmin) $\hat{\boldsymbol\theta}\in\argmin_{\boldsymbol\theta}L(\text{data},\boldsymbol\theta)$, not the minimum value.`,
      T`Gradient descent: $\boldsymbol\theta^{(i+1)}=\boldsymbol\theta^{(i)}-\eta\nabla L(\boldsymbol\theta^{(i)})$; a too-large $\eta$ oscillates or diverges, a too-small one converges slowly.`,
      T`SGD updates with the gradient of one small batch of examples (batch size 1 or a few; cheap, noisy but right on average); one pass over the data is an epoch, and the data are shuffled each epoch.`,
      T`Convex (Hessian PSD): every local minimum is a global minimum; strictly convex: the minimiser, if it exists, is unique.`,
    ],
    keyZh: [
      T`训练就是优化：我们要的是让损失最小的那组参数（argmin，minimiser），不是最小的损失值本身（min）。`,
      T`梯度下降（gradient descent）：每步沿负梯度方向走一小步，步长是学习率 $\eta$；$\eta$ 太大会来回震荡甚至发散，太小收敛很慢。`,
      T`随机梯度下降（SGD）：每步只用一小批（1 个或几个）样本的梯度，便宜、有噪声，但平均方向是对的；把数据过一遍叫一个 epoch，每个 epoch 前打乱（shuffle）数据。`,
      T`凸（convex，Hessian 是 PSD）：任何局部最小都是全局最小；严格凸（strictly convex）：最小点如果存在，就是唯一的。`,
    ],
    examQ: [
      { src: '2016 S2 Q5.1', q: T`Write down the gradient descent algorithm for minimising training error (also known as total loss). You can leave the function in a generic form $L(\theta)$. Explain your notation and any parameters you introduce.`,
        a: T`Choose a starting point $\theta^{(1)}$, a learning rate (step size) $\eta>0$ and a number of iterations $T$. For $i=1,\dots,T$: $\theta^{(i+1)}=\theta^{(i)}-\eta\nabla L(\theta^{(i)})$. Return $\hat\theta\approx\theta^{(T+1)}$. Here $L(\theta)=\sum_{j=1}^nl(y_j,f_\theta(\bx_j))$ is the total training loss (assumed differentiable) and $\nabla L$ its gradient, the vector of partial derivatives $\partial L/\partial\theta_k$; another stopping rule (e.g. $\|\nabla L\|$ small) can replace $T$.`,
        qzh: T`写出用于最小化训练误差（training error，也叫总损失 total loss）的梯度下降（gradient descent）算法。函数可以保持一般形式 $L(\theta)$。解释你的记号和引入的所有参数。`,
        azh: T`选一个起点 $\theta^{(1)}$、学习率（步长）$\eta>0$ 和迭代次数 $T$。对 $i=1,\dots,T$：$\theta^{(i+1)}=\theta^{(i)}-\eta\nabla L(\theta^{(i)})$。返回 $\hat\theta\approx\theta^{(T+1)}$。其中 $L(\theta)=\sum_{j=1}^nl(y_j,f_\theta(\bx_j))$ 是训练集上的总损失（假设可导），$\nabla L$ 是它的梯度，即各偏导数 $\partial L/\partial\theta_k$ 组成的向量；也可以用别的停止条件（如 $\|\nabla L\|$ 足够小）代替固定的 $T$。` },
      { src: '2016 S2 Q5.2', q: T`Explain the difference between gradient descent and stochastic gradient descent algorithms.`,
        a: T`Gradient descent computes the gradient of the total loss over all $n$ training examples at every step (exact but expensive per step). SGD shuffles the data and, in passes called epochs, updates with the gradient of the loss on one example or a small batch: much cheaper per step and noisy, but correct on average, so it scales to large datasets.`,
        qzh: T`解释梯度下降（gradient descent）和随机梯度下降（stochastic gradient descent）算法的区别。`,
        azh: T`梯度下降每一步都用全部 $n$ 个训练样本的总损失算梯度（准确，但每步很贵）。SGD 先打乱数据，按轮（epoch）遍历，每步只用一个样本或一小批（batch）样本的损失梯度更新：每步便宜得多、有噪声，但平均来说方向是对的，所以能用于大数据集。` },
    ],
    title: '迭代优化：GD、SGD', en: 'Iterative optimisation: gradient descent, SGD, convexity',
    summary: '大多数 ML 目标没有闭式解，只能"一步一步往下走"：沿负梯度方向更新 $\\boldsymbol\\theta\\leftarrow\\boldsymbol\\theta-\\eta\\nabla L$。SGD 每步只用一小批数据。凸函数保证找到的局部最小就是全局最小。',
    prereq: ['c04', 'c06'],
    symbols: [
      [T`$\boldsymbol\theta$`, T`参数向量（粗体希腊字母 = 向量）`],
      [T`$\nabla L$`, T`梯度：$[\partial L/\partial\theta_1,\dots,\partial L/\partial\theta_p]'$，指向**上升最快**的方向`],
      [T`$\nabla^2L$`, T`Hessian：二阶偏导组成的 $p\times p$ 对称矩阵`],
      [T`$\eta$`, T`学习率 / 步长（eta）`],
      [T`$\boldsymbol\theta^{(i)}$`, T`第 $i$ 次迭代时的参数`],
      [T`$\min$ vs $\argmin$`, T`最小值本身 vs 取到最小值的参数`],
      [T`$\succeq0$`, T`矩阵半正定（PSD）`],
    ],
    goals: [
      '区分 minimum 和 minimiser（argmin），解释为什么 ML 关心后者',
      '写出 GD 更新式并手算两步',
      '说出 SGD 和 GD 的区别（batch、epoch、shuffle）',
      '定义 convex / strictly convex，并说出它们保证了什么',
    ],
    types: [],
    notExam: 'L04 p4 的 2D 约束优化只是演示"约束"的概念，不用会解。',
    what: [
      T`**优化问题**（L04 p3）：在约束下找让目标函数最小的变量。例：minimize $(z-1)^2$ subject to $z\ge3$。无约束时最小点是 $z=1$，但约束要求 $z\ge3$，所以 **minimiser**（argmin）$\hat z=3$，**minimum**（最小值）$=(3-1)^2=4$。`,
      T`**ML 训练就是优化**（L04 p6）：$\hat{\boldsymbol\theta}\in\argmin_{\boldsymbol\theta\in\Theta}L(\text{data},\boldsymbol\theta)$。我们要的是 argmin（参数），不是 min（损失值）。`,
      T`c10–c11 的线性回归能令导数为 0 **一次性解出来**，那是少数幸运的情况。大多数损失（比如下一章的 logistic regression）解不出闭式解，只能从某个起点**一步一步往下走**。往哪走？脚下最陡的**上坡**方向叫 **gradient（梯度）** $\nabla L$（把对每个参数的偏导排成一列）；要下降，就朝它的反方向走一小步，步长 $\eta$ 叫 **learning rate（学习率）**：`,
      T`**Gradient descent（GD，梯度下降）**（L04 p10）：`,
      { t: 'math', tex: T`\boldsymbol\theta^{(i+1)}=\boldsymbol\theta^{(i)}-\eta\,\nabla L\big(\boldsymbol\theta^{(i)}\big)` },
      { t: 'video', id: 'gd' },
      T`GD 每一步都要用**全部**数据算一次梯度，数据一大（几百万张图片）就太慢。于是：`,
      T`**Stochastic gradient descent（SGD，随机梯度下降）**（L04 p10）：每次只用一个 batch（1 个或几个样本）的梯度更新；把整个数据集过一遍叫一个 **epoch**，每个 epoch 开始前**打乱（shuffle）**数据。`,
    ],
    why: [
      T`c10–c11 的线性回归有闭式解，这是少数幸运情况（L04 p8）。logistic regression（c15）、神经网络（c33–c35）都没有闭式解，**只能迭代**。GD 是所有深度学习优化器（momentum、Adam，c35）的祖先。`,
      T`凸性（convexity）保证任何局部最小点都是全局最小点，所以 GD 不会"卡"在差的局部最优里（GD 收敛还需要合适的步长，见下面的思考题）——这是 logistic regression、SVM 的卖点，也是神经网络的痛点（非凸）。`,
    ],
    intuition: [
      T`**下山比喻。** 在大雾里下山，只能感觉脚下的坡度。梯度 $\nabla L$ 指向**最陡的上坡**，所以往反方向走一小步，重复。L04 讲者的比喻：往碗里倒水从上往下看，水面和碗的交线就是**等高线（level set）**；梯度垂直于等高线。`,
      T`**学习率 $\eta$ 的两难。** 太小：走得慢；太大：一步跨过谷底，在两侧来回震荡甚至越走越高（发散）。`,
      { t: 'think', q: '$L(\\theta)=(\\theta-3)^2$，从 $\\theta=0$ 出发，取 $\\eta=1$ 会发生什么？', a: T`$\nabla L=2(\theta-3)$。第一步 $\theta=0-1\times(-6)=6$；第二步 $\theta=6-1\times6=0$；永远在 0 和 6 之间跳。$\eta>1$ 就会发散。对这个函数，$\eta<1$（即 $\eta<2/L''$）才收敛。` },
      T`**SGD 为什么能用？** 一个 batch 的梯度是整体梯度的**有噪声估计**——平均方向是对的。每步便宜得多（不用扫全部数据），总体更快。噪声还可能帮助跳出差的局部最小。`,
      { t: 'story', title: '从 Cauchy 到 Robbins–Monro', md: '梯度下降最早由 Cauchy 在 1847 年提出，用来解天文计算中的方程组。随机版本的理论基础来自 Robbins 和 Monro 1951 年的"随机逼近"论文。今天训练 ChatGPT 这类模型用的仍是它们的后代。' },
    ],
    math: [
      { t: 'h3', text: '梯度和 Hessian（L04 p9）' },
      { t: 'math', tex: T`\nabla L=\Big[\frac{\partial L}{\partial\theta_1},\dots,\frac{\partial L}{\partial\theta_p}\Big]',\qquad (\nabla^2L)_{ij}=\frac{\partial^2L}{\partial\theta_i\,\partial\theta_j}` },
      T`**最优性条件**（L04 p8、p11）：无约束、可导时，局部最小点满足一阶条件 $\nabla L(\boldsymbol\theta)=\mathbf 0$，并且 Hessian $\nabla^2L\succeq0$（二阶条件）。**停止规则**（L04 p8、WK03）：梯度足够小（$\|\nabla L\|\le\epsilon$，WK03 用无穷范数）、参数几乎不再变化、或达到最大迭代次数。`,
      { t: 'h3', text: 'Log trick 为什么合法（L04 p7）' },
      T`$\log$ 是**严格单调**函数（$a>b\Rightarrow\log a>\log b$），所以只要 $L>0$（log 才有定义），对 $L$ 和对 $\log L$ 求 argmax/argmin 结果一样（c06 已经用过）。`,
      { t: 'h3', text: '凸性（L04 p11）' },
      T`梯度变成 0 就停下。停下的地方是不是**全局**最低点？不一定——山谷可能不止一个。但如果函数是"碗形"的，任何一个谷底都是全局最低。"碗形"的准确说法叫 **convex（凸）**：`,
      { t: 'math', tex: T`f\big(t\mathbf a+(1-t)\mathbf b\big)\le t\,f(\mathbf a)+(1-t)\,f(\mathbf b)\qquad\forall\mathbf a,\mathbf b,\ t\in[0,1]` },
      T`几何意义：图像上任意两点连线**在图像上方**（碗形）。严格不等号（$\mathbf a\ne\mathbf b$，$t\in(0,1)$）叫 **strictly convex**。`,
      { t: 'ul', items: [
        T`等价判别：一元 $f''\ge0$；多元 Hessian $\nabla^2f\succeq0$（PSD，c04！）。`,
        T`**凸 ⇒ 任何局部最小都是全局最小**（任何驻点都是全局最小）。`,
        T`**严格凸 ⇒ 全局最小点若存在，则唯一**（存在性要另外保证：$e^\theta$ 严格凸，但在 $\mathbb R$ 上取不到最小值）。`,
      ] },
      T`例：线性回归的 RSS 的 Hessian 是 $2\mathbf X'\mathbf X\succeq0$ ⇒ 凸；$\mathbf X$ 列无关时 $\mathbf X'\mathbf X$ 正定 ⇒ 严格凸、解唯一（和 c11 的可逆条件一致）。`,
    ],
    fx: [
      {
        title: 'GD 更新', tex: T`\htmlClass{fx-p1}{\boldsymbol\theta^{(i+1)}}=\boldsymbol\theta^{(i)}\htmlClass{fx-p2}{-}\htmlClass{fx-p3}{\eta}\,\htmlClass{fx-p4}{\nabla L(\boldsymbol\theta^{(i)})}`,
        parts: [
          { label: '新参数', note: '下一步的位置。' },
          { label: '减号', note: '梯度指向上升最快的方向，要**下降**所以取负号。最大化（如对数似然）时用加号 = gradient ascent。' },
          { label: 'η', note: '学习率：步子多大。太大会震荡/发散，太小收敛慢。' },
          { label: '梯度', note: '在**当前**位置算的梯度。SGD 时换成一个 batch 上的梯度。' },
        ],
      },
    ],
    example: [
      { t: 'h3', text: '例 1：一维' },
      T`$L(\theta)=(\theta-3)^2$，$L'(\theta)=2(\theta-3)$，$\theta^{(1)}=0$，$\eta=0.1$。`,
      { t: 'steps', items: [
        T`$\theta^{(2)}=0-0.1\times2(0-3)=0.6$`,
        T`$\theta^{(3)}=0.6-0.1\times2(0.6-3)=0.6+0.48=1.08$`,
        T`规律：每步离 3 的距离乘 $(1-2\eta)=0.8$，几何级数收敛。`,
      ] },
      { t: 'h3', text: '例 2：二维' },
      T`$L=\theta_1^2+3\theta_2^2$，$\nabla L=(2\theta_1,6\theta_2)$。从 $(1,1)$，$\eta=0.1$：$\nabla L=(2,6)$ ⇒ 新点 $(1-0.2,\ 1-0.6)=(0.8,0.4)$。陡的方向（$\theta_2$）每步缩小得多（×0.4），平的方向（$\theta_1$）缩小得少（×0.8），所以路径是弯的。是否来回折返（zigzag）取决于步长：沿某个方向的缩放因子是 $1-\eta\lambda$（$\lambda$ 是该方向的曲率），$\eta>1/\lambda$ 时因子为负，就会越过谷底再弹回。这里 $\eta=0.1$，因子 $0.8$ 和 $0.4$ 都为正，所以不折返。`,
      { t: 'fade', title: '分步练习：GD 手算', plan: [T`算当前梯度 $\nabla L$`, T`$\boldsymbol\theta\leftarrow\boldsymbol\theta-\eta\nabla L$`], items: [
        { md: T`$L=(\theta-3)^2$，$\theta=0$，$\eta=0.1$。`, steps: [
          { sg: 0, md: T`$L'(0)=-6$ ⇒ $\theta=0.6$` },
          { sg: 0, md: T`$L'(0.6)=-4.8$ ⇒ $\theta=1.08$` },
        ] },
        { md: T`$L=(\theta+1)^2$，$\theta=2$，$\eta=0.25$。`, steps: [
          { sg: 0, ask: '第一步后 $\\theta=?$', answer: 0.5, show: T`$L'(2)=6$，$2-0.25\times6=0.5$` },
          { sg: 0, ask: '第二步后 $\\theta=?$', answer: -0.25, show: T`$L'(0.5)=3$，$0.5-0.75=-0.25$` },
        ] },
        { md: T`$L=\theta_1^2+3\theta_2^2$，$\boldsymbol\theta=(2,1)$，$\eta=0.1$。`, steps: [
          { sg: 1, ask: T`$\partial L/\partial\theta_2=?$`, answer: 6, show: T`$6\theta_2=6$` },
          { sg: 2, ask: T`新的 $\theta_1=?$`, answer: 1.6, show: T`$2-0.1\times4=1.6$` },
          { sg: 2, ask: T`新的 $\theta_2=?$`, answer: 0.4, show: T`$1-0.1\times6=0.4$` },
        ] },
      ] },
    ],
    viz: [
      { id: 'opt-2d', opts: { method: 'gd', eta: 0.1, cond: 8 }, how: '灰色椭圆是等高线（同一个圈上 $L$ 相等），绿点是最低点。红色折线是 GD 走过的路径。"碗的扁程度"是 Hessian 两个特征值之比。',
        try: '① 默认 $\\eta=0.1$，点"走 10 步"几次：路径先冲向陡的方向再慢慢拐弯（弯曲，但不折返）。把 $\\eta$ 调到 0.2：陡方向的因子 $1-0.2\\times8<0$，开始来回折返（zigzag）。② 把 $\\eta$ 调到 0.24、0.26 对比：超过 $2/\\lambda_{\\max}=0.25$ 就发散。③ 切到 SGD：路径抖动但大方向正确。④ 把碗调到最圆（1）：GD 直奔中心。' },
    ],
    compare: [
      { t: 'table', head: ['', 'GD（batch）', 'SGD / mini-batch'], rows: [
        ['每步用的数据', '全部 $n$ 个', '1 个或一小批'],
        ['每步代价', '算梯度 $O(np)$（$n$ 个样本 × $p$ 个参数），大数据很慢', '$O(Bp)$，便宜'],
        ['路径', '平滑', '抖动（梯度有噪声）'],
        ['实际使用', '小数据', '几乎所有深度学习'],
      ] },
      { t: 'table', head: ['', 'Convex', 'Strictly convex', '非凸'], rows: [
        ['局部最小 = 全局最小？', '是', '是', '不一定'],
        ['最优解唯一？', '不一定（可能有平底）', '是', '不一定'],
        ['例子', '线性回归 RSS', 'RSS 且 $\\mathbf X$ 列无关；logistic（无冗余特征）', '神经网络'],
      ] },
    ],
    pitfalls: [
      ['梯度指向下降方向', '梯度指向**上升最快**的方向，所以 GD 用负梯度。'],
      ['学习率越大越快', '超过阈值会震荡或发散。'],
      ['凸函数的最优解唯一', '需要**严格**凸才唯一。'],
      ['ML 想要的是最小损失值', '想要的是**取到最小值的参数**（argmin）。'],
      ['SGD 每个 epoch 不用打乱', '每个 epoch 前要 shuffle（L04 讲者强调）。'],
    ],
    quiz: [
      { type: 'num', q: '$L(\\theta)=\\theta^2$，$\\theta=4$，$\\eta=0.25$，GD 一步后 $\\theta=?$', answer: 2, explain: T`Gradient descent（梯度下降）一维时的一步是 $\theta^{(i+1)}=\theta^{(i)}-\eta\,L'(\theta^{(i)})$：沿导数的反方向走，步长是学习率 $\eta$ 乘导数。$L(\theta)=\theta^2$ 的导数是 $L'(\theta)=2\theta$，在 $\theta=4$ 处 $L'=2\times4=8$。题目给 $\eta=0.25$，所以新 $\theta=4-0.25\times8=4-2=2$。一步从 4 走到 2，离最小点 0 更近了；**陷阱是用函数值 $L(4)=16$ 代替导数**，那样会得到 $4-0.25\times16=0$。` },
      { type: 'num', q: 'minimize $(z-1)^2$ subject to $z\\ge3$。最小**值**是多少？', answer: 4, explain: 'minimiser $\\hat z=3$，minimum $=(3-1)^2=4$（L04 p3）。' },
      { type: 'mc', q: '$f$ 的 Hessian 处处 PSD，可以推出：', options: ['$f$ 凸，局部最小即全局最小', '$f$ 严格凸', '$f$ 没有最小值', 'GD 对任何 $\\eta$ 都收敛'], answer: 0, explain: 'PSD Hessian ⇔ 凸；严格凸需要更强条件。' },
      { type: 'mc', q: 'SGD 相比 GD 的主要优点：', options: ['每步梯度更准确', '每步只用少量数据，计算便宜', '保证找到全局最优', '不需要学习率'], answer: 1, explain: T`L04 p10：SGD（stochastic gradient descent，随机梯度下降）每一步只用一个 batch（1 个或几个样本）算梯度，而 GD 每一步都要扫完整个训练集。**所以 SGD 每一步便宜得多**，同样的计算量能走更多步，这是它的主要优点。"每步梯度更准确"恰好说反了：小批量的梯度只是全量梯度的有噪声估计，平均方向对，但单步更不准；SGD 照样需要学习率，也不保证找到全局最优。L04 p10。` },
      { type: 'show', q: '用英文解释为什么凸性对优化很重要。', answer: T`For a convex objective every local minimum is a global minimum (any stationary point is optimal), so gradient-based methods (with a suitable step size) cannot get stuck in a poor local optimum; if the objective is strictly convex and a minimiser exists, it is unique.` },
    ],
  });

  /* =====================================================================
   * c14 · Newton–Raphson（L04 p12–p18）
   * ===================================================================== */
  add({
    id: 'c14', week: 'W2', lec: 'L04', pages: 'L04 p12–p18', star: 2,
    keyEn: [
      T`Newton–Raphson finds a zero of the derivative using curvature: $\theta_{t+1}=\theta_t-L'(\theta_t)/L''(\theta_t)$; multivariate: $\boldsymbol\theta_{t+1}=\boldsymbol\theta_t-(\nabla^2L)^{-1}\nabla L$.`,
      T`It fits a local quadratic and jumps to its stationary point (the minimum when the Hessian is positive definite): no learning rate, far fewer iterations than GD, and one step for a quadratic objective.`,
      T`Each step needs the $p\times p$ Hessian, $O(p^2)$ memory and $O(p^3)$ time to invert, so it is impractical with many parameters (e.g. neural networks); it can be unstable far from the optimum.`,
    ],
    keyZh: [
      T`牛顿法（Newton–Raphson）借助弯曲程度（曲率）给导数找零点：一维时用一阶导 ÷ 二阶导决定走多远；多维时二阶导换成 Hessian，"除以"换成"乘它的逆矩阵"。`,
      T`它在当前点拟合一个二次函数，直接跳到它的驻点（Hessian 正定时就是最低点）：不用学习率，迭代次数比 GD 少得多，目标本身是二次函数时一步到位。`,
      T`代价：每步要算 $p\times p$ 的 Hessian，存储 $O(p^2)$、求逆 $O(p^3)$，参数很多（如神经网络）时不可行；离最优点远时还可能不稳定。`,
    ],
    examQ: [
      { src: '2020 Q3（据学生笔记）', q: T`Recall that linear regression's objective can be written as $L(\boldsymbol\theta)=\frac12\|\mathbf X\boldsymbol\theta-\by\|_2^2$, where $\mathbf X$ is an $n\times d$ matrix of training instances in rows, $\by\in\mathbb R^n$ are the training labels, and $\boldsymbol\theta\in\mathbb R^d$ are the parameters to learn by minimising $L(\boldsymbol\theta)$. Show that for any starting $\boldsymbol\theta_0\in\mathbb R^d$, a single step of Newton-Raphson optimisation of $L(\boldsymbol\theta)$ recovers the normal equation exact solution. (Hints: $\nabla(\mathbf A\boldsymbol\theta+\mathbf b)=\mathbf A$; $\nabla_2(\mathbf A\boldsymbol\theta)=\mathbf A$; $\nabla(\|f(\boldsymbol\theta)\|_2^2)=2(\nabla f(\boldsymbol\theta))'f(\boldsymbol\theta)$; $'$ is transpose, $\nabla$ the gradient, $\nabla_2$ the Hessian.)`,
        a: T`Gradient (Hint 3 with $f=\mathbf X\boldsymbol\theta-\by$, $\nabla f=\mathbf X$): $\nabla L=\mathbf X'(\mathbf X\boldsymbol\theta-\by)$; Hessian $\nabla_2L=\mathbf X'\mathbf X$, a constant. One Newton step: $\boldsymbol\theta_1=\boldsymbol\theta_0-(\mathbf X'\mathbf X)^{-1}\mathbf X'(\mathbf X\boldsymbol\theta_0-\by)=\boldsymbol\theta_0-\boldsymbol\theta_0+(\mathbf X'\mathbf X)^{-1}\mathbf X'\by=(\mathbf X'\mathbf X)^{-1}\mathbf X'\by$, the normal-equation solution, for any $\boldsymbol\theta_0$ (assuming $\mathbf X'\mathbf X$ is invertible). Reason: $L$ is quadratic, so Newton's local quadratic model is exact.`,
        qzh: T`线性回归的目标可写成 $L(\boldsymbol\theta)=\frac12\|\mathbf X\boldsymbol\theta-\by\|_2^2$，$\mathbf X$ 是每行一个训练样本的 $n\times d$ 矩阵，$\by$ 是训练标签，$\boldsymbol\theta$ 是要学的参数。证明：从任意起点 $\boldsymbol\theta_0$ 出发，对 $L$ 做一步牛顿法（Newton–Raphson）就得到正规方程（normal equation）的精确解。题目给了三个求导提示（见英文题干）。题目截图来自学生笔记，未与原卷核对。`,
        azh: T`梯度（用提示 3，$f=\mathbf X\boldsymbol\theta-\by$，$\nabla f=\mathbf X$，系数 $\frac12$ 与 2 抵消）：$\nabla L=\mathbf X'(\mathbf X\boldsymbol\theta-\by)$；Hessian $\nabla_2L=\mathbf X'\mathbf X$，是常数矩阵。牛顿一步：$\boldsymbol\theta_1=\boldsymbol\theta_0-(\mathbf X'\mathbf X)^{-1}\mathbf X'(\mathbf X\boldsymbol\theta_0-\by)=\boldsymbol\theta_0-\boldsymbol\theta_0+(\mathbf X'\mathbf X)^{-1}\mathbf X'\by=(\mathbf X'\mathbf X)^{-1}\mathbf X'\by$，正是正规方程的解，与 $\boldsymbol\theta_0$ 无关（假设 $\mathbf X'\mathbf X$ 可逆）。原因：$L$ 本身是二次函数，牛顿法拟合的局部二次模型就是它自己。` },
    ],
    title: 'Newton–Raphson', en: 'Newton–Raphson (second-order optimisation)',
    summary: '二阶方法：不只看坡度，还看弯曲程度（Hessian）。更新 $\\boldsymbol\\theta\\leftarrow\\boldsymbol\\theta-(\\nabla^2L)^{-1}\\nabla L$。收敛步数少得多，但每步要求逆 $p\\times p$ 矩阵，代价 $O(p^3)$。',
    prereq: ['c13'],
    symbols: [
      [T`$L'(\theta)$, $L''(\theta)$`, T`一阶导（斜率）、二阶导（弯曲程度）`],
      [T`$\Delta$`, T`一步移动的量`],
      [T`$(\nabla^2L)^{-1}$`, T`Hessian 的逆矩阵`],
      [T`$O(p^3)$`, T`计算量随参数个数 $p$ 的三次方增长`],
    ],
    goals: [
      '推出一维 Newton 更新 $\\theta_{t+1}=\\theta_t-L\'(\\theta_t)/L\'\'(\\theta_t)$',
      '写出多元版本，并说出相对 GD 的优缺点（往年简答）',
      '知道二次函数一步就到最优',
    ],
    types: ['T13'],
    notExam: 'L04 p17 列出的进阶话题（Lagrangian、projected GD、subgradient 等）只是预告，不考。Lagrangian 在 SVM（第 28 章，W5）才正式讲。',
    what: [
      { t: 'h3', text: '① 问题：梯度下降的步子要手调（L04 p12）' },
      T`c13 的梯度下降每步只看**斜率**，走多远全靠学习率 $\eta$：太小走得慢，太大会震荡甚至发散。Newton–Raphson 还看**弯曲程度**（二阶导）：在当前点用一条抛物线近似目标函数，直接跳到抛物线的最低点。离最优点近时收敛非常快，代价是要算二阶导（多维时是 Hessian 矩阵）。`,
      { t: 'h3', text: '② 思路与公式' },
      T`**思路**（L04 p12–p15）：最优点满足 $L'(\theta)=0$，所以优化 = 给 $L'$ **找零点**。在当前点画 $L'$ 的切线，切线和横轴的交点作为下一个点。`,
      { t: 'math', tex: T`\theta_{t+1}=\theta_t-\frac{L'(\theta_t)}{L''(\theta_t)}` },
      T`**多元**（L04 p16）：一阶导换成梯度，二阶导换成 Hessian，"除以"换成"乘逆矩阵"：`,
      { t: 'math', tex: T`\boldsymbol\theta_{t+1}=\boldsymbol\theta_t-\big(\nabla^2L(\boldsymbol\theta_t)\big)^{-1}\nabla L(\boldsymbol\theta_t)` },
    ],
    why: [
      T`GD 只用坡度，在"扁碗"里会 zigzag、走很多步。Newton 用曲率把碗"拉圆"，几步就到（L04 p16 图）。这是往年简答的经典对比：**为什么不总用 Newton？** ——Hessian 太贵。`,
    ],
    intuition: [
      T`**GD 用一条切线（一阶近似）估计 $L$；Newton 用一个抛物面（二阶近似）。** 在当前点拟合一个最贴近的二次函数，直接跳到这个二次函数的最低点。所以如果 $L$ 本身就是二次的，一步到位。`,
      T`**$1/L''$ 是"自动学习率"。** 弯得厉害（$L''$ 大）就走小步，平缓就走大步——不用手调 $\eta$。`,
      { t: 'think', q: '对 $L(\\theta)=(\\theta-3)^2$，从任意 $\\theta_0$ 出发，Newton 一步后在哪？为什么？', a: T`$L'=2(\theta-3)$，$L''=2$，$\theta_1=\theta_0-\frac{2(\theta_0-3)}{2}=3$，一步到最优。因为 Newton 的二次近似对二次函数是**精确**的。` },
      { t: 'story', title: '名字的来历', md: 'Newton 在 1669 年前后的手稿里用这种方法求多项式的根；Joseph Raphson 在 1690 年发表了一个更简洁、更接近今天写法的版本。所以叫 Newton–Raphson。' },
    ],
    math: [
      { t: 'h3', text: '一维推导（L04 p15）' },
      { t: 'steps', items: [
        T`在 $\theta_t$ 处，$L'$ 的切线斜率是 $L''(\theta_t)$，切线方程：$y=L'(\theta_t)+L''(\theta_t)(\theta-\theta_t)$。`,
        T`令 $y=0$（找切线与横轴的交点）：$\theta-\theta_t=-\frac{L'(\theta_t)}{L''(\theta_t)}$。`,
        T`即 $\Delta=-L'(\theta_t)/L''(\theta_t)$，$\theta_{t+1}=\theta_t+\Delta$。`,
      ] },
      { t: 'note', title: '课件 p15 的符号', md: T`L04 p15 写 "rise/run $=-L''(\theta_t)=L'(\theta_t)/\Delta$"，那个负号是因为图里把 $\Delta$ 和 $L'$ 都画成正的长度。按标准写法推导结果一样：$\theta_{t+1}=\theta_t-L'(\theta_t)/L''(\theta_t)$。` },
      { t: 'h3', text: '优缺点（L04 p16–p18）' },
      { t: 'table', head: ['', 'GD', 'Newton–Raphson'], rows: [
        ['用到', '梯度（一阶）', '梯度 + Hessian（二阶）'],
        ['每步代价（不算求梯度本身）', '更新 $O(p)$', '存 Hessian $O(p^2)$，求逆 $O(p^3)$'],
        ['迭代次数', '多（扁碗里 zigzag）', '少（二次函数一步）'],
        ['学习率', '要调 $\\eta$', '不需要'],
        ['参数很多（神经网络）', '可用', '不可行'],
      ] },
    ],
    fx: [
      {
        title: '多元 Newton 更新', tex: T`\boldsymbol\theta_{t+1}=\boldsymbol\theta_t-\htmlClass{fx-p1}{\big(\nabla^2L(\boldsymbol\theta_t)\big)^{-1}}\,\htmlClass{fx-p2}{\nabla L(\boldsymbol\theta_t)}`,
        parts: [
          { label: 'Hessian 的逆', note: '用曲率"校正"方向和步长：在陡的方向少走、平的方向多走。求逆是 $O(p^3)$。' },
          { label: '梯度', note: '和 GD 一样的一阶信息。' },
        ],
      },
    ],
    example: [
      { t: 'h3', text: '非二次函数：$L(\\theta)=\\frac{\\theta^4}{4}-2\\theta$' },
      T`$L'=\theta^3-2$，$L''=3\theta^2$，最优 $\theta^*=\sqrt[3]2\approx1.260$。从 $\theta_0=2$：`,
      { t: 'steps', items: [
        T`$\theta_1=2-\frac{8-2}{12}=1.5$`,
        T`$\theta_2=1.5-\frac{3.375-2}{6.75}\approx1.5-0.204=1.296$`,
        T`再一步就到 1.260 附近——收敛非常快。`,
      ] },
      { t: 'fade', title: '分步练习：Newton 手算', plan: [T`算 $L'(\theta_t)$、$L''(\theta_t)$`, T`$\theta_{t+1}=\theta_t-L'/L''$`], items: [
        { md: T`$L=\frac{\theta^4}{4}-2\theta$，$\theta_0=2$。`, steps: [
          { md: T`$L'(2)=6$，$L''(2)=12$ ⇒ $\theta_1=1.5$` },
        ] },
        { md: T`同一个 $L$，$\theta_0=1$。`, steps: [
          { ask: T`$\theta_1=?$`, answer: 1.3333, tol: 0.002, show: T`$L'(1)=-1$，$L''(1)=3$，$1-(-1)/3=4/3$` },
        ] },
        { md: T`$L=\frac{\theta^3}{3}-4\theta$（$\theta>0$ 时最小点 $\theta=2$），$\theta_0=4$。`, steps: [
          { sg: 2, ask: T`$\theta_1=?$`, answer: 2.5, show: T`$L'=\theta^2-4=12$，$L''=2\theta=8$，$4-1.5=2.5$` },
          { ask: T`$\theta_2=?$`, answer: 2.05, show: T`$L'(2.5)=2.25$，$L''=5$，$2.5-0.45=2.05$` },
        ] },
      ] },
    ],
    viz: [
      { id: 'newton-1d', how: '蓝线是 $L\'(\\theta)$。大点是当前点 $(\\theta_t,L\'(\\theta_t))$，从它画的切线与横轴的交点（小点）就是下一步 $\\theta_{t+1}$。绿点是真正的零点（最优点）。',
        try: '点"走一步"三四次，看 $\\theta$ 多快贴近 1.26。把起点拖到 0.4 再试：$L\'\'$ 很小、切线很平，第一步会跳得很远——Newton 在离最优点远时可能不稳定。' },
      { id: 'opt-2d', opts: { method: 'newton', cond: 12 }, how: '和第 13 章同一个扁碗，方法换成 Newton。',
        try: '点一次"走一步"：直接到达最低点（目标是二次函数）。切回 GD 对比要走多少步。' },
    ],
    compare: [
      { t: 'exam', md: T`**GD vs Newton–Raphson:** Newton–Raphson uses second-order (curvature) information, $\boldsymbol\theta\leftarrow\boldsymbol\theta-(\nabla^2L)^{-1}\nabla L$, so it typically converges in far fewer iterations and needs no learning rate (one step for a quadratic). However each iteration requires computing and inverting the $p\times p$ Hessian, costing $O(p^3)$ time and $O(p^2)$ memory, which is impractical when $p$ is large (e.g. neural networks); gradient descent only needs the gradient, $O(p)$ per step.` },
    ],
    pitfalls: [
      ['Newton 是对 $L$ 找零点', '是对 $L\'$（梯度）找零点。'],
      ['Newton 每步都更便宜', '每步更贵（Hessian 求逆），只是步数少。'],
      ['Newton 一定收敛', '离最优点远、或 Hessian 不正定时可能不稳定。'],
      ['多元时除以 Hessian', '矩阵不能除，是乘 Hessian 的**逆**。'],
    ],
    quiz: [
      { type: 'num', q: '$L(\\theta)=2\\theta^2-8\\theta$，$\\theta_0=10$，Newton 一步后 $\\theta=?$', answer: 2, explain: '$L\'=4\\theta-8=32$，$L\'\'=4$，$10-8=2$，就是最优点（二次函数一步到位）。' },
      { type: 'mc', q: '参数 $p=10^6$ 的神经网络为什么不用 Newton？', options: ['Hessian 不存在', '存储 $p^2$、求逆 $O(p^3)$ 太贵', 'Newton 只适用于一维', 'Newton 需要学习率'], answer: 1, explain: 'L04 p16–p18。' },
      { type: 'num', q: '$L\'(\\theta_t)=3$，$L\'\'(\\theta_t)=6$，$\\theta_t=1$。$\\theta_{t+1}=?$', answer: 0.5, explain: T`一维 Newton–Raphson 的一步是 $\theta_{t+1}=\theta_t-L'(\theta_t)/L''(\theta_t)$：用一阶导除以二阶导来决定走多远，不需要学习率。题目给 $\theta_t=1$、$L'(\theta_t)=3$、$L''(\theta_t)=6$。$\theta_{t+1}=1-3/6=1-0.5=0.5$。和 GD 对比：GD 减去 $\eta L'$，Newton 用曲率 $L''$ 代替了 $1/\eta$，**弯得越厉害（$L''$ 越大），步子越小**。`, qzh: T`已知 $L'(\theta_t)=3$，$L''(\theta_t)=6$，$\theta_t=1$，求 $\theta_{t+1}$。` },
      {
        type: 'mc', q: T`（平时小测原题）Consider a simple linear regression problem with 1 instance and 1 feature, i.e. $x$ and $y$ are real-valued constants, and we minimise $L(w)=\frac12(y-xw)^2$ over the real variable $w$. How many steps does Newton–Raphson take to converge to a global minimum, starting from an arbitrary initial point $w_1$? Assume $x\neq0$.`,
        qzh: T`只有 1 个样本、1 个特征的线性回归：$x$、$y$ 是实数常数，最小化 $L(w)=\frac12(y-xw)^2$。从任意初始点 $w_1$ 出发，Newton–Raphson 要几步收敛到全局最小？设 $x\neq0$。`,
        options: [
          T`It's not possible to tell, it depends on $x$ and $y$`,
          T`It's not possible to tell, it depends on $w_1$`,
          T`It takes zero steps after initialisation.`,
          T`It takes one step after initialisation.`,
          T`It takes two steps after initialisation.`,
          T`It takes infinite steps after initialisation.`,
        ],
        answer: 3,
        explain: T`求导：$L'(w)=-x(y-xw)=x^2w-xy$，$L''(w)=x^2>0$。Newton 一步：$w_2=w_1-\frac{L'(w_1)}{L''(w_1)}=w_1-\frac{x^2w_1-xy}{x^2}=\frac yx$。最小值点就是 $L'(w)=0$ 的解 $w^*=y/x$，所以无论 $w_1$ 是多少，**一步就到**。原因：$L$ 本身是二次函数，Newton 用二次函数去近似 $L$，这个近似是精确的。"零步"只在恰好 $w_1=y/x$ 时成立，而题目说的是任意初始点。`,
      },
    ],
  });

  /* =====================================================================
   * c15 · Logistic regression（L04 p19–p32）
   * ===================================================================== */
  add({
    id: 'c15', week: 'W2', lec: 'L04', pages: 'L04 p19–p32', star: 2,
    keyEn: [
      T`Model: $P(Y=1\mid\bx)=\sigma(\bx'\bw)=\frac{1}{1+\exp(-\bx'\bw)}$, i.e. $y\mid\bx\sim\text{Bernoulli}(\sigma(\bx'\bw))$; the score $\bx'\bw$ is the log-odds.`,
      T`It is a linear classifier: $\sigma(s)=\frac12\iff s=0$, so the decision boundary $\bx'\bw=0$ is a hyperplane.`,
      T`Training is Bernoulli MLE, equivalent to minimising cross-entropy; the log-likelihood gradient is $\nabla L=\sum_i(y_i-\sigma(\bx_i'\bw))\bx_i$. No closed form, but the negative log-likelihood is convex (no bad local optima), so use gradient methods or Newton; on linearly separable data the weights grow without bound unless regularised.`,
      T`Linear regression is poor for classification: squared loss penalises correctly classified points far from the threshold, so such points drag the fit and shift the boundary.`,
      T`Multiclass (softmax) logistic regression: one weight vector per class, logits $s_k=\bx'\bw_k$, $P(y=k\mid\bx)=\frac{\exp(s_k)}{\sum_j\exp(s_j)}$; predict the class with the largest logit; train by minimising the cross-entropy $-\sum_ky_k\log p_k$ with one-hot $\by$ (= negative log-likelihood). Parameters for $D$ features and $m$ classes: $D\cdot m+m$ (MNIST: $784\times10+10=7850$).`,
    ],
    keyZh: [
      T`模型：把线性得分 $\bx'\bw$ 放进 sigmoid（S 形函数）压到 0 到 1 之间，当作正类概率，即 $y$ 服从以它为参数的 Bernoulli 分布；得分 $\bx'\bw$ 就是对数几率（log-odds）。`,
      T`它是线性分类器：sigmoid 恰好在得分为 0 时等于 0.5，所以决策边界 $\bx'\bw=0$ 是一个超平面，不是 S 形曲线。`,
      T`训练 = Bernoulli MLE = 最小化交叉熵（cross-entropy）；梯度里每个样本按"真实标签 − 预测概率"推动 $\bw$。无闭式解，但负对数似然是凸的，用梯度法或牛顿法；数据线性可分又不加正则化时，权重会无限变大。`,
      T`线性回归不适合分类：平方损失会惩罚那些分对了、但离阈值很远的点，它们把直线拉偏，决策边界跟着移动，原本分对的点被分错。`,
      T`多类（softmax）：每类一个权重向量，算一个得分（logit），取 exp 再除以总和变成概率；预测得分最大的类；训练最小化 one-hot 标签下的交叉熵（= 负对数似然）。参数个数 = 特征数 × 类数 + 类数。`,
    ],
    examQ: [
      { src: '2016 S2 Q2.1', q: T`What is the difference between linear regression and logistic regression, in terms of how they make predictions (after training)?`,
        a: T`Both compute the linear score $s=\bx'\bw$. Linear regression outputs it directly as a real-valued prediction $\hat y=\bx'\bw$; logistic regression squashes it through the sigmoid into a probability $P(y=1\mid\bx)=\sigma(\bx'\bw)\in(0,1)$ and predicts class 1 if this is $\ge0.5$ (i.e. $\bx'\bw\ge0$), so it is a linear classifier.`,
        qzh: T`就（训练完成后）如何做预测（predictions）而言，线性回归（linear regression）和 logistic 回归（logistic regression）有什么区别？`,
        azh: T`两者都先算线性得分 $s=\bx'\bw$。线性回归直接把它作为实数预测值输出，$\hat y=\bx'\bw$；logistic 回归把它通过 sigmoid 压成概率 $P(y=1\mid\bx)=\sigma(\bx'\bw)\in(0,1)$，概率 $\ge0.5$（即 $\bx'\bw\ge0$）时预测为类 1，所以它是一个线性分类器（linear classifier）。` },
      { src: '2016 S2 Q2.2', q: T`Why does the algorithm for training logistic regression involve gradient descent, while linear regression does not?`,
        a: T`Linear regression's squared-error objective is quadratic in $\bw$, so setting its gradient to zero gives linear equations with a closed-form solution, $\hat\bw=(\mathbf X'\mathbf X)^{-1}\mathbf X'\by$. Logistic regression's condition $\sum_i(y_i-\sigma(\bx_i'\bw))\bx_i=\mathbf 0$ is non-linear in $\bw$ (through the sigmoid) and has no closed-form solution, so it is solved iteratively (gradient descent or Newton); its negative log-likelihood is convex, so these reach the global optimum.`,
        qzh: T`为什么训练 logistic 回归的算法要用梯度下降（gradient descent），而线性回归不用？（相近的预测题见 [T13](#/T13/predicted)。）`,
        azh: T`线性回归的平方误差目标是 $\bw$ 的二次函数，令梯度为 0 得到线性方程组，有闭式解（closed-form solution）$\hat\bw=(\mathbf X'\mathbf X)^{-1}\mathbf X'\by$。logistic 回归的条件 $\sum_i(y_i-\sigma(\bx_i'\bw))\bx_i=\mathbf 0$ 通过 sigmoid 对 $\bw$ 是非线性的，没有闭式解，只能迭代求解（梯度下降或牛顿法）；它的负对数似然是凸的（convex），所以这些方法能到达全局最优。` },
    ],
    title: 'Logistic regression', en: 'Logistic regression',
    summary: '二分类：$P(Y=1\\mid\\bx)=\\sigma(\\bx\'\\bw)=\\frac{1}{1+e^{-\\bx\'\\bw}}$。决策边界 $\\bx\'\\bw=0$ 是超平面（所以是线性分类器）。训练 = Bernoulli MLE = 最小化 cross-entropy；没有闭式解，但目标是凸的，用 GD/Newton。',
    prereq: ['c03', 'c06', 'c13'],
    symbols: [
      [T`$\sigma(s)$`, T`logistic / sigmoid 函数 $\frac{1}{1+e^{-s}}$，输出在 $(0,1)$`],
      [T`$s=\bx'\bw$`, T`线性得分（logit）`],
      [T`$\theta(\bx_i)$`, T`课件记号：第 $i$ 个样本预测为正类的概率 $\sigma(\bx_i'\bw)$`],
      [T`$y_i\in\{0,1\}$`, T`标签`],
      [T`$H(g_{\text{ref}},g_{\text{est}})$`, T`cross-entropy：用估计分布去描述真实分布的"代价"`],
      [T`$\ln$, $e$`, T`自然对数和它的底 $e\approx2.718$`],
    ],
    goals: [
      '解释为什么线性回归不适合分类（outlier 拉偏边界）',
      '写出 logistic 模型，并证明决策边界是 $\\bx\'\\bw=0$',
      '写出 Bernoulli 对数似然和梯度 $\\sum_i(y_i-\\theta(\\bx_i))\\bx_i$，手算一步更新',
      '说明 MLE ⇔ 最小化 cross-entropy',
      '推广到多类：softmax、one-hot cross-entropy、数参数（Worksheet 6）',
    ],
    types: ['T13'],
    what: [
      T`**问题**（L04 p20）：用 BMI 预测是否患 2 型糖尿病（$y\in\{0,1\}$）。`,
      T`**用线性回归行不行？**（L04 p20–p21）拟合 $s=\bx'\bw$，$s\ge0.5$ 判"是"。没有 outlier 时可以；但如果有一个 BMI 极高的正类点，平方损失会让它的误差 $(1-\bx'\bw)^2$ 很大，把直线拉平，**阈值右移**，原本分对的正类点被分错——它"分得太对"反而受罚。`,
      T`**Logistic regression**（L04 p22–p23）：把线性得分压进 $(0,1)$ 当作概率：`,
      { t: 'math', tex: T`P(Y=1\mid\bx)=\sigma(\bx'\bw)=\frac{1}{1+\exp(-\bx'\bw)}` },
      T`它是 Bernoulli 分布、参数是 $\sigma(\bx'\bw)$：$y\mid\bx\sim\text{Bernoulli}(\sigma(\bx'\bw))$（L04 p25）。对比线性回归 $y\mid\bx\sim\mathcal N(\bx'\bw,\sigma^2)$。`,
    ],
    why: [
      T`logistic regression 是最常用的分类器之一，也是神经网络的"单个神经元"（c33：sigmoid 激活 + cross-entropy）。几个结论常出简答（T13）：为什么线性回归不适合分类、为什么叫线性、为什么没闭式解、MLE = cross-entropy。`,
      T`它也是 c09 判别式模型的代表（对比生成式的 Naive Bayes）。`,
    ],
    intuition: [
      T`**sigmoid = 把"离边界多远"变成"多有把握"。** $\bx'\bw$ 是带符号的（未归一化的）到超平面的距离（c03）。离边界远 → 概率接近 0 或 1；在边界上 → 0.5。`,
      T`**为什么是线性分类器？**（L04 p23 "How is logistic regression linear?"）概率 = 0.5 的地方就是决策边界，而 $\sigma(s)=0.5\iff s=0$，所以边界是 $\bx'\bw=0$——一个超平面，$\bw$ 是它的法向量（L04 p24）。`,
      { t: 'think', q: '名字里有 regression，为什么用来做**分类**？', a: T`它回归的是**概率**（更准确说是 log-odds $\log\frac{p}{1-p}=\bx'\bw$ 是线性的），输出是连续值 $P(Y=1\mid\bx)$。分类是再加一个阈值（通常 0.5）得到的。` },
      { t: 'story', title: 'logistic 这个词', md: '"logistic" 曲线最早由比利时数学家 Verhulst 在 19 世纪 30–40 年代提出，用来描述人口增长：先指数增长，后来受资源限制趋于饱和——正是 S 形。把它用于二分类的 logistic regression 由统计学家 David Cox 在 1958 年系统化。' },
    ],
    math: [
      { t: 'h3', text: '决策边界（L04 p23）' },
      { t: 'math', tex: T`\frac{1}{1+\exp(-\bx'\bw)}=\frac12\iff\exp(-\bx'\bw)=1\iff\bx'\bw=0` },
      { t: 'h3', text: '似然与对数似然（L04 p26–p27）' },
      T`决策边界告诉我们：**有了** $\bw$ 之后怎么分类。可 $\bw$ 本身还不知道。c06 的办法照用：写出"这批 0/1 标签出现"的概率，取 log，对 $\bw$ 求导——就是把硬币的 Bernoulli MLE 用在 $\sigma(\bx'\bw)$ 上。和硬币不同的是，导数等于 0 解不出闭式解，所以才要 c13 的迭代优化。`,
      T`记 $\theta(\bx_i)=\sigma(\bx_i'\bw)$。Bernoulli：$p(y_i\mid\bx_i)=\theta(\bx_i)^{y_i}(1-\theta(\bx_i))^{1-y_i}$（$y=1$ 时取 $\theta$，$y=0$ 时取 $1-\theta$）。独立样本相乘、取 log：`,
      { t: 'math', tex: T`L(\bw)=\sum_{i=1}^n\Big[y_i\log\theta(\bx_i)+(1-y_i)\log\big(1-\theta(\bx_i)\big)\Big]` },
      { t: 'deep', title: '课件 p27 最后一步的展开', hint: '课件跳步了', blocks: [
        T`记 $s=\bx_i'\bw$。$\log\sigma(s)=-\log(1+e^{-s})$；$1-\sigma(s)=\frac{e^{-s}}{1+e^{-s}}$，所以 $\log(1-\sigma(s))=-s-\log(1+e^{-s})$。`,
        T`代入：$y_i(-\log(1+e^{-s}))+(1-y_i)(-s-\log(1+e^{-s}))=(y_i-1)s-\log(1+e^{-s})$。即课件写的 $\sum_i\big[(y_i-1)\bx_i'\bw-\log(1+\exp(-\bx_i'\bw))\big]$。`,
      ] },
      T`**没有闭式解**（L04 p27–p28）：令梯度为 0 解不出 $\bw$。但负对数似然是**凸**的；特征没有共线（$\mathbf X$ 列满秩）时**严格凸**，最优解最多一个。列满秩、而且数据既不完全可分也不"准完全可分"（不存在一个超平面把两类分开、只允许点落在面上）时，有限的 MLE 存在且唯一，GD 或 Newton 能找到它；数据（准）线性可分时，似然只能在 $\|\bw\|\to\infty$ 的极限里逼近上确界，取不到有限的最优解（见常见误区）。`,
      { t: 'math', tex: T`\nabla L(\bw)=\sum_{i=1}^n\big(y_i-\theta(\bx_i)\big)\bx_i` },
      T`梯度的直觉：每个样本按"预测误差" $y_i-\theta(\bx_i)$ 把 $\bw$ 往自己的方向推。因为是**最大化** $L$，更新用加号（**gradient ascent，梯度上升**，L04 p28）：$\bw\leftarrow\bw+\eta\sum_i(y_i-\theta(\bx_i))\bx_i$。WK03 的写法是对平均损失做 **gradient descent（梯度下降）**：$\bw\leftarrow\bw-\eta\frac1n\mathbf X'(\boldsymbol\mu-\by)$，其中 $\boldsymbol\mu$ 是把每个样本的 $\theta(\bx_i)$ 排成的向量。两者方向相同，步长差一个 $n$ 倍。`,
      { t: 'h3', text: 'Cross-entropy（L04 p29–p31）' },
      T`上面是频率学派（c06）的写法：最大化整批标签出现的概率。课件后半段换成决策论（c07）的写法：给**每个样本**一个损失，再求平均。这个损失恰好等于"负的对数似然"，名字叫 **cross-entropy（交叉熵）**——所以最小化 cross-entropy 和最大化对数似然是同一件事：`,
      { t: 'math', tex: T`H(g_{\text{ref}},g_{\text{est}})=-\sum_{a\in A}g_{\text{ref}}(a)\log g_{\text{est}}(a)` },
      T`对一个样本，真实分布 $g_{\text{ref}}(1)=y_i,\ g_{\text{ref}}(0)=1-y_i$，估计分布 $g_{\text{est}}(1)=\theta(\bx_i)$：$H=-[y_i\log\theta(\bx_i)+(1-y_i)\log(1-\theta(\bx_i))]=-\log p(y_i\mid\bx_i)$。所以**最小化 cross-entropy 之和 = 最大化对数似然**（又一次"两条路同一个答案"）。`,
      { t: 'h3', text: '多分类：softmax regression（Worksheet 6）', id: 'softmax' },
      T`上面只有两类。$m$ 类时（如手写数字 0–9，$m=10$），每一类配一个权重向量 $\bw_k$，算一个得分 $s_k=\bx'\bw_k$（叫 **logit**），再用 softmax 把 $m$ 个得分变成概率：`,
      { t: 'math', tex: T`P(y=k\mid\bx)=\frac{\exp(\bx'\bw_k)}{\sum_{j=1}^m\exp(\bx'\bw_j)}` },
      T`取 exp 让每一项为正，除以总和让它们加起来为 1。exp 是单调增的，所以**预测 = 得分最大的那一类**（argmax），不用真的算出概率。$m=2$ 时 $P(y=1\mid\bx)=\frac{e^{s_1}}{e^{s_1}+e^{s_2}}=\sigma(s_1-s_2)$，就是上面的二分类 logistic regression。`,
      T`训练仍是 MLE。把标签写成 **one-hot** 向量 $\by$（正确的那一类为 1，其余为 0），一个样本的多类 cross-entropy 是 $-\sum_ky_k\log p_k=-\log p_{\text{正确类}}$，正好是负对数似然，所以最小化它就是最大化似然。`,
      T`**数参数**：每类一个 $D$ 维权重向量加一个 bias，共 $D\cdot m+m$ 个。Worksheet 6 的 MNIST：$28\times28=784$ 个像素当特征，10 类：$784\times10+10=7850$。它也叫没有隐藏层的单层神经网络（c33），仍是线性分类器。`,
    ],
    fx: [
      {
        title: 'Logistic 模型', tex: T`P(Y=1\mid\bx)=\htmlClass{fx-p1}{\sigma}\big(\htmlClass{fx-p2}{\bx'\bw}\big)=\frac{1}{1+\htmlClass{fx-p3}{\exp(-\bx'\bw)}}`,
        parts: [
          { label: 'σ', note: 'sigmoid：把任意实数压到 $(0,1)$；$\\sigma(0)=0.5$，$\\sigma(-s)=1-\\sigma(s)$。' },
          { label: "x'w", note: '线性得分（含 bias），等于给定 $\\bx$ 的 log-odds $\\log\\frac{P(Y=1\\mid\\bx)}{P(Y=0\\mid\\bx)}$。' },
          { label: 'exp(−s)', note: '$s$ 很大 → 趋于 0 → 概率趋于 1；$s$ 很负 → 趋于 ∞ → 概率趋于 0。' },
        ],
      },
      {
        title: '对数似然的梯度', tex: T`\nabla L(\bw)=\sum_{i}\big(\htmlClass{fx-p1}{y_i}-\htmlClass{fx-p2}{\theta(\bx_i)}\big)\htmlClass{fx-p3}{\bx_i}`,
        parts: [
          { label: 'y_i', note: '真实标签 0/1。' },
          { label: 'θ(x_i)', note: '当前模型给的正类概率。差值 = 预测误差；预测完美时为 0，这个样本不再推动 $\\bw$。' },
          { label: 'x_i', note: '推动的方向就是样本自己的特征向量。和线性回归的梯度形式一模一样（只是预测换成了 $\\sigma$）。' },
        ],
      },
    ],
    example: [
      { t: 'h3', text: '例 1：预测概率与决策' },
      T`$\bw=(w_0,w_1)=(-4,0.2)$，特征 $[1,\text{BMI}]$。BMI = 25：$s=w_0+w_1\times\text{BMI}=-4+0.2\times25=-4+5=1$，$\sigma(1)=\frac{1}{1+e^{-1}}\approx0.731$ ⇒ 判"是"。BMI = 20：$s=0$，概率 0.5，正好在边界上。`,
      { t: 'h3', text: '例 2：一步梯度上升' },
      T`一个样本 $\bx=(1,2)$，$y=1$，$\bw=(0,0)$，$\eta=0.1$：$\theta=\sigma(0)=0.5$；梯度 $(1-0.5)(1,2)=(0.5,1)$；新 $\bw=(0.05,0.1)$。`,
      { t: 'h3', text: '例 3：cross-entropy' },
      T`$y=1$，预测 $p=0.8$：$H=-\ln0.8\approx0.223$。$y=1$ 但预测 $p=0.1$：$H=-\ln0.1\approx2.303$。错得越自信，惩罚越大。`,
      { t: 'h3', text: '例 4：softmax（3 类）' },
      T`logits $(2,1,0)$：$e^2\approx7.389$，$e^1\approx2.718$，$e^0=1$，和 $\approx11.107$ ⇒ 概率 $\approx(0.665,\ 0.245,\ 0.090)$，预测第 1 类（得分最大）。如果正确答案是第 2 类，one-hot $\by=(0,1,0)$，loss $=-\ln0.245\approx1.41$。（c41 attention 的权重也是这样算的。）`,
      { t: 'fade', title: '分步练习：logistic 的梯度更新', plan: [T`$\theta=\sigma(\bx'\bw)$`, T`梯度 $(y-\theta)\bx$`, T`$\bw\leftarrow\bw+\eta\cdot$梯度`], items: [
        { md: T`$\bx=(1,3)$，$y=0$，$\bw=(0,0)$，$\eta=0.1$。`, steps: [
          { md: T`$\theta=\sigma(0)=0.5$` },
          { md: T`梯度 $(0-0.5)(1,3)=(-0.5,-1.5)$` },
          { md: T`$\bw\leftarrow\bw+\eta\nabla L=(-0.05,-0.15)$` },
        ] },
        { md: T`$\bx=(1,2)$，$y=1$，$\bw=(0,0.5)$，$\eta=0.1$。$s=1$，$\theta=\sigma(1)\approx0.7311$。`, steps: [
          { ask: '梯度的第二个分量 = ?', answer: 0.5379, tol: 0.002, show: T`$(1-0.7311)\times2\approx0.538$` },
          { ask: T`新的 $w_1=?$`, answer: 0.5538, tol: 0.002, show: T`$0.5+0.1\times0.538\approx0.554$` },
        ] },
        { md: T`cross-entropy（考试会给 $\ln$ 值：$\ln0.9\approx-0.105$，$\ln0.1\approx-2.303$）。`, steps: [
          { sg: 0, ask: T`$y=1$，$p=0.9$ 时 $H=?$`, answer: 0.105, tol: 0.002, show: T`$-\ln0.9\approx0.105$` },
          { sg: 0, ask: T`$y=0$，$p=0.9$ 时 $H=?$`, answer: 2.303, tol: 0.003, show: T`$-\ln(1-0.9)=-\ln0.1\approx2.303$` },
        ] },
      ] },
    ],
    viz: [
      { id: 'logistic-vs-linear', how: '8 个 BMI 样本（红 = 患病，蓝 = 未患病）。红线是线性回归，红竖线是它在 0.5 处的分界；绿色 S 形曲线是 logistic regression，绿竖线是它的分界（概率 0.5）。',
        try: '勾选"加一个很远的正类点"：红线被拉平、红分界右移、出现错分；绿色曲线几乎不动。这就是 L04 p21 的论点。' },
      { id: 'sigmoid-2d', how: '二维特征时，颜色表示 $P(y=1\\mid\\bx)$。绿线是 $P=0.5$ 的决策边界（超平面），红箭头是 $\\bw$。',
        try: '① 只改 $b$：边界平移。② 把 $w_1,w_2,b$ **三个一起**乘 2：边界不动，颜色过渡变陡；只放大 $w_1,w_2$ 而 $b\ne0$ 时，边界会移动。③ 把 $\\bw$ 方向反过来：红蓝互换。' },
    ],
    compare: [
      { t: 'table', head: ['', '线性回归', 'Logistic regression'], rows: [
        ['任务', '回归（连续 $y$）', '二分类'],
        ['$p(y\\mid\\bx)$', '$\\mathcal N(\\bx\'\\bw,\\sigma^2)$', '$\\text{Bernoulli}(\\sigma(\\bx\'\\bw))$'],
        ['损失', 'square loss', 'cross-entropy（log loss）'],
        ['闭式解', '有', '没有（迭代求解）'],
        ['凸？', '是', '是（无冗余特征时严格凸）'],
        ['上升方向（让目标变好）', '$-\\frac12\\nabla\\text{RSS}=\\sum(y_i-\\bx_i\'\\bw)\\bx_i$', '$\\nabla L=\\sum(y_i-\\sigma(\\bx_i\'\\bw))\\bx_i$（对数似然的梯度）'],
      ] },
      { t: 'exam', md: T`**Why is linear regression with squared loss a poor choice for classification?** Squared loss heavily penalises points that are correctly classified but far from the threshold (e.g. a very large BMI with $y=1$), so such points pull the fitted line and shift the decision boundary, causing misclassifications. Logistic regression models $P(y=1\mid\mathbf x)=\sigma(\mathbf x'\mathbf w)$, which saturates at 0 and 1 and is trained with the Bernoulli likelihood (cross-entropy), so confidently correct points contribute almost no loss.` },
    ],
    pitfalls: [
      ['logistic regression 的决策边界是 S 形曲线', 'S 形的是概率随得分的变化；**边界** $\\bx\'\\bw=0$ 是超平面。'],
      ['有闭式解', '没有，需要 GD / Newton（但目标凸）。'],
      ['梯度是 $\\sum(\\theta(\\bx_i)-y_i)\\bx_i$ 时用 $+\\eta$', '那是负对数似然的梯度，要用 $-\\eta$（下降）。两种写法更新结果相同。'],
      ['数据线性可分时 MLE 存在有限解', '可分时把 $\\|\\bw\\|$ 放大，似然一直增大、没有有限的最大值，$\\bw$ 会发散。这是 MLE 的标准注意事项（加正则化可以解决）；L04 结尾提到正则化的直接原因是共线 / 冗余特征。'],
    ],
    quiz: [
      { type: 'num', q: '$\\bx\'\\bw=0$ 时 $P(Y=1\\mid\\bx)=?$', answer: 0.5, explain: T`Logistic regression 的模型是 $P(Y=1\mid\bx)=\sigma(\bx'\bw)$，其中 sigmoid（S 形函数）$\sigma(s)=\frac{1}{1+e^{-s}}$。题目说得分 $s=\bx'\bw=0$，代入：$\sigma(0)=\frac1{1+e^{0}}=\frac1{1+1}=0.5$。**得分为 0 的点正好在决策边界上，两类各占一半可能**，这也是为什么 logistic regression 的边界是 $\bx'\bw=0$。` },
      { type: 'num', q: '$\\sigma(s)=0.8$，求 $\\sigma(-s)$。', answer: 0.2, explain: T`Sigmoid 有对称性 $\sigma(-s)=1-\sigma(s)$。推导：$\sigma(-s)=\frac1{1+e^{s}}$，分子分母同乘 $e^{-s}$ 得 $\frac{e^{-s}}{e^{-s}+1}=1-\frac1{1+e^{-s}}=1-\sigma(s)$。题目给 $\sigma(s)=0.8$，所以 $\sigma(-s)=1-0.8=0.2$。含义：**得分取反，就是把 $P(Y=1)$ 和 $P(Y=0)$ 对调**。` },
      { type: 'num', q: '$\\bw=(1,-2)$（含 bias），$\\bx=(1,0.5)$。$P(Y=1\\mid\\bx)=?$', answer: 0.5, explain: T`先算线性得分 $s=\bx'\bw$，再代入 sigmoid。"含 bias"的意思是：$\bx$ 的第一个分量是 dummy feature $x_0=1$，$\bw$ 的第一个分量是截距 $w_0=1$。$s=1\times1+(-2)\times0.5=1-1=0$，所以 $P(Y=1\mid\bx)=\sigma(0)=0.5$，这个点正好在决策边界上。**陷阱是漏掉 bias 项**：只算 $-2\times0.5=-1$ 会得到 $\sigma(-1)\approx0.269$。`, qzh: T`已知 $\bw=(1,-2)$，其中含偏置项（bias）；$\bx=(1,0.5)$。求 $P(Y=1\mid\bx)$。` },
      { type: 'mc', q: 'Logistic regression 的训练目标等价于：', options: ['最小化 RSS', '最小化 cross-entropy（负对数似然）', '最大化 margin', '最小化 0-1 loss'], answer: 1, explain: 'L04 p29–p31。' },
      { type: 'num', q: '3 类 softmax，logits $(\\ln6,\\ \\ln3,\\ 0)$。第 1 类的概率？', answer: 0.6, explain: T`softmax 先对每个 logit 取 exp，再除以总和。exp 和 ln 互为反函数：$\exp(\ln6)=6$，$\exp(\ln3)=3$，$\exp(0)=1$，和 $6+3+1=10$。第 1 类 $6/10=0.6$，另外两类 $0.3$、$0.1$，三者和为 1；预测第 1 类，因为它的 logit 最大。**陷阱：直接拿 logit 相除**，$\ln6/(\ln6+\ln3+0)$ 不是概率。` },
      { type: 'num', q: '（Worksheet 6）MNIST 的 $28\\times28$ 灰度图拉平当特征，做 10 类 multiclass logistic regression（含 bias）。参数个数？', answer: 7850, explain: T`特征数 $D=28\times28=784$（每个像素一个）。每类一个 784 维权重向量：$784\times10=7840$；每类再加 1 个 bias，共 10 个。合计 $7840+10=7850$。worksheet 把权重排成 $784\times10$ 的矩阵 $W$ 加长度 10 的 $\mathbf b$，数出来一样。这个模型就是没有隐藏层的单层神经网络。` },
      { type: 'show', q: '用英文说明为什么 logistic regression 是线性分类器。', answer: T`It predicts class 1 when $P(y=1\mid\mathbf x)=\sigma(\mathbf x'\mathbf w)\ge\frac12$. Since $\sigma(s)=\frac12\iff s=0$, the decision boundary is $\mathbf x'\mathbf w=0$, a hyperplane with normal vector $\mathbf w$; the sigmoid only maps the linear score to a probability.` },
    ],
  });

  /* =====================================================================
   * r02 · W2 复习
   * ===================================================================== */
  SML.content.add(SML.review({
    id: 'r02', week: 'W2', title: 'W2 复习：线性回归、优化、logistic', en: 'Week 2 review',
    summary: '本周的主线是"线性模型 + 怎么求解"：线性回归有闭式解（normal equations），basis expansion 让它拟合非线性；logistic regression 没有闭式解，要靠 GD / Newton。往年直接考：**线性回归最小化什么**、**XOR / 特征映射**、**线性回归为什么不适合分类**、**GD vs Newton**。',
    keypoints: [
      [T`线性回归最小化 RSS $\sum(y_i-\bx_i'\bw)^2$；dummy feature $x_0=1$ 吸收截距。`, 'c10'],
      [T`Gaussian 噪声下 MLE = 最小二乘；normal equations $\mathbf X'\mathbf X\bw=\mathbf X'\by$ 总成立，闭式解 $(\mathbf X'\mathbf X)^{-1}\mathbf X'\by$ 和解的唯一性要求 $\mathbf X$ 列满秩；$\hat\sigma^2=\text{RSS}/n$。`, 'c11'],
      [T`Basis expansion $\varphi(\bx)'\bw$：对参数线性、对输入非线性；XOR 用距离特征后 A 得分 $\sqrt2$、B 得分 2。`, 'c12'],
      [T`GD：$\boldsymbol\theta\leftarrow\boldsymbol\theta-\eta\nabla L$；SGD 用 batch；凸 ⇒ 局部最小即全局，严格凸 ⇒ 最小点若存在则唯一。`, 'c13'],
      [T`Newton：$\boldsymbol\theta\leftarrow\boldsymbol\theta-(\nabla^2L)^{-1}\nabla L$；步数少但每步 $O(p^3)$。`, 'c14'],
      [T`Logistic：$P(Y=1\mid\bx)=\sigma(\bx'\bw)$，边界 $\bx'\bw=0$；梯度 $\sum(y_i-\theta(\bx_i))\bx_i$；MLE = 最小化 cross-entropy；无闭式解但凸；多类用 softmax $\frac{\exp(s_k)}{\sum_j\exp(s_j)}$ + one-hot cross-entropy，参数 $Dm+m$。`, 'c15'],
    ],
    map: [
      { t: 'table', head: ['模型', '概率假设', '损失（ERM 视角）', '怎么求解'], rows: [
        ['线性回归', '$y\\mid\\bx\\sim\\mathcal N(\\bx\'\\bw,\\sigma^2)$', 'square loss', '闭式解（或 GD）'],
        ['+ basis expansion', '同上，把 $\\bx$ 换成 $\\varphi(\\bx)$', '同上', '同上'],
        ['Logistic regression', '$y\\mid\\bx\\sim\\text{Bernoulli}(\\sigma(\\bx\'\\bw))$', 'cross-entropy', 'GD / SGD / Newton'],
      ] },
      T`两条推导路线再次汇合：**MLE（概率假设）= ERM（损失函数）**。下一周（W3）加入第三条：给 $\bw$ 先验做 MAP = 正则化。`,
    ],
    recall: [
      { q: '（原题）What quantity is minimised by linear regression?', a: T`Sum of squared residuals $\sum_i(y_i-\mathbf x_i'\mathbf w)^2=\|\mathbf y-\mathbf X\mathbf w\|^2$.`, ch: 'c10', qzh: '线性回归（linear regression）最小化的是什么量？', azh: T`残差平方和（sum of squared residuals）$\sum_i(y_i-\mathbf x_i'\mathbf w)^2=\|\mathbf y-\mathbf X\mathbf w\|^2$。` },
      { q: '1D 最小二乘：写出 $b$ 的公式。', a: T`$b=\frac{n\sum xy-\sum x\sum y}{n\sum x^2-(\sum x)^2}$，$a=\bar y-b\bar x$。`, ch: 'c10' },
      { q: '线性回归的概率模型？为什么 MLE = 最小二乘？', a: T`$y=\bx'\bw+\varepsilon$，$\varepsilon\sim\mathcal N(0,\sigma^2)$；对数似然 $=-\frac{1}{2\sigma^2}\text{RSS}+C$。`, ch: 'c11' },
      { q: 'Normal equations 和闭式解？什么时候失效？', a: T`$\mathbf X'\mathbf X\bw=\mathbf X'\by$，$\hat\bw=(\mathbf X'\mathbf X)^{-1}\mathbf X'\by$；$\mathbf X$ 列线性相关（如重复特征、$n<m+1$）时不可逆。`, ch: 'c11' },
      { q: 'Basis expansion 后模型对谁线性？', a: '对参数 $\\bw$ 线性，对输入 $\\bx$ 可以非线性。', ch: 'c12' },
      { q: 'L03 p24 XOR：用哪些特征？A、B 两类的得分？', a: T`$\varphi_j=\|\bx-\mathbf z_j\|$，中心为四个训练点，$\bw=[1,0,0,1]$：A 得 $\sqrt2$，B 得 2。`, ch: 'c12' },
      { q: 'RBF 的一般形式？', a: T`$\varphi(\bx)=\psi(\|\bx-\mathbf z\|)$，如 $\exp(-\frac1\sigma\|\bx-\mathbf z\|^2)$。`, ch: 'c12' },
      { q: 'GD 更新式？学习率太大会怎样？什么时候停？', a: T`$\boldsymbol\theta\leftarrow\boldsymbol\theta-\eta\nabla L$；震荡或发散；梯度范数小于阈值 / 参数几乎不变 / 达到最大迭代次数时停。`, ch: 'c13' },
      { q: 'Convex vs strictly convex 保证了什么？', a: '凸：局部最小 = 全局最小；严格凸：全局最小点若存在则唯一。判别（二阶可导时）：Hessian 处处 PSD ⇔ 凸；Hessian 处处正定 ⇒ 严格凸。', ch: 'c13' },
      { q: 'minimum 和 minimiser 的区别？', a: '最小值本身 vs 取到最小值的参数（argmin）；ML 要后者。', ch: 'c13' },
      { q: 'Newton 的一维更新？优缺点？', a: T`$\theta\leftarrow\theta-L'/L''$；步数少、不用学习率，但每步要算并求逆 Hessian（$O(p^3)$）。`, ch: 'c14' },
      { q: 'Logistic 模型和决策边界？', a: T`$P(Y=1\mid\bx)=\frac{1}{1+e^{-\bx'\bw}}$；边界 $\bx'\bw=0$（超平面）。`, ch: 'c15' },
      { q: 'Logistic 对数似然的梯度？', a: T`$\sum_i(y_i-\sigma(\bx_i'\bw))\bx_i$（最大化用 $+\eta$）。`, ch: 'c15' },
      { q: '为什么线性回归不适合分类？', a: '平方损失重罚"分对但离得远"的点，outlier 把直线拉偏、阈值移动导致错分。', ch: 'c15' },
      { q: 'Cross-entropy 和 logistic 的 MLE 什么关系？', a: '一个样本的 cross-entropy = 负对数似然；最小化总 cross-entropy ⇔ 最大化对数似然。', ch: 'c15' },
    ],
    formulas: [
      ['$\\hat\\bw=\\argmin\\|\\by-\\mathbf X\\bw\\|^2$', '线性回归目标', 'L03 p6, p16'],
      ['$b=\\frac{n\\sum xy-\\sum x\\sum y}{n\\sum x^2-(\\sum x)^2}$', '1D 最小二乘', 'L03 p7–p8'],
      ['$\\hat\\bw=(\\mathbf X\'\\mathbf X)^{-1}\\mathbf X\'\\by$', 'normal equations', 'L03 p17'],
      ['$\\varphi(\\bx)=\\psi(\\|\\bx-\\mathbf z\\|)$', 'RBF', 'L03 p25'],
      ['$\\boldsymbol\\theta\\leftarrow\\boldsymbol\\theta-\\eta\\nabla L$', 'GD', 'L04 p10'],
      ['$\\boldsymbol\\theta\\leftarrow\\boldsymbol\\theta-(\\nabla^2L)^{-1}\\nabla L$', 'Newton', 'L04 p16'],
      ['$\\sigma(s)=\\frac1{1+e^{-s}}$', 'sigmoid', 'L04 p22'],
      ['$L(\\bw)=\\sum[y_i\\log\\theta_i+(1-y_i)\\log(1-\\theta_i)]$', 'logistic 对数似然', 'L04 p27'],
      ['$\\nabla L=\\sum(y_i-\\theta_i)\\bx_i$', 'logistic 梯度', 'L04 p28'],
      ['$H=-\\sum_a g_{\\text{ref}}(a)\\log g_{\\text{est}}(a)$', 'cross-entropy', 'L04 p30'],
    ],
    exam: [
      ['线性回归最小化什么（定义题）', '2026 Q1a、2025 Q1a 原题', '[T13](#/T13)'],
      ['XOR / 特征映射使数据线性可分', '2025 practice Q2', '[T8](#/T08)'],
      ['线性回归为什么不适合分类', 'T13 预测', '[T13](#/T13/predicted)'],
      ['GD vs Newton 的取舍', 'T13 预测', '[T13](#/T13/predicted)'],
      ['logistic 一步梯度更新 / cross-entropy 计算', 'WK03', '本页综合自测'],
    ],
    quiz: [
      { type: 'num', q: '点 $(1,1),(2,2),(3,6)$ 最小二乘斜率 $b=?$', answer: 2.5, explain: '$\\sum x=6,\\sum y=9,\\sum x^2=14,\\sum xy=1+4+18=23$，$D=6$，$b=(69-54)/6=2.5$。' },
      { type: 'num', q: '$\\mathbf X\'\\mathbf X=\\begin{bmatrix}4&0\\\\0&2\\end{bmatrix}$，$\\mathbf X\'\\by=\\begin{bmatrix}8\\\\3\\end{bmatrix}$，$\\hat w_0=?$', answer: 2, explain: '$8/4=2$。', qzh: T`已知 $\mathbf X'\mathbf X=\begin{bmatrix}4&0\\0&2\end{bmatrix}$，$\mathbf X'\by=\begin{bmatrix}8\\3\end{bmatrix}$，求 $\hat w_0$。` },
      { type: 'num', q: '$L(\\theta)=(\\theta-5)^2$，$\\theta=1$，$\\eta=0.25$，GD 一步后？', answer: 3, explain: '$L\'=-8$，$1+2=3$。' },
      { type: 'num', q: '$L(\\theta)=3\\theta^2-6\\theta$，Newton 从 $\\theta=7$ 一步后？', answer: 1, explain: '$L\'=36$，$L\'\'=6$，$7-6=1$（二次函数一步到最优）。' },
      { type: 'num', q: 'logistic：$\\bx=(1,4)$，$y=0$，当前 $\\theta(\\bx)=0.25$。对数似然梯度的第二分量？', answer: -1, explain: '$(0-0.25)\\times4=-1$。' },
      { type: 'mc', q: 'XOR 四个点在 $\\varphi_1+\\varphi_4$ 下的得分是：', options: ['A: 0，B: 1', 'A: $\\sqrt2$，B: 2', 'A: 2，B: $\\sqrt2$', '全部相同'], answer: 1, explain: 'L03 p24。' },
      { type: 'mc', q: '下面哪个**没有**闭式解？', options: ['线性回归', '多项式基的线性回归', 'logistic regression', 'ridge regression'], answer: 2, explain: 'L04 p27。' },
      { type: 'show', q: '（英文）Why might you use gradient descent rather than Newton–Raphson?', answer: T`Newton–Raphson needs the Hessian and its inverse at every step, costing $O(p^2)$ memory and $O(p^3)$ time, which is infeasible for many parameters; gradient descent only needs the gradient ($O(p)$ per step) and scales to large models, at the cost of more iterations and a tuned learning rate.`, qzh: '为什么可能会选择梯度下降（gradient descent）而不是 Newton–Raphson 方法？', azh: 'Newton–Raphson 每一步都需要 Hessian 矩阵（Hessian）及其逆，内存开销 $O(p^2)$、时间开销 $O(p^3)$，参数很多时不可行；梯度下降（gradient descent）只需要梯度（每步 $O(p)$），能扩展到大模型，代价是迭代次数更多，而且要调好学习率（learning rate）。' },
    ],
    next: '下一周（W3）：正则化与泛化。你会看到 c11 里 $\\mathbf X\'\\mathbf X$ 不可逆的问题怎么用 ridge 解决，以及 c12 的多项式次数拉太高会怎样（过拟合）。',
  }));
})(window);
