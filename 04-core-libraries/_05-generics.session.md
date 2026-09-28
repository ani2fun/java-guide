# Generics — preparation record

The /prepare chain for `04-core-libraries/05-generics.md`, in order. Not rendered (the leading `_`). The lesson is edited in
place; this file is the evidence behind each change. Prepared 2026-09-28; every run on Temurin
21 (`/usr/libexec/java_home -v 21`), JLS 21 fetched from docs.oracle.com the same day.

## Research

### Audience

- *Holds already* (earlier lessons, never re-taught): `List<Integer>` read as "a list of
  `Integer`", the diamond, `List<int>` rejected, boxing (The Collections Framework);
  `Comparable` and `compareTo` returning negative, zero or positive (The Collections Framework
  §5); `var` (Variables); `ClassCastException` (The Collections Framework §5);
  `instanceof` and casts (equals & hashCode); `getClass` (not taught; used as "the object's
  class").
- *Must not be assumed* (defined where it first appears): **type parameter** vs **type
  argument**, **raw type**, **type inference**, **bound**, **invariant**, **wildcard**,
  producer and consumer, `CAP#1`, **erasure**, `javap`, `checkcast`.
- *The one thing an expert forgets a newcomer does not know:* `var list = new ArrayList<>()`
  is a list of `Object`.

### Gaps in the chapter

Four lenses, most severe first: prerequisite, step, edge, structure. Coverage map rows: JLS 18
(Type Inference) `partial` L — "diamond and generic-method inference in 04-core-libraries/05";
the unconfirmed "generics" row of 1Z0-830 (secondary source) is covered by the lesson as a
whole.

| Gap | Kind | Filled where | Source |
|---|---|---|---|
| Type inference (coverage map JLS 18): the diamond explained, generic-method inference, an explicit type argument, the incompatible-bounds error, `var` with a diamond giving `ArrayList<Object>` | structure | §1 (diamond); §2 (inference, `Main.<Integer>max`, the compiler error, the `var` non-example); quiz 2; two gotcha rows | JLS §18 [5]; runs (`7`; `inference variable T has incompatible bounds`; `Object cannot be converted to String`) |
| Raw types: no checks, an unchecked note, a `ClassCastException` far from the mistake | edge | §1 non-example; gotcha row | JLS §4.8 [3]; run; javac note `uses unchecked or unsafe operations` |
| `? super` shown only in prose; "can't add to `? extends`" claimed, not shown | step | §3, a consumer fence (`[1, 1]`, `[1, 1, 1]`, `1`) and the `CAP#1` compiler error; quiz 4; gotcha row | JLS §4.5.1 [7]; runs |
| "Inserts casts" asserted | step | §4, a `javap -c` terminal block (`Box.get:()Ljava/lang/Object;`, `checkcast … java/lang/String`) | JLS §4.6 [8]; `javap -c` run on JDK 21 |
| `new T[]` claimed not to compile, not shown | edge | §4 compiler error (`generic array creation`); gotcha row | JLS §15.10.1 [10]; run |
| "Type parameter" used for the type argument (`<Integer>`) | prerequisite | intro and §1: both terms defined | JLS §8.1.2 [1], §4.5 [2] |
| No objectives, checks or sources; gotchas as bullets; the Predict box unanswered | structure | objectives; ✅ (5 quizzes, 1 `<details>` with a proved fence); 8-row table; 📚 (10) | `/prepare` chain |

### Plan

| Section | Carries | Why here |
|---|---|---|
| Intro + objectives | generics as a compile-time device; five objectives | the reader's map |
| §1 Generic classes | parameter vs argument; the kept fences; the diamond; **non-example** a raw type | the class form first, and the unchecked escape hatch |
| §2 Generic methods and bounds | the kept fences; inference, explicit argument, the incompatible-bounds error; **non-example** `var` with a diamond | inference applies to methods and constructors alike |
| §3 Wildcards and PECS | invariance quoted; the kept fences; the consumer fence; **non-example** add to `? extends` | needs generic methods from §2 |
| §4 Erasure | the kept fences; `javap` proof of inserted casts; `instanceof` corrected with a proof; **non-example** `new T[]` | last: explains §1's raw-type crash and the limits |
| 5 / 6 | summary rows per rule; an 8-row symptom → cause → fix table | read by the study profile |
| ✅ / 📚 | one check per objective; the Predict box answered with a proved fence | after all mechanisms |

### Unverified

- _None._

### Fact-check

A separate pass over the FINISHED draft, as a checker: every number, name, version, code line and
cite. Only what changed or was flagged is listed.

| Claim | Verdict | Fix |
|---|---|---|
| "`instanceof List<String>` is meaningless and won't compile" | WRONG in Java 21 — JLS §15.20.2 requires only that the operand be "checked cast compatible" [9]; `Collection<String> c; c instanceof List<String>` compiles and prints `true` (run) | the rule restated; the proof fence; "from an `Object`" in the earned rule and summary |
| "the `<Integer>` is a **type parameter**" | WRONG — `Integer` in `List<Integer>` is a type argument; the type parameter is the declared variable [1] [2] | both terms defined |
| "generics add no run-time overhead" / "zero run-time overhead" | WRONG as stated — erasure inserts `checkcast` instructions (the `javap -c` run) | "need no extra classes"; the inserted cast shown |
| "full backward compatibility with pre-generics code" | VERIFY — JLS §4.8: raw types exist "only as a concession to compatibility of legacy code" [3] | "generic code runs on the same classes as the code written before generics"; raw types cited |
| "Erasure replaces each type parameter with its bound (or `Object`)" | OK — JLS §4.6: the erasure of a type variable is the erasure of its leftmost bound [8] | cited |
| "The compiler substitutes the chosen type for `T` at each use site" | VERIFY — a description of checking, not of code generation (erasure keeps one `Box`) | "checks every use … as if `T` were `String`" |
| "`List<Integer>` is not a `List<Number>`" | OK — JLS §4.10: "Subtyping does not extend through parameterized types" [6] | quoted |
| "you can't write `new T[]`" | OK — JLS §15.10.1 [10]; run: `generic array creation` | the compiler-error fence |
| Every `Output:` block and compiler error (16 fences) | OK — `prove.py`: proved 8, rejected 8 | none |
| Quiz answers and the `<details>` | OK — quiz 1 from the §1 compiler error; quiz 2 from the `var` compiler error; quiz 3 from the §2 compiler error; quiz 4 from the §3 consumer proof; quiz 5 from the §4 proofs; the `<details>` fence proved (`2`, `a`, `true`); `firstOrNull` with `compareTo` gives `cannot find symbol` (run); `obj instanceof Map<String, Integer>` gives `Object cannot be safely cast to Map<String,Integer>` (run); `Main.<Integer>max(3, 7)` prints `7` (run) | none |

### Review

Scored 1–5 before the fix, the single highest-impact fix named, scored again after. Every `After`
must reach 4.

| Criterion | Before | Highest-impact fix | After |
|---|---|---|---|
| accuracy — Accuracy & currency — every claim true now, sourced or derived | 3 — the pre-Java-16 `instanceof` rule; parameter vs argument; "zero overhead"; no sources | each fixed; ten JLS sources; `javap` and every fence proved | 5 |
| clarity — Clarity for this reader — no term used before it is defined | 3 — sentences to 60 words; "type parameter" misused | defined at first use; lists; mean 14 words, longest 27 | 5 |
| sequence — Sequence — each section rests only on what came before it | 4 — the diamond used unexplained | diamond in §1, inference in §2, erasure last so it explains §1's raw-type crash | 5 |
| practice — Worked example, non-example, checks with hidden solutions | 3 — `? super` and `new T[]` unshown; the Predict box unanswered | five new fences; five quizzes; a `<details>` with a proof | 5 |
| misconceptions — Misconceptions, edge cases, troubleshooting covered | 3 — five bullets | raw types, `var` with a diamond, `CAP#1`; an 8-row table | 5 |
| actionability — Actionable — the reader can DO the objectives afterwards | 4 | five objectives with a check each | 5 |

## What changed, and why

| Change | Why |
|---|---|
| Objectives line; ✅ (5 quizzes, 1 `<details>`); 📚 (10) | the /prepare contract |
| Intro and §1: type parameter vs argument; the diamond; the raw-type non-example | gaps 2, 6; fact-check rows 2, 6 |
| §2: generic methods cited; inference, explicit argument, incompatible bounds; the `var` non-example | gap 1 (coverage map JLS 18) |
| §3: invariance quoted; the consumer fence; the `? extends` add error | gap 3; fact-check row 7 |
| §4: erasure cited; the `javap` proof; `instanceof` corrected and proved; `new T[]` error | gaps 4, 5; fact-check rows 1, 3, 4, 5, 8 |
| Gotcha checklist → 8-row troubleshooting table; mental-model rows added; TOC extended | the /prepare shape |
| Predict box as a numbered list, answered in `<details>` with a proved fence | the /prepare shape |
| Register: long sentences split; hedges removed ("actually", "simply") | lint: 13 problems → 0 |
