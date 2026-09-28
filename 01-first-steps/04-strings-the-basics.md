---
title: Strings, the Basics
summary: A String is an immutable object, not a primitive — so every "change" makes a new String, methods that ignore their result do nothing, and comparing text needs .equals (characters) not == (identity), a distinction the String pool makes deceptively easy to get wrong. Creating strings, escape sequences, zero-based positions and substring, concatenation with its left-to-right trap, and a first look at == vs equals.
prereqs: []
---

# Strings, the Basics — Text as an Immutable Object

A **String** is a piece of text: characters in double quotes, like `"Ada"`. Unlike the [primitives of the last chapters](/synapse/programming-languages/java/first-steps/variables-and-primitive-types), a String is an **object**. An object is a value that bundles its data with **methods**: actions you ask it to perform. Two consequences of being an object flow through everything you do with text:

- A String is **immutable**: it can never be changed. Every method that seems to edit it returns a *new* String.
- Comparing two strings means choosing between two questions: "the same object?" (`==`) or "the same characters?" (`.equals`). Choosing wrong is one of the most common beginner bugs in Java.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **The core idea.**

- A `String` is an **object**, not a primitive.
- It is **immutable**, so every method that seems to edit it returns a *new* String.
- Compare text with `.equals` (same characters), not `==` (same object).

</div>

This is a first pass. The model under "object" gets its full treatment in [References, equality and the object model](/synapse/programming-languages/java/classes-and-objects/references-equality-and-the-object-model), and Strings return in [Strings in depth](/synapse/programming-languages/java/core-libraries/strings-in-depth). For now, two ideas carry the chapter: a String is immutable, and you compare its contents with `.equals`. Every output below was produced by compiling and running the code on Java 21.

**You'll be able to:** predict what `charAt`, `substring` and `indexOf` return, counting positions from 0; explain why calling `s.toUpperCase()` on its own changes nothing, and fix it; write a string that holds a double quote or a line break; predict the output of a `+` chain that mixes text and numbers; pick `.equals` or `==` for a comparison, and explain why `==` passes on literals and fails on text built while the program runs.

<div style="border-left:4px solid #15448e;background:rgba(21,68,142,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

📘 **How to read the Intuition boxes.** Each one is built in three moves:

1. **The mechanism** — what the compiler and the JVM *do*.
2. **A concrete bite** — a specific, runnable failure (often a real compiler error), shown so the trap is visible.
3. **The earned rule** — the decision heuristic, now justified rather than asserted, plus its cost.

</div>

---

## Table of contents

