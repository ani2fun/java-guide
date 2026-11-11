---
title: "Why Does 0.1 + 0.2 = 0.30000000000000004 in Java?! And How Big Banks Actually Count Money"
summary: "A story-driven deep dive with three interactive labs. Why a double can store 0.5 exactly but never 0.1, what the 64 bits of a double hold, and the exact rounding steps that turn 0.1 + 0.2 into 0.30000000000000004. Then how real payment systems keep every cent: long cents, BigDecimal built from Strings, and banker's rounding (HALF_EVEN), plus the traps inside each one."
essential: false
prereqs: []
---

# Why Does 0.1 + 0.2 = 0.30000000000000004 in Java?! And How Big Banks Actually Count Money

Imagine it's your first day as the programmer for the school cafeteria. Your job is the cash register. A kid buys a 10-cent pencil and a 20-cent eraser, you add the two prices in Java, and the screen says the total is **$0.30000000000000004**.

Nobody can pay four hundred-quadrillionths of a cent. So is Java broken? Is your computer broken? Neither. By the end of this post you'll know exactly where that stray `4` comes from, bit by bit. You'll also know how the software at real banks and payment companies makes sure that kind of crumb never reaches anyone's account.

This deep dive assumes [Numbers & Arithmetic](/synapse/programming-languages/java/first-steps/numbers-and-arithmetic), which first showed you this bug. Here we open it up. Some code later uses a [record](/synapse/programming-languages/java/core-libraries/enums-and-records) and [catches an exception](/synapse/programming-languages/java/robust-oop/exceptions), but you can follow the story without them.

**You'll be able to:** explain why `0.5` is exact in a `double` but `0.1` is not; name the three parts of a `double`'s 64 bits; trace the three roundings that produce `0.30000000000000004`; choose between `long` cents and `BigDecimal` for money, and avoid the trap in each; and explain why banks round half-cents to the even neighbour.

## Contents

