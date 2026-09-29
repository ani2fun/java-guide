# Concurrency: High-Level & Virtual Threads — preparation record

The /prepare chain for `06-advanced/04-concurrency-high-level-and-virtual-threads.md`, in order. Not rendered (the leading `_`). The lesson is edited in
place; this file is the evidence behind each change. Prepared 2026-09-29; every run on Temurin
21.0.12.1 (`/usr/libexec/java_home -v 21`), macOS/arm64, 10 cores. API text checked against the
JDK 21 `src.zip` javadoc; JEPs fetched from openjdk.org the same day.

## Research

### Audience

- *Holds already* (earlier lessons, never re-taught): threads, `start`/`join`, platform stack
  sizes, states, races, `synchronized`, happens-before, `volatile` named (Concurrency: the
  Basics); `ReentrantLock`, `BlockingQueue` (Concurrency: Coordination); checked exceptions,
  `try`-with-resources, `AutoCloseable` (Exceptions); lambdas, `Supplier`, method references
  (Nested & Anonymous Classes; Lambdas); `map`/`flatMap`, `Optional` (Functional Java & the
  Streams API); `HashMap`, `merge` (Sets & Maps).
- *Must not be assumed* (defined where it first appears): `ExecutorService`, **submit**,
  `Future`, `ExecutionException`, `Callable`, the three shutdown methods, `AtomicInteger`,
  **lock-free**, `compareAndSet`, `updateAndGet`, `ConcurrentHashMap`, `CompletableFuture`,
  `supplyAsync`, `thenApply`/`thenCompose`/`thenCombine`/`exceptionally`,
  `CompletionException`, **virtual thread**, **carrier**, **mount/unmount**, **pinning**,
  **daemon** thread, `StructuredTaskScope`.
- *The one thing an expert forgets a newcomer does not know:* two atomic calls in a row are
  not atomic together.

### Gaps in the chapter

Four lenses, most severe first: prerequisite, step, edge, structure. Coverage map rows: 8.1
(platform and virtual threads; `Runnable` and **`Callable`**; executors) `partial` —
`Callable` named explicitly and contrasted with `Runnable` here; virtual threads re-checked;
8.2 `covered`; 8.3 (concurrent collections) `covered` — re-checked by reading:
`ConcurrentHashMap` was named, never run; filled here.

| Gap | Kind | Filled where | Source |
|---|---|---|---|
| `Callable` never named (coverage map 8.1, M); `submit(Runnable)` vs `submit(Callable)` | prerequisite | §1: the `Callable`/`Runnable` fence (`null`, `42`); the `Runnable` compiler error; quiz 1 | `Callable` API [2]; runs |
| "`counter.set(counter.get() + 1)` is not atomic" asserted | edge | §2 anti-pattern (`175034`, …); quiz 3; gotcha row | run ×3 |
| `compareAndSet` recommended, never shown | step | §2 fence: `true -> 4`, `false -> 4`, `40` | `AtomicInteger` API [4]; run |
| `ConcurrentHashMap` named, never run (coverage 8.3) | step | §2: four threads `merge` word counts, exact totals | `HashMap` [5], `ConcurrentHashMap` [6] APIs; run |
| `thenApply` vs `thenCompose` asserted ("the compiler will let you") | edge | §3: the nested-future fence, and javac's `inference variable U has incompatible bounds`; quiz 4 | runs |
| Virtual threads are daemons; `Thread.ofVirtual`, `isVirtual` never shown | edge | §4 fence (`isDaemon=true`); gotcha row | `Thread` API [9]; run |
| "With platform threads this would … serialize into many seconds" asserted | step | §4 timing fence: virtual 61–64 ms, 100 platform threads 1369–1390 ms; quiz 5 | runs ×3 |
| `try`-with-resources on an executor mentioned without the API's contract | step | §1 paragraph quoting `close()` | `ExecutorService.close()` [1] |
| No objectives, checks or sources; gotchas as bullets; the 🧪 box unanswered | structure | objectives; ✅ (5 quizzes, 1 `<details>` with a proved fence); 9-row table; 📚 (11) | `/prepare` chain |

### Plan

| Section | Carries | Why here |
|---|---|---|
| Intro + objectives | the four tools as a list; five objectives | the reader's map |
| §1 `ExecutorService` | the kept fences and diagram; `Callable` vs `Runnable`; the compiler error; shutdown methods as a list; `close()` | the tool every later section runs on |
| §2 Atomics and collections | the kept fence; **non-example** `set(get() + 1)`; `compareAndSet`/`updateAndGet`; `ConcurrentHashMap.merge` | the race fixed without locks |
| §3 `CompletableFuture` | the kept fences and diagram; `commonPool`; `CompletionException`; **non-example** `thenApply` nesting, and javac's rejection | composing tasks from §1 |
| §4 Virtual threads | JEP 444; the kept fence; the timing comparison; daemon status; pinning with a fresh trace; JEP 491; structured concurrency (JEP 453) | last: it builds on executors and on §2 of Coordination |
| 5 / 6 | summary rows per rule; a 9-row symptom → cause → fix table | read by the study profile |
| ✅ / 📚 | one check per objective; the Predict box answered with a proved fence | after all mechanisms |

### Unverified

- _None._

### Fact-check

A separate pass over the FINISHED draft, as a checker: every number, name, version, code line and
cite. Only what changed or was flagged is listed.

