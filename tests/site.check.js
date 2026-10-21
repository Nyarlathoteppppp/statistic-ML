/**
 * Site verification: structure, catalogue consistency, viz/practice registrations, figure files,
 * and KaTeX rendering of every reachable formula.  Usage: node tests/site.check.js
 * (Drafted by gemini-3.8-flash; adapted: registrations are also scanned in data/, viz/practice stubs added.)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const siteRoot = path.resolve(__dirname, '..');

/* 1. Fake browser globals */
global.window = global;
global.document = {
  createElement: () => ({ appendChild: () => {}, setAttribute: () => {}, classList: { add: () => {}, remove: () => {} }, style: {} }),
  createElementNS: () => ({ appendChild: () => {}, setAttribute: () => {}, style: {} }),
  getElementById: () => null,
  querySelectorAll: () => [],
  body: { appendChild: () => {}, remove: () => {}, classList: { add: () => {}, remove: () => {} } },
};
global.SML = global.SML || {};
global.SML.render = { blocks: {} };
global.SML.viz = { register: () => {}, get: () => null };
global.SML.practice = { generators: {}, register: () => {} };
global.SML.core = {};

let katex = require(path.resolve(siteRoot, 'vendor/katex/katex.min.js'));
if (katex && !katex.renderToString && katex.default) katex = katex.default;
global.katex = katex;

const indexHtml = fs.readFileSync(path.resolve(siteRoot, 'index.html'), 'utf8');
const scriptsInOrder = [];
const scriptSrcRe = /<script\s+[^>]*src=["']([^"']+)["'][^>]*>/gi;
let match;
while ((match = scriptSrcRe.exec(indexHtml)) !== null) scriptsInOrder.push(match[1]);

const problems = [];
function addProblem(pageId, loc, message) { problems.push({ page: pageId, loc: loc, message: message }); }

/* missing script files referenced by index.html */
scriptsInOrder.forEach((s) => { if (!fs.existsSync(path.resolve(siteRoot, s))) addProblem('index.html', s, 'script file not found'); });

const mdPath = scriptsInOrder.find((s) => s.includes('js/ui/md.js'));
vm.runInThisContext(fs.readFileSync(path.resolve(siteRoot, mdPath), 'utf8'), { filename: mdPath });

const registeredPages = {};
global.SML.content = {
  add(list) { (Array.isArray(list) ? list : [list]).forEach((p) => { registeredPages[p.id] = Object.assign(registeredPages[p.id] || {}, p); }); },
  get(id) { return registeredPages[id]; },
  all() { return registeredPages; },
};
global.SML.app = {
  order() {
    const ids = [];
    ((global.SML.catalog && global.SML.catalog.zones) || []).forEach((z) => (z.units || [{ items: z.items }]).forEach((u) => (u.items || []).forEach((id) => ids.push(id))));
    return ids;
  },
  metaOf(id) { return (global.SML.catalog && global.SML.catalog.meta[id]) || { title: id }; },
  routeOf(id) { return '/' + id; },
};

for (const relPath of scriptsInOrder) {
  if (relPath.startsWith('vendor/') || (relPath.startsWith('js/') && !['js/ui/chapter.js', 'js/ui/review.js', 'js/ui/learn.js'].includes(relPath))) continue;
  const fullPath = path.resolve(siteRoot, relPath);
  if (!fs.existsSync(fullPath)) continue;
  try { vm.runInThisContext(fs.readFileSync(fullPath, 'utf8'), { filename: relPath }); }
  catch (e) { addProblem(relPath, 'load', 'script threw while loading: ' + e.message); }
}

/* 2. Registrations (viz + practice) in js/viz and data */
const registeredViz = new Set();
const usedVideos = new Set();
const registeredPractice = new Set();
const duplicateViz = [];
function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) { scanDir(full); continue; }
    if (!f.endsWith('.js')) continue;
    const content = fs.readFileSync(full, 'utf8');
    let m;
    const vizRe = /(?:viz\.register|\.scene)\s*\(\s*['"]([^'"]+)['"]/g;   // SML.anim.scene(id, …) registers a viz too
    while ((m = vizRe.exec(content)) !== null) {
      // A second registration silently replaces the first one at runtime, so duplicates are errors.
      if (registeredViz.has(m[1])) duplicateViz.push(m[1] + ' (again in ' + path.relative(siteRoot, full) + ')');
      registeredViz.add(m[1]);
    }
    const pracRe = /practice\.register\s*\(\s*['"]([^'"]+)['"]/g;
    while ((m = pracRe.exec(content)) !== null) registeredPractice.add(m[1]);
  }
}
scanDir(path.resolve(siteRoot, 'js/viz'));
scanDir(path.resolve(siteRoot, 'data'));
duplicateViz.forEach((d) => addProblem('(registry)', 'viz', 'duplicate viz registration: ' + d));

