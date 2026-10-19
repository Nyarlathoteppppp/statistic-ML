/* Timed mock exam built from the 2026 S2 practice paper (questions only; solutions live on the type pages). */
(function (root) {
  'use strict';
  const SML = root.SML;

  SML.viz.register('mock-timer', function (el, opts) {
    const total = (opts.minutes || 50) * 60;
    const box = document.createElement('div'); box.className = 'solver';
    box.innerHTML = '<div class="solver-head"><span class="title">⏱ 计时</span><div class="tools">' +
      '<button class="btn primary" type="button" data-a="start">开始</button><button class="btn" type="button" data-a="pause">暂停</button><button class="btn" type="button" data-a="reset">重置</button></div></div>' +
      '<div class="solver-body" style="font: 600 2.2rem var(--mono); text-align:center"></div>';
    el.appendChild(box);
    const face = box.querySelector('.solver-body');
    let left = total, timer = null;
    const fmt = (s) => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
    const paint = () => { face.textContent = fmt(left); face.style.color = left <= 300 ? 'var(--bad)' : 'var(--ink)'; };
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
    box.querySelector('[data-a="start"]').addEventListener('click', () => {
      if (timer) return;
      timer = setInterval(() => { left = Math.max(0, left - 1); paint(); if (!left) { stop(); face.textContent = '时间到'; } }, 1000);
    });
    box.querySelector('[data-a="pause"]').addEventListener('click', stop);
    box.querySelector('[data-a="reset"]').addEventListener('click', () => { stop(); left = total; paint(); });
    paint();
  });

  const Q = (src, marks, q, figure, where, qzh, azh) => ({
    t: 'past', src: src, marks: marks, q: q, qzh: qzh, azh: azh,
    blocks: (figure ? [{ t: 'fig', src: figure, w: 360 }] : []).concat([{ t: 'chips', items: [{ text: '做完后对答案 → ' + where[1], href: where[0] }] }]),
  });

  SML.content.add({
    id: 'mock',
    title: '原卷复现：2026 S2 practice',
    lead: '**注意：这些题的完整解答在各题型页里已经出现过**，做这份卷只能检查你记住了没有。要测真实水平，先做 [新题模考](#/mock2)。\n\n原卷 50 分、50 分钟（真题 120 分、120 分钟，节奏相同：**1 分钟 1 分**）。不看网站、不用计算器，在纸上写完整英文答案，时间到再逐题对答案、按评分要点给自己打分。',
    blocks: [
      { t: 'viz', id: 'mock-timer', opts: { minutes: 50 } },
      { t: 'good', title: '官方答案已对照（practice_exam_sol.pdf）', md: '老师发布的官方答案覆盖 Q1、Q2、Q3、Q6；Q4（D-separation）和 Q5（junction tree）官方写的是"在 tutorial 里讲"，没有书面答案，站上的解答是按课件方法自己做的。**有官方答案的题，站上的解答结论全部一致**：Q1(a) 残差平方和；Q1(b) $p(x)=\\int p(x\\mid\\theta)p(\\theta)d\\theta$；Q1(c) 点 1、2、4；Q1(d) $3+5\\cdot4+4\\cdot5=43$；Q2 拉臂 3（$Q=1,\\ 11/8,\\ 2$）；Q3 VC $=2$；Q6 六张 CPT、$A$ 的表 32 行。官方的写法差异见 [T13](#/T13) 和 [T7](#/T07)。' },
      { t: 'h2', text: 'Section A: Short Answer Questions [10 marks]', id: 'a' },
      Q('Q1(a)', 2, 'In words or a mathematical expression, what quantity is minimised by *linear regression*?', null, ['#/T13/past', 'T13'],
        '用文字或数学表达式回答：*线性回归（linear regression）* 最小化的是什么量？'),
      Q('Q1(b)', 2, 'In words or a mathematical expression, what is the *marginal likelihood* for a Bayesian probabilistic model?', null, ['#/T13/past', 'T13'],
        '用文字或数学表达式回答：对于贝叶斯概率模型（Bayesian probabilistic model），*边缘似然（marginal likelihood）* 是什么？'),
      Q('Q1(c)', 3, 'Consider the data shown below with hard-margin linear SVM decision boundary shown between the classes. The right half is classified as red squares and the left half as blue circles. Which points (by index 1–6) would be the support vectors of the SVM?', 'assets/figures/ex2026_q1c_svm.png', ['#/T04/read', 'T4'],
        '考虑下图所示的数据，两类之间画出了硬间隔线性 SVM（hard-margin linear SVM）的决策边界（decision boundary）。右半边被分类为红色方块，左半边被分类为蓝色圆圈。哪些点（用编号 1–6 表示）会是该 SVM 的支持向量（support vectors）？'),
      Q('Q1(d)', 3, 'How many parameters does the following convolutional neural network have (exclude the bias)?', 'assets/figures/ex2026_q1d_cnn.png', ['#/T03/steps', 'T3'],
        '下面这个卷积神经网络（convolutional neural network）有多少个参数？不计偏置（bias）。'),
      { t: 'h2', text: 'Section B: Method & Calculation Questions [30 marks]', id: 'b' },
      Q('Q2', 6, 'You are running a multi-armed bandit problem with 3 arms; rewards are binary. Arm 1: pulled 64 times, 40 rewards of 1. Arm 2: pulled 16 times, 10 rewards of 1. Arm 3: pulled 4 times, 2 rewards of 1. Using the UCB algorithm, calculate the value of each arm. Which arm should you pull next, and why? *(ln 4 ≈ 1.4, ln 5 ≈ 1.6, ln 16 ≈ 2.8, ln 17 ≈ 2.8, ln 64 ≈ 4.2, ln 65 ≈ 4.2, ln 84 ≈ 4.5, ln 85 ≈ 4.5; $Q_{t-1}(i)=\\hat\\mu_{t-1}(i)+\\sqrt{2\\ln t/N_{t-1}(i)}$)*', null, ['#/T02/past', 'T2'],
        '你在处理一个有 3 个臂的多臂老虎机（multi-armed bandit）问题，奖励是二值的（binary）。臂 1（Arm 1）：拉了 64 次，其中 40 次奖励为 1。臂 2：拉了 16 次，其中 10 次奖励为 1。臂 3：拉了 4 次，其中 2 次奖励为 1。用 UCB 算法计算每个臂的值。下一步应该拉哪个臂？为什么？*(ln 4 ≈ 1.4, ln 5 ≈ 1.6, ln 16 ≈ 2.8, ln 17 ≈ 2.8, ln 64 ≈ 4.2, ln 65 ≈ 4.2, ln 84 ≈ 4.5, ln 85 ≈ 4.5; $Q_{t-1}(i)=\\hat\\mu_{t-1}(i)+\\sqrt{2\\ln t/N_{t-1}(i)}$)*'),
      Q('Q3', 8, 'Consider an input domain of five points $x_1,\\dots,x_5$ and binary classifier family $\\mathcal G$ defined by the table of dichotomies (rows): 00001, 10001, 01010, 01101, 01011, 10111, 11101, 01111. Calculate $\\mathrm{VC}(\\mathcal G)$ and show a corresponding shattered set of points.', null, ['#/T01/past', 'T1'],
        '考虑由五个点 $x_1,\\dots,x_5$ 构成的输入域（input domain），以及由下列二分（dichotomies）表（每行一个二分）定义的二分类器族（binary classifier family）$\\mathcal G$：00001, 10001, 01010, 01101, 01011, 10111, 11101, 01111。计算 $\\mathrm{VC}(\\mathcal G)$，并给出一个相应的被打散（shattered）的点集。'),
      Q('Q4', 8, 'Consider the following Bayesian network. Does the conditional independence statement $S\\perp Z\\mid V,W$ hold?', 'assets/figures/ex2026_q4_bn.png', ['#/T05/past', 'T5'],
        '考虑下面的贝叶斯网络（Bayesian network）。条件独立（conditional independence）陈述 $S\\perp Z\\mid V,W$ 是否成立？'),
      Q('Q5', 8, 'Consider the following Markov random field. Assume the node elimination order $T,X,Z,U,W,V,Y$. What are the cliques in the junction tree (using this elimination order)?', 'assets/figures/ex2026_q5_mrf.png', ['#/T06/past', 'T6'],
        '考虑下面的马尔可夫随机场（Markov random field）。假设节点消元顺序（elimination order）为 $T,X,Z,U,W,V,Y$。使用这个消元顺序时，联结树（junction tree）中的团（cliques）有哪些？'),
      { t: 'h2', text: 'Section C: Design and Application Questions [10 marks]', id: 'c' },
      Q('Q6', 10, 'Design a system for alerting residents of the Dandenongs to evacuate for an impending bushfire. If any of three sensors $S_1,S_2,S_3$ are ‘on’ residents should evacuate; however if either of the closer sensors $C_1,C_2$ are ‘on’ residents should stay put. (a) Model the problem as a directed PGM relating $S_1,S_2,S_3,C_1,C_2$ and a variable $A$ for alerting residents to evacuate. [4] (b) How many CPTs should be specified, and what should their dimensions be? [3] (c) Suppose the sensors are always accurate. What could you say about your CPTs? [3]', null, ['#/T07/bushfire', 'T7'],
        '设计一个系统，在山火（bushfire）即将来临时提醒丹德农（Dandenongs）地区的居民撤离。如果三个传感器 $S_1,S_2,S_3$ 中任意一个处于“开”（on）状态，居民应当撤离；但如果两个较近的传感器 $C_1,C_2$ 中任意一个处于“开”状态，居民应当原地不动。(a) 把这个问题建模为一个有向 PGM（directed PGM），关联 $S_1,S_2,S_3,C_1,C_2$ 以及一个表示提醒居民撤离的变量 $A$。[4] (b) 应当指定多少个 CPT（条件概率表），它们的维度分别应是多少？[3] (c) 假设传感器总是准确的。关于你的 CPT，你能得出什么结论？[3]'),
      { t: 'good', title: '对完答案以后', md: '做错的题回到对应题型页，把"随机练习"连续做对 3 题再算过关。限时内没做完的题型，说明步骤还不够熟。' },
    ],
  });

  SML.catalog.meta.mock = { title: '限时模考', countable: false };
  SML.catalog.zones[0].items.push('mock');
})(window);
