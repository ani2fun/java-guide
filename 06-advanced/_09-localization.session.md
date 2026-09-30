# Localization — preparation record

The /prepare chain for `06-advanced/09-localization.md`, in order. Not rendered (the leading `_`). This is a **new
lesson**, written after the loop (RUNBOOK §8) to fill coverage-map row 10.1, so "Before" in the review scores the first
full draft. Prepared 2026-09-30; every run on Temurin 21.0.12.1 (`/usr/libexec/java_home -v 21`), one comparison run on
Temurin 17.0.4.1; the Java SE 21 API fetched from docs.oracle.com, and JEPs 226 and 252 and JDK-8284840 from openjdk.org,
the same day. Every Output block was filled by running the fence's own code and pasting its output
(the CLDR no-break spaces cannot be typed faithfully by hand).

## Research

### Audience

- *Holds already* (earlier lessons, never re-taught): `LocalDate`, `LocalTime`,
  `LocalDateTime`, `ZonedDateTime`, pattern formatters and ISO-8601 (Dates & Times);
  static nested classes (Nested & Anonymous Classes; Lambdas); `extends` and abstract methods
  (Inheritance; Abstract Classes & Interfaces); checked vs unchecked exceptions and `throws`
  (Exceptions); the classpath and `java -cp` (Packages, Modules & the Build); `String.format`
  and `printf` (Input & Output).
- *Must not be assumed* (defined where it first appears): **localization**, **`Locale`**,
  language and country codes, **language tag**, BCP 47, `Locale.ROOT` and `und`, **default
  locale**, CLDR, **no-break space** (U+00A0, U+202F), ISO 4217, half-even rounding,
  `FormatStyle`, **`ResourceBundle`**, **base name**, **base bundle**, parent bundle,
  `ListResourceBundle`, `.properties` bundle, **`MessageFormat`**, placeholder, quoted section,
  `choice`.
- *The one thing an expert forgets a newcomer does not know:* a method with no locale argument
  still uses a locale, the machine's, and so behaves differently on another machine.

### Gaps in the chapter

Four lenses, most severe first. Coverage map row 10.1 (locales, resource bundles, formatting
messages, dates, times, numbers, currency, percentages) was `GAP` M with no lesson anywhere; this
lesson is the fill, placed after Dates & Times exists. Every candidate example was run on JDK 21
before it was placed.

| Gap | Kind | Filled where | Source |
|---|---|---|---|
| The book teaches no locale-sensitive API (coverage map 10.1) | structure | the whole lesson, as 06-advanced/09 | 1Z0-830 objective 10.1; `_prepare/coverage-map.md` |
| `getBundle` falls back to the **default** locale before the base bundle | edge | §4 bite (a German request answered in French); `getNoFallbackControl`; quiz 3; Predict box | `ResourceBundle.getBundle` [5]; runs |
| Default-locale output in text for programs (a decimal comma in CSV; Turkish `i`) | edge | §6; quiz 2; gotcha rows | `String.format` [11], `String.toLowerCase` [12]; run |
| CLDR no-break spaces make formatted text unequal to typed text | edge | §2 bite (`U+202F U+00A0`); gotcha row | JEP 252 [9]; run |
| `parse` is locale-sensitive and stops early (`"1,234"` → `1.234` in France; `"12abc"` → `12`) | edge | §2; `<details>` check; gotcha rows | `NumberFormat.parse` [2]; run |
| JDK 20+ puts U+202F before `PM`, so parsing typed times fails | edge | §3 non-example; gotcha row | JDK-8284840 [10]; runs on JDK 21 (fails) and JDK 17 (U+0020, parses) |
| The apostrophe trap in `MessageFormat`; ungrouped years | edge | §5 bite; quiz 4; gotcha rows | `MessageFormat` [8]; run |
| A currency formatter's currency comes from the locale, not the data | edge | §2 (`$1,234.50` for a euro price); `setCurrency`; gotcha row | `Currency` [3]; run |
| `forLanguageTag("fr_FR")` returns the empty locale silently | edge | §1 non-example; gotcha row | `Locale.forLanguageTag` [1]; run |
| `FULL`/`LONG` date-time styles need a zone | edge | §3 bite; gotcha row | `DateTimeFormatter.ofLocalizedDateTime` [4]; runs (`FULL` and `LONG`) |
| Resource bundles need several files, and the sandbox runs one | prerequisite | `ListResourceBundle` as nested classes for the runnable fences; a real `.properties` session in the terminal | `ListResourceBundle` [6], `PropertyResourceBundle` [7], JEP 226 [13]; run in the shell |
| Plurals | step | §5 `choice` fence | `MessageFormat` [8]; run |
| Half-even rounding and compact numbers | edge | §2 list; gotcha row | `NumberFormat` [2]; run |

### Plan

