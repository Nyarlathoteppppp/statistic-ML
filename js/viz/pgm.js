(function (root) {
  'use strict';
  const SML = root.SML;
  const SVG_NS = 'http://www.w3.org/2000/svg';

  function el(tag, cls, value) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (value != null) node.textContent = String(value);
    return node;
  }
  function button(label, cls) {
    const b = el('button', 'btn' + (cls ? ' ' + cls : ''), label);
    b.type = 'button';
    return b;
  }
  function fieldLabel(label, control) {
    const wrap = el('label');
    wrap.appendChild(el('span', null, label));
    wrap.appendChild(control);
    return wrap;
  }
  function shell(title) {
    const box = el('div', 'solver');
    const head = el('div', 'solver-head');
    head.appendChild(el('span', 'title', title));
    const tools = el('div', 'tools');
    head.appendChild(tools);
    const body = el('div', 'solver-body');
    const out = el('div', 'solver-out');
    box.append(head, body, out);
    return { box, tools, body, out };
  }
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }
  function textList(items) { return items && items.length ? items.join('、') : '无'; }
  function safeArray(value) { return Array.isArray(value) ? value : []; }
  function sortedUnique(items) {
    return Array.from(new Set(safeArray(items).map(String))).sort();
  }
  function safePreset(value, table, fallback) {
    return table[value] ? table[value] : table[fallback];
  }
  function graphSvg() {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'graph');
    return svg;
  }
  function renderTable(head, rows, cls) {
    const wrap = el('div', 'table-wrap');
    const table = el('table', cls || 'compact');
    const tr = el('tr');
    head.forEach(function (value) { tr.appendChild(el('th', null, value)); });
    const thead = document.createElement('thead'); thead.appendChild(tr); table.appendChild(thead);
    const tbody = document.createElement('tbody');
    rows.forEach(function (row) {
      const r = el('tr'); row.forEach(function (value) { r.appendChild(el('td', null, value)); }); tbody.appendChild(r);
    });
    table.appendChild(tbody); wrap.appendChild(table); return wrap;
  }
  function showMarkdown(node, source) { node.innerHTML = SML.md.md(source); }
  function edgeKey(a, b) { return [String(a), String(b)].sort().join('|'); }
  function edgePairs(edges) {
    const seen = {};
    return safeArray(edges).map(function (edge) {
      return { a: edge[0], b: edge[1], key: edgeKey(edge[0], edge[1]) };
    }).filter(function (edge) {
      if (seen[edge.key]) return false; seen[edge.key] = true; return true;
    });
  }

  const DSEP_PRESETS = {
    'alarm-LBA': {
      nodes: { E: { x: 80, y: 40 }, B: { x: 250, y: 40 }, R: { x: 80, y: 130 }, A: { x: 250, y: 130 }, L: { x: 165, y: 220 } },
      edges: [['E', 'R'], ['E', 'A'], ['B', 'A'], ['R', 'L'], ['A', 'L']], X: ['L'], Y: ['B'], S: ['A']
    },
    'alarm-RAE': {
      nodes: { E: { x: 80, y: 40 }, B: { x: 250, y: 40 }, R: { x: 80, y: 130 }, A: { x: 250, y: 130 }, L: { x: 165, y: 220 } },
      edges: [['E', 'R'], ['E', 'A'], ['B', 'A'], ['R', 'L'], ['A', 'L']], X: ['R'], Y: ['A'], S: ['E']
    },
    coins: {
      nodes: { X1: { x: 80, y: 110 }, X2: { x: 250, y: 110 }, X3: { x: 165, y: 210 } },
      edges: [['X1', 'X3'], ['X2', 'X3']], X: ['X1'], Y: ['X2'], S: ['X3']
    },
    EX2026Q4: {
      nodes: { S: { x: 140, y: 40 }, T: { x: 240, y: 40 }, U: { x: 40, y: 130 }, V: { x: 140, y: 130 }, W: { x: 240, y: 130 }, X: { x: 40, y: 220 }, Y: { x: 140, y: 220 }, Z: { x: 240, y: 220 } },
      edges: [['S', 'V'], ['S', 'W'], ['T', 'W'], ['U', 'V'], ['U', 'Y'], ['X', 'Y'], ['V', 'Z'], ['W', 'Z'], ['Y', 'Z']], X: ['S'], Y: ['Z'], S: ['V', 'W']
    }
  };

  function dsepData(preset, x, y, s) {
    const xOk = preset.nodes[x] ? [x] : [Object.keys(preset.nodes)[0]];
    const yOk = preset.nodes[y] && xOk[0] !== y ? [y] : Object.keys(preset.nodes).filter(function (id) { return id !== xOk[0]; }).slice(0, 1);
    const sOk = sortedUnique(s).filter(function (id) { return preset.nodes[id] && xOk.indexOf(id) < 0 && yOk.indexOf(id) < 0; });
    let trace;
    try { trace = SML.core.dsep.dsep(preset.edges, xOk, yOk, sOk); }
    catch (e) { trace = { independent: false, steps: { ancestral: [], ancestralEdges: [], moralEdges: [], undirectedEdges: [], removed: sOk, path: null }, error: e.message }; }
    return { x: xOk, y: yOk, s: sOk, trace: trace };
  }

  function dsepExplanation(stage, data) {
    const t = data.trace.steps;
    const x = textList(data.x), y = textList(data.y), s = textList(data.s);
    if (stage === 0) return '原图保留所有有向边，检查 ' + x + ' 与 ' + y + ' 在给定 ' + s + ' 时是否 d-separated。';
    if (stage === 1) return '祖先图保留 ' + textList(t.ancestral) + '：查询节点（X、Y）、条件节点，以及它们的所有祖先；其余节点不参与路径判断。';
    if (stage === 2) {
      const marriages = safeArray(t.moralEdges).map(function (edge) { return edge[0] + ' 与 ' + edge[1]; });
      return marriages.length ? '在祖先图中，' + marriages.join('、') + ' 是同一子节点的父节点，因此结婚（moralize）并加边。' : '祖先图中没有需要新增的父节点婚姻边。';
    }
    if (stage === 3) return '去方向后，只按无向连接找路径；原来的箭头方向不再限制路径。';
    if (stage === 4) return '删除给定节点 ' + s + ' 及其 incident edges；剩余节点用于判断 ' + x + ' 与 ' + y + '。';
    if (t.path && t.path.length) return '找到路径 ' + t.path.join(' — ') + '，所以 ' + x + ' 与 ' + y + ' 在给定 ' + s + ' 下不 d-separated：图不能保证条件独立（考试写 does not hold）。';
    return '删除给定节点后没有从 ' + x + ' 到 ' + y + ' 的路径，所以 d-separated ⇒ 条件独立成立。';
  }

  function mountDsep(elm, opts) {
    const ui = shell('d-separation 分步判断');
    const names = Object.keys(safePreset(opts && opts.preset, DSEP_PRESETS, 'alarm-LBA').nodes);
    const chosen = safePreset(opts && opts.preset, DSEP_PRESETS, 'alarm-LBA');
    const xSelect = document.createElement('select'), ySelect = document.createElement('select');
    names.forEach(function (id) { xSelect.appendChild(el('option', null, id)); ySelect.appendChild(el('option', null, id)); });
    xSelect.value = chosen.X[0]; ySelect.value = chosen.Y[0];
    ui.tools.appendChild(fieldLabel('X', xSelect)); ui.tools.appendChild(fieldLabel('Y', ySelect));
    const sBox = el('span', 'row'); sBox.appendChild(el('span', null, '条件集（给定的节点）：'));
    const sChecks = {};
    names.forEach(function (id) {
      const check = document.createElement('input'); check.type = 'checkbox'; check.value = id; check.checked = chosen.S.indexOf(id) >= 0; sChecks[id] = check;
      sBox.appendChild(fieldLabel(id, check));
    });
    ui.body.appendChild(sBox);
    const stepper = el('div', 'stepper');
    const prev = button('上一步'), next = button('下一步', 'primary'), pos = el('span', 'pos');
    stepper.append(prev, next, pos); ui.body.appendChild(stepper);
    const svg = graphSvg(); ui.body.appendChild(svg);
    const explanation = el('div'); ui.out.appendChild(explanation);
    let stage = 0;
    let adjustNote = '';
    function current() {
      const s = names.filter(function (id) { return sChecks[id].checked; });
      const data = dsepData(chosen, xSelect.value, ySelect.value, s);
      // write the values actually used back into the controls, so the text never disagrees with them
      const notes = [];
      if (data.y[0] !== ySelect.value) { notes.push('X 和 Y 不能是同一个节点，Y 已改成 ' + data.y[0]); ySelect.value = data.y[0]; }
      s.forEach(function (id) {
        if (data.s.indexOf(id) < 0) { sChecks[id].checked = false; notes.push(id + ' 是查询节点，不能同时放进条件集，已取消勾选'); }
      });
      if (notes.length) adjustNote = notes.join('；') + '。';
      return data;
    }
    function draw() {
      const data = current(), t = data.trace.steps;
      const ancestral = new Set(t.ancestral || []), removed = new Set(data.s);
      const pathPairs = {};
      if (t.path) for (let i = 1; i < t.path.length; i++) pathPairs[edgeKey(t.path[i - 1], t.path[i])] = true;
      const moralPairs = {};
      safeArray(t.moralEdges).forEach(function (pair) { moralPairs[edgeKey(pair[0], pair[1])] = true; });
      const basePairs = edgePairs(chosen.edges);
      const edges = basePairs.map(function (edge) {
        const inAncestor = ancestral.has(edge.a) && ancestral.has(edge.b);
        let cls = '';
        if (stage >= 1 && !inAncestor) cls = 'gone';
        if (stage >= 4 && (removed.has(edge.a) || removed.has(edge.b))) cls = 'gone';
        if (stage >= 5 && pathPairs[edge.key]) cls = 'path';
        return { a: edge.a, b: edge.b, directed: stage < 3, cls: cls };
      }).filter(function (edge) { return true; });
      if (stage >= 2) {
        safeArray(t.moralEdges).forEach(function (pair) {
          const cls = (stage >= 4 && (removed.has(pair[0]) || removed.has(pair[1]))) ? 'gone' : (stage >= 5 && pathPairs[edgeKey(pair[0], pair[1])] ? 'path' : 'moral');
          edges.push({ a: pair[0], b: pair[1], directed: false, cls: cls });
        });
      }
      const nodeCls = {};
      names.forEach(function (id) {
        const cls = [];
        if (stage >= 1 && !ancestral.has(id)) cls.push('out');
        if (stage >= 4 && removed.has(id)) cls.push('removed');
        if (data.x.indexOf(id) >= 0) cls.push('x');
        if (data.y.indexOf(id) >= 0) cls.push('y');
        nodeCls[id] = cls.join(' ');
      });
      SML.vizGraph.draw(svg, { nodes: chosen.nodes, edges: edges, nodeCls: nodeCls, r: 19 });
      pos.textContent = stage + ' / 5'; prev.disabled = stage === 0; next.disabled = stage === 5;
      explanation.innerHTML = '';
      if (adjustNote) { const n = el('div', 'callout warn'); n.textContent = adjustNote; explanation.appendChild(n); }
      const p = el('p'); p.textContent = dsepExplanation(stage, data); explanation.appendChild(p);
      if (stage === 5) {
        const verdict = el('div', data.trace.independent ? 'callout good' : 'callout warn');
        verdict.textContent = data.trace.independent ? '结论：D-separated ⇒ 条件独立成立' : '结论：not D-separated（存在路径，图不保证条件独立；考试写 does not hold）'; explanation.appendChild(verdict);
      }
    }
    function reset() { stage = 0; adjustNote = ''; draw(); }
    [xSelect, ySelect].forEach(function (control) { control.addEventListener('change', reset); });
    Object.keys(sChecks).forEach(function (id) { sChecks[id].addEventListener('change', reset); });
    prev.addEventListener('click', function () { stage = Math.max(0, stage - 1); draw(); });
    next.addEventListener('click', function () { stage = Math.min(5, stage + 1); draw(); });
    draw(); elm.appendChild(ui.box);
    return ui;
  }

  const DSEP_LABELS = { 'EX2026Q4': '2026 Q4', 'alarm-LBA': 'Alarm：L⊥B|A', 'alarm-RAE': 'Alarm：R⊥A|E', coins: '硬币 X1⊥X2|X3' };
  SML.viz.register('dsep-stepper', function (elm, opts) {
    let key = DSEP_PRESETS[opts && opts.preset] ? opts.preset : 'EX2026Q4';
    function mount() {
      clear(elm);
      const ui = mountDsep(elm, { preset: key });
      const sel = document.createElement('select');
      Object.keys(DSEP_LABELS).forEach(function (k) { const o = el('option', null, DSEP_LABELS[k]); o.value = k; sel.appendChild(o); });
      sel.value = key;
      sel.addEventListener('change', function () { key = sel.value; mount(); });
      ui.tools.insertBefore(fieldLabel('预设', sel), ui.tools.firstChild);
    }
    mount();
  });

  const ELIM_PRESETS = {
    L22: {
      nodes: { '1': { x: 130, y: 40 }, '2': { x: 60, y: 120 }, '3': { x: 200, y: 120 }, '4': { x: 60, y: 210 }, '5': { x: 200, y: 210 } },
      edges: [['1', '2'], ['1', '3'], ['2', '4'], ['3', '4'], ['3', '5'], ['4', '5']],
      order: ['1', '2', '3', '4', '5']
    },
    L22star: {
      nodes: { L: { x: 110, y: 30 }, B: { x: 210, y: 30 }, H: { x: 45, y: 110 }, C: { x: 275, y: 110 }, A: { x: 160, y: 160 }, G: { x: 45, y: 210 }, D: { x: 275, y: 210 }, F: { x: 110, y: 290 }, E: { x: 210, y: 290 } },
      edges: [['A', 'B'], ['A', 'C'], ['A', 'D'], ['A', 'E'], ['A', 'F'], ['A', 'G'], ['A', 'H'], ['A', 'L'], ['B', 'C'], ['D', 'E'], ['F', 'G'], ['H', 'L']],
      order: ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'L', 'A']
    },
    EX2026Q5: {
      nodes: { T: { x: 130, y: 40 }, U: { x: 55, y: 100 }, W: { x: 205, y: 100 }, V: { x: 130, y: 165 }, X: { x: 55, y: 235 }, Z: { x: 205, y: 235 }, Y: { x: 130, y: 300 } },
      edges: [['T', 'U'], ['T', 'W'], ['U', 'V'], ['U', 'X'], ['V', 'W'], ['V', 'Y'], ['V', 'Z'], ['W', 'Z'], ['X', 'Y'], ['Y', 'Z']],
      order: ['T', 'X', 'Z', 'U', 'W', 'V', 'Y']
    }
  };

  function parseOrder(value, names) {
    const tokens = String(value == null ? '' : value).split(/[\s,，、;]+/).map(function (v) { return v.trim(); }).filter(Boolean);
    const known = new Set(names), seen = new Set(), good = [];
    tokens.forEach(function (token) { if (known.has(token) && !seen.has(token)) { seen.add(token); good.push(token); } });
    return { tokens: tokens, order: good, duplicate: tokens.some(function (token, i) { return tokens.indexOf(token) !== i; }), unknown: tokens.filter(function (token) { return !known.has(token); }) };
  }

  function mountElim(elm, opts) {
    const preset = safePreset(opts && opts.preset, ELIM_PRESETS, 'EX2026Q5');
    const ui = shell('variable elimination 分步');
    const names = Object.keys(preset.nodes);
    const orderInput = document.createElement('input'); orderInput.type = 'text'; orderInput.value = preset.order.join(', '); orderInput.size = 22;
    ui.tools.appendChild(fieldLabel('消元顺序', orderInput));
    const stepper = el('div', 'stepper');
    const prev = button('上一步'), next = button('下一步', 'primary'), pos = el('span', 'pos');
    stepper.append(prev, next, pos); ui.tools.appendChild(stepper);
    const svg = graphSvg(); ui.body.appendChild(svg);
    const tableSlot = el('div'); ui.body.appendChild(tableSlot);
    const finalSlot = el('div'); ui.out.appendChild(finalSlot);
    let stage = 0;
    function getResult() {
      const parsed = parseOrder(orderInput.value, names);
      if (parsed.unknown.length || parsed.order.length !== names.length || parsed.duplicate) {
        return { parsed: parsed, result: null };
      }
      try { return { parsed: parsed, result: SML.core.elim.eliminate(preset.edges, parsed.order) }; }
      catch (e) { return { parsed: parsed, result: null, error: e.message }; }
    }
    function draw() {
      const current = getResult(), result = current.result;
      tableSlot.innerHTML = ''; finalSlot.innerHTML = '';
      if (!result) {
        const message = current.error || (current.parsed.unknown.length ? '未知节点：' + textList(current.parsed.unknown) : '消元顺序必须恰好包含每个节点一次。');
        tableSlot.appendChild(el('div', 'callout warn', message));
        SML.vizGraph.draw(svg, { nodes: preset.nodes, edges: preset.edges.map(function (pair) { return { a: pair[0], b: pair[1], directed: false }; }), r: 19 });
        pos.textContent = '0 / 0'; prev.disabled = true; next.disabled = true; return;
      }
      stage = Math.min(stage, result.steps.length);
      const fills = [];
      for (let i = 0; i < stage; i++) result.steps[i].fill.forEach(function (pair) { fills.push(pair); });
      const edges = edgePairs(preset.edges).map(function (edge) { return { a: edge.a, b: edge.b, directed: false }; });
      edgePairs(fills).forEach(function (edge) { edges.push({ a: edge.a, b: edge.b, directed: false, cls: 'fill' }); });
      const nodeCls = {};
      names.forEach(function (name) {
        const cls = [];
        const currentStep = stage > 0 && stage <= result.steps.length ? result.steps[stage - 1] : null;
        const completed = result.steps.slice(0, Math.max(0, stage - 1)).map(function (step) { return step.node; });
        if (completed.indexOf(name) >= 0) cls.push('done');
        if (currentStep && currentStep.node === name) cls.push('cur');
        nodeCls[name] = cls.join(' ');
      });
      SML.vizGraph.draw(svg, { nodes: preset.nodes, edges: edges, nodeCls: nodeCls, r: 19 });
      pos.textContent = stage + ' / ' + result.steps.length; prev.disabled = stage === 0; next.disabled = stage === result.steps.length;
      const rows = result.steps.slice(0, stage).map(function (step) {
        return [step.node, textList(step.neighbours), step.fill.length ? step.fill.map(function (pair) { return pair.join('-'); }).join(', ') : '无', '{' + step.clique.join(', ') + '}'];
      });
      tableSlot.appendChild(renderTable(['节点', '当前 neighbours', 'fill-in edges', 'clique'], rows, 'compact'));
      if (stage === result.steps.length) {
        const cliques = result.maximalCliques.map(function (clique, i) { return 'C' + (i + 1) + '={' + clique.join(', ') + '}'; }).join('；');
        const junction = result.junctionTree.edges.map(function (edge) { return 'C' + (edge.a + 1) + '—C' + (edge.b + 1) + '，separator={' + edge.separator.join(', ') + '}'; }).join('；');
        showMarkdown(finalSlot, '**Maximal cliques：** ' + (cliques || '无') + '\n\n**Junction tree：** ' + (junction || '无')); 
      }
    }
    function reset() { stage = 0; draw(); }
    orderInput.addEventListener('change', reset); orderInput.addEventListener('keydown', function (event) { if (event.key === 'Enter') reset(); });
    prev.addEventListener('click', function () { stage = Math.max(0, stage - 1); draw(); });
    next.addEventListener('click', function () { stage += 1; draw(); });
    draw(); elm.appendChild(ui.box);
  }

  SML.viz.register('elim-stepper', mountElim);

  const CPT_PRESETS = {
    EX2025Q1e: 'X\nY\nZ\nV: X, Y',
    EX2026Q6: 'S1\nS2\nS3\nC1\nC2\nA: S1, S2, S3, C1, C2',
    EX2025Q4: 'A\nB\nC: A, B'
  };

  function parseParentSpec(source) {
    const parents = {}, card = {}, errors = [];
    String(source == null ? '' : source).split(/\r?\n/).forEach(function (raw, lineNo) {
      const line = raw.trim(); if (!line) return;
      const match = line.match(/^([A-Za-z][A-Za-z0-9_]*)\s*(?:\[(\d+)\])?\s*(?::\s*(.*))?$/);
      if (!match) { errors.push('第 ' + (lineNo + 1) + ' 行格式无法识别'); return; }
      const node = match[1], parentText = (match[3] || '').trim();
      if (Object.prototype.hasOwnProperty.call(parents, node)) { errors.push('节点 ' + node + ' 重复'); return; }
      const trailing = parentText.match(/\[\s*(\d+)\s*\]\s*$/);
      const cardText = match[2] || (trailing ? trailing[1] : null);
      const cleanParents = trailing ? parentText.slice(0, trailing.index).trim() : parentText;
      const list = cleanParents ? cleanParents.split(/\s*,\s*|\s+/).filter(Boolean) : [];
      if (list.some(function (parent) { return parent === node; })) errors.push(node + ' 不能把自己作为 parent');
      if (new Set(list).size !== list.length) errors.push(node + ' 的 parent 重复');
      parents[node] = list;
      if (cardText != null) { const k = Number(cardText); if (Number.isInteger(k) && k > 0) card[node] = k; else errors.push(node + ' 的 cardinality 无效'); }
    });
    const nodes = Object.keys(parents), known = new Set(nodes);
    nodes.forEach(function (node) { parents[node].forEach(function (parent) { if (!known.has(parent)) errors.push(node + ' 的 parent ' + parent + ' 未声明'); }); });
    if (!errors.length) {
      // A Bayesian network must be a DAG: reject directed cycles (DFS with an on-stack mark).
      const state = {};
      const onCycle = function visit(node) {
        if (state[node] === 1) return true;
        if (state[node] === 2) return false;
        state[node] = 1;
        const found = parents[node].some(visit);
        state[node] = 2; return found;
      };
      if (nodes.some(function (node) { return onCycle(node); })) errors.push('存在有向环：Bayesian network 必须是 DAG');
    }
    return { parents: parents, card: card, errors: errors };
  }

  function mountCpt(elm, opts) {
    const ui = shell('CPT 参数计数');
    const presetSelect = document.createElement('select');
    Object.keys(CPT_PRESETS).forEach(function (key) { presetSelect.appendChild(el('option', null, key)); });
    presetSelect.value = opts && CPT_PRESETS[opts.preset] ? opts.preset : 'EX2025Q1e';
    const area = document.createElement('textarea'); area.rows = 5; area.cols = 30; area.value = CPT_PRESETS[presetSelect.value];
    ui.tools.appendChild(fieldLabel('preset', presetSelect));
    ui.body.appendChild(fieldLabel('父节点规格', area));
    const result = el('div'); ui.body.appendChild(result);
    function draw() {
      result.innerHTML = '';
      const parsed = parseParentSpec(area.value);
      if (parsed.errors.length || !Object.keys(parsed.parents).length) { result.appendChild(el('div', 'callout warn', parsed.errors.join('；') || '至少输入一个节点。')); return; }
      let sizes;
      const fullCard = Object.keys(parsed.parents).reduce(function (out, node) { out[node] = parsed.card[node] || 2; return out; }, {});
      try { sizes = SML.core.cpt.sizes(parsed.parents, fullCard); }
      catch (e) { result.appendChild(el('div', 'callout warn', e.message)); return; }
      const rows = sizes.tables.map(function (table) { return [table.node, table.parents.join(', ') || '∅', String(table.parentConfigs), table.shape[0] + ' × ' + table.shape[1], String(table.entries), String(table.free)]; });
      result.appendChild(renderTable(['node', 'parents', 'parent configs', 'table shape', 'entries', 'free params'], rows, 'compact'));
      const joint = SML.core.cpt.joint(Object.keys(parsed.parents).reduce(function (out, node) { out[node] = parsed.card[node] || 2; return out; }, {}));
      const summary = el('div');
      showMarkdown(summary, '**BN 总计：** entries = ' + sizes.totalEntries + '，free parameters = ' + sizes.totalFree + '\n\n**Full joint：** entries = ' + joint.entries + '，free parameters = ' + joint.free + '\n\n三种口径：**table shape** = 子节点取值数 × 父节点组合数（L20 p11 的画法）；**entries** = 表里所有概率格；**free parameters** = 每个父节点组合下少一个（概率和为 1）。比较模型复杂度看 free parameters：BN 的 entries 可能比全联合还多（根节点表也要存两格），但自由参数一定不多于全联合。');
      result.appendChild(summary);
    }
    presetSelect.addEventListener('change', function () { area.value = CPT_PRESETS[presetSelect.value]; draw(); });
    area.addEventListener('input', draw); draw(); elm.appendChild(ui.box);
  }

  SML.viz.register('cpt-counter', mountCpt);

  const MLE_DATA = {
    EX2025Q4c: { spec: 'A\nB\nC: A, B', data: 'A,B,C\nF,F,F\nF,F,T\nF,T,F\nT,F,T\nT,T,T' }
  };
  function parseData(source, names) {
    const lines = String(source == null ? '' : source).split(/\r?\n/).map(function (line) { return line.trim(); }).filter(Boolean);
    if (!lines.length) return { error: '请输入表头和至少一行观测。' };
    const header = lines[0].split(/\s*,\s*|\s+/).filter(Boolean);
    if (new Set(header).size !== header.length || header.length !== names.length || header.some(function (name) { return names.indexOf(name) < 0; })) return { error: '数据表头必须恰好包含规格中的每个变量，且不能重复。' };
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(/\s*,\s*|\s+/).filter(Boolean);
      if (values.length !== header.length) return { error: '第 ' + (i + 1) + ' 行列数不匹配。' };
      const row = {};
      header.forEach(function (name, j) { row[name] = values[j]; });
      rows.push(row);
    }
    return { header: header, rows: rows };
  }
  function exactFraction(a, b) {
    const g = (function gcd(x, y) { return y ? gcd(y, x % y) : x; })(a, b) || 1;
    return b / g === 1 ? String(a / g) : (a / g) + '/' + (b / g);
  }
  function fraction(value) {
    if (value == null) return '未观测配置';
    const denom = 1000000;
    let bestN = 0, bestD = 1, bestErr = Infinity;
    for (let d = 1; d <= 100; d++) {
      const n = Math.round(value * d), err = Math.abs(value - n / d);
      if (err < bestErr) { bestErr = err; bestN = n; bestD = d; }
    }
    return String(bestN) + '/' + String(bestD);
  }
  function mountMle(elm, opts) {
    const ui = shell('CPT maximum likelihood estimates');
    const presetSelect = document.createElement('select');
    Object.keys(MLE_DATA).forEach(function (key) { presetSelect.appendChild(el('option', null, key)); });
    presetSelect.value = opts && MLE_DATA[opts.preset] ? opts.preset : 'EX2025Q4c';
    const specArea = document.createElement('textarea'); specArea.rows = 4; specArea.cols = 28; specArea.value = MLE_DATA[presetSelect.value].spec;
    const dataArea = document.createElement('textarea'); dataArea.rows = 5; dataArea.cols = 28; dataArea.value = MLE_DATA[presetSelect.value].data;
    ui.tools.appendChild(fieldLabel('preset', presetSelect));
    ui.body.append(fieldLabel('父节点规格', specArea), fieldLabel('观测数据', dataArea));
    const output = el('div'); ui.body.appendChild(output);
    function draw() {
      output.innerHTML = '';
      const spec = parseParentSpec(specArea.value);
      if (spec.errors.length || !Object.keys(spec.parents).length) { output.appendChild(el('div', 'callout warn', spec.errors.join('；') || '至少输入一个节点。')); return; }
      const names = Object.keys(spec.parents), data = parseData(dataArea.value, names);
      if (data.error) { output.appendChild(el('div', 'callout warn', data.error)); return; }
      const values = {};
      names.forEach(function (name) { values[name] = []; });
      data.rows.forEach(function (row) { names.forEach(function (name) { if (values[name].indexOf(row[name]) < 0) values[name].push(row[name]); }); });
      if (names.some(function (name) { return !values[name].length; })) { output.appendChild(el('div', 'callout warn', '每个变量至少需要一个观测值。')); return; }
      // Binary variables keep both states even when one of them was never observed (T/F or 0/1).
      names.forEach(function (name) {
        if (values[name].every(function (v) { return v === 'T' || v === 'F'; })) values[name] = ['F', 'T'];
        else if (values[name].every(function (v) { return v === '0' || v === '1'; })) values[name] = ['0', '1'];
      });
      let estimates;
      try { estimates = SML.core.cpt.mle(spec.parents, data.rows, values); }
      catch (e) { output.appendChild(el('div', 'callout warn', e.message)); return; }
      names.forEach(function (name) {
        const rows = Object.keys(estimates[name]).map(function (config) {
          const item = estimates[name][config];
          const mle = item.total ? values[name].map(function (value) { return value + ': ' + exactFraction(item.counts[value], item.total); }).join('；') : '未观测配置（数据定不下这一列）';
          const counts = values[name].map(function (value) { return value + '=' + item.counts[value]; }).join(', ');
          return [name, config || '∅', counts + ' (n=' + item.total + ')', mle];
        });
        output.appendChild(renderTable(['node', 'parent configuration', 'counts', 'MLE'], rows, 'compact'));
      });
    }
    presetSelect.addEventListener('change', function () { specArea.value = MLE_DATA[presetSelect.value].spec; dataArea.value = MLE_DATA[presetSelect.value].data; draw(); });
    specArea.addEventListener('input', draw); dataArea.addEventListener('input', draw); draw(); elm.appendChild(ui.box);
  }
  SML.viz.register('mle-counter', mountMle);

  function sample(rng, items) { return items[Math.floor(rng() * items.length)]; }
  function practiceDsep(rng) {
    const n = 6 + Math.floor(rng() * 2), names = Array.from({ length: n }, function (_, i) { return 'N' + (i + 1); });
    const edges = [];
    for (let i = 0; i < n - 1; i++) edges.push([names[i], names[i + 1]]);
    const fork = 1 + Math.floor(rng() * (n - 2));
    edges.push([names[fork - 1], names[fork + 1]]);
    if (rng() < .5) edges.push([names[0], names[n - 1]]);
    const x = names[0], y = names[n - 1], candidates = names.slice(1, -1), s = [sample(rng, candidates)];
    if (candidates.length > 1 && rng() < .5) { const extra = sample(rng, candidates); if (s.indexOf(extra) < 0) s.push(extra); }
    const result = SML.core.dsep.dsep(edges, [x], [y], s);
    const nodes = {}; names.forEach(function (name, i) { nodes[name] = { x: 40 + (i % 4) * 95, y: 50 + Math.floor(i / 4) * 95 }; });
    const svg = document.createElementNS(SVG_NS, 'svg');
    SML.vizGraph.draw(svg, { nodes: nodes, edges: edges.map(function (edge) { return { a: edge[0], b: edge[1], directed: true }; }), r: 18 });
    const svgMarkup = svg.outerHTML;
    const explanation = '**Ancestral set：** ' + result.steps.ancestral.join(', ') + '. **Married pairs：** ' + (result.steps.moralEdges.map(function (pair) { return pair.join('-'); }).join(', ') || 'none') + '. **Remaining path：** ' + (result.steps.path ? result.steps.path.join(' — ') : 'no path');
    return { q: ['给定 DAG，判断 ' + x + ' 与 ' + y + ' 在 S={' + s.join(', ') + '} 下是否条件独立。', { t: 'html', html: svgMarkup }], check: { type: 'mc', options: ['成立', '不成立'], answer: result.independent ? 0 : 1 }, sol: [{ t: 'steps', items: ['祖先集合为 {' + result.steps.ancestral.join(', ') + '}。', 'moralize 新增边：' + (result.steps.moralEdges.map(function (pair) { return pair.join('-'); }).join(', ') || '无') + '。', explanation] }], answerText: result.independent ? '条件独立成立。' : '条件独立不成立。' };
  }
  function practiceElim(rng) {
    const names = ['A', 'B', 'C', 'D', 'E', 'F'], edges = [];
    for (let i = 0; i < names.length; i++) for (let j = i + 1; j < names.length; j++) if (rng() < .38 || j === i + 1) edges.push([names[i], names[j]]);
    const order = names.slice(); for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const tmp = order[i]; order[i] = order[j]; order[j] = tmp; }
    const result = SML.core.elim.eliminate(edges, order);
    const rows = result.steps.map(function (step) { return [step.node, step.neighbours.join(', ') || '∅', step.fill.map(function (pair) { return pair.join('-'); }).join(', ') || '无', '{' + step.clique.join(', ') + '}']; });
    const blocks = [{ t: 'table', head: ['节点', 'neighbours', 'fill-in', 'clique'], rows: rows }, '**Maximal cliques：** ' + result.maximalCliques.map(function (clique) { return '{' + clique.join(', ') + '}'; }).join('；')];
    return { q: ['无向图 edges：' + edges.map(function (edge) { return edge.join('-'); }).join(', ') + '。消元顺序：' + order.join(', ') + '。写出 elimination trace 与 maximal cliques。'], sol: blocks, answerText: '查看 elimination table 与 maximal cliques。' };
  }
  function practiceCpt(rng) {
    const card = { A: sample(rng, [2, 3]), B: 2, C: 2, D: sample(rng, [2, 3]) };
    const parents = { A: [], B: ['A'], C: ['A'], D: ['B', 'C'] };
    const result = SML.core.cpt.sizes(parents, card);
    const rows = result.tables.map(function (table) { return [table.node, String(card[table.node]), table.parents.join(', ') || '∅', String(table.parentConfigs), '(' + table.shape.join(' × ') + ')', String(table.free)]; });
    return { q: ['给定 DAG A→B，A→C，B→D，C→D。基数为 ' + Object.keys(card).map(function (name) { return name + '=' + card[name]; }).join(', ') + '。求总 free parameters。'], check: { type: 'num', answer: result.totalFree, tol: 0 }, sol: [{ t: 'table', head: ['node', 'cardinality', 'parents', 'parent configs', 'shape', 'free'], rows: rows }, '**合计：** ' + result.totalFree], answerText: String(result.totalFree) };
  }
  SML.practice = SML.practice || { generators: {} };
  SML.practice.register('dsep', practiceDsep);
  SML.practice.register('elim', practiceElim);
  SML.practice.register('cpt', practiceCpt);

  SML.viz = SML.viz || (function () { const registry = {}; return { register: function (id, fn) { registry[id] = fn; }, get: function (id) { return registry[id]; } }; })();
})(window);
