(function (root) {
  'use strict';
  const T = String.raw;
  root.SML.content.add(root.SML.lecture({
    id: 'L05',
    eyebrow: '单元 1 · Bozorgi · 简答高频',
    chips: ['L05 p1–p40'],
    lead: '正则化解决三件事：数值上不稳定（共线）、过拟合、引入先验知识。bias-variance trade-off 解释为什么"简单一点"反而测试误差更低。2021 卷的 Q8、Q13a 都出自这里。',
    oneLiner: {
      zh: '正则化 = 在损失上加惩罚 $\\lambda\\|\\bw\\|$，相当于 MAP 的先验（L2 ↔ Gaussian，L1 ↔ Laplace）。它增加 bias、降低 variance；测试误差 = bias² + variance + 噪声，最优复杂度在中间。',
      en: T`Regularisation adds a penalty such as $\lambda\|\mathbf w\|_2^2$ (ridge) or $\lambda\|\mathbf w\|_1$ (lasso) to the training loss. It fixes ill-conditioning (e.g. collinear features), reduces overfitting, and corresponds to MAP estimation with a Gaussian (ridge) or Laplace (lasso) prior. It trades a small increase in bias for a larger decrease in variance; expected test error $=\text{bias}^2+\text{variance}+\text{noise}$.`,
    },
    why: [
      '两个特征完全相同（克隆）时，$w_1+\\delta,\\ w_2-\\delta$ 预测完全一样，有无穷多个最优解，权重也没法解释（p4–p8）。数学上 $\\bX\'\\bX$ 有零特征值、不可逆（p9–p11）。',
      'Ridge 给 $\\bX\'\\bX$ 每个特征值加上 $\\lambda>0$，变得可逆，解唯一（p13–p14）。',
    ],
    defs: [
      ['ridge', '$\\min\\|\\by-\\bX\\bw\\|^2+\\lambda\\|\\bw\\|_2^2$，解 $(\\bX\'\\bX+\\lambda I)^{-1}\\bX\'\\by$', 'p13–p15'],
      ['lasso', '$\\min\\|\\by-\\bX\\bw\\|^2+\\lambda\\|\\bw\\|_1$，无闭式解，产生稀疏解', 'p17–p18'],
      ['bias', '平均预测和真值的差（模型"系统性"偏离）', 'p33–p36'],
      ['variance', '换一批训练数据，预测变化多大', 'p33–p36'],
    ],
    formulas: [
      { t: 'math', tex: T`E\big[(Y-\hat f)^2\big]=\underbrace{\big(E[Y]-E[\hat f]\big)^2}_{\text{bias}^2}+\underbrace{\mathrm{Var}(\hat f)}_{\text{variance}}+\underbrace{\mathrm{Var}(Y)}_{\text{irreducible}}\qquad(\text{L05 p37})` },
      {
        t: 'deep', title: '展开详解：为什么 L1 产生稀疏解', blocks: [
          '约束形式：在 $\\|\\bw\\|_1\\le t$（菱形）或 $\\|\\bw\\|_2^2\\le t$（圆）内最小化平方误差。误差的等高线是椭圆，第一次碰到菱形时多半碰在**顶点**上，顶点在坐标轴上，于是某些 $w_j=0$；碰到圆时一般不在轴上，权重只是变小（p17–p18）。',
        ],
      },
    ],
    compare: [{
      t: 'table', head: ['', 'Ridge (L2)', 'Lasso (L1)'], rows: [
        ['惩罚', '$\\|\\bw\\|_2^2$', '$\\|\\bw\\|_1$'], ['效果', '所有权重平滑缩小', '部分权重变成 0（特征选择）'],
        ['闭式解', '有', '无'], ['对应先验', 'Gaussian', 'Laplace'],
      ],
    }, {
      t: 'table', head: ['模型复杂度 ↑', '训练误差', 'bias', 'variance', '测试误差'], rows: [['', '单调下降', '下降', '上升', 'U 形']],
    }],
    examples: ['p20–p28：在 $x\\sin x$ 数据上，线性模型 underfit，非参数平滑 overfit；在多份训练集 $D_1,D_2,D_3$ 上重新拟合，复杂模型的曲线变化很大（variance 高）（p31–p35）。'],
    pitfalls: [
      ['正则化总是让模型更好', 'λ 太大会 underfit；λ 要用验证集 / CV 选'],
      ['训练误差最小的模型就是最好的', '训练误差随复杂度单调下降，看测试误差（p31）'],
      ['bias 越低越好', '数据少时高 bias、低 variance 的模型测试误差可能更低（2021 Q8）'],
    ],
    types: ['T13', 'T09'],
    quiz: [
      { q: '$\\bX\'\\bX$ 的特征值是 0 和 3，ridge 取 $\\lambda=2$ 后的特征值？', type: 'show', answerText: '2 和 5（每个加 λ）', explain: '所以矩阵变得可逆（p14）。' },
      { q: '想做特征选择，用 ridge 还是 lasso？', options: ['Ridge', 'Lasso'], answer: 1, explain: 'L1 会把不重要的权重压成 0。' },
    ],
  }));
})(window);
