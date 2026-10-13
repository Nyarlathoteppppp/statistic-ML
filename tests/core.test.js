/* Core algorithm tests. Run: node tests/core.test.js
 * Every expected number comes from a lecture slide (Lxx pN) or a past exam (EX....).
 * The modules in js/core/ must work both in the browser (attach to window.SML.core)
 * and in Node (module.exports). No dependencies. */
'use strict';
const path = require('path');
const load = (name) => require(path.join(__dirname, '..', 'js', 'core', name + '.js'));

let pass = 0, fail = 0;
const failures = [];
function test(name, fn) {
  try { fn(); pass++; }
  catch (e) { fail++; failures.push(name + '\n    ' + (e && e.message)); }
}
function eq(actual, expected, msg) {
  const a = JSON.stringify(actual), b = JSON.stringify(expected);
  if (a !== b) throw new Error((msg || '') + ' expected ' + b + ' got ' + a);
}
function near(actual, expected, tol, msg) {
  if (typeof actual !== 'number' || !Number.isFinite(actual) || !(Math.abs(actual - expected) <= (tol || 1e-9)))
    throw new Error((msg || '') + ' expected ≈' + expected + ' got ' + actual);
}
function ok(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }
const sortSets = (sets) => sets.map((s) => s.slice().sort()).sort((a, b) => a.join().localeCompare(b.join()));
const rows = (strs) => strs.map((s) => s.split('').map(Number));

/* ───────────── vc.js ───────────── */
const vc = load('vc');

// Past exam tables, transcribed from the 160/300-dpi images (exam_figs/).
const T2026 = rows(['00001', '10001', '01010', '01101', '01011', '10111', '11101', '01111']);
const T2021 = rows(['101110', '000011', '010110', '001011', '001110', '100001', '100100', '111011']);
// L07 p29, columns x1..x4.
const TL07 = rows(['0000', '0110', '1001', '1101', '0100', '1010', '1111', '0011', '0101', '1110']);

test('vc.restrict: L07 p29 dropping x3 leaves 8 unique rows on (x1,x2,x4)', () => {
  const r = vc.restrict(TL07, [0, 1, 3]);
  eq(r.patterns.length, 10, 'restricted rows (with duplicates)');
  eq(r.unique.length, 8, 'unique patterns');
  ok(r.shattered, 'should be shattered');
});
test('vc.analyze: L07 p29 VC = 3', () => {
  eq(vc.analyze(TL07).vc, 3);
});
test('vc.analyze: EX2026P Q3 / EX2025P Q3 VC = 2, x5 in no shattered pair', () => {
  const a = vc.analyze(T2026);
  eq(a.vc, 2);
  eq(sortSets(a.maxSets), [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]);
});
test('vc.analyze: EX2021 Q16 VC = 3, shattered sets 1+6+11+2', () => {
  const a = vc.analyze(T2021);
  eq(a.vc, 3);
  eq(sortSets(a.maxSets), [[0, 2, 3], [0, 2, 5]]);
  eq(a.bySize, { 0: 1, 1: 6, 2: 11, 3: 2 });
  eq(a.allShattered.length, 20);
});
test('vc.stumps: L07 p13–p14 mistake counts for both orientations', () => {
  const xs = [0, 4, -2, 1, -3, 2], ys = [1, -1, 1, 1, -1, -1];
  const r = vc.stumps(xs, ys);
  eq(r.thresholds, [-2.5, -1, 0.5, 1.5, 3]);
  eq(r.mistakesPos, [2, 3, 4, 5, 4]);   // sgn(x - β)
  eq(r.mistakesNeg, [4, 3, 2, 1, 2]);   // sgn(β - x)
  eq(r.best, { orientation: 'neg', beta: 1.5, mistakes: 1 });
});
test('vc.stumpDichotomies: L07 p16/p19 growth function 2n', () => {
  eq(vc.stumpDichotomies([-3, -2, 0, 1, 2, 4]).length, 12);
  eq(vc.stumpDichotomies([1, 2, 3]).length, 6);
});

/* ───────────── bandit.js ───────────── */
const bandit = load('bandit');

