/* Static figures (no controls): curves, regions and layouts the graph block cannot draw.
 * Use in a chapter as { t: 'viz', id: 'fig-…', opts: { caption: T`…` } }. Colours come from css/viz.css (svg.graph.fig). */
(function (root) {
  'use strict';
  const SML = root.SML;
  let uid = 0;

  // ---- tiny SVG string builders ----
  const T = (x, y, s, cls) => '<text class="lbl ' + (cls || '') + '" x="' + x + '" y="' + y + '">' + s + '</text>';
  const Rect = (x, y, w, h, cls) => '<rect class="blk ' + (cls || '') + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="3"/>';
  const Line = (x1, y1, x2, y2, cls, arrow) => '<line class="edge ' + (cls || '') + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"' + (arrow ? ' marker-end="url(#' + arrow + ')"' : '') + '/>';

  // still(w, h, draw) returns a mount function; draw(arrowMarkerId) returns the SVG body.
  function still(w, h, draw) {
    return function (el, opts) {
      const mid = 'fg' + (++uid);
      const defs = '<defs><marker id="' + mid + 'k" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>';
      const f = document.createElement('figure');
      f.className = 'graph-fig';
      f.innerHTML = '<svg class="graph fig" viewBox="0 0 ' + w + ' ' + h + '" role="img">' + defs + draw(mid + 'k') + '</svg>';
      if (opts && opts.caption) {
        const c = document.createElement('figcaption');
        c.innerHTML = SML.md.inline(opts.caption);
        f.appendChild(c);
      }
      el.appendChild(f);
    };
  }

  /* c43 nested cross-validation: outer 5 folds (report), inner 4 folds inside one outer training set (choose C). */
  SML.viz.register('fig-nested-cv', still(680, 300, function (k) {
    const bw = 40, bh = 22, gap = 4;
    let s = T(150, 18, '外层 5 折：只负责最后打分', 'mid w');
    for (let r = 0; r < 5; r++) {
      const y = 36 + r * 30;
      s += T(40, y + bh / 2, '第 ' + (r + 1) + ' 轮', 'end');
      for (let c = 0; c < 5; c++) s += Rect(50 + c * (bw + gap), y, bw, bh, c === r ? 'te' : (r === 0 ? 'tr' : 'tr dim'));
    }
    // bracket over round 1's four training blocks
    const bx1 = 50 + bw + gap, bx2 = 50 + 5 * (bw + gap) - gap;
    s += '<path class="edge" d="M' + bx1 + ',32 L' + bx1 + ',28 L' + bx2 + ',28 L' + bx2 + ',32"/>';
    s += Line(bx2 + 6, 47, 372, 60, 'thin', k);
    s += T(150, 196, '每轮得 1 个分数，5 个分数取平均', 'mid w');
    s += T(150, 214, '= 报告出去的性能', 'mid');
    // inner folds
    s += T(510, 18, '内层：在第 1 轮的 4 块训练数据里再做 4 折', 'mid w');
    for (let r = 0; r < 4; r++) {
      const y = 36 + r * 30;
      s += T(370, y + bh / 2, '内 ' + (r + 1), 'end');
      for (let c = 0; c < 4; c++) s += Rect(380 + c * (bw + gap), y, bw, bh, c === r ? 'va' : 'tr');
      if (r === 0) s += T(560, y + bh / 2, '← 绿 = 验证块', '');
    }
    s += T(380, 168, '① 每个 C（0.1、1、10）都跑这 4 折，', '');
    s += T(380, 186, '　 平均验证误差最小的就是 Ĉ', '');
    s += T(380, 206, '② 用 Ĉ 在全部 4 块上重训一次', '');
    s += T(380, 226, '③ 在第 1 轮的橙色块上打分（它没参与挑 C）', '');
    s += T(380, 246, '每轮 4×3 + 1 = 13 个模型，5 轮共 65 个', 'w');
    // legend
    const lg = [['tr', '训练'], ['va', '内层验证（挑 C 用）'], ['te', '外层测试（只打分）']];
    lg.forEach((p, i) => { const x = 50 + i * 190; s += Rect(x, 274, 18, 14, p[0]) + T(x + 24, 281, p[1], ''); });
    return s;
  }));
})(window);
