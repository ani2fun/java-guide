# Abstract Classes & Interfaces — preparation record

The /prepare chain for `05-robust-oop/02-abstract-classes-and-interfaces.md`, in order. Not rendered (the leading `_`). The lesson is edited in
place; this file is the evidence behind each change. Prepared 2026-09-28; every run on Temurin
21 (`/usr/libexec/java_home -v 21`), JLS 21 and the Java SE 21 API fetched from docs.oracle.com,
and JEPs from openjdk.org, the same day.

## Research

### Audience

- *Holds already* (earlier lessons, never re-taught): `extends`, `super(...)`, overriding,
  `@Override`, dynamic dispatch, narrowed access (`weaker access privileges`), `static` methods
  hide (Inheritance & Polymorphism); `private`, `final` fields (Encapsulation & Access
  Modifiers); `static` methods and constants (static vs Instance); "program to the interface"
  with `List` (The Collections Framework); `printf` and `String.format` (Input & Output).
- *Must not be assumed* (defined where it first appears): **abstract class**, **abstract
  method**, **interface**, **implements**, **contract**, **`default` method**, **`static`
  interface method**, **`private` interface method**, multiple inheritance of **type** vs
  **state** vs **implementation**, `X.super.m()`.
- *The one thing an expert forgets a newcomer does not know:* an interface method written with no
  modifier is `public`, so the implementation must say `public` even though the interface never
  did.

### Gaps in the chapter

Four lenses, most severe first: prerequisite, step, edge, structure. Coverage map rows: 3.6
(interfaces; `private`, `static` and `default` interface methods) `partial` **H** — "`static` and
`private` interface methods in 05-robust-oop/02" — filled here; JLS ch. 9 `partial` H (see 3.6),
filled with 3.6.

| Gap | Kind | Filled where | Source |
|---|---|---|---|
| `static` and `private` interface methods absent (coverage map 3.6, H; JLS 9) | edge | new §4: a fence (`100.0 C` / `212.0 F` / `98.6`); **non-examples** `Kettle.toFahrenheit` (`cannot find symbol … location: class Kettle`) and the `private` helper (`has private access in Temperature`); quiz 2; 3 gotcha rows | JLS §9.4 [3], §8.4.8 [5]; JEP 213 [11]; JLS SE 8 §9.4 [13]; runs |
| The default-method clash claimed as "a controlled, compile-time error", never shown, and the fix never named | step | §5 non-example (`inherits unrelated defaults for move()`), the `Swimmer.super.move()` fix (`swimming and walking`); quiz 4; gotcha row | JLS §8.4.8.4 [6], §15.12.1 [7]; runs |
| "Share state and implementation" claimed for abstract classes, but the example had neither | step | §1: a fence with a field, a constructor and a concrete `describe()` calling the abstract `area()`; quiz 5 | JLS §8.1.1.1 [1]; run |
| A concrete subclass that skips an abstract method (and an `abstract` method in a non-abstract class) | edge | §1 non-example (`Triangle is not abstract …`); the in-class variant in prose; quiz 1; 2 gotcha rows | JLS §8.1.1.1 [1]; runs |
| "Overrides must be `public`" stated, never shown; why, since the interface wrote no `public` | edge | §2: implicit `public`/`abstract` cited; non-example (`draw() in Circle cannot implement draw() in Drawable`); quiz 3; gotcha row | JLS §9.4 [3], §8.4.8.3 [8]; run |
| Interface fields are constants: "no fields (beyond constants)" unexplained | prerequisite | §2 mechanism, cited; gotcha row (`cannot assign a value to static final variable MAX`) | JLS §9.3 [4]; run |
| "Tutorial 25", a dead reference | structure | a link to Nested & Anonymous Classes; Lambdas | — |
| No objectives, checks or sources; gotchas as bullets; the 🧪 box unanswered | structure | objectives; ✅ (5 quizzes, 1 `<details>` with a proved fence); 10-row table; 📚 (13) | `/prepare` chain |

### Plan

| Section | Carries | Why here |
|---|---|---|
| Intro + objectives | abstract class and interface as a list; type vs state; five objectives | the reader's map |
| §1 Abstract classes | the kept fences; **new** state + constructor + concrete method fence; **non-example** the forgetful subclass | the partial type first, built on lesson 01's `extends` |
| §2 Interfaces | the kept fences; implicit `public`/`abstract`; constants; **non-example** the non-`public` implementation | the contract, with its one surprising modifier |
| §3 `default` methods | the kept fence; JEP 126; the evolution argument; the clash deferred to §5 | defaults need the contract |
| §4 `static` and `private` (new) | one fence with both; **non-examples** the `static` call through the class, the `private` call from outside | built on `default` methods, which the `private` helper serves |
| §5 Many interfaces | the kept fences; one reason for single inheritance, cited; **non-example** the default clash, and its `X.super` fix | the clash needs two interfaces and defaults |
| 6 / 7 | summary rows per rule; a 10-row symptom → cause → fix table | read by the study profile |
| ✅ / 📚 | one check per objective; the Predict box answered with a proved fence | after all mechanisms |

### Unverified

- _None._

### Fact-check

A separate pass over the FINISHED draft, as a checker: every number, name, version, code line and
cite. Only what changed or was flagged is listed.