test('bandit.ucb: EX2026P Q2 with exam ln approximations → arm 3', () => {
  const r = bandit.ucb([{ n: 64, s: 40 }, { n: 16, s: 10 }, { n: 4, s: 2 }], { ln: { 85: 4.5 } });
  eq(r.t, 85, 't = total pulls + 1');
  near(r.arms[0].Q, 1.0, 1e-9); near(r.arms[1].Q, 1.375, 1e-9); near(r.arms[2].Q, 2.0, 1e-9);
  near(r.arms[2].bonus, 1.5, 1e-9);
  eq(r.choice, [2]);
});
test('bandit.ucb: exact ln gives same choice', () => {
  const r = bandit.ucb([{ n: 64, s: 40 }, { n: 16, s: 10 }, { n: 4, s: 2 }]);
  near(r.arms[0].Q, 0.625 + Math.sqrt(2 * Math.log(85) / 64), 1e-12);
  eq(r.choice, [2]);
});
test('bandit.ucb: unpulled arm uses Q0 (L17 p18), rho replaces 2 (L17 p22)', () => {
  const r = bandit.ucb([{ n: 0, s: 0 }, { n: 4, s: 4 }], { Q0: 10, rho: 1, t: 5 });
  eq(r.arms[0].Q, 10);
  near(r.arms[1].Q, 1 + Math.sqrt(Math.log(5) / 4), 1e-12);
});
test('bandit.greedyValues: L17 p8–p9 Q0 = ±Infinity behaviour', () => {
  // Pessimistic: after pulling arm 0 once (reward 0.3), arm 0 is the unique argmax.
  eq(bandit.greedyChoice([{ n: 1, s: 0.3 }, { n: 0, s: 0 }, { n: 0, s: 0 }], -Infinity), [0]);
  // Optimistic: unpulled arms tie at +Infinity and beat arm 0.
  eq(bandit.greedyChoice([{ n: 1, s: 0.3 }, { n: 0, s: 0 }, { n: 0, s: 0 }], Infinity), [1, 2]);
});

/* ───────────── cnn.js ───────────── */
const cnn = load('cnn');

test('cnn.network: EX2026P Q1d / EX2025P Q5 = 3 + 20 + 20 = 43 (no bias)', () => {
  const r = cnn.network([
    { type: 'conv1d', inputs: 7, kernel: 3, stride: 1, shared: true },
    { type: 'dense', out: 4 },
    { type: 'dense', out: 5 },
  ], { bias: false });
  eq(r.layers.map((l) => l.params), [3, 20, 20]);
  eq(r.layers[0].outputs, 5);
  eq(r.total, 43);
});
test('cnn.network: unshared conv would be 15 (common mistake)', () => {
  const r = cnn.network([{ type: 'conv1d', inputs: 7, kernel: 3, stride: 1, shared: false }], { bias: false });
  eq(r.total, 15);
});
test('cnn.conv2d: L13 p17 32×32×1, 6 filters 5×5, stride 1 → 28×28×6, 150 weights (+6 bias)', () => {
  const l = cnn.conv2d({ H: 32, W: 32, Cin: 1, K: 5, Cout: 6, stride: 1, pad: 0 });
  eq([l.outH, l.outW, l.outC], [28, 28, 6]);
  eq(l.weights, 150); eq(l.biases, 6); eq(l.params, 156);
});
test('cnn.pool2d: WS08 p3 LeNet 8@28×28 → max-pool 2×2 stride 2 → 8@14×14', () => {
  const p = cnn.pool2d({ H: 28, W: 28, C: 8, K: 2, stride: 2 });
  eq([p.outH, p.outW, p.outC, p.params], [14, 14, 8, 0]);
});

/* ───────────── svm.js ───────────── */
const svm = load('svm');

