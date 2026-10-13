/* Formula stepper: highlight one part of a formula at a time with an explanation.
 * Block: { t:'fx', title, tex, intro, parts:[{ label, note }] }
 * In `tex`, wrap part k (1-based) as \htmlClass{fx-pk}{ ... }. Several pieces may share one class. */
(function (root) {
  'use strict';
  const SML = root.SML;

  function mount(b) {
    const { el } = SML.render;
    const { tex, md, inline } = SML.md;
    const box = el('div', 'fx');
    const head = el('div', 'fx-head', '<span>' + inline(b.title || '公式逐项解释') + '</span>');
    const ctrl = el('div', 'fx-ctrl');
    const prev = el('button', null, '上一步'); prev.type = 'button';
    const next = el('button', null, '下一步'); next.type = 'button';
    const all = el('button', null, '全部'); all.type = 'button';
    ctrl.append(prev, next, all); head.appendChild(ctrl);
    const body = el('div', 'fx-body', tex(b.tex, true));
    const note = el('div', 'fx-note');
    box.append(head, body, note);

    const parts = b.parts || [];
    let i = -1; // -1 = overview
    let showAll = false;

    function paint() {
      body.querySelectorAll('[class*="fx-p"]').forEach((n) => n.classList.remove('on', 'fx-part'));
      if (showAll) {
        note.innerHTML = parts.map((p, k) => '<div><span class="k">' + inline(p.label || String(k + 1)) + '</span>' + inline(p.note) + '</div>').join('');
      } else if (i < 0) {
        note.innerHTML = md(b.intro || '点"下一步"逐项看每一部分的含义（共 ' + parts.length + ' 项）。');
      } else {
        body.querySelectorAll('.fx-p' + (i + 1)).forEach((n) => n.classList.add('on', 'fx-part'));
        const p = parts[i];
        note.innerHTML = '<span class="k">' + (i + 1) + '/' + parts.length + ' ' + inline(p.label || '') + '</span>' + inline(p.note);
      }
      prev.disabled = !showAll && i < 0;
      next.disabled = !showAll && i >= parts.length - 1;
    }
    prev.addEventListener('click', () => { showAll = false; i = Math.max(-1, i - 1); paint(); });
    next.addEventListener('click', () => { showAll = false; i = Math.min(parts.length - 1, i + 1); paint(); });
    all.addEventListener('click', () => { showAll = !showAll; paint(); });
    paint();
    return box;
  }

  SML.formula = { mount: mount };
})(window);
