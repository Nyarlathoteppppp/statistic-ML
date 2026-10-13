(function (root) {
  'use strict';
  const T = String.raw;
  root.SML.content.add(root.SML.lecture({
    id: 'L06',
    eyebrow: '单元 2 · Honorio · 概念为主',
    chips: ['L06 p1–p33'],
    lead: '学习理论的起点：训练误差低不代表测试误差低，那能不能**保证**测试误差不会比训练误差差太多？这一讲给出有限模型类的答案。考试一般只考概念和公式含义，讲者明确说**不考证明**。',
    oneLiner: {
      zh: '对有限的分类器集合 $\\mathcal F$，以至少 $1-\\delta$ 的概率，真实风险 ≤ 经验风险 + $\\sqrt{(\\log|\\mathcal F|+\\log(1/\\delta))/(2n)}$：模型类越大，惩罚越大；样本越多，惩罚越小。',
      en: T`For a finite class $\mathcal F$, with probability at least $1-\delta$ over $n$ i.i.d. training samples, $R[\hat f]\le\hat R[\hat f]+\sqrt{\frac{\log|\mathcal F|+\log(1/\delta)}{2n}}$. The gap grows with the size of the class and shrinks as $n$ grows, for any data distribution.`,
    },
    why: [
      '我们真正关心的是 **true risk**（在未见数据上的期望损失），但它算不出来（分布 $P$ 未知）；能算的只有 **empirical risk**（训练误差）。泛化界告诉我们两者差距的上界（p11–p17）。',
      '讲者在 transcript 里强调：**训练数据本身是随机变量**——换一批病人数据，选出来的分类器也会变。所以界是"以高概率成立"，不是一定成立。',
    ],
    defs: [
      ['empirical risk', '$\\hat R_D[f]=\\frac1n\\sum_i l(y_i,f(\\bx_i))$，训练集上的平均损失', 'p12'],
      ['ERM', '$\\hat f_D=\\argmin_{f\\in\\mathcal F}\\hat R_D[f]$', 'p13'],
      ['true risk', '$R[f]=\\mathbb E\\,l(Y,f(X))$；0–1 loss 下就是期望测试误差', 'p14'],
      ['under-fitting', '经验风险和真实风险都大', 'p15'],
      ['over-fitting', '经验风险小但真实风险大', 'p15'],
      ['SRM', '在多个模型类里选"经验风险 + 复杂度惩罚"最小的', 'p18'],
    ],
    formulas: [
      {
        t: 'fx', title: '有限类泛化界（L06 p17）',
        tex: T`\htmlClass{fx-p1}{R[\hat f_D]}\le\htmlClass{fx-p2}{\hat R_D[\hat f_D]}+\htmlClass{fx-p3}{\sqrt{\frac{\log|\mathcal F|+\log(1/\delta)}{2n}}}`,
        parts: [
          { label: 'true risk', note: '想控制的量：在新数据上的误差。' },
          { label: 'empirical risk', note: '能算出来的训练误差。' },
          { label: '复杂度惩罚', note: '$|\\mathcal F|$ 越大（模型类越复杂）越大；$n$ 越大越小（$\\propto1/\\sqrt n$）；要求的置信度越高（$\\delta$ 越小）越大。' },
        ],
      },
      { t: 'note', md: '课件例子 p17：$|\\mathcal F|=8$，$\\delta=0.1$ ⇒ 惩罚 $\\sqrt{(\\log8+\\log10)/(2n)}$。前提：损失在 $[0,1]$（Hoeffding 的条件，p32）。' },
      {
        t: 'deep', title: '展开详解：证明思路（只需知道用了哪两个工具）', blocks: [
          {
            t: 'steps', items: [
              '目标：$R[\\hat f]-\\hat R[\\hat f]\\le\\varepsilon$。因为 $\\hat f$ 依赖数据，没法直接用集中不等式，所以改为要求**所有** $f\\in\\mathcal F$ 都满足（"没人比屋里最高的人更高"）。',
              '"对所有 $f$ 成立"的反面是"对某个 $f$ 不成立"，用 **union bound** 把概率拆成每个 $f$ 的概率之和。',
              '对固定的 $f$，用 **Hoeffding**：$\\Pr[R[f]-\\hat R[f]>\\varepsilon]\\le e^{-2n\\varepsilon^2}$。',
              '合起来 $\\le|\\mathcal F|e^{-2n\\varepsilon^2}=\\delta$，解出 $\\varepsilon$ 就是那个根号。',
            ],
          },
        ],
      },
    ],
    compare: [{
      t: 'table', head: ['', '简单模型类', '复杂模型类'], rows: [
        ['经验风险', '大', '小'], ['复杂度惩罚', '小', '大'], ['风险', 'under-fitting', 'over-fitting'],
      ],
    }],
    pitfalls: [
      ['泛化界一定成立', '以概率 $\\ge1-\\delta$ 成立；训练集可能"倒霉"'],
      ['界依赖数据分布', '与 $P$ 无关（distribution-free），所以可能很悲观'],
      ['$|\\mathcal F|$ 能用于线性分类器', '线性分类器有无穷多个，$\\log|\\mathcal F|=\\infty$，要用 VC 维（L07）'],
    ],
    types: ['T12', 'T13'],
    quiz: [
      {
        q: '样本数从 $n$ 增加到 $4n$，有限类泛化界中的惩罚项变为原来的多少？', type: 'num', answer: 0.5,
        explain: '惩罚 $\\propto1/\\sqrt n$，$\\sqrt{1/4}=1/2$。',
      },
      {
        q: '为什么 true risk 不能直接计算？', type: 'show', answerText: '因为数据分布 $P(X,Y)$ 未知，只能用有限样本估计。',
      },
    ],
  }));
})(window);
