# Arrays — preparation record

The /prepare chain for `02-control-flow/05-arrays.md`, in order. Not rendered (the leading `_`). The lesson is edited in
place; this file is the evidence behind each change. Prepared 2026-09-28; every run on Temurin
21.0.12.1 (`/usr/libexec/java_home -v 21`), JLS 21, JVMS 21 and the JDK 21 API fetched the same day.

## Research

### Audience

- *Holds already* (earlier lessons, never re-taught): `main(String[] args)` (named in lesson 01
  as "a list of text arguments"), `import` (Input & Output), `int`/`double`/`boolean`/`String`,
  `.equals` vs `==` on strings, `s.length()`, a thrown exception and its message, the four loops,
  the enhanced `for` and its copy, loop boundaries and off-by-one, nested loops, accumulators,
  O(N) as a name for "work grows with the size".
- *Must not be assumed* (defined where it first appears): array, index, slot, **default value**,
  literal (for arrays), **`null`** (pointed forward), row, **jagged**, field (for `length`), hash
  code (named only), sharing (pointed forward to References).
- *The one thing an expert forgets a newcomer does not know:* `System.out.println(a)` on an
  array prints `[I@…`, not the values — the first thing a reader tries.

### Gaps in the chapter

Four lenses, most severe first: prerequisite, step, edge, structure. Coverage map: JLS 10 is
`covered`; row 5.1 (arrays and collections, sorting) is `partial` H, with its fill (sorting,
`Deque`) assigned to 04-core-libraries — not written here.

