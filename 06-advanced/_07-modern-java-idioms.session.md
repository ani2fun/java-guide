# Modern Java Idioms & the Type System — preparation record

The /prepare chain for `06-advanced/07-modern-java-idioms.md`, in order. Not rendered (the leading `_`). The lesson is edited in
place; this file is the evidence behind each change. Prepared 2026-09-29; every run on Temurin
21.0.12.1 (`/usr/libexec/java_home -v 21`), macOS/arm64. API text checked against the JDK 21
`src.zip` javadoc (`Optional`, `Collections`, `List`); JLS 21 chapters 8, 14, 15 and 17, the
JDK 21 project page, the OpenJDK LVTI style guide and Hoare's InfoQ talk page fetched the same day.

## Research

### Audience

- *Holds already* (earlier lessons, never re-taught): `var` basics, its limits and its compile
  errors (Variables & Primitive Types §5); block scope (Methods §3); field shadowing and `this.`
  (Classes & Objects); immutable classes, `final` fields, defensive copies (Encapsulation &
  Access Modifiers §4); `List.of` and `UnsupportedOperationException` (The Collections Framework);
  records, compact constructors, shallow immutability and `List.copyOf` (Enums & Records); sealed
  types, pattern `switch`, record patterns and the "does not cover all possible input values"
  error (Sealed Classes & Pattern Matching); streams, `Optional`, `get()` on empty,
  `orElse`/`orElseGet` (Functional Java & the Streams API); `final` fields and safe publication
  (The Java Memory Model & Performance).
- *Must not be assumed* (defined where it first appears): **data-oriented programming**,
  **exhaustive** `switch`, **unmodifiable view** vs copy, what `var` infers from a diamond.
- *The one thing an expert forgets a newcomer does not know:* a `default` branch is not a
  harmless safety net over a sealed type — it switches the compiler's case check off.

### Gaps in the chapter

Four lenses, most severe first: prerequisite, step, edge, structure. Plus this lesson's rows in
`_prepare/coverage-map.md`: 3.4 (variable scope, encapsulation, immutable objects, `var`) —
`partial`, M. This lesson teaches the `var` and immutability parts it owns (the diamond trap; view
vs copy; shallow `final` by link); scope and shadowing are **not** re-taught — one paragraph links
Methods §3 and Classes & Objects. Row 18 (type inference) is touched by the `var` + diamond
non-example.

| Gap | Kind | Filled where | Source |
|---|---|---|---|
| "A `default` would swallow a new case" is the lesson's core argument, never shown; the bite only cited "Tutorial 26 verified" | step | §1: the Pentagon compile error as a proved fence, then a **non-example** with `default -> 0.0` printing `Pentagon -> 0.00`; quizzes 1–2 | JLS §14.11.1.1 [3], §15.28.1 [4]; runs |
| `Optional` "is for return values, not fields" asserted; "worst of both worlds" never shown | edge | §2 **non-example**: a `null` `Optional` field throws `NullPointerException`; quiz 3 | `Optional` API note [7]; run |
| The Predict box's `"abc"` question unanswered: does `orElse` save a failing `map`? | edge | §2 edge fence: `NumberFormatException`, `orElse` never runs | run |
| Immutability (coverage 3.4): an unmodifiable view mistaken for a copy | edge | §3 **non-example** fence: view `[Ada, Linus]`, copy `[Ada]`; quiz 4 | `Collections.unmodifiableList` [8], `List.copyOf` [9]; run |
| `var` (coverage 3.4, row 18): `var` with a bare diamond infers `ArrayList<Object>` | edge | §3 **non-example**, a compiler-error fence; quiz 5 | LVTI style guide G6 [10]; javac |
| Why records can sit in a `permits` list with no `final` | prerequisite | §1, one sentence with javac's message for a plain class | JLS §8.1.1.2 [2]; javac run |
| Scope and shadowing (coverage 3.4) | structure | §3, a link paragraph, not re-taught | — |
| "Tiers 3–5", "Tutorial 26", "Tutorial 21": dead references | structure | links to the named lessons and chapters | — |
| No objectives, checks or sources; gotchas as bullets; §4's duplicated `amountOf` and the Predict box unanswered | structure | objectives; ✅ (5 quizzes, 1 `<details>` with a proved fence using a record accessor as the interface method); 11-row table; 📚 (13) | JLS §8.10.3 [1]; run |

### Plan

| Section | Carries | Why here |
|---|---|---|
| Intro + objectives | the features as lists with links to where each was taught; four objectives | the reader's map, and the lessons it synthesizes |
| §1 Data-oriented design | the kept fence and diagram; records implicitly `final`; the Pentagon error; **non-example** `default` | the lesson's central mechanism first |
| §2 `Optional` | the kept fence; the API note; **non-example** a `null` field; the `map` failure edge | absence, the second feature |
| §3 Immutability and `var` | the kept fence; the scope link; shallow `final` by link; **non-example** view vs copy; **non-example** `var` + diamond | coverage 3.4, after the reader has seen records at work |
| §4 Composing | the kept fence; the `amountOf` note | the synthesis, last |
| 5 / 6 | summary rows per rule; an 11-row symptom → cause → fix table | read by the study profile |
| ✅ / 📚 | one check per objective; the Predict box's third question answered with a proved fence | after all mechanisms |

