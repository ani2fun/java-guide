# Classes & Objects — preparation record

The /prepare chain for `03-classes-and-objects/01-classes-and-objects.md`, in order. Not rendered (the leading `_`). The lesson is edited in
place; this file is the evidence behind each change. Prepared 2026-09-28; every run on Temurin
21 (`/usr/libexec/java_home -v 21`), JLS 21 fetched from docs.oracle.com the same day.

## Research

### Audience

- *Holds already* (earlier lessons, never re-taught): `static` methods, parameters, return types,
  overloading and `cannot be applied to given types` (Methods); `non-static method … cannot be
  referenced from a static context` (Methods §1); pass-by-value of references and `b = a` sharing
  an array (Methods, Arrays); local variables and `might not have been initialized` (Variables);
  `null` as a word only; the file-name rule for a `public` class (What Java Is).
- *Must not be assumed* (defined where it first appears): class, field, object, instance,
  instance method, **receiver** (used as "the object before the dot"), constructor, **default
  constructor**, **default value**, shadowing, `this`, aliasing.
- *The one thing an expert forgets a newcomer does not know:* this is the first program with two
  classes in one file, and nothing said why `Rectangle` has no `public`.

### Gaps in the chapter

Four lenses, most severe first: prerequisite, step, edge, structure. Plus this lesson's rows in
`_prepare/coverage-map.md`: 3.1 (object creation) and 3.2 (constructors) are `partial` M; their
initializer and life-cycle halves belong to lessons 03 and 04.

| Gap | Kind | Filled where | Source |
|---|---|---|---|
| Field default values: the lesson said "each defaulting to `0`" for `int` only, and never said a `String` or array field starts at `null` | step | §1 "Fields start at a default value", a proof of six types (`0`, `0.0`, `false`, `0`, `null`, `null`); quiz 1 | JLS §4.12.5 [2]; run |
| Fields get a default, locals do not: `Rectangle r;` then `r.area()` | edge | §1 non-example, `variable r might not have been initialized`, proved; gotcha row | JLS §4.12.5 [2]; run |
| The default constructor was said to "set fields to their defaults"; in fact `new` sets the defaults, and the default constructor has no parameters and none of the author's code | step | §2 mechanism: the three steps of `new` | JLS §12.5 [6], §8.8.9 [7] |
| A constructor was called "a special method"; the JLS says constructor declarations are not members, and `void` in front makes an ordinary method | edge | §2 wording; non-example `void Rectangle(int w, int h)`, `required: no arguments`, proved; quiz 2; gotcha row | JLS §8.8 [5]; run |
| "If you want both, declare both" was never shown; constructor overloading and `this(…)` chaining missing (coverage map 3.2) | structure | §2, a proof (`12` / `25`); `call to this must be first statement in constructor` in prose; JDK 25 note | JLS §8.8.7 [9], §8.8.8 [8]; JEP 513 [10]; runs |
| Two classes in one file, `Rectangle` without `public`, and `Rectangle.class` written beside `Main.class` | prerequisite | §1 "Two classes, one file"; the `class Rectangle is public` gotcha row | JLS §7.6 [1]; runs (class files listed; javac error) |
| `println(r)` prints `Rectangle@15db9742`, not the fields | edge | §1, an illustrative proof; gotcha row | `Object.toString()` API [4]; run |
| Field initializers (`int width = 1;`) never named | prerequisite | §1 one line; §2 step 2 of `new` | JLS §8.3.2 [3], §12.5 [6]; run (`1` / `5`) |
| "Receiver" used undefined; `this` named "the current object" with no source | prerequisite | §1 intuition; §3 analysis | JLS §15.8.3 [12] |
| No objectives, no checks, bullets for gotchas, no sources; "Tutorial 13", "Tutorial 15" | structure | objectives; ✅ (4 quizzes, 1 `<details>` with a proved `Circle`); 10-row table; 📚 (12); links to Encapsulation and References | `/prepare` chain |

### Plan

| Section | Carries | Why here |
|---|---|---|
| Intro + objectives | class, field, object; the reference idea; five objectives | the reader's map |
| §1 Fields and methods | `Rectangle`; the receiver; two classes in one file; `Rectangle.area()` bite; **default values** proof; **non-example** local without `new`; printing an object | defaults answer "what is in `width` before I set it?", the first question §1 raises |
| §2 Constructors | constructor; the three steps of `new`; default constructor; missing no-arg bite; `this(…)` overloading; **non-example** `void Rectangle` | the steps of `new` need the defaults from §1 |
| §3 `this` | shadowing; `this`; self-assignment bite | `this(…)` in §2 used `this.width = width`; §3 explains it |
| §4 Instances and aliasing | two counters; `c = a` | the reference idea last, as the bridge to References |
| 5 / 6 | summary rows per rule; a 10-row symptom → cause → fix table | read by the study profile |
| ✅ / 📚 | one check per objective; the Predict box answered | after all mechanisms |

### Unverified

- _None._

### Fact-check

