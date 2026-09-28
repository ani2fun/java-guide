# Encapsulation & Access Modifiers — preparation record

The /prepare chain for `03-classes-and-objects/02-encapsulation-and-access-modifiers.md`, in order. Not rendered (the leading `_`). The lesson is edited in
place; this file is the evidence behind each change. Prepared 2026-09-28; every run on Temurin
21 (`/usr/libexec/java_home -v 21`), JLS 21 fetched from docs.oracle.com the same day.

## Research

### Audience

- *Holds already* (earlier lessons, never re-taught): classes, fields, constructors, `this`,
  default values, field initializers, aliasing (Classes & Objects); `Arrays.copyOf` and shared
  arrays (Arrays); early `return` (Methods); `public` on `main` and the file-name rule (What Java
  Is); an exception stack trace, seen once.
- *Must not be assumed* (defined where it first appears): encapsulation, **invariant** (used
  undefined), getter, **setter** (used undefined), **package** (the table relied on it, never
  defined), unnamed package, access modifier, immutable, **defensive copy**.
- *The one thing an expert forgets a newcomer does not know:* every class a reader has written
  lives in the unnamed package, so package-private has never looked different from `public`.

### Gaps in the chapter

Four lenses, most severe first: prerequisite, step, edge, structure. Coverage map row 3.4
(encapsulation, immutable objects) `partial` M: encapsulation is taught here; the immutability
half was wrong (row 1 below). Scope and `var` were filled in Methods and Variables.

| Gap | Kind | Filled where | Source |
|---|---|---|---|
| "All fields `final`, no setters ⇒ immutable" is false when a field holds a mutable array: the caller's array and a leaking getter both change it | edge | §4 non-example (`0` / `-1`), then the defensive-copy fix (`90` / `90`), both proved; `<details>` check; gotcha row | JLS §4.12.4 [5]; runs |
| The invariant can be bypassed through the constructor: `new Account(-50)` with a guarded `deposit` | step | §2 non-example (`-50`), proved; quiz 2; gotcha row | run |
| `private` is per class, not per object: `other.balance` inside `Account` compiles | edge | §3 bite, proved (`true` / `false`); quiz 1 | JLS §6.6.1 [1]; run |
| "Package" never defined; package-private cannot be seen to differ from `public` in one-file programs | prerequisite | §3: package, unnamed package, a link to Packages | JLS §7.4.2 [2] |
| A blank `final` field that a constructor forgets: asserted, never shown | step | §4 mechanism, `variable y might not have been initialized` at `}`, proved; gotcha row | JLS §8.3.1.2 [4]; run |
| A top-level class declared `private` | edge | §3 prose, `modifier private not allowed here`; gotcha row | JLS §8.1.1 [3]; run |
| `public` "visible to everyone" ignores modules | edge | §3 table, "only if the package is exported" | JLS §6.6.1 [1] |
| "Invariant" and "setter" used undefined | prerequisite | intro; §2 | — |
| No objectives, checks or sources; gotchas as bullets; "Tutorial 21/22", "the last chapter"; the Predict box unanswered | structure | objectives; ✅ (3 quizzes, 2 `<details>`); 9-row table; 📚 (6); links to Inheritance, Enums & Records, Classes & Objects, Exceptions | `/prepare` chain |

### Plan

| Section | Carries | Why here |
|---|---|---|
| Intro + objectives | encapsulation, invariant, the access levels, immutable; four objectives | the reader's map |
| §1 `private` | getter; `has private access` bite | the wall first |
| §2 Invariants | setter; guarded `deposit`; public-field bite; **non-example** the constructor that skips the guard | a guard means something only once the wall exists |
| §3 Access levels | package and unnamed package; the table; `Auditor` proof; per-class-not-per-object bite; top-level `private` class | needs `private` from §1 |
| §4 Immutability | `final` fields; the blank-`final` error; `moveTo` bite; **non-example** the leaked array, and its fix | the strongest encapsulation last; the leak needs the aliasing from Classes & Objects |
| 5 / 6 | summary rows per rule; a 9-row symptom → cause → fix table | read by the study profile |
| ✅ / 📚 | one check per objective; the Predict box answered | after all mechanisms |

### Unverified

- _None._

### Fact-check

A separate pass over the FINISHED draft, as a checker: every number, name, version, code line and
cite. Only what changed or was flagged is listed.

