---
title: Packages, Modules & the Build
summary: Packages namespace classes and the classpath finds them; access modifiers gain a second meaning across package boundaries. The JPMS module system (module-info.java) makes a JAR's dependencies and exported packages explicit, enforcing strong encapsulation even on public types; opens grants reflection, provides/uses wire services through ServiceLoader, and classpath code and plain JARs land in the unnamed and automatic modules. JARs bundle compiled classes, jlink builds a trimmed runtime image, and Maven/Gradle automate the whole build. Shown with real, verified terminal sessions.
prereqs: []
---

# Packages, Modules & the Build — Organizing and Shipping Code

Everything so far has been one file. Real programs are hundreds of classes across many files, pulling in libraries, built and shipped as artifacts. Java has a layered system for that:

- **Packages** group related classes into namespaces, and the **classpath** tells the tools where to find them.
- **Access modifiers** gain their full meaning: `public` vs package-private is a *boundary*, enforced between packages.
- The **module system** (JPMS, `module-info.java`) goes a level up. A module declares which packages it **exports** and which modules it **requires**, so even a `public` class stays hidden unless its package is exported.
- **JARs** bundle compiled classes into one file. **Maven/Gradle** automate compiling, dependency-fetching, and packaging.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **The core idea.**

- **Packages** namespace classes; the **classpath** tells the tools where to find them.
- **Access modifiers** become a real boundary enforced *between* packages.
- The **module system** (`module-info.java`) makes `exports`/`requires` explicit — even a `public` type stays hidden unless exported.
- **JARs** bundle classes; **Maven/Gradle** automate the whole build.

</div>

These examples span *multiple files* and use the `javac`, `jar`, `java` and `jlink` tools, so they're shown as terminal sessions. The in-page ▶ Run sandbox compiles a single file, so it can't build a multi-package project. Every command and its output below was run on JDK 21 and pasted, not typed.

**You'll be able to:** predict where `javac -d` puts a class file, and which `java -cp` command runs it; predict whether code in another package or another module can use a type, from its modifier and the module's `exports` and `requires`; explain why `exports` is not enough for reflection, and fix it with `opens`; wire a service with `provides … with`, `uses` and `ServiceLoader`; name the module that a plain JAR on the module path becomes, and build a runtime image with `jlink`.

<div style="border-left:4px solid #15448e;background:rgba(21,68,142,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

📘 **How to read the Intuition boxes.** Each one is built in three moves:

1. **The mechanism** — what the compiler and the JVM *do*.
2. **A concrete bite** — a specific, runnable failure (often a real compiler error), shown so the trap is visible.
3. **The earned rule** — the decision heuristic, now justified rather than asserted, plus its cost.

</div>

---

## Table of contents

