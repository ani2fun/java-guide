---
title: Booleans & Logic
summary: Java's boolean is its own type with exactly two values and no truthiness — a condition must be a real boolean, so boolean b = 1 (and if (1)) won't compile, and the =/== slip is caught at compile time. Comparisons, the logical operators &&/||/!, short-circuit evaluation as a guard, precedence, and the floating-point equality trap — every example compiled and run.
prereqs: []
---

# Booleans & Logic — Yes/No as a Real Type

Decisions in a program come down to yes-or-no questions, and Java gives those questions their own type: `boolean`, with exactly two values, `true` and `false`.

- **Nothing else counts as a yes or no.** `1` is not "true", `0` is not "false", and the compiler rejects code that confuses them. This trips up newcomers from C or Python, where numbers do double as conditions.
- You build conditions from **comparisons** (`<`, `==`, …) and combine them with the **logical operators** `&&`, `||` and `!`.
- `&&` and `||` **short-circuit**: they stop the moment the answer is known.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **The core idea.**

- `boolean` is its own type with exactly two values, `true` and `false`.
- **Nothing else counts** as a yes or no — `1` and `0` are not conditions.
- You build conditions from **comparisons**, combine them with `&&`, `||`, `!`, and lean on **short-circuit** evaluation.

</div>

This builds on the [primitive types](/synapse/programming-languages/java/first-steps/variables-and-primitive-types) — `boolean` is one of the eight — and the [comparison of `==` vs `.equals`](/synapse/programming-languages/java/first-steps/strings-the-basics) from strings. Every output below was produced by compiling and running the code.

**You'll be able to:** predict the value of a comparison or a `&&`/`||`/`!` expression, a negated compound one included; explain why `boolean b = 1` and `1 < x < 10` do not compile, and fix each; put a guard on the left of `&&`, and predict when the right side never runs; add the parentheses a condition needs where `!`, `+` and a comparison meet; compare two `double` values with a tolerance instead of `==`.

<div style="border-left:4px solid #15448e;background:rgba(21,68,142,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

📘 **How to read the Intuition boxes.** Each one is built in three moves:

1. **The mechanism** — what the compiler and the JVM *do*.
2. **A concrete bite** — a specific, runnable failure (often a real compiler error), shown so the trap is visible.
3. **The earned rule** — the decision heuristic, now justified rather than asserted, plus its cost.

</div>

---

## Table of contents

