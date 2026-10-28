---
title: Nested & Anonymous Classes; Lambdas
summary: Classes can nest inside other classes: static nested, or inner, where every inner object gets a link to its enclosing instance when it's created. An anonymous class implements an interface inline. A lambda is a compact implementation of a functional interface (one abstract method), turning behavior into a value you can pass and store. Lambdas capture only effectively final locals, java.util.function supplies Predicate, Function, Supplier and Consumer, and method references, in four forms, shorten lambdas that just call a method. The bridge from objects to functional style, shown with verified output.
prereqs: []
---

# Nested & Anonymous Classes; Lambdas — Behavior as a Value

Until now, a method's *behavior* has been fixed right where you wrote it. This lesson turns behavior into something you can **pass around**. The path there runs through Java's ways of defining a class in a smaller scope:

- **Nested classes**: a class inside a class.
- **Anonymous classes**: an unnamed class that implements an interface right where it's used.
- **Lambdas**: a compact, anonymous implementation of a **functional interface** — an interface with exactly one abstract method.

A lambda turns "what to do" into a value: you can store it in a variable, hand it to a method, and call it later. **Method references** shorten the common case of a lambda that does nothing but call an existing method. Together, they're the bridge from object-oriented to functional Java, and the foundation for [streams](/synapse/programming-languages/java/advanced/functional-java-and-streams).

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **The core idea.**

- These tools turn **behavior into a value** you can pass, store, and call later.
- **Nested** and **anonymous** classes let you define a class in a smaller scope.
- A **lambda** is a compact implementation of a **functional interface** (one abstract method).
- **Method references** shorten a lambda that only calls a method — the bridge to functional Java.

</div>

This lesson builds on [methods](/synapse/programming-languages/java/control-flow/methods) and [interfaces](/synapse/programming-languages/java/robust-oop/abstract-classes-and-interfaces). Every output below was produced by compiling and running the code on Java 25.

**You'll be able to:** create objects of a `static` nested class and of an inner class, and predict which outer fields each one reads; write an anonymous class and the equivalent lambda for a one-method interface, and predict when a lambda is rejected; predict whether a lambda that uses a local variable compiles; choose `Predicate`, `Function`, `Supplier` or `Consumer` for a task; rewrite a one-call lambda as a method reference, and name the lambda that a method reference stands for.

<div style="border-left:4px solid #15448e;background:rgba(21,68,142,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

📘 **How to read the Intuition boxes.** Each one is built in three moves:

1. **The mechanism** — what the compiler and the JVM *do*.
2. **A concrete bite** — a specific, runnable failure (often a real compiler error), shown so the trap is visible.
3. **The earned rule** — the decision heuristic, now justified rather than asserted, plus its cost.

</div>

---

## Table of contents

