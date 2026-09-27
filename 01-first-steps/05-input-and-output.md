---
title: Input & Output
summary: I/O is method calls on stream objects — System.out for formatted output (printf), and a Scanner over System.in to turn typed characters into typed values. next, nextLine and nextInt and what each consumes, the leftover-newline trap and its fix, Integer.parseInt, the read→compute→output skeleton, and the exception each type of bad input throws, building on every earlier First Steps chapter.
prereqs: []
---

# Input & Output — Talking With the User

A program becomes useful the moment it can take input from a person and respond. Both halves are **method calls on stream objects**. A **stream** is a flow of characters in one direction: out to the screen, or in from the keyboard.

- `System.out` is an object you send text to, with `println` and `printf`.
- A `Scanner` wraps `System.in`, the keyboard, and turns the characters someone types into typed *values*.

The chapter turns on one idea that ties First Steps together: reading input is **parsing**, turning text into a value of a type. `Scanner`'s `nextInt()` hands you a real `int`, ready for the arithmetic of [Numbers and arithmetic](/synapse/programming-languages/java/first-steps/numbers-and-arithmetic). When the typed text is not a number, the parse fails loudly.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **The core idea.**

- Input and output are **method calls on stream objects**: `System.out`, and a `Scanner` over `System.in`.
- Reading input is **parsing**: `nextInt()` turns typed characters into a real `int`.
- When the typed text is not a number, the parse **fails loudly**.

</div>

Every output below was produced by compiling and running the code on Java 21.

<div style="border-left:4px solid #15448e;background:rgba(21,68,142,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

📘 **A note on the Run button and typed input.** The sandbox behind ▶ Run compiles and runs your code, but it cannot pause to let you type.

- So each real `Scanner(System.in)` example is shown as **static** code, with the exact output it produces *for a stated entry*. Each was verified by running it with that input supplied.
- Beside each, a **runnable twin** points the Scanner at a fixed piece of text instead of the keyboard. The methods behave identically, so you can click Run and experiment.

On your own machine, `Scanner(System.in)` pauses and waits for you to type.

</div>

**You'll be able to:** write a `printf` call whose placeholders match their values, with a fixed number of decimals; read a word, a line and a number with `Scanner`, and predict what each call consumes; explain why a `nextLine()` after `nextInt()` comes back empty, and fix it; convert typed text to a number with `nextInt` or `Integer.parseInt`, so `+` adds; name the exception that each type of bad input throws.

<div style="border-left:4px solid #15448e;background:rgba(21,68,142,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

📘 **How to read the Intuition boxes.** Each one is built in three moves:

1. **The mechanism** — what the compiler and the JVM *do*.
2. **A concrete bite** — a specific, runnable failure (often a real compiler error), shown so the trap is visible.
3. **The earned rule** — the decision heuristic, now justified rather than asserted, plus its cost.

</div>

---

## Table of contents

