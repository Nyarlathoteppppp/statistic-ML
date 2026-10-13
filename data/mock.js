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

  const Q = (src, marks, q, figure, where) => ({
    t: 'past', src: src, marks: marks, q: q,
    blocks: (figure ? [{ t: 'fig', src: figure, w: 360 }] : []).concat([{ t: 'chips', items: [{ text: '做完后对答案 → ' + where[1], href: where[0] }] }]),
  });

  SML.content.add({
    id: 'mock',
    title: '原卷复现：2026 S2 practice',
    lead: '**注意：这些题的完整解答在各题型页里已经出现过**，做这份卷只能检查你记住了没有。要测真实水平，先做 [新题模考](#/mock2)。\n\n原卷 50 分、50 分钟（真题 120 分、120 分钟，节奏相同：**1 分钟 1 分**）。不看网站、不用计算器，在纸上写完整英文答案，时间到再逐题对答案、按评分要点给自己打分。',
    blocks: [
      { t: 'viz', id: 'mock-timer', opts: { minutes: 50 } },
      { t: 'h2', text: 'Section A: Short Answer Questions [10 marks]', id: 'a' },
      Q('Q1(a)', 2, 'In words or a mathematical expression, what quantity is minimised by *linear regression*?', null, ['#/T13/past', 'T13']),
      Q('Q1(b)', 2, 'In words or a mathematical expression, what is the *marginal likelihood* for a Bayesian probabilistic model?', null, ['#/T13/past', 'T13']),
      Q('Q1(c)', 3, 'Consider the data shown below with hard-margin linear SVM decision boundary shown between the classes. The right half is classified as red squares and the left half as blue circles. Which points (by index 1–6) would be the support vectors of the SVM?', 'assets/figures/ex2026_q1c_svm.png', ['#/T04/read', 'T4']),
      Q('Q1(d)', 3, 'How many parameters does the following convolutional neural network have (exclude the bias)?', 'assets/figures/ex2026_q1d_cnn.png', ['#/T03/steps', 'T3']),
      { t: 'h2', text: 'Section B: Method & Calculation Questions [30 marks]', id: 'b' },
      Q('Q2', 6, 'You are running a multi-armed bandit problem with 3 arms; rewards are binary. Arm 1: pulled 64 times, 40 rewards of 1. Arm 2: pulled 16 times, 10 rewards of 1. Arm 3: pulled 4 times, 2 rewards of 1. Using the UCB algorithm, calculate the value of each arm. Which arm should you pull next, and why? *(ln 4 ≈ 1.4, ln 5 ≈ 1.6, ln 16 ≈ 2.8, ln 17 ≈ 2.8, ln 64 ≈ 4.2, ln 65 ≈ 4.2, ln 84 ≈ 4.5, ln 85 ≈ 4.5; $Q_{t-1}(i)=\\hat\\mu_{t-1}(i)+\\sqrt{2\\ln t/N_{t-1}(i)}$)*', null, ['#/T02/past', 'T2']),
      Q('Q3', 8, 'Consider an input domain of five points $x_1,\\dots,x_5$ and binary classifier family $\\mathcal G$ defined by the table of dichotomies (rows): 00001, 10001, 01010, 01101, 01011, 10111, 11101, 01111. Calculate $\\mathrm{VC}(\\mathcal G)$ and show a corresponding shattered set of points.', null, ['#/T01/past', 'T1']),
      Q('Q4', 8, 'Consider the following Bayesian network. Does the conditional independence statement $S\\perp Z\\mid V,W$ hold?', 'assets/figures/ex2026_q4_bn.png', ['#/T05/past', 'T5']),
      Q('Q5', 8, 'Consider the following Markov random field. Assume the node elimination order $T,X,Z,U,W,V,Y$. What are the cliques in the junction tree (using this elimination order)?', 'assets/figures/ex2026_q5_mrf.png', ['#/T06/past', 'T6']),
      { t: 'h2', text: 'Section C: Design and Application Questions [10 marks]', id: 'c' },
      Q('Q6', 10, 'Design a system for alerting residents of the Dandenongs to evacuate for an impending bushfire. If any of three sensors $S_1,S_2,S_3$ are ‘on’ residents should evacuate; however if either of the closer sensors $C_1,C_2$ are ‘on’ residents should stay put. (a) Model the problem as a directed PGM relating $S_1,S_2,S_3,C_1,C_2$ and a variable $A$ for alerting residents to evacuate. [4] (b) How many CPTs should be specified, and what should their dimensions be? [3] (c) Suppose the sensors are always accurate. What could you say about your CPTs? [3]', null, ['#/T07/bushfire', 'T7']),
      { t: 'good', title: '对完答案以后', md: '做错的题回到对应题型页，把"随机练习"连续做对 3 题再算过关。限时内没做完的题型，说明步骤还不够熟。' },
    ],
  });

  SML.catalog.meta.mock = { title: '限时模考', countable: false };
  SML.catalog.zones[0].items.push('mock');
})(window);
