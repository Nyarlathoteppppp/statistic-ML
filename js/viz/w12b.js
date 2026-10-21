/* W12 (cont.) chapter visualisation (L24, c64): maximum weighted spanning tree, one edge per click.
 * Weights are mutual information (or edge BIC scores for binary variables); a junction-tree preset (c58) is included for contrast. */
(function (root) {
  'use strict';
  const SML = root.SML;
  const SVG_NS = 'http://www.w3.org/2000/svg';

  function node(tag, cls, html) { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function btn(text, fn, cls) { const b = node('button', cls || 'btn', text); b.type = 'button'; b.addEventListener('click', fn); return b; }
  function label(text, control) { const l = node('label'); l.appendChild(node('span', null, text)); l.appendChild(control); return l; }
  const md = (s) => SML.md.md(s);
  const esc = (s) => SML.md.esc(String(s));
  const fmt = (v) => (Number.isFinite(v) ? String(+v.toFixed(4)) : '—');

  /* Presets. mi: base weights are empirical mutual information of binary variables, so the BIC option is offered. */
  const PRESETS = {
    L24: {
      name: 'L24 p15–p19（课件）', note: '课件的 4 个变量，边权 = 互信息 $\\hat I$。课件的数字只是示意（二元变量的互信息不超过 $\\ln 2\\approx0.69$），所以这个预设不做 BIC 换算。',
      nodes: { x1: { x: 40, y: 40 }, x2: { x: 200, y: 40 }, x3: { x: 40, y: 190 }, x4: { x: 260, y: 190 } },
      labels: { x1: 'x₁', x2: 'x₂', x3: 'x₃', x4: 'x₄' },
      edges: [['x1', 'x2', 1.5], ['x2', 'x4', 0.9], ['x3', 'x4', 1], ['x1', 'x3', 3], ['x1', 'x4', 0.7], ['x2', 'x3', 2]],
      mi: false,
    },
    TOY: {
      name: 'c64 例子：A、B、C，T = 100', note: '三个二元变量，100 条数据。边权先是互信息 $\\hat I$；打开 BIC 后变成 $T\\hat I-\\tfrac12\\ln T$，只有正分的边能用。',
      nodes: { A: { x: 40, y: 40 }, B: { x: 220, y: 40 }, C: { x: 130, y: 170 } },
      labels: {},
      edges: [['A', 'B', 0.1927], ['B', 'C', 0.0201], ['A', 'C', 0.0008]],
      mi: true, T: 100, bic: true,
    },
    EX: {
      name: 'c64 练习：A、B、C、D', note: '题目直接给出四个二元变量两两之间的 $\\hat I$。先不开 BIC 跑一遍，再打开 BIC（$T=20$）看 $D$ 怎么变成孤立点。',
      nodes: { A: { x: 130, y: 30 }, B: { x: 30, y: 150 }, C: { x: 230, y: 150 }, D: { x: 130, y: 250 } },
      labels: {},
      edges: [['A', 'B', 0.30], ['A', 'C', 0.25], ['B', 'C', 0.20], ['A', 'D', 0.05], ['B', 'D', 0.03], ['C', 'D', 0.04]],
      mi: true, T: 20, bic: false,
    },
    L22: {
      name: 'c58 对照：junction tree', note: 'L22 的 clique graph：节点是团，边权 = 两团共享的变量个数 $|c_i\\cap c_j|$。算法完全一样，只是权重的含义不同。',
      nodes: { c1: { x: 40, y: 40 }, c2: { x: 220, y: 40 }, c3: { x: 130, y: 160 } },
      labels: { c1: 'c₁', c2: 'c₂', c3: 'c₃' },
      edges: [['c1', 'c2', 2], ['c2', 'c3', 2], ['c1', 'c3', 1]],
      mi: false,
    },
  };

  /* Kruskal with a record of every decision. Returns { steps, chosen, components }. */
  function runKruskal(ids, edges, positiveOnly) {
    const parent = {}; ids.forEach((id) => { parent[id] = id; });
    const find = (v) => { while (parent[v] !== v) v = parent[v]; return v; };
    const order = edges.map((e, i) => Object.assign({ i: i }, e)).sort((p, q) => (q.w - p.w) || (p.i - q.i));
    const steps = [], chosen = [];
    let total = 0;
    for (let k = 0; k < order.length; k++) {
      const e = order[k];
      if (chosen.length === ids.length - 1) { steps.push({ kind: 'done', rest: order.slice(k) }); break; }
      if (positiveOnly && !(e.w > 0)) { steps.push({ kind: 'stop', e: e, rest: order.slice(k) }); break; }
      const ra = find(e.a), rb = find(e.b);
      if (ra === rb) { steps.push({ kind: 'cycle', e: e, path: pathBetween(chosen, e.a, e.b), total: total }); continue; }
      parent[ra] = rb; chosen.push(e); total += e.w;
      steps.push({ kind: 'add', e: e, total: total });
    }
    const roots = new Set(ids.map(find));
    return { steps: steps, chosen: chosen, total: total, components: roots.size };
  }
  /* Path between a and b inside the chosen edges (they are connected when an edge would close a cycle). */
  function pathBetween(chosen, a, b) {
    const adj = {};
    chosen.forEach((e) => { (adj[e.a] = adj[e.a] || []).push(e.b); (adj[e.b] = adj[e.b] || []).push(e.a); });
    const prev = {}; prev[a] = null; const queue = [a];
    while (queue.length) { const v = queue.shift(); if (v === b) break; (adj[v] || []).forEach((u) => { if (!(u in prev)) { prev[u] = v; queue.push(u); } }); }
    if (!(b in prev)) return [];
    const path = []; for (let v = b; v != null; v = prev[v]) path.unshift(v);
    return path;
  }

  SML.viz.register('mwst-stepper', function (el, opts) {
    opts = opts || {};
    let key = PRESETS[opts.preset] ? opts.preset : 'L24';
    let P, weights, useBic, T, stage = 0;

    const box = node('div', 'solver'), head = node('div', 'solver-head'), tools = node('div', 'tools');
    const body = node('div', 'solver-body'), out = node('div', 'solver-out');
    head.append(node('span', 'title', '最大权生成树（maximum weighted spanning tree）分步'), tools); box.append(head, body, out); el.appendChild(box);

    const select = document.createElement('select');
    Object.keys(PRESETS).forEach((k) => { const o = node('option', null, esc(PRESETS[k].name)); o.value = k; select.appendChild(o); });
    const stepper = node('div', 'stepper');
    const prevB = btn('上一步', () => { stage = Math.max(0, stage - 1); draw(); });
    const nextB = btn('下一步', () => { stage += 1; draw(); }, 'btn primary');
    const allB = btn('全部', () => { stage = 1e9; draw(); });
    const resetB = btn('重来', () => { stage = 0; draw(); });
    const pos = node('span', 'pos');
    stepper.append(prevB, nextB, allB, resetB, pos);
    tools.append(label('预设', select), stepper);

    const noteBox = node('div', 'small muted'); body.appendChild(noteBox);
    const bicRow = node('div', 'row'); body.appendChild(bicRow);
    const bicBox = document.createElement('input'); bicBox.type = 'checkbox';
    const tInput = document.createElement('input'); tInput.type = 'number'; tInput.min = '2'; tInput.step = '1';
    bicRow.append(label('按 BIC 打分（二元变量）', bicBox), label('样本数 T', tInput));
    const bicNote = node('div', 'small'); body.appendChild(bicNote);
    const weightSlot = node('div'); body.appendChild(weightSlot);
    const svg = document.createElementNS(SVG_NS, 'svg'); svg.setAttribute('class', 'graph'); svg.style.maxWidth = '340px'; body.appendChild(svg);
    const logSlot = node('div', 'table-wrap'); body.appendChild(logSlot);

    function load(k) {
      key = k; P = PRESETS[k];
      weights = P.edges.map((e) => e[2]);
      useBic = !!(P.mi && P.bic); T = P.T || 100; stage = 0;
      select.value = k; bicBox.checked = useBic; tInput.value = String(T);
      bicRow.style.display = P.mi ? '' : 'none';
      noteBox.innerHTML = md(P.note);
      buildWeightTable();
      draw();
    }
    const penalty = () => 0.5 * Math.log(T);           // binary variables: (r_i - 1)(r_j - 1) / 2 * log T = log(T) / 2
    const used = (w) => (useBic ? T * w - penalty() : w);
    /* One compact "edge [weight]" control per edge; for mutual-information presets the edge's BIC score is shown beside it. */
    function buildWeightTable() {
      weightSlot.innerHTML = '';
      weightSlot.appendChild(node('div', 'small muted', P.mi ? '边权 = 互信息 Î（可改）；括号里是这条边的 BIC 分数 T·Î − ½ln T：' : '边权（可改）：'));
      const r = node('div', 'row');
      P.edges.forEach((e, i) => {
        const inp = document.createElement('input'); inp.type = 'number'; inp.step = 'any'; inp.value = String(weights[i]);
        inp.addEventListener('change', () => { const v = parseFloat(inp.value); if (Number.isFinite(v)) { weights[i] = v; stage = 0; draw(); } else inp.value = String(weights[i]); });
        const l = label(lab(e[0]) + '—' + lab(e[1]), inp);
        if (P.mi) { const b = node('span', 'bic-cell small muted'); b.dataset.i = String(i); l.appendChild(b); }
        r.appendChild(l);
      });
      weightSlot.appendChild(r);
    }
    const lab = (id) => (P.labels && P.labels[id]) || id;

    function draw() {
      useBic = P.mi && bicBox.checked;
      const tv = parseFloat(tInput.value); if (Number.isFinite(tv) && tv >= 2) T = tv;
      weightSlot.querySelectorAll('.bic-cell').forEach((sp) => { const i = +sp.dataset.i; sp.textContent = '（' + fmt(T * weights[i] - penalty()) + '）'; });
      bicNote.innerHTML = P.mi ? md(useBic
        ? '现在的边权 = 边的 BIC 分数 $T\\hat I-\\tfrac12\\ln T$，$T=' + fmt(T) + '$ 时罚分 $\\tfrac12\\ln T=' + fmt(penalty()) + '$；**分数 ≤ 0 的边不加**（L24 p20），所以结果可能是森林。'
        : '现在的边权 = 互信息 $\\hat I$（只看 log-likelihood）。$\\hat I\\ge0$，所以一定会选满 $n-1$ 条边。') : '';
      const ids = Object.keys(P.nodes);
      const edges = P.edges.map((e, i) => ({ a: e[0], b: e[1], w: used(weights[i]), raw: weights[i] }));
      const res = runKruskal(ids, edges, useBic);
      const n = res.steps.length;
      stage = Math.min(stage, n);
      pos.textContent = stage + ' / ' + n; prevB.disabled = stage === 0; nextB.disabled = stage === n; allB.disabled = stage === n;

      // Edge classes at this stage: tree edges red (path), skipped edges faint (gone), the edge just rejected dashed (fill).
      const state = {};
      res.steps.slice(0, stage).forEach((s, i) => {
        if (s.kind === 'add') state[s.e.i] = 'path';
        else if (s.kind === 'cycle') state[s.e.i] = i === stage - 1 ? 'fill' : 'gone';
        else (s.rest || []).forEach((r) => { state[r.i] = 'gone'; });
      });
      const cur = stage > 0 ? res.steps[stage - 1] : null;
      const nodeCls = {};
      if (cur && cur.e) { nodeCls[cur.e.a] = 'cur'; nodeCls[cur.e.b] = 'cur'; }
      SML.vizGraph.draw(svg, {
        nodes: P.nodes, labels: P.labels, nodeCls: nodeCls, r: 19,
        edges: edges.map((e, i) => ({ a: e.a, b: e.b, directed: false, cls: state[i] || '', label: fmt(e.w) })),
      });

      // Decision log.
      const rows = res.steps.slice(0, stage).map((s, i) => {
        if (s.kind === 'add') return [i + 1, lab(s.e.a) + '—' + lab(s.e.b), fmt(s.e.w), '加入（不成环）', fmt(s.total)];
        if (s.kind === 'cycle') return [i + 1, lab(s.e.a) + '—' + lab(s.e.b), fmt(s.e.w), '跳过：会成环 ' + s.path.map(lab).join('—') + '—' + lab(s.e.a), fmt(s.total)];
        if (s.kind === 'stop') return [i + 1, lab(s.e.a) + '—' + lab(s.e.b), fmt(s.e.w), '停止：剩下的分数都 ≤ 0', fmt(res.total)];
        return [i + 1, '—', '—', '已有 n−1 条边，树完成', fmt(res.total)];
      });
      const t = node('table', 'compact');
      t.innerHTML = '<thead><tr><th>步</th><th>考虑的边</th><th>权重</th><th>结果</th><th>树的总权重</th></tr></thead><tbody>' +
        rows.map((r) => '<tr>' + r.map((c) => '<td>' + esc(c) + '</td>').join('') + '</tr>').join('') + '</tbody>';
      logSlot.innerHTML = ''; if (rows.length) logSlot.appendChild(t);

      // Explanation of the current step, then the summary at the end.
      let text;
      if (!cur) {
        const sorted = edges.slice().sort((p, q) => q.w - p.w).map((e) => lab(e.a) + '—' + lab(e.b) + '（' + fmt(e.w) + '）').join(' > ');
        text = '从**空树**开始（L24 p15）。先把边按权重从大到小排好：' + esc(sorted) + '。点"下一步"，每次看剩下权重最大的那条边。';
      } else if (cur.kind === 'add') {
        text = '剩下权重最大的边是 ' + esc(lab(cur.e.a) + '—' + lab(cur.e.b)) + '（' + fmt(cur.e.w) + '）。两端还不连通，加进来不会成环 ⇒ **加入**（红色粗线）。树的总权重 = ' + fmt(cur.total) + '。';
      } else if (cur.kind === 'cycle') {
        text = esc(lab(cur.e.a) + '—' + lab(cur.e.b)) + '（' + fmt(cur.e.w) + '）：两端已经通过 ' + esc(cur.path.map(lab).join('—')) + ' 连通，再加这条边就成环 ⇒ **跳过**（虚线，L24 p18 "creates a cycle if added"）。';
      } else if (cur.kind === 'stop') {
        text = '剩下分数最大的边 ' + esc(lab(cur.e.a) + '—' + lab(cur.e.b)) + ' 的 BIC 分数是 ' + fmt(cur.e.w) + ' ≤ 0：加进去只会让总分下降，后面的更小 ⇒ **停止**。';
      } else {
        text = '已经选了 $n-1=' + (ids.length - 1) + '$ 条边，所有节点都连通了：树完成。剩下的边无论多大都会成环，不用再看（L24 p19）。';
      }
      if (stage === n) {
        const list = res.chosen.map((e) => lab(e.a) + '—' + lab(e.b)).join('，') || '无';
        text += '\n\n**结果**：' + esc(list) + '；总权重 ' + fmt(res.total) + '。' + (res.components > 1 ? '图被分成 ' + res.components + ' 个连通块：这是一个森林（forest），不是一棵连通的树。' : '是一棵连通所有 ' + ids.length + ' 个节点的树。');
      }
      out.innerHTML = md(text);
    }

    select.addEventListener('change', () => load(select.value));
    bicBox.addEventListener('change', () => { stage = 0; draw(); });
    tInput.addEventListener('change', () => { stage = 0; draw(); });
    load(key);
  });
})(window);
