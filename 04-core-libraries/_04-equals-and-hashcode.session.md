# equals & hashCode — preparation record

The /prepare chain for `04-core-libraries/04-equals-and-hashcode.md`, in order. Not rendered (the leading `_`). The lesson is edited in
place; this file is the evidence behind each change. Prepared 2026-09-28; every run on Temurin
21 (`/usr/libexec/java_home -v 21`), JLS 21 and the Java SE 21 API fetched from docs.oracle.com
the same day.

## Research

### Audience

- *Holds already* (earlier lessons, never re-taught): `==` as identity, `Object.equals` as
  identity, `.equals` on arrays, `Objects.equals` (References, Equality & the Object Model);
  overloading (Methods); `hashCode` and buckets, `HashSet`, `HashMap`, `contains`, `size`
  (Sets & Maps); `implements Comparable`, `toString` of a class (The Collections Framework);
  `identityHashCode` (Strings in Depth).
- *Must not be assumed* (defined where it first appears): **override** vs **overload** in the
  `equals` case, `instanceof`, the cast `(Point) o`, **annotation** (`@Override`), the
  equivalence-relation words (reflexive, symmetric, transitive, consistent, named once),
  declared type vs run-time type (for overload choice).
- *The one thing an expert forgets a newcomer does not know:* `equals(Point)` compiles, works
  when called directly, and is invisible to every collection.

### Gaps in the chapter

Four lenses, most severe first: prerequisite, step, edge, structure. No coverage-map row names
this lesson; row 3.5 ("overriding incl. `Object`") is covered by it.

| Gap | Kind | Filled where | Source |
|---|---|---|---|
| A mutated key: changing a field that `hashCode` uses while the object is in a `HashSet` loses it | edge | §4 non-example (`false`, `false`, `1`); quiz 4; gotcha row | `Set` API [6], `Map` API [7]; `hashCode` contract [4]; run |
| `@Override` catching `equals(Point)` claimed, never shown | step | §2, a `Compiler error:` fence (`method does not override or implement a method from a supertype`); gotcha row | JLS §9.6.4.4 [3]; javac 21 |
| `equals(Point)` without `@Override`: "collections ignore it" claimed, never shown; the Predict box's last question depends on it | edge | §2 non-example (`true`, `false`, `false`, with a correct `hashCode`); quiz 2; the `<details>` | JLS §9.6.4.4 [3]; run |
| The full `hashCode` contract (unequal objects may collide; stable while fields are unchanged) and the `equals` contract never stated | prerequisite | §3 bullet list; §2 mechanism | `Object.hashCode` [4], `Object.equals` [1] |
| "Collections use `.equals`" asserted | step | §1 bite, `List.contains` quoted | `List.contains` API [2] |
| No objectives, checks or sources; gotchas as bullets; "Tutorial 21", "Tutorial 26", "the last chapter"; the Predict box unanswered | structure | objectives; ✅ (4 quizzes, 1 `<details>`); 8-row table; 📚 (7); links to Sealed Classes & Pattern Matching, Enums & Records, Sets & Maps | `/prepare` chain |

### Plan

| Section | Carries | Why here |
|---|---|---|
| Intro + objectives | the trap as a list; four objectives | the reader's map |
| §1 Default is identity | the kept fence; `Object.equals` quoted; collections use `.equals` | the problem first |
| §2 Overriding `equals` | the kept fence; `@Override` defined; the `equals` contract; **non-example** the compile error; **non-example** the silent overload | fix one method, and its signature trap |
| §3 The contract | the three rules; the kept breakage fence; the diagram, made consistent | the second method, and why |
| §4 Generating both | the kept fix fence; `Objects.hash` quoted; **non-example** the mutated key; `record` link | the fix, then its one remaining trap |
| 5 / 6 | summary rows; an 8-row symptom → cause → fix table | read by the study profile |
| ✅ / 📚 | one check per objective; the Predict box answered | after all mechanisms |

### Unverified

- _None._

### Fact-check

A separate pass over the FINISHED draft, as a checker: every number, name, version, code line and
cite. Only what changed or was flagged is listed.

