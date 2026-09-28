# Loops — preparation record

The /prepare chain for `02-control-flow/03-loops.md`, in order. Not rendered (the leading `_`). The lesson is edited in
place; this file is the evidence behind each change. Prepared 2026-09-28; every run on Temurin
21.0.12.1 (`/usr/libexec/java_home -v 21`), JLS 21 fetched the same day.

## Research

### Audience

- *Holds already* (earlier lessons, never re-taught): statement, block, compile vs run time,
  variable, declaration and "might not have been initialized", `int`/`double`, `i++`, `+=`,
  `*=`, `-=`, integer division, `0.1 + 0.2` drift, `String`, `print` vs `println`, `boolean`,
  comparisons, `&&`, `if`/`else`, the stray `;` after `if`, braces, `cannot find symbol` for a
  variable declared inside an `if` block (Conditionals' gotcha row).
- *Must not be assumed* (defined where it first appears): loop, pass, **infinite loop**,
  **off-by-one** (named, never defined), counter, scope (as "where a variable lives"), array
  (read as "a list of numbers" until Arrays), **`Iterable`** (named by javac's message), copy.
- *The one thing an expert forgets a newcomer does not know:* an infinite loop gives no error
  at all; the program only never finishes, and the reader needs to know how to stop it.

### Gaps in the chapter

Four lenses, most severe first: prerequisite, step, edge, structure. Coverage map row 2.1 (loops)
is `covered`; JLS 14 is `covered`. No GAP or partial rows for this lesson.

| Gap | Kind | Filled where | Source |
|---|---|---|---|
| The infinite loop is named and never shown; nothing says there is no error, or how to stop one | step | §1 non-example, an `expects-hang` proof (`before the loop`, then still running after 5 s); Ctrl+C; gotcha row | JLS §14.12 [1]; run (`timeout 3` exit 124) |
| A stray `;` after a `for` header: the block runs once, after the loop; `while (…);` hangs | edge | §3 non-example, proved (`hi` once); quiz 3; gotcha row | JLS §14.14.1 [3]; runs (`for`: `hi`; `while (i < 3);` still running after 3 s) |
| A `double` counter from `0.0` to `1.0` by `0.1` runs 11 times | edge | §3 non-example and the `int`-counter fix, both proved (`11` / `10`); quiz 5; gotcha row | run (`x` after ten steps: `0.9999999999999999`) |
| A variable declared in the `do` body is invisible to the condition (`cannot find symbol`) | edge | §2 bite, a compiler-error proof; gotcha row | JLS §6.3 [5]; run |
| The fix for the loop-scoped counter ("declare it before the loop") was stated, never run; its final value is one past the last pass | step | §3, a proof (`after: 3`) | JLS §6.3 [5]; run |
| A `String` in the enhanced `for`: `for-each not applicable to expression type`; `toCharArray()` | edge | §4 non-example and fix, both proved; gotcha row | JLS §14.14.2 [4]; runs |
| The `for` header's parts can hold several items (`i++, j--`) or be empty (`for (;;)`) | step | §3, a proof (`0 5` / `1 4` / `2 3`); link to Loop Control | JLS §14.14.1 [3]; runs (`for (;;)` with `break` prints `3`) |
| The `do-while` §2 bite was the same program as the worked example, so the section had no failure | structure | §2 bite replaced by the scope error; the missing-`;` message in the analysis | run (`';' expected`) |
| "Off-by-one" used without a definition | prerequisite | §1, bolded where the six-number run defines it | — |
| No objectives, checks or sources; the Predict box unanswered; gotchas were bullets; "Tutorial 10" | structure | objectives; ✅ (5 quizzes, 1 `<details>`); 📚 (5); 10-row table; link to Arrays | `/prepare` chain |

### Plan

| Section | Carries | Why here |
|---|---|---|
| Intro + objectives | the four shapes as a list; five objectives | the reader's map |
| §1 `while` | the counting loop; **non-example** missing update (hang); `<=` off-by-one | the simplest loop carries the two core bugs |
| §2 `do-while` | zero vs one pass; the closing `;`; body-scoped variable bite | needs §1 for the contrast |
| §3 `for` | the three parts and diagram; comma and empty parts; loop scope bite and its fix; **non-examples** stray `;` and `double` counter | the counting loop gathers the counting bugs |
| §4 enhanced `for` | every element; **non-example** `String`; the copy bite | no index, so last |
| 5 / 6 | summary rows per rule; a 10-row symptom → cause → fix table | read by the study profile |
| ✅ / 📚 | one check per objective; the Predict box answered | after all mechanisms |

### Unverified

- _None._

### Fact-check

A separate pass over the FINISHED draft, as a checker: every number, name, version, code line and
cite. Only what changed or was flagged is listed.

| Claim | Verdict | Fix |
|---|---|---|
| "the one bug that doesn't produce wrong output, just a program that never returns" | OK in substance; "just" is a hedge | "It produces no wrong output and no error, only a program that never returns" |
| Draft: the enhanced `for` accepts "an array or a Java collection" | WRONG as stated — JLS §14.14.2 and javac say "array or `java.lang.Iterable`" [4] | "an array or an `Iterable`, the type behind Java's collections" |
| "arrays get their full treatment in Tutorial 10" | WRONG as a reference — a number, not a lesson | link to Arrays |
| "The sum lands a hair below it, at `0.9999999999999999`" | OK — run: ten additions of `0.1` print `0.9999999999999999` | none |
| "A `while (i < 3);` … never ends" | OK — run: still running after `timeout 3` (exit 124) | none |
| "javac reports `';' expected` without it" (`do-while`) | OK — run: `Main.java:6: error: ';' expected` | none |
| "`for (;;)` … runs until something inside it leaves the loop" | OK — JLS §14.14.1 (the test is optional) [3]; run with `break` at 3 prints `3` | none |
| "the sandbox stops it at its time limit" | OK — the Run sandbox has a 30 s wall-clock limit (CLAUDE.md C1, from `synapse-rs`) | none |
| "stop a runaway program with Ctrl+C" | OK — the terminal's interrupt key; not a Java claim | none |
| Every `Output:` and `Compiler error:` block (16 fences, one `expects-hang`) | OK — `prove.py`: 16/16 | none |
| Quiz answers and the `<details>` | OK — quiz 1 from a run (`27`); quiz 2 from a run (`cannot find symbol`); quiz 3 from the §3 proof; quiz 4 from a run (`6`); quiz 5 from the §3 proof; `<details>` from a run (`10 8 6 4 2`, `0 1`, `0 1 2 3 4`) | none |

### Review

Scored 1–5 before the fix, the single highest-impact fix named, scored again after. Every `After`
must reach 4.

| Criterion | Before | Highest-impact fix | After |
|---|---|---|---|
| accuracy — Accuracy & currency — every claim true now, sourced or derived | 4 — the claims held; "Tutorial 10"; no sources | five JLS sources; the link; "`Iterable`" | 5 |
| clarity — Clarity for this reader — no term used before it is defined | 4 — a long opening paragraph; "off-by-one" undefined | the shapes as a list; off-by-one defined at its run; mean 13 words | 5 |
| sequence — Sequence — each section rests only on what came before it | 4 — sound order | the `double` counter placed after the counting `for`, linked back to Numbers & Arithmetic | 5 |
| practice — Worked example, non-example, checks with hidden solutions | 3 — §2's bite repeated its example; no infinite loop shown; the Predict box unanswered | the hang, stray-`;`, `double`-counter and `String` non-examples; five quizzes and a `<details>` | 5 |
| misconceptions — Misconceptions, edge cases, troubleshooting covered | 3 — five bullets | a 10-row symptom → cause → fix table, one row per real message | 5 |
| actionability — Actionable — the reader can DO the objectives afterwards | 4 — the reader can write loops; objectives implicit | five objectives, one check each | 4 — `break`, the way out of `for (;;)`, waits for the next lesson |

## What changed, and why

| Change | Why |
|---|---|
| Objectives line; ✅ (5 quizzes, 1 `<details>`); 📚 (5) | the /prepare contract |
| Intro: the four shapes as a list | lint: long sentences |
| §1: the missing-update hang, proved; off-by-one defined | gaps 1, 9 |
| §2: the closing `;`; the body-scoped variable bite | gaps 4, 8 |
| §3: comma and empty header parts; the declare-before fix, proved; stray-`;` and `double`-counter non-examples | gaps 2, 3, 5, 7 |
| §4: the `String` non-example and `toCharArray()`; "`Iterable`"; link to Arrays | gap 6; fact-check rows 2, 3 |
| Gotcha checklist → 10-row troubleshooting table; mental-model rows updated | the /prepare shape |
| Predict box as a numbered list, answered in `<details>` | the /prepare shape |
| Register: hedges ("actually", "just", "simply") removed, long sentences split | lint: 14 problems → 0 |
