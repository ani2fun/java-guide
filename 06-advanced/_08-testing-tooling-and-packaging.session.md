# Testing, Tooling & Packaging — preparation record

The /prepare chain for `06-advanced/08-testing-tooling-and-packaging.md`, in order. Not rendered (the leading `_`). The lesson is edited in
place; this file is the evidence behind each change. Prepared 2026-09-29. Every Java run on Temurin
21.0.12.1 (`/usr/libexec/java_home -v 21`), macOS/arm64; Maven 3.9.16 and Gradle 9.7.1, both
with `JAVA_HOME` set to that JDK 21. JLS 21 §14.10, the `java` man page, the JAR File
Specification, the JUnit 5.10.2 and current (6.1.3) user guides, the Maven lifecycle and
dependency-mechanism guides, the Gradle testing guide and the Shade plugin page fetched the same
day.

## Research

### Audience

- *Holds already* (earlier lessons, never re-taught): `javac`/`java`, bytecode, the launch
  errors (What Java Is & Running Code); exceptions and stack traces, `ArithmeticException`
  (Exceptions); lambdas (Nested & Anonymous Classes; Lambdas); `@Override` as an annotation
  (Inheritance & Polymorphism); packages, the classpath, `jar --create`, executable and modular
  JARs, automatic and unnamed modules, `jlink`, and the coordinates of a Maven dependency
  (Packages, Modules & the Build); `Map.of` (Sets & Maps).
- *Must not be assumed* (defined where it first appears): **assertion**, `-ea`,
  **annotation** as a marker a tool reads, **test scope**, **transitive dependency**,
  **lifecycle phase**, **manifest**, `Main-Class`, `Class-Path`, **fat JAR**, **log level**.
- *The one thing an expert forgets a newcomer does not know:* `java -jar` ignores `-cp`, so
  the usual classpath fix silently does nothing.

### Gaps in the chapter

Four lenses, most severe first: prerequisite, step, edge, structure. Plus this lesson's rows in
`_prepare/coverage-map.md`:

- **7.2** (compile; modular and non-modular JARs; runtime images; unnamed and automatic modules)
  — `partial`, M. Packages, Modules & the Build §6–7 already proves modular JARs, automatic and
  unnamed modules, and `jlink`; this lesson links there and does **not** repeat them. It adds the
  non-modular executable JAR's manifest, `no main manifest attribute`, the missing-library
  failure, `-jar` ignoring `-cp`, `Class-Path`, and a fat JAR — every one run.
- **Annotations, generics, logging** (L; named by a secondary source only). Before this pass the
  lesson said only "add targeted logging", with no API or example. Now §5 teaches
  `java.util.logging` levels with a proved fence, and §2 defines *annotation* at `@Test`. Whether
  logging is an exam objective stays **[?]**: Oracle's 1Z0-830 page was still "down for
  maintenance" on 2026-09-29 (fetched twice). Listed under Unverified.

| Gap | Kind | Filled where | Source |
|---|---|---|---|
| The `mvn test` output was a hand-trimmed block with a timing (`0.025 s`) that no run here reproduces | edge | §2: a real capture, Maven 3.9.16 on JDK 21 | run |
| No failing test shown; the Predict box asks for the failure message | step | §2 concrete bite: `expected: <4> but was: <5>` and `BUILD FAILURE`; quiz 2 | run |
| "The Gradle equivalent of that dependency is one line" — Gradle runs no JUnit test with only that line | edge | §3: the full `build.gradle.kts`, run; both failure messages in the table | Gradle testing guide [8]; runs |
| Transitive resolution and the test scope asserted, never shown | step | §3: `mvn dependency:tree` (one declaration → eight libraries); `jar --list` of the packaged JAR (no JUnit class); quiz 3 | Maven dependency guide [7]; runs |
| A disabled `assert` does not evaluate its condition: side effects vanish | edge | §1 **non-example** fence (`checks = 0`, and `1` with `-ea`); quiz 1 | JLS §14.10 [1]; runs |
| Coverage 7.2: the non-modular executable JAR (manifest shown), `no main manifest attribute` (**non-example**), `NoClassDefFoundError`, `-jar` ignoring `-cp`, `Class-Path`, fat JAR | edge | §4, a terminal session per case; quiz 4 | `java` man page [2], JAR spec [9], `jar` [3]; runs |
| Coverage 7.2: modular JARs, automatic/unnamed modules, `jlink` | structure | §4, a link to Packages, Modules & the Build, not repeated | — |
| "Read the stack trace", "add targeted logging" — told, never shown (coverage row L) | prerequisite | §5: a proved stack-trace fence read frame by frame; a proved `java.util.logging` level fence; quiz 5 | `java.util.logging` [11]; `conf/logging.properties` [12]; runs |
| *Annotation* used at `@Test` with no definition | prerequisite | §2, first use, linked to `@Override` | — |
| "JUnit 5 is the standard" — JUnit 6 is current (6.1.3) | edge | §2: JUnit 6 named; the same test passes unchanged on 6.1.3 | JUnit user guide [5]; run |
| "Tutorial 27", "Tutorial 1": dead references | structure | links to the named lessons | — |
| No objectives, checks or sources; gotchas as bullets; Predict box unanswered | structure | objectives; ✅ (5 quizzes, 1 `<details>`); 11-row table; 📚 (13) | `/prepare` chain |

