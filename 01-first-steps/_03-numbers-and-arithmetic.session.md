# Numbers & Arithmetic — preparation record

The /prepare chain for `01-first-steps/03-numbers-and-arithmetic.md`, in order. Not rendered (the
leading `_`). The lesson is edited in place; this file is the evidence behind each change.
Prepared 2026-09-27; every run on OpenJDK 21.0.10.

**Source access.** This session's network policy blocked `docs.oracle.com` and `openjdk.org`.
JLS rules were checked against the page text quoted by a search index restricted to
`docs.oracle.com`; the `Math` and `BigDecimal` claims against the OpenJDK 21 source javadoc
(`java/lang/Math.java`, `java/math/BigDecimal.java`, openjdk/jdk21u on raw.githubusercontent.com).
For §15.17.3 and §15.26.2 the index returned no verbatim sentence; the section numbers are cited,
and the behaviour each carries is proved by a run in the lesson.

## Research

### Audience

- *Holds already* (lessons 01–02): statement, compile vs run time, a thrown exception (`10 / 0`
  in lesson 01), variable, declaration, assignment, `final`, the eight primitives and their exact
  ranges, `MIN_VALUE`/`MAX_VALUE`, literal types, `L`/`f` suffixes, constant narrowing (`byte b =
  100`), "possible lossy conversion", widening `double wide = 7`.
- *Must not be assumed* (each defined where it first appears): **operand**, **dividend**,
  remainder, truncate, promote, cast, narrowing, overflow, **scientific notation** (`3.0e10`),
  Infinity, NaN, precedence, **declaring two variables in one statement** (`int total = 7, count
  = 2;`, used in two fences and never taught), compound assignment, increment.
- *The one thing an expert forgets a newcomer does not know:* `+=` and `++`, used in every loop
  of the next chapter, were never taught anywhere before it.

### Gaps in the chapter

Four lenses, most severe first. Coverage map 1.2 (arithmetic, `Math`, precedence, casting):
covered, with the note "check `char` arithmetic and the implicit cast in `+=`" — both were absent.

| Gap | Kind | Filled where | Source |
|---|---|---|---|
| `+=`, `-=`, `++`, `--` are never taught, yet `02-control-flow/03` uses `i++` and `sum += n` in every loop | prerequisite | §1 "Updating a variable", a run proof | JLS §15.26.2 [7], §15.14.2 [3]; run |
| `a++` vs `++a` as a value (1Z0-830 1.2); a classic wrong prediction | edge | §1 non-example, a proof; quiz 4; troubleshooting row | JLS §15.14.2 [3]; run |
| `double` is approximate: `0.1 + 0.2` prints `0.30000000000000004`. The most common surprise after integer division; never shown | edge | new §5 "Decimals are approximate"; `<details>` 1 | `BigDecimal(double)` javadoc [9]; run |
| The implicit cast in `+=` (coverage map 1.2): `b = b + 1` fails on a `byte`, `b += 1` compiles, and `120 += 10` wraps to `-126` | edge | §3 non-example, a proof | JLS §15.26.2 [7]; runs |
| `byte + byte` is an `int` (binary numeric promotion); `char` arithmetic (`'A' + 1` is `66`) (coverage map 1.2) | step | §3 "Small types are promoted to `int`", a compiler-error proof and a run | JLS §5.6 [5]; runs |
| A narrowing cast can change the value: `(byte) 200` is `-56`, `(int) 3.0e10` stops at `2147483647`, `(int) -3.9` is `-3`; lesson 02 sends the reader here for casts | edge | §3 "A cast to a smaller type can change the value" | JLS §5.1.3 [6]; run |
| `long wrong = a * b` still overflows; the lesson said "use `long`" without showing the widening comes too late | edge | §4 non-example, a proof; troubleshooting row; quiz 3 | JLS §4.2.2 [8]; run |
| Floating-point `/ 0` gives Infinity or NaN, not an exception; integer `/ 0` and `% 0` throw | edge | §2 earned rule; §5 bite, a proof | JLS §15.17.2 [4]; runs |
| Negative integer division truncates toward zero (`-7 / 2` is `-3`); `Math.floorMod` was recommended, never shown | edge | §1 fence with `floorMod` and `-7 / 2`; §2 analysis; quiz 1 | JLS §15.17.2 [4], `Math` javadoc [2]; run |
| Same-level operators run left to right (`8 / 4 / 2` is `1`) | step | §6, a proof | run |
| `int total = 7, count = 2;` declares two variables in one statement; never explained | prerequisite | §2, the sentence before the fence | — |
| "Operand" used throughout, never defined | prerequisite | intro | — |
| No objectives, checks, sources; Predict box unanswered; gotchas were bullets | structure | objectives, ✅ (4 quizzes, 2 `<details>`), 📚 (10), 13-row table | `/prepare` chain |
| "Tutorial 24, in Tier 4" | structure | link to Exceptions | — |

