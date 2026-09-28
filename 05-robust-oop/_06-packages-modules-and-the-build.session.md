# Packages, Modules & the Build — preparation record

The /prepare chain for `05-robust-oop/06-packages-modules-and-the-build.md`, in order. Not rendered (the leading `_`). The lesson is edited in
place; this file is the evidence behind each change. Prepared 2026-09-28; every run on Temurin
21.0.12.1 (`/usr/libexec/java_home -v 21`), JLS 21, the Java SE 21 API and the JDK 21 tool pages
fetched from docs.oracle.com, and JEPs from openjdk.org, the same day.

**Proof method.** Every Java block here spans several files or modules, so each carries the
`// requires:` sentinel and `prove.py` marks it exempt. Every terminal block was proved instead
by building the project in the session's scratch directory with the JDK 21 `javac`, `java`,
`jar` and `jlink`, and pasting the output. Each run is a row in the fact-check below.

## Research

### Audience

- *Holds already* (earlier lessons, never re-taught): `javac`, `java`, a terminal, `Could not
  find or load main class` (What Java Is & Running Code); `public`, package-private,
  `protected`, `private` (Encapsulation & Access Modifiers); `import` of `java.util` classes
  (The Collections Framework); interfaces and `implements` (Abstract Classes & Interfaces);
  exceptions and stack traces (Exceptions); `private` fields (Encapsulation).
- *Must not be assumed* (defined where it first appears): **package**, **classpath**,
  **fully-qualified name**, **module**, **module path**, `exports`, `requires`, **reads**,
  **reflection**, `opens`, **service**, `provides … with`, `uses`, `ServiceLoader`, **unnamed
  module**, **automatic module**, **modular JAR**, **runtime image**, `jlink`.
- *The one thing an expert forgets a newcomer does not know:* `exports` does not allow
  reflection into `private` members; that is what `opens` is for.

### Gaps in the chapter

Four lenses, most severe first: prerequisite, step, edge, structure. Coverage map rows: 7.1
(modules: exports, reflection (`opens`), `requires`, services, providers, consumers) `partial` M —
"`opens`, and a service with `provides … with` / `uses` / `ServiceLoader`" — filled here; 7.2
(compile; modular and non-modular JARs; runtime images; unnamed and automatic modules) `partial`
M — "`jlink`, and the unnamed and automatic modules" — filled here; JLS ch. 7 (Packages and
Modules) `partial` M — filled with 7.1.

| Gap | Kind | Filled where | Source |
|---|---|---|---|
| `opens` and reflective access absent (coverage map 7.1) | edge | new §4: the `Peek` session (`InaccessibleObjectException … does not "opens com.lib.model"`), fixed by `opens` (`value = hidden`); the classpath contrast; quiz 3; gotcha row | JLS §7.7.2 [5]; runs |
| Services absent: `provides … with`, `uses`, `ServiceLoader` (coverage map 7.1) | step | new §5: three modules, a session (`Hello, Ada` / `1 greeter(s) found`), the provider removed (`0 greeter(s) found`), `uses` removed (`ServiceConfigurationError`); a D2 diagram; quiz 4; 2 gotcha rows | JLS §7.7.3–7.7.4 [6]; `ServiceLoader` API [12]; runs |
| The unnamed and automatic modules absent (coverage map 7.2) | edge | new §6: a classpath program printing `named: false` / `name: null`; `jar --describe-module` on a plain JAR (`text.utils automatic`); a named module requiring it (`AUTOMATIC!` / `text.utils`); quiz 5; gotcha row | JLS §7.7.5 [7]; `ModuleFinder` [13], `ModuleDescriptor` [15], `Module` [16] APIs; runs |
| Runtime images and `jlink` absent; modular vs non-modular JAR not distinguished (coverage map 7.2) | step | §7: a modular JAR described and run; the `jlink` session (`image/bin/hello` → `HELLO!`; `--list-modules`) | JEP 282 [9]; `jlink` [11], `jar` [14] docs; runs |
| "Even a `public` type stays hidden unless exported" and "a missing `requires` fails fast" claimed, never shown | step | §3: both javac errors (`… which does not export it`; `… does not read it`); quiz 2; 2 gotcha rows | JLS §7.7 [4]; runs |
| The package–directory rule stated for sources ("or compilation fails"); the real failure, a misplaced class file, never shown | edge | §1: the `NoClassDefFoundError` session; `java -cp out Main`; quiz 1; 2 gotcha rows | JLS §7.2 [1]; runs |
| "Tutorial 35", a dead reference | structure | a link to Testing, Tooling & Packaging | — |
| No objectives, checks or sources; gotchas as bullets; the 🧪 box unanswered | structure | objectives; ✅ (5 quizzes, 1 `<details>`); 11-row table; 📚 (16) | `/prepare` chain |

