/* T1 — VC dimension from a table of dichotomies (L07 p17–p29). */
(function (root) {
  'use strict';
  const T = String.raw;

  root.SML.content.add({
    id: 'T01',
    eyebrow: '题型 T1 · 三份往年卷都考 · 8–12 分',
    title: 'VC 维：从 dichotomy 表求 VC 维',
    en: 'VC dimension from a table of dichotomies',
    chips: [
      { text: 'L07 p17–p29', href: '#/L07', cls: 'src' },
      { text: '2026 practice Q3', cls: 'hot' }, { text: '2025 practice Q3', cls: 'hot' }, { text: '2021 exam Q16', cls: 'hot' },
    ],
    lead: '这是全卷**最机械**的题：给一张 0/1 表，按固定步骤删列、去重、数行即可。练熟以后 5 分钟内做完。',
    blocks: [
      { t: 'h2', text: '1. 怎么认出这道题', id: 'spot' },
      '题干长这样：*"Consider an input domain of five points $x_1,\\dots,x_5$, and binary classifier family $\\mathcal G$ defined by the table of dichotomies given below. Calculate $\\VC(\\mathcal G)$ and show a corresponding shattered set of points."* 2021 年还多问一句：*"List all shattered sets of points. How many are there in total?"*',
      {
        t: 'table', head: ['表里的东西', '含义（L07）'], rows: [
          ['列 $x_1,\\dots,x_n$', '输入空间里的 $n$ 个点（input domain）'],
          ['每一行', '一个分类器在这 $n$ 个点上给出的标签向量，叫一个 **dichotomy**（p17）'],
          ['整张表', '分类器族 $\\mathcal G$ 能产生的全部 dichotomy'],
          ['0/1', '就是两类标签，和 $\\pm1$ 没有区别（p29 用的就是 0/1）'],
        ],
      },

      { t: 'h2', text: '2. 只需要这三个定义', id: 'defs' },
      {
        t: 'table', head: ['术语', '定义', '一句话直觉'], rows: [
          ['**restrict**（只看子集）', '只保留子集 $S$ 对应的列', '分类器族在这几个点上能做出哪些标注'],
          ['**shattered**', '$S$ 被 shatter ⇔ 只看 $S$ 的列、**去掉重复行**后，$2^{|S|}$ 种 0/1 组合**全部**出现（p23）', '这些点怎么标都做得到'],
          ['**VC dimension**', '能被 shatter 的**最大**子集的大小（p23）', '分类器族最多能"随意摆布"几个点'],
        ],
      },
      {
        t: 'good', title: '两个推论，直接用来省时间',
        md: T`- **上界**：表有 $m$ 行，shatter $k$ 个点至少要 $2^k$ 个不同的行，所以 $\VC\le\lfloor\log_2 m\rfloor$。8 行 ⇒ $\VC\le3$；10 行 ⇒ $\VC\le3$。
- **向下封闭**：被 shatter 的集合，它的每个子集也被 shatter。所以只要**所有** $k$ 元子集都不被 shatter，更大的子集就不用查了。`,
      },

      { t: 'h2', text: '3. 解题步骤', id: 'steps' },
      {
        t: 'steps', items: [
          T`**数行，定上界。** 去掉完全相同的整行后剩 $m$ 行，则 $\VC\le\lfloor\log_2 m\rfloor$。从 $k=\lfloor\log_2 m\rfloor$ 开始试。`,
          T`**按列预筛（省掉大部分组合）。** 一个点能出现在大小为 $k$ 的 shattered 集里，它那一列至少要有 $2^{k-1}$ 个 0 和 $2^{k-1}$ 个 1。**为什么**：$k$ 个点的 $2^k$ 种组合里，这个点取 0 的正好一半（其余 $k-1$ 个点任意组合，共 $2^{k-1}$ 种），每种至少要出现在一行里。例：2026 卷 $x_5$ 只有 1 个 0，所以 $x_5$ 不可能在任何 shattered pair 里。两列恰好互补（如 2021 卷每一行都有 $x_6=1-x_4$，即一个是 0 另一个就是 1）时，这两点只能出现 01 和 10，永远凑不出 00 和 11，所以不能同时出现在 shattered 集里。`,
          T`**对剩下的 $k$ 元子集逐个检查：删列 → 去重 → 数。** 不同的组合数 $=2^k$ 就是 shattered。写出缺了哪个组合，就证明了"不是"。`,
          T`**找到一个 shattered 的 $k$ 元子集，且所有 $(k+1)$ 元子集都不行**，则 $\VC=k$。如果大小为 $k$ 的子集**一个都**不被 shatter，就把 $k$ 减 1 再查——不能直接把上界 $\lfloor\log_2m\rfloor$ 当答案。`,
          T`**写答案**：VC 值 + 一个 shattered 集 + 列出它的 $2^k$ 个组合 + 一句话说明更大的集合为什么不行。`,
        ],
      },
      {
        t: 'note', md: '下面是第 5 节 2026 Q3 那张 8 行表的答案写法示范（不是另一道题）。那张表的 $x_5$ 列是 $1,1,0,1,1,1,1,1$，只有第 3 行是 0，所以任何含 $x_5$ 的集合都凑不齐。',
      },
      {
        t: 'exam', md: T`$\mathrm{VC}(\mathcal G)=2$. The set $\{x_1,x_3\}$ is shattered: restricted to $(x_1,x_3)$ the dichotomies give $00,01,10,11$, i.e. all $2^2$ labellings. No set of 3 points is shattered: any triple containing $x_5$ fails because $x_5=0$ in only one row, and each of the remaining triples $\{x_1,x_2,x_3\},\{x_1,x_2,x_4\},\{x_1,x_3,x_4\},\{x_2,x_3,x_4\}$ realises fewer than $2^3=8$ distinct patterns. Hence no larger set is shattered and $\mathrm{VC}(\mathcal G)=2$.`,
      },

      { t: 'h2', text: '4. 交互解题器', id: 'solver' },
      '点表格格子可以改 0/1；点下面的子集按钮，看它删列、去重后缺哪些组合。可以切换到三道真题的表。',
      { t: 'viz', id: 'vc-solver', opts: { preset: 'EX2026Q3' } },

      { t: 'h2', text: '5. 真题全解', id: 'past' },
      {
        t: 'past', src: '2026 S2 practice Q3（= 2025 S1 practice Q3）', marks: 8, topic: 'L07 p29',
        q: 'Consider an input domain of five points $x_1,\\dots,x_5$, and binary classifier family $\\mathcal G$ defined by the table of dichotomies given below. Calculate $\\mathrm{VC}(\\mathcal G)$ and show a corresponding shattered set of points.',
        blocks: [{
          t: 'table', cls: 'mono compact', head: ['$x_1$', '$x_2$', '$x_3$', '$x_4$', '$x_5$'],
          rows: ['00001', '10001', '01010', '01101', '01011', '10111', '11101', '01111'].map((r) => r.split('')),
        }],
        sol: [
          { t: 'h4', text: '第 1 步：上界' },
          '8 行，各不相同 ⇒ $\\VC\\le\\log_2 8=3$。所以只需要查 3 元和 2 元子集。',
          { t: 'h4', text: '第 2 步：按列预筛' },
          {
            t: 'table', head: ['列', '0 的个数', '1 的个数', '能否进 3 元 shattered 集（各需 ≥4）'], rows: [
              ['$x_1$', '5', '3', '否（1 只有 3 个）'], ['$x_2$', '3', '5', '否'], ['$x_3$', '4', '4', '可能'],
              ['$x_4$', '4', '4', '可能'], ['$x_5$', '1', '7', '否；连 2 元集也进不了（需 ≥2 个 0）'],
            ],
          },
          '3 元 shattered 集要求三列都"可能"，但只有 $x_3,x_4$ 两列满足 ⇒ **没有 3 元子集被 shatter**。（不用预筛也可以：逐个查 $\\{x_1,x_2,x_3\\}$ 等 10 个三元组，每个都少于 8 种组合。）',
          { t: 'h4', text: '第 3 步：找一个 shattered pair' },
          {
            t: 'table', cls: 'mono compact', head: ['行', '$(x_1,x_3)$'],
            rows: [['1', '00'], ['2', '10'], ['3', '00 ✗重复'], ['4', '01'], ['5', '00 ✗重复'], ['6', '11'], ['7', '11 ✗重复'], ['8', '01 ✗重复']],
          },
          '去重后得到 $\\{00,01,10,11\\}$，4 种全齐 ⇒ $\\{x_1,x_3\\}$ 被 shatter。',
          {
            t: 'good', title: '答案',
            md: '$\\VC(\\mathcal G)=2$。被 shatter 的 2 元集共有 6 个：$\\{x_1,x_2\\},\\{x_1,x_3\\},\\{x_1,x_4\\},\\{x_2,x_3\\},\\{x_2,x_4\\},\\{x_3,x_4\\}$；任写一个并列出 4 种组合即可。（含 $x_5$ 的都不行：$x_5$ 只有 1 个 0，2 元集至少要 2 个 0。核对一个：$(x_2,x_4)$ 逐行是 00、00、11、10、11、01、10、11，去重后 4 种全齐。）',
          },
          {
            t: 'warn', md: '别因为"8 行 = $2^3$"就答 VC = 3。行数够只是**必要条件**，还必须在某 3 列上恰好出现全部 8 种组合。',
          },
        ],
      },
      {
        t: 'past', src: '2021 S1 exam Q16', marks: '5 + 7', topic: 'L07 p23, p29',
        q: 'Consider an input domain of six points $x_1,\\dots,x_6$ and binary classifier family $\\mathcal F$ defined by the table of dichotomies below. (a) Calculate $\\mathrm{VC}(\\mathcal F)$ and show a corresponding shattered set of points. (b) List all shattered sets of points. How many are there in total?',
        blocks: [{
          t: 'table', cls: 'mono compact', head: ['$x_1$', '$x_2$', '$x_3$', '$x_4$', '$x_5$', '$x_6$'],
          rows: ['101110', '000011', '010110', '001011', '001110', '100001', '100100', '111011'].map((r) => r.split('')),
        }],
        sol: [
          '8 行 ⇒ $\\VC\\le3$。观察到 $x_6=1-x_4$ 在每一行都成立，所以任何同时含 $x_4,x_6$ 的集合都只能出现 01 和 10，不可能被 shatter。',
          { t: 'h4', text: '(a) 找 3 元 shattered 集' },
          {
            t: 'table', cls: 'mono compact', head: ['行', '$(x_1,x_3,x_4)$', '$(x_1,x_3,x_6)$'],
            rows: [['1', '111', '110'], ['2', '000', '001'], ['3', '001', '000'], ['4', '010', '011'], ['5', '011', '010'], ['6', '100', '101'], ['7', '101', '100'], ['8', '110', '111']],
          },
          '两组都恰好出现 8 种组合 ⇒ $\\VC(\\mathcal F)=3$，例如 $\\{x_1,x_3,x_4\\}$。（8 行不可能 shatter 4 个点，$8<16$。）',
          { t: 'h4', text: '(b) 列出全部 shattered 集' },
          {
            t: 'table', head: ['大小', '集合', '个数'], rows: [
              ['0', '$\\varnothing$（按定义 $2^0=1$ 种组合，算 shattered）', '1'],
              ['1', '$\\{x_1\\},\\dots,\\{x_6\\}$（每列都有 0 也有 1）', '6'],
              ['2', '$\\{x_1,x_2\\},\\{x_1,x_3\\},\\{x_1,x_4\\},\\{x_1,x_6\\},\\{x_2,x_3\\},\\{x_2,x_4\\},\\{x_2,x_6\\},\\{x_3,x_4\\},\\{x_3,x_6\\},\\{x_4,x_5\\},\\{x_5,x_6\\}$', '11'],
              ['3', '$\\{x_1,x_3,x_4\\},\\{x_1,x_3,x_6\\}$', '2'],
            ],
          },
          '不被 shatter 的 4 个 pair：$\\{x_1,x_5\\}$ 缺 00，$\\{x_2,x_5\\}$ 缺 10，$\\{x_3,x_5\\}$ 缺 10，$\\{x_4,x_6\\}$ 只有 01、10。（自己核对时逐行只看两列。容易看漏的是 $\\{x_4,x_5\\}$：8 行依次是 11、01、11、01、11、**00**（第 6 行）、**10**（第 7 行）、01，四种全齐；$\\{x_5,x_6\\}$：10、11、10、11、10、**01**（第 6 行）、00、11，也全齐。$x_5$ 列有两个 0，在第 6、7 行。）',
          {
            t: 'good', title: '答案',
            md: '共 **20** 个（含空集）；不含空集为 **19** 个。卷面上两个数都写，并说明空集按定义是 shattered 的，阅卷人按哪种口径都能给分。',
          },
        ],
      },

      { t: 'h2', text: '6. 随机练习', id: 'practice' },
      '题目是随机生成的 4–5 个点的表。先自己在纸上做，再输入 VC 值核对。',
      { t: 'practice', gen: 'vc', title: 'VC 维随机题' },

      { t: 'h2', text: '7. 易错点', id: 'pitfalls' },
      {
        t: 'table', head: ['错误', '正确做法'], rows: [
          ['看到 8 行就答 VC = 3', '行数只给上界，必须在具体的 3 列上看到全部 8 种组合'],
          ['忘记去重', '只看子集列时，很多行会变得一样，重复的只算一次'],
          ['以为要"所有 $k$ 元子集都被 shatter"', 'VC = $k$ 只需要**存在一个** $k$ 元子集被 shatter（L07 p26 共线点的例子）'],
          ['只举一个失败的三元组就说 VC = 2', '要说明**所有**三元组都失败（用预筛或逐个列举）'],
          ['把列当成分类器、行当成点', '列是点，行是 dichotomy（一个分类器的输出）'],
          ['问"共几个 shattered 集"时没说空集', '写明"含空集 X 个，不含空集 X−1 个"'],
        ],
      },

      { t: 'h2', text: '8. 和课件例子连起来', id: 'links' },
      {
        t: 'deep', title: '展开详解：VC 维在 L07 里是从哪来的', hint: '理解用，考试不会让你证明',
        blocks: [
          '**为什么需要 VC 维。** L06 的泛化界里有 $\\log|\\mathcal F|$，只适用于有限个分类器。线性分类器、decision stump 有无穷多个，这个界就失效了。L07 的想法是：分类器虽然无穷多，但在 $n$ 个具体的点上，能产生的标签组合（dichotomy）最多 $2^n$ 种，数这个就够了。',
          {
            t: 'table', head: ['概念', '公式', '出处'], rows: [
              ['dichotomies on $\\mathcal X$', '$\\mathcal F(\\mathcal X)=\\{(f(x_1),\\dots,f(x_n)) : f\\in\\mathcal F\\}$', 'L07 p17'],
              ['growth function', '$S_{\\mathcal F}(n)=\\max_{|\\mathcal X|=n}|\\mathcal F(\\mathcal X)|\\le 2^n$', 'L07 p18'],
              ['VC dimension', '$\\VC(\\mathcal F)=\\max\\{n : S_{\\mathcal F}(n)=2^n\\}$', 'L07 p23'],
              ['VC 泛化界（不是求 VC 的公式；这类表格题用不到）', '$R[\\hat f]\\le\\hat R[\\hat f]+\\sqrt{8\\,\\frac{\\VC(\\mathcal F)\\log(2n+1)+\\log(4/\\delta)}{n}}$：$R$ 真实错误率、$\\hat R$ 训练错误率、$n$ 样本数、$\\delta$ 失败概率；根号 = 两者最多差多少', 'L07 p31'],
            ],
          },
          '**课件里的三个标准结果**（简答题可能直接问）：',
          {
            t: 'ul', items: [
              'Decision stumps（一维阈值分类器）：$n$ 个点上有 $2n$ 种 dichotomy（课件已数好）。不用解方程，代几个数：$n=1$：$2=2^1$ ✓；$n=2$：$4=2^2$ ✓；$n=3$：$6<8$ ✗。所以 **VC = 2**（L07 p19、p24）。',
              '$\\mathbb R^2$ 上的线性分类器：3 个不共线的点能被 shatter；4 个点（四边形的四个角）做不到"对角同一类、相邻不同类"那种标法（常叫 XOR），一条直线切不开，所以 **VC = 3**（p25–p28）。',
              '$\\mathbb R^d$ 上的线性分类器：**VC = d + 1**（p33）。',
            ],
          },
          { t: 'viz', id: 'stump-explorer' },
          '**L07 p29 的表就是这道题的原型**：10 行、4 个点，删掉 $x_3$ 后剩下的 $(x_1,x_2,x_4)$ 去重后正好 8 种组合，所以 VC = 3。可以在上面的解题器里切换到 "L07 p29" 自己点一遍。',
        ],
      },
      {
        t: 'quiz', items: [
          {
            q: '一张 dichotomy 表有 12 个不同的行，VC 维最多是多少？', type: 'num', answer: 3,
            explain: '$2^3=8\\le12<16=2^4$，所以最多 shatter 3 个点：$\\VC\\le\\lfloor\\log_2 12\\rfloor=3$。',
          },
          {
            q: '$\\{x_1,x_2,x_3\\}$ 被 shatter 了。下面哪个结论**一定**成立？',
            options: ['$\\{x_1,x_2\\}$ 被 shatter', '$\\{x_1,x_2,x_3,x_4\\}$ 被 shatter', '所有 3 元子集都被 shatter', '表至少有 16 行'],
            answer: 0, explain: '被 shatter 的集合的子集也被 shatter（向下封闭）。其余三项都不一定。',
          },
          {
            q: '$\\mathbb R^2$ 上的线性分类器，VC 维是多少？', type: 'num', answer: 3,
            explain: 'L07 p28、p33：$\\mathbb R^d$ 上线性分类器的 VC 维是 $d+1$。',
          },
          {
            q: '为什么 3 个**共线**的点不能被 $\\mathbb R^2$ 上的线性分类器 shatter，但 VC 维仍然是 3？', type: 'show',
            answerText: 'VC 维只要求**存在**一个 3 点集被 shatter。',
            explain: '三点共线时，直线只能在这条线上切一刀：一侧一类、另一侧另一类。"两端正、中间负"（$+,-,+$）和反过来（$-,+,-$）都做不到，8 种里只剩 6 种（L07 p26）。但 3 个不共线的点能实现全部 8 种（p25），所以 $S_{\\mathcal F}(3)=8$，VC 维取的是最好的摆放方式。',
          },
        ],
      },
    ],
  });
})(window);
