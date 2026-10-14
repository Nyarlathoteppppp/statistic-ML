# dsep — D-separation：从贝叶斯网读出条件独立性

## Overview
- Hook / question：贝叶斯网中，不用算概率表，怎样只看图就判断两个变量是否条件独立？
- Audience：中国硕士生，弱数学基础；时长约 55–65 秒；单个 Dsep 场景。
- Key insight：通过道德化祖先图将有向图转换为无向分离问题；共同孩子的父母必须结婚（连边），但非祖先节点先被剔除，不会促成结婚。
- 两问的真正原因（勿混淆）：问题一不独立是因为 A 是 E、B 的共同孩子 ⇒ E—B 结婚；删 A 时 R—A 结婚边随 A 一起删掉，剩下 L—R（R→L）、R—E（E→R）、E—B（结婚）连成 L—R—E—B。R—A 结婚与问题一的结论无关。问题二独立是因为 L 被剔除 ⇒ R、A 不结婚；若它们结婚，删 E 后 R—A 仍相连。
- Narrative pattern：双题对比（Contrast pair）——同一张警报网络，先测 L ⊥ B | A（连通，不保证独立），再测 R ⊥ A | E（L 剔除不结婚，独立成立）。
- Aha moment：Step 8（在问题 2 中，L 不是查询或条件节点的祖先，先被剔除；因此 R 与 A 没有共同孩子，不结婚！删去 E 后 R 孤立）。
- FLOW stages：['祖先图', '父母结婚', '去掉方向', '删掉条件', '找路径']

## Emotional arc
好奇（只看图能判断独立？）→ 清晰（五步法按部就班）→ 警觉（解释排除导致结婚边，路径未断）→ 对比恍然大悟（为什么问题 2 成立：因为 L 提前出局，父母没结婚！）→ 满足自信（记住考点 does not hold）。

## Persistent skeleton / layout
- 左侧警报网络固定骨架：
  E(150, 95) 地震，B(330, 95) 盗窃；
  R(150, 205) 电台，A(330, 205) 警报；
  L(240, 305) 下班离开。
  有向边：E→R, E→A, B→A, R→L, A→L。
- 右侧推导面板（x ≈ 380–615，纵向排列）：
  当前问题标题、祖先集合卡片、结婚边卡片、去向删点状态、路径与结论判定 pill。

## Step breakdown

### Opening: question()
- Purpose: 提出核心问题，激发直觉。
- Visual: 提问卡：“贝叶斯网中，两个变量何时条件独立？／不看任何概率表，只看图的五步判断法”。
- Short: 开场提问。

### Step 1 · 问题 1：L ⊥ B | A 成立吗？（stage 0）
- Purpose: 建立问题 1 背景，标明查询变量与给定条件。
- Visual: 呈现警报网络。L 标蓝（查询 X），B 标绿（查询 Y），A 灰底高亮（给定 S）。右侧显示查询卡片 M(r'L \perp B \mid A \ ?')。
- Short: 问题一：已知警报响了（A），下班（L）与盗窃（B）独立吗？
- Math attached: M(r'L \perp B \mid A')，附小字“蓝 X、绿 Y、灰底 S”。

### Step 2 · 祖先图：保留查询与条件的所有祖先（stage 0）
- Purpose: 执行第 1 步取祖先图。
- Visual: 依次高亮 L 的祖先（R, A, E, B）。5 个节点全部保留，无节点删除。右侧展开 Anc 卡片。
- Short: ① 祖先图：L 的祖先包含 R, A, E, B，5 个节点全部保留。
- Math attached: Anc({L, B, A}) = {E, B, R, A, L}。
- Narration: 旁白点名屏幕上的写法 Anc(L,B,A)，即 L、B、A 和它们所有祖先。

### Step 3 · Moralize：共同孩子的父母结婚（stage 1）
- Purpose: 体现 Explaining Away 效应，给共同父节点连无向虚线。
- Visual: A 的父母 E—B 连橙色虚线；L 的父母 R—A 连橙色虚线；每条虚线上方标注“因共同孩子 A / L 结婚”。
- Short: ② 父母结婚：共同孩子 A ⇒ E—B；共同孩子 L ⇒ R—A
- Math attached: 结婚边 E—B 与 R—A。
- Narration: 红句只讲“观测到共同孩子（或其后代）后父母变相关”。随后解释 L 没被观测却仍让 R—A 结婚：L 是被问的变量，留在祖先图里；规则统一为祖先图里每个共同孩子的父母都结婚，不必再判断孩子是否被观测（孩子能留在祖先图里，说明它或它的后代在问题里出现）；本例 R—A 连边不改变结论（R、A 本来都和 L 直接相连）。

### Step 4 · 去掉方向：所有箭头变为无向线段（stage 2）
- Purpose: 将有向图转换为无向连通性问题。
- Visual: 5 条有向箭头的箭头消失，平滑变为无向灰色线段。
- Short: ③ 去掉方向：所有有向箭头变为无向边。
- Math attached: “无向图连通性等价于 D-separation”。
- Narration: 为什么能去方向——方向唯一的用处是区分“汇合”，前两步（祖先图、结婚）已处理完，之后只看有没有路。

