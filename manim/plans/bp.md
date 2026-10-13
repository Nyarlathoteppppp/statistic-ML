# Storyboard: Belief Propagation (Scene ID: bp)

## Overview
- **Hook**: 想要树上所有 5 个房间的温度边缘分布，难道要对每个房间各做一次消元（$O(n^2)$）？
- **Key Insight**: 任意选一个根！先收（collect，叶子到根）再发（distribute，根到叶子），发信时只乘“除收件人外的其他来信”。两趟传递（$2(n-1)$ 条消息）后每条边两个方向消息全齐，每个节点把收到的所有来信相乘，一次得到全部边缘，未归一化总和均等于 $Z = 268$！
- **Narrative Pattern**: Pattern 2 (Build Up → Payoff) / Naive vs Shared Pipeline. Contrasting $n$ separate sweeps with 2 coordinated sweeps.
- **Aha Step**: Step 3 & 4 (distribute rule: multiplying incoming messages except recipient avoids circular double counting).
- **FLOW**: `['规则与选根', '收：叶子 → 根', '发：从根分发', '读全部边缘']`

## Emotional Arc
Curiosity (Step 1: Can 2 sweeps really compute all marginals?) → Partial clarity (Step 2: Collect is familiar c56 elimination) → Aha moment (Step 3 & 4: Distribute rule sends outward without recipient's message) → Satisfaction (Step 5: Every node's marginal unnormalized sum matches 268 = Z exactly).

## Steps

### Step 1: 规则与选根 (stage 0)
- **Purpose**: Establish tree skeleton, root selection ($x_4$), and role-annotated BP message formula.
- **Visual**: 5-node tree appears on left, root $x_4$ highlighted with tag. Right panel shows formula card with 3 role labels.
- **Math attached**: $m_{i\to j}(x_j) = \sum_{x_i} \psi(x_i,x_j) \prod_{k\ne j} m_{k\to i}(x_i)$ annotated with "把 i 加掉", "边上的表", "i 收到的其他来信".
- **Short caption**: 选 x₄ 为根：两趟传递，先从叶子收向根，再从根发回叶子
- **Technical notes**: Formula card persistent at top right ($y \in [45, 105]$), panel below ($y \ge 126$).

### Step 2: 收：叶子 → 根 (stage 1)
- **Purpose**: Collect phase — gather information from leaves to root $x_4$.
- **Visual**: Yellow pills fly along edges: leaves $x_5\to x_4$, $x_1\to x_2$, $x_3\to x_2$, then $x_2\to x_4$. Visited nodes fill `#5a4a16`.
- **Math attached**: $m_{5\to4}=(4,3)$, $m_{1\to2}=(4,2)$, $m_{3\to2}=(3,2)$, $m_{2\to4}=(52,20)$, $x_4$ receives $(208,60)$.
- **Short caption**: 第 1 阶段 collect：叶子把信息汇聚到根 x₄（黄色消息）
- **Technical notes**: Pills park on collect side of edges (left/above). 三片叶子的消息停好后，右下角 P(488, 300) 淡入图例框（DIM 描边）：黄字“每条消息 =（收件人热时，收件人冷时）”+ 灰字“例：m₅→₄ = (4, 3) ⇒ x₄ 热时 4，冷时 3”（按 c57 的“括号里是（热，冷）”），同时 Circumscribe 第一条消息 (4,3)；图例一直保留到最后一步。

### Step 3: 发：从根分发 (stage 2)
- **Purpose**: Distribute phase begins — root sends outward to $x_5$ and $x_2$.
- **Visual**: Red pills fly from $x_4$: $m_{4\to5}$ to $x_5$, $m_{4\to2}$ to $x_2$.
- **Math attached**: $x_4\to x_5$ only uses $m_{2\to4} \Rightarrow (176, 92)$; $x_4\to x_2$ only uses $m_{5\to4} \Rightarrow (19, 10)$.
- **Short caption**: 第 2 阶段 distribute：根往外发，只乘除收件人外的其他来信
- **Technical notes**: Pills park on distribute side of edges (right/below).

### Step 4: 发：送达叶子 (stage 2)
- **Purpose**: Distribute phase finishes — $x_2$ sends outward to leaves $x_3$ and $x_1$.
- **Visual**: Red pills fly from $x_2$: $m_{2\to3}$ to $x_3$, $m_{2\to1}$ to $x_1$. All 8 messages now on edges.
- **Math attached**: $m_{2\to3} \Rightarrow (96, 172)$, $m_{2\to1} \Rightarrow (191, 77)$.
- **Short caption**: x₂ 汇总其他来信发给叶子：每条边两个方向消息全齐
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

## Takeaway Lines
1. `两阶段BP：一收一发，2(n−1) 条消息得到全部边缘`
2. `发信规则：乘除收件人外的其他来信，再把发送者加掉`
3. `边缘计算：每点所有来信相乘，未归一化和恒为配分函数 Z`