### Plan

| Section | Carries | Why here |
|---|---|---|
| Intro + objectives | operand defined; the three traps named | the word every section uses |
| §1 Operators | `+ - * / %`; `%` sign, `floorMod` proof; **update operators**; **non-example** `a++` as a value | `+=`/`++` are operators; they need nothing from later sections |
| §2 Integer division | truncation toward zero, negatives; multi-declaration explained; average bug; integer `/ 0` throws | division before mixing types |
| §3 Mixing and casting | promotion; cast too late; **small types promote to `int`** (compiler-error proof), `char` arithmetic; narrowing changes values; **non-example** `+=` hides a cast | casts must exist before `+=`'s hidden cast can be explained |
| §4 Overflow | exact range; wrap; **non-example** `long wrong = a * b`; `*Exact` | needs casts and `long` |
| §5 Decimals are approximate (new) | `0.1 + 0.2`; Infinity/NaN; money in `long` cents or `BigDecimal` | the floating-point counterpart of §4 |
| §6 Precedence and `Math` | precedence, left-to-right order (a proof), `Math.pow` returns `double` | last: combines every operator above |
| 7 / 8 | summary rows per new rule; a 13-row symptom → cause → fix table | read by the study profile |
| ✅ / 📚 | one check per objective; Predict box answered | after all mechanisms |

### Unverified

- _None._

### Fact-check

A separate pass over the FINISHED draft, as a checker: every number, name, version, code line and
cite. Only what changed or was flagged is listed.

