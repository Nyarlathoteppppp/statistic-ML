/* 必会送分题: the question types that are near-certain in the exam, one page.
 * Basis: the 2026 practice paper (set by this year's lecturers; every one of its questions is a type below)
 * plus the frequency over 7 past papers (route page table, reference/PASTPAPER_MAP.md).
 * Steps are condensed from the T-pages (keep them in sync when a T-page's steps change).
 * Section A answers are pulled from the chapters' examQ by src (examqPick, data/tools.js), so they live in one place. */
(function (root) {
  'use strict';
  const T = String.raw;
  const card = (title, md) => ({ t: 'good', title: title, md: md });

  root.SML.content.add({
    id: 'must',
    title: '必会送分题：一定要会做的 8 类',
    lead: '2026 practice 卷是今年的老师出的，它的每一道题都属于下面 8 类，往年卷也几乎每份都有。这 8 类覆盖了 practice 卷的全部分数，步骤固定，练熟就是送分。**时间再紧，也先把这一页练到"每类连续 3 题全对"。**',
    blocks: [
      { t: 'h2', text: '1. 一页总表', id: 'table' },
      {
        t: 'table', head: ['#', '题型', '2026 practice', '往年出现', '去哪练'], rows: [
          ['①', 'VC 维：dichotomy 表（+ 函数族）', 'Q3 · 8 分', '2020 年起每份都有', '[T1](#/T01)'],
          ['②', 'UCB：算 Q 值、选臂', 'Q2 · 6 分', '2021、2022、2026', '[T2](#/T02)'],
          ['③', 'CNN 参数个数 / 输出尺寸', 'Q1(d) · 3 分', '2019 年起几乎每份', '[T3](#/T03)'],
          ['④', 'SVM：看图找 support vector', 'Q1(c) · 3 分', '6/7', '[T4](#/T04)'],
          ['⑤', 'D-separation：$X\\perp Y\\mid S$ 成立吗', 'Q4 · 8 分', '6/7', '[T5](#/T05)'],
          ['⑥', '消元顺序 → junction tree 的团', 'Q5 · 8 分', '2021 年起每份真题', '[T6](#/T06)'],
          ['⑦', 'PGM 建模、CPT 个数、MLE 数数', 'Q6 · 10 分', '6/7', '[T7](#/T07)'],
          ['⑧', 'Section A 必背简答（英文）', 'Q1(a)(b) · 4 分', 'Bayesian 概念 7/7', '[下面第 3 节](#/must/sa)'],
        ],
      },
      { t: 'note', title: '怎么用', md: '每类先读下面的"几步做完"，再去对应题型页做"真题全解"，最后做"随机练习"，直到连续 3 题全对，就在本页底部点"标记为已掌握"。考前一天每类各做 1 道热身。' },

      { t: 'h2', text: '2. 每类：长什么样、几步做完', id: 'steps' },
      card('① VC 维（2026 Q3，8 分）', T`**题目长什么样**：给一张 0/1 表，每一行是一个分类器在几个点上的输出，问 VC 维是多少，并写出一个被打散（shattered）的点集。2022、2023 年同一大题的 (b)(c) 接着问"给一个用公式定义的分类器族（矩形、阈值函数），求 VC 维"。

1. 去掉重复的行，剩 $m$ 行，上界是 $\lfloor\log_2m\rfloor$，从 $k=\lfloor\log_2m\rfloor$ 开始试。
2. 按列预筛：要进大小为 $k$ 的 shattered 集，那一列至少要有 $2^{k-1}$ 个 0 和 $2^{k-1}$ 个 1。
3. 对候选的 $k$ 个点：只看这几列，去重，数组合是不是凑齐了 $2^k$ 种。
4. 找到一个 $k$ 元 shattered 集，并且所有 $k+1$ 元集合都不行，就是 $\mathrm{VC}=k$。如果 $k$ 元子集**一个都**打不散，就把 $k$ 减 1 再查，不能直接拿上界 $\lfloor\log_2m\rfloor$ 当答案。
5. 卷面写：VC 值、shattered 集、列出 $2^k$ 种组合、一句话说明更大的为什么不行。

**去练**：[步骤](#/T01/steps) → [真题全解](#/T01/past) → [函数族 VC](#/T01/family) → [随机练习](#/T01/practice)`),
      card('② UCB（2026 Q2，6 分）', T`**题目长什么样**：给每个臂被拉的次数和奖励总和，问 UCB 下一轮选哪个臂。

1. $t=\sum_iN_{t-1}(i)+1$（总次数加 1）。
2. 每个臂的均值 $\hat\mu=$ 奖励 ÷ 次数。
3. bonus $=\sqrt{2\ln t/N}$。用题目给的 $\ln t$，数字通常凑成完全平方，不用计算器。
4. $Q=\hat\mu+\text{bonus}$，列成表。
5. 选 $Q$ 最大的臂，**写一句为什么**（通常是：均值不是最高，但拉得少、bonus 大）。

**去练**：[步骤](#/T02/steps) → [真题全解](#/T02/past) → [随机练习](#/T02/practice)`),
      card('③ CNN 参数 / 尺寸（2026 Q1(d)，3 分）', T`**题目长什么样**：给一张网络图（或一串层的描述），问参数个数，或者问某层的输出尺寸。

1. 从下往上，数出每层的单元数。
2. 卷积层的 filter 边长 $K$：看**一个**输出单元连了几条输入边。2026 卷每个卷积单元有 3 条入边，所以 $K=3$；再用 $7-3+1=5$ 验证卷积层正好 5 个单元。不要把卷积层的单元数 5 当成 $K$。
3. 卷积层**权重共享**：参数 $=C_{out}\times C_{in}\times K^2$（加 bias 再加 $C_{out}$），和输出有多少个位置无关。
4. 全连接层：两层单元数相乘（加 bias 再加输出单元数）。pooling 没有参数。
5. 尺寸：$\lfloor(n+2p-k)/s\rfloor+1$。看清题目要不要算 bias，再把各层加起来（2026 卷：$3+20+20=43$）。

**去练**：[读图步骤](#/T03/steps) → [尺寸与感受野](#/T03/size-rf) → [随机练习](#/T03/practice)`),
      card('④ SVM 找 support vector（2026 Q1(c)，3 分）', T`**题目长什么样**：给一张图，上面有两类点和 hard-margin SVM 的边界，问哪些点是 support vector。

1. 确认边界（题目给了就直接用）。
2. 算每个点到边界的**垂直**距离；边界是竖线 $x=c$ 时，距离就是 $|x_i-c|$。
3. 两类各自离边界最近的点就是 support vector；最近的点有几个并列，就全都是。
4. 检查：hard margin 的最优解，两侧最近距离相等。

常跟着考一问概念：support vector 的 functional margin 为什么是 1，而它到边界的欧氏距离是 $1/\|\mathbf w\|$（见下面第 3 节）。

**去练**：[看图找 SV](#/T04/read) → [概念简答](#/T04/concepts)`),
      card('⑤ D-separation（2026 Q4，8 分）', T`**题目长什么样**：给一个 Bayesian network，问 $X\perp Y\mid S$ 成不成立。

1. 列出所有有向边。
2. 画祖先图：只留 $X$、$Y$、$S$ 和它们的**全部祖先**。
3. Moralize：有共同孩子的父节点两两连边，再去掉所有箭头。
4. 删掉 $S$ 里的节点和它们的边。
5. $X$、$Y$ 不再连通就**成立**；还连通就**不成立**，并写出那条路径。

**每一步都写在卷面上**，能拿步骤分。最常见的错：先删 $S$ 再 moralize，会把答案做反。

**去练**：[四步法](#/T05/method) → [真题全解](#/T05/past) → [Workshop 12](#/T05/ws12) → [随机练习](#/T05/practice)`),
      card('⑥ 消元找团（2026 Q5，8 分）', T`**题目长什么样**：给一个图和一个消元顺序，问 junction tree 有哪些团（有时还问最大团多大、复杂度多少）。

1. 列出所有边。给的是有向图（BN）就先 moralize，再去掉箭头。
2. 按顺序一个个删点，每删一个写一行表：被删的点 | 当前邻居 | 新加的 fill-in 边 | 记下的团（这个点 + 它的邻居）。邻居要按**当前**的图算，包括前面加进来的 fill-in 边。
3. 去掉被别的团包含的团，剩下的就是 junction tree 的团。
4. 问 junction tree 时再连成树：两团之间的边权 = 共享变量个数，取最大权生成树，写出每条边的 separator。

**去练**：[步骤](#/T06/steps) → [真题全解](#/T06/past) → [有向图版](#/T06/directed) → [随机练习](#/T06/practice)`),
      card('⑦ PGM 建模、CPT、MLE（2026 Q6，10 分）', T`**题目长什么样**：给一段故事（山火警报、学生成绩、流感），要你画图、数参数、填表、说明怎么用模型做决定。

1. 定变量，按"原因 → 结果"画有向边。
2. 写因子分解：$P(x_1,\dots,x_n)=\prod_iP(x_i\mid\text{parents}_i)$。
3. 数 CPT：每个节点一张表，表的大小是"自己的取值数 × 父节点取值组合数"；自由参数要减掉每列加起来等于 1 的那个约束。
4. 填表：确定性的关系（例如"任一传感器报警就疏散"）直接填 0/1；需要从数据学的，用 MLE 数数：$\hat P(x\mid u)=\#(x,u)/\#(u)$。
5. 用模型做决定：算出后验概率，超过阈值就报警（或执行动作），用一两句英文写清楚。

**山火题 2025 年和 2026 年都出现了**，务必背熟。

**去练**：[基础](#/T07/basics) → [数 CPT](#/T07/count) → [山火题](#/T07/bushfire) → [MLE](#/T07/mle) → [随机练习](#/T07/practice)`),

      { t: 'h2', text: '3. Section A 必背简答（英文答案背下来）', id: 'sa' },
      '这些是各份卷子反复出现的简答题。先读题，用英文说出（或写下）答案，再点"看答案"核对。同样的题也在各章顶部的"Key points in English"框里。',
      { t: 'examqPick', picks: [
        ['c10', '2026 practice Q1a'], ['c08', '2026 practice Q1b'], ['c54', '2025 practice Q1(c)'], ['c53', '2025 practice Q1(d)(e)'],
        ['c26', '2016 S2 Q1.10'], ['c26', '2021 Q2'], ['c28', '2022 S1 Q1(f)'],
        ['c50', '2017 S2 Q5(b)'], ['c50', '2021 Q10'], ['c11', '2017 S2 Q2(c)'],
      ] },

      { t: 'h2', text: '4. 常考，但 2026 practice 卷里没有', id: 'next' },
      {
        t: 'table', head: ['题型', '往年出现', '去哪练'], rows: [
          ['Beta–Binomial 后验更新、MAP vs 后验均值', 'Bayesian 7/7（多为简答）', '[T9](#/T09/beta)'],
          ['Kernel 合法性证明、XOR 特征映射', '5/7', '[T8](#/T08)'],
          ['MRF 势表算 $Z$ 和边缘概率', '考过 3 次', '[T6 第 5 节](#/T06/mrf-z)'],
          ['Backprop 推导、穿过 max-pool 求梯度', '4/7（神经网络基础）', '[T10](#/T10)'],
        ],
      },
      { t: 'note', md: '以上 4 类做完前面 8 类再练。各题型的考频统计见 [复习路线](#/route) 的"历年考了什么"。' },
    ],
  });
})(window);