/* 3. KaTeX */
let totalBlocks = 0;
let totalFormulas = 0;
const TOKEN = /`([^`]+)`|\$\$([\s\S]+?)\$\$|\$((?:\\\$|[^$])+?)\$/g;

function checkTeX(src, displayMode, pageId, loc) {
  totalFormulas++;
  try {
    katex.renderToString(src, { throwOnError: true, trust: true, strict: 'ignore', displayMode: !!displayMode, macros: Object.assign({}, global.SML.md.MACROS) });
  } catch (err) {
    addProblem(pageId, loc, `KaTeX [${displayMode ? 'display' : 'inline'}]: ${err.message} in TeX: "${src}"`);
  }
}
const TERM_RE = /\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]/g;
function checkMarkdownString(str, pageId, loc) {
  if (typeof str !== 'string') return;
  if (/[\t\x08\x0b\x0c]/.test(str)) addProblem(pageId, loc, 'control character in text (a TeX backslash was eaten by a normal JS string; use T`...`): ' + JSON.stringify(str.slice(0, 60)));
  TERM_RE.lastIndex = 0;
  let tm;
  while ((tm = TERM_RE.exec(str)) !== null) { const k = tm[2] || tm[1]; if (!global.SML.terms.get(k)) addProblem(pageId, loc, `term [[${k}]] not defined (data/terms.js or glossary)`); }
  TOKEN.lastIndex = 0;
  let m;
  while ((m = TOKEN.exec(str)) !== null) {
    const [, code, dmath, imath] = m;
    if (code != null) continue;
    if (dmath != null) checkTeX(dmath, true, pageId, `${loc} > $$...$$`);
    else if (imath != null) checkTeX(imath, false, pageId, `${loc} > $...$`);
  }
}

const KNOWN_BLOCK_TYPES = new Set([
  'p', 'h2', 'h3', 'h4', 'math', 'ul', 'ol', 'steps', 'table', 'callout', 'note', 'warn', 'good', 'errata', 'ext',
  'exam', 'deep', 'fold', 'outline', 'examqIndex', 'examqPick', 'fig', 'chips', 'html', 'past', 'graph', 'graphs', 'slide', 'fx', 'quiz', 'practice', 'viz', 'video', 'pending', 'mistakes', 'phraseIndex', 'pastIndex', 'glossaryTable', 'chapterHead', 'notes', 'reviewHead', 'kp', 'recall', 'daily', 'story', 'think', 'fade',
]);

/* 4. Recursive validator */
function validateQuizItem(item, pageId, loc) {
  if (!item || typeof item !== 'object') { addProblem(pageId, loc, 'Quiz item must be an object'); return; }
  if (Array.isArray(item.q)) validateBlocks(item.q, pageId, `${loc}.q`); else checkMarkdownString(item.q, pageId, `${loc}.q`);
  checkMarkdownString(item.answerText, pageId, `${loc}.answerText`);
  checkMarkdownString(item.qzh, pageId, `${loc}.qzh`); checkMarkdownString(item.azh, pageId, `${loc}.azh`);
  if (Array.isArray(item.explain)) validateBlocks(item.explain, pageId, `${loc}.explain`);
  else checkMarkdownString(item.explain, pageId, `${loc}.explain`);
  const type = item.type || (item.options ? 'mc' : 'show');
  if (type === 'mc') {
    if (!Array.isArray(item.options) || !item.options.length) addProblem(pageId, loc, 'MC question must have options');
    else {
      item.options.forEach((opt, idx) => checkMarkdownString(opt, pageId, `${loc}.options[${idx}]`));
      if (!Number.isInteger(item.answer) || item.answer < 0 || item.answer >= item.options.length) addProblem(pageId, loc, `MC answer ${item.answer} out of range`);
    }
  } else if (type === 'num') {
    if (typeof item.answer !== 'number' || !Number.isFinite(item.answer)) addProblem(pageId, loc, `Num answer ${item.answer} not finite`);
    if (item.unit) checkMarkdownString(item.unit, pageId, `${loc}.unit`);
  } else if (type === 'set') {
    const ok = (Array.isArray(item.answer) && item.answer.length) || (typeof item.answer === 'string' && item.answer.trim());
    if (!ok) addProblem(pageId, loc, 'Set answer empty');
  }
}

function validateBlock(b, pageId, loc) {
  totalBlocks++;
  if (typeof b === 'string') { checkMarkdownString(b, pageId, loc); return; }
  if (!b || typeof b !== 'object') { addProblem(pageId, loc, `Invalid block entry: ${typeof b}`); return; }
  if (!KNOWN_BLOCK_TYPES.has(b.t)) { addProblem(pageId, loc, `Unknown block type: "${b.t}"`); return; }
  ['title', 'text', 'lead', 'md', 'hint', 'caption'].forEach((k) => { if (b[k]) checkMarkdownString(b[k], pageId, `${loc}.${k}`); });

  if (b.t === 'math') { if (typeof b.tex === 'string') checkTeX(b.tex, true, pageId, `${loc}.tex`); else addProblem(pageId, loc, 'math block missing tex'); }
  if (b.t === 'fx') {
    if (b.intro) checkMarkdownString(b.intro, pageId, `${loc}.intro`);
    if (typeof b.tex !== 'string') addProblem(pageId, loc, 'fx block missing tex');
    else {
      checkTeX(b.tex, true, pageId, `${loc}.tex`);
      (b.parts || []).forEach((p, idx) => {
        if (!b.tex.includes(`fx-p${idx + 1}`)) addProblem(pageId, loc, `fx tex missing class fx-p${idx + 1}`);
        if (p.label) checkMarkdownString(p.label, pageId, `${loc}.parts[${idx}].label`);
        if (p.note) checkMarkdownString(p.note, pageId, `${loc}.parts[${idx}].note`);
      });
    }
  }
  if (b.t === 'table') {
    const headLen = Array.isArray(b.head) ? b.head.length : null;
    if (headLen != null) b.head.forEach((h, idx) => checkMarkdownString(h, pageId, `${loc}.head[${idx}]`));
    (b.rows || []).forEach((row, r) => {
      if (!Array.isArray(row)) { addProblem(pageId, loc, `row ${r} not an array`); return; }
      if (headLen != null && row.length !== headLen) addProblem(pageId, loc, `row ${r} has ${row.length} cells, head has ${headLen}`);
      row.forEach((cell, c) => checkMarkdownString(cell, pageId, `${loc}.rows[${r}][${c}]`));
    });
  }
  if (b.t === 'ul' || b.t === 'ol') (b.items || []).forEach((it, idx) => checkMarkdownString(it, pageId, `${loc}.items[${idx}]`));
  if (b.t === 'ul' && b.zh) {
    if (b.zh.length !== (b.items || []).length) addProblem(pageId, loc, `zh has ${b.zh.length} lines for ${(b.items || []).length} items`);
    b.zh.forEach((it, idx) => checkMarkdownString(it, pageId, `${loc}.zh[${idx}]`));
  }
  if (b.t === 'steps') (b.items || []).forEach((it, idx) => {
    if (typeof it === 'string') checkMarkdownString(it, pageId, `${loc}.items[${idx}]`);
    else if (Array.isArray(it)) validateBlocks(it, pageId, `${loc}.items[${idx}]`);
    else validateBlock(it, pageId, `${loc}.items[${idx}]`);
  });
  if (b.t === 'chips') (b.items || []).forEach((it, idx) => { if (it && it.text) checkMarkdownString(it.text, pageId, `${loc}.items[${idx}].text`); });
  if (b.t === 'fig') {
    if (!b.src) addProblem(pageId, loc, 'fig missing src');
    else if (!fs.existsSync(path.resolve(siteRoot, b.src))) addProblem(pageId, loc, `figure not found: ${b.src}`);
  }
  if (b.t === 'viz' && !registeredViz.has(b.id)) addProblem(pageId, loc, `viz "${b.id}" not registered`);
  if (b.t === 'video') {
    const v = global.SML.videos && global.SML.videos[b.id];
    if (!v) addProblem(pageId, loc, `video "${b.id}" not in data/videos.js (run manim/render.py)`);
    else usedVideos.add(b.id);
  }
  if (b.t === 'slide' && !fs.existsSync(path.resolve(siteRoot, 'reference/pages/' + b.src + '.jpg'))) addProblem(pageId, loc, `slide image ${b.src} not found`);
  const graphSpecs = b.t === 'graph' ? [b] : b.t === 'graphs' ? (b.items || []) : [];
  graphSpecs.forEach((g, gi) => {
    String(g.edges || '').trim().split(/\s+/).filter(Boolean).forEach((tok) => {
      const pair = tok.split('=')[0].split(':')[0], ends = pair.split(/[>-]/);
      if (ends.length !== 2 || !ends.every((n) => g.nodes && g.nodes[n])) addProblem(pageId, loc + '.graph[' + gi + ']', 'edge "' + tok + '" refers to an undefined node');
    });
    Object.keys(Object.assign({}, g.cls, g.notes)).forEach((n) => { if (!g.nodes || !g.nodes[n]) addProblem(pageId, loc + '.graph[' + gi + ']', 'class/note/label for undefined node ' + n); });
    if (g.caption) checkMarkdownString(g.caption, pageId, loc + '.graph.caption');
  });
  if (b.t === 'graphs' && b.caption) checkMarkdownString(b.caption, pageId, loc + '.caption');
  if (b.t === 'practice' && !registeredPractice.has(b.gen)) addProblem(pageId, loc, `practice generator "${b.gen}" not registered`);
  if (b.t === 'past') {
    if (b.topic) checkMarkdownString(b.topic, pageId, `${loc}.topic`);
    if (b.q) checkMarkdownString(b.q, pageId, `${loc}.q`);
    checkMarkdownString(b.qzh, pageId, `${loc}.qzh`); checkMarkdownString(b.azh, pageId, `${loc}.azh`);
  }
  if (b.t === 'quiz') (b.items || []).forEach((item, idx) => validateQuizItem(item, pageId, `${loc}.items[${idx}]`));
  if (b.t === 'chapterHead') { (b.goals || []).forEach((g, i) => checkMarkdownString(g, pageId, `${loc}.goals[${i}]`)); if (b.notExam) checkMarkdownString(b.notExam, pageId, `${loc}.notExam`); (b.symbols || []).forEach((r, i) => { checkMarkdownString(r[0], pageId, `${loc}.symbols[${i}][0]`); checkMarkdownString(r[1], pageId, `${loc}.symbols[${i}][1]`); }); (b.prereq || []).forEach((p) => { if (!meta[p]) addProblem(pageId, loc, `prereq ${p} not in catalogue`); }); }
  if (b.t === 'think') { checkMarkdownString(b.q, pageId, `${loc}.q`); if (Array.isArray(b.a)) validateBlocks(b.a, pageId, `${loc}.a`); else checkMarkdownString(b.a, pageId, `${loc}.a`); if (!b.q || !b.a) addProblem(pageId, loc, 'think needs q and a'); }
  if (b.t === 'fade') (b.plan || []).forEach((x, i) => checkMarkdownString(x, pageId, `${loc}.plan[${i}]`));
  if (b.t === 'fade') (b.items || []).forEach((it, i) => { checkMarkdownString(it.md, pageId, `${loc}.items[${i}].md`); (it.steps || []).forEach((st, j) => {
    const L = `${loc}.items[${i}].steps[${j}]`;
    if (st.ask) { checkMarkdownString(st.ask, pageId, L + '.ask'); checkMarkdownString(st.show, pageId, L + '.show'); if (typeof st.answer !== 'number' || !Number.isFinite(st.answer)) addProblem(pageId, L, 'fade ask needs numeric answer'); }
    else checkMarkdownString(st.md, pageId, L + '.md');
  }); });
  if (b.t === 'kp') (b.items || []).forEach((k, i) => { checkMarkdownString(k[0], pageId, `${loc}.items[${i}]`); if (k[1] && !meta[k[1]]) addProblem(pageId, loc, `keypoint link ${k[1]} not in catalogue`); });
  if (b.t === 'recall') (b.items || []).forEach((it, i) => {
    checkMarkdownString(it.qzh, pageId, `${loc}.items[${i}].qzh`); checkMarkdownString(it.azh, pageId, `${loc}.items[${i}].azh`);
    checkMarkdownString(it.q, pageId, `${loc}.items[${i}].q`);
    if (Array.isArray(it.a)) validateBlocks(it.a, pageId, `${loc}.items[${i}].a`); else checkMarkdownString(it.a, pageId, `${loc}.items[${i}].a`);
    if (!it.a) addProblem(pageId, loc, `recall item ${i} has no answer`);
    if (it.ch && !meta[it.ch]) addProblem(pageId, loc, `recall link ${it.ch} not in catalogue`);
  });
  if (Array.isArray(b.blocks)) validateBlocks(b.blocks, pageId, `${loc}.blocks`);
  if (Array.isArray(b.sol)) validateBlocks(b.sol, pageId, `${loc}.sol`);
  if (b.t !== 'quiz' && Array.isArray(b.explain)) validateBlocks(b.explain, pageId, `${loc}.explain`);
}
function validateBlocks(blocks, pageId, loc) { (blocks || []).forEach((b, idx) => validateBlock(b, pageId, `${loc}[${idx}]`)); }

/* 5. Run */
const catalog = global.SML.catalog || {};
const meta = catalog.meta || {};
(catalog.zones || []).forEach((z, zi) => (z.units || [{ items: z.items }]).forEach((u, ui) => (u.items || []).forEach((id) => {
  if (!meta[id]) addProblem(id, `catalog.zones[${zi}].units[${ui}]`, 'id missing from catalog.meta');
})));
const pages = global.SML.content.all();
for (const pid of Object.keys(pages)) {
  if (!meta[pid]) addProblem(pid, 'catalog.meta', 'content page not in catalogue');
  const page = pages[pid];
  ['eyebrow', 'title', 'en', 'lead'].forEach((k) => { if (page[k]) checkMarkdownString(page[k], pid, 'page.' + k); });
  (page.chips || []).forEach((c, idx) => { if (c && c.text) checkMarkdownString(c.text, pid, `page.chips[${idx}]`); });
  validateBlocks(page.blocks, pid, 'blocks');
}

Object.values(global.SML.terms.all()).forEach((t) => checkMarkdownString(t.plain, 'terms', t.en));
/* internal links: every #/id must be a page or a catalogue entry */
for (const pid of Object.keys(pages)) {
  const text = JSON.stringify(pages[pid]);
  const re = /#\/([A-Za-z0-9_-]+)/g; let mm;
  while ((mm = re.exec(text)) !== null) if (!pages[mm[1]] && !meta[mm[1]]) addProblem(pid, 'link', 'broken internal link #/' + mm[1]);
}
/* Manim videos: files exist, step times are increasing, captions parse (KaTeX) */
Object.entries(global.SML.videos || {}).forEach(([id, v]) => {
  ['src', 'poster'].forEach((k) => { if (!v[k] || !fs.existsSync(path.resolve(siteRoot, v[k]))) addProblem('videos', id, `${k} file missing: ${v[k]}`); });
  (v.steps || []).forEach((st, i) => {
    checkMarkdownString(st.say, 'videos', `${id}.steps[${i}]`);
    if (i && !(st.t > v.steps[i - 1].t)) addProblem('videos', `${id}.steps[${i}]`, 'step times must increase');
    if (!(st.t < v.dur)) addProblem('videos', `${id}.steps[${i}]`, 'step starts after the end of the video');
  });
});
console.log(`site check: ${Object.keys(pages).length} pages, ${totalBlocks} blocks, ${totalFormulas} formulas, ${problems.length} problems; videos ${usedVideos.size} used / ${Object.keys(global.SML.videos || {}).length} rendered`);
if (problems.length) {
  problems.forEach((p, i) => console.log(`  ${i + 1}. [${p.page}] ${p.loc}\n     ${p.message}`));
  process.exit(1);
}