test('svm.hardMargin2D: EX2026P Q1c → boundary x = 4.5, SV = points 1,2,4', () => {
  const pts = [
    { id: 1, x: [3, 9], y: -1 }, { id: 2, x: [3, 4], y: -1 }, { id: 3, x: [8, 8], y: 1 },
    { id: 4, x: [6, 6], y: 1 }, { id: 5, x: [9, 3], y: 1 }, { id: 6, x: [1, 2], y: -1 },
  ];
  const r = svm.hardMargin2D(pts);
  near(r.margin, 1.5, 1e-9, 'geometric margin 1/||w||');
  near(r.w[1], 0, 1e-9, 'vertical boundary');
  near(-r.b / r.w[0], 4.5, 1e-9, 'x-intercept');
  eq(r.supportVectors.slice().sort(), [1, 2, 4]);
  // canonical scaling: y_i (w·x_i + b) = 1 on SVs (L08 p20)
  for (const p of pts) if ([1, 2, 4].includes(p.id)) near(p.y * (r.w[0] * p.x[0] + r.w[1] * p.x[1] + r.b), 1, 1e-9);
});
test('svm.hinge / distance: L08 p17, p31', () => {
  eq(svm.hinge(1, 2), 0); eq(svm.hinge(1, 0.25), 0.75); eq(svm.hinge(-1, 0.5), 1.5);
  near(svm.distance([3, 4], 0, [3, 4]), 5, 1e-12); // (w·x+b)/||w|| = 25/5
});

/* ───────────── dsep.js ───────────── */
const dsep = load('dsep');
const ALARM = [['E', 'R'], ['E', 'A'], ['B', 'A'], ['R', 'L'], ['A', 'L']]; // L20 p14
const EX26Q4 = [['S', 'V'], ['S', 'W'], ['T', 'W'], ['U', 'V'], ['U', 'Y'], ['X', 'Y'], ['V', 'Z'], ['W', 'Z'], ['Y', 'Z']];

test('dsep: L20 p18–p21 L ⊥ B | A does NOT hold; marriages E–B, R–A', () => {
  const r = dsep.dsep(ALARM, ['L'], ['B'], ['A']);
  eq(r.independent, false);
  eq(r.steps.ancestral.slice().sort(), ['A', 'B', 'E', 'L', 'R']);
  eq(r.steps.moralEdges.map((e) => e.slice().sort().join('')).sort(), ['AR', 'BE']);
  eq(r.steps.path, ['L', 'R', 'E', 'B']);
});
test('dsep: L20 p22–p25 R ⊥ A | E holds; L dropped from ancestral graph', () => {
  const r = dsep.dsep(ALARM, ['R'], ['A'], ['E']);
  eq(r.independent, true);
  eq(r.steps.ancestral.slice().sort(), ['A', 'B', 'E', 'R']);
  eq(r.steps.path, null);
});
test('dsep: L20 p12–p13 coins X1 ⊥ X2 holds, X1 ⊥ X2 | X3 does not', () => {
  const g = [['X1', 'X3'], ['X2', 'X3']];
  eq(dsep.dsep(g, ['X1'], ['X2'], []).independent, true);
  eq(dsep.dsep(g, ['X1'], ['X2'], ['X3']).independent, false);
});
test('dsep: EX2026P Q4 S ⊥ Z | V,W does NOT hold (path S–U–Y–Z)', () => {
  const r = dsep.dsep(EX26Q4, ['S'], ['Z'], ['V', 'W']);
  eq(r.independent, false);
  eq(r.steps.path, ['S', 'U', 'Y', 'Z']);
  eq(r.steps.moralEdges.map((e) => e.slice().sort().join('')).sort(), ['ST', 'SU', 'UX', 'VW', 'VY', 'WY']);
});
test('dsep.moralize: L20 p39–p40 BN→MRF adds x2–x3', () => {
  const m = dsep.moralize([['x1', 'x2'], ['x2', 'x4'], ['x3', 'x4']]);
  eq(m.added.map((e) => e.slice().sort().join('-')), ['x2-x3']);
  eq(m.edges.length, 4);
});

/* ───────────── elim.js ───────────── */
const elim = load('elim');
const EX26Q5 = [['T', 'U'], ['T', 'W'], ['U', 'V'], ['U', 'X'], ['V', 'W'], ['V', 'Y'], ['V', 'Z'], ['W', 'Z'], ['X', 'Y'], ['Y', 'Z']];

