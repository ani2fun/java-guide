---
title: "Deep Dives: Overview"
summary: "Optional, blog-style deep dives that take one surprising Java behavior and explain it from first principles, with interactive labs you can play with right in the page. They sit beside the main book: read any of them whenever its topic comes up."
essential: false
prereqs: []
---

# Deep Dives: Overview

The main chapters of this book move in a straight line: each lesson builds on the one before it. This chapter is different. Each deep dive is a **stand-alone story** about one surprising thing Java does, with **interactive labs** built into the page. You can flip switches, run experiments and break things, then read the real Java code that does the same.

Read them in any order, whenever the topic comes up. Each one says which lessons it assumes.

1. [**Why Does 0.1 + 0.2 = 0.30000000000000004 in Java?! And How Big Banks Actually Count Money**](/synapse/programming-languages/java/deep-dives/floating-point-and-money): how a `double` really stores decimals, why some of them can never be exact, and the two ways real payment systems keep every cent: `long` cents and `BigDecimal` with banker's rounding.
2. [**Why Does 120 + 10 = -126 in Java?! The Secret Life of Bits**](/synapse/programming-languages/java/deep-dives/byte-overflow-and-twos-complement): how 8 switches store negative numbers with two's complement, the hidden cast inside `big += 10` that wraps 130 to −126, and how `& 0xFF` gets the 130 back for colours, network addresses and files.

Every code block with a ▶ Run button is live, and every lab is real: the labs run the same IEEE 754 arithmetic Java does, so the numbers they show are the numbers Java prints.
