---
title: References, Equality & the Object Model
summary: A variable is either a primitive that holds its value or a reference that holds the address of a heap object — and that split governs assignment, aliasing, equality, and null. == compares what the variable holds (a value, or an address); .equals compares meaning. The Integer cache and String pool make == deceptively "work"; dereferencing null throws. The flagship chapter, with a stack/heap picture and every trap shown live.
prereqs: []
---

# References, Equality & the Object Model

This is the lesson the last several have been building toward. Every variable in Java is one of exactly two things:

- a **primitive**, which holds its value directly;
- a **reference**, which points at an object that lives in a memory area called the **heap**.

That single distinction explains nearly every Java surprise you've met:

- assigning an array shares it, but assigning an `int` copies it;
- `==` sometimes lies;
- a method can change your object but not your variable;
- `null` is the most common crash in the language.

Get this picture right and the rules stop being arbitrary; they become consequences.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **The core idea.**

- Every variable is either a **primitive** that holds its value or a **reference** that holds a heap object's **address**.
- That split governs assignment, aliasing, equality, and `null`.
- Get the picture right and the rules stop being arbitrary — they become consequences.

</div>

This is the deep pass of [primitives](/synapse/programming-languages/java/first-steps/variables-and-primitive-types), [`==` vs `.equals` on strings](/synapse/programming-languages/java/first-steps/strings-the-basics), [pass-by-value](/synapse/programming-languages/java/control-flow/methods), and [aliasing](/synapse/programming-languages/java/classes-and-objects/classes-and-objects). Every output below was produced by compiling and running the code.

**You'll be able to:** predict what `=` copies for a primitive and for a reference, and draw which variables share one object; predict `==` and `.equals` for arrays, `Integer`s and `String`s, and pick the comparison that means "same contents"; predict which line throws `NullPointerException`, including a `null` `Integer` stored into an `int`; name the moment an object becomes unreachable, and what the garbage collector may then do.

<div style="border-left:4px solid #15448e;background:rgba(21,68,142,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

📘 **How to read the Intuition boxes.** Each one is built in three moves:

1. **The mechanism** — what the compiler and the JVM *do*.
2. **A concrete bite** — a specific, runnable failure (often a real compiler error), shown so the trap is visible.
3. **The earned rule** — the decision heuristic, now justified rather than asserted, plus its cost.

</div>

---

## Table of contents

