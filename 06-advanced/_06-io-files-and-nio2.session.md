# I/O, Files & NIO.2 — preparation record

The /prepare chain for `06-advanced/06-io-files-and-nio2.md`, in order. Not rendered (the leading `_`). The lesson is edited in
place; this file is the evidence behind each change. Prepared 2026-09-29; every run on Temurin
21.0.12.1 (`/usr/libexec/java_home -v 21`), macOS/arm64. API text checked against the JDK 21
`src.zip` javadoc; JLS 21, the Object Serialization Specification and JEP 400 fetched the same
day.

## Research

### Audience

- *Holds already* (earlier lessons, never re-taught): `Scanner` and `System.in` (Input &
  Output); checked exceptions, `IOException`, `try`-with-resources, multi-exception `throws`
  (Exceptions); `List.of` (The Collections Framework); records and their canonical constructor
  (Enums & Records); nested classes and the binary name `Main$Point` (Nested & Anonymous
  Classes; Lambdas); `Stream`, `mapToInt`, `sorted` (Functional Java & the Streams API).
- *Must not be assumed* (defined where it first appears): **I/O**, **byte** vs **character**
  I/O, **charset**, **NIO.2**, `Path` operations, `Files`, **eager** vs lazy reading,
  `InputStream`/`OutputStream`/`Reader`/`Writer`, `BufferedReader`/`BufferedWriter`,
  `InputStreamReader`, **system call**, **buffering**, `Files.list`/`walk`, **serialization**,
  `Serializable`, `transient`, `serialVersionUID`, `ObjectInputFilter`.
- *The one thing an expert forgets a newcomer does not know:* a `Path` is only a name — nothing
  touches the disk until a `Files` method runs.

### Gaps in the chapter

Four lenses, most severe first: prerequisite, step, edge, structure. Coverage map rows: 9.2
(serialize and deserialize objects) **GAP**, M — filled here as §7, with the security warning;
9.1 (console and file I/O with I/O streams) `partial` — console input with `BufferedReader`,
and readers/writers, filled in §5; 9.3 (`Path` and `java.nio.file`) `covered` — re-checked:
`Path` operations and `Files.walk`/`list` (L) were absent, filled in §1 and §6.

| Gap | Kind | Filled where | Source |
|---|---|---|---|
| Serialization taught nowhere (coverage map 9.2, GAP) | step | new §7: round trip with `transient`, `NotSerializableException`, records through the canonical constructor, the security warning; quiz 6 | `Serializable` [5], JLS §8.3.1.3 [6], `ObjectInputStream` [7], `ObjectInputFilter` [8], Serialization Spec §3.1 [10]; runs |
| Console input beyond `Scanner`; readers and writers (coverage 9.1) | step | new §5: the four `java.io` families; `newBufferedWriter`/`newBufferedReader`; `BufferedReader` over `System.in` (stdin proof) and its `StringReader` twin; quiz 4 | `java.io` package [4]; runs |
| "Orders of magnitude slower" unbuffered I/O asserted | edge | §5 timing fence: 980–1168 ms vs 32–41 ms | runs ×3 |
| The charset mismatch ("reading UTF-8 bytes as if they were Latin-1 mangles `é`") asserted | edge | §4 fence: `CafÃ©`, then `MalformedInputException: Input length = 1`; quiz 3 | JEP 400 [3]; run |
| `Files.list`/`walk` absent (coverage 9.3, L) | step | new §6 fence with sorted output; quiz 5 | `Files` [1], `DirectoryStream` [9]; run |
| `Path` operations absent (coverage 9.3) | step | §1 fence: `resolve`, `normalize`, `getFileName`, `getParent`, `relativize` | `Path` API [2]; run |
| "Tutorial 28", a dead reference (twice) | structure | links to Functional Java & the Streams API | — |
| No objectives, checks or sources; gotchas as bullets; the 🧪 box unanswered | structure | objectives; ✅ (6 quizzes, 1 `<details>` with a proved fence); 11-row table; 📚 (11) | `/prepare` chain |

### Plan

| Section | Carries | Why here |
|---|---|---|
| Intro + objectives | byte vs character as a list; five objectives | the reader's map |
| §1 `Path` and `Files` | the kept fences; `Path` operations | the API every later section uses |
| §2 Reading lines | the kept fence; the API's "not intended for … very large files" | eager reading |
| §3 The name clash | the kept fence; the `Files.lines` close requirement quoted | lazy reading |
| §4 Bytes vs characters | the kept `Café` fence; JEP 400; **non-example** the wrong charset | text is bytes |
| §5 Readers, writers, console, buffering (new) | the four families; buffered file I/O; console with stdin and its twin; timing | the classes under `Files` |
| §6 Directories (new) | `list` vs `walk`, sorted | `Path` streams, after §3's close rule |
| §7 Serialization (new) | round trip; **non-example** `NotSerializableException`; records; the warning | last: needs byte streams (§5) and records |
| 8 / 9 | summary rows per rule; an 11-row symptom → cause → fix table | read by the study profile |
| ✅ / 📚 | one check per objective; the Predict box answered with a proved fence | after all mechanisms |

