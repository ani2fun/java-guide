---
title: "Robust OOP & Error Handling: Overview"
summary: Chapter 5 of the Java book: the full object model, and the tools for robust, well-structured programs. Covers inheritance and dynamic dispatch, abstract classes and interfaces, exceptions, lambdas and functional interfaces, sealed types with pattern matching, and how real projects are packaged and built. Every example is compiled and run.
prereqs: []
---

# Robust OOP & Error Handling: Overview

Welcome to Chapter 5. This is where the object model comes together, and Java turns toward modern, functional, well-structured code. Here's what's ahead:

- You'll specialize types with [inheritance](/synapse/programming-languages/java/robust-oop/inheritance-and-polymorphism), and watch polymorphism pick the right behavior at run time.
- You'll define contracts with abstract classes and interfaces.
- You'll handle failure deliberately with exceptions.
- You'll turn behavior into values with lambdas.
- You'll model closed sets of data with sealed types, and consume them with pattern matching.
- Finally, you'll learn how packages, modules and build tools organize and ship real code.

There are six lessons, in this order:

1. [**Inheritance & Polymorphism**](/synapse/programming-languages/java/robust-oop/inheritance-and-polymorphism) — `extends`, overriding, `super`, dynamic dispatch, `final`, and the `Object` methods.
2. [**Abstract Classes & Interfaces**](/synapse/programming-languages/java/robust-oop/abstract-classes-and-interfaces) — abstract methods, interfaces, `default` methods, and one-class/many-interfaces.
3. [**Exceptions**](/synapse/programming-languages/java/robust-oop/exceptions) — checked vs unchecked, `try`/`catch`/`finally`, custom exceptions, and try-with-resources.
4. [**Nested & Anonymous Classes; Lambdas**](/synapse/programming-languages/java/robust-oop/nested-and-anonymous-classes-and-lambdas) — nested classes, anonymous classes, lambdas, functional interfaces, and method references.
5. [**Sealed Classes & Pattern Matching**](/synapse/programming-languages/java/robust-oop/sealed-classes-and-pattern-matching) — `sealed`, pattern matching for `instanceof`, switch patterns, and record patterns.
6. [**Packages, Modules & the Build**](/synapse/programming-languages/java/robust-oop/packages-modules-and-the-build) — packages and the classpath, JPMS modules, JARs, and Maven/Gradle.

Every code block with a ▶ Run button is live. The project-level examples in the final lesson are shown as real terminal sessions instead. The most valuable habit you can build in this chapter is to **ask "what's the right tool for this shape of problem"**. Inheritance, interfaces and sealed types each fit a different situation, and choosing well is most of what good design is.

<div style="border-left:4px solid #15448e;background:rgba(21,68,142,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

📘 **How to read the Intuition boxes.** Each one is built in three moves:

1. **The mechanism** — what the compiler and the JVM are *actually doing*.
2. **A concrete bite** — a specific, runnable failure (often a real compiler error), shown so the trap is visible.
3. **The earned rule** — the decision heuristic, now justified rather than asserted, plus its cost.

</div>