1. [Strings are objects made of characters](#1-strings-are-objects-made-of-characters)
2. [Immutability: methods return new strings](#2-immutability-methods-return-new-strings)
3. [Everyday string methods](#3-everyday-string-methods)
4. [Concatenation with `+`](#4-concatenation-with-)
5. [`==` vs `.equals` and the String pool](#5--vs-equals-and-the-string-pool)
6. [Mental-model summary](#6-mental-model-summary)
7. [Gotcha checklist](#7-gotcha-checklist)
8. [Check yourself](#-check-yourself)
9. [Sources](#-sources)

---

## 1. Strings are objects made of characters

You write a String with **double** quotes. Because it is an object, it carries methods, and you call one with a dot: `name.length()`.

```java run
public class Main {
    public static void main(String[] args) {
        String name = "Ada";
        System.out.println(name);
        System.out.println(name.length());
        char first = name.charAt(0);
        System.out.println(first);
    }
}
```

**Output:**
```
Ada
3
A
```

**Analysis.** `"Ada"` is a String: a sequence of characters, and an object. Being an object, it answers method calls:

- `name.length()` asks how many characters it has: `3`.
- `name.charAt(0)` asks for the character at position `0`. That is the *first* one, because positions start at zero. It is `'A'`.

Note the two kinds of quote from [Variables and primitive types](/synapse/programming-languages/java/first-steps/variables-and-primitive-types). `charAt` returns a `char` (`'A'`, single quotes, one character), not a one-character String (`"A"`, double quotes).

**Intuition.**
*Mechanism.* A String variable is a **reference type**. `name` holds a reference to a String object stored elsewhere; it does not hold the characters directly, the way an `int` holds its number. Here it is enough that a String is an object you send method calls to.

*Concrete bite.* Positions run from `0` to `length − 1`, so reaching past the end is a run-time error <abbr title="Java SE 21 API, java.lang.String">[1]</abbr>:

```java run
public class Main {
    public static void main(String[] args) {
        String name = "Ada";
        System.out.println(name.charAt(3));
    }
}
```

**Output** *(a thrown exception; a stack trace follows the first line):*
```
Exception in thread "main" java.lang.StringIndexOutOfBoundsException: Index 3 out of bounds for length 3
```

`"Ada"` has length `3`, so the valid positions are `0`, `1` and `2`. `charAt(3)` is one past the end, and it throws.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Index strings from `0` to `length − 1`; `charAt(length)` is always off the end. An out-of-range position fails at *run time*, with an exception, not at compile time: the compiler cannot know the position in advance. When the position comes from a calculation, check it against `length()` first.

</div>

### Characters that need a backslash

A double quote ends a String. So how do you put one *inside* a String? You write a **backslash** before it: `\"`. A backslash and the character after it form an **escape sequence**, which stands for one character <abbr title="The Java Language Specification, Java SE 21, §3.10.7">[2]</abbr>:

- `\"` is a double quote, and `\'` a single quote (needed inside a `char` literal).
- `\n` is a line break, and `\t` a tab.
- `\\` is one backslash.

```java run
public class Main {
    public static void main(String[] args) {
        System.out.println("She said \"hi\"");
        System.out.println("line one\nline two");
        System.out.println("C:\\temp");
        System.out.println("it's");
        System.out.println('\'');
    }
}
```

**Output:**
```
She said "hi"
line one
line two
C:\temp
it's
'
```

Each `\"` printed a quote, and `\n` broke the line in two. `\\` printed one backslash. A single quote needs no escape inside double quotes (`"it's"`), only inside a `char` literal (`'\''`).

*Non-example: an unescaped quote.* Leave out the backslashes, and the String ends at the second `"`. javac then reads `hi` as code:

```java run
public class Main {
    public static void main(String[] args) {
        System.out.println("She said "hi"");
    }
}
```

**Compiler error:**
```
Main.java:3: error: ')' or ',' expected
        System.out.println("She said "hi"");
                                      ^
Main.java:3: error: ';' expected
        System.out.println("She said "hi"");
                                        ^
2 errors
```

The caret points at `hi`, the first thing after the String ended. When javac reports `')' or ',' expected` inside a line of text, look for a quote that needs `\"`.

---

## 2. Immutability: methods return new strings

A String never changes. Methods that look like they edit it (`toUpperCase`, `replace`, `strip`) return a **new** String and leave the original untouched. That property is called **immutability**: the String API itself says "Strings are constant; their values cannot be changed after they are created" <abbr title="Java SE 21 API, java.lang.String">[1]</abbr>.

```java run
public class Main {
    public static void main(String[] args) {
        String greeting = "hello";
        String shout = greeting.toUpperCase();
        System.out.println(shout);
        System.out.println(greeting);
    }
}
```

**Output:**
```
HELLO
hello
```

**Analysis.** `toUpperCase()` produced a *new* String, `"HELLO"`, which we stored in `shout`. The original `greeting` is still `"hello"`. The method did not edit the string in place; it built a new one and returned it.

**Intuition.**
*Mechanism.* Every String operation that "transforms" text returns a brand-new String object. The original's characters are fixed for its entire life. No String method changes a String in place.

*Concrete bite.* So calling such a method and ignoring its result does nothing at all:

```java run
public class Main {
    public static void main(String[] args) {
        String greeting = "hello";
        greeting.toUpperCase();   // result thrown away!
        System.out.println(greeting);
    }
}
```

**Output:**
```
hello
```

`toUpperCase()` ran and produced `"HELLO"`, but nothing caught the result, so it was discarded. `greeting` was never going to change. To keep the new value, assign it: `greeting = greeting.toUpperCase();`. That line makes the *variable* refer to the new String; the old String is unchanged.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Treat every String method as returning a new value you must capture: `s = s.strip();`, not `s.strip();`. The cost of immutability is this gotcha (a call that appears to do nothing), plus extra objects when you transform text repeatedly.

The benefit is safety. A String you hand to other code can never be altered behind your back. That is what makes Strings dependable as constants, and as keys in the maps of [Sets and maps](/synapse/programming-languages/java/core-libraries/sets-and-maps).

</div>

---

## 3. Everyday string methods

Strings come with a deep toolkit <abbr title="Java SE 21 API, java.lang.String">[1]</abbr>. A working handful covers most days:

- `length`, `charAt`, `substring` and `indexOf` work with positions.
- `contains` and `replace` work with pieces of text.
- `toUpperCase` and `toLowerCase` change case.
- `strip` removes surrounding **whitespace**: spaces, tabs and line breaks.

```java run
public class Main {
    public static void main(String[] args) {
        String s = "  Hello, World  ";
        System.out.println(s.strip());
        System.out.println(s.strip().length());
        System.out.println("Hello, World".indexOf("World"));
        System.out.println("Hello, World".substring(7));
        System.out.println("Hello, World".replace("World", "Java"));
        System.out.println("Hello, World".contains("ello"));
    }
}
```

**Output:**
```
Hello, World
12
7
World
Hello, Java
true
```

**Analysis.**

- `strip()` removed the surrounding spaces, giving `"Hello, World"` (length `12`).
- `indexOf("World")` reported the position where `"World"` begins: `7`.
- `substring(7)` returned everything from position 7 onward: `"World"`.
- `replace` produced `"Hello, Java"`, and `contains("ello")` answered `true`.

Notice that methods **chain**: `s.strip().length()` runs `strip` first, which makes a new String, then `length` on that result. `trim()` is an older relative of `strip()`. It removes only characters up to the plain space, so `strip()`, added in Java 11, is the one to reach for <abbr title="Java SE 21 API, java.lang.String">[1]</abbr>.

**`substring` with two positions.** `substring(begin, end)` takes the characters from `begin` up to, but **not including**, `end`. So its length is `end - begin`:

```java run
public class Main {
    public static void main(String[] args) {
        String s = "Hello, World";
        System.out.println(s.substring(0, 5));   // positions 0 to 4: the end is excluded
        System.out.println(s.substring(7, 12));  // positions 7 to 11
        System.out.println(s.substring(7, 12).length());
    }
}
```

**Output:**
```
Hello
World
5
```

`substring(0, 5)` is positions 0 to 4, `"Hello"`, without the comma at position 5. Excluding the end means `substring(7, 12)` is exactly `12 - 7 = 5` characters long.

**Intuition.**
*Mechanism.* Each method reads the String and returns a result: a new String, an `int` position, or a `boolean`. The original is never altered (immutability again). `indexOf` returns the position, or `-1` when the text is not found.

*Concrete bite.* That `-1` is a value, not an error, and it bites if you assume the search succeeded:

```java run
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello".indexOf("z"));
    }
}
```

**Output:**
```
-1
```

`"z"` is not in `"Hello"`, so `indexOf` returns `-1`. It is a **sentinel**, a special value that means "not found", not an exception. Hand that `-1` to `substring` or `charAt`, and *that* call throws. The search itself quietly gave you a value you were supposed to check.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Check `indexOf`'s result against `-1` before using it as a position. The cost of a method that returns a sentinel rather than throwing is a *delayed* failure. You learn nothing is wrong at the `indexOf` call, only later, when `-1` reaches code that cannot handle it. `Optional`, in [Modern Java idioms](/synapse/programming-languages/java/advanced/modern-java-idioms), is the typed alternative to sentinel values.

</div>

---

## 4. Concatenation with `+`

`+` between two strings joins them; that is **concatenation**. `+` between a string and a number turns the number into text, then joins <abbr title="The Java Language Specification, Java SE 21, §15.18.1">[3]</abbr>. It is the quickest way to build output, and it hides a precedence surprise.

```java run
public class Main {
    public static void main(String[] args) {
        String name = "Ada";
        int age = 36;
        System.out.println("name: " + name + ", age: " + age);
        System.out.println("sum: " + 1 + 2);
        System.out.println(1 + 2 + " = sum");
    }
}
```

**Output:**
```
name: Ada, age: 36
sum: 12
3 = sum
```

**Analysis.** The first line joins text with `name` and `age`; the `int` `36` becomes `"36"`. The next two look symmetric but differ. `+` runs **left to right**, as in [Numbers and arithmetic](/synapse/programming-languages/java/first-steps/numbers-and-arithmetic), and once one side is a String, `+` means "join":

- In `"sum: " + 1 + 2`, the first `+` joins `"sum: "` and `1` into `"sum: 1"`. Then `+ 2` joins again, into `"sum: 12"`. The numbers were never added.
- In `1 + 2 + " = sum"`, the first `+` is `int + int = 3`, with no String yet. Only then does `3 + " = sum"` join into `"3 = sum"`.

**Intuition.**
*Mechanism.* Each `+` looks only at its immediate left and right. If either side is a String, it concatenates, converting the other side to text. Only when both sides are numbers does it add.

*Concrete bite.* The `"sum: 12"` above is the bite: a "sum" that never added. Parenthesise the arithmetic to fix it:

```java run
public class Main {
    public static void main(String[] args) {
        System.out.println("sum: " + (1 + 2));
    }
}
```

**Output:**
```
sum: 3
```

The parentheses force `1 + 2 = 3` first, then the concatenation.

*Non-example: two `char`s before any String.* A `char` is a number to `+`, as [Numbers and arithmetic](/synapse/programming-languages/java/first-steps/numbers-and-arithmetic) showed with `'A' + 1`. So `'J' + 'a'` adds character codes, and only then meets the String:

```java run
public class Main {
    public static void main(String[] args) {
        System.out.println('J' + 'a' + "va");
        System.out.println("" + 'J' + 'a' + "va");
        System.out.println("Ja" + 'v' + 'a');
    }
}
```

**Output:**
```
171va
Java
Java
```

`'J'` is code 74 and `'a'` is code 97, so the first `+` gave `171`. Starting with a String, even the empty String `""`, makes every `+` a join.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** When you mix text and arithmetic with `+`, wrap the arithmetic in parentheses: `"sum: " + (1 + 2)`. The cost of `+`'s double meaning is this ordering trap.

There is a second cost. Every `+` that runs while the program runs creates a new String <abbr title="The Java Language Specification, Java SE 21, §15.18.1">[3]</abbr>. Building long text with `+` inside a loop therefore copies the text again on every step: O(N²) work for N pieces. `StringBuilder`, in [Strings in depth](/synapse/programming-languages/java/core-libraries/strings-in-depth), is the linear-time fix.

</div>

---

## 5. `==` vs `.equals` and the String pool

`==` compares two values and gives `true` or `false`. For primitives it compares the values themselves: with `int a = 5, b = 5;`, `a == b` is `true`. For strings you have two tools that look interchangeable but ask different questions:

- `==` asks "are these the **same object**?"
- `.equals` asks "do these have the **same characters**?"

For text you nearly always mean the second. (`new String("hello")` below builds a fresh String object; [Classes and objects](/synapse/programming-languages/java/classes-and-objects/classes-and-objects) teaches `new`.)

```java run
public class Main {
    public static void main(String[] args) {
        String a = "hello";
        String b = "hello";
        String c = new String("hello");
        System.out.println(a.equals(b));
        System.out.println(a.equals(c));
        System.out.println(a == b);
        System.out.println(a == c);
    }
}
```

**Output:**
```
true
true
true
false
```

**Analysis.** `.equals` is `true` for both comparisons: `a`, `b` and `c` all spell `"hello"`. But `==` disagrees: `a == b` is `true`, while `a == c` is `false`.

The cause is the **String pool**. Identical string *literals*, like the `"hello"` written for `a` and `b`, are stored once and shared <abbr title="The Java Language Specification, Java SE 21, §3.10.5">[4]</abbr>. So `a` and `b` are the *same* object, and `==` happens to be true. `new String("hello")` builds a *separate* object on purpose, so `a == c` is false even though the characters match.

**Intuition.**
*Mechanism.* A String variable holds a reference. `==` compares the two references (same object?), while `.equals` compares the characters. The pool reuses literal strings, which makes `==` *coincidentally* true for literals: the most dangerous form of "it works."

*Concrete bite.* The coincidence collapses the moment a string comes from anywhere but a literal: a `new String`, typed input, a computation.

```java run
public class Main {
    public static void main(String[] args) {
        String typed = new String("yes");
        System.out.println(typed == "yes");
        System.out.println(typed.equals("yes"));
    }
}
```

**Output:**
```
false
true
```

The text is `"yes"` both ways. `==` compared object identities, two different objects, and was `false`; `.equals` compared characters and was `true`.

*Non-example: text joined while the program runs.* The same happens with no `new` in sight. Strings computed by concatenation at run time are new objects, never taken from the pool <abbr title="The Java Language Specification, Java SE 21, §3.10.5">[4]</abbr>:

```java run
public class Main {
    public static void main(String[] args) {
        String a = "hello";
        String part = "hel";
        String b = part + "lo";   // joined while the program runs
        System.out.println(b);
        System.out.println(a == b);
        System.out.println(a.equals(b));
    }
}
```

**Output:**
```
hello
false
true
```

`b` prints as `hello`, yet `a == b` is `false`. A program that checks typed or computed text with `==` rejects correct answers, and it seems random, because only literals and other constants are pooled.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Compare String *contents* with `.equals`, or `.equalsIgnoreCase` when case should not matter. Reserve `==` for primitives and deliberate identity checks. The cost of the pool is that `==` *looks* right in quick tests with literals, then fails on real, non-literal strings. Never let a passing literal test convince you `==` is correct for text.

This is one face of a deeper rule about objects. The full treatment is in [References, equality and the object model](/synapse/programming-languages/java/classes-and-objects/references-equality-and-the-object-model). The contract behind hash-based collections is in [Equals and hashCode](/synapse/programming-languages/java/core-libraries/equals-and-hashcode).

</div>

---

## 6. Mental-model summary

| Principle | Consequence |
|---|---|
| A String is an object (a reference type), not a primitive | It has methods (`.length()`, `.charAt(i)`); an out-of-range position throws at run time |
| A backslash starts an escape sequence | `\"` is a quote, `\n` a line break, `\\` a backslash; an unescaped `"` ends the String |
| Strings are immutable | Every "edit" returns a new String; `s.strip();` alone changes nothing — assign it |
| Positions start at 0; `substring(begin, end)` excludes `end` | `"Hello, World".substring(0, 5)` is `"Hello"`; `indexOf` returns `-1` when not found |
| `+` runs left to right and means "join" once a String is involved | `"sum: " + 1 + 2` is `"sum: 12"`; `'J' + 'a' + "va"` is `"171va"`; parenthesise arithmetic |
| `==` compares identity; `.equals` compares characters | `==` is true for pooled literals, false for `new String` and text built at run time — use `.equals` |

## 7. Gotcha checklist

<div style="border-left:4px solid #da5233;background:rgba(218,82,51,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

| Symptom | Likely cause | Fix |
|---|---|---|
| A string "edit" didn't take | the method returned a new String you ignored | assign it back: `s = s.toUpperCase();` |
| `StringIndexOutOfBoundsException: Index N out of bounds for length N` | a position reached `length` or beyond | valid positions are `0` to `length − 1`; check against `length()` |
| `StringIndexOutOfBoundsException: Range [-1, …` | `indexOf` returned `-1` (not found), and it was used as a position | test for `-1` first |
| `substring` is one character short, or long | `substring(begin, end)` excludes `end` | pass one past the last position you want |
| `')' or ',' expected` inside a line of text | a `"` inside the String was not escaped | write it as `\"` |
| A path prints with a line break or a gap in it | `\n` or `\t` inside the path was read as an escape | double the backslash: `"C:\\new"` |
| A `+` "sum" joined instead of adding | once a String appeared, `+` meant "join" | wrap the arithmetic: `"sum: " + (a + b)` |
| Characters joined into a number (`171va`) | two `char`s were added before any String | start with a String: `"" + 'J' + 'a'` |
| String comparison with `==` works in tests, fails with real input | `==` compared identity; literals are pooled, but typed or computed text is not | use `.equals` |
| `"Yes".equals("yes")` is `false` | `.equals` is case-sensitive | use `.equalsIgnoreCase` |

</div>

---

## ✅ Check yourself

One check per objective. Answer before you open anything.

```quiz
{"prompt": "What does \"Hello, World\".substring(0, 5) return?", "options": ["\"Hello,\"", "\"Hello\"", "\"Hell\""], "answer": "\"Hello\""}
```

```quiz
{"prompt": "String s = \"hello\"; s.toUpperCase(); System.out.println(s); What does it print?", "options": ["HELLO", "Hello", "hello"], "answer": "hello"}
```

<details>
<summary>How do you print the text <code>She said "hi"</code>, and why does <code>"She said "hi""</code> not compile?</summary>

Escape each inner quote: `System.out.println("She said \"hi\"");`. The backslash makes `\"` one quote character inside the String <abbr title="The Java Language Specification, Java SE 21, §3.10.7">[2]</abbr>.

Without the backslashes, the String ends at the second `"`. javac reads `hi` as code and reports `')' or ',' expected`.

</details>

```quiz
{"prompt": "What does System.out.println(\"px\" + 2 + 3); print?", "options": ["px5", "5px", "px23"], "answer": "px23"}
```

```quiz
{"prompt": "input holds text the user typed. Which line tests whether they typed yes?", "options": ["input == \"yes\"", "input.equals(\"yes\")", "input = \"yes\""], "answer": "input.equals(\"yes\")"}
```

<details>
<summary>The 🧪 box below: what do the four lines print?</summary>

`true`, `true`, `false`, `true`.

`"ja" + "va"` joins two literals, so it is a **constant expression**: the compiler joins it before the program runs. Constant strings are pooled like literals <abbr title="The Java Language Specification, Java SE 21, §3.10.5">[4]</abbr>, so `y` is the same object as `x`, and `x == y` is `true`. `z` is a separate object built with `new`, so `x == z` is `false`. `.equals` compares characters, so it is `true` both times.

</details>

---

## 📚 Sources

1. Java SE 21 API, `java.lang.String` (immutability; `charAt`, `substring`, `indexOf`, `strip` (since 11), `trim`) — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/String.html>
2. *The Java Language Specification, Java SE 21*, §3.10.7 "Escape Sequences" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-3.html#jls-3.10.7>
3. *The Java Language Specification, Java SE 21*, §15.18.1 "String Concatenation Operator `+`" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.18.1>
4. *The Java Language Specification, Java SE 21*, §3.10.5 "String Literals" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-3.html#jls-3.10.5>

---

<div style="border-left:4px solid #6d28d9;background:rgba(109,40,217,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

🧪 **Predict, then check.** Predict the four lines of output before running this code. `String x = "java"; String y = "ja" + "va"; String z = new String("java");` then print `x == y`, `x.equals(y)`, `x == z`, and `x.equals(z)`.

Hint: `"ja" + "va"` is two *literals*, joined by the compiler before the program runs. Does that land it in the pool with `x`, or make a separate object like `z`? Decide each `true`/`false`, then run it. Reconcile any surprise with the rule: `==` compares identity, while `.equals` compares characters.

</div>

## Your Turn

Before you move on, check your understanding with the coach — explain the idea, apply it, weigh the trade-offs, then defend your reasoning.

<div class="concept-coach"></div>
