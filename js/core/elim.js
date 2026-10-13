(function (root) {
  'use strict';

  /** L20 (junction trees); EX2026P Q5: undirected edges and elimination order -> fill/clique traces and a maximum-separator tree. */
  function eliminate(edges, order) {
    const graph = new Map(), steps = [];
    function ensure(node) { if (!graph.has(node)) graph.set(node, new Set()); }
    function connect(a, b) {
      ensure(a); ensure(b);
      if (a !== b) { graph.get(a).add(b); graph.get(b).add(a); }
    }
    edges.forEach(edge => connect(edge[0], edge[1]));
    order.forEach(ensure);
    const seen = new Set();
    order.forEach(node => {
      if (seen.has(node)) throw new Error('duplicate node in elimination order');
      seen.add(node);
      const neighbours = Array.from(graph.get(node)).sort(), fill = [];
      for (let i = 0; i < neighbours.length; i++) {
        for (let j = i + 1; j < neighbours.length; j++) {
          const a = neighbours[i], b = neighbours[j];
          if (!graph.get(a).has(b)) {
            connect(a, b);
            fill.push([a, b]);
          }
        }
      }
      const clique = [node].concat(neighbours).sort();
      steps.push({ node, neighbours, fill, clique });
      neighbours.forEach(next => graph.get(next).delete(node));
      graph.delete(node);
    });
    const cliques = steps.map(step => step.clique);
    const maximalCliques = cliques.filter((clique, i) => !cliques.some((other, j) =>
      i !== j && (other.length > clique.length || (other.length === clique.length && j < i)) &&
      clique.every(node => other.indexOf(node) !== -1)));
    const candidates = [];
    for (let a = 0; a < maximalCliques.length; a++) {
      for (let b = a + 1; b < maximalCliques.length; b++) {
        const separator = maximalCliques[a].filter(node => maximalCliques[b].indexOf(node) !== -1);
        candidates.push({ a, b, separator });
      }
    }
    candidates.sort((a, b) => b.separator.length - a.separator.length || a.a - b.a || a.b - b.b);
    const parent = maximalCliques.map((clique, i) => i), treeEdges = [];
    function representative(i) {
      while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; }
      return i;
    }
    candidates.forEach(edge => {
      const a = representative(edge.a), b = representative(edge.b);
      if (a !== b) { parent[b] = a; treeEdges.push(edge); }
    });
    return { steps, maximalCliques, junctionTree: { nodes: maximalCliques.map(c => c.slice()), edges: treeEdges } };
  }

  const api = { eliminate };
  root.SML = root.SML || {};
  root.SML.core = root.SML.core || {};
  root.SML.core.elim = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
