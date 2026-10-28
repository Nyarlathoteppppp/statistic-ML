/* T15 — regularisation, bias–variance, model selection and evaluation (L05, L15). */
(function (root) {
  'use strict';
  const T = String.raw;

  root.SML.content.add({
    id: 'T15',
    eyebrow: '题型 T15 · 今年 Quiz 2 Q1 · 往年简答 3/7 份（2017 一份就 6 分）',
    title: '正则化、bias-variance、模型选择与评估',
    en: 'Regularisation, bias–variance, model selection, cross-validation',
    chips: [
      { text: 'L05 p3–p40', href: '#/L05', cls: 'src' }, { text: 'L15 p7–p30', href: '#/L15', cls: 'src' },
      { text: 'Canvas Quiz 2.1', cls: 'hot' }, { text: '2017 Q1–Q2', cls: 'hot' }, { text: '2021 Q6, Q8, Q13a', cls: 'hot' },
    ],
    lead: T`这一类几乎全是 Section A 的简答（每问 1–5 分），问法很固定：**为什么要正则化**、**$\lambda$ 怎么选、为什么不能和 $\bw$ 一起训练**、**lasso 比 ridge 好在哪**、**为什么不能用训练误差选模型**、**bias 和 variance 怎么权衡**。另有两种小计算：判断哪些特征共线（Quiz 2.1），以及从混淆矩阵算 precision / recall（L15，今年讲过，往年没考）。答案背熟就能拿分。`,
    blocks: [
      { t: 'h2', text: '1. 怎么认出这道题', id: 'spot' },
      {
        t: 'table', head: ['题干里看到', '答题要点', '在哪练'], rows: [
          ['*regularisation*、*why*、*two problems*', '① ill-posed（共线 / 无关特征，$\\mathbf X\'\\mathbf X$ 不可逆）② overfitting', '第 3 节模板 A'],
          ['*set λ*、*cross-validation*、*held-out*', '在验证集 / 每折上比较不同 $\\lambda$，选验证误差最小的，再用全部训练数据重训', '模板 B'],
          ['*why not find λ like w*', '在训练数据上优化 $\\lambda$ 总会选 $\\lambda=0$（训练误差最小），等于不正则化', '模板 B'],
          ['*lasso vs ridge*', 'lasso 把部分权重压到恰好 0：稀疏、自动特征选择、可解释', '第 2 节'],
          ['*training likelihood / training error for model selection*', '复杂模型总能把训练误差压低，会选过拟合的模型', '模板 C'],
          ['*bias*、*variance*、*complexity*', '简单模型高 bias 低 variance；复杂模型反之', '模板 D'],
          ['*linear combination of the other features*', '找列之间的倍数 / 线性关系', '第 4 节'],
          ['*precision*、*recall*、*k-fold*、*nested*', '混淆矩阵公式、CV 流程', '第 5 节'],
        ],
      },

      { t: 'h2', text: '2. 必背的几个式子', id: 'core' },
      {
        t: 'table', head: ['量', '公式 / 结论', '出处'], rows: [
          ['正则化的三个作用', '避免 ill-conditioning（计算问题）、防止 overfitting、加入先验知识', 'L05 p3'],
          ['Ridge', '$\\min_\\bw\\|\\by-\\mathbf X\\bw\\|_2^2+\\lambda\\|\\bw\\|_2^2$，闭式解 $\\hat\\bw=(\\mathbf X\'\\mathbf X+\\lambda\\mathbf I)^{-1}\\mathbf X\'\\by$；加 $\\lambda\\mathbf I$ 后一定可逆', 'L05 p13–p14'],
          ['Lasso', '$\\min_\\bw\\|\\by-\\mathbf X\\bw\\|_2^2+\\lambda\\|\\bw\\|_1$；一般没有闭式解；解常在坐标轴上（部分 $w_j=0$）', 'L05 p17–p18'],
          ['正则化 = MAP', 'ridge ⇔ 零均值 Gaussian 先验；lasso ⇔ Laplace 先验', 'L05 p19'],
          ['Bias–variance', '$\\mathbb E[(Y-\\hat f)^2]=\\underbrace{(\\mathbb E[Y]-\\mathbb E[\\hat f])^2}_{\\text{bias}^2}+\\underbrace{\\mathrm{Var}[\\hat f]}_{\\text{variance}}+\\underbrace{\\mathrm{Var}[Y]}_{\\text{噪声，不可约}}$', 'L05 p29–p36'],
          ['模型选择', '用 held-out 验证集或 cross-validation 选模型 / 选 $\\lambda$', 'L05 p25–p26'],
          ['k-fold', '分成 $k$ 份，轮流 1 份测试、其余训练；$\\hat\\mu=\\frac1k\\sum M_i$，$\\hat\\sigma^2=\\frac1k\\sum(M_i-\\hat\\mu)^2$', 'L15 p18'],
          ['0.632 bootstrap', '有放回抽 $n$ 个训练，没抽到的测试；某个样本被抽到的概率 $1-(1-1/n)^n\\to1-1/e\\approx0.632$', 'L15 p19–p20'],
          ['Nested CV', '内层 CV 选超参数，外层 CV 用选出的超参数报告指标', 'L15 p21'],
          ['特征选择与 CV', '特征选择 / 降维必须放在每次划分的训练部分里做，在全数据上做会偷看验证集', 'L15 p22'],
        ],
      },

      { t: 'h2', text: '3. 四个答题模板', id: 'templates' },
      {
        t: 'exam', title: '模板 A：为什么要正则化（2017 Q1(a)）',
        md: T`(1) Ill-posed problems: with irrelevant or collinear features (or more features than examples), $\mathbf X'\mathbf X$ is singular, so least squares has no unique solution and the weights are unstable; the $\lambda\|\mathbf w\|^2$ penalty makes $\mathbf X'\mathbf X+\lambda\mathbf I$ invertible and picks the small-norm solution. (2) Overfitting: a flexible model can fit noise in the training data; penalising large weights restricts model complexity, trading a little bias for lower variance and better generalisation.`,
      },
      {
        t: 'exam', title: '模板 B：怎么用 CV 选 λ，为什么不能像 w 一样学（2017 Q2(a)(b)）',
        md: T`Choose a grid of candidate values (e.g. $\lambda\in\{10^{-3},\dots,10^{3}\}$). For each $\lambda$, train on the training folds and compute the error on the held-out fold; average over the $k$ folds. Pick the $\lambda$ with the lowest validation error, then retrain on all the training data with it. $\lambda$ cannot be learned together with $\mathbf w$ by minimising the training objective, because the penalty only adds to the training loss: the minimum would always be at $\lambda=0$, i.e. no regularisation.`,
      },
      {
        t: 'exam', title: '模板 C：为什么不能用训练误差 / 训练似然选模型（2021 Q6、2016 Q4.2）',
        md: T`More complex models can always fit the training data at least as well, so the training error (likelihood) keeps improving with complexity and would always select the most complex model, which overfits. Model selection must use data not used for fitting: a held-out validation set or cross-validation, which estimates the error on unseen data.`,
      },
      {
        t: 'exam', title: '模板 D：bias–variance trade-off',
        md: T`Simple models (e.g. low-degree polynomials, strong regularisation) have high bias and low variance: they underfit. Complex models have low bias and high variance: they fit the particular training sample, including noise, and overfit. Test error is $\text{bias}^2+\text{variance}+\text{noise}$, so the best model is at an intermediate complexity.`,
      },

      { t: 'h2', text: '4. 小计算：哪些特征共线（Quiz 2.1）', id: 'collinear' },
      {
        t: 'steps', items: [
          T`先两两比：一列是不是另一列的常数倍？逐行算比值，**全部相等**才是倍数。`,
          T`没有倍数关系时，再试 $x_k=a\,x_i+b\,x_j$：用前两行解出 $a,b$，再代入其余各行检查。`,
          T`有共线 ⇒ $\mathbf X$ 的列线性相关 ⇒ $\mathbf X'\mathbf X$ 奇异，最小二乘解不唯一 ⇒ 用 ridge 或删掉多余特征。`,
          T`注意"$x_2$ 是 $x_3$ 的倍数"时，**两个都算**（$x_2=-2x_3$，$x_3=-0.5x_2$），而和它们方向不同的第三列不能由它们组合出来。`,
        ],
      },
      { t: 'canvasQuiz', pick: ['2.1'] },

      { t: 'h2', text: '5. 小计算：指标与 CV（L15，今年讲过）', id: 'eval' },
      T`L15 往年卷没出过计算，但今年是出卷老师自己讲的，公式简单，值得花 15 分钟。`,
      {
        t: 'table', head: ['指标', '公式（分母是关键）', '例：TP 30，FP 10，FN 20，TN 40'], rows: [
          ['Accuracy', '$(TP+TN)/n$', '$70/100=0.7$'],
          ['Precision', '$TP/(TP+FP)$：判成正的里面', '$30/40=0.75$'],
          ['Recall = Sensitivity', '$TP/(TP+FN)$：真正例里面', '$30/50=0.6$'],
          ['Specificity', '$TN/(TN+FP)$：真负例里面', '$40/50=0.8$'],
          ['$F_1$', '$\\frac{2PR}{P+R}$', '$\\frac{2(0.75)(0.6)}{1.35}=\\frac{0.9}{1.35}\\approx0.667$'],
        ],
      },
      {
        t: 'steps', items: [
          T`**k-fold 汇总**：4 折错误率 $0.10,0.20,0.15,0.15$。$\hat\mu=0.60/4=0.15$；$\hat\sigma^2=\frac14(0.05^2+0.05^2+0+0)=0.00125$（课件除以 $k$）。`,
          T`**比较两个算法**（L15 p27–p30）：$x=\dfrac{(\hat\mu_1-\hat\mu_2)\sqrt m}{\sqrt{\hat\sigma_1^2+\hat\sigma_2^2}}$，与题目给的临界值比较。课件例 1：$x=\frac{0.2\times3}{\sqrt{7.3}}\approx0.22\le1.75$，不能拒绝"两者一样好"。`,
          T`**Nested CV 一句话**：inner CV picks the hyperparameters; outer CV reports the performance of the whole procedure with those hyperparameters, so the reported metric is not biased by tuning.`,
        ],
      },
      { t: 'note', md: '详细讲解和更多例子见 [c42 评估指标](#/c42)、[c43 CV](#/c43)、[c44 t 检验](#/c44)。' },

      { t: 'h2', text: '6. 往年原题（先自己写，再看答案）', id: 'past' },
      {
        t: 'examqPick', picks: [
          ['c16', '2017 S2 Q1(a)'], ['c16', '2017 S2 Q2(a)'], ['c16', '2017 S2 Q2(b)'],
          ['c17', '2017 S2 Q1(c)'], ['c17', '2021 Q13(a)'],
          ['c18', '2021 Q6'], ['c18', '2016 S2 Q4.1–4.2'], ['c18', '2017 S2 Q1(b)'], ['c19', '2021 Q8'],
        ],
      },

      { t: 'h2', text: '7. 易错点', id: 'pitfalls' },
      {
        t: 'table', head: ['错误', '正确'], rows: [
          ['正则化能降低训练误差', '正则化通常**提高**训练误差，换来更低的测试误差'],
          ['$\\lambda$ 越大越好', '太大会欠拟合（$\\hat\\bw\\to\\mathbf 0$），要用 CV 选'],
          ['在测试集上选 $\\lambda$', '在验证集 / 内层 CV 上选；测试集只用来最后报告'],
          ['先在全部数据上做特征选择 / PCA，再 CV', '必须放在每次划分的训练部分里（L15 p22）'],
          ['ridge 会把权重压到 0', 'ridge 只缩小权重；压到恰好 0 的是 lasso'],
          ['precision 的分母是真正例', 'precision 除以**判成正的** $TP+FP$；recall 才除以真正例 $TP+FN$'],
        ],
      },
      {
        t: 'quiz', items: [
          { q: 'TP = 8，FP = 2，FN = 8，TN = 82。Recall？', type: 'num', answer: 0.5, explain: 'Recall $=TP/(TP+FN)=8/16=0.5$。（precision $=8/10=0.8$。）' },
          { q: '一维无截距 ridge：$\\bx\'\\bx=4$，$\\bx\'\\by=12$，$\\lambda=2$。$w=?$', type: 'num', answer: 2, explain: '$w=\\bx\'\\by/(\\bx\'\\bx+\\lambda)=12/6=2$；不加正则时是 $12/4=3$。' },
          {
            q: '模型的训练误差很低、验证误差很高。最可能的情况和对策？', type: 'mc',
            options: ['高 bias，增加模型复杂度', '高 variance（过拟合），加大正则化或简化模型', '数据噪声为 0', '应该改用训练误差选模型'], answer: 1,
            explain: '训练好、验证差 = 过拟合 = 高 variance。加大 $\\lambda$、减少特征或用更简单的模型。',
          },
          {
            q: '（英文）Why is lasso said to perform feature selection?', type: 'show',
            answerText: 'The $L_1$ penalty drives some weights exactly to zero (the constraint region has corners on the axes), so those features are removed from the model.',
            explain: 'L05 p17–p18。ridge 的 $L_2$ 球是圆的，只把权重缩小，不会恰好为 0。',
          },
        ],
      },
    ],
  });
})(window);
