# Dates & Times — preparation record

The /prepare chain for `04-core-libraries/07-dates-and-times.md`, in order. Not rendered (the leading `_`). This is a
**new lesson**, written after the loop (RUNBOOK §8) to fill coverage-map row 1.4, so "Before" in the review scores the
first full draft. Prepared 2026-09-30; every run on Temurin 21.0.12.1 (`/usr/libexec/java_home -v 21`), the Java SE 21
API fetched from docs.oracle.com and JEP 150 from openjdk.org the same day.

## Research

### Audience

- *Holds already* (earlier lessons, never re-taught): String immutability and the discarded
  `toUpperCase()` result (Strings, the Basics); `static` factory style `List.of`, `ArrayList`,
  `Collections.sort` and natural ordering (The Collections Framework); the `equals` contract
  (equals & hashCode); enums, `==` and `switch` on enum constants (Enums & Records); `for` loops;
  a run-time exception stops the program (What Java Is & Running Code).
- *Must not be assumed* (defined where it first appears): **local** (no place attached),
  ISO-8601, static factory `of`, **immutable** as applied here, `ChronoUnit`, `Period`,
  `Duration`, **epoch**, UTC, `ZoneId`, **offset**, **gap**, **overlap**, local vs instant
  time-line, `DateTimeFormatter`, **pattern**, `Locale`, **resolver style**, week-based year.
  Not taught yet and therefore not used: `try`/`catch` (Exceptions, next chapter), interfaces
  such as `Temporal`, threads, streams.
- *The one thing an expert forgets a newcomer does not know:* "one day later" and "24 hours
  later" are different answers, and the API makes you choose.

### Gaps in the chapter

Four lenses, most severe first. Coverage map row 1.4 (Date-Time API: date, time, duration,
period, instant, time zones, daylight saving time) was `GAP` H with no lesson anywhere; this
lesson is the fill. Every candidate example was run on JDK 21 before it was placed.

| Gap | Kind | Filled where | Source |
|---|---|---|---|
| The book teaches no date or time type at all (coverage map 1.4) | structure | the whole lesson, placed as 04/07 after Enums & Records | 1Z0-830 objective 1.4; `_prepare/coverage-map.md` |
| Month arithmetic clamps to the last valid day, and stepping month by month drifts | edge | §2 table of `plusMonths` results; the billing non-example; quiz 1; gotcha row | `LocalDate.plusMonths` [2]; runs |
| `Period.getDays()` is the leftover days, not the total | edge | §3 (`14` vs `74`); gotcha row | `Period.between` [3]; run |
| `Duration` between two `LocalDate`s throws `Unsupported unit: Seconds` | edge | §3 bite; gotcha row | `Duration.between` [4]; run |
| Discarding the result of `plusDays` | edge | §1 non-example; `<details>` check | `LocalDate` immutable [2]; run |
| Same moment in two zones is not `equals` | edge | §4 non-example; gotcha row | `ChronoZonedDateTime` [8]; run |
| DST gap and overlap resolution | step | §5 fence (03:30; `-04:00`, `-05:00`); quiz 3 | `ZonedDateTime` [7]; runs |
| `plusDays(1)` vs `plusHours(24)` across DST; `Period` vs `Duration` added to a `ZonedDateTime` | step | §5 bite (09:00, 10:00, `PT23H`); quiz 2; Predict box (09:00, 08:00, `PT25H`) | `ZonedDateTime` [7], `Period` [3]; runs |
| Pattern-letter traps `mm`, `hh`, `YYYY` | edge | §6 bite; quiz 4; gotcha rows | `DateTimeFormatter` [9]; run |
| `SMART` resolver turns 31 February into 29 February; `STRICT` needs `uuuu` | edge | §6 fence; gotcha row | `ResolverStyle` [10]; runs (`Unable to obtain LocalDate` with `yyyy`) |
| Unknown zone ID; three-letter abbreviations | edge | §4 bite; gotcha row | `ZoneId` [6]; runs (`PST` throws; `of("PST", SHORT_IDS)` works) |
| Legacy `Date`/`Calendar` met in old code: mutable, months from 0 | prerequisite | §4 "The older classes" fence; conversion both ways | JEP 150 [1], `Calendar` [11]; run |
| Default locale changes month names between machines | edge | §6 analysis; gotcha row | `DateTimeFormatter.ofPattern` [9] |

### Plan

| Section | Carries | Why here |
|---|---|---|
| Intro + objectives | the three questions (calendar, moment, amount); core-idea box; links to what the lesson uses | the reader picks a type by question before meeting any type |
| §1 Local dates and times | `LocalDate`/`LocalTime`/`LocalDateTime`, `of`, getters, enums; `now()` as illustrative; invalid date bite; **non-example** discarded `plusDays` | the simplest types first; immutability before any arithmetic |
| §2 Date arithmetic | `plus*`; month-end clamp; **non-example** drifting billing date; comparing, `ChronoUnit.between`, sorting | needs §1's immutability |
| §3 `Period` and `Duration` | the two amount types; `getDays` trap; `Duration` on dates bite | needs §2's `ChronoUnit` for the contrast |
| §4 Moments | `Instant`, `ZoneId`, `ZonedDateTime`, offset; same-instant vs same-local; **non-example** `equals` vs `isEqual`; unknown zone ID; legacy classes | needs §1's local types to explain what a zone adds |
| §5 DST | gap and overlap; local vs instant time-line; `Period` vs `Duration` on a `ZonedDateTime` | needs §3's two amounts and §4's zones |
| §6 Formatting and parsing | pattern table; formatter with `Locale`; letter traps; **non-example** non-ISO parse; `SMART` vs `STRICT` | last: formatting any type from §1–§5 |
| 7 Mental-model summary | 11 rows | the study profile reads this heading |
| 8 Gotcha checklist | 14 rows, each message from a run | the study profile reads this heading |
| ✅ Check yourself | four quizzes and one `<details>`, one per objective | after all mechanisms |
| 📚 Sources | eleven primary sources | last |

