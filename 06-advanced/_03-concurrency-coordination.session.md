# Concurrency: Coordination — preparation record

The /prepare chain for `06-advanced/03-concurrency-coordination.md`, in order. Not rendered (the leading `_`). The lesson is edited in
place; this file is the evidence behind each change. Prepared 2026-09-29; every run on Temurin
21.0.12.1 (`/usr/libexec/java_home -v 21`), macOS/arm64. API text checked against the JDK 21
`src.zip` javadoc; JLS 21 fetched from docs.oracle.com the same day.

## Research

### Audience

- *Holds already* (earlier lessons, never re-taught): threads, `start`/`join`, the six thread
  states, `InterruptedException`, races, `synchronized` methods and blocks, monitors, which
  monitor a `static synchronized` method locks, happens-before (Concurrency: the Basics);
  `ArrayDeque` as a queue (The Collections Framework); `try`/`finally`, multi-catch
  (Exceptions); lambdas (Nested & Anonymous Classes; Lambdas).
- *Must not be assumed* (defined where it first appears): **wait set**, **guarded block**,
  `wait`/`notifyAll`, **spurious wakeup**, **deadlock** and its four conditions, `jstack`,
  **lock ordering**, `ReentrantLock`, **reentrant**, `tryLock`, `Condition`, **livelock**,
  `ReadWriteLock`, `CountDownLatch`, `Semaphore`, `CyclicBarrier`, **barrier action**,
  `BlockingQueue`, **backpressure**, **poison pill**.
- *The one thing an expert forgets a newcomer does not know:* `notifyAll()` wakes *every*
  waiter, and each one must re-check — so an `if` guard fails as soon as there are two.

### Gaps in the chapter

Four lenses, most severe first: prerequisite, step, edge, structure. Coverage map rows: 8.2
(thread-safe code with locks and the concurrent API) `covered` — re-checked by reading:
`ReadWriteLock` absent (L), filled here as a short proved part; JLS ch. 17 `covered`.

| Gap | Kind | Filled where | Source |
|---|---|---|---|
| `if` vs `while` asserted, never run; the Predict box asks for it | edge | §1 anti-pattern (`took 1` / `a consumer failed: java.util.NoSuchElementException`) and the `while` fix, same scenario; quiz 1 | `Object.wait` API [2]; run ×6 identical |
| "An exception between `lock()` and `unlock()` holds the lock forever" asserted | edge | §3 anti-pattern (`lock still held: true`) and the `finally` fix; quiz 3; gotcha row | `Lock` API [7]; JLS §14.19 [6]; runs |
| `CyclicBarrier` described in a sentence, never shown | step | §4 fence: two rounds on one barrier, with a barrier action; quiz 4 | `CyclicBarrier` API [9]; run |
| Latch reuse and the ownerless semaphore permit asserted | edge | §4 fence: `4` permits after one acquire, two releases; the latch passes round 2 at once | `CountDownLatch` [10], `Semaphore` [11] APIs; run |
| `ReadWriteLock` absent (coverage map 8.2, L) | step | §3: the reader/writer `tryLock` fence | `ReadWriteLock` API [8]; run |
| The four deadlock conditions stated without a source | step | §2 numbered list, cited | Coffman, Elphick, Shoshani 1971 [4] |
| "Remove the `pause()` and it usually completes" asserted | edge | §2: 28 of 30 runs completed without the pauses; 10 of 10 hung with them | runs 2026-09-29 |
| *Wait set* and spurious wakeups uncited | prerequisite | §1 list, JLS §17.2; the API sentence quoted | JLS §17.2 [1]; `Object.wait` [2] |
| No objectives, checks or sources; gotchas as bullets; the 🧪 box unanswered | structure | objectives; ✅ (4 quizzes, 1 `<details>`); 9-row table; 📚 (13) | `/prepare` chain |

### Plan

| Section | Carries | Why here |
|---|---|---|
| Intro + objectives | the three waiting shapes as a list; four objectives | the reader's map |
| §1 guarded blocks | wait set; the kept buffer and `IllegalMonitorStateException` fences; **non-example** `if` with two consumers, and the `while` fix | the raw form every later tool packages |
| §2 Deadlock | the kept fence, a fresh `jstack` capture, the four conditions, the timing runs | the failure mode of two locks |
| §3 `ReentrantLock` | the kept `tryLock` fence; **non-example** `unlock()` outside `finally`, and the fix; livelock; `ReadWriteLock` | the escape from §2, and its price |
| §4 Synchronizers | the kept latch and semaphore fences; `CyclicBarrier`; **non-examples** a reused latch, a minted permit | packaged §1 conditions |
| §5 `BlockingQueue` | the kept fence and D2 diagram; implementation cited to OpenJDK | §1 packaged whole |
| 6 / 7 | summary rows per rule; a 9-row symptom → cause → fix table | read by the study profile |
| ✅ / 📚 | one check per objective; the Predict box answered | after all mechanisms |

### Unverified

- _None._

### Fact-check

A separate pass over the FINISHED draft, as a checker: every number, name, version, code line and
cite. Only what changed or was flagged is listed.