### Step 5 · 删掉条件：移除 A 及其所有连边（stage 3）
- Purpose: 已知变量阻断经过它的路径。
- Visual: 先把 A 的圈和它的 4 条边（E—A, B—A, A—L 及结婚边 R—A）全部变红；R—A 上方的“因共同孩子 L 结婚”变成红字“与 A 相连，一并删掉”，R—A 再闪一下 —— 让学生看清 R—A 的一端就是 A。然后 A 和这 4 条边（连同红字）一起淡出；最后闪一下留下来的 E—B 结婚边及其“因共同孩子 A 结婚”标注（E—B 两端都不是 A）。
- Short: ④ 删掉条件：删去 A 及 4 条边（R—A 一起没了，E—B 留下）
- Math attached: S = {A}，移除所有与 A 相连的边。
- Narration: 先说为什么删已知点——它挡住经过它的链和分叉（章节三种形状表的前两行）；汇合造成的相关已由结婚边保留，删 A 不会丢。

### Step 6 · 找路径：L—R—E—B 连通，不保证独立（stage 4）
- Purpose: 判定连通性并得出考点结论。
- Visual: 路径 L—R—E—B 变红，显示连通。右侧卡片：“⑤ 仍连通：L—R—E—B / E—B 是结婚边（A 的父母）”+ 红色 Badge “不保证独立 (does not hold)”。
- Short: ⑤ 找路径：L—R—E—B 连通（E—B 是结婚边）⇒ 不保证独立
- Math attached: 路径 L—R—E—B（L—R 来自 R→L，R—E 来自 E→R，E—B 来自 A 的结婚），结论“does not hold in general”。

### Step 7 · 问题 2：R ⊥ A | E 成立吗？重置图并剔除 L（stage 0）
- Purpose: 对比测试，展现祖先图的筛选作用。
- Visual: 图恢复原始骨架。R 标蓝，A 标绿，E 灰底。祖先图为 {R, A, E, B}。非祖先 L 及其连边淡出消失！
- Short: 问题二：R ⊥ A | E？L 不是祖先，第一步就被剔除！
- Math attached: Anc({R, A, E}) = {E, B, R, A}，L ∉ Anc（旁白同样点名 Anc(R,A,E)）。

### Step 8 · 父母结婚与去向删点：R 与 A 不结婚！（stage 1–3）
- Purpose: Aha 顿悟时刻——对比为什么两问结论不同。
- Visual: 只有 A 的父母 E—B 结婚（橙虚线）；因为 L 已被删，R 与 A 不结婚！去方向后，删去条件 E（及其边 E—R, E—A, E—B）。
- Short: 核心差别：L 已删，R 与 A 不结婚！删去 E 后 R 孤立。
- Math attached: 只有 E—B 结婚；删去 E 后 deg(R) = 0。旁白强调：若 R—A 结了婚，删 E 后这条边还在，结论就会反过来。

### Step 9 · 找路径：R 无边可走，条件独立成立（stage 4）
- Purpose: 验证孤立点无路径，得出独立结论。
- Visual: R 闪烁显示为孤立点，到 A 无通路。弹出绿色 Badge “条件独立成立 (holds)”。
- Short: ⑤ 找路径：R 没有连边，无法到达 A ⇒ 条件独立成立！
- Math attached: M(r'R \perp A \mid E \ \text{成立}')。

## Colour meanings
- BLUE: 查询节点 X（L 或 R）
- GREEN: 查询节点 Y（B 或 A）/ 独立成立肯定
- GREY: 条件节点 S（灰底已观测）/ 原始背景边
- ORANGE: 结婚边（moralize 父母相连虚线）
- RED: 未被阻断的连通路径 / 不保证独立否定
- YELLOW: 当前高亮步骤 / 核心提示

## Hand check & Arithmetic
- Alarm DAG: E→R, E→A, B→A, R→L, A→L.
- Q1 Anc(L, B, A): Pa(L)={R,A}, Pa(A)={E,B}, Pa(R)={E}. 祖先闭包 = {E, B, R, A, L} (5个点全在)。
  结婚对: Pa(A)={E,B} -> E-B; Pa(L)={R,A} -> R-A.
  删 A 后剩余无向边: E-R, R-L, E-B.
  连通分支: {L, R, E, B} 在同一连通块，存在路径 L-R-E-B。
  结论: L 与 B 不条件独立于 A。
- Q2 Anc(R, A, E): Pa(R)={E}, Pa(A)={E,B}, Pa(E)=∅. 祖先闭包 = {R, A, E, B} (L 及其边排除).
  结婚对: 祖先图中仅 A 有共同父母 E, B -> 连 E-B. (L 不在图中，R 与 A 无共同孩子，不结婚).
  去方向后边: E-R, E-A, B-A, E-B.
  删 E 后边: 删去 E-R, E-A, E-B. 剩余边仅 B-A.
  连通分支: {R}, {A, B}. R 为孤立点，与 A 不连通.
  结论: R 与 A 条件独立于 E (R ⊥ A | E 成立).

## Takeaway lines
- 祖先图 → 父母结婚 → 去方向 → 删条件 → 看连通
- 问题一：A 让 E—B 结婚，删 A 后 L—R—E—B 仍连通 ⇒ 不保证独立
- 问题二：L 被剔除，R、A 不结婚，删 E 后 R 孤立 ⇒ 独立成立
- 有路径 ⇒ 不保证独立；断开 ⇒ 条件独立成立
