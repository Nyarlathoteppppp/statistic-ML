/* 3Blue1Brown-style step animations (no dependencies, works from file://).
 *
 *   SML.anim.scene('anim-id', {
 *     title: '标题', w: 640, h: 360,           // viewBox of the stage
 *     setup(S) { ...create objects... },        // initial picture (also re-run on every rewind)
 *     beats: [ { say: 'Markdown 旁白', run: async (S) => { await S.to(obj, {x: 3}); } }, ... ],
 *   });
 *
 * A scene is a list of beats. Going back rebuilds the stage and replays the earlier beats instantly,
 * so beats must only depend on what setup() and the previous beats created (keep handles on S.v).
 *
 * Stage S:
 *   S.v                       free object for your handles
 *   S.map(x0,x1,y0,y1,[px,py,pw,ph]) → {X,Y,P,u}  maths → pixels (y up)
 *   S.line/arrow/circle/rect/path/poly/label/group(props) → shape  (shape.set(p), shape.get(k), shape.el)
 *   S.to(shape, props, ms, ease)   animate numbers and colours      S.play(ms, t => {...}, ease)
 *   S.show/hide(shape, ms)  S.draw(shape, ms) (stroke draw-in)       S.pulse(shape)
 *   S.count(label, from, to, ms, fmt)                                S.wait(ms)   S.all(...promises)
 *   S.C.blue/yellow/green/red/teal/purple/orange/grey/white/dim      colour palette (dark stage)
 */
