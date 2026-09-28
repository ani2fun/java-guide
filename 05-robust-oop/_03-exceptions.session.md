# Exceptions — preparation record

The /prepare chain for `05-robust-oop/03-exceptions.md`, in order. Not rendered (the leading `_`). The lesson is edited in
place; this file is the evidence behind each change. Prepared 2026-09-28; every run on Temurin
21 (`/usr/libexec/java_home -v 21`), JLS 21 and the Java SE 21 API fetched from docs.oracle.com
the same day.

## Research

### Audience

- *Holds already* (earlier lessons, never re-taught): `NullPointerException` (References,
  Equality & the Object Model); `ArithmeticException` and `/ by zero` (Numbers & Arithmetic);
  `Integer.parseInt` and `NumberFormatException` crashing a program (Input & Output); arrays and
  `ArrayIndexOutOfBoundsException` (Arrays); methods and the call of one method by another
  (Methods); `extends`, `super(msg)`, subclass relations (Inheritance & Polymorphism);
  interfaces and `implements` (Abstract Classes & Interfaces).
- *Must not be assumed* (defined where it first appears): **exception**, **throw**,
  **checked** vs **unchecked**, `Error`, **stack trace**, **call stack**, **multi-catch**,
  `finally`, `AutoCloseable`, **suppressed** exception.
- *The one thing an expert forgets a newcomer does not know:* a stack trace is read top down — the
  first `at` line is where the exception was thrown, and each line below it is a caller.

### Gaps in the chapter

Four lenses, most severe first: prerequisite, step, edge, structure. Coverage map rows: 4.1
(`try`/`catch`/`finally`, try-with-resources, **multi-catch**, custom exceptions) `covered`, with
"check multi-catch is taught, not only named". Checked by reading: multi-catch was **not even
named** anywhere in the book (`grep 'catch (… |'` found nothing). Filled here. JLS ch. 11
`covered`.

| Gap | Kind | Filled where | Source |
|---|---|---|---|
| Multi-catch absent (coverage map 4.1) — with several `catch` clauses and their order | edge | new §3: a multi-catch fence (`skipped 1: NumberFormatException` / `skipped 2: ArrayIndexOutOfBoundsException`); the related-alternatives error; the unreachable-clause error; quiz 3; 2 gotcha rows | JLS §14.20 [4], §11.2.3 [3]; runs |
| "Propagates up the call stack" stated; no stack trace ever read | step | §4: a three-method trace, read top down; gotcha row | JLS §14.18 [8]; run |
| "Returning from `finally` silently discards the `try`'s exception" claimed, never shown | edge | §5 non-example (`from finally`); the `-Xlint:finally` warning; quiz 5; gotcha row | JLS §14.20.2 [5]; runs |
| "Suppressing secondary exceptions from `close`" named, never shown | edge | §6: a fence with `getSuppressed()` (`suppressed: close of file failed`); gotcha row | JLS §14.20.3 [6]; `Throwable` API [12]; run |
| `finally` skipped by `System.exit` ("or power loss") | edge | §5, a fence (`in try` only); gotcha row | `Runtime` API [11]; run |
| A `catch` for a checked exception the `try` cannot throw | edge | §2 prose; gotcha row | JLS §11.2.3 [3]; run (`exception IOException is never thrown in body of corresponding try statement`) |
| Two resources' close order asked by the 🧪 box, never shown | step | ✅ quiz 4 and the `<details>` fence (`close B` / `close A`) | JLS §14.20.3 [6]; run |
| "Tutorial 5", "Tutorial 33", dead references | structure | links to Input & Output and I/O, Files & NIO.2 | — |
| No objectives, checks or sources; gotchas as bullets; the 🧪 box unanswered | structure | objectives; ✅ (5 quizzes, 1 `<details>` with a proved fence); 11-row table; 📚 (12) | `/prepare` chain |

### Plan

| Section | Carries | Why here |
|---|---|---|
| Intro + objectives | exception, checked/unchecked, the tools, as a list; five objectives | the reader's map |
| §1 `try`/`catch` | the kept fence; the Input & Output link | the recovery idea first |
| §2 Hierarchy | the kept fences; `Error` quoted; the unreachable-`catch` rule | checked vs unchecked before any clause rules |
| §3 Several clauses, multi-catch (new) | the multi-catch fence; `lub` and implicit `final`; **non-examples** related alternatives, general-before-specific | needs the hierarchy of §2 for "related by subclassing" |
| §4 `throw`/`throws`/custom | the kept fence; the three tools as a list; a stack trace read top down | propagation needs `throw` |
| §5 `finally` | the kept fence; `System.exit`; **non-example** `return` in `finally` | cleanup after raising |
| §6 try-with-resources | the kept fence; reverse order; the suppressed-exception fence; the NIO.2 link | built on `finally` |
| 7 / 8 | summary rows per rule; an 11-row symptom → cause → fix table | read by the study profile |
| ✅ / 📚 | one check per objective; the Predict box answered with a proved fence | after all mechanisms |

