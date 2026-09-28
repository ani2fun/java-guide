# Conditionals — preparation record

The /prepare chain for `02-control-flow/02-conditionals.md`, in order. Not rendered (the leading `_`). The lesson is edited in
place; this file is the evidence behind each change. Prepared 2026-09-28; every run on Temurin
21.0.12.1 (`/usr/libexec/java_home -v 21`), JLS 21 and the JEPs fetched the same day.

## Research

### Audience

- *Holds already* (earlier lessons, never re-taught): statement, compile vs run time, reading a
  compiler error, variable, declaration without a value and "might not have been initialized"
  (Variables & Primitive Types), `final`, `int`/`long`/`double`/`char`/`boolean`, integer division
  (`85 / 10` is `8`), promotion to the wider type, `String` and `.equals`, `+` joining text,
  `boolean`, comparisons, `&&`/`||`/`!`, precedence of `+` over comparisons (Booleans & Logic).
- *Must not be assumed* (defined where it first appears): block, **empty statement** (a lone
  `;`), **dangling `else`**, **selector**, case label, **constant** (for `case`), fall-through,
  exhaustive, **`yield`**, expression vs statement.
- *The one thing an expert forgets a newcomer does not know:* `if (cond);` compiles, and the
  block after it always runs.

### Gaps in the chapter

Four lenses, most severe first: prerequisite, step, edge, structure. Coverage map row 2.1
(`if`/`else`, `switch` statements and expressions) is `covered`; its note concerns labelled
`continue` (lesson 04). JLS 14 is `covered`. No GAP or partial rows for this lesson.

| Gap | Kind | Filled where | Source |
|---|---|---|---|
| A stray `;` after `if ( … )` makes the block always run — the most common silent `if` bug | edge | §1 non-example, proved (`cold` at 25°); quiz 2; gotcha row | JLS §14.6 [3]; run |
| The dangling `else` binds to the nearest `if`, whatever the indentation | edge | §1, a proof (`done` only) and the braced fix (`full price`); gotcha row | JLS §14.5 [2]; runs |
| A chain that sets a variable with no final `else`: `variable grade might not have been initialized` | edge | §2 non-example, proved; gotcha row | JLS Ch. 16 [10]; run |
| `switch` on `String` never shown; case-sensitive matching | step | §3, a proof (`halted` / `unknown: Stop`); gotcha row | JLS §14.11 [4] ("equality is defined in terms of the `equals` method of class `String`"); run |
| Which selector types are allowed: `long`, `float`, `double`, `boolean` give `selector type … is not allowed` | edge | §3, a compiler-error proof (`long`); quiz 3; gotcha row | JLS §14.11 [4]; runs (all four) |
| `case` labels must be constants (`constant expression required`); a `final` constant works | edge | §3 prose; gotcha row | JLS §14.11 [4]; runs (`int limit` rejected, `final int LIMIT` prints `at limit`) |
| Several labels per case (`case 6, 7 ->`); the arrow form in a plain statement | step | §4, a proof (`weekend` / `sleep in`) | JLS §14.11.1 [4]; run |
| A block case needs `yield`; without it, `switch rule completes without providing a value` | step | §4, a proof and a compiler-error proof; gotcha row | JLS §14.21 [7], §15.28.1 [6]; runs |
| A ternary with mixed numeric branches takes the wider type (`1.0`) | edge | §5, a proof; quiz 5; gotcha row | JLS §15.25.2 [9]; run |
| A ternary inside a `+` chain fails (`bad operand types for binary operator '>='`) | edge | §5 non-example, proved; earned rule | JLS §15.25 [9]; run (with parentheses: `status: adult`) |
| `else if` is an `else` whose statement is an `if` — never said, so the chain looked like new syntax | prerequisite | §2 | JLS §14.9 [1] |
| `if (1)` was promised by Booleans & Logic and asserted, never shown | step | §1, a compiler-error proof (`if (count)`); gotcha row | JLS §14.9 [1]; run |
| The §2 chain omits braces right after §1's "always use braces" | structure | §2, one sentence saying why it is safe here | — |
| Block scope: a variable declared inside the `if` block is gone after it (`cannot find symbol`); coverage map 3.4 places scope in Methods | edge | gotcha row only | run |
| No objectives, checks or sources; the Predict box unanswered; gotchas were bullets; "Tier 4" | structure | objectives; ✅ (5 quizzes, 1 `<details>`); 📚 (11); 15-row table; link to Sealed Classes & Pattern Matching | `/prepare` chain |

### Plan

| Section | Carries | Why here |
|---|---|---|
| Intro + objectives | the four shapes as a list; five objectives | the reader's map |
| §1 `if`/`else` | `if (count)` refused; braceless bite; **non-example** stray `;`; dangling `else` and its fix | the one-decision form first; every trap of the braceless form together |
| §2 `else if` | `else if` = `else` + `if`; the chain and diagram; misordered bite; **non-example** chain with no `else` | builds on §1's nesting |
| §3 `switch` statement | fall-through bite; `String` selector; allowed types; constant labels | many-way choice on one value |
| §4 `switch` expression | arrows; several labels; arrow statement; `yield`, and its missing-`yield` error; exhaustiveness bite | fixes §3's trap |
| §5 `?:` | value vs action; mixed types → `1.0`; `if` as a value refused; **non-example** ternary in a `+` chain | the smallest choice, last |
| 6 / 7 | summary rows per rule; a 15-row symptom → cause → fix table | read by the study profile |
| ✅ / 📚 | one check per objective; the Predict box answered, including the `score / 10` rewrite | after all mechanisms |

