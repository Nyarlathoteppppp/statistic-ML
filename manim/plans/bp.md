# Storyboard: Belief Propagation (Scene ID: bp)

## Overview
- **Hook**: 想要树上所有 5 个房间的温度边缘分布，难道要对每个房间各做一次消元（$n$ 个房间各做一次、每次约 $n$ 条消息，共约 $n^2$ 条）？
- **Key Insight**: 任意选一个根！先收（collect，叶子到根）再发（distribute，根到叶子），发信时只乘“除收件人外的其他来信”。两趟传递（$2(n-1)$ 条消息）后每条边两个方向消息全齐，每个节点把收到的所有来信相乘，一次得到全部边缘，未归一化总和均等于 $Z = 268$！
- **Narrative Pattern**: Pattern 2 (Build Up → Payoff) / Naive vs Shared Pipeline. Contrasting $n$ separate sweeps with 2 coordinated sweeps.
- **Aha Step**: Step 3 & 4 (distribute rule: multiplying incoming messages except recipient avoids circular double counting).
- **FLOW**: `['规则与选根', '收：叶子 → 根', '发：从根分发', '读全部边缘']`

## Emotional Arc
Curiosity (Step 1: Can 2 sweeps really compute all marginals?) → Partial clarity (Step 2: Collect is familiar c56 elimination) → Aha moment (Step 3 & 4: Distribute rule sends outward without recipient's message) → Satisfaction (Step 5: Every node's marginal unnormalized sum matches 268 = Z exactly).

## Steps

### Step 1: 规则与选根 (stage 0)
- **Purpose**: Establish tree skeleton, root selection ($x_4$), role-annotated BP message formula, and the four score tables the arithmetic uses.
- **Visual**: 5-node tree appears on left, root $x_4$ highlighted with tag. Formula card top right with role labels; then the four ψ tables fade in one by one at the bottom right while “边上的表” flashes teal.
- **Math attached**: $m_{i\to j}(x_j) = \sum_{x_i} \psi_{ij}(x_i,x_j) \prod_{k\in N(i)\setminus j} m_{k\to i}(x_i)$ (same subscript as the narration) annotated with "把 i 加掉", "边上的表", "i 收到的其他来信", and a fourth line "N(i) = i 的邻居". Narration reads $\setminus j$ as “去掉收件人 j”.
- **ψ tables (persistent, steps 1–5)**: `PsiTable` × 4 in one row centred at P(492, 293): ψ₁₂ (3,1 / 1,1), ψ₂₃ (1,2 / 1,1), ψ₂₄ (4,1 / 1,2), ψ₄₅ (3,1 / 1,2) — c56's numbers. Each is drawn as given, ψ_ij(x_i,x_j): x_i written left of the rows (热 / 冷), x_j above the columns (热 / 冷), teal name in the corner. Same table as the chapter inserts right before the video (“视频沿用 c56 那四张打分表：”).
- **Short caption**: 选 x₄ 为根：两趟传递，先从叶子收向根，再从根发回叶子
- **Technical notes**: Formula card at P(494, 60) (4 annotation lines), panel below ($y \ge 126$, lines scaled before they are placed so left edges stay aligned), ψ row from y≈270 to y≈318.

### Step 2: 收：叶子 → 根 (stage 1)
- **Purpose**: Collect phase — gather information from leaves to root $x_4$.
- **Visual**: Yellow pills fly along edges: leaves $x_5\to x_4$, $x_1\to x_2$, $x_3\to x_2$ (ψ₄₅, ψ₁₂, ψ₂₃ flash yellow), then $x_2\to x_4$ (ψ₂₄ flashes). Nodes that have sent fill dark gold `#5a4a16` and stay that way; narration: “节点涂成暗金色，表示它在 collect 阶段已经处理完”.
- **Math attached**: $m_{5\to4}=(4,3)$, $m_{1\to2}=(4,2)$, $m_{3\to2}=(3,2)$, $m_{2\to4}=(52,20)$, $x_4$ receives $(208,60)$.
- **Short caption**: 第 1 阶段 collect：叶子把信息汇聚到根 x₄（黄色消息）
- **Technical notes**: Pills park on collect side of edges (left/above). 三片叶子的消息停好后，树上方空档 P(246, 52) 淡入图例框（DIM 描边，字号 16/14；右下角留给 ψ 表）：黄字“每条消息 =（收件人热时，收件人冷时）”+ 灰字“例：m₅→₄ = (4, 3) ⇒ x₄ 热时 4，冷时 3”（按 c57 的“括号里是（热，冷）”），同时 Circumscribe 第一条消息 (4,3)；图例一直保留到最后一步。

