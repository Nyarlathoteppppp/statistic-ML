/* T1 — VC dimension from a table of dichotomies (L07 p17–p29). */
(function (root) {
  'use strict';
  const T = String.raw;

  root.SML.content.add({
    id: 'T01',
    eyebrow: '题型 T1 · 2020 年起每年都考 · 8–16 分',
    title: 'VC 维：从 dichotomy 表求 VC 维',
    en: 'VC dimension from a table of dichotomies',
    chips: [
      { text: 'L07 p17–p29', href: '#/L07', cls: 'src' },
      { text: '2026 practice Q3', cls: 'hot' }, { text: '2025 practice Q3', cls: 'hot' }, { text: '2021 exam Q16', cls: 'hot' },
      { text: '2022 exam Q3', cls: 'hot' }, { text: '函数族 VC（2020–2023）', href: '#/T01/family', cls: 'hot' },
    ],
    lead: '这是全卷**最机械**的题：给一张 0/1 表，按固定步骤删列、去重、数行即可。练熟以后 5 分钟内做完。\n\n近几年同一大题后面常跟 (b)(c)：给一个用公式定义的分类器族，求它的 VC 维并说明理由，做法见 [第 6 节](#/T01/family)。',
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
          ['**shattered**', '$S$ 表示选出的点集，$|S|$ 表示其中的点数。$S$ 被 shatter（打散）⇔ 只看 $S$ 的列并去掉重复行后，$2^{|S|}$ 种 0/1 组合**全部**出现；⇔ 表示「当且仅当」。每个点有 0、1 两种标签，所以 $k$ 个点共有 $2^k$ 种组合，其中 $k=|S|$。（p23）', '这些点怎么标都做得到'],
          ['**VC dimension**', '能被 shatter 的**最大**子集的大小（p23）', '分类器族最多能"随意摆布"几个点'],
        ],
      },
      {
        t: 'good', title: '两个推论，直接用来省时间',
        md: T`- **上界**：设整表去重后有 $m$ 行。shatter $k$ 个点至少要 $2^k$ 个不同的行，所以 $\VC\le\lfloor\log_2 m\rfloor$；这里 $\VC$ 简写这个族的 VC 维。$\log_2$ 是以 2 为底的对数，$\lfloor u\rfloor$ 表示不超过数值 $u$ 的最大整数。不算对数也可以：上界就是满足 $2^k\le m$ 的最大整数 $k$。因为 $2^3=8$、$2^4=16$，8 行或 10 行都只能给出 $\VC\le3$。
- **向下封闭**：被 shatter 的集合，它的每个子集也被 shatter：对子集随便指定标签，再给其余点随便补上标签；大集合能实现补全后的标注，自然也实现了子集要的标注。因此，若有更大的集合被 shatter，它里面的每个 $k$ 元子集也必须被 shatter。所以只要**所有** $k$ 元子集都不被 shatter，更大的子集就不用查了。`,
      },

      { t: 'h2', text: '3. 解题步骤', id: 'steps' },
      {
        t: 'steps', items: [
          T`**数行，定上界。** 去掉完全相同的整行后剩 $m$ 行，则 $\VC\le\lfloor\log_2 m\rfloor$。从 $k=\lfloor\log_2 m\rfloor$ 开始试。`,
          T`**按列预筛（省掉大部分组合）。** 一个点能出现在大小为 $k$ 的 shattered 集里，它那一列至少要有 $2^{k-1}$ 个 0 和 $2^{k-1}$ 个 1。**为什么**：$k$ 个点的 $2^k$ 种组合里，这个点取 0 的正好一半（其余 $k-1$ 个点任意组合，共 $2^{k-1}$ 种），每种至少要出现在一行里。例：2026 卷 $x_5$ 只有 1 个 0，所以 $x_5$ 不可能在任何 shattered pair（被打散的二点集）里。两列恰好互补（如 2021 卷每一行都有 $x_6=1-x_4$，即一个是 0 另一个就是 1）时，这两点只能出现 01 和 10，永远凑不出 00 和 11，所以不能同时出现在 shattered 集里。`,
          T`**对剩下的 $k$ 元子集逐个检查：删列 → 去重 → 数。** 不同的组合数 $=2^k$ 就是 shattered。写出缺了哪个组合，就证明了"不是"。`,
          T`**找到一个 shattered 的 $k$ 元子集，且所有 $(k+1)$ 元子集都不行**，则 $\VC=k$。如果大小为 $k$ 的子集**一个都**不被 shatter，就把 $k$ 减 1 再查——不能直接把上界 $\lfloor\log_2m\rfloor$ 当答案。`,
          T`**写答案**：VC 值 + 一个 shattered 集 + 列出它的 $2^k$ 个组合 + 一句话说明更大的集合为什么不行。`,
        ],
      },
      {
        t: 'note', md: '下面是第 5 节 2026 Q3 那张 8 行表的答案写法示范（不是另一道题）。那张表的 $x_5$ 列是 $1,1,0,1,1,1,1,1$，只有第 3 行是 0，所以任何至少含两个点且含 $x_5$ 的集合都凑不齐全部标注；只含 $x_5$ 的单点集仍可被打散，因为该列有 0 也有 1。',
      },
      {
        t: 'exam', md: T`$\mathrm{VC}(\mathcal G)=2$. The set $\{x_1,x_3\}$ is shattered: restricted to $(x_1,x_3)$ the dichotomies give $00,01,10,11$, i.e. all $2^2$ labellings. No set of 3 points is shattered: any triple containing $x_5$ fails because $x_5=0$ in only one row, and each of the remaining triples $\{x_1,x_2,x_3\},\{x_1,x_2,x_4\},\{x_1,x_3,x_4\},\{x_2,x_3,x_4\}$ realises fewer than $2^3=8$ distinct patterns. Hence no larger set is shattered and $\mathrm{VC}(\mathcal G)=2$.`,
      },

      { t: 'h2', text: '4. 交互解题器', id: 'solver' },
      '点表格格子可以改 0/1；点下面的子集按钮，看它删列、去重后缺哪些组合。可以切换到三道真题的表。',
      { t: 'viz', id: 'vc-solver', opts: { preset: 'EX2026Q3' } },

      { t: 'h2', text: '5. 真题全解', id: 'past' },
      {
        t: 'past', src: '2026 S2 practice Q3（= 2025 S1 practice Q3 = 2023 S1 Q3(a)）', marks: 8, topic: 'L07 p29',
        q: 'Consider an input domain of five points $x_1,\\dots,x_5$, and binary classifier family $\\mathcal G$ defined by the table of dichotomies given below. Calculate $\\mathrm{VC}(\\mathcal G)$ and show a corresponding shattered set of points.',
        qzh: T`考虑一个由五个点 $x_1,\dots,x_5$ 组成的输入域（input domain），以及由下表中的二分（dichotomy）定义的二元分类器族（binary classifier family）$\mathcal G$。计算 $\mathrm{VC}(\mathcal G)$，并给出一个相应的被打散的点集（shattered set）。`,
        azh: T`$\mathrm{VC}(\mathcal G)=2$。集合 $\{x_1,x_3\}$ 被打散（shattered）：只看 $(x_1,x_3)$ 时，这些二分给出 $00,01,10,11$，即全部 $2^2$ 种标注（labelling）。没有任何 3 个点的集合被打散：任何含 $x_5$ 的三元组都不行，因为 $x_5=0$ 只出现在一行；其余的三元组 $\{x_1,x_2,x_3\},\{x_1,x_2,x_4\},\{x_1,x_3,x_4\},\{x_2,x_3,x_4\}$ 各自实现的不同模式都少于 $2^3=8$ 种。因此更大的集合也不会被打散，$\mathrm{VC}(\mathcal G)=2$。`,
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
        qzh: T`考虑一个由六个点 $x_1,\dots,x_6$ 组成的输入域（input domain），以及由下表中的二分（dichotomy）定义的二元分类器族 $\mathcal F$。(a) 计算 $\mathrm{VC}(\mathcal F)$，并给出一个相应的被打散的点集（shattered set）。(b) 列出所有被打散的点集。总共有多少个？`,
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
          T`先确认 3 元集没有漏：$x_2$ 列只有 2 个 1，$x_5$ 列只有 2 个 0，都达不到 3 元集预筛所需的各 4 个。候选只剩 $x_1,x_3,x_4,x_6$；含 $x_4,x_6$ 的又不行，所以只剩上面已核对的两组三元组。`,
          {
            t: 'table', head: ['大小', '集合', '个数'], rows: [
              ['0', '$\\varnothing$ 表示空集（没有点）。删掉所有列后，每行都成为同一个空标注；去重剩 1 种，等于 $2^0$，所以算 shattered。', '1'],
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

      {
        t: 'past', src: '2022 S1 exam Q3(a)', marks: 8, topic: 'L07 p29',
        q: T`Consider an input domain of five points $x_1,\dots,x_5$, and binary classifier family $F$ defined by the table of dichotomies given below. Calculate $\mathrm{VC}(F)$ and show a corresponding shattered set of points.`,
        qzh: T`考虑一个由五个点 $x_1,\dots,x_5$ 组成的输入域（input domain），以及由下表中的二分（dichotomy）定义的二元分类器族 $F$。计算 $\mathrm{VC}(F)$，并给出一个相应的被打散的点集（shattered set）。`,
        azh: T`$\mathrm{VC}(F)=3$。集合 $\{x_2,x_3,x_4\}$ 被打散（shattered）：只看 $(x_2,x_3,x_4)$ 时，8 行依次给出 $000,010,101,110,001,011,100,111$，即全部 $2^3=8$ 种标注（labelling）。任何 4 个点的集合都不能被打散，因为那需要 $2^4=16$ 种不同的二分，而表里只有 8 行。因此 $\mathrm{VC}(F)=3$。`,
        blocks: [
          {
            t: 'table', cls: 'mono compact', head: ['$x_1$', '$x_2$', '$x_3$', '$x_4$', '$x_5$'],
            rows: ['00001', '10101', '01010', '01101', '00010', '10111', '11001', '01111'].map((r) => r.split('')),
          },
          { t: 'note', md: '转载网页上这张表的表头缺图；表中的 0/1 取自转载页的文字，与学生笔记里的配图逐格一致。' },
        ],
        sol: [
          { t: 'h4', text: '第 1 步：上界' },
          '8 行，各不相同 ⇒ $\\VC\\le\\log_2 8=3$。先试 3。',
          { t: 'h4', text: '第 2 步：按列预筛' },
          {
            t: 'table', head: ['列', '0 的个数', '1 的个数', '能否进 3 元 shattered 集（各需 ≥4）'], rows: [
              ['$x_1$', '5', '3', '否（1 只有 3 个）'], ['$x_2$', '4', '4', '可能'], ['$x_3$', '4', '4', '可能'],
              ['$x_4$', '4', '4', '可能'], ['$x_5$', '2', '6', '否（0 只有 2 个）'],
            ],
          },
          '只剩 $x_2,x_3,x_4$ 三列满足条件，所以 3 元候选只有一个：$\\{x_2,x_3,x_4\\}$。',
          { t: 'h4', text: '第 3 步：检查这个候选' },
          {
            t: 'table', cls: 'mono compact', head: ['行', '$(x_2,x_3,x_4)$'],
            rows: [['1', '000'], ['2', '010'], ['3', '101'], ['4', '110'], ['5', '001'], ['6', '011'], ['7', '100'], ['8', '111']],
          },
          '8 行给出 8 种不同的组合，$2^3$ 种全齐 ⇒ $\\{x_2,x_3,x_4\\}$ 被 shatter。',
          {
            t: 'good', title: '答案',
            md: '$\\VC(F)=3$，shattered set 是 $\\{x_2,x_3,x_4\\}$（也是这张表唯一的 3 元 shattered 集）。4 个点要 16 种组合，8 行不够，所以不会更大。',
          },
          {
            t: 'exam', md: T`$\mathrm{VC}(F)=3$. The set $\{x_2,x_3,x_4\}$ is shattered: restricted to $(x_2,x_3,x_4)$ the eight rows give $000,010,101,110,001,011,100,111$, i.e. all $2^3=8$ labellings. No set of 4 points can be shattered, because that would need $2^4=16$ distinct dichotomies but the table has only 8 rows. Hence $\mathrm{VC}(F)=3$.`,
          },
        ],
      },
      {
        t: 'past', src: '2020 Q7(a)（据学生笔记）', topic: 'L07 p29',
        q: T`Consider an input domain of five points $x_1,\dots,x_5$, and binary classifier family $F$ defined by the table of dichotomies given below. Calculate $\mathrm{VC}(F)$ and show a corresponding shattered set of points.`,
        qzh: T`考虑一个由五个点 $x_1,\dots,x_5$ 组成的输入域（input domain），以及由下表中的二分（dichotomy）定义的二元分类器族 $F$。计算 $\mathrm{VC}(F)$，并给出一个相应的被打散的点集（shattered set）。`,
        azh: T`$\mathrm{VC}(F)=3$。集合 $\{x_2,x_4,x_5\}$ 被打散（shattered）：只看 $(x_2,x_4,x_5)$ 时，8 行依次给出 $000,001,010,011,100,101,110,111$，即全部 $2^3=8$ 种标注（labelling）。任何 4 个点的集合都不能被打散，因为那需要 16 种不同的二分，而表里只有 8 行。因此 $\mathrm{VC}(F)=3$。`,
        blocks: [
          {
            t: 'table', cls: 'mono compact', head: ['$x_1$', '$x_2$', '$x_3$', '$x_4$', '$x_5$'],
            rows: ['10100', '00001', '00010', '00011', '11000', '01101', '01010', '01011'].map((r) => r.split('')),
          },
          { t: 'note', md: '图来自学生笔记，未与原卷核对。' },
        ],
        sol: [
          { t: 'h4', text: '第 1 步：上界' },
          '8 行，各不相同 ⇒ $\\VC\\le3$。',
          { t: 'h4', text: '第 2 步：按列预筛' },
          {
            t: 'table', head: ['列', '0 的个数', '1 的个数', '能否进 3 元 shattered 集（各需 ≥4）'], rows: [
              ['$x_1$', '6', '2', '否'], ['$x_2$', '4', '4', '可能'], ['$x_3$', '6', '2', '否'],
              ['$x_4$', '4', '4', '可能'], ['$x_5$', '4', '4', '可能'],
            ],
          },
          '3 元候选只有 $\\{x_2,x_4,x_5\\}$。',
          { t: 'h4', text: '第 3 步：检查这个候选' },
          {
            t: 'table', cls: 'mono compact', head: ['行', '$(x_2,x_4,x_5)$'],
            rows: [['1', '000'], ['2', '001'], ['3', '010'], ['4', '011'], ['5', '100'], ['6', '101'], ['7', '110'], ['8', '111']],
          },
          '8 行正好是 000 到 111 按顺序排下来，8 种全齐 ⇒ $\\{x_2,x_4,x_5\\}$ 被 shatter。',
          {
            t: 'good', title: '答案',
            md: '$\\VC(F)=3$，shattered set 是 $\\{x_2,x_4,x_5\\}$（也是唯一的 3 元 shattered 集）。和上一题一样：8 行凑不出 4 个点需要的 16 种组合。',
          },
          {
            t: 'exam', md: T`$\mathrm{VC}(F)=3$. The set $\{x_2,x_4,x_5\}$ is shattered: restricted to $(x_2,x_4,x_5)$ the eight rows give $000,001,010,011,100,101,110,111$, i.e. all $2^3=8$ labellings. No set of 4 points can be shattered, because that would need $2^4=16$ distinct dichotomies but the table has only 8 rows. Hence $\mathrm{VC}(F)=3$.`,
          },
        ],
      },

      { t: 'h2', text: '6. VC of a classifier family（给出函数族求 VC 维）', id: 'family' },
      T`2020–2023 年的真题里，VC 表那一问后面常跟着 (b)(c)：不给表，而是用公式定义一个分类器族（classifier family），问它的 VC 维 "and why"，每问约 4 分。做法和 [c23](#/c23) 证明"直线 VC = 3""矩形 VC = 4"一样：**先证下界，再证上界**。`,
      {
        t: 'note', title: '为什么今年很可能考矩形',
        md: '2026 practice Q3 的表和 2023 S1 Q3(a) 的表逐行相同（第 5 节第一题）。2023 S1 同一大题的 (b)(c) 就是下面第二道真题：矩形分类器族（rectangle classifiers）的 VC 维和上界证明。照这个搭配，今年 Q3 后面跟一问"矩形 VC"的可能性很高。',
      },
      {
        t: 'steps', items: [
          T`**读懂这个族。** 用一句中文说出"一个分类器在哪些点输出 1（或 $+1$）"，在数轴或平面上画一个例子。参数的范围也要看清（如阈值位置 $t$ 被限制在 $[0,1]$ 内；区间左、右端点 $a,b$ 要满足 $a<b$）。`,
          T`**猜 $d$。** $d$ 表示准备证明的 VC 维候选值。从 1 个点、2 个点开始试，寻找能打散的点集，并观察增加点数后哪些标注做不到。某一组点失败只能帮助猜答案，不能证明上界；第 4 步还要说明任意一组 $d+1$ 个点都失败。`,
          T`**下界 $\VC\ge d$：举一组。** 写出一组具体的 $d$ 个点（给坐标），对它的 $2^d$ 种标注逐一给出能实现它的分类器（写出参数值）。只要存在这样一组就够，不必对所有点集成立。`,
          T`**上界 $\VC<d+1$：对任意一组。** 任取 $d+1$ 个点（位置不能自己挑），构造一种标注，说明族里没有分类器能做出来。常用理由：标签只能"先 0 后 1"（阈值）、矩形必须包含所有正类点的外接框（包住这些点的最小轴对齐矩形，即边平行于坐标轴的矩形）、正类最多 $k$ 个。`,
          T`**写答案。** $\VC=d$ + 下界的点集和实现方式 + 上界那种做不到的标注及理由。对于没有指定几何坐标的族，也可直接用定义论证「$S$ 被这个族 shatter ⇔ ……」。后文的补族 $\bar F$，是把族 $F$ 中每个 0/1 分类器 $f$ 换成 $1-f$，即交换它在每个点输出的 0 和 1。乘积族则是在两个不相交的输入域上各任选一个分类器，再把输出拼接起来，所有配对都允许。`,
        ],
      },
      {
        t: 'table', head: ['分类器族', 'VC', '下界：哪组点能 shatter', '上界：$d+1$ 个点时做不到的标注', '出处'], rows: [
          ['阈值函数 $I_t$：输入 $x\\in[0,1]$，阈值 $t\\in[0,1]$；$I_t(x)=1$ 当且仅当（iff）$x\\ge t$，否则为 0', '1', '任一点 $x<1$', '$x_1<x_2$ 标 $(1,0)$', '2022 S1 Q3(b)'],
          ['$I_t$ 再加上 $1-I_t$（后者把 0/1 互换）；合称一维 decision stump（决策树桩：只用一个阈值，左右哪侧输出 1 都可选）', '2', '任两点', '$x_1<x_2<x_3$ 标 $(1,0,1)$', '2022 S1 Q3(c)，L07 p24'],
          ['轴对齐矩形（axis-aligned rectangle）', '4', '菱形 4 点', '最左、最右、最上、最下标 $+$，另一点标 $-$', '2023 S1 Q3(b)(c)，[c23](#/c23)'],
          ['补族 $\\bar F=\\{1-f: f\\in F\\}$', '$\\VC(F)$', '与 $F$ 相同', '与 $F$ 相同', '2022 S2 Q5(a)'],
          ['$F_{n,k}$：输入域有 $n$ 个点，$k$ 是允许输出 $+1$ 的最多点数（整数且 $0\\le k<n$）；族中包含所有满足此限制的分类器，其余点输出 $-1$', '$k$', '任 $k$ 个点', '$k+1$ 个点全标 $+1$', '2022 S2 Q5(b)'],
          ['乘积族 $H$（$F$ 管前 $n$ 点、$G$ 管后 $m$ 点）', '$\\VC(F)+\\VC(G)$', '两边 shattered 集的并', '拆成两半，分别用 $F$、$G$ 的上界', '2020 Q7(b)'],
          ['$\\mathbb R^d$ 中含可调截距的线性分类器（二维用直线、三维用平面把两侧分成两类）；$\\mathbb R^d$ 表示由 $d$ 个实数坐标构成的空间，此处 $d$ 是输入维数而非 VC 候选值', '$d+1$', '本表未展开一般维数的证明', '本表未展开一般维数的证明；二维情形见第 9 节', 'L07 p33'],
        ],
      },
      {
        t: 'past', src: '2022 S1 exam Q3(b)(c)', marks: '4 + 4', topic: 'L07 p23–p24',
        q: T`(b) For any $t\in[0,1]$, define the function $I_t$ on $x\in[0,1]$ to be $I_t(x)=1$ if $x\ge t$, and $I_t(x)=0$ otherwise. What is the Vapnik-Chervonenkis dimension of the family $F=\{I_t: t\in[0,1]\}$ and why? (c) Referring to the functions defined in the previous part, what is the Vapnik-Chervonenkis dimension of family $F'=F\cup\{1-I_t: t\in[0,1]\}$ and why? (Hint: function $1-I_t$ outputs 0 on inputs $x\ge t$, and 1 otherwise.)`,
        qzh: T`(b) 对任意 $t\in[0,1]$，在 $x\in[0,1]$ 上定义阈值函数（threshold function）$I_t$：$x\ge t$ 时 $I_t(x)=1$，否则为 0。函数族 $F=\{I_t: t\in[0,1]\}$ 的 VC 维（Vapnik-Chervonenkis dimension）是多少？为什么？(c) 沿用上一问的函数，函数族 $F'=F\cup\{1-I_t: t\in[0,1]\}$ 的 VC 维是多少？为什么？（提示：$1-I_t$ 在 $x\ge t$ 时输出 0，否则输出 1。）`,
        azh: T`(b) $\mathrm{VC}(F)=1$。下界：单个点 $x=0.5$ 被打散（shattered），因为 $I_{0.2}(0.5)=1$、$I_{0.8}(0.5)=0$。上界：任取两点 $x_1<x_2$，标注 $I_t(x_1)=1,\ I_t(x_2)=0$ 需要 $x_2<t\le x_1$，与 $x_1<x_2$ 矛盾；每个 $I_t$ 从左到右给出的标签都是"若干个 0 后接若干个 1"。所以没有两点集被打散。(c) $\mathrm{VC}(F')=2$。下界：$\{0.25,0.75\}$ 被打散：$(0,0)$ 用 $I_{0.9}$，$(0,1)$ 用 $I_{0.5}$，$(1,1)$ 用 $I_0$，$(1,0)$ 用 $1-I_{0.5}$。上界：对任意三点 $x_1<x_2<x_3$，标注 $(1,0,1)$ 做不出来。每个 $I_t$ 给出的标注是非递减的（先 0 后 1），每个 $1-I_t$ 给出的是非递增的（先 1 后 0），而 $(1,0,1)$ 两者都不是。所以没有三点集被打散。`,
        blocks: [{ t: 'note', md: T`转载网页上 $I_t$ 的定义式缺图，这里的定义式来自学生笔记，未与原卷核对；它与 (c) 的提示一致。` }],
        sol: [
          { t: 'h4', text: '(b) 第 1 步：读懂 $I_t$' },
          T`$I_t$ 在 $t$ 及其右边输出 1，左边输出 0。把点从左到右排好，$I_t$ 给出的标签一定是"先一串 0、再一串 1"，比如 $0,0,1,1$；**1 的右边不可能再出现 0**。`,
          { t: 'h4', text: '(b) 第 2 步：下界，1 个点能 shatter' },
          T`取 $x=0.5$。$t=0.2$ 时 $I_t(0.5)=1$；$t=0.8$ 时 $I_t(0.5)=0$。两种标注都做得到，所以 $\{0.5\}$ 被 shatter，$\VC(F)\ge1$。（不要取 $x=1$：$t$ 最大只能是 1，$I_t(1)=1$ 对每个 $t$ 都成立，做不出 0。）`,
          { t: 'h4', text: '(b) 第 3 步：上界，任意 2 个点都不行' },
          T`任取两点 $x_1<x_2$，按 $t$ 落在哪里，列出能做到的标注：`,
          {
            t: 'table', head: ['$t$ 的位置', '$(I_t(x_1),I_t(x_2))$'], rows: [
              ['$t\\le x_1$', '$(1,1)$'], ['$x_1<t\\le x_2$', '$(0,1)$'], ['$t>x_2$', '$(0,0)$'], ['找不到这样的 $t$', '$(1,0)$ ✗'],
            ],
          },
          T`$(1,0)$ 要求 $x_1\ge t$ 且 $x_2<t$，即 $x_2<t\le x_1$，和 $x_1<x_2$ 矛盾。所以 $\VC(F)=1$。`,
          {
            t: 'exam', md: T`(b) $\mathrm{VC}(F)=1$. Lower bound: the single point $x=0.5$ is shattered, since $I_{0.2}(0.5)=1$ and $I_{0.8}(0.5)=0$. Upper bound: take any two points $x_1<x_2$. The labelling $I_t(x_1)=1,\ I_t(x_2)=0$ would need $x_2<t\le x_1$, which contradicts $x_1<x_2$; every $I_t$ labels the points, from left to right, as some 0s followed by some 1s. So no set of two points is shattered.`,
          },
          { t: 'h4', text: '(c) 第 1 步：多出来的 $1-I_t$ 能做什么' },
          T`$1-I_t$ 正好反过来：左边 1、右边 0，标签是"先一串 1、再一串 0"。$F'$ 合起来就是 L07 p11 的一维 decision stump（阈值哪一侧是 1 都可以），L07 p24 已经数过它的 VC 维是 2。考试时要自己写出下面的证明。`,
          { t: 'h4', text: '(c) 第 2 步：下界，2 个点能 shatter' },
          {
            t: 'table', head: ['$(x_1,x_2)=(0.25,0.75)$ 要的标注', '用哪个分类器'], rows: [
              ['$(0,0)$', '$I_{0.9}$'], ['$(0,1)$', '$I_{0.5}$'], ['$(1,1)$', '$I_{0}$'], ['$(1,0)$', '$1-I_{0.5}$（$F$ 里缺的正是这一种）'],
            ],
          },
          { t: 'h4', text: '(c) 第 3 步：上界，任意 3 个点都不行' },
          T`任取三点 $x_1<x_2<x_3$，看标注 $(1,0,1)$：$I_t$ 的标签里 1 后面不会再有 0，$1-I_t$ 的标签里 0 后面不会再有 1。$(1,0,1)$ 两样都犯了，族里没有分类器能做出它（$(0,1,0)$ 同理也做不到）。所以 $\VC(F')=2$。`,
          {
            t: 'exam', md: T`(c) $\mathrm{VC}(F')=2$. Lower bound: the points $\{0.25,0.75\}$ are shattered: $(0,0)$ by $I_{0.9}$, $(0,1)$ by $I_{0.5}$, $(1,1)$ by $I_0$, and $(1,0)$ by $1-I_{0.5}$. Upper bound: for any three points $x_1<x_2<x_3$, the labelling $(1,0,1)$ cannot be produced. Every $I_t$ gives a non-decreasing labelling (0s then 1s) and every $1-I_t$ a non-increasing one (1s then 0s), and $(1,0,1)$ is neither. So no set of three points is shattered.`,
          },
          { t: 'warn', md: T`常见错误：以为加了 $1-I_t$ 以后 VC 还是 1。多出来的 $1-I_t$ 正好补上了 $F$ 做不到的 $(1,0)$，2 个点的 4 种标注就齐了。` },
        ],
      },
      {
        t: 'past', src: '2023 S1 Q3(b)(c)（据学生笔记）', topic: 'L07 p23 · Worksheet 5',
        q: T`(b) In class we saw that the family of linear classifiers in $\mathbb R^2$ (the 2D plane) have VC dimension 3. This question asks you to consider VC dimension of an unrelated family of classifiers also in the plane. Consider the family $F$ of rectangle classifiers parametrised by reals $a,b,c,d$ where $a<b$ and $c<d$: for any instance $\mathbf x\in\mathbb R^2$ we have the classifier $f_{abcd}(\mathbf x)=+1$ if $a\le x_1\le b$ and $c\le x_2\le d$, and $f_{abcd}(\mathbf x)=-1$ otherwise; or in words, a rectangle classifier predicts $+1$ if the instance lies within the rectangle, and $-1$ if the instance falls outside the rectangle. What is the VC dimension of $F$, and why? (c) If you answered some number $d$ to Part (b), prove that $\mathrm{VC}(F)<d+1$ in this part by arguing why there can be no set of $d+1$ points that can be labelled in all ways by classifiers in $F$.`,
        qzh: T`(b) 课上讲过，$\mathbb R^2$（二维平面）中线性分类器族的 VC 维是 3。这一问考虑平面上另一个无关的分类器族：矩形分类器族（rectangle classifiers）$F$，由实数 $a,b,c,d$（$a<b$，$c<d$）参数化：对任意输入点 $\mathbf x=(x_1,x_2)\in\mathbb R^2$，这里 $x_1$ 是横坐标、$x_2$ 是纵坐标，不再表示表格中的第 1、2 个样本点。$a,b$ 是矩形左、右边界，$c,d$ 是下、上边界。若 $a\le x_1\le b$ 且 $c\le x_2\le d$ 则 $f_{abcd}(\mathbf x)=+1$，否则为 $-1$。也就是说，点落在矩形内预测 $+1$，落在矩形外预测 $-1$。$F$ 的 VC 维是多少？为什么？(c) 用 $d$ 暂记 (b) 中答出的 VC 维（这里的 $d$ 不是上边界参数 $d$），请在这一问证明 $\mathrm{VC}(F)<d+1$：说明为什么不存在 $d+1$ 个点能被 $F$ 中的分类器以所有方式标注。`,
        azh: T`(b) $\mathrm{VC}(F)=4$。把 4 个点摆成菱形：$(0,1),(1,0),(2,1),(1,2)$（最左、最下、最右、最上）。任何至少有一个正类点的标注，取正类点的外接框（bounding box）并稍微放大，它不含任何负类点，因为每个点都在自己的方向上最突出；全为负类时把矩形放到远离这些点的地方。所以 16 种标注都能实现，这 4 个点被打散（shattered）。(c) 任取 5 个点。把最左、最右、最上、最下的点（最多 4 个）标为 $+$，剩下的某个点标为 $-$。任何包含这些正类点的矩形都包含它们的外接框，而这个框就是全部 5 个点的外接框，所以也包含那个负类点。这种标注无法实现，因此没有 5 个点的集合被打散，$\mathrm{VC}(F)<5$。`,
        blocks: [{ t: 'note', md: '题目和公式来自学生笔记，未与原卷核对；笔记里 (c) 写的是 "Part (a)"，按上下文应指 (b)。2021 S2 Q4 也是同一个矩形族（学生笔记里只留下公式图，没有题干），按这道题准备即可。' }],
        sol: [
          T`这道题和 [c23](#/c23) 第 ③ 段（Worksheet 5）是同一个矩形族，结论 VC = 4，证明同样分两步。`,
          { t: 'h4', text: '(b) 下界：菱形 4 点能 shatter' },
          T`把 4 个点摆成菱形：左 $(0,1)$、下 $(1,0)$、右 $(2,1)$、上 $(1,2)$。任给一种标注：`,
          {
            t: 'ul', items: [
              T`至少有一个 $+$：取所有 $+$ 点的外接框（bounding box，包住它们的最小轴对齐矩形），四条边各往外放大 0.1（这样也保证 $a<b$、$c<d$）。每个点都在自己的方向上最突出，所以这个框碰不到任何 $-$ 点。例：左、右标 $+$ 时，外接框的横坐标范围是 $[0,2]$，纵坐标固定为 1。四边各外扩 0.1 后，框是 $[-0.1,2.1]\times[0.9,1.1]$：横坐标在第一个区间内，纵坐标在第二个区间内；这里 $\times$ 连接两个坐标范围，不是把区间相乘。上 $(1,2)$、下 $(1,0)$ 都在框外。`,
              T`全是 $-$：把矩形放到远处，例如 $[10,11]\times[10,11]$。`,
            ],
          },
          T`16 种标注都做得到 ⇒ $\VC(F)\ge4$。不是任意 4 点都行：正方形的 4 个角就不行，对角两点标 $+$ 时，框住它们的矩形就是整个正方形。但下界**只要存在一组**。`,
          { t: 'h4', text: '(c) 上界：任意 5 个点都不能 shatter' },
          T`任取 5 个点。挑出最左、最右、最上、最下的点（有并列就各挑一个），最多 4 个，标 $+$；剩下的点里至少还有一个，标 $-$。任何包含这几个 $+$ 点的矩形，一定包含它们的外接框；这个框的左、右、上、下边界正好是全部 5 个点的边界，所以框里装着全部 5 个点，也装着那个 $-$ 点。这种标注做不到 ⇒ 没有 5 点集被 shatter，$\VC(F)<5$。`,
          { t: 'html', html: '<div class="graph-row">' +
            '<figure class="graph-fig"><svg class="graph" viewBox="0 0 200 200" role="img" aria-label="菱形四点，一个矩形框住左、上两个正类点">' +
            '<rect class="edge fill" x="27" y="27" width="86" height="86" rx="3"/>' +
            [[40, 100, '+'], [100, 40, '+'], [160, 100, '−'], [100, 160, '−']].map(([x, y, l]) => '<g class="node' + (l === '+' ? ' hl' : '') + '"><circle cx="' + x + '" cy="' + y + '" r="13"/><text x="' + x + '" y="' + y + '">' + l + '</text></g>').join('') +
            '</svg><figcaption>菱形 4 点：任一种标注，框住 + 点的矩形都碰不到 − 点（图为其中一种）。</figcaption></figure>' +
            '<figure class="graph-fig"><svg class="graph" viewBox="0 0 200 200" role="img" aria-label="五个点，框住四个极值点的矩形也框住了中间的负类点">' +
            '<rect class="edge fill" x="17" y="17" width="166" height="166" rx="3"/>' +
            [[30, 100, '+'], [170, 100, '+'], [100, 30, '+'], [100, 170, '+'], [112, 112, '−']].map(([x, y, l]) => '<g class="node' + (l === '+' ? ' hl' : ' q') + '"><circle cx="' + x + '" cy="' + y + '" r="13"/><text x="' + x + '" y="' + y + '">' + l + '</text></g>').join('') +
            '</svg><figcaption>任 5 点：最左、最右、最上、最下标 +，剩下的标 −。框住 4 个 + 的矩形必然也框住 −。</figcaption></figure></div>' },
          {
            t: 'exam', md: T`(b) $\mathrm{VC}(F)=4$. Place 4 points in a diamond: $(0,1),(1,0),(2,1),(1,2)$ (leftmost, bottom, rightmost, top). For any labelling with at least one positive point, the bounding box of the positive points, slightly enlarged, contains no negative point, because each point is extreme in its own direction; for the all-negative labelling, put the rectangle away from the points. So all 16 labellings are realised and these 4 points are shattered. (c) Take any 5 points. Label the leftmost, rightmost, topmost and bottommost points $+$ (at most 4 points) and one of the remaining points $-$. Any rectangle containing the positive points contains their bounding box, which is the bounding box of all 5 points, so it also contains the negative point. This labelling cannot be realised, so no set of 5 points is shattered and $\mathrm{VC}(F)<5$.`,
          },
        ],
      },
      {
        t: 'past', src: '2022 S2 Q5(a)(b)（据学生笔记）', topic: 'L07 p23',
        q: T`(a) Consider any binary classifier family $F$ of classifiers that output labels in $\{0,1\}$. For any classifier $f\in F$ define its complementary classifier as $\bar f=1-f$. That is, for any input $x$, $\bar f(x)=1-f(x)$, which is 0 if $f(x)=1$ and 1 if $f(x)=0$. Then define a new family $\bar F$ as being made up of all the complementary classifiers of family $F$. That is, $\bar F=\{\bar f: f\in F\}$. How are $\mathrm{VC}(F)$ and $\mathrm{VC}(\bar F)$ related, and why? (b) Consider any finite input domain $\mathcal X=\{x_1,\dots,x_n\}$ and a family of binary classifiers $F_{n,k}$ containing all classifiers that output $+1$ on at most $k<n$ inputs from $\mathcal X$. That is, this family contains: the classifier outputting all $-1$; the $n$ classifiers outputting $+1$ on only one input and otherwise $-1$; and so on up to classifiers outputting $+1$ on $k$ inputs and $-1$ on $n-k$ inputs. What is the VC dimension of this family for general $n$ and $k<n$? Why?`,
        qzh: T`(a) 考虑任意一个输出标签为 $\{0,1\}$ 的二元分类器族 $F$。对每个 $f\in F$，定义它的互补分类器（complementary classifier）$\bar f=1-f$：对任意输入 $x$，$\bar f(x)=1-f(x)$，即 $f(x)=1$ 时为 0，$f(x)=0$ 时为 1。再定义新族 $\bar F=\{\bar f: f\in F\}$。$\mathrm{VC}(F)$ 和 $\mathrm{VC}(\bar F)$ 有什么关系？为什么？(b) 考虑有限输入域 $\mathcal X=\{x_1,\dots,x_n\}$，以及分类器族 $F_{n,k}$：它包含所有在 $\mathcal X$ 中至多 $k<n$ 个输入上输出 $+1$ 的分类器，即全输出 $-1$ 的那个、只在一个输入上输出 $+1$ 的 $n$ 个、……，一直到在 $k$ 个输入上输出 $+1$、其余 $n-k$ 个输出 $-1$ 的分类器。对一般的 $n$ 和 $k<n$，这个族的 VC 维是多少？为什么？`,
        azh: T`(a) $\mathrm{VC}(\bar F)=\mathrm{VC}(F)$。对任意点集 $S$，$\bar F$ 在 $S$ 上的二分正好是 $F$ 在 $S$ 上的二分逐位取反。取反是 $\{0,1\}^{|S|}$ 到自身的一一映射，所以 $F$ 实现 $S$ 的全部 $2^{|S|}$ 种标注，当且仅当 $\bar F$ 也实现全部。因此两个族打散（shatter）的点集完全相同，VC 维相等。(b) $\mathrm{VC}(F_{n,k})=k$。下界：任取 $k$ 个点 $S$。$S$ 的任一种标注至多有 $k$ 个正类点，所以"恰好在这些点上输出 $+1$、其他地方都输出 $-1$"的分类器属于 $F_{n,k}$；于是 $S$ 的全部 $2^k$ 种标注都能实现，$S$ 被打散。上界：任何 $k+1$ 个点的集合（因为 $k<n$，这样的集合存在）都不能全标为 $+1$，因为那需要 $k+1>k$ 个正类输出。所以没有 $k+1$ 个点的集合被打散。`,
        blocks: [{ t: 'note', md: T`题目和 $\bar f$ 的定义式来自学生笔记，未与原卷核对；(b) 在笔记里和 (a) 是同一个 Exercise，年份按 (a) 的图名推断。注意 (a) 用 0/1 标签，(b) 用 $\pm1$ 标签，两种写法等价。` }],
        sol: [
          { t: 'h4', text: '(a) 想法：逐位取反不改变"齐不齐"' },
          T`看任意一个点集 $S$。$\bar F$ 在 $S$ 上做出的标注，就是 $F$ 在 $S$ 上做出的标注**逐位取反**。例：$S=\{x_1,x_2\}$，$F$ 做出 $00,01,10,11$，则 $\bar F$ 做出 $11,10,01,00$，还是 4 种全齐。`,
          T`取反把 $2^{|S|}$ 种标注一一对应到 $2^{|S|}$ 种标注（不同的两种取反后仍然不同）。所以 $F$ 做出全部 $2^{|S|}$ 种 ⇔ $\bar F$ 也做出全部。两个族 shatter 的点集完全相同，VC 维相等。`,
          {
            t: 'exam', md: T`(a) $\mathrm{VC}(\bar F)=\mathrm{VC}(F)$. For any set of points $S$, the dichotomies of $\bar F$ on $S$ are exactly the bitwise complements of the dichotomies of $F$ on $S$. Complementing is a one-to-one map of $\{0,1\}^{|S|}$ onto itself, so $F$ realises all $2^{|S|}$ labellings of $S$ if and only if $\bar F$ does. Hence $F$ and $\bar F$ shatter exactly the same sets, and their VC dimensions are equal.`,
          },
          { t: 'h4', text: '(b) 下界：任意 $k$ 个点都能 shatter' },
          T`任取 $k$ 个点组成 $S$。$S$ 上的任一种标注，$+1$ 最多 $k$ 个。取这样一个分类器：在 $S$ 中标 $+1$ 的点上输出 $+1$，其余所有点（包括 $S$ 以外的点）输出 $-1$。它输出的 $+1$ 不超过 $k$ 个，属于 $F_{n,k}$。$2^k$ 种标注都做得到 ⇒ $\VC(F_{n,k})\ge k$。`,
          { t: 'h4', text: '(b) 上界：任意 $k+1$ 个点都不行' },
          T`因为 $k<n$，可以取出 $k+1$ 个点。标注"全部 $+1$"需要 $k+1$ 个 $+1$，超过上限 $k$，族里没有这样的分类器 ⇒ 没有 $k+1$ 点集被 shatter。所以 $\VC(F_{n,k})=k$。`,
          T`小例子：$n=3,\ k=1$。族里只有 $---$、$+--$、$-+-$、$--+$ 四个分类器。任一个点都能标 $+$ 或 $-$（VC $\ge1$）；任两个点都做不到 $++$（VC $<2$）。`,
          {
            t: 'exam', md: T`(b) $\mathrm{VC}(F_{n,k})=k$. Lower bound: take any $k$ points $S$. Any labelling of $S$ has at most $k$ positive points, so the classifier that outputs $+1$ exactly on those points and $-1$ everywhere else is in $F_{n,k}$; hence all $2^k$ labellings of $S$ are realised and $S$ is shattered. Upper bound: any set of $k+1$ points (which exists since $k<n$) cannot be labelled all $+1$, because that needs $k+1>k$ positive outputs. So no set of $k+1$ points is shattered.`,
          },
        ],
      },
      {
        t: 'past', src: '2020 Q7(b)（据学生笔记）', topic: 'L07 p23',
        q: T`Consider a family $F$ of classifiers mapping a finite domain of $n$ instances $\{x_1,\dots,x_n\}$ into binary labels $\{-1,+1\}$; and a second family $G$ of classifiers acting on a distinct domain of $m$ instances $\{x_{n+1},\dots,x_{n+m}\}$. Now define a new product family $H$ that can act on the combined domain $\{x_1,\dots,x_{n+m}\}$, where for every pair $f\in F$, $g\in G$, we define an $h\in H$ such that, for each instance $x_i$, it outputs $h(x_i)=f(x_i)$ for $1\le i\le n$, and $h(x_i)=g(x_i)$ for $n+1\le i\le n+m$. What is $\mathrm{VC}(H)$ in terms of $\mathrm{VC}(F)$, $\mathrm{VC}(G)$? (Hint: it may be helpful to think of families $F$, $G$ as becoming tables of unique dichotomies in rows, with columns being instances $x_1,\dots,x_n$ and $x_{n+1},\dots,x_{n+m}$ respectively. Then $H$ is a table with columns $x_1,\dots,x_{n+m}$.)`,
        qzh: T`分类器族 $F$ 把有限域 $\{x_1,\dots,x_n\}$ 映射到二元标签 $\{-1,+1\}$；第二个族 $G$ 作用在另一个不相交的域 $\{x_{n+1},\dots,x_{n+m}\}$ 上。定义乘积族（product family）$H$，作用在合并后的域 $\{x_1,\dots,x_{n+m}\}$ 上：对每一对 $f\in F$、$g\in G$ 定义一个 $h\in H$，在 $1\le i\le n$ 时输出 $f(x_i)$，在 $n+1\le i\le n+m$ 时输出 $g(x_i)$。用 $\mathrm{VC}(F)$、$\mathrm{VC}(G)$ 表示 $\mathrm{VC}(H)$。（提示：把 $F$、$G$ 看成不重复二分组成的表，行是二分，列分别是 $x_1,\dots,x_n$ 和 $x_{n+1},\dots,x_{n+m}$；$H$ 就是列为 $x_1,\dots,x_{n+m}$ 的表。）`,
        azh: T`$\mathrm{VC}(H)=\mathrm{VC}(F)+\mathrm{VC}(G)$。下界：设 $S_F$ 是被 $F$ 打散的 $\mathrm{VC}(F)$ 个点，$S_G$ 是被 $G$ 打散的 $\mathrm{VC}(G)$ 个点。$S_F\cup S_G$ 的任一种标注，限制到 $S_F$ 上由某个 $f$ 实现，限制到 $S_G$ 上由某个 $g$ 实现；由 $(f,g)$ 构成的 $h$ 就实现了整种标注，所以 $S_F\cup S_G$ 被 $H$ 打散。上界：若 $H$ 打散 $S$，把 $S$ 写成 $S_1\cup S_2$，$S_1\subseteq\{x_1,\dots,x_n\}$，$S_2\subseteq\{x_{n+1},\dots,x_{n+m}\}$。$S_1$ 的每种标注都能补全成 $S$ 的一种标注，由某个 $h=(f,g)$ 实现，而 $h$ 在 $S_1$ 上就等于 $f$；所以 $F$ 打散 $S_1$，$|S_1|\le\mathrm{VC}(F)$。同理 $|S_2|\le\mathrm{VC}(G)$，所以 $|S|\le\mathrm{VC}(F)+\mathrm{VC}(G)$。`,
        blocks: [{ t: 'note', md: T`题目和 $h$ 的定义式来自学生笔记，未与原卷核对。` }],
        sol: [
          T`按提示把族看成表：$F$ 的表有 $n$ 列，$G$ 的表有 $m$ 列。$H$ 的表有 $n+m$ 列，每一行 = $F$ 的某一行**拼上** $G$ 的某一行，所有配对都有。`,
          T`小例子：$F$ 在 $\{x_1,x_2\}$ 上只有两行 $00,11$（VC = 1）；$G$ 在 $\{x_3\}$ 上有 $0,1$ 两行（VC = 1）。$H$ 的 4 行是 $000,001,110,111$。只看 $(x_1,x_3)$：$00,01,10,11$ 全齐，所以 VC($H$) = 2 = 1 + 1。`,
          { t: 'h4', text: '下界：两边的 shattered 集合并起来' },
          T`设 $S_F$ 是 $F$ 能 shatter 的一组 $\VC(F)$ 个点，$S_G$ 同理。对 $S_F\cup S_G$ 的任一种标注：落在 $S_F$ 的那一半由某个 $f$ 做出，落在 $S_G$ 的那一半由某个 $g$ 做出，配对得到的 $h$ 就做出了整种标注。所以 $S_F\cup S_G$ 被 $H$ shatter，$\VC(H)\ge\VC(F)+\VC(G)$。`,
          { t: 'h4', text: '上界：把 $H$ shatter 的集合拆成两半' },
          T`设 $S$ 被 $H$ shatter，拆成 $S_1$（属于前 $n$ 个点）和 $S_2$（属于后 $m$ 个点）。对 $S_1$ 的任一种标注，随便补全成 $S$ 的一种标注，某个 $h=(f,g)$ 能做出它；$h$ 在 $S_1$ 上就是 $f$，所以 $f$ 做出了这种标注。于是 $S_1$ 被 $F$ shatter，$|S_1|\le\VC(F)$；同理 $|S_2|\le\VC(G)$。合起来 $|S|\le\VC(F)+\VC(G)$。`,
          {
            t: 'exam', md: T`$\mathrm{VC}(H)=\mathrm{VC}(F)+\mathrm{VC}(G)$. Lower bound: let $S_F$ be a set of $\mathrm{VC}(F)$ points shattered by $F$ and $S_G$ a set of $\mathrm{VC}(G)$ points shattered by $G$. Any labelling of $S_F\cup S_G$ restricts to a labelling of $S_F$, realised by some $f$, and a labelling of $S_G$, realised by some $g$; the $h$ built from $(f,g)$ realises the whole labelling, so $S_F\cup S_G$ is shattered by $H$. Upper bound: if $H$ shatters $S$, write $S=S_1\cup S_2$ with $S_1\subseteq\{x_1,\dots,x_n\}$ and $S_2\subseteq\{x_{n+1},\dots,x_{n+m}\}$. Every labelling of $S_1$ extends to a labelling of $S$, which some $h=(f,g)$ realises, and $h=f$ on $S_1$; so $F$ shatters $S_1$ and $|S_1|\le\mathrm{VC}(F)$. Likewise $|S_2|\le\mathrm{VC}(G)$, so $|S|\le\mathrm{VC}(F)+\mathrm{VC}(G)$.`,
          },
        ],
      },
      {
        t: 'quiz', items: [
          {
            id: 'fam-interval', type: 'num', answer: 2,
            q: T`一维区间分类器族：$f_{a,b}(x)=1$ 当 $a\le x\le b$，否则为 0（$a<b$ 为任意实数）。它的 VC 维是多少？`,
            explain: T`这是矩形族的一维版本。下界：取两点 $x_1<x_2$。$(0,0)$ 把区间放到远处；$(1,0)$、$(0,1)$ 用只包住一个点的小区间；$(1,1)$ 用包住两点的区间。4 种全齐。上界：任取三点 $x_1<x_2<x_3$，标注 $(1,0,1)$ 做不到，因为包住 $x_1$ 和 $x_3$ 的区间一定包住中间的 $x_2$。所以 VC = 2。`,
          },
          {
            id: 'fam-bounds',
            q: '要证明一个分类器族的 VC 维等于 $d$，下面哪种做法是对的？',
            options: [
              '下界举一组 $d$ 个点被 shatter；上界说明任意 $d+1$ 个点都有一种标注做不到',
              '下界说明任意 $d$ 个点都被 shatter；上界举一组 $d+1$ 个点做不到',
              '下界和上界都只要各举一组点',
              '只要验证 $2^d$ 不超过族里分类器的个数',
            ],
            answer: 0,
            explain: T`VC 维的定义是"存在一组能被 shatter 的点"里最大的那个大小。所以下界只要一组：矩形族里正方形 4 角不行也不要紧，菱形行就够。上界必须对**所有** $d+1$ 点集都失败，只举一组失败的点，排除不了别的摆法。分类器个数只能给出上界（$2^d\le|F|$），不能代替证明。`,
          },
        ],
      },

      { t: 'h2', text: '7. 随机练习', id: 'practice' },
      '题目是随机生成的 4–5 个点的表。先自己在纸上做，再输入 VC 值核对。',
      { t: 'practice', gen: 'vc', title: 'VC 维随机题' },

      { t: 'h2', text: '8. 易错点', id: 'pitfalls' },
      {
        t: 'table', head: ['错误', '正确做法'], rows: [
          ['看到 8 行就答 VC = 3', '行数只给上界，必须在具体的 3 列上看到全部 8 种组合'],
          ['忘记去重', '只看子集列时，很多行会变得一样，重复的只算一次'],
          ['以为要"所有 $k$ 元子集都被 shatter"', 'VC = $k$ 只需要**存在一个** $k$ 元子集被 shatter（L07 p26 共线点的例子）'],
          ['只举一个失败的三元组就说 VC = 2', '要说明**所有**三元组都失败（用预筛或逐个列举）'],
          ['把列当成分类器、行当成点', '列是点，行是 dichotomy（一个分类器的输出）'],
          ['问"共几个 shattered 集"时没说空集', '写明"含空集 X 个，不含空集 X−1 个"'],
          ['函数族题里只举一组 $d+1$ 个点做不到，就说 VC $<d+1$', '上界要对**任意** $d+1$ 个点论证；"举一组"只用于下界（第 6 节）'],
        ],
      },

      { t: 'h2', text: '9. 和课件例子连起来', id: 'links' },
      {
        t: 'deep', title: '展开详解：VC 维在 L07 里是从哪来的', hint: '理解用，考试不会让你证明',
        blocks: [
          '**为什么需要 VC 维。** 泛化界是用训练错误率估计真实错误率上限的不等式。L06 的泛化界里有 $\\log|\\mathcal F|$；这里 $\\mathcal F$ 泛指分类器族，$|\\mathcal F|$ 是其中分类器的个数，$\\log$ 表示自然对数。这一项要求分类器个数有限，才能给出有用的有限上界。线性分类器、decision stump 有无穷多个，这个界就失效了。L07 的想法是：分类器虽然无穷多，但在 $n$ 个具体的点上，能产生的标签组合（dichotomy）最多 $2^n$ 种，数这个就够了。',
          {
            t: 'table', head: ['概念', '公式', '出处'], rows: [
              ['dichotomies on $\\mathcal X$（在点集上的标注）', '$\\mathcal F(\\mathcal X)=\\{(f(x_1),\\dots,f(x_n)) : f\\in\\mathcal F\\}$；这里 $\\mathcal X=\\{x_1,\\dots,x_n\\}$ 是选出的 $n$ 个点，$f$ 遍历分类器族 $\\mathcal F$，$\\mathcal F(\\mathcal X)$ 是这些分类器在这组点上给出的不同标签向量组成的集合', 'L07 p17'],
              ['growth function（增长函数）', '$S_{\\mathcal F}(n)=\\max_{|\\mathcal X|=n}|\\mathcal F(\\mathcal X)|\\le 2^n$；固定点数 $n$，遍历所有由 $n$ 个点组成的点集 $\\mathcal X$，分别数出不同标注的个数，再取最大值（max）。这个最大值就是 $S_{\\mathcal F}(n)$，下标说明使用分类器族 $\\mathcal F$', 'L07 p18'],
              ['VC dimension', '$\\VC(\\mathcal F)=\\max\\{n : S_{\\mathcal F}(n)=2^n\\}$', 'L07 p23'],
              ['VC 泛化界（不是求 VC 的公式；这类表格题用不到）', '$R[\\hat f]\\le\\hat R[\\hat f]+\\sqrt{8\\,\\frac{\\VC(\\mathcal F)\\log(2n+1)+\\log(4/\\delta)}{n}}$：$\\hat f$ 是从这 $n$ 个训练样本学出的分类器，$R[\\hat f]$ 是它的真实错误率，$\\hat R[\\hat f]$ 是它在训练样本上的错误率。$0<\\delta<1$ 是允许的失败概率；不等式以至少 $1-\\delta$ 的概率成立，根号项给出真实错误率比训练错误率最多高多少的上界', 'L07 p31'],
            ],
          },
          '**课件里的三个标准结果**（简答题可能直接问）：',
          {
            t: 'ul', items: [
              'Decision stumps（一维决策树桩，阈值两侧哪侧为 1 都可选）：在实数轴上让阈值任意移动，把 $n$ 个互异点从左到右排好。先固定左边输出 0、右边输出 1：阈值可放在所有点左边、相邻点之间或所有点右边，共产生 $n+1$ 种标注。反向输出也有 $n+1$ 种；两边重复的只有全 0 和全 1，所以不同标注共 $2(n+1)-2=2n$ 种。$n=1$ 时有 $2=2^1$ 种，$n=2$ 时有 $4=2^2$ 种，均可打散；$n=3$ 时只有 $6<8$ 种，不能打散，由向下封闭可知更大的集合也不行。所以 **VC = 2**（L07 p19、p24）。',
              '$\\mathbb R^2$ 上的线性分类器：3 个不共线点构成三角形。全同类时把直线放远；其余标注总有一类只占一个顶点，用直线切下该顶点即可，所以 8 种全能做出。任取 4 点：若有 3 点共线，给这 3 点标「两端正、中间负」就做不到；否则，若 4 点都在外轮廓上构成凸四边形，给对角两点同类、相邻点异类（XOR，异或式标注）就做不到，因为同类点之间的两条对角线相交，无法用直线分开；若一个点在另三点组成的三角形内，把内点标负、外三点标正，任何把外三点放在同一侧的直线也会把整个三角形及内点放在该侧，仍做不到。所有 4 点摆法都被排除，所以 **VC = 3**（p25–p28）。',
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
