---
title: "Classes & Objects: Overview"
summary: Chapter 3 of the Java book, the leap to objects. Four lessons take you from procedural code to classes: defining them, hiding state behind a controlled interface, the class-vs-instance split, and the reference model (stack and heap, == vs .equals, null) behind every Java surprise. Every example is compiled and run.
prereqs: []
---

# Classes & Objects: Overview

Welcome to Chapter 3, where Java becomes object-oriented. [Control Flow](/synapse/programming-languages/java/control-flow/booleans-and-logic) gave you decisions, loops, arrays, and methods — the procedural building blocks. Now the unit of design changes: instead of methods acting on loose data, you bundle data and behavior together into **classes**, and build **objects** from them. The chapter ends with the lesson everything else rests on — the reference model — which turns the "surprises" of earlier chapters into predictable consequences.

There are four lessons, in this order:

1. [**Defining Classes & Creating Objects**](/synapse/programming-languages/java/classes-and-objects/classes-and-objects) — fields and methods bundled into a blueprint, `new`, constructors, `this`, and independent instances.
2. [**Encapsulation & Access Modifiers**](/synapse/programming-languages/java/classes-and-objects/encapsulation-and-access-modifiers) — `private`, getters/setters that enforce invariants, the four access levels, and immutability by design.
3. [**`static` vs Instance**](/synapse/programming-languages/java/classes-and-objects/static-vs-instance) — class-level shared state vs per-object state, why a `static` method has no `this`, `static final` constants, and `static` blocks.
4. [**References, Equality & the Object Model**](/synapse/programming-languages/java/classes-and-objects/references-equality-and-the-object-model) — the flagship: stack vs heap, values vs references, `==` vs `.equals` (with the Integer cache and String pool), and `null`.

Every code block with a ▶ Run button is live. In this chapter, the most valuable habit you can build is to **draw the references**: whenever an example aliases two variables or compares two objects, sketch which variables point at which heap objects before you predict the output. The reference-model lesson gives you that picture explicitly.

<div style="border-left:4px solid #15448e;background:rgba(21,68,142,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

📘 **How to read the Intuition boxes.** Each one is built in three moves:

1. **The mechanism** — what the compiler and the JVM are *actually doing*.
2. **A concrete bite** — a specific, runnable failure (often a real compiler error), shown so the trap is visible.
3. **The earned rule** — the decision heuristic, now justified rather than asserted, plus its cost.

</div>
