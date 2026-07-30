---
title: References, Equality & the Object Model
summary: A variable is either a primitive that holds its value or a reference that holds the address of a heap object — and that split governs assignment, aliasing, equality, and null. == compares what the variable holds (a value, or an address); .equals compares meaning. The Integer cache and String pool make == deceptively "work"; dereferencing null throws. The flagship chapter, with a stack/heap picture and every trap shown live.
prereqs: []
---

# References, Equality & the Object Model

This is the chapter the last several have been building toward. Every variable in Java is one of exactly two things: a **primitive**, which holds its value directly, or a **reference**, which holds the *address* of an object that lives on the heap. That single distinction is the key to nearly every Java surprise you've met — why assigning an array shares it but assigning an `int` copies it, why `==` sometimes lies, why a method can change your object but not your variable, and why `null` is the most common crash in the language. Get this picture right and the rules stop being arbitrary; they become consequences.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **The core idea.**

- Every variable is either a **primitive** that holds its value or a **reference** that holds a heap object's **address**.
- That split governs assignment, aliasing, equality, and `null`.
- Get the picture right and the rules stop being arbitrary — they become consequences.

</div>

This is the deep pass of [primitives](/synapse/programming-languages/java/first-steps/variables-and-primitive-types), [`==` vs `.equals` on strings](/synapse/programming-languages/java/first-steps/strings-the-basics), [pass-by-value](/synapse/programming-languages/java/control-flow/methods), and [aliasing](/synapse/programming-languages/java/classes-and-objects/classes-and-objects). Every output below was produced by compiling and running the code.

<div style="border-left:4px solid #15448e;background:rgba(21,68,142,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

📘 **How to read the Intuition boxes.** Each one is built in three moves:

