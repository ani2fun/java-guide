# The Java Memory Model & Performance — preparation record

The /prepare chain for `06-advanced/05-the-java-memory-model-and-performance.md`, in order. Not rendered (the leading `_`). The lesson is edited in
place; this file is the evidence behind each change. Prepared 2026-09-29; every run on Temurin
21.0.12.1 (`/usr/libexec/java_home -v 21`), macOS/arm64, 10 cores. JLS 21 and the HotSpot GC
Tuning Guide (Release 21) fetched from docs.oracle.com; HotSpot source from openjdk/jdk21u, the
same day.

## Research

### Audience

- *Holds already* (earlier lessons, never re-taught): threads, races, `synchronized`, monitors,
  the four happens-before edges (Concurrency: the Basics); `ReentrantLock` (Coordination);
  `AtomicInteger`, executors (High-Level & Virtual Threads); records and `final` component
  fields (Enums & Records); `static` nested classes (Nested & Anonymous Classes; Lambdas);
  references and unreachable objects (References, Equality & the Object Model).
- *Must not be assumed* (defined where it first appears): **Java Memory Model**, `volatile`
  semantics, **hoisting**, **transitivity**, **safe publication**, `final`-field semantics,
  **double-checked locking**, the **holder idiom**, class initialization, **JIT**, **C1/C2**,
  **tier**, **deoptimize**, **warm-up**, JMH, **reachable**, **generational** GC, the **weak
  generational hypothesis**, **server-class** machine, G1/Serial, **memory leak** by
  reachability.
- *The one thing an expert forgets a newcomer does not know:* the JIT is *allowed* to read a
  plain field once, so "the other thread wrote it" guarantees nothing.

### Gaps in the chapter

Four lenses, most severe first: prerequisite, step, edge, structure. Coverage map rows: JLS
ch. 17 `covered`; 3.1 (object life cycle, **garbage collection**) `partial` — this lesson was
listed as GC "only as JVM tuning"; re-checked: reachability is now defined from JLS §12.6.1 and
the leak proved; the reachability section itself lives in the object-model lesson.

| Gap | Kind | Filled where | Source |
|---|---|---|---|
| The JIT log shows a `fib` program the lesson never shows, and the log was not reproducible | step | §4: the `fib` fence, then a terminal run with `-XX:+PrintCompilation` pasted | `java` man page [9]; run |
| The GC log's program ("allocates a lot of short-lived arrays") never shown | step | §5: the garbage fence (`allocated 2000 MB of garbage`), then the `-Xlog:gc` run | GC Tuning Guide [8] [12]; run |
| The memory leak asserted, never shown | edge | §5: the `static` cache fence, run with `-Xmx64m` (`OutOfMemoryError: Java heap space, after caching about 58 MB`); quiz 5 | JLS §12.6.1 [13]; run ×3 |
| Transitivity ("one `volatile` flag publishes plain fields") asserted; the Predict box asks it | step | §2: the three-link chain, and the `ready` fence; quiz 2 | JLS §17.4.5 [3]; run |
| The holder idiom recommended, never shown | step | §3: the holder fence (constructed once, lazily) | JLS §12.4.1 [6], §12.4.2 [7]; run |
| G1 "the default" with no condition; the sandbox has 512 MiB | edge | §5: the server-class rule quoted; `-XX:ActiveProcessorCount=1` gives `Using Serial`; gotcha row | GC Tuning Guide [8]; run |
| `final`-field guarantee stated without its conditions (`this` escape; objects reached through the field; later mutation) | edge | §3 item 1 and the records paragraph | JLS §17.5 [4], §8.10.3 [5] |
| Tier numbers asserted ("3 = C1, 4 = C2") without a source | prerequisite | §4 analysis list | HotSpot `CompLevel` [10]; GC Tuning Guide "Tiered compiler, using both C1 and C2" [8] |
| No objectives, checks or sources; gotchas as bullets; the 🧪 box unanswered | structure | objectives; ✅ (5 quizzes, 1 `<details>`); 8-row table; 📚 (13) | `/prepare` chain |

### Plan

| Section | Carries | Why here |
|---|---|---|
| Intro + objectives | the two realities as a list; five objectives | the reader's map |
| §1 `volatile` | JLS §8.3.1.4 quoted; the kept flag, hang and counter fences; JLS §17.3's own example of hoisting | visibility first, on the simplest shared value |
| §2 happens-before | the kept diagram; the edges quoted; transitivity chained and proved | the rule behind §1 |
| §3 Safe publication | the kept `text` illustration; the three tools with conditions; records; the kept DCL fence; the holder fence | an application of §2's transitivity |
| §4 JIT | the `fib` fence; the terminal run; tiers from source | performance: code |
| §5 GC | reachability defined; the garbage fence and `-Xlog:gc`; G1 vs Serial; the leak run | performance: memory |
| 6 / 7 | summary rows per rule; an 8-row symptom → cause → fix table | read by the study profile |
| ✅ / 📚 | one check per objective; the Predict box answered | after all mechanisms |

### Unverified

- _None._

### Fact-check

A separate pass over the FINISHED draft, as a checker: every number, name, version, code line and
cite. Only what changed or was flagged is listed.

