# Methods — preparation record

The /prepare chain for `02-control-flow/06-methods.md`, in order. Not rendered (the leading `_`). The lesson is edited in
place; this file is the evidence behind each change. Prepared 2026-09-28; every run on Temurin
21.0.12.1 (`/usr/libexec/java_home -v 21`), JLS 21 fetched from docs.oracle.com the same day.

## Research

### Audience

- *Holds already* (earlier lessons, never re-taught): `main` and `public static void`, `String... args`
  as a legal `main` (lesson 01), `static` (named only), variables and types, "possible lossy
  conversion", widening `int` → `long` → `double`, `String` immutability and `toUpperCase`,
  `if`/`else`, `unreachable statement` (Loop Control), block scope and `cannot find symbol`
  (Loops), arrays, `new int[] {…}`, `Arrays.copyOf`, `b = a` shares an array (Arrays).
- *Must not be assumed* (defined where it first appears): method, parameter, **argument** (used
  undefined), return type, `void`, **local variable**, scope, signature, overloading, **varargs**,
  pass-by-value, reference (as "the handle to the object").
- *The one thing an expert forgets a newcomer does not know:* calling a value-returning method
  on its own line, `addOne(x);`, compiles and does nothing.

### Gaps in the chapter

Four lenses, most severe first: prerequisite, step, edge, structure. Coverage map rows: 3.3
(overloading, including varargs) `partial` H — "Varargs in 02-control-flow/06"; 3.4 (variable
scope) `partial` M — "Scope and shadowing taught once, in 02-control-flow/06 (block scope)". Both
filled here.

| Gap | Kind | Filled where | Source |
|---|---|---|---|
| Varargs missing (coverage map 3.3, H) | structure | new §5: a proof (`0` / `4` / `6` / `30`); the not-last non-example; quiz 4; gotcha row | JLS §8.4.1 [8], §15.12.2 [6]; runs |
| Scope of parameters and locals, and redeclaring a name, never taught (coverage map 3.4) | structure | new §3: `cannot find symbol` across methods, `already defined` in a nested block, both proved; quiz 1; gotcha rows | JLS §6.3 [3], §6.4 [4]; runs |
| A call with the wrong number or type of arguments | edge | §1 non-example (`cannot be applied to given types`), proved; `square(2.5)` in prose; gotcha rows | runs |
| The `void`-as-value error was asserted, never run; `return 5;` in a `void` method | step | §2, a compiler-error proof; prose for `unexpected return value`; quiz 2; gotcha rows | JLS §14.17 [2]; runs |
| Ignoring a returned value (`addOne(x);`) changes nothing; the `x = addOne(x)` fix was stated, not run | edge | §6, a proof (`5` / `6`); gotcha row | run |
| Overload resolution by widening, and ambiguity ("may refuse an ambiguous call" was unproved) | step | §4, a proof (`long 5` / `double 5.0`); `reference to pair is ambiguous` in prose; quiz 3; gotcha row | JLS §15.12.2 [6]; runs |
| The classic `swap` that swaps nothing | edge | §6 bite, proved (`1 2`); quiz 5 | JLS §8.4.1 [8]; run |
| A `String` parameter reassigned in a method | edge | §7, a proof (`hi`); gotcha row | run; link to Strings |
| Removing `static` breaks the call from `main` | edge | §1 prose; gotcha row | run |
| "Argument" and "local variable" used undefined | prerequisite | intro; §3 | — |
| No objectives, checks or sources; the Predict box unanswered; gotchas were bullets; "Tutorial 7/14/15", "this tier" | structure | objectives; ✅ (5 quizzes, 1 `<details>`); 📚 (8); 15-row table; links to Conditionals, `static` vs Instance, References | `/prepare` chain |

### Plan

| Section | Carries | Why here |
|---|---|---|
| Intro + objectives | method, parameter, argument, return type; pass-by-value named; five objectives | the reader's map |
| §1 Define and call | `square`; `static` pointed forward; **non-example** wrong arguments; missing-return bite; unreachable | the shape before anything else |
| §2 `void` | early return; `void` as a value, proved; `unexpected return value` | the second return shape |
| §3 Scope (new) | locals end with the method; **non-example** redeclared name | parameters are locals, and pass-by-value needs that idea |
| §4 Overloading | by type; widening and closest fit; ambiguity; return-type clash | needs signatures from §1 |
| §5 Varargs (new) | `int...`; empty call; **non-example** not last | an overloading-adjacent parameter form; needs arrays |
| §6 Pass-by-value, primitives | `addOne`; `swap`; ignored result | needs scope (§3) |
| §7 Pass-by-value, references | `mutate`/`reassign`; `String` parameter | the reference case last |
| 8 / 9 | summary rows per rule; a 15-row symptom → cause → fix table | read by the study profile |
| ✅ / 📚 | one check per objective; the Predict box answered | after all mechanisms |

### Unverified

- _None._

### Fact-check