### Step 3: 发：从根分发 (stage 2)
- **Purpose**: Distribute phase begins — root sends outward to $x_5$ and $x_2$.
- **Visual**: Yellow frame on ψ₄₅'s “x₅ 热” column (3, 1) → red pill $m_{4\to5}$ flies to $x_5$. Then ψ₂₄ transposes in place (x₂ / x₄ labels swap, the two 1s swap along an arc — the table is symmetric, so the numbers look the same), yellow frame on the “x₂ 热” column (4, 1) → red pill $m_{4\to2}$ flies to $x_2$. Frames fade and ψ₂₄ transposes back.
- **Math attached**: $x_4\to x_5$ only uses $m_{2\to4}$: $(52·3+20·1, 52·1+20·2) = (176, 92)$; $x_4\to x_2$ only uses $m_{5\to4}$: $(4·4+3·1, 4·1+3·2) = (19, 10)$. Panel line 4: “m₄→₂：只乘 m₅→₄ = (4, 3)；ψ₂₄ 先行列对调”. Narration: sender $x_4$ is the SECOND variable of ψ₂₄(x₂,x₄), so rows/columns are swapped first (rows = sender, msgpass convention); $x_2$ hot uses ψ₂₄(热,热)=4 and ψ₂₄(热,冷)=1.
- **Short caption**: 第 2 阶段 distribute：根往外发，只乘除收件人外的其他来信
- **Technical notes**: Pills park on distribute side of edges (right/below).

### Step 4: 发：送达叶子 (stage 2)
- **Purpose**: Distribute phase finishes — $x_2$ sends outward to leaves $x_3$ and $x_1$.
- **Visual**: Yellow frame on ψ₂₃'s “x₃ 热” column (1, 1) (sender x₂ already on the rows) → $m_{2\to3}$ flies to $x_3$; ψ₁₂ transposes (sender x₂ is its second variable), frame on the “x₁ 热” column (3, 1) → $m_{2\to1}$ flies to $x_1$; frames fade, ψ₁₂ transposes back. All 8 messages now on edges.
- **Math attached**: panel shows the ψ multipliers: “过 ψ₂₃ ⇒ (76·1+20·1, 76·2+20·1) = (96, 172)”, “过 ψ₁₂ ⇒ (57·3+20·1, 57·1+20·1) = (191, 77)”.
- **Short caption**: x₂ 汇总其他来信发给叶子：每条边两个方向各有一条消息
- **Technical notes**: Every edge now has one yellow and one red pill.

### Step 5: 读全部边缘 (stage 3)
- **Purpose**: Read marginals for all 5 nodes at once; verify with partition function $Z$.
- **Visual**: All 5 nodes glow/indicate with GREEN. Right panel displays all 5 marginals and confirms sum = 268 = $Z$.
- **Math attached**: $x_1:(191,77)$, $x_2:(228,40)$, $x_3:(96,172)$, $x_4:(208,60)$, $x_5:(176,92)$, each sum $= 268$.
- **Short caption**: 每点把所有来信相乘即为边缘，未归一化总和均等于 Z = 268
- **Technical notes**: Hold on final verification.

## Colour Meanings
- YELLOW: Inward collect messages, current FLOW stage, highlighted terms.
- RED: Outward distribute messages, root indicator.
- GREEN: Completed marginals verification.
- GREY: Tree edges, background context, formula role annotations.
- TEAL: ψ table names (and the “边上的表” flash that introduces them); YELLOW frame = the ψ column a message uses.
- DARK GOLD fill `#5a4a16`: node already processed in collect (stays).

## Takeaway Lines
1. `两阶段BP：一收一发，2(n−1) 条消息得到全部边缘`
2. `发信规则：乘除收件人外的其他来信，再把发送者加掉`
3. `边缘计算：每点所有来信相乘，无观测时未归一化和都等于 Z`

## Takeaway narration
Message count phrased without O-notation: “$n$ 个节点的树有 $n-1$ 条边，每条边两个方向各一条消息，共 $2(n-1)$ 条，和节点数成正比”.

## Render
46.4 s (question 3.9 s; steps start 3.9 / 8.93 / 16.8 / 26.57 / 35.73; takeaway 40.23).
