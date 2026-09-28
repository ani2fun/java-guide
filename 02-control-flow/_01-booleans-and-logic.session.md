# Booleans & Logic — preparation record

The /prepare chain for `02-control-flow/01-booleans-and-logic.md`, in order. Not rendered (the leading `_`). The lesson is edited in
place; this file is the evidence behind each change. Prepared 2026-09-28; every run on Temurin
21.0.12.1 (`/usr/libexec/java_home -v 21`), JLS 21 fetched from docs.oracle.com the same day.

## Research

### Audience

- *Holds already* (earlier lessons, never re-taught): statement, compile vs run time, a compiler
  error and its caret, a thrown exception and its first line, `10 / 0` → `ArithmeticException`,
  variable, declaration, assignment, the eight primitives (`boolean` among them), literals,
  `int`/`double`, binary numeric promotion ("mixing numeric types"), `char` as a number
  (`'A' + 1` is `66`), precedence of `*` over `+`, scientific notation (`3.0e10`), `0.1 + 0.2`
  is `0.30000000000000004`, NaN from `0.0 / 0`, `Math.abs`, `+` joining text and numbers,
  `==` vs `.equals` on strings.
- *Must not be assumed* (defined where it first appears): **literal** as a term for `true`/`false`
  (the source called them "keywords"), comparison operator, logical operator, short-circuit,
  **De Morgan's law** (named, only half stated), precedence level, tolerance, **exclusive or**,
  `null` (named in an earned rule; pointed forward, not taught).
- *The one thing an expert forgets a newcomer does not know:* maths writes a range as
  1 < x < 10, and Java rejects exactly that.

### Gaps in the chapter

Four lenses, most severe first: prerequisite, step, edge, structure. Coverage map rows 1.2
(boolean expressions, precedence) and JLS 15 are `covered`; no GAP or partial rows for this lesson.

| Gap | Kind | Filled where | Source |
|---|---|---|---|
| A chained comparison, `1 < x < 10`, is the maths habit every beginner tries; it fails with `bad operand types for binary operator '<'` / `first type: boolean` | edge | §3 non-example + the `&&` range fix, both proved; quiz 2; gotcha row | JLS §15.20 [5] ("`a<b<c` … is always a compile-time error"); run |
| The `=`/`==` slip *compiles* when the variable is a `boolean` (`(done = true)`); the source's rule implied the compiler always catches it | edge | §2 non-example, proved; earned rule "use `done` itself"; gotcha row | JLS §15.26 [4]; run (`true` / `true`) |
| `!age >= 18` fails: `!` binds tighter than a comparison (`bad operand type int for unary operator '!'`) | edge | §5 bite, proved; gotcha row | JLS §15.15.6 [10]; run |
| `"adult: " + age >= 18` fails: `+` binds tighter than `>=` (`first type: String`) — the first thing a reader does is label a printed boolean | edge | §5 bite, proved; quiz 4; gotcha row | JLS Ch. 15 [9]; run |
| The tolerance fix `Math.abs(a - b) < 1e-9` was stated, never run | step | §5, a proof (`false` / `true`); `<details>` 1 | run; `Math.ulp` [13] for the scale caveat |
| De Morgan given one half only; `!(a \|\| b)` = `!a && !b` missing, and never shown on a real condition | step | §3 both laws, the working-age proof (`false false` / `true true`); quiz 1 | derived; run |
| A skipped right side skips its side effects (`++n` stays unrun) | edge | §4, a proof with `&&` vs `&` (`false 0` / `false 1`); quiz 3; gotcha row | JLS §15.23 [6]; run |
| No precedence ladder: the lesson named three levels, while the bites need `!` > `+` > comparisons > `==` > `&&` > `\|\|` | step | §5 table | JLS Ch. 15 [9], §15.21 ("lower precedence" than relational) |
| NaN is unequal to itself; `Double.isNaN` | edge | §5, a proof; gotcha row | JLS §15.21.1 [11]; `Double.isNaN` [12]; run |
| Comparisons promote mixed types (`5 == 5.0`, `'a' == 97`) | edge | §2, a proof | JLS §15.20.1, §15.21.1 [3]; run |
| A `boolean` compared with a number: `incomparable types: boolean and int` | edge | §1, a compiler-error proof; gotcha row | run |
| `^` (exclusive or), the third non-short-circuit boolean operator, unmentioned | edge | §4, a proof; beside `!=` | JLS §15.22.2 [8], §15.21.2; run |
| `0.1 + 0.2` re-taught as new, though Numbers & Arithmetic §5 teaches it | structure | §5 links back; the proof kept, the new content is the fix | — |
| No objectives, checks or sources; Predict box unanswered; gotchas were bullets | structure | objectives; ✅ (4 quizzes, 2 `<details>`); 📚 (13); 12-row table | `/prepare` chain |
| "Tutorial 4" and "Tier 2" references | structure | links to Strings, the Basics and References, Equality & the Object Model | — |

