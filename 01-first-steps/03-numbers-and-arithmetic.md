---
title: Numbers & Arithmetic
summary: Java arithmetic runs on fixed-width typed values, so the operands' types — not the math you intend — decide the result. Integer division truncates toward zero, % takes the dividend's sign, mixing types promotes to the wider one, casts and += convert deliberately, int overflow wraps silently, and double is approximate. Update operators, precedence and the Math class, with every trap shown as real output.
prereqs: []
---

# Numbers & Arithmetic — When the Type Decides the Answer

Java's arithmetic looks like the maths you already know: `+`, `-`, `*`, `/`. But it obeys one rule the maths classroom never mentioned. **The result is shaped by the operands' types, not by the answer you have in mind.**

An **operand** is a value an operator works on: in `7 / 2`, the operands are `7` and `2`.

- Divide two integers, and the fraction vanishes.
- Push an `int` past its range, and it wraps silently to a negative number.
- Mix an `int` with a `double`, and the whole expression becomes a `double`.

The same `/` means different things depending on what sits to its left and right. This chapter is about reading those types so the numbers come out right.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **The core idea.**

- Java arithmetic is shaped by the **operands' types**, not the answer you have in mind.
- The same `/` can truncate, promote, or silently overflow depending on its operands.
- Reading those types is how you make the numbers come out right.

</div>

This builds directly on [the primitive types](/synapse/programming-languages/java/first-steps/variables-and-primitive-types): the sizes and ranges from that chapter decide each result here. Every output below was produced by compiling and running the code on Java 21.

**You'll be able to:** predict the result of `/` and `%` on whole numbers, negatives included; write a division that keeps its fraction, by converting an operand before the division; predict when `int` arithmetic overflows, and fix it with `long` or `Math.multiplyExact`; update a variable with `+=` and `++`, and predict the value `a++` hands back; explain why `0.1 + 0.2` does not print `0.3`.

<div style="border-left:4px solid #15448e;background:rgba(21,68,142,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

📘 **How to read the Intuition boxes.** Each one is built in three moves:

1. **The mechanism** — what the compiler and the JVM *do*.
2. **A concrete bite** — a specific, runnable failure (often a real compiler error), shown so the trap is visible.
3. **The earned rule** — the decision heuristic, now justified rather than asserted, plus its cost.

</div>

---

## Table of contents

