---
title: Variables & Primitive Types
summary: Java is statically typed — every variable has a type fixed when you declare it and checked by the compiler on every line. The eight primitives hold their value directly; declarations, names, definite assignment, final, exact ranges, literals and their types, and var (inferred, not dynamic) — with every trap shown as a real compiler error.
prereqs: []
---

# Variables & Primitive Types — Typed Boxes for Values

A **variable** is a named place to keep a value so you can use it again. In Java that place has one more property, and it shapes everything you write: a **type**.

- The type says what the variable may hold: a whole number, a decimal, text.
- You fix the type when you **declare** the variable, and it never changes.
- The compiler checks every line that uses the variable against that type.

Java is **statically typed**: *static* means the type is decided before the program runs. You tell the compiler "this name holds an `int`." From then on it refuses to compile any line that breaks the promise.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **The core idea.**

- A variable is a named place to keep a value.
- Its **type** is fixed when you declare it and checked by the compiler on every line.
- **Statically typed** means the type is decided *before the program runs*.

</div>

The simplest values are the **primitives**: eight built-in types for numbers, true/false, and single characters. A primitive variable holds its value **directly**: the box *is* the number.

That word "directly" matters later. Java has a second family of variable, the **reference**, which holds the location of a value rather than the value itself. [References, equality and the object model](/synapse/programming-languages/java/classes-and-objects/references-equality-and-the-object-model) teaches it. For now, primitives hold their value. Every output below was produced by compiling and running the code on Java 21.

**You'll be able to:** declare a variable with a type and a legal name, and say why `2nd` and `class` are rejected; fix "might not have been initialized" by giving a variable a value before it is read; pick a primitive type for a value from the exact ranges; predict whether a declaration compiles, from the literal's own type and the variable's type; explain why a `var` variable still has one fixed type, and name where `var` is not allowed.

<div style="border-left:4px solid #15448e;background:rgba(21,68,142,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

📘 **How to read the Intuition boxes.** Each one is built in three moves:

1. **The mechanism** — what the compiler and the JVM *do*.
2. **A concrete bite** — a specific, runnable failure (often a real compiler error), shown so the trap is visible.
3. **The earned rule** — the decision heuristic, now justified rather than asserted, plus its cost.

</div>

---

## Table of contents