| Claim | Verdict | Fix |
|---|---|---|
| "shown statically because a deadlocked program never finishes, so the sandbox would only time out" | WRONG — the fence is a plain `java` fence, so it has a Run button; it is not static | "If you press Run, it prints two lines and never finishes, so the sandbox stops it at its time limit" |
| The `jstack` block (addresses `0x000000073f048c40` …) | VERIFY — a capture not reproducible here | rerun on JDK 21: the deadlock fence hung, and `jstack <pid>` printed the pasted block (new addresses) |
| "remove the `pause()` and the program *usually* completes" | OK — 30 runs without the pauses: 28 completed, 2 hung; with them: 10 of 10 hung | the counts added |
| "the JVM optimizes it heavily" (`synchronized`) | VERIFY — no source | removed |
| "ArrayBlockingQueue is a fixed ring buffer guarded by a `ReentrantLock` with two `Condition`s" | VERIFY — an implementation detail, not in the API | "In OpenJDK 21", cited to the source [13]; confirmed in `src.zip` (`lock`, `notEmpty`, `notFull`) |
| "`LinkedBlockingQueue` … separate head/tail locks" | VERIFY — implementation | confirmed in the JDK 21 source (`takeLock`, `putLock`); "its source uses" |
| "The JVM is even allowed spurious wakeups" | VERIFY — was uncited | the `Object.wait` sentence quoted [2] |
| "the producer gets at most two items ahead" | WRONG in part — the run shows `produced 3` before `consumed 1`: two wait in the queue while the consumer holds a third | "At most two items wait in the queue" |
| "A latch is one-shot … a `Semaphore` has no notion of an owner" | OK — quoted from the `CountDownLatch` [10] and `Semaphore` [11] APIs; proved (`4`, count `0`) | cited |
| Four deadlock conditions | OK — Coffman, Elphick, Shoshani, *ACM Computing Surveys* 3(2), 1971 [4]; metadata from Crossref | cited |
| "The last chapter's earned rule warned 'deadlock risk if you hold multiple locks carelessly'" | OK — the Basics lesson's §4 rule says it | reworded as "the last lesson" |
| The four illustrative outputs (buffer, `tryLock`, latch, queue) | OK — rerun twice each: buffer, `tryLock` and queue reproduced the pasted run exactly; the latch order changed, and the block now holds one of the new runs | the latch block replaced |
| Every `Output:` block (14 fences) | OK — `prove.py`: proved 10, illustrative 4 | none |
| Quiz answers and the `<details>` | OK — quiz 1 from the §1 anti-pattern; 2 from the circular-wait condition; 3 from the §3 anti-pattern; 4 from the barrier fence; `<details>` 2 from the 30 runs, 3 from the §4 fence | none |

### Review

Scored 1–5 before the fix, the single highest-impact fix named, scored again after. Every `After`
must reach 4.

| Criterion | Before | Highest-impact fix | After |
|---|---|---|---|
| accuracy — Accuracy & currency — every claim true now, sourced or derived | 3 — "shown statically"; unsourced implementation claims; "two items ahead"; no sources | each fixed or cited; thirteen sources; every fence proved; `jstack` rerun | 5 |
| clarity — Clarity for this reader — no term used before it is defined | 3 — a 5-sentence thesis paragraph; paragraphs of 6–8 sentences; sentences to 60 words | lists; mean 12 words, longest 30 | 5 |
| sequence — Sequence — each section rests only on what came before it | 5 | none needed | 5 |
| practice — Worked example, non-example, checks with hidden solutions | 3 — three of the lesson's traps (`if`, missing `finally`, minted permit) only asserted; `CyclicBarrier` never run | five new fences, two good/bad pairs; four quizzes; a `<details>` | 5 |
| misconceptions — Misconceptions, edge cases, troubleshooting covered | 4 — seven bullets, good coverage | a 9-row table; livelock and the minted permit added | 5 |
| actionability — Actionable — the reader can DO the objectives afterwards | 4 — no objectives; the barrier was not usable from the text | four objectives with a check each; the barrier fence | 5 |

## What changed, and why

| Change | Why |
|---|---|
| Objectives line; ✅ (4 quizzes, 1 `<details>`); 📚 (13); TOC extended to 9 entries | the /prepare contract |
| Intro: the waiting shapes as a list; "chapter" → "lesson" with links | register |
| §1: wait set cited; spurious wakeups quoted; the `if` anti-pattern and the `while` fix | gaps 1, 8 |
| §2: the Run behaviour corrected; `jstack` recaptured; the four conditions numbered and cited; the timing runs | gaps 6, 7; fact-check rows 1–3 |
| §3: the API as a list; the missing-`finally` anti-pattern and fix; livelock; `ReadWriteLock` | gaps 2, 5; fact-check row 4 |
| §4: `CyclicBarrier` fence; the latch and semaphore traps quoted and proved | gaps 3, 4 |
| §5: implementation claims attributed to OpenJDK 21; "at most two wait in the queue" | fact-check rows 5, 6, 8 |
| Gotcha checklist → 9-row troubleshooting table; mental-model rows added | the /prepare shape |
| Predict box as a numbered list, answered in `<details>` | the /prepare shape |
| Register: long sentences split, walls of prose turned into lists, hedges removed ("actually", "just") | lint: 32 register problems → 0 |
