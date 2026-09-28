---
title: Encapsulation & Access Modifiers
summary: Encapsulation hides an object's data behind a controlled interface — fields go private, reached only through methods that can enforce invariants. private/package-private/protected/public set visibility; getters and setters gate access; and final fields with no setters make an object immutable and safe to share. Every rule shown as real output or a real compiler error.
prereqs: []
---

# Encapsulation & Access Modifiers — Controlling Access

A class that exposes its raw fields cannot defend itself. Anyone can set `balance` to `-999`, and the class is powerless to object.

**Encapsulation** is the fix. Hide the data (`private`) and expose only methods that *control* how it changes. The class can then enforce its own rules, its **invariants**: facts about its fields that must hold after every operation.

The **access modifiers** `private`, `protected` and `public`, plus writing none at all (package-private), give four levels of who can see each field and method. Pushed to its limit, encapsulation gives you **immutable** objects: data set once at construction and never changed. Such objects are safe to share without the aliasing surprise from [Classes & Objects](/synapse/programming-languages/java/classes-and-objects/classes-and-objects).

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **The core idea.**

- **Encapsulation** hides data (`private`) behind methods that control how it changes, so a class can enforce its **invariants**.
- The **access modifiers** set four levels of who can see each field and method.
- Pushed to its limit it gives **immutable** objects — set once, never changed, safe to share.

</div>

This builds on [classes and objects](/synapse/programming-languages/java/classes-and-objects/classes-and-objects), especially the aliasing that immutability tames. Every output below was produced by compiling and running the code.

**You'll be able to:** predict whether code that reads a `private` field compiles, from the class it sits in; write a method that guards an invariant, and name the path that still bypasses the guard; pick the narrowest access level for a member, from who needs it; explain why `final` fields alone may not make a class immutable, and fix a leaked array with a copy.

<div style="border-left:4px solid #15448e;background:rgba(21,68,142,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

📘 **How to read the Intuition boxes.** Each one is built in three moves:

1. **The mechanism** — what the compiler and the JVM *do*.
2. **A concrete bite** — a specific, runnable failure (often a real compiler error), shown so the trap is visible.
3. **The earned rule** — the decision heuristic, now justified rather than asserted, plus its cost.

</div>

---

## Table of contents

