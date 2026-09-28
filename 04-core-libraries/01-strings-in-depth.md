---
title: Strings in Depth
summary: A String is immutable, so every "change" allocates a new object — which makes building a string with + in a loop quadratic, and StringBuilder the O(n) fix. Plus intern(), why StringBuilder doesn't override equals, splitting on a regex and joining, formatting with formatted(), and multi-line text blocks (JDK 15). Every behavior shown with verified output.
prereqs: []
---

# Strings in Depth — Immutability and Its Cost

In [Strings, the Basics](/synapse/programming-languages/java/first-steps/strings-the-basics) you learned that a `String` is immutable: every method that seems to edit it returns a *new* object. That was a correctness fact. Here it becomes a *performance* fact:

- each concatenation that runs builds a brand-new String, so concatenating in a loop does O(N²) work;
- `StringBuilder`, a mutable buffer of characters, is the O(N) fix.

This lesson also adds `intern()` to the [String pool](/synapse/programming-languages/java/classes-and-objects/references-equality-and-the-object-model), shows why `StringBuilder` does not compare by contents, and covers splitting and joining. It ends with the modern tools for assembling text: `formatted()` and multi-line **text blocks**.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **The core idea.**

- A `String` is **immutable**: every "edit" allocates a new object.
- So `+=` in a loop is quietly **O(N²)**; `StringBuilder` is the O(N) fix.
- Plus `intern()`, why `StringBuilder` doesn't compare by contents, `split` and `join`, and text blocks.

</div>

This is the deep pass of [Strings, the Basics](/synapse/programming-languages/java/first-steps/strings-the-basics). Every output below was produced by compiling and running the code on Java 21.

**You'll be able to:** explain why `+=` in a loop is O(N²), and rewrite it with a `StringBuilder`; predict `equals` for two builders with the same text, and compare their contents correctly; predict `==` before and after `intern()`; predict what `split` returns for a `.` separator, and fix it; place a text block's closing `"""` to get the indentation and final newline you want.

<div style="border-left:4px solid #15448e;background:rgba(21,68,142,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

📘 **How to read the Intuition boxes.** Each one is built in three moves:

1. **The mechanism** — what the compiler and the JVM *do*.
2. **A concrete bite** — a specific, runnable failure (often a real compiler error), shown so the trap is visible.
3. **The earned rule** — the decision heuristic, now justified rather than asserted, plus its cost.

</div>

---

## Table of contents

