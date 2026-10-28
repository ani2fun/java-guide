---
title: Strings, the Basics
summary: A String is an immutable object, not a primitive. Every "change" makes a new String, a call whose result you ignore does nothing, and comparing text needs .equals (characters), not == (identity). The String pool makes that last one easy to get wrong. Covers creating strings, escape sequences, zero-based positions and substring, concatenation and its left-to-right trap, and a first look at == vs equals.
prereqs: []
---

# Strings, the Basics — Text as an Immutable Object

A **String** is a piece of text: characters in double quotes, like `"Ada"`. Unlike the [primitives of the last chapters](/synapse/programming-languages/java/first-steps/variables-and-primitive-types), a String is an **object** — a value that bundles its data together with **methods**, which are actions you can ask it to perform. Two consequences of being an object flow through everything you do with text:

- A String is **immutable**: it can never be changed. Every method that seems to edit it actually returns a *new* String.
- Comparing two strings means choosing between two questions: "the same object?" (`==`) or "the same characters?" (`.equals`). Choosing the wrong one is among the most common beginner bugs in Java.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **The core idea.**

- A `String` is an **object**, not a primitive.
- It is **immutable**, so every method that seems to edit it returns a *new* String.
- Compare text with `.equals` (same characters), not `==` (same object).

</div>

This is a first pass. The model underneath "object" gets its full treatment in [References, equality and the object model](/synapse/programming-languages/java/classes-and-objects/references-equality-and-the-object-model), and Strings come back in [Strings in depth](/synapse/programming-languages/java/core-libraries/strings-in-depth). For now, two ideas carry the chapter: a String is immutable, and you compare its contents with `.equals`. Every output below was produced by compiling and running the code on Java 25.

**You'll be able to:** predict what `charAt`, `substring` and `indexOf` return, counting positions from 0; explain why calling `s.toUpperCase()` on its own changes nothing, and fix it; write a string that holds a double quote or a line break; predict the output of a `+` chain that mixes text and numbers; choose `.equals` or `==` for a comparison, and explain why `==` passes on literals but fails on text built while the program runs.

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

You write a String with **double** quotes. Because it's an object, it carries methods, and you call one with a dot: `name.length()`.

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

**Analysis.** `"Ada"` is a String: a sequence of characters, and an object. Because it's an object, it answers method calls:

- `name.length()` asks how many characters it has: `3`.
- `name.charAt(0)` asks for the character at position `0`. That's the *first* one, because positions start at zero, so it's `'A'`.

Remember the two kinds of quote from [Variables and primitive types](/synapse/programming-languages/java/first-steps/variables-and-primitive-types). `charAt` returns a `char` (`'A'`, single quotes, one character), not a one-character String (`"A"`, double quotes).

**Intuition.**
*Mechanism.* A String variable is a **reference type**. `name` holds a reference to a String object stored elsewhere; it doesn't hold the characters directly, the way an `int` holds its number. For now, it's enough to know that a String is an object you send method calls to.

*Concrete bite.* Positions run from `0` to `length − 1`, so reaching past the end is a run-time error <abbr title="Java SE 25 API, java.lang.String">[1]</abbr>:

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

`"Ada"` has length `3`, so the valid positions are `0`, `1` and `2`. `charAt(3)` is one past the end, so it throws.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Index strings from `0` to `length − 1`; `charAt(length)` is always off the end. An out-of-range position fails at *run time*, with an exception, rather than at compile time, because the compiler can't know the position in advance. When the position comes from a calculation, check it against `length()` first.

</div>

### Characters that need a backslash

A double quote ends a String. So how do you put one *inside* a String? You write a **backslash** in front of it: `\"`. A backslash plus the character after it form an **escape sequence**, which stands for a single character <abbr title="The Java Language Specification, Java SE 25, §3.10.7">[2]</abbr>:

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

Each `\"` printed a quote, `\n` split the line in two, and `\\` printed a single backslash. Inside double quotes, a single quote needs no escape (`"it's"`). You need the escape only inside a `char` literal (`'\''`).

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

The caret points at `hi`, the first thing after the String ended. So whenever javac reports `')' or ',' expected` inside a line of text, look for a quote that needs `\"`.

---

## 2. Immutability: methods return new strings

