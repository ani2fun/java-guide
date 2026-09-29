---
title: I/O, Files & NIO.2
summary: I/O moves bytes (binary) or characters (text, via an encoding). NIO.2 — Path and Files — is the modern, concise file API, with Files.list and Files.walk for directories; Files.lines() returns a java.util.stream.Stream, clarifying the name clash between I/O "streams" and the Stream API. Text is bytes through a charset (UTF-8), so a character can be several bytes and the wrong charset mangles it; readers, writers and buffering batch the costly system calls; and serialization turns objects into bytes, with a security warning attached. Every behavior shown with verified output.
prereqs: []
---

# I/O, Files & NIO.2 — Reading and Writing the World

A program that cannot read or write outside itself is sealed off. **I/O** (input/output) connects it to files, the network and the console. It comes in two flavours:

- **Byte** I/O moves raw binary.
- **Character** I/O moves text: bytes interpreted through a **charset** (an encoding), such as UTF-8.

The modern file API, **NIO.2** (`java.nio.file`, since JDK 7), is built on `Path` (a location) and `Files` (static operations), and it makes common tasks one line. It also bridges to the [Streams API](/synapse/programming-languages/java/advanced/functional-java-and-streams): `Files.lines()` returns a `java.util.stream.Stream<String>`. That is the moment to clear up a real confusion: the word "stream" means two different things in Java, an I/O byte stream and the functional `Stream` pipeline.

Three more realities round it out. Text is bytes through an encoding, so one character can be several bytes. **Buffering** batches the expensive system calls that I/O is made of. And **serialization** turns whole objects into bytes, with a security warning attached.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **The core idea.**

- **I/O** moves **bytes** (binary) or **characters** (text through a charset like UTF-8).
- **NIO.2** — `Path` and `Files` — is the modern, one-line file API.
- `Files.lines()` returns a `java.util.stream.Stream`, clearing the "stream" name clash.
- Text is bytes-through-an-encoding, and **buffering** batches the costly system calls.

</div>

This uses [streams](/synapse/programming-languages/java/advanced/functional-java-and-streams) and [try-with-resources](/synapse/programming-languages/java/robust-oop/exceptions). Every output below was produced by compiling and running the code. Each program writes and reads files in its working directory.

**You'll be able to:** read and write files and list directories with `Path` and `Files`, and predict where a missing file fails; pick between `readAllLines` and `Files.lines`, and close a file-backed stream; predict a file's byte and character counts, and what the wrong charset does to text; read the console and files line by line with a `BufferedReader`, and explain why buffering matters; serialize and deserialize an object, and predict what `transient` and a non-`Serializable` class do.

<div style="border-left:4px solid #15448e;background:rgba(21,68,142,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

📘 **How to read the Intuition boxes.** Each one is built in three moves:

1. **The mechanism** — what the compiler and the JVM *do*.
2. **A concrete bite** — a specific, runnable failure (often a real compiler error), shown so the trap is visible.
3. **The earned rule** — the decision heuristic, now justified rather than asserted, plus its cost.

</div>

---

## Table of contents

