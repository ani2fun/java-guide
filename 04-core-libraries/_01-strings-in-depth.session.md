# Strings in Depth — preparation record

The /prepare chain for `04-core-libraries/01-strings-in-depth.md`, in order. Not rendered (the leading `_`). The lesson is edited in
place; this file is the evidence behind each change. Prepared 2026-09-28; every run on Temurin
21 (`/usr/libexec/java_home -v 21`), JLS 21 and the Java SE 21 API fetched from docs.oracle.com,
and JEPs from openjdk.org, the same day.

## Research

### Audience

- *Holds already* (earlier lessons, never re-taught): immutability, `charAt`, `substring`,
  `indexOf`, `strip`, `replace`, escape sequences, `+` left to right, the O(N²) cost named with a
  forward link here (Strings, the Basics); `String.format` and `printf` (Input & Output);
  `Arrays.toString`, and `println` of an array printing a type and hash (Arrays); `==` as
  identity, `Object.equals` as identity for arrays, interning of literals and constant
  expressions, computed strings not pooled (References, Equality & the Object Model).
- *Must not be assumed* (defined where it first appears): **capacity**, **regular expression**,
  **incidental white space**, text block, synchronized (in the `StringBuffer` note, as "several
  threads can share one buffer safely"), JIT warm-up (named only in passing, beside an
  illustrative run).
- *The one thing an expert forgets a newcomer does not know:* `split` takes a regex, so `"."`
  is not a dot.

### Gaps in the chapter

Four lenses, most severe first: prerequisite, step, edge, structure. Coverage map row 1.3 (text
with `String`, `StringBuilder`, text blocks) is `covered`; its gaps are below. The chapter's
other rows (1.1 wrappers, 5.1 `Deque` and sorting, JLS 18 inference, 3.2/3.5 records) belong to
lessons 02–06.

| Gap | Kind | Filled where | Source |
|---|---|---|---|
| `split` takes a regex: `split(".")` returns an empty array; trailing empty strings are dropped | edge | new §4, a non-example fence (`0`, `[21, 0, 4]`, `[a, b]`, `[a, b, , ]`); quiz 4; two gotcha rows | `String.split` API [10]; `Pattern` API [18]; run |
| The O(N²) claim is asserted, never shown | step | §1, an illustrative timing fence (3 sizes, real run pasted) | JLS §15.18.1 [1]; run |
| "The compiler optimizes a single expression" — unexplained, and the loop contrast missing | step | §1 mechanism: newly created per evaluation; one-step building; JEP 280 | JLS §15.18.1 [1]; JEP 280 [3] |
| The closing-`"""` rule is claimed, never shown | edge | §5, a non-example fence (delimiter at column 0 keeps 12 spaces); quiz 5 | JLS §3.10.6 [14]; run |
| A one-line text block `"""hello"""` does not compile | edge | §5, a `Compiler error:` fence; gotcha row | JLS §3.10.6 [14]; javac 21 |
| Trailing spaces are stripped; no final newline when `"""` ends the last line; `\s` and `\<newline>` | edge | §5, a fence (`[one`/`two]`, `[one two`, `5`); gotcha rows | JLS §3.10.6 [14], §3.10.7 [15]; run (`tab ` without `\s` gives length 4) |
| `StringBuilder` shown only appending; "mutable" never demonstrated | step | §2, a worked-example fence (`reverse`, `insert`, `deleteCharAt`, `setLength`, `setCharAt`, `append` returns `this`, capacity 16) | `StringBuilder` API [4]; run |
| Comparing builders: only `toString().equals`; `contentEquals` and `compareTo` (Java 11) absent | edge | §2 bullets; gotcha row | API [6] [7]; run (`true`, `true`, `0`) |
| `StringBuffer`, met in older code, never named | prerequisite | §2 note | `StringBuilder` API [4]; `StringBuffer` API [16] |
| `String.join` and `repeat` missing; "modern tools for assembling text" named only `formatted` | structure | §4 worked example | API [11]; run |
| No objectives, checks or sources; gotchas as bullets; "Tier 0", "Tutorial 19"; the Predict box unanswered | structure | objectives; ✅ (5 quizzes, 1 `<details>` with a proved fence); 10-row table; 📚 (18); links to Strings, the Basics and equals & hashCode | `/prepare` chain |

### Plan

