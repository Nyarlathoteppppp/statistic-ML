(function (root) {
  'use strict';
  const T = String.raw;
  root.SML.content.add(root.SML.lecture({
    id: 'L16',
    eyebrow: '单元 5 · Honorio',
    chips: ['L16 p1–p27', { text: 'T12 Experts', href: '#/T12' }],
    lead: '在线学习：每轮综合 $n$ 个专家的建议做预测，结果可能是对抗性的（不假设 i.i.d.）。目标是错误数接近最好的那个专家。分析方法都是"potential function"：看总权重怎么变化。',
    oneLiner: {
      zh: '有完美专家时多数投票最多错 $\\log_2 n$ 次；没有时不要淘汰犯错的专家，而是降权（×½ 或 ×(1−ε)），错误数约为最好专家的 2 倍加 $O(\\log n)$；随机化后去掉因子 2。',
      en: T`With an infallible expert, majority vote over the surviving experts makes at most $\log_2 n$ mistakes. With imperfect experts we down-weight instead of dropping: weighted majority with factor $(1-\varepsilon)$ makes at most $2(1+\varepsilon)m+2\ln n/\varepsilon$ mistakes, where $m$ is the best expert's mistakes; randomising over experts removes the factor 2 in expectation.`,
    },
    defs: [
      ['infallible expert', '至少一个专家永不犯错', 'p4'],
      ['majority algorithm', '只对仍然全对的专家投票，犯错就淘汰', 'p5–p6'],
      ['halving', '犯错的专家权重 ×½，按加权多数预测', 'p9–p12'],
      ['weighted majority', '犯错的专家权重 ×$(1-\\varepsilon)$', 'p15–p18'],
      ['probabilistic experts', '按权重比例随机选一个专家跟随；损失可以在 $[0,1]$', 'p21–p25'],
    ],
    formulas: [{
      t: 'table', head: ['算法', 'mistake bound', '出处'], rows: [
        ['Majority（有完美专家）', '$M\\le\\log_2 n$', 'p6'],
        ['Halving', '$M\\le\\frac{m+\\log_2n}{\\log_2(4/3)}\\approx2.4(m+\\log_2 n)$', 'p12'],
        ['Weighted majority $(1-\\varepsilon)$，$0<\\varepsilon\\le0.5$', '$M\\le2(1+\\varepsilon)m+\\frac{2\\ln n}{\\varepsilon}$', 'p18'],
        ['Probabilistic experts', '$E[L]\\le\\frac{\\ln n}{\\varepsilon}+(1+\\varepsilon)L^*$', 'p23'],
      ],
    }, {
      t: 'deep', title: '展开详解：Majority 的 $\\log_2 n$ 怎么证', blocks: [
        '设 $E$ 是仍然全对的专家集合（potential）。学习者犯错 ⇒ 至少一半 $E$ 里的专家错了，被淘汰 ⇒ $|E|$ 至少减半。犯 $M$ 次错后 $|E|\\le n/2^M$。完美专家永远在 $E$ 里，所以 $1\\le n/2^M$ ⇒ $M\\le\\log_2 n$（p6）。',
        'Halving 同理，只是把"集合大小"换成"总权重 $W$"：学习者犯错时至少一半权重被减半，$W$ 最多剩原来的 $3/4$；而最好专家的权重 $(1/2)^m\\le W$。',
      ],
    }],
    compare: [{
      t: 'table', head: ['', 'online（experts）', 'batch（L06–L07）'], rows: [
        ['数据假设', '对抗性，不假设 i.i.d.', 'i.i.d. 样本'], ['比较对象', '最好的专家', '类中最好的分类器'],
        ['界', '$O(m+\\log n)$ 次错误', '$O(\\sqrt{\\VC\\log n/n})$ 的风险差'],
      ],
    }],
    pitfalls: [
      ['没有完美专家时也用淘汰法', '可能淘汰光所有专家；应该降权（p10）'],
      ['ε 越小越好', '$m$ 的系数变好，但 $\\ln n/\\varepsilon$ 项变大（p18）'],
    ],
    types: ['T12'],
    quiz: [
      { q: '16 个专家，其中一个永远正确。Majority 算法最多犯几次错？', type: 'num', answer: 4, explain: '$\\log_2 16=4$。' },
      { q: 'Halving：最好的专家错 2 次，$n=8$。错误上界约为？', type: 'num', answer: 12.05, tol: 0.1, explain: '$2.41\\times(2+3)\\approx12.05$。' },
    ],
  }));
})(window);