| Claim | Verdict | Fix |
|---|---|---|
| The pinning trace: `Main.lambda$main$0(Main.java:7)` | WRONG — the fence's first line is the `// requires:` sentinel, so the `sleep` is on line 8; rerun with `-Djdk.tracePinnedThreads=full` printed `Main.java:8` | the full trace from the rerun pasted, untrimmed |
| "A platform thread maps to an OS thread — heavyweight (~1 MB stack)" | WRONG in part — 1024 KB or 2048 KB by platform (the `java` docs; this JDK reports 2048) | "1024 KB or 2048 KB by default, depending on the platform", linked to the Basics lesson |
| 🧪 "100,000 virtual threads each doing `Thread.sleep(100)` finish in roughly 100 ms" | WRONG — three runs took 728–735 ms: the sleeps overlap, but creating 100,000 threads costs the rest | "under a second, not 100,000 × 100 ms"; the runs quoted in `<details>` |
| "the compiler will let you, leaving you to unwrap the nesting at `get()`" (`thenApply`) | WRONG in part — it compiles only if the target type is the nested future; declared `CompletableFuture<Integer>`, javac rejects it | both shown: the nested fence and the compiler error |
| "Unlike a raw `Thread`, where an uncaught exception just vanishes onto the console" | WRONG in part — the default handler prints it; what a raw thread lacks is a caller to receive it | "its uncaught exception is printed, and the thread ends" |
| "it's faster than a lock … the CPU does it with a single compare-and-swap instruction" | VERIFY — processor-specific and unsourced | "no thread blocks", with the atomic package summary quoted [3] |
| "It's the same idea Python ships as `asyncio.TaskGroup`" | VERIFY — a claim about another language, unsourced | removed |
| "one real run finished in ~0.12 s total" | VERIFY — not reproducible | rerun: 0.48–0.50 s for the whole process, JVM start-up included |
| "JDK 24 — JEP 491 — reimplements monitors so `synchronized` no longer pins in most cases" | OK — JEP 491 "Closed / Delivered", release 24 [10] | cited |
| Virtual threads final in JDK 21; structured concurrency a preview in 21 | OK — JEP 444 and JEP 453, both release 21 [8] [11] | cited |
| "pinned … inside a `synchronized` block or method" | OK — JEP 444 "Pinning" [8] | quoted |
| "`supplyAsync` ran a task on a pool" | OK — `ForkJoinPool.commonPool()` per the API [7] | named |
| Every `Output:` and `Compiler error:` block (20 fences) | OK — `prove.py`: proved 13, illustrative 3, rejected 2, exempt 2 | none |
| Quiz answers and the `<details>` | OK — quiz 1 from the `Callable` fence; 2 from the shutdown run; 3 from the anti-pattern's runs; 4 from the `thenCompose` fence and compiler error; 5 from the §4 CPU-bound rule; the `<details>` fence proved | none |

### Review

Scored 1–5 before the fix, the single highest-impact fix named, scored again after. Every `After`
must reach 4.

| Criterion | Before | Highest-impact fix | After |
|---|---|---|---|
| accuracy — Accuracy & currency — every claim true now, sourced or derived | 3 — a pasted trace that did not match the fence; "~1 MB"; "roughly 100 ms"; unsourced CAS and Python claims; no sources | each fixed; eleven primary sources; the trace rerun; every fence proved | 5 |
| clarity — Clarity for this reader — no term used before it is defined | 3 — a 5-sentence intro paragraph; *carrier* and *daemon* undefined; sentences to 45 words | lists; terms defined at first use; mean 13 words, longest 30 | 5 |
| sequence — Sequence — each section rests only on what came before it | 4 — "the last chapter" references by position | links to the named lessons | 5 |
| practice — Worked example, non-example, checks with hidden solutions | 3 — two traps (`set(get() + 1)`, `thenApply` nesting) only asserted; no checks | eight new fences, three non-examples; five quizzes and a `<details>` with a proof | 5 |
| misconceptions — Misconceptions, edge cases, troubleshooting covered | 4 — seven bullets | a 9-row table; the daemon and `Runnable` rows added | 5 |
| actionability — Actionable — the reader can DO the objectives afterwards | 3 — `Callable` (exam 8.1) never named; `ConcurrentHashMap` never run | both shown; five objectives with a check each | 5 |

## What changed, and why

| Change | Why |
|---|---|
| Objectives line; ✅ (5 quizzes, 1 `<details>`); 📚 (11); TOC extended to 8 entries | the /prepare contract |
| Intro as a list; lesson links instead of "the last two chapters" | register; sequence |
| §1: `Callable` vs `Runnable` fence and the `Runnable` compiler error; the raw-thread sentence corrected; shutdown methods as a list; `close()` quoted | gaps 1, 8; fact-check row 5 |
| §2: lock-free quoted; `volatile` memory effects cited; the `set(get() + 1)` anti-pattern; `compareAndSet`/`updateAndGet`; `ConcurrentHashMap.merge` | gaps 2–4; fact-check row 6 |
| §3: `commonPool` named; `CompletionException` explained; the nested-future fence and the compiler error | gap 5; fact-check row 4 |
| §4: stack size corrected; JEP 444 cited; the timing comparison; daemon status; the pinning trace rerun; JEP 491 and 453 cited; the Python claim removed | gaps 6, 7; fact-check rows 1, 2, 7, 8 |
| Gotcha checklist → 9-row troubleshooting table; mental-model rows added | the /prepare shape |
| Predict box as a numbered list, its timing claim corrected, answered in `<details>` with a proved fence | fact-check row 3 |
| Register: long sentences split, walls of prose turned into lists, hedges removed ("actually", "just") | lint: 20 register problems → 0 |