1. [Two kinds of variable: values and references](#1-two-kinds-of-variable-values-and-references)
2. [`==` compares what the variable holds](#2--compares-what-the-variable-holds)
3. [`.equals` and the Integer cache trap](#3-equals-and-the-integer-cache-trap)
4. [The String pool](#4-the-string-pool)
5. [`null` and `NullPointerException`](#5-null-and-nullpointerexception)
6. [When an object becomes unreachable](#6-when-an-object-becomes-unreachable)
7. [Mental-model summary](#7-mental-model-summary)
8. [Gotcha checklist](#8-gotcha-checklist)
9. [Check yourself](#-check-yourself)
10. [Sources](#-sources)

---

## 1. Two kinds of variable: values and references

A primitive variable *is* its value: the bits sit in the variable. A reference variable holds a **pointer** to an object stored elsewhere <abbr title="The Java Language Specification, Java SE 21, §4.3.1">[1]</abbr>; the object is not in the variable.

Where do they live? Each running method has a **frame** on its thread's **stack**, holding its local variables <abbr title="The Java Virtual Machine Specification, Java SE 21, §2.5.2">[2]</abbr>. Every object and array is allocated on the **heap**, one area shared by the whole program <abbr title="The Java Virtual Machine Specification, Java SE 21, §2.5.3">[3]</abbr>. This lesson calls the pointer an **address**; the JVM does not fix how it is stored <abbr title="The Java Virtual Machine Specification, Java SE 21, §2.7">[4]</abbr>, but the picture holds.

Assignment copies whatever the variable holds — and that is the whole story:

```java run viz=array:a
public class Main {
    public static void main(String[] args) {
        int x = 5;
        int y = x;       // copies the value 5
        y = 99;
        System.out.println(x + " " + y);

        int[] a = {1, 2, 3};
        int[] b = a;     // copies the reference (the address), not the array
        b[0] = 99;
        System.out.println(a[0] + " " + b[0]);
    }
}
```

**Output:**
```
5 99
99 99
```

```d2
direction: right

stack: "Stack — what each variable holds" {
  x: "int x = 5\n(value)" { shape: rectangle }
  y: "int y = 99\n(value)" { shape: rectangle }
  a: "int[] a\n(reference)" { shape: rectangle }
  b: "int[] b\n(reference)" { shape: rectangle }
}

heap: "Heap — objects live here" {
  arr: "int[]\n{ 99, 2, 3 }" { shape: rectangle }
}

stack.a -> heap.arr
stack.b -> heap.arr
```

**Analysis.** `int y = x` copied the *value* `5` into `y`, so changing `y` to `99` left `x` at `5`: two independent values.

`int[] b = a` copied the *reference*. `a` and `b` now hold the same address and point at the **one** array, so `b[0] = 99` changed the array both see; hence `99 99`.

The diagram is the model. These local variables sit on the stack: the primitives hold values, and the references hold addresses that point into the heap. Two references can point at the same object. (A primitive *field* is different: it sits inside its object, on the heap.)

**Intuition.**
*Mechanism.* A variable stores a fixed-size slot of bits. For a primitive, those bits are the value. For a reference type (arrays, `String`, every class), they are the *address* of a heap object. `=` copies the slot (the value, or the address), never the heap object itself.

*Concrete bite.* The two output lines are the contrast. Copy a primitive and the copies are independent (`5 99`); copy a reference and both names share one object (`99 99`). The same fact explains [pass-by-value of references](/synapse/programming-languages/java/control-flow/methods): a method gets a copy of the *reference*, so it can change the shared object.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Always ask "is this a value or a reference?". The answer tells you whether `=` (or a method call) makes an independent copy or shares an object.

The cost of references is the sharing surprise. The benefit is efficiency: passing a million-element array copies one address, not a million `int`s. Every trap in the rest of this lesson follows from this one distinction.

</div>

---

## 2. `==` compares what the variable holds

`==` looks at the bits in the two variables. For primitives, those bits are values, so `==` compares values. For references, those bits are *addresses*, so `==` asks "same object?". That is **identity**, not contents <abbr title="The Java Language Specification, Java SE 21, §15.21.3">[5]</abbr>.

```java run
public class Main {
    public static void main(String[] args) {
        int[] a = {1, 2, 3};
        int[] b = {1, 2, 3};   // same contents, a brand-new object
        int[] c = a;           // the same object as a
        System.out.println(a == b);
        System.out.println(a == c);
        System.out.println(a[0] == b[0]);
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

- `a == b` is `false` even though both arrays hold `{1, 2, 3}`. They are *different objects* at different addresses, and `==` compares addresses.
- `a == c` is `true` because `c` was assigned `a`, so they share one address.
- `a[0] == b[0]` is `true` because those are `int`s, and `==` on primitives compares values.

Same operator, two meanings, decided by whether the operands are references or primitives.

**Intuition.**
*Mechanism.* `==` is always "are the stored bits equal?". A primitive's bits are its value; a reference's bits are an address. So `==` is value equality for primitives and identity (same object) for references. There is no third behavior.

`==` between types that can never be the same object does not compile: `Integer == String` gives `incomparable types: Integer and String`.

*Concrete bite.* `a == b` being `false` for two identical-looking arrays is the trap. On references, `==` cannot see contents, only identity.

*Non-example: `.equals` on arrays.* The usual advice is "compare contents with `.equals`". For arrays, that advice fails:

```java run
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] a = {1, 2, 3};
        int[] b = {1, 2, 3};
        System.out.println(a.equals(b));
        System.out.println(Arrays.equals(a, b));
    }
}
```

**Output:**
```
false
true
```

An array's `.equals` is the one every object starts with, from the class `Object`. It returns `true` only when both sides are the same object <abbr title="java.lang.Object.equals(Object), Java SE 21 API">[6]</abbr>. Your own classes start the same way: two `new Box(7)` objects are not `.equals` until the class defines what "equal" means. [equals & hashCode](/synapse/programming-languages/java/core-libraries/equals-and-hashcode) shows how. For arrays, compare contents with `Arrays.equals`.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Use `==` for primitives and for deliberate "same object?" checks; never use it to compare the *contents* of two objects. For contents, use `.equals` on classes that define it (`String`, `Integer`), and `Arrays.equals` on arrays.

The cost of forgetting is a comparison that's `false` for equal-meaning objects, or, as the next sections show, `true` by accident.

</div>

---

## 3. `.equals` and the Integer cache trap

Every primitive type has a matching **wrapper class**: an object that holds one value. `Integer` wraps an `int`, `Double` a `double`, `Boolean` a `boolean`. Java converts between them automatically:

- **boxing** turns an `int` into an `Integer` (`Integer a = 127;`) <abbr title="The Java Language Specification, Java SE 21, §5.1.7">[7]</abbr>;
- **unboxing** turns an `Integer` back into an `int` <abbr title="The Java Language Specification, Java SE 21, §5.1.8">[8]</abbr>.

`.equals` is a *method* an object defines to compare by **meaning**. For `Integer`, it compares the wrapped numbers. The danger is that boxing small numbers reuses cached objects, so `==` *accidentally* agrees with `.equals` — until it doesn't.

```java run
public class Main {
    public static void main(String[] args) {
        Integer a = 127, b = 127;   // small: from the shared cache
        Integer c = 128, d = 128;   // outside the cache: distinct objects
        System.out.println(a == b);
        System.out.println(c == d);
        System.out.println(c.equals(d));
        int e = 128, f = 128;       // primitives: compared by value
        System.out.println(e == f);
    }
}
```

**Output:**
```
true
false
true
true
```

**Analysis.**

- `Integer a = 127` boxes through a cache of `Integer` objects for −128..127, so `a` and `b` are the *same* cached object, and `a == b` is `true`.
- `128` is outside that cache. Here `c` and `d` boxed to *two distinct* objects, so `c == d` is `false`, while `c.equals(d)`, comparing the wrapped values, is `true`.
- The primitives `e` and `f` hold `128` directly, so `e == f` compares values: `true`.

The `Integer` `==` flipped from `true` to `false` between `127` and `128`.

**Intuition.**
*Mechanism.* `Integer` is a reference type, so `==` compares object identity. Boxing a value in −128..127 always gives the same object <abbr title="The Java Language Specification, Java SE 21, §5.1.7">[7]</abbr> <abbr title="java.lang.Integer.valueOf(int), Java SE 21 API">[9]</abbr>. Beyond that range the JVM *may* reuse objects, and by default does not <abbr title="java.lang.Integer.valueOf(int), Java SE 21 API">[9]</abbr>. So `==` is *coincidentally* true for small values, and false for larger ones on this JVM.

Mix an `Integer` with an `int`, and `==` unboxes the `Integer` and compares numbers <abbr title="The Java Language Specification, Java SE 21, §15.21.1">[10]</abbr>: `Integer c = 128; int e = 128; c == e` is `true`.

*Concrete bite.* A test that passes with `127` and fails with `128` is the signature of code that used `==` for object equality. The cache makes the bug invisible in small-number tests and live in production.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Compare wrapper objects with `.equals`; reserve `==` for primitives and identity.

The cost is vigilance. Boxing hides the boundary, so a passing small-value `==` test proves nothing. `.equals` is the comparison that means "same value" for objects. The String pool, next, is the same mechanism.

</div>

---

## 4. The String pool

`String` is a reference type too, so `==` on strings is identity. But Java **interns** string *literals*: identical literals share one pooled object <abbr title="The Java Language Specification, Java SE 21, §3.10.5">[11]</abbr>. That makes `==` *look* right for literals and wrong for everything else.

```java run
public class Main {
    public static void main(String[] args) {
        String a = "hello";
        String b = "hello";
        String c = new String("hello");
        System.out.println(a == b);
        System.out.println(a == c);
        System.out.println(a.equals(c));
    }
}
```

**Output:**
```
true
false
true
```

**Analysis.** `a` and `b` are the same literal `"hello"`, which the pool stores once. So `a == b` is `true`, *by interning, not by content comparison*. `new String("hello")` forces a separate object, so `a == c` is `false`, even though `a.equals(c)` (comparing characters) is `true`. This is the mechanism behind the [Strings](/synapse/programming-languages/java/first-steps/strings-the-basics) teaser: `==` on strings is identity, and the pool makes literals share identity.

**Intuition.**
*Mechanism.* Literals, and more generally the values of compile-time **constant expressions**, are interned into a shared pool, so equal ones are the same object <abbr title="The Java Language Specification, Java SE 21, §3.10.5">[11]</abbr>. A string built at run time is a fresh object: `new String(…)`, user input, or `+` with a variable.

*Concrete bite.* A string computed from a variable misses the pool, even when its characters match a literal:

```java run
public class Main {
    public static void main(String[] args) {
        String part = "ab";
        String computed = part + "c";
        String literal = "abc";
        System.out.println(computed == literal);
        System.out.println(computed.equals(literal));
    }
}
```

**Output:**
```
false
true
```

`computed` spells `abc`, but it was built at run time from the variable `part`, so it is a new object. A program that compares typed-in or computed strings with `==` rejects correct matches.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Compare string contents with `.equals` (or `.equalsIgnoreCase`); never `==`.

The cost of the pool is that `==` passes in quick literal tests and fails on real strings. It is the Integer cache's trap in a different form, with the same lesson: `==` is identity, `.equals` is meaning.

</div>

---

## 5. `null` and `NullPointerException`

A reference can point at *no object*: the value `null` <abbr title="The Java Language Specification, Java SE 21, §4.3.1">[1]</abbr>. That is legal to hold and print. But the moment you try to *use* the object it points to (call a method, read a field), there is no object, and the JVM throws `NullPointerException`.

```java run
public class Main {
    public static void main(String[] args) {
        String s = null;
        System.out.println(s);
        System.out.println(s.length());
    }
}
```

**Output** *(prints `null`, then throws):*
```
null
Exception in thread "main" java.lang.NullPointerException: Cannot invoke "String.length()" because "<local1>" is null
```

**Analysis.** `System.out.println(s)` printed `null`: `println` handles a null reference by writing the text "null". But `s.length()` tried to *follow* the reference to call a method, and there was no object to call it on. So the JVM threw `NullPointerException`.

Since Java 14 the message names what was null and what you tried to do <abbr title="JEP 358: Helpful NullPointerExceptions (JDK 14)">[12]</abbr>. The variable shows as `<local1>` because the Run button compiles without local-variable names. Compile with `javac -g` and the message says `because "s" is null`.

**Intuition.**
*Mechanism.* `null` is the absence of an object: a reference holding no address. Reading or printing the *reference* is fine. **Dereferencing** it (`.method()`, `.field`) requires an object that isn't there, which is the `NullPointerException`.

*Concrete bite.* The `null` line works, the `s.length()` line throws: the boundary is *use*. Fields of a reference type start as `null`, as do the slots of a new object array and many "not found" results. So any object you didn't definitely set could be `null`, and the first method call on it crashes.

*Non-example: an NPE with no dot in sight.* Unboxing is a hidden method call. Store a `null` `Integer` into an `int`, and the JVM must call `intValue()` on nothing <abbr title="The Java Language Specification, Java SE 21, §5.1.8">[8]</abbr>:

```java run
public class Main {
    public static void main(String[] args) {
        Integer count = null;
        System.out.println("before");
        int n = count;
        System.out.println(n);
    }
}
```

**Output** *(prints `before`, then a thrown exception):*
```
before
Exception in thread "main" java.lang.NullPointerException: Cannot invoke "java.lang.Integer.intValue()" because "<local1>" is null
```

Line 5, `int n = count;`, has no `.` in it, yet the message names `Integer.intValue()`. When an NPE points at a line with no method call, look for an `Integer`, `Double` or `Boolean` being used as a number or a `boolean`.

Comparing with `.equals` has the same edge. `"hi".equals(s)` returns `false` when `s` is `null`, but `s.equals("hi")` throws. `java.util.Objects.equals(a, b)` is safe on either side <abbr title="java.util.Objects.equals(Object, Object), Java SE 21 API">[13]</abbr>.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Guard a reference before dereferencing when it might be `null`: `if (s != null && s.length() > 0)`. The [short-circuit `&&`](/synapse/programming-languages/java/control-flow/booleans-and-logic) skips the right side when `s` is `null`.

The cost of `null` is constant vigilance and the most common crash in Java. The typed alternative, which makes "might be absent" visible in the type, is `Optional`, in [Modern Java Idioms](/synapse/programming-languages/java/advanced/modern-java-idioms).

</div>

---

## 6. When an object becomes unreachable

Java has no statement that deletes an object. Objects are "never explicitly deallocated" <abbr title="The Java Virtual Machine Specification, Java SE 21, §2.5.3">[3]</abbr>. The **garbage collector** reclaims the heap memory of objects the program can no longer reach.

An object is **reachable** while some running code can still get to it through a chain of references <abbr title="The Java Language Specification, Java SE 21, §12.6.1">[14]</abbr>. It becomes unreachable when the last such reference is gone:

- the variable is pointed at another object (`a = new Counter();`);
- the variable is set to `null`;
- the method holding the only local reference returns.

```java run
class Counter {
    int count;
    void increment() { count++; }
}

public class Main {
    public static void main(String[] args) {
        Counter a = new Counter();
        a.increment();
        Counter keep = a;
        a = new Counter();
        System.out.println(a.count + " " + keep.count);
    }
}
```

**Output:**
```
0 1
```

```d2
direction: right

stack: "Stack" {
  a: "Counter a" { shape: rectangle }
  keep: "Counter keep" { shape: rectangle }
}

heap: "Heap" {
  first: "Counter\ncount = 1\n(reachable through keep)" { shape: rectangle }
  second: "Counter\ncount = 0" { shape: rectangle }
}

stack.a -> heap.second
stack.keep -> heap.first
```

**Analysis.** `a = new Counter()` pointed `a` at a second object, with `count` `0`. The first object survived, because `keep` still refers to it (`count` `1`). Delete the line `Counter keep = a;`, and after the reassignment nothing refers to the first counter. It becomes unreachable, and the program can never read it again.

**Intuition.**
*Mechanism.* Reachability is about references, not about variables going quiet. As long as one live reference leads to an object, it stays. When none does, the garbage collector *may* reclaim it. The specification fixes no moment, and a small program may end before any collection runs <abbr title="The Java Virtual Machine Specification, Java SE 21, §2.5.3">[3]</abbr>.

*Concrete bite.* The reverse is the real-world bug. An object stays alive as long as *anything* refers to it, such as a forgotten entry in a long-lived `static` list. Such an object is never collected, however useless it has become. That is a memory leak, in a language with a garbage collector.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Let objects go by letting references go: keep variables in the smallest scope, and remove entries from long-lived collections when you are done with them. Never rely on *when* an object is collected.

The cost of automatic memory management is that you do not control the timing. The benefit is that there is no "use after delete" bug: an object you can still reach is never reclaimed.

</div>

---

## 7. Mental-model summary

| Principle | Consequence |
|---|---|
| A variable holds a value (primitive) or an address (reference) | `=` copies the value or the address, never the heap object |
| Locals live in stack frames; objects and arrays live on the heap | Two references can point at one heap object |
| `==` compares the stored bits | Value equality for primitives; identity (same object) for references |
| `.equals` compares meaning, where the class defines it | Use it for `String` and wrappers; arrays and new classes start with identity — use `Arrays.equals` |
| Boxing wraps a primitive in an object; unboxing unwraps it | `Integer == int` compares numbers; a `null` `Integer` unboxed throws |
| The Integer cache (−128..127) and the String pool share objects | `==` is *accidentally* true for small Integers and pooled literals, false otherwise |
| `null` is a reference to no object; dereferencing it throws | Printing `null` is fine; `null.method()` is a `NullPointerException` |
| An object with no live reference to it is unreachable | The garbage collector may reclaim it, at no fixed time; a lingering reference keeps it alive |

## 8. Gotcha checklist

<div style="border-left:4px solid #da5233;background:rgba(218,82,51,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

| Symptom | Likely cause | Fix |
|---|---|---|
| Two objects with equal contents compare `false` with `==` | `==` is identity on references | use `.equals` for contents |
| `a.equals(b)` is `false` for two arrays with the same elements | arrays keep `Object`'s identity `.equals` | `Arrays.equals(a, b)` |
| `.equals` is `false` for two objects of your own class | the class does not define `.equals` | define it ([equals & hashCode](/synapse/programming-languages/java/core-libraries/equals-and-hashcode)) |
| An `Integer` or `String` `==` test passes for small values and fails for others | the Integer cache or the String pool | switch to `.equals` |
| `incomparable types: Integer and String` | `==` between types that can never be the same object | compare values of one type |
| `NullPointerException: Cannot invoke "…" because "…" is null` | a method called on a `null` reference | guard with `x != null &&`, or make sure it is set |
| `Cannot invoke "java.lang.Integer.intValue()"` on a line with no method call | a `null` `Integer` unboxed to `int` | check for `null` first, or use `int` when a value is always present |
| `because "<local1>" is null` | the class was compiled without local-variable names | count locals, or compile with `javac -g` to see the name |
| `s.equals("hi")` throws | `s` is `null` | `"hi".equals(s)` or `Objects.equals(s, "hi")` |
| A method changed your object (or array) through a parameter | the reference was copied, and the object shared | pass a copy to protect the original |
| Memory grows though the objects are no longer needed | something still refers to them, such as a `static` list | remove the reference |

</div>

---

## ✅ Check yourself

One check per objective. Answer before you open anything.

```quiz
{"prompt": "int[] a = {1, 2, 3}; int[] b = a; b[0] = 99; — what does System.out.println(a[0]) print?", "options": ["1", "99", "It does not compile"], "answer": "99"}
```

```quiz
{"prompt": "Integer r = 200, s = 200; — what do r == s and r.equals(s) print, in that order, on JDK 21 with default settings?", "options": ["true true", "false false", "false true"], "answer": "false true"}
```

```quiz
{"prompt": "int[] a = {1, 2}; int[] b = {1, 2}; — what does a.equals(b) print?", "options": ["false", "true", "It does not compile"], "answer": "false"}
```

```quiz
{"prompt": "Integer count = null; then int n = count; — what happens?", "options": ["n is 0", "It does not compile", "NullPointerException at int n = count;"], "answer": "NullPointerException at int n = count;"}
```

```quiz
{"prompt": "Counter a = new Counter(); a = new Counter(); — nothing else refers to the first Counter. What is true of it?", "options": ["It is unreachable, and the garbage collector may reclaim it", "It is deleted at once", "It stays alive until main ends"], "answer": "It is unreachable, and the garbage collector may reclaim it"}
```

<details>
<summary>The 🧪 box below: <code>p == q</code> for <code>100</code>, <code>r == s</code> and <code>r.equals(s)</code> for <code>200</code>, <code>"ab" + "c" == "abc"</code>, <code>z + "!"</code>, and <code>z.toUpperCase()</code>.</summary>

- `p == q` with `100`: `true`. Both boxed values come from the cache.
- `r == s` with `200`: `false`, and `r.equals(s)`: `true`. `200` is outside the cache.
- `x == y` for `"ab" + "c"` and `"abc"`: `true`. `"ab" + "c"` is a constant expression, so it is interned like a literal <abbr title="The Java Language Specification, Java SE 21, §3.10.5">[11]</abbr>. Built from a variable, as in §4, it would be `false`.
- `z + "!"` with `z` `null`: prints `null!`. String concatenation writes a `null` reference as the text `null`.
- `z.toUpperCase()`: throws `NullPointerException: Cannot invoke "String.toUpperCase()" because "<local5>" is null`. The `5` counts the locals of a `main` that declares `p`, `q`, `r`, `s` and `z`, in that order.

</details>

---

## 📚 Sources

1. *The Java Language Specification, Java SE 21*, §4.3.1 "Objects" ("The reference values … are pointers to these objects, and a special null reference") — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-4.html#jls-4.3.1>
2. *The Java Virtual Machine Specification, Java SE 21*, §2.5.2 "Java Virtual Machine Stacks" — <https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-2.html#jvms-2.5.2>
3. *The Java Virtual Machine Specification, Java SE 21*, §2.5.3 "Heap" (reclaimed by a garbage collector; "objects are never explicitly deallocated") — <https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-2.html#jvms-2.5.3>
4. *The Java Virtual Machine Specification, Java SE 21*, §2.7 "Representation of Objects" — <https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-2.html#jvms-2.7>
5. *The Java Language Specification, Java SE 21*, §15.21.3 "Reference Equality Operators `==` and `!=`" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.21.3>
6. `java.lang.Object.equals(Object)`, Java SE 21 API — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Object.html#equals(java.lang.Object)>
7. *The Java Language Specification, Java SE 21*, §5.1.7 "Boxing Conversion" (−128 to 127: "It is always the case that a == b") — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-5.html#jls-5.1.7>
8. *The Java Language Specification, Java SE 21*, §5.1.8 "Unboxing Conversion" ("If r is null, unboxing conversion throws a NullPointerException") — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-5.html#jls-5.1.8>
9. `java.lang.Integer.valueOf(int)`, Java SE 21 API ("will always cache values in the range -128 to 127 … and may cache other values") — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Integer.html#valueOf(int)>
10. *The Java Language Specification, Java SE 21*, §15.21.1 "Numerical Equality Operators `==` and `!=`" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.21.1>
11. *The Java Language Specification, Java SE 21*, §3.10.5 "String Literals" (constant-expression strings are "interned") — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-3.html#jls-3.10.5>
12. JEP 358: Helpful NullPointerExceptions (JDK 14; local names need `javac -g`) — <https://openjdk.org/jeps/358>
13. `java.util.Objects.equals(Object, Object)`, Java SE 21 API — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Objects.html#equals(java.lang.Object,java.lang.Object)>
14. *The Java Language Specification, Java SE 21*, §12.6.1 "Implementing Finalization" ("A reachable object is any object that can be accessed in any potential continuing computation from any live thread") — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-12.html#jls-12.6.1>

---

<div style="border-left:4px solid #6d28d9;background:rgba(109,40,217,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

🧪 **Predict, then check.**

1. Predict each line: `Integer p = 100, q = 100; System.out.println(p == q);`, then `Integer r = 200, s = 200; System.out.println(r == s);`, then `System.out.println(r.equals(s));`.
2. For `String x = "ab" + "c";` and `String y = "abc";`, predict `x == y`. (Hint: is `"ab" + "c"` a compile-time constant?)
3. Predict what `String z = null; System.out.println(z + "!");` prints, and what `z.toUpperCase()` would do instead.

</div>

## Your Turn

Before you move on, check your understanding with the coach — explain the idea, apply it, weigh the trade-offs, then defend your reasoning.

<div class="concept-coach"></div>
