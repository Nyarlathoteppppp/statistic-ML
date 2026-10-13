# Storyboard: UCB (Upper Confidence Bound) — c48

## Overview
- **Hook (question card)**:
  - Line 1: `只按目前平均奖励挑，会错过可能更好的臂`
  - Line 2: `怎么给“试得少、不确定”的臂一个翻盘机会？`
- **Key Insight (aha moment)**: Step 4.
  乐观地试拉臂 3，不是盲目浪费，而是消除不确定性；一旦拉够了（N 从 4 到 16），bonus 缩水，均值更高的臂 2 自然重新领跑！
- **Narrative Pattern**: Flaw Reveal & Self-Correction（贪心盲区 → 探索奖金 → 动态自纠）。
- **FLOW**:
  `['看均值：贪心忽略', '加Bonus：探索加成', '比Q值：选臂3', '多试12次：消除不确定', '臂2超车：乐观真谛']`

## Emotional Arc
- **好奇 (Step 0)**: 臂 1 与臂 2 均值 0.625，臂 3 只有 0.5，贪心必然抛弃臂 3。
- **困惑 (Step 1)**: 臂 3 试得最少，真的没有潜力吗？怎么量化“没把握”？
- **豁然开朗 (Step 2)**: 引入 bonus $\sqrt{2\ln t / N}$，N 越小 bonus 越大，臂 3 的 Q 跃居第一！
- **Aha! (Step 3)**: 连拉 12 次臂 3，柱子实时变化：臂 3 bonus 大幅缩减，Q 从 1.99 跌落，臂 2 重新登顶！
- **总结与满足 (Step 4)**: 公式角色注释 + “面对不确定性保持乐观”（Optimism in the face of uncertainty）。

## Steps
### Step 0: 只看均值（Stage 0）
- **Purpose**: 展示初始状态，点出贪心算法的致命缺陷。
- **Visual**: 坐标轴与 3 个臂的实心均值柱升起。
- **Math**: 臂 1: $40/64=0.625$；臂 2: $10/16=0.625$；臂 3: $2/4=0.50$。
- **Short**: `只看均值：臂1、2最高 (0.625)，贪心会永远忽略臂3`
- **Notes**: 标注各臂 $N$ 与 $s$。

### Step 1: 加上探索 Bonus（Stage 1）
- **Purpose**: 引入不确定性加成 $\sqrt{2\ln t/N}$。
- **Visual**: 浅黄色 bonus 柱堆叠在均值柱上方。
- **Math**: $t=85$，$\ln 85\approx 4.4427$。bonus: 0.373, 0.745, 1.490（考试近似 $\ln 85\approx 4.5 \Rightarrow 0.375, 0.75, 1.5$）。
- **Short**: `加上Bonus √(2 ln t / N)：臂3试得少 (N=4)，加成高达 1.49`
- **Notes**: $N$ 在分母，开根号。

### Step 2: 比较 Q 值并选择臂 3（Stage 2）
- **Purpose**: 计算总分 $Q = \hat\mu + \text{bonus}$，做出决策。
- **Visual**: 柱顶显示总 $Q$；高亮臂 3（绿色边框 + Flash）。
- **Math**: $Q_1 \approx 0.998$，$Q_2 \approx 1.370$，$Q_3 \approx 1.990$。$\max \Rightarrow \text{臂 3}$。
- **Short**: `Q = 均值 + Bonus：臂3以 1.99 胜出，乐观选择臂3`
- **Notes**: 虽均值最低，但置信上界最高。

### Step 3: 连拉 12 次臂 3，实时演变（Stage 3 - Aha!）
- **Purpose**: 演示动态过程，看 bonus 如何随着尝试而缩水。
- **Visual**: 步骤一开始，臂 3 下方（P(505, 323)）出现蓝字“假设这 12 次里 6 次得奖（均值仍为 8/16 = 0.500）”；ValueTracker 驱动臂 3 连续拉 12 次（奖励交替 1, 0），柱高与读数平滑动态更新；拉完后臂 3 的“0.500”和这行字一起闪一下 —— 蓝色均值柱没动，变矮的只有黄色 bonus。该行字在下一步随柱状图一起淡出。
- **Math**: $N_3: 4\to 16$, $s_3: 2\to 8$, $t: 85\to 97$ ($\ln 97\approx 4.5747$)。最终 $Q = (1.003, 1.381, 1.256)$。
- **Short**: `连试12次臂3：不确定性收窄，Bonus缩水，臂2以1.38超车！`
- **Notes**: always_redraw 驱动堆叠柱及数值文字，无缝衔接。

### Step 4: 总结与公式拆解（Stage 4）
- **Purpose**: 公式角色注释，提炼核心哲学。
- **Visual**: 显示 UCB 完整公式，各部分引出角色标注。
- **Math**: $Q = \hat\mu + \sqrt{\frac{2\ln t}{N}}$。$\hat\mu$: 已知的平均回报；根号项: 没把握的程度；$\ln t$: 随时间慢慢补回。
- **Short**: `面对不确定性保持乐观：试得多变准，冷落的迟早再试`
- **Notes**: 标注左右对齐，避开遮挡。

## Colour Meanings
- **BLUE**: 均值 $\hat\mu$（已知观测利用，实心柱）。
- **YELLOW**: 探索 Bonus $\sqrt{2\ln t/N}$（不确定性奖励，上半段半透明柱）。
- **GREEN**: 胜出选中的臂 / 最大 $Q$ 值。
- **GREY**: 辅助参考线、样本数 $N$ 及公式角色注释。

## Takeaway Lines
1. `UCB：Q = 均值 + √(2 ln t / N)，选 Q 最大的臂`
2. `试得越少 bonus 越大；时间越长，被冷落的臂慢慢变大`
3. `乐观面对不确定：给潜力臂机会，多试后自然自纠`
