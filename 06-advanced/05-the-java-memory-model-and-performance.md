---
title: The Java Memory Model & Performance
summary: volatile guarantees visibility but not atomicity; happens-before is the set of rules that decide when one thread's writes are seen by another; safe publication — final fields, volatile, or a lock — is how a constructed object crosses to another thread intact, and double-checked locking is its classic trap. On performance, the JVM interprets then JIT-compiles hot code to native, and a generational garbage collector reclaims memory in short pauses. Every behavior shown with verified output, including a real stale-read hang and real JIT and GC logs.
prereqs: []
---

# The Java Memory Model & Performance — Visibility and Speed

Two advanced realities shape correct, fast Java. First, the **Java Memory Model** (JMM): because compilers and CPUs reorder and cache memory for speed, a write by one thread is *not* automatically visible to another. **`volatile`** guarantees visibility (but, crucially, *not* atomicity), and **happens-before** is the precise set of rules that decide when writes are seen — the foundation under [`synchronized`](/synapse/programming-languages/java/advanced/concurrency-the-basics) and [atomics](/synapse/programming-languages/java/advanced/concurrency-high-level-and-virtual-threads). Second, performance: the JVM doesn't run your bytecode the same way forever — it **interprets** it at first, then **JIT-compiles** hot methods to optimized native code, and a **garbage collector** reclaims unused objects in short pauses. You can watch both happen with diagnostic flags. Understanding visibility keeps concurrent code *correct*; understanding the JIT and GC keeps it *fast*.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **The core idea.**

- **`volatile`** guarantees visibility across threads — but **not** atomicity.
- **happens-before** is the rule set that decides when one thread's writes are seen.
- For speed, the JVM **interprets then JIT-compiles** hot methods to native code.
- A **garbage collector** reclaims unused objects in short pauses.

</div>

This is the deep pass of [happens-before](/synapse/programming-languages/java/advanced/concurrency-the-basics). Every output below was produced by running the code; JIT and GC logs are real captured excerpts, **labeled illustrative** because their exact lines and timings vary per run and machine.

<div style="border-left:4px solid #15448e;background:rgba(21,68,142,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

📘 **How to read the Intuition boxes.** Each one is built in three moves:

1. **The mechanism** — what the compiler and the JVM are *actually doing*.
2. **A concrete bite** — a specific, runnable failure (often a real compiler error), shown so the trap is visible.
3. **The earned rule** — the decision heuristic, now justified rather than asserted, plus its cost.

</div>

---

## Table of contents

