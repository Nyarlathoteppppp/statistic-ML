(function (root) {
  'use strict';
  const T = String.raw;
  root.SML.content.add(root.SML.lecture({
    id: 'L08',
    eyebrow: '单元 3 · Bozorgi',
    chips: ['L08 p1–p35', { text: 'T4 SVM', href: '#/T04' }],
    lead: '从"哪条分隔线最好"出发推导出 hard-margin SVM，再放松成 soft-margin。几何推导是简答题的来源，看图找支持向量见 [T4](#/T04)。',
    oneLiner: {
      zh: 'SVM 选离两类最近点最远的分隔超平面（最大 margin）。规定最近点的 $y(\\bw\'\\bx+b)=1$ 后，最大化 margin 等价于最小化 $\\|\\bw\\|$；soft-margin 用 slack / hinge loss 允许违反。',
      en: T`An SVM chooses the separating hyperplane with the largest margin to the closest training points. Fixing the scale so that the closest points satisfy $y_i(\mathbf w'\mathbf x_i+b)=1$, maximising the margin $1/\|\mathbf w\|$ becomes $\min\frac12\|\mathbf w\|^2$ s.t. $y_i(\mathbf w'\mathbf x_i+b)\ge1$. The soft margin adds slack variables penalised by $C\sum_i\xi_i$, i.e. hinge loss.`,
    },
    why: [
      '能完美分开训练数据的直线有无穷多条，训练误差都是 0。离数据最远的那条对采样噪声最稳健，新点落到错误一侧的可能性最小（p6–p11）。',
    ],
    defs: [
      ['margin', '分隔边界到**最近**数据点的距离', 'p13'],
      ['support vectors', '在 margin 线上的点，$y_i(\\bw\'\\bx_i+b)=1$', 'p13、p20'],
      ['点到超平面距离', '$y_i(\\bw\'\\bx_i+b)/\\|\\bw\\|$', 'p17'],
      ['canonical scaling', '$(\\bw,b)$ 乘正数边界不变，所以固定最近点的值为 1', 'p19–p20'],
      ['hinge loss', '$\\max(0,1-y(\\bw\'\\bx+b))$', 'p31–p32'],
      ['slack $\\xi_i$', '$\\xi_i\\ge$ 第 $i$ 个点的 hinge loss', 'p33'],
    ],
    formulas: [
      { t: 'math', tex: T`\text{hard: }\min_{\bw,b}\tfrac12\|\bw\|^2\ \text{s.t. } y_i(\bw'\bx_i+b)\ge1\qquad\text{soft: }\min_{\bw,b,\xi}\tfrac12\|\bw\|^2+C\sum_i\xi_i\ \text{s.t. } y_i(\bw'\bx_i+b)\ge1-\xi_i,\ \xi_i\ge0` },
      {
        t: 'deep', title: '展开详解：距离公式怎么来的（p14–p17）', blocks: [
          '课件画的是边界负侧的点（$\\bw\'\\bx+b<0$），它的投影要沿 $+\\bw$ 方向走：$\\bx_p=\\bx+\\|\\bm r\\|\\frac{\\bw}{\\|\\bw\\|}$（另一侧的点要沿 $-\\bw$ 走）。代入边界方程 $\\bw\'\\bx_p+b=0$：',
          { t: 'math', tex: T`0=\bw'\bx+\|\bm r\|\frac{\bw'\bw}{\|\bw\|}+b=\bw'\bx+\|\bm r\|\,\|\bw\|+b\ \Rightarrow\ \|\bm r\|=-\frac{\bw'\bx+b}{\|\bw\|}` },
          '一般地距离是 $|\\bw\'\\bx+b|/\\|\\bw\\|$。对分类正确的训练点，用标签 $y\\in\\{-1,1\\}$ 去掉绝对值：$\\|\\bm r_i\\|=y_i(\\bw\'\\bx_i+b)/\\|\\bw\\|$（p17）。',
        ],
      },
    ],
    compare: [{
      t: 'table', head: ['', 'hard margin', 'soft margin'], rows: [
        ['数据要求', '必须线性可分', '可以不可分'],
        ['loss 解释', '违反 margin 的 loss 是 $\\infty$（p25–p26）', 'hinge loss，线性惩罚违反程度'],
        ['超参数', '无', '$C$：越大越接近 hard margin'],
        ['和正则化 ERM 的关系', '$\\|\\bw\\|^2$ 是正则项，约束是 loss', '$\\sum$ hinge $+\\lambda\\|\\bw\\|^2$，像 ridge（p32）'],
      ],
    }],
    pitfalls: [
      ['margin = 1 是欧氏距离', 'functional margin = 1，几何距离 $1/\\|\\bw\\|$'],
      ['分对的点 hinge loss 都是 0', '落在 margin 内（$0<y s<1$）的点也有损失'],
    ],
    errata: ['p33 写 $C=1/\\lambda$；按 p32、p33 的系数严格应为 $1/(2\\lambda)$。写"$C$ 与 $\\lambda$ 成反比"即可。'],
    types: ['T04'],
    quiz: [
      { q: '$\\bw=(6,8)$，两条 margin 线之间的宽度？', type: 'num', answer: 0.2, explain: '单侧 $1/\\|\\bw\\|=0.1$，宽度 $2/\\|\\bw\\|=0.2$。' },
      {
        q: '为什么目标写成 $\\frac12\\|\\bw\\|^2$ 而不是 $\\|\\bw\\|$？', type: 'show',
        answerText: '单调变换，最优解相同；平方可导、是二次规划，乘 ½ 让导数更干净（L08 p21）。',
      },
    ],
  }));
})(window);
