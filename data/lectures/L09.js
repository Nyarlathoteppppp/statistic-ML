(function (root) {
  'use strict';
  const T = String.raw;
  root.SML.content.add(root.SML.lecture({
    id: 'L09',
    eyebrow: '单元 3 · Bozorgi',
    chips: ['L09 p1–p38', { text: 'T8 Kernel', href: '#/T08' }, { text: 'T4 SVM', href: '#/T04' }],
    lead: '两件事：(1) 用 Lagrange / KKT 把 SVM 变成 **dual**；(2) dual 里数据只以点积出现，所以可以换成 **kernel**，在高维甚至无穷维特征空间里训练线性分类器。证明题和特征映射见 [T8](#/T08)。',
    oneLiner: {
      zh: 'SVM 的 dual 只依赖样本两两之间的点积；把点积换成 $K(\\bx_i,\\bx_j)=\\varphi(\\bx_i)\'\\varphi(\\bx_j)$ 就得到非线性 SVM，无需显式计算 $\\varphi$。只有支持向量的乘子 $\\lambda_i>0$。',
      en: T`The SVM dual, $\max_\lambda\sum_i\lambda_i-\frac12\sum_{i,j}\lambda_i\lambda_jy_iy_j\mathbf x_i'\mathbf x_j$ s.t. $\lambda_i\ge0$ ($\le C$ for soft margin) and $\sum_i\lambda_iy_i=0$, depends on the data only through dot products, so replacing them with a kernel $K(\mathbf x_i,\mathbf x_j)=\varphi(\mathbf x_i)'\varphi(\mathbf x_j)$ trains a linear SVM in feature space without computing $\varphi$ (the kernel trick).`,
    },
    why: [
      '数据线性不可分时可以先做 basis expansion $\\varphi$，但高维 $\\varphi$ 算起来很贵，RBF 对应的甚至是无穷维（p16–p18）。kernel trick 绕开了这个问题：只算 $K$，代价和原始维数相当（p21–p23）。',
    ],
    defs: [
      ['Lagrangian', '$\\mathcal L=f(\\bx)+\\sum_i\\lambda_ig_i(\\bx)+\\sum_j\\nu_jh_j(\\bx)$', 'p6'],
      ['KKT 条件', '原始可行、$\\lambda_i\\ge0$、互补松弛 $\\lambda_i g_i(\\bx^*)=0$、驻点 $\\nabla\\mathcal L=0$', 'p7'],
      ['strong duality', 'SVM 的 primal 与 dual 最优值相等，解 dual 等于解 primal', 'p6、p10'],
      ['kernel', '能写成 $\\varphi(\\bu)\'\\varphi(\\bv)$ 的函数', 'p21'],
      ['Mercer', '任意有限点集的 Gram 矩阵都 PSD ⇒ 合法 kernel', 'p35'],
      ['representer theorem', '经验风险 + $g(\\|f\\|)$（$g$ 单调递增）的最优解可写成 $f^*(\\bx)=\\sum_i\\alpha_iK(\\bx,\\bx_i)$', 'p29'],
    ],
    formulas: [
      { t: 'math', tex: T`\bw^*=\sum_i\lambda_i^*y_i\bx_i,\qquad \sum_i\lambda_iy_i=0\qquad(\partial\mathcal L/\partial\bw=0,\ \partial\mathcal L/\partial b=0)` },
      { t: 'math', tex: T`\max_\lambda\ \sum_i\lambda_i-\tfrac12\sum_i\sum_j\lambda_i\lambda_jy_iy_jK(\bx_i,\bx_j)\quad\text{s.t. }\ 0\le\lambda_i\ (\le C),\ \ \sum_i\lambda_iy_i=0;\qquad s(\bx)=b^*+\sum_i\lambda_i^*y_iK(\bx_i,\bx)` },
      {
        t: 'deep', title: '展开详解：为什么只有支持向量 $\\lambda_i>0$', blocks: [
          '（hard margin）互补松弛（KKT）：$\\lambda_i^*\\big(1-y_i(\\bw^{*\\prime}\\bx_i+b^*)\\big)=0$。不在 margin 线上的点括号里严格小于 0，所以 $\\lambda_i^*=0$；只有在 margin 线上的点（支持向量）可以 $\\lambda_i^*>0$。因为 $\\bw^*=\\sum\\lambda_i^*y_i\\bx_i$，解只由支持向量决定，这也是 SMO / chunking 能利用稀疏性的原因（p11、p13）。soft margin 时 margin 内侧的点也可以有 $\\lambda_i>0$（最大到 $C$），$b^*$ 要用 $0<\\lambda_j<C$ 的点来求。',
          '$b^*$ 从任意一个支持向量的等式 $y_j(b^*+\\sum_i\\lambda_i^*y_iK(\\bx_i,\\bx_j))=1$ 解出来（p19–p20）。',
        ],
      },
    ],
    compare: [{
      t: 'table', head: ['', 'primal', 'dual'], rows: [
        ['变量', '$\\bw,b$（维数 $d$）', '$\\lambda_1..\\lambda_n$（样本数 $n$）'],
        ['代价（一般方法）', '$O(d^3)$', '$O(n^3)$（p10、p13）'],
        ['能否用 kernel', '只能用显式 $\\varphi$', '可以，只需 $K$'],
        ['何时用', '$n$ 很大、特征维数小', '高维 / 无穷维特征（如 RBF）'],
      ],
    }],
    examples: [
      { t: 'math', tex: T`(u_1v_1+c)^2=u_1^2v_1^2+2cu_1v_1+c^2=\varphi(u)'\varphi(v),\quad \varphi(x)=[x^2,\ \sqrt{2c}\,x,\ c]` },
      '显式计算 9 次运算，直接算 kernel 3 次（p22）。RBF $\\exp(-\\gamma\\|\\bu-\\bv\\|^2)=f(\\bu)\\exp(2\\gamma\\bu\'\\bv)f(\\bv)$，Taylor 展开成无穷多个多项式核之和（p34）。',
    ],
    pitfalls: [
      ['kernel 是一种近似', 'kernel 给出的就是特征空间点积的**精确**值'],
      ['任何相似度函数都能当 kernel', '必须对应某个 $\\varphi$（Gram 矩阵 PSD）'],
      ['soft-margin dual 和 hard 完全一样', '目标一样，但多了上界 $\\lambda_i\\le C$（box constraint）'],
    ],
    types: ['T08', 'T04'],
    quiz: [
      {
        q: 'dual 中哪个约束来自 $\\partial\\mathcal L/\\partial b=0$？', options: ['$\\sum_i\\lambda_iy_i=0$', '$\\lambda_i\\ge0$', '$\\lambda_i\\le C$', '$\\bw=\\sum\\lambda_iy_i\\bx_i$'], answer: 0,
        explain: '$\\mathcal L$ 中含 $b$ 的项是 $-b\\sum_i\\lambda_iy_i$，对 $b$ 求导为 0 即得（p9）。',
      },
      {
        q: 'Representer theorem 说明了什么？', type: 'show',
        answerText: '很多正则化学习问题（ridge、logistic、PCA…）的解都能写成训练点上 kernel 的线性组合，所以都能 kernel 化。', explain: 'L09 p29–p30。',
      },
    ],
  }));
})(window);
