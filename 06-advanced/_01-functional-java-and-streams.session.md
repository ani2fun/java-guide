# Functional Java & the Streams API — preparation record

The /prepare chain for `06-advanced/01-functional-java-and-streams.md`, in order. Not rendered (the leading `_`). The lesson is edited in
place; this file is the evidence behind each change. Prepared 2026-09-29; every run on Temurin
21.0.12.1 (`/usr/libexec/java_home -v 21`). API text checked against the JDK 21 `src.zip` javadoc
and docs.oracle.com; JLS 21 fetched from docs.oracle.com the same day.

## Research

### Audience

- *Holds already* (earlier lessons, never re-taught): lambdas, effectively final, method
  references, `Predicate`/`Function`/`Supplier`/`Consumer`, `ArrayList::new` (Nested & Anonymous
  Classes; Lambdas); generics (Generics); `List.of` is unmodifiable, `UnsupportedOperationException`,
  `Comparator.reverseOrder()`, sorting (The Collections Framework); `Map`, counting and grouping
  by hand (Sets & Maps); `NullPointerException` (References, Equality & the Object Model);
  exceptions and stack traces (Exceptions); the accumulator seed (Loop Control & Patterns).
- *Must not be assumed* (defined where it first appears): **stream**, **source**,
  **intermediate** and **terminal** operation, **lazy**, **short-circuit**, **stateful** step,
  `flatMap`, `Stream.concat`, `Comparator.comparing`, **collector**, `partitioningBy`, `toMap`,
  **primitive stream**, `OptionalDouble`, `Optional`, **thread**, **parallel stream**,
  **data race**.
- *The one thing an expert forgets a newcomer does not know:* a side effect inside a pipeline
  may never run — `count()` on a list skips `peek` entirely.

### Gaps in the chapter

Four lenses, most severe first: prerequisite, step, edge, structure. Coverage map rows: 6.1
(object and primitive streams; create, filter, transform, **sort**) `covered` — re-checked by
reading: primitive streams were used (`LongStream`, `IntStream`) but never explained, and
stream sorting was absent; 6.2 (decomposition, concatenation, reduction, grouping and
**partitioning**, sequential and parallel) `partial` — `flatMap`, `Stream.concat` and
`partitioningBy` filled here; 8.3 (parallel streams) `covered`.

| Gap | Kind | Filled where | Source |
|---|---|---|---|
| `flatMap` and `Stream.concat` absent (coverage map 6.2, M) | step | §2: the `map` vs `flatMap` fence, with `concat`; quiz 1 | Stream API [2]; run |
| Sorting a stream absent (coverage 6.1); `Comparator.comparing` never taught | step | §2: `sorted()`, `sorted(Comparator.comparing(String::length))`, stability, source unchanged | Stream API [2], Comparator API [4]; run |
| Primitive streams used (`LongStream`, `IntStream.range`) but never explained (coverage 6.1) | prerequisite | §3: `mapToInt`, `sum`, `average` → `OptionalDouble`, empty case | IntStream API [5]; run |
| `partitioningBy` named, never shown; downstream `counting()` (coverage 6.2) | step | §3: the partition fence | Collectors API [3]; run |
| `toMap` on a repeated key throws — a common first-use failure | edge | §3 non-example (`Duplicate key A (attempted merging values Ada and Al)`); quiz 2; gotcha row | Collectors API [3]; run |
| `peek` as logic: no terminal means no work, and `count()` skips the pipeline | edge | §4 non-example (no `peek` lines; `count = 3`); quiz 3 | Stream.count API note [2]; run |
| A stateful step (`sorted`) pulls every element despite `findFirst` | edge | §4 non-example (five `peek` lines) | package summary [1]; run |
| Infinite sources claimed, never shown | step | §4: `Stream.iterate` with `findFirst` and `limit` | package summary [1]; run |
| `orElse` evaluates its argument even when a value is present | edge | §5: the `fallback()` fence; quiz 4; gotcha row | Optional API [6]; run |
| Stream reuse `IllegalStateException` stated, never shown; `Stream.toList()` unmodifiable vs `Collectors.toList()` | edge | §1: the `count()` twice fence; the `toCollection` fence | Stream [2], Collectors [3]; runs |
| Why the race uses `int[]` (a lambda cannot assign a local); the fix never shown; *thread* undefined | step | §6: the effectively-final compiler error; the `count()` fix on the same million elements; *thread* defined | JLS §15.27.2 [7]; runs |
| No objectives, checks or sources; gotchas as bullets; the 🧪 box unanswered | structure | objectives; ✅ (5 quizzes, 1 `<details>` with a proved fence); 11-row table; 📚 (7) | `/prepare` chain |