1. [Declaring a variable: type, name, value](#1-declaring-a-variable-type-name-value)
2. [Static typing: the type is fixed and checked](#2-static-typing-the-type-is-fixed-and-checked)
3. [The eight primitive types](#3-the-eight-primitive-types)
4. [Literals: how you write a value fixes its type](#4-literals-how-you-write-a-value-fixes-its-type)
5. [`var`: inferred, not dynamic](#5-var-inferred-not-dynamic)
6. [Mental-model summary](#6-mental-model-summary)
7. [Gotcha checklist](#7-gotcha-checklist)
8. [Check yourself](#-check-yourself)
9. [Sources](#-sources)

---

## 1. Declaring a variable: type, name, value

You **declare** a variable by writing its type, then its name, then `=` and a starting value. `int age = 25;` reads "make an `int` named `age`, starting at `25`." The type (`int`, a whole number) comes first, and it is not optional.

```java run
public class Main {
    public static void main(String[] args) {
        int age = 25;
        System.out.println(age);
    }
}
```

**Output:**
```
25
```

**Analysis.** `int age = 25;` created a box of type `int`, named it `age`, and put `25` in it. `System.out.println(age)` looked up what `age` holds, `25`, and printed it. Note that `println(age)` has no quotes: it prints the variable's value, not the word "age". The box holds the number itself, not a pointer to it.

```d2
direction: right

name: "age  (a name)" {
  shape: oval
}

value: "int 25  (the value, held directly in the box)" {
  shape: rectangle
}

name -> value: "labels a box holding"
```

**Intuition.**
*Mechanism.* A declaration does two things at once. It tells the compiler the variable's **type**, so the compiler can check every later use. And it reserves a **box** that holds the value directly. The type is decided here, in the source, before the program runs.

*Concrete bite.* Leave out the type, and the compiler doesn't know what `age` is. There is no box, and no permission to make one:

```java run
public class Main {
    public static void main(String[] args) {
        age = 25;
    }
}
```

**Compiler error:**
```
Main.java:3: error: cannot find symbol
        age = 25;
        ^
  symbol:   variable age
  location: class Main
1 error
```

"cannot find symbol" means the compiler looked for a declared variable named `age` and found none. A **dynamically typed** language, such as Python, decides types while the program runs, and there `age = 25` would create the variable on the spot. Java insists you declare it, with a type, first.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Declare before you assign, and declare *with a type*: `int age = 25;`. The cost is a few more keystrokes than a language that creates variables on first use. The payoff: the compiler now knows `age`'s type, and it catches every later line that misuses it at compile time.

</div>

### Declaring now, giving the value later

The starting value is optional. `int age;` makes the box and leaves it empty; a later line **assigns** it a value with `=`. A variable declared inside a method, like every variable in this lesson, is a **local variable**.

```java run
public class Main {
    public static void main(String[] args) {
        int age;         // declared: a box, no value yet
        age = 25;        // assigned: now it holds 25
        System.out.println(age);
    }
}
```

**Output:**
```
25
```

*Non-example: reading the box before anything is in it.* The compiler tracks whether each local variable has surely been given a value before any line reads it. Java calls this **definite assignment** <abbr title="The Java Language Specification, Java SE 21, chapter 16">[1]</abbr>. Read an empty box, and the program does not compile:

```java run
public class Main {
    public static void main(String[] args) {
        int x;
        System.out.println(x);
    }
}
```

**Compiler error:**
```
Main.java:4: error: variable x might not have been initialized
        System.out.println(x);
                           ^
1 error
```

"Initialized" means "given its first value." Java does not quietly fill an empty local variable with `0`. It refuses to compile, so a missing value is caught before the program runs. The fix is to assign the variable on some line before the one that reads it.

### Naming a variable

A variable's name is an **identifier**. The rules come from the language itself <abbr title="The Java Language Specification, Java SE 21, §3.8">[2]</abbr>:

- It is made of letters, digits, `_` and `$`.
- It must **not start with a digit**: `score2` is fine, `2nd` is not.
- It must not be a **keyword**, one of the words Java reserves for itself, such as `class`, `int` or `public` <abbr title="The Java Language Specification, Java SE 21, §3.9">[3]</abbr>.
- Case matters: `age` and `Age` are two different names.

By convention, Java variable names use **camelCase**: start lower-case, and capitalize each later word, as in `totalScore`. Break the first rule, and javac's message does not mention the name at all:

```java run
public class Main {
    public static void main(String[] args) {
        int 2nd = 5;
    }
}
```

**Compiler error:**
```
Main.java:3: error: not a statement
        int 2nd = 5;
        ^
Main.java:3: error: ';' expected
        int 2nd = 5;
           ^
2 errors
```

A name cannot start with a digit, so javac does not read `2nd` as a name. It reads `int` alone as a broken statement and then trips over the rest. `int class = 5;` opens with the same two messages, `not a statement` and `';' expected`. When a declaration line gives these errors, check the name first.

---

## 2. Static typing: the type is fixed and checked

Once a variable has a type, that type is fixed. You can change the *value*, by reassigning it. The new value must be of the variable's type, or convert to it without losing anything. The compiler checks this on every assignment.

```java run
public class Main {
    public static void main(String[] args) {
        int score = 10;
        score = 25;      // fine: 25 is an int, just like score
        System.out.println(score);
    }
}
```

**Output:**
```
25
```

**Analysis.** `score` started at `10`, then we reassigned it to `25`. Both are `int`s, so the compiler allowed it, and the box's content changed from `10` to `25`. Reassignment changes the value; it never changes the type. Note that the second line has no `int`: writing `int score = 25;` again would declare a second `score`, and javac rejects that with `variable score is already defined`.

**Intuition.**
*Mechanism.* The type lives with the variable, not with whatever value you assign. On every assignment the compiler checks the new value's type against the variable's declared type. A mismatch is rejected before the program runs.

*Concrete bite.* Try to put text in an `int`, and the compiler refuses. This is the canonical Java type error:

```java run
public class Main {
    public static void main(String[] args) {
        int n = "hello";
        System.out.println(n);
    }
}
```

**Compiler error:**
```
Main.java:3: error: incompatible types: String cannot be converted to int
        int n = "hello";
                ^
1 error
```

`"hello"` is text, and Java's type for text is `String`. `String` is not one of the eight primitives; [Strings, the basics](/synapse/programming-languages/java/first-steps/strings-the-basics) teaches it. `n` is an `int`, and there is no automatic way to turn arbitrary text into an integer. So the compiler stops you here, at compile time.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** A variable holds exactly its declared type, checked on every assignment. So a whole class of "wrong type of value" bugs is caught before the program runs. The cost is rigidity. To turn text into a number you must convert it deliberately, with a method you will meet in [Input and output](/synapse/programming-languages/java/first-steps/input-and-output).

</div>

### `final`: a value that never changes

Some values should never change once set: the number of days in a week, a tax rate. Put `final` before the type, and the compiler allows exactly one assignment <abbr title="The Java Language Specification, Java SE 21, §4.12.4">[4]</abbr>. By convention a constant's name is in capitals, with `_` between words.

```java run
public class Main {
    public static void main(String[] args) {
        final int DAYS_IN_WEEK = 7;
        int weeks = 3;
        System.out.println(weeks * DAYS_IN_WEEK);
    }
}
```

**Output:**
```
21
```

*Non-example: reassigning a `final` variable.* The type was never the only promise. With `final`, the value is a promise too, and the compiler holds you to it:

```java run
public class Main {
    public static void main(String[] args) {
        final int DAYS_IN_WEEK = 7;
        DAYS_IN_WEEK = 8;
        System.out.println(DAYS_IN_WEEK);
    }
}
```

**Compiler error:**
```
Main.java:4: error: cannot assign a value to final variable DAYS_IN_WEEK
        DAYS_IN_WEEK = 8;
        ^
1 error
```

Mark a variable `final` when its value must not change. Then an accidental reassignment is a compile error, not a wrong answer.

---

## 3. The eight primitive types

Java has exactly eight **primitive** types. You will use `int`, `double`, `boolean`, and `char` constantly; the other four are size variants you reach for occasionally. Here are six of them at work:

```java run
public class Main {
    public static void main(String[] args) {
        int count = 42;                    // whole number (the default integer type)
        long population = 8_000_000_000L;  // bigger whole numbers; note the L
        double price = 19.99;              // decimal number (the default)
        float ratio = 0.5f;                // smaller decimal; note the f
        boolean ready = true;              // true or false, nothing else
        char grade = 'A';                  // a single character, in single quotes
        System.out.println(count);
        System.out.println(population);
        System.out.println(price);
        System.out.println(ratio);
        System.out.println(ready);
        System.out.println(grade);
    }
}
```

**Output:**
```
42
8000000000
19.99
0.5
true
A
```

**Analysis.** Each line declared a differently typed box and printed its value. The output shows three things:

- `long` and `int` both print as plain digits. The `L` on `8_000_000_000L` tells the compiler "this value is a `long`." It must be, because the value is too big for an `int`.
- The underscores in `8_000_000_000L` are visual grouping; the compiler ignores them.
- `char grade = 'A'` uses **single** quotes for one character, and prints as `A`.

Each type's size is counted in **bits**. A bit is one binary digit, a 0 or a 1; more bits hold a wider range of values. Here is the whole set, by family:

| Type | Holds | Example literal | Size | Range |
|---|---|---|---|---|
| `byte` | whole number | `120` | 8 bits | −128 to 127 |
| `short` | whole number | `1000` | 16 bits | −32768 to 32767 |
| `int` | whole number *(default)* | `42` | 32 bits | −2147483648 to 2147483647 |
| `long` | big whole number | `42L` | 64 bits | −9223372036854775808 to 9223372036854775807 |
| `float` | decimal | `0.5f` | 32 bits | fewer digits than `double` |
| `double` | decimal *(default)* | `19.99` | 64 bits | the default precision |
| `char` | one character | `'A'` | 16 bits | character codes 0 to 65535 |
| `boolean` | true / false | `true` | not specified | `true` or `false` |

The whole-number ranges and the `char` range are fixed by the language <abbr title="The Java Language Specification, Java SE 21, §4.2.1">[5]</abbr>. `boolean` has exactly two values, and its size in bits is not defined <abbr title="The Java Tutorials, Primitive Data Types">[6]</abbr>. You do not need to memorize the ranges: each whole-number type carries its own limits as `MIN_VALUE` and `MAX_VALUE`.

```java run
public class Main {
    public static void main(String[] args) {
        System.out.println(Byte.MIN_VALUE);
        System.out.println(Byte.MAX_VALUE);
        System.out.println(Short.MIN_VALUE);
        System.out.println(Short.MAX_VALUE);
        System.out.println(Integer.MIN_VALUE);
        System.out.println(Integer.MAX_VALUE);
        System.out.println(Long.MIN_VALUE);
        System.out.println(Long.MAX_VALUE);
    }
}
```

**Output:**
```
-128
127
-32768
32767
-2147483648
2147483647
-9223372036854775808
9223372036854775807
```

**Intuition.**
*Mechanism.* Each primitive reserves a fixed number of bits, and so represents a fixed range of values. A `byte` has 8 bits, an `int` 32, a `long` 64. The type is not only a label; it decides how many bits the box has.

*Concrete bite.* Because the size is fixed, a value outside a type's range will not fit, and the compiler says so:

```java run
public class Main {
    public static void main(String[] args) {
        byte b = 200;
        System.out.println(b);
    }
}
```

**Compiler error:**
```
Main.java:3: error: incompatible types: possible lossy conversion from int to byte
        byte b = 200;
                 ^
1 error
```

`200` is an ordinary `int`, but a `byte` tops out at `127`. Storing `200` would lose information, so the compiler calls it a "lossy conversion" and refuses.

**Why `byte b = 100;` compiles.** `100` is an `int` literal too, yet this line compiles. Java makes one exception for a fixed value written in the source, called a **constant**. A constant `int` may go into a `byte`, `short` or `char` variable when the value fits that type's range <abbr title="The Java Language Specification, Java SE 21, §5.2">[7]</abbr>. The compiler checks the value itself, `100`, and it fits.

```java run
public class Main {
    public static void main(String[] args) {
        byte small = 100;      // 100 is an int literal, but it fits in a byte
        short medium = 30000;  // fits in a short
        char letter = 65;      // fits in a char: code 65 is 'A'
        double wide = 7;       // an int value goes into a double without loss
        System.out.println(small);
        System.out.println(medium);
        System.out.println(letter);
        System.out.println(wide);
    }
}
```

**Output:**
```
100
30000
A
7.0
```

The last line shows the other direction. An `int` goes into a `double` with no exception needed, because every `int` value fits. [Numbers and arithmetic](/synapse/programming-languages/java/first-steps/numbers-and-arithmetic) covers these conversions in full.

*Non-example: the same value, in a variable.* The exception is for constants only. Put `100` in an ordinary `int` variable first, and the compiler no longer checks the value. It checks the type, and `int` does not always fit in a `byte`:

```java run
public class Main {
    public static void main(String[] args) {
        int n = 100;
        byte b = n;
        System.out.println(b);
    }
}
```

**Compiler error:**
```
Main.java:4: error: incompatible types: possible lossy conversion from int to byte
        byte b = n;
                 ^
1 error
```

A `final` variable counts as a constant when its own value is one <abbr title="The Java Language Specification, Java SE 21, §4.12.4">[4]</abbr>. So `final int n = 100; byte b = n;` compiles and prints `100`.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Pick the type by the range you need:

- `int` for ordinary whole numbers, and `long` when they can pass 2147483647;
- `double` for decimals;
- `boolean` and `char` for their obvious jobs;
- `byte`, `short` or `float` only when memory or an external format demands them.

The cost of a wrong choice is either a compile error (a too-big value) or, worse, a silent **overflow** at run time. Overflow happens when arithmetic pushes a value past the type's range without warning. [Numbers and arithmetic](/synapse/programming-languages/java/first-steps/numbers-and-arithmetic) shows that trap.

</div>

---

## 4. Literals: how you write a value fixes its type

A **literal** is a value written directly in the source, like `25` or `'A'`. How you write it fixes *its own* type, independent of any variable. That type must be compatible with where you put it.

- A plain whole number is an `int`; a number with a decimal point is a `double` <abbr title="The Java Language Specification, Java SE 21, §3.10.2">[9]</abbr>.
- A suffix chooses otherwise: `L` for `long` <abbr title="The Java Language Specification, Java SE 21, §3.10.1">[8]</abbr>, `f` for `float`.
- Single quotes make a `char`; double quotes make a `String`.

```java run
public class Main {
    public static void main(String[] args) {
        System.out.println(25);      // an int literal
        System.out.println(25L);     // a long literal (the L)
        System.out.println(3.14);    // a double literal
        System.out.println(3.14f);   // a float literal (the f)
        System.out.println('A');     // a char literal (single quotes)
        System.out.println("A");     // a String literal (double quotes)
    }
}
```

**Output:**
```
25
25
3.14
3.14
A
A
```

**Analysis.** The printed values look identical in pairs, but the *types* differ:

- `25` is an `int`, and `25L` a `long`.
- `3.14` is a `double`, and `3.14f` a `float`.
- `'A'` is a `char`, and `"A"` a `String`.

The type is invisible in the output, yet real to the compiler. A lower-case `l` also makes a `long`, but it looks like the digit `1`. The language specification itself prefers `L` <abbr title="The Java Language Specification, Java SE 21, §3.10.1">[8]</abbr>.

**Intuition.**
*Mechanism.* The compiler gives every literal a type from how it is written, before considering where it goes. A bare integer literal is an `int`, always, even when the variable beside it is a `long`.

*Concrete bite.* That is why a number too big for an `int` is an error even when you "meant" a `long`:

```java run
public class Main {
    public static void main(String[] args) {
        int big = 3000000000;
        System.out.println(big);
    }
}
```

**Compiler error:**
```
Main.java:3: error: integer number too large
        int big = 3000000000;
                  ^
1 error
```

`3000000000` is past an `int`'s ceiling of 2147483647. The literal is an `int` by default, so the compiler rejects it before it ever reaches the variable. Mark it as a `long` literal by adding `L`, store it in a `long` box, and it fits:

```java run
public class Main {
    public static void main(String[] args) {
        long big = 3_000_000_000L;
        System.out.println(big);
    }
}
```

**Output:**
```
3000000000
```

*Non-example: a decimal without its `f`.* The same rule bites `float`. `0.5` is a `double` literal, and a `double` does not always fit in a `float`:

```java run
public class Main {
    public static void main(String[] args) {
        float ratio = 0.5;
        System.out.println(ratio);
    }
}
```

**Compiler error:**
```
Main.java:3: error: incompatible types: possible lossy conversion from double to float
        float ratio = 0.5;
                      ^
1 error
```

The fix is the suffix: `float ratio = 0.5f;`, as in §3.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Write the literal in the form of the type you want: `L` for `long`, `f` for `float`, single quotes for `char`, double quotes for `String`. A plain integer is an `int`, and a plain decimal is a `double`. The cost of forgetting is a compile error like "integer number too large". It is honest, though: it catches at compile time a mismatch that would otherwise become a wrong number at run time.

</div>

---

## 5. `var`: inferred, not dynamic

Spelling a type out twice can get tedious. Since Java 10, `var` lets the compiler **infer** a local variable's type from its **initializer**, the value after `=` <abbr title="JEP 286: Local-Variable Type Inference (JDK 10)">[10]</abbr>. It is a convenience, not a new form of typing. The variable still has one fixed type; you did not write it.

```java run
public class Main {
    public static void main(String[] args) {
        var count = 42;       // compiler infers: int
        var price = 19.99;    // compiler infers: double
        var name = "Ada";     // compiler infers: String
        System.out.println(count);
        System.out.println(price);
        System.out.println(name);
    }
}
```

**Output:**
```
42
19.99
Ada
```

**Analysis.** `var count = 42` is exactly `int count = 42`. The compiler reads the initializer `42`, an `int` literal, and fixes `count`'s type to `int`. Likewise `price` becomes `double` (from `19.99`) and `name` becomes `String` (from `"Ada"`). `var` copied the type off the value on the right; it did not make the variable typeless.

**Intuition.**
*Mechanism.* `var` is resolved at **compile time**. The compiler looks at the initializer, works out its type, and writes that type into the variable as if you had typed it. The compiled bytecode is identical to the spelled-out version: there is no `var` left at run time.

*Concrete bite.* So `var` is not dynamic typing. The inferred type is as fixed as a written one. Reassign across types, and it fails exactly as a spelled-out `int` would:

```java run
public class Main {
    public static void main(String[] args) {
        var x = 42;     // inferred: int
        x = "hello";    // x is an int — it can't hold text
        System.out.println(x);
    }
}
```

**Compiler error:**
```
Main.java:4: error: incompatible types: String cannot be converted to int
        x = "hello";    // x is an int — it can't hold text
            ^
1 error
```

The error names `int`, even though you wrote `var`. That is the proof: `x`'s type was fixed to `int` the moment it was initialized.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Use `var` when the initializer already makes the type obvious (`var total = 0;`, `var name = "Ada";`). Keep the explicit type where naming it helps the reader. The boundaries are its cost <abbr title="JEP 286: Local-Variable Type Inference (JDK 10)">[10]</abbr>:

- `var` needs an initializer on the same line, or the compiler has nothing to infer from.
- The initializer must have a type: `var n = null;` fails with `cannot infer type for local variable n`.
- `var` works only for local variables. A variable declared outside every method, or a method's parameter, gets `'var' is not allowed here`.

</div>

*Non-example: `var` with no initializer.* Omit the initializer, and the compiler cannot even guess:

```java run
public class Main {
    public static void main(String[] args) {
        var y;
        y = 42;
        System.out.println(y);
    }
}
```

**Compiler error:**
```
Main.java:3: error: cannot infer type for local variable y
        var y;
            ^
  (cannot use 'var' on variable without initializer)
1 error
```

---

## 6. Mental-model summary

| Principle | Consequence |
|---|---|
| Java is statically typed: every variable's type is fixed at declaration | Declare with a type before use; the compiler checks every assignment |
| A local variable must be given a value before it is read | Reading an empty one is a compile error, never a silent `0` |
| A name is letters, digits, `_` and `$`, never starting with a digit, never a keyword | `2nd` and `class` give `not a statement`, not a message about the name |
| A primitive variable holds its value directly | The box *is* the number; references hold a location instead |
| The type is fixed; only the value can change, and `final` fixes the value too | `int n = "hello"` and reassigning a `final` are compile errors |
| There are 8 primitives, each with a fixed size and range | `byte b = 200` won't compile; `int` stops at 2147483647 |
| A constant that fits may go into a `byte`, `short` or `char` | `byte b = 100` compiles; `byte b = n` does not, even when `n` is `100` |
| A literal's form fixes its own type | `25` is an `int`, `25L` a `long`, `3.14` a `double`, `'A'` a `char`, `"A"` a `String` |
| `var` infers the type at compile time | Convenience only: the type is still fixed; `var x = 42; x = "hi"` won't compile |

## 7. Gotcha checklist

<div style="border-left:4px solid #da5233;background:rgba(218,82,51,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

| Symptom | Likely cause | Fix |
|---|---|---|
| `cannot find symbol … variable X` | `X` was never declared, or its spelling or case differs from the declaration (`Age` vs `age`) | declare it with a type, or match the declared name exactly |
| `variable x might not have been initialized` | the variable is read before any line gives it a value | assign it before the line that reads it, or give it a starting value in the declaration |
| `not a statement`, then `';' expected`, on a declaration | the name starts with a digit (`2nd`) or is a keyword (`class`) | rename it: `second`, `className` |
| `variable x is already defined in method main(String[])` | `x` was declared twice, often by writing its type again on a reassignment | drop the type on the second line: `x = 2;` |
| `incompatible types: String cannot be converted to int` | text went into a number box (or a reassignment crossed types) | fix the value, or convert it deliberately |
| `possible lossy conversion from int to byte` | the value is out of range, or it is a variable rather than a constant | use a wider type (`int`, `long`), or a cast ([Numbers and arithmetic](/synapse/programming-languages/java/first-steps/numbers-and-arithmetic)) |
| `possible lossy conversion from double to float` | a decimal literal without `f` went into a `float` | add `f` (`0.5f`), or use `double` |
| `integer number too large` | a whole-number literal is past 2147483647 | add `L`, and store it in a `long` |
| `cannot assign a value to final variable X` | a `final` variable was reassigned | remove the reassignment, or drop `final` if the value must change |
| `cannot infer type for local variable` | `var` with no initializer, or with `null` | give it a typed starting value, or write the type |
| `'var' is not allowed here` | `var` on a variable outside a method, or on a parameter | write the type |

</div>

---

## ✅ Check yourself

One check per objective. Answer before you open anything.

```quiz
{"prompt": "Which of these is a legal variable name?", "options": ["2nd", "secondPlace", "class"], "answer": "secondPlace"}
```

```quiz
{"prompt": "What happens with these two lines inside main?  int total;  System.out.println(total);", "options": ["It prints 0", "It throws an exception at run time", "javac rejects it: variable total might not have been initialized"], "answer": "javac rejects it: variable total might not have been initialized"}
```

```quiz
{"prompt": "Which type should hold the number of people on Earth, about 8 billion?", "options": ["int", "short", "long"], "answer": "long"}
```

```quiz
{"prompt": "Which of these compiles?", "options": ["byte b = 200;", "int n = 100; byte b = n;", "byte b = 100;"], "answer": "byte b = 100;"}
```

<details>
<summary>After <code>var d = 5;</code>, why does <code>d = 5.5;</code> fail? And why can't a method's parameter be declared with <code>var</code>?</summary>

`var d = 5;` gives `d` the type `int`, from the `int` literal `5`. `5.5` is a `double`, so javac says `incompatible types: possible lossy conversion from double to int`. `var` fixed the type as firmly as writing `int` would.

`var` needs an initializer to copy a type from, and a parameter has none. It works only for local variables; on a parameter, javac says `'var' is not allowed here` <abbr title="JEP 286: Local-Variable Type Inference (JDK 10)">[10]</abbr>.

</details>

<details>
<summary>The 🧪 box below: which two of the four declarations compile?</summary>

`int a = 5;` and `byte c = 5;` compile. `5` is an `int` literal, and as a constant it fits in a `byte`.

`int b = 5.0;` fails: `5.0` is a `double` literal, and javac says `possible lossy conversion from double to int`. `var d = 5; d = 5.5;` fails with the same message, because `d` is an `int`.

</details>

---

## 📚 Sources

1. *The Java Language Specification, Java SE 21*, chapter 16 "Definite Assignment" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-16.html>
2. *The Java Language Specification, Java SE 21*, §3.8 "Identifiers" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-3.html#jls-3.8>
3. *The Java Language Specification, Java SE 21*, §3.9 "Keywords" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-3.html#jls-3.9>
4. *The Java Language Specification, Java SE 21*, §4.12.4 "`final` Variables" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-4.html#jls-4.12.4>
5. *The Java Language Specification, Java SE 21*, §4.2.1 "Integral Types and Values" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-4.html#jls-4.2.1>
6. *The Java Tutorials*, "Primitive Data Types" (`boolean`: "its 'size' isn't something that's precisely defined") — <https://docs.oracle.com/javase/tutorial/java/nutsandbolts/datatypes.html>
7. *The Java Language Specification, Java SE 21*, §5.2 "Assignment Contexts" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-5.html#jls-5.2>
8. *The Java Language Specification, Java SE 21*, §3.10.1 "Integer Literals" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-3.html#jls-3.10.1>
9. *The Java Language Specification, Java SE 21*, §3.10.2 "Floating-Point Literals" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-3.html#jls-3.10.2>
10. JEP 286: Local-Variable Type Inference (JDK 10) — <https://openjdk.org/jeps/286>

---

<div style="border-left:4px solid #6d28d9;background:rgba(109,40,217,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

🧪 **Predict, then check.** Write these four declarations and predict, for each, whether it compiles. If not, predict the error's wording: `int a = 5;` · `int b = 5.0;` · `byte c = 5;` · `var d = 5; d = 5.5;`. Two compile and two do not. Decide which, and why, before running them.

Hint: think about each literal's *own* type, `5` versus `5.0`, and which box it is going into.

</div>

## Your Turn

Before you move on, check your understanding with the coach — explain the idea, apply it, weigh the trade-offs, then defend your reasoning.

<div class="concept-coach"></div>
