# References, Equality & the Object Model — preparation record

The /prepare chain for `03-classes-and-objects/04-references-equality-and-the-object-model.md`, in order. Not rendered (the leading `_`). The lesson is edited in
place; this file is the evidence behind each change. Prepared 2026-09-28; every run on Temurin
21 (`/usr/libexec/java_home -v 21`), JLS 21, JVMS 21 and the Java SE 21 API fetched from
docs.oracle.com the same day.

## Research

### Audience

- *Holds already* (earlier lessons, never re-taught): primitives and their ranges (Variables);
  `==` vs `.equals` on strings, named (Strings); short-circuit `&&` (Booleans & Logic); `b = a`
  shares an array, `Arrays.copyOf` (Arrays); pass-by-value of references (Methods); objects,
  default values (`null` for reference fields), aliasing (Classes & Objects); `static` fields
  (static vs Instance); the stack trace shape and `at Main.main(Main.java:N)` (What Java Is).
- *Must not be assumed* (defined where it first appears): **stack**, **frame**, **heap** (used
  undefined), reference as a pointer, identity, **wrapper class**, **boxing**, **unboxing** (the
  lesson said "autoboxes" undefined), interning, **constant expression**, dereference,
  **reachable**, garbage collector.
- *The one thing an expert forgets a newcomer does not know:* `.equals` is not "compare
  contents" by nature; it is whatever the class defines, and arrays define nothing.

### Gaps in the chapter

Four lenses, most severe first: prerequisite, step, edge, structure. Coverage map rows: 1.1
(wrapper classes) `partial` H — the wrapper and the `null`-unboxing NPE, where they touch this
lesson (the full wrapper section is planned for 04-core-libraries/02); 3.1 (object life cycle)
`partial` M — "When does an object become unreachable?" in this lesson; JLS 12 (Execution) —
the unreachable-objects half.

| Gap | Kind | Filled where | Source |
|---|---|---|---|
| `.equals` on arrays (and on a class that defines none) is identity: the lesson's rule "for meaning, you need `.equals`" fails right after its array example | edge | §2 non-example (`false` / `true` with `Arrays.equals`), proved; quiz 3; two gotcha rows | `Object.equals` API [6]; runs (arrays; `new Box(7)` twice: `false` / `false`) |
| The `null`-unboxing NPE (coverage map 1.1) | edge | §5 non-example, `Cannot invoke "java.lang.Integer.intValue()"`, proved; quiz 4; gotcha row | JLS §5.1.8 [8]; run |
| Wrapper class, boxing and unboxing used undefined ("autoboxes") | prerequisite | §3 opening | JLS §5.1.7 [7], §5.1.8 [8] |
| When an object becomes unreachable, and what the garbage collector does (coverage map 3.1, JLS 12) | structure | new §6: three ways to lose the last reference; a proof (`0 1`); a d2 heap diagram; the leak by a lingering reference; quiz 5 | JLS §12.6.1 [14]; JVMS §2.5.3 [3]; run |
| `Integer == int` unboxes and compares numbers | edge | §3 mechanism | JLS §15.21.1 [10]; run (`true`) |
| A computed string misses the pool | edge | §4 bite, proved (`false` / `true`) | JLS §3.10.5 [11]; run |
| `"hi".equals(s)` vs `s.equals("hi")` with `s` `null`; `Objects.equals` | edge | §5 prose; gotcha row | `Objects.equals` API [13]; run (`false`, `true`, then the NPE) |
| `==` between unrelated types does not compile | edge | §2 mechanism; gotcha row | JLS §15.21.3 [5]; run (`incomparable types: Integer and String`) |
| "Stack" and "heap" used with no definition or source | prerequisite | §1 | JVMS §2.5.2 [2], §2.5.3 [3] |
| No objectives, checks or sources; gotchas as bullets; "Tutorial 4/19/28"; the Predict box unanswered | structure | objectives; ✅ (5 quizzes, 1 `<details>`); 11-row table; 📚 (14); links to Strings, equals & hashCode, Modern Java Idioms | `/prepare` chain |

### Plan

| Section | Carries | Why here |
|---|---|---|
| Intro + objectives | primitive vs reference; the four surprises as a list; four objectives | the reader's map |
| §1 Two kinds of variable | pointer, stack, frame, heap; the proof and diagram | the model first |
| §2 `==` | identity; `incomparable types`; **non-example** `.equals` on arrays | the operator before the method |
| §3 Integer cache | wrapper, boxing, unboxing; the cache proof, with the range's guarantee stated exactly; `Integer == int` | needs identity from §2 |
| §4 String pool | interning literals and constant expressions; **non-example** a computed string | the same mechanism as §3 |
| §5 `null` | the NPE proof; helpful messages and `-g`; **non-example** unboxing `null`; `.equals` with `null` | needs unboxing from §3 |
| §6 Unreachable objects (new) | reachability; the `keep` proof; the diagram; the lingering-reference leak | the life-cycle end, after every way a reference can be used |
| 7 / 8 | summary rows per rule; an 11-row symptom → cause → fix table | read by the study profile |
| ✅ / 📚 | one check per objective; the Predict box answered | after all mechanisms |

### Unverified

- _None._

### Fact-check

A separate pass over the FINISHED draft, as a checker: every number, name, version, code line and
cite. Only what changed or was flagged is listed.

