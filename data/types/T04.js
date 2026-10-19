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
    lead: '这类题分两种：**看图找支持向量**（纯几何），和**解释 margin / primal / dual 的简答**（要会英文说法）。',
    blocks: [
      { t: 'h2', text: '1. 必背的几个式子', id: 'core' },
      {
        t: 'fx', title: 'Hard-margin SVM（L08 p21）',
        tex: T`\htmlClass{fx-p1}{\argmin_{\bw,b}\ \tfrac12\|\bw\|^2}\quad\text{s.t.}\quad \htmlClass{fx-p2}{y_i(\bw'\bx_i+b)}\htmlClass{fx-p3}{\ \ge 1},\ \ i=1,\dots,n`,
        intro: '符号：$\\bw$ 是分界线的法向量（垂直于分界线的权重），$b$ 是截距；$\\bx_i$ 是第 $i$ 个点的坐标，$y_i\\in\\{+1,-1\\}$ 是它的类别；$\\bw\'\\bx$ 的撇是转置 = 对应分量相乘再相加；$\\argmin$ = "找出使后面式子最小的 $\\bw,b$"，s.t. = "并且必须满足"。最大化 margin 等价于最小化 $\\|\\bw\\|$（再取平方乘 ½，方便求导，解不变）。',
        parts: [
          { label: '目标', note: 'margin（边界到最近点的距离）是 $1/\\|\\bw\\|$，所以最大化 margin = 最小化 $\\|\\bw\\|$。' },
          { label: 'functional margin', note: '$y_i(\\bw\'\\bx_i+b)$：分对时为正。除以 $\\|\\bw\\|$ 才是真实距离（L08 p17）。' },
          { label: '$\\ge 1$', note: 'canonical scaling：$\\bw,b$ 同乘一个正数，边界不变，所以规定离边界最近的点 functional margin 恰好为 1（p19–p20）。等号成立的点就是 **support vectors**。' },
        ],
      },
      {
        t: 'table', head: ['量', '公式', '出处'], rows: [
          ['点到超平面的距离', '$\\dfrac{y_i(\\bw\'\\bx_i+b)}{\\|\\bw\\|}$', 'L08 p17'],
          ['margin（单侧）', '$1/\\|\\bw\\|$；两条虚线之间的宽度是 $2/\\|\\bw\\|$', 'p21'],
          ['support vectors', '$y_i(\\bw\'\\bx_i+b)=1$ 的点，在 margin 线上', 'p13、p20'],
          ['hinge loss', '$\\max(0,\\,1-y_i(\\bw\'\\bx_i+b))$', 'p31–p32'],
          ['soft margin', '$\\tfrac12\\|\\bw\\|^2+C\\sum_i\\xi_i$，s.t. $y_i(\\bw\'\\bx_i+b)\\ge1-\\xi_i,\\ \\xi_i\\ge0$', 'p33–p34'],
          ['dual', '$\\max_\\lambda\\sum\\lambda_i-\\tfrac12\\sum_i\\sum_j\\lambda_i\\lambda_jy_iy_j\\bx_i\'\\bx_j$，s.t. $\\lambda_i\\ge0$（soft：$\\le C$），$\\sum\\lambda_iy_i=0$。$\\lambda_i$ 是训练时要求的非负系数（每个训练点一个），不是坐标；$\\bx_i\'\\bx_j$ 是两点的点积。soft margin 里 $C$ 越大，违反 margin 罚得越重，越接近 hard margin', 'L09 p10、p12'],
          ['从 dual 恢复', '$\\bw^*=\\sum_i\\lambda_i^*y_i\\bx_i$；只有 support vectors 的 $\\lambda_i^*>0$', 'L09 p9、p11'],
        ],
      },

      { t: 'h2', text: '2. 看图找支持向量', id: 'read' },
      {
        t: 'steps', items: [
          '确认边界（题目给了就直接用）。',
          '算每个点到边界的**垂直**距离。竖直边界 $x=c$ 时就是 $|x_i-c|$。',
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

      { t: 'h2', text: '3. 概念简答（2021 原题）', id: 'concepts' },
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
        qzh: '对于使用二次核（quadratic kernel）的支持向量机，在什么情况下（如果存在的话）用原问题（primal program）训练比用对偶问题（dual program）更好？',
        azh: T`对偶问题的计算代价随训练样本数 $n$ 增长（大约 $O(n^3)$，需要一个 $n\times n$ 的核矩阵（kernel matrix）），而原问题的代价随特征维数增长。对 $m$ 个输入特征，二次核对应的显式特征映射（feature map）只有 $O(m^2)$ 维。所以当样本数非常大、原始特征很少（$n \gg m^2$）时，更好的做法是显式展开特征并求解原问题。（对于 RBF 这样的无穷维核，原问题不可行。）`,
        sol: [
          '课件结论：一般方法求解 dual 的代价随**样本数** $n$ 增长（$O(n^3)$），primal 随**特征维数** $d$ 增长（$O(d^3)$）（L09 p10、p13）。二次核对应的显式特征空间维数大约是原维数的平方量级（$m$ 维输入 → $O(m^2)$ 个二次单项式，L09 p32）。（二次单项式 = 每对特征相乘 $x_ix_j$，$i\\le j$，约 $m(m+1)/2$ 个，所以是 $O(m^2)$；$O(n^3)$ 的意思是样本数翻倍，计算量约变成 8 倍）',
          '所以：当**样本很多、原始特征很少**时（$n\\gg m^2$），直接在显式的二次特征上解 primal 更便宜；反之（高维、样本少，或用 RBF 这类无穷维核）就用 dual + kernel。',
          {
            t: 'exam', md: T`The dual's cost grows with the number of training examples $n$ (roughly $O(n^3)$, an $n\times n$ kernel matrix), whereas the primal's cost grows with the feature dimension. A quadratic kernel corresponds to an explicit feature map of only $O(m^2)$ dimensions for $m$ input features. So when the number of examples is very large and the number of original features is small ($n \gg m^2$), it is better to expand the features explicitly and solve the primal. (With an infinite-dimensional kernel such as RBF, the primal is not an option.)`,
          },
        ],
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
        t: 'errata', md: 'L08 p33 写 $C=1/\\lambda$。按 p32 的 $\\sum l_h+\\lambda\\|\\bw\\|^2$ 和 p33 的 $\\tfrac12\\|\\bw\\|^2+C\\sum\\xi_i$ 对比，严格是 $C=1/(2\\lambda)$。考试写"$C$ 与 $\\lambda$ 成反比"最稳。',
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
