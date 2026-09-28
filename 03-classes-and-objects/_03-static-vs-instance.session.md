# static vs Instance — preparation record

The /prepare chain for `03-classes-and-objects/03-static-vs-instance.md`, in order. Not rendered (the leading `_`). The lesson is edited in
place; this file is the evidence behind each change. Prepared 2026-09-28; every run on Temurin
21 (`/usr/libexec/java_home -v 21`), JLS 21 and JVMS 21 fetched from docs.oracle.com the same day.

## Research

### Audience

- *Holds already* (earlier lessons, never re-taught): `static` on `main` and helper methods; the
  `non-static method … static context` error (Methods, Classes & Objects); fields, default values,
  field initializers, the steps of `new`, `this`, `this(…)` (Classes & Objects); `private`,
  `final` fields, `cannot assign a value to final variable` (Encapsulation); an exception stack
  trace (What Java Is).
- *Must not be assumed* (defined where it first appears): `static` member, instance member,
  constant, **constant variable**, `static` block, **class initialization** (the lesson said
  "loaded"), **instance initializer**, **textual order**, `<clinit>`.
- *The one thing an expert forgets a newcomer does not know:* "the class is loaded" and "the
  class is initialized" are two different events, and only the second runs a `static` block.

### Gaps in the chapter

Four lenses, most severe first: prerequisite, step, edge, structure. Coverage map rows: 3.2
(instance and static initializers) `partial` M — "Instance initializer blocks and initialization
order in 03-classes-and-objects/03"; JLS 12 (Execution) `partial` M — "Class and object
initialization order". Both filled here; the unreachable-objects half of JLS 12 belongs to
lesson 04 (row 3.1).

| Gap | Kind | Filled where | Source |
|---|---|---|---|
| Instance initializer blocks and the full order of class and object setup (coverage map 3.2, JLS 12) | structure | new §5: a proof logging static field initializer, static block, instance field initializer, instance block, constructor body, twice; the four steps of `new`; `<details>` check | JLS §8.6 [10], §12.4.2 [7], §12.5 [11]; run |
| What triggers class initialization was never listed; "first used" was vague | step | §4 mechanism: the four triggers | JLS §12.4.1 [6] |
| Reading a constant variable does not initialize its class | edge | §4, a proof (`100` / `after MAX` / `Config initialized` / `0`); quiz 3; gotcha row | JLS §12.4.1 [6], §4.12.4 [3], §13.1 [4]; run |
| A `static` block that throws: `ExceptionInInitializerError`, then `NoClassDefFoundError` on later use | edge | §4 non-example, proved; the later `NoClassDefFoundError: Could not initialize class Table` from a run; gotcha row | JLS §12.4.2 [7]; JVMS §2.9.2 [9]; runs |
| Textual order: `illegal forward reference` | edge | §5 non-example, proved; gotcha row | JLS §8.3.3 [12]; run |
| A `static` field read through an object (`a.count`) looks per-object | edge | §1 non-example (`2 2 2`), proved; the `-Xlint:static` warning; gotcha row | JLS §8.3.1.1 [1]; runs |
| `this` in a `static` method | edge | §2 prose, `non-static variable this cannot be referenced from a static context`; gotcha row | JLS §8.4.3.2 [2]; run |
| The class holding `main` is initialized before `main` | step | §4 mechanism | JLS §12.1.3 [8]; run (`Main's static block` / `main runs`) |
| "Constant variable" and "class initialization" used loosely or not at all | prerequisite | §3, §4 | JLS §4.12.4 [3], §12.4 [6] |
| No objectives, checks or sources; gotchas as bullets; "Tier 5", "last tier"; the Predict box unanswered | structure | objectives; ✅ (3 quizzes, 1 `<details>`); 9-row table; 📚 (12); links to Concurrency: the Basics, Classes & Objects | `/prepare` chain |

### Plan

| Section | Carries | Why here |
|---|---|---|
| Intro + objectives | `static` vs instance; four objectives | the reader's map |
| §1 Shared fields | `Widget` counter; one copy; **non-example** `a.count` | the storage difference first |
| §2 Methods | `describe`/`total`; `id` from a static context; `this` in a static method | needs §1's two kinds of field |
| §3 Constants | `static final`; constant variable; reassignment bite | the term is needed by §4's triggers |
| §4 Static blocks | `Lookup`; the four triggers; the constant-read proof; **non-example** a throwing block | class initialization before object initialization |
| §5 Instance initializers (new) | instance blocks; the logged order; the four steps of `new`; **non-example** forward reference | the order needs both §4 and Classes & Objects' `new` |
| 6 / 7 | summary rows per rule; a 9-row symptom → cause → fix table | read by the study profile |
| ✅ / 📚 | one check per objective; the Predict box answered | after all mechanisms |

### Unverified

- _None._

### Fact-check

A separate pass over the FINISHED draft, as a checker: every number, name, version, code line and
cite. Only what changed or was flagged is listed.

