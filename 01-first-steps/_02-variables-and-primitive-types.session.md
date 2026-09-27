# Variables & Primitive Types — preparation record

The /prepare chain for `01-first-steps/02-variables-and-primitive-types.md`, in order. Not
rendered (the leading `_`). The lesson is edited in place; this file is the evidence behind each
change. Prepared 2026-09-27, from the RUNBOOK carry-over notes, every run repeated on OpenJDK
21.0.10.

**Source access.** This session's network policy blocked `docs.oracle.com` and `openjdk.org`, so
WebFetch could not open the JLS or JEP pages. Each cited rule was checked against the page's own
text as quoted in a search index restricted to those domains, and the ranges against the OpenJDK
21 source (`java/lang/Byte.java`, `Short.java`, `Character.java` on raw.githubusercontent.com,
openjdk/jdk21u). Every behaviour claim is also proved by a run.

## Research

### Audience

- *Holds already* (from [What Java is](01-what-java-is-and-running-code.md)): program, statement,
  class, method, `main`, compiler (`javac`), JVM, compile time vs run time, reading a compiler
  error and its caret, `println`/`print`, comments, terminal, case-sensitivity of names.
- *Must not be assumed* (each defined in plain words where it first appears): variable, type,
  declare, assign, statically and **dynamically** typed (the source used "dynamically typed"
  undefined), primitive, reference (named only), **local variable**, **initialized**,
  **identifier**, **keyword**, **bit**, range, constant, literal, `String` (used before, never
  said to be a non-primitive), **initializer**, infer, overflow (named; taught next lesson).
- *The one thing an expert forgets a newcomer does not know:* a local variable declared without a
  value is not `0`; reading it is a compile error.

### Gaps in the chapter

Four lenses, most severe first. Coverage map: JLS ch. 16 (Definite Assignment) GAP, H — owned by
this lesson; 3.4 (`var`) partial; JLS ch. 3 identifiers, L.

| Gap | Kind | Filled where | Source |
|---|---|---|---|
| Definite assignment: reading a declared, unassigned local is `variable x might not have been initialized`, the first error most beginners meet; never shown (coverage map JLS 16, H) | edge | §1 "Declaring now, giving the value later", a compiler-error proof; quiz 2 | JLS ch. 16 [1]; javac 21 run |
| Declaring without an initializer (`int age; age = 25;`) is never shown, so "declare" and "assign" read as one act | prerequisite | §1, a run proof | derived; run |
| The 🧪 box turns on `byte c = 5` compiling while `byte b = 200` does not; the lesson never says why (constant narrowing) | step | §3 "Why `byte b = 100;` compiles", with a proof and a non-example (`byte b = n`) | JLS §5.2 [7], §4.12.4 [4]; runs |
| §2 said a variable can be reassigned "only to another value of the same type"; `double wide = 7` and `long` from `int` contradict it | step | §2 reworded; §3 fence shows `double wide = 7` | JLS §5.2 [7]; run |
| Identifier rules absent; `int 2nd = 5;` gives `not a statement` / `';' expected`, messages that never name the fault | prerequisite | §1 "Naming a variable", a proof; troubleshooting row; quiz 1 | JLS §3.8 [2], §3.9 [3]; runs |
| Ranges given as "about ±2.1 billion" or omitted (`short`, `long`, `char`) | edge | §3 table with exact ranges; a `MIN_VALUE`/`MAX_VALUE` proof | JLS §4.2.1 [5]; OpenJDK 21 `Byte`/`Short`/`Character` source; run |
| `boolean` "1 bit, logically": the size is not specified | edge | §3 table and the sentence under it | Java Tutorials [6] |
| `var n = null;` and `var` on a field or a parameter are unshown boundaries | edge | §5 earned rule; troubleshooting rows; `<details>` 1 | JEP 286 [10]; runs |
| A `final` value is the natural "what if it must not change?"; `02-control-flow` later uses "final" undefined | edge | §2 "`final`: a value that never changes", a proof and a non-example | JLS §4.12.4 [4]; runs |
| Redeclaring a variable (`int count = 2;` twice) gives `already defined`; a common slip when reassigning | edge | §2 analysis; troubleshooting row | run |
| `float ratio = 0.5;` fails (`double` to `float`); the lesson shows only the `L` case | edge | §4 non-example | JLS §3.10.2 [9]; run |
| Lower-case `l` suffix is legal and confusable with `1` | edge | §4 analysis | JLS §3.10.1 [8]; run (`1l` printed `12` with `11`) |
| No objectives, no checks with hidden answers, no sources; the Predict box has no answer; gotchas were bullets | structure | objectives line, ✅ (4 quizzes, 2 `<details>`), 📚 (10), 11-row table | `/prepare` chain |
| "Tutorial 3", "Tutorial 5", "Tier 2" forward references | structure | links to the named lessons | — |

### Plan

| Section | Carries | Why here |
|---|---|---|
| Intro + objectives | variable, type, statically typed; primitive vs reference (named, linked) | the words every section uses |
| §1 Declaring | declaration; `cannot find symbol`; declare-then-assign; **non-example** reading an unassigned local (definite assignment); identifier rules with the `2nd` proof | all three are about the declaration itself, before any typing rule |
| §2 Static typing | reassignment; `String` named as a non-primitive; `incompatible types`; `final` with a **non-example** | the type is fixed, and `final` fixes the value too |
| §3 Primitives | table with exact ranges; `MIN/MAX_VALUE` proof; `byte b = 200`; constant narrowing, **non-example** `byte b = n` | ranges first, then the rule the 🧪 box needs |
| §4 Literals | literal types; `L`/`l`; `integer number too large`; **non-example** `float ratio = 0.5` | a literal's own type, after ranges |
| §5 `var` | inference; not dynamic; limits (`null`, fields, parameters); no initializer | needs literals' types from §4 |
| 6 / 7 | summary rows for each new rule; symptom → cause → fix table, one row per real message | read by the study profile |
| ✅ / 📚 | one check per objective; the Predict box answered in a `<details>` | after all mechanisms |