| Section | Carries | Why here |
|---|---|---|
| Intro + objectives | the correctness fact becomes a performance fact; five objectives | the reader's map |
| §1 Cost of `+` | identity-hash proof, with the one-way inference made explicit; JLS "newly created"; one-step building (JEP 280); the loop's N²/2; illustrative timing | the cost first, so §2 is the fix |
| §2 `StringBuilder` | the append fence; **worked example** of in-place edits; capacity and growth; **non-example** `equals`; `contentEquals`, `compareTo`; `StringBuffer` | the fix, then its one trap |
| §3 `intern()` | recall the pool (linked, not re-taught); the proof; the pool mechanism, cited | builds on §2's identity trap |
| §4 Splitting and joining (new) | `split`, `join`, `repeat`; **non-example** `split(".")`; the limit | the inverse of building; the regex trap |
| §5 Formatting and text blocks | `formatted`; the three processing steps; the compile error; **non-example** closing `"""` at column 0; `\s` and `\` | the last tool, with its layout traps |
| 6 / 7 | summary rows per rule; a 10-row symptom → cause → fix table | read by the study profile |
| ✅ / 📚 | one check per objective; the Predict box answered with a proved fence | after all mechanisms |

### Unverified

- _None._

### Fact-check

A separate pass over the FINISHED draft, as a checker: every number, name, version, code line and
cite. Only what changed or was flagged is listed.

| Claim | Verdict | Fix |
|---|---|---|
| "Every `+` on strings allocates a new String" / "each `+` builds a brand-new String" | WRONG for a chain — JLS §15.18.1: an implementation "may choose to perform conversion and concatenation in one step" [1] | "each concatenation that runs"; the one-step case explained |
| "the compiler optimizes a single expression" | VERIFY — JDK 9+ javac emits `invokedynamic`, the library builds the result (JEP 280) [3] | "Java may build the result in one step"; JEP 280 cited |
| "A `StringBuilder` holds a resizable `char[]`" | WRONG since JDK 9 — JEP 254: `StringBuilder` uses the same byte-array representation as `String` [5] | "an internal array"; the bytes note cited |
| "occasionally doubling the array" | VERIFY — the API says only "automatically made larger" [4] | a run: capacities `16 34 70 142 286`, stated as OpenJDK's behaviour, twice plus 2 |
| "Literals go in at compile time" (the pool) | WRONG — JLS §3.10.5: literals are interned "as if by execution of the method `String.intern`", a run-time act [8] | quoted |
| "`intern()`'s cost is … a permanently retained string" | VERIFY — the API says nothing of retention [9]; no primary source for "permanently" | dropped |
| "`identityHashCode` returns a number tied to a specific object" | VERIFY — the API promises the same number for the same object, and distinct numbers only "as far as is reasonably practical" [2] | the one-way inference stated, cited |
| "A text block is just a `String`" / "the compiler removes the incidental leading whitespace" | OK in substance — JLS §3.10.6: "always of type String"; three steps; incidental white space includes trailing spaces [14] | the three steps listed; "just" removed (register) |
| `formatted` and text blocks "JDK 15" | OK — `formatted` "Since: 15" [12]; JEP 378 delivered in 15 [13] | none |
| `compareTo` on `StringBuilder` "since Java 11"; `repeat` Java 11; `join` 1.8 | OK — API "Since" lines [6] [11] | none |
| `StringBuffer` "synchronized"; `StringBuilder` "faster under most implementations" | OK — quoted from the two class pages [4] [16] | none |
| "`println` calls the builder's `toString()`" (draft) | OK with a step — `PrintStream.println(Object)` "calls at first String.valueOf(x)" [17] | `String.valueOf` named, cited |
| "Tier 0", "Tutorial 19's contract" | WRONG as references | links to Strings, the Basics and equals & hashCode |
| Timing fence output | OK — pasted from a run (`87`, `279`, `943` ms); a second run gave `93`, `262`, `919`; labelled illustrative; the prose says "more than three times", not "four" | none |
| Every `Output:` block and the compiler error (13 fences) | OK — `prove.py`: proved 11, illustrative 1, rejected 1 | none |
| Quiz answers and the `<details>` | OK — quiz 1 derived (N²/2); quiz 2 from the §2 proof; quiz 3 from the §3 proof; quiz 4 from a run (`0`); quiz 5 from a run (`____x` with the closing `"""` 4 columns left); the `<details>` from its proved fence and the §2 proof | none |

### Review

Scored 1–5 before the fix, the single highest-impact fix named, scored again after. Every `After`
must reach 4.

| Criterion | Before | Highest-impact fix | After |
|---|---|---|---|
| accuracy — Accuracy & currency — every claim true now, sourced or derived | 3 — `char[]` (pre-JDK 9); "literals at compile time"; "permanently retained"; "every `+`"; no sources | each fixed; eighteen primary sources; every fence proved | 5 |
| clarity — Clarity for this reader — no term used before it is defined | 3 — sentences to 59 words; capacity, incidental white space undefined | defined at first use; lists; mean 12 words, longest 28 | 5 |
| sequence — Sequence — each section rests only on what came before it | 4 — §3 re-taught the pool | §3 recalls and links it; `split` after building, text blocks last | 5 |
| practice — Worked example, non-example, checks with hidden solutions | 3 — the text-block trap claimed, not shown; the Predict box unanswered | the builder worked example; three non-examples (`equals`, `split(".")`, the closing `"""`); five quizzes; a `<details>` with a proof | 5 |
| misconceptions — Misconceptions, edge cases, troubleshooting covered | 3 — five bullets; `split`'s regex absent | the `split` edges; a 10-row symptom → cause → fix table | 5 |
| actionability — Actionable — the reader can DO the objectives afterwards | 3 — no objectives; the cost of `+=` asserted | objectives with a check each; the timing run makes the cost visible | 5 |

## What changed, and why

| Change | Why |
|---|---|
| Objectives line; ✅ (5 quizzes, 1 `<details>`); 📚 (18) | the /prepare contract |
| Intro: "Tier 0" replaced with a link; "each concatenation" | fact-check rows 1, 13 |
| §1: the identity-hash inference made one-way; the JLS and JEP 280 mechanism; the timing fence | gaps 2, 3; fact-check rows 1, 2, 7, 14 |
| §2: the worked example; capacity and growth; the JEP 254 note; `contentEquals`, `compareTo`; `StringBuffer` | gaps 7, 8, 9; fact-check rows 3, 4, 12 |
| §3: the pool recalled, not re-taught; the intern mechanism quoted; "permanently" dropped | fact-check rows 5, 6 |
| §4 (new): splitting and joining, the regex non-example | gaps 1, 10 |
| §5: the three processing steps; the compiler error; the closing-`"""` non-example; `\s` and `\` | gaps 4, 5, 6; fact-check row 8 |
| Gotcha checklist → 10-row troubleshooting table; mental-model rows added; TOC renumbered | the /prepare shape |
| Predict box as a numbered list, answered in `<details>` with a proved fence | the /prepare shape |
| Register: long sentences split; hedges removed ("actually", "just") | lint: 16 problems → 0 |
