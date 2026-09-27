# Coverage map — what a Java 21 guide must teach, and where this book teaches it

The completeness half of the /prepare pass. Each row is one objective from Oracle's Java SE 21
Developer exam (1Z0-830) or one chapter of the Java Language Specification, SE 21. A row is
**covered** (a lesson section teaches it), **partial** (named or used, never taught), or **GAP**.
Each lesson's pass reads its rows here into its own gaps table; a GAP too big for a section
becomes a new lesson in Part 3 of the plan.

Built 2026-09-27 by grepping every lesson for each objective's terms and reading its headings.
A grep finds mentions, not teaching; each lesson's own gaps pass re-checks its rows by reading.

**Sources**

1. JLS SE 21, table of contents — <https://docs.oracle.com/javase/specs/jls/se21/html/index.html> (fetched 2026-09-27).
2. 1Z0-830 objectives. Oracle's page (<https://education.oracle.com/java-se-21-developer-professional/pexam_1Z0-830>)
   was down for maintenance on 2026-09-27, and its Wayback copy renders empty. The wording below
   is from dbexam's syllabus page (<https://www.dbexam.com/oracle/oracle-1z0-830-certification-exam-syllabus>),
   and matches the objective text in O'Reilly/Pearson's course listing. **[?] Re-check it against
   Oracle's page when that page is back.**

Severity: **H** = an exam objective with no teaching, or a JLS rule a beginner hits in week one;
**M** = partial, or taught only in passing; **L** = rare in practice, or advanced.

## 1Z0-830 objectives

| # | Objective | Where taught | Status | Sev | Proposed fill |
|---|---|---|---|---|---|
| 1.1 | Primitives and wrapper classes | 01-first-steps/02 §3 primitives; wrappers only as the `Integer` cache trap (03-classes-and-objects/04 §3) | partial | H | A wrapper and autoboxing section in 04-core-libraries/02 (collections need `Integer`, not `int`), with the `null`-unboxing NPE |
| 1.2 | Arithmetic and boolean expressions, `Math`, precedence, conversions, casting | 01-first-steps/03, 02-control-flow/01 | covered | — | Check `char` arithmetic and the implicit cast in `+=` (01-first-steps/03) |
| 1.3 | Text with `String`, `StringBuilder`, text blocks | 01-first-steps/04, 04-core-libraries/01 | covered | — | — |
| 1.4 | Date-Time API: date, time, duration, period, instant, time zones, daylight saving time | nowhere | **GAP** | H | New lesson in 04-core-libraries: *Dates and times* |
| 2.1 | `if`/`else`, `switch` statements and expressions, loops, `break`, `continue` | 02-control-flow/02–04 | covered | — | Labelled `continue` is missing beside labelled `break` (02-control-flow/04 §3) |
| 3.1 | Objects, nested-class objects, object life cycle: creation, reassigning references, garbage collection | 03-classes-and-objects/01, 05-robust-oop/04; GC only as JVM tuning (06-advanced/05 §5) | partial | M | "When does an object become unreachable?" in 03-classes-and-objects/04 |
| 3.2 | Classes and records; instance and static fields, methods, constructors; instance and static initializers | 03-classes-and-objects/01–03, 04-core-libraries/06 | partial | M | Instance initializer blocks and initialization order in 03-classes-and-objects/03 |
| 3.3 | Overloading, including varargs | 02-control-flow/06 §3 overloading | partial | H | Varargs in 02-control-flow/06 |
| 3.4 | Variable scope, encapsulation, immutable objects, `var` | 03-classes-and-objects/02, 01-first-steps/02 §5, 06-advanced/07 | partial | M | Scope and shadowing taught once, in 02-control-flow/06 (block scope) |
| 3.5 | Inheritance, abstract and sealed types, records; overriding incl. `Object`; polymorphism; reference casting; `instanceof` and `switch` patterns | 05-robust-oop/01, 02, 05; 04-core-libraries/06 | covered | — | Reference casting and `ClassCastException` get a proof in 05-robust-oop/01 |
| 3.6 | Interfaces, functional interfaces, `private`, `static` and `default` interface methods | 05-robust-oop/02 (`default` only), 05-robust-oop/04 (functional) | partial | H | `static` and `private` interface methods in 05-robust-oop/02 |
| 3.7 | Enums with fields, methods and constructors | 04-core-libraries/06 §1–2 | covered | — | — |
| 4.1 | `try`/`catch`/`finally`, try-with-resources, multi-catch, custom exceptions | 05-robust-oop/03 | covered | — | Check multi-catch is taught, not only named |
| 5.1 | Arrays, `List`, `Set`, `Map`, `Deque`: add, remove, update, retrieve, **sort** | 02-control-flow/05, 04-core-libraries/02–03; `Deque` only inside a concurrency example | partial | H | `Deque` (stack and queue) and sorting (`Comparable`, `Comparator`, `List.sort`, `Arrays.sort`) in 04-core-libraries |
| 6.1 | Object and primitive streams, lambdas, functional interfaces: create, filter, transform, sort | 06-advanced/01, 05-robust-oop/04 | covered | — | — |
| 6.2 | Decomposition, concatenation, reduction, grouping and partitioning, sequential and parallel | 06-advanced/01 §2, §5 | partial | M | `Stream.concat` and `flatMap` shown with proofs |
| 7.1 | Modules: exports, reflection (`opens`), `requires`, services, providers, consumers | 05-robust-oop/06 §3 (`exports`, `requires`) | partial | M | `opens`, and a service with `provides … with` / `uses` / `ServiceLoader` |
| 7.2 | Compile; modular and non-modular JARs; runtime images; unnamed and automatic modules | 05-robust-oop/06 §4, 06-advanced/08 §4 | partial | M | `jlink`, and the unnamed and automatic modules |
| 8.1 | Platform and virtual threads; `Runnable` and `Callable`; thread life cycle; executors | 06-advanced/02, 04 | partial | M | `Callable` named explicitly; thread states |
| 8.2 | Thread-safe code with locks and the concurrent API | 06-advanced/02–04 | covered | — | `ReadWriteLock` is absent; L |
| 8.3 | Concurrent collections and parallel streams | 06-advanced/04 §2, 06-advanced/01 §5 | covered | — | — |
| 9.1 | Console and file I/O with I/O streams | 06-advanced/06 | partial | M | Console input beyond `Scanner` (`BufferedReader`) and output streams |
| 9.2 | Serialize and deserialize objects | nowhere taught (one mention) | **GAP** | M | A serialization section in 06-advanced/06, with its security warning |
| 9.3 | `Path` objects and `java.nio.file` | 06-advanced/06 §1–2 | covered | — | Directory traversal (`Files.walk`/`list`) missing; L |
| 10.1 | Localization: locales, resource bundles, formatting messages, dates, times, numbers, currency, percentages | nowhere | **GAP** | M | New lesson in 06-advanced: *Localization* (after dates and times exist) |
| — | Annotations, generics, logging (named as expected knowledge by a secondary source only) | generics 04-core-libraries/05; `@Override` used; logging nowhere | partial | L | [?] Confirm on Oracle's page before acting |