| Claim | Verdict | Fix |
|---|---|---|
| "`%` … is not quite the mathematical modulo, which is always non-negative" | WRONG in part — with a negative divisor `Math.floorMod` is negative (`floorMod(+4, -3) == -2`, `Math` javadoc [2]) | "never negative for a positive divisor"; `floorMod`'s sign follows the divisor |
| `int` "range of about −2.1 billion to +2.1 billion"; `long` "up to ~9.2 quintillion"; "exceed ~2 billion" | VERIFY — inexact; the register wants exact numbers | `−2147483648 to 2147483647`, `9223372036854775807`, "pass 2147483647" (lesson 02's run) |
| "use `long` … and make at least one operand a `long`" | OK, but unproved — the trap it guards against (`long wrong = a * b`) was never shown | non-example proof: `1410065408` vs `10000000000` |
| "`Math.floorMod`, which returns a non-negative result for a positive divisor" | OK — `Math` javadoc [2]; run `Math.floorMod(-7, 2)` → `1` | now shown |
| "`Math.multiplyExact` and `Math.addExact` throw" | OK — `Math` javadoc [2] ("@throws ArithmeticException if the result overflows an int"); run `Math.addExact(2147483647, 1)` threw `integer overflow` | cited |
| "Exceptions get their full treatment in Tutorial 24, in Tier 4" | WRONG as a reference — numbering, not a lesson | link to Exceptions |
| "`(int) 3.9` is `3` … toward zero" | OK — run; `(int) -3.9` → `-3` added | none |
| "`7 / 0` and `7 % 0` throw … `/ by zero`" (draft) | OK — run `7 % 0`: `ArithmeticException: / by zero`; `10 / 0` proved in lesson 01 | none |
| "`println` stops after 16 digits" (draft) | WRONG as a general rule — `Double.toString` prints as many digits as needed | "`println` shows 16 digits of it" (of `1.0 / 3`) |
| "`0.1` … no exact binary form" | OK — `BigDecimal(double)` javadoc: "0.1 cannot be represented exactly as a double" [9] | cited |
| "`3.0e10` … cast to `int`, stops at `2147483647`"; "`(byte) 200` is `-56`" | OK — run 2026-09-27; JLS §5.1.3 [6] | none |
| Quiz answers 1–4 and both `<details>` | OK — 1 from `-7 / 2`, `-7 % 2` (run); 2 from `(double) 7 / 2` → `3.5` (run); 3 from the `long wrong` proof; 4 from the `a++` proof; `<details>` from the `0.1 + 0.2`, `7.0 / 0` and four-line Predict runs (`2`, `2.5`, `2.5`, `2.0`) | none |
| Every `Output:` and `Compiler error:` block (22 fences) | OK — `prove.py`: 22/22 | none |

### Review

Scored 1–5 before the fix, the single highest-impact fix named, scored again after. Every `After`
must reach 4.

| Criterion | Before | Highest-impact fix | After |
|---|---|---|---|
| accuracy — Accuracy & currency — every claim true now, sourced or derived | 3 — the modulo claim overstated, ranges approximate, a numbered cross-reference, no sources | exact ranges; `floorMod` shown; ten cites | 5 |
| clarity — Clarity for this reader — no term used before it is defined | 3 — operand, dividend and the two-variable declaration undefined; mean 20+ words, 5-sentence paragraphs | define each at first use; split paragraphs; mean 13 words, longest 26 | 5 |
| sequence — Sequence — each section rests only on what came before it | 3 — the next chapter's loops rest on `++` and `+=`, taught nowhere | update operators in §1; `+=`'s hidden cast after casts in §3 | 5 |
| practice — Worked example, non-example, checks with hidden solutions | 3 — a bite per section, no hidden answers | three non-examples (`a++`, `+=` wrap, `long wrong`), four quizzes, two `<details>` | 5 |
| misconceptions — Misconceptions, edge cases, troubleshooting covered | 3 — no floating-point imprecision, no promotion of small types, no Infinity | §5; §3 subsections; a 13-row troubleshooting table | 5 |
| actionability — Actionable — the reader can DO the objectives afterwards | 4 — the reader could fix divisions; objectives implicit | five objectives, one check each | 5 |

## What changed, and why

| Change | Why |
|---|---|
| Objectives line; ✅ (4 quizzes, 2 `<details>`); 📚 (10) | the /prepare contract |
| §1: `floorMod` proof; update operators (`+=`, `++`, `--`); `a++` vs `++a` non-example | gaps 1, 2, 9; fact-check row 1 |
| §2: negatives truncate toward zero; the two-variable declaration explained; integer `/ 0` | gaps 8, 9, 11 |
| §3: small types promote to `int`; `char` arithmetic; narrowing changes values; `+=` hides a cast | gaps 4, 5, 6; coverage map 1.2 notes |
| §4: exact ranges; `long wrong = a * b` non-example | gap 7; fact-check rows 2, 3 |
| New §5 "Decimals are approximate": `0.1 + 0.2`, Infinity, NaN, money | gap 3 |
| §6: left-to-right order, a proof | gap 10 |
| Gotcha checklist → 13-row troubleshooting table; mental-model rows updated; sections renumbered (no anchor links pointed into this lesson) | the /prepare shape |
| "Tutorial 24, in Tier 4" → link | gap 14 |
| Register: hedges ("quite", "simply", "just", "actually", "kind of") removed, paragraphs split | lint: 19 problems → 0 |
