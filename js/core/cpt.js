(function (root) {
  'use strict';

  /** L20 p11: parent lists and cardinalities (null = binary) -> table shapes and parameter totals. */
  function sizes(parents, card) {
    function cardinality(node) {
      const k = card == null ? 2 : card[node];
      if (!Number.isInteger(k) || k < 1) throw new Error('invalid cardinality for ' + node);
      return k;
    }
    const tables = Object.keys(parents).map(node => {
      const parentConfigs = parents[node].reduce((product, parent) => product * cardinality(parent), 1);
      const k = cardinality(node);
      return { node, parents: parents[node].slice(), parentConfigs, shape: [k, parentConfigs],
        entries: k * parentConfigs, free: (k - 1) * parentConfigs };
    });
    return { tables, totalEntries: tables.reduce((sum, table) => sum + table.entries, 0),
      totalFree: tables.reduce((sum, table) => sum + table.free, 0) };
  }

  /** L20 p11; EX2025P Q1d: cardinalities -> unrestricted joint {entries,free}. */
  function joint(card) {
    const entries = Object.keys(card).reduce((product, node) => {
      if (!Number.isInteger(card[node]) || card[node] < 1) throw new Error('invalid cardinality for ' + node);
      return product * card[node];
    }, 1);
    return { entries, free: entries - 1 };
  }

  /** L20 p11; EX2025P Q4c: parents, complete observations, value lists -> per-configuration counts/total/p (null for unseen). */
  function mle(parents, data, values) {
    const result = {};
    Object.keys(parents).forEach(node => {
      let configurations = [[]];
      parents[node].forEach(parent => {
        const next = [];
        configurations.forEach(config => values[parent].forEach(value => next.push(config.concat([value]))));
        configurations = next;
      });
      const table = {};
      configurations.forEach(config => {
        const counts = {}, p = {};
        values[node].forEach(value => { counts[value] = 0; p[value] = null; });
        table[config.join(',')] = { counts, total: 0, p };
      });
      data.forEach(row => {
        const key = parents[node].map(parent => row[parent]).join(',');
        const entry = table[key];
        if (!entry || !Object.prototype.hasOwnProperty.call(entry.counts, row[node])) {
          throw new Error('observation outside declared values for ' + node);
        }
        entry.counts[row[node]]++;
        entry.total++;
      });
      Object.keys(table).forEach(key => {
        const entry = table[key];
        values[node].forEach(value => { entry.p[value] = entry.total ? entry.counts[value] / entry.total : null; });
      });
      result[node] = table;
    });
    return result;
  }

  const api = { sizes, joint, mle };
  root.SML = root.SML || {};
  root.SML.core = root.SML.core || {};
  root.SML.core.cpt = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