### Plan

| Section | Carries | Why here |
|---|---|---|
| Intro + objectives | the four layers as a list; five objectives; how the sessions were proved | the reader's map |
| §1 Packages and the classpath | the kept blocks; the `-d` layout; the misplaced-class-file failure | the namespace first |
| §2 Encapsulation across packages | the kept blocks; §6.6.1 cited | access needs packages |
| §3 Modules | the kept blocks; JEP 261; both not-visible errors; JEP 403 | the package boundary's hole, closed |
| §4 `opens` (new) | reflection defined; the failing and fixed sessions; `exports` vs `opens` | needs `exports` from §3 |
| §5 Services (new) | three modules; the provider-free and `uses`-free runs; a D2 diagram | needs `requires` and `exports` |
| §6 Unnamed and automatic modules (new) | the classpath program; the automatic-module JAR | explains why §4's reflection worked on the classpath |
| §7 JARs, images, build tools | the kept blocks; the modular JAR; `jlink`; the testing-lesson link | shipping comes last |
| 8 / 9 | summary rows per rule; an 11-row symptom → cause → fix table | read by the study profile |
| ✅ / 📚 | one check per objective; the Predict box answered | after all mechanisms |

### Unverified

- _None._

### Fact-check

A separate pass over the FINISHED draft, as a checker: every number, name, version, code line and
cite. Only what changed or was flagged is listed. Every terminal block was run for this pass.

| Claim | Verdict | Fix |
|---|---|---|
| "its directory must match the package name"; "`package com.example.util` *must* live in `…/com/example/util/`, or compilation fails" | WRONG — run: `Main.java` and `Text.java` both in `src/anywhere/` compiled with `javac -d out`, which wrote `out/com/example/util/Text.class`, and the program printed `HELLO!`. The JLS leaves the mapping to the host [1]; the *class file* location is what matters (run: moving `Text.class` gave `NoClassDefFoundError: com/example/util/Text`) | "By convention its source file sits in a directory path that matches"; the class-file rule shown |
| "`import` is not C's `#include`" | WRONG as sourced — a claim about C with no source | removed; `import` cited to JLS §7.5 [2] |
| "why reflective access into JDK internals now requires explicit `--add-opens`" | OK in substance — JEP 403, JDK 17 [10] | "Since JDK 17 …", cited |
| "(JPMS, JDK 9+)" | OK — JEP 261, delivered in 9 [8] | cited |
| "a non-exported package is inaccessible … and a missing `requires` fails fast" | OK — runs: `package com.example.util is not visible … which does not export it`; `package com.example is not visible … does not read it` | both shown |
| "Tutorial 35 returns to build tools" | WRONG as a reference | a link to Testing, Tooling & Packaging |
| "The same modular JAR also works on the classpath, where its descriptor is ignored" (draft) | VERIFY — the run (`java -cp mlib/app.jar com.example.Main` → `HELLO!`) proves it works; "ignored" is unsourced | "Its classes then belong to the unnamed module", cited to the `Module` API [16] |
| "It exports all its packages" (draft, automatic modules) | WRONG in part — `ModuleDescriptor`: all packages exported *and open*, and it reads all other modules [15] | restated, cited |
| `text-utils.jar` → `text.utils` | OK — run: `jar --describe-module` printed `text.utils automatic`; `ModuleFinder.of`: non-alphanumerics become dots [13] | none |
| The `jlink` session, `java.base@21.0.12.1`, 48 MB vs 335 MB | OK — run on Temurin 21.0.12.1; `du -sh image` 48M, `du -sh` of the JDK 335M | "Your `java.base` version and the sizes will differ" |
| The `jar --describe-module` path | shortened — the real path is the session's scratch directory | "(path shortened here)" says so |
| `com.google.guava:guava:33.0.0-jre` | OK — Maven Central returned HTTP 200 for `guava-33.0.0-jre.pom` | none |
| `HELLO!` (classpath, module path, `java -jar`); the `whisper` error | OK — each re-run for this pass | none |
| Quiz answers and the `<details>` | OK — quiz 1 from the `src/anywhere` run; quiz 2 from §3's run; quiz 3 from §4's run; quiz 4 from §5's run; quiz 5 from §6's run; the `<details>` `validate()` message from a run (`validate() is not public in Order; cannot be accessed from outside package`) | none |
| Java blocks (6) | OK — `prove.py`: exempt 6 (`// requires:`), each built as part of a run above | none |

