(function (root) {
  'use strict';

  /** L07 p29: restrict binary rows to column indices; returns patterns and shattering metadata. */
  function restrict(rows, subset) {
    const patterns = rows.map(row => subset.map(i => row[i]).join(''));
    const unique = Array.from(new Set(patterns)).sort();
    const needed = Math.pow(2, subset.length);
    return { subset: subset.slice(), patterns, unique, needed, shattered: unique.length === needed };
  }

  /** L07 p29: enumerate column subsets; returns {n, vc, maxSets, allShattered, bySize}. */
  function analyze(rows) {
    const n = rows.length ? rows[0].length : 0;
    const allShattered = [], bySize = {};
    let dimension = 0;
    function enumerate(size, start, subset) {
      if (subset.length === size) {
        if (restrict(rows, subset).shattered) {
          allShattered.push(subset.slice());
          bySize[size] = (bySize[size] || 0) + 1;
          dimension = size;
        }
        return;
      }
      for (let i = start; i <= n - (size - subset.length); i++) {
        subset.push(i);
        enumerate(size, i + 1, subset);
        subset.pop();
      }
    }
    for (let size = 0; size <= n; size++) enumerate(size, 0, []);
    return { n, vc: dimension, maxSets: allShattered.filter(s => s.length === dimension), allShattered, bySize };
  }

  /** L07 p13–p14: fit both stump orientations to xs, ys; prediction rows use sorted-x order. */
  function stumps(xs, ys) {
    if (xs.length !== ys.length) throw new Error('xs and ys must have equal length');
    const samples = xs.map((x, i) => ({ x, y: ys[i], i })).sort((a, b) => a.x - b.x || a.i - b.i);
    const distinct = Array.from(new Set(samples.map(p => p.x)));
    const thresholds = distinct.slice(1).map((x, i) => distinct[i] / 2 + x / 2);
    const predictionsPos = thresholds.map(beta => samples.map(p => p.x > beta ? 1 : -1));
    const predictionsNeg = predictionsPos.map(row => row.map(y => -y));
    const errors = predictions => predictions.map(row => row.reduce((sum, y, i) => sum + (y !== samples[i].y ? 1 : 0), 0));
    const mistakesPos = errors(predictionsPos), mistakesNeg = errors(predictionsNeg);
    const candidates = [];
    thresholds.forEach((beta, i) => {
      candidates.push({ orientation: 'pos', beta, mistakes: mistakesPos[i] });
      candidates.push({ orientation: 'neg', beta, mistakes: mistakesNeg[i] });
    });
    candidates.sort((a, b) => a.mistakes - b.mistakes ||
      (a.orientation === b.orientation ? 0 : a.orientation === 'pos' ? -1 : 1) || a.beta - b.beta);
    return { xs: samples.map(p => p.x), ys: samples.map(p => p.y), thresholds,
      predictionsPos, predictionsNeg, mistakesPos, mistakesNeg, best: candidates[0] || null };
  }

  /** L07 p16/p19: xs -> unique +/- label strings (in input order), including constant stumps. */
  function stumpDichotomies(xs) {
    const distinct = Array.from(new Set(xs)).sort((a, b) => a - b);
    const thresholds = [-Infinity].concat(distinct.slice(1).map((x, i) => distinct[i] / 2 + x / 2), [Infinity]);
    const patterns = new Set();
    thresholds.forEach(beta => {
      patterns.add(xs.map(x => x > beta ? '+' : '-').join(''));
      patterns.add(xs.map(x => x > beta ? '-' : '+').join(''));
    });
    return Array.from(patterns).sort();
  }

  const api = { restrict, analyze, stumps, stumpDichotomies };
  root.SML = root.SML || {};
  root.SML.core = root.SML.core || {};
  root.SML.core.vc = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