1. [Nested classes](#1-nested-classes)
2. [Anonymous classes](#2-anonymous-classes)
3. [Lambdas](#3-lambdas)
4. [The built-in functional interfaces](#4-the-built-in-functional-interfaces)
5. [Method references](#5-method-references)
6. [Mental-model summary](#6-mental-model-summary)
7. [Gotcha checklist](#7-gotcha-checklist)
8. [Check yourself](#-check-yourself)
9. [Sources](#-sources)

---

## 1. Nested classes

You can declare a class inside another class. Java has four kinds of nested class <abbr title="The Java Language Specification, Java SE 25, §8.1.3">[1]</abbr>:

- A **`static` nested class** is scoped to its enclosing class, but has no link to any instance of it.
- A non-static **inner class** (a *member* class) holds a hidden link to an enclosing *instance*, so it can read that instance's fields.
- A **local class** is declared inside a block, such as a method body, just like a local variable <abbr title="The Java Language Specification, Java SE 25, §14.3">[2]</abbr>.
- An **anonymous class** has no name at all (§2).

```java run
class Outer {
    private int x = 10;

    static class StaticNested {
        int triple(int n) { return n * 3; }
    }

    class Inner {
        int addX(int n) { return n + x; }   // reads the outer instance's x
    }
}

public class Main {
    public static void main(String[] args) {
        Outer.StaticNested sn = new Outer.StaticNested();
        System.out.println(sn.triple(5));

        Outer outer = new Outer();
        Outer.Inner inner = outer.new Inner();
        System.out.println(inner.addX(5));
    }
}
```

**Output:**
```
15
15
```

**Analysis.**

- `StaticNested` needs no `Outer` instance: `new Outer.StaticNested()`.
- It can't see `x`, because `x` belongs to an `Outer` object, and `StaticNested` doesn't have one. Writing `n + x` inside it gives `non-static variable x cannot be referenced from a static context`.
- `Inner` is created *from* an `Outer` instance (`outer.new Inner()`), and reads that instance's `x`. So `addX(5)` is `5 + 10 = 15`.

The `static` keyword on a nested class means the same thing it means on a field or method: `static` means "no enclosing instance," and non-static means "tied to one."

**Intuition.**
*Mechanism.* Each inner object is tied to exactly one enclosing object, fixed at the moment the inner object is created <abbr title="The Java Language Specification, Java SE 25, §8.1.3">[1]</abbr>. That link is how it reaches `x`. So two inner objects made from two different outer objects read two different sets of fields:

```java run
class Counter {
    private int count;
    Counter(int start) { count = start; }

    class Step {
        int next() { return ++count; }
    }
}

public class Main {
    public static void main(String[] args) {
        Counter a = new Counter(0);
        Counter b = new Counter(100);
        Counter.Step sa = a.new Step();
        Counter.Step sb = b.new Step();
        Counter.Step sa2 = a.new Step();
        System.out.println(sa.next());
        System.out.println(sb.next());
        System.out.println(sa2.next());
    }
}
```

**Output:**
```
1
101
2
```

`sa` and `sa2` share `a`'s `count`, so the second step on `a` gives `2`. Meanwhile, `sb` works on `b`'s `count`, starting from `100`. A `static` nested class carries no such link. It's still a member of `Outer`, so it can use `Outer`'s `private` members. `private static` members need no `Outer` object at all; `private` instance members it can reach only through an `Outer` object it's been given.

*Concrete bite.* An inner object can't exist without its outer object. `new Outer.Inner()` in `main` names no enclosing instance, so javac refuses:

```java run
class Outer {
    private int x = 10;

    class Inner {
        int addX(int n) { return n + x; }
    }
}

public class Main {
    public static void main(String[] args) {
        Outer.Inner inner = new Outer.Inner();
        System.out.println(inner.addX(5));
    }
}
```

**Compiler error:**
```
Main.java:11: error: an enclosing instance that contains Outer.Inner is required
        Outer.Inner inner = new Outer.Inner();
                            ^
1 error
```

Write `outer.new Inner()` instead, or make the class `static` if it never needs `x`. Here's the practical rule: make a nested class `static` by default, unless it needs the enclosing instance. A non-static inner object holds a reference to its outer object, which keeps that outer object alive for as long as the inner one lives.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Nest a helper class inside the class it serves, to keep it scoped and private. Make it `static` unless it must access the enclosing instance's state.

- The cost of a non-static inner class: the hidden outer reference (in memory and in coupling).
- The payoff of nesting: locality. The helper lives exactly where it's used, instead of as a separate top-level class.

</div>

---

## 2. Anonymous classes

When you want to implement an [interface](/synapse/programming-languages/java/robust-oop/abstract-classes-and-interfaces) just once, right where you need it, you can write an **anonymous class**. The expression `new Interface() { ... }` defines an unnamed implementing class and instantiates it, all in one go.

```java run
interface Greeter { String greet(String name); }

public class Main {
    public static void main(String[] args) {
        Greeter g = new Greeter() {
            @Override
            public String greet(String name) { return "Hello, " + name; }
        };
        System.out.println(g.greet("Ada"));
    }
}
```

**Output:**
```
Hello, Ada
```

**Analysis.** `new Greeter() { ... }` created an object of an unnamed class that implements `Greeter`, supplying `greet` inline. We never declared a named `class`: the implementation exists only as this one object. Before lambdas, this was how Java passed behavior around — you wrapped it in an anonymous class that implemented an interface.

**Intuition.**
*Mechanism.* Behind the scenes, the compiler generates a real class with a made-up name, and instantiates it <abbr title="The Java Language Specification, Java SE 25, §15.9.5">[3]</abbr>. Compile the program above in a terminal, and list the class files:

```text
$ javac Main.java
$ ls *.class
Greeter.class
Main$1.class
Main.class
```

`Main$1` is the anonymous class. It can read the enclosing method's local variables, as long as they're effectively final (§3 defines the term). That makes it a self-contained bundle of behavior.

*Concrete bite.* The problem is the ceremony: four lines (`new Greeter() { @Override public String greet... }`) to express one line of logic. For an interface with a *single* method, almost all of that is noise — and that noise is exactly what a lambda removes.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Reach for an anonymous class when you need a one-off implementation that has *multiple* methods, or needs its own fields. Otherwise, prefer the lambda from the next section.

- The cost: verbosity, plus a separate generated class.
- The payoff: a complete inline implementation, for when a single-expression lambda isn't enough.

</div>

---

## 3. Lambdas

When an interface has exactly **one** abstract method — making it a **functional interface** <abbr title="The Java Language Specification, Java SE 25, §9.8">[4]</abbr> — a **lambda** can express the implementation as `parameters -> body`. It does the same job as the anonymous class from §2, with all the ceremony stripped away, and it makes behavior a value.

```java run
interface Greeter { String greet(String name); }

public class Main {
    public static void main(String[] args) {
        Greeter g = name -> "Hello, " + name;
        System.out.println(g.greet("Ada"));

        Runnable r = () -> System.out.println("running");
        r.run();
    }
}
```

**Output:**
```
Hello, Ada
running
```

**Analysis.** `name -> "Hello, " + name` is a `Greeter`: the same behavior as the anonymous class from §2, written as a single expression.

- The compiler infers that `name` is the parameter of `greet`, and that the expression is its return value.
- `Runnable` (a built-in functional interface with `void run()`) works the same way, using `()` for no parameters.
- The lambda *is* an object, which you stored in `g` and `r` and called later: behavior as a value.

A lambda's body can also be a block with a `return`, and its parameters can carry explicit types <abbr title="The Java Language Specification, Java SE 25, §15.27">[5]</abbr>:

```java run
interface IntOp { int apply(int a, int b); }

public class Main {
    public static void main(String[] args) {
        IntOp add = (a, b) -> a + b;
        IntOp max = (int a, int b) -> {
            if (a > b) {
                return a;
            }
            return b;
        };
        System.out.println(add.apply(3, 4));
        System.out.println(max.apply(3, 4));
    }
}
```

**Output:**
```
7
4
```

With two parameters, you need parentheses. An expression body returns its value automatically, while a block body needs an explicit `return`.

**Intuition.**
*Mechanism.* A lambda implements a functional interface. Because there's only one abstract method, the compiler knows exactly which method the lambda body defines, and it infers the parameter types and return type from that method's signature.

A lambda isn't an anonymous class, though. No `Main$2.class` shows up for one. Inside a lambda, `this` and every other name mean exactly what they mean in the surrounding code <abbr title="The Java Language Specification, Java SE 25, §15.27.2">[6]</abbr>. Inside an anonymous class, by contrast, `this` is the anonymous object.

*Concrete bite.* "Exactly one abstract method" is a hard requirement. A lambda can't target an interface with two:

```java run
interface TwoMethods { void a(); void b(); }

public class Main {
    public static void main(String[] args) {
        TwoMethods t = () -> System.out.println("?");
    }
}
```

**Compiler error:**
```
Main.java:5: error: incompatible types: TwoMethods is not a functional interface
        TwoMethods t = () -> System.out.println("?");
                       ^
    multiple non-overriding abstract methods found in interface TwoMethods
```

`TwoMethods` has two abstract methods, so a single lambda body can't say which one it implements. For more than one method, use an anonymous class. And mark your own one-method interfaces with `@FunctionalInterface`: that way, the mistake gets reported at the interface itself, before anyone writes a lambda <abbr title="The Java Language Specification, Java SE 25, §9.6.4.9">[7]</abbr>:

```java run
@FunctionalInterface
interface TwoMethods { void a(); void b(); }

public class Main {
    public static void main(String[] args) { }
}
```

**Compiler error:**
```
Main.java:1: error: Unexpected @FunctionalInterface annotation
@FunctionalInterface
^
  TwoMethods is not a functional interface
    multiple non-overriding abstract methods found in interface TwoMethods
1 error
```

*Non-example: changing a variable the lambda uses.* A lambda may use one of its method's local variables only if that variable is **effectively final** — meaning it's never assigned again after its initializer <abbr title="The Java Language Specification, Java SE 25, §15.27.2">[6]</abbr>. A single later assignment breaks the rule, even one that comes after the lambda:

```java run
interface Greeter { String greet(String name); }

public class Main {
    public static void main(String[] args) {
        String greeting = "Hello";
        Greeter g = name -> greeting + ", " + name;
        greeting = "Bye";
        System.out.println(g.greet("Ada"));
    }
}
```

**Compiler error:**
```
Main.java:6: error: local variables referenced from a lambda expression must be final or effectively final
        Greeter g = name -> greeting + ", " + name;
                            ^
1 error
```

The lambda might run much later, long after `greeting` has changed. The JLS explains the reasoning: capturing a changing local "would likely introduce concurrency problems" <abbr title="The Java Language Specification, Java SE 25, §15.27.2">[6]</abbr>. To fix it, delete the reassignment, or copy the value into a new variable that never changes.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Use a lambda to implement a functional interface compactly — for example, when passing behavior to `sort`, `forEach`, a callback, or a strategy.

- The cost: it works only for single-method interfaces, and it captures only effectively final locals.
- The payoff: logic becomes a value you can store and pass. That's the whole premise of the [Streams API](/synapse/programming-languages/java/advanced/functional-java-and-streams).

</div>

---

## 4. The built-in functional interfaces

In practice, you rarely need to write `Greeter` or `IntOp` yourself. The `java.util.function` package supplies functional interfaces for all the common shapes <abbr title="java.util.function, Java SE 25 API">[8]</abbr>, and four of them cover most uses:

| Interface | Its one method | Shape |
|---|---|---|
| `Predicate<T>` | `boolean test(T t)` | a yes/no question about a value |
| `Function<T, R>` | `R apply(T t)` | turns a `T` into an `R` |
| `Supplier<T>` | `T get()` | produces a value from nothing |
| `Consumer<T>` | `void accept(T t)` | does something with a value, returns nothing |

```java run
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.function.Supplier;
import java.util.function.Consumer;

public class Main {
    public static void main(String[] args) {
        Predicate<String> isLong = s -> s.length() > 4;
        Function<String, Integer> length = s -> s.length();
        Supplier<String> greeting = () -> "hi";
        Consumer<String> shout = s -> System.out.println(s.toUpperCase());

        System.out.println(isLong.test("Ada"));
        System.out.println(isLong.test("Grace"));
        System.out.println(length.apply("Linus"));
        System.out.println(greeting.get());
        shout.accept("done");
    }
}
```

**Output:**
```
false
true
5
hi
DONE
```

**Analysis.** Each lambda takes the shape of its interface's one method:

- `isLong` answers `true` or `false`.
- `length` maps a `String` to an `Integer`.
- `greeting` takes no argument at all.
- `shout` returns nothing; it just prints.

The package also has many variants of these four, such as `BiFunction<T, U, R>` for two arguments, and `IntPredicate` for an `int` without boxing.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Before you declare a functional interface, look for one in `java.util.function`. Ask yourself two questions: how many arguments go in, and does a value come out?

- The cost: the generic names (`apply`, `test`, `get`, `accept`) say less about your domain than `greet` does.
- The payoff: every library method that takes a `Predicate` or a `Function`, streams included, accepts your lambda directly.

</div>

---

## 5. Method references

When a lambda does nothing but call one existing method, you can write it even more briefly as a **method reference**: `Type::method`. It names the method directly, instead of wrapping it in `x -> x.method()`.

```java run viz=array:names
import java.util.List;
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>(List.of("Charlie", "alice", "Bob"));
        names.sort(String::compareToIgnoreCase);
        System.out.println(names);
        names.forEach(System.out::println);
    }
}
```

**Output:**
```
[alice, Bob, Charlie]
alice
Bob
Charlie
```

**Analysis.**

- `names.sort(String::compareToIgnoreCase)` sorted the list case-insensitively. Here, `String::compareToIgnoreCase` stands for the lambda `(a, b) -> a.compareToIgnoreCase(b)`, used as a `Comparator`.
- `names.forEach(System.out::println)` printed each name. `System.out::println` is the lambda `s -> System.out.println(s)`.

Both are just shorter spellings of lambdas that delegate to a single method.

**Intuition.**
*Mechanism.* A method reference refers to a method without calling it <abbr title="The Java Language Specification, Java SE 25, §15.13">[9]</abbr>. The compiler matches the referenced method's shape against the functional interface's method. There are four forms:

| Form | Example | The lambda it stands for |
|---|---|---|
| `Type::staticMethod` | `Integer::parseInt` | `s -> Integer.parseInt(s)` |
| `object::instanceMethod` | `prefix::concat` | `s -> prefix.concat(s)` |
| `Type::instanceMethod` | `String::length` | `s -> s.length()` — the first argument is the object |
| `Type::new` | `ArrayList::new` | `() -> new ArrayList<>()` |

```java run
import java.util.ArrayList;
import java.util.List;
import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.function.Supplier;

public class Main {
    public static void main(String[] args) {
        Function<String, Integer> parse = Integer::parseInt;
        String prefix = "Dr. ";
        Function<String, String> title = prefix::concat;
        Function<String, Integer> length = String::length;
        BiFunction<String, String, Boolean> same = String::equalsIgnoreCase;
        Supplier<List<String>> fresh = ArrayList::new;

        System.out.println(parse.apply("42") + 1);
        System.out.println(title.apply("Ada"));
        System.out.println(length.apply("Grace"));
        System.out.println(same.apply("java", "JAVA"));
        List<String> list = fresh.get();
        list.add("new");
        System.out.println(list);
    }
}
```

**Output:**
```
43
Dr. Ada
5
true
[new]
```

`String::equalsIgnoreCase` with two arguments shows the third form clearly: `same.apply("java", "JAVA")` runs `"java".equalsIgnoreCase("JAVA")`.

*Concrete bite.* Method references read as pure *intent*: `sort(String::compareToIgnoreCase)` says "sort by case-insensitive comparison," with no boilerplate parameters. But there's a boundary: a method reference works only when the lambda is *exactly* one call with matching arguments. Any extra logic (a transform, a condition) needs a full lambda.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Prefer a method reference when a lambda's whole body is one method call with matching arguments (`String::toUpperCase`, `System.out::println`, `Objects::nonNull`). Use a full lambda as soon as there's any additional logic.

- The cost: learning the four reference forms.
- The payoff: concise, readable code that names the operation directly — especially in the stream pipelines ahead.

</div>

---

## 6. Mental-model summary

| Principle | Consequence |
|---|---|
| A `static` nested class has no enclosing instance; an inner class does | Inner classes read the outer instance's fields (and hold a hidden reference to it) |
| Each inner object is tied to the outer object it was created from | `outer.new Inner()`; `new Outer.Inner()` from `main` does not compile |
| An anonymous class implements an interface inline, unnamed | A real generated class (`Main$1`); good for one-off multi-method implementations |
| A lambda implements a functional interface (one abstract method) | `params -> body` is behavior as a value you store, pass, and call |
| A lambda's target must have exactly one abstract method | Two methods → "not a functional interface"; `@FunctionalInterface` reports it at the interface |
| A lambda captures only effectively final locals | Reassign a captured variable anywhere, and the lambda does not compile |
| `java.util.function` supplies the common shapes | `Predicate` tests, `Function` maps, `Supplier` produces, `Consumer` accepts |
| A method reference replaces a lambda that only calls one method | Four forms: `Type::static`, `obj::method`, `Type::method`, `Type::new` |

## 7. Gotcha checklist

<div style="border-left:4px solid #da5233;background:rgba(218,82,51,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

| Symptom | Likely cause | Fix |
|---|---|---|
| `an enclosing instance that contains Outer.Inner is required` | an inner class created with no outer object | `outer.new Inner()`, or make the class `static` |
| `non-static variable x cannot be referenced from a static context`, inside a nested class | a `static` nested class reading an instance field | make it an inner class, or pass it an `Outer` object |
| A nested class holds its outer object alive unexpectedly | it's a non-static inner class | make it `static` if it doesn't need the enclosing instance |
| `incompatible types: X is not a functional interface` | the target interface has more than one abstract method | use an anonymous class, or reduce it to one method |
| `Unexpected @FunctionalInterface annotation` | the annotated interface has two abstract methods | remove one, or remove the annotation |
| `local variables referenced from a lambda expression must be final or effectively final` | the captured variable is reassigned somewhere | don't reassign it; copy it into a new variable |
| `this` inside a lambda is not the object you expected | a lambda's `this` is the enclosing object, unlike an anonymous class's | use an anonymous class if the code needs its own `this` |
| A method reference won't compile where a lambda would | the method's shape doesn't match the interface, or there's extra logic | write the full lambda |
| Reached for an anonymous class for a one-method interface | — | a lambda is shorter; reserve anonymous classes for multi-method or stateful cases |

</div>

---

## ✅ Check yourself

One check per objective. Answer before you open anything.

```quiz
{"prompt": "Counter a = new Counter(0); Counter b = new Counter(100); Step sa = a.new Step(), sb = b.new Step(), sa2 = a.new Step(); — next() returns ++count of its Counter. What do sa.next(), sb.next(), sa2.next() print, in order?", "options": ["1, 101, 1", "1, 101, 2", "1, 2, 3"], "answer": "1, 101, 2"}
```

```quiz
{"prompt": "interface TwoMethods { void a(); void b(); } — what happens with TwoMethods t = () -> System.out.println(\"?\");", "options": ["It implements a() only", "It implements both a() and b()", "It does not compile: TwoMethods is not a functional interface"], "answer": "It does not compile: TwoMethods is not a functional interface"}
```

```quiz
{"prompt": "String greeting = \"Hello\"; Greeter g = name -> greeting + \", \" + name; greeting = \"Bye\"; — what happens?", "options": ["It prints Hello, Ada", "It does not compile: greeting is not effectively final", "It prints Bye, Ada"], "answer": "It does not compile: greeting is not effectively final"}
```

```quiz
{"prompt": "You need a lambda that takes a String and answers whether it is empty. Which built-in interface fits?", "options": ["Supplier<String>", "Consumer<String>", "Predicate<String>"], "answer": "Predicate<String>"}
```

```quiz
{"prompt": "Which method reference stands for the lambda s -> s.length()?", "options": ["String::length", "s::length", "String.length()"], "answer": "String::length"}
```

<details>
<summary>The 🧪 box below: <code>IntOp</code>, the <code>Greeter</code> lambda, and the case-insensitive sort.</summary>

```java run
import java.util.ArrayList;
import java.util.List;

interface IntOp { int apply(int a, int b); }
interface Greeter { String greet(String name); }

public class Main {
    public static void main(String[] args) {
        IntOp add = (a, b) -> a + b;
        System.out.println(add.apply(3, 4));

        Greeter g = name -> "Hello, " + name;
        System.out.println(g.greet("Ada"));

        List<String> fruit = new ArrayList<>(List.of("banana", "Apple", "cherry"));
        fruit.sort(String::compareToIgnoreCase);
        fruit.forEach(System.out::println);
    }
}
```

**Output:**
```
7
Hello, Ada
Apple
banana
cherry
```

- `add.apply(3, 4)` is `7`.
- The `Greeter` lambda prints `Hello, Ada`, just like the §2 anonymous class.
- `String::compareToIgnoreCase` stands for `(a, b) -> a.compareToIgnoreCase(b)`, so `Apple` sorts first despite its capital letter. `System.out::println` stands for `s -> System.out.println(s)`.

</details>

---

## 📚 Sources

1. *The Java Language Specification, Java SE 25*, §8.1.3 "Inner Classes and Enclosing Instances" (member, local and anonymous inner classes; the immediately enclosing instance is fixed at creation) — <https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.1.3>
2. *The Java Language Specification, Java SE 25*, §14.3 "Local Class and Interface Declarations" — <https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.3>
3. *The Java Language Specification, Java SE 25*, §15.9.5 "Anonymous Class Declarations" — <https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.9.5>
4. *The Java Language Specification, Java SE 25*, §9.8 "Functional Interfaces" (one abstract method, "aside from the methods of Object") — <https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html#jls-9.8>
5. *The Java Language Specification, Java SE 25*, §15.27 "Lambda Expressions" — <https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.27>
6. *The Java Language Specification, Java SE 25*, §15.27.2 "Lambda Body" (captured locals "must either be final or effectively final"; `this` as in the surrounding context) — <https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.27.2>
7. *The Java Language Specification, Java SE 25*, §9.6.4.9 "`@FunctionalInterface`" — <https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html#jls-9.6.4.9>
8. `java.util.function`, Java SE 25 API ("Functional interfaces provide target types for lambda expressions and method references") — <https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/function/package-summary.html>
9. *The Java Language Specification, Java SE 25*, §15.13 "Method Reference Expressions" — <https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.13>

---

<div style="border-left:4px solid #6d28d9;background:rgba(109,40,217,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

🧪 **Predict, then check.**

1. Write a functional interface `IntOp { int apply(int a, int b); }`, and predict what `IntOp add = (a, b) -> a + b; System.out.println(add.apply(3, 4));` prints.
2. Rewrite the §2 anonymous `Greeter` as a lambda, and confirm that the output is identical.
3. Predict the output of sorting `["banana","Apple","cherry"]` with `String::compareToIgnoreCase`, then printing with `forEach(System.out::println)`. Explain which lambda each method reference stands for.

</div>

## Your Turn

Before you move on, check your understanding with the coach — explain the idea, apply it, weigh the trade-offs, then defend your reasoning.

<div class="concept-coach"></div>