### Plan

| Section | Carries | Why here |
|---|---|---|
| Intro + objectives | the four parts as a list; five objectives | the reader's map |
| §1 Assertions | the kept fence and `-ea` session; JLS §14.10; **non-example** side effect | the smallest test tool first, and its trap |
| §2 JUnit | annotation defined; JUnit 6 note; the kept test class; a real `mvn test`; the failing test | the framework that fixes §1 |
| §3 Build tools | the kept `pom.xml`; the lifecycle, the tree, the test scope; the real Gradle file | the tool that runs §2's tests |
| §4 Executable JAR | the kept session; the manifest; link for modular JARs and `jlink`; **non-example** no `Main-Class`; the missing library and three fixes | what the build produces, last before debugging |
| §5 Debugging | the toolkit as a list; a stack-trace fence; a logging fence | when something still goes wrong |
| 6 / 7 | summary rows per rule; an 11-row symptom → cause → fix table | read by the study profile |
| ✅ / 📚 | one check per objective; the Predict box's `pom.xml` question answered in `<details>` | after all mechanisms |

### Unverified

- _None in the lesson._ Every `mvn`, `gradle`, JUnit and `jar` output was produced here. The one
  open question is the coverage map's, not the lesson's: whether logging is a 1Z0-830 objective.
  The lesson makes no such claim, and the map's row keeps its `[?]` (see Gaps above).

### Fact-check

A separate pass over the FINISHED draft, as a checker: every number, name, version, code line and
cite. Only what changed or was flagged is listed.

| Claim | Verdict | Fix |
|---|---|---|
| "The Gradle equivalent of that dependency is one line — `testImplementation(...)`" | WRONG — with that line alone Gradle 9.7.1 fails: "the test task did not discover any tests to execute"; with `useJUnitPlatform()` added, `Failed to load JUnit Platform` | the full three-part `build.gradle.kts`, run (`tests="2" failures="0"`); cited [8] |
| The `mvn test` block (`Time elapsed: 0.025 s`) and its duplicate "Output" block | WRONG as evidence — hand-trimmed, and the timing matches no run | replaced by a real capture (0.026 s); the duplicate block removed |
| "JUnit 5 is the standard" | WRONG in currency — JUnit 6 (6.1.3) is current and needs Java 17 [5] | JUnit 6 named; the same test class passes on 6.1.3 (run) |
| "`mvn package` produced the `Tests run: 2` result above" | OK in substance — the package run printed `Tests run: 2` | shown as its own filtered session |
| "JUnit's runner reflects over the test classes, invokes each `@Test` method in isolation" | VERIFY — the reflection detail unsourced | "finds every method marked `@Test`"; not `private` and per-method instances, both quoted from the 5.10.2 guide [4] |
| "otherwise the JVM strips the check" | VERIFY — implementation wording | JLS §14.10: "has no effect whatsoever" [1]; the side-effect run |
| "`<scope>test</scope>` keeps it out of the shipped artifact" | OK — `jar --list` of `calc-1.0.jar` shows only `Calculator.class` | shown |
| "declaring one dependency pulls in its dependencies … with version conflict mediation" | VERIFY — unsourced | `dependency:tree` shown; "nearest definition" quoted [7] |
| Draft's own "one declaration turns out to be seven libraries" | WRONG — eight in all: the one declared plus seven | "eight libraries: the one declared, and seven more" |
| "`java -jar app.jar` fails with `NoClassDefFoundError` unless those libraries are on the classpath" | WRONG in part — `-cp` is ignored with `-jar` (man page [2]; run) | the run with `-cp acme.jar -jar` shown; three fixes that work |
| "or the manifest's `Class-Path` references them" | OK — run: `app2.jar` printed `HELLO!`; fails when copied without `acme.jar` | cited [9] |
| "plugins like the Shade/Assembly plugin or Spring Boot's repackaging" | VERIFY — unsourced | Shade only, quoted [13] |
| Draft's own "Real projects often use … SLF4J with Logback" | VERIFY — unsourced usage claim | removed |
| "(Windows separates the entries with `;`)" | OK — `java` man page [2] | cited |
| "Tutorial 27", "Tutorial 1" | WRONG as references | links |
| Every `Output:` and exception block (5 fences) | OK — `prove.py`: proved 4, exempt 1 (the JUnit `requires:` fence); the stack-trace label no longer says "vary", which had made it illustrative | none |
| Every terminal session (`java -ea`, `mvn test` ×2, `mvn package`, `mvn dependency:tree`, `jar --list`, `gradle test`, the JAR sessions) | OK — each run on 2026-09-29; outputs pasted, trimmed only where the page marks `…` or says "filtered" | none |
| Quiz answers and the `<details>` | OK — 1 from the side-effect runs; 2 from the failing `mvn test`; 3 from the tree and `jar --list`; 4 from the `-cp` runs; 5 from the logging fence; `<details>` from the Maven scope guide [7] and the `calc-1.0.jar` and `acme` runs | none |

