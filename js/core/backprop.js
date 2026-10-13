(function (root) {
  'use strict';

  /** L11 p26–p31: net={V,w,act}, bias-inclusive x, target y -> forward states, squared loss, and dW/dV gradients.
   * r and eps index hidden units from zero; u includes u0=1, s=z is the identity-output score.
   */
  function run(net, x, y) {
    const p = net.w.length - 1;
    if (p < 0 || net.V.length !== x.length || !net.V.every(row => row.length === p)) {
      throw new Error('network/input dimensions do not match');
    }
    const act = net.act || 'logistic';
    if (['logistic', 'tanh', 'relu'].indexOf(act) === -1) throw new Error('unknown activation');
    function activate(value) {
      if (act === 'tanh') return Math.tanh(value);
      if (act === 'relu') return Math.max(0, value);
      if (value >= 0) return 1 / (1 + Math.exp(-value));
      const e = Math.exp(value);
      return e / (1 + e);
    }
    const r = Array.from({ length: p }, (unused, j) => x.reduce((sum, value, i) => sum + value * net.V[i][j], 0));
    const hidden = r.map(activate), u = [1].concat(hidden);
    const s = net.w.reduce((sum, value, j) => sum + value * u[j], 0), z = s;
    const delta = z - y, L = 0.5 * delta * delta;
    const eps = hidden.map((value, j) => {
      const derivative = act === 'logistic' ? value * (1 - value) : act === 'tanh' ? 1 - value * value : r[j] > 0 ? 1 : 0;
      return delta * net.w[j + 1] * derivative;
    });
    const dW = u.map(value => delta * value);
    const dV = x.map(value => eps.map(error => error * value));
    return { r, u, s, z, L, delta, eps, dW, dV };
  }

  const api = { run };
  root.SML = root.SML || {};
  root.SML.core = root.SML.core || {};
  root.SML.core.backprop = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
