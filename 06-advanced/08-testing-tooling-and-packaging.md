---
title: Testing, Tooling & Packaging
summary: Tests turn "I think it works" into "the machine proves it works every build." Java's assert is disabled by default, and a disabled assert does nothing at all, side effects included — which is why you use JUnit, whose @Test methods with assertEquals and assertThrows always run, via mvn test. Build tools (Maven/Gradle) resolve dependencies transitively, test and package your code; an executable JAR ships it, and a missing library shows up as NoClassDefFoundError. Reading a stack trace and a log level round it off. The capstone, shown with real terminal sessions.
prereqs: []
---

# Testing, Tooling & Packaging — Shipping Reliable Java

This is the last lesson, and it's about everything *around* the code that makes it trustworthy and shippable:

- **Tests** turn "I think it works" into "the machine verifies it works, on every build". Java's built-in `assert` is disabled by default, which is why projects test with a framework such as **JUnit**, whose `@Test` methods always run.
- **Build tools** (Maven and Gradle) take over the manual `javac`/`jar` steps from [Packages, Modules & the Build](/synapse/programming-languages/java/robust-oop/packages-modules-and-the-build). They resolve dependencies from coordinates, compile, run the tests, and package the result.
- An **executable JAR** is how you hand someone a program they can run with one command.
- A good **debugging** strategy ties it together when something still goes wrong.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **The core idea.**

- **Tests** turn "I think it works" into "the machine verifies it, every build."
- Java's `assert` is disabled by default — which is why projects test with a framework such as **JUnit**.
- **Build tools** (Maven/Gradle) resolve dependencies, compile, test, and package.
- An **executable JAR** is how you ship a program someone runs with one command.

</div>

Most examples here use multi-file projects and the `javac`/`mvn`/`gradle`/`jar` tools, so they're shown as real terminal sessions. Every command and its output was run on JDK 21 and captured; the ▶ Run blocks were compiled and run the same way.

**You'll be able to:** predict what a false `assert` does with and without `-ea`, and explain why an assertion must have no side effects; write a JUnit test with `assertEquals` and `assertThrows`, and read a failing test's report; explain what a build tool does with one declared dependency, and write it for Maven and for Gradle; build an executable JAR, and fix `no main manifest attribute` and a `NoClassDefFoundError` for a missing library; read a stack trace from the first frame in your own code, and predict which log messages a level lets through.

<div style="border-left:4px solid #15448e;background:rgba(21,68,142,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

📘 **How to read the Intuition boxes.** Each one is built in three moves:

1. **The mechanism** — what the compiler and the JVM *do*.
2. **A concrete bite** — a specific, runnable failure (often a real compiler error), shown so the trap is visible.
3. **The earned rule** — the decision heuristic, now justified rather than asserted, plus its cost.

</div>

---

## Table of contents

