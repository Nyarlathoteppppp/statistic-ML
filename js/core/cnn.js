(function (root) {
  'use strict';

  function outputSize(input, kernel, stride, pad) {
    if (!(stride > 0) || !(kernel > 0) || input + 2 * pad < kernel) throw new Error('invalid layer dimensions');
    return Math.floor((input + 2 * pad - kernel) / stride) + 1;
  }

  /** L13 p17; EX2026P Q1d: layer descriptions, {bias} -> {layers: parameter traces, total}. */
  function network(layers, options) {
    const bias = !!(options && options.bias);
    let previous, total = 0;
    const trace = layers.map(layer => {
      const inputs = layer.inputs === undefined ? previous : layer.inputs;
      if (!Number.isInteger(inputs) || inputs < 1) throw new Error('positive input size required');
      let outputs, weights, biases, expression;
      if (layer.type === 'conv1d') {
        outputs = outputSize(inputs, layer.kernel, layer.stride === undefined ? 1 : layer.stride, 0);
        const shared = layer.shared !== false;
        weights = (shared ? 1 : outputs) * layer.kernel;
        biases = bias ? (shared ? 1 : outputs) : 0;
        expression = shared ? String(layer.kernel) : outputs + ' × ' + layer.kernel;
      } else if (layer.type === 'dense') {
        outputs = layer.out;
        if (!Number.isInteger(outputs) || outputs < 1) throw new Error('positive output size required');
        weights = inputs * outputs;
        biases = bias ? outputs : 0;
        expression = inputs + ' × ' + outputs;
      } else {
        throw new Error('unknown layer type: ' + layer.type);
      }
      const params = weights + biases;
      const formula = expression + (biases ? ' + ' + biases : '') + ' = ' + params;
      previous = outputs;
      total += params;
      return { type: layer.type, inputs, outputs, params, formula };
    });
    return { layers: trace, total };
  }

  /** L13 p17: {H,W,Cin,K,Cout,stride,pad} -> spatial outputs and weight/bias counts. */
  function conv2d(options) {
    const stride = options.stride === undefined ? 1 : options.stride;
    const pad = options.pad === undefined ? 0 : options.pad;
    const outH = outputSize(options.H, options.K, stride, pad);
    const outW = outputSize(options.W, options.K, stride, pad);
    const weights = options.Cout * options.Cin * options.K * options.K;
    const biases = options.Cout, params = weights + biases;
    return { outH, outW, outC: options.Cout, weights, biases, params,
      formula: options.Cout + ' × ' + options.Cin + ' × ' + options.K + '² + ' + biases + ' = ' + params };
  }

  /** WS08 p3: {H,W,C,K,stride} -> {outH,outW,outC,params:0} for pooling. */
  function pool2d(options) {
    const stride = options.stride === undefined ? options.K : options.stride;
    return { outH: outputSize(options.H, options.K, stride, 0),
      outW: outputSize(options.W, options.K, stride, 0), outC: options.C, params: 0 };
  }

  const api = { network, conv2d, pool2d };
  root.SML = root.SML || {};
  root.SML.core = root.SML.core || {};
  root.SML.core.cnn = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