A String never changes. Methods that look like they edit it (`toUpperCase`, `replace`, `strip`) actually return a **new** String and leave the original alone. This property is called **immutability**, and the String API puts it plainly: "Strings are constant; their values cannot be changed after they are created" <abbr title="Java SE 25 API, java.lang.String">[1]</abbr>.

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

**Analysis.** `toUpperCase()` produced a *new* String, `"HELLO"`, and we stored it in `shout`. The original `greeting` is still `"hello"`. The method didn't edit the string in place. It built a new one and handed it back.

**Intuition.**
*Mechanism.* Every String operation that "transforms" text returns a brand-new String object. The original keeps the same characters for its whole life. No String method changes a String in place.

*Concrete bite.* That means calling one of these methods and ignoring the result does nothing at all:

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

`toUpperCase()` ran and produced `"HELLO"`, but nothing caught the result, so it was thrown away. `greeting` was never going to change. To keep the new value, assign it: `greeting = greeting.toUpperCase();`. That line points the *variable* at the new String. The old String itself stays exactly as it was.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Treat every String method as handing back a new value you must capture: `s = s.strip();`, not `s.strip();`. Immutability costs you this gotcha (a call that seems to do nothing), plus extra objects when you transform text over and over.

The payoff is safety. A String you pass to other code can never be changed behind your back. That's what makes Strings dependable as constants, and as keys in the maps of [Sets and maps](/synapse/programming-languages/java/core-libraries/sets-and-maps).

</div>

---

## 3. Everyday string methods

Strings come with a big toolkit <abbr title="Java SE 25 API, java.lang.String">[1]</abbr>, but a handful of methods covers most days:

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

Notice that methods **chain**. `s.strip().length()` runs `strip` first, which makes a new String, and then calls `length` on that result. `trim()` is an older cousin of `strip()`, but it removes only characters up to the plain space. So reach for `strip()`, added in Java 11 <abbr title="Java SE 25 API, java.lang.String">[1]</abbr>.

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

`substring(0, 5)` covers positions 0 to 4, giving `"Hello"` without the comma at position 5. Because the end is excluded, `substring(7, 12)` is exactly `12 - 7 = 5` characters long.

**Intuition.**
*Mechanism.* Each method reads the String and returns a result: a new String, an `int` position, or a `boolean`. The original never changes (immutability again). `indexOf` returns the position, or `-1` when it can't find the text.

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

`"z"` isn't in `"Hello"`, so `indexOf` returns `-1`. That's a **sentinel**: a special value that means "not found", not an exception. Hand that `-1` to `substring` or `charAt`, and *that* call throws. The search itself quietly gave you a value you were supposed to check.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Check `indexOf`'s result against `-1` before you use it as a position. A method that returns a sentinel instead of throwing costs you a *delayed* failure. Nothing looks wrong at the `indexOf` call. You find out only later, when `-1` reaches code that can't handle it. `Optional`, covered in [Modern Java idioms](/synapse/programming-languages/java/advanced/modern-java-idioms), is the typed alternative to sentinel values.

</div>

---

## 4. Concatenation with `+`

Put `+` between two strings and it joins them. That's **concatenation**. Put `+` between a string and a number, and it turns the number into text, then joins <abbr title="The Java Language Specification, Java SE 25, §15.18.1">[3]</abbr>. It's the quickest way to build output, but it hides a precedence surprise.

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

**Analysis.** The first line joins text with `name` and `age`, and the `int` `36` becomes `"36"`. The next two lines look symmetric, but they aren't. `+` runs **left to right**, as you saw in [Numbers and arithmetic](/synapse/programming-languages/java/first-steps/numbers-and-arithmetic). And once one side is a String, `+` means "join":

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

`'J'` is code 74 and `'a'` is code 97, so the first `+` gave `171`. Start with a String, even the empty String `""`, and every `+` becomes a join.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** When you mix text and arithmetic with `+`, wrap the arithmetic in parentheses: `"sum: " + (1 + 2)`. This ordering trap is the price of `+` having two meanings.

There's a second cost. Every `+` that executes while the program runs creates a new String <abbr title="The Java Language Specification, Java SE 25, §15.18.1">[3]</abbr>. So building long text with `+` inside a loop copies the text again on every step: O(N²) work for N pieces. `StringBuilder`, covered in [Strings in depth](/synapse/programming-languages/java/core-libraries/strings-in-depth), is the linear-time fix.

