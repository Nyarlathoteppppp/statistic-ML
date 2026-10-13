(function (root) {
  'use strict';

  /** L10 p18/p35–p39: data, bias-first weights, eta, {epochs,order} -> {steps,w}; step x includes bias 1. */
  function train(data, w, eta, options) {
    options = options || {};
    const epochs = options.epochs === undefined ? 1 : options.epochs;
    const order = options.order === undefined ? data.map((point, i) => i) : options.order;
    if (eta === undefined) eta = 1;
    const weights = w.slice(), steps = [];
    for (let epoch = 0; epoch < epochs; epoch++) {
      order.forEach(i => {
        const point = data[i];
        if (!point) throw new Error('invalid training index');
        const x = [1].concat(point.x), y = point.y;
        if (x.length !== weights.length) throw new Error('weight/input dimensions do not match');
        const s = weights.reduce((sum, value, j) => sum + value * x[j], 0);
        const ys = y * s, updated = ys <= 0;
        if (updated) x.forEach((value, j) => { weights[j] += eta * y * value; });
        steps.push({ i, x, y, s, ys, updated, w: weights.slice() });
      });
    }
    return { steps, w: weights };
  }

  /** L10 p14: score s and label y -> perceptron loss max(0,-s*y). */
  function loss(s, y) { return Math.max(0, -s * y); }

  const api = { train, loss };
  root.SML = root.SML || {};
  root.SML.core = root.SML.core || {};
  root.SML.core.perceptron = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
