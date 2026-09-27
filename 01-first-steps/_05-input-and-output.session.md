# Input & Output — preparation record

The /prepare chain for `01-first-steps/05-input-and-output.md`, in order. Not rendered (the
leading `_`). The lesson is edited in place; this file is the evidence behind each change.
Prepared 2026-09-27; every run on OpenJDK 21.0.10.

**Source access.** This session's network policy blocked `docs.oracle.com`. Every API claim was
checked against the OpenJDK 21 source javadoc (openjdk/jdk21u on raw.githubusercontent.com):
`java/util/Scanner.java` ("breaks its input into tokens using a delimiter pattern, which by
default matches whitespace"; `nextLine` "returns the rest of the current line"; `nextInt` throws
`InputMismatchException` "if the next token does not match the Integer regular expression, or is
out of range"; the initial locale is `Locale.getDefault(Locale.Category.FORMAT)`),
`java/util/Formatter.java` (`%%` "a literal '%'", `%n` "the platform-specific line separator", a
conversion "not applicable to the corresponding argument" throws
`IllegalFormatConversionException`) and `java/lang/Integer.java`.

## Research

### Audience

- *Holds already* (lessons 01–04): exceptions and their first line, `print` vs `println`,
  variables, `int`/`double`, integer vs floating-point division, `+` joins once a String is
  involved, `"… " + (a + b)`, escape sequences (`\n`), object, method, `new` (named).
- *Must not be assumed* (each defined where it first appears): **stream**, parsing, format
  string, **specifier**, `import`, **token** (the source used it undefined), source, locale
  (as "the computer's language settings").
- *The one thing an expert forgets a newcomer does not know:* lesson 02 promised a way to turn
  text into a number "in Input and output", and this lesson used `Integer.parseInt` only as a
  failure, never as the conversion.

### Gaps in the chapter

Four lenses, most severe first. Coverage map 9.1 (console I/O) partial, M — console input beyond
`Scanner` belongs to 06-advanced/06; 10.1 (localization) GAP, a later lesson.

| Gap | Kind | Filled where | Source |
|---|---|---|---|
| `Integer.parseInt` never shown as the conversion lesson 02 promised; only its failure | step | §4, a run proof after the `"75"` bite; quiz 4 | `Integer` javadoc [3]; run (`12`, `5.0`) |
| The leftover-newline fix is stated, never run | step | §3, a proof (`age=36 name=[Ada]`); `<details>` 1 | `Scanner` javadoc [2]; run |
| `next()` named, never shown; "token" undefined | prerequisite | §2 "`next()` versus `nextLine()`", a proof; quiz 2 | `Scanner` javadoc [2]; run |
| A bare `%` in a format string throws (`MissingFormatArgumentException: Format specifier '% d'`); `%%` unmentioned | edge | §1 non-example; troubleshooting row | `Formatter` javadoc [1]; run |
| `%f` with an `int` throws (`f != java.lang.Integer`), the mirror of the `%d` bite and a common average bug | edge | §1 bite paragraph; troubleshooting row | `Formatter` javadoc [1]; run |
| `nextInt` on a number past the `int` range throws `InputMismatchException` | edge | §5; troubleshooting row | `Scanner` javadoc [2]; run (`For input string: "3000000000"`) |
| `Integer.parseInt(" 42")` fails on a leading space | edge | §5; troubleshooting row | run |
| Scanner and `printf` follow the default locale: `3.5` fails and `3,14` prints on a German-language machine | edge | §5 "Decimals and your computer's language"; troubleshooting row | `Scanner` javadoc [2]; runs with `-Duser.language=de -Duser.country=DE` |
| "Stream" and "specifier" used undefined | prerequisite | intro, §1 | — |
| The Run-button note was a `>` blockquote, not the book's callout idiom | structure | a 📘 callout | RUNBOOK §5 |
| No objectives, checks or sources; Predict box unanswered; gotchas were bullets | structure | objectives, ✅ (4 quizzes, 2 `<details>`), 📚 (3), 10-row table | `/prepare` chain |
| "Tutorial 3/4/24", "Tier 1/4" references | structure | links to the named lessons | — |

### Plan

| Section | Carries | Why here |
|---|---|---|
| Intro + note + objectives | stream, parsing; the Run-button note as a callout | the reader must know why some fences have no ▶ |
| §1 `printf` | specifiers, `%n`, `%%`; `%d`/String bite, `%f`/`int`; **non-example** bare `%` | output needs nothing from input |
| §2 `Scanner` | `import`, `new` (linked), token; static + twin; **`next` vs `nextLine`** proof; empty source | the reader before the numbers |
| §3 Numbers | `nextInt`; leftover line break, and **the fix as a proof** | needs `nextLine` from §2 |
| §4 Interactive program | read → compute → output; `"75"` bite; **`Integer.parseInt`** proof | the conversion, after reading numbers |
| §5 Bad input | `InputMismatchException` (word, range), `NumberFormatException` (decimal, space), locale | last: every way a parse fails |
| 6 / 7 | summary rows per new rule; a 10-row symptom → cause → fix table | read by the study profile |
| ✅ / 📚 | one check per objective; Predict box answered | after all mechanisms |

### Unverified

- _None._

### Fact-check

A separate pass over the FINISHED draft, as a checker: every number, name, version, code line and
cite. Only what changed or was flagged is listed.

| Claim | Verdict | Fix |
|---|---|---|
| Draft: "The Run button uses US English" | VERIFY — the sandbox's locale was not observed; only the proof machine's (`user.language = en`, `user.country = US`) | "The outputs on this page come from a computer set to US English" |
| Draft `%` non-example: `50` on its own line, then the exception | WRONG — `prove.py` mismatch; the real run prints `50Exception in thread …` on one line, since nothing ended the line | pasted the real output; one sentence explains it |
| "`nextInt()` accepts only something that *is* an `int`; a word or a decimal makes it throw" | OK, incomplete — out-of-range numbers throw too [2] (run) | adds "or a number past `2147483647`" |
| "`%n` is the portable newline" | OK — "the platform-specific line separator" [1] | cited |
| "recover with try/catch (Tutorial 24)" | WRONG as a reference — a number, not a lesson | link to Exceptions |
| "a guard you'll write properly once you have conditionals in Tier 1" | WRONG as a reference | link to Conditionals |
| "(On this page the prompt and greeting appear together because the sandbox does not echo your keystrokes the way a terminal does …)" | OK — `prove.py` feeds stdin and removes the echo; unchanged in substance | reworded |
| German-locale behaviour | OK — runs with `-Duser.language=de -Duser.country=DE`: `nextDouble()` on `3.5` → `InputMismatchException`; `printf("%.2f%n", 3.14159)` → `3,14` | none |
| Quiz answers 1–4 and both `<details>` | OK — 1 from a run (`0.67`); 2 from the `next` proof; 3 from the `parseInt` proof; 4 from the `parseInt("3.5")` proof; `<details>` from the leftover-newline proofs and the Predict runs (`10 + 20 = 30`; `InputMismatchException`; `6.00`) | none |
| Every `Output:` block (17 fences, 4 fed typed input) | OK — `prove.py`: 17/17 | none |

### Review

Scored 1–5 before the fix, the single highest-impact fix named, scored again after. Every `After`
must reach 4.

| Criterion | Before | Highest-impact fix | After |
|---|---|---|---|
| accuracy — Accuracy & currency — every claim true now, sourced or derived | 4 — the claims held; two numbered cross-references; no sources | links; three API sources quoted from the JDK 21 source | 5 |
| clarity — Clarity for this reader — no term used before it is defined | 3 — "stream", "token", "specifier" undefined; a blockquote callout; mean 20+ words | define each at first use; the note as a callout; mean 13 words, longest 30 | 5 |
| sequence — Sequence — each section rests only on what came before it | 4 — sound order; `parseInt` appeared first as a failure | `parseInt` as the conversion in §4, before its failure in §5 | 5 |
| practice — Worked example, non-example, checks with hidden solutions | 3 — a bite per section; the leftover-newline fix unproved; no hidden answers | the fix as a proof, the bare-`%` non-example, four quizzes, two `<details>` | 5 |
| misconceptions — Misconceptions, edge cases, troubleshooting covered | 3 — six bullets; no `%%`, no range, no locale | a 10-row symptom → cause → fix table, one row per real message | 5 |
| actionability — Actionable — the reader can DO the objectives afterwards | 4 — the reader can write the skeleton; objectives implicit | five objectives, one check each | 4 — typed input is practised only through twins; the sandbox has no keyboard |

## What changed, and why

| Change | Why |
|---|---|
| Objectives line; ✅ (4 quizzes, 2 `<details>`); 📚 (3) | the /prepare contract |
| Intro: stream defined; the Run-button note as a 📘 callout | gaps 9, 10 |
| §1: `%%`; `%f` with an `int`; bare-`%` non-example | gaps 4, 5; fact-check row 2 |
| §2: token defined; `next` vs `nextLine` proof | gap 3 |
| §3: the leftover-newline fix as a proof | gap 2 |
| §4: `Integer.parseInt` / `Double.parseDouble` as the conversion | gap 1 |
| §5: out-of-range and leading-space failures; locale | gaps 6, 7, 8; fact-check rows 1, 3 |
| Gotcha checklist → 10-row troubleshooting table; mental-model rows updated | the /prepare shape |
| "Tutorial 3/4/24", "Tier 1/4" → links | gap 12 |
| Register: hedges ("just", "actually", "kind of") removed, paragraphs split | lint: 16 problems → 0 |