1. [The Java cash register mystery (plus a quick name check!)](#chapter-1-the-java-cash-register-mystery-plus-a-quick-name-check)
2. [The binary pizza slicer: why computers hate one-tenth](#chapter-2-the-binary-pizza-slicer-why-computers-hate-one-tenth)
3. [Inside the 64-bit double suitcase: why 0.1 + 0.2 overshoots](#chapter-3-inside-the-64-bit-double-suitcase-why-01--02-overshoots)
4. [How big banks actually count money](#chapter-4-how-big-banks-actually-count-money)
5. [The golden cheat sheet and production Java code](#chapter-5-the-golden-cheat-sheet-and-production-java-code)
6. [Check yourself](#-check-yourself)

---

## Chapter 1: The Java Cash Register Mystery (Plus a Quick Name Check!)

Here is the whole crime scene. Press **Run** and see it for yourself:

```java run
import static java.lang.IO.println;

class Main {
    public static void main(String[] args) {
        double dime = 0.1;
        double twoDimes = 0.2;
        println(dime + twoDimes);        // the cash register total
        println(dime + twoDimes == 0.3); // is it 30 cents?
    }
}
```

**Output:**
```
0.30000000000000004
false
```

Two surprises in two lines. The total has a strange `4` at the end, and Java says the total is **not** equal to `0.3`. That second line is the dangerous one. A program that checks "did the customer pay exactly the right amount?" would get the wrong answer.

Before we solve the mystery, let's give it its proper name.

<div style="border-left:4px solid #15448e;background:rgba(21,68,142,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

📘 **Quick name check: floating-point, not pointer arithmetic.** People sometimes call decimal math "pointer arithmetic" because there's a decimal *point* in it. It's an easy mix-up, but those are two different things:

- **Pointer arithmetic** is what languages like C and C++ do when they jump around the computer's memory. A *pointer* is a memory address, like a house number on a street. "Pointer + 1" means "go to the next house". Java does not let you do this at all.
- **Floating-point arithmetic** is math with numbers like `0.1` and `3.14`. It's called *floating* point because the decimal point can float left or right, the way it does in scientific notation: `0.0001` is `1 × 10⁻⁴` and `10000` is `1 × 10⁴`. The rules for how computers do this are a world standard called **IEEE 754**, and Java's `double` follows it.

So the mystery in this post is a **floating-point** mystery.

</div>

One more clue before we start: **this isn't a Java bug**. JavaScript, Python, C#, C++, Go and Rust all print `0.30000000000000004` too, because they all use the same IEEE 754 numbers. The cause is in how *every* computer stores fractions. So let's go look.

---

## Chapter 2: The Binary Pizza Slicer (Why Computers Hate One-Tenth)

### Humans have a number they can't write down either

Try to write one-third as a decimal: `0.3333333…` The 3s never stop. However much paper you have, you can only write an *approximation* of one-third.

Why does `1/3` go on forever, while `1/4 = 0.25` stops? Our number system is **base 10**: every place is a tenth, a hundredth, a thousandth of the one before. A fraction stops only if you can build it out of tenths, hundredths and so on, and that works only when the bottom of the fraction is made of 2s and 5s, because 10 = 2 × 5. Four is 2 × 2, so `1/4` stops. Three isn't made of 2s and 5s, so `1/3` never stops.

### Computers only have halves

A computer doesn't count in tens. Deep down it is billions of tiny switches, each one either off or on: `0` or `1`. That's **base 2**, also called **binary**.

Think of it as a pizza slicer that can only cut in half. It can make a half, then half of that (a quarter), then half of *that* (an eighth), and so on. To make an amount, the computer picks which slices to put on the plate. Binary writes those choices down as digits after a point, and each digit's position is called a **binary place**.

### What a binary place is

A *place* is a digit's position after the point: the 1st digit, the 2nd digit, and so on. You already know places from ordinary decimals. In **base 10**, every step to the right divides the value by **10**:

| Place after the point | Written as | Power of 10 | Fraction | Name |
| --- | --- | --- | --- | --- |
| 1st | `0.1` | 10⁻¹ | 1/10 | one-tenth |
| 2nd | `0.01` | 10⁻² | 1/100 | one-hundredth |
| 3rd | `0.001` | 10⁻³ | 1/1000 | one-thousandth |

Binary has only two digits, so every step to the right divides the value by **2**: the slicer cuts the slice in half again. Here are the first 8 binary places, the same 8 you'll switch on and off in Lab 1:

| Place after the point | Written as | Power of 2 | Slice | Decimal value |
| --- | --- | --- | --- | --- |
| 1st | `0.1` | 2⁻¹ | 1/2 | 0.5 |
| 2nd | `0.01` | 2⁻² | 1/4 | 0.25 |
| 3rd | `0.001` | 2⁻³ | 1/8 | 0.125 |
| 4th | `0.0001` | 2⁻⁴ | 1/16 | 0.0625 |
| 5th | `0.00001` | 2⁻⁵ | 1/32 | 0.03125 |
| 6th | `0.000001` | 2⁻⁶ | 1/64 | 0.015625 |
| 7th | `0.0000001` | 2⁻⁷ | 1/128 | 0.0078125 |
| 8th | `0.00000001` | 2⁻⁸ | 1/256 | 0.00390625 |

<div style="border-left:4px solid #da5233;background:rgba(218,82,51,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

⚠️ **The brain trap.** In binary, `0.01` does **not** mean one-hundredth. It means "no half, and one quarter": 1/4, which is 0.25. The digits look the same as in decimal, but every place is worth a different amount. Each binary place is just an on/off switch for one slice.

</div>

### Reading a binary fraction

To turn a binary fraction into a normal number, look at each place. A `1` means "put this slice on the plate", and a `0` means "skip it". Then add up the slices on the plate.

**`0.11` is 0.75:**

| Place | Digit | Slice | Added |
| --- | --- | --- | --- |
| 1st | `1` | 1/2 | 0.5 |
| 2nd | `1` | 1/4 | 0.25 |
| | | **Total** | **0.75** |

**`0.101` is 0.625:**

| Place | Digit | Slice | Added |
| --- | --- | --- | --- |
| 1st | `1` | 1/2 | 0.5 |
| 2nd | `0` | 1/4 | skipped |
| 3rd | `1` | 1/8 | 0.125 |
| | | **Total** | **0.625** |

Both are **exact**: the slices add up perfectly. Here is the same reading done by Java. It starts with a slice worth a half and halves it at every place:

```java run
import static java.lang.IO.println;

class Main {
    // Adds up the slice for every binary place that holds a 1.
    static void read(String binary) {
        String places = binary.substring(2); // the digits after "0."
        double slice = 0.5;                  // the 1st place is worth a half
        double total = 0;
        println("binary " + binary + ":");
        for (int i = 0; i < places.length(); i++) {
            if (places.charAt(i) == '1') {
                total += slice;
                println("  place " + (i + 1) + " is on: add 1/" + (int) (1 / slice) + " = " + slice);
            }
            slice = slice / 2;               // each place is worth half the one before
        }
        println("  total = " + total);
    }

    public static void main(String[] args) {
        read("0.11");
        read("0.101");
        read("0.00011001");
    }
}
```

**Output:**
```
binary 0.11:
  place 1 is on: add 1/2 = 0.5
  place 2 is on: add 1/4 = 0.25
  total = 0.75
binary 0.101:
  place 1 is on: add 1/2 = 0.5
  place 3 is on: add 1/8 = 0.125
  total = 0.625
binary 0.00011001:
  place 4 is on: add 1/16 = 0.0625
  place 5 is on: add 1/32 = 0.03125
  place 8 is on: add 1/256 = 0.00390625
  total = 0.09765625
```

That last one is suspiciously close to 0.1, but not equal. Let's see where it came from.

### Building one-tenth, place by place

Now try to make **one-tenth** (0.1) from slices. Go through the places from biggest to smallest. If a slice fits inside the amount still left to make, put it on the plate (`1`) and subtract it. If it's too big, skip it (`0`):

| Place | Slice | Fits in what's left? | Digit | Left to make |
| --- | --- | --- | --- | --- |
| start | | | | 0.1 |
| 1st | 0.5 | no, too big | `0` | 0.1 |
| 2nd | 0.25 | no, too big | `0` | 0.1 |
| 3rd | 0.125 | no, still too big | `0` | 0.1 |
| 4th | 0.0625 | **yes** | `1` | 0.0375 |
| 5th | 0.03125 | **yes** | `1` | 0.00625 |
| 6th | 0.015625 | no | `0` | 0.00625 |
| 7th | 0.0078125 | no | `0` | 0.00625 |
| 8th | 0.00390625 | **yes** | `1` | 0.00234375 |

After 8 places the plate holds `0.00011001`, which is 0.09765625: the number the Java program printed. There's still 0.00234375 left to make.

Look closely at what's left. After the 4th place it was 0.0375. After the 8th place it is 0.00234375, which is exactly 0.0375 ÷ 16. It's the *same problem*, just 16 times smaller, so the next four places repeat the last four (`1001`), then again, and again, forever. In binary, one-tenth is:

```text
0.0001100110011001100110011001100110011…   (the 0011 repeats forever)
```

It's exactly like `1/3 = 0.333…` for us. The number is perfectly ordinary, but this way of writing it never ends. The reason is the bottom of the fraction. Any pile of slices adds up to something over 2, 4, 8, 16, …, a number made only of 2s. One-tenth is 1/10, and 10 = 2 × 5. No pile of halves can ever build that 5.

### The doubling game: watch the pattern repeat

Testing slices by hand gets slow. There's a neater trick that finds the same digits: keep **doubling** the fraction. Each time the result reaches 1 or more, write down a `1` and keep only the part after the point. Otherwise write a `0`. To keep the game itself exact, this program counts in whole tenths, so `1` means `0.1`:

```java run
import static java.lang.IO.println;

class Main {
    public static void main(String[] args) {
        int tenths = 1; // we are writing 1/10 in binary
        StringBuilder bits = new StringBuilder("0.");
        for (int step = 1; step <= 24; step++) {
            tenths = tenths * 2;   // double it
            if (tenths >= 10) {    // reached a whole 1?
                bits.append('1');
                tenths = tenths - 10;
            } else {
                bits.append('0');
            }
        }
        println("0.1 in binary = " + bits + "...");
        println("left over after 24 bits: " + tenths + " tenths");
    }
}
```

**Output:**
```
0.1 in binary = 0.000110011001100110011001...
left over after 24 bits: 6 tenths
```

The leftover never reaches zero. After step 4 the leftover is 6 tenths, and after step 8 it's 6 tenths *again*, so the game loops forever and the `0011` pattern repeats forever. Try changing `tenths = 1` to `tenths = 5` (that's `0.5`): the game ends after one step, with `0.1` in binary.

So when you write `0.1` in Java, the computer *can't* store one-tenth. It stores the closest number it can build out of slices. You can see that number, digit for digit, with `new BigDecimal(d)`. That constructor copies the **exact** value a `double` holds:

```java run
import java.math.BigDecimal;

import static java.lang.IO.println;

class Main {
    public static void main(String[] args) {
        double[] prices = {0.5, 0.75, 0.625, 0.1, 0.2};
        for (double price : prices) {
            println(price + " is really " + new BigDecimal(price));
        }
    }
}
```

**Output:**
```
0.5 is really 0.5
0.75 is really 0.75
0.625 is really 0.625
0.1 is really 0.1000000000000000055511151231257827021181583404541015625
0.2 is really 0.200000000000000011102230246251565404236316680908203125
```

The prices made of halves come back perfect. The dime is a tiny bit *more* than a dime, and so is the 20-cent piece. Keep that in mind: both of them were rounded **up**.

### Lab #1: the 8-bit binary pizza slicer

Now you be the computer. This slicer has only 8 slice sizes, from 1/2 down to 1/256. Flip the switches to put slices on the plate. Hit the **$0.75** and **$0.625** targets exactly, then try the dime. The **Auto-Fill** button finds the closest you can possibly get. Then drag the **Any price** slider and look for the prices that turn green.

```simulator src=_assets/_simulators/floating-point/pizza-slicer.html height=840 title="Lab 1: The 8-Bit Binary Pizza Slicer"
```

Did you find many green prices? There are only four. Of the 100 prices from $0.00 to $0.99, only **$0.00, $0.25, $0.50 and $0.75** can be made exactly from halves. That stays true with 8 slices, with a `double`'s 52, or with a million. Every other price on every menu is an approximation inside a `double`.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **The rule behind the pizza.** A fraction has an exact binary form only when its bottom number, in lowest terms, is a power of 2 (2, 4, 8, 16, …). One cent is 1/100, and 100 = 4 × 25. That factor of 25 is made of 5s, and halves can never build a 5. So almost no amount of cents is exact in binary.

</div>

---

## Chapter 3: Inside the 64-Bit `double` Suitcase (Why `0.1 + 0.2` Overshoots)

### Packing a number into 64 bits

A Java `double` is a suitcase with room for exactly **64 bits**, never more. To fit huge numbers like `6.02 × 10²³` and tiny ones like `0.000001` into the same suitcase, it uses scientific notation, but in binary. Every `double` is stored as:

> ± 1.*something* × 2^*power*

The 64 bits are split into three compartments:

| Compartment | Bits | What it holds |
| --- | --- | --- |
| **Sign** | 1 | `0` for plus, `1` for minus |
| **Exponent** | 11 | the power of 2: the *magnifier* that slides the point left or right. It's stored with 1023 added, so it never needs its own minus sign. |
| **Mantissa** (or *fraction*) | 52 | the digits after the "1." |

You might wonder where the "1." itself is. Every binary number in scientific notation starts with a 1, because it can't start with anything else. So the standard doesn't waste a bit on it. That **hidden bit** gives a `double` 53 binary digits of precision while only storing 52.

Here is `0.1` in scientific binary: `0.0001100110011…` becomes `1.100110011… × 2⁻⁴` (the point slides 4 places right). Let's X-ray the real suitcases:

```java run
import static java.lang.IO.println;

class Main {
    static void xray(String name, double d) {
        long raw = Double.doubleToLongBits(d);
        String bits = String.format("%64s", Long.toBinaryString(raw)).replace(' ', '0');
        println(name + " sign=" + bits.charAt(0)
                + " exponent=" + bits.substring(1, 12)
                + " mantissa=" + bits.substring(12));
    }

    public static void main(String[] args) {
        xray("0.1 ", 0.1);
        xray("0.2 ", 0.2);
        xray("0.25", 0.25);
        println("power of 2 inside 0.1: " + Math.getExponent(0.1));
    }
}
```

**Output:**
```
0.1  sign=0 exponent=01111111011 mantissa=1001100110011001100110011001100110011001100110011010
0.2  sign=0 exponent=01111111100 mantissa=1001100110011001100110011001100110011001100110011010
0.25 sign=0 exponent=01111111101 mantissa=0000000000000000000000000000000000000000000000000000
power of 2 inside 0.1: -4
```

Read the `0.1` line like a detective:

- **Sign** `0`: the number is positive.
- **Exponent** `01111111011` is 1019. Take away the 1023 that was added, and you get **−4**: "× 2⁻⁴".
- **Mantissa**: `1001 1001 1001 …` is the repeating pattern from the pizza slicer. But look at the very end: `…1001 1010`. The pattern *should* continue `…1001 1001 1001…` forever, and the suitcase has run out of room. Java had to **chop it at bit 52**.

When it chops, Java doesn't just throw the rest away. It **rounds to the nearest** value it can store. The bits that didn't fit started with `1001…`, which is more than halfway, so the last kept bits were rounded **up**: `1001` became `1010`. That's why the dime is stored as slightly *more* than a dime.

`0.25` is a single slice (a quarter), so its mantissa is all zeros: "1.0 × 2⁻²". Nothing to chop, nothing to round.

### The rounding pile-up: three roundings, one wrong answer

Now we can replay the crime in slow motion. `0.1 + 0.2` doesn't involve one rounding. It involves **three**:

1. **Rounding #1.** Typing `0.1` stores `0.1000000000000000055511…`. That's slightly **up**.
2. **Rounding #2.** Typing `0.2` stores `0.2000000000000000111022…`. That's slightly **up** too.
3. **Rounding #3.** The computer adds the two stored values perfectly, getting `0.3000000000000000166533…`. But that answer needs more than 52 bits, so **the result is rounded again** to fit the suitcase.

And here's the twist. The perfect sum lands **exactly halfway** between two doubles: the one for `0.3` just below it, and the next one up. When a value sits exactly on the halfway line, IEEE 754 has a tie-breaking rule: **round to the neighbour whose last bit is 0** (the "even" one). The neighbour above happens to be the even one. So the sum goes up, to `0.3000000000000000444…`, and that is what prints as `0.30000000000000004`.

Let's prove every step with exact arithmetic:

```java run
import java.math.BigDecimal;

import static java.lang.IO.println;

class Main {
    public static void main(String[] args) {
        BigDecimal a = new BigDecimal(0.1);           // what 0.1 really stores
        BigDecimal b = new BigDecimal(0.2);           // what 0.2 really stores
        BigDecimal perfect = a.add(b);                // their sum, with no rounding at all
        BigDecimal below = new BigDecimal(0.3);       // the double just below the perfect sum
        BigDecimal above = new BigDecimal(0.1 + 0.2); // the double just above it

        println("0.1 stores    " + a);
        println("0.2 stores    " + b);
        println("perfect sum   " + perfect);
        println("double below  " + below);
        println("double above  " + above);
        println("gap down      " + perfect.subtract(below).toPlainString());
        println("gap up        " + above.subtract(perfect).toPlainString());
        println("0.1 + 0.2 is the very next double after 0.3? " + (Math.nextUp(0.3) == 0.1 + 0.2));
    }
}
```

**Output:**
```
0.1 stores    0.1000000000000000055511151231257827021181583404541015625
0.2 stores    0.200000000000000011102230246251565404236316680908203125
perfect sum   0.3000000000000000166533453693773481063544750213623046875
double below  0.299999999999999988897769753748434595763683319091796875
double above  0.3000000000000000444089209850062616169452667236328125
gap down      0.0000000000000000277555756156289135105907917022705078125
gap up        0.0000000000000000277555756156289135105907917022705078125
0.1 + 0.2 is the very next double after 0.3? true
```

The two gaps are **identical**, to all 55 decimal places: a perfect tie. And the last line shows that `0.1 + 0.2` is not some random wrong number. It is the *very next* `double` after `0.3`, one step away. Programmers call one step between neighbouring doubles one **ULP** (unit in the last place).

<div style="border-left:4px solid #15448e;background:rgba(21,68,142,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

📘 **A name you may hear.** Some people call this the "double rounding trap". Strictly, *double rounding* is a different bug, where a value is rounded twice, to two different precisions, in a row. What happens here is that three ordinary roundings pile up: two small errors in the same direction, then a tie that breaks the same way.

</div>

### Why does `println(0.1)` print `0.1`, then?

If `0.1` is really `0.1000000000000000055511…`, why doesn't Java print all of that? Because `Double.toString`, which `println` uses, prints the **shortest** decimal that leads back to the very same suitcase. `0.1` is short, and when Java reads `0.1` it stores exactly that suitcase, so `0.1` is enough.

The sum is a *different* suitcase: the one just above `0.3`'s. To point at it and not at its neighbour, Java needs 17 significant digits: `0.30000000000000004`. The hidden error was there all along. It only became visible at the **17th decimal place**, when it grew big enough to change which suitcase was chosen.

```java run
import java.math.BigDecimal;

import static java.lang.IO.println;

class Main {
    public static void main(String[] args) {
        println(0.1);                                        // the shortest name for its suitcase
        println(0.1 == 0.1000000000000000055511151231257827021181583404541015625);
        println(0.1 + 0.1);                                  // doubling is exact: lands on 0.2's suitcase
        println(0.1 + 0.7);                                  // this sum rounds DOWN, below 0.8
        println(Math.abs((0.1 + 0.2) - 0.3) < 1e-9);         // "close enough" is the safe test
    }
}
```

**Output:**
```
0.1
true
0.2
0.7999999999999999
true
```

`0.1 + 0.1` prints `0.2` cleanly, because doubling a binary number only bumps the exponent by one. The `0.1` suitcase doubled *is* the `0.2` suitcase. `0.1 + 0.7` shows the error can go the other way: that sum rounds **down**, so it prints `0.7999999999999999`.

### Lab #2: the 64-bit suitcase X-ray and the 55-digit microscope

Pick an expression and X-ray it. The strips show all 64 bits of each number, colour-coded by compartment, with the red box at bit 52 where the scissors cut and the grey bits that didn't fit. The microscope shows the exact decimal value hiding inside each suitcase: **bold** for what `println` shows, **red** for the first wrong digit. Try `0.1 + 0.2` and look for the "exactly halfway" note, then type in your own numbers.

```simulator src=_assets/_simulators/floating-point/bit-suitcase.html height=1600 title="Lab 2: The 64-Bit Suitcase X-Ray and 55-Digit Microscope"
```

<div style="border-left:4px solid #da5233;background:rgba(218,82,51,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

⚠️ **Never test doubles with `==`.** `0.1 + 0.2 == 0.3` is `false`, and so is a whole family of comparisons that "should" be true. If you must compare doubles, test whether they're *close*: `Math.abs(a - b) < tolerance`. If you need exact answers, as you do with money, don't use `double` at all. That's the next chapter.

</div>

---

## Chapter 4: How Big Banks Actually Count Money

A bank's books have to **balance**: every cent that goes in must be accounted for, to the cent, every single day. Auditors check. "Close enough" isn't good enough, and a `double` can only ever be close enough. Here is how that bites, even on a small sum:

```java run
import java.math.BigDecimal;
import java.math.RoundingMode;

import static java.lang.IO.println;

class Main {
    public static void main(String[] args) {
        double price = 1.005;                             // a price with half a cent
        println(price * 100);                             // should be 100.5
        println(Math.round(price * 100) / 100.0);         // rounded to cents: should be 1.01
        println(new BigDecimal("1.005").setScale(2, RoundingMode.HALF_UP)); // exact decimal math
    }
}
```

**Output:**
```
100.49999999999999
1.0
1.01
```

`1.005` is secretly stored as `1.00499999…`, a hair *below* the halfway point, so rounding it to cents goes **down** to `1.00` when it should go up to `1.01`. One cent gets lost on one sale. Multiply that by millions of sales a day, and somebody is going to ask where the money went.

So real money software doesn't use `double` for amounts. There are two gold-standard strategies.

### Strategy A: count whole cents with `long`

The simplest trick is to stop using fractions at all. Instead of `$1.99`, store `199` **cents**. Whole numbers (integers) are always exact in a computer: no slices, no rounding, no crumbs. Java's `long` holds whole numbers up to 9,223,372,036,854,775,807, which is about 92 quadrillion dollars in cents.

This is how many payment companies work. Stripe's API, for example, takes every amount as a whole number in the currency's smallest unit: `199` means $1.99 <abbr title="Stripe Docs, Supported currencies: zero-decimal currencies and minor units">[5]</abbr>. Some systems count even smaller units, like hundredths of a cent, when they need extra precision for interest. The idea is the same.

```java run
import static java.lang.IO.println;

class Main {
    // Turns whole cents into "$4.99" text without ever touching a double.
    static String dollars(long cents) {
        String sign = cents < 0 ? "-" : "";
        long abs = Math.abs(cents);
        return sign + "$" + (abs / 100) + "." + String.format("%02d", abs % 100);
    }

    public static void main(String[] args) {
        long burger = 499; // $4.99
        long fries = 199;  // $1.99
        long drink = 150;  // $1.50
        long total = burger + fries + drink;
        println("total: " + dollars(total));

        // 8.25% tax, in whole numbers: total * 825 / 10000, rounded half up by adding 5000 first
        long tax = (total * 825 + 5_000) / 10_000;
        println("tax:   " + dollars(tax));
        println("pay:   " + dollars(total + tax));
    }
}
```

**Output:**
```
total: $8.48
tax:   $0.70
pay:   $9.18
```

Every step is exact. The cost shows in the tax line: with plain integers, **you** have to write the rounding rule yourself. Integer cents also have three traps of their own:

1. **Overflow.** A `long` that goes past its maximum silently wraps around to a huge negative number. Money code adds with `Math.addExact`, which throws an exception instead.
2. **Not every currency has cents.** The Japanese yen has no smaller unit, and the Bahraini dinar has *three* decimal places. Java knows each one: `Currency.getInstance("JPY").getDefaultFractionDigits()` is `0`.
3. **Splitting leaves leftovers.** $100.00 split three ways is 3,333.33… cents each. Someone has to get the extra cent.

```java run
import java.util.Currency;

import static java.lang.IO.println;

class Main {
    static String dollars(long cents) {
        return "$" + (cents / 100) + "." + String.format("%02d", cents % 100);
    }

    public static void main(String[] args) {
        // Trap 1: overflow is loud with addExact, silent with +
        println("silent: " + (Long.MAX_VALUE + 1));
        try {
            Math.addExact(Long.MAX_VALUE, 1);
        } catch (ArithmeticException e) {
            println("addExact: " + e.getMessage());
        }

        // Trap 2: decimal places per currency
        for (String code : new String[] {"USD", "JPY", "BHD"}) {
            println(code + " has " + Currency.getInstance(code).getDefaultFractionDigits() + " decimal places");
        }

        // Trap 3: split $100.00 three ways; the leftover cents go to the first people
        long bill = 10_000;
        int people = 3;
        long share = bill / people;
        long leftover = bill % people;
        long paid = 0;
        for (int i = 0; i < people; i++) {
            long pays = share + (i < leftover ? 1 : 0);
            paid += pays;
            println("person " + (i + 1) + " pays " + dollars(pays));
        }
        println("total paid " + dollars(paid));
    }
}
```

**Output:**
```
silent: -9223372036854775808
addExact: long overflow
USD has 2 decimal places
JPY has 0 decimal places
BHD has 3 decimal places
person 1 pays $33.34
person 2 pays $33.33
person 3 pays $33.33
total paid $100.00
```

The bill is split so that the shares add back up to exactly $100.00. No cent is created, none is lost.

### Strategy B: `BigDecimal`, built from a `String`

Java's `java.math.BigDecimal` is a number that thinks in **base 10**, just like you do. Inside, it keeps a whole number of digits plus a *scale*: how many of those digits come after the decimal point. `0.10` is stored as the digits `10` with a scale of 2. No binary slices are involved, so `0.10` is exactly ten cents <abbr title="Java SE 25 API, java.math.BigDecimal">[2]</abbr>. Many banking and accounting systems written in Java use it for their ledgers.

But there's a trap at the front door, and it's easy to walk straight into it.

```java run
import java.math.BigDecimal;

import static java.lang.IO.println;

class Main {
    public static void main(String[] args) {
        println(new BigDecimal(0.1));    // ✗ built from a double: copies its crumbs
        println(new BigDecimal("0.10")); // ✓ built from a String: exact
        println(BigDecimal.valueOf(0.1)); // ok: goes through Double.toString, so "0.1"
    }
}
```

**Output:**
```
0.1000000000000000055511151231257827021181583404541015625
0.10
0.1
```

<div style="border-left:4px solid #da5233;background:rgba(218,82,51,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

⚠️ **The constructor trap.** By the time `new BigDecimal(0.1)` runs, the `0.1` has *already* been squashed into a `double` suitcase. The constructor faithfully copies every digit of that broken value, all 55 of them. `BigDecimal` can't undo damage that happened before it was called. Always build money from a `String`, `new BigDecimal("0.10")`, or from whole cents, `BigDecimal.valueOf(10, 2)`. The Java documentation itself warns that `new BigDecimal(double)` "can be somewhat unpredictable" <abbr title="Java SE 25 API, java.math.BigDecimal, constructor BigDecimal(double)">[3]</abbr>.

</div>

Now let's run a real stress test: a million customers, each depositing a dime and then 20 cents, into all three kinds of vault.

```java run
import java.math.BigDecimal;

import static java.lang.IO.println;

class Main {
    public static void main(String[] args) {
        int transactions = 1_000_000;
        double doubleTotal = 0;
        long centsTotal = 0;
        BigDecimal bigTotal = BigDecimal.ZERO;
        BigDecimal dime = new BigDecimal("0.10");
        BigDecimal twoDimes = new BigDecimal("0.20");

        for (int i = 0; i < transactions; i++) {
            doubleTotal += 0.1;
            doubleTotal += 0.2;
            centsTotal += 10;
            centsTotal += 20;
            bigTotal = bigTotal.add(dime).add(twoDimes);
        }

        println("double     : " + doubleTotal);
        println("long cents : " + centsTotal + " cents");
        println("BigDecimal : " + bigTotal);
    }
}
```

**Output:**
```
double     : 300000.00000631
long cents : 30000000 cents
BigDecimal : 300000.00
```

The `double` vault has invented six-millionths of a dollar out of nothing. At 1,000 transactions it was *short* instead (`299.99999999999426`): the drift wanders up and down, so you can't even fix it by subtracting a constant. The other two vaults are exact to the cent.

`BigDecimal` has two more traps worth knowing before you use it for real:

```java run
import java.math.BigDecimal;
import java.math.RoundingMode;

import static java.lang.IO.println;

class Main {
    public static void main(String[] args) {
        BigDecimal a = new BigDecimal("2.0");
        BigDecimal b = new BigDecimal("2.00");
        println("equals:    " + a.equals(b));         // compares digits AND scale
        println("compareTo: " + (a.compareTo(b) == 0)); // compares the value only

        BigDecimal bill = new BigDecimal("100.00");
        BigDecimal three = new BigDecimal("3");
        println("with a rule: " + bill.divide(three, 2, RoundingMode.HALF_EVEN));
        try {
            bill.divide(three); // 33.333... never ends, and no rounding rule was given
        } catch (ArithmeticException e) {
            println("no rule:   " + e.getMessage());
        }
    }
}
```

**Output:**
```
equals:    false
compareTo: true
with a rule: 33.33
no rule:   Non-terminating decimal expansion; no exact representable decimal result.
```

1. **`equals` checks the scale too.** `2.0` and `2.00` are the same amount of money but not `equals`. To compare amounts, use `compareTo(…) == 0`.
2. **Division needs a rounding rule.** `100 ÷ 3` never ends in decimal either, so `BigDecimal` refuses to guess and throws. You must say how many decimal places to keep and how to round. Which brings us to the most famous rounding rule in banking.

### Banker's rounding: `HALF_EVEN`

At school you learned to round `.5` **up**: `2.5 → 3`, `3.5 → 4`. Java calls that `RoundingMode.HALF_UP`. It looks fair, but it has a hidden lean. Halfway values *always* go up, never down. Round a million half-cent interest payments that way, and the bank's books creep upward by thousands of dollars that nobody actually earned.

**Banker's rounding**, `RoundingMode.HALF_EVEN`, fixes the lean: a value that is exactly halfway goes to whichever neighbour is **even** <abbr title="Java SE 25 API, java.math.RoundingMode.HALF_EVEN">[4]</abbr>. So `2.5 → 2` (down) but `3.5 → 4` (up). About half the ties go down and half go up, and the errors cancel out over many payments, as long as the amounts aren't biased toward odd or even.

```java run
import java.math.BigDecimal;
import java.math.RoundingMode;

import static java.lang.IO.println;

class Main {
    public static void main(String[] args) {
        BigDecimal real = BigDecimal.ZERO;
        BigDecimal upTotal = BigDecimal.ZERO;
        BigDecimal evenTotal = BigDecimal.ZERO;
        for (String amount : new String[] {"2.50", "3.50", "4.50", "5.50"}) {
            BigDecimal value = new BigDecimal(amount);
            BigDecimal up = value.setScale(0, RoundingMode.HALF_UP);
            BigDecimal even = value.setScale(0, RoundingMode.HALF_EVEN);
            println("$" + amount + "  HALF_UP -> " + up + "  HALF_EVEN -> " + even);
            real = real.add(value);
            upTotal = upTotal.add(up);
            evenTotal = evenTotal.add(even);
        }
        println("real total " + real + ", HALF_UP total " + upTotal + ", HALF_EVEN total " + evenTotal);
        println("in cents: $2.345 -> " + new BigDecimal("2.345").setScale(2, RoundingMode.HALF_EVEN));
    }
}
```

**Output:**
```
$2.50  HALF_UP -> 3  HALF_EVEN -> 2
$3.50  HALF_UP -> 4  HALF_EVEN -> 4
$4.50  HALF_UP -> 5  HALF_EVEN -> 4
$5.50  HALF_UP -> 6  HALF_EVEN -> 6
real total 16.00, HALF_UP total 18, HALF_EVEN total 16
in cents: $2.345 -> 2.34
```

School rounding turned $16.00 into $18: two dollars that never existed. Banker's rounding kept the total at $16.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **You've met this rule before.** Remember the perfect tie in Chapter 3, where `0.1 + 0.2` landed exactly halfway between two doubles? The rule IEEE 754 used to break that tie, "go to the neighbour ending in 0", *is* round-half-to-even. The same idea that keeps bank books honest is built into every floating-point chip. It's also the reason the cash register said `0.30000000000000004` and not `0.29999999999999998`.

</div>

### Lab #3: the big bank vault simulator and banker's rounding tester

Run the three vaults side by side, from 1 transaction to 1,000,000. Then flip the **constructor trap** switch on the `BigDecimal` vault and watch 55 digits of `double` crumbs pour in. In Part B, put the half-dollar amounts on the books and compare the two rounding rules, then round 10,000 half-cent interest payments at once.

```simulator src=_assets/_simulators/floating-point/bank-vault.html height=1240 title="Lab 3: The Big Bank Vault Simulator and Banker's Rounding Tester"
```

---

## Chapter 5: The Golden Cheat Sheet and Production Java Code

### The cheat sheet

| | `double` | `long` cents | `BigDecimal` |
| --- | --- | --- | --- |
| **Is `0.10` exact?** | ✗ No, it stores `0.1000000000000000055…` | ✓ Yes, it's `10` | ✓ Yes, if built from `"0.10"` |
| **Speed** | Fastest, done in hardware | Fastest, done in hardware | Slower: an object per value |
| **Rounding** | Automatic and hidden, at bit 52 | You write it yourself | You choose it: `setScale(2, RoundingMode.HALF_EVEN)` |
| **Biggest trap** | `0.1 + 0.2 != 0.3` | Overflow (use `Math.addExact`) | `new BigDecimal(0.1)` and `equals` vs `compareTo` |
| **Use it for** | Science, physics, graphics, measurements | Money in payment systems, counters | Money in ledgers, interest, tax, exchange rates |
| **Never use it for** | Money | Amounts that need more decimal places than you planned | Hot loops where speed matters more than exactness |

### Production code: a `Money` type that can't go wrong quietly

Real systems usually combine both strategies. They **store** money as whole minor units in a `long`, because that's small and fast, and they switch to `BigDecimal` for the moments that need decimal math, like tax or interest, rounding with `HALF_EVEN` at the end. Here's a compact version of that idea, followed by a driver that shows the bug and both fixes:

```java run
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Currency;

import static java.lang.IO.println;

/** An exact amount of money, stored in the currency's smallest unit (cents for USD). */
record Money(long minorUnits, Currency currency) {

    /** Parses "19.99" exactly. Throws if the amount has more decimals than the currency allows. */
    static Money of(String amount, String currencyCode) {
        Currency currency = Currency.getInstance(currencyCode);
        BigDecimal exact = new BigDecimal(amount)
                .setScale(currency.getDefaultFractionDigits(), RoundingMode.UNNECESSARY);
        return new Money(exact.unscaledValue().longValueExact(), currency);
    }

    Money plus(Money other) {
        requireSameCurrency(other);
        return new Money(Math.addExact(minorUnits, other.minorUnits), currency);
    }

    Money times(long count) {
        return new Money(Math.multiplyExact(minorUnits, count), currency);
    }

    /** Applies a rate such as "0.0825" (8.25%), rounding the result with banker's rounding. */
    Money percent(String rate) {
        BigDecimal result = toBigDecimal()
                .multiply(new BigDecimal(rate))
                .setScale(currency.getDefaultFractionDigits(), RoundingMode.HALF_EVEN);
        return new Money(result.unscaledValue().longValueExact(), currency);
    }

    BigDecimal toBigDecimal() {
        return BigDecimal.valueOf(minorUnits, currency.getDefaultFractionDigits());
    }

    private void requireSameCurrency(Money other) {
        if (!currency.equals(other.currency)) {
            throw new IllegalArgumentException("cannot add " + other.currency + " to " + currency);
        }
    }

    @Override
    public String toString() {
        return currency.getCurrencyCode() + " " + toBigDecimal().toPlainString();
    }
}

// ── Driver ──────────────────────────────────────────────
class Main {
    public static void main(String[] args) {
        // The bug: a double cash register
        println("double:     " + (0.1 + 0.2));

        // Fix A + B: Money stores long cents and rounds with BigDecimal
        Money dime = Money.of("0.10", "USD");
        Money twoDimes = Money.of("0.20", "USD");
        println("Money:      " + dime.plus(twoDimes));
        println("1M times:   " + dime.plus(twoDimes).times(1_000_000));

        Money lunch = Money.of("8.48", "USD");
        println("8.25% tax:  " + lunch.percent("0.0825"));
        println("Yen:        " + Money.of("500", "JPY"));

        // The guards: each mistake throws instead of quietly corrupting the books
        try {
            Money.of("1.999", "USD");
        } catch (ArithmeticException e) {
            println("1.999 USD:  " + e.getMessage());
        }
        try {
            dime.plus(Money.of("500", "JPY"));
        } catch (IllegalArgumentException e) {
            println("USD + JPY:  " + e.getMessage());
        }
    }
}
```

**Output:**
```
double:     0.30000000000000004
Money:      USD 0.30
1M times:   USD 300000.00
8.25% tax:  USD 0.70
Yen:        JPY 500
1.999 USD:  Rounding necessary
USD + JPY:  cannot add JPY to USD
```

Notice what the design does for you:

- **No `double` ever enters.** `Money.of` takes a `String`, so the constructor trap can't happen.
- **Rounding happens in one place**, in `percent`, with one rule: `HALF_EVEN`.
- **Mistakes are loud.** Too many decimals, an overflowing total, and mixing currencies all throw an exception instead of quietly producing a wrong balance.

In a real system you'd also want subtraction, allocation (the bill-splitting trick from Strategy A), and formatting for each country's style. Libraries such as JavaMoney (the JSR 354 reference implementation) and Joda-Money provide those ready-made.

---

## ✅ Check yourself

```quiz
{"prompt": "Which of these prices can a double store exactly?", "options": ["$0.10", "$0.20", "$0.75", "$0.99"], "answer": "$0.75"}
```

```quiz
{"prompt": "How are the 64 bits of a Java double divided?", "options": ["1 sign, 11 exponent, 52 mantissa", "1 sign, 8 exponent, 55 mantissa", "32 for the whole part, 32 for the fraction"], "answer": "1 sign, 11 exponent, 52 mantissa"}
```

```quiz
{"prompt": "Why does println(0.1) print 0.1, even though 0.1 is not stored exactly?", "options": ["Java rounds every double to 16 digits", "println prints the shortest decimal that maps back to the same double", "The JVM stores 0.1 in base 10"], "answer": "println prints the shortest decimal that maps back to the same double"}
```

```quiz
{"prompt": "What does new BigDecimal(0.1) print?", "options": ["0.1", "0.10", "0.1000000000000000055511151231257827021181583404541015625"], "answer": "0.1000000000000000055511151231257827021181583404541015625"}
```

```quiz
{"prompt": "With RoundingMode.HALF_EVEN, what do 2.5 and 3.5 round to?", "options": ["3 and 4", "2 and 4", "2 and 3"], "answer": "2 and 4"}
```

<details>
<summary>Why is <code>0.1 + 0.2</code> slightly <em>more</em> than 0.3, and not slightly less?</summary>

Both `0.1` and `0.2` are stored rounded **up**, so their perfect sum is already a hair above 0.3. That perfect sum then lands exactly halfway between two doubles, and IEEE 754 breaks ties toward the neighbour whose last bit is 0. That's the neighbour above, so the result rounds up once more, to the double just after `0.3`.

</details>

<details>
<summary>A teammate writes <code>new BigDecimal(price)</code> where <code>price</code> is a <code>double</code> read from a form. What's wrong, and what are two fixes?</summary>

The `double` already holds a rounded binary value, and the constructor copies every digit of it, crumbs included. Fix 1: read the form field as a `String` and call `new BigDecimal(text)`. Fix 2: if you only have the `double`, use `BigDecimal.valueOf(price)`, which goes through `Double.toString` and gives the short decimal (`0.1`, not 55 digits). The first fix is better, because the value never passes through a `double` at all.

</details>

---

## 📚 Sources

1. IEEE Standard for Floating-Point Arithmetic, IEEE 754-2019 (binary64 format; round-to-nearest, ties-to-even) — <https://standards.ieee.org/ieee/754/6210/>
2. Java SE 25 API, `java.math.BigDecimal` — <https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/math/BigDecimal.html>
3. Java SE 25 API, `java.math.BigDecimal`, constructor `BigDecimal(double)` — <https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/math/BigDecimal.html#%3Cinit%3E(double)>
4. Java SE 25 API, `java.math.RoundingMode` — <https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/math/RoundingMode.html>
5. Stripe Docs, "Supported currencies" (amounts in the smallest currency unit; zero-decimal currencies) — <https://docs.stripe.com/currencies>
6. Java SE 25 API, `java.lang.Double.toString(double)` (the shortest-decimal rule) — <https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Double.html#toString(double)>
7. *The Java Language Specification, Java SE 25*, §4.2.3 "Floating-Point Types, Formats, and Values" — <https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.2.3>
8. David Goldberg, "What Every Computer Scientist Should Know About Floating-Point Arithmetic", *ACM Computing Surveys*, 1991 — <https://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html>

---

<div style="border-left:4px solid #6d28d9;background:rgba(109,40,217,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

🧪 **Predict, then check.** Before you run anything, predict what each line prints: `System.out.println(0.5 + 0.25);` · `System.out.println(0.1 * 3);` · `System.out.println(new BigDecimal("0.1").multiply(new BigDecimal("3")));` · `System.out.println(new BigDecimal("0.5").setScale(0, RoundingMode.HALF_EVEN));`.

Then explain each answer using the pizza slicer: which numbers are made of halves, and which ones had to be rounded?

</div>

## Your Turn

Before you move on, check your understanding with the coach — explain the idea, apply it, weigh the trade-offs, then defend your reasoning.

<div class="concept-coach"></div>