| Claim | Verdict | Fix |
|---|---|---|
| "`128` is outside that cache, so `c` and `d` box to *two distinct* objects" | WRONG as a rule — `Integer.valueOf` "may cache other values outside of this range" [9]; JLS §5.1.7 guarantees sharing only for −128..127 [7] | "Beyond that range the JVM *may* reuse objects, and by default does not"; quiz 2 says "with default settings" |
| "The compiler interns string literals into a shared pool" | WRONG in part — JLS §3.10.5: literals and constant-expression strings "are 'interned' … as if by execution of the method `String.intern`", at run time [11] | "Java interns"; constant expressions named |
| "primitives hold values in the stack" (the diagram's analysis) | WRONG in general — only local variables live in stack frames (JVMS §2.5.2); a primitive field sits inside its object on the heap (JVMS §2.5.3) [2] [3] | "These local variables sit on the stack"; the field case stated |
| "a reference holds the address of a heap object" | VERIFY — JLS §4.3.1 calls references "pointers" [1]; JVMS §2.7 fixes no representation [4] | cited; "the JVM does not fix how it is stored" |
| "Modern Java's message even names what was null" | VERIFY — undated | "Since Java 14", cited to JEP 358 [12] |
| "with debug info it would say `"s"`" | OK — run with `javac -g`: `because "s" is null`; JEP 358: names appear "if debug information is included in the class file (via `javac -g`)" [12] | none |
| "Autoboxing routes small values through `Integer.valueOf`" | VERIFY — a javac behaviour, not a JLS rule | dropped; the guarantee cited to JLS §5.1.7 and `Integer.valueOf` [7] [9] |
| "Tutorial 4 teaser", "Tutorial 19", "Tutorial 28" | WRONG as references | links to Strings, equals & hashCode, Modern Java Idioms |
| "`Objects.equals(a, b)` is safe on either side" (draft) | OK — API: "if both arguments are null, true is returned"; run (`true` for `Objects.equals(null, null)`) [13] | none |
| "`z + "!"` prints `null!`" (draft) | OK — run | none |
| `incomparable types: Integer and String`; `Integer c = 128; int e = 128; c == e` is `true` | OK — runs on JDK 21 | none |
| Every `Output:` block (9 fences) | OK — `prove.py`: 9/9 | none |
| Quiz answers and the `<details>` | OK — quiz 1 from the §1 proof; quiz 2 from a run (`false` / `true`); quiz 3 from the §2 proof; quiz 4 from the §5 proof; quiz 5 from JLS §12.6.1 and JVMS §2.5.3; the `<details>` from runs (`true`, `false`, `true`, `true`, `null!`, the `<local5>` NPE) | none |

### Review

Scored 1–5 before the fix, the single highest-impact fix named, scored again after. Every `After`
must reach 4.

| Criterion | Before | Highest-impact fix | After |
|---|---|---|---|
| accuracy — Accuracy & currency — every claim true now, sourced or derived | 3 — the cache beyond 127 stated as a rule; "the compiler interns"; "primitives on the stack"; no sources | fix each; fourteen primary sources; every block proved | 5 |
| clarity — Clarity for this reader — no term used before it is defined | 3 — heap, stack, autoboxing undefined; sentences to 45 words | defined at first use; lists for the surprises; mean 13 words, longest 30 | 5 |
| sequence — Sequence — each section rests only on what came before it | 4 — "autoboxes" before any definition | wrapper and boxing open §3; unboxing `null` sits in §5, after §3 | 5 |
| practice — Worked example, non-example, checks with hidden solutions | 3 — bites only; the Predict box unanswered | the array-`.equals`, computed-string and unboxing non-examples; five quizzes; a `<details>` | 5 |
| misconceptions — Misconceptions, edge cases, troubleshooting covered | 3 — five bullets; ".equals means contents" left standing | the arrays edge; an 11-row symptom → cause → fix table | 5 |
| actionability — Actionable — the reader can DO the objectives afterwards | 3 — no life-cycle content | §6 with its proof and check; four objectives with a check each | 4 — collection itself cannot be shown deterministically; the lesson proves reachability, not reclamation |

## What changed, and why

| Change | Why |
|---|---|
| Objectives line; ✅ (5 quizzes, 1 `<details>`); 📚 (14) | the /prepare contract |
| Intro: heap defined; the surprises as a list | gap 9; register |
| §1: pointer, stack, frame, heap, cited; the stack-vs-field correction | gap 9; fact-check rows 3, 4 |
| §2: identity cited; `incomparable types`; `.equals` on arrays non-example; the equals & hashCode link | gaps 1, 8; fact-check row 8 |
| §3: wrapper, boxing, unboxing; the cache guarantee stated exactly; `Integer == int` | gaps 3, 5; fact-check rows 1, 7 |
| §4: interning cited; a computed-string bite; the Strings link | gap 6; fact-check rows 2, 8 |
| §5: `null` cited; Java 14 and `-g`; the unboxing non-example; `.equals` with `null`; the Modern Java Idioms link | gaps 2, 7; fact-check rows 5, 6, 8 |
| §6 (new): unreachable objects and the garbage collector | gap 4 (coverage map 3.1, JLS 12) |
| Gotcha checklist → 11-row troubleshooting table; mental-model rows added; TOC renumbered | the /prepare shape |
| Predict box as a numbered list, answered in `<details>` | the /prepare shape |
| Register: long sentences split; hedges removed ("actually", "just") | lint: 18 problems → 0 |
