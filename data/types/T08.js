/* T8 — Kernels: validity proofs, feature maps, XOR (L03 p20–p25, L09 p16–p36, WK06). */
(function (root) {
  'use strict';
  const T = String.raw;

  root.SML.content.add({
    id: 'T08',
    eyebrow: '题型 T8 · 证明题 12 分 / 设计题 10 分',
    title: 'Kernel：合法性证明、特征映射、XOR',
    en: 'Valid kernels, explicit feature maps, making XOR separable',
    chips: [
      { text: 'L09 p21–p35', href: '#/L09', cls: 'src' }, { text: 'L03 p20–p25', href: '#/L03', cls: 'src' }, { text: 'WK06', cls: 'src' },
      { text: '2025 practice Q2', cls: 'hot' }, { text: '2021 exam Q15', cls: 'hot' },
    ],
    lead: '三种考法：**证明某个函数是合法的 kernel**、**写出 kernel 对应的特征映射 $\\varphi$**、**设计特征变换让 XOR 线性可分**。证明只有两条路：构造 $\\varphi$，或者用组合规则。',
    blocks: [
      { t: 'h2', text: '1. 什么是合法的 kernel', id: 'def' },
      {
        t: 'table', head: ['判定方法', '内容', '出处'], rows: [
          ['定义（构造 $\\varphi$）', '存在特征映射 $\\varphi$ 使 $K(\\bu,\\bv)=\\varphi(\\bu)\'\\varphi(\\bv)$', 'L09 p21'],
          ['组合规则', '若 $K_1,K_2$ 合法、$c>0$、$f$ 是任意实函数，则 $K_1+K_2$、$K_1K_2$、$cK_1$、$f(\\bu)K_1(\\bu,\\bv)f(\\bv)$ 都合法', 'L09 p33'],
          ['Mercer', '对**任意**有限点集，Gram 矩阵 $M_{ij}=K(\\bx_i,\\bx_j)$ 都是半正定（PSD：对任意向量 $\\mathbf c$ 都有 $\\mathbf c^\\top M\\mathbf c\\ge0$；只有一个点时 $M$ 是一个数，它必须 $\\ge0$）', 'L09 p35'],
        ],
      },
      {
        t: 'warn', md: '"看起来像相似度"不等于合法 kernel（L09 p36）。只验证一个数据集的 Gram 矩阵 PSD 也不够，必须对所有点集成立。反过来，**找到一个点集让 Gram 矩阵不是 PSD，就证明了不合法**（例如对角线出现负数）。',
      },

      { t: 'h2', text: '2. 证明题模板', id: 'proof' },
      {
        t: 'past', src: '2021 S1 exam Q15', marks: 12, topic: 'L09 p21, p33',
        q: 'If $k_1(\\mathbf a,\\mathbf a\')$ and $k_2(\\mathbf b,\\mathbf b\')$ are both valid kernels over vector valued inputs of size $d_1$ and $d_2$ respectively, prove that $k_3\\left(\\begin{bmatrix}\\mathbf a\\\\\\mathbf b\\end{bmatrix},\\begin{bmatrix}\\mathbf a\'\\\\\\mathbf b\'\\end{bmatrix}\\right)=k_1(\\mathbf a,\\mathbf a\')+k_2(\\mathbf b,\\mathbf b\')$ is also a valid kernel over vectors of size $d_1+d_2$. (Prime means "prime", not transpose; $[\\mathbf a;\\mathbf b]$ is concatenation.)',
        sol: [
          '（注意：这道题里 $\\mathbf a\'$ 的撇表示"另一个输入 $\\mathbf a\'$"，不是转置——本题的转置一律写成 $^\\top$。本页其他地方 $\\bu\'\\bv$ 的撇仍是转置 = 点积。）',
          '思路：$k_1,k_2$ 合法 ⇒ 各有特征映射 $\\varphi_1,\\varphi_2$。把两个特征**拼接**起来，拼接向量的点积 = 两部分点积之和——点积只把**同一位置**的分量相乘再相加，前半段对前半段、后半段对后半段，没有交叉项。例：$[p,q,r]^\\top[p\',q\',r\']=pp\'+qq\'+rr\'$，前两项是 $\\varphi_1$ 部分的点积，最后一项是 $\\varphi_2$ 部分的点积。',
          {
            t: 'exam', md: T`Since $k_1$ and $k_2$ are valid kernels, there exist feature maps $\varphi_1,\varphi_2$ with $k_1(\mathbf a,\mathbf a')=\varphi_1(\mathbf a)^\top\varphi_1(\mathbf a')$ and $k_2(\mathbf b,\mathbf b')=\varphi_2(\mathbf b)^\top\varphi_2(\mathbf b')$.
Define, for $\mathbf x=[\mathbf a;\mathbf b]\in\mathbb R^{d_1+d_2}$, the concatenated feature map $\varphi_3(\mathbf x)=\begin{bmatrix}\varphi_1(\mathbf a)\\ \varphi_2(\mathbf b)\end{bmatrix}$. Then
$$\varphi_3(\mathbf x)^\top\varphi_3(\mathbf x')=\varphi_1(\mathbf a)^\top\varphi_1(\mathbf a')+\varphi_2(\mathbf b)^\top\varphi_2(\mathbf b')=k_1(\mathbf a,\mathbf a')+k_2(\mathbf b,\mathbf b')=k_3(\mathbf x,\mathbf x').$$
So $k_3$ is an inner product in the feature space of $\varphi_3$ and is therefore a valid kernel.`,
          },
          {
            t: 'deep', title: '另一种写法：用组合规则（Mercer / PSD）', blocks: [
              '$\\tilde k_1(\\mathbf x,\\mathbf x\')=k_1(\\mathbf a,\\mathbf a\')$ 只看 $\\mathbf x$ 的前 $d_1$ 维，它对应特征映射 $\\varphi_1(\\mathbf a)$，所以在 $\\mathbb R^{d_1+d_2}$ 上也合法；同理 $\\tilde k_2$。合法 kernel 之和合法（L09 p33），所以 $k_3=\\tilde k_1+\\tilde k_2$ 合法。',
              '或者用 Mercer：任意点集上 $k_3$ 的 Gram 矩阵 $=G_1+G_2$，两个 PSD 矩阵之和对任意 $\\mathbf c$ 有 $\\mathbf c^\\top(G_1+G_2)\\mathbf c=\\mathbf c^\\top G_1\\mathbf c+\\mathbf c^\\top G_2\\mathbf c\\ge0$，仍然 PSD。',
            ],
          },
        ],
      },
      {
        t: 'past', src: 'Worksheet 6（同类练习）', marks: '—', topic: 'WK06, L09',
        q: 'Prove that $k(A_1,A_2)=|A_1\\cap A_2|$ is a valid kernel for subsets $A_1,A_2$ of a finite set $\\Omega$.',
        sol: [
          '构造指示向量：$\\Omega=\\{\\omega_1,\\dots,\\omega_N\\}$，$\\varphi(A)\\in\\{0,1\\}^N$，第 $j$ 维是 $\\mathbb 1[\\omega_j\\in A]$。两个指示向量的点积就是同时属于两个集合的元素个数。',
          { t: 'exam', md: T`Let $\Omega=\{\omega_1,\dots,\omega_N\}$ and define $\varphi(A)=(\mathbb 1[\omega_1\in A],\dots,\mathbb 1[\omega_N\in A])^\top$. Then $\varphi(A_1)^\top\varphi(A_2)=\sum_j \mathbb 1[\omega_j\in A_1]\mathbb 1[\omega_j\in A_2]=|A_1\cap A_2|$, so $k$ is an inner product of feature vectors and hence a valid kernel.` },
        ],
      },

      { t: 'h2', text: '3. 写出 kernel 的特征映射', id: 'phi' },
      {
        t: 'table', head: ['kernel', '特征映射 $\\varphi$', '出处'], rows: [
          ['$(u_1v_1+c)^2$（1 维）', '$\\varphi(x)=[x^2,\\ \\sqrt{2c}\\,x,\\ c]$（展开 $(uv+c)^2=u^2v^2+2c\\,uv+c^2$；中间项要拆成两边各 $\\sqrt{2c}$，因为 $\\sqrt{2c}\\cdot\\sqrt{2c}=2c$）', 'L09 p22'],
          ['$(\\bu\'\\bv)^2$，$m=2$', '$\\varphi(\\bu)=[u_1^2,\\ \\sqrt2\\,u_1u_2,\\ u_2^2]$', 'L09 p32'],
          ['$(\\bu\'\\bv+c)^d$（$d$ 为非负整数，$c\\ge0$）', '给每个向量加一维常数 $\\sqrt c$，再按 $c=0$ 展开成所有 $d$ 次单项式', 'L09 p32'],
          ['RBF $\\exp(-\\gamma\\|\\bu-\\bv\\|^2)$（$\\gamma>0$）', '$f(\\bu)=\\exp(-\\gamma\\|\\bu\\|^2)$。因为 $\\|\\bu-\\bv\\|^2=\\|\\bu\\|^2+\\|\\bv\\|^2-2\\bu\'\\bv$，原式 $=f(\\bu)\\exp(2\\gamma\\bu\'\\bv)f(\\bv)$；再用 $e^z=\\sum_d z^d/d!$ 展开，每项 $(\\bu\'\\bv)^d$ 都是多项式核，无穷多项 ⇒ 无穷维', 'L09 p34'],
        ],
      },
      {
        t: 'deep', title: '展开详解：$(\\bu\'\\bv)^2$ 的展开（考试可能让你写）', blocks: [
          { t: 'math', tex: T`(\bu'\bv)^2=(u_1v_1+u_2v_2)^2=u_1^2v_1^2+2u_1u_2v_1v_2+u_2^2v_2^2=\begin{bmatrix}u_1^2\\ \sqrt2u_1u_2\\ u_2^2\end{bmatrix}^{\top}\begin{bmatrix}v_1^2\\ \sqrt2v_1v_2\\ v_2^2\end{bmatrix}` },
          '为什么值得用 kernel：显式计算 $\\varphi(\\bu)$、$\\varphi(\\bv)$ 再求点积要好几步，直接算 $(\\bu\'\\bv)^2$ 只要一次点积加一次平方（L09 p22 的例子：9 次运算 vs 3 次）。维数越高差距越大，RBF 的 $\\varphi$ 是无穷维，根本没法显式计算。',
        ],
      },

      { t: 'h2', text: '4. XOR：设计特征变换', id: 'xor' },
      {
        t: 'past', src: '2025 S1 practice Q2', marks: 10, topic: 'L03 p24',
        q: 'Consider a 2-dimensional dataset with binary features and the XOR label: $(0,0,0)$, $(0,1,1)$, $(1,0,1)$, $(1,1,0)$ as $(x_1,x_2,y)$. Design a feature space transformation that would make the data linearly separable.',
        sol: [
          { t: 'h4', text: '解法一：课件 L03 p24 原样（最稳）' },
          '用到 4 个中心的距离作为特征：$\\varphi_i(\\bx)=\\|\\bx-\\bm z_i\\|$，$\\bm z_1=(0,0)$，$\\bm z_2=(0,1)$，$\\bm z_3=(1,0)$，$\\bm z_4=(1,1)$。取 $\\bw=(1,0,0,1)$（凑出来的：只用"到 $(0,0)$ 的距离 + 到 $(1,1)$ 的距离"）。距离怎么算：如 $(0,0)$ 到 $(1,1)$ 是 $\\sqrt{1^2+1^2}=\\sqrt2$，到 $(0,1)$ 是 1：',
          {
            t: 'table', head: ['$\\bx$', '$y$', '$\\varphi(\\bx)$', '$\\bw\'\\varphi(\\bx)$'], rows: [
              ['(0,0)', '0', '$(0,1,1,\\sqrt2)$', '$\\sqrt2\\approx1.41$'],
              ['(0,1)', '1', '$(1,0,\\sqrt2,1)$', '2'],
              ['(1,0)', '1', '$(1,\\sqrt2,0,1)$', '2'],
              ['(1,1)', '0', '$(\\sqrt2,1,1,0)$', '$\\sqrt2\\approx1.41$'],
            ],
          },
          '阈值取 1.7（任何 $\\sqrt2$ 到 2 之间的数都行）：$\\bw\'\\varphi(\\bx)>1.7$ 判为 1。四个点全部分对。',
          { t: 'fig', src: 'reference/pages/L03/p24.jpg', caption: 'L03 p24 原图', w: 560 },
          { t: 'h4', text: '解法二：加乘积特征（更短）' },
          '$\\varphi(\\bx)=(x_1,\\ x_2,\\ x_1x_2)$，取 $\\bw=(1,1,-2)$，$b=-0.5$（同样是凑的，要逐点验算）：$(0,0)\\to0+0-0-0.5=-0.5$，$(0,1)\\to0+1-0-0.5=0.5$，$(1,0)\\to1+0-0-0.5=0.5$，$(1,1)\\to1+1-2-0.5=-0.5$。按符号分类，全部正确。',
          {
            t: 'exam', md: T`XOR is not linearly separable in $(x_1,x_2)$. Use the basis expansion $\varphi(\mathbf x)=(x_1,\,x_2,\,x_1x_2)$. With $\mathbf w=(1,1,-2)$ and $b=-0.5$, the score $\mathbf w^\top\varphi(\mathbf x)+b$ equals $-0.5,\ 0.5,\ 0.5,\ -0.5$ for $(0,0),(0,1),(1,0),(1,1)$, so predicting $y=1$ iff the score is positive classifies all four points correctly: the data are linearly separable in the new feature space. (Equivalently, distance features $\varphi_i(\mathbf x)=\|\mathbf x-\mathbf z_i\|$ to the four corners with $\mathbf w=(1,0,0,1)$ give scores $\sqrt2$ for class 0 and $2$ for class 1.)`,
          },
          { t: 'note', md: '只加 $x_1+x_2$ 不行：$(0,0)\\to0$，$(0,1),(1,0)\\to1$，$(1,1)\\to2$，正类夹在两个负类中间，还是不能用一个阈值分开。一定要写出 $\\bw$ 并逐点验证，否则只能拿一半分。' },
        ],
      },
      { t: 'h2', text: '5. 小测', id: 'quiz' },
      {
        t: 'quiz', items: [
          {
            q: '$K(\\bu,\\bv)=-\\bu\'\\bv$ 是合法的 kernel 吗？',
            options: ['是', '不是'], answer: 1,
            explain: '取一个点 $\\bx\\ne\\mathbf 0$，Gram 矩阵是 $[-\\|\\bx\\|^2]$，是负数，不是 PSD。（组合规则只允许乘**正**常数。）',
          },
          {
            q: '$K(\\bu,\\bv)=(\\bu\'\\bv)^2+3\\exp(-\\|\\bu-\\bv\\|^2)$ 合法吗？', options: ['合法', '不合法'], answer: 0,
            explain: '多项式核与 RBF 核都合法；正常数 3 乘合法核仍合法；两个合法核相加仍合法（L09 p33）。',
          },
          {
            q: 'SVM 用 RBF kernel 时为什么不能解 primal？', type: 'show',
            answerText: 'RBF 对应的特征空间是无穷维的，primal 里的 $\\bw$ 无法显式表示；dual 只需要 kernel 值。',
            explain: 'L09 p23、p34。',
          },
        ],
      },
    ],
  });
})(window);
