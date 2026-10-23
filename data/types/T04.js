/* T4 — SVM: support vectors, margin, primal vs dual (L08, L09). */
(function (root) {
  'use strict';
  const T = String.raw;

  root.SML.content.add({
    id: 'T04',
    eyebrow: '题型 T4 · 看图 3 分 + 概念简答 4 分',
    title: 'SVM：支持向量、margin、primal vs dual',
    en: 'Support vectors, margin, and when to use the primal',
    chips: [
      { text: 'L08 p13–p34', href: '#/L08', cls: 'src' }, { text: 'L09 p4–p13', href: '#/L09', cls: 'src' },
      { text: '2026 practice Q1c', cls: 'hot' }, { text: '2021 exam Q2, Q3', cls: 'hot' },
    ],
    lead: 'SVM 是支持向量机；margin（间隔）在本页指分界线到最近训练点的垂直距离。primal（原问题）直接求权重和截距；dual（对偶问题）改为求每个训练点对应的系数。硬间隔（hard margin）要求所有训练点都分对，并满足规定的间隔约束。这类题分两种：**看图找支持向量**（纯几何），和**解释 margin / primal / dual 的简答**（要会英文说法）。',
    blocks: [
      { t: 'h2', text: '1. 必背的几个式子', id: 'core' },
      {
        t: 'fx', title: 'Hard-margin SVM（L08 p21）',
        tex: T`\htmlClass{fx-p1}{\argmin_{\bw,b}\ \tfrac12\|\bw\|^2}\quad\text{s.t.}\quad \htmlClass{fx-p2}{y_i(\bw'\bx_i+b)}\htmlClass{fx-p3}{\ \ge 1},\ \ i=1,\dots,n`,
        intro: '符号：$n$ 是训练点总数，$i=1,\\dots,n$ 是训练点编号；$\\bw$ 是分界线的法向量（垂直于分界线的权重），$b$ 是截距；$\\bx$ 表示任意输入点，决策边界满足 $\\bw\'\\bx+b=0$，这个表达式大于 0 时判为 $+1$，小于 0 时判为 $-1$；二维时边界是一条直线，更高维时叫超平面；$\\bx_i$ 是第 $i$ 个点的坐标，$y_i\\in\\{+1,-1\\}$ 是它的类别；$\\bw\'\\bx$ 的撇是转置 = 对应分量相乘再相加；$\\argmin$ = "找出使后面式子最小的 $\\bw,b$"，s.t. = "并且必须满足"。$\\|\\bw\\|$ 表示权重向量的长度：二维时若 $\\bw=(w_1,w_2)$，则 $\\|\\bw\\|=\\sqrt{w_1^2+w_2^2}$；更多维时也把各分量平方后相加再开根号。最大化 margin 等价于最小化 $\\|\\bw\\|$（再取平方乘 ½，方便求导，解不变）。',
        parts: [
          { label: '目标', note: 'margin（边界到最近点的距离）是 $1/\\|\\bw\\|$，所以最大化 margin = 最小化 $\\|\\bw\\|$。' },
          { label: 'functional margin（函数间隔）', note: '$y_i(\\bw\'\\bx_i+b)$：分对时为正。除以 $\\|\\bw\\|$ 才是真实距离（L08 p17）。' },
          { label: '$\\ge 1$', note: 'canonical scaling：$\\bw,b$ 同乘一个正数，边界不变，所以规定离边界最近的点 functional margin 恰好为 1（p19–p20）。等号成立的点就是 **support vectors**。' },
        ],
      },
      {
        t: 'table', head: ['量', '公式', '出处'], rows: [
          ['点到超平面的距离', '$\\dfrac{y_i(\\bw\'\\bx_i+b)}{\\|\\bw\\|}$', 'L08 p17'],
          ['margin（单侧）', '$1/\\|\\bw\\|$；两条 margin 线（满足 $\\bw\'\\bx+b=+1$ 和 $\\bw\'\\bx+b=-1$，画图时可补成虚线）之间的宽度是 $2/\\|\\bw\\|$', 'p21'],
          ['support vectors', '$y_i(\\bw\'\\bx_i+b)=1$ 的点，在 margin 线上', 'p13、p20'],
          ['hinge loss（合页损失）', '$\\max(0,\\,1-y_i(\\bw\'\\bx_i+b))$。$\\max$ 表示取括号中较大的值：函数间隔至少为 1 时损失为 0，否则损失为 1 减去函数间隔', 'p31–p32'],
          ['soft margin（软间隔）', '最小化 $\\tfrac12\\|\\bw\\|^2+C\\sum_i\\xi_i$，s.t. $y_i(\\bw\'\\bx_i+b)\\ge1-\\xi_i,\\ \\xi_i\\ge0$。$\\xi_i$ 是第 $i$ 个点的松弛变量（slack variable），表示允许它违反间隔约束的量；$C>0$ 是预先选定的惩罚强度；$\\sum_i\\xi_i$ 表示把全部 $n$ 个训练点的松弛量相加', 'p33–p34'],
          ['dual', '$\\max_\\lambda\\sum\\lambda_i-\\tfrac12\\sum_i\\sum_j\\lambda_i\\lambda_jy_iy_j\\bx_i\'\\bx_j$，s.t. $\\lambda_i\\ge0$（soft：$\\le C$），$\\sum\\lambda_iy_i=0$。$\\lambda_i$ 是训练时要求解的非负系数（每个训练点一个），不是坐标；$\\lambda$ 表示整组系数 $(\\lambda_1,\\dots,\\lambda_n)$，$\\max_\\lambda$ 就是在满足约束的系数组合中找目标最大的那一组。$i,j$ 都是训练点编号，各从 1 到 $n$；$\\sum_i\\sum_j$ 表示对所有训练点配对求和，未写下标的 $\\sum\\lambda_i$ 和 $\\sum\\lambda_i y_i$ 也都是对全部训练点求和；$\\bx_i\'\\bx_j$ 是两点的点积。soft margin 里 $C$ 越大，违反 margin 罚得越重，越接近 hard margin', 'L09 p10、p12'],
          ['从 dual 恢复', '上标 $*$ 表示求解后得到的最优值，不是乘号；例如 $\\lambda_i^*$ 是最优系数，$\\bw^*$ 是最优权重。$\\bw^*=\\sum_i\\lambda_i^*y_i\\bx_i$；只有 support vectors 的 $\\lambda_i^*>0$', 'L09 p9、p11'],
        ],
      },

      { t: 'h2', text: '2. 看图找支持向量', id: 'read' },
      {
        t: 'steps', items: [
          '确认边界（题目给了就直接用）。',
          '算每个点到边界的**垂直**距离。二维图中，$x$ 表示横坐标，$x_i$ 是第 $i$ 个点的横坐标，不是整个点向量；$c$ 是竖直边界所在的横坐标。竖直边界 $x=c$ 时，距离就是 $|x_i-c|$，竖线表示取绝对值。',
          '两类各自离边界最近的点就是 support vectors。hard-margin 最优解两侧最近距离相等，可以用这一点检查边界读得对不对。',
          '同一侧有几个点**并列最近**，就全部都是 support vectors。',
        ],
      },
      { t: 'fig', src: 'assets/figures/ex2026_q1c_svm.png', caption: '2026 practice Q1c 原图：蓝圆 1、2、6，红方 3、4、5，绿线 $x=4.5$', w: 380 },
      {
        t: 'table', head: ['点', '坐标', '类', '到 $x=4.5$ 的距离'], rows: [
          ['1', '(3, 9)', '蓝', '**1.5**'], ['2', '(3, 4)', '蓝', '**1.5**'], ['6', '(1, 2)', '蓝', '3.5'],
          ['4', '(6, 6)', '红', '**1.5**'], ['3', '(8, 8)', '红', '3.5'], ['5', '(9, 3)', '红', '4.5'],
        ],
      },
      {
        t: 'exam', md: T`The support vectors are points **1, 2 and 4**. They are the closest points to the decision boundary $x=4.5$ on each side (distance 1.5), i.e. they lie on the margin boundaries $x=3$ and $x=6$ and satisfy $y_i(\mathbf w'\mathbf x_i+b)=1$. Removing any other point would not change the solution.`,
      },
      '（原图只画了绿色边界 $x=4.5$；两条 margin 虚线 $x=3$、$x=6$ 要自己补：两侧最近点的横坐标是 3 和 6。点到竖直边界的距离只看横坐标差，如 $|3-4.5|=1.5$、$|1-4.5|=3.5$。）',
      {
        t: 'deep', title: '展开详解：怎么确认 $x=4.5$ 确实是最优边界', hint: '题目给了边界时不用做',
        blocks: [
          '最大 margin = 两类凸包（把同一类的点用橡皮筋箍住围成的区域）之间最短距离的一半。蓝类最靠右的是线段 $(3,4)$–$(3,9)$（在 $x=3$ 上），红类最近的点 $(6,6)$ 到这条线段的垂足 $(3,6)$ 正好落在线段上，距离 3。检查其他候选（例如红类边 $(6,6)$–$(9,3)$，即直线 $x+y=12$）：$(3,4)$ 到它的距离 $|3+4-12|/\\sqrt2\\approx3.54>3$（点 $(x_0,y_0)$ 到直线 $x+y=12$ 的距离公式 $|x_0+y_0-12|/\\sqrt{1^2+1^2}$；这一步只是检查，不会也不影响做题）。所以最短距离 3，最优边界是 $x=4.5$，margin $=1.5$。',
          '怎么得到 $\\bw,b$：图上没标 $\\pm1$，这里把红方记成 $y=+1$、蓝圆记成 $y=-1$（对调的话 $\\bw,b$ 一起变号，边界不变）。单侧 margin $1.5=1/\\|\\bw\\|$ ⇒ $\\|\\bw\\|=2/3$；边界竖直、法向量指向红方 ⇒ $\\bw=(2/3,\\,0)$；边界 $x=4.5$ 上 $\\frac23\\times4.5+b=3+b=0$ ⇒ $b=-3$。点 2 的 $(2-3)$ 是 $\\frac23\\times3+(-3)=2-3=-1$。',
          '用 canonical 形式写出来：$\\bw=(2/3,\\,0)$，$b=-3$。检验：点 2 $(3,4)$，$y=-1$：$-1\\cdot(2-3)=1$ ✓；点 4 $(6,6)$，$y=+1$：$4-3=1$ ✓；margin $1/\\|\\bw\\|=1.5$ ✓。',
        ],
      },
      { t: 'viz', id: 'svm-grid', opts: { preset: 'EX2026Q1c' } },
      {
        t: 'past', src: '2019 S2 practice Q4(b) / 2020 S2 practice Q3(b) / 2021 S1 practice Q3(b)', marks: '1–5', topic: 'L08 p25–p26',
        q: 'Consider the data shown below with *hard-margin linear SVM decision boundary* shown between the classes. The right half is classified as red squares and the left half is classified as blue circles. Answer the following questions and explain your answers. *(Same figure as above: part (a) of this question is identical to 2026 practice Q1c.)*\n\n(b) What is the value of the *hard margin SVM loss* for point 3?',
        qzh: '下图给出数据和硬间隔线性 SVM（hard-margin linear SVM）的决策边界（decision boundary），右半边判为红方，左半边判为蓝圆。回答下列问题并解释。*（就是上面那张图；这道题的 (a) 问和 2026 practice Q1c 完全相同。）* (b) 点 3 的硬间隔 SVM 损失（hard margin SVM loss）是多少？',
        sol: [
          T`课件 L08 p25–p26 的 hard-margin SVM loss 只有两个取值：`,
          { t: 'math', tex: T`l_\infty=\begin{cases}0, & 1-y(\bw'\bx+b)\le0\ \ (\text{即 } y(\bw'\bx+b)\ge1)\\ \infty, & \text{otherwise}\end{cases}` },
          T`它和 hinge loss 不同：点落在 margin 里面或分错时，hinge loss 给一个有限的罚 $1-y(\bw'\bx+b)$，hard-margin loss 直接是 $\infty$（硬约束不许违反）。`,
          {
            t: 'steps', items: [
              T`点 3 是 $(8,8)$，红方。沿用上面"展开详解"的记号：红方 $y=+1$，$\bw=(2/3,\,0)$，$b=-3$。`,
              T`$\bw'\bx+b=\tfrac23\times8+0\times8-3=\tfrac{16}{3}-3=\tfrac73\approx2.33$，乘 $y=+1$ 仍是 $\tfrac73$。`,
              T`$\tfrac73\ge1$，即 $1-\tfrac73=-\tfrac43\le0$，所以 $l_\infty=0$。`,
            ],
          },
          T`不算 $\bw$ 也能答：点 3 在正确一侧（$x=8>4.5$），到边界的距离 $3.5$ 大于 margin $1.5$，在 margin 外面，约束满足，损失为 0。这正是 2019 排版解答的理由。`,
          {
            t: 'table', head: ['点', '$y$', '$y(\\bw\'\\bx+b)$', '$l_\\infty$'], rows: [
              ['1 (3, 9)', '−1', '1', '0'], ['2 (3, 4)', '−1', '1', '0'], ['6 (1, 2)', '−1', '7/3', '0'],
              ['3 (8, 8)', '+1', '**7/3**', '**0**'], ['4 (6, 6)', '+1', '1', '0'], ['5 (9, 3)', '+1', '3', '0'],
            ],
          },
          { t: 'note', md: '训练好的 hard-margin SVM 上，**每个**训练点的 hard-margin loss 都是 0：hard-margin SVM 要求所有点都满足 $y_i(\\bw\'\\bx_i+b)\\ge1$，这只在数据线性可分时做得到。损失为 $\\infty$ 的情况只会出现在"换一条边界"或"新加一个落在 margin 里的点"时。' },
          {
            t: 'exam', md: T`Zero. Point 3 $(8,8)$ is a red square ($y=+1$) on the correct side of the boundary $x=4.5$ and outside the margin (distance $3.5>1.5$). With $\mathbf w=(2/3,0)$, $b=-3$ its functional margin is $y(\mathbf w'\mathbf x+b)=16/3-3=7/3\ge1$, so the hard-margin loss ($0$ if $y(\mathbf w'\mathbf x+b)\ge1$, $\infty$ otherwise) is $0$.`,
          },
        ],
        azh: T`零。点 3 $(8,8)$ 是红方（$y=+1$），在边界 $x=4.5$ 的正确一侧，并且在间隔（margin）之外（距离 $3.5>1.5$）。取 $\mathbf w=(2/3,0)$、$b=-3$，它的函数间隔（functional margin）是 $y(\mathbf w'\mathbf x+b)=16/3-3=7/3\ge1$，所以硬间隔损失（$y(\mathbf w'\mathbf x+b)\ge1$ 时为 $0$，否则为 $\infty$）为 $0$。`,
      },

      { t: 'h2', text: '3. 概念简答（往年原题）', id: 'concepts' },
      {
        t: 'past', src: '2021 S1 exam Q2', marks: 4, topic: 'L08 p17–p21',
        q: 'For the hard-margin support vector machine, data points that are support vectors have a margin of 1 from the decision boundary. Explain how this can be the case even when support vectors are further than 1 unit away from the decision boundary in Euclidean space.',
        qzh: '对于硬间隔支持向量机（hard-margin support vector machine），作为支持向量（support vector）的数据点到决策边界（decision boundary）的间隔（margin）为 1。请解释：即使在欧氏空间中支持向量到决策边界的距离超过 1 个单位，这为什么仍然成立。',
        azh: T`"间隔为 1"指的是函数间隔（functional margin）$y_i(\mathbf w'\mathbf x_i+b)=1$，而不是欧氏距离。因为把 $(\mathbf w,b)$ 乘以任意正常数都不改变决策边界，SVM 固定了这个尺度，使最近的点的函数间隔恰好为 1（规范形式，canonical form）。它们到边界的欧氏距离是 $y_i(\mathbf w'\mathbf x_i+b)/\|\mathbf w\| = 1/\|\mathbf w\|$，根据 $\|\mathbf w\|$ 的大小，这个距离可以大于（或小于）1。`,
        sol: [
          '"margin 为 1"说的是 **functional margin** $y_i(\\bw\'\\bx_i+b)=1$，不是欧氏距离。欧氏距离是 functional margin 除以 $\\|\\bw\\|$，即 $1/\\|\\bw\\|$。因为 $(\\bw,b)$ 乘任意正数不改变边界，SVM 用 canonical scaling 把最近点的 functional margin 固定为 1，真实距离由 $\\|\\bw\\|$ 决定。',
          {
            t: 'exam', md: T`The "margin of 1" is the functional margin $y_i(\mathbf w'\mathbf x_i+b)=1$, not a Euclidean distance. Because rescaling $(\mathbf w,b)$ by any positive constant leaves the decision boundary unchanged, the SVM fixes the scale so that the closest points have functional margin exactly 1 (canonical form). Their Euclidean distance to the boundary is $y_i(\mathbf w'\mathbf x_i+b)/\|\mathbf w\| = 1/\|\mathbf w\|$, which can be larger (or smaller) than 1 depending on $\|\mathbf w\|$.`,
          },
        ],
      },
      {
        t: 'past', src: '2021 S1 exam Q3', marks: 4, topic: 'L09 p10, p13, p21–p23',
        q: 'For a support vector machine with a quadratic kernel, in what situation, if any, would it be better to use the primal program instead of the dual program for training?',
        qzh: '对于使用二次核（quadratic kernel）的支持向量机，在什么情况下（如果存在的话）用原问题（primal program）训练比用对偶问题（dual program）更好？补充术语：核函数（kernel）用两个输入算出它们在新特征空间中的点积。二次核对应包含两两乘积的特征，例如两个输入特征 $x_1,x_2$ 可展开出 $x_1^2,x_1x_2,x_2^2$（具体形式也可含常数和一次项）；把这些新特征实际算出来，就叫显式特征映射。',
        azh: T`对偶问题的计算代价随训练样本数 $n$ 增长（大约 $O(n^3)$，需要一个 $n\times n$ 的核矩阵（kernel matrix）），而原问题的代价随特征维数增长。对 $m$ 个输入特征，二次核对应的显式特征映射（feature map）只有 $O(m^2)$ 维。所以当样本数非常大、原始特征很少（$n \gg m^2$）时，更好的做法是显式展开特征并求解原问题。（RBF 是 radial basis function，中文为径向基函数；这里指按两点距离定义相似度的核，对应无穷维特征空间，不能像二次核一样列出有限个特征来求解原问题。）`,
        sol: [
          '课件结论：一般方法求解 dual 的代价随**样本数** $n$ 增长（$O(n^3)$），primal 随**特征维数** $d$ 增长（$O(d^3)$）；这里 $d$ 是展开后的特征维数，$m$ 是原始输入维数，二次展开时 $d=O(m^2)$（L09 p10、p13）。二次核对应的显式特征空间维数大约是原维数的平方量级（$m$ 维输入 → $O(m^2)$ 个二次单项式，L09 p32）。（二次单项式 = 同一个样本的每对特征分量相乘 $x_rx_s$，$1\\le r\\le s\\le m$；这里 $r,s$ 是特征编号，不是训练点编号，共约 $m(m+1)/2$ 个，所以是 $O(m^2)$；$O(n^3)$ 的意思是样本数翻倍，计算量约变成 8 倍）',
          '所以：当**样本很多、原始特征很少**时（$n\\gg m^2$，即样本数 $n$ 远大于展开后的特征数的量级 $m^2$），直接在显式的二次特征上解 primal 更便宜；反之（高维、样本少，或用 RBF 这类无穷维核）就用 dual + kernel。',
          {
            t: 'exam', md: T`The dual's cost grows with the number of training examples $n$ (roughly $O(n^3)$, an $n\times n$ kernel matrix), whereas the primal's cost grows with the feature dimension. A quadratic kernel corresponds to an explicit feature map of only $O(m^2)$ dimensions for $m$ input features. So when the number of examples is very large and the number of original features is small ($n \gg m^2$), it is better to expand the features explicitly and solve the primal. (With an infinite-dimensional kernel such as RBF, the primal is not an option.)`,
          },
        ],
      },
      {
        t: 'past', src: '2022 S1 exam Q1(f) / 2019 S2 practice Q3(b) / 2021 S1 practice Q2(b)', marks: '1–5', topic: 'L09 p6, p10',
        q: '*Weak duality* guarantees that a primal optimum always upper bounds a dual optimum. How can we tell that the support vector machine\'s primal and dual optima are always equal? *(2019 / 2021 practice: Why do the primal and dual optima for the hard/soft-margin support vector machines coincide?)*',
        qzh: '弱对偶（weak duality）保证原问题（primal）的最优值总是对偶问题（dual）最优值的上界。我们怎么知道支持向量机的原问题和对偶问题最优值总是相等？*（2019 / 2021 练习卷的问法：为什么硬间隔 / 软间隔 SVM 的原问题和对偶问题最优值相同？）*',
        sol: [
          T`先分清两个词（L09 p6）：**weak duality（弱对偶）**对任何优化问题都成立，只保证 dual 最优值 $\le$ primal 最优值，中间可以有差距（duality gap）；strong duality（强对偶）是两者相等。课件的结论是"For convex programs, optima of primal and dual problems coincide"，所以答题的关键词是 convex（凸）。`,
          T`为什么 SVM 是凸问题：目标 $\tfrac12\|\bw\|^2$（soft margin 再加 $C\sum_i\xi_i$）是开口向上的二次函数加线性项，是凸的；约束 $y_i(\bw'\bx_i+b)\ge1-\xi_i$、$\xi_i\ge0$ 对 $(\bw,b,\boldsymbol\xi)$ 都是线性的；$\boldsymbol\xi=(\xi_1,\dots,\xi_n)$ 表示全部松弛变量组成的向量。判断线性时，训练数据 $\bx_i,y_i$ 都是已知常数，待求的是 $\bw,b,\xi_i$；约束中这些待求量只出现一次方，也没有彼此相乘。凸目标 + 线性约束 = 凸二次规划（QP），强对偶成立，所以"solving dual solves the primal"（L09 p10），可以由 dual 解出 $\bw^*=\sum_i\lambda_i^*y_i\bx_i$。后面答案提到的 KKT（Karush–Kuhn–Tucker）条件，是连接原问题与对偶问题最优解的一组最优性条件；这里恢复权重的公式就是由它们得到的，本题无需推导这些条件。`,
          { t: 'note', md: '更一般的强对偶定理还需检查额外条件，本题不要求展开，写"convex objective, linear constraints ⇒ strong duality"就够。hard margin 还要求数据线性可分，否则 primal 根本无解。2019 排版解答只写了一句"strong duality holds due to convexity of the objectives"（1 分）；2022 年同主题 5 分，要把弱对偶、凸性、结论都写出来。' },
          {
            t: 'exam', md: T`Weak duality only gives dual $\le$ primal. The SVM primal (hard or soft margin) is a convex optimisation problem: the objective $\tfrac12\|\mathbf w\|^2$ (plus $C\sum_i\xi_i$) is convex and all constraints are linear in $(\mathbf w,b,\boldsymbol\xi)$, i.e. it is a convex quadratic program. For convex programs strong duality holds, so the duality gap is zero and the primal and dual optima are equal (for the hard margin, provided the data are linearly separable so the primal is feasible). This is why solving the dual, and recovering $\mathbf w^*=\sum_i\lambda_i^*y_i\mathbf x_i$ through the KKT conditions, solves the primal.`,
          },
        ],
        azh: T`弱对偶只给出 dual $\le$ primal。SVM 的原问题（硬间隔或软间隔）是凸优化问题（convex optimisation problem）：目标函数 $\tfrac12\|\mathbf w\|^2$（加上 $C\sum_i\xi_i$）是凸的，所有约束对 $(\mathbf w,b,\boldsymbol\xi)$ 都是线性的，即它是一个凸二次规划（convex quadratic program）。凸规划满足强对偶（strong duality），所以对偶间隙（duality gap）为零，原问题和对偶问题的最优值相等（对硬间隔，前提是数据线性可分，原问题有可行解）。这就是为什么求解对偶问题、再通过 KKT 条件恢复 $\mathbf w^*=\sum_i\lambda_i^*y_i\mathbf x_i$，就解出了原问题。`,
      },
      {
        t: 'past', src: '2020 S2 practice Q2(b)', marks: 5, topic: 'L08 p29–p34, L09 p15–p23',
        q: 'How does SVM handle data that is not linearly separable? List two possible strategies.',
        qzh: 'SVM 如何处理线性不可分（not linearly separable）的数据？列出两种可能的策略。',
        sol: [
          T`L08 p29 原话列了三种做法："Still use hard-margin SVM, but transform the data"；"Relax the constraints"；"The combination of 1 and 2"。两种策略就写前两种，各说清楚**怎么做、为什么有用**：`,
          {
            t: 'ul', items: [
              T`soft margin（软间隔，L08 p30–p34）：给每个点一个 slack $\xi_i\ge0$，约束放松成 $y_i(\bw'\bx_i+b)\ge1-\xi_i$，目标加罚项 $C\sum_i\xi_i$。为什么等价于 hinge loss：约束要求 $\xi_i\ge1-y_i(\bw'\bx_i+b)$，同时 $\xi_i\ge0$；固定 $\bw,b$ 后，因为 $C>0$，最小化目标会选最小可行的 $\xi_i=\max(0,1-y_i(\bw'\bx_i+b))$，这正是该点的 hinge loss。允许点进入 margin 甚至分错，但按违反程度罚；$C$ 控制罚多重。`,
              T`特征变换 / kernel（L09 p15–p23）：把数据映射到 $\varphi(\bx)$ 的高维空间，在那里线性可分（如异或分类（XOR：两个二值输入不同时归为一类，相同时归为另一类），见 [T8](#/T08/xor)）；dual 里数据只以点积出现，换成 $K(\bx_i,\bx_j)=\varphi(\bx_i)'\varphi(\bx_j)$ 就不用显式算 $\varphi$（如 RBF kernel）。`,
            ],
          },
          { t: 'note', md: '学生批注只写了一句"Use the radial basis function"，只是第二种策略的一个例子，不够 5 分。' },
          {
            t: 'exam', md: T`(1) Soft margin: introduce slack variables $\xi_i\ge0$ and relax the constraints to $y_i(\mathbf w'\mathbf x_i+b)\ge1-\xi_i$, adding the penalty $C\sum_i\xi_i$ to the objective (equivalently, minimise the hinge loss plus $\tfrac12\|\mathbf w\|^2$). Points may lie inside the margin or on the wrong side, but are penalised by the amount of violation; $C$ trades margin width against violations.
(2) Transform the data: map the inputs to a higher-dimensional feature space $\varphi(\mathbf x)$ where the classes become linearly separable, and fit a (hard- or soft-margin) linear SVM there. Because the dual uses the data only through dot products, this is done with a kernel $K(\mathbf x_i,\mathbf x_j)=\varphi(\mathbf x_i)'\varphi(\mathbf x_j)$ (e.g. polynomial or RBF) without computing $\varphi$ explicitly. The two can also be combined.`,
          },
        ],
        azh: T`(1) 软间隔（soft margin）：引入松弛变量（slack variables）$\xi_i\ge0$，把约束放松为 $y_i(\mathbf w'\mathbf x_i+b)\ge1-\xi_i$，在目标里加罚项 $C\sum_i\xi_i$（等价于最小化 hinge loss 加 $\tfrac12\|\mathbf w\|^2$）。点可以落在间隔以内甚至分错一侧，但按违反的程度受罚；$C$ 在间隔宽度和违反之间权衡。
(2) 变换数据：把输入映射到更高维的特征空间 $\varphi(\mathbf x)$，使两类在那里线性可分，再在那里拟合（硬或软间隔）线性 SVM。因为对偶问题只通过点积使用数据，可以用核函数（kernel）$K(\mathbf x_i,\mathbf x_j)=\varphi(\mathbf x_i)'\varphi(\mathbf x_j)$（如多项式核或 RBF 核）完成，而不用显式计算 $\varphi$。两种方法也可以结合使用。`,
      },
      {
        t: 'past', src: '2017 S2 exam Q3(a)', marks: 2, topic: 'L02 p29, L09 p11, p20',
        q: 'A method is called *non-parametric* if it does not rely on a fixed number of parameters. Explain why a *SVM* can be considered *non-parametric*.',
        qzh: '如果一个方法不依赖于固定数目的参数，就称它为非参数（non-parametric）方法。解释为什么 SVM 可以被看作非参数方法。',
        sol: [
          T`L02 p29：parametric = 参数个数固定、有限；non-parametric = 参数个数随数据增长，可能无限（见 [c09](#/c09)）。`,
          T`看 SVM 的 dual 形式（L09 p11、p20）：训练求的是每个训练点一个乘子 $\lambda_i$，预测用 $s=b^*+\sum_i\lambda_i^*y_iK(\bx_i,\bx)$，其中 $\bx$ 是待预测的新点，$s$ 是实数决策分数，不是类别标签；$s>0$ 时预测为 $+1$，$s<0$ 时预测为 $-1$。模型要**存下支持向量本身**，参数个数（乘子 / 支持向量的个数）由数据决定、随 $n$ 增长，事先不固定。用 RBF 这类 kernel 时，特征空间无穷维，根本没有一个有限维的 $\bw$ 可以存，只能这样表示。`,
          { t: 'note', md: '题目说"can be considered"：线性核的 SVM 在 primal 里只有 $d+1$ 个参数（$d$ 是输入特征数：$d$ 个权重加一个截距 $b$），是 parametric 的；非参数的说法针对 dual / kernel 形式，和 c09 的说明一致。' },
          {
            t: 'exam', md: T`In its dual (kernelised) form the SVM is represented by one multiplier $\lambda_i$ per training point and predicts with $s=b^*+\sum_{i=1}^n\lambda_i^*y_iK(\mathbf x_i,\mathbf x)$, so the model must store the support vectors themselves. The number of parameters (multipliers / support vectors) therefore grows with the training data rather than being fixed in advance, and with a kernel such as RBF the feature space is infinite-dimensional, so no fixed finite weight vector exists. Hence the SVM can be considered non-parametric.`,
          },
        ],
        azh: T`在对偶（核化）形式下，SVM 由每个训练点一个乘子 $\lambda_i$ 表示，预测用 $s=b^*+\sum_{i=1}^n\lambda_i^*y_iK(\mathbf x_i,\mathbf x)$，所以模型必须存下支持向量本身。因此参数（乘子 / 支持向量）的个数随训练数据增长，而不是事先固定；用 RBF 这样的核时特征空间是无穷维的，不存在一个固定的有限维权重向量。所以 SVM 可以被看作非参数方法。`,
      },
      {
        t: 'past', src: '2017 S2 exam Q1(d)', marks: 1, topic: 'L08 p10–p11, L10',
        q: '*Perceptrons* and *hard-margin SVMs* are both *linear classifiers*. What is the difference between the two methods?',
        qzh: '感知机（perceptron）和硬间隔 SVM（hard-margin SVM）都是线性分类器（linear classifier）。这两种方法的区别是什么？',
        sol: [
          T`两者都找一条分开两类的直线（超平面），区别在**找哪一条**。perceptron 用 SGD（随机梯度下降：每次用一个训练点计算更新方向并调整权重）最小化 perceptron loss（感知机损失），分对的点不产生损失（L10），所以一旦把训练数据全部分对就停，停在哪条线取决于初始权重和样本顺序。hard-margin SVM 在所有能分开数据的超平面里选 margin 最大的那一条（L08 p10），解唯一，对训练样本的抽样更稳健（L08 p11）。`,
          {
            t: 'exam', md: T`The perceptron stops at any hyperplane that separates the training data (it minimises the perceptron loss by SGD, so which separator it finds depends on the initial weights and the order of the examples), whereas the hard-margin SVM returns the unique separating hyperplane with the maximum margin (by solving a quadratic program), which is more robust to the sampling of the training data.`,
          },
        ],
        azh: T`感知机停在任意一个能分开训练数据的超平面上（它用 SGD 最小化感知机损失 perceptron loss，所以找到哪个分隔超平面取决于初始权重和样本顺序）；而硬间隔 SVM 返回唯一的、间隔最大的分隔超平面（通过求解一个二次规划 quadratic program），对训练数据的抽样更稳健。`,
      },
      {
        t: 'past', src: '2016 S2 exam, Q1.10', marks: 1, topic: 'L08 p13, L09 p11',
        q: 'What are *support vectors*?',
        qzh: '什么是支持向量（support vectors）？',
        sol: [
          T`1 分的定义题：几何定义（L08 p13 "Point(s) on margin boundaries called support vectors"）+ 一句它们为什么重要。dual 里它们正是 $\lambda_i>0$ 的点，解只由它们决定（L09 p11）。相关的 T13 卡片"Which training points determine the SVM solution"问的是后半句，见 [T13](#/T13)。`,
          {
            t: 'exam', md: T`Support vectors are the training points closest to the decision boundary, lying on the margin boundaries, i.e. $y_i(\mathbf w'\mathbf x_i+b)=1$ (in the soft-margin SVM also the points inside the margin or misclassified). They are the points with $\lambda_i>0$ in the dual, and the solution $\mathbf w^*=\sum_i\lambda_iy_i\mathbf x_i$ depends only on them.`,
          },
        ],
        azh: T`支持向量是离决策边界最近、位于间隔边界（margin boundaries）上的训练点，即满足 $y_i(\mathbf w'\mathbf x_i+b)=1$ 的点（软间隔 SVM 中还包括落在间隔以内或被分错的点）。它们是对偶问题中 $\lambda_i>0$ 的点，解 $\mathbf w^*=\sum_i\lambda_iy_i\mathbf x_i$ 只由它们决定。`,
      },

      { t: 'h2', text: '4. 易错点', id: 'pitfalls' },
      {
        t: 'table', head: ['错误', '正确'], rows: [
          ['只选每类一个最近点', '并列最近的都要选（2026 卷蓝类有 2 个）'],
          ['用点到点的距离', '用点到**边界**的垂直距离'],
          ['把"margin = 1"理解成欧氏距离 1', 'functional margin = 1，几何距离 $1/\\|\\bw\\|$'],
          ['认为所有训练点都影响解', '只有 support vectors（$\\lambda_i>0$）决定 $\\bw$；删掉非支持向量，解不变'],
          ['soft-margin 的 $C$ 越大越"软"', '$C$ 越大，违反 margin 的惩罚越重，越接近 hard margin'],
        ],
      },
      {
        t: 'errata', md: '这里 $\\lambda>0$ 是正则化强度，不是前面的逐点对偶系数 $\\lambda_i$；$l_h$ 表示单个训练点的 hinge loss，$\\sum l_h$ 表示把全部训练点的 hinge loss 相加。L08 p33 写 $C=1/\\lambda$。按 p32 的 $\\sum l_h+\\lambda\\|\\bw\\|^2$ 和 p33 的 $\\tfrac12\\|\\bw\\|^2+C\\sum\\xi_i$ 对比：把前一个目标整体除以正数 $2\\lambda$（不改变最优解），得到 $\\tfrac12\\|\\bw\\|^2+\\frac{1}{2\\lambda}\\sum l_h$；再用最小可行的 $\\xi_i=l_h$ 对照后一个目标中损失项的系数，得到 $C=1/(2\\lambda)$。考试写"$C$ 与 $\\lambda$ 成反比"最稳。',
      },
      {
        t: 'quiz', items: [
          {
            q: '硬间隔 SVM 求出 $\\bw=(3,4)$。margin（边界到最近点的距离）是多少？', type: 'num', answer: 0.2,
            explain: '$\\|\\bw\\|=\\sqrt{3^2+4^2}=\\sqrt{25}=5$，margin $=1/\\|\\bw\\|=1/5=0.2$；两条 margin 线之间的宽度是 $2/5=0.4$。',
          },
          {
            q: '点 $\\bx=(1,1)$，$y=+1$，$\\bw=(1,1)$，$b=-1.5$。hinge loss 是多少？', type: 'num', answer: 0.5,
            explain: '$\\bw\'\\bx=1\\times1+1\\times1=2$，加 $b$：$2-1.5=0.5$，乘 $y=+1$ 仍是 $0.5<1$，所以 $\\max(0,1-0.5)=0.5$。分类正确，但落在 margin 里面，仍然有损失。',
          },
          {
            q: '为什么 SVM 的 dual 让 kernel trick 成为可能？', type: 'show',
            answerText: 'dual 里数据只以点积 $\\bx_i\'\\bx_j$ 的形式出现（训练和预测都是）。',
            explain: '所以可以把点积换成 $K(\\bx_i,\\bx_j)=\\varphi(\\bx_i)\'\\varphi(\\bx_j)$，不用显式算 $\\varphi$（L09 p19–p24）。',
          },
        ],
      },
    ],
  });
})(window);
