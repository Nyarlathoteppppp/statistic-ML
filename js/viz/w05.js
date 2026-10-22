/* W5–W6 visualisations (L09–L12): kernels, neural networks, backpropagation, optimisers and PCA. */
(function (root) {
  'use strict';
  const SML = root.SML;
  const P = () => SML.plot;
  const f3 = (v) => Number.isFinite(v) ? String(+v.toFixed(3)) : '—';
  const f4 = (v) => Number.isFinite(v) ? v.toFixed(4) : '—';
  function node(tag, cls, html) { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function btn(text, fn, cls) { const b = node('button', cls || 'btn', text); b.type = 'button'; b.addEventListener('click', fn); return b; }
  function shell(el, title) {
    const s = node('div', 'solver'), h = node('div', 'solver-head');
    const tools = node('div', 'tools'), body = node('div', 'solver-body'), out = node('div', 'solver-out');
    h.append(node('span', 'title', title), tools); s.append(h, body, out); el.appendChild(s);
    return { tools: tools, body: body, out: out };
  }
  function row(parent) { const r = node('div', 'row'); parent.appendChild(r); return r; }
  function readout(pairs) { return '<div class="readout">' + pairs.map((p) => '<div><span>' + SML.md.inline(p[0]) + '</span><b>' + SML.md.inline(String(p[1])) + '</b></div>').join('') + '</div>'; }
  const md = (s) => SML.md.md(s);
  function select(parent, label, entries, value, change) {
    const l = node('label'), s = node('select'); l.appendChild(node('span', null, label));
    entries.forEach((e) => { const o = node('option'); o.value = e[0]; o.textContent = e[1]; s.appendChild(o); });
    s.value = value; s.addEventListener('change', change); l.appendChild(s); parent.appendChild(l); return s;
  }
  function input(parent, label, value, type, change) {
    const l = node('label'), i = node('input'); l.appendChild(node('span', null, label));
    i.type = type; i.value = value; if (type === 'number') { i.step = '0.1'; i.min = '-1000'; i.max = '1000'; }
    else { i.style.width = '100%'; i.style.minWidth = '0'; i.maxLength = 120; l.style.maxWidth = '100%'; }
    i.addEventListener('input', change); l.appendChild(i); parent.appendChild(l); return i;
  }
  function box(parent) { const b = node('div'); parent.appendChild(b); return b; }
  function table(parent, head, rows) {
    const wrap = node('div'); wrap.style.overflowX = 'auto';
    const t = node('table', 'compact mono'), th = node('thead'), tb = node('tbody'), tr = node('tr');
    head.forEach((s) => { const c = node('th'); c.textContent = s; tr.appendChild(c); }); th.appendChild(tr);
    rows.forEach((r) => { const rr = node('tr'); r.forEach((s) => { const c = node('td'); c.textContent = s; rr.appendChild(c); }); tb.appendChild(rr); });
    t.append(th, tb); wrap.appendChild(t); parent.appendChild(wrap);
  }
  function legend(parent, entries) {
    const l = node('div', 'legend'); entries.forEach((e) => { const s = node('span'); s.style.setProperty('--c', e[1]); s.textContent = e[0]; l.appendChild(s); }); parent.appendChild(l);
  }
  const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
  const sigmoid = (s) => s >= 0 ? 1 / (1 + Math.exp(-s)) : Math.exp(s) / (1 + Math.exp(s));
  function activation(name, s) { return name === 'tanh' ? Math.tanh(s) : name === 'relu' ? Math.max(0, s) : sigmoid(s); }
  function derivative(name, s, h) { return name === 'tanh' ? 1 - h * h : name === 'relu' ? (s > 0 ? 1 : 0) : h * (1 - h); }
  function normal(rng) { return Math.sqrt(-2 * Math.log(Math.max(1e-12, rng()))) * Math.cos(2 * Math.PI * rng()); }

  /* Symmetric Jacobi eigensolver: columns of V track the orthogonal rotations. */
  function jacobi(A) {
    const n = A.length, B = A.map((r) => r.slice());
    const V = A.map((r, i) => r.map((v, j) => i === j ? 1 : 0));
    for (let it = 0; it < 100 * n * n; it++) {
      let p = 0, q = 1, largest = 0;
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (Math.abs(B[i][j]) > largest) { largest = Math.abs(B[i][j]); p = i; q = j; }
      if (largest < 1e-13) break;
      const angle = 0.5 * Math.atan2(2 * B[p][q], B[q][q] - B[p][p]);
      const c = Math.cos(angle), s = Math.sin(angle), a = B[p][p], b = B[q][q], z = B[p][q];
      for (let k = 0; k < n; k++) if (k !== p && k !== q) {
        const kp = B[k][p], kq = B[k][q];
        B[k][p] = B[p][k] = c * kp - s * kq; B[k][q] = B[q][k] = s * kp + c * kq;
      }
      B[p][p] = c * c * a - 2 * c * s * z + s * s * b;
      B[q][q] = s * s * a + 2 * c * s * z + c * c * b; B[p][q] = B[q][p] = 0;
      for (let k = 0; k < n; k++) { const vp = V[k][p], vq = V[k][q]; V[k][p] = c * vp - s * vq; V[k][q] = s * vp + c * vq; }
    }
    return B.map((r, i) => ({ value: r[i], vector: V.map((v) => v[i]) })).sort((a, b) => a.value - b.value);
  }

  SML.viz.register('kernel-map', function (el) {
    const ui = shell(el, 'Polynomial kernel：显式特征与 kernel trick');
    const r = row(ui.body);
    const ins = ['x₁', 'x₂', 'z₁', 'z₂'].map((s, i) => input(r, s, [1, 2, 2, -1][i], 'number', draw));
    const c = select(ui.tools, 'c', [['0', '0'], ['1', '1']], '1', draw);
    const d = select(ui.tools, 'd', [['1', '1'], ['2', '2']], '2', draw);
    const picture = box(ui.body);
    function draw() {
      picture.innerHTML = '';
      const nums = ins.map((i) => Number(i.value));
      if (ins.some((i, k) => i.value.trim() === '' || !Number.isFinite(nums[k]) || Math.abs(nums[k]) > 1000)) {
        ui.out.innerHTML = md('请输入四个有限数字，范围 $[-1000,1000]$。'); return;
      }
      const C = +c.value, D = +d.value, x = nums.slice(0, 2), z = nums.slice(2);
      const phi = (v) => D === 1 ? v.concat(C ? [1] : []) : [v[0] * v[0], v[1] * v[1], Math.SQRT2 * v[0] * v[1]].concat(C ? [Math.SQRT2 * v[0], Math.SQRT2 * v[1], 1] : []);
      const names = D === 1 ? ['x_1', 'x_2'].concat(C ? ['1'] : []) : ['x_1^2', 'x_2^2', '\\sqrt2 x_1x_2'].concat(C ? ['\\sqrt2 x_1', '\\sqrt2 x_2', '1'] : []);
      const px = phi(x), pz = phi(z), direct = Math.pow(dot(x, z) + C, D), explicit = dot(px, pz);
      picture.innerHTML = md('$\\varphi(\\bx)=[' + names.join(',\\ ') + ']$');
      table(picture, ['特征', 'φ(x)', 'φ(z)', '乘积'], names.map((s, i) => [s.replace(/\\/g, ''), f4(px[i]), f4(pz[i]), f4(px[i] * pz[i])]));
      // Count literal scalar multiplications, including sqrt(2) scaling and the constant dot-product term.
      const mapCost = D === 1 ? 0 : (C ? 6 : 4), explicitCost = 2 * mapCost + px.length, kernelCost = 2 + (D === 2 ? 1 : 0);
      ui.out.innerHTML = md('$\\varphi(\\bx)^\\top\\varphi(\\bz)=k(\\bx,\\bz)=(\\bx^\\top\\bz+c)^d$：两条路径完全相等（仅浮点舍入误差；L09 p21–p23、p32）。乘法计数包含两次特征构造、$\\sqrt2$ 缩放和全部点积项，不计加法；特征未缓存。') +
        readout([['显式点积', f4(explicit)], ['直接 kernel', f4(direct)], ['绝对误差', Math.abs(explicit - direct).toExponential(2)], ['显式乘法', explicitCost], ['kernel 乘法', kernelCost], ['节省乘法', explicitCost - kernelCost]]);
    }
    draw();
  });

  SML.viz.register('gram-psd', function (el) {
    const ui = shell(el, 'Gram matrix：找出非 PSD 的反例');
    const r = row(ui.body), points = input(r, '2–5 个点（逗号分隔）', '0,1,2,3', 'text', draw);
    const kernel = select(row(ui.body), 'kernel', [['linear', 'linear: x z'], ['poly', 'polynomial: (x z + 1)²'], ['rbf', 'RBF: exp(−γ(x−z)²)'], ['distance', 'invalid: −(x−z)²'], ['offset', 'invalid: x z − 1']], 'poly', draw);
    const gamma = P().slider(row(ui.body), 'RBF γ', { min: 0.01, max: 3, step: 0.01, value: 0.5 }, draw);
    const picture = box(ui.body);
    function draw() {
      picture.innerHTML = '';
      const tokens = points.value.split(/[,，]/).map((s) => s.trim()), xs = tokens.map(Number);
      if (xs.length < 2 || xs.length > 5 || tokens.some((s) => !s) || xs.some((x) => !Number.isFinite(x) || Math.abs(x) > 20)) {
        ui.out.innerHTML = md('请输入 2–5 个有限数字，范围 $[-20,20]$；重复点允许。'); return;
      }
      const k = (x, z) => kernel.value === 'linear' ? x * z : kernel.value === 'poly' ? Math.pow(x * z + 1, 2) : kernel.value === 'rbf' ? Math.exp(-(+gamma.value) * Math.pow(x - z, 2)) : kernel.value === 'distance' ? -Math.pow(x - z, 2) : x * z - 1;
      const K = xs.map((x) => xs.map((z) => k(x, z))), eig = jacobi(K), bad = eig[0].value < -1e-9;
      table(picture, ['Kᵢⱼ'].concat(xs.map((x) => 'z=' + x)), K.map((r, i) => ['x=' + xs[i]].concat(r.map(f4))));
      const vals = eig.map((e) => Math.abs(e.value) < 1e-12 ? '0' : e.value.toExponential(5)).join(', ');
      let witness = '';
      if (bad) {
        const v = eig[0].vector, q = dot(v, K.map((r) => dot(r, v)));
        witness = md('负特征值的单位特征向量提供反例：$\\bv=[' + v.map(f4).join(',') + ']$（显示值已舍入），$\\bv^\\top K\\bv=' + q.toExponential(6) + '<0$（用未舍入向量计算）。');
      }
      ui.out.innerHTML = readout([['判定（tol = 1e−9）', bad ? 'not PSD' : 'PSD'], ['最小特征值', eig[0].value.toExponential(5)]]) +
        md('Jacobi 特征值：$[' + vals + ']$。一个非 PSD Gram matrix 足以否定 kernel；一个 PSD 样本不能证明对所有数据均有效（L09 p35）。') + witness;
    }
    draw();
  });

  SML.viz.register('activation-fns', function (el) {
    const ui = shell(el, 'Activation functions 与导数');
    const which = select(ui.tools, '显示', [['all', '全部'], ['sigmoid', 'sigmoid'], ['tanh', 'tanh'], ['relu', 'ReLU']], 'all', draw);
    const s = P().slider(row(ui.body), '探针 s', { min: -5, max: 5, step: 0.05, value: 1 }, draw);
    const picture = box(ui.body), styles = { sigmoid: 'curve', tanh: 'curve post', relu: 'curve lik' };
    function draw() {
      picture.innerHTML = '';
      const names = which.value === 'all' ? ['sigmoid', 'tanh', 'relu'] : [which.value];
      const pl = P().frame(picture, { w: 520, h: 280, x: [-5, 5], y: [-1.2, names.indexOf('relu') >= 0 ? 5.3 : 1.3], xlabel: 's', ylabel: 'f(s), f′(s)' });
      const pairs = [];
      names.forEach((name) => {
        const fun = (x) => activation(name, x), der = (x) => derivative(name, x, fun(x));
        pl.fn(fun, styles[name]);
        const path = pl.fn(der, styles[name] + ' thin'); path.setAttribute('stroke-dasharray', '5 4');
        pl.dot(+s.value, fun(+s.value), 5, 'pt big');
        pairs.push([name + ' f(s)', f4(fun(+s.value))], [name + ' f′(s)', name === 'relu' && +s.value === 0 ? '未定义（训练取 0）' : f4(der(+s.value))]);
      });
      pl.line(+s.value, -1.2, +s.value, 5.3, 'ref');
      legend(picture, [['sigmoid', 'var(--accent)'], ['tanh', 'var(--good)'], ['ReLU', 'var(--warn)'], ['虚线：导数', 'var(--muted)']]);
      ui.out.innerHTML = md('$\\sigma(s)=1/(1+e^{-s})$，$\\sigma\'(s)=\\sigma(s)(1-\\sigma(s))\\le0.25$；$\\tanh\'(s)=1-\\tanh^2(s)$。饱和区导数接近零，多层连乘会产生 vanishing gradients；ReLU 在零处不可导，此处训练约定取 0（L11 p7、p22）。') + readout(pairs);
    }
    draw();
  });

  SML.viz.register('mlp-playground', function (el) {
    const ui = shell(el, 'MLP playground：学习 XOR / circle');
    const dataset = select(ui.tools, '数据', [['xor', 'XOR'], ['circle', 'circle']], 'xor', reset);
    const act = select(ui.tools, 'hidden activation', [['tanh', 'tanh'], ['relu', 'ReLU'], ['sigmoid', 'sigmoid']], 'tanh', reset);
    const H = P().slider(row(ui.body), 'hidden units H', { min: 1, max: 8, step: 1, value: 4 }, reset);
    const eta = P().slider(row(ui.body), 'learning rate η', { min: 0.01, max: 1, step: 0.01, value: 0.3 }, draw);
    ui.tools.append(btn('train 100 steps', train, 'btn primary'), btn('reset', reset));
    const picture = box(ui.body);
    let D = [], W = [], V = [], b = 0, steps = 0;
    function reset() {
      const rng = SML.quiz.seedRng(51011); D = [];
      for (let i = 0; i < 40; i++) {
        if (dataset.value === 'xor') {
          const a = i % 4, x = (a < 2 ? -0.9 : 0.9) + 0.18 * normal(rng), y = (a % 2 ? 0.9 : -0.9) + 0.18 * normal(rng);
          D.push([x, y, a === 1 || a === 2 ? 1 : 0]);
        } else {
          const t = 2 * Math.PI * rng(), r = i < 20 ? 0.25 + 0.35 * rng() : 1 + 0.35 * rng();
          D.push([r * Math.cos(t), r * Math.sin(t), i < 20 ? 1 : 0]);
        }
      }
      const init = SML.quiz.seedRng(12345);
      W = []; V = []; b = 0; steps = 0;
      for (let j = 0; j < +H.value; j++) { W.push([normal(init) * 0.8, normal(init) * 0.8, normal(init) * 0.15]); V.push(normal(init) / Math.sqrt(+H.value)); }
      draw();
    }
    function forward(x, y) {
      const a = W.map((w) => w[0] * x + w[1] * y + w[2]), h = a.map((v) => activation(act.value, v)), logit = b + dot(V, h);
      return { a: a, h: h, logit: logit, p: sigmoid(logit) };
    }
    function train() {
      for (let t = 0; t < 100 && steps < 20000; t++) {
        const gw = W.map(() => [0, 0, 0]), gv = V.map(() => 0); let gb = 0;
        D.forEach((d) => {
          const f = forward(d[0], d[1]), delta = (f.p - d[2]) / D.length; gb += delta;
          W.forEach((w, j) => {
            gv[j] += delta * f.h[j];
            const dh = delta * V[j] * derivative(act.value, f.a[j], f.h[j]);
            gw[j][0] += dh * d[0]; gw[j][1] += dh * d[1]; gw[j][2] += dh;
          });
        });
        const e = +eta.value;
        const nw = W.map((w, j) => w.map((v, k) => v - e * gw[j][k])), nv = V.map((v, j) => v - e * gv[j]), nb = b - e * gb;
        if (nw.some((w) => w.some((v) => !Number.isFinite(v) || Math.abs(v) > 1e6)) || nv.some((v) => !Number.isFinite(v) || Math.abs(v) > 1e6) || !Number.isFinite(nb)) break;
        W = nw; V = nv; b = nb; steps++;
      }
      draw();
    }
    function draw() {
      if (!W.length) return;
      picture.innerHTML = '';
      const pl = P().frame(picture, { w: 420, h: 360, x: [-1.7, 1.7], y: [-1.7, 1.7], xlabel: 'x₁', ylabel: 'x₂', margin: { l: 32, b: 28 } });
      const N = 32, cell = 3.4 / N;
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
        const x = -1.7 + cell * i, y = -1.7 + cell * j, p = forward(x + cell / 2, y + cell / 2).p;
        const rect = pl.rect(x, y, cell, cell, 'bar');
        rect.style.fill = 'rgb(' + Math.round(59 + 142 * p) + ',' + Math.round(120 - 50 * p) + ',' + Math.round(196 - 135 * p) + ')'; rect.style.opacity = '0.35';
      }
      let loss = 0, correct = 0;
      D.forEach((d) => {
        const f = forward(d[0], d[1]);
        loss += Math.max(f.logit, 0) - f.logit * d[2] + Math.log1p(Math.exp(-Math.abs(f.logit)));
        correct += (f.p >= 0.5 ? 1 : 0) === d[2] ? 1 : 0;
        pl.dot(d[0], d[1], 4.5, 'pt big ' + (d[2] ? 'pos' : 'neg'));
      });
      legend(picture, [['蓝：p≈0', '#3b78c4'], ['红：p≈1', '#c9463d']]);
      ui.out.innerHTML = readout([['mean cross-entropy', f4(loss / D.length)], ['训练 accuracy', (100 * correct / D.length).toFixed(1) + '%'], ['step count', steps]]) +
        md('网络 $2-H-1$ 含偏置，输出 sigmoid + cross-entropy；每步 full-batch GD，重置使用相同 seeded 数据与初值。$H=1$ 给出（几乎）线性边界，也可能退化为常数预测；更多 hidden units 允许曲线边界，呼应 universal approximation，但不保证训练到最优（L11 p9–p12）。');
    }
    reset();
  });

  SML.viz.register('backprop-trace', function (el) {
    const ui = shell(el, 'Backpropagation：逐步追踪 chain rule');
    const x = [1, 0.5], w = [0.4, -0.3, 0.2, 0.6], v = [0.7, -0.5], target = 1, eta = 0.5;
    const net = [w[0] * x[0] + w[1] * x[1], w[2] * x[0] + w[3] * x[1]], h = net.map(sigmoid);
    const o = dot(v, h), E = 0.5 * Math.pow(target - o, 2), delta = o - target;
    const dh = h.map((a, j) => delta * v[j] * a * (1 - a));
    const gv = h.map((a) => delta * a), gw = [dh[0] * x[0], dh[0] * x[1], dh[1] * x[0], dh[1] * x[1]];
    const updated = w.map((a, j) => a - eta * gw[j]).concat(v.map((a, j) => a - eta * gv[j]));
    const names = ['v_{11}', 'v_{21}', 'v_{12}', 'v_{22}', 'w_1', 'w_2'];
    const edges = [['x1', 'h1'], ['x2', 'h1'], ['x1', 'h2'], ['x2', 'h2'], ['h1', 'o'], ['h2', 'o']];
    const states = [];
    function add(title, formula, numeric, nodes, edgeIds) { states.push({ title: title, formula: formula, numeric: numeric, nodes: nodes, edges: edgeIds }); }
    add('隐藏单元 1 的输入 r₁', 'r_1=v_{11}x_1+v_{21}x_2', 'r_1=' + f4(w[0]) + '\\times' + f4(x[0]) + '+(' + f4(w[1]) + ')\\times' + f4(x[1]) + '=' + f4(net[0]), ['x1', 'x2', 'h1'], [0, 1]);
    add('隐藏单元 1 的输出 u₁', 'u_1=g(r_1)=\\sigma(r_1)=1/(1+e^{-r_1})', 'u_1=1/(1+e^{-' + f4(net[0]) + '})=' + f4(h[0]), ['h1'], []);
    add('隐藏单元 2 的输入 r₂', 'r_2=v_{12}x_1+v_{22}x_2', 'r_2=' + f4(w[2]) + '\\times' + f4(x[0]) + '+' + f4(w[3]) + '\\times' + f4(x[1]) + '=' + f4(net[1]), ['x1', 'x2', 'h2'], [2, 3]);
    add('隐藏单元 2 的输出 u₂', 'u_2=g(r_2)=\\sigma(r_2)', 'u_2=1/(1+e^{-' + f4(net[1]) + '})=' + f4(h[1]), ['h2'], []);
    add('线性输出', 'z=s=w_1u_1+w_2u_2', 'z=' + f4(v[0]) + '\\times' + f4(h[0]) + '+(' + f4(v[1]) + ')\\times' + f4(h[1]) + '=' + f4(o), ['h1', 'h2', 'o'], [4, 5]);
    add('平方损失', 'L=\\tfrac12(z-y)^2', 'L=0.5000(' + f4(target) + '-' + f4(o) + ')^2=' + f4(E), ['o'], []);
    add('输出层误差 δ', '\\delta=\\partial L/\\partial s=z-y', '\\delta=' + f4(o) + '-' + f4(target) + '=' + f4(delta), ['o'], []);
    for (let j = 0; j < 2; j++) {
      add('输出权重 w' + (j + 1) + ' 的梯度', '\\partial L/\\partial w_' + (j + 1) + '=\\delta u_' + (j + 1), '\\partial L/\\partial w_' + (j + 1) + '=(' + f4(delta) + ')\\times' + f4(h[j]) + '=' + f4(gv[j]), ['h' + (j + 1), 'o'], [4 + j]);
    }
    for (let j = 0; j < 2; j++) {
      const id = j + 1;
      add('隐藏层误差 ε' + id, '\\varepsilon_' + id + '=\\partial L/\\partial r_' + id + '=\\delta w_' + id + 'g\'(r_' + id + ')=\\delta w_' + id + 'u_' + id + '(1-u_' + id + ')', '\\varepsilon_' + id + '=(' + f4(delta) + ')(' + f4(v[j]) + ')(' + f4(h[j]) + ')(1.0000-' + f4(h[j]) + ')=' + f4(dh[j]), ['h' + id, 'o'], [4 + j]);
    }
    for (let j = 0; j < 4; j++) {
      const hidden = Math.floor(j / 2) + 1, xi = j % 2;
      add('输入权重 ' + names[j].replace(/[{}_]/g, '') + ' 的梯度', '\\partial L/\\partial ' + names[j] + '=\\varepsilon_' + hidden + 'x_' + (xi + 1), '\\partial L/\\partial ' + names[j] + '=(' + f4(dh[hidden - 1]) + ')\\times' + f4(x[xi]) + '=' + f4(gw[j]), ['x' + (xi + 1), 'h' + hidden], [j]);
    }
    const old = w.concat(v), gradients = gw.concat(gv);
    add('同时更新全部权重', '\\theta^{new}=\\theta-\\eta\\,\\partial L/\\partial\\theta', names.map((name, j) => name + '^{new}=' + f4(old[j]) + '-0.5000(' + f4(gradients[j]) + ')=' + f4(updated[j])).join('\\quad '), ['x1', 'x2', 'h1', 'h2', 'o'], [0, 1, 2, 3, 4, 5]);
    let k = 0;
    const previous = btn('上一步', () => { k = Math.max(0, k - 1); draw(); });
    const next = btn('下一步', () => { k = Math.min(states.length - 1, k + 1); draw(); }, 'btn primary');
    const counter = node('span', 'pos');
    ui.tools.append(previous, next, btn('重来', () => { k = 0; draw(); }), counter);
    const picture = box(ui.body);
    const positions = { x1: [0.9, 3.1], x2: [0.9, 0.9], h1: [4.5, 3.1], h2: [4.5, 0.9], o: [8, 2] };
    function draw() {
      const st = states[k]; previous.disabled = k === 0; next.disabled = k === states.length - 1; counter.textContent = '第 ' + (k + 1) + ' / ' + states.length + ' 步';
      picture.innerHTML = '';
      const pl = P().frame(picture, { w: 520, h: 290, x: [0, 9], y: [0, 4.4], grid: false, axes: false, margin: { l: 4, r: 4, t: 8, b: 8 } });
      edges.forEach((edge, j) => {
        const a = positions[edge[0]], b = positions[edge[1]], active = st.edges.indexOf(j) >= 0;
        pl.line(a[0], a[1], b[0], b[1], active ? 'curve bad' : 'curve thin prior');
        const mix = j === 1 || j === 2 ? (j === 1 ? 0.33 : 0.67) : 0.5;
        const label = names[j].replace(/[{}_]/g, '') + '=' + f4(k === states.length - 1 ? updated[j] : old[j]);
        pl.text(a[0] + mix * (b[0] - a[0]), a[1] + mix * (b[1] - a[1]) + (j % 2 ? -0.22 : 0.2), label, active ? 'note r' : 'note');
      });
      Object.keys(positions).forEach((id) => {
        const pos = positions[id]; pl.dot(pos[0], pos[1], 18, st.nodes.indexOf(id) >= 0 ? 'pt hit big' : 'pt ghost big');
        const t = pl.text(pos[0], pos[1], ({ x1: 'x1', x2: 'x2', h1: 'u1', h2: 'u2', o: 'z' })[id], 'note'); t.setAttribute('dominant-baseline', 'central');
      });
      pl.text(0.9, 3.65, 'x1 = 1.0000', 'note'); pl.text(0.9, 0.35, 'x2 = 0.5000', 'note');
      if (k >= 0) pl.text(4.5, 4.05, 'r1 = ' + f4(net[0]), 'note');
      if (k >= 1) pl.text(4.5, 3.65, 'u1 = ' + f4(h[0]), 'note');
      if (k >= 2) pl.text(4.5, 0.4, 'r2 = ' + f4(net[1]), 'note');
      if (k >= 3) pl.text(4.5, 0.05, 'u2 = ' + f4(h[1]), 'note');
      if (k >= 4) pl.text(8, 2.6, 'z = ' + f4(o), 'note');
      if (k >= 5) pl.text(8, 1.35, 'L = ' + f4(E), 'note');
      if (k >= 6) pl.text(8, 0.95, 'δ = ' + f4(delta), 'note r');
      if (k >= 9) pl.text(4.5, 2.6, 'ε1 = ' + f4(dh[0]), 'note r');
      if (k >= 10) pl.text(4.5, 1.45, 'ε2 = ' + f4(dh[1]), 'note r');
      const numeric = k === states.length - 1 ? names.map((name, j) => md('$' + name + '^{new}=' + f4(old[j]) + '-0.5000(' + f4(gradients[j]) + ')=' + f4(updated[j]) + '$')).join('') : md('$' + st.numeric + '$');
      ui.out.innerHTML = md('**' + st.title + '**：$' + st.formula + '$') + numeric +
        md('记号与 L11 一致：$v_{ij}$ 是输入 $i$→隐藏单元 $j$ 的权重，$w_j$ 是隐藏单元 $j$→输出的权重，$g$ 是 sigmoid（$g\'(r)=u(1-u)$）。无偏置，$y=1$，$\\eta=0.5$；chain rule 复用误差项 $\\delta$、$\\varepsilon_j$（L11 p25–p31）。所有梯度都使用旧权重；最后仅更新权重，节点保留本次 forward pass 的值。');
    }
    draw();
  });

  // c34 · backprop on a standard drawing: inputs x0=1 (bias) and x1 → one ReLU unit (r1, u1) plus hidden bias u0=1 → output z → loss L.
  // One stepper: forward, what a derivative means (nudge v11), then backward with the reason for every multiplication.
  SML.viz.register('chain-nudge', function (el) {
    const ui = shell(el, 'Backpropagation：前向 → 导数是什么 → 反向（每一步为什么这样算）');
    const x1 = 2, v11 = 0.5, w0 = -1.5, w1 = 2, y = 0, h = 0.01;
    let k = 0, neg = false;
    const n = (a) => f3(Math.abs(a) < 1e-12 ? 0 : a);
    function vals() {
      const b = neg ? -3.5 : 0.5, r = b * 1 + v11 * x1, u = Math.max(0, r), g = r > 0 ? 1 : 0, z = w0 * 1 + w1 * u, L = 0.5 * (z - y) * (z - y);
      const r2 = b + (v11 + h) * x1, z2 = w0 + w1 * Math.max(0, r2), L2 = 0.5 * (z2 - y) * (z2 - y);
      const d = z - y, du = d * w1, eps = du * g;
      return { b: b, r: r, u: u, g: g, z: z, L: L, L2: L2, d: d, du: du, eps: eps, gw0: d * 1, gw1: d * u, gb: eps * 1, gv: eps * x1 };
    }
    const prev = btn('上一步', () => { k = Math.max(0, k - 1); draw(); });
    const next = btn('下一步', () => { k = Math.min(states().length - 1, k + 1); draw(); }, 'btn primary');
    const again = btn('重来', () => { k = 0; draw(); });
    const bNeg = btn('让 r₁ 变成负数', () => { neg = !neg; draw(); });
    const counter = node('span', 'pos');
    ui.tools.append(prev, next, again, bNeg, counter);
    const given = box(ui.body), picture = box(ui.body);
    // nodes and edges of the drawing (data units: x 0–10, y −0.2–4.6)
    const P0 = { x0: [0.9, 3.5], x1: [0.9, 1.5], r: [3.4, 2.5], u: [5.4, 2.5], u0: [5.4, 4.0], z: [7.6, 2.5], L: [9.4, 2.5] };
    const E = [['x0', 'r'], ['x1', 'r'], ['r', 'u'], ['u0', 'z'], ['u', 'z'], ['z', 'L']];
    const sx = 59.2, sy = 60, rad = 19;
    function ends(a, b) {
      const dx = (b[0] - a[0]) * sx, dy = (b[1] - a[1]) * sy, len = Math.hypot(dx, dy), f = (rad + 3) / len;
      return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, b[0] - (b[0] - a[0]) * f, b[1] - (b[1] - a[1]) * f];
    }
    function states() {
      const s = vals(), bTxt = n(s.b), neg1 = neg;
      const reluWhy = neg1 ? '$r_1=' + n(s.r) + '<0$，ReLU 在这里是平的（输出恒为 0），$r_1$ 再动 $u_1$ 也不动，倍数 $=0$' : '$r_1=' + n(s.r) + '>0$，ReLU 在这里就是 $u_1=r_1$，$r_1$ 动 1，$u_1$ 也动 1，倍数 $=1$';
      const F = 'f', B = 'b';
      return [
        { part: '前向', e: [[0, F], [1, F]], hl: ['x0', 'x1', 'r'], md: '**前向第 1 步：隐藏单元先求加权和。** 每条边把起点的值乘上边上的权重送过去，在 $r_1$ 加起来：\n\n$r_1=b\\cdot x_0+v_{11}\\cdot x_1=' + bTxt + '\\times1+0.5\\times2=' + n(s.r) + '$\n\nbias 就是一条从常数节点 $x_0=1$ 出来的边，它的权重就是 $b$（课件写成 $v_{01}$）。' },
        { part: '前向', e: [[2, F]], hl: ['r', 'u'], md: '**前向第 2 步：过激活函数。** $u_1=\\text{ReLU}(r_1)=\\max(0,r_1)=' + n(s.u) + '$。' },
        { part: '前向', e: [[3, F], [4, F]], hl: ['u0', 'u', 'z'], md: '**前向第 3 步：输出层同样求加权和**（隐藏层也有一个 bias 节点 $u_0=1$）：\n\n$z=w_0\\cdot u_0+w_1\\cdot u_1=-1.5\\times1+2\\times' + n(s.u) + '=' + n(s.z) + '$（回归，输出不再过激活函数）。' },
        { part: '前向', e: [[5, F]], hl: ['z', 'L'], md: '**前向第 4 步：算损失。** $L=\\tfrac12(z-y)^2=\\tfrac12(' + n(s.z) + '-0)^2=' + n(s.L) + '$。\n\n训练要让 $L$ 变小，所以要知道**每个权重往哪边调、调多少**，也就是每个权重的梯度 $\\partial L/\\partial(\\text{权重})$。前向时把 $r_1,u_1,z$ 都存下来，反向要用。' },
        { part: '导数是什么', e: [[1, F], [2, F], [4, F], [5, F]], hl: ['r', 'u', 'z', 'L'], nudge: true, md: '**梯度的意思：这个权重动一点，$L$ 动几倍。** 拿 $v_{11}$ 试：把它加 0.01，变化顺着网络往后传，每过一节乘一个"倍数"：\n\n- $r_1=\\cdots+v_{11}x_1$：$v_{11}$ 动 1，$r_1$ 动 $x_1=2$。所以 $r_1$ 动 $0.02$。\n- ReLU 的倍数是 ' + s.g + '：$u_1$ 动 $' + n(0.02 * s.g) + '$。\n- $z=\\cdots+w_1u_1$：$u_1$ 动 1，$z$ 动 $w_1=2$。所以 $z$ 动 $' + n(0.04 * s.g) + '$。\n- $L=\\tfrac12(z-y)^2$ 的斜率是 $z-y=' + n(s.d) + '$：$L$ 动约 $' + n(0.04 * s.g * s.d) + '$。\n\n倍数连乘：$2\\times' + s.g + '\\times2\\times' + n(s.d) + '=' + n(s.gv) + '$，这就是 $\\partial L/\\partial v_{11}$（真把 $v_{11}=0.51$ 代进去重算，$L$ 变成 $' + f4(s.L2) + '$，确实多了约 $' + n(s.gv) + '\\times0.01$）。\n\n**问题**：每个权重都这样从头推一遍太慢。注意后半段"$\\times2\\times' + n(s.d) + '$"（$z$ 之后的部分）对 $b$、$v_{11}$ 都一样。反向传播就是**从 $L$ 往回，先把后半段算好，给前面所有权重共用**。' },
        { part: '反向', e: [[5, B]], hl: ['z', 'L'], md: '**反向第 1 步：$L$ 对 $z$ 的导数。**\n\n- 要算：$\\delta=\\partial L/\\partial z$，意思是"$z$ 动 1，$L$ 动多少"。\n- 为什么这样算：$L=\\tfrac12(z-y)^2$，对 $z$ 求导就是 $z-y$。\n- 代数字：$\\delta=' + n(s.z) + '-0=' + n(s.d) + '$。\n\n从这里开始，每个节点都会得到一个"它动 1，$L$ 动多少"的数（红字）。' },
        { part: '反向', e: [[3, B], [4, B]], hl: ['u0', 'u', 'z'], md: '**反向第 2 步：输出层权重 $w_0,w_1$ 的梯度。**\n\n- 为什么这样算：$z=w_0u_0+w_1u_1$。$w_1$ 只出现在 $w_1u_1$ 这一项里，$w_1$ 动 1，$z$ 就动 $u_1$（**这条边起点的值**）。$z$ 动 1，$L$ 又动 $\\delta$。两个倍数相乘。\n- 代数字：$\\dfrac{\\partial L}{\\partial w_1}=\\delta\\times u_1=' + n(s.d) + '\\times' + n(s.u) + '=' + n(s.gw1) + '$；$\\dfrac{\\partial L}{\\partial w_0}=\\delta\\times u_0=' + n(s.d) + '\\times1=' + n(s.gw0) + '$（bias 起点永远是 1，所以 bias 的梯度就是 $\\delta$ 本身）。\n\n规则：**权重的梯度 = 这条边终点的红字 × 这条边起点的值**。' },
        { part: '反向', e: [[4, B]], hl: ['u', 'z'], md: '**反向第 3 步：把红字传到 $u_1$。** 想算更前面的 $b$、$v_{11}$，得先知道"$u_1$ 动 1，$L$ 动多少"。\n\n- 为什么乘 $w_1$：$z=w_0u_0+w_1u_1$，$u_1$ 动 1，$z$ 动 $w_1=2$；$z$ 动 1，$L$ 动 $\\delta$。\n- 代数字：$\\dfrac{\\partial L}{\\partial u_1}=\\delta\\times w_1=' + n(s.d) + '\\times2=' + n(s.du) + '$。\n\n**往回传要乘权重，就是因为权重正是"前一个节点到后一个节点"的倍数。** 这一步必须在第 1 步之后：不知道 $\\delta$，就算不出它。所以只能从 $L$ 往回算。' },
        { part: '反向', e: [[2, B]], hl: ['r', 'u'], md: '**反向第 4 步：穿过 ReLU，传到 $r_1$。**\n\n- 为什么乘 ReLU 的斜率：' + reluWhy + '。\n- 代数字：$\\varepsilon_1=\\dfrac{\\partial L}{\\partial r_1}=\\dfrac{\\partial L}{\\partial u_1}\\times\\text{ReLU}\'(r_1)=' + n(s.du) + '\\times' + s.g + '=' + n(s.eps) + '$。课件把它叫 $\\varepsilon_1$（隐藏单元的误差）。' + (neg1 ? '\n\n它是 0：误差在这里被 ReLU 挡住，前面的权重都学不到东西。' : '') },
        { part: '反向', e: [[0, B], [1, B]], hl: ['x0', 'x1', 'r'], md: '**反向第 5 步：隐藏层权重 $b$、$v_{11}$ 的梯度。** 和第 2 步同一条规则：\n\n- 为什么：$r_1=b\\cdot x_0+v_{11}\\cdot x_1$，$v_{11}$ 动 1，$r_1$ 动 $x_1$（这条边起点的值）。\n- 代数字：$\\dfrac{\\partial L}{\\partial v_{11}}=\\varepsilon_1\\times x_1=' + n(s.eps) + '\\times2=' + n(s.gv) + '$（和"导数是什么"那一步推出来的一样）；$\\dfrac{\\partial L}{\\partial b}=\\varepsilon_1\\times x_0=' + n(s.eps) + '\\times1=' + n(s.gb) + '$。' },
        { part: '总结', e: [[0, B], [1, B], [2, B], [3, B], [4, B], [5, B]], hl: ['r', 'u', 'z', 'L'], md: '**反向传播只用两条规则：**\n\n1. **节点往回传**：前一个节点的红字 = 后一个节点的红字 × 两者之间的倍数。两个节点之间是一条边，倍数就是边上的**权重**；两个节点之间是激活函数，倍数就是它的**斜率**。要先有后面的红字，才能算前面的，所以从 $L$ 往回算。一个节点连向好几个节点时，各条路算出来的**相加**。\n2. **权重的梯度** = 这条边**终点的红字 × 起点的值**。\n\n对上课件的四个公式：$\\delta=z-y$；$\\dfrac{\\partial L}{\\partial w_j}=\\delta u_j$（规则 2）；$\\varepsilon_j=\\delta w_j\\,g\'(r_j)$（规则 1，乘权重再乘斜率）；$\\dfrac{\\partial L}{\\partial v_{ij}}=\\varepsilon_jx_i$（规则 2）。\n\n最后用这些梯度一起更新：$\\text{权重}\\leftarrow\\text{权重}-\\eta\\times\\text{梯度}$（全部用更新前的旧权重算）。' },
      ];
    }
    function draw() {
      const s = vals(), st = states(), cur = st[k];
      prev.disabled = k === 0; next.disabled = k === st.length - 1;
      counter.textContent = cur.part + ' · 第 ' + (k + 1) + ' / ' + st.length + ' 步';
      bNeg.textContent = neg ? '让 r₁ 变回正数' : '让 r₁ 变成负数';
      given.innerHTML = md('**已知**：输入 $x_1=2$；bias 输入 $x_0=1$、$u_0=1$（永远是 1）；隐藏层权重 $b=' + n(s.b) + '$' + (neg ? '（点了"变成负数"后改成 $-3.5$）' : '') + '、$v_{11}=0.5$；输出层权重 $w_0=-1.5$、$w_1=2$；真值 $y=0$。');
      picture.innerHTML = '';
      const pl = P().frame(picture, { w: 600, h: 300, x: [0, 10], y: [-0.2, 4.6], grid: false, axes: false, margin: { l: 4, r: 4, t: 6, b: 6 } });
      const act = {}; cur.e.forEach((p) => { act[p[0]] = p[1]; });
      E.forEach((ed, j) => {
        const c = ends(P0[ed[0]], P0[ed[1]]);
        if (act[j] === 'b') pl.arrow(c[2], c[3], c[0], c[1], 'vec');
        else pl.arrow(c[0], c[1], c[2], c[3], act[j] === 'f' ? 'vec b' : 'vec m');
      });
      const wl = [['b = ' + n(s.b), 2.15, 3.33], ['v₁₁ = 0.5', 2.15, 1.67], ['ReLU', 4.4, 2.78], ['w₀ = −1.5', 6.75, 3.55], ['w₁ = 2', 6.5, 2.17], ['½(z−y)²', 8.5, 2.78]];
      wl.forEach((t, j) => pl.text(t[1], t[2], t[0], act[j] ? (act[j] === 'b' ? 'note r' : 'note a') : 'note'));
      const lab = { x0: 'x₀', x1: 'x₁', r: 'r₁', u: 'u₁', u0: 'u₀', z: 'z', L: 'L' };
      const val = { x0: '= 1', x1: '= 2', r: '= ' + n(s.r), u: '= ' + n(s.u), u0: '= 1', z: '= ' + n(s.z), L: '= ' + n(s.L) };
      Object.keys(P0).forEach((id) => {
        const p = P0[id];
        pl.dot(p[0], p[1], rad, cur.hl.indexOf(id) >= 0 ? 'pt hit big' : 'pt ghost big');
        const t = pl.text(p[0], p[1], lab[id], 'note'); t.setAttribute('dominant-baseline', 'central');
        if (id === 'u0') pl.text(p[0] - 0.42, p[1], val[id] + '（bias）', 'note', 'end');
        else pl.text(p[0], p[1] - 0.56, val[id] + (id === 'x0' ? '（bias）' : ''), 'note');
      });
      // red numbers: node sensitivities and weight gradients collected so far; blue: changes in the nudge step
      const back = st.slice(0, k + 1).filter((x) => x.part === '反向' || x.part === '总结').length;
      const red = [];
      if (cur.nudge) {
        red.push(['Δ = +0.01', 2.15, 1.37, 'note a'], ['Δ = +0.02', 3.4, 3.08, 'note a'], ['Δ = +' + n(0.02 * s.g), 5.4, 3.08, 'note a'],
          ['Δ = +' + n(0.04 * s.g), 7.45, 3.08, 'note a', 'start'], ['Δ ≈ +' + n(0.04 * s.g * s.d), 9.4, 3.08, 'note a']);
      }
      if (back >= 1) red.push(['δ = ∂L/∂z = ' + n(s.d), 7.45, 3.08, 'note r', 'start']);
      if (back >= 2) red.push(['∂L/∂w₀ = ' + n(s.gw0), 6.75, 3.85, 'note r'], ['∂L/∂w₁ = ' + n(s.gw1), 6.5, 1.87, 'note r']);
      if (back >= 3) red.push(['∂L/∂u₁ = ' + n(s.du), 5.4, 3.08, 'note r']);
      if (back >= 4) red.push(['ε₁ = ∂L/∂r₁ = ' + n(s.eps), 3.4, 3.08, 'note r'], ['×ReLU′ = ' + s.g, 4.4, 2.22, 'note r']);
      if (back >= 5) red.push(['∂L/∂b = ' + n(s.gb), 2.15, 3.63, 'note r'], ['∂L/∂v₁₁ = ' + n(s.gv), 2.15, 1.37, 'note r']);
      red.forEach((t) => pl.text(t[1], t[2], t[0], t[3], t[4]));
      ui.out.innerHTML = md(cur.md);
    }
    draw();
  });

  SML.viz.register('optimizers', function (el) {
    const ui = shell(el, 'Optimizers：在旋转的狭长二次碗上比较');
    const eta = P().slider(row(ui.body), '共享 learning rate η', { min: 0.005, max: 0.3, step: 0.005, value: 0.08 }, reset);
    ui.tools.append(btn('step 10', step, 'btn primary'), btn('reset', reset));
    const picture = box(ui.body), c = Math.cos(Math.PI / 6), s = Math.sin(Math.PI / 6);
    const A = [[10 * c * c + s * s, 9 * c * s], [9 * c * s, 10 * s * s + c * c]];
    const gradient = (w) => A.map((a) => dot(a, w)), loss = (w) => 0.5 * dot(w, gradient(w));
    const descriptions = [['GD', 'curve', 'var(--accent)'], ['momentum', 'curve bad', 'var(--bad)'], ['Adagrad', 'curve post', 'var(--good)'], ['Adam', 'curve lik', 'var(--warn)']];
    let methods = [], t = 0;
    function reset() {
      methods = descriptions.map((d) => ({ name: d[0], cls: d[1], w: [-3, 2], path: [[-3, 2]], velocity: [0, 0], sum: [0, 0], m: [0, 0], v: [0, 0], stopped: false })); t = 0; draw();
    }
    function step() {
      for (let k = 0; k < 10 && t < 2000; k++) {
        t++;
        methods.forEach((a, index) => {
          if (a.stopped) return;
          const g = gradient(a.w), next = a.w.slice(), e = +eta.value;
          for (let i = 0; i < 2; i++) {
            let update;
            if (index === 0) update = e * g[i];
            else if (index === 1) { a.velocity[i] = 0.9 * a.velocity[i] + e * g[i]; update = a.velocity[i]; }
            else if (index === 2) { a.sum[i] += g[i] * g[i]; update = e * g[i] / Math.sqrt(a.sum[i] + 1e-8); }
            else {
              a.m[i] = 0.9 * a.m[i] + 0.1 * g[i]; a.v[i] = 0.999 * a.v[i] + 0.001 * g[i] * g[i];
              update = e * (a.m[i] / (1 - Math.pow(0.9, t))) / Math.sqrt(a.v[i] / (1 - Math.pow(0.999, t)) + 1e-8);
            }
            next[i] -= update;
          }
          if (next.some((v) => !Number.isFinite(v) || Math.abs(v) > 1e6)) { a.stopped = true; return; }
          a.w = next; a.path.push(next.slice());
        });
      }
      draw();
    }
    function draw() {
      picture.innerHTML = '';
      const pl = P().frame(picture, { w: 420, h: 360, x: [-4.5, 4.5], y: [-4, 4], xlabel: 'w₁', ylabel: 'w₂', margin: { l: 32, b: 28 } });
      [0.2, 0.8, 2, 5, 10, 20, 40].forEach((level) => {
        const pts = [];
        for (let j = 0; j <= 160; j++) {
          const a = 2 * Math.PI * j / 160, q1 = Math.sqrt(2 * level / 10) * Math.cos(a), q2 = Math.sqrt(2 * level) * Math.sin(a);
          pts.push([c * q1 - s * q2, s * q1 + c * q2]);
        }
        pl.path(pts, 'curve thin prior', true);
      });
      methods.forEach((a) => { pl.path(a.path, a.cls); const d = pl.dot(a.w[0], a.w[1], 5, 'pt big'); d.style.fill = descriptions.find((desc) => desc[0] === a.name)[2]; });
      pl.dot(0, 0, 4, 'pt ok'); legend(picture, descriptions.map((d) => [d[0], d[2]]));
      const pairs = [['共同步数', t]].concat(methods.map((a) => [a.name + ' loss', f4(loss(a.w)) + (a.stopped ? '（发散，已暂停）' : a.w.some((v, i) => Math.abs(v) > (i ? 4 : 4.5)) ? '（图外）' : '')]));
      ui.out.innerHTML = readout(pairs) + md('令 $\\mathbf q=R_{30^\\circ}^\\top\\bw$，$L=\\frac12(10q_1^2+q_2^2)$；四法从同一点开始，改变学习率会重置。Momentum 用 $v_t=0.9v_{t-1}+\\eta\\nabla L$、$w_t=w_{t-1}-v_t$；Adagrad 累积平方梯度，Adam 用 $\\beta_1=0.9,\\beta_2=0.999$ 和 bias correction，两者均按课件将 $\\epsilon=10^{-8}$ 放在平方根内（L12 p12–p14）；GD 在 $\\eta<0.2$ 时稳定，最多 2000 步。');
    }
    reset();
  });

  SML.viz.register('pca-ae', function (el) {
    const ui = shell(el, 'PCA / linear autoencoder：投影与重建');
    const angle = P().slider(row(ui.body), '方向角 θ', { min: 0, max: 180, step: 0.1, value: 90, fmt: (v) => v.toFixed(1) + '°' }, draw);
    const rng = SML.quiz.seedRng(51229), cloud = [];
    for (let i = 0; i < 40; i++) {
      const a = normal(rng) * 1.5, b = normal(rng) * 0.3, theta = Math.PI / 5;
      cloud.push([a * Math.cos(theta) - b * Math.sin(theta), a * Math.sin(theta) + b * Math.cos(theta)]);
    }
    const mean = [0, 1].map((j) => cloud.reduce((s, p) => s + p[j], 0) / cloud.length);
    const D = cloud.map((p) => p.map((v, j) => v - mean[j]));
    const cov = [0, 1].map((i) => [0, 1].map((j) => D.reduce((s, p) => s + p[i] * p[j], 0) / D.length));
    const eig = jacobi(cov), pc = eig[1].vector;
    const best = ((Math.atan2(pc[1], pc[0]) * 180 / Math.PI) % 180 + 180) % 180;
    ui.tools.appendChild(btn('PCA', () => { angle.set(best); draw(); }, 'btn primary'));
    const picture = box(ui.body), range = Math.max(2, ...D.map((p) => Math.hypot(p[0], p[1]))) * 1.12;
    function draw() {
      picture.innerHTML = '';
      const theta = +angle.value * Math.PI / 180, u = [Math.cos(theta), Math.sin(theta)];
      const pl = P().frame(picture, { w: 420, h: 360, x: [-range, range], y: [-range, range], xlabel: 'x₁（centred）', ylabel: 'x₂', margin: { l: 32, b: 28 } });
      pl.line(-range * u[0], -range * u[1], range * u[0], range * u[1], 'boundary');
      let error = 0, variance = 0;
      D.forEach((p) => {
        const a = dot(p, u), q = u.map((v) => a * v); variance += a * a;
        error += Math.pow(p[0] - q[0], 2) + Math.pow(p[1] - q[1], 2);
        pl.line(p[0], p[1], q[0], q[1], 'curve thin prior'); pl.dot(q[0], q[1], 2.5, 'pt ok'); pl.dot(p[0], p[1], 4, 'pt');
      });
      pl.arrow(0, 0, u[0], u[1], 'vec g');
      legend(picture, [['原数据', 'var(--accent)'], ['重建 (uᵀx)u', 'var(--good)']]);
      ui.out.innerHTML = readout([['重建误差之和', f4(error)], ['projected variance（1/n）', f4(variance / D.length)], ['PCA 最小误差 nλ₂', f4(D.length * eig[0].value)], ['第一主轴角度', f3(best) + '°']]) +
        md('$\\hat\\bx=(\\bu^\\top\\bx)\\bu$，$\\|\\bu\\|=1$；最大化投影方差等价于最小化 $\\sum_i\\|\\bx_i-\\hat\\bx_i\\|^2$（L12 p28–p29）。一个 hidden unit、线性激活与 squared loss 的 autoencoder 在全局最优时学习与 PCA 相同的子空间，但编码权重未必是同一个规范化主轴（L12 p30）。');
    }
    draw();
  });
})(window);
