/* T17 — PCA and autoencoders (L12 p22–p31): PCA by hand, AE vs PCA, short answers. */
(function (root) {
  'use strict';
  const T = String.raw;

  root.SML.content.add({
    id: 'T17',
    eyebrow: '题型 T17 · 今年 Quiz 3 Q1 · 往年 2/7 份（2016 Q11 PCA 手算 4 分）',
    title: 'PCA 与 Autoencoder：手算方差、概念对比',
    en: 'PCA by hand and autoencoders',
    chips: [
      { text: 'L12 p22–p31', href: '#/L12', cls: 'src' }, { text: 'Canvas Quiz 3.1', cls: 'hot' }, { text: '2016 Q11', cls: 'hot' }, { text: '2021 Q9', cls: 'hot' },
    ],
    lead: T`考法两种：① **概念**：autoencoder 是什么、bottleneck 的作用、线性 autoencoder 和 PCA 的关系（今年 Quiz 3 就考这个）、复杂非线性 autoencoder 会出什么问题、降维有什么用；② **小计算**：给 4–5 个二维点，算主成分方向上的方差和变换后的协方差（2016 Q11）。计算只用到"中心化 → 协方差矩阵 → 特征值"，数字都很小。`,
    blocks: [
      { t: 'h2', text: '1. 必背', id: 'core' },
      {
        t: 'table', head: ['概念', '一句话', '出处'], rows: [
          ['Autoencoder', '训练网络重建输入（目标 $\\mathbf y=\\bx$），中间有一层比输入窄的 bottleneck，逼它学到压缩表示；无监督', 'L12 p22–p25'],
          ['Undercomplete / overcomplete', 'bottleneck 比输入窄 / 宽；太宽的话网络可以直接复制输入，学不到有用的东西', 'L12 p26'],
          ['PCA', '中心化后找投影方差最大的单位方向 $\\mathbf p_1$：$\\Sigma_x\\mathbf p_1=\\lambda_1\\mathbf p_1$，取最大特征值；后续方向依次正交', 'L12 p28–p29'],
          ['主成分上的方差', '= 对应的特征值 $\\lambda$；变换后各维之间协方差为 0', 'L12 p29'],
          ['线性 AE vs PCA', '单隐藏层、线性激活、平方误差的 AE 学到的**子空间**与 PCA 相同，但基不一定正交、不按方差排序（"almost PCA"）', 'L12 p30'],
          ['用途', '数据可视化、聚类、压缩、去噪、作为预训练 / 特征提取', 'L12 p27、p31'],
        ],
      },

      { t: 'h2', text: '2. PCA 手算步骤', id: 'steps' },
      {
        t: 'steps', items: [
          T`**中心化**：算均值 $\bar\bx$，每个点减去它。`,
          T`**协方差矩阵**：$\Sigma=\frac{1}{n-1}\sum_i(\bx_i-\bar\bx)(\bx_i-\bar\bx)'$（题目若说除以 $n$ 就按题目）。二维时只要算三个数：$s_{11},s_{22},s_{12}$。`,
          T`**特征值**：$\det(\Sigma-\lambda\mathbf I)=0$。二维对称矩阵 $\begin{bmatrix}a&b\\b&a\end{bmatrix}$ 的特征值就是 $a+b$ 和 $a-b$，方向 $(1,1)/\sqrt2$ 和 $(1,-1)/\sqrt2$。`,
          T`**答题**：第一主成分方向 = 最大特征值的特征向量，沿它的方差 = 最大特征值；第二主成分同理；变换后两维的协方差 = 0。`,
          T`**不用特征值也行**（题目提示过）：把中心化后的点投影到候选方向 $z_i=\mathbf p'(\bx_i-\bar\bx)$，直接算 $\frac{1}{n-1}\sum z_i^2$。`,
        ],
      },
      {
        t: 'past', src: '2016 S2 exam Q11', marks: 4, topic: 'L12 p28–p29',
        q: T`In this question, you will be performing Principal Component Analysis (PCA) over the following 2D dataset: $\bx_1=[-1,0]'$, $\bx_2=[2,1]'$, $\bx_3=[1,2]'$, $\bx_4=[0,3]'$, $\bx_5=[3,4]'$. Show your working when answering parts 2 to 4.
1. Plot the dataset and draw the two PCA axes. [1 mark]
2. Compute the variance along the first PCA dimension. [1 mark]
3. Compute the variance along the second PCA dimension. [1 mark]
4. Compute the covariance between the two dimensions in the transformed space. [1 mark]

Hints: Recall that sample variance/covariance are normalised by $n-1$ where $n$ is the number of points. You should be able to answer this question without using the notion of eigenvalues/eigenvectors. However, if you wish to use eigenvectors note that before PCA eigenvalues of the covariance matrix of the centered data are 1 and 4.`,
        qzh: T`对二维数据 $\bx_1=[-1,0]'$、$\bx_2=[2,1]'$、$\bx_3=[1,2]'$、$\bx_4=[0,3]'$、$\bx_5=[3,4]'$ 做 PCA。1. 画出数据并画出两条 PCA 轴；2. 算第一主成分方向上的方差；3. 算第二主成分方向上的方差；4. 算变换后两维之间的协方差。提示：样本方差 / 协方差除以 $n-1$；不用特征值也能做；如果用，中心化数据协方差矩阵的特征值是 1 和 4。`,
        sol: [
          {
            t: 'steps', items: [
              T`均值 $\bar\bx=\big(\frac{-1+2+1+0+3}{5},\frac{0+1+2+3+4}{5}\big)=(1,2)$。中心化后：$(-2,-2),(1,-1),(0,0),(-1,1),(2,2)$。`,
              T`协方差（除以 $n-1=4$）：$s_{11}=\frac{4+1+0+1+4}{4}=2.5$，$s_{22}=2.5$，$s_{12}=\frac{4-1+0-1+4}{4}=1.5$。$\Sigma=\begin{bmatrix}2.5&1.5\\1.5&2.5\end{bmatrix}$，特征值 $2.5+1.5=4$、$2.5-1.5=1$，与提示一致。`,
              T`**第 1 问**：两条轴都过均值 $(1,2)$；第一主成分沿 $(1,1)/\sqrt2$（斜率 1 的直线 $y=x+1$），第二主成分沿 $(1,-1)/\sqrt2$（斜率 $-1$ 的直线 $y=-x+3$）。五个点里 $\bx_1,\bx_3,\bx_5$ 正好在第一条轴上。`,
              T`**第 2 问**：投影 $z_1=\frac{(x-1)+(y-2)}{\sqrt2}$：$-2\sqrt2,0,0,0,2\sqrt2$。方差 $=\frac{8+0+0+0+8}{4}=4$。`,
              T`**第 3 问**：投影 $z_2=\frac{(x-1)-(y-2)}{\sqrt2}$：$0,\sqrt2,0,-\sqrt2,0$。方差 $=\frac{0+2+0+2+0}{4}=1$。`,
              T`**第 4 问**：协方差 $=\frac14\sum_iz_{1i}z_{2i}=\frac14(0+0+0+0+0)=0$。PCA 的新坐标彼此不相关。`,
            ],
          },
          {
            t: 'exam', md: T`Mean $(1,2)$; centred data $(-2,-2),(1,-1),(0,0),(-1,1),(2,2)$; sample covariance $\begin{bmatrix}2.5&1.5\\1.5&2.5\end{bmatrix}$ with eigenvalues 4 and 1. The first PC is along $(1,1)/\sqrt2$ through $(1,2)$, the second along $(1,-1)/\sqrt2$. Projections on PC1: $(-2\sqrt2,0,0,0,2\sqrt2)$, variance $16/4=4$. Projections on PC2: $(0,\sqrt2,0,-\sqrt2,0)$, variance $4/4=1$. Covariance between the two transformed dimensions: $\frac14\sum z_{1i}z_{2i}=0$.`,
          },
        ],
        azh: T`均值 $(1,2)$；中心化后 $(-2,-2),(1,-1),(0,0),(-1,1),(2,2)$；样本协方差矩阵 $\begin{bmatrix}2.5&1.5\\1.5&2.5\end{bmatrix}$，特征值 4 和 1。第一主成分过 $(1,2)$、沿 $(1,1)/\sqrt2$，第二主成分沿 $(1,-1)/\sqrt2$。在第一主成分上的投影 $(-2\sqrt2,0,0,0,2\sqrt2)$，方差 $16/4=4$；在第二主成分上 $(0,\sqrt2,0,-\sqrt2,0)$，方差 $4/4=1$；两维之间协方差 $0$。`,
      },

      { t: 'h2', text: '3. 今年的题：Canvas Quiz 3 Q1', id: 'quiz' },
      { t: 'canvasQuiz', pick: ['3.1'] },

      { t: 'h2', text: '4. 往年原题（先自己写，再看答案）', id: 'past' },
      { t: 'examqPick', picks: [['c37', '2021 Q9'], ['c37', '2016 S2 Q1.11'], ['c37', '2017 S2 Q10(c)']] },

      { t: 'h2', text: '5. 易错点', id: 'pitfalls' },
      {
        t: 'table', head: ['错误', '正确'], rows: [
          ['PCA 不用中心化', '必须先减均值（L12 p29）'],
          ['取最小特征值的方向', '第一主成分取**最大**特征值，沿它的方差最大'],
          ['线性 AE 和 PCA 学到同一组基', '只是同一个**子空间**；AE 的基不一定正交、不按方差排序'],
          ['bottleneck 越宽越好', '比输入宽（overcomplete）时网络能直接复制输入，学不到压缩表示'],
          ['主成分方向上的方差要另外算', '直接等于特征值；变换后各维协方差为 0'],
        ],
      },
      {
        t: 'quiz', items: [
          { q: '协方差矩阵 $\\begin{bmatrix}3&1\\\\1&3\\end{bmatrix}$。第一主成分方向上的方差？', type: 'num', answer: 4, explain: '形如 $\\begin{bmatrix}a&b\\\\b&a\\end{bmatrix}$，特征值 $a\\pm b=4,2$，取大的 4，方向 $(1,1)/\\sqrt2$。' },
          { q: '特征值 6、3、1。只保留第一主成分，保留了多少比例的方差？', type: 'num', answer: 0.6, explain: '$6/(6+3+1)=0.6$。' },
          {
            q: '（英文）What can go wrong if an autoencoder has a very flexible non-linear encoder/decoder or a bottleneck that is too wide?', type: 'show',
            answerText: 'It can learn (close to) the identity mapping or memorise the training data, reconstructing perfectly without learning a useful compressed representation of the structure in the data.',
            explain: '2021 Q9 和 L12 p26 的 overcomplete 讨论；需要限制 bottleneck 宽度或加正则化。',
          },
        ],
      },
    ],
  });
})(window);
