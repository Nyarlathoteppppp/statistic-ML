/* T16 — optimisers and neural-network basics (L04 GD/SGD, L11 activations & Boolean functions, L12 momentum/Adagrad/Adam, regularisation). */
(function (root) {
  'use strict';
  const T = String.raw;

  root.SML.content.add({
    id: 'T16',
    eyebrow: '题型 T16 · 往年 4/7 份有神经网络基础、3/7 份有优化器 · 2022 Q1(a) 5 分',
    title: '优化器与神经网络基础：GD、momentum、Adagrad、布尔函数',
    en: 'Optimisers and neural-network basics',
    chips: [
      { text: 'L04 p5–p11', href: '#/L04', cls: 'src' }, { text: 'L11 p7–p22', href: '#/L11', cls: 'src' }, { text: 'L12 p9–p21', href: '#/L12', cls: 'src' },
      { text: '2021 Q4, Q7', cls: 'hot' }, { text: '2022 Q1(a)', cls: 'hot' }, { text: '2016 Q5', cls: 'hot' }, { text: '2017 Q6', cls: 'hot' },
    ],
    lead: T`两块内容：**优化器**（写出 GD 算法、GD vs SGD、momentum 为什么能冲过局部最优、Adagrad 的动态学习率）和**神经网络基础**（为什么用 sigmoid 而不是阶跃函数、为什么 ANN 相当于学到的非线性 basis、给真值表画网络）。大多是简答，背下第 3 节的写法就行；布尔函数构造是唯一的"画图计算"，有固定套路（第 4 节）。Backprop 推导单独在 [T10](#/T10)。`,
    blocks: [
      { t: 'h2', text: '1. 怎么认出这道题', id: 'spot' },
      {
        t: 'table', head: ['题干里看到', '答题要点', '在哪练'], rows: [
          ['*write down the gradient descent algorithm*', '初始化 → 重复 $\\theta\\leftarrow\\theta-\\eta\\nabla L(\\theta)$ → 收敛停止；解释 $\\eta$', '第 2 节'],
          ['*GD vs SGD*', 'GD 每步用全部数据算梯度；SGD 每步用一个（或一小批）样本，便宜但有噪声', '第 3 节'],
          ['*momentum*、*local optima*、*saddle point*', '累积过去的梯度当"速度"，带惯性冲过小坑和平地', '第 3 节'],
          ['*Adagrad*、*dynamic learning rate*', '每个参数累加梯度平方，步长按 $1/\\sqrt{g_i}$ 缩小', '第 3 节'],
          ['*sigmoid rather than step*', 'sigmoid 可导、梯度非零，才能用梯度法 / backprop 训练', '第 3 节'],
          ['*non-linear basis function*', '隐藏层 = 从数据学出来的 basis，输出层是在它上面的线性模型', '第 3 节'],
          ['*draw an ANN representing the Boolean function*', '每个输出为 1 的行一个隐藏单元（AND），输出单元做 OR', '第 4 节'],
          ['*dataset a perceptron cannot classify*', 'XOR（非线性可分）', '[T8](#/T08/xor)'],
        ],
      },

      { t: 'h2', text: '2. 必背的几个式子', id: 'core' },
      {
        t: 'table', head: ['方法', '更新', '出处'], rows: [
          ['GD', '$\\theta^{(t)}=\\theta^{(t-1)}-\\eta\\nabla L(\\theta^{(t-1)})$，$\\nabla L$ 用全部训练数据', 'L04 p5'],
          ['SGD / mini-batch', '同一公式，但梯度只用一个样本 / 一小批样本估计', 'L04 p10、L12 p9'],
          ['Momentum', '$\\mathbf v^{(t)}=\\alpha\\mathbf v^{(t-1)}+\\eta\\nabla L(\\theta^{(t-1)})$，$\\theta^{(t)}=\\theta^{(t-1)}-\\mathbf v^{(t)}$', 'L12 p12'],
          ['Adagrad', '$g_i^{(t)}=g_i^{(t-1)}+(\\nabla L)_i^2$，$\\theta_i^{(t)}=\\theta_i^{(t-1)}-\\dfrac{\\eta}{\\sqrt{g_i^{(t)}+\\epsilon}}(\\nabla L)_i$', 'L12 p13'],
          ['Adam', 'momentum（梯度的滑动平均）+ 自适应步长（梯度平方的滑动平均）+ 偏差校正', 'L12 p14'],
          ['深度网络正则化', 'L2（weight decay）、early stopping、dropout', 'L12 p17–p21'],
          ['激活函数', 'step、sigmoid、tanh、ReLU；step 的导数处处为 0（或不存在）', 'L11 p7'],
          ['表达能力', '单隐藏层足够宽就能逼近任意连续函数；任意 $m$ 个变量的布尔函数用一个最多 $2^m$ 个单元的隐藏层实现', 'L11 p12、p15'],
        ],
      },
      {
        t: 'steps', items: [
          T`**手算一步**：$L(\theta)=\theta^2$，$\nabla L=2\theta$，$\theta=3$，$\eta=0.1$。GD：$\theta\leftarrow3-0.1\times6=2.4$。`,
          T`**Momentum**（$\alpha=0.9$，$\mathbf v^{(0)}=0$）：第 1 步 $v=0.6$，$\theta=2.4$；第 2 步梯度 $4.8$，$v=0.9\times0.6+0.48=1.02$，$\theta=2.4-1.02=1.38$。比 GD 第 2 步的 $1.92$ 走得更远：速度累积起来了。`,
          T`**Adagrad**（忽略 $\epsilon$）：第 1 步 $g=36$，步长 $\frac{0.1}{6}\times6=0.1$，$\theta=2.9$；第 2 步梯度 $5.8$，$g=36+33.64=69.64$，步长 $\frac{0.1}{\sqrt{69.64}}\times5.8\approx0.07$，$\theta\approx2.83$。步长只会越来越小。`,
        ],
      },

      { t: 'h2', text: '3. 简答写法', id: 'phrases' },
      {
        t: 'exam', title: 'GD vs SGD（2016 Q5.2）',
        md: T`Gradient descent computes the gradient of the total loss over all $n$ training examples before each update, so each step is exact but costs $O(n)$. Stochastic gradient descent updates after each (randomly ordered) example, or a mini-batch, using a noisy estimate of the gradient: steps are much cheaper and the noise can help escape poor local optima, but the path is noisier and the learning rate usually needs to decrease for convergence.`,
      },
      {
        t: 'exam', title: 'Momentum（2021 Q7）',
        md: T`Momentum keeps a running "velocity" $\mathbf v^{(t)}=\alpha\mathbf v^{(t-1)}+\eta\nabla L$ and moves by $\mathbf v^{(t)}$ instead of the current gradient alone. Where the gradient is near zero (a saddle point, a plateau or a shallow local optimum) the accumulated velocity still carries the parameters forward, and in consistent directions the steps grow, while oscillating gradient components cancel out.`,
      },
      {
        t: 'exam', title: 'Sigmoid vs step（2016 Q1.8）',
        md: T`The sigmoid is differentiable with a non-zero gradient everywhere, so the network can be trained by gradient-based methods (backpropagation). The step function has zero gradient almost everywhere (and none at 0), so gradients give no information on how to change the weights.`,
      },
      {
        t: 'exam', title: 'ANN = 学到的非线性 basis（2021 Q4）',
        md: T`Each hidden unit computes a non-linear function $u_j=g(\mathbf v_j'\mathbf x)$ of the input, and the output is a linear model on these: $s=\sum_jw_ju_j$. So the hidden layer plays the role of a set of non-linear basis functions, but unlike fixed basis expansions (e.g. RBF or polynomials) their parameters $\mathbf v_j$ are learned from data together with the output weights.`,
      },

      { t: 'h2', text: '4. 给真值表画网络（2017 Q6）', id: 'boolean' },
      T`所有节点都用阶跃激活 $g(r)=1$ 若 $r\ge0$，否则 0。套路就是把真值表写成"若干个 AND 的 OR"：`,
      {
        t: 'steps', items: [
          T`找出输出为 1 的每一行，各配一个隐藏单元。`,
          T`**隐藏单元 = 只在这一行上取 1 的 AND**：该行取 1 的输入给权重 $+1$，取 0 的给 $-1$；偏置 $=-(\text{该行 1 的个数})+0.5$。在这一行上加权和 $=0.5\ge0$；换成任何别的行，至少差 1，加权和 $\le-0.5<0$。`,
          T`**输出单元 = OR**：每个隐藏单元权重 $+1$，偏置 $-0.5$。任一隐藏单元为 1 时输出 1。`,
          T`画图：输入 → 隐藏层 → 输出，每条边写权重，偏置画成从常数 1 连过来的边，标明激活函数。`,
        ],
      },
      {
        t: 'table', head: ['单元', '权重 $(x_1,x_2,x_3)$', '偏置', '在哪些输入上为 1'], rows: [
          ['$u_1$（行 $(0,0,1)$）', '$(-1,-1,+1)$', '$-0.5$', '只有 $(0,0,1)$：$1-0.5=0.5$'],
          ['$u_2$（行 $(1,1,0)$）', '$(+1,+1,-1)$', '$-1.5$', '只有 $(1,1,0)$：$2-1.5=0.5$'],
          ['输出 $z$', '$u_1,u_2$ 各 $+1$', '$-0.5$', '$u_1$ 或 $u_2$ 为 1'],
        ],
      },
      { t: 'note', md: '检查一行就够：$(1,1,1)$ 上 $u_2=1+1-1-1.5=-0.5<0$，不触发；$(0,0,0)$ 上 $u_1=-0.5<0$。这也正是 L11 p15 说"最多 $2^m$ 个隐藏单元"的原因：最坏情况每一行一个。' },

      { t: 'h2', text: '5. 往年原题（先自己写，再看答案）', id: 'past' },
      {
        t: 'examqPick', picks: [
          ['c13', '2016 S2 Q5.1'], ['c13', '2016 S2 Q5.2'], ['c35', '2021 Q7'], ['c35', '2022 S1 Q1(a)'],
          ['c33', '2021 Q4'], ['c33', '2016 S2 Q1.8'], ['c33', '2017 S2 Q6'], ['c31', '2016 S2 Q1.7'], ['c34', '2017 S2 Q1(e)'],
        ],
      },

      { t: 'h2', text: '6. 易错点', id: 'pitfalls' },
      {
        t: 'table', head: ['错误', '正确'], rows: [
          ['SGD 每步用全部数据', '那是 GD；SGD 每步一个样本（mini-batch 是一小批）'],
          ['Adagrad 的步长会变大', '$g_i$ 只增不减，步长只会变小（这也是它的缺点，Adam 用滑动平均改进）'],
          ['momentum 让每一步都更小、更稳', '同方向的步子会变大；它减少的是来回震荡'],
          ['布尔网络的偏置随便取', '偏置要让目标行的加权和 $\\ge0$、其他行 $<0$；用 0.5 留余量最稳'],
          ['只说"sigmoid 是平滑的"', '要说出要点：**可导、梯度非零 ⇒ 能用梯度法 / backprop 训练**'],
        ],
      },
      {
        t: 'quiz', items: [
          { q: '$L(\\theta)=(\\theta-1)^2$，$\\theta=5$，$\\eta=0.25$。GD 一步后 $\\theta=?$', type: 'num', answer: 3, explain: '$\\nabla L=2(5-1)=8$，$\\theta=5-0.25\\times8=3$。' },
          { q: 'Adagrad，某参数第一步梯度为 $-4$，$\\eta=0.5$（忽略 $\\epsilon$）。这一步参数变化多少？', type: 'num', answer: 0.5, explain: '$g=16$，变化 $=-\\frac{0.5}{\\sqrt{16}}\\times(-4)=+0.5$。第一步 Adagrad 总是走 $\\eta$ 那么远，与梯度大小无关。' },
          {
            q: '用阶跃激活实现 AND($x_1,x_2$)，权重 $(1,1)$，偏置取多少合适？', type: 'mc',
            options: ['$-0.5$', '$-1.5$', '$+0.5$', '$-2.5$'], answer: 1,
            explain: '$(1,1)$：$2-1.5=0.5\\ge0$ 输出 1；$(1,0)$：$-0.5<0$ 输出 0。$-0.5$ 得到的是 OR。',
          },
          {
            q: '（英文）Why is mini-batch SGD usually preferred over full gradient descent for training deep networks?', type: 'show',
            answerText: 'Each update is far cheaper (it uses a small batch instead of all $n$ examples), so many more updates are made per unit of computation; the gradient noise also helps escape saddle points and poor local optima.',
            explain: 'L12 p9：mini-batch 是 GD 和单样本 SGD 的折中，还能利用并行计算。',
          },
        ],
      },
    ],
  });
})(window);
