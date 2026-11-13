---
title: "Why Does 120 + 10 = -126 in Java?! The Secret Life of Bits"
summary: "A story-driven deep dive with three interactive labs. How a byte stores negative numbers with 8 switches and two's complement, why big += 10 quietly turns 130 into -126 when big = big + 10 won't even compile, and how & 0xFF rescues the 130 you meant. Then the same bits in the real world: colours, IP addresses, file streams and hex dumps, plus the traps inside each one."
essential: false
prereqs: []
---

# Why Does 120 + 10 = -126 in Java?! The Secret Life of Bits

Imagine you're writing a game, and you keep each player's score in a `byte` to save memory. A player has 120 points. They grab a 10-point coin, your code adds 10, and the scoreboard says the player now has **−126 points**.

The player is furious. They did nothing wrong, and neither did the addition: 120 + 10 really is 130. So where did the minus sign come from, and why 126? By the end of this post you'll know exactly which switch flipped, and you'll know the one-line trick that gets the 130 back.

This deep dive assumes [Variables & Primitive Types](/synapse/programming-languages/java/first-steps/variables-and-primitive-types), where you met `byte`, and [Numbers & Arithmetic](/synapse/programming-languages/java/first-steps/numbers-and-arithmetic), which first showed you this bug. Here we open it up. Some code at the end uses a [record](/synapse/programming-languages/java/core-libraries/enums-and-records) and [catches an exception](/synapse/programming-languages/java/robust-oop/exceptions), but you can follow the story without them.

**You'll be able to:** read any 8-bit pattern as a number, both signed and unsigned; explain how two's complement stores negatives and why it beat one's complement; trace the hidden cast that turns `big += 10` into `-126`; get the unsigned value back with `& 0xFF` or `Byte.toUnsignedInt`; and avoid the hex, shift and precedence traps that bite people who work with bytes.

## Contents

