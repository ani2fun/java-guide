---
title: Generics
summary: Generics parameterize code over a type, so List<String> guarantees only Strings at compile time. Generic classes and methods, raw types, type inference (the diamond, var), bounded types (T extends Comparable) that unlock the bound's methods, wildcards (? extends / ? super, PECS) for flexible APIs, and type erasure — generics are compile-time only, so List<String> and List<Integer> are one class at run time. Every behavior and limit shown with verified output.
prereqs: []
---

# Generics — Type Safety Without Casts

You've used generics since [the Collections Framework](/synapse/programming-languages/java/core-libraries/the-collections-framework): `List<Integer>` is "a list of `Integer`". Generics let a class or method work over *a* type the caller chooses, while the compiler enforces it. So `List<String>` accepts only `String`s and returns `String`s, with no casting.

The catch, and the second half of this lesson, is that generics are a **compile-time** device. The compiler **erases** them, so at run time `List<String>` and `List<Integer>` are the *same* class. That **type erasure** explains why generics cost no extra classes, and also what they cannot do, such as `new T[10]`.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **The core idea.**

- Generics parameterize code over **a type the caller picks** — `List<String>` with no casts.
- The compiler enforces it; generics are a **compile-time** device.
- The JVM **erases** them, so `List<String>` and `List<Integer>` are one class at run time — free, but limited.

</div>

Every output below was produced by compiling and running the code on Java 21.

**You'll be able to:** write a generic class and a generic method, and predict when the compiler rejects a misuse; predict the type the compiler infers for a diamond, a `var` and a generic call; add a bound when a method needs `compareTo`, and read the error when it is missing; pick `? extends T` or `? super T` for a parameter, and predict which calls compile; explain what erasure removes, and predict which `instanceof` and `new T[]` forms compile.

<div style="border-left:4px solid #15448e;background:rgba(21,68,142,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

📘 **How to read the Intuition boxes.** Each one is built in three moves:

1. **The mechanism** — what the compiler and the JVM *do*.
2. **A concrete bite** — a specific, runnable failure (often a real compiler error), shown so the trap is visible.
3. **The earned rule** — the decision heuristic, now justified rather than asserted, plus its cost.

</div>

---

## Table of contents

