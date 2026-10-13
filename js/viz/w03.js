/* W3–W4 visualisations (L05–L08): regularisation, generalisation, VC and SVM. */
(function (root) {
  'use strict';
  const SML = root.SML;
  const P = () => SML.plot;
  const f3 = (v) => Number.isFinite(v) ? String(+v.toFixed(3)) : '—';
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
    h.append(node('span', 'title', title), tools);
    s.append(h, body, out); el.appendChild(s);
    return { tools: tools, body: body, out: out };
  }
  function row(parent) { const r = node('div', 'row'); parent.appendChild(r); return r; }
  function readout(pairs) {
    const { inline } = SML.md;
    return '<div class="readout">' + pairs.map((p) =>
      '<div><span>' + inline(p[0]) + '</span><b>' + inline(String(p[1])) + '</b></div>'
    ).join('') + '</div>';
  }
  const md = (s) => SML.md.md(s);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
  const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  const grid = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => a + (b - a) * i / n);
  function normal(rng) {
    const u = Math.max(rng(), 1e-12);
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng());
  }
  function select(parent, entries, draw) {
    const s = node('select');
    entries.forEach(([value, text]) => {
      const o = node('option'); o.value = value; o.textContent = text; s.appendChild(o);
    });
    parent.appendChild(s); s.addEventListener('change', draw); return s;
  }
  function slider(parent, label, o, draw) {
    return P().slider(parent, SML.md.inline(label), o, draw);
  }
  function box(parent) { const b = node('div'); parent.appendChild(b); return b; }
  function legend(parent, entries) {
    const l = node('div', 'legend');
    entries.forEach(([text, color]) => {
      const s = node('span'); s.style.setProperty('--c', color); s.textContent = text; l.appendChild(s);
    });
    parent.appendChild(l);
  }
  function plane(parent, radius, labels) {
    // Equal pixel scales on both axes: circles and geometric margins remain faithful.
    return P().frame(parent, {
      w: 420, h: 420, x: [-radius, radius], y: [-radius, radius],
      margin: { l: 38, r: 14, t: 14, b: 38 }, maxWidth: 440,
      xlabel: (labels && labels[0]) || 'x₁', ylabel: (labels && labels[1]) || 'x₂'
    });
  }
  function levelLine(p, w, b, level, cls, radius) {
    const norm = Math.hypot(w[0], w[1]);
    if (norm < 1e-10) return;
    const q = (level - b) / norm;
    const u = [w[0] / norm, w[1] / norm], v = [-u[1], u[0]];
    const L = 4 * radius + Math.abs(q);
    p.path([
      [q * u[0] - L * v[0], q * u[1] - L * v[1]],
      [q * u[0] + L * v[0], q * u[1] + L * v[1]]
    ], cls);
  }
  function golden(f, a, b) {
    const r = (Math.sqrt(5) - 1) / 2;
    let c = b - r * (b - a), d = a + r * (b - a), fc = f(c), fd = f(d);
    for (let i = 0; i < 65; i++) {
      if (fc < fd) { b = d; d = c; fd = fc; c = b - r * (b - a); fc = f(c); }
      else { a = c; c = d; fc = fd; d = a + r * (b - a); fd = f(d); }
    }
    return (a + b) / 2;
  }

  /* Ridge penalises every feature; do not use lsq's unpenalised-first-column convention. */
  SML.viz.register('reg-path', function (el) {
    const ui = shell(el, 'Ridge vs Lasso：系数路径');
    const method = select(ui.tools, [['ridge', 'Ridge'], ['lasso', 'Lasso']], draw);
    const logL = slider(row(ui.body), '$\\log_{10}\\lambda$', {
      min: -2, max: 2, step: 0.01, value: 0
    }, draw);
    const picture = box(ui.body);
    const colors = ['#3b78c4', '#c9463d', '#2f8a57', '#b77716', '#8756b3'];
    legend(ui.body, colors.map((c, j) => ['w' + (j + 1), c]));
    const rng = SML.quiz.seedRng(30519), truth = [3, -2, 0, 0, 1.5];
    const X = Array.from({ length: 30 }, () => truth.map(() => normal(rng)));
    for (let j = 0; j < 5; j++) {
      const m = mean(X.map((r) => r[j]));
      const sd = Math.sqrt(mean(X.map((r) => (r[j] - m) ** 2))) || 1;
      X.forEach((r) => { r[j] = (r[j] - m) / sd; });
    }
    const y = X.map((r) => dot(r, truth) + normal(rng));
    const G = truth.map((_, j) => truth.map((__, k) => X.reduce((s, r) => s + r[j] * r[k], 0)));
    const h = truth.map((_, j) => X.reduce((s, r, i) => s + r[j] * y[i], 0));
    function fit(lam, kind) {
      if (kind === 'ridge') {
        return SML.vizMath.solve(G.map((r, j) => r.map((v, k) => v + (j === k ? lam : 0))), h) ||
          truth.map(() => 0);
      }
      const w = truth.map(() => 0);
      for (let it = 0; it < 3000; it++) {
        let change = 0;
        for (let j = 0; j < 5; j++) {
          let rho = h[j];
          for (let k = 0; k < 5; k++) if (k !== j) rho -= G[j][k] * w[k];
          const next = Math.sign(rho) * Math.max(0, Math.abs(rho) - lam) / G[j][j];
          change = Math.max(change, Math.abs(next - w[j])); w[j] = next;
        }
        if (change < 1e-10) break;
      }
      return w;
    }
    const logs = grid(-2, 2, 60);
    const paths = {
      ridge: logs.map((v) => fit(10 ** v, 'ridge')),
      lasso: logs.map((v) => fit(10 ** v, 'lasso'))
    };
    const all = paths.ridge.concat(paths.lasso).reduce((a, w) => a.concat(w), []);
    const limits = [Math.min(-0.3, ...all) - 0.25, Math.max(0.3, ...all) + 0.25];
    function draw() {
      picture.innerHTML = '';
      const p = P().frame(picture, {
        w: 520, h: 280, x: [-2, 2], y: limits, xlabel: 'log₁₀ λ', ylabel: 'wⱼ'
      });
      const kind = method.value, current = fit(10 ** +logL.value, kind);
      for (let j = 0; j < 5; j++) {
        p.path(logs.map((v, i) => [v, paths[kind][i][j]]), 'curve').style.stroke = colors[j];
        p.dot(+logL.value, current[j], 4, 'pt').style.fill = colors[j];
      }
      p.line(+logL.value, limits[0], +logL.value, limits[1], 'ref');
      ui.out.innerHTML = readout([
        ['$\\lambda$', f3(10 ** +logL.value)],
        ...current.map((v, j) => ['$w_' + (j + 1) + '$', f3(v)]),
        ['精确为 0 的系数', current.filter((v) => v === 0).length]
      ]) + md('Lasso 会把部分权重压到**精确的 0**，Ridge 通常只收缩（L05 p14–p18）。本图 $n=30$，特征均值 0、方差 1，真实权重 $[3,-2,0,0,1.5]$，噪声 SD 为 1。') +
        md('统一使用半 RSS：Ridge 为 $\\frac12\\|\\by-\\bX\\bw\\|^2+\\frac\\lambda2\\|\\bw\\|_2^2$；Lasso 为 $\\frac12\\|\\by-\\bX\\bw\\|^2+\\lambda\\|\\bw\\|_1$（其 $\\lambda$ 是课件全 RSS 写法的一半）。');
    }
    draw();
  });

  SML.viz.register('l1-l2-geometry', function (el) {
    const ui = shell(el, 'L₁ / L₂ geometry：等高线与约束');
    const kind = select(ui.tools, [['l1', 'L₁ diamond'], ['l2', 'L₂ circle']], draw);
    const controls = row(ui.body);
    const h1 = slider(controls, '$\\hat w_1$', { min: -3, max: 3, step: 0.1, value: 2 }, draw);
    const h2 = slider(controls, '$\\hat w_2$', { min: -3, max: 3, step: 0.1, value: 1 }, draw);
    const t = slider(row(ui.body), '约束半径 $t$', { min: 0, max: 4, step: 0.05, value: 1.5 }, draw);
    const picture = box(ui.body);
    function draw() {
      const hat = [+h1.value, +h2.value], T = +t.value;
      const q = (w) => {
        const a = w[0] - hat[0], b = w[1] - hat[1];
        return a * a + 0.8 * a * b + 2 * b * b;
      };
      const l1 = kind.value === 'l1';
      const inside = (l1 ? Math.abs(hat[0]) + Math.abs(hat[1]) : Math.hypot(...hat)) <= T;
      const vertices = [[T, 0], [0, T], [-T, 0], [0, -T]];
      let optimum = hat.slice();
      if (!inside) {
        if (T === 0) optimum = [0, 0];
        else if (l1) {
          let best = Infinity;
          vertices.forEach((v, i) => {
            const next = vertices[(i + 1) % 4];
            const at = (s) => v.map((x, j) => x + s * (next[j] - x));
            const s = golden((a) => q(at(a)), 0, 1);
            [0, s, 1].forEach((a) => {
              const w = at(a), loss = q(w);
              if (loss < best) { best = loss; optimum = w; }
            });
          });
        } else {
          const at = (a) => [T * Math.cos(a), T * Math.sin(a)];
          const angles = grid(0, 2 * Math.PI, 720);
          let best = 0;
          angles.forEach((a, i) => { if (q(at(a)) < q(at(angles[best]))) best = i; });
          const da = 2 * Math.PI / 720;
          optimum = at(golden((a) => q(at(a)), angles[best] - da, angles[best] + da));
        }
      }
      optimum = optimum.map((v) => Math.abs(v) < 1e-9 ? 0 : v);
      picture.innerHTML = '';
      const p = plane(picture, 4.5, ['w₁', 'w₂']);
      // q = (a + .4 b)^2 + 1.84 b^2.
      const levels = [0.2, 0.6, 1.5, 3, 6, 12, 24];
      if (q(optimum) > 1e-8) levels.push(q(optimum));
      levels.forEach((c) => {
        p.path(grid(0, 2 * Math.PI, 180).map((a) => {
          const b = Math.sqrt(c / 1.84) * Math.sin(a);
          return [hat[0] + Math.sqrt(c) * Math.cos(a) - 0.4 * b, hat[1] + b];
        }), 'curve thin prior', true);
      });
      p.path(l1 ? vertices : grid(0, 2 * Math.PI, 180).map((a) =>
        [T * Math.cos(a), T * Math.sin(a)]), 'ellipse', true);
      p.dot(...hat, 5, 'pt big'); p.text(hat[0], hat[1] + 0.3, 'ŵ', 'note');
      p.dot(...optimum, 6, 'pt ok');
      p.text(optimum[0], optimum[1] - 0.35, 'w*', 'note g');
      ui.out.innerHTML = readout([
        ['约束最优 $\\bw^*$', '(' + optimum.map(f3).join(', ') + ')'],
        ['RSS', f3(q(optimum))],
        ['在坐标轴上（sparse）', optimum.some((v) => v === 0) ? '是' : '否'],
        ['无约束最优点可行', inside ? '是' : '否']
      ]) + md('固定 $\\mathrm{RSS}=(\\bw-\\hat\\bw)\'\\begin{bmatrix}1&0.4\\\\0.4&2\\end{bmatrix}(\\bw-\\hat\\bw)$；约束为 $\\|\\bw\\|_' + (l1 ? '1' : '2') + '\\le t$。Diamond 的角落容易产生零系数，但并非每次都 sparse（L05 p17）。');
    }
    draw();
  });

  SML.viz.register('bias-variance-sim', function (el) {
    const ui = shell(el, 'Bias–variance：重复抽样的 20 条拟合');
    let seed = 5037, sets = [];
    const degree = slider(row(ui.body), '多项式次数 $k$', { min: 0, max: 9, step: 1, value: 3 }, draw);
    ui.tools.appendChild(btn('resample', () => { seed++; generate(); draw(); }));
    const picture = box(ui.body);
    legend(ui.body, [
      ['20 次拟合', 'var(--accent)'], ['平均拟合', 'var(--good)'], ['真实 sin(x)', 'var(--muted)']
    ]);
    const xs = grid(0, 2 * Math.PI, 200);
    const features = (x, k) => Array.from({ length: k + 1 }, (_, j) => (x / Math.PI - 1) ** j);
    function generate() {
      const rng = SML.quiz.seedRng(seed);
      sets = Array.from({ length: 20 }, () => Array.from({ length: 15 }, () => {
        const x = rng() * 2 * Math.PI;
        return [x, Math.sin(x) + 0.3 * normal(rng)];
      }));
    }
    function draw() {
      const k = +degree.value;
      const fits = sets.map((D) => {
        // No ridge penalty: these are ordinary least-squares polynomial fits.
        const w = SML.vizMath.lsq(D.map((d) => features(d[0], k)), D.map((d) => d[1]), 0);
        return w ? xs.map((x) => dot(features(x, k), w)) : null;
      });
      if (fits.some((f) => !f)) {
        picture.innerHTML = '';
        ui.out.innerHTML = md('**数值求解失败**（某个训练集上 $\\mathbf X\'\\mathbf X$ 接近奇异），本次统计不可用。请点"resample"换一批数据或降低次数。');
        return;
      }
      const avg = xs.map((_, i) => mean(fits.map((f) => f[i])));
      const bias2 = mean(xs.map((x, i) => (avg[i] - Math.sin(x)) ** 2));
      const variance = mean(xs.map((_, i) => mean(fits.map((f) => (f[i] - avg[i]) ** 2))));
      picture.innerHTML = '';
      const p = P().frame(picture, {
        w: 520, h: 280, x: [0, 2 * Math.PI], y: [-3, 3], xlabel: 'x', ylabel: 'f̂(x)'
      });
      fits.forEach((f) => { p.path(xs.map((x, i) => [x, f[i]]), 'curve thin').style.opacity = '0.18'; });
      p.path(xs.map((x, i) => [x, avg[i]]), 'curve post');
      p.fn(Math.sin, 'curve prior');
      ui.out.innerHTML = readout([
        ['bias²（grid 平均）', f3(bias2)], ['variance（除以 R）', f3(variance)],
        ['noise $\\sigma^2$', '0.09'], ['三项之和', f3(bias2 + variance + 0.09)],
        ['seed', seed]
      ]) + md('每次抽 $n=15$ 个 uniform 输入，噪声 SD 为 0.3；复杂模型通常降低 bias，却提高 variance（L05 p29–p40）。这是 $R=20$ 的 Monte Carlo 估计，不保证单次实验单调。') +
        md('特征先缩放到 $[-1,1]$；图仅显示 $y\\in[-3,3]$，高次拟合可能超出画框，但所有 grid 预测仍参与统计。');
    }
    generate(); draw();
  });

  SML.viz.register('gen-bound', function (el) {
    const ui = shell(el, '有限模型类：generalisation bound');
    const delta = select(ui.tools, [['0.1', 'δ = 0.1'], ['0.05', 'δ = 0.05'], ['0.01', 'δ = 0.01']], draw);
    const controls = row(ui.body);
    const logN = slider(controls, '样本量 $n$', {
      min: 1, max: 4, step: 0.01, value: 2, fmt: (v) => String(Math.round(10 ** v))
    }, draw);
    const label = node('label', null, SML.md.inline('$|\\mathcal F|$'));
    const size = node('input'); size.type = 'number'; size.min = '1'; size.max = '1000000000000';
    size.step = '1'; size.value = '8'; label.appendChild(size); controls.appendChild(label);
    size.addEventListener('input', draw);
    const risk = slider(row(ui.body), 'empirical risk $\\hat R$', {
      min: 0, max: 0.5, step: 0.005, value: 0.1
    }, draw);
    const picture = box(ui.body);
    function draw() {
      const raw = Number(size.value);
      const F = Number.isFinite(raw) ? clamp(Math.floor(raw), 1, 1e12) : 1;
      const n = Math.round(10 ** +logN.value), d = +delta.value;
      const eps = (N) => Math.sqrt((Math.log(F) + Math.log(1 / d)) / (2 * N));
      const E = eps(n), upper = +risk.value + E;
      picture.innerHTML = '';
      const p = P().frame(picture, {
        w: 520, h: 280, x: [1, 4], y: [0, Math.max(0.1, eps(10) * 1.1)],
        xticks: [1, 2, 3, 4], xfmt: (v) => String(10 ** v),
        xlabel: 'n（log scale）', ylabel: 'ε'
      });
      p.fn((v) => eps(10 ** v), 'curve post');
      p.line(Math.log10(n), 0, Math.log10(n), E, 'ref');
      p.dot(Math.log10(n), E, 5, 'pt big');
      ui.out.innerHTML = readout([
        ['$n$', n], ['$|\\mathcal F|$（有效值）', F], ['$\\epsilon$', f3(E)]
      ]) + md('以概率 $\\ge1-\\delta=' + f3(1 - d) + '$，$R\\le\\hat R+\\epsilon=' +
        f3(+risk.value) + '+' + f3(E) + '=' + f3(upper) + '$（L06 p17）。') +
        md('要求样本 i.i.d.、模型类预先固定且有限，**loss 必须在 $[0,1]$**；$\\epsilon=\\sqrt{(\\ln|\\mathcal F|+\\ln(1/\\delta))/(2n)}$。' +
          (upper > 1 ? '当前上界大于 1，保证较宽松。' : '') +
          (size.value === '' || raw !== F ? '空值或非法类大小按有效值处理。' : ''));
    }
    draw();
  });

  SML.viz.register('growth-fn', function (el) {
    const ui = shell(el, 'Growth function：直线上能实现多少 dichotomies？');
    const kind = select(ui.tools, [
      ['threshold', 'threshold (x>=a → +1)'],
      ['stump', 'decision stump (either sign)'],
      ['interval', 'interval [a,b] → +1']
    ], draw);
    const count = slider(row(ui.body), '点数 $m$', { min: 1, max: 8, step: 1, value: 3 }, draw);
    const picture = box(ui.body), chips = node('div', 'patterns'); ui.body.appendChild(chips);
    function choose(n, k) {
      if (k > n) return 0;
      let v = 1;
      for (let i = 1; i <= k; i++) v = v * (n - i + 1) / i;
      return Math.round(v);
    }
    function draw() {
      const m = +count.value, xs = grid(1, m, Math.max(1, m - 1)).slice(0, m);
      // Half-integer thresholds cover every gap, including both exterior gaps.
      const params = Array.from({ length: m + 1 }, (_, i) => i + 0.5);
      const patterns = new Set();
      const add = (f) => patterns.add(xs.map((x) => f(x) ? '+' : '-').join(''));
      if (kind.value === 'interval') {
        params.forEach((a) => params.forEach((b) => {
          if (a <= b) add((x) => a <= x && x <= b);
        }));
      } else {
        params.forEach((a) => {
          add((x) => x >= a);
          if (kind.value === 'stump') add((x) => x < a);
        });
      }
      const d = kind.value === 'threshold' ? 1 : 2;
      let bound = 0;
      for (let i = 0; i <= d; i++) bound += choose(m, i);
      picture.innerHTML = '';
      const p = P().frame(picture, {
        w: 520, h: 120, x: [0, m + 1], y: [-1, 1],
        xlabel: 'x（从左到右）', xticks: xs, yticks: [0], grid: true
      });
      xs.forEach((x) => { p.dot(x, 0, 5, 'pt'); p.text(x, 0.4, 'x' + x, 'note'); });
      chips.innerHTML = '';
      Array.from(patterns).sort().forEach((s) => {
        const c = node('span', 'pat have'); c.textContent = s; chips.appendChild(c);
      });
      ui.out.innerHTML = readout([
        ['$S(m)$', patterns.size], ['$2^m$', 2 ** m],
        ['shattered', patterns.size === 2 ** m ? '是' : '否'],
        ['$\\VC$', d], ['$\\sum_{i=0}^d\\binom mi$', bound]
      ]) + md('对所有参数间隙 brute force，去掉重复标签；这些互异直线点的计数就是该类的 growth function。单向 threshold 的 $S(m)=m+1$，双向 stump 的 $S(m)=2m$（L07 p19），interval 的 $S(m)=1+m(m+1)/2$。') +
        md('Sauer–Shelah 给出 $S(m)\\le\\sum_{i=0}^d\\binom mi$（L07 p30），它是上界，不一定取等号。');
    }
    draw();
  });

  SML.viz.register('margin-svm', function (el) {
    const ui = shell(el, 'Hard margin：拖动分界线与 max-margin');
    const D = [
      [-2.5, -1.8, -1], [-2, 0.2, -1], [-0.7, -1.6, -1], [-2.6, -0.4, -1],
      [0.8, 1.4, 1], [1.8, 0.4, 1], [2.4, 2.2, 1], [0.7, 2.7, 1]
    ];
    const controls = row(ui.body);
    const angle = slider(controls, '法向量角度 θ', {
      min: 0, max: 180, step: 0.5, value: 45, fmt: (v) => v + '°'
    }, draw);
    const offset = slider(controls, 'offset $b$', {
      min: -4, max: 4, step: 0.0001, value: 0, fmt: f3
    }, draw);
    ui.tools.appendChild(btn('max-margin', maximise, 'btn primary'));
    const picture = box(ui.body);
    legend(ui.body, [['+1', '#c9463d'], ['−1', '#3b78c4'], ['黑圈：当前最小 margin 点', 'var(--ink)']]);
    function project(w) { return D.map((d) => w[0] * d[0] + w[1] * d[1]); }
    function maximise() {
      let best = -Infinity, bestA = 0, bestB = 0;
      for (let a = 0; a <= 180; a += 0.5) {
        const w = [Math.cos(a * Math.PI / 180), Math.sin(a * Math.PI / 180)];
        const z = project(w);
        const pos = Math.min(...z.filter((_, i) => D[i][2] === 1));
        const neg = Math.max(...z.filter((_, i) => D[i][2] === -1));
        // For this angle, balancing the two class clearances is the exact best b.
        const b = clamp(-(pos + neg) / 2, -4, 4);
        const margin = Math.min(pos + b, -neg - b);
        if (margin > best) { best = margin; bestA = a; bestB = b; }
      }
      angle.set(bestA); offset.set(bestB); draw();
    }
    function draw() {
      const a = +angle.value * Math.PI / 180, w = [Math.cos(a), Math.sin(a)], b = +offset.value;
      const z = project(w), distances = z.map((v, i) => D[i][2] * (v + b));
      const margin = Math.min(...distances), tol = 2e-4;
      const sv = distances.map((v, i) => Math.abs(v - margin) <= tol ? i + 1 : 0).filter(Boolean);
      const pos = Math.min(...z.filter((_, i) => D[i][2] === 1));
      const neg = Math.max(...z.filter((_, i) => D[i][2] === -1));
      picture.innerHTML = '';
      const p = plane(picture, 3.5);
      levelLine(p, w, b, 0, 'boundary', 3.5);
      levelLine(p, w, b, pos + b, 'ref r', 3.5);
      levelLine(p, w, b, neg + b, 'ref a', 3.5);
      D.forEach((d, i) => {
        p.dot(d[0], d[1], 6, 'pt ' + (d[2] === 1 ? 'pos' : 'neg') + (sv.includes(i + 1) ? ' big' : ''));
        p.text(d[0] + 0.14, d[1] + 0.24, String(i + 1), 'note', 'start');
      });
      ui.out.innerHTML = readout([
        ['$\\min_i y_i(\\bw\'\\bx_i+b)/\\|\\bw\\|$', f3(margin)],
        ['support vector indices', sv.join(', ')],
        ['错分点（负 margin）', distances.filter((v) => v < 0).length]
      ]) + md('这里 $\\|\\bw\\|=1$，角度控制的是**法向量**；虚线分别穿过两类朝边界方向最近的点。负 margin 表示有错分；黑圈标出当前全局最小 margin 点（L08 p13–p21）。') +
        md('max-margin 以 $0.5^\\circ$ 搜索角度，并为每个角度精确平衡两侧距离；最优位置两侧接触点才是 hard-margin SVM 的 support vectors。');
    }
    draw();
  });

  SML.viz.register('soft-margin', function (el) {
    const ui = shell(el, 'Soft margin：C、support vectors 与 slack');
    const logC = slider(row(ui.body), '$\\log_{10}C$', {
      min: -2, max: 2, step: 0.05, value: 0
    }, draw);
    const picture = box(ui.body);
    legend(ui.body, [['+1', '#c9463d'], ['−1', '#3b78c4'], ['黑圈：SV', 'var(--ink)']]);
    const rng = SML.quiz.seedRng(80317), D = [];
    for (const y of [-1, 1]) {
      for (let i = 0; i < 6; i++) {
        D.push([y * (1.25 + 0.9 * rng()), -1.9 + 3.8 * rng(), y]);
      }
    }
    // Wrong-side points inside the opposing class's convex hull ensure nonseparability.
    for (const y of [-1, 1]) {
      const opposing = D.filter((d) => d[2] === -y).slice(0, 3);
      D.push([mean(opposing.map((d) => d[0])), mean(opposing.map((d) => d[1])), y]);
    }
    const cache = new Map();
    function fit(C) {
      if (cache.has(C)) return cache.get(C);
      let v = [0, 0, 0], best = v.slice(), bestLoss = Infinity;
      const N = 50000, sums = [0, 0, 0];
      let count = 0;
      const scale = 1 + C * D.reduce((s, d) => s + Math.hypot(d[0], d[1], 1), 0);
      function objective(a) {
        return 0.5 * (a[0] ** 2 + a[1] ** 2) +
          C * D.reduce((s, d) => s + Math.max(0, 1 - d[2] * (a[0] * d[0] + a[1] * d[1] + a[2])), 0);
      }
      function consider(a) {
        const loss = objective(a);
        if (Number.isFinite(loss) && loss < bestLoss) { bestLoss = loss; best = a.slice(); }
      }
      // Full-batch subgradient, diminishing step; keep best iterate and tail averages.
      for (let it = 0; it < N; it++) {
        const g = [v[0], v[1], 0];
        D.forEach((d) => {
          if (d[2] * (v[0] * d[0] + v[1] * d[1] + v[2]) < 1) {
            g[0] -= C * d[2] * d[0]; g[1] -= C * d[2] * d[1]; g[2] -= C * d[2];
          }
        });
        const eta = 0.8 / (scale * (1 + it / 100) ** 0.7);
        v = v.map((a, j) => a - eta * g[j]);
        if (it % 20 === 0) consider(v);
        if (it >= N / 2) {
          count++; v.forEach((a, j) => { sums[j] += a; });
          if (it % 100 === 0) consider(sums.map((a) => a / count));
        }
      }
      consider(v); consider(sums.map((a) => a / count));
      cache.set(C, best); return best;
    }
    function draw() {
      const C = 10 ** +logC.value, v = fit(C), w = v.slice(0, 2), b = v[2];
      const norm = Math.hypot(...w);
      const signed = D.map((d) => d[2] * (w[0] * d[0] + w[1] * d[1] + b));
      const slacks = signed.map((s) => Math.max(0, 1 - s));
      const sv = signed.map((s, i) => s <= 1 + 1e-3 ? i + 1 : 0).filter(Boolean);
      picture.innerHTML = '';
      const p = plane(picture, 3.2);
      levelLine(p, w, b, 0, 'boundary', 3.2);
      levelLine(p, w, b, 1, 'ref r', 3.2);
      levelLine(p, w, b, -1, 'ref a', 3.2);
      D.forEach((d, i) => {
        p.dot(d[0], d[1], 5.5, 'pt ' + (d[2] === 1 ? 'pos' : 'neg') + (sv.includes(i + 1) ? ' big' : ''));
        p.text(d[0] + (d[2] === 1 ? 0.13 : -0.13), d[1] + 0.2,
          (i + 1) + ':ξ=' + f3(slacks[i]), 'note', d[2] === 1 ? 'start' : 'end');
      });
      ui.out.innerHTML = readout([
        ['$C$', f3(C)], ['SV 数量', sv.length], ['$\\sum_i\\xi_i$', f3(slacks.reduce((s, x) => s + x, 0))],
        ['margin width $2/\\|\\bw\\|$', norm > 1e-10 ? f3(2 / norm) : '∞'],
        ['objective', f3(0.5 * norm ** 2 + C * slacks.reduce((s, x) => s + x, 0))]
      ]) + md('Small C：宽 margin、允许更多 violations；large C 更接近 hard-margin 的偏好，但这组非可分数据无法达到真正 hard margin（L08 p30–p34）。') +
        md('以 decaying-step subgradient 近似最小化 $\\frac12\\|\\bw\\|^2+C\\sum_i\\max(0,1-y_if_i)$，不惩罚 $b$；$\\xi_i=\\max(0,1-y_if_i)$，按 $y_if_i\\le1+10^{-3}$ 标出 SV。');
    }
    draw();
  });

  SML.viz.register('hinge-loss', function (el) {
    const ui = shell(el, 'Margin score：hinge、0–1 与 logistic loss');
    const score = slider(row(ui.body), '$s=yf(x)$', {
      min: -3, max: 3, step: 0.01, value: 0
    }, draw);
    const picture = box(ui.body);
    legend(ui.body, [
      ['hinge', 'var(--accent)'], ['0–1', 'var(--bad)'], ['logistic (base 2)', 'var(--warn)']
    ]);
    const hinge = (s) => Math.max(0, 1 - s);
    const logistic = (s) => Math.log1p(Math.exp(-s)) / Math.LN2;
    // At s=0 use the explicit "nonpositive signed score is an error" convention.
    const zeroOne = (s) => s <= 0 ? 1 : 0;
    function draw() {
      picture.innerHTML = '';
      const p = P().frame(picture, {
        w: 520, h: 250, x: [-3, 3], y: [0, 4.6], xlabel: 's = y f(x)', ylabel: 'loss'
      });
      p.fn(hinge, 'curve');
      p.fn(logistic, 'curve lik');
      p.path([[-3, 1], [0, 1]], 'curve bad');
      p.path([[0, 0], [3, 0]], 'curve bad');
      p.dot(0, 1, 3, 'pt hit');
      const open = p.dot(0, 0, 3, 'pt');
      open.style.fill = 'var(--paper)'; open.style.stroke = 'var(--bad)';
      p.line(1, 0, 1, 4.6, 'ref g');
      const s = +score.value;
      p.line(s, 0, s, 4.6, 'ref');
      p.dot(s, hinge(s), 4, 'pt');
      p.dot(s, zeroOne(s), 4, 'pt hit');
      p.dot(s, logistic(s), 4, 'pt').style.fill = 'var(--warn)';
      ui.out.innerHTML = readout([
        ['$s$', f3(s)], ['hinge $\\max(0,1-s)$', f3(hinge(s))],
        ['0–1 $\\mathbf1\\{s\\le0\\}$', zeroOne(s)],
        ['logistic $\\log_2(1+e^{-s})$', f3(logistic(s))]
      ]) + md('Hinge 不仅惩罚错分，也惩罚 $0<s<1$ 的 margin 不足（L08 p31–p32）；logistic 平滑且不会在有限 score 处变成 0。这里明确约定 $s=0$ 的 0–1 loss 为 1。');
    }
    draw();
  });
})(window);
