/* T2 — Multi-armed bandits: UCB / greedy / ε-greedy (L17). */
(function (root) {
  'use strict';
  const T = String.raw;

  root.SML.content.add({
    id: 'T02',
    eyebrow: '题型 T2 · 6–8 分',
    title: 'UCB：算每个臂的值，选下一个臂',
    en: 'Upper Confidence Bound (UCB) for multi-armed bandits',
    chips: [
      { text: 'L17 p6–p22', href: '#/L17', cls: 'src' },
      { text: '2026 practice Q2', cls: 'hot' }, { text: '2021 exam Q17', cls: 'hot' }, { text: 'Worksheet 10 同题', cls: 'src' },
    ],
    lead: '一个公式，三个数代进去。难点只有两个：**$t$ 等于多少**，以及**不用计算器怎么开根号**（题目会给 $\\ln$ 的近似值，数字也会设计成能开方）。',
    blocks: [
      { t: 'h2', text: '1. 设定（30 秒看懂）', id: 'setting' },
      {
        t: 'table', head: ['符号', '含义'], rows: [
          ['$k$ 个 arm', '$k$ 台老虎机，每台的奖励分布 $P_i$ 均值 $\\mu_i$ 未知（L17 p6）'],
          ['第 $t$ 轮', '选一个臂 $i_t$，**只**看到这个臂的奖励 $R_{i_t}(t)$，没选的臂这一轮奖励未知——这叫部分反馈（对比 W8 的 experts：每轮能看到所有专家的对错）'],
          ['$N_{t-1}(i)$', '前 $t-1$ 轮里臂 $i$ 被拉了几次'],
          ['$\\hat\\mu_{t-1}(i)$', '臂 $i$ 到目前为止的平均奖励'],
          ['目标', '最小化 cumulative regret $\\mu^*T-\\sum_t E[R_{i_t}(t)]$：$\\mu^*$ 是最好那只臂的真实均值（未知），$T$ 是总轮数（不是当前轮 $t$）；regret = "一直拉最好的臂"的期望总奖励减去你的期望总奖励。计算题只要求算 $Q$ 选臂，不用算 regret'],
        ],
      },

      { t: 'h2', text: '2. UCB 公式', id: 'formula' },
      {
        t: 'fx', title: 'UCB 值（L17 p18）',
        tex: T`Q_{t-1}(i)=\htmlClass{fx-p1}{\hat\mu_{t-1}(i)}+\htmlClass{fx-p2}{\sqrt{\frac{\htmlClass{fx-p3}{2\ln t}}{\htmlClass{fx-p4}{N_{t-1}(i)}}}}`,
        intro: '每一轮对**所有**臂算这个值，拉值最大的那个（平局随机）。没拉过的臂直接用初始值 $Q_0$。',
        parts: [
          { label: 'exploitation', note: '经验平均奖励 $=\\dfrac{\\text{该臂累计奖励}}{\\text{该臂被拉次数}}$。2026 卷（第 5 节的题）arm 1 拉了 64 次、其中 40 次奖励为 1：$40/64=5/8=0.625$。' },
          { label: 'exploration bonus', note: '不确定性奖励。拉得越少，这一项越大，所以被冷落的臂会被"乐观地"高估（optimism in the face of uncertainty）。' },
          { label: '$2\\ln t$', note: '$t$ 是**当前这一轮的编号** = 已拉总次数 + 1，所有臂用同一个 $t$。随时间缓慢增长，所以长期没被拉的臂的 bonus 会慢慢变大。2026 卷：$64+16+4=84$ 次已拉，$t=85$。' },
          { label: '$N_{t-1}(i)$', note: '该臂自己被拉的次数。每个臂不同，是 bonus 差别的来源。' },
        ],
      },
      {
        t: 'warn', title: '$t$ 用哪个数',
        md: '公式下标是 $t-1$（用前 $t-1$ 轮的数据），根号里是 $\\ln t$。已经拉了 84 次，正在决定第 85 次 ⇒ $t=85$。题目给的近似值表里同时有 $\\ln 84$ 和 $\\ln 85$，就是在考这个（这两个都约等于 4.5，用哪个结果都一样，但写 $t=85$ 才对）。',
      },

      { t: 'h2', text: '3. 解题步骤', id: 'steps' },
      {
        t: 'steps', items: [
          T`写出 $t=\sum_i N_{t-1}(i)+1$。`,
          T`每个臂算 $\hat\mu=$ 奖励 / 次数。`,
          T`每个臂算 bonus $\sqrt{2\ln t/N}$。用题目给的 $\ln t$；分子分母凑成完全平方（$2\times4.5=9$，$9/64=(3/8)^2$）。`,
          T`$Q=\hat\mu+\text{bonus}$，列成表。`,
          T`选 $Q$ 最大的臂，**写一句为什么**（通常是：均值不是最高，但拉得少，bonus 大）。`,
        ],
      },
      {
        t: 'exam', md: T`$t = 64+16+4+1 = 85$, $\ln 85\approx4.5$, so $2\ln t\approx 9$.
$Q(1)=\tfrac{40}{64}+\sqrt{9/64}=0.625+0.375=1.0$; $Q(2)=\tfrac{10}{16}+\sqrt{9/16}=0.625+0.75=1.375$; $Q(3)=\tfrac{2}{4}+\sqrt{9/4}=0.5+1.5=2.0$.
Pull arm 3: it has the largest UCB value. Its empirical mean is the lowest, but it has been pulled only 4 times, so its exploration bonus (uncertainty) dominates — optimism in the face of uncertainty.`,
      },

      { t: 'h2', text: '4. 计算器', id: 'solver' },
      '可以改每个臂的次数和奖励，切换"精确 ln"和"考试给的近似值"。',
      { t: 'viz', id: 'ucb-calc', opts: { preset: 'EX2026Q2' } },

      { t: 'h2', text: '5. 真题全解', id: 'past' },
      {
        t: 'past', src: '2026 S2 practice Q2', marks: 6, topic: 'L17 p18',
        q: 'You are running a multi-armed bandit problem with 3 arms. The rewards from each arm are binary (0 or 1), and so far you have pulled the arms with the following results: Arm 1: pulled 64 times, with 40 rewards of 1. Arm 2: pulled 16 times, with 10 rewards of 1. Arm 3: pulled 4 times, with 2 rewards of 1. Using the UCB algorithm, calculate the value of each arm based on the given results. Based on your calculations, which arm should you pull next, and why?\n\n*Useful values:* $\\ln 4\\approx1.4$, $\\ln 16\\approx2.8$, $\\ln 64\\approx4.2$, $\\ln 84\\approx4.5$, $\\ln 85\\approx4.5$ …',
        qzh: T`你在运行一个有 3 个臂（arm）的多臂老虎机（multi-armed bandit）问题。每个臂的奖励是二元的（0 或 1），到目前为止拉臂的结果如下：臂 1：拉了 64 次，其中 40 次奖励为 1。臂 2：拉了 16 次，其中 10 次奖励为 1。臂 3：拉了 4 次，其中 2 次奖励为 1。用 UCB 算法，根据这些结果计算每个臂的值。根据你的计算，下一次应该拉哪个臂，为什么？*有用的数值：* $\ln 4\approx1.4$，$\ln 16\approx2.8$，$\ln 64\approx4.2$，$\ln 84\approx4.5$，$\ln 85\approx4.5$ …`,
        azh: T`$t = 64+16+4+1 = 85$，$\ln 85\approx4.5$，所以 $2\ln t\approx 9$。
$Q(1)=\tfrac{40}{64}+\sqrt{9/64}=0.625+0.375=1.0$；$Q(2)=\tfrac{10}{16}+\sqrt{9/16}=0.625+0.75=1.375$；$Q(3)=\tfrac{2}{4}+\sqrt{9/4}=0.5+1.5=2.0$。
拉臂 3：它的 UCB 值最大。它的经验均值（empirical mean）最低，但只被拉了 4 次，所以它的探索奖励（exploration bonus，即不确定性）占主导——面对不确定性保持乐观（optimism in the face of uncertainty）。`,
        sol: [
          {
            t: 'table', head: ['', 'Arm 1', 'Arm 2', 'Arm 3'], rows: [
              ['$N$', '64', '16', '4'],
              ['$\\hat\\mu$（奖励只有 0/1："40 rewards of 1" = 40 次得 1、24 次得 0，累计 40）', '$40/64=0.625$', '$10/16=0.625$', '$2/4=0.5$'],
              ['$2\\ln t/N$（已拉 $64+16+4=84$ 次 ⇒ $t=85$，$\\ln85\\approx4.5$，$2\\ln t\\approx9$）', '$9/64$', '$9/16$', '$9/4$'],
              ['bonus $=\\sqrt{2\\ln t/N}$（开方）', '$\\sqrt{9/64}=\\frac{\\sqrt9}{\\sqrt{64}}=3/8=0.375$', '$\\sqrt{9/16}=3/4=0.75$', '$\\sqrt{9/4}=3/2=1.5$'],
              ['$Q=\\hat\\mu+$bonus', '$0.625+0.375=$ **1.0**', '$0.625+0.75=$ **1.375**', '$0.5+1.5=$ **2.0**'],
            ],
          },
          '结论：拉 **arm 3**。arm 1 和 arm 2 的均值一样（0.625），但 arm 2 拉得少，所以 bonus 更大；arm 3 均值最低，但只拉了 4 次，不确定性最大，UCB 认为它"可能很好"，值得探索。',
          { t: 'note', md: '题目给的 $\\ln 4,\\ln 16,\\ln 64$ 是干扰项：有人会错用"每个臂自己的次数"代替 $t$。所有臂用同一个 $t=85$。Workshop 10 的手算题就是这一道（写明 $\\rho=2$），官方答案同样是 $t=85$、$Q=(1,\\ 11/8,\\ 2)$、拉 arm 3；它还多给了 $\\ln 5,\\ln 17,\\ln 65$，是给"每个臂的次数 + 1"这种错用准备的干扰项。' },
        ],
      },
      {
        t: 'past', src: '2021 S1 exam Q17', marks: 8, topic: 'L17 p8–p9, p18',
        q: 'Describe two mechanisms used by the Upper Confidence Bound (UCB) multi-armed bandit (MAB) to explore arms that so far have no demonstrated high rewards. *(Formula given: $Q_{t-1}(i)=\\hat\\mu_{t-1}(i)+\\sqrt{\\rho\\log t/N_{t-1}(i)}$; unobserved arms are initialised with value estimate $Q_0$, a hyperparameter.)*',
        qzh: T`描述上置信界（Upper Confidence Bound, UCB）多臂老虎机（multi-armed bandit, MAB）用来探索那些目前还没有表现出高奖励的臂的两种机制。*（给定公式：$Q_{t-1}(i)=\hat\mu_{t-1}(i)+\sqrt{\rho\log t/N_{t-1}(i)}$；未被观测过的臂用值估计 $Q_0$ 初始化，$Q_0$ 是一个超参数（hyperparameter）。）*`,
        azh: T`(1) 乐观初始化（optimistic initialisation）：从未被拉过的臂取值 $Q_0$；当 $Q_0=+\infty$（大于任何可达到的值）时，在开始利用（exploitation）之前，每个臂都至少会被尝试一次。
(2) 探索奖励（exploration bonus）$\sqrt{\rho\log t/N_{t-1}(i)}$：一个臂被拉的次数少时它很大；而且对一个被冷落的臂，$\log t$ 不断增长而 $N_{t-1}(i)$ 保持不变，所以它的奖励项会一直增大，直到它最终再次被拉。$\rho$ 越大，探索越多。`,
        sol: [
          '（这道题的 bonus 写成 $\\sqrt{\\rho\\log t/N}$：课件写 $\\log$、真题近似值写 $\\ln$，是同一种自然对数；前面公式里的常数 2 在这里换成可调的 $\\rho$，越大越爱探索。这道题只问机制，不用代数。）',
          {
            t: 'ul', items: [
              '**机制 1：初始值 $Q_0$。** 没拉过的臂用 $Q_0$。$Q_0=+\\infty$（乐观初始化）时，每个臂都会先被拉至少一次（L17 p9 对 greedy 的结论；有限的 $Q_0$ 不一定保证）。',
              '**机制 2：exploration bonus $\\sqrt{\\rho\\log t/N}$。** 拉得少的臂 $N$ 小，bonus 大；而且 $\\log t$ 随时间增长，一个臂越久没被拉，bonus 越大，迟早会再被选中。所以奖励看起来不高的臂也会被定期重新检查。',
              '（可加一句）$\\rho$ 控制探索强度：越大越爱探索。',
            ],
          },
          {
            t: 'exam', md: T`(1) Optimistic initialisation: arms that have never been pulled take the value $Q_0$; with $Q_0=+\infty$ (larger than any attainable value) every arm is tried at least once before exploitation starts.
(2) The exploration bonus $\sqrt{\rho\log t/N_{t-1}(i)}$: it is large when an arm has been pulled few times, and since $\log t$ keeps growing while $N_{t-1}(i)$ stays fixed for a neglected arm, its bonus increases until it is eventually pulled again. Larger $\rho$ means more exploration.`,
          },
        ],
      },

      { t: 'h2', text: '6. 随机练习', id: 'practice' },
      { t: 'practice', gen: 'ucb', title: 'UCB 随机题' },

      { t: 'h2', text: '7. 同一讲里还可能考什么', id: 'related' },
      {
        t: 'table', head: ['方法', '规则', '课件结论'], rows: [
          ['Greedy', '$i_t\\in\\argmax_i Q_{t-1}(i)$，$Q$ = 经验均值（注意：这里的 $Q$ 没有 bonus；UCB 的 $Q$ 才是均值 + 根号）', '只利用不探索；行为取决于 $Q_0$（p7）'],
          ['Greedy, $Q_0=-\\infty$（悲观）', '', '第一次拉了谁，以后永远拉它（p8）'],
          ['Greedy, $Q_0=+\\infty$（乐观）', '', '前 $k$ 轮每个臂各拉一次，之后纯利用（p9）'],
          ['$\\varepsilon$-greedy', '概率 $1-\\varepsilon$ 选最优，概率 $\\varepsilon$ 均匀随机', '探索是"盲目"的，不看哪个臂更有希望（p10、p14）'],
          ['UCB', '均值 + bonus', 'regret $O(\\log t)$，平均 regret → 0（p22）'],
        ],
      },
      {
        t: 'deep', title: '展开详解：bonus 为什么长这样（Hoeffding）', hint: '简答题可能问"UCB 的 bonus 从哪来"',
        blocks: [
          'Hoeffding 不等式（L17 p17）：$n$ 个 $[0,1]$ 上 i.i.d. 的奖励，样本均值 $\\bar R_n$，以至少 $1-\\varepsilon$ 的概率',
          { t: 'math', tex: T`\mu\le\bar R_n+\sqrt{\frac{\log(1/\varepsilon)}{2n}}` },
          '（这里的 $\\varepsilon$ 是"不等式不成立的概率"，不是 ε-greedy 的探索概率；$\\mu$ 是这只臂的真实均值。）令 $n=N_{t-1}(i)$，$\\varepsilon=1/t^4$：$\\log(1/\\varepsilon)=4\\log t$，于是 $\\sqrt{\\frac{4\\log t}{2N}}=\\sqrt{\\frac{2\\log t}{N}}$（$4/2=2$），正好是 UCB 的 bonus。所以 $Q$ 是均值的一个**高概率上界**（upper confidence bound），名字由此而来。',
          { t: 'errata', md: 'L17 p17 同时提到 $\\varepsilon=1/t$（Lai & Robbins）和"take $\\varepsilon=1/t^4$"。和公式里的 2 对应的是 $1/t^4$。' },
          '把 2 换成可调的 $\\rho>0$（p22）可以控制探索强度，也能处理奖励不在 $[0,1]$ 的情况。',
        ],
      },
      {
        t: 'quiz', items: [
          {
            q: '4 个臂分别拉了 9、9、9、9 次，均值都是 0.5，现在是第几轮？此时 UCB 会选哪个？',
            options: ['$t=36$，选第一个', '$t=37$，四个臂 $Q$ 相同，随机选一个', '$t=9$，选 bonus 最大的', '无法确定'], answer: 1,
            explain: '$t=9\\times4+1=37$。四个臂的均值和次数都相同，$Q$ 也相同，按课件规则随机打破平局（L17 p18 "tie breaking randomly"）。',
          },
          {
            q: 'Greedy 用 $Q_0=+\\infty$，共 5 个臂。前 5 轮会发生什么？',
            options: ['一直拉第一个臂', '每个臂各拉一次', '随机拉', '拉均值最大的'], answer: 1,
            explain: '拉过的臂的值变成有限的奖励均值，没拉过的仍是 $+\\infty$，所以下一轮一定选没拉过的（L17 p9）。',
          },
          {
            q: 'UCB 和 $\\varepsilon$-greedy 探索方式最大的区别？', type: 'show',
            answerText: '$\\varepsilon$-greedy 的探索是盲目的，UCB 的探索偏向不确定性大的臂。',
            explain: '$\\varepsilon$-greedy 以概率 $\\varepsilon$ **均匀**随机选臂，不管哪个臂有希望（L17 p14）。UCB 给拉得少的臂加 bonus，探索集中在"可能好但还不确定"的臂上，所以实验里很快超过 $\\varepsilon$-greedy（p19–p21）。',
          },
        ],
      },
    ],
  });
})(window);
