/* W5 · L09 核方法 + L10 感知机 — chapters c28–c32 and review r05. */
(function (root) {
  'use strict';
  const SML = root.SML;
  const T = String.raw;
  const add = (c) => SML.content.add(SML.chapter(c));

  /* =====================================================================
   * c28 · Lagrangian、KKT、SVM dual（L09 p1–p14）
   * ===================================================================== */
  add({
    id: 'c28', week: 'W5', lec: 'L09', pages: 'L09 p1–p14', star: 2,
    title: 'Lagrangian、KKT、SVM dual', en: 'Lagrangian duality, KKT conditions, the SVM dual',
    summary: '带约束的优化不能直接用梯度下降。**Lagrange multipliers（拉格朗日乘子）** 把约束变成罚项，得到 **dual problem（对偶问题）**。SVM 的 dual 有两个关键性质：解是 $\\bw^*=\\sum_i\\lambda_iy_i\\bx_i$（只有支持向量的 $\\lambda_i>0$），而且数据**只以点积 $\\bx_i\'\\bx_j$ 的形式出现**——这为 kernel trick 铺好了路。',
    prereq: ['c26', 'c27'],
    symbols: [
      [T`$f,\ g_i,\ h_j$`, T`目标函数、不等式约束 $g_i\le0$、等式约束 $h_j=0$`],
      [T`$\mathcal L$`, T`Lagrangian（拉格朗日函数）`],
      [T`$\lambda_i\ge0$, $\nu_j$`, T`拉格朗日乘子 / dual variables（对偶变量）；本章 $\lambda$ 不是正则系数`],
      [T`$\bx^*$, $\lambda^*$`, T`星号 = 最优值`],
      [T`$\frac{\partial\mathcal L}{\partial b}$, $\nabla_\bw\mathcal L$`, T`对 $b$ 的偏导、对向量 $\bw$ 的梯度`],
      [T`$\bx$（标准形式里）`, T`泛指优化变量；对 SVM 来说就是 $(\bw,b)$`],
      [T`$n,\ m$（标准形式里）`, T`不等式 / 等式约束的个数。SVM 里每个训练点一个约束，所以 $n$ 又恰好等于样本数`],
      [T`$C$`, T`soft margin 的惩罚系数（第 27 章）：dual 里变成上界 $\lambda_i\le C$；数据线性可分时，$C$ 足够大就得到 hard-margin 解；不可分时 $C$ 再大也消不掉所有 slack`],
      [T`$d$`, T`特征维数`],
      [T`$O(n^3)$`, T`计算量随样本数 $n$ 的三次方增长`],
    ],
    goals: [
      '把约束优化写成标准形式，写出 Lagrangian（L09 p5–p6）',
      '说出 KKT 四个条件（primal feasibility、dual feasibility、complementary slackness、stationarity）',
      '推出 SVM dual：由 stationarity 得 $\\bw^*=\\sum\\lambda_iy_i\\bx_i$、$\\sum\\lambda_iy_i=0$，代回得对偶目标',
      '解释支持向量 ⇔ $\\lambda_i>0$；soft margin 的 dual 只多了 $0\\le\\lambda_i\\le C$',
    ],
    types: ['T04'],
    notExam: 'Chunking（分块法）、SMO（sequential minimal optimisation，序列最小优化）（L09 p13）只需知道名字和动机（利用很多 $\\lambda_i=0$），不用会算法。强对偶成立的一般条件（凸 + Slater 条件）课件没展开；只需记住 SVM 满足强对偶。',
    what: [
      { t: 'h3', text: '① 问题：SVM 是带约束的优化，怎么解（L09 p3–p4）' },
      T`c26 得到的 hard-margin SVM 是"在 $n$ 个约束 $y_i(\bw'\bx_i+b)\ge1$ 下最小化 $\frac12\|\bw\|^2$"。处理约束的通用工具是 **Lagrangian（拉格朗日函数）**：给每个约束配一个非负系数 $\lambda_i$，把约束加进目标；再从另一个方向求解，得到 **dual problem（对偶问题）**。dual 的好处：数据只以**点积** $\bx_i'\bx_j$ 的形式出现——下一章 c29 的 kernel trick 就靠这一点。`,
      { t: 'h3', text: '② 先用一个一维例子看懂"罚款"的做法' },
      T`先别管 SVM 的 $n$ 个约束，看一个能心算的问题：**minimize $f(x)=(x-3)^2$，约束 $x\le1$**。不管约束的话最低点是 $x=3$，但它不合法，所以答案只能在边界 $x=1$ 上。Lagrangian 的做法：给约束配一个**非负的罚款系数** $\lambda$，把约束搬进目标里，再用"导数为 0"之类的条件把答案逼出来：`,
      { t: 'steps', items: [
        T`约束写成"$\le0$"的样子：$g(x)=x-1\le0$。目标加罚款：$\mathcal L(x,\lambda)=(x-3)^2+\lambda(x-1)$，$\lambda\ge0$。`,
        T`**导数为 0**（stationarity，驻点）：$\frac{d\mathcal L}{dx}=2(x-3)+\lambda=0$ ⇒ $x=3-\lambda/2$。`,
        T`**罚款和违规不能同时非零**（complementary slackness，互补松弛）：$\lambda(x-1)=0$，只有两种可能。情况 A：$\lambda=0$ ⇒ $x=3$，但 $3\le1$ 不成立（不满足约束）✗。情况 B：$x=1$（贴在边界上）⇒ $\lambda=2(3-1)=4\ge0$（罚款系数非负）✓。`,
        T`答案 $x^*=1,\ \lambda^*=4$：满足约束 $x^*\le1$ ✓，罚款非负 $\lambda^*\ge0$ ✓，$\lambda^*(x^*-1)=0$ ✓，导数为 0 ✓——这四个 ✓ 就是下面 ③ 要命名的 KKT 四条。`,
      ] },
      T`**对照：约束不紧时。** 把约束换成 $x\le5$：情况 A 的 $x=3$ 满足约束 ✓，所以 $\lambda^*=0$——约束根本没起作用，罚款为 0。这就是 SVM 里"离边界远的点 $\lambda_i=0$、只有压在边界上的支持向量 $\lambda_i>0$"（见下面"直觉"和"数学定义"两节）。$\lambda^*=4$ 的含义：约束"推回去"的力度——在 $x=1$ 处 $f$ 的斜率是 $-4$，乘子刚好把它抵消。`,
      { t: 'h3', text: '③ 一般情况：标准形式 → Lagrangian → KKT（L09 p5–p7）' },
      T`刚才的做法不是一维专用的，任何"带约束的最小化"都能这样做。课件的一般写法：`,
      T`**标准形式**（L09 p5）：minimize $f(\bx)$ s.t. $g_i(\bx)\le0$（$i=1..n$），$h_j(\bx)=0$（$j=1..m$）。Hard-margin SVM：$f=\frac12\|\bw\|^2$，$g_i=1-y_i(\bw'\bx_i+b)\le0$。`,
      T`**Lagrangian**（L09 p6）：每个约束配一个乘子，加到目标上：`,
      { t: 'math', tex: T`\mathcal L(\bx,\boldsymbol\lambda,\boldsymbol\nu)=f(\bx)+\sum_{i=1}^n\lambda_ig_i(\bx)+\sum_{j=1}^m\nu_jh_j(\bx),\qquad\lambda_i\ge0` },
      T`**Primal（原问题）** $=\min_\bx\max_{\boldsymbol\lambda\ge0,\boldsymbol\nu}\mathcal L$；**Dual（对偶问题）** $=\max_{\boldsymbol\lambda\ge0,\boldsymbol\nu}\min_\bx\mathcal L$——交换 min 和 max 的顺序。为什么原问题 = $\min\max\mathcal L$：若某个 $g_i>0$（违反约束），内层 max 让 $\lambda_i\to+\infty$；若某个 $h_j\ne0$，让 $\nu_j\to\pm\infty$；两种情况 $\mathcal L=+\infty$，外层 min 自然避开。满足约束时最大化只能把罚项压到 0，剩下 $f$。SVM 是凸二次规划（QP），满足 **strong duality（强对偶）**：两者最优值相等，解 dual 就等于解 primal（L09 p6、p10）。`,
      { t: 'slide', src: 'L09/p06', caption: '老师的原页：约束被搬进目标变成"罚款"（右上框）；违反约束时内层 max 把罚款推到 $+\\infty$，所以 $\\min\\max$ 就是原问题；交换成 $\\max\\min$ 就是 dual。' },
      T`**KKT 条件**（Karush–Kuhn–Tucker，L09 p7）：最优解必须满足（对照 ② 的四个 ✓）：`,
      { t: 'ol', items: [
        T`**Primal feasibility（原可行）**：$g_i(\bx^*)\le0$，$h_j(\bx^*)=0$。`,
        T`**Dual feasibility（对偶可行）**：$\lambda_i^*\ge0$。`,
        T`**Complementary slackness（互补松弛）**：$\lambda_i^*g_i(\bx^*)=0$——$\lambda_i^*>0$ 就**必须**有 $g_i=0$（约束是紧的）；反过来，约束紧的点乘子也可以是 0。`,
        T`**Stationarity（驻点）**：$\nabla_\bx\mathcal L(\bx^*,\boldsymbol\lambda^*,\boldsymbol\nu^*)=\mathbf 0$。`,
      ] },
      T`下面"数学定义"一节把这套工具用到 SVM 上：对 $\bw,b$ 求导（stationarity）、代回去，就得到 dual。`,
    ],
    why: [
      T`推出 dual 不是为了"多做一遍"。dual 有两个巨大好处（L09 p10–p13）：`,
      { t: 'ul', items: [
        T`**数据只以点积 $\bx_i'\bx_j$ 出现**——把点积换成 kernel $K(\bx_i,\bx_j)$，就能在高维甚至无限维特征空间里训练 SVM，而不用真的算特征（c29）。`,
        T`**解是稀疏的**：只有支持向量的 $\lambda_i>0$，预测只需要它们。`,
        T`复杂度看样本数：dual 约 $O(n^3)$，primal 约 $O(d^3)$（L09 p10，粗略说法）——特征维度很高时 dual 更合适。`,
      ] },
    ],
    intuition: [
      T`**乘子 = 违规的罚款**（L09 p6、讲者的"湖与桥"比喻：只能在桥南边找湖的最深点）。如果某个约束被违反（$g_i>0$），内层的 max 会把 $\lambda_i$ 推到 $+\infty$，$\mathcal L=+\infty$；外层的 min 自然会避开违规的 $\bx$。所以 $\min\max\mathcal L$ 等价于原约束问题。`,
      T`**互补松弛的直觉**：约束不紧（点在 margin 外，$g_i<0$）时，罚款没必要，$\lambda_i=0$；只有压在边界上的点（支持向量）才"出力"，$\lambda_i>0$。`,
      { t: 'think', q: T`由 $\bw^*=\sum_i\lambda_iy_i\bx_i$，如果把一个**不是**支持向量的训练点删掉，SVM 的解会变吗？`, a: T`不会。非支持向量的 $\lambda_i=0$，在求和里不出现；删掉这个点后，原来的最优解仍然满足剩下问题的全部最优性条件，所以解不变。SVM 的解只由 $\lambda_i>0$ 的点决定。（注意：$\lambda_i=0$ 的点也可能恰好在 margin 线上，但删掉它同样不影响解。）` },
      { t: 'story', title: '名字里的人', md: 'Lagrange 乘子法出自 Lagrange 1788 年的《分析力学》。不等式约束的最优性条件由 William Karush 在 1939 年的硕士论文里首先给出，1951 年 Kuhn 和 Tucker 独立发表并让它出名——所以叫 KKT 条件。' },
    ],
    math: [
      { t: 'h3', text: '推导 hard-margin SVM 的 dual（L09 p8–p10）' },
      T`和一维例子一样：先用 stationarity（导数为 0）把原变量写成 $\lambda$ 的函数，再代回 Lagrangian。SVM 里对 $\bw$ 和 $b$ 求导，得到 $\bw^*=\sum_i\lambda_iy_i\bx_i$ 和 $\sum_i\lambda_iy_i=0$；代回去以后 $\bw$ 消失了，数据只剩下点积 $\bx_i'\bx_j$——这就是开头说的 dual 的好处，也是下一章能把点积换成 kernel 的原因。`,
      { t: 'steps', items: [
        T`Lagrangian：$\mathcal L(\bw,b,\boldsymbol\lambda)=\frac12\|\bw\|^2+\sum_i\lambda_i\big(1-y_i(\bw'\bx_i+b)\big)$。`,
        T`展开（L09 p9）：$\mathcal L=\frac12\bw'\bw+\sum_i\lambda_i-\sum_i\lambda_iy_i\bx_i'\bw-\sum_i\lambda_iy_ib$。`,
        T`对 $b$ 求偏导令为 0：$-\sum_i\lambda_iy_i=0$ ⇒ $\sum_i\lambda_iy_i=0$。`,
        T`对 $\bw$ 求梯度令为 0：$\bw-\sum_i\lambda_iy_i\bx_i=\mathbf 0$ ⇒ $\bw^*=\sum_i\lambda_iy_i\bx_i$。`,
        T`代回 $\mathcal L$（含 $b$ 的项因 $\sum\lambda_iy_i=0$ 消失）：$\frac12\sum_{i,j}\lambda_i\lambda_jy_iy_j\bx_i'\bx_j+\sum_i\lambda_i-\sum_{i,j}\lambda_i\lambda_jy_iy_j\bx_i'\bx_j$，合并即下面的 dual 目标。（第一项从哪来：$\|\bw\|^2=\bw'\bw=\big(\sum_i\lambda_iy_i\bx_i\big)'\big(\sum_j\lambda_jy_j\bx_j\big)$，展开后每一项是 $\lambda_i\lambda_jy_iy_j\bx_i'\bx_j$；第三项是把同一个 $\bw$ 代进 $-\sum_i\lambda_iy_i\bx_i'\bw$，得到同一个双重求和。"一半"减"一个"等于减一半：$\sum_i\lambda_i-\frac12\sum_{i,j}\dots$。）`,
      ] },
      { t: 'slide', src: 'L09/p10', caption: '老师的原页：SVM 的 dual。注意数据只以点积 $\\bx_i\'\\bx_j$ 出现（最后一行"more later on kernels"）。' },
      { t: 'math', tex: T`\textbf{Dual:}\quad\argmax_{\boldsymbol\lambda}\ \sum_{i=1}^n\lambda_i-\frac12\sum_{i=1}^n\sum_{j=1}^n\lambda_i\lambda_jy_iy_j\,\bx_i'\bx_j\quad\text{s.t.}\quad\lambda_i\ge0,\ \ \sum_i\lambda_iy_i=0` },
      { t: 'h3', text: '用 dual 的解做预测（L09 p11、p19）' },
      T`$\bw^*=\sum_i\lambda_i^*y_i\bx_i$；对任意支持向量 $j$：$y_j\big(b^*+\sum_i\lambda_i^*y_i\bx_i'\bx_j\big)=1$ ⇒ 解出 $b^*$。预测：`,
      { t: 'math', tex: T`s=b^*+\sum_{i=1}^n\lambda_i^*y_i\,\bx_i'\bx\quad(\text{取符号分类})` },
      { t: 'h3', text: 'Soft margin 的 dual（L09 p12）' },
      T`目标完全一样，只是约束变成 **box constraints（盒约束）** $0\le\lambda_i\le C$（以及 $\sum\lambda_iy_i=0$）。`,
    ],
    fx: [
      {
        title: 'SVM dual 目标', tex: T`\max_{\boldsymbol\lambda}\ \htmlClass{fx-p1}{\sum_i\lambda_i}-\frac12\sum_{i,j}\lambda_i\lambda_j\htmlClass{fx-p2}{y_iy_j}\,\htmlClass{fx-p3}{\bx_i'\bx_j}\quad\text{s.t.}\ \htmlClass{fx-p4}{\lambda_i\ge0},\ \htmlClass{fx-p5}{\sum_i\lambda_iy_i=0}`,
        parts: [
          { label: 'Σλ', note: '线性项：鼓励乘子变大。' },
          { label: 'y_i y_j', note: '同类点的乘积为 +1，异类为 −1。' },
          { label: "x_i'x_j", note: '**数据只出现在点积里**——换成 $K(\\bx_i,\\bx_j)$ 就是 kernel SVM（c29）。' },
          { label: 'λ ≥ 0', note: 'dual feasibility；soft margin 时变成 $0\\le\\lambda_i\\le C$。' },
          { label: 'Σλy = 0', note: '来自对 $b$ 的 stationarity。' },
        ],
      },
    ],
    example: [
      { t: 'h3', text: '两个点的 dual，完整手算' },
      T`一维：$x_1=1$（$y_1=-1$），$x_2=3$（$y_2=+1$）。`,
      { t: 'steps', items: [
        T`约束 $\sum\lambda_iy_i=0$：$-\lambda_1+\lambda_2=0$ ⇒ $\lambda_1=\lambda_2=\lambda$。`,
        T`$\lambda_1=\lambda_2=\lambda$ 时双重求和只有四项，每项是 $\lambda^2\cdot y_iy_j\cdot x_ix_j$：$(i,j)=(1,1)$：$y_1^2x_1^2=1\cdot1=1$；$(2,2)$：$1\cdot9=9$；两个交叉项 $(1,2)$、$(2,1)$ 都是 $y_1y_2x_1x_2=(-1)(+1)\cdot1\cdot3=-3$。合计 $\lambda^2(1-3-3+9)=4\lambda^2$。`,
        T`目标 $2\lambda-\frac12\cdot4\lambda^2=2\lambda-2\lambda^2$，求导 $2-4\lambda=0$ ⇒ $\lambda=0.5$。`,
        T`$w^*=\sum\lambda_iy_ix_i=0.5(-1+3)=1$；支持向量 $x_2$：$1\cdot(3w+b)=1$ ⇒ $b=-2$。和 c26 的 canonical 解一致 ✓。`,
      ] },
      { t: 'fade', title: '分步练习：两点 dual', plan: [T`由 $\sum\lambda_iy_i=0$ 得 $\lambda_1=\lambda_2=\lambda$`, T`目标化为 $2\lambda-\frac12\lambda^2(x_2-x_1)^2$`, T`求导得 $\lambda$`, T`$w=\sum\lambda_iy_ix_i$，由支持向量求 $b$`], items: [
        { md: T`$x_1=1\ (-1)$，$x_2=3\ (+1)$。`, steps: [
          { md: T`$\lambda_1=\lambda_2=\lambda$` }, { md: T`$2\lambda-2\lambda^2$` }, { md: T`$\lambda=0.5$` }, { md: T`$w=1$，$b=-2$` },
        ] },
        { md: T`$x_1=0\ (-1)$，$x_2=4\ (+1)$。目标 $2\lambda-8\lambda^2$。`, steps: [
          { ask: T`$\lambda=?$`, answer: 0.125, show: T`$2-16\lambda=0$ ⇒ $1/8$` },
          { ask: T`$w=?$`, answer: 0.5, show: T`$\frac18(0+4)=0.5$` },
          { ask: T`$b=?$`, answer: -1, show: T`$4w+b=1$ ⇒ $b=-1$` },
        ] },
        { md: T`$x_1=-1\ (-1)$，$x_2=1\ (+1)$。`, steps: [
          { ask: T`$(x_2-x_1)^2=?$`, answer: 4, show: '4' },
          { ask: T`$\lambda=?$`, answer: 0.5, show: T`$2\lambda-2\lambda^2$ ⇒ 0.5` },
          { ask: T`$w=?$`, answer: 1, show: T`$0.5(1+1)=1$` },
          { ask: T`$b=?$`, answer: 0, show: T`$1\cdot1+b=1$ ⇒ 0` },
        ] },
      ] },
    ],
    viz: [
      { id: 'margin-svm', how: '最大 margin 的边界只由几个支持向量决定——它们就是 dual 中 $\\lambda_i>0$ 的点。',
        try: '点 max-margin，记下支持向量；想象删掉其他任何一个点，解不变（互补松弛：那些点的 $\\lambda_i=0$）。' },
    ],
    compare: [
      { t: 'table', head: ['', 'Primal', 'Dual'], rows: [
        ['变量', '$\\bw,b$（$d+1$ 个）', '$\\lambda_1..\\lambda_n$（$n$ 个）'],
        ['数据怎么出现', '$\\bx_i$ 本身', '只通过点积 $\\bx_i\'\\bx_j$'],
        ['复杂度（课件）', '$O(d^3)$', '$O(n^3)$'],
        ['2021 Q3 的要点', '若 kernel 的特征空间是有限维（如二次核 $O(m^2)$ 维）且样本数 $n$ 远大于这个维数，在展开的特征空间里解 primal 更划算', '维数很高 / 无限（RBF）时只能用 dual'],
        ['适合', '样本多、维度低', '维度高 / 用 kernel'],
        ['稀疏性', '—', '只有支持向量 $\\lambda_i>0$'],
      ] },
      { t: 'exam', md: T`**Why solve the SVM dual?** The dual $\max_{\boldsymbol\lambda}\sum_i\lambda_i-\frac12\sum_{i,j}\lambda_i\lambda_jy_iy_j\mathbf x_i'\mathbf x_j$ s.t. $\lambda_i\ge0$ (soft margin: $0\le\lambda_i\le C$), $\sum_i\lambda_iy_i=0$ depends on the data only through dot products, so they can be replaced by a kernel; its size depends on the number of examples rather than the feature dimension; and the solution is sparse — only support vectors have $\lambda_i>0$, with $\mathbf w^*=\sum_i\lambda_iy_i\mathbf x_i$.` },
    ],
    pitfalls: [
      ['所有训练点都影响 SVM 解', '只有 $\\lambda_i>0$ 的支持向量。'],
      ['不等式乘子可以是负数', '$\\lambda_i\\ge0$；等式约束的 $\\nu_j$ 才可正可负。'],
      ['soft margin 的 dual 目标不同', '目标相同，只多了上界 $\\lambda_i\\le C$。'],
      ['dual 总比 primal 快', '取决于 $n$ 和 $d$；样本多时 primal 可能更好（讲者）。'],
    ],
    quiz: [
      { type: 'mc', q: 'KKT 中的 complementary slackness 是：', options: ['$\\lambda_i\\ge0$', '$g_i(\\bx^*)\\le0$', '$\\lambda_i^*g_i(\\bx^*)=0$', '$\\nabla\\mathcal L=0$'], answer: 2, explain: T`Complementary slackness（互补松弛）说**乘子和约束值的乘积为 0**：$\lambda_i^*g_i(\bx^*)=0$。所以两者至少有一个是 0：约束不紧（$g_i<0$）时乘子必须为 0；乘子大于 0 时约束必须是紧的（$g_i=0$）。放到 SVM 里：只有压在 margin 线上的支持向量才可能有 $\lambda_i>0$。其余选项是 KKT 的另外三条：$\lambda_i\ge0$ 是 dual feasibility（对偶可行），$g_i(\bx^*)\le0$ 是 primal feasibility（原可行），$\nabla\mathcal L=0$ 是 stationarity（驻点）。L09 p7。` },
      { type: 'num', q: '某 SVM dual 解 $\\lambda=(0,0.5,0,0.5)$，$y=(+1,+1,-1,-1)$，$\\bx_2=(2,1)$，$\\bx_4=(0,1)$。$w_1^*=?$', answer: 1, explain: '$\\bw=\\sum_i\\lambda_iy_i\\bx_i$，只有 $\\lambda_2,\\lambda_4$ 非零。第 2 点标签 $+1$：贡献 $0.5\\times(+1)\\times(2,1)=(1,0.5)$；第 4 点标签 $-1$：贡献 $0.5\\times(-1)\\times(0,1)=(0,-0.5)$。相加 $(1,0)$，所以 $w_1^*=1$。' },
      { type: 'mc', q: 'Soft-margin SVM dual 的约束是：', options: ['$\\lambda_i\\ge0$', '$0\\le\\lambda_i\\le C$，$\\sum\\lambda_iy_i=0$', '$\\lambda_i\\le C$ 仅此', '$\\lambda_i=C$'], answer: 1, explain: T`soft-margin SVM 的 dual 目标和 hard margin 完全一样，变的只有约束：$\lambda_i\ge0$ 多了一个上界，变成 **box constraints（盒约束）$0\le\lambda_i\le C$**；$\sum_i\lambda_iy_i=0$ 仍然保留，因为它来自对 $b$ 求导，soft margin 里 $b$ 还在。上界 $C$ 就是目标里罚 slack 的那个系数 $C$：一个点的乘子不能超过违规的"单价"。只写"$\lambda_i\ge0$"是 hard margin 的约束；"仅 $\lambda_i\le C$"漏了 $\lambda_i\ge0$ 和 $\sum\lambda_iy_i=0$。L09 p12。` },
      { type: 'show', q: '（英文）How are support vectors identified from the dual solution?', answer: T`They are the training points with $\lambda_i^*>0$. By complementary slackness $\lambda_i^*(1-y_i(\mathbf w^{*\prime}\mathbf x_i+b^*))=0$, so (hard margin) $\lambda_i^*>0$ forces $y_i(\mathbf w^{*\prime}\mathbf x_i+b^*)=1$: functional margin 1, i.e. the point lies on the margin at Euclidean distance $1/\|\mathbf w^*\|$. Points with $\lambda_i^*=0$ do not affect $\mathbf w^*=\sum_i\lambda_i^*y_i\mathbf x_i$. (Soft margin: support vectors with $\lambda_i=C$ may lie inside the margin or be misclassified, $\xi_i>0$.)`, qzh: '如何从对偶问题的解（dual solution）中识别支持向量（support vectors）？', azh: T`支持向量是 $\lambda_i^*>0$ 的训练点。由互补松弛条件（complementary slackness）$\lambda_i^*(1-y_i(\mathbf w^{*\prime}\mathbf x_i+b^*))=0$，（硬间隔时）$\lambda_i^*>0$ 必然推出 $y_i(\mathbf w^{*\prime}\mathbf x_i+b^*)=1$：函数间隔（functional margin）为 1，即该点位于间隔边界上，欧氏距离为 $1/\|\mathbf w^*\|$。$\lambda_i^*=0$ 的点不影响 $\mathbf w^*=\sum_i\lambda_i^*y_i\mathbf x_i$。（软间隔时：$\lambda_i=C$ 的支持向量可能位于间隔内部或被错分，此时 $\xi_i>0$。）` },
    ],
  });

  /* =====================================================================
   * c29 · Kernel trick、多项式核、RBF（L09 p15–p26）
   * ===================================================================== */
  add({
    id: 'c29', week: 'W5', lec: 'L09', pages: 'L09 p15–p26, p32, p34', star: 3,
    title: 'Kernel trick、多项式核、RBF', en: 'The kernel trick, polynomial and RBF kernels',
    summary: '**Kernel（核函数）** $K(\\bu,\\bv)=\\varphi(\\bu)\'\\varphi(\\bv)$：特征空间里的点积，但不用算 $\\varphi$ 就能直接得到。dual SVM 只用点积，所以把 $\\bx_i\'\\bx_j$ 换成 $K(\\bx_i,\\bx_j)$ 就等于在高维（甚至无限维）空间训练线性 SVM——这就是 **kernel trick**。',
    prereq: ['c12', 'c28'],
    symbols: [
      [T`$\varphi:\mathbb R^m\to\mathbb R^l$`, T`特征映射，$l$ 可以远大于 $m$ 甚至无穷`],
      [T`$K(\bu,\bv)$`, T`kernel：两个输入的"相似度"，等于特征空间点积`],
      [T`$c,\ d$`, T`多项式核的常数和次数`],
      [T`$\gamma$`, T`RBF 的宽度参数（越大，钟形越窄）。注意第 32 章的 $\gamma$ 是 margin，不是一回事`],
      [T`$m,\ l$`, T`原始输入维数、特征空间维数`],
      [T`$k_{ij}$`, T`kernel 矩阵（Gram matrix）的元素 $K(\bx_i,\bx_j)$`],
    ],
    goals: [
      '定义 kernel，解释 kernel trick 为什么是"精确的捷径"而不是近似',
      '展开 $(\\bu\'\\bv)^2$ 写出 $\\varphi$（含 $\\sqrt2$），并数值验证',
      '写出 kernel SVM 的训练和预测公式',
      '写出多项式核 $(\\bu\'\\bv+c)^d$ 和 RBF $\\exp(-\\gamma\\|\\bu-\\bv\\|^2)$，说出 RBF 对应无限维',
    ],
    types: ['T08'],
    what: [
      T`**动机**（L09 p16–p18）：中间一团蓝点、外面一圈红点——直线分不开。加一个特征 $x_3=x_1^2+x_2^2$（到原点距离的平方），在 3D 里就能用平面分开（L09 p17）。这就是 c12 的 basis expansion。问题：$\varphi$ 维度很高时，对每个训练点和新点都算 $\varphi$ 太贵，无限维时根本算不了。`,
      { t: 'fig', src: 'reference/pages/L09/p17.jpg', caption: 'L09 p17：加 $x_3=x_1^2+x_2^2$ 后线性可分', w: 520 },
      { t: 'video', id: 'kernel-lift' },
      T`**观察**：dual SVM 的训练和预测**只需要点积**（c28）。在特征空间里就是 $\varphi(\bx_i)'\varphi(\bx_j)$。`,
      T`**先看一个便宜公式恰好等于特征空间点积的例子**（L09 p32）。二维里 $(\bu'\bv)^2=(u_1v_1+u_2v_2)^2=u_1^2v_1^2+2u_1u_2v_1v_2+u_2^2v_2^2$。把中间项拆成 $(\sqrt2\,u_1u_2)(\sqrt2\,v_1v_2)$，它就等于 $\varphi(\bu)'\varphi(\bv)$，其中 $\varphi(\bx)=(x_1^2,\ \sqrt2\,x_1x_2,\ x_2^2)$。数值核对：$\bu=(1,2)$，$\bv=(3,1)$：左边 $(3+2)^2=25$；右边 $\varphi(\bu)=(1,\ 2\sqrt2,\ 4)$，$\varphi(\bv)=(9,\ 3\sqrt2,\ 1)$，点积 $9+12+4=25$ ✓。左边只要一次点积再平方，右边要先升到三维再点积，结果一模一样。`,
      T`**Kernel**（L09 p21）：能写成特征空间点积的函数 $K(\bu,\bv)=\varphi(\bu)'\varphi(\bv)$。**Kernel trick**（p22–p23）：直接算 $K$（便宜），代替"先算两个 $\varphi$ 再点积"（贵）。结果**完全一样**，不是近似。`,
      { t: 'math', tex: T`\textbf{Kernel SVM:}\ \max_{\boldsymbol\lambda}\sum_i\lambda_i-\frac12\sum_{i,j}\lambda_i\lambda_jy_iy_j\,K(\bx_i,\bx_j)\ \ \text{s.t.}\ 0\le\lambda_i\ (\le C),\ \sum_i\lambda_iy_i=0;\qquad s=b^*+\sum_i\lambda_i^*y_i\,K(\bx_i,\bx)` },
      T`**常用 kernel**（L09 p32、p34）：`,
      { t: 'ul', items: [
        T`**Polynomial kernel（多项式核）**：$K(\bu,\bv)=(\bu'\bv+c)^d$，整数 $d\ge0$，$c\ge0$。`,
        T`多项式核要事先选定"加哪些乘积项"。不知道该加什么时，可以用一个**只看两点距离**的核：两点越近值越接近 1，越远越接近 0。它对应的特征有无穷多个，写不出 $\varphi$，但 dual 只需要 $K$，照样能训练（为什么合法见 c30）：`,
        T`**RBF / Gaussian kernel（径向基 / 高斯核）**：$K(\bu,\bv)=\exp(-\gamma\|\bu-\bv\|^2)$，$\gamma>0$。对应的特征空间是**无限维**。`,
      ] },
    ],
    why: [
      T`这是 SVM 最强大的地方，也是 T8 题型的来源：2021 Q15（证明 kernel 合法）、2025 practice Q2（为 XOR 写显式特征映射）、2021 Q3（二次核 SVM 什么时候解 primal 比 dual 好）。L09 p28–p30 还说 kernel 是"模块化"的——学习算法（SVM、ridge、PCA……）和特征映射（kernel）可以分开选。`,
    ],
    intuition: [
      T`**Kernel = 相似度。** $K(\bu,\bv)=\varphi(\bu)'\varphi(\bv)$ 是特征空间里的点积：$K$ 大说明两者在特征空间里"对齐的部分"多（注意点积也受长度影响，不只是夹角）。RBF 最直观：两点越近 $K\to1$，越远 $K\to0$。kernel SVM 的预测 $s=b+\sum\lambda_iy_iK(\bx_i,\bx)$ 就是"看新点和每个支持向量有多像，按类别加权投票"。`,
      T`**算账**（L09 p22）：一维 $\varphi(x)=[x^2,\sqrt{2c}\,x,c]$。显式算（乘法、加法各算一次运算）：$\varphi(u)$ 2 次（算 $u^2$、算 $\sqrt{2c}\,u$）、$\varphi(v)$ 2 次、三维点积 5 次（3 乘 2 加），共 9 次；直接算 $(uv+c)^2$ 只要 3 次（乘、加、平方）。高维时差距是 $O(m)$ vs $O(l)$，$l\gg m$。`,
      { t: 'think', q: 'RBF kernel 的特征空间是无限维的，那 SVM 还能训练吗？要存无限维的 $\\bw$ 吗？', a: T`能训练，也不用存 $\bw$。dual 只需要 $n\times n$ 的 kernel 矩阵 $K(\bx_i,\bx_j)$，预测只需要 $K(\bx_i,\bx)$ 和支持向量的 $\lambda_i$。$\bw=\sum\lambda_iy_i\varphi(\bx_i)$ 从来不显式算出来。` },
      { t: 'story', title: 'kernel trick 的来历', md: '把点积换成 kernel 的想法最早见于 Aizerman、Braverman 和 Rozonoer 1964 年的"势函数"方法。1992 年 Boser、Guyon 和 Vapnik 把它用到最大 margin 分类器上，才有了今天的 kernel SVM。' },
    ],
    math: [
      { t: 'h3', text: '展开 $(\\bu\'\\bv)^2$（L09 p32，$m=2$，$c=0$）' },
      { t: 'math', tex: T`\begin{aligned}(\bu'\bv)^2&=(u_1v_1+u_2v_2)^2=u_1^2v_1^2+2u_1v_1u_2v_2+u_2^2v_2^2\\&=\big[u_1^2,\ \sqrt2\,u_1u_2,\ u_2^2\big]\cdot\big[v_1^2,\ \sqrt2\,v_1v_2,\ v_2^2\big]=\varphi(\bu)'\varphi(\bv)\end{aligned}` },
      T`**$\sqrt2$ 从哪来？** 交叉项 $2u_1u_2v_1v_2$ 要拆成"$\bu$ 的部分 × $\bv$ 的部分"：$(\sqrt2u_1u_2)(\sqrt2v_1v_2)$。`,
      T`$c\ne0$ 时：给每个向量加一个常数特征 $\sqrt c$，就回到 $c=0$ 的情形（L09 p32）。例如 $(\bu'\bv+1)^2$ 对应 $\varphi(\bx)=[x_1^2,\ x_2^2,\ \sqrt2x_1x_2,\ \sqrt2x_1,\ \sqrt2x_2,\ 1]$。`,
      { t: 'h3', text: 'RBF 为什么是合法 kernel、而且无限维（L09 p34）' },
      { t: 'math', tex: T`\exp(-\gamma\|\bu-\bv\|^2)=\underbrace{e^{-\gamma\bu'\bu}}_{f(\bu)}\ \exp(2\gamma\bu'\bv)\ \underbrace{e^{-\gamma\bv'\bv}}_{f(\bv)}=f(\bu)\Big(1+2\gamma\bu'\bv+\frac{(2\gamma\bu'\bv)^2}{2!}+\cdots\Big)f(\bv)` },
      T`括号里是无穷多个多项式核之和（泰勒展开 $e^z=\sum z^d/d!$），每一项都是 kernel；再用 c30 的组合规则（和、正数倍、$f(\bu)K f(\bv)$）⇒ RBF 是合法 kernel，对应的特征空间无限维。`,
    ],
    fx: [
      {
        title: 'Kernel 的定义', tex: T`K(\bu,\bv)=\htmlClass{fx-p1}{\varphi(\bu)}'\,\htmlClass{fx-p2}{\varphi(\bv)}=\htmlClass{fx-p3}{\sum_{i=1}^l\varphi_i(\bu)\varphi_i(\bv)}`,
        parts: [
          { label: 'φ(u)', note: '把 $\\bu$ 映射到 $l$ 维特征空间。' },
          { label: 'φ(v)', note: '同一个映射作用在 $\\bv$ 上。' },
          { label: '点积', note: '$l$ 项求和。kernel 用一个便宜的公式直接给出这个和，代价 $O(m)$ 而不是 $O(l)$。' },
        ],
      },
    ],
    example: [
      { t: 'h3', text: '验证 kernel = 特征点积' },
      T`$\bu=(1,2)$，$\bv=(3,1)$，$K=(\bu'\bv)^2$：`,
      { t: 'steps', items: [
        T`直接：$\bu'\bv=3+2=5$，$K=25$。`,
        T`显式：$\varphi(\bu)=[u_1^2,\sqrt2u_1u_2,u_2^2]=[1,\ \sqrt2\cdot1\cdot2,\ 4]=[1,\ 2\sqrt2,\ 4]$，$\varphi(\bv)=[9,\ 3\sqrt2,\ 1]$，点积 $=9+2\sqrt2\cdot3\sqrt2+4=9+12+4=25$ ✓。`,
        T`$c=1$ 时 $K=(5+1)^2=36$。`,
      ] },
      T`RBF：$\gamma=0.5$，$\bu=(0,0)$，$\bv=(1,1)$：$\|\bu-\bv\|^2=2$，$K=e^{-1}\approx0.368$；$\bv=\bu$ 时 $K=1$。`,
      { t: 'fade', title: '分步练习：验证多项式核', plan: [T`算 $\varphi(\bu)=[u_1^2,\sqrt2u_1u_2,u_2^2]$`, T`算 $\varphi(\bv)$`, '两者点积', T`直接算 $(\bu'\bv)^2$ 对照`], items: [
        { md: T`$\bu=(1,2)$，$\bv=(3,1)$。`, steps: [
          { md: T`$[1,2\sqrt2,4]$` }, { md: T`$[9,3\sqrt2,1]$` }, { md: '$9+12+4=25$' }, { md: '$5^2=25$ ✓' },
        ] },
        { md: T`$\bu=(2,0)$，$\bv=(1,1)$。$\varphi(\bu)=[4,0,0]$，$\varphi(\bv)=[1,\sqrt2,1]$。`, steps: [
          { ask: '点积 = ?', answer: 4, show: '$4+0+0=4$' },
          { ask: T`$(\bu'\bv)^2=?$`, answer: 4, show: '$2^2=4$ ✓' },
        ] },
        { md: T`$\bu=(1,1)$，$\bv=(2,-1)$。`, steps: [
          { ask: T`$\varphi(\bv)$ 的中间分量 $\sqrt2v_1v_2=?$`, answer: -2.828, tol: 0.003, show: T`$\sqrt2\cdot(-2)\approx-2.828$` },
          { ask: '点积 = ?', answer: 1, show: T`$\varphi(\bu)=[1,\sqrt2,1]$，$4+\sqrt2(-2\sqrt2)+1=4-4+1=1$` },
          { ask: T`$(\bu'\bv)^2=?$`, answer: 1, show: '$1^2=1$ ✓' },
        ] },
      ] },
    ],
    viz: [
      { id: 'kernel-map', how: '输入两个二维向量和多项式核的 $c$、$d$。左边显式算 $\\varphi(\\bx)$、$\\varphi(\\bz)$ 再点积，右边直接算 $K$——结果相同，下方比较两种做法的乘法次数。',
        try: '① $d=2,c=0$ 输入上面例题，确认 25。② 换成 $c=1$：特征从 3 维变成 6 维，显式算的乘法数明显增加，kernel 只多一次加法。' },
      { id: 'xor-basis', how: '第 12 章的 XOR：换特征后线性可分。kernel 做的是同一件事，只是不显式写出特征。',
        try: '思考：$(\\bu\'\\bv+1)^2$ 的特征里有 $\\sqrt2x_1$、$\\sqrt2x_2$、$\\sqrt2x_1x_2$。而 XOR（A 类 $(0,0),(1,1)$；B 类 $(0,1),(1,0)$）恰好是 $x_1+x_2-2x_1x_2$：A 类得 0（如 $(1,1)$：$1+1-2=0$），B 类得 1（如 $(1,0)$：$1+0-0=1$）——这是这些特征的**线性**组合，所以在这个特征空间里 XOR 线性可分。' },
    ],
    compare: [
      { t: 'table', head: ['', '显式 basis expansion', 'Kernel trick'], rows: [
        ['算什么', '每个点的 $\\varphi(\\bx)$，再点积', '直接 $K(\\bu,\\bv)$'],
        ['代价', '$O(l)$', '通常 $O(m)$'],
        ['无限维', '不可能', '可以（RBF）'],
        ['结果', '—', '与显式完全相同'],
      ] },
      { t: 'table', head: ['', 'Kernel SVM', '神经网络（L09 p25）'], rows: [
        ['$\\varphi$', '由 kernel 决定，不学习', '隐藏层权重**学**出来'],
        ['优化', '凸（QP，quadratic programming，二次规划）', '非凸'],
        ['数据类型', '任意（只要能定义 kernel，如字符串）', '通常向量'],
      ] },
      { t: 'exam', md: T`**Kernel trick:** A kernel is a function $K(\mathbf u,\mathbf v)=\varphi(\mathbf u)'\varphi(\mathbf v)$ equal to a dot product in some feature space. Because the SVM dual objective and prediction $s=b+\sum_i\lambda_iy_i\mathbf x_i'\mathbf x$ use the data only through dot products, we can replace them by $K(\mathbf x_i,\mathbf x_j)$, effectively training a linear classifier in a high- (even infinite-) dimensional feature space without ever computing $\varphi$. This is exact, not an approximation, and is much cheaper when the feature space is large.` },
    ],
    pitfalls: [
      ['kernel trick 是近似', '是精确的捷径（讲者强调）。'],
      ['展开 $(\\bu\'\\bv)^2$ 时漏掉 $\\sqrt2$', '交叉项系数 2 要拆成 $\\sqrt2\\cdot\\sqrt2$。'],
      ['RBF 的 $\\gamma$ 越大越平滑', '$\\gamma$ 越大钟形越**窄**，模型越"局部"、越容易过拟合。'],
      ['kernel SVM 要存 $\\bw$', '只存支持向量和 $\\lambda_i$；无限维时 $\\bw$ 算不出来也不需要。'],
    ],
    quiz: [
      { type: 'num', q: '$\\bu=(1,0)$，$\\bv=(2,3)$，$K=(\\bu\'\\bv+1)^2$。$K=?$', answer: 9, explain: T`多项式核 $(\bu'\bv+1)^2$ 的算法：先算点积，再加 1，最后平方。点积 $\bu'\bv=1\times2+0\times3=2$；加 1 得 $3$；平方得 $3^2=9$。这个 9 等于 6 维特征空间里 $\varphi(\bu)'\varphi(\bv)$ 的值，但不用写出 $\varphi$，这就是 kernel trick。**顺序别弄反**：先平方再加 1 会得到 $2^2+1=5$。`, qzh: T`已知 $\bu=(1,0)$，$\bv=(2,3)$，核函数（kernel）$K=(\bu'\bv+1)^2$，求 $K$。` },
      { type: 'num', q: 'RBF，$\\gamma=1$，$\\|\\bu-\\bv\\|^2=\\ln 4$（≈1.386）。$K=?$', answer: 0.25, explain: T`RBF kernel（径向基核）是 $K=\exp(-\gamma\|\bu-\bv\|^2)$。题目直接给了距离的平方 $\|\bu-\bv\|^2=\ln4$（不用再平方），$\gamma=1$，所以指数是 $-1\times\ln4=-\ln4$。用 $e^{\ln a}=a$：$e^{-\ln4}=\frac{1}{e^{\ln4}}=\frac14=0.25$。RBF 的值总在 $(0,1]$ 里：两点重合时为 1，越远越接近 0。**别漏掉指数里的负号**，漏了会得到 4，超出了 RBF 的取值范围。`, qzh: T`RBF 核（RBF kernel），$\gamma=1$，$\|\bu-\bv\|^2=\ln 4$（≈1.386），求 $K$。` },
      { type: 'mc', q: '为什么 SVM 能用 kernel？', options: ['因为 primal 是凸的', '因为 dual 的训练和预测只用到数据的点积', '因为 hinge loss', '因为支持向量少'], answer: 1, explain: 'L09 p19–p24。' },
      { type: 'mc', q: 'RBF kernel 对应的特征空间维度是：', options: ['2', '与输入相同', '$d+1$', '无限'], answer: 3, explain: 'L09 p34 的泰勒展开。' },
      { type: 'show', q: '（英文）Give the feature map for $K(\\mathbf u,\\mathbf v)=(\\mathbf u\'\\mathbf v)^2$ in 2D.', answer: T`$(\mathbf u'\mathbf v)^2=u_1^2v_1^2+2u_1u_2v_1v_2+u_2^2v_2^2=\varphi(\mathbf u)'\varphi(\mathbf v)$ with $\varphi(\mathbf x)=[x_1^2,\ \sqrt2\,x_1x_2,\ x_2^2]'$.`, qzh: T`写出二维情形下核函数 $K(\mathbf u,\mathbf v)=(\mathbf u'\mathbf v)^2$ 对应的特征映射（feature map）。`, azh: T`$(\mathbf u'\mathbf v)^2=u_1^2v_1^2+2u_1u_2v_1v_2+u_2^2v_2^2=\varphi(\mathbf u)'\varphi(\mathbf v)$，其中 $\varphi(\mathbf x)=[x_1^2,\ \sqrt2\,x_1x_2,\ x_2^2]'$。` },
    ],
  });

  /* =====================================================================
   * c30 · 合法 kernel、Mercer、representer（L09 p27–p38）
   * ===================================================================== */
  add({
    id: 'c30', week: 'W5', lec: 'L09', pages: 'L09 p27–p38', star: 3,
    title: '合法 kernel、Mercer、representer', en: 'Valid kernels, Mercer\'s theorem, representer theorem',
    summary: '不是任何"相似度"都能当 kernel——必须对应某个特征空间的点积。两种证明方法：① **构造**特征映射 / 用组合规则（和、积、正数倍、$f(\\bu)Kf(\\bv)$）；② **Mercer**：任意有限点集的 Gram 矩阵都 PSD。往年 2021 Q15 就是"证明 $k_1+k_2$ 合法"。',
    prereq: ['c04', 'c29'],
    symbols: [
      [T`$M_{ij}=K(\bx_i,\bx_j)$`, T`Gram 矩阵（kernel 矩阵）`],
      [T`PSD`, T`半正定：$\mathbf c'M\mathbf c\ge0\ \forall\mathbf c$（c04）`],
      [T`$f(\bu)$`, T`任意实值函数`],
      [T`$\alpha_i$`, T`representer 定理里的系数`],
      [T`$g(\|f\|)$`, T`对函数 $f$ 复杂度的单调递增惩罚`],
      [T`$\Phi$`, T`把 $n$ 个点的特征 $\varphi(\bx_i)'$ 排成行的矩阵；$M=\Phi\Phi'$`],
      [T`$\mathbf c$`, T`任意一个 $n$ 维向量（检验 PSD 用）`],
    ],
    goals: [
      '默写 L09 p33 的四条 kernel 组合规则',
      '用"构造特征映射"写出 2021 Q15 式的证明',
      '用 Mercer（Gram 矩阵 PSD）判断 / 否定一个 kernel；会找反例',
      '说出 representer theorem 的意思：哪些方法能 kernel 化',
    ],
    types: ['T08'],
    notExam: 'L09 p36–p37 的字符串 kernel、kernel 目录只是展示 kernel 能用于任意数据类型，不考细节。讲者说多项式核的一般展开（黑字部分）不要求完整推导，懂 2 次的例子即可。',
    what: [
      { t: 'h3', text: '① 问题：什么样的函数才能当 kernel？（L09 p27–p28）' },
      T`c29 的 kernel trick 说：只要 $K(\bu,\bv)$ 等于某个特征空间里的点积 $\varphi(\bu)'\varphi(\bv)$，就能代替点积用。但随手写一个"相似度"函数，它不一定对应任何特征空间——这样的函数代进 SVM 会出问题。这一章回答：**怎么判断一个函数是不是合法的 kernel，怎么造新的 kernel**。`,
      T`**Modular learning（模块化学习）**（L09 p28）：选学习算法和选 kernel 是两件独立的事。换 kernel 就换了特征空间，算法不用改。`,
      { t: 'h3', text: '② 用已知的 kernel 拼出新的：组合规则（L09 p33）' },
      T`不必每次都从零写出 $\varphi$。已经合法的 kernel 做加法、乘法、乘一个正数，或者两边各乘同一个函数值 $f(\bu)f(\bv)$，结果仍是某个特征空间的点积。例如加法：把两边的特征**拼在一起**，新特征的点积就是两个点积之和——2021 Q15 就是这样证明 $k_1+k_2$ 合法的。减法、乘负数不行（对角 $K(\bx,\bx)$ 可能变成负数，而它应该是 $\|\varphi(\bx)\|^2\ge0$）。`,
      T`**Kernel 组合规则**（L09 p33）：若 $K_1,K_2$ 是 kernel，$c>0$，$f$ 是任意实值函数，则下面都是 kernel：`,
      { t: 'math', tex: T`K_1+K_2,\qquad K_1K_2,\qquad cK_1,\qquad f(\bu)\,K_1(\bu,\bv)\,f(\bv)` },
      { t: 'h3', text: '③ 一般的判别法：Mercer 定理（L09 p35）' },
      T`组合规则只能从"已知合法"的 kernel 出发。遇到一个陌生的函数，要一个通用的检验办法：`,
      T`**Mercer's theorem（Mercer 定理）**（L09 p35）：对任意有限点列 $\bx_1,\dots,\bx_n$，构造 $M_{ij}=K(\bx_i,\bx_j)$。若对**所有可能的**点列 $M$ 都是 PSD，则 $K$ 是合法 kernel。`,
      T`**为什么要 PSD？** 把 $n$ 个点的特征 $\varphi(\bx_i)'$ 排成矩阵 $\Phi$ 的行，Gram 矩阵就是 $M=\Phi\Phi'$（第 $(i,j)$ 元正是 $\varphi(\bx_i)'\varphi(\bx_j)$）。对任意向量 $\mathbf c$：$\mathbf c'M\mathbf c=\mathbf c'\Phi\Phi'\mathbf c=(\Phi'\mathbf c)'(\Phi'\mathbf c)=\|\Phi'\mathbf c\|^2\ge0$——和 c04 证 $\mathbf X'\mathbf X$ PSD 一模一样。反过来，Mercer 说 PSD 就够了。`,
      T`**两个快速必要条件**：① 对称 $K(\bu,\bv)=K(\bv,\bu)$；② 对角非负 $K(\bx,\bx)=\|\varphi(\bx)\|^2\ge0$。任何一个不满足，立刻不是 kernel。但两条都满足**不能**说明合法（还要 PSD）——它们只能用来**否定**。2×2 的 Gram 矩阵判 PSD：对称、两个对角元 $\ge0$、行列式 $\ge0$。`,
      { t: 'h3', text: '④ 另一个问题：哪些方法能用 kernel？representer theorem（L09 p29–p30）' },
      T`前三节回答"什么函数能当 kernel"。还有一个反方向的问题：SVM 能把点积换成 kernel，别的方法（ridge、logistic regression……）也能吗？`,
      T`**Representer theorem（表示定理）**（L09 p29）：形如"经验风险 + $g(\|f\|)$（单调递增）"的最小化问题（$f$ 在核 $K$ 对应的函数空间 RKHS（reproducing kernel Hilbert space，再生核希尔伯特空间）里找，$\|f\|$ 是这个空间的范数），最优解总能写成 $f^*(\bx)=\sum_{i=1}^n\alpha_iK(\bx,\bx_i)$。意义：这类方法都能 kernel 化——ridge regression、logistic regression、PCA（主成分分析，第 37 章）、CCA（典型相关分析）、LDA（线性判别分析）……（p30，后两个不用知道细节）。这里 $\|f\|$ 是**函数**的"大小"（复杂度），和向量范数是类比关系。`,
      T`**说人话**：不管用什么损失，学出来的预测函数都只是"**在每个训练点上放一个 kernel 小山包，再加权求和**"——你已经见过一次：c28 的 SVM 解 $\bw^*=\sum_i\lambda_iy_i\bx_i$，预测 $\sum_i\lambda_iy_i\,\bx_i'\bx$ 就是 $\alpha_i=\lambda_iy_i$、线性核的特例。所以只要一个方法的解能写成这种形式，就能把点积换成任意 kernel。`,
    ],
    why: [
      T`**T8 证明题**（2021 Q15，12 分）：给定两个合法 kernel，证明组合后的函数也合法。还有"判断某个函数是不是合法 kernel"这类判断题。方法固定，本章给模板。`,
    ],
    intuition: [
      { t: 'think', q: T`$K(x,z)=xz-1$ 是合法 kernel 吗？最快怎么判断？`, a: T`不是。取 $x=0$：$K(0,0)=-1<0$，但合法 kernel 必有 $K(x,x)=\|\varphi(x)\|^2\ge0$。一个 1×1 的 Gram 矩阵 $[-1]$ 就不是 PSD。` },
      { t: 'story', title: 'Mercer', md: 'James Mercer 在 1909 年证明了关于"正定积分核"的定理，原本是为了研究积分方程，和机器学习毫无关系。八十多年后它成了判断 SVM kernel 是否合法的标准工具。' },
    ],
    math: [
      { t: 'h3', text: '证明模板 A：构造特征映射（2021 Q15）' },
      T`**题**：$k_1(\mathbf a,\mathbf a')$、$k_2(\mathbf b,\mathbf b')$ 合法，证明 $k_3\big([\mathbf a;\mathbf b],[\mathbf a';\mathbf b']\big)=k_1(\mathbf a,\mathbf a')+k_2(\mathbf b,\mathbf b')$ 合法。`,
      { t: 'steps', items: [
        T`$k_1,k_2$ 合法 ⇒ 存在 $\varphi_1,\varphi_2$ 使 $k_1=\varphi_1(\mathbf a)'\varphi_1(\mathbf a')$，$k_2=\varphi_2(\mathbf b)'\varphi_2(\mathbf b')$。`,
        T`定义拼接映射 $\varphi_3([\mathbf a;\mathbf b])=[\varphi_1(\mathbf a);\varphi_2(\mathbf b)]$。`,
        T`$\varphi_3(\bx)'\varphi_3(\bx')=\varphi_1(\mathbf a)'\varphi_1(\mathbf a')+\varphi_2(\mathbf b)'\varphi_2(\mathbf b')=k_3$。`,
        T`$k_3$ 是某个特征空间的点积 ⇒ 合法。∎`,
      ] },
      { t: 'h3', text: '证明模板 B：组合规则' },
      T`例：证明 $K(\bu,\bv)=(\bu'\bv)^2+3\bu'\bv+2$ 合法。$\bu'\bv$ 是线性核（合法）；$(\bu'\bv)^2=(\bu'\bv)(\bu'\bv)$ 是积（合法）；$3\bu'\bv$ 是正数倍（合法）；常数 2 = $2\times K_0$，其中 $K_0(\bu,\bv)=1$ 是特征映射 $\varphi(\bx)=[1]$（只有一个恒为 1 的特征）对应的 kernel：$[1]\cdot[1]=1$，合法；三者相加（合法）。∎`,
      { t: 'h3', text: '否定一个 kernel：找反例（Mercer）' },
      T`只要找到**一组**点使 Gram 矩阵不 PSD，就证明不合法（反过来，证明合法要对**所有**点集成立，不能只验证一组——L09 p35–p36）。`,
    ],
    fx: [
      {
        title: 'Mercer 条件', tex: T`\forall\ \bx_1..\bx_n:\quad M=\big[\htmlClass{fx-p1}{K(\bx_i,\bx_j)}\big]_{i,j}\ \htmlClass{fx-p2}{\succeq0}`,
        parts: [
          { label: 'Gram 矩阵', note: '$n\\times n$，第 $(i,j)$ 元是第 $i$、$j$ 个点的 kernel 值。' },
          { label: 'PSD', note: '$\\mathbf c\'M\\mathbf c\\ge0$ 对所有 $\\mathbf c$；等价于特征值全 $\\ge0$。必须对**所有**有限点集成立。' },
        ],
      },
    ],
    example: [
      { t: 'h3', text: '反例：$K(x,z)=-(x-z)^2$' },
      T`取两个点 $x_1=0$、$x_2=1$。**Gram 矩阵**的第 $i$ 行第 $j$ 列放 $K(x_i,x_j)$：对角是 $K(0,0)=-(0-0)^2=0$、$K(1,1)=0$；非对角是 $K(0,1)=K(1,0)=-(0-1)^2=-1$。所以 $M=\begin{bmatrix}0&-1\\-1&0\end{bmatrix}$。`,
      T`PSD 要求对**任何**向量 $\mathbf c$ 都有 $\mathbf c'M\mathbf c\ge0$。取 $\mathbf c=(1,1)$：$\mathbf c'M\mathbf c=\sum_{i,j}c_ic_jM_{ij}=0+(-1)+(-1)+0=-2<0$ ⇒ 不 PSD ⇒ 不是合法 kernel。（也可以看特征值：$\pm1$，有负的。）`,
      { t: 'fade', title: '分步练习：判断 kernel 是否合法（Mercer 反例法）', plan: [T`写出 Gram 矩阵 $M_{ij}=K(x_i,x_j)$`, '检查对称、对角 ≥ 0', T`找 $\mathbf c$ 使 $\mathbf c'M\mathbf c<0$（或算 det / 特征值）`], items: [
        { md: T`$K(x,z)=-(x-z)^2$，点 $0,1$。`, steps: [
          { md: T`$M=\begin{bmatrix}0&-1\\-1&0\end{bmatrix}$` }, { md: '对称、对角 0（≥0），必要条件过了' }, { md: T`$\mathbf c=(1,1)$：$-2<0$ ⇒ 不合法` },
        ] },
        { md: T`$K(x,z)=xz-1$。`, steps: [
          { ask: T`取单点 $x=0$，$K(0,0)=?$`, answer: -1, show: '$-1<0$，对角为负 ⇒ 不合法' },
        ] },
        { md: T`$K(x,z)=(xz)^2+1$，点 $1,2$。`, steps: [
          { ask: T`$M_{12}=K(1,2)=?$`, answer: 5, show: '$4+1=5$' },
          { ask: T`$\det M=?$（$M_{11}=2$，$M_{22}=17$）`, answer: 9, show: T`$34-25=9>0$，且对角为正 ⇒ 这组点上 PSD（它确实合法：$(xz)^2$ 和常数 1 都是 kernel，和也是）` },
        ] },
      ] },
    ],
    viz: [
      { id: 'gram-psd', how: '输入几个一维点、选一个 kernel，工具画出 Gram 矩阵、算特征值、判定是否 PSD；不 PSD 时给出一个让 $\\mathbf v\'K\\mathbf v<0$ 的向量。',
        try: '① 线性、多项式、RBF：换任何点都 PSD。② 选 $-(x-z)^2$：两个点就失败。③ 选 $xz-1$：任意两个不同的点都失败，例如 $2,3$：$M=\\begin{bmatrix}3&5\\\\5&8\\end{bmatrix}$，$\\det=24-25=-1<0$（一般地 $\\det=-(x-z)^2$）；点集含 0 时更快（$K(0,0)=-1$）。' },
    ],
    compare: [
      { t: 'table', head: ['方法', '用来', '要点'], rows: [
        ['构造 $\\varphi$', '证明合法', '写出映射，验证点积等于 $K$（2021 Q15）'],
        ['组合规则', '证明合法', '从已知 kernel 出发：和、积、正数倍、$f(\\bu)Kf(\\bv)$'],
        ['Mercer：所有 Gram 矩阵 PSD', '证明 / 否定', '否定只需一个反例；证明需对所有点集'],
        ['快速必要条件', '否定', '对称、$K(\\bx,\\bx)\\ge0$'],
      ] },
      { t: 'exam', md: T`**Proof template (sum of kernels):** Since $k_1,k_2$ are valid kernels there exist feature maps with $k_1(\mathbf a,\mathbf a')=\varphi_1(\mathbf a)'\varphi_1(\mathbf a')$ and $k_2(\mathbf b,\mathbf b')=\varphi_2(\mathbf b)'\varphi_2(\mathbf b')$. Define, for $\mathbf x=[\mathbf a;\mathbf b]\in\mathbb R^{d_1+d_2}$, the concatenated feature map $\varphi_3(\mathbf x)=[\varphi_1(\mathbf a);\varphi_2(\mathbf b)]$. Then $\varphi_3(\mathbf x)'\varphi_3(\mathbf x')=k_1(\mathbf a,\mathbf a')+k_2(\mathbf b,\mathbf b')=k_3(\mathbf x,\mathbf x')$, so $k_3$ is a dot product in a feature space and hence a valid kernel.` },
    ],
    pitfalls: [
      ['在一组点上 Gram 矩阵 PSD ⇒ kernel 合法', '必须对**所有**有限点集成立（L09 p35）。'],
      ['$cK$ 对任何常数 $c$ 合法', '要求 $c>0$（负数会让对角变负）。'],
      ['$K_1-K_2$ 也合法', '差不一定合法（可能不 PSD）。'],
      ['任何相似度都能当 kernel', '必须隐含一个特征空间点积（L09 p36）。'],
    ],
    quiz: [
      { type: 'mc', q: '下面哪个**不一定**是合法 kernel（$K_1,K_2$ 合法）？', options: ['$K_1+K_2$', '$K_1K_2$', '$5K_1$', '$K_1-K_2$'], answer: 3, explain: T`L09 p33 的组合规则只保证四种操作得到合法 kernel：$K_1+K_2$、$K_1K_2$、$cK_1$（$c>0$）、$f(\bu)K_1(\bu,\bv)f(\bv)$。**减法不在其中，而且确实会出错**：取 $K_1=\bu'\bv$、$K_2=2\bu'\bv$（都合法），则 $K_1-K_2=-\bu'\bv$，对角 $K(\bx,\bx)=-\|\bx\|^2<0$，而合法 kernel 的对角必须是 $\|\varphi(\bx)\|^2\ge0$。$5K_1$ 容易被怀疑，但 $5>0$，属于正数倍规则，合法；乘积 $K_1K_2$ 也在规则里。` },
      { type: 'mc', q: '要证明 $K$ **不**合法，最少需要：', options: ['对所有点集检查', '一个让 Gram 矩阵不 PSD 的点集', '算出特征映射', '证明对称'], answer: 1, explain: T`Mercer 定理说：$K$ 合法 ⇔ 所有有限点集上的 Gram 矩阵都 PSD（半正定）。"对所有点集都成立"这种说法，**只要找到一个反例就被推翻**：给出一组点，使 Gram 矩阵 $M$ 有某个 $\mathbf c$ 让 $\mathbf c'M\mathbf c<0$（或对角出现负数），就证明 $K$ 不合法。例如 $K(x,z)=xz-1$，只取一个点 $x=0$：$K(0,0)=-1<0$。误选"对所有点集检查"：那是证明合法时才需要的。` },
      { type: 'num', q: '$K(x,z)=x^2z^2$，点 $1,-1$。Gram 矩阵的行列式？', answer: 0, explain: '$\\begin{bmatrix}1&1\\\\1&1\\end{bmatrix}$，det = 0（PSD，合法：$\\varphi(x)=x^2$）。' },
      { type: 'show', q: '（英文）State the representer theorem informally and why it matters.', answer: T`For a learning problem minimising empirical risk plus a monotonically increasing penalty on the norm of the function (optimising over the RKHS associated with $K$, using its RKHS norm), the optimal solution can be written as $f^*(\mathbf x)=\sum_{i=1}^n\alpha_iK(\mathbf x,\mathbf x_i)$. Hence such methods (e.g. ridge regression, logistic regression, PCA) can be kernelised: they only need kernel evaluations between data points.`, qzh: '非正式地陈述表示定理（representer theorem），并说明它为什么重要。', azh: T`对于"最小化经验风险（empirical risk）+ 关于函数范数的单调递增惩罚项"的学习问题（在与 $K$ 对应的 RKHS 上优化，并使用其 RKHS 范数），最优解可以写成 $f^*(\mathbf x)=\sum_{i=1}^n\alpha_iK(\mathbf x,\mathbf x_i)$。因此这类方法（例如岭回归（ridge regression）、逻辑回归（logistic regression）、PCA）都可以核化（kernelised）：它们只需要数据点之间的核函数值。` },
    ],
  });

  /* =====================================================================
   * c31 · Perceptron 模型与更新（L10 p2–p29, p33–p40）
   * ===================================================================== */
  add({
    id: 'c31', week: 'W5', lec: 'L10', pages: 'L10 p2–p29, p33–p40', star: 2,
    title: 'Perceptron 模型与更新', en: 'The perceptron: model, loss, training rule',
    summary: '**Perceptron（感知机）** 是最早的神经元模型，也是一个线性分类器：$s=\\bw\'\\bx$（含 bias），$s\\ge0$ 判 A。训练用 SGD（stochastic gradient descent，随机梯度下降，第 13 章：每次用一个样本的梯度更新）最小化 perceptron loss $\\max(0,-sy)$，得到极简的更新规则：**分错（$sy\\le0$）就 $\\bw\\leftarrow\\bw+\\eta y\\bx$，分对不动。**',
    prereq: ['c03', 'c13'],
    symbols: [
      [T`$x_0=1,\ w_0$`, T`bias 输入和 bias 权重（dummy feature，c10）`],
      [T`$s=\bw'\bx$`, T`得分（含 bias）`],
      [T`$y_i\in\{-1,+1\}$`, T`标签`],
      [T`$L_i(\bw)$`, T`第 $i$ 个样本的 perceptron loss`],
      [T`$\eta$`, T`学习率`],
      [T`$\bw^{(k)}$`, T`第 $k$ 次更新后的权重`],
    ],
    goals: [
      '画出 perceptron 结构（输入、权重、bias、求和、激活）',
      '写出 perceptron loss 和它的梯度，推出更新规则',
      '手算 L10 p33–p39 的更新过程',
      '说出 perceptron loss 和 hinge loss 的区别',
    ],
    types: ['T11'],
    what: [
      { t: 'h3', text: '① 从神经元到 perceptron（L10 p2–p7）' },
      T`W4–W5 的 SVM 要解一个带约束的优化，才能找到 margin 最大的那条线。这一章（L10）退回到一个更早、更简单的线性分类器：**不求最大 margin，一个点一个点地看，分错了就把边界往那个点推一下，分对就不动**。它找到的只是能分开数据的无数条线里的某一条；但规则极其简单，而且是 W6 神经网络的基本零件。`,
      T`L10 从"神经网络"讲起：生物神经元收到很多信号，加权求和，超过阈值就"放电"。最简单的人工版本就是 **perceptron（感知机）**：把输入加权求和、看正负，输出 $+1$ 或 $-1$——一个线性分类器。它的学习规则也很简单：一个样本一个样本地看，**分错了就把权重往正确的方向挪一点**。`,
      { t: 'h3', text: '② 人工神经网络与 perceptron 模型' },
      T`**ANN（artificial neural network，人工神经网络）**（L10 p5）：由处理单元组成的网络，每个单元输出"输入加权和的激活函数"。**Perceptron**（p7）就是一个单元：输入 $x_1..x_m$、权重 $w_1..w_m$、bias 权重 $w_0$（配 $x_0=1$）、求和 $s=\sum_{j=0}^mw_jx_j=\bw'\bx$、激活 $f(s)$。`,
      T`**作为分类器**（p8）：$s\ge0$ 判 A 类，$s<0$ 判 B 类。决策边界 $\bw'\bx=0$ 是超平面 ⇒ **线性分类器**。`,
      T`**例**（p9–p10）：$(0,0),(0,1),(1,0)$ 是 B，$(1,1)$ 是 A（就是 AND）。$w_1=w_2=1$，$w_0=-1.5$：得分 $-1.5,-0.5,-0.5,0.5$，完美分开。`,
      T`上面的权重是人手挑的。要让机器自己学，就用 c13 的老办法：写一个损失，再用 SGD 往下走。perceptron 的损失很直接——分对了损失 0；分错了，损失是"错得多远" $|s_i|$。分错时它对 $\bw$ 的梯度是 $-y_i\bx_i$，往反方向走一步就是 $\bw\leftarrow\bw+\eta y_i\bx_i$——正好是"往分错的点推一下"。课件 p33 的第一步：$\bw=(0.2,0)$、$w_0=-0.1$，点 $(1,1)$ 标签 $-1$，得分 $0.1$，和标签异号（分错），于是 $(w_1,w_2,w_0)$ 各减 $0.1\times(1,1,1)$，变成 $(0.1,-0.1,-0.2)$（完整过程见"数学定义"一节）。`,
      T`**Perceptron loss**（p14）：`,
      { t: 'math', tex: T`L_i(\bw)=\max(0,\ -s_iy_i)=\begin{cases}0,&s_iy_i>0\ (\text{分对})\\|s_i|,&s_iy_i<0\ (\text{分错})\end{cases}` },
      T`**训练规则**（p18–p19）：逐个样本看，$s_i=\bw'\bx_i$；若 $s_iy_i\le0$ 则`,
      { t: 'math', tex: T`\bw^{(k+1)}=\bw^{(k)}+\eta\,y_i\,\bx_i` },
      T`看课件 L10 例 2（T11 题型）的完整过程：每分错一个点，分界线就朝它转一下：`,
      { t: 'video', id: 'perceptron' },
    ],
    why: [
      T`Perceptron 是神经网络的"原子"（c33 的 MLP 就是很多个它叠起来，激活换成可导的）。它的更新规则也是 kernel perceptron（c32）和 experts 算法（c45）的原型。T11 题型是手算更新。`,
    ],
    intuition: [
      T`**更新 = 把边界往分错的点那边推。** 正类点被分到负侧（$s<0$，$y=+1$）：加上 $\eta\bx$，让 $\bw$ 更像这个点，下次它的得分 $\bw'\bx$ 变大（增加 $\eta\|\bx\|^2$）。负类点被分错：减去 $\eta\bx$。`,
      T`**为什么用 $\le0$ 而不是 $<0$？** 初始 $\bw=\mathbf 0$ 时所有点 $s=0$，用严格 $<0$ 永远不会更新（L10 p19、p22 的 "why?"）。`,
      { t: 'think', q: 'Perceptron loss 和 SVM 的 hinge loss $\\max(0,1-sy)$ 差在哪？这对结果有什么影响？', a: 'perceptron loss 是 $\\max(0,-sy)$：只要分对（$sy>0$）就满足，哪怕紧贴边界。hinge 要求 $sy\\ge1$（有 margin）。所以 perceptron 只找到**某一条**能分开的线（无穷多条中的一条，L10 p32），SVM 找 margin 最大的那条。' },
      { t: 'story', title: 'Rosenblatt 的感知机', md: 'Frank Rosenblatt 1957–1958 年在康奈尔提出 perceptron，还造了一台专用硬件 Mark I Perceptron 来识别图片。当时的报纸对它寄予厚望；1969 年 Minsky 和 Papert 指出单层感知机连 XOR 都学不会（第 12 章），热潮随之退去。' },
    ],
    math: [
      { t: 'h3', text: '从 loss 推出更新（L10 p16–p18）' },
      { t: 'steps', items: [
        T`SGD（每次只用第 $i$ 个样本的梯度 $\nabla L_i$）：$\bw^{(k+1)}=\bw^{(k)}-\eta\nabla L_i(\bw^{(k)})$。`,
        T`梯度（p17）：分对时 $\nabla L_i=\mathbf 0$；分错时 $L_i=-s_iy_i=-y_i\bw'\bx_i$，$\nabla L_i=-y_i\bx_i$。`,
        T`代入：分错时 $\bw\leftarrow\bw+\eta y_i\bx_i$；分对时不变。`,
      ] },
      { t: 'h3', text: 'L10 p33–p39 的数值例子' },
      T`$s=w_1x_1+w_2x_2+w_0$，$\eta=0.1$，初始 $w_1=0.2,\ w_2=0,\ w_0=-0.1$。`,
      { t: 'table', cls: 'compact', head: ['样本', '$y$', '$s$', '$sy\\le0$?', '更新后 $(w_1,w_2,w_0)$'], rows: [
        ['$(1,1)$', '−1', '$0.2+0-0.1=0.1$', '$sy=-0.1$，是', '$(0.2-0.1,\\ 0-0.1,\\ -0.1-0.1)=(0.1,-0.1,-0.2)$'],
        ['$(2,1)$', '+1', '$0.2-0.1-0.2=-0.1$', '是', '$(0.1+0.2,\\ -0.1+0.1,\\ -0.2+0.1)=(0.3,0,-0.1)$'],
        ['$(1.5,0.5)$', '+1', '$0.45+0-0.1=0.35$', '否', '不变'],
      ] },
      T`（课件 p39 还画了第 4 个点——红点、类别 $-1$，被分错——但没标坐标，所以算不出它的更新，**不用算**。要手算的只有表里这 3 个点。第 3 个点 $(1.5,0.5)$：$s=0.3\times1.5+0\times0.5-0.1=0.35$，乘标签 $+1$ 仍是 $0.35>0$，分对，不更新。）`,
      T`注意 bias 的更新：$w_0\leftarrow w_0+\eta y\cdot1$（$x_0=1$）。`,
    ],
    fx: [
      {
        title: 'Perceptron 更新规则', tex: T`\text{if }\ \htmlClass{fx-p1}{s_iy_i\le0}:\quad\bw\leftarrow\bw+\htmlClass{fx-p2}{\eta}\,\htmlClass{fx-p3}{y_i\bx_i}`,
        parts: [
          { label: 'sy ≤ 0', note: '分错（或正好在边界上）才更新。分对什么都不做。' },
          { label: 'η', note: '学习率（L10 例子用 1 或 0.1）。' },
          { label: 'y x', note: '正类加上 $\\bx$，负类减去 $\\bx$。$\\bx$ 包含 bias 输入 1，所以 $w_0$ 也加减 $\\eta$。' },
        ],
      },
    ],
    example: [
      { t: 'fade', title: '分步练习：perceptron 更新', plan: [T`算 $s=\bw'\bx$（含 $w_0$）`, T`判断 $s\cdot y\le0$`, T`若是：$\bw\leftarrow\bw+\eta y\bx$，$w_0\leftarrow w_0+\eta y$`], items: [
        { md: T`L10 第 1 步：$\bw=(0.2,0)$，$w_0=-0.1$，$\eta=0.1$，样本 $(1,1)$，$y=-1$。`, steps: [
          { md: '$s=0.1$' }, { md: '$sy=-0.1\\le0$，要更新' }, { md: '$(0.1,-0.1)$，$w_0=-0.2$' },
        ] },
        { md: T`L10 第 2 步：$\bw=(0.1,-0.1)$，$w_0=-0.2$，样本 $(2,1)$，$y=+1$。`, steps: [
          { ask: '$s=?$', answer: -0.1, show: T`$0.2-0.1-0.2=-0.1$` },
          { ask: '$sy\\le0$ 吗？（是填 1，否填 0）', answer: 1, show: '是' },
          { ask: T`新的 $w_1=?$`, answer: 0.3, show: '$0.1+0.1\\times2=0.3$' },
        ] },
        { md: T`$\bw=(0,0)$，$w_0=0$，$\eta=1$，样本 $(2,-1)$，$y=-1$。`, steps: [
          { ask: '$s=?$', answer: 0, show: '0' },
          { ask: '更新后 $w_1=?$', answer: -2, show: T`$sy=0\le0$ ⇒ $w_1=0+1\cdot(-1)\cdot2=-2$` },
          { ask: '更新后 $w_0=?$', answer: -1, show: '$0+(-1)=-1$' },
        ] },
      ] },
    ],
    viz: [
      { id: 'perceptron-stepper', how: 'L10 p33–p39 的前三个样本（第 4 个点课件没给坐标）和初始权重。每点"下一步"处理一个样本：显示得分、是否分错、更新前后的权重和决策边界。',
        try: '先按上面的 fade 练习自己算，再一步步核对。观察每次更新后边界往哪边移动。' },
      { id: 'hyperplane-2d', opts: { w1: 1, w2: 1, b: -1.5, points: [[0, 0], [0, 1], [1, 0], [1, 1]] }, how: 'L10 p10 的 AND 例子：$w_1=w_2=1$，$w_0=-1.5$。',
        try: '确认只有 $(1,1)$ 在正侧。再试 $b=-0.5$：变成 OR。' },
    ],
    compare: [
      { t: 'table', head: ['', 'Perceptron', 'Logistic regression', 'SVM'], rows: [
        ['损失', '$\\max(0,-sy)$', 'cross-entropy', 'hinge $\\max(0,1-sy)$'],
        ['分对但贴边', '无损失', '小损失', '有损失（要 margin）'],
        ['可分数据的解', '某一条分界线', '$\\|\\bw\\|\\to\\infty$（需正则）', '最大 margin（唯一）'],
        ['不可分数据', '不收敛（L10 p32）', '正常', 'soft margin'],
      ] },
    ],
    pitfalls: [
      ['分对的点也要更新', '只有 $sy\\le0$ 才更新。'],
      ['忘记更新 bias', '$w_0$ 对应输入 1，同样 $+\\eta y$。'],
      ['perceptron loss = hinge loss', 'hinge 多了 margin 1（L10 p14 说"相似但不同"）。'],
      ['用 0/1 标签代入 $\\eta y\\bx$', '规则要求 $y\\in\\{-1,+1\\}$；$y=0$ 会让负类永远不更新。'],
    ],
    quiz: [
      {
        type: 'num', q: T`（平时小测原题）Imagine you are training a Perceptron as described in lectures: for $s=w_0+w_1x_1+w_2x_2$, the classifier predicts positive if $s\ge0$ and negative if $s<0$. You use the Perceptron loss $L(s,y)=\max\{0,-sy\}$ and the standard update rule with learning rate $\eta=1$. If the current weights are $(w_0,w_1,w_2)=(1,-2,2)$, what will the new weight $w_2$ be after processing the training example $(x_1,x_2)=(2,-1)$, $y=-1$?`,
        qzh: T`按课件训练感知机：$s=w_0+w_1x_1+w_2x_2$，$s\ge0$ 判正类、$s<0$ 判负类；损失 $L(s,y)=\max\{0,-sy\}$，学习率 $\eta=1$。当前权重 $(w_0,w_1,w_2)=(1,-2,2)$，处理样本 $(x_1,x_2)=(2,-1)$、$y=-1$ 之后，新的 $w_2$ 是多少？`,
        answer: 2,
        explain: T`先算得分：$s=1+(-2)\times2+2\times(-1)=1-4-2=-5$。$s<0$ 判负类，真实 $y=-1$，分对了。等价地看损失：$y\,s=(-1)(-5)=5>0$，$L=\max\{0,-5\}=0$，梯度为 0，所以**不更新**，$w_2$ 仍是 2。常见错误是不管分没分对都套 $\mathbf w\leftarrow\mathbf w+\eta y\mathbf x$，会得到 $w_2=2+1\times(-1)\times(-1)=3$。`,
      },
      { type: 'num', q: '$\\bw=(1,-1)$，$w_0=0$，样本 $(1,2)$，$y=+1$，$\\eta=0.5$。更新后 $w_2=?$', answer: 0, explain: T`Perceptron（感知机）先算得分（含 bias）：$s=w_0+w_1x_1+w_2x_2=0+1\times1+(-1)\times2=-1$。标签 $y=+1$，$sy=-1\le0$，分错，要更新 $\bw\leftarrow\bw+\eta y\bx$。第二个分量：$w_2\leftarrow w_2+\eta yx_2=-1+0.5\times(+1)\times2=-1+1=0$（同时 $w_1$ 变成 $1+0.5\times1=1.5$）。更新后这个点的得分变成 $0.5+1.5\times1+0\times2=2>0$，被分对了：更新就是把边界往分错的点那边推。` },
      { type: 'num', q: '同上，更新后 $w_0=?$', answer: 0.5, explain: T`Bias 权重 $w_0$ 对应一个恒为 1 的输入 $x_0=1$，所以它和其他权重用同一条规则：$w_0\leftarrow w_0+\eta yx_0$。上一题已判定这个样本分错（$sy=-1\le0$），代入 $w_0=0$、$\eta=0.5$、$y=+1$：$w_0\leftarrow0+0.5\times(+1)\times1=0.5$。**分错时 bias 也要更新**，忘了它是这类手算题最常见的失分点。` },
      { type: 'mc', q: 'Perceptron 是：', options: ['非线性分类器', '线性分类器', '回归模型', '生成式模型'], answer: 1, explain: T`perceptron 的得分 $s=\bw'\bx=\sum_{j=0}^mw_jx_j$ 是输入的线性函数，判类只看 $s\ge0$ 还是 $s<0$，所以决策边界 $\bw'\bx=0$ 是一个超平面（二维里就是一条直线），这就是线性分类器。容易误选"非线性分类器"，因为输出套了一个 sign/step 激活；**但激活只是对线性得分取符号，不会把边界弄弯**。它输出的是类别而不是实数，所以不是回归模型。L10 p8。` },
      { type: 'show', q: '（英文）Derive the perceptron update from the perceptron loss.', answer: T`The perceptron loss is $L_i(\mathbf w)=\max(0,-y_i\mathbf w'\mathbf x_i)$. Its gradient is $\mathbf 0$ if $y_i\mathbf w'\mathbf x_i>0$ and $-y_i\mathbf x_i$ if $y_i\mathbf w'\mathbf x_i<0$, so a stochastic gradient step gives $\mathbf w\leftarrow\mathbf w+\eta y_i\mathbf x_i$ on a mistake. The course also updates when $y_i\mathbf w'\mathbf x_i=0$, so that training can start from $\mathbf w=\mathbf 0$.`, qzh: '由感知机损失（perceptron loss）推导感知机的更新规则（perceptron update）。', azh: T`感知机损失（perceptron loss）为 $L_i(\mathbf w)=\max(0,-y_i\mathbf w'\mathbf x_i)$。当 $y_i\mathbf w'\mathbf x_i>0$ 时梯度为 $\mathbf 0$，当 $y_i\mathbf w'\mathbf x_i<0$ 时梯度为 $-y_i\mathbf x_i$，所以在分错时，随机梯度（stochastic gradient）走一步得到 $\mathbf w\leftarrow\mathbf w+\eta y_i\mathbf x_i$。课程在 $y_i\mathbf w'\mathbf x_i=0$ 时也做更新，这样训练才能从 $\mathbf w=\mathbf 0$ 开始。` },
    ],
  });

  /* =====================================================================
   * c32 · 收敛定理、kernel perceptron（L10 p30–p32, p42–p47）
   * ===================================================================== */
  add({
    id: 'c32', week: 'W5', lec: 'L10', pages: 'L10 p30–p32, p42–p47', star: 1,
    title: '收敛定理、kernel perceptron', en: 'Perceptron convergence and the kernel perceptron',
    summary: '数据线性可分时，perceptron 在有限步内收敛（更新次数 $\\le R^2/\\gamma^2$）；不可分时不收敛。因为 $\\bw$ 总是训练点的线性组合，预测只依赖点积——换成 kernel 就得到 **kernel perceptron**：每个样本记一个计数 $\\alpha_i$，分错就 $\\alpha_i\\mathrel{+}=\\eta$。',
    prereq: ['c29', 'c31'],
    symbols: [
      [T`$\gamma$`, T`（本章，≠ RBF 的 $\gamma$）可分数据的 margin：存在 $\bw^*$ 使所有 $\frac{y_i\bw^{*\prime}\bx_i}{\|\bw^*\|}\ge\gamma$`],
      [T`$R$`, T`数据半径：所有 $\|\bx_i\|\le R$`],
      [T`$\alpha_i$`, T`第 $i$ 个样本被分错（更新）的累计量（≠ 第 30 章 representer 的系数，虽然作用相似）`],
      [T`$\cos(\bw^*,\bw^{(k)})$`, T`两个向量夹角的余弦，$\le1$`],
    ],
    goals: [
      '叙述收敛定理的两个假设和结论 $k\\le R^2/\\gamma^2$',
      '说出 perceptron 的优缺点（L10 p32）',
      '解释为什么 $\\bw=\\sum\\alpha_jy_j\\bx_j$，并写出 kernel perceptron 的得分与更新',
    ],
    types: ['T11'],
    notExam: '收敛证明（L10 p31）只是 proof sketch，了解思路即可。',
    what: [
      { t: 'h3', text: '① perceptron 一定会停吗？（L10 p30–p32）' },
      T`c31 的 perceptron 一直改到不再犯错为止。会不会永远改下去？定理说：数据能被分开时，改的次数有上限。上限由两个量决定——**$\gamma$（margin）**：最好的那条分界线离最近的点有多远（越远越容易分）；**$R$**：数据点离原点最远有多远（数据越分散越难）。例：$R=2$、$\gamma=0.5$ ⇒ 最多改 $R^2/\gamma^2=4/0.25=16$ 次。`,
      T`**Perceptron convergence theorem（感知机收敛定理）**（L10 p30–p31）：若 ① 数据线性可分且有 margin $\gamma>0$（存在 $\bw^*$ 使 $\frac{y_i\bw^{*\prime}\bx_i}{\|\bw^*\|}\ge\gamma$）；② 数据有界 $\|\bx_i\|\le R$。则从 $\bw^{(0)}=\mathbf 0$、$\eta=1$ 出发，更新次数`,
      { t: 'math', tex: T`k\le\frac{R^2}{\gamma^2}` },
      T`**优缺点**（p32）：可分时保证收敛到一个正确的分界线（但只是无穷多个中的某一个）；**不可分时完全失败**（不会给出"近似最好"的解）。`,
      { t: 'h3', text: '② 换成 kernel：kernel perceptron（L10 p42–p47）' },
      T`"不可分时完全失败"留下一个问题：像 c12 的 XOR 那样直线根本分不开的数据怎么办？c29 的答案是换到特征空间——而 perceptron 恰好也能用 kernel trick。关键观察：从 $\bw=\mathbf 0$ 出发，每次只加 $\eta y_i\bx_i$，所以 $\bw$ 永远是训练点的加权和，打分只用到点积。点积换成 kernel，原空间里的边界就可以是曲线。先把"每个点被用来更新了几次"记成 $\alpha_i$：`,
      T`**Kernel perceptron**（p42–p47）：从 $\bw=\mathbf 0$ 开始，每次更新加 $\eta y_i\bx_i$，所以 $\bw=\sum_j\alpha_jy_j\bx_j$（$\alpha_j$ = 样本 $j$ 被更新的次数 × $\eta$）。于是 $s_i=\bw'\bx_i=\sum_j\alpha_jy_j\bx_j'\bx_i$，点积换成 kernel：`,
      { t: 'math', tex: T`s_i=\sum_{j=1}^N\alpha_jy_jK(\bx_j,\bx_i);\qquad\text{if }s_iy_i\le0:\ \alpha_i\leftarrow\alpha_i+\eta` },
    ],
    why: [
      T`收敛定理是第一个"算法一定能学会"的保证，也解释了为什么可分性和 margin 重要（margin 越大，收敛越快——又一次说明 margin 的价值）。kernel perceptron 则说明 kernel trick 不是 SVM 独有的（c30 的 representer theorem）。`,
    ],
    intuition: [
      { t: 'fold', title: '收敛定理的证明思路（L10 p31）', blocks: [
      T`**证明思路**（p31）：每次更新，$\bw^{(k)}$ 在 $\bw^*$ 方向上至少前进 $\gamma\|\bw^*\|$（所以 $\bw^{*\prime}\bw^{(k)}\ge k\gamma\|\bw^*\|$，线性增长）；而长度平方每次最多增加 $R^2$：$\|\bw+y_i\bx_i\|^2=\|\bw\|^2+2y_i\bw'\bx_i+\|\bx_i\|^2$，中间项 $\le0$（因为只在分错、$y_i\bw'\bx_i\le0$ 时才更新），最后一项 $\le R^2$；所以 $\|\bw^{(k)}\|^2\le kR^2$，长度只按 $\sqrt k$ 增长。夹角余弦 $\ge\frac{k\gamma}{\sqrt kR}=\sqrt k\frac\gamma R$，但余弦 $\le1$ ⇒ $k\le R^2/\gamma^2$。`,
      ] },
      { t: 'think', q: T`L10 p43：样本 1、7、29、1 依次被分错（$\eta$ 任意）。之后 $\bw=?$`, a: T`$\bw=2\eta y_1\bx_1+\eta y_7\bx_7+\eta y_{29}\bx_{29}$。样本 1 错了两次，所以 $\alpha_1=2\eta$。这就是"$\bw$ 是训练点的线性组合"。` },
      { t: 'story', title: '收敛证明', md: '感知机收敛定理通常归功于 Albert Novikoff 1962 年的证明。它是机器学习里最早的"有限步保证"之一，证明只用到两条不等式和余弦 ≤ 1。' },
    ],
    math: [
      { t: 'h3', text: 'Kernel perceptron 算法（L10 p45–p46）' },
      { t: 'steps', items: [
        T`$\boldsymbol\alpha=\mathbf 0$。`,
        T`对每个 epoch、每个样本 $i$：$s_i=\sum_j\alpha_jy_jK(\bx_j,\bx_i)$。`,
        T`若 $s_iy_i\le0$：$\alpha_i\leftarrow\alpha_i+\eta$。`,
        T`预测新点：$s=\sum_j\alpha_jy_jK(\bx_j,\bx)$。`,
      ] },
      { t: 'note', title: '注意', md: 'kernel perceptron 的规则来自"把 primal 的更新累加起来"（L10 p43–p46），所以不需要像 SVM 那样推 dual；kernel 的作用和 SVM 里一样，就是代替点积。' },
    ],
    fx: [
      {
        title: 'Kernel perceptron 得分', tex: T`s_i=\sum_{j=1}^N\htmlClass{fx-p1}{\alpha_j}\,\htmlClass{fx-p2}{y_j}\,\htmlClass{fx-p3}{K(\bx_j,\bx_i)}`,
        parts: [
          { label: 'α_j', note: '样本 $j$ 触发更新的次数 × η（更新包括分错和正好 $s_jy_j=0$ 两种情况）。从没触发过更新的样本 $\\alpha_j=0$，不参与。' },
          { label: 'y_j', note: '它的标签，决定投票方向。' },
          { label: 'K', note: '和样本 $j$ 的相似度。' },
        ],
      },
    ],
    example: [
      { t: 'h3', text: '一个小的 kernel perceptron 轨迹' },
      T`$\bx_1=(1,0)$，$y_1=+1$；$\bx_2=(0,1)$，$y_2=-1$；线性核 $K(\bu,\bv)=\bu'\bv$，$\eta=1$。本例**不含 bias**，$\bx_i$ 就是原始二维向量。（要保留 bias，可以用 $s=b+\sum_j\alpha_jy_jK(\bx_j,\bx)$ 并在更新时 $b\leftarrow b+\eta y_i$；等价于把核换成 $K+1$。）`,
      { t: 'steps', items: [
        T`$i=1$：$s_1=0$ ⇒ $\alpha_1=1$。`,
        T`$i=2$：$s_2=\alpha_1y_1K(\bx_1,\bx_2)=1\cdot1\cdot0=0$ ⇒ $\alpha_2=1$。`,
        T`第二轮 $i=1$：$s_1=1\cdot1\cdot1+1\cdot(-1)\cdot0=1>0$ ✓；$i=2$：$s_2=0+1\cdot(-1)\cdot1=-1$，$s_2y_2=1>0$ ✓。收敛。`,
        T`对应 $\bw=\sum\alpha_jy_j\bx_j=(1,0)-(0,1)=(1,-1)$。`,
      ] },
      { t: 'fade', title: '分步练习：收敛界与 kernel perceptron', plan: [T`$s_i=\sum_j\alpha_jy_jK(\bx_j,\bx_i)$`, T`判断 $s_iy_i\le0$`, T`若是：$\alpha_i\mathrel{+}=\eta$`], items: [
        { md: '上面的第 1、2 步。', steps: [
          { md: '$s_1=0$' }, { md: '$0\\le0$' }, { md: '$\\alpha_1=1$' },
        ] },
        { md: T`$\alpha=(1,0)$，同上数据，处理 $i=2$。`, steps: [
          { ask: T`$s_2=?$`, answer: 0, show: T`$K(\bx_1,\bx_2)=0$` },
          { ask: T`更新后 $\alpha_2=?$`, answer: 1, show: '$0\\le0$，加 1' },
        ] },
        { md: T`收敛界：$R=2$，$\gamma=0.5$。`, steps: [
          { ask: '最多更新几次？', answer: 16, show: T`$R^2/\gamma^2=4/0.25=16$` },
        ] },
      ] },
    ],
    viz: [
      { id: 'perceptron-stepper', how: '同第 31 章；注意每次更新都是"加上一个训练点"——累计下来 $\\bw$ 就是训练点的线性组合。', try: '数一数每个样本被用来更新了几次，那就是它的 $\\alpha_i/\\eta$。' },
    ],
    compare: [
      { t: 'table', head: ['', 'Perceptron（primal）', 'Kernel perceptron'], rows: [
        ['存什么', '$\\bw$', '每个样本的 $\\alpha_i$'],
        ['得分', '$\\bw\'\\bx$', '$\\sum_j\\alpha_jy_jK(\\bx_j,\\bx)$'],
        ['更新', '$\\bw\\mathrel{+}=\\eta y_i\\bx_i$', '$\\alpha_i\\mathrel{+}=\\eta$'],
        ['边界', '线性', '在原空间可以非线性'],
      ] },
    ],
    pitfalls: [
      ['不可分时 perceptron 会给出近似最优解', '会一直更新、不收敛（L10 p32）。'],
      ['收敛后的解是最大 margin 解', '只是某一个正确分界线。'],
      ['kernel perceptron 更新 $\\bw$', '更新的是 $\\alpha_i$。'],
      ['收敛界和数据量 $n$ 有关', '$R^2/\\gamma^2$ 只依赖半径和 margin。'],
    ],
    quiz: [
      { type: 'num', q: '$R=3$，$\\gamma=1$，更新次数上界？', answer: 9, explain: T`Perceptron 收敛定理（L10 p30–p31）：数据线性可分、margin 为 $\gamma$、所有点满足 $\|\bx_i\|\le R$ 时，从 $\bw=\mathbf 0$ 出发最多更新 $R^2/\gamma^2$ 次。代入 $R=3$、$\gamma=1$：$3^2/1^2=9/1=9$。数据越分散（$R$ 大）、margin 越小，需要的更新越多。**两个量都要平方**，算成 $R/\gamma=3$ 是错的。` },
      { type: 'mc', q: '数据不可分时 perceptron：', options: ['收敛到最小错误的解', '不收敛', '收敛到 SVM 解', '收敛但慢'], answer: 1, explain: T`收敛定理的前提是数据线性可分（存在 margin $\gamma>0$）。不可分时，不管 $\bw$ 取什么，总有点被分错，于是每一轮都会触发更新，权重一直在变，永远停不下来。**课件明确说：不可分时训练"完全失败"，不会给出一个近似解**，所以"收敛到最小错误的解"是最诱人的错项。它也不会收敛到 SVM 的最大 margin 解：即使可分，perceptron 也只停在某一条能分开的线上。L10 p32。` },
      { type: 'mc', q: 'Kernel perceptron 中 $\\alpha_i=0$ 表示：', options: ['样本 $i$ 从未被分错', '样本 $i$ 总被分错', '样本 $i$ 是支持向量', '学习率为 0'], answer: 0, explain: T`Kernel perceptron 从 $\boldsymbol\alpha=\mathbf 0$ 开始，**只有样本 $i$ 被分错（$s_iy_i\le0$）时才执行 $\alpha_i\leftarrow\alpha_i+\eta$**，分对时 $\alpha_i$ 不动。所以 $\alpha_i=0$ 说明样本 $i$ 从来没触发过更新，它在得分 $s=\sum_j\alpha_jy_jK(\bx_j,\bx)$ 里也不出现。误选"支持向量"正好反了：起作用的是 $\alpha_i>0$ 的样本（类似 SVM 里 $\lambda_i>0$ 的点），$\alpha_i=0$ 的样本对预测没有贡献。` },
    ],
  });

  /* =====================================================================
   * r05 · W5 复习
   * ===================================================================== */
  SML.content.add(SML.review({
    id: 'r05', week: 'W5', title: 'W5 复习：Kernel 与 Perceptron', en: 'Week 5 review',
    summary: '主线：**SVM dual 只用点积 → 换成 kernel → 在高维空间做线性分类**。要会：写多项式核的特征映射（带 $\\sqrt2$）、用组合规则 / 构造映射证明 kernel 合法（2021 Q15 模板）、用 Mercer 找反例、手算 perceptron 更新。',
    keypoints: [
      [T`Lagrangian + KKT（原可行、对偶可行、互补松弛、驻点）；SVM dual：$\max\sum\lambda_i-\frac12\sum\lambda_i\lambda_jy_iy_j\bx_i'\bx_j$，$\lambda_i\ge0$（soft：$\le C$），$\sum\lambda_iy_i=0$；$\bw^*=\sum\lambda_iy_i\bx_i$，支持向量 ⇔ $\lambda_i>0$。`, 'c28'],
      [T`Kernel $K=\varphi(\bu)'\varphi(\bv)$；kernel trick 精确且便宜；$(\bu'\bv)^2$ ⇒ $[u_1^2,\sqrt2u_1u_2,u_2^2]$；RBF $\exp(-\gamma\|\bu-\bv\|^2)$ 无限维。`, 'c29'],
      [T`合法 kernel：组合规则（和、积、$c>0$ 倍、$f(\bu)Kf(\bv)$）或构造 $\varphi$；Mercer：所有 Gram 矩阵 PSD；反例一组就够；representer theorem ⇒ 可 kernel 化。`, 'c30'],
      [T`Perceptron：$s=\bw'\bx$，loss $\max(0,-sy)$，分错时 $\bw\leftarrow\bw+\eta y\bx$（含 bias）。`, 'c31'],
      [T`可分时更新次数 $\le R^2/\gamma^2$；不可分不收敛；kernel perceptron：$s_i=\sum\alpha_jy_jK(\bx_j,\bx_i)$，分错 $\alpha_i\mathrel{+}=\eta$。`, 'c32'],
    ],
    map: [
      { t: 'table', head: ['', '数据怎么进入模型', '能否 kernel 化'], rows: [
        ['SVM dual', '$\\bx_i\'\\bx_j$', '能（c29）'],
        ['Perceptron', '$\\bw=\\sum\\alpha_jy_j\\bx_j$ ⇒ 点积', '能（c32）'],
        ['Ridge / logistic / PCA', 'representer theorem', '能（c30）'],
        ['神经网络', '学出来的 $\\varphi$', '不需要（自己学特征）'],
      ] },
    ],
    recall: [
      { q: 'KKT 四个条件？', a: '原可行 $g_i\\le0,h_j=0$；对偶可行 $\\lambda_i\\ge0$；互补松弛 $\\lambda_ig_i=0$；驻点 $\\nabla_\\bx\\mathcal L=0$。', ch: 'c28' },
      { q: 'SVM dual 目标与约束？', a: T`$\max\sum\lambda_i-\frac12\sum_{i,j}\lambda_i\lambda_jy_iy_j\bx_i'\bx_j$ s.t. $\lambda_i\ge0$，$\sum\lambda_iy_i=0$。`, ch: 'c28' },
      { q: '由 stationarity 得到的两个式子？', a: T`$\sum\lambda_iy_i=0$；$\bw^*=\sum\lambda_iy_i\bx_i$。`, ch: 'c28' },
      { q: 'Soft-margin dual 和 hard 的区别？', a: '只多了 $\\lambda_i\\le C$（box constraint）。', ch: 'c28' },
      { q: 'Kernel 定义？kernel trick 是什么？', a: T`$K(\bu,\bv)=\varphi(\bu)'\varphi(\bv)$；直接算 $K$ 代替显式特征点积，结果精确。`, ch: 'c29' },
      { q: '$(\\bu\'\\bv)^2$（2D）的特征映射？', a: T`$[u_1^2,\sqrt2u_1u_2,u_2^2]$。`, ch: 'c29' },
      { q: 'Kernel SVM 的预测？', a: T`$s=b^*+\sum\lambda_i^*y_iK(\bx_i,\bx)$。`, ch: 'c29' },
      { q: '四条 kernel 组合规则？', a: '$K_1+K_2$，$K_1K_2$，$cK_1$（$c>0$），$f(\\bu)K_1f(\\bv)$。', ch: 'c30' },
      { q: 'Mercer 定理？', a: '对所有有限点集，Gram 矩阵都 PSD ⇔ 合法 kernel。', ch: 'c30' },
      { q: '2021 Q15 式证明的关键一步？', a: '构造拼接特征映射 $\\varphi_3=[\\varphi_1;\\varphi_2]$，其点积等于 $k_1+k_2$。', ch: 'c30' },
      { q: 'Perceptron 更新规则？', a: T`若 $s_iy_i\le0$：$\bw\leftarrow\bw+\eta y_i\bx_i$（bias 加 $\eta y_i$）。`, ch: 'c31' },
      { q: 'Perceptron loss vs hinge？', a: '$\\max(0,-sy)$ vs $\\max(0,1-sy)$；后者要求 margin。', ch: 'c31', qzh: '感知机损失（perceptron loss）与合页损失（hinge loss）有什么区别？' },
      { q: '收敛定理？', a: T`可分（margin $\gamma$）且 $\|\bx\|\le R$ ⇒ 更新次数 $\le R^2/\gamma^2$。`, ch: 'c32' },
      { q: 'Kernel perceptron 的得分和更新？', a: T`$s_i=\sum\alpha_jy_jK(\bx_j,\bx_i)$；分错 $\alpha_i\mathrel{+}=\eta$。`, ch: 'c32' },
    ],
    formulas: [
      ['$\\mathcal L=f+\\sum\\lambda_ig_i+\\sum\\nu_jh_j$', 'Lagrangian', 'L09 p6'],
      ['$\\max\\sum\\lambda_i-\\frac12\\sum\\lambda_i\\lambda_jy_iy_j\\bx_i\'\\bx_j$', 'SVM dual', 'L09 p10'],
      ['$\\bw^*=\\sum\\lambda_iy_i\\bx_i$；$s=b^*+\\sum\\lambda_iy_iK(\\bx_i,\\bx)$', '恢复 / 预测', 'L09 p11, p24'],
      ['$(\\bu\'\\bv+c)^d$；$\\exp(-\\gamma\\|\\bu-\\bv\\|^2)$', '多项式核、RBF', 'L09 p32, p34'],
      ['$K_1+K_2,\\ K_1K_2,\\ cK_1,\\ f(\\bu)K_1f(\\bv)$', '组合规则', 'L09 p33'],
      ['$\\bw\\leftarrow\\bw+\\eta y_i\\bx_i$ if $s_iy_i\\le0$', 'perceptron', 'L10 p18'],
      ['$k\\le R^2/\\gamma^2$', '收敛界', 'L10 p31'],
    ],
    exam: [
      ['证明组合 kernel 合法', '2021 Q15（12 分）', '[T8](#/T08)'],
      ['为 XOR 写显式特征映射', '2025 practice Q2', '[T8](#/T08)'],
      ['二次核 SVM：primal 还是 dual', '2021 Q3', '[T4](#/T04)'],
      ['支持向量的 functional margin = 1', '2021 Q2', '[T4](#/T04)'],
      ['Perceptron 手算更新', 'T11', '[T11](#/T11)'],
    ],
    quiz: [
      { type: 'num', q: '两点 dual：$x_1=2\\,(-1)$，$x_2=6\\,(+1)$。$\\lambda=?$', answer: 0.125, explain: '两点、一正一负时，由 $\\lambda_1=\\lambda_2=\\lambda$ 得目标 $2\\lambda-\\frac12\\lambda^2(x_2-x_1)^2$，求导得 $\\lambda=2/(x_2-x_1)^2=2/16$。（只适用于这种两点特例。）' },
      { type: 'num', q: '$\\bu=(1,1)$，$\\bv=(1,2)$，$(\\bu\'\\bv+1)^2=?$', answer: 16, explain: '$(3+1)^2$。', qzh: T`已知 $\bu=(1,1)$，$\bv=(1,2)$，求 $(\bu'\bv+1)^2$。` },
      { type: 'num', q: 'RBF $\\gamma=2$，$\\bu=\\bv$。$K=?$', answer: 1, explain: '距离 0。', qzh: T`RBF 核（RBF kernel），$\gamma=2$，$\bu=\bv$，求 $K$。` },
      { type: 'num', q: 'Perceptron：$\\bw=(0,1)$，$w_0=0$，样本 $(1,-1)$，$y=+1$，$\\eta=1$。更新后 $w_2=?$', answer: 0, explain: '得分 $s=0\\times1+1\\times(-1)=-1$，标签 $+1$，分错。更新 $w_2\\leftarrow w_2+\\eta yx_2=1+1\\times(+1)\\times(-1)=0$——这里的 $-1$ 是特征 $x_2$，不是标签。' },
      { type: 'mc', q: '下面哪个一定**不是**合法 kernel？', options: ['$(\\bu\'\\bv)^3$', '$e^{\\bu\'\\bv}$', '$-\\|\\bu-\\bv\\|^2$', '$2\\bu\'\\bv+1$'], answer: 2, explain: '对角为 0、非对角为负，两点就能找到 $\\mathbf c\'M\\mathbf c<0$。' },
      { type: 'show', q: '（英文）Why can the perceptron be kernelised?', answer: T`Starting from $\mathbf w=\mathbf 0$, every update adds $\eta y_i\mathbf x_i$, so $\mathbf w=\sum_j\alpha_jy_j\mathbf x_j$ is always a linear combination of training points. The score $\mathbf w'\mathbf x=\sum_j\alpha_jy_j\mathbf x_j'\mathbf x$ then uses the data only through dot products, which can be replaced by a kernel $K(\mathbf x_j,\mathbf x)$; the update becomes $\alpha_i\leftarrow\alpha_i+\eta$ on a mistake.`, qzh: '为什么感知机（perceptron）可以核化（kernelised）？', azh: T`从 $\mathbf w=\mathbf 0$ 开始，每次更新都加上 $\eta y_i\mathbf x_i$，所以 $\mathbf w=\sum_j\alpha_jy_j\mathbf x_j$ 始终是训练点的线性组合（linear combination）。于是得分 $\mathbf w'\mathbf x=\sum_j\alpha_jy_j\mathbf x_j'\mathbf x$ 只通过点积（dot products）使用数据，而点积可以换成核函数（kernel）$K(\mathbf x_j,\mathbf x)$；分错时的更新变为 $\alpha_i\leftarrow\alpha_i+\eta$。` },
    ],
    next: '下一周（W6）：神经网络。perceptron 叠成多层、换成可导激活，就是 MLP；训练它靠 backpropagation（往年考过推导）。',
  }));
})(window);
