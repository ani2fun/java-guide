---
title: Abstract Classes & Interfaces
summary: An abstract class is a partial type. It can hold fields, constructors and concrete methods next to abstract methods with no body, and you can't instantiate it, so subclasses must fill in the blanks. An interface is a contract that a class implements. Default methods give it concrete behavior, private methods share code between them, and static methods belong to the interface alone. A class extends one class but implements many interfaces, so interfaces give multiple inheritance of type. A clash between two defaults is a compile error you resolve with X.super.m(). Every rule is shown with verified output.
prereqs: []
---

# Abstract Classes & Interfaces — Contracts and Partial Types

With [inheritance](/synapse/programming-languages/java/robust-oop/inheritance-and-polymorphism), a subclass specializes a concrete superclass. Java has two more tools that let you specify behavior a type *must* provide, without saying how:

- An **abstract class** is a partial implementation. It can declare **abstract methods** (signatures with no body), and it can't be instantiated itself. That forces every concrete subclass to supply the missing pieces.
- An **interface** is a **contract**: a set of methods that any class can `implement`, with no instance fields.

Here's the crucial asymmetry: a class `extends` exactly **one** class, but it `implements` as **many** interfaces as it likes. So interfaces give Java multiple inheritance of *type* (a class can be many things), without multiple inheritance of *state*. This is the machinery behind "[program to the interface](/synapse/programming-languages/java/core-libraries/the-collections-framework)."

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **The core idea.**

- An **abstract class** is a partial type with body-less methods — it can't be instantiated.
- An **interface** is a contract a class `implements`, with no instance fields.
- A class `extends` **one** class but `implements` **many** interfaces.
- So interfaces give multiple inheritance of *type*, never of *state*.

</div>

Every output below was produced by compiling and running the code on Java 25.

**You'll be able to:** write an abstract class with a field, a constructor and a concrete method, and predict the error you get when it's instantiated or when a subclass skips an abstract method; write an interface whose `default` methods share a `private` helper, and call its `static` method through the interface's name; predict from its access level whether an implementing method compiles; resolve a clash between two inherited `default` methods with `X.super.m()`; choose between an abstract class and an interface for a design.

<div style="border-left:4px solid #15448e;background:rgba(21,68,142,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

📘 **How to read the "The idea" boxes.** Each one is built in three moves:

1. **The mechanics** — what the compiler and the JVM *do*.
2. **A concrete bite** — a specific, runnable failure (often a real compiler error), shown so the trap is visible.
3. **The earned rule** — the decision heuristic, now justified rather than asserted, plus its cost.

</div>

---

## Table of contents

