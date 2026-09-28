# Nested & Anonymous Classes; Lambdas — preparation record

The /prepare chain for `05-robust-oop/04-nested-and-anonymous-classes-and-lambdas.md`, in order. Not rendered (the leading `_`). The lesson is edited in
place; this file is the evidence behind each change. Prepared 2026-09-28; every run on Temurin
21 (`/usr/libexec/java_home -v 21`), JLS 21 and the Java SE 21 API fetched from docs.oracle.com
the same day.

## Research

### Audience

- *Holds already* (earlier lessons, never re-taught): methods, parameters, return values
  (Methods); `static` vs instance (static vs Instance); `private` (Encapsulation & Access
  Modifiers); interfaces, `implements`, `@Override`, `public` implementations (Abstract Classes &
  Interfaces); `List.of`, `ArrayList`, generics with type arguments such as `List<String>` (The
  Collections Framework, Generics); `Comparator` and `list.sort` (The Collections Framework).
- *Must not be assumed* (defined where it first appears): **nested**, **inner**, **local** and
  **anonymous** class, **enclosing instance**, `outer.new Inner()`, **functional interface**,
  **lambda**, **effectively final**, `@FunctionalInterface`, `Predicate`, `Function`, `Supplier`,
  `Consumer`, **method reference** and its four forms.
- *The one thing an expert forgets a newcomer does not know:* an inner object cannot exist
  without the outer object it was made from.

### Gaps in the chapter

Four lenses, most severe first: prerequisite, step, edge, structure. Coverage map rows: 3.1
(objects, **nested-class objects**, object life cycle) `partial` M — nested-class objects filled
here (object life cycle belongs to 03-classes-and-objects/04); 3.6 (functional interfaces)
`partial` H — the built-in functional interfaces filled here; 6.1 (lambdas, functional
interfaces) `covered`.

| Gap | Kind | Filled where | Source |
|---|---|---|---|
| Nested-class objects (coverage map 3.1): each inner object tied to its own outer object; `new Outer.Inner()` rejected | edge | §1: the `Counter`/`Step` fence (`1` / `101` / `2`); the enclosing-instance error; quiz 1; 2 gotcha rows | JLS §8.1.3 [1]; runs |
| Effectively final named in the rule and the gotchas, never defined or shown | prerequisite | §3 non-example (`must be final or effectively final`), defined; quiz 3; gotcha row | JLS §15.27.2 [6]; run |
| The built-in functional interfaces (`Predicate`, `Function`, `Supplier`, `Consumer`) absent here and in the streams lesson (coverage map 3.6) | step | new §4: a table and a fence (`false` / `true` / `5` / `hi` / `DONE`); quiz 4 | `java.util.function` API [8]; run |
| Four method-reference forms named, two shown | step | §5: a form table and a fence (`43` / `Dr. Ada` / `5` / `true` / `[new]`); quiz 5 | JLS §15.13 [9]; run |
| Lambda syntax only as one-parameter expressions: no block body, no typed parameters | step | §3: the `IntOp` fence (`7` / `4`) | JLS §15.27 [5]; run |
| `@FunctionalInterface` recommended, never shown | edge | §3 compiler-error fence; gotcha row | JLS §9.6.4.9 [7]; run |
| A lambda is not an anonymous class: `this`, and no generated class file | edge | §2 terminal listing (`Main$1.class` only); §3 mechanism; gotcha row | JLS §15.27.2 [6]; run |
| The kinds of nested class (member, local, anonymous, static) never listed | prerequisite | §1 list | JLS §8.1.3 [1], §14.3 [2] |
| "Tutorial 28", "the next tier", dead references | structure | links to Functional Java & Streams | — |
| No objectives, checks or sources; gotchas as bullets; the 🧪 box unanswered | structure | objectives; ✅ (5 quizzes, 1 `<details>` with a proved fence); 9-row table; 📚 (9) | `/prepare` chain |

### Plan

| Section | Carries | Why here |
|---|---|---|
| Intro + objectives | the three tools as a list; five objectives | the reader's map |
| §1 Nested classes | the four kinds; the kept fence; the `Counter`/`Step` fence; **non-example** `new Outer.Inner()` | classes in a smaller scope first |
| §2 Anonymous classes | the kept fence; the generated `Main$1.class` | the pre-lambda way to pass behavior |
| §3 Lambdas | the kept fences; block bodies and typed parameters; not an anonymous class; `@FunctionalInterface`; **non-example** a reassigned captured local | lambdas replace §2's ceremony |
| §4 Built-in interfaces (new) | a table and a fence | once lambdas exist, the reader needs targets for them |
| §5 Method references | the kept fence; a four-form table and a fence | shortens §3 and §4's lambdas |
| 6 / 7 | summary rows per rule; a 9-row symptom → cause → fix table | read by the study profile |
| ✅ / 📚 | one check per objective; the Predict box answered with a proved fence | after all mechanisms |

