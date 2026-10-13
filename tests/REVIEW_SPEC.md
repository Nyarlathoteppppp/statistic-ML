# Read-only content review (for delegates)

**Do not modify any file.** Your final message is your report.

Site root: `precious final/sml-review/`. Content lives in JS data files (Markdown strings with `$…$` LaTeX inside JS string literals; backslashes may be doubled `\\` in normal strings or single inside String.raw `T\`...\``).
Ground truth, in priority order:
1. Slide page images `reference/pages/Lxx/pNN.jpg` (open them to check any number, formula or claim you doubt).
2. Slide text `reference/text/Lxx.md` and digests `reference/digests/Lxx.md` (digests were machine-written and may contain errors; images win).
3. Past exam images `reference/exam_figs/EX2026P_pNN.png`, `EX2025P_pNN.png`, `EX2021_pNN.png`.

Find, in your assigned files:
- factual / numerical errors versus the slides; arithmetic errors in worked examples; wrong quiz answers (check every numeric answer, every mc `answer` index against `options`, every `set` answer);
- formulas with wrong indices, signs, transposes, missing terms;
- wrong page citations (e.g. "L09 p33" when the content is on another page) — only report if clearly wrong;
- claims attributed to the slides that the slides do not make; over-generalisations;
- English "exam phrasing" answers that are technically wrong or would lose marks.
Ignore style, Chinese wording, layout, and anything marked "课件未讲" unless it is wrong.

Report format — one bullet per issue:
`[file] location (page id + section/quote ≤ 15 words) — what is wrong — evidence (slide page / calculation) — suggested fix — confidence high/medium/low`
End with a one-line overall verdict. If you find nothing in a file, say so explicitly.