1. **The mechanism** — what the compiler and the JVM are *actually doing*.
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
6. [Mental-model summary](#6-mental-model-summary)
7. [Gotcha checklist](#7-gotcha-checklist)

---

## 1. Two kinds of variable: values and references

A primitive variable *is* its value — the bits sit in the variable. A reference variable holds the *address* of an object stored elsewhere (on the **heap**); the object is not in the variable. Assignment copies whatever the variable holds — and that is the whole story:

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

**Analysis.** `int y = x` copied the *value* `5` into `y`, so changing `y` to `99` left `x` at `5` — two independent values. But `int[] b = a` copied the *reference*: `a` and `b` now hold the same address and point at the **one** array, so `b[0] = 99` changed the array both see — hence `99 99`. The diagram is the model: primitives hold values in the stack; references hold addresses pointing into the heap, and two references can point at the same object.

**Intuition.**
*Mechanism.* A variable stores a fixed-size slot of bits. For a primitive, those bits are the value. For a reference type (arrays, `String`, every class), they are the *address* of a heap object. `=` copies the slot — the value, or the address — never the heap object itself.

*Concrete bite.* The two output lines are the contrast: copy a primitive and the copies are independent (`5 99`); copy a reference and both names share one object (`99 99`). This is the same fact behind [pass-by-value of references](/synapse/programming-languages/java/control-flow/methods) — a method copies the *reference*, so it can mutate the shared object.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Always ask "is this a value or a reference?" — it tells you whether `=` (or a method call) makes an independent copy or shares an object. The cost of references is the sharing surprise; the benefit is efficiency — passing a million-element array copies one address, not a million ints — and it is *the* distinction the rest of this chapter's traps fall out of.

</div>

---

## 2. `==` compares what the variable holds

`==` looks at the bits in the two variables. For primitives, those bits are values, so `==` compares values. For references, those bits are *addresses*, so `==` asks "same object?" — **identity**, not contents.

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

**Analysis.** `a == b` is `false` even though both arrays hold `{1, 2, 3}` — they are *different objects* at different addresses, and `==` compares addresses. `a == c` is `true` because `c` was assigned `a`, so they share one address. And `a[0] == b[0]` is `true` because those are `int`s — `==` on primitives compares values. Same operator, two meanings, decided by whether the operands are references or primitives.

**Intuition.**
*Mechanism.* `==` is always "are the stored bits equal?" The bits differ in kind: a primitive's bits are its value, a reference's bits are an address. So `==` is value-equality for primitives and identity (same-object) for references — there is no third behavior.

*Concrete bite.* `a == b` being `false` for two identical-looking arrays is the trap: on references, `==` cannot see contents, only identity. Two objects that *mean* the same thing are still `!=` unless they are literally the same object.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Use `==` for primitives and for deliberate "same object?" checks; never use it to compare the *contents* of two objects. The cost of forgetting is a comparison that's `false` for equal-meaning objects (or, as the next sections show, `true` by accident) — for meaning, you need `.equals`.

</div>

---

## 3. `.equals` and the Integer cache trap

`.equals` is a *method* an object defines to compare by **meaning**. For `Integer`, it compares the wrapped numbers. The danger is that autoboxing small numbers reuses cached objects, so `==` *accidentally* agrees with `.equals` — until it doesn't.

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

**Analysis.** `Integer a = 127` autoboxes through a cache the JVM keeps for −128..127, so `a` and `b` are the *same* cached object and `a == b` is `true`. `128` is outside that cache, so `c` and `d` box to *two distinct* objects and `c == d` is `false` — while `c.equals(d)`, comparing the wrapped values, is `true`. The primitives `e` and `f` hold `128` directly, so `e == f` compares values → `true`. The `Integer` `==` flipped from `true` to `false` between `127` and `128`.

**Intuition.**
*Mechanism.* `Integer` is a reference type, so `==` compares object identity. Autoboxing (`Integer a = 127`) routes small values through `Integer.valueOf`, which returns shared cached objects for −128..127 and fresh objects beyond — making `==` *coincidentally* true for small values and false for larger ones.

*Concrete bite.* A test that passes with `127` and fails with `128` is the signature of code that used `==` for object equality. The cache makes the bug invisible in small-number tests and live in production.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Compare wrapper objects (and all objects) with `.equals`; reserve `==` for primitives and identity. The cost is vigilance: autoboxing hides the boundary, so a passing small-value `==` test proves nothing — `.equals` is the only comparison that means "same value" for objects. (This is the same mechanism as the String pool, next, and the `equals`/`hashCode` contract in Tutorial 19.)

</div>

---

## 4. The String pool

`String` is a reference type too, so `==` on strings is identity. But Java **interns** string *literals* — identical literals share one pooled object — which makes `==` *look* right for literals and wrong for everything else.

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

**Analysis.** `a` and `b` are the same literal `"hello"`, which the pool stores once, so `a == b` is `true` — *by interning, not by content comparison*. `new String("hello")` forces a separate object, so `a == c` is `false`, even though `a.equals(c)` (comparing characters) is `true`. This is the mechanism behind the [Tutorial 4 teaser](/synapse/programming-languages/java/first-steps/strings-the-basics): `==` on strings is identity, and the pool just makes literals share identity.

**Intuition.**
*Mechanism.* The compiler interns string literals into a shared pool, so equal literals are the same object. Anything *not* a compile-time literal — `new String(...)`, user input, concatenation of variables — produces a fresh object, so `==` against it is `false`.

*Concrete bite.* `a == c` is `false` for two strings that both spell `"hello"`. A program comparing typed-in or computed strings with `==` rejects correct matches at random, because only literals are pooled.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Compare string contents with `.equals` (or `.equalsIgnoreCase`); never `==`. The cost of the pool is that `==` passes in quick literal tests and fails on real strings — the Integer cache's trap wearing a different hat, and the same lesson: `==` is identity, `.equals` is meaning.

</div>

---

## 5. `null` and `NullPointerException`

A reference can point at *no object*: the value `null`. That is legal to hold and print — but the moment you try to *use* the object it points to (call a method, read a field), there is no object, and the JVM throws `NullPointerException`.

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

**Analysis.** `System.out.println(s)` printed `null` — `println` handles a null reference by writing the text "null". But `s.length()` tried to *follow* the reference to call a method, and there was no object to call it on, so the JVM threw `NullPointerException`. Modern Java's message even names what was null and what you tried to do — here `"String.length()"` on a null variable (shown as `<local1>` because the sandbox compiles without local-variable names; with debug info it would say `"s"`).

**Intuition.**
*Mechanism.* `null` is the absence of an object — a reference holding no address. Reading or printing the *reference* is fine; **dereferencing** it (`.method()`, `.field`) requires an object that isn't there, which is the `NullPointerException`.

*Concrete bite.* The `null` line works, the `s.length()` line throws — the boundary is *use*. A reference defaults to `null` (uninitialized object fields, an array of objects, a lookup that found nothing), so any object you didn't definitely set could be `null`, and the first method call on it crashes.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Guard a reference before dereferencing when it might be `null` — `if (s != null && s.length() > 0)`, leaning on the [short-circuit `&&`](/synapse/programming-languages/java/control-flow/booleans-and-logic) so the right side is skipped when `s` is null. The cost of `null` is constant vigilance and the most common crash in Java; the modern, typed alternative — making "might be absent" visible in the type — is `Optional`, in Tutorial 28.

</div>

---

## 6. Mental-model summary

| Principle | Consequence |
|---|---|
| A variable holds a value (primitive) or an address (reference) | `=` copies the value or the address, never the heap object |
| `==` compares the stored bits | Value-equality for primitives; identity (same object) for references |
| `.equals` compares meaning | Use it for objects; `==` only for primitives and deliberate identity |
| The Integer cache (−128..127) and String pool share objects | `==` is *accidentally* true for small Integers / pooled literals, false otherwise |
| `null` is a reference to no object; dereferencing it throws | Printing `null` is fine; `null.method()` is a `NullPointerException` |

## 7. Gotcha checklist

<div style="border-left:4px solid #da5233;background:rgba(218,82,51,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

- **Two objects with equal contents compare `!=` →** `==` is identity on references; use `.equals` for contents.
- **An `Integer`/`String` `==` test passes for small values and fails for big ones →** the Integer cache / String pool; switch to `.equals`.
- **A method changed your object (or array) through a parameter →** references are shared by value; pass a copy to protect the original.
- **`NullPointerException: Cannot invoke "…" because "…" is null` →** you dereferenced a `null` reference; guard with `x != null` first (short-circuit `&&`).
- **An assignment "shared" data you expected to copy →** it was a reference; clone/copy the object explicitly if you need independence.

</div>

---

<div style="border-left:4px solid #6d28d9;background:rgba(109,40,217,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

🧪 **Predict, then check.** Predict each line: `Integer p = 100, q = 100; System.out.println(p == q);` then `Integer r = 200, s = 200; System.out.println(r == s);` then `System.out.println(r.equals(s));`. Next, for `String x = "ab" + "c";` and `String y = "abc";`, predict `x == y` (hint: is `"ab" + "c"` a compile-time constant?). Finally, predict what `String z = null; System.out.println(z + "!");` prints — and what `z.toUpperCase()` would do instead.

</div>

## Your Turn

Before you move on, check your understanding with the coach — explain the idea, apply it, weigh the trade-offs, then defend your reasoning.

<div class="concept-coach"></div>
