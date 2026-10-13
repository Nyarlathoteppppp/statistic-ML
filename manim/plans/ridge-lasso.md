# ridge-lasso · Ridge vs Lasso：为什么 Lasso 能产生稀疏解（c17）

## Overview
- **Hook**：同是控制过拟合的正则化，为什么只有 lasso 能把权重压成恰好 0？
- **Key insight（aha，第 4 步）**：菱形 $L_1$ 范数区域的尖角长在坐标轴上，等高线从多数方向膨胀过来都会先撞在尖角上，使得接触点恰好 $w_2=0$（稀疏性）；而圆周处处光滑，触点落在坐标轴上纯属巧合。
- **Narrative pattern**：Head-to-Head Comparison / Duel（双栏平行对照：相同无约束解 $\hat\bw=(2.2, 0.55)$ 与等高线，相同约束半径 $t=1$，由同一个 ValueTracker 同步膨胀，在触点处形成戏剧性对照）。
- **FLOW**：无约束与等高线 → 约束：圆 vs 菱形 → 等高线同步膨胀 → 触点：圆周 vs 尖角 → 尖角造就稀疏解
- **Emotional arc**：好奇（为什么只有 lasso 稀疏？）→ 困惑（两者只差一个范数）→ 部分明白（约束形式：在区域里找最低 RSS 椭圆）→ aha（同步膨胀：圆周在普通位置相切，菱形在轴上尖角撞击！$w_2=0$）→ 满足（尖角是稀疏性高概率发生的几何本质）。

## Steps（skeleton = 双栏坐标系与约束区域，两边使用相同约束半径 t = 1，全程不清空）
1. **无约束解与等高线**
   - Purpose：设定双栏无约束起点与 RSS 意义。
   - Visual：左右双栏坐标系，白点 $\hat\bw=(2.2, 0.55)$，演示同心椭圆等高线。
   - Math attached：$\hat\bw=(2.2, 0.55)$，标出 $w_1, w_2$ 坐标轴与 RSS 等高线。
   - short caption：白点 ŵ 是无约束解，蓝色椭圆是残差平方和 RSS 等高线
   - Technical notes：两栏严格局限于各自半区，左右边界安全边距 $\ge 25$ px。
2. **约束：圆 vs 菱形**
   - Purpose：引入约束形式，展示两者的几何约束形状与角色标注。
   - Visual：左边青色画出圆 $\|\bw\|_2^2\le 1$，右边橙色画出菱形 $\|\bw\|_1\le 1$。
   - Math attached：`‖w‖₂² → 圆（没有尖角）`，`‖w‖₁ → 菱形（尖角在坐标轴上）`。
   - short caption：两边使用相同约束半径 t = 1：ridge 是圆，lasso 是菱形
   - Technical notes：两边均使用相同约束半径 $t=1$，半径尺寸完全一致。
3. **等高线同步膨胀（Ridge 相切）**
   - Purpose：单一 ValueTracker 驱动同步膨胀，展示 Ridge 的首次相切。
   - Visual：单一 ValueTracker 从 $0.04$ 增长到 $c_{\text{ridge}}\approx 1.841$，两边椭圆同步膨胀；左侧椭圆首先切于圆周，亮黄触点与数值标签出现。
   - Math attached：触点 $(0.88, 0.47)$，两权重均非 0。
   - short caption：从 ŵ 同步放大椭圆：ridge 在 (0.88, 0.47) 首次相切
   - Technical notes：`tk` 控制两边椭圆重绘，到达 $1.841$ 时锁定 Ridge 椭圆。
4. **Lasso 碰撞尖角（aha）**
   - Purpose：Lasso 椭圆继续膨胀并撞在菱形尖角，产生稀疏解。
   - Visual：`tk` 继续增至 $c_{\text{lasso}}\approx 2.518$；左边 Ridge 保持不动，右边 Lasso 椭圆继续膨胀直至首次触碰菱形右尖角 $(1, 0)$，黄色脉冲。
   - Math attached：$(1, 0) \Rightarrow w_2 = 0$。
   - short caption：lasso 椭圆继续膨胀，在尖角 (1, 0) 首次接触：w₂ = 0
   - Technical notes：椭圆在 $c=2.518$ 时最右端位于 $w_1\approx 3.90$，绝不越过中线与右边界。
5. **尖角造就稀疏解**
   - Purpose：揭示几何本质与考试要点（尖角 vs 平滑圆周）。
   - Visual：高亮菱形尖角与圆周切点，展示两边总结药丸。
   - Math attached：尖角凸出 $\Rightarrow$ 极大概率撞在轴上（稀疏）；圆周平滑 $\Rightarrow$ 连续收缩，碰在轴上纯属巧合。
   - short caption：菱形尖角在坐标轴上极易先相撞；圆周平滑，碰在轴上纯属巧合
   - Technical notes：双栏底部药丸标注核心考点。

## Colours
- 蓝（BLUE）：RSS 等高线（数据误差项）；
- 青（TEAL）：Ridge $L_2$ 约束圆；
- 橙（ORANGE）：Lasso $L_1$ 约束菱形；
- 白（WHITE）：无约束解 $\hat\bw$；
- 黄（YELLOW）：最优约束触点与关键特征数值。

## Takeaway
- 菱形的尖角在坐标轴上，碰点大概率在尖角
- ‖w‖₁ ≤ t ⇒ 稀疏解（w₂ = 0，自动特征选择）
- ‖w‖₂² ≤ t 是光滑圆周，碰在坐标轴上纯属巧合
