# The Collections Framework — preparation record

The /prepare chain for `04-core-libraries/02-the-collections-framework.md`, in order. Not rendered (the leading `_`). The lesson is edited in
place; this file is the evidence behind each change. Prepared 2026-09-28; every run on Temurin
21 (`/usr/libexec/java_home -v 21`), JLS 21 and the Java SE 21 API fetched from docs.oracle.com
the same day.

## Research

### Audience

- *Holds already* (earlier lessons, never re-taught): arrays, indices from 0,
  `ArrayIndexOutOfBoundsException`, `Arrays.toString` (Arrays); overloading (Methods); classes,
  constructors, fields, printing an object as `Class@hash` (Classes & Objects); wrapper class,
  boxing, unboxing, the `null`-unboxing NPE, `Integer.valueOf` (References, Equality & the Object
  Model); `String.compareTo` never taught; `List.of` used once in Strings in Depth.
- *Must not be assumed* (defined where it first appears): **interface** (as "a named set of
  operations", fully in Abstract Classes & Interfaces), **implementation**, **generic type**,
  **diamond**, **unmodifiable**, **Iterator**, **fail-fast**, **natural ordering**,
  **`Comparable`**, **`Comparator`**, **stack** (LIFO), **queue** (FIFO), **`Deque`**, amortized.
- *The one thing an expert forgets a newcomer does not know:* `List.of` looks like any other
  list and throws on the first `add`.

### Gaps in the chapter

Four lenses, most severe first: prerequisite, step, edge, structure. Coverage map rows: 1.1
(primitives and wrapper classes) `partial` H — "a wrapper and autoboxing section in
04-core-libraries/02 … with the `null`-unboxing NPE"; 5.1 (`List`, `Set`, `Map`, `Deque`: add,
remove, update, retrieve, **sort**) `partial` H — "`Deque` (stack and queue) and sorting
(`Comparable`, `Comparator`, `List.sort`, `Arrays.sort`) in 04-core-libraries"; JLS 18 (type
inference) — the diamond named here, inference in Generics.

| Gap | Kind | Filled where | Source |
|---|---|---|---|
| Wrappers and autoboxing in collections (coverage map 1.1): `List<int>` rejected; boxing on `add`, unboxing on `get`; a `null` element unboxed in a for-each | prerequisite | new §2: a `Compiler error:` fence (`unexpected type`, `required: reference`); a non-example fence ending in the `Iterator.next()` NPE; quiz 2; two gotcha rows | JLS §4.5.1 [3], §5.1.7 [4], §5.1.8 [5]; runs |
| Sorting (coverage map 5.1): natural order, `Comparator.reverseOrder`, `CASE_INSENSITIVE_ORDER`, `Arrays.sort`; capitals first; a class of your own | structure | new §5: a sort fence; the `Collections.sort` compiler error; the `Comparable` fix; quiz 4; three gotcha rows | `Comparable` [10], `Comparator` [11], `Arrays.sort` [12], `String.compareTo` [13], `List.sort` [14]; runs (`players.sort(null)`: `ClassCastException … cannot be cast to class java.lang.Comparable`) |
| `Deque` as a stack and a queue (coverage map 5.1); `pop` on empty vs `poll`; `Stack` is legacy | structure | new §6: a stack-and-queue fence; the empty-deque non-example; quiz 5; gotcha row | `Deque` [15], `ArrayDeque` [16], `Stack` [17]; runs |
| `List.of` is unmodifiable: `add` throws `UnsupportedOperationException` | edge | §1 non-example; the `new ArrayList<>(List.of(…))` fix; quiz 1; gotcha row | `List` API, "Unmodifiable Lists" [1]; runs (`[a, b, c]` for the copy) |
| Fail-fast is best-effort: removing the second-to-last element in a for-each throws nothing and skips an element | edge | §4 non-example (`[1, 3]`, `3` never visited); gotcha row | `ArrayList` API [2]; run |
| The `remove(int)` trap sat under "choosing an implementation", though it is a boxing trap | structure | moved into §2, after boxing is defined; the JLS phase rule cited | JLS §15.12.2 [6] |
| "Interface", "implementation", "diamond", "autoboxes" used undefined | prerequisite | intro; §1; §2 | JLS §15.9 [19] |
| `LinkedList` recommended for queues; `ArrayDeque` absent | edge | §7: a third column; the earned rule | `ArrayDeque` API [16] |
| No objectives, checks or sources; gotchas as bullets; "Tutorial 20", "Tutorial 22"; the Predict box unanswered | structure | objectives; ✅ (5 quizzes, 1 `<details>` with a proved fence); 12-row table; 📚 (19); links to Generics, Inheritance & Polymorphism, Abstract Classes & Interfaces, lambdas | `/prepare` chain |

### Plan

| Section | Carries | Why here |
|---|---|---|
| Intro + objectives | interface vs implementation as a list; five objectives | the reader's map |
| §1 `List` grows | the kept fence; diamond; the growth policy quoted; **non-example** `List.of` | the basic operations first |
| §2 `Integer`, not `int` (new) | `List<int>` rejected; boxing and unboxing; **non-example** `null` unboxed; the `remove(int)` trap, moved | every later fence uses `List<Integer>` |
| §3 Program to the interface | the kept fence and diagram; the Collection root cited | needs a list to exist |
| §4 Iterator | the kept fences; fail-fast; **non-example** the silent skip; the iterator fix | the NPE in §2 named `Iterator.next()` |
| §5 Sorting (new) | natural order, comparators, `Arrays.sort`; **non-example** a class with no order; `Comparable` | needs lists and `compareTo`'s contract |
| §6 `Deque` (new) | stack and queue; the two method families; **non-example** `pop` on empty | a second collection shape before the cost table |
| §7 Choosing | three implementations compared; `ArrayDeque` for queues | last, once all three are known |
| 8 / 9 | summary rows per rule; a 12-row symptom → cause → fix table | read by the study profile |
| ✅ / 📚 | one check per objective; the Predict box answered | after all mechanisms |

