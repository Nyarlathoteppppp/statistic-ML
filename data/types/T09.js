/* T9 — Bayesian computations & concepts (L02, L18, L19, WK02). Includes the beta-update viz and practice generator. */
(function (root) {
  'use strict';
  const SML = root.SML;
  const T = String.raw;

  /* ---------- Beta prior → posterior plot ---------- */
  function lgamma(z) { // Lanczos approximation
    const g = 7, c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lgamma(1 - z);
    z -= 1; let x = c[0];
    for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
    const t = z + g + 0.5;
    return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
  }
  const betaPdf = (q, a, b) => (q <= 0 || q >= 1) ? 0 : Math.exp((a - 1) * Math.log(q) + (b - 1) * Math.log(1 - q) + lgamma(a + b) - lgamma(a) - lgamma(b));

  SML.viz.register('beta-update', function (el) {
    const { md } = SML.md;
    const box = document.createElement('div'); box.className = 'solver';
    box.innerHTML = '<div class="solver-head"><span class="title">Beta 先验 → 后验（L19 p11–p15）</span></div>' +
      '<div class="solver-body"><div class="row">' +
      '<label>α <input type="number" min="0.5" step="0.5" value="2" data-k="a"></label>' +
      '<label>β <input type="number" min="0.5" step="0.5" value="2" data-k="b"></label>' +
      '<label>试验次数 n <input type="number" min="0" step="1" value="10" data-k="n"></label>' +
      '<label>成功次数 k <input type="number" min="0" step="1" value="7" data-k="k"></label></div>' +
      '<svg class="plane" viewBox="0 0 420 200" style="max-width:520px"></svg></div><div class="solver-out"></div>';
    el.appendChild(box);
    const svg = box.querySelector('svg'), out = box.querySelector('.solver-out');
    const val = (k) => parseFloat(box.querySelector('[data-k="' + k + '"]').value);
    // posterior mode, same case split as betaMode in js/viz/w10.js
    function modeText(A, B, f) {
      if (A > 1 && B > 1) return '$\\frac{k+\\alpha-1}{n+\\alpha+\\beta-2}=' + f((A - 1) / (A + B - 2)) + '$';
      if (A === 1 && B === 1) return '不唯一（后验是均匀分布，每个 $q$ 都是众数）';
      if (A < 1 && B < 1) return '不唯一（两端 0 和 1 的密度都趋于无穷）';
      if (A <= 1 && B >= 1) return '$=0$（左端点；后验参数不都 $>1$，内部公式不适用）';
      return '$=1$（右端点；后验参数不都 $>1$，内部公式不适用）';
    }
    function draw() {
      let a = val('a'), b = val('b'), n = Math.max(0, Math.round(val('n'))), k = Math.round(val('k'));
      if (!(a > 0) || !(b > 0) || !(k >= 0) || k > n) { out.innerHTML = md('请输入 $\\alpha,\\beta>0$，且 $0\\le k\\le n$。'); return; }
      const r = SML.core.bayes.betaBinomial(a, b, n, k);
      const xs = Array.from({ length: 199 }, (_, i) => (i + 1) / 200);
      const prior = xs.map((q) => betaPdf(q, a, b)), post = xs.map((q) => betaPdf(q, r.alpha, r.beta));
      const ymax = Math.max(1e-9, ...prior.filter(Number.isFinite), ...post.filter(Number.isFinite));
      const X = (q) => 30 + q * 370, Y = (p) => 175 - Math.min(p / ymax, 1.05) * 150;
      const line = (ys, cls, dash) => '<polyline fill="none" stroke="' + cls + '" stroke-width="2.4"' + (dash ? ' stroke-dasharray="6 5"' : '') + ' points="' + xs.map((q, i) => X(q).toFixed(1) + ',' + Y(ys[i]).toFixed(1)).join(' ') + '"/>';
      const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => '<text class="tick" x="' + X(t) + '" y="192">' + t + '</text>').join('');
      svg.innerHTML = '<line class="axis" x1="30" y1="175" x2="400" y2="175"/>' + ticks +
        line(prior, 'var(--muted)', true) + line(post, 'var(--accent)') +
        (n ? '<line stroke="var(--warn)" stroke-width="1.5" x1="' + X(k / n) + '" x2="' + X(k / n) + '" y1="25" y2="175"/>' : '');
      const f = (x) => (x == null ? '—' : (+x).toFixed(3));
      out.innerHTML = md(T`**先验** $\mathrm{Beta}(${a},${b})$（灰色虚线）× **似然** $q^{${k}}(1-q)^{${n - k}}$ ⇒ **后验** $\mathrm{Beta}(${a}+${k},\ ${b}+${n - k})=\mathrm{Beta}(${r.alpha},${r.beta})$（蓝线）。

后验均值 $\frac{${r.alpha}}{${r.alpha + r.beta}}=${f(r.mean)}$；MAP ${modeText(r.alpha, r.beta, f)}；MLE $k/n=${n ? f(r.mle) : '—'}$（橙色竖线）。数据越多，先验的影响越小，三者越接近。`);
    }
    box.querySelectorAll('input').forEach((i) => i.addEventListener('input', draw));
    draw();
  });

  SML.practice.register('beta', function (rng) {
    const pick = (arr) => arr[Math.floor(rng() * arr.length)];
    const a = pick([1, 2, 3]), b = pick([1, 2, 3]), n = pick([4, 6, 8, 10]), k = Math.floor(rng() * (n + 1));
    const r = SML.core.bayes.betaBinomial(a, b, n, k);
    const A = r.alpha, B = r.beta;
    // MAP only when the posterior has an interior mode (both parameters > 1)
    const ask = A > 1 && B > 1 ? pick(['mean', 'map']) : 'mean';
    const ans = ask === 'mean' ? A / (A + B) : (A - 1) / (A + B - 2);
    const frac = ask === 'mean' ? T`\frac{${A}}{${A + B}}` : T`\frac{${A - 1}}{${A + B - 2}}`;
    return {
      q: [T`硬币正面概率 $q$ 的先验是 $\mathrm{Beta}(${a},${b})$。抛 ${n} 次得到 ${k} 次正面。求后验的**${ask === 'mean' ? '均值' : 'MAP（众数）'}**（可填分数）。`],
      check: { type: 'num', answer: ans, tol: 1e-3 },
      answerText: T`$${frac}\approx ${ans.toFixed(3)}$`,
      sol: [
        T`后验 $=\mathrm{Beta}(\alpha+k,\ \beta+n-k)=\mathrm{Beta}(${a}+${k},\ ${b}+${n - k})=\mathrm{Beta}(${A},${B})$。`,
        ask === 'mean' ? T`均值 $=\frac{\alpha'}{\alpha'+\beta'}=${frac}$。` : T`后验两个参数 ${A},${B} 都 $>1$，峰在 0 和 1 之间，可以用内部众数公式：MAP $=\frac{\alpha'-1}{\alpha'+\beta'-2}=${frac}$（等价于 $\frac{k+\alpha-1}{n+\alpha+\beta-2}$）。`,
      ],
    };
  });

  SML.content.add({
    id: 'T09',
    eyebrow: '题型 T9 · 简答为主，偶有计算',
    title: 'Bayesian：后验、MAP vs MLE、预测方差',
    en: 'Bayesian updates, MAP vs MLE, posterior predictive variance',
    chips: [
      { text: 'L02 p20–p27', href: '#/L02', cls: 'src' }, { text: 'L18', href: '#/L18', cls: 'src' }, { text: 'L19', href: '#/L19', cls: 'src' }, { text: 'WK02', cls: 'src' },
      { text: '2026/2025 Q1b', cls: 'hot' }, { text: '2021 Q5, Q6, Q10, Q11', cls: 'hot' },
    ],
    lead: '往年卷这一块主要是**简答**（定义 + 解释），计算题是共轭先验的一步代入：多数是 Beta–Binomial，2016 年还考过 Poisson–Gamma（第 3 节）。原题全解已放在 [T13 简答题库](#/T13/past)，这一页把背后的公式理清楚。',
    blocks: [
      { t: 'h2', text: '1. 三个估计，一张表', id: 'three' },
      {
        t: 'table', head: ['', '求什么', '公式', '特点'], rows: [
          ['MLE', '让数据概率最大的参数', '$\\argmax_\\theta p(D\\mid\\theta)$', '点估计；数据少时过度自信'],
          ['MAP', '后验的众数', '$\\argmax_\\theta p(D\\mid\\theta)p(\\theta)$', '点估计；= MLE + 正则化（log prior）'],
          ['Bayesian', '整个后验分布', '$p(\\theta\\mid D)=\\dfrac{p(D\\mid\\theta)p(\\theta)}{p(D)}$', '保留不确定性；预测时对参数取平均'],
        ],
      },
      {
        t: 'fx', title: 'Bayes rule（L02 p22）',
        tex: T`\htmlClass{fx-p1}{p(\theta\mid D)}=\frac{\htmlClass{fx-p2}{p(D\mid\theta)}\ \htmlClass{fx-p3}{p(\theta)}}{\htmlClass{fx-p4}{p(D)}}`,
        parts: [
          { label: 'posterior', note: '看到数据后，对参数的信念。' },
          { label: 'likelihood', note: '参数为 $\\theta$ 时观测到这批数据的概率。MLE 只用这一项。' },
          { label: 'prior', note: '看数据之前的信念。MAP 和 Bayesian 用它；取对数后就是正则项。' },
          { label: 'marginal likelihood / evidence', note: '$p(D)=\\int p(D\\mid\\theta)p(\\theta)d\\theta$，和 $\\theta$ 无关的归一化常数。**MAP 不需要算它**（2021 Q10）；它还可以用来比较模型（2021 Q6）。' },
        ],
      },

      { t: 'h2', text: '2. Beta–Binomial（最常见的手算题）', id: 'beta' },
      {
        t: 'table', head: ['量', '公式', '出处'], rows: [
          ['先验', '$q\\sim\\mathrm{Beta}(\\alpha,\\beta)$，均值 $\\frac{\\alpha}{\\alpha+\\beta}$', 'L19 p11–p12'],
          ['似然', '$n$ 次中 $k$ 次成功：$\\binom nk q^k(1-q)^{n-k}$', 'L19 p11'],
          ['后验', '$\\mathrm{Beta}(\\alpha+k,\\ \\beta+n-k)$（共轭）', 'L19 p13'],
          ['后验均值', '$\\frac{\\alpha+k}{\\alpha+\\beta+n}$', 'L19 p12–p13'],
          ['MAP', '$\\frac{k+\\alpha-1}{n+\\alpha+\\beta-2}$（要求后验 $\\alpha+k>1,\\ \\beta+n-k>1$，否则众数在边界上）', 'WK02'],
          ['MLE', '$k/n$', 'L02、WK02'],
          ['Sunrise（$\\alpha=\\beta=1$，$k=n$）', '$E[q]=\\frac{k+1}{k+2}$（后验均值一般式 $\\frac{\\alpha+k}{\\alpha+\\beta+n}$，代入 $\\alpha=\\beta=1$、$n=k$：$\\frac{1+k}{2+k}$；比 MLE $k/n=1$ 小一点）', 'L19 p15'],
        ],
      },
      { t: 'viz', id: 'beta-update' },
      '（下面英文里的 kernel 不是 T8 的核函数，意思是"去掉和 $q$ 无关的常数后剩下的那一截"。Beta 先验那一截 $q^{\\alpha-1}(1-q)^{\\beta-1}$ 乘似然 $q^k(1-q)^{n-k}$，指数相加，仍是 Beta 的样子——这就是"共轭"：后验和先验同一族，成功次数加进 $\\alpha$、失败次数加进 $\\beta$。）',
      {
        t: 'exam', title: 'Exam phrasing · 为什么 Beta 是 Binomial 的共轭先验',
        md: T`Multiplying the Binomial likelihood $q^k(1-q)^{n-k}$ by the Beta prior $q^{\alpha-1}(1-q)^{\beta-1}$ gives $q^{k+\alpha-1}(1-q)^{n-k+\beta-1}$, which is the kernel of a $\mathrm{Beta}(\alpha+k,\beta+n-k)$ density. The posterior is in the same family as the prior, so the update is closed-form: just add the successes to $\alpha$ and the failures to $\beta$.`,
      },
      { t: 'practice', gen: 'beta', title: 'Beta 后验随机题' },

      { t: 'h2', text: '3. 其他共轭对：Poisson–Gamma（2016 真题）', id: 'conj' },
      'Beta–Binomial 不是唯一的共轭对。L19 p17 列了一张"有用的共轭先验"表，2016 年的考试就考了表里的 Poisson–Gamma：证明它共轭，再写出后验参数。方法和第 2 节完全一样：先验乘似然，只看和参数有关的部分，认出是哪个分布。',
      {
        t: 'table', head: ['似然（数据）', '共轭先验', 'L19 p17 的用途', '更新规则'], rows: [
          ['Normal（均值未知）', 'Normal', 'regression', '见第 4 节（L18）'],
          ['Normal（方差未知）', 'Inverse Gamma（协方差未知时 Inverse Wishart）', 'regression', '课件没要求'],
          ['Binomial', 'Beta', 'classification', '$\\alpha$ + 成功次数，$\\beta$ + 失败次数（第 2 节）'],
          ['Multinomial', 'Dirichlet', 'classification', '课件没要求'],
          ['Poisson', 'Gamma', 'counts（计数）', '$\\alpha+\\sum_i x_i$，$\\beta+n$（本节）'],
        ],
      },
      T`两个分布考试会给出公式，不用背：Poisson 分布（Poisson distribution）描述"一段时间里发生几次"（例如每小时的点击数），$p(x\mid\lambda)=\frac{\lambda^xe^{-\lambda}}{x!}$，$x=0,1,2,\dots$，参数 $\lambda>0$ 是平均次数；Gamma 分布（Gamma distribution）是 $\lambda>0$ 上的密度 $\frac{\lambda^{\alpha-1}e^{-\lambda\beta}}{Z(\alpha,\beta)}$，$Z(\alpha,\beta)$ 是让它积分为 1 的常数。`,
      {
        t: 'steps', items: [
          T`写出似然 $p(x\mid\theta)$ 和先验 $p(\theta)$（题目给公式）。`,
          T`后验 $\propto$ 似然 × 先验（L19 p13 "ignore constant factors"）：不含参数的因子（$1/x!$、$1/Z(\alpha,\beta)$、分母里的证据 $p(x)$）全部扔进 $\propto$。`,
          T`同底合并：$\lambda^a\lambda^b=\lambda^{a+b}$，$e^{-a\lambda}e^{-b\lambda}=e^{-(a+b)\lambda}$。`,
          T`把结果凑成先验的样子，读出新参数，并检查它们仍然合法（$>0$）。和某个分布的密度成正比，归一化后就等于那个分布（uniqueness up to normalisation，L19 p14），所以后验和先验同一族 ⇒ 共轭。`,
          T`$n$ 个观测：每个观测乘一次似然，指数继续相加。一个一个更新（上一步的后验当下一步的先验，sequential updating）和一次性更新结果相同。`,
        ],
      },
      {
        t: 'past', src: '2016 S2 exam Q10（10.1–10.3）', marks: 4, topic: 'L19 p13–p14, p17',
        q: T`Question 10: Bayesian Posterior Updating [4 marks]

Consider a random variable over $X\in\{0,1,2,\dots\}$ governed by a *Poisson*($\lambda$) distribution. That is, $X$ has probability mass function $p(x\mid\lambda)=\frac{\lambda^x\exp(-\lambda)}{x!}$. We set as the *prior distribution* the *Gamma*($\alpha,\beta$) distribution with probability density function $\frac{\lambda^{\alpha-1}\exp(-\lambda\beta)}{Z(\alpha,\beta)}$ where $Z(\alpha,\beta)$ is a normalising constant and $\alpha,\beta>0$ are constants. The *mode* of the *Gamma*($\alpha,\beta$) is $\frac{\alpha-1}{\beta}$ for $\alpha\ge1$, and 0 otherwise.

1. Prove that this is a conjugate prior and likelihood, i.e., the posterior $p(\lambda\mid x,\alpha,\beta)$ has a *Gamma* distribution. [2 marks]
2. After a single observation $X=x$, what is the resulting posterior $p(\lambda\mid x,\alpha,\beta)$? I.e., what are the new parameters, $\alpha',\beta'$, of the posterior *Gamma*($\alpha',\beta'$) in terms of $\alpha,\beta,x$? [1 mark]
3. Explain whether the posterior distribution is more or less informative than the *posterior mode*; consider in your answer the effect of the number of observed data points. [1 mark]`,
        qzh: T`第 10 题：贝叶斯后验更新（4 分）。随机变量 $X\in\{0,1,2,\dots\}$ 服从 Poisson($\lambda$) 分布，概率质量函数为 $p(x\mid\lambda)=\frac{\lambda^x\exp(-\lambda)}{x!}$。先验分布（prior distribution）取 Gamma($\alpha,\beta$)，概率密度为 $\frac{\lambda^{\alpha-1}\exp(-\lambda\beta)}{Z(\alpha,\beta)}$，其中 $Z(\alpha,\beta)$ 是归一化常数（normalising constant），$\alpha,\beta>0$ 是常数。Gamma($\alpha,\beta$) 的众数（mode）在 $\alpha\ge1$ 时为 $\frac{\alpha-1}{\beta}$，否则为 0。
1. 证明这是一对共轭（conjugate）的先验和似然，即后验 $p(\lambda\mid x,\alpha,\beta)$ 是 Gamma 分布。[2 分]
2. 观测到一个 $X=x$ 后，后验 $p(\lambda\mid x,\alpha,\beta)$ 是什么？即后验 Gamma($\alpha',\beta'$) 的新参数 $\alpha',\beta'$ 用 $\alpha,\beta,x$ 怎么表示？[1 分]
3. 解释后验分布（posterior distribution）比后验众数（posterior mode）包含的信息更多还是更少；回答时考虑观测数据点个数的影响。[1 分]`,
        sol: [
          { t: 'h4', text: '1. 证明共轭（2 分）' },
          '按上面的步骤：后验正比于似然乘先验，再合并同底的幂。',
          { t: 'math', tex: T`\begin{aligned}p(\lambda\mid x,\alpha,\beta)&\propto p(x\mid\lambda)\,p(\lambda)=\frac{\lambda^{x}e^{-\lambda}}{x!}\cdot\frac{\lambda^{\alpha-1}e^{-\lambda\beta}}{Z(\alpha,\beta)}\\&\propto\lambda^{x+\alpha-1}e^{-\lambda-\lambda\beta}=\lambda^{(\alpha+x)-1}e^{-\lambda(\beta+1)}\end{aligned}` },
          T`第一个 $\propto$：Bayes 公式的分母 $p(x)$ 和 $\lambda$ 无关，扔掉。第二个 $\propto$：$\frac1{x!}$ 和 $\frac1{Z(\alpha,\beta)}$ 里没有 $\lambda$，也扔掉。最后一步是同底合并：$\lambda^x\cdot\lambda^{\alpha-1}=\lambda^{x+\alpha-1}$，$e^{-\lambda}\cdot e^{-\lambda\beta}=e^{-\lambda(1+\beta)}$。`,
          T`对照 Gamma 密度的样子 $\lambda^{\alpha-1}e^{-\lambda\beta}$：把 $\alpha$ 换成 $\alpha+x$、$\beta$ 换成 $\beta+1$ 就是它。新参数仍合法：$\alpha+x>0$（因为 $\alpha>0$、$x\ge0$），$\beta+1>0$。和一个分布的密度成正比，归一化后就**等于**那个分布（L19 p14），所以后验是 Gamma，和先验同一族，这对先验和似然是共轭的。`,
          { t: 'h4', text: '2. 后验参数（1 分）' },
          T`从上式直接读出：$\alpha'=\alpha+x$，$\beta'=\beta+1$。含义：$\alpha$ 累加看到的计数，$\beta$ 累加观测的个数。$n$ 个独立观测 $x_1,\dots,x_n$ 时 $\alpha'=\alpha+\sum_ix_i$，$\beta'=\beta+n$。`,
          { t: 'h4', text: '3. 后验分布 vs 后验众数（1 分）' },
          T`后验众数（posterior mode）就是 MAP：$\frac{\alpha'-1}{\beta'}=\frac{\alpha+x-1}{\beta+1}$（$\alpha'\ge1$ 时），只是一个数。整个后验分布还告诉你 $\lambda$ 有多不确定（分布有多宽），能用来算区间、对预测取平均（第 1 节的三种估计对比）。从分布能算出众数，反过来不行，所以分布**更 informative**。`,
          T`数据量的影响：观测少时后验很宽，只报众数会丢掉大量不确定性，而且众数受先验影响大；观测多时后验集中在众数附近（也接近 MLE），众数已经概括了大部分信息，两者差别变小。下表用先验 $\mathrm{Gamma}(2,1)$、每次平均计数 3 来说明：`,
          {
            t: 'table', head: ['', '$n=1$（$x=3$）', '$n=100$（$\\sum_i x_i=300$）'], rows: [
              ['后验', '$\\mathrm{Gamma}(2+3,\\ 1+1)=\\mathrm{Gamma}(5,2)$', '$\\mathrm{Gamma}(2+300,\\ 1+100)=\\mathrm{Gamma}(302,101)$'],
              ['众数 $(\\alpha\'-1)/\\beta\'$', '$4/2=2$', '$301/101\\approx2.98$'],
              ['标准差 $\\sqrt{\\alpha\'}/\\beta\'$（只为说明）', '$\\sqrt5/2\\approx1.12$', '$\\sqrt{302}/101\\approx0.17$'],
            ],
          },
          { t: 'note', md: 'Gamma 的标准差公式题目没给，不用背，这里只用来说明"数据多了分布变窄"。Poisson 的 MLE 是样本均值（这里是 3）；$n=100$ 时众数 2.98 已经很接近它，$n=1$ 时众数 2 被先验（先验众数 1）拉低了不少。' },
          {
            t: 'exam', md: T`(1) $p(\lambda\mid x,\alpha,\beta)\propto p(x\mid\lambda)\,p(\lambda)=\frac{\lambda^xe^{-\lambda}}{x!}\cdot\frac{\lambda^{\alpha-1}e^{-\lambda\beta}}{Z(\alpha,\beta)}\propto\lambda^{(\alpha+x)-1}e^{-\lambda(\beta+1)}$, dropping the factors $1/x!$, $1/Z(\alpha,\beta)$ and $1/p(x)$, which do not depend on $\lambda$. This is the unnormalised density of a $\mathrm{Gamma}(\alpha+x,\ \beta+1)$ (with $\alpha+x>0$, $\beta+1>0$). Since a function proportional to a known density must equal that density after normalisation, the posterior is Gamma, the same family as the prior, so the Gamma prior is conjugate to the Poisson likelihood.

(2) $\alpha'=\alpha+x$ and $\beta'=\beta+1$. (For $n$ observations: $\alpha'=\alpha+\sum_ix_i$, $\beta'=\beta+n$.)

(3) The posterior distribution is more informative. The posterior mode (the MAP estimate, $(\alpha'-1)/\beta'$ for $\alpha'\ge1$) is a single point, whereas the full posterior also quantifies the uncertainty about $\lambda$, which can be used for credible intervals and for averaging predictions; the mode can be computed from the posterior but not vice versa. With few observations the posterior is broad, so the mode alone discards a lot of information; as the number of observations grows the posterior concentrates around its mode (and the MLE), so the mode captures most of the information and the difference becomes small.`,
          },
        ],
        azh: T`(1) $p(\lambda\mid x,\alpha,\beta)\propto p(x\mid\lambda)\,p(\lambda)=\frac{\lambda^xe^{-\lambda}}{x!}\cdot\frac{\lambda^{\alpha-1}e^{-\lambda\beta}}{Z(\alpha,\beta)}\propto\lambda^{(\alpha+x)-1}e^{-\lambda(\beta+1)}$，去掉了与 $\lambda$ 无关的因子 $1/x!$、$1/Z(\alpha,\beta)$ 和 $1/p(x)$。这是 $\mathrm{Gamma}(\alpha+x,\ \beta+1)$ 未归一化的密度（且 $\alpha+x>0$，$\beta+1>0$）。一个函数与某个已知密度成正比，归一化后就必定等于那个密度，所以后验是 Gamma 分布，和先验同一族，因此 Gamma 先验与 Poisson 似然共轭。
(2) $\alpha'=\alpha+x$，$\beta'=\beta+1$。（$n$ 个观测时：$\alpha'=\alpha+\sum_ix_i$，$\beta'=\beta+n$。）
(3) 后验分布包含的信息更多。后验众数（即 MAP 估计，$\alpha'\ge1$ 时为 $(\alpha'-1)/\beta'$）只是一个点，而完整的后验还量化了 $\lambda$ 的不确定性，可以用来算可信区间（credible interval）、对预测取平均；众数可以从后验算出来，反过来不行。观测少时后验很宽，只用众数会丢掉大量信息；随着观测数增加，后验集中在众数（以及 MLE）附近，众数概括了大部分信息，两者的差别变小。`,
      },
      {
        t: 'quiz', items: [
          {
            id: 'T09-pg-1',
            q: '计数数据用 Poisson($\\lambda$) 似然，先验 $\\mathrm{Gamma}(2,1)$。观测到一次 $x=3$。后验众数（MAP）是多少？', type: 'num', answer: 2,
            explain: '后验参数 $\\alpha\'=\\alpha+x=2+3=5$，$\\beta\'=\\beta+1=1+1=2$，即 $\\mathrm{Gamma}(5,2)$。$\\alpha\'=5\\ge1$，众数 $(5-1)/2=2$。对比：先验众数 $(2-1)/1=1$，只看这一个数据的 MLE 是 $x=3$，MAP 落在两者之间。常见错误：把 $x$ 加到 $\\beta$ 上；或者忘了减 1，答成 2.5（那是 Gamma 的均值 $\\alpha\'/\\beta\'$，不是众数）。',
          },
          {
            id: 'T09-pg-2',
            q: '同样的 Poisson–Gamma 模型，先验 $\\mathrm{Gamma}(1,1)$，观测到三个计数 $x=2,0,4$。后验众数是多少？', type: 'num', answer: 1.5,
            explain: '$n=3$ 个观测：$\\alpha\'=1+(2+0+4)=7$，$\\beta\'=1+3=4$，即 $\\mathrm{Gamma}(7,4)$，众数 $(7-1)/4=1.5$。一个一个更新结果一样：$\\mathrm{Gamma}(1,1)$ → 看到 2 → $\\mathrm{Gamma}(3,2)$ → 看到 0 → $\\mathrm{Gamma}(3,3)$ → 看到 4 → $\\mathrm{Gamma}(7,4)$。MLE 是样本均值 $6/3=2$；先验众数是 0，把估计往下拉了一点。',
          },
        ],
      },

      { t: 'h2', text: '4. Bayesian 线性回归', id: 'blr' },
      '符号：$\\bx\'\\bw$ 的撇是转置（点积）；$\\bX$ 把每个训练点 $\\bx_i\'$ 排成一行，$\\by$ 是标签列，$\\bx_*$ 是要预测的新点；$\\mathcal N(\\text{均值},\\text{方差或协方差})$；$\\sigma^2$ 是噪声方差，$\\gamma^2$ 是先验里每个权重的方差（越大先验越松），$I$ 是单位矩阵；$V_N$ 是后验协方差，$\\bw_N$ 是后验均值（也是 MAP）。',
      {
        t: 'table', head: ['量', '公式（L18 p15–p24）'], rows: [
          ['模型', '$y\\sim\\mathcal N(\\bx\'\\bw,\\sigma^2)$，先验 $\\bw\\sim\\mathcal N(\\mathbf 0,\\gamma^2 I)$'],
          ['后验', '$\\bw\\mid D\\sim\\mathcal N(\\bw_N,V_N)$，$V_N=\\sigma^2\\big(\\bX\'\\bX+\\frac{\\sigma^2}{\\gamma^2}I\\big)^{-1}$，$\\bw_N=\\frac1{\\sigma^2}V_N\\bX\'\\by$'],
          ['MAP', '$\\bw_N$ 本身，等于 ridge 解，$\\lambda=\\sigma^2/\\gamma^2$'],
          ['预测', '$y_*\\sim\\mathcal N\\big(\\bx_*\'\\bw_N,\\ \\sigma^2+\\bx_*\'V_N\\bx_*\\big)$'],
        ],
      },
      {
        t: 'good', title: '预测方差的两部分（2021 Q11 的核心）',
        md: '- $\\sigma^2$：观测噪声，对所有测试点一样。\n- $\\bx_*\'V_N\\bx_*$：参数不确定性，随测试点变化——**在训练数据覆盖少的方向上大**，典型情况是远离数据外推时变大（L18 p25 的图）。所以 Bayesian 模型在外推时会"知道自己不确定"，点估计（MLE/MAP）做不到。',
      },
      {
        t: 'deep', title: '展开详解：为什么 MAP = ridge', blocks: [
          '来源：Gaussian 似然取 log 自带 $-\\frac1{2\\sigma^2}\\|\\by-\\bX\\bw\\|^2$，Gaussian 先验取 log 自带 $-\\frac1{2\\gamma^2}\\|\\bw\\|^2$，证据项和 $\\bw$ 无关、并进常数；乘一个正数不改变最小值的位置。',
          '取负对数：$-\\log p(\\bw\\mid D)=\\frac1{2\\sigma^2}\\|\\by-\\bX\\bw\\|^2+\\frac1{2\\gamma^2}\\|\\bw\\|^2+\\text{const}$。乘以 $2\\sigma^2$：$\\|\\by-\\bX\\bw\\|^2+\\frac{\\sigma^2}{\\gamma^2}\\|\\bw\\|^2$，正是 ridge 目标，$\\lambda=\\sigma^2/\\gamma^2$。先验越窄（$\\gamma$ 小），正则越强。',
          '一般结论（2021 Q13a）：正则项 $\\lambda r(\\bw)$ 对应先验 $p(\\bw)\\propto\\exp(-\\lambda r(\\bw))$；L2 ↔ Gaussian，L1 ↔ Laplace。',
        ],
      },

      { t: 'h2', text: '5. Bayesian 分类：没有共轭时怎么办', id: 'nonconj' },
      'Bayesian logistic regression 的似然（sigmoid）和 Gaussian 先验**不共轭**，后验没有闭式解（L19 p19–p21）。三种近似（p22–p23）：',
      {
        t: 'ul', items: [
          '**Monte Carlo**：从后验采样，用样本平均近似积分。',
          '**Variational**：在一个简单分布族里找最接近后验的分布。',
          '**Laplace approximation**：在众数（MAP）处用一个 Gaussian 近似后验，均值是众数，宽度由二阶导数（一个 Hessian）决定（L19 p23）。',
        ],
      },
      {
        t: 'table', head: ['似然', '共轭先验', '出处'], rows: [
          ['Bernoulli / Binomial', 'Beta', 'L19 p17'], ['Normal（均值未知，方差已知）', 'Normal', 'L18、L19 p17'],
          ['Normal（方差未知）', 'Inverse-Gamma', 'L18 p26'], ['Logistic（sigmoid）', '无', 'L19 p21'],
        ],
      },
      {
        t: 'quiz', items: [
          {
            q: '先验 $\\mathrm{Beta}(2,2)$，10 次中 7 次成功。后验均值是多少？', type: 'num', answer: 9 / 14, tol: 1e-3,
            explain: '后验参数 $\\alpha+k=2+7=9$，$\\beta+n-k=2+10-7=5$，即 $\\mathrm{Beta}(9,5)$；均值 $9/(9+5)=9/14\\approx0.643$。MLE 是 $7/10=0.7$，先验均值 $2/4=0.5$，估计被往 0.5 拉了一点。',
          },
          {
            q: '先验 $\\mathrm{Beta}(1,1)$（均匀）时，MAP 和 MLE 的关系？', options: ['MAP = MLE', 'MAP > MLE', 'MAP < MLE', '不确定'], answer: 0,
            explain: 'MAP $=\\frac{k+1-1}{n+1+1-2}=\\frac kn$ = MLE。均匀先验不改变最大值点（WK02）。',
          },
          {
            q: '为什么数据量很大时 MAP ≈ MLE？', type: 'show',
            answerText: 'log 似然随 $n$ 线性增长，log 先验不随 $n$ 变，先验的影响被"冲淡"。',
            explain: 'Beta 例子里 $\\frac{k+\\alpha-1}{n+\\alpha+\\beta-2}\\to\\frac kn$。',
          },
        ],
      },
    ],
  });
})(window);
