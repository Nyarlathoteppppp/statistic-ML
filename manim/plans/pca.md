# pca — Pca
## Overview
- Hook / question: 二维压成一维，怎样少丢信息？ / 试着把每个点的影子留在一条线上。
- Key insight: 影子最分散的方向，正是协方差矩阵最大特征值的方向。
- Narrative: Two Perspectives → Unity；先看影子，再把同一方向接到方差曲线与特征向量。
- FLOW: 中心化 → 投影扫角 → 找最宽 → 读懂方差 → 联系特征向量。
- Duration: approximately 60 seconds; key results held at least 1.2 seconds. Updated brief: every on-screen formula uses M(); Chinese uses separate T(); live numbers copy cached M() digits.
- Notation (matches c37): unit direction p, transpose p' (prime, as in c03), covariance Σ_x; PC directions p₁, p₂. The angle readout's degree sign is a raised superscript aligned to the digit tops.
## Emotional arc
- Curiosity: opening compression question. Confusion: changing direction changes the shadows.
- Partial clarity: step 2 links spread to the curve. Aha: step 3 identifies the widest direction; step 6 unifies it with eigen.
- Satisfaction: retain PC1, explain 75% of variance and minimize squared reconstruction error.
## Step 1 — stage 0
- Question / Purpose: 怎样公平比较方向？先把点云中心放在原点。
- Visual: axes and the same 26 blue points appear; mean marker, then horizontal yellow line; copies of all points travel to their feet.
- Math attached: 均值 = 0；a = 0°；Var = 2.00；投影位置 t = p′x，p 为单位方向，‖p‖ = 1。
- Short: 先移到中心，再把每个点投到线上。
- Technical: reproduce browser sine-hash + Box–Muller, center, symmetric inverse-square-root whitening, recolour to [[2,1],[1,2]]; common x/y scale.
## Step 2 — stage 1
- Question / Purpose: 转动方向，影子的分散程度会怎样变？
- Visual: one ValueTracker sweeps 0→45→90→135→180; all perpendicular guides and shadows update; right curve is a pure function of current angle.
- Math attached: dot-attached live variance; angle label attached to direction; curve axes 0°,45°,90°,135°,180° and 1,2,3.
- Short: 转动同一条线，右图同步记录影子的分散。
- Technical: four 1.8-second linear sweeps, holds at 45°/135°; during this first sweep the curve is rebuilt from the current angle (0→a); at 180° its updater is cleared so the FULL 0–180° curve stays on screen for every later step, with only the moving dot + Var readout following the angle. At most 26 guides and 26 shadows rebuilt.
## Step 3 — stage 2
- Question / Purpose: 哪个方向最值得留下？
- Visual: return to 45°, indicate shadows and peak; same line turns TEAL, peak gets TEAL marker.
- Math attached: PC1 · 45°；最大方差 3；2 + sin 90° = 3。
- Short: 影子铺得最开，这个方向叫第一主成分。
- Technical: the full curve stays; the dot returns along it to the peak, so “曲线最高” is visible; hold the aha 2.4 s.
## Step 4 — stage 3
- Question / Purpose: 曲线上的 3 从哪里算出来？
- Visual: keep PC1 and cloud; bring in covariance beside cloud and formula under curve, then arithmetic beside peak.
- Math attached: Σ_x = [[2,1],[1,2]]；Var = p′Σ_x p；Var = 影子的分散；p = 方向，‖p‖ = 1；Σ_x = 数据的形状（协方差）；½(2+1+1+2)=3。
- Short: 方向和数据形状一起决定影子有多分散。
- Technical: roles are plain text; covariance convention is 1/n, not 1/(n−1); say derives 2+sin(2a).
## Step 5 — stage 3
- Question / Purpose: 换成垂直方向，会留下多少？
- Visual: preserve faint PC1, rotate same line/shadows to 135°, colour PURPLE; low point marked on the full curve.
- Math attached: PC2 · 135°；最小方差 1；½(2−1−1+2)=1。
- Short: 转到垂直方向，影子挤在一起，只剩方差一。
- Technical: (-1,1)/√2 is the negative of chapter's (1,-1)/√2, hence the same axis; PC2 is minimum here because dimension is two.
## Step 6 — stage 4
- Question / Purpose: 为什么无需一直试方向？
- Visual: return same line to PC1; leave faint perpendicular PC2; reveal eigen identities beside cloud, then retained-variance label.
- Math attached: Σ_x p₁=3p₁；Σ_x p₂=1p₂；λ = 该方向的方差；保留 3/(3+1)=75%。
- Short: 最宽方向就是最大特征值的方向。
- Technical: say links the c04 eigen video and states c37's Σ_x p₁ = λ₁p₁; derives both matrix-vector products and reconstruction error 4−3=1. PC2 marker sits on the full curve's minimum.
## Colour meanings / Takeaway
- BLUE data and covariance; YELLOW candidate direction/shadows and current curve; TEAL PC1 (browser/eigen continuity); PURPLE PC2; GREEN retained information; GREY context/guides.
- Takeaway: 留下影子最分散的方向 / 取最大特征值对应的单位方向 / 本例只留第一主成分，保留四分之三。
