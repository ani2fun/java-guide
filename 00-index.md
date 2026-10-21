---
title: Java
summary: A single, progressive Java book that takes you from absolute beginner to advanced. Thirty-seven lessons in six chapters, read in strict order. Each one derives the language's behaviour from one core idea instead of listing features. Every example is compiled and run, and a three-move "Intuition" standard turns rules into things you can re-derive. The throughline: the compiler is a proof-checker you run before your program ever touches data.
prereqs: []
---

# Java

Most Java tutorials hand you a pile of features and ask you to remember them. This one does the opposite. It finds the **one generative idea** underneath each topic, and shows every rule as a *consequence* of that idea. By the end of each lesson, you should be able to re-derive the rules, not just recite them — and to predict what a snippet prints, or *whether it even compiles*, before you run it.

The book is a single text, meant to be read from top to bottom. It starts by assuming **you've never written a line of code in any language**, and it ends on generics, concurrency, the memory model, and modern idioms. Early lessons introduce every term before using it; later lessons assume you've done the earlier ones, and move at a fluent reader's pace. What never changes is the standard of explanation: every claim is backed by code that was actually compiled and run, and every rule comes with its cost. One idea runs from the first page to the last — **Java checks your program twice, at compile time and at run time, and the two stages fail in different ways** — so learning to read both kinds of message is learning the language.

## Reading conventions

- **Every code block with a Run button is real.** Synapse compiles and runs it in a sandboxed **Java 21 (OpenJDK)** runner — the same one that produced every `Output:` block in this book. Click ▶ Run, edit the code, and run it again. The output you see is the output we verified.
- **When the lesson is a compile error, the block is labelled `Compiler error:`**, and it shows the real `javac` diagnostic — because in Java, many of the most important lessons happen *before* the program runs.
- **Blocks without a Run button are deliberate.** They're either short fragments, or programs shown precisely because they need keyboard input that the sandbox can't supply. Their output is still shown, and still real.
- **Every lesson is built on a thesis** stated in its first paragraph, and follows a fixed rhythm: concept → code → verified output → analysis ("what happened") → an **Intuition** box ("why it must be so").

<div style="border-left:4px solid #15448e;background:rgba(21,68,142,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

📘 **How to read the Intuition boxes.** Each one is built in three moves:

1. **The mechanism** — what the compiler and the JVM are *actually doing*.
2. **A concrete bite** — a specific, runnable failure (often a real compiler error), shown so the trap is visible.
3. **The earned rule** — the decision heuristic, now justified rather than asserted, plus its cost.

</div>

This note repeats, word for word, at the top of every chapter overview, so a returning reader can skip it.

---

## The six chapters

The book climbs through six chapters. Earlier chapters are prerequisites for later ones, and the topics that matter most come back later at greater depth. This is the **spiral**: for example, `==` vs `.equals` gets a gentle pass with strings in Chapter 1, a rigorous "object model" pass in Chapter 3, and a third pass with the `equals`/`hashCode` contract in Chapter 4 — each one referring back rather than re-teaching.

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
flowchart TD
  T0["Chapter 1 — First Steps<br/>values · numbers · text · input/output"]
  T1["Chapter 2 — Control Flow<br/>booleans · if · loops · arrays · methods"]
  T2["Chapter 3 — Classes &amp; Objects<br/>classes · encapsulation · the reference model"]
  T3["Chapter 4 — Core Libraries &amp; Data Structures<br/>strings · collections · generics · equals/hashCode"]
  T4["Chapter 5 — Robust OOP &amp; Error Handling<br/>inheritance · interfaces · exceptions · lambdas"]
  T5["Chapter 6 — Advanced &amp; Idiomatic<br/>streams · concurrency · the memory model"]
  T0 --> T1 --> T2 --> T3 --> T4 --> T5
  T0 -. "compile-time vs run-time" .-> T4
  T2 -. "references deepen" .-> T3
  style T0 fill:#fef9c3,stroke:#eab308
