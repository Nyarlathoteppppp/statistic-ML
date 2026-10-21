/* W12 chapter visualisation (L23): a 3-node Bayesian-network lab on the first three columns of the L23 p9 data.
 * bn3-lab — opts.mode: 'equiv' (c60: skeleton, immoral v-structures, p7 class),
 *                      'score' (c61: + local counts, log-likelihood, BIC),
 *                      'search' (c62: + Bayesian score with adjustable α, enumeration of all 25 DAGs). */
(function (root) {
  'use strict';
  const SML = root.SML;

  /* L23 p9, rows 1–6, columns x1, x2, x3; cardinalities read off the visible rows. */
  const DATA = [[2, 2, 1], [1, 2, 2], [1, 1, 1], [2, 2, 3], [1, 2, 2], [1, 1, 3]];
  const R = [2, 2, 3];
  const T = DATA.length;
  const PAIRS = [[0, 1], [0, 2], [1, 2]];
  const NAME = ['x₁', 'x₂', 'x₃'];
  const TEX = ['x_1', 'x_2', 'x_3'];

  function node(tag, cls, html) { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function btn(text, fn, cls) { const b = node('button', cls || 'btn', text); b.type = 'button'; b.addEventListener('click', fn); return b; }
  const md = (s) => SML.md.md(s);
  const inline = (s) => SML.md.inline(s);
  const f3 = (v) => (Number.isFinite(v) ? (Math.abs(v) < 5e-4 ? '0' : v.toFixed(3)) : '—');

  /* log Γ(x), Lanczos (g = 7). */
  const LG = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  function logGamma(x) {
    if (x < 0.5) return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) - logGamma(1 - x);
    x -= 1; let a = LG[0]; const t = x + 7.5;
    for (let i = 1; i < 9; i++) a += LG[i] / (x + i);
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
  }

  /* state: one entry per pair, 0 = no edge, 1 = a→b, 2 = b→a. */
  function edgesOf(state) {
    const out = [];
    state.forEach((s, p) => { const [a, b] = PAIRS[p]; if (s === 1) out.push([a, b]); else if (s === 2) out.push([b, a]); });
    return out;
  }
  function parentsOf(edges) { const pa = [[], [], []]; edges.forEach(([a, b]) => pa[b].push(a)); pa.forEach((p) => p.sort()); return pa; }
  function acyclic(edges) {
    const perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
    return perms.some((perm) => edges.every(([a, b]) => perm.indexOf(a) < perm.indexOf(b)));
  }
  function skeleton(edges) { return edges.map(([a, b]) => (a < b ? a + '-' + b : b + '-' + a)).sort(); }
  function immoral(edges) {
    const sk = new Set(skeleton(edges)), pa = parentsOf(edges), out = [];
    pa.forEach((ps, c) => {
      for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
        const a = ps[i], b = ps[j];
        if (!sk.has(a + '-' + b)) out.push([a, c, b]);
      }
    });
    return out;
  }
  const keyOf = (edges) => skeleton(edges).join(',') + '|' + immoral(edges).map((v) => v.join('')).join(',');

  /* All 25 DAGs, and the 11 classes numbered in the order of the boxes on L23 p7. */
  const ALL = [];
  (function () {
    for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) for (let c = 0; c < 3; c++) {
      const st = [a, b, c], e = edgesOf(st);
      if (acyclic(e)) ALL.push(st);
    }
  })();
  const REPS = [[], [[1, 0], [2, 0]], [[0, 1], [2, 1]], [[0, 2], [1, 2]], [[0, 1]], [[0, 2]], [[1, 2]],
    [[0, 1], [0, 2]], [[0, 1], [1, 2]], [[2, 0], [2, 1]], [[0, 1], [0, 2], [1, 2]]];
  const CLASS_OF = {};
  REPS.forEach((e, i) => { CLASS_OF[keyOf(e)] = i + 1; });
  const CLASS_NOTE = ['空图', '$x_1$ 处的 v 结构', '$x_2$ 处的 v 结构', '$x_3$ 处的 v 结构', '一条边 $x_1$—$x_2$', '一条边 $x_1$—$x_3$',
    '一条边 $x_2$—$x_3$', '一串，中心 $x_1$', '一串，中心 $x_2$', '一串，中心 $x_3$', '三角形'];

  /* Local scores of node i given parent list pa. */
  function local(i, pa, alpha) {
    const q = pa.reduce((m, p) => m * R[p], 1), r = R[i];
    const cnt = {};
    DATA.forEach((row) => {
      let j = 0, mult = 1;
      pa.forEach((p) => { j += (row[p] - 1) * mult; mult *= R[p]; });
      const key = j; if (!cnt[key]) cnt[key] = new Array(r).fill(0);
      cnt[key][row[i] - 1]++;
    });
    let l = 0, bayes = 0;
    const ajk = alpha / (r * q), aj = alpha / q;
    Object.keys(cnt).forEach((j) => {
      const c = cnt[j], nj = c.reduce((s, v) => s + v, 0);
      c.forEach((v) => { if (v) l += v * Math.log(v / nj); });
      bayes += logGamma(aj) - logGamma(aj + nj);
      c.forEach((v) => { bayes += logGamma(ajk + v) - logGamma(ajk); });
    });
    const pen = (r - 1) * q / 2 * Math.log(T);
    return { q: q, cnt: cnt, l: l, pen: pen, bic: l - pen, bayes: bayes, ajk: ajk };
  }
  /* Readable counts: for each parent configuration seen, the counts of x_i = 1..r_i. */
  function countText(i, pa, cnt) {
    const keys = Object.keys(cnt).map(Number).sort((a, b) => a - b);
    return keys.map((j) => {
      let rest = j; const vals = pa.map((p) => { const v = rest % R[p] + 1; rest = Math.floor(rest / R[p]); return v; });
      const head = pa.length ? '(' + vals.join(',') + ')' : '全部';
      return head + '：[' + cnt[j].join(', ') + ']';
    }).join('；');
  }
  function graphTotals(state, alpha) {
    const pa = parentsOf(edgesOf(state));
    const loc = pa.map((p, i) => local(i, p, alpha));
    return { pa: pa, loc: loc, l: loc.reduce((s, x) => s + x.l, 0), bic: loc.reduce((s, x) => s + x.bic, 0), bayes: loc.reduce((s, x) => s + x.bayes, 0) };
  }
  const edgeTex = (edges) => (edges.length ? edges.map(([a, b]) => TEX[a] + '\\to ' + TEX[b]).join(',\\ ') : '\\text{无边}');

  SML.viz.register('bn3-lab', function (el, opts) {
    opts = opts || {};
    const mode = opts.mode === 'score' || opts.mode === 'search' ? opts.mode : 'equiv';
    let state = mode === 'equiv' ? [1, 0, 1] : mode === 'score' ? [2, 0, 0] : [0, 0, 0];
    let alpha = 4, ranking = null, rankBy = 'bic';

    const box = node('div', 'solver'), head = node('div', 'solver-head');
    const tools = node('div', 'tools'), body = node('div', 'solver-body'), out = node('div', 'solver-out');
    head.append(node('span', 'title', mode === 'equiv' ? '三个节点的等价类（L23 p7）' : mode === 'score' ? '课件数据上的局部分数（L23 p17–p22）' : '三个节点的结构搜索（L23 p20–p30）'), tools);
    box.append(head, body, out); el.appendChild(box);

    const pairBtns = PAIRS.map((pr, p) => btn('', () => { state[p] = (state[p] + 1) % 3; ranking = null; draw(); }));
    pairBtns.forEach((b) => tools.appendChild(b));
    tools.appendChild(btn('清空', () => { state = [0, 0, 0]; ranking = null; draw(); }));
    let alphaInput = null;
    if (mode === 'search') {
      const lab = node('label', null, '<span>α =</span>');
      alphaInput = node('input'); alphaInput.type = 'number'; alphaInput.min = '0.1'; alphaInput.step = '0.5'; alphaInput.value = String(alpha);
      alphaInput.addEventListener('change', () => { const v = parseFloat(alphaInput.value); if (v > 0) { alpha = v; if (ranking) rank(rankBy); else draw(); } });
      lab.appendChild(alphaInput); tools.appendChild(lab);
      tools.appendChild(btn('枚举 25 张 DAG（BIC）', () => rank('bic'), 'btn primary'));
      tools.appendChild(btn('枚举（Bayesian score）', () => rank('bayes')));
    }
    const svgWrap = node('div'); body.appendChild(svgWrap);
    if (mode !== 'equiv') {
      body.appendChild(node('div', 'small muted', md('数据（课件 p9 前 6 行的 $x_1,x_2,x_3$，$T=6$）：' + DATA.map((r, t) => '第 ' + (t + 1) + ' 行 $(' + r.join(',') + ')$').join('，') + '。$r_1=r_2=2$，$r_3=3$；对数取 $\\ln$。')));
    }

    function rank(by) {
      rankBy = by;
      ranking = ALL.map((st) => { const g = graphTotals(st, alpha); return { st: st, bic: g.bic, bayes: g.bayes, l: g.l, cls: CLASS_OF[keyOf(edgesOf(st))] }; })
        .sort((a, b) => b[by] - a[by]);
      draw();
    }

    function draw() {
      PAIRS.forEach(([a, b], p) => {
        const s = state[p];
        pairBtns[p].textContent = NAME[a] + '—' + NAME[b] + '：' + (s === 0 ? '无边' : s === 1 ? NAME[a] + '→' + NAME[b] : NAME[b] + '→' + NAME[a]);
      });
      const edges = edgesOf(state), ok = acyclic(edges), imm = ok ? immoral(edges) : [];
      const immEdges = new Set(); imm.forEach(([a, c, b]) => { immEdges.add(a + '>' + c); immEdges.add(b + '>' + c); });
      svgWrap.innerHTML = '';
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      SML.vizGraph.draw(svg, {
        nodes: { x1: { x: 40, y: 40 }, x2: { x: 160, y: 40 }, x3: { x: 100, y: 130 } }, labels: { x1: 'x₁', x2: 'x₂', x3: 'x₃' }, r: 18,
        edges: edges.map(([a, b]) => ({ a: 'x' + (a + 1), b: 'x' + (b + 1), directed: true, cls: !ok ? 'path' : immEdges.has(a + '>' + b) ? 'hl' : '' })),
      });
      svg.style.maxWidth = '240px';
      svgWrap.appendChild(svg);

      let h = '';
      if (!ok) {
        h += '<div class="callout warn"><div class="ctitle">有环</div>' + md('$' + edgeTex(edges) + '$ 顺着箭头能走回起点（红色），不是 DAG，不能做 BN。结构搜索必须排除这种图（p30 的全局约束）。') + '</div>';
        out.innerHTML = h; return;
      }
      const cls = CLASS_OF[keyOf(edges)];
      const members = ALL.filter((st) => CLASS_OF[keyOf(edgesOf(st))] === cls);
      h += md('当前图：$' + edgeTex(edges) + '$。') +
        '<div class="readout">' +
        '<div><span>骨架（擦掉箭头）</span><b>' + (edges.length ? skeleton(edges).map((s) => s.split('-').map((v) => NAME[+v]).join('—')).join('，') : '无边') + '</b></div>' +
        '<div><span>immoral v 结构</span><b>' + (imm.length ? imm.map(([a, c, b]) => NAME[a] + '→' + NAME[c] + '←' + NAME[b]).join('，') : '无') + '</b></div>' +
        '<div><span>p7 的第几类</span><b>' + cls + ' / 11</b></div>' +
        '<div><span>这一类有几张 DAG</span><b>' + members.length + '</b></div></div>';
      h += md('第 ' + cls + ' 类（' + CLASS_NOTE[cls - 1] + '）的全部成员：' + members.map((st) => '$' + edgeTex(edgesOf(st)) + '$').join('；') + '。它们骨架相同、immoral v 结构相同，所以等价（p6）。' +
        (imm.length ? '蓝色的边组成 immoral v 结构：两个父节点不相连。' : ''));

      if (mode !== 'equiv') {
        const g = graphTotals(state, alpha);
        const rows = g.pa.map((pa, i) => {
          const L = g.loc[i];
          const cells = ['$' + TEX[i] + '$', pa.length ? '$\\{' + pa.map((p) => TEX[p]).join(',') + '\\}$' : '$\\varnothing$', String(L.q), countText(i, pa, L.cnt), f3(L.l), f3(L.pen), f3(L.bic)];
          if (mode === 'search') cells.push(f3(L.bayes));
          return '<tr>' + cells.map((c) => '<td>' + inline(c) + '</td>').join('') + '</tr>';
        });
        const headCells = ['节点', '父节点', '$q_i$', '计数：父节点取值 → [各取值的行数]', '$l(\\hat\\theta)$', '惩罚', 'BIC'];
        if (mode === 'search') headCells.push('Bayes（$\\alpha=' + alpha + '$）');
        const tot = ['<b>合计</b>', '', '', '整张图 = 三行相加（可分解）', f3(g.l), '', '<b>' + f3(g.bic) + '</b>'];
        if (mode === 'search') tot.push('<b>' + f3(g.bayes) + '</b>');
        h += '<div class="table-wrap"><table class="compact"><thead><tr>' + headCells.map((c) => '<th>' + inline(c) + '</th>').join('') + '</tr></thead><tbody>' +
          rows.join('') + '<tr>' + tot.map((c) => '<td>' + (c.indexOf('<b>') === 0 ? c : inline(c)) + '</td>').join('') + '</tr></tbody></table></div>';
        h += md('惩罚 $=\\frac{(r_i-1)q_i}{2}\\ln6$；BIC = $l$ − 惩罚。' + (mode === 'search' ? 'Bayesian score 用 p28 的闭式解，$\\alpha_{ijk}=\\alpha/(r_iq_i)$。' : '') + '改一条边，只有箭头指向的那个节点的一行会变。');
      }
      if (mode === 'search' && ranking) {
        const best = ranking[0][rankBy];
        const list = ranking.slice(0, 10).map((r, i) => {
          const tie = Math.abs(r[rankBy] - best) < 1e-9 ? '（并列第一）' : '';
          return '<tr><td>' + (i + 1) + '</td><td>' + inline('$' + edgeTex(edgesOf(r.st)) + '$') + tie + '</td><td>' + r.cls + '</td><td>' + f3(r.l) + '</td><td>' + f3(r.bic) + '</td><td>' + f3(r.bayes) + '</td></tr>';
        });
        h += md('**按 ' + (rankBy === 'bic' ? 'BIC' : 'Bayesian score（$\\alpha=' + alpha + '$）') + ' 排序的前 10 张 DAG**（全部 25 张都算过）。同一类的图分数相同：') +
          '<div class="table-wrap"><table class="compact"><thead><tr><th>名次</th><th>DAG</th><th>p7 类</th><th>' + inline('$l(\\hat\\theta)$') + '</th><th>BIC</th><th>Bayes</th></tr></thead><tbody>' + list.join('') + '</tbody></table></div>';
        const top = ranking.filter((r) => Math.abs(r[rankBy] - best) < 1e-9);
        if (new Set(top.map((r) => r.cls)).size > 1) {
          h += md('注意：并列第一的图分属不同的类（看"p7 类"一列）。这是这 6 行数据里 $x_1$、$x_2$ 两列的计数恰好对称造成的巧合，不是等价；等价的图在任何数据上都同分。');
        }
        const tb = node('div', 'row');
        h += '<div class="small muted">点下面的按钮把最高分的图画到上面：</div>';
        out.innerHTML = h;
        top.forEach((r) => tb.appendChild(btn(edgesOf(r.st).map(([a, b]) => NAME[a] + '→' + NAME[b]).join('，') || '无边', () => { state = r.st.slice(); draw(); })));
        out.appendChild(tb);
        return;
      }
      out.innerHTML = h;
    }
    draw();
  });
})(window);