### Unverified

- _None._

### Fact-check

A separate pass over the FINISHED draft, as a checker: every number, name, version, code line and
cite. Only what changed or was flagged is listed.

| Claim | Verdict | Fix |
|---|---|---|
| "A `static` nested class … is a top-level class that merely lives in another's namespace" | WRONG — it is a nested member class, not top-level; it can use the outer class's `private` members (run: `o.x` from a `static` nested class printed `10`) | "It is still a member of `Outer`, so it can use `Outer`'s `private` members, but only through an `Outer` object" |
| "`name -> …` is exactly the anonymous class from §2"; "It's the anonymous class of §2 with all the ceremony removed" | WRONG — a lambda's `this` and names mean what they do in the surrounding code [6]; no class file is generated (run: `Main$1.class` for the anonymous class only) | "the same behavior"; "does the job of"; the difference stated in §3 |
| "`StaticNested` … can't see `x`" | OK — run: `non-static variable x cannot be referenced from a static context` | quoted; gotcha row |
| "A local class is declared inside a method body" (draft) | WRONG in part — JLS §14.3: "immediately contained by a block" [2] | "inside a block, such as a method body" |
| "The rule removes the question of which value it would see" (draft) | VERIFY — the JLS's stated reason is concurrency | the JLS reason quoted [6] |
| "captures only effectively-final locals" | OK — JLS §15.27.2 [6]; run | defined and shown |
| "A lambda needs a one-method target (mark your own with `@FunctionalInterface`)" | OK — JLS §9.8 [4], §9.6.4.9 [7]; run: `Unexpected @FunctionalInterface annotation` | shown |
| "The forms — `Type::staticMethod`, `Type::instanceMethod`, `object::instanceMethod`, `Type::new`" | OK — JLS §15.13 [9]; each form run | a table and a fence |
| "Tutorial 28", "the next tier" | WRONG as references | links to Functional Java & Streams |
| Every `Output:` and `Compiler error:` block (13 fences) | OK — `prove.py`: proved 9, rejected 4 | none |
| The `javac` / `ls *.class` listing in §2 | OK — run on Temurin 21 (anonymous class and a lambda in one file): `Greeter.class`, `Main$1.class`, `Main.class` | none |
| Quiz answers and the `<details>` | OK — quiz 1 from the §1 fence; quiz 2 from the §3 fence; quiz 3 from the §3 non-example; quiz 4 from the §4 table [8]; quiz 5 from the §5 table and fence; the `<details>` fence proved | none |

### Review

Scored 1–5 before the fix, the single highest-impact fix named, scored again after. Every `After`
must reach 4.

| Criterion | Before | Highest-impact fix | After |
|---|---|---|---|
| accuracy — Accuracy & currency — every claim true now, sourced or derived | 3 — "top-level class"; "exactly the anonymous class"; no sources | each fixed; nine primary sources; every fence proved | 5 |
| clarity — Clarity for this reader — no term used before it is defined | 3 — "effectively final" used, never defined; a 6-sentence intro | defined at the non-example; the intro as a list; mean 14 words, longest 30 | 5 |
| sequence — Sequence — each section rests only on what came before it | 4 — method references used `Comparator` shapes before any built-in interface | §4 introduces the built-in interfaces before §5 | 5 |
| practice — Worked example, non-example, checks with hidden solutions | 3 — one compile error; the Predict box unanswered | eight new fences; five quizzes; a `<details>` with a proof | 5 |
| misconceptions — Misconceptions, edge cases, troubleshooting covered | 3 — a 5-bullet list | a 9-row table, one row per real message | 5 |
| actionability — Actionable — the reader can DO the objectives afterwards | 3 — no way to name a target type for a lambda | §4 and five objectives with a check each | 5 |

## What changed, and why

| Change | Why |
|---|---|
| Objectives line; ✅ (5 quizzes, 1 `<details>`); 📚 (9); TOC extended | the /prepare contract |
| Intro as a list; the streams link | register; gap 9 |
| §1: the four kinds; the `Counter`/`Step` fence; the enclosing-instance error; the "top-level" claim fixed | gaps 1, 8; fact-check rows 1, 3, 4 |
| §2: the generated `Main$1.class` listing | gap 7 |
| §3: block bodies and typed parameters; lambda vs anonymous class; `@FunctionalInterface`; the effectively-final non-example | gaps 2, 5, 6, 7; fact-check rows 2, 5–7 |
| §4 (new): the built-in functional interfaces | gap 3 (coverage map 3.6) |
| §5: the four method-reference forms, with a fence | gap 4; fact-check row 8 |
| Gotcha checklist → 9-row troubleshooting table; mental-model rows added | the /prepare shape |
| Predict box as a numbered list, answered in `<details>` with a proved fence | the /prepare shape |
| Register: long sentences split; hedges removed ("just", "actually") | lint: 18 problems → 0 |
