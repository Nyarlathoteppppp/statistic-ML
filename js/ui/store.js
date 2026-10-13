/* Per-viewer persistence (progress, mistakes, theme). Every access is guarded:
 * storage can be unavailable (private mode, file:// restrictions) and the site must still work. */
(function (root) {
  'use strict';
  const PREFIX = 'sml.v1.';
  const memory = {};

  function read(key, fallback) {
    try {
      const raw = root.localStorage.getItem(PREFIX + key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch (e) {
      return key in memory ? memory[key] : fallback;
    }
  }
  function write(key, value) {
    memory[key] = value;
    try { root.localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch (e) { /* memory only */ }
  }

  const store = {
    get: read,
    set: write,
    progress() { return read('progress', {}); },
    mark(pageId, field) {
      const p = read('progress', {});
      p[pageId] = Object.assign({}, p[pageId], { [field]: true, ts: Date.now() });
      write('progress', p);
    },
    unmark(pageId, field) {
      const p = read('progress', {});
      if (p[pageId]) { delete p[pageId][field]; write('progress', p); }
    },
    addMistake(entry) {
      const list = read('mistakes', []);
      const key = entry.page + '|' + entry.qid;
      if (!list.some((m) => m.page + '|' + m.qid === key)) {
        list.unshift(Object.assign({ ts: Date.now() }, entry));
        write('mistakes', list.slice(0, 300));
      }
    },
    removeMistake(page, qid) {
      write('mistakes', read('mistakes', []).filter((m) => !(m.page === page && m.qid === qid)));
    },
    mistakes() { return read('mistakes', []); },
  };

  root.SML = root.SML || {};
  root.SML.store = store;
})(window);