(function (root) {
  'use strict';
  const SML = root.SML;
  const NS = 'http://www.w3.org/2000/svg';
  const C = {
    bg: '#16171c', blue: '#58C4DD', yellow: '#F4D35E', green: '#83C167', red: '#FC6255', teal: '#5CD0B3',
    purple: '#B189D9', orange: '#FF9F43', grey: '#7c8494', white: '#ECEFF4', dim: '#3a3f4b', grid: '#2c4a5c',
  };
  const ease = {
    smooth: (t) => t * t * (3 - 2 * t),
    linear: (t) => t,
    out: (t) => 1 - (1 - t) * (1 - t),
    inout: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  };
  const reduce = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // requestAnimationFrame stalls in background tabs; a timer fallback keeps a started animation moving
  function tick(cb) {
    let fired = false;
    const go = () => { if (!fired) { fired = true; cb(performance.now()); } };
    requestAnimationFrame(go);
    setTimeout(go, 40);
  }

  function hexToRgb(h) {
    const m = /^#?([0-9a-f]{6})$/i.exec(String(h || ''));
    if (!m) return null;
    const n = parseInt(m[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function mixColor(a, b, t) {
    const A = hexToRgb(a), B = hexToRgb(b);
    if (!A || !B) return t < 1 ? a : b;
    return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
  }
  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function svgEl(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach((k) => { if (attrs[k] != null) n.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(n);
    return n;
  }

  /* ---------- shapes ---------- */
  // Each shape keeps its own numeric/colour state in `p` and knows how to write it to the DOM.
  function makeShape(kind, S, props) {
    const p = Object.assign({ opacity: 1 }, props);
    const shape = { kind, p, el: null, get: (k) => p[k] };
    const g = props.parent ? props.parent.el : S.layer;
    if (kind === 'label') {
      const n = el('div', 'anim-label');
      S.overlay.appendChild(n);
      shape.el = n;
    } else if (kind === 'group') {
      shape.el = svgEl('g', {}, g);
    } else {
      const tag = { line: 'line', arrow: 'line', circle: 'circle', rect: 'rect', path: 'path', poly: 'polygon' }[kind];
      shape.el = svgEl(tag, {}, g);
      if (kind === 'arrow') shape.el.setAttribute('marker-end', 'url(#' + S.markerId(p.color || C.white) + ')');
    }
    shape.render = function () {
      const n = shape.el, q = shape.p;
      if (kind === 'label') {
        const [px, py] = [q.x / S.W * 100, q.y / S.H * 100];
        n.style.left = px + '%'; n.style.top = py + '%';
        const ax = q.anchor === 'l' ? '0%' : q.anchor === 'r' ? '-100%' : '-50%';
        const ay = q.valign === 't' ? '0%' : q.valign === 'b' ? '-100%' : '-50%';
        n.style.transform = 'translate(' + ax + ',' + ay + ') scale(' + (q.scale == null ? 1 : q.scale) + ')';
        n.style.opacity = q.opacity; n.style.color = q.color || C.white;
        n.style.fontSize = (q.size || 1) + 'em';
        if (q.bg) { n.style.background = q.bg; n.style.padding = '0.1em 0.35em'; n.style.borderRadius = '6px'; }
        if (q._shown !== q.text) { n.innerHTML = SML.md.inline(String(q.text == null ? '' : q.text)); q._shown = q.text; }
        return;
      }
      if (kind === 'group') {
        n.setAttribute('opacity', q.opacity);
        n.setAttribute('transform', 'translate(' + (q.x || 0) + ',' + (q.y || 0) + ') rotate(' + (q.rot || 0) + ') scale(' + (q.scale == null ? 1 : q.scale) + ')');
        return;
      }
      n.setAttribute('opacity', q.opacity);
      const stroke = q.color || (kind === 'circle' || kind === 'rect' || kind === 'poly' ? 'none' : C.white);
      n.setAttribute('stroke', q.stroke || stroke);
      n.setAttribute('stroke-width', q.width == null ? 2 : q.width);
      n.setAttribute('fill', q.fill || 'none');
      if (q.dash) n.setAttribute('stroke-dasharray', q.dash); else if (q._len == null) n.removeAttribute('stroke-dasharray');
      n.setAttribute('stroke-linecap', 'round');
      if (kind === 'line' || kind === 'arrow') {
        let { x1, y1, x2, y2 } = q;
        if (kind === 'arrow') { // stop short so the arrow head ends exactly at (x2,y2)
          const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, cut = Math.min(L, (q.width || 2) * 3.2);
          x2 -= dx / L * cut; y2 -= dy / L * cut;
          if (q.color !== q._mk) { n.setAttribute('marker-end', 'url(#' + S.markerId(q.color || C.white) + ')'); q._mk = q.color; }
        }
        n.setAttribute('x1', x1); n.setAttribute('y1', y1); n.setAttribute('x2', x2); n.setAttribute('y2', y2);
      } else if (kind === 'circle') {
        n.setAttribute('cx', q.cx); n.setAttribute('cy', q.cy); n.setAttribute('r', Math.max(0, q.r));
      } else if (kind === 'rect') {
        n.setAttribute('x', q.x); n.setAttribute('y', q.y); n.setAttribute('width', Math.max(0, q.w)); n.setAttribute('height', Math.max(0, q.h));
        n.setAttribute('rx', q.rx || 0);
      } else if (kind === 'path') {
        n.setAttribute('d', typeof q.d === 'function' ? q.d() : q.d || '');
      } else if (kind === 'poly') {
        n.setAttribute('points', (q.points || []).map((pt) => pt[0] + ',' + pt[1]).join(' '));
      }
    };
    shape.set = function (np) { Object.assign(shape.p, np); shape.render(); return shape; };
    shape.remove = function () { if (shape.el && shape.el.parentNode) shape.el.parentNode.removeChild(shape.el); };
    shape.render();
    return shape;
  }

  /* ---------- stage ---------- */
  function makeStage(host, spec) {
    const W = spec.w || 640, H = spec.h || 360;
    const wrap = el('div', 'anim-stage');
    const svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'anim-svg', role: 'img', 'aria-label': spec.title || '动画' });
    const overlay = el('div', 'anim-overlay');
    wrap.append(svg, overlay);
    host.appendChild(wrap);
    // labels scale with the stage width so the picture looks the same on a phone
    const fit = () => { overlay.style.fontSize = Math.max(10, wrap.clientWidth / W * 17.5) + 'px'; };
    if (root.ResizeObserver) new root.ResizeObserver(fit).observe(wrap); else root.addEventListener('resize', fit);
    setTimeout(fit, 0);

    const S = { W, H, svg, overlay, wrap, C, ease, v: {}, instant: false, speed: 1, token: 0, dead: false };
    S.destroy = function () { S.dead = true; S.token++; if (wrap.parentNode) wrap.parentNode.removeChild(wrap); };
    const defs = svgEl('defs', {}, svg);
    const markers = {};
    S.markerId = function (color) {
      const key = String(color).replace('#', '');
      if (!markers[key]) {
        const id = 'am-' + Math.random().toString(36).slice(2, 8) + key;
        const m = svgEl('marker', { id, viewBox: '0 0 10 10', refX: 1, refY: 5, markerWidth: 4.2, markerHeight: 4.2, orient: 'auto-start-reverse' }, defs);
        svgEl('path', { d: 'M0,0 L10,5 L0,10 z', fill: color }, m);
        markers[key] = id;
      }
      return markers[key];
    };
    S.reset = function () {
      if (S.layer) S.layer.remove();
      S.layer = svgEl('g', {}, svg);
      svgEl('rect', { x: 0, y: 0, width: W, height: H, fill: C.bg }, S.layer);
      overlay.innerHTML = '';
      S.v = {};
    };
    ['line', 'arrow', 'circle', 'rect', 'path', 'poly', 'label', 'group'].forEach((k) => { S[k] = (props) => makeShape(k, S, props || {}); });
    S.clip = function (shape, box) {        // clip an SVG shape to a rectangle [x, y, w, h]
      const id = 'ac-' + Math.random().toString(36).slice(2, 9);
      const cp = svgEl('clipPath', { id }, S.layer);
      svgEl('rect', { x: box[0], y: box[1], width: box[2], height: box[3] }, cp);
      shape.el.setAttribute('clip-path', 'url(#' + id + ')');
      return shape;
    };

    S.map = function (x0, x1, y0, y1, box) {
      const [bx, by, bw, bh] = box || [0, 0, W, H];
      const sx = bw / (x1 - x0), sy = bh / (y1 - y0);
      const X = (x) => bx + (x - x0) * sx, Y = (y) => by + bh - (y - y0) * sy;
      return { X, Y, P: (pt) => [X(pt[0]), Y(pt[1])], u: sx, uy: sy };
    };

    /* ---------- timing ---------- */
    S.play = function (ms, fn, easing) {
      const e = typeof easing === 'function' ? easing : ease[easing || 'smooth'];
      const dur = (ms == null ? 700 : ms) / S.speed;
      if (S.instant || S.dead || reduce || dur <= 0) { fn(1); return Promise.resolve(); }
      const tok = S.token;
      return new Promise((resolve) => {
        const t0 = performance.now();
        function frame(now) {
          if (tok !== S.token || S.dead) { fn(1); resolve(); return; }      // interrupted: jump to the end state
          const t = Math.min(1, (now - t0) / dur);
          fn(e(t));
          if (t < 1) tick(frame); else resolve();
        }
        tick(frame);
      });
    };
    S.wait = (ms) => (S.instant || reduce ? Promise.resolve() : S.play(ms == null ? 400 : ms, () => {}, 'linear'));
    S.all = (...ps) => Promise.all(ps.flat());
    S.to = function (shape, props, ms, easing) {
      const from = {}, keys = Object.keys(props);
      keys.forEach((k) => { from[k] = shape.p[k]; });
      return S.play(ms, (t) => {
        const np = {};
        keys.forEach((k) => {
          const a = from[k], b = props[k];
          if (typeof b === 'number' && typeof a === 'number') np[k] = a + (b - a) * t;
          else if (typeof b === 'string' && /^#/.test(b) && typeof a === 'string' && /^#/.test(a)) np[k] = mixColor(a, b, t);
          else if (Array.isArray(b) && Array.isArray(a) && a.length === b.length) np[k] = a.map((pt, i) => [pt[0] + (b[i][0] - pt[0]) * t, pt[1] + (b[i][1] - pt[1]) * t]);
          else np[k] = t < 1 ? a : b;
        });
        shape.set(np);
      }, easing);
    };
    S.show = (shape, ms) => S.to(shape, { opacity: 1 }, ms == null ? 450 : ms);
    S.hide = (shape, ms) => S.to(shape, { opacity: 0 }, ms == null ? 400 : ms);
    S.draw = function (shape, ms) {     // stroke draw-in for line / path / poly
      const n = shape.el;
      let len = 0;
      try { len = n.getTotalLength(); } catch (e) { len = 0; }
      if (!len) return S.show(shape, ms);
      shape.p._len = len;
      n.setAttribute('stroke-dasharray', len + ' ' + len);
      shape.set({ opacity: 1 });
      return S.play(ms == null ? 800 : ms, (t) => { n.setAttribute('stroke-dashoffset', len * (1 - t)); }).then(() => {
        n.removeAttribute('stroke-dashoffset'); shape.p._len = null;
        if (shape.p.dash) n.setAttribute('stroke-dasharray', shape.p.dash); else n.removeAttribute('stroke-dasharray');
      });
    };
    S.pulse = function (shape, ms) {
      const key = shape.kind === 'circle' ? 'r' : shape.kind === 'label' ? 'scale' : 'width';
      const base = shape.p[key] == null ? 1 : shape.p[key];
      return S.play(ms || 600, (t) => { const k = 1 + 0.35 * Math.sin(Math.PI * t); shape.set({ [key]: base * k }); }, 'linear')
        .then(() => shape.set({ [key]: base }));
    };
    S.count = function (label, a, b, ms, fmt) {
      const f = fmt || ((v) => String(Math.round(v)));
      return S.play(ms || 700, (t) => label.set({ text: f(a + (b - a) * t) }));
    };
    S.reset();
    return S;
  }

  /* ---------- player (controls + caption) ---------- */
  function mountScene(host, spec) {
    const box = el('div', 'anim-box');
    const head = el('div', 'anim-head');
    head.appendChild(el('span', 'anim-title', SML.md.inline(spec.title || '')));
    head.appendChild(el('span', 'anim-badge', '动画'));
    const stageHost = el('div', 'anim-stage-host');
    box.append(head, stageHost);
    host.appendChild(box);
    const caption = el('div', 'anim-caption');
    const bar = el('div', 'anim-bar');
    const btn = (txt, title, cls) => { const b = el('button', 'btn' + (cls ? ' ' + cls : ''), txt); b.type = 'button'; b.title = title; return b; };
    const bPrev = btn('⏮', '上一步'), bPlay = btn('▶ 播放', '连续播放', 'primary'), bNext = btn('⏭ 下一步', '只播下一步'), bRe = btn('↺', '从头开始');
    const speed = el('select', 'anim-speed');
    [['0.6', '慢'], ['1', '1×'], ['1.6', '快']].forEach(([v, t]) => { const o = el('option', null, t); o.value = v; speed.appendChild(o); });
    speed.value = '1';
    const dots = el('span', 'anim-dots');
    bar.append(bPrev, bPlay, bNext, bRe, speed, dots);
    box.append(bar, caption);

    const beats = spec.beats || [];
    let S = null, at = 0, playing = false, busy = false;
    const sayAt = (k) => (k === 0 ? (spec.intro || '点 **▶ 播放** 连续看完，或点 **⏭ 下一步** 一步一步看。') : beats[k - 1].say || '');
    function paint() {
      caption.innerHTML = SML.md.md(sayAt(at));
      dots.innerHTML = beats.map((_, i) => '<i class="' + (i < at ? 'on' : '') + '"></i>').join('') + '<em>' + at + ' / ' + beats.length + '</em>';
      bPrev.disabled = at === 0;
      bNext.disabled = at >= beats.length && !busy;
      bPlay.textContent = playing ? '⏸ 暂停' : at >= beats.length ? '▶ 重播' : '▶ 播放';
    }
    async function rebuild(k) {           // a fresh stage showing the state after beat k (no animation)
      if (S) S.destroy();
      const s = makeStage(stageHost, spec);
      s.speed = parseFloat(speed.value) || 1;
      S = s; busy = false;
      s.instant = true;
      spec.setup(s);
      for (let i = 0; i < k; i++) await beats[i].run(s);
      s.instant = false;
      at = k; paint();
    }
    async function step() {               // animate the next beat; false if it was interrupted
      if (at >= beats.length) return false;
      const s = S, k = at;
      busy = true; at = k + 1; paint();
      await beats[k].run(s);
      if (s !== S) return false;
      busy = false; paint();
      return true;
    }
    async function playAll() {
      if (at >= beats.length) await rebuild(0);
      playing = true; paint();
      while (playing && at < beats.length) {
        const s = S;
        if (!(await step()) || !playing) break;
        if (at < beats.length) { await s.wait(1100); if (s !== S) break; }
      }
      playing = false; paint();
    }
    bPlay.addEventListener('click', () => { if (playing) { playing = false; paint(); } else playAll(); });
    bNext.addEventListener('click', () => {
      playing = false;
      if (busy) rebuild(at); else step();   // a running beat jumps to its end
    });
    bPrev.addEventListener('click', () => { playing = false; rebuild(Math.max(0, at - 1)); });
    bRe.addEventListener('click', () => { playing = false; rebuild(0); });
    speed.addEventListener('change', () => { if (S) S.speed = parseFloat(speed.value) || 1; });
    rebuild(0);
    return box;
  }

  SML.anim = {
    C, ease,
    scene(id, spec) { SML.viz.register(id, (host) => mountScene(host, spec)); },
  };
})(window);