1. [The `boolean` type: no truthiness](#1-the-boolean-type-no-truthiness)
2. [Comparisons produce booleans](#2-comparisons-produce-booleans)
3. [The logical operators `&&`, `||`, `!`](#3-the-logical-operators---)
4. [Short-circuit evaluation](#4-short-circuit-evaluation)
5. [Precedence and a floating-point caveat](#5-precedence-and-a-floating-point-caveat)
6. [Mental-model summary](#6-mental-model-summary)
7. [Gotcha checklist](#7-gotcha-checklist)
8. [Check yourself](#-check-yourself)
9. [Sources](#-sources)

---

## 1. The `boolean` type: no truthiness

A `boolean` holds exactly one of two values, written `true` and `false` <abbr title="The Java Language Specification, Java SE 21, §4.2.5">[1]</abbr>. Write them in lowercase and without quotes.

They are **boolean literals**: values written directly into the code, like `42` or `'A'`. They are not text, and not keywords <abbr title="The Java Language Specification, Java SE 21, §3.9">[2]</abbr>. That is the whole type.

```java run
public class Main {
    public static void main(String[] args) {
        boolean isReady = true;
        boolean done = false;
        System.out.println(isReady);
        System.out.println(done);
    }
}
```

**Output:**
```
true
false
```

**Analysis.** Two `boolean` variables, two values, printed as `true` and `false`. There is no third option and no numeric stand-in: a `boolean` is *only* ever `true` or `false`.

**Intuition.**
*Mechanism.* `boolean` is a distinct type, unrelated to the integers. C and Python treat zero as false and any other number as true. Java has no conversion from a number to a `boolean` at all.

*Concrete bite.* So assigning a number to a `boolean` does not mean "0 is false, 1 is true". It does not compile:

```java run
public class Main {
    public static void main(String[] args) {
        boolean b = 1;
        System.out.println(b);
    }
}
```

**Compiler error:**
```
Main.java:3: error: incompatible types: int cannot be converted to boolean
        boolean b = 1;
                    ^
1 error
```

`1` is an `int`, `b` is a `boolean`, and Java has no rule turning one into the other. The same strictness will reject `if (count)` when you meet `if` in the [next chapter](/synapse/programming-languages/java/control-flow/conditionals): a condition must be a `boolean`, never a number.

Comparing a `boolean` with a number fails the same way, with its own message:

```java run
public class Main {
    public static void main(String[] args) {
        boolean done = true;
        System.out.println(done == 1);
    }
}
```

**Compiler error:**
```
Main.java:4: error: incomparable types: boolean and int
        System.out.println(done == 1);
                                ^
1 error
```

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Conditions in Java are genuine `boolean`s. To ask "is this non-zero?", write the comparison: `count != 0` <abbr title="The Java Language Specification, Java SE 21, §4.2.5">[1]</abbr>.

The cost is a few more characters than the bare `count`. The benefit: a whole family of C bugs, where a stray integer is read as a truth value, cannot occur. The compiler forbids the confusion.

</div>

---

## 2. Comparisons produce booleans

You rarely write `true`/`false` literals; you *compute* booleans by comparing values. There are six comparison operators, and each takes two values and produces a `boolean`:

- `<`, `>`, `<=` and `>=` compare sizes;
- `==` asks "equal?", and `!=` asks "not equal?".

```java run
public class Main {
    public static void main(String[] args) {
        System.out.println(3 < 5);
        System.out.println(3 == 3);
        System.out.println(3 != 3);
        int age = 20;
        boolean adult = age >= 18;
        System.out.println(adult);
    }
}
```

**Output:**
```
true
true
false
true
```

**Analysis.** `3 < 5` is `true`, `3 == 3` is `true`, `3 != 3` is `false`. The last pair is the useful shape: `age >= 18` compares and stores the resulting `boolean` in `adult`, which a later decision can use.

On primitives like these, `==` compares values. On *objects* it compares identity, as [Strings, the Basics](/synapse/programming-languages/java/first-steps/strings-the-basics) showed.

A comparison between two different numeric types promotes them first, the way [arithmetic](/synapse/programming-languages/java/first-steps/numbers-and-arithmetic) does <abbr title="The Java Language Specification, Java SE 21, §15.20.1 and §15.21.1">[3]</abbr>. A `char` compares as its number:

```java run
public class Main {
    public static void main(String[] args) {
        System.out.println(5 == 5.0);
        System.out.println('a' < 'b');
        System.out.println('a' == 97);
    }
}
```

**Output:**
```
true
true
true
```

`5` became `5.0` before the test, so the two are equal. `'a'` is the number `97`, and `'b'` is `98`.

**Intuition.**
*Mechanism.* A comparison is an expression whose result type is `boolean`. `==` (two equals signs) is the *question* "are these equal?"; `=` (one equals sign) is the *action* "assign".

- A comparison produces a `boolean`.
- An assignment produces the value it assigned <abbr title="The Java Language Specification, Java SE 21, §15.26">[4]</abbr>.

*Concrete bite.* C accepts `if (x = 5)` (at most with a warning) and treats the `5` as true, a classic silent bug. Java catches the slip at compile time, because this assignment's result is an `int`, not a `boolean`:

```java run
public class Main {
    public static void main(String[] args) {
        int x = 3;
        boolean ok = (x = 5);
        System.out.println(ok);
    }
}
```

**Compiler error:**
```
Main.java:4: error: incompatible types: int cannot be converted to boolean
        boolean ok = (x = 5);
                        ^
1 error
```

`(x = 5)` assigns `5` to `x` and evaluates to the `int` `5`; storing that in a `boolean` fails to compile. The very typo that compiles and misbehaves in C is a compile error here.

*Non-example: the slip the compiler cannot see.* The protection comes from the types. When the variable is itself a `boolean`, the assignment produces a `boolean`, and the typo compiles:

```java run
public class Main {
    public static void main(String[] args) {
        boolean done = false;
        boolean finished = (done = true);
        System.out.println(finished);
        System.out.println(done);
    }
}
```

**Output:**
```
true
true
```

The line meant to ask "is `done` true?". It *set* `done` to `true` instead, and the answer came out `true` for that reason.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Use `==` to compare and `=` to assign. With numbers, the compiler stops the slip wherever a `boolean` is required.

With a `boolean` variable it cannot, so never compare one with `true` or `false`. Use the variable itself: `done`, or `!done` for "not done". Then there is no `==` to mistype.

</div>

---

## 3. The logical operators `&&`, `||`, `!`

To combine yes/no answers, use the three logical operators:

- `&&` ("and") is true only if **both** sides are true;
- `||` ("or") is true if **either** side is true;
- `!` ("not") flips a `boolean`.

```java run
public class Main {
    public static void main(String[] args) {
        boolean a = true, b = false;
        System.out.println(a && b);
        System.out.println(a || b);
        System.out.println(!a);
    }
}
```

**Output:**
```
false
true
false
```

**Analysis.** `a && b` is `false` because `b` is false (and needs both). `a || b` is `true` because `a` is true (or needs only one). `!a` flips `true` to `false`.

These three build every compound condition you will write. Here are all four cases:

| `a` | `b` | `a && b` | `a \|\| b` |
|---|---|---|---|
| `true` | `true` | `true` | `true` |
| `true` | `false` | `false` | `true` |
| `false` | `true` | `false` | `true` |
| `false` | `false` | `false` | `false` |

*Non-example: a chained comparison.* In maths, "x is between 1 and 10" is written 1 < x < 10. Java rejects that:

```java run
public class Main {
    public static void main(String[] args) {
        int x = 5;
        System.out.println(1 < x < 10);
    }
}
```

**Compiler error:**
```
Main.java:4: error: bad operand types for binary operator '<'
        System.out.println(1 < x < 10);
                                 ^
  first type:  boolean
  second type: int
1 error
```

Java reads `1 < x < 10` as `(1 < x) < 10` <abbr title="The Java Language Specification, Java SE 21, §15.20">[5]</abbr>. The first `<` gives a `boolean`, and the second `<` then compares that `boolean` with `10`. The message names the two types it was handed: `boolean` and `int`. A range is two comparisons joined by `&&`:

```java run
public class Main {
    public static void main(String[] args) {
        int x = 5;
        System.out.println(1 < x && x < 10);
        x = 42;
        System.out.println(1 < x && x < 10);
    }
}
```

**Output:**
```
true
false
```

**Intuition.**
*Mechanism.* Each operator combines `boolean`s into a `boolean`. `!` binds tightest, then `&&`, then `||`. So `!` applies only to the term it touches, not to a whole expression.

*Concrete bite.* That precedence of `!` is where intuition fails. "Not (a and b)" is **not** the same as "not-a and not-b":

```java run
public class Main {
    public static void main(String[] args) {
        System.out.println(!(true && false));
        System.out.println(!true && !false);
    }
}
```

**Output:**
```
true
false
```

`!(true && false)` is `!(false)` = `true`. But `!true && !false` is `false && true` = `false`. Negating a compound condition flips *and* to *or*, and *or* to *and*. This is **De Morgan's law**:

- `!(a && b)` equals `!a || !b`;
- `!(a || b)` equals `!a && !b`.

A working-age check shows the second law in use. "Not a child and not retired" can be written either way:

```java run
public class Main {
    public static void main(String[] args) {
        int age = 70;
        boolean working = !(age < 18 || age >= 65);
        boolean same = age >= 18 && age < 65;
        System.out.println(working + " " + same);
        age = 30;
        working = !(age < 18 || age >= 65);
        same = age >= 18 && age < 65;
        System.out.println(working + " " + same);
    }
}
```

**Output:**
```
false false
true true
```

The two forms agree for both ages. The `||` became `&&`, and each comparison flipped: `<` to `>=`, and `>=` to `<`.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Build conditions from `&&`, `||` and `!`. Write a range as two comparisons joined by `&&`. When you negate a compound test, De Morgan applies: `!(a && b)` means `!a || !b`.

The cost of forgetting De Morgan is a condition that looks negated but tests the wrong thing. When in doubt, wrap the whole expression in `!( … )` instead of distributing the `!` by hand.

</div>

---

## 4. Short-circuit evaluation

`&&` and `||` are **short-circuiting**: they evaluate the left side first and stop as soon as the answer is decided <abbr title="The Java Language Specification, Java SE 21, §15.23">[6]</abbr> <abbr title="The Java Language Specification, Java SE 21, §15.24">[7]</abbr>.

- `false && anything` is `false` without ever looking at the right side.
- `true || anything` is `true` the same way.

This is not only speed. It is a guard.

```java run
public class Main {
    public static void main(String[] args) {
        int x = 0;
        boolean ok = (x != 0) && (10 / x > 0);
        System.out.println(ok);
    }
}
```

**Output:**
```
false
```

**Analysis.** `x` is `0`, so `x != 0` is `false`, and `&&` stops there. The right side, `10 / x`, is **never evaluated**, so the divide-by-zero never happens. The whole expression is `false`, and the program runs cleanly. The first test guarded the second.

**Intuition.**
*Mechanism.* `&&` computes its left operand, and only if that is `true` does it compute the right. `||` is the mirror: it computes the right only if the left is `false`. The single-character cousins `&` and `|` do **not** short-circuit: they always evaluate both sides <abbr title="The Java Language Specification, Java SE 21, §15.23">[6]</abbr>.

*Concrete bite.* Swap `&&` for `&` and the guard is gone. Both sides run, and `10 / 0` throws:

```java run
public class Main {
    public static void main(String[] args) {
        int x = 0;
        boolean ok = (x != 0) & (10 / x > 0);
        System.out.println(ok);
    }
}
```

**Output** *(a thrown exception):*
```
Exception in thread "main" java.lang.ArithmeticException: / by zero
```

`&` evaluated `10 / x` even though `x != 0` was already `false`, and dividing by zero threw `ArithmeticException`. Same logic, one missing character, a crash instead of a clean `false`.

A skipped right side skips *everything* in it, updates included. Here `++n` sits on the right of each operator:

```java run
public class Main {
    public static void main(String[] args) {
        int n = 0;
        boolean a = (n > 5) && (++n > 0);
        System.out.println(a + " " + n);
        boolean b = (n > 5) & (++n > 0);
        System.out.println(b + " " + n);
    }
}
```

**Output:**
```
false 0
false 1
```

With `&&`, `n > 5` was `false`, so `++n` never ran and `n` stayed `0`. With `&`, both sides ran, and `n` became `1`. The results agree, but the program's state does not.

The third non-short-circuit operator is `^`, "exclusive or": `true` when the two sides differ <abbr title="The Java Language Specification, Java SE 21, §15.22.2">[8]</abbr>. On booleans it gives the same answer as `!=`:

```java run
public class Main {
    public static void main(String[] args) {
        System.out.println(true ^ false);
        System.out.println(true ^ true);
        System.out.println(true != false);
    }
}
```

**Output:**
```
true
false
true
```

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Use `&&` and `||` (not `&`/`|`) for conditions, and put the cheap, protective test first: `x != 0 && 10 / x > 0`. Keep updates such as `++n` out of conditions, so whether they run never depends on the left side.

The cost is that order now matters. Short-circuiting protects the right side only if the guard is on the left. A misordered condition loses the protection and can still crash.

(The same guard protects text: `s != null && s.length() > 0`. `null` arrives properly in [References, Equality & the Object Model](/synapse/programming-languages/java/classes-and-objects/references-equality-and-the-object-model).)

</div>

---

## 5. Precedence and a floating-point caveat

When `&&` and `||` mix, `&&` binds tighter than `||`: `a || b && c` means `a || (b && c)`. And one comparison deserves an early warning: `==` on floating-point numbers is treacherous, because decimals are stored approximately.

```java run
public class Main {
    public static void main(String[] args) {
        System.out.println(true || false && false);
        System.out.println((true || false) && false);
    }
}
```

**Output:**
```
true
false
```

**Analysis.** `true || false && false` groups as `true || (false && false)` = `true || false` = `true`, because `&&` binds tighter. Forcing the other grouping with parentheses, `(true || false) && false` = `true && false` = `false`. The parentheses changed the answer.

The full order, tightest first, for the operators you know so far <abbr title="The Java Language Specification, Java SE 21, Chapter 15">[9]</abbr>:

| Level | Operators |
|---|---|
| 1 (tightest) | `!`, unary `-`, `++`, `--` |
| 2 | `*`, `/`, `%` |
| 3 | `+`, `-` (and `+` joining text) |
| 4 | `<`, `>`, `<=`, `>=` |
| 5 | `==`, `!=` |
| 6 | `&`, then `^`, then `\|` |
| 7 | `&&` |
| 8 | `\|\|` |
| 9 (loosest) | `=`, `+=`, and the other assignments |

**Intuition.**
*Mechanism.* Precedence is fixed grammar. The comparisons bind tighter than `&&` and `||`, so `a < b && c < d` already means `(a < b) && (c < d)`. `!` sits on the top level, and `+` binds tighter than any comparison.

*Concrete bite.* Two everyday lines fall into those last two rules. Both look fine, and neither compiles:

```java run
public class Main {
    public static void main(String[] args) {
        int age = 20;
        System.out.println(!age >= 18);
    }
}
```

**Compiler error:**
```
Main.java:4: error: bad operand type int for unary operator '!'
        System.out.println(!age >= 18);
                           ^
1 error
```

`!` grabbed `age` before `>=` ran, and `!` works only on a `boolean` <abbr title="The Java Language Specification, Java SE 21, §15.15.6">[10]</abbr>. Write `!(age >= 18)`, or better, `age < 18`.

```java run
public class Main {
    public static void main(String[] args) {
        int age = 20;
        System.out.println("adult: " + (age >= 18));
        System.out.println("adult: " + age >= 18);
    }
}
```

**Compiler error:**
```
Main.java:5: error: bad operand types for binary operator '>='
        System.out.println("adult: " + age >= 18);
                                           ^
  first type:  String
  second type: int
1 error
```

`+` ran first and built the text `"adult: 20"`. Then `>=` tried to compare that `String` with `18`. Line 4, with parentheses, is the fix, and it would print `adult: true`.

*A floating-point caveat.* [Numbers & Arithmetic](/synapse/programming-languages/java/first-steps/numbers-and-arithmetic) showed that `0.1 + 0.2` is not exactly `0.3`. A `==` test turns that tiny error into a wrong answer:

```java run
public class Main {
    public static void main(String[] args) {
        System.out.println(0.1 + 0.2 == 0.3);
        System.out.println(0.1 + 0.2);
    }
}
```

**Output:**
```
false
0.30000000000000004
```

`0.1 + 0.2` is `0.30000000000000004`, not `0.3`, so `== 0.3` is `false`. Nothing is broken: `double` stores approximations, and `==` compares them exactly. The fix is to ask "are these *close*?":

```java run
public class Main {
    public static void main(String[] args) {
        double sum = 0.1 + 0.2;
        System.out.println(sum == 0.3);
        System.out.println(Math.abs(sum - 0.3) < 1e-9);
    }
}
```

**Output:**
```
false
true
```

`Math.abs(sum - 0.3)` is the size of the difference. It is far below `1e-9` (0.000000001), so the two count as equal. Pick the tolerance to suit the size of your values. Near `1e9`, neighbouring `double`s are about `1.2e-7` apart, so `1e-9` would be too strict there <abbr title="Java SE 21 API, java.lang.Math.ulp">[13]</abbr>.

One `double` is not even equal to itself: **NaN**, the "not a number" that `0.0 / 0` produces. The rule is fixed: `==` with NaN is always `false` <abbr title="The Java Language Specification, Java SE 21, §15.21.1">[11]</abbr>.

```java run
public class Main {
    public static void main(String[] args) {
        double bad = 0.0 / 0;
        System.out.println(bad == bad);
        System.out.println(Double.isNaN(bad));
    }
}
```

**Output:**
```
false
true
```

To test for NaN, call `Double.isNaN` <abbr title="Java SE 21 API, java.lang.Double.isNaN">[12]</abbr>.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Parenthesise whenever `&&` and `||` mix, whenever `!` negates a comparison, and whenever a comparison sits inside a `+` chain. Never compare `double`s with `==`. Test that the difference is within a small tolerance (`Math.abs(a - b) < 1e-9`) instead.

The cost of trusting `==` on floating-point is a comparison that is *false* for values you consider equal, with no error to flag it. It is the same "silent wrong answer" hazard as [integer overflow](/synapse/programming-languages/java/first-steps/numbers-and-arithmetic), in a different disguise.

</div>

---

## 6. Mental-model summary

| Principle | Consequence |
|---|---|
| `boolean` is its own type; there is no truthiness | `boolean b = 1` and `done == 1` won't compile; conditions must be real booleans |
| Comparisons produce a `boolean`; `==` asks, `=` assigns | `boolean ok = (x = 5)` is a compile error, but `(done = true)` on a `boolean` compiles, so use `done` itself |
| Comparisons do not chain | `1 < x < 10` won't compile; write `1 < x && x < 10` |
| `&&`/`||`/`!` combine booleans; `!` binds tightest | `!(a && b)` equals `!a || !b` (De Morgan), not `!a && !b` |
| `&&`/`||` short-circuit; `&`/`|`/`^` do not | A left-hand guard (`x != 0 && 10/x > 0`) protects the right side; a skipped side skips its updates |
| `!` and `+` bind tighter than comparisons; `&&` tighter than `||` | `!age >= 18` and `"adult: " + age >= 18` won't compile; parenthesise |
| Floats are approximate, and NaN equals nothing | Compare `double`s with a tolerance; test NaN with `Double.isNaN` |

## 7. Gotcha checklist

<div style="border-left:4px solid #da5233;background:rgba(218,82,51,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

| Symptom | Likely cause | Fix |
|---|---|---|
| `incompatible types: int cannot be converted to boolean` | a number where a condition belongs (`boolean b = 1`), or `=` written for `==` | write a comparison: `count != 0`, `x == 5` |
| `incomparable types: boolean and int` | a `boolean` compared with a number (`done == 1`) | use the `boolean` itself: `done` |
| A `boolean` variable changed when you only meant to test it | `done = true` where you meant `done == true`; it compiles | test `done` or `!done`, never `== true` |
| `bad operand types for binary operator '<'`, with `first type: boolean` | a chained comparison, `1 < x < 10` | `1 < x && x < 10` |
| `bad operand type int for unary operator '!'` | `!age >= 18`: `!` reached the number first | `!(age >= 18)`, or `age < 18` |
| `bad operand types for binary operator '>='`, with `first type: String` | `"adult: " + age >= 18`: `+` joined the text first | `"adult: " + (age >= 18)` |
| A negated compound condition tests the wrong thing | the `!` was distributed without flipping `&&` and `\|\|` | De Morgan: `!(a && b)` is `!a \|\| !b`; or keep the whole `!( … )` |
| `ArithmeticException: / by zero` despite a guard | `&`/`\|` in place of `&&`/`\|\|`, or the guard on the right | use `&&`/`\|\|` with the guard first |
| A counter in a condition did not change | its `++` sat on a right side that short-circuiting skipped | update the variable on its own line |
| A mixed `&&`/`\|\|` condition groups unexpectedly | `&&` binds tighter than `\|\|` | add parentheses |
| Two equal-looking decimals compare as unequal | floating-point approximation | `Math.abs(a - b) < 1e-9` |
| `x == x` is `false` | `x` is NaN | `Double.isNaN(x)` |

</div>

---

## ✅ Check yourself

One check per objective. Answer before you open anything.

```quiz
{"prompt": "With int x = 5, what does System.out.println(!(x > 3 && x < 4)); print?", "options": ["false", "true", "It does not compile"], "answer": "true"}
```

```quiz
{"prompt": "Which of these lines compiles?", "options": ["boolean b = 1;", "boolean b = 1 < 2 < 3;", "boolean b = 1 < 2 && 2 < 3;"], "answer": "boolean b = 1 < 2 && 2 < 3;"}
```

```quiz
{"prompt": "int n = 0; boolean a = (n > 5) && (++n > 0); System.out.println(a + \" \" + n); — what does it print?", "options": ["false 1", "false 0", "true 1"], "answer": "false 0"}
```

```quiz
{"prompt": "int age = 20; System.out.println(\"adult: \" + age >= 18); — what happens?", "options": ["It prints adult: true", "It prints adult: 20", "It does not compile: + joins the text first, then >= compares a String with an int"], "answer": "It does not compile: + joins the text first, then >= compares a String with an int"}
```

<details>
<summary>Why is <code>0.1 + 0.2 == 0.3</code> false? Write a test that answers true for those two values.</summary>

A `double` stores the nearest binary fraction, not the exact decimal. `0.1 + 0.2` lands on `0.30000000000000004`, and `==` compares exactly. Ask whether the difference is tiny instead:

`Math.abs((0.1 + 0.2) - 0.3) < 1e-9` is `true`.

</details>

<details>
<summary>The 🧪 box below: what do its lines print, and what changes with <code>&amp;</code>?</summary>

`5 > 3` prints `true`. `5 > 3 && 2 > 4` prints `false`. `5 > 3 || 2 > 4` prints `true`. `!(5 > 3)` prints `false`.

With `int n = 0;`, `n != 0 && 100 / n > 0` prints `false`: the left side is `false`, so `&&` never divides. With `&`, both sides run, and `100 / 0` throws `java.lang.ArithmeticException: / by zero`.

</details>

---

## 📚 Sources

1. *The Java Language Specification, Java SE 21*, §4.2.5 "The `boolean` Type and `boolean` Values" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-4.html#jls-4.2.5>
2. *The Java Language Specification, Java SE 21*, §3.9 "Keywords" ("`true` and `false` are not keywords"; they are boolean literals) — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-3.html#jls-3.9>
3. *The Java Language Specification, Java SE 21*, §15.20.1 "Numerical Comparison Operators" and §15.21.1 "Numerical Equality Operators" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.20.1>
4. *The Java Language Specification, Java SE 21*, §15.26 "Assignment Operators" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.26>
5. *The Java Language Specification, Java SE 21*, §15.20 "Relational Operators" (`a<b<c` "is always a compile-time error") — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.20>
6. *The Java Language Specification, Java SE 21*, §15.23 "Conditional-And Operator `&&`" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.23>
7. *The Java Language Specification, Java SE 21*, §15.24 "Conditional-Or Operator `||`" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.24>
8. *The Java Language Specification, Java SE 21*, §15.22.2 "Boolean Logical Operators `&`, `^`, and `|`" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.22.2>
9. *The Java Language Specification, Java SE 21*, Chapter 15 "Expressions" ("Precedence among operators is managed by a hierarchy of grammar productions") — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html>
10. *The Java Language Specification, Java SE 21*, §15.15.6 "Logical Complement Operator `!`" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.15.6>
11. *The Java Language Specification, Java SE 21*, §15.21.1 "Numerical Equality Operators `==` and `!=`" ("If either operand is NaN, then the result of `==` is false") — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.21.1>
12. Java SE 21 API, `java.lang.Double.isNaN` — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Double.html#isNaN(double)>
13. Java SE 21 API, `java.lang.Math.ulp` (the distance to the next `double`) — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Math.html#ulp(double)>

---

<div style="border-left:4px solid #6d28d9;background:rgba(109,40,217,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

🧪 **Predict, then check.** Predict each line's output before running:

- `System.out.println(5 > 3);`
- `System.out.println(5 > 3 && 2 > 4);`
- `System.out.println(5 > 3 || 2 > 4);`
- `System.out.println(!(5 > 3));`

Then a harder one: with `int n = 0;`, what does `System.out.println(n != 0 && 100 / n > 0);` print? What would change if you wrote `&` instead of `&&`? Explain the second in terms of short-circuiting before you run it.

</div>

## Your Turn

Before you move on, check your understanding with the coach — explain the idea, apply it, weigh the trade-offs, then defend your reasoning.

<div class="concept-coach"></div>
