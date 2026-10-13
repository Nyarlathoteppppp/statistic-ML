(function (root) {
  'use strict';

  /** L09 p22: equal-dimensional vectors u,v -> dot product. */
  function dot(u, v) {
    if (u.length !== v.length) throw new Error('vector dimension mismatch');
    return u.reduce((sum, value, i) => sum + value * v[i], 0);
  }

  /** L09 p22/p32: vectors u,v, offset c, degree d -> (u.v+c)^d. */
  function poly(u, v, c, d) { return Math.pow(dot(u, v) + c, d); }

  /** L09 p22: scalar x, nonnegative offset c -> [x²,sqrt(2c)*x,c]. */
  function phi1d(x, c) {
    if (c < 0) throw new Error('real feature map requires nonnegative c');
    return [x * x, Math.sqrt(2 * c) * x, c];
  }

  /** L09 p32: vector x and nonnegative integer degree d -> homogeneous monomials with sqrt(multinomial) scaling. */
  function polyFeatures(x, d) {
    if (!Number.isInteger(d) || d < 0) throw new Error('nonnegative integer degree required');
    if (!x.length) return d === 0 ? [1] : [];
    function binomial(n, k) {
      let result = 1;
      for (let i = 1; i <= k; i++) result *= (n - i + 1) / i;
      return result;
    }
    const features = [];
    function enumerate(i, remaining, coefficient, monomial) {
      if (i === x.length - 1) {
        features.push(Math.sqrt(coefficient) * monomial * Math.pow(x[i], remaining));
        return;
      }
      for (let power = remaining; power >= 0; power--) {
        enumerate(i + 1, remaining - power, coefficient * binomial(remaining, power), monomial * Math.pow(x[i], power));
      }
    }
    enumerate(0, d, 1, 1);
    return features;
  }

  /** L09 (Gaussian kernel): vectors u,v, gamma (default 1) -> exp(-gamma*||u-v||²). */
  function rbf(u, v, gamma) {
    if (u.length !== v.length) throw new Error('vector dimension mismatch');
    if (gamma === undefined) gamma = 1;
    return Math.exp(-gamma * u.reduce((sum, value, i) => sum + (value - v[i]) * (value - v[i]), 0));
  }

  /** L09 p35: points and kernel callback k (default dot) -> Gram matrix k(points[i],points[j]). */
  function gram(points, k) {
    k = k || dot;
    return points.map(u => points.map(v => k(u, v)));
  }

  /** L09 p35: square matrix M and optional relative tolerance -> boolean PSD check via symmetric Jacobi eigenvalues. */
  function isPSD(M, tolerance) {
    const n = M.length;
    if (!M.every(row => Array.isArray(row) && row.length === n && row.every(Number.isFinite))) return false;
    if (!n) return true;
    const relative = tolerance === undefined ? 1e-10 : tolerance;
    if (!(relative >= 0)) throw new Error('nonnegative tolerance required');
    let scale = 1;
    M.forEach(row => row.forEach(value => { scale = Math.max(scale, Math.abs(value)); }));
    const tol = relative * scale;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) if (Math.abs(M[i][j] - M[j][i]) > tol) return false;
    }
    const A = M.map((row, i) => row.map((value, j) => value / 2 + M[j][i] / 2));
    for (let iteration = 0; iteration < 100 * n * n; iteration++) {
      let p = 0, q = 0, maximum = 0;
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          if (Math.abs(A[i][j]) > maximum) { maximum = Math.abs(A[i][j]); p = i; q = j; }
        }
      }
      if (maximum <= Math.max(tol, Number.EPSILON * scale)) break;
      const tau = (A[q][q] - A[p][p]) / (2 * A[p][q]);
      const t = (tau >= 0 ? 1 : -1) / (Math.abs(tau) + Math.hypot(1, tau));
      const c = 1 / Math.sqrt(1 + t * t), s = t * c, off = A[p][q];
      A[p][p] -= t * off;
      A[q][q] += t * off;
      A[p][q] = 0; A[q][p] = 0;
      for (let k = 0; k < n; k++) {
        if (k === p || k === q) continue;
        const kp = A[k][p], kq = A[k][q];
        A[k][p] = c * kp - s * kq; A[p][k] = A[k][p];
        A[k][q] = s * kp + c * kq; A[q][k] = A[k][q];
      }
    }
    return A.every((row, i) => row[i] >= -tol);
  }

  const api = { dot, poly, phi1d, polyFeatures, rbf, gram, isPSD };
  root.SML = root.SML || {};
  root.SML.core = root.SML.core || {};
  root.SML.core.kernel = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