| Gap | Kind | Filled where | Source |
|---|---|---|---|
| `println(a)` prints `[I@2a139a55`; `Arrays.toString` never shown | edge | §1, an illustrative run and the `toString` proof; gotcha row | `Object.toString` [5], `Class.getName` ("`[[[[[[[I`"), `Arrays` [4]; runs |
| `b = a` shares the array; the reader's first "copy" is wrong | edge | §5 non-example, proved (`99`); gotcha row | runs; link to References |
| `==` on arrays compares identity; `Arrays.equals` | edge | §5, a proof (`false` / `true`); quiz 5; gotcha row | `Arrays.equals` [4]; run |
| "Allocate a bigger array and copy" was stated, never shown | step | §5, an `Arrays.copyOf` proof (`[1, 2, 3, 4, 0]`) | `Arrays.copyOf` ("truncating or padding with zeros") [4]; run |
| A literal assigned after the declaration: `illegal start of expression`; `new int[3] {…}` refused | edge | §1 non-example, proved; the `new int[] {…}` fix (run: `3`); gotcha rows | JLS §10.6 [1]; runs |
| Defaults stated for four types, shown for `int` only; `null` unnamed | step | §1, a proof (`0.0` / `false` / `null`); quiz 1 | JLS §4.12.5 [2]; run |
| The for-each copy bite was a claim in prose, with no run | step | §1 `Arrays.toString` proof (`[5, 10, 15]` then `[0, 0, 0]`), referred to from §3 | JLS §14.14.2 [7]; run |
| Walking backwards (the Predict box's task) never taught; its two wrong headers | step | §3 prose; quiz 3; gotcha row | runs (`4 3 2 1`; `Index 4 out of bounds`; `4 3 2`) |
| `String[] args` is an array the reader has had since lesson 01 | prerequisite | §1, a proof (`0`) | run |
| `new int[rows][cols]` recommended, never shown | step | §4, a proof (`3` / `4` / `0`) | run |
| Negative index and negative size | edge | §2 prose (`Index -1 …`); gotcha row (`NegativeArraySizeException: -1`) | JLS §10.4 [6], §15.10.2; runs |
| No objectives, checks or sources; the Predict box unanswered; gotchas were bullets; "Tier 3", "Tutorial 17" | structure | objectives; ✅ (5 quizzes, 1 `<details>`); 📚 (8); 13-row table; links to The Collections Framework | `/prepare` chain |

### Plan

| Section | Carries | Why here |
|---|---|---|
| Intro + objectives | the two defining properties as a list; five objectives | the reader's map |
| §1 Creating | two forms; `args`; defaults by type; **non-example** literal assigned later; printing with `Arrays.toString` (and the copy proof it makes visible) | a reader must see an array before anything else |
| §2 Indexing | read/write; the bounds check (JLS, not memory offsets); negative index | needs an array from §1 |
| §3 Iterating | classic vs enhanced; write-back; backwards | needs indexing |
| §4 2D | grid; rectangle; jagged bite | needs iteration and nesting |
| §5 Not growable | `length()` bite; `copyOf`; **non-example** `b = a`; `==` vs `Arrays.equals` | the limit, then the workarounds |
| 6 / 7 | summary rows per rule; a 13-row symptom → cause → fix table | read by the study profile |
| ✅ / 📚 | one check per objective; the Predict box answered | after all mechanisms |

### Unverified

- _None._

### Fact-check

A separate pass over the FINISHED draft, as a checker: every number, name, version, code line and
cite. Only what changed or was flagged is listed.

| Claim | Verdict | Fix |
|---|---|---|
| "a single block of memory … laid out contiguously" (also in the frontmatter summary); "slot `i` lives at a fixed offset from the start" | WRONG as a Java guarantee — JVMS §2.7: the JVM "does not mandate any particular internal structure for objects" [3] | "How the slots sit in memory is the JVM's business"; "contiguous" dropped from the summary |
| "it cannot let you read or write memory outside the array" | overstated in memory terms | JLS §10.4 wording: every access is checked at run time [6] |
| "the growable collections of Tier 3", "(Tutorial 17)", "an `ArrayList` (Tier 3)" | WRONG as references | links to The Collections Framework |
| "O(n) copying" | register — `n` was never a named size | "O(N) work" |
| "`[I` is Java's name for 'array of `int`'" | VERIFY | `Class.getName` javadoc: `(new int[3][4]…).getClass().getName()` returns `"[[[[[[[I"` |
| `a = new int[] {1, 2, 3};` "compiles and prints `3`" | OK — run | none |
| "`new int[3] {1, 2, 3}` is rejected with `array creation with both dimension expression and initialization is illegal`" | OK — run | none |
| "`a[-1]` fails … `Index -1 out of bounds for length 3`" | OK — run | none |
| `NegativeArraySizeException: -1` (gotcha row) | OK — run; JLS §15.10.2 | none |
| "The Run button types none, so it is empty" (`args.length` is `0`) | OK — the sandbox runs `java -cp . Main` with no arguments (CLAUDE.md C1); `prove.py` proves `0` | none |
| Every `Output:` and `Compiler error:` block (16 fences, one illustrative) | OK — `prove.py`: 16/16 | none |
| Quiz answers and the `<details>` | OK — quiz 1 from a run (`0.0`); quiz 2 from the §2 proof (`a[3]` on length 3); quiz 3 from runs (`4 3 2 1`; `Index 4 out of bounds for length 4`; `4 3 2`); quiz 4 from a run (`3`); quiz 5 from the §5 proof; `<details>` from runs (`4`, `0`, `Index 4 …`, `15`, `Index 2 out of bounds for length 2`, `4 3 2 1`) | none |

### Review

Scored 1–5 before the fix, the single highest-impact fix named, scored again after. Every `After`
must reach 4.

| Criterion | Before | Highest-impact fix | After |
|---|---|---|---|
| accuracy — Accuracy & currency — every claim true now, sourced or derived | 3 — memory layout asserted as a guarantee; "Tier 3", "Tutorial 17"; no sources | JVMS §2.7 and JLS §10.4 wording; links; eight sources | 5 |
| clarity — Clarity for this reader — no term used before it is defined | 4 — a long intro paragraph; `null` unnamed | the properties as a list; `null` defined; mean 13 words, longest 26 | 5 |
| sequence — Sequence — each section rests only on what came before it | 4 — sound order; printing an array never taught, so later sections could not show one | `Arrays.toString` in §1, used after | 5 |
| practice — Worked example, non-example, checks with hidden solutions | 3 — a bite per section; the copy and write-back claims unrun; no hidden answers | the literal, `b = a` and backwards cases; five quizzes; a `<details>` | 5 |
| misconceptions — Misconceptions, edge cases, troubleshooting covered | 3 — six bullets; no `[I@`, no aliasing, no `==` | a 13-row symptom → cause → fix table, one row per real message | 5 |
| actionability — Actionable — the reader can DO the objectives afterwards | 4 — the reader can index and loop; could not print, copy or compare | `toString`, `copyOf` and `equals` proofs; five objectives with a check each | 5 |

## What changed, and why

| Change | Why |
|---|---|
| Objectives line; ✅ (5 quizzes, 1 `<details>`); 📚 (8) | the /prepare contract |
| Frontmatter summary and §1 mechanism: no memory-layout claim | fact-check row 1 |
| Intro: the defining properties as a list; the collections link | lint; fact-check row 3 |
| §1: `args`; defaults by type and `null`; the literal-later non-example; `[I@…` and `Arrays.toString`, with the write-back proof | gaps 1, 5, 6, 7, 9 |
| §2: the JLS bounds-check wording; negative index | gap 11; fact-check row 2 |
| §3: the write-back bite now points at a run; backwards traversal | gaps 7, 8 |
| §4: `new int[rows][cols]` proof | gap 10 |
| §5: `Arrays.copyOf`; the `b = a` non-example; `==` vs `Arrays.equals`; links | gaps 2, 3, 4; fact-check rows 3, 4 |
| Gotcha checklist → 13-row troubleshooting table; mental-model rows updated | the /prepare shape |
| Predict box as a numbered list, answered in `<details>` | the /prepare shape |
| Register: hedges ("actually", "just", "really", "simply") removed, long sentences split | lint: 20 problems → 0 |