| Section | Carries | Why here |
|---|---|---|
| Intro + objectives | the same number and date in three countries; the four tools; the people-vs-programs rule | the problem before any API |
| §1 Locales | parts, tags, three ways to build one; display names; `ROOT`; the default locale (illustrative); **non-example** underscore tag | every later API takes a `Locale` |
| §2 Numbers, money, percentages | `NumberFormat` in four locales; **bite** no-break spaces; parsing; currency and `setCurrency`; half-even; compact | the simplest locale-sensitive output |
| §3 Dates and times | `ofLocalizedDate` styles in three locales; **bite** `FULL` needs a zone; **non-example** parsing a typed `3:30 PM` | builds on Dates & Times and on §2's no-break spaces |
| §4 Resource bundles | base name, family, parents; `ListResourceBundle` fences; **bite** default-locale fallback; `MissingResourceException`; `.properties` terminal session | translated words, after the formatted values |
| §5 `MessageFormat` | placeholders and word order; types and styles; **bite** apostrophes and `2,024`; `choice` plurals | combines §2's numbers with §4's bundle text |
| §6 Default locale in ordinary code | `String.format` in CSV; Turkish case mapping; `Locale.ROOT` | last: the rule the whole lesson earns |
| 7 Mental-model summary | 11 rows | the study profile reads this heading |
| 8 Gotcha checklist | 14 rows, each message from a run | the study profile reads this heading |
| ✅ Check yourself | four quizzes and one `<details>` | after all mechanisms |
| 📚 Sources | thirteen primary sources | last |

### Unverified

- _None._

### Fact-check

A separate pass over the FINISHED draft, as a checker: every number, name, version, code line and
cite. Only what changed or was flagged is listed.

| Claim | Verdict | Fix |
|---|---|---|
| "`forLanguageTag` … never throws" | WRONG — it throws `NullPointerException` for `null` [1] | "A bad tag never makes it throw" |
| "In some locales the `FULL` and `LONG` *time* patterns include the time-zone name" | WRONG in part — the API says the `FULL` and `LONG` date-time styles "typically require a time-zone" [4]; `LONG` fails on a `LocalDateTime` in `Locale.US` too (run) | quotes the API; notes that `LONG` fails the same way |
| "Code that worked on JDK 17 fails on JDK 21" | VERIFY — was not run | run on Temurin 17.0.4.1: `3:30 PM U+0020`, and `"3:30 PM"` parses to `15:30`; the text now states both runs |
| "Since Java 9, these files are read as UTF-8" | VERIFY — the version was uncited | cited JEP 226 [13] |
| "A currency formatter takes its currency from the locale's country" | VERIFY — was uncited | cited `Currency` [3] (`getInstance(Locale)` gives the currency of the locale's country) |
| "`#` means from this value and `<` means above this value" | VERIFY — was uncited | cited `MessageFormat` [8] (`choice` subformat) |
| "`MissingResourceException`" is unchecked | OK — `javap`: it extends `java.lang.RuntimeException` | none |
| `ListResourceBundle.getContents()` is abstract | OK — `javap -p`: `protected abstract java.lang.Object[][] getContents()` | none |
| The `.properties` terminal session | OK — run in the shell on JDK 21 (`Bonjour, ça va ?`, `Goodbye`); a Latin-1 file also printed `ç`, as [7] describes | none |
| Quiz answers 1–4 and the `<details>` | OK — runs: `1.234,5`; the CSV comma from §6; `Bonjour` from `Messages_fr` (§4 bite); `Its {0}`; `NumberFormat.getInstance(Locale.US).parse("1,234")` = `1234` | none |
| Predict box (`Allo, Au revoir (bundle fr_CA)` with default `fr_CA`) | OK — run 2026-09-30 | none |
| Every Output block (17 fences) | OK — `prove.py`: 16 proved, 1 illustrative | none |
| Locale data the sandbox's JDK 21 build could disagree on | FLAG — outputs were proved on 21.0.12.1 only; a sandbox on another JDK 21 update could carry other CLDR data. No output depends on the machine's default locale except the illustrative fence: every other fence passes a locale or sets the default | the running-app check (Run on each fence) is the confirmation |

### Review

Scored 1–5 on the first full draft, the single highest-impact fix named, scored again after. Every
`After` must reach 4.

| Criterion | Before | Highest-impact fix | After |
|---|---|---|---|
| accuracy — Accuracy & currency — every claim true now, sourced or derived | 3 — two claims wrong ("never throws"; `FULL`/`LONG` *time* patterns), one unrun (JDK 17), three uncited | fixed from the API and a JDK 17 run; 13 primary sources | 5 |
| clarity — Clarity for this reader — no term used before it is defined | 4 — two paragraphs ran to five sentences; one source line of 45 words | split into bullets; every new term defined at first use | 5 |
| sequence — Sequence — each section rests only on what came before it | 5 — numbers before dates before words before sentences; the chapter's earlier lessons supply nested classes, abstract methods and checked exceptions | none needed | 5 |
| practice — Worked example, non-example, checks with hidden solutions | 5 — each section has a worked example and a non-example or bite; five checks; a Predict box | none needed | 5 |
| misconceptions — Misconceptions, edge cases, troubleshooting covered | 4 — the `LONG` style was left out of the zone bite | named in the bite; 14 gotcha rows, each message from a run | 5 |
| actionability — Actionable — the reader can DO the objectives afterwards | 4 — bundle files are only shown as a terminal session; the sandbox cannot run several files | the `ListResourceBundle` fences make every lookup rule runnable | 4 — writing a `.properties` file is practised only outside the sandbox |

## What changed, and why

| Change | Why |
|---|---|
| New lesson `06-advanced/09-localization.md`: 6 sections, 17 proved fences, 5 checks, 13 sources | coverage map 10.1 was a `GAP` M: no lesson taught locales, bundles or `MessageFormat` |
| `06-advanced/00-index.md`: nine lessons, the new entry, the summary | the chapter index lists every lesson |
| `_prepare/coverage-map.md` row 10.1 → covered; the Part 3 summary names both new lessons | the last gap is filled |
| Register: two walls split into bullets, one 45-word source line cut | lint: 3 problems → 0 |
