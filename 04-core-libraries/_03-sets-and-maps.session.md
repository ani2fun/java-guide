# Sets & Maps — preparation record

The /prepare chain for `04-core-libraries/03-sets-and-maps.md`, in order. Not rendered (the leading `_`). The lesson is edited in
place; this file is the evidence behind each change. Prepared 2026-09-28; every run on Temurin
21 (`/usr/libexec/java_home -v 21`), JLS 21 and the Java SE 21 API fetched from docs.oracle.com
the same day.

## Research

### Audience

- *Holds already* (earlier lessons, never re-taught): `List`, interface vs implementation, the
  diamond, `List.of` unmodifiable, boxing and the `null`-unboxing NPE, the for-each over an
  `Iterator`, `Comparable` and `Comparator`, the `ClassCastException` of an unsortable class
  (The Collections Framework); `split` (Strings in Depth); `.equals` vs `==` (References,
  Equality & the Object Model).
- *Must not be assumed* (defined where it first appears): **hash code** (as "a number computed
  from its contents"), **bucket**, **iteration order**, `java.util.*` import, the two type
  arguments of `Map<K, V>`, **view** (`keySet`, `values`, `entrySet`), `Map.Entry`.
- *The one thing an expert forgets a newcomer does not know:* a `HashSet` that prints sorted
  numbers is sorted by accident.

### Gaps in the chapter

Four lenses, most severe first: prerequisite, step, edge, structure. Coverage map row 5.1
(`Set`, `Map`: add, remove, update, retrieve) `partial` H — the `Map` half of update, remove and
retrieve-all is filled here; sorting and `Deque` were filled in The Collections Framework.

| Gap | Kind | Filled where | Source |
|---|---|---|---|
| Updating, removing and iterating a map: `put` replaces and returns the old value; `remove`; `keySet`, `values`, `entrySet`, `Map.Entry` (coverage map 5.1) | structure | §3, a new fence (`4`, `7`, `fig -> 2`, `pear -> 9`, `[fig, pear]`, `[2, 9]`); quiz 3; gotcha row | `Map` API [6], `Map.put` [7], `TreeMap` [8]; run |
| `HashSet` order "breaks with strings" claimed, never shown | edge | §2 non-example (`[apple, pear, kiwi, fig]`, neither sorted nor inserted) | `HashSet` API [2]; run |
| A `TreeSet` of a class with no natural ordering throws on the first `add` | edge | §2 non-example; gotcha row | `TreeSet` API [4]; run |
| `Set.of` and `Map.of` reject duplicates (`IllegalArgumentException`) and are unmodifiable; "a duplicate is a no-op" is not universal | edge | §1 non-example; two gotcha rows | `Set` API [1], `Map` API [6]; runs (`duplicate element: a`, `duplicate key: k`, `UnsupportedOperationException` for both) |
| The counting loop without a default "throws the same NPE" — claimed, not shown | step | §4 non-example; quiz 4 | JLS §5.1.8 [10]; run |
| "Hash code" and "bucket" used undefined | prerequisite | §1 analysis (`"a"` is 97, `"b"` is 98) | run; `Integer.hashCode` [3] |
| No objectives, checks or sources; gotchas as bullets; "Tutorial 19", "Tutorial 25", "the next chapter"; the Predict box unanswered | structure | objectives; ✅ (4 quizzes, 1 `<details>`); 9-row table; 📚 (10); links to equals & hashCode, lambdas, sorting a list | `/prepare` chain |

### Plan

| Section | Carries | Why here |
|---|---|---|
| Intro + objectives | the three forms as lists; four objectives | the reader's map |
| §1 `Set` | the kept fence; hash code and bucket defined; the diagram corrected; **non-example** `Set.of` duplicates | uniqueness first |
| §2 Three flavors | the kept fence; the API guarantees quoted; **non-example** `HashSet` order with strings; **non-example** unsortable `TreeSet` | order is the only difference, shown both ways |
| §3 `Map` | the kept fences; **worked example** update, remove, iterate; the null-return rule quoted | lookup before iteration; iteration before counting |
| §4 Counting | the kept fence; **non-example** `get(k) + 1` | builds on §3's null rule |
| 5 / 6 | summary rows per rule; a 9-row symptom → cause → fix table | read by the study profile |
| ✅ / 📚 | one check per objective; the Predict box answered | after all mechanisms |

### Unverified

- _None._

### Fact-check

A separate pass over the FINISHED draft, as a checker: every number, name, version, code line and
cite. Only what changed or was flagged is listed.

| Claim | Verdict | Fix |
|---|---|---|
| The diagram: `"b"` in bucket 3 under `hashCode() % buckets`, with 4 buckets | WRONG — `"b".hashCode()` is `98` (run), and `98 % 4 = 2` | `"b"` in bucket 2; the label `hashCode() % 4`; the edge `97 % 4 = 1`; "a new `HashSet` starts with 16" cited [2] |
| "Adding a duplicate is a no-op" | WRONG in general — `Set.of("a", "a")` throws `IllegalArgumentException: duplicate element: a` (run; API [1]) | "changes nothing" for `add`; the `Set.of` non-example |
| "`contains` answers membership in (amortized) constant time" | VERIFY — the API: constant time "assuming the hash function disperses the elements properly among the buckets" [2] | quoted |
| "small `Integer`s happen to hash to themselves" | OK — `Integer.hashCode`: "equal to the primitive int value" [3] | cited |
| "`TreeSet` is backed by a balanced search tree … O(log n)" | OK — "guaranteed log(n) time cost" [4] | quoted |
| "`LinkedHashSet` is a `HashSet` plus a linked list" | OK — "a doubly-linked list running through all of its entries" [5] | quoted |
| "no way for `get` alone to tell absent from present with `null`" | OK — `Map.get` API [9] | quoted |
| "throws the same NPE as §3" (counting with `get`) | VERIFY — not shown | run; the non-example fence |
| "Tutorial 19", "Tutorial 25", "the next chapter's `hashCode` contract" | WRONG as references | links to equals & hashCode and lambdas; "the next lesson" |
| Every `Output:` block (10 fences) | OK — `prove.py`: proved 10 | none |
| Quiz answers and the `<details>` | OK — one run: size `3`; `[1, 3, 5]`, `[5, 3, 1]`, `[1, 3, 5]`; `null`; `m.put("k", 2)` returns `1`; quiz 2 from the §2 proof and API [5]; quiz 4 from the §3 proof | none |

### Review

Scored 1–5 before the fix, the single highest-impact fix named, scored again after. Every `After`
must reach 4.

| Criterion | Before | Highest-impact fix | After |
|---|---|---|---|
| accuracy — Accuracy & currency — every claim true now, sourced or derived | 3 — a wrong bucket in the diagram; "duplicate is a no-op" universal; no sources | each fixed; ten primary sources; every fence proved | 5 |
| clarity — Clarity for this reader — no term used before it is defined | 3 — hash code, bucket undefined; sentences to 70 words | defined at first use; lists; mean 12 words, longest 30 | 5 |
| sequence — Sequence — each section rests only on what came before it | 4 | iteration placed in §3, before counting | 5 |
| practice — Worked example, non-example, checks with hidden solutions | 3 — one non-example; the Predict box unanswered | four new non-examples; the map worked example; four quizzes; a `<details>` | 5 |
| misconceptions — Misconceptions, edge cases, troubleshooting covered | 3 — five bullets | `HashSet` order shown failing; unsortable `TreeSet`; `Set.of` duplicates; a 9-row table | 5 |
| actionability — Actionable — the reader can DO the objectives afterwards | 3 — no way to update, remove or iterate a map | the §3 worked example; four objectives with a check each | 5 |

## What changed, and why

| Change | Why |
|---|---|
| Objectives line; ✅ (4 quizzes, 1 `<details>`); 📚 (10) | the /prepare contract |
| Intro: the three forms as lists; "the next lesson" | register; fact-check row 9 |
| §1: hash code and bucket defined; the diagram corrected; the constant-time condition quoted; the `Set.of` non-example; the equals & hashCode link | gaps 4, 6; fact-check rows 1, 2, 3, 9 |
| §2: the three guarantees quoted; the string `HashSet` non-example; the unsortable `TreeSet` non-example | gaps 2, 3; fact-check rows 4, 5, 6 |
| §3: the map operations as a list; the update, remove and iterate worked example; the null-return rule quoted | gap 1; fact-check row 7 |
| §4: the `get(k) + 1` non-example; the lambdas link | gap 5; fact-check rows 8, 9 |
| Gotcha checklist → 9-row troubleshooting table; mental-model rows added; TOC extended | the /prepare shape |
| Predict box as a numbered list, answered in `<details>` | the /prepare shape |
| Register: long sentences split; hedges removed ("actually", "just") | lint: 20 problems → 0 |
