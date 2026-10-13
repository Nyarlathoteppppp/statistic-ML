# COURSE_MAP — COMP90051 Statistical Machine Learning 期末复习网站

> 状态（2026-10-12）：已确认并实现。T1–T13 题型页、L01–L20 讲义、工具页完成；`node tests/core.test.js`（44 项）与 `node tests/site.check.js` 通过；两模型只读审查已完成并修正；初学者改进（入门页、术语表、入门题、新题模考、关键词）已完成。L21–L22 已加入（2026-10-12），T6 已对照 L22 核实；L23–L24 待课件发布。
> 讲义加入新讲后运行 `python3 tests/sync_scripts.py` 更新 index.html 的脚本列表。
> 依据：`reference/digests/L01–L20.md`（逐讲整理，带页码）、`reference/digests/WK02–WK09.md`（worksheet）、三份往年卷（2026 S2 practice、2025 S1 practice、2021 S1 exam）。
> L21–L24 课件未发布，只占位。

---

## 0. 目标与约束

**目标**：闭卷考试前只看这个网站就能复习 L1–L20（后续补 L21–L24），重点是能**手算**往年卷高频题型，并能用**英文**写出简答题答案。

**考试事实**（依据：L01 p10、2026 practice 封面）
- 2 小时，闭卷，笔试，120 分，占总评 40%，有 50% hurdle。
- 2026 practice 的允许物品里**没有计算器**，题目直接给 ln 值。因此网站所有计算演示都只用"手算友好"的数，并示范怎么用题目给的近似值。
- 三部分：A 简答（1–3 行），B 方法与计算，C 设计与应用。
- 2025 S1 的 Section C 写着"与 Project 1 相关"，2026 practice 的 C 是 PGM 建模题。今年 C 考什么不确定，两种都准备。

**语言**：中文讲解；术语第一次出现写成"中文（English）"，之后**以英文术语为主**。每个考点配一句可以直接写上卷面的英文标准答法（Exam phrasing）。

**技术约束**（沿用手册）：纯 HTML/CSS/Vanilla JS + SVG/Canvas + KaTeX（vendor 本地拷贝）；双击 `index.html` 离线可用，所以不用 fetch、不用 ES module；内容写成 JS 数据文件，用普通 `<script>` 按顺序加载。

---

## 1. 每一讲教授了什么