### Unverified

- _None._

### Fact-check

A separate pass over the FINISHED draft, as a checker: every number, name, version, code line and
cite. Only what changed or was flagged is listed.

| Claim | Verdict | Fix |
|---|---|---|
| "`Optional` makes 'might be absent' part of the type, so the compiler forces you to deal with it before extracting a value" | WRONG in part — `get()` compiles and throws on empty | "the compiler makes you unwrap it"; `get()` named as the unsafe unwrap, with a link |
| "`Optional` is for return values, not fields or parameters" | VERIFY — unsourced | the API note quoted [7]; the `null`-field NPE proved |
| "`null` is the billion-dollar mistake" (linked to a lesson that never says so) | VERIFY | attributed to Hoare, QCon 2009 [12] |
| "An immutable object … inherently thread-safe" | VERIFY — unsourced | JLS §17.5 [13] and a link to the memory-model lesson |
| "as Tutorial 21 verified, a record's components are `final`" | WRONG as a reference | JLS §8.10.3 [1] ("private, final, and non-static"); link to Enums & Records |
| "as Tutorial 26 verified … 'the switch expression does not cover all possible input values'" | WRONG as a reference | the error proved here on the lesson's own `Shape`; JLS §15.28.1 [4] |
| Draft's own "a record needs no `final` … in the `permits` list" | WRONG — the modifier goes on the subclass, not in `permits` | reworded; a plain class gives `sealed, non-sealed or final modifiers expected` (javac 21, 2026-09-29) |
| "Tiers 3–5" (summary and intro) | WRONG as a reference | named chapters and lessons, linked |
| "`var` … the variable has a concrete type, just not spelled out" | OK | "just" removed (register) |
| JEP 440 and 441 final in JDK 21 | OK — JDK 21 project page feature list | cited [5] [6] |
| "`6.00 + 1.50 = 7.50`" | OK — 200 × 0.03 + 50 × 0.03; `prove.py` | none |
| Every `Output:` and `Compiler error:` block (11 fences) | OK — `prove.py`: proved 9, rejected 2 | none |
| Quiz answers and the `<details>` | OK — 1 from the Pentagon proof, 2 from the `default` proof, 3 from the `null`-field proof, 4 from the view/copy proof, 5 from the diamond proof; `<details>` fence proved (`cards: 2`, `total: 350.0`) | none |

### Review

Scored 1–5 before the fix, the single highest-impact fix named, scored again after. Every `After`
must reach 4.

| Criterion | Before | Highest-impact fix | After |
|---|---|---|---|
| accuracy — Accuracy & currency — every claim true now, sourced or derived | 3 — the "compiler forces you" overstatement; three dead "Tier/Tutorial" references; no sources | each fixed; thirteen primary sources; every fence proved | 5 |
| clarity — Clarity for this reader — no term used before it is defined | 3 — a 6-sentence intro wall; sentences to 63 words | lists; mean 12 words, longest 30 | 5 |
| sequence — Sequence — each section rests only on what came before it | 4 — sound order; references by number | links to the named lessons | 5 |
| practice — Worked example, non-example, checks with hidden solutions | 2 — four worked examples, no non-example, no checks | seven new fences, four non-examples; five quizzes; a `<details>` with a proof | 5 |
| misconceptions — Misconceptions, edge cases, troubleshooting covered | 3 — five bullets; the `default` trap only asserted | an 11-row table with the real messages; view vs copy; `var` + diamond | 5 |
| actionability — Actionable — the reader can DO the objectives afterwards | 3 — objectives implicit; the Predict box unanswered | four objectives with checks; each Predict question answered in the lesson | 4 — the composition objective is practised on one `<details>` only |

## What changed, and why

| Change | Why |
|---|---|
| Objectives line; ✅ (5 quizzes, 1 `<details>`); 📚 (13); TOC extended to 8 entries | the /prepare contract |
| Summary and intro: "Tiers 3–5" → named chapters; intro as lists | fact-check; register |
| §1: records implicitly `final`; the Pentagon compiler error; the `default` non-example | gaps 1, 6; fact-check rows 6–7 |
| §2: Hoare cited; the API note quoted; the `null`-field non-example; the failing-`map` edge | gaps 2, 3; fact-check rows 1–3 |
| §3: scope/shadowing link; JLS §8.10.3 and §17.5; shallow `final` by link; view vs copy; `var` + diamond | gaps 4, 5, 7 (coverage 3.4); fact-check rows 4–5 |
| §4: Analysis as a list; the `amountOf` note, answered in ✅ | gap 9 |
| Gotcha checklist → 11-row troubleshooting table; mental-model rows added | the /prepare shape |
| Predict box as a numbered list, each part answered in the lesson | the /prepare shape |
| Register: long sentences split, walls of prose turned into lists, hedges removed ("actually", "just") | lint: 16 register problems → 0 |