### Unverified

- _None._

### Fact-check

A separate pass over the FINISHED draft, as a checker: every number, name, version, code line and
cite. Only what changed or was flagged is listed.

| Claim | Verdict | Fix |
|---|---|---|
| "`if (1)` would not compile" (source §1) | OK, unproved — run: `if (count)` gives `incompatible types: int cannot be converted to boolean` | now a compiler-error proof |
| Draft: "the ternary … is a conditional" with no word on the type | incomplete — `whole ? 1 : 2.5` prints `1.0` (run; JLS §15.25.2) | the mixed-type paragraph and proof |
| "(This exhaustiveness becomes even more powerful with `sealed` types and pattern matching in Tier 4.)" | WRONG as a reference — a tier number, not a lesson; the feature is JDK 21's (JEP 441 [11], "Release 21") | cited; linked to Sealed Classes & Pattern Matching |
| "Since JDK 14, a `switch` can be an expression" | VERIFY — was uncited | JEP 361 [8] ("Release 14") |
| "A `long`, `float`, `double` or `boolean` selector is refused" | OK — runs: `selector type long/float/double/boolean is not allowed` | none |
| "a literal, or a `final` variable set from one" | OK — run: `final int LIMIT = 5; case LIMIT:` prints `at limit`; plain `int limit` gives `constant expression required` | none |
| "A `String` case matches with `.equals`" | OK — JLS §14.11.1.2, under [4]: "equality is defined in terms of the `equals` method of class `String`" | none |
| "`?:` binds looser than `+` and every comparison" | OK — JLS §15.25 grammar: `ConditionalOrExpression ? Expression : …` [9] | none |
| "*(first of several as the parser recovers)*" | OK — run: javac reports 4 errors for `String s = if (cond) "yes" else "no";` | none |
| "`status: adult`" (the fixed ternary, stated in prose) | OK — run of `"status: " + (age >= 18 ? "adult" : "minor")` | none |
| Every `Output:` and `Compiler error:` block (22 fences) | OK — `prove.py`: 22/22 | none |
| Quiz answers and the `<details>` | OK — quiz 1 from a run of the misordered chain at 85 (`C`); quiz 2 from the §1 proof; quiz 3 from the §3 proof; quiz 4 from the §4 proof; quiz 5 from the §5 proof; `<details>` from runs: chain `A`/`C`/`F`; `day = 2` → `Tue`, and with no `break`s `Tue`/`Wed`/`other`; the `score / 10` switch → `100 A`, `90 A`, `85 B`, `70 C`, `69 F`, `-5 F` | none |

### Review

Scored 1–5 before the fix, the single highest-impact fix named, scored again after. Every `After`
must reach 4.

| Criterion | Before | Highest-impact fix | After |
|---|---|---|---|
| accuracy — Accuracy & currency — every claim true now, sourced or derived | 4 — the claims held; "Tier 4"; no sources | eleven primary sources; the link; the JDK versions cited | 5 |
| clarity — Clarity for this reader — no term used before it is defined | 3 — a 70-word opening paragraph; "selector", "exhaustive", "constant" used loosely | the shapes as a list; each term defined at first use; mean 13 words, longest 30 | 5 |
| sequence — Sequence — each section rests only on what came before it | 4 — sound order; the braceless §2 chain contradicts §1's rule silently | one sentence saying why the chain is safe without braces | 5 |
| practice — Worked example, non-example, checks with hidden solutions | 3 — a bite per section; no `yield`, no `String` switch; the Predict box unanswered | the stray-`;`, no-`else` and ternary-in-`+` non-examples; five quizzes; a `<details>` with the `score / 10` rewrite | 5 |
| misconceptions — Misconceptions, edge cases, troubleshooting covered | 3 — five bullets; no stray `;`, no dangling `else`, no selector types | a 15-row symptom → cause → fix table, one row per real message | 5 |
| actionability — Actionable — the reader can DO the objectives afterwards | 4 — the reader can branch; objectives implicit | five objectives with a check each | 5 |

## What changed, and why

| Change | Why |
|---|---|
| Objectives line; ✅ (5 quizzes, 1 `<details>`); 📚 (11) | the /prepare contract |
| Intro: the four shapes as a list | lint: a long sentence |
| §1: `if (count)` proof; stray-`;` non-example; dangling `else` and its fix | gaps 1, 2, 12 |
| §2: `else if` explained; braces note; no-`else` definite-assignment non-example | gaps 3, 11, 13 |
| §3: `String` selector; allowed selector types; constant labels | gaps 4, 5, 6 |
| §4: several labels, arrow statement; `yield` and its error; JEP 361 cite; the pattern-matching link | gaps 7, 8; fact-check rows 3, 4 |
| §5: mixed-type ternary; ternary in a `+` chain | gaps 9, 10; fact-check row 2 |
| Gotcha checklist → 15-row troubleshooting table; mental-model rows updated | the /prepare shape; gap 14 |
| Predict box as a numbered list, answered in `<details>` | the /prepare shape |
| Register: hedges ("actually", "just") removed, long sentences split | lint: 17 problems → 0 |