### Review

Scored 1–5 before the fix, the single highest-impact fix named, scored again after. Every `After`
must reach 4.

| Criterion | Before | Highest-impact fix | After |
|---|---|---|---|
| accuracy — Accuracy & currency — every claim true now, sourced or derived | 2 — the Gradle "one line" false; a hand-edited `mvn` block; JUnit 5 as current; `-cp` implied to help `-jar`; no sources | each fixed from a real run; thirteen sources | 5 |
| clarity — Clarity for this reader — no term used before it is defined | 3 — a 5-sentence intro wall; sentences to 66 words; *annotation* undefined | lists; defined at first use; mean 13 words, longest 30 | 5 |
| sequence — Sequence — each section rests only on what came before it | 4 — sound order; references by tutorial number | links to the named lessons | 5 |
| practice — Worked example, non-example, checks with hidden solutions | 2 — one runnable fence; no non-example beyond `assert`; no checks | three new proved fences, two non-examples, a real terminal session behind every tool claim; five quizzes and a `<details>` | 5 |
| misconceptions — Misconceptions, edge cases, troubleshooting covered | 3 — five bullets | an 11-row table with the real messages (`-jar` vs `-cp`, both Gradle failures, side effects in `assert`) | 5 |
| actionability — Actionable — the reader can DO the objectives afterwards | 3 — debugging and logging only described | stack-trace and logging fences; five objectives with checks | 4 — Maven, Gradle and JAR work is practised only on quizzes; the sandbox cannot run a build tool |

## What changed, and why

| Change | Why |
|---|---|
| Objectives line; ✅ (5 quizzes, 1 `<details>`); 📚 (13); TOC extended to 9 entries | the /prepare contract |
| Intro and core-idea box as lists; "Tutorial 27/1" → links | register; fact-check |
| §1: JLS §14.10 quoted; the side-effect non-example with its `-ea` run | gap 5; fact-check row 6 |
| §2: *annotation* defined; JUnit 6 note; real `mvn test`; the failing test; the 5.10.2 guide quoted | gaps 1, 2, 9, 10; fact-check rows 2, 3, 5 |
| §3: lifecycle cited; `mvn package`, `dependency:tree`, `jar --list`; the real Gradle build | gaps 3, 4; fact-check rows 1, 4, 7–9 |
| §4: manifest shown; modular JARs, `jlink`, automatic modules linked (coverage 7.2); `no main manifest attribute`; `NoClassDefFoundError`, `-jar` ignoring `-cp`, `Class-Path`, fat JAR | gaps 6, 7; fact-check rows 10–12 |
| §5: toolkit as a list; stack-trace fence; `java.util.logging` level fence (coverage row L) | gap 8; fact-check row 13 |
| Gotcha checklist → 11-row troubleshooting table; mental-model rows added | the /prepare shape |
| Predict box as a numbered list, each part answered in the lesson | the /prepare shape |
| Register: long sentences split, walls of prose turned into lists, "actually" removed | lint: 13 register problems → 0 |