### Unverified

- _None._

### Fact-check

A separate pass over the FINISHED draft, as a checker: every number, name, version, code line and
cite. Only what changed or was flagged is listed.

| Claim | Verdict | Fix |
|---|---|---|
| "You can change the value … but only to another value of the same type" | WRONG — `double wide = 7;` compiles and prints `7.0` (run); widening is allowed [7] | "of the variable's type, or convert to it without losing anything" |
| `boolean` size "1 bit, logically" | WRONG — no size is defined [6] | "not specified"; sentence under the table |
| "`var` … works only for local variables, never fields or parameters" | WRONG in part — lambda parameters take `var` since JDK 11 (JEP 323); fields and method parameters give `'var' is not allowed here` (run) | "a variable declared outside every method, or a method's parameter" |
| `int` "about ±2.1 billion"; `long` "when they exceed ~2 billion" | VERIFY — inexact | exact `-2147483648 .. 2147483647` from the run, and [5] |
| Draft: "The exception is for constants only … the compiler no longer checks the value" | WRONG in part — `final int n = 100; byte b = n;` compiles and prints `100` (run): a `final` with a constant value is a constant variable [4] | "an ordinary `int` variable", plus a sentence on `final` |
| Draft table: `float` "about 7 significant digits", `double` "about 16" | VERIFY — approximate, and the register wants exact numbers | "fewer digits than `double`" / "the default precision"; the digits belong to the next lesson |
| "The compiled bytecode is identical to the spelled-out version" | OK — `var count = 42` and `int count = 42` compiled to byte-identical `Main.class`, with and without `-g` (`cmp`, 2026-09-27) | none |
| "Since Java 10, `var`" | OK — JEP 286, release 10 [10] | cited |
| `char` range 0 to 65535 | OK — JLS §4.2.1 [5]; `Character.MAX_VALUE = '￿'` in OpenJDK 21 source | none |
| "`int class = 5;` opens with the same two messages" | OK — run: `not a statement`, `';' expected`, then `<identifier> expected` | none |
| `var n = null;` message; `'var' is not allowed here` on a field and a parameter; `variable count is already defined in method main(String[])`; `1l` legal | OK — each run on JDK 21, 2026-09-27, pasted | none |
| Quiz answers 1–4 and both `<details>` | OK — 1 from the `2nd`/`class`/`secondPlace` runs; 2 from the `total` run; 3 from the ranges proof; 4 from the `byte b = 100`/`200`/`n` runs; `<details>` from the `d = 5.5`, `int b = 5.0`, `byte c = 5` and `var` parameter runs | none |
| Every `Output:` and `Compiler error:` block (21 fences) | OK — `prove.py`: 21/21 | none |

### Review

Scored 1–5 before the fix, the single highest-impact fix named, scored again after. Every `After`
must reach 4.

| Criterion | Before | Highest-impact fix | After |
|---|---|---|---|
| accuracy — Accuracy & currency — every claim true now, sourced or derived | 3 — "only the same type", "1 bit", "never parameters" false or overstated; ranges approximate; no sources | fix the three, exact ranges from a run, ten cites | 5 |
| clarity — Clarity for this reader — no term used before it is defined | 3 — "dynamically typed", `String`, "initializer", "local variable" undefined; paragraphs of 5+ sentences; mean 20 words, longest 65 | define each at first use; split every long paragraph; mean 13 words, longest 29 | 5 |
| sequence — Sequence — each section rests only on what came before it | 4 — sound order; the 🧪 box rested on constant narrowing, never taught | teach constant narrowing in §3 before the box | 5 |
| practice — Worked example, non-example, checks with hidden solutions | 3 — a bite per section, no hidden answers, the box unanswered | four non-examples (unassigned read, `final`, `byte b = n`, `float` literal), four quizzes, two `<details>` | 5 |
| misconceptions — Misconceptions, edge cases, troubleshooting covered | 3 — six bullets, no definite assignment, no names, no redeclaration | an 11-row symptom → cause → fix table, one row per real message | 5 |
| actionability — Actionable — the reader can DO the objectives afterwards | 3 — objectives implicit | five objectives, one check each | 4 — picking a type is practised on one quiz only |

## What changed, and why

| Change | Why |
|---|---|
| Objectives line; ✅ Check yourself (4 quizzes, 2 `<details>`); 📚 Sources (10) | the /prepare contract |
| §1: declare-then-assign; definite assignment as a compiler-error proof; identifier rules with the `2nd` proof | gaps 1, 2, 5; coverage map JLS 16 (H) |
| §2: reassignment rule corrected; `String` named; redeclaration; `final` with a non-example | gaps 4, 9, 10; fact-check row 1 |
| §3: exact ranges and a `MIN_VALUE`/`MAX_VALUE` proof; `boolean` size; constant narrowing with a non-example and the `final` case | gaps 3, 6, 7; fact-check rows 2, 4, 5 |
| §4: `l` vs `L`; `float ratio = 0.5` non-example | gaps 11, 12 |
| §5: `var` limits (`null`, fields, parameters), cited to JEP 286 | gap 8; fact-check row 3 |
| Gotcha checklist → 11-row troubleshooting table; mental-model rows for each new rule | the /prepare shape |
| "Tutorial 3/5", "Tier 2" → links | gap 14 |
| Register: hedges ("just", "kind of", "actually") removed, long paragraphs split | lint: 26 problems → 0 |
