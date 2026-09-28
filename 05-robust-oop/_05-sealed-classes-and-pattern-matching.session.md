# Sealed Classes & Pattern Matching — preparation record

The /prepare chain for `05-robust-oop/05-sealed-classes-and-pattern-matching.md`, in order. Not rendered (the leading `_`). The lesson is edited in
place; this file is the evidence behind each change. Prepared 2026-09-28; every run on Temurin
21 (`/usr/libexec/java_home -v 21`), JLS 21 fetched from docs.oracle.com, and JEPs from
openjdk.org, the same day.

## Research

### Audience

- *Holds already* (earlier lessons, never re-taught): arrow `switch` expressions (Conditionals);
  `instanceof` and the test-then-cast (equals & hashCode; Inheritance & Polymorphism §4);
  `ClassCastException` (Inheritance & Polymorphism); records, their accessors and `toString`,
  and `sealed`/`permits`/`non-sealed` (Enums & Records); interfaces (Abstract Classes &
  Interfaces); `NullPointerException` (References, Equality & the Object Model); `printf`
  (Input & Output).
- *Must not be assumed* (defined where it first appears): **type pattern**, **binding**
  (pattern variable), **scope of a binding**, **pattern `switch`**, **exhaustive**, **guard**
  (`when`), `case null`, **dominated** case, **record pattern**, `var` in a pattern.
- *The one thing an expert forgets a newcomer does not know:* `default` does not catch `null`.

### Gaps in the chapter

Four lenses, most severe first: prerequisite, step, edge, structure. Coverage map rows: 3.5
(`instanceof` and `switch` patterns; sealed types) `covered` — re-checked by reading: guards,
`case null` and dominance were absent, so they are filled here as edges; JLS ch. 14 (Blocks,
Statements, and Patterns) `covered`.

| Gap | Kind | Filled where | Source |
|---|---|---|---|
| `when` guards absent — a JDK 21 switch feature the lesson never names | edge | §2: the `classify` fence (7 lines); §4 nested guard | JLS §14.11.1 [6]; JEP 441 [3]; run |
| `null` in a pattern `switch`: `default` does not catch it; `case null` never shown | edge | §2 non-example (`string: hi`, then `NullPointerException`); `case null` in `classify`; quiz 2; gotcha row | JLS §14.11.3 [8]; run |
| "Ordering care: specific before general" stated, never shown | edge | §2 non-example (`this case label is dominated by a preceding case label`); gotcha row | JLS §14.11.1 [6]; run |
| Binding scope: the negated early-return form, and `\|\|` where the binding is unbound | step | §1: the early-return fence (`5` / `-1`); the `\|\|` non-example (`cannot find symbol`); quiz 1; gotcha row | JLS §6.3.1 [5], §6.3.2.2 [10]; runs |
| Nested record patterns and `var` claimed, never shown (and the prose example had an unbalanced parenthesis) | step | §4: the `Line`/`Point` fence with a guard; quiz 4 | JLS §14.30.2 [9]; JEP 440 [2]; run |
| "Tutorial 21", a dead reference | structure | a link to Enums & Records | — |
| No objectives, checks or sources; gotchas as bullets; the 🧪 box unanswered | structure | objectives; ✅ (4 quizzes, 1 `<details>` with a proved fence); 8-row table; 📚 (10) | `/prepare` chain |

### Plan

| Section | Carries | Why here |
|---|---|---|
| Intro + objectives | the three ideas as a list; four objectives | the reader's map |
| §1 `instanceof` | the kept fence; JEP 394; the early-return form; **non-example** `\|\|` | the one-value pattern first |
| §2 Switch patterns | the kept fence; exhaustiveness for statements too; guards and `case null`; **non-examples** a `null` selector, a dominated case | many cases, built on §1's bindings |
| §3 Sealed exhaustiveness | the kept fences; JEP 409; §14.11.1.1 | closing the type set removes `default` |
| §4 Record patterns | the kept fence; accessor invocation cited; nested patterns with `var` and a guard | destructuring needs §2's cases and §3's closed set |
| 5 / 6 | summary rows per rule; an 8-row symptom → cause → fix table | read by the study profile |
| ✅ / 📚 | one check per objective; the Predict box answered with a proved fence | after all mechanisms |

### Unverified

- _None._

### Fact-check

