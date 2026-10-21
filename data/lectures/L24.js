(function (root) {
  'use strict';
  const T = String.raw;
  root.SML.content.add(root.SML.lecture({
    id: 'L24',
    eyebrow: '单元 6 · Jiang · 往年卷未出过',
    chips: ['L24 p1–p23', { text: 'c63 参数学习', href: '#/c63' }, { text: 'c64 结构学习', href: '#/c64' }, { text: 'L23 学 BN', href: '#/L23' }],
    lead: '从完整数据学 MRF，和 L23 学 BN 一样分两步：**先学参数，再学结构**。参数：最大似然 → 梯度 = 数据计数 − 模型预测计数 → moment matching；因为 $Z(\\theta)$ 牵连所有参数，一般要做推断，树可以直接数频率。结构：只在树里找，最好的树 = 互信息总和最大的树，用最大权生成树求；再用 BIC 去掉弱边，结果可能是森林。详细讲解见 [c63](#/c63)、[c64](#/c64)。',
    oneLiner: {
      zh: '学 MRF 参数：让模型预测的成对计数等于数据里的计数（moment matching），一般要迭代 + 推断，树直接代频率。学结构：只找树，对数似然 = 常数 + 边上互信息之和，所以用互信息（或边的 BIC）做边权，跑最大权生成树：从大到小加边，跳过成环的；BIC 为负的边不加，可能得到森林。',
      en: T`MRF learning has two parts. Parameters: with a fixed graph the log-likelihood is $\sum_{(i,j)\in E}\sum_{x_i,x_j}\hat n(x_i,x_j)\theta_{ij}(x_i,x_j)-T\log Z(\theta)$, which is concave; its gradient is the empirical count minus the model's predicted count $T\,P(x_i,x_j;\theta)$, so the ML solution matches the pairwise statistics of the data on every edge (moment matching). Because $Z(\theta)$ couples all parameters, this needs inference even with complete data, except for trees, where the ML estimates are read off from $\hat P_{ij}=\hat n_{ij}/T$ and $\hat P_i=\hat n_i/T$. Structure: for trees the log-likelihood is $T[-\sum_i\hat H(X_i)+\sum_{(i,j)\in E}\hat I(X_i;X_j)]$, so the best tree is a maximum weighted spanning tree over mutual-information weights; with BIC each edge scores $T\hat I-\frac{(r_i-1)(r_j-1)}{2}\log T$, and running the algorithm over positive-score edges gives the highest-scoring tree (forest).`,
    },
    why: [
      'BN 的 CPT 各自归一化，数据完整时每张表单独数频率即可。MRF 只有整体的 $Z(\\theta)$，改一个参数所有概率都变，所以"学习需要推断"（p4）。',
      '一般图的结构搜索很难（L23）。限制成树后，似然按边拆开，最好的树可以用最大权生成树**精确**求出（p10、p14）。',
    ],
    defs: [
      ['globally normalized', '概率要整体除以 $Z(\\theta)$；$Z$ 含所有参数，学参数也要推断', 'p4'],
      ['sufficient statistics', '成对计数 $\\hat n(x_i,x_j)$：数据只通过它进入似然', 'p6'],
      ['estimated counts', '数据里的计数 $\\hat n(x\'_k,x\'_l)$', 'p7'],
      ['predicted counts', '模型预测的计数 $T\\cdot P(x\'_k,x\'_l;\\theta)$', 'p7'],
      ['moment matching', '最优时两者相等；只对图里有的边成立', 'p8–p9'],
      ['tree MLE', '$\\hat P_{ij}=\\hat n_{ij}/T$、$\\hat P_i=\\hat n_i/T$ 代入树的分解式', 'p11–p12'],
      ['empirical entropy $\\hat H$ / mutual information $\\hat I$', '用频率算的熵、互信息；熵之和对所有树相同', 'p14'],
      ['maximum weighted spanning tree', '从空树开始，每次加权重最大且不成环的边（讲者点名：Kruskal 算法，保证得到最大权生成树）', 'p15–p19'],
      ['BIC score for an edge', '$T\\hat I(X_i;X_j)-\\frac{r_ir_j-r_i-r_j+1}{2}\\log T$；只用正分的边，结果可能是 forest；log 是自然对数（讲者）', 'p20'],
    ],
    formulas: [
      { t: 'math', tex: T`l(D;\theta)=\sum_{(i,j)\in E}\sum_{x_i,x_j}\hat n(x_i,x_j)\,\theta_{ij}(x_i,x_j)-T\log Z(\theta)` },
      { t: 'math', tex: T`\frac{\partial l(D;\theta)}{\partial\theta_{kl}(x'_k,x'_l)}=\hat n(x'_k,x'_l)-T\cdot P(x'_k,x'_l;\theta)=0` },
      { t: 'math', tex: T`P(x_1,\dots,x_n)=\Big[\prod_{i=1}^n\hat P_i(x_i)\Big]\prod_{(i,j)\in E}\frac{\hat P_{ij}(x_i,x_j)}{\hat P_i(x_i)\hat P_j(x_j)}` },
      { t: 'math', tex: T`l(D;\hat\theta)=T\Big[-\sum_{i=1}^n\hat H(X_i)+\sum_{(i,j)\in E}\hat I(X_i;X_j)\Big]` },
      { t: 'math', tex: T`\begin{aligned}BIC(D;\hat\theta)=&-T\sum_{i=1}^n\hat H(X_i)-\sum_{i=1}^n\frac{r_i-1}{2}\log T\\&+\sum_{(i,j)\in E}\Big(T\hat I(X_i;X_j)-\frac{r_ir_j-r_i-r_j+1}{2}\log T\Big)\end{aligned}` },
    ],
    examples: [
      '课件 p15–p19：边权 $I(x_1,x_3)=3$，$I(x_2,x_3)=2$，$I(x_1,x_2)=1.5$，$I(x_3,x_4)=1$，$I(x_2,x_4)=0.9$，$I(x_1,x_4)=0.7$。依次加 $x_1$—$x_3$、$x_2$—$x_3$；$x_1$—$x_2$ 会成环，跳过；加 $x_3$—$x_4$，3 条边完成，总权重 $3+2+1=6$。',
      { t: 'viz', id: 'mwst-stepper', opts: { preset: 'L24' } },
      '课件 p21–p22：C. elegans，25 个二元表型变量、926 次基因扰动实验（和 L23 同一份数据）。只要两两计数 → 每条边的 BIC → 最大权生成树。结果以 16 号为中心；图里没有 10 号变量（课件没解释）。',
    ],
    compare: [{
      t: 'table', head: ['', 'junction tree（L22）', '树形 MRF 结构学习（L24）'], rows: [
        ['节点', '极大团', '变量'],
        ['边权', '共享变量个数', '互信息 / 边的 BIC'],
        ['用途', '推断', '学习结构'],
        ['结果', '一定是树', '树或森林（负分边不加）'],
      ],
    }],
    pitfalls: [
      ['MRF 和 BN 一样，每个因子各数各的频率', '一般图不行（$Z$ 牵连所有参数）；只有树可以（p10–p12）'],
      ['moment matching 匹配所有变量对', '只匹配图里有边的对（p9）'],
      ['取互信息最大的 $n-1$ 条边', '要跳过会成环的边：p18 的 1.5 被跳过'],
      ['似然最高的树最好', '似然总会连满一棵树；用 BIC，弱边不加（p20）'],
    ],
    errata: [
      '课件 p6–p9 写 $\\hat n(x_i,x_j)$，p11 写 $\\hat n_{ij}(x_i,x_j)$：同一个计数。',
      'p15–p19 的互信息（3、2、1.5…）只是示意：二元变量的互信息不超过 $\\ln2\\approx0.69$。',
      'p21 的 "MWSP algorithm" 应指 MWST（maximum weighted spanning tree）。',
      'p20 的 $r_ir_j-r_i-r_j+1$ 就是 $(r_i-1)(r_j-1)$，即一条边多出的自由参数个数。',
    ],
    exam: [
      '往年卷（2021、2025 practice、2026 practice）都没有出过 L24。可能的考法：概念简答（为什么学 MRF 需要推断、moment matching 是什么、为什么只看互信息、为什么用 BIC）；手算一次最大权生成树或一条边的 BIC。',
    ],
    quiz: [
      {
        q: '边 $(k,l)$，$T=40$，数据里 $(x_k,x_l)=(0,1)$ 出现 6 次，模型当前给 $P(x_k=0,x_l=1;\\theta)=0.2$。梯度是多少？', type: 'num', answer: -2,
        explain: '数据计数 − 预测计数 $=6-40\\times0.2=6-8=-2$：模型高估了这种组合，梯度上升会把 $\\theta_{kl}(0,1)$ 调低。',
      },
      {
        q: '二元变量、$T=100$，某条边 $\\hat I=0.01$。它的 BIC 分数为正吗？', options: ['为正，加入', '为负，不加'], answer: 1,
        explain: '$100\\times0.01-\\frac12\\ln100=1-2.30=-1.30<0$：不加。门槛是 $\\hat I>\\ln100/200\\approx0.023$。',
      },
    ],
  }));
})(window);
