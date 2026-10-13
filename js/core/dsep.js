(function (root) {
  'use strict';

  /** L20 p17: directed edges and seed nodes -> sorted seeds plus all their ancestors. */
  function ancestors(edges, nodes) {
    const seen = new Set(nodes), queue = nodes.slice();
    for (let i = 0; i < queue.length; i++) {
      edges.forEach(edge => {
        if (edge[1] === queue[i] && !seen.has(edge[0])) {
          seen.add(edge[0]);
          queue.push(edge[0]);
        }
      });
    }
    return Array.from(seen).sort();
  }

  /** L20 p18–p21/p39: DAG edges -> {edges: undirected originals and marriages, added}. */
  function moralize(edges) {
    const undirected = [], added = [], known = new Set(), parents = new Map();
    function add(a, b, marriage) {
      if (a === b) return;
      const edge = [a, b].sort(), key = JSON.stringify(edge);
      if (known.has(key)) return;
      known.add(key);
      undirected.push(edge);
      if (marriage) added.push(edge.slice());
    }
    edges.forEach(edge => {
      add(edge[0], edge[1], false);
      if (!parents.has(edge[1])) parents.set(edge[1], new Set());
      parents.get(edge[1]).add(edge[0]);
    });
    Array.from(parents.keys()).sort().forEach(child => {
      const ps = Array.from(parents.get(child)).sort();
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) add(ps[i], ps[j], true);
      }
    });
    return { edges: undirected, added };
  }

  /** L20 p20: undirected edges, X,Y,S lists -> {separated,path}, using alphabetic BFS avoiding S. */
  function separated(undirectedEdges, X, Y, S) {
    const blocked = new Set(S || []), targets = new Set(Y), adjacency = new Map();
    function connect(a, b) {
      if (!adjacency.has(a)) adjacency.set(a, new Set());
      adjacency.get(a).add(b);
    }
    undirectedEdges.forEach(edge => { connect(edge[0], edge[1]); connect(edge[1], edge[0]); });
    for (const start of X) {
      if (blocked.has(start)) continue;
      const queue = [start], previous = new Map([[start, null]]);
      for (let i = 0; i < queue.length; i++) {
        const node = queue[i];
        if (targets.has(node)) {
          const path = [];
          for (let cur = node; cur !== null; cur = previous.get(cur)) path.push(cur);
          path.reverse();
          return { separated: false, path };
        }
        const neighbours = Array.from(adjacency.get(node) || []).sort();
        neighbours.forEach(next => {
          if (!blocked.has(next) && !previous.has(next)) {
            previous.set(next, node);
            queue.push(next);
          }
        });
      }
    }
    return { separated: true, path: null };
  }

  /** L20 p17–p25: DAG edges and X,Y,S -> independence with ancestral/moral/BFS step trace. */
  function dsep(edges, X, Y, S) {
    S = S || [];
    const ancestral = ancestors(edges, X.concat(Y, S)), keep = new Set(ancestral);
    const ancestralEdges = edges.filter(edge => keep.has(edge[0]) && keep.has(edge[1])).map(edge => edge.slice());
    const moral = moralize(ancestralEdges);
    const result = separated(moral.edges, X, Y, S);
    return { independent: result.separated, steps: { ancestral, ancestralEdges,
      moralEdges: moral.added, undirectedEdges: moral.edges, removed: S.slice(), path: result.path } };
  }

  const api = { ancestors, moralize, separated, dsep };
  root.SML = root.SML || {};
  root.SML.core = root.SML.core || {};
  root.SML.core.dsep = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
