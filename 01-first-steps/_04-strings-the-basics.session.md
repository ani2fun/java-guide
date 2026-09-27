# Strings, the Basics — preparation record

The /prepare chain for `01-first-steps/04-strings-the-basics.md`, in order. Not rendered (the
leading `_`). The lesson is edited in place; this file is the evidence behind each change.
Prepared 2026-09-27; every run on OpenJDK 21.0.10.

**Source access.** This session's network policy blocked `docs.oracle.com` and `openjdk.org`. The
`String` claims were checked against the OpenJDK 21 source javadoc (`java/lang/String.java`,
openjdk/jdk21u on raw.githubusercontent.com): "Strings are constant", `substring`'s "extends to
the character at index endIndex - 1", `indexOf`'s "-1 if there is no such occurrence", `trim`'s
"codepoint is less than or equal to 'U+0020'", `strip`'s "@since 11". JLS §3.10.5 was checked
against the page text quoted by a search index ("Strings computed by concatenation at run time
are newly created and therefore distinct"). For §3.10.7 the index returned no verbatim text; each
escape is proved by a run.

## Research

### Audience

- *Holds already* (lessons 01–03): statement, compile vs run time, a thrown exception and its
  first line, variable, type, `char` vs `String` literal quotes, `boolean` values, `int`,
  left-to-right order of operators, `char` arithmetic (`'A' + 1` is `66`).
- *Must not be assumed* (each defined where it first appears): **object** (the source used it
  undefined), method and calling one with a dot, reference type (named, linked), immutable,
  position counted from 0, **escape sequence**, whitespace, **sentinel**, concatenation, **`==`**
  (first use in the book; comparisons are taught in the next chapter), `new` (named, linked),
  String pool, constant expression.
- *The one thing an expert forgets a newcomer does not know:* a `"` inside a String ends it.
  The next lesson feeds `"36\nAda\n"` to a `Scanner`, and nothing had taught `\n`.

### Gaps in the chapter

Four lenses, most severe first. Coverage map 1.3 (text with `String`): covered; no row names a
gap for this lesson.

| Gap | Kind | Filled where | Source |
|---|---|---|---|
| Escape sequences never taught: how to put `"` in a String, and `\n` (used by lesson 05's `Scanner` example); an unescaped quote gives `')' or ',' expected` | prerequisite | §1 "Characters that need a backslash", a run proof and a compiler-error non-example; `<details>` 1; two troubleshooting rows | JLS §3.10.7 [2]; runs |
| `==` used before any lesson defines it | prerequisite | §5 opening: `==` compares values, `true`/`false`; for primitives, the values | run (`int a = 5, b = 5` → `true`) |
| "Object" and "method" used undefined in the first paragraph | prerequisite | intro | — |
| `substring(begin, end)` excludes `end`: the book's most common off-by-one, and only one-argument `substring` was shown | edge | §3, a run proof; quiz 1; troubleshooting row | `String` javadoc [1]; run |
| Text joined at run time is not pooled, even without `new` (`part + "lo"`); the lesson asserted it for "computed" strings with no proof | edge | §5 non-example, a proof | JLS §3.10.5 [4]; run |
| `char` + `char` before a String adds codes: `'J' + 'a' + "va"` is `171va` | edge | §4 non-example, a proof; troubleshooting row | lesson 03 (promotion); run |
| The Predict box turns on constant expressions being pooled, never explained | step | the Predict `<details>` | JLS §3.10.5 [4]; run (`true`, `true`, `false`, `true`) |
| `strip` vs `trim`: what differs, and why `strip` | edge | §3 analysis | `String` javadoc [1]; run (em space: `trim` → 8, `strip` → 6) |
| `equalsIgnoreCase` named; `.equals` is case-sensitive never shown | edge | troubleshooting row | run (`false`, `true`) |
| "Quadratic work" stated without a source; register wants `O(N²)` | step | §4 earned rule, cited | JLS §15.18.1 [3] |
| No objectives, checks or sources; Predict box unanswered; gotchas were bullets | structure | objectives, ✅ (4 quizzes, 2 `<details>`), 📚 (4), 10-row table | `/prepare` chain |
| "Tier 2", "Tier 3" (twice), "Tier 5" references | structure | links to the named lessons | — |

### Plan

| Section | Carries | Why here |
|---|---|---|
| Intro + objectives | object and method defined; the two consequences | the words every section uses |
| §1 Objects made of characters | `length`, `charAt`, positions from 0; **escape sequences**, with the **non-example** unescaped quote | writing a String comes before transforming it |
| §2 Immutability | new String per "edit"; ignored result; reassignment moves the variable, not the String | unchanged core, cited to the API |
| §3 Everyday methods | the toolkit; `strip` vs `trim`; **`substring(begin, end)`**; `indexOf`'s `-1` | positions from §1 |
| §4 Concatenation | left to right; parentheses; **non-example** `'J' + 'a' + "va"`; O(N²) in loops | needs lesson 03's `char` promotion |
| §5 `==` vs `.equals` | `==` defined; the pool; `new String`; **non-example** run-time join | last: needs objects, literals and `+` |
| 6 / 7 | summary rows per new rule; a 10-row symptom → cause → fix table | read by the study profile |
| ✅ / 📚 | one check per objective; Predict box answered | after all mechanisms |

### Unverified

- _None._

### Fact-check

A separate pass over the FINISHED draft, as a checker: every number, name, version, code line and
cite. Only what changed or was flagged is listed.

| Claim | Verdict | Fix |
|---|---|---|
| "typed-in or computed strings are not pooled" / draft "only literals are pooled" | WRONG in part — constant expressions (`"ja" + "va"`) are pooled too [4]; the Predict run gives `x == y` → `true` | "only literals and other constants are pooled"; the Predict `<details>` explains it |
| "No method mutates a String in place, because none can" | VERIFY — the API says "Strings are constant" [1]; "none can" overreaches | "No String method changes a String in place" |
| "`trim` is its older sibling" | VERIFY — incomplete: `trim` stops at U+0020, `strip` uses `Character.isWhitespace` [1] | explained, with "added in Java 11" |
| "building long text with `+` inside a loop … is quadratic work" | VERIFY — uncited | cited to §15.18.1 ("always creates a new String"); `O(N²)` |
| `'J' + 'a' + "va"` → `171va`; `"Ja" + 'v' + 'a'` → `Java` | OK — run 2026-09-27; `'J'` is 74, `'a'` is 97 | none |
| `substring(-1)` message `Range [-1, 5) out of bounds for length 5` (troubleshooting row) | OK — run of `"Hello".substring("Hello".indexOf("z"))` on JDK 21 | none |
| `"C:\new"` prints a line break | OK — run of `"C:\temp\new"` printed `C:`, a tab, `emp`, then `ew` on a new line | none |
| Quiz answers 1–4 and both `<details>` | OK — 1 from the `substring(0, 5)` proof; 2 from the §2 ignored-result proof; 3 from a run (`px23`, and `2 + 3 + "px"` → `5px`); 4 from the `typed` and run-time-join proofs; `<details>` from the unescaped-quote proof and the Predict run | none |
| Every `Output:` and `Compiler error:` block (15 fences) | OK — `prove.py`: 15/15 | none |

### Review

Scored 1–5 before the fix, the single highest-impact fix named, scored again after. Every `After`
must reach 4.

| Criterion | Before | Highest-impact fix | After |
|---|---|---|---|
| accuracy — Accuracy & currency — every claim true now, sourced or derived | 4 — the core claims hold; pooling overstated as "literals only", no sources | the constant-expression correction; four cites | 5 |
| clarity — Clarity for this reader — no term used before it is defined | 3 — "object", "method" and `==` undefined; mean 20+ words; 5-sentence paragraphs | define each at first use; split paragraphs; mean 13 words, longest 26 | 5 |
| sequence — Sequence — each section rests only on what came before it | 3 — the next lesson rests on `\n`, taught nowhere; `==` before comparisons | escapes in §1; `==` defined in §5 | 5 |
| practice — Worked example, non-example, checks with hidden solutions | 3 — a bite per section, no hidden answers | three non-examples (unescaped quote, `char` addition, run-time join), four quizzes, two `<details>` | 5 |
| misconceptions — Misconceptions, edge cases, troubleshooting covered | 3 — five bullets; no `substring` end, no escapes | a 10-row symptom → cause → fix table | 5 |
| actionability — Actionable — the reader can DO the objectives afterwards | 4 — the reader can use the methods; objectives implicit | five objectives, one check each | 5 |

## What changed, and why

| Change | Why |
|---|---|
| Objectives line; ✅ (4 quizzes, 2 `<details>`); 📚 (4) | the /prepare contract |
| Intro: object and method defined | gap 3 |
| §1: escape sequences, with a proof and a compiler-error non-example | gap 1 |
| §3: `substring(begin, end)`; `strip` vs `trim`; "sentinel" defined | gaps 4, 8; fact-check row 3 |
| §4: `'J' + 'a' + "va"` non-example; O(N²) cited | gaps 6, 10 |
| §5: `==` defined; `new` named; run-time join non-example; pooling of constants | gaps 2, 5, 7; fact-check row 1 |
| Gotcha checklist → 10-row troubleshooting table; mental-model rows for escapes and `substring` | the /prepare shape |
| "Tier 2/3/5" → links | gap 12 |
| Register: hedges ("actually", "kind of") removed, paragraphs split | lint: 21 problems → 0 |
