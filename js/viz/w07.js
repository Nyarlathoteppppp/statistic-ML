/* W7–W8 visualisations (L13–L16): CNN, RNN, attention, evaluation, cross-validation and experts. */
(function (root) {
  'use strict';
  const SML = root.SML;
  const P = () => SML.plot;
  const f3 = (v) => (Number.isFinite(v) ? String(+v.toFixed(3)) : '—');
  function node(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function btn(text, fn, cls) {
    const b = node('button', cls || 'btn', text);
    b.type = 'button'; b.addEventListener('click', fn); return b;
  }
  function shell(el, title) {
    const s = node('div', 'solver'), h = node('div', 'solver-head');
    const tools = node('div', 'tools'), body = node('div', 'solver-body'), out = node('div', 'solver-out');
    h.append(node('span', 'title', title), tools); s.append(h, body, out); el.appendChild(s);
    return { tools: tools, body: body, out: out };
  }
  function row(parent) { const r = node('div', 'row'); parent.appendChild(r); return r; }
  function readout(pairs) {
    const { inline } = SML.md;
    return '<div class="readout">' + pairs.map((p) =>
      '<div><span>' + inline(p[0]) + '</span><b>' + inline(String(p[1])) + '</b></div>').join('') + '</div>';
  }
  const md = (s) => SML.md.md(s);
  const sum = (xs) => xs.reduce((s, x) => s + x, 0);
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const finite = (v, fallback) => Number.isFinite(+v) ? +v : fallback;
  function select(parent, label, choices, change) {
    const l = node('label'); l.appendChild(node('span', null, label));
    const s = node('select'); s.setAttribute('aria-label', label);
    choices.forEach((c) => {
      const o = node('option'); o.value = c[0]; o.textContent = c[1]; s.appendChild(o);
    });
    l.appendChild(s); parent.appendChild(l);
    s.addEventListener('change', change); return s;
  }
  function picture(parent) { const b = node('div'); parent.appendChild(b); return b; }
  function table(parent, head, rows) {
    const wrap = node('div'); wrap.style.overflowX = 'auto';
    const t = node('table', 'compact mono');
    if (head) {
      const tr = node('tr');
      head.forEach((s) => { const th = node('th'); th.textContent = s; tr.appendChild(th); });
      const h = node('thead'); h.appendChild(tr); t.appendChild(h);
    }
    const b = node('tbody');
    rows.forEach((r) => {
      const tr = node('tr');
      r.forEach((v) => {
        const td = node('td');
        if (v && v.nodeType) td.appendChild(v); else td.textContent = String(v);
        tr.appendChild(td);
      }); b.appendChild(tr);
    });
    t.appendChild(b); wrap.appendChild(t); parent.appendChild(wrap); return t;
  }
  function numeric(value, label, change, integer) {
    const i = node('input'); i.type = 'number'; i.value = value;
    i.min = '-9'; i.max = '9'; i.step = integer ? '1' : '0.1';
    i.style.width = '3.4em'; i.style.maxWidth = '100%';
    i.style.boxSizing = 'border-box'; i.setAttribute('aria-label', label);
    i.addEventListener('input', change);
    // On commit, show the value actually used (clamped to [-9,9], rounded when integer) so the field never disagrees with the computation.
    i.addEventListener('change', () => { const v = num(i, integer); if (Number(i.value) !== v || i.value === '') { i.value = v; change(); } });
    return i;
  }
  function num(i, integer) {
    const v = clamp(finite(i.value, 0), -9, 9); return integer ? Math.round(v) : v;
  }
  function tracer(parent, render) {
    let k = 0, N = 1;
    const r = row(parent), pos = node('span', 'pos');
    const prev = btn('上一步', () => { k = Math.max(0, k - 1); update(); render(k); });
    const next = btn('下一步', () => { k = Math.min(N - 1, k + 1); update(); render(k); });
    const reset = btn('重来', () => { k = 0; update(); render(k); });
    r.classList.add('stepper'); r.append(prev, next, reset, pos);
    function update() {
      pos.textContent = '第 ' + (k + 1) + ' / ' + N + ' 步';
      prev.disabled = k === 0; next.disabled = k === N - 1;
    }
    update();
    return {
      reset(n) { N = Math.max(1, n); k = 0; update(); render(k); },
      get() { return k; },
      show() { update(); render(k); },
      element: r
    };
  }
  // Raw SVG coordinates for diagrams; viewBox keeps every picture responsive.
  function canvas(parent, w, h) {
    parent.innerHTML = '';
    return P().mk('svg', { viewBox: '0 0 ' + w + ' ' + h, class: 'plot' }, parent);
  }
  function text(svg, x, y, s, cls, size) {
    const t = P().mk('text', { x: x, y: y, class: cls || 'note', 'text-anchor': 'middle' }, svg);
    if (size) t.style.fontSize = size + 'px';
    t.textContent = s; return t;
  }
  function cell(svg, x, y, size, value, hot, grey, winner) {
    const r = P().mk('rect', {
      x: x, y: y, width: size, height: size,
      fill: grey ? 'var(--sunk)' : hot ? 'var(--accent-soft)' : 'var(--paper)',
      stroke: winner ? 'var(--good)' : hot ? 'var(--accent)' : 'var(--line-2)',
      'stroke-width': winner ? 3 : hot ? 2 : 1
    }, svg);
    if (grey) r.style.fill = 'var(--line)';
    text(svg, x + size / 2, y + size / 2 + 4, value, winner ? 'note g' : 'note', 12);
  }
  function grid(svg, values, x, y, size, mark) {
    values.forEach((r, i) => r.forEach((v, j) => {
      const m = mark ? mark(i, j) : {};
      cell(svg, x + j * size, y + i * size, size, v, m.hot, m.grey, m.winner);
    }));
  }

  /* ---------------- convolution ---------------- */
  SML.viz.register('conv-2d', function (el) {
    const ui = shell(el, 'CNN：逐步计算 2D convolution');
    const controls = row(ui.body);
    const image = select(controls, '输入', [
      ['edge', 'vertical edge'], ['diag', 'diagonal'], ['random', 'random 0–2（seed 1307）']
    ], build);
    const kernel = select(controls, 'Kernel', [
      ['edge', 'vertical edge'], ['blur', 'blur'], ['sharp', 'sharpen']
    ], build);
    const stride = select(controls, 'Stride', [['1', '1'], ['2', '2']], build);
    const padding = select(controls, 'Padding', [['0', '0'], ['1', '1']], build);
    let A = [], W = [], B = [], states = [], padded = [], nout = 0;
    const trace = tracer(ui.body, draw), box = picture(ui.body);
    function build() {
      const rng = SML.quiz.seedRng(1307), p = +padding.value, s = +stride.value;
      A = Array.from({ length: 6 }, (_, i) => Array.from({ length: 6 }, (_, j) =>
        image.value === 'edge' ? (j < 3 ? 2 : 0) :
          image.value === 'diag' ? (i === j ? 2 : 0) : Math.floor(3 * rng())));
      W = kernel.value === 'edge' ? [[1, 0, -1], [1, 0, -1], [1, 0, -1]] :
        kernel.value === 'blur' ? Array.from({ length: 3 }, () => [1 / 9, 1 / 9, 1 / 9]) :
          [[0, -1, 0], [-1, 5, -1], [0, -1, 0]];
      padded = Array.from({ length: 6 + 2 * p }, (_, i) =>
        Array.from({ length: 6 + 2 * p }, (_, j) =>
          i < p || j < p || i >= 6 + p || j >= 6 + p ? 0 : A[i - p][j - p]));
      nout = Math.floor((6 + 2 * p - 3) / s) + 1;
      B = Array.from({ length: nout }, () => Array(nout).fill(0)); states = [];
      for (let i = 0; i < nout; i++) for (let j = 0; j < nout; j++) {
        const terms = [];
        for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) {
          const v = padded[i * s + a][j * s + b];
          terms.push({ input: v, weight: W[a][b], product: v * W[a][b] });
        }
        B[i][j] = sum(terms.map((t) => t.product));
        states.push({ i: i, j: j, r: i * s, c: j * s, terms: terms, value: B[i][j] });
      }
      trace.reset(states.length);
    }
    function draw(k) {
      const st = states[k], p = +padding.value, s = +stride.value;
      const svg = canvas(box, 520, 335);
      text(svg, 150, 20, 'Input（灰色 = zero padding）');
      text(svg, 385, 20, 'Kernel W');
      text(svg, 385, 154, 'Output B');
      const size = 29, x = 150 - padded.length * size / 2;
      grid(svg, padded, x, 34, size, (i, j) => ({
        grey: i < p || j < p || i >= 6 + p || j >= 6 + p,
        hot: i >= st.r && i < st.r + 3 && j >= st.c && j < st.c + 3
      }));
      // Padding remains grey; the window's outline also encloses padding cells.
      P().mk('rect', {
        x: x + st.c * size, y: 34 + st.r * size, width: 3 * size, height: 3 * size,
        fill: 'none', stroke: 'var(--accent)', 'stroke-width': 3
      }, svg);
      grid(svg, W.map((r) => r.map((v) => kernel.value === 'blur' ? '1/9' : v)), 337, 34, 32);
      const shown = B.map((r, i) => r.map((v, j) => i * nout + j <= k ? f3(v) : '·'));
      grid(svg, shown, 385 - nout * 25 / 2, 168, 25,
        (i, j) => ({ hot: i === st.i && j === st.j }));
      const products = st.terms.map((t) =>
        t.input + '\\cdot(' + (kernel.value === 'blur' ? '\\frac19' : t.weight) + ')');
      const lines = [0, 3, 6].map((i) => products.slice(i, i + 3).join('+'));
      ui.out.innerHTML = md('当前窗口生成 $B_{' + (st.i + 1) + ',' + (st.j + 1) +
        '}=\\sum A_{ab}W_{ab}$，逐行的 elementwise products 如下（L13 p11–p12）。') +
        md('$\\begin{aligned}' + lines.map((v, i) => (i ? '+\\;&' : '&') + v).join('\\\\') +
          '\\\\=&' + f3(st.value) + '\\end{aligned}$') +
        readout([
          ['输出边长', '$\\lfloor(n+2p-k)/s\\rfloor+1=\\lfloor(6+2\\cdot' + p + '-3)/' + s + '\\rfloor+1=' + nout + '$'],
          ['Output shape', nout + ' × ' + nout],
          ['当前输出', f3(st.value)]
        ]) +
        md('Stride / padding 见 L13 p17；不能整除时向下取整。L13 p10–p11 的离散公式不翻转 kernel，因此这里的 deep-learning “convolution” 实际按 cross-correlation 计算（digest 未显式使用这个名称）。');
    }
    build();
  });

  /* ---------------- pooling ---------------- */
  SML.viz.register('pooling', function (el) {
    const ui = shell(el, 'Pooling：2×2 window，stride 2');
    const method = select(ui.tools, '方法', [['max', 'max'], ['avg', 'average']], draw);
    const edit = picture(ui.body), inputs = [];
    const preset = [[1, 3, 2, 0], [4, 2, 1, 5], [0, 2, 7, 1], [3, 1, 2, 6]];
    preset.forEach((r, i) => {
      inputs.push(r.map((v, j) => numeric(v, 'Input ' + (i + 1) + ',' + (j + 1), draw, true)));
    });
    const t = table(edit, null, inputs);
    t.style.width = '100%'; t.style.tableLayout = 'fixed';
    ui.tools.appendChild(btn('恢复预设', () => {
      inputs.forEach((r, i) => r.forEach((v, j) => { v.value = preset[i][j]; })); draw();
    }));
    const box = picture(ui.body);
    function draw() {
      const A = inputs.map((r) => r.map((i) => num(i, true)));
      const B = [[0, 0], [0, 0]], winners = new Set(), details = [];
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
        const coords = [[2 * i, 2 * j], [2 * i, 2 * j + 1], [2 * i + 1, 2 * j], [2 * i + 1, 2 * j + 1]];
        const vs = coords.map((c) => A[c[0]][c[1]]), mx = Math.max.apply(null, vs);
        B[i][j] = method.value === 'max' ? mx : sum(vs) / 4;
        if (method.value === 'max') {
          const c = coords[vs.indexOf(mx)]; winners.add(c.join(','));
        }
        details.push(['Output ' + (i + 1) + ',' + (j + 1),
          method.value === 'max' ? 'max(' + vs.join(',') + ') = ' + mx :
            '(' + vs.join(' + ') + ') / 4 = ' + f3(B[i][j])]);
      }
      const svg = canvas(box, 520, 225);
      text(svg, 155, 20, 'Input（绿色框 = max winner）');
      text(svg, 389, 20, 'Output');
      grid(svg, A, 75, 38, 40, (i, j) => ({
        hot: (Math.floor(i / 2) + Math.floor(j / 2)) % 2 === 0,
        winner: winners.has(i + ',' + j)
      }));
      grid(svg, B.map((r) => r.map(f3)), 345, 70, 44);
      ui.out.innerHTML = md('每个不重叠的 $2\\times2$ patch 变成一个输出，$4\\times4\\to2\\times2$（L13 p23）。' +
        (method.value === 'max' ? '并列最大值时本演示固定选行优先的第一个 winner，便于记录 backpropagation 的路由。' :
          'Average pooling 对四个值取平均；每个输入对该输出的导数都是 $1/4$。')) + readout(details);
    }
    draw();
  });

  /* ---------------- scalar RNN ---------------- */
  SML.viz.register('rnn-unroll', function (el) {
    const ui = shell(el, 'RNN unroll：共享参数与梯度传播');
    const r = row(ui.body), l = node('label', null, '输入 x');
    const input = node('input'); input.type = 'text'; input.value = '1,0,0,0,0,0,0,0';
    input.style.width = '100%'; input.style.minWidth = '0'; input.maxLength = 600;
    l.style.maxWidth = '100%'; l.appendChild(input); r.appendChild(l);
    const w = P().slider(row(ui.body), 'w', { min: -2, max: 2, step: 0.05, value: 0.8 }, build);
    const u = P().slider(row(ui.body), 'u', { min: -2, max: 2, step: 0.05, value: 1 }, build);
    let xs = [], hs = [], grads = [], states = [];
    const trace = tracer(ui.body, draw), chain = picture(ui.body), plot = picture(ui.body);
    input.addEventListener('input', build);
    function build() {
      xs = input.value.split(/[\s,，;]+/).filter(Boolean).slice(0, 24)
        .map(Number).filter(Number.isFinite).map((v) => clamp(v, -9, 9));
      if (!xs.length) xs = [0];
      hs = [0]; states = [];
      xs.forEach((x, i) => {
        const a = +w.value * hs[i] + +u.value * x;
        hs.push(Math.tanh(a)); states.push({ t: i + 1, a: a, h: hs[i + 1], previous: hs[i], x: x });
      });
      grads = Array(xs.length + 1).fill(0); grads[xs.length] = 1;
      for (let k = xs.length - 1; k >= 1; k--) {
        grads[k] = grads[k + 1] * +w.value * (1 - hs[k + 1] * hs[k + 1]);
      }
      trace.reset(states.length);
    }
    function draw(k) {
      const T = xs.length, st = states[k], columns = 4;
      const rows = Math.ceil(T / columns), svg = canvas(chain, 520, rows * 90 + 30);
      const loc = (i) => {
        const rr = Math.floor(i / columns), cc = i % columns;
        return [26 + (rr % 2 ? columns - 1 - cc : cc) * 125, 28 + rr * 90];
      };
      for (let i = 0; i < T - 1; i++) {
        const a = loc(i), b = loc(i + 1);
        const down = a[1] !== b[1];
        const x1 = down ? a[0] + 46 : a[0] + (b[0] > a[0] ? 92 : 0);
        const x2 = down ? b[0] + 46 : b[0] + (b[0] > a[0] ? 0 : 92);
        const y1 = down ? a[1] + 44 : a[1] + 22, y2 = down ? b[1] : b[1] + 22;
        P().mk('line', { x1: x1, y1: y1, x2: x2, y2: y2, class: i === k - 1 ? 'vec g' : 'vec b' }, svg);
        const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
        P().mk('path', {
          d: 'M' + x2 + ',' + y2 + ' l' + (-7 * dx / L + 3 * dy / L) + ',' +
            (-7 * dy / L - 3 * dx / L) + ' L' + (x2 - 7 * dx / L - 3 * dy / L) + ',' +
            (y2 - 7 * dy / L + 3 * dx / L) + ' Z', class: 'vec b head'
        }, svg);
      }
      xs.forEach((x, i) => {
        const a = loc(i);
        P().mk('rect', {
          x: a[0], y: a[1], width: 92, height: 44,
          fill: i === k ? 'var(--accent-soft)' : 'var(--paper)',
          stroke: i === k ? 'var(--accent)' : 'var(--line-2)', 'stroke-width': i === k ? 3 : 1
        }, svg);
        text(svg, a[0] + 46, a[1] - 7, 'x' + (i + 1) + ' = ' + f3(x));
        text(svg, a[0] + 46, a[1] + 17, 'h' + (i + 1));
        text(svg, a[0] + 46, a[1] + 34, f3(hs[i + 1]));
      });
      plot.innerHTML = '';
      const logs = grads.slice(1).filter((v) => v !== 0).map((v) => Math.log10(Math.abs(v)));
      const lo = Math.min(-1, Math.floor(Math.min.apply(null, logs))) - 1;
      const hi = Math.max(1, Math.ceil(Math.max.apply(null, logs)));
      const pl = P().frame(plot, {
        w: 520, h: 245, x: [0.5, Math.max(1.5, T + 0.5)], y: [lo, hi],
        xlabel: 'k', ylabel: '|∂hT/∂hk|（log scale）',
        xticks: Array.from({ length: T }, (_, i) => i + 1),
        yfmt: (v) => '10^' + v
      });
      const pts = grads.slice(1).map((v, i) => [i + 1, v === 0 ? lo : Math.log10(Math.abs(v))]);
      pl.path(pts, 'curve'); pl.line(0.5, 0, T + 0.5, 0, 'ref');
      pts.forEach((p, i) => pl.dot(p[0], p[1], i === k ? 5 : 3, grads[i + 1] === 0 ? 'pt ghost' : i === k ? 'pt hit' : 'pt'));
      const factors = hs.slice(2).map((h) => +w.value * (1 - h * h));
      ui.out.innerHTML = md('$h_{' + st.t + '}=\\tanh(w h_{' + (st.t - 1) + '}+u x_{' + st.t +
        '})=\\tanh((' + f3(+w.value) + ')(' + f3(st.previous) + ')+(' + f3(+u.value) +
        ')(' + f3(st.x) + '))=\\tanh(' + f3(st.a) + ')=' + f3(st.h) + '$（L14 p12）。') +
        readout([
          ['$T$（最多 24；空输入按 0）', T],
          ['$\\partial h_T/\\partial h_1$', grads[1].toExponential(3)],
          ['当前 $|\\partial h_T/\\partial h_' + st.t + '|$', Math.abs(grads[st.t]).toExponential(3)]
        ]) +
        md('$\\dfrac{\\partial h_T}{\\partial h_1}=\\prod_{t=2}^{T}w(1-h_t^2)=' +
          (factors.length ? factors.map((v) => '(' + f3(v) + ')').join('\\cdot') : '1') +
          '$；读数使用未舍入的因子，零梯度用灰点放在图底而非取 $\\log0$。') +
        md('连续相乘可能造成 vanishing / exploding gradients；LSTM 的加性 state-copy 路径与接近 1 的 forget gate 有助于保留梯度，但并非无条件保证（L14 p13–p14）。');
    }
    build();
  });

  /* ---------------- attention ---------------- */
  SML.viz.register('attention-calc', function (el) {
    const ui = shell(el, 'Attention：scores → softmax → context');
    const label = node('label', null, '<input type="checkbox"> scale by sqrt(d)');
    const scale = label.querySelector('input'); scale.checked = true;
    ui.tools.appendChild(label); scale.addEventListener('change', draw);
    const data = [
      ['q', 1, 2], ['K1', 1, 0], ['K2', 0, 1], ['K3', -1, 1],
      ['V1', 2, 0], ['V2', 0, 2], ['V3', -1, 1]
    ];
    const inputs = data.map((r) => [
      numeric(r[1], r[0] + ' dimension 1', draw), numeric(r[2], r[0] + ' dimension 2', draw)
    ]);
    table(ui.body, ['向量', 'dim 1', 'dim 2'], data.map((r, i) => [r[0], inputs[i][0], inputs[i][1]]));
    ui.tools.appendChild(btn('恢复预设', () => {
      inputs.forEach((r, i) => r.forEach((v, j) => { v.value = data[i][j + 1]; })); draw();
    }));
    const box = picture(ui.body);
    function draw() {
      const vecs = inputs.map((r) => r.map((i) => num(i)));
      const q = vecs[0], K = vecs.slice(1, 4), V = vecs.slice(4), d = 2;
      const divisor = scale.checked ? Math.sqrt(d) : 1;
      const dots = K.map((v) => q[0] * v[0] + q[1] * v[1]), scores = dots.map((v) => v / divisor);
      const shift = Math.max.apply(null, scores);
      const exps = scores.map((v) => Math.exp(v - shift)), denom = sum(exps), weights = exps.map((v) => v / denom);
      const context = [0, 1].map((j) => sum(weights.map((a, i) => a * V[i][j])));
      box.innerHTML = '';
      const pl = P().frame(box, {
        w: 520, h: 220, x: [0.5, 3.5], y: [0, 1.12],
        xticks: [1, 2, 3], xlabel: 'token j', ylabel: 'αj'
      });
      weights.forEach((a, i) => {
        pl.rect(i + 0.7, 0, 0.6, a, 'bar' + (a === Math.max.apply(null, weights) ? ' hot' : ''));
        pl.text(i + 1, a + 0.045, f3(a));
      });
      const steps = scores.map((e, i) => [
        '$e_' + (i + 1) + '=q^\\top K_' + (i + 1) + '/' + (scale.checked ? '\\sqrt2' : '1') + '$',
        '$[(' + f3(q[0]) + ')(' + f3(K[i][0]) + ')+(' + f3(q[1]) + ')(' + f3(K[i][1]) +
          ')]/' + f3(divisor) + '=' + f3(e) + '$'
      ]);
      const soft = weights.map((a, i) => [
        '$\\alpha_' + (i + 1) + '=e^{e_' + (i + 1) + '-e_{\\max}}/Z$',
        '$' + f3(exps[i]) + '/' + f3(denom) + '=' + f3(a) + '$'
      ]);
      ui.out.innerHTML = md('沿用 L14 p17 的 $e_j,\\alpha_j,\\mathbf c$ 记号；这里将 scoring function 具体化为 scaled dot-product，$q,K,V$ 与 $\\sqrt d$ 是扩展示例，并非 digest 中印出的公式。') +
        readout(steps.concat(soft)) +
        md('$\\mathbf c=\\sum_{j=1}^{3}\\alpha_j V_j=(' +
          [0, 1].map((j) => weights.map((a, i) => f3(a) + '\\cdot(' + f3(V[i][j]) + ')').join('+')).join(',\\;') +
          ')=(' + context.map(f3).join(',\\;') + ')$；稳定 softmax 减去 $e_{\\max}=' + f3(shift) +
          '$，不改变权重，缩放通常使分布较不尖锐。');
    }
    draw();
  });

  /* ---------------- classification metrics and ROC ---------------- */
  SML.viz.register('confusion-metrics', function (el) {
    const ui = shell(el, 'Confusion matrix、阈值与 ROC / AUC');
    const rng = SML.quiz.seedRng(1507);
    const labels = [1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1];
    const examples = labels.map((y, i) => ({
      id: i + 1, y: y, score: +(0.08 + 0.64 * rng() + 0.18 * y).toFixed(3)
    }));
    const threshold = P().slider(row(ui.body), 'Threshold τ', { min: 0, max: 1, step: 0.001, value: 0.5 }, draw);
    const cm = picture(ui.body), plot = picture(ui.body), list = picture(ui.body);
    function counts(t) {
      const c = { TP: 0, FP: 0, FN: 0, TN: 0 };
      examples.forEach((e) => { c[e.score >= t ? (e.y ? 'TP' : 'FP') : (e.y ? 'FN' : 'TN')]++; });
      return c;
    }
    const thresholds = [Infinity].concat(Array.from(new Set(examples.map((e) => e.score))).sort((a, b) => b - a));
    const roc = thresholds.map((t) => {
      const c = counts(t); return [c.FP / (c.FP + c.TN), c.TP / (c.TP + c.FN)];
    });
    let auc = 0;
    for (let i = 1; i < roc.length; i++) auc += (roc[i][0] - roc[i - 1][0]) * (roc[i][1] + roc[i - 1][1]) / 2;
    const ratio = (a, b) => b ? f3(a / b) : '—（分母为 0）';
    function draw() {
      const t = +threshold.value, c = counts(t), tpr = c.TP / (c.TP + c.FN), fpr = c.FP / (c.FP + c.TN);
      cm.innerHTML = '';
      table(cm, ['预测 \\ 真实', '+1', '−1'], [
        ['+1', 'TP = ' + c.TP, 'FP = ' + c.FP],
        ['−1', 'FN = ' + c.FN, 'TN = ' + c.TN]
      ]);
      plot.innerHTML = '';
      const pl = P().frame(plot, {
        w: 520, h: 290, x: [0, 1], y: [0, 1],
        xlabel: 'FPR = 1 − Specificity', ylabel: 'TPR = Recall', margin: { t: 20 }
      });
      pl.path([[0, 0], [1, 1]], 'curve prior'); pl.path(roc, 'curve post');
      roc.forEach((v) => pl.dot(v[0], v[1], 2.5, 'pt ok'));
      pl.dot(fpr, tpr, 6, 'pt hit');
      list.innerHTML = '';
      table(list, ['样本', 'score', '真实', '预测', '类别'], examples.map((e) => [
        e.id, f3(e.score), e.y ? '+1' : '−1', e.score >= t ? '+1' : '−1',
        e.score >= t ? (e.y ? 'TP' : 'FP') : (e.y ? 'FN' : 'TN')
      ]));
      ui.out.innerHTML = md('按 $score\\ge\\tau=' + f3(t) +
        '$ 预测 $+1$；矩阵按预测行、真实列排列（L15 p7），分母为零的指标记为未定义。') +
        readout([
          ['$Accuracy=(TP+TN)/12$', f3((c.TP + c.TN) / 12)],
          ['$Precision=TP/(TP+FP)$', ratio(c.TP, c.TP + c.FP)],
          ['$Recall=TP/(TP+FN)$', f3(tpr)],
          ['$F1=2TP/(2TP+FP+FN)$', ratio(2 * c.TP, 2 * c.TP + c.FP + c.FN)],
          ['$FPR=FP/(FP+TN)$', f3(fpr)],
          ['$AUC=\\sum_i\\Delta FPR_i(TPR_i+TPR_{i-1})/2$', f3(auc)]
        ]) +
        md('绿色曲线遍历所有不同 score 的阈值并包含两个端点，红点为当前阈值；此处用常见的 FPR 横轴，L15 p11 原图用 Specificity 横轴，两者满足 $FPR=1-Specificity$。');
    }
    draw();
  });

  /* ---------------- CV and bootstrap ---------------- */
  SML.viz.register('cv-split', function (el) {
    const ui = shell(el, 'Cross-validation：哪些点暂时未被训练看到？');
    const method = select(ui.tools, '方法', [
      ['fold', 'k-fold'], ['loo', 'leave-one-out'], ['boot', 'bootstrap']
    ], build);
    const k = P().slider(row(ui.body), 'k', { min: 2, max: 10, step: 1, value: 5 }, build);
    let states = [], counts = [], drawOrder = [], sample = 0;
    const trace = tracer(ui.body, draw), box = picture(ui.body);
    const resample = btn('Resample / 重新抽样', () => { sample++; bootstrap(); build(); });
    ui.tools.appendChild(resample);
    function bootstrap() {
      const rng = SML.quiz.seedRng(150019 + sample * 7919);
      counts = Array(20).fill(0); drawOrder = [];
      for (let i = 0; i < 20; i++) {
        const j = Math.floor(rng() * 20); counts[j]++; drawOrder.push(j + 1);
      }
    }
    function build() {
      const boot = method.value === 'boot', N = method.value === 'loo' ? 20 : +k.value;
      k.parentNode.hidden = method.value !== 'fold';
      k.parentNode.style.display = method.value === 'fold' ? '' : 'none';
      resample.hidden = !boot; trace.element.hidden = boot;
      trace.element.style.display = boot ? 'none' : '';
      states = boot ? [{ validation: counts.map((v, i) => v === 0 ? i : -1).filter((i) => i >= 0) }] :
        Array.from({ length: N }, (_, fold) => ({
          validation: Array.from({ length: 20 }, (_, i) => i)
            .filter((i) => Math.floor(i * N / 20) === fold)
        }));
      trace.reset(states.length);
    }
    function draw(step) {
      const boot = method.value === 'boot', st = states[step], val = new Set(st.validation);
      const svg = canvas(box, 520, 120);
      text(svg, 260, 20, boot ? '绿色 = out-of-bag；下方数字 = 抽取次数' : '绿色 = 本折测试（held-out）；蓝色 = training');
      for (let i = 0; i < 20; i++) {
        const x = 10 + i * 25;
        P().mk('rect', {
          x: x, y: 43, width: 21, height: 21,
          fill: val.has(i) ? 'var(--good-soft)' : 'var(--accent-soft)',
          stroke: val.has(i) ? 'var(--good)' : 'var(--accent)', 'stroke-width': val.has(i) ? 2 : 1
        }, svg);
        text(svg, x + 10.5, 37, i + 1, 'note', 10);
        if (boot) text(svg, x + 10.5, 83, counts[i], 'note', 11);
      }
      if (boot) {
        ui.out.innerHTML = md('从 $n=20$ 个点有放回抽取 20 次，重复样本参与 training，计数为零的点属于 out-of-bag（L15 p19–p20）。') +
          readout([
            ['抽取总次数', sum(counts)],
            ['不同 training 点数', 20 - val.size],
            ['OOB fraction', val.size + '/20 = ' + f3(val.size / 20)],
            ['有限 n 理论 OOB', '$(1-1/20)^{20}=' + f3(Math.pow(19 / 20, 20)) + '$'],
            ['大 n 极限', '$e^{-1}\\approx0.368$']
          ]) +
          md('本次抽取顺序：' + drawOrder.join(', ') + '；单次 OOB 比例有波动，理论值是期望，不要求每次相等。');
      } else {
        ui.out.innerHTML = md('第 ' + (step + 1) + ' 个 fold 用绿色点测试，剩余点训练；依次轮换后每个点恰好被测试一次（L15 p18）。') +
          readout([
            ['Fold 数', states.length],
            ['当前 training', 20 - val.size],
            ['当前测试折大小', val.size],
            ['测试样本 IDs', st.validation.map((i) => i + 1).join(', ')]
          ]) +
          md((method.value === 'loo' ? 'Leave-one-out 是 $k=n=20$。' : '固定连续分组，fold 大小最多相差 1。') +
            '预处理和 feature selection 必须只在当前 training 内拟合，避免 data leakage（L15 p22–p23）。');
      }
    }
    bootstrap(); build();
  });

  /* ---------------- expert advice ---------------- */
  SML.viz.register('experts-sim', function (el) {
    const ui = shell(el, 'Expert advice：逐轮预测、观察、更新');
    const preset = select(ui.tools, '预测表', [
      ['perfect', '一个 expert 完美'], ['imperfect', '没有完美 expert']
    ], build);
    const algorithm = select(ui.tools, '算法', [
      ['majority', 'Majority vote（错者淘汰，L16 p5–p6）'], ['halving', 'Halving（错者权重 ×½，L16 p11–p12）'], ['weighted', 'Weighted Majority（×β）']
    ], build);
    const beta = P().slider(row(ui.body), 'β（错误权重乘数）', {
      min: 0.05, max: 0.95, step: 0.05, value: 0.5
    }, build);
    const truth = [0, 1, 0, 1, 1, 0, 1, 0, 0, 1];
    const base = [
      truth.slice(),
      truth.map((y, i) => i < 2 || i === 6 ? 1 - y : y),
      truth.map((y, i) => i % 2 === 0 ? 1 - y : y),
      truth.map((y, i) => i < 5 ? 1 - y : y)
    ];
    let predictions = [], states = [];
    const trace = tracer(ui.body, draw), box = picture(ui.body), detail = picture(ui.body), all = picture(ui.body);
    function build() {
      const weighted = algorithm.value === 'weighted', halving = algorithm.value === 'halving';
      beta.parentNode.style.display = weighted ? '' : 'none';
      const factor = weighted ? +beta.value : halving ? 0.5 : 0;
      predictions = base.map((r) => r.slice());
      if (preset.value === 'imperfect') predictions[0][7] = 1 - truth[7];
      let weights = [1, 1, 1, 1], mistakes = [0, 0, 0, 0], M = 0;
      states = [];
      for (let t = 0; t < 10; t++) {
        const before = weights.slice(), previousMistakes = mistakes.slice(), vote = [0, 0];
        predictions.forEach((r, i) => { vote[r[t]] += before[i]; });
        const empty = sum(before) === 0;
        // Deterministic tie-break: predict 0 (a choice of this tool; the slides give no rule). An empty majority pool has no prediction.
        const prediction = empty ? null : vote[1] > vote[0] ? 1 : 0;
        const wrong = prediction != null && prediction !== truth[t];
        if (wrong) M++;
        predictions.forEach((r, i) => {
          if (r[t] !== truth[t]) {
            mistakes[i]++;
            weights[i] *= factor;
          }
        });
        states.push({
          t: t, before: before, after: weights.slice(), vote: vote,
          prediction: prediction, truth: truth[t], wrong: wrong,
          M: M, mistakes: mistakes.slice(), previousMistakes: previousMistakes,
          empty: empty
        });
      }
      trace.reset(states.length);
    }
    function draw(k) {
      const st = states[k], mode = algorithm.value, weighted = mode === 'weighted', B = +beta.value;
      const svg = canvas(box, 520, 210);
      text(svg, 260, 20, 'Round ' + (k + 1) + '：权重（前 → 后）');
      const max = Math.max(1, ...st.before);
      for (let i = 0; i < 4; i++) {
        const x = 45 + i * 120;
        P().mk('rect', { x: x, y: 155 - 105 * st.before[i] / max, width: 31, height: 105 * st.before[i] / max, class: 'bar' }, svg);
        P().mk('rect', { x: x + 33, y: 155 - 105 * st.after[i] / max, width: 31, height: 105 * st.after[i] / max, class: 'bar alt' }, svg);
        text(svg, x + 32, 177, 'E' + (i + 1));
        text(svg, x + 32, 195, f3(st.before[i]) + ' → ' + f3(st.after[i]), 'note', 11);
      }
      detail.innerHTML = '';
      table(detail, ['Expert', '本轮预测', '更新前 w', '更新后 w', '累计 mistakes'], predictions.map((r, i) => [
        'E' + (i + 1), r[k], f3(st.before[i]), f3(st.after[i]), st.mistakes[i]
      ]));
      all.innerHTML = '';
      const t = table(all, ['Round', 'E1', 'E2', 'E3', 'E4', 'Truth'], truth.map((y, j) => [
        j + 1, ...predictions.map((r) => r[j]), y
      ]));
      const trs = t.querySelectorAll('tbody tr');
      trs[k].style.background = 'var(--accent-soft)';
      const m = Math.min.apply(null, st.mistakes), eps = 1 - B;
      let bounds;
      if (mode === 'halving') {
        bounds = readout([
          ['Best-expert mistakes $m$', m],
          ['Halving 界（L16 p12）', '$M\\le\\frac{m+\\log_2 4}{\\log_2(4/3)}=' + f3((m + 2) / Math.log2(4 / 3)) + '$']
        ]) + md('Halving 不要求有完美专家：犯错的专家只是权重减半，不会被淘汰。');
      } else if (mode === 'majority') {
        bounds = readout([['Infallible bound（L16 p6）', '$M\\le\\log_2 n=\\log_2 4=2$']]) +
          md(preset.value === 'perfect' ?
            '完美 E1 始终保留；每次 learner 犯错，至少一半存活 experts 被淘汰。' :
            '此 preset 没有完美 expert，因此 $M\\le2$ 的假设不成立；池为空时停止预测，不把“无预测”算作正确。');
      } else {
        const exact = (Math.log(4) - m * Math.log(B)) / (-Math.log((1 + B) / 2));
        bounds = readout([
          ['Best-expert mistakes $m$', m],
          ['全 β 有效的 potential bound', '$M\\le\\frac{\\ln4-m\\ln\\beta}{-\\ln((1+\\beta)/2)}=' + f3(exact) + '$']
        ]);
        if (eps <= 0.5 + 1e-12) {
          const bound = 2 * (1 + eps) * m + 2 * Math.log(4) / eps;
          bounds += readout([[
            'L16 p18：$\\varepsilon=1-\\beta=' + f3(eps) + '$',
            '$M\\le2(1+\\varepsilon)m+2\\ln4/\\varepsilon=' + f3(bound) + '$'
          ]]);
        } else {
          bounds += md('此时 $\\varepsilon=1-\\beta=' + f3(eps) +
            '>0.5$，不使用 L16 p18 依赖 Tool 1 的简化界；上方保留精确对数界。');
        }
      }
      const votes0 = predictions.map((r, i) => r[k] === 0 ? f3(st.before[i]) : '0').join('+');
      const votes1 = predictions.map((r, i) => r[k] === 1 ? f3(st.before[i]) : '0').join('+');
      ui.out.innerHTML = md('本轮 weighted votes：$v_0=' + votes0 + '=' + f3(st.vote[0]) +
        '$，$v_1=' + votes1 + '=' + f3(st.vote[1]) +
        '$；先预测再观察 truth。并列时本工具固定预测 0（课件没规定平局规则，这是工具的选择）。') +
        readout([
          ['算法 prediction', st.empty ? '无（expert pool 为空）' : st.prediction],
          ['Truth', st.truth],
          ['本轮结果', st.empty ? '停止预测' : st.wrong ? 'mistake' : '正确'],
          ['累计算法 mistakes $M$', st.M],
          ['本轮更新', weighted ? '$w_i\\leftarrow\\beta w_i=' + f3(B) + 'w_i$（仅错误者）' : mode === 'halving' ? '$w_i\\leftarrow w_i/2$（仅错误者）' : '错误者权重置 0（淘汰）']
        ]) + bounds;
    }
    build();
  });
  // c40 · architecture figures redrawn from L14 p8–p14: folded vs unfolded RNN, three application structures, BPTT, LSTM cell
  let rnnArchId = 0;
  SML.viz.register('rnn-arch', function (el) {
    const ui = shell(el, 'RNN 架构图（课件 L14 p8–p14）');
    const id = 'ra' + (++rnnArchId);
    const R = 22;
    // ---- tiny SVG string builders (classes come from svg.graph in css/viz.css) ----
    const N = (x, y, label, cls) => '<g class="node ' + (cls || '') + '"><circle cx="' + x + '" cy="' + y + '" r="' + R + '"/><text x="' + x + '" y="' + y + '">' + label + '</text></g>';
    function E(a, b, opt) {
      opt = opt || {};
      const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy), ra = opt.ra == null ? R : opt.ra, rb = (opt.rb == null ? R : opt.rb) + 3;
      const x1 = a[0] + dx / len * ra, y1 = a[1] + dy / len * ra, x2 = b[0] - dx / len * rb, y2 = b[1] - dy / len * rb;
      let s = '<line class="edge ' + (opt.cls || '') + '" x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" marker-end="url(#' + id + (opt.red ? 'r' : 'k') + ')"/>';
      if (opt.label) {
        const mx = (x1 + x2) / 2 + (opt.lx || 0), my = (y1 + y2) / 2 + (opt.ly == null ? -10 : opt.ly);
        s += '<text class="edge-label ' + (opt.red ? 'r' : '') + '" x="' + mx.toFixed(1) + '" y="' + my.toFixed(1) + '">' + opt.label + '</text>';
      }
      return s;
    }
    const Pth = (d, red, cls) => '<path class="edge ' + (cls || '') + '" d="' + d + '" marker-end="url(#' + id + (red ? 'r' : 'k') + ')"/>';
    const T = (x, y, s, cls) => '<text class="lbl ' + (cls || '') + '" x="' + x + '" y="' + y + '">' + s + '</text>';
    const svg = (w, h, body) => '<svg class="graph rnn" viewBox="0 0 ' + w + ' ' + h + '" role="img"><defs>' +
      '<marker id="' + id + 'k" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker>' +
      '<marker id="' + id + 'r" class="red" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker>' +
      '</defs>' + body + '</svg>';
    const s = (t) => 'h⁽' + t + '⁾', xs = (t) => 'x⁽' + t + '⁾';

    const tabs = [
      { name: '① 折叠 / 展开', draw: () => {
        const ch = [[260, 90], [350, 90], [450, 90], [550, 90], [640, 90]], ins = [[350, 190], [450, 190], [550, 190]];
        let b = N(60, 190, 'x') + N(60, 90, 'h') + E([60, 190], [60, 90], { label: 'U', lx: -14, ly: 0 }) +
          Pth('M78,76 C140,30 140,150 80,105') + T(140, 92, 'W', 'w') +
          '<line class="edge" x1="170" y1="140" x2="225" y2="140" marker-end="url(#' + id + 'k)"/>' + T(197, 128, '展开 unfold', 'mid');
        b += N(ch[0][0], ch[0][1], '…', 'removed') + N(ch[4][0], ch[4][1], '…', 'removed');
        [s('t−1'), s('t'), s('t+1')].forEach((l, i) => { b += N(ch[i + 1][0], ch[i + 1][1], l) + N(ins[i][0], ins[i][1], xs(['t−1', 't', 't+1'][i])) + E(ins[i], ch[i + 1], { label: 'U', lx: -12, ly: 0 }); });
        for (let i = 0; i < 4; i++) b += E(ch[i], ch[i + 1], { label: 'W' });
        b += T(450, 236, '每一步都用同一组 U、W（参数共享）；展开后的深度 = 序列长度', 'mid');
        return svg(680, 250, b);
      }, md: '左边是**折叠**画法：一个 RNN 单元，自环箭头 $W$ 表示"把上一步的 $\\mathbf h$ 喂回来"。右边是**展开（unfold）**：序列多长就复制多少份，每一步用的都是**同一组** $U$、$W$。\n\n所以展开后是一个**深度 = 序列长度**的深网络，这就是 2021 Q1 "In what respect is it deep?" 的答案。公式 $\\mathbf h^{(t)}=\\tanh(\\mathbf b+W\\mathbf h^{(t-1)}+U\\mathbf x^{(t)})$：$U$ 管这一步的输入，$W$ 管上一步传来的记忆。' },
      { name: '② 序列分类', draw: () => {
        const hx = [80, 190, 300, 410], H = 200, X = 290;
        let b = '';
        ['⁽¹⁾', '⁽²⁾', '', '⁽ᵀ⁾'].forEach((sup, i) => {
          const dash = i === 2;
          b += N(hx[i], H, dash ? '…' : 'h' + sup, dash ? 'removed' : '') + N(hx[i], X, dash ? '…' : 'x' + sup, dash ? 'removed' : '') + E([hx[i], X], [hx[i], H], { label: 'U', lx: -12, ly: 0 });
          if (i) b += E([hx[i - 1], H], [hx[i], H], { label: 'W' });
        });
        b += N(410, 110, 'o⁽ᵀ⁾') + E([410, 200], [410, 110], { label: 'V', lx: -12, ly: 0 }) + N(300, 110, 'y⁽ᵀ⁾', 'given') + N(355, 30, 'L⁽ᵀ⁾') +
          E([410, 110], [355, 30]) + E([300, 110], [355, 30]);
        b += T(470, 34, '损失 L（比较 o 和 y）') + T(470, 114, '输出层 o，真标签 y（灰）') + T(470, 204, '隐藏层 h') + T(470, 294, '输入 x（一个个 token）');
        return svg(680, 320, b);
      }, md: '**整个序列只要一个标签**（例如一条影评是正面还是负面）。读完全部 token 后，只把**最后一个**隐藏状态 $\\mathbf h^{(T)}$ 接到输出层 $\\mathbf o^{(T)}=\\mathbf d+V\\mathbf h^{(T)}$，再和真标签 $y^{(T)}$ 比较得到损失 $L^{(T)}$。中间各步没有输出，它们的作用是把信息一路传给 $\\mathbf h^{(T)}$。' },
      { name: '③ 序列标注', draw: () => {
        const hx = [90, 230, 370];
        let b = N(500, 200, '…', 'removed') + E([370, 200], [500, 200], { label: 'W' });
        ['t−1', 't', 't+1'].forEach((t, i) => {
          const x = hx[i];
          b += N(x, 200, s(t)) + N(x, 290, xs(t)) + E([x, 290], [x, 200], { label: 'U', lx: -12, ly: 0 }) +
            N(x, 115, 'o⁽' + t + '⁾') + E([x, 200], [x, 115], { label: 'V', lx: -12, ly: 0 }) +
            N(x, 35, 'L⁽' + t + '⁾') + E([x, 115], [x, 35]) + N(x + 66, 35, 'y⁽' + t + '⁾', 'given') + E([x + 66, 35], [x, 35]);
          if (i) b += E([hx[i - 1], 200], [x, 200], { label: 'W' });
        });
        b += T(560, 40, '每一步都有损失') + T(560, 120, '每一步都有输出') + T(560, 296, '输入 x');
        return svg(680, 320, b);
      }, md: '**每个 token 都要一个标签**（例如给每个词标词性）。**每一步**都有输出 $\\mathbf o^{(t)}=\\mathbf d+V\\mathbf h^{(t)}$，$\\hat{\\mathbf y}^{(t)}=\\text{softmax}(\\mathbf o^{(t)})$，和这一步的真标签 $y^{(t)}$（灰色）比较得到 $L^{(t)}$；总损失是各步损失之和。参数 $\\mathbf b,W,U,\\mathbf d,V$ 在所有位置共享（课件 L14 p12 就是这张图）。' },
      { name: '④ Encoder–decoder', draw: () => {
        const ex = [160, 270, 380], C = [520, 170];
        let b = T(95, 74, '编码器', 'end') + T(95, 284, '解码器', 'end');
        ex.forEach((x, i) => {
          b += N(x, 70, 'h') + N(x, 150, xs(i + 1)) + E([x, 150], [x, 70]);
          if (i) b += E([ex[i - 1], 70], [x, 70]);
          b += N(x, 280, 'h', 'hl') + N(x, 370, 'y⁽' + (i + 1) + '⁾') + E([x, 280], [x, 370]) + E(C, [x, 280], { cls: 'moral' });
          if (i) b += E([ex[i - 1], 280], [x, 280]) + E([ex[i - 1], 370], [x, 280], { cls: 'thin' });
        });
        b += N(C[0], C[1], 'C', 'given') + E([380, 70], C) + T(550, 174, '← context：整句的摘要');
        return svg(700, 400, b);
      }, md: '**输入和输出长度可以不同**（例如英译法）。**编码器** RNN 把整个输入句读完，把信息压成一个 context $C$（最后的隐藏状态）；**解码器** RNN 每一步都看 $C$（橙色虚线）和**上一步生成的词**（斜线），一个接一个地生成输出 $y^{(1)},y^{(2)},\\dots$。课件的说法：解码器像一个 tagger，在"重新生成"下一个词。' },
      { name: '⑤ BPTT', draw: () => {
        const hx = [90, 220, 350, 480];
        let b = '';
        ['⁽¹⁾', '⁽²⁾', '', '⁽ᵀ⁾'].forEach((sup, i) => {
          const dash = i === 2, x = hx[i];
          b += N(x, 150, dash ? '…' : 'h' + sup, dash ? 'removed' : '') + N(x, 250, dash ? '…' : 'x' + sup, dash ? 'removed' : '') + E([x, 250], [x, 150], { label: 'U', lx: -12, ly: 0 });
          if (!dash) b += N(x, 50, 'L' + sup) + E([x, 150], [x, 50]) + Pth('M' + (x + 14) + ',' + 70 + ' L' + (x + 14) + ',' + 125, true, 'back');
          if (i) {
            b += E([hx[i - 1], 150], [x, 150], { label: 'W' });
            b += Pth('M' + (x - 12) + ',178 Q' + ((x + hx[i - 1]) / 2) + ',215 ' + (hx[i - 1] + 12) + ',178', true, 'back');
            b += '<text class="edge-label r" x="' + ((x + hx[i - 1]) / 2) + '" y="206">×W</text>';
          }
        });
        b += T(540, 54, '每一步的损失') + T(540, 70, '都往回传（红）') + T(540, 154, '往回一步乘一次 W') + T(285, 290, '从 h⁽ᵀ⁾ 回到 h⁽¹⁾：乘 T−1 次 ⇒ Wᵀ⁻¹', 'mid r');
        return svg(680, 305, b);
      }, md: '训练就是把 [c34](#/c34) 的反向传播用在**展开后**的网络上，叫 **BPTT（backpropagation through time）**：每一步的损失 $L^{(t)}$ 的梯度都沿红色箭头往回传，一直传到序列开头。\n\n**为什么会消失 / 爆炸**：按 c34 的规则 1，往回穿过一条边就要乘这条边的倍数，也就是 $W$（再乘 $\\tanh$ 的斜率）。从 $\\mathbf h^{(T)}$ 回到 $\\mathbf h^{(1)}$ 要乘 $T-1$ 次，线性 RNN 里就是 $\\partial\\mathbf h^{(T)}/\\partial\\mathbf h^{(1)}=W^{T-1}$。$W$ 的最大特征值小于 1 时越乘越小（梯度消失），大于 1 时越乘越大（梯度爆炸）。所以普通 RNN 学不到相隔 10 步以上的依赖。' },
      { name: '⑥ LSTM', draw: () => {
        const g = [120, 370], ig = [250, 370], fg = [380, 370], og = [510, 370], m1 = [120, 280], st = [120, 190], m2 = [260, 190], m3 = [120, 95];
        let b = N(g[0], g[1], 'tanh', 'given') + N(ig[0], ig[1], 'σ', 'given') + N(fg[0], fg[1], 'σ', 'given') + N(og[0], og[1], 'σ', 'given') +
          N(m1[0], m1[1], '×') + N(st[0], st[1], '+', 'hl') + N(m2[0], m2[1], '×') + N(m3[0], m3[1], '×');
        b += E(g, m1) + E(ig, m1) + E(m1, st) + E(m2, st) + E(fg, m2) + E(st, m3) +
          Pth('M' + (st[0] + 10) + ',' + (st[1] - 20) + ' C' + (st[0] + 30) + ',120 ' + (m2[0] - 10) + ',120 ' + m2[0] + ',' + (m2[1] - 25), true, 'path') +
          Pth('M' + og[0] + ',' + (og[1] - 22) + ' C' + og[0] + ',200 330,95 ' + (m3[0] + 25) + ',' + m3[1]) +
          '<line class="edge" x1="' + m3[0] + '" y1="' + (m3[1] - 22) + '" x2="' + m3[0] + '" y2="28" marker-end="url(#' + id + 'k)"/>';
        b += T(135, 26, '输出 h⁽ᵗ⁾') + T(190, 116, '复制自环（下一步再用）', 'r') + T(95, 194, '状态', 'end') +
          T(120, 412, '新内容', 'mid') + T(250, 412, '输入门', 'mid') + T(380, 412, '遗忘门', 'mid') + T(510, 412, '输出门', 'mid') +
          T(555, 280, '灰色 4 个单元') + T(555, 296, '都看 x⁽ᵗ⁾ 和 h⁽ᵗ⁻¹⁾') + T(555, 322, 'σ 输出 0～1') + T(555, 338, '= 门开多大');
        return svg(700, 425, b);
      }, md: '灰色的 4 个单元都以 $\\mathbf x^{(t)}$ 和 $\\mathbf h^{(t-1)}$ 为输入：一个用 tanh 产生**新内容**，三个用 sigmoid 当**门**，输出 0 到 1 之间的数，像阀门一样决定放多少过去。\n\n- **输入门 × 新内容**：加进状态。\n- **遗忘门 × 旧状态**：也加进状态。这就是红色的"复制自环"：旧状态不乘 $W$、不过 tanh，只乘一个接近 1 的门。\n- **输出门 × 状态**：得到这一步的输出 $\\mathbf h^{(t)}$。\n\n所以 新状态 = 遗忘门 ⊙ 旧状态 + 输入门 ⊙ 新内容。梯度沿状态这条路往回传时，每步只乘遗忘门（接近 1），不会像 ⑤ 那样每步乘 $W$ 而迅速变小，能保持 100+ 步（普通 RNN 约 5–10 步）。\n\n> 考试写：LSTM adds a self-loop on the state that copies the previous state, scaled by a sigmoid forget gate, so the gradient along this path is not repeatedly multiplied by $W$ and does not vanish.' },
    ];
    let cur = 0;
    const buttons = tabs.map((t, i) => btn(t.name, () => { cur = i; draw(); }));
    ui.tools.append(...buttons);
    const fig = node('div', 'rnn-fig');
    ui.body.appendChild(fig);
    function draw() {
      buttons.forEach((b, i) => { b.className = i === cur ? 'btn primary' : 'btn'; });
      fig.innerHTML = tabs[cur].draw();
      ui.out.innerHTML = md(tabs[cur].md);
    }
    draw();
  });
})(window);
