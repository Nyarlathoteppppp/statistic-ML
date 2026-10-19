/* T10 backprop, T11 perceptron by hand, T12 experts & generalisation bounds. Lower exam frequency → compact pages. */
(function (root) {
  'use strict';
  const SML = root.SML;
  const T = String.raw;

  /* ---------- T11 perceptron stepper ---------- */
  SML.viz.register('perceptron-stepper', function (el) {
    const { md } = SML.md;
    // Only the three points whose coordinates are printed on L10 p35–p39.
    const data = [{ x: [1, 1], y: -1 }, { x: [2, 1], y: 1 }, { x: [1.5, 0.5], y: 1 }];
    const box = document.createElement('div'); box.className = 'solver';
    box.innerHTML = '<div class="solver-head"><span class="title">Perceptron 逐样本更新（L10 例 2，η = 0.1）</span>' +
      '<div class="tools"><button class="btn" type="button" data-a="prev">上一步</button><button class="btn primary" type="button" data-a="next">下一步</button><button class="btn" type="button" data-a="reset">重置</button></div></div>' +
      '<div class="solver-body"></div><div class="solver-out"></div>';
    el.appendChild(box);
    const body = box.querySelector('.solver-body'), out = box.querySelector('.solver-out');
    const run = SML.core.perceptron.train(data, [-0.1, 0.2, 0.0], 0.1, { epochs: 1, order: [0, 1, 2] });
    const plotBox = document.createElement('div'); box.querySelector('.solver-body').after(plotBox);
    let k = 0;
    const f = (v) => (Math.abs(v) < 1e-12 ? 0 : +v.toFixed(3));
    const pf = (v) => (f(v) < 0 ? '(' + f(v) + ')' : String(f(v)));
    function draw() {
      const rows = run.steps.slice(0, k).map((s, i) => '<tr><td>' + (i + 1) + '</td><td>(' + s.x.slice(1).join(', ') + ')</td><td>' + (s.y > 0 ? '+1' : '−1') + '</td><td>' + f(s.ys) + '</td><td>' + (s.updated ? '<b>更新</b>' : '—') + '</td><td>(' + f(s.w[0]) + ', ' + f(s.w[1]) + ', ' + f(s.w[2]) + ')</td></tr>').join('');
      body.innerHTML = '<div class="table-wrap"><table class="compact"><thead><tr><th>#</th><th>$\\bx$</th><th>$y$</th><th>$y\\cdot s$</th><th></th><th>更新后 $(w_0,w_1,w_2)$</th></tr></thead><tbody>' +
        '<tr><td>0</td><td colspan="4">初始（题目给定）</td><td>(−0.1, 0.2, 0)</td></tr>' + rows + '</tbody></table></div>';
      body.querySelectorAll('th').forEach((th) => { th.innerHTML = SML.md.inline(th.textContent); });
      if (k === 0) out.innerHTML = md('点"下一步"。权重一律按 $(w_0,w_1,w_2)$ 写，$w_0$ 是偏置；初始 $(-0.1,\\ 0.2,\\ 0)$ 和 $\\eta=0.1$ 都是题目给定的。规则：先算 $s=w_0\\cdot1+w_1x_1+w_2x_2$；$y\\cdot s\\le0$ 时 $\\bw\\leftarrow\\bw+\\eta y\\bx$（$\\bx$ 前面补一个偏置输入 1）。');
      else {
        const s = run.steps[k - 1];
        const wb = k === 1 ? [-0.1, 0.2, 0.0] : run.steps[k - 2].w;
        out.innerHTML = md(T`样本 $(${s.x.slice(1).join(',')})$，$y=${s.y}$：$s=w_0\cdot1+w_1x_1+w_2x_2=${f(wb[0])}\cdot1+${pf(wb[1])}\cdot${s.x[1]}+${pf(wb[2])}\cdot${s.x[2]}=${f(s.s)}$，$y\cdot s=${f(s.ys)}$ ` + (s.updated ? T`$\le0$，分错（或在边界上），更新 $(w_0,w_1,w_2)\leftarrow(w_0,w_1,w_2)${s.y > 0 ? '+' : '-'}0.1\,[${s.x.join(',')}]$（第一个 1 是 bias 输入）。` : '$>0$，分对，不更新。') + (k === run.steps.length ? md('课件 p39 接着说第 4 个点（类别 −1）被分错并更新，但没有给出它的坐标，所以这里只演示有坐标的 3 个点。') : ''));
      }
      // picture: points and the current boundary w1 x1 + w2 x2 + w0 = 0
      const w = k === 0 ? [-0.1, 0.2, 0.0] : run.steps[k - 1].w;
      plotBox.innerHTML = '';
      const pl = SML.plot.frame(plotBox, { w: 360, h: 300, x: [-0.5, 3], y: [-0.5, 2.5], maxWidth: 380, xlabel: 'x₁', ylabel: 'x₂', margin: { l: 30, b: 26 } });
      if (Math.abs(w[2]) > 1e-9) pl.path([[-0.5, -(w[0] + w[1] * -0.5) / w[2]], [3, -(w[0] + w[1] * 3) / w[2]]], 'boundary');
      else if (Math.abs(w[1]) > 1e-9) pl.path([[-w[0] / w[1], -0.5], [-w[0] / w[1], 2.5]], 'boundary');
      data.forEach((d, i) => { pl.dot(d.x[0], d.x[1], 7, 'pt ' + (d.y > 0 ? 'pos' : 'neg') + (k > 0 && i === (k - 1) % data.length ? ' big' : '')); });
      box.querySelector('[data-a="prev"]').disabled = k === 0;
      box.querySelector('[data-a="next"]').disabled = k >= run.steps.length;
    }
    box.querySelector('[data-a="prev"]').addEventListener('click', () => { k = Math.max(0, k - 1); draw(); });
    box.querySelector('[data-a="next"]').addEventListener('click', () => { k = Math.min(run.steps.length, k + 1); draw(); });
    box.querySelector('[data-a="reset"]').addEventListener('click', () => { k = 0; draw(); });
    draw();
  });

  SML.content.add([
    {
      id: 'T10',
      eyebrow: '题型 T10 · 2021 Q13(b) 6 分',
      title: 'Backprop：隐藏层权重的梯度',
      en: 'Backpropagation through one hidden layer',
      chips: [{ text: 'L11 p25–p31', href: '#/L11', cls: 'src' }, { text: '2021 exam Q13b', cls: 'hot' }],
      lead: '考法：解释"为什么 loss 不直接含隐藏层权重也能求导"，并写出 $\\partial L/\\partial w_j$ 的链式法则展开。偶尔会给一个小网络让你代数字。',
      blocks: [
        { t: 'h2', text: '1. 记号（L11 p9）', id: 'notation' },
        {
          t: 'table', head: ['量', '定义'], rows: [
            ['输入', '$x_0=1$（偏置），$x_1,\\dots,x_m$'], ['隐藏层', '$r_j=\\sum_{i=0}^mx_iv_{ij}$，$u_j=g(r_j)$，$u_0=1$'],
            ['输出', '$s=\\sum_{j=0}^pu_jw_j$，$z=h(s)$（回归时 $h$ 为恒等）'], ['损失', '$L=\\frac12(z-y)^2$'],
          ],
        },
        { t: 'h2', text: '2. 三个公式', id: 'formulas' },
        { t: 'math', tex: T`\delta=\frac{\partial L}{\partial s}=z-y,\qquad \frac{\partial L}{\partial w_j}=\delta\,u_j,\qquad \frac{\partial L}{\partial v_{ij}}=\underbrace{\delta\,w_j\,g'(r_j)}_{\varepsilon_j}\,x_i` },
        T`五个因子逐项：$\partial L/\partial z=z-y$（$L=\frac12(z-y)^2$，$\frac12$ 就是为了消掉求导出来的 2）；$\partial z/\partial s=h'(s)$，回归时 $h$ 是恒等，这一项是 1——所以 $\delta=z-y$ **只在平方损失 + 恒等输出时成立**；$\partial s/\partial u_j=w_j$（输出层权重）；$\partial u_j/\partial r_j=g'(r_j)$；$\partial r_j/\partial v_{ij}=x_i$。五个相乘就是 $\delta\,w_j\,g'(r_j)\,x_i$。`,
        T`**记号撞车提醒**：2021 Q13(b) 题目把隐藏层权重叫 $w$；本页和课件把隐藏层权重叫 $v_{ij}$（输入 $i$ → 隐藏单元 $j$），输出层权重叫 $w_j$。所以题目问的 $\partial L/\partial w$ 就是这里的 $\partial L/\partial v_{ij}$；答题时先声明记号，别让两个 $w$ 混在一个式子里。`,
        {
          t: 'past', src: '2021 S1 exam Q13(b)', marks: 6, topic: 'L11 p27–p31',
          q: 'Given that the output loss of a feed-forward network, $L$, is not a direct function of hidden-layer weights $w$, how is the derivative of loss with respect to hidden-layer weights, $\\partial L/\\partial w$, calculated in backpropagation? As part of your answer include the formulation of $\\partial L/\\partial w_j$ where $j$ is the index of a single weight parameter.',
          qzh: T`前馈网络（feed-forward network）的输出损失 $L$ 不是隐藏层权重 $w$ 的直接函数。那么在反向传播（backpropagation）中，损失对隐藏层权重的导数 $\partial L/\partial w$ 是怎么计算的？作为答案的一部分，写出 $\partial L/\partial w_j$ 的表达式，其中 $j$ 是单个权重参数的下标。`,
          azh: T`（在课件记号中，题目里的隐藏层权重 $w_j$ 就是 $v_{ij}$，即从输入 $i$ 到隐藏单元 $j$ 的权重；输出层权重是 $w_j$。）$L$ 只是通过隐藏权重所连接的单元间接地依赖于它：$v_{ij}\to r_j\to u_j\to s\to z\to L$。反向传播沿这条路径应用链式法则（chain rule）：
$$\frac{\partial L}{\partial v_{ij}}=\frac{\partial L}{\partial z}\frac{\partial z}{\partial s}\frac{\partial s}{\partial u_j}\frac{\partial u_j}{\partial r_j}\frac{\partial r_j}{\partial v_{ij}}=\delta\,w_j\,g'(r_j)\,x_i,$$
其中 $\delta=\partial L/\partial s$（例如平方损失加恒等输出时为 $z-y$）先在输出端算出，再向后传播；每一层复用上一层的误差项（error term），所以在一次保存了 $r_j,u_j$ 的前向传播之后，一次反向传播就能得到所有梯度。（如果有多个输出单元或下一层单元，则对它们的贡献求和。）`,
          sol: [
            '要点：(1) $L$ 通过"权重 → 隐藏单元输入 → 激活 → 输出层 → loss"间接依赖隐藏层权重；(2) 用链式法则沿这条路径把局部导数相乘；(3) 输出端的误差 $\\delta$ 先算出来，再逐层往回传、复用（这就是 back-propagation）。',
            {
              t: 'exam', md: T`(In lecture notation the hidden weight $w_j$ of the question is $v_{ij}$, from input $i$ to hidden unit $j$; output weights are $w_j$.) $L$ depends on a hidden weight only indirectly, through the units it feeds: $v_{ij}\to r_j\to u_j\to s\to z\to L$. Backpropagation applies the chain rule along this path:
$$\frac{\partial L}{\partial v_{ij}}=\frac{\partial L}{\partial z}\frac{\partial z}{\partial s}\frac{\partial s}{\partial u_j}\frac{\partial u_j}{\partial r_j}\frac{\partial r_j}{\partial v_{ij}}=\delta\,w_j\,g'(r_j)\,x_i,$$
where $\delta=\partial L/\partial s$ (e.g. $z-y$ for squared loss with identity output) is computed first at the output and then propagated backwards; each layer reuses the error term of the layer above, so all gradients are obtained in one backward pass after a forward pass that stores $r_j,u_j$. (With several output/next-layer units, the contributions are summed over them.)`,
            },
          ],
        },
        { t: 'h2', text: '3. 数值例子', id: 'example' },
        '2 个输入（含偏置 $x_0=1$，$x_1=1$），2 个 ReLU 隐藏单元，恒等输出，$y=0$。$V=\\begin{bmatrix}0.5&-0.5\\\\1&1\\end{bmatrix}$（第 $i$ 行是输入 $x_i$ 到各隐藏单元的权重），$\\bw=(w_0,w_1,w_2)=(0,1,-1)$。',
        { t: 'graph', r: 20, nodes: { x0: [40, 70], x1: [40, 190], u0: [230, 30], u1: [230, 120], u2: [230, 210], z: [400, 120] }, labels: { x0: 'x₀', x1: 'x₁', u0: 'u₀', u1: 'u₁', u2: 'u₂', z: 'z' }, notes: { x0: '=1（偏置）', x1: '=1', u0: '=1（偏置）', u1: 'u₁=1.5', u2: 'u₂=0.5', z: 'z=1' }, edges: 'x0>u1 x0>u2 x1>u1 x1>u2 u0>z=w₀=0 u1>z=w₁=1 u2>z=w₂=−1', w: 460, caption: '这道题的网络。输入到隐藏层的权重（矩阵 $V$ 只是把它们排成表：行 = 哪个输入，列 = 哪个隐藏单元）：$x_0\\to u_1$：0.5，$x_0\\to u_2$：−0.5，$x_1\\to u_1$：1，$x_1\\to u_2$：1。节点旁是前向算出的值。' },
        {
          t: 'steps', items: [
            '前向：$V$ 的行是输入 $x_0,x_1$、列是隐藏单元 $u_1,u_2$（$u_0=1$ 是输出层的偏置，不在 $V$ 里）。$r_1=x_0\\cdot0.5+x_1\\cdot1=1.5$，$r_2=x_0\\cdot(-0.5)+x_1\\cdot1=0.5$；ReLU $=\\max(0,r)$，两个都是正数，激活后不变：$u_1=1.5$，$u_2=0.5$。',
            '$s=0+1.5\\cdot1+0.5\\cdot(-1)=1=z$；$L=\\frac12(1-0)^2=0.5$；$\\delta=z-y=1$。',
            '输出层：$\\partial L/\\partial w_j=\\delta u_j$ ⇒ $(1,\\ 1.5,\\ 0.5)$（$w_0$ 对应 $u_0=1$）。',
            '隐藏层：ReLU 在正数处导数为 1，$\\varepsilon_1=\\delta\\cdot w_1\\cdot g\'(r_1)=1\\cdot1\\cdot1=1$，$\\varepsilon_2=1\\cdot(-1)\\cdot1=-1$；$\\partial L/\\partial v_{ij}=\\varepsilon_jx_i$。梯度矩阵和 $V$ 同形状（行 = 输入 $x_0,x_1$，列 = $u_1,u_2$）：$x_0=x_1=1$，所以 $\\begin{bmatrix}1&-1\\\\1&-1\\end{bmatrix}$。',
          ],
        },
        { t: 'note', md: '这些数字由 `js/core/backprop.js` 计算，并与 L11 p28–p31 的公式逐项核对过。' },
      ],
    },
    {
      id: 'T11',
      eyebrow: '题型 T11 · worksheet 5 题型',
      title: 'Perceptron 手算更新',
      en: 'Perceptron updates by hand',
      chips: [{ text: 'L10 p13–p39', href: '#/L10', cls: 'src' }, { text: 'WK05', cls: 'src' }],
      lead: '往年卷没直接考，但 worksheet 5 练过，属于"会了就是送分"的题。规则只有一条：$y\\cdot s\\le0$ 就加上 $\\eta y\\bx$。',
      blocks: [
        {
          t: 'steps', items: [
            '把偏置写成 $w_0$，输入前面补 $x_0=1$。',
            '对当前样本算 $s=\\bw\'\\bx$，再算 $y\\cdot s$。',
            '$y\\cdot s\\le0$（分错，或者刚好在边界上）⇒ $\\bw\\leftarrow\\bw+\\eta y\\bx$，**包括** $w_0\\leftarrow w_0+\\eta y$。否则不动。',
            '按顺序处理下一个样本；一个 epoch 没有任何更新就停（数据可分时一定会发生）。',
          ],
        },
        { t: 'viz', id: 'perceptron-stepper' },
        {
          t: 'note', md: T`为什么是**加** $\eta y\mathbf x$：分错时损失 $\max(0,-y\mathbf w'\mathbf x)$ 对 $\mathbf w$ 的梯度是 $-y\mathbf x$；梯度下降 $\mathbf w\leftarrow\mathbf w-\eta\cdot(-y\mathbf x)=\mathbf w+\eta y\mathbf x$。`,
        },
        {
          t: 'exam', md: T`Perceptron update: for each training example, compute $s=\mathbf w'\mathbf x$ (with $x_0=1$); if $y\,s\le0$ the example is misclassified and we set $\mathbf w\leftarrow\mathbf w+\eta\,y\,\mathbf x$, otherwise $\mathbf w$ is unchanged. This is stochastic gradient descent on the perceptron loss $\max(0,-y\,\mathbf w'\mathbf x)$, whose gradient is $-y\mathbf x$ for misclassified points and $\mathbf 0$ otherwise.`,
        },
      ],
    },
    {
      id: 'T12',
      eyebrow: '题型 T12 · 代公式',
      title: 'Experts mistake bound 与泛化界',
      en: 'Mistake bounds and generalisation bounds',
      chips: [{ text: 'L16', href: '#/L16', cls: 'src' }, { text: 'L06 p17', href: '#/L06', cls: 'src' }, { text: 'L07 p31', href: '#/L07', cls: 'src' }],
      lead: '往年卷没直接考计算，但简答可能问"这个界说明了什么"。会代数、会解释每一项就够了。',
      blocks: [
        '符号：前三行的 $n$ 是**专家个数**，$M$ 是学习者犯错次数，$m$ 是最好专家的犯错次数。后两行的 $n$ 是**样本个数**（不是专家个数）；$R$ 是真实风险（期望测试误差），$\\hat R$ 是训练误差，$|\\mathcal F|$ 是模型类里有几个模型，界以至少 $1-\\delta$ 的概率成立。',
        {
          t: 'table', head: ['界', '公式', '每一项说明什么'], rows: [
            ['Majority（完美专家）', '$M\\le\\log_2 n$', '每错一次，存活专家至少减半'],
            ['Halving', '$M\\le\\frac{m+\\log_2n}{\\log_2(4/3)}$（系数 $1/\\log_2(4/3)\\approx1/0.415\\approx2.41$）', '最好专家错 $m$ 次；专家数只以 $\\log$ 影响'],
            ['Weighted majority', '$M\\le2(1+\\varepsilon)m+2\\ln n/\\varepsilon$（注意这里是自然对数 $\\ln$，上面两行是 $\\log_2$）', '$\\varepsilon$ 小：$m$ 系数接近 2，但 $\\ln n$ 项变大'],
            ['有限类泛化', '$R\\le\\hat R+\\sqrt{(\\log|\\mathcal F|+\\log(1/\\delta))/(2n)}$', '模型类大 → 惩罚大；$n$ 大 → 惩罚小'],
            ['VC 泛化', '$R\\le\\hat R+\\sqrt{8\\,\\frac{\\VC\\log(2n+1)+\\log(4/\\delta)}{n}}$', '用 VC 维代替 $\\log|\\mathcal F|$'],
          ],
        },
        {
          t: 'quiz', items: [
            { q: '32 个专家，有一个从不出错。Majority 最多错几次？', type: 'num', answer: 5, explain: '$\\log_2 32=5$。' },
            { q: 'Weighted majority，$m=10$，$n=e^4$，$\\varepsilon=0.5$。上界？', type: 'num', answer: 46, explain: '$\\ln n=\\ln(e^4)=4$。$2(1+0.5)\\times10=30$；$2\\times4/0.5=16$；上界 $30+16=46$。' },
            { q: '有限类界里 $|\\mathcal F|$ 从 8 变成 64，$\\log|\\mathcal F|$ 变为几倍？', type: 'num', answer: 2, explain: '$\\log64=2\\log8$。' },
          ],
        },
      ],
    },
  ]);
})(window);