1. [Building output with `printf`](#1-building-output-with-printf)
2. [Reading input with `Scanner`](#2-reading-input-with-scanner)
3. [Reading numbers: `nextInt` and `nextDouble`](#3-reading-numbers-nextint-and-nextdouble)
4. [A first interactive program](#4-a-first-interactive-program)
5. [When the input is bad](#5-when-the-input-is-bad)
6. [Mental-model summary](#6-mental-model-summary)
7. [Gotcha checklist](#7-gotcha-checklist)
8. [Check yourself](#-check-yourself)
9. [Sources](#-sources)

---

## 1. Building output with `printf`

You already have `println` for plain lines. For *formatted* output, such as a number to two decimals or values slotted into a template, Java has `printf` and its sibling `String.format`. A **format string** holds placeholders, and the values that fill them follow, in order <abbr title="Java SE 21 API, java.util.Formatter">[1]</abbr>:

- `%s` is any value, as text.
- `%d` is a whole number, and `%f` a decimal.
- `%n` is a line break, and `%%` a literal `%` sign.

```java run
public class Main {
    public static void main(String[] args) {
        String name = "Ada";
        int score = 95;
        double pi = 3.14159;
        System.out.printf("%s scored %d points%n", name, score);
        System.out.printf("pi to 2 places: %.2f%n", pi);
        String line = String.format("%s = %d", "score", score);
        System.out.println(line);
    }
}
```

**Output:**
```
Ada scored 95 points
pi to 2 places: 3.14
score = 95
```

**Analysis.**

- `printf` filled `%s` with `name` (`"Ada"`) and `%d` with `score` (`95`), and `%n` ended the line.
- `%.2f` rendered `pi` rounded to two decimals: `3.14`.
- `String.format` does the same formatting, but *returns* the result as a String instead of printing it. Use it when you want to keep the text.

`%n` is the platform's own line separator <abbr title="Java SE 21 API, java.util.Formatter">[1]</abbr>, so prefer it to `\n` in a format string.

**Intuition.**
*Mechanism.* `printf` walks the format string. At each `%…` it consumes the next argument and renders it according to the **specifier**: `%d` as a whole number, `%.2f` as a decimal with two digits after the point.

*Concrete bite.* The specifier must match the argument's type, or `printf` throws at run time <abbr title="Java SE 21 API, java.util.Formatter">[1]</abbr>:

```java run
public class Main {
    public static void main(String[] args) {
        System.out.printf("%d%n", "not a number");
    }
}
```

**Output** *(a thrown exception):*
```
Exception in thread "main" java.util.IllegalFormatConversionException: d != java.lang.String
```

`%d` demands a whole number, but a String was supplied, so `printf` throws `IllegalFormatConversionException`. Read the message as "`d` does not fit a `String`". The reverse fails too: `printf("%.2f%n", 5)` throws `f != java.lang.Integer`, because `5` is an `int`. Write `5.0`, or divide by `2.0` first.

*Non-example: a bare `%` sign.* A `%` always starts a specifier. So `"50% done"` is read as `% d`, a specifier with no value to fill it:

```java run
public class Main {
    public static void main(String[] args) {
        System.out.printf("50% done%n");
    }
}
```

**Output** *(prints `50`, then a thrown exception):*
```
50Exception in thread "main" java.util.MissingFormatArgumentException: Format specifier '% d'
```

`printf` printed `50`, then found `% d` with no argument left. The exception's message starts on the same line, because nothing had ended the line. Write `%%` for a literal percent sign: `printf("%d%% done%n", 50)` prints `50% done`.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Match each specifier to its value's type: `%d` for whole numbers, `%f` for decimals, `%s` for anything. Use `%.Nf` to fix the number of decimals, `%n` for line breaks, and `%%` for a percent sign. The cost of `printf`'s power is that mismatches are *run-time* errors. The compiler does not check format strings against their arguments, so a wrong `%d`/`%s` surfaces only when that line runs.

</div>

---

## 2. Reading input with `Scanner`

To read what a person types, make a `Scanner` over `System.in` (the keyboard) and ask it for input.

- `Scanner` lives in Java's library under the full name `java.util.Scanner`. The `import` line at the top of the file lets you call it by its short name, `Scanner`.
- `new Scanner(System.in)` builds a new Scanner object; [Classes and objects](/synapse/programming-languages/java/classes-and-objects/classes-and-objects) teaches `new`.
- `nextLine()` returns the whole line typed. `next()` returns the next **token**: a run of characters up to a space or a line break <abbr title="Java SE 21 API, java.util.Scanner">[2]</abbr>.

```java
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("What's your name? ");
        String name = sc.nextLine();
        System.out.println("Hello, " + name + "!");
    }
}
```

**Output** *(when you type `Ada` and press Enter):*
```
What's your name? Hello, Ada!
```

**Analysis.** `new Scanner(System.in)` built a Scanner reading the keyboard. `nextLine()` waited for a line and returned it as a String, which we greeted. The prompt and the greeting appear together here because this page does not show your keystrokes. In a terminal you would see `Ada` where you typed it, between the prompt and the greeting.

Here is the **runnable twin**. It is identical, except that its Scanner reads a fixed String, so you can click Run:

```java run
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner("Ada");   // a fixed source, instead of the keyboard
        String name = sc.nextLine();
        System.out.println("Hello, " + name + "!");
    }
}
```

**Output:**
```
Hello, Ada!
```

**`next()` versus `nextLine()`.** `next()` stops at the first space; `nextLine()` takes everything to the end of the line <abbr title="Java SE 21 API, java.util.Scanner">[2]</abbr>. The `\n` in the source below is a line break, from [Strings, the basics](/synapse/programming-languages/java/first-steps/strings-the-basics):

```java run
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner("Ada Lovelace\nLondon");
        String first = sc.next();       // one word: stops at the space
        String rest = sc.nextLine();    // the rest of that line
        String city = sc.nextLine();    // the whole next line
        System.out.println("[" + first + "]");
        System.out.println("[" + rest + "]");
        System.out.println("[" + city + "]");
    }
}
```

**Output:**
```
[Ada]
[ Lovelace]
[London]
```

`next()` returned `Ada` and left the Scanner at the space. `nextLine()` then returned the *rest of that line*, `" Lovelace"`, space included. Only the second `nextLine()` reached `London`. The brackets make each value's edges visible.

**Intuition.**
*Mechanism.* A `Scanner` is a reader over a **source**. `new Scanner(System.in)` reads the keyboard; `new Scanner("Ada")` reads a fixed string. `nextLine`, `next` and `nextInt` behave identically over either. The Scanner keeps a position in its source, and each call consumes a little more from that position.

*Concrete bite.* Ask for input that is not there, and it throws:

```java run
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner("");   // empty source — nothing to read
        String line = sc.nextLine();
        System.out.println(line);
    }
}
```

**Output** *(a thrown exception):*
```
Exception in thread "main" java.util.NoSuchElementException: No line found
```

The source is empty, so `nextLine()` has nothing to return, and it throws `NoSuchElementException`. This is also why a `Scanner(System.in)` program fails when run on this page: there is no keyboard to read. That is why the real examples here are shown statically.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Create one Scanner over `System.in` for real input; point one at a String only to demo or test. The cost is that a Scanner assumes input exists: read past the end, and it throws. A robust program checks `hasNextLine()` or `hasNextInt()` first. You will write that guard once you have [conditionals](/synapse/programming-languages/java/control-flow/conditionals).

</div>

---

## 3. Reading numbers: `nextInt` and `nextDouble`

`nextInt()` reads the next token and parses it as an `int`; `nextDouble()` parses a `double`. The Scanner does the text-to-number conversion for you, so what you get back is a real number, ready for arithmetic.

```java
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter your age: ");
        int age = sc.nextInt();
        System.out.println("Next year you'll be " + (age + 1));
    }
}
```

**Output** *(when you type `36`):*
```
Enter your age: Next year you'll be 37
```

**Analysis.** `nextInt()` read `36` and returned the **int** `36`, not the text `"36"`, so `age + 1` is real arithmetic: `37`. The parentheses earn their keep. As [Strings, the basics](/synapse/programming-languages/java/first-steps/strings-the-basics) showed, `"… be " + age + 1` would join into `"… be 361"`; `(age + 1)` forces the addition first. The runnable twin reads the number from a fixed source:

```java run
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner("36");
        int age = sc.nextInt();
        System.out.println("Next year you'll be " + (age + 1));
    }
}
```

**Output:**
```
Next year you'll be 37
```

**Intuition.**
*Mechanism.* `nextInt()` reads characters up to the next space or line break, and parses them into an `int`. It stops *before* the line break that ends the line: it consumes the number token, not the line.

*Concrete bite.* That leftover line break is the famous Scanner trap. A `nextLine()` after a `nextInt()` reads the *rest of the number's line*, which is empty, not the next line:

```java run
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner("36\nAda\n");
        int age = sc.nextInt();
        String name = sc.nextLine();   // surprise: the rest of the "36" line — empty
        System.out.println("age=" + age + " name=[" + name + "]");
    }
}
```

**Output:**
```
age=36 name=[]
```

`nextInt()` read `36` and stopped before its line break. The following `nextLine()` returned everything left on that same line, which is nothing. So `name` is empty (`[]`), not `"Ada"`. `nextLine()` "returns the rest of the current line" <abbr title="Java SE 21 API, java.util.Scanner">[2]</abbr>, and here the rest was empty.

The fix is one extra `sc.nextLine()` after the `nextInt()`, to swallow the leftover line break:

```java run
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner("36\nAda\n");
        int age = sc.nextInt();
        sc.nextLine();                 // swallow the rest of the "36" line
        String name = sc.nextLine();   // now the next line: Ada
        System.out.println("age=" + age + " name=[" + name + "]");
    }
}
```

**Output:**
```
age=36 name=[Ada]
```

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** `nextInt` and `nextDouble` read a *token*, and leave the rest of the line, line break included, unread. When you mix them with `nextLine`, consume that leftover line break first. The cost of Scanner's token model is this trap: when a `nextLine()` after a `nextInt()` comes back empty, this is why.

</div>

---

## 4. A first interactive program

Put it together: read two numbers, add them, and report the result. This **read → compute → output** skeleton underlies countless programs.

```java
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("First number: ");
        int a = sc.nextInt();
        System.out.print("Second number: ");
        int b = sc.nextInt();
        System.out.printf("%d + %d = %d%n", a, b, a + b);
    }
}
```

**Output** *(when you type `7`, then `5`):*
```
First number: Second number: 7 + 5 = 12
```

**Analysis.** Two `nextInt()` calls read `7` and `5` as `int`s, then `printf` reported the sum. Reading with `nextInt`, rather than as text, is what makes `a + b` arithmetic (`12`) and not concatenation (`"75"`). The runnable twin supplies both numbers from one fixed source; the single space separates the two tokens:

```java run
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner("7 5");   // imagine these were typed
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.printf("%d + %d = %d%n", a, b, a + b);
    }
}
```

**Output:**
```
7 + 5 = 12
```

**Intuition.**
*Mechanism.* `nextInt()` skips leading spaces and reads one whole-number token, so `"7 5"` yields `7`, then `5`, across two calls. The read → compute → output shape is the spine of interactive programs.

*Concrete bite.* Drop the number-ness, read as text and add, and `+` flips back to concatenation:

```java run
public class Main {
    public static void main(String[] args) {
        String a = "7", b = "5";   // as text, not numbers
        System.out.println(a + b);
    }
}
```

**Output:**
```
75
```

Two strings joined give `"75"`, not `12`. When you already hold the text, convert it with `Integer.parseInt`, or `Double.parseDouble` for a decimal <abbr title="Java SE 21 API, java.lang.Integer">[3]</abbr>. This is the deliberate conversion that [Variables and primitive types](/synapse/programming-languages/java/first-steps/variables-and-primitive-types) promised:

```java run
public class Main {
    public static void main(String[] args) {
        String a = "7", b = "5";                  // text, as typed
        int x = Integer.parseInt(a);              // "7" becomes the int 7
        int y = Integer.parseInt(b);
        System.out.println(x + y);
        double d = Double.parseDouble("2.5");
        System.out.println(d * 2);
    }
}
```

**Output:**
```
12
5.0
```

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Structure interactive programs as read → convert → compute → output. Read numbers *as numbers* (`nextInt`/`nextDouble`), or convert held text with `Integer.parseInt`, so `+` stays arithmetic. The cost of keeping numbers as text and converting late is the concatenation bug. Convert at the boundary, where the text comes in.

</div>

---

## 5. When the input is bad

Parsing can fail, and on real input it is not rare:

- `nextInt()` accepts only a token that *is* an `int`. A word, a decimal, or a number past `2147483647` makes it throw `InputMismatchException` <abbr title="Java SE 21 API, java.util.Scanner">[2]</abbr>.
- `Integer.parseInt` throws `NumberFormatException` when the String is not a whole number <abbr title="Java SE 21 API, java.lang.Integer">[3]</abbr>.

```java run
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner("seven");
        int n = sc.nextInt();
        System.out.println(n);
    }
}
```

**Output** *(a thrown exception):*
```
Exception in thread "main" java.util.InputMismatchException
```

`nextInt()` found `seven`, which is not an integer, and threw. The program halted before printing. A user who types `seven` instead of `7` hits this.

A number too big for an `int` fails the same way: `nextInt()` on `3000000000` throws `InputMismatchException: For input string: "3000000000"`. The same failure, when you parse a String yourself:

```java run
public class Main {
    public static void main(String[] args) {
        System.out.println(Integer.parseInt("42"));
        System.out.println(Integer.parseInt("3.5"));
    }
}
```

**Output** *(prints `42`, then a thrown exception):*
```
42
Exception in thread "main" java.lang.NumberFormatException: For input string: "3.5"
```

`Integer.parseInt("42")` worked and printed `42`. `Integer.parseInt("3.5")` failed, because `"3.5"` is not a *whole* number, with `NumberFormatException`, halting the program. `parseInt` is strict about spaces too: `Integer.parseInt(" 42")` fails with `For input string: " 42"`. Strip the text first.

**Intuition.**
*Mechanism.* Both `nextInt` and `Integer.parseInt` validate as they parse. If the characters do not form an `int`, there is no value to return, so they throw rather than guess.

*Concrete bite.* The outputs above are the demonstration: `42` prints, then the bad parse throws and execution stops. Real user input is unpredictable, so this is not an edge case; it is an ordinary day.

**Decimals and your computer's language.** A Scanner reads numbers in the format of your computer's language settings <abbr title="Java SE 21 API, java.util.Scanner">[2]</abbr>, and so does `printf`. The outputs on this page come from a computer set to US English, where the decimal mark is a point. On a computer set to German, `nextDouble()` rejects `3.5` with `InputMismatchException` and expects `3,5`, and `printf("%.2f%n", 3.14159)` prints `3,14`.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Convert at the boundary, and assume conversion *can* fail on real input. The cost of unhandled bad input is a crash, right at the parse, with everything after it skipped. Recovering gracefully, by asking again instead of crashing, needs `try`/`catch`, which [Exceptions](/synapse/programming-languages/java/robust-oop/exceptions) teaches. For now, know that it happens, and where.

</div>

---

## 6. Mental-model summary

| Principle | Consequence |
|---|---|
| Output and input are method calls on stream objects | `System.out.printf(...)` formats; `new Scanner(System.in)` reads |
| `printf` placeholders must match argument types; `%` always starts one | `%d` with a String, or `%f` with an `int`, throws at run time; write `%%` for a percent sign |
| A `Scanner` reads tokens from a source on demand | `next()` stops at a space, `nextLine()` at the line's end; reading past the end throws `NoSuchElementException` |
| `nextInt`/`nextDouble` parse a number you can compute with | `age + 1` adds; text would join (`"36" + 1` → `"361"`); `Integer.parseInt` converts held text |
| `nextInt` leaves the line's line break unread | A following `nextLine()` returns empty; call `nextLine()` once more to consume it |
| Parsing validates and throws on bad input | `nextInt` on `seven` throws `InputMismatchException`; `parseInt("3.5")` throws `NumberFormatException` |
| Scanner and `printf` follow the computer's language settings | On a German-language computer, `3,5` is a decimal and `3.5` is not |

## 7. Gotcha checklist

<div style="border-left:4px solid #da5233;background:rgba(218,82,51,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

| Symptom | Likely cause | Fix |
|---|---|---|
| `IllegalFormatConversionException: d != java.lang.String` | `%d` was given a String | fix the specifier (`%s`) or the argument |
| `IllegalFormatConversionException: f != java.lang.Integer` | `%f` was given an `int` | pass a `double`: `5.0`, or `total / 2.0` |
| `MissingFormatArgumentException: Format specifier '% d'` | a bare `%` in the format string | write `%%` for a percent sign |
| A `nextLine()` after `nextInt()` is empty | the leftover line break of the number's line | call `sc.nextLine()` once after the `nextInt()` |
| `next()` returned only the first word | `next()` stops at a space | use `nextLine()` for the whole line |
| `InputMismatchException` from `nextInt()` | the token is a word, a decimal, or past the `int` range | read it differently, or check with `hasNextInt()` first |
| `InputMismatchException` from `nextDouble()` on `3.5` | the computer's language uses a decimal comma | type `3,5`, or set the Scanner's locale |
| `NumberFormatException: For input string: "…"` | `Integer.parseInt` got text that is not a whole number, spaces included | check or `strip()` the text; handle the exception ([Exceptions](/synapse/programming-languages/java/robust-oop/exceptions)) |
| `+` joined the input instead of adding | the value was kept as text | read with `nextInt`/`nextDouble`, or parse before computing |
| `NoSuchElementException` on Run | a `Scanner(System.in)` program has no keyboard here | use the runnable-twin pattern (a String source) |

</div>

---

## ✅ Check yourself

One check per objective. Answer before you open anything.

```quiz
{"prompt": "What does System.out.printf(\"%.2f%n\", 2.0 / 3); print?", "options": ["0.66", "0.67", "0.6666666666666666"], "answer": "0.67"}
```

```quiz
{"prompt": "A Scanner reads the text \"Ada Lovelace\". What does its first call to next() return?", "options": ["Ada", "Ada Lovelace", "Lovelace"], "answer": "Ada"}
```

<details>
<summary>A Scanner reads <code>"36\nAda\n"</code>. Why does <code>nextLine()</code> after <code>nextInt()</code> return an empty String, and how do you get <code>Ada</code>?</summary>

`nextInt()` consumes the token `36` and stops before the line break. `nextLine()` returns the rest of the current line <abbr title="Java SE 21 API, java.util.Scanner">[2]</abbr>, and the rest of the `36` line is empty.

Call `sc.nextLine()` once after `nextInt()` to consume that leftover line break. The next `nextLine()` then returns `Ada`.

</details>

```quiz
{"prompt": "String a = \"7\", b = \"5\"; Which line prints 12?", "options": ["System.out.println(a + b);", "System.out.println(Integer.parseInt(a) + Integer.parseInt(b));", "System.out.println(\"\" + a + b);"], "answer": "System.out.println(Integer.parseInt(a) + Integer.parseInt(b));"}
```

```quiz
{"prompt": "Which exception does Integer.parseInt(\"3.5\") throw?", "options": ["InputMismatchException", "ArithmeticException", "NumberFormatException"], "answer": "NumberFormatException"}
```

<details>
<summary>The 🧪 box below: what do the three versions print?</summary>

With `"10 20"`, it prints `10 + 20 = 30`.

With `"ten 20"`, the first `nextInt()` throws `java.util.InputMismatchException`, and nothing prints.

For the average of `"7 5"`, divide by `2.0` so the division is floating-point: `System.out.printf("%.2f%n", (a + b) / 2.0);` prints `6.00`.

</details>

---

## 📚 Sources

1. Java SE 21 API, `java.util.Formatter` (conversions `%s`, `%d`, `%f`, `%n`, `%%`; `IllegalFormatConversionException`) — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Formatter.html>
2. Java SE 21 API, `java.util.Scanner` (tokens, `next`, `nextLine`, `nextInt`, `InputMismatchException`, localized numbers) — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Scanner.html>
3. Java SE 21 API, `java.lang.Integer` (`parseInt`, `NumberFormatException`) — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Integer.html>

---

<div style="border-left:4px solid #6d28d9;background:rgba(109,40,217,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

🧪 **Predict, then check.** Take the §4 runnable twin and predict its output if the source string were `"10 20"` instead of `"7 5"`. Now predict what happens if the source were `"ten 20"`: which line throws, and with what exception?

Finally, change the twin to read two numbers and print their **average** to two decimals with `printf`. Hint: from [Numbers and arithmetic](/synapse/programming-languages/java/first-steps/numbers-and-arithmetic), `nextInt` gives `int`s, so force floating-point division before the `%.2f`. Reach for `nextDouble` if you prefer to read decimals directly. Build it and confirm.

</div>

## Your Turn

Before you move on, check your understanding with the coach — explain the idea, apply it, weigh the trade-offs, then defend your reasoning.

<div class="concept-coach"></div>