| Claim | Verdict | Fix |
|---|---|---|
| "A `volatile` field is always read from and written to main memory, never a stale CPU cache"; "A `volatile` write flushes to main memory and a `volatile` read fetches from it" | WRONG — the JLS defines `volatile` by consistency and happens-before, not by caches [1] [3] | JLS §8.3.1.4 quoted; the write→read edge stated |
| "Shown statically, because a hung program never finishes (the sandbox would only time out)" | WRONG — a plain `java` fence has a Run button | "If you press Run, it prints nothing and never finishes, so the sandbox stops it at its time limit" |
| The hang itself | OK — three runs of the non-`volatile` fence: no output, still running at 6 s (`timeout` exit 124) | the JLS §17.3 example quoted as the mechanism [2] |
| "G1 (the default collector since JDK 9)" | WRONG in part — G1 is the default only on server-class machines (2+ processors, ≥ 1792 MB), "Serial Collector otherwise" [8]; run: `-XX:ActiveProcessorCount=1` prints `Using Serial` | the rule quoted and shown |
| The `-XX:+PrintCompilation` excerpt (`Main::fib (24 bytes)`) | VERIFY — the program was not shown, so not reproducible | the `fib` program added; rerun: `Main::fib (23 bytes)`, tiers 3 then 4, `made not entrant` |
| The `-Xlog:gc` excerpt | VERIFY — the program was not shown | the program added; rerun on JDK 21, the fresh lines pasted |
| "Sub-millisecond pauses for hundreds of MB is why automatic memory management is practical" | VERIFY — an unsourced generalization | removed; the one line is read as data |
| "(3 = the C1 compiler, quick; 4 = C2, fully optimized)" | VERIFY — undocumented in the API | cited to HotSpot's `enum CompLevel` [10]: 3 = "C1, invocation & backedge counters + mdo", 4 = "C2 or JVMCI" |
| "the object lifetime hypothesis … most objects die young" | VERIFY — was uncited | the GC Tuning Guide's "weak generational hypothesis" quoted [12] |
| "use a profiler (JFR/`jcmd`, async-profiler)" | VERIFY — async-profiler is not a JDK tool | JDK Flight Recorder and `jcmd` only |
| "if a field is `final`, its value … is visible to every thread that sees the object reference" | WRONG in part — only for a reference seen after the constructor finishes [4] | the JLS sentence quoted, with the `this`-escape condition |
| "an object whose fields are all `final` cannot be seen half-built" (records) | WRONG in part — objects reached through the fields are covered only as of construction [4] | the shallow-immutability caveat added |
| The volatile-counter runs `154723`, `166782`, `153592`; the DCL run's thread order | VERIFY — not reproducible | rerun: `157875`, `137145`, `135861`; a fresh DCL run pasted |
| Every `Output:` block (9 fences) | OK — `prove.py`: proved 6, illustrative 2, exempt 1 (the `-Xmx64m` leak, which compiles) | none |
| Quiz answers and the `<details>` | OK — quiz 1 from the hang runs and JLS §17.3; 2 from the `ready` fence; 3 from JLS §17.5; 4 from the `fib` run; 5 from the leak run; `<details>` 4 from a run where a method called 10 times never appeared and one called 10 million times reached tier 4 | none |

### Review

Scored 1–5 before the fix, the single highest-impact fix named, scored again after. Every `After`
must reach 4.

| Criterion | Before | Highest-impact fix | After |
|---|---|---|---|
| accuracy — Accuracy & currency — every claim true now, sourced or derived | 2 — `volatile` as "main memory, never a stale cache"; G1 unconditional; logs from programs not shown; no sources | each fixed; thirteen primary sources; logs rerun from shown programs | 5 |
| clarity — Clarity for this reader — no term used before it is defined | 3 — a 6-sentence intro; a 7-sentence publication paragraph; sentences to 50 words | lists; mean 14 words, longest 30 | 5 |
| sequence — Sequence — each section rests only on what came before it | 4 — §1 used the JIT (§4) to explain the hang | JLS §17.3 names the compiler's freedom where the hang is shown | 4 — the JIT is still taught after the bug it explains |
| practice — Worked example, non-example, checks with hidden solutions | 3 — transitivity, the holder idiom and the leak only asserted; no checks | five new fences; five quizzes; a `<details>` | 5 |
| misconceptions — Misconceptions, edge cases, troubleshooting covered | 4 — the main traps named | an 8-row table; `Using Serial` and the `final`-field conditions added | 5 |
| actionability — Actionable — the reader can DO the objectives afterwards | 3 — no program to reproduce either log | both programs shown, with the flags and their output | 5 |

## What changed, and why

| Change | Why |
|---|---|
| Objectives line; ✅ (5 quizzes, 1 `<details>`); 📚 (13); TOC extended to 9 entries | the /prepare contract |
| Intro as a list | register |
| §1: `volatile` defined from JLS §8.3.1.4; the hang's Run behaviour corrected; JLS §17.3 quoted; the counter rerun | fact-check rows 1–3, 13 |
| §2: the edges quoted; transitivity chained; the `ready` fence | gap 4 |
| §3: the steps as a list; `final`-field conditions; records' shallow guarantee; the holder fence | gaps 5, 7; fact-check rows 11, 12 |
| §4: the `fib` program; the terminal run; tiers cited to HotSpot | gaps 1, 8; fact-check rows 5, 8 |
| §5: reachability defined; the garbage program and its log; G1 vs Serial; the leak run | gaps 2, 3, 6; fact-check rows 4, 6, 7, 9, 10 |
| Gotcha checklist → 8-row troubleshooting table; mental-model rows added | the /prepare shape |
| Predict box as a numbered list, answered in `<details>` | the /prepare shape |
| Register: long sentences split, walls of prose turned into lists, hedges removed ("actually", "just") | lint: 31 register problems → 0 |