</div>

---

## 5. `==` vs `.equals` and the String pool

`==` compares two values and gives `true` or `false`. For primitives, it compares the values themselves: with `int a = 5, b = 5;`, `a == b` is `true`. For strings, though, you have two tools that look interchangeable but ask different questions:

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

The culprit is the **String pool**. Java stores identical string *literals*, like the `"hello"` written for `a` and `b`, once and shares them <abbr title="The Java Language Specification, Java SE 25, §3.10.5">[4]</abbr>. So `a` and `b` are the *same* object, and `==` happens to be true. `new String("hello")` builds a *separate* object on purpose, so `a == c` is false even though the characters match.

**Intuition.**
*Mechanism.* A String variable holds a reference. `==` compares the two references (same object?), while `.equals` compares the characters. The pool reuses literal strings, so `==` is *coincidentally* true for literals. That's the most dangerous kind of "it works."

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

The text is `"yes"` both ways. `==` compared object identities, found two different objects, and said `false`. `.equals` compared characters and said `true`.

*Non-example: text joined while the program runs.* The same thing happens with no `new` in sight. Strings built by concatenation at run time are new objects, never taken from the pool <abbr title="The Java Language Specification, Java SE 25, §3.10.5">[4]</abbr>:

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

`b` prints as `hello`, yet `a == b` is `false`. A program that checks typed or computed text with `==` rejects correct answers. Worse, it looks random, because only literals and other constants get pooled.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Compare String *contents* with `.equals`, or `.equalsIgnoreCase` when case shouldn't matter. Save `==` for primitives and deliberate identity checks. The pool's cost is that `==` *looks* right in quick tests with literals, then fails on real, non-literal strings. Never let a passing literal test convince you `==` is correct for text.

This is one face of a deeper rule about objects. [References, equality and the object model](/synapse/programming-languages/java/classes-and-objects/references-equality-and-the-object-model) gives it the full treatment, and [Equals and hashCode](/synapse/programming-languages/java/core-libraries/equals-and-hashcode) covers the contract behind hash-based collections.

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

Escape each inner quote: `System.out.println("She said \"hi\"");`. The backslash makes `\"` one quote character inside the String <abbr title="The Java Language Specification, Java SE 25, §3.10.7">[2]</abbr>.

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

`"ja" + "va"` joins two literals, so it's a **constant expression**, which the compiler joins before the program runs. Constant strings get pooled just like literals <abbr title="The Java Language Specification, Java SE 25, §3.10.5">[4]</abbr>. So `y` is the same object as `x`, and `x == y` is `true`. `z` is a separate object built with `new`, so `x == z` is `false`. `.equals` compares characters, so it's `true` both times.

</details>

---

## 📚 Sources

1. Java SE 25 API, `java.lang.String` (immutability; `charAt`, `substring`, `indexOf`, `strip` (since 11), `trim`) — <https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/String.html>
2. *The Java Language Specification, Java SE 25*, §3.10.7 "Escape Sequences" — <https://docs.oracle.com/javase/specs/jls/se25/html/jls-3.html#jls-3.10.7>
3. *The Java Language Specification, Java SE 25*, §15.18.1 "String Concatenation Operator `+`" — <https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.18.1>
4. *The Java Language Specification, Java SE 25*, §3.10.5 "String Literals" — <https://docs.oracle.com/javase/specs/jls/se25/html/jls-3.html#jls-3.10.5>

---

<div style="border-left:4px solid #6d28d9;background:rgba(109,40,217,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

🧪 **Predict, then check.** Predict the four lines of output before running this code. `String x = "java"; String y = "ja" + "va"; String z = new String("java");` then print `x == y`, `x.equals(y)`, `x == z`, and `x.equals(z)`.

Hint: `"ja" + "va"` is two *literals*, joined by the compiler before the program runs. Does that land it in the pool with `x`, or make a separate object like `z`? Decide each `true`/`false`, then run it. Reconcile any surprise with the rule: `==` compares identity, while `.equals` compares characters.

</div>

## Your Turn

Before you move on, check your understanding with the coach — explain the idea, apply it, weigh the trade-offs, then defend your reasoning.

<div class="concept-coach"></div>
