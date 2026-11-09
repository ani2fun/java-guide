---
title: "Java Backend to Staff Engineer Roadmap"
summary: "A Java-only version of the boot.dev backend path, from first program to job-ready backend developer, then on to senior, staff and principal engineer. Every course maps to a Java equivalent, and each module lists topics, resources, a project and a 'done when' test. A self-assessment shows where to start."
essential: false
---

# Java Backend to Staff Engineer Roadmap

**Last updated:** 9 Nov 2026 · **Links checked:** 8 Nov 2026

This is a Java-only version of the boot.dev backend path. It extends the path toward Senior, Staff and Principal engineer roles. Every boot.dev course is mapped to a Java equivalent. Each module lists topics, sub-topics, the best resources, and a project that proves the skill.

Jump anywhere from the contents below; every stage and phase ends with a link back here.

## Contents

1. [How to use this roadmap](#how-to-use-this-roadmap)
2. [Self-assessment: find your gaps](#self-assessment-find-your-gaps)
3. [Phase 1: Java backend foundations](#phase-1-java-backend-foundations)
   - [Course map: boot.dev to Java](#course-map-bootdev-to-java)
   - [Stage 1: Foundations (modules 1-4)](#stage-1-foundations-modules-1-4): [1 Java fundamentals](#module-1-java-fundamentals) · [2 Linux](#module-2-linux-and-the-command-line-keep) · [3 Bookbot](#module-3-bookbot-cli-project) · [4 Git](#module-4-git-keep)
   - [Stage 2: Objects and functions (modules 5-7)](#stage-2-objects-and-functions-modules-5-7): [5 OOP](#module-5-object-oriented-java) · [6 Asteroids](#module-6-asteroids-game-project) · [7 Functional Java](#module-7-functional-java)
   - [Stage 3: AI agent and algorithms (modules 8-9)](#stage-3-ai-agent-and-algorithms-modules-8-9): [8 AI agent](#module-8-ai-agent-project) · [9 DS&A](#module-9-data-structures-and-algorithms)
   - [Stage 4: Projects and professional tooling (modules 10-12)](#stage-4-projects-and-professional-tooling-modules-10-12): [10 Site generator](#module-10-static-site-generator-project) · [11 Personal project](#module-11-personal-project) · [12 Build tools and testing](#module-12-intermediate-java-build-tools-and-testing)
   - [Stage 5: HTTP and data (modules 13-16)](#stage-5-http-and-data-modules-13-16): [13 HTTP clients](#module-13-http-clients) · [14 Pokedex](#module-14-pokedex-cli-project) · [15 SQL](#module-15-sql-and-jdbc) · [16 Blog aggregator](#module-16-rss-blog-aggregator-project)
   - [Stage 6: Servers, storage and containers (modules 17-19)](#stage-6-servers-storage-and-containers-modules-17-19): [17 Spring Boot](#module-17-rest-apis-with-spring-boot) · [18 S3 and CDNs](#module-18-file-storage-and-cdns-with-aws) · [19 Docker](#module-19-docker-keep)
   - [Stage 7: Security, messaging and caching (modules 20-22)](#stage-7-security-messaging-and-caching-modules-20-22): [20 Security](#module-20-web-security-with-spring-security) · [21 Messaging](#module-21-messaging-with-rabbitmq-and-kafka) · [22 Redis](#module-22-redis-and-caching)
   - [Stage 8: AI-assisted work, capstone and job hunt (modules 23-25)](#stage-8-ai-assisted-work-capstone-and-job-hunt-modules-23-25): [23 AI coding](#module-23-ai-assisted-development) · [24 Capstone](#module-24-capstone-project) · [25 Job search](#module-25-finding-a-job-keep)
4. [Phase 2: Senior engineer](#phase-2-senior-engineer)
   - [Part 1: Engineering craft](#part-1-engineering-craft): [JVM performance](#jvm-internals-and-performance) · [Concurrency](#concurrency-in-depth) · [Code quality](#code-quality-and-design) · [Testing strategy](#testing-strategy)
   - [Part 2: Systems](#part-2-systems): [Databases](#databases-in-depth) · [Distributed systems](#distributed-systems) · [Architecture](#architecture-and-design) · [Operations](#operations-and-reliability)
   - [Habits and exit criteria](#habits-and-exit-criteria)
5. [Phase 3: Staff engineer](#phase-3-staff-engineer): [System design](#system-design-at-scale) · [Technical writing](#technical-writing) · [Influence](#influence-alignment-and-multiplying-others) · [Business sense](#business-and-product-sense) · [Practice at work](#practice-at-work)
6. [Phase 4: Principal engineer](#phase-4-principal-engineer)
7. [Quick reference and sources](#quick-reference-and-sources)

---

## How to use this roadmap

Keep boot.dev's backend sequence as the backbone and swap every Python and Go course for a Java equivalent. Then layer on senior, staff and principal skills. The later phases are built through real work, not courses.

| Phase | Goal |
| --- | --- |
| [1. Java backend foundations](#phase-1-java-backend-foundations) | Job-ready backend developer |
| [2. Senior engineer](#phase-2-senior-engineer) | Own production systems end to end |
| [3. Staff engineer](#phase-3-staff-engineer) | Lead technical direction across teams |
| [4. Principal engineer](#phase-4-principal-engineer) | Set org-wide technical strategy |

Staff and Principal titles are earned through scope and impact at work. This syllabus builds the skills; promotion comes from using them on real problems and making that impact visible.

### Getting started

1. Score yourself in the [self-assessment](#self-assessment-find-your-gaps) (0 to 3 per area).
2. Start at the earliest phase where any core area scores 0 or 1. Skim or skip modules where you already score 3.
3. Set up the toolchain: the latest Java LTS JDK, IntelliJ IDEA, Gradle or Maven, Git and Docker.
4. Fix a regular rhythm that splits your time between building, studying and writing up what you learned.
5. Start a learning log and a "brag doc" of shipped work. Both matter later for senior and staff promotions.
6. Re-run the self-assessment after each stage and re-plan from the lowest scores.

[↑ Back to contents](#contents)

---

## Self-assessment: find your gaps

Score each area honestly: 0 = never used it, 1 = followed a tutorial, 2 = used it in a real project, 3 = could teach it and debug it in production. Your lowest scores are your syllabus, and the last column takes you straight to where each one is taught.

| Area | Level | Your score (0-3) | What a 3 looks like | Where to learn it |
| --- | --- | --- | --- | --- |
| Java language (OOP, generics, records, streams) | Core |  | Writes idiomatic modern Java; explains Effective Java items | [M1](#module-1-java-fundamentals), [M5](#module-5-object-oriented-java), [M7](#module-7-functional-java) |
| Data structures and algorithms | Core |  | Picks the right collection and explains its Big-O and internals | [M9](#module-9-data-structures-and-algorithms) |
| Linux, Git, command line | Core |  | Comfortable debugging on a server over SSH | [M2](#module-2-linux-and-the-command-line-keep), [M4](#module-4-git-keep) |
| SQL and data modeling | Core |  | Designs schemas, reads query plans, picks indexes | [M15](#module-15-sql-and-jdbc), [M16](#module-16-rss-blog-aggregator-project) |
| HTTP, REST and API design | Core |  | Designs versioned, well-documented APIs | [M13](#module-13-http-clients), [M17](#module-17-rest-apis-with-spring-boot) |
| Spring Boot ecosystem | Core |  | Builds secured, tested services without a tutorial | [M17](#module-17-rest-apis-with-spring-boot), [M20](#module-20-web-security-with-spring-security) |
| Testing (JUnit, Mockito, Testcontainers) | Core |  | Writes fast, reliable unit and integration suites | [M12](#module-12-intermediate-java-build-tools-and-testing), [M17](#module-17-rest-apis-with-spring-boot) |
| Docker, CI/CD, cloud basics | Core |  | Ships a service from commit to production automatically | [M18](#module-18-file-storage-and-cdns-with-aws), [M19](#module-19-docker-keep), [M24](#module-24-capstone-project) |
| Concurrency and the JVM (threads, GC, profiling) | Senior |  | Diagnoses memory leaks and latency with JFR or a profiler | [JVM](#jvm-internals-and-performance), [Concurrency](#concurrency-in-depth) |
| Messaging and caching (Kafka, RabbitMQ, Redis) | Senior |  | Handles ordering, retries and idempotency correctly | [M21](#module-21-messaging-with-rabbitmq-and-kafka), [M22](#module-22-redis-and-caching) |
| Distributed systems fundamentals | Senior |  | Explains consistency, replication and partitioning trade-offs | [Distributed systems](#distributed-systems) |
| Observability and operations | Senior |  | Sets SLOs, builds dashboards, leads incident reviews | [Operations](#operations-and-reliability) |
| System design at scale | Staff |  | Leads design reviews across several teams | [System design](#system-design-at-scale) |
| Technical writing (design docs, RFCs, ADRs) | Staff |  | Docs regularly drive decisions across teams | [Technical writing](#technical-writing) |
| Mentoring and influence | Staff |  | Others grow faster because of you | [Influence](#influence-alignment-and-multiplying-others) |
| Business and product sense | Staff / Principal |  | Ties technical bets to revenue, cost or risk | [Business sense](#business-and-product-sense) |
| Technical strategy | Principal |  | Writes multi-year direction that leadership adopts | [Phase 4](#phase-4-principal-engineer) |

[↑ Back to contents](#contents)

---

## Phase 1: Java backend foundations

Phase 1 has eight stages. Each module below lists topics, resources (use the one marked **Primary** first), a project or practice task, and a "done when" test.

**Phase 1 is done when** you can build, test, containerize and deploy a secured Spring Boot service with a database, cache and message queue, without following a tutorial.

### Course map: boot.dev to Java

Every course in boot.dev's backend path ([official course list](https://cdn.jsdelivr.net/gh/bootdotdev/curriculum@main/paths/backend.md)) appears here in the same order. Courses marked *Keep* are language-neutral, so take them on boot.dev as they are. For the rest, you can still read boot.dev's lessons for concepts, but write every exercise and project in Java. Click a module number to jump to its syllabus.

| # | boot.dev course | Java replacement | Key Java topics and tools |
| --- | --- | --- | --- |
| [1](#module-1-java-fundamentals) | Learn Coding Basics | Java fundamentals | Types, control flow, methods, arrays, JShell |
| [2](#module-2-linux-and-the-command-line-keep) | Learn Linux | *Keep* | Bash, file system, permissions, processes |
| [3](#module-3-bookbot-cli-project) | Build a Bookbot | Bookbot CLI in Java | `java.nio.file.Files`, `Map`, sorting, `main` and args |
| [4](#module-4-git-keep) | Learn Git | *Keep* | Branching, rebasing, pull requests |
| [5](#module-5-object-oriented-java) | Learn Object Oriented Programming | Java OOP | Classes, interfaces, composition, records, enums, sealed types, generics |
| [6](#module-6-asteroids-game-project) | Build an Asteroids Game | 2D game in Java | libGDX or JavaFX, game loop, collision detection |
| [7](#module-7-functional-java) | Learn Functional Programming | Functional Java | Lambdas, Streams, `Optional`, immutability, pattern matching |
| [8](#module-8-ai-agent-project) | Build an AI Agent | AI agent in Java | LangChain4j or Spring AI, LLM API calls, tool calling |
| [9](#module-9-data-structures-and-algorithms) | Learn Data Structures and Algorithms | DS&A in Java | Collections internals, trees, graphs, BFS/DFS, Big-O |
| [10](#module-10-static-site-generator-project) | Build a Static Site Generator | Markdown-to-HTML generator | Recursion, file I/O, commonmark-java, JUnit tests |
| [11](#module-11-personal-project) | Personal Project 1 | Your choice, in Java | Gradle or Maven project, README, tests |
| [12](#module-12-intermediate-java-build-tools-and-testing) | Learn Golang | Intermediate Java and build tools | Gradle/Maven, exceptions, JUnit, Mockito, concurrency, virtual threads |
| [13](#module-13-http-clients) | Learn HTTP Clients | HTTP clients in Java | `java.net.http.HttpClient`, Jackson JSON, `CompletableFuture` |
| [14](#module-14-pokedex-cli-project) | Build a Pokedex | Pokedex CLI in Java | PokeAPI, REPL loop, cache with expiry, `ConcurrentHashMap` |
| [15](#module-15-sql-and-jdbc) | Learn SQL | *Keep*, then add JDBC | PostgreSQL, joins, indexes, plain JDBC |
| [16](#module-16-rss-blog-aggregator-project) | Build a Blog Aggregator | RSS aggregator in Java | PostgreSQL, Flyway, Spring JDBC or jOOQ, scheduled fetching |
| [17](#module-17-rest-apis-with-spring-boot) | Learn HTTP Servers | REST APIs with Spring Boot | Controllers, validation, Spring Data JPA, JWT auth, error handling |
| [18](#module-18-file-storage-and-cdns-with-aws) | Learn File Storage and CDNs | S3 and CloudFront with Java | AWS SDK for Java v2, presigned URLs, multipart uploads |
| [19](#module-19-docker-keep) | Learn Docker | *Keep*, plus Java specifics | Multi-stage Dockerfiles or Jib, JVM memory in containers |
| [20](#module-20-web-security-with-spring-security) | Learn Web Security | Spring Security | OWASP Top 10, BCrypt/Argon2, JWT, CORS, CSRF |
| [21](#module-21-messaging-with-rabbitmq-and-kafka) | Learn Pub/Sub Architecture | Messaging in Java | RabbitMQ with Spring AMQP, then Kafka with Spring for Apache Kafka |
| [22](#module-22-redis-and-caching) | Learn Redis | *Keep*, plus Java client | Spring Data Redis or Lettuce, caching patterns |
| [23](#module-23-ai-assisted-development) | Learn AI Coding | AI-assisted Java development | Coding agents in IntelliJ or the terminal; reviewing AI output |
| [24](#module-24-capstone-project) | Capstone Project | Spring Boot capstone | Several services, PostgreSQL, Kafka, Redis, Docker Compose, Testcontainers, CI |
| [25](#module-25-finding-a-job-keep) | Learn to Find a Job | *Keep*, plus Java interview prep | DS&A in Java, Spring and JVM interview questions |

---

### Stage 1: Foundations (modules 1-4)

Install [Eclipse Temurin JDK 25](https://adoptium.net/temurin/releases) (the current LTS release) and IntelliJ IDEA Community before you start.

#### Module 1: Java fundamentals

**Topics**

- Setup and tooling
  - JDK vs JRE, `javac` and `java`, running single-file programs, JShell
  - IntelliJ basics: running, debugging, breakpoints, reading stack traces
- Language basics
  - Variables, primitive vs reference types, `var`, operators, casting
  - Strings, text blocks, `StringBuilder`, string formatting
  - Control flow: `if`, `switch` expressions, `for`, `while`, enhanced `for`
- Methods
  - Parameters, return values, overloading, scope, `static` vs instance
- Arrays and lists
  - Arrays, `ArrayList`, iterating, searching, sorting
- Input and output
  - `Scanner`, `System.out.printf`, command-line arguments

**Choose your main course.** This choice also covers Modules 5 and 7, so pick once:

| Option | Cost | How current | Best for |
| --- | --- | --- | --- |
| [University of Helsinki Java Programming MOOC](https://java-programming.mooc.fi/), Parts 1-7 | Free | Legacy course, no longer updated; predates records, sealed types and virtual threads | The deepest free set of auto-tested exercises |
| [Hyperskill Java Developer track](https://hyperskill.org/courses/17-java-developer) (JetBrains Academy) | Free to start; full access and certificates are paid | Current platform that runs inside IntelliJ; the course page doesn't state a Java version | A structured, interactive course on current tooling |
| [Dev.java](https://dev.java/learn/) plus the [Exercism Java track](https://exercism.org/tracks/java) | Free | Official Oracle tutorials, kept current | Self-directed learners who want free and current |

Whichever you choose, learn the newest language features (records, `var`, switch expressions, sealed types) from Dev.java.

**Also useful**

- [Dev.java: Your First Steps in Java](https://dev.java/learn/first-steps/) and [Language Basics](https://dev.java/learn/language/constructs/): Oracle's official, current tutorials.
- [Exercism Java track](https://exercism.org/tracks/java): 159 free exercises with optional human mentor feedback.

**On Synapse**

- [First Steps: Overview](/synapse/programming-languages/java/first-steps/index) (Java)
- [Control Flow: Overview](/synapse/programming-languages/java/control-flow/index) (Java)
- [Input & Output](/synapse/programming-languages/java/first-steps/input-and-output) (Java)
- [The Collections Framework](/synapse/programming-languages/java/core-libraries/the-collections-framework) (Java)

**Practice:** finish the first four parts of your main course (MOOC Parts 1-4 or the equivalent) and 25 Exercism exercises.

**Done when:** you can write a 100-line program with methods, loops and lists without a tutorial.

#### Module 2: Linux and the command line (keep)

**Topics**

- The shell: terminals vs shells, Bash and Zsh, prompts, history, tab completion
- File system: paths, `ls`, `cd`, `cp`, `mv`, `rm`, `mkdir`, `find`, hidden files
- Programs: `PATH`, executables, environment variables, shebangs, running scripts
- Input and output: stdin, stdout, stderr, redirection, pipes, `grep`, `less`, `head`, `tail`
- Permissions: users, groups, `chmod`, `chown`, root and `sudo`
- Processes: `ps`, `top`, `kill`, signals, background jobs
- Package managers: `apt`, Homebrew, SDKMAN for Java versions
- Editors and SSH: `nano` or `vim` basics, `ssh`, `scp`, SSH keys
- Shell scripting basics: variables, conditionals, loops

**Resources**

- **Primary:** [boot.dev Learn Linux](https://www.boot.dev/courses/learn-linux): 66 lessons, in the same order as the topics above.
- [The Linux Command Line by William Shotts](https://linuxcommand.org/tlcl.php): the best free book on the subject, available as a PDF.
- [MIT Missing Semester (2026)](https://missing.csail.mit.edu/): lectures with videos on the shell, the command-line environment, debugging, Git and packaging.
- [OverTheWire Bandit](https://overthewire.org/wargames/bandit/): a game played over SSH that drills the commands.

**Practice:** complete Bandit levels 0-15 and write one Bash script that backs up a folder.

**Done when:** you can SSH into a Linux server, find a log file, filter it with `grep` and pipes, and fix a permissions error.

#### Module 3: Bookbot CLI project

**Topics:** reading files with `java.nio.file.Files` and `Path`; counting with `Map<String, Integer>`; sorting entries with `Comparator`; `main(String[] args)`; handling `IOException`.

**Resources**

- [Dev.java: file I/O](https://dev.java/learn/api/io/)
- [Dev.java: Collections and Streams](https://dev.java/learn/api/collections-and-streams/)

**On Synapse**

- [I/O, Files & NIO.2](/synapse/programming-languages/java/advanced/io-files-and-nio2) (Java)
- [Sets & Maps](/synapse/programming-languages/java/core-libraries/sets-and-maps) (Java)

**Build:** a program that takes a book's text file path as an argument and prints the word count and character frequencies, sorted from most to least common, as in the boot.dev original.

#### Module 4: Git (keep)

**Topics**

- Basics: `init`, `add`, `commit`, `status`, `log`, `.gitignore`
- Internals: blobs, trees, commits, refs and `HEAD` (why Git behaves as it does)
- Branching: `branch`, `switch`, merge, fast-forward vs merge commits
- Rewriting: `rebase`, interactive rebase, `reset` soft/mixed/hard, `revert`, `reflog`
- Remotes: `clone`, `fetch`, `pull`, `push`, tracking branches
- Collaboration: GitHub pull requests, code review, resolving merge conflicts

**Resources**

- **Primary:** [boot.dev Learn Git](https://www.boot.dev/courses/learn-git): taught by ThePrimeagen, and covers internals first.
- [Pro Git book](https://git-scm.com/book/en/v2): free and official; read chapters 1-3 and 7.
- [Learn Git Branching](https://learngitbranching.js.org/): interactive visual exercises for branching and rebasing.

**Done when:** you can rebase a feature branch, resolve a conflict and recover a lost commit with `reflog`.

[↑ Back to contents](#contents)

---

### Stage 2: Objects and functions (modules 5-7)

This stage turns you from someone who writes Java into someone who designs with it.

#### Module 5: Object-oriented Java

**Topics**

- Classes and objects
  - Fields, constructors, `this`, encapsulation, access modifiers
  - `equals`, `hashCode`, `toString` and why they must agree
  - Immutability and defensive copies
- Inheritance and polymorphism
  - `extends`, `super`, overriding, abstract classes, dynamic dispatch
  - Composition over inheritance
- Interfaces: default and static methods, interfaces as contracts
- Modern types: records, enums with fields and methods, sealed interfaces and classes
- Generics: generic classes and methods, bounded types, wildcards (`? extends`, `? super`)
- Packages and visibility
- Exceptions: checked vs unchecked, custom exceptions, try-with-resources
- Design: SOLID principles, plus the Strategy, Factory, Builder, Observer and Decorator patterns

**Resources**

- **Primary:** your main course from [Module 1](#module-1-java-fundamentals). In the Helsinki MOOC, that means Parts 4-6 and 8-11, which are heavily object-oriented.
- Dev.java: [Classes and Objects](https://dev.java/learn/language/oop/classes-objects/), [Records](https://dev.java/learn/language/oop/records/), [Inheritance](https://dev.java/learn/language/oop/inheritance/), [Interfaces](https://dev.java/learn/language/oop/interfaces/), [Generics](https://dev.java/learn/language/fp/generics/).
- [Effective Java, 3rd edition (Joshua Bloch)](https://www.informit.com/store/effective-java-9780134685991): the standard book on writing good Java. Read the chapters on creating objects, classes and interfaces, and generics.
- [Refactoring Guru: Design Patterns in Java](https://refactoring.guru/design-patterns/java): clear diagrams and Java code for every classic pattern.

**On Synapse**

- [Classes & Objects: Overview](/synapse/programming-languages/java/classes-and-objects/index) (Java)
- [Robust OOP & Error Handling: Overview](/synapse/programming-languages/java/robust-oop/index) (Java)
- [equals & hashCode](/synapse/programming-languages/java/core-libraries/equals-and-hashcode) (Java)
- [Generics](/synapse/programming-languages/java/core-libraries/generics) (Java)
- [Enums & Records](/synapse/programming-languages/java/core-libraries/enums-and-records) (Java)
- [SOLID Principles](/synapse/low-level-design/solid-principles/solid-principles) (Low Level Design)
- [Introduction to Design Patterns](/synapse/low-level-design/design-patterns/introduction-design-patterns) (Low Level Design)

**Practice:** model a library system with a sealed `Item` interface, records for value objects and an enum for loan status.

**Done when:** you can explain when to choose an interface, an abstract class or a record, and implement `equals` and `hashCode` correctly.

#### Module 6: Asteroids game project

**Topics:** the game loop and delta time; drawing shapes and sprites; keyboard input; vectors for position, velocity and rotation; circle collision detection; safely adding and removing objects during iteration; class hierarchies (`Ship`, `Asteroid`, `Shot`); game state (score, lives, game over).

**Resources**

- **Primary:** [libGDX: A Simple Game](https://libgdx.com/wiki/start/a-simple-game): the official first tutorial, covering the render loop, input, collision and sound.
- Alternative: [Dev.java: JavaFX Fundamentals](https://dev.java/learn/javafx/core/) and [JavaFX animations](https://dev.java/learn/javafx/javafx-animations/) if you prefer the standard Java UI toolkit.

**Build:** an Asteroids clone where the ship rotates, thrusts and shoots, and asteroids split into smaller ones when hit.

#### Module 7: Functional Java

**Topics**

- Lambdas, method references and functional interfaces (`Function`, `Predicate`, `Supplier`, `Consumer`, `BiFunction`)
- Streams
  - `map`, `filter`, `flatMap`, `reduce`, `collect`
  - `Collectors.groupingBy`, `partitioningBy`, `toMap`
  - Laziness, short-circuiting, and when parallel streams hurt
- `Optional`: when to use it and when not to
- Immutability: `List.of`, unmodifiable collections, records
- Pure functions, higher-order functions, recursion
- Pattern matching: `instanceof` patterns, switch patterns, record patterns with sealed types

**Resources**

- **Primary:** Dev.java: [Lambda Expressions](https://dev.java/learn/language/fp/lambdas/), [Collections and Streams](https://dev.java/learn/api/collections-and-streams/), [Using Pattern Matching](https://dev.java/learn/language/fp/pattern-matching/), [Refactoring to the Functional Style](https://dev.java/learn/language/fp/refactoring-to-functional-style/).
- [Modern Java in Action (Manning)](https://www.manning.com/books/modern-java-in-action): the best book on streams and lambdas. It dates from 2018 and covers up to Java 10, so take newer features from Dev.java.

**On Synapse**

- [Nested & Anonymous Classes; Lambdas](/synapse/programming-languages/java/robust-oop/nested-and-anonymous-classes-and-lambdas) (Java)
- [Functional Java & the Streams API](/synapse/programming-languages/java/advanced/functional-java-and-streams) (Java)
- [Sealed Classes & Pattern Matching](/synapse/programming-languages/java/robust-oop/sealed-classes-and-pattern-matching) (Java)
- [Modern Java Idioms & the Type System](/synapse/programming-languages/java/advanced/modern-java-idioms) (Java)

**Practice:** rewrite Bookbot using only streams. Then model shapes as a sealed interface and compute areas with a pattern-matching `switch`.

**Done when:** you can turn a 20-line loop into a readable stream pipeline, and know when a plain loop is clearer.

[↑ Back to contents](#contents)

---

### Stage 3: AI agent and algorithms (modules 8-9)

Most of this stage is algorithms. DS&A is the module most worth over-investing in: it pays off in interviews and in every system you build.

#### Module 8: AI agent project

**Topics**

- LLM basics for developers: tokens, context windows, system prompts, temperature
- Calling an LLM API: HTTP requests, API keys from environment variables (never in code), handling errors and rate limits
- Structured output: asking for JSON and mapping it to Java records
- Tool (function) calling: describing tools, running them, returning results to the model
- The agent loop: call the model, run tools, feed results back, and stop on completion or an iteration limit
- Safety: restricting file and command tools to one working directory
- Cost awareness: token counting and caching

**Resources**

- **Primary:** [LangChain4j: Tools (Function Calling)](https://docs.langchain4j.dev/tutorials/tools), then [Agents and Agentic AI](https://docs.langchain4j.dev/tutorials/agents) (its agentic module is marked experimental).
- [Spring AI reference (2.0)](https://docs.spring.io/spring-ai/reference/): see [Chat Client API](https://docs.spring.io/spring-ai/reference/api/chatclient.html) and [Tool Calling](https://docs.spring.io/spring-ai/reference/api/tools.html). Choose this if you plan to live in Spring.
- [Anthropic Java SDK](https://github.com/anthropics/anthropic-sdk-java): the official SDK for the Claude API, useful for building the loop by hand without a framework.
- [boot.dev Build an AI Agent](https://www.boot.dev/courses/build-ai-agent-python): read it for the design (LLMs, functions, function calling, the agent loop) and write your version in Java.

**Build:** a command-line coding agent that can list, read and write files and run a Java program inside a sandbox folder, looping until it fixes a planted bug.

#### Module 9: Data structures and algorithms

**Topics**

- Complexity
  - Big-O for time and space, best/average/worst case, amortized cost, logarithms
- Sorting and searching
  - Bubble, insertion, merge and quick sort; binary search
  - Stability, `Comparable` vs `Comparator`, `Arrays.sort` and `Collections.sort`
- Recursion
  - Base cases, call stack, exponential blow-up, memoization, intro to dynamic programming
- Linear structures
  - Arrays and dynamic arrays (`ArrayList`), linked lists, stacks, queues, deques (`ArrayDeque`)
- Hashing
  - Hash functions, collisions, how `HashMap` works (buckets, load factor, resizing), the `equals`/`hashCode` contract
- Trees
  - Binary trees and traversals, binary search trees, red-black trees (behind `TreeMap`), heaps (`PriorityQueue`), tries
- Graphs
  - Adjacency lists, BFS, DFS, topological sort, Dijkstra, union-find
- Problem-solving patterns
  - Two pointers, sliding window, prefix sums, backtracking, greedy
- Complexity classes: a working idea of P vs NP

**Resources**

- **Primary:** [Princeton Algorithms, Part I](https://www.coursera.org/learn/algorithms-part1) and [Part II](https://www.coursera.org/learn/algorithms-part2) on Coursera, by Sedgewick and Wayne. Free, taught in Java, with graded programming assignments.
- [Algorithms, 4th edition book site](https://algs4.cs.princeton.edu/home/): Java code and notes for every algorithm in the course.
- [Grokking Algorithms, 2nd edition (2024)](https://www.manning.com/books/grokking-algorithms-second-edition): the gentlest illustrated introduction. Read it first if Big-O and recursion feel shaky.
- [boot.dev Learn DS&A](https://www.boot.dev/courses/learn-data-structures-and-algorithms-python): 16 chapters that make a good topic checklist.
- Practice: [NeetCode](https://neetcode.io/roadmap) (structured problem roadmap with video solutions) and [LeetCode Top Interview 150](https://leetcode.com/studyplan/top-interview-150/).

**On Synapse**

- [Time and Space Complexity](/synapse/dsa/complexity/time-complexity) (DSA)
- [Merge Sorting](/synapse/dsa/sorting-algorithms/merge-sorting/merge-sorting) (DSA)
- [Understanding Recursion in Data Structures and Algorithms](/synapse/dsa/basic-problem-set-1/recursion/recursion-concepts) (DSA)
- [The Algorithm Design Canvas](/synapse/dsa/appendix/algorithm-design-canvas) (DSA)
- [The Collections Framework](/synapse/programming-languages/java/core-libraries/the-collections-framework) (Java)
- [equals & hashCode](/synapse/programming-languages/java/core-libraries/equals-and-hashcode) (Java)

**Practice:** implement your own `ArrayList`, linked list, `HashMap`, binary search tree and min-heap in Java with JUnit tests. Then solve 100-150 problems, grouped by pattern.

**Done when:** you can build a hash map from scratch and solve most medium-level problems in 30-40 minutes.

[↑ Back to contents](#contents)

---

### Stage 4: Projects and professional tooling (modules 10-12)

From here on, every project is a Gradle or Maven build with tests, the way it would be at work.

#### Module 10: Static site generator project

**Topics:** Markdown structure (headings, lists, links, code blocks); parsing text into a tree of nodes using recursion; rendering nodes to HTML; walking directories with `Files.walk`; copying static assets; templating; unit-testing each stage; when to use a library versus writing your own parser.

**Resources**

- [commonmark-java](https://github.com/commonmark/commonmark-java): the standard Java Markdown parser. Write a simple parser yourself first, then compare.
- [JUnit](https://junit.org/): JUnit 6 is the current generation; its user guide is linked from the home page.
- [Dev.java: file I/O](https://dev.java/learn/api/io/)

**Build:** a generator that turns a `content/` folder of Markdown files into a linked HTML site using a template, with unit tests for the parser.

#### Module 11: Personal project

**Topics:** choosing a scope small enough to finish; writing requirements as a short README first; project layout; dependency management; tests for core logic; clean commit history.

**Resources**

- [Gradle Beginner Tutorial](https://docs.gradle.org/current/userguide/part1_gradle_init.html): six short parts from `gradle init` to a working build.
- [Maven in 5 Minutes](https://maven.apache.org/guides/getting-started/maven-in-five-minutes.html) if your target employers use Maven.

**Build ideas:** a personal finance CLI, a habit tracker, a file deduplicator or a log analyzer. Pick something you will actually use.

#### Module 12: Intermediate Java, build tools and testing

Replaces boot.dev's Learn Golang course.

**Topics**

- Build tools
  - Gradle (Kotlin DSL) or Maven: dependencies, scopes, plugins, the wrapper, multi-module projects
  - Packaging a runnable JAR
- Testing
  - JUnit: assertions, lifecycle, parameterized tests, nested tests
  - Mockito: mocks, stubs, `verify`, argument captors, and when not to mock
  - AssertJ fluent assertions; test naming and structure (arrange, act, assert)
- Error handling: exception hierarchies, when to catch, fail fast, logging with SLF4J and Logback
- Dates and text: `java.time`, regular expressions
- Modules: JPMS basics and why most applications skip it
- Concurrency introduction
  - Threads, `ExecutorService`, `CompletableFuture`
  - Virtual threads (Java 21 and later)
  - Race conditions, `synchronized`, atomics, `ConcurrentHashMap`

**Resources**

- **Primary:** [Gradle Beginner Tutorial](https://docs.gradle.org/current/userguide/part1_gradle_init.html) plus the [JUnit user guide](https://junit.org/) and [Mockito](https://site.mockito.org/) documentation.
- Dev.java: [Annotations and Exceptions](https://dev.java/learn/language/annotations-exceptions/), [Dates and Regular Expressions](https://dev.java/learn/api/date-time-regex/), [Modules](https://dev.java/learn/organizing/modules/), [Virtual Threads](https://dev.java/learn/api/virtual-threads/).
- [Helsinki Java MOOC](https://java-programming.mooc.fi/), Parts 12-14, for more practice.

**On Synapse**

- [Testing, Tooling & Packaging](/synapse/programming-languages/java/advanced/testing-tooling-and-packaging) (Java)
- [Packages, Modules & the Build](/synapse/programming-languages/java/robust-oop/packages-modules-and-the-build) (Java)
- [Exceptions](/synapse/programming-languages/java/robust-oop/exceptions) (Java)
- [Dates & Times](/synapse/programming-languages/java/core-libraries/dates-and-times) (Java)
- [Concurrency: the Basics](/synapse/programming-languages/java/advanced/concurrency-the-basics) (Java)
- [Concurrency: High-Level & Virtual Threads](/synapse/programming-languages/java/advanced/concurrency-high-level-and-virtual-threads) (Java)

**Practice:** convert Bookbot and the site generator into Gradle builds with tests. Then process 1,000 files concurrently with virtual threads and measure the speed-up.

**Done when:** `./gradlew build` runs your tests and produces a working JAR, and you can explain a race condition and how to fix it.

[↑ Back to contents](#contents)

---

### Stage 5: HTTP and data (modules 13-16)

This is where you become a backend developer: talking to APIs and storing data properly.

#### Module 13: HTTP clients

**Topics**

- How the web works: DNS, TCP, TLS, anatomy of a URL
- HTTP
  - Methods, status codes, headers, request and response bodies, content types
  - Idempotency, caching headers, cookies, CORS
- JSON: syntax, mapping to records with Jackson, ignoring unknown fields
- Java `HttpClient`: synchronous vs `sendAsync` with `CompletableFuture`, timeouts, redirects, HTTP/2
- Calling REST APIs: pagination, API keys and Bearer tokens, error handling, retries with backoff
- Tools: `curl`, plus an API client such as Postman, Bruno or HTTPie

**Resources**

- **Primary:** MDN: [Overview of HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview), [HTTP messages](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Messages), [Status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status), [Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching), [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS), [Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies).
- [OpenJDK: Introduction to the Java HTTP Client](https://openjdk.org/groups/net/httpclient/intro.html)
- [Baeldung: Java HttpClient guide](https://www.baeldung.com/java-9-http-client) and [Jackson tutorials](https://www.baeldung.com/jackson)

**On Synapse**

- [Networking Essentials](/synapse/system-design-from-first-principles/foundations/networking-essentials) (System Design)
- [API Design](/synapse/system-design-from-first-principles/foundations/api-design) (System Design)

**Done when:** you can call a paginated JSON API, map the results to records, and handle timeouts and 4xx/5xx errors cleanly.

#### Module 14: Pokedex CLI project

**Topics:** a read-eval-print loop with commands (`help`, `exit`, `map`, `mapb`, `explore`, `catch`, `inspect`, `pokedex`); following paginated API links; an in-memory cache with expiry built on `ConcurrentHashMap` and a scheduled cleanup; unit tests for the cache.

**Resources:** [PokéAPI documentation](https://pokeapi.co/docs/v2), plus the [Module 13](#module-13-http-clients) resources.

**Build:** the boot.dev Pokedex in Java, where repeated requests come from the cache instead of the network.

#### Module 15: SQL and JDBC

**Topics**

- Relational model: tables, rows, primary and foreign keys, constraints
- CRUD: `INSERT`, `SELECT`, `UPDATE`, `DELETE`
- Querying: filtering, sorting, `LIMIT`/`OFFSET`, aggregates, `GROUP BY`, `HAVING`
- Joins: inner, left, right, full, self-joins
- Subqueries, common table expressions (`WITH`), window functions
- Normalization (1NF to 3NF) and when to denormalize
- Performance: indexes, `EXPLAIN`, reading query plans
- Transactions and ACID
- JDBC: `Connection`, `PreparedStatement` (which prevents SQL injection), `ResultSet`, transactions, connection pooling with HikariCP

**Resources**

- **Primary:** [boot.dev Learn SQL](https://www.boot.dev/courses/learn-sql) (keep): 97 lessons, from tables to performance.
- [SQLBolt](https://sqlbolt.com/): quick interactive lessons, good for review.
- [PostgreSQL tutorial](https://www.postgresql.org/docs/current/tutorial.html): official, for PostgreSQL 18.
- [Use The Index, Luke](https://use-the-index-luke.com/): free book on indexing, written for developers.
- [Oracle: JDBC Basics](https://docs.oracle.com/javase/tutorial/jdbc/basics/index.html): written for JDK 8, but the core JDBC API is unchanged.

**On Synapse**

- [SQL](/synapse/programming-languages/sql/index) (SQL)
- [Joins](/synapse/programming-languages/sql/multiple-tables/joins) (SQL)
- [GROUP BY and HAVING](/synapse/programming-languages/sql/aggregation/group-by-and-having) (SQL)
- [Window Basics](/synapse/programming-languages/sql/window-functions/window-basics) (SQL)
- [Non-recursive CTEs](/synapse/programming-languages/sql/ctes-and-recursion/non-recursive-ctes) (SQL)
- [Normalisation](/synapse/programming-languages/sql/schema-and-constraints/normalisation) (SQL)
- [EXPLAIN and Query Plans](/synapse/programming-languages/sql/indexes-and-performance/explain-and-query-plans) (SQL)
- [ACID and Transactions](/synapse/programming-languages/sql/transactions-and-concurrency/acid-and-transactions) (SQL)

**Practice:** design a blog schema (users, posts, comments, tags) and write 20 queries, including joins and window functions. Then run them from Java with `PreparedStatement`.

**Done when:** you can design a normalized schema, explain why a query is slow from its plan, and add the right index.

#### Module 16: RSS blog aggregator project

**Topics:** schema design and versioned migrations with Flyway; three levels of data access (plain JDBC, Spring's `JdbcClient`, then jOOQ); parsing RSS and Atom feeds; scheduled fetching with `ScheduledExecutorService`; de-duplicating posts with unique constraints; fetching feeds concurrently; CLI commands for users, feeds and follows.

**Resources**

- [Flyway documentation](https://documentation.red-gate.com/fd)
- [Spring Framework: Data Access with JDBC](https://docs.spring.io/spring-framework/reference/data-access/jdbc.html)
- [jOOQ](https://www.jooq.org/): type-safe SQL in Java, widely used in production.
- [ROME](https://github.com/rometools/rome): the standard Java library for RSS and Atom.

**On Synapse**

- [Keys and References](/synapse/programming-languages/sql/schema-and-constraints/keys-and-references) (SQL)
- [Data Definition](/synapse/programming-languages/sql/foundations/data-definition) (SQL)

**Build:** the boot.dev "Gator" aggregator in Java: register users, add and follow feeds, fetch them on a schedule into PostgreSQL, and browse the latest posts.

[↑ Back to contents](#contents)

---

### Stage 6: Servers, storage and containers (modules 17-19)

Spring Boot is the center of the Java backend job market, so give Module 17 the most time.

#### Module 17: REST APIs with Spring Boot

Replaces boot.dev's Learn HTTP Servers course.

**Topics**

- Servers from first principles
  - Build a tiny server with the JDK's built-in `HttpServer`: routing, JSON responses, status codes
  - Then see what Spring automates for you
- Spring core: inversion of control, dependency injection, beans, configuration, profiles, `application.yml`
- Spring Boot: starters, auto-configuration, Actuator health and metrics endpoints
- Spring MVC: `@RestController`, path and query parameters, request bodies, `ResponseEntity`
- Validation with Jakarta Bean Validation; global error handling with `@ControllerAdvice` and Problem Details responses
- Persistence
  - Spring Data JPA and Hibernate: entities, repositories, relationships
  - Transactions (`@Transactional`), the N+1 query problem, when to drop down to `JdbcClient`
- Authentication basics: password hashing, JWT access tokens and refresh tokens (deepened in [Module 20](#module-20-web-security-with-spring-security))
- API design: resource naming, versioning, pagination, idempotency, OpenAPI documentation
- Testing: `@WebMvcTest`, `@DataJpaTest`, `@SpringBootTest` with Testcontainers

**Resources**

- **Primary:** [Spring guide: Building REST services with Spring](https://spring.io/guides/tutorials/rest), then the [Spring Boot reference](https://docs.spring.io/spring-boot/index.html) (4.1 is the current stable line).
- [Spring Start Here (Manning)](https://www.manning.com/books/spring-start-here): the clearest beginner book on Spring fundamentals. This page is the 2021 first edition; Manning also lists a second edition.
- [Spring Data JPA reference](https://docs.spring.io/spring-data/jpa/reference/) and [Vlad Mihalcea's Hibernate tutorials](https://vladmihalcea.com/tutorials/hibernate/), the best source on JPA performance.
- [Testcontainers: Getting started in a Spring Boot project](https://testcontainers.com/guides/testing-spring-boot-rest-api-using-testcontainers/)

**On Synapse**

- [API Design](/synapse/system-design-from-first-principles/foundations/api-design) (System Design)
- [API & Database Design](/synapse/low-level-design/best-practices/apis-db-design) (Low Level Design)
- [Dependency Injection & Error Handling](/synapse/low-level-design/best-practices/dependency-injection-and-error-handling) (Low Level Design)
- [Authentication & Authorization](/synapse/system-design-from-first-principles/production-engineering/authn-authz) (System Design)

**Build:** a social-posting API like boot.dev's "Chirpy". Include users, posts, login with JWT and refresh tokens, a webhook endpoint and an admin metrics endpoint. Test it against a real PostgreSQL in Testcontainers.

**Done when:** you can build a validated, documented, tested CRUD API with auth in a day, without a tutorial.

#### Module 18: File storage and CDNs with AWS

**Topics**

- Storage choices: object storage versus files and database blobs
- S3 basics: buckets, keys and prefixes; public versus private buckets; content types
- Access: IAM users, roles and least privilege
- Uploads: the SDK, multipart uploads for large files, presigned URLs for direct browser uploads and downloads
- CDNs: edge caching, TTLs, cache invalidation, origin access control
- Video: HTTP range requests
- Local testing: LocalStack

**Resources**

- **Primary:** [AWS SDK for Java 2.x developer guide](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/home.html)
- [Amazon S3: presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html)
- [Amazon CloudFront developer guide](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html)
- [Testcontainers: Testing AWS integrations with LocalStack](https://testcontainers.com/guides/testing-aws-service-integrations-using-localstack/)

**On Synapse**

- [Object Storage & Blobs](/synapse/system-design-from-first-principles/building-blocks/object-storage-and-blobs) (System Design)
- [CDN & Edge](/synapse/system-design-from-first-principles/building-blocks/cdn-and-edge) (System Design)

**Build:** add image or video uploads to your Module 17 API using presigned URLs, served through CloudFront. Set an AWS billing alarm before you start.

#### Module 19: Docker (keep)

Take boot.dev's course as is, then add the Java specifics below.

**Topics**

- Containers versus virtual machines; images, layers and registries
- Running containers: ports, environment variables, volumes, networks, logs, `exec`
- Dockerfiles: instructions, layer caching, `.dockerignore`
- Java images
  - Multi-stage builds: build with Gradle, run on a slim JRE base image
  - Alternatives: Jib and Cloud Native Buildpacks (no Dockerfile needed)
  - JVM memory inside containers (`-XX:MaxRAMPercentage`)
- Docker Compose for an app with PostgreSQL and Redis
- Publishing images to a registry

**Resources**

- **Primary:** [boot.dev Learn Docker](https://www.boot.dev/courses/learn-docker) (keep): 43 lessons.
- [Docker: Get started](https://docs.docker.com/get-started/) and [Docker Compose docs](https://docs.docker.com/compose/)
- [Spring Boot: Container Images](https://docs.spring.io/spring-boot/reference/packaging/container-images/index.html): efficient images, Dockerfiles and Buildpacks.
- [Jib](https://github.com/GoogleContainerTools/jib): build Java images from Gradle or Maven without a Docker daemon.

**Done when:** `docker compose up` starts your API, PostgreSQL and Redis together, and your image is under 250 MB.

[↑ Back to contents](#contents)

---

### Stage 7: Security, messaging and caching (modules 20-22)

These three topics separate a junior who can build an API from one who can run it safely at scale.

#### Module 20: Web security with Spring Security

**Topics**

- The current OWASP Top 10 (2025 edition): what each risk is and how it shows up in a Java API
- Authentication
  - Password hashing with BCrypt or Argon2; never store or log plain passwords
  - Sessions versus JWTs, refresh-token rotation, logout and revocation
  - OAuth 2.0 and OpenID Connect basics, using an identity provider such as Keycloak
- Authorization: role-based checks, resource ownership checks, method security
- Spring Security: the filter chain, `SecurityFilterChain` configuration, CSRF, CORS, JWT resource servers
- Injection and XSS: prepared statements, output encoding, input validation
- Transport and secrets: HTTPS/TLS, secrets in environment variables or a vault, never in Git
- Hardening: dependency scanning, security headers, rate limiting, audit logging

**Resources**

- **Primary:** [PortSwigger Web Security Academy](https://portswigger.net/web-security): free, hands-on labs. Do the SQL injection, XSS, access control and authentication labs.
- [OWASP Top 10](https://owasp.org/www-project-top-ten/): the 2025 edition is current.
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/): read the Authentication, Password Storage, Session Management and JWT sheets.
- [Spring Security reference](https://docs.spring.io/spring-security/reference/index.html): 7.1 is the current stable line.
- [Dev.java: Security fundamentals](https://dev.java/learn/security/): encryption, digital signatures and certificates with the JDK.
- [Testcontainers: Securing Spring Boot with Keycloak](https://testcontainers.com/guides/securing-spring-boot-microservice-using-keycloak-and-testcontainers/)

**On Synapse**

- [Authentication & Authorization](/synapse/system-design-from-first-principles/production-engineering/authn-authz) (System Design)
- [Design a Rate Limiter](/synapse/system-design-from-first-principles/case-studies/rate-limiter) (System Design)

**Practice:** lock down your Module 17 API with Spring Security and ownership checks. Then try to break it using what you learned in the PortSwigger labs.

#### Module 21: Messaging with RabbitMQ and Kafka

Replaces boot.dev's Learn Pub/Sub Architecture course.

**Topics**

- Why messaging: decoupling services, smoothing load spikes, fan-out
- Broker basics: producers, consumers, queues, exchanges (direct, topic, fanout), routing keys
- Delivery guarantees
  - At-most-once vs at-least-once, acknowledgements, retries with backoff
  - Dead-letter queues and idempotent consumers (why "exactly once" is mostly a myth)
- Serialization: JSON vs Avro or Protobuf, schema evolution
- RabbitMQ with Spring AMQP
- Kafka
  - Topics, partitions, offsets, consumer groups, ordering within a partition
  - Retention, log compaction, replication
  - Spring for Apache Kafka
- Patterns: transactional outbox, event-driven architecture, sagas (overview)

**Resources**

- **Primary:** [RabbitMQ tutorials](https://www.rabbitmq.com/tutorials): six core tutorials with Java versions, from Hello World to RPC.
- [Spring AMQP reference](https://docs.spring.io/spring-amqp/reference/)
- [Apache Kafka quickstart](https://kafka.apache.org/quickstart): Kafka 4.4.
- [Confluent Developer courses](https://developer.confluent.io/courses/): Kafka 101, Kafka Streams 101 and Schema Registry 101.
- [Spring for Apache Kafka reference](https://docs.spring.io/spring-kafka/reference/)
- [Testcontainers: Testing a Spring Boot Kafka listener](https://testcontainers.com/guides/testing-spring-boot-kafka-listener-using-testcontainers/)

**On Synapse**

- [Queues & Brokers](/synapse/system-design-from-first-principles/building-blocks/queues-and-brokers) (System Design)
- [Kafka](/synapse/system-design-from-first-principles/key-technologies/kafka) (System Design)
- [Idempotency & Exactly-once](/synapse/system-design-from-first-principles/patterns/idempotency-and-exactly-once) (System Design)
- [Event-driven: CQRS, Outbox & CDC](/synapse/system-design-from-first-principles/patterns/event-driven-cqrs-outbox-cdc) (System Design)
- [Multi-step Processes & Sagas](/synapse/system-design-from-first-principles/patterns/multi-step-processes-and-sagas) (System Design)
- [Encoding & Schema Evolution](/synapse/system-design-from-first-principles/data-foundations/encoding-and-evolution) (System Design)

**Build:** a notification service, split out of your API, that consumes "post created" events. Run it over RabbitMQ first and then Kafka, with a dead-letter queue and an idempotent consumer.

#### Module 22: Redis and caching

**Topics**

- Redis data types: strings, hashes, lists, sets, sorted sets, streams
- Expiry: TTLs and eviction policies
- Caching: cache-aside and write-through patterns, invalidation, cache stampedes
- Beyond caching: rate limiting with counters, distributed locks and their caveats, pub/sub and streams
- Persistence: RDB and AOF
- From Java: the Jedis and Lettuce clients, Spring Data Redis, Spring's `@Cacheable`

**Resources**

- **Primary:** [Redis docs](https://redis.io/docs/latest/), especially [Data types](https://redis.io/docs/latest/develop/data-types/)
- Java clients: [Jedis guide](https://redis.io/docs/latest/develop/clients/jedis/) and [Lettuce guide](https://redis.io/docs/latest/develop/clients/lettuce/)
- [Spring Data Redis reference](https://docs.spring.io/spring-data/redis/reference/)

**On Synapse**

- [Caching](/synapse/system-design-from-first-principles/building-blocks/caching) (System Design)
- [Redis](/synapse/system-design-from-first-principles/key-technologies/redis) (System Design)
- [Design a Rate Limiter](/synapse/system-design-from-first-principles/case-studies/rate-limiter) (System Design)

**Build:** cache your API's feed endpoint, rate-limit the login endpoint, and add a leaderboard using a sorted set. Measure latency before and after.

[↑ Back to contents](#contents)

---

### Stage 8: AI-assisted work, capstone and job hunt (modules 23-25)

The capstone is the single most important item on your resume, so do not rush it.

#### Module 23: AI-assisted development

**Topics**

- How coding agents work: context, tools and the agent loop (you built one in [Module 8](#module-8-ai-agent-project))
- Giving good tasks: clear goals, constraints, acceptance criteria, small steps
- Project instruction files (such as `CLAUDE.md` or `AGENTS.md`) that hold your build commands and coding standards
- Plan first, then implement; have the agent write and run tests
- Reviewing AI output like a senior: correctness, edge cases, security, performance, readability
- When not to use AI: while learning a fundamental for the first time, and for security-sensitive code you cannot fully review

**Resources**

- **Primary:** [MIT Missing Semester 2026: Agentic Coding](https://missing.csail.mit.edu/2026/agentic-coding/) (lecture and notes).
- [Claude Code overview](https://code.claude.com/docs/en/overview): runs in the terminal and has a JetBrains plugin for IntelliJ. The page links to free [Claude Academy](https://academy.claude.com/) courses. Other assistants, such as JetBrains AI Assistant or GitHub Copilot, teach the same skills.

**Practice:** use an agent to add a feature to your Module 17 API. Review every line of its diff and write down what you had to correct.

#### Module 24: Capstone project

**Minimum requirements**

- [ ] Two or three Spring Boot services, for example an API plus a background worker
- [ ] PostgreSQL with Flyway migrations, Redis caching, and Kafka or RabbitMQ events between services
- [ ] Authentication with Spring Security (JWT or Keycloak)
- [ ] Unit tests plus integration tests against real dependencies with Testcontainers
- [ ] Structured logging, Actuator health checks and basic metrics
- [ ] Docker Compose for local development
- [ ] GitHub Actions CI that builds, tests and publishes an image on every pull request
- [ ] Deployed to a public URL
- [ ] README with an architecture diagram, OpenAPI docs and two or three architecture decision records

**Project ideas:** event ticketing with seat reservations (hard concurrency), a URL shortener with click analytics, an expense-splitting app, or a job board with email alerts.

**Resources**

- [Testcontainers guides](https://testcontainers.com/guides/), especially [replacing H2 with a real database](https://testcontainers.com/guides/replace-h2-with-real-database-for-testing/) and [jOOQ and Flyway with Testcontainers](https://testcontainers.com/guides/working-with-jooq-flyway-using-testcontainers/)
- [GitHub Actions: Building and testing Java with Gradle](https://docs.github.com/en/actions/tutorials/build-and-test-code/java-with-gradle)
- [Docker Compose docs](https://docs.docker.com/compose/)

**On Synapse**

- [Design Ticketmaster](/synapse/system-design-from-first-principles/case-studies/ticketmaster) (System Design)
- [Inventory Reservations at Scale in PostgreSQL](/synapse/system-design-from-first-principles/reference/inventory-reservations-postgres) (System Design)
- [Design a URL Shortener](/synapse/system-design-from-first-principles/case-studies/url-shortener) (System Design)

#### Module 25: Finding a job (keep)

Take boot.dev's course as is, then add the Java interview prep below.

**Topics**

- Portfolio: pin your capstone and two best projects on GitHub, each with a clear README
- Resume and LinkedIn: impact-focused bullet points, keywords such as Java, Spring Boot, PostgreSQL, Kafka, Docker
- Applying and networking: targeted applications, referrals, meetups and Java user groups
- Interview preparation
  - Coding: DS&A problems in Java ([Module 9](#module-9-data-structures-and-algorithms) resources)
  - Java and JVM: collections internals, `equals`/`hashCode`, immutability, concurrency, garbage collection basics, streams
  - Spring: dependency injection, bean scopes, `@Transactional` pitfalls, JPA N+1, Spring Security flow
  - SQL: joins, indexes, transactions and isolation levels
  - System design basics (see [System design at scale](#system-design-at-scale))
  - Behavioral: stories in the situation-task-action-result format

**Resources**

- **Primary:** [boot.dev Learn to Find a Job](https://www.boot.dev/courses/learn-job-search) (keep): strategy, projects, GitHub profile, resume, LinkedIn, applying, networking, interviewing and relocation.
- [Tech Interview Handbook](https://www.techinterviewhandbook.org/): free guide to resumes, interviews and offer negotiation.
- [LeetCode Top Interview 150](https://leetcode.com/studyplan/top-interview-150/) and [NeetCode](https://neetcode.io/roadmap) for coding rounds.

[↑ Back to contents](#contents)

---

## Phase 2: Senior engineer

Senior means you own production systems end to end and others can rely on your judgment. Learn these topics alongside your work, applying each one to systems you own rather than studying it in isolation.

### Part 1: Engineering craft

The goal of this part is depth: understanding why your code behaves the way it does under real production load.

#### JVM internals and performance

**Topics**

- Memory: heap, stack, metaspace, object layout, allocation
- Garbage collection
  - G1 (the default), ZGC for low latency, Parallel for throughput
  - Reading GC logs; trading off throughput, latency and memory footprint
- JIT compilation and warm-up; why naive microbenchmarks lie; JMH for real benchmarks
- Profiling
  - JDK Flight Recorder and JDK Mission Control
  - async-profiler flame graphs for CPU and allocation
  - Heap dumps for memory leaks, thread dumps for hangs
- JDK tools: `jcmd`, `jstat`, `jmap`, `jstack`
- The JVM in containers: memory limits and CPU awareness

**Resources**

- **Primary:** [Java Performance, 2nd edition (Scott Oaks, 2020)](https://www.oreilly.com/library/view/java-performance-2nd/9781492056102/)
- Dev.java: [The Core JDK Tools](https://dev.java/learn/jvm/core-tools/), [JFR, Monitoring and Troubleshooting](https://dev.java/learn/jvm/monitoring-troubleshooting/), [Security Tools and Garbage Collection](https://dev.java/learn/jvm/security-gc/)
- [async-profiler](https://github.com/async-profiler/async-profiler): the standard low-overhead profiler for Java.
- [Eclipse Mission Control](https://adoptium.net/jmc): the free GUI for analyzing Flight Recorder files.

**On Synapse**

- [The Java Memory Model & Performance](/synapse/programming-languages/java/advanced/the-java-memory-model-and-performance) (Java)

**Practice:** load-test your capstone, record with Flight Recorder, and fix the top hotspot. Then plant a memory leak and find it from a heap dump.

#### Concurrency in depth

**Topics**

- The Java Memory Model: happens-before, visibility, `volatile`, safe publication
- Locking: `synchronized`, `ReentrantLock`, read-write locks, lock contention
- Lock-free code: atomics and compare-and-swap
- Executors: thread-pool sizing, rejection policies, `CompletableFuture` composition
- Virtual threads: when they help, pinning, and why pooling them is wrong
- Concurrent collections; deadlocks and livelocks; testing concurrent code

**Resources**

- **Primary:** [Java Concurrency in Practice (Brian Goetz)](https://jcip.net/): from 2006, but still the definitive book on the memory model and thread safety.
- [Dev.java: Virtual Threads](https://dev.java/learn/api/virtual-threads/) for everything newer than the book.

**On Synapse**

- [Concurrency: the Basics](/synapse/programming-languages/java/advanced/concurrency-the-basics) (Java)
- [Concurrency: Coordination](/synapse/programming-languages/java/advanced/concurrency-coordination) (Java)
- [Concurrency: High-Level & Virtual Threads](/synapse/programming-languages/java/advanced/concurrency-high-level-and-virtual-threads) (Java)
- [The Java Memory Model & Performance](/synapse/programming-languages/java/advanced/the-java-memory-model-and-performance) (Java)
- [Thread Pools & Executors](/synapse/low-level-design/multithreading-concurrency/thread-pools-and-executors) (Low Level Design)
- [Deadlock](/synapse/low-level-design/multithreading-concurrency/deadlock) (Low Level Design)
- [Producer-Consumer](/synapse/low-level-design/multithreading-concurrency/producer-consumer) (Low Level Design)

**Practice:** build a thread-safe rate limiter and a bounded blocking queue, then stress-test them with many threads.

#### Code quality and design

**Topics:** all of *Effective Java*; refactoring in small, safe steps; designing clean module boundaries; writing code reviews that teach; static analysis and consistent formatting in CI.

**Resources:** [Effective Java, 3rd edition](https://www.informit.com/store/effective-java-9780134685991) (now read cover to cover) and [Refactoring Guru](https://refactoring.guru/design-patterns/java).

**On Synapse**

- [Software Design Principles](/synapse/low-level-design/basics/design-principles) (Low Level Design)
- [SOLID Principles](/synapse/low-level-design/solid-principles/solid-principles) (Low Level Design)
- [Introduction to Design Patterns](/synapse/low-level-design/design-patterns/introduction-design-patterns) (Low Level Design)

#### Testing strategy

**Topics**

- What makes a test valuable: it catches regressions, survives refactoring and runs fast
- Mocks versus real dependencies; integration tests with Testcontainers
- Contract tests between services
- Property-based and mutation testing
- Fixing flaky tests
- Testing in production: canary releases and feature flags

**Resources**

- **Primary:** [Unit Testing Principles, Practices, and Patterns (Vladimir Khorikov, 2020)](https://www.manning.com/books/unit-testing): the best book on what to test and how.
- [Testcontainers guides](https://testcontainers.com/guides/)

**On Synapse**

- [Testing, Tooling & Packaging](/synapse/programming-languages/java/advanced/testing-tooling-and-packaging) (Java)
- [Deployment Strategies](/synapse/system-design-from-first-principles/production-engineering/deployment-strategies) (System Design)

### Part 2: Systems

This part moves from one service to many: data under concurrency, distributed failure, architecture trade-offs, and running software in production.

#### Databases in depth

**Topics**

- Transactions: isolation levels, anomalies (lost updates, write skew), MVCC in PostgreSQL
- Locking: row locks, `SELECT ... FOR UPDATE`, optimistic locking with JPA `@Version`
- Indexing: B-trees, composite, covering and partial indexes; `EXPLAIN ANALYZE`
- Connection-pool sizing and timeouts
- Zero-downtime schema changes (expand, migrate, contract)
- Scaling: read replicas, partitioning, and when a NoSQL store fits better

**Resources**

- **Primary:** [Use The Index, Luke](https://use-the-index-luke.com/) and the [PostgreSQL documentation](https://www.postgresql.org/docs/current/tutorial.html)
- [Vlad Mihalcea's Hibernate tutorials](https://vladmihalcea.com/tutorials/hibernate/) for transactions and locking through JPA

**On Synapse**

- [Isolation Levels](/synapse/programming-languages/sql/transactions-and-concurrency/isolation-levels) (SQL)
- [MVCC and Locking](/synapse/programming-languages/sql/transactions-and-concurrency/mvcc-and-locking) (SQL)
- [B-Tree Indexes](/synapse/programming-languages/sql/indexes-and-performance/b-tree-indexes) (SQL)
- [Other Index Types](/synapse/programming-languages/sql/indexes-and-performance/other-index-types) (SQL)
- [Transactions & Isolation](/synapse/system-design-from-first-principles/distributed-data/transactions-and-isolation) (System Design)
- [PostgreSQL](/synapse/system-design-from-first-principles/key-technologies/postgresql) (System Design)
- [Scaling Reads](/synapse/system-design-from-first-principles/patterns/scaling-reads) (System Design)

#### Distributed systems

**Topics**

- Why it is hard: partial failure, network partitions, unreliable clocks
- Replication (leader-follower, multi-leader, leaderless) and partitioning
- Consistency models (linearizable to eventual), CAP and PACELC
- Consensus (Raft) at a conceptual level
- Timeouts, retries with backoff and jitter, idempotency keys
- Distributed transactions versus sagas and the outbox pattern
- Stability patterns: circuit breakers, bulkheads, load shedding

**Resources**

- **Primary:** [Designing Data-Intensive Applications (Martin Kleppmann)](https://dataintensive.net/): the most important book for backend engineers aiming at senior and above.
- [MIT 6.5840 Distributed Systems (Spring 2026)](https://pdos.csail.mit.edu/6.824/): lectures and classic papers. Its labs are in Go; implementing Raft in Java instead is an excellent exercise.
- [Release It!, 2nd edition (Michael Nygard)](https://pragprog.com/titles/mnee2/release-it-second-edition/): stability patterns and anti-patterns from real outages.

**On Synapse**

- [Replication](/synapse/system-design-from-first-principles/distributed-data/replication) (System Design)
- [Sharding & Consistent Hashing](/synapse/system-design-from-first-principles/distributed-data/sharding-and-consistent-hashing) (System Design)
- [Faults, Clocks & Time](/synapse/system-design-from-first-principles/distributed-data/faults-clocks-and-time) (System Design)
- [Linearizability & Ordering](/synapse/system-design-from-first-principles/distributed-data/linearizability-and-ordering) (System Design)
- [CAP & PACELC, Honestly](/synapse/system-design-from-first-principles/distributed-data/cap-and-pacelc-honestly) (System Design)
- [Consensus & Coordination](/synapse/system-design-from-first-principles/distributed-data/consensus-and-coordination) (System Design)
- [Distributed Transactions](/synapse/system-design-from-first-principles/distributed-data/distributed-transactions) (System Design)
- [Resilience & Incident Response](/synapse/system-design-from-first-principles/production-engineering/resilience-and-incidents) (System Design)

#### Architecture and design

**Topics**

- Modular monolith versus microservices, and when to split
- Domain-driven design: bounded contexts, aggregates, ubiquitous language, context maps
- Hexagonal (ports and adapters) architecture
- API styles: REST, gRPC, asynchronous events; versioning and backward compatibility
- Architecture characteristics (scalability, availability, cost) and trade-off analysis

**Resources**

- **Primary:** [Learning Domain-Driven Design (Vlad Khononov, 2021)](https://www.oreilly.com/library/view/learning-domain-driven-design/9781098100124/)
- [Fundamentals of Software Architecture, 2nd edition (Richards and Ford, 2025)](https://www.oreilly.com/library/view/fundamentals-of-software/9781098175504/)
- [Building Microservices, 2nd edition (Sam Newman, 2021)](https://www.oreilly.com/library/view/building-microservices-2nd/9781492034018/)

**On Synapse**

- [Service Architecture: Monoliths to Microservices](/synapse/system-design-from-first-principles/production-engineering/service-architecture) (System Design)
- [Thinking in Trade-offs](/synapse/system-design-from-first-principles/foundations/thinking-in-tradeoffs) (System Design)
- [Encoding & Schema Evolution](/synapse/system-design-from-first-principles/data-foundations/encoding-and-evolution) (System Design)

#### Operations and reliability

**Topics**

- Kubernetes: pods, deployments, services, config, scaling, rolling updates
- Delivery: CI/CD pipelines, blue-green and canary deployments
- Observability: structured logs, metrics and traces; the OpenTelemetry Java agent; Micrometer with Prometheus and Grafana
- Reliability: SLIs, SLOs and error budgets; alerting on symptoms, not causes
- Incidents: on-call, incident command, blameless postmortems

**Resources**

- **Primary:** [Google SRE books](https://sre.google/books/): *Site Reliability Engineering* and *The Site Reliability Workbook* are free to read online.
- Kubernetes: [Learn Kubernetes Basics](https://kubernetes.io/docs/tutorials/kubernetes-basics/) (official) or [boot.dev Learn Kubernetes](https://www.boot.dev/courses/learn-kubernetes) (51 lessons)
- [OpenTelemetry for Java](https://opentelemetry.io/docs/languages/java/), [Micrometer](https://docs.micrometer.io/micrometer/reference/), [Prometheus overview](https://prometheus.io/docs/introduction/overview/)

**On Synapse**

- [Observability](/synapse/system-design-from-first-principles/production-engineering/observability) (System Design)
- [Deployment Strategies](/synapse/system-design-from-first-principles/production-engineering/deployment-strategies) (System Design)
- [Capacity & Autoscaling](/synapse/system-design-from-first-principles/production-engineering/capacity-and-autoscaling) (System Design)
- [Resilience & Incident Response](/synapse/system-design-from-first-principles/production-engineering/resilience-and-incidents) (System Design)
- [Service Discovery & Mesh](/synapse/system-design-from-first-principles/production-engineering/service-discovery-and-mesh) (System Design)

**Practice:** deploy your capstone to Kubernetes with traces, metrics and an SLO dashboard. Then run a game day where you break a dependency and write the postmortem.

### Habits and exit criteria

**Habits to build:** thorough code reviews, owning features from design to production, writing short design docs, and mentoring one or two juniors.

**Phase 2 is done when** you lead projects of a quarter or more, your services run reliably in production, and teammates come to you for technical decisions.

[↑ Back to contents](#contents)

---

## Phase 3: Staff engineer

Staff is the shift from solving problems well to choosing which problems get solved, across several teams. Writing code becomes one tool among many; the main skills are design at scale, writing and influence. No course makes you Staff: learn from people who have done the job, then practice on real cross-team problems at work.

Will Larson's *Staff Engineer* describes four common shapes of the role:

- **Tech Lead:** guides one team's execution.
- **Architect:** owns direction for a critical area.
- **Solver:** parachutes into hard problems.
- **Right Hand:** extends a senior leader's reach.

Pick the one that fits you and your company.

### System design at scale

**Topics**

- A repeatable method: requirements and non-functional goals, back-of-envelope estimates, APIs, data model, high-level design, deep dives, trade-offs
- Building blocks: load balancers, caches, CDNs, queues, databases, search, object storage
- Scale patterns: sharding, replication, consistent hashing, CQRS, event sourcing, rate limiting
- Reliability and cost: multi-region design, disaster recovery, capacity planning, SLOs and error budgets, cloud cost
- Large migrations: strangler fig, dual writes, backfills, feature flags, safe rollbacks

**Resources**

- **Primary:** [System Design Primer](https://github.com/donnemartin/system-design-primer): free and comprehensive, with flashcards.
- [ByteByteGo](https://bytebytego.com/): Alex Xu's system design material, including the *System Design Interview* books.
- Revisit [Designing Data-Intensive Applications](https://dataintensive.net/) and [Fundamentals of Software Architecture](https://www.oreilly.com/library/view/fundamentals-of-software/9781098175504/) with design reviews in mind.

**On Synapse**

- [System Design from First Principles](/synapse/system-design-from-first-principles/index) (System Design)
- [The Delivery Framework](/synapse/system-design-from-first-principles/interview-playbook/delivery-framework) (System Design)
- [Estimation & the Numbers](/synapse/system-design-from-first-principles/foundations/estimation-and-numbers) (System Design)
- [Load Balancing & Gateways](/synapse/system-design-from-first-principles/building-blocks/load-balancing-and-gateways) (System Design)
- [Scaling Writes](/synapse/system-design-from-first-principles/patterns/scaling-writes) (System Design)
- [Design a URL Shortener](/synapse/system-design-from-first-principles/case-studies/url-shortener) (System Design)
- [Design a News Feed](/synapse/system-design-from-first-principles/case-studies/news-feed) (System Design)
- [Design WhatsApp](/synapse/system-design-from-first-principles/case-studies/whatsapp) (System Design)
- [Design a Rate Limiter](/synapse/system-design-from-first-principles/case-studies/rate-limiter) (System Design)

**Practice:** design six classic systems on paper (URL shortener, news feed, chat, rate limiter, notifications, payments). Then compare your designs with how real companies describe theirs.

### Technical writing

**Topics:** design docs (context, goals and non-goals, options, trade-offs, decision); RFCs for cross-team changes; architecture decision records (ADRs); technical strategy documents; writing for executives with the conclusion first.

**Resources**

- [Design Docs at Google (Malte Ubl)](https://www.industrialempathy.com/posts/design-docs-at-google/): the best short guide to the format.
- [Architectural Decision Records](https://adr.github.io/): templates and tooling.
- The guide on engineering strategy at [StaffEng](https://staffeng.com/), under Guides.

### Influence, alignment and multiplying others

**Topics**

- Choosing work that matters
- Staying aligned with leadership
- Influence without authority: building consensus across teams with competing priorities, negotiating trade-offs, saying no well, and disagreeing and committing
- Multiplying others: mentoring versus sponsorship, raising quality through standards and reviews
- Promotion packets and making your impact visible

**Resources**

- **Primary:** [Staff Engineer (Will Larson)](https://staffeng.com/book). Most of the book is free on [staffeng.com](https://staffeng.com/), including guides on:
  - working on what matters
  - staying aligned with authority
  - promotion packets
  - managing technical quality

  The site also has interviews with Staff and Principal engineers from Stripe, Slack and Google.
- [The Staff Engineer's Path (Tanya Reilly, 2022)](https://www.oreilly.com/library/view/the-staff-engineers/9781098118723/): the best book on the day-to-day of the role.

### Business and product sense

**Topics**

- Your company's business model and key metrics
- What your systems cost to run
- Making the case for technical debt and platform work in terms of revenue, cost, risk and speed
- Treating technical debt as a portfolio: deciding what to fix and what to live with
- Partnering with product managers

**Resources:** [The Software Architect Elevator (Gregor Hohpe)](https://architectelevator.com/book/): how architects connect the engine room to the executive floor.

### Practice at work

- [ ] Write one design doc per quarter that gets reviewed across teams
- [ ] Lead a cross-team migration or platform initiative
- [ ] Run or join architecture reviews and incident postmortems
- [ ] Mentor at least two engineers through a promotion
- [ ] Keep your brag doc current, with impact stated in business terms

[↑ Back to contents](#contents)

---

## Phase 4: Principal engineer

Principal engineers set technical direction for a whole organization or company, usually over multi-year horizons. The work is mostly strategy and organizational design, with deep technical expertise as the foundation that earns you the right to do it. Exact scope varies widely by company, so study what principals at your target company actually do.

**Topics**

- Technical strategy
  - Diagnosing the real problem, choosing a guiding policy, and taking coherent actions
  - Multi-year roadmaps, build-versus-buy, platform bets, retiring legacy systems
- Organizations and architecture
  - Conway's law, team types and interaction modes, cognitive load
  - Shaping teams around the architecture you want
- Systems thinking: feedback loops, stocks and flows, unintended consequences
- Engineering organization mechanics: team sizing, planning, migrations as organizational work
- Executive partnership: explaining technical risk and opportunity, influencing hiring and org design
- Deep expertise in one or two areas, recognized beyond your company through talks, open source, writing or standards work

**Resources**

- **Primary:** [Good Strategy Bad Strategy (Richard Rumelt)](https://mitpressbookstore.mit.edu/book/9780307886231): the clearest framework for writing strategy that is not just a list of goals.
- [Team Topologies, 2nd edition (Skelton and Pais, 2025)](https://teamtopologies.com/book)
- [Thinking in Systems (Donella Meadows)](https://chelseagreen.com/product/thinking-in-systems/)
- [An Elegant Puzzle (Will Larson)](https://lethain.com/elegant-puzzle/): systems of engineering management, written by an engineering leader.
- [The Software Architect Elevator (Gregor Hohpe)](https://architectelevator.com/book/)
- Principal and Senior Staff interviews on [staffeng.com](https://staffeng.com/)

**Practice:** write a two-to-three-year technical strategy for your area and get engineering leadership to review it. Then track whether the bets pay off.

[↑ Back to contents](#contents)

---

## Quick reference and sources

**Core free resources**

- [Dev.java](https://dev.java/learn/): official Java tutorials from Oracle
- [Java Programming MOOC](https://java-programming.mooc.fi/): University of Helsinki, exercise-heavy, good for Modules 1 to 9
- [Exercism Java track](https://exercism.org/tracks/java): free practice exercises with mentoring
- [Spring Guides](https://spring.io/guides): short official tutorials for Spring Boot topics
- [roadmap.sh Java](https://roadmap.sh/java) and [Backend](https://roadmap.sh/backend) roadmaps: checklists to cross-check gaps
- [StaffEng](https://staffeng.com/): stories and guides from staff and principal engineers

**Sources for the course mapping**

- [boot.dev backend path course list (official curriculum repo)](https://cdn.jsdelivr.net/gh/bootdotdev/curriculum@main/paths/backend.md)
- [boot.dev Back-end Developer Path](https://boot.dev/paths/backend)

**About the links**

- **When checked:** every link was opened and checked on 8 Nov 2026.
- **Books:** book links go to the publisher's or author's page.
- **Left out:** Spring Academy and Redis University were dropped because their pages load only with JavaScript and could not be verified.

[↑ Back to contents](#contents)
