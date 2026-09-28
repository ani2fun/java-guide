---
title: Arrays
summary: An array is a fixed-size block of same-typed slots, indexed 0..length-1; its size is set at creation and never changes, and an out-of-range index throws at run time, not compile time. Creation and defaults, indexing, iteration, multidimensional and jagged arrays, and why a fixed array is not a growable list — every behavior shown with verified output.
prereqs: []
---

# Arrays — A Fixed Block of Slots

So far each variable has held one value. An **array** holds *many* values of the **same type** in a single, fixed-size block: `scores[0]`, `scores[1]`, and so on. Each value is reached by an integer **index** counting from zero. Two properties define it and cause every array bug:

- its **size is chosen when you create it and never changes**;
- indices run from `0` to `length - 1`, and stepping outside that range fails at *run time*, because the compiler can't know the index in advance.

Arrays are the raw, fast, fixed foundation. The growable collections of [The Collections Framework](/synapse/programming-languages/java/core-libraries/the-collections-framework) are built on top of this idea.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **The core idea.**

- An **array** holds many values of the **same type** in one fixed-size block, reached by an integer **index** from zero.
- Its **size is chosen at creation and never changes**.
- Indices run `0` to `length - 1`; stepping outside fails at **run time**.

</div>

This uses the [loops](/synapse/programming-languages/java/control-flow/loops) that walk an array and the [accumulation patterns](/synapse/programming-languages/java/control-flow/loop-control-and-patterns) that summarize one. Every output below was produced by compiling and running the code.

**You'll be able to:** create an array with `new` or a literal, and predict the default in each slot you did not fill; predict which index throws `ArrayIndexOutOfBoundsException`, and write the last index as `a.length - 1`; pick the classic or the enhanced `for` for a job, and walk an array backwards; walk a jagged 2D array using each row's own length; print, compare and grow an array with `Arrays.toString`, `Arrays.equals` and `Arrays.copyOf`.

<div style="border-left:4px solid #15448e;background:rgba(21,68,142,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

📘 **How to read the Intuition boxes.** Each one is built in three moves:

1. **The mechanism** — what the compiler and the JVM *do*.
2. **A concrete bite** — a specific, runnable failure (often a real compiler error), shown so the trap is visible.
3. **The earned rule** — the decision heuristic, now justified rather than asserted, plus its cost.

</div>

---

## Table of contents