### Unverified

- _None._

### Fact-check

A separate pass over the FINISHED draft, as a checker: every number, name, version, code line and
cite. Only what changed or was flagged is listed.

| Claim | Verdict | Fix |
|---|---|---|
| "buffering (`BufferedReader`/`BufferedWriter`, which `Files` methods use internally)" | VERIFY — an implementation claim, unsourced; `readString` reads the whole file in one go | "`Files.newBufferedReader`/`newBufferedWriter` open one"; no claim about internals |
| "unbuffered, one-byte-at-a-time I/O is orders of magnitude slower" | WRONG in degree — measured about 30 times slower on 2 MB | "about 30 times faster with a buffer", with the three runs |
| "(The default has been UTF-8 since JDK 18 …)" | VERIFY — was uncited | JEP 400, release 18 [3]; the `Files` methods' own UTF-8 default quoted [1] |
| "(serialization … is now discouraged for its security and versioning pitfalls; prefer an explicit format like JSON)" | VERIFY — unsourced | the `ObjectInputStream` warning quoted [7]; §7 written |
| "`Files.lines` … must be closed" | OK — the API: "must be used within a try-with-resources statement or similar control structure" [1] | quoted |
| "readAllLines … can exhaust the heap" | OK — the API says `readString` "is not intended for reading very large files" [1] | quoted |
| "A `Path` is just a value … doesn't touch the disk" | OK — run: `Path` operations on directories that do not exist printed without error | shown |
| "Tutorial 28" | WRONG as a reference | links |
| Every `Output:`, stdin and exception block (16 fences) | OK — `prove.py`: proved 15, illustrative 1; the console fence fed `Ada` on stdin | none |
| Quiz answers and the `<details>` | OK — quiz 1 from the §1 non-example; 2 from the `Files.lines` API; 3 from the charset fence; 4 from the §5 fences; 5 from the walk fence; 6 from the serialization fence; the `<details>` fence proved (`5`, `3`, `14`) | none |

### Review

Scored 1–5 before the fix, the single highest-impact fix named, scored again after. Every `After`
must reach 4.

| Criterion | Before | Highest-impact fix | After |
|---|---|---|---|
| accuracy — Accuracy & currency — every claim true now, sourced or derived | 3 — "orders of magnitude"; unsourced internals, UTF-8 history and serialization advice; dead references; no sources | each fixed or quoted; eleven primary sources; every fence proved | 5 |
| clarity — Clarity for this reader — no term used before it is defined | 3 — a 5-sentence intro; sentences to 45 words; *system call* undefined | lists; defined at first use; mean 13 words, longest 29 | 5 |
| sequence — Sequence — each section rests only on what came before it | 4 — buffering mentioned inside §4 with no classes shown | §5 introduces the classes before the timing | 5 |
| practice — Worked example, non-example, checks with hidden solutions | 3 — one non-example (`NoSuchFileException`); no checks | ten new fences, three non-examples; six quizzes; a `<details>` with a proof | 5 |
| misconceptions — Misconceptions, edge cases, troubleshooting covered | 3 — five bullets; charset errors only described | an 11-row table with the real messages | 5 |
| actionability — Actionable — the reader can DO the objectives afterwards | 2 — serialization (exam 9.2) and console `BufferedReader` (9.1) absent | §5 and §7; five objectives with a check each | 5 |

## What changed, and why

| Change | Why |
|---|---|
| Objectives line; ✅ (6 quizzes, 1 `<details>`); 📚 (11); TOC extended to 11 entries | the /prepare contract |
| Intro as lists; summary names the new parts | register |
| §1: `Path` operations fence | gap 6 |
| §2, §3: the API sentences quoted; "Tutorial 28" → links | gap 7; fact-check rows 5–6, 8 |
| §4: JEP 400 cited; the wrong-charset fence | gap 4; fact-check row 3 |
| New §5: readers and writers; buffered file I/O; console `BufferedReader` and its twin; the timing | gaps 2, 3; fact-check rows 1, 2 |
| New §6: `Files.list` and `Files.walk` | gap 5 |
| New §7: serialization, `transient`, `NotSerializableException`, records, the security warning | gap 1 (coverage map 9.2); fact-check row 4 |
| Gotcha checklist → 11-row troubleshooting table; mental-model rows added | the /prepare shape |
| Predict box as a numbered list, answered in `<details>` with a proved fence | the /prepare shape |
| Register: long sentences split, walls of prose turned into lists, hedges removed ("actually", "just", "really") | lint: 14 register problems → 0 |
