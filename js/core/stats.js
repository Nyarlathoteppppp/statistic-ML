(function (root) {
  'use strict';

  /** L15 p29: numeric sample -> arithmetic mean (null for an empty sample). */
  function mean(values) {
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
  }

  /** L15 p29: numeric sample -> population variance, dividing by m (null if empty). */
  function variance(values) {
    if (!values.length) return null;
    const average = mean(values);
    return values.reduce((sum, value) => sum + (value - average) * (value - average), 0) / values.length;
  }

  /** L15 p29–p30: a,b={mean,var}, equal sample size m -> {x,nuRaw,nu}, with degrees rounded up. */
  function welch(a, b, m) {
    const sum = a.var + b.var;
    const x = sum === 0 ? null : (a.mean - b.mean) * Math.sqrt(m) / Math.sqrt(sum);
    const denominator = a.var * a.var + b.var * b.var;
    const nuRaw = denominator === 0 ? null : sum * sum * (m - 1) / denominator;
    return { x, nuRaw, nu: nuRaw === null ? null : Math.ceil(nuRaw) };
  }

  /** L15 p31: mean, population variance, sample size, critical value -> {lo,hi,half}. */
  function errorBar(average, populationVariance, m, crit) {
    const half = Math.sqrt(populationVariance) / Math.sqrt(m) * crit;
    return { lo: average - half, hi: average + half, half };
  }

  /** L15 p6–p8: {TP,FP,TN,FN} -> classification rates; undefined zero-denominator rates are null. */
  function metrics(counts) {
    const TP = counts.TP, FP = counts.FP, TN = counts.TN, FN = counts.FN;
    const divide = (a, b) => b === 0 ? null : a / b;
    const precision = divide(TP, TP + FP), recall = divide(TP, TP + FN);
    return { precision, recall, specificity: divide(TN, TN + FP),
      accuracy: divide(TP + TN, TP + FP + TN + FN), f1: divide(2 * TP, 2 * TP + FP + FN),
      fpr: divide(FP, FP + TN) };
  }

  const api = { mean, variance, welch, errorBar, metrics };
  root.SML = root.SML || {};
  root.SML.core = root.SML.core || {};
  root.SML.core.stats = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
