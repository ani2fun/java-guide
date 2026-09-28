---
title: Advanced & Idiomatic
summary: Tier 5 of the Java book — functional Java, concurrency and the memory model, I/O, modern idioms, and shipping. The Streams API, threads and the happens-before rule, high-level concurrency and virtual threads, the JIT and GC, NIO.2 files, how the modern features compose into data-oriented design, and testing/build/packaging. Every example compiled and run.
prereqs: []
---

# Advanced & Idiomatic

This is Tier 5, the summit. With the full language and the standard library behind you, these eight chapters cover what separates competent Java from idiomatic, production-grade Java: declarative data processing with streams, the hard truths of concurrency — races, coordination, and the Java Memory Model — how the JVM actually runs and reclaims your code, modern file I/O, the way the modern type-system features compose into one coherent style, and the testing, tooling, and packaging that ship it.

Eight chapters, in order:

1. [**Functional Java & the Streams API**](/synapse/programming-languages/java/advanced/functional-java-and-streams) — lazy pipelines, collectors, `Optional`, and the parallel-stream hazard.
2. [**Concurrency: the Basics**](/synapse/programming-languages/java/advanced/concurrency-the-basics) — what a thread is, race conditions, `synchronized`, and happens-before.
3. [**Concurrency: Coordination**](/synapse/programming-languages/java/advanced/concurrency-coordination) — `wait`/`notify`, a real deadlock and its escapes, `ReentrantLock`, latches, semaphores, and `BlockingQueue`.
4. [**Concurrency: High-Level & Virtual Threads**](/synapse/programming-languages/java/advanced/concurrency-high-level-and-virtual-threads) — executors, atomics, `CompletableFuture`, and virtual threads.
5. [**The Java Memory Model & Performance**](/synapse/programming-languages/java/advanced/the-java-memory-model-and-performance) — `volatile`, happens-before in depth, safe publication, the JIT, and garbage collection.
6. [**I/O, Files & NIO.2**](/synapse/programming-languages/java/advanced/io-files-and-nio2) — `Path`/`Files`, the stream name clash, and bytes vs characters.
7. [**Modern Java Idioms & the Type System**](/synapse/programming-languages/java/advanced/modern-java-idioms) — records + sealed + patterns as one data-oriented design.
8. [**Testing, Tooling & Packaging**](/synapse/programming-languages/java/advanced/testing-tooling-and-packaging) — JUnit 5, build tools, dependencies, and executable JARs.

Every code block with a ▶ Run button is live; the concurrency, performance, and tooling chapters include real captured runs (a data race, JIT and GC logs, a `mvn test` summary) where behavior is nondeterministic or project-level. The habit that matters most at this tier is **knowing the cost**: streams, parallelism, immutability, and abstractions all have trade-offs, and senior judgment is choosing them deliberately.

<div style="border-left:4px solid #15448e;background:rgba(21,68,142,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

📘 **How to read the Intuition boxes.** Each one is built in three moves:

1. **The mechanism** — what the compiler and the JVM are *actually doing*.
2. **A concrete bite** — a specific, runnable failure (often a real compiler error), shown so the trap is visible.
3. **The earned rule** — the decision heuristic, now justified rather than asserted, plus its cost.

</div>
