# Inheritance & Polymorphism — preparation record

The /prepare chain for `05-robust-oop/01-inheritance-and-polymorphism.md`, in order. Not rendered (the leading `_`). The lesson is edited in
place; this file is the evidence behind each change. Prepared 2026-09-28; every run on Temurin
21 (`/usr/libexec/java_home -v 21`), JLS 21 and the Java SE 21 API fetched from docs.oracle.com,
and JEPs from openjdk.org, the same day.

## Research

### Audience

- *Holds already* (earlier lessons, never re-taught): classes, constructors, `this`, the
  default constructor and `constructor … cannot be applied to given types` (Classes & Objects);
  `private`, `protected` and `final` fields (Encapsulation & Access Modifiers); `static` methods
  (static vs Instance); numeric casts (Numbers & Arithmetic); `instanceof`, `(Point) o`,
  `equals`/`hashCode` (equals & hashCode); `ClassCastException` as a name (The Collections
  Framework); arrays and the for-each loop (Arrays).
- *Must not be assumed* (defined where it first appears): **subclass**, **superclass**,
  **override**, **polymorphism**, **dynamic dispatch**, **upcast**, **downcast**, **declared type**
  vs the object's class, **hide** (fields and `static` methods), **composition**, **signature**.
- *The one thing an expert forgets a newcomer does not know:* the declared type decides which
  methods compile; the object's class decides which override runs. A cast changes only the first.

### Gaps in the chapter

Four lenses, most severe first: prerequisite, step, edge, structure. Coverage map rows: 3.5
(inheritance, overriding incl. `Object`, polymorphism, **reference casting**) `covered`, with the
proposed fill "reference casting and `ClassCastException` get a proof in 05-robust-oop/01" — filled
here; JLS ch. 8 `partial` (initialization order belongs to 03-classes-and-objects/03, not here).

| Gap | Kind | Filled where | Source |
|---|---|---|---|
| Reference casting never taught: downcast, `instanceof` guard, `ClassCastException`, unrelated-type cast rejected (coverage map 3.5) | edge | new §4: a flowchart, an `instanceof` fence (`Woof, then fetches the ball`), a `ClassCastException` fence (`class Cat cannot be cast to class Dog`), a compile error (`incompatible types: Dog cannot be converted to String`); quiz 3; 2 gotcha rows | JLS §5.1.6 [10], §15.16 [11], §15.20.2 [12]; runs |
| The declared type limits which methods compile: `a.fetch()` on an `Animal` variable is `cannot find symbol` — the step that makes casts necessary, never stated | step | §3 mechanism, a compile-error fence; gotcha row | JLS §15.12.4.4 [7]; run |
| The implicit `super();` and the constructor order, stated as "top-down" but never shown; the missing no-argument superclass constructor, a week-one error | edge | §1: an order fence (`1. Animal's constructor` / `2. Dog's constructor`); a compile error; quiz 1; gotcha row | JLS §8.8.7 [3]; runs |
| `private` members are not inherited; the lesson said a subclass "has the superclass's fields" | edge | §1 non-example (`secret has private access in Animal`); gotcha row | JLS §8.2 [2]; run |
| An override cannot narrow access: `toString()` without `public` is rejected; return types may be covariant | edge | §2 non-example (`attempting to assign weaker access privileges; was public`); quiz 4; gotcha row | JLS §8.4.8.3 [6]; run |
| `static` methods hide rather than override: they bind to the declared type, like fields | edge | §3 non-example (`Woof` / `animal`); gotcha row | JLS §8.4.8.2 [9]; run |
| "is-a vs has-a" argued with a hypothetical; the JDK's `Stack extends Vector` shows the cost | step | §1 non-example (`[sneaked in, first, second]`); quiz 5; gotcha row | `Stack` API [14]; run |
| A `final` class (`String`) cannot be extended | edge | §5 non-example (`cannot inherit from final String`); gotcha row | JLS §8.1.4 [1]; run |
| No objectives, checks or sources; gotchas as bullets; the 🧪 box unanswered | structure | objectives; ✅ (5 quizzes, 1 `<details>` with a proved fence); 14-row table; 📚 (17) | `/prepare` chain |

### Plan

| Section | Carries | Why here |
|---|---|---|
| Intro + objectives | inheritance, override and polymorphism as a list; five objectives | the reader's map |
| §1 `extends` | the kept fence; one object with room for both classes' fields; the implicit `super();` and its order; **non-examples** the missing constructor, the `private` field, `Stack extends Vector` | construction and membership come before any behavior |
| §2 Overriding | the kept fences; signature defined; **non-example** narrowed access; covariant returns | needs inherited methods from §1 |
| §3 Dynamic dispatch | the kept fences; declared type vs object's class; `cannot find symbol`; field hiding cited; **non-example** a `static` method | the payoff, and the step that sets up casting |
| §4 Reference casting (new) | upcast, downcast, `instanceof`; a flowchart; the guard; **non-examples** `ClassCastException` and the unrelated cast | answers the `cannot find symbol` from §3 |
| §5 `final` and `Object` | the kept fences; `Object` as default superclass; the `toString` format; **non-example** `extends String` | the limits last |
| 6 / 7 | summary rows per rule; a 14-row symptom → cause → fix table | read by the study profile |
| ✅ / 📚 | one check per objective; the Predict box answered with a proved fence | after all mechanisms |

### Unverified

- _None._

### Fact-check