## JLS SE 21 chapters

| Ch. | Title | Where taught | Status | Sev | Note |
|---|---|---|---|---|---|
| 1–2 | Introduction; Grammars | — | n/a | — | Not reader material |
| 3 | Lexical Structure | 01-first-steps/01 §5 comments, 01-first-steps/02 §4 literals | covered | — | Unicode escapes and identifiers: L |
| 4 | Types, Values, and Variables | 01-first-steps/02, 03-classes-and-objects/04, 04-core-libraries/05 | covered | — | — |
| 5 | Conversions and Contexts | 01-first-steps/03 §3 | partial | M | Boxing conversion (see 1.1) and reference casting (3.5) |
| 6 | Names | scope in passing | partial | M | Scope and shadowing (see 3.4) |
| 7 | Packages and Modules | 05-robust-oop/06 | partial | M | See 7.1 |
| 8 | Classes | 03, 05-robust-oop/01 | partial | M | Initialization order (see 3.2) |
| 9 | Interfaces | 05-robust-oop/02 | partial | H | See 3.6 |
| 10 | Arrays | 02-control-flow/05 | covered | — | — |
| 11 | Exceptions | 05-robust-oop/03 | covered | — | — |
| 12 | Execution | 01-first-steps/01 §2, 03-classes-and-objects/03 §4 | partial | M | Class and object initialization order; unreachable objects (see 3.1) |
| 13 | Binary Compatibility | — | out of scope | — | A library author's concern, not a learner's |
| 14 | Blocks, Statements, and Patterns | 02-control-flow, 05-robust-oop/05 | covered | — | — |
| 15 | Expressions | 01-first-steps/03, 02-control-flow/01 | covered | — | — |
| 16 | Definite Assignment | nowhere | **GAP** | H | "variable might not have been initialized" — every beginner meets it. A section with its compiler-error proof in 01-first-steps/02 |
| 17 | Threads and Locks | 06-advanced/02–05 | covered | — | — |
| 18 | Type Inference | `var` (01-first-steps/02 §5), diamond (in passing) | partial | L | Diamond and generic-method inference in 04-core-libraries/05 |
| 19 | Syntax | — | n/a | — | Not reader material |

## Summary

- **New lessons (Part 3):** *Dates and times* (1.4), then *Localization* (10.1), which rests on it.
- **High-severity sections** inside existing lessons: wrappers and autoboxing (1.1), varargs (3.3),
  interface `static`/`private` methods (3.6), `Deque` and sorting (5.1), definite assignment (JLS 16).
- Each is picked up by the owning lesson's gaps pass, not fixed here.