| Claim | Verdict | Fix |
|---|---|---|
| "the `Lookup` class isn't loaded until it's first used"; "runs once, when the class is first loaded" | WRONG — loading (JLS §12.2) and initialization (JLS §12.4) are distinct; a `static` initializer "is executed when the class is initialized" [5] | "initialized" throughout §4 |
| "A `static` field is allocated once, when the class is loaded" | WRONG — static fields are created at preparation (JLS §12.3.2) and "incarnated when the class is initialized" (JLS §8.3.1.1) [1] | "exactly one copy, however many objects exist, even zero" |
| "often inlined at compile time for primitives" | WRONG in part — required, not "often", and for constant variables of primitive type or `String` (JLS §4.12.4, §13.1) [3] [4] | constant variable defined; the proof that reading one does not initialize the class |
| "static methods can touch only static members" | WRONG in part — a `static` method may read `w.id` through a `Widget` parameter | "unless they are handed an object" |
| "the same rule that stopped `Rectangle.area()` last tier" | WRONG — that was Classes & Objects, this chapter | a link |
| "unsafe under concurrency (a theme that returns in Tier 5)" | WRONG as a reference | a link to Concurrency: the Basics |
| "Any later use of it throws `NoClassDefFoundError`" (draft) | VERIFY — run: a second access printed `java.lang.NoClassDefFoundError: Could not initialize class Table` | the message quoted |
| "`<clinit>` is the JVM's name for a class's combined static initialization code" (draft) | OK — JVMS §2.9.2: the method "has the special name `<clinit>`" [9] | none |
| `static variable should be qualified by type name, Widget, instead of by an expression` | OK — `javac -Xlint:static` on the §1 non-example, run 2026-09-28 | none |
| `non-static variable this cannot be referenced from a static context`; `Main's static block` before `main runs` | OK — runs on JDK 21 | none |
| "The JDK already has a more precise one, `Math.PI`" | OK — `java.lang.Math.PI` is a `static final double` in the Java SE 21 API | none |
| Every `Output:` and `Compiler error:` block (11 fences) | OK — `prove.py`: 11/11 | none |
| Quiz answers and the `<details>` | OK — quiz 1 from a run (`2`); quiz 2 from a run (`area` fails twice with `non-static variable radius`; `areaOf` alone compiles); quiz 3 from the §4 proof; the `<details>` from the §5 proof and the `Lookup` rule | none |

### Review

Scored 1–5 before the fix, the single highest-impact fix named, scored again after. Every `After`
must reach 4.

| Criterion | Before | Highest-impact fix | After |
|---|---|---|---|
| accuracy — Accuracy & currency — every claim true now, sourced or derived | 3 — "loaded" for "initialized" twice; "often inlined"; "only static members"; no sources | fix each; twelve JLS/JVMS sources; every block proved | 5 |
| clarity — Clarity for this reader — no term used before it is defined | 3 — "constant variable" and "initialization" undefined; sentences to 45 words | defined at first use; split; mean 14 words, longest 28 | 5 |
| sequence — Sequence — each section rests only on what came before it | 4 — the order of construction was never assembled | new §5 after the static half, resting on Classes & Objects' steps of `new` | 5 |
| practice — Worked example, non-example, checks with hidden solutions | 3 — bites only; no hidden answers | the `a.count`, throwing-block and forward-reference non-examples; three quizzes and a `<details>` | 5 |
| misconceptions — Misconceptions, edge cases, troubleshooting covered | 3 — five bullets | a 9-row symptom → cause → fix table; the constant-read edge | 5 |
| actionability — Actionable — the reader can DO the objectives afterwards | 3 — the reader could not predict an initialization order | the §5 proof and its check; four objectives with a check each | 5 |

## What changed, and why

| Change | Why |
|---|---|
| Objectives line; ✅ (3 quizzes, 1 `<details>`); 📚 (12) | the /prepare contract |
| §1: one copy, cited; the `a.count` non-example; a Concurrency link | gap 6; fact-check rows 2, 6 |
| §2: `this` in a static method; "unless handed an object"; a Classes & Objects link | gap 7; fact-check rows 4, 5 |
| §3: constant variable and compile-time copying; `Math.PI` | gap 9; fact-check row 3 |
| §4: "initialized", not "loaded"; the four triggers; `main`'s class first; the constant-read proof; the throwing-block non-example | gaps 2, 3, 4, 8; fact-check rows 1, 7 |
| §5 (new): instance initializers, the logged order, the steps of `new`, the forward-reference non-example | gaps 1, 5 (coverage map 3.2, JLS 12) |
| Gotcha checklist → 9-row troubleshooting table; mental-model rows added; TOC renumbered | the /prepare shape |
| Predict box as a numbered list, answered by the checks | the /prepare shape |
| Register: long sentences split; hedges removed ("actually", "genuinely", "just") | lint: 23 problems → 0 |
