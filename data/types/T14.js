/* T14 — linear / logistic regression, MLE, MAP, Newton (L02–L04): derivations and short answers. */
(function (root) {
  'use strict';
  const T = String.raw;

  root.SML.content.add({
    id: 'T14',
    eyebrow: '题型 T14 · 2026 practice Q1(a) 2 分 · 今年 Quiz 1 全部 3 题 · 往年 5/7 份',
    title: '线性回归、MLE / MAP 与 Newton：推导和简答',
    en: 'Linear & logistic regression, MLE / MAP, Newton–Raphson',
    chips: [
      { text: 'L02 p10–p26', href: '#/L02', cls: 'src' }, { text: 'L03 p6–p19', href: '#/L03', cls: 'src' }, { text: 'L04 p5–p28', href: '#/L04', cls: 'src' },
      { text: '2026 practice Q1a', cls: 'hot' }, { text: 'Canvas Quiz 1', cls: 'hot' }, { text: '2017 Q2(c)', cls: 'hot' },
    ],
    lead: T`这一类分值不大（每问 1–3 分），但**几乎每份卷都有**，而且答案固定，是保底分。考法三种：① 一句话简答（线性回归最小化什么、MLE 和 MAP 的关系、为什么 logistic 要迭代）；② 短推导（写出似然 → 取 log → 求导 = 0；最小二乘 = Gaussian MLE；Newton 一步得到正规方程）；③ 小计算（一维 Newton 一步、Bernoulli / Normal 的 MLE）。`,
    blocks: [
      { t: 'h2', text: '1. 怎么认出这道题', id: 'spot' },
      {
        t: 'table', head: ['题干里看到', '要写的东西', '在哪练'], rows: [
          ['*what quantity is minimised by linear regression*', '残差平方和 $\\sum_i(y_i-\\bx_i\'\\bw)^2$', '第 7 节'],
          ['*maximum likelihood estimate*、*derive the MLE*', 'MLE 四步（第 3 节）', '第 3 节、[c06](#/c06)'],
          ['*show that least squares is equivalent to MLE*', 'Gaussian 噪声推导模板（第 4 节）', '2017 Q2(c)'],
          ['*Newton–Raphson*、*Hessian*、*how many steps*', '$\\theta\\leftarrow\\theta-L\'/L\'\'$；二次函数一步到位', 'Quiz 1.3、2020 Q3'],
          ['*MAP vs MLE*、*prior*', 'MAP = MLE + log prior；均匀先验时相同', 'Quiz 1.1'],
          ['*logistic regression*、*gradient descent*、*closed form*', 'logistic 的似然导数 = 0 没有闭式解，要迭代', '2016 Q2.2'],
        ],
      },

      { t: 'h2', text: '2. 必背的几个式子', id: 'core' },
      {
        t: 'table', head: ['量', '公式', '出处'], rows: [
          ['线性回归目标', '$\\hat\\bw=\\argmin_\\bw\\sum_{i=1}^n(y_i-\\bx_i\'\\bw)^2=\\argmin_\\bw\\|\\by-\\mathbf X\\bw\\|^2$', 'L03 p6–p7, p16'],
          ['正规方程（normal equations）', '$\\mathbf X\'\\mathbf X\\hat\\bw=\\mathbf X\'\\by\\ \\Rightarrow\\ \\hat\\bw=(\\mathbf X\'\\mathbf X)^{-1}\\mathbf X\'\\by$', 'L03 p17–p19'],
          ['概率模型', '$y=\\bx\'\\bw+\\varepsilon$，$\\varepsilon\\sim\\mathcal N(0,\\sigma^2)$，即 $p(y\\mid\\bx)=\\mathcal N(y;\\bx\'\\bw,\\sigma^2)$', 'L03 p13'],
          ['MLE', '$\\hat\\theta=\\argmax_\\theta\\ p(D\\mid\\theta)=\\argmax_\\theta\\sum_i\\log p(x_i\\mid\\theta)$', 'L02 p10–p13'],
          ['MAP', '$\\hat\\theta=\\argmax_\\theta\\ p(\\theta\\mid D)=\\argmax_\\theta\\big[\\log p(D\\mid\\theta)+\\log p(\\theta)\\big]$（不需要 evidence）', 'L02 p25–p26'],
          ['GD 一步', '$\\theta^{(i+1)}=\\theta^{(i)}-\\eta\\nabla L(\\theta^{(i)})$', 'L04 p5'],
          ['Newton 一步', '一维 $\\theta_{t+1}=\\theta_t-\\dfrac{L\'(\\theta_t)}{L\'\'(\\theta_t)}$；多维 $\\theta_{t+1}=\\theta_t-(\\nabla^2L)^{-1}\\nabla L$', 'L04 p12–p16'],
          ['Logistic 模型', '$P(Y=1\\mid\\bx)=\\sigma(\\bx\'\\bw)=\\dfrac{1}{1+\\exp(-\\bx\'\\bw)}$；预测：$\\sigma(\\bx\'\\bw)\\ge0.5$（即 $\\bx\'\\bw\\ge0$）判 1', 'L04 p20–p25'],
          ['Logistic 梯度', '$\\nabla\\log L(\\bw)=\\sum_i\\big(y_i-\\sigma(\\bx_i\'\\bw)\\big)\\bx_i$，令它为 0 没有闭式解', 'L04 p26–p28'],
        ],
      },

      { t: 'h2', text: '3. MLE 四步（所有 "derive the MLE" 题通用）', id: 'mle' },
      {
        t: 'steps', items: [
          T`**写似然**：样本独立，$L(\theta)=\prod_{i=1}^n p(x_i\mid\theta)$。`,
          T`**取 log**：$\ell(\theta)=\sum_i\log p(x_i\mid\theta)$。log 单调递增，最大值点不变（这正是 Quiz 1.2 问的理由）。`,
          T`**求导令其为 0**：$\ell'(\theta)=0$，解出 $\hat\theta$。多个参数就对每个求偏导。`,
          T`**检查是最大值**（二阶导 < 0，或说明 $\ell$ 是凹函数），写出最终结果。`,
        ],
      },
      {
        t: 'table', head: ['分布', '对数似然', 'MLE'], rows: [
          ['Bernoulli($q$)，$n$ 次里 $k$ 次成功', '$k\\log q+(n-k)\\log(1-q)$', '$\\hat q=k/n$'],
          ['Normal($\\mu,\\sigma^2$)', '$-\\frac n2\\log(2\\pi\\sigma^2)-\\frac{1}{2\\sigma^2}\\sum_i(x_i-\\mu)^2$', '$\\hat\\mu=\\bar x$，$\\hat\\sigma^2=\\frac1n\\sum_i(x_i-\\bar x)^2$（除以 $n$，不是 $n-1$）'],
          ['Exponential($\\theta$)，$p(x)=\\theta e^{-\\theta x}$', '$n\\log\\theta-\\theta\\sum_ix_i$', '$\\hat\\theta=n/\\sum_ix_i=1/\\bar x$'],
        ],
      },
      {
        t: 'exam', md: T`(Bernoulli) The likelihood is $L(q)=q^k(1-q)^{n-k}$, so $\ell(q)=k\log q+(n-k)\log(1-q)$. Setting $\ell'(q)=\frac kq-\frac{n-k}{1-q}=0$ gives $k(1-q)=(n-k)q$, i.e. $\hat q=k/n$. Since $\ell''(q)=-\frac{k}{q^2}-\frac{n-k}{(1-q)^2}<0$, this is a maximum.`,
      },

      { t: 'h2', text: '4. 推导模板：最小二乘 = Gaussian 噪声下的 MLE', id: 'ls-mle' },
      T`2017 Q2(c) 3 分，题目给 $\mathcal N(v\mid\mu,\sigma^2)$ 的公式。按下面四行写，每行一分左右。完整原题和答案在第 7 节。`,
      {
        t: 'steps', items: [
          T`模型：$y_i=\bx_i'\bw+\varepsilon_i$，$\varepsilon_i\sim\mathcal N(0,\sigma^2)$ 独立，所以 $p(y_i\mid\bx_i,\bw)=\mathcal N(y_i\mid\bx_i'\bw,\sigma^2)$。`,
          T`似然：$p(\by\mid\mathbf X,\bw)=\prod_{i=1}^n\frac{1}{(2\pi\sigma^2)^{1/2}}\exp\big\{-\frac{1}{2\sigma^2}(y_i-\bx_i'\bw)^2\big\}$。`,
          T`取 log：$\log p=-\frac n2\log(2\pi\sigma^2)-\frac{1}{2\sigma^2}\sum_{i=1}^n(y_i-\bx_i'\bw)^2$。`,
          T`第一项和 $\bw$ 无关，$\frac{1}{2\sigma^2}>0$，所以最大化 log 似然 ⇔ 最小化 $\sum_i(y_i-\bx_i'\bw)^2$，正是最小二乘。`,
        ],
      },
      { t: 'note', md: '常见丢分：漏写"噪声独立"（才能把似然写成连乘）；漏说第一项与 $\\bw$ 无关；把"最大化"写成"最小化"时没有交代负号。' },

      { t: 'h2', text: '5. Newton–Raphson：一步、几步', id: 'newton' },
      {
        t: 'steps', items: [
          T`一维：$\theta_{t+1}=\theta_t-L'(\theta_t)/L''(\theta_t)$。例：$\theta_t=1$，$L'=3$，$L''=6$ ⇒ $\theta_{t+1}=1-0.5=0.5$。`,
          T`**二次函数一步到位**：$L(w)=\frac12(y-xw)^2$ 时 $L'=-x(y-xw)$，$L''=x^2$（常数），所以 $w_2=w_1+\frac{x(y-xw_1)}{x^2}=\frac yx$，从任意 $w_1$ 一步就到最小值（Quiz 1.3）。`,
          T`多维同理：$L(\theta)=\frac12\|\mathbf X\theta-\by\|^2$，$\nabla L=\mathbf X'(\mathbf X\theta-\by)$，$\nabla^2L=\mathbf X'\mathbf X$，一步得 $(\mathbf X'\mathbf X)^{-1}\mathbf X'\by$（2020 Q3）。`,
          T`为什么神经网络不用 Newton：Hessian 有 $p^2$ 个元素，求逆 $O(p^3)$，参数多时太贵（L04 p16–p18）。`,
        ],
      },

      { t: 'h2', text: '6. 今年的题：Canvas Quiz 1', id: 'quiz' },
      { t: 'canvasQuiz', pick: ['1.1', '1.2', '1.3'] },

      { t: 'h2', text: '7. 往年原题（先自己写，再看答案）', id: 'past' },
      {
        t: 'examqPick', picks: [
          ['c10', '2026 practice Q1a'], ['c11', '2017 S2 Q2(c)'], ['c14', '2020 Q3'], ['c06', '2016 S2 Q1.3'],
          ['c15', '2016 S2 Q2.1'], ['c15', '2016 S2 Q2.2'], ['c07', '2016 S2 Q1.6'], ['c05', '2022 S1 Q1(g)'],
        ],
      },

      { t: 'h2', text: '8. 易错点', id: 'pitfalls' },
      {
        t: 'table', head: ['错误', '正确'], rows: [
          ['Normal 的 MLE 方差除以 $n-1$', 'MLE 除以 $n$（有偏）；除以 $n-1$ 的是无偏估计'],
          ['MAP 要算 evidence', 'MAP 只比较 $p(D\\mid\\theta)p(\\theta)$，evidence 是常数，不用算'],
          ['"MAP 和 MLE 永远不同"', '均匀（平坦）先验时 MAP = MLE；数据越多，先验影响越小'],
          ['logistic regression 有闭式解', '令梯度为 0 是非线性方程，只能用 GD / Newton 迭代'],
          ['Newton 的步长要调学习率', '基本 Newton 没有学习率，步长由 Hessian 决定'],
          ['线性回归最小化"误差"', '要说清楚是**残差平方和**（或均方误差）'],
        ],
      },
      {
        t: 'quiz', items: [
          { q: '投硬币 10 次，正面 7 次。正面概率 $q$ 的 MLE？', type: 'num', answer: 0.7, explain: 'Bernoulli MLE $\\hat q=k/n=7/10$。' },
          { q: '数据 $2,4,6$ 服从 Normal。$\\sigma^2$ 的 MLE？', type: 'num', answer: 2.6667, tol: 0.01, explain: '$\\bar x=4$，偏差平方 $4,0,4$，和为 8，MLE 除以 $n=3$：$8/3\\approx2.667$（除以 $n-1$ 得 4，那是无偏估计，不是 MLE）。' },
          { q: '$L(\\theta)=(\\theta-3)^2+1$，从 $\\theta_0=10$ 做一步 Newton，得到 $\\theta_1$？', type: 'num', answer: 3, explain: '$L\'=2(\\theta-3)=14$，$L\'\'=2$，$\\theta_1=10-14/2=3$。二次函数一步到最小值。' },
          {
            q: '先验 $p(\\theta)$ 是均匀分布时，MAP 估计与 MLE 的关系？', type: 'mc',
            options: ['MAP 总是更大', '两者相同', 'MAP 不存在', 'MAP 等于后验均值'], answer: 1,
            explain: '$\\log p(\\theta)$ 是常数，$\\argmax[\\log p(D|\\theta)+\\text{常数}]$ 与 MLE 相同。',
          },
        ],
      },
    ],
  });
})(window);
