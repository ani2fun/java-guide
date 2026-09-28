# Enums & Records — preparation record

The /prepare chain for `04-core-libraries/06-enums-and-records.md`, in order. Not rendered (the leading `_`). The lesson is edited in
place; this file is the evidence behind each change. Prepared 2026-09-28; every run on Temurin
21 (`/usr/libexec/java_home -v 21`), JLS 21 and the Java SE 21 API fetched from docs.oracle.com,
and JEPs from openjdk.org, the same day.

## Research

### Audience

- *Holds already* (earlier lessons, never re-taught): `switch` expressions and arrow labels
  (Conditionals); `static final` fields and class initialization (static vs Instance);
  `private`, `final` fields and the `final` array trap, defensive copies (Encapsulation &
  Access Modifiers); `equals`/`hashCode` contract (equals & hashCode); `List.of`,
  `List.copyOf` unmodifiable, `UnsupportedOperationException`, `implements` (The Collections
  Framework); `printf` (Input & Output).
- *Must not be assumed* (defined where it first appears): **enum**, `ordinal`, `values`,
  `valueOf`, **record**, **component**, **canonical constructor**, **compact constructor**,
  accessor, **sealed**, `permits`, `non-sealed`.
- *The one thing an expert forgets a newcomer does not know:* a record is only as immutable
  as its components.

### Gaps in the chapter

Four lenses, most severe first: prerequisite, step, edge, structure. Coverage map rows: 3.2
(classes and records; constructors) `partial` M — record constructors filled here; 3.5 (records,
sealed types) `covered`; 3.7 (enums with fields, methods and constructors) `covered`.

| Gap | Kind | Filled where | Source |
|---|---|---|---|
| Shallow immutability: a record holding a `List` changes through the caller and through the accessor | edge | §3 non-example (`[Ada, Linus, Grace]`) and the `List.copyOf` fix (`[Ada]`, then `UnsupportedOperationException`); quiz 4; gotcha row | JLS §8.10.3 [7]; runs |
| The compact constructor claimed, never shown (coverage map 3.2) | step | §3, a validation fence (`Range[low=2, high=5] has length 3`, then `IllegalArgumentException`); an added method | JLS §8.10.4.2 [10]; run |
| `valueOf` is exact: `valueOf("wed")` throws | edge | §1 non-example; gotcha row | `Enum` API [3]; run (`No enum constant Day.wed`) |
| Enum constructors are private; `new Planet(…)` does not compile | edge | §2 compiler error; quiz 2; gotcha row | JLS §8.9.2 [6]; run |
| `==` on enums named nowhere, after a lesson on `equals` | prerequisite | §1 mechanism | JLS §8.9.1 [5] |
| Permitted subclasses must be `final`, `sealed` or `non-sealed`: stated, never shown | step | §4 list; the error `sealed, non-sealed or final modifiers expected`; gotcha row | JLS §8.1.1.2 [11]; run |
| A record cannot extend a class | edge | §3 mechanism; gotcha row (`'{' expected`) | JLS §8.10 [9]; run |
| No objectives, checks or sources; gotchas as bullets; "Tutorial 26", "the last chapter"; the Predict box unanswered | structure | objectives; ✅ (5 quizzes, 1 `<details>` with a proved fence); 9-row table; 📚 (11); links to Sealed Classes & Pattern Matching, equals & hashCode, Encapsulation | `/prepare` chain |

### Plan

| Section | Carries | Why here |
|---|---|---|
| Intro + objectives | the three features as a list, with JEP versions; five objectives | the reader's map |
| §1 Enums | the kept fences; `ordinal` cited; the constant fields quoted; `==`; **non-example** `valueOf("wed")` | the fixed set first |
| §2 Rich enums | the kept fence; `final` by choice; the private constructor; **non-example** `new Planet` | fields need the constructor rule |
| §3 Records | the members as a list; the kept fences; the `toString` caveat; the compact constructor; **non-example** a mutable component, and the fix | builds on equals & hashCode and the `final`-array trap |
| §4 Sealed types | the kept fences; the three modifiers; the pattern-matching link | records are the usual permitted cases |
| 5 / 6 | summary rows per rule; a 9-row symptom → cause → fix table | read by the study profile |
| ✅ / 📚 | one check per objective; the Predict box answered with a proved fence | after all mechanisms |

### Unverified

- _None._

### Fact-check

