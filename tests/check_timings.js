/**
 * Check the web narration (`say`) of rendered Manim videos without rebuilding data/videos.js.
 *   node tests/check_timings.js gd pca        # only these video ids
 *   node tests/check_timings.js               # every manim/timings/*.json
 * Reports KaTeX errors (site macros), control characters, a literal \' (KaTeX reads it as an accent)
 * and step times that are not increasing.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const siteRoot = path.resolve(__dirname, '..');
global.window = global;
global.SML = {};
let katex = require(path.resolve(siteRoot, 'vendor/katex/katex.min.js'));
if (katex && !katex.renderToString && katex.default) katex = katex.default;
global.katex = katex;
vm.runInThisContext(fs.readFileSync(path.resolve(siteRoot, 'js/ui/md.js'), 'utf8'), { filename: 'js/ui/md.js' });
const MACROS = global.SML.md.MACROS;

const TOKEN = /`([^`]+)`|\$\$([\s\S]+?)\$\$|\$((?:\\\$|[^$])+?)\$/g;
const dir = path.resolve(siteRoot, 'manim/timings');
const ids = process.argv.slice(2);
const files = (ids.length ? ids.map((i) => i + '.json') : fs.readdirSync(dir).filter((f) => f.endsWith('.json')));

let problems = 0, formulas = 0;
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  d.steps.forEach((st, i) => {
    const where = `${d.id} step ${i + 1}`;
    if (i && !(st.t > d.steps[i - 1].t)) { problems++; console.log(`${where}: step time not increasing`); }
    if (/[\t\x08\x0b\x0c]/.test(st.say)) { problems++; console.log(`${where}: control character (a backslash was eaten)`); }
    if (st.say.includes("\\'")) { problems++; console.log(`${where}: contains \\' (use a plain ' inside r"...")`); }
    TOKEN.lastIndex = 0;
    let m;
    while ((m = TOKEN.exec(st.say)) !== null) {
      const [, code, dmath, imath] = m;
      if (code != null) continue;
      const src = dmath != null ? dmath : imath;
      formulas++;
      try {
        katex.renderToString(src, { throwOnError: true, trust: true, strict: 'ignore', displayMode: dmath != null, macros: Object.assign({}, MACROS) });
      } catch (e) { problems++; console.log(`${where}: KaTeX: ${e.message}  in "${src}"`); }
    }
  });
}
console.log(`timings check: ${files.length} videos, ${formulas} formulas, ${problems} problems`);
process.exit(problems ? 1 : 0);