```

---

## Curriculum map

**Chapter 1 — First Steps** *(zero programming background)* — you compile and run your first program and work with values, numbers, text, and I/O.

1. [What Java Is & Running Code](/synapse/programming-languages/java/first-steps/what-java-is-and-running-code)
2. [Variables & Primitive Types](/synapse/programming-languages/java/first-steps/variables-and-primitive-types)
3. [Numbers & Arithmetic](/synapse/programming-languages/java/first-steps/numbers-and-arithmetic)
4. [Strings, the Basics](/synapse/programming-languages/java/first-steps/strings-the-basics)
5. [Input & Output](/synapse/programming-languages/java/first-steps/input-and-output)

**Chapter 2 — Control Flow** *(beginner)* — make decisions and repeat work; first real programs.

6. [Booleans & Logic](/synapse/programming-languages/java/control-flow/booleans-and-logic)
7. [Conditionals](/synapse/programming-languages/java/control-flow/conditionals)
8. [Loops](/synapse/programming-languages/java/control-flow/loops)
9. [Loop Control & Patterns](/synapse/programming-languages/java/control-flow/loop-control-and-patterns)
10. [Arrays](/synapse/programming-languages/java/control-flow/arrays)
11. [Methods](/synapse/programming-languages/java/control-flow/methods)

**Chapter 3 — Classes & Objects** *(early intermediate — the OOP leap)* — the move from procedural code to objects, and the reference model underneath.

12. [Defining Classes & Creating Objects](/synapse/programming-languages/java/classes-and-objects/classes-and-objects)
13. [Encapsulation & Access Modifiers](/synapse/programming-languages/java/classes-and-objects/encapsulation-and-access-modifiers)
14. [`static` vs Instance](/synapse/programming-languages/java/classes-and-objects/static-vs-instance)
15. [References, Equality & the Object Model](/synapse/programming-languages/java/classes-and-objects/references-equality-and-the-object-model)

**Chapter 4 — Core Libraries & Data Structures** *(intermediate)* — the standard data structures and the contracts that make objects usable in them.

16. [Strings in Depth](/synapse/programming-languages/java/core-libraries/strings-in-depth)
17. [The Collections Framework](/synapse/programming-languages/java/core-libraries/the-collections-framework)
18. [Sets & Maps](/synapse/programming-languages/java/core-libraries/sets-and-maps)
19. [`equals` & `hashCode`](/synapse/programming-languages/java/core-libraries/equals-and-hashcode)
20. [Generics](/synapse/programming-languages/java/core-libraries/generics)
21. [Enums & Records](/synapse/programming-languages/java/core-libraries/enums-and-records)
22. [Dates & Times](/synapse/programming-languages/java/core-libraries/dates-and-times)

**Chapter 5 — Robust OOP & Error Handling** *(intermediate → advanced)* — the full object model: polymorphism, abstraction, errors, and the bridge to functional Java.

23. [Inheritance & Polymorphism](/synapse/programming-languages/java/robust-oop/inheritance-and-polymorphism)
24. [Abstract Classes & Interfaces](/synapse/programming-languages/java/robust-oop/abstract-classes-and-interfaces)
25. [Exceptions](/synapse/programming-languages/java/robust-oop/exceptions)
26. [Nested & Anonymous Classes; Lambdas](/synapse/programming-languages/java/robust-oop/nested-and-anonymous-classes-and-lambdas)
27. [Sealed Classes & Pattern Matching](/synapse/programming-languages/java/robust-oop/sealed-classes-and-pattern-matching)
28. [Packages, Modules & the Build](/synapse/programming-languages/java/robust-oop/packages-modules-and-the-build)

**Chapter 6 — Advanced & Idiomatic** *(advanced)* — functional Java, concurrency and the memory model, I/O, modern idioms, shipping, and localization.

29. [Functional Java & the Streams API](/synapse/programming-languages/java/advanced/functional-java-and-streams)
30. [Concurrency: the Basics](/synapse/programming-languages/java/advanced/concurrency-the-basics)
31. [Concurrency: Coordination](/synapse/programming-languages/java/advanced/concurrency-coordination)
32. [Concurrency: High-Level & Virtual Threads](/synapse/programming-languages/java/advanced/concurrency-high-level-and-virtual-threads)
33. [The Java Memory Model & Performance](/synapse/programming-languages/java/advanced/the-java-memory-model-and-performance)
34. [I/O, Files & NIO.2](/synapse/programming-languages/java/advanced/io-files-and-nio2)
35. [Modern Java Idioms & the Type System](/synapse/programming-languages/java/advanced/modern-java-idioms)
36. [Testing, Tooling & Packaging](/synapse/programming-languages/java/advanced/testing-tooling-and-packaging)
37. [Localization](/synapse/programming-languages/java/advanced/localization)

---

## Three reading paths

**Path A — Your first programming language ever.** Start at lesson 1 and walk straight through. Don't skip ahead: each lesson assumes the one before it. Type in every example, then change it and predict the new output — or whether it still compiles — before you run it. At first, Chapters 1–2 are the whole game: values, decisions, loops, methods. Everything after that is built on them.

**Path B — You program in another language, but you're new to Java.** Skim Chapter 1 for the syntax and the surprises (integer division truncates, `int` overflow wraps silently, `==` vs `.equals`), then slow down at **Chapter 3 — Classes & Objects**. The reference model (stack vs heap, values vs references, aliasing) and the equality/`hashCode` contract are where Java differs most from scripting-language mental models — and where assumptions carried over from other languages cause the subtlest bugs.

**Path C — You know Java, and want to fill gaps.** Use the chapter map to find your boundary, and read forward from there. The highest-leverage deep passes are the object model (lesson 15), `equals`/`hashCode` (19), generics and erasure (20), the Streams API (29), and concurrency with the memory model (30–33).

---

## A note on the runner

Every runnable block compiles and runs in an isolated **Java 21 (OpenJDK)** sandbox — no setup, no install, nothing to break. The sandbox compiles your code as a class named `Main`, so the examples here use that name. Each block runs on its own (state doesn't carry over from one block to the next), so self-contained examples repeat any setup they need. Anonymous runs work; signing in lets you edit and run, and raises your hourly quota.

One limit is worth knowing early: the sandbox can't pause to read keyboard input. So the interactive `Scanner(System.in)` programs in [Input & Output](/synapse/programming-languages/java/first-steps/input-and-output) are shown statically, each paired with a runnable twin that reads from a fixed source. You do **not** need Java installed locally to read this book — though by Chapter 6 you'll want it, and [Testing, Tooling & Packaging](/synapse/programming-languages/java/advanced/testing-tooling-and-packaging), near the end of the book, shows how to set it up properly.
