/* W9–W11: seeded bandits, Bayesian linear regression, moralisation and exact tree sum-product. */
(function (root) {
  'use strict';
  const SML = root.SML;
  const P = () => SML.plot;
  const md = (s) => SML.md.md(s);
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
    const tools = node('div', 'tools'), body = node('div', 'solver-body');
    const out = node('div', 'solver-out');
    h.append(node('span', 'title', title), tools);
    s.append(h, body, out); el.appendChild(s);
    return { tools, body, out };
  }
  function row(parent) {
    const r = node('div', 'row'); parent.appendChild(r); return r;
  }
  function readout(pairs) {
    return '<div class="readout">' + pairs.map((p) =>
      '<div><span>' + SML.md.inline(p[0]) + '</span><b>' +
      SML.md.inline(String(p[1])) + '</b></div>').join('') + '</div>';
  }
  function select(parent, label, choices, value, change) {
    const s = node('select');
    choices.forEach(([v, text]) => {
      const o = node('option', null, text); o.value = v; s.appendChild(o);
    });
    s.value = value;
    const l = node('label'); l.append(node('span', null, label), s);
    parent.appendChild(l); s.addEventListener('change', change); return s;
  }
  function table(head, rows) {
    return '<div class="table-wrap"><table class="compact mono"><thead><tr>' +
      head.map((s) => '<th>' + SML.md.inline(s) + '</th>').join('') +
      '</tr></thead><tbody>' + rows.map((r) => '<tr>' +
        r.map((s) => '<td>' + SML.md.inline(String(s)) + '</td>').join('') +
        '</tr>').join('') + '</tbody></table></div>';
  }
  function graph(parent) {
    return P().mk('svg', { class: 'graph' }, parent);
  }
  function stepper(parent, get, set, last) {
    const r = row(parent), pos = node('span', 'pos');
    const prev = btn('上一步', () => set(Math.max(0, get() - 1)));
    const next = btn('下一步', () => set(Math.min(last(), get() + 1)), 'btn primary');
    r.append(prev, next, btn('重来', () => set(0)), pos);
    return () => {
      pos.textContent = '第 ' + get() + ' / ' + last() + ' 步';
      prev.disabled = get() === 0; next.disabled = get() === last();
    };
  }
  function normal(rng) {
    return Math.sqrt(-2 * Math.log(Math.max(rng(), 1e-12))) *
      Math.cos(2 * Math.PI * rng());
  }
  const key = (a, b) => [a, b].sort().join('|');

  /* ---------------- L17 ---------------- */
  SML.viz.register('bandit-sim', function (el, opts) {
    opts = opts || {};
    const ui = shell(el, 'Bandits：ε-greedy 与 UCB');
    let seed = Number.isFinite(+opts.seed) ? (+opts.seed >>> 0) || 1 : 17;
    const controls = row(ui.body);
    const means = [0.2, 0.5, 0.55, 0.7].map((v, i) =>
      P().slider(controls, 'μ' + (i + 1),
        { min: 0, max: 1, step: 0.01, value: v }, draw));
    const r = row(ui.body);
    const eps = P().slider(r, 'ε', { min: 0, max: 0.5, step: 0.01, value: 0.1 }, draw);
    const horizon = P().slider(r, 'T', { min: 50, max: 2000, step: 50, value: 500 }, draw);
    const label = node('label'), greedy = node('input');
    greedy.type = 'checkbox'; label.append(greedy, node('span', null, '同时显示 greedy'));
    greedy.addEventListener('change', draw);
    ui.tools.append(label, btn('new seed', () => {
      seed = (seed + 1) >>> 0 || 1; draw();
    }));
    const box = node('div'); ui.body.appendChild(box);

    function draw() {
      const mu = means.map((s) => Math.round(+s.value * 100));
      const best = Math.max.apply(null, mu), T = +horizon.value;
      // Common random numbers indexed by calendar round and arm.
      // Always generate 2000 rounds: changing T preserves every prefix.
      const rewards = [], rng = SML.quiz.seedRng(seed);
      for (let t = 0; t < 2000; t++)
        rewards.push(mu.map((m) => rng() < m / 100 ? 1 : 0));
      const methods = [
        { name: 'ε-greedy', e: +eps.value, curve: 'curve', bar: 'bar', colour: 'var(--accent)' },
        { name: 'UCB', ucb: true, curve: 'curve lik', bar: 'bar alt', colour: 'var(--warn)' }
      ];
      if (greedy.checked) methods.push({
        name: 'greedy', e: 0, curve: 'curve bad', bar: 'bar hot', colour: 'var(--bad)'
      });
      const results = methods.map((m) => {
        // Separate policy RNG from the shared reward stream.
        const policy = SML.quiz.seedRng((seed ^ 0x9e3779b9) >>> 0);
        const counts = [0, 0, 0, 0], sums = [0, 0, 0, 0];
        const pts = [[0, 0]]; let regretUnits = 0;
        for (let t = 1; t <= T; t++) {
          const scores = counts.map((n, i) => n === 0 ? Infinity :
            sums[i] / n + (m.ucb ? Math.sqrt(2 * Math.log(t) / n) : 0));
          let arm;
          if (!m.ucb && policy() < m.e) arm = Math.floor(policy() * 4);
          else {
            const max = Math.max.apply(null, scores);
            const ties = scores.map((q, i) => q === max ? i : -1).filter((i) => i >= 0);
            arm = ties[Math.floor(policy() * ties.length)];
          }
          counts[arm]++; sums[arm] += rewards[t - 1][arm];
          regretUnits += best - mu[arm];
          pts.push([t, regretUnits / 100]);
        }
        return {
          m, counts, pts, regret: regretUnits / 100,
          fraction: counts.reduce((s, n, i) => s + (mu[i] === best ? n : 0), 0) / T
        };
      });
      box.innerHTML = '';
      const ymax = Math.max(1, ...results.map((d) => d.regret)) * 1.08;
      const pl = P().frame(box, {
        w: 520, h: 270, x: [0, T], y: [0, ymax], xlabel: 't', ylabel: '累积 pseudo-regret'
      });
      results.forEach((d) => pl.path(d.pts, d.m.curve));
      box.appendChild(node('div', 'legend', methods.map((m) =>
        '<span style="--c:' + m.colour + '">' + m.name + '</span>').join('')));
      const bars = P().frame(box, {
        w: 520, h: 220, x: [0.5, 4.5],
        y: [0, Math.max(1, ...results.flatMap((d) => d.counts)) * 1.16],
        xticks: [1, 2, 3, 4], xlabel: 'arm', ylabel: 'pull count'
      });
      results.forEach((d, j) => d.counts.forEach((n, i) => {
        const x = i + 1 - 0.36 + j * 0.24;
        bars.rect(x, 0, 0.21, n, d.m.bar);
        bars.text(x + 0.105, n + T * 0.018, String(n), 'note');
      }));
      ui.out.innerHTML = md(
        '共享同一 seeded $R_i(t)$；图为单次轨迹的 $\\sum_{s\\le t}(\\mu^*-\\mu_{i_s})$，不是实际奖励差，也不是多次运行的期望 regret（L17 p6）。' +
        '\n\nUCB 使用 $\\hat\\mu_i+\\sqrt{2\\log(t)/N_i}$，未拉取时 $Q_0=+\\infty$，随机打破平局，故先各拉一次；ε-greedy 同样用 optimistic 初值，但随机探索可能重复拉取（L17 p9–10, p18）。'
      ) + readout([['seed', seed]].concat(results.flatMap((d) => [
        [d.m.name + ' final regret', String(d.regret)],
        [d.m.name + ' best-arm fraction', '$' + d.counts.reduce((s, n, i) =>
          s + (mu[i] === best ? n : 0), 0) + '/' + T + '\\approx' + f3(d.fraction) + '$']
      ])));
    }
    draw();
  });

  /* ---------------- L18 ---------------- */
  SML.viz.register('bayes-linreg', function (el, opts) {
    opts = opts || {};
    const ui = shell(el, 'Bayesian linear regression：点击添加观测');
    const points = [], r = row(ui.body);
    const alpha = P().slider(r, 'α（prior precision）',
      { min: 0.05, max: 10, step: 0.05, value: 1 }, draw);
    const variance = P().slider(r, 'σ²（noise variance）',
      { min: 0.01, max: 2, step: 0.01, value: 0.15 }, draw);
    const seed = Number.isFinite(+opts.seed) ? (+opts.seed >>> 0) || 1 : 18;
    let dataRng = SML.quiz.seedRng(seed);
    ui.tools.append(
      btn('add random point from true line y=0.5+0.8x', () => {
        // No rejection: a point outside the frame is clipped from the picture but still used in the posterior,
        // so the generated data are unbiased draws from the true line.
        const x = 6 * dataRng() - 3;
        points.push([x, 0.5 + 0.8 * x + Math.sqrt(+variance.value) * normal(dataRng)]);
        draw();
      }),
      btn('clear', () => {
        points.length = 0; dataRng = SML.quiz.seedRng(seed); draw();
      })
    );
    const box = node('div'); ui.body.appendChild(box);
    function draw() {
      const a = +alpha.value, v = +variance.value;
      let A = a, B = 0, C = a, b0 = 0, b1 = 0;
      points.forEach(([x, y]) => {
        A += 1 / v; B += x / v; C += x * x / v;
        b0 += y / v; b1 += x * y / v;
      });
      const det = A * C - B * B;
      const S = [[C / det, -B / det], [-B / det, A / det]];
      const m = [S[0][0] * b0 + S[0][1] * b1, S[1][0] * b0 + S[1][1] * b1];
      const mean = (x) => m[0] + m[1] * x;
      const sd = (x) => Math.sqrt(Math.max(0, v + S[0][0] + 2 * x * S[0][1] + x * x * S[1][1]));
      box.innerHTML = '';
      const pl = P().frame(box, {
        w: 520, h: 320, x: [-3, 3], y: [-3, 3], xlabel: 'x', ylabel: 'y'
      });
      const upper = [], lower = [];
      for (let i = 0; i <= 180; i++) {
        const x = -3 + i / 30;
        upper.push([x, mean(x) + 2 * sd(x)]);
        lower.push([x, mean(x) - 2 * sd(x)]);
      }
      pl.path(upper.concat(lower.reverse()), 'area', true);
      const rng = SML.quiz.seedRng(seed ^ 0x51a7);
      const l00 = Math.sqrt(S[0][0]), l10 = S[1][0] / l00;
      const l11 = Math.sqrt(Math.max(0, S[1][1] - l10 * l10));
      for (let i = 0; i < 12; i++) {
        const z0 = normal(rng), z1 = normal(rng);
        const w0 = m[0] + l00 * z0, w1 = m[1] + l10 * z0 + l11 * z1;
        pl.fn((x) => w0 + w1 * x, 'curve thin');
      }
      pl.fn((x) => 0.5 + 0.8 * x, 'curve prior');
      pl.fn(mean, 'curve post');
      points.forEach(([x, y]) => pl.dot(x, y, 4.5, 'pt big'));
      pl.svg.addEventListener('click', (e) => {
        const [x, y] = pl.fromEvent(e);
        if (Number.isFinite(x) && Number.isFinite(y) &&
            x >= -3 && x <= 3 && y >= -3 && y <= 3) {
          points.push([x, y]); draw();
        }
      });
      box.appendChild(node('div', 'legend',
        '<span style="--c:var(--muted)">true line</span>' +
        '<span style="--c:var(--accent)">12 posterior samples / ±2 predictive sd</span>' +
        '<span style="--c:var(--good)">posterior mean</span>'));
      ui.out.innerHTML = md(
        '$\\phi(x)=[1,x]^\\top$，$S^{-1}=\\alpha I+\\Phi^\\top\\Phi/\\sigma^2$，' +
        '$m=S\\Phi^\\top y/\\sigma^2$；这里 $m=\\bw_N,S=\\mathbf V_N,\\alpha=1/\\gamma^2$（L18 p18）。' +
        '\n\n数据附近 band 通常较窄，远离数据时变宽，且 $\\operatorname{Var}(y_*)=\\sigma^2+\\phi^\\top S\\phi$ 保留噪声下限（L18 p24–25）；超出 $[-3,3]^2$ 的曲线和点被裁剪（框外的点不画，但仍参与计算）。'
      ) + readout([
        ['观测数 N', points.length],
        ['$m$（约）', '$[' + m.map(f3).join(',') + ']^\\top$'],
        ['$S$（约）', '$\\begin{bmatrix}' + S[0].map(f3).join('&') +
          '\\\\' + S[1].map(f3).join('&') + '\\end{bmatrix}$']
      ]);
    }
    draw();
  });

  /* ---------------- L20 ---------------- */
  const MORAL = {
    v: {
      nodes: { A: { x: 60, y: 40 }, B: { x: 240, y: 40 }, C: { x: 150, y: 160 } },
      edges: [['A', 'C'], ['B', 'C']]
    },
    alarm: {
      nodes: { E: { x: 70, y: 40 }, B: { x: 250, y: 40 }, R: { x: 70, y: 150 }, A: { x: 250, y: 150 }, L: { x: 160, y: 250 } },
      edges: [['E', 'R'], ['E', 'A'], ['B', 'A'], ['R', 'L'], ['A', 'L']]
    },
    two: {
      nodes: {
        A: { x: 40, y: 40 }, B: { x: 160, y: 40 }, C: { x: 100, y: 140 },
        D: { x: 280, y: 140 }, E: { x: 190, y: 240 }
      },
      edges: [['A', 'C'], ['B', 'C'], ['C', 'E'], ['D', 'E']]
    }
  };
  function maximalCliques(ids, edges) {
    const adjacent = new Set(edges.map((e) => key(e.a, e.b))), cliques = [];
    for (let mask = 1; mask < (1 << ids.length); mask++) {
      const c = ids.filter((id, i) => mask & (1 << i));
      if (c.every((a, i) => c.slice(i + 1).every((b) => adjacent.has(key(a, b)))))
        cliques.push(c);
    }
    return cliques.filter((c) => !cliques.some((d) =>
      d.length > c.length && c.every((id) => d.includes(id))));
  }
  SML.viz.register('moralize', function (el) {
    const ui = shell(el, 'BN → MRF：moralize');
    let states = [], stage = 0, preset, ids, parents, cliques;
    const sel = select(ui.tools, '预设', [
      ['v', 'A → C ← B'], ['alarm', 'Alarm（L20 p14：E 地震、B 盗窃、R 电台、A 警报、L 下班）'], ['two', '两个 v-structures（5 nodes）']
    ], 'v', reset);
    const update = stepper(ui.body, () => stage, (k) => { stage = k; draw(); },
      () => states.length - 1);
    const svg = graph(ui.body);
    function reset() {
      preset = MORAL[sel.value]; ids = Object.keys(preset.nodes);
      parents = {};
      ids.forEach((id) => { parents[id] = preset.edges.filter((e) => e[1] === id).map((e) => e[0]); });
      let edges = preset.edges.map(([a, b]) => ({ a, b, directed: true }));
      states = [{ edges: edges.slice(), text: '原始 DAG：每个节点对应一个 parent-conditional factor。' }];
      ids.forEach((id) => {
        const added = [];
        for (let i = 0; i < parents[id].length; i++)
          for (let j = i + 1; j < parents[id].length; j++) {
            const a = parents[id][i], b = parents[id][j];
            if (!edges.some((e) => key(e.a, e.b) === key(a, b))) {
              edges = edges.concat([{ a, b, directed: false, cls: 'moral' }]);
              added.push(a + '—' + b);
            }
          }
        states.push({
          edges: edges.slice(), cur: id,
          text: '检查 ' + id + ' 的 parents={' + parents[id].join(', ') +
            '}；新增婚姻边：' + (added.join(', ') || '无') + '。'
        });
      });
      edges = edges.map((e) => Object.assign({}, e, { directed: false }));
      states.push({ edges, text: '所有父节点对已连接；现在删除原边的方向，得到 moral graph。' });
      cliques = maximalCliques(ids, edges);
      states.push({ edges, final: true, text: '枚举所有非空子集，保留完全连接且不包含于更大 clique 的 maximal cliques。' });
      stage = 0; draw();
    }
    function draw() {
      const s = states[stage], cls = {};
      if (s.cur) cls[s.cur] = 'cur';
      SML.vizGraph.draw(svg, { nodes: preset.nodes, edges: s.edges, nodeCls: cls, r: 20 });
      update();
      ui.out.innerHTML = md(s.text + '（L20 p29, p39–40）\n\n' +
        '每个 family $\\{i\\}\\cup pa_i$ 都是 clique，因此 $P(x_i\\mid x_{pa_i})$ 可放入包含它的 maximal clique；转换保持联合分布，但可能丢失图中显式的独立性。');
      if (s.final) {
        ui.out.innerHTML += md(cliques.map((c, i) =>
          '$C_' + (i + 1) + '=\\{' + c.join(',') + '\\}$').join('；'));
        const assigned = ids.map((id) => {
          const family = [id].concat(parents[id]);
          return cliques.findIndex((c) => family.every((x) => c.includes(x)));
        });
        ui.out.innerHTML += table(['BN factor', 'scope', '放入 clique'], ids.map((id, i) => [
          '$P(x_{' + id + '}' + (parents[id].length ?
            '\\mid ' + parents[id].map((p) => 'x_{' + p + '}').join(',') : '') + ')$',
          '{' + [id].concat(parents[id]).join(', ') + '}',
          'C' + (assigned[i] + 1)
        ])) + md('每个 factor 恰好分配一次，clique potential 是所分配 factors 的乘积，此映射 $Z=1$；若多个 clique 均包含 scope，选择第一个（L20 p40）。');
      }
    }
    reset();
  });

  /* Exact rational arithmetic for every message and enumerated probability.
     These four-node examples remain far below Number.MAX_SAFE_INTEGER. */
  function gcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { const t = a % b; a = b; b = t; }
    return a || 1;
  }
  function q(n, d) {
    d = d == null ? 1 : d;
    const g = gcd(n, d); return [n / g, d / g];
  }
  const add = (a, b) => q(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
  const mul = (a, b) => q(a[0] * b[0], a[1] * b[1]);
  const div = (a, b) => q(a[0] * b[1], a[1] * b[0]);
  const equal = (a, b) => a[0] === b[0] && a[1] === b[1];
  const qs = (a) => a[1] === 1 ? String(a[0]) : a[0] + '/' + a[1];
  const qt = (a) => a[1] === 1 ? String(a[0]) : '\\frac{' + a[0] + '}{' + a[1] + '}';
  const vector = (v) => '[' + v.map(qs).join(', ') + ']';

  /* ---------------- L21 ---------------- */
  SML.viz.register('msg-passing', function (el) {
    const ui = shell(el, 'Sum-product：collect → distribute');
    const ids = ['X1', 'X2', 'X3', 'X4'];
    const unary = { X1: [q(7, 10), q(3, 10)], X2: [q(1), q(1)],
      X3: [q(1), q(1)], X4: [q(1), q(1)] };
    const psi = (a, b) => q(a === b ? 2 : 1);
    const mkKey = (a, b) => a + '>' + b;
    let states = [], stage = 0, edges, nodes, neighbours, brute, beliefs, Z, ok;
    const sel = select(ui.tools, '预设', [['chain', 'A：chain'], ['star', 'B：star']], 'chain', reset);
    const rootSel = select(ui.tools, 'Root', ids.map((id) => [id, id]), 'X2', reset);
    const update = stepper(ui.body, () => stage, (k) => { stage = k; draw(); },
      () => states.length - 1);
    const svg = graph(ui.body), tables = node('div'); ui.body.appendChild(tables);
    function reset() {
      edges = sel.value === 'chain' ?
        [['X1', 'X2'], ['X2', 'X3'], ['X3', 'X4']] :
        [['X1', 'X2'], ['X2', 'X3'], ['X2', 'X4']];
      nodes = sel.value === 'chain' ? {
        X1: { x: 40, y: 70 }, X2: { x: 150, y: 70 },
        X3: { x: 260, y: 70 }, X4: { x: 370, y: 70 }
      } : {
        X1: { x: 40, y: 80 }, X2: { x: 180, y: 130 },
        X3: { x: 320, y: 80 }, X4: { x: 180, y: 260 }
      };
      neighbours = {};
      ids.forEach((id) => { neighbours[id] = []; });
      edges.forEach(([a, b]) => { neighbours[a].push(b); neighbours[b].push(a); });
      const collect = [], distribute = [];
      function visit(i, parent) {
        neighbours[i].filter((j) => j !== parent).forEach((j) => {
          distribute.push([i, j, 'distribute']);
          visit(j, i); collect.push([j, i, 'collect']);
        });
      }
      visit(rootSel.value, null);
      let messages = {};
      states = [{ messages: {}, text: '选定 root=' + rootSel.value + '；先 collect，再 distribute。' }];
      collect.concat(distribute).forEach(([i, j, phase]) => {
        const incoming = neighbours[i].filter((k) => k !== j);
        const terms = [0, 1].map((b) => [0, 1].map((a) => {
          const factors = [unary[i][a], psi(a, b)].concat(
            incoming.map((k) => messages[mkKey(k, i)][a]));
          return { factors, value: factors.reduce(mul, q(1)) };
        }));
        const value = terms.map((r) => add(r[0].value, r[1].value));
        messages = Object.assign({}, messages, { [mkKey(i, j)]: value });
        states.push({
          messages, i, j, phase, incoming, terms, value
        });
      });
      beliefs = {};
      ids.forEach((i) => {
        const b = [0, 1].map((a) => neighbours[i].reduce(
          (v, k) => mul(v, messages[mkKey(k, i)][a]), unary[i][a]));
        const total = add(b[0], b[1]);
        beliefs[i] = { raw: b, total, p: b.map((v) => div(v, total)) };
      });
      // Independent enumeration of all 16 joint configurations.
      brute = {}; ids.forEach((i) => { brute[i] = [q(0), q(0)]; });
      Z = q(0);
      for (let mask = 0; mask < 16; mask++) {
        const x = {}; ids.forEach((i, k) => { x[i] = (mask >> k) & 1; });
        let weight = ids.reduce((v, i) => mul(v, unary[i][x[i]]), q(1));
        edges.forEach(([i, j]) => { weight = mul(weight, psi(x[i], x[j])); });
        Z = add(Z, weight);
        ids.forEach((i) => { brute[i][x[i]] = add(brute[i][x[i]], weight); });
      }
      ids.forEach((i) => { brute[i] = brute[i].map((v) => div(v, Z)); });
      ok = ids.every((i) => equal(beliefs[i].total, Z) &&
        beliefs[i].p.every((v, a) => equal(v, brute[i][a])));
      states.push({ messages, final: true });
      stage = 0; draw();
    }
    function draw() {
      const s = states[stage], cls = { [rootSel.value]: 'x' };
      if (s.i) { cls[s.i] = 'y'; cls[s.j] = 'cur'; }
      const drawn = edges.map(([a, b]) => {
        if (s.i && key(a, b) === key(s.i, s.j))
          return { a: s.i, b: s.j, directed: true, cls: 'path' };
        return { a, b, directed: false };
      });
      SML.vizGraph.draw(svg, { nodes, edges: drawn, nodeCls: cls, r: 21 });
      update();
      tables.innerHTML = table(['unary φᵢ', 'xᵢ=0', 'xᵢ=1'], ids.map((i) =>
        [i, qs(unary[i][0]), qs(unary[i][1])])) +
        table(['每条边 ψᵢⱼ：行 xᵢ / 列 xⱼ', '0', '1'], [['0', '2', '1'], ['1', '1', '2']]);
      const sent = Object.keys(s.messages);
      if (sent.length) tables.innerHTML += table(['已计算的 message', '[m(0), m(1)]'],
        sent.map((k) => [k.replace('>', ' → '), vector(s.messages[k])]));
      const general = '$m_{i\\to j}(x_j)=\\sum_{x_i}\\phi_i(x_i)\\psi_{ij}(x_i,x_j)' +
        '\\prod_{k\\in N(i)\\setminus\\{j\\}}m_{k\\to i}(x_i)$';
      if (s.final) {
        ui.out.innerHTML = md(
          '所有 6 个有向 messages 已计算，$P(x_i)\\propto\\phi_i(x_i)\\prod_{k\\in N(i)}m_{k\\to i}(x_i)$，最后归一化（L21 p10, p29–34）。' +
          '\n\n' + (ok ? '✓ exact check：' : '✗ check failed：') +
          '与枚举全部 16 个 joint states 的 marginals 逐项比较；使用约分分数，不靠浮点容差。'
        ) + table(['节点', '未归一化 belief', 'BP [P(0),P(1)]', 'brute-force', 'check'],
          ids.map((i) => [i, vector(beliefs[i].raw), vector(beliefs[i].p), vector(brute[i]),
            beliefs[i].p.every((v, a) => equal(v, brute[i][a])) ? '✓' : '✗'])) +
          readout([['partition function Z', qs(Z)]]);
      } else if (s.i) {
        const i = s.i.slice(1), j = s.j.slice(1);
        const incoming = s.incoming.map((k) =>
          '$m_{' + k.slice(1) + '\\to ' + i + '}$').join('、') || '无（空积为 1）';
        const numeric = s.terms.map((terms, b) =>
          '$m_{' + i + '\\to ' + j + '}(' + b + ')=' +
          terms.map((t) => t.factors.map(qt).join('\\cdot')).join('+') +
          '=' + qt(s.value[b]) + '$').join('\n\n');
        ui.out.innerHTML = md(
          '**' + s.phase + '：' + s.i + ' → ' + s.j + '**；使用 incoming：' +
          incoming + '，排除来自接收者的 message（L21 p22, p30–33）。\n\n' +
          general + '\n\n' + numeric
        );
      } else {
        ui.out.innerHTML = md(s.text +
          '（L21 p29）\n\n' + general +
          '；此教学例使用 $x_i\\in\\{0,1\\}$，并加入 unary $\\phi_i$，与讲义仅 edge factors 的规则一致。');
      }
    }
    reset();
  });
})(window);