A separate pass over the FINISHED draft, as a checker: every number, name, version, code line and
cite. Only what changed or was flagged is listed.

| Claim | Verdict | Fix |
|---|---|---|
| "`String s = greet("Ada");` would be rejected" | OK, unproved — run: `incompatible types: void cannot be converted to String` | now a compiler-error proof |
| "the compiler … may … refuse an ambiguous call" | OK, unproved — run: `reference to pair is ambiguous` | stated with the real message in §4 |
| "to reflect a change, it must *return* the new value (`x = addOne(x);`)" | OK, unproved | a proof (`5` / `6`) |
| "Tutorial 14 gives `static` its full treatment", "[Tutorial 7]", "the object model in Tutorial 15", "from this tier" | WRONG as references | links to `static` vs Instance, Conditionals, References; "this chapter" |
| "There is no mechanism in Java to pass a primitive variable so the callee can change it" | OK — JLS §8.4.1: argument values "initialize newly created parameter variables" [8] | cited; "Java has no way to …" |
| "`long` is the closer one" for `show(5)` | OK — JLS §15.12.2 picks the most specific applicable method [6]; run `long 5` | none |
| "overload resolution tries varargs *last*" | OK — JLS §15.12.2: "The third phase allows overloading to be combined with variable arity methods" [6] | none |
| "A method may have at most one varargs parameter" | OK — JLS §8.4.1: "At most one variable arity parameter is permitted" [8] | none |
| "`main(String... args)` is a legal way to write `main`" | OK — What Java Is & Running Code, from JLS §12.1.4 and a run | none |
| "A local variable that hides a *field* of the class is legal" | OK — JLS §6.4.1 shadowing; the §6.4 error applies to locals only [4] | none |
| The messages in prose and the table: `non-static method square(int) cannot be referenced from a static context`, `possible lossy conversion from double to int`, `unreachable statement`, `incompatible types: unexpected return value`, `reference to pair is ambiguous` | OK — each from a run on javac 21 | none |
| Every `Output:` and `Compiler error:` block (17 fences) | OK — `prove.py`: 17/17 | none |
| Quiz answers and the `<details>` | OK — quiz 1 from the §3 proof; quiz 2 from the §2 proof; quiz 3 from the §4 proof; quiz 4 from the §5 proof; quiz 5 from the §6 proof; `<details>` from a run (`2`; `inside: 1` / `outside: 0`; `16`; `15`) | none |

### Review

Scored 1–5 before the fix, the single highest-impact fix named, scored again after. Every `After`
must reach 4.

| Criterion | Before | Highest-impact fix | After |
|---|---|---|---|
| accuracy — Accuracy & currency — every claim true now, sourced or derived | 4 — the claims held; three claims unproved; tutorial numbers; no sources | proofs for each; links; eight JLS sources | 5 |
| clarity — Clarity for this reader — no term used before it is defined | 4 — "argument", "local variable" undefined; long paragraphs | defined at first use; paragraphs split; mean 14 words | 5 |
| sequence — Sequence — each section rests only on what came before it | 4 — pass-by-value leaned on "parameters are locals" without teaching scope | the new §3 before pass-by-value | 5 |
| practice — Worked example, non-example, checks with hidden solutions | 3 — a bite per section; no hidden answers; §2 and §6 bites were prose | the wrong-arguments, redeclare, varargs-not-last, `swap` and `String` cases; five quizzes; a `<details>` | 5 |
| misconceptions — Misconceptions, edge cases, troubleshooting covered | 3 — five bullets | a 15-row symptom → cause → fix table, one row per real message | 5 |
| actionability — Actionable — the reader can DO the objectives afterwards | 3 — no varargs, no scope; objectives implicit | the two new sections; five objectives with a check each | 5 |

## What changed, and why

| Change | Why |
|---|---|
| Objectives line; ✅ (5 quizzes, 1 `<details>`); 📚 (8) | the /prepare contract |
| Intro: "argument" defined; split | gap 10 |
| §1: `static` link and the non-static error; wrong-arguments non-example; `square(2.5)`; unreachable | gaps 3, 9; fact-check row 4 |
| §2: `void` as a value, proved; `unexpected return value` | gap 4; fact-check row 1 |
| §3 (new): scope of locals; redeclared name | gap 2 (coverage map 3.4) |
| §4: widening and ambiguity | gap 6; fact-check row 2 |
| §5 (new): varargs, and varargs not last | gap 1 (coverage map 3.3) |
| §6: `swap`; the ignored result, proved | gaps 5, 7; fact-check row 3 |
| §7: the `String` parameter; the References link | gap 8; fact-check row 4 |
| Gotcha checklist → 15-row troubleshooting table; mental-model rows updated; TOC renumbered | the /prepare shape |
| Predict box as a numbered list, answered in `<details>` | the /prepare shape |
| Register: hedges ("actually", "just", "rather") removed, long sentences split | lint: 26 problems → 0 |
