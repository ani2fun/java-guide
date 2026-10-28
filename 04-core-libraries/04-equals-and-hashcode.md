---
title: equals & hashCode
summary: The default equals and hashCode compare by identity, so two objects with equal values aren't "equal", and they misbehave in hash-based collections. Override equals to define value equality, but you MUST override hashCode to agree. Otherwise a HashSet or HashMap silently fails to find your object and stores duplicates. Covers the contract, how it breaks, the equals(Point) overload trap, the mutated-key trap and the Objects.hash fix, all with verified output.
prereqs: []
---

# equals & hashCode — the Contract Behind Hash Collections

Back in [References, Equality & the Object Model](/synapse/programming-languages/java/classes-and-objects/references-equality-and-the-object-model), you saw that `==` compares identity, while `.equals` compares meaning — *if* the class defines what "meaning" is. Out of the box, it doesn't. Every class inherits an `equals` that checks identity (is this the same object?), along with a `hashCode` that is based on identity too. That means two `Point(1, 2)` objects are *not* equal, and they misbehave in the [hash-based collections](/synapse/programming-languages/java/core-libraries/sets-and-maps) from the last lesson.

The fix is to override `equals` so that it compares values. But that fix comes with a trap, and the trap is the reason this lesson exists:

- if you override `equals`, you must also override `hashCode` to match;
- if you don't, `HashSet` and `HashMap` silently fail to find your objects — and happily let duplicates in.

Think of the two methods as a contract. Honoring one half without the other is worse than honoring neither.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **The core idea.**

- By default, `equals`/`hashCode` compare by **identity**, so value-equal objects aren't equal.
- Override `equals` to get value equality — but you **must override `hashCode` to match**.
- Break that contract, and `HashSet`/`HashMap` silently miss your objects and let duplicates in.

</div>

Every output below was produced by compiling and running the code on Java 25.

**You'll be able to:** predict what `==` and `equals` return for two objects, both with and without an `equals` override; write an `equals(Object)` with `@Override`, and explain why collections ignore an `equals(Point)`; state the `hashCode` contract, and predict what `contains` and `size` return on a `HashSet` when that contract is broken; write `hashCode` with `Objects.hash` from the same fields, and explain why changing a field of an object inside a `HashSet` loses it.

<div style="border-left:4px solid #15448e;background:rgba(21,68,142,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

📘 **How to read the Intuition boxes.** Each one is built in three moves:

1. **The mechanism** — what the compiler and the JVM *do*.
2. **A concrete bite** — a specific, runnable failure (often a real compiler error), shown so the trap is visible.
3. **The earned rule** — the decision heuristic, now justified rather than asserted, plus its cost.

</div>

---

## Table of contents

