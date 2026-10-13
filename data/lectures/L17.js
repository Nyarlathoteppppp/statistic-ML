(function (root) {
  'use strict';
  const T = String.raw;
  root.SML.content.add(root.SML.lecture({
    id: 'L17',
    eyebrow: '单元 5 · Honorio · 2/3 卷考 UCB',
    chips: ['L17 p1–p27', { text: 'T2 UCB', href: '#/T02' }],
    lead: '多臂老虎机是"探索 vs 利用"最简单的设定。考试重点是 **UCB 的计算和机制**（[T2](#/T02)），其次是 greedy / ε-greedy 的行为。',
    oneLiner: {
      zh: '每轮选一个臂、只看到它的奖励，目标是累计 regret 最小。UCB 用"均值 + 不确定性奖励"给每个臂打分，拉得少的臂被乐观估计，从而自动探索。',
      en: T`In a stochastic multi-armed bandit the learner repeatedly picks one of $k$ arms and observes only that arm's reward, aiming to minimise cumulative regret $\mu^*T-\sum_t E[R_{i_t}(t)]$. UCB plays the arm maximising $\hat\mu_{t-1}(i)+\sqrt{2\ln t/N_{t-1}(i)}$: optimism in the face of uncertainty, with $O(\log t)$ regret.`,
    },
    why: [
      '只利用（greedy）会被早期的运气锁死；随机探索（ε-greedy）浪费在明显差的臂上。UCB 的探索是**有方向的**：越不确定的臂越值得试（p14–p18）。',
      '和 experts（L16）的区别：experts 每轮看到所有专家的损失；bandit 只看到自己选的那个臂（partial feedback），所以必须主动探索（p2、p15）。',
    ],
    defs: [
      ['arm / round', '$k$ 个动作；第 $t$ 轮选 $i_t$，得到 $R_{i_t}(t)\\sim P_{i_t}$', 'p6'],
      ['cumulative regret', '$\\mu^*T-\\sum_{t=1}^T E[R_{i_t}(t)]$，$\\mu^*=\\max_i\\mu_i$', 'p6'],
      ['greedy', '$i_t\\in\\argmax_iQ_{t-1}(i)$，$Q$ 为经验均值，未拉过用 $Q_0$', 'p7'],
      ['ε-greedy', '概率 $1-\\varepsilon$ greedy，概率 $\\varepsilon$ 均匀随机', 'p10'],
      ['UCB', '$Q_{t-1}(i)=\\hat\\mu_{t-1}(i)+\\sqrt{2\\ln t/N_{t-1}(i)}$；没拉过的臂用 $Q_0$', 'p18'],
      ['contextual bandit', '每轮有 context（状态），奖励估计变成回归 $E[R_i\\mid\\bx_i(t)]$', 'p24–p25'],
    ],
    examples: [
      {
        t: 'table', head: ['设置', '课件结论'], rows: [
          ['greedy，$Q_0=-\\infty$', '第一次拉谁就永远拉谁（p8）'],
          ['greedy，$Q_0=+\\infty$', '前 $k$ 轮每臂一次，之后纯利用（p9）'],
          ['10 臂 Gaussian，2000 轮', 'greedy 很快停在低水平；0.01-greedy 起步慢但最终超过 0.1-greedy（p12）'],
          ['UCB(2) vs ε-greedy', 'UCB 很快超过并保持领先，累计奖励差距更明显（p19–p21）'],
        ],
      },
      { t: 'viz', id: 'ucb-calc', opts: { preset: 'EX2026Q2' } },
    ],
    compare: [{
      t: 'table', head: ['', 'experts（L16）', 'bandit（L17）', 'RL'], rows: [
        ['反馈', '所有专家的损失', '只有选中臂的奖励', '奖励 + 状态转移'],
        ['是否需要探索', '不需要', '需要', '需要'],
        ['状态', '无', '无（contextual 有）', '有，且动作影响下一状态（p26）'],
      ],
    }],
    pitfalls: [
      ['UCB 里每个臂用自己的次数当 $t$', '$t$ 对所有臂相同 = 总次数 + 1'],
      ['UCB 值是概率，不能大于 1', 'UCB 是均值的上置信界，可以超过 1'],
      ['乐观初始化能让 greedy 一直探索', '只解决冷启动，之后仍然纯利用（p13）'],
    ],
    errata: ['p17 同时出现 $\\varepsilon=1/t$ 与 "take $\\varepsilon=1/t^4$"。和公式里的 2 对应的是 $1/t^4$（推导见 [T2](#/T02/related)）。'],
    types: ['T02'],
    quiz: [
      {
        q: '3 个臂分别拉了 1、4、9 次，均值都是 0.5，$\\ln t\\approx2$。UCB 选哪个？', type: 'set', answer: ['1'],
        explain: 'bonus $=\\sqrt{4/N}$：$2,\\ 1,\\ 0.667$。均值相同，选拉得最少的臂 1。',
      },
      {
        q: 'UCB 的 regret 随时间怎样增长？', options: ['$O(\\log t)$', '$O(\\sqrt t)$', '$O(t)$', '常数'], answer: 0,
        explain: 'L17 p22：$O(\\log t)$，所以平均 regret → 0。',
      },
    ],
  }));
})(window);
