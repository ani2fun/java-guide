# Loop Control & Patterns — preparation record

The /prepare chain for `02-control-flow/04-loop-control-and-patterns.md`, in order. Not rendered (the leading `_`). The lesson is edited in
place; this file is the evidence behind each change. Prepared 2026-09-28; every run on Temurin
21.0.12.1 (`/usr/libexec/java_home -v 21`), JLS 21 fetched the same day.

## Research

### Audience

- *Holds already* (earlier lessons, never re-taught): `%`, integer division truncates, the
  `(double)` cast, `ArithmeticException: / by zero`, `Integer.MIN_VALUE`/`MAX_VALUE`, `+=`, `++`,
  `boolean`, `&&`, `!=`, `if`/`else`, the colon `switch` and its `break` (Conditionals), the four
  loops, loop scope, the infinite loop and `expects-hang` output, the enhanced `for` over an
  array literal, the "declare before" fix.
- *Must not be assumed* (defined where it first appears): **nested loop** (the source's first
  bite used one untaught), **sentinel** (`found = -1`), label, **accumulator** (used, undefined),
  seed, flag, average.
- *The one thing an expert forgets a newcomer does not know:* the `break` that ends a `switch`
  case is the same `break`, so inside a loop it leaves the `switch` and the loop carries on.

### Gaps in the chapter

Four lenses, most severe first: prerequisite, step, edge, structure. Coverage map row 2.1
(`break`, `continue`) is `covered`, with the note "Labelled `continue` is missing beside labelled
`break` (02-control-flow/04 §3)" — filled here.

| Gap | Kind | Filled where | Source |
|---|---|---|---|
| Labeled `continue` missing beside labeled `break` (coverage map 2.1) | structure | §3, a proof (`1,1  2,1  2,2  3,1  3,2  3,3`); heading renamed; quiz 2 | JLS §14.16 [2]; run |
| `break` inside a `switch` inside a loop leaves only the `switch`; the source said `break` exits "the single loop that encloses it" | edge | §1 non-example (`checked 1` … `checked 4`) and the labeled fix in §3 (`checked 1` / `found 2`); quiz 1; gotcha row | JLS §14.15 [1]; runs |
| The `while` + `continue` hang was stated, never shown | step | §2 non-example, an `expects-hang` proof (`0` / `1`), and the fixed loop (`1 2 4 5`); quiz 3; gotcha row | JLS §14.16 [2]; runs (`timeout 3` exit 124) |
| Nested loops used in §1's bite before any lesson taught them | prerequisite | §1, a worked nested loop (two rows of three pairs) | run |
| Empty input: the loop never runs, `max` keeps its seed (`-2147483648`), `sum / count` throws | edge | §4 non-example, proved; gotcha rows | run |
| The average, the most common accumulation, missing; `int / int` truncates it | step | §4, a proof (`7` / `7.5`); quiz 5; gotcha row | run |
| The "flag" pattern named, never shown | step | §4, a proof (`true`) | run |
| `found = -1` is a sentinel, never explained | prerequisite | §1 analysis | — |
| `unreachable statement`, `break outside switch or loop`, `continue outside of loop` | edge | §1 prose; gotcha rows | JLS §14.22 [5], §14.15 [1], §14.16 [2]; runs |
| "Accumulator" used undefined | prerequisite | §4 first sentence | — |
| The Predict box's nested loop printed `1,1` for both `break` and `break outer` (run), so it tested nothing; written as pseudo-code | structure | rewritten in Java with `1..3`: `1,1  3,1  3,2  3,3` vs `1,1`; answered in `<details>` | runs |
| No objectives, checks or sources; gotchas were bullets; "Tutorial 11" | structure | objectives; ✅ (5 quizzes, 1 `<details>`); 📚 (5); 11-row table; link to Methods | `/prepare` chain |

### Plan

| Section | Carries | Why here |
|---|---|---|
| Intro + objectives | the three controls as a list; five objectives | the reader's map |
| §1 `break` | the search; sentinel; unreachable and outside-loop errors; nested loops; the inner-`break` bite; **non-example** `break` in a `switch` | nested loops before the bite that needs them |
| §2 `continue` | the filter; diagram; the skipped-body bite; **non-example** `while` + `continue` hang, and the fix | the mirror of `break` |
| §3 Labeled | labeled `break`; the `switch` fix; labeled `continue`; undefined label | needs nesting (§1) and both controls |
| §4 Accumulation | sum/count/max; average; flag; the `max = 0` bite; **non-example** empty input | the patterns use `break` for the flag |
| 5 / 6 | summary rows per rule; an 11-row symptom → cause → fix table | read by the study profile |
| ✅ / 📚 | one check per objective; the Predict box rewritten and answered | after all mechanisms |