1. [Generic classes: type parameters](#1-generic-classes-type-parameters)
2. [Generic methods and bounded types](#2-generic-methods-and-bounded-types)
3. [Wildcards and PECS](#3-wildcards-and-pecs)
4. [Type erasure](#4-type-erasure)
5. [Mental-model summary](#5-mental-model-summary)
6. [Gotcha checklist](#6-gotcha-checklist)
7. [Check yourself](#-check-yourself)
8. [Sources](#-sources)

---

## 1. Generic classes: type parameters

A class can declare a **type parameter**, written `<T>`, and use `T` as a stand-in type throughout <abbr title="The Java Language Specification, Java SE 21, §8.1.2">[1]</abbr>. The caller supplies a **type argument**, the real type, such as `String` in `Box<String>` <abbr title="The Java Language Specification, Java SE 21, §4.5">[2]</abbr>. The compiler then enforces it everywhere.

```java run
class Box<T> {
    private T value;
    Box(T value) { this.value = value; }
    T get() { return value; }
}

public class Main {
    public static void main(String[] args) {
        Box<String> sb = new Box<>("hello");
        String s = sb.get();
        System.out.println(s.toUpperCase());
        Box<Integer> ib = new Box<>(42);
        System.out.println(ib.get() + 1);
    }
}
```

**Output:**
```
HELLO
43
```

**Analysis.** `Box<String>` made `T` mean `String`, so `get()` returned a `String`, usable as one (`toUpperCase`) with no cast. `Box<Integer>`'s `get()` returned an `Integer`, usable in arithmetic. One class definition gave two type-safe uses.

`new Box<>("hello")` uses the diamond from [the Collections Framework](/synapse/programming-languages/java/core-libraries/the-collections-framework): the compiler infers `String` from the variable's type. §2 shows more of this **type inference**.

**Intuition.**
*Mechanism.* The compiler checks every use of a `Box<String>` as if `T` were `String`. The guarantee is static: code that makes a `Box<String>` hold or return anything but a `String` does not compile.

*Concrete bite.* That guarantee shows up as a compile error the moment you misuse it:

```java run
class Box<T> {
    private T value;
    Box(T value) { this.value = value; }
    T get() { return value; }
}

public class Main {
    public static void main(String[] args) {
        Box<String> sb = new Box<>("hi");
        Integer n = sb.get();
        System.out.println(n);
    }
}
```

**Compiler error:**
```
Main.java:10: error: incompatible types: String cannot be converted to Integer
        Integer n = sb.get();
                          ^
1 error
```

`sb.get()` is statically a `String`, so assigning it to an `Integer` is rejected: the type argument carried `String` all the way to the return type. The error comes at compile time, not as a `ClassCastException` at run time.

*Non-example: a raw type.* Leave out the type argument, and you get a **raw type**: `List` instead of `List<String>`. The JLS allows raw types "only as a concession to compatibility of legacy code", written before Java 5 added generics <abbr title="The Java Language Specification, Java SE 21, §4.8">[3]</abbr>. The compiler then checks nothing:

```java run
import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List names = new ArrayList();      // raw type: no <String>
        names.add("Ada");
        names.add(42);                     // nothing stops this
        List<String> typed = names;        // unchecked: allowed, with a warning
        for (String s : typed) {
            System.out.println(s.length());
        }
    }
}
```

**Output** *(prints one line, then a thrown exception):*
```
3
Exception in thread "main" java.lang.ClassCastException: class java.lang.Integer cannot be cast to class java.lang.String (java.lang.Integer and java.lang.String are in module java.base of loader 'bootstrap')
```

javac compiled it with only a note: `Main.java uses unchecked or unsafe operations.` The `42` went in unchecked. The crash came far from the mistake, when the loop read it as a `String`.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Parameterize a container or wrapper with `<T>` so its callers get type safety and skip casts. Never write a raw type in new code.

The cost is a more abstract class definition, and `T` must be a reference type: `Box<int>` won't compile, only `Box<Integer>`. The benefit is that misuse becomes a compile error instead of a run-time cast failure.

</div>

---

## 2. Generic methods and bounded types

A *method* can have its own type parameter, declared before the return type: `<T> T pick(...)` <abbr title="The Java Language Specification, Java SE 21, §8.4.4">[4]</abbr>. A **bound**, `<T extends Something>`, restricts `T` to subtypes of `Something`. That unlocks `Something`'s methods on `T`.

```java run
public class Main {
    static <T extends Comparable<T>> T max(T a, T b) {
        return a.compareTo(b) >= 0 ? a : b;
    }

    public static void main(String[] args) {
        System.out.println(max(3, 7));
        System.out.println(max("apple", "banana"));
    }
}
```

**Output:**
```
7
banana
```

**Analysis.** `max` works for any `T` that is `Comparable<T>`, so one definition found the larger `Integer` (`7`) and the later `String` (`"banana"`). The bound `T extends Comparable<T>` is what lets the body call `a.compareTo(b)`. Without it, the compiler knows nothing about `T` beyond `Object`'s methods.

Nobody wrote `<Integer>` at the call. The compiler **inferred** `T` from the arguments <abbr title="The Java Language Specification, Java SE 21, §18 Type Inference">[5]</abbr>. You may also write it explicitly: `Main.<Integer>max(3, 7)` prints `7`.

**Intuition.**
*Mechanism.* A bound is a compile-time promise about `T`'s capabilities. `T extends Comparable<T>` tells the compiler every `T` has `compareTo`, so the call type-checks; the caller, in turn, may only pass `Comparable` types.

*Concrete bite.* Drop the bound and the method can't use anything type-specific:

```java run
public class Main {
    static <T> T max(T a, T b) {
        return a.compareTo(b) >= 0 ? a : b;
    }

    public static void main(String[] args) { }
}
```

**Compiler error:**
```
Main.java:3: error: cannot find symbol
        return a.compareTo(b) >= 0 ? a : b;
                ^
  symbol:   method compareTo(T)
```

With an unbounded `T`, `a` is known only to be an `Object`, which has no `compareTo`, so the call won't compile. The bound isn't decoration; it is what makes `T`'s methods available.

Inference has limits too. `max(3, "banana")` asks for one `T` that is both `Integer` and `String`:

```java run
public class Main {
    static <T extends Comparable<T>> T max(T a, T b) {
        return a.compareTo(b) >= 0 ? a : b;
    }

    public static void main(String[] args) {
        System.out.println(Main.<Integer>max(3, 7));
        System.out.println(max(3, "banana"));
    }
}
```

**Compiler error:**
```
Main.java:8: error: method max in class Main cannot be applied to given types;
        System.out.println(max(3, "banana"));
                           ^
  required: T,T
  found:    int,String
  reason: inference variable T has incompatible bounds
```

*Non-example: `var` with a diamond.* The diamond infers from the variable's declared type. With `var` there is none, so the compiler infers the widest type, `Object`:

```java run
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        var list = new ArrayList<>();
        list.add("a");
        list.add(1);
        String first = list.get(0);
    }
}
```

**Compiler error:**
```
Main.java:8: error: incompatible types: Object cannot be converted to String
        String first = list.get(0);
                               ^
```

`list` is an `ArrayList<Object>`, so it accepted both `"a"` and `1`, and `get` returns `Object`. Write `var list = new ArrayList<String>();`, or `List<String> list = new ArrayList<>();`.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Use a generic method when one algorithm applies across many types, and add a bound (`extends`) exactly when the body needs methods beyond `Object`'s. Let the compiler infer type arguments, but give it a declared type to infer from.

The cost of a bound is narrowing what callers may pass. The benefit is that the body can *do* something with `T` (compare it, call its interface's methods) while staying type-safe.

</div>

---

## 3. Wildcards and PECS

`Integer` is a subtype of `Number`, but `List<Integer>` is **not** a `List<Number>`: "subtyping does not extend through parameterized types" <abbr title="The Java Language Specification, Java SE 21, §4.10">[6]</abbr>. Generics are *invariant*, so a method taking `List<Number>` rejects a `List<Integer>`.

**Wildcards** restore flexibility <abbr title="The Java Language Specification, Java SE 21, §4.5.1">[7]</abbr>. `? extends Number` means "some unknown subtype of `Number`", and accepts `List<Integer>`, `List<Double>`, and so on.

```java run
import java.util.List;
import java.util.ArrayList;

public class Main {
    static double sum(List<? extends Number> nums) {
        double total = 0;
        for (Number n : nums) total += n.doubleValue();
        return total;
    }

    public static void main(String[] args) {
        List<Integer> ints = new ArrayList<>();
        ints.add(1); ints.add(2); ints.add(3);
        List<Double> dbls = new ArrayList<>();
        dbls.add(1.5); dbls.add(2.5);
        System.out.println(sum(ints));
        System.out.println(sum(dbls));
    }
}
```

**Output:**
```
6.0
4.0
```

**Analysis.** `sum` accepts `List<? extends Number>`, so it summed both a `List<Integer>` (`6.0`) and a `List<Double>` (`4.0`). Every element is *some* `Number`, which is all `sum` needs to call `doubleValue()`. The wildcard widened the parameter from "exactly `List<Number>`" to "a list of any `Number` subtype".

**Intuition.**
*Mechanism.* Without a wildcard, `List<Number>` matches only `List<Number>`. It has to: otherwise you could pass a `List<Integer>` and put a `Double` into it.

- `? extends Number` is a **producer**: you can *read* `Number`s out, but not *add*, because the exact element type is unknown.
- Its mirror, `? super Integer`, is a **consumer**: you can *add* `Integer`s, but read only `Object`s.

Hence the mnemonic **PECS**: *Producer `extends`, Consumer `super`*. A consumer in action:

```java run
import java.util.ArrayList;
import java.util.List;

public class Main {
    static void addOnes(List<? super Integer> out, int n) {
        for (int i = 0; i < n; i++) out.add(1);
    }

    public static void main(String[] args) {
        List<Number> nums = new ArrayList<>();
        List<Object> objs = new ArrayList<>();
        addOnes(nums, 2);
        addOnes(objs, 3);
        System.out.println(nums);
        System.out.println(objs);
        Object first = objs.get(0);
        System.out.println(first);
    }
}
```

**Output:**
```
[1, 1]
[1, 1, 1]
1
```

`addOnes` accepted a `List<Number>` and a `List<Object>`: both can hold an `Integer`. The producer side refuses to add, even a value that looks safe:

```java run
import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<? extends Number> nums = new ArrayList<Integer>();
        nums.add(1);
    }
}
```

**Compiler error:**
```
Main.java:7: error: incompatible types: int cannot be converted to CAP#1
        nums.add(1);
                 ^
  where CAP#1 is a fresh type-variable:
    CAP#1 extends Number from capture of ? extends Number
```

`CAP#1` is javac's name for "the unknown type behind `?`". The list might be a `List<Double>`, so no `Integer` may go in.

*Concrete bite.* Declare the parameter as the invariant `List<Number>` and the same call is rejected:

```java run
import java.util.List;
import java.util.ArrayList;

public class Main {
    static double sum(List<Number> nums) {
        double total = 0;
        for (Number n : nums) total += n.doubleValue();
        return total;
    }

    public static void main(String[] args) {
        List<Integer> ints = new ArrayList<>();
        ints.add(1);
        System.out.println(sum(ints));
    }
}
```

**Compiler error:**
```
Main.java:14: error: incompatible types: List<Integer> cannot be converted to List<Number>
        System.out.println(sum(ints));
                               ^
```

`List<Integer>` is not a `List<Number>`, so `sum(ints)` won't compile: invariance in action. The `? extends Number` wildcard is the fix.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Use `? extends T` for parameters you only **read** from (producers), and `? super T` for parameters you only **write** to (consumers): PECS.

The cost is wildcard syntax and its restriction: a `? extends` list can't be added to. The benefit is APIs that accept the whole family of related generic types instead of one exact match.

</div>

---

## 4. Type erasure

Generics exist only at compile time. The compiler checks types and then **erases** them <abbr title="The Java Language Specification, Java SE 21, §4.6">[8]</abbr>. At run time there is only `ArrayList`: `ArrayList<String>` and `ArrayList<Integer>` are the *same* class.

```java run
import java.util.List;
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        List<String> ss = new ArrayList<>();
        List<Integer> is = new ArrayList<>();
        System.out.println(ss.getClass() == is.getClass());
        System.out.println(ss.getClass().getSimpleName());
    }
}
```

**Output:**
```
true
ArrayList
```

**Analysis.** Both lists report the *same* class, `ArrayList`, and `getClass() == getClass()` is `true`: at run time the `<String>` and `<Integer>` are gone. Generics were enforced during compilation and then erased. This is why generics need no extra classes, and why some things are impossible.

**Intuition.**
*Mechanism.* Erasure replaces each type variable with the erasure of its bound, or `Object` when there is none <abbr title="The Java Language Specification, Java SE 21, §4.6">[8]</abbr>. The compiler inserts casts where the code needs the real type. `javap -c`, the JDK's bytecode printer, shows both for the §1 `Box<String>` program:

```text
$ javap -c Main
      11: invokevirtual #14                 // Method Box.get:()Ljava/lang/Object;
      14: checkcast     #18                 // class java/lang/String
```

`Box.get` returns `Object` in the bytecode, and a `checkcast` to `String` follows the call. The cast cannot fail here, because the compiler proved the types first. A raw type, as in §1, skips that proof, and the inserted cast is what threw.

*Concrete bite.* Because the type argument is gone at run time, the JVM cannot check it. So `instanceof` accepts `List<String>` only when the compiler can prove the answer about `<String>` in advance <abbr title="The Java Language Specification, Java SE 21, §15.20.2">[9]</abbr>. From an `Object`, it cannot:

```java run
import java.util.List;

public class Main {
    static void check(Object obj) {
        if (obj instanceof List<String>) {
            System.out.println("yes");
        }
    }

    public static void main(String[] args) { }
}
```

**Compiler error:**
```
Main.java:5: error: Object cannot be safely cast to List<String>
        if (obj instanceof List<String>) {
            ^
```

At run time there's only `List`, so `obj instanceof List<String>` can't be checked, and the compiler rejects it. From a `Collection<String>`, the same test compiles, because `<String>` is already known:

```java run
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        Collection<String> c = new ArrayList<>();
        System.out.println(c instanceof List<String>);
        Object o = c;
        System.out.println(o instanceof List<?>);
    }
}
```

**Output:**
```
true
true
```

From an `Object`, test `instanceof List<?>`: "some list". For the same reason, an array of a type variable cannot be created <abbr title="The Java Language Specification, Java SE 21, §15.10.1">[10]</abbr>; there is no run-time `T` to allocate:

```java run
class Stack<T> {
    T[] items = new T[10];
}

public class Main {
    public static void main(String[] args) { }
}
```

**Compiler error:**
```
Main.java:2: error: generic array creation
    T[] items = new T[10];
                ^
```

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Rely on generics for compile-time safety, and remember the run-time blind spot: the type argument does not exist there. So no `instanceof List<String>` on an `Object`, and no `new T[]`.

The cost of erasure is these gaps, and the "unchecked" warnings when you mix in raw types. The benefit is compatibility: generic code runs on the same classes as the code written before generics.

</div>

---

## 5. Mental-model summary

| Principle | Consequence |
|---|---|
| A type parameter `<T>` lets one class/method work over a chosen type argument | `Box<String>` returns `String` with no cast; misuse is a compile error |
| A raw type (`List` with no `<…>`) turns the checks off | An unchecked note at compile time; a `ClassCastException` far from the mistake |
| The compiler infers type arguments from arguments and declared types | `max(3, 7)` needs no `<Integer>`; `var x = new ArrayList<>()` is `ArrayList<Object>` |
| A bound (`T extends X`) unlocks `X`'s methods on `T` | Unbounded `T` is `Object`; `a.compareTo(b)` needs the bound |
| Generics are invariant; wildcards widen them | `List<Integer>` is not a `List<Number>`; `? extends Number` accepts both |
| PECS: Producer `extends`, Consumer `super` | Read from `? extends T`; write to `? super T` |
| Type erasure: generics are compile-time only | One class at run time; inserted casts; no `instanceof List<String>` on an `Object`, no `new T[]` |

## 6. Gotcha checklist

<div style="border-left:4px solid #da5233;background:rgba(218,82,51,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

| Symptom | Likely cause | Fix |
|---|---|---|
| `cannot find symbol`, `symbol: method compareTo(T)` | `T` is unbounded, so it is only `Object` | add a bound: `T extends Comparable<T>` |
| `incompatible types: List<Integer> cannot be converted to List<Number>` | generics are invariant | take `List<? extends Number>` for a read-only parameter |
| `int cannot be converted to CAP#1` on `add` | the list is a `? extends` producer | take `List<? super Integer>` if the method adds |
| `inference variable T has incompatible bounds` | the arguments need two different `T`s | pass arguments of one type |
| `Object cannot be converted to String` after `var x = new ArrayList<>()` | `var` gave the diamond nothing to infer from | `new ArrayList<String>()`, or a declared `List<String>` |
| `uses unchecked or unsafe operations`, then a distant `ClassCastException` | a raw type let a wrong element in | add the type argument everywhere |
| `Object cannot be safely cast to List<String>` | `instanceof` with a type argument that erasure removes | `instanceof List<?>` |
| `generic array creation` | `new T[…]` needs a run-time `T` | use a `List<T>` |

</div>

---

## ✅ Check yourself

One check per objective. Answer before you open anything.

```quiz
{"prompt": "class Box<T> { T get() … }; Box<String> b = new Box<>(\"hi\"); Integer n = b.get(); — what happens?", "options": ["It does not compile", "ClassCastException at run time", "n is null"], "answer": "It does not compile"}
```

```quiz
{"prompt": "var list = new ArrayList<>(); — what is the type of list?", "options": ["ArrayList<String>", "ArrayList<Object>", "It does not compile"], "answer": "ArrayList<Object>"}
```

```quiz
{"prompt": "static <T> T max(T a, T b) { return a.compareTo(b) >= 0 ? a : b; } — what happens?", "options": ["It compiles and works for any T", "It compiles but throws for non-Comparable T", "cannot find symbol: method compareTo(T)"], "answer": "cannot find symbol: method compareTo(T)"}
```

```quiz
{"prompt": "A method must add Integers to whatever list it is given: a List<Integer>, a List<Number> or a List<Object>. Which parameter type?", "options": ["List<? super Integer>", "List<? extends Integer>", "List<Number>"], "answer": "List<? super Integer>"}
```

```quiz
{"prompt": "Which of these compiles in Java 21?", "options": ["Object o; o instanceof List<String>", "Collection<String> c; c instanceof List<String>", "new T[10] inside a generic class"], "answer": "Collection<String> c; c instanceof List<String>"}
```

<details>
<summary>The 🧪 box below: <code>Pair</code>, <code>firstOrNull</code>, the two <code>getClass()</code> calls, and <code>instanceof Map&lt;String,Integer&gt;</code>.</summary>

- `new Pair<String, Integer>("x", 1).second() + 1` is `2`: `second()` returns an `Integer`, which unboxes for the `+`.
- `static <T> T firstOrNull(List<T> xs)` compiles. Adding `xs.get(0).compareTo(...)` inside it does not: `cannot find symbol`, as in §2, until `T` gets a bound.
- `new ArrayList<String>().getClass() == new ArrayList<Double>().getClass()` is `true`: erasure leaves one class.
- `obj instanceof Map<String,Integer>` is rejected because the JVM keeps no type arguments, so it cannot check `<String,Integer>`, and from an `Object` the compiler cannot prove it either.

```java run
import java.util.ArrayList;
import java.util.List;

class Pair<A, B> {
    private final A first;
    private final B second;
    Pair(A first, B second) { this.first = first; this.second = second; }
    A first() { return first; }
    B second() { return second; }
}

public class Main {
    static <T> T firstOrNull(List<T> xs) {
        return xs.isEmpty() ? null : xs.get(0);
    }

    public static void main(String[] args) {
        System.out.println(new Pair<String, Integer>("x", 1).second() + 1);
        System.out.println(firstOrNull(List.of("a", "b")));
        System.out.println(new ArrayList<String>().getClass() == new ArrayList<Double>().getClass());
    }
}
```

**Output:**
```
2
a
true
```

</details>

---

## 📚 Sources

1. *The Java Language Specification, Java SE 21*, §8.1.2 "Generic Classes and Type Parameters" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.1.2>
2. *The Java Language Specification, Java SE 21*, §4.5 "Parameterized Types" (type arguments) — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-4.html#jls-4.5>
3. *The Java Language Specification, Java SE 21*, §4.8 "Raw Types" ("only as a concession to compatibility of legacy code") — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-4.html#jls-4.8>
4. *The Java Language Specification, Java SE 21*, §8.4.4 "Generic Methods" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.4.4>
5. *The Java Language Specification, Java SE 21*, Chapter 18 "Type Inference" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-18.html>
6. *The Java Language Specification, Java SE 21*, §4.10 "Subtyping" ("Subtyping does not extend through parameterized types") — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-4.html#jls-4.10>
7. *The Java Language Specification, Java SE 21*, §4.5.1 "Type Arguments of Parameterized Types" (wildcards) — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-4.html#jls-4.5.1>
8. *The Java Language Specification, Java SE 21*, §4.6 "Type Erasure" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-4.html#jls-4.6>
9. *The Java Language Specification, Java SE 21*, §15.20.2 "The `instanceof` Operator" (the operand "must be checked cast compatible") — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.20.2>
10. *The Java Language Specification, Java SE 21*, §15.10.1 "Array Creation Expressions" (the element type must be reifiable) — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.10.1>

---

<div style="border-left:4px solid #6d28d9;background:rgba(109,40,217,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

🧪 **Predict, then check.**

1. Write a `Pair<A, B>` class with two type parameters and a `first()` and `second()`. Predict what `new Pair<String, Integer>("x", 1).second() + 1` evaluates to.
2. Predict whether `static <T> T firstOrNull(List<T> xs)` compiles, and whether adding `xs.get(0).compareTo(...)` inside it does.
3. Predict `new ArrayList<String>().getClass() == new ArrayList<Double>().getClass()`.
4. Explain in one sentence why `obj instanceof Map<String,Integer>` is rejected when `obj` is an `Object`.

</div>

## Your Turn

Before you move on, check your understanding with the coach — explain the idea, apply it, weigh the trade-offs, then defend your reasoning.

<div class="concept-coach"></div>