1. [Default `equals` is identity](#1-default-equals-is-identity)
2. [Overriding `equals` for value equality](#2-overriding-equals-for-value-equality)
3. [The `hashCode` contract](#3-the-hashcode-contract)
4. [Generating both correctly](#4-generating-both-correctly)
5. [Mental-model summary](#5-mental-model-summary)
6. [Gotcha checklist](#6-gotcha-checklist)
7. [Check yourself](#-check-yourself)
8. [Sources](#-sources)

---

## 1. Default `equals` is identity

If a class doesn't define its own `equals`, it inherits the one from `Object`. That version returns `true` only when both references point at *the same object* <abbr title="Java SE 25 API, Object.equals(Object)">[1]</abbr>. So two objects created separately are not equal, even when their fields are identical:

```java run
class Point {
    int x, y;
    Point(int x, int y) { this.x = x; this.y = y; }
}

public class Main {
    public static void main(String[] args) {
        Point a = new Point(1, 2);
        Point b = new Point(1, 2);
        System.out.println(a == b);
        System.out.println(a.equals(b));
    }
}
```

**Output:**
```
false
false
```

**Analysis.** `a == b` is `false` — no surprise, since these are two distinct objects. But `a.equals(b)` is `false` *too*. The inherited `equals` is an identity check, so by default `.equals` and `==` give the same answer. The class never said what it means for two points to be "equal", so Java falls back on the safest default: a thing equals only itself.

**Intuition.**
*Mechanism.* For non-`null` `x` and `y`, `Object.equals` returns `true` "if and only if `x` and `y` refer to the same object" <abbr title="Java SE 25 API, Object.equals(Object)">[1]</abbr>. So unless a class overrides it, "equal" simply means "the same object".

*Concrete bite.* That second `false` is the surprise, because most people expect `.equals` to compare contents. And it matters beyond your own calls, because the collections use `.equals` too. `List.contains` looks for an element `e` "such that `Objects.equals(o, e)`" <abbr title="Java SE 25 API, List.contains(Object)">[2]</abbr>, and `Set` membership and `Map` key lookups work the same way. So every one of them treats your two equal points as different.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Override `equals` when a class represents a *value* — a point, an amount of money, a name — and two instances with the same fields should count as equal. The default identity behavior is right only for objects whose identity *is* their meaning.

The cost is writing and maintaining the method. The payoff is that equality means what your domain says it means, not "same allocation".

</div>

---

## 2. Overriding `equals` for value equality

To define value equality, override `equals(Object o)`. The recipe has two steps: check that the argument is a `Point`, then compare the fields.

- `o instanceof Point` tests the type, and it returns `false` for `null`.
- `(Point) o` casts the argument, so you can reach its fields.

Later, in [Sealed Classes & Pattern Matching](/synapse/programming-languages/java/robust-oop/sealed-classes-and-pattern-matching), you'll meet pattern matching for `instanceof`, which fuses these two steps into one.

```java run
class Point {
    int x, y;
    Point(int x, int y) { this.x = x; this.y = y; }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Point)) return false;
        Point p = (Point) o;
        return x == p.x && y == p.y;
    }
}

public class Main {
    public static void main(String[] args) {
        Point a = new Point(1, 2);
        Point b = new Point(1, 2);
        System.out.println(a == b);
        System.out.println(a.equals(b));
    }
}
```

**Output:**
```
false
true
```

**Analysis.** Now `a.equals(b)` is `true`: the overridden method compared `x` and `y`, and they match. `a == b` is still `false`, because `==` checks identity, and these are still two separate objects. The two notions have now parted ways: `==` asks "same object?", while `.equals` asks "same value?".

The `@Override` **annotation** asks the compiler to confirm that this method really does override one from a supertype <abbr title="The Java Language Specification, Java SE 25, §9.6.4.4">[3]</abbr>. For `equals`, that means the parameter type must be `Object`.

**Intuition.**
*Mechanism.* Once you override `equals`, your comparison replaces the identity check everywhere `.equals(Object)` is called — including deep inside the collections. The `instanceof` guard returns `false` for `null` and for the wrong type. That satisfies the contract's rule that `x.equals(null)` returns `false` <abbr title="Java SE 25 API, Object.equals(Object)">[1]</abbr>. The contract also asks for a relation that is *reflexive*, *symmetric*, *transitive* and *consistent*. Comparing the same fields on both sides gives you all four.

*Concrete bite.* Here's a subtle slip: `public boolean equals(Point p)`, with a `Point` parameter instead of `Object`. This does *not* override `Object.equals` — it **overloads** it. The JLS calls out this exact mistake as the classic reason `@Override` exists <abbr title="The Java Language Specification, Java SE 25, §9.6.4.4">[3]</abbr>. Add `@Override`, and javac rejects it:

```java run
class Point {
    int x, y;
    Point(int x, int y) { this.x = x; this.y = y; }

    @Override
    public boolean equals(Point p) {
        return x == p.x && y == p.y;
    }
}

public class Main {
    public static void main(String[] args) {
        System.out.println(new Point(1, 2).equals(new Point(1, 2)));
    }
}
```

**Compiler error:**
```
Main.java:5: error: method does not override or implement a method from a supertype
    @Override
    ^
```

Leave out `@Override`, though, and the same class compiles — and the bug goes silent. This version even has a correct `hashCode`:

```java run
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

class Point {
    int x, y;
    Point(int x, int y) { this.x = x; this.y = y; }

    public boolean equals(Point p) {          // overloads; does not override
        return x == p.x && y == p.y;
    }

    @Override
    public int hashCode() {
        return Objects.hash(x, y);
    }
}

public class Main {
    public static void main(String[] args) {
        Point a = new Point(1, 2);
        Point b = new Point(1, 2);
        System.out.println(a.equals(b));
        Object o = b;
        System.out.println(a.equals(o));
        Set<Point> set = new HashSet<>();
        set.add(a);
        System.out.println(set.contains(b));
    }
}
```

**Output:**
```
true
false
false
```

**Analysis.** The compiler chooses an overload based on the argument's *declared* type:

- `a.equals(b)`: `b` is declared as `Point`, so this calls the new `equals(Point)`, which returns `true`.
- `a.equals(o)`: `o` is declared as `Object`, so this calls the inherited `equals(Object)`. That's the identity check, so it returns `false`.
- `HashSet` calls `equals(Object)`, so `contains(b)` is `false`, even though both hash codes match.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Override `equals(Object o)` — with that exact signature, plus `@Override` — and compare the fields that define value equality. Guard the type with `instanceof`.

The cost is some care with the signature and with the fields you include. The payoff is value semantics everywhere `.equals` is used — but only if you also fix `hashCode`, which is exactly what the next section insists on.

</div>

---

## 3. The `hashCode` contract

Here's the rule that makes or breaks hash collections <abbr title="Java SE 25 API, Object.hashCode()">[4]</abbr>:

- **If `a.equals(b)` is `true`, then `a.hashCode()` must equal `b.hashCode()`.**
- Unequal objects *may* share a hash code. Distinct codes just make hash tables faster.
- An object's hash code must stay the same for as long as the fields that `equals` uses stay the same.

The `Object.equals` documentation adds: "It is generally necessary to override the `hashCode` method whenever this method is overridden" <abbr title="Java SE 25 API, Object.equals(Object)">[1]</abbr>. Here's what happens if you ignore that advice. Override `equals` but keep the inherited, identity-based `hashCode`, and equal objects end up with *different* hash codes. A `HashSet` or `HashMap` then looks in the wrong bucket, and your object effectively vanishes.

```java run viz=hashmap:set
import java.util.HashSet;
import java.util.Set;

class Point {
    int x, y;
    Point(int x, int y) { this.x = x; this.y = y; }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Point)) return false;
        Point p = (Point) o;
        return x == p.x && y == p.y;
    }
    // hashCode NOT overridden — still identity-based
}

public class Main {
    public static void main(String[] args) {
        Set<Point> set = new HashSet<>();
        set.add(new Point(1, 2));
        System.out.println(set.contains(new Point(1, 2)));
        set.add(new Point(1, 2));
        System.out.println(set.size());
    }
}
```

**Output:**
```
false
2
```

```d2
direction: right

p1: "Point(1,2) — object A\nidentity hashCode → 7 (example)" {
  shape: oval
}
p2: "Point(1,2) — object B\nidentity hashCode → 42 (example)" {
  shape: oval
}
buckets: "HashSet buckets" {
  grid-rows: 4
  b0: "0:  (empty)"
  b1: "1:  (empty)"
  b2: "2:  B"
  b3: "3:  A"
}

p1 -> buckets.b3: "7 % 4 = 3"
p2 -> buckets.b2: "42 % 4 = 2"
```

**Analysis.** This code is broken in two visible ways:

- `contains(new Point(1, 2))` is `false`. The set computed the new point's identity hash code, went to *that* bucket, and didn't find the stored point — because the stored point lives in a different bucket.
- Adding a second equal point grew the size to `2`. The set put the newcomer in its own bucket and never noticed the duplicate.

The diagram shows why, using example numbers. Identity hash codes ignore the fields entirely, so value-equal points scatter into different buckets. Your `equals` never even gets consulted, because the set never looks in the right bucket.

**Intuition.**
*Mechanism.* A hash collection finds an object in two steps: first it hashes to a bucket, then it calls `.equals` within that bucket. If equal objects have unequal hash codes, step one sends them to different buckets, and step two never runs. Your `equals` is correct — it's just unreachable.

*Concrete bite.* That `false` and that `2` are the breakage: an element that is present reports as absent, and a duplicate slips in. Worse, the class *looks* right, because `equals` works fine on its own. It fails only inside hash collections, which makes this one of the hardest Java bugs to spot.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Whenever you override `equals`, override `hashCode` in the same change, so that equal objects always produce equal hashes. Never one without the other.

The cost is writing a second method. The cost of skipping it is a class that passes its `a.equals(b)` tests, yet silently corrupts every `HashSet` or `HashMap` it is used in.

</div>

---

## 4. Generating both correctly

The good news: you rarely need to write `hashCode` by hand. Two helpers do the heavy lifting:

- `Objects.hash(...)` builds a hash from the fields you pass, "as if all the input values were placed into an array" and hashed <abbr title="Java SE 25 API, Objects.hash(Object...)">[5]</abbr>;
- `Objects.equals(a, b)` compares two fields safely, even when either one may be `null`.

Pass exactly the fields that `equals` compares, and the contract holds.

```java run viz=hashmap:set
import java.util.HashSet;
import java.util.Set;
import java.util.Objects;

class Point {
    int x, y;
    Point(int x, int y) { this.x = x; this.y = y; }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Point)) return false;
        Point p = (Point) o;
        return x == p.x && y == p.y;
    }

    @Override
    public int hashCode() {
        return Objects.hash(x, y);
    }
}

public class Main {
    public static void main(String[] args) {
        Set<Point> set = new HashSet<>();
        set.add(new Point(1, 2));
        System.out.println(set.contains(new Point(1, 2)));
        set.add(new Point(1, 2));
        System.out.println(set.size());
    }
}
```

**Output:**
```
true
1
```

**Analysis.** Now that `hashCode` is computed from `x` and `y`, two equal points hash to the *same* bucket. So `contains` finds the stored point (`true`), and the duplicate is recognized and dropped (`size` stays `1`). Every link in the chain holds: equal points produce equal hashes, equal hashes lead to the same bucket, and `equals` confirms the match.

**Intuition.**
*Mechanism.* `Objects.hash(x, y)` turns the same field values into the same `int`, every time. `equals` then confirms the match within the bucket. The key is that both methods use the *same fields*. A field in `hashCode` but not in `equals` breaks the contract all over again: two objects can be equal, yet hash to different buckets. The reverse is safe but costly. A field in `equals` but not in `hashCode` keeps the contract, but it weakens the hash, so more unequal objects share a bucket.

*Concrete bite.* The contract also asks that a hash code stay put while the object is in use. Change a field that `hashCode` depends on after the object is already in a `HashSet`, and the set loses track of it <abbr title="Java SE 25 API, java.util.Set">[6]</abbr>:

```java run
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

class Point {
    int x, y;
    Point(int x, int y) { this.x = x; this.y = y; }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Point)) return false;
        Point p = (Point) o;
        return x == p.x && y == p.y;
    }

    @Override
    public int hashCode() {
        return Objects.hash(x, y);
    }
}

public class Main {
    public static void main(String[] args) {
        Set<Point> set = new HashSet<>();
        Point p = new Point(1, 2);
        set.add(p);
        p.x = 5;                                   // change a field used by hashCode
        System.out.println(set.contains(p));
        System.out.println(set.contains(new Point(1, 2)));
        System.out.println(set.size());
    }
}
```

**Output:**
```
false
false
1
```

**Analysis.** The point still sits in the bucket for `(1, 2)`, but it now hashes as `(5, 2)`:

- `contains(p)` looked in the bucket for `(5, 2)` and found nothing there.
- `contains(new Point(1, 2))` found the right bucket, but `equals` reported that the stored point is now `(5, 2)`.
- `size()` is still `1`. The object is in the set — it's just unreachable by lookup.

This isn't a bug in `HashSet`. The `Set` API warns that its behavior "is not specified if the value of an object is changed in a manner that affects equals comparisons" <abbr title="Java SE 25 API, java.util.Set">[6]</abbr>, and the `Map` API says the same about keys <abbr title="Java SE 25 API, java.util.Map">[7]</abbr>.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Generate `equals` and `hashCode` together, from the same fields — with `Objects.equals` and `Objects.hash`, or your IDE's generator — and keep them in sync whenever the fields change. Never change those fields while the object is in a hash collection. Better still, make them `final`.

The cost is boilerplate that has to stay consistent. The payoff is correctness in every hash collection. And a [`record`](/synapse/programming-languages/java/core-libraries/enums-and-records) removes the cost entirely: it generates `equals`, `hashCode` and `toString` from its components, which are `final`.

</div>

---

## 5. Mental-model summary

| Principle | Consequence |
|---|---|
| The default `equals`/`hashCode` are identity-based | Value-equal objects compare `false` and don't dedup in collections |
| Override `equals(Object)` (with `@Override`) for value equality | `equals(Point)` only overloads — collections ignore it; `==` stays identity |
| Contract: equal objects must have equal hash codes | `equals` without `hashCode` breaks `HashSet`/`HashMap` |
| A hash collection hashes to a bucket, then `.equals` within it | Wrong hash → wrong bucket → present object reported absent, duplicates added |
| Generate both from the same fields (`Objects.hash`/`equals`) | Consistent hash + equality; a `record` generates them for free |
| A hash code must not change while the object is in a hash collection | Changing a hashed field loses the object; keep those fields `final` |

## 6. Gotcha checklist

<div style="border-left:4px solid #da5233;background:rgba(218,82,51,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

| Symptom | Likely cause | Fix |
|---|---|---|
| `a.equals(b)` is `false` for two objects with the same fields | the class does not override `equals` | override `equals(Object)` |
| A `HashSet` or `HashMap` can't find an object it contains | `equals` overridden, `hashCode` not | add a `hashCode` over the same fields |
| Duplicates appear in a `Set` of "equal" objects | the same inconsistent `hashCode` | override it to match `equals` |
| `method does not override or implement a method from a supertype` on `equals` | the parameter type is not `Object` | declare `equals(Object o)` |
| Your `equals` works directly but collections ignore it | `equals(YourType)` overloads instead of overriding | `equals(Object o)` with `@Override` |
| Equal objects hash differently | `equals` and `hashCode` use different fields | use the *same* fields in both |
| An object in a `HashSet` is no longer found after an update | a field used by `hashCode` changed while it was in the set | never change those fields; remove, change, re-add; or make them `final` |
| Lots of boilerplate to keep in sync | hand-written methods | `Objects.equals`/`Objects.hash`, an IDE generator, or a `record` |

</div>

---

## ✅ Check yourself

One check per objective. Answer before you open anything.

```quiz
{"prompt": "class Point has fields x, y and no equals override. What do new Point(1, 2) == new Point(1, 2) and new Point(1, 2).equals(new Point(1, 2)) print?", "options": ["false true", "false false", "true true"], "answer": "false false"}
```

```quiz
{"prompt": "Point declares public boolean equals(Point p) with no @Override, and a correct hashCode. set.add(new Point(1, 2)); — what does set.contains(new Point(1, 2)) print for a HashSet?", "options": ["false", "true", "It does not compile"], "answer": "false"}
```

```quiz
{"prompt": "Point overrides equals(Object) but not hashCode. After set.add(new Point(1, 2)) twice on a HashSet, what is set.size()?", "options": ["1", "It throws", "2"], "answer": "2"}
```

```quiz
{"prompt": "Point has matching equals and hashCode over x and y. p is added to a HashSet, then p.x changes. What does set.contains(p) print?", "options": ["false", "true", "It throws ConcurrentModificationException"], "answer": "false"}
```

<details>
<summary>The 🧪 box below: the four predictions.</summary>

- `new Point(1,2).equals(new Point(1,2))` with no overrides: `false` — the §1 proof.
- With `equals` but no `hashCode`: `contains` is `false` and `size()` is `2` — the §3 proof.
- With `hashCode` from `Objects.hash(x, y)`: `contains` is `true` and `size()` is `1` — the §4 proof.
- With `equals(Point)` instead of `equals(Object)`: the set still calls `equals(Object)`, which is the inherited identity check. Matching hash codes lead the set to the right bucket, but identity says "different", so `contains` is `false` — the §2 proof.

</details>

---

## 📚 Sources

1. `java.lang.Object.equals(Object)`, Java SE 25 API (identity; the equivalence-relation contract; "It is generally necessary to override the hashCode method") — <https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html#equals(java.lang.Object)>
2. `java.util.List.contains(Object)`, Java SE 25 API ("such that `Objects.equals(o, e)`") — <https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html#contains(java.lang.Object)>
3. *The Java Language Specification, Java SE 25*, §9.6.4.4 "@Override" (the `equals(Foo)` example) — <https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html#jls-9.6.4.4>
4. `java.lang.Object.hashCode()`, Java SE 25 API (the general contract of `hashCode`) — <https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html#hashCode()>
5. `java.util.Objects.hash(Object...)` and `Objects.equals(Object, Object)`, Java SE 25 API — <https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Objects.html#hash(java.lang.Object...)>
6. `java.util.Set`, Java SE 25 API ("Great care must be exercised if mutable objects are used as set elements") — <https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Set.html>
7. `java.util.Map`, Java SE 25 API ("great care must be exercised if mutable objects are used as map keys") — <https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Map.html>

---

<div style="border-left:4px solid #6d28d9;background:rgba(109,40,217,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

🧪 **Predict, then check.**

1. For the §1 `Point` (no overrides), predict `new Point(1,2).equals(new Point(1,2))`.
2. Add a correct `equals` but **no** `hashCode`. Put one `Point(1,2)` in a `HashSet`, then predict both `contains(new Point(1,2))` and `size()` after you add a second equal point.
3. Add `hashCode` via `Objects.hash(x, y)`, and predict the same two values again.
4. Explain why overriding `equals` with a `Point` parameter (instead of `Object`) would leave the set broken, even *with* a `hashCode`.

</div>

## Your Turn

Before you move on, check your understanding with the coach — explain the idea, apply it, weigh the trade-offs, then defend your reasoning.

<div class="concept-coach"></div>