test('elim: EX2026P Q5 order T,X,Z,U,W,V,Y', () => {
  const r = elim.eliminate(EX26Q5, ['T', 'X', 'Z', 'U', 'W', 'V', 'Y']);
  eq(r.steps.map((s) => s.clique.slice().sort().join('')), ['TUW', 'UXY', 'VWYZ', 'UVWY', 'VWY', 'VY', 'Y']);
  eq(r.steps.map((s) => s.fill.map((e) => e.slice().sort().join('')).sort()), [['UW'], ['UY'], ['WY'], [], [], [], []]);
  eq(r.maximalCliques.map((c) => c.slice().sort().join('')).sort(), ['TUW', 'UVWY', 'UXY', 'VWYZ']);
  eq(r.junctionTree.edges.length, 3, 'tree over 4 cliques');
});

test('elim: L22 p6–p17 order x1..x5 → maximal cliques {1,2,3},{2,3,4},{3,4,5}', () => {
  const g = [['1', '2'], ['1', '3'], ['2', '4'], ['3', '4'], ['3', '5'], ['4', '5']];
  const r = elim.eliminate(g, ['1', '2', '3', '4', '5']);
  eq(r.steps.map((s) => s.clique.slice().sort().join('')), ['123', '234', '345', '45', '5']);
  eq(r.steps[0].fill.map((e) => e.slice().sort().join('')), ['23']); // x2–x3 added when eliminating x1
  eq(r.maximalCliques.map((c) => c.slice().sort().join('')), ['123', '234', '345']);
  // L22 p20–p22: maximum-weight spanning tree keeps c1–c2 (|∩|=2) and c2–c3 (|∩|=2), drops c1–c3 (|∩|=1)
  eq(r.junctionTree.edges.map((e) => e.separator.slice().sort().join('')).sort(), ['23', '34']);
});

/* ───────────── cpt.js ───────────── */
const cpt = load('cpt');

test('cpt.sizes: EX2025P Q1e P(X)P(Y)P(Z)P(V|X,Y) → 14 rows, 7 free params', () => {
  const r = cpt.sizes({ X: [], Y: [], Z: [], V: ['X', 'Y'] }, { X: 2, Y: 2, Z: 2, V: 2 });
  eq(r.tables.length, 4);
  eq(r.totalEntries, 14); eq(r.totalFree, 7);
  eq(r.tables.find((t) => t.node === 'V').shape, [2, 4]); // L20 p11 layout: child values × parent configs
});
test('cpt.joint: EX2025P Q1d 4 Booleans → 16 rows, 15 free', () => {
  eq(cpt.joint({ X: 2, Y: 2, Z: 2, V: 2 }), { entries: 16, free: 15 });
});
test('cpt.sizes: EX2026P Q6 five sensors → A: 32 parent configs', () => {
  const r = cpt.sizes({ S1: [], S2: [], S3: [], C1: [], C2: [], A: ['S1', 'S2', 'S3', 'C1', 'C2'] }, null);
  eq(r.tables.length, 6);
  const a = r.tables.find((t) => t.node === 'A');
  eq(a.parentConfigs, 32); eq(a.shape, [2, 32]); eq(a.free, 32);
  eq(r.totalEntries, 74); eq(r.totalFree, 37);
});
test('cpt.mle: EX2025P Q4c five complete observations', () => {
  const data = [['F', 'F', 'F'], ['F', 'F', 'T'], ['F', 'T', 'F'], ['T', 'F', 'T'], ['T', 'T', 'T']]
    .map(([A, B, C]) => ({ A, B, C }));
  const r = cpt.mle({ A: [], B: [], C: ['A', 'B'] }, data, { A: ['F', 'T'], B: ['F', 'T'], C: ['F', 'T'] });
  eq(r.A[''].counts, { F: 3, T: 2 });
  near(r.A[''].p.T, 0.4); near(r.B[''].p.T, 0.4);
  eq(r.C['F,F'].counts, { F: 1, T: 1 }); near(r.C['F,F'].p.T, 0.5);
  near(r.C['F,T'].p.T, 0); near(r.C['T,F'].p.T, 1); near(r.C['T,T'].p.T, 1);
});

/* ───────────── perceptron.js ───────────── */
const perceptron = load('perceptron');

