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
      { text: 'L17 p6–p26', href: '#/L17', cls: 'src' },
      { text: '2026 practice Q2', cls: 'hot' }, { text: '2021 exam Q17', cls: 'hot' }, { text: 'Worksheet 10 同题', cls: 'src' },
      { text: '2022 exam Q6（20 分设计题）', cls: 'hot' },
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

      { t: 'h2', text: '6. Section C 设计题：把业务问题写成 contextual bandit', id: 'design' },
      T`Section C 是设计题（design and application question）：把课上的方法套到一个真实场景里，答案约一页。2022 年的 Section C 整题 20 分，就是 contextual bandit（上下文老虎机）建模；2026 年 Section C 考什么不确定（往年多数是 PGM 建模，见 [T7](#/T07)）。这类题没有唯一答案，按下面的步骤把每个要素对上 L17 的术语，就能拿到大部分分。`,
      {
        t: 'steps', items: [
          T`**reward**：把业务目标翻译成每一轮的一个数。管理层看什么指标，reward 就是它在一轮里的增量（点击 = 1，没点 = 0；累计 reward = 总点击数）。`,
          T`**arms**：每一轮要在哪些选项里挑一个。写清楚一个 arm 具体是什么（例如一篇文章的一个"标题 + 图片"组合）。`,
          T`**round**：什么时候做一次选择、并马上看到 reward（例如一个用户打开首页、某篇文章的预览要显示的那一次）。`,
          T`**context**：做选择前能看到的信息，写成每个臂的特征向量 $\bX_i(t)$ = 用户特征 + 这个臂的特征。奖励估计变成回归 $E[R_i(t)\mid\bX_i(t)]$，仍然选 UCB 最大的臂，只是 UCB 加在回归预测上（L17 p25，[c49](#/c49)）。`,
          T`**检查假设**：标准 MAB 假设每个臂的奖励 i.i.d.（L17 p6）。说清楚哪里不成立、上下文能补救多少；顺便确认动作不改变下一个状态（否则就是强化学习 RL，L17 p26）。`,
          T`**评估**：要离线比较很多算法，就收集一份臂是均匀随机选的日志，用 replay 回放评估（Workshop 10，[c48](#/c48) ⑥）。`,
        ],
      },
      {
        t: 'past', src: '2022 S1 exam Q6（全题 20 分）', marks: 20, topic: 'L17 p6, p24–p26; Workshop 10',
        q: 'Question 6: Online Content Testing [20 marks]\n\nYour task is to design an automatic content recommendation system for a major newspaper "TechNews" to use to select which headlines to use for articles on its online front page, and which pictures to display for these front page article previews. TechNews has very many users, and serves very many different articles across different categories (like local news, international news, opinion pieces, investment, etc.). TechNews wants to encourage user engagement with their platform, so that users keep returning to the news service (driving more subscription and ad revenue). TechNews management therefore will judge the performance of its content recommendation system by *cumulative clicks*. Complicating matters, different kinds of users typically click on different kinds of articles according to their tastes in article categories, types of headlines, and picture previews, etc. Your goal is to recommend headlines and pictures to display to maximise the total number of clicks, where each article comes with a number of different available headlines and picture previews to choose from.\n\n(a) Formulate the content recommendation task as a *contextual multi-armed bandit problem*. Explain what your arms are, what rounds correspond to, and what are your rewards. [6 marks]\n\n(b) What context vectors will you use based on what data TechNews might possess? [6 marks]\n\n(c) Comment on whether the typical bandit assumption of independent and identically distributed rewards per arm is appropriate. Does context make this assumption more or less realistic? [4 marks]\n\n(d) Describe what data TechNews should collect, so that you could efficiently evaluate the effectiveness of a huge number of bandit learners. [4 marks]',
        qzh: T`第 6 题：在线内容测试（20 分）。你要为一家大报社 "TechNews" 设计一个自动内容推荐系统：决定网站首页上每篇文章用哪个标题（headline），以及文章预览配哪张图片（picture preview）。TechNews 用户很多，文章也很多，分属不同类别（本地新闻、国际新闻、评论、投资等）。TechNews 希望提高用户参与度，让用户不断回来（带来更多订阅和广告收入），所以管理层用**累计点击数**（cumulative clicks）评价推荐系统。麻烦的是，不同类型的用户按自己对文章类别、标题类型、预览图片等的口味，点击的文章不同。你的目标是推荐要显示的标题和图片，使总点击数最大；每篇文章都有若干个可选的标题和预览图片。
(a) 把内容推荐任务写成一个上下文多臂老虎机（contextual multi-armed bandit）问题：说明你的臂（arm）是什么、一轮（round）对应什么、奖励（reward）是什么。[6 分]
(b) 根据 TechNews 可能拥有的数据，你会用什么上下文向量（context vector）？[6 分]
(c) 评论一下 bandit 通常的假设——每个臂的奖励独立同分布（i.i.d.）——在这里是否合适。上下文让这个假设更现实还是更不现实？[4 分]
(d) 描述 TechNews 应该收集什么数据，才能高效地评估大量 bandit 学习器的效果。[4 分]`,
        sol: [
          { t: 'note', md: '题干来自 2022 S1 正式考试的网页转载版，Q6 文字完整，没有图。(d) 的离线评估 L17 没讲，来自 Workshop 10（c48 ⑥ 已讲 replay 方法），下面按那个方法作答。Section C 要求约一页：每个 6 分小问写 4–6 句，4 分小问写 3–4 句。' },
          { t: 'h4', text: '(a) arms、rounds、rewards（6 分）' },
          '题干有两条关键约束：管理层按"累计点击"打分，决定了 reward；不同用户口味不同，决定了要用 contextual bandit，而不是普通 MAB。',
          {
            t: 'ul', items: [
              T`arm（臂）：一篇文章有几个候选标题和几张候选图片，一个 arm = 一个"标题 + 图片"组合；$h$ 个标题、$p$ 张图就是 $h\times p$ 个臂，每个文章位置做一次选择。也可以把标题和图片拆成两个独立的 bandit（臂更少、学得更快），代价是学不到"这个标题配这张图特别好"的搭配效果。两种都行，写清楚取舍。`,
              'round（轮）：一个用户打开首页、这篇文章的预览要显示的那一次。每一轮：看到上下文 → 选一个臂 → 显示 → 观察点没点。',
              'reward（奖励）：点了 = 1，没点 = 0。累计 reward 正好等于管理层看的总点击数，所以最小化 regret 就是业务目标。',
              T`contextual 的部分：每轮还观察每个臂的上下文向量 $\bX_i(t)$，用回归估计 $E[R_i(t)\mid\bX_i(t)]$，再选 UCB 最大的臂（L17 p25）。`,
            ],
          },
          {
            t: 'exam', title: 'Exam phrasing · (a)',
            md: T`**Arms:** for each article on the front page, the arms are its available (headline, picture preview) combinations; with $h$ headlines and $p$ pictures there are $h\times p$ arms. (Alternatively one bandit for headlines and one for pictures: fewer arms, but it ignores how a headline and a picture work together.)

**Rounds:** each time a user loads the front page and a preview of the article must be displayed. In each round the learner observes the context, chooses one arm and shows it.

**Rewards:** 1 if the user clicks the article preview, 0 otherwise. The cumulative reward is then exactly the total number of clicks management uses to judge the system, so maximising cumulative reward (minimising regret) is the business goal.

Because users' tastes differ, each round we also observe a context vector $\mathbf X_i(t)$ for each arm, estimate $E[R_i(t)\mid\mathbf X_i(t)]$ by regression, and play the arm with the highest UCB on the regression prediction (e.g. LinUCB).`,
          },
          { t: 'h4', text: '(b) context vectors（6 分）' },
          '6 分要写出几类具体特征，并说明它们来自 TechNews 的哪些数据、为什么能帮助预测点击。L17 p25 的三类例子是"访问者资料（state）、网页内容（state）、候选广告的特征（arm）"，照这个思路分类：',
          {
            t: 'table', head: ['来源（TechNews 有的数据）', '特征', '为什么有用'], rows: [
              ['用户账户、订阅信息', '是否订阅、订阅类型、地区、注册多久', '不同人群口味不同（state）'],
              ['历史点击日志', '该用户在各类别（本地、国际、评论、投资…）上的历史点击率；对不同标题风格、图片类型的点击率；最近访问频率', '直接刻画"这个人爱点什么"，题目说的 taste 就是它'],
              ['本次访问（匿名用户也有）', '设备（手机 / 电脑）、时段、星期几、从哪个页面进来', '没登录的用户只能靠这些'],
              ['文章本身', '类别、关键词 / 主题、作者、发布了多久', '新文章也能借用老文章的经验'],
              ['臂本身（标题、图片）', '标题长度、风格（疑问句、数字、引语）、情感倾向；图片类型（人脸、场景、图表）、颜色等图像特征', '对应 L17 p25 的 features of a potential ad (arm)'],
              ['交叉特征', '例如"该用户对这篇文章所属类别的历史点击率"', '线性回归学不到乘积关系，要手工构造（[c12](#/c12) 的 basis expansion 思路）'],
            ],
          },
          '编码：类别型特征用 one-hot，数值特征标准化，再拼成一个向量。特征里有文章和臂的特征，回归就能在不同文章之间共享信息：一个新标题还没被展示几次，也能先得到一个合理的点击率估计（冷启动 cold start）。',
          {
            t: 'exam', title: 'Exam phrasing · (b)',
            md: T`The context vector $\mathbf X_i(t)$ for arm $i$ in round $t$ concatenates (categorical features one-hot encoded, numerical features standardised):

- User features (state): subscription status and type, location, device, time of day and day of week; from TechNews' click logs, the user's historical click-through rate per article category (local, international, opinion, investment, …), per headline style and per picture type. Anonymous users only have the session features.
- Article features: category, topic keywords, author, age (freshness) of the article.
- Arm features: headline length, style (question, number, quote), sentiment and keywords; picture type (face, scene, chart), colour and other image features.
- Interactions: e.g. the user's past click rate on this article's category.

Article and arm features let the regression share information across articles, so a new headline or picture gets a sensible estimate before it has been shown many times.`,
          },
          { t: 'h4', text: '(c) i.i.d. 假设合不合适（4 分）' },
          T`标准 MAB 假设每个臂 $i$ 有一个固定的奖励分布 $P_i$，每轮的奖励从 $P_i$ 独立抽取（L17 p6；UCB 用的 Hoeffding 不等式也要求 i.i.d.，L17 p17）。这里有三处不成立：`,
          {
            t: 'ul', items: [
              '不同分布（not identically distributed）：同一个标题，体育迷点击率高，别人低；每一轮来的用户不同，奖励的分布跟着变。',
              '随时间变（non-stationary）：新闻会过时，早晚的读者不同，突发新闻会让某类文章突然变热。',
              '不独立（not independent）：同一个用户反复看到同一个标题，后面更不会点；同一时段的用户受同一条热点影响。',
            ],
          },
          T`上下文的作用：把用户、文章、时间的特征放进 $\bX_i(t)$ 后，只需要假设"给定上下文时奖励独立、均值为 $E[R_i(t)\mid\bX_i(t)]$"。用户之间的差异被上下文解释掉了，所以假设**更现实**；随时间的漂移和重复曝光造成的依赖只能部分缓解（可以把时间、文章新鲜度、"该用户是否看过这个标题"也做成特征）。`,
          {
            t: 'exam', title: 'Exam phrasing · (c)',
            md: T`Not fully appropriate. The standard bandit assumes each arm's rewards are i.i.d. draws from a fixed distribution $P_i$. Here the click probability of the same headline and picture depends on who is viewing it (users' tastes differ), so rewards are not identically distributed across rounds; it also drifts over time (news goes stale, time-of-day effects, breaking news), and showing the same headline to the same user repeatedly makes rewards dependent.
Context makes the assumption **more realistic**: conditioning on user, article and time features in $\mathbf X_i(t)$ explains much of this variation, so we only need rewards to be (approximately) independent given the context, with mean $E[R_i(t)\mid\mathbf X_i(t)]$. Remaining drift can be reduced with time and freshness features, but not removed completely.`,
          },
          { t: 'h4', text: '(d) 要收集什么数据（4 分）' },
          '逐个上线比较很多 bandit 太贵：每个算法开头都要乱试，读者会看到很多没人点的标题（c48 ⑥）。Workshop 10 的做法是 offline evaluation（离线评估）：只收集一份日志，所有算法都用它评估。',
          {
            t: 'ul', items: [
              '收集什么：在一小部分流量上，每一轮从这篇文章的候选组合里**均匀随机**选一个展示；记录这一轮所有臂的上下文向量、实际展示的臂、点没点（以及时间戳）。上下文一定要一起记，否则没法回放 contextual bandit。',
              'replay 怎么用：按时间顺序回放日志，让被评估的 bandit 看同样的上下文、选一个臂；和日志里的臂相同，就把日志里的奖励给它、更新它、计分；不同就跳过这一条。',
              '为什么必须均匀随机：保留下来的轮次和这个算法真的上线时遇到的情况一样，评估没有偏差。如果日志是某个现有算法选的，它偏爱的臂被记录得多，评估就会偏。',
              T`为什么高效：一份日志可以回放给任意多个 bandit，不用逐个上线。代价是 $k$ 个臂时平均只有约 $1/k$ 的轮次能对上（例如 3 个标题 × 4 张图 = 12 个臂，只能用约 $1/12\approx8\%$），所以日志要足够大。`,
            ],
          },
          {
            t: 'exam', title: 'Exam phrasing · (d)',
            md: T`Collect a log from a **uniformly random** logging policy on a fraction of the traffic: in each round, show one of the article's headline–picture combinations chosen uniformly at random, and record the context vectors of all arms, the arm displayed and whether it was clicked (with a timestamp).
Any number of bandit learners can then be evaluated offline on this one log by replay: step through the log and let the learner choose an arm given the logged context; if it matches the logged arm, give it the logged reward, update it and count the round, otherwise skip the round. Because the logged arms are uniformly random, the retained rounds are an unbiased sample of what the learner would face online, and its average reward per retained round estimates its click-through rate, without deploying each learner to real users. With $k$ arms only about $1/k$ of the log is used, so the log must be large.`,
          },
        ],
        azh: T`(a) 臂：首页上每篇文章的可选（标题, 预览图片）组合；$h$ 个标题、$p$ 张图就有 $h\times p$ 个臂。（也可以标题、图片各用一个 bandit：臂更少，但忽略了标题和图片的搭配效果。）轮：每次有用户打开首页、需要显示这篇文章预览的时候；每一轮学习器观察上下文、选一个臂并显示。奖励：用户点了文章预览为 1，否则为 0；累计奖励正好是管理层用来评价系统的总点击数，所以最大化累计奖励（最小化 regret）就是业务目标。因为用户口味不同，每一轮还要观察每个臂的上下文向量 $\mathbf X_i(t)$，用回归（regression）估计 $E[R_i(t)\mid\mathbf X_i(t)]$，再选回归预测上 UCB 最大的臂（例如 LinUCB）。
(b) 臂 $i$ 在第 $t$ 轮的上下文向量 $\mathbf X_i(t)$ 拼接以下特征（类别型特征 one-hot 编码，数值特征标准化）：用户特征（状态 state）：订阅状态与类型、地区、设备、时段和星期几；从 TechNews 的点击日志得到该用户在各文章类别（本地、国际、评论、投资…）、各标题风格、各图片类型上的历史点击率；匿名用户只有本次访问的特征。文章特征：类别、主题关键词、作者、发布时长（新鲜度）。臂特征：标题长度、风格（疑问句、数字、引语）、情感和关键词；图片类型（人脸、场景、图表）、颜色等图像特征。交叉特征：例如该用户对这篇文章所属类别的历史点击率。文章和臂的特征让回归能在不同文章之间共享信息，新标题或新图片在被展示很多次之前就能得到合理的估计。
(c) 不完全合适。标准 bandit 假设每个臂的奖励是从固定分布 $P_i$ 中独立同分布抽取的。这里同一个标题和图片的点击概率取决于谁在看（用户口味不同），所以各轮的奖励不同分布；点击率还会随时间漂移（新闻过时、时段效应、突发新闻）；同一个标题反复展示给同一个用户还会让奖励相互依赖。上下文让这个假设更现实：在 $\mathbf X_i(t)$ 中加入用户、文章和时间特征后，大部分这类差异被解释掉了，只需要假设给定上下文时奖励（近似）独立、均值为 $E[R_i(t)\mid\mathbf X_i(t)]$。剩下的漂移可以用时间和新鲜度特征减弱，但不能完全消除。
(d) 在一部分流量上用均匀随机的记录策略（logging policy）收集日志：每一轮从这篇文章的标题–图片组合中均匀随机选一个展示，记录所有臂的上下文向量、显示的臂、是否被点击（以及时间戳）。之后任意多个 bandit 学习器都可以用这一份日志通过回放（replay）离线评估：按顺序回放日志，让学习器根据记录的上下文选一个臂；如果和日志里的臂相同，就把记录的奖励给它、更新它并计入这一轮，否则跳过这一轮。因为日志里的臂是均匀随机选的，保留下来的轮次是这个学习器上线时会遇到的情况的无偏样本，它在保留轮次上的平均奖励就估计了它的点击率，不需要把每个学习器部署给真实用户。$k$ 个臂时只能用上大约 $1/k$ 的日志，所以日志必须很大。`,
      },
      {
        t: 'quiz', items: [
          {
            id: 'T02-design-1',
            q: 'TechNews 这道设计题里，一个 round（轮）最合适的定义是：',
            options: ['一天', '一个用户打开首页、某篇文章的预览要显示的那一次', '一篇新文章上线', '一个注册用户'], answer: 1,
            explain: 'bandit 的一轮 = 做一次选择，并马上观察到这次选择的 reward（L17 p6："In round $t$, play action $i_t$, receive reward"）。这里的选择是"这次展示用哪个标题 + 图片"，reward 是这次展示有没有被点，所以一轮就是一次展示。"一天"太粗：一天里有无数次选择和点击；"一篇文章"和"一个用户"都不是一次决策。',
          },
          {
            id: 'T02-design-2',
            q: '想用一份日志离线评估很多个 bandit，日志里每次展示的标题和图片应该怎么选？',
            options: ['由目前上线效果最好的 bandit 选', '均匀随机选，并记下上下文、展示的臂和是否点击', '只记录被点击的展示', '每篇文章固定用编辑挑的标题和图片'], answer: 1,
            explain: 'replay 评估只保留"被评估的 bandit 选的臂 = 日志里的臂"的轮次（Workshop 10，c48 ⑥）。日志里的臂是均匀随机选的，保留下来的轮次才和算法真的上线时遇到的情况一样，评估无偏。由现有 bandit 来选，它偏爱的臂在日志里被过多记录，评估会偏；只记被点击的展示，奖励为 0 的轮次全丢了，点击率会被高估；固定用编辑挑的组合，其他臂从没被展示过，选了它们的算法根本没法评估。',
          },
        ],
      },

      { t: 'h2', text: '7. 随机练习', id: 'practice' },
      { t: 'practice', gen: 'ucb', title: 'UCB 随机题' },

      { t: 'h2', text: '8. 同一讲里还可能考什么', id: 'related' },
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