### Plan

| Section | Carries | Why here |
|---|---|---|
| Intro + objectives | the four ideas as a list; five objectives | the reader's map |
| §1 A stream pipeline | the kept fence and diagram; source/intermediate/terminal; `toList()` vs `Collectors.toList()`; **non-example** reuse | the vocabulary every later section uses |
| §2 Sorting, flattening, joining (new) | `sorted`, `Comparator.comparing`, `flatMap`, `concat`; **non-example** `map` that does not flatten | intermediate steps, before the terminals of §3 |
| §3 `reduce`, collectors, primitive streams | the kept fence; `reduce(1, …)` proved; `partitioningBy`; **non-example** `toMap` duplicate; `mapToInt`/`average` | terminals, after all intermediate steps |
| §4 Lazy evaluation | the kept fence; `Stream.iterate`; **non-examples** `sorted` pulls all, `peek` with no terminal and with `count()` | needs §2's `sorted` and §3's terminals |
| §5 `Optional` | the kept fences; `orElse` vs `orElseGet`; `map` on an `Optional` | needs `findFirst` from §4 and `OptionalDouble` from §3 |
| §6 Parallel streams | *thread* defined; the kept fences; the effectively-final error; the race rerun; **the fix** | last: it needs reductions (§3) |
| 7 / 8 | summary rows per rule; an 11-row symptom → cause → fix table | read by the study profile |
| ✅ / 📚 | one check per objective; the Predict box answered with a proved fence | after all mechanisms |

### Unverified

- _None._

### Fact-check

A separate pass over the FINISHED draft, as a checker: every number, name, version, code line and
cite. Only what changed or was flagged is listed.

| Claim | Verdict | Fix |
|---|---|---|
| "`reduce(identity, combiner)` repeatedly applies the combiner" | WRONG — the two-argument form is `reduce(T identity, BinaryOperator<T> accumulator)`; the API reserves *combiner* for the three-argument form [2] | "`reduce(identity, accumulator)`", with the API's identity requirement quoted |
| "short-circuiting terminal (`findFirst`, `anyMatch`, `limit`)" | WRONG — `limit` is a short-circuiting *intermediate* operation [1] | terminal (`findFirst`, `anyMatch`) and intermediate (`limit`) named apart |
| "Nothing is materialized between stages … fused into a single pass" | WRONG in part — stateful steps such as `sorted` "may need to process the entire input" [1] | run: `sorted` before `findFirst` peeks all five; stated for stateless steps only |
| "after a terminal op it's consumed, and re-using it throws" | WRONG in part — any second operation, intermediate or terminal, is ruled out [2] | the API sentence quoted; the reuse proved (`stream has already been operated upon or closed`) |
| "It's a near-free speedup for stateless operations" | WRONG — the lesson's own rule says it can be slower on small data | "It can speed up stateless operations on large data" |
| "three real runs printed `119992`, `313565`, `154427`" and "essentially never `1000000`" | VERIFY — not reproducible, and a hedge | rerun three times on JDK 21: `141528`, `169713`, `143391`; "almost never" |
| "`Optional` is for *return values*, not fields or parameters" | VERIFY — was uncited | the `Optional` API note quoted [6] |
| "`reduce(1, Integer::sum)` would give `16`" | VERIFY — asserted, not run | proved fence (`15`, `16`) |
| "`Stream.iterate(...).filter(...).findFirst()` examines just enough elements" | VERIFY — asserted, not run | proved fence (`1024`) |
| "each core sums a chunk" | WRONG in part — the work is split across threads, not pinned to cores | "each thread sums a chunk" |
| "(The fix is a proper reduction or an atomic — the subject of the concurrency chapters next)" | VERIFY — the fix was promised, not shown | the `count()` fix, same million elements (`1000000`, `500000`) |
| `Stream.toList()` since 16, unmodifiable; `Collectors.toList()` "no guarantees on the type, mutability …" | OK — `@since 16` and the quoted sentence in the JDK 21 source and API [2] [3]; run: `UnsupportedOperationException` | cited |
| "For ordered streams, the sort is stable" | OK — `Stream.sorted(Comparator)` API [2]; run: `Grace` stays before `Linus` | cited |
| JLS §15.27.2: a local used but not declared in a lambda "must either be final or effectively final" | OK — JLS 21 §15.27.2 [7], fetched 2026-09-29 | cited |
| Every `Output:` and `Compiler error:` block (22 fences) | OK — `prove.py`: proved 20, rejected 1, illustrative 1 | none |
| Quiz answers and the `<details>` | OK — quiz 1 from the §2 fence; 2 from the §3 non-example; 3 from the §4 `count()` fence; 4 from the §5 `fallback()` fence; 5 from the three race runs; the `<details>` fence proved | none |

