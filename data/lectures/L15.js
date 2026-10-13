(function (root) {
  'use strict';
  const T = String.raw;
  root.SML.content.add(root.SML.lecture({
    id: 'L15',
    eyebrow: '单元 5 · Honorio',
    chips: ['L15 p1–p35'],
    lead: '怎么评估和比较模型：选对指标，用没见过的数据（验证集 / k-fold / bootstrap），并且报告方差、做显著性检验。简答题可能问"为什么特征选择要放在 CV 里面"。',
    oneLiner: {
      zh: '目标是在未见数据上的表现。用验证集选超参数、测试集报结果；k-fold / 0.632 bootstrap 给出指标的均值和方差；比较两个算法时要看方差（t 检验或 error bar），不能只看均值。',
      en: T`Evaluation targets performance on unseen data: tune hyperparameters on validation data and report on held-out test data; k-fold CV or the 0.632 bootstrap give a mean and variance of the metric. Any data-dependent step (feature selection, tuning) must happen inside the training folds, otherwise information leaks and the estimate is optimistic. Compare algorithms using variances too (e.g. a two-sample t-test or error bars).`,
    },
    defs: [
      ['precision / recall', '$TP/(TP+FP)$ / $TP/(TP+FN)$；通常此消彼长', 'p6–p9'],
      ['sensitivity / specificity', '$TP/(TP+FN)$ / $TN/(TN+FP)$', 'p6–p10'],
      ['ROC / AUC', '扫阈值画 sensitivity vs 1−specificity；随机 0.5，完美 1', 'p11'],
      ['k-fold CV', '分成 $k$ 份，轮流用一份测、其余训练', 'p18'],
      ['0.632 bootstrap', '有放回抽 $n$ 个训练，没抽到的测试；每个样本被抽到的概率 $\\to1-1/e\\approx0.632$', 'p19–p20'],
      ['nested CV', '内层选超参数，外层报告指标', 'p21'],
    ],
    formulas: [
      { t: 'math', tex: T`x=\frac{(\hat\mu_1-\hat\mu_2)\sqrt m}{\sqrt{\hat\sigma_1^2+\hat\sigma_2^2}},\qquad \nu=\Big\lceil\frac{(\hat\sigma_1^2+\hat\sigma_2^2)^2(m-1)}{\hat\sigma_1^4+\hat\sigma_2^4}\Big\rceil,\qquad \text{reject }\mu_1=\mu_2\text{ in favour of }\mu_1>\mu_2\text{ if } x>x_{1-\alpha,\nu}` },
      {
        t: 'table', head: ['', 'A1 均值 / 方差', 'A2 均值 / 方差', '$x$', '$x_{0.95,16}$', '结论'], rows: [
          ['p29', '10.1 / 4.1', '9.9 / 3.2', '0.22', '1.75', '不能拒绝（差异不显著）'],
          ['p30', '11.6 / 2', '9.9 / 3.2', '2.24', '1.75', '拒绝，A1 误差显著更高'],
        ],
      },
      { t: 'note', md: '课件里的方差是**除以 $m$** 的总体方差（例如 A1 的 9 个误差算出 4.1）；自由度 15.8、15.2 都取 16（向上取整）。' },
    ],
    pitfalls: [
      ['在全部数据上先做特征选择，再做 CV', '验证集信息泄漏进训练，估计偏乐观；特征选择要在每个 fold 的训练部分做（p22–p23）'],
      ['只报告 CV 的平均误差', '还要报告方差；均值差一点不代表显著（p26–p29）'],
      ['同一个病人的两次就诊当两个样本', '样本单位要对，不能重复计数（p33–p34）'],
      ['所有错误代价相同', '医疗例子：把病人判成健康的代价是反过来的 10 倍（p13）'],
    ],
    types: ['T13'],
    quiz: [
      { q: 'TP=8，FP=2，FN=4。precision？', type: 'num', answer: 0.8, explain: '$8/(8+2)$。' },
      { q: 'TP=8，FP=2，FN=4。recall？', type: 'num', answer: 2 / 3, tol: 0.005, explain: '$8/(8+4)$。' },
      { q: '为什么 bootstrap 叫 0.632？', type: 'show', answerText: '有放回抽 $n$ 次，某个样本至少被抽到一次的概率 $1-(1-1/n)^n\\to1-1/e\\approx0.632$（p20）。' },
    ],
  }));
})(window);