test('perceptron.step: L10 p35–p39 example 2 (η = 0.1, bias input 1)', () => {
  // weights as [w0, w1, w2]; points (x1, x2) with labels
  const data = [{ x: [1, 1], y: -1 }, { x: [2, 1], y: 1 }, { x: [1.5, 0.5], y: 1 }];
  const r = perceptron.train(data, [-0.1, 0.2, 0.0], 0.1, { epochs: 1, order: [0, 1, 2] });
  near(r.steps[0].ys, -0.1, 1e-12); eq(r.steps[0].updated, true);
  r.steps[0].w.forEach((v, i) => near(v, [-0.2, 0.1, -0.1][i], 1e-12));
  near(r.steps[1].ys, -0.1, 1e-12); eq(r.steps[1].updated, true);
  r.steps[1].w.forEach((v, i) => near(v, [-0.1, 0.3, 0.0][i], 1e-12));
  near(r.steps[2].ys, 0.35, 1e-12); eq(r.steps[2].updated, false);
});
test('perceptron.loss: L10 p14 max(0, -s y)', () => {
  eq(perceptron.loss(2, 1), 0); eq(perceptron.loss(-2, 1), 2); eq(perceptron.loss(0.5, -1), 0.5);
});

/* ───────────── stats.js (L15) ───────────── */
const stats = load('stats');
const A1 = [11, 7, 13, 12, 12, 9, 10, 7, 10], A2 = [10, 8, 12, 10, 11, 9, 13, 7, 9], A1b = [10, 12, 14, 13, 13, 10, 11, 10, 11];

test('stats.variance: L15 p29 uses population variance (÷m): 4.1, 3.2, 2.0', () => {
  near(stats.variance(A1), 4.1, 0.01); near(stats.variance(A2), 3.2, 0.02); near(stats.variance(A1b), 2.0, 0.03);
});
test('stats.welch: L15 p29 x ≈ 0.22, ν = 16 (from 15.8, rounded up)', () => {
  const r = stats.welch({ mean: 10.1, var: 4.1 }, { mean: 9.9, var: 3.2 }, 9);
  near(r.x, 0.22, 0.005); near(r.nuRaw, 15.76, 0.01); eq(r.nu, 16);
});
test('stats.welch: L15 p30 x ≈ 2.24, ν = 16 (from 15.2, rounded up)', () => {
  const r = stats.welch({ mean: 11.6, var: 2 }, { mean: 9.9, var: 3.2 }, 9);
  near(r.x, 2.24, 0.005); eq(r.nu, 16);
});
test('stats.errorBar: L15 p31 10.1 ± 1.26 with critical value 1.86', () => {
  near(stats.errorBar(10.1, 4.1, 9, 1.86).half, 1.26, 0.005);
  near(stats.errorBar(9.9, 3.2, 9, 1.86).half, 1.11, 0.005);
});
test('stats.metrics: precision/recall/specificity from a confusion matrix (L15 p6–p8)', () => {
  const m = stats.metrics({ TP: 8, FP: 2, TN: 5, FN: 4 });
  near(m.precision, 0.8); near(m.recall, 8 / 12); near(m.specificity, 5 / 7); near(m.accuracy, 13 / 19);
});

/* ───────────── bayes.js (L18, L19, WK02) ───────────── */
const bayes = load('bayes');

test('bayes.betaBinomial: L19 p13 posterior Beta(k+α, n−k+β); sunrise mean (k+1)/(k+2)', () => {
  const r = bayes.betaBinomial(1, 1, 10, 10);
  eq([r.alpha, r.beta], [11, 1]);
  near(r.mean, 11 / 12);
});
test('bayes.betaBinomial: WK02 MAP = (k+α−1)/(n+α+β−2), MLE = k/n', () => {
  const r = bayes.betaBinomial(2, 3, 10, 6);
  near(r.map, (6 + 2 - 1) / (10 + 2 + 3 - 2)); near(r.mle, 0.6);
});
test('bayes.linreg: L18 p18 posterior; γ² → ∞ recovers OLS; predictive var σ² + x*ᵀV_N x*', () => {
  const X = [[1, 0], [1, 1], [1, 2], [1, 3]], y = [1, 3, 5, 7];
  const r = bayes.linreg(X, y, 1, 1e12);
  near(r.wN[0], 1, 1e-6); near(r.wN[1], 2, 1e-6);
  const p0 = bayes.predict(r, [1, 1.5], 1), pFar = bayes.predict(r, [1, 10], 1);
  ok(pFar.var > p0.var, 'variance grows away from the data (2021 Q11)');
});

