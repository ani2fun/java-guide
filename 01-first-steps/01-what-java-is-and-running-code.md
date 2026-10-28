---
title: What Java Is & Running Code
summary: Java is a compiled language. You write source code, javac translates the whole file into portable bytecode, and the JVM runs it. So running Java is always compile-then-run, and it can fail at either step. Covers your first program, the javac, java and jshell tools, why public static void main looks the way it does, println, and comments. Every example is compiled and run.
prereqs: []
---

# What Java Is & Running Code — Your First Program

Java is a **compiled** language, and that one fact shapes everything you're about to do.

- You write **source code**: plain text, like the program below.
- A tool called the **compiler** reads the *whole* file and checks it for mistakes.
- If the file passes, the compiler translates it into **bytecode** — a set of instructions for an imaginary computer called the **Java Virtual Machine** (the **JVM**).
- The JVM is a real program on your machine. It reads the bytecode and carries it out.

So running Java always takes two steps: **compile, then run**. The payoff is portability. Bytecode targets the *virtual* machine, not your laptop, so the same compiled program runs unchanged on Windows, macOS or Linux <abbr title="The Java Virtual Machine Specification, Java SE 25, §1.2">[4]</abbr>.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **The core idea.**

- You write **source code**; a **compiler** translates the whole file into **bytecode**.
- The **JVM** runs that bytecode — so running Java is always **compile, then run**.
- Because bytecode targets a *virtual* machine, the same program runs unchanged anywhere.

</div>

This chapter gets you running real Java. It shows you both halves of the loop — including what each half looks like when it says *no*, because Java says no in two very different ways.

You don't need anything installed. Every block with a ▶ Run button compiles and runs in a sandboxed **Java 25** environment, and every `Output:` block below was produced by compiling and running its code.

**You'll be able to:** predict from where its mistake is whether a broken program prints anything; compile and run a program from a terminal, naming the class rather than the file; identify the mistake in a `main` declaration from the JVM's launch message, and say which shortened forms JDK 25 accepts; predict the lines that a mix of `print` and `println` produces; explain why a commented-out line never runs, and why one block comment can't hold another.

<div style="border-left:4px solid #15448e;background:rgba(21,68,142,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

📘 **How to read the Intuition boxes.** Each one is built in three moves:

1. **The mechanism** — what the compiler and the JVM *do*.
2. **A concrete bite** — a specific, runnable failure (often a real compiler error), shown so the trap is visible.
3. **The earned rule** — the decision heuristic, now justified rather than asserted, plus its cost.

</div>

---

## Table of contents

