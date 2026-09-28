---
title: static vs Instance
summary: static members belong to the class — one shared copy — while instance members belong to each object. A static method has no this, so it cannot touch instance fields; static final makes shared constants; and a static block initializes class state once, lazily, when the class is first used. Every distinction shown with verified output.
prereqs: []
---

# `static` vs Instance — the Class vs the Object

You've used `static` since `main`, and met it again on helper methods; now it earns a precise definition. A **`static`** member belongs to the **class itself**: there is exactly one copy, shared by everything. An **instance** member belongs to each **object**, with a fresh copy per `new`.

That one distinction decides where a value lives, who can see it, and what a method may touch. A `static` method has no object, hence no `this`, hence no access to instance fields. The same keyword gives you class-wide **constants** (`static final`) and one-time class setup (a `static` block).

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **The core idea.**

- A **`static`** member belongs to the **class** — one shared copy — while an **instance** member belongs to each **object**.
- A `static` method has no `this`, so it cannot touch instance fields.
- The same keyword gives class-wide **constants** (`static final`) and one-time class setup.

</div>

This is the deep pass of [the `static` you've used on methods](/synapse/programming-languages/java/control-flow/methods), now set against the [instance state of objects](/synapse/programming-languages/java/classes-and-objects/classes-and-objects). Every output below was produced by compiling and running the code.

**You'll be able to:** predict the value of a `static` field after several objects are built, and name which fields the objects share; fix `non-static variable … cannot be referenced from a static context`, and decide whether a method should be `static`; write a `static final` constant, and explain why reading it may leave its class uninitialized; predict the order in which static initializers, instance initializers and constructor bodies run.

<div style="border-left:4px solid #15448e;background:rgba(21,68,142,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

📘 **How to read the Intuition boxes.** Each one is built in three moves:

1. **The mechanism** — what the compiler and the JVM *do*.
2. **A concrete bite** — a specific, runnable failure (often a real compiler error), shown so the trap is visible.
3. **The earned rule** — the decision heuristic, now justified rather than asserted, plus its cost.

</div>

---

## Table of contents

1. [`static` fields are shared](#1-static-fields-are-shared)
2. [`static` vs instance methods](#2-static-vs-instance-methods)
3. [`static final` constants](#3-static-final-constants)
4. [`static` initialization blocks](#4-static-initialization-blocks)
5. [Instance initializers and the order of construction](#5-instance-initializers-and-the-order-of-construction)
6. [Mental-model summary](#6-mental-model-summary)
7. [Gotcha checklist](#7-gotcha-checklist)
8. [Check yourself](#-check-yourself)
9. [Sources](#-sources)

---

## 1. `static` fields are shared

A `static` field is stored on the **class**, so every object sees the same one. An instance field is stored on each **object**, so each has its own. Here `count` is shared (how many widgets exist) and `id` is per-widget:

```java run
class Widget {
    static int count = 0;   // one copy, shared by all Widgets
    int id;                 // a separate copy in each Widget

    Widget() {
        count++;
        id = count;
    }
}

public class Main {
    public static void main(String[] args) {
        Widget a = new Widget();
        Widget b = new Widget();
        Widget c = new Widget();
        System.out.println("ids: " + a.id + " " + b.id + " " + c.id);
        System.out.println("count: " + Widget.count);
    }
}
```

**Output:**
```
ids: 1 2 3
count: 3
```

```d2
direction: right

cls: "class Widget\nstatic count = 3   (one shared copy)" {
  shape: package
}
a: "a : Widget\nid = 1" { shape: rectangle }
b: "b : Widget\nid = 2" { shape: rectangle }
c: "c : Widget\nid = 3" { shape: rectangle }

a -> cls
b -> cls
c -> cls
```

**Analysis.** Each constructor incremented the one shared `count` (`1`, `2`, `3`) and copied that into its own `id`. So the three widgets have distinct ids `1, 2, 3`, while `count` is a single value, `3`, reached through the class as `Widget.count`. The diagram shows three objects, each with its own `id`, all pointing at one class that holds the single `count`.

**Intuition.**
*Mechanism.* A `static` field has exactly one copy, however many objects exist, even zero <abbr title="The Java Language Specification, Java SE 21, §8.3.1.1">[1]</abbr>. It lives with the class. An instance field is created with each object, on the object. `Widget.count` names the class's copy; `a.id` names that object's copy.

*Concrete bite.* Because the static field is shared, a change through *any* path is seen by *all*. `count` reached `3` because three different constructors all incremented the same variable. That is the feature (a class-wide tally) and the hazard (shared mutable state that any instance can change).

*Non-example: a `static` field read through an object.* Java lets you write `a.count`, and it looks like `a`'s own field. It is not:

```java run
class Widget {
    static int count = 0;
    Widget() { count++; }
}

public class Main {
    public static void main(String[] args) {
        Widget a = new Widget();
        Widget b = new Widget();
        System.out.println(a.count + " " + b.count + " " + Widget.count);
    }
}
```

**Output:**
```
2 2 2
```

`a.count`, `b.count` and `Widget.count` are one variable. Compile with `javac -Xlint:static` and javac warns: `static variable should be qualified by type name, Widget, instead of by an expression`. Write `Widget.count`, so the reader sees it is shared.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Use a `static` field for state that belongs to the class as a whole (a counter, a shared cache, a registry). Use an instance field for anything that differs per object.

The cost of `static` mutable state is its sharing: it acts as a global variable. Changes from anywhere are visible everywhere, which makes it hard to reason about. It is also unsafe when several threads change it at once, a theme that returns in [Concurrency: the Basics](/synapse/programming-languages/java/advanced/concurrency-the-basics).

</div>

---

## 2. `static` vs instance methods

An instance method runs *on an object*, so it reaches that object's fields through the implicit `this`. A `static` method runs *on the class*. There is no object, no `this`, and therefore no instance fields to reach.

```java run
class Widget {
    static int count = 0;
    int id;
    Widget() { count++; id = count; }

    void describe() { System.out.println("id " + id + " of " + count); }  // instance: sees both
    static int total() { return count; }                                   // static: only static
}

public class Main {
    public static void main(String[] args) {
        new Widget();
        Widget w = new Widget();
        w.describe();
        System.out.println(Widget.total());
    }
}
```

**Output:**
```
id 2 of 2
2
```

**Analysis.** `describe()` is an instance method called on `w`, so it sees both `w.id` (`2`) and the shared `count` (`2`). `total()` is `static`, called as `Widget.total()` with no object. It can read `count` because `count` is also `static`, but it has no `id` to read. Instance methods can touch everything; static methods can touch only static members, unless they are handed an object.

**Intuition.**
*Mechanism.* An instance method receives a hidden `this`, and an unqualified field name resolves against it. A `static` method has no `this` <abbr title="The Java Language Specification, Java SE 21, §8.4.3.2">[2]</abbr>. An unqualified *instance* field name has nothing to resolve against, so the compiler rejects it.

*Concrete bite.* Reading an instance field from a static method is a compile error:

```java run
class Widget {
    int id = 5;
    static void show() {
        System.out.println(id);
    }
}

public class Main {
    public static void main(String[] args) {
        Widget.show();
    }
}
```

**Compiler error:**
```
Main.java:4: error: non-static variable id cannot be referenced from a static context
        System.out.println(id);
                           ^
1 error
```

`show()` is `static`, so there is no `this` and no particular widget whose `id` to print. Writing `this.id` does not help: javac says `non-static variable this cannot be referenced from a static context`. This is the rule that stopped `Rectangle.area()` in [Classes & Objects](/synapse/programming-languages/java/classes-and-objects/classes-and-objects): instance state needs an instance. A static method *can* read `w.id` when it is handed a `Widget w` as a parameter.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Make a method `static` when it doesn't depend on any one object's state: a utility that works purely from its arguments. Make it an instance method when it operates on `this` object's fields.

The cost of guessing wrong is a compile error the moment a static method reaches for instance state. The benefit is a signature that tells the truth: a `static` method visibly needs no object, so you can call it without making one.

</div>

---

## 3. `static final` constants

Combine `static` (one shared copy) with `final` (assigned once, never changed), and you get a **constant**: a single, unchangeable, class-wide value. Convention names them in `UPPER_SNAKE_CASE`.

```java run
class Circle {
    static final double PI = 3.14159;
    double radius;
    Circle(double radius) { this.radius = radius; }
    double area() { return PI * radius * radius; }
}

public class Main {
    public static void main(String[] args) {
        Circle c = new Circle(2.0);
        System.out.println(c.area());
        System.out.println(Circle.PI);
    }
}
```

**Output:**
```
12.56636
3.14159
```

**Analysis.** `PI` is one shared value, since there is no point giving every circle its own copy of a constant. `final` means nothing can change it. `area()` reads it like any field; `Circle.PI` reads it through the class. (The JDK already has a more precise one, `Math.PI`.)

**Intuition.**
*Mechanism.* `static` gives one copy; `final` forbids reassignment after its single initialization. Some of these are special. Take a `static final` field of a primitive type or `String`, set to a compile-time constant such as `100`. It is a **constant variable** <abbr title="The Java Language Specification, Java SE 21, §4.12.4">[3]</abbr>. javac copies its value into every place that reads it <abbr title="The Java Language Specification, Java SE 21, §13.1">[4]</abbr>. §4 shows a consequence.

*Concrete bite.* Trying to reassign a `static final` is rejected, the same way as an instance `final`:

```java run
class Config {
    static final int MAX = 100;
    static void raise() { MAX = 200; }
}

public class Main {
    public static void main(String[] args) { }
}
```

**Compiler error:**
```
Main.java:3: error: cannot assign a value to static final variable MAX
    static void raise() { MAX = 200; }
                          ^
1 error
```

`MAX` is `static final`, set once at declaration, so `raise()`'s attempt to change it won't compile. No method can move a constant.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Use `static final` for fixed, shared values: limits, conversion factors, configuration that never changes at run time. Name them in `UPPER_SNAKE_CASE` so readers know they're constants.

For values that are truly fixed, the cost is nothing. The discipline is reserving it for things that never vary. A `static final` you later need to vary forces a redesign.

</div>

---

## 4. `static` initialization blocks

A field initialized with a simple value can be set inline. When a class's `static` state needs *computation* to set up, a **`static` block**, `static { … }`, does that work once, when the class is initialized <abbr title="The Java Language Specification, Java SE 21, §8.7">[5]</abbr>.

```java run viz=array:SQUARES
class Lookup {
    static final int[] SQUARES = new int[5];
    static {
        for (int i = 0; i < SQUARES.length; i++) {
            SQUARES[i] = i * i;
        }
        System.out.println("static block ran");
    }
}

public class Main {
    public static void main(String[] args) {
        System.out.println("main start");
        System.out.println(Lookup.SQUARES[3]);
        System.out.println(Lookup.SQUARES[4]);
    }
}
```

**Output:**
```
main start
static block ran
9
16
```

**Analysis.** Read the order: `main start` printed *first*, and only then `static block ran`. The `Lookup` class isn't initialized until it's first *used*, the moment `main` reaches `Lookup.SQUARES`.

At that point the `static` block ran once and filled `SQUARES` (`0, 1, 4, 9, 16`). The reads that followed returned `9` and `16`. A `static` block is the constructor for class-level state.

**Intuition.**
*Mechanism.* A class is initialized **lazily**, immediately before the first of these <abbr title="The Java Language Specification, Java SE 21, §12.4.1">[6]</abbr>:

- an object of the class is created;
- a `static` method of the class is called;
- a `static` field of the class is assigned;
- a `static` field of the class is read, and it is **not** a constant variable (§3).

Initialization runs the `static` field initializers and `static` blocks in source order, exactly **once** per class <abbr title="The Java Language Specification, Java SE 21, §12.4.2">[7]</abbr>. Object construction is per object; class initialization is per class, one time. The class that holds `main` is initialized before `main` starts <abbr title="The Java Language Specification, Java SE 21, §12.1.3">[8]</abbr>, so a `static` block in `Main` prints before `main`'s first line.

*Concrete bite.* The single `static block ran` line is the proof of "once". `main` touched `Lookup` twice (`SQUARES[3]` and `SQUARES[4]`), yet the block ran a single time.

The last rule in the list has a visible edge. Reading a constant variable does not initialize its class, because javac already copied the value into the reader:

```java run
class Config {
    static final int MAX = 100;
    static int calls = 0;
    static {
        System.out.println("Config initialized");
    }
}

public class Main {
    public static void main(String[] args) {
        System.out.println(Config.MAX);
        System.out.println("after MAX");
        System.out.println(Config.calls);
    }
}
```

**Output:**
```
100
after MAX
Config initialized
0
```

`Config.MAX` printed `100` with no initialization: the `100` was already compiled into `Main`. `Config.calls` is not a constant, so reading it initialized `Config`, and the block printed first.

*Non-example: a `static` block that throws.* A `static` block runs where the class is first used, so its failure lands there too, wrapped in a new error:

```java run
class Table {
    static int[] cells = new int[2];
    static {
        System.out.println("filling");
        cells[5] = 1;
    }
}

public class Main {
    public static void main(String[] args) {
        System.out.println("start");
        System.out.println(Table.cells.length);
    }
}
```

**Output** *(prints `start` and `filling`, then a thrown exception):*
```
start
filling
Exception in thread "main" java.lang.ExceptionInInitializerError
	at Main.main(Main.java:12)
Caused by: java.lang.ArrayIndexOutOfBoundsException: Index 5 out of bounds for length 2
	at Table.<clinit>(Main.java:5)
```

The real fault is the `Caused by` line: index `5` in an array of length `2`. The JVM reports it as an `ExceptionInInitializerError` at the line in `main` that first used `Table` <abbr title="The Java Language Specification, Java SE 21, §12.4.2">[7]</abbr>. `<clinit>` is the JVM's name for a class's combined static initialization code <abbr title="The Java Virtual Machine Specification, Java SE 21, §2.9.2">[9]</abbr>.

The class is now marked as failed. Any later use of it throws `NoClassDefFoundError: Could not initialize class Table`, and the block never runs again.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Use a `static` block for class-level setup that needs more than a literal: building a lookup table, validating configuration, registering something. Rely on its run-once, lazy-on-first-use timing.

The cost is that the *moment* it runs is subtle: first use, not program start. A `static` block with side effects or ordering dependencies can surprise you, and a failure in it breaks the whole class. Keep them simple.

</div>

---

## 5. Instance initializers and the order of construction

Objects have a per-object twin of the `static` block. An **instance initializer** is a bare block, `{ … }`, in the class body. It runs every time an object is created <abbr title="The Java Language Specification, Java SE 21, §8.6">[10]</abbr>. This program logs every step of the class and object setup:

```java run
class Order {
    static int created = log("static field initializer");
    static {
        log("static block");
    }

    int id = log("instance field initializer");
    {
        log("instance block");
    }

    Order() {
        log("constructor body");
    }

    static int log(String step) {
        System.out.println(step);
        return 0;
    }
}

public class Main {
    public static void main(String[] args) {
        System.out.println("-- first new");
        new Order();
        System.out.println("-- second new");
        new Order();
    }
}
```

**Output:**
```
-- first new
static field initializer
static block
instance field initializer
instance block
constructor body
-- second new
instance field initializer
instance block
constructor body
```

**Analysis.** The first `new Order()` triggered class initialization: the static field initializer, then the static block, in source order. Then it built the object: the instance field initializer, then the instance block, again in source order, then the constructor body. The second `new` skipped the static part, since the class was already initialized, and repeated only the three instance steps.

**Intuition.**
*Mechanism.* `new` works in a fixed order <abbr title="The Java Language Specification, Java SE 21, §12.5">[11]</abbr>:

1. Initialize the class, if this is its first use: `static` initializers and `static` blocks, top to bottom, once.
2. Allocate the object; every field holds its default (`0`, `false`, `null`).
3. Run the instance field initializers and instance blocks, top to bottom.
4. Run the rest of the constructor body.

Both "top to bottom" steps follow **textual order**: the order of the lines in the file.

*Non-example: reading a field before its declaration.* Because static initializers run top to bottom, javac rejects an initializer that reads a field declared further down <abbr title="The Java Language Specification, Java SE 21, §8.3.3">[12]</abbr>:

```java run
public class Main {
    static int a = b + 1;
    static int b = 5;

    public static void main(String[] args) {
        System.out.println(a);
    }
}
```

**Compiler error:**
```
Main.java:2: error: illegal forward reference
    static int a = b + 1;
                   ^
1 error
```

When `a`'s initializer runs, `b` has not been set to `5` yet. Swap the two lines, and `a` becomes `6`.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Put object setup in the constructor. Reach for an instance block only for code that every constructor must share, and read a class's initializers top to bottom, the way the JVM runs them.

The cost of initializers spread across a class is that the order is textual, not logical. Moving a line changes what runs first. One constructor that does the setup keeps the order in one place.

</div>

---

## 6. Mental-model summary

| Principle | Consequence |
|---|---|
| A `static` member belongs to the class; an instance member to each object | One shared `count` vs a per-object `id`; reach statics via `ClassName.x` |
| `a.count` on a `static` field still names the one shared field | `a.count`, `b.count` and `Widget.count` are the same variable |
| A `static` method has no `this` | It cannot read instance fields, unless it is handed an object |
| `static final` is a shared, unchangeable constant | Reassigning it won't compile; name it `UPPER_SNAKE_CASE` |
| A primitive or `String` `static final` with a constant value is copied into its readers | Reading it does not initialize its class |
| A class initializes once, on first use: `new`, a static call, or a non-constant static field | `static` blocks run then, in source order; a throw there is `ExceptionInInitializerError` |
| `new` runs instance initializers and instance blocks in source order, then the constructor body | Initializer order is textual; reading a later static field is an `illegal forward reference` |
| Shared mutable `static` state acts as a global variable | Convenient as a tally or cache, but hard to reason about and unsafe under threads |

## 7. Gotcha checklist

<div style="border-left:4px solid #da5233;background:rgba(218,82,51,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

| Symptom | Likely cause | Fix |
|---|---|---|
| `non-static variable id cannot be referenced from a static context` | a `static` method (or `main`) used an instance field | make the method non-static, or pass it an object and read `w.id` |
| `non-static variable this cannot be referenced from a static context` | `this` inside a `static` method | same fix: a `static` method has no current object |
| `non-static method area() cannot be referenced from a static context` | `ClassName.method()` on an instance method | call it on an object |
| A counter or cache behaves "globally" across objects | it's a `static` field, shared by all instances | use an instance field for per-object state |
| `a.count` changed when you only touched `b` | `count` is `static`; the object prefix is misleading | write `Widget.count`; `-Xlint:static` flags the other form |
| `cannot assign a value to static final variable MAX` | code tried to change a constant | set it once; redesign if it must vary |
| A `static` block runs later than expected, or not at all | classes initialize on first use; a constant read does not count | don't rely on a `static` block's side effects happening early |
| `ExceptionInInitializerError`, `Caused by: …` | a `static` initializer or block threw | fix the `Caused by` line; later uses throw `NoClassDefFoundError` |
| `illegal forward reference` | an initializer reads a field declared below it | reorder the declarations |

</div>

---

## ✅ Check yourself

One check per objective. Answer before you open anything.

```quiz
{"prompt": "With the §1 Widget class (static int count = 0; the constructor does count++), what does new Widget(); new Widget(); System.out.println(Widget.count); print?", "options": ["1", "0", "2"], "answer": "2"}
```

```quiz
{"prompt": "Inside Circle (instance field double radius; static final double PI), which of these compiles: static double areaOf(double r) { return PI * r * r; } and static double area() { return PI * radius * radius; }?", "options": ["areaOf compiles; area does not", "Both compile", "Neither compiles"], "answer": "areaOf compiles; area does not"}
```

```quiz
{"prompt": "Config has static final int MAX = 100; and a static block that prints \"Config initialized\". main prints only Config.MAX. What appears?", "options": ["Config initialized, then 100", "100 only", "100, then Config initialized"], "answer": "100 only"}
```

<details>
<summary>A class has, in this order: a static block printing <code>S</code>, an instance block printing <code>I</code>, and a constructor printing <code>C</code>. <code>main</code> calls <code>new</code> on it twice. What prints? And would <code>static block ran</code> print if <code>main</code> never mentioned <code>Lookup</code>?</summary>

`S`, `I`, `C`, then `I`, `C`. The class initializes once, on the first `new`. Each object then runs its instance block, then its constructor body. The §5 proof shows the same order with field initializers added.

No. `Lookup` is initialized only when it is first used. A class that `main` never touches is never initialized, so its `static` block never runs.

</details>

---

## 📚 Sources

1. *The Java Language Specification, Java SE 21*, §8.3.1.1 "`static` Fields" ("exactly one incarnation of the field, no matter how many instances") — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.3.1.1>
2. *The Java Language Specification, Java SE 21*, §8.4.3.2 "`static` Methods" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.4.3.2>
3. *The Java Language Specification, Java SE 21*, §4.12.4 "`final` Variables" (constant variable) — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-4.html#jls-4.12.4>
4. *The Java Language Specification, Java SE 21*, §13.1 "The Form of a Binary" (a constant variable "must be resolved at compile time") — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-13.html#jls-13.1>
5. *The Java Language Specification, Java SE 21*, §8.7 "Static Initializers" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.7>
6. *The Java Language Specification, Java SE 21*, §12.4.1 "When Initialization Occurs" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-12.html#jls-12.4.1>
7. *The Java Language Specification, Java SE 21*, §12.4.2 "Detailed Initialization Procedure" (initializers "in textual order"; `ExceptionInInitializerError`) — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-12.html#jls-12.4.2>
8. *The Java Language Specification, Java SE 21*, §12.1.3 "Initialize `Test`: Execute Initializers" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-12.html#jls-12.1.3>
9. *The Java Virtual Machine Specification, Java SE 21*, §2.9.2 "Class Initialization Methods" — <https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-2.html#jvms-2.9.2>
10. *The Java Language Specification, Java SE 21*, §8.6 "Instance Initializers" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.6>
11. *The Java Language Specification, Java SE 21*, §12.5 "Creation of New Class Instances" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-12.html#jls-12.5>
12. *The Java Language Specification, Java SE 21*, §8.3.3 "Restrictions on Field References in Initializers" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.3.3>

---

<div style="border-left:4px solid #6d28d9;background:rgba(109,40,217,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

🧪 **Predict, then check.**

1. Predict the output of `new Widget(); new Widget(); System.out.println(Widget.count);` for the §1 class.
2. Decide whether a method `static double areaOf(double r)` (using only `r` and `PI`) would compile inside `Circle`, and whether `static double area()` (using the instance field `radius`) would.
3. Predict whether `static block ran` would print if `main` *never* mentioned `Lookup` at all, and explain why.

</div>

## Your Turn

Before you move on, check your understanding with the coach — explain the idea, apply it, weigh the trade-offs, then defend your reasoning.

<div class="concept-coach"></div>