### Review

Scored 1–5 before the fix, the single highest-impact fix named, scored again after. Every `After`
must reach 4.

| Criterion | Before | Highest-impact fix | After |
|---|---|---|---|
| accuracy — Accuracy & currency — every claim true now, sourced or derived | 3 — the source-directory rule false; the C claim; no sources | each fixed; sixteen primary sources; every session re-run | 5 |
| clarity — Clarity for this reader — no term used before it is defined | 4 — a 6-sentence intro paragraph; sentences to 50 words | lists; mean 15 words, longest 30 | 5 |
| sequence — Sequence — each section rests only on what came before it | 4 — "`--add-opens`" named before any reflection was explained | `opens` taught in §4, with reflection defined; §6 explains §4's classpath contrast | 5 |
| practice — Worked example, non-example, checks with hidden solutions | 3 — one compile error; the Predict box unanswered | new terminal sessions, most pairing a failing run with a fixed one; five quizzes; a `<details>` | 4 — the reader cannot run the multi-module sessions in the sandbox; they are proved here and shown as terminal output |
| misconceptions — Misconceptions, edge cases, troubleshooting covered | 3 — a 5-bullet list, one row wrong (directory) | an 11-row table, one row per real message | 5 |
| actionability — Actionable — the reader can DO the objectives afterwards | 3 — two exam objectives (7.1, 7.2) half-covered | §4–§7, and five objectives with a check each | 5 |

## What changed, and why

| Change | Why |
|---|---|
| Objectives line; ✅ (5 quizzes, 1 `<details>`); 📚 (16); TOC extended; the proof method stated | the /prepare contract |
| Intro as a list | register |
| §1: the source-directory claim fixed; the class-file failure shown | gap 6; fact-check row 1 |
| §2: access cited | — |
| §3: JEP 261 and 403 cited; the two not-visible errors | gap 5; fact-check rows 3–5 |
| §4 (new): reflection and `opens` | gap 1 (coverage map 7.1) |
| §5 (new): services with `provides … with`, `uses`, `ServiceLoader` | gap 2 (coverage map 7.1) |
| §6 (new): the unnamed module and automatic modules | gap 3 (coverage map 7.2); fact-check row 8 |
| §7: the modular JAR, `jlink`, the testing-lesson link | gaps 4, 7 (coverage map 7.2); fact-check rows 6, 7, 10, 11 |
| Gotcha checklist → 11-row troubleshooting table; mental-model rows added | the /prepare shape |
| Predict box as a numbered list, answered in `<details>` | the /prepare shape |
| Register: long sentences and walls split; hedges removed ("actually", "just") | lint: 21 problems → 0 |