1. [Abstract classes](#1-abstract-classes)
2. [Interfaces](#2-interfaces)
3. [`default` methods](#3-default-methods)
4. [`static` and `private` interface methods](#4-static-and-private-interface-methods)
5. [One class, many interfaces](#5-one-class-many-interfaces)
6. [Mental-model summary](#6-mental-model-summary)
7. [Gotcha checklist](#7-gotcha-checklist)
8. [Check yourself](#-check-yourself)
9. [Sources](#-sources)

---

## 1. Abstract classes

An `abstract` class can declare `abstract` methods — signatures with no body <a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.3.1" target="_blank" rel="noopener noreferrer"><abbr title="The Java Language Specification, Java SE 25, §8.4.3.1">[2]</abbr></a>. Each one says, "every subclass must provide this." Because it has unfinished methods, an abstract class can't be instantiated; only its concrete subclasses can.

```java run viz=array:shapes
abstract class Shape {
    abstract double area();
}

class Circle extends Shape {
    double radius;
    Circle(double radius) { this.radius = radius; }
    @Override double area() { return Math.PI * radius * radius; }
}

class Square extends Shape {
    double side;
    Square(double side) { this.side = side; }
    @Override double area() { return side * side; }
}

public class Main {
    public static void main(String[] args) {
        Shape[] shapes = { new Circle(2.0), new Square(3.0) };
        for (Shape s : shapes) {
            System.out.printf("%.2f%n", s.area());
        }
    }
}
```

**Output:**
```
12.57
9.00
```

**Analysis.** `Shape` declares `area()` with no body: it knows that every shape *has* an area, but not how to compute it. `Circle` and `Square` each supply their own version, and the polymorphic loop calls the right one (`12.57`, `9.00`). `Shape` provides the common type and contract, while the subclasses provide the specifics.

Don't forget that an abstract class is still a class. Alongside its abstract methods, it can hold fields, constructors and ordinary methods. Its constructor runs whenever a subclass object is created <a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.1.1.1" target="_blank" rel="noopener noreferrer"><abbr title="The Java Language Specification, Java SE 25, §8.1.1.1">[1]</abbr></a>. Below, the concrete `describe()` calls the abstract `area()`, which dispatches to the subclass:

```java run
import static java.lang.IO.println;

abstract class Shape {
    private final String name;
    Shape(String name) { this.name = name; }
    abstract double area();
    String describe() { return String.format("%s with area %.2f", name, area()); }
}

class Circle extends Shape {
    double radius;
    Circle(double radius) { super("circle"); this.radius = radius; }
    @Override double area() { return Math.PI * radius * radius; }
}

class Square extends Shape {
    double side;
    Square(double side) { super("square"); this.side = side; }
    @Override double area() { return side * side; }
}

public class Main {
    public static void main(String[] args) {
        println(new Circle(2.0).describe());
        println(new Square(3.0).describe());
    }
}
```

**Output:**
```
circle with area 12.57
square with area 9.00
```

`Shape` owns the shared state (`name`) and the shared sentence (`describe()`). Each subclass writes only the part that differs: `area()`.

**The idea.**
*The mechanics.* An abstract method has no implementation. So an object of the abstract class would have a "hole" in it: a method with nothing to run. That's why the compiler forbids creating one <a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.1.1.1" target="_blank" rel="noopener noreferrer"><abbr title="The Java Language Specification, Java SE 25, §8.1.1.1">[1]</abbr></a>. It also requires every concrete subclass to override all of the abstract methods it inherits.

*Concrete bite.* Try to instantiate the abstract class directly, and it won't compile:

```java run
abstract class Shape { abstract double area(); }

public class Main {
    public static void main(String[] args) {
        Shape s = new Shape();
    }
}
```

**Compiler error:**
```
Main.java:5: error: Shape is abstract; cannot be instantiated
        Shape s = new Shape();
                  ^
```

`new Shape()` is rejected, because `Shape.area()` has no body, so there's no complete object to make. You can hold a `Shape` reference (pointing to a `Circle` or a `Square`), but you can't create a bare `Shape`.

*Watch out: a subclass that forgets the abstract method.* A class that isn't `abstract` may not have an abstract method, whether declared or inherited <a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.1.1.1" target="_blank" rel="noopener noreferrer"><abbr title="The Java Language Specification, Java SE 25, §8.1.1.1">[1]</abbr></a>. Here, `Triangle` inherits `area()` without a body:

```java run
abstract class Shape { abstract double area(); }

class Triangle extends Shape {
    double base, height;
}

public class Main {
    public static void main(String[] args) { }
}
```

**Compiler error:**
```
Main.java:3: error: Triangle is not abstract and does not override abstract method area() in Shape
class Triangle extends Shape {
^
1 error
```

The message hints at both fixes: override `area()`, or declare `Triangle` `abstract` too. You'll see the same message if you write `abstract double area();` inside a class you forgot to mark `abstract` — oddly, that class is told it doesn't override its own method.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Use an abstract class when subtypes share both a common type *and* some implementation or state, but a key operation (like `area()`) must differ per subtype.

- The cost: a class can extend only one abstract class (single inheritance).
- The payoff: shared code plus an enforced contract. The compiler guarantees that no subclass forgets to implement the abstract methods.

</div>

---

## 2. Interfaces

An **interface** is a contract: a set of method signatures, with no instance fields to inherit. A class `implements` an interface by providing all of its methods. You can then write code against the interface, and it works with any implementer.

```java run
import static java.lang.IO.println;

interface Drawable {
    void draw();
}

class Circle implements Drawable {
    @Override public void draw() { println("drawing a circle"); }
}

public class Main {
    public static void main(String[] args) {
        Drawable d = new Circle();
        d.draw();
    }
}
```

**Output:**
```
drawing a circle
```

**Analysis.** `Drawable` declares `draw()` with no body, and `Circle implements Drawable` supplies it. A `Drawable` reference can point at any implementer and call the contracted method — the same "program to the interface" idea you used with `List`.

- An interface method with no body is implicitly `abstract` <a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html#jls-9.4" target="_blank" rel="noopener noreferrer"><abbr title="The Java Language Specification, Java SE 25, §9.4">[3]</abbr></a>.
- An interface method with no access modifier is implicitly `public` <a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html#jls-9.4" target="_blank" rel="noopener noreferrer"><abbr title="The Java Language Specification, Java SE 25, §9.4">[3]</abbr></a>. So the implementing method must be `public` too.

**The idea.**
*The mechanics.* An interface defines a type and a method contract. It has no instance fields and no constructor: there's nothing to instantiate, only something to implement. Any field you declare in an interface is implicitly `public static final` — in other words, a constant <a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html#jls-9.3" target="_blank" rel="noopener noreferrer"><abbr title="The Java Language Specification, Java SE 25, §9.3">[4]</abbr></a>. A class that declares `implements` promises to provide every abstract method, and the compiler checks that promise.

*Concrete bite.* Leave a contracted method unimplemented, and the class won't compile:

```java run
interface Drawable { void draw(); }

class Circle implements Drawable { }

public class Main {
    public static void main(String[] args) { }
}
```

**Compiler error:**
```
Main.java:3: error: Circle is not abstract and does not override abstract method draw() in Drawable
class Circle implements Drawable { }
^
```

`Circle` claims to be `Drawable` but never provides `draw()`, so it's incomplete. Either implement the method, or declare `Circle` itself `abstract`. Either way, the contract is enforced at compile time.

*Watch out: an implementation without `public`.* `draw()` in the interface is `public`. If you write the implementation with no modifier, you narrow the access — and an override may not do that <a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.8.3" target="_blank" rel="noopener noreferrer"><abbr title="The Java Language Specification, Java SE 25, §8.4.8.3">[8]</abbr></a>:

```java run
import static java.lang.IO.println;

interface Drawable { void draw(); }

class Circle implements Drawable {
    @Override void draw() { println("drawing a circle"); }
}

public class Main {
    public static void main(String[] args) {
        new Circle().draw();
    }
}
```

**Compiler error:**
```
Main.java:6: error: draw() in Circle cannot implement draw() in Drawable
    @Override void draw() { println("drawing a circle"); }
                   ^
  attempting to assign weaker access privileges; was public
1 error
```

The interface never wrote `public`, yet `draw()` is `public` anyway. The fix is to add `public` to the implementation.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Define an interface to specify *what* a type can do, without dictating *how* or sharing state. Then program against it, so any implementer fits.

- The cost: a plain interface carries no implementation (until `default` methods, coming up next).
- The payoff: a contract decoupled from any class. It's the foundation for swappable implementations, and for [lambdas](/synapse/programming-languages/java/robust-oop/nested-and-anonymous-classes-and-lambdas).

</div>

---

## 3. `default` methods

Since JDK 8, an interface method can have a body, as long as it's marked `default` <a href="https://openjdk.org/jeps/126" target="_blank" rel="noopener noreferrer"><abbr title="JEP 126: Lambda Expressions & Virtual Extension Methods (JDK 8)">[10]</abbr></a>. Implementers inherit it for free, and may override it if they like. This lets an interface ship actual behavior, not just signatures. It's also how you add a method to an interface without breaking every existing implementer.

```java run
import static java.lang.IO.println;

interface Greeter {
    String name();
    default String greet() { return "Hello, " + name(); }
}

class Person implements Greeter {
    String n;
    Person(String n) { this.n = n; }
    @Override public String name() { return n; }
}

public class Main {
    public static void main(String[] args) {
        Greeter g = new Person("Ada");
        println(g.greet());
    }
}
```

**Output:**
```
Hello, Ada
```

**Analysis.** `Person` implemented only `name()`. It inherited `greet()` from the interface's `default` body, which called `name()` polymorphically (`"Hello, Ada"`). A `default` method is concrete behavior built on top of the interface's abstract methods: the interface provides the *how*, in terms of the implementer's *what*.

**The idea.**
*The mechanics.* A `default` method's implementation lives in the interface, and implementers inherit it unless they override it <a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html#jls-9.4" target="_blank" rel="noopener noreferrer"><abbr title="The Java Language Specification, Java SE 25, §9.4">[3]</abbr></a>. It can call the interface's abstract methods (like `name()`), which dispatch to the implementing class. So the default's behavior adapts to each implementer.

*Concrete bite.* Defaults are what let interfaces evolve. Before JDK 8, adding a method to a widely implemented interface broke every implementer's compile, because each one suddenly lacked the new method. A `default` method adds the capability along with a fallback, so old implementers keep compiling. The cost shows up only when a class inherits *two* defaults with the same signature. [§5](#5-one-class-many-interfaces) shows that clash, and how to fix it.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Use a `default` method to provide optional or derivable behavior on an interface — especially to extend an existing interface compatibly — while keeping the interface's core as abstract signatures.

- The cost: an interface with many defaults drifts toward being an abstract class, just without state.
- The payoff: interfaces that carry useful behavior, and can grow without breaking implementers.

</div>

---

## 4. `static` and `private` interface methods

An interface can hold two more kinds of method with a body <a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html#jls-9.4" target="_blank" rel="noopener noreferrer"><abbr title="The Java Language Specification, Java SE 25, §9.4">[3]</abbr></a>:

- A **`static` method** (JDK 8) belongs to the interface itself <a href="https://docs.oracle.com/javase/specs/jls/se8/html/jls-9.html#jls-9.4" target="_blank" rel="noopener noreferrer"><abbr title="The Java Language Specification, Java SE 8 Edition, §9.4">[13]</abbr></a>. You call it as `Interface.method()`, without any object. It's a good home for helpers that go with the type.
- A **`private` method** (JDK 9) is a helper for the interface's own method bodies <a href="https://openjdk.org/jeps/213" target="_blank" rel="noopener noreferrer"><abbr title="JEP 213: Milling Project Coin (JDK 9)">[11]</abbr></a>. Two `default` methods can share its code without making it part of the contract.

```java run
import static java.lang.IO.println;

interface Temperature {
    double celsius();

    static double toFahrenheit(double c) { return c * 9 / 5 + 32; }

    default String report() { return label(celsius(), "C"); }
    default String reportF() { return label(toFahrenheit(celsius()), "F"); }

    private String label(double value, String unit) {
        return String.format("%.1f %s", value, unit);
    }
}

class Kettle implements Temperature {
    @Override public double celsius() { return 100; }
}

public class Main {
    public static void main(String[] args) {
        Temperature k = new Kettle();
        println(k.report());
        println(k.reportF());
        println(Temperature.toFahrenheit(37));
    }
}
```

**Output:**
```
100.0 C
212.0 F
98.6
```

**Analysis.**

- `Kettle` wrote only `celsius()`, and inherited `report()` and `reportF()`.
- Both defaults do their formatting through a single `private` helper, `label(...)`.
- `reportF()` calls the `static` `toFahrenheit` by its simple name, since it's inside the interface.
- `main` calls it as `Temperature.toFahrenheit(37)`: the interface's name, and no object.

**The idea.**
*The mechanics.* A class doesn't inherit `private` or `static` methods from its interfaces <a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.8" target="_blank" rel="noopener noreferrer"><abbr title="The Java Language Specification, Java SE 25, §8.4.8">[5]</abbr></a>. The `private` helper is invisible outside the interface. The `static` method stays attached to the interface, and you can reach it only through the interface's name.

*Concrete bite.* Call the `static` method through an implementing class, and javac can't find it:

```java run
import static java.lang.IO.println;

interface Temperature {
    double celsius();
    static double toFahrenheit(double c) { return c * 9 / 5 + 32; }
}

class Kettle implements Temperature {
    @Override public double celsius() { return 100; }
}

public class Main {
    public static void main(String[] args) {
        println(Kettle.toFahrenheit(37));
    }
}
```

**Compiler error:**
```
Main.java:14: error: cannot find symbol
        println(Kettle.toFahrenheit(37));
                      ^
  symbol:   method toFahrenheit(int)
  location: class Kettle
1 error
```

`Kettle` implements `Temperature`, but `toFahrenheit` isn't a member of `Kettle`. Calling it through a `Kettle` variable, as `k.toFahrenheit(37)`, fails the same way (`location: variable k of type Kettle`). Note that this differs from a class's `static` method, which a subclass *does* inherit <a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.8" target="_blank" rel="noopener noreferrer"><abbr title="The Java Language Specification, Java SE 25, §8.4.8">[5]</abbr></a>.

*Watch out: calling the `private` helper from outside.*

```java run
import static java.lang.IO.println;

interface Temperature {
    double celsius();
    private String label(double value, String unit) {
        return String.format("%.1f %s", value, unit);
    }
}

class Kettle implements Temperature {
    @Override public double celsius() { return 100; }
}

public class Main {
    public static void main(String[] args) {
        Temperature k = new Kettle();
        println(k.label(100, "C"));
    }
}
```

**Compiler error:**
```
Main.java:17: error: label(double,String) has private access in Temperature
        println(k.label(100, "C"));
                 ^
1 error
```

`label` is an implementation detail of `Temperature`. Callers get `report()` and `reportF()`, and never see the helper.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Put a helper that belongs with the type in a `static` interface method, and call it by the interface's name. Put code that several `default` methods share in a `private` method.

- The cost: you can never reach a `static` interface method through an implementer, so callers must name the interface.
- The payoff: the contract stays small. Implementers and callers see only the abstract and `default` methods.

</div>

---

## 5. One class, many interfaces

Here's the defining difference: a class `extends` **one** class, but `implements` **many** interfaces <a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.1.4" target="_blank" rel="noopener noreferrer"><abbr title="The Java Language Specification, Java SE 25, §8.1.4">[9]</abbr></a>. That means a type can *be* several things at once. Interfaces give you multiple inheritance of type, which a single superclass can't.

```java run
import static java.lang.IO.println;

interface Swimmer { default String move() { return "swimming"; } }
interface Flyer { default String fly() { return "flying"; } }

class Duck implements Swimmer, Flyer {
    String describe() { return move() + " and " + fly(); }
}

public class Main {
    public static void main(String[] args) {
        Duck d = new Duck();
        println(d.describe());
    }
}
```

**Output:**
```
swimming and flying
```

```mermaid
classDiagram
  class Swimmer { <<interface>> move() }
  class Flyer { <<interface>> fly() }
  class Duck
  Swimmer <|.. Duck
  Flyer <|.. Duck
```

**Analysis.** `Duck` implements *both* `Swimmer` and `Flyer`, inheriting `move()` and `fly()`. It's a `Swimmer` and a `Flyer` at the same time, so a method that takes either type will accept a `Duck`. The diagram shows the two `implements` arrows (`<|..`). No single superclass could give `Duck` both identities, but interfaces can.

**The idea.**
*The mechanics.* Interfaces carry no instance fields, so combining several of them raises no questions about *state* — such as which constructor sets which field. That's one reason Java allows many interfaces but only one superclass <a href="https://docs.oracle.com/javase/tutorial/java/IandI/multipleinheritance.html" target="_blank" rel="noopener noreferrer"><abbr title="The Java Tutorials, Multiple Inheritance of State, Implementation, and Type">[12]</abbr></a>. `default` methods do bring in one form of multiple inheritance of *implementation* <a href="https://docs.oracle.com/javase/tutorial/java/IandI/multipleinheritance.html" target="_blank" rel="noopener noreferrer"><abbr title="The Java Tutorials, Multiple Inheritance of State, Implementation, and Type">[12]</abbr></a>. When two of them collide, the compiler makes you choose.

*Concrete bite.* Try to extend two classes, and you get a syntax error — a class has one superclass, and that's a hard rule:

```java run
class A {}
class B {}
class C extends A, B {}

public class Main {
    public static void main(String[] args) { }
}
```

**Compiler error:**
```
Main.java:3: error: '{' expected
class C extends A, B {}
                 ^
```

`extends A, B` isn't even valid syntax, because a class has at most one superclass. For `C` to be "both," `A` and `B` would need to be interfaces, and `C` would `implement` them.

*Watch out: two defaults with the same signature.* Give `Swimmer` and a new `Walker` interface each a `default` `move()`. A class that implements both now inherits two bodies for one method, and that's a compile-time error <a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.8.4" target="_blank" rel="noopener noreferrer"><abbr title="The Java Language Specification, Java SE 25, §8.4.8.4">[6]</abbr></a>:

```java run
import static java.lang.IO.println;

interface Swimmer { default String move() { return "swimming"; } }
interface Walker { default String move() { return "walking"; } }

class Duck implements Swimmer, Walker { }

public class Main {
    public static void main(String[] args) {
        println(new Duck().move());
    }
}
```

**Compiler error:**
```
Main.java:6: error: types Swimmer and Walker are incompatible;
class Duck implements Swimmer, Walker { }
^
  class Duck inherits unrelated defaults for move() from types Swimmer and Walker
1 error
```

The fix is to override `move()` in `Duck`. Inside the override, `Swimmer.super.move()` calls one specific interface's default by name <a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.12.1" target="_blank" rel="noopener noreferrer"><abbr title="The Java Language Specification, Java SE 25, §15.12.1">[7]</abbr></a>:

```java run
import static java.lang.IO.println;

interface Swimmer { default String move() { return "swimming"; } }
interface Walker { default String move() { return "walking"; } }

class Duck implements Swimmer, Walker {
    @Override
    public String move() { return Swimmer.super.move() + " and " + Walker.super.move(); }
}

public class Main {
    public static void main(String[] args) {
        println(new Duck().move());
    }
}
```

**Output:**
```
swimming and walking
```

`Duck` chose both, in its own order. It could just as well pick one, or write something entirely new. Because javac reports the clash when it compiles `Duck`, it can't slip by unnoticed.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Reach for an interface (or several) when a type needs to play multiple roles, or when you want maximum decoupling. Reach for an abstract class when subtypes share state and implementation.

- The cost of interfaces: they can't hold instance state.
- The payoff: a class can implement as many as it needs, freely modeling "is-a-kind-of-capability." That's why most Java APIs are built on interfaces, with abstract classes as an implementation convenience.

</div>

---

## 6. Mental-model summary

| Principle | Consequence |
|---|---|
| An abstract class has abstract methods and can't be instantiated | Subclasses must implement them; `new AbstractType()` won't compile |
| An abstract class can hold fields, constructors and concrete methods | Shared state and code live there; its constructor runs for every subclass object |
| An interface is a contract a class `implements`; its methods are implicitly `public` | An unimplemented method makes the class not compile (or be `abstract`); an implementation without `public` is rejected |
| Interface fields are implicitly `public static final` | An interface holds constants, never instance state |
| A `default` method gives an interface a method body | Implementers inherit it; interfaces can evolve without breaking them |
| A `static` interface method belongs to the interface; a `private` one is its helper | Call `Interface.m()`; neither is inherited by implementers |
| A class `extends` one class but `implements` many interfaces | Multiple inheritance of *type*, not state |
| Two inherited defaults with one signature | A compile error; override, and pick with `X.super.m()` |

## 7. Gotcha checklist

<div style="border-left:4px solid #da5233;background:rgba(218,82,51,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

| Symptom | Likely cause | Fix |
|---|---|---|
| `Shape is abstract; cannot be instantiated` | `new` on an abstract class (or on an interface) | instantiate a concrete subclass or implementer |
| `Triangle is not abstract and does not override abstract method area() in Shape` | a concrete subclass or implementer is missing an abstract method | implement it, or declare the class `abstract` |
| `Shape is not abstract and does not override abstract method area() in Shape` | an `abstract` method inside a class not marked `abstract` | add `abstract` to the class, or give the method a body |
| `draw() in Circle cannot implement draw() in Drawable` … `weaker access privileges; was public` | the implementation left off `public` | declare it `public` |
| `cannot find symbol … location: class Kettle` for an interface's `static` method | `static` interface methods are not inherited | call it as `Temperature.toFahrenheit(…)` |
| `label(double,String) has private access in Temperature` | a `private` interface method called from outside | call a `default` method that uses it |
| `cannot assign a value to static final variable MAX` | interface fields are constants | keep state in a class, not an interface |
| `'{' expected` at `extends A, B` | a class has one superclass | make `A`/`B` interfaces and `implement` them |
| `types Swimmer and Walker are incompatible` … `inherits unrelated defaults for move()` | two inherited `default` methods with one signature | override `move()`; call `Swimmer.super.move()` to reuse one |
| You can't decide interface vs abstract class | — | shared state or implementation: abstract class; a contract or several roles: interface(s) |

</div>

---

## ✅ Check yourself

One check per objective. Answer before you open anything.

```quiz
{"prompt": "abstract class Shape { Shape(String name) { … } abstract double area(); } and class Triangle extends Shape { Triangle() { super(\"triangle\"); } } — with no area() in Triangle. What happens?", "options": ["It compiles; area() returns 0", "It does not compile: Triangle is not abstract and does not override area()", "It compiles, then throws when area() is called"], "answer": "It does not compile: Triangle is not abstract and does not override area()"}
```

```quiz
{"prompt": "interface Temperature { static double toFahrenheit(double c) { … } } and class Kettle implements Temperature. Which call compiles?", "options": ["Kettle.toFahrenheit(37)", "new Kettle().toFahrenheit(37)", "Temperature.toFahrenheit(37)"], "answer": "Temperature.toFahrenheit(37)"}
```

```quiz
{"prompt": "interface Drawable { void draw(); } — class Circle implements Drawable { void draw() { … } }. Does it compile?", "options": ["Yes", "No: the implementation narrows public access", "No: draw() must be marked default"], "answer": "No: the implementation narrows public access"}
```

```quiz
{"prompt": "Swimmer and Walker each have default String move(). class Duck implements Swimmer, Walker declares no move(). What does javac say?", "options": ["Duck inherits unrelated defaults for move()", "Nothing: Swimmer's move() wins, being listed first", "Nothing: Walker's move() wins, being listed last"], "answer": "Duck inherits unrelated defaults for move()"}
```

```quiz
{"prompt": "Several shapes share a name field, a constructor that sets it, and a describe() method; only area() differs. Which fits?", "options": ["An interface with a default describe() and a name constant", "An abstract class with the field, the constructor, describe() and an abstract area()", "One concrete class with a switch on the shape"], "answer": "An abstract class with the field, the constructor, describe() and an abstract area()"}
```

<details>
<summary>The 🧪 box below: <code>Triangle</code>, <code>loudGreet()</code>, and <code>Robot</code>.</summary>

```java run
import static java.lang.IO.println;

abstract class Shape { abstract double area(); }

class Circle extends Shape {
    double r;
    Circle(double r) { this.r = r; }
    @Override double area() { return Math.PI * r * r; }
}

class Square extends Shape {
    double side;
    Square(double side) { this.side = side; }
    @Override double area() { return side * side; }
}

class Triangle extends Shape {
    double base, height;
    Triangle(double base, double height) { this.base = base; this.height = height; }
    @Override double area() { return 0.5 * base * height; }
}

interface Greeter {
    String name();
    default String greet() { return "Hello, " + name(); }
    default String loudGreet() { return greet().toUpperCase(); }
}

class Person implements Greeter {
    String n;
    Person(String n) { this.n = n; }
    @Override public String name() { return n; }
}

interface Swimmer { default String move() { return "swimming"; } }
interface Flyer { default String fly() { return "flying"; } }

class Robot implements Swimmer, Flyer { }

public class Main {
    public static void main(String[] args) {
        Shape[] shapes = { new Circle(1), new Square(2), new Triangle(3, 4) };
        for (Shape s : shapes) {
            System.out.printf("%.2f%n", s.area());
        }
        println(new Person("Ada").loudGreet());
        Robot r = new Robot();
        println(r.move() + " and " + r.fly());
    }
}
```

**Output:**
```
3.14
4.00
6.00
HELLO, ADA
swimming and flying
```

- `Triangle(3, 4)` has area `0.5 * 3 * 4 = 6.00`.
- `loudGreet()` is a second `default` built on top of the first.
- `Robot` compiles with an empty body: both interfaces supply their methods as defaults, and the names differ. Two interfaces are fine because they bring no fields along. Two classes aren't, because a class has only one superclass.

</details>

---

## 📚 Sources

1. *The Java Language Specification, Java SE 25*, §8.1.1.1 "`abstract` Classes" (no instance by `new`; a subclass object runs its constructor; no abstract method in a non-abstract class) — <a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.1.1.1" target="_blank" rel="noopener noreferrer">https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.1.1.1</a>
2. *The Java Language Specification, Java SE 25*, §8.4.3.1 "`abstract` Methods" — <a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.3.1" target="_blank" rel="noopener noreferrer">https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.3.1</a>
3. *The Java Language Specification, Java SE 25*, §9.4 "Method Declarations" (implicitly `public`; implicitly `abstract` without `private`, `default` or `static`; default, static and private methods) — <a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html#jls-9.4" target="_blank" rel="noopener noreferrer">https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html#jls-9.4</a>
4. *The Java Language Specification, Java SE 25*, §9.3 "Field (Constant) Declarations" ("implicitly public, static, and final") — <a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html#jls-9.3" target="_blank" rel="noopener noreferrer">https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html#jls-9.3</a>
5. *The Java Language Specification, Java SE 25*, §8.4.8 "Inheritance, Overriding, and Hiding" ("A class does not inherit private or static methods from its superinterface types") — <a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.8" target="_blank" rel="noopener noreferrer">https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.8</a>
6. *The Java Language Specification, Java SE 25*, §8.4.8.4 "Inheriting Methods with Override-Equivalent Signatures" — <a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.8.4" target="_blank" rel="noopener noreferrer">https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.8.4</a>
7. *The Java Language Specification, Java SE 25*, §15.12.1 "Compile-Time Step 1: Determine Type to Search" (`TypeName.super.m()`) — <a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.12.1" target="_blank" rel="noopener noreferrer">https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.12.1</a>
8. *The Java Language Specification, Java SE 25*, §8.4.8.3 "Requirements in Overriding and Hiding" ("at least as much access") — <a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.8.3" target="_blank" rel="noopener noreferrer">https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.8.3</a>
9. *The Java Language Specification, Java SE 25*, §8.1.4 "Superclasses and Subclasses" and §8.1.5 "Superinterfaces" — <a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.1.4" target="_blank" rel="noopener noreferrer">https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.1.4</a>
10. JEP 126: Lambda Expressions & Virtual Extension Methods (JDK 8) — <a href="https://openjdk.org/jeps/126" target="_blank" rel="noopener noreferrer">https://openjdk.org/jeps/126</a>
11. JEP 213: Milling Project Coin (JDK 9; "support for private interface methods") — <a href="https://openjdk.org/jeps/213" target="_blank" rel="noopener noreferrer">https://openjdk.org/jeps/213</a>
12. The Java Tutorials, "Multiple Inheritance of State, Implementation, and Type" (Oracle) — <a href="https://docs.oracle.com/javase/tutorial/java/IandI/multipleinheritance.html" target="_blank" rel="noopener noreferrer">https://docs.oracle.com/javase/tutorial/java/IandI/multipleinheritance.html</a>
13. *The Java Language Specification, Java SE 8 Edition*, §9.4 "Method Declarations" ("An interface can declare static methods"; the SE 7 edition made a `static` interface method a compile-time error) — <a href="https://docs.oracle.com/javase/specs/jls/se8/html/jls-9.html#jls-9.4" target="_blank" rel="noopener noreferrer">https://docs.oracle.com/javase/specs/jls/se8/html/jls-9.html#jls-9.4</a>

---

<div style="border-left:4px solid #6d28d9;background:rgba(109,40,217,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

🧪 **Predict, then check.**

1. Add a `Triangle extends Shape` whose `area()` returns `0.5 * base * height`. Predict the three areas printed for a `Circle(1)`, a `Square(2)` and a `Triangle(3, 4)`.
2. Give `Greeter` a second `default` method, `loudGreet()`, that returns `greet().toUpperCase()`, and predict `new Person("Ada").loudGreet()`.
3. Predict whether `class Robot implements Swimmer, Flyer {}` compiles, and what `move()` and `fly()` return on a `Robot`. Explain why two interfaces are fine but two classes are not.

</div>

## Your Turn

Before you move on, check your understanding with the coach — explain the idea, apply it, weigh the trade-offs, then defend your reasoning.

<div class="concept-coach"></div>
