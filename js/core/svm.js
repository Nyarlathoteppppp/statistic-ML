(function (root) {
  'use strict';

  function dot(a, b) { return a.reduce((sum, value, i) => sum + value * b[i], 0); }

  /** L08 p20; EX2026P Q1c: labelled 2D points -> canonical {w,b,margin,supportVectors}; throws if not separable. */
  function hardMargin2D(points) {
    if (!points.some(p => p.y === 1) || !points.some(p => p.y === -1)) {
      throw new Error('both classes are required');
    }
    points.forEach(p => {
      if (p.x.length !== 2 || !p.x.every(Number.isFinite) || (p.y !== 1 && p.y !== -1)) {
        throw new Error('finite 2D points with labels +/-1 are required');
      }
    });
    let best = null;
    function consider(w, b) {
      const norm = Math.sqrt(dot(w, w));
      if (!(norm > 0) || !Number.isFinite(norm) || !Number.isFinite(b)) return;
      if (!points.every(p => p.y * (dot(w, p.x) + b) >= 1 - 1e-9)) return;
      const margin = 1 / norm;
      if (!best || margin > best.margin) best = { w, b, margin };
    }
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const p = points[i], q = points[j];
        const difference = [p.x[0] - q.x[0], p.x[1] - q.x[1]];
        if (p.y !== q.y) {
          const squaredDistance = dot(difference, difference);
          if (squaredDistance === 0) continue;
          const w = difference.map(value => 2 * p.y * value / squaredDistance);
          consider(w, p.y - dot(w, p.x));
        } else {
          // Equal-class supports define a direction parallel to the boundary.
          const normal = [-difference[1], difference[0]];
          for (let k = 0; k < points.length; k++) {
            const r = points[k];
            if (r.y === p.y) continue;
            const gap = dot(normal, [p.x[0] - r.x[0], p.x[1] - r.x[1]]);
            if (gap === 0) continue;
            const w = normal.map(value => 2 * p.y * value / gap);
            consider(w, p.y - dot(w, p.x));
          }
        }
      }
    }
    if (!best) throw new Error('points are not linearly separable');
    best.supportVectors = points.filter(p => Math.abs(p.y * (dot(best.w, p.x) + best.b) - 1) <= 1e-9).map(p => p.id);
    return best;
  }

  /** L08 p31: label y and score s -> max(0,1-y*s). */
  function hinge(y, s) { return Math.max(0, 1 - y * s); }

  /** L08 p17: w,b,x -> signed geometric distance (w.x+b)/||w||. */
  function distance(w, b, x) {
    const norm = Math.sqrt(dot(w, w));
    if (norm === 0) throw new Error('zero normal has no geometric distance');
    return (dot(w, x) + b) / norm;
  }

  const api = { hardMargin2D, hinge, distance };
  root.SML = root.SML || {};
  root.SML.core = root.SML.core || {};
  root.SML.core.svm = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
