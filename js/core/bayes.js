(function (root) {
  'use strict';

  /** L19 p13; WK02: prior alpha,beta and n trials/k successes -> posterior shapes, mean, unique MAP, MLE. */
  function betaBinomial(alpha, beta, n, k) {
    if (!(alpha > 0) || !(beta > 0) || !Number.isInteger(n) || !Number.isInteger(k) || k < 0 || k > n) {
      throw new Error('invalid beta-binomial parameters');
    }
    const a = alpha + k, b = beta + n - k;
    let map = null;
    if (a > 1 && b > 1) map = (a - 1) / (a + b - 2);
    else if (a <= 1 && b >= 1 && (a < 1 || b > 1)) map = 0;
    else if (a >= 1 && b <= 1 && (a > 1 || b < 1)) map = 1;
    // Uniform and two-boundary modes have no unique MAP.
    return { alpha: a, beta: b, mean: a / (a + b), map, mle: n ? k / n : null };
  }

  // Gauss-Jordan elimination with partial pivoting; never mutates the input matrix.
  function inverse(matrix) {
    const n = matrix.length;
    const augmented = matrix.map((row, i) => row.slice().concat(Array.from({ length: n }, (unused, j) => i === j ? 1 : 0)));
    for (let col = 0; col < n; col++) {
      let pivot = col;
      for (let row = col + 1; row < n; row++) {
        if (Math.abs(augmented[row][col]) > Math.abs(augmented[pivot][col])) pivot = row;
      }
      if (augmented[pivot][col] === 0) throw new Error('singular matrix');
      const swap = augmented[col]; augmented[col] = augmented[pivot]; augmented[pivot] = swap;
      const divisor = augmented[col][col];
      for (let j = 0; j < 2 * n; j++) augmented[col][j] /= divisor;
      for (let row = 0; row < n; row++) {
        if (row === col) continue;
        const factor = augmented[row][col];
        for (let j = 0; j < 2 * n; j++) augmented[row][j] -= factor * augmented[col][j];
      }
    }
    return augmented.map(row => row.slice(n));
  }

  /** L18 p18: design X, responses y, noise sigma2, prior gamma2 -> Gaussian posterior {wN,VN}. */
  function linreg(X, y, sigma2, gamma2) {
    if (!X.length || X.length !== y.length || !(sigma2 > 0) || !(gamma2 > 0)) {
      throw new Error('invalid regression dimensions or variances');
    }
    const d = X[0].length;
    if (!d || !X.every(row => row.length === d)) throw new Error('rectangular nonempty design required');
    const precision = Array.from({ length: d }, () => Array(d).fill(0));
    const Xty = Array(d).fill(0);
    X.forEach((row, k) => {
      for (let i = 0; i < d; i++) {
        Xty[i] += row[i] * y[k];
        for (let j = 0; j < d; j++) precision[i][j] += row[i] * row[j];
      }
    });
    for (let i = 0; i < d; i++) precision[i][i] += sigma2 / gamma2;
    const VN = inverse(precision).map(row => row.map(value => sigma2 * value));
    const wN = VN.map(row => row.reduce((sum, value, i) => sum + value * Xty[i], 0) / sigma2);
    return { wN, VN };
  }

  /** L18 p18; EX2021 Q11: posterior, test vector, noise sigma2 -> predictive {mean,var}. */
  function predict(post, xStar, sigma2) {
    if (xStar.length !== post.wN.length) throw new Error('test vector dimension mismatch');
    const mean = post.wN.reduce((sum, value, i) => sum + value * xStar[i], 0);
    let variance = sigma2;
    for (let i = 0; i < xStar.length; i++) {
      for (let j = 0; j < xStar.length; j++) variance += xStar[i] * post.VN[i][j] * xStar[j];
    }
    return { mean, var: variance };
  }

  const api = { betaBinomial, linreg, predict };
  root.SML = root.SML || {};
  root.SML.core = root.SML.core || {};
  root.SML.core.bayes = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