| 讲 | 标题 / 讲者 | 核心内容 | 考试权重* |
|---|---|---|---|
| L01 | Welcome & Maths Review（Honorio） | 概率（期望、方差、独立、条件、Bayes rule、边缘化）、线代（点积、超平面与法向量、范数、特征值/PSD）、序列极限/sup/inf | 低（工具） |
| L02 | Statistical Schools of Thought（Bozorgi） | 频率学派：估计量 bias/variance/consistency、MLE（Bernoulli、Normal）；决策论：loss、risk、ERM、平方损失的 bias-variance 分解；Bayesian：prior/likelihood/posterior/evidence、Normal 共轭例子、MAP；参数 vs 非参数，生成 vs 判别 | 中（A 区定义题） |
| L03 | Linear Regression（Bozorgi） | 1D/多维线性回归、RSS、正规方程 $\hat w=(X'X)^{-1}X'y$；Gaussian 噪声 MLE ⇔ 最小二乘；basis expansion（多项式、RBF、XOR 例子） | 高（2/3 卷 Q1a；XOR 特征映射） |
| L04 | Iterative Optimisation & Logistic Regression（Bozorgi） | GD、SGD、Newton-Raphson（Hessian）；logistic 模型、Bernoulli 似然、cross-entropy 等价 | 中 |
| L05 | Regularisation & Bias-variance（Bozorgi） | 共线性/无关特征、ridge 闭式解 $(X'X+\lambda I)^{-1}X'y$、lasso 稀疏、正则化 ⇔ MAP（Gaussian/Laplace prior）、模型复杂度、bias-variance 分解与 trade-off | 中（2021 Q8、Q13a） |
| L06 | Generalisation, finite class（Honorio） | ERM、empirical vs true risk、有限类泛化界 $\sqrt{(\log|F|+\log(1/\delta))/2n}$、union bound + Hoeffding 证明思路、SRM | 中（概念） |
| L07 | Generalisation, finite VC（Honorio） | dichotomy、growth function、shattering、VC dimension、decision stumps（$S=2n$，VC=2）、2D 线性分类器 VC=3、**从 dichotomy 表求 VC**（p29）、Sauer-Shelah、VC 界 | **很高（3/3 卷）** |
| L08 | Support Vector Machines（Bozorgi） | 点到超平面距离、canonical scaling、hard-margin 目标、support vectors、hinge loss、soft-margin + slack、$C$ | **高**（2026 Q1c、2021 Q2） |
| L09 | Kernel Methods（Bozorgi） | Lagrangian、KKT、SVM dual、box constraint、kernel trick、多项式核展开、RBF 推导、kernel 构造规则（和、积、数乘、$f(u)K f(v)$）、Mercer、representer theorem | **高**（2021 Q3、Q15 证明） |
| L10 | The Perceptron（Bozorgi） | perceptron loss $\max(0,-sy)$、SGD 更新 $w\leftarrow w+\eta y x$、数值例子 p33–p39、收敛定理 $k\le R^2/\gamma^2$、kernel perceptron | 中 |
| L11 | Neural Network Fundamentals（Jiang） | MLP、激活函数、布尔函数构造、universal approximation、深度 vs 宽度、表示学习（隐藏层 = 学到的 basis）、**backprop**（$\delta$、$\varepsilon_j$） | 高（2021 Q4、Q13b） |
| L12 | Training DNN & Autoencoders（Jiang） | SGD/mini-batch、非凸、momentum、Adagrad、Adam、L2/dropout/early stopping、autoencoder、bottleneck、PCA 对比 | 中（2021 Q7、Q9） |
| L13 | CNN（Jiang） | 1D/2D 卷积、filter、feature map、channel、stride/padding、weight sharing、max pooling（sub-gradient）、平移不变性 | **高**（2/3 卷参数计数） |
| L14 | RNN, Attention, Transformer（Jiang） | RNN 展开（深度 = 序列长度）、BPTT、梯度消失 $W^{T-1}$、LSTM、attention、self-attention、Transformer | 中（2021 Q1） |
| L15 | Cross-Validation（Honorio） | 指标（precision/recall/sensitivity/specificity/ROC/AUC）、train/val/test、k-fold、0.632 bootstrap、nested CV、特征选择放 CV 里面、Welch t 检验（p29–p30 数值）、error bars | 中 |
| L16 | Learning with Expert Advice（Honorio） | Majority（$M\le\log_2 n$）、Halving（$M\le2.4(m+\log_2 n)$）、$(1-\varepsilon)$ weighted majority（$M\le2(1+\varepsilon)m+2\ln n/\varepsilon$）、probabilistic experts | 中 |
| L17 | Multi-armed Bandits（Honorio） | regret、greedy、$Q_0$ 乐观/悲观初始化、$\varepsilon$-greedy、**UCB** $\hat\mu+\sqrt{2\ln t/N}$、contextual bandits、与 RL 对比 | **很高（2/3 卷）** |
| L18 | Bayesian Regression（Jiang） | 点估计 vs 后验、Normal-Normal 共轭、$w_N,V_N$、序列更新、预测分布方差 $\sigma^2+x_*'V_Nx_*$ | 高（2021 Q5、Q11；Q1b 边缘似然） |
| L19 | Bayesian Classification（Jiang） | 生成 vs 判别、Beta-Binomial 共轭、sunrise $(k+1)/(k+2)$、共轭先验表、Bayesian logistic 无共轭 → Monte Carlo / variational / Laplace 近似 | 中（2021 Q10） |
| L20 | Probabilistic Graphical Models（Honorio） | BN = DAG + 分布、因子分解 $\prod P(x_i|x_{pa_i})$、**D-separation = 祖先图 → moralize → 普通图分离**、MRF、clique、Hammersley-Clifford、BN→MRF | **很高**（BN 独立性、CPT、建模题） |
| L21 | Inference on MRFs（Honorio，**未发布**） | 预计：variable elimination、消元顺序、fill-in、junction tree | **很高**（2026 Q5 已考 junction tree） |
| L22–L24 | （Jiang，**未发布**） | 主题未知。2021 卷考过的 EM、Gibbs sampling、HMM 不在 L1–L20，可能在这里 | 待定 |

\* 考试权重根据三份往年卷的出现频率估计，不是官方信息。

---

## 2. 知识依赖图

```
L01 概率/线代 ─┬─► L02 MLE / MAP / Bayes ─┬─► L03 线性回归 ─► L05 正则化 ⇔ MAP、bias-variance
               │                          │        │
               │                          │        └─► basis expansion ─────────┐
               │                          ├─► L04 GD / Newton / logistic        │
               │                          │        └─► L10 perceptron ─► L11 MLP + backprop ─► L12 训练/AE ─► L13 CNN
               │                          │                                                         └─► L14 RNN/attention
               │                          └─► L18 Bayesian 回归 ─► L19 Bayesian 分类/共轭
               │                                                       └─► L20 BN / MRF ─► L21 推断（消元、junction tree）
               ├─► L06 有限类泛化界 ─► L07 VC 维 ──────► （SRM、模型选择）─► L15 交叉验证
               ├─► L08 SVM（几何）─► L09 dual + kernel ◄─ basis expansion
               │                       └─► L10 kernel perceptron
               └─► L16 experts（online）─► L17 bandits（部分反馈）
```

关键交叉点（网站里用"相关概念"卡片互链）：
- 正则化 ⇔ MAP 先验：L03 p2、L05、L18（ridge = Gaussian prior 的 MAP）、2021 Q13a。
- basis expansion → kernel → 神经网络隐藏层：L03、L09 p25、L11 p17、2021 Q4。
- 边缘似然（marginal likelihood / evidence）：L02、L18，2025/2026 Q1b。
- hinge loss vs perceptron loss vs logistic loss：L08、L10、L04。

---

## 3. 网站章节规划

整个网站分四大区，左侧目录按区折叠。

### 区 A：考试导航（首页）
- 考试格式、闭卷注意事项、三份卷的题型出现频率表（见 §9）。
- 复习路线建议：先做"题型训练"的 T1–T7，再按讲补概念。
- 进度总览（localStorage，每章勾"已读/已练"）。

### 区 B：题型训练（核心）
每个题型一页，固定 6 段：
1. **识别**：卷面上看到什么就是这类题。
2. **解题步骤**：编号步骤，对应课件页码。
3. **交互解题器**：输入题目（或载入真题/随机生成），逐步显示每一步。
4. **真题全解**：往年卷原题 + 完整解答 + 评分要点 + 英文卷面写法。
5. **变式练习**：随机生成 + 自动判分 + 解释。
6. **易错点**。

| 编号 | 题型 | 对应讲 | 真题 |
|---|---|---|---|
| T1 | 从 dichotomy 表求 VC 维、列出被 shatter 的集合 | L07 p23–p29 | 2026 Q3、2025 Q3、2021 Q16 |
| T2 | UCB / $\varepsilon$-greedy / greedy 选臂计算 | L17 p7–p18 | 2026 Q2、2021 Q17 |
| T3 | CNN（与 MLP）参数计数、输出尺寸 | L13 p9–p17、WK08 | 2026 Q1d、2025 Q5 |
| T4 | SVM：从图找 support vectors、margin、距离、hinge loss | L08、L09 p11 | 2026 Q1c、2021 Q2 |
| T5 | BN 条件独立判断（D-separation 四步法） | L20 p17–p25 | 2026 Q4 |
| T6 | MRF 消元顺序 → junction tree 的团（**L21 发布前标"按标准方法"**） | L21（待） | 2026 Q5、2021 Q18b |
| T7 | PGM 建模 + CPT 数量/规模 + MLE 计数估计 | L20 p8–p14、p27；L02 MLE | 2026 Q6、2025 Q1d/e、Q4、Q6 |
| T8 | Kernel：合法性证明、特征映射、XOR 变换、primal vs dual | L09 p17–p35、L03 basis | 2025 Q2、2021 Q3、Q15 |
| T9 | Bayesian 计算：Beta-Binomial 更新、MAP vs MLE、预测方差 | L18、L19、WK02 | 2021 Q5、Q10、Q11 |
| T10 | Backprop 推导与数值 | L11 p25–p31 | 2021 Q13b |
| T11 | Perceptron 手算更新 | L10 p33–p39、WK05 | （worksheet 题型） |
| T12 | Experts 与泛化界代数（mistake bound、有限类界） | L16、L06 p17 | （概念/计算） |
| T13 | 简答题库（Section A） | 全部 | 三份卷全部 Q1 类 |

### 区 C：按讲复习（精简讲解）
L01–L20 每讲一章，L21–L24 占位章。每章采用**精简 7 段**（取代手册的 10 段，因为题型区已经承担了交互和练习）：

1. 一句话总结（中文 + English one-liner）
2. 为什么需要它 / 直觉
3. 核心定义与公式（KaTeX，重要公式支持"逐项高亮"）
4. 课件例子（用课件原数）
5. 与相近概念对比（表格）
6. 常见误区 + 课件笔误提示
7. 小测（3–5 题，带解释）+ "相关题型"跳转

**分层：精简版 + 展开详解**（2026-10-12 确认）。正文默认是精简版，够应付考试。难点和考点处放"展开详解"入口（折叠块，点开在原位展开，不跳页）。详解内容是：完整推导、逐步数值演算、直觉类比、更多例子、课件延伸（标"课件未讲"）。取舍标准是**能不能帮助通过期末**：考试会用到的推导写全；纯理论证明只给思路。

讲与讲之间按 §1 的单元分组：
- 单元 1 基础：L01–L05
- 单元 2 学习理论：L06–L07
- 单元 3 核方法：L08–L10
- 单元 4 深度学习：L11–L14
- 单元 5 评估与在线学习：L15–L17
- 单元 6 Bayesian 与图模型：L18–L20、L21–L24（占位）

### 区 D：工具
- **闭卷必背公式**（按优先级 ★★★/★★/★ 分级，见 §5）
- **术语表**（English ↔ 中文 ↔ 一句话定义 ↔ 出处页码）
- **英文答题句式库**（按题型分组，可复制）
- **真题索引**（每道往年题 → 题型 → 讲 → 解答链接）
- **错题本**（练习答错自动收录，localStorage）

---

## 4. 每章 / 每个题型的交互 demo

交互只服务于"能手算考题"，不做装饰。每个都必须能复现一个课件或真题的具体例子。

| 交互 | 位置 | 能做什么 | 必须复现的例子 |
|---|---|---|---|
| VC 维解题器 | T1、L07 | 输入/随机生成 dichotomy 表；逐个子集检查（删列 → 去重行 → 数行是否 $=2^k$）；高亮最大 shattered 集；可列出全部 shattered 集 | L07 p29（VC=3）、2026/2025 Q3（VC=2）、2021 Q16（VC=3，共 16 个 shattered 集含空集） |
| Decision stump 枚举器 | L07 | 拖动阈值 $\beta$，显示预测与错误数，统计 dichotomy 数 $2n$ | L07 p13–p16 表格（错误数 2,3,4,5,4 / 4,3,2,1,2；12 个 dichotomy） |
| 2D 线性分类器 shattering | L07 | 3/4 个点任意标注，尝试画分隔线；共线情形 | L07 p25–p28 |
| UCB / ε-greedy 计算器 | T2、L17 | 输入每臂 pulls/rewards、t；显示 $\hat\mu$、bonus、$Q$、选择；提供"考试近似 ln 值"模式；可逐轮模拟 | 2026 Q2（t=85，arm3 Q≈2.0 被选）；L17 p8–p9 乐观/悲观初始化 |
| CNN 参数计数器 | T3、L13 | 1D 图示（输入数、filter 宽、是否共享）+ 2D 层配置（$H,W,C_{in},K,C_{out}$,stride,padding）；逐层显示参数与输出尺寸，可切换"含/不含 bias" | 2026/2025 卷图（3+20+20=43，见 §7 待确认）；L13 p17（32×32×1 → 6 个 5×5 → 28×28×6） |
| SVM 几何 | T4、L08 | 网格上放点，求 hard-margin 边界（小规模穷举/QP），显示 margin、SV、$1/\|w\|$；点到超平面距离 | 2026 Q1c（SV = 1,2,4） |
| Hinge / perceptron / logistic loss 对比 | L08、L10、L04 | 同一坐标画三种 loss 随 $ys$ 变化 | L08 p31 |
| Kernel 展开器 | T8、L09 | 选 $(u'v+c)^d$，展开成显式 $\varphi$，对照运算次数 | L09 p22（9 次 vs 3 次）、p32 |
| XOR 特征映射 | T8、L03 | 原空间不可分 → 加特征 $x_1x_2$ 或 RBF 后可分，3D 旋转视图 | 2025 Q2、L03 RBF 例子 |
| Perceptron 逐步训练 | T11、L10 | 逐样本更新，显示 $s$、是否更新、新权重、决策边界 | L10 p33–p39（η=0.1，w 从 (0.2,0,−0.1) 开始） |
| Backprop 逐步 | T10、L11 | 小网络（2-2-1）前向/反向，显示每个 $\delta,\varepsilon_j$ | L11 p28–p31 公式 |
| 优化器对比 | L12 | GD / momentum / Adagrad / Adam 在 2D 碗形和鞍点上的轨迹 | L12 p11–p14 更新式 |
| Bias-variance 模拟 | L05 | 多次重采样拟合不同阶多项式，显示 bias²/variance | L05 p29–p40（$x\sin x$） |
| Ridge 路径 | L05 | 调 $\lambda$ 看权重收缩，共线特征下的唯一性 | L05 p4–p19 |
| Experts 模拟 | T12、L16 | 设定专家预测序列，跑 Majority / Halving / WM，显示权重与 mistake bound | L16 p6、p12、p18 公式 |
| CV / t 检验 | L15 | 输入 fold 误差，算 $\hat\mu,\hat\sigma^2$、Welch 统计量、$\nu$、结论；error bar | L15 p29（0.22 ≤ 1.75 不拒绝）、p30（2.24 > 1.75 拒绝）、p31 |
| Beta-Binomial 更新 | T9、L19 | 调 $\alpha,\beta$、输入正/反面数，看先验→后验，MAP/MLE/均值 | L19 p15 sunrise；WK02 MAP 公式 |
| Bayesian 线性回归 | L18 | 逐点加数据，看后验和预测带变化（预测方差随 $x_*$ 远离数据增大） | L18 p19–p21、2021 Q11 |
| D-separation 四步法 | T5、L20 | 预置/编辑 DAG，选 X、Y、S；动画依次显示祖先图 → moralize → 删除 S → 找路径 | L20 p18–p21（$L\perp B\mid A$ 不成立）、p22–p25（$R\perp A\mid E$ 成立）、2026 Q4 |
| CPT 计数器 | T7、L20 | 给定图与每个变量取值数，列出每张 CPT 的格式、行数、自由参数数；对比"全联合表" | 2025 Q1d/e、Q4a、2026 Q6b |
| MLE 计数 | T7 | 输入完整观测数据，自动按父节点配置计数估计 CPT | 2025 Q4c |
| 消元 → junction tree | T6、L21 | 无向图 + 消元顺序，逐步显示消元、fill-in 边、产生的团、极大团 | 2026 Q5（团 {T,U,W},{U,X,Y},{V,W,Y,Z},{U,V,W,Y}，待 L21 确认） |
| BN → MRF | L20 | moralize + 去方向 | L20 p39–p40 |

---

## 5. 必须保留的公式和定义（闭卷必背，按优先级）

★★★（往年卷直接用到）
- 线性回归目标：$\min_w \sum_i (y_i-w'x_i)^2$；正规方程 $\hat w=(X'X)^{-1}X'y$（L03）
- 边缘似然：$p(y\mid X)=\int p(y\mid X,w)\,p(w)\,dw$（L02、L18）
- VC 相关：dichotomy、$S_F(n)$、shattered、$\mathrm{VC}(F)=\max\{n:S_F(n)=2^n\}$（L07）
- UCB：$Q_{t-1}(i)=\hat\mu_{t-1}(i)+\sqrt{2\ln t/N_{t-1}(i)}$，未拉过的臂用 $Q_0$（L17 p18）
- SVM：hard-margin $\min\frac12\|w\|^2$ s.t. $y_i(w'x_i+b)\ge1$；距离 $y_i(w'x_i+b)/\|w\|$；soft-margin 加 $C\sum\xi_i$；hinge $\max(0,1-y(w'x+b))$（L08）
- SVM dual：$\max_\lambda \sum\lambda_i-\frac12\sum\sum\lambda_i\lambda_jy_iy_jK(x_i,x_j)$，s.t. $\lambda_i\ge0$（soft：$\le C$），$\sum\lambda_iy_i=0$；$w^*=\sum\lambda_iy_ix_i$（L09）
- Kernel 构造规则 + Mercer（PSD）（L09 p33–p35）
- BN 因子分解 $P(x_1..x_n)=\prod P(x_i\mid x_{pa_i})$；D-separation 四步（L20 p17、p27）
- MRF：$P=\frac1Z\prod_c\psi_c(x_c)$（L20 p37）
- 卷积层参数：$C_{out}\cdot C_{in}\cdot K^2$（+ $C_{out}$ bias）；全连接 $n_{in}n_{out}$（+ $n_{out}$）（WK08、L13）
- Bayesian 线性回归：$V_N=\sigma^2(X'X+\frac{\sigma^2}{\gamma^2}I)^{-1}$，$w_N=\frac1{\sigma^2}V_NX'y$，预测 $y_*\sim N(x_*'w_N,\ \sigma^2+x_*'V_Nx_*)$（L18；2021 卷附公式）

★★
- MLE / MAP 定义；MAP = MLE + log prior；ridge ⇔ Gaussian prior（L02、L05）
- Beta-Binomial：后验 $\mathrm{Beta}(k+\alpha,n-k+\beta)$；均值 $\alpha/(\alpha+\beta)$；MAP $\frac{k+\alpha-1}{n+\alpha+\beta-2}$（L19、WK02）
- Logistic：$p(y=1|x)=\sigma(x'w)$；cross-entropy loss；GD 梯度 $X'(\mu-y)$（L04、WK03）
- Ridge 闭式解 $(X'X+\lambda I)^{-1}X'y$（L05）
- Perceptron：loss $\max(0,-sy)$，更新 $w\leftarrow w+\eta yx$（$sy\le0$ 时），收敛界 $R^2/\gamma^2$（L10）
- Backprop：$\partial L/\partial w_j=\delta u_j$，$\partial L/\partial v_{ij}=\delta w_j g'(r_j)x_i$（L11）
- 有限类泛化界、VC 泛化界（L06、L07）
- Experts mistake bounds（L16）
- 优化器：momentum、Adagrad、Adam 更新式（L12）
- RNN 梯度 $W^{T-1}$ 与梯度消失（L14）

★
- 精度指标定义、Welch t 统计量（L15）
- Hoeffding 不等式（L06、L17）
- Newton-Raphson 更新（L04）
- PCA 目标（L12）

---

## 6. 容易理解困难的地方

1. **VC 维的"存在"与"所有"**：VC=d 只需要**存在**一个 d 点集被 shatter，不需要所有 d 点集都能（L07 p26 共线反例）。dichotomy 表题里同样只需找到一个子集。
2. **Dichotomy 表的操作**：删列（只看子集）→ 去重 → 数行。学生常忘记去重，或把"行数 ≥ $2^k$"当作充分条件而不检查是否覆盖全部模式。
3. **UCB 里 t 是多少**：公式用 $t$ = 当前轮次（已拉总次数 + 1）。2026 Q2 已拉 84 次 → $t=85$，所以题目给了 ln 85。
4. **Hard-margin 的 margin "=1"**：canonical scaling 让 SV 的 functional margin 等于 1，几何距离是 $1/\|w\|$（2021 Q2 原题）。
5. **D-separation 必须先取祖先图再 moralize**：直接在原图上 moralize 会多出假边；忘记"给定 collider 会打开路径"的直觉对应 moralize 时 married parents。
6. **CPT 规模的计数约定**：按"行数"、"列数"还是"自由参数数"，不同题的问法不同（2025 Q6b 说"列数"，并说明无父节点的表也算一张）。网站要把三种都算出来并说明区别。
7. **Kernel 合法性证明**：要构造显式 $\varphi$（拼接特征映射）或用 PSD 论证，不能只说"直觉上是相似度"。
8. **Bayesian 预测方差为什么随测试点变化**：$x_*'V_Nx_*$ 在数据少的方向大。
9. **Backprop 的链式法则拆分**：$\delta$ 与 $\varepsilon_j$ 的定义和复用。
10. **Dual vs primal 何时更好**：dual 复杂度看样本数 $n$，primal 看维数 $d$（L09 p10、p13）；2021 Q3 问二次核什么时候用 primal。
11. **MAP 不需要共轭**：MAP 只需要优化，不需要归一化常数（2021 Q10）。

---

## 7. 需要增加额外解释的地方 / 待确认

- **CNN 参数题的图读法**（2026 Q1d、2025 Q5）：我目前读作 7 输入 → 5 个卷积单元（filter 宽 3、权重共享）→ 全连接 4 个隐藏单元 → 全连接 5 个输出，不含 bias：$3+5\times4+4\times5=43$。图中有 "…"，单元数存在歧义，网站会写出读图依据，并说明"不共享权重"时的错误答案（$5\times3=15$）。
- **MRF / junction tree**：L21 未发布，团的定义（是否只列极大团）、消元构造 junction tree 的方式需等课件确认。先按"每次消元产生的团 {v} ∪ N(v)，保留极大团"实现。
- **CPT 计数约定**：同 §6.6，三种口径并列。
- **课件笔误提示**（来自 digests 第 8 节）：
  - L08 p33 写 $C=1/\lambda$，按 p32/p33 的系数推导应为 $1/(2\lambda)$。
  - L15 p29–p30 自由度 15.8/15.2 都取 16（向上取整）。
  - L17 p17 同时出现 $\varepsilon=1/t$ 和 $1/t^4$；UCB 里的 2 对应 $1/t^4$。
- **2021 卷超出 L1–L20 的题**（EM、Gibbs sampling、HMM 消元）：放进"可能考，待课件"区，先给标准解法并标注"课件未讲"。

---

## 8. 可以省略的内容

- L01 的课程管理页（p1–p10）、序列极限/sup/inf 的细节（只留一句话）。
- L06/L07 的证明细节（讲者明说 "we are not making you prove things"，L06 transcript）；只保留证明思路图。Sauer-Shelah 证明不在范围内（L07 p30）。
- L09 p37 kernel 目录表、L09 p5 湖泊比喻的细节。
- L12/L13/L14 中 PyTorch 代码细节（worksheet 里的 `nn.Module` 写法），只保留概念与参数计算。
- L14 ResNet/迁移学习、L13 p28–p30 只保留一句话。
- L15 t 分布 CDF 图的细节；保留计算流程。
- L16 p26 应用列表；L17 p4–p5 老虎机图片。
- WK09 的 Transformer 位置编码公式和具体参数数（48,633,333 等）—— worksheet 细节，标"了解即可"。

---

## 9. 往年卷题型频率（用于首页和复习优先级）

| 题型 | 2026 S2 practice | 2025 S1 practice | 2021 S1 exam |
|---|---|---|---|
| 线性回归目标 / 边缘似然（定义） | Q1a、Q1b | Q1a、Q1b | — |
| 条件独立的含义 / 联合表行数 | — | Q1c、Q1d、Q1e | — |
| SVM support vectors / margin | Q1c | — | Q2、Q3 |
| CNN 参数计数 | Q1d | Q5 | — |
| UCB | Q2 | — | Q17 |
| VC 维（dichotomy 表） | Q3 | Q3 | Q16 |
| BN 条件独立 | Q4 | — | Q18a（HMM 变体） |
| Junction tree / 消元 | Q5 | — | Q18b |
| PGM 建模 + CPT | Q6 | Q4、Q6 | Q14a |
| XOR / basis / kernel | — | Q2 | Q15、Q4 |
| Bayesian（MLE 不确定、共轭、预测方差） | — | — | Q5、Q6、Q10、Q11 |
| 深度学习概念（RNN 深度、momentum、AE、backprop） | — | — | Q1、Q7、Q9、Q13b |
| 正则化 / bias | — | — | Q8、Q13a |
| EM / Gibbs（L1–L20 未覆盖） | — | — | Q12、Q14b |

我自己用代码算出的真题答案（之后写进 `tests/` 作为回归测试，并与两个模型的独立解答交叉核对）：
- 2026/2025 Q3：VC = 2，例如 {x1, x2}（2-元子集中有 6 个被 shatter，x5 不能参与）。
- 2021 Q16：VC = 3，shattered 3-集 {x1,x3,x4}、{x1,x3,x6}；全部 shattered 集按大小 1+6+11+2 = 20 个（含空集），不含空集 19 个。答题时要写明是否算空集。（初版我从 PDF 文本抄表抄错了最后一行，算成 16；与 sol 的解答交叉核对后对照原图改正。以后所有真题表格一律从高清图转录，再由代码和模型双重核对。）
- 2026 Q2：$Q_1=0.625+\sqrt{9/64}=1.0$，$Q_2=0.625+\sqrt{9/16}=1.375$，$Q_3=0.5+\sqrt{9/4}=2.0$ → 拉 arm 3。
- 2026 Q4：边 S→V, S→W, T→W, U→V, U→Y, X→Y, V→Z, W→Z, Y→Z；moralize 后 U–Y–Z 路径绕开 {V,W}，$S\perp Z\mid V,W$ **不成立**。
- 2026 Q5：极大团 {T,U,W}、{U,X,Y}、{V,W,Y,Z}、{U,V,W,Y}。
- 2026 Q1c：SV = 1, 2, 4（边界 x = 4.5，margin 1.5）。
- 2025 Q4c（A→C←B，5 条数据）：$P(A{=}T)=2/5$，$P(B{=}T)=2/5$；$P(C{=}T\mid A,B)$：(F,F)=1/2，(F,T)=0/1，(T,F)=1/1，(T,T)=1/1。
- 2025 Q1d：全联合表 $2^4=16$ 行（15 个自由参数）；Q1e：$2+2+2+2^3=14$ 行（7 个自由参数）——口径见 §6.6。
- 2026 Q6：图 S1,S2,S3,C1,C2 → A；6 张 CPT；$P(A\mid\cdot)$ 有 $2^5=32$ 种父配置（×2 取值 = 64 项，32 个自由参数）；传感器绝对准确时 A 的 CPT 全是 0/1（确定性：A=1 当且仅当 $(S_1\lor S_2\lor S_3)\land\lnot C_1\land\lnot C_2$）。

---

## 10. 目录结构

```
precious final/sml-review/
├── index.html
├── COURSE_MAP.md
├── DIGEST_SPEC.md            给 Pi 代理的整理规范
├── css/        base.css（token、深浅色）· layout.css · components.css · viz.css
├── js/
│   ├── core/   纯算法（浏览器 + Node 共用）：vc.js · bandit.js · cnn.js · svm.js · dsep.js · elim.js · cpt.js · perceptron.js · backprop.js · experts.js · stats.js · bayes.js · kernel.js
│   ├── ui/     app.js（路由/目录/进度）· render.js（章节模板）· formula.js（KaTeX + 逐项高亮）· quiz.js · practice.js（随机题 + 判分）· store.js（localStorage 包装）
│   └── viz/    每个交互一个文件，统一接口 window.SML.viz.register(id, mount)
├── data/       exam.js（考试信息 + 真题）· types/T01…T13.js · lectures/L01…L24.js · glossary.js · formulas.js · phrases.js
├── assets/figures/   真题图、课件截图（压缩 JPG/PNG）
├── reference/  text/ · pages/ · transcripts/ · worksheets/ · digests/ · exam_figs/
├── tests/      core.test.js（课件 + 真题数字）· site.check.js（结构 + 公式渲染）
└── vendor/     katex/（本地拷贝）
```

---

## 11. 分工（主力模型 + Pi 代理）

| 工作 | 负责 | 说明 |
|---|---|---|
| COURSE_MAP、界面框架设计、CSS token、页面模板 | Claude（我） | |
| 全部讲解文字、题型讲解、英文答题句式、真题解答定稿 | Claude（我） | 讲解文字不外包 |
| `js/core/` 算法实现初稿 | gpt-6.1-sol | 我给接口和测试用例；Pi 没有 bash，测试由我跑 |
| `tests/site.check.js`、术语表初稿、公式速查初稿 | gemini-3.8-flash | 格式固定的机械活，我审 |
| 各讲小测题初稿 | deepseek-v4.1-flash | 我逐题审改 |
| `js/viz/` 交互模块实现 | gpt-6.1-sol / gpt-6-astra | 按框架接口写，我在浏览器里验收 |
| 真题独立解答（交叉核对） | gpt-6.1-sol、gpt-6-astra | 已在进行 |
| 只读审查（对照课件找错） | grok-4.7 + 另一个模型 | 两份结果取交集 |

---

## 12. 实现顺序（确认后执行）

1. `js/core/` + `tests/core.test.js`：先让课件和真题数字全部通过。
2. 框架：目录、路由、章节模板、公式逐项高亮、quiz/练习引擎、进度、深浅色。
3. 题型区 T1–T7（高频优先），每个带解题器和真题全解。
4. 按讲正文 L01–L20 + 工具页（必背公式、术语表、句式库、真题索引）。
5. 题型 T8–T13。
6. 自动校验 + 两模型审查 + 修正。
7. 你通读，卡住的地方写回网站。
8. L21–L24 课件发布后追加。

---

## 13. v2 重做：概念章节（2026-10-13 确认）

**原因**：用户完全不看 PPT，只在网站上学；对标 COMP90054 RL 网站（38 章 × 10 环节）。v1 的 L 页只是复习备忘录，不够教会人。

**组织**：按**学习顺序**（期末要从头重学），每章 10 环节：学习目标/先修 → 它是什么 → 为什么 → 直觉（课件原数手算）→ 数学定义 → 公式逐项 → 数值例子 → 交互（附"这个图在做什么"）→ 对比 → 误区 → Quiz。每章顶部考试标记：
- **★★★ 必考**：往年卷直接出过的题型（链接到 T 页）
- **★★ 重点**：概念/简答高频
- **★ 了解**：会用到但很少单独考
- **不考**：只用于课件明确写了 outside scope 的部分（L04 p17、L06/L07 证明、Hoeffding 证明、Sauer–Shelah 证明、L07 p34 其他框架）
（★ 级别是根据三份往年卷判断，页面上注明"非官方"。）

原 L01–L22 页保留为每讲末尾的"本讲速览"（复习用），章节是学习主体。T 页、模考、入门、术语表不变。

| 章 | 标题 | 课件 | 标记 | 交互（新=待做） |
|---|---|---|---|---|
| **W1 L01–L02** |||||
| c01 | 概率：随机变量、期望、方差 | L01 p11–p18 | ★ | 新：骰子/硬币期望方差 |
| c02 | 条件概率、独立、Bayes rule、边缘化 | L01 p19–p25 | ★★ | 新：二维联合表切片 |
| c03 | 线代：向量、点积、超平面、范数 | L01 p26–p35 | ★★ | 新：超平面与法向量 |
| c04 | 矩阵、特征值、PSD | L01 p36–p43 | ★ | — |
| c05 | 估计量：bias、variance、consistency | L02 p3–p9 | ★★ | 新：抽样分布模拟 |
| c06 | 最大似然 MLE | L02 p10–p15 | ★★★ | 新：Bernoulli 似然曲线 |
| c07 | 决策论、风险、ERM | L02 p16–p19 | ★★ | — |
| c08 | Bayesian：先验、后验、边缘似然、MAP | L02 p20–p27 | ★★★ | beta-update |
| c09 | 参数/非参数、生成/判别 | L02 p28–p31 | ★★ | — |
| **W2 L03–L04** |||||
| c10 | 线性回归与最小二乘 | L03 p4–p10 | ★★★ | 新：拖点拟合直线、RSS |
| c11 | 线性回归 = Gaussian MLE | L03 p11–p19 | ★★ | — |
| c12 | Basis expansion、RBF、XOR | L03 p20–p28 | ★★★ | 新：XOR 升维 |
| c13 | 迭代优化：GD、SGD | L04 p3–p11 | ★★ | 新：GD 轨迹/步长 |
| c14 | Newton–Raphson（p17 其余话题不考） | L04 p12–p18 | ★ | 新：Newton vs GD |
| c15 | Logistic regression | L04 p19–p32 | ★★ | 新：sigmoid 拟合 |
| **W3 L05–L06** |||||
| c16 | 共线性与 Ridge | L05 p4–p16 | ★★ | 新：ridge 收缩 |
| c17 | Lasso、正则化 = MAP | L05 p17–p19 | ★★★ | — |
| c18 | 过拟合与模型复杂度 | L05 p20–p28 | ★★ | 新：多项式阶数 |
| c19 | Bias–variance trade-off | L05 p29–p40 | ★★★ | 新：重采样拟合 |
| c20 | 经验风险、真实风险、ERM | L06 p4–p15 | ★★ | — |
| c21 | 有限类泛化界、SRM（证明不考） | L06 p16–p33 | ★★ | 新：界随 n、|F| 变化 |
| **W4 L07–L08** |||||
| c22 | Dichotomy、growth function、stumps | L07 p8–p19 | ★★ | stump-explorer |
| c23 | Shattering 与 VC 维 | L07 p22–p29 | ★★★ | vc-solver、新：2D 点 shatter |
| c24 | VC 泛化界（Sauer–Shelah 证明不考） | L07 p30–p34 | ★★ | — |
| c25 | 最大 margin 与点到超平面距离 | L08 p4–p18 | ★★★ | 新：距离几何 |
| c26 | Hard-margin SVM | L08 p19–p27 | ★★★ | svm-grid |
| c27 | Soft margin、hinge、slack | L08 p28–p35 | ★★ | 新：C 变化 |
| **W5 L09–L10** |||||
| c28 | Lagrangian、KKT、SVM dual | L09 p4–p13 | ★★ | — |
| c29 | Kernel trick、多项式核、RBF | L09 p14–p27 | ★★★ | 新：kernel 展开 |
| c30 | 合法 kernel、Mercer、representer | L09 p28–p38 | ★★★ | 新：Gram 矩阵 PSD |
| c31 | Perceptron 模型与更新 | L10 p2–p29 | ★★ | perceptron-stepper（扩展 2D） |
| c32 | 收敛定理、kernel perceptron | L10 p30–p47 | ★ | — |
| **W6 L11–L12** |||||
| c33 | MLP、激活、万能逼近 | L11 p2–p24 | ★★ | 新：MLP 决策边界 |
| c34 | Backpropagation | L11 p25–p31 | ★★★ | 新：backprop 逐步 |
| c35 | 训练：SGD、momentum、Adagrad、Adam | L12 p2–p16 | ★★ | 新：优化器轨迹 |
| c36 | 深度网络正则化 | L12 p17–p21 | ★★ | — |
| c37 | Autoencoder 与 PCA | L12 p22–p31 | ★★ | — |
| **W7 L13–L14** |||||
| c38 | 卷积、filter、参数计数 | L13 p2–p18 | ★★★ | cnn-counter、新：卷积滑窗 |
| c39 | Pooling 与 CNN 架构 | L13 p20–p30 | ★★ | — |
| c40 | RNN、BPTT、梯度消失、LSTM | L14 p2–p15 | ★★ | 新：RNN 展开 |
| c41 | Attention 与 Transformer | L14 p16–p22 | ★★ | 新：attention 权重 |
| **W8 L15–L16** |||||
| c42 | 评估指标 | L15 p5–p14 | ★★ | 新：混淆矩阵/ROC |
| c43 | 验证集、k-fold、bootstrap、nested CV | L15 p15–p24 | ★★ | 新：k-fold 划分 |
| c44 | 比较算法：t 检验、error bars | L15 p25–p35 | ★ | — |
| c45 | Experts：majority、halving | L16 p3–p14 | ★★ | 新：experts 模拟 |
| c46 | Weighted majority、probabilistic experts | L16 p15–p27 | ★ | — |
| **W9 L17–L18** |||||
| c47 | Bandits：regret、greedy、ε-greedy | L17 p2–p15 | ★★ | 新：bandit 模拟 |
| c48 | UCB | L17 p16–p23 | ★★★ | ucb-calc |
| c49 | Contextual bandits 与 RL | L17 p24–p27 | ★ | — |
| c50 | 不确定性与 Bayesian 线性回归 | L18 | ★★★ | 新：预测带 |
| **W10 L19–L20** |||||
| c51 | 生成模型、Beta–Binomial、共轭 | L19 p2–p18 | ★★ | beta-update |
| c52 | Bayesian logistic 与近似 | L19 p19–p24 | ★ | — |
| c53 | Bayesian network、因子分解、CPT | L20 p3–p14, p26–p27 | ★★★ | cpt-counter |
| c54 | D-separation | L20 p15–p25 | ★★★ | dsep-stepper |
| c55 | MRF、clique、BN→MRF | L20 p28–p41 | ★★ | — |
| **W11 L21–L22** |||||
| c56 | 树上消元与消息传递 | L21 p3–p23 | ★★ | 新：消息传递 |
| c57 | Evidence 与 belief propagation | L21 p24–p37 | ★★ | — |
| c58 | 消元找团、junction tree | L22 p4–p26 | ★★★ | elim-stepper |
| c59 | 消元顺序 | L22 p26–p33 | ★★ | — |

（59 章；L23–L24 发布后追加。）

**交付顺序**：按学习顺序 W1 → W11，每完成一周（2–4 讲）就校验 + 双模型审查后交付。
