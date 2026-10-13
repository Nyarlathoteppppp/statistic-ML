(function (root) {
  'use strict';

  /** L16 p6: n experts -> majority mistake bound log2(n), assuming a perfect expert. */
  function majorityBound(n) { return Math.log2(n); }

  /** L16 p12: best expert mistakes m, expert count n -> halving mistake bound. */
  function halvingBound(m, n) { return (m + Math.log2(n)) / Math.log2(4 / 3); }

  /** L16 p18: best mistakes m, count n, epsilon -> weighted-majority mistake bound. */
  function weightedBound(m, n, eps) { return 2 * (1 + eps) * m + 2 * Math.log(n) / eps; }

  /** L06 p17: class size F, failure probability delta, sample count n -> finite-class gap bound. */
  function finiteClassBound(F, delta, n) { return Math.sqrt((Math.log(F) + Math.log(1 / delta)) / (2 * n)); }

  /** L07 (VC generalisation bound): VC dimension, delta, n -> uniform generalisation gap bound. */
  function vcBound(vc, delta, n) { return Math.sqrt(8 * (vc * Math.log(2 * n + 1) + Math.log(4 / delta)) / n); }

  /** L16 p6/p12/p18: kind, round-by-expert binary predictions, outcomes, {eps} -> predictions, mistake counts, weight snapshots. */
  function run(kind, predictions, outcomes, options) {
    options = options || {};
    if (['majority', 'halving', 'weighted'].indexOf(kind) === -1) throw new Error('unknown expert algorithm');
    if (predictions.length !== outcomes.length) throw new Error('one outcome per round required');
    const eps = options.eps === undefined ? 0.5 : options.eps;
    if (kind === 'weighted' && (eps < 0 || eps > 1)) throw new Error('epsilon must lie in [0,1]');
    const n = predictions.length ? predictions[0].length : 0;
    const current = Array(n).fill(1), expertMistakes = Array(n).fill(0);
    const learnerPreds = [], weights = [];
    let mistakes = 0;
    predictions.forEach((row, t) => {
      if (row.length !== n || !row.every(value => value === 0 || value === 1) || (outcomes[t] !== 0 && outcomes[t] !== 1)) {
        throw new Error('rectangular binary predictions and outcomes required');
      }
      let zero = 0, one = 0;
      row.forEach((prediction, i) => { if (prediction === 1) one += current[i]; else zero += current[i]; });
      const prediction = one >= zero ? 1 : 0;
      learnerPreds.push(prediction);
      if (prediction !== outcomes[t]) mistakes++;
      row.forEach((value, i) => {
        if (value !== outcomes[t]) {
          expertMistakes[i]++;
          current[i] *= kind === 'majority' ? 0 : kind === 'halving' ? 0.5 : 1 - eps;
        }
      });
      weights.push(current.slice());
    });
    return { learnerPreds, mistakes, expertMistakes, weights };
  }

  const api = { majorityBound, halvingBound, weightedBound, finiteClassBound, vcBound, run };
  root.SML = root.SML || {};
  root.SML.core = root.SML.core || {};
  root.SML.core.experts = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