1. [The Java mystery (a byte goes negative)](#chapter-1-the-java-mystery-a-byte-goes-negative)
2. [Eight light switches (how a byte stores negatives)](#chapter-2-eight-light-switches-how-a-byte-stores-negatives)
3. [Cracking `big += 10`](#chapter-3-cracking-big--10)
4. [Rescuing +130 with `& 0xFF`](#chapter-4-rescuing-130-with--0xff)
5. [The cheat sheet and real-world bytes](#chapter-5-the-cheat-sheet-and-real-world-bytes)
6. [Check yourself](#-check-yourself)

---

## Chapter 1: The Java Mystery (a Byte Goes Negative)

Here is the whole crime scene. Press **Run** and see it for yourself:

```java run
import static java.lang.IO.println;

class Main {
    public static void main(String[] args) {
        byte big = 120;
        big += 10;     // 130 does not fit: the hidden cast wraps it
        println(big);  // Prints -126!
    }
}
```

**Output:**
```
-126
```

Two things in that program are strange. The answer is negative, even though we only added positive numbers. And Java didn't complain at all: no error, no warning, no crash. It just handed us a wrong-looking number.

Let's collect some clues before we solve it. Each line below does the same kind of thing in a slightly different way:

```java run
import static java.lang.IO.println;

class Main {
    public static void main(String[] args) {
        int roomy = 120;
        roomy += 10;
        println("int:  " + roomy);       // the same sum, in a bigger type

        byte small = 127;
        small++;
        println("byte: " + small);       // one step past the top of a byte

        println("cast: " + (byte) 130);  // squeezing 130 into a byte by hand
    }
}
```

**Output:**
```
int:  130
byte: -128
cast: -126
```

Three clues:

1. **The math itself is fine.** In an `int`, 120 + 10 is 130, just as you'd expect.
2. **A byte has a top.** The biggest number a `byte` can hold is 127. One step past it, and you land on the *most negative* byte, −128.
3. **Squeezing 130 into a byte gives −126**, the same strange answer as the mystery. So the trouble isn't the adding. It's the squeezing.

One more clue before we start: **this isn't only a Java thing**. Go and C# give the same −126 for the same code, because they store small numbers the same way. Rust stops the program with an "attempt to add with overflow" error in debug builds instead of wrapping. Python never wraps, because its whole numbers grow as big as they need to. Java chose speed and simplicity: the wrap is silent, and it's your job to know when it can happen.

To see *why* 130 becomes −126 exactly, we need to look at what a `byte` really is.

---

## Chapter 2: Eight Light Switches (How a Byte Stores Negatives)

### A byte is 8 light switches

Inside the computer, a `byte` is a row of **8 tiny switches**. Each switch is either off (0) or on (1). That's all the memory a byte gets. There's no room for a minus sign, a decimal point or anything else: just 8 switches.

How many different patterns can 8 switches make? The first switch has 2 choices. For each of those, the second switch has 2 choices, so 2 switches make 2 × 2 = 4 patterns. Every new switch doubles the count:

| Switches | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Patterns** | 2 | 4 | 8 | 16 | 32 | 64 | 128 | 256 |

So a byte can be in exactly **2⁸ = 256** different patterns. Whatever numbers a byte stands for, there can only be 256 of them. Keep that number in mind: it's the key to the whole mystery.

### Giving each switch a weight

To turn a pattern into a number, each switch gets a **weight**. The rightmost switch is worth 1, and every switch to its left is worth double the one before. To read a pattern, add up the weights of the switches that are on:

| Switch number | 7 | 6 | 5 | 4 | 3 | 2 | 1 | 0 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Weight** | 128 | 64 | 32 | 16 | 8 | 4 | 2 | 1 |
| **120 is** | 0 | 1 | 1 | 1 | 1 | 0 | 0 | 0 |

`0111 1000` has the switches worth 64, 32, 16 and 8 turned on, and 64 + 32 + 16 + 8 = **120**. (We write the 8 bits in two groups of four, like a phone number, only so they're easier to read.)

With these weights, the smallest pattern, all off, is 0. The biggest, all on, is 128 + 64 + 32 + 16 + 8 + 4 + 2 + 1 = 255. So 8 switches can count from **0 to 255**. That's called reading the byte as **unsigned**: no negatives at all.

Here's a little program that prints the switches inside some bytes. Don't worry about the `& 0xFF` inside it yet: Chapter 4 is all about that.

```java run
class Main {
    /** The 8 switches of a byte, as 0s and 1s. (Chapter 4 explains the & 0xFF.) */
    static String switches(byte b) {
        String bits = Integer.toBinaryString(b & 0xFF);
        return "0".repeat(8 - bits.length()) + bits;
    }

    public static void main(String[] args) {
        byte[] values = {0, 1, 5, 10, 120, 127, -1, -126, -128};
        for (byte v : values) {
            System.out.printf("%5d = %s%n", v, switches(v));
        }
    }
}
```

**Output:**
```
    0 = 00000000
    1 = 00000001
    5 = 00000101
   10 = 00001010
  120 = 01111000
  127 = 01111111
   -1 = 11111111
 -126 = 10000010
 -128 = 10000000
```

Look at the last three rows. They all have switch 7 turned on. Read as unsigned, `1000 0010` would be 128 + 2 = 130, our missing 130! But Java says it's −126. So Java must be reading switch 7 differently. To see how, let's look at how people have tried to fit negative numbers into switches.

### Idea 1: use one switch as a minus sign

The first idea most people have is simple: let switch 7 be the **minus sign**. If it's on, the number is negative, and the other 7 switches give its size. So +5 is `0000 0101` and −5 is `1000 0101`. This is called **sign-magnitude**.

It has two problems:

- **There are two zeros.** `0000 0000` is 0, and `1000 0000` is "minus zero". That wastes a pattern, and a program has to remember that two different patterns are equal.
- **Adding breaks.** The adding circuit in a chip just adds switches column by column. Ask it for 5 + (−5) and it adds `0000 0101` and `1000 0101`, which gives `1000 1010`: that's **−10**, not 0. You'd need a separate, more complicated circuit for negatives.

### Idea 2: one's complement, flip every switch

The next idea: to make a number negative, **flip every switch**. +5 is `0000 0101`, so −5 is `1111 1010`. This is called **one's complement**, and in Java the `~` operator flips every bit like this.

Adding works better now. 5 + (−5) is `0000 0101` + `1111 1010` = `1111 1111`. And `1111 1111` is the flip of `0000 0000`, so it means... **−0**. There are still two zeros. Adding also needs a strange extra rule called the "end-around carry" to get some answers right.

Real computers were built this way, like the CDC 6600 supercomputer and the UNIVAC 1100 series in the 1960s. And one's complement isn't gone: the checksum that guards every IPv4 internet packet header is still added up in one's complement today <a href="https://www.rfc-editor.org/rfc/rfc1071" target="_blank" rel="noopener noreferrer"><abbr title="RFC 1071, Computing the Internet Checksum">[13]</abbr></a>.

### Idea 3: two's complement, flip and add one

The winning idea is a tiny change: **flip every switch, then add 1**. +5 is `0000 0101`, flipped it's `1111 1010`, and adding 1 gives `1111 1011`. That's −5 in **two's complement**.

Now try the same addition, 5 + (−5):

```text
   carries: 1 1111 111
   +5         0000 0101
   -5       + 1111 1011
           ───────────
            1 0000 0000
            ↑
            a 9th bit: there's no 9th switch, so it falls off
```

The carry ripples all the way to the left and drops off the end, leaving `0000 0000`: exactly **0**. There's only one zero, and the plain adding circuit works for negatives with no extra rules. That's why almost every computer today uses two's complement, and why Java's rules *require* it: the Java Language Specification says every `byte`, `short`, `int` and `long` is a two's-complement number <a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.2" target="_blank" rel="noopener noreferrer"><abbr title="JLS SE 25, §4.2 Primitive Types and Values">[1]</abbr></a>.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **The anchor and the balloons.** There's an easier way to read a two's-complement byte than "flip and add one". Just change **one weight**: switch 7 is worth **−128** instead of +128. Think of switch 7 as a heavy ⚓ anchor that drags the number down by 128, and the other 7 switches as 🎈 balloons that lift it back up by 64, 32, 16, 8, 4, 2 and 1.

`1111 1011` is −128 + 64 + 32 + 16 + 8 + 2 + 1 = −128 + 123 = **−5**. And our mystery pattern `1000 0010` is −128 + 2 = **−126**.

</div>

Here's Java's `~` (flip) at work, plus the edges of a byte:

```java run
import static java.lang.IO.println;

class Main {
    public static void main(String[] args) {
        int five = 5;
        println("~5      = " + ~five);         // flip every switch
        println("~5 + 1  = " + (~five + 1));   // flip, then add one
        println("~0      = " + ~0);            // flip all of zero's switches

        println("smallest byte = " + Byte.MIN_VALUE);
        println("largest byte  = " + Byte.MAX_VALUE);

        byte min = Byte.MIN_VALUE;
        println("(byte) -min   = " + (byte) -min);  // -128 has no positive twin
        println("abs(int min)  = " + Math.abs(Integer.MIN_VALUE));
    }
}
```

**Output:**
```
~5      = -6
~5 + 1  = -5
~0      = -1
smallest byte = -128
largest byte  = 127
(byte) -min   = -128
abs(int min)  = -2147483648
```

Notice the first line. Flipping alone (one's complement) gives −5's pattern in one's complement, but Java *reads* it as two's complement, so it comes out as −6: one away. That's exactly why the recipe is "flip, **then add 1**". And `~0` is all switches on, `1111 1111`, which in two's complement is −1 (−128 + 127), not −0.

<div style="border-left:4px solid #da5233;background:rgba(218,82,51,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

⚠️ **The lopsided byte.** A byte runs from **−128 to +127**. There are 128 negatives (−1 to −128), but only 127 positives, because zero uses up one of the "switch 7 off" patterns. So −128 has no positive twin. Negate it and you get −128 back, because +128 doesn't fit. Every Java whole-number type has the same lopsided edge, which is why `Math.abs(Integer.MIN_VALUE)` returns a *negative* number. It's a real bug that shows up in hash-table code.

</div>

### The subtract-256 shortcut

Here's the fastest way to read any byte. Read the 8 switches as unsigned first, 0 to 255. If the answer is 127 or less, that's the value. If it's 128 or more, **subtract 256**.

Why 256? Because the only difference between the two readings is switch 7: unsigned, it's worth +128; in two's complement, it's worth −128. The gap between +128 and −128 is 256.

So `1000 0010` is 130 unsigned, and 130 − 256 = **−126**. That's our mystery, solved in one sentence: 120 + 10 makes the pattern for 130, and Java reads that pattern as −126. The rest of this post is about *how* Java got there, and how to get the 130 back.

### Lab #1: the 8-bit light switch and complement explorer

Now you flip the switches. Click any switch to turn it on or off, and watch the number change in all three readings: **2's complement**, **1's complement** and **unsigned**. The formula bar shows the exact sum of weights. Try the buttons in order: **Load +5**, then **Flip (1's complement)**, then **Add +1**, and watch +5 become −5. Then load the **−0 bug** in 1's complement mode, and finish with **Load 120+10**.

```simulator src=_assets/_simulators/byte-overflow/light-switches.html height=860 title="Lab 1: The 8-Bit Light Switch and Complement Explorer"
```

Did you notice that the switches never changed when you switched modes? Only the *reading* changed. A byte doesn't know whether it's −126 or 130. It's just `1000 0010`. The type in your Java code decides how that pattern is read.

---

## Chapter 3: Cracking `big += 10`

### Adding the switches

Let's add 120 + 10 the way the chip does, column by column from the right, carrying a 1 whenever a column adds up to 2:

```text
   carries:   1111
   120        0111 1000
   +10      + 0000 1010
             ──────────
   result     1000 0010
```

There's no overflow carry falling off the end this time. The carries pile up and land on switch 7, the anchor. Read unsigned, the result is 130, which is correct. Read as a two's-complement byte, it's −126. The adding was perfect; the reading is what changed. If that's how it worked, the story would be over.

But Java has a surprise: **it never adds two bytes at all**.

### Java does its math in `int`

Before Java does `+`, `-`, `*` or `/`, it *promotes* any `byte`, `short` or `char` to a 32-bit `int`. This is called **numeric promotion** <a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html#jls-5.6" target="_blank" rel="noopener noreferrer"><abbr title="JLS SE 25, §5.6 Numeric Contexts">[6]</abbr></a>. So `big + 10` is really an `int` sum, with 32 switches, and 130 fits in an `int` with plenty of room:

```text
   130 as an int:  00000000 00000000 00000000 10000010
```

And the answer of `big + 10` is an `int`, too. Which leads to a puzzle. If `big += 10` compiles, then surely `big = big + 10` does too? Run it:

```java run
import static java.lang.IO.println;

class Main {
    public static void main(String[] args) {
        byte big = 120;
        big = big + 10;
        println(big);
    }
}
```

**Compiler error:**
```
Main.java:6: error: incompatible types: possible lossy conversion from int to byte
        big = big + 10;
                  ^
1 error
```

Java refuses. `big + 10` is an `int`, and you can't put an `int` into a `byte` without saying so, because the `int` might not fit. "Lossy conversion" means "some of the information could get lost". Java won't lose your data unless you ask it to.

<div style="border-left:4px solid #15448e;background:rgba(21,68,142,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

📘 **But `byte big = 120;` works. Isn't `120` an `int` too?** Yes! Every number you type, like `120`, is an `int`. But when the value is a **constant**, known while compiling, javac checks it. If it fits in a byte, javac allows it with no cast <a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html#jls-5.2" target="_blank" rel="noopener noreferrer"><abbr title="JLS SE 25, §5.2 Assignment Contexts">[5]</abbr></a>. That's why `byte ok = 120 + 7;` compiles: javac works out 127 and sees that it fits. `byte tooBig = 120 + 10;` is rejected, because 130 doesn't. A variable like `big` isn't a constant, so javac can't check it, and asks you for a cast.

</div>

```java run
import static java.lang.IO.println;

class Main {
    public static void main(String[] args) {
        byte ok = 120 + 7;            // a constant that fits: javac does the math and allows it
        println(ok);
        // byte tooBig = 120 + 10;    // ✗ javac: possible lossy conversion from int to byte
    }
}
```

**Output:**
```
127
```

### The hidden cast inside `+=`

So why does `big += 10` compile? Because the compound operators, `+=`, `-=`, `*=` and friends, come with a **cast built in**. The Java rules say `E1 op= E2` means `E1 = (T) ((E1) op (E2))`, where `T` is the type of `E1` <a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.26.2" target="_blank" rel="noopener noreferrer"><abbr title="JLS SE 25, §15.26.2 Compound Assignment Operators">[7]</abbr></a>. So when you write `big += 10`, Java runs `big = (byte) (big + 10)`:

```java run
import static java.lang.IO.println;

class Main {
    public static void main(String[] args) {
        byte a = 120;
        a += 10;                   // what you write

        byte b = 120;
        b = (byte) (b + 10);       // what Java actually runs

        println("a = " + a);
        println("b = " + b);
    }
}
```

**Output:**
```
a = -126
b = -126
```

That's the whole trick. The `(byte)` cast is there, you just can't see it. And a cast is you telling Java "I know this might not fit. Do it anyway." With `+=`, you said that without knowing it.

### What the cast does: keep the last 8 switches

When Java squeezes an `int` into a `byte`, it doesn't round or clamp. It **keeps the lowest 8 switches and throws the other 24 away** <a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html#jls-5.1.3" target="_blank" rel="noopener noreferrer"><abbr title="JLS SE 25, §5.1.3 Narrowing Primitive Conversion">[4]</abbr></a>. Then it reads those 8 switches as a two's-complement byte:

```text
   130 as an int:  00000000 00000000 00000000 10000010
                   └────── thrown away ─────┘ └ kept ┘
   (byte) 130:                                10000010  =  -128 + 2  =  -126
```

So the subtract-256 shortcut works for any cast: keep subtracting or adding 256 until the number lands between −128 and 127.

```java run
import static java.lang.IO.println;

class Main {
    public static void main(String[] args) {
        println("(byte) 130  = " + (byte) 130);    // 130 - 256
        println("(byte) 200  = " + (byte) 200);    // 200 - 256
        println("(byte) 256  = " + (byte) 256);    // 256 - 256
        println("(byte) -129 = " + (byte) -129);   // -129 + 256
    }
}
```

**Output:**
```
(byte) 130  = -126
(byte) 200  = -56
(byte) 256  = 0
(byte) -129 = 127
```

### A byte is a clock, not a ruler

A ruler goes on forever in both directions. A byte doesn't. Think of a car's odometer with only three digits: after 999 km comes 000, because there's no fourth wheel to carry into. A byte is like that, except it's a **clock with 256 marks**. Counting up from 0, you pass 1, 2, … up to 127. One more tick, and the hand lands on −128, then −127, and so on back up to −1 and 0 again.

The jump from +127 to −128 is the **overflow cliff**. 120 + 10 starts 7 ticks before the cliff and goes 10 ticks forward, so it ends 3 ticks past it: −128, −127, **−126**.

Every operator with a hidden cast can push a byte over the cliff, not just `+=`. The same family of surprises:

```java run
import static java.lang.IO.println;

class Main {
    public static void main(String[] args) {
        byte top = 127;
        top++;                       // ++ hides a cast too
        println("127 + 1     -> " + top);

        byte bottom = -128;
        bottom--;                    // and so does --
        println("-128 - 1    -> " + bottom);

        int i = 5;
        i += 3.7;                    // (int) (5 + 3.7): the .7 is chopped off
        println("5 += 3.7    -> " + i);

        char letter = 'A';
        letter += 1;                 // (char) ('A' + 1)
        println("'A' += 1    -> " + letter);

        println("int max + 1 -> " + (Integer.MAX_VALUE + 1));  // an int has a cliff too
    }
}
```

**Output:**
```
127 + 1     -> -128
-128 - 1    -> 127
5 += 3.7    -> 8
'A' += 1    -> B
int max + 1 -> -2147483648
```

The last line has no cast at all: an `int` is a clock too, just a much bigger one, with about 4.3 billion marks. Its cliff is between 2,147,483,647 and −2,147,483,648. [Numbers & Arithmetic](/synapse/programming-languages/java/first-steps/numbers-and-arithmetic) shows how `Math.addExact` throws an exception instead of falling off it.

### Lab #2: the Java byte clock and the hidden cast guillotine

Here is the byte clock. The green half holds the positives and the coral half holds the negatives, with the overflow cliff at the bottom. Press **Run `big += 10`** to watch the hand tick from 120 to −126, one step at a time. Then drag the slider anywhere from −128 to 255 and watch the 32-bit view below the clock: the cast keeps the last 8 switches and chops the rest.

```simulator src=_assets/_simulators/byte-overflow/byte-clock.html height=700 title="Lab 2: The Java Byte Clock and the Hidden Cast Guillotine"
```

Try dragging to 256. The `int` says 256, but the byte says 0: the hand went all the way around. Then try any number from 128 to 255 and check the subtract-256 shortcut against the clock.

---

## Chapter 4: Rescuing +130 with `& 0xFF`

### Why you'd ever want the 130

In our game, the fix is easy: don't keep scores in a `byte`. Use an `int`. But there's a big part of programming where bytes are everywhere and you can't avoid them: **files, images, sounds and networks**. Those all move data around as raw bytes, and to them, a byte means a number from **0 to 255**. A pixel's brightness of 130, a byte from a file, a piece of an IP address: none of these are ever negative.

Java has no unsigned byte. In fact, `char` is the only unsigned whole-number type Java has <a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.2" target="_blank" rel="noopener noreferrer"><abbr title="JLS SE 25, §4.2 Primitive Types and Values">[1]</abbr></a>. So every time you read the bytes of a file, Java hands you values from −128 to 127, and you have to turn the negatives back into 128 to 255 yourself.

The tempting fix doesn't work. If you just store the byte in an `int`, which has plenty of room for 130, you still get −126:

```java run
import static java.lang.IO.println;

class Main {
    public static void main(String[] args) {
        byte big = -126;
        int x = big;                // widening: the byte grows to 32 switches
        println("x            = " + x);
        println("x in binary  = " + Integer.toBinaryString(x));
        println("x in hex     = " + Integer.toHexString(x));
    }
}
```

**Output:**
```
x            = -126
x in binary  = 11111111111111111111111110000010
x in hex     = ffffff82
```

Look at that binary line. The byte's 8 switches are at the end, `10000010`, but the 24 new switches in front are all **1s**, not 0s. Where did they come from?

### Sign extension: the copycat bits

When Java widens a byte to an `int`, it fills the 24 new switches with **copies of switch 7**, the sign bit <a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html#jls-5.1.2" target="_blank" rel="noopener noreferrer"><abbr title="JLS SE 25, §5.1.2 Widening Primitive Conversion">[3]</abbr></a>. This is called **sign extension**. A positive byte has switch 7 off, so it gets 24 zeros. A negative byte has switch 7 on, so it gets 24 copycat ones.

Java does this on purpose, because copying the sign bit keeps the **value** the same, and that's what widening promises. Here's why it works. Grow `1000 0010` by just one switch, copying the sign into a new 9th switch: `1 1000 0010`. In 9 switches, the new top switch is the anchor, worth −256, and old switch 7 becomes a regular balloon worth +128. Together they're −256 + 128 = **−128**: exactly what switch 7 was worth on its own. So the value is still −128 + 2 = −126. Every extra copy repeats the same trick, all the way up to 32 switches.

So widening is honest. It kept −126 as −126. The problem is that we don't *want* −126. We want the pattern `1000 0010` read as unsigned, 130. To get that, we need to switch off those 24 copycats.

### Hex: a shorter way to write switches

Programmers almost never write 32 ones and zeros. They use **hexadecimal**, or hex: a number system with 16 digits, 0 to 9 and then A to F for ten to fifteen. One hex digit holds exactly 4 switches, so a byte is always exactly 2 hex digits:

| 4 switches | `0000` | `0001` | `0010` | … | `1000` | … | `1010` | … | `1111` |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Hex digit** | 0 | 1 | 2 | … | 8 | … | A | … | F |

In Java code, `0x` in front means "this number is written in hex". So `1000 0010` is `0x82`, which is 8 × 16 + 2 = 130. And all 8 switches on, `1111 1111`, is **`0xFF`**, which is 255. The 32-bit `int` −126 is `0xFFFFFF82`: six F's for the 24 copycat ones, then the `82`.

### The bitwise AND: a stencil for switches

The `&` operator, **bitwise AND**, compares two numbers switch by switch. Each result switch is on only if *both* switches in that column are on <a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.22.1" target="_blank" rel="noopener noreferrer"><abbr title="JLS SE 25, §15.22.1 Integer Bitwise Operators &, ^, and |">[8]</abbr></a>:

| `a` | `b` | `a & b` |
| --- | --- | --- |
| 0 | 0 | 0 |
| 0 | 1 | 0 |
| 1 | 0 | 0 |
| 1 | 1 | 1 |

That makes `&` work like a **stencil**, or a shield. Wherever the shield has a 0, the result is 0, no matter what was there. Wherever the shield has a 1, the original switch shows through unchanged. The value `0xFF`, as a 32-bit `int`, is 24 zeros followed by 8 ones. Line it up under our `int`:

```text
   int x = big     11111111 11111111 11111111 10000010   = -126
   0xFF          & 00000000 00000000 00000000 11111111   =  255
                   ─────────────────────────────────
   big & 0xFF      00000000 00000000 00000000 10000010   =  130
```

The 24 zeros in the shield block every copycat. The 8 ones let the byte's own switches through. And now the top switch of the 32 is 0, so the number is positive, and the old switch 7 is just a plain +128 balloon: 128 + 2 = **130**. 🎉

```java run
import static java.lang.IO.println;

class Main {
    public static void main(String[] args) {
        byte big = 120;
        big += 10;                                  // -126, as in Chapter 1

        int rescued = big & 0xFF;                   // the laser shield
        println("big                 = " + big);
        println("big & 0xFF          = " + rescued);
        println("in binary           = " + Integer.toBinaryString(rescued));
        println("Byte.toUnsignedInt  = " + Byte.toUnsignedInt(big));
    }
}
```

**Output:**
```
big                 = -126
big & 0xFF          = 130
in binary           = 10000010
Byte.toUnsignedInt  = 130
```

`Byte.toUnsignedInt(big)` does exactly the same thing, with a name that says what you mean <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Byte.html#toUnsignedInt(byte)" target="_blank" rel="noopener noreferrer"><abbr title="Java SE 25 API, Byte.toUnsignedInt(byte)">[10]</abbr></a>. It arrived in Java 8, along with friends like `Short.toUnsignedInt` and `Integer.toUnsignedLong`. You'll see `& 0xFF` far more often in real code, because it's older and shorter, so it's worth knowing both.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Nothing in memory changed.** `big` is still the byte `1000 0010`, and `big & 0xFF` didn't change it. It made a *new* `int` whose top 24 switches are off. Signed and unsigned aren't two kinds of bytes. They're two ways of reading the same 8 switches, and `& 0xFF` is how you ask Java for the unsigned reading.

</div>

### Three traps when you work with bytes

**Trap 1: hex that's too long.** `Integer.toHexString` takes an `int`, so a negative byte gets sign-extended first, and you get 8 hex digits instead of 2. Mask it first, or use a tool that understands bytes. `String.format("%02x", b)` treats a `byte` as 8 switches, and `java.util.HexFormat` turns a whole array of bytes into hex <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/HexFormat.html" target="_blank" rel="noopener noreferrer"><abbr title="Java SE 25 API, java.util.HexFormat">[12]</abbr></a>:

```java run
import java.util.HexFormat;

import static java.lang.IO.println;

class Main {
    public static void main(String[] args) {
        byte big = -126;
        println(Integer.toHexString(big));          // wrong: the copycats show up as ffffff
        println(Integer.toHexString(big & 0xFF));   // right: mask first
        println(String.format("%02x", big));        // right: %x knows a byte is 8 bits
        println(HexFormat.of().formatHex(new byte[] {big, -1, 0, 120}));
    }
}
```

**Output:**
```
ffffff82
82
82
82ff0078
```

**Trap 2: forgetting the parentheses.** In Java, `==` is done *before* `&`. So `big & 0xFF == 130` means `big & (0xFF == 130)`, and that asks Java to AND a byte with `true` or `false`:

```java run
import static java.lang.IO.println;

class Main {
    public static void main(String[] args) {
        byte big = -126;
        if (big & 0xFF == 130) {
            println("it's 130!");
        }
    }
}
```

**Compiler error:**
```
Main.java:6: error: bad operand types for binary operator '&'
        if (big & 0xFF == 130) {
                ^
  first type:  byte
  second type: boolean
1 error
```

Always write the mask in its own parentheses: `(big & 0xFF) == 130`. The same goes for `<`, `>` and the other comparisons.

**Trap 3: shifting a byte to the right.** Java has two right shifts. `>>` copies the sign bit into the switches it opens up on the left, and `>>>` fills them with zeros <a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.19" target="_blank" rel="noopener noreferrer"><abbr title="JLS SE 25, §15.19 Shift Operators">[9]</abbr></a>. You'd expect `>>>` to work on a byte like an unsigned shift. It doesn't, because the byte is sign-extended to an `int` *before* the shift:

```java run
import static java.lang.IO.println;

class Main {
    public static void main(String[] args) {
        byte big = -126;                              // the pattern 1000 0010
        println("big >> 4           = " + (big >> 4));
        println("big >>> 4          = " + (big >>> 4));
        println("(big & 0xFF) >>> 4 = " + ((big & 0xFF) >>> 4));

        byte shifted = big;
        shifted >>>= 4;                               // the hidden cast strikes again
        println("shifted >>>= 4     = " + shifted);
    }
}
```

**Output:**
```
big >> 4           = -8
big >>> 4          = 268435448
(big & 0xFF) >>> 4 = 8
shifted >>>= 4     = -8
```

`big >>> 4` shifted the zeros into the top of the 32-bit `int`, past all the copycats, so you get a huge number. And `shifted >>>= 4` is worse: its hidden `(byte)` cast keeps only the last 8 switches, which are still copycat ones, so the "unsigned" shift gives −8. Only the masked version, `(big & 0xFF) >>> 4`, gives the 8 you wanted: the top 4 switches of `1000 0010`.

### Lab #3: the sign extension and `& 0xFF` laser shield visualizer

Time to fire the shield yourself. The lab lines up four 32-bit rows: the original byte, the byte widened to an `int` (with its copycat bits in coral), the `0xFF` shield and the result. Flip the **`& 0xFF` laser shield** on and off and watch the copycats get blocked. Try each preset, then drag the slider and see which bytes the shield changes, and which ones it leaves alone.

```simulator src=_assets/_simulators/byte-overflow/laser-shield.html height=860 title="Lab 3: The Sign Extension and & 0xFF Laser Shield Visualizer"
```

Did you notice that the shield does nothing to +120? A positive byte only has zero copycats, so there's nothing to block. Masking only matters for bytes that Java reads as negative: the ones whose pattern is 128 to 255.

---

## Chapter 5: The Cheat Sheet and Real-World Bytes

### Colours: three bytes inside one `int`

Every colour on your screen is three numbers from 0 to 255: how much **red**, **green** and **blue** light to mix. Java's image classes often pack all three into one `int`, a byte each, like `0xFF5733` for a bright orange: `FF` red, `57` green, `33` blue. To pull one colour out, shift its byte down to the bottom and mask off everything else:

```java run
import static java.lang.IO.println;

class Main {
    public static void main(String[] args) {
        int orange = 0xFF5733;                        // one int holds three colour bytes
        int red   = (orange >> 16) & 0xFF;
        int green = (orange >> 8) & 0xFF;
        int blue  = orange & 0xFF;
        println("red=" + red + " green=" + green + " blue=" + blue);

        byte[] pixel = {(byte) 0xFF, 0x57, 0x33};     // the same colour, as raw bytes from a file
        println("raw bytes:  " + pixel[0] + " " + pixel[1] + " " + pixel[2]);
        println("masked:     " + (pixel[0] & 0xFF) + " " + (pixel[1] & 0xFF) + " " + (pixel[2] & 0xFF));
    }
}
```

**Output:**
```
red=255 green=87 blue=51
raw bytes:  -1 87 51
masked:     255 87 51
```

Without the mask, the brightest red in the world comes out as −1. Any picture code that forgets `& 0xFF` turns its bright colours into nonsense.

### Network addresses and file streams

An IPv4 address like `192.168.1.200` is 4 bytes, and three of those numbers are over 127. Print them straight from a `byte[]` and you get nonsense. The same data matters when you read a file: `InputStream.read()` returns an **`int`**, not a `byte`, on purpose <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/InputStream.html#read()" target="_blank" rel="noopener noreferrer"><abbr title="Java SE 25 API, java.io.InputStream.read()">[11]</abbr></a>. It gives you each byte as 0 to 255, so it can use −1 to mean "the stream is empty". If it returned a `byte`, a real `0xFF` byte in the file and the end of the file would look exactly the same.

```java run
import java.io.ByteArrayInputStream;
import java.io.InputStream;

import static java.lang.IO.println;

class Main {
    public static void main(String[] args) throws Exception {
        byte[] address = {(byte) 192, (byte) 168, 1, (byte) 200};
        println("wrong: " + address[0] + "." + address[1] + "." + address[2] + "." + address[3]);
        println("right: " + (address[0] & 0xFF) + "." + (address[1] & 0xFF) + "."
                + (address[2] & 0xFF) + "." + (address[3] & 0xFF));

        InputStream in = new ByteArrayInputStream(new byte[] {-126, -1});
        println("read() = " + in.read());   // the -126 byte, read as 0..255
        println("read() = " + in.read());   // the -1 byte: 255, not "the end"
        println("read() = " + in.read());   // now the stream really is empty
    }
}
```

**Output:**
```
wrong: -64.-88.1.-56
right: 192.168.1.200
read() = 130
read() = 255
read() = -1
```

<div style="border-left:4px solid #da5233;background:rgba(218,82,51,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

⚠️ **The classic copy loop bug.** People sometimes write `byte b = (byte) in.read();` and then check `b == -1` to stop at the end of the file. A real `0xFF` byte in the file also becomes −1, so the loop stops early, in the middle of the file, and the copy is quietly cut short. Keep the result of `read()` in an `int`, compare *that* with −1, and cast to `byte` only after the check. [I/O, Files & NIO.2](/synapse/programming-languages/java/advanced/io-files-and-nio2) shows the modern ways to read files that avoid this loop entirely.

</div>

### The cheat sheet

| You want… | Write | Example with `byte b = -126` |
| --- | --- | --- |
| The byte's 0–255 value | `b & 0xFF` or `Byte.toUnsignedInt(b)` | `130` |
| The byte as a signed number | just use `b` | `-126` |
| Two hex digits | `String.format("%02x", b)` or `HexFormat` | `82` |
| The 8 switches | `Integer.toBinaryString(b & 0xFF)` | `10000010` |
| The top 4 switches | `(b & 0xFF) >>> 4` | `8` |
| A mask in a comparison | `(b & 0xFF) == 130` | `true` |
| A sum that can't wrap | `Math.addExact` in an `int` or `long`, or a range check | throws instead of wrapping |
| Bytes from a stream | keep `in.read()` in an `int` and check for `-1` | `130`, then `-1` at the end |

And the three rules behind every row:

1. **Byte math is done in `int`.** Every `byte` is promoted before `+`, `-`, `*`, `/`, `&`, `>>` and `>>>`.
2. **Widening copies the sign bit.** A negative byte becomes a negative `int`, with 24 copycat ones in front.
3. **Narrowing keeps the last 8 switches.** Every `(byte)` cast, written or hidden in `+=`, `++` or `>>>=`, throws away the rest.

### Production code: bytes that can't go wrong quietly

Real code that handles bytes usually wraps these rules in a few small, well-named helpers, so nobody has to remember the mask at every call. Here's a compact version, with a `record` for colours that can never hold a negative channel, followed by a driver that shows the bug and the fixes:

```java run
import java.util.HexFormat;

import static java.lang.IO.println;

/** Helpers for reading bytes as the 0..255 values that files and networks mean. */
final class Bytes {
    private Bytes() {}

    /** The byte's pattern read as 0..255. The same as Byte.toUnsignedInt. */
    static int unsigned(byte b) {
        return b & 0xFF;
    }

    /** Adds to a byte, but throws instead of wrapping around the overflow cliff. */
    static byte addExact(byte a, int b) {
        int sum = Math.addExact(a, b);            // exact in int: throws if even an int overflows
        if (sum < Byte.MIN_VALUE || sum > Byte.MAX_VALUE) {
            throw new ArithmeticException("byte overflow: " + a + " + " + b + " = " + sum);
        }
        return (byte) sum;                        // safe: we just checked that it fits
    }

    /** "82 ff 00 78": one two-digit hex pair per byte. */
    static String hexDump(byte[] data) {
        return HexFormat.ofDelimiter(" ").formatHex(data);
    }
}

/** A colour whose channels are always 0..255, never negative. */
record Rgb(int red, int green, int blue) {
    static Rgb fromBytes(byte r, byte g, byte b) {
        return new Rgb(Bytes.unsigned(r), Bytes.unsigned(g), Bytes.unsigned(b));
    }

    static Rgb fromInt(int rgb) {
        return new Rgb((rgb >> 16) & 0xFF, (rgb >> 8) & 0xFF, rgb & 0xFF);
    }

    String hex() {
        return String.format("#%02X%02X%02X", red, green, blue);
    }
}

// ── Driver ──────────────────────────────────────────────
class Main {
    public static void main(String[] args) {
        byte big = 120;
        big += 10;
        println("the mystery:   " + big);
        println("unsigned:      " + Bytes.unsigned(big));
        println("hex dump:      " + Bytes.hexDump(new byte[] {big, -1, 0, 120}));

        Rgb fromFile = Rgb.fromBytes((byte) 0xFF, (byte) 0x57, (byte) 0x33);
        println("from bytes:    " + fromFile + " " + fromFile.hex());
        println("same as int:   " + fromFile.equals(Rgb.fromInt(0xFF5733)));

        println("safe add:      " + Bytes.addExact((byte) 100, 20));
        try {
            Bytes.addExact((byte) 120, 10);
        } catch (ArithmeticException e) {
            println("unsafe add:    " + e.getMessage());
        }
    }
}
```

**Output:**
```
the mystery:   -126
unsigned:      130
hex dump:      82 ff 00 78
from bytes:    Rgb[red=255, green=87, blue=51] #FF5733
same as int:   true
safe add:      120
unsafe add:    byte overflow: 120 + 10 = 130
```

Notice what the design does for you:

- **The mask lives in one place.** `Bytes.unsigned` is the only line that writes `& 0xFF` for a single byte, so nobody can forget it at a call site.
- **Bad states can't exist.** An `Rgb` built from bytes always has channels from 0 to 255, so no code that uses it ever sees a −1 red.
- **Mistakes are loud.** `addExact` throws an exception at the overflow cliff instead of quietly turning a score of 130 into −126. The player from the introduction would have gotten an error report instead of a ruined game.

---

## ✅ Check yourself

```quiz
{"prompt": "What does System.out.println((byte) 200) print?", "options": ["200", "-56", "56", "-128"], "answer": "-56"}
```

```quiz
{"prompt": "In two's complement, what number is the byte pattern 1111 1111?", "options": ["255", "-0", "-1", "-127"], "answer": "-1"}
```

```quiz
{"prompt": "Why does big += 10 compile when big = big + 10 does not?", "options": ["+= adds in 8 bits, so the result is already a byte", "+= has a hidden (byte) cast built in", "javac checks that 130 fits in a byte"], "answer": "+= has a hidden (byte) cast built in"}
```

```quiz
{"prompt": "byte big = -126; Which expression gives 130?", "options": ["(int) big", "Math.abs(big)", "big & 0xFF", "big >>> 0"], "answer": "big & 0xFF"}
```

```quiz
{"prompt": "What does Integer.toHexString((byte) -126) print?", "options": ["82", "-7e", "ffffff82", "0x82"], "answer": "ffffff82"}
```

<details>
<summary>Why can a byte hold −128, but not +128?</summary>

8 switches make 256 patterns. Half of them, the 128 with switch 7 on, are the negatives −1 to −128. The other 128, with switch 7 off, have to cover zero *and* the positives, so the positives only reach 127. In two's complement, zero has just one pattern, so the extra pattern goes to the negative side.

</details>

<details>
<summary>Why does <code>InputStream.read()</code> return an <code>int</code> and not a <code>byte</code>?</summary>

Because it needs 257 different answers: the 256 possible bytes, plus one more for "the stream is empty". A `byte` only has 256 patterns, so there would be no pattern left over to mean "the end". An `int` returns each byte as 0 to 255 and uses −1, which no byte value can be, for the end.

</details>

---

## 📚 Sources

1. *The Java Language Specification, Java SE 25*, §4.2 "Primitive Types and Values" (two's-complement integral types; `char` is unsigned) — <a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.2" target="_blank" rel="noopener noreferrer">https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.2</a>
2. *The Java Language Specification, Java SE 25*, §4.2.1 "Integral Types and Values" (the range of `byte` is −128 to 127) — <a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.2.1" target="_blank" rel="noopener noreferrer">https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.2.1</a>
3. *The Java Language Specification, Java SE 25*, §5.1.2 "Widening Primitive Conversion" (sign extension) — <a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html#jls-5.1.2" target="_blank" rel="noopener noreferrer">https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html#jls-5.1.2</a>
4. *The Java Language Specification, Java SE 25*, §5.1.3 "Narrowing Primitive Conversion" (keep the lowest bits) — <a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html#jls-5.1.3" target="_blank" rel="noopener noreferrer">https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html#jls-5.1.3</a>
5. *The Java Language Specification, Java SE 25*, §5.2 "Assignment Contexts" (constants that fit need no cast) — <a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html#jls-5.2" target="_blank" rel="noopener noreferrer">https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html#jls-5.2</a>
6. *The Java Language Specification, Java SE 25*, §5.6 "Numeric Contexts" (promotion to `int`) — <a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html#jls-5.6" target="_blank" rel="noopener noreferrer">https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html#jls-5.6</a>
7. *The Java Language Specification, Java SE 25*, §15.26.2 "Compound Assignment Operators" (the hidden cast) — <a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.26.2" target="_blank" rel="noopener noreferrer">https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.26.2</a>
8. *The Java Language Specification, Java SE 25*, §15.22.1 "Integer Bitwise Operators &, ^, and |" — <a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.22.1" target="_blank" rel="noopener noreferrer">https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.22.1</a>
9. *The Java Language Specification, Java SE 25*, §15.19 "Shift Operators" — <a href="https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.19" target="_blank" rel="noopener noreferrer">https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.19</a>
10. Java SE 25 API, `java.lang.Byte.toUnsignedInt(byte)` — <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Byte.html#toUnsignedInt(byte)" target="_blank" rel="noopener noreferrer">https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Byte.html#toUnsignedInt(byte)</a>
11. Java SE 25 API, `java.io.InputStream.read()` — <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/InputStream.html#read()" target="_blank" rel="noopener noreferrer">https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/InputStream.html#read()</a>
12. Java SE 25 API, `java.util.HexFormat` — <a href="https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/HexFormat.html" target="_blank" rel="noopener noreferrer">https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/HexFormat.html</a>
13. RFC 1071, "Computing the Internet Checksum" (one's-complement sums in IP headers) — <a href="https://www.rfc-editor.org/rfc/rfc1071" target="_blank" rel="noopener noreferrer">https://www.rfc-editor.org/rfc/rfc1071</a>

---

<div style="border-left:4px solid #6d28d9;background:rgba(109,40,217,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

🧪 **Predict, then check.** Before you run anything, predict what each line prints: `System.out.println((byte) 255);` · `System.out.println((byte) 128);` · `System.out.println((byte) -1 & 0xFF);` · `System.out.println(Integer.toHexString((byte) 15));`.

Then explain each answer with the light switches: which switches are on, and is switch 7 the anchor or a balloon?

</div>

## Your Turn

Before you move on, check your understanding with the coach — explain the idea, apply it, weigh the trade-offs, then defend your reasoning.

<div class="concept-coach"></div>
