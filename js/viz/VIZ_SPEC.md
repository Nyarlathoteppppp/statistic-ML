# Interactive solver & practice generator spec (for delegates)

Site root: `precious final/sml-review/`. Open `index.html` by double-click (file://), so: **no ES modules, no fetch, no external libraries**. Plain ES2017 in an IIFE. Read these first: `js/ui/md.js`, `js/ui/render.js`, `js/ui/quiz.js`, `css/viz.css`, `css/components.css`, and the `js/core/*.js` module(s) you use (their outputs are already tested by `tests/core.test.js`; reuse them, do not reimplement algorithms).

## Registration
```js
(function (root) {
  'use strict';
  const SML = root.SML;
  SML.viz.register('vc-solver', function mount(el, opts, ctx) { /* build DOM inside el */ });
  SML.practice.register('vc', function (rng, opts) { return { q, check, sol, answerText }; });
})(window);
```
- `el` is an empty `<div class="viz-box">`. Build: `<div class="solver"><div class="solver-head"><span class="title">…</span><div class="tools">…</div></div><div class="solver-body">…</div><div class="solver-out">…</div></div>`.
- Use only CSS classes that exist in `css/viz.css` / `css/components.css` (e.g. `btn`, `btn primary`, `table.dich`, `pat have|miss`, `subset yes|no|cur`, `svg.graph` + `.edge.moral|fill|path|gone`, `.node.given|removed|out|x|y|cur|done`, `bars`/`bar-row`, `svg.plane`, `svg.net`, `stepper`). Colours come from CSS variables — never hard-code colours in JS (except the fixed red/blue classes already in viz.css).
- Math: `SML.md.inline('text with $x^2$')` returns HTML; `SML.md.tex(src, display)` renders LaTeX. Escape user-provided text with `SML.md.esc`.
- Must work at 375px width (wrap controls; SVG uses viewBox + width:100%).
- All UI text in Chinese, technical terms in English where the exam uses them (e.g. "shattered", "dichotomy", "support vectors", "moralize").
- Each solver shows its reasoning **step by step** (that is the teaching value), not only the final answer.

## Practice generator contract
`(rng, opts) → { q, check, sol, answerText }`
- `rng()` returns uniform [0,1); use only it for randomness (reproducible by seed).
- `q`, `sol`: arrays of content blocks for `SML.render.renderBlocks`. Block types: Markdown string; `{t:'table', head:[md], rows:[[md]], cls:'mono'}`; `{t:'math', tex}`; `{t:'steps', items:[md]}`; `{t:'html', html}` (for an inline SVG figure); `{t:'note'|'warn', md}`.
- `check`: `{type:'num', answer, tol}` | `{type:'set', answer:[tokens]}` (order-free, e.g. `['1','2','4']` or `['x1','x3']`) | `{type:'mc', options:[md], answer:index}` | omit for self-check.
- `answerText`: one-line Markdown answer shown with the solution.
- Generate exam-like, hand-computable numbers (closed-book, no calculator: means like 0.5/0.625, N in {1,4,9,16,25,36,64,100}, ln t given in the question).

## Deliverables

### Delegate A (file `js/viz/learn.js`)
1. `vc-solver` — opts `{preset}`; presets: `'L07p29'` (rows 0000,0110,1001,1101,0100,1010,1111,0011,0101,1110), `'EX2026Q3'` (00001,10001,01010,01101,01011,10111,11101,01111), `'EX2021Q16'` (101110,000011,010110,001011,001110,100001,100100,111011). Features: editable dichotomy table (click a cell toggles 0/1; add/remove row; add/remove column), preset selector, "随机表" button. Subset browser grouped by size k (chips coloured shattered/not), clicking a subset highlights its columns, strikes through duplicate restricted rows, and lists the 2^k patterns as have/miss. Summary: VC = d, all maximal shattered sets, counts by size (state explicitly whether the empty set is counted). Uses `SML.core.vc`.
2. `stump-explorer` — L07 p11–p16 data (x: 0,4,−2,1,−3,2; y: +1,−1,+1,+1,−1,−1). Slider/buttons over thresholds, both orientations, show predictions and mistakes table, count unique dichotomies (2n). Uses `SML.core.vc.stumps`, `stumpDichotomies`.
3. `ucb-calc` — opts `{preset}`; preset `'EX2026Q2'` = arms (64,40),(16,10),(4,2). Editable arms (n pulls, s total reward), add/remove arm, `t` defaults to Σn+1 (show this derivation), ln mode: exact vs "考试给的近似值" with an editable ln(t) box (prefill 4.5 for t=85), ρ (default 2), Q0 for unpulled arms. Output: table mean / bonus √(ρ ln t / N) / Q with each substitution written out, horizontal bars (mean + bonus), chosen arm(s). A second small panel: ε-greedy probabilities for the same arms. Uses `SML.core.bandit`.
4. `cnn-counter` — two tabs. (a) 1D diagram: inputs, kernel width, stride, shared on/off, list of dense layers (sizes editable), include-bias toggle; draws the network as `svg.net` (conv edges coloured by shared weight index `w0/w1/w2` classes when shared, grey otherwise); per-layer formula + total. Preset `'EX2026Q1d'`: 7 inputs, kernel 3, stride 1, shared, dense 4, dense 5, no bias → 43. (b) 2D layer stack: rows of {conv: K, Cout, stride, pad | pool: K, stride | dense: out} from an input H×W×C; show output shape and params per layer (formula strings from `SML.core.cnn`). Preset L13 p17 (32×32×1 → conv 5×5×6).
5. `svm-grid` — 0..10 × 0..10 grid (`svg.plane`); click empty cell to add a point (toggle class with a selector: blue −1 / red +1), click a point to remove; numbered labels. Compute `SML.core.svm.hardMargin2D`, draw boundary, the two margin lines, ring support vectors (`.sv`), print w, b, margin 1/‖w‖, and y_i(w·x_i+b) for every point. Non-separable → message. Preset `'EX2026Q1c'`: 1(3,9)−, 2(3,4)−, 6(1,2)−, 3(8,8)+, 4(6,6)+, 5(9,3)+.
6. Practice generators: `vc` (random 4–5 point table, 6–10 rows, ask VC; sol: maximal shattered sets + one restricted table demonstrating shattering + why no larger set), `ucb` (3 arms, ask which arm; give ln t in question; sol: full table), `cnn` (random 1D net or one 2D conv layer, ask parameter count; sol: per-layer formula).

### Delegate B (files `js/viz/graph.js`, `js/viz/pgm.js`)
1. `graph.js`: `SML.vizGraph.draw(svg, {nodes:{id:{x,y}}, edges:[{a,b,directed,cls}], nodeCls:{id:'cls cls'}, r})` — draws edges (straight lines, arrowheads via an SVG marker for directed, shortened to node radius) then nodes (circle + label) into an `<svg class="graph" viewBox=...>`. Pure helper, no state.
2. `dsep-stepper` — opts `{preset}`; presets with fixed coordinates:
   - `'alarm-LBA'`: L20 p14 edges E→R, E→A, B→A, R→L, A→L; query L ⊥ B | A (answer: not independent). Layout like the slide: E top-left, B top-right, R middle-left, A middle-right, L bottom.
   - `'alarm-RAE'`: same graph, query R ⊥ A | E (independent).
   - `'coins'`: X1→X3←X2, query X1 ⊥ X2 | X3 (not independent) and allow switching S to empty (independent).
   - `'EX2026Q4'`: S→V, S→W, T→W, U→V, U→Y, X→Y, V→Z, W→Z, Y→Z; grid layout S(1,0) T(2,0) U(0,1) V(1,1) W(2,1) X(0,2) Y(1,2) Z(2,2); query S ⊥ Z | V, W.
   Controls: X / Y / S selectors (multi-select checkboxes for S), and a stepper: 0 原图 → 1 祖先图 (non-ancestral nodes `.out`) → 2 moralize (married edges `.moral`) → 3 去方向 → 4 删除 S (nodes `.removed`, incident edges `.gone`) → 5 找路径 (path edges `.path`, verdict). Each step prints a one-paragraph explanation, naming the actual nodes (e.g. "V 的父节点 S、U 结婚"). Uses `SML.core.dsep` (its `steps` output).
3. `elim-stepper` — opts `{preset}`; preset `'EX2026Q5'`: edges T–U, T–W, U–V, U–X, V–W, V–Y, V–Z, W–Z, X–Y, Y–Z; layout T(1,0) U(0,0.6) W(2,0.6) V(1,1.1) X(0,1.7) Z(2,1.7) Y(1,2.2); order T,X,Z,U,W,V,Y (editable text box). Stepper: each step highlights the node being eliminated (`.cur`), its current neighbours, adds fill-in edges (`.fill`), greys eliminated nodes (`.done`), appends the clique to a table (node | neighbours | fill-in | clique). Final: maximal cliques and junction-tree edges with separators. Uses `SML.core.elim`.
4. `cpt-counter` — textarea, one node per line `A: S1, S2` (parents after colon; optional `[3]` for cardinality, default 2). Presets `'EX2025Q1e'` (X, Y, Z, V: X, Y), `'EX2026Q6'` (S1,S2,S3,C1,C2 roots; A: S1,S2,S3,C1,C2), `'EX2025Q4'` (A, B, C: A, B). Output table: node | parents | parent configs | table shape (child values × parent configs, as on L20 p11) | entries | free params; totals; comparison with the full joint (entries, free). A short note on the three counting conventions (rows / entries / free parameters).
5. `mle-counter` — parents spec as above + data textarea (header line of variable names, then rows like `F,F,T`). Output: for each node and each parent configuration, counts and MLE as fractions (e.g. 1/2), with "unseen configuration" when total is 0. Preset `'EX2025Q4c'`. Uses `SML.core.cpt.mle`.
6. Practice generators: `dsep` (random DAG 6–7 nodes with ≥1 v-structure, random query with 1–2 conditioned nodes; mc 成立/不成立; sol: ancestral set, married pairs, remaining path or "no path" — include an inline SVG of the DAG via graph.js), `elim` (random 6-node undirected graph + order; self-check; sol: elimination table + maximal cliques), `cpt` (random small DAG + cardinalities; ask total free parameters; sol: per-table table).