1. [A first Java program](#1-a-first-java-program)
2. [Compile, then run: `javac`, bytecode, and the JVM](#2-compile-then-run-javac-bytecode-and-the-jvm)
3. [Reading `public static void main(String[] args)`](#3-reading-public-static-void-mainstring-args)
4. [`System.out.println` — how a program talks back](#4-systemoutprintln--how-a-program-talks-back)
5. [Comments — notes for humans](#5-comments--notes-for-humans)
6. [Mental-model summary](#6-mental-model-summary)
7. [Gotcha checklist](#7-gotcha-checklist)
8. [Check yourself](#-check-yourself)
9. [Sources](#-sources)

---

## 1. A first Java program

A **program** is a list of **instructions**, also called **statements**, carried out in order. In Java, every statement has to live inside a **method**, which is a named block of statements. And every method lives inside a **class**, which is a named container.

That's more scaffolding than some languages ask for, and §3 explains every word of it. For now, here's the smallest complete Java program. Go ahead and run it.

```java run
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, world!");
    }
}
```

**Output:**
```
Hello, world!
```

**Analysis.** The program has three nested parts:

- The outer `public class Main { ... }` is the **class**: a container named `Main`.
- Inside it, `public static void main(String[] args) { ... }` is the **method** named `main`. This is what the JVM runs first.
- Inside *that* sits a single statement, `System.out.println("Hello, world!");`, which prints a line of text.

The text between the double quotes is shown exactly as written; the quotes themselves aren't printed. The `;` ends the statement, the way a period ends a sentence.

**Intuition.**
*Mechanism.* Running this happens in two phases, not one. First, the **compiler** (`javac`) reads the entire file and translates it to bytecode. Only if that succeeds does the **JVM** start executing `main`, one statement at a time, from top to bottom. The compiler's job is to check everything *before* anything runs.

*Concrete bite.* Because compiling is a gate, a single missing `;` means the program never runs at all. There's no partial output — just a compiler complaint pointing at the spot. Click Run and see for yourself:

```java run
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, world!")
    }
}
```

**Compiler error:**
```
Main.java:3: error: ';' expected
        System.out.println("Hello, world!")
                                           ^
1 error
```

The compiler read the whole file and found that the statement on line 3 had no `;`, so it refused to produce bytecode. Nothing ran, which is why `Hello, world!` appears nowhere.

*Non-example: a mistake the compiler can't see.* Some mistakes get past the compiler, and fail only while the program runs. Dividing a whole number by zero is one of them: the compiler accepts `10 / 0`, but the JVM refuses to compute it.

```java run
public class Main {
    public static void main(String[] args) {
        System.out.println("before");
        System.out.println(10 / 0);
        System.out.println("after");
    }
}
```

**Output** *(prints `before`, then a thrown exception):*
```
before
Exception in thread "main" java.lang.ArithmeticException: / by zero
```

This time, `before` *did* print. The program compiled, so the JVM started running it, line by line. It stopped at the line it couldn't carry out, and `after` never printed.

- That's a **run-time** failure: the JVM refused while carrying the program out.
- The missing `;` was a **compile-time** failure: `javac` refused while checking the file.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Java checks first and runs second. So a program that doesn't compile produces **no** output — not even the lines before the mistake. A run-time failure is different: every line before it has already run.

The cost is up-front strictness: you have to satisfy the compiler before you see anything happen. But the payoff compounds with every chapter. A whole category of mistakes gets caught *before* your program touches real data — the compiler is a proof-checker you get to run for free.

</div>

---

## 2. Compile, then run: `javac`, bytecode, and the JVM

You've met the two phases as error messages; now meet them as commands. When you install Java, you install the **JDK** (Java Development Kit), which is a toolbox. Two of its tools matter here: `javac`, the **compiler**, and `java`, the **launcher** that starts the JVM.

```mermaid
---
config:
  theme: base
  themeVariables:
    primaryColor: "#dbeafe"
    primaryBorderColor: "#3b82f6"
    primaryTextColor: "#1e3a5f"
    lineColor: "#64748b"
---
flowchart LR
  SRC["Main.java<br/>the source code you write"]
  JAVAC["javac<br/>the compiler"]
  BC["Main.class<br/>bytecode for the JVM"]
  JVM["java<br/>starts the JVM"]
  OUT["Output<br/>Hello, world!"]
  SRC -->|"compile (once)"| JAVAC --> BC
  BC -->|"run (anywhere)"| JVM --> OUT
```

You type these commands in a **terminal**: a window where you type a command, press Enter, and read its text reply. macOS calls it Terminal, and Windows has PowerShell. In a terminal, the loop is explicit — two commands:

```
javac Main.java   # compile: reads Main.java, writes Main.class (bytecode)
java Main          # run: starts the JVM, which executes Main.class
```

`javac` turns your `Main.java` into a new file, `Main.class`, which holds bytecode. `java Main` then hands that bytecode to the JVM, which runs it. Note that it's `java Main`, not `java Main.class`: you name the **class**, not the file <abbr title="The java command, JDK 25 documentation">[5]</abbr>. Name the file instead, and the JVM goes looking for a class called `Main.class`, which doesn't exist:

```
$ java Main.class
Error: Could not find or load main class Main.class
Caused by: java.lang.ClassNotFoundException: Main.class
```

The Run buttons here do the same two steps for you: they compile your code as `Main.java` with `javac`, then start it with `java`. Since Java 11, there's also a one-step shortcut for a single file: `java Main.java` compiles the file in memory and runs it, leaving no `.class` file behind <abbr title="JEP 330: Launch Single-File Source-Code Programs (JDK 11)">[6]</abbr>. Since JDK 22, that shortcut also finds the other source files your program uses, so a small multi-file program runs without a separate `javac` step <abbr title="JEP 458: Launch Multi-File Source-Code Programs (JDK 22)">[9]</abbr>.

```java run
public class Main {
    public static void main(String[] args) {
        System.out.println("compiled to bytecode,");
        System.out.println("then run by the JVM.");
    }
}
```

**Output:**
```
compiled to bytecode,
then run by the JVM.
```

**Analysis.** Behind the Run button, two things happened in order. First, `javac` checked both statements and translated them into bytecode. Then the JVM executed them from top to bottom: first line, then second. In a terminal, you'd type `javac Main.java` and then `java Main` to get the same two lines.

**Intuition.**
*Mechanism.* `java` doesn't run your *source*; it runs the *bytecode* the compiler produced. The JVM knows nothing about the Java language, only about the class-file format <abbr title="The Java Virtual Machine Specification, Java SE 25, §1.2">[4]</abbr>. By the time the launcher loads a class, the `.java` text no longer matters.

*Concrete bite.* Ask the JVM to run a class that was never compiled, and it has nothing to load:

```
java Ghost
```
```
Error: Could not find or load main class Ghost
Caused by: java.lang.ClassNotFoundException: Ghost
```

There's no `Ghost.class`, so the JVM stops before running a single instruction. This is a *run-time* failure — the JVM complaining — not a *compile-time* one.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Compiling and running are separate steps, with separate failures. `javac` rejects bad *source* (at compile time), and the JVM rejects missing or broken *bytecode* (at run time).

The cost of two steps is the ceremony of compiling before running. The payoff is **portability**: `Main.class` is plain bytecode, so the same file runs on any machine with a JVM. That's why a program built on a developer's Mac runs unchanged on a Linux server.

</div>

**You can't name the file just anything.** `javac` requires a `public` class to sit in a file with the same name, plus `.java` <abbr title="The Java Language Specification, Java SE 25, §7.6">[2]</abbr>. So `public class Main` belongs in `Main.java`. Put `public class Hello` in a file named `Main.java` on your own machine, and `javac` refuses:

```
$ javac Main.java
Main.java:1: error: class Hello is public, should be declared in a file named Hello.java
public class Hello {
       ^
1 error
```

Here, the file was `Main.java` but the class was `Hello`, so rename one to match the other. (The Run buttons hide this rule from you: they rename the first class to `Main` before compiling.)

For quick experiments, there's a third tool, **jshell**. It's a Java REPL (Read–Eval–Print Loop): it evaluates one expression at a time, with no class and no `main`.

```
jshell> 1 + 1
$1 ==> 2
jshell> "Java" + "!"
$2 ==> "Java!"
```

Type an expression, press Enter, and jshell shows the result. The names `$1` and `$2` are ones it invents for those results. It's the fastest way to answer "what does this do?" Real programs are compiled classes, though, and that's what the rest of this book writes.

---

## 3. Reading `public static void main(String[] args)`

That line is the one piece of ceremony that nearly every Java program repeats, and it's worth understanding rather than copying on faith. Each word tells the JVM *how* to start, and none of it is decoration. Here's a sketch of each part; later chapters come back to most of them:

- `public` — an **access level**: this method can be called from outside the class. The JVM starts your program from *outside* it, so the entry point must be reachable. *([Access levels](/synapse/programming-languages/java/classes-and-objects/encapsulation-and-access-modifiers) come later.)*
- `static` — this method belongs to the **class itself**, not to an **object** built from it. The JVM can call it straight away, before your program has created any objects. *([Objects](/synapse/programming-languages/java/classes-and-objects/classes-and-objects) come later.)*
- `void` — the **return type**: `main` hands no value back when it finishes. *([Methods and return types](/synapse/programming-languages/java/control-flow/methods).)*
- `main` — the **name** the JVM looks for, spelled exactly `main`. Java is **case-sensitive**, so `Main` (the class) and `main` (the method) are different names. The class is the container; the method is the starting point.
- `String[] args` — a **parameter**: a slot for **command-line arguments**, the extra words typed after `java Main`. They arrive as a list of text values. You rarely need them at first, but the JVM always passes them. *([Arrays](/synapse/programming-languages/java/control-flow/arrays).)*

Read as a whole, the line describes a public, class-level method named `main` that returns nothing and takes a list of text arguments. The JVM is built to find a method named `main` and call it <abbr title="The Java Language Specification, Java SE 25, §12.1.4">[1]</abbr>. This full form is the one every version of Java accepts. Two details are yours to choose: the parameter's name (`args` is just a convention), and whether to write `String... args` instead of `String[] args`.

```java run
public class Main {
    public static void main(String[] args) {
        System.out.println("The JVM called main.");
    }
}
```

**Output:**
```
The JVM called main.
```

**Analysis.** The JVM loaded `Main`, found a method shaped `public static void main(String[] args)`, and called it. The modifiers, the return type, the name and the parameter type all had to match for that call to happen.

**Intuition.**
*Mechanism.* The JVM doesn't run "the class". It looks for a method named `main` with an acceptable declaration, and calls *that*. The name and shape form a contract: miss a required part of it, and there's nothing for the JVM to call.

*Concrete bite.* Rename `main` to `greet`. The class still **compiles** — it's a perfectly legal class — but at run time, the JVM can't find its entry point:

```java run
public class Main {
    public static void greet(String[] args) {
        System.out.println("never printed");
    }
}
```

**Output** *(a launch error — the JVM finds no `main`, so nothing runs):*
```
Error: Main method not found in class Main, please define the main method as:
   public static void main(String[] args)
or a JavaFX application class must extend javafx.application.Application
```

It compiled, because the method is valid Java. But it never ran `greet`, because the JVM only ever calls `main`. The error even reminds you of the shape it wants.

Until JDK 25, the contract was strict: `main` had to be `public`, `static`, return `void` and take a `String[]`. JDK 25 relaxed it <abbr title="JEP 512: Compact Source Files and Instance Main Methods (JDK 25; first previewed in JDK 21 as JEP 445)">[7]</abbr>. Now `main` must still be named `main` and return `void`, but `public` and `static` are optional, and so is the parameter. Only `private` is ruled out <abbr title="The Java Language Specification, Java SE 25, §12.1.4 (&quot;The form of a candidate main method expanded significantly in Java SE 25&quot;)">[1]</abbr>. Here's what the JDK 25 launcher does with each variation. Every one of them compiles:

| You wrote | What happens on JDK 25 |
|---|---|
| `public static void main(String[] args)` | runs: the classic form, accepted by every version |
| `static void main(String[] args)` (no `public`) | runs |
| `void main(String[] args)` (no `static`) | runs: the JVM first creates a `Main` object, then calls `main` on it |
| `void main()` (no parameter) | runs |
| `private static void main(String[] args)` | `Main method not found in class Main` |
| `public static int main(String[] args)` | `Main method not found in class Main` |
| `public static void main(String args)` | `Main method not found in class Main` |
| `public static void greet(String[] args)` | `Main method not found in class Main` |

Here's the shortest form, `void main()`, inside a class:

```java run
class Main {
    void main() {
        System.out.println("No public, no static, no args.");
    }
}
```

**Output:**
```
No public, no static, no args.
```

This `main` isn't `static`, so it belongs to an *object*. The JVM made one by calling `new Main()`, and then called `main` on it. If a class has both a `main(String[] args)` and a `main()`, the JVM picks the one with the parameter.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** The entry point is a method named `main` that returns `void`, and isn't `private`. The cost: a mistake in the *declaration* gives you no compile error, only a launch error, because the method you wrote is legal — it just isn't one the JVM calls. When a program compiles but won't start, read the launch message, then check the name, the return type and the parameter.

</div>

**Compact source files.** JDK 25 goes one step further: you can leave out the class too. A file that holds only methods and fields is a **compact source file**, and the compiler wraps it in a class for you, named after the file <abbr title="JEP 512: Compact Source Files and Instance Main Methods (JDK 25)">[7]</abbr>. The new `IO` class in `java.lang` gives such programs a short way to print:

```java run
void main() {
    IO.println("Hello from a compact source file");
}
```

**Output:**
```
Hello from a compact source file
```

That's a whole program. It's handy for small scripts and first experiments.

This book uses the classic `public static void main(String[] args)` inside `class Main`. That's what nearly all existing code uses, and it runs on every version of Java, including older ones you'll meet at work. The Run buttons use **JDK 25**, a long-term-support release from September 2025 <abbr title="OpenJDK, JDK 25 project page">[8]</abbr>, so both forms run here.

---

## 4. `System.out.println` — how a program talks back

A program that can't show anything is useless, and `System.out.println` is the statement that prints. Read it piece by piece:

- `System.out` is the program's standard text **output**: the console.
- `println` is an action you ask of it: "print this, then move to the next line."
- The value you want printed goes inside the parentheses.

```java run
public class Main {
    public static void main(String[] args) {
        System.out.println("first line");
        System.out.println("second line");
    }
}
```

**Output:**
```
first line
second line
```

**Analysis.** Two `println` calls produced two lines. Each one printed its text and then ended the line, so the second call started fresh below the first. We never wrote anything about a line break: the "ln" in `println` *is* that automatic newline.

**Intuition.**
*Mechanism.* There are two related actions. `println` prints its argument **and** ends the line. `print` (with no "ln") prints its argument and **stops there**, leaving whatever comes next on the same line.

*Concrete bite.* Mix the two, and the difference becomes visible — `print` keeps the cursor on the line, while `println` breaks it:

```java run
public class Main {
    public static void main(String[] args) {
        System.out.print("a");
        System.out.print("b");
        System.out.println("c");
        System.out.println("d");
    }
}
```

**Output:**
```
abc
d
```

The `a`, `b` and `c` all landed on one line (`abc`), because only the `println` at `c` ended it. Then `d` printed on the next line. Swap an earlier `print` for a `println`, and the line splits sooner.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Use `println` when you want each piece on its own line, and `print` when you're building a line in parts. Mixing them up is cosmetic, but common. A row of `print` calls runs your output together (`abc`), and a stray `println` breaks a line you meant to keep whole. When in doubt, `println` is the safe default, since most output is line-at-a-time.

</div>

---

## 5. Comments — notes for humans

Not every line in a file is meant for the computer. A **comment** is a note for the people reading the code, and the compiler skips it entirely. Java has two forms of comment <abbr title="The Java Language Specification, Java SE 25, §3.7">[3]</abbr>:

- `//` ignores the rest of *that line*.
- `/* ... */` ignores everything between the markers, across as many lines as you like.

```java run
public class Main {
    public static void main(String[] args) {
        // This whole line is a comment — the compiler ignores it
        System.out.println("code runs");  // an inline comment, ignored too
        /* a block comment
           spanning two lines, also ignored */
        // System.out.println("this line is commented out, so it never runs");
    }
}
```

**Output:**
```
code runs
```

**Analysis.** Four of the lines inside `main` are comments, and only one statement printed anything:

- The `//` line did nothing.
- The inline `// ...` after the working statement was ignored, while the statement itself ran.
- The `/* ... */` block vanished, across both of its lines.
- The last line is a real `println` with `//` in front of it, so it never ran.

Putting `//` before a line to disable it is called **commenting out**.

**Intuition.**
*Mechanism.* While reading your source, the compiler discards everything from `//` to the end of the line, and everything between `/*` and `*/` — before it does anything else. Commented text never becomes bytecode, so it can't run.

*Concrete bite.* The missing line is the proof: the output is just `code runs`. The commented-out `println` was legal code, but it sat behind `//`, so the compiler never saw it as a statement, and it produced nothing.

*Non-example: a block comment inside a block comment.* Comments don't nest <abbr title="The Java Language Specification, Java SE 25, §3.7">[3]</abbr>. A `/* ... */` comment ends at the **first** `*/`, wherever that happens to be. Wrap a line that already carries a block comment, and the outer comment ends too early:

```java run
public class Main {
    public static void main(String[] args) {
        System.out.println("start");
        /* switch off the next line:
        System.out.println("hidden"); /* old note */
        */
    }
}
```

**Compiler error:**
```
Main.java:6: error: illegal start of expression
        */
        ^
```

The comment that opened on line 4 closed at `old note */` on line 5. That left the lone `*/` on line 6 over as code — and `*/` isn't Java. To switch off lines that hold block comments, put `//` in front of each line instead.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Use comments to explain **why**, not to restate **what** the code plainly does. "Comment out" a line with `//` to disable it while you experiment.

The cost is that comments are never checked against the code. The compiler ignores them, so a comment that has gone stale states a falsehood with total confidence. Keep your comments honest, or delete them.

</div>

---

## 6. Mental-model summary

| Principle | Consequence |
|---|---|
| Java runs in two phases: compile (`javac`), then run (the JVM) | A program that doesn't compile produces no output at all |
| A run-time failure stops the program where it happens | Every line before it has already run and printed |
| `javac` turns source into portable **bytecode** (`.class`); the JVM runs the bytecode | The same compiled class runs on any machine with a JVM — "write once, run anywhere" |
| `java` takes a **class** name; a `public` class lives in a file of the same name | `java Main`, not `java Main.class`; `public class Main` goes in `Main.java` |
| Every statement lives in a method, inside a class; statements run top to bottom | The `main` method is required; a compact source file (JDK 25) lets the compiler supply the class |
| The JVM calls a non-`private` method named `main` that returns `void` | A wrong declaration compiles but won't start; `public static void main(String[] args)` runs on every version |
| `println` ends the line; `print` does not | A row of `print`s runs together; `println` is the line-at-a-time default |
| `//` and `/* */` are ignored by the compiler; block comments do not nest | Comments are for humans; "commenting out" disables code; stale comments can lie |

## 7. Gotcha checklist

<div style="border-left:4px solid #da5233;background:rgba(218,82,51,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

| Symptom | Likely cause | Fix |
|---|---|---|
| `error: ';' expected`, and nothing printed | a statement is missing its `;` | add it where the caret `^` points |
| Some lines printed, then `Exception in thread "main"` | a run-time failure: the program compiled, then stopped at one line | read the exception's name, then the `at Main.main(Main.java:N)` line under it: line N failed |
| `Could not find or load main class X` | there is no `X.class`: you didn't compile, mistyped the name, or typed `java X.class` | run `javac X.java`, then `java X` — the class name, not the file |
| `class X is public, should be declared in a file named X.java` | the file name and the `public` class name differ | rename the file or the class so they match |
| `Main method not found in class Main` | the method isn't named `main`, is `private`, doesn't return `void`, or its parameter isn't `String[]` | declare it as `public static void main(String[] args)` |
| `no non-private zero argument constructor found in class Main` | `main` isn't `static`, so the JVM must call `new Main()`, but the class has no such constructor | add `static`, or give the class a no-argument constructor |
| Output runs together on one line | `print` where you meant `println` | use `println`; the "ln" is the line break |
| A line you expected to run did nothing | it is behind `//` or inside `/* */` | remove the comment markers |
| `illegal start of expression` at a lone `*/` | a block comment inside a block comment | disable the lines with `//` instead |
| Edited the code, but the output didn't change (on a terminal) | you re-ran `java` without re-running `javac`, so the old `.class` ran | recompile after every edit (the Run button recompiles for you) |

</div>

---

## ✅ Check yourself

One check per objective. Answer before you open anything.

```quiz
{"prompt": "A program's first statement prints \"one\". Its second statement is missing its semicolon. What does running it print?", "options": ["one", "one, then an error", "Nothing: javac rejects the file, so no statement runs"], "answer": "Nothing: javac rejects the file, so no statement runs"}
```

```quiz
{"prompt": "You compiled Main.java into Main.class. Which command runs it?", "options": ["java Main.class", "java Main", "javac Main"], "answer": "java Main"}
```

```quiz
{"prompt": "On JDK 25, which of these main declarations does the launcher reject?", "options": ["void main()", "static void main(String[] args)", "public static int main(String[] args)"], "answer": "public static int main(String[] args)"}
```

```quiz
{"prompt": "What does this print?  System.out.print(\"x\"); System.out.println(\"y\"); System.out.print(\"z\");", "options": ["x, y and z on three lines", "xyz on one line", "xy on one line, then z on the next"], "answer": "xy on one line, then z on the next"}
```

<details>
<summary>What does <code>System.out.println("// not a comment");</code> print, and why? Then: why does wrapping <code>/* old note */</code> in another <code>/* ... */</code> break the build?</summary>

It prints `// not a comment`. Inside the double quotes, `//` is just two characters of text, because comments don't occur inside string literals <abbr title="The Java Language Specification, Java SE 25, §3.7">[3]</abbr>.

A block comment ends at the first `*/`. The inner `old note */` closes the outer comment, so the outer `*/` is left over as code, which javac rejects.

</details>

---

## 📚 Sources

1. *The Java Language Specification, Java SE 25*, §12.1.4 "Invoke a `main` Method" — <https://docs.oracle.com/javase/specs/jls/se25/html/jls-12.html#jls-12.1.4>
2. *The Java Language Specification, Java SE 25*, §7.6 "Top Level Class and Interface Declarations" — <https://docs.oracle.com/javase/specs/jls/se25/html/jls-7.html#jls-7.6>
3. *The Java Language Specification, Java SE 25*, §3.7 "Comments" — <https://docs.oracle.com/javase/specs/jls/se25/html/jls-3.html#jls-3.7>
4. *The Java Virtual Machine Specification, Java SE 25*, §1.2 "The Java Virtual Machine" — <https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-1.html#jvms-1.2>
5. The `java` command, JDK 25 documentation — <https://docs.oracle.com/en/java/javase/25/docs/specs/man/java.html>
6. JEP 330: Launch Single-File Source-Code Programs (JDK 11) — <https://openjdk.org/jeps/330>
7. JEP 512: Compact Source Files and Instance Main Methods (JDK 25) — <https://openjdk.org/jeps/512>
8. OpenJDK, JDK 25 (general availability 16 September 2025; "a long-term support (LTS) release from most vendors") — <https://openjdk.org/projects/jdk/25/>
9. JEP 458: Launch Multi-File Source-Code Programs (JDK 22) — <https://openjdk.org/jeps/458>

---

<div style="border-left:4px solid #6d28d9;background:rgba(109,40,217,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

🧪 **Predict, then check.** Look again at the §3 program whose method is named `greet` instead of `main`. Before re-running it, answer two questions: does it **compile**? And does it **run**? Then fix it by renaming `greet` to `main`, and predict the output before you click Run. 

If you can explain why the broken version compiles but won't start, you've got the most important idea in this chapter. **Java checks your program at compile time and again at run time, and the two stages fail in different ways.**

</div>

## Your Turn

Before you move on, check your understanding with the coach — explain the idea, apply it, weigh the trade-offs, then defend your reasoning.

<div class="concept-coach"></div>