1. [Creating arrays](#1-creating-arrays)
2. [Indexing: reading and writing slots](#2-indexing-reading-and-writing-slots)
3. [Iterating an array](#3-iterating-an-array)
4. [Multidimensional and jagged arrays](#4-multidimensional-and-jagged-arrays)
5. [Arrays are not growable lists](#5-arrays-are-not-growable-lists)
6. [Mental-model summary](#6-mental-model-summary)
7. [Gotcha checklist](#7-gotcha-checklist)
8. [Check yourself](#-check-yourself)
9. [Sources](#-sources)

---

## 1. Creating arrays

There are two ways to make an array <abbr title="The Java Language Specification, Java SE 21, §10.3 and §10.6">[1]</abbr>:

- `new int[n]` makes one with `n` slots, each set to a **default** (`0` for `int`);
- an array **literal** `{…}` makes one already filled.

Either way, `.length` reports its size.

```java run viz=array:scores
public class Main {
    public static void main(String[] args) {
        int[] scores = new int[3];   // three slots, each default 0
        scores[0] = 90;
        scores[1] = 85;
        int[] primes = {2, 3, 5, 7}; // literal: four slots, already filled
        System.out.println(scores.length);
        System.out.println(scores[2]);   // never assigned → still 0
        System.out.println(primes.length);
        System.out.println(primes[0]);
    }
}
```

**Output:**
```
3
0
4
2
```

```d2
direction: right

primes: "int[] primes   (length = 4)" {
  grid-columns: 4
  s0: "[0]\n2"
  s1: "[1]\n3"
  s2: "[2]\n5"
  s3: "[3]\n7"
}
```

**Analysis.** `new int[3]` reserved three `int` slots, all `0`. We set two of them, and `scores[2]`, never touched, printed its default `0`.

`primes` came pre-filled by its literal. `scores.length` is `3`, `primes.length` is `4`. The diagram shows the shape: `primes` is one block of four numbered slots.

You have used an array since your first program. `main(String[] args)` receives one: the words typed after `java Main`. The Run button types none, so it is empty:

```java run
public class Main {
    public static void main(String[] args) {
        System.out.println(args.length);
    }
}
```

**Output:**
```
0
```

**Intuition.**
*Mechanism.* An array is one object holding `length` slots of its type, numbered from `0`. `new T[n]` fills every slot with the type's default <abbr title="The Java Language Specification, Java SE 21, §4.12.5">[2]</abbr>; a literal fills it with what you wrote. How the slots sit in memory is the JVM's business: the specification does not fix it <abbr title="The Java Virtual Machine Specification, Java SE 21, §2.7">[3]</abbr>.

The default depends on the type:

```java run
public class Main {
    public static void main(String[] args) {
        double[] d = new double[2];
        boolean[] flags = new boolean[2];
        String[] names = new String[2];
        System.out.println(d[0]);
        System.out.println(flags[0]);
        System.out.println(names[0]);
    }
}
```

**Output:**
```
0.0
false
null
```

A `String[]` slot starts as **`null`**: "no object yet". [References, Equality & the Object Model](/synapse/programming-languages/java/classes-and-objects/references-equality-and-the-object-model) covers `null` in full.

*Concrete bite.* The size is fixed at creation: `.length` is a property of the array, not a target you can change. (You will feel that limit directly in §5.) For now the point is that every slot exists from the start. An unassigned `int` slot is `0`, not "empty" or "undefined".

*Non-example: a literal assigned later.* The `{…}` shorthand works only in a declaration <abbr title="The Java Language Specification, Java SE 21, §10.6">[1]</abbr>. Declare first and assign the braces later, and javac cannot parse it:

```java run
public class Main {
    public static void main(String[] args) {
        int[] a;
        a = {1, 2, 3};
        System.out.println(a.length);
    }
}
```

**Compiler error** *(the first of three errors on that line):*
```
Main.java:4: error: illegal start of expression
        a = {1, 2, 3};
            ^
```

Name the type in front of the braces: `a = new int[] {1, 2, 3};` compiles and prints `3`. Do not give a size as well: `new int[3] {1, 2, 3}` is rejected with `array creation with both dimension expression and initialization is illegal`.

**Seeing an array.** `println` on an array does not print its values. It prints a type code and a number:

```java run
public class Main {
    public static void main(String[] args) {
        int[] a = {1, 2, 3};
        System.out.println(a);
    }
}
```

**Output** *(illustrative — the part after `@` differs from run to run):*
```
[I@2a139a55
```

`[I` is Java's name for "array of `int`", and the hex digits come from the object's hash code <abbr title="Java SE 21 API, java.lang.Object.toString">[5]</abbr>. To see the contents, pass the array to `Arrays.toString`, after `import java.util.Arrays;` <abbr title="Java SE 21 API, java.util.Arrays">[4]</abbr>:

```java run
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] nums = {5, 10, 15};
        for (int n : nums) {
            n = 0;
        }
        System.out.println(Arrays.toString(nums));
        for (int i = 0; i < nums.length; i++) {
            nums[i] = 0;
        }
        System.out.println(Arrays.toString(nums));
    }
}
```

**Output:**
```
[5, 10, 15]
[0, 0, 0]
```

The first loop assigned to a copy, as in [Loops](/synapse/programming-languages/java/control-flow/loops), and the array printed unchanged. The second wrote through the index, and every slot became `0`. §3 returns to that choice.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Choose the form by what you know. Use a literal when you have the values up front. Use `new T[n]` when you'll fill the slots later, relying on the `0`/`false`/`null` defaults until you do. Print an array with `Arrays.toString`.

The cost of the defaults: a slot you *forgot* to fill is silently `0`, not an error. So a half-initialized array reads as a fully-`0` one.

</div>

---

## 2. Indexing: reading and writing slots

`array[i]` is the slot at index `i`. Read it in an expression, or assign to it to change that slot. Indices start at `0`, so a length-3 array has valid indices `0`, `1`, `2`.

```java run viz=array:a
public class Main {
    public static void main(String[] args) {
        int[] a = {10, 20, 30};
        a[1] = 99;
        System.out.println(a[0]);
        System.out.println(a[1]);
        System.out.println(a[2]);
    }
}
```

**Output:**
```
10
99
30
```

**Analysis.** `a[1] = 99` overwrote the middle slot; `a[0]` and `a[2]` were untouched. Reading and writing both use the same `a[i]` notation. On the left of `=` it names the slot to change; elsewhere it yields the slot's value.

**Intuition.**
*Mechanism.* Every array access is checked at run time <abbr title="The Java Language Specification, Java SE 21, §10.4">[6]</abbr>. An index below `0`, or equal to `length` or above, is refused with an exception. Java never lets you read or write past the ends of an array.

*Concrete bite.* Index past the end (or below `0`) and it throws. That happens at run time, because the index isn't known until then:

```java run
public class Main {
    public static void main(String[] args) {
        int[] a = {10, 20, 30};
        System.out.println(a[3]);
    }
}
```

**Output** *(a thrown exception):*
```
Exception in thread "main" java.lang.ArrayIndexOutOfBoundsException: Index 3 out of bounds for length 3
```

`a` has length `3`, so the valid indices are `0`, `1`, `2`; `a[3]` is one past the end. The compiler accepted it (the index could have come from anywhere), and the JVM caught it when the line ran. The message names both the offending index and the length. `a[-1]` fails the same way, with `Index -1 out of bounds for length 3`.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Index from `0` to `length - 1`. The last element is `a[a.length - 1]`, never `a[a.length]`.

The cost of this run-time checking is that an out-of-range index is found late: when that line executes, often with real data. So when the index comes from a calculation or input, check it against `length` before using it.

</div>

---

## 3. Iterating an array

Two loops walk an array.

- The classic `for` gives you the **index**, so you can read `a[i]`, compare neighbours, or write back.
- The enhanced `for` gives you each **value** directly, when the index is all you'd ignore.

```java run viz=array:nums
public class Main {
    public static void main(String[] args) {
        int[] nums = {5, 10, 15};
        for (int i = 0; i < nums.length; i++) {
            System.out.println(i + " -> " + nums[i]);
        }
        for (int n : nums) {
            System.out.print(n + " ");
        }
        System.out.println();
    }
}
```

**Output:**
```
0 -> 5
1 -> 10
2 -> 15
5 10 15 
```

**Analysis.** The first loop used `i` from `0` to `nums.length - 1`, printing each index alongside `nums[i]`. The second visited the values `5, 10, 15` with no index at all. Note `i < nums.length` (not a hard-coded `3`). Tie the boundary to the array, so it stays correct if the array's size changes.

**Intuition.**
*Mechanism.* The classic `for` reads `nums[i]` each pass from the index it controls. The enhanced `for` walks `0..length-1` for you and hands over each value <abbr title="The Java Language Specification, Java SE 21, §14.14.2">[7]</abbr>: a copy, as [Loops](/synapse/programming-languages/java/control-flow/loops) showed. Same traversal, different access.

*Concrete bite.* The choice has consequences beyond style: only the indexed `for` can write back. §1's `Arrays.toString` run showed it. `for (int n : nums) n = 0;` left `[5, 10, 15]`, and the indexed loop gave `[0, 0, 0]`.

Walking backwards needs the index too. Start at the last index, `length - 1`, and stop after `0`: `for (int i = a.length - 1; i >= 0; i--)`. Starting at `a.length` throws at once; stopping at `i > 0` skips the first element.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Use the enhanced `for` when you only read each value. Use the classic `for` when you need the index: to modify a slot, walk backwards, or compare an element to its neighbour.

Each choice has a cost. Reaching for the index when you don't need it brings back the off-by-one risk that the enhanced `for` removes. Using the enhanced `for` when you *do* need the index means you can't write back.

</div>

---

## 4. Multidimensional and jagged arrays

An array's elements can themselves be arrays. `int[][]` is "an array of `int` arrays": a grid, addressed `grid[row][col]`. Iterating it takes [nested loops](/synapse/programming-languages/java/control-flow/loop-control-and-patterns).

```java run viz=grid:grid
public class Main {
    public static void main(String[] args) {
        int[][] grid = {
            {1, 2, 3},
            {4, 5, 6}
        };
        System.out.println(grid.length);      // number of rows
        System.out.println(grid[0].length);   // length of row 0
        System.out.println(grid[1][2]);       // row 1, column 2
        int total = 0;
        for (int[] row : grid) {
            for (int cell : row) {
                total += cell;
            }
        }
        System.out.println(total);
    }
}
```

**Output:**
```
2
3
6
21
```

**Analysis.** `grid.length` is the number of **rows** (`2`). Each row is itself an array, so `grid[0].length` is that row's length (`3`), and `grid[1][2]` is the element at row 1, column 2 (`6`). The nested for-each walked every row, then every cell, summing to `21`.

`new int[rows][cols]` makes a rectangle of defaults:

```java run
public class Main {
    public static void main(String[] args) {
        int[][] table = new int[3][4];
        System.out.println(table.length);
        System.out.println(table[2].length);
        System.out.println(table[2][3]);
    }
}
```

**Output:**
```
3
4
0
```

**Intuition.**
*Mechanism.* A 2D array is a one-dimensional array whose elements are other arrays. Nothing forces those inner arrays to be the same length. A **jagged** array, where rows differ in size, is perfectly legal.

*Concrete bite.* So the bounds of one row tell you nothing about another, and assuming a rectangle throws:

```java run viz=grid:jagged
public class Main {
    public static void main(String[] args) {
        int[][] jagged = {
            {1, 2, 3, 4},
            {5}
        };
        System.out.println(jagged[0].length);
        System.out.println(jagged[1].length);
        System.out.println(jagged[1][1]);
    }
}
```

**Output** *(two lengths, then a thrown exception):*
```
4
1
Exception in thread "main" java.lang.ArrayIndexOutOfBoundsException: Index 1 out of bounds for length 1
```

Row `0` has four elements but row `1` has only one, so `jagged[1][1]` is out of bounds for *that* row. Each row carries its own `length`; there is no single "column count" to trust.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Treat a 2D array as rows that each have their own `length`. Iterate with `grid[i].length` per row, not one shared width. Reach for `new int[rows][cols]` when you want a rectangle.

The cost of assuming uniformity is exactly this per-row `ArrayIndexOutOfBoundsException`. It shows up only when a short row is indexed past its end.

</div>

---

## 5. Arrays are not growable lists

The defining limit returns: an array's `length` is fixed forever at creation. You cannot append, insert, or remove: there is no `add`, no `length = …`. To "grow" one, you allocate a bigger array and copy. That rigidity is exactly what [The Collections Framework](/synapse/programming-languages/java/core-libraries/the-collections-framework) replaces with growable `List`s.

```java run
public class Main {
    public static void main(String[] args) {
        int[] a = {1, 2, 3};
        System.out.println(a.length());
    }
}
```

**Compiler error:**
```
Main.java:4: error: cannot find symbol
        System.out.println(a.length());
                            ^
  symbol:   method length()
  location: variable a of type int[]
1 error
```

**Analysis.** Reaching for `a.length()`, with parentheses as if it were a method, fails. An array's `length` is a **field**, written `a.length` with no parentheses. (Contrast a `String`, where [`s.length()`](/synapse/programming-languages/java/first-steps/strings-the-basics) *is* a method.) The slip is a compile error, so it's caught immediately.

**Intuition.**
*Mechanism.* `length` is a `final` field fixed in the array at creation <abbr title="The Java Language Specification, Java SE 21, §10.7">[8]</abbr>. It is not a method, and it cannot be reassigned. No operation changes an array's size, because the array was created with exactly that many slots.

**Growing by copying.** `Arrays.copyOf(a, n)` makes a *new* array of length `n`, copies `a` into it, and fills any extra slots with `0` <abbr title="Java SE 21 API, java.util.Arrays.copyOf">[4]</abbr>:

```java run
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] a = {1, 2, 3};
        int[] bigger = Arrays.copyOf(a, 5);
        bigger[3] = 4;
        System.out.println(Arrays.toString(a));
        System.out.println(Arrays.toString(bigger));
    }
}
```

**Output:**
```
[1, 2, 3]
[1, 2, 3, 4, 0]
```

`a` is unchanged. Each "add" to a full array costs a new array and a copy of every element, O(N) work.

*Non-example: `=` does not copy.* Assigning one array variable to another shares the array. It does not make a second one:

```java run
public class Main {
    public static void main(String[] args) {
        int[] a = {1, 2, 3};
        int[] b = a;
        b[0] = 99;
        System.out.println(a[0]);
    }
}
```

**Output:**
```
99
```

`a` and `b` name the same array, so a change through `b` shows through `a`. [References, Equality & the Object Model](/synapse/programming-languages/java/classes-and-objects/references-equality-and-the-object-model) explains why. For a real copy, use `Arrays.copyOf(a, a.length)`.

The same sharing explains `==` on arrays. It asks "the same array?", not "the same contents?":

```java run
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] a = {1, 2, 3};
        int[] b = {1, 2, 3};
        System.out.println(Arrays.toString(a));
        System.out.println(a == b);
        System.out.println(Arrays.equals(a, b));
    }
}
```

**Output:**
```
[1, 2, 3]
false
true
```

Two arrays with equal contents are still two arrays. `Arrays.equals` compares them slot by slot.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Use an array when the size is known and fixed. Reach for an `ArrayList`, in [The Collections Framework](/synapse/programming-languages/java/core-libraries/the-collections-framework), the moment the collection needs to grow or shrink. Copy with `Arrays.copyOf`, compare with `Arrays.equals`, and never with `=` or `==`.

The cost of forcing a growable problem onto an array is repeated allocate-and-copy. The cost of the array's fixed size is paid once, in choosing it only when the size is truly fixed.

</div>

---

## 6. Mental-model summary

| Principle | Consequence |
|---|---|
| An array is a fixed-size block of same-typed slots, indexed from `0` | Valid indices are `0..length-1`; the last is `a[a.length - 1]` |
| `new T[n]` fills slots with the type's default; a literal fills them | An unassigned slot is silently `0`/`0.0`/`false`/`null`, not "empty" |
| A literal `{…}` works only in a declaration | Assign later with `new int[] {…}` |
| `println(a)` prints a type code and a hash, not the values | Print with `Arrays.toString(a)` |
| Index bounds are checked at run time, not compile time | An out-of-range index throws `ArrayIndexOutOfBoundsException` when it runs |
| A 2D array is an array of arrays; rows may differ in length (jagged) | Each row has its own `.length`; there is no shared column count |
| `length` is a fixed field, not a method, and never changes | `a.length` (no parens); grow with `Arrays.copyOf`, or use a `List` |
| `=` shares an array; `==` asks "the same array?" | Copy with `Arrays.copyOf`; compare with `Arrays.equals` |

## 7. Gotcha checklist

<div style="border-left:4px solid #da5233;background:rgba(218,82,51,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

| Symptom | Likely cause | Fix |
|---|---|---|
| `ArrayIndexOutOfBoundsException: Index 3 out of bounds for length 3` | an index reached `length` (or went negative) | the last valid index is `length - 1`; check computed indices |
| A backwards loop throws at once | it started at `a.length` | start at `a.length - 1` and run while `i >= 0` |
| A slot reads as `0` (or `null`) you thought you set | `new T[n]` defaults; you didn't assign that slot | assign it, or use a literal |
| `[I@2a139a55` printed instead of the values | `println` on an array | `Arrays.toString(a)` |
| `illegal start of expression` at `a = {1, 2, 3};` | a literal assigned after the declaration | `a = new int[] {1, 2, 3};` |
| `array creation with both dimension expression and initialization is illegal` | `new int[3] {1, 2, 3}` | drop the size: `new int[] {1, 2, 3}` |
| `NegativeArraySizeException: -1` | a negative size in `new int[n]` | check `n` before creating the array |
| A for-each "edit" didn't stick | the loop variable is a copy | a classic `for` and `a[i] = …` |
| `cannot find symbol` / `method length()` on an array | `length` is a field | `a.length`, without parentheses (only `String` uses `s.length()`) |
| A 2D index throws on some rows | the array is jagged | use each row's own `grid[i].length` |
| Changing one array changed "another" | `b = a` shares the array | `b = Arrays.copyOf(a, a.length)` |
| `a == b` is `false` for equal contents | `==` compares identity | `Arrays.equals(a, b)` |
| You need to add or remove elements | an array can't grow | `Arrays.copyOf` to a new length, or an `ArrayList` |

</div>

---

## ✅ Check yourself

One check per objective. Answer before you open anything.

```quiz
{"prompt": "double[] d = new double[2]; System.out.println(d[1]); — what does it print?", "options": ["0", "null", "0.0"], "answer": "0.0"}
```

```quiz
{"prompt": "int[] a = {10, 20, 30}; System.out.println(a[a.length]); — what happens?", "options": ["It prints 30", "It throws ArrayIndexOutOfBoundsException: Index 3 out of bounds for length 3", "It does not compile"], "answer": "It throws ArrayIndexOutOfBoundsException: Index 3 out of bounds for length 3"}
```

```quiz
{"prompt": "Which loop header prints int[] v = {1, 2, 3, 4} from last to first, all four values?", "options": ["for (int i = v.length; i >= 0; i--)", "for (int i = v.length - 1; i > 0; i--)", "for (int i = v.length - 1; i >= 0; i--)"], "answer": "for (int i = v.length - 1; i >= 0; i--)"}
```

```quiz
{"prompt": "int[][] m = { {1, 2}, {3, 4, 5} }; System.out.println(m[1].length); — what does it print?", "options": ["2", "3", "5"], "answer": "3"}
```

```quiz
{"prompt": "int[] a = {1, 2, 3}; int[] b = {1, 2, 3}; System.out.println(a == b); — what does it print?", "options": ["true", "false", "It does not compile"], "answer": "false"}
```

<details>
<summary>The 🧪 box below: the length-4 array, the jagged sum, and the reversed print.</summary>

`int[] a = new int[4]; a[0] = 5; a[3] = 9;` gives `a.length` = `4` and `a[1]` = `0` (a default). `a[4]` throws `ArrayIndexOutOfBoundsException: Index 4 out of bounds for length 4`.

Summing `{ {1, 2}, {3, 4, 5} }` with nested for-each gives `15`. `m[0][2]` throws `Index 2 out of bounds for length 2`: row `0` has only two slots.

Reversing needs the index, so use the classic `for`, starting at the last index, `v.length - 1`:

`for (int i = v.length - 1; i >= 0; i--) { System.out.print(v[i] + " "); }`

It prints `4 3 2 1`.

</details>

---

## 📚 Sources

1. *The Java Language Specification, Java SE 21*, §10.3 "Array Creation" and §10.6 "Array Initializers" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-10.html#jls-10.6>
2. *The Java Language Specification, Java SE 21*, §4.12.5 "Initial Values of Variables" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-4.html#jls-4.12.5>
3. *The Java Virtual Machine Specification, Java SE 21*, §2.7 "Representation of Objects" ("does not mandate any particular internal structure for objects") — <https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-2.html#jvms-2.7>
4. Java SE 21 API, `java.util.Arrays` (`toString`, `equals`, `copyOf`) — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Arrays.html>
5. Java SE 21 API, `java.lang.Object.toString` ("`getClass().getName() + '@' + Integer.toHexString(hashCode())`") — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Object.html#toString()>
6. *The Java Language Specification, Java SE 21*, §10.4 "Array Access" ("All array accesses are checked at run time") — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-10.html#jls-10.4>
7. *The Java Language Specification, Java SE 21*, §14.14.2 "The enhanced `for` statement" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-14.html#jls-14.14.2>
8. *The Java Language Specification, Java SE 21*, §10.7 "Array Members" ("The `public final` field `length`") — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-10.html#jls-10.7>

---

<div style="border-left:4px solid #6d28d9;background:rgba(109,40,217,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

🧪 **Predict, then check.**

1. For `int[] a = new int[4];` then `a[0] = 5; a[3] = 9;`, predict `a.length`, `a[1]`, and what `a[4]` does.
2. Predict the output of summing `{ {1,2}, {3,4,5} }` with nested for-each, and what `m[0][2]` would do.
3. Write a loop that reverses the *printing* of `{1, 2, 3, 4}` (last to first). Which loop shape do you need, and what is the starting index?

</div>

## Your Turn

Before you move on, check your understanding with the coach — explain the idea, apply it, weigh the trade-offs, then defend your reasoning.

<div class="concept-coach"></div>