1. [Testing with assertions](#1-testing-with-assertions)
2. [JUnit](#2-junit)
3. [Build tools and dependencies](#3-build-tools-and-dependencies)
4. [Shipping an executable JAR](#4-shipping-an-executable-jar)
5. [Debugging strategy](#5-debugging-strategy)
6. [Mental-model summary](#6-mental-model-summary)
7. [Gotcha checklist](#7-gotcha-checklist)
8. [Check yourself](#-check-yourself)
9. [Sources](#-sources)

---

## 1. Testing with assertions

The core idea of a test is an **assertion**: a claim that must hold, checked automatically. Java has a built-in `assert` statement. But it's **disabled unless you pass `-ea`** (enable assertions) <abbr title="The java command, JDK 21 documentation (-enableassertions)">[2]</abbr>, which makes it unsuitable as your testing tool.

```java run
public class Main {
    static int add(int a, int b) { return a + b; }
    public static void main(String[] args) {
        assert add(2, 2) == 5 : "add(2,2) should be 5";
        System.out.println("passed");
    }
}
```

**Output** *(a plain `java Main`, which is how the Run button starts it — assertions are off):*
```
passed
```

The same program, started with assertions enabled:

```
$ java -ea Main
Exception in thread "main" java.lang.AssertionError: add(2,2) should be 5
	at Main.main(Main.java:4)
```

**Analysis.**

- With `-ea`, a true assertion passes silently, and a false one throws `AssertionError` with its message. That's a check.
- **Without** `-ea` (the default), the assertion is *skipped entirely*. The program printed `passed`, even though `add(2, 2) == 5` is false.

An assertion the JVM ignores by default is worthless as a test. That is the motivation for a testing framework whose checks *always* run.

**Intuition.**
*Mechanism.* `assert cond : msg` throws `AssertionError` if `cond` is false, but only when assertions are enabled. When they are disabled, the JLS says the statement "has no effect whatsoever" <abbr title="The Java Language Specification, Java SE 21, §14.10">[1]</abbr>. Assertions were designed for internal sanity checks during development, not as a test mechanism.

*Concrete bite.* The first run is the trap: `java Main` printed `passed` for code that's wrong.

*Non-example: an assertion with a side effect.* "No effect whatsoever" includes the condition: it is not even evaluated. Put work inside an `assert`, and that work vanishes with the assertion:

```java run
public class Main {
    static int checks = 0;

    static boolean counted(boolean ok) {
        checks++;
        return ok;
    }

    public static void main(String[] args) {
        assert counted(true) : "never fails";
        System.out.println("checks = " + checks);
    }
}
```

**Output** *(a plain `java Main`):*
```
checks = 0
```

```
$ java -ea Main
checks = 1
```

The same program behaves differently depending on a launch flag. Keep every `assert` condition free of side effects.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Use `assert` only for optional internal invariant checks, with side-effect-free conditions, and know it's off by default. Use a real test framework for actual tests.

- The cost of `assert` is exactly that default-off behavior.
- The benefit of a framework, next, is checks that always run, with rich assertions and reporting.

</div>

---

## 2. JUnit

**JUnit** is a testing framework for Java:

- You write test methods marked `@Test`. An **annotation** such as `@Test` is a marker that a tool reads. You met `@Override`, which the compiler reads, in [Inheritance & Polymorphism](/synapse/programming-languages/java/robust-oop/inheritance-and-polymorphism).
- Each test asserts expected behavior with `assertEquals`, `assertThrows`, and friends.
- The framework discovers and runs them all, every time.

Here's a class and its test, written against JUnit 5's Jupiter API. JUnit 6 (6.1.3 at the time of writing) keeps that API and requires Java 17 <abbr title="JUnit User Guide, current (6.1.3)">[5]</abbr>; this same test class passes unchanged against 6.1.3.

<div style="border-left:4px solid #da5233;background:rgba(218,82,51,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

⚠️ **Not runnable here.** This block is two files in a Maven layout, and it needs the JUnit library. The sandbox's Run button cannot build it; the terminal sessions below show real runs.

</div>

```java
// requires: JUnit 5 and a two-file Maven layout — not runnable in the sandbox
// src/main/java/Calculator.java
public class Calculator {
    public int add(int a, int b) { return a + b; }
    public int divide(int a, int b) { return a / b; }
}

// src/test/java/CalculatorTest.java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CalculatorTest {
    @Test
    void addsTwoNumbers() {
        assertEquals(5, new Calculator().add(2, 3));
    }

    @Test
    void divideByZeroThrows() {
        assertThrows(ArithmeticException.class, () -> new Calculator().divide(1, 0));
    }
}
```

Run the tests with the build tool (the end of the output):

```
$ mvn test
[INFO] Running CalculatorTest
[INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.026 s -- in CalculatorTest
[INFO] 
[INFO] Results:
[INFO] 
[INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0
[INFO] 
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
```

**Analysis.** JUnit found both `@Test` methods and ran them:

- `addsTwoNumbers` checked that `add(2, 3)` equals `5`, with `assertEquals(expected, actual)`.
- `divideByZeroThrows` checked that dividing by zero throws. `assertThrows(ExceptionType, lambda)` runs the [lambda](/synapse/programming-languages/java/robust-oop/nested-and-anonymous-classes-and-lambdas), and passes only if it throws the named [exception](/synapse/programming-languages/java/robust-oop/exceptions).

Both passed: `Tests run: 2, Failures: 0`. Unlike `assert`, these checks *always* run.

**Intuition.**
*Mechanism.* JUnit finds every method marked `@Test`. Test classes and methods need not be `public`, but they must not be `private` <abbr title="JUnit 5.10.2 User Guide, §2.3 Test Classes and Methods">[4]</abbr>. It creates a new instance of the test class before each test method, so one test's fields cannot leak into the next <abbr title="JUnit 5.10.2 User Guide, §2.11 Test Instance Lifecycle">[4]</abbr>. A failed assertion throws, and JUnit records that test as failed.

*Concrete bite: a failing test.* Change the expected value to `4`, a wrong expectation, and run again. The report names the test, the line, and both values. Maven then fails the build (output trimmed at `…`):

```
$ mvn test
[ERROR] Tests run: 2, Failures: 1, Errors: 0, Skipped: 0, Time elapsed: 0.047 s <<< FAILURE! -- in CalculatorTest
[ERROR] CalculatorTest.addsTwoNumbers -- Time elapsed: 0.006 s <<< FAILURE!
org.opentest4j.AssertionFailedError: expected: <4> but was: <5>
…
[ERROR] Failures: 
[ERROR]   CalculatorTest.addsTwoNumbers:7 expected: <4> but was: <5>
[INFO] 
[ERROR] Tests run: 2, Failures: 1, Errors: 0, Skipped: 0
[INFO] 
[INFO] ------------------------------------------------------------------------
[INFO] BUILD FAILURE
```

`expected: <4> but was: <5>` is why the argument order matters: the expected value comes first. The power is regression protection. Once `divideByZeroThrows` exists, anyone who later breaks that behavior gets a red build. The test is a permanent, executable specification.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Write JUnit tests for the behavior you care about: the happy path, edge cases, and the exceptions. Run them in your build, so failures block shipping.

- The cost: writing and maintaining tests, which are code that can rot.
- The benefit: a machine-checked safety net that catches regressions at once and lets you refactor without fear.

</div>

---

## 3. Build tools and dependencies

Past a couple of files, manual `javac` doesn't scale. You need dependencies (libraries), a test phase, and packaging. **Maven** and **Gradle** automate all of it from a project descriptor.

Maven's `pom.xml` declares the project and its dependencies by **coordinates** (`groupId:artifactId:version`). The tool fetches them, and *their* dependencies, from a repository:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.example</groupId>
  <artifactId>calc</artifactId>
  <version>1.0</version>
  <properties>
    <maven.compiler.release>21</maven.compiler.release>
  </properties>
  <dependencies>
    <dependency>
      <groupId>org.junit.jupiter</groupId>
      <artifactId>junit-jupiter</artifactId>
      <version>5.10.2</version>
      <scope>test</scope>
    </dependency>
  </dependencies>
</project>
```

`mvn package` runs the lifecycle's phases in order, each one after the last: compile, test, then package <abbr title="Apache Maven, Introduction to the Build Lifecycle">[6]</abbr>. A real run, filtered to its plugin lines and results, shows that order:

```
$ mvn package
[INFO] --- compiler:3.15.0:compile (default-compile) @ calc ---
[INFO] --- compiler:3.15.0:testCompile (default-testCompile) @ calc ---
[INFO] --- surefire:3.5.4:test (default-test) @ calc ---
[INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0
[INFO] --- jar:3.5.0:jar (default-jar) @ calc ---
[INFO] BUILD SUCCESS
```

**Analysis.** The `<dependency>` block is all it takes to use JUnit. Ask Maven for the dependency tree, and one declaration turns out to be eight libraries: the one declared, and seven more:

```
$ mvn dependency:tree
[INFO] com.example:calc:jar:1.0
[INFO] \- org.junit.jupiter:junit-jupiter:jar:5.10.2:test
[INFO]    +- org.junit.jupiter:junit-jupiter-api:jar:5.10.2:test
[INFO]    |  +- org.opentest4j:opentest4j:jar:1.3.0:test
[INFO]    |  +- org.junit.platform:junit-platform-commons:jar:1.10.2:test
[INFO]    |  \- org.apiguardian:apiguardian-api:jar:1.1.2:test
[INFO]    +- org.junit.jupiter:junit-jupiter-params:jar:5.10.2:test
[INFO]    \- org.junit.jupiter:junit-jupiter-engine:jar:5.10.2:test
[INFO]       \- org.junit.platform:junit-platform-engine:jar:1.10.2:test
```

`<scope>test</scope>` makes a dependency "only available for the test compilation and execution phases" <abbr title="Apache Maven, Introduction to the Dependency Mechanism">[7]</abbr>. So the JAR that `mvn package` built holds `Calculator.class` and no JUnit class:

```
$ jar --list --file target/calc-1.0.jar
META-INF/
META-INF/MANIFEST.MF
META-INF/maven/
META-INF/maven/com.example/
META-INF/maven/com.example/calc/
Calculator.class
META-INF/maven/com.example/calc/pom.xml
META-INF/maven/com.example/calc/pom.properties
```

**Gradle.** The same project in Gradle's Kotlin DSL (`build.gradle.kts`) needs three pieces, not one <abbr title="Gradle User Guide, Testing in Java & JVM projects">[8]</abbr>:

```kotlin
plugins {
    java
}

repositories {
    mavenCentral()
}

dependencies {
    testImplementation("org.junit.jupiter:junit-jupiter:5.10.2")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.test {
    useJUnitPlatform()
}
```

With this file, `gradle test` ran both tests and passed. Leave out `useJUnitPlatform()`, and Gradle 9.7.1 fails with "the test task did not discover any tests to execute". Leave out the launcher line, and it says `Failed to load JUnit Platform`.

**Intuition.**
*Mechanism.* A build tool models the project as a descriptor (`pom.xml` or `build.gradle.kts`) plus a fixed sequence of steps. It resolves the dependency graph from repositories such as Maven Central, caches the artifacts locally, compiles, runs the tests, and packages. It does this the same way on every machine.

*Concrete bite.* The transitive resolution is the real value. Declaring one dependency pulled in seven more. When two paths bring different versions of one library, Maven picks the "nearest definition": the version closest to your project in the tree <abbr title="Apache Maven, Introduction to the Dependency Mechanism">[7]</abbr>. Doing this by hand — tracking which JAR needs which other JAR — is the "JAR hell" build tools were invented to end.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Use a build tool (Maven or Gradle) for any real project. Declare dependencies by coordinates, give test libraries the test scope, and let the tool resolve, compile, test, and package.

- The cost: learning the tool's model and conventions, and occasional dependency-conflict debugging.
- The benefit: reproducible builds with managed transitive dependencies, the baseline for collaborating and shipping.

</div>

---

## 4. Shipping an executable JAR

A **JAR** (Java ARchive) is a ZIP file of classes plus a manifest, `META-INF/MANIFEST.MF` <abbr title="JAR File Specification, JDK 21">[9]</abbr>. To hand someone a runnable program, package it as an **executable JAR**: its manifest names the `Main-Class`, so `java -jar` launches it directly.

```
$ javac Greeting.java
$ jar --create --file app.jar --main-class Greeting Greeting.class
$ java -jar app.jar
Hello from an executable JAR!
```

**Output** *(real captured session):*
```
Hello from an executable JAR!
```

**Analysis.** `jar --create` bundled the compiled class into `app.jar`, and `--main-class` recorded `Greeting` as the entry point. The manifest shows it:

```
$ unzip -p app.jar META-INF/MANIFEST.MF
Manifest-Version: 1.0
Created-By: 21.0.12.1 (Eclipse Adoptium)
Main-Class: Greeting
```

`java -jar app.jar` read that `Main-Class` line and ran `main`: one file, one command.

This is a plain, **non-modular** JAR: it has no `module-info.class`. A JAR that has one is a **modular JAR**. [Packages, Modules & the Build](/synapse/programming-languages/java/robust-oop/packages-modules-and-the-build) builds both kinds. The same lesson shows how a plain JAR on the module path becomes an automatic module, and how `jlink` makes a runtime image.

*Non-example: a JAR with no `Main-Class`.* Build the JAR without `--main-class`, and `java -jar` has no class to start. So does the JAR `mvn package` built in §3:

```
$ jar --create --file plain.jar Greeting.class
$ java -jar plain.jar
no main manifest attribute, in plain.jar
$ java -cp plain.jar Greeting
Hello from an executable JAR!
```

Naming the class on the command line, with the JAR on the classpath, still works.

**Intuition.**
*Mechanism.* With `-jar`, "the specified JAR file is the source of all user classes, and other class path settings are ignored" <abbr title="The java command, JDK 21 documentation (-jar)">[2]</abbr>. A JAR contains *your* classes only. A library your code uses must come from somewhere else.

*Concrete bite.* Here `com.example.App` calls `Shout.loud` from a library, `acme.jar`. The app compiled against the library, but the executable JAR holds only `App` (output trimmed at `…`):

```
$ java -jar app.jar
starting
Exception in thread "main" java.lang.NoClassDefFoundError: com/acme/Shout
	at com.example.App.main(App.java:8)
Caused by: java.lang.ClassNotFoundException: com.acme.Shout
…
$ java -cp acme.jar -jar app.jar
starting
Exception in thread "main" java.lang.NoClassDefFoundError: com/acme/Shout
	at com.example.App.main(App.java:8)
Caused by: java.lang.ClassNotFoundException: com.acme.Shout
…
```

- The program *started*: `starting` printed. It failed at the first line that used `Shout`.
- `-cp acme.jar` changed nothing, because `-jar` ignores it.

Three fixes, each run.

**Fix 1: name the classpath yourself.** `java -cp app.jar:acme.jar com.example.App` printed `starting`, then `HELLO!`. (Windows separates the entries with `;` <abbr title="The java command, JDK 21 documentation (-cp)">[2]</abbr>.)

**Fix 2: a `Class-Path` manifest line.** It lists the library by a URL relative to the JAR's own location <abbr title="JAR File Specification, JDK 21 (Class-Path Attribute)">[9]</abbr>. Here `cp.txt` held the line `Class-Path: acme.jar`, and `--manifest` merged it in <abbr title="The jar command, JDK 21 documentation">[3]</abbr>:

```
$ jar --create --file app2.jar --main-class com.example.App --manifest cp.txt -C app-classes .
$ java -jar app2.jar
starting
HELLO!
```

Copy `app2.jar` to another directory without `acme.jar`, and the `NoClassDefFoundError` is back.

**Fix 3: a fat JAR**, also called an uber JAR. It carries the library's classes inside:

```
$ jar --create --file fat.jar --main-class com.example.App -C app-classes . -C lib-classes .
$ jar --list --file fat.jar
META-INF/
META-INF/MANIFEST.MF
com/
com/example/
com/example/App.class
com/acme/
com/acme/Shout.class
```

Copied alone to another directory, `java -jar fat.jar` printed `starting`, then `HELLO!`.

In practice a build tool produces the fat JAR, with a plugin such as Maven's Shade plugin, which packages "the artifact in an uber-jar, including its dependencies" <abbr title="Apache Maven Shade Plugin">[13]</abbr>.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Ship an executable JAR built by your build tool: a fat JAR for an app with dependencies, run with `java -jar`.

- The cost: configuring the packaging plugin, and a larger artifact.
- The benefit: one self-contained file that anyone with a JVM can run. That is the compile-once, run-anywhere promise of [What Java Is & Running Code](/synapse/programming-languages/java/first-steps/what-java-is-and-running-code), delivered as one command.

</div>

---

## 5. Debugging strategy

When a test goes red or production misbehaves, debug methodically, not by guesswork. The toolkit:

- **Read the stack trace.** It names the exception and the exact line.
- **Reproduce** the failure reliably. A failing test is the ideal reproduction.
- **Inspect state** with a debugger (the JDK ships `jdb` <abbr title="The jdb command, JDK 21 documentation">[10]</abbr>; every IDE has one), or with targeted logging.
- **Bisect**: narrow the problem by halving (which commit, which input, which method) until the cause is isolated.

A stack trace is a map, read from the top:

```java run
import java.util.Map;

public class Main {
    static int parsePort(String text) {
        return Integer.parseInt(text);
    }

    static int loadPort(Map<String, String> config) {
        return parsePort(config.get("port"));
    }

    public static void main(String[] args) {
        System.out.println("loading config");
        int port = loadPort(Map.of("host", "localhost"));
        System.out.println("port " + port);
    }
}
```

**Output** *(prints `loading config`, then a thrown exception):*
```
loading config
Exception in thread "main" java.lang.NumberFormatException: Cannot parse null string
	at java.base/java.lang.Integer.parseInt(Integer.java:624)
	at java.base/java.lang.Integer.parseInt(Integer.java:778)
	at Main.parsePort(Main.java:5)
	at Main.loadPort(Main.java:9)
	at Main.main(Main.java:14)
```

**Analysis.**

- The first line says *what* (`NumberFormatException`) and *why* (`Cannot parse null string`).
- The frames say *where*, innermost call first. Skip the `java.base` frames: the bug is rarely in the JDK. (Their line numbers differ between JDK builds.)
- The first frame in your own code is `Main.parsePort(Main.java:5)`. But the `null` came from further down: `loadPort` asked for a `"port"` key that the map does not have.

The single most effective debugging move is to turn the bug into a **failing test**. It reproduces the problem on demand, and it tells you the moment you've fixed it. Then it stays as a regression guard.

**Logging.** A log message records state as the program runs, with a **level** that says how much it matters. The JDK's own API is `java.util.logging` <abbr title="Java SE 21 API, java.util.logging">[11]</abbr>. Its default configuration lets through `INFO` and above; `FINE` and lower are dropped <abbr title="JDK 21, conf/logging.properties (.level= INFO)">[12]</abbr>. This program sends each record to standard output, so you can see which ones pass:

```java run
import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.LogRecord;
import java.util.logging.Logger;

public class Main {
    public static void main(String[] args) {
        Logger log = Logger.getLogger("orders");
        log.setUseParentHandlers(false);          // no copy on System.err
        log.addHandler(new Handler() {            // print each record to System.out
            @Override public void publish(LogRecord r) {
                System.out.println(r.getLevel() + " " + r.getLoggerName() + ": " + r.getMessage());
            }
            @Override public void flush() {}
            @Override public void close() {}
        });

        System.out.println("level: " + log.getLevel() + ", parent: " + log.getParent().getLevel());
        log.info("order 42 received");
        log.fine("order 42 has 3 lines");         // below INFO: dropped
        log.warning("order 42 is missing a postcode");

        log.setLevel(Level.FINE);
        log.fine("order 43 has 1 line");          // now published
    }
}
```

**Output:**
```
level: null, parent: INFO
INFO orders: order 42 received
WARNING orders: order 42 is missing a postcode
FINE orders: order 43 has 1 line
```

The `orders` logger had no level of its own (`null`), so it used its parent's, `INFO`. The first `fine` message was dropped. After `setLevel(Level.FINE)`, the second one passed.

**Intuition.**
*Mechanism.* A debugger pauses the JVM at a breakpoint, and lets you inspect variables and step through execution. Logging records state over time. A failing test pins the exact behavior. Each turns "it's broken somewhere" into concrete, observable facts.

*Concrete bite.* The anti-pattern is changing code at random, hoping the symptom disappears. That often hides the bug instead of fixing it, or breaks something else. Reproduce first, understand the cause, *then* fix; a fix you can't explain isn't a fix.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Debug by reproducing (ideally as a failing test), reading the stack trace to the cause, and inspecting state with a debugger or logging — not by guessing.

- The cost: the discipline to understand before editing.
- The benefit: fixes that address the cause, with a regression test that keeps the bug dead.

</div>

---

## 6. Mental-model summary

| Principle | Consequence |
|---|---|
| `assert` is disabled by default (`-ea` to enable) | It silently skips in normal runs — useless as a test mechanism |
| A disabled `assert` does not evaluate its condition | Side effects inside an `assert` happen only with `-ea` |
| JUnit `@Test` methods with assertions always run | `assertEquals(expected, actual)`/`assertThrows` check behavior; a failure fails the build |
| Build tools resolve dependencies by coordinates and run the lifecycle | One `<dependency>` pulls in its transitive dependencies; `mvn package` compiles, tests, then packages |
| Test-scoped dependencies stay out of the shipped JAR | The artifact holds your classes only |
| An executable JAR's manifest names the `Main-Class` | `java -jar app.jar` runs it; with `-jar`, `-cp` is ignored |
| A library missing at run time fails where it is first used | `NoClassDefFoundError`; fix with a classpath, `Class-Path`, or a fat JAR |
| Debug by reproduce → read the trace → inspect → fix | A failing test is the best reproduction and a permanent regression guard |
| A log level filters messages | The default passes `INFO` and above; `FINE` needs a lower level |

## 7. Gotcha checklist

<div style="border-left:4px solid #da5233;background:rgba(218,82,51,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

| Symptom | Likely cause | Fix |
|---|---|---|
| `assert` "tests" pass for broken code | assertions are off by default | use JUnit, whose checks always run (or `-ea` for internal invariants) |
| A program behaves differently with `-ea` | an `assert` condition has a side effect | move the work out of the `assert` |
| `expected: <4> but was: <5>` for a correct method | the expected and actual arguments of `assertEquals` are swapped, or the expectation is wrong | expected first, actual second |
| `mvn`/`gradle` can't find a class you use | the dependency isn't declared | add it by coordinates in `pom.xml` or `build.gradle.kts` |
| Gradle: "did not discover any tests to execute" | `useJUnitPlatform()` is missing | add `tasks.test { useJUnitPlatform() }` |
| Gradle: `Failed to load JUnit Platform` | the platform launcher is not on the test runtime classpath | add `testRuntimeOnly("org.junit.platform:junit-platform-launcher")` |
| `no main manifest attribute, in app.jar` | the JAR has no `Main-Class` | build it with `--main-class` (or the build tool's config), or run `java -cp app.jar <class>` |
| `NoClassDefFoundError` from `java -jar app.jar` | the JAR lacks a library it needs | a fat JAR, a `Class-Path` line, or `java -cp app.jar:lib.jar <class>` |
| `java -cp lib.jar -jar app.jar` still can't find the library | `-jar` ignores every other classpath setting | use one of the three fixes above |
| A `fine` log message never appears | the default level is `INFO` | set the logger's level to `FINE`, and its handler's too |
| Debugging by random edits | no reproduction | reproduce the failure as a test, read the stack trace to the cause, then fix — and keep the test |

</div>

---

## ✅ Check yourself

One check per objective. Answer before you open anything.

```quiz
{"prompt": "A program's only statements are: assert log(\"checked\"); — where log prints its argument and returns true. What does java Main print, and what does java -ea Main print?", "options": ["checked, both times", "nothing with java Main; checked with java -ea Main", "checked with java Main; nothing with java -ea Main"], "answer": "nothing with java Main; checked with java -ea Main"}
```

```quiz
{"prompt": "A JUnit test runs assertEquals(4, calc.add(2, 3)), and add is correct. What does the failure report say?", "options": ["expected: <5> but was: <4>", "expected: <4> but was: <5>", "Nothing: the test passes"], "answer": "expected: <4> but was: <5>"}
```

```quiz
{"prompt": "A pom.xml declares one dependency, org.junit.jupiter:junit-jupiter, with <scope>test</scope>. Which statement is true?", "options": ["Maven downloads only junit-jupiter; you add its dependencies by hand", "Maven also resolves junit-jupiter's own dependencies, and none of them go into the packaged JAR", "The JUnit classes are packaged into target/calc-1.0.jar"], "answer": "Maven also resolves junit-jupiter's own dependencies, and none of them go into the packaged JAR"}
```

```quiz
{"prompt": "app.jar has Main-Class: com.example.App and no Class-Path. App uses a class from lib.jar. Which command runs it?", "options": ["java -cp lib.jar -jar app.jar", "java -jar app.jar lib.jar", "java -cp app.jar:lib.jar com.example.App"], "answer": "java -cp app.jar:lib.jar com.example.App"}
```

```quiz
{"prompt": "With the JDK's default logging configuration, a logger with no level of its own gets log.info(\"a\"), log.fine(\"b\") and log.warning(\"c\"). Which messages are published?", "options": ["a and c", "a, b and c", "only c"], "answer": "a and c"}
```

<details>
<summary>Write a <code>pom.xml</code> <code>&lt;dependency&gt;</code> for a library <code>com.acme:widgets:2.1.0</code> that your main code uses. What does <code>mvn package</code> do with it, and why does <code>java -jar</code> on the result fail?</summary>

```xml
<dependency>
  <groupId>com.acme</groupId>
  <artifactId>widgets</artifactId>
  <version>2.1.0</version>
</dependency>
```

With no `<scope>`, the scope is `compile`, the default <abbr title="Apache Maven, Introduction to the Dependency Mechanism">[7]</abbr>. `mvn package` downloads `widgets` and its own dependencies, compiles your code against them, runs the tests, and builds a JAR of *your* classes only.

That JAR has no `Main-Class` unless you configure one, so `java -jar` says `no main manifest attribute`. Configure it, and `java -jar` then fails with `NoClassDefFoundError` at the first use of a `widgets` class. The library is not inside the JAR, and `-jar` ignores `-cp`. A fat JAR bundles it in.

</details>

---

## 📚 Sources

1. *The Java Language Specification, Java SE 21*, §14.10 "The `assert` Statement" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-14.html#jls-14.10>
2. The `java` command, JDK 21 documentation (`-enableassertions`; `-jar`) — <https://docs.oracle.com/en/java/javase/21/docs/specs/man/java.html>
3. The `jar` command, JDK 21 documentation — <https://docs.oracle.com/en/java/javase/21/docs/specs/man/jar.html>
4. JUnit 5.10.2 User Guide (§2.1 annotations, §2.3 test classes and methods, §2.11 test instance lifecycle) — <https://docs.junit.org/5.10.2/user-guide/index.html>
5. JUnit User Guide, current (6.1.3; "JUnit requires Java 17 (or higher) at runtime") — <https://docs.junit.org/current/user-guide/>
6. Apache Maven, *Introduction to the Build Lifecycle* — <https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html>
7. Apache Maven, *Introduction to the Dependency Mechanism* (transitive dependencies, "nearest definition", scopes) — <https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html>
8. Gradle User Guide, *Testing in Java & JVM projects* (`useJUnitPlatform`) — <https://docs.gradle.org/current/userguide/java_testing.html>
9. JAR File Specification, JDK 21 (`Main-Class`; the `Class-Path` attribute) — <https://docs.oracle.com/en/java/javase/21/docs/specs/jar/jar.html>
10. The `jdb` command, JDK 21 documentation — <https://docs.oracle.com/en/java/javase/21/docs/specs/man/jdb.html>
11. `java.util.logging`, Java SE 21 API — <https://docs.oracle.com/en/java/javase/21/docs/api/java.logging/java/util/logging/package-summary.html>
12. JDK 21, `conf/logging.properties` (`.level= INFO`; `ConsoleHandler.level = INFO`), in every JDK 21 installation
13. Apache Maven Shade Plugin — <https://maven.apache.org/plugins/maven-shade-plugin/>

---

<div style="border-left:4px solid #6d28d9;background:rgba(109,40,217,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

🧪 **Predict, then check.**

1. Predict what `java Main` (no `-ea`) prints for a program whose only statement is a *false* `assert`, versus `java -ea Main`.
2. Predict whether a JUnit test `assertEquals(4, calc.add(2, 3))` passes, and what the failure message would show.
3. Write a `pom.xml` `<dependency>` for a library `com.acme:widgets:2.1.0`. Explain what `mvn package` does with it, and why a fat JAR is needed to run the result with `java -jar`.

§1, §2's failing test and the ✅ `<details>` answer each one.

</div>

## Your Turn

Before you move on, check your understanding with the coach — explain the idea, apply it, weigh the trade-offs, then defend your reasoning.

<div class="concept-coach"></div>
