/* 术语表：英文 · 中文 · 大白话 · 出现在哪些页。初稿由 gemini-3.8-flash 生成，已删除课件未涉及的术语、修正说法，页码由脚本在网站内容中实际检索得到。 */
(function (root) {
  'use strict';
  const SML = root.SML;
  const TERMS = [
 {
  "en": "Activation function",
  "zh": "激活函数",
  "plain": "神经元里的非线性开关，没有它多层网络就退化成单个线性模型。",
  "pages": [
   "T13"
  ]
 },
 {
  "en": "Adagrad",
  "zh": "自适应梯度算法",
  "plain": "经常更新的参数步长自动变小，冷门参数步长保持较大。",
  "pages": [
   "L12"
  ]
 },
 {
  "en": "Adam",
  "zh": "自适应矩估计优化器",
  "plain": "结合了动量冲坡和自适应步长，是深度学习中最常用的默认优化器。",
  "pages": [
   "L12"
  ]
 },
 {
  "en": "Ancestral graph",
  "zh": "祖先图",
  "plain": "D-separation第一步：只保留查询节点、条件节点及其所有祖先。",
  "pages": [
   "T05",
   "T13",
   "L20"
  ]
 },
 {
  "en": "Attention mechanism",
  "zh": "注意力机制",
  "plain": "给输入的不同部分打分加权，让模型集中关注与当前最相关的信息。",
  "pages": [
   "T13",
   "L14"
  ]
 },
 {
  "en": "AUC",
  "zh": "ROC曲线下面积",
  "plain": "衡量分类器排序能力，随机猜为0.5，完美预测为1.0。",
  "pages": [
   "L15"
  ]
 },
 {
  "en": "Autoencoder",
  "zh": "自编码器",
  "plain": "让网络自己重建自己，通过中间狭窄的瓶颈层逼迫其学习低维压缩表示。",
  "pages": [
   "T13",
   "L12"
  ]
 },
 {
  "en": "Backpropagation",
  "zh": "反向传播",
  "plain": "利用链式法则逐层把输出端的预测误差传回各层以计算参数梯度。",
  "pages": [
   "T10",
   "L11",
   "L14"
  ]
 },
 {
  "en": "Basis expansion",
  "zh": "基函数展开 / 特征变换",
  "plain": "手动把低维输入映射到高维新特征上，让线性回归能拟合弯曲的非线性曲线。",
  "pages": [
   "T08",
   "T13",
   "L03",
   "L09"
  ]
 },
 {
  "en": "Bayes rule",
  "zh": "贝叶斯法则",
  "plain": "后验正比于似然乘先验，用来在看到新数据后科学地修正已有信念。",
  "pages": [
   "T09",
   "L01"
  ]
 },
 {
  "en": "Bayesian linear regression",
  "zh": "贝叶斯线性回归",
  "plain": "不找单一一组权重，而是保留权重的所有可能概率分布，在少数据区预测带更宽。",
  "pages": [
   "T13"
  ]
 },
 {
  "en": "Bayesian network",
  "zh": "贝叶斯网络",
  "plain": "用有向无环图表达随机变量间的联合概率分解和条件独立性关系。",
  "pages": [
   "T05",
   "T07",
   "T13",
   "L20"
  ]
 },
 {
  "en": "Beta distribution",
  "zh": "Beta分布",
  "plain": "定义在0到1之间的连续概率分布，是二项似然的共轭先验。",
  "pages": [
   "T09",
   "T13",
   "L12",
   "L19"
  ]
 },
 {
  "en": "Bias",
  "zh": "偏差",
  "plain": "模型预测均值与真实规律之间的系统性偏离，高偏差意味着欠拟合。",
  "pages": [
   "T03",
   "T07",
   "T13",
   "L02",
   "L05",
   "L13"
  ]
 },
 {
  "en": "Bias-variance tradeoff",
  "zh": "偏差-方差权衡",
  "plain": "模型太简单则偏差大，太复杂则方差大，测试误差是两者之和呈U形。",
  "pages": [
   "T13",
   "L05"
  ]
 },
 {
  "en": "Bootstrap",
  "zh": "自助抽样法",
  "plain": "从总数 $n$ 个样本中有放回抽取 $n$ 次，约有 $63.2\\%$ 的独特样本入选训练。",
  "pages": [
   "L15"
  ]
 },
 {
  "en": "BPTT",
  "zh": "随时间反向传播",
  "plain": "将循环神经网络沿时间序列展开成链条，再把误差从未来一步步传回过去。",
  "pages": [
   "L14"
  ]
 },
 {
  "en": "Canonical scaling",
  "zh": "规范缩放",
  "plain": "SVM中通过等比缩放法向量，强制规定离边界最近的数据点函数间隔为1。",
  "pages": [
   "T04",
   "L08"
  ]
 },
 {
  "en": "Causal chain",
  "zh": "因果链结构",
  "plain": "A指向B指向C的路径，当给定中间节点B时，首尾A与C条件独立。",
  "pages": [
   "T05"
  ]
 },
 {
  "en": "Chain rule",
  "zh": "链式法则",
  "plain": "复合函数求导工具，像剥洋葱一样把各层局部导数逐项相乘。",
  "pages": [
   "T10",
   "L11"
  ]
 },
 {
  "en": "Clique",
  "zh": "团 / 团块",
  "plain": "无向图中任意两个节点之间都有边直接相连的完全子图。",
  "pages": [
   "T06",
   "T13",
   "L20"
  ]
 },
 {
  "en": "Common cause",
  "zh": "共同原因 / 分叉结构",
  "plain": "A同时指向B和C，当给定共同原因A后，两个结果B与C条件独立。",
  "pages": [
   "T05"
  ]
 },
 {
  "en": "Common effect",
  "zh": "共同结果 / v-structure / 对撞节点",
  "plain": "两个原因指向同一结果；不观测结果时两原因独立，观测结果（或其后代）后变相关。",
  "pages": [
   "T05",
   "T13",
   "L01",
   "L20"
  ]
 },
 {
  "en": "Conditional independence",
  "zh": "条件独立",
  "plain": "在已知变量C的前提下，知道A并不能再为猜测B提供任何额外信息。",
  "pages": [
   "T05",
   "T13",
   "L20"
  ]
 },
 {
  "en": "Conjugate prior",
  "zh": "共轭先验",
  "plain": "与似然相乘后得到的后验分布与先验属于同一类分布家族，有漂亮闭式解。",
  "pages": [
   "T13",
   "L19"
  ]
 },
 {
  "en": "Consistency",
  "zh": "一致性",
  "plain": "当样本数量无限增加时，参数估计值能以概率收敛到真实参数真值。",
  "pages": [
   "L02"
  ]
 },
 {
  "en": "Contextual bandit",
  "zh": "带上下文的老虎机",
  "plain": "不仅要选择拉哪根摇臂，还能在每轮先观察用户特征等状态信息再做决策。",
  "pages": [
   "L17"
  ]
 },
 {
  "en": "Convolution",
  "zh": "卷积",
  "plain": "拿着一个小权重滤镜在整张图上滑动点积，扫描并提取局部的空间特征。",
  "pages": [
   "T03",
   "L13"
  ]
 },
 {
  "en": "CPT",
  "zh": "条件概率表",
  "plain": "列出离散贝叶斯网络中节点在父节点各种可能取值下的条件概率分布表格。",
  "pages": [
   "T07",
   "T13",
   "L20"
  ]
 },
 {
  "en": "Cross-entropy loss",
  "zh": "交叉熵损失",
  "plain": "度量真实标签分布与预测概率分布之间的差距，预测越自信且错得越离谱惩罚越大。",
  "pages": [
   "T13",
   "L04"
  ]
 },
 {
  "en": "Cross-validation",
  "zh": "交叉验证",
  "plain": "将数据切成 $k$ 份轮流用其中一份评估其余训练，避免单次测试集划分带来的偶然性。",
  "pages": [
   "T13"
  ]
 },
 {
  "en": "Cumulative regret",
  "zh": "累计遗憾",
  "plain": "始终选择理论最优动作所获奖励，与实际选择动作累计获得奖励之间的总差距。",
  "pages": [
   "T02",
   "L17"
  ]
 },
 {
  "en": "D-separation",
  "zh": "D-分离",
  "plain": "通过检查有向图中所有通路是否被阻塞，来判断两组变量是否条件独立的判定准则。",
  "pages": [
   "T05",
   "T13",
   "L20"
  ]
 },
 {
  "en": "DAG",
  "zh": "有向无环图",
  "plain": "边带有方向且沿着箭头永远不可能走回起点的网络拓扑结构。",
  "pages": [
   "T05",
   "T13",
   "L12",
   "L20"
  ]
 },
 {
  "en": "Data leakage",
  "zh": "数据泄漏",
  "plain": "本应在测试集评估的信息（如特征缩放统计量）提前泄露进训练过程导致虚高评分。",
  "pages": [
   "T13",
   "L15"
  ]
 },
 {
  "en": "Decision boundary",
  "zh": "决策边界",
  "plain": "模型在特征空间中划分不同预测类别的分界超平面或曲面。",
  "pages": [
   "T04",
   "T13",
   "L04"
  ]
 },
 {
  "en": "Decision stump",
  "zh": "单层决策树 / 决策桩",
  "plain": "只在单一特征上基于阈值做一次大于小于切分的极简二分类器，VC维为2。",
  "pages": [
   "T01",
   "L07"
  ]
 },
 {
  "en": "Dichotomy",
  "zh": "二分打标向量",
  "plain": "二分类器对固定一组样本点给出的一种具体的正负标签组合。",
  "pages": [
   "T01",
   "L07"
  ]
 },
 {
  "en": "Dirichlet distribution",
  "zh": "狄利克雷分布",
  "plain": "Beta分布在多维上的推广，是多项分布和分类分布的共轭先验。",
  "pages": [
   "L19"
  ]
 },
 {
  "en": "Discriminative model",
  "zh": "判别模型",
  "plain": "不关心特征本身怎么生成，直接专注于预测输入 $X$ 属于类别 $Y$ 的后验概率。",
  "pages": [
   "T13"
  ]
 },
 {
  "en": "Dropout",
  "zh": "随机失活",
  "plain": "训练时随机暂时切断一部分神经元的连接，强迫网络不依赖特定捷径从而防止过拟合。",
  "pages": [
   "T13",
   "L12"
  ]
 },
 {
  "en": "Dual problem",
  "zh": "对偶问题",
  "plain": "把带约束的原始最优化问题换一个视角求解，样本仅以点积形式出现便于使用核技巧。",
  "pages": [
   "T04",
   "T08",
   "T13",
   "L03",
   "L09",
   "L13"
  ]
 },
 {
  "en": "Dummy feature",
  "zh": "虚特征 / 偏置项输入",
  "plain": "在特征向量开头强行补一个常数1，把偏置截距 $b$ 直接合并进权重向量内积中计算。",
  "pages": [
   "L03"
  ]
 },
 {
  "en": "Early stopping",
  "zh": "早停法",
  "plain": "在训练过程中一旦发现验证集误差连续几轮不再下降反而抬头时立刻终止训练。",
  "pages": [
   "T13",
   "L12"
  ]
 },
 {
  "en": "Elimination order",
  "zh": "消元顺序",
  "plain": "变量消元时删点的先后次序；不同顺序产生的 fill-in 边和团不同，影响计算量。",
  "pages": [
   "T06"
  ]
 },
 {
  "en": "Empirical risk",
  "zh": "经验风险",
  "plain": "模型在已有的训练数据集上犯错的平均损失大小，是唯一能直接计算的误差指标。",
  "pages": [
   "T13",
   "L02",
   "L06"
  ]
 },
 {
  "en": "Epsilon-greedy",
  "zh": "ε-贪心策略",
  "plain": "绝大部分时间（$1-\\varepsilon$）选择当前已知最好的，留一小撮时间（$\\varepsilon$）随机探索新可能。",
  "pages": [
   "T02",
   "L17"
  ]
 },
 {
  "en": "ERM",
  "zh": "经验风险最小化",
  "plain": "寻找一组参数使得当前训练集上计算出的平均损失降到最低的学习准则。",
  "pages": [
   "T07",
   "T10",
   "T13",
   "L02",
   "L06",
   "L08"
  ]
 },
 {
  "en": "Feature map",
  "zh": "特征图",
  "plain": "卷积神经网络中一个特定的卷积核滑过整张图像后输出的整张局部特征响应图。",
  "pages": [
   "T04",
   "T08",
   "T13",
   "L13"
  ]
 },
 {
  "en": "Feature mapping",
  "zh": "特征映射",
  "plain": "核方法中将原始输入向量投影映射至更高维乃至无限维希尔伯特空间的数学函数。",
  "pages": [
   "T04",
   "T08",
   "T13",
   "L09",
   "L13"
  ]
 },
 {
  "en": "Fill-in edge",
  "zh": "填补边",
  "plain": "在概率图消元过程中，删掉某点前需要将其周围所有未连通的邻居两两连线新增的边。",
  "pages": [
   "T06"
  ]
 },
 {
  "en": "Filter",
  "zh": "卷积核 / 滤波器",
  "plain": "CNN卷积层中尺寸很小的一组可学习权重矩阵，用于捕捉边缘、纹理等局部视觉模式。",
  "pages": [
   "T03",
   "T09",
   "L13"
  ]
 },
 {
  "en": "Fisher information",
  "zh": "费希尔信息量",
  "plain": "度量观测数据关于未知参数所携带的信息量多少，对应对数似然曲面的弯曲陡峭程度。",
  "pages": [
   "L18"
  ]
 },
 {
  "en": "Frequentist",
  "zh": "频率学派",
  "plain": "认为客观真实参数是固定未知的常数，参数估计追求多次重复抽样下的长期统计性质。",
  "pages": [
   "L02"
  ]
 },
 {
  "en": "Functional margin",
  "zh": "函数间隔",
  "plain": "$y(\\bw'\\bx+b)$，仅表示分类正确与否和数值大小，随权重成比例放大而放大。",
  "pages": [
   "T04",
   "T13",
   "L08"
  ]
 },
 {
  "en": "Generalisation bound",
  "zh": "泛化界",
  "plain": "用数学不等式给出真实测试误差与经验训练误差之间差距的理论上界保证。",
  "pages": [
   "T10",
   "T13",
   "L07"
  ]
 },
 {
  "en": "Generative model",
  "zh": "生成模型",
  "plain": "同时为特征和标签的联合分布 $P(X,Y)$ 建模，能描述数据是如何从源头生成的。",
  "pages": [
   "T13"
  ]
 },
 {
  "en": "Geometric margin",
  "zh": "几何间隔",
  "plain": "数据点到分隔超平面的真实欧氏垂直距离，用函数间隔除以法向量的二范数。",
  "pages": [
   "T04",
   "L08"
  ]
 },
 {
  "en": "Gradient descent",
  "zh": "梯度下降",
  "plain": "像在浓雾中下山一样，每次朝着损失函数坡度最陡峭的负梯度反方向迈出一步。",
  "pages": [
   "T10",
   "T13",
   "L04"
  ]
 },
 {
  "en": "Gram matrix",
  "zh": "格拉姆核矩阵",
  "plain": "训练集中所有样本点两两之间核函数取值构成的半正定方阵。",
  "pages": [
   "T13"
  ]
 },
 {
  "en": "Growth function",
  "zh": "增长函数",
  "plain": "分类器集合在任意 $n$ 个点上最多能打出多少种互不相同的正负分类组合。",
  "pages": [
   "T01",
   "T13",
   "L07"
  ]
 },
 {
  "en": "Halving algorithm",
  "zh": "对半折损算法",
  "plain": "专家预测算法：一旦某专家给出错误预测，就将其预测权重乘以二分之一降权。",
  "pages": [
   "T10",
   "T13",
   "L16"
  ]
 },
 {
  "en": "Hard-margin SVM",
  "zh": "硬间隔支持向量机",
  "plain": "严格要求数据绝对线性可分，容不得半个样本落在间隔内或被错误划分的纯几何模型。",
  "pages": [
   "T04",
   "T13",
   "L08"
  ]
 },
 {
  "en": "Hessian",
  "zh": "黑塞矩阵",
  "plain": "多元函数所有二阶偏导数组成的对称方阵，描述局部几何曲面的弯曲程度。",
  "pages": [
   "T09",
   "T13",
   "L04",
   "L19"
  ]
 },
 {
  "en": "Hidden layer",
  "zh": "隐藏层",
  "plain": "神经网络中介于输入层和输出层之间的神经元层次，自动学习提取更抽象的特征表示。",
  "pages": [
   "T10",
   "T13",
   "L11"
  ]
 },
 {
  "en": "Hinge loss",
  "zh": "合页损失",
  "plain": "SVM使用的损失函数：正确且距离足够远时损失为0，否则随着深入间隔线性惩罚。",
  "pages": [
   "T04",
   "T13",
   "L08"
  ]
 },
 {
  "en": "Hoeffding's inequality",
  "zh": "霍夫丁不等式",
  "plain": "独立有界随机变量的样本经验均值远离真实期望的尾部概率呈指数级快速衰减。",
  "pages": [
   "T02",
   "L06"
  ]
 },
 {
  "en": "Hyperplane",
  "zh": "超平面",
  "plain": "高维空间中的平坦分界面，法向量垂直于平面，将整个空间一分为二。",
  "pages": [
   "L01",
   "L08"
  ]
 },
 {
  "en": "Infallible expert",
  "zh": "完美专家",
  "plain": "在线学习设定中那个从始至终一次错误都不犯的理想基准专家。",
  "pages": [
   "L16"
  ]
 },
 {
  "en": "Irreducible error",
  "zh": "不可约误差",
  "plain": "无论模型多么强大都无法抹除的数据环境噪声方差，是模型性能的天然底线。",
  "pages": [
   "T13",
   "L05"
  ]
 },
 {
  "en": "Junction tree",
  "zh": "连结树 / 团树",
  "plain": "消元后由极大团组成的树状结构，满足连续交集性质（running intersection），用于图模型的精确全局推断。",
  "pages": [
   "T06",
   "L20"
  ]
 },
 {
  "en": "Kernel",
  "zh": "核函数",
  "plain": "无需显式计算高维特征向量，直接计算两样本映射到高维空间后内积取值的函数。",
  "pages": [
   "T04",
   "T08",
   "T09",
   "T13",
   "L03",
   "L09"
  ]
 },
 {
  "en": "Kernel perceptron",
  "zh": "核感知机",
  "plain": "通过将权重表示为历史误分类样本的线性组合，从而支持核函数技巧的感知机模型。",
  "pages": [
   "L10"
  ]
 },
 {
  "en": "Kernel trick",
  "zh": "核技巧",
  "plain": "在所有算法公式中把普通点积替换为核函数计算，以低廉计算代价完成非线性升级。",
  "pages": [
   "T04",
   "T13",
   "L09"
  ]
 },
 {
  "en": "KKT conditions",
  "zh": "KKT条件",
  "plain": "带约束优化的最优性必要条件：可行、乘子非负、互补松弛、驻点（L09 p7）。",
  "pages": [
   "L09"
  ]
 },
 {
  "en": "Lagrangian",
  "zh": "拉格朗日函数",
  "plain": "将目标函数与各项约束条件乘上对应的乘子后合并成的一个统一无约束辅助函数。",
  "pages": [
   "L09"
  ]
 },
 {
  "en": "Laplace approximation",
  "zh": "拉普拉斯近似",
  "plain": "在后验的众数处用一个高斯近似后验，宽度由二阶导（Hessian）决定。",
  "pages": [
   "T09",
   "T13",
   "L19"
  ]
 },
 {
  "en": "Lasso",
  "zh": "L1正则化 / 套索回归",
  "plain": "在损失后加入权重绝对值之和惩罚，其几何顶点接触特性倾向于产生真正稀疏的解。",
  "pages": [
   "T13",
   "L05"
  ]
 },
 {
  "en": "Learning rate",
  "zh": "学习率 / 步长",
  "plain": "梯度下降中每次沿着梯度反方向跨出步伐的大小，太小走得慢，太大易震荡发散。",
  "pages": [
   "L12"
  ]
 },
 {
  "en": "Likelihood",
  "zh": "似然",
  "plain": "在已知特定候选参数的假设下，当前观察到的这一组实际样本数据出现的概率。",
  "pages": [
   "T07",
   "T09",
   "T13",
   "L02",
   "L03",
   "L04"
  ]
 },
 {
  "en": "Linear regression",
  "zh": "线性回归",
  "plain": "假定目标与输入特征呈线性加权关系，通过最小化残差平方和拟合最佳预测直线。",
  "pages": [
   "T13",
   "L03",
   "L04"
  ]
 },
 {
  "en": "Linear separability",
  "zh": "线性可分",
  "plain": "数据样本可以用一条直线（或一个平坦超平面）一刀切开，完全无错地划分成两类。",
  "pages": [
   "T08",
   "T13",
   "L03",
   "L08",
   "L10"
  ]
 },
 {
  "en": "Logistic regression",
  "zh": "逻辑回归",
  "plain": "在线性预测值外面套上Sigmoid函数输出属于正类的后验概率，本质是线性分类器。",
  "pages": [
   "T07",
   "T09",
   "T13",
   "L02",
   "L04",
   "L10"
  ]
 },
 {
  "en": "LSTM",
  "zh": "长短期记忆网络",
  "plain": "引入输入门、遗忘门和细胞记忆传递带，有效解决普通循环神经网络梯度消失问题。",
  "pages": [
   "T13",
   "L14"
  ]
 },
 {
  "en": "Majority algorithm",
  "zh": "多数表决算法",
  "plain": "有完美专家时只听取至今从未犯错专家的多数意见，预测错误次数不超过 $\\log_2 n$。",
  "pages": [
   "T13",
   "L16"
  ]
 },
 {
  "en": "MAP",
  "zh": "最大后验估计",
  "plain": "寻找使后验概率密度最大的单个参数值，等于在极大似然基础上加上先验正则项。",
  "pages": [
   "T01",
   "T04",
   "T07",
   "T08",
   "T09",
   "T10"
  ]
 },
 {
  "en": "Margin",
  "zh": "间隔",
  "plain": "本课的 margin = 决策边界到最近数据点的距离（单侧）；canonical scaling 之后等于 1/‖w‖。两条虚线之间的总宽度是它的 2 倍（2/‖w‖）。",
  "pages": [
   "T04",
   "T05",
   "T07",
   "T09",
   "T13",
   "L01"
  ]
 },
 {
  "en": "Marginal likelihood",
  "zh": "边缘似然 / 证据",
  "plain": "将所有可能的未知参数加权积分平均后得到的数据生成总概率，用来比较不同模型好坏。",
  "pages": [
   "T09",
   "T13",
   "L02"
  ]
 },
 {
  "en": "Marginalisation",
  "zh": "边缘化",
  "plain": "对联合概率分布中不关心的多余干扰变量进行求和或积分消除，只留下目标变量。",
  "pages": [
   "L01"
  ]
 },
 {
  "en": "Max pooling",
  "zh": "最大池化",
  "plain": "在局部小方框内只保留最大响应数值向下采样，减少特征尺寸并赋予平移不变性。",
  "pages": [
   "T03",
   "L13"
  ]
 },
 {
  "en": "Mercer's condition",
  "zh": "默瑟条件",
  "plain": "判断核函数是否合法：对任意有限个点，核矩阵都必须是半正定的（L09 p35）。",
  "pages": [
   "T08",
   "T13",
   "L09"
  ]
 },
 {
  "en": "Mini-batch",
  "zh": "小批量梯度下降",
  "plain": "折中方案：每次既不看全部数据也不看单一样本，而是抽取几十到几百个样本求导更新。",
  "pages": [
   "L04",
   "L12"
  ]
 },
 {
  "en": "Mistake bound",
  "zh": "错误界",
  "plain": "在线学习中对算法在学习全过程中可能犯下的总错误上限做出的严格数学保证。",
  "pages": [
   "T10",
   "L16"
  ]
 },
 {
  "en": "MLE",
  "zh": "极大似然估计",
  "plain": "频率学派核心方法：寻找让当前已观察到的数据出现概率达到最大化的那一组参数值。",
  "pages": [
   "T07",
   "T09",
   "T13",
   "L02",
   "L03",
   "L04"
  ]
 },
 {
  "en": "Momentum",
  "zh": "动量优化",
  "plain": "像推铁球滚下山坡一样积攒历史梯度速度，帮助梯度下降冲出平坦区和马鞍点。",
  "pages": [
   "T13",
   "L12"
  ]
 },
 {
  "en": "Moralize",
  "zh": "道德化 / 道德图",
  "plain": "把有向图转成无向图的第一步：给每一个拥有共同孩子的未婚父节点之间补上一条连线。",
  "pages": [
   "T05",
   "L20"
  ]
 },
 {
  "en": "MRF",
  "zh": "马尔可夫随机场",
  "plain": "用无向图结构定义变量联合分布，利用极大团上的势函数乘积并除以配分函数归一化。",
  "pages": [
   "T06",
   "T13",
   "L20"
  ]
 },
 {
  "en": "Multi-armed bandit",
  "zh": "多臂老虎机",
  "plain": "多摇臂赌博机模型：每轮只能拉下一个臂并收获对应奖励，在探索新臂与利用已知高分臂间抉择。",
  "pages": [
   "T02",
   "T13",
   "L17"
  ]
 },
 {
  "en": "Naive Bayes",
  "zh": "朴素贝叶斯",
  "plain": "做了一个极强假设：给定所属类别的前提下，所有输入特征之间彼此条件独立。",
  "pages": [
   "T13",
   "L19"
  ]
 },
 {
  "en": "Newton-Raphson",
  "zh": "牛顿-拉夫逊优化法",
  "plain": "利用一阶导数和二阶黑塞矩阵曲率信息做局部二次抛物线拟合，一步迈向极小值点。",
  "pages": [
   "L04"
  ]
 },
 {
  "en": "Normal equations",
  "zh": "正规方程",
  "plain": "线性回归中直接令平方误差导数为零求出的闭式解析解公式 $(\\bX'\\bX)^{-1}\\bX'\\by$。",
  "pages": [
   "L03"
  ]
 },
 {
  "en": "Optimism in the face of uncertainty",
  "zh": "面对不确定性时的乐观原则",
  "plain": "对不了解、探索少的老虎机臂给予更乐观的奖励上限加成，从而自动引导系统进行主动探索。",
  "pages": [
   "T02",
   "L17"
  ]
 },
 {
  "en": "Overfitting",
  "zh": "过拟合",
  "plain": "模型学得太复杂，把训练数据里的偶发噪声都当成了通用真理，在新测试集上一塌糊涂。",
  "pages": [
   "T13",
   "L05"
  ]
 },
 {
  "en": "PAC learning",
  "zh": "概率近似正确学习",
  "plain": "计算学习理论基础：以高概率（$1-\\delta$）保证模型泛化误差控制在极小容忍度（$\\varepsilon$）内。",
  "pages": [
   "T01",
   "T04",
   "T08",
   "T10",
   "T13",
   "L07"
  ]
 },
 {
  "en": "Padding",
  "zh": "填充",
  "plain": "在输入特征图外围边缘补上一圈零像素，防止卷积操作后图像尺寸层层缩减掉边缘细节。",
  "pages": [
   "T03",
   "L13"
  ]
 },
 {
  "en": "Partition function",
  "zh": "配分函数",
  "plain": "MRF 的归一化常数 $Z$：把所有取值组合的势函数乘积加起来，保证概率和为 1。",
  "pages": [
   "L20"
  ]
 },
 {
  "en": "Perceptron",
  "zh": "感知机",
  "plain": "最经典的单神经元线性二分类模型，根据点积正负输出预测，分错时把样本加到权重上。",
  "pages": [
   "T10",
   "T13",
   "L10",
   "L11"
  ]
 },
 {
  "en": "Perceptron convergence theorem",
  "zh": "感知机收敛定理",
  "plain": "只要数据集线性可分且间隔为 $\\gamma$，感知机算法在更新有限步（$\\le R^2/\\gamma^2$）后保证停机收敛。",
  "pages": [
   "T13",
   "L10"
  ]
 },
 {
  "en": "Perceptron loss",
  "zh": "感知机损失",
  "plain": "只惩罚分错的点，损失大小等于预测打分偏离零点边界的绝对值大小 $\\max(0,-ys)$。",
  "pages": [
   "T10",
   "L10"
  ]
 },
 {
  "en": "Polynomial kernel",
  "zh": "多项式核",
  "plain": "核函数形如 $(\\bx'\\bz+c)^d$，等价于映射到包含所有特征交叉项的多项式特征空间。",
  "pages": [
   "T08",
   "T13",
   "L09"
  ]
 },
 {
  "en": "Positive semi-definite",
  "zh": "半正定",
  "plain": "对任意非零向量 $\\bv$ 都有 $\\bv'A\\bv\\ge0$ 的对称矩阵，其全部特征值均非负。",
  "pages": [
   "T08",
   "T13",
   "L01",
   "L09"
  ]
 },
 {
  "en": "Posterior",
  "zh": "后验概率",
  "plain": "在结合了先验知识与最新观测到的数据证据后，对未知参数重新更新得到的概率分布。",
  "pages": [
   "T07",
   "T09",
   "T13",
   "L02",
   "L18",
   "L19"
  ]
 },
 {
  "en": "Potential function",
  "zh": "势函数 / 因子",
  "plain": "同名两义。① W10–W11 图模型：无向马尔可夫网中极大团上的非负打分函数，反映团内变量取值之间的兼容程度。② W8 experts 的证明技巧：找一个随学习者犯错而大幅下降、但有下界的量（majority 用存活专家数，halving / weighted majority 用总权重 W）。",
  "pages": ["T06", "L20"]
 },
 {
  "en": "Precision",
  "zh": "查准率 / 精确率",
  "plain": "所有被模型判为阳性的样本中，真正为正例的样本所占的比例 $TP/(TP+FP)$。",
  "pages": [
   "L15"
  ]
 },
 {
  "en": "Predictive distribution",
  "zh": "预测分布",
  "plain": "贝叶斯推断中对所有可能参数加权平均后，对未来全新未见样本给出的完整概率预测带。",
  "pages": [
   "T13",
   "L18"
  ]
 },
 {
  "en": "Primal problem",
  "zh": "原始问题",
  "plain": "直接在特征空间优化目标权重与偏置的原始受约束规划形式，与对偶问题相对。",
  "pages": [
   "T04",
   "T08",
   "T13",
   "L09"
  ]
 },
 {
  "en": "Prior",
  "zh": "先验概率",
  "plain": "在看到当前这批实际训练数据之前，基于先验领域知识或经验对参数做出的初始概率假设。",
  "pages": [
   "T07",
   "T09",
   "T13",
   "L02",
   "L05",
   "L18"
  ]
 },
 {
  "en": "RBF kernel",
  "zh": "径向基高斯核",
  "plain": "以样本欧氏距离为输入的指数衰减核函数，数学上对应将特征映射到无限维希尔伯特空间。",
  "pages": [
   "T08"
  ]
 },
 {
  "en": "Recall",
  "zh": "查全率 / 召回率",
  "plain": "所有真正为正例的样本中，被模型成功抓取检测出来的比例 $TP/(TP+FN)$。",
  "pages": [
   "L15"
  ]
 },
 {
  "en": "Receptive field",
  "zh": "感受野",
  "plain": "卷积网络深层某个特征单元在最原始输入图像上所能覆盖感应到的像素窗口区域大小。",
  "pages": [
   "L13"
  ]
 },
 {
  "en": "Regret",
  "zh": "遗憾 / 悔意值",
  "plain": "在线或强化学习中，算法采取的策略与事后已知最优决策在累计收益上的损失差距。",
  "pages": [
   "T02",
   "L17"
  ]
 },
 {
  "en": "Regularisation",
  "zh": "正则化",
  "plain": "在优化目标中加入对模型权重复杂度的惩罚项（如L1、L2），通过稍微增加偏差大幅削减方差。",
  "pages": [
   "T09",
   "T13",
   "L03",
   "L05",
   "L08",
   "L09"
  ]
 },
 {
  "en": "ReLU",
  "zh": "修正线性单元",
  "plain": "正数原样通过，负数直接归零 $\\max(0,x)$，有效缓解深层反向传播梯度消失问题。",
  "pages": [
   "T10",
   "L11"
  ]
 },
 {
  "en": "Representer theorem",
  "zh": "表示定理",
  "plain": "正则化经验风险最小化问题的最优解函数，必然可以写成所有训练样本处核函数的线性组合。",
  "pages": [
   "L09"
  ]
 },
 {
  "en": "Residual connection",
  "zh": "残差连接",
  "plain": "像高速公路一样让输入跨层直接与卷积输出相加，使梯度无阻碍反向回传，能训练极深网络。",
  "pages": [
   "L13"
  ]
 },
 {
  "en": "Ridge",
  "zh": "L2正则化 / 岭回归",
  "plain": "在损失中加入权重平方和惩罚，使矩阵特征值整体右移保证可逆，平滑收缩权重数值。",
  "pages": [
   "T09",
   "T13",
   "L05",
   "L08",
   "L09",
   "L18"
  ]
 },
 {
  "en": "Risk",
  "zh": "真实风险",
  "plain": "模型在整体未知数据分布上的期望预测损失，是机器学习最根本想要压到最低的量。",
  "pages": [
   "L06"
  ]
 },
 {
  "en": "ROC curve",
  "zh": "接收者操作特征曲线",
  "plain": "连续变动分类阈值时画出的曲线。课件 L15 p11 横轴是 specificity（特异度）、纵轴是 sensitivity（敏感度），曲线从左上落到右下；常见教科书横轴用 1−specificity（假阳性率），两者镜像，AUC 相同。",
  "pages": [
   "T13",
   "L14",
   "L15"
  ]
 },
 {
  "en": "Sauer's lemma",
  "zh": "绍尔引理",
  "plain": "有限VC维时增长函数从某一界限起被多项式阶数压制，保证了无穷分类器集合依然可学。",
  "pages": [
   "L07"
  ]
 },
 {
  "en": "Self-attention",
  "zh": "自注意力机制",
  "plain": "序列内部每个单词同时充当询问去和同一个句子里的其他所有单词计算关联度。",
  "pages": [
   "T13",
   "L14"
  ]
 },
 {
  "en": "Shattered",
  "zh": "被打散 / 可任意标注",
  "plain": "指分类器族在该组样本点上能打出所有 $2^n$ 种可能的正负分类标签组合。",
  "pages": [
   "T01",
   "L07"
  ]
 },
 {
  "en": "Sigmoid",
  "zh": "S型激活函数",
  "plain": "将任意实数平滑非线性压缩映射到零到一开区间内，常用于二分类输出概率。",
  "pages": [
   "T09",
   "T13",
   "L04",
   "L14"
  ]
 },
 {
  "en": "Slack variable",
  "zh": "松弛变量",
  "plain": "软间隔SVM中引入的允许个别脏数据侵入安全间隔甚至分类错误的容忍惩罚距离。",
  "pages": [
   "L08"
  ]
 },
 {
  "en": "Soft-margin SVM",
  "zh": "软间隔支持向量机",
  "plain": "引入合页损失与松弛变量，允许数据存在噪声重叠，兼顾间隔宽度与误分类惩罚。",
  "pages": [
   "T13"
  ]
 },
 {
  "en": "Softmax",
  "zh": "归一化指数函数",
  "plain": "将多维打分通过指数化和求和归一，转化为加和恒等于一的多分类预测概率分布。",
  "pages": [
   "T13",
   "L14"
  ]
 },
 {
  "en": "Stride",
  "zh": "步长",
  "plain": "卷积核或池化窗口在输入特征图上每次滑动的像素距离。",
  "pages": [
   "T03",
   "L13"
  ]
 },
 {
  "en": "Support vector",
  "zh": "支持向量",
  "plain": "落在 margin 线上的训练点（soft margin 时也包括 margin 内的点），只有它们决定 SVM 的解。",
  "pages": [
   "T04",
   "T13",
   "L08"
  ]
 },
 {
  "en": "SVM",
  "zh": "支持向量机",
  "plain": "通过寻找离两类最近点距离最大化的超平面进行二分类的经典高维几何分类算法。",
  "pages": [
   "T04",
   "T08",
   "T13",
   "L08",
   "L09",
   "L10"
  ]
 },
 {
  "en": "Transformer",
  "zh": "变换器架构",
  "plain": "完全抛弃循环网络架构，基于自注意力机制与残差归一化构建的高并行深度序列模型。",
  "pages": [
   "T13",
   "L14"
  ]
 },
 {
  "en": "Translation invariance",
  "zh": "平移不变性",
  "plain": "目标图像在画框内移动了位置，模型输出的分类判断结果依然保持不变的性质。",
  "pages": [
   "T03",
   "L13"
  ]
 },
 {
  "en": "UCB",
  "zh": "置信区间上界算法",
  "plain": "按“经验均值+探索奖励”给摇臂打分，没拉过或拉得少的摇臂奖励更高，自动探索。",
  "pages": [
   "T02",
   "L17"
  ]
 },
 {
  "en": "Underfitting",
  "zh": "欠拟合",
  "plain": "模型表达能力太弱，连训练集内部显而易见的基础规律都捕捉不了，训练与测试双高误差。",
  "pages": [
   "L05",
   "L06"
  ]
 },
 {
  "en": "Union bound",
  "zh": "联合界 / 布尔不等式",
  "plain": "多个事件并集的发生概率绝不超过每个事件各自发生概率的简单算术总和。",
  "pages": [
   "L06"
  ]
 },
 {
  "en": "Vanishing gradient",
  "zh": "梯度消失",
  "plain": "反向传播时梯度被连乘很多次而趋近 0，前面的层几乎学不动（RNN 长序列尤其严重）。",
  "pages": [
   "T13",
   "L14"
  ]
 },
 {
  "en": "Variable elimination",
  "zh": "变量消元法",
  "plain": "概率图中将非查询变量通过分配律乘积再求和消除的经典动态规划精确推断算法。",
  "pages": [
   "T06"
  ]
 },
 {
  "en": "Variance",
  "zh": "方差",
  "plain": "两种用法：① 随机变量的方差 Var(X)=E[(X−E[X])²]，衡量取值的分散程度（W1）；② bias–variance 里的 variance：换一份训练数据重学时预测波动有多大，高方差 = 对样本变化过敏（W3）。",
  "pages": [
   "T03",
   "T09",
   "T13",
   "L01",
   "L02",
   "L05"
  ]
 },
 {
  "en": "VC dimension",
  "zh": "VC维",
  "plain": "分类器族能够完全打散（即实现全部正负标签标注组合）的最大样本点集的大小。",
  "pages": [
   "T01",
   "T13",
   "L07"
  ]
 },
 {
  "en": "Weight decay",
  "zh": "权重衰减",
  "plain": "训练时对权重加 L2 惩罚，梯度里多一项 $2\\lambda w$，让权重变小（L12 p19）。",
  "pages": [
   "T13",
   "L12"
  ]
 },
 {
  "en": "Weighted majority",
  "zh": "加权多数表决算法",
  "plain": "专家犯错时不淘汰而是乘上折扣因子降权，按加权多数预测，适应无完美专家的场景。",
  "pages": [
   "T12",
   "T13",
   "L16"
  ]
 }
];
  SML.terms.define(TERMS);
  /* every distinct term (glossary + data/terms.js), sorted */
  const ALL = () => { const seen = new Set(); return Object.values(SML.terms.all()).filter((t) => !seen.has(t) && seen.add(t)).sort((a, b) => a.en.localeCompare(b.en)); };

  SML.render.blocks.glossaryTable = function () {
    const { el } = SML.render;
    const box = el('div');
    const input = el('input', 'gloss-search'); input.type = 'search'; input.placeholder = '搜索英文或中文，例如 margin、似然、shatter';
    const list = el('div', 'table-wrap');
    const draw = () => {
      const q = input.value.trim().toLowerCase();
      const rows = ALL().filter((t) => !q || (t.en + ' ' + t.zh + ' ' + t.plain).toLowerCase().indexOf(q) >= 0);
      list.innerHTML = '<table><thead><tr><th>English</th><th>中文</th><th>大白话</th><th>页面</th></tr></thead><tbody>' +
        rows.map((t) => '<tr><td class="en"><b>' + SML.md.esc(t.en) + '</b></td><td>' + SML.md.esc(t.zh) + '</td><td>' + SML.md.inline(t.plain) + '</td><td>' +
          (t.ch ? '<a href="#/' + t.ch + '">第 ' + SML.app.metaOf(t.ch).tag + ' 章</a> ' : '') + (t.pages || []).map((p) => '<a href="#/' + p + '">' + p + '</a>').join(' ') + '</td></tr>').join('') + '</tbody></table>' +
        (rows.length ? '' : '<p class="muted">没有找到。试试换个说法，或者看 <a href="#/primer">零基础入门</a>。</p>');
    };
    input.addEventListener('input', draw);
    box.append(input, list); draw();
    return box;
  };

  SML.content.add({
    id: 'glossary', title: '术语表',
    lead: '全站出现的 ' + ALL().length + ' 个英文术语，每个配一句大白话和出现的页面。考试用英文作答，**英文那一列要能认、能写**。符号（撇号、求和号等）见 [零基础入门](#/primer)。',
    blocks: [{ t: 'glossaryTable' }],
  });
})(window);
