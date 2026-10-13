(function (root) {
  'use strict';
  const T = String.raw;
  root.SML.content.add(root.SML.lecture({
    id: 'L07',
    eyebrow: '单元 2 · Honorio · 三份卷都考',
    chips: ['L07 p1–p34', { text: 'T1 VC 维', href: '#/T01' }],
    lead: 'L06 的界只适用于有限个分类器。这一讲把"模型类大小 $|\\mathcal F|$"换成"在 $n$ 个点上能产生多少种标注"，引出 **growth function** 和 **VC dimension**。计算题全部在 [T1](#/T01)。',
    oneLiner: {
      zh: 'VC 维 = 分类器族能 shatter（任意标注都能实现）的最大点集大小。它代替 $\\log|\\mathcal F|$ 进入泛化界，有限 VC 维 ⇔ 可学习（PAC）。',
      en: T`The VC dimension of $\mathcal F$ is the size of the largest set of points that $\mathcal F$ can shatter, i.e. label in all $2^n$ possible ways. It replaces $\log|\mathcal F|$ in the generalisation bound, so even infinite classes with finite VC dimension generalise.`,
    },
    why: [
      '线性分类器有无穷多个，但在 $n$ 个固定的点上，它们最多给出 $2^n$ 种不同的标注（dichotomy），实际上通常少得多。真正决定复杂度的是**能产生多少种标注**（p8–p19）。',
    ],
    defs: [
      ['dichotomy', '分类器在 $n$ 个点上的标签向量', 'p17'],
      ['growth function', '$S_{\\mathcal F}(n)=\\max_{|\\mathcal X|=n}|\\mathcal F(\\mathcal X)|\\le2^n$', 'p18'],
      ['shattered', '$|\\mathcal F(\\mathcal X)|=2^{|\\mathcal X|}$', 'p23'],
      ['VC dimension', '$\\VC(\\mathcal F)=\\max\\{n:S_{\\mathcal F}(n)=2^n\\}$', 'p23'],
      ['Sauer–Shelah', '$S_{\\mathcal F}(n)\\le\\sum_{i=0}^{\\VC}\\binom ni\\le(n+1)^{\\VC}$：有限 VC 维 ⇒ 增长是多项式', 'p30'],
    ],
    formulas: [
      { t: 'math', tex: T`R[\hat f_D]\le\hat R_D[\hat f_D]+\sqrt{8\,\frac{\VC(\mathcal F)\log(2n+1)+\log(4/\delta)}{n}}` },
      '和 L06 对比：$\\log|\\mathcal F|$ 换成了 $\\VC\\cdot\\log(2n+1)$（p31）。如果增长函数是 $2^n$（VC 无穷），惩罚不随 $n$ 下降，无法泛化（p20）。',
    ],
    examples: [
      {
        t: 'table', head: ['分类器族', 'growth function', 'VC 维', '出处'], rows: [
          ['decision stump（一维阈值，两个方向）', '$2n$', '2（$2n=2^n$ 最大解 $n=2$）', 'p19、p24'],
          ['$\\mathbb R^2$ 上的线性分类器', '$S(3)=8$，$S(4)=14$', '3', 'p25–p28'],
          ['$\\mathbb R^d$ 上的线性分类器', '', '$d+1$', 'p33'],
        ],
      },
      { t: 'viz', id: 'stump-explorer' },
      '2D 线性：3 个不共线点能分出全部 8 种；共线时 $(+,-,+)$ 做不到，但 VC 维看**最好的**摆放，仍然是 3。4 个点时 XOR 标注做不到，所以 VC = 3。',
    ],
    pitfalls: [
      ['VC = d 要求所有 d 点集都能 shatter', '只需**存在**一个'],
      ['dichotomy 表行数 ≥ $2^k$ 就能 shatter $k$ 个点', '必须在那 $k$ 列上恰好出现全部组合'],
      ['VC 维 = 参数个数', '线性分类器碰巧是 $d+1$，一般不成立'],
    ],
    exam: ['计算：从 dichotomy 表求 VC（[T1](#/T01)）。简答：为什么需要 VC 维 / 它和泛化的关系 / stumps 和线性分类器的 VC 维。'],
    types: ['T01', 'T12'],
    quiz: [
      { q: 'Decision stumps 的 VC 维？', type: 'num', answer: 2, explain: '$S(n)=2n$；$2n=2^n$ 的最大解是 $n=2$（L07 p24）。' },
      { q: '$\\mathbb R^5$ 上带截距的线性分类器，VC 维？', type: 'num', answer: 6, explain: '$d+1=6$（L07 p33）。' },
      {
        q: '如果某分类器族的 growth function 是 $2^n$（对所有 $n$），泛化界会怎样？', type: 'show',
        answerText: '惩罚项不随 $n$ 下降（$\\log S(2n)/n=2\\log2$），界失效，无法保证泛化。', explain: 'L07 p20。',
      },
    ],
  }));
})(window);