### Review

Scored 1–5 before the fix, the single highest-impact fix named, scored again after. Every `After`
must reach 4.

| Criterion | Before | Highest-impact fix | After |
|---|---|---|---|
| accuracy — Accuracy & currency — every claim true now, sourced or derived | 3 — "combiner"; `limit` as a terminal; "nothing is materialized"; "near-free speedup"; unreproducible race numbers; no sources | each fixed; seven primary sources; every fence proved | 5 |
| clarity — Clarity for this reader — no term used before it is defined | 3 — a 6-sentence intro paragraph; *thread*, primitive stream and `Comparator.comparing` undefined; sentences to 43 words | lists; each term defined at first use; mean 12 words, longest 28 | 5 |
| sequence — Sequence — each section rests only on what came before it | 4 — `LongStream`/`IntStream` used in §5 with no introduction | primitive streams in §3, before §6 uses them; new §2 before the terminals | 5 |
| practice — Worked example, non-example, checks with hidden solutions | 3 — one non-example (`get()` on empty); the reuse and `reduce(1)` bites only asserted; no checks | six new non-examples, all proved; five quizzes; a `<details>` with a proof | 5 |
| misconceptions — Misconceptions, edge cases, troubleshooting covered | 3 — five bullets; `peek` skipped by `count()`, `toMap` duplicates, `orElse` eagerness absent | an 11-row table; three edges proved | 5 |
| actionability — Actionable — the reader can DO the objectives afterwards | 3 — sorting, flattening and partitioning (exam objectives 6.1, 6.2) not shown | §2 and the partition fence; five objectives with a check each | 4 — `mapMulti` and `Collectors.teeing` are left for the API docs |

## What changed, and why

| Change | Why |
|---|---|
| Objectives line; ✅ (5 quizzes, 1 `<details>`); 📚 (7); TOC extended to 10 entries | the /prepare contract |
| Intro as a list; summary names the new tools | register; the new sections |
| §1: source/intermediate/terminal as a list; `toList()` vs `Collectors.toList()` with the `toCollection` fence; the reuse non-example | gap 10; fact-check row 4 |
| New §2: `sorted`, `Comparator.comparing`, `flatMap`, `Stream.concat` | gaps 1, 2 (coverage map 6.1, 6.2) |
| §3: "accumulator"; `reduce(1, …)` proved; `partitioningBy`; `toMap` duplicate non-example; primitive streams | gaps 3–5; fact-check rows 1, 8 |
| §4: `limit` named as intermediate; `Stream.iterate`; the `sorted` and `peek` non-examples | gaps 6–8; fact-check rows 2, 3, 9 |
| §5: `orElse` vs `orElseGet`; `map` on an `Optional`; the API note quoted | gap 9; fact-check row 7 |
| §6: *thread* defined; the effectively-final error; race rerun; the reduction fix | gap 11; fact-check rows 5, 6, 10, 11 |
| Gotcha checklist → 11-row troubleshooting table; mental-model rows added | the /prepare shape |
| Predict box as a numbered list, answered in `<details>` with a proved fence | the /prepare shape |
| Register: long sentences split, walls of prose turned into lists, hedges removed ("actually", "essentially", "just") | lint: 13 register problems → 0 |