A separate pass over the FINISHED draft, as a checker: every number, name, version, code line and
cite. Only what changed or was flagged is listed.

| Claim | Verdict | Fix |
|---|---|---|
| "Fields are public to this file for now" | WRONG — a field with no modifier has package access, reachable from any class in the package (JLS §6.6) | "any class in the same package can reach them" |
| "A constructor — a special method with the class's name" | WRONG — JLS §8.8: "Constructor declarations are not members"; it only looks like a method [5] | "looks like a method … A constructor is not a method" |
| "Java supplies a hidden no-argument one that sets fields to their defaults" | WRONG in part — `new` sets the defaults before any constructor runs (JLS §12.5); the default constructor only calls `super()` (JLS §8.8.9) [6] [7] | the three steps of `new`; the default constructor has "none of your code" |
| "many compilers and IDEs warn about it" (self-assignment) | WRONG for javac — `javac -Xlint:all` on the self-assigning class printed nothing, exit 0 (run 2026-09-28) | "javac gives no warning, even with `-Xlint:all`"; the IDE claim dropped as unsourced |
| "you cannot call it by name, only through `new`" (draft) | WRONG — `this(…)` also runs a constructor | "`new` runs it, and so can another constructor" |
| The class diagram's `int area() int` | WRONG — the return type written twice | `area() int` |
| "Tutorial 13", "Tutorial 15" | WRONG as references | links to Encapsulation & Access Modifiers and References, Equality & the Object Model |
| "A field may also declare its own start value, as in `int width = 1;`" | OK — JLS §8.3.2 [3]; run: `new Rectangle()` with `int width = 1; int height = 1;` printed `1`, then `5` after `r.width = 5` | none |
| `class Rectangle is public, should be declared in a file named Rectangle.java`, `call to this must be first statement in constructor` (prose) | OK — each from a run on javac 21 | none |
| "`javac` still writes one bytecode file per class" | OK — run: `Main.class`, `Rectangle.class` in the output directory | none |
| "JDK 25 relaxes this rule" | OK — JEP 513 "Flexible Constructor Bodies", Status: Closed / Delivered, Release 25 [10] | none |
| `println(r)` prints `Rectangle@…` | OK — `Object.toString()` returns `getClass().getName() + '@' + Integer.toHexString(hashCode())` [4]; labelled illustrative | none |
| Every `Output:` and `Compiler error:` block (14 fences) | OK — `prove.py`: 14/14 | none |
| Quiz answers and the `<details>` | OK — quiz 1 from a run (`false null`); quiz 2 from the §2 non-example; quiz 3 from a run (`box 0`); quiz 4 from a run (`2 1 2`); the `Circle` answer is a proved fence | none |

### Review

Scored 1–5 before the fix, the single highest-impact fix named, scored again after. Every `After`
must reach 4.

| Criterion | Before | Highest-impact fix | After |
|---|---|---|---|
| accuracy — Accuracy & currency — every claim true now, sourced or derived | 3 — four false claims (fields "public to this file"; constructor a "method"; default constructor sets defaults; compilers warn); no sources | fix the four; twelve primary sources; every block proved | 5 |
| clarity — Clarity for this reader — no term used before it is defined | 3 — "receiver" undefined; sentences to 47 words; one 5-sentence intro paragraph | define at first use; split; mean 13 words, longest 27 | 5 |
| sequence — Sequence — each section rests only on what came before it | 4 — §2's "sets fields to their defaults" leaned on an unshown rule | defaults proved in §1 before constructors | 5 |
| practice — Worked example, non-example, checks with hidden solutions | 3 — a bite per section; no hidden answers | the local-without-`new` and `void` constructor non-examples; four quizzes; a proved `Circle` answer | 5 |
| misconceptions — Misconceptions, edge cases, troubleshooting covered | 3 — five bullets | a 10-row symptom → cause → fix table, one row per real message | 5 |
| actionability — Actionable — the reader can DO the objectives afterwards | 3 — no constructor overloading shown; objectives implicit | `this(…)` proof; five objectives with a check each | 5 |

## What changed, and why

| Change | Why |
|---|---|
| Objectives line; ✅ (4 quizzes, 1 `<details>`); 📚 (12) | the /prepare contract |
| Intro split into three short paragraphs | register |
| §1: package access wording; two classes in one file; default values proof; local-without-`new` non-example; printing an object; field initializers | gaps 1, 2, 6, 7, 8; fact-check row 1 |
| §2: "looks like a method"; the three steps of `new`; the default constructor; `this(…)` proof; `void` constructor non-example | gaps 3, 4, 5; fact-check rows 2, 3, 5 |
| §3: `this` cited; the javac-is-silent fix | gap 9; fact-check row 4 |
| §4: link to References | fact-check row 7 |
| Class diagram: `area() int` | fact-check row 6 |
| Gotcha checklist → 10-row troubleshooting table; mental-model rows added | the /prepare shape |
| Predict box as a numbered list, answered by the checks | the /prepare shape |
| Register: long sentences split, one hedge removed | lint: 17 problems → 0 |