### Plan

| Section | Carries | Why here |
|---|---|---|
| Intro + objectives | the type, comparisons, logic, short-circuit as bullets; five objectives | the reader's map before the mechanisms |
| §1 `boolean` | literals (not keywords); `boolean b = 1`; `done == 1` | the type before anything computes one |
| §2 Comparisons | six operators; promotion across types; `=` vs `==`; **non-example** the boolean slip that compiles | needs the type from §1 |
| §3 Logical operators | truth table; **non-example** `1 < x < 10` and the `&&` fix; De Morgan, both laws, a real condition | needs comparisons to combine |
| §4 Short-circuit | the guard; `&` crash; side effects skipped; `^` | needs `&&`/`\|\|` from §3 |
| §5 Precedence, floats | ladder; `!age >= 18`; `"adult: " + age >= 18`; `0.1 + 0.2` (linked back); tolerance fix; NaN | precedence needs every operator above |
| 6 / 7 | summary rows per rule; a 12-row symptom → cause → fix table | read by the study profile |
| ✅ / 📚 | one check per objective; the Predict box answered | after all mechanisms |

### Unverified

- _None._

### Fact-check

A separate pass over the FINISHED draft, as a checker: every number, name, version, code line and
cite. Only what changed or was flagged is listed.

| Claim | Verdict | Fix |
|---|---|---|
| "`true` and `false` … they are keywords, not text" | WRONG — JLS §3.9: "`true` and `false` are not keywords", they are boolean literals [2] | "They are **boolean literals** … not text, and not keywords", cited |
| Draft: the `done == 1` message typed as `incompatible types: boolean and int` | WRONG — `prove.py` mismatch; javac 21 says `incomparable types: boolean and int` | pasted the real message |
| "the discipline is to read every condition as a question" (the protection "holds where a boolean is expected") | WRONG in part — with a `boolean` variable, `(done = true)` compiles (run) | the non-example and "never compare a `boolean` with `true`" |
| Draft: "`1e-9` suits values near 1, not values in the millions" | WRONG — `Math.ulp(1e6)` is `1.16e-10`, below `1e-9`; the spacing passes `1e-9` only near `1e9` (`Math.ulp(1e9)` = `1.19e-7`, run) | "Near `1e9`, neighbouring `double`s are about `1.2e-7` apart", cited [13] |
| Draft: "`!` binds tighter than everything else in the table" | WRONG — it shares level 1 with unary `-`, `++`, `--` | "`!` sits on the top level" |
| "`&` and `\|` always evaluate both sides" cited to §15.22.2 | VERIFY — §15.22.2 defines the values only; §15.23 states `&&` is "like `&`, but evaluates its right-hand operand only if …" | cite moved to [6]; the `&` crash proves it |
| "In C, writing `=` where you meant `==` is a classic silent bug" | OK, sharpened — Apple clang 21.0.0 on this Mac compiles `if (x = 5)` with a `-Wparentheses` warning and takes the branch (`taken, x=5`) | "C accepts `if (x = 5)` (at most with a warning)" |
| "C and Python treat zero as false and any other number as true" | OK — `python3 -c "print(bool(0), bool(7), bool(-1))"` → `False True True`; C by the run above | none |
| "The same strictness will reject `if (count)`" | OK — run: `incompatible types: int cannot be converted to boolean` | none |
| Precedence table | OK — JLS Ch. 15 grammar: unary > multiplicative > additive > relational > equality > `&` > `^` > `\|` > `&&` > `\|\|` > assignment [9] | none |
| "`^` on booleans gives the same answer as `!=`" | OK — JLS §15.21.2: "`!=` behaves the same as `^` … when applied to boolean operands" | none |
| Every `Output:` and `Compiler error:` block (22 fences) | OK — `prove.py`: 22/22 | none |
| Quiz answers and both `<details>` | OK — quiz 1 from a run (`true`, and the distributed form `false`); quiz 2 from runs (`1 < 2 < 3` → `bad operand types`; `boolean b = 1` proved; the `&&` form prints `true`); quiz 3 from the §4 proof; quiz 4 from the §5 proof; `<details>` 1 from the tolerance proof; `<details>` 2 from runs of the Predict lines (`true false true false false`; with `&`: `java.lang.ArithmeticException: / by zero`) | none |