1. [NIO.2: `Path` and `Files`](#1-nio2-path-and-files)
2. [Reading lines as text](#2-reading-lines-as-text)
3. [The `Stream` name clash](#3-the-stream-name-clash)
4. [Bytes vs characters](#4-bytes-vs-characters)
5. [Readers, writers, the console and buffering](#5-readers-writers-the-console-and-buffering)
6. [Directories: `Files.list` and `Files.walk`](#6-directories-fileslist-and-fileswalk)
7. [Serialization](#7-serialization)
8. [Mental-model summary](#8-mental-model-summary)
9. [Gotcha checklist](#9-gotcha-checklist)
10. [Check yourself](#-check-yourself)
11. [Sources](#-sources)

---

## 1. NIO.2: `Path` and `Files`

A `Path` names a file or directory location. The `Files` class holds static methods that operate on paths: `writeString`, `readString`, `size`, and dozens more <abbr title="Java SE 21 API, java.nio.file.Files">[1]</abbr>. What used to be many lines of stream-and-close ceremony becomes one call.

```java run
import java.nio.file.*;
import java.io.IOException;

public class Main {
    public static void main(String[] args) throws IOException {
        Path file = Path.of("greeting.txt");
        Files.writeString(file, "Hello, file!\nSecond line.\n");
        String content = Files.readString(file);
        System.out.print(content);
        System.out.println("size: " + Files.size(file) + " bytes");
    }
}
```

**Output:**
```
Hello, file!
Second line.
size: 26 bytes
```

**Analysis.** Four calls, four jobs:

- `Path.of("greeting.txt")` named a file.
- `Files.writeString` created it and wrote the text, opening, writing and closing in one call.
- `Files.readString` read it all back.
- `Files.size` reported `26` bytes: the 24 visible characters plus two newlines.

No streams to open or close by hand: `Files` handles the resource management. The methods declare `IOException`, a [checked exception](/synapse/programming-languages/java/robust-oop/exceptions), so `main` must handle or declare it.

A `Path` also has operations of its own, and none of them touches the disk <abbr title="Java SE 21 API, java.nio.file.Path">[2]</abbr>:

```java run
import java.nio.file.Path;

public class Main {
    public static void main(String[] args) {
        Path dir = Path.of("/home/ada/projects");
        Path file = dir.resolve("demo/../notes.txt");
        System.out.println("resolve:   " + file);
        System.out.println("normalize: " + file.normalize());
        System.out.println("fileName:  " + file.normalize().getFileName());
        System.out.println("parent:    " + file.normalize().getParent());
        System.out.println("relativize:" + " " + dir.relativize(Path.of("/home/ada/photos/cat.png")));
        System.out.println("absolute?  " + Path.of("notes.txt").isAbsolute());
    }
}
```

**Output:**
```
resolve:   /home/ada/projects/demo/../notes.txt
normalize: /home/ada/projects/notes.txt
fileName:  notes.txt
parent:    /home/ada/projects
relativize: ../photos/cat.png
absolute?  false
```

- `resolve` joins a path onto another; `normalize` removes the `..` and `.` parts.
- `getFileName` and `getParent` split a path; `relativize` gives the path from one location to another.
- None of these directories exists, and nothing failed: a `Path` is only a name. The output uses `/`, the separator on Linux and macOS.

**Intuition.**
*Mechanism.* A `Path` is a value describing a location; it does not touch the disk. `Files` methods are where the I/O happens. Each performs the open, operate, close cycle, and translates operating-system errors into Java exceptions.

*Concrete bite.* Because a `Path` is only a name, operating on one that does not exist fails at the `Files` call, not at `Path.of`:

```java run
import java.nio.file.*;
import java.io.IOException;

public class Main {
    public static void main(String[] args) throws IOException {
        Path missing = Path.of("does-not-exist.txt");
        System.out.println(Files.readString(missing));
    }
}
```

**Output** *(a thrown exception):*
```
Exception in thread "main" java.nio.file.NoSuchFileException: does-not-exist.txt
```

`Path.of(...)` succeeded, because it is only a name. The failure came when `Files.readString` tried to read a file that is not there. Constructing a `Path` never throws for a missing file; the `Files` operation does.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Use NIO.2 (`Path` + `Files`) for file work: it is concise, manages resources for you, and gives precise exceptions. Reach for raw streams only when you need fine control.

The cost is handling `IOException`: file I/O can fail, through missing files, permissions or full disks. The benefit is one-line reads and writes, instead of the open-read-close-in-`finally` boilerplate of the old `java.io` API.

</div>

---

## 2. Reading lines as text

Most files are line-oriented text. `Files.write(path, List<String>)` writes each element as a line, and `Files.readAllLines` reads them back into a `List<String>`.

```java run viz=array:lines
import java.nio.file.*;
import java.io.IOException;
import java.util.List;

public class Main {
    public static void main(String[] args) throws IOException {
        Path file = Path.of("data.txt");
        Files.write(file, List.of("apple", "banana", "cherry"));
        List<String> lines = Files.readAllLines(file);
        System.out.println("lines: " + lines.size());
        System.out.println(lines.get(1));
    }
}
```

**Output:**
```
lines: 3
banana
```

**Analysis.** `Files.write` wrote three lines, adding a line separator after each. `Files.readAllLines` read them into a `List` of three strings, so `lines.get(1)` is the second, `"banana"`. This is the everyday text-file pattern: write a list of lines, read a list of lines. The encoding (UTF-8 for these methods) is handled, and the file is closed for you.

**Intuition.**
*Mechanism.* `readAllLines` reads the *entire* file into memory as a `List<String>`. It splits on line terminators and decodes bytes to characters through the charset. It is eager: convenient for small and medium files, all in memory at once.

*Concrete bite.* "All into memory" is the limit. `readAllLines` on a multi-gigabyte log loads the whole thing, and can exhaust the heap. The API says so about `readString`: "It is not intended for reading very large files" <abbr title="Java SE 21 API, java.nio.file.Files.readString(Path)">[1]</abbr>. For large or unbounded files, process line by line *without* holding them all, as the next section does.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Use `readAllLines`/`readString` for files that fit comfortably in memory (configuration, small data), and the streaming `Files.lines` for large ones.

The cost of the eager methods is memory in proportion to the file's size. The benefit is simplicity: a whole file as a `String` or a `List`, when you can afford to hold it.

</div>

---

## 3. The `Stream` name clash

"Stream" means two unrelated things in Java, and it trips people up:

- A **java.io stream** (`InputStream`/`OutputStream`) is a flow of *bytes*.
- A **java.util.stream.Stream** is the *functional pipeline* from [Functional Java & the Streams API](/synapse/programming-languages/java/advanced/functional-java-and-streams).

They are different types from different packages. `Files.lines()` returns the *latter*, so you can process a file with a stream pipeline.

```java run
import java.nio.file.*;
import java.io.IOException;
import java.util.List;
import java.util.stream.Stream;

public class Main {
    public static void main(String[] args) throws IOException {
        Path file = Path.of("nums.txt");
        Files.write(file, List.of("3", "1", "4", "1", "5"));
        long count;
        try (Stream<String> lines = Files.lines(file)) {
            count = lines.filter(s -> Integer.parseInt(s) > 2).count();
        }
        System.out.println("lines > 2: " + count);
    }
}
```

**Output:**
```
lines > 2: 3
```

**Analysis.** `Files.lines(file)` returned a `java.util.stream.Stream<String>`: a lazy pipeline over the file's lines. So we `filter`ed and `count`ed as with any stream (3, 4 and 5 are greater than 2).

Crucially, it sits in a `try`-with-resources. This stream is backed by an *open file*, so it must be closed, unlike the in-memory streams of the streams lesson. It reads lazily, so it never holds the whole file in memory.

**Intuition.**
*Mechanism.* `Files.lines` opens the file and exposes its lines as a lazy `Stream<String>`, reading on demand as the pipeline pulls. It holds an operating-system file handle, so it must be closed. The API is explicit: "This method must be used within a try-with-resources statement or similar control structure to ensure that the stream's open file is closed promptly" <abbr title="Java SE 21 API, java.nio.file.Files.lines(Path)">[1]</abbr>. The unrelated `java.io` byte streams (`FileInputStream` and friends) are a separate, lower-level world for binary data.

*Concrete bite.* The name clash causes real confusion. An `InputStream` is *not* a `Stream`: it has no `map` or `filter`, and it is not interchangeable. Forgetting `try`-with-resources on `Files.lines` leaks the file handle, while a `list.stream()` holds no resource. Same word, two meanings, two lifecycles.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Read "stream" by package. `java.util.stream.Stream` is the functional pipeline (`map`/`filter`/`collect`); `java.io` streams are byte channels. Close `Files.lines`, and any resource-backed stream, with `try`-with-resources.

The cost is the terminology overhead. The benefit is that `Files.lines` brings the whole Stream API to a file, processing huge files lazily without loading them.

</div>

---

## 4. Bytes vs characters

Under text lie bytes. A `String`'s **characters** become **bytes** through a charset. In UTF-8, a non-ASCII character takes *more than one* byte. So a file's byte count and its character count differ:

```java run
import java.nio.file.*;
import java.io.IOException;

public class Main {
    public static void main(String[] args) throws IOException {
        Path file = Path.of("bytes.txt");
        Files.writeString(file, "Café");
        byte[] bytes = Files.readAllBytes(file);
        String text = Files.readString(file);
        System.out.println("bytes: " + bytes.length);
        System.out.println("chars: " + text.length());
    }
}
```

**Output:**
```
bytes: 5
chars: 4
```

**Analysis.** `"Café"` is **4 characters**, but **5 bytes** on disk. `C`, `a` and `f` are one byte each in UTF-8, while `é` is two. `readAllBytes` sees the raw bytes (`5`); `readString` decodes them back to characters (`4`).

Text is an *interpretation* of bytes, and the charset decides the bytes. The `Files` text methods use UTF-8 unless you pass another charset <abbr title="Java SE 21 API, java.nio.file.Files.readString(Path)">[1]</abbr>. Since JDK 18, UTF-8 is also Java's default charset everywhere else <abbr title="JEP 400: UTF-8 by Default (JDK 18)">[3]</abbr>. Before that, relying on the platform's default charset was a classic source of "works on my machine" bugs.

**Intuition.**
*Mechanism.* Encoding turns characters into bytes; decoding turns bytes back into characters. Both need the *same* charset. Decode with a different one, and the bytes are read as different characters.

*Concrete bite.* Write in one charset and read in another, and the text is mangled, or rejected:

```java run
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

public class Main {
    public static void main(String[] args) throws IOException {
        Path file = Path.of("cafe.txt");
        Files.writeString(file, "Café", StandardCharsets.UTF_8);
        System.out.println("read as UTF-8:      " + Files.readString(file, StandardCharsets.UTF_8));
        System.out.println("read as ISO-8859-1: " + Files.readString(file, StandardCharsets.ISO_8859_1));

        Files.writeString(file, "Café", StandardCharsets.ISO_8859_1);
        System.out.println("written as ISO-8859-1, read as UTF-8:");
        System.out.println(Files.readString(file));
    }
}
```

**Output** *(prints three lines, then a thrown exception):*
```
read as UTF-8:      Café
read as ISO-8859-1: CafÃ©
written as ISO-8859-1, read as UTF-8:
Exception in thread "main" java.nio.charset.MalformedInputException: Input length = 1
```

- UTF-8's two bytes for `é`, read as ISO-8859-1, are two characters: `Ã©`. No error; the text is silently wrong.
- ISO-8859-1 writes `é` as one byte, `0xE9`, which is not valid UTF-8 on its own. `readString` refuses it with `MalformedInputException`.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Use character I/O with an explicit charset for text, UTF-8 unless a file format says otherwise. Use byte I/O (`readAllBytes`, `InputStream`) for binary data.

The cost is being deliberate about encoding at every boundary. The benefit is text that does not silently change when it crosses a machine or a file format.

</div>

---

## 5. Readers, writers, the console and buffering

Below the one-line `Files` helpers sit four families of classes in `java.io` <abbr title="Java SE 21 API, java.io package summary">[4]</abbr>:

| | Bytes | Characters |
|---|---|---|
| In | `InputStream` | `Reader` |
| Out | `OutputStream` | `Writer` |

A **`BufferedReader`** reads characters in large blocks, and hands them out a line at a time with `readLine()`. It returns `null` at the end of the input. A **`BufferedWriter`** collects writes in memory and sends them in large blocks. `Files.newBufferedReader` and `Files.newBufferedWriter` open one on a file, with the charset you name:

```java run
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

public class Main {
    public static void main(String[] args) throws IOException {
        Path file = Path.of("log.txt");
        try (BufferedWriter w = Files.newBufferedWriter(file, StandardCharsets.UTF_8)) {
            for (int i = 1; i <= 3; i++) {
                w.write("event " + i);
                w.newLine();
            }
        }
        try (BufferedReader r = Files.newBufferedReader(file, StandardCharsets.UTF_8)) {
            String line;
            while ((line = r.readLine()) != null) {
                System.out.println("read: " + line);
            }
        }
    }
}
```

**Output:**
```
read: event 1
read: event 2
read: event 3
```

**The console.** `System.in` is an `InputStream`: bytes. An `InputStreamReader` decodes it into characters, and a `BufferedReader` around that reads whole lines. It is the classic alternative to the [`Scanner`](/synapse/programming-languages/java/first-steps/input-and-output) from the first chapter:

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        System.out.print("Your name: ");
        String name = in.readLine();
        System.out.println("Hello, " + name + "!");
        System.out.println("next readLine: " + in.readLine());
    }
}
```

**Output** *(when you type `Ada` and press Enter):*
```
Your name: Hello, Ada!
next readLine: null
```

After `Ada`, the input ended, so the second `readLine()` returned `null`. The page does not show your keystrokes; in a terminal you would see `Ada` after the prompt. Here is the **runnable twin**: the same `BufferedReader`, over a fixed `String` instead of the keyboard:

```java run
import java.io.BufferedReader;
import java.io.IOException;
import java.io.StringReader;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new StringReader("Ada\n"));   // a fixed source
        String name = in.readLine();
        System.out.println("Hello, " + name + "!");
        System.out.println("next readLine: " + in.readLine());
    }
}
```

**Output:**
```
Hello, Ada!
next readLine: null
```

A `BufferedReader` works the same over any `Reader`: a file, the console, or a `String`.

**Intuition.**
*Mechanism.* Each `read` or `write` on an unbuffered file stream can be a **system call**: a request to the operating system, which is slow. A buffer turns many small requests into a few large ones.

*Concrete bite.* Count the bytes of a 2 MB file one `read()` at a time, with and without a buffer:

```java run
import java.io.BufferedInputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;

public class Main {
    static long countBytes(InputStream in) throws IOException {
        long n = 0;
        while (in.read() != -1) n++;                 // one byte per call
        return n;
    }

    public static void main(String[] args) throws IOException {
        Path file = Path.of("big.bin");
        Files.write(file, new byte[2_000_000]);      // 2 MB of zeros

        long t0 = System.nanoTime();
        try (InputStream raw = new FileInputStream(file.toFile())) {
            System.out.println("unbuffered: " + countBytes(raw) + " bytes in "
                + (System.nanoTime() - t0) / 1_000_000 + " ms");
        }
        t0 = System.nanoTime();
        try (InputStream buffered = new BufferedInputStream(new FileInputStream(file.toFile()))) {
            System.out.println("buffered:   " + countBytes(buffered) + " bytes in "
                + (System.nanoTime() - t0) / 1_000_000 + " ms");
        }
    }
}
```

**Output** *(illustrative — timings vary per machine; three runs on JDK 21 printed 1133/41, 1168/32 and 980/32 ms):*
```
unbuffered: 2000000 bytes in 1133 ms
buffered:   2000000 bytes in 41 ms
```

The same two million `read()` calls, about 30 times faster with a buffer. `read()` returns `-1` at the end of a stream, which is how the loop stops.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Wrap raw file streams, readers and writers in their buffered forms, or use `Files.newBufferedReader`/`newBufferedWriter`. Read text line by line with `readLine()` until it returns `null`.

The cost is one more wrapper, and remembering that a `BufferedWriter` holds data until it is flushed or closed; `try`-with-resources closes it. The benefit is I/O that does not crawl one system call at a time.

</div>

---

## 6. Directories: `Files.list` and `Files.walk`

`Files.createDirectories` makes a directory and any missing parents. Two methods read a directory as a `Stream<Path>`, and both hold it open, so both go in `try`-with-resources <abbr title="Java SE 21 API, java.nio.file.Files.list(Path) and walk(Path, FileVisitOption...)">[1]</abbr>:

- `Files.list(dir)` gives the entries directly inside `dir`.
- `Files.walk(dir)` gives `dir` itself, then everything below it, at every depth.

```java run
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.stream.Stream;

public class Main {
    public static void main(String[] args) throws IOException {
        Path root = Path.of("project");
        Files.createDirectories(root.resolve("src/app"));
        Files.writeString(root.resolve("README.md"), "# demo\n");
        Files.writeString(root.resolve("src/app/Main.java"), "class Main {}\n");

        try (Stream<Path> top = Files.list(root)) {
            top.map(p -> "list: " + root.relativize(p)).sorted().forEach(System.out::println);
        }
        try (Stream<Path> all = Files.walk(root)) {
            all.map(p -> "walk: " + root.relativize(p)).sorted().forEach(System.out::println);
        }
    }
}
```

**Output:**
```
list: README.md
list: src
walk: 
walk: README.md
walk: src
walk: src/app
walk: src/app/Main.java
```

**Analysis.** `list` saw the two entries at the top: `README.md` and the directory `src`. `walk` saw five paths: the root itself (relative to itself, the empty path), then every file and directory below it. The program sorts the names, because a directory's entries come "in no specific order" <abbr title="Java SE 21 API, java.nio.file.DirectoryStream">[9]</abbr>.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Use `Files.list` for one level and `Files.walk` for a whole tree, inside `try`-with-resources, and sort when order matters.

The cost is that `walk` visits everything below the root, which can be millions of entries; pass a maximum depth, `Files.walk(dir, 2)`, to limit it. The benefit is a directory tree as an ordinary stream, ready for `filter` and `map`.

</div>

---

## 7. Serialization

**Serialization** turns an object into a stream of bytes, and **deserialization** rebuilds an object from them. "Serializability of a class is enabled by the class implementing the `java.io.Serializable` interface" <abbr title="Java SE 21 API, java.io.Serializable">[5]</abbr>. `Serializable` has no methods; it is a marker.

- `ObjectOutputStream.writeObject` writes an object; "Objects referenced by this object are written transitively" <abbr title="Java SE 21 API, java.io.ObjectOutputStream.writeObject(Object)">[11]</abbr>.
- `ObjectInputStream.readObject` reads one back, as an `Object` that you cast.
- A field marked `transient` is "not part of the persistent state of an object" <abbr title="The Java Language Specification, Java SE 21, §8.3.1.3">[6]</abbr>: it is not written, and comes back with its default value.
- `serialVersionUID` is a version number for the class's serialized form. Change the class in an incompatible way, and bump it.

This program serializes into a byte array in memory, so it needs no file:

```java run
import java.io.*;

public class Main {
    static class Account implements Serializable {
        private static final long serialVersionUID = 1L;
        final String owner;
        final int balance;
        transient String sessionToken;          // not written to the stream

        Account(String owner, int balance, String sessionToken) {
            this.owner = owner;
            this.balance = balance;
            this.sessionToken = sessionToken;
        }
    }

    public static void main(String[] args) throws IOException, ClassNotFoundException {
        Account before = new Account("Ada", 120, "tok-42");

        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        try (ObjectOutputStream out = new ObjectOutputStream(buffer)) {
            out.writeObject(before);
        }
        byte[] bytes = buffer.toByteArray();
        System.out.println("serialized to " + bytes.length + " bytes");

        try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(bytes))) {
            Account after = (Account) in.readObject();
            System.out.println("owner=" + after.owner + " balance=" + after.balance
                + " sessionToken=" + after.sessionToken);
            System.out.println("same object? " + (after == before));
        }
    }
}
```

**Output:**
```
serialized to 82 bytes
owner=Ada balance=120 sessionToken=null
same object? false
```

**Analysis.** The `Account` became 82 bytes, then a *new* object with the same `owner` and `balance`. The `transient` token was not written, so it came back `null`. `readObject` declares `ClassNotFoundException`, because the reading JVM must have the class to rebuild the object.

*Non-example: a class that is not `Serializable`.* Every object in the graph must be serializable. Otherwise `writeObject` throws:

```java run
import java.io.*;

public class Main {
    static class Point {                         // does not implement Serializable
        final int x, y;
        Point(int x, int y) { this.x = x; this.y = y; }
    }

    public static void main(String[] args) throws IOException {
        try (ObjectOutputStream out = new ObjectOutputStream(new ByteArrayOutputStream())) {
            out.writeObject(new Point(1, 2));
        }
    }
}
```

**Output** *(a thrown exception):*
```
Exception in thread "main" java.io.NotSerializableException: Main$Point
```

`Main$Point` is the binary name of the nested class `Point`.

*Edge: records.* A record is rebuilt through its canonical constructor: "During deserialization the record's canonical constructor is invoked to construct the record object" <abbr title="Java SE 21 API, java.io.ObjectInputStream, &quot;Records&quot;">[7]</abbr>. So a record's validation runs again on the way in:

```java run
import java.io.*;

public class Main {
    record Point(int x, int y) implements Serializable {
        Point {
            if (x < 0) throw new IllegalArgumentException("x must be >= 0");
            System.out.println("canonical constructor ran for x=" + x);
        }
    }

    public static void main(String[] args) throws IOException, ClassNotFoundException {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        try (ObjectOutputStream out = new ObjectOutputStream(buffer)) {
            out.writeObject(new Point(3, 4));
        }
        try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(buffer.toByteArray()))) {
            System.out.println("read back: " + in.readObject());
        }
    }
}
```

**Output:**
```
canonical constructor ran for x=3
canonical constructor ran for x=3
read back: Point[x=3, y=4]
```

The constructor ran twice: once for `new Point(3, 4)`, once during `readObject`. An ordinary class is rebuilt *without* its own constructor: "the no-arg constructor for the first non-serializable supertype is run" <abbr title="Java Object Serialization Specification, Java SE 21, §3.1">[10]</abbr>. Its own checks never run, so crafted bytes can bypass them.

<div style="border-left:4px solid #da5233;background:rgba(218,82,51,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

⚠️ **Security warning.** The `ObjectInputStream` docs open with it: "Deserialization of untrusted data is inherently dangerous and should be avoided" <abbr title="Java SE 21 API, java.io.ObjectInputStream">[7]</abbr>. `readObject` can build objects of any serializable class on the classpath, from bytes an attacker controls. If you must read serialized data from outside, restrict the classes it may contain with an `ObjectInputFilter` <abbr title="Java SE 21 API, java.io.ObjectInputFilter">[8]</abbr>. For data that crosses a trust boundary, prefer an explicit format such as JSON, and validate it.

</div>

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Use Java serialization only between programs you trust, for classes you control. Mark fields that must not be saved `transient`, declare a `serialVersionUID`, and prefer records, whose constructor checks run on the way in.

The cost of serialization is its security and versioning traps. The benefit is a whole object graph saved and restored in two calls.

</div>

---

## 8. Mental-model summary

| Principle | Consequence |
|---|---|
| `Path` names a location; `Files` performs the I/O | `Path.of` never throws for a missing file; the `Files` operation does (`NoSuchFileException`) |
| `readAllLines`/`readString` load the whole file into memory | Fine for small files; a huge file can exhaust the heap |
| `Files.lines()` returns a `java.util.stream.Stream` over lines | Lazy line processing — but it's resource-backed, so close it (`try`-with-resources) |
| "stream" means two things: `java.io` bytes vs `java.util.stream` pipeline | They're unrelated types; an `InputStream` has no `map`/`filter` |
| Text is bytes through a charset; UTF-8 is variable-width | `"Café"` is 4 chars but 5 bytes; the wrong charset mangles it or throws `MalformedInputException` |
| `InputStream`/`OutputStream` move bytes; `Reader`/`Writer` move characters | `BufferedReader.readLine()` reads lines from a file or the console, `null` at the end |
| Each unbuffered `read()` can be a system call | Buffering made 2 MB of one-byte reads about 30 times faster |
| `Files.list` is one level; `Files.walk` is the whole tree | Both are resource-backed streams in unspecified order |
| Serialization writes a `Serializable` object graph as bytes | `transient` fields come back as defaults; deserializing untrusted data is dangerous |

## 9. Gotcha checklist

<div style="border-left:4px solid #da5233;background:rgba(218,82,51,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

| Symptom | Likely cause | Fix |
|---|---|---|
| `NoSuchFileException` | the file does not exist, or the path is wrong | creating a `Path` does not create a file; check the path, or write the file first |
| `OutOfMemoryError` reading a file | `readAllLines`/`readString` loaded it all | `Files.lines`, or a `BufferedReader`, to read it line by line |
| A file stays open, or "too many open files" | a `Files.lines`, `list` or `walk` stream was never closed | `try`-with-resources |
| `InputStream` has no `filter` or `map` | an I/O stream is not a `java.util.stream.Stream` | `Files.lines` for a line stream |
| Non-ASCII text shows as `Ã©` | UTF-8 bytes decoded with another charset | read with the charset the file was written in |
| `MalformedInputException: Input length = 1` | the file is not valid UTF-8 | pass the file's real charset to `readString` |
| A written file is empty or cut short | a `BufferedWriter` was not flushed or closed | `try`-with-resources closes and flushes it |
| I/O is very slow | unbuffered one-byte reads or writes | a `Buffered…` wrapper |
| `Files.walk` output in a different order on another machine | directory order is not specified | `sorted()` |
| `NotSerializableException` | an object in the graph does not implement `Serializable` | implement it, or mark the field `transient` |
| A field is `null` after deserialization | it is `transient` | recompute it after reading |

</div>

---

## ✅ Check yourself

One check per objective. Answer before you open anything.

```quiz
{"prompt": "Files.readString(Path.of(\"nope.txt\")) on a missing file — where does it fail?", "options": ["At Path.of, with FileNotFoundException", "At readString, with NoSuchFileException", "It returns an empty string"], "answer": "At readString, with NoSuchFileException"}
```

```quiz
{"prompt": "You call Files.lines(file) outside try-with-resources, count the lines and move on. What is wrong?", "options": ["Nothing: the stream closes itself after count()", "count() fails, because the stream is lazy", "The file handle can stay open: the API requires try-with-resources or similar"], "answer": "The file handle can stay open: the API requires try-with-resources or similar"}
```

```quiz
{"prompt": "A UTF-8 file holds Café. What does Files.readString(file, StandardCharsets.ISO_8859_1) return?", "options": ["Café", "CafÃ©", "It throws MalformedInputException"], "answer": "CafÃ©"}
```

```quiz
{"prompt": "A BufferedReader reads a two-line file. What do the first three readLine() calls return?", "options": ["line 1, line 2, then null", "line 1, line 2, then an empty string", "line 1, line 2, then EOFException"], "answer": "line 1, line 2, then null"}
```

```quiz
{"prompt": "project/ holds README.md and src/app/Main.java. How many paths does Files.walk(Path.of(\"project\")) give?", "options": ["2", "3", "5"], "answer": "5"}
```

```quiz
{"prompt": "A Serializable class has a transient String token set to \"tok\". What is token after a write-then-read round trip?", "options": ["\"tok\"", "null", "The read throws NotSerializableException"], "answer": "null"}
```

<details>
<summary>The 🧪 box below: <code>"a€b"</code>; a missing file; summing the numbers in a file.</summary>

```java run
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Stream;

public class Main {
    public static void main(String[] args) throws IOException {
        Path euro = Path.of("euro.txt");
        Files.writeString(euro, "a€b");
        System.out.println("bytes: " + Files.readAllBytes(euro).length);
        System.out.println("chars: " + Files.readString(euro).length());

        Path file = Path.of("nums.txt");
        Files.write(file, List.of("3", "1", "4", "1", "5"));
        int sum;
        try (Stream<String> lines = Files.lines(file)) {
            sum = lines.mapToInt(Integer::parseInt).sum();
        }
        System.out.println("sum: " + sum);
    }
}
```

**Output:**
```
bytes: 5
chars: 3
sum: 14
```

- `"a€b"` is 3 characters and 5 bytes: `a` and `b` are one byte each, `€` is three.
- `Files.readString(Path.of("nope.txt"))` fails at `readString`, with `NoSuchFileException: nope.txt`; `Path.of` only builds a name (§1).
- `Files.lines` holds an open file, so it needs `try`-with-resources. `List.stream()` reads a list already in memory, and holds nothing to close.

</details>

---

## 📚 Sources

1. `java.nio.file.Files`, Java SE 21 API (`readString` and its UTF-8 default; "not intended for reading very large files"; `lines`, `list` and `walk` "must be used within a try-with-resources statement") — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/nio/file/Files.html>
2. `java.nio.file.Path`, Java SE 21 API (`resolve`, `normalize`, `relativize`) — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/nio/file/Path.html>
3. JEP 400: UTF-8 by Default (JDK 18) — <https://openjdk.org/jeps/400>
4. `java.io` package summary, Java SE 21 API — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/io/package-summary.html>
5. `java.io.Serializable`, Java SE 21 API — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/io/Serializable.html>
6. *The Java Language Specification, Java SE 21*, §8.3.1.3 "`transient` Fields" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.3.1.3>
7. `java.io.ObjectInputStream`, Java SE 21 API (the deserialization warning; records rebuilt through the canonical constructor) — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/io/ObjectInputStream.html>
8. `java.io.ObjectInputFilter`, Java SE 21 API — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/io/ObjectInputFilter.html>
9. `java.nio.file.DirectoryStream`, Java SE 21 API ("The elements returned by the iterator are in no specific order") — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/nio/file/DirectoryStream.html>
10. *Java Object Serialization Specification*, Java SE 21, §3.1 "The ObjectInputStream Class" — <https://docs.oracle.com/en/java/javase/21/docs/specs/serialization/input.html>
11. `java.io.ObjectOutputStream`, Java SE 21 API — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/io/ObjectOutputStream.html>

---

<div style="border-left:4px solid #6d28d9;background:rgba(109,40,217,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

🧪 **Predict, then check.**

1. Predict the byte count and character count that `Files.writeString`, then `readAllBytes`/`readString`, report for the string `"a€b"` (the euro sign `€` is 3 bytes in UTF-8).
2. Predict whether `Files.readString(Path.of("nope.txt"))` throws at `Path.of` or at `readString`, and the exception.
3. Rewrite the §3 example to *sum* the numbers in the file with a stream, and decide why the `Files.lines` stream needs a `try`-with-resources where a `List.stream()` would not.

</div>

## Your Turn

Before you move on, check your understanding with the coach — explain the idea, apply it, weigh the trade-offs, then defend your reasoning.

<div class="concept-coach"></div>
