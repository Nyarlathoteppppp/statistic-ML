(function (root) {
  'use strict';
  const T = String.raw;
  root.SML.content.add(root.SML.lecture({
    id: 'L01',
    eyebrow: '单元 1 · Honorio · 工具',
    chips: ['L01 p1–p52'],
    lead: '概率、线性代数的复习。考试不会单独出题，但后面每一讲都在用。只列出后面真正用到的部分。',
    oneLiner: {
      zh: '要熟练：期望 / 方差、条件概率与 Bayes rule、边缘化、独立；点积、超平面与法向量、范数、PSD 矩阵与特征值。',
      en: T`Key tools: expectation and variance, conditional probability, Bayes' rule $P(A\mid B)=P(B\mid A)P(A)/P(B)$, marginalisation $P(A)=\sum_bP(A,B=b)$, independence $P(A,B)=P(A)P(B)$; dot products, hyperplanes $\mathbf w'\mathbf x+b=0$ with normal $\mathbf w$, norms, and positive semi-definite matrices.`,
    },
    defs: [
      ['expectation / variance', '$E[X]=\\sum_xxP(x)$；$\\mathrm{Var}(X)=E[(X-E[X])^2]$', 'p18'],
      ['independence', '$P(A,B)=P(A)P(B)$；条件独立 $P(A,B\\mid C)=P(A\\mid C)P(B\\mid C)$', 'p20'],
      ['Bayes rule', '$P(A\\mid B)=\\frac{P(B\\mid A)P(A)}{P(B)}$', 'p22'],
      ['marginalisation', '$P(A)=\\sum_bP(A,B=b)$（连续时积分）', 'p23'],
      ['hyperplane', '$\\bw\'\\bx+b=0$，$\\bw$ 是法向量', 'p31'],
      ['L1 / L2 norm', '$\\|\\bx\\|_1=\\sum|x_i|$；$\\|\\bx\\|_2=\\sqrt{\\sum x_i^2}$', 'p34'],
      ['PSD', '对称矩阵 $A$，$\\bv\'A\\bv\\ge0$ 对所有 $\\bv$；任何 $\\bX\'\\bX$ 都是 PSD；特征值 $\\ge0$', 'p40–p42'],
    ],
    pitfalls: [['独立就意味着条件独立', '不一定（v-structure：$X_1\\perp X_2$ 但给定共同孩子后不独立，L20 p12–p13）']],
    quiz: [
      { q: '$X$ 取 0、1 各概率 0.5。$\\mathrm{Var}(X)$？', type: 'num', answer: 0.25, explain: '$E[X]=0.5$，$E[X^2]=0.5$，方差 $0.5-0.25$。' },
      { q: '为什么 $\\bX\'\\bX$ 总是 PSD？', type: 'show', answerText: '$\\bv\'\\bX\'\\bX\\bv=\\|\\bX\\bv\\|^2\\ge0$。' },
    ],
  }));
})(window);