A separate pass over the FINISHED draft, as a checker: every number, name, version, code line and
cite. Only what changed or was flagged is listed.

| Claim | Verdict | Fix |
|---|---|---|
| "The `gravity` is `final` because enum constants are effectively immutable singletons" | WRONG — the JLS does not require enum fields to be `final`; a run with `int count;` in an enum and `Counter.HITS.count++` twice prints `2` | "`final` by choice"; keep enum fields `final` because one instance is shared |
| "A record is a compact, final, immutable class"; "all immutable" | WRONG in part — the component fields are `final` [7], but a `List` component stays mutable (run: `[Ada, Linus, Grace]`) | the shallow-immutability non-example and the `List.copyOf` fix |
| "when the constant is created (once, at class load)" | WRONG term — constants are created when the enum class is *initialized* (JLS §8.9.3: a field with a variable initializer) [4] | "as the enum class is initialized" |
| "the last chapter", "Tutorial 26" (twice) | WRONG as references | links to equals & hashCode and Sealed Classes & Pattern Matching |
| `Point[x=1, y=2]` as the record's `toString` | OK on JDK 21 (proved), but the API says the format "is subject to change" [8] | the caveat added; quiz 3 says "on JDK 21" |
| "A record … can't extend a class" | OK — JLS §8.10: no `extends` clause; the superclass is `Record` [9]; run gives `'{' expected` | cited; gotcha row |
| "each must be `final`, `sealed`, or `non-sealed`" | OK — JLS §8.1.1.2 [11]; run: `sealed, non-sealed or final modifiers expected` | cited and shown |
| Record (JDK 16), sealed (JDK 17) | OK — JEP 395 delivered in 16 [1]; JEP 409 in 17 [2] | "Java 16", "Java 17", cited |
| `ordinal()` "zero-based" | OK — `Enum` API [3] | cited |
| Every `Output:` block and compiler error (13 fences) | OK — `prove.py`: proved 9, rejected 4 | none |
| Quiz answers and the `<details>` | OK — quiz 1 from a run (`4`); quiz 2 from the §2 compiler error; quiz 3 from the `<details>` fence; quiz 4 from the §3 non-example; quiz 5 from a run (`Rectangle`: `class is not allowed to extend sealed class: Shape`); the `<details>` fence proved | none |

### Review

Scored 1–5 before the fix, the single highest-impact fix named, scored again after. Every `After`
must reach 4.

| Criterion | Before | Highest-impact fix | After |
|---|---|---|---|
| accuracy — Accuracy & currency — every claim true now, sourced or derived | 3 — "all immutable"; enum `final` as a rule; "class load"; no sources | each fixed; eleven primary sources; every fence proved | 5 |
| clarity — Clarity for this reader — no term used before it is defined | 4 — sentences to 60 words | lists; mean 14 words, longest 30 | 5 |
| sequence — Sequence — each section rests only on what came before it | 5 | none needed | 5 |
| practice — Worked example, non-example, checks with hidden solutions | 3 — the compact constructor unshown; the Predict box unanswered | five new fences; five quizzes; a `<details>` with a proof | 5 |
| misconceptions — Misconceptions, edge cases, troubleshooting covered | 3 — shallow immutability absent | the mutable-component non-example and fix; a 9-row table | 5 |
| actionability — Actionable — the reader can DO the objectives afterwards | 4 | five objectives with a check each | 5 |

## What changed, and why

| Change | Why |
|---|---|
| Objectives line; ✅ (5 quizzes, 1 `<details>`); 📚 (11) | the /prepare contract |
| Intro: the three features as a list, with JEPs | register; fact-check row 8 |
| §1: `ordinal` cited; the constant fields and `==` quoted; the `valueOf` non-example | gaps 3, 5; fact-check rows 3, 9 |
| §2: `final` by choice; class initialization; the private-constructor error | gap 4; fact-check rows 1, 3 |
| §3: the members as a list; the `toString` caveat; the compact constructor; the mutable-component non-example and fix; the extends rule | gaps 1, 2, 7; fact-check rows 2, 5, 6 |
| §4: the three modifiers and the error; the pattern-matching links | gap 6; fact-check rows 4, 7 |
| Gotcha checklist → 9-row troubleshooting table; mental-model rows added; TOC extended | the /prepare shape |
| Predict box as a numbered list, answered in `<details>` with a proved fence | the /prepare shape |
| Register: long sentences split; hedges removed ("actually", "just") | lint: 18 problems → 0 |
