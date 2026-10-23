/* W8 · L15 交叉验证与评估 + L16 专家建议学习 — chapters c42–c46 and review r08. */
(function (root) {
  'use strict';
  const SML = root.SML;
  const T = String.raw;
  const add = (c) => SML.content.add(SML.chapter(c));

  /* =====================================================================
   * c42 · 评估指标（L15 p3–p14）
   * ===================================================================== */
  add({
    id: 'c42', week: 'W8', lec: 'L15', pages: 'L15 p3–p14', star: 1,
    keyEn: [
      T`From the confusion matrix: precision $=TP/(TP+FP)$, recall (sensitivity) $=TP/(TP+FN)$, specificity $=TN/(TN+FP)$, $F_1=\frac{2PR}{P+R}$; for regression use MSE, RMSE or MAE.`,
      T`Because the class distributions overlap, moving the threshold trades precision against recall (sensitivity against specificity), so report them in pairs; accuracy is misleading for imbalanced classes.`,
      T`ROC curve: one (specificity, sensitivity) point per threshold; AUC（曲线下面积）summarises it: 0.5 = random guessing, 1 = perfect classifier.`,
      T`50% error is the chance-level baseline for balanced binary classes, not a lower bound; when errors have different costs use a cost-sensitive loss $\frac1n\sum_iCost(g(x_i),y_i)$.`,
    ],
    keyZh: [
      T`从混淆矩阵（confusion matrix）算，关键看分母：precision（精确率）除以判成正的，recall（召回率）除以真实为正的全部（$TP+FN$），specificity（特异度）除以真实为负的全部（$TN+FP$）；$F_1$ 是 P、R 的调和平均。回归改用 MSE、RMSE、MAE。`,
      T`两类分布有重叠，任何阈值（threshold）都会在重叠区犯错，移动阈值只是在两种错误之间换，所以要成对报告。类别不平衡时 accuracy（准确率）会骗人：全猜多数类也很高。`,
      T`ROC 曲线：每个阈值得到一对 (specificity, sensitivity)，画成一个点，连成曲线；AUC（曲线下面积）用一个数概括它：0.5 等于瞎猜，1 是完美分类器。`,
      T`两类各占一半时，瞎猜的错误率就是 50%：这是要超过的基线（chance level），不是下限，学反了的模型可以更差。漏诊、误诊代价不同时，用按代价表加权的 cost-sensitive loss。`,
    ],
    title: '评估指标', en: 'Performance metrics: confusion matrix, precision/recall, ROC/AUC, costs',
    summary: '模型好不好，要看在**没见过的数据**上的表现，而且要选对指标。回归用 MSE / RMSE / MAE；分类用混淆矩阵（TP、FP、FN、TN）派生出的 accuracy、precision、recall（= sensitivity）、specificity、F1。precision 和 recall 此消彼长；扫阈值得到 **ROC 曲线**，用 **AUC** 概括。不同错误代价不同时用 cost-sensitive loss。',
    prereq: ['c07', 'c20'],
    symbols: [
      [T`TP / FP / FN / TN`, T`true positive（真阳性：真是正、判成正）/ false positive（假阳性：真是负、判成正，误报）/ false negative（假阴性：真是正、判成负，漏报）/ true negative（真阴性）`],
      [T`$x_i,\ y_i,\ n$`, T`第 $i$ 个样本的输入、真实标签；样本总数`],
      [T`$P,\ R$`, T`precision（精确率）、recall（召回率）的缩写`],
      [T`$g(x_i)$`, T`模型对第 $i$ 个样本的预测`],
      [T`$\beta$`, T`（本章）分类阈值 offset`],
      [T`$1(\cdot)$`, T`示性函数：条件成立为 1`],
      [T`$Cost(g(x_i),y_i)$`, T`代价表：预测 $g(x_i)$、真实 $y_i$ 时的代价`],
    ],
    goals: [
      '写出 MSE、RMSE、MAE',
      '从混淆矩阵算 accuracy、error、precision、recall/sensitivity、specificity、F1（L15 p7）',
      '解释 precision–recall、sensitivity–specificity 的此消彼长，以及 ROC / AUC（随机 0.5，完美 1）',
      '知道 chance-level error 50% 和 cost-sensitive loss 的意义',
    ],
    types: ['T13'],
    what: [
      { t: 'h3', text: '① 评估在评什么（L15 p4）' },
      T`**目标**（L15 p4）：在没见过的数据上表现好（"完美模型"往往不存在：两个类的分布本身就可能重叠）。两个用途：比较算法、选超参数（如 soft-margin SVM 的 $C$）。`,
      { t: 'h3', text: '② 回归：误差有多大（L15 p6）' },
      T`预测如果是一个**数**（回归），比较的就是"差了多少"：平方会放大大误差；开方回到原来的单位；绝对值对个别大误差不那么敏感。`,
      T`**回归指标**（L15 p6）：$MSE=\frac1n\sum(g(x_i)-y_i)^2$，$RMSE=\sqrt{MSE}$，MAE（mean absolute error，平均绝对误差）$=\frac1n\sum|g(x_i)-y_i|$。`,
      { t: 'h3', text: '③ 分类：先数四种情况——混淆矩阵（L15 p7）' },
      T`**Confusion matrix（混淆矩阵）**（L15 p7）：行 = 预测，列 = 真实。`,
      { t: 'table', cls: 'compact', head: ['', '真实 +1', '真实 −1'], rows: [['预测 +1', '**TP**', '**FP**（误报）'], ['预测 −1', '**FN**（漏报）', '**TN**']] },
      T`为什么不只看"总共对了多少"？因为它会骗人：100 人里 95 个健康，模型**全部**猜健康，accuracy 仍有 95%，却一个病人也没找出来。所以要分开数。固定一张表算一遍：TP $=40$、FP $=10$、FN $=20$、TN $=30$（共 100）。accuracy $=70/100=0.7$；判成正的 50 人里 40 人真是正的，precision $=0.8$；真是正的 60 人里找出 40 人，recall $\approx0.67$；真是负的 40 人里判对 30 人，specificity $=0.75$。每个分式都是"分子是某种**对的**，分母是**你在问的那一堆**"。`,
      T`每个指标先用一句人话，再看公式：**accuracy** = 总共判对了多少；**precision** = 判成正的里面真有多少是正的；**recall / sensitivity** = 真正的正例里找出了多少；**specificity** = 真正的负例里认对了多少；**$F_1$** = precision 和 recall 的折中。`,
      { t: 'math', tex: T`\text{Accuracy}=\frac{TP+TN}{\text{all}},\quad\text{Error}=\frac{FP+FN}{\text{all}}=1-\text{Accuracy},\quad\text{Precision}=\frac{TP}{TP+FP},\quad\text{Recall}=\text{Sensitivity}=\frac{TP}{TP+FN},\quad\text{Specificity}=\frac{TN}{TN+FP},\quad F_1=\frac{2PR}{P+R}` },
      T`中文：accuracy（准确率）、error（错误率）、precision（精确率）、recall / sensitivity（召回率 / 敏感度）、specificity（特异度）、$F_1$ 是 $P$ = precision 与 $R$ = recall 的调和平均。`,
      { t: 'h3', text: '④ 为什么要成对看：此消彼长（L15 p8–p10）' },
      T`**Precision = 抓到的里面有多少是真的；Recall = 真的里面抓到了多少**（L15 p9，信息检索的图）。把阈值放宽，抓得更多 → recall 升高，但混进更多假的 → precision 下降（L15 p8）。所以要**成对**报告：(precision, recall) 或 (sensitivity, specificity)。`,
      T`**为什么会此消彼长？**（L15 p10）两类的分布（例如两个 Gaussian）有重叠，任何阈值都会在重叠区犯错；移动阈值只是在两种错误之间换。`,
      { t: 'slide', src: 'L15/p10', caption: '两类的分布重叠；移动阈值 $\\beta$ 只是在两种错误之间换。' },
      { t: 'h3', text: '⑤ 把所有阈值画成一条曲线：ROC 和 AUC（L15 p11）' },
      T`**ROC（receiver operating characteristic）与 AUC（area under the curve）**（L15 p10–p11）：调整阈值 $\beta$（或超参数），每个阈值算出一对 (sensitivity, specificity)，画成一个点，所有点连成曲线；曲线下面积就是 AUC：随机分类器 0.5，完美分类器 1。`,
      T`**轴怎么画**：L15 p11 的图横轴是 specificity、纵轴是 sensitivity，曲线从左上落到右下。教科书和网上更常见的画法横轴是 $1-\text{specificity}$（false positive rate，假阳性率）、纵轴 sensitivity，曲线从左下升到右上。两者只是左右镜像，**AUC 完全一样**。考试画图按课件画即可，记得标轴名。`,
      { t: 'slide', src: 'L15/p11', caption: '课件的 ROC：横轴 specificity，纵轴 sensitivity。' },
      { t: 'h3', text: '⑥ 最低要求：比瞎猜好（L15 p12）' },
      T`**Chance level（随机水平）**（L15 p12）：两类各 50% 时，"总猜 +1"、"总猜 −1" 的错误率都是 50%，"抛硬币"平均也是 50%。所以 50% 是"瞎猜"的**基线**：模型至少要比它好。它不是下限——测试错误率可以超过 50%（比如模型学反了）。`,
      { t: 'h3', text: '⑦ 错误的代价不一样（L15 p13）' },
      { t: 'math', tex: T`\text{0-1 loss: }\frac1n\sum_i1\big(g(x_i)\ne y_i\big)\qquad\text{cost-sensitive: }\frac1n\sum_iCost\big(g(x_i),y_i\big)` },
      T`医疗例子的代价表（行 = 预测，列 = 真实，顺序 +1（患病）、−1（健康））：$\begin{bmatrix}0&1\\10&0\end{bmatrix}$——漏诊代价 10，误诊代价 1。`,
    ],
    why: [
      T`选错指标会得出错误结论：比如 95% 的样本是负类，"全部预测负类"的 accuracy 也有 95%，但一个病人也没查出来。考试常考：给混淆矩阵算指标、解释 precision vs recall、什么时候用 cost-sensitive loss。`,
    ],
    intuition: [
      { t: 'think', q: '筛查癌症：漏诊（FN）和误诊（FP）哪个更糟？应该更看重 precision 还是 recall？', a: 'FN 更糟（错过早期治疗）。应更看重 recall（sensitivity），宁可多一些误报。L15 p13 的代价表就把"把病人判成健康"设为 10，"把健康判成病人"设为 1。' },
      { t: 'story', title: 'ROC 的名字', md: '"Receiver operating characteristic" 来自第二次世界大战时的雷达信号检测：操作员要从噪声里判断屏幕上的光点是不是敌机，调高灵敏度会多抓到敌机，也会多出假警报——正是 sensitivity 和 specificity 的权衡（L15 p10 说这个思想来自信号检测理论）。' },
    ],
    math: [
      T`**各指标的分母**（最容易算错的地方）：precision 除以"判成正的"$TP+FP$；recall 除以"真的正例"$TP+FN$；specificity 除以"真的负例"$TN+FP$。先在混淆矩阵里圈出分母那一行或那一列，再算。`,
    ],
    fx: [
      {
        title: 'F1-score', tex: T`F_1=\frac{2\cdot\htmlClass{fx-p1}{\text{Precision}}\cdot\htmlClass{fx-p2}{\text{Recall}}}{\text{Precision}+\text{Recall}}`,
        parts: [
          { label: 'Precision', note: '$TP/(TP+FP)$：预测为正的里面真正为正的比例。' },
          { label: 'Recall', note: '$TP/(TP+FN)$：真正为正的里面被找出来的比例。F1 是两者的调和平均，任何一个很低 F1 就低。' },
        ],
      },
    ],
    example: [
      { t: 'fade', title: '分步练习：从混淆矩阵算指标', plan: ['读出 TP、FP、FN、TN', 'Precision $=TP/(TP+FP)$，Recall $=TP/(TP+FN)$', 'F1、accuracy、specificity'], items: [
        { md: T`TP = 40，FP = 10，FN = 20，TN = 30。`, steps: [
          { md: '共 100 个' }, { md: T`P $=TP/(TP+FP)=40/(40+10)=0.8$，R $=TP/(TP+FN)=40/(40+20)\approx0.667$` }, { md: T`F1 $=2(0.8)(0.667)/(0.8+0.667)\approx0.727$，accuracy $(40+30)/100=0.7$，specificity $TN/(TN+FP)=30/40=0.75$` },
        ] },
        { md: T`不平衡数据：TP = 8，FP = 2，FN = 8，TN = 82。`, steps: [
          { ask: 'Recall = ?', answer: 0.5, show: '$TP/(TP+FN)=8/(8+8)$', sg: 2 },
          { ask: 'Accuracy = ?', answer: 0.9, show: T`$90/100$——看起来很高，但一半的正例漏掉了`, sg: 3 },
          { ask: 'F1 = ?', answer: 0.6154, tol: 0.002, show: T`先算 precision：判成正的有 $TP+FP=8+2=10$ 个，其中 8 个真是正的，$P=0.8$；recall $R=0.5$。F1 $=\frac{2PR}{P+R}=\frac{2\times0.8\times0.5}{0.8+0.5}=\frac{0.8}{1.3}\approx0.615$`, sg: 3 },
        ] },
        { md: T`TP = 30，FP = 30，FN = 0，TN = 40。`, steps: [
          { ask: 'Precision = ?', answer: 0.5, show: '$30/60$', sg: 2 },
          { ask: 'Recall = ?', answer: 1, show: '$30/30$', sg: 2 },
          { ask: 'Specificity = ?', answer: 0.5714, tol: 0.002, show: '$TN/(TN+FP)=40/(40+30)$', sg: 3 },
        ] },
      ] },
    ],
    viz: [
      { id: 'confusion-metrics', how: '12 个打过分的样本（分数和真实标签）。拖动阈值：分数 ≥ 阈值判为正。依次显示混淆矩阵和各项指标、ROC 曲线（红点是当前阈值的位置）和样本表，读数里给出 AUC。注意这里 ROC 的横轴是 $1-$specificity（FPR，曲线向上升）；课件 L15 p11 横轴是 specificity（镜像，AUC 相同）。',
        try: '① 阈值从高往低拖：recall 上升，precision 大体下降。② 找 F1 最大的阈值。③ 观察 ROC 上的点怎么随阈值移动。' },
    ],
    compare: [
      { t: 'table', head: ['指标', '公式', '回答的问题'], rows: [
        ['Precision', '$TP/(TP+FP)$', '说是正的，有多少真是正的？'],
        ['Recall / Sensitivity', '$TP/(TP+FN)$', '真是正的，找出了多少？'],
        ['Specificity', '$TN/(TN+FP)$', '真是负的，认出了多少？'],
        ['Accuracy', '$(TP+TN)/n$', '总体对了多少？（不平衡时会误导）'],
      ] },
      { t: 'exam', md: T`**Precision vs recall:** Precision $=TP/(TP+FP)$ is the fraction of predicted positives that are truly positive; recall (sensitivity) $=TP/(TP+FN)$ is the fraction of actual positives that are detected. Moving the decision threshold trades one against the other, so they should be reported together (or summarised by $F_1$); for imbalanced classes accuracy can be misleading, and when errors have different costs a cost-sensitive loss should be used.` },
    ],
    pitfalls: [
      ['Recall 和 specificity 是一回事', 'Recall 看正类（$TP/(TP+FN)$），specificity 看负类（$TN/(TN+FP)$）。'],
      ['Accuracy 高 = 模型好', '类别不平衡时不一定。'],
      ['AUC = 0.5 是很差但有用的模型', '0.5 等于随机猜。'],
      ['测试错误率不可能超过 50%', '可以超过（L15 p12）。50% 是"瞎猜"的基线，不是下限；比它还差说明模型比瞎猜还糟（例如学反了）。'],
      ['ROC 横轴一定是 false positive rate', '课件 L15 p11 横轴是 specificity；常见画法是 $1-$specificity。两者镜像，AUC 相同。'],
    ],
    quiz: [
      { type: 'num', q: 'TP=20，FP=5，FN=5，TN=70。Precision？', answer: 0.8, explain: T`precision（精确率）问的是：**判成正的样本里，有多少真的是正的**。判成正的 = TP + FP $=20+5=25$（TP 判正且真正，FP 判正但其实是负）；其中真正的是 TP $=20$。precision $=20/25=0.8$。陷阱：分母换成 TP + FN 就成了 recall（召回率），本题恰好也是 $20/25$，但问的是另一件事。`, qzh: 'TP=20，FP=5，FN=5，TN=70。精确率（precision）是多少？' },
      { type: 'num', q: '接上，Specificity？', answer: 0.9333, tol: 0.002, explain: T`specificity（特异度）问的是：真正的负例里，有多少被判对成负。真正的负例 = TN + FP $=70+5=75$（FP 是本来为负、却被判成正的 5 个）；其中判对的是 TN $=70$。specificity $=70/75\approx0.933$。**分母是"真实为负"的全部样本**：FN 本来是正例，不该进分母；也别用全体 100 当分母。` },
      { type: 'num', q: '预测 $(2,4,6)$，真实 $(3,4,8)$。MAE？', answer: 1, explain: T`MAE（mean absolute error，平均绝对误差）是"每个样本预测差多少（取绝对值），再求平均"。把预测和真实逐个对齐：$|2-3|=1$，$|4-4|=0$，$|6-8|=2$。相加 $1+0+2=3$，除以样本数 3 得 $3/3=1$。绝对值不能省，否则 $-1+0-2=-3$，正负会互相抵消；若题目问 MSE（均方误差），则是 $(1+0+4)/3\approx1.67$。` },
      { type: 'mc', q: '完美分类器的 AUC 是：', options: ['0', '0.5', '1', '∞'], answer: 2, explain: T`ROC 曲线把每个阈值下的 (specificity, sensitivity) 画成一点，两条轴都在 0 到 1 之间，所以 AUC（area under the curve，曲线下面积）最大就是 $1\times1=1$。完美分类器有一个阈值能让 sensitivity 和 specificity 同时等于 1，曲线贴着正方形的边走，**面积是整个单位正方形 = 1**。0.5 是随机猜（对角线下的面积），不是完美；面积也不可能是 ∞。L15 p11。` },
      { type: 'show', q: '（英文）How is an ROC curve constructed, and what does AUC tell you?', answer: T`A scoring classifier is turned into a decision rule by a threshold. Sweeping the threshold (or a hyperparameter) gives one (specificity, sensitivity) pair per setting; plotting all pairs gives the ROC curve (the lecture plots specificity on the x-axis; the common convention plots $1-$specificity, the false-positive rate, which mirrors the curve without changing the area). It shows the trade-off between catching positives and avoiding false alarms. The area under the curve (AUC) summarises it in one number: 0.5 for random guessing, 1 for a perfect classifier.`, qzh: 'ROC 曲线（ROC curve）是怎么构造的？AUC 告诉你什么？', azh: '输出分数的分类器（scoring classifier）通过一个阈值（threshold）变成决策规则。扫过一系列阈值（或某个超参数），每个取值得到一对（特异度（specificity），灵敏度（sensitivity））；把所有点画出来就是 ROC 曲线（课件把特异度放在 x 轴；常见约定是画 $1-$特异度，即假阳性率（false-positive rate），这只是把曲线镜像翻转，面积不变）。它展示了"抓住正例"和"避免误报"之间的权衡。曲线下面积（area under the curve, AUC）用一个数概括它：随机猜测为 0.5，完美分类器为 1。' },
    ],
  });

  /* =====================================================================
   * c43 · 验证集、k-fold、bootstrap、nested CV（L15 p15–p24）
   * ===================================================================== */
  add({
    id: 'c43', week: 'W8', lec: 'L15', pages: 'L15 p15–p24', star: 2,
    keyEn: [
      T`Training set fits parameters, validation set selects hyperparameters, test set is used once to report performance; never tune on the test set.`,
      T`$k$-fold CV: train on $k-1$ folds, test on the held-out fold, rotate; report $\hat\mu=\frac1k\sum_iM_i$ and $\hat\sigma^2=\frac1k\sum_i(M_i-\hat\mu)^2$; $k=n$ is leave-one-out.`,
      T`0.632 bootstrap: draw $n$ examples with replacement for training, test on the unsampled ones; an example is drawn at least once with probability $1-(1-1/n)^n\to1-1/e\approx0.632$.`,
      T`Nested CV: the inner loop selects hyperparameters, the outer loop reports performance. Feature selection must use only each fold's training part, otherwise the CV estimate is optimistically biased.`,
    ],
    keyZh: [
      T`训练集（training set）学参数，验证集（validation set）选超参数，测试集（test set）只在最后用一次来报告成绩。用测试集调参等于偷看，报出的数字偏乐观。`,
      T`k 折交叉验证（k-fold CV）：分成 $k$ 折，每次留一折测试、其余训练，轮完一圈报告 $k$ 个成绩的均值和方差（L15 除以 $k$）；$k=n$ 就是留一法（leave-one-out）。`,
      T`0.632 自助法（bootstrap）：有放回地抽 $n$ 个当训练集，没被抽到的当测试集。每个样本至少被抽中一次的概率趋于 $1-1/e\approx0.632$，名字由此而来。`,
      T`嵌套交叉验证（nested CV）：内层只管挑超参数，外层只管打分，外层的测试折从不参与挑选。特征选择也只能用每折的训练部分，否则偷看了测试数据，估计偏乐观。`,
    ],
    title: '验证集、k-fold、bootstrap、nested CV', en: 'Train/validation/test, k-fold cross-validation, 0.632 bootstrap, nested CV',
    summary: '训练误差会骗人（过拟合）。分出 **validation set（验证集）** 选超参数、**test set（测试集）** 报最终结果。数据少时用 **k-fold cross-validation（k 折交叉验证）**：轮流留一折做测试；或 **0.632 bootstrap**：有放回抽 $n$ 个训练、剩下的测试（每个样本被抽中的概率约 0.632）。选超参数 + 报告性能要用 **nested CV**。特征选择必须在 CV **内部**只用训练部分做。',
    prereq: ['c18', 'c42'],
    symbols: [
      [T`$D$`, T`手上的全部数据（$n$ 个样本）`],
      [T`$n,\ k$`, T`样本数、折数`],
      [T`$S_1..S_k$`, T`k 个互不相交的折（fold）`],
      [T`$M_i$`, T`第 $i$ 次（第 $i$ 折 / 第 $i$ 次 bootstrap）的测试指标`],
      [T`$\hat\mu,\ \hat\sigma^2$`, T`指标的均值和方差（除以 $k$ 或 $B$）`],
      [T`$B$`, T`bootstrap 重复次数`],
      [T`$D-S_i$`, T`没被抽中的样本（集合差）`],
    ],
    goals: [
      '说出 train / validation / test 三个集合各自的用途（L15 p17）',
      '描述 k-fold CV 和 leave-one-out，会算均值和方差',
      '描述 0.632 bootstrap，推出 $1-(1-1/n)^n\\to1-1/e\\approx0.632$',
      '解释 nested CV，以及为什么特征选择要在 CV 内部做（L15 p22–p23）',
    ],
    types: ['T13'],
    what: [
      T`**过拟合**（L15 p16）：越复杂的方法（如三次 kernel vs 线性 kernel）、某些超参数值在训练集上越好，但在没见过的数据上通常更差。训练要在验证误差开始上升时停（"stop training here"）。`,
      T`**Train / validation / test**（L15 p17）：三个互不相交的部分。在 validation 上试不同超参数（如 $C=0.1,1,10$）；用最好的超参数在 **test** 上报告指标。`,
      T`三份划分有两个毛病：留出来的验证 / 测试集越大，用来训练的数据就越少；而且只切**一次**，指标好不好可能只是这次运气。数据不多时，改成**轮流**留出一小份当测试，每份都做一次，再把 $k$ 次结果平均：`,
      T`**k-fold cross-validation**（L15 p18）：把训练数据分成 $k$ 个互不相交的折 $S_1..S_k$（每折约 $n/k$ 个）。对每个 $i$：在除 $S_i$ 外的数据上训练，在 $S_i$ 上测试，得 $M_i$。报告`,
      { t: 'math', tex: T`\hat\mu=\frac1k\sum_{i=1}^kM_i,\qquad\hat\sigma^2=\frac1k\sum_{i=1}^k(M_i-\hat\mu)^2` },
      T`常用 $k=5$、$k=10$、$k=n$（**leave-one-out，留一法**）。`,
      T`k-fold 的各份互不重叠，每个样本恰好被测一次。另一种做法是**反复有放回地抽**一份和原数据一样大的训练集，没被抽到的拿去测试。名字里的 0.632 有来历：某个样本一次都没被抽中的概率是 $(1-1/n)^n$，$n$ 大时接近 $1/e\approx0.368$，所以每个样本进入训练集的概率约 $0.632$。`,
      T`**0.632 bootstrapping（0.632 自助抽样）**（L15 p19）：重复 $B$ 次：从 $D$ 中**有放回**抽 $n$ 个作为训练集 $S_i$（可重复），在没被抽到的 $D-S_i$ 上测试。`,
      T`k-fold 还有一个陷阱：如果在**同一折**上又挑超参数 $C$、又报最终成绩，挑 $C$ 时已经看过这份"测试"数据，报出来的数字会偏乐观（和"用测试集选超参数"是同一种偷看）。所以要两层：外层那一折只负责最后打分，挑 $C$ 在外层的训练部分**内部**再做一次验证：`,
      T`**Nested cross-validation（嵌套交叉验证）**（L15 p21）：内层（如 bootstrap 或 train/validation）选超参数；外层（如 k-fold 或 train/test）用选出的超参数报告性能。`,
      T`**具体例子**：外层 5-fold 报告性能。每一轮外层拿 4 折（80% 数据）当外层训练集，在它**内部**再做 4-fold CV，从 $C\in\{0.1,1,10\}$ 里挑最好的 $C$；用这个 $C$ 在整个外层训练集上重新训练，最后在外层留出的那一折上测试。外层测试折从没参与选 $C$，所以报告的数字不偏乐观。一共训练 $5\times(4\times3+1)=65$ 个模型。`,
      T`同一种"偷看"还有**特征选择**：如果先用全部数据选出特征、再做交叉验证，选特征时已经看过每一折的测试样本，估计同样偏乐观。每一折只能用该折的训练部分选特征。`,
    ],
    why: [
      T`这是所有实验的基本功，也是常见的简答题："为什么不能用测试集选超参数""特征选择放在 CV 外面错在哪"。`,
    ],
    intuition: [
      T`**测试集只能看一次。** 如果用测试集选超参数，选出来的就是"恰好在这批测试数据上好"的，报告的数字偏乐观——测试集已经变成了训练的一部分。`,
      T`**为什么用 k-fold？** 一次划分的结果受运气影响大；k-fold 让每个样本都当一次测试，用满了数据，还能给出方差（c44 用它比较算法）。`,
      T`**特征选择的陷阱**（L15 p22–p23）：先在**全部**数据上选特征再做 CV，选特征时已经看过验证集——训练"偷看"了本应没见过的数据，CV 被破坏，结果过于乐观。正确：每一折里只用训练部分选特征。另外各个划分应保持相似的特点（如类别比例，L15 p24）。`,
      { t: 'think', q: '为什么叫 "0.632" bootstrap？', a: T`有放回抽 $n$ 次，某个样本一次都没被抽到的概率是 $(1-1/n)^n\to1/e\approx0.368$。所以它被抽到（至少一次）的概率趋于 $1-1/e\approx0.632$——训练集大约包含 63.2% 的不同样本，剩下约 36.8% 用来测试。` },
      { t: 'story', title: 'Bootstrap 的名字', md: 'Bradley Efron 在 1979 年提出 bootstrap 方法。名字来自英文俗语 "pull oneself up by one\'s bootstraps"（拽着自己的鞋带把自己提起来）——只用手上这一份数据，反复重抽样来估计不确定性，好像"自己帮自己"。' },
    ],
    math: [
      { t: 'h3', text: '为什么是 0.632（L15 p20）' },
      { t: 'steps', items: [
        T`一次抽取没抽到某个样本：$1-\frac1n$。`,
        T`$n$ 次都没抽到：$(1-\frac1n)^n$。`,
        T`至少抽到一次：$1-(1-\frac1n)^n\ \xrightarrow{n\to\infty}\ 1-\frac1e\approx0.632$。`,
      ] },
      T`例：$n=3$：$1-(2/3)^3\approx0.704$；$n=10$：$1-0.9^{10}\approx0.651$；$n=100$：$\approx0.634$。`,
    ],
    fx: [
      {
        title: 'k-fold 汇总', tex: T`\hat\mu=\htmlClass{fx-p1}{\frac1k}\sum_{i=1}^k\htmlClass{fx-p2}{M_i},\qquad\hat\sigma^2=\frac1k\sum_{i=1}^k(M_i-\hat\mu)^2`,
        parts: [
          { label: '1/k', note: 'L15 的约定：方差也除以 $k$（不是 $k-1$）。' },
          { label: 'M_i', note: '第 $i$ 折作测试时的指标（accuracy、MSE……）。' },
        ],
      },
    ],
    example: [
      { t: 'fade', title: '分步练习：CV 与 bootstrap', plan: ['确定每份的大小 / 概率', '计算', '解释'], items: [
        { md: T`5-fold，各折 accuracy $0.8,0.9,0.7,0.8,0.8$。`, steps: [
          { md: '每折一个数' }, { md: T`$\hat\mu=0.8$；$\hat\sigma^2=(0+0.01+0.01+0+0)/5=0.004$` }, { md: T`标准差 $=\sqrt{0.004}\approx0.063$（因为 $0.063^2\approx0.004$），报告 $0.8\pm0.063$` },
        ] },
        { md: T`$n=100$，10-fold。`, steps: [
          { ask: '每次训练用多少个样本？', answer: 90, show: '每折 10 个，训练用其余 90 个', sg: 2 },
          { ask: '一共训练几个模型？', answer: 10, show: '10', sg: 2 },
        ] },
        { md: T`Bootstrap，$n=10$（$0.9^{10}\approx0.349$）。`, steps: [
          { ask: '某个样本至少被抽中一次的概率 = ?', answer: 0.651, tol: 0.002, show: '$1-0.349$', sg: 2 },
          { ask: '平均有多少个样本留作测试？', answer: 3.49, tol: 0.02, show: T`$0.9^{10}\approx0.349$ 是某个样本 10 次都没被抽中的概率；10 个样本每个都一样，期望个数 $=10\times0.349\approx3.5$`, sg: 3 },
        ] },
      ] },
    ],
    viz: [
      { id: 'cv-split', how: '20 个样本排成一行。k-fold 模式下"下一步"换下一折，高亮的是这一折的测试样本；leave-one-out 就是每折一个；bootstrap 模式显示每个样本被抽中几次，没被抽中的（out-of-bag，袋外样本）留作测试。',
        try: '① k-fold 走一遍，确认每个样本恰好当一次测试。② 多点几次 bootstrap 的 resample，看 out-of-bag 比例在 $(19/20)^{20}\\approx0.358$ 附近波动（$n=20$；$n\\to\\infty$ 时才是 $1/e\\approx0.368$）。' },
    ],
    compare: [
      { t: 'table', head: ['方法', '训练集', '测试集', '特点'], rows: [
        ['Hold-out（留出法：train/val/test）', '一部分', '另一部分', '简单，但浪费数据、受划分运气影响'],
        ['k-fold', '$k-1$ 折', '1 折，轮流', '每个样本测一次；$k$ 个模型'],
        ['Leave-one-out', '$n-1$ 个', '1 个', '$k=n$，最贵'],
        ['0.632 bootstrap', '有放回抽 $n$ 个', '没被抽到的（约 36.8%）', '可重复 $B$ 次'],
      ] },
      { t: 'exam', md: T`**Why must feature selection be done inside cross-validation?** If features are selected using the whole dataset, the selection has already used the validation/test examples, so the model indirectly "sees" the supposedly unseen data and the cross-validation estimate becomes optimistically biased. Feature selection (or dimensionality reduction) must be fitted on the training portion of each fold only.` },
    ],
    pitfalls: [
      ['用测试集选超参数', '选超参数用验证集（或内层 CV）；测试集只用来报告。'],
      ['先在全部数据上画图、看关系，选好模型后才划分 train/test', '这也是偷看，叫 data snooping（数据窥探，Worksheet 3 的 "Have we made any mistakes?"）：测试样本已经影响了模型选择，测试误差偏乐观。先划分，画图、选模型都只看训练集。'],
      ['在全部数据上做特征选择再 CV', '会"偷看"验证数据（L15 p22）。'],
      ['Bootstrap 是无放回抽样', '有放回，所以有重复、有样本没被抽到。'],
      ['k-fold 的方差除以 $k-1$', 'L15 的公式除以 $k$。'],
    ],
    quiz: [
      { type: 'num', q: '$n=50$，leave-one-out 需要训练几个模型？', answer: 50, explain: T`leave-one-out（留一法）就是 $k$-fold 交叉验证取 $k=n$：每一折只有 1 个样本。每轮留出 1 个样本测试、用其余 $50-1=49$ 个训练；50 个样本每个都要轮到一次，所以共训练 $n=50$ 个模型。这也是它最贵的原因：模型个数随样本数增长。` },
      { type: 'num', q: '$n\\to\\infty$ 时 bootstrap 中某样本**没**被抽到的概率（保留 3 位）？', answer: 0.368, tol: 0.002, explain: T`bootstrap（自助抽样）从 $n$ 个样本里有放回地抽 $n$ 次。抽一次没抽到某个样本的概率是 $1-1/n$，$n$ 次都没抽到是 $(1-1/n)^n$；$n\to\infty$ 时它趋于 $1/e\approx1/2.718\approx0.368$。所以约 36.8% 的样本不进训练集、留作测试；反过来，至少被抽到一次的概率约 0.632，这就是"0.632 bootstrap"的名字来历。**题目问的是"没抽到"**，别答成 0.632。` },
      { type: 'mc', q: 'Nested CV 中内层循环用来：', options: ['报告最终性能', '选超参数', '做特征选择之外的事', '增加训练数据'], answer: 1, explain: T`nested cross-validation（嵌套交叉验证）分两层：**内层在外层的训练部分里试不同超参数**（如 $C=0.1,1,10$）并挑出最好的；外层用挑出的超参数训练，再在从没参与挑选的测试折上报告性能。"报告最终性能"是外层的工作：如果用挑超参数的同一份数据打分，等于偷看了测试数据，报出的数字会偏乐观。L15 p21。` },
      { type: 'show', q: '（英文）Compare k-fold cross-validation with 0.632 bootstrapping. Why "0.632"?', answer: T`k-fold CV splits the data into $k$ disjoint folds; each fold is held out once for testing while the model is trained on the other $k-1$, and the $k$ test scores are averaged (every example is tested exactly once). Bootstrapping instead draws $n$ examples **with replacement** to form a training set and tests on the examples never drawn (out-of-bag), repeated $B$ times. An example is never drawn with probability $(1-1/n)^n\to e^{-1}\approx0.368$, so each bootstrap training set contains about $1-e^{-1}\approx63.2\%$ of the distinct examples — hence the name.`, qzh: '比较 k 折交叉验证（k-fold cross-validation）和 0.632 自助法（0.632 bootstrapping）。为什么叫"0.632"？', azh: T`k 折交叉验证把数据分成 $k$ 个互不相交的折（fold）；每一折轮流留出一次用于测试，模型在其余 $k-1$ 折上训练，最后把 $k$ 个测试分数取平均（每个样本恰好被测试一次）。自助法（bootstrapping）则是**有放回地**抽取 $n$ 个样本组成训练集，并在从未被抽中的样本（袋外样本，out-of-bag）上测试，重复 $B$ 次。一个样本始终没被抽中的概率是 $(1-1/n)^n\to e^{-1}\approx0.368$，所以每个自助训练集大约包含 $1-e^{-1}\approx63.2\%$ 的不同样本——名字由此而来。` },
    ],
  });

  /* =====================================================================
   * c44 · 比较算法：t 检验、error bars（L15 p25–p35）
   * ===================================================================== */
  add({
    id: 'c44', week: 'W8', lec: 'L15', pages: 'L15 p25–p35', star: 1,
    keyEn: [
      T`A difference in mean error may be luck: report the mean and variance over repeated splits ($k$-fold or bootstrap) and test whether the difference is significant.`,
      T`Two-sample $t$ test: $x=\frac{(\hat\mu_1-\hat\mu_2)\sqrt m}{\sqrt{\hat\sigma_1^2+\hat\sigma_2^2}}$; one-sided $H_1:\mu_1>\mu_2$; reject $\mu_1=\mu_2$ only if $x>x_{1-\alpha,\nu}$ (critical value is given).`,
      T`Error bars $\hat\mu_j\pm\frac{\hat\sigma_j}{\sqrt m}x_{1-\alpha/2,m-1}$ are a separate two-sided display; heavily overlapping bars suggest no clear difference.`,
      T`Each sample must be an independent unit of interest（研究单位）: repeated measurements of one patient or object, or duplicated data, inflate $m$ and fake significance.`,
    ],
    keyZh: [
      T`平均错误率差一点，可能只是这次划分的运气：要报告多次重复（k-fold 或 bootstrap）上的均值和方差，再检验差异是否显著（significant）。`,
      T`两样本 t 检验（two-sample t test）：$x$ = 均值差 × $\sqrt m$ ÷ 两边波动合起来，即"差距 ÷ 噪声"。单侧检验（备择 $\mu_1>\mu_2$），$x$ 超过题目给的临界值才拒绝 $\mu_1=\mu_2$。`,
      T`误差条（error bars）是另一套展示：每个算法单独画一个区间（双侧，自由度 $m-1$），和 t 检验不是同一个程序。两个区间大幅重叠，就看不出谁更好。`,
      T`每个样本必须是一个独立的研究单位（unit of interest）：同一病人、同一物体的多次记录，或复制出来的数据，都会把 $m$ 灌大，让差异看起来"显著"，其实是假的。`,
    ],
    title: '比较算法：t 检验、error bars', en: 'Comparing algorithms: variability, t-test, error bars, units of interest',
    summary: '两个算法的平均错误率不同，可能只是运气。要同时看**均值和方差**：用 **two-sample t test（双样本 t 检验）** 判断差异是否显著，或画 **error bars（误差条）** 看是否重叠。另外，每个样本必须是一个独立的"研究单位"，不能把同一个人 / 物体的多次记录当成多个样本。',
    prereq: ['c43'],
    symbols: [
      [T`$j$`, T`算法编号（1 或 2）`],
      [T`$\hat\mu_j,\ \hat\sigma_j^2$`, T`算法 $j$ 在 $m$ 次重复上的指标均值、方差`],
      [T`$\hat\sigma_j$`, T`标准差 $=\sqrt{\hat\sigma_j^2}$（误差条用它）`],
      [T`$m$`, T`重复次数（k-fold 的 $k$ 或 bootstrap 的 $B$）`],
      [T`$x$`, T`检验统计量`],
      [T`$\nu$`, T`t 分布的自由度`],
      [T`$\alpha$`, T`显著性水平（如 5%）`],
      [T`$x_{1-\alpha,\nu}$`, T`t 分布 CDF 等于 $1-\alpha$ 的位置（临界值，查表或题目给出）`],
    ],
    goals: [
      '说出为什么要报告方差、做显著性检验（L15 p25–p26）',
      '代 L15 p27 的公式算 $x$，与临界值比较得出结论（复现 p29–p30 的两个例子）',
      '算 error bar 并解读重叠（L15 p31）',
      '解释 unit of interest（研究单位）：不要重复采样同一对象（L15 p33–p34）',
    ],
    types: [],
    notExam: '自由度 $\\nu$ 的公式和 t 分布的细节只需会代入；考试会给临界值。',
    what: [
      T`**为什么**（L15 p25–p26）：CV 给出的是多次结果的平均，平均差一点不代表算法真的更好。课件的态度："不完美的技术用在不完美的场景，但比较两个方案时很有用"。`,
      T`**先看课件的数字，再读公式。** 两个算法 9 折的平均错误率 10.1% 和 9.9%，只差 0.2 个百分点；而两边各自的方差是 4.1 和 3.2——这点差距和平时的波动比起来很小。下面的 $x$ 就是"均值差 $\times\sqrt m$"除以"两边方差相加再开方"：$\frac{0.2\times3}{\sqrt{7.3}}\approx0.22$（$0.2=10.1-9.9$，$3=\sqrt9$，$7.3=4.1+3.2$；$2.7^2=7.29$，所以 $\sqrt{7.3}\approx2.70$，$0.6/2.70\approx0.22$）。$x$ 超过查表的临界值才拒绝"两者一样"；$\nu$ 是查表用的自由度，考试会给。`,
      T`**Two-sample t test**（L15 p27–p28）：零假设 $\mu_1=\mu_2$，备择 $\mu_1>\mu_2$：`,
      { t: 'math', tex: T`x=\frac{(\hat\mu_1-\hat\mu_2)\sqrt m}{\sqrt{\hat\sigma_1^2+\hat\sigma_2^2}},\qquad\nu\approx\frac{(\hat\sigma_1^2+\hat\sigma_2^2)^2(m-1)}{\hat\sigma_1^4+\hat\sigma_2^4}` },
      T`（$\nu$ 要取整数。课件公式外面印了取整括号，但两个例子算出 15.8 和 15.2 都取了 16，也就是**向上取整**；照抄成向下取整会得到 15。考试会给 $\nu$ 或临界值。）`,
      T`这是**单侧**检验：备择假设 $H_1:\mu_1>\mu_2$。只有当 $x>x_{1-\alpha,\nu}$（t 分布在 $1-\alpha$ 处的临界值）时才拒绝 $\mu_1=\mu_2$，认为算法 1 的指标确实更大。`,
      T`**Error bars（误差条）**（L15 p31）：$\hat\mu_j\pm\frac{\hat\sigma_j}{\sqrt m}x_{1-\alpha/2,\,m-1}$。每个算法单独画一个区间，两个区间明显重叠 ⇒ 看不出差异。注意它和 t 检验是**不同的程序**：误差条只用自己的 $m$ 个数，所以自由度是 $m-1$，而且是双侧（$\alpha/2$）；t 检验比较两个算法，用合并的 $\nu$、单侧。`,
      T`上面的 $m$ 和误差条都假设每次重复是**独立**的。如果把同一个病人的两次就诊、或同一个物体的 1000 张照片当成很多个样本，$m$ 被灌大，$\sqrt m$ 让 $x$ 虚高，差异看起来"显著"。所以：`,
      T`**unit of interest（研究单位）**（L15 p33–p34）：每个样本应是一个不同的研究对象。同一个病人看两次病不能算两个样本（如果研究对象是病人）；给 3 个物体各拍 1000 张照片 ≠ 给 3000 个物体各拍 1 张。不要复制数据来冒充更大的样本量。`,
    ],
    why: [
      T`往年不常直接考计算，但"如何判断两个算法谁更好"和"样本单位"是可能的简答。`,
    ],
    intuition: [
      T`**$x$ 就是"差距 ÷ 噪声"。** 分子是均值差（乘 $\sqrt m$：重复次数越多，均值越可信），分母是两边的波动。差距比噪声大很多，才敢说真的不同。`,
      { t: 'think', q: '两个算法 9 折平均错误率 10.1% 和 9.9%，算法 2 更好吗？', a: '就是下面表里的例 1（L15 p29）：$x=(10.1-9.9)\\times\\sqrt9/\\sqrt{4.1+3.2}=0.6/\\sqrt{7.3}\\approx0.22$。这道例题查表的临界值是 1.75（题目会给），$0.22<1.75$，不能拒绝 $\\mu_1=\\mu_2$——差 0.2% 完全可能是运气。误差条（p31）也明显重叠。' },
      { t: 'story', title: '"Student" 是谁', md: 't 检验由 William Gosset 在 1908 年发表。他在都柏林的吉尼斯（Guinness）啤酒厂工作，用小样本检验大麦和酒的质量；公司不允许员工发表论文，他就用笔名 "Student"——所以叫 Student\'s t-distribution。' },
    ],
    math: [
      { t: 'h3', text: 'L15 p29–p30 的两个例子（9 折，5% 显著性，临界值 $x_{0.95,16}=1.75$）' },
      { t: 'table', cls: 'compact', head: ['', '$\\hat\\mu_1,\\hat\\sigma_1^2$', '$\\hat\\mu_2,\\hat\\sigma_2^2$', '$x$', '结论'], rows: [
        ['例 1', '10.1, 4.1', '9.9, 3.2', '$\\frac{0.2\\times3}{\\sqrt{7.3}}\\approx0.22$', '0.22 ≤ 1.75，不能拒绝'],
        ['例 2', '11.6, 2', '9.9, 3.2', '$\\frac{1.7\\times3}{\\sqrt{5.2}}\\approx\\frac{5.1}{2.28}\\approx2.24$（$1.7=11.6-9.9$，$5.2=2+3.2$）', '2.24 > 1.75，拒绝 ⇒ 算法 1 错误率显著更高'],
      ] },
      T`自由度：例 1 $\nu\approx\frac{(4.1+3.2)^2\times8}{4.1^2+3.2^2}=\frac{426.3}{27.05}\approx15.8$（8 是 $m-1$；分子 $7.3^2=53.29$，乘 8 得 426.3；分母 $16.81+10.24=27.05$）；例 2 $\nu\approx\frac{(2+3.2)^2\times8}{2^2+3.2^2}=\frac{216.3}{14.24}\approx15.2$（$5.2^2\times8=216.3$，$4+10.24=14.24$）。课件两个都取 $\nu=16$，查表 $x_{0.95,16}=1.75$（5% 单侧）。**1.75 只是这道例题的临界值**，考试会另给。`,
      T`误差条是另一套查表：10% **双侧** = 每边留 5%，所以查 0.95 分位；自由度只用自己的 $m-1=8$（不是 t 检验合并的 $\nu\approx16$），所以临界值是 $x_{0.95,8}\approx1.86$，不是 1.75。半宽 = 标准差 $/\sqrt m\times1.86$：$\sqrt{4.1}\approx2.025$，$2.025/3\times1.86\approx1.26$；$\sqrt{3.2}\approx1.789$，$1.789/3\times1.86\approx1.11$。`,
      T`误差条（L15 p31，$m=9$，10% 双侧，$x_{0.95,8}\approx1.86$）：例 1 算法 1 半宽 $\frac{\sqrt{4.1}}{3}\times1.86\approx1.26$，算法 2 半宽 $\frac{\sqrt{3.2}}{3}\times1.86\approx1.11$，区间 $10.1\pm1.26$ 与 $9.9\pm1.11$ 大幅重叠。`,
    ],
    fx: [
      {
        title: '检验统计量', tex: T`x=\frac{\htmlClass{fx-p1}{(\hat\mu_1-\hat\mu_2)}\,\htmlClass{fx-p2}{\sqrt m}}{\htmlClass{fx-p3}{\sqrt{\hat\sigma_1^2+\hat\sigma_2^2}}}`,
        parts: [
          { label: '均值差', note: '两个算法平均表现的差距。' },
          { label: '√m', note: '重复越多，均值越可靠。' },
          { label: '噪声', note: '两边波动合起来的大小。' },
        ],
      },
    ],
    example: [
      { t: 'fade', title: '分步练习：t 检验与 error bar', plan: [T`算 $x=\frac{(\hat\mu_1-\hat\mu_2)\sqrt m}{\sqrt{\hat\sigma_1^2+\hat\sigma_2^2}}$`, '与临界值比较', '下结论（拒绝 / 不能拒绝）'], items: [
        { md: 'L15 p29 例 1。', steps: [{ md: '$x\\approx0.22$' }, { md: '0.22 ≤ 1.75' }, { md: '不能拒绝 $\\mu_1=\\mu_2$' }] },
        { md: T`L15 p30 例 2：$\hat\mu_1=11.6,\hat\sigma_1^2=2$；$\hat\mu_2=9.9,\hat\sigma_2^2=3.2$；$m=9$。`, steps: [
          { ask: T`$x=?$`, answer: 2.236, tol: 0.01, show: T`$1.7\times3/\sqrt{5.2}\approx2.24$` },
          { ask: '临界值 1.75，拒绝吗？（是 1 / 否 0）', answer: 1, show: '2.24 > 1.75，拒绝' },
        ] },
        { md: T`Error bar（L15 p31，10% 水平，临界值 1.86）：算法 2 $\hat\mu=9.9$，$\hat\sigma^2=3.2$，$m=9$。`, steps: [
          { ask: T`半宽 $\frac{\hat\sigma}{\sqrt m}\times1.86=?$`, answer: 1.109, tol: 0.005, show: T`$\sqrt{3.2}/3\times1.86\approx1.11$`, sg: 1 },
          { ask: '下端点 = ?', answer: 8.79, tol: 0.01, show: '$9.9-1.11$', sg: 3 },
        ] },
      ] },
    ],
    compare: [
      { t: 'exam', md: T`**Comparing two learners:** Report the mean and variance of the metric over repeated splits ($k$-fold or bootstrap). Use a two-sample $t$ test, $x=(\hat\mu_1-\hat\mu_2)\sqrt m/\sqrt{\hat\sigma_1^2+\hat\sigma_2^2}$, with the one-sided alternative $H_1:\mu_1>\mu_2$, and reject $\mu_1=\mu_2$ only if $x>x_{1-\alpha,\nu}$, the Student's $t$ critical value. Error bars $\hat\mu_j\pm\frac{\hat\sigma_j}{\sqrt m}x_{1-\alpha/2,m-1}$ are a separate, two-sided display; heavily overlapping bars suggest no clear difference. Each sample must be an independent unit of interest — repeated measurements of the same unit must not be counted as separate samples.` },
    ],
    pitfalls: [
      ['均值不同就说算法不同', '要看方差和显著性。'],
      ['同一病人多次就诊算多个样本', '若研究单位是病人，只算一个（L15 p34）。'],
      ['复制数据可以增大样本量', '不能；只会制造虚假的确定性。'],
    ],
    quiz: [
      { type: 'num', q: '$\\hat\\mu_1-\\hat\\mu_2=1$，$m=16$，$\\hat\\sigma_1^2+\\hat\\sigma_2^2=4$。$x=?$', answer: 2, explain: '$x=1\\times\\sqrt{16}/\\sqrt4=1\\times4/2=2$：4 是 $\\sqrt m$，2 是两边方差之和开方。', qzh: T`已知 $\hat\mu_1-\hat\mu_2=1$，$m=16$，$\hat\sigma_1^2+\hat\sigma_2^2=4$。$x$（两样本 $t$ 检验统计量）等于多少？` },
      { type: 'mc', q: '两个算法的误差条明显重叠，说明：', options: ['算法 1 更好', '算法 2 更好', '没有明显差异', '实验有错'], answer: 2, explain: T`error bar（误差条）是每个算法自己的区间 $\hat\mu_j\pm\frac{\hat\sigma_j}{\sqrt m}x_{1-\alpha/2,m-1}$，表示它的平均指标大致落在哪里。两个区间明显重叠，说明均值之差没有超出正常波动，**看不出谁更好**。不能因为某个均值低一点就选"算法 2 更好"：课件例子 $10.1\pm1.26$ 和 $9.9\pm1.11$ 均值差 0.2，区间大幅重叠。重叠也不代表实验有错，只是数据不足以分出高下。L15 p31。` },
    ],
  });

  /* =====================================================================
   * c45 · Experts：majority、halving（L16 p1–p14）
   * ===================================================================== */
  add({
    id: 'c45', week: 'W8', lec: 'L16', pages: 'L16 p1–p14', star: 1,
    keyEn: [
      T`Online learning with expert advice: each round see $n$ experts' predictions, predict, then see the outcome; outcomes may be adversarial (no i.i.d. assumption); compare our mistakes $M$ with the best expert's $m$.`,
      T`Majority vote (an infallible expert exists): predict the majority of the surviving experts and delete every expert that errs; $M\le\log_2n$.`,
      T`Halving (no perfect expert): weighted majority vote, halve the weight of each wrong expert instead of deleting it; $M\le\frac{m+\log_2n}{\log_2(4/3)}\approx2.41(m+\log_2n)$.`,
      T`Potential-function（势函数）proof: each learner mistake cuts the total weight by a constant factor, $W\le n(3/4)^M$, while the best expert keeps $W\ge(1/2)^m$; take logs.`,
    ],
    keyZh: [
      T`在线学习（online learning）每轮：先看 $n$ 个专家（expert）的预测，自己预测，再看真实结果。结果可以由对手故意挑（不假设 i.i.d.），拿我们的错误数 $M$ 和最好专家的 $m$ 比。`,
      T`多数投票（majority vote）的前提是有一个从不出错的专家：跟存活专家的多数票走，错的专家全删掉。学习者每错一次，存活专家至少减半，所以最多错 $\log_2n$ 次。`,
      T`减半算法（halving）用于没有完美专家时：加权投票，错的专家权重减半而不删除（全删可能把最好的也删了）。界里多了最好专家的错误数 $m$，系数约 2.41。`,
      T`势函数（potential function）证明：学习者每错一次，总权重至多剩 3/4；而总权重至少是最好专家的权重 $(1/2)^m$。两头夹住，取 log 解出 $M$。`,
    ],
    title: 'Experts：majority、halving', en: 'Learning with expert advice: majority vote and halving',
    summary: '**Online learning（在线学习）**：每天听 $n$ 个专家的预测，自己做预测，再看真实结果；目标是总错误少。结果可以是**对抗性的**（不假设 i.i.d.）。有完美专家时用 **majority vote**：错一次删掉所有错的专家，$M\\le\\log_2n$。没有完美专家时用 **halving**：错的专家权重减半而不删除，$M\\le\\frac{m+\\log_2n}{\\log_2(4/3)}\\approx2.41(m+\\log_2n)$（课件写作 2.4）。',
    prereq: ['c31'],
    symbols: [
      [T`$E_1..E_n$`, T`$n$ 个专家（$E_i$ 是第 $i$ 个专家；不带下标的 $E$ 是集合，见下行）`],
      [T`$y$`, T`候选标签（如 $+1$ / $-1$）：$\argmax_y$ 就是"得票最多的那个标签"`],
      [T`$E$`, T`还没犯过错的专家集合（majority）`],
      [T`$M$`, T`学习者（我们的算法）的总错误数`],
      [T`$m$`, T`最好的专家的错误数`],
      [T`$w_i$, $W=\sum_iw_i$`, T`专家权重、总权重（potential function）`],
      [T`$1[E_i=y]$`, T`专家 $i$ 预测 $y$ 时为 1`],
    ],
    goals: [
      '描述 online learning 的设定，以及它和 batch learning 的区别（L16 p7、p13）',
      '执行 majority vote，推出 $M\\le\\log_2n$（potential = 存活专家数）',
      '执行 halving，推出 $M\\le\\frac{m+\\log_2n}{\\log_2(4/3)}\\approx2.41(m+\\log_2n)$',
    ],
    types: ['T12'],
    what: [
      { t: 'h3', text: '① 设定：每天听专家的，再看结果（L16 p4）' },
      T`**设定**（L16 p4）：$n$ 个专家每天预测股市涨跌（二元）。每天：① 看所有专家的预测；② 自己预测；③ 看结果（可以是任何结果，甚至对抗性的）。目标：总错误最少。`,
      { t: 'h3', text: '② 有一个专家永远不错：majority vote（L16 p5–p6）' },
      T`**Majority vote（多数投票）**（L16 p5）——假设至少 1 个专家从不出错（**infallible expert**）：`,
      { t: 'steps', items: [
        T`$E=\{1,\dots,n\}$。`,
        T`每天预测 $\argmax_{y}\sum_{i\in E}1[E_i=y]$（存活专家的多数票）。`,
        T`看结果后，把预测错的专家从 $E$ 中删掉。`,
      ] },
      T`4 个专家，$E_3$ 从不出错。第 1 天预测 $(E_1,E_2,E_3,E_4)=(+,+,-,+)$，真实 $-$：多数票 $+$ ⇒ 学习者错。删掉 $E_1,E_2,E_4$ ⇒ $E=\{3\}$，以后只跟 $E_3$，永不再错。$M=1\le\log_24=2$ ✓。`,
      { t: 'math', tex: T`M\le\log_2n` },
      T`**Potential function（势函数）证明法**（注意：这里的"势函数"是证明里用的一个量，和 W10–W11 图模型里的 potential function 同名不同义）：找一个量，每次学习者犯错它就大幅减少，但它又有下界。majority 里这个量是存活专家数 $|E|$：学习者错 ⇒ 多数派错 ⇒ 至少一半专家被删 ⇒ $|E|$ 至少减半；又因为完美专家永远存活，$|E|\ge1$。所以最多减半 $\log_2n$ 次（L16 p6）。`,
      T`犯 $M$ 次错后 $|E|\le n/2^M$；完美专家存活 ⇒ $1\le|E|$。所以 $1\le n/2^M$ ⇒ $2^M\le n$ ⇒ $M\le\log_2n$。`,
      { t: 'h3', text: '③ 没有完美专家：halving（L16 p9–p12）' },
      T`上面的界靠一个很强的假设：**至少有一个专家从不犯错**，所以错的人可以直接删掉。现实里最好的专家也会犯错——一直删下去，最后会删光、没人可跟。改进办法：**不删除，只降权**。`,
      T`**Halving algorithm**（L16 p11）——没有完美专家时：所有 $w_i=1$；按**加权**多数预测 $\argmax_y\sum_iw_i1[E_i=y]$；预测错的专家 $w_i\leftarrow w_i/2$（降权，不删除）。`,
      T`**先走一天**：3 个专家权重 $(1,1,1)$，预测 $(+,+,-)$，真实 $-$。加权投票 $+$ 得 2、$-$ 得 1，学习者猜 $+$，错了；两个错的专家减半，权重变成 $(0.5,0.5,1)$，总权重从 3 掉到 2。一般地，学习者每错一次，**至少一半**的总权重站在错的一边、被减半，所以总权重最多剩 $3/4$。由此得到（推导在下面）：`,
      { t: 'math', tex: T`M\le\frac{m+\log_2n}{\log_2(4/3)}\approx2.41\,(m+\log_2n)` },
      T`**Halving**：势函数换成总权重 $W$。学习者错 ⇒ 至少一半的权重站在错误一边 ⇒ 这些权重减半 ⇒ $W$ 至少减少 1/4：$W\le n(3/4)^M$。最好的专家错了 $m$ 次，权重 $(1/2)^m\le W$。两边夹起来取 log 就得到界（L16 p12）。`,
      { t: 'math', tex: T`\Big(\frac12\Big)^m=w_{\text{best}}\le W\le n\Big(\frac34\Big)^M\ \Rightarrow\ -m\le\log_2n+M\log_2\frac34\ \Rightarrow\ M\le\frac{m+\log_2n}{\log_2(4/3)}` },
      T`$1/\log_2(4/3)\approx2.41$。**不完美的代价**（L16 p13）：完美时 $M=O(\log n)$，不完美时 $M=O(m+\log n)$。`,
      { t: 'h3', text: '④ 回头看：这和以前的学习有什么不同（L16 p7、p13）' },
      T`现在可以对比了。前面几周（W3–W4 的泛化界）假设数据是 i.i.d. 抽出来的；这里不做任何假设，真实结果甚至可以由"对手"故意挑。目标也不一样：不再是"真实风险小"，而是"学习者的错误数 $M$ 不比最好专家的错误数 $m$ 多太多"，即 $M-m$ 小：`,
      { t: 'table', cls: 'compact', head: ['', 'Batch learning（批量学习：一次拿到全部训练数据）', 'Online learning（在线学习：逐轮预测、逐轮得到反馈）'], rows: [
        ['损失的假设', 'i.i.d.（Hoeffding 等）', '对抗性 / 任意'],
        ['目标', '估计误差小（用 VC 维界定）', '$M-m$ 小（用专家数界定）'],
      ] },
    ],
    why: [
      T`这是另一种学习框架：不假设数据 i.i.d.，最坏情况（对抗）下也有保证。它的思想（乘性权重更新）在 boosting、博弈论、优化里到处出现，也直接通向下一周的 bandits。T12 的界代数题来源于此。`,
    ],
    intuition: [
      { t: 'think', q: '为什么 halving 不直接删掉犯错的专家？', a: '没有完美专家时，最好的专家也会犯错；删掉就可能把它也删了，最后无人可用。降权保留了"偶尔犯错但总体最好"的专家。' },
      { t: 'story', title: 'Weighted majority', md: 'Nick Littlestone 和 Manfred Warmuth 1989 年提出 weighted majority 算法（1994 年期刊版）。"专家建议"这一框架后来系统整理在 Cesa-Bianchi 和 Lugosi 的书《Prediction, Learning, and Games》里——L16 p7 放的就是这本书的封面。' },
    ],
    math: [
      T`**两个界怎么来的，一句话**：都是"势函数"论证——找一个量，每次学习者犯错它就按比例缩小，但它又有下界。majority 里是存活专家数（每错一次至少减半，最少剩 1 个）；halving 里是总权重（每错一次至少剩 3/4，最少是最好专家的 $(1/2)^m$）。夹出来取 log 就是界。`,
    ],
    fx: [
      {
        title: 'Halving 的界', tex: T`M\le\frac{\htmlClass{fx-p1}{m}+\htmlClass{fx-p2}{\log_2n}}{\htmlClass{fx-p3}{\log_2(4/3)}}`,
        parts: [
          { label: 'm', note: '最好专家的错误数：学习者不可能比它好太多，界里必有这一项。' },
          { label: 'log₂n', note: '专家数只以对数影响——专家多一倍，只多 1。' },
          { label: '1/log₂(4/3)≈2.4', note: '来自"每错一次总权重至少剩 3/4"。' },
        ],
      },
    ],
    example: [
      { t: 'fade', title: '分步练习：halving', plan: ['按当前权重做加权投票', '和真实结果比较（学习者错没错）', '把预测错的专家权重减半'], items: [
        { md: T`3 个专家，权重 $(1,1,1)$。第 1 天预测 $(+,+,-)$，真实 $-$。`, steps: [
          { md: '$+$ 得 2，$-$ 得 1 ⇒ 预测 $+$' }, { md: '学习者错' }, { md: '权重 $(0.5,0.5,1)$' },
        ] },
        { md: T`第 2 天预测 $(+,-,-)$，真实 $+$。当前权重 $(0.5,0.5,1)$。`, steps: [
          { ask: '$-$ 一方的总权重 = ?', answer: 1.5, show: T`三个位置和专家编号对齐：猜 $-$ 的是专家 2（权重 0.5）和专家 3（权重 1），$0.5+1=1.5$；专家 1 猜 $+$，不在这一边` },
          { ask: '学习者错了吗？（是 1 / 否 0）', answer: 1, show: '预测 $-$，真实 $+$，错' },
          { ask: T`更新后 $w_3=?$`, answer: 0.5, show: T`$E_3$ 错了，减半` },
        ] },
        { md: T`第 3 天预测 $(+,+,-)$，真实 $+$。当前权重 $(0.5,0.25,0.5)$（第 2 天专家 2、3 都错了：$w_2$ 从 0.5 减半成 0.25，$w_3$ 从 1 减半成 0.5；专家 1 对了，仍是 0.5）。`, steps: [
          { ask: '$+$ 一方的总权重 = ?', answer: 0.75, show: '$0.5+0.25$' },
          { ask: '学习者错了吗？（是 1 / 否 0）', answer: 0, show: '0.75 > 0.5，预测 $+$，正确' },
          { ask: T`更新后 $w_3=?$`, answer: 0.25, show: '$E_3$ 又错，减半' },
        ] },
      ] },
    ],
    viz: [
      { id: 'experts-sim', how: '4 个专家 10 天的预测表和真实结果。三种算法：Majority vote（错者淘汰）、Halving（错者权重减半）、Weighted Majority（错者乘 $\\beta=1-\\varepsilon$）。逐天执行：显示每个专家的权重、加权投票、学习者的预测、对错和累计错误数，以及 L16 的错误上界。',
        try: '① 用"一个 expert 完美"的预设跑 Majority vote：完美专家始终存活，学习者错误数不超过 $\\log_2 4=2$。② 换成"没有完美 expert"的预设：Majority vote 的前提（有完美专家）不成立了——这次运行里第 2 次犯错后专家池就空了，之后算法无法预测（$\\log_2n$ 界在这个 10 天的例子里碰巧没被突破，但已经没有保证）。改用 Halving，比较学习者错误数 $M$ 和最好专家的 $m$，看读数里的 $(m+\\log_2 n)/\\log_2(4/3)$ 界。' },
    ],
    compare: [
      { t: 'table', head: ['算法', '假设', '更新', '错误界'], rows: [
        ['Majority vote', '有完美专家', '删除错的专家', '$\\log_2n$'],
        ['Halving', '无', '错的 $w\\leftarrow w/2$', '$\\frac{m+\\log_2n}{\\log_2(4/3)}\\approx2.41(m+\\log_2n)$'],
        ['Weighted majority（c46）', '无', '错的 $w\\leftarrow(1-\\varepsilon)w$', '$2(1+\\varepsilon)m+\\frac{2\\ln n}{\\varepsilon}$（注意这里是自然对数 $\\ln$）'],
      ] },
      { t: 'exam', md: T`**Online learning vs batch learning:** In batch learning all training data are available at once and assumed i.i.d. from a fixed distribution; the goal is low risk on unseen data, analysed with tools such as Hoeffding's inequality and VC dimension. In online learning (learning with expert advice) the learner predicts round by round, then sees the outcome; outcomes can be arbitrary or even adversarial, with no i.i.d. assumption. Performance is measured by the cumulative number of mistakes $M$ compared with the best expert's $m$, with bounds depending on the number of experts.` },
    ],
    pitfalls: [
      ['Online learning 假设数据 i.i.d.', '不假设，结果可以是对抗性的（L16 p7）。'],
      ['Halving 删除犯错的专家', '只是权重减半。'],
      ['Majority 的界和专家数线性相关', '只是 $\\log_2n$。'],
      ['学习者能比最好的专家好得多', '界里有 $m$：最坏情况下跟最好专家同一量级。'],
    ],
    quiz: [
      { type: 'num', q: '64 个专家，至少一个从不出错。Majority vote 最多错几次？', answer: 6, explain: T`majority vote（多数投票）在有完美专家时的错误界是 $M\le\log_2n$，这里专家数 $n=64$。理由：学习者每错一次，说明存活专家里多数错了，至少一半被删掉；完美专家永远不被删，至少剩 1 个。64 每次减半到 1：$64\to32\to16\to8\to4\to2\to1$，共 6 次，即 $\log_264=6$（$2^6=64$）。所以**最多错 6 次**。` },
      { type: 'num', q: 'Halving：$m=3$，$n=16$。上界 $\\frac{m+\\log_2n}{\\log_2(4/3)}$ 约等于多少？（用 $1/\\log_2(4/3)\\approx2.41$）', answer: 16.87, tol: 0.06, explain: T`把题目的数代进 halving（减半算法）的界 $\frac{m+\log_2n}{\log_2(4/3)}$：$m=3$ 是最好专家犯错的次数，$n=16$ 是专家个数，$\log_216=4$（因为 $2^4=16$）。分子 $3+4=7$。除以 $\log_2(4/3)$ 就是乘 $2.41$：$7\times2.41=16.87$，即学习者最多错约 16.9 次。易错点：**$\log_2n$ 是 4 而不是 16**，以及别漏了分子里的 $m$。` },
      { type: 'mc', q: 'Majority vote 的证明用的 potential function 是：', options: ['总权重', '存活专家数 $|E|$', '学习者错误数', '最好专家的错误数'], answer: 1, explain: T`potential function（势函数）是证明里用的一个量：学习者每错一次它就按比例缩小，但它又有下界。majority vote 里这个量是**存活专家数 $|E|$**：每错一次至少减半，错 $M$ 次后 $|E|\le n/2^M$；完美专家永不被删，所以 $|E|\ge1$；两边夹起来得 $2^M\le n$，即 $M\le\log_2n$。"总权重"是 halving 的势函数——majority 里错的专家直接删除，根本没有权重。L16 p6。` },
      { type: 'show', q: '（英文）Why does majority vote make at most $\\log_2 n$ mistakes when one expert is perfect?', answer: T`Each time the learner errs, the majority of the surviving experts erred, so at least half of them are removed. After $M$ mistakes at most $n/2^M$ experts survive. The perfect expert is never removed, so at least one survives: $1\le n/2^M$, giving $M\le\log_2n$.`, qzh: T`当有一个专家（expert）完全正确时，为什么多数投票（majority vote）最多犯 $\log_2 n$ 次错误？`, azh: T`学习器（learner）每犯一次错，说明存活专家中的多数都错了，所以至少有一半被淘汰。犯 $M$ 次错之后，最多剩下 $n/2^M$ 个专家。完美的专家永远不会被淘汰，所以至少剩一个：$1\le n/2^M$，从而 $M\le\log_2n$。` },
      { type: 'show', q: '（英文）Sketch why halving satisfies $M\\le\\frac{m+\\log_2n}{\\log_2(4/3)}$.', answer: T`Use the total weight $W$ as a potential. Initially $W=n$. When the learner errs, at least half of the weight was on wrong experts and is halved, so $W$ shrinks to at most $\frac34$ of its value: after $M$ mistakes $W\le n(3/4)^M$. The best expert errs $m$ times, so its weight is $(1/2)^m\le W$. Hence $(1/2)^m\le n(3/4)^M$; taking $\log_2$ gives $-m\le\log_2n+M\log_2(3/4)$, i.e. $M\le\frac{m+\log_2n}{\log_2(4/3)}\approx2.41(m+\log_2n)$.`, qzh: T`简要说明为什么减半算法（halving）满足 $M\le\frac{m+\log_2n}{\log_2(4/3)}$。`, azh: T`把总权重 $W$ 当作势函数（potential）。初始 $W=n$。学习器犯错时，至少一半的权重在错误的专家身上，这部分被减半，所以 $W$ 至多缩小到原来的 $\frac34$：犯 $M$ 次错后 $W\le n(3/4)^M$。最好的专家犯了 $m$ 次错，所以它的权重 $(1/2)^m\le W$。因此 $(1/2)^m\le n(3/4)^M$；两边取 $\log_2$ 得 $-m\le\log_2n+M\log_2(3/4)$，即 $M\le\frac{m+\log_2n}{\log_2(4/3)}\approx2.41(m+\log_2n)$。` },
    ],
  });

  /* =====================================================================
   * c46 · Weighted majority、probabilistic experts（L16 p15–p27）
   * ===================================================================== */
  add({
    id: 'c46', week: 'W8', lec: 'L16', pages: 'L16 p15–p27', star: 1,
    keyEn: [
      T`Weighted majority: multiply each wrong expert's weight by $(1-\varepsilon)$; $M\le2(1+\varepsilon)m+\frac{2\ln n}{\varepsilon}$ for $\varepsilon\in(0,0.5]$. Smaller $\varepsilon$ brings the factor on $m$ towards 2 but enlarges the $\ln n$ term.`,
      T`No deterministic algorithm beats the factor 2: with two always-disagreeing experts an adversary makes the learner wrong every round ($M=T$), while the better expert has $m\le T/2$.`,
      T`Probabilistic experts: follow expert $i$ with probability $w_i/W$ and update $w_i\leftarrow(1-\varepsilon)^{\ell_i}w_i$ for losses in $[0,1]$; expected loss $L\le\frac{\ln n}{\varepsilon}+(1+\varepsilon)L^*$ for $\varepsilon\in(0,0.5]$.`,
      T`Regret $=L-L^*$: the learner's total loss minus the best expert's (in hindsight). Worksheet 9: $n=3$, $\varepsilon=0.1$, $L=4$, $L^*=2$ ⇒ regret $2$; the bound gives $\frac{\ln3}{0.1}+1.1\times2\approx13.2$, larger than the trivial bound $10$ (10 rounds, losses in $[0,1]$), so it is vacuous there.`,
    ],
    keyZh: [
      T`加权多数（weighted majority）把"减半"换成乘 $(1-\varepsilon)$。$\varepsilon$ 越小，$m$ 前的系数越接近 2，但 $\ln n/\varepsilon$ 那项越大；$\varepsilon$ 大则相反，要权衡。`,
      T`对手论证（adversarial argument）说明确定性算法的系数 2 改不了：两个专家永远意见相反，对手每轮都让学习者错（$M=T$），而较好的专家最多错一半，于是 $M\ge2m$。`,
      T`随机化专家（probabilistic experts）：按权重比例随机挑一个专家跟，损失可以是 0 到 1 的小数，每个专家都按自己的损失降权。期望损失界里 $L^*$ 的系数降到 $1+\varepsilon$。`,
      T`遗憾（regret）= 学习者总损失减去事后最好专家的总损失。Worksheet 9 里 regret 是 2；定理的界 13.2 比"10 轮最多损失 10"还大，轮数少时这个界没有提供信息（vacuous）。`,
    ],
    title: 'Weighted majority、probabilistic experts', en: 'Weighted majority (1−ε) and probabilistic experts',
    summary: '把 halving 的"减半"推广成"乘 $1-\\varepsilon$"：$M\\le2(1+\\varepsilon)m+\\frac{2\\ln n}{\\varepsilon}$，对 $m$ 的系数接近 2（确定性算法不可能更好）。再随机化：按权重概率选一个专家跟，损失在 $[0,1]$，期望总损失 $L\\le\\frac{\\ln n}{\\varepsilon}+(1+\\varepsilon)L^*$——系数接近 1。',
    prereq: ['c45'],
    symbols: [
      [T`$\varepsilon$`, T`降权幅度，$\varepsilon\in(0,0.5]$`],
      [T`$\ell_i^{(t)}\in[0,1]$`, T`专家 $i$ 在第 $t$ 轮的损失`],
      [T`$L^*$`, T`最好专家的总损失`],
      [T`$L-L^*$`, T`regret（遗憾）：学习者总损失比事后最好的专家多多少`],
      [T`$L_t$, $L=\sum_tL_t$`, T`学习者第 $t$ 轮的期望损失、总期望损失`],
      [T`$\ln$`, T`自然对数（本章的 log 都是 $\log_e$；c45 的 majority / halving 用 $\log_2$）`],
      [T`$w_i,\ W=\sum_iw_i$`, T`专家 $i$ 的权重、所有专家的总权重`],
      [T`$t,\ T$`, T`第 $t$ 轮、总轮数`],
      [T`$n$`, T`专家个数`],
    ],
    goals: [
      '写出 weighted majority 的更新和错误界，解释 $\\varepsilon$ 的权衡',
      '说出为什么确定性算法对 $m$ 的系数不能低于 2（L16 p19）',
      '写出 probabilistic experts 的更新、选择概率和期望损失界',
    ],
    types: ['T12'],
    notExam: 'L16 p16 的两个不等式工具和 p24–p25 的证明了解思路即可（p23 的界本身要会）；p26 的应用列表了解即可。',
    what: [
      { t: 'h3', text: '① 把"减半"推广成"乘 $1-\\varepsilon$"（L16 p15–p17）' },
      T`**Weighted majority with $1-\varepsilon$**（L16 p17）：和 halving 一样，但错的专家 $w_i\leftarrow(1-\varepsilon)w_i$。`,
      T`走一天：3 个专家权重都是 1，$\varepsilon=0.5$，预测 $(+,+,-)$，真实 $-$。加权投票 $+$ 得 2、$-$ 得 1 ⇒ 学习者预测 $+$，错了；两个错的专家乘 $0.5$ ⇒ 权重 $(0.5,0.5,1)$。（$\varepsilon=0.5$ 就是 c45 的 halving。）`,
      { t: 'h3', text: '② 错误界（L16 p18）' },
      T`界的形状和 halving 一样：最好专家的错误数乘一个系数，再加上专家个数的对数。来历也一样：学习者每错一次，至少一半的权重乘上 $(1-\varepsilon)$，总权重乘的因子不超过 $\frac12+\frac12(1-\varepsilon)=1-\frac\varepsilon2$；最好的专家错 $m$ 次后还剩 $(1-\varepsilon)^m$。两边夹起来、取对数，就是：`,
      { t: 'math', tex: T`M\le2(1+\varepsilon)m+\frac{2\ln n}{\varepsilon}\qquad(\text{L16 p18})` },
      T`**$\varepsilon$ 的权衡**：$\varepsilon$ 小 ⇒ 降权温和，$m$ 的系数接近 2，但要更多轮才能把坏专家压下去，$\frac{\ln n}{\varepsilon}$ 项变大；$\varepsilon$ 大则相反。`,
      { t: 'h3', text: '③ 为什么系数 2 改不了：对手论证（L16 p19–p20）' },
      T`**Lower bound（下界）**（L16 p19）：为什么确定性算法对 $m$ 的系数 2 改不了？**adversarial argument（对手论证）**：假想一个专门和你作对、能看到你算法的"对手"来决定每天的真实结果。取 2 个永远意见相反的专家（一个说 $+$，另一个说 $-$）。确定性算法的预测对手能提前算出来，于是对手每天都把真实结果设成**和学习者相反**——学习者天天错，$T$ 天错 $M=T$ 次。两个专家每天恰好一对一错，错误总数是 $T$，较好的那个最多错 $m\le T/2$ 次。所以 $M\ge2m$。课件用"$E_1$ 奇数天对、$E_2$ 偶数天对"来演示这个结论：系数 2 不能再改进（$2(1+\varepsilon)$ 已经很接近）。`,
      { t: 'h3', text: '④ 随机化：probabilistic experts（L16 p21–p23）' },
      T`**为什么随机化有用？** 确定性算法的预测可以被对手预判并专门针对（p19 的例子）；随机选择让对手无法确定你会跟谁。`,
      T`随机化之后，损失也不必再是"错了记 1"，可以是 0 到 1 之间的小数（比如预测概率差多少）。学习者按权重比例**随机**挑一个专家跟，对手就无法提前算准你会跟谁。更新也改成覆盖**所有**专家：损失越大，乘的 $(1-\varepsilon)^{\ell_i}$ 越小（损失 0 的不降权）。这样期望总损失对最好专家的系数能从 2 降到 $1+\varepsilon$：`,
      T`**Probabilistic experts**（L16 p22）：损失 $\ell_i^{(t)}\in[0,1]$；以概率 $w_i/W$ 随机选专家 $i$ 跟着预测；**每个**专家都更新 $w_i\leftarrow(1-\varepsilon)^{\ell_i^{(t)}}w_i$。`,
      { t: 'math', tex: T`L\le\frac{\ln n}{\varepsilon}+(1+\varepsilon)L^*\qquad(\text{L16 p23})` },
      T`**Regret（遗憾）** $=L-L^*$：学习者的总损失比事后看来最好的那个专家多出多少（Worksheet 9 用这个词；c47 bandits 的 cumulative regret 是同一个想法，只是换成奖励）。上面的界移项就是 regret 的界：$L-L^*\le\frac{\ln n}{\varepsilon}+\varepsilon L^*$。`,
      T`和 bandits 的联系（L16 p27）：如果每轮只能看到**自己选的那个专家**的损失，就是下一周的 multi-armed bandit（c47）。`,
    ],
    why: [
      T`随机化打破了"对手总能让多数派犯错"的局面，对最好专家损失的系数从 2 降到 $1+\varepsilon$。这个"乘性权重 + 随机选择"正是下一周 bandits（只能看到所选专家的奖励）的出发点（L16 p27）。`,
    ],
    intuition: [
      { t: 'think', q: 'Weighted majority 的界相比 halving，对 $m$ 的依赖改进在哪？（L16 p18 的问题）', a: T`看 $m$ 前面的系数：halving 是 $2.4$（整条界是 $2.4(m+\log_2n)$），weighted majority 是 $2(1+\varepsilon)$，$\varepsilon$ 小时接近 $2$。更新规则上，halving 就是 $\varepsilon=1/2$（错的专家乘 $1-0.5=1/2$）；但两条界是两种证法：把 $\varepsilon=0.5$ 代进 weighted majority 得 $3m+4\ln n$；把底数统一，$4\ln n\approx2.77\log_2n$，两项都比 halving 那条 $\approx2.41(m+\log_2n)$ 大，所以更松。"接近 $2m$"说的是 $\varepsilon$ 很小的时候。` },
      { t: 'story', title: '乘性权重无处不在', md: 'Freund 和 Schapire 1997 年的 Hedge 算法就是本章的 probabilistic experts，它也是 AdaBoost 的理论基础。Arora、Hazan、Kale 2012 年的综述把 multiplicative weights（乘性权重）更新称为一种"元算法"，在博弈论、线性规划、在线学习里反复出现。（L16 p26 的应用列表来自 Kale 2007 年的博士论文。）' },
    ],
    math: [
      { t: 'h3', text: 'Weighted majority 的证明思路（L16 p18）' },
      { t: 'steps', items: [
        T`学习者错 ⇒ 至少一半权重乘 $(1-\varepsilon)$ ⇒ $W\le n(1-\varepsilon/2)^M$。`,
        T`最好专家 $w=(1-\varepsilon)^m\le W$。`,
        T`取 ln：$m\ln(1-\varepsilon)\le\ln n+M\ln(1-\varepsilon/2)$；左边用 $\ln(1-\varepsilon)\ge-\varepsilon-\varepsilon^2$ 换成 $-m(\varepsilon+\varepsilon^2)$；右边用 $\ln(1-x)<-x$（取 $x=\varepsilon/2$）换成 $-M\varepsilon/2$。得到 $-m(\varepsilon+\varepsilon^2)\le\ln n-M\varepsilon/2$，移项 $M\varepsilon/2\le\ln n+m(\varepsilon+\varepsilon^2)$，两边乘 $2/\varepsilon$ 就是 $M\le2(1+\varepsilon)m+\frac{2\ln n}{\varepsilon}$。`,
      ] },
      { t: 'h3', text: 'Probabilistic experts 的证明思路（L16 p24–p25）' },
      T`第 $t$ 轮期望损失 $L_t=\sum_iw_i\ell_i/W$；$W(t+1)\le W(t)(1-\varepsilon L_t)$；$W(T)\le n\prod_t(1-\varepsilon L_t)$，又 $W(T)\ge(1-\varepsilon)^{L^*}$。取 ln 化简得界。`,
    ],
    fx: [
      {
        title: 'Weighted majority 的界', tex: T`M\le\htmlClass{fx-p1}{2(1+\varepsilon)}\,m+\htmlClass{fx-p2}{\frac{2\ln n}{\varepsilon}}`,
        parts: [
          { label: '2(1+ε)', note: '对最好专家错误数的系数；确定性算法的系数 2 改不了（L16 p19 的对手论证）。' },
          { label: '2ln n/ε', note: '"学会该信谁"的代价：专家越多、$\\varepsilon$ 越小，这部分越大。' },
        ],
      },
    ],
    example: [
      { t: 'h3', text: 'Worksheet 9 手算题（全解）' },
      T`题目：probabilistic experts，3 个专家，$\varepsilon=0.1$。10 轮后算法的累计损失是 4，事后最好的专家累计损失是 2。题目给了 $\ln0.1\approx-2.3$、$\ln2\approx0.7$、$\ln3\approx1.1$、$\ln4\approx1.4$，这里只用到 $\ln3$。`,
      { t: 'steps', items: [
        T`**(a) 证明思路**：用总权重 $W$ 当势函数。上界：用 $(1-\varepsilon)^\ell\le1-\varepsilon\ell$ 得每轮 $W(t+1)\le(1-\varepsilon L_t)W(t)$，所以 $W\le n\prod_t(1-\varepsilon L_t)$。下界：最好专家的权重 $(1-\varepsilon)^{L^*}\le W$。两边取 $\ln$，用 $\ln(1-x)\le-x$ 和 $-\ln(1-\varepsilon)\le\varepsilon+\varepsilon^2$ 化简，得 $L\le\frac{\ln n}{\varepsilon}+(1+\varepsilon)L^*$（见"数学定义"）。`,
        T`**(b) Regret** $=L-L^*=4-2=2$。`,
        T`**(c) 定理给的上界**：$\frac{\ln3}{0.1}+(1+0.1)\times2\approx\frac{1.1}{0.1}+2.2=11+2.2=13.2$（用精确的 $\ln3$ 是 13.19）。实际损失 4 在界内。`,
        T`**(d) 平凡上界**：每轮损失最多 1，10 轮最多 $10\times1=10$。定理给的 13.2 比 10 还大，所以在 $T=10$ 时这个界没有提供任何信息（vacuous）。原因是 $\frac{\ln n}{\varepsilon}=11$ 这一项不随轮数增长，轮数少时它一项就超过了 $T$。轮数多时界才有用：例如 100 轮、$L^*=20$，界 $=11+1.1\times20=33$，远小于 100。`,
      ] },
      { t: 'fade', title: '分步练习：代入界', plan: ['确定 $m$（或 $L^*$）、$n$、$\\varepsilon$', '代入公式', '比较 / 解释'], items: [
        { md: T`Weighted majority：$m=10$，$\ln n=4$，$\varepsilon=0.5$。`, steps: [
          { md: '已给出' }, { md: '$2(1.5)(10)+2(4)/0.5=30+16=46$' }, { md: '学习者最多错 46 次' },
        ] },
        { md: T`同样 $m=10$，$\ln n=4$，但 $\varepsilon=0.1$。`, steps: [
          { ask: '上界 = ?', answer: 102, show: T`最好专家那一项 $2(1+\varepsilon)m=2\times1.1\times10=22$；专家个数那一项 $2\ln n/\varepsilon=2\times4/0.1=80$；上界 $22+80=102$`, sg: 2 },
          { ask: '哪一项变大了？（1 = $m$ 项，2 = $\\ln n$ 项）', answer: 2, show: T`$2\ln n/\varepsilon$ 从 16 变成 80`, sg: 3 },
        ] },
        { md: T`Probabilistic experts：$\ln n=3$，$\varepsilon=0.5$，$L^*=20$。`, steps: [
          { ask: T`期望损失上界 $L\le?$`, answer: 36, show: '$3/0.5+1.5\\times20=6+30$', sg: 2 },
          { ask: T`某专家 $w=1$、损失 $\ell=0.5$，更新后 $w=(1-\varepsilon)^{\ell}=?$`, answer: 0.7071, tol: 0.002, show: T`$\varepsilon=0.5$ 时 $(1-\varepsilon)^{0.5}=0.5^{0.5}=\sqrt{0.5}\approx0.7071$（损失只有一半，就只乘"半次"）`, sg: 0 },
        ] },
      ] },
    ],
    viz: [
      { id: 'experts-sim', how: '同上一章的模拟器，这次选 Weighted Majority 并调 $\\beta=1-\\varepsilon$。',
        try: '把 $\\beta$ 从 0.5 调到 0.9（$\\varepsilon$ 从 0.5 到 0.1）：降权变温和，坏专家被压下去更慢；看学习者错误数和读数里的上界怎么变。' },
    ],
    compare: [
      { t: 'table', head: ['', 'Weighted majority', 'Probabilistic experts'], rows: [
        ['预测', '加权多数（确定性）', '按 $w_i/W$ 随机跟一个专家'],
        ['损失', '0/1 错误', '$\\ell\\in[0,1]$'],
        ['更新', '只更新错的：$\\times(1-\\varepsilon)$', '全部：$\\times(1-\\varepsilon)^{\\ell}$'],
        ['界', '$2(1+\\varepsilon)m+2\\ln n/\\varepsilon$', '$\\ln n/\\varepsilon+(1+\\varepsilon)L^*$（期望）'],
      ] },
    ],
    pitfalls: [
      ['确定性算法能把 $m$ 的系数降到 1', '不能，下界是 2（L16 p19）；要随机化。'],
      ['Probabilistic experts 只更新犯错的专家', '每个专家都按自己的损失更新。'],
      ['界里的 log 是以 2 为底', 'L16 p18 起用自然对数。'],
    ],
    quiz: [
      {
        type: 'mc', q: T`（平时小测原题）Weighted Majority with $n$ experts, best expert makes $m$ mistakes, learning rate $\epsilon>0$: $M\le2(1+\epsilon)m+\frac{2\ln n}{\epsilon}$. Assume $n\ge10^4$ and $m\le3$. Which statement is TRUE about the bound and the optimal choice of $\epsilon$?`,
        qzh: T`Weighted Majority 有 $n$ 个专家，最好的专家犯 $m$ 次错，学习率 $\epsilon>0$，算法错误次数的上界是 $M\le2(1+\epsilon)m+\frac{2\ln n}{\epsilon}$。设 $n\ge10^4$、$m\le3$。关于这个界和最优的 $\epsilon$，哪句话对？`,
        options: [
          T`Increasing $\epsilon$ always decreases $M$ until the bound becomes independent of $n$, hence taking $\epsilon$ very large is optimal.`,
          T`Letting $\epsilon\to0^+$ minimises the bound because the term $\frac{2\ln n}{\epsilon}$ becomes negligible compared with $2(1+\epsilon)m$.`,
          T`The bound is minimised at $\epsilon=\frac{\ln n}{m}$. For $n=10^4$ and $m=3$, this gives $\epsilon\approx3.07$.`,
          T`The bound is minimised (for $\epsilon>0$) at $\epsilon=\sqrt{\frac{\ln n}{m}}$; this gives $\epsilon\gtrsim1.75$. This choice balances the two terms $2(1+\epsilon)m$ and $\frac{2\ln n}{\epsilon}$.`,
        ],
        answer: 3,
        explain: T`界里有两项在拉扯：$2(1+\epsilon)m$ 随 $\epsilon$ 变大而变大，$\frac{2\ln n}{\epsilon}$ 随 $\epsilon$ 变大而变小，所以 $\epsilon$ 太大太小都不好（排除前两项；第二项还说反了，$\epsilon\to0$ 时 $\frac{2\ln n}{\epsilon}\to\infty$）。求最小值：对 $\epsilon$ 求导令其为 0，$2m-\frac{2\ln n}{\epsilon^2}=0$，得 **$\epsilon=\sqrt{\ln n/m}$**。代入 $n=10^4$、$m=3$：$\ln10^4=4\ln10\approx9.21$，$9.21/3\approx3.07$，开方 $\approx1.75$。第三个选项忘了开方，3.07 只是根号里面的数。（这题只是求这个式子在 $\epsilon>0$ 上的最小值；课件的证明只对 $\epsilon\le0.5$ 成立，所以 1.75 不能当成实际可用的学习率。）`,
      },
      { type: 'num', q: 'Weighted majority：$m=5$，$\\ln n=2$，$\\varepsilon=0.5$。上界？', answer: 23, explain: T`把数代进 weighted majority（加权多数）的错误界 $M\le2(1+\varepsilon)m+\frac{2\ln n}{\varepsilon}$。第一项用最好专家的错误数 $m=5$：$2\times(1+0.5)\times5=2\times1.5\times5=15$。第二项用专家个数，题目直接给了 $\ln n=2$：$2\times2/0.5=4/0.5=8$。上界 $15+8=23$，即学习者最多错 23 次。注意界里是自然对数 $\ln$，不要换成 $\log_2$。` },
      { type: 'num', q: 'Probabilistic experts：$\\ln n=1$，$\\varepsilon=0.25$，$L^*=8$。上界？', answer: 14, explain: T`probabilistic experts（随机化专家）的期望总损失界是 $L\le\frac{\ln n}{\varepsilon}+(1+\varepsilon)L^*$。题目给 $\ln n=1$、$\varepsilon=0.25$、最好专家的总损失 $L^*=8$。第一项 $1/0.25=4$；第二项 $(1+0.25)\times8=1.25\times8=10$；上界 $4+10=14$。和 weighted majority 比，$L^*$ 前的系数是 $1+\varepsilon$ 而不是 $2(1+\varepsilon)$，第一项也没有 2：随机选专家让对手无法预判你。` },
      { type: 'mc', q: 'L16 p19 的下界例子说明：', options: ['随机化没用', '确定性加权多数对 $m$ 的系数至少是 2', '专家越多越好', 'halving 是最优的'], answer: 1, explain: '对手让确定性学习者天天错：$M=T\\ge2m$。' },
      { type: 'show', q: '（英文）Why can no deterministic weighted-majority algorithm improve the factor 2 in front of $m$?', answer: T`Take two experts who always disagree. A deterministic learner's prediction is a fixed function of the history, so an adversary can always set the outcome to the opposite of it: the learner errs every round, $M=T$. In every round exactly one of the two experts is right, so their mistakes sum to $T$ and the better one makes $m\le T/2$. Hence $M\ge2m$ for every deterministic algorithm.`, qzh: '为什么任何确定性的加权多数（deterministic weighted-majority）算法都无法改进 $m$ 前面的系数 2？', azh: T`取两个总是意见相反的专家。确定性学习器的预测是历史的固定函数，所以对手（adversary）总能把结果设成与它的预测相反：学习器每一轮都犯错，$M=T$。每一轮两个专家中恰好有一个是对的，所以他们的错误次数之和为 $T$，较好的那个满足 $m\le T/2$。因此对任何确定性算法都有 $M\ge2m$。` },
      { type: 'show', q: '（英文）Describe the probabilistic experts algorithm and its guarantee.', answer: T`Each expert has weight $w_i$ (initially 1). Each round, follow expert $i$ with probability $w_i/W$, where $W=\sum_iw_i$; after the losses $\ell_i\in[0,1]$ are revealed, update every expert by $w_i\leftarrow w_i(1-\varepsilon)^{\ell_i}$. Its expected total loss satisfies $L\le\frac{\ln n}{\varepsilon}+(1+\varepsilon)L^*$, where $L^*$ is the best expert's loss: randomisation removes the adversary's ability to predict the learner and brings the factor in front of the best expert's loss down from 2 to $1+\varepsilon$.`, qzh: '描述概率专家算法（probabilistic experts algorithm）及其保证（guarantee）。', azh: T`每个专家有权重 $w_i$（初始为 1）。每一轮以概率 $w_i/W$ 跟随专家 $i$，其中 $W=\sum_iw_i$；损失 $\ell_i\in[0,1]$ 揭晓后，按 $w_i\leftarrow w_i(1-\varepsilon)^{\ell_i}$ 更新每个专家。它的期望总损失满足 $L\le\frac{\ln n}{\varepsilon}+(1+\varepsilon)L^*$，其中 $L^*$ 是最好专家的损失：随机化（randomisation）让对手无法预测学习器，把最好专家损失前面的系数从 2 降到 $1+\varepsilon$。` },
    ],
  });

  /* =====================================================================
   * r08 · W8 复习
   * ===================================================================== */
  SML.content.add(SML.review({
    id: 'r08', week: 'W8', title: 'W8 复习：评估与 Experts', en: 'Week 8 review',
    summary: '评估：会从混淆矩阵算指标、说清 precision vs recall、ROC/AUC；会描述 k-fold、bootstrap（0.632 的来历）、nested CV，知道特征选择要放在 CV 内部。Experts：三个算法的更新规则和错误界，会代入（T12）。',
    keypoints: [
      [T`Precision $TP/(TP+FP)$、recall $TP/(TP+FN)$、specificity $TN/(TN+FP)$、F1；此消彼长；ROC + AUC（0.5 随机、1 完美）；cost-sensitive loss。`, 'c42'],
      [T`Train/val/test 分工；k-fold（均值、方差除以 $k$）、LOOCV；0.632 bootstrap；nested CV；特征选择在 CV 内部。`, 'c43'],
      [T`$t$ 检验 $x=\frac{(\hat\mu_1-\hat\mu_2)\sqrt m}{\sqrt{\hat\sigma_1^2+\hat\sigma_2^2}}$ 与临界值比；单侧检验；error bars 是另一种（双侧）展示，明显重叠 ⇒ 看不出差异；样本要是独立研究单位。`, 'c44'],
      [T`Online 设定（对抗性结果）；majority：删错的，$M\le\log_2n$；halving：错的减半，$M\le\frac{m+\log_2n}{\log_2(4/3)}\approx2.41(m+\log_2n)$。`, 'c45'],
      [T`Weighted majority $\times(1-\varepsilon)$：$M\le2(1+\varepsilon)m+2\ln n/\varepsilon$（2 不可改进）；probabilistic：$L\le\ln n/\varepsilon+(1+\varepsilon)L^*$；regret $=L-L^*$，轮数少时界可能大于平凡上界 $T$（vacuous）。`, 'c46'],
    ],
    map: [
      { t: 'table', head: ['', 'Batch（W1–W7）', 'Online（本周 L16）'], rows: [
        ['数据假设', 'i.i.d.', '对抗性'],
        ['评估', 'CV、测试误差', '与最好专家比的错误数 $M-m$'],
        ['理论工具', 'Hoeffding、VC 维', 'potential function'],
      ] },
    ],
    recall: [
      { q: '混淆矩阵四个格子？precision、recall、specificity 公式？', a: 'TP/FP/FN/TN；$TP/(TP+FP)$、$TP/(TP+FN)$、$TN/(TN+FP)$。', ch: 'c42' },
      { q: 'ROC 怎么画？AUC 的参考值？', a: '扫阈值，每个阈值得一个 (specificity, sensitivity) 点，连成曲线（课件横轴 specificity；常见画法横轴 1−specificity，AUC 相同）；AUC 随机 0.5，完美 1。', ch: 'c42' },
      { q: 'Train / validation / test 各干什么？', a: '训练参数 / 选超参数 / 最后报告。', ch: 'c43' },
      { q: 'k-fold 的步骤和汇总公式？', a: T`分 $k$ 折，轮流留一折测试；$\hat\mu=\frac1k\sum M_i$，$\hat\sigma^2=\frac1k\sum(M_i-\hat\mu)^2$。`, ch: 'c43' },
      { q: '0.632 从哪来？', a: T`$1-(1-1/n)^n\to1-1/e\approx0.632$：样本至少被抽中一次的概率。`, ch: 'c43' },
      { q: '为什么特征选择要在 CV 内部？', a: '在全部数据上选会偷看验证数据，CV 估计过于乐观。', ch: 'c43' },
      { q: '两样本 t 检验的统计量和决策？', a: T`$x=\frac{(\hat\mu_1-\hat\mu_2)\sqrt m}{\sqrt{\hat\sigma_1^2+\hat\sigma_2^2}}$；单侧 $H_1:\mu_1>\mu_2$，$x>x_{1-\alpha,\nu}$ 才拒绝 $\mu_1=\mu_2$（临界值查表、题目会给；课件那道 9 折例题是 $\nu=16$、5% 单侧，临界值 1.75——不是每题都用 1.75）。`, ch: 'c44' },
      { q: 'Majority vote 的算法和界？', a: '存活专家多数票，删错的；$M\\le\\log_2n$（需要完美专家）。', ch: 'c45' },
      { q: 'Halving 的更新和界？', a: T`错的 $w\leftarrow w/2$；$M\le\frac{m+\log_2n}{\log_2(4/3)}\approx2.41(m+\log_2n)$。`, ch: 'c45' },
      { q: 'Weighted majority 的界？为什么 2 不能改进？', a: T`$2(1+\varepsilon)m+2\ln n/\varepsilon$。对手论证：两个专家永远意见相反，对手每天让确定性学习者错 ⇒ $M=T$，而较好的专家 $m\le T/2$，所以 $M\ge2m$。`, ch: 'c46' },
      { q: 'Probabilistic experts 的选择、更新、界？', a: T`按 $w_i/W$ 选；$w_i\leftarrow(1-\varepsilon)^{\ell_i}w_i$；$L\le\ln n/\varepsilon+(1+\varepsilon)L^*$。`, ch: 'c46' },
    ],
    formulas: [
      ['$P=\\frac{TP}{TP+FP}$，$R=\\frac{TP}{TP+FN}$，$F_1=\\frac{2PR}{P+R}$', '分类指标', 'L15 p7'],
      ['$1-(1-1/n)^n\\to0.632$', 'bootstrap', 'L15 p20'],
      ['$x=\\frac{(\\hat\\mu_1-\\hat\\mu_2)\\sqrt m}{\\sqrt{\\hat\\sigma_1^2+\\hat\\sigma_2^2}}$', 't 检验', 'L15 p27'],
      ['$\\hat\\mu\\pm\\frac{\\hat\\sigma}{\\sqrt m}x_{1-\\alpha/2,m-1}$', 'error bar', 'L15 p31'],
      ['$M\\le\\log_2n$', 'majority', 'L16 p6'],
      ['$M\\le\\frac{m+\\log_2n}{\\log_2(4/3)}$（$\\approx2.41(m+\\log_2n)$）', 'halving', 'L16 p12'],
      ['$M\\le2(1+\\varepsilon)m+\\frac{2\\ln n}{\\varepsilon}$', 'weighted majority', 'L16 p18'],
      ['$L\\le\\frac{\\ln n}{\\varepsilon}+(1+\\varepsilon)L^*$', 'probabilistic experts', 'L16 p23'],
    ],
    exam: [
      ['混淆矩阵指标、precision vs recall', '可能出简答', '[c42](#/c42)'],
      ['CV / bootstrap / 特征选择陷阱', 'T13 有特征选择陷阱卡片', '[T13](#/T13/predicted)'],
      ['Experts 错误界代数与解释', 'T12', '[T12](#/T12)'],
    ],
    quiz: [
      { type: 'num', q: 'TP=9，FP=3，FN=1，TN=7。F1？', answer: 0.8182, tol: 0.002, explain: 'precision $=9/(9+3)=0.75$，recall $=9/(9+1)=0.9$。F1 $=\\frac{2\\times0.75\\times0.9}{0.75+0.9}=\\frac{1.35}{1.65}\\approx0.818$。', qzh: 'TP=9，FP=3，FN=1，TN=7。F1 分数（F1 score）是多少？' },
      { type: 'num', q: '$n=4$ 的 bootstrap，某样本至少被抽中一次的概率？', answer: 0.6836, tol: 0.002, explain: '每次抽中它的概率 $1/4$，没抽中 $3/4=0.75$。抽 4 次都没中：$0.75^4$（$0.75^2=0.5625$，$0.5625^2\\approx0.3164$）。至少抽中一次：$1-0.3164=0.6836$。' },
      { type: 'num', q: '128 个专家，有一个完美。Majority 最多错几次？', answer: 7, explain: '$\\log_2128$。' },
      { type: 'num', q: 'Weighted majority：$m=4$，$\\ln n=3$，$\\varepsilon=0.25$。上界？', answer: 34, explain: '$2(1.25)(4)+6/0.25=10+24$。' },
      { type: 'mc', q: '下面哪个做法是**错的**？', options: ['用验证集选 $C$', '在每折训练部分做特征选择', '用测试集选超参数', '报告 k-fold 的方差'], answer: 2, explain: '测试集只用于最终报告。' },
    ],
    next: '下一周（W9）：bandits——只能看到自己选的那只"手臂"的奖励。UCB 计算（T2）是往年必考。',
  }));
})(window);
