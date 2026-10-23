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
      eyebrow: '题型 T10 · 2021 Q13(b) 6 分 · 2022 Q5 14 分',
      title: 'Backprop：隐藏层权重的梯度',
      en: 'Backpropagation through one hidden layer',
      chips: [{ text: 'L11 p25–p31', href: '#/L11', cls: 'src' }, { text: 'L13 p23', href: '#/L13', cls: 'src' }, { text: '2021 exam Q13b', cls: 'hot' }, { text: '2022 exam Q5', cls: 'hot' }],
      lead: '考法：解释"为什么 loss 不直接含隐藏层权重也能求导"，并写出 $\\partial L/\\partial w_j$ 的链式法则展开。偶尔会给一个小网络让你代数字。2022 年还考过把一个小 CNN 写成函数，再穿过 max pooling 反传（第 4 节）。',
      blocks: [
        { t: 'h2', text: '1. 记号（L11 p9）', id: 'notation' },
        T`读表前先说字母：$m$ 是输入特征个数（不算偏置 $x_0$），$p$ 是隐藏单元个数，$i=0,\dots,m$、$j=1,\dots,p$ 是下标。$g$ 是隐藏层的**激活函数**（本页例子用 ReLU：$g(r)=\max(0,r)$），$h$ 是输出层的激活（回归时取恒等），$y$ 是样本的真实目标值；$u_0=1$ 是输出层的偏置输入。`,
        {
          t: 'table', head: ['量', '定义'], rows: [
            ['输入', '$x_0=1$（偏置），$x_1,\\dots,x_m$'], ['隐藏层', '$r_j=\\sum_{i=0}^mx_iv_{ij}$，$u_j=g(r_j)$，$u_0=1$'],
            ['输出', '$s=\\sum_{j=0}^pu_jw_j$，$z=h(s)$（回归时 $h$ 为恒等）'], ['损失', '$L=\\frac12(z-y)^2$'],
          ],
        },
        { t: 'h2', text: '2. 三个公式', id: 'formulas' },
        { t: 'math', tex: T`\delta=\frac{\partial L}{\partial s}=(z-y)\,h'(s)\ \ (=z-y\text{ when }z=s),\qquad \frac{\partial L}{\partial w_j}=\delta\,u_j,\qquad \frac{\partial L}{\partial v_{ij}}=\underbrace{\delta\,w_j\,g'(r_j)}_{\varepsilon_j}\,x_i` },
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

        { t: 'h2', text: '4. 真题全解：卷积 + global max pooling 的反传', id: 'cnn-max' },
        T`2022 S1 Q5（14 分）考的是一个缩到最小的 CNN（卷积神经网络，convolutional neural network）：一个 $2\times2$ 的 filter（滤波器）在 $3\times3$ 的图上滑，得到 $2\times2$ 的特征图，再取全局最大值（global max pooling）作为输出。前向就是 [T3](#/T03) 的卷积手算；反向要用两件事：max 的次梯度（sub-gradient，[c39](#/c39)，L13 p23）和权重共享（weight sharing）。`,
        {
          t: 'steps', items: [
            T`**给参数起名，写出特征图。** filter 的 4 个权重记为 $w_{1,1},w_{1,2},w_{2,1},w_{2,2}$，bias 记为 $b$。特征图每一格 = 对应的 $2\times2$ 输入窗口和 filter 逐元素相乘求和，再加 $b$。`,
            T`**输出取最大值。** $y=\max_{i,j}h_{i,j}$。前向时记下取到最大值的位置 $(i^*,j^*)$。`,
            T`**穿过 max。** 只有赢家满足 $\partial y/\partial h_{i^*,j^*}=1$，其余三格都是 0（并列最大时只挑一个）。所以输出端的梯度 $\delta=\partial L/\partial y$ 只流到 $h_{i^*,j^*}$。`,
            T`**穿过卷积。** 同一个 $w_{a,c}$（$a,c\in\{1,2\}$ 是 filter 内的行、列位置）在 4 个位置都用过，链式法则要把 4 个位置的贡献加起来：$\frac{\partial L}{\partial w_{a,c}}=\sum_{i,j}\frac{\partial L}{\partial h_{i,j}}\,x_{i+a-1,\,j+c-1}$。经过 max 后，只剩赢家那一项。`,
          ],
        },
        {
          t: 'past', src: '2022 S1 exam Q5', marks: '6 + 8', topic: 'L13 p11, p23 · L11 p27–p31',
          q: T`Consider a simple Convolutional Neural Network for processing $3\times3$ images, with a single filter of size $2\times2$, applied with no padding and stride of $1\times1$. The next step is global max-pooling, which takes the filter output (size $2\times2$) to produce a single output.

1. What mathematical function is defined by the network, relating its output $y$ to its input $x_{1,1},x_{1,2},\dots,x_{3,3}$? You will need to introduce new variables for the model's parameters. [6 marks]
2. Explain how a loss gradient at the output is back-propagated through the network, and show the mathematical form of the loss gradient with respect to the model parameters. [8 marks]`,
          qzh: T`一个处理 $3\times3$ 图像的简单 CNN：只有一个 $2\times2$ 的 filter，无 padding，stride $1\times1$。之后做 global max pooling，把 filter 的输出（$2\times2$）变成一个输出。1. 这个网络定义的、把输出 $y$ 和输入 $x_{1,1},x_{1,2},\dots,x_{3,3}$ 联系起来的数学函数是什么？需要为模型参数引入新的变量。（6 分）2. 解释输出端的 loss 梯度如何在网络中反向传播，并写出 loss 对模型参数的梯度的数学形式。（8 分）`,
          sol: [
            { t: 'h4', text: '第 1 问：写出函数' },
            T`输出边长 = 图边长 − filter 边长 + 1（stride 为 1、无 padding）= $3-2+1=2$，所以特征图 $h$ 是 $2\times2$。参数：filter 的 4 个权重 $w_{a,c}$（$a,c\in\{1,2\}$）和一个 bias $b$。题目没说有没有 bias，写上 $b$ 更完整；没有 bias 就令 $b=0$。`,
            {
              t: 'table', head: ['特征图格', '用到的输入窗口', '值'], rows: [
                [T`$h_{1,1}$`, '第 1–2 行、第 1–2 列', T`$w_{1,1}x_{1,1}+w_{1,2}x_{1,2}+w_{2,1}x_{2,1}+w_{2,2}x_{2,2}+b$`],
                [T`$h_{1,2}$`, '第 1–2 行、第 2–3 列', T`$w_{1,1}x_{1,2}+w_{1,2}x_{1,3}+w_{2,1}x_{2,2}+w_{2,2}x_{2,3}+b$`],
                [T`$h_{2,1}$`, '第 2–3 行、第 1–2 列', T`$w_{1,1}x_{2,1}+w_{1,2}x_{2,2}+w_{2,1}x_{3,1}+w_{2,2}x_{3,2}+b$`],
                [T`$h_{2,2}$`, '第 2–3 行、第 2–3 列', T`$w_{1,1}x_{2,2}+w_{1,2}x_{2,3}+w_{2,1}x_{3,2}+w_{2,2}x_{3,3}+b$`],
              ],
            },
            { t: 'math', tex: T`y=\max\big(h_{1,1},h_{1,2},h_{2,1},h_{2,2}\big)=\max_{i,j\in\{1,2\}}\Big(\sum_{a=1}^{2}\sum_{c=1}^{2}w_{a,c}\,x_{i+a-1,\,j+c-1}+b\Big)` },
            T`下标的意思：$(i,j)$ 是窗口左上角在图上的位置，$(a,c)$ 是 filter 里的位置，所以 filter 的 $(a,c)$ 格乘的是图上的 $(i+a-1,\ j+c-1)$ 格。这和 L13 p11 的写法一样，都不翻转 kernel（kernel 就是 filter，两种叫法）。题目没有提激活函数，所以不加；如果 pooling 前有 ReLU 之类的单调激活 $\phi$，赢家位置不变，第 2 问的梯度多乘一个 $\phi'(h_{i^*,j^*})$。`,
            { t: 'h4', text: '第 2 问：反向传播' },
            T`设输出端的 loss 梯度为 $\delta=\partial L/\partial y$（本节 $y$ 指网络输出，目标值改用 $t$；第 1–3 节的 $y$ 是目标值，那里的 $\delta=\partial L/\partial s$，两者不是同一个量）。例如平方损失 $L=\frac12(y-t)^2$（$t$ 是目标值）时，$\delta=y-t$。`,
            T`**① 穿过 max pooling。** max 不是处处可导，用 sub-gradient：前向时记下赢家 $(i^*,j^*)=\arg\max_{i,j}h_{i,j}$，规定 $\frac{\partial y}{\partial h_{i,j}}=1$ 若 $(i,j)=(i^*,j^*)$，否则为 0。所以 $\frac{\partial L}{\partial h_{i^*,j^*}}=\delta$，另外三格的梯度是 0：没赢的格子稍微变一点，$y$ 不会变。`,
            T`**② 穿过卷积。** $\frac{\partial h_{i,j}}{\partial w_{a,c}}=x_{i+a-1,\,j+c-1}$，$\frac{\partial h_{i,j}}{\partial b}=1$。$w_{a,c}$ 被 4 个位置共享，链式法则把 4 项加起来，其中只有赢家那项不是 0：`,
            { t: 'math', tex: T`\frac{\partial L}{\partial w_{a,c}}=\sum_{i,j}\frac{\partial L}{\partial y}\,\frac{\partial y}{\partial h_{i,j}}\,\frac{\partial h_{i,j}}{\partial w_{a,c}}=\delta\,x_{i^*+a-1,\,j^*+c-1},\qquad \frac{\partial L}{\partial b}=\delta` },
            T`也就是说，filter 的梯度 = $\delta$ 乘赢家那个 $2\times2$ 输入窗口。梯度下降走一步（$\eta$ 是学习率，即步长）：$w_{a,c}\leftarrow w_{a,c}-\eta\,\delta\,x_{i^*+a-1,\,j^*+c-1}$。`,
            { t: 'h4', text: '代数字核对' },
            T`取 $\mathbf X=\begin{bmatrix}1&2&0\\0&1&3\\2&1&1\end{bmatrix}$，filter $\begin{bmatrix}w_{1,1}&w_{1,2}\\w_{2,1}&w_{2,2}\end{bmatrix}=\begin{bmatrix}1&-1\\0&2\end{bmatrix}$，$b=0$，目标 $t=5$，$L=\frac12(y-t)^2$。`,
            {
              t: 'steps', items: [
                T`前向：$h_{1,1}=1-2+0+2=1$，$h_{1,2}=2-0+0+6=8$，$h_{2,1}=0-1+0+2=1$，$h_{2,2}=1-3+0+2=0$。所以 $y=8$，赢家是 $(1,2)$。`,
                T`$L=\frac12(8-5)^2=4.5$，$\delta=y-t=3$。`,
                T`赢家窗口是第 1–2 行、第 2–3 列：$\begin{bmatrix}2&0\\1&3\end{bmatrix}$。所以 $\partial L/\partial\mathbf W$（$\mathbf W$ 是 filter 的权重矩阵，即把 $\partial L/\partial w_{a,c}$ 排成表）$=3\times\begin{bmatrix}2&0\\1&3\end{bmatrix}=\begin{bmatrix}6&0\\3&9\end{bmatrix}$，$\partial L/\partial b=3$。（用数值差分核对过，结果相同。）`,
              ],
            },
            { t: 'graph', r: 20, nodes: { h11: [70, 40], h12: [70, 110], h21: [70, 180], h22: [70, 250], y: [280, 145] }, labels: { h11: 'h₁₁', h12: 'h₁₂', h21: 'h₂₁', h22: 'h₂₂', y: 'y' }, notes: { h11: '=1', h12: '=8', h21: '=1', h22: '=0', y: '=8' }, edges: 'h11>y=0 h12>y:path=1 h21>y=0 h22>y=0', w: 360, caption: 'max pooling 的反向：粗红边是前向的赢家 $h_{1,2}$，$\\partial y/\\partial h_{1,2}=1$；其余三条边上是 0，梯度传不过去。' },
            {
              t: 'exam', md: T`1. Let the filter weights be $w_{1,1},w_{1,2},w_{2,1},w_{2,2}$ and the bias $b$. The convolution gives a $2\times2$ feature map
$$h_{i,j}=\sum_{a=1}^{2}\sum_{c=1}^{2}w_{a,c}\,x_{i+a-1,\,j+c-1}+b,\qquad i,j\in\{1,2\},$$
e.g. $h_{1,1}=w_{1,1}x_{1,1}+w_{1,2}x_{1,2}+w_{2,1}x_{2,1}+w_{2,2}x_{2,2}+b$, and global max pooling gives $y=\max(h_{1,1},h_{1,2},h_{2,1},h_{2,2})$.

2. Let $\delta=\partial L/\partial y$ be the loss gradient at the output (e.g. $\delta=y-t$ for $L=\frac12(y-t)^2$). Max pooling is not differentiable everywhere, so backpropagation uses a sub-gradient: the forward pass records the maximising position $(i^*,j^*)=\arg\max_{i,j}h_{i,j}$, and $\partial y/\partial h_{i,j}=1$ if $(i,j)=(i^*,j^*)$ and $0$ otherwise. Hence the whole gradient $\delta$ flows to $h_{i^*,j^*}$ and none to the other three units. Each filter weight is shared across all positions, so by the chain rule its gradient sums over positions, and only the maximising position contributes:
$$\frac{\partial L}{\partial w_{a,c}}=\sum_{i,j}\frac{\partial L}{\partial h_{i,j}}\,x_{i+a-1,\,j+c-1}=\delta\,x_{i^*+a-1,\,j^*+c-1},\qquad\frac{\partial L}{\partial b}=\delta.$$
So the gradient of the filter is $\delta$ times the $2\times2$ input patch that produced the maximum.`,
            },
          ],
          azh: T`1. 设 filter 权重为 $w_{1,1},w_{1,2},w_{2,1},w_{2,2}$，bias 为 $b$。卷积得到 $2\times2$ 的特征图（feature map）$h_{i,j}=\sum_{a=1}^{2}\sum_{c=1}^{2}w_{a,c}\,x_{i+a-1,\,j+c-1}+b$，$i,j\in\{1,2\}$，例如 $h_{1,1}=w_{1,1}x_{1,1}+w_{1,2}x_{1,2}+w_{2,1}x_{2,1}+w_{2,2}x_{2,2}+b$；global max pooling 给出 $y=\max(h_{1,1},h_{1,2},h_{2,1},h_{2,2})$。2. 设 $\delta=\partial L/\partial y$ 是输出端的 loss 梯度（例如 $L=\frac12(y-t)^2$ 时 $\delta=y-t$）。max pooling 不是处处可导，所以反向传播用次梯度（sub-gradient）：前向时记下取最大值的位置 $(i^*,j^*)=\arg\max_{i,j}h_{i,j}$，$(i,j)=(i^*,j^*)$ 时 $\partial y/\partial h_{i,j}=1$，否则为 $0$。因此全部梯度 $\delta$ 流向 $h_{i^*,j^*}$，另外三个单元得不到梯度。每个 filter 权重在所有位置共享（weight sharing），按链式法则它的梯度要对所有位置求和，而只有取最大值的位置有贡献：$\frac{\partial L}{\partial w_{a,c}}=\sum_{i,j}\frac{\partial L}{\partial h_{i,j}}\,x_{i+a-1,\,j+c-1}=\delta\,x_{i^*+a-1,\,j^*+c-1}$，$\frac{\partial L}{\partial b}=\delta$。也就是说，filter 的梯度等于 $\delta$ 乘以产生最大值的那个 $2\times2$ 输入窗口。`,
        },
        {
          t: 'quiz', items: [
            {
              id: 'T10-maxpool-grad', type: 'num', answer: -6,
              q: T`同一张图 $\mathbf X=\begin{bmatrix}1&2&0\\0&1&3\\2&1&1\end{bmatrix}$，换成 filter $\begin{bmatrix}w_{1,1}&w_{1,2}\\w_{2,1}&w_{2,2}\end{bmatrix}=\begin{bmatrix}0&1\\1&0\end{bmatrix}$，$b=0$，目标 $t=6$，$L=\frac12(y-t)^2$。求 $\partial L/\partial w_{1,2}$。`,
              explain: T`这个 filter 每格只取窗口的右上 + 左下。前向：$h_{1,1}=2+0=2$，$h_{1,2}=0+1=1$，$h_{2,1}=1+2=3$，$h_{2,2}=3+1=4$。$y=4$，赢家 $(2,2)$，窗口是第 2–3 行、第 2–3 列 $\begin{bmatrix}1&3\\1&1\end{bmatrix}$。$\delta=y-t=4-6=-2$。$w_{1,2}$ 乘的是窗口右上格 $x_{2,3}=3$，所以 $\partial L/\partial w_{1,2}=-2\times3=-6$。整个 filter 的梯度是 $-2\times\begin{bmatrix}1&3\\1&1\end{bmatrix}=\begin{bmatrix}-2&-6\\-2&-2\end{bmatrix}$。`,
            },
          ],
        },
      ],
    },
    {
      id: 'T11',
      eyebrow: '题型 T11 · 2016 Q7 2 分 · worksheet 5 题型',
      title: 'Perceptron 手算更新',
      en: 'Perceptron updates by hand',
      chips: [{ text: 'L10 p13–p39', href: '#/L10', cls: 'src' }, { text: 'WK05', cls: 'src' }, { text: '2016 exam Q7', cls: 'hot' }],
      lead: '往年卷只考过一次手算（2016 S2 Q7，2 分，见本页最后），worksheet 5 也练过，属于"会了就是送分"的题。规则只有一条：$y\\cdot s\\le0$ 就加上 $\\eta y\\bx$（$s$ 是打分 score，$\\bx$ 是样本特征、最前面补一个 1 当偏置，$\\eta>0$ 是学习率 learning rate，即每次走多远）。',
      blocks: [
        {
          t: 'steps', items: [
            '把偏置写成 $w_0$，输入前面补 $x_0=1$。',
            '对当前样本算 $s=\\bw\'\\bx$，再算 $y\\cdot s$。',
            '$y\\cdot s\\le0$（分错，或者刚好在边界上）⇒ $\\bw\\leftarrow\\bw+\\eta y\\bx$，**包括** $w_0\\leftarrow w_0+\\eta y$。否则不动。',
            '按顺序处理下一个样本；一个 epoch（把所有样本过一遍）没有任何更新就停（数据可分，即存在一条直线能把两类分开时，一定会发生）。',
          ],
        },
        { t: 'viz', id: 'perceptron-stepper' },
        {
          t: 'note', md: T`为什么是**加** $\eta y\mathbf x$：分错时用 perceptron 损失 $\max(0,-y\mathbf w'\mathbf x)$：分对时它等于 0，分错时等于 $-y\mathbf w'\mathbf x$；$\max(0,z)$ 在 $z>0$ 处导数为 1，而 $-y\mathbf w'\mathbf x$ 对 $\mathbf w$ 求导得 $-y\mathbf x$，所以梯度是 $-y\mathbf x$；梯度下降 $\mathbf w\leftarrow\mathbf w-\eta\cdot(-y\mathbf x)=\mathbf w+\eta y\mathbf x$。`,
        },
        {
          t: 'exam', md: T`Perceptron update: for each training example, compute $s=\mathbf w'\mathbf x$ (with $x_0=1$); if $y\,s\le0$ (misclassified, or exactly on the boundary) we set $\mathbf w\leftarrow\mathbf w+\eta\,y\,\mathbf x$, otherwise $\mathbf w$ is unchanged. This is stochastic gradient descent on the perceptron loss $\max(0,-y\,\mathbf w'\mathbf x)$, whose gradient is $-y\mathbf x$ for misclassified points and $\mathbf 0$ otherwise.`,
        },
        { t: 'h3', text: 'Worksheet 5 Ex3 全解' },
        T`题目：$\mathbf X$ 的四行 $(1,1,1),(1,1,2),(1,0,0),(1,-1,0)$（第一列是 bias 输入 $x_0=1$），$\mathbf y=(1,1,-1,-1)$，$\eta=0.1$，$\bw$ 从 $\mathbf 0$ 开始，按顺序过样本。题目要求用 **pseudocode 规则**（pseudocode = 伪代码）：先预测 $\hat y$（$s\ge0$ 判 $+1$，否则 $-1$），$\hat y\ne y$ 才做 $\bw\leftarrow\bw+\eta y\bx$。`,
        {
          t: 'table', cls: 'compact', head: ['Epoch（第几轮）', '样本 $\\bx$', '$s=\\bw\'\\bx$（打分）', '预测 $\\hat y$ / 真值 $y$（✗ = 预测错）', '更新后 $\\bw$'], rows: [
            ['1', '$(1,1,1)$', '0', '+1 / +1', '不变 $(0,0,0)$'],
            ['1', '$(1,1,2)$', '0', '+1 / +1', '不变'],
            ['1', '$(1,0,0)$', '0', '+1 / −1 ✗', '$(0,0,0)-0.1(1,0,0)=(-0.1,0,0)$'],
            ['1', '$(1,-1,0)$', '−0.1', '−1 / −1', '不变'],
            ['2', '$(1,1,1)$', '−0.1', '−1 / +1 ✗', '$(-0.1,0,0)+0.1(1,1,1)=(0,0.1,0.1)$'],
            ['2', '$(1,1,2)$', '0.3', '+1 / +1', '不变'],
            ['2', '$(1,0,0)$', '0', '+1 / −1 ✗', '$(0,0.1,0.1)-0.1(1,0,0)=(-0.1,0.1,0.1)$'],
            ['2', '$(1,-1,0)$', '−0.2', '−1 / −1', '不变'],
            ['3', '四个样本', '0.1, 0.2, −0.1, −0.2', '全对', '停'],
          ],
        },
        T`答案：$\bw=(-0.1,0.1,0.1)$，共 3 次更新，第 3 个 epoch 没有更新，停止。决策规则：$-0.1+0.1x_1+0.1x_2\ge0$，即 $x_1+x_2\ge1$ 判 $+1$。`,
        {
          t: 'note', title: '两种规则：考试写哪个', md: T`**区别只在 $s=0$。** 本页上面的规则（L10）是 $y\cdot s\le0$ 就更新；pseudocode 在 $s=0$、$y=+1$ 时判对、不更新。同一道题改用 $y\cdot s\le0$ 规则（$s=0$ 也算错）：更新发生在第 1 轮（E1 = Epoch 1）的 $(1,1,1)$、第 1 轮的 $(1,0,0)$、第 2 轮的 $(1,0,0)$，$\bw$ 依次变成 $(0.1,0.1,0.1)$、$(0,0.1,0.1)$、$(-0.1,0.1,0.1)$；路径不同，终点和上面一样。如果把 $s=0$ 判成 $-1$，结果会变成 $(0,0.1,0.1)$。考试时，题目指定了规则就照题目；没指定就用课件的 $y\cdot s\le0$，并在第一行写明约定，例如 "predict $+1$ if $s\ge0$; update when $y\,s\le0$"。`,
        },
        { t: 'h3', text: '真题：2016 S2 Q7（唯一考过的 perceptron 手算）' },
        {
          t: 'past', src: '2016 S2 Q7', marks: 2, topic: 'L10 p13–p39',
          q: T`Consider a 2-class classification problem and *perceptron* training algorithm. Assume you have a 3-feature prediction function
$$f(x)=w_1x_1+w_2x_2+w_3x_3$$
and current weights $\mathbf w=[2,3,4]'$. For simplicity assume that there is no bias term. Given an *example* $\mathbf x=[-2,3,1]'$ and *label* $y=-1$, what are the updated *weights*? Introduce additional *parameter(s)* if required, and specify which values were used for these parameter(s).`,
          qzh: T`二分类问题，用 perceptron 训练算法。预测函数有 3 个特征：$f(x)=w_1x_1+w_2x_2+w_3x_3$，当前权重 $\mathbf w=[2,3,4]'$，为简单起见没有 bias 项。给定样本 $\mathbf x=[-2,3,1]'$、标签 $y=-1$，更新后的权重是多少？如有需要可以引入额外的参数，并说明用了什么值。`,
          sol: [
            T`题目自己的约定：**没有 bias**，所以不用补 $x_0=1$，$\bw$ 只有 3 个分量；标签取 $\pm1$。"引入参数"指的是学习率 $\eta$：课件的更新规则里有它，题目没给，要自己设一个值并写明。`,
            {
              t: 'table', cls: 'compact', head: ['样本', '$s=\\bw\'\\bx$', '$\\hat y$ / $y$', '更新后 $\\bw$'], rows: [
                [T`$(-2,3,1)$`, T`$2\cdot(-2)+3\cdot3+4\cdot1=9$`, '+1 / −1 ✗', T`$(2,3,4)-\eta\,(-2,3,1)=(2+2\eta,\ 3-3\eta,\ 4-\eta)$`],
              ],
            },
            T`判断：$s=9\ge0$，预测 $+1$，而 $y=-1$。用课件规则看，$y\cdot s=-9\le0$，分错，要更新。这里 $s\ne0$，所以"$y\cdot s\le0$ 就更新"和"$\hat y\ne y$ 才更新"两种约定结果一样。`,
            T`更新：$\bw\leftarrow\bw+\eta y\bx=\bw-\eta\bx$。取 $\eta=0.1$（和本页例子一样）：$\bw=(2.2,\ 2.7,\ 3.9)$。如果取 $\eta=1$：$\bw=(4,\ 0,\ 3)$。`,
            T`核对：$\eta=0.1$ 时新的 $s=2.2\cdot(-2)+2.7\cdot3+3.9\cdot1=-4.4+8.1+3.9=7.6$，仍然 $>0$，这个样本还是分错。一次更新把 $\bw$ 变成 $\bw-\eta\bx$，所以 $s$ 减少 $\eta\|\bx\|^2$（$\|\bx\|^2=(-2)^2+3^2+1^2=14$），即 $9-0.1\times14=7.6$，只推了一步，不保证一步改对；$\eta=1$ 时 $s=9-14=-5$，已经分对。题目只要求写一步更新。`,
            {
              t: 'exam', md: T`No bias, so $s=\mathbf w'\mathbf x=2(-2)+3(3)+4(1)=9$. The prediction is $+1$ but $y=-1$ ($y\,s=-9\le0$), so the example is misclassified and the perceptron updates
$$\mathbf w\leftarrow\mathbf w+\eta\,y\,\mathbf x=\mathbf w-\eta\,\mathbf x=[2+2\eta,\ 3-3\eta,\ 4-\eta]',$$
where $\eta>0$ is the learning rate (a parameter we introduce). With $\eta=0.1$: $\mathbf w=[2.2,\ 2.7,\ 3.9]'$. (With $\eta=1$: $\mathbf w=[4,\ 0,\ 3]'$.)`,
            },
          ],
          azh: T`没有 bias，所以 $s=\mathbf w'\mathbf x=2(-2)+3(3)+4(1)=9$。预测为 $+1$，而 $y=-1$（$y\,s=-9\le0$），所以这个样本被分错，perceptron 更新 $\mathbf w\leftarrow\mathbf w+\eta\,y\,\mathbf x=\mathbf w-\eta\,\mathbf x=[2+2\eta,\ 3-3\eta,\ 4-\eta]'$，其中 $\eta>0$ 是我们引入的参数学习率（learning rate）。取 $\eta=0.1$：$\mathbf w=[2.2,\ 2.7,\ 3.9]'$。（取 $\eta=1$：$\mathbf w=[4,\ 0,\ 3]'$。）`,
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
        '符号：每一行的「界」（bound）都是**上界**——最坏情况下也不会超过的值。前四行的 $n$ 是**专家个数**，$M$ 是学习者犯错次数，$m$ 是最好专家的犯错次数；第 4 行改用损失（每轮在 $[0,1]$ 内）：$L$ 是学习者的期望总损失，$L^*$ 是最好专家的总损失，$L-L^*$ 叫 regret（遗憾）。后两行的 $n$ 是样本个数（不是专家个数）；$R$ 是真实风险（期望测试误差），$\\hat R$ 是训练误差，$|\\mathcal F|$ 是模型类里有几个模型，界以至少 $1-\\delta$ 的概率成立。表格里的 $\\varepsilon$ 是算法自己的参数（题目会给值，如 0.5）；$\\VC$ 是 VC 维（VC dimension，衡量模型类有多复杂的一个数，见 [T1](#/T01)）。',
        T`前四行是四个「专家建议」算法：每轮专家先预测，学习者据此预测，事后才看到对错。Majority 假设存在一个**从不出错**的专家，按剩余专家的多数票预测，猜错的专家直接淘汰；Halving 不假设完美专家，按加权多数票预测，猜错的专家权重减半（不淘汰），所以它的界里多出最好专家的错数 $m$；Weighted majority 和 Halving 一样，只是猜错时权重乘 $1-\varepsilon$；Probabilistic experts 每轮按权重随机抽一个专家来用，衡量的是期望损失。`,
        {
          t: 'table', head: ['界', '公式', '每一项说明什么'], rows: [
            ['Majority（完美专家）', '$M\\le\\log_2 n$', '每错一次，存活专家至少减半'],
            ['Halving', '$M\\le\\frac{m+\\log_2n}{\\log_2(4/3)}$（系数 $1/\\log_2(4/3)\\approx1/0.415\\approx2.41$）', '最好专家错 $m$ 次；专家数只以 $\\log$ 影响'],
            ['Weighted majority', '$M\\le2(1+\\varepsilon)m+2\\ln n/\\varepsilon$（注意这里是自然对数 $\\ln$，上面两行是 $\\log_2$）', '$\\varepsilon$ 小：$m$ 系数接近 2，但 $\\ln n$ 项变大'],
            ['Probabilistic experts', '$L\\le\\frac{\\ln n}{\\varepsilon}+(1+\\varepsilon)L^*$（自然对数）', '对最好专家的系数降到 $1+\\varepsilon$；$\\frac{\\ln n}{\\varepsilon}$ 不随轮数变，轮数少时界可能比平凡上界（轮数 × 1）还大，例见 [c46](#/c46)'],
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