### Review

Scored 1–5 before the fix, the single highest-impact fix named, scored again after. Every `After`
must reach 4.

| Criterion | Before | Highest-impact fix | After |
|---|---|---|---|
| accuracy — Accuracy & currency — every claim true now, sourced or derived | 3 — `true`/`false` called keywords; the `=`/`==` rule overstated; no sources | the literal fix, the boolean-slip non-example, thirteen primary sources | 5 |
| clarity — Clarity for this reader — no term used before it is defined | 3 — a 50-word opening sentence; mean 18 words; De Morgan named, half stated | split to bullets (mean 12, longest 27); both laws; a precedence ladder | 5 |
| sequence — Sequence — each section rests only on what came before it | 4 — sound order; `0.1 + 0.2` re-taught; "Tutorial 4", "Tier 2" | link back to Numbers & Arithmetic; links for the references | 5 |
| practice — Worked example, non-example, checks with hidden solutions | 3 — a bite per section; the tolerance fix unrun; the Predict box unanswered | the chained-comparison and boolean-slip non-examples, the tolerance proof, four quizzes, two `<details>` | 5 |
| misconceptions — Misconceptions, edge cases, troubleshooting covered | 3 — five bullets; no chaining, no `!age`, no `+` precedence, no NaN | a 12-row symptom → cause → fix table, one row per real message | 5 |
| actionability — Actionable — the reader can DO the objectives afterwards | 4 — the reader can write conditions; objectives implicit | five objectives, one check each | 4 — the conditions have no `if` to steer yet; the next lesson supplies it |

## What changed, and why

| Change | Why |
|---|---|
| Objectives line; ✅ (4 quizzes, 2 `<details>`); 📚 (13) | the /prepare contract |
| Intro split into bullets | lint: a 50-word sentence |
| §1: literals, not keywords; `done == 1` proof | fact-check row 1; gap 11 |
| §2: promotion proof; the boolean-slip non-example; earned rule rewritten | gaps 2, 10; fact-check row 3 |
| §3: truth table; `1 < x < 10` non-example and the `&&` fix; both De Morgan laws with the working-age proof | gaps 1, 6 |
| §4: side effects skipped (`&&` vs `&`); `^` | gaps 7, 12 |
| §5: precedence ladder; `!age >= 18` and `"adult: " + age >= 18` proofs; link back for `0.1 + 0.2`; tolerance proof; NaN | gaps 3, 4, 5, 8, 9, 13; fact-check rows 4, 5 |
| Gotcha checklist → 12-row troubleshooting table; mental-model rows updated | the /prepare shape |
| "Tutorial 4", "Tier 2" → links; the Predict box as a list | gap 15; lint |
| Register: hedges ("actually", "just", "simply") removed, walls split | lint: 19 problems → 0 |
