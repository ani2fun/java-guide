---
title: Modern Java Idioms & the Type System
summary: The modern features aren't separate tricks — they compose into one design. records (immutable data) + sealed (closed type sets) + pattern matching (consume by shape) give data-oriented programming with compiler-checked exhaustiveness, and a default branch throws that check away; Optional is a return type for "no result", never a null field; an unmodifiable view is not a copy; var with a diamond infers Object. A synthesis of Core Libraries, Robust OOP and Functional Java, shown with verified output.
prereqs: []
---

# Modern Java Idioms & the Type System, Holistically

You've met the modern features one at a time:

- [records](/synapse/programming-languages/java/core-libraries/enums-and-records) and [sealed types with pattern matching](/synapse/programming-languages/java/robust-oop/sealed-classes-and-pattern-matching);
- [`Optional` and streams](/synapse/programming-languages/java/advanced/functional-java-and-streams);
- [`var`](/synapse/programming-languages/java/first-steps/variables-and-primitive-types) and [immutable classes](/synapse/programming-languages/java/classes-and-objects/encapsulation-and-access-modifiers).

This lesson shows that they're not a grab-bag of tricks, but a **coherent design**:

- **`record` + `sealed` + pattern matching** give you *data-oriented programming*: model your data as a closed set of immutable shapes, and let the compiler force you to handle every one.
- **`Optional`** pushes `null` out of your domain, at the edges.
- **Immutability** makes objects safe to share, and **`var`** removes redundant noise.

The thesis is composition. Each feature is good on its own, but the real power lies in how they fit together into code that's concise, safe, and checked.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **The core idea.**

- The modern features aren't a grab-bag — they compose into **one coherent design**.
- **`record` + `sealed` + pattern matching** give data-oriented programming with compiler-checked exhaustiveness.
- **`Optional`** pushes `null` out at the edges; **immutability** makes objects safe to share; **`var`** cuts noise.
- The real power is **composition** — how the features fit together.

</div>

This lesson draws on the chapters [Core Libraries](/synapse/programming-languages/java/core-libraries/enums-and-records) and [Robust OOP](/synapse/programming-languages/java/robust-oop/sealed-classes-and-pattern-matching), and on [Functional Java & the Streams API](/synapse/programming-languages/java/advanced/functional-java-and-streams). Every output below was produced by compiling and running the code.

**You'll be able to:** predict whether a pattern `switch` over a sealed type still compiles after a new case is added, and explain why a `default` branch hides the new case; choose `Optional` as a return type, and predict what a `null` `Optional` field and a failing `map` do; choose between an unmodifiable view and a copy, and predict what `var` infers from a diamond; write a program that composes records, a sealed interface, a pattern `switch`, a stream and `Optional`.

<div style="border-left:4px solid #15448e;background:rgba(21,68,142,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

📘 **How to read the Intuition boxes.** Each one is built in three moves:

1. **The mechanism** — what the compiler and the JVM *do*.
2. **A concrete bite** — a specific, runnable failure (often a real compiler error), shown so the trap is visible.
3. **The earned rule** — the decision heuristic, now justified rather than asserted, plus its cost.

</div>

---

## Table of contents