| Claim | Verdict | Fix |
|---|---|---|
| "a `hashCode` tied to the object's address" | WRONG — the API promises only distinct integers for distinct objects "as far as is reasonably practical" [4]; it names no address | "a `hashCode` based on identity" |
| The diagram: `hashCode → 7` in bucket 1, `→ 42` in bucket 2, with 4 buckets | WRONG under the `% 4` rule of Sets & Maps — `7 % 4 = 3` | A in bucket 3; edges labelled `7 % 4 = 3` and `42 % 4 = 2`; numbers marked "(example)" |
| "satisfying `equals`'s contract that it never throws on a bad argument" | WRONG as stated — the contract says `x.equals(null)` "should return false" [1]; it does not mention wrong types | the null rule quoted; the four properties named |
| "`Object.equals(o)` is defined as `this == o`" | OK — "if and only if x and y refer to the same object" [1] | quoted |
| "`@Override` asks the compiler to confirm" | OK — JLS §9.6.4.4 [3]; javac 21 run shows the error | the compiler-error fence |
| "collections (which call `equals(Object)`) ignore your version" | OK — run: `contains(b)` is `false` with a correct `hashCode` | the non-example fence |
| "`Objects.hash(x, y)` combines the fields … deterministically" | OK — "as if all the input values were placed into an array" and hashed [5] | quoted |
| "Tutorial 21's `record`", "Tutorial 26", "the last chapter" | WRONG as references | links to Enums & Records, Sealed Classes & Pattern Matching, "the last lesson" |
| "`record` … generates both (and `toString`)" | OK — taught in Enums & Records; "which are `final`" added | none |
| Every `Output:` block and the compiler error (7 fences) | OK — `prove.py`: proved 6, rejected 1 | none |
| Quiz answers and the `<details>` | OK — quiz 1 from the §1 proof; quiz 2 from the §2 overload proof; quiz 3 from the §3 proof; quiz 4 from the §4 mutated-key proof | none |

### Review

Scored 1–5 before the fix, the single highest-impact fix named, scored again after. Every `After`
must reach 4.

| Criterion | Before | Highest-impact fix | After |
|---|---|---|---|
| accuracy — Accuracy & currency — every claim true now, sourced or derived | 3 — "tied to the address"; a diagram inconsistent with its own rule; the `null` contract misstated; no sources | each fixed; seven primary sources; every fence proved | 5 |
| clarity — Clarity for this reader — no term used before it is defined | 4 — sentences to 80 words; annotation undefined | lists; defined at first use; mean 14 words, longest 29 | 5 |
| sequence — Sequence — each section rests only on what came before it | 5 | none needed | 5 |
| practice — Worked example, non-example, checks with hidden solutions | 3 — the `@Override` and overload claims unshown; the Predict box unanswered | three new non-examples; four quizzes; a `<details>` | 5 |
| misconceptions — Misconceptions, edge cases, troubleshooting covered | 3 — the mutated-key trap absent | §4 non-example; an 8-row table | 5 |
| actionability — Actionable — the reader can DO the objectives afterwards | 4 | four objectives with a check each | 5 |

## What changed, and why

| Change | Why |
|---|---|
| Objectives line; ✅ (4 quizzes, 1 `<details>`); 📚 (7) | the /prepare contract |
| Intro: the trap as a list; "based on identity"; "the last lesson" | register; fact-check rows 1, 8 |
| §1: `Object.equals` quoted; `List.contains` quoted | gap 5; fact-check row 4 |
| §2: `instanceof` and the cast as a list; `@Override` cited; the contract rules; the compile-error and overload non-examples; the pattern-matching link | gaps 2, 3, 4; fact-check rows 3, 5, 6, 8 |
| §3: the three contract rules; the diagram made consistent | gap 4; fact-check row 2 |
| §4: `Objects.hash` quoted; the mutated-key non-example; `final` fields; the records link | gap 1; fact-check rows 7, 9 |
| Gotcha checklist → 8-row troubleshooting table; mental-model row added; TOC extended | the /prepare shape |
| Predict box as a numbered list, answered in `<details>` | the /prepare shape |
| Register: long sentences split; hedges removed ("actually", "just", "really") | lint: 19 problems → 0 |