### Unverified

- _None._

### Fact-check

A separate pass over the FINISHED draft, as a checker: every number, name, version, code line and
cite. Only what changed or was flagged is listed.

| Claim | Verdict | Fix |
|---|---|---|
| "Only a JVM halt (`System.exit`) or power loss skips it" | WRONG in part — a `try` that never ends skips it too; "power loss" is not a Java rule | "skipped only if the `try` never ends, or the JVM stops first"; `System.exit` shown (`in try` only) and cited [11] |
| "The JVM guarantees `finally` executes … whatever caused the exit" | OK as stated for completion, exception and `return` — JLS §14.20.2 [5] | cited |
| "never `return` (or `throw`) from inside it … silently discards" | OK — JLS §14.20.2: "reason R is discarded" [5]; run: `from finally`, no trace | shown as a non-example |
| "javac compiles this without a word" (draft) | OK — run: plain `javac` prints nothing; `javac -Xlint:finally` prints `warning: [finally] finally clause cannot complete normally` | none |
| "If none is found, … the JVM prints a stack trace" (draft) | WRONG in part — the thread ends, and the default uncaught-exception handler prints it | "by default a **stack trace** is printed" |
| "open the first `at` line under the message" (draft gotcha) | WRONG in part — for a JDK method the first frame is inside the JDK (run: `NumberFormatException.forInputString` for `parseInt("two")`) | "the first line naming your own code is where to look" |
| "`B` closes first because `B` depends on `A`" (draft `<details>`) | WRONG in degree — the JLS fixes the order [6], not a dependency; `B` *may* use `A` | "A resource opened later may use an earlier one" |
| "Error (serious JVM problems you don't catch)" | OK — `Error` API: "serious problems that a reasonable application should not try to catch" [10] | quoted |
| "within `Exception`, `RuntimeException` … unchecked; everything else … checked" | OK — JLS §11.1.1 [1] | cited |
| "The compiler expands `try (R r = ...)` into a `try`/`finally`" | OK — JLS §14.20.3.1 gives the translation [7] | cited |
| "closed … in reverse order of opening" | OK — JLS §14.20.3: "closed in the reverse order" [6] | cited |
| Every `Output:` and `Compiler error:` block (14 fences) | OK — `prove.py`: proved 11, rejected 3 | none |
| Quiz answers and the `<details>` | OK — quizzes 1 and 4 from the `<details>` fence; quiz 2 from a run of `static void read() throws IOException { }` called from `main` (`unreported exception IOException; must be caught or declared to be thrown`); quiz 3 from the §3 fence; quiz 5 from the §5 fence | none |

### Review

Scored 1–5 before the fix, the single highest-impact fix named, scored again after. Every `After`
must reach 4.

| Criterion | Before | Highest-impact fix | After |
|---|---|---|---|
| accuracy — Accuracy & currency — every claim true now, sourced or derived | 4 — "power loss"; claims about `finally` and suppression unproved; no sources | twelve primary sources; each claim run | 5 |
| clarity — Clarity for this reader — no term used before it is defined | 4 — a 5-sentence intro paragraph; sentences to 45 words | lists; mean 14 words, longest 30 | 5 |
| sequence — Sequence — each section rests only on what came before it | 4 — "propagates" before a trace was ever read | the trace placed with `throw` in §4 | 5 |
| practice — Worked example, non-example, checks with hidden solutions | 3 — two non-examples; the Predict box unanswered | seven new fences; five quizzes; a `<details>` with a proof | 5 |
| misconceptions — Misconceptions, edge cases, troubleshooting covered | 3 — a 5-bullet list | an 11-row table, one row per real message | 5 |
| actionability — Actionable — the reader can DO the objectives afterwards | 3 — multi-catch, an exam objective, absent | §3, and five objectives with a check each | 5 |

## What changed, and why

| Change | Why |
|---|---|
| Objectives line; ✅ (5 quizzes, 1 `<details>`); 📚 (12); TOC extended | the /prepare contract |
| Intro as a list | register |
| §1: the Input & Output link | gap 8 |
| §2: `Error` quoted; the checked rule cited; the unreachable-`catch` rule | gap 6; fact-check rows 8, 9 |
| §3 (new): several `catch` clauses and multi-catch, with two compile errors | gap 1 (coverage map 4.1) |
| §4: the three tools as a list; a stack trace read top down | gap 2; fact-check rows 5, 6 |
| §5: `System.exit`; the `return`-in-`finally` non-example; the `-Xlint:finally` warning | gaps 3, 5; fact-check rows 1–4 |
| §6: the suppressed-exception fence; the NIO.2 link | gaps 4, 8; fact-check rows 10, 11 |
| Gotcha checklist → 11-row troubleshooting table; mental-model rows added | the /prepare shape |
| Predict box as a numbered list, answered in `<details>` with a proved fence | gap 7; the /prepare shape |
| Register: long sentences and walls split; hedges removed ("actually", "rather") | lint: 18 problems → 0 |
