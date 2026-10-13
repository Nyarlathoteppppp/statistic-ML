(function (root) {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';
  let markerId = 0;

  function finite(value) {
    return typeof value === 'number' && Number.isFinite(value);
  }

  function svgEl(tag) {
    return document.createElementNS(SVG_NS, tag);
  }

  function classText(value) {
    return String(value == null ? '' : value).trim().replace(/[^A-Za-z0-9_-]+/g, ' ');
  }

  function draw(svg, opts) {
    if (!svg || typeof svg.appendChild !== 'function') return svg;
    opts = opts || {};
    const sourceNodes = opts.nodes && typeof opts.nodes === 'object' ? opts.nodes : {};
    const nodes = {};
    Object.keys(sourceNodes).forEach(function (id) {
      const point = sourceNodes[id];
      if (point && finite(point.x) && finite(point.y)) nodes[id] = { x: point.x, y: point.y };
    });
    const ids = Object.keys(nodes);
    const radius = finite(opts.r) && opts.r > 0 ? opts.r : 20;
    const notes = opts.notes && typeof opts.notes === 'object' ? opts.notes : {};
    const noteLen = Math.max(0, ...Object.keys(notes).map(function (k) { return String(notes[k]).length; }));
    const padding = radius + 24, padX = padding + (noteLen ? noteLen * 12 + 8 : 0), padY = padding + (noteLen ? 10 : 0);
    let minX = 0, minY = 0, maxX = 100, maxY = 80;
    if (ids.length) {
      minX = Math.min.apply(null, ids.map(function (id) { return nodes[id].x; })) - padX;
      minY = Math.min.apply(null, ids.map(function (id) { return nodes[id].y; })) - padY;
      maxX = Math.max.apply(null, ids.map(function (id) { return nodes[id].x; })) + padX;
      maxY = Math.max.apply(null, ids.map(function (id) { return nodes[id].y; })) + padY;
    }
    // Notes go beside a node (outside the drawing) when the node is left or right of centre, else below it.
    const cx = ids.length ? (Math.min.apply(null, ids.map(function (id) { return nodes[id].x; })) + Math.max.apply(null, ids.map(function (id) { return nodes[id].x; }))) / 2 : 0;
    if (!(maxX > minX)) maxX = minX + 100;
    if (!(maxY > minY)) maxY = minY + 80;

    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.setAttribute('class', 'graph');
    svg.setAttribute('viewBox', [minX, minY, maxX - minX, maxY - minY].join(' '));
    svg.setAttribute('role', 'img');

    const edgesGroup = svgEl('g');
    edgesGroup.setAttribute('class', 'edges');
    const edgeList = Array.isArray(opts.edges) ? opts.edges : [];
    const directedEdges = edgeList.filter(function (edge) {
      return edge && edge.directed && nodes[edge.a] && nodes[edge.b] && edge.a !== edge.b;
    });
    let markerUrl = null;
    if (directedEdges.length) {
      const defs = svgEl('defs');
      const marker = svgEl('marker');
      const id = 'graph-arrow-' + (++markerId);
      marker.setAttribute('id', id);
      marker.setAttribute('viewBox', '0 0 10 10');
      marker.setAttribute('refX', '9');
      marker.setAttribute('refY', '5');
      marker.setAttribute('markerWidth', '6');
      marker.setAttribute('markerHeight', '6');
      marker.setAttribute('orient', 'auto-start-reverse');
      const path = svgEl('path');
      path.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
      marker.appendChild(path);
      defs.appendChild(marker);
      svg.appendChild(defs);
      markerUrl = 'url(#' + id + ')';
    }

    edgeList.forEach(function (edge) {
      if (!edge || !nodes[edge.a] || !nodes[edge.b] || edge.a === edge.b) return;
      const a = nodes[edge.a], b = nodes[edge.b];
      const dx = b.x - a.x, dy = b.y - a.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (!(distance > 0)) return;
      const ux = dx / distance, uy = dy / distance;
      const start = { x: a.x + ux * radius, y: a.y + uy * radius };
      const end = { x: b.x - ux * radius, y: b.y - uy * radius };
      const line = svgEl('line');
      line.setAttribute('class', 'edge' + (classText(edge.cls) ? ' ' + classText(edge.cls) : ''));
      line.setAttribute('x1', String(start.x));
      line.setAttribute('y1', String(start.y));
      line.setAttribute('x2', String(end.x));
      line.setAttribute('y2', String(end.y));
      line.setAttribute('data-a', edge.a);
      line.setAttribute('data-b', edge.b);
      if (edge.directed && markerUrl) line.setAttribute('marker-end', markerUrl);
      edgesGroup.appendChild(line);
      if (edge.label != null && edge.label !== '') {
        // Edge label: at the midpoint, nudged perpendicular to the edge so it does not sit on the line.
        const t = svgEl('text');
        t.setAttribute('class', 'edge-label');
        t.setAttribute('x', String((a.x + b.x) / 2 - uy * 12));
        t.setAttribute('y', String((a.y + b.y) / 2 + ux * 12));
        t.textContent = String(edge.label);
        edgesGroup.appendChild(t);
      }
    });
    svg.appendChild(edgesGroup);

    const nodesGroup = svgEl('g');
    nodesGroup.setAttribute('class', 'nodes');
    const classes = opts.nodeCls && typeof opts.nodeCls === 'object' ? opts.nodeCls : {};
    ids.forEach(function (id) {
      const point = nodes[id];
      const group = svgEl('g');
      const extra = classText(classes[id]);
      group.setAttribute('class', 'node' + (extra ? ' ' + extra : ''));
      group.setAttribute('data-node', id);
      const circle = svgEl('circle');
      circle.setAttribute('cx', String(point.x));
      circle.setAttribute('cy', String(point.y));
      circle.setAttribute('r', String(radius));
      const label = svgEl('text');
      label.setAttribute('x', String(point.x));
      label.setAttribute('y', String(point.y));
      label.textContent = opts.labels && opts.labels[id] != null ? String(opts.labels[id]) : id;
      group.appendChild(circle);
      group.appendChild(label);
      if (notes[id] != null && notes[id] !== '') {
        const note = svgEl('text');
        const side = point.x < cx - radius ? 'left' : point.x > cx + radius ? 'right' : 'below';
        note.setAttribute('class', 'node-note ' + side);
        note.setAttribute('x', String(side === 'left' ? point.x - radius - 6 : side === 'right' ? point.x + radius + 6 : point.x));
        note.setAttribute('y', String(side === 'below' ? point.y + radius + 5 : point.y));
        note.textContent = String(notes[id]);
        group.appendChild(note);
      }
      nodesGroup.appendChild(group);
    });
    svg.appendChild(nodesGroup);
    return svg;
  }

  root.SML = root.SML || {};
  root.SML.vizGraph = { draw: draw };
})(typeof window !== 'undefined' ? window : globalThis);