### Unverified

- _None._

### Fact-check

A separate pass over the FINISHED draft, as a checker: every number, name, version, code line and
cite. Only what changed or was flagged is listed.

| Claim | Verdict | Fix |
|---|---|---|
| "`plusMonths` … never throws" | WRONG — it throws `DateTimeException` "if the result exceeds the supported date range" [2] | "A missing day never makes it throw" |
| "`YYYY` … shows only in the last days of December" | WRONG — early January too: 1 January 2027 formats as `2026` under `Locale.UK` (run 2026-09-30) | "only in the few days around New Year"; gotcha row changed to match |
| "`between` counts complete units" | VERIFY — was uncited | cited `LocalDate.until` [2] ("the number of complete units between the two dates") |
| "`LocalDate.now()` reads today's date from the machine's clock" | VERIFY — incomplete: it also uses the default time zone | "…in its default time zone" |
| "A `Date` is a moment, not a date" | VERIFY — stated without support | "holds a moment, counted in milliseconds from the epoch"; the fence shows `new Date(0).toInstant()` is the epoch |
| "a date you … share between threads" | sequence — threads are taught in 06-advanced | "store in a list" |
| "None of these types has a public constructor" | OK — `javap -p`: `LocalDate`, `LocalTime`, `LocalDateTime` constructors are all `private` | none |
| New York 2024: clocks 02:00 → 03:00 on 10 March, 02:00 → 01:00 on 3 November | OK — the gap run gives `03:30-04:00`, the overlap run gives `-04:00`/`-05:00` | none |
| "a gap moves forward by the gap's length; an overlap takes the earlier offset" | OK — `ZonedDateTime` class description [7] | none |
| "`Period.ofDays(1)` gives 09:00; `Duration.ofDays(1)` gives 10:00" | OK — run 2026-09-30 | none |
| The Predict box answer (09:00, 08:00, `PT25H` from 2 November) | OK — run 2026-09-30 | none |
| "`ZoneId.of` accepts abbreviations only through a compatibility map" | OK — `ZoneId.of("PST")` throws `Unknown time-zone ID: PST`; `ZoneId.of("PST", ZoneId.SHORT_IDS)` prints `America/Los_Angeles` | none |
| "Under `STRICT`, `yyyy` … every parse fails with `Unable to obtain LocalDate`" | OK — run: `Text '05/03/2024' could not be parsed: Unable to obtain LocalDate from TemporalAccessor` | none |
| "Adding a `Duration` to a `LocalDate` fails the same way; a `Period` to a `LocalTime` fails with `Unsupported unit: Days`" | OK — runs | none |
| "JEP 150 calls them 'poor, mutable'" | OK — JEP 150 Motivation [1] | none |
| Quiz answers 1–4 | OK — each run 2026-09-30 (`2023-02-28`; 09:00 with `Period.ofDays(1)`; `2024-03-10T03:15-04:00`; `05/07/2024`) | none |
| Every `Output:` block (21 fences) | OK — `prove.py`: 20 proved, 1 illustrative | none |
| Zone data the sandbox's JDK 21 build could disagree on | OK — only zones with stable rules (New York 2024, Tokyo, Paris, Kolkata); `EST` avoided, as this JDK's tzdata rejects `ZoneId.of("EST")` | none |

### Review

Scored 1–5 on the first full draft, the single highest-impact fix named, scored again after. Every
`After` must reach 4.

| Criterion | Before | Highest-impact fix | After |
|---|---|---|---|
| accuracy — Accuracy & currency — every claim true now, sourced or derived | 4 — two overstatements (`plusMonths` "never throws"; `YYYY` "only in December") | fixed both from the API and a run; every claim past the lesson cites one of 11 primary sources | 5 |
| clarity — Clarity for this reader — no term used before it is defined | 4 — "threads" used before the chapter that teaches them | removed; every new term defined at first use | 5 |
| sequence — Sequence — each section rests only on what came before it | 4 — exceptions appear before the Exceptions lesson | each is framed as a run-time stop, as in What Java Is, with a link forward; no `try`/`catch` | 4 — the forward link is needed; the reader catches nothing yet |
| practice — Worked example, non-example, checks with hidden solutions | 5 — every section has a worked example and a non-example or bite; five checks; a Predict box with a runnable variation | none needed | 5 |
| misconceptions — Misconceptions, edge cases, troubleshooting covered | 4 — the `YYYY` row said "only in late December", which misses early January | corrected with the fact-check; 14 rows, each message from a run | 5 |
| actionability — Actionable — the reader can DO the objectives afterwards | 4 — objectives were six, one hidden in a `;` inside code | rephrased to five; one check each | 5 |

## What changed, and why

| Change | Why |
|---|---|
| New lesson `04-core-libraries/07-dates-and-times.md`: 6 sections, 21 proved fences, 5 checks, 11 sources | coverage map 1.4 was a `GAP` H: no lesson taught the Date-Time API |
| `04-core-libraries/00-index.md`: seven lessons, the new entry, the summary | the chapter index lists every lesson |
| `_prepare/coverage-map.md` row 1.4 → covered | the gap is filled |
| Register: two walls split into bullets, one 32-word sentence split | lint: 5 problems → 0 |
