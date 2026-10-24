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
    lead: '三种考法：**证明某个函数是合法的核（kernel）**、**写出 kernel 对应的特征映射 $\\varphi$**、**设计特征变换让 XOR 线性可分**。证明只有两条路：构造 $\\varphi$，或者用组合规则。记号：本页用 $\\bu,\\bv$ 表示两个输入（向量或集合都行），用 $K$ 或 $k$ 表示 kernel——大小写只是不同年份题目的写法，指的是同一个东西。',
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
        qzh: T`如果 $k_1(\mathbf a,\mathbf a')$ 和 $k_2(\mathbf b,\mathbf b')$ 分别是定义在维数为 $d_1$ 和 $d_2$ 的向量输入上的合法核（valid kernel），证明 $k_3\left(\begin{bmatrix}\mathbf a\\\mathbf b\end{bmatrix},\begin{bmatrix}\mathbf a'\\\mathbf b'\end{bmatrix}\right)=k_1(\mathbf a,\mathbf a')+k_2(\mathbf b,\mathbf b')$ 也是维数为 $d_1+d_2$ 的向量上的合法核。（撇号只表示“另一个输入”（英文 prime），$\mathbf a'$ 是与 $\mathbf a$ 同维的另一个向量，不表示转置；$[\mathbf a;\mathbf b]$ 表示拼接（concatenation）。）`,
        azh: T`由于 $k_1$ 和 $k_2$ 是合法核，存在特征映射（feature map）$\varphi_1,\varphi_2$，使得 $k_1(\mathbf a,\mathbf a')=\varphi_1(\mathbf a)^\top\varphi_1(\mathbf a')$，$k_2(\mathbf b,\mathbf b')=\varphi_2(\mathbf b)^\top\varphi_2(\mathbf b')$。
对 $\mathbf x=[\mathbf a;\mathbf b]\in\mathbb R^{d_1+d_2}$，定义拼接的特征映射 $\varphi_3(\mathbf x)=\begin{bmatrix}\varphi_1(\mathbf a)\\ \varphi_2(\mathbf b)\end{bmatrix}$。则
$$\varphi_3(\mathbf x)^\top\varphi_3(\mathbf x')=\varphi_1(\mathbf a)^\top\varphi_1(\mathbf a')+\varphi_2(\mathbf b)^\top\varphi_2(\mathbf b')=k_1(\mathbf a,\mathbf a')+k_2(\mathbf b,\mathbf b')=k_3(\mathbf x,\mathbf x').$$
所以 $k_3$ 是 $\varphi_3$ 特征空间中的内积（inner product），因此是合法核。`,
        sol: [
          '（注意：这道题里 $\\mathbf a\'$ 的撇表示"另一个输入 $\\mathbf a\'$"，不是转置——本题的转置一律写成 $^\\top$。本页其他地方 $\\bu\'\\bv$ 的撇仍是转置 = 点积。）',
          '思路：$k_1,k_2$ 合法 ⇒ 各有特征映射 $\\varphi_1,\\varphi_2$。把两个特征**拼接**起来，拼接向量的点积 = 两部分点积之和——点积只把**同一位置**的分量相乘再相加，前半段对前半段、后半段对后半段，没有交叉项。例：设 $\\varphi_1(\\mathbf a)=[p,q]$、$\\varphi_2(\\mathbf b)=[r]$，拼接后 $\\varphi_3(\\mathbf x)=[p,q,r]$，则 $[p,q,r]^\\top[p\',q\',r\']=pp\'+qq\'+rr\'$：前两项 $pp\'+qq\'$ 是 $\\varphi_1$ 部分的点积，最后一项 $rr\'$ 是 $\\varphi_2$ 部分的点积，中间没有交叉项。',
          {
            t: 'exam', md: T`Since $k_1$ and $k_2$ are valid kernels, there exist feature maps $\varphi_1,\varphi_2$ with $k_1(\mathbf a,\mathbf a')=\varphi_1(\mathbf a)^\top\varphi_1(\mathbf a')$ and $k_2(\mathbf b,\mathbf b')=\varphi_2(\mathbf b)^\top\varphi_2(\mathbf b')$.
Define, for $\mathbf x=[\mathbf a;\mathbf b]\in\mathbb R^{d_1+d_2}$, the concatenated feature map $\varphi_3(\mathbf x)=\begin{bmatrix}\varphi_1(\mathbf a)\\ \varphi_2(\mathbf b)\end{bmatrix}$. Then
$$\varphi_3(\mathbf x)^\top\varphi_3(\mathbf x')=\varphi_1(\mathbf a)^\top\varphi_1(\mathbf a')+\varphi_2(\mathbf b)^\top\varphi_2(\mathbf b')=k_1(\mathbf a,\mathbf a')+k_2(\mathbf b,\mathbf b')=k_3(\mathbf x,\mathbf x').$$
So $k_3$ is an inner product in the feature space of $\varphi_3$ and is therefore a valid kernel.`,
          },
          {
            t: 'deep', title: '另一种写法：用组合规则（Mercer / PSD）', blocks: [
              '$\\tilde k_1(\\mathbf x,\\mathbf x\')=k_1(\\mathbf a,\\mathbf a\')$ 只看 $\\mathbf x$ 的前 $d_1$ 维，它对应特征映射 $\\varphi_1(\\mathbf a)$，所以在 $\\mathbb R^{d_1+d_2}$ 上也合法；同理 $\\tilde k_2$。合法 kernel 之和合法（L09 p33），所以 $k_3=\\tilde k_1+\\tilde k_2$ 合法。',
              '或者用 Mercer：任意点集上 $k_3$ 的 Gram 矩阵 $=G_1+G_2$（$G_1,G_2$ 分别是 $\\tilde k_1,\\tilde k_2$ 在同一组点上的 Gram 矩阵），两个 PSD 矩阵之和对任意 $\\mathbf c$ 有 $\\mathbf c^\\top(G_1+G_2)\\mathbf c=\\mathbf c^\\top G_1\\mathbf c+\\mathbf c^\\top G_2\\mathbf c\\ge0$，仍然 PSD。',
            ],
          },
        ],
      },
      {
        t: 'past', src: 'Worksheet 6（同类练习）', marks: '—', topic: 'WK06, L09',
        q: 'Prove that $k(A_1,A_2)=|A_1\\cap A_2|$ is a valid kernel for subsets $A_1,A_2$ of a finite set $\\Omega$.',
        qzh: T`证明对有限集合 $\Omega$ 的子集 $A_1,A_2$，$k(A_1,A_2)=|A_1\cap A_2|$ 是合法核（valid kernel）。`,
        azh: T`令 $\Omega=\{\omega_1,\dots,\omega_N\}$，定义 $\varphi(A)=(\mathbb 1[\omega_1\in A],\dots,\mathbb 1[\omega_N\in A])^\top$。则 $\varphi(A_1)^\top\varphi(A_2)=\sum_j \mathbb 1[\omega_j\in A_1]\mathbb 1[\omega_j\in A_2]=|A_1\cap A_2|$，所以 $k$ 是特征向量的内积（inner product），因此是合法核。`,
        sol: [
          '构造指示向量：$\\Omega=\\{\\omega_1,\\dots,\\omega_N\\}$，$\\varphi(A)\\in\\{0,1\\}^N$，第 $j$ 维是 $\\mathbb 1[\\omega_j\\in A]$。这里 $\\mathbb 1[\\cdot]$ 是**指示函数**：方括号里的条件成立时记 1、不成立时记 0，所以 $\\mathbb 1[\\omega_j\\in A]$ 就是“第 $j$ 个元素 $\\omega_j$ 在 $A$ 里”记 1、否则记 0。两个指示向量的点积就是同时属于两个集合的元素个数：第 $j$ 项只在两个集合都含 $\\omega_j$ 时贡献 1，加起来的 1 的个数正好是 $|A_1\\cap A_2|$。',
          { t: 'exam', md: T`Let $\Omega=\{\omega_1,\dots,\omega_N\}$ and define $\varphi(A)=(\mathbb 1[\omega_1\in A],\dots,\mathbb 1[\omega_N\in A])^\top$. Then $\varphi(A_1)^\top\varphi(A_2)=\sum_j \mathbb 1[\omega_j\in A_1]\mathbb 1[\omega_j\in A_2]=|A_1\cap A_2|$, so $k$ is an inner product of feature vectors and hence a valid kernel.` },
        ],
      },
      {
        t: 'past', src: '2016 S2 exam, Q8.2', marks: 1.5, topic: 'L09 p21, p33, p35',
        q: T`Suppose $\mathbf u,\mathbf v\in\mathbb R^m$, $k:\mathbb R^m\times\mathbb R^m\to\mathbb R$ is a *kernel*, $c\in\mathbb R$, and $c>0$. Prove that $c\,k(\mathbf u,\mathbf v)$ is a *kernel*.`,
        qzh: T`设 $\mathbf u,\mathbf v\in\mathbb R^m$，$k:\mathbb R^m\times\mathbb R^m\to\mathbb R$ 是一个核（kernel），$c\in\mathbb R$ 且 $c>0$。证明 $c\,k(\mathbf u,\mathbf v)$ 是核。`,
        sol: [
          T`注意：不能直接引用 L09 p33 的"$cK$ 合法"——题目要你证明的正是这条规则。回到定义（L09 p21）：kernel = 某个特征空间里的点积。和上面 2021 Q15 一样，**构造新的特征映射**：`,
          {
            t: 'steps', items: [
              T`$k$ 是 kernel ⇒ 存在 $\varphi$ 使 $k(\bu,\bv)=\varphi(\bu)'\varphi(\bv)$。`,
              T`因为 $c>0$，$\sqrt c$ 是实数。定义 $\psi(\bu)=\sqrt c\,\varphi(\bu)$（每个分量都乘 $\sqrt c$）。`,
              T`$\psi(\bu)'\psi(\bv)=\sqrt c\,\sqrt c\,\varphi(\bu)'\varphi(\bv)=c\,k(\bu,\bv)$。所以 $c\,k$ 是 $\psi$ 特征空间里的点积，是 kernel。`,
            ],
          },
          T`小例子：$k(\bu,\bv)=\bu'\bv$（$\varphi(\bu)=\bu$），$c=4$，$\bu=(1,2)$，$\bv=(3,1)$：$c\,k=4\times5=20$；$\psi(\bu)=2\bu=(2,4)$，$\psi(\bv)=(6,2)$，点积 $12+8=20$ ✓。`,
          T`$c>0$ 为什么必要：$c<0$ 时没有实数 $\sqrt c$；例如 $c=-1$，取一个 $\varphi(\bx)\ne\mathbf 0$ 的点，它的 Gram 矩阵是 $[-k(\bx,\bx)]=[-\|\varphi(\bx)\|^2]<0$，不是 PSD（本页小测第 1 题）。`,
          {
            t: 'deep', title: '另一种写法：Mercer（Gram 矩阵 PSD）', blocks: [
              T`任取点 $\bx_1,\dots,\bx_n$，$k$ 的 Gram 矩阵 $M$ 是 PSD。$c\,k$ 的 Gram 矩阵是 $cM$，对任意向量 $\mathbf a$：$\mathbf a'(cM)\mathbf a=c\,(\mathbf a'M\mathbf a)\ge0$（正数乘非负数），所以 $cM$ 也 PSD；对所有点集都成立，由 Mercer 定理（L09 p35）$c\,k$ 合法。`,
            ],
          },
          {
            t: 'exam', md: T`Since $k$ is a kernel, there is a feature map $\varphi$ with $k(\mathbf u,\mathbf v)=\varphi(\mathbf u)'\varphi(\mathbf v)$. Because $c>0$, $\sqrt c$ is real, so define $\psi(\mathbf u)=\sqrt c\,\varphi(\mathbf u)$. Then
$$\psi(\mathbf u)'\psi(\mathbf v)=\sqrt c\sqrt c\,\varphi(\mathbf u)'\varphi(\mathbf v)=c\,k(\mathbf u,\mathbf v),$$
so $c\,k$ is a dot product in the feature space of $\psi$ and hence a kernel. (Equivalently, its Gram matrix $cM$ satisfies $\mathbf a'(cM)\mathbf a=c\,\mathbf a'M\mathbf a\ge0$ for all $\mathbf a$, so it is PSD.)`,
          },
        ],
        azh: T`因为 $k$ 是核，存在特征映射 $\varphi$ 使 $k(\mathbf u,\mathbf v)=\varphi(\mathbf u)'\varphi(\mathbf v)$。由于 $c>0$，$\sqrt c$ 是实数，定义 $\psi(\mathbf u)=\sqrt c\,\varphi(\mathbf u)$。则 $\psi(\mathbf u)'\psi(\mathbf v)=\sqrt c\sqrt c\,\varphi(\mathbf u)'\varphi(\mathbf v)=c\,k(\mathbf u,\mathbf v)$，所以 $c\,k$ 是 $\psi$ 特征空间中的点积，因此是核。（等价地：它的 Gram 矩阵 $cM$ 对所有 $\mathbf a$ 满足 $\mathbf a'(cM)\mathbf a=c\,\mathbf a'M\mathbf a\ge0$，所以是半正定（PSD）的。）`,
      },
      {
        t: 'past', src: '2017 S2 exam Q3(b)', marks: 2, topic: 'L09 p21, p33',
        q: 'Consider a definition of a *kernel* as the *dot product* in some *feature space*. Show that a sum of two *kernels* is a *kernel*.',
        qzh: '把核（kernel）定义为某个特征空间（feature space）中的点积（dot product）。证明两个核之和是核。',
        sol: [
          T`和上面 2021 Q15 是同一招：把两个特征**拼接**起来。区别只在于：2021 的两个 kernel 作用在输入的两段上（$\mathbf a$ 和 $\mathbf b$），这里两个 kernel 作用在同一个输入 $\bu$ 上。题目已经把 kernel 定义成点积，所以证明就是构造出那个点积。`,
          {
            t: 'steps', items: [
              T`$K_1(\bu,\bv)=\varphi_1(\bu)'\varphi_1(\bv)$，$K_2(\bu,\bv)=\varphi_2(\bu)'\varphi_2(\bv)$。`,
              T`定义 $\varphi(\bu)=\begin{bmatrix}\varphi_1(\bu)\\ \varphi_2(\bu)\end{bmatrix}$（上下摞起来，维数相加）。`,
              T`点积只把同一位置的分量相乘再相加，前半段对前半段、后半段对后半段：$\varphi(\bu)'\varphi(\bv)=\varphi_1(\bu)'\varphi_1(\bv)+\varphi_2(\bu)'\varphi_2(\bv)=K_1+K_2$。`,
            ],
          },
          T`小例子：$K_1=\bu'\bv$（$\varphi_1(\bu)=\bu$），$K_2=(\bu'\bv)^2$（$\varphi_2(\bu)=[u_1^2,\sqrt2u_1u_2,u_2^2]$，见第 3 节）。$\bu=(1,2)$，$\bv=(3,1)$：$\bu'\bv=5$，$K_1+K_2=5+25=30$。拼接后 $\varphi(\bu)=(1,2,1,2\sqrt2,4)$，$\varphi(\bv)=(3,1,9,3\sqrt2,1)$，点积 $3+2+9+12+4=30$ ✓（$2\sqrt2\times3\sqrt2=6\times2=12$）。`,
          {
            t: 'exam', md: T`Let $K_1(\mathbf u,\mathbf v)=\varphi_1(\mathbf u)'\varphi_1(\mathbf v)$ and $K_2(\mathbf u,\mathbf v)=\varphi_2(\mathbf u)'\varphi_2(\mathbf v)$ for feature maps $\varphi_1,\varphi_2$. Define the concatenated feature map $\varphi(\mathbf u)=\begin{bmatrix}\varphi_1(\mathbf u)\\ \varphi_2(\mathbf u)\end{bmatrix}$. Then
$$\varphi(\mathbf u)'\varphi(\mathbf v)=\varphi_1(\mathbf u)'\varphi_1(\mathbf v)+\varphi_2(\mathbf u)'\varphi_2(\mathbf v)=K_1(\mathbf u,\mathbf v)+K_2(\mathbf u,\mathbf v),$$
so $K_1+K_2$ is a dot product in the feature space of $\varphi$, i.e. a kernel.`,
          },
        ],
        azh: T`设 $K_1(\mathbf u,\mathbf v)=\varphi_1(\mathbf u)'\varphi_1(\mathbf v)$，$K_2(\mathbf u,\mathbf v)=\varphi_2(\mathbf u)'\varphi_2(\mathbf v)$，$\varphi_1,\varphi_2$ 是特征映射。定义拼接的特征映射 $\varphi(\mathbf u)=\begin{bmatrix}\varphi_1(\mathbf u)\\ \varphi_2(\mathbf u)\end{bmatrix}$。则 $\varphi(\mathbf u)'\varphi(\mathbf v)=\varphi_1(\mathbf u)'\varphi_1(\mathbf v)+\varphi_2(\mathbf u)'\varphi_2(\mathbf v)=K_1(\mathbf u,\mathbf v)+K_2(\mathbf u,\mathbf v)$，所以 $K_1+K_2$ 是 $\varphi$ 特征空间中的点积，即是核。`,
      },

      { t: 'h2', text: '3. 写出 kernel 的特征映射', id: 'phi' },
      {
        t: 'table', head: ['kernel', '特征映射 $\\varphi$', '出处'], rows: [
          ['$(uv+c)^2$（1 维：$u,v$ 是实数，所以 $u_1=u$、$v_1=v$）', '$\\varphi(x)=[x^2,\\ \\sqrt{2c}\\,x,\\ c]$，其中 $x$ 代指“任意一个输入”：换成 $u$ 得 $\\varphi(u)=[u^2,\\sqrt{2c}\\,u,c]$，换成 $v$ 同理（展开 $(uv+c)^2=u^2v^2+2c\\,uv+c^2$；中间项要拆成两边各 $\\sqrt{2c}$，因为 $\\sqrt{2c}\\cdot\\sqrt{2c}=2c$）', 'L09 p22'],
          ['$(\\bu\'\\bv)^2$（$m=2$：向量只有 2 维）', '$\\varphi(\\bu)=[u_1^2,\\ \\sqrt2\\,u_1u_2,\\ u_2^2]$', 'L09 p32'],
          ['$(\\bu\'\\bv+c)^d$（$d$ 为非负整数，$c\\ge0$）', '给每个向量末尾加一维常数 $\\sqrt c$，得到 $\\tilde{\\bu}=[\\bu;\\sqrt c]$，于是 $(\\bu\'\\bv+c)^d=(\\tilde{\\bu}\'\\tilde{\\bv})^d$；展开后每一项都是 $u,v$ 分量的 $d$ 次单项式（项数很多），把它们依次排成 $\\varphi$ 的各维', 'L09 p32'],
          ['RBF（径向基核 radial basis function，也叫高斯核）$\\exp(-\\gamma\\|\\bu-\\bv\\|^2)$（$\\gamma>0$，越大衰减越快）', '$f(\\bu)=\\exp(-\\gamma\\|\\bu\\|^2)$。因为 $\\|\\bu-\\bv\\|^2=\\|\\bu\\|^2+\\|\\bv\\|^2-2\\bu\'\\bv$，所以 $\\exp(-\\gamma\\|\\bu-\\bv\\|^2)=\\exp(-\\gamma\\|\\bu\\|^2)\\cdot\\exp(2\\gamma\\bu\'\\bv)\\cdot\\exp(-\\gamma\\|\\bv\\|^2)$（只用了 $e^{a+b}=e^a e^b$），即 $=f(\\bu)\\exp(2\\gamma\\bu\'\\bv)f(\\bv)$；再用 $e^z=\\sum_d z^d/d!$ 展开，每项 $(\\bu\'\\bv)^d$ 都是多项式核，无穷多项 ⇒ 无穷维', 'L09 p34'],
        ],
      },
      {
        t: 'deep', title: '展开详解：$(\\bu\'\\bv)^2$ 的展开（考试可能让你写）', blocks: [
          { t: 'math', tex: T`(\bu'\bv)^2=(u_1v_1+u_2v_2)^2=u_1^2v_1^2+2u_1u_2v_1v_2+u_2^2v_2^2=\begin{bmatrix}u_1^2\\ \sqrt2u_1u_2\\ u_2^2\end{bmatrix}^{\top}\begin{bmatrix}v_1^2\\ \sqrt2v_1v_2\\ v_2^2\end{bmatrix}` },
          '为什么值得用 kernel：显式计算 $\\varphi(\\bu)$、$\\varphi(\\bv)$ 再求点积要好几步，直接算 $(\\bu\'\\bv)^2$ 只要一次点积加一次平方（L09 p22 的例子：显式先算 $\\varphi(\\bu)$ 用 2 次运算、$\\varphi(\\bv)$ 再 2 次，点积 5 次，共 9 次；直接算 kernel 只要 3 次）。维数越高差距越大，RBF 的 $\\varphi$ 是无穷维，根本没法显式计算。',
        ],
      },

      { t: 'h2', text: '4. XOR：设计特征变换', id: 'xor' },
      {
        t: 'past', src: '2025 S1 practice Q2', marks: 10, topic: 'L03 p24',
        q: 'Consider a 2-dimensional dataset with binary features and the XOR label: $(0,0,0)$, $(0,1,1)$, $(1,0,1)$, $(1,1,0)$ as $(x_1,x_2,y)$. Design a feature space transformation that would make the data linearly separable.',
        qzh: '考虑一个二值特征的二维数据集，标签为 XOR（异或：两个特征相同则 $y=0$、不同则 $y=1$）：以 $(x_1,x_2,y)$ 表示为 $(0,0,0)$、$(0,1,1)$、$(1,0,1)$、$(1,1,0)$。设计一个特征空间变换（feature space transformation），使数据线性可分（linearly separable：能画一条线/一个平面把 $y=1$ 和 $y=0$ 的点分开就算线性可分）。',
        azh: T`XOR 在 $(x_1,x_2)$ 中不是线性可分的。使用基函数展开（basis expansion）$\varphi(\mathbf x)=(x_1,\,x_2,\,x_1x_2)$。取 $\mathbf w=(1,1,-2)$、$b=-0.5$，则对 $(0,0),(0,1),(1,0),(1,1)$，分数 $\mathbf w^\top\varphi(\mathbf x)+b$ 分别为 $-0.5,\ 0.5,\ 0.5,\ -0.5$，所以"分数为正时预测 $y=1$"能把四个点全部分对：数据在新特征空间中线性可分。（等价地，用到四个角点的距离特征 $\varphi_i(\mathbf x)=\|\mathbf x-\mathbf z_i\|$，取 $\mathbf w=(1,0,0,1)$，类 0 的分数为 $\sqrt2$，类 1 的分数为 $2$。）`,
        sol: [
          { t: 'h4', text: '解法一：课件 L03 p24 原样（最稳）' },
          '用到 4 个中心的距离作为特征：$\\varphi_i(\\bx)=\\|\\bx-\\bm z_i\\|$，$\\bm z_1=(0,0)$，$\\bm z_2=(0,1)$，$\\bm z_3=(1,0)$，$\\bm z_4=(1,1)$。取 $\\bw=(1,0,0,1)$（凑出来的：只用"到 $(0,0)$ 的距离 + 到 $(1,1)$ 的距离"）。距离怎么算：如 $(0,0)$ 到 $(1,1)$ 是 $\\sqrt{1^2+1^2}=\\sqrt2$，到 $(0,1)$ 是 1：',
          {
            t: 'table', head: ['$\\bx$', '$y$（真标签）', '$\\varphi(\\bx)$：依次是到 $\\bm z_1,\\bm z_2,\\bm z_3,\\bm z_4$ 的距离', '分数 $\\bw\'\\varphi(\\bx)$（本例 $b=0$，$>1.7$ 判为 1）'], rows: [
              ['(0,0)', '0', '$(0,1,1,\\sqrt2)$', '$\\sqrt2\\approx1.41$'],
              ['(0,1)', '1', '$(1,0,\\sqrt2,1)$', '2'],
              ['(1,0)', '1', '$(1,\\sqrt2,0,1)$', '2'],
              ['(1,1)', '0', '$(\\sqrt2,1,1,0)$', '$\\sqrt2\\approx1.41$'],
            ],
          },
          '阈值取 1.7（任何 $\\sqrt2$ 到 2 之间的数都行）：$\\bw\'\\varphi(\\bx)>1.7$ 判为 1。四个点全部分对。',
          { t: 'fig', src: 'reference/pages/L03/p24.jpg', caption: 'L03 p24 原图', w: 560 },
          { t: 'h4', text: '解法二：加乘积特征（更短）' },
          '$\\varphi(\\bx)=(x_1,\\ x_2,\\ x_1x_2)$，取 $\\bw=(1,1,-2)$，$b=-0.5$（怎么想到的：$x_1+x_2-2x_1x_2$ 在四个点上正好等于 XOR 标签 0、1、1、0，再减 0.5 让两类落在 0 的两侧；写完仍要逐点验算）：$(0,0)\\to0+0-0-0.5=-0.5$，$(0,1)\\to0+1-0-0.5=0.5$，$(1,0)\\to1+0-0-0.5=0.5$，$(1,1)\\to1+1-2-0.5=-0.5$。按符号分类，全部正确。',
          {
            t: 'exam', md: T`XOR is not linearly separable in $(x_1,x_2)$. Use the basis expansion $\varphi(\mathbf x)=(x_1,\,x_2,\,x_1x_2)$. With $\mathbf w=(1,1,-2)$ and $b=-0.5$, the score $\mathbf w^\top\varphi(\mathbf x)+b$ equals $-0.5,\ 0.5,\ 0.5,\ -0.5$ for $(0,0),(0,1),(1,0),(1,1)$, so predicting $y=1$ iff the score is positive classifies all four points correctly: the data are linearly separable in the new feature space. (Equivalently, distance features $\varphi_i(\mathbf x)=\|\mathbf x-\mathbf z_i\|$ to the four corners with $\mathbf w=(1,0,0,1)$ give scores $\sqrt2$ for class 0 and $2$ for class 1.)`,
          },
          { t: 'note', md: '只加 $x_1+x_2$ 不行：$(0,0)\\to0$，$(0,1),(1,0)\\to1$，$(1,1)\\to2$，正类夹在两个负类中间，还是不能用一个阈值分开。一定要写出 $\\bw$ 并逐点验证，否则只能拿一半分。' },
        ],
      },
      { t: 'h2', text: '5. 往年简答：kernel 是什么、好在哪', id: 'concepts' },
      T`2016 Q8.1（What is the kernel trick and what is the benefit of using it?）和 T13 的卡片"What is the kernel trick and why is it useful?"同题，答案见 [T13](#/T13)，这里不重复。`,
      {
        t: 'past', src: '2016 S2 exam, Q1.9', marks: 1, topic: 'L09 p21',
        q: 'Define a *kernel* in the context of *SVM* learning.',
        qzh: '在 SVM 学习的背景下，给核（kernel）下定义。',
        sol: [
          T`课件定义（L09 p21）："Kernel is a function that can be expressed as a dot product in some feature space, $K(\bu,\bv)=\varphi(\bu)'\varphi(\bv)$"。再加半句它在 SVM 里的作用：SVM 的对偶问题（dual）里训练和预测都只用到点积，所以把 $\bx_i'\bx_j$ 换成 $K(\bx_i,\bx_j)$。`,
          { t: 'note', md: '常见的不准确说法："kernel 把原特征空间变换到别的维度"。做变换的是 $\\varphi$；kernel 是变换**之后**的点积，而且不用真的算出 $\\varphi$。' },
          {
            t: 'exam', md: T`A kernel is a function $K(\mathbf u,\mathbf v)=\varphi(\mathbf u)'\varphi(\mathbf v)$ that equals the dot product of the two inputs after mapping them into some feature space by $\varphi$. Because the SVM dual uses the data only through dot products, every $\mathbf x_i'\mathbf x_j$ can be replaced by $K(\mathbf x_i,\mathbf x_j)$, training the SVM in that feature space without computing $\varphi$ explicitly.`,
          },
        ],
        azh: T`核是一个函数 $K(\mathbf u,\mathbf v)=\varphi(\mathbf u)'\varphi(\mathbf v)$，它等于两个输入经 $\varphi$ 映射到某个特征空间之后的点积。因为 SVM 的对偶问题只通过点积使用数据，每个 $\mathbf x_i'\mathbf x_j$ 都可以换成 $K(\mathbf x_i,\mathbf x_j)$，从而在那个特征空间里训练 SVM，而不需要显式计算 $\varphi$。`,
      },
      {
        t: 'past', src: '2017 S2 exam Q10(b)', marks: 1, topic: 'L09 p21–p24, WK06',
        q: 'Question 10: Movie Recommendation. Your task is to design an automatic *movie recommendation* system for a company that provides an online movie streaming service. This company maintains a large *collection* of movies, and each movie can be accessed for a small fee. The service is only available for *registered users*. The users preview the movies and can pay for access to the full movie. For each *user*, the system keeps track of what movies were previewed and what movies were purchased. The aim of your system is to provide personalised *movie recommendations* to each user, as to maximise the number of purchases. Note that your system will only be applied for users that already have a history of a large number of previews. With all these considerations in mind, outline the design of your *movie recommendation* system.\n\n(b) You have decided to use a kernel classifier for this purpose. Outline why using a kernel might convey an advantage for this problem over other methods, such as a linear classifiers. [1 mark]',
        qzh: '第 10 题：电影推荐。你要为一家提供在线电影流媒体服务的公司设计一个自动电影推荐系统。公司有大量电影，每部电影付一小笔费用就能看。服务只对注册用户开放。用户可以预览电影，并付费观看完整电影。系统为每个用户记录他预览过哪些电影、购买过哪些电影。系统的目标是给每个用户做个性化推荐，使购买数最大。注意：系统只用于已经有大量预览记录的用户。在这些前提下，概述你的推荐系统设计。(b) 你决定用一个核分类器（kernel classifier）。概述为什么在这个问题上用核可能比其他方法（例如线性分类器）有优势。[1 分]',
        sol: [
          T`1 分只要说出一个具体优势，并联系题目。最直接的两点：`,
          {
            t: 'ul', items: [
              T`非线性：口味是特征之间的组合（"预览过很多科幻**并且**很多动作片的人才会买这部"），线性分类器在原始特征上学不到；kernel 等于在高维特征空间（含这些组合特征）里做线性分类，又不用显式构造这些特征（L09 p22–p24）。`,
              T`可以直接在"集合"上定义相似度：每个用户的预览记录是一个电影集合，Worksheet 6 的 $k(A_1,A_2)=|A_1\cap A_2|$（两人共同预览过的电影数）就是合法 kernel（见本页第 2 节）。题目说用户都有很长的预览历史，正好适合这种相似度。`,
            ],
          },
          {
            t: 'exam', md: T`A kernel classifier can learn a non-linear decision boundary: whether a user buys a movie depends on combinations of their previews (e.g. many sci-fi and many action previews), which a linear classifier on the raw features cannot capture. The kernel trick fits a linear classifier in a high-dimensional feature space containing such interactions without constructing those features explicitly. Kernels can also be defined directly on the users' preview histories, e.g. $K(A_1,A_2)=|A_1\cap A_2|$, the number of movies both users previewed.`,
          },
        ],
        azh: T`核分类器可以学到非线性的决策边界：用户买不买一部电影取决于他预览记录的组合（例如预览过很多科幻片并且很多动作片），线性分类器在原始特征上学不到这种关系。核技巧（kernel trick）相当于在包含这些交互项的高维特征空间里拟合线性分类器，而不用显式构造这些特征。核还可以直接定义在用户的预览历史上，例如 $K(A_1,A_2)=|A_1\cap A_2|$，即两个用户都预览过的电影数。`,
      },

      { t: 'h2', text: '6. 小测', id: 'quiz' },
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
            q: 'SVM 用 RBF kernel 时为什么不能解 primal（原始问题：直接在特征空间里对 $\\bw$、$b$ 求解的那个问题）？', type: 'show',
            answerText: 'RBF 对应的特征空间是无穷维的，primal 里的 $\\bw$ 无法显式表示；dual 只需要 kernel 值。',
            explain: 'L09 p23、p34。',
          },
        ],
      },
    ],
  });
})(window);