1. [`volatile`: visibility, not atomicity](#1-volatile-visibility-not-atomicity)
2. [happens-before, in depth](#2-happens-before-in-depth)
3. [Safe publication: reordering, `final`, and double-checked locking](#3-safe-publication-reordering-final-and-double-checked-locking)
4. [JIT compilation](#4-jit-compilation)
5. [Garbage collection and tuning](#5-garbage-collection-and-tuning)
6. [Mental-model summary](#6-mental-model-summary)
7. [Gotcha checklist](#7-gotcha-checklist)

---

## 1. `volatile`: visibility, not atomicity

A `volatile` field is always read from and written to main memory, never a stale CPU cache — so one thread's write is *visible* to others. This fixes the "a thread never sees the flag change" bug: here a worker spins until `main` flips a `volatile` flag, and it stops.

```java run
public class Main {
    static volatile boolean running = true;
    public static void main(String[] args) throws InterruptedException {
        Thread worker = new Thread(() -> {
            long count = 0;
            while (running) count++;
            System.out.println("worker saw running=false and stopped");
        });
        worker.start();
        Thread.sleep(100);
        running = false;
        worker.join();
        System.out.println("done");
    }
}
```

**Output:**
```
worker saw running=false and stopped
done
```

**Analysis.** The worker loops on `running`; after 100 ms `main` sets `running = false`, the worker *sees* it (because `volatile` forces a fresh read), exits its loop, and the program ends. Without `volatile`, the worker could keep reading a cached `true` forever — the program would hang. `volatile` established the happens-before edge that made the write visible.

That "would hang" is not hypothetical — delete the one keyword and it *does*. Shown statically, because a hung program never finishes (the sandbox would only time out):

```java
public class Main {
    static boolean running = true;   // volatile removed — nothing else changed
    public static void main(String[] args) throws InterruptedException {
        Thread worker = new Thread(() -> {
            long count = 0;
            while (running) count++;
            System.out.println("worker saw running=false and stopped");
        });
        worker.start();
        Thread.sleep(100);
        running = false;
        worker.join();
        System.out.println("done");
    }
}
```

**Output** *(real captured run on Java 21):*
```
(no output at all — the worker was still spinning 5 seconds after main set
 running = false; we killed the process. Neither println was ever reached.)
```

The mechanism is the JIT from §4: with no happens-before edge on `running`, the compiler may **hoist** the read out of the loop — the worker's loop becomes `if (running) while (true) count++;`, a perfectly legal transformation of code that promised no other thread would touch the field. The write from `main` arrives in memory; the worker just never looks again.

**Intuition.**
*Mechanism.* A `volatile` write flushes to main memory and a `volatile` read fetches from it, with a happens-before edge between them — so a reader after the write is guaranteed to see it (and everything written before it). It prevents the JVM/CPU from caching the field in a register or reordering around it.

*Concrete bite.* `volatile` gives visibility but **not** atomicity — a `volatile` counter's `++` still races:

```java run
public class Main {
    static volatile int counter = 0;
    public static void main(String[] args) throws InterruptedException {
        Thread[] threads = new Thread[4];
        for (int i = 0; i < 4; i++) {
            threads[i] = new Thread(() -> { for (int j = 0; j < 100000; j++) counter++; });
            threads[i].start();
        }
        for (Thread t : threads) t.join();
        System.out.println(counter);
    }
}
```

**Output** *(illustrative — wrong and varying; three real runs printed `154723`, `166782`, `153592`):*
```
154723
```

Even though `counter` is `volatile`, `counter++` is still read-modify-write — and `volatile` makes each *access* visible, not the *trio* atomic. So updates are still lost, just as without `volatile`. Visibility ≠ atomicity: for an atomic counter you need `AtomicInteger` or a lock.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Use `volatile` for a single flag or reference that one thread writes and others read (a stop signal, a published configuration); use atomics or locks when you need *atomic* updates. The cost of confusing the two is the bug above — a `volatile` counter that still races; the benefit, used correctly, is cheap, lock-free visibility for the common publish-a-value pattern.

</div>

---

## 2. happens-before, in depth

**Happens-before** is the JMM's guarantee: if action A happens-before action B, then A's effects (all its writes) are visible to B. Without such an edge, there's *no* guarantee — B may see stale data. A few rules establish these edges:

```mermaid
---
config:
  theme: base
  themeVariables:
    primaryColor: "#dbeafe"
    primaryBorderColor: "#3b82f6"
    primaryTextColor: "#1e3a5f"
    lineColor: "#64748b"
---
flowchart LR
  PO["program order<br/>(within one thread)"]
  ML["monitor lock<br/>(unlock → lock)"]
  V["volatile<br/>(write → read)"]
  SJ["Thread start / join"]
  HB["happens-before<br/>visibility + ordering guaranteed"]
  PO --> HB
  ML --> HB
  V --> HB
  SJ --> HB
```

**Analysis.** The four common sources of happens-before edges: **program order** (statements in one thread happen-before later ones in that thread); a **monitor unlock** happens-before a later **lock** of the same monitor (why [`synchronized`](/synapse/programming-languages/java/advanced/concurrency-the-basics) publishes writes); a **`volatile` write** happens-before a later **read** of it (§1); and **`Thread.start()`** happens-before the thread's run, while a thread's actions happen-before another's return from **`join()`**. Each is a bridge across which writes are guaranteed visible.

**Intuition.**
*Mechanism.* Happens-before is *transitive*: if A → B and B → C then A → C. So publishing one `volatile` flag after writing several plain fields makes *all* those fields visible to a reader that reads the flag — the flag's happens-before edge carries the earlier writes with it — the "safe publication" idiom that §3 develops in full.

*Concrete bite.* The relation is the *only* guarantee — two unrelated threads with no edge between them can see each other's writes in any order, or not at all. "It seemed to work" is meaningless; correctness requires an actual happens-before edge, which is why every shared-state access needs `synchronized`, `volatile`, or a `java.util.concurrent` tool.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Reason about concurrent correctness in terms of happens-before edges, not intuition about timing: for every shared read, identify the write it must see and the edge that guarantees it. The cost is a more formal mental model; the benefit is the only sound way to know concurrent code is correct — and it explains *why* the synchronization tools work, rather than treating them as magic.

</div>

---

## 3. Safe publication: reordering, `final`, and double-checked locking

§2's rules have a consequence that surprises even experienced developers: **a constructor is not a fence.** Consider one thread building an object and handing it to another through a plain field:

```java
// Thread A                          // Thread B
config = new Config("prod", 42);     if (config != null) {
                                         use(config.name);   // can see null!
                                     }
```

Inside `new Config(...)` there are several writes: the fields, then the reference `config` itself. Within Thread A, program order makes that look sequential — but program order is an edge *inside one thread only*. For Thread B, reading `config` through a plain field, there is **no happens-before edge at all** — so the JMM permits B to see the reference *before* the field writes it "should" carry. B observes a non-null `config` whose `name` is still `null`: a half-built object. (This one is told, not shown: the reorder is real but depends on the JIT and CPU catching the window, so it isn't reliably capturable in a demo — which is precisely what makes it dangerous. The *fix* below runs.) Publishing an object so that its fields travel with the reference is called **safe publication**, and there are exactly three tools:

1. **`final` fields.** The JMM gives constructors one free guarantee: if a field is `final`, its value (as of the end of the constructor) is visible to every thread that sees the object reference — no volatile, no lock. This is the deepest reason this book's [records](/synapse/programming-languages/java/core-libraries/enums-and-records) and immutable classes are concurrency gold: an object whose fields are all `final` cannot be seen half-built.
2. **A `volatile` reference.** The volatile write of the reference happens-before the volatile read, and (by §2's transitivity) carries every earlier write — the fields — with it.
3. **A lock.** Publish and consume under the same monitor; the unlock→lock edge carries the writes.

The classic place all three collide is the **lazily initialized singleton**. The infamous *double-checked locking* pattern — check, lock, check again, construct — was broken for years when written with a plain field: the unlocked first check could observe the half-built object. With `volatile`, the pattern is correct, and here it is running:

```java run
public class Main {
    static class Config {
        final String value;
        Config() {
            value = "loaded";
            System.out.println("Config constructed once, by " + Thread.currentThread().getName());
        }
    }

    private static volatile Config instance;

    static Config getInstance() {
        Config local = instance;              // one volatile read
        if (local == null) {                  // fast path: already published
            synchronized (Main.class) {
                local = instance;
                if (local == null) {          // re-check under the lock
                    local = new Config();
                    instance = local;         // volatile write publishes safely
                }
            }
        }
        return local;
    }

    public static void main(String[] args) throws InterruptedException {
        Thread[] threads = new Thread[4];
        for (int i = 0; i < 4; i++) {
            threads[i] = new Thread(() -> System.out.println(
                Thread.currentThread().getName() + " got " + getInstance().value));
            threads[i].start();
        }
        for (Thread t : threads) t.join();
    }
}
```

**Output** *(illustrative — thread order varies; the "constructed once" line appears exactly once, every run):*
```
Config constructed once, by Thread-0
Thread-0 got loaded
Thread-1 got loaded
Thread-2 got loaded
Thread-3 got loaded
```

**Analysis.** Four threads raced into `getInstance()`; exactly one constructed the `Config` (the lock plus the *second* check guarantee it), and the `volatile` write published it so the other threads' *unlocked* fast-path reads still saw a fully built object. Remove `volatile` and the fast path becomes the unsafe publication above — rare, timing-dependent, catastrophic. Worth knowing: the *initialization-on-demand holder* idiom (a private static nested class whose `static final` field holds the instance) gets the same laziness and safety from the class loader with no `volatile` and no lock — simpler, and what you should usually write.

**Intuition.**
*Mechanism.* The JIT and CPU may commit the reference-write before the field-writes unless something forbids it; `final` fields add a freeze at constructor exit, `volatile` adds a write→read edge, and a monitor adds unlock→lock. All three are §2's rules aimed at one moment: the instant an object becomes reachable by another thread.

*Concrete bite.* The bug's signature is its rarity: unsafe publication can run clean for months on one JVM/hardware combination and then produce impossible-looking `NullPointerException`s on another (different CPU memory model, different JIT decisions). It cannot be caught by testing on your machine — only by reasoning about edges.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Publish objects via `final` fields, a `volatile` reference, a lock, or a concurrent collection — never via a plain field another thread reads unlocked. Prefer immutable (`final`-field) objects, and the holder idiom over hand-rolled DCL. The cost: one more thing to check whenever a reference escapes a constructor or crosses threads; the benefit: no thread, anywhere, can ever observe your object half-built.

</div>

---

## 4. JIT compilation

The JVM runs bytecode by **interpreting** it at first, then **Just-In-Time compiling** methods that run often ("hot") into optimized native code. You can watch it with `-XX:+PrintCompilation`. Here a hot `fib` method gets compiled, then recompiled at a higher optimization tier:

```
$ java -XX:+PrintCompilation Main
...
20    6       3       Main::fib (24 bytes)
20    7       4       Main::fib (24 bytes)
21    6       3       Main::fib (24 bytes)   made not entrant
...
```

**Output** *(illustrative excerpt — exact lines and timings vary every run):*
```
20    6       3       Main::fib (24 bytes)
20    7       4       Main::fib (24 bytes)
21    6       3       Main::fib (24 bytes)   made not entrant
```

**Analysis.** Each line is a compilation event: a timestamp (ms), a compile id, a **tier** (3 = the C1 compiler, quick; 4 = C2, fully optimized), and the method. `fib` was first compiled at tier 3, then — once it proved *very* hot — recompiled at tier 4, and the tier-3 version was "made not entrant" (retired in favor of the faster one). This is why Java *warms up*: the same code runs faster after the JIT has compiled and optimized its hot paths, which is why micro-benchmarks must warm up before measuring.

**Intuition.**
*Mechanism.* The JVM profiles execution counts and branch behavior while interpreting, then compiles hot methods — applying inlining, loop optimizations, and speculative optimizations based on the observed profile. If an assumption is later violated, it *deoptimizes* back to the interpreter and recompiles ("made not entrant").

*Concrete bite.* This makes naive timing lie: the first thousand calls to a method run interpreted and slow; later calls run optimized and fast. Timing a method "once" measures interpretation, not steady-state performance — which is why you warm up (run it many times) before measuring, and why a real benchmark uses a harness like JMH.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Trust the JIT to optimize hot code, and warm up before measuring performance; don't hand-optimize cold paths the JIT will never compile, or micro-optimize based on un-warmed timings. The cost is that performance is dynamic and hard to predict from source alone; the benefit is that idiomatic, readable code usually runs fast once hot — the JIT rewards clarity over premature cleverness.

</div>

---

## 5. Garbage collection and tuning

Java manages memory automatically: a **garbage collector** reclaims objects no longer reachable, so you never `free`. Modern collectors are **generational** — most objects die young, so the GC scans a small "young" region frequently and cheaply. Watch it with `-Xlog:gc` on a program that allocates a lot of short-lived arrays:

```
$ java -Xlog:gc Main
[0.022s][info][gc] GC(0) Pause Young (Normal) (G1 Evacuation Pause) 24M->1M(516M) 0.725ms
[0.056s][info][gc] GC(1) Pause Young (Normal) (G1 Evacuation Pause) 300M->1M(516M) 0.536ms
[0.068s][info][gc] GC(2) Pause Young (Normal) (G1 Evacuation Pause) 300M->1M(516M) 0.506ms
...
allocated 2000 MB of garbage
```

**Output** *(illustrative excerpt — counts, sizes, and pause times vary per run):*
```
[0.056s][info][gc] GC(1) Pause Young (Normal) (G1 Evacuation Pause) 300M->1M(516M) 0.536ms
```

**Analysis.** The program allocated ~2 GB of 1 MB arrays, but they're immediately garbage, so the GC reclaimed them in many tiny pauses. Read one line: **G1** (the default collector since JDK 9) ran a **Young** collection, reclaiming the young generation from `300M` down to `1M` (almost all of it was garbage), out of a `516M` heap, in **0.536 ms**. The heap never grew toward 2 GB because the collector kept recycling the same space. Sub-millisecond pauses for hundreds of MB is why automatic memory management is practical.

**Intuition.**
*Mechanism.* The heap is split into generations; new objects go in the young gen, which fills and is collected quickly (survivors are promoted). Because the [object lifetime](/synapse/programming-languages/java/classes-and-objects/references-equality-and-the-object-model) hypothesis holds — most objects die young — young collections touch little live data and are fast. `-Xmx`/`-Xms` size the heap; `-XX:+UseZGC` (or others) selects a collector tuned for low pause times.

*Concrete bite.* Automatic GC doesn't mean "no memory bugs": a **memory leak** in Java is unintended *reachability* — objects you forgot to remove from a `static` collection or cache stay reachable, so the GC can't reclaim them, and the heap grows until `OutOfMemoryError`. The GC frees the *unreachable*; keeping a reference alive defeats it.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Let the GC manage memory and tune only when profiling shows a problem — size the heap (`-Xmx`), pick a collector for your latency/throughput goals, and use a profiler (JFR/`jcmd`, async-profiler) to find real allocation and pause hot spots. The cost of premature GC tuning is wasted effort on a system that's usually fine by default; the benefit of knowing the model is that when a leak or pause problem *does* appear, you can read the logs and fix the actual cause.

</div>

---

## 6. Mental-model summary

| Principle | Consequence |
|---|---|
| `volatile` guarantees visibility, not atomicity | A `volatile` flag is seen across threads; a `volatile` counter's `++` still races |
| happens-before edges (program order, lock, volatile, start/join) decide visibility | No edge → no guarantee; the relation is transitive (safe publication) |
| A constructor is not a fence — plain-field publication can expose a half-built object | Publish via `final` fields, a `volatile` reference, or a lock; prefer immutability |
| Double-checked locking is broken without `volatile` | The unlocked fast path needs the volatile edge; the holder idiom is simpler still |
| The JVM interprets, then JIT-compiles hot methods to native | Code warms up — measure steady state, not the first cold calls |
| A generational GC reclaims young garbage in short pauses | Most objects die young; sub-ms pauses make automatic memory practical |
| GC frees the unreachable; reachable objects leak | A forgotten reference in a `static` collection grows the heap to `OutOfMemoryError` |

## 7. Gotcha checklist

<div style="border-left:4px solid #da5233;background:rgba(218,82,51,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

- **A thread never sees a flag change (spins forever) →** the field isn't `volatile` (or under a lock); make it `volatile` for visibility.
- **A `volatile` counter is still wrong →** `volatile` isn't atomic; use `AtomicInteger` or `synchronized` for `++`.
- **Concurrent code "works" but you can't say why →** there's no happens-before edge; add `synchronized`/`volatile`/`j.u.c` and reason about edges.
- **Impossible-looking `NullPointerException` on a freshly constructed object →** unsafe publication through a plain field; make the fields `final`, the reference `volatile`, or publish under a lock.
- **Your hand-rolled lazy singleton misbehaves under load →** double-checked locking without `volatile`; add it, or switch to the initialization-on-demand holder idiom.
- **A micro-benchmark shows wildly different times →** un-warmed JIT; warm up (or use JMH) before measuring steady-state performance.
- **The heap grows until `OutOfMemoryError` →** a memory leak via reachability (a `static` cache/collection you never clear); drop the references or bound the cache.

</div>

---

<div style="border-left:4px solid #6d28d9;background:rgba(109,40,217,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

🧪 **Predict, then check.** Predict whether making a shared `int counter` `volatile` is enough for four threads to increment it to exactly the right total — and why. Next, explain in terms of happens-before why writing several plain fields and then setting a `volatile` `ready = true` lets a reader that sees `ready == true` also see those fields. Then predict which of §3's three publication tools a `record` uses, and why that makes records safe to hand between threads with no synchronization at all. Finally, predict what `-XX:+PrintCompilation` shows about a method called 10 times versus 10 million times, and why a benchmark must warm up.

</div>

## Your Turn

Before you move on, check your understanding with the coach — explain the idea, apply it, weigh the trade-offs, then defend your reasoning.

<div class="concept-coach"></div>
