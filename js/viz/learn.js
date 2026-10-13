/* 学习类交互求解器；普通脚本，可在 file:// 下运行。 */
(function (root) {
  'use strict';
  const SML = root.SML;
  const core = SML.core;
  const NS = 'http://www.w3.org/2000/svg';

  function node(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function button(text, fn, cls) {
    const b = node('button', cls || 'btn', text);
    b.type = 'button'; b.addEventListener('click', fn); return b;
  }
  function row(parent) { const r = node('div', 'row'); parent.appendChild(r); return r; }
  function label(parent, text, control) {
    const l = node('label', null, text); l.appendChild(control); parent.appendChild(l); return control;
  }
  function input(parent, text, value, min, max, integer) {
    const n = node('input'); n.type = 'number'; n.value = String(value);
    if (min != null) n.min = String(min);
    if (max != null) n.max = String(max);
    n.step = integer ? '1' : 'any'; label(parent, text, n); return n;
  }
  function select(parent, text, entries, value) {
    const s = node('select');
    entries.forEach(function (e) {
      const o = node('option', null, e[1]); o.value = String(e[0]); s.appendChild(o);
    });
    s.value = String(value); label(parent, text, s); return s;
  }
  function checkbox(parent, text, checked) {
    const n = node('input'); n.type = 'checkbox'; n.checked = checked; label(parent, text, n); return n;
  }
  function number(n, name, min, max, integer) {
    const text = n.value.trim();
    const v = text === '' ? NaN : Number(text);
    if (!Number.isFinite(v) || (integer && !Number.isInteger(v)) || v < min || v > max) {
      throw new Error(name + '须为' + (integer ? '整数' : '有限数字') + '，范围 ' + min + '～' + max + '。');
    }
    return v;
  }
  function fmt(v) {
    if (v === Infinity) return '∞';
    if (v === -Infinity) return '−∞';
    if (v == null) return '—';
    return String(Number(v.toFixed(6)));
  }
  function shell(el, title) {
    const s = node('div', 'solver'), h = node('div', 'solver-head');
    const tools = node('div', 'tools'), body = node('div', 'solver-body'), out = node('div', 'solver-out');
    h.append(node('span', 'title', title), tools); s.append(h, body, out); el.appendChild(s);
    return { tools: tools, body: body, out: out };
  }
  function blocks(parent, content, ctx) {
    parent.innerHTML = ''; parent.appendChild(SML.render.renderBlocks(content, ctx || { h2: 0, toc: [], qn: 0 }));
  }
  function warn(parent, message) { blocks(parent, [{ t: 'warn', md: message }]); }
  function svg(cls, width, height) {
    const s = document.createElementNS(NS, 'svg');
    s.setAttribute('class', cls); s.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    s.setAttribute('width', '100%'); s.setAttribute('role', 'img'); return s;
  }
  function shape(parent, tag, attrs, text) {
    const n = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, String(attrs[k])); });
    if (text != null) n.textContent = text;
    parent.appendChild(n); return n;
  }
  function setText(s) { return s.length ? '{' + s.map(function (i) { return 'x' + (i + 1); }).join(', ') + '}' : '∅'; }
  function maximalSets(a) {
    return a.allShattered.filter(function (s) {
      return !a.allShattered.some(function (t) { return t.length > s.length && s.every(function (i) { return t.indexOf(i) !== -1; }); });
    });
  }
  function subsets(n) {
    const groups = Array.from({ length: n + 1 }, function () { return []; });
    for (let mask = 0; mask < Math.pow(2, n); mask++) {
      const s = [];
      for (let j = 0; j < n; j++) if (mask & (1 << j)) s.push(j);
      groups[s.length].push(s);
    }
    return groups;
  }
  const VC_PRESETS = {
    L07p29: ['0000', '0110', '1001', '1101', '0100', '1010', '1111', '0011', '0101', '1110'],
    EX2026Q3: ['00001', '10001', '01010', '01101', '01011', '10111', '11101', '01111'],
    EX2021Q16: ['101110', '000011', '010110', '001011', '001110', '100001', '100100', '111011']
  };
  function presetRows(key) { return VC_PRESETS[key].map(function (s) { return s.split('').map(Number); }); }

  SML.viz.register('vc-solver', function (el, opts, ctx) {
    opts = opts || {};
    const ui = shell(el, 'VC dimension：浏览所有子集');
    const key = Object.prototype.hasOwnProperty.call(VC_PRESETS, opts.preset) ? opts.preset : 'L07p29';
    let rows = presetRows(key), selected = core.vc.analyze(rows).maxSets[0] || [];
    const presets = select(ui.tools, '预设', [['L07p29', 'L07 p29'], ['EX2026Q3', 'EX2026 Q3'], ['EX2021Q16', 'EX2021 Q16']], key);
    presets.addEventListener('change', function () {
      if (!Object.prototype.hasOwnProperty.call(VC_PRESETS, presets.value)) { warn(ui.out, '请选择有效预设。'); return; }
      rows = presetRows(presets.value); selected = core.vc.analyze(rows).maxSets[0] || []; draw();
    });
    ui.tools.appendChild(button('随机表', function () {
      rows = rows.map(function (r) { return r.map(function () { return Math.random() < 0.5 ? 0 : 1; }); }); draw();
    }));
    const controls = row(ui.body), grid = node('div', 'table-wrap'), browser = node('div');
    ui.body.append(grid, browser);
    const addRow = button('加一行', function () { rows.push(rows[0].map(function () { return 0; })); draw(); });
    const addCol = button('加一列', function () { rows.forEach(function (r) { r.push(0); }); draw(); });
    const delCol = button('删末列', function () { rows.forEach(function (r) { r.pop(); }); selected = selected.filter(function (i) { return i < rows[0].length; }); draw(); });
    controls.append(addRow, addCol, delCol, node('span', null, '点击单元格切换 0/1；最多 8 列、32 行。'));
    function draw() {
      const n = rows[0].length, a = core.vc.analyze(rows), restricted = core.vc.restrict(rows, selected);
      addRow.disabled = rows.length >= 32; addCol.disabled = n >= 8; delCol.disabled = n <= 1;
      grid.innerHTML = '';
      const table = node('table', 'dich'), head = node('thead'), hr = node('tr');
      hr.appendChild(node('th', null, '行'));
      for (let j = 0; j < n; j++) hr.appendChild(node('th', selected.indexOf(j) !== -1 ? 'sel' : '', 'x' + (j + 1)));
      hr.appendChild(node('th', null, '操作')); head.appendChild(hr); table.appendChild(head);
      const tbody = node('tbody'), seen = new Set();
      rows.forEach(function (r, i) {
        const pattern = restricted.patterns[i], tr = node('tr', seen.has(pattern) ? 'dup' : ''); seen.add(pattern);
        tr.appendChild(node('th', null, String(i + 1)));
        r.forEach(function (value, j) {
          const td = node('td', 'edit' + (selected.indexOf(j) !== -1 ? ' sel' : ''), String(value));
          td.tabIndex = 0; td.setAttribute('role', 'button'); td.setAttribute('aria-label', '第' + (i + 1) + '行 x' + (j + 1) + '：' + value + '，点击切换');
          const toggle = function () { rows[i][j] = 1 - rows[i][j]; draw(); };
          td.addEventListener('click', toggle); td.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
          tr.appendChild(td);
        });
        const td = node('td'), remove = button('删行', function () { rows.splice(i, 1); draw(); }); remove.disabled = rows.length <= 1;
        td.appendChild(remove); tr.appendChild(td); tbody.appendChild(tr);
      });
      table.appendChild(tbody); grid.appendChild(table); browser.innerHTML = '';
      subsets(n).forEach(function (group, k) {
        browser.appendChild(node('p', null, 'k = ' + k + '：shattered ' + (a.bySize[k] || 0) + '/' + group.length));
        const list = node('div', 'subset-list');
        group.forEach(function (s) {
          const r = core.vc.restrict(rows, s), current = s.join(',') === selected.join(',');
          const b = button(setText(s), function () { selected = s.slice(); draw(); }, 'subset ' + (r.shattered ? 'yes' : 'no') + (current ? ' cur' : ''));
          b.setAttribute('aria-pressed', String(current)); b.title = r.shattered ? '已 shattered' : '未 shattered'; list.appendChild(b);
        }); browser.appendChild(list);
      });
      blocks(ui.out, [{ t: 'steps', items: [
        '限制到 **' + setText(selected) + '**；选中列高亮。重复的 restricted rows 已划掉，只保留每种模式的首次出现。',
        '不同模式 ' + restricted.unique.length + ' / $2^{' + selected.length + '}=' + restricted.needed + '$：**' + (restricted.shattered ? 'shattered' : '未 shattered') + '**。下列绿色为 have，红色为 miss。',
        '**VC = ' + a.vc + '**。最大大小的 shattered sets：' + a.maxSets.map(setText).join('；') + '。',
        '所有按包含关系 maximal 的 shattered sets：' + maximalSets(a).map(setText).join('；') + '。各大小计数见上方；**计入空集**（k=0，1 个），shattered 总数为 ' + a.allShattered.length + '。没有更大子集 shattered，故 VC 不再增加。'
      ] }], ctx);
      const patterns = node('div', 'patterns');
      for (let i = 0; i < restricted.needed; i++) {
        const p = selected.length ? i.toString(2).padStart(selected.length, '0') : '';
        patterns.appendChild(node('span', 'pat ' + (restricted.unique.indexOf(p) !== -1 ? 'have' : 'miss'), p || '∅'));
      }
      ui.out.appendChild(patterns);
    }
    draw();
  });

  SML.viz.register('stump-explorer', function (el, opts, ctx) {
    const ui = shell(el, 'Decision stump：阈值与方向');
    const xs = [0, 4, -2, 1, -3, 2], ys = [1, -1, 1, 1, -1, -1];
    const fit = core.vc.stumps(xs, ys), dich = core.vc.stumpDichotomies(xs);
    const thresholds = [-Infinity].concat(fit.thresholds, [Infinity]);
    const controls = row(ui.body), slider = node('input'); slider.type = 'range'; slider.min = '0'; slider.max = String(thresholds.length - 1); slider.step = '1'; slider.value = '1'; slider.style.maxWidth = '100%';
    const orientation = select(controls, '方向', [['pos', '右侧 +1'], ['neg', '右侧 −1']], 'pos');
    function move(delta) {
      try { slider.value = String(Math.max(0, Math.min(thresholds.length - 1, number(slider, '阈值位置', 0, thresholds.length - 1, true) + delta))); draw(); }
      catch (e) { warn(ui.out, e.message); }
    }
    const prev = button('上一阈值', function () { move(-1); });
    const next = button('下一阈值', function () { move(1); });
    controls.append(prev, next); label(row(ui.body), '阈值位置', slider);
    slider.addEventListener('input', draw); orientation.addEventListener('change', draw);
    function draw() {
      let index;
      try { index = number(slider, '阈值位置', 0, thresholds.length - 1, true); } catch (e) { warn(ui.out, e.message); return; }
      const beta = thresholds[index], pos = orientation.value === 'pos';
      // 内部阈值直接复用 core 的预测；两端为常数分类器。
      const predictions = index === 0 ? fit.xs.map(function () { return pos ? 1 : -1; }) : index === thresholds.length - 1 ? fit.xs.map(function () { return pos ? -1 : 1; }) : (pos ? fit.predictionsPos : fit.predictionsNeg)[index - 1];
      const mistakes = predictions.reduce(function (sum, y, i) { return sum + (y !== fit.ys[i] ? 1 : 0); }, 0);
      prev.disabled = index === 0; next.disabled = index === thresholds.length - 1;
      blocks(ui.out, [{ t: 'steps', items: [
        '先按 x 排序：' + fit.xs.join('，') + '；候选阈值取相邻不同 x 的中点，再加两端常数情形。',
        '$\\beta=' + (beta === Infinity ? '\\infty' : beta === -Infinity ? '-\\infty' : beta) + '$；规则：x > β 时预测 ' + (pos ? '+1' : '−1') + '，否则 ' + (pos ? '−1' : '+1') + '。',
        '逐点比较预测与标签：当前 **' + mistakes + '/6** 个错误。内部阈值最优为 β=' + fit.best.beta + '、右侧 −1，错误 ' + fit.best.mistakes + '。',
        '两个方向共 2(n+1) 个候选，但两端常数模式重复，故 unique dichotomies = **' + dich.length + ' = 2n**（n=6；按原输入次序列出 +/− 模式）。'
      ] }, { t: 'table', head: ['x（排序后）', '真实 y', '预测', '错误？'], rows: fit.xs.map(function (x, i) { return [String(x), fmt(fit.ys[i]), fmt(predictions[i]), predictions[i] === fit.ys[i] ? '否' : '是']; }) },
      { t: 'table', head: ['原输入顺序的 unique dichotomy'], rows: dich.map(function (p) { return [p]; }), cls: 'mono' }], ctx);
    }
    draw();
  });

  function ucbTable(result, rho) {
    return { t: 'table', head: ['臂', 'N，s', '均值 s/N', 'bonus √(ρ ln t/N)', 'Q = 均值 + bonus'], rows: result.arms.map(function (a, i) {
      if (!a.n) return [String(i + 1), '0，' + fmt(a.s), '未拉取', '不计算', '$Q_0=' + (a.Q === Infinity ? '\\infty' : a.Q === -Infinity ? '-\\infty' : fmt(a.Q)) + '$'];
      return [String(i + 1), a.n + '，' + fmt(a.s), a.s + '/' + a.n + ' = ' + fmt(a.mean),
        '$\\sqrt{' + rho + '\\times ' + fmt(result.lnT) + '/' + a.n + '}=' + fmt(a.bonus) + '$',
        fmt(a.mean) + ' + ' + fmt(a.bonus) + ' = **' + fmt(a.Q) + '**'];
    }) };
  }
  function initialQ(n) {
    const s = n.value.trim();
    if (/^(?:\+?Infinity|\+?∞)$/i.test(s)) return Infinity;
    if (/^(?:-Infinity|[-−]∞)$/i.test(s)) return -Infinity;
    return number(n, 'Q0（也可填 Infinity 或 -Infinity）', -1e9, 1e9, false);
  }
  SML.viz.register('ucb-calc', function (el, opts, ctx) {
    opts = opts || {};
    const ui = shell(el, 'UCB 与 ε-greedy');
    let arms = [{ n: '64', s: '40' }, { n: '16', s: '10' }, { n: '4', s: '2' }];
    ui.tools.appendChild(button('EX2026 Q2', function () { arms = [{ n: '64', s: '40' }, { n: '16', s: '10' }, { n: '4', s: '2' }]; auto.checked = true; mode.value = 'exam'; ln.value = '4.5'; rho.value = '2'; q0.value = 'Infinity'; buildArms(); draw(); }));
    const armBox = node('div'); ui.body.appendChild(armBox);
    const add = button('加一臂', function () { arms.push({ n: '0', s: '0' }); buildArms(); draw(); }); ui.tools.appendChild(add);
    const r = row(ui.body), auto = checkbox(r, 't 自动取 ΣN+1', true);
    const t = input(r, 't', 85, 1, 1e9, true), rho = input(r, 'ρ', 2, 0, 100, false);
    const lr = row(ui.body), mode = select(lr, 'ln 模式', [['exact', '精确 ln(t)'], ['exam', '考试给的近似值']], opts.preset === 'EX2026Q2' ? 'exam' : 'exact');
    const ln = input(lr, 'ln(t)', 4.5, 0, 1000, false);
    const qr = row(ui.body), q0 = node('input'); q0.type = 'text'; q0.value = 'Infinity'; q0.style.maxWidth = '10em'; label(qr, '未拉取臂 Q0', q0);
    const eps = input(qr, 'ε', 0.1, 0, 1, false);
    [auto, t, rho, mode, ln, q0, eps].forEach(function (n) { n.addEventListener('change', draw); });
    function buildArms() {
      armBox.innerHTML = ''; add.disabled = arms.length >= 10;
      arms.forEach(function (a, i) {
        const r = row(armBox); r.appendChild(node('strong', null, '臂 ' + (i + 1)));
        const ni = input(r, 'N', a.n, 0, 1e6, true), si = input(r, '总奖励 s', a.s, -1e9, 1e9, false);
        ni.addEventListener('change', function () { a.n = ni.value; draw(); });
        si.addEventListener('change', function () { a.s = si.value; draw(); });
        const remove = button('删臂', function () { arms.splice(i, 1); buildArms(); draw(); }); remove.disabled = arms.length <= 1; r.appendChild(remove);
      });
    }
    function draw() {
      t.disabled = auto.checked; ln.disabled = mode.value === 'exact';
      try {
        const parsed = arms.map(function (a, i) {
          const n = number({ value: a.n }, '臂 ' + (i + 1) + ' 的 N', 0, 1e6, true), s = number({ value: a.s }, '臂 ' + (i + 1) + ' 的 s', -1e9, 1e9, false);
          if (n === 0 && s !== 0) throw new Error('未拉取臂的总奖励 s 必须为 0。');
          return { n: n, s: s };
        });
        const sum = parsed.reduce(function (acc, a) { return acc + a.n; }, 0);
        if (auto.checked) t.value = String(sum + 1);
        const time = number(t, 't', 1, 1e9, true), rr = number(rho, 'ρ', 0, 100, false), initial = initialQ(q0), epsilon = number(eps, 'ε', 0, 1, false);
        const options = { t: time, rho: rr, Q0: initial };
        if (mode.value === 'exam') { options.ln = {}; options.ln[time] = number(ln, 'ln(t) 近似值', 0, 1000, false); }
        const result = core.bandit.ucb(parsed, options), greedy = core.bandit.greedyChoice(parsed, initial), probs = core.bandit.epsGreedyProbs(parsed, epsilon, initial);
        blocks(ui.out, [{ t: 'steps', items: [
          '累计拉取次数：' + parsed.map(function (a) { return a.n; }).join(' + ') + ' = ' + sum + '；下一轮 **t = ' + sum + '+1 = ' + (sum + 1) + '**。' + (auto.checked ? '当前采用自动值。' : '当前手动指定 t=' + time + '。'),
          '采用 ' + (mode.value === 'exam' ? '考试给的近似值' : '精确值') + '：ln(' + time + ') = ' + fmt(result.lnT) + '，ρ=' + rr + '。每个已拉取臂先计算 s/N，再加探索 bonus。',
          '比较 Q；选择 **臂 ' + result.choice.map(function (i) { return i + 1; }).join('、') + '**。并列最大时均为合法选择；N=0 的臂直接使用 Q0，不做除零运算。'
        ] }, ucbTable(result, rr)], ctx);
        const finite = result.arms.filter(function (a) { return a.n > 0; });
        const low = Math.min.apply(null, [0].concat(finite.map(function (a) { return a.mean; }))), high = Math.max.apply(null, [0].concat(finite.map(function (a) { return a.Q; })));
        const span = high - low || 1, bars = node('div', 'bars');
        result.arms.forEach(function (a, i) {
          const r = node('div', 'bar-row' + (result.choice.indexOf(i) !== -1 ? ' pick' : '')), track = node('div', 'bar-track');
          if (a.n) {
            const mean = node('div', 'bar-mean'), bonus = node('div', 'bar-bonus');
            mean.style.left = (Math.min(0, a.mean) - low) / span * 100 + '%'; mean.style.width = Math.abs(a.mean) / span * 100 + '%';
            bonus.style.left = (a.mean - low) / span * 100 + '%'; bonus.style.width = a.bonus / span * 100 + '%'; track.append(mean, bonus);
          }
          r.append(node('span', null, '臂 ' + (i + 1)), track, node('span', 'val', 'Q=' + fmt(a.Q))); bars.appendChild(r);
        });
        ui.out.append(node('p', null, '条形：均值 + bonus；统一横轴 ' + fmt(low) + '～' + fmt(high) + '。未拉取臂仅显示 Q0。'), bars);
        const panel = node('div', 'card'); ui.out.appendChild(panel);
        blocks(panel, ['**ε-greedy：同一组臂**',
          '先按均值（未拉取用 Q0）选 greedy 最大臂：' + greedy.map(function (i) { return i + 1; }).join('、') + '。探索概率 ε/K，剩余 1−ε 在 ' + greedy.length + ' 个并列 greedy 臂间均分。',
          { t: 'table', head: ['臂', '概率代入', '概率'], rows: probs.map(function (p, i) { return [String(i + 1), epsilon + '/' + arms.length + (greedy.indexOf(i) !== -1 ? ' + (1−' + epsilon + ')/' + greedy.length : ''), fmt(p)]; }) }], ctx);
      } catch (e) { warn(ui.out, e.message); }
    }
    buildArms(); draw();
  });

  function networkDiagram(trace, kernel, stride, shared) {
    const sizes = [trace.layers[0].inputs].concat(trace.layers.map(function (l) { return l.outputs; }));
    const width = Math.max(360, sizes.length * 105), height = Math.max(160, Math.max.apply(null, sizes) * 22 + 65);
    const s = svg('net', width, height); s.setAttribute('aria-label', '一维卷积和 dense 层连接图');
    const px = function (l) { return 45 + l * (width - 90) / (sizes.length - 1); };
    const py = function (l, j) { return 45 + (height - 70 - (sizes[l] - 1) * 22) / 2 + j * 22; };
    for (let l = 1; l < sizes.length; l++) {
      for (let j = 0; j < sizes[l]; j++) {
        const first = l === 1 ? j * stride : 0, last = l === 1 ? first + kernel : sizes[l - 1];
        for (let k = first; k < last; k++) {
          const line = shape(s, 'line', { x1: px(l - 1), y1: py(l - 1, k), x2: px(l), y2: py(l, j), 'class': l === 1 && shared ? 'w' + ((k - first) % 3) : '' });
          shape(line, 'title', {}, l === 1 ? (shared ? '共享 w' + (k - first) : '独立 w(' + (j + 1) + ',' + (k - first) + ')') : '独立 dense 权重');
          if (l === 1 && j === 0 && shared) shape(s, 'text', { x: px(0) * 0.65 + px(1) * 0.35, y: py(0, k) * 0.65 + py(1, j) * 0.35 - 3 }, 'w' + (k - first));
        }
      }
    }
    sizes.forEach(function (size, l) {
      shape(s, 'text', { x: px(l), y: 20, 'text-anchor': 'middle' }, (l === 0 ? '输入 ' : l === 1 ? '卷积 ' : 'dense ') + size);
      for (let j = 0; j < size; j++) {
        const circle = shape(s, 'circle', { cx: px(l), cy: py(l, j), r: 6 });
        shape(circle, 'title', {}, '第 ' + (l + 1) + ' 列，单元 ' + (j + 1));
      }
    });
    return s;
  }
  SML.viz.register('cnn-counter', function (el, opts, ctx) {
    opts = opts || {};
    const ui = shell(el, 'CNN 参数计数');
    let tab = opts.preset === 'L13p17' ? 'two' : 'one';
    const onePanel = node('div'), twoPanel = node('div'); ui.body.append(onePanel, twoPanel);
    const oneTab = button('一维网络', function () { tab = 'one'; draw(); });
    const twoTab = button('二维层栈', function () { tab = 'two'; draw(); }); ui.tools.append(oneTab, twoTab);
    const a = row(onePanel), inputs = input(a, '输入单元', 7, 1, 24, true), kernel = input(a, 'kernel 宽', 3, 1, 12, true), stride = input(a, 'stride', 1, 1, 24, true);
    const b = row(onePanel), shared = checkbox(b, '共享卷积权重', true), bias = checkbox(b, '计入 bias', false);
    let dense = ['4', '5']; const denseBox = node('div'); onePanel.appendChild(denseBox);
    const denseTools = row(onePanel), addDense = button('加 dense 层', function () { dense.push('4'); buildDense(); draw(); }); denseTools.appendChild(addDense);
    denseTools.appendChild(button('EX2026 Q1d', function () { inputs.value = '7'; kernel.value = '3'; stride.value = '1'; shared.checked = true; bias.checked = false; dense = ['4', '5']; buildDense(); draw(); }));
    const c = row(twoPanel), H = input(c, '输入 H', 32, 1, 512, true), W = input(c, 'W', 32, 1, 512, true), C = input(c, 'C', 1, 1, 256, true);
    twoPanel.appendChild(node('p', null, '二维 conv 与 dense 默认计入每个输出通道/单元的 bias；pool 无参数。dense 前自动 flatten。'));
    let stack = [{ type: 'conv', K: '5', Cout: '6', stride: '1', pad: '0', out: '4' }];
    const stackBox = node('div'); twoPanel.appendChild(stackBox);
    const stackTools = row(twoPanel), newType = select(stackTools, '新增层类型', [['conv', '卷积 conv'], ['pool', '池化 pool'], ['dense', '全连接 dense']], 'conv');
    const addLayer = button('加一层', function () { stack.push({ type: newType.value, K: '2', Cout: '6', stride: '2', pad: '0', out: '4' }); buildStack(); draw(); }); stackTools.appendChild(addLayer);
    stackTools.appendChild(button('L13 p17', function () { H.value = '32'; W.value = '32'; C.value = '1'; stack = [{ type: 'conv', K: '5', Cout: '6', stride: '1', pad: '0', out: '4' }]; buildStack(); draw(); }));
    [inputs, kernel, stride, shared, bias, H, W, C].forEach(function (n) { n.addEventListener('change', draw); });
    function buildDense() {
      denseBox.innerHTML = ''; addDense.disabled = dense.length >= 4;
      dense.forEach(function (value, i) {
        const r = row(denseBox), size = input(r, 'dense ' + (i + 1) + ' 输出', value, 1, 24, true);
        size.addEventListener('change', function () { dense[i] = size.value; draw(); });
        r.appendChild(button('删层', function () { dense.splice(i, 1); buildDense(); draw(); }));
      });
    }
    function buildStack() {
      stackBox.innerHTML = ''; addLayer.disabled = stack.length >= 8;
      stack.forEach(function (l, i) {
        const r = row(stackBox); r.appendChild(node('strong', null, '层 ' + (i + 1)));
        const type = select(r, '类型', [['conv', '卷积 conv'], ['pool', '池化 pool'], ['dense', '全连接 dense']], l.type);
        type.addEventListener('change', function () { l.type = type.value; buildStack(); draw(); });
        function field(key, text, min, max) {
          const n = input(r, text, l[key], min, max, true);
          n.addEventListener('change', function () { l[key] = n.value; draw(); });
        }
        if (l.type === 'dense') field('out', '输出单元', 1, 4096);
        else {
          field('K', 'K', 1, 64); field('stride', 'stride', 1, 64);
          if (l.type === 'conv') { field('Cout', '输出通道', 1, 512); field('pad', 'pad', 0, 64); }
        }
        r.appendChild(button('删层', function () { stack.splice(i, 1); buildStack(); draw(); }));
      });
    }
    function drawOne() {
      const ni = number(inputs, '输入单元', 1, 24, true), k = number(kernel, 'kernel', 1, 12, true), st = number(stride, 'stride', 1, 24, true);
      if (k > ni) throw new Error('kernel 不能大于输入长度。');
      const layers = [{ type: 'conv1d', inputs: ni, kernel: k, stride: st, shared: shared.checked }].concat(dense.map(function (d, i) { return { type: 'dense', out: number({ value: d }, 'dense ' + (i + 1) + ' 输出', 1, 24, true) }; }));
      const result = core.cnn.network(layers, { bias: bias.checked }), out = result.layers[0].outputs;
      blocks(ui.out, [{ t: 'steps', items: [
        '卷积输出个数：$\\lfloor(' + ni + '-' + k + ')/' + st + '\\rfloor+1=' + out + '$。每个输出连接 ' + k + ' 个相邻输入。',
        shared.checked ? '共享时每个 kernel 位置只有一个权重，共 ' + k + ' 个；相同 w 索引的边共享权重。' + (k > 3 ? 'CSS 只有 w0/w1/w2 三种权重颜色，K>3 时颜色循环（同色不一定同权重）；首个输出的连线标有真实索引，悬停也可查看。' : 'w0 / w1 / w2 分别用现有三种边色。') : '不共享时每个卷积输出有自己的一组权重，共 ' + out + '×' + k + ' 个；边显示为灰色。',
        'dense 权重 = 输入数 × 输出数。' + (bias.checked ? '共享卷积加 1 个 bias；不共享卷积及 dense 为每个输出加 1 个 bias。' : '本题不计 bias。') + '连接图仅绘制权重边。'
      ] }, { t: 'table', head: ['层', '输入 → 输出', '参数公式'], rows: result.layers.map(function (l, i) { return [(i + 1) + '：' + (l.type === 'conv1d' ? '卷积' : 'dense'), l.inputs + ' → ' + l.outputs, l.formula]; }) },
      '**总参数 = ' + result.layers.map(function (l) { return l.params; }).join(' + ') + ' = ' + result.total + '**。'], ctx);
      ui.out.insertBefore(networkDiagram(result, k, st, shared.checked), ui.out.firstChild);
    }
    function drawTwo() {
      let h = number(H, '输入 H', 1, 512, true), w = number(W, '输入 W', 1, 512, true), channels = number(C, '输入 C', 1, 256, true), spatial = true, total = 0;
      const traces = [], explanations = ['输入 shape：' + h + '×' + w + '×' + channels + '。'];
      stack.forEach(function (l, i) {
        const prefix = '层 ' + (i + 1) + ' ', inputShape = spatial ? h + '×' + w + '×' + channels : String(channels);
        function value(key, min, max) { return number({ value: l[key] }, prefix + key, min, max, true); }
        let result, outputShape, formula;
        if (l.type === 'dense') {
          const count = h * w * channels, out = value('out', 1, 4096);
          result = core.cnn.network([{ type: 'dense', inputs: count, out: out }], { bias: true });
          formula = result.layers[0].formula; total += result.total; outputShape = String(out);
          explanations.push(prefix + 'flatten：' + h + '×' + w + '×' + channels + '=' + count + '，dense 参数按输入×输出 + 输出 bias 计算。');
          traces.push([String(i + 1), 'dense', inputShape, outputShape, formula]); h = 1; w = 1; channels = out; spatial = false;
        } else {
          if (!spatial) throw new Error('dense 后不能再接二维 conv/pool；请删除或调整这些层。');
          const k = value('K', 1, 64), st = value('stride', 1, 64), pad = l.type === 'conv' ? value('pad', 0, 64) : 0;
          if (h + 2 * pad < k || w + 2 * pad < k) throw new Error(prefix + 'kernel 大于加 padding 后的输入尺寸。');
          result = l.type === 'conv' ? core.cnn.conv2d({ H: h, W: w, Cin: channels, K: k, Cout: value('Cout', 1, 512), stride: st, pad: pad }) : core.cnn.pool2d({ H: h, W: w, C: channels, K: k, stride: st });
          formula = l.type === 'conv' ? result.formula : '0（pool 无可学习参数）'; total += result.params;
          outputShape = result.outH + '×' + result.outW + '×' + result.outC;
          explanations.push(prefix + '输出 H：⌊(' + h + '+2×' + pad + '−' + k + ')/' + st + '⌋+1=' + result.outH + '；W：⌊(' + w + '+2×' + pad + '−' + k + ')/' + st + '⌋+1=' + result.outW + '。' + (l.type === 'conv' ? '每个 filter 跨全部 ' + channels + ' 个输入通道；参数数目与空间输出大小无关。' : '池化只改变空间尺寸，保留通道数。'));
          traces.push([String(i + 1), l.type, inputShape, outputShape, formula]); h = result.outH; w = result.outW; channels = result.outC;
        }
      });
      blocks(ui.out, [{ t: 'steps', items: explanations }, { t: 'table', head: ['层', '类型', '输入 shape', '输出 shape', '参数公式'], rows: traces }, '**总参数 = ' + total + '**。'], ctx);
    }
    function draw() {
      onePanel.hidden = tab !== 'one'; twoPanel.hidden = tab !== 'two';
      oneTab.className = tab === 'one' ? 'btn primary' : 'btn'; twoTab.className = tab === 'two' ? 'btn primary' : 'btn';
      oneTab.setAttribute('aria-pressed', String(tab === 'one')); twoTab.setAttribute('aria-pressed', String(tab === 'two'));
      try { if (tab === 'one') drawOne(); else drawTwo(); } catch (e) { warn(ui.out, e.message); }
    }
    buildDense(); buildStack(); draw();
  });

  function svmPreset() {
    return [{ id: 1, x: [3, 9], y: -1 }, { id: 2, x: [3, 4], y: -1 }, { id: 6, x: [1, 2], y: -1 },
      { id: 3, x: [8, 8], y: 1 }, { id: 4, x: [6, 6], y: 1 }, { id: 5, x: [9, 3], y: 1 }];
  }
  // 仅用于把 core 返回的直线裁剪到绘图区，不求解 SVM。
  function clippedLine(w, b, level) {
    const points = [], c = level - b;
    function add(x, y) {
      if (x < -1e-8 || x > 10 + 1e-8 || y < -1e-8 || y > 10 + 1e-8) return;
      if (!points.some(function (p) { return Math.abs(p[0] - x) + Math.abs(p[1] - y) < 1e-8; })) points.push([Math.max(0, Math.min(10, x)), Math.max(0, Math.min(10, y))]);
    }
    if (Math.abs(w[1]) > 1e-12) { add(0, c / w[1]); add(10, (c - 10 * w[0]) / w[1]); }
    if (Math.abs(w[0]) > 1e-12) { add(c / w[0], 0); add((c - 10 * w[1]) / w[0], 10); }
    return points.length >= 2 ? points.slice(0, 2) : [];
  }
  SML.viz.register('svm-grid', function (el, opts, ctx) {
    const ui = shell(el, 'Hard-margin SVM：点击整数网格');
    let points = svmPreset(), nextId = 7;
    const addClass = select(ui.tools, '新增点类别', [['-1', '蓝色 −1'], ['1', '红色 +1']], '-1');
    ui.tools.appendChild(button('EX2026 Q1c', function () { points = svmPreset(); nextId = 7; draw(); }));
    ui.tools.appendChild(button('清空', function () { points = []; nextId = 1; draw(); }));
    ui.body.appendChild(node('p', null, '点击空格交点新增，点击已有点删除；编号保持不变。最多 40 点，以免穷举求解阻塞页面。'));
    const plane = svg('plane', 380, 380); plane.setAttribute('aria-label', '0 到 10 的二维分类网格'); ui.body.appendChild(plane);
    const px = function (x) { return 30 + 32 * x; }, py = function (y) { return 350 - 32 * y; };
    plane.addEventListener('click', function (e) {
      let target = e.target;
      while (target && target !== plane) {
        if (target.getAttribute && target.hasAttribute('data-point')) {
          const id = Number(target.getAttribute('data-point'));
          if (!Number.isInteger(id)) return;
          points = points.filter(function (p) { return p.id !== id; }); draw(); return;
        }
        target = target.parentNode;
      }
      try {
        if (!Number.isFinite(e.clientX) || !Number.isFinite(e.clientY)) return;
        const matrix = plane.getScreenCTM(); if (!matrix) return;
        const cursor = plane.createSVGPoint(); cursor.x = e.clientX; cursor.y = e.clientY;
        const local = cursor.matrixTransform(matrix.inverse());
        if (!Number.isFinite(local.x) || !Number.isFinite(local.y)) return;
        const x = Math.round((local.x - 30) / 32), y = Math.round((350 - local.y) / 32);
        if (x < 0 || x > 10 || y < 0 || y > 10) return;
        const existing = points.find(function (p) { return p.x[0] === x && p.x[1] === y; });
        if (existing) { points = points.filter(function (p) { return p !== existing; }); draw(); return; }
        const cls = number(addClass, '类别', -1, 1, true);
        if (cls !== -1 && cls !== 1) throw new Error('类别必须为 −1 或 +1。');
        if (points.length >= 40) throw new Error('已达 40 点，请先删除一些点。');
        points.push({ id: nextId++, x: [x, y], y: cls }); draw();
      } catch (err) { warn(ui.out, '无法新增点：' + err.message); }
    });
    function draw() {
      plane.innerHTML = '';
      for (let i = 0; i <= 10; i++) {
        shape(plane, 'line', { x1: px(i), y1: py(0), x2: px(i), y2: py(10), 'class': i === 0 ? 'axis' : 'gridline' });
        shape(plane, 'line', { x1: px(0), y1: py(i), x2: px(10), y2: py(i), 'class': i === 0 ? 'axis' : 'gridline' });
        shape(plane, 'text', { x: px(i), y: 369, 'class': 'tick' }, i);
        shape(plane, 'text', { x: 13, y: py(i), 'class': 'tick' }, i);
      }
      let result = null;
      if (!points.some(function (p) { return p.y === 1; }) || !points.some(function (p) { return p.y === -1; })) {
        blocks(ui.out, [{ t: 'note', md: '请至少添加一个蓝色 −1 点和一个红色 +1 点，才能求解 hard-margin SVM。' }], ctx);
      } else {
        try { result = core.svm.hardMargin2D(points); }
        catch (e) { warn(ui.out, '当前两类点不是线性可分的：不存在同时满足所有 $y_i(w\\cdot x_i+b)\\geq1$ 的 hard-margin 超平面。请调整点。'); }
      }
      if (result) {
        [0, -1, 1].forEach(function (level) {
          const ends = clippedLine(result.w, result.b, level);
          if (ends.length === 2) shape(plane, 'line', { x1: px(ends[0][0]), y1: py(ends[0][1]), x2: px(ends[1][0]), y2: py(ends[1][1]), 'class': level === 0 ? 'boundary' : 'marginline' });
        });
        const w = result.w, b = result.b, norm = Math.sqrt(w[0] * w[0] + w[1] * w[1]);
        blocks(ui.out, [{ t: 'steps', items: [
          '使用 canonical scale：所有点满足 $y_i(w\\cdot x_i+b)\\geq1$，使 $\\|w\\|$ 最小。core 求得 $w=(' + fmt(w[0]) + ',' + fmt(w[1]) + ')$，$b=' + fmt(b) + '$。',
          '实线为 $w\\cdot x+b=0$；虚线为 $w\\cdot x+b=\\pm1$。单侧几何 margin：$1/\\|w\\|=1/' + fmt(norm) + '=' + fmt(result.margin) + '$；两侧总间距为 ' + fmt(2 * result.margin) + '。',
          '逐点代入如下。等于 1 的点为 support vectors：**' + result.supportVectors.slice().sort(function (a, b) { return a - b; }).join('、') + '**，图上加外圈。'
        ] }, { t: 'table', head: ['点', '(x₁,x₂)，y', 'yᵢ(w·xᵢ+b) 的代入', 'support vector？'], rows: points.map(function (p) {
          const value = p.y * (w[0] * p.x[0] + w[1] * p.x[1] + b);
          return [String(p.id), '(' + p.x.join(',') + ')，' + p.y,
            p.y + '×(' + fmt(w[0]) + '×' + p.x[0] + ' + ' + fmt(w[1]) + '×' + p.x[1] + ' + (' + fmt(b) + ')) = ' + fmt(value), result.supportVectors.indexOf(p.id) !== -1 ? '是' : '否'];
        }) }], ctx);
      }
      points.forEach(function (p) {
        const g = shape(plane, 'g', { 'data-point': p.id }); g.style.cursor = 'pointer';
        shape(g, 'circle', { cx: px(p.x[0]), cy: py(p.x[1]), r: 11, 'class': (p.y === 1 ? 'pos' : 'neg') + (result && result.supportVectors.indexOf(p.id) !== -1 ? ' sv' : '') });
        shape(g, 'text', { x: px(p.x[0]), y: py(p.x[1]) }, p.id);
        shape(g, 'title', {}, '点 ' + p.id + '：(' + p.x.join(',') + ')，类别 ' + p.y + '；点击删除');
      });
    }
    draw();
  });

  function pick(rng, items) { return items[Math.floor(rng() * items.length)]; }
  function shuffle(rng, items) {
    const a = items.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)), temp = a[i]; a[i] = a[j]; a[j] = temp; }
    return a;
  }
  function dichTable(rows, subset) {
    const columns = subset || rows[0].map(function (_, i) { return i; });
    return { t: 'table', head: ['行'].concat(columns.map(function (i) { return '$x_' + (i + 1) + '$'; })), rows: rows.map(function (r, i) { return [String(i + 1)].concat(columns.map(function (j) { return String(r[j]); })); }), cls: 'mono' };
  }
  SML.practice.register('vc', function (rng, opts) {
    const n = pick(rng, [4, 5]), count = pick(rng, [6, 7, 8, 9, 10]);
    const pool = Array.from({ length: Math.pow(2, n) }, function (_, i) { return i.toString(2).padStart(n, '0').split('').map(Number); });
    const rows = shuffle(rng, pool).slice(0, count), a = core.vc.analyze(rows), witness = a.maxSets[0], restriction = core.vc.restrict(rows, witness);
    const larger = a.vc < n ? subsets(n)[a.vc + 1] : [];
    const obstruction = { t: 'table', head: ['大小 VC+1 的子集', '不同模式 / 所需', '至少一个缺失模式'], rows: larger.map(function (s) {
      const r = core.vc.restrict(rows, s); let missing = '';
      for (let i = 0; i < r.needed; i++) {
        const p = i.toString(2).padStart(s.length, '0');
        if (r.unique.indexOf(p) === -1) { missing = p; break; }
      }
      return [setText(s), r.unique.length + ' / ' + r.needed, '`' + missing + '`'];
    }), cls: 'mono' };
    return {
      q: ['下面列出假设类在 ' + n + ' 个点上的全部 dichotomies。求 **VC dimension**（输入一个整数）。', dichTable(rows)],
      check: { type: 'num', answer: a.vc, tol: 0 },
      answerText: '$\\VC=' + a.vc + '$。',
      sol: [{ t: 'steps', items: [
        '逐个限制到列子集，只有出现全部 $2^k$ 个模式才是 shattered。计入空集，各 k 的 shattered 数：' + Array.from({ length: n + 1 }, function (_, k) { return k + '→' + (a.bySize[k] || 0); }).join('，') + '。',
        '最大大小的 shattered sets：' + a.maxSets.map(setText).join('；') + '。所有按包含关系 maximal 的 sets：' + maximalSets(a).map(setText).join('；') + '。',
        '以 ' + setText(witness) + ' 为证据，下面 restricted table 的不同模式为 ' + restriction.unique.map(function (p) { return '`' + (p || '∅') + '`'; }).join('，') + '；共 ' + restriction.unique.length + ' = $2^{' + a.vc + '}$，所以 VC 至少为 ' + a.vc + '。',
        larger.length ? '下表逐一排除所有大小 ' + (a.vc + 1) + ' 的子集。shattering 对子集封闭，因此任何更大的集合也不可能 shattered。结合下界，VC=' + a.vc + '。' : '已经达到全部 ' + n + ' 列，域内不存在更大的子集，所以 VC=' + a.vc + '。'
      ] }, dichTable(rows, witness)].concat(larger.length ? [obstruction] : [])
    };
  });

  SML.practice.register('ucb', function (rng, opts) {
    // 固定 ΣN=84，使 ln(85)≈4.5 合理；bonus 为 3/√N，可手算。
    const pulls = shuffle(rng, [4, 16, 64]);
    const arms = pulls.map(function (n) { return { n: n, s: n * pick(rng, n === 4 ? [0.25, 0.5, 0.75, 1] : [0.25, 0.5, 0.625, 0.75, 1]) }; });
    const result = core.bandit.ucb(arms, { rho: 2, ln: { 85: 4.5 } }), chosen = result.choice.map(function (i) { return String(i + 1); });
    return {
      q: ['三臂 bandit 的累计数据如下。下一轮用 UCB，$\\rho=2$；给定 $\\ln(85)\\approx4.5$。应选择哪些臂？若并列请填写所有编号。',
        { t: 'table', head: ['臂', 'N', '累计奖励 s'], rows: arms.map(function (a, i) { return [String(i + 1), String(a.n), fmt(a.s)]; }) }],
      check: { type: 'set', answer: chosen }, answerText: '臂 **' + chosen.join('、') + '**。',
      sol: [{ t: 'steps', items: [
        '$t=' + arms.map(function (a) { return a.n; }).join('+') + '+1=85$。',
        '对每个臂计算 $Q=s/N+\\sqrt{2\\ln(t)/N}$。给定近似值使 bonus 为 $\\sqrt{9/N}=3/\\sqrt N$，下表逐项代入。',
        '取 Q 最大的臂：' + chosen.join('、') + '；若并列，全部都是最大化选择。'
      ] }, ucbTable(result, 2)]
    };
  });

  SML.practice.register('cnn', function (rng, opts) {
    if (rng() < 0.5) {
      const inputs = pick(rng, [5, 7, 9]), k = pick(rng, [2, 3]), stride = pick(rng, [1, 2]), shared = rng() < 0.5, bias = rng() < 0.5;
      const layers = [{ type: 'conv1d', inputs: inputs, kernel: k, stride: stride, shared: shared }, { type: 'dense', out: pick(rng, [2, 3, 4, 5]) }];
      if (rng() < 0.5) layers.push({ type: 'dense', out: pick(rng, [2, 3, 4]) });
      const result = core.cnn.network(layers, { bias: bias }), outputs = result.layers[0].outputs;
      return {
        q: ['一维网络：输入 ' + inputs + ' 单元 → conv（kernel=' + k + '，stride=' + stride + '，无 padding，**' + (shared ? '共享' : '不共享') + '**权重） → ' + layers.slice(1).map(function (l) { return 'dense ' + l.out; }).join(' → ') + '。**' + (bias ? '计入' : '不计') + ' bias**，求可训练参数总数。'],
        check: { type: 'num', answer: result.total, tol: 0 }, answerText: '**' + result.total + '** 个参数。',
        sol: [{ t: 'steps', items: [
          'conv 输出：$\\lfloor(' + inputs + '-' + k + ')/' + stride + '\\rfloor+1=' + outputs + '$。',
          shared ? '共享时卷积只有 ' + k + ' 个权重，不乘输出位置数。' + (bias ? '共享 bias 另加 1。' : '本题不计 bias。') : '不共享时卷积权重为 ' + outputs + '×' + k + '。' + (bias ? '另加 ' + outputs + ' 个 bias。' : '本题不计 bias。'),
          'dense 每层权重为输入×输出；' + (bias ? '每个输出另加一个 bias。' : '不加 bias。')
        ] }, { t: 'table', head: ['层', '输入 → 输出', '参数公式'], rows: result.layers.map(function (l, i) { return [String(i + 1), l.inputs + ' → ' + l.outputs, l.formula]; }) },
        '**总计：' + result.layers.map(function (l) { return l.params; }).join(' + ') + ' = ' + result.total + '**。']
      };
    }
    const options = { H: pick(rng, [8, 12, 16, 32]), W: pick(rng, [8, 12, 16, 32]), Cin: pick(rng, [1, 2, 3]), K: pick(rng, [2, 3, 5]), Cout: pick(rng, [2, 4, 6]), stride: pick(rng, [1, 2]), pad: pick(rng, [0, 1]) };
    const result = core.cnn.conv2d(options);
    return {
      q: ['二维卷积：输入 ' + options.H + '×' + options.W + '×' + options.Cin + '，' + options.Cout + ' 个 ' + options.K + '×' + options.K + ' filters，stride=' + options.stride + '，pad=' + options.pad + '。权重共享，**计入 bias**。求可训练参数总数。'],
      check: { type: 'num', answer: result.params, tol: 0 }, answerText: '**' + result.params + '** 个参数。',
      sol: [{ t: 'steps', items: [
        '输出 H：⌊(' + options.H + '+2×' + options.pad + '−' + options.K + ')/' + options.stride + '⌋+1=' + result.outH + '；输出 W：⌊(' + options.W + '+2×' + options.pad + '−' + options.K + ')/' + options.stride + '⌋+1=' + result.outW + '。输出 shape 为 ' + result.outH + '×' + result.outW + '×' + result.outC + '。',
        '每个 filter 跨全部 ' + options.Cin + ' 个输入通道，所以权重为 ' + options.Cout + '×' + options.Cin + '×' + options.K + '²=' + result.weights + '；每个 filter 一个 bias，共 ' + result.biases + '。',
        'core 参数公式：**' + result.formula + '**。共享卷积参数与输出空间位置数无关，不能再乘输出 H×W。'
      ] }]
    };
  });
})(window);