A separate pass over the FINISHED draft, as a checker: every number, name, version, code line and
cite. Only what changed or was flagged is listed.

| Claim | Verdict | Fix |
|---|---|---|
| "A subclass object contains a full superclass object inside it" | WRONG — there is one object, with room for the instance variables of the class and each superclass (JLS §12.5) [17] | "`new Dog("Rex")` makes **one** object. It has room for the fields declared in `Animal` as well as those declared in `Dog`" |
| "`final` on a method removes it from the dispatch table for subclasses" | WRONG — the JLS makes overriding a `final` method a compile-time error [16]; it says nothing of a dispatch table | "A `final` method cannot be overridden or hidden: the compiler rejects any attempt" |
| "An override must match the inherited method's signature exactly" | WRONG in part — the signature is name and parameter types [4]; the return type may be a subtype, and the access may not be narrower [6] | signature defined; the narrowed-access non-example; the covariant sentence |
| "A subclass … automatically has the superclass's fields and methods"; "Inherited members are simply present" | WRONG in part — `private` members and constructors are not inherited [2] | the `private` non-example and the constructor sentence |
| "Shadowing a field" | WRONG term — the JLS calls a subclass field with the same name *hiding* (§8.3); shadowing is a different rule | "hides"; "hidden field" in the objectives and the 🧪 box |
| "JDK 25 relaxes this: statements that do not touch the object may come before `super(...)`" (draft) | WRONG in part — JEP 513: the statements "cannot reference the object under construction, but they can initialize its fields" [15] | "statements that do not refer to the object under construction" |
| "`super(...)` must be the first statement" | OK for Java 21 — JLS §8.8.7 [3] | cited, with the JDK 25 note |
| "every class implicitly extends `Object`" | OK — JLS §8.1.4, for a class other than `Object` [1] | "every class other than `Object`", cited |
| "`Object`'s default would print something like `Animal@1b6d3586`" | OK — API: `getClass().getName() + '@' + Integer.toHexString(hashCode())` [13] | cited |
| `Stack extends Vector`; `Deque` recommended | OK — `Stack` API [14] | cited |
| "The failure happens at run time, on line 9" | OK — the stack trace (run) says `at Main.main(Main.java:9)` | none |
| Every `Output:` and `Compiler error:` block (19 fences) | OK — `prove.py`: proved 11, rejected 8 | none |
| Quiz answers and the `<details>` | OK — quiz 1 from a run of `Dog() { }` against `Animal(String n)` (`constructor Animal in class Animal cannot be applied to given types`); quiz 2 from the §3 fence; quiz 3 from the §4 `ClassCastException` fence; quiz 4 from the §2 access fence; quiz 5 from §1; the `<details>` fence proved | none |

### Review

Scored 1–5 before the fix, the single highest-impact fix named, scored again after. Every `After`
must reach 4.

| Criterion | Before | Highest-impact fix | After |
|---|---|---|---|
| accuracy — Accuracy & currency — every claim true now, sourced or derived | 3 — "a full superclass object inside it", "dispatch table", "signature exactly", "shadowing"; no sources | each fixed; seventeen primary sources; every fence proved | 5 |
| clarity — Clarity for this reader — no term used before it is defined | 3 — a 9-sentence intro paragraph; sentences to 40 words; "upcasting" named, never defined | the intro as a list; upcast and downcast defined; mean 14 words, longest 30 | 5 |
| sequence — Sequence — each section rests only on what came before it | 4 — §3 used a cast-free world; the `cannot find symbol` step was missing | the declared-type rule in §3 leads into the new §4 | 5 |
| practice — Worked example, non-example, checks with hidden solutions | 3 — two non-examples; the Predict box unanswered | nine new fences; five quizzes; a `<details>` with a proof | 5 |
| misconceptions — Misconceptions, edge cases, troubleshooting covered | 3 — a 5-bullet list; casting, `private`, `static` hiding absent | a 14-row table, one row per real message | 5 |
| actionability — Actionable — the reader can DO the objectives afterwards | 3 — no objectives; no way to reach a subclass method | five objectives with a check each; the `instanceof` guard pattern | 5 |

## What changed, and why

| Change | Why |
|---|---|
| Objectives line; ✅ (5 quizzes, 1 `<details>`); 📚 (17); TOC extended | the /prepare contract |
| Intro as a list | register (a 9-sentence paragraph) |
| §1: one object, cited; the implicit `super();` order fence; the missing-constructor error; the `private` non-example; the `Stack` non-example | gaps 3, 4, 7; fact-check rows 1, 4 |
| §2: signature defined; the narrowed-access non-example; covariant returns | gap 5; fact-check row 3 |
| §3: upcast defined; declared type vs object's class, with the `cannot find symbol` fence; "hides"; the `static` non-example | gaps 2, 6; fact-check row 5 |
| §4 (new): reference casting, a flowchart, the `instanceof` guard, `ClassCastException`, the unrelated cast | gap 1 (coverage map 3.5) |
| §5: `Object` as the default superclass, cited; the dispatch-table claim removed; the `final` class non-example | gap 8; fact-check rows 2, 7, 8 |
| Gotcha checklist → 14-row troubleshooting table; mental-model rows added | the /prepare shape |
| Predict box as a numbered list, answered in `<details>` with a proved fence | the /prepare shape |
| Register: long sentences and walls split; hedges removed ("actually", "really", "kind of") | lint: 13 problems → 0 |
