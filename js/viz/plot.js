/* Tiny SVG plotting helper shared by the chapter visualisations (no dependencies).
 *   const p = SML.plot.frame(parentEl, { w: 520, h: 300, x: [0, 1], y: [0, 1], xlabel, ylabel, xticks, yticks });
 *   p.path(points, cls) · p.dot(x, y, r, cls) · p.line(x1, y1, x2, y2, cls) · p.text(x, y, s, cls) · p.rect(x, y, w, h, cls)
 *   p.clear() removes everything drawn after the axes; p.X / p.Y map data → pixels; p.invert(px, py) maps back. */
(function (root) {
  'use strict';
  const SML = root.SML;
  const NS = 'http://www.w3.org/2000/svg';

  function mk(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach((k) => { if (attrs[k] != null) n.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(n);
    return n;
  }
  function niceTicks(a, b, n) {
    const span = b - a, raw = span / (n || 5), mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) || raw;
    const out = [];
    for (let v = Math.ceil(a / step) * step; v <= b + 1e-9; v += step) out.push(Math.abs(v) < 1e-12 ? 0 : +v.toFixed(10));
    return out;
  }
  const fmt = (v) => String(+(+v).toFixed(3));

  function frame(parent, o) {
    const W = o.w || 520, H = o.h || 300;
    const m = Object.assign({ l: 44, r: 14, t: 12, b: 34 }, o.margin || {});
    const svg = mk('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'plot' + (o.cls ? ' ' + o.cls : '') }, parent);
    if (o.maxWidth) svg.style.maxWidth = o.maxWidth + 'px';
    const [x0, x1] = o.x, [y0, y1] = o.y;
    const X = (x) => m.l + (x - x0) / (x1 - x0) * (W - m.l - m.r);
    const Y = (y) => H - m.b - (y - y0) / (y1 - y0) * (H - m.t - m.b);
    const axes = mk('g', { class: 'axes' }, svg);
    if (o.grid !== false) {
      (o.xticks || niceTicks(x0, x1, 6)).forEach((t) => {
        mk('line', { x1: X(t), x2: X(t), y1: Y(y0), y2: Y(y1), class: 'grid' }, axes);
        mk('text', { x: X(t), y: H - m.b + 15, class: 'tick', 'text-anchor': 'middle' }, axes).textContent = o.xfmt ? o.xfmt(t) : fmt(t);
      });
      (o.yticks || niceTicks(y0, y1, 5)).forEach((t) => {
        mk('line', { x1: X(x0), x2: X(x1), y1: Y(t), y2: Y(t), class: 'grid' }, axes);
        mk('text', { x: m.l - 6, y: Y(t) + 4, class: 'tick', 'text-anchor': 'end' }, axes).textContent = o.yfmt ? o.yfmt(t) : fmt(t);
      });
    }
    if (o.axes !== false) {
      const ax = Math.min(Math.max(0, x0), x1), ay = Math.min(Math.max(0, y0), y1);
      mk('line', { x1: X(x0), x2: X(x1), y1: Y(ay), y2: Y(ay), class: 'axis' }, axes);
      mk('line', { x1: X(ax), x2: X(ax), y1: Y(y0), y2: Y(y1), class: 'axis' }, axes);
    }
    if (o.xlabel) mk('text', { x: W - m.r, y: H - 4, class: 'label', 'text-anchor': 'end' }, axes).textContent = o.xlabel;
    if (o.ylabel) mk('text', { x: 4, y: m.t + 2, class: 'label', 'text-anchor': 'start', 'dominant-baseline': 'hanging' }, axes).textContent = o.ylabel;
    const cid = 'clip' + (++frame.n);
    const cp = mk('clipPath', { id: cid }, mk('defs', {}, svg));
    mk('rect', { x: m.l, y: m.t - 4, width: W - m.l - m.r, height: H - m.t - m.b + 8 }, cp);
    const g = mk('g', { class: 'layer', 'clip-path': 'url(#' + cid + ')' }, svg);

    const api = {
      svg: svg, g: g, X: X, Y: Y, W: W, H: H, m: m,
      clear() { while (g.firstChild) g.removeChild(g.firstChild); },
      path(pts, cls, closed) {
        const d = pts.filter((p) => Number.isFinite(p[0]) && Number.isFinite(p[1]))
          .map((p, i) => (i ? 'L' : 'M') + X(p[0]).toFixed(2) + ',' + Y(p[1]).toFixed(2)).join('') + (closed ? 'Z' : '');
        return mk('path', { d: d, class: cls || 'curve' }, g);
      },
      fn(f, cls, n) {
        const N = n || 240, pts = [];
        for (let i = 0; i <= N; i++) { const x = x0 + (x1 - x0) * i / N; pts.push([x, f(x)]); }
        return api.path(pts, cls);
      },
      dot(x, y, r, cls) { return mk('circle', { cx: X(x), cy: Y(y), r: r || 4, class: cls || 'pt' }, g); },
      line(xa, ya, xb, yb, cls) { return mk('line', { x1: X(xa), y1: Y(ya), x2: X(xb), y2: Y(yb), class: cls || 'ref' }, g); },
      rect(x, y, w, h, cls) {
        const px = X(x), py = Y(y + h);
        return mk('rect', { x: px, y: py, width: Math.max(0, X(x + w) - px), height: Math.max(0, Y(y) - py), class: cls || 'bar' }, g);
      },
      text(x, y, s, cls, anchor) {
        const t = mk('text', { x: X(x), y: Y(y), class: cls || 'note', 'text-anchor': anchor || 'middle' }, g);
        t.textContent = s; return t;
      },
      arrow(xa, ya, xb, yb, cls) {
        const l = api.line(xa, ya, xb, yb, (cls || 'vec'));
        const ax = X(xb), ay = Y(yb), dx = ax - X(xa), dy = ay - Y(ya), L = Math.hypot(dx, dy) || 1;
        const ux = dx / L, uy = dy / L, s = 9;
        mk('path', { d: 'M' + ax + ',' + ay + 'L' + (ax - s * ux + s * .5 * uy) + ',' + (ay - s * uy - s * .5 * ux) + 'L' + (ax - s * ux - s * .5 * uy) + ',' + (ay - s * uy + s * .5 * ux) + 'Z', class: (cls || 'vec') + ' head' }, g);
        return l;
      },
      invert(px, py) {
        return [x0 + (px - m.l) / (W - m.l - m.r) * (x1 - x0), y0 + (H - m.b - py) / (H - m.t - m.b) * (y1 - y0)];
      },
      /* client coords → data coords (for clicks) */
      fromEvent(e) {
        const r = svg.getBoundingClientRect();
        return api.invert((e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H);
      },
    };
    return api;
  }

  frame.n = 0;

  /* Slider with live value label: returns the <input>. */
  function slider(parent, labelText, o, onInput) {
    const wrap = document.createElement('label');
    wrap.className = 'slider';
    const name = document.createElement('span'); name.innerHTML = labelText;
    const inp = document.createElement('input');
    inp.type = 'range'; inp.min = o.min; inp.max = o.max; inp.step = o.step || 'any'; inp.value = o.value;
    const val = document.createElement('b'); val.className = 'sval';
    const show = () => { val.textContent = o.fmt ? o.fmt(+inp.value) : fmt(+inp.value); };
    inp.addEventListener('input', () => { show(); onInput && onInput(+inp.value); });
    show();
    wrap.append(name, inp, val);
    parent.appendChild(wrap);
    inp.set = (v) => { inp.value = v; show(); };
    return inp;
  }

  SML.plot = { frame: frame, mk: mk, niceTicks: niceTicks, slider: slider, fmt: fmt };
})(window);