1. [Hiding data with `private`](#1-hiding-data-with-private)
2. [Getters, setters, and invariants](#2-getters-setters-and-invariants)
3. [The four access levels](#3-the-four-access-levels)
4. [Immutability by design](#4-immutability-by-design)
5. [Mental-model summary](#5-mental-model-summary)
6. [Gotcha checklist](#6-gotcha-checklist)
7. [Check yourself](#-check-yourself)
8. [Sources](#-sources)

---

## 1. Hiding data with `private`

Marking a field `private` means it can be touched only from *inside* its own class. Code elsewhere must go through the methods the class chooses to expose — a **getter** to read, for instance.

```java run
class Account {
    private int balance;
    Account(int initial) { balance = initial; }
    int getBalance() { return balance; }
}

public class Main {
    public static void main(String[] args) {
        Account acct = new Account(100);
        System.out.println(acct.getBalance());
    }
}
```

**Output:**
```
100
```

**Analysis.** `balance` is `private`, so `main` cannot read it directly. It asks through `getBalance()`, a method the `Account` class deliberately provides. The class now stands between its data and the outside world: every access goes through code the class controls.

**Intuition.**
*Mechanism.* The **compiler** enforces `private`. A `private` member can be used only inside the class that declares it <abbr title="The Java Language Specification, Java SE 21, §6.6.1">[1]</abbr>. Any use from elsewhere is rejected before the program runs.

*Concrete bite.* Reach for the field directly and it won't compile:

```java run
class Account {
    private int balance;
    Account(int initial) { balance = initial; }
}

public class Main {
    public static void main(String[] args) {
        Account acct = new Account(100);
        System.out.println(acct.balance);
    }
}
```

**Compiler error:**
```
Main.java:9: error: balance has private access in Account
        System.out.println(acct.balance);
                               ^
1 error
```

`acct.balance` is rejected because `balance` is `private` to `Account`, and `main` is outside that class. The wall is checked at compile time; it is not a convention you can quietly ignore.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Make fields `private` by default, and expose behavior, not data.

The cost is the extra code of accessor methods for the data you *do* want to share. The benefit: the set of ways to touch a field shrinks from "everywhere" to "the few methods in this class". That is what makes the next section's invariants enforceable.

</div>

---

## 2. Getters, setters, and invariants

Routing access through methods pays off because a method can **check**. A **setter** (a method that changes a field) can reject or adjust bad input, so the object never enters an invalid state. A bare field can never do that. This book names a getter `getX` and a setter `setX`.

```java run
class Account {
    private int balance;
    Account(int initial) { balance = initial; }
    int getBalance() { return balance; }
    void deposit(int amount) {
        if (amount <= 0) {
            System.out.println("ignored invalid deposit: " + amount);
            return;
        }
        balance += amount;
    }
}

public class Main {
    public static void main(String[] args) {
        Account acct = new Account(100);
        acct.deposit(50);
        acct.deposit(-30);
        System.out.println(acct.getBalance());
    }
}
```

**Output:**
```
ignored invalid deposit: -30
150
```

**Analysis.** `deposit(50)` passed the check and raised the balance to `150`. `deposit(-30)` was caught by the guard and rejected, leaving the balance untouched.

The method enforced the invariant "deposits must be positive". The class can guarantee it because `balance` is `private`, and `deposit` is the only way in. (Real code usually *throws an exception* here instead of printing; [Exceptions](/synapse/programming-languages/java/robust-oop/exceptions) shows how.)

**Intuition.**
*Mechanism.* A mutating method is a gate: it validates before changing state, so the invariants hold after every call. With a `private` field, the class's own methods are the only paths to it. Guard every one of them, and no path leads to an invalid value.

*Concrete bite.* A `public` field has no gate — it accepts anything:

```java run
class Account {
    public int balance;
}

public class Main {
    public static void main(String[] args) {
        Account acct = new Account();
        acct.balance = -999;
        System.out.println(acct.balance);
    }
}
```

**Output:**
```
-999
```

With `balance` public, `acct.balance = -999` succeeds. The class never gets a chance to object, and a "bank account" now holds `-999`. No method can enforce a rule, because the assignment bypasses methods entirely.

*Non-example: a guard the constructor skips.* The constructor is a path in too. Here `deposit` guards, but the constructor stores whatever it is given:

```java run
class Account {
    private int balance;
    Account(int initial) { balance = initial; }
    int getBalance() { return balance; }
    void deposit(int amount) {
        if (amount <= 0) {
            System.out.println("ignored invalid deposit: " + amount);
            return;
        }
        balance += amount;
    }
}

public class Main {
    public static void main(String[] args) {
        Account acct = new Account(-50);
        acct.deposit(-30);
        System.out.println(acct.getBalance());
    }
}
```

**Output:**
```
ignored invalid deposit: -30
-50
```

The guard in `deposit` worked, and the account is still invalid: `new Account(-50)` never met it. Put the same check in the constructor. An invariant holds only if *every* way in checks it, construction included.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Expose mutation through methods that validate, not through public fields, and validate in the constructor as well. Then invariants are checked at the few places state changes.

The cost is more code than a public field: a getter and a guarded setter in place of a bare variable. The benefit is that "an account can't break its rules" is enforced by construction, not by hoping every caller behaves.

</div>

---

## 3. The four access levels

A **package** is a named group of classes, such as `java.util`. A file with no `package` line, like every program in this book, belongs to the **unnamed package** <abbr title="The Java Language Specification, Java SE 21, §7.4.2">[2]</abbr>. [Packages, Modules & the Build](/synapse/programming-languages/java/robust-oop/packages-modules-and-the-build) covers naming your own.

Every field, method, and constructor has one of four visibilities <abbr title="The Java Language Specification, Java SE 21, §6.6.1">[1]</abbr>. From most to least restrictive:

| Modifier | Visible to | Use for |
|---|---|---|
| `private` | code inside the same top-level class | internal state and helpers |
| *(none)*: package-private | classes in the same package | package-internal collaboration |
| `protected` | the same package, **and** subclasses | members subclasses need ([Inheritance & Polymorphism](/synapse/programming-languages/java/robust-oop/inheritance-and-polymorphism)) |
| `public` | everyone (with modules, only if the package is exported) | the class's intended interface |

A member with no modifier is package-private. All the classes in one Run-button program share the unnamed package, so they see each other's package-private members.

`private` is per-**class**, not per-file: another top-level class in the same file cannot see a `private` member.

```java run
class Account {
    private int balance = 100;
}

class Auditor {
    int peek(Account a) { return a.balance; }
}

public class Main {
    public static void main(String[] args) { }
}
```

**Compiler error:**
```
Main.java:6: error: balance has private access in Account
    int peek(Account a) { return a.balance; }
                                  ^
1 error
```

**Analysis.** `Auditor` is a *different class*, so it cannot read `Account`'s `private` `balance`, even from the same file. Privacy is scoped to the declaring class; being nearby in the file grants no access.

**Intuition.**
*Mechanism.* For each access, the compiler checks the member's modifier against where the access sits: the same class, the same package, or a subclass. `protected` adds subclass access, which only means something once classes inherit from each other.

*Concrete bite.* The check is per class, **not per object**. A method of `Account` may read the `private` field of *another* `Account`:

```java run
class Account {
    private int balance;
    Account(int initial) { balance = initial; }
    boolean richerThan(Account other) {
        return balance > other.balance;
    }
}

public class Main {
    public static void main(String[] args) {
        Account ann = new Account(300);
        Account bob = new Account(200);
        System.out.println(ann.richerThan(bob));
        System.out.println(bob.richerThan(ann));
    }
}
```

**Output:**
```
true
false
```

`other.balance` compiled, because the code sits inside `Account`. `private` protects a class's data from *other classes*, not one object from another of its kind.

A top-level class itself may be only `public` or package-private. `private class Helper` at the top of a file gives `modifier private not allowed here` <abbr title="The Java Language Specification, Java SE 21, §8.1.1">[3]</abbr>.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Default to `private`, and widen only as far as a real collaborator needs:

- package-private for same-package helpers;
- `protected` for what subclasses must reach;
- `public` only for the deliberate interface.

The cost of starting narrow is widening later. The cost of starting `public` is that every member becomes part of your contract. Once other code depends on it, you cannot quietly take it back.

</div>

---

## 4. Immutability by design

The strongest form of encapsulation is to allow no changes at all. A `final` field can be assigned exactly once, at its declaration or in the constructor, and never again. A class whose fields are all `final`, with no setters, has state fixed for life. Its objects are **immutable**, provided the fields hold primitives or other immutable objects (the non-example below shows why).

```java run
class Point {
    final int x;
    final int y;
    Point(int x, int y) { this.x = x; this.y = y; }
}

public class Main {
    public static void main(String[] args) {
        Point p = new Point(3, 4);
        System.out.println(p.x + "," + p.y);
    }
}
```

**Output:**
```
3,4
```

**Analysis.** `x` and `y` are `final`, set once in the constructor. After that, a `Point` can be read but never altered: there is no setter, and the `final` fields cannot be reassigned. The object is frozen the moment construction finishes.

**Intuition.**
*Mechanism.* `final` on a field is a compile-time guarantee of single assignment. The compiler checks that every constructor assigns the field <abbr title="The Java Language Specification, Java SE 21, §8.3.1.2">[4]</abbr>, and it rejects any later assignment. Forget one, and the error lands on the constructor's closing brace:

```java run
class Point {
    final int x;
    final int y;
    Point(int x, int y) {
        this.x = x;
    }
}

public class Main {
    public static void main(String[] args) {
        System.out.println(new Point(3, 4).x);
    }
}
```

**Compiler error:**
```
Main.java:6: error: variable y might not have been initialized
    }
    ^
1 error
```

*Concrete bite.* Add a method that tries to change a `final` field and it won't compile:

```java run
class Point {
    final int x;
    Point(int x) { this.x = x; }
    void moveTo(int newX) { x = newX; }
}

public class Main {
    public static void main(String[] args) { }
}
```

**Compiler error:**
```
Main.java:4: error: cannot assign a value to final variable x
    void moveTo(int newX) { x = newX; }
                            ^
1 error
```

`moveTo` tries to reassign `x`, but `x` is `final`, already assigned in the constructor, so the compiler refuses. To "move" an immutable point you don't mutate it; you build a *new* `Point`.

*Non-example: a `final` field that holds an array.* `final` freezes the *reference*, not the object it points to <abbr title="The Java Language Specification, Java SE 21, §4.12.4">[5]</abbr>. This class has only `private final` fields and no setters, yet its data changes twice:

```java run
class Scores {
    private final int[] values;
    Scores(int[] values) { this.values = values; }
    int[] getValues() { return values; }
    int first() { return values[0]; }
}

public class Main {
    public static void main(String[] args) {
        int[] input = {90, 80, 70};
        Scores s = new Scores(input);
        input[0] = 0;
        System.out.println(s.first());
        s.getValues()[0] = -1;
        System.out.println(s.first());
    }
}
```

**Output:**
```
0
-1
```

- The constructor stored the caller's array, so `input[0] = 0` changed the `Scores` object too.
- The getter handed out the same array, so `s.getValues()[0] = -1` changed it again.

`values` still points at the same array, as `final` promised. The array's contents changed under it. The fix is a **defensive copy**, made on the way in and on the way out:

```java run
import java.util.Arrays;

class Scores {
    private final int[] values;
    Scores(int[] values) { this.values = Arrays.copyOf(values, values.length); }
    int[] getValues() { return Arrays.copyOf(values, values.length); }
    int first() { return values[0]; }
}

public class Main {
    public static void main(String[] args) {
        int[] input = {90, 80, 70};
        Scores s = new Scores(input);
        input[0] = 0;
        System.out.println(s.first());
        s.getValues()[0] = -1;
        System.out.println(s.first());
    }
}
```

**Output:**
```
90
90
```

Now the object owns an array no one else can reach. The caller's changes land on copies.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Make a class immutable whenever you can, especially for values you'll share:

- `private final` fields;
- no setters;
- everything set in the constructor;
- a defensive copy of any mutable object the class takes in or hands out.

The cost is that "changing" an immutable object means creating a new one (more allocations), and deep updates get verbose. The benefit is that an immutable object is safe to alias freely. The aliasing surprise from [Classes & Objects](/synapse/programming-languages/java/classes-and-objects/classes-and-objects) can't bite, because nothing can change behind your back. ([Enums & Records](/synapse/programming-languages/java/core-libraries/enums-and-records) shows `record`, which declares the private fields, the constructor and the accessor methods of such a class for you <abbr title="The Java Language Specification, Java SE 21, §8.10.1">[6]</abbr>.)

</div>

---

## 5. Mental-model summary

| Principle | Consequence |
|---|---|
| `private` hides a member from all code outside its top-level class | `acct.balance` from elsewhere is a compile error; go through methods |
| Access is checked per class, not per object | An `Account` method may read `other.balance` |
| Mutating methods can validate; public fields cannot | A guarded `deposit` rejects `-30`; a public `balance = -999` always succeeds |
| An invariant holds only if every way in checks it | A constructor that skips the check lets `new Account(-50)` through |
| Four access levels, narrowest first: private → package → protected → public | Default to `private`; a top-level class is only `public` or package-private |
| `final` fields are assigned once, by every constructor | A missed field is `might not have been initialized`; reassigning one won't compile |
| `final` freezes the reference, not the object | A `final` array can still change; copy it in and out |
| Immutable objects are safe to share | Aliasing can't surprise you when nothing can mutate |

## 6. Gotcha checklist

<div style="border-left:4px solid #da5233;background:rgba(218,82,51,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

| Symptom | Likely cause | Fix |
|---|---|---|
| `balance has private access in Account` | a `private` member used from another class, even one in the same file | call a method of the class instead |
| `modifier private not allowed here` on a class | a top-level class declared `private` | leave it package-private, or make it `public` |
| An object is in an invalid state despite a guarded setter | the constructor (or another method) skips the check | validate on every path in, the constructor included |
| A field holds a value no method would allow | the field is `public` | make it `private`; gate changes through a method |
| Other code depends on a field you meant to keep internal | it was `public` from the start | start `private` and widen deliberately |
| `cannot assign a value to final variable x` | a `final` field changed after construction | build a new object, or drop `final` if it must change |
| `variable y might not have been initialized` at a constructor's `}` | a `final` field that the constructor never assigns | assign every `final` field in every constructor |
| An "immutable" object's data changed | a `final` field holds a mutable array or object that was shared | copy it in the constructor and in the getter |
| A shared object changed unexpectedly | it is mutable and aliased | make it immutable so sharing is safe |

</div>

---

## ✅ Check yourself

One check per objective. Answer before you open anything.

```quiz
{"prompt": "Inside class Account, whose balance field is private, a method returns balance > other.balance, where other is another Account. What happens?", "options": ["It compiles and compares the two balances", "It does not compile: balance has private access", "It compiles, but other.balance reads as 0"], "answer": "It compiles and compares the two balances"}
```

```quiz
{"prompt": "deposit(int amount) ignores amounts ≤ 0, and the constructor Account(int initial) stores initial as it is. What does new Account(-50), then deposit(-30), then getBalance() print last?", "options": ["0", "-80", "-50"], "answer": "-50"}
```

```quiz
{"prompt": "A helper method is called only by other methods of its own class. Which access level fits it?", "options": ["public", "private", "protected"], "answer": "private"}
```

<details>
<summary>A class has one field, <code>private final int[] values</code>, set from the constructor's argument, and a getter that returns it. Is the class immutable? What would you change?</summary>

No. `final` stops `values` from pointing at a different array, but the array's contents can still change. The caller kept its own reference to the array it passed in, and every caller of the getter receives the same array.

Copy the array in the constructor and in the getter, for example with `Arrays.copyOf(values, values.length)`. The §4 proof shows the difference: `0` / `-1` without the copies, `90` / `90` with them.

</details>

<details>
<summary>The 🧪 box below: <code>withdraw(150)</code>, <code>acct.balance -= 10</code>, and an aliased mutable <code>Point</code>.</summary>

1. With a guard that prints `refused: ` and the amount, the run prints `refused: 150`, then `100`. The balance is untouched.
2. It does not compile: `balance has private access in Account`, with the caret under the dot of `acct.balance`.
3. A change made through one variable (say `p.x = 9`) would show up through the other, where nobody expected it. With `final` fields, no such change can be written.

</details>

---

## 📚 Sources

1. *The Java Language Specification, Java SE 21*, §6.6.1 "Determining Accessibility" (`private`: access "from within the body of the top level class") — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-6.html#jls-6.6.1>
2. *The Java Language Specification, Java SE 21*, §7.4.2 "Unnamed Packages" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-7.html#jls-7.4.2>
3. *The Java Language Specification, Java SE 21*, §8.1.1 "Class Modifiers" ("The access modifiers protected and private pertain only to member classes") — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.1.1>
4. *The Java Language Specification, Java SE 21*, §8.3.1.2 "`final` Fields" (a blank `final` instance variable "must be definitely assigned … at the end of every constructor") — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.3.1.2>
5. *The Java Language Specification, Java SE 21*, §4.12.4 "`final` Variables" (the object's state "may be changed", but the variable "will always refer to the same object") — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-4.html#jls-4.12.4>
6. *The Java Language Specification, Java SE 21*, §8.10.1 "Record Components" (each component gives "a private field declared implicitly, and a public accessor method") — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.10.1>

---

<div style="border-left:4px solid #6d28d9;background:rgba(109,40,217,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

🧪 **Predict, then check.**

1. Give `Account` a `withdraw(int amount)` that refuses to let the balance go negative. Predict the output of `new Account(100)`, then `withdraw(150)`, then `getBalance()`.
2. Predict the compiler's reaction to `acct.balance -= 10;` in `main` when `balance` is `private`.
3. If `Point` were *not* immutable, and two variables aliased the same `Point`, what could go wrong that immutability prevents?

</div>

## Your Turn

Before you move on, check your understanding with the coach — explain the idea, apply it, weigh the trade-offs, then defend your reasoning.

<div class="concept-coach"></div>
