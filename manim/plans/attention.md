# attention · Attention：打分 → Softmax → 加权平均（c41）

## Overview
- **Hook**：面对一整句话的多个记忆，解码器怎样挑出最相关的重点？（问题卡第二行也是问题：“只能硬选一个吗？能不能按相关程度各取一部分？”，不提前给出三步答案。）
- **Notation（与 c41 一致）**：隐藏状态 $\mathbf h^{(j)}$（上标带括号），得分 $e_j$，指数一律写 $\exp(\cdot)$（c41 明确不用 $e^x$，免得和得分 $e_j$ 混淆），$\alpha_j=\exp(e_j)/\sum_{j'}\exp(e_{j'})$，$\mathbf c=\sum_j\alpha_j\mathbf h^{(j)}$；点积写 $\mathbf q\cdot\mathbf h^{(j)}$（c41 自己写 $\mathbf q\cdot\mathbf k_j$）。
- **Key insight（aha，第 4–5 步）**：点积是投影长度（相关度打分）；Softmax 用指数拉开差距并归一化为百分比（$e^2=7.39$ 独揽 $66.5\%$ 权重）；加权平均按比例缩放后首尾相接，输出上下文向量 $\mathbf{c} \approx (1.58, -0.15)$ 紧紧吸附在最相似的候选 $\mathbf h^{(2)}$ 身边！
- **Narrative pattern**：Build Up → Payoff（从输入向量、点积几何投影打分、Softmax 指数与归一化，到首尾相接融合为上下文向量）。
- **FLOW**：输入与候选向量 → 第1步：点积打分 → 第2步：Softmax → 第3步：加权融合
- **Emotional arc**：好奇（Query 怎样向候选提问？）→ 探索（投影长度即相似度）→ 领悟（Softmax 为什么要 exp 和除以和）→ aha（$66.5\%$ 集中在位置 2，首尾相接向量直奔 $\mathbf h^{(2)}$！）→ 满足（Attention 本质就是按相似度软性加权）。

## Steps（skeleton = 左侧 2D 向量空间 + 右侧柱状图与公式计算面板，全程不清空）
1. **输入与候选向量**
   - Purpose：建立问题场景，展示 Query 向量与三个候选隐藏状态向量。
   - Visual：左侧画出坐标轴，黄色箭头 $\mathbf{q}=(1,0)$，三个候选箭头 $\mathbf h^{(1)}=(1,1.5)$（蓝）、$\mathbf h^{(2)}=(2,-0.5)$（绿）、$\mathbf h^{(3)}=(0,-2)$（紫），标出坐标数值；$\mathbf q$ 的标签放在箭头尖的**右上方**（轴上方），刻度 0/1/2 在轴下方紧贴轴。
   - Math attached：$\mathbf{q}=(1,0)$，$\mathbf h^{(1)}=(1,1.5)$，$\mathbf h^{(2)}=(2,-0.5)$，$\mathbf h^{(3)}=(0,-2)$。
   - Narration：说明 q 的来源——翻译时由解码器上一步的状态 $\mathbf s^{(i-1)}$ 得到（c41 下文），这里为了好画直接取 $(1,0)$。
   - short caption：Query q 提出问题，h<sup>(1)</sup>、h<sup>(2)</sup>、h<sup>(3)</sup> 是三个候选记忆向量
   - Technical notes：左侧原点放在 $(64, 172)$ px，刻度比 $66$ px/unit（y 轴 −2.25…1.8），坐标文字紧贴箭头端点。
2. **第1步：点积打分（投影长度）**
   - Purpose：展示点积计算相似度的几何本质。
   - Visual：从三个 $\mathbf h^{(j)}$ 向 $\mathbf{q}$ 所在 x 轴作虚线垂线，高亮从原点到垂足的有符号线段（垂线仅用于找垂足，原点到垂足的线段才是分数！）；右侧柱状图升起，展示得分 $e=(1,2,0)$。刻度标签 1、2、0 原地 ReplacementTransform 成垂足旁的 $e_1=1$（蓝段上方）、$e_2=2$（绿垂足右上）、$e_3=0$（原点左下），轴下方不再留文字（避开绿色得分段和 $\mathbf h^{(2)}$ 箭头）。
   - Math attached：$e_j=\mathbf{q}\cdot\mathbf h^{(j)}$，$e_1=1$，$e_2=2$，$e_3=0$。
   - Narration：指回 c03——点积 = 投影长度 × 另一支的长度，$|\mathbf q|=1$，所以点积就是投影长度。
   - short caption：点积 e<sub>j</sub> = q·h<sup>(j)</sup>：q 是单位向量，分数为投影有符号长度
   - Technical notes：虚线与底轴高亮线段颜色区分，右侧柱状图基线 $y=275$，柱宽 $48$ px。
