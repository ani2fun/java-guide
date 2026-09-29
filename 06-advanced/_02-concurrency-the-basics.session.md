# Concurrency: the Basics — preparation record

The /prepare chain for `06-advanced/02-concurrency-the-basics.md`, in order. Not rendered (the leading `_`). The lesson is edited in
place; this file is the evidence behind each change. Prepared 2026-09-29; every run on Temurin
21.0.12.1 (`/usr/libexec/java_home -v 21`), macOS/arm64. API text checked against the JDK 21
`src.zip` javadoc; JLS 21 and JVMS 21 fetched from docs.oracle.com the same day.

## Research

### Audience

- *Holds already* (earlier lessons, never re-taught): lambdas and `Runnable`-shaped functional
  interfaces (Nested & Anonymous Classes; Lambdas); `static` fields (static vs Instance); shared
  references (References, Equality & the Object Model); checked exceptions and `throws`
  (Exceptions); enums (Enums & Records); *thread*, *data race* and the parallel-stream race
  (Functional Java & the Streams API).
- *Must not be assumed* (defined where it first appears): **process**, **preemptive**
  scheduling, **platform thread**, `start`/`join`, **interrupt**, `InterruptedException`,
  `Thread.sleep`, the six **thread states**, **race condition**, **lost update**, **stale read**,
  **critical section**, **mutual exclusion**, **monitor** (intrinsic lock), `synchronized` method
  and block, **Java Memory Model**, **happens-before**, **visibility**.
- *The one thing an expert forgets a newcomer does not know:* `synchronized` only excludes
  threads that lock the *same* object.

### Gaps in the chapter

Four lenses, most severe first: prerequisite, step, edge, structure. Coverage map rows: 8.1
(platform and virtual threads; `Runnable` and `Callable`; **thread life cycle**; executors)
`partial` — thread states filled here; `Callable`, executors and virtual threads belong to
Concurrency: High-Level & Virtual Threads; 8.2 (thread-safe code with locks) `covered`; JLS
ch. 17 `covered`.

| Gap | Kind | Filled where | Source |
|---|---|---|---|
| Thread states (coverage map 8.1): the diagram left out `TIMED_WAITING`, sent a notified `wait()` straight to `RUNNABLE`, and no state was ever observed | edge | new §2: a 6-row table, the corrected diagram, and a proved fence printing all six states; quiz 2 | `Thread.State` API [4]; run ×5 identical |
| `start()` vs `run()` claimed, never shown | step | §1 fence: `running on: main`, state `NEW`; quiz 1 | run |
| Starting a thread twice | edge | §1 non-example: `IllegalThreadStateException`; gotcha row | `Thread.start()` API [2]; run |
| `throws InterruptedException` on every `main`, never explained; *interrupt* undefined | prerequisite | §1 paragraph; the §2 fence interrupts a sleeper; gotcha row with javac's message | `Thread` API [2]; run: `unreported exception InterruptedException; must be caught or declared to be thrown` |
| The `synchronized` block form named, never shown; which monitor a `static` method locks | step | §4: the `synchronized (lock)` fence (`400000`); the §17.1 and §8.4.3.6 rules | JLS §17.1 [5], §8.4.3.6 [6], §14.19 [7]; run |
| "Locking on different monitors doesn't help" asserted | edge | §4 anti-pattern: a lock per thread (`192345`, …); quiz 4 | run ×3 |
| The happens-before edges listed in passing; why reading after `join()` is safe | step | §5: the four edges numbered, quoted from JLS; the `join` edge tied to every program here | JLS §17.4.5 [8] |
| No objectives, checks or sources; gotchas as bullets; the 🧪 box unanswered | structure | objectives; ✅ (4 quizzes, 1 `<details>`); 9-row table; 📚 (8) | `/prepare` chain |

### Plan

| Section | Carries | Why here |
|---|---|---|
| Intro + objectives | race and `synchronized` as a list; links to the next three lessons; five objectives | the reader's map |
| §1 Threads and `Runnable` | process, preemption, platform thread, stack size, shared heap; the kept fences; `InterruptedException`; `run()` shown; **non-example** starting twice | the thing itself before any hazard |
| §2 The six thread states (new) | table, corrected diagram, the all-states fence | needs `start`/`join` from §1; `BLOCKED` prepares §4 |
| §3 Race conditions | the kept fence and diagram, rerun | needs threads; the problem before the fix |
| §4 `synchronized` | the kept fence; monitors; the block form; **non-example** a lock per thread | the fix for §3 |
| §5 JMM and happens-before | the kept diagram; the four edges; the flag bug forward-linked | the second job of §4's lock |
| 6 / 7 | summary rows per rule; a 9-row symptom → cause → fix table | read by the study profile |
| ✅ / 📚 | one check per objective; the Predict box answered | after all mechanisms |

### Unverified

- _None._

### Fact-check

A separate pass over the FINISHED draft, as a checker: every number, name, version, code line and
cite. Only what changed or was flagged is listed.