| Claim | Verdict | Fix |
|---|---|---|
| "a controlled, compile-time error, not the silent C++ diamond" | WRONG as sourced — a claim about C++ with no source, and the Java side never shown | the C++ clause removed; the Java error shown and proved |
| "Interfaces … sidestepping the diamond problem"; "the diamond problem … can't arise" | WRONG in part — `default` methods bring "one form of multiple inheritance of implementation" [12], with a compile-time clash [6] | "multiple inheritance of *type*, never of *state*"; the clash shown in §5 |
| "Interface methods are implicitly `public abstract`" | WRONG in part since JDK 9 — only a method without `private`, `default` or `static` is implicitly `abstract` [3] | two bullets: implicitly `abstract` when bodiless, implicitly `public` without a modifier |
| "An interface is a pure contract … no shared state" | WRONG in part — it may hold constants [4] and, since JDK 8/9, `default`, `static` and `private` bodies | "a contract … with no instance fields"; constants cited |
| "That is the reason Java allows many interfaces but only one superclass" (draft) | WRONG in degree — the source says "One reason" [12] | "one reason" |
| "The clash is found at compile time, never at run time" (draft) | WRONG — with separate compilation, a later change to an interface can surface a conflict only when the class runs | "javac reports the clash when it compiles `Duck`" |
| "Before JDK 8, adding a method … broke every implementer" | WRONG in degree — old class files keep linking; the implementer fails to *compile* | "stopped every implementer from compiling" |
| "Since JDK 8 … `default`"; `static` interface methods from JDK 8; `private` from JDK 9 | OK — JEP 126 delivered in 8 [10]; JLS SE 8 §9.4 allows `static` interface methods, SE 7 forbade them [13]; JEP 213 delivered in 9 [11] | cited |
| "This differs from a class's `static` method, which a subclass *does* inherit" | OK — JLS §8.4.8 inherits "all concrete methods m (both static and instance)" from the superclass [5] | cited |
| "`new` on an abstract class (or on an interface)" (gotcha row) | OK — run: `Drawable is abstract; cannot be instantiated` | none |
| The in-class `abstract` method message, and `k.toFahrenheit(37)` through a `Kettle` | OK — runs: `Shape is not abstract and does not override abstract method area() in Shape`; `location: variable k of type Kettle` | none |
| Every `Output:` and `Compiler error:` block (16 fences) | OK — `prove.py`: proved 8, rejected 8 | none |
| Quiz answers and the `<details>` | OK — quiz 1 from a run of the quiz's own classes; quizzes 2–4 from the §4, §2 and §5 fences; quiz 5 from §1; the `<details>` fence proved (`3.14` / `4.00` / `6.00` / `HELLO, ADA` / `swimming and flying`) | none |

### Review

Scored 1–5 before the fix, the single highest-impact fix named, scored again after. Every `After`
must reach 4.

| Criterion | Before | Highest-impact fix | After |
|---|---|---|---|
| accuracy — Accuracy & currency — every claim true now, sourced or derived | 3 — "implicitly `public abstract`" (pre-JDK 9); "pure contract"; the C++ claim; no sources | each fixed; thirteen primary sources; every fence proved | 5 |
| clarity — Clarity for this reader — no term used before it is defined | 4 — a 6-sentence intro paragraph; sentences to 50 words | lists; mean 14 words, longest 30 | 5 |
| sequence — Sequence — each section rests only on what came before it | 4 — the default clash described in §3 before two interfaces appear in §4 | the clash moved to §5, after one-class-many-interfaces | 5 |
| practice — Worked example, non-example, checks with hidden solutions | 3 — the clash and the access rule unshown; the Predict box unanswered | nine new fences; five quizzes; a `<details>` with a proof | 5 |
| misconceptions — Misconceptions, edge cases, troubleshooting covered | 3 — a 5-bullet list | a 10-row table, one row per real message | 5 |
| actionability — Actionable — the reader can DO the objectives afterwards | 3 — `static` and `private` interface methods absent (an exam objective) | §4, and five objectives with a check each | 5 |

## What changed, and why

| Change | Why |
|---|---|
| Objectives line; ✅ (5 quizzes, 1 `<details>`); 📚 (13); TOC extended | the /prepare contract |
| Intro as a list; "type, never state" | register; fact-check rows 2, 4 |
| §1: the state-and-constructor fence; the forgetful-subclass non-example | gaps 3, 4 |
| §2: implicit `public`/`abstract` and constants cited; the non-`public` non-example; the lambdas link | gaps 5, 6, 7; fact-check rows 3, 4 |
| §3: JEP 126 cited; the evolution claim restated; the clash deferred to §5 | fact-check rows 1, 7, 8 |
| §4 (new): `static` and `private` interface methods, with two non-examples | gap 1 (coverage map 3.6, H) |
| §5: the reason for single inheritance cited; the default-clash non-example and the `X.super` fix | gap 2; fact-check rows 5, 6 |
| Gotcha checklist → 10-row troubleshooting table; mental-model rows added | the /prepare shape |
| Predict box as a numbered list, answered in `<details>` with a proved fence | the /prepare shape |
| Register: long sentences split; hedges removed ("actually") | lint: 18 problems → 0 |