1. [The arithmetic operators](#1-the-arithmetic-operators)
2. [Integer division truncates](#2-integer-division-truncates)
3. [Mixing numeric types, and casting](#3-mixing-numeric-types-and-casting)
4. [Silent integer overflow](#4-silent-integer-overflow)
5. [Decimals are approximate](#5-decimals-are-approximate)
6. [Precedence and the `Math` class](#6-precedence-and-the-math-class)
7. [Mental-model summary](#7-mental-model-summary)
8. [Gotcha checklist](#8-gotcha-checklist)
9. [Check yourself](#-check-yourself)
10. [Sources](#-sources)

---

## 1. The arithmetic operators

Five operators do the everyday arithmetic:

- `+` adds, `-` subtracts, and `*` multiplies.
- `/` divides; it gets its own section, next.
- `%` gives the **remainder**: what is left over after a division.

```java run
public class Main {
    public static void main(String[] args) {
        System.out.println(7 + 2);
        System.out.println(7 - 2);
        System.out.println(7 * 2);
        System.out.println(7 % 2);
    }
}
```

**Output:**
```
9
5
14
1
```

**Analysis.** `7 + 2 = 9`, `7 - 2 = 5` and `7 * 2 = 14`. `7 % 2 = 1`, because `7` is `3 * 2 + 1`: the remainder is `1`. `%` is how you test divisibility (a remainder of `0` when dividing by `2` means "even"). It is also how you fold a value into a range.

**Intuition.**
*Mechanism.* `%` returns the remainder, and in Java its sign follows the **left** operand, the **dividend** (the number being divided), not the right <abbr title="The Java Language Specification, Java SE 21, §15.17.3">[1]</abbr>.

*Concrete bite.* So it is not the mathematical "modulo," which is never negative for a positive divisor:

```java run
public class Main {
    public static void main(String[] args) {
        System.out.println(-7 % 2);
        System.out.println(7 % -2);
    }
}
```

**Output:**
```
-1
1
```

`-7 % 2` is `-1`, not `1`: the result took the sign of `-7`. `7 % -2` is `1`, taking the sign of `7`. The magnitude is the remainder; the sign comes from the dividend. When you need the never-negative version, `Math.floorMod` gives it; its result takes the divisor's sign <abbr title="Java SE 21 API, java.lang.Math">[2]</abbr>:

```java run
public class Main {
    public static void main(String[] args) {
        System.out.println(-7 % 2);
        System.out.println(Math.floorMod(-7, 2));
        System.out.println(-7 / 2);
    }
}
```

**Output:**
```
-1
1
-3
```

The last line is a preview of §2: `-7 / 2` is `-3`, not `-4`.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Use `%` for remainders and divisibility. When you need an always-non-negative "wrap" of a possibly-negative number, use `Math.floorMod`, which returns a non-negative result for a positive divisor. The cost of assuming `%` is mathematical modulo is an off-by-a-sign bug. It appears exactly when the input goes negative.

</div>

### Updating a variable: `+=`, `++`, `--`

Programs often change a variable by a step: add points to a score, count one more item. `score = score + 5;` reads the current value, adds `5`, and stores the result back in `score`. Java has shorter forms for this:

- `score += 5;` means the same as `score = score + 5;`. There are also `-=`, `*=`, `/=` and `%=`.
- `score++;` adds 1, and `score--;` subtracts 1.

```java run
public class Main {
    public static void main(String[] args) {
        int score = 10;
        score = score + 5;   // read score, add 5, store the result back
        System.out.println(score);
        score += 5;          // the same, shorter
        System.out.println(score);
        score++;             // add 1
        System.out.println(score);
        score--;             // subtract 1
        System.out.println(score);
        score *= 2;          // also -=, /=, %=
        System.out.println(score);
    }
}
```

**Output:**
```
15
20
21
20
40
```

*Non-example: using `a++` as a value.* On a line of its own, `a++` adds 1 and nothing more. Inside a larger expression, it also hands back a value, and that value is the **old** one <abbr title="The Java Language Specification, Java SE 21, §15.14.2">[3]</abbr>. Written in front, `++a` adds 1 first and hands back the **new** value:

```java run
public class Main {
    public static void main(String[] args) {
        int a = 5;
        int b = a++;   // b gets the OLD value, then a goes up
        System.out.println(a);
        System.out.println(b);
        int c = 5;
        int d = ++c;   // c goes up first, then d gets the NEW value
        System.out.println(c);
        System.out.println(d);
    }
}
```

**Output:**
```
6
5
6
6
```

Both `a` and `c` ended at `6`. Only the value handed to `b` and `d` differed. Keep `++` and `--` on lines of their own, and the difference never matters.

---

## 2. Integer division truncates

`/` between two integers is **integer division**: it gives the whole-number quotient and discards the remainder.

```java run
public class Main {
    public static void main(String[] args) {
        System.out.println(7 / 2);
        System.out.println(1 / 2);
        System.out.println(9 / 10);
    }
}
```

**Output:**
```
3
0
0
```

**Analysis.** `7 / 2` is `3` (not `3.5`), `1 / 2` is `0`, and `9 / 10` is `0`. The fraction is not rounded. It is **truncated**: dropped toward zero, so `-7 / 2` is `-3` <abbr title="The Java Language Specification, Java SE 21, §15.17.2">[4]</abbr>. Both operands are `int`, so the result is an `int`, and an `int` has nowhere to keep a fractional part.

**Intuition.**
*Mechanism.* When both operands are integer types, `/` computes the integer quotient. The result type is that integer type, so a fractional part cannot exist.

*Concrete bite.* The average bug: a `double` result produced one step too late. The first line declares two `int` variables in one statement; a comma separates them.

```java run
public class Main {
    public static void main(String[] args) {
        int total = 7, count = 2;
        double average = total / count;   // looks right, isn't
        System.out.println(average);
    }
}
```

**Output:**
```
3.0
```

`average` is a `double`, but the right-hand side `total / count` is `int / int`. It is evaluated first, as `3`, and only *then* widened to `3.0`. The division already happened with integers, and widening the answer afterward cannot recover the lost `.5`. So the "average" of 7 and 2 prints `3.0`.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Integer `/` truncates. To get a real quotient, make sure at least one operand is floating-point *before* the division runs.

The cost of forgetting is a silent wrong answer rather than an error. `3.0` looks reasonable, which is what makes this Java's most common arithmetic bug. The fix is the next section's job.

Dividing an integer by zero is different: it is not silent. `7 / 0` and `7 % 0` throw an `ArithmeticException` (`/ by zero`) at run time <abbr title="The Java Language Specification, Java SE 21, §15.17.2">[4]</abbr>, as [What Java is](/synapse/programming-languages/java/first-steps/what-java-is-and-running-code) showed.

</div>

---

## 3. Mixing numeric types, and casting

When operands have different numeric types, Java **promotes** the narrower to the wider before computing: `int / double` becomes `double / double` <abbr title="The Java Language Specification, Java SE 21, §5.6">[5]</abbr>. To force a type yourself, **cast**: write the type in parentheses, `(double)`, in front of a value.

```java run
public class Main {
    public static void main(String[] args) {
        System.out.println(7 / 2.0);                  // one double operand → double division
        int total = 7, count = 2;
        System.out.println((double) total / count);   // cast an operand first
        System.out.println((int) 3.9);                // narrowing cast → truncates
    }
}
```

**Output:**
```
3.5
3.5
3
```

**Analysis.**

- `7 / 2.0`: the `2.0` is a `double`, so `7` is promoted to `7.0`, and the division is `7.0 / 2.0 = 3.5`.
- `(double) total / count`: the cast turns `total` into `7.0` first, and `(double)` binds to `total` alone. So it is `7.0 / 2 = 3.5`.
- `(int) 3.9` is a **narrowing** cast, to a type with a smaller range. It chops the fraction toward zero, giving `3`, not `4`.

**Intuition.**
*Mechanism.* A cast `(double) x` produces a value of the target type for that one spot; automatic promotion does the same when types mix. Precedence matters: a cast binds tightly, to the operand immediately after it. `(double) total / count` casts `total`, *then* divides.

*Concrete bite.* Cast the *result* instead of an operand, and the bug survives:

```java run
public class Main {
    public static void main(String[] args) {
        System.out.println((double) (7 / 2));   // cast too late
    }
}
```

**Output:**
```
3.0
```

The parentheses force `7 / 2` first (integer division → `3`), and only then cast `3` to `3.0`. You converted the answer *after* the fraction was already gone. Contrast `(double) 7 / 2`, which casts `7` first and gives `3.5`.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** To divide as reals, get a floating-point operand into the expression *before* the division: `(double) total / count`, not `(double) (total / count)`. The cost of casting is that **narrowing** casts (`(int) 3.9`) silently truncate. They discard information on purpose: you are telling the compiler "I accept the loss." That same silent loss, uninvited, is the next trap.

</div>

### Small types are promoted to `int`

Promotion has a second rule: arithmetic never runs on `byte`, `short` or `char`. Each operand is promoted to at least `int` first <abbr title="The Java Language Specification, Java SE 21, §5.6">[5]</abbr>. So `byte + byte` is an `int`, and it does not fit back into a `byte`:

```java run
public class Main {
    public static void main(String[] args) {
        byte a = 10;
        byte b = 20;
        byte sum = a + b;
        System.out.println(sum);
    }
}
```

**Compiler error:**
```
Main.java:5: error: incompatible types: possible lossy conversion from int to byte
        byte sum = a + b;
                     ^
1 error
```

`a + b` is `30`, which fits a `byte`. But `a` and `b` are variables, not constants, so the compiler checks the *type* of `a + b`, and that is `int`. The same promotion makes a `char` act as its character code: `'A' + 1` is the `int` `66`. Cast it back, `(char) ('A' + 1)`, and you get `B`.

```java run
public class Main {
    public static void main(String[] args) {
        char c = 'A';
        System.out.println(c + 1);
        System.out.println((char) (c + 1));
        c++;
        System.out.println(c);
    }
}
```

**Output:**
```
66
B
B
```

### A cast to a smaller type can change the value

A narrowing cast between whole-number types keeps only the bits that fit <abbr title="The Java Language Specification, Java SE 21, §5.1.3">[6]</abbr>. A value outside the target range comes out as a different number. A `double` too big for an `int` stops at the `int` limit:

```java run
public class Main {
    public static void main(String[] args) {
        System.out.println((int) 3.9);
        System.out.println((int) -3.9);
        System.out.println((byte) 200);
        System.out.println((int) 3.0e10);
    }
}
```

**Output:**
```
3
-3
-56
2147483647
```

`(int) -3.9` is `-3`: toward zero, not down. `(byte) 200` is `-56`, a different number with no warning. `3.0e10` is 3 × 10¹⁰ written in **scientific notation**; cast to `int`, it stops at `2147483647`.

*Non-example: `+=` hides a cast.* `b = b + 1;` on a `byte` does not compile, for the reason above. `b += 1;` does, because a compound assignment casts its result back to the variable's type <abbr title="The Java Language Specification, Java SE 21, §15.26.2">[7]</abbr>. That hidden cast wraps like any other:

```java run
public class Main {
    public static void main(String[] args) {
        byte b = 10;
        b += 1;             // compiles: += casts back to byte
        System.out.println(b);
        byte big = 120;
        big += 10;          // 130 does not fit: the hidden cast wraps it
        System.out.println(big);
    }
}
```

**Output:**
```
11
-126
```

`120 + 10` is `130`, past a `byte`'s `127`, and the hidden cast turned it into `-126`. The compiler said nothing, because `+=` promised the cast.

---

## 4. Silent integer overflow

An `int` is 32 bits, with a range of −2147483648 to 2147483647. When arithmetic produces a result outside that range, Java does **not** grow the type to fit. It **wraps around**, silently, to the opposite end. There is no error at all: the integer operators do not signal overflow in any way <abbr title="The Java Language Specification, Java SE 21, §4.2.2">[8]</abbr>.

```java run
public class Main {
    public static void main(String[] args) {
        int max = Integer.MAX_VALUE;
        System.out.println(max);
        System.out.println(max + 1);
    }
}
```

**Output:**
```
2147483647
-2147483648
```

**Analysis.** `Integer.MAX_VALUE` is the largest `int`, `2147483647`. Add `1`, and instead of `2147483648` you get `-2147483648`, the *smallest* `int`. The value rolled over the top of the range straight to the bottom, like a car odometer passing its maximum. No exception, no warning: a negative number where a larger positive was expected.

**Intuition.**
*Mechanism.* `int + int` is always an `int`. The result keeps only the low 32 bits. When the true answer needs a 33rd bit, that bit is discarded, and because of how signed integers are encoded, discarding it flips the sign. The type never widens itself to fit.

*Concrete bite.* It hides in ordinary code, such as the product of two modest numbers:

```java run
public class Main {
    public static void main(String[] args) {
        int a = 100000;
        int b = 100000;
        System.out.println(a * b);     // ten billion — but computed as an int
    }
}
```

**Output:**
```
1410065408
```

`100000 * 100000` is ten billion, far beyond an `int`, so it wraps to a meaningless `1410065408`. Nothing looked dangerous; the type quietly betrayed the arithmetic.

*Non-example: a `long` box, too late.* Storing the product in a `long` does not help. The multiplication still runs as `int * int`, wraps, and only then widens, as with `average` in §2. Make an operand a `long` *before* the multiply:

```java run
public class Main {
    public static void main(String[] args) {
        int a = 100000;
        int b = 100000;
        long wrong = a * b;          // int * int wraps first, then widens
        long right = (long) a * b;   // a is a long before the multiply
        System.out.println(wrong);
        System.out.println(right);
        System.out.println(100000L * 100000);
    }
}
```

**Output:**
```
1410065408
10000000000
10000000000
```

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** When a value can pass 2147483647, use `long` (64 bits, up to 9223372036854775807). Make at least one operand a `long` so the operation runs in 64 bits: `100000L * 100000` gives the correct `10000000000`. The cost of ignoring overflow is the most dangerous bug there is: a wrong number with nothing to flag it. When you must be certain, `Math.multiplyExact` and `Math.addExact` **throw** instead of wrapping <abbr title="Java SE 21 API, java.lang.Math">[2]</abbr>:

</div>

```java run
public class Main {
    public static void main(String[] args) {
        System.out.println(Math.multiplyExact(100000, 100000));
    }
}
```

**Output** *(a thrown exception; the full stack trace follows the first line, pointing at the `multiplyExact` call):*
```
Exception in thread "main" java.lang.ArithmeticException: integer overflow
```

Swapping a silent wrong answer for a loud `ArithmeticException` is usually the trade you want. [Exceptions](/synapse/programming-languages/java/robust-oop/exceptions) covers them in full.

---

## 5. Decimals are approximate

A `double` stores a number in binary, in 64 bits. Most decimal fractions, `0.1` among them, have no exact binary form, so a `double` holds the nearest value it can <abbr title="Java SE 21 API, java.math.BigDecimal, the BigDecimal(double) constructor">[9]</abbr>. The tiny difference shows up in arithmetic:

```java run
public class Main {
    public static void main(String[] args) {
        System.out.println(0.1 + 0.2);
        System.out.println(1.0 - 0.9);
        System.out.println(1.0 / 3);
    }
}
```

**Output:**
```
0.30000000000000004
0.09999999999999998
0.3333333333333333
```

**Analysis.** Neither `0.1` nor `0.2` is stored exactly, and their sum lands a hair above `0.3`. `1.0 - 0.9` lands a hair below `0.1`. `1.0 / 3` has no exact form in decimal either, and `println` shows 16 digits of it. None of this is a bug in Java: it is how binary floating-point works on every language that uses it.

**Intuition.**
*Mechanism.* `double` trades exactness for range and speed. Each value is the nearest one of a fixed set of binary fractions, and each operation rounds its result to that set.

*Concrete bite.* Floating-point division by zero does not throw, unlike integer division. It gives a special value: **Infinity**, or **NaN** ("not a number") for `0.0 / 0` <abbr title="The Java Language Specification, Java SE 21, §15.17.2">[4]</abbr>. The program carries on with it:

```java run
public class Main {
    public static void main(String[] args) {
        System.out.println(7.0 / 0);
        System.out.println(-7.0 / 0);
        System.out.println(0.0 / 0);
    }
}
```

**Output:**
```
Infinity
-Infinity
NaN
```

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Treat `double` results as close, not exact: expect `0.30000000000000004`, and never rely on a `double` landing on an exact decimal. For money, count in whole cents with `long`, or use `java.math.BigDecimal`, which stores decimal digits exactly <abbr title="Java SE 21 API, java.math.BigDecimal">[10]</abbr>. The cost is ceremony: you add two `BigDecimal` values with a method, not with `+`.

</div>

---

## 6. Precedence and the `Math` class

When several operators meet in one expression, Java follows **precedence**. `*`, `/` and `%` bind tighter than `+` and `-`, and parentheses override the order. Operators of the same level run left to right: `10 - 4 - 3` is `(10 - 4) - 3`, which is `3`. For arithmetic beyond the basic operators, the `Math` class supplies `sqrt`, `pow`, `abs`, `max`, `min`, and more <abbr title="Java SE 21 API, java.lang.Math">[2]</abbr>.

```java run
public class Main {
    public static void main(String[] args) {
        System.out.println(2 + 3 * 4);     // * before + → 14
        System.out.println((2 + 3) * 4);   // parentheses → 20
        System.out.println(Math.max(10, 7));
        System.out.println(Math.sqrt(144.0));
        System.out.println(Math.pow(2, 10));
    }
}
```

**Output:**
```
14
20
10
12.0
1024.0
```

**Analysis.**

- `2 + 3 * 4` is `2 + 12 = 14`, because `*` binds tighter than `+`. Parentheses force `5 * 4 = 20`.
- `Math.max` returns the larger value, and `Math.sqrt(144.0)` is `12.0`.
- `Math.pow(2, 10)` is `1024.0`. Note the `.0`: `Math.pow` always returns a `double`, so even a whole-number power comes back as a decimal.

Left to right matters for `-` and `/`, where the order changes the answer:

```java run
public class Main {
    public static void main(String[] args) {
        System.out.println(10 - 4 - 3);
        System.out.println(8 / 4 / 2);
        System.out.println(2 * 3 % 4);
        System.out.println(-2 * 3);
    }
}
```

**Output:**
```
3
1
2
-6
```

`8 / 4 / 2` is `(8 / 4) / 2 = 1`, not `8 / (4 / 2) = 4`. `2 * 3 % 4` is `6 % 4 = 2`: `*` and `%` share a level, so they run left to right too.

**Intuition.**
*Mechanism.* Precedence is fixed grammar the compiler applies before anything runs. `Math.pow` and `Math.sqrt` are library methods that take and return `double`.

*Concrete bite.* Assuming `Math.pow` yields an integer bites the moment you store its result in an `int`:

```java run
public class Main {
    public static void main(String[] args) {
        int kib = Math.pow(2, 10);
        System.out.println(kib);
    }
}
```

**Compiler error:**
```
Main.java:3: error: incompatible types: possible lossy conversion from double to int
        int kib = Math.pow(2, 10);
                          ^
1 error
```

`Math.pow` returns `1024.0`, a `double`, and a `double` will not fit into an `int` without losing its fractional part. So the compiler refuses. The fix is a deliberate cast, `int kib = (int) Math.pow(2, 10);`, which gives `1024`.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Let precedence and `Math` do the arithmetic, but remember that `Math.pow` and `Math.sqrt` return `double`. Assign to a `double`, or cast deliberately when you want an `int`, accepting the truncation. Reach for parentheses whenever the grouping is not obvious at a glance. They cost nothing and prevent precedence surprises.

</div>

---

## 7. Mental-model summary

| Principle | Consequence |
|---|---|
| The operands' types decide an operator's behaviour | The same `/` means integer or floating-point division depending on its operands |
| `int / int` truncates toward zero; `%` takes the dividend's sign | `7 / 2` is `3`, `-7 / 2` is `-3`, `-7 % 2` is `-1`; `Math.floorMod` for a non-negative wrap |
| `a++` hands back the old value, `++a` the new one | Keep `++` and `--` on lines of their own |
| Mixed types promote to the wider; `byte`, `short` and `char` promote to `int` | Put a floating-point operand in *before* dividing: `(double) total / count`; `byte + byte` is an `int` |
| Narrowing casts, and the hidden cast in `+=`, silently drop information | `(int) 3.9` is `3`; `(byte) 200` is `-56`; a `byte` of `120` after `+= 10` is `-126` |
| `int` arithmetic wraps past its range with no error | `Integer.MAX_VALUE + 1` is negative; make an operand `long` before the operation, or use `Math.*Exact` to throw |
| `double` is approximate; floating-point `/ 0` gives Infinity or NaN | `0.1 + 0.2` prints `0.30000000000000004`; count money in `long` cents or `BigDecimal` |
| `*` `/` `%` bind tighter than `+` `-`, and each level runs left to right; `Math.pow`/`sqrt` return `double` | Parenthesise for clarity; store `Math.pow` results in a `double` |

## 8. Gotcha checklist

<div style="border-left:4px solid #da5233;background:rgba(218,82,51,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

| Symptom | Likely cause | Fix |
|---|---|---|
| A division gives a whole number when you expected a fraction | both operands are integers | make one floating-point *before* dividing: `(double) a / b`, or `a / 2.0` |
| `double x = a / b;` prints a `.0` value | the division ran as `int / int`, then widened | cast an operand, not the result |
| A sum or product is suddenly negative or absurd | `int` overflow | make an operand `long` (`(long) a * b`, `100000L`), or use `Math.addExact` / `Math.multiplyExact` |
| `long x = a * b;` is still wrong | `a * b` ran as `int * int` and wrapped before the widening | cast an operand: `(long) a * b` |
| `ArithmeticException: / by zero` | an integer `/` or `%` by `0` | check the divisor before dividing |
| `Infinity` or `NaN` in the output | a floating-point division by zero | check the divisor before dividing |
| `0.30000000000000004` where you expected `0.3` | `double` is binary and approximate | expect it; for money use `long` cents or `BigDecimal` |
| `possible lossy conversion from int to byte` on `byte c = a + b` | `byte` operands are promoted to `int` | declare `c` as `int`, or cast: `(byte) (a + b)` |
| A `byte` or `short` turns negative after `+=` | the hidden cast in `+=` wrapped a value past the range | use `int` or a wider type |
| `possible lossy conversion from double to int` | a `double` (often a `Math.pow`/`sqrt` result) went into an `int` | assign to a `double`, or cast explicitly |
| `%` of a negative number has the "wrong" sign | the remainder follows the dividend | use `Math.floorMod` for a non-negative result |
| `b = a++` gave `b` the old value | postfix `++` hands back the value before the increment | put `a++;` on its own line, or use `++a` |
| An expression groups unexpectedly | precedence (`*` before `+`), or left-to-right order (`8 / 4 / 2`) | add parentheses to force your order |

</div>

---

## ✅ Check yourself

One check per objective. Answer before you open anything.

```quiz
{"prompt": "What do -7 / 2 and -7 % 2 print?", "options": ["-4 and 1", "-3 and -1", "-3.5 and 1"], "answer": "-3 and -1"}
```

```quiz
{"prompt": "Which expression prints 3.5?", "options": ["(double) (7 / 2)", "7 / 2", "(double) 7 / 2"], "answer": "(double) 7 / 2"}
```

```quiz
{"prompt": "int a = 100000; int b = 100000; long r = a * b; What does System.out.println(r) print?", "options": ["10000000000", "1410065408", "An ArithmeticException"], "answer": "1410065408"}
```

```quiz
{"prompt": "After int a = 5; int b = a++; what are a and b?", "options": ["a is 6, b is 6", "a is 5, b is 6", "a is 6, b is 5"], "answer": "a is 6, b is 5"}
```

<details>
<summary>Why does <code>System.out.println(0.1 + 0.2);</code> print <code>0.30000000000000004</code>? And what does <code>7.0 / 0</code> print?</summary>

A `double` stores binary fractions, and `0.1` and `0.2` have no exact binary form <abbr title="Java SE 21 API, java.math.BigDecimal, the BigDecimal(double) constructor">[9]</abbr>. Each is stored as the nearest value, and the sum of the two nearest values is a hair above `0.3`.

`7.0 / 0` prints `Infinity`. Floating-point division by zero gives a special value; only integer division by zero throws.

</details>

<details>
<summary>The 🧪 box below: what do the four lines print?</summary>

`5 / 2` prints `2`: both operands are `int`, so the division truncates. `5 / 2.0` prints `2.5`: `2.0` is a `double`, so `5` is promoted. `(double) 5 / 2` prints `2.5`: the cast makes `5` a `double` before the division.

`(double) (5 / 2)` prints `2.0`: the parentheses run `5 / 2` first, as integers, giving `2`, and only then cast it.

</details>

---

## 📚 Sources

1. *The Java Language Specification, Java SE 21*, §15.17.3 "Remainder Operator `%`" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.17.3>
2. Java SE 21 API, `java.lang.Math` (`floorMod`, `addExact`, `multiplyExact`, `pow`) — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Math.html>
3. *The Java Language Specification, Java SE 21*, §15.14.2 "Postfix Increment Operator `++`" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.14.2>
4. *The Java Language Specification, Java SE 21*, §15.17.2 "Division Operator `/`" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.17.2>
5. *The Java Language Specification, Java SE 21*, §5.6 "Numeric Contexts" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-5.html#jls-5.6>
6. *The Java Language Specification, Java SE 21*, §5.1.3 "Narrowing Primitive Conversion" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-5.html#jls-5.1.3>
7. *The Java Language Specification, Java SE 21*, §15.26.2 "Compound Assignment Operators" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.26.2>
8. *The Java Language Specification, Java SE 21*, §4.2.2 "Integer Operations" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-4.html#jls-4.2.2>
9. Java SE 21 API, `java.math.BigDecimal`, constructor `BigDecimal(double)` ("0.1 cannot be represented exactly as a `double`") — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/math/BigDecimal.html#%3Cinit%3E(double)>
10. Java SE 21 API, `java.math.BigDecimal` — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/math/BigDecimal.html>

---

<div style="border-left:4px solid #6d28d9;background:rgba(109,40,217,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

🧪 **Predict, then check.** Predict the exact output of each line before running it. `System.out.println(5 / 2);` · `System.out.println(5 / 2.0);` · `System.out.println((double) 5 / 2);` · `System.out.println((double) (5 / 2));`. Three of the four differ.

Explain, in terms of *when* the division happens and *what types* its operands have, why two print `2.5`, one prints `2`, and one prints `2.0`.

</div>

## Your Turn

Before you move on, check your understanding with the coach — explain the idea, apply it, weigh the trade-offs, then defend your reasoning.

<div class="concept-coach"></div>