1. [Immutability and the cost of `+`](#1-immutability-and-the-cost-of-)
2. [`StringBuilder`: the O(n) fix](#2-stringbuilder-the-on-fix)
3. [The pool and `intern()`](#3-the-pool-and-intern)
4. [Splitting and joining](#4-splitting-and-joining)
5. [Formatting and text blocks](#5-formatting-and-text-blocks)
6. [Mental-model summary](#6-mental-model-summary)
7. [Gotcha checklist](#7-gotcha-checklist)
8. [Check yourself](#-check-yourself)
9. [Sources](#-sources)

---

## 1. Immutability and the cost of `+`

A `String` never changes, so `s = s + "b"` does **not** extend `s`. It builds a new String and points `s` at it <abbr title="The Java Language Specification, Java SE 21, §15.18.1">[1]</abbr>.

We can see the new object with `System.identityHashCode`. It returns a number for an object, and the same object always gives the same number <abbr title="Java SE 21 API, Object.hashCode and System.identityHashCode">[2]</abbr>. So two different numbers mean two different objects:

```java run
public class Main {
    public static void main(String[] args) {
        String s = "a";
        int h1 = System.identityHashCode(s);
        s = s + "b";
        int h2 = System.identityHashCode(s);
        System.out.println(s);
        System.out.println(h1 == h2);
    }
}
```

**Output:**
```
ab
false
```

**Analysis.** After `s = s + "b"`, `s` reads `"ab"`, but `h1 == h2` is `false`: `s` now refers to a *different* object. The `+` did not modify the original `"a"`; it allocated a new `"ab"`.

The numbers themselves vary per run, which is why we compare them rather than print them. (The reverse does not hold. Distinct numbers for distinct objects are promised only "as far as is reasonably practical" <abbr title="Java SE 21 API, Object.hashCode and System.identityHashCode">[2]</abbr>, so equal numbers prove nothing.)

**Intuition.**
*Mechanism.* The JLS says the result of `+` on strings is a **newly created** String, unless the whole expression is a constant <abbr title="The Java Language Specification, Java SE 21, §15.18.1">[1]</abbr>.

- Inside one expression such as `a + b + c`, Java may skip the in-between Strings and build the result in one step. Since JDK 9, javac hands that step to a library method chosen at run time <abbr title="JEP 280: Indify String Concatenation">[3]</abbr>.
- A *loop* is different. Each pass runs the expression again, and each new String copies every character built so far.

*Concrete bite.* Append one character `N` times with `out += "x"`. Pass `k` copies `k` characters, so the total is `1 + 2 + … + N`, about N²/2 copies: **quadratic**.

The result is correct, so nothing warns you; only the time grows. Doubling `N` should roughly quadruple the `+=` time. Your times will differ from these:

```java run
public class Main {
    static long plusEquals(int n) {
        long t0 = System.nanoTime();
        String out = "";
        for (int i = 0; i < n; i++) {
            out += "x";
        }
        return (System.nanoTime() - t0) / 1_000_000;
    }

    static long builder(int n) {
        long t0 = System.nanoTime();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            sb.append("x");
        }
        String out = sb.toString();
        return (System.nanoTime() - t0) / 1_000_000;
    }

    public static void main(String[] args) {
        for (int n = 50_000; n <= 200_000; n *= 2) {
            System.out.println(n + " pieces: += " + plusEquals(n) + " ms, StringBuilder " + builder(n) + " ms");
        }
    }
}
```

**Output** *(illustrative — the times vary by machine and by run):*
```
50000 pieces: += 87 ms, StringBuilder 2 ms
100000 pieces: += 279 ms, StringBuilder 1 ms
200000 pieces: += 943 ms, StringBuilder 0 ms
```

Each doubling of `N` made `+=` more than three times slower, heading for the four times that N² predicts. `StringBuilder` stayed near zero. Small sizes are noisy while the JVM warms up; the trend is the point.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** `+` is fine for a *fixed, small* number of pieces in one expression: it is readable, and Java may build the result in one step. Never build a string with `+=` inside a loop.

The cost of ignoring this rule is a program that works in tests and crawls on large input. It is a performance bug with no error, and the next section fixes it.

</div>

---

## 2. `StringBuilder`: the O(n) fix

`StringBuilder` is a *mutable* sequence of characters <abbr title="Java SE 21 API, java.lang.StringBuilder">[4]</abbr>. `append` adds to it **in place**, with no new object per step. `toString()` produces the final `String` once, at the end. The total work is linear.

```java run
public class Main {
    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 5; i++) {
            sb.append(i);
        }
        String result = sb.toString();
        System.out.println(result);
        System.out.println(result.length());
    }
}
```

**Output:**
```
01234
5
```

**Analysis.** The loop appended `0` to `4` into one growing buffer, and `toString()` produced `"01234"` at the end. That is a single String allocation instead of one per step.

A builder can do more than append. Because it is mutable, its methods change it in place, and most of them return the same builder, so calls chain:

```java run
public class Main {
    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder("stressed");
        sb.reverse();
        System.out.println(sb);
        sb.insert(0, "[").append("]");
        System.out.println(sb);
        sb.deleteCharAt(0).setLength(sb.length() - 1);
        System.out.println(sb);
        sb.setCharAt(0, 'D');
        System.out.println(sb);
        StringBuilder same = sb.append("!");
        System.out.println(same == sb);
        System.out.println(new StringBuilder().capacity());
    }
}
```

**Output:**
```
desserts
[desserts]
desserts
Desserts
true
16
```

**Analysis.**

- `reverse`, `insert`, `deleteCharAt`, `setLength` and `setCharAt` all edited the one object `sb`.
- `same == sb` is `true`: `append` returned the builder it was called on. That is why `sb.append(x).append(y)` works.
- `println(sb)` printed the text. `println` turns any object into text with `String.valueOf`, which calls its `toString()` <abbr title="Java SE 21 API, PrintStream.println(Object)">[17]</abbr>.
- A new, empty builder has room for 16 characters before it must grow <abbr title="Java SE 21 API, java.lang.StringBuilder">[4]</abbr>.

**Intuition.**
*Mechanism.* A `StringBuilder` keeps its characters in an internal array with spare room, its **capacity**. `append` writes into that room.

When the room runs out, the builder "is automatically made larger" <abbr title="Java SE 21 API, java.lang.StringBuilder">[4]</abbr>. OpenJDK grows it to twice its size plus 2 (16, 34, 70, 142 in a run), so the copies stay rare, and N appends cost O(N) in total. (Since JDK 9 that array holds bytes, not `char`s, to save memory on Latin-1 text <abbr title="JEP 254: Compact Strings">[5]</abbr>. The API is the same.)

*Concrete bite.* `StringBuilder` does **not** override `equals` <abbr title="Java SE 21 API, StringBuilder.compareTo, API Note">[6]</abbr>. It inherits `Object`'s `equals`, which is identity, the same trap as arrays in [References, Equality & the Object Model](/synapse/programming-languages/java/classes-and-objects/references-equality-and-the-object-model):

```java run
public class Main {
    public static void main(String[] args) {
        StringBuilder a = new StringBuilder("hi");
        StringBuilder b = new StringBuilder("hi");
        System.out.println(a.equals(b));
        System.out.println(a.toString().equals(b.toString()));
    }
}
```

**Output:**
```
false
true
```

`a.equals(b)` is `false`: two builders are never "equal" unless they are the same object. To compare *contents*, convert to `String` first. Two shortcuts skip the conversion:

- `"hi".contentEquals(a)` compares a String with any sequence of characters <abbr title="Java SE 21 API, String.contentEquals(CharSequence)">[7]</abbr>;
- `a.compareTo(b) == 0` compares two builders by their characters (since Java 11) <abbr title="Java SE 21 API, StringBuilder.compareTo, API Note">[6]</abbr>.

Why a class compares by identity unless it overrides `equals` is the subject of [equals & hashCode](/synapse/programming-languages/java/core-libraries/equals-and-hashcode).

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Use `StringBuilder` to assemble a string across many steps, and call `toString()` once to finish. Compare its contents through a `String`, never with `StringBuilder.equals`.

The cost is a little ceremony and a mutable object to manage. The benefit is linear-time building and a clear seam: the builder is "in progress", and the `String` you hand out is finished and immutable.

</div>

You may meet `StringBuffer` in older code. It has the same methods, but they are synchronized, so several threads can share one buffer safely <abbr title="Java SE 21 API, java.lang.StringBuffer">[16]</abbr>. The API recommends `StringBuilder` for single-threaded use, as "it will be faster under most implementations" <abbr title="Java SE 21 API, java.lang.StringBuilder">[4]</abbr>.

---

## 3. The pool and `intern()`

Recall from [References, Equality & the Object Model](/synapse/programming-languages/java/classes-and-objects/references-equality-and-the-object-model): string literals and constant expressions are **interned**, so equal ones are the same object <abbr title="The Java Language Specification, Java SE 21, §3.10.5">[8]</abbr>. A string computed at run time is a fresh object. `intern()` takes a runtime string and returns the shared instance from the pool.

```java run
public class Main {
    public static void main(String[] args) {
        String a = "he";
        String b = a + "llo";   // built at run time from a variable — not pooled
        String c = "hello";
        System.out.println(b == c);
        System.out.println(b.intern() == c);
        System.out.println(b.equals(c));
    }
}
```

**Output:**
```
false
true
true
```

**Analysis.**

- `b` is built from the *variable* `a`, so it is a new object, and `b == c` is `false`, though both read `"hello"`.
- `b.intern()` returns the pooled `"hello"`, the same object the literal `c` points at, so `b.intern() == c` is `true`.
- `b.equals(c)` compares characters, so it is `true` regardless.

Written as two literals, `"he" + "llo"` is a constant expression, and it is pooled. The variable `a` is what makes `b` a runtime string.

**Intuition.**
*Mechanism.* The class `String` keeps a private pool, "initially empty" <abbr title="Java SE 21 API, String.intern()">[9]</abbr>. `intern()` looks for an equal string there. If it finds one, it returns that one; otherwise it adds this string and returns it. Literals are interned "as if by execution of the method `String.intern`" <abbr title="The Java Language Specification, Java SE 21, §3.10.5">[8]</abbr>.

*Concrete bite.* `b == c` being `false` is the identity trap again: only pooled strings share identity, and a variable-built string is not pooled. `intern()` *can* make `==` work. Needing it to compare strings is a sign you should use `.equals`.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Compare string contents with `.equals`. Reach for `intern()` only as a deliberate memory optimization: many equal runtime strings, deduplicated into one.

Never use `intern()` to make `==` "work". Its cost is a pool lookup on every call. Its benefit, in the rare right case, is one shared instance instead of thousands of duplicates.

</div>

---

## 4. Splitting and joining

Two methods move between one string and many:

- `split(regex)` cuts a string into an array at each separator <abbr title="Java SE 21 API, String.split(String)">[10]</abbr>;
- `String.join(separator, parts…)` glues pieces together, with the separator between them <abbr title="Java SE 21 API, String.join and String.repeat">[11]</abbr>.

```java run
import java.util.Arrays;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        String csv = "red,green,blue";
        String[] parts = csv.split(",");
        System.out.println(parts.length);
        System.out.println(Arrays.toString(parts));
        System.out.println(String.join(" | ", parts));
        System.out.println(String.join("-", List.of("2026", "09", "28")));
        System.out.println("ab".repeat(3));
    }
}
```

**Output:**
```
3
[red, green, blue]
red | green | blue
2026-09-28
ababab
```

**Analysis.** `split(",")` produced three parts, and `Arrays.toString` printed the array (a plain `println` of an array prints only its type and hash). `String.join` accepts an array or a `List`. `repeat(3)` (Java 11) joins three copies <abbr title="Java SE 21 API, String.join and String.repeat">[11]</abbr>.

**Intuition.**
*Mechanism.* The argument to `split` is not plain text. It is a **regular expression**: a small pattern language in which some characters have special meanings <abbr title="Java SE 21 API, java.util.regex.Pattern">[18]</abbr>. Letters and `,` match themselves. `.` means "any character", and `|` means "or".

*Concrete bite.* Split a version number on `.`, and every character is a separator:

```java run
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        String version = "21.0.4";
        System.out.println(version.split(".").length);
        System.out.println(Arrays.toString(version.split("\\.")));
        System.out.println(Arrays.toString("a,b,,".split(",")));
        System.out.println(Arrays.toString("a,b,,".split(",", -1)));
    }
}
```

**Output:**
```
0
[21, 0, 4]
[a, b]
[a, b, , ]
```

**Analysis.**

- `split(".")` matched *every* character, so every part was empty. `split` drops trailing empty strings <abbr title="Java SE 21 API, String.split(String)">[10]</abbr>, so the result has length `0`.
- `"\\."` is the fix. The regex `\.` means "a literal dot", and a Java string writes the backslash as `\\`.
- `"a,b,,"` split on `,` lost its two trailing empty fields. Pass a negative limit, `split(",", -1)`, to keep them.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Treat `split`'s argument as a regex. Escape `. | * + ? ( ) [ ] { } ^ $ \` with `\\`, and pass `-1` as the limit when empty fields count.

The cost is one more rule to remember. The benefit is that one call can split on patterns, such as `" +"` for "one or more spaces".

</div>

---

## 5. Formatting and text blocks

Two modern tools make assembling readable text easier:

- `formatted(...)` (Java 15) is the instance-method twin of [`String.format`](/synapse/programming-languages/java/first-steps/input-and-output), with the same `%s` and `%d` placeholders <abbr title="Java SE 21 API, String.formatted(Object...)">[12]</abbr>.
- A **text block** (`"""…"""`, Java 15) is a multi-line string literal. It keeps line breaks and strips the common leading indentation <abbr title="JEP 378: Text Blocks">[13]</abbr>.

```java run
public class Main {
    public static void main(String[] args) {
        String name = "Ada";
        int score = 95;
        String report = """
            Name:  %s
            Score: %d
            """.formatted(name, score);
        System.out.print(report);
        System.out.println("[end]");
    }
}
```

**Output:**
```
Name:  Ada
Score: 95
[end]
```

**Analysis.**

- The text block spans the lines between the `"""` delimiters.
- Java stripped the common 12-space indentation, measured against the content lines and the closing `"""`.
- The block ended with a newline, because the closing `"""` sits on its own line. So `[end]` printed on a line of its own.
- `.formatted(name, score)` then filled the placeholders.

Text blocks remove the old pain of `"line1\n" + "line2\n"` for multi-line text such as SQL, JSON and HTML.

**Intuition.**
*Mechanism.* A text block is an ordinary `String` with friendlier syntax <abbr title="The Java Language Specification, Java SE 21, §3.10.6">[14]</abbr>. The compiler processes its content in three steps:

1. It turns every line ending into `\n`.
2. It removes **incidental white space**: the common leading indentation, and the trailing spaces on every line.
3. It interprets escape sequences such as `\n` and `\t`.

The opening `"""` must end its line <abbr title="The Java Language Specification, Java SE 21, §3.10.6">[14]</abbr>. A one-line text block does not compile:

```java run
public class Main {
    public static void main(String[] args) {
        String s = """hello""";
        System.out.println(s);
    }
}
```

**Compiler error:**
```
Main.java:3: error: illegal text block open delimiter sequence, missing line terminator
        String s = """hello""";
                      ^
```

*Concrete bite.* The indentation stripped is the *common minimum*, and the closing `"""` counts when it sits on its own line. Move it to the far left, and nothing is stripped:

```java run
public class Main {
    public static void main(String[] args) {
        String json = """
            {
              "key": 1
            }
""";
        System.out.print(json);
        System.out.println("[end]");
    }
}
```

**Output:**
```
            {
              "key": 1
            }
[end]
```

The closing `"""` sat at column 0, so the common indentation was zero, and every line kept its 12 leading spaces. Two escapes give finer control <abbr title="The Java Language Specification, Java SE 21, §3.10.7">[15]</abbr>:

```java run
public class Main {
    public static void main(String[] args) {
        String noNewline = """
            one
            two""";
        System.out.println("[" + noNewline + "]");
        String joined = """
            one \
            two
            """;
        System.out.print("[" + joined);
        String kept = """
            tab\s
            """;
        System.out.println(kept.length());
    }
}
```

**Output:**
```
[one
two]
[one two
5
```

**Analysis.**

- `two"""` put the closing delimiter on the last content line, so the block has no final newline.
- A `\` at the end of a line joins it to the next: `one two` is one line.
- `\s` is a space that is never stripped. `"tab\s"` plus its newline is 5 characters. Without the `\s`, a trailing space would be stripped.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Use text blocks for any multi-line literal, and `formatted()` to fill them. Put the closing `"""` on its own line, aligned with the content, to strip the indentation and end with a newline.

The cost is remembering that the closing delimiter's position controls the result. The benefit is multi-line strings you can read as the text they represent, without escape clutter.

</div>

---

## 6. Mental-model summary

| Principle | Consequence |
|---|---|
| Every concatenation that runs creates a new String | `+=` in a loop is O(N²); `+` in one expression is fine |
| `StringBuilder` mutates one buffer; `toString()` finishes | Building piece by piece is O(N); the right tool for loops |
| `StringBuilder` doesn't override `equals` | Two builders compare by identity; compare contents through `String`, `contentEquals` or `compareTo` |
| Literals and constant expressions are pooled; runtime strings are not | `b == "hello"` is false for a variable-built `b`; `intern()` returns the pooled one |
| `split` takes a regex and drops trailing empty strings | Escape a `.` separator as `"\\."`; pass `-1` to keep empty fields |
| A text block strips the common indentation and trailing spaces | The closing `"""` sets the indentation and the final newline |

## 7. Gotcha checklist

<div style="border-left:4px solid #da5233;background:rgba(218,82,51,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

| Symptom | Likely cause | Fix |
|---|---|---|
| Building a string is slow on large input, with no error | `+=` in a loop copies everything built so far, every pass | append to one `StringBuilder`, then call `toString()` once |
| Two `StringBuilder`s with the same text are not `equals` | `StringBuilder` does not override `equals` | `a.toString().equals(b.toString())`, `"…".contentEquals(a)` or `a.compareTo(b) == 0` |
| A method that needs a `String` rejects a builder | a `StringBuilder` is not a `String` | call `toString()` |
| A runtime-built string `== "literal"` is `false` | only literals and constant expressions are pooled | use `.equals`; keep `intern()` for memory savings |
| `split(".")` returns an empty array | `.` is the regex for "any character" | `split("\\.")` |
| Trailing empty fields vanish from `split` | `split` drops trailing empty strings | `split(",", -1)` |
| `illegal text block open delimiter sequence, missing line terminator` | text after the opening `"""` on the same line | start the content on the next line |
| A text block keeps unwanted leading spaces | the closing `"""` is left of the content | align the closing `"""` with the content |
| A text block has no final newline | the closing `"""` is on the last content line | move it to a line of its own |
| Trailing spaces in a text block disappear | incidental white space includes trailing spaces | end the line with `\s` |

</div>

---

## ✅ Check yourself

One check per objective. Answer before you open anything.

```quiz
{"prompt": "A loop runs out += \"x\" for N passes, starting from out = \"\". About how many characters are copied in total?", "options": ["About N", "About N²/2", "About N log N"], "answer": "About N²/2"}
```

```quiz
{"prompt": "StringBuilder a = new StringBuilder(\"x\"); StringBuilder b = new StringBuilder(\"x\"); — what does a.equals(b) print?", "options": ["true", "It does not compile", "false"], "answer": "false"}
```

```quiz
{"prompt": "String a = \"he\"; String b = a + \"llo\"; — what do b == \"hello\" and b.intern() == \"hello\" print, in that order?", "options": ["false true", "true true", "false false"], "answer": "false true"}
```

```quiz
{"prompt": "What does \"1.2.3\".split(\".\").length return?", "options": ["3", "0", "5"], "answer": "0"}
```

```quiz
{"prompt": "A text block's closing \"\"\" sits on its own line, 4 columns left of the content lines. What happens to the content's indentation?", "options": ["All of it is stripped", "It keeps 4 leading spaces per line", "It does not compile"], "answer": "It keeps 4 leading spaces per line"}
```

<details>
<summary>The 🧪 box below: both lengths, the builders' <code>equals</code>, and where the closing <code>"""</code> goes.</summary>

- Both ways build `"0123456789"`, so both lengths are `10`. The two ways differ in cost, not result.
- `new StringBuilder("x").equals(new StringBuilder("x"))` is `false`: `StringBuilder` keeps `Object`'s identity `equals`.
- Put the closing `"""` on its own line, in the same column as `{` and `}`. The common indentation is then the indentation of `{`, so `{` and `}` print at the left margin, and `"key"` keeps its 2 extra spaces:

```java run
public class Main {
    public static void main(String[] args) {
        String json = """
            {
              "key": 1
            }
            """;
        System.out.print(json);
    }
}
```

**Output:**
```
{
  "key": 1
}
```

</details>

---

## 📚 Sources

1. *The Java Language Specification, Java SE 21*, §15.18.1 "String Concatenation Operator `+`" ("The String object is newly created … unless the expression is a constant expression") — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.18.1>
2. `java.lang.System.identityHashCode(Object)` and `java.lang.Object.hashCode()`, Java SE 21 API — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/System.html#identityHashCode(java.lang.Object)>
3. JEP 280: Indify String Concatenation (JDK 9) — <https://openjdk.org/jeps/280>
4. `java.lang.StringBuilder`, Java SE 21 API (capacity 16; "automatically made larger"; "no guarantee of synchronization") — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/StringBuilder.html>
5. JEP 254: Compact Strings (JDK 9) — <https://openjdk.org/jeps/254>
6. `java.lang.StringBuilder.compareTo(StringBuilder)`, Java SE 21 API (since 11; "does not override equals") — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/StringBuilder.html#compareTo(java.lang.StringBuilder)>
7. `java.lang.String.contentEquals(CharSequence)`, Java SE 21 API — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/String.html#contentEquals(java.lang.CharSequence)>
8. *The Java Language Specification, Java SE 21*, §3.10.5 "String Literals" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-3.html#jls-3.10.5>
9. `java.lang.String.intern()`, Java SE 21 API — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/String.html#intern()>
10. `java.lang.String.split(String)`, Java SE 21 API ("Trailing empty strings are therefore not included") — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/String.html#split(java.lang.String)>
11. `java.lang.String.join` (since 1.8) and `String.repeat` (since 11), Java SE 21 API — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/String.html#join(java.lang.CharSequence,java.lang.CharSequence...)>
12. `java.lang.String.formatted(Object...)`, Java SE 21 API (since 15) — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/String.html#formatted(java.lang.Object...)>
13. JEP 378: Text Blocks (JDK 15) — <https://openjdk.org/jeps/378>
14. *The Java Language Specification, Java SE 21*, §3.10.6 "Text Blocks" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-3.html#jls-3.10.6>
15. *The Java Language Specification, Java SE 21*, §3.10.7 "Escape Sequences" (`\s`; line continuation) — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-3.html#jls-3.10.7>
16. `java.lang.StringBuffer`, Java SE 21 API ("The methods are synchronized where necessary") — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/StringBuffer.html>
17. `java.io.PrintStream.println(Object)`, Java SE 21 API ("calls at first String.valueOf(x)") — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/io/PrintStream.html#println(java.lang.Object)>
18. `java.util.regex.Pattern`, Java SE 21 API (`.` is "Any character"; `X|Y` is "Either X or Y") — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/regex/Pattern.html>

---

<div style="border-left:4px solid #6d28d9;background:rgba(109,40,217,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

🧪 **Predict, then check.**

1. Build `"0123456789"` two ways and print the length of each: once with `String out = ""; for (int i = 0; i < 10; i++) out += i;`, once with a `StringBuilder`.
2. Predict `new StringBuilder("x").equals(new StringBuilder("x"))`.
3. Write a text block holding three lines of JSON: `{` on its own line, a `"key": 1` line, and `}` on its own line. Predict where the closing `"""` must go so that `{` and `}` sit at the left margin.

</div>

## Your Turn

Before you move on, check your understanding with the coach — explain the idea, apply it, weigh the trade-offs, then defend your reasoning.

<div class="concept-coach"></div>