| Claim | Verdict | Fix |
|---|---|---|
| "a call stack (about 1 MB by default in the JVM)" | WRONG — platform-dependent: the `java` docs list 1024 KB for Linux/x64, 2048 KB for macOS/Aarch64 [1]; `java -XX:+PrintFlagsFinal` on this JDK 21 reports `ThreadStackSize = 2048` | the two documented values, cited |
| "A Java `Thread` object is a thin handle on one of these real OS threads" | WRONG in part — true of *platform* threads, "typically mapped 1:1 to kernel threads" [2]; JDK 21's virtual threads are not | "a **platform thread**", quoted |
| The lifecycle diagram: `WAITING --> RUNNABLE: notified`; no `TIMED_WAITING` | WRONG — a notified `wait()` must re-acquire the monitor, so it is `BLOCKED` [4]; `sleep(ms)` is `TIMED_WAITING` | the corrected diagram; all six states proved in one run |
| "the next chapter's executors do it better" | WRONG — executors are two lessons on, in High-Level & Virtual Threads; the next lesson is Coordination | a link to the executors' lesson |
| "the `volatile` and atomics of the next-but-one chapter" | WRONG — `volatile` is three lessons on (Memory Model), atomics two | a link to the memory-model lesson, which runs the flag bug |
| "B could read a value still sitting in A's CPU cache, never flushed to main memory" | WRONG in part — the JMM speaks of allowed reads, not caches; the cause may be the compiler as well as the hardware [8] | "the JMM allows B to read an older value of `counter`" |
| "hundreds of thousands of updates are lost" | OK — reruns kept 109,262–121,926 of 400,000 | "most were lost" |
| "four real runs printed `117273`, `112409`, `109596`, `120745`" | VERIFY — not reproducible | rerun four times: `121926`, `117413`, `109262`, `111800` |
| "Every object has an intrinsic lock (monitor)" | VERIFY — was uncited | JLS §17.1 quoted [5] |
| Happens-before edges: unlock→lock, `volatile` write→read, `start`, `join` | OK — each sentence in JLS 21 §17.4.5 [8], fetched 2026-09-29 | numbered and cited |
| "The heap is shared; each thread has its own stack" | OK — JVMS §2.5.2, §2.5.3 [3] | cited |
| Every `Output:` block (9 fences) | OK — `prove.py`: proved 6, illustrative 3; the states fence gave identical output in 5 runs | none |
| Quiz answers and the `<details>` | OK — quiz 1 from the `run()` fence; 2 from the states fence; 3 from the §3 reruns; 4 from the anti-pattern's runs; `<details>` 3 from JLS §17.4.5 | none |

### Review

Scored 1–5 before the fix, the single highest-impact fix named, scored again after. Every `After`
must reach 4.

| Criterion | Before | Highest-impact fix | After |
|---|---|---|---|
| accuracy — Accuracy & currency — every claim true now, sourced or derived | 3 — a wrong lifecycle diagram; "1 MB" stacks; "thin handle" for every thread; wrong chapter pointers; cache folklore; no sources | each fixed; eight primary sources; every fence proved | 5 |
| clarity — Clarity for this reader — no term used before it is defined | 3 — a 6-sentence intro and 7-sentence walls; `InterruptedException` unexplained; sentences to 48 words | lists; *interrupt*, *platform thread* and *monitor* defined; mean 13 words, longest 28 | 5 |
| sequence — Sequence — each section rests only on what came before it | 4 — `BLOCKED` in the diagram before locks were taught | states in §2 with a forward pointer; `BLOCKED` observed on a lock `main` holds | 4 — `WAITING` via `wait()` is named before the next lesson teaches it |
| practice — Worked example, non-example, checks with hidden solutions | 3 — `run()` vs `start()` only asserted; no checks | three new non-examples (`run()`, start twice, a lock per thread); four quizzes and a `<details>` | 5 |
| misconceptions — Misconceptions, edge cases, troubleshooting covered | 4 — the main traps named as bullets | a 9-row table with javac's and the JVM's messages | 5 |
| actionability — Actionable — the reader can DO the objectives afterwards | 3 — thread states (exam 8.1) not observable | the all-states fence; five objectives with a check each | 5 |

## What changed, and why

| Change | Why |
|---|---|
| Objectives line; ✅ (4 quizzes, 1 `<details>`); 📚 (8); TOC extended to 9 entries | the /prepare contract |
| Intro as a list, with links to the next three lessons | register; fact-check rows 4, 5 |
| §1: process and platform thread defined, stack size corrected, JVMS cited; `InterruptedException`; the `run()` fence; start twice | gaps 2–4; fact-check rows 1, 2 |
| New §2: six states, corrected diagram, a proved fence for all six | gap 1 (coverage map 8.1); fact-check row 3 |
| §3: the race rerun; the analysis as a list | fact-check rows 7, 8 |
| §4: monitors quoted; `static` vs instance monitor; the block form; the lock-per-thread anti-pattern | gaps 5, 6; fact-check row 9 |
| §5: the four happens-before edges from JLS §17.4.5; the `join` edge tied to the lesson's programs; cache folklore removed | gap 7; fact-check rows 6, 10 |
| Gotcha checklist → 9-row troubleshooting table; mental-model rows added | the /prepare shape |
| Predict box as a numbered list, answered in `<details>` | the /prepare shape |
| Register: long sentences split, walls of prose turned into lists, hedges removed ("actually", "just") | lint: 18 register problems → 0 |