3. **第2步：Softmax 前半段（取指数 exp）**
   - Purpose：解释 exp 的角色：把分数变正、拉开差距。
   - Visual：公式显示分子 $\exp(e_j)$，角色标注“把分数变成正数、拉开差距”；右侧柱状图高度变化为 $\exp(e_j)$：$2.72, 7.39, 1.00$，标出总和 $11.11$。
   - Math attached：$\exp(1)\approx 2.72$，$\exp(2)\approx 7.39$，$\exp(0)=1.00$，$\sum \approx 11.11$。
   - Narration：$e\approx2.718$ 是常数；$\exp(1)=e\approx2.72$，$\exp(2)=e\times e\approx2.718\times2.718\approx7.39$，$\exp(0)=1$。
   - short caption：取指数 exp(e<sub>j</sub>)：把所有分数变成正数，并迅速拉开差距（不写 $e^{e_j}$）
   - Technical notes：柱状图平滑过渡，顶部数字实时同步更新。
4. **第2步：Softmax 后半段（归一化为权重）**
   - Purpose：解释分母的角色：除以总和归一化为概率权重（aha 刻）。
   - Visual：公式完整呈现 $\alpha_j=\frac{\exp(e_j)}{\sum_{j'}\exp(e_{j'})}$，分母角色标注“除以总和 ⇒ 加起来等于 1”；柱状图转化为权重高度：$0.245, 0.665, 0.090$（和为 100%）。
   - Math attached：$\alpha=(0.245, 0.665, 0.090)$，和为 $1.000$。
   - Narration：分母里的 $j'$ 只是求和用的计数字母，走遍 1、2、3，和分子里固定的 $j$ 区分开。
   - short caption：除以总和 11.11 归一化为权重 α：位置 2 独占 66.5%
   - Technical notes：高亮位置 2 独揽近三分之二权重，为加权融合做铺垫。
5. **第3步：加权融合（首尾相接上下文向量）**
   - Purpose：展示最终上下文向量 $\mathbf{c}$ 的几何生成过程。
   - Visual：原向量变半透明，三个向量按 $\alpha_j$ 缩短；按顺序首尾相接拼接（$\alpha_1\mathbf h^{(1)} \to +\alpha_2\mathbf h^{(2)} \to +\alpha_3\mathbf h^{(3)}$）；红色粗箭头 $\mathbf{c}$ 从原点直指终点 $(1.58, -0.15)$，紧贴 $\mathbf h^{(2)}$。
   - Math attached：$\mathbf{c}=\sum_j\alpha_j\mathbf h^{(j)} \approx (1.58, -0.15)$。
   - Narration：先讲向量相加 = 横纵坐标分别相加 = 首尾相接；三支缩短后的向量写成三位小数 $(0.245,0.3675)$、$(1.33,-0.3325)$、$(0,-0.18)$，直接相加得 $(1.575,-0.145)\approx(1.58,-0.15)$。不再讲取整误差和夹角。
   - short caption：按权重缩短后首尾相接（= 向量相加）：c 最靠近 h<sup>(2)</sup>
   - Technical notes：$\mathbf q$ 的标签直接淡出（它的位置会被首尾相接的链穿过）；$\mathbf c$ 标签（带底色）放在 c2p(0.95, −0.6)，“最靠近 h<sup>(2)</sup>”胶囊放在 c2p(1.05, −0.97)，都在 $\mathbf h^{(3)}$ 轴与淡化的 $\mathbf h^{(2)}$ 箭头之间的空白楔形里，不压箭头尖和刻度。

## Colours
- 黄（YELLOW）：Query 向量 $\mathbf{q}$ 与核心关键公式/高亮；
- 蓝（BLUE）：候选 1 隐藏状态 $\mathbf h^{(1)}$ 及相关柱体/垂线；
- 绿（GREEN）：候选 2 隐藏状态 $\mathbf h^{(2)}$（最高分、最大权重）；
- 紫（PURPLE）：候选 3 隐藏状态 $\mathbf h^{(3)}$ 及相关柱体；
- 红（RED）：融合后的上下文向量 $\mathbf{c}$；
- 灰（GREY）：坐标网格与辅助说明文字。

## Takeaway
（旁白另补：$j'$ 走遍所有位置；解码器拿 $\mathbf c$ 写下一个词，写完 query 变了，三步重算。）
- Query 提问，点积打分，Softmax 定权重
- α<sub>j</sub> = exp(e<sub>j</sub>) / Σ<sub>j′</sub> exp(e<sub>j′</sub>) ⇒ 加起来为 1
- 上下文 c = Σ<sub>j</sub> α<sub>j</sub> h<sup>(j)</sup>：最相关的候选占主角