1. [Data-oriented design: records + sealed + patterns](#1-data-oriented-design-records--sealed--patterns)
2. [`Optional` over `null`](#2-optional-over-null)
3. [Immutability and `var`](#3-immutability-and-var)
4. [Composing it all](#4-composing-it-all)
5. [Mental-model summary](#5-mental-model-summary)
6. [Gotcha checklist](#6-gotcha-checklist)
7. [Check yourself](#-check-yourself)
8. [Sources](#-sources)

---

## 1. Data-oriented design: records + sealed + patterns

These three features lock together:

- a **`sealed`** interface defines a closed set of cases;
- each case is an immutable **`record`**;
- a **pattern `switch`** consumes them, destructuring their components. Because the set is closed, the compiler checks it for exhaustiveness, with no `default` needed.

A plain class that implements a sealed interface must say `final`, `sealed` or `non-sealed`; otherwise, javac reports `sealed, non-sealed or final modifiers expected`. A record needs none of the three, because a record class is implicitly `final` <abbr title="The Java Language Specification, Java SE 21, §8.1.1.2">[2]</abbr>.

```java run viz=array:shapes
sealed interface Shape permits Circle, Rectangle, Triangle {}
record Circle(double radius) implements Shape {}
record Rectangle(double width, double height) implements Shape {}
record Triangle(double base, double height) implements Shape {}

public class Main {
    static double area(Shape s) {
        return switch (s) {
            case Circle(double r) -> Math.PI * r * r;
            case Rectangle(double w, double h) -> w * h;
            case Triangle(double b, double h) -> 0.5 * b * h;
        };
    }

    public static void main(String[] args) {
        Shape[] shapes = { new Circle(2), new Rectangle(3, 4), new Triangle(6, 8) };
        for (Shape s : shapes) {
            System.out.printf("%s -> %.2f%n", s.getClass().getSimpleName(), area(s));
        }
    }
}
```

**Output:**
```
Circle -> 12.57
Rectangle -> 12.00
Triangle -> 24.00
```

```d2
direction: down

record: "record\nimmutable data shape" { shape: rectangle }
sealed: "sealed\nclosed set of cases" { shape: rectangle }
pattern: "pattern switch\nconsume + destructure" { shape: rectangle }
exhaustive: "exhaustiveness\ncompiler-checked" { shape: rectangle }

dop: "data-oriented design" {
  shape: package
}

record -> dop: "the shapes"
sealed -> dop: "the closed set"
pattern -> dop: "the operations"
dop -> exhaustive: "guarantees"
```

**Analysis.**

- Each shape is a one-line `record`, with private `final` fields, accessors, and generated `equals`/`hashCode`/`toString` <abbr title="The Java Language Specification, Java SE 21, §8.10.3">[1]</abbr>.
- `sealed` declares the *complete* set.
- The pattern `switch` destructures each shape (`Circle(double r)`) to compute its area, with **no `default`** <abbr title="JEP 440: Record Patterns (JDK 21)">[5]</abbr> <abbr title="JEP 441: Pattern Matching for switch (JDK 21)">[6]</abbr>.

The data lives in the records, while the behavior lives in the `switch`, outside the data. And the type system guarantees that every case is handled. That's data-oriented programming: a closed algebra of data, with operations added from outside.

**Intuition.**
*Mechanism.* `sealed` gives the compiler the full list of subtypes. A `switch` whose cases cover every permitted subtype is **exhaustive** <abbr title="The Java Language Specification, Java SE 21, §14.11.1.1">[3]</abbr>, and a `switch` *expression* that isn't exhaustive is a compile-time error <abbr title="The Java Language Specification, Java SE 21, §15.28.1">[4]</abbr>.

*Concrete bite.* The payoff is that the compiler becomes your checklist. Add a fourth permitted shape, `Pentagon`, and leave `area` alone:

```java run
sealed interface Shape permits Circle, Rectangle, Triangle, Pentagon {}
record Circle(double radius) implements Shape {}
record Rectangle(double width, double height) implements Shape {}
record Triangle(double base, double height) implements Shape {}
record Pentagon(double side) implements Shape {}

public class Main {
    static double area(Shape s) {
        return switch (s) {
            case Circle(double r) -> Math.PI * r * r;
            case Rectangle(double w, double h) -> w * h;
            case Triangle(double b, double h) -> 0.5 * b * h;
        };
    }

    public static void main(String[] args) {
        System.out.println(area(new Pentagon(1)));
    }
}
```

**Compiler error:**
```
Main.java:9: error: the switch expression does not cover all possible input values
        return switch (s) {
               ^
1 error
```

Every such `switch` in the program stops compiling until it handles `Pentagon`. You first met this error in [Sealed Classes & Pattern Matching](/synapse/programming-languages/java/robust-oop/sealed-classes-and-pattern-matching).

*Non-example: a `default` over a sealed type.* A `default` makes any `switch` exhaustive <abbr title="The Java Language Specification, Java SE 21, §14.11.1.1">[3]</abbr> — which also silences the check above:

```java run
// ⚠️ ANTI-PATTERN — a default branch over a sealed type.  Do not copy it.
sealed interface Shape permits Circle, Rectangle, Triangle, Pentagon {}
record Circle(double radius) implements Shape {}
record Rectangle(double width, double height) implements Shape {}
record Triangle(double base, double height) implements Shape {}
record Pentagon(double side) implements Shape {}

public class Main {
    static double area(Shape s) {
        return switch (s) {
            case Circle(double r) -> Math.PI * r * r;
            case Rectangle(double w, double h) -> w * h;
            case Triangle(double b, double h) -> 0.5 * b * h;
            default -> 0.0;
        };
    }

    public static void main(String[] args) {
        Shape[] shapes = { new Circle(2), new Pentagon(3) };
        for (Shape s : shapes) {
            System.out.printf("%s -> %.2f%n", s.getClass().getSimpleName(), area(s));
        }
        System.out.println("Pentagon compiled, and its area is silently wrong");
    }
}
```

**Output:**
```
Circle -> 12.57
Pentagon -> 0.00
Pentagon compiled, and its area is silently wrong
```

The `default` caught `Pentagon`, so a pentagon with side 3 got an area of `0.00`. The compile error would have pointed you straight at this `switch`; instead, the `default` turned it into a wrong number at run time.

Compare this with the [inheritance](/synapse/programming-languages/java/robust-oop/inheritance-and-polymorphism) alternative, an `abstract double area()` in each subclass:

- use polymorphism when behavior travels *with* open subtypes;
- use sealed types + patterns when the type set is *closed*, and operations get added from outside.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Reach for `record` + `sealed` + pattern `switch` to model closed sets of structured data — results, events, AST nodes, protocol messages — and process them exhaustively. Leave out the `default`, so that a new case is a compile error rather than a silent wrong answer.

- The cost: choosing this style over class polymorphism, and maintaining the `permits` list (which the compiler enforces).
- The payoff: concise, immutable data, plus operations that the compiler proves complete. A whole class of "forgot a case" bugs disappears.

</div>

---

## 2. `Optional` over `null`

Its own inventor, Tony Hoare, called `null` his "billion dollar mistake" <abbr title="Tony Hoare, Null References: The Billion Dollar Mistake, QCon 2009">[12]</abbr>. It's invisible in the type, and fatal when dereferenced ([References, Equality & the Object Model](/synapse/programming-languages/java/classes-and-objects/references-equality-and-the-object-model)). The idiom is to keep `null` out of your domain entirely:

- wrap a maybe-absent value in `Optional` at the boundary;
- chain `map`/`filter`/`orElse` to handle absence declaratively.

```java run viz=hashmap:config
import java.util.Optional;
import java.util.Map;

public class Main {
    static Optional<String> lookup(Map<String, String> m, String key) {
        return Optional.ofNullable(m.get(key));
    }

    public static void main(String[] args) {
        Map<String, String> config = Map.of("host", "localhost", "port", "8080");
        String host = lookup(config, "host").map(String::toUpperCase).orElse("UNKNOWN");
        String region = lookup(config, "region").orElse("us-east");
        int port = lookup(config, "port").map(Integer::parseInt).orElse(80);
        System.out.println(host);
        System.out.println(region);
        System.out.println(port);
    }
}
```

**Output:**
```
LOCALHOST
us-east
8080
```

**Analysis.** `lookup` wraps the possibly-`null` result of `map.get` in `Optional.ofNullable`. Absence becomes a typed `Optional.empty()`, never a raw `null` escaping into the program. The callers can then *compose*:

- `host` was present, so `map(String::toUpperCase)` ran, and `orElse` was skipped;
- `region` was absent, so `map` was skipped, and `orElse("us-east")` supplied the default;
- `port` was present, and got parsed.

There's no `if (x != null)`, and no `NullPointerException`: the chain handles absence for you.

**Intuition.**
*Mechanism.* `Optional` makes "might be absent" part of the *type*. An `Optional<String>` isn't a `String`, so the compiler makes you unwrap it before use. `map` transforms the value only if one is present, and `orElse`/`orElseGet` supply defaults. The unsafe unwrap — `get()` on an empty `Optional` — throws `NoSuchElementException` (as [Functional Java & the Streams API](/synapse/programming-languages/java/advanced/functional-java-and-streams) shows).

*Concrete bite.* `Optional` is meant as a return type. Its API says it's "primarily intended for use as a method return type where there is a clear need to represent 'no result'" <abbr title="Java SE 21 API, java.util.Optional">[7]</abbr>. The same note adds that a variable of type `Optional` "should never itself be `null`".

*Non-example: an `Optional` field left `null`.* A field of type `Optional` starts out as `null`, just like any other reference field:

```java run
// ⚠️ ANTI-PATTERN — an Optional field left null.  Do not copy it.
import java.util.Optional;

class User {
    Optional<String> nickname;   // never assigned, so it holds null

    String display() {
        return nickname.orElse("none");
    }
}

public class Main {
    public static void main(String[] args) {
        System.out.println("display:");
        System.out.println(new User().display());
    }
}
```

**Output** *(prints `display:`, then a thrown exception):*
```
display:
Exception in thread "main" java.lang.NullPointerException: Cannot invoke "java.util.Optional.orElse(Object)" because "this.nickname" is null
```

The code *looks* null-safe, yet it crashed with the very exception that `Optional` exists to prevent — the worst of both worlds. For a field, use a plain nullable reference or a real default, and return `Optional` from the getter instead.

*Edge: `Optional` handles absence, not failure.* `orElse` covers only the empty case. If the function inside `map` throws, the exception passes straight through:

```java run
import java.util.Map;
import java.util.Optional;

public class Main {
    public static void main(String[] args) {
        Map<String, String> config = Map.of("port", "abc");
        System.out.println("parsing...");
        int port = Optional.ofNullable(config.get("port")).map(Integer::parseInt).orElse(80);
        System.out.println(port);
    }
}
```

**Output** *(prints `parsing...`, then a thrown exception):*
```
parsing...
Exception in thread "main" java.lang.NumberFormatException: For input string: "abc"
```

`"abc"` was present, so `map` called `Integer.parseInt("abc")`, which threw — and `orElse(80)` never ran. Validate the text first, or catch the exception inside the mapping function.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Return `Optional<T>` from methods that may find nothing. Build it with `ofNullable` at the boundaries, and consume it with `map`/`filter`/`orElse`. Keep `null` out of your domain logic.

- The cost: wrapping and unwrapping, plus discipline about where `Optional` belongs (in return types, not fields).
- The payoff: "absent" becomes a typed, composable case, instead of a run-time crash.

</div>

---

## 3. Immutability and `var`

Modern Java leans heavily on **immutable** objects: `record`s and `final` fields. An object that can't change is safe to share, to cache, and to use as a key. It needs no defensive copies, and gives you no aliasing surprises. Meanwhile, **`var`** removes redundant type noise wherever the right-hand side already states the type.

```java run
import java.util.List;

public class Main {
    record Point(int x, int y) {
        Point translate(int dx, int dy) { return new Point(x + dx, y + dy); }
    }

    public static void main(String[] args) {
        var origin = new Point(0, 0);
        var moved = origin.translate(3, 4);
        System.out.println(origin);
        System.out.println(moved);
        var names = List.of("Ada", "Linus");
        System.out.println(names.size());
    }
}
```

**Output:**
```
Point[x=0, y=0]
Point[x=3, y=4]
2
```

**Analysis.**

- `Point` is immutable, so `translate` doesn't mutate anything. Instead, it returns a *new* `Point`: `origin` is untouched (`Point[x=0, y=0]`), and `moved` holds the new value (`Point[x=3, y=4]`).
- This "transform by producing a new value" approach is the immutable idiom, just like a `String` operation.
- `var` inferred the types — `Point`, `Point`, `List<String>` — from the initializers. The [static type](/synapse/programming-languages/java/first-steps/variables-and-primitive-types) is still there; you just didn't write it.

`var` changes nothing about scope. A `var` local lives in its block like any other local ([Methods](/synapse/programming-languages/java/control-flow/methods), §3), and it shadows a field by the same rules ([Classes & Objects](/synapse/programming-languages/java/classes-and-objects/classes-and-objects)).

**Intuition.**
*Mechanism.* An immutable object's state is fixed at construction, and "changes" allocate a new object. Since nothing can change it behind your back, aliases are harmless. A record's fields are `private final` <abbr title="The Java Language Specification, Java SE 21, §8.10.3">[1]</abbr>, and `final` fields are what make an object safe to hand between threads <abbr title="The Java Language Specification, Java SE 21, §17.5">[13]</abbr> ([The Java Memory Model & Performance](/synapse/programming-languages/java/advanced/the-java-memory-model-and-performance)). `var` is compile-time inference: the variable has a concrete type, which you simply didn't spell out <abbr title="JEP 286: Local-Variable Type Inference (JDK 10)">[11]</abbr>.

*Concrete bite: `final` is shallow.* A record's `final` field fixes the *reference*, not the object it points to. So a record holding a caller's `ArrayList` changes whenever the caller changes the list. [Enums & Records](/synapse/programming-languages/java/core-libraries/enums-and-records) shows this, along with the fix: `List.copyOf` in a compact constructor.

*Non-example: an unmodifiable view is not a copy.* `Collections.unmodifiableList` looks like the same fix, but it returns a **view**, and reads "read through" to the original list <abbr title="Java SE 21 API, java.util.Collections.unmodifiableList">[8]</abbr>. `List.copyOf`, by contrast, returns an unmodifiable list that "will not reflect" later changes <abbr title="Java SE 21 API, java.util.List.copyOf">[9]</abbr>:

```java run
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> source = new ArrayList<>(List.of("Ada"));
        List<String> view = Collections.unmodifiableList(source);
        List<String> copy = List.copyOf(source);
        source.add("Linus");
        System.out.println("view: " + view);
        System.out.println("copy: " + copy);
        try {
            view.add("Grace");
        } catch (UnsupportedOperationException e) {
            System.out.println("view.add: " + e.getClass().getSimpleName());
        }
    }
}
```

**Output:**
```
view: [Ada, Linus]
copy: [Ada]
view.add: UnsupportedOperationException
```

Nobody can change the list *through* `view` — `add` threw. But `source` still could, and `view` showed `Linus`. The copy, meanwhile, kept `[Ada]`.

*Non-example: `var` with a diamond.* `var` copies its type from the initializer, and `new ArrayList<>()` with nothing to infer from gives `ArrayList<Object>`. OpenJDK's style guide calls this "DANGEROUS" <abbr title="OpenJDK, Local Variable Type Inference: Style Guidelines, G6">[10]</abbr>:

```java run
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        var names = new ArrayList<>();
        names.add("Ada");
        String first = names.get(0);
        System.out.println(first);
    }
}
```

**Compiler error:**
```
Main.java:7: error: incompatible types: Object cannot be converted to String
        String first = names.get(0);
                                ^
1 error
```

`names` is an `ArrayList<Object>`, so `get(0)` returns an `Object`. The fix is to write the type argument: `var names = new ArrayList<String>();`.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Default to immutability for data you share or use as keys: `record`s, `final` fields, transform-by-new, and `List.copyOf` for any list you keep. Use `var` where the initializer makes the type obvious — and never with a bare diamond.

- The cost: extra allocations and verbose deep updates (for immutability), and hidden types if you overuse `var`.
- The payoff: data that's safe to share without defensive copies, and code with less ceremony.

</div>

---

## 4. Composing it all

The features earn their keep *together*. Here, a small payments domain uses:

- `sealed` + `record`s for the data;
- a pattern `switch` for behavior;
- a [stream](/synapse/programming-languages/java/advanced/functional-java-and-streams) to aggregate;
- `Optional` for a query that might find nothing.

```java run viz=array:payments
import java.util.List;
import java.util.Optional;

public class Main {
    sealed interface Payment permits Cash, Card {}
    record Cash(double amount) implements Payment {}
    record Card(double amount, String last4) implements Payment {}

    static double fee(Payment p) {
        return switch (p) {
            case Cash c -> 0.0;
            case Card c -> c.amount() * 0.03;
        };
    }
    static double amountOf(Payment p) {
        return switch (p) {
            case Cash c -> c.amount();
            case Card c -> c.amount();
        };
    }

    public static void main(String[] args) {
        List<Payment> payments = List.of(
            new Cash(100), new Card(200, "1234"), new Card(50, "9999"));
        double totalFees = payments.stream().mapToDouble(Main::fee).sum();
        Optional<Payment> biggest = payments.stream()
            .max((a, b) -> Double.compare(amountOf(a), amountOf(b)));
        System.out.printf("total fees: %.2f%n", totalFees);
        System.out.println("biggest: " + biggest.map(p -> p.getClass().getSimpleName()).orElse("none"));
    }
}
```

**Output:**
```
total fees: 7.50
biggest: Card
```

**Analysis.** That's five features in one short program:

- `sealed Payment`, a closed set of `record`s (immutable data);
- a pattern `switch` that computes each payment's `fee`: cash is free, and card is 3%, so `6.00 + 1.50 = 7.50`;
- `stream().mapToDouble(...).sum()`, which aggregates the fees;
- `stream().max(...)`, which returns an `Optional<Payment>`, consumed with `map(...).orElse("none")`.

The compiler checks that both switches are exhaustive, and `null` is nowhere in sight. `amountOf` exists only because `Payment` declares no methods; the ✅ section shows how a record's accessor can replace it.

**Intuition.**
*Mechanism.* The composition works because the features share a common philosophy:

- make data explicit and immutable (records);
- make the set of cases closed and checkable (sealed);
- make operations declarative (patterns, streams);
- make absence a type (`Optional`).

*Concrete bite.* This is data-oriented Java: declarative, like the [stream pipelines](/synapse/programming-languages/java/advanced/functional-java-and-streams) from earlier in this chapter, with the compiler enforcing exhaustiveness and types throughout. The trade-off is knowing when to use it. This style shines for data processing, and for modeling closed domains. Classic OOP, with encapsulated mutable objects and polymorphic behavior, is still the better fit for stateful, open-ended designs.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Compose the modern features when you model and transform data: sealed records for data, pattern switches and streams for operations, and `Optional` for absence. Reach for classic object-oriented design (mutable state, inheritance) when behavior and identity dominate.

- The cost: the judgment to know which paradigm fits.
- The payoff: for the large class of data-shaped problems, modern Java is concise, immutable, and compiler-verified from end to end.

</div>

---

## 5. Mental-model summary

| Principle | Consequence |
|---|---|
| `record` + `sealed` + pattern `switch` = data-oriented design | Immutable data, a closed case set, and compiler-checked exhaustive operations |
| Exhaustiveness over a sealed type is compiler-enforced | Add a case and every non-exhaustive `switch` stops compiling — a built-in checklist |
| A `default` makes any `switch` exhaustive | Over a sealed type it swallows a new case at run time; leave it out |
| `Optional` makes absence a type; keep `null` out of the domain | `ofNullable` at boundaries; `map`/`orElse` to handle absence; a return type, not a field |
| `orElse` covers absence, not failure | An exception inside `map` passes straight through |
| Immutability makes objects safe to share; `final` is shallow | Transform-by-new; `List.copyOf` for kept lists; an unmodifiable view still shows the source's changes |
| `var` copies the initializer's type | `var` where the type is obvious; `new ArrayList<>()` gives `ArrayList<Object>` |
| The features compose by shared philosophy | Data-oriented Java is concise and checked; classic OOP fits stateful, open designs |

## 6. Gotcha checklist

<div style="border-left:4px solid #da5233;background:rgba(218,82,51,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

| Symptom | Likely cause | Fix |
|---|---|---|
| `the switch expression does not cover all possible input values` | a new permitted subtype has no `case` | add the `case`; don't add a `default` |
| A new subtype compiles, but its result is wrong (`0.00`) | a `default` branch over a sealed type caught it | remove the `default`, so the compiler lists the missing case |
| A pattern `switch` needs a `default` you don't want | the selector's type is open | model the cases as a `sealed` type |
| `NullPointerException: Cannot invoke "java.util.Optional.orElse(Object)"` | an `Optional` field or variable holds `null` | never store `null` in an `Optional`; use `Optional` as a return type |
| `NoSuchElementException: No value present` | `get()` on an empty `Optional` | `orElse`, `orElseGet` or `orElseThrow` |
| `NumberFormatException` despite `orElse(...)` | the function inside `map` threw; `orElse` covers only empty | validate, or catch inside the mapping function |
| An "unmodifiable" list changed | `Collections.unmodifiableList` is a view of a list someone else changed | keep `List.copyOf(...)` instead |
| `UnsupportedOperationException` on `add` | the list is unmodifiable (`List.of`, `List.copyOf`, a view) | copy it: `new ArrayList<>(list)` |
| `incompatible types: Object cannot be converted to String` after `var x = new ArrayList<>()` | `var` with a bare diamond infers `ArrayList<Object>` | write the type argument: `new ArrayList<String>()` |
| A "modified" record didn't change | records are immutable; `translate`-style methods return a *new* record | capture the result |
| A record's list changed after construction | `final` fixes the reference, not the list | `List.copyOf` in a compact constructor |

</div>

---

## ✅ Check yourself

One check per objective. Answer before you open anything.

```quiz
{"prompt": "Shape is sealed and permits Circle and Square. area(Shape) is a switch expression with one case for each, and no default. You add a third permitted record, Hexagon, and change nothing else. What happens?", "options": ["It compiles, and area(new Hexagon(..)) throws at run time", "javac rejects area: the switch expression does not cover all possible input values", "It compiles, and area(new Hexagon(..)) returns 0.0"], "answer": "javac rejects area: the switch expression does not cover all possible input values"}
```

```quiz
{"prompt": "The same area switch has a branch default -> 0.0. You add Hexagon to the permits list. What happens?", "options": ["javac rejects area until Hexagon has a case", "It compiles, and area(new Hexagon(..)) returns 0.0", "It compiles, and area(new Hexagon(..)) throws MatchException"], "answer": "It compiles, and area(new Hexagon(..)) returns 0.0"}
```

```quiz
{"prompt": "A class declares the field Optional<String> email; and never assigns it. What does email.orElse(\"none\") do?", "options": ["Returns \"none\"", "Returns null", "Throws NullPointerException"], "answer": "Throws NullPointerException"}
```

```quiz
{"prompt": "source is an ArrayList holding [Ada]. view = Collections.unmodifiableList(source); copy = List.copyOf(source); then source.add(\"Linus\"). What do view and copy print?", "options": ["view [Ada], copy [Ada]", "view [Ada, Linus], copy [Ada]", "view [Ada, Linus], copy [Ada, Linus]"], "answer": "view [Ada, Linus], copy [Ada]"}
```

```quiz
{"prompt": "var names = new ArrayList<>(); names.add(\"Ada\"); String first = names.get(0); — what happens?", "options": ["first is \"Ada\"", "javac rejects it: Object cannot be converted to String", "ClassCastException at run time"], "answer": "javac rejects it: Object cannot be converted to String"}
```

<details>
<summary>In §4, how many payments are cards? Count them with a stream and <code>instanceof</code>. Then make <code>amountOf</code> unnecessary.</summary>

Two. Now declare `double amount();` in `Payment`. Each record already has a public accessor `amount()` with that exact name and return type <abbr title="The Java Language Specification, Java SE 21, §8.10.3">[1]</abbr>, so it implements the interface method with no extra code. `Payment::amount` can then replace `amountOf`:

```java run
import java.util.List;

public class Main {
    sealed interface Payment permits Cash, Card {
        double amount();
    }
    record Cash(double amount) implements Payment {}
    record Card(double amount, String last4) implements Payment {}

    public static void main(String[] args) {
        List<Payment> payments = List.of(
            new Cash(100), new Card(200, "1234"), new Card(50, "9999"));
        long cards = payments.stream().filter(p -> p instanceof Card).count();
        double total = payments.stream().mapToDouble(Payment::amount).sum();
        System.out.println("cards: " + cards);
        System.out.println("total: " + total);
    }
}
```

**Output:**
```
cards: 2
total: 350.0
```

</details>

---

## 📚 Sources

1. *The Java Language Specification, Java SE 21*, §8.10.3 "Record Members" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.10.3>
2. *The Java Language Specification, Java SE 21*, §8.1.1.2 "`sealed`, `non-sealed`, and `final` Classes" ("a record class is implicitly `final`") — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.1.1.2>
3. *The Java Language Specification, Java SE 21*, §14.11.1.1 "Exhaustive Switch Blocks" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-14.html#jls-14.11.1.1>
4. *The Java Language Specification, Java SE 21*, §15.28.1 "The Switch Block of a `switch` Expression" ("It is a compile-time error if a `switch` expression is not exhaustive") — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.28.1>
5. JEP 440: Record Patterns (JDK 21) — <https://openjdk.org/jeps/440>
6. JEP 441: Pattern Matching for `switch` (JDK 21) — <https://openjdk.org/jeps/441>
7. `java.util.Optional`, Java SE 21 API (class API note) — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Optional.html>
8. `java.util.Collections.unmodifiableList`, Java SE 21 API ("unmodifiable view"; queries "read through") — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Collections.html#unmodifiableList(java.util.List)>
9. `java.util.List.copyOf`, Java SE 21 API ("will not reflect such modifications") — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/List.html#copyOf(java.util.Collection)>
10. OpenJDK, *Local Variable Type Inference: Style Guidelines*, G6 "Take care when using var with diamond or generic methods" — <https://openjdk.org/projects/amber/guides/lvti-style-guide>
11. JEP 286: Local-Variable Type Inference (JDK 10) — <https://openjdk.org/jeps/286>
12. Tony Hoare, "Null References: The Billion Dollar Mistake", QCon 2009 (InfoQ) — <https://www.infoq.com/presentations/Null-References-The-Billion-Dollar-Mistake-Tony-Hoare/>
13. *The Java Language Specification, Java SE 21*, §17.5 "`final` Field Semantics" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-17.html#jls-17.5>

---

<div style="border-left:4px solid #6d28d9;background:rgba(109,40,217,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

🧪 **Predict, then check.**

1. Add a `Pentagon(double side)` to the §1 `Shape` hierarchy, and predict what the compiler says about `area` until you add its case.
2. Predict what §2 prints if `config` held `"port" -> "abc"` and you parsed it with `.map(Integer::parseInt)`. Would `orElse(80)` save you?
3. Extend §4 to print the *count* of `Card` payments, using a stream `filter` with `p instanceof Card`, and predict the result.

§1's bite, §2's edge and the ✅ `<details>` answer each one in turn.

</div>

## Your Turn

Before you move on, check your understanding with the coach — explain the idea, apply it, weigh the trade-offs, then defend your reasoning.

<div class="concept-coach"></div>
