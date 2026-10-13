/* 入门题：每个高频题型 3–4 道由浅入深的小题，插在交互解题器前。答案已用 js/core 核对。 */
(function (root) {
  'use strict';
  const SML = root.SML;
  const T = String.raw;
  const mono = (rows, head) => ({ t: 'table', cls: 'mono compact', head: head, rows: rows.map((r) => r.split('')) });

  const STARTERS = {
    T01: {
      before: 'solver',
      intro: '从 2–3 个点的小表开始，熟悉"删列 → 去重 → 数"三步。',
      items: [
        {
          q: [T`只看下面 3 行，$\{x_1,x_2\}$ 被 shatter 吗？`, mono(['00', '01', '10'], ['$x_1$', '$x_2$'])],
          options: ['是', '不是'], answer: 1,
          explain: T`2 个点要 $2^2=4$ 种组合 00、01、10、11 全出现。这里**缺 11**，所以不是。`,
        },
        {
          q: [T`下面的表只看 $(x_1,x_2)$ 两列（删掉 $x_3$），$\{x_1,x_2\}$ 被 shatter 吗？`, mono(['000', '011', '101', '110', '001'], ['$x_1$', '$x_2$', '$x_3$'])],
          options: ['是', '不是'], answer: 0,
          explain: T`删掉 $x_3$ 后五行变成 00、01、10、11、00。最后一个 00 是重复的，**去重**后 4 种齐全 ⇒ 是。`,
        },
        {
          q: [T`下面这张表的 VC 维是多少？`, mono(['001', '010', '100', '111'], ['$x_1$', '$x_2$', '$x_3$'])],
          type: 'num', answer: 2,
          explain: T`只有 4 行，3 个点需要 $2^3=8$ 种 ⇒ 不可能 shatter 3 个点。再看 $(x_1,x_2)$：00、01、10、11 全齐 ⇒ 被 shatter。所以 VC = 2（其实三个 pair 都被 shatter）。`,
        },
      ],
    },
    T02: {
      before: 'solver',
      intro: '先用两个臂、能心算的数练熟公式。',
      items: [
        {
          q: T`两个臂：arm 1 拉了 4 次、奖励总和 2；arm 2 拉了 1 次、奖励 1。现在是第 $t=8$ 轮，设 $\ln 8\approx2$。arm 1 的 UCB 值 $Q_1$ 是多少？`,
          type: 'num', answer: 1.5,
          explain: T`均值 $2/4=0.5$；bonus $\sqrt{2\ln t/N}=\sqrt{2\times2/4}=\sqrt1=1$；$Q_1=0.5+1=1.5$。`,
        },
        {
          q: T`同一题，arm 2 的 $Q_2$ 是多少？选哪个臂？`, type: 'num', answer: 3,
          explain: T`均值 $1/1=1$；bonus $\sqrt{4/1}=2$；$Q_2=3>1.5$ ⇒ 选 arm 2。注意两个臂用的是**同一个** $t$。`,
        },
        {
          q: T`已经拉了 30 次，正在决定第几次？公式里的 $t$ 填多少？`, type: 'num', answer: 31,
          explain: T`$t$ = 已拉总次数 + 1 = 31。`,
        },
      ],
    },
    T03: {
      before: 'solver',
      intro: '先数最小的网络。',
      items: [
        {
          q: T`5 个输入，1D 卷积 filter 宽 2、stride 1、一个共享 filter。卷积层输出几个单元？`, type: 'num', answer: 4,
          explain: T`$5-2+1=4$。`,
        },
        {
          q: T`同一层，不含 bias 的参数有几个？`, type: 'num', answer: 2,
          explain: T`共享权重：一个 filter 宽 2 ⇒ 2 个参数（不是 $4\times2=8$）。`,
        },
        {
          q: T`再接一个全连接层到 1 个输出（不含 bias）。整个网络共有几个参数？`, type: 'num', answer: 6,
          explain: T`$2+4\times1=6$。`,
        },
      ],
    },
    T05: {
      before: 'solver',
      intro: '先认识三种 3 节点的基本结构，每种都用四步法走一遍。',
      items: [
        {
          q: T`链 $A\to B\to C$。$A\perp C\mid B$ 成立吗？`, options: ['成立', '不成立'], answer: 0,
          explain: T`祖先图 $\{A,B,C\}$；没有两个父节点共享孩子，不用结婚；删掉 $B$ 后 $A$、$C$ 不连通 ⇒ 成立。直觉：知道中间的 $B$，就切断了 $A$ 到 $C$ 的影响。`,
        },
        {
          q: T`分叉 $A\leftarrow B\to C$（$B$ 是共同原因）。**不给任何条件**时，$A\perp C$ 成立吗？`, options: ['成立', '不成立'], answer: 1,
          explain: T`祖先图含 $A,B,C$，边 $A$—$B$—$C$；条件集为空，什么都不删 ⇒ 连通 ⇒ 不成立。直觉：共同原因让 $A$、$C$ 相关；如果给定 $B$，它们就独立了。`,
        },
        {
          q: T`汇合 $A\to C\leftarrow B$（$C$ 是共同结果）。给定 $C$ 时，$A\perp B\mid C$ 成立吗？`, options: ['成立', '不成立'], answer: 1,
          explain: T`$A,B$ 是 $C$ 的父母 ⇒ 结婚连 $A$—$B$；删掉 $C$ 后 $A$—$B$ 还在 ⇒ 不成立。（不给定 $C$ 时，祖先图只有 $A,B$，没有边，成立。）`,
        },
        {
          q: T`$A\to C\leftarrow B$，再加 $C\to D$。给定 $D$ 时，$A\perp B\mid D$ 成立吗？`, options: ['成立', '不成立'], answer: 1,
          explain: T`$D$ 的祖先包括 $C$，所以 $C$ 在祖先图里，它的父母 $A$、$B$ 要结婚；删掉 $D$ 后 $A$—$B$ 相连 ⇒ 不成立。规律：观测共同结果**或它的后代**，都会让两个原因相关。`,
        },
      ],
    },
    T06: {
      before: 'past',
      intro: '先在 3–4 个点的图上练"删点前把邻居连起来"。',
      items: [
        {
          q: T`链 $A$—$B$—$C$，按 $A,B,C$ 消元。要加 fill-in 边吗？junction tree 的团是什么？`, type: 'show',
          answerText: T`不加边；团 $\{A,B\},\{B,C\}$。`,
          explain: T`删 $A$：邻居只有 $B$，不用连线，记 $\{A,B\}$。删 $B$：邻居 $C$，记 $\{B,C\}$。删 $C$：$\{C\}$ 被包含，去掉。`,
        },
        {
          q: T`正方形 $A$—$B$—$C$—$D$—$A$，按 $A,B,C,D$ 消元。第一步要加哪条边？`, options: ['$B$—$D$', '$A$—$C$', '不用加'], answer: 0,
          explain: T`删 $A$ 时邻居是 $B,D$，它们没连 ⇒ 加 $B$—$D$，记团 $\{A,B,D\}$。`,
        },
        {
          q: T`接上题，最终 junction tree 的极大团？`, type: 'show',
          answerText: T`$\{A,B,D\}$ 和 $\{B,C,D\}$。`,
          explain: T`删 $B$ 时邻居是 $C$ 和 $D$（$D$ 是刚加的 fill-in 边带来的），$C$—$D$ 原本就有，记 $\{B,C,D\}$。之后的 $\{C,D\},\{D\}$ 都被包含。`,
        },
      ],
    },
    T07: {
      before: 'count',
      intro: '用两个变量的图练"画图 → 数表 → 数数"。',
      items: [
        {
          q: T`图 $A\to B$，都是布尔变量。一共几个**自由参数**？（提示：每个节点一张 CPT，所以有 2 张。）`, type: 'num', answer: 3,
          explain: T`两张：$P(A)$（1 个自由参数，因为 $P(A{=}0)=1-P(A{=}1)$）和 $P(B\mid A)$（父节点 2 种取值，每种 1 个自由参数，共 2 个）。合计 3。全联合表要 $2^2-1=3$，这里一样多——变量多了以后图模型才省。`,
        },
        {
          q: [T`观测到 $(A,B)$：(1,1)、(1,0)、(0,0)、(0,0)。$P(B{=}1\mid A{=}1)$ 的 MLE 是？`], type: 'num', answer: 0.5,
          explain: T`只看 $A=1$ 的两行：(1,1)、(1,0)，其中 $B=1$ 有 1 行 ⇒ $1/2$。`,
        },
        {
          q: T`同一批数据，$P(B{=}1\mid A{=}0)$ 的 MLE？`, type: 'num', answer: 0,
          explain: T`$A=0$ 的两行都是 $B=0$ ⇒ $0/2=0$。数据少时 MLE 会给出 0 或 1 这样"过度自信"的估计。`,
        },
        {
          q: T`"下雨 $R$ 会让地面湿 $W$"。箭头该怎么画？`, options: ['$R\\to W$', '$W\\to R$'], answer: 0,
          explain: T`箭头从**原因**指向**结果 / 观测**：下雨导致地面湿。山火题里同理：真实火情 $F_1$ 导致传感器读数 $S_1$，所以是 $F_1\to S_1$，不是反过来。`,
        },
      ],
    },
  };

  Object.keys(STARTERS).forEach((id) => {
    const page = SML.content.get(id);
    if (!page) return;
    const s = STARTERS[id];
    const k = page.blocks.findIndex((b) => b && b.t === 'h2' && b.id === s.before);
    const insert = [
      { t: 'h2', text: '入门题（先做这几道）', id: 'starter' },
      s.intro,
      { t: 'quiz', label: '入门', items: s.items },
    ];
    page.blocks.splice(k < 0 ? 0 : k, 0, ...insert);
  });
})(window);
