# Lecture digest spec (for delegate agents)

Base dir: `/Users/ywbw/unimelboure_course/90051_sml/precious final/sml-review/reference`

Inputs per document KEY (e.g. L08, WS04):
- `text/KEY.md` — PDF text per page (`## pN`). Math in this text is often GARBLED (sub/superscripts, Greek, fractions lost).
- `pages/KEY/pNN.jpg` — rendered image of page N (two-digit, e.g. p03.jpg). **Open the image for every page that contains any formula, table, plot, diagram, or numbers**, and for any page whose text looks incomplete. Treat the image as ground truth over the text.
- `transcripts/KEY_transcript.txt` — lecture recording transcript, only for L02, L04, L05, L06, L09.

Output: write exactly one file per document: `digests/KEY.md`. Do not modify or create any other file. Write each digest as soon as that document is done (before starting the next one), so partial progress is saved.

Digest format (Markdown, English for all technical content; terms exactly as on slides):

```
# KEY — <lecture title> (<lecturer>, <N> pages)

## 1. Outline
- p1–p4: <topic>
- ...

## 2. Definitions
- **<Term>** (pN): <definition as on slide, faithful paraphrase>

## 3. Formulas
- (pN) <name>: $<LaTeX>$ — symbols: <what each symbol means as stated on slide>
  (Reconstruct LaTeX from the page IMAGE. Keep the slide's exact notation, indices, hats, transposes.)

## 4. Worked examples & concrete numbers
- (pN) <every concrete numeric example, table, figure with numbers, toy dataset, graph structure, step-by-step computation shown on the slide — reproduce ALL numbers>
- (pN, figure) <for diagrams/plots without numbers: one or two sentences on what the figure shows and what point it makes>

## 5. Algorithms / procedures
- (pN) <name>: numbered steps as on the slide (pseudo-code ok)

## 6. Key claims, properties, comparisons (likely examinable)
- (pN) <claim: pros/cons, conditions, when X fails, X vs Y, complexity, intuition statements, "mini summary" bullets>

## 7. Questions/exercises on slides
- (pN) <any question posed to the audience, quiz, exercise, with answer if given>

## 8. Possible slide errors / ambiguities
- (pN) <anything that looks inconsistent; say why; "none found" if none>

## 9. Transcript emphasis (only if a transcript exists)
- <points the lecturer stressed: "important", "exam", "remember", clarifications not on slides, intuition analogies> (quote short phrases)
```

Rules:
- Every bullet cites its page. Do not invent content not on the slides/transcript. No outside knowledge, no textbook additions.
- Do not drop numbers or formula details to save space; completeness matters more than brevity. Skip only pure title/copyright/logo boilerplate.
- If an image is unreadable, say so explicitly in section 8.
- When finished with all assigned documents, reply with a short report: which files were written, page counts covered, any pages you could not read.