| Claim | Verdict | Fix |
|---|---|---|
| "A class whose fields are all `final`, with no setters, is **immutable**" | WRONG — JLS §4.12.4: a `final` variable holding an array still allows "the components of the array" to change [5]; run: `0` / `-1` | immutable "provided the fields hold primitives or other immutable objects"; the non-example and the copy fix |
| "a `private` member is invisible outside its declaring class" | WRONG in part — access is granted within the whole top-level class body (JLS §6.6.1) [1] | "code inside the same top-level class" in the table |
| "`public` — everyone" | WRONG in part — a `public` class in a package its module does not export is accessible only inside that module (JLS §6.6.1) [1] | "(with modules, only if the package is exported)" |
| "The four access modifiers — `private`, package-private (the default), …" | WRONG — package-private is the absence of a modifier; there are three modifiers (JLS §6.6.1: "declared without an access modifier implicitly has package access") | "`private`, `protected` and `public`, plus writing none at all" |
| "Tutorial 21's `record` makes immutable data classes nearly free" | VERIFY — uncited, "Tutorial 21" a dead reference | a record component gives "a private field declared implicitly, and a public accessor method" [6]; a link to Enums & Records |
| "Tutorial 22", "the last chapter" | WRONG as references | links to Inheritance & Polymorphism and Classes & Objects |
| "By convention a getter is named `getX`" (draft) | VERIFY — no primary source fetched | "This book names a getter `getX`" |
| "the compiler verifies the field is set exactly once (every constructor path assigns it)" | OK, unproved — JLS §8.3.1.2 [4]; run: `variable y might not have been initialized` at the constructor's `}` | now a compiler-error proof |
| `modifier private not allowed here` | OK — JLS §8.1.1 [3]; run on javac 21 | none |
| `balance has private access in Account` for `acct.balance -= 10`, caret under the dot | OK — run on javac 21 | none |
| Every `Output:` and `Compiler error:` block (12 fences) | OK — `prove.py`: 12/12 | none |
| Quiz answers and the two `<details>` | OK — quiz 1 from the §3 proof; quiz 2 from the §2 non-example; quiz 3 from the table's rule; the array `<details>` from the §4 proofs; the 🧪 answers from runs (`refused: 150` / `100`; the private-access error) | none |

### Review

Scored 1–5 before the fix, the single highest-impact fix named, scored again after. Every `After`
must reach 4.

| Criterion | Before | Highest-impact fix | After |
|---|---|---|---|
| accuracy — Accuracy & currency — every claim true now, sourced or derived | 3 — the immutability rule false; "invisible outside its class", "`public` — everyone" and "four modifiers" imprecise; no sources | fix each; six JLS sources; every block proved | 5 |
| clarity — Clarity for this reader — no term used before it is defined | 3 — "package", "invariant", "setter" undefined; sentences to 45 words | defined at first use; split; mean 13 words, longest 27 | 5 |
| sequence — Sequence — each section rests only on what came before it | 4 — the table used "package" before defining it | package and unnamed package first in §3 | 5 |
| practice — Worked example, non-example, checks with hidden solutions | 3 — a bite per section; no hidden answers | the constructor-bypass and leaked-array non-examples; three quizzes, two `<details>` | 5 |
| misconceptions — Misconceptions, edge cases, troubleshooting covered | 3 — five bullets; "private is per object" never addressed | the per-class proof; a 9-row symptom → cause → fix table | 5 |
| actionability — Actionable — the reader can DO the objectives afterwards | 3 — the reader could not tell a truly immutable class | the copy fix proved; four objectives with a check each | 4 — package-private is explained, but the sandbox cannot show it failing across packages |

## What changed, and why

| Change | Why |
|---|---|
| Objectives line; ✅ (3 quizzes, 2 `<details>`); 📚 (6) | the /prepare contract |
| Intro: invariant defined; three modifiers plus the default; split | gap 8; fact-check row 4 |
| §1: `private` cited | fact-check row 2 |
| §2: setter defined; the `getX` naming as the book's own; an Exceptions link; the constructor-bypass non-example | gap 2; fact-check row 7 |
| §3: package and unnamed package; the table corrected (top-level class, modules); per-object proof; top-level `private` class | gaps 3, 4, 6, 7; fact-check rows 2, 3 |
| §4: the immutability rule corrected; blank-`final` proof; leaked-array non-example and the defensive-copy fix; `record` cited | gaps 1, 5; fact-check rows 1, 5 |
| Gotcha checklist → 9-row troubleshooting table; mental-model rows added | the /prepare shape |
| Predict box as a numbered list, answered in `<details>` | the /prepare shape |
| Register: long sentences split, hedges removed ("actually", "simply") | lint: 15 problems → 0 |