1. [Packages and the classpath](#1-packages-and-the-classpath)
2. [Encapsulation across packages](#2-encapsulation-across-packages)
3. [Modules: `module-info.java`](#3-modules-module-infojava)
4. [Reflection and `opens`](#4-reflection-and-opens)
5. [Services: `provides`, `uses` and `ServiceLoader`](#5-services-provides-uses-and-serviceloader)
6. [The unnamed module and automatic modules](#6-the-unnamed-module-and-automatic-modules)
7. [JARs, runtime images and build tools](#7-jars-runtime-images-and-build-tools)
8. [Mental-model summary](#8-mental-model-summary)
9. [Gotcha checklist](#9-gotcha-checklist)
10. [Check yourself](#-check-yourself)
11. [Sources](#-sources)

---

## 1. Packages and the classpath

A class declares its **package** with a `package` line. By convention its source file sits in a directory path that matches the package name. Other packages reach it by its fully-qualified name or an `import`. Here a `Main` in `com.example` imports a utility from `com.example.util`:

```java
// requires: two source files in two packages — not runnable in the sandbox
// src/com/example/util/Text.java
package com.example.util;
public class Text {
    public static String shout(String s) { return s.toUpperCase() + "!"; }
}

// src/com/example/Main.java
package com.example;
import com.example.util.Text;
public class Main {
    public static void main(String[] args) {
        System.out.println(Text.shout("hello"));
    }
}
```

Compile all sources into an output directory, then run by fully-qualified class name:

```
$ javac -d out $(find src -name '*.java')
$ java -cp out com.example.Main
HELLO!
```

**Output:**
```
HELLO!
```

**Analysis.**

- `javac -d out` wrote the compiled classes in directories that mirror the package names: `out/com/example/Main.class` and `out/com/example/util/Text.class`.
- `java -cp out com.example.Main` set the **classpath** to `out`, and ran the class by its full name `com.example.Main`.
- The `import` let `Main` write `Text` instead of `com.example.util.Text`. It's a compile-time shorthand, nothing more <abbr title="The Java Language Specification, Java SE 21, §7.5">[2]</abbr>.

**Intuition.**
*Mechanism.* A package is a namespace. The classpath is the list of roots where the JVM looks for `.class` files. `java com.example.Main` means "find `com/example/Main.class` under some classpath root." The JLS leaves this file-system mapping to the host system <abbr title="The Java Language Specification, Java SE 21, §7.2">[1]</abbr>; the JDK tools use directories.

*Concrete bite.* The directory rule binds the *class files*, not the sources. `javac` compiled both files from a single `src/anywhere/` folder, and `-d out` still wrote `out/com/example/util/Text.class`. Move that class file out of its package directory, and the JVM cannot find it when `Main` first needs it:

```
$ mv out/com/example/util/Text.class out/
$ java -cp out com.example.Main
Exception in thread "main" java.lang.NoClassDefFoundError: com/example/util/Text
	at com.example.Main.main(Main.java:5)
Caused by: java.lang.ClassNotFoundException: com.example.util.Text
```

`Main` was found and started; `Text` was not, so the failure came at the first line that used it. The short name fails too: `java -cp out Main` gives `Could not find or load main class Main`, because the class is `com.example.Main`.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Organize classes into packages by feature or layer, keep source directories matching package names, and let `javac -d` lay out the class files. Run with the right classpath and the fully-qualified name.

- The cost: the directory discipline and getting the classpath right (a frequent "could not find or load main class" cause).
- The benefit: namespaced, collision-free organization that scales from one file to thousands.

</div>

---

## 2. Encapsulation across packages

[Access modifiers](/synapse/programming-languages/java/classes-and-objects/encapsulation-and-access-modifiers) showed their full meaning needs packages. A `public` member is visible everywhere; a **package-private** one (no modifier) is visible only *within its own package*. Across a package boundary, package-private is invisible — even to code that can see the class.

```java
// requires: two packages — as one file, both classes share a package and this compiles
// com.example.util.Text  (whisper has no modifier → package-private)
public class Text {
    public static String shout(String s) { return s.toUpperCase() + "!"; }
    static String whisper(String s) { return s.toLowerCase(); }
}

// com.example.Main — a DIFFERENT package — tries to call whisper
public class Main {
    public static void main(String[] args) {
        System.out.println(Text.whisper("HELLO"));
    }
}
```

```
$ javac -d out2 $(find src2 -name '*.java')
```

**Compiler error:**
```
src2/com/example/Main.java:5: error: whisper(String) is not public in Text; cannot be accessed from outside package
        System.out.println(Text.whisper("HELLO"));
                               ^
```

**Analysis.** `Text` is `public` (so `Main` can use it) and `shout` is `public` (so `Main` can call it). But `whisper` is package-private, belonging to `com.example.util`. `Main` lives in `com.example`, a *different* package. So `whisper` is off-limits: "not public … cannot be accessed from outside package." The boundary is the package, and the default (no modifier) stops at it.

**Intuition.**
*Mechanism.* The compiler resolves each access against the member's modifier *and* the accessing code's package <abbr title="The Java Language Specification, Java SE 21, §6.6.1">[3]</abbr>. Package-private grants access only to code in the same package. Crossing a package boundary requires `public` (or `protected` for subclasses).

*Concrete bite.* This is real encapsulation, not convention. A package can expose a `public` API while keeping helper classes and methods package-private, and no outside code can reach them: the compiler enforces it. It's how libraries hide their internals from consumers.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Make a package's intended API `public`, and keep everything else package-private (the default), so internals stay internal across the boundary.

- The cost: thinking about what belongs to the API.
- The benefit: a package's surface is exactly what you marked `public`. But, as the next section shows, the classpath has a hole this can't close.

</div>

---

## 3. Modules: `module-info.java`

On the classpath, any `public` type in any package is reachable by anyone. Package-private hides *members*, but a `public` class in an "internal" package is still exposed. The **module system** (JPMS, JDK 9) <abbr title="JEP 261: Module System (JDK 9)">[8]</abbr> closes that. A module declares which packages it `exports` and which modules it `requires`, in a `module-info.java` at its root <abbr title="The Java Language Specification, Java SE 21, §7.7">[4]</abbr>.

```java
// requires: a module source tree — a module-info.java is not a program
// src/com.example.app/module-info.java
module com.example.app {
    // requires java.base implicitly
    exports com.example;          // only this package is visible to other modules
    // com.example.util is NOT exported → strongly encapsulated
}
```

Compile and run with the **module path** instead of the classpath:

```
$ javac -d out --module-source-path src $(find src -name '*.java')
$ java --module-path out -m com.example.app/com.example.Main
HELLO!
```

**Output:**
```
HELLO!
```

```d2
direction: right

mod: "module com.example.app" {
  shape: package
  api: "com.example\n(exported)" { shape: rectangle }
  internal: "com.example.util\n(not exported)" { shape: rectangle }
}
client: "another module\nrequires com.example.app" {
  shape: rectangle
}

client -> mod.api: "can use"
client -> mod.internal: "cannot access"
```

**Analysis.** The module compiled and ran the same program. But now `com.example.app` controls its surface explicitly:

- `exports com.example` makes that package visible to other modules.
- `com.example.util` is **not** exported. `Text` is `public`, yet no other module can use it.
- `requires` makes every dependency explicit, so the module graph is known at compile and launch time.

The diagram shows the boundary: a requiring module reaches the exported package and is blocked from the internal one.

**Intuition.**
*Mechanism.* A module is a named set of packages, plus a `module-info` declaring `exports` (its API to other modules) and `requires` (its dependencies). The module system enforces both at compile *and* run time.

*Concrete bite.* Here is the diagram as javac sees it. A second module, `com.example.client`, declares `requires com.example.app;` and imports `com.example.util.Text`:

```
$ javac -d out --module-source-path src $(find src -name '*.java')
src/com.example.client/com/client/Client.java:2: error: package com.example.util is not visible
import com.example.util.Text;
                  ^
  (package com.example.util is declared in module com.example.app, which does not export it)
1 error
```

`Text` is `public`, and it is still unreachable: its package is not exported. Now drop the `requires` line and import the *exported* `com.example.Main` instead. The error changes to the other half of the rule:

```
src/com.example.client/com/client/Client.java:2: error: package com.example is not visible
import com.example.Main;
          ^
  (package com.example is declared in module com.example.app, but module com.example.client does not read it)
1 error
```

A module **reads** another only if it `requires` it. With `requires com.example.app;` back in place, the client compiles and prints `HELLO!`.

This is "strong encapsulation": the classpath's hole (public-but-internal types leaking) is sealed. It's why the JDK itself is modularized — `java.base`, `java.sql`, and more. Since JDK 17, the JDK's own internals are strongly encapsulated too, and reaching into them needs an explicit `--add-opens` <abbr title="JEP 403: Strongly Encapsulate JDK Internals (JDK 17)">[10]</abbr>.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Use modules when you ship a library or a large app and want to *enforce* its API surface and dependencies, not only document them.

- The cost is real friction: every dependency must be `requires`d, reflective and classpath tricks break, and much of the ecosystem still runs on the classpath.
- The benefit: reliable, declared boundaries. For application code the classpath is often fine; modules earn their keep for libraries and platforms.

</div>

---

## 4. Reflection and `opens`

**Reflection** is code that inspects classes while the program runs: it can list a class's fields and read them by name. JSON and database libraries use it to fill objects without knowing their classes in advance. `exports` does not grant reflective access to `private` members. That takes `opens` <abbr title="The Java Language Specification, Java SE 21, §7.7.2">[5]</abbr>.

Module `com.lib` exports `com.lib.model`, whose `Secret` class has a `private` field. A second module reads the field by reflection:

```java
// requires: two modules, com.lib and com.inspect — not runnable in the sandbox
// src/com.lib/module-info.java
module com.lib {
    exports com.lib.model;
}

// src/com.lib/com/lib/model/Secret.java
package com.lib.model;
public class Secret {
    private String value = "hidden";
}

// src/com.inspect/com/inspect/Peek.java  (module com.inspect { requires com.lib; })
package com.inspect;
import java.lang.reflect.Field;
import com.lib.model.Secret;
public class Peek {
    public static void main(String[] args) throws Exception {
        Field f = Secret.class.getDeclaredField("value");
        f.setAccessible(true);
        System.out.println("value = " + f.get(new Secret()));
    }
}
```

```
$ java --module-path out -m com.inspect/com.inspect.Peek
Exception in thread "main" java.lang.reflect.InaccessibleObjectException: Unable to make field private java.lang.String com.lib.model.Secret.value accessible: module com.lib does not "opens com.lib.model" to module com.inspect
```

**Analysis.** It compiled, because reflection names the field as a string. It failed at run time, at `setAccessible(true)`. The message names the missing line. Add `opens com.lib.model;` to `com.lib`'s `module-info.java`, recompile, and the same command prints `value = hidden`.

**Intuition.**
*Mechanism.* `exports` and `opens` grant different things <abbr title="The Java Language Specification, Java SE 21, §7.7.2">[5]</abbr>:

- `exports` grants compile-time and run-time access to the package's `public` and `protected` types and members.
- `opens` grants run-time access only, but to *all* members, `private` ones included, through reflection.

A package can be exported, opened, both, or neither. `opens com.lib.model to some.module;` limits it to one module.

*Concrete bite.* On the classpath, the same `Peek` prints `value = hidden` with no `opens` at all. Classpath code lives in the unnamed module, which opens everything (§6). Code that worked on the classpath can therefore fail the day it moves to the module path: frameworks hit exactly this.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** `exports` what other modules compile against. `opens` only what a framework must reach by reflection, and prefer `opens … to` that framework's module.

- The cost: one more line to keep in step when a library starts to use reflection.
- The benefit: `private` stays private, except where you chose to open it.

</div>

---

## 5. Services: `provides`, `uses` and `ServiceLoader`

A **service** lets a module use an implementation it does not name, or even `require`. Three modules share the work <abbr title="The Java Language Specification, Java SE 21, §7.7.3–7.7.4">[6]</abbr>:

- `greet.api` exports an interface, `com.greet.api.Greeter`.
- `greet.english` implements it, and says so with `provides … with`. Its package is not exported.
- `greet.app` declares `uses com.greet.api.Greeter`, and asks `ServiceLoader` for implementations <abbr title="java.util.ServiceLoader, Java SE 21 API">[12]</abbr>.

```java
// requires: three modules — not runnable in the sandbox
// src/greet.api/module-info.java
module greet.api {
    exports com.greet.api;
}

// src/greet.english/module-info.java
module greet.english {
    requires greet.api;
    provides com.greet.api.Greeter with com.greet.english.EnglishGreeter;
}

// src/greet.app/module-info.java
module greet.app {
    requires greet.api;
    uses com.greet.api.Greeter;
}

// src/greet.app/com/greet/app/Main.java
package com.greet.app;
import java.util.ServiceLoader;
import com.greet.api.Greeter;
public class Main {
    public static void main(String[] args) {
        int found = 0;
        for (Greeter g : ServiceLoader.load(Greeter.class)) {
            System.out.println(g.greet("Ada"));
            found++;
        }
        System.out.println(found + " greeter(s) found");
    }
}
```

`Greeter` declares `String greet(String name)`, and `EnglishGreeter` returns `"Hello, " + name`. With all three modules on the module path:

```
$ javac -d out --module-source-path src $(find src -name '*.java')
$ java --module-path out -m greet.app/com.greet.app.Main
Hello, Ada
1 greeter(s) found
```

```d2
direction: right

api: "greet.api\nexports Greeter" { shape: rectangle }
english: "greet.english\nprovides Greeter\nwith EnglishGreeter" { shape: rectangle }
app: "greet.app\nuses Greeter" { shape: rectangle }

english -> api: "requires"
app -> api: "requires"
app -> english: "ServiceLoader finds\n(no requires)" { style.stroke-dash: 4 }
```

**Analysis.** `greet.app` never mentions `greet.english`. `ServiceLoader.load(Greeter.class)` found the provider because `greet.english` was on the module path and declared `provides`. Take that module off the path, and the same program still runs:

```
$ java --module-path out-noeng -m greet.app/com.greet.app.Main
0 greeter(s) found
```

**Intuition.**
*Mechanism.* `provides` registers an implementation in the module's descriptor. `uses` tells the module system that this module will look one up. At run time, `ServiceLoader` searches the modules that were resolved for providers of that interface. The consumer depends only on the interface.

*Concrete bite.* Forget `uses` in `greet.app`, and it still compiles. The lookup fails at run time instead:

```
Exception in thread "main" java.util.ServiceConfigurationError: com.greet.api.Greeter: module greet.app does not declare `uses`
```

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Use a service when the consumer should work with whichever implementations are installed: plug-ins, drivers, formats. Put the interface in its own exported module, `provides` in each implementation, and `uses` in the consumer.

- The cost: three modules instead of one, and a lookup that can find zero providers.
- The benefit: add or remove an implementation by changing the module path, without recompiling the consumer.

</div>

---

## 6. The unnamed module and automatic modules

Not all code is modular, and the module system has a place for all of it <abbr title="The Java Language Specification, Java SE 21, §7.7.5">[7]</abbr>:

- Code on the **classpath** belongs to the **unnamed module**. It reads every module, and exports and opens all its packages. No named module can `require` it, because it has no name.
- A plain JAR, with no `module-info.class`, placed on the **module path** becomes an **automatic module**. Its name comes from the manifest's `Automatic-Module-Name`, or else from the JAR file name <abbr title="java.lang.module.ModuleFinder, Java SE 21 API (of)">[13]</abbr>. It reads every other module, and all its packages are exported and open <abbr title="java.lang.module.ModuleDescriptor, Java SE 21 API">[15]</abbr>.

A classpath program can ask which module it is in:

```java
// requires: a package directory, run from the classpath — shown as a terminal session
package com.example;
public class Where {
    public static void main(String[] args) {
        Module m = Where.class.getModule();
        System.out.println("named: " + m.isNamed());
        System.out.println("name: " + m.getName());
        System.out.println("String is in: " + String.class.getModule().getName());
    }
}
```

```
$ java -cp uout com.example.Where
named: false
name: null
String is in: java.base
```

`Where` is in the unnamed module, and `String` is in the JDK's named module `java.base`.

Now package `com.example.util.Text` alone into a plain JAR named `text-utils.jar`, and ask `jar` how it would be seen on the module path:

```
$ jar --create --file libs/text-utils.jar -C lib-classes .
$ jar --describe-module --file libs/text-utils.jar
No module descriptor found. Derived automatic module.

text.utils automatic
requires java.base mandated
contains com.example.util
```

The file name `text-utils.jar` gave the module name `text.utils`: the `.jar` is dropped, and the `-` becomes a `.`. A named module can now `requires text.utils;`:

```
$ javac -d out --module-path libs --module-source-path src $(find src -name '*.java')
$ java --module-path out:libs -m com.example.auto/com.example.auto.Main
AUTOMATIC!
text.utils
com.example.auto
```

`Main` printed `Text.shout("automatic")`, then the module of `Text`, then its own.

**Intuition.**
*Mechanism.* Automatic modules are the bridge for migration. A modular application can depend on a library that has not been modularized yet, by putting its JAR on the module path.

*Concrete bite.* An automatic name taken from a file name is fragile: rename the JAR, and every `requires` breaks. That is why libraries set `Automatic-Module-Name` in their manifest before they add a real `module-info`.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Classpath code is in the unnamed module and sees everything; that is why it runs unchanged on modern JDKs. When a modular app needs a plain JAR, put it on the module path as an automatic module, and check its name with `jar --describe-module`.

- The cost: automatic modules export everything, so they give no encapsulation.
- The benefit: you can modularize an application before all its libraries are modular.

</div>

---

## 7. JARs, runtime images and build tools

A **JAR** (Java ARchive) is a zip of compiled classes plus a manifest. With a `Main-Class`, it's *executable* — `java -jar` runs it directly:

```
$ jar --create --file app.jar --main-class com.example.Main -C out .
$ java -jar app.jar
HELLO!
```

**Output:**
```
HELLO!
```

**Analysis.** `jar --create` bundled the `out` directory's classes into `app.jar`, and recorded `com.example.Main` as the entry point in the manifest. So `java -jar app.jar` found and ran it <abbr title="The jar command, JDK 21 documentation">[14]</abbr>. A JAR is the standard unit of distribution: one file to ship, put on a classpath, or run.

A JAR that contains a `module-info.class` is a **modular JAR**. `jar --describe-module` prints its descriptor (path shortened here):

```
$ jar --create --file mlib/app.jar --main-class com.example.Main -C out/com.example.app .
$ jar --describe-module --file mlib/app.jar
com.example.app jar:file:///…/mlib/app.jar!/module-info.class
exports com.example
requires java.base mandated
contains com.example.util
main-class com.example.Main

$ java --module-path mlib -m com.example.app
HELLO!
```

The same modular JAR also works on the classpath (`java -cp mlib/app.jar com.example.Main` prints `HELLO!`). Its classes then belong to the unnamed module <abbr title="java.lang.Module, Java SE 21 API">[16]</abbr>.

**A runtime image with `jlink`.** `jlink` links your modules with only the JDK modules they need into a self-contained directory: a **runtime image** with its own `java` <abbr title="JEP 282: jlink: The Java Linker (JDK 9)">[9]</abbr> <abbr title="The jlink command, JDK 21 documentation">[11]</abbr>. The machine that runs it needs no JDK installed.

```
$ jlink --module-path out --add-modules com.example.app --launcher hello=com.example.app/com.example.Main --output image
$ image/bin/hello
HELLO!
$ image/bin/java --list-modules
com.example.app
java.base@21.0.12.1
```

**Analysis.**

- The image holds two modules: the app, and `java.base`, the one JDK module it `requires`.
- `--launcher` wrote the script `image/bin/hello`.
- On this machine the image took 48 MB, against 335 MB for the full JDK it came from (`du -sh`). Your `java.base` version and the sizes will differ.

`jlink` needs modules: a classpath-only application has no module graph to link.

**Intuition.**
*Mechanism.* **Maven** and **Gradle** are build tools. From a project descriptor, they download declared dependencies (from repositories like Maven Central), compile, test, and package into a JAR. They turn the manual `javac`/`jar` dance into one command (`mvn package`, `gradle build`). They define the project's coordinates, dependencies, and lifecycle.

*Concrete bite.* The descriptor is the project's source of truth. A Maven `pom.xml` dependency —
```
<dependency>
  <groupId>com.google.guava</groupId>
  <artifactId>guava</artifactId>
  <version>33.0.0-jre</version>
</dependency>
```
or the Gradle equivalent `implementation("com.google.guava:guava:33.0.0-jre")` — declares a library by coordinates. The tool resolves it, and *its* dependencies transitively, so you never manage JARs by hand.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Use `javac`, `jar` and `jlink` to understand what's happening, but use a build tool (Maven or Gradle) for any real project. Declare dependencies by coordinates, and let it handle resolution, compilation, and packaging.

- The cost: learning the tool and its conventions.
- The benefit: reproducible builds with managed, transitive dependencies. Past a couple of files, that is non-negotiable. [Testing, Tooling & Packaging](/synapse/programming-languages/java/advanced/testing-tooling-and-packaging) returns to build tools, alongside testing and shipping a runnable JAR.

</div>

---

## 8. Mental-model summary

| Principle | Consequence |
|---|---|
| A package is a namespace; its class files sit in matching directories under a classpath root | `javac -d` lays them out; a moved class file gives `NoClassDefFoundError` |
| `import` only abbreviates names; it includes no code | The class is resolved at run time via the classpath |
| Package-private is invisible across a package boundary | A library exposes `public` API and hides internals by default |
| A module `exports`/`requires` packages explicitly (JPMS) | Even a `public` type in a non-exported package is inaccessible; an unread module is invisible |
| `opens` grants run-time reflective access, `private` members included | `exports` alone makes `setAccessible(true)` throw `InaccessibleObjectException` |
| `provides … with` and `uses` connect modules through `ServiceLoader` | The consumer names only the interface; providers come from the module path |
| Classpath code is in the unnamed module; a plain JAR on the module path is automatic | The unnamed module reads, exports and opens everything; an automatic module's name comes from its JAR |
| JARs bundle classes; `jlink` builds a runtime image; Maven/Gradle automate the build | Ship a JAR or a trimmed image; declare dependencies by coordinates |

## 9. Gotcha checklist

<div style="border-left:4px solid #da5233;background:rgba(218,82,51,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

| Symptom | Likely cause | Fix |
|---|---|---|
| `Could not find or load main class Main` | the class was named without its package, or the classpath root is wrong | `java -cp <root> com.example.Main` |
| `NoClassDefFoundError: com/example/util/Text` | the class file is not in the directory its package names | compile with `javac -d`, and keep the output layout |
| `package X does not exist` / `cannot find symbol` | the dependency isn't on the classpath or module path | add it, or declare it in the build tool |
| `whisper(String) is not public in Text; cannot be accessed from outside package` | a package-private member used from another package | make it `public`, or move the caller into the package |
| `package com.example.util is not visible` … `which does not export it` | the package is not exported by its module | add `exports com.example.util;`, or use only the exported API |
| `package com.example is not visible` … `does not read it` | the using module lacks `requires` | add `requires com.example.app;` |
| `InaccessibleObjectException` … `does not "opens com.lib.model"` | reflection into a package that is exported but not opened | add `opens com.lib.model;` (or `opens … to` the one module) |
| `ServiceConfigurationError` … `module greet.app does not declare` … `uses` | `ServiceLoader` called from a module with no `uses` | add `uses <interface>;` |
| `0 greeter(s) found` | no provider module on the module path | add the provider's module, and check its `provides … with` |
| A `requires` on a library breaks after renaming its JAR | the automatic module name came from the file name | depend on a JAR with `Automatic-Module-Name`, or keep the name |
| Managing library JARs by hand | — | use Maven or Gradle; declare dependencies by coordinates |

</div>

---

## ✅ Check yourself

One check per objective. Answer before you open anything.

```quiz
{"prompt": "src/anywhere/Text.java begins with package com.example.util;. After javac -d out src/anywhere/Text.java, where is Text.class?", "options": ["out/anywhere/Text.class", "out/com/example/util/Text.class", "out/Text.class"], "answer": "out/com/example/util/Text.class"}
```

```quiz
{"prompt": "Module com.example.app exports only com.example. Module com.example.client requires com.example.app and imports the public class com.example.util.Text. What does javac say?", "options": ["package com.example.util is not visible (… which does not export it)", "It compiles, because Text is public", "package com.example.util does not exist"], "answer": "package com.example.util is not visible (… which does not export it)"}
```

```quiz
{"prompt": "Module com.lib exports com.lib.model but does not open it. Another module calls setAccessible(true) on a private field of a class in it. What happens?", "options": ["It does not compile", "It throws InaccessibleObjectException at run time", "It works, because the package is exported"], "answer": "It throws InaccessibleObjectException at run time"}
```

```quiz
{"prompt": "greet.app declares uses com.greet.api.Greeter and requires only greet.api. greet.english, which provides Greeter, is on the module path. What does ServiceLoader.load(Greeter.class) find?", "options": ["Nothing: greet.app does not require greet.english", "EnglishGreeter", "It does not compile"], "answer": "EnglishGreeter"}
```

```quiz
{"prompt": "A JAR named text-utils.jar has no module-info.class and no Automatic-Module-Name. On the module path, what is its module name?", "options": ["text-utils", "text.utils", "It has no name: it is the unnamed module"], "answer": "text.utils"}
```

<details>
<summary>The 🧪 box below: the directory for <code>com.shop.model</code>, <code>validate()</code>, and <code>com.shop.internal</code>.</summary>

- `package com.shop.model;` belongs in `…/com/shop/model/`. For the source file that is the convention; for the class file it is required, and `javac -d` puts it there (§1).
- From `com.shop.web`, the `public` field of `Order` is accessible. The package-private `validate()` is not: `validate() is not public in Order; cannot be accessed from outside package`.
- A module that declares only `exports com.shop.api;` hides every `public` class in `com.shop.internal`: `package com.shop.internal is not visible` (§3). The one line that changes it is `exports com.shop.internal;`.

</details>

---

## 📚 Sources

1. *The Java Language Specification, Java SE 21*, §7.2 "Host Support for Modules and Packages" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-7.html#jls-7.2>
2. *The Java Language Specification, Java SE 21*, §7.5 "Import Declarations" (makes classes "available by their simple names") — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-7.html#jls-7.5>
3. *The Java Language Specification, Java SE 21*, §6.6.1 "Determining Accessibility" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-6.html#jls-6.6.1>
4. *The Java Language Specification, Java SE 21*, §7.7 "Module Declarations" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-7.html#jls-7.7>
5. *The Java Language Specification, Java SE 21*, §7.7.2 "Exported and Opened Packages" (`opens`: "access at run time, but not compile time", and reflective access) — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-7.html#jls-7.7.2>
6. *The Java Language Specification, Java SE 21*, §7.7.3 "Service Consumption" and §7.7.4 "Service Provision" — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-7.html#jls-7.7.3>
7. *The Java Language Specification, Java SE 21*, §7.7.5 "Unnamed Modules" (reads every observable module; exports and opens every package) — <https://docs.oracle.com/javase/specs/jls/se21/html/jls-7.html#jls-7.7.5>
8. JEP 261: Module System (JDK 9) — <https://openjdk.org/jeps/261>
9. JEP 282: jlink: The Java Linker (JDK 9) — <https://openjdk.org/jeps/282>
10. JEP 403: Strongly Encapsulate JDK Internals (JDK 17) — <https://openjdk.org/jeps/403>
11. The `jlink` command, JDK 21 documentation ("assemble and optimize a set of modules and their dependencies into a custom runtime image") — <https://docs.oracle.com/en/java/javase/21/docs/specs/man/jlink.html>
12. `java.util.ServiceLoader`, Java SE 21 API — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/ServiceLoader.html>
13. `java.lang.module.ModuleFinder`, Java SE 21 API (`of`: automatic module names from `Automatic-Module-Name` or the JAR file name) — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/module/ModuleFinder.html>
14. The `jar` command, JDK 21 documentation — <https://docs.oracle.com/en/java/javase/21/docs/specs/man/jar.html>
15. `java.lang.module.ModuleDescriptor`, Java SE 21 API (an automatic module "is treated as if all packages are exported and open") — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/module/ModuleDescriptor.html>
16. `java.lang.Module`, Java SE 21 API ("All types that are not in a named module are members of their defining class loader's unnamed module") — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Module.html>

---

<div style="border-left:4px solid #6d28d9;background:rgba(109,40,217,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

🧪 **Predict, then check.**

1. Given `package com.shop.model;` in a file, predict which directory it must live in.
2. If `com.shop.model.Order` has a `public` field and a package-private `validate()` method, predict which one a class in `com.shop.web` can access.
3. For a module that declares only `exports com.shop.api;`, predict whether another module can use a `public` class in `com.shop.internal`, and what one line in `module-info.java` would change the answer.

</div>

## Your Turn

Before you move on, check your understanding with the coach — explain the idea, apply it, weigh the trade-offs, then defend your reasoning.

<div class="concept-coach"></div>