### Unverified

- _None._

### Fact-check

A separate pass over the FINISHED draft, as a checker: every number, name, version, code line and
cite. Only what changed or was flagged is listed.

| Claim | Verdict | Fix |
|---|---|---|
| "`break` exits the **single loop that encloses it** — the innermost one" | WRONG — JLS §14.15: the innermost enclosing `switch`, `while`, `do` or `for` [1]; run: a `break` in a `switch` case did not stop the loop | "the innermost statement … a loop, or a `switch`"; the `switch` non-example |
| Predict box: "predict … with a plain `break`, then with `break outer`" | WRONG as a test — both print only `1,1` (run), so the two answers cannot differ | rewritten over `1..3`: `1,1  3,1  3,2  3,3` vs `1,1` (run) |
| "extracting the nested search into its own method (Tutorial 11)" | WRONG as a reference | link to Methods |
| "structured loops were meant to replace goto" | OK — JLS §14.7: "the Java programming language has no `goto` statement" [3] | cited |
| "`unreachable statement`" / "`break outside switch or loop`" / "`continue outside of loop`" | OK — each from a run on javac 21 | none |
| "`Integer.MIN_VALUE`, the smallest `int`" | OK — the empty-input proof prints `-2147483648` [4] | none |
| Every `Output:` and `Compiler error:` block (17 fences, one `expects-hang`) | OK — `prove.py`: 17/17 | none |
| Quiz answers and the `<details>` | OK — quiz 1 from the §1 proof (4 lines); quiz 2 from the §3 proof (6 pairs); quiz 3 from the §2 hang proof; quiz 4 from a run (`0`); quiz 5 from a run (`7`); `<details>` from runs: `1,1  3,1  3,2  3,3` / `1,1`; `0 3`; `2`; `-11` | none |

### Review

Scored 1–5 before the fix, the single highest-impact fix named, scored again after. Every `After`
must reach 4.

| Criterion | Before | Highest-impact fix | After |
|---|---|---|---|
| accuracy — Accuracy & currency — every claim true now, sourced or derived | 3 — `break` said to exit only loops; the Predict box could not tell its two cases apart; no sources | the `switch` non-example and JLS wording; the Predict box rebuilt; five sources | 5 |
| clarity — Clarity for this reader — no term used before it is defined | 3 — nested loop, sentinel and accumulator undefined; a 90-word intro paragraph | each defined at first use; the controls as a list; mean 13 words | 5 |
| sequence — Sequence — each section rests only on what came before it | 3 — §1's bite rests on nested loops no lesson taught | a worked nested loop before the bite | 5 |
| practice — Worked example, non-example, checks with hidden solutions | 3 — a bite per section; the `while` hang unshown; no hidden answers | the `switch`, hang and empty-input non-examples; five quizzes; a `<details>` | 5 |
| misconceptions — Misconceptions, edge cases, troubleshooting covered | 3 — five bullets | an 11-row symptom → cause → fix table, one row per real message | 5 |
| actionability — Actionable — the reader can DO the objectives afterwards | 4 — the patterns are shown; average and flag missing | average and flag proofs; five objectives with a check each | 5 |

## What changed, and why

| Change | Why |
|---|---|
| Objectives line; ✅ (5 quizzes, 1 `<details>`); 📚 (5) | the /prepare contract |
| Intro: the controls as a list | lint: long sentences |
| §1: sentinel; unreachable and outside-loop errors; a worked nested loop; the `break`-in-`switch` non-example; `break` scope corrected | gaps 2, 4, 8, 9; fact-check row 1 |
| §2: the `while` + `continue` hang and its fix | gap 3 |
| §3: heading renamed; the labeled fix for the `switch`; labeled `continue`; `goto` cited; link to Methods | gap 1; fact-check rows 3, 4 |
| §4: accumulator defined; average; flag; empty-input non-example; seeds as a list | gaps 5, 6, 7, 10 |
| Gotcha checklist → 11-row troubleshooting table; mental-model rows updated | the /prepare shape |
| Predict box rebuilt in Java over `1..3`, as a numbered list, answered | gap 11; fact-check row 2 |
| Register: hedges ("actually", "just") removed, long sentences split | lint: 21 problems → 0 |