/* ───────────── experts.js (L16) & bounds (L06/L07) ───────────── */
const experts = load('experts');

test('experts bounds: L16 p6, p12, p18', () => {
  near(experts.majorityBound(8), 3);
  near(experts.halvingBound(2, 8), (2 + 3) / Math.log2(4 / 3), 1e-12); // ≈ 2.41 (m + log2 n)
  near(experts.weightedBound(2, 8, 0.5), 2 * 1.5 * 2 + 2 * Math.log(8) / 0.5, 1e-12);
});
test('experts.halving run: weights halve on mistakes', () => {
  const r = experts.run('halving', [[1, 0, 1], [0, 0, 1]], [1, 1]);
  // round 1: expert 1 wrong → [1, .5, 1]; round 2: experts 0,1 wrong → [.5, .25, 1]
  eq(r.weights[r.weights.length - 1], [0.5, 0.25, 1]);
});
test('bounds.finite: L06 p17 |F|=8, δ=0.1 → sqrt((ln8+ln10)/(2n))', () => {
  near(experts.finiteClassBound(8, 0.1, 100), Math.sqrt((Math.log(8) + Math.log(10)) / 200), 1e-12);
});

/* ───────────── kernel.js (L09) ───────────── */
const kernel = load('kernel');

test('kernel.poly: L09 p22 (u1 v1 + c)^2 = φ(u)·φ(v) with φ = [x², √(2c) x, c]', () => {
  const u = [3], v = [-2], c = 1.5;
  near(kernel.poly(u, v, c, 2), Math.pow(-6 + 1.5, 2), 1e-12);
  near(kernel.dot(kernel.phi1d(u[0], c), kernel.phi1d(v[0], c)), kernel.poly(u, v, c, 2), 1e-12);
});
test('kernel.polyFeatures: L09 p32 d=2, m=2, c=0 → [u1², √2 u1u2, u2²]', () => {
  const f = kernel.polyFeatures([2, 3], 2);
  eq(f.length, 3);
  near(kernel.dot(f, kernel.polyFeatures([1, -1], 2)), Math.pow(2 * 1 + 3 * -1, 2), 1e-12);
});
test('kernel.isPSD: Gram matrix check (L09 p35 Mercer)', () => {
  eq(kernel.isPSD([[2, 1], [1, 2]]), true);
  eq(kernel.isPSD([[1, 2], [2, 1]]), false);
});

/* ───────────── backprop.js (L11 p26–p31) ───────────── */
const backprop = load('backprop');

test('backprop: one hidden layer, identity output, L = ½(z−y)²', () => {
  // x = [x0=1, x1], V[i][j] input i → hidden j, w[j] hidden j → output (w[0] is bias weight on u0=1)
  const net = { V: [[0.1, -0.2], [0.4, 0.3]], w: [0.05, 0.5, -0.6], act: 'logistic' };
  const r = backprop.run(net, [1, 2], 1);
  const g = (s) => 1 / (1 + Math.exp(-s));
  const r1 = 0.1 + 0.8, r2 = -0.2 + 0.6, u1 = g(r1), u2 = g(r2);
  const z = 0.05 + 0.5 * u1 - 0.6 * u2, delta = z - 1;
  near(r.z, z, 1e-12); near(r.delta, delta, 1e-12);
  near(r.dW[1], delta * u1, 1e-12);
  near(r.dV[1][0], delta * 0.5 * u1 * (1 - u1) * 2, 1e-12); // δ w_j g'(r_j) x_i
});

/* ───────────── report ───────────── */
console.log(`core tests: ${pass} passed, ${fail} failed`);
if (fail) { console.log('\n' + failures.map((f) => '✗ ' + f).join('\n')); process.exit(1); }