### Unverified

- _None._

### Fact-check

A separate pass over the FINISHED draft, as a checker: every number, name, version, code line and
cite. Only what changed or was flagged is listed.

| Claim | Verdict | Fix |
|---|---|---|
| "`next()` throws" when the list was changed mid-loop | WRONG as a guarantee — the API: "fail-fast iterators throw `ConcurrentModificationException` on a best-effort basis" [2]; a run removing the second-to-last element prints `[1, 3]` with no exception | the best-effort non-example; the rule "even when no exception appears" |
| "`LinkedList` wins … for heavy front/queue-style insertion" | WRONG as advice — `ArrayDeque` "is likely to be … faster than `LinkedList` when used as a queue" [16] | `ArrayDeque` column and rule |
| "`ArrayList` … reallocates (typically by ~1.5×)" | VERIFY — the API: "The details of the growth policy are not specified" [2] | the API quoted; the factor dropped |
| "fast indexing and cache-friendly" | VERIFY — no primary source | "cache-friendly" dropped |
| "the enhanced `for` is just sugar over it" | OK for collections — JLS §14.14.2 translates it to an `Iterator` loop [9]; for arrays it is an index loop | "over a collection"; "just" removed (register) |
| "no boxing is preferred over boxing" | OK — JLS §15.12.2: the first phase permits no boxing [6] | cited |
| "`List<int>` won't compile" | OK — JLS §4.5.1 [3]; run: `unexpected type`, `required: reference`, `found: int` | the compiler error shown |
| "Tutorial 20", "the dynamic dispatch of Tutorial 22" | WRONG as references | links to Generics and Inheritance & Polymorphism |
| "every capital letter comes before every lowercase one" (draft) | VERIFY — true for `A`–`Z` and `a`–`z` (codes 65–90, 97–122), not for every Unicode letter [13] | "`A`–`Z` … `a`–`z`" |
| "`ArrayDeque` uses an array that wraps around" (draft) | VERIFY — an implementation detail; the API says "Resizable-array implementation" [16] | "a resizable array" |
| `Stack`: a `Deque` "should be used in preference to this class" | OK — quoted [17] | none |
| Every `Output:` block and compiler error (16 fences) | OK — `prove.py`: proved 14, rejected 2 | none |
| Quiz answers and the `<details>` | OK — one run: `[z, b, c]`; `[5, 9]`; `false [5, 7]`; `[Apple, fig, pear]`; `2`; removing `"b"` in a for-each throws `ConcurrentModificationException`; quiz 1 and 3 from the §1 and §4 proofs; the iterator fence proved | none |

### Review

Scored 1–5 before the fix, the single highest-impact fix named, scored again after. Every `After`
must reach 4.

| Criterion | Before | Highest-impact fix | After |
|---|---|---|---|
| accuracy — Accuracy & currency — every claim true now, sourced or derived | 3 — fail-fast stated as a guarantee; `LinkedList` for queues; 1.5× growth; no sources | each fixed; nineteen primary sources; every fence proved | 5 |
| clarity — Clarity for this reader — no term used before it is defined | 3 — interface, autoboxing, diamond undefined; sentences to 60 words | defined at first use; lists; mean 12 words, longest 26 | 5 |
| sequence — Sequence — each section rests only on what came before it | 3 — the boxing trap under "choosing an implementation" | §2 before any `List<Integer>` trap; §7 compares all three last | 5 |
| practice — Worked example, non-example, checks with hidden solutions | 3 — two non-examples; the Predict box unanswered | five new non-examples; five quizzes; a `<details>` with a proof | 5 |
| misconceptions — Misconceptions, edge cases, troubleshooting covered | 3 — five bullets | `List.of`, the silent skip, capitals first, empty `pop`; a 12-row table | 5 |
| actionability — Actionable — the reader can DO the objectives afterwards | 2 — the coverage map's sorting and `Deque` absent | §5 and §6 with runnable fences; five objectives with a check each | 5 |

## What changed, and why

| Change | Why |
|---|---|
| Objectives line; ✅ (5 quizzes, 1 `<details>`); 📚 (19) | the /prepare contract |
| Intro: interface and implementation as a list; "Tutorial 20" replaced with a link | gap 7; fact-check row 8 |
| §1: the diamond; the growth policy quoted; the `List.of` non-example | gaps 4, 7; fact-check rows 3, 4 |
| §2 (new): wrappers in collections; the `null` unboxing non-example; the `remove(int)` fence moved here | gaps 1, 6; fact-check rows 6, 7 |
| §3: the `Collection` root cited; "Tutorial 22" replaced with a link | fact-check row 8 |
| §4: the enhanced `for` cited; fail-fast as best-effort, with the silent-skip non-example | gap 5; fact-check rows 1, 5 |
| §5 (new): sorting, `Comparable`, the compiler-error non-example | gap 2 (coverage map 5.1) |
| §6 (new): `Deque` as stack and queue; the empty-deque non-example; `Stack` legacy | gap 3 (coverage map 5.1) |
| §7: `ArrayDeque` column; the advice fixed | gap 8; fact-check rows 2, 10 |
| Gotcha checklist → 12-row troubleshooting table; mental-model rows added; TOC renumbered | the /prepare shape |
| Predict box as a numbered list, answered in `<details>` with a proved fence | the /prepare shape |
| Register: long sentences split; hedges removed ("actually", "just", "simply") | lint: 17 problems → 0 |