A separate pass over the FINISHED draft, as a checker: every number, name, version, code line and
cite. Only what changed or was flagged is listed.

| Claim | Verdict | Fix |
|---|---|---|
| "Because it's an *expression*, every path must produce a value — so it needs a `default`" | WRONG in part — a pattern `switch` *statement* must be exhaustive too [7] (run: `the switch statement does not cover all possible input values`) | "A pattern `switch` must be exhaustive … That holds for a `switch` *statement* with patterns too" |
| "`record` (immutable data)" | WRONG in part — records are shallowly immutable (Enums & Records §3) | "`record` (a data carrier)" |
| "Record patterns nest (`case Line(Point(var x1, var y1), Point p2))`)" | WRONG as written — an unbalanced parenthesis; never compiled | a proved nested-pattern fence; the corrected form in the summary, run (`1 2 Point[x=3, y=4]`) |
| "binds each component by invoking its accessors under the hood, in declaration order" | VERIFY — the JLS says each component is obtained "by invoking the accessor method" [9]; it states no order | "gets each component by invoking its accessor method", cited |
| "Tutorial 21" | WRONG as a reference | a link to Enums & Records |
| "`o instanceof String s && s.isEmpty()` is the usual form" (draft) | OK — run: compiles, prints `not empty` for `"hello"` | none |
| "`default` does not match `null`" | OK — JLS §14.11.3 [8]; run | cited and shown |
| "A *guarded* case does not dominate" | OK — JLS §14.11.1 names only a "preceding unguarded case label" [6]; the `classify` fence compiles | cited |
| Versions: `instanceof` patterns 16, sealed 17, record patterns and pattern `switch` 21 | OK — JEP 394 [1], 409 [4], 440 [2], 441 [3], each "Closed / Delivered" in that release | cited |
| Every `Output:` and `Compiler error:` block (12 fences) | OK — `prove.py`: proved 9, rejected 3 | none |
| Quiz answers and the `<details>` | OK — quiz 1 from the §1 non-example; quiz 2 from the §2 non-example; quiz 3 from a run of the `Json` switch (`the switch expression does not cover all possible input values`); quiz 4 from the §4 fence; the `<details>` fence proved | none |

### Review

Scored 1–5 before the fix, the single highest-impact fix named, scored again after. Every `After`
must reach 4.

| Criterion | Before | Highest-impact fix | After |
|---|---|---|---|
| accuracy — Accuracy & currency — every claim true now, sourced or derived | 3 — "because it's an expression"; "immutable data"; an uncompilable nested example; no sources | each fixed; ten primary sources; every fence proved | 5 |
| clarity — Clarity for this reader — no term used before it is defined | 4 — a 6-sentence intro paragraph; sentences to 55 words | lists; mean 14 words, longest 30 | 5 |
| sequence — Sequence — each section rests only on what came before it | 5 | none needed | 5 |
| practice — Worked example, non-example, checks with hidden solutions | 3 — one non-example; the Predict box unanswered | seven new fences; four quizzes; a `<details>` with a proof | 5 |
| misconceptions — Misconceptions, edge cases, troubleshooting covered | 3 — `null`, dominance and binding scope absent | three non-examples; an 8-row table | 5 |
| actionability — Actionable — the reader can DO the objectives afterwards | 4 — guards, a JDK 21 tool, missing | guards shown; four objectives with a check each | 5 |

## What changed, and why

| Change | Why |
|---|---|
| Objectives line; ✅ (4 quizzes, 1 `<details>`); 📚 (10); TOC extended | the /prepare contract |
| Intro as a list; the Enums & Records link; "a data carrier" | register; gap 6; fact-check rows 2, 5 |
| §1: JEP 394; the early-return fence; the `\|\|` non-example | gap 4 |
| §2: exhaustiveness for statements; guards and `case null`; the `null` and dominance non-examples | gaps 1–3; fact-check row 1 |
| §3: JEP 409 and §14.11.1.1 cited | fact-check row 9 |
| §4: accessor invocation cited; the nested-pattern fence with `var` and a guard | gap 5; fact-check rows 3, 4 |
| Gotcha checklist → 8-row troubleshooting table; mental-model rows added | the /prepare shape |
| Predict box as a numbered list, answered in `<details>` with a proved fence | the /prepare shape |
| Register: long sentences split; hedges removed ("essentially", "actually") | lint: 16 problems → 0 |
