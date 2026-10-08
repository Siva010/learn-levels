# Java — Production

> **Goal of this file:** Teach real-world engineering usage. After reading, you should be able to say *"I know how professionals use this."* Assumes you've completed all three prior files.

> **Build status:** Currently complete: **Group 1**. Groups 2–12 will be added in follow-up passes.

---

## 📖 Master Table of Contents

1. [[#1. Java Fundamentals & Syntax]] ✅
2. [[#2. Object-Oriented Programming]] ✅
3. [[#3. Collections Framework]] ✅
4. [[#4. Generics]] ✅
5. [[#5. Exception Handling]] ✅
6. [[#6. Streams, Lambdas & Functional Programming]] ✅
7. [[#7. Concurrency & Multithreading]] ✅
8. [[#8. JVM Internals & Memory Management]] ✅
9. [[#9. I/O & NIO]] ✅
10. [[#10. Modern Java Features]] ✅
11. [[#11. Reflection & Annotations]] ✅
12. [[#12. Java Platform Module System (JPMS)]] ✅

---

## 1. Java Fundamentals & Syntax

### Table of Contents (this group)
- [[#1.1 What is Java?]]
- [[#1.2 JVM, JRE, and JDK]]
- [[#1.3 Platform Independence & Bytecode]]
- [[#1.4 Variables and Data Types]]
- [[#1.5 Primitive Types and Literals]]
- [[#1.6 Type Conversion, Casting and Boxing]]
- [[#1.7 Operators]]
- [[#1.8 Control Flow Statements]]
- [[#1.9 Arrays]]
- [[#1.10 Strings]]
- [[#1.11 Methods]]
- [[#1.12 Packages and Imports]]

---

### 1.1 What is Java?

**Best practices:**
- Play to the platform's strengths. The JVM shines in long-running services, where the JIT compiler has time to optimise hot paths and the garbage collector amortises its work. For short-lived processes — CLI tools, functions invoked once per request — measure startup, and consider class-data sharing, the JDK 24+ AOT cache, or a GraalVM native image.
- Write against specifications, not one implementation. Code that relies on HotSpot internals (`sun.misc` classes, object sizes, JIT timing) breaks on upgrades and other JVMs; the JLS and the Java SE API are the contract.
- Pick an OpenJDK distribution deliberately — Eclipse Temurin, Amazon Corretto, Azul Zulu, Oracle and others build from the same source, but differ in support length, licensing and platform coverage.

**Real-world use case:** Because Kotlin, Scala and Groovy compile to the same bytecode, a single service can mix them and share every Java library; the JVM sees only class files.

**Debugging tips:** The JDK ships production-grade diagnostics: Java Flight Recorder (`jcmd <pid> JFR.start`) records CPU, allocation and GC events with low overhead, and `jcmd`, `jstack` and `jmap` inspect a running JVM. Learn them before an incident, not during one (JVM Internals group).

**Common production bugs:** Assuming dev-machine behaviour holds in production — a laptop JDK with a different default GC, heap size or charset than the container image. Pin the runtime and print `java -XshowSettings:vm -version` in startup logs so the difference is visible.

---

### 1.2 JVM, JRE, and JDK

**Best practices:**
- Use a minimal, custom runtime image via `jlink` for containerized deployments instead of shipping a full JDK — dramatically reduces image size and attack surface. `jdeps --print-module-deps` lists the modules to include.
- Pin your JDK **distribution and exact version** in CI/CD (e.g., Eclipse Temurin 21.0.3) — silent minor-version drift between dev and prod has caused real production incidents (subtle GC or TLS behavior changes).
- Use LTS versions (8, 11, 17, 21, 25) for production systems unless you have a strong reason and a fast upgrade cadence; non-LTS releases get only 6 months of support.

> ✅ **Best Practice:** In Docker images, use official slim JRE base images (e.g., `eclipse-temurin:21-jre-jammy`) or a `jlink` runtime for the runtime stage of a multi-stage build, and the full JDK only in the build stage.

**Performance considerations:**
- Startup time matters in serverless/Kubernetes autoscaling contexts — consider **CDS (Class Data Sharing)** or **AppCDS** to reduce JVM startup latency, the AOT cache introduced in JDK 24 (Project Leyden), or GraalVM native-image for extreme cold-start requirements.
- JIT warm-up means the first few seconds/minutes of a JVM's life run slower than steady-state — factor this into load-testing and readiness-probe design (don't route full production traffic before warm-up; send synthetic warm-up requests or use an AOT cache).

**Scalability concerns:**
- Container CPU/memory limits must align with JVM flags (`-XX:MaxRAMPercentage`, container-aware ergonomics since JDK 10 and backported to 8u191) — otherwise the JVM may size its heap based on host resources instead of container limits, causing OOM-kills.

**Common production bugs:**
- `UnsupportedClassVersionError` from deploying bytecode compiled with a newer JDK than the target runtime uses — enforce `--release` flag in your build (not just `-source`/`-target`) to guarantee API-level compatibility, not just bytecode version.
- JVM silently using default (non-container-aware) memory limits on older JDK versions inside Kubernetes pods, leading to OOM-killed containers under load.
- A `jlink` runtime missing a module the application loads only on some code path (`java.naming` for JNDI lookups, `java.management` for JMX) — the service starts fine and fails later. Run integration tests against the same image you deploy.

> ⚠️ **Warning:** Don't assume "it compiles" means "it will run in production." A build pipeline that compiles with JDK 21 but deploys to a JDK 17 runtime will fail at class-loading time, not compile time — always match the `--release` flag to your actual production runtime.

**Modern recommendations:** Adopt the latest LTS — JDK 25 since September 2025, or at least JDK 21 — for new services to get virtual threads, generational ZGC, and pattern matching improvements — all covered in later groups but decided here, at the runtime-selection stage.

**Deprecated approaches to avoid:** Manually shipping a bespoke JRE-only zip pulled apart from a full JDK install (a common pre-`jlink` hack) — use `jlink` instead, which produces a properly linked, minimal, supported runtime image.

---

### 1.3 Platform Independence & Bytecode

**Best practices:**
- Build with `--release N`, where N is the oldest Java version you deploy to, so the compiler checks both the bytecode version and the API you call.
- Keep code platform-neutral where it touches the OS: build paths with `Path.of(dir, file)` rather than string concatenation with `/` or `\`; pass charsets explicitly (`Files.readString(path, StandardCharsets.UTF_8)`) rather than relying on defaults; use `System.lineSeparator()` or `%n` when line endings matter.
- Build container images for each CPU architecture you run on (`linux/amd64`, `linux/arm64`). The bytecode is portable; the JVM inside the image, and any native libraries your dependencies bundle, are not.

**Real-world use case:** Frameworks like Spring and Hibernate generate bytecode at runtime (via CGLIB or ByteBuddy) to create dynamic proxies for AOP (transactions, security) and lazy-loading entities. Understanding that bytecode can be generated, not just compiled from source, explains why some Spring beans behave unexpectedly with `final` classes/methods (proxies can't subclass them).

> 📝 **Interview-adjacent production note:** If a `@Transactional` method isn't working, a very common root cause is that Spring's proxy-based AOP can't intercept calls when a method is `final`, `private`, or called from *within the same class* (self-invocation bypasses the proxy entirely).

**Debugging tips:**
- `javap -c -p MyClass.class` to inspect actual bytecode when diagnosing subtle behavior differences between Java versions or JIT-related bugs.
- Use HotSpot's `-XX:+PrintCompilation` to see which methods the JIT has compiled, useful when diagnosing why a hot loop still runs slowly (it may not have been JIT-compiled yet, or it's been de-optimized).
- `javap -v MyClass.class | grep major` shows which Java version a class was compiled for — the quickest check behind an `UnsupportedClassVersionError`.

**Common production bugs:**
- Code that worked on a developer's Windows laptop and fails on Linux servers: hard-coded `\` separators, file names whose case differs (`Config.yaml` vs `config.yaml` — Linux file systems are case-sensitive), or a native library bundled for x86 only.
- After upgrading from JDK 17 to 18+, text files written with the old platform default (often Windows-1252 on Windows) read back garbled, because the default became UTF-8 (JEP 400).

**Security implications:**
- Bytecode is trivially decompilable — never rely on it to "hide" business logic or secrets (API keys, license logic). Use proper secret management (vaults, environment injection) instead.

**Testing advice:** When testing across JDK versions (e.g., validating a library supports both JDK 17 and 21), use CI matrix builds compiling and running against each target version explicitly, rather than assuming forward/backward compatibility. Run the test suite on every operating system you ship to if your code touches files, processes or native libraries.

---

### 1.4 Variables and Data Types

**Best practices:**
- Declare variables in the narrowest scope, at the point of first use, and initialize them there. A variable declared at the top of a long method invites stale values and accidental reuse (Effective Java, Item 57).
- Name variables for what they hold, with units where it matters: `timeoutMillis`, `priceInCents`, `retryCount` — not `t`, `p`, `n`. Many production incidents are a seconds-vs-milliseconds mix-up.
- Use `var` where the type is obvious from the right-hand side (`var orders = new ArrayList<Order>();`) and spell the type out where it isn't (`Order order = repository.find(id);` reads better than `var order = repository.find(id);`).
- Prefer one assignment per variable; mark fields `final` (2.18). A variable that changes meaning halfway through a method is a refactoring waiting to happen.

**Common production bugs:**
- A mutable `static` field used as if it were per-request — shared across all threads (2.4).
- A field relied on for its default (`0`, `null`) where "not set" and "zero" mean different things — a discount of 0 vs. no discount configured. Use a wrapper type or `Optional` only where absence is a real state, and say so.

**Logging:** Never log raw sensitive numeric identifiers (account numbers, SSNs represented as `long`/`String`) without masking — this is a data-classification/PII concern independent of the Java type system itself.

**Maintainability:** Methods with a dozen local variables usually do several jobs; extracting a method shrinks each variable's scope, which is the cheapest way to make code easier to reason about.

---

### 1.5 Primitive Types and Literals

**Best practices:**
- Use `BigDecimal` — never `float`/`double` — for monetary calculations. Binary floating-point cannot represent many decimal fractions exactly, and this has caused real financial-calculation bugs. Where performance matters more than flexibility, `long` amounts in the smallest currency unit (cents) are also exact.
- Default to `int` and `double`; use `long` for anything that can grow without bound — counters, database IDs, epoch milliseconds, file sizes. `byte` and `short` are for binary formats and large arrays, not for "saving memory" on single variables.
- Use `Math.addExact`, `multiplyExact` and `toIntExact` where silent wraparound would corrupt data.

> ⚠️ **Warning:** `0.1 + 0.2 == 0.3` is `false` in Java (as in virtually every language using IEEE 754 floating point). For currency, always use `BigDecimal` with explicit `RoundingMode`, never raw `double`.

**Anti-pattern:** Using `double` for money math in an order/billing service. This is a well-known, recurring real-world bug pattern — always flag it in code review.

**Common production bugs:**
- Epoch milliseconds or file sizes stored in an `int`, overflowing years after the code shipped (milliseconds exceed `Integer.MAX_VALUE` after about 24.8 days).
- `int` arithmetic assigned to a `long` — `long bytes = megabytes * 1024 * 1024;` with `int megabytes` overflows above 2047 MB.
- Text truncated with `substring(0, n)` splitting an emoji's surrogate pair, producing invalid characters in a database column or JSON payload. Truncate by code points, or check `Character.isHighSurrogate` at the cut.
- Comparing computed `double` values with `==`, or `NaN` silently propagating through a calculation until it reaches a report.

**Testing advice:** Test arithmetic at the boundaries — `Integer.MAX_VALUE`, `Long.MIN_VALUE`, zero, negative values — and test text handling with non-ASCII input including an emoji. Both classes of bug pass every "happy path" test.

---

### 1.6 Type Conversion, Casting and Boxing

**Best practices:**
- Prefer primitives over boxed wrapper types in performance-sensitive code (tight loops, high-throughput services) to avoid autoboxing overhead and unnecessary heap allocation/GC pressure. Use a wrapper only where `null` is a meaningful state or an object is required.
- Compare wrappers with `equals` (or `Objects.equals` when either may be `null`), or unbox deliberately — never with `==`.
- Replace silent narrowing casts with checked ones where a wrong value would matter: `Math.toIntExact(longValue)` instead of `(int) longValue`.
- Handle absent values before unboxing: `map.getOrDefault(key, 0)` instead of `int n = map.get(key);`.

**Memory considerations:**
- Autoboxing in collections (e.g., `List<Integer>` vs. a primitive-based structure) has real memory overhead — in HotSpot a boxed `Integer` is typically a 16-byte object (12-byte header plus the 4-byte value), reached through a 4- or 8-byte reference, versus 4 bytes for a raw `int`. For very large numeric datasets, consider primitive-specialized libraries (Eclipse Collections, fastutil) or arrays directly.

**Common production bugs:**
- `NullPointerException` from unboxing a `null` wrapper (`Integer count = null; int x = count;` throws NPE at unboxing) — typically a missing map entry, a nullable database column mapped to `Integer`, or an optional JSON field.
- Using `==` on boxed `Long`/`Integer` values outside the small-integer cache range, causing subtle bugs that pass in dev testing (small test values fall in cache range) but fail in production with real, larger values. Entity IDs typed as `Long` are the classic case: `order.getCustomerId() == customer.getId()` works for the first 127 customers.
- A `(int)` cast on a `long` ID or byte count that silently wraps once values pass 2³¹.

> ✅ **Best Practice:** For high-frequency numeric processing (e.g., trading systems, JPMorgan-style low-latency services), evaluate the cost of boxing carefully; primitive collections libraries or manual array-based structures can meaningfully reduce GC pauses under load.

**Testing advice:** Use IDs and amounts above 127 — and above `Integer.MAX_VALUE` where types are `long` — in test data. Small values hide both the `==`-on-wrappers bug and narrowing overflow.

---

### 1.7 Operators

**Best practices:**
- Use `Math.addExact()`, `Math.multiplyExact()`, `Math.subtractExact()` in financial or safety-critical arithmetic to fail fast on overflow instead of silently wrapping — this has prevented real production incidents where silent integer overflow corrupted downstream calculations.
- Avoid deeply nested ternary expressions in production code — they hurt readability; prefer well-named methods or `if/else` for anything beyond a single simple condition.
- Keep side effects out of larger expressions: `count++` on its own line, not inside an index or a method argument. Add parentheses wherever a reader might have to recall precedence (mixing `&&` with `||`, or shifts with arithmetic).
- For a value that must be non-negative after `%`, use `Math.floorMod(a, n)`: `-1 % 10` is `-1`, but `Math.floorMod(-1, 10)` is `9` — the usual fix for negative hash codes picking a bucket.

**Common production bugs:**
- Silent integer overflow in ID generation, counters, or aggregation logic that only surfaces at scale (e.g., after millions of operations push a counter past `Integer.MAX_VALUE`).
- Bitwise `&`/`|` accidentally used instead of `&&`/`||` in a boolean guard, causing a null-check guard to fail to short-circuit and throwing an unexpected `NullPointerException` in production.
- `Math.abs(hashCode()) % n` used to pick a shard: `Math.abs(Integer.MIN_VALUE)` is negative, so one key in four billion produces a negative index.

> ⚠️ **Warning:** In distributed/high-scale systems, "unlikely" overflow scenarios *do* happen over time (auto-incrementing counters, hash accumulation, timestamp math). Prefer `long` over `int` for anything that could plausibly grow unbounded, and use exact-arithmetic methods where correctness matters more than raw speed.

**Testing advice:** Include boundary-value tests (`Integer.MAX_VALUE`, `Integer.MIN_VALUE`, division by zero, modulo with negative operands) in unit tests for any arithmetic-heavy service logic — these are exactly the cases that don't show up in "happy path" manual testing.

---

### 1.8 Control Flow Statements

**Best practices:**
- Prefer arrow-label `switch` — usually as a switch expression — over the classic colon form in new code. It eliminates fall-through bugs entirely and is now idiomatic in modern Java codebases (17+).
- For a switch over an enum, leave out `default` when every constant has a meaningful case. The compiler then forces an update everywhere when someone adds a constant, instead of letting it fall into a catch-all.
- Avoid deeply nested `if/else` chains (>3 levels) — refactor into guard clauses (early returns) or extract into well-named private methods for readability and testability.

> ✅ **Best Practice:** Guard clauses over nested conditionals:
```java
// Avoid
public void process(Order order) {
    if (order != null) {
        if (order.isValid()) {
            if (!order.isCancelled()) {
                // actual logic buried 3 levels deep
            }
        }
    }
}

// Prefer
public void process(Order order) {
    if (order == null || !order.isValid() || order.isCancelled()) {
        return;
    }
    // actual logic, flat and readable
}
```

**Maintainability:** Classic `switch` statements missing a `break` are a top-tier real-world bug source in large, long-maintained codebases where a new `case` gets added years later by someone unfamiliar with the fall-through risk. Static analysis tools (SonarQube, SpotBugs, error-prone) should be configured to flag missing `break`s or, better, the team should migrate to arrow-label switches entirely. Labeled `break`/`continue` deep inside nested loops usually signals a method that should be extracted.

**Common production bugs:**
- Off-by-one loop bounds causing `ArrayIndexOutOfBoundsException` or skipped/duplicated processing of the last element in a batch job — a frequent source of data-completeness bugs in ETL/batch pipelines.
- A `while` loop whose retry counter is incremented after a `continue`, so a failing call is retried forever.
- A `switch` on a value read from a database or request, without handling an unexpected value — a `default` that silently does nothing hides corrupt data. Throw an `IllegalStateException` naming the value instead.

**Debugging tips:** For complex nested loop/condition logic causing production issues, add structured logging (not just `System.out.println`) at key branch points with correlation IDs, so you can trace exactly which path execution took in a specific failing request.

---

### 1.9 Arrays

**Best practices:**
- Prefer collections (`ArrayList`, etc. — full detail in the Collections group) over raw arrays in application/business logic; reserve raw arrays for performance-critical code, fixed-size data (like cryptographic byte buffers), or interop with APIs that require them.
- Always use `Arrays.equals()` / `Arrays.deepEquals()` to compare array contents — never `==` (reference comparison) or the default `.equals()` (also reference-based for arrays, a very common bug).
- Return an empty array, not `null`, when there are no elements (Effective Java, Item 54).

> ⚠️ **Warning:** `array1.equals(array2)` on two arrays with identical contents returns `false` unless they're the *same object reference* — arrays don't override `equals()`. This is a genuinely common production bug, especially in tests that silently pass/fail incorrectly.

**Performance considerations:** For large-scale numeric processing, primitive arrays (`int[]`, `double[]`) avoid boxing overhead entirely and offer the best cache locality — relevant for latency-sensitive services processing large batches (e.g., risk calculations, market data processing).

**Common production bugs:**
- Using `==` or default `.equals()` to compare array contents (see warning above).
- `NullPointerException` from iterating over an array field that was never initialized (defensive null-checks or initializing to an empty array by default avoids this).
- Using an array as a `HashMap` key or putting arrays in a `HashSet`: their identity-based `equals`/`hashCode` mean a lookup with an equal-content array never matches. Wrap the data in a `List` or a record.
- Changing an array after wrapping it with `Arrays.asList` — or calling `add` on that list — without realizing the list and the array share the same storage.

**Anti-pattern:** Returning a mutable internal array directly from a getter — callers can mutate your object's internal state without going through any validation. Return a defensive copy (`Arrays.copyOf()`) or an unmodifiable `List` (`List.of(values)` for object arrays) instead.

```java
// Anti-pattern: exposes internal mutable state
public int[] getScores() { return this.scores; }

// Better: defensive copy
public int[] getScores() { return Arrays.copyOf(this.scores, this.scores.length); }
```

**Real-world use case:** Byte arrays (`byte[]`) are the standard representation for cryptographic keys, hashes, and network payloads throughout the JDK's security and I/O APIs — understanding raw array semantics is unavoidable when working with `MessageDigest`, `Cipher`, or NIO buffers. Compare secrets such as MAC values with `MessageDigest.isEqual`, which takes time independent of where the arrays first differ, rather than `Arrays.equals`.

---

### 1.10 Strings

**Best practices:**
- Build text in loops with a `StringBuilder` (or `String.join`, `Collectors.joining`), not repeated `+=`.
- Compare with `equals`; put the known non-null value first (`"ACTIVE".equals(status)`) or use `Objects.equals(a, b)` when either side may be `null`.
- Pass a charset whenever converting between bytes and text: `new String(bytes, StandardCharsets.UTF_8)`, `s.getBytes(StandardCharsets.UTF_8)`.
- Use `Locale.ROOT` for case conversion of identifiers, protocol values and keys (`code.toUpperCase(Locale.ROOT)`); keep the user's locale for text shown to users.
- Use parameterized logging (`log.debug("Loaded {} orders for {}", count, customerId)`) so the message string is never built when the level is disabled.

**Performance considerations:** A single `+` expression is cheap; the costs come from `+=` in loops, `String.format` in hot paths (it parses the format string every call), and `split` with a complex regular expression. Since JDK 9, HotSpot stores Latin-1-only strings in one byte per character (compact strings), so ASCII-heavy data uses about half the memory it once did.

**Security implications:** APIs that handle passwords — `Console.readPassword`, `KeyStore`, `PBEKeySpec` — use `char[]` so the caller can overwrite the secret when done; a `String` can't be wiped and may stay in memory until garbage collected. Never log secrets, and never build SQL by concatenating strings — use parameterized queries.

**Common production bugs:**
- `==` used to compare strings that came from a request, a file or a database: works in a unit test with literals, fails in production.
- Default-locale case conversion breaking matching on servers running a Turkish locale (`"FILE".toLowerCase()` contains a dotless `ı`).
- Truncating user-provided text with `substring` in a way that cuts an emoji's surrogate pair, producing an invalid string that a database or JSON encoder rejects.
- Garbled text because bytes were decoded with the platform default charset (before JDK 18) or with the wrong explicit one.

**Maintainability:** Prefer text blocks (Java 15+) for multi-line SQL, JSON and HTML in code — they keep line breaks and indentation readable without `\n` and `+` chains (Modern Features group).

---

### 1.11 Methods

**Best practices:**
- Keep methods short and single-purpose (a widely cited guideline: aim for a method to fit on one screen, roughly 20-30 lines) — long methods are harder to test, review, and reason about under production incident pressure.
- Avoid overloading methods in ways that create ambiguity with autoboxing or varargs — prefer distinct, clearly-named methods over clever overload resolution that future maintainers must mentally trace.
- Never mutate a mutable parameter as a side effect unless that's the *explicit, documented contract* of the method — hidden mutation is a classic source of hard-to-trace production bugs (especially with shared mutable objects like `StringBuilder`, `List`, or custom DTOs passed between service layers).
- Keep parameter lists short. Several parameters of the same type (`transfer(long from, long to, long amount)`) are easy to pass in the wrong order; a small record or builder makes call sites self-describing. Replace `boolean` flag parameters with two methods or an enum — `send(msg, true)` says nothing at the call site.
- Validate arguments at public boundaries (`Objects.requireNonNull(order, "order")`) so a bad value fails where it enters, not three calls deeper.

> ⚠️ **Warning:** Passing mutable objects (like a shared `List` or `Map`) into methods across service/module boundaries without clear ownership semantics is a common cause of subtle state-corruption bugs, especially under concurrent access — always document (or better, enforce via immutability) whether a method mutates its inputs.

**Common production bugs:**
- Recursion over input whose depth an attacker or a large customer controls — deeply nested JSON, a long chain of parent references — ending in `StackOverflowError` in production. Use an explicit stack or loop for data of unbounded depth.
- A method returning `null` for "no results" where callers expected an empty collection, crashing the one caller that forgot to check.

**Testing advice:** Unit test the boundary between "reassignment inside method doesn't propagate" and "mutation inside method does propagate" explicitly if your team is newer to Java — it's a genuine source of production defects when developers coming from pass-by-reference languages assume reassignment inside a method will be visible to the caller.

**Debugging tips:** When a method's side effects seem to silently "not happen," check whether the method is reassigning a local reference (invisible to caller) instead of mutating the object the caller's reference still points to.

**Framework relevance:** Spring dependency injection relies heavily on method conventions — constructor injection (preferred, enables immutability and easier testing) vs. setter injection (mutable, allows optional dependencies) is fundamentally a "methods" design decision with real production testability and thread-safety implications.

> ✅ **Best Practice:** Prefer constructor injection over field/setter injection in Spring beans — it allows fields to be `final`, makes dependencies explicit and required at construction time, and makes unit testing far simpler: a test passes collaborators (real, fake or mock) straight to the constructor, with no reflection-based injection.

---

### 1.12 Packages and Imports

**Best practices:**
- Structure packages by *feature/domain* (`com.company.orders`, `com.company.payments`) rather than purely by *layer* (`com.company.controllers`, `com.company.services`) for medium-to-large codebases — this improves cohesion and makes it easier to eventually extract a package into its own microservice/module if needed. It also lets most classes in a feature stay package-private.
- Avoid wildcard imports (`import java.util.*`) in production code style guides — most enterprise style guides (including Google's) prefer explicit imports for clarity and to avoid accidental symbol collisions when refactoring; IDEs auto-manage this anyway.
- Never put production code in the unnamed package — nothing outside it can import those classes.

**Maintainability:** Circular package dependencies (`package.a` depends on `package.b` which depends back on `package.a`) are a common architectural smell that build tools like `jdeps` or ArchUnit can detect and enforce against in CI.

**Real-world use case:** The Java Platform Module System (JPMS, `module-info.java`) builds directly on the package system to enforce strong encapsulation between modules in large applications — covered in full in the JPMS group, but it's worth knowing here that packages are the foundational unit that JPMS controls visibility over (`exports`, `opens` directives operate at the package level).

**Common production bugs:**
- Classpath conflicts ("JAR hell") where two dependencies pull in different versions of the same package/class, causing unpredictable `NoSuchMethodError` or `ClassNotFoundException` at runtime despite a successful compile — build tools (Maven/Gradle) dependency resolution and tools like `mvn dependency:tree` are the standard way to diagnose this.
- A *split package* — the same package name in two JARs — works on the classpath (whichever JAR comes first wins for each class) but is rejected outright on the module path, which surprises teams moving to modules.

> ⚠️ **Warning:** A successful `mvn compile` does not guarantee a successful runtime — classpath/dependency version conflicts are a purely runtime phenomenon (`NoSuchMethodError`, `ClassNotFoundException`) that the compiler cannot catch, since compilation only sees the dependency versions resolved for compile scope, which may differ from what's actually on the runtime classpath.

**Testing advice:** Use `mvn dependency:tree` / `gradle dependencies` regularly in CI to catch version conflicts before they surface as production runtime errors.

---

[[#📖 Master Table of Contents|⬆ Back to top]]

*End of Group 1. Next: Object-Oriented Programming.*

---

## 2. Object-Oriented Programming

### Table of Contents (this group)
- [[#2.1 Classes and Objects]]
- [[#2.2 Constructors]]
- [[#2.3 The this and super Keywords]]
- [[#2.4 Static vs Instance Members]]
- [[#2.5 Encapsulation]]
- [[#2.6 Inheritance]]
- [[#2.7 Access Modifiers]]
- [[#2.8 Composition, Aggregation and Association]]
- [[#2.9 Method Overloading]]
- [[#2.10 Method Overriding]]
- [[#2.11 Overriding vs Hiding]]
- [[#2.12 Polymorphism]]
- [[#2.13 Upcasting and Downcasting]]
- [[#2.14 Abstraction]]
- [[#2.15 Abstract Classes]]
- [[#2.16 Interfaces]]
- [[#2.17 Abstract Class vs Interface]]
- [[#2.18 The final Keyword]]
- [[#2.19 The Object Class]]
- [[#2.20 equals and hashCode]]
- [[#2.21 Immutability]]
- [[#2.22 Object Initialization Order]]

---

### 2.1 Classes and Objects

**Best practices:**
- Favor small, focused classes with a single responsibility (Single Responsibility Principle) — large "god classes" doing everything are a top code-review red flag and a major source of merge conflicts and regressions in shared codebases.
- Prefer immutable objects (`final` fields, no setters) wherever the domain allows it — dramatically simplifies reasoning in multi-threaded services and eliminates a whole class of state-corruption bugs.
- Copy deliberately. `Order copy = original;` shares one object; when a caller needs its own, provide a copy constructor or a static factory (`Order.copyOf(original)`) so the intent is visible at the call site.

**Real-world use case:** Domain-driven design (DDD) relies heavily on well-modeled classes (Entities, Value Objects) to represent business concepts directly in code — a `Money` class, not a raw `double`, is the standard example of this in financial systems.

**Memory considerations:** Every object carries a header before its field data. Its size is a HotSpot detail, not a language rule: on a 64-bit HotSpot JVM it is 12 bytes with compressed class pointers (the default) and 16 without, and JDK 25's opt-in compact object headers (`-XX:+UseCompactObjectHeaders`, JEP 519) shrink it to 8. At massive scale (millions of small objects) this overhead is a real factor in heap sizing and GC time, which motivates primitive collections and flatter data layouts in latency-sensitive systems. Pooling ordinary small objects rarely helps on a modern collector; pool only objects that are genuinely expensive to create, such as connections.

**Common production bugs:**
- Mutable objects shared across threads without synchronization, leading to visibility/race-condition bugs that are hard to reproduce (full detail in the Concurrency group).
- Accidental aliasing: a service caches an object, a caller "edits its copy", and every other request sees the edit — because there was only ever one object.

**Anti-pattern:** Returning `null` from a method that returns an object to mean "nothing found". Every caller must remember the check, and the one that forgets fails far from the cause. Return an empty collection or an `Optional`, or throw.

**Testing advice:** Keep classes small enough to unit test in isolation — a class requiring extensive mocking to test is often a sign it's doing too much (a maintainability smell, not just a testing inconvenience).

---

### 2.2 Constructors

**Best practices:**
- Validate in the constructor and fail fast. An object that rejects bad arguments at creation never has to be checked again, and the stack trace points at the code that supplied the bad value rather than at a later use.
- Prefer **constructor injection** over field/setter injection in Spring — it allows `final` fields, makes required dependencies explicit at the type level, and makes unit testing trivial: a test passes collaborators (real, fake or mock) straight to the constructor, with no reflection-based injection.
- For classes with many optional constructor parameters, use the **Builder pattern** instead of telescoping constructor overloads — far more readable and less error-prone at call sites.
- Consider a static factory method when a name explains more than a parameter list (`Duration.ofSeconds(5)` and `Duration.ofMillis(5)` say what a bare `new Duration(5)` could not), or when you may want to return a cached instance or a subtype.

> ✅ **Best Practice:**
```java
// Telescoping constructors (avoid)
new Pizza("large", true, false, true, false);

// Builder pattern (prefer)
Pizza pizza = new Pizza.Builder()
    .size("large")
    .cheese(true)
    .pepperoni(true)
    .build();
```

**Framework relevance:** Spring strongly recommends constructor injection since version 4.3+ (it became even more ergonomic — no `@Autowired` annotation needed for a single constructor). Lombok's `@RequiredArgsConstructor` is commonly used in production Spring codebases to reduce constructor boilerplate for `final` fields. Frameworks that create objects reflectively (JPA, Jackson) often need a no-arg constructor — JPA requires one with `public` or `protected` access — which is a common reason to add one deliberately.

**Common production bugs:**
- Constructors that perform expensive work (network calls, file I/O) — this violates the expectation that object construction is cheap and fast, and can cause surprising latency spikes or failures during dependency-injection container startup.
- Publishing `this` from a constructor — registering with an event bus, starting a thread that uses the object — so another thread sees the object before its fields are set.

**Anti-pattern:** Calling overridable instance methods from within a constructor — the subclass override may execute before subclass fields are initialized, a real source of `NullPointerException`s in production that's hard to trace back to its root cause.

---

### 2.3 The this and super Keywords

**Best practices:** Keep `super` calls used for extending overridden behavior explicit and well-commented when the *order* of parent-vs-child logic matters (e.g., validation before vs. after parent logic) — this ordering is easy to get subtly wrong during refactors and hard to spot in code review without a clear comment.

**Maintainability:** Long chains of `super.method()` calls across 3+ levels of a class hierarchy are a maintainability smell — they make it hard to trace the full behavior of a method without reading every level of the hierarchy. This is one of several arguments in favor of preferring composition over deep inheritance chains in production codebases.

**Debugging tips:** When behavior seems to "skip" expected logic in an overridden method, check whether `super.method()` was omitted (a common bug when a new override is added without realizing the parent had important shared logic).

**Common production bugs:**
- Refactoring a parent class's method — changing internal call order — can silently change subclass behavior anywhere `super.method()` was called, especially if the parent's contract (what it guarantees) was never explicitly documented.
- Leaking `this` from a constructor: `eventBus.register(this)` or `executor.submit(this::poll)` inside a constructor lets another thread use the object before its fields are assigned. Register from a factory method or an explicit `start()` after construction instead.

**Real-world use case:** `return this;` is what makes fluent APIs work — builders (`new StringBuilder().append(a).append(b)`) and configuration objects return the current object from each call so calls chain.

---

### 2.4 Static vs Instance Members

**Best practices:** Avoid mutable static state in production services entirely where possible — it's effectively global, shared, mutable state across the whole JVM, and a very common source of race conditions and hard-to-reproduce bugs in concurrent, multi-threaded server applications (e.g., a Spring Boot service handling many requests concurrently). Static is the right choice for constants (`static final` of immutable values), pure functions, and static factory methods.

> ⚠️ **Warning:** A `static` mutable field (a cache, counter, or "current context" holder) in a web service is one of the most common real-world sources of subtle data leakage between concurrent requests — different threads (requests) can silently interfere with each other's state.

**Performance considerations:** Static utility methods (stateless, e.g., `Math.sqrt()`, `StringUtils.isBlank()`) are cheap to call and safe to share across threads — the concern is specifically *mutable* static state, not static methods themselves.

**Scalability concerns:** Static caches without proper eviction/synchronization don't scale safely in high-throughput services — prefer well-tested caching libraries (Caffeine, Guava Cache) or externalized caches (Redis) over ad-hoc static `HashMap` caches.

**Common production bugs:**
- A static field used as an application-wide cache or singleton without thread-safety, causing rare, hard-to-reproduce data corruption under production load that doesn't show up in single-threaded local testing.
- A static initializer that reads configuration or opens a connection fails once at startup — and every later use of the class throws `NoClassDefFoundError: Could not initialize class …`, which hides the original cause. Look for the first `ExceptionInInitializerError` in the log; keep static initializers trivial.

**Testing advice:** Static state makes unit tests less isolated — tests can accidentally leak state into each other via shared static fields, causing flaky, order-dependent test failures. Prefer dependency injection over static singletons for anything with meaningful state.

---

### 2.5 Encapsulation

**Best practices:**
- Default to package-private or `private` visibility, and only widen (`protected`/`public`) when there's a concrete need — this is the "principle of least privilege" applied to API design, and it keeps refactoring options open.
- Use immutable value objects (or Java `record`s, covered later) for data that shouldn't change after creation — eliminates an entire category of encapsulation-violation bugs from mutable getters returning live internal state.
- Model operations, not setters. A domain object such as `Order` exposes `addLine`, `cancel` and `ship`, each enforcing its rules; a data-transfer object at the edge of the system can be a transparent `record`. Mixing the two — an entity with a public setter for every column — is how business rules end up scattered across services.

**Security implications:** Encapsulation boundaries are a design convention enforced by the compiler and JVM, not a security boundary — reflection (`setAccessible(true)`) can bypass `private` access for classes on the classpath. In security-sensitive code, don't rely on encapsulation alone to protect genuinely sensitive data (secrets, keys) — combine it with proper access control, sandboxing, or the Java Platform Module System's stronger encapsulation (covered in the JPMS group), which refuses reflective access to packages a module does not open.

**Common production bugs:** A getter returning a direct reference to an internal mutable collection (`List`, `Map`) — callers mutate it directly, corrupting the object's internal state in ways that bypass all validation logic. This is a genuinely common, hard-to-trace production bug in codebases with many contributors.

> ⚠️ **Warning:** `return this.items;` on a private `List<Item> items` field is a broken-encapsulation bug hiding in plain sight. Return `List.copyOf(items)` for a snapshot, or `Collections.unmodifiableList(items)` for a read-only view that reflects later changes — and remember that neither stops callers from mutating the `Item` objects themselves if those are mutable.

**Testing advice:** Write tests that specifically attempt to mutate objects returned from getters, to catch encapsulation leaks early — a cheap, high-value test pattern for shared library code.

---

### 2.6 Inheritance

**Best practices:**
- Favor composition over inheritance by default in production system design — inheritance should be reserved for genuine, stable "is-a" relationships that are unlikely to need restructuring later.
- Document a parent class's overridable methods clearly (what invariants must hold, what order things happen in) if you expect subclassing — undocumented "protected extension points" are a major source of fragile-base-class bugs in large codebases.
- Design for inheritance or prohibit it. A class not meant to be extended should be `final` (or `sealed` with an explicit `permits` list), so nobody builds on implementation details you never promised.

**Anti-pattern:** Deep inheritance hierarchies (4+ levels) in application/business logic — these are notoriously hard to test, reason about, and safely refactor. Most modern architectural guidance (including Effective Java) favors shallow hierarchies or composition instead.

**Real-world use case:** Framework-provided abstract base classes (e.g., JPA's `@MappedSuperclass` for shared entity fields like `id`/`createdAt`) are a common, generally-accepted use of inheritance — because the framework's contract is stable and well-documented, unlike ad-hoc application-level hierarchies.

**Testing advice:** Subclasses inheriting complex parent behavior often require testing both in isolation *and* integrated with the parent's actual behavior (not just mocked) — pure unit tests can miss bugs that only appear in the full inheritance chain's interaction.

**Common production bugs:** Upgrading a shared parent/base class in a large codebase (or a third-party library) silently changes behavior for every subclass — a classic "fragile base class" incident, especially dangerous in large monorepos or widely-used internal shared libraries. Extending a library class you don't own (a collection, an HTTP client) is the riskiest form: its self-use can change in any release.

---

### 2.7 Access Modifiers

**Best practices:** Apply the "principle of least privilege" rigorously — start every new field/method as `private`, and only widen visibility when there's a proven, concrete need from calling code. This keeps the true public API surface small and refactorable. Package-private is a good default for classes too: organise packages by feature (`order`, `billing`) rather than by layer, and most classes can then stay invisible outside their feature.

**Maintainability:** A large public API surface (many public methods/fields) is expensive to maintain long-term — every public member is effectively a promise to external callers that changing or removing it may break them. Static analysis tools (e.g., ArchUnit, Checkstyle) are commonly configured in production codebases to flag unnecessarily broad visibility.

**Security implications:** Sensitive internal logic (validation rules, business calculations) should never be exposed with broader visibility than necessary — a `public` method meant only for internal package use is a common, low-severity but real security/robustness smell, since external callers might invoke it in unintended ways or come to depend on it, complicating future refactors.

**Real-world use case:** The Java Platform Module System (JPMS, covered fully in its own group) extends access-modifier-based encapsulation across whole packages/modules — `exports` in a `module-info.java` controls which packages are visible outside the module at all, even if their classes/methods are `public`.

**Common production bugs:** Making a field `public` "temporarily" during a hotfix or prototype, which then gets relied upon elsewhere and becomes very difficult to safely tighten later without a coordinated refactor across the codebase.

**Testing advice:** Test through the public API where you can. When a test needs a package-private hook, keep the test in the same package rather than widening the member to `public` — a member made public "for tests" becomes API.

---

### 2.8 Composition, Aggregation and Association

**Best practices:**
- Compose services from collaborators passed into the constructor: an `OrderService` HAS-A `OrderRepository` and a `PaymentGateway`, held in `private final` fields. The dependencies are visible in one place, and tests pass fakes through the same constructor.
- Add cross-cutting behaviour by wrapping, not subclassing. A `CachingPriceService implements PriceService` that holds another `PriceService` can be stacked with retry or metrics wrappers in any order, and none of them depends on another's internals.
- Keep owned parts private. An aggregate such as `Order` exposes operations (`addLine`, `removeLine`) and read-only snapshots, never its internal list.

**Maintainability:** Avoid reaching through parts — `order.getCustomer().getAddress().getCity()` couples the caller to three classes' structure. Ask the object that has the information (`order.shippingCity()`), so the internal composition can change without touching callers.

**Real-world use case:** Resource ownership follows the aggregation/composition line. A class that *creates* a resource — a connection, an executor, a stream — owns it and must close it, typically by implementing `AutoCloseable`. A class that is *given* one (the shared connection pool, the application's `HttpClient`) merely uses it and must not close it.

**Common production bugs:** A component closes a resource it was handed — the shared pool or client — and every other user fails afterwards with "pool closed" or "executor shut down". The opposite bug leaks: a class creates an executor or client per instance and nothing ever closes it.

**Anti-pattern:** "Base service" superclasses that every service extends to inherit a logger, a repository and some helpers. Each service now depends on all of them, and changing the base class touches the whole codebase. Inject the collaborators each service actually uses instead.

**Testing advice:** Composition makes test seams natural: pass an in-memory implementation of the part's interface rather than mocking a superclass. If a class is hard to test without subclassing it, that usually means a collaborator should become a field.

---

### 2.9 Method Overloading

**Best practices:**
- Use overloading judiciously (Effective Java, Item 52). Avoid two overloads with the same number of parameters whose types are convertible to each other — callers can't tell which one runs. Different names are clearer: `ObjectOutputStream.writeInt`/`writeLong`, `Duration.ofSeconds`/`ofMillis`.
- If overloads do exist, make them behave the same when an argument fits both — typically by having one forward to the other — so the choice never matters to the caller.
- Be careful adding an overload to a published API: a new overload can make existing calls ambiguous (`null` arguments) or silently switch them to the new method on recompilation.

**Common production bugs:**
- `List<Integer>.remove(i)` removing by index instead of by value — it compiles, passes tests that happen to use small lists, and deletes the wrong record in production.
- `Arrays.asList(intArray)` producing a one-element `List<int[]>`, so a `contains` check is always false.
- An overload taking a primitive (`setTimeout(long)`) called with a null wrapper from a config object, throwing `NullPointerException` during unboxing far from where the value went missing.

**Maintainability:** Overloads that take `Object` alongside specific types (`log(Object)`, `log(String)`) are especially fragile — which one runs depends on the declared type at each call site, so refactoring a variable's type can change behaviour without any error.

**Anti-pattern:** Overloads that differ in meaning, not just input — `delete(long id)` deletes by key while `delete(Long id)` deletes "matching" records. Boxing decides which one runs. Give different behaviours different names.

---

### 2.10 Method Overriding

**Best practices:**
- Put `@Override` on every overriding and implementing method; most teams enforce it with Checkstyle or Error Prone. It turns a renamed parent method or a mistyped parameter into a compile error instead of a silent behaviour change.
- Honour the parent's contract, not just its signature. The compiler checks types, access and checked exceptions; it cannot check that an override still does what the parent promised (no new preconditions, no weaker results — the Liskov Substitution Principle, 2.12).
- Make methods `final` (or the class `final`) when overriding them would break an invariant, and document the ones meant to be overridden — what they're called for, and what they may and may not do.

**Common production bugs:**
- A parent method is `synchronized` but the override isn't, so the subclass silently loses the parent's thread-safety — overrides don't inherit `synchronized`.
- A subclass "override" that stopped overriding after the parent method's signature changed in a library upgrade — without `@Override`, the old method just stops being called.
- `equals(MyType)` written as an overload, so `HashSet`, `List.contains` and JPA dirty checking all use identity equality.

**Framework relevance:** Subclass-based proxies (CGLIB, used by Spring for `@Transactional` and `@Cacheable` on classes) work by overriding your methods. A `final` or `private` method can't be overridden, so the proxy can't intercept it and the annotation is silently ignored.

**Debugging tips:** When a method "isn't being called", check which class actually declares the running version — the debugger's step-into or a stack trace shows it. An override in a subclass, or a missing one, is often the answer.

---

### 2.11 Overriding vs Hiding

**Best practices:**
- Always call static members through the class name (`Parent.kind()`), never through a variable. Enable `javac -Xlint:static` or the equivalent IDE inspection so instance-qualified static access is flagged.
- Don't redeclare inherited fields. If subclasses need a different value, pass it to the parent's constructor or expose it through an overridable (or abstract) method — behaviour dispatches, fields don't.
- Keep fields `private` (2.5). A private field can't be hidden by accident in a way that confuses callers, because nobody outside the class can name it.

**Common production bugs:** A subclass redeclares a configuration field (`timeoutSeconds`, `maxRetries`, `logger`) to customise it. The subclass's own methods use the new value, the inherited ones use the old, and the class behaves inconsistently depending on which code path runs. Static analysis tools such as SonarQube flag fields that hide a parent's field.

**Maintainability:** Same-named static factories in a parent and child class (`Shape.of(...)` and `Circle.of(...)`) are fine when always called through the class name — and confusing when called any other way. Prefer distinct names when the methods do different things.

**Debugging tips:** When a value looks right in one method and stale in another, check whether the class declares a field with the same name as one in a superclass — debuggers show both fields on the object, often as `name` and `Parent.name`.

---

### 2.12 Polymorphism

**Best practices:** Design method contracts (via interfaces or abstract base classes) so that overriding subclasses can be substituted without surprising callers — this is the essence of the **Liskov Substitution Principle**, a core production design guideline: a subclass must not strengthen preconditions (demand more of callers than the parent did) or weaken postconditions (promise less than the parent did). It may accept more and promise more.

**Real-world use case:** The Strategy design pattern is polymorphism applied directly to production code — e.g., a payment service with a `PaymentStrategy` interface and multiple implementations (`CreditCardStrategy`, `PayPalStrategy`) selected at runtime based on user choice, without the calling code needing `if/else` chains checking payment type.

**Common production bugs:** Violating the Liskov Substitution Principle — a subclass override that throws an exception the parent's contract never mentioned, or silently does nothing where the parent guaranteed an effect — breaks calling code that was written trusting the parent's documented behavior. The JDK shows the trade-off: `List.add` is documented as an *optional* operation precisely so that read-only lists (`List.of(...)`) can throw `UnsupportedOperationException` without breaking the contract — which moves the failure to runtime for any method that receives one as "a `List`" and adds to it.

**Debugging tips:** When debugging unexpected behavior in polymorphic code, always check the *actual runtime type* of the object (e.g., via a debugger or `getClass()`), not just the declared/static type visible in the code — the bug is often in a specific override you didn't expect to be invoked.

**Anti-pattern:** Using `instanceof` checks and casting instead of proper polymorphic dispatch over an open hierarchy (`if (shape instanceof Circle) { ... } else if (shape instanceof Square) { ... }`) — this defeats the purpose of polymorphism, is fragile to new subtypes, and is a common code-smell flagged in reviews. The exception is a *closed* set of types: over a `sealed` interface, a Java 21 `switch` with type patterns is exhaustive — the compiler reports any subtype you forgot — so it is a sound design when the operation doesn't belong inside the types.

**Performance considerations:** Polymorphic calls are not a performance problem in typical services — the JIT inlines call sites that see one or two receiver classes. Measure before replacing an interface call with a type switch "for speed".

---

### 2.13 Upcasting and Downcasting

**Best practices:**
- Upcast freely at boundaries: declare parameters, fields and return types as the most general type that offers what you need (`List`, not `ArrayList`; `PaymentMethod`, not `CardPayment`).
- Avoid downcasting in business code. When you need subtype behaviour, add a method to the supertype; when the set of subtypes is closed, model it as a `sealed` interface and use an exhaustive `switch` with type patterns.
- When a downcast is unavoidable — framework callbacks, `Object` parameters, deserialized payloads — always pair it with `instanceof` pattern matching and handle the "none of the above" case explicitly.

**Common production bugs:**
- A new subtype reaches code that blindly downcasts (`(OrderEvent) event`), and a feature that has nothing to do with the new type starts failing with `ClassCastException`.
- ORM lazy-loading proxies: a lazily loaded reference to an entity in an inheritance hierarchy can be a proxy of the *base* class, so `(CardPayment) order.getPayment()` fails even though the row is a card payment. Load the concrete entity or unwrap the proxy rather than casting.
- Unchecked generic casts (`(List<Order>) cache.get(key)`) that compile with a warning and fail later, far from the cast, when an element of the wrong type is read.

**Maintainability:** Each downcast is a hidden dependency on a concrete subtype. Grep for casts when reviewing a hierarchy change — they are where new subtypes break things.

**Modern recommendations:** Prefer `if (x instanceof Foo foo)` over `if (x instanceof Foo) { Foo foo = (Foo) x; … }` — the pattern form can't get out of sync with its check — and prefer a pattern `switch` over a sealed type to a chain of `instanceof` tests (Modern Features group).

---

### 2.14 Abstraction

**Best practices:**
- Abstract at boundaries that change independently of your core logic: persistence, messaging, external APIs, clocks and randomness. Name the operations in domain terms (`findOverdueInvoices()`), not in the technology's terms (`selectWhereDueDateLessThanNow()`).
- Make failures part of the abstraction. Translate low-level exceptions (`SQLException`, an HTTP client's timeout) into ones that mean something to the caller (`PaymentDeclinedException`, `PriceUnavailableException`); otherwise the abstraction leaks its implementation through every `catch` block.
- Start concrete inside a module. Extract an interface when a second implementation, a test double that can't be built otherwise, or a module boundary actually appears — renaming a class to an interface later is a cheap refactoring.

**Common production bugs:** A leaky abstraction hiding cost — an entity getter that silently triggers a database query per call (the N+1 problem), or a "local" method that makes a remote call inside a loop. The code looks innocent because the abstraction hides exactly the detail that matters at scale.

**Maintainability:** Layers that only forward (`Controller → Service → Manager → Repository`, each method a one-line pass-through) add files and stack frames without hiding anything. Each layer should own a decision; if it doesn't, merge it.

**Real-world use case:** Hexagonal ("ports and adapters") architecture is abstraction applied to a whole service: the core declares interfaces such as `PaymentPort` in its own vocabulary, and adapters implement them for Stripe, a database or a message broker. The core can then be tested without any infrastructure.

**Testing advice:** A good abstraction is easy to fake. If a test double for an interface needs to reproduce SQL behaviour or HTTP status codes, the abstraction is exposing implementation details and should be raised to the domain's level.

---

### 2.15 Abstract Classes

**Best practices:**
- Use abstract classes for the **Template Method** design pattern in production — define a fixed algorithm skeleton in the abstract class, with specific steps deferred to subclasses (e.g., a base `DataImportJob` class defining `run() { extract(); transform(); load(); }` where subclasses implement each step differently per data source). Declare the skeleton method `final` so no subclass can reorder or skip the steps.
- Keep the extension surface small and explicit: `abstract` for steps every subclass must supply, `protected` hook methods with empty defaults for optional ones, and `private` for everything else.
- Give the abstract class `protected` constructors that validate shared fields, so every subclass object starts with the base class's invariants in place.

**Real-world use case:** Many framework base classes across the Spring ecosystem use exactly this pattern — providing shared, boilerplate-reducing infrastructure while leaving specific business logic to be implemented by the concrete subclass. The JDK's `AbstractList` and `AbstractMap` are *skeletal implementations*: extend one and implement two or three methods to get a complete collection.

**Maintainability:** Abstract classes work well when the shared logic is genuinely stable, but become a liability if the "shared skeleton" needs frequent changes — every change risks affecting all subclasses simultaneously, unlike more isolated composition-based designs.

**Common production bugs:** Forgetting to call a required setup/teardown method that the abstract parent class's contract implicitly expects (but doesn't enforce via the type system) — a common source of subtle bugs when the parent's documentation is incomplete or out of date. A `final` template method that calls setup and teardown itself removes the possibility.

**Modern recommendations:** For many "template method"-style use cases, modern Java increasingly favors composition with functional interfaces (passing behavior as a lambda/`Function` parameter) over abstract classes, since it avoids the rigidity of a fixed single-inheritance hierarchy — covered further in the Streams/Lambdas group.

---

### 2.16 Interfaces

**Best practices:**
- Design interfaces around the *client's* needs, not the implementation's convenience (Interface Segregation Principle) — many small, focused interfaces are preferred over one large interface with methods most implementers don't need.
- Use default methods sparingly in production interfaces — they're most appropriate for genuinely optional, backward-compatible additions to an existing widely-implemented interface (their original motivating use case in the JDK collections), not as a general substitute for abstract classes.
- Introduce an interface where it buys something: several implementations, a module or service boundary, or a dependency you want to replace in tests with a hand-written fake. A single implementation inside one module is usually better injected as a concrete class.

**Real-world use case:** Interfaces at architectural boundaries — `PaymentGateway`, `OrderRepository`, `Clock` — let the core code depend on a contract while the infrastructure behind it changes. Spring wires in whichever implementation is configured (or a test double in tests). Spring doesn't *require* interfaces for injection, though — it injects concrete classes just as well — so add them for the boundary, not for the container.

**Testing advice:** Interfaces make hand-written fakes and in-memory implementations easy, which often gives clearer tests than mocks. They are not needed for mocking: Mockito mocks concrete classes, and since Mockito 5 its default inline mock maker mocks `final` classes too. A class that is hard to test usually has too many dependencies, not too few interfaces.

**Common production bugs:** Two default methods from unrelated interfaces conflicting when a class implements both — caught at compile time (a forced override), so this is more of a compile-time nuisance than a runtime bug, but it can require awkward resolution code in practice. A subtler one: a default method added to a library interface silently takes effect in every implementation that didn't override it, including ones whose state it doesn't understand (a synchronized collection whose new default method isn't synchronized).

**Deprecated approaches to avoid:** The "constant interface" — an interface holding only constants, implemented by classes to get unqualified access to them. It leaks those constants into every implementing class's public API; use a `final` class with a private constructor and `import static` instead. Marker interfaces themselves (no methods, such as `Serializable`) are still a sound tool when you want a *type* the compiler can check — a method can accept only marked objects. Prefer an annotation when marking methods or fields, or when the mark is metadata for a framework rather than a type (Effective Java, Item 41).

---

### 2.17 Abstract Class vs Interface

**Best practices:**
- Define types as interfaces, especially at boundaries other teams implement or depend on (Effective Java, Item 20: prefer interfaces to abstract classes). Offer an abstract skeletal implementation alongside when implementing the interface from scratch is tedious.
- Reach for an abstract class when the shared part is *state and its invariants* — an entity base with a validated identifier, a job base with a fixed lifecycle — not merely a few shared helper methods, which can live in default methods or a composed helper.
- Keep abstract base classes shallow and few. One level of abstract base per family is usually enough; more becomes the deep hierarchy problem from 2.6.

**Real-world use case:** A closed domain model often uses neither hierarchy style alone: a `sealed interface PaymentMethod permits Card, BankTransfer, Wallet` with `record` implementations gives a fixed set of immutable types, and an exhaustive `switch` over them handles each case (Modern Features group).

**Maintainability:** Interfaces are easier to evolve for *callers* but harder for *implementers*: an added abstract method breaks every implementation, and an added default method changes behaviour in all of them. Abstract classes are the reverse — you can add concrete methods freely, but every subclass is bound to your implementation. Choose based on who you expect to change more.

**Anti-pattern:** A "base class for everything" — `AbstractService`, `BaseController` — used to share utilities rather than model a family. It forces every class into one hierarchy, and every change to it touches them all. Inject the utilities instead (2.8).

**Testing advice:** Tests should depend on the interface, so the same test suite can be run against every implementation (a contract test). Abstract base classes for *test* fixtures are a reasonable exception: a shared abstract test class whose abstract method creates the implementation under test.

---

### 2.18 The final Keyword

**Best practices:**
- Make every field `final` unless it genuinely changes. Constructor-injected dependencies (`private final OrderRepository repository;`) are the everyday case: the compiler guarantees each is set once, and the object can't be left half-wired.
- Make value classes and utility classes `final`. A value type such as `Money` stays trustworthy only if nobody can subclass it into something mutable; a utility class with a private constructor and `final` can't be instantiated or extended by accident.
- Expose library constants that might change through a method (`static int defaultTimeout()`), not a `public static final int`, so callers pick up new values without recompiling.

**Framework relevance:** Subclass-based proxies need non-final classes and methods. Spring's CGLIB proxies — behind `@Transactional`, `@Cacheable` and `@Configuration` classes — can't subclass a `final` class (startup fails) and can't override a `final` method (the annotation is silently ignored on that method). Hibernate likewise needs non-final entity classes and methods to create lazy-loading proxies.

**Common production bugs:**
- A `final` field holding a mutable collection exposed through a getter, mistaken for read-only.
- A changed constant in a shared library that half the services still see with its old value, because only some were rebuilt.
- `@Transactional` on a `final` method of a Spring bean: the proxy can't intercept it, so no transaction starts and nothing reports the problem.

**Maintainability:** `final` on locals and parameters is a style choice — useful in long methods, noise in short ones. Teams usually agree on one convention and let the IDE apply it; what matters is `final` on fields.

---

### 2.19 The Object Class

**Best practices:**
- Override `toString()` on all meaningful domain objects — dramatically improves log readability and debugging speed in production incident response, where you're often staring at logged object dumps under time pressure.
- Copy with a copy constructor or a static factory (`Order.copyOf(other)`), not `clone()`, so the copy runs constructor validation and you decide how deep it goes.
- Release resources with `AutoCloseable` and try-with-resources. Never override `finalize()`; treat `Cleaner` as a last-resort safety net, not the cleanup mechanism.

**Security implications:** Be careful not to include sensitive fields (passwords, tokens, PII) in an overridden `toString()` — since logging frameworks frequently call `toString()` implicitly (e.g., logging an exception with an object as context), an unguarded `toString()` is a common, real source of sensitive data leaking into logs.

> ⚠️ **Warning:** `toString()` on an entity with a `password` or `ssn` field, used carelessly in logging statements, is a genuine, recurring compliance/security issue in production codebases — audit domain objects for this specifically.

**Common production bugs:**
- A generated `toString()` (Lombok `@ToString`, IDE templates) on a JPA entity walks lazy associations, triggering extra queries — or a `LazyInitializationException` outside a transaction, or infinite recursion between two entities that reference each other. Exclude associations from entity `toString()`.
- Code comparing `obj.getClass() == Order.class` fails for framework proxies, whose runtime class is a generated subclass.

**Modern recommendations:** For data carriers, Java `record` types (Java 16+) generate `toString()`, `equals()` and `hashCode()` from their components (Modern Features group) — redact sensitive components by overriding `toString()` in the record.

---

### 2.20 equals and hashCode

**Best practices:**
- Use an IDE generator, Lombok's `@EqualsAndHashCode`, or (best of all, for simple data carriers) Java `record` types to generate correct `equals()`/`hashCode()` — hand-writing these invites subtle contract violations.
- Base equality on what identifies the object. Value objects (`Money`, `Address`) compare all their fields; entities compare their identity. For JPA entities, avoid all-field equality and generated `@Data`/`@EqualsAndHashCode` — they touch lazy associations and change when fields change. A common pattern compares the database ID when both are non-null and returns a constant `hashCode()`, which stays stable before and after the entity is saved.
- Make classes used as map keys or set elements immutable, or at least never mutate the fields their `hashCode` uses while they are stored.

**Common production bugs:** Overriding `equals()` without `hashCode()` on an entity later stored in a `HashSet`/`HashMap` (or used as a cache key). It passes code review and tests that look up the same instance they inserted — that instance's identity hash matches — then fails in production as soon as a logically equal *new* instance is used: one re-read from the database or built from a request has a different identity hash, so the lookup searches the wrong bucket and misses. Duplicates appear and cache hits vanish at any data size.

**Testing advice:** Use dedicated contract-testing libraries (e.g., `EqualsVerifier`) in unit tests to programmatically verify `equals()`/`hashCode()` satisfy the full formal contract (reflexive, symmetric, transitive, consistent, non-null) — this catches subtle violations that manual test cases often miss.

**Modern recommendations:** For simple immutable data carriers, prefer Java `record` types (Java 16+) over hand-written classes — records auto-generate a correct `equals()`, `hashCode()`, and `toString()` for free, removing this entire bug category (full detail in the Modern Java Features group). Watch for array components, which records compare by identity; store a `List` instead, or override `equals` and `hashCode`.

---

### 2.21 Immutability

**Best practices:**
- Make value objects and DTOs immutable — `Money`, `Address`, request and response bodies, events, configuration. Records are the default tool; Jackson and most modern frameworks construct them directly.
- Use `java.time` (`Instant`, `LocalDate`) instead of the mutable `Date` and `Calendar`, so date fields need no defensive copies.
- Return immutable collections from APIs (`List.copyOf`, `Map.copyOf`) and accept any collection as input, copying it on the way in.
- Share immutable objects freely — a single `static final` instance of an immutable configuration or lookup table is safe for every request thread.

**Real-world use case:** Events and messages. An `OrderPlaced` event passed to several listeners, queued, logged and retried must look the same to all of them; if one listener could mutate it, the others would process a different event than the one that was published.

**Common production bugs:**
- A "read-only" configuration object whose getter returns its internal `Map`, which one component modifies at runtime — changing behaviour for every other component.
- A record holding a `List` built by the caller, which the caller keeps adding to after handing it over.
- Mutable objects used as cache keys, which are lost once mutated (2.20).

**Performance considerations:** Allocation of short-lived immutable objects is cheap on modern collectors, and immutable objects avoid the locks, copies and cache invalidation that shared mutable state needs. Where a hot path performs thousands of incremental changes, build with a mutable builder and freeze once.

**Maintainability:** Not everything should be immutable. Entities with a lifecycle — an `Order` that is placed, paid and shipped — are naturally mutable, and JPA expects that; protect them with encapsulation (2.5) instead. Keep the immutable/mutable split deliberate: values immutable, entities encapsulated.

---

### 2.22 Object Initialization Order

**Best practices:**
- Keep constructors to assignment and validation. Call only `private`, `static` or `final` methods from them, so no subclass code runs against a half-built object.
- Keep static initializers trivial — constants and pure computation. Configuration, files, network and database access belong in objects created at startup by the application (or its dependency-injection container), where failures are reported clearly and can be retried.
- For an expensive lazily-created singleton, use the holder idiom: `private static class Holder { static final Service INSTANCE = new Service(); }` — the JVM's class-initialization guarantee makes it lazy and thread-safe without locks.

**Common production bugs:**
- `NoClassDefFoundError: Could not initialize class …` on every request after one transient failure in a static initializer (a config file that wasn't mounted yet, a DNS lookup). The real cause is the first `ExceptionInInitializerError` in the log; the class stays unusable until the JVM restarts.
- A subclass override invoked from a framework base class's constructor reads its own `@Autowired` or initialized fields as `null`.
- Class-initialization deadlock at startup: two classes whose static initializers reference each other, first touched from two different threads, each waiting for the other to finish initializing.

**Debugging tips:** When a value is unexpectedly `null` or `0` inside a method that "can't" see it unset, check whether the method was called from a superclass constructor. `javac -Xlint:this-escape` (JDK 21+) flags constructors that let `this` escape to overridable methods.

**Performance considerations:** Class initialization runs on first use, so heavy static setup shows up as latency on the first request that touches the class. Warm critical paths at startup, or make the work lazy and explicit.

---

[[#📖 Master Table of Contents|⬆ Back to top]]

*End of Group 2. Next: Collections Framework.*

---

## 3. Collections Framework

### Table of Contents (this group)
- [[#3.1 The Collection Hierarchy Overview]]
- [[#3.2 List Implementations (ArrayList vs LinkedList)]]
- [[#3.3 Set Implementations (HashSet, LinkedHashSet, TreeSet)]]
- [[#3.4 Map Implementations (HashMap, LinkedHashMap, TreeMap, Hashtable)]]
- [[#3.5 Queue and Deque (ArrayDeque, PriorityQueue)]]
- [[#3.6 Iterator and Iterable]]
- [[#3.7 Comparable vs Comparator]]
- [[#3.8 The Collections Utility Class]]

---

### 3.1 The Collection Hierarchy Overview

**Best practices:** Always declare variables using the interface type (`List<T>`, `Map<K,V>`) rather than the concrete implementation (`ArrayList<T>`, `HashMap<K,V>`) — this lets you swap implementations later (e.g., switching to a `LinkedHashMap` for ordering, or a thread-safe variant) without touching calling code.

**Real-world use case:** Public API method signatures returning `List<T>` (not `ArrayList<T>`) is standard practice across virtually all well-designed Java libraries and frameworks (including the JDK itself) — it keeps the implementation detail hidden and swappable.

**Maintainability:** Depending on concrete types throughout a codebase (`ArrayList` everywhere) makes later refactors (e.g., needing thread-safety, or sorted order) far more invasive than if the codebase consistently used interface types.

**Common production bugs:** Passing a `List` returned by `Arrays.asList()` or `List.of()` to code that assumes it's mutable — both are read-only or fixed-size, and calling `add()`/`remove()` throws `UnsupportedOperationException` in production, often surfacing only when a rarely-hit code path finally executes.

---

### 3.2 List Implementations (ArrayList vs LinkedList)

**Best practices:** Default to `ArrayList` unless profiling shows a genuine need for `LinkedList`'s specific strengths (frequent insert/remove at known ends) — in most JVMs, ArrayList's cache locality wins out even for many workloads that "look like" they should favor LinkedList theoretically.

**Performance considerations:** Pre-size an `ArrayList` with the expected capacity (`new ArrayList<>(expectedSize)`) when the approximate size is known ahead of time — avoids repeated internal resize-and-copy operations during bulk population, a meaningful optimization in hot paths processing large datasets.

**Memory considerations:** `LinkedList`'s per-node overhead (object header + two references per node) makes it substantially more memory-hungry than `ArrayList` for large collections — a real concern at scale (millions of elements) in memory-constrained services.

**Common production bugs:** The `list.remove(int)` vs `list.remove(Object)` overload trap on `List<Integer>` — this has caused real production incidents where code intended to remove a *value* accidentally removed an *index* instead (or vice versa), especially after a refactor changed a variable's type from `int` to `Integer` or similar.

**Anti-pattern:** Repeatedly calling `list.remove(0)` in a loop to drain an `ArrayList` from the front — this is O(n²) overall due to repeated shifting; use a `Deque`/`ArrayDeque`, or iterate and collect into a new list instead.

**Testing advice:** Include tests with large collection sizes (not just 2-3 elements) when performance matters — many List-related bugs (like O(n²) anti-patterns) only become visible or measurably slow at realistic production scale.

---

### 3.3 Set Implementations (HashSet, LinkedHashSet, TreeSet)

**Best practices:** Use `LinkedHashSet` when you need both uniqueness AND predictable iteration order (e.g., preserving the order users added tags) — a very common real-world requirement that plain `HashSet` doesn't satisfy.

**Common production bugs:** Storing mutable objects in a `HashSet` and later mutating a field involved in `hashCode()` — the object becomes silently "lost" (unfindable via `contains()`, iterable but not searchable), a subtle production bug that's hard to reproduce and diagnose because the object still technically exists in the collection.

**Real-world use case:** `TreeSet` is commonly used for maintaining a sorted, deduplicated leaderboard or priority list that needs both uniqueness and order (e.g., unique sorted timestamps of events).

**Anti-pattern:** Relying on `HashSet` iteration order in production code (e.g., serializing it to JSON, or displaying it in a UI) — this order is an implementation detail that can silently change across JDK versions or even between JVM runs, causing inconsistent output that's hard to debug.

**Testing advice:** For any class stored in a `HashSet`/used as a `HashMap` key, add explicit unit tests (or use `EqualsVerifier`) verifying the equals/hashCode contract holds — this is one of the highest-value, lowest-effort tests you can add to a shared domain model class.

---

### 3.4 Map Implementations (HashMap, LinkedHashMap, TreeMap, Hashtable)

**Best practices:**
- Use `computeIfAbsent()`, `merge()`, and `getOrDefault()` instead of manual `containsKey()` + `get()` + `put()` sequences — more concise, less error-prone, and in concurrent contexts (`ConcurrentHashMap`), these are also atomic, avoiding race conditions that manual check-then-act patterns introduce.
- Never use `Hashtable` in new code — use `HashMap` for single-threaded contexts or `ConcurrentHashMap` for concurrent ones (full detail in the Concurrency group).

> ✅ **Best Practice:**
```java
// Avoid: non-atomic check-then-act, and verbose
if (!map.containsKey(key)) {
    map.put(key, new ArrayList<>());
}
map.get(key).add(value);

// Prefer: concise and (on ConcurrentHashMap) atomic
map.computeIfAbsent(key, k -> new ArrayList<>()).add(value);
```

**Memory considerations:** Oversized initial `HashMap` capacity wastes memory; undersized capacity causes repeated resize/rehash operations under load — when the approximate size is known, size the map upfront to minimize rehashing in hot, high-throughput paths.

**Common production bugs:** Using a mutable object as a map key and mutating it after insertion, silently "losing" the entry from lookups — this is one of the most common, hardest-to-diagnose real-world Java bugs, since the entry still exists (visible in `entrySet()`) but `get()`/`containsKey()` with the mutated key fail.

**Security implications:** Before Java 8's treeification fix, HashMap was a known denial-of-service vector (an attacker crafting many keys with colliding hash codes could degrade a HashMap to O(n) per operation) — largely mitigated since Java 8, but worth knowing if working with older runtimes or hash-sensitive external input.

**Real-world use case:** `LinkedHashMap` with `accessOrder=true` and an overridden `removeEldestEntry()` is the textbook, genuinely production-used way to build a simple LRU (Least Recently Used) cache without a third-party library.

---

### 3.5 Queue and Deque (ArrayDeque, PriorityQueue)

**Best practices:** Use `ArrayDeque` instead of the legacy `Stack` or `LinkedList` for stack/queue behavior in new code — the JDK documentation itself recommends this, and it avoids `Stack`'s unnecessary synchronization overhead.

**Real-world use case:** `BlockingQueue` implementations (`LinkedBlockingQueue`, `ArrayBlockingQueue` — covered fully in the Concurrency group) are the standard building block for producer-consumer pipelines in real production systems (e.g., feeding worker thread pools, buffering between processing stages).

**Performance considerations:** `PriorityQueue` operations are O(log n), not O(1) — using one where a simple `ArrayDeque`/`List` would do (e.g., no actual priority ordering needed) adds unnecessary overhead at scale.

**Common production bugs:** Assuming a `PriorityQueue`'s `toString()` or iterator output reflects sorted order (it doesn't) — this has caused real bugs in logging/debugging output that looked "wrong" but was actually the correct internal heap array representation.

**Anti-pattern:** Manually implementing a priority-based processing queue with a sorted `List` (re-sorting after every insert, O(n log n) each time) instead of using `PriorityQueue` (O(log n) insert) — a common, avoidable performance anti-pattern in data-processing pipelines.

---

### 3.6 Iterator and Iterable

**Best practices:** Prefer `Collection.removeIf(predicate)` over manual `Iterator` loops for conditional removal — it's more concise, less error-prone, and, for some collection implementations, more efficient internally than an explicit remove-during-iteration loop.

> ✅ **Best Practice:**
```java
// Avoid: manual iterator loop
Iterator<String> it = list.iterator();
while (it.hasNext()) {
    if (shouldRemove(it.next())) it.remove();
}

// Prefer: concise, equally safe
list.removeIf(this::shouldRemove);
```

**Debugging tips:** A `ConcurrentModificationException` in production logs almost always traces back to a collection being structurally modified (add/remove) somewhere during iteration — check for nested loops modifying the same collection, or a second thread touching it (in which case, the real fix is a concurrent-safe collection, not just fixing the iteration pattern).

**Common production bugs:** `ConcurrentModificationException` thrown deep in a call stack, seemingly at random — often traced to a shared collection field being modified by an unrelated method called during iteration (e.g., a listener/callback triggered mid-loop that happens to mutate the same list).

**Testing advice:** Load-test iteration-heavy code paths with realistic collection sizes and, if multi-threaded, with concurrent modification scenarios specifically — `ConcurrentModificationException` is famously intermittent and easy to miss in small-scale or single-threaded local testing.

---

### 3.7 Comparable vs Comparator

**Best practices:** Keep a class's `compareTo()` (natural ordering) consistent with `equals()` if instances will ever be stored in a `TreeSet`/`TreeMap` — inconsistency causes silent, hard-to-diagnose "duplicate" entries being rejected based on comparison, not equality.

**Common production bugs:** The classic `return a - b;` integer-overflow bug inside a hand-written `compareTo()`/`compare()` — for large or negative values, subtraction can overflow and silently invert the sign, producing an incorrectly-sorted (or inconsistently-sorted) production dataset. Always use `Integer.compare(a, b)` / `Long.compare(a, b)` instead.

**Maintainability:** Prefer `Comparator.comparing(...).thenComparing(...)` chains over hand-rolled multi-field comparison logic — significantly more readable and less error-prone in code review, especially as sort criteria evolve over a service's lifetime.

**Real-world use case:** Multi-field sorting (e.g., sort orders by `status`, then `priority`, then `createdAt`) is extremely common in production reporting/admin-panel code — `Comparator` chaining is the idiomatic, maintainable way to express this instead of nested conditionals.

**Testing advice:** Unit test comparators directly (not just the sorted output) with edge cases like equal elements, nulls (if applicable, via `Comparator.nullsFirst`/`nullsLast`), and reversed order — comparator bugs are subtle and easy to miss with only "happy path" input.

---

### 3.8 The Collections Utility Class

**Best practices:** Use `List.of()`, `Set.of()`, `Map.of()` (Java 9+ immutable factory methods) for genuinely constant data instead of `Collections.unmodifiableList(new ArrayList<>(...))` — more concise and produces a true immutable collection, not just a view over a mutable one.

**Security implications:** Relying on `Collections.unmodifiableList()` to protect sensitive shared data from mutation is a common false sense of security — since it's a live view, code holding a reference to the *original* mutable list can still change the "protected" data. Use `List.copyOf()` or genuinely immutable/defensive-copy patterns when real protection is needed (e.g., passing config data across module/team boundaries).

**Common production bugs:** Calling `Collections.synchronizedList()` and assuming iteration is now automatically thread-safe — a production service iterating such a list from one thread while another thread adds to it will still throw `ConcurrentModificationException` unless the iteration itself is wrapped in `synchronized (list) { ... }`.

**Performance considerations:** `Collections.binarySearch()` on data that isn't actually sorted returns undefined (silently wrong) results with no exception — a subtle production correctness bug if a "sorted" assumption about upstream data quietly breaks after a code change elsewhere.

**Modern recommendations:** Favor Java 9+ `List.of()`/`Map.of()`/`Set.of()` factory methods for small, fixed, immutable collections in new code — they're more concise than the older `Collections.unmodifiableX(new ArrayList<>(...))` pattern and produce genuinely immutable results (throwing `UnsupportedOperationException` on any mutation attempt, and rejecting `null` elements outright at construction time).

---

[[#📖 Master Table of Contents|⬆ Back to top]]

*End of Group 3. Next: Generics.*

---

## 4. Generics

### Table of Contents (this group)
- [[#4.1 What Are Generics?]]
- [[#4.2 Generic Classes]]
- [[#4.3 Generic Methods]]
- [[#4.4 Type Parameters and Naming Conventions]]
- [[#4.5 Bounded Type Parameters]]
- [[#4.6 Wildcards]]
- [[#4.7 Type Erasure]]
- [[#4.8 Generics and Inheritance (Invariance)]]
- [[#4.9 Restrictions and Limitations]]

---

### 4.1 What Are Generics?

**Best practices:** Never introduce raw types in new code. Configure your build to treat `rawtypes` and `unchecked` as errors (`-Xlint:rawtypes,unchecked` with `-Werror`) in greenfield modules — raw types silently disable checking for an entire reference, and they tend to spread through a codebase once tolerated.

**Real-world use case:** Spring's `ResponseEntity<T>`, `Optional<T>`, and repository interfaces (`JpaRepository<User, Long>`) are generic precisely so the framework can hand back typed results without callers casting. A codebase that uses raw `ResponseEntity` loses all of that.

**Common production bugs:** A raw type introduced during a hurried merge, silently allowing a wrong-typed element into a collection; the resulting `ClassCastException` surfaces far from the insertion point, often in unrelated code, making root-cause analysis slow.

> ⚠️ **Warning:** `@SuppressWarnings("unchecked")` applied at class or method level suppresses far more than intended. Always apply it at the narrowest possible scope — ideally a single local variable declaration — and add a comment justifying why the cast is provably safe.

**Testing advice:** Generic type errors are compile-time by nature, so the "test" is your build configuration. Enabling lint-as-error is higher-value here than any runtime test.

---

### 4.2 Generic Classes

**Best practices:** Prefer composition of existing generic types over authoring your own generic class. Most needs are met by `Optional<T>`, `Map<K,V>`, or a `record` — a custom generic class earns its complexity only when it encodes a genuine reusable abstraction.

**Real-world use case:** A typed API envelope is the classic legitimate case:
```java
public record ApiResponse<T>(T data, List<String> errors, Instant timestamp) {
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(data, List.of(), Instant.now());
    }
}
```
Records work with generics and give you `equals`/`hashCode`/`toString` for free.

**Maintainability:** Generic classes with more than two or three type parameters become very hard to read at call sites (`Processor<In, Out, Ctx, Err>`). When you reach that point, a dedicated context object or builder usually communicates intent better.

**Common production bugs:** Attempting a static cache keyed on the class's type parameter, then working around the compiler error with a raw `static Map` — this reintroduces exactly the unsafety generics were meant to prevent, and is a recurring pattern in homegrown caching layers.

**Framework relevance:** Spring Data derives query implementations from the type arguments on `JpaRepository<T, ID>` at runtime, using declaration-site generic metadata (see 4.7) — a concrete example of erasure's exception being load-bearing in real frameworks.

---

### 4.3 Generic Methods

**Best practices:** Prefer a generic method over a generic class when only one operation needs the type parameter. It keeps the type scoped tightly and avoids forcing every user of the class to supply a type argument they don't care about.

**Readability:** Static generic utility methods should read naturally at the call site without a type witness. If callers routinely need `Utils.<Foo>convert(...)`, the signature is probably inferring poorly and should be redesigned.

**Common production bugs:** Two overloads whose parameters erase identically (`process(List<String>)` and `process(List<Integer>)`) fail at compile time with a name-clash error — usually discovered mid-refactor when someone generifies an existing method. Rename one method rather than fighting the erasure.

**Real-world use case:** Mapper and converter layers in service code:
```java
public static <S, T> List<T> mapAll(List<S> source, Function<S, T> mapper) {
    return source.stream().map(mapper).toList();
}
```
This kind of helper eliminates dozens of near-identical loops across a codebase without giving up type safety.

**Testing advice:** Generic utility methods are ideal unit-test targets — exercise them with at least two unrelated type arguments to confirm the signature is genuinely general rather than accidentally coupled to one type.

---

### 4.4 Type Parameters and Naming Conventions

**Best practices:** Follow JDK conventions (`T`, `E`, `K`, `V`, `R`) for general-purpose abstractions, and switch to descriptive names when the domain meaning is non-obvious — Spring Data's `<T, ID>` is a good model. Consistency within a codebase matters more than any individual choice.

**Readability:** In a class with three or more type parameters, single letters stop helping. `Cache<K, V>` is clear; `Pipeline<T, U, S, R>` is not — that signature is a signal to introduce a context type instead.

**Maintainability:** Never shadow an enclosing class's type parameter in a nested class or method. The compiler permits it, but the resulting errors ("incompatible types: T cannot be converted to T") are among the most confusing messages Java produces and waste real debugging time.

**Common production bugs:** A nested class silently reusing `T` while meaning something different — the code compiles, but subsequent refactors produce type errors that appear nonsensical until someone notices the shadowing.

---

### 4.5 Bounded Type Parameters

**Best practices:** Bound to the weakest type that still gives you the API you need. Bounding to `Number` when you only call `toString()` needlessly excludes valid callers; bounding to a concrete class when an interface suffices is the same mistake in a different direction.

**Real-world use case:** Bounded parameters are how framework code stays both generic and useful — e.g. a validation helper constrained to `<T extends Comparable<T>>` so it can enforce range checks across `Integer`, `BigDecimal`, `LocalDate`, and custom domain types alike, with no per-type duplication.

**Performance considerations:** Erasure replaces T with its *leftmost* bound, so ordering multiple bounds matters slightly for generated casts. In practice the JIT makes this irrelevant — never contort a signature for it.

**Common production bugs:** Using a raw `Comparable` bound (`<T extends Comparable>`) in older code, which compiles with warnings but permits comparing incompatible types, producing `ClassCastException` inside a sort. This surfaces as a corrupted or exception-throwing sort on production data, often only once a mixed-type collection appears.

> ✅ **Best Practice:** Always write `<T extends Comparable<? super T>>` rather than `<T extends Comparable<T>>` for library-grade sorting APIs — the `? super T` form also accepts types that inherit their `compareTo` from a supertype, which the stricter form rejects. This is exactly the signature the JDK uses for `Collections.sort`.

---

### 4.6 Wildcards

**Best practices:** Apply PECS to every public API parameter. `void addAll(Collection<? extends E> items)` accepts far more callers than `Collection<E>`, at zero cost to safety — this is why the JDK's own collection signatures are written that way.

**Readability:** Keep wildcards on parameters, out of return types. A method returning `List<? extends Foo>` forces every caller to propagate the wildcard, and the awkwardness compounds through call chains.

> ⚠️ **Warning:** A public method signature is a long-term commitment. Adding a wildcard later is source-compatible for callers, but *removing* one breaks them. Get PECS right at design time rather than tightening signatures after release.

**Real-world use case:** Event-handling and callback registries lean heavily on `? super`:
```java
public void subscribe(Consumer<? super OrderEvent> handler) { ... }
```
This accepts a `Consumer<Object>` logger as readily as a `Consumer<OrderEvent>` — flexibility a plain `Consumer<OrderEvent>` parameter would reject for no good reason.

**Common production bugs:** A parameter declared `List<Number>` in a shared internal library, forcing every caller to convert their `List<Integer>` — the workaround is usually a wasteful copy loop, or worse, a raw-type cast that silently disables checking. The fix is a one-character change to `List<? extends Number>`.

**Debugging tips:** "Capture of ?" in a compiler error means the compiler assigned an internal name to a wildcard and couldn't prove two occurrences refer to the same type. The standard fix is a private generic helper method that names the type explicitly, converting the wildcard into a real type parameter.

---

### 4.7 Type Erasure

**Best practices:** Treat erasure as a design constraint from the start rather than something to fight. When runtime type information is genuinely needed, pass a `Class<T>` token explicitly — this is the pattern the JDK and every major framework settled on.

**Real-world use case:** The anonymous-subclass trick that exploits declaration-site retention:
```java
// Jackson - deserializing into a generic type
List<User> users = mapper.readValue(json, new TypeReference<List<User>>() {});

// Spring - typed REST response
ResponseEntity<List<User>> resp = restTemplate.exchange(
    url, HttpMethod.GET, null, new ParameterizedTypeReference<List<User>>() {});
```
Both work because the type argument is baked into an anonymous subclass's *declaration*, which survives erasure and is readable via `getGenericSuperclass()`.

**Common production bugs:** Deserializing JSON into a generic type without a type reference — Jackson silently produces `List<LinkedHashMap>` instead of `List<User>`, and the `ClassCastException` fires later at first field access, far from the deserialization call. This is one of the most common real-world erasure bugs in Spring services.

> ⚠️ **Warning:** Heap pollution from unchecked casts produces `ClassCastException` at a location unrelated to the actual bug. When you see a cast exception on a line containing no visible cast, suspect a compiler-inserted cast from an earlier unchecked operation and trace where the collection was populated.

**Debugging tips:** Bridge methods appear in stack traces as duplicate-looking frames with different signatures for the same method. They're compiler-generated and expected — not a sign of a bug.

**Security implications:** Never rely on generic type parameters to validate untrusted input. Erasure means `List<String>` provides zero runtime guarantee that elements are strings; validate deserialized data explicitly.

---

### 4.8 Generics and Inheritance (Invariance)

**Best practices:** Design APIs assuming invariance and reach for wildcards deliberately. A parameter typed `List<Order>` will reject `List<PriorityOrder>` — decide at design time whether that rigidity is intentional.

**Real-world use case:** Layered service code hits this constantly. A reporting method accepting `List<? extends Transaction>` can process lists of any transaction subtype from any module; the same method typed `List<Transaction>` forces every caller into a defensive copy.

**Anti-pattern:** Working around invariance by casting through a raw type:
```java
// Anti-pattern - silently defeats type safety
List<Number> nums = (List<Number>) (List<?>) integerList;
```
This compiles with a warning and permits inserting a `Double` into what is really a `List<Integer>` — a textbook heap-pollution setup that will fail somewhere else entirely.

**Common production bugs:** Mixing arrays and generics — array covariance defers errors to runtime, so `Object[] arr = orders; arr[0] = somethingElse;` throws `ArrayStoreException` in production where the equivalent generic code would have failed to compile. Prefer collections over arrays in application code for exactly this reason.

**Modern recommendations:** Use `List.copyOf()` and other immutable factories when passing collections across module boundaries — immutability sidesteps most variance concerns entirely, since nobody can insert an incompatible element regardless of the declared type.

---

### 4.9 Restrictions and Limitations

**Best practices:** When a generic class needs to instantiate T, accept a `Supplier<T>` rather than a `Class<T>` where possible — it avoids reflection, works with types lacking no-arg constructors, and produces clearer failures.

```java
// Prefer this
class Pool<T> {
    private final Supplier<T> factory;
    Pool(Supplier<T> factory) { this.factory = factory; }
    T acquire() { return factory.get(); }
}
Pool<Connection> pool = new Pool<>(Connection::new);
```

**Memory considerations:** `List<Integer>` boxes every element, costing roughly four times the memory of an `int[]` once object headers are counted. In high-volume numeric processing — risk calculations, market data, large aggregations — this is a genuine heap and GC-pause factor. Primitive-specialized libraries (fastutil, Eclipse Collections) or raw arrays are the standard mitigation until Project Valhalla lands value types.

> ⚠️ **Warning:** Generic varargs (`void process(List<String>... items)`) create a generic array internally and are a documented heap-pollution risk. Annotate with `@SafeVarargs` only after confirming the method never stores into the array nor exposes it to callers — the annotation silences the warning without making the code safe.

**Common production bugs:** A generic class exposing `(T[]) new Object[n]` through a public method — the cast succeeds internally but throws `ClassCastException` at the caller's assignment. This is precisely why `ArrayList` stores `Object[]` internally and casts only on element access.

**Real-world use case:** `Class<T>` tokens underpin most dependency-injection and serialization frameworks. `applicationContext.getBean(UserService.class)` returns a typed instance because the token carries the runtime type erasure removed from the signature.

**Modern recommendations:** For simple typed data carriers, prefer `record` types over hand-rolled generic containers where the type is fixed — you get correct `equals`/`hashCode`/`toString` and immutability without the generic machinery. Reserve generics for genuinely reusable abstractions.

---

[[#📖 Master Table of Contents|⬆ Back to top]]

*End of Group 4. Next: Exception Handling.*

---

## 5. Exception Handling

### Table of Contents (this group)
- [[#5.1 What Is an Exception?]]
- [[#5.2 The Throwable Hierarchy]]
- [[#5.3 Checked vs Unchecked Exceptions]]
- [[#5.4 try-catch-finally]]
- [[#5.5 throw and throws]]
- [[#5.6 try-with-resources]]
- [[#5.7 Custom Exceptions]]
- [[#5.8 Exception Chaining]]
- [[#5.9 Stack Traces]]
- [[#5.10 Errors vs Exceptions]]

---

### 5.1 What Is an Exception?

**Best practices:** Never use exceptions for expected outcomes on a hot path. Validation, parsing, and lookup misses should return `Optional`, a result object, or a boolean — reserve exceptions for genuinely exceptional conditions.

**Performance considerations:** Stack capture dominates exception cost. In a high-throughput service, a routine failure path throwing thousands of exceptions per second can consume measurable CPU purely in `fillInStackTrace()`. For genuinely high-frequency control-flow exceptions inside a framework, the four-arg `Throwable(message, cause, suppression, writableStackTrace)` constructor with `writableStackTrace=false` removes that cost — at the price of losing diagnosability, so use it deliberately and rarely.

**Real-world use case:** Spring's `@ControllerAdvice` centralizes exception-to-HTTP-response translation, so controllers stay free of repetitive try/catch and every error path produces a consistent response shape:
```java
@RestControllerAdvice
class GlobalExceptionHandler {
    @ExceptionHandler(OrderNotFoundException.class)
    ResponseEntity<ApiError> handle(OrderNotFoundException e) {
        return ResponseEntity.status(NOT_FOUND).body(new ApiError("ORDER_NOT_FOUND", e.getMessage()));
    }
}
```

**Common production bugs:** An exception-based validation loop that performs acceptably in testing with dozens of records, then becomes a CPU bottleneck at production volumes of hundreds of thousands.

---

### 5.2 The Throwable Hierarchy

**Best practices:** Catch the narrowest type that you can actually handle. `catch (Exception e)` in business logic swallows `NullPointerException` and other bug indicators, converting crashes into silent misbehavior that's far harder to diagnose.

**Maintainability:** Configure static analysis (SonarQube, SpotBugs, error-prone) to flag broad catches and empty catch blocks. These rules catch a genuinely large share of real defects, and they're cheap to enable.

> ⚠️ **Warning:** An empty catch block is the single most damaging exception anti-pattern in production code. It converts a loud, traceable failure into silent data corruption that surfaces days later with no diagnostic trail. If you truly intend to ignore an exception, log at debug level and add a comment explaining why.

**Common production bugs:** A broad `catch (Exception e)` around a batch loop that was meant to skip malformed records, but also silently swallows connection failures — so a partial outage looks like a successful run with fewer records than expected.

**Debugging tips:** When a service "does nothing" with no errors logged, search the codebase for empty or log-free catch blocks along the relevant path before investigating anything else.

---

### 5.3 Checked vs Unchecked Exceptions

**Best practices:** In application and service code, prefer unchecked exceptions for conditions the caller cannot meaningfully recover from — which in practice is most of them. Reserve checked exceptions for genuine decision points where a caller has a real alternative action.

**Framework relevance:** Spring's design is the clearest production precedent. It wraps `SQLException` into the unchecked `DataAccessException` hierarchy specifically so persistence-layer failures don't force try/catch through every service method, and so swapping JDBC for JPA doesn't change every signature.

**Real-world use case:** Checked exceptions and streams don't compose, which shapes real code:
```java
// UncheckedIOException exists in the JDK precisely for this bridge
paths.stream()
     .map(p -> {
         try { return Files.readString(p); }
         catch (IOException e) { throw new UncheckedIOException(e); }
     })
     .toList();
```
A small `wrap()` helper or a library like Vavr removes this boilerplate when it appears repeatedly.

**Anti-pattern:** `throws Exception` on service method signatures. It satisfies the compiler while destroying every piece of information the mechanism exists to convey, and it forces callers into equally broad handling.

**Common production bugs:** A checked exception caught and swallowed at an intermediate layer purely to satisfy the compiler, hiding a failure that should have propagated to the caller and triggered a retry or alert.

---

### 5.4 try-catch-finally

**Best practices:** Keep try blocks tight — wrap only the statements that can actually throw. A try block spanning fifty lines makes it impossible to tell which statement the catch is for, and tends to catch failures from unrelated code.

> ⚠️ **Warning:** Never place `return`, `break`, `continue`, or `throw` inside a `finally` block. Doing so silently discards any exception propagating from the `try`, producing failures with no trace whatsoever. Several static analysis tools flag this by default — keep those rules enabled.

**Real-world use case:** Lock release is the canonical `finally` case, and it must be structured exactly this way:
```java
lock.lock();
try {
    criticalSection();
} finally {
    lock.unlock();   // must be in finally, and lock() must be OUTSIDE the try
}
```
Acquiring the lock inside the try is a real bug — if `lock()` throws, `finally` still calls `unlock()` on a lock never held.

**Common production bugs:** Exception-swallowing `finally` blocks that mask the root cause of an outage, leaving only the symptom visible in logs.

**Testing advice:** Write explicit tests for failure paths, not just happy paths — assert that the expected exception propagates and that cleanup occurred. Failure paths are the least-tested and most incident-prone code in most services.

---

### 5.5 throw and throws

**Best practices:** Declare the narrowest exception types that accurately describe the contract. A precise `throws` clause is documentation the compiler enforces; a broad one is noise that forces defensive handling everywhere.

**Maintainability:** When an interface's implementations need different failure modes, define the exception contract at the interface level rather than letting each implementation widen it — otherwise callers must handle the union of everything, defeating the abstraction.

**Real-world use case:** Precise rethrow (Java 7+) keeps signatures honest when consolidating handling:
```java
public void process() throws IOException, SQLException {
    try {
        doWork();                 // throws IOException, SQLException
    } catch (Exception e) {
        log.error("processing failed", e);
        throw e;                  // compiler infers IOException | SQLException, not Exception
    }
}
```

**Common production bugs:** A method declaring a checked exception it no longer throws after a refactor, leaving dead catch blocks across the codebase that give a false impression of which failures are possible.

**Anti-pattern:** Throwing `RuntimeException` directly rather than a meaningful subtype. It carries no domain information, cannot be caught selectively, and forces callers into string matching on messages.

---

### 5.6 try-with-resources

**Best practices:** Use try-with-resources for every `AutoCloseable` without exception — JDBC connections, file streams, HTTP clients, Kafka consumers. Manual close in `finally` should not appear in new code at all.

**Common production bugs:** Connection-pool exhaustion from a JDBC `Connection`, `Statement`, or `ResultSet` that isn't closed on an error path. This is one of the most frequent causes of production database outages: the service runs fine under normal load, then hangs entirely once a recurring error path drains the pool. Symptoms appear as timeouts in unrelated requests, which sends investigation in the wrong direction.

> ✅ **Best Practice:** Configure your connection pool (HikariCP) with `leakDetectionThreshold` in non-production environments. It logs a stack trace for any connection held beyond the threshold, identifying the exact leak site before it reaches production.

**Debugging tips:** When diagnosing a masked failure, check `getSuppressed()` — a close-time exception often explains an outage that the primary exception only hints at. Most logging frameworks print suppressed exceptions automatically, but custom error handlers frequently forget to.

**Real-world use case:** Spring's `JdbcTemplate` and `RestClient` exist largely to remove manual resource handling entirely — preferring them over raw JDBC eliminates this entire bug class rather than managing it.

**Deprecated approaches to avoid:** Nested try-finally chains for multiple resources. They're verbose, mask original exceptions, and are strictly worse than try-with-resources in every respect.

---

### 5.7 Custom Exceptions

**Best practices:** Carry structured fields (error code, entity ID, field name) rather than encoding detail into the message string. Callers and log processors can then act on the data without parsing prose, which also survives message wording changes.

**Security implications:** Exception messages routinely leak into HTTP responses and logs. Never include credentials, tokens, PII, full SQL statements, or internal file paths in a message that may reach a client. Map internal exceptions to sanitized external error responses at the API boundary.

> ⚠️ **Warning:** Returning `e.getMessage()` directly in an HTTP error response is a common information-disclosure vulnerability. A `SQLException` message can reveal table names, column names, and query structure — valuable reconnaissance for an attacker. Return a generic message plus a correlation ID, and keep the detail server-side.

**Real-world use case:** Pair each exception with a stable error code that clients can branch on:
```java
public class PaymentFailedException extends RuntimeException {
    private final ErrorCode code;      // stable, documented, client-facing
    private final String correlationId;
    // ...
}
```
The message can change freely; the code is the contract.

**Common production bugs:** A custom exception missing its cause-accepting constructor, so every wrap discards the root cause — producing logs that say "payment failed" with no indication of why.

**Testing advice:** Assert on exception *type and structured fields*, never on message text. Message-based assertions break on harmless wording changes and give false confidence.

---

### 5.8 Exception Chaining

**Best practices:** Wrap at architectural boundaries only — persistence to service, service to API. Wrapping at every layer produces five-deep chains where the useful information is buried and each wrap adds a stack capture.

**Debugging tips:** In production incidents, the root cause is the innermost "Caused by" section. Configure log appenders to print the full chain; some custom formatters truncate it, which silently removes the most valuable diagnostic detail exactly when it's needed.

**Common production bugs:** `throw new ServiceException("failed: " + e.getMessage())` — the single most common chaining mistake. The root cause's stack trace is destroyed, leaving an incident with a symptom and no origin. Code review should treat this as a defect, not a style preference.

**Real-world use case:** Translating persistence failures at the repository boundary keeps the service layer independent of the data-access technology:
```java
catch (SQLException e) {
    throw new RepositoryException("Failed loading order " + orderId, e);
}
```
Swapping JDBC for JPA later changes only this layer.

**Logging:** Log the exception *once*, at the boundary where it's finally handled. Logging at every layer as it propagates produces the same failure repeated five times in the log, inflating volume and making it appear that five separate problems occurred.

---

### 5.9 Stack Traces

**Best practices:** Always pass the exception object to the logger (`log.error("context", e)`), never interpolate its message into a string. Passing the object gives the logging framework the full trace and chain; interpolating gives it a single line.

> ⚠️ **Warning:** `log.error("Failed: " + e.getMessage())` loses the entire stack trace. This is the logging equivalent of the chaining anti-pattern, and it appears constantly in real codebases. The correct form is `log.error("Failed processing order {}", orderId, e)` — the exception goes last, as a separate argument.

**Common production bugs:** Missing stack traces due to the JIT's `OmitStackTraceInFastThrow` optimization. After the same exception is thrown repeatedly at the same site, the JVM begins throwing a pre-allocated instance with an empty trace — so logs suddenly show the exception type with no location. Add `-XX:-OmitStackTraceInFastThrow` when investigating.

**Logging:** Use MDC (Mapped Diagnostic Context) to attach correlation IDs, so a stack trace can be tied to a specific request across distributed services. Without correlation, traces from concurrent requests interleave and become nearly unusable in a high-traffic service.

**Debugging tips:** In Spring applications, skip past proxy and reflection frames (`$Proxy`, `CGLIB`, `java.lang.reflect`) to the first frame in your own package — that's where investigation starts. Configure the logging framework to shorten or filter framework packages so the signal isn't buried.

**Security implications:** Never return stack traces to clients. They expose internal package structure, library versions, and file paths. Ensure `server.error.include-stacktrace=never` in Spring Boot production profiles — the default varies by version, so set it explicitly.

---

### 5.10 Errors vs Exceptions

**Best practices:** Let `Error`s propagate and terminate the process. A container orchestrator restarting a pod is a healthier response to `OutOfMemoryError` than an application limping along with a corrupted heap producing wrong results.

**Real-world use case:** Configure the JVM to fail fast and preserve evidence on OOM:
```
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/var/log/heapdumps
-XX:+ExitOnOutOfMemoryError
```
The heap dump enables post-mortem analysis; the exit lets the orchestrator restart cleanly rather than leaving a degraded instance serving traffic.

**Common production bugs:** A `catch (Throwable t)` in a worker loop that swallows `OutOfMemoryError` and continues. The service stays "up" from the health check's perspective while producing incorrect results — far worse than a clean crash, and much harder to detect.

**Scalability concerns:** In thread pools, an uncaught throwable silently kills the worker thread. `ThreadPoolExecutor` replaces it, but if the cause is systemic the pool churns threads continuously, degrading throughput with no obvious error. Always install an uncaught exception handler or override `afterExecute()` to log these.

> ✅ **Best Practice:** Set a global handler so no thread dies silently:
```java
Thread.setDefaultUncaughtExceptionHandler((thread, throwable) ->
    log.error("Uncaught in thread {}", thread.getName(), throwable));
```

**Debugging tips:** `NoClassDefFoundError` in production almost always means a dependency version mismatch between build and runtime classpaths — the class existed at compile time but not at runtime. Check `mvn dependency:tree` and the actual deployed artifact rather than assuming a code bug.

---

[[#📖 Master Table of Contents|⬆ Back to top]]

*End of Group 5. Next: Streams, Lambdas & Functional Programming.*

---

## 6. Streams, Lambdas & Functional Programming

### Table of Contents (this group)
- [[#6.1 What Is Functional Programming in Java?]]
- [[#6.2 Lambda Expressions]]
- [[#6.3 Functional Interfaces]]
- [[#6.4 Built-in Functional Interfaces]]
- [[#6.5 Method References]]
- [[#6.6 What Is a Stream?]]
- [[#6.7 Intermediate Operations]]
- [[#6.8 Terminal Operations]]
- [[#6.9 Collectors]]
- [[#6.10 Optional]]
- [[#6.11 Parallel Streams]]

---

### 6.1 What Is Functional Programming in Java?

**Best practices:** Use streams where they clarify intent — multi-stage transformations, grouping, aggregation. Keep plain loops where they're already clear, especially short loops with early exits or index arithmetic.

**Readability:** The practical ceiling is roughly four or five chained operations. Beyond that, extract named helper methods. A pipeline spanning twenty lines is harder to review than the loop it replaced, which defeats the purpose.

**Debugging tips:** Stream pipelines are genuinely harder to debug than loops — you can't set a breakpoint "between" stages meaningfully, and frames appear as `lambda$method$0`. IntelliJ's *Trace Current Stream Chain* debugger action visualizes element flow at each stage and is the single most useful tool here.

**Common production bugs:** Side effects inside stream operations — mutating an external collection or counter from inside `map` or `filter`. It works sequentially and breaks silently under `.parallel()`, which someone adds later as an "optimization."

> ✅ **Best Practice:** Treat stream operations as pure. If a lambda inside `map` or `filter` modifies anything outside itself, that's a signal to use a loop or restructure with a proper collector.

---

### 6.2 Lambda Expressions

**Best practices:** Keep lambda bodies to a single expression where possible. Once a lambda needs a block with multiple statements, extract it to a named method and use a method reference — the name documents the intent that the lambda body obscures.

**Performance considerations:** Stateless lambdas (capturing nothing) are instantiated once and reused by the JVM. Capturing lambdas allocate a new object per evaluation. In a hot loop, a capturing lambda created per iteration adds real allocation pressure — hoist it outside the loop when the captured values don't change.

**Common production bugs:** Capturing a mutable object and relying on its state at execution time rather than creation time. The lambda captures the *reference*, so if the object is mutated before the lambda runs (common with deferred execution — callbacks, `CompletableFuture`, scheduled tasks), it observes the mutated state, not the state at capture.

**Debugging tips:** Lambda frames appear as `lambda$methodName$0` in stack traces. The numeric suffix is positional within the enclosing method, so `lambda$process$2` is the third lambda in `process()` — useful for locating the exact one in a method containing several.

**Maintainability:** Deeply nested lambdas (a lambda inside a lambda inside a lambda) are among the least reviewable constructs in Java. Flatten by extracting named methods before the nesting reaches three levels.

---

### 6.3 Functional Interfaces

**Best practices:** Always annotate custom functional interfaces with `@FunctionalInterface`. It costs nothing and prevents a future maintainer from adding a second abstract method, which would break every lambda already written against it — a change that compiles at the interface but fails at every call site.

**Real-world use case:** Custom functional interfaces earn their place when they name a domain concept or need to declare checked exceptions:
```java
@FunctionalInterface
public interface ThrowingFunction<T, R> {
    R apply(T t) throws Exception;

    static <T, R> Function<T, R> unchecked(ThrowingFunction<T, R> f) {
        return t -> {
            try { return f.apply(t); }
            catch (Exception e) { throw new RuntimeException(e); }
        };
    }
}
```
This is the standard bridge for the checked-exception friction covered in Group 5.

**Maintainability:** Before defining a custom interface, check `java.util.function` — most shapes already exist. A codebase with its own `StringMapper`, `ItemFilter`, and `ValueProvider` is carrying three interfaces that `Function`, `Predicate`, and `Supplier` already cover, and none of them interoperate with library code.

**Anti-pattern:** Interfaces with one abstract method plus a dozen defaults, used as lambda targets. Technically functional, but the lambda supplies only a fragment of behavior while the defaults hide the rest — confusing at the call site.

---

### 6.4 Built-in Functional Interfaces

**Best practices:** Use primitive specializations (`IntPredicate`, `ToIntFunction`, `IntUnaryOperator`) in numeric-heavy code. The boxed equivalents allocate an `Integer` per call, and in a pipeline over millions of elements that dominates the runtime.

**Memory considerations:** `Stream<Integer>` boxes every element; `IntStream` doesn't. For large numeric datasets the difference is roughly 16 bytes of object header per element plus GC pressure, versus a raw 4-byte int. Prefer `mapToInt`/`mapToLong` before aggregating:
```java
// Boxes every element
int total = orders.stream().map(Order::getAmount).reduce(0, Integer::sum);

// No boxing
int total = orders.stream().mapToInt(Order::getAmount).sum();
```

**Common production bugs:** `andThen` and `compose` inverted in a validation or transformation chain. Both compile and both run; the output is simply wrong in a way unit tests catch only if they exercise a case where order matters.

**Readability:** Long composition chains (`f.andThen(g).andThen(h).compose(i)`) are hard to trace. Assign intermediate steps to well-named variables rather than building one expression.

---

### 6.5 Method References

**Best practices:** Prefer method references when the referenced method's name fully conveys intent at the call site. When it doesn't — a generic name like `process` or `handle` — an explicit lambda with a descriptive parameter name reads better.

**Debugging tips:** Method references produce cleaner stack traces than lambdas, since the frame shows the actual method name rather than a synthetic `lambda$` name. This is a small but real advantage when diagnosing production failures inside pipelines.

**Common production bugs:** A bound method reference capturing a receiver that's later reassigned. `logger::info` captures the logger instance at reference creation; if the field is reassigned afterward, the reference still points at the original object.

**Real-world use case:** Constructor references in collectors and factories:
```java
.collect(Collectors.toCollection(LinkedHashMap::new))    // preserve insertion order
.toArray(String[]::new)                                   // typed array
```
The `toArray(String[]::new)` form is preferred over `toArray(new String[0])` in modern code — it's clearer and avoids the allocation-size discussion entirely.

---

### 6.6 What Is a Stream?

**Best practices:** Never store a `Stream` in a field or return it from a method unless the caller clearly owns consumption. Store the source collection and let callers create streams as needed, or return a `Supplier<Stream<T>>` when a reusable pipeline is genuinely required.

> ⚠️ **Warning:** `Files.lines()`, `Files.walk()`, and `Files.list()` return streams backed by open file handles. They must be closed in try-with-resources. Failing to do so leaks descriptors, and the failure mode is delayed and confusing — the process runs fine until it exhausts the OS file-descriptor limit, at which point unrelated operations start failing with "too many open files."

```java
try (Stream<String> lines = Files.lines(path)) {
    return lines.filter(l -> !l.isBlank()).toList();
}   // handle released here
```

**Common production bugs:** `IllegalStateException: stream has already been operated upon or closed`, from a stream stored in a field or passed to two consumers. Typically appears after a refactor that extracted a method taking a `Stream` parameter.

**Memory considerations:** Streams over huge sources are memory-efficient *only* if no stateful operation buffers them. A `sorted()` on a ten-million-element stream materializes the entire dataset in memory — the same cost as loading it into a list, with none of the streaming benefit.

**Real-world use case:** Streaming large files line-by-line is the canonical good fit — constant memory regardless of file size, provided the pipeline stays stateless.

---

### 6.7 Intermediate Operations

**Best practices:** Order operations to minimize work — `filter` before `map`, and `limit` as early as correctness allows. Mapping a million elements and then filtering to ten does the expensive transformation a million times.

> ⚠️ **Warning:** Do not use `peek()` for production logging or side effects. The JDK specification explicitly permits implementations to skip it when the result isn't required, and Java 9+ actively does so — `stream.peek(log::info).count()` may log nothing at all, because `count()` can determine the size without traversing. Logging that silently disappears under optimization is worse than no logging.

**Common production bugs:** `distinct()` on objects lacking proper `equals`/`hashCode` overrides, which silently deduplicates nothing (or deduplicates by identity). This connects directly to the equals/hashCode contract from Group 2 — the same defect surfaces here as a pipeline that appears to work but never removes duplicates.

**Performance considerations:** `sorted()` in a parallel pipeline generally negates the parallelism benefit, since it must buffer and merge all elements. If sorting is required, consider sorting once outside the stream, or sorting the final result.

**Debugging tips:** To inspect a pipeline safely, break it into stages assigned to intermediate variables and log the materialized results — or use IntelliJ's stream debugger. Never reach for `peek`.

---

### 6.8 Terminal Operations

**Best practices:** Prefer `Stream.toList()` (Java 16+) for new code when the result is read-only, and `collect(Collectors.toList())` only when the caller genuinely needs a mutable list. Being explicit about mutability at the collection point prevents downstream surprises.

**Common production bugs:** Migrating from `collect(Collectors.toList())` to `toList()` in a codebase where some caller mutates the result, producing `UnsupportedOperationException` at a location far from the change. This is a frequent regression during Java version upgrades — grep for mutation of stream results before doing a bulk replacement.

**Real-world use case:** Short-circuiting for existence checks avoids materializing collections:
```java
// Wasteful - builds the whole list to check emptiness
boolean exists = orders.stream().filter(pred).toList().size() > 0;

// Short-circuits on first match
boolean exists = orders.stream().anyMatch(pred);
```

**Anti-pattern:** `forEach` used to accumulate into an external collection. It's a side effect, it's unsafe in parallel, and `collect` expresses the same thing correctly. Reserve `forEach` for genuine terminal side effects like logging or publishing events.

**Testing advice:** Explicitly test empty-input cases for pipelines using `allMatch`/`noneMatch` — both return `true` on empty streams, which is correct but frequently surprises, and business logic branching on them can invert unexpectedly when a filter upstream removes everything.

---

### 6.9 Collectors

**Best practices:** Always supply a merge function to `Collectors.toMap` unless you can prove keys are unique — and "the data should be unique" is not proof. Deciding the merge behavior explicitly is safer than discovering the default at 3am.

> ⚠️ **Warning:** `Collectors.toMap(Order::getId, o -> o)` throws `IllegalStateException: Duplicate key` the first time production data contains a duplicate. This passes every test with clean fixture data and fails on real input. Supply the three-argument form and choose deliberately:
> ```java
> .collect(Collectors.toMap(Order::getId, o -> o, (existing, replacement) -> existing))
> ```

**Common production bugs:** A second, related `toMap` trap — the value mapper returning `null` throws `NullPointerException`, unlike `HashMap.put` which accepts null values. Code migrating a manual map-building loop to `toMap` hits this immediately when any value is absent.

**Real-world use case:** Multi-level grouping for reporting and aggregation replaces substantial nested-loop code:
```java
Map<Region, Map<Product, BigDecimal>> revenue = sales.stream()
    .collect(Collectors.groupingBy(Sale::getRegion,
             Collectors.groupingBy(Sale::getProduct,
             Collectors.reducing(BigDecimal.ZERO, Sale::getAmount, BigDecimal::add))));
```

**Readability:** Three or more nested collectors become effectively unreviewable. Extract the downstream collector into a named variable or method so each level can be understood independently.

**Performance considerations:** `Collectors.joining()` uses `StringBuilder` internally and is substantially faster than reducing with string concatenation, which allocates a new string per element.

---

### 6.10 Optional

**Best practices:** Use `Optional` for return types where absence is a legitimate outcome. Do not use it for fields, constructor parameters, method parameters, or collection elements — it adds allocation and ceremony without the design benefit it was created for.

> ⚠️ **Warning:** `Optional` does not implement `Serializable`. Using it as an entity or DTO field breaks Java serialization and causes problems with some persistence and caching frameworks. Use a nullable field internally and expose `Optional` from the getter instead.

**Common production bugs:** `orElse` with a side-effecting or expensive fallback. `user.orElse(createDefaultUser())` calls `createDefaultUser()` on *every* invocation, including when the user is present — so if that method writes to a database or increments a counter, it does so unconditionally. Use `orElseGet` for anything beyond a cheap constant.

**Real-world use case:** Spring Data repositories return `Optional<T>` from `findById`, which composes naturally:
```java
return userRepository.findById(id)
    .map(userMapper::toDto)
    .orElseThrow(() -> new UserNotFoundException(id));
```
This pattern — find, map, throw a domain exception — is the standard service-layer idiom and connects directly to the custom-exception guidance in Group 5.

**Anti-pattern:** Returning `Optional<List<T>>`. An empty list already expresses "nothing found"; wrapping it forces callers to unwrap twice for no additional information. Return an empty collection instead.

---

### 6.11 Parallel Streams

**Best practices:** Default to sequential. Reach for `.parallel()` only after measuring, with a large dataset, genuinely CPU-bound work, and a splittable source. The common guidance is that datasets below roughly 10,000 elements rarely benefit, but measurement beats any threshold rule.

> ⚠️ **Warning:** Every parallel stream in the JVM shares one common `ForkJoinPool`. A single parallel stream performing blocking I/O can starve that pool and degrade every other parallel stream in the application — including ones inside third-party libraries you don't control. This makes parallel streams a poor fit for request-handling code in a shared service.

**Real-world use case:** Isolating work onto a dedicated pool when parallelism is genuinely needed:
```java
ForkJoinPool pool = new ForkJoinPool(4);
try {
    List<Result> results = pool.submit(() ->
        data.parallelStream().map(this::expensiveCompute).toList()
    ).get();
} finally {
    pool.shutdown();
}
```
Note this relies on unspecified behavior — the pipeline runs on the submitting pool — so document it where used.

**Common production bugs:** Collecting into a non-thread-safe structure via `forEach` under parallelism, producing lost elements or corrupted state. It's nondeterministic, so it passes tests intermittently and fails under production load. Use `collect` with a proper collector, which handles thread-safe accumulation correctly.

**Scalability concerns:** In a server application, the container is already parallelizing across requests. Adding parallel streams inside request handling multiplies thread demand and typically reduces total throughput even when individual requests appear faster in isolation.

**Modern recommendations:** For I/O-bound concurrency, virtual threads (Java 21+, covered in the Modern Java Features group) are the appropriate tool — not parallel streams. Parallel streams remain narrowly for CPU-bound batch work over large in-memory datasets.

---

[[#📖 Master Table of Contents|⬆ Back to top]]

*End of Group 6. Next: Concurrency & Multithreading.*

---

## 7. Concurrency & Multithreading

### Table of Contents (this group)
- [[#7.1 Processes vs Threads]]
- [[#7.2 Creating Threads]]
- [[#7.3 Thread Lifecycle]]
- [[#7.4 Race Conditions and Shared State]]
- [[#7.5 synchronized]]
- [[#7.6 volatile]]
- [[#7.7 The Java Memory Model]]
- [[#7.8 wait, notify, and notifyAll]]
- [[#7.9 Locks and the java.util.concurrent Package]]
- [[#7.10 Atomic Variables]]
- [[#7.11 Executors and Thread Pools]]
- [[#7.12 Callable, Future, and CompletableFuture]]
- [[#7.13 Concurrent Collections]]
- [[#7.14 Deadlock, Livelock, and Starvation]]
- [[#7.15 Virtual Threads]]

---

### 7.1 Processes vs Threads

**Best practices:** Design for *no shared mutable state* wherever possible. Immutable objects, thread confinement, and message passing eliminate entire categories of bugs rather than managing them. Every piece of shared mutable state is ongoing maintenance cost.

**Common production bugs:** `ThreadLocal` leaks in pooled environments. A `ThreadLocal` set during request handling and never removed persists on the pooled thread and is visible to the *next* request served by that thread — a genuine cross-request data-leakage vector, not just a memory issue.

> ⚠️ **Warning:** In any container using thread pools (Tomcat, Netty, application servers), `ThreadLocal.remove()` must be called in a `finally` block. Failing to do so leaks memory *and* can expose one user's data to another request. This is a real security issue, particularly with security contexts and tenant identifiers.

**Real-world use case:** Spring's `RequestContextHolder` and `SecurityContextHolder` are `ThreadLocal`-based. Their filters explicitly clear them after each request precisely because of the above.

**Debugging tips:** `jcmd <pid> Thread.print` or `jstack` gives a full thread dump. Taking three dumps ten seconds apart and comparing is the standard technique for distinguishing a genuine hang from slow progress.

---

### 7.2 Creating Threads

**Best practices:** Never create raw `Thread` objects in application code. Use an `ExecutorService`, or virtual threads on Java 21+. Raw thread creation has no bound, no reuse, no result handling, and no lifecycle management.

**Common production bugs:** Unbounded thread creation under load — a thread per incoming request or per queue message. It works in testing and fails as `OutOfMemoryError: unable to create new native thread` once concurrency rises, which is a confusing message since the heap may be nearly empty (the failure is native stack memory, not heap).

**Best practices for naming:** Always name your threads via a `ThreadFactory`. Default names (`pool-1-thread-3`) tell you nothing in a thread dump during an incident.
```java
ThreadFactory factory = r -> {
    Thread t = new Thread(r, "order-processor-" + counter.incrementAndGet());
    t.setUncaughtExceptionHandler((th, ex) -> log.error("Uncaught in {}", th.getName(), ex));
    return t;
};
```
Libraries like Guava's `ThreadFactoryBuilder` or Spring's `CustomizableThreadFactory` do this cleanly.

**Debugging tips:** Meaningful thread names turn an unreadable thread dump into an immediately diagnosable one. This is one of the highest-value, lowest-effort practices in concurrent code.

---

### 7.3 Thread Lifecycle

**Debugging tips:** Thread dumps are the primary production diagnostic for concurrency issues. Read them by state distribution:

| Dump pattern | Likely cause |
|---|---|
| Many `BLOCKED` on one lock | Lock contention bottleneck |
| Many `WAITING` on a queue | Idle pool, upstream starvation |
| Many `RUNNABLE` in native I/O | Slow downstream dependency |
| Deadlock section present | JVM-detected circular wait |

**Common production bugs:** Threads stuck in `TIMED_WAITING` on a socket read with no timeout configured. Default socket timeouts in many HTTP clients are *infinite* — a hung downstream service silently consumes the entire thread pool. Always set both connect and read timeouts explicitly.

> ⚠️ **Warning:** An unbounded socket read timeout is one of the most common causes of full-service outages. One slow dependency saturates the thread pool, and every unrelated endpoint stops responding. Set explicit timeouts on every outbound call, and consider a circuit breaker (Resilience4j) for repeated failures.

**Monitoring:** Export thread-state counts as metrics (Micrometer's `JvmThreadMetrics`). A rising `BLOCKED` count is an early warning of contention well before latency alerts fire.

---

### 7.4 Race Conditions and Shared State

**Best practices:** Prefer immutability. A class with all-`final` fields and no mutable references is thread-safe with zero synchronization, and the JMM's final-field guarantee makes it safely publishable. Records make this the path of least resistance.

**Testing advice:** Standard unit tests do not find race conditions. Tools that actually help:
- **jcstress** — the JDK's own concurrency stress harness, designed for memory-model testing
- **Stress tests** with many threads and iterations, run repeatedly
- **Thread sanitizers** and static analysis (SpotBugs' concurrency detectors, error-prone's `@GuardedBy` checks)

**Best practices for documentation:** Annotate thread-safety intent explicitly with `@ThreadSafe`, `@Immutable`, `@GuardedBy("lock")` (from JSR-305 / jcip-annotations). These aren't enforced by the compiler but they document invariants and some static analysis tools verify `@GuardedBy`.

**Common production bugs:** Lazy initialization without synchronization — the classic non-volatile double-checked locking bug. It usually works, occasionally returns a partially-constructed object, and is nearly impossible to reproduce on demand.

**Debugging tips:** Races that "only happen in production" are usually exposed by higher core counts and JIT optimization that doesn't kick in during short test runs. Reproducing often requires sustained load, not just parallelism.

---

### 7.5 synchronized

**Best practices:** Lock on a `private final Object`, never on `this` or a `Class` object in a public class. Public locks let external code participate in your locking scheme, creating contention and deadlock risks you cannot see from within your class.

**Performance considerations:** Keep critical sections minimal. Any I/O, logging, or remote call inside a `synchronized` block extends lock hold time by orders of magnitude and converts a fast lock into a queue.

> ⚠️ **Warning:** Never make a network call, database query, or blocking I/O operation while holding a lock. A downstream slowdown then becomes a lock convoy — every thread queues behind the slow one, and a dependency latency spike turns into a total service stall.

**Common production bugs:** Lock convoys under load — many threads serialize on one monitor, throughput collapses, and CPU utilization looks *low* despite the service being unresponsive. Low CPU with high latency is the signature.

**Real-world use case:** In Spring services, `synchronized` on a singleton bean method serializes every request through that method. Singleton scope plus `synchronized` is a frequent and easily-missed throughput bottleneck.

**Modern recommendations:** On Java 21+ with virtual threads, prefer `ReentrantLock` over `synchronized` around any blocking operation to avoid carrier-thread pinning.

---

### 7.6 volatile

**Best practices:** Use `volatile` for exactly two patterns — single-writer status flags and safe publication of immutable objects. Anything involving read-modify-write needs an atomic or a lock.

**Real-world use case:** Configuration hot-reload is the ideal fit:
```java
private volatile Config config;                    // immutable Config object

public void reload(Config newConfig) { config = newConfig; }   // single writer
public Config current() { return config; }                      // many readers, lock-free
```
Because `Config` is immutable and the reference write is volatile, readers see either the old or new config in full — never a partial state.

**Common production bugs:** A shutdown flag without `volatile`, causing a worker loop to spin forever after shutdown is requested. The JIT hoists the field read into a register once the loop is hot, so the bug appears only after the code has run long enough to be optimized — meaning it passes short tests and hangs in production.

**Performance considerations:** Volatile reads are nearly free on x86; volatile writes require a store barrier that prevents some CPU and compiler optimizations. On a very hot write path this is measurable, though rarely the dominant cost.

**Debugging tips:** If a loop fails to observe a flag change, check for a missing `volatile` before anything else. It's the single most common cause.

---

### 7.7 The Java Memory Model

**Best practices:** Rely on established, documented patterns rather than reasoning from first principles about reordering. `Concurrency in Practice`'s safe-publication idioms and the `java.util.concurrent` classes encode correct memory semantics already — hand-rolled lock-free algorithms are an expert-only activity.

**Testing advice:** JMM violations frequently do not reproduce on x86 development machines because the hardware memory model is stronger than the JMM requires. If your production runs on ARM (Graviton instances, Apple Silicon developer machines), test there — code validated only on x86 can fail on ARM in ways that look inexplicable.

> ⚠️ **Warning:** The industry shift toward ARM server hardware (AWS Graviton in particular) has surfaced latent memory-model bugs in code that ran correctly on x86 for years. Cross-architecture testing is no longer optional for concurrent code.

**Real-world use case:** Immutable objects with `final` fields are the most practical JMM guarantee to exploit. Once a constructor completes without leaking `this`, all threads see fully-initialized final fields with no synchronization. This is why immutability is the recommended default for shared data.

**Common production bugs:** Publishing an object via a plain field and having another thread observe it partially constructed. The fix is publication through a `volatile` field, a `final` field, a static initializer, or a concurrent collection.

**Anti-pattern:** Writing custom lock-free data structures. The JMM subtleties involved defeat most engineers, and `java.util.concurrent` already provides correct, heavily-reviewed implementations.

---

### 7.8 wait, notify, and notifyAll

**Modern recommendations:** Do not use `wait`/`notify` in new code. `BlockingQueue` covers producer-consumer, and `Condition` from `ReentrantLock` covers the general case with multiple independent wait queues. Raw `wait`/`notify` is legacy-maintenance knowledge.

**Real-world use case:** The correct modern equivalent of the classic bounded buffer:
```java
BlockingQueue<Task> queue = new ArrayBlockingQueue<>(1000);

// Producer - blocks when full, providing natural backpressure
queue.put(task);

// Consumer - blocks when empty
Task t = queue.take();
```
This is safer, clearer, and eliminates every spurious-wakeup and lost-wakeup concern.

**Common production bugs:** `wait()` guarded by `if` instead of `while`, producing rare failures when a spurious wakeup or a `notifyAll` with multiple waiters lets a thread proceed while the condition is false. This corrupts state silently rather than throwing.

**Debugging tips:** Threads in `WAITING` on an object monitor with no corresponding notifier indicate a lost wakeup. Look for `notify()` where `notifyAll()` was required, or a notification that fired before the waiter began waiting.

**Maintainability:** Existing `wait`/`notify` code is a strong refactoring candidate during modernization — replacing it with `BlockingQueue` typically removes more code than it adds and eliminates a class of bugs.

---

### 7.9 Locks and the java.util.concurrent Package

**Best practices:** Use `tryLock` with a timeout in any code path where a hang would be worse than a failure. It converts a potential indefinite deadlock into a recoverable, observable error.
```java
if (lock.tryLock(500, TimeUnit.MILLISECONDS)) {
    try { work(); } finally { lock.unlock(); }
} else {
    metrics.increment("lock.timeout");
    throw new ResourceBusyException();
}
```

**Real-world use case:** `Semaphore` for bounding concurrent access to a constrained external resource — limiting simultaneous calls to a downstream API or capping concurrent report generations. It's the simplest correct throttle in the JDK.

**Common production bugs:** A missing `unlock()` in a `finally`, permanently holding a lock after an exception. Every subsequent thread blocks forever, and the thread dump shows one thread that has moved on while dozens are `BLOCKED` on a lock nobody holds meaningfully.

**Performance considerations:** Fair locks (`new ReentrantLock(true)`) prevent starvation but can reduce throughput substantially, because they forfeit the barging optimization that lets a running thread reacquire immediately. Use fairness only when starvation is a demonstrated problem.

**Monitoring:** Expose lock wait times as metrics where contention is plausible. `ReentrantLock.getQueueLength()` gives an approximate count of waiting threads — a useful gauge for capacity planning.

---

### 7.10 Atomic Variables

**Best practices:** Use `LongAdder` rather than `AtomicLong` for any counter incremented frequently by many threads — metrics, request counts, hit counters. The throughput difference under contention is large.

**Performance considerations:** `AtomicLong` under heavy contention degrades badly as CAS operations repeatedly fail and retry, burning CPU. `LongAdder` distributes across per-thread cells, trading exact-read cost for write scalability. Metrics libraries (Micrometer, Dropwizard) use `LongAdder` internally for exactly this reason.

**Real-world use case:** Lock-free state machines via `AtomicReference` with `compareAndSet`, ensuring only one thread performs a transition:
```java
private final AtomicReference<State> state = new AtomicReference<>(State.IDLE);

boolean tryStart() {
    return state.compareAndSet(State.IDLE, State.RUNNING);   // exactly one winner
}
```

**Common production bugs:** Composing multiple atomics and assuming the composition is atomic. If an invariant spans two variables, atomics alone cannot maintain it — use a lock or an `AtomicReference` to an immutable object containing both values.

**Anti-pattern:** Hand-written CAS retry loops for anything complex. The ABA problem and livelock under contention make this error-prone; prefer existing concurrent data structures.

---

### 7.11 Executors and Thread Pools

**Best practices:** Never use the `Executors` factory methods in production. Construct `ThreadPoolExecutor` explicitly with a **bounded** queue, a named `ThreadFactory`, and a deliberate rejection policy. This is the single most impactful piece of guidance in this group.

> ⚠️ **Warning:** `Executors.newFixedThreadPool(n)` uses an unbounded queue. Under sustained overload, tasks accumulate until the heap is exhausted, producing an `OutOfMemoryError` far from the actual cause. The thread count is bounded; the memory is not. Google's Java style guide and most production guidance explicitly discourage these factory methods.

```java
ThreadPoolExecutor pool = new ThreadPoolExecutor(
    corePoolSize, maxPoolSize,
    60L, TimeUnit.SECONDS,
    new ArrayBlockingQueue<>(1000),                          // BOUNDED
    new CustomizableThreadFactory("order-worker-"),
    new ThreadPoolExecutor.CallerRunsPolicy());              // backpressure
```

**Scalability concerns:** `CallerRunsPolicy` provides genuine backpressure — the submitting thread executes the task, slowing intake naturally rather than dropping work or growing memory. For request-handling services this is usually the right choice.

**Common production bugs:**
- Thread-pool deadlock from tasks submitting subtasks to the same bounded pool and blocking on results. Use separate pools for different stages.
- `submit()` returning a `Future` nobody checks, silently swallowing every task exception. Prefer `execute()` for fire-and-forget work so exceptions reach the uncaught handler, or always inspect the `Future`.

**Monitoring:** Export `getActiveCount()`, `getQueue().size()`, and `getCompletedTaskCount()`. A steadily growing queue depth is the earliest reliable signal of insufficient capacity — well before latency degrades visibly.

**Modern recommendations:** For I/O-bound request handling on Java 21+, `Executors.newVirtualThreadPerTaskExecutor()` removes pool sizing as a concern entirely. Pools remain appropriate for CPU-bound work where bounding parallelism is the point.

---

### 7.12 Callable, Future, and CompletableFuture

**Best practices:** Always pass an explicit `Executor` to `CompletableFuture` async methods. The no-executor overloads use the common `ForkJoinPool`, shared with parallel streams and sized for CPU-bound work — blocking I/O there starves unrelated parts of the application.

```java
CompletableFuture.supplyAsync(() -> callService(), ioExecutor)   // explicit, always
```

**Common production bugs:** Silently swallowed failures. A `CompletableFuture` that completes exceptionally with no `exceptionally`/`handle`/`whenComplete` attached, and whose result is never joined, fails invisibly — no log, no metric, no exception. Work simply doesn't happen.

> ✅ **Best Practice:** Terminate every `CompletableFuture` chain with `whenComplete` or `exceptionally` that logs. An unobserved async failure is worse than a crash because nothing signals that anything went wrong.

**Real-world use case:** Parallel fan-out to independent services, then joining:
```java
var a = CompletableFuture.supplyAsync(() -> serviceA.fetch(id), ex);
var b = CompletableFuture.supplyAsync(() -> serviceB.fetch(id), ex);
var c = CompletableFuture.supplyAsync(() -> serviceC.fetch(id), ex);

CompletableFuture.allOf(a, b, c)
    .orTimeout(2, TimeUnit.SECONDS)            // Java 9+ - always bound the wait
    .thenApply(v -> combine(a.join(), b.join(), c.join()))
    .exceptionally(this::degradedResponse);
```
This cuts latency from the sum of three calls to the maximum of the three.

**Debugging tips:** `CompletableFuture` stack traces are notoriously unhelpful, since the trace reflects the completing thread rather than the submitting one. Add context to exceptions at each stage, and propagate correlation IDs explicitly — MDC does not follow across async boundaries without a decorator.

**Modern recommendations:** On Java 21+, structured concurrency (`StructuredTaskScope`) offers clearer semantics for fan-out with automatic cancellation of siblings on failure. Check current JDK status before adopting, as its API has evolved across preview rounds.

---

### 7.13 Concurrent Collections

**Best practices:** Reach for `ConcurrentHashMap` over `synchronizedMap` in all concurrent scenarios. The atomic compound operations (`computeIfAbsent`, `merge`, `putIfAbsent`) are the real advantage — they eliminate check-then-act races that manual synchronization makes easy to get wrong.

**Common production bugs:** A long-running or recursive mapping function inside `computeIfAbsent`. The bin lock is held for the duration, so an expensive database call inside it blocks other threads hashing to the same bin — and a recursive `computeIfAbsent` on the same map can deadlock outright.

> ⚠️ **Warning:** Never perform I/O, remote calls, or recursive map access inside `computeIfAbsent`. Compute the value outside and use `putIfAbsent`, or accept possible duplicate computation in exchange for not holding the lock.

**Real-world use case:** `BlockingQueue` as the backbone of producer-consumer pipelines — ingestion buffers, batching layers, work distribution. A bounded `ArrayBlockingQueue` gives backpressure for free: producers block when consumers fall behind, which is almost always preferable to unbounded memory growth.

**Memory considerations:** `CopyOnWriteArrayList` copies the entire array on every write. For a listener registry with occasional registration it's ideal; for anything write-heavy it's a severe performance and allocation problem. Verify the read/write ratio before choosing it.

**Anti-pattern:** Wrapping a `HashMap` in `Collections.synchronizedMap` and then iterating it — iteration still requires manual external synchronization, and most code that does this omits it, producing intermittent `ConcurrentModificationException`.

---

### 7.14 Deadlock, Livelock, and Starvation

**Best practices:** Establish a documented global lock ordering for any code acquiring multiple locks, and enforce it in code review. Where objects have no natural ordering, order by a stable identifier or `System.identityHashCode`.

**Debugging tips:** `jstack <pid>` detects Java-level deadlocks automatically and prints a dedicated section naming the threads and the locks involved. This makes deadlock one of the *easier* concurrency failures to diagnose — unlike races or livelock.

**Common production bugs:**
- **Thread-pool deadlock** — tasks submitting dependent subtasks to the same bounded pool. Extremely common in batch processing and parallel pipelines, and it produces no deadlock report from `jstack` because no monitor is involved. All threads simply sit `WAITING` on futures.
- **Cross-resource deadlock** — a JVM lock held while awaiting a database lock held by a transaction blocked on that JVM lock. Neither the JVM nor the database detects it alone.

> ⚠️ **Warning:** Deadlocks spanning the JVM and an external resource (database, distributed lock, message broker) are invisible to `jstack`'s detector. Diagnosing them requires correlating JVM thread dumps with database lock views (`pg_locks`, `SHOW ENGINE INNODB STATUS`) at the same moment.

**Monitoring:** A `ThreadMXBean.findDeadlockedThreads()` check on a scheduled task can alert on deadlock in production before users report a hang.

**Anti-pattern:** Calling callbacks, listeners, or any caller-supplied code while holding a lock. That code may acquire further locks in an order you cannot control, which is the standard route to unpredictable deadlock.

---

### 7.15 Virtual Threads

**Best practices:** Adopt virtual threads for I/O-bound request handling on Java 21+, and remove thread pool sizing from the design entirely. Keep platform-thread pools for CPU-bound work, where bounding parallelism to core count is the actual goal.

**Common production bugs:** Carrier-thread pinning. A virtual thread blocking inside a `synchronized` block cannot unmount, so it holds its carrier. With enough pinned threads the small carrier pool is exhausted and throughput collapses — the failure looks like a deadlock but is really starvation.

> ⚠️ **Warning:** Diagnose pinning with `-Djdk.tracePinnedThreads=full`, which logs a stack trace whenever a virtual thread pins its carrier. Many older libraries — JDBC drivers in particular — use `synchronized` internally, so verify driver behavior before assuming a virtual-thread migration is transparent. Recent JDK releases have reduced `synchronized` pinning, so confirm behavior on your specific JDK version rather than relying on older guidance.

**Migration guidance:** Replace `synchronized` with `ReentrantLock` in any code path that blocks. `ReentrantLock` allows the virtual thread to unmount while waiting; the historical `synchronized` behavior did not.

**Memory considerations:** `ThreadLocal` at a million virtual threads means a million copies of every thread-local value. Audit `ThreadLocal` usage before scaling up, and prefer scoped values where available.

**Scalability concerns:** Virtual threads shift the bottleneck outward. Removing the thread ceiling means downstream services, connection pools, and databases now receive concurrency they were never sized for. A connection pool of 20 does not become larger because you have a million virtual threads — expect to re-tune every downstream limit, and add explicit concurrency bounds (a `Semaphore`) where a downstream dependency needs protecting.

**Modern recommendations:** Spring Boot 3.2+ enables virtual threads for request handling with a single property (`spring.threads.virtual.enabled=true`). Verify JDBC driver and library pinning behavior before enabling it in production, and load-test rather than assuming improvement.

---

[[#📖 Master Table of Contents|⬆ Back to top]]

*End of Group 7. Next: JVM Internals & Memory Management.*

---

## 8. JVM Internals & Memory Management

### Table of Contents (this group)
- [[#8.1 JVM Architecture Overview]]
- [[#8.2 Class Loading]]
- [[#8.3 Runtime Memory Areas]]
- [[#8.4 The Heap and Object Allocation]]
- [[#8.5 The Stack]]
- [[#8.6 Metaspace]]
- [[#8.7 Garbage Collection Basics]]
- [[#8.8 Generational GC]]
- [[#8.9 Garbage Collector Implementations]]
- [[#8.10 References (Strong, Soft, Weak, Phantom)]]
- [[#8.11 Memory Leaks in Java]]
- [[#8.12 JIT Compilation]]
- [[#8.13 JVM Tuning and Monitoring]]

---

### 8.1 JVM Architecture Overview

**Best practices:** Pin the exact JDK vendor and version in your build and runtime images. GC defaults, JIT heuristics, and container-awareness behavior differ across vendors and minor versions — a silent bump from one build to another has caused real production regressions.

**Real-world use case:** Vendor choice matters at scale. OpenJ9 has a notably smaller memory footprint than HotSpot and suits dense container deployments; GraalVM native-image eliminates warm-up for serverless workloads at the cost of peak throughput and dynamic features (reflection requires explicit configuration).

**Common production bugs:** JDK version drift between build and runtime images, producing `UnsupportedClassVersionError` or behavior changes that only surface under load.

**Monitoring:** Export JVM metrics (Micrometer's `JvmMemoryMetrics`, `JvmGcMetrics`, `JvmThreadMetrics`) from every service by default. Retrofitting observability during an incident is far harder than having it already in place.

---

### 8.2 Class Loading

**Best practices:** Avoid custom class loaders unless you genuinely need runtime isolation. They introduce class identity subtleties, complicate debugging, and are a common leak source.

**Common production bugs:** Class loader leaks in application servers doing hot redeployment. Each redeploy creates a new loader; if anything retains the old one — a `ThreadLocal`, a JDBC driver registered in `DriverManager`, a JMX registration, a running thread — every class it defined stays in metaspace. After enough redeploys the process dies from native memory exhaustion while the heap looks fine.

> ⚠️ **Warning:** The classic class loader leak vector is a library registering something in a JVM-global registry (`DriverManager`, `ThreadLocal`, shutdown hooks, `java.beans.Introspector` caches) and never deregistering. Tomcat logs explicit warnings about these on undeploy — treat those warnings as bugs to fix, not noise to ignore.

**Debugging tips:** `jcmd <pid> VM.classloader_stats` shows loaded class counts per loader. Steady growth across redeployments confirms a loader leak. `-Xlog:class+unload` shows what is actually being unloaded.

**Performance considerations:** Class loading is a major startup cost. **AppCDS** (Application Class Data Sharing) memory-maps a pre-parsed class archive shared across JVM instances, meaningfully reducing startup time — valuable for scale-to-zero and rapid autoscaling.

**Security implications:** Deserialization vulnerabilities exploit class loading — untrusted input causing arbitrary classes to load and initialize. Never deserialize untrusted data with Java serialization; use a data format that doesn't instantiate arbitrary types.

---

### 8.3 Runtime Memory Areas

**Best practices:** Size containers as heap plus non-heap plus headroom, never heap alone. A workable starting point is `-XX:MaxRAMPercentage=70` to `75`, leaving room for metaspace, stacks, code cache, and direct buffers.

> ⚠️ **Warning:** A container OOM-kill with healthy heap metrics almost always means non-heap growth — metaspace, direct `ByteBuffer`s, thread stacks, or native library allocations. Heap dashboards will show nothing wrong. Enable Native Memory Tracking (`-XX:NativeMemoryTracking=summary`) and inspect with `jcmd VM.native_memory summary` to find it.

**Common production bugs:**
- **Direct buffer leaks** — Netty and NIO-based clients allocate direct memory freed only when the buffer object is collected. Under low heap pressure, GC runs rarely, so direct memory accumulates while the heap stays small. Bound it with `-XX:MaxDirectMemorySize`.
- **Code cache exhaustion** — the JVM stops JIT compiling and reverts to interpretation. Throughput collapses with no exception; the only signal is a log line about the code cache being full. Set `-XX:ReservedCodeCacheSize` higher for large applications.

**Scalability concerns:** Thread stacks are often overlooked in sizing. Five hundred platform threads at 1 MB each reserves 500 MB of native memory outside the heap — a substantial fraction of a modest container limit.

**Monitoring:** Alert on container RSS relative to the limit, not just heap utilization. RSS is what the orchestrator kills on.

---

### 8.4 The Heap and Object Allocation

**Best practices:** Reduce *allocation rate* before considering GC tuning. Allocation rate directly determines minor GC frequency, and lowering it usually delivers more than any flag change.

**Performance considerations:** Common high-allocation patterns worth auditing:
- String concatenation in loops (use `StringBuilder`, though the compiler handles simple cases)
- Boxing in numeric hot paths (use primitive streams and specialized functional interfaces — see Group 6)
- Defensive copying on every accessor call in hot paths
- Excessive intermediate collections in stream pipelines

**Anti-pattern:** Object pooling for ordinary domain objects. It was reasonable advice in the 1990s and is now actively harmful — TLAB allocation is a pointer bump, while pooled objects survive longer, get promoted to the old generation, and increase full GC cost. Pool only genuinely expensive resources: connections, threads, large buffers.

> ⚠️ **Warning:** The compressed-oops threshold near 32 GB is a real tuning cliff. Raising a heap from 31 GB to 33 GB disables compressed object pointers, inflating every reference from 4 to 8 bytes — the larger heap can hold *less* usable data. If you need more than ~32 GB, jump well past it (48 GB or more) so the gain outweighs the loss.

**Debugging tips:** `async-profiler` in allocation mode produces flame graphs showing exactly which call paths allocate most. This is usually a faster route to improvement than GC log analysis.

---

### 8.5 The Stack

**Best practices:** Convert deep recursion to iteration for anything processing user-controlled or unbounded input. Java has no tail-call optimization, so recursion depth is bounded by stack size regardless of algorithm elegance.

**Common production bugs:** `StackOverflowError` from recursion over unexpectedly deep data — a deeply nested JSON document, a cyclic object graph in a recursive `toString()`, or a Hibernate entity with bidirectional relationships serialized recursively. The last is common enough to be worth checking specifically.

**Security implications:** If input size controls recursion depth, an attacker can trigger `StackOverflowError` deliberately — a denial-of-service vector. Deeply nested JSON or XML is the standard attack. Bound nesting depth explicitly in parsers rather than relying on stack size.

**Memory considerations:** `-Xss` multiplies by thread count. Raising it to 2 MB with 1,000 threads reserves 2 GB of native memory. In virtual-thread applications this concern largely disappears, since virtual thread stacks grow on the heap rather than being pre-reserved.

**Debugging tips:** A `StackOverflowError` stack trace shows the repeating frame cycle, which identifies the recursion immediately. If the trace is truncated, raise `-XX:MaxJavaStackTraceDepth`.

---

### 8.6 Metaspace

**Best practices:** Always set `-XX:MaxMetaspaceSize` explicitly in production. Leaving it unbounded means a class-loading leak grows until the container or OS kills the process — often with no `OutOfMemoryError` and no heap dump. A bound converts a silent kill into a diagnosable failure.

**Common production bugs:** Metaspace growth from runtime class generation. Mocking frameworks, CGLIB proxies, expression evaluators, and dynamic scripting engines all generate classes; if generation happens per request rather than once, metaspace grows unbounded. This is particularly common with dynamically-built proxies keyed on request data.

**Debugging tips:** `jcmd <pid> VM.classloader_stats` and `-Xlog:class+load` identify what's being loaded and by which loader. A continuously rising loaded-class count with stable functionality confirms runtime generation is the culprit.

**Real-world use case:** Application servers hosting multiple applications rely on per-application class loaders for isolation. Understanding that metadata unloads only when an entire loader becomes unreachable explains why one leaked reference retains an application's full class metadata.

**Monitoring:** Track metaspace used and committed as separate metrics. Steady growth without a corresponding functional change is the signature of a class loader or class generation leak.

---

### 8.7 Garbage Collection Basics

**Best practices:** Never call `System.gc()` in application code. It forces a full collection with a long stop-the-world pause and typically degrades exactly the situation it's invoked to help. Add `-XX:+DisableExplicitGC` to prevent third-party libraries from doing it.

> ⚠️ **Warning:** Some libraries call `System.gc()` internally — direct `ByteBuffer` cleanup historically relied on it. `-XX:+DisableExplicitGC` blocks these calls, which is normally correct, but verify that nothing depends on it for direct-memory reclamation before enabling it in a heavily NIO-based application.

**Deprecated approaches to avoid:** `finalize()` is deprecated since Java 9 and removed from use in modern code. It delayed collection, ran unpredictably, could resurrect objects, and swallowed exceptions. Use try-with-resources for deterministic cleanup and `Cleaner` for last-resort native resource release.

**Common production bugs:** Relying on `finalize()` or GC timing for resource cleanup — file handles, sockets, native memory. Resources are released when the collector happens to run, which under low memory pressure may be minutes later or not at all before the descriptor limit is hit.

**Monitoring:** GC logs are the primary diagnostic. Enable unified logging with rotation on every production JVM:
```
-Xlog:gc*:file=/var/log/gc.log:time,uptime,level,tags:filecount=10,filesize=20M
```
The overhead is negligible and the logs are indispensable during an incident. GCEasy and similar analyzers parse them into readable reports.

---

### 8.8 Generational GC

**Best practices:** Tune the young generation before touching anything else. Most GC problems trace to an undersized young generation causing premature promotion, which converts cheap minor GCs into expensive full GCs.

**Common production bugs:** Medium-lived objects — typically request-scoped caches, batch accumulators, or session data — surviving long enough to be promoted but dying shortly after. They fill the old generation with short-lived garbage and drive frequent full collections. The fix is usually a larger young generation or restructuring to shorten object lifetime.

**Performance considerations:** Reading GC logs for promotion pressure is the key skill. Watch the old-generation occupancy after each full GC: if it climbs steadily across collections, you have either a leak or sustained promotion. If it returns to a stable baseline, the old generation is healthy and the issue is elsewhere.

**Real-world use case:** Caches deserve explicit attention. A large in-memory cache lives in the old generation by design, so it inflates full GC duration proportionally to its size. Bounded caches with eviction (Caffeine) keep this predictable; unbounded caches make full GC duration grow without limit.

**Monitoring:** Track promotion rate and full GC frequency, not just pause duration. Rising full GC frequency is an earlier warning than rising pause time.

---

### 8.9 Garbage Collector Implementations

**Best practices:** Choose the collector deliberately and state it explicitly in your flags rather than relying on defaults, which change between JDK versions. Match the choice to what you actually measure and care about:

| Workload | Reasonable starting choice |
|---|---|
| Request-serving service, moderate heap | G1 (default) |
| Strict latency SLO, large heap | ZGC (generational) |
| Batch job, throughput-first | Parallel GC |
| Small container, low heap | Serial GC |

**Performance considerations:** In small containers (under roughly 2 GB with one or two CPUs), Serial GC frequently outperforms G1 — fewer GC threads, lower bookkeeping overhead, and no concurrent-phase CPU cost. Modern JVMs select Serial automatically in small containers, which surprises people who expect G1 everywhere.

**Common production bugs:** Copying GC flags between services with different workload profiles. Flags tuned for a low-latency API can badly hurt a batch service and vice versa. Every GC change needs its own load test against representative traffic.

> ✅ **Best Practice:** Change one GC parameter at a time, load-test against production-representative traffic, and compare GC logs. Multi-flag changes make it impossible to attribute the outcome, and GC tuning is unusually prone to coincidental improvement.

**Modern recommendations:** Generational ZGC substantially improved ZGC's throughput relative to the original design, making it viable for more workloads than before. If evaluating ZGC on an older assessment, re-test on a current JDK.

---

### 8.10 References (Strong, Soft, Weak, Phantom)

**Best practices:** Use a purpose-built caching library (Caffeine) rather than `SoftReference`. Caffeine provides size bounds, time-based expiry, refresh, and eviction statistics — everything `SoftReference` lacks — with predictable behavior under load.

**Anti-pattern:** `SoftReference`-based caches. The JVM clears them at its own discretion, typically all at once under memory pressure, producing a sudden cache-wide miss storm exactly when the system is already stressed. They also increase GC work, since the collector must evaluate each one.

**Real-world use case:** `Cleaner` for native resource release, as the modern replacement for `finalize()`:
```java
private static final Cleaner CLEANER = Cleaner.create();

public class NativeResource implements AutoCloseable {
    private final Cleaner.Cleanable cleanable;
    public NativeResource() {
        this.cleanable = CLEANER.register(this, new CleanupTask(handle));
    }
    @Override public void close() { cleanable.clean(); }
}
```
Note that the cleanup task must not reference the object being cleaned, or it will never become unreachable — a mistake that silently disables the cleaner.

**Common production bugs:** `WeakHashMap` where values reference their keys, which prevents eviction entirely. The map appears weak but behaves strongly, leaking steadily.

**Debugging tips:** In a heap dump, reference objects appear in the dominator tree like any other. If a `WeakHashMap` shows a large retained size, check whether values reference keys.

---

### 8.11 Memory Leaks in Java

**Best practices:** Establish an ownership discipline for anything registered globally — listeners, `ThreadLocal`s, cache entries, scheduled tasks, JMX beans. Every registration needs a corresponding, guaranteed deregistration, ideally in a `finally` or a lifecycle callback.

**Common production bugs, in rough order of frequency:**

| Leak | Signature | Fix |
|---|---|---|
| Unbounded cache in a static field | Steady heap growth, one dominator | Bounded cache with eviction |
| `ThreadLocal` not removed | Growth proportional to pool threads | `remove()` in `finally` |
| Listeners never unregistered | Dead objects retained by publisher | Explicit deregistration or weak listeners |
| Class loader retained | Metaspace growth, healthy heap | Fix the retaining global registration |
| Unclosed streams/connections | Descriptor exhaustion, native growth | try-with-resources |

**Debugging tips — the standard workflow:**
1. Capture a heap dump at a point of elevated memory (`jcmd GC.heap_dump`)
2. Open in Eclipse MAT and run Leak Suspects
3. Examine the dominator tree for the largest retained sizes
4. Use "Path to GC Roots" (excluding weak/soft references) on the suspect
5. The retaining reference chain identifies the bug directly

> ✅ **Best Practice:** Take two heap dumps separated by meaningful time under load and compare histograms. Growth between dumps isolates the leaking type far faster than analyzing a single dump, where normal working set and leak look similar.

**Testing advice:** Long-running soak tests under sustained load are the only reliable way to catch leaks before production. A leak of a few kilobytes per request is invisible in a short test and fatal after a week of traffic.

**Monitoring:** Alert on heap-used-after-full-GC, not on raw heap usage. Raw usage oscillates normally with the GC cycle; post-full-GC occupancy trending upward is the unambiguous leak signal.

---

### 8.12 JIT Compilation

**Best practices:** Account for warm-up in deployment. A freshly started JVM is materially slower than a warm one, so route traffic gradually rather than sending full load to a new instance immediately.

**Real-world use case:** Kubernetes readiness probes that pass before JIT warm-up completes cause latency spikes on every deployment and scale-up. Options: a warm-up phase that exercises hot paths before signalling ready, gradual traffic ramping, or AppCDS/AOT to reduce the warm-up window.

**Common production bugs:** Code cache exhaustion in large applications, especially with heavy framework proxy generation. The JVM stops compiling, silently reverts to interpretation, and throughput drops severely. The only signal is a log warning — monitor code cache usage and set `-XX:ReservedCodeCacheSize` appropriately.

**Testing advice:** Never microbenchmark with a manual loop and `System.nanoTime()`. Without warm-up, dead-code elimination guards, and blackholes, results are meaningless — frequently off by orders of magnitude. Use JMH:
```java
@Benchmark
@Warmup(iterations = 5)
@Measurement(iterations = 10)
public void measure(Blackhole bh) { bh.consume(work()); }
```

**Performance considerations:** Megamorphic call sites — an interface with many implementations called from one location — prevent inlining and are measurably slower. Where a hot path dispatches across many implementations, consider whether the abstraction is worth its cost there specifically.

**Modern recommendations:** For serverless and scale-to-zero workloads where warm-up dominates, evaluate GraalVM native-image or CRaC (Coordinated Restore at Checkpoint). Both trade peak throughput and some dynamic capability for near-instant startup.

---

### 8.13 JVM Tuning and Monitoring

**Best practices — the baseline production flag set:**
```bash
-XX:MaxRAMPercentage=75
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/var/log/dumps
-XX:+ExitOnOutOfMemoryError
-XX:MaxMetaspaceSize=512m
-Xlog:gc*:file=/var/log/gc.log:time,uptime:filecount=10,filesize=20M
```
This set costs nothing in normal operation and makes the difference between a diagnosable incident and a mystery.

> ✅ **Best Practice:** `-XX:+ExitOnOutOfMemoryError` combined with heap dump capture is the right posture in orchestrated environments. Capture the evidence, then die cleanly so the orchestrator restarts a healthy instance — rather than limping along in a degraded state serving errors.

**Real-world use case:** Java Flight Recorder for continuous production profiling. Overhead is low enough to leave enabled, and it captures allocation profiles, GC events, lock contention, exceptions, and I/O with full stack context:
```bash
-XX:StartFlightRecording=disk=true,maxsize=500m,maxage=6h,filename=/var/log/recording.jfr
```
When an incident occurs, you already have the six hours preceding it recorded — which is otherwise the single hardest thing to obtain after the fact.

**Common production bugs:** Container memory limits set without accounting for non-heap memory, causing OOM kills that look inexplicable because heap dashboards are green. Budget the full process footprint, and alert on RSS against the limit.

**Debugging tips:** `jcmd` is the single most useful tool to know — it subsumes most of the older utilities:
```bash
jcmd <pid> help                    # everything available
jcmd <pid> Thread.print            # thread dump with deadlock detection
jcmd <pid> GC.heap_info            # generation occupancy
jcmd <pid> GC.heap_dump /tmp/h.hprof
jcmd <pid> VM.native_memory summary
jcmd <pid> JFR.start / JFR.dump    # flight recording on demand
```

**Anti-pattern:** Adopting GC flags from blog posts or Stack Overflow answers without measuring. GC tuning is workload-specific, and flags that transformed one service's latency can degrade another's throughput badly. Measure, change one thing, measure again.

---

[[#📖 Master Table of Contents|⬆ Back to top]]

*End of Group 8. Next: I/O & NIO.*

---

## 9. I/O & NIO

### Table of Contents (this group)
- [[#9.1 What Is I/O?]]
- [[#9.2 Byte Streams]]
- [[#9.3 Character Streams (Readers and Writers)]]
- [[#9.4 Buffering]]
- [[#9.5 The Decorator Pattern in Java I/O]]
- [[#9.6 Character Encoding]]
- [[#9.7 File Handling: File vs Path]]
- [[#9.8 NIO.2 and the Files API]]
- [[#9.9 Channels and Buffers]]
- [[#9.10 Non-Blocking I/O and Selectors]]
- [[#9.11 Serialization]]
- [[#9.12 Resource Management]]

---

### 9.1 What Is I/O?

**Best practices:** Default to NIO.2 (`Path`, `Files`) for all file work in new code. Reserve `java.io` streams for cases where a library requires them, and reserve raw NIO channels for genuine performance needs you've measured.

**Real-world use case:** In a typical Spring service, almost all I/O is mediated by frameworks — JDBC drivers, HTTP clients, message consumers. Direct I/O code usually appears in file ingestion, report generation, and configuration loading, which is where these practices matter most.

**Common production bugs:** Choosing raw NIO for perceived performance and introducing buffer-state bugs that a buffered stream would have avoided entirely. Complexity has a defect cost; pay it only where measurement justifies it.

**Monitoring:** Track open file descriptor count as a service metric. It's a leading indicator of leaks and is trivially available from `/proc/self/fd` on Linux or via `UnixOperatingSystemMXBean.getOpenFileDescriptorCount()`.

---

### 9.2 Byte Streams

**Best practices:** Always read into a byte array rather than one byte at a time, and always respect the returned count. Use `transferTo()` (Java 9+) for stream-to-stream copies rather than hand-written loops.

**Common production bugs:** Assuming `read(byte[])` fills the array. This works consistently for local files and fails intermittently for network streams, which return whatever has arrived. The result is silently truncated or corrupted data under network conditions that differ from the test environment.

> ⚠️ **Warning:** Any code processing `buffer` rather than `buffer[0..n]` after `int n = in.read(buffer)` is a latent data-corruption bug. It typically passes local testing and fails against real network sources, where partial reads are normal.

**Performance considerations:** Buffer sizes of 8 KB to 64 KB cover most cases well. Larger buffers rarely help meaningfully and increase memory per concurrent operation — a real cost when many requests are in flight.

**Security implications:** Reading an entire request body or uploaded file into memory without a size limit is a denial-of-service vector. Bound the read explicitly, and prefer streaming to disk or a bounded buffer for uploads.

---

### 9.3 Character Streams (Readers and Writers)

**Best practices:** Use `Files.newBufferedReader(path)` and `Files.newBufferedWriter(path)` rather than manually composing `FileReader` wrappers. They default to UTF-8 on all versions and remove a layer of construction noise.

**Common production bugs:** String truncation splitting a surrogate pair. A `substring()` at a fixed length — for a database column limit or a display field — can cut a character in half, producing invalid text that fails validation or renders as a replacement glyph downstream. This surfaces the first time a user enters an emoji.

> ⚠️ **Warning:** Truncating strings by `char` index is unsafe for internationalized input. Use `BreakIterator` for grapheme-cluster-aware truncation, or at minimum check `Character.isHighSurrogate()` at the cut point before truncating.

**Real-world use case:** Any user-facing text field — names, comments, addresses — will eventually contain emoji, combining accents, or non-BMP characters. Length validation, truncation, and database column sizing all need to account for this, and MySQL specifically requires `utf8mb4` rather than its misnamed `utf8` to store them at all.

**Testing advice:** Include emoji and non-Latin scripts in test fixtures for any text-handling code. These bugs are invisible with ASCII-only test data and appear immediately in production.

---

### 9.4 Buffering

**Best practices:** Buffer any stream accessed in small increments. The improvement is large enough that omitting it is effectively a bug rather than a missed optimization.

**Common production bugs:** Data loss from an unclosed writer. Because `close()` flushes, code that writes and then exits without closing loses whatever remained in the buffer — often the final records of a file, making the truncation easy to miss in casual inspection.

**Real-world use case:** Durability requirements distinguish `flush()` from `force()`. For a write-ahead log, audit trail, or anything that must survive power loss, `flush()` is insufficient:
```java
try (FileChannel ch = FileChannel.open(path, WRITE, CREATE, APPEND)) {
    ch.write(buffer);
    ch.force(true);     // metadata + data to physical storage
}
```
`force(true)` is expensive — often milliseconds — so batch writes before forcing where the durability contract allows.

**Performance considerations:** Calling `flush()` after every small write defeats buffering entirely, reducing throughput to unbuffered levels. Flush on a meaningful boundary — a batch, a transaction, a time interval — not per record.

---

### 9.5 The Decorator Pattern in Java I/O

**Best practices:** Prefer the `Files` factory methods over manually assembled wrapper chains where they exist. `Files.newBufferedReader(path)` replaces a three-level nested construction and is harder to get wrong.

**Readability:** Deeply nested constructor chains read inside-out and are easy to misorder. Where a chain is genuinely needed, assign intermediate stages to named variables inside the try-with-resources header — each becomes independently closeable and the intent becomes readable.

**Common production bugs:** Wrapping in an order that silently degrades behavior — encoding below compression, or buffering on the wrong side of a transformation. These produce correct output with poor performance, so they persist unnoticed.

**Maintainability:** A custom decorator is occasionally the right tool — a counting stream for metrics, a rate-limiting stream, or a digest-computing stream:
```java
try (DigestInputStream in = new DigestInputStream(source, MessageDigest.getInstance("SHA-256"))) {
    in.transferTo(out);
    byte[] checksum = in.getMessageDigest().digest();   // computed during the copy
}
```
This computes a checksum in the same pass as the copy, avoiding a second read.

---

### 9.6 Character Encoding

**Best practices:** Specify the charset explicitly at every boundary, even on Java 18+ where UTF-8 is the default. Explicit charsets survive version changes, are self-documenting, and protect against libraries that use their own defaults.

> ⚠️ **Warning:** Java 18 changed the default charset to UTF-8. Applications upgrading from Java 17 or earlier that relied on the platform default may see behavior changes — most often on Windows, where the default was previously a legacy code page. `-Dfile.encoding=COMPAT` restores the old behavior temporarily, but the correct fix is explicit charsets.

**Common production bugs:** Encoding mismatch between application and database. MySQL's `utf8` charset stores only three bytes per character and cannot represent emoji or some CJK characters — inserting them throws or silently truncates depending on mode. The correct charset is `utf8mb4`, and this catches teams regularly.

**Real-world use case:** The full chain must agree: HTTP `Content-Type` header, JVM charset, database connection charset, database column charset, and file encoding. A mismatch anywhere corrupts data, and because corruption is silent it's often discovered long after the fact when the original data is unrecoverable.

**Debugging tips:** When text appears corrupted, the byte-level view identifies the mismatch. `café` mis-decoded as ISO-8859-1 shows as `cafÃ©` — the distinctive `Ã` prefix is the signature of UTF-8 bytes read as single-byte Latin-1.

**Testing advice:** Include a non-ASCII round-trip test through every persistence and transport layer. It's a single test that catches an entire class of costly bugs.

---

### 9.7 File Handling: File vs Path

**Best practices:** Migrate to `Path` and `Files` for new code, converting at library boundaries with `toFile()`/`toPath()`. The improved error reporting alone justifies the change.

**Security implications:** Path traversal is the critical concern when any path component comes from user input. Never construct a path from untrusted input without normalizing and verifying containment:
```java
Path base = Path.of("/var/app/uploads").toRealPath();
Path target = base.resolve(userInput).normalize();
if (!target.startsWith(base)) {
    throw new SecurityException("Path traversal attempt");
}
```
Order matters — normalize *before* checking, or `../../etc/passwd` passes the check and then escapes.

> ⚠️ **Warning:** Path traversal is a recurring high-severity vulnerability class. Any file path derived from a request parameter, upload filename, or archive entry name needs normalization and containment verification. Zip extraction is especially exposed — the "zip slip" vulnerability exploits archive entries containing `../` sequences.

**Common production bugs:** Hardcoded separators breaking cross-platform behavior, and — more subtly — case-sensitivity differences between a developer's macOS filesystem (case-insensitive by default) and a Linux server (case-sensitive). Code that works locally fails in production on a filename case mismatch.

**Debugging tips:** `Files.delete()` throwing a specific exception instead of `File.delete()` returning `false` shortens diagnosis substantially. This alone is worth migrating file-manipulation code.

---

### 9.8 NIO.2 and the Files API

**Best practices:** Use atomic move for safe file publication. Writing directly to a destination path means readers can observe a partially-written file:
```java
Path temp = Files.createTempFile(dir, "staging-", ".tmp");
Files.writeString(temp, content);
Files.move(temp, target, StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING);
```
Readers see either the old file or the complete new one, never an intermediate state.

**Common production bugs:** Descriptor leaks from unclosed `Files.lines()`, `Files.walk()`, and `Files.list()`. These look like ordinary streams, so the closing requirement is easy to overlook — and the resulting "Too many open files" error appears in unrelated code much later.

> ⚠️ **Warning:** `Files.walk()` on a large directory tree without a depth limit can traverse far more than intended, and with `FOLLOW_LINKS` a symlink cycle causes infinite traversal. Always bound depth explicitly when the tree isn't fully under your control.

**Performance considerations:** `Files.readAllLines()` on a multi-gigabyte log file will exhaust the heap. `Files.lines()` streams in constant memory — provided no stateful operation (`sorted()`, `distinct()`) buffers the whole stream, which quietly reintroduces the problem.

**Real-world use case:** `WatchService` for configuration hot-reload avoids polling. Note that on macOS the implementation historically fell back to polling with noticeable latency, so cross-platform behavior differs — verify on your deployment target rather than assuming parity with Linux.

**Testing advice:** Use `Jimfs` (an in-memory filesystem implementing the NIO.2 `FileSystem` SPI) for file-handling tests. It's faster than temp directories and avoids test pollution from leftover files.

---

### 9.9 Channels and Buffers

**Best practices:** Reuse direct buffers rather than allocating per operation. Direct buffer allocation is expensive and reclamation is tied to GC, so per-request allocation is a well-known native memory growth pattern.

**Memory considerations:** Direct buffers live outside the heap and are bounded by `-XX:MaxDirectMemorySize` (defaulting to roughly the max heap size). Exhausting it throws `OutOfMemoryError: Direct buffer memory` while heap dashboards show nothing wrong — connecting directly to the non-heap sizing discussion in Group 8.

> ⚠️ **Warning:** Direct `ByteBuffer` memory is released only when the buffer object is garbage collected. Under low heap pressure GC runs infrequently, so direct memory can grow to its limit while the heap stays small. Netty maintains its own pooled allocator specifically to avoid this — application code should pool similarly or use heap buffers.

**Real-world use case:** Zero-copy file serving via `FileChannel.transferTo()` lets the OS move data from page cache to socket without passing through the JVM at all — significantly faster for large static file transfers:
```java
try (FileChannel ch = FileChannel.open(path, READ)) {
    ch.transferTo(0, ch.size(), socketChannel);
}
```

**Common production bugs:** Memory-mapped files on Windows cannot be deleted while the mapping is live, and Java offers no portable way to force unmapping. Long-running processes that map and then attempt to delete files hit this consistently.

**Debugging tips:** Enable Native Memory Tracking to attribute direct buffer usage: `jcmd <pid> VM.native_memory summary` shows an "Internal" or "Other" category that includes direct buffers.

---

### 9.10 Non-Blocking I/O and Selectors

**Best practices:** Do not write raw `Selector` code. Use Netty, Vert.x, or the built-in `HttpClient` — the edge cases (selector spin, partial writes, `OP_WRITE` registration discipline, backpressure) are numerous and have already been solved carefully in those libraries.

**Modern recommendations:** On Java 21+, evaluate whether non-blocking I/O is needed at all. Virtual threads let straightforward blocking code scale to very high connection counts, and blocking code is dramatically easier to write, read, debug, and profile. Reserve the reactive/non-blocking model for cases where you've measured a genuine need or you're already invested in such a framework.

**Common production bugs:** Blocking work inside an event-loop handler. A single JDBC call or heavy computation in a Netty handler stalls every connection assigned to that loop — turning one slow query into a partial outage. Reactive frameworks warn about this, but it recurs constantly during migrations from blocking code.

> ⚠️ **Warning:** Mixing blocking calls into a reactive pipeline is the most common failure mode in reactive adoption. If a service is mostly blocking with a reactive shell, throughput often ends up *worse* than a straightforward thread-pool design, with far harder debugging.

**Debugging tips:** Reactive and callback-based stack traces lose the logical call chain, since frames reflect the event loop rather than the request path. Reactor's `Hooks.onOperatorDebug()` and similar tooling reconstruct it at meaningful runtime cost — usually enabled only in non-production environments.

**Scalability concerns:** Non-blocking I/O removes the thread bottleneck, which shifts pressure downstream. Connection pools, database limits, and dependent services then receive concurrency they weren't sized for — the same caution that applies to virtual threads in Group 7.

---

### 9.11 Serialization

**Best practices:** Do not use Java serialization for anything new. Use JSON (Jackson), Protocol Buffers, or Avro. If you inherit a system using it, treat migration as a security improvement rather than a refactor.

> ⚠️ **Warning:** Deserializing untrusted data with `ObjectInputStream` is one of the most severe vulnerability classes in the Java ecosystem — it has produced remote code execution CVEs in many widely-used products. The attack doesn't require you to use a vulnerable class directly; a gadget chain assembles exploits from ordinary library classes already on your classpath.

**Security implications:** If Java serialization cannot be removed immediately, apply a strict allow-list filter (JEP 290):
```java
// JVM-wide filter - reject everything not explicitly permitted
-Djdk.serialFilter=com.example.model.*;java.base/*;!*
```
Or per-stream via `ObjectInputFilter`. Filtering is mitigation, not a fix — removal remains the goal.

**Common production bugs:** `InvalidClassException` after a deployment, because a class changed and `serialVersionUID` was never declared explicitly. Cached or queued data serialized by the previous version becomes unreadable, which can look like data loss.

**Real-world use case:** Java serialization still appears in HTTP session replication, some caching layers, and older RMI-based systems. Each of these is a place where poisoned data could reach a deserializer — audit them specifically.

**Deprecated approaches to avoid:** Serializing objects into a database column or message queue payload. It couples the stored data to your class structure permanently, blocks language and version migration, and expands the attack surface. Store a versioned data format instead.

---

### 9.12 Resource Management

**Best practices:** Every `AutoCloseable` goes in a try-with-resources header. There is no legitimate reason for a manual `finally { stream.close(); }` in new code.

**Common production bugs:** Descriptor exhaustion presenting as unrelated failures. Once the limit is reached, the next operation to open *anything* fails — a socket connection, a log rotation, a class load. The stack trace points at innocent code, sending investigation in the wrong direction.

> ⚠️ **Warning:** "Too many open files" almost never occurs where the leak is. Diagnose it by listing open descriptors (`ls -l /proc/<pid>/fd | head -50` on Linux) — the repeated entries identify the leaking resource type directly, which is far faster than reading code.

**Monitoring:** Alert on open descriptor count as a percentage of the limit. Container defaults are often far lower than on bare metal, so a service that ran fine on a VM can exhaust descriptors quickly after containerization.

**Real-world use case:** Connection pool leaks are the same failure class at a higher level. HikariCP's `leakDetectionThreshold` logs a stack trace for connections held beyond a threshold, identifying the leak site precisely — enable it in non-production environments as standard practice.

**Testing advice:** Assert descriptor counts in integration tests for I/O-heavy code paths. Capturing the count before and after an operation and asserting it returns to baseline catches leaks at the point they're introduced, rather than weeks later in production.

---

[[#📖 Master Table of Contents|⬆ Back to top]]

*End of Group 9. Next: Modern Java Features.*

---

## 10. Modern Java Features

### Table of Contents (this group)
- [[#10.1 The Java Release Model]]
- [[#10.2 var and Local Variable Type Inference]]
- [[#10.3 Text Blocks]]
- [[#10.4 Records]]
- [[#10.5 Sealed Classes]]
- [[#10.6 Pattern Matching for instanceof]]
- [[#10.7 Switch Expressions and Pattern Matching for switch]]
- [[#10.8 Enhanced Enums and Utility Methods]]
- [[#10.9 The HTTP Client]]
- [[#10.10 Structured Concurrency and Scoped Values]]

---

### 10.1 The Java Release Model

**Best practices:** Target the most recent LTS your dependencies support, and treat upgrades as routine maintenance rather than projects. Teams that skip several LTS versions face compounding migration cost; teams that upgrade steadily rarely encounter difficulty.

**Real-world use case:** The 8-to-11 migration is the genuinely hard one — removed internal APIs, the module system's stricter encapsulation, and removed Java EE modules (JAXB, JAX-WS) all break real code. Later upgrades (11→17→21) are substantially smoother, so the effort curve is front-loaded.

**Common production bugs:** Build and runtime JDK version mismatch, producing `UnsupportedClassVersionError` at deployment. Pin both explicitly in CI and container images, and use `--release` rather than `-source`/`-target` so the compiler validates against the correct API level.

> ⚠️ **Warning:** `-source`/`-target` do *not* prevent using APIs that don't exist on the target version — code can compile against a newer JDK's API and fail at runtime with `NoSuchMethodError`. `--release 17` validates against the actual Java 17 API surface and is the correct flag.

**Testing advice:** Run a CI matrix across your current and next LTS during migration windows. Discovering incompatibilities in CI is dramatically cheaper than discovering them at deployment.

---

### 10.2 var and Local Variable Type Inference

**Best practices:** Use `var` where the initializer makes the type obvious — constructors, factory methods with self-evident names, and enhanced for loops. Avoid it where the reader would have to look elsewhere to know the type.

**Readability:** Code review happens in browsers without IDE type inference. A `var result = service.process(input)` that's clear in IntelliJ can be opaque in a pull request diff. This is the strongest practical argument for restraint.

> ✅ **Best Practice:** A useful team rule: `var` is fine when the type name appears on the right-hand side (`var list = new ArrayList<String>()`), and questionable when it doesn't (`var x = compute()`). This is objective enough to apply consistently in review.

**Common production bugs:** `var` inferring a concrete type where an interface was intended, quietly coupling code to an implementation. `var map = new HashMap<String, String>()` gives `HashMap`, so a later switch to `TreeMap` requires touching the declaration — a small thing individually, but it works against the interface-based design guidance from Group 3.

**Maintainability:** Avoid `var` in long methods where the declaration and usage are far apart. The inference is only helpful when the initializer is visible alongside the use.

---

### 10.3 Text Blocks

**Best practices:** Use text blocks for embedded SQL, JSON test fixtures, GraphQL queries, and multi-line templates. They eliminate escaping errors that are easy to introduce and hard to spot in concatenated strings.

**Real-world use case:** SQL in repository classes becomes genuinely readable:
```java
private static final String FIND_ACTIVE = """
        SELECT u.id, u.name, u.email
        FROM users u
        JOIN accounts a ON a.user_id = u.id
        WHERE u.active = true
          AND a.status = ?
        ORDER BY u.created_at DESC
        """;
```
This is far easier to review — and to paste into a database console for testing — than the concatenated equivalent.

**Security implications:** Text blocks make SQL readable, which unfortunately also makes string interpolation more tempting. Never build SQL by interpolating values into a text block; use parameterized queries. The readability improvement should not become an injection vector.

> ⚠️ **Warning:** `"""SELECT * FROM users WHERE name = '%s'""".formatted(input)` is SQL injection with better formatting. Text blocks change nothing about parameter binding requirements.

**Common production bugs:** Trailing-whitespace stripping breaking fixed-width output formats or signature computation. If exact bytes matter — a canonical string for hashing, a fixed-width report — verify the produced content rather than assuming the source layout is preserved.

**Testing advice:** Where a text block's exact content is significant, assert against it explicitly. Indentation behavior is subtle enough that a visual check isn't sufficient.

---

### 10.4 Records

**Best practices:** Use records for DTOs, API request and response bodies, value objects, query projections, and event payloads. They're the right default for any class whose purpose is carrying data.

**Real-world use case:** Records pair naturally with Jackson for API layers:
```java
public record CreateOrderRequest(
        @NotBlank String customerId,
        @NotEmpty List<OrderLine> lines,
        @Positive BigDecimal total) { }
```
Jackson supports record deserialization natively in current versions, and Bean Validation annotations work on components. This replaces a class with a constructor, getters, `equals`, `hashCode`, and `toString` — and removes the possibility of getting any of them wrong.

> ⚠️ **Warning:** Records are shallowly immutable. `record Team(String name, List<Player> players)` lets any caller mutate the list. Defensive-copy mutable components in a compact constructor:
> ```java
> record Team(String name, List<Player> players) {
>     Team { players = List.copyOf(players); }
> }
> ```
> Without this, the record's `equals`/`hashCode` can change after construction — which breaks it as a map key, exactly as described in Group 2.

**Common production bugs:** Attempting to use records as JPA entities. Hibernate requires a no-arg constructor, non-final fields, and proxyable classes. Records provide none of these. Use them for projections and DTOs, and keep entities as ordinary classes.

**Anti-pattern:** Adding derived or computed state to a record's components. Components define identity via `equals`/`hashCode`, so a cached or derived field participating in equality causes surprising behavior. Compute derived values in methods instead.

---

### 10.5 Sealed Classes

**Best practices:** Seal hierarchies representing genuinely closed domains — payment methods, order states, result types, protocol messages. The compile-time exhaustiveness guarantee is the payoff, so it's most valuable where new cases are added over time and must be handled everywhere.

**Real-world use case:** Result types are the clearest win:
```java
public sealed interface PaymentResult permits Approved, Declined, RequiresAction { }

// Every switch over PaymentResult must handle all three.
// Adding a fourth case breaks compilation everywhere it's handled -
// which is exactly what you want.
```
Compare this with an enum plus a nullable detail field, where forgetting a case is a runtime bug found in production.

**Maintainability:** The exhaustiveness break on adding a subtype is a feature, not friction. It converts "find every place that handles this type" from a grep exercise into a compiler task — genuinely valuable in a large codebase.

**Common production bugs:** Sealing a type that a downstream team or plugin needs to extend, forcing an awkward `non-sealed` escape hatch or a refactor. Confirm the domain is genuinely closed before sealing a public API type.

**Modern recommendations:** Sealed interfaces plus records give Java proper algebraic data types, which model domain states far more precisely than inheritance hierarchies with nullable fields. This combination is one of the strongest reasons to move to Java 17+.

---

### 10.6 Pattern Matching for instanceof

**Best practices:** Adopt it universally in place of test-then-cast — there's no case where the old form is preferable. It's the lowest-risk modernization available and reduces both line count and cast-failure surface.

**Real-world use case:** `equals()` implementations collapse to a single expression:
```java
@Override
public boolean equals(Object o) {
    return o instanceof Order other
        && id.equals(other.id)
        && status == other.status;
}
```
The null check is implicit (`instanceof` is false for null), the cast is gone, and the whole contract fits on one screen.

**Maintainability:** Flow scoping enables guard-clause style without nesting, which connects to the readability guidance in Group 2:
```java
public void process(Object event) {
    if (!(event instanceof OrderEvent e)) return;
    // e is in scope for the rest of the method
    handle(e);
}
```

**Anti-pattern:** Long `instanceof` chains dispatching on type. Pattern matching makes them readable, which can disguise a design problem — if behavior belongs with the type, use polymorphism; if it genuinely belongs outside, use a sealed hierarchy with a pattern switch so the compiler enforces completeness.

---

### 10.7 Switch Expressions and Pattern Matching for switch

**Best practices:** Prefer switch expressions over switch statements in all new code. The absence of fall-through eliminates a defect class outright, and required exhaustiveness catches unhandled cases at compile time.

**Common production bugs:** The classic missing-`break` fall-through, still present in legacy code and still causing incidents when a new case is added years later by someone unaware of the risk. Migrating to arrow syntax removes the possibility permanently — a worthwhile mechanical refactor.

> ✅ **Best Practice:** When migrating a switch statement to an expression, the compiler enforces exhaustiveness — which frequently reveals cases the original code silently fell through on. Treat those revelations as bug discoveries, not migration friction.

**Real-world use case:** Sealed hierarchy plus pattern switch for state handling gives compile-time completeness:
```java
String render(PaymentResult r) {
    return switch (r) {
        case Approved(var txId) -> "Approved: " + txId;
        case Declined(var reason) -> "Declined: " + reason;
        case RequiresAction(var url) -> "Redirect to " + url;
    };   // no default - adding a case breaks this until handled
}
```

**Maintainability:** Guard ordering is a real review concern. A broad case placed before a narrower guarded one makes the guard unreachable, and the compiler catches only the clearest instances. Order specific-to-general as a discipline, mirroring catch-block ordering from Group 5.

**Modern recommendations:** For codebases on Java 21, sealed types plus pattern switches replace the visitor pattern in most cases, with far less ceremony and better compile-time guarantees.

---

### 10.8 Enhanced Enums and Utility Methods

**Best practices:** Prefer JDK methods over third-party equivalents where they exist. Dropping Guava or Apache Commons dependencies used only for `List.of()`-equivalents or `isBlank()` reduces the dependency surface, which matters for both security patching and build time.

**Common production bugs:** `trim()` failing to remove Unicode whitespace from pasted input. Users copying from web pages, PDFs, or word processors routinely introduce non-breaking spaces, which `trim()` leaves intact — producing values that look identical but fail equality checks and validation. `strip()` handles them correctly.

> ⚠️ **Warning:** Any user-input normalization using `trim()` should move to `strip()`. Non-breaking spaces in pasted data cause lookup failures where the value visually matches but doesn't compare equal — a genuinely confusing support ticket.

**Real-world use case:** `List.copyOf()` for defensive copies at API boundaries, which produces a true immutable snapshot rather than the live view `Collections.unmodifiableList` returns:
```java
public Order(List<OrderLine> lines) {
    this.lines = List.copyOf(lines);   // independent, immutable
}
```

**Common production bugs:** Migrating from `Arrays.asList()` to `List.of()` in code that passes null elements, which then throws `NullPointerException` at construction. `List.of()` is null-hostile by design, and this surfaces immediately at runtime rather than at compile time.

**Modern recommendations:** Sequenced collections (Java 21) finally give `List`, `SortedSet`, and `LinkedHashMap` consistent `getFirst()`, `getLast()`, and `reversed()` methods, replacing a long-standing set of awkward idioms.

---

### 10.9 The HTTP Client

**Best practices:** Create one `HttpClient` per application (or per distinct configuration) and inject it. It's immutable, thread-safe, and holds a connection pool — per-request creation discards pooling and leaks resources under load.

> ⚠️ **Warning:** Both `connectTimeout` and the per-request `timeout` default to *infinite*. An unresponsive server holds a thread indefinitely, and under load this saturates the thread pool and takes down endpoints unrelated to the failing dependency — the exact failure mode described in Group 7. Always set both.

```java
HttpClient client = HttpClient.newBuilder()
    .connectTimeout(Duration.ofSeconds(5))
    .executor(namedExecutor)            // explicit, named, sized
    .build();

HttpRequest req = HttpRequest.newBuilder(uri)
    .timeout(Duration.ofSeconds(10))    // per-request, also required
    .build();
```

**Common production bugs:** Relying on the default executor for async requests, which is an unbounded cached thread pool with unnamed threads. Under load this creates unbounded threads; in a thread dump the threads are unidentifiable. Supply your own executor with a naming factory, per the guidance in Group 7.

**Scalability concerns:** The built-in client has no retry, circuit breaker, or bulkhead support. For production integrations, wrap it with Resilience4j or use a client that provides these — an unprotected dependency call is a propagation path for downstream failures.

**Real-world use case:** In Spring applications, `RestClient` (Spring 6.1+) offers a similar synchronous API with interceptors, error handling, and observability integration. Prefer it there; the JDK client is best for libraries and standalone applications avoiding framework dependencies.

**Monitoring:** Instrument outbound calls with timing, status codes, and failure counts per dependency. Outbound call latency is one of the most common root causes of service degradation, and it's invisible without explicit instrumentation.

---

### 10.10 Structured Concurrency and Scoped Values

**Best practices:** Track the preview status against your target JDK before adopting. These APIs have changed across preview rounds, so code written against an earlier round may not compile on a later JDK — plan for that if you adopt early.

**Real-world use case:** Request-scoped fan-out is the canonical fit — a request needing data from three services, where any failure should cancel the rest:
```java
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    var profile = scope.fork(() -> profileService.get(id));
    var orders  = scope.fork(() -> orderService.list(id));
    var prefs   = scope.fork(() -> prefsService.get(id));

    scope.join();
    scope.throwIfFailed(ServiceException::new);

    return assemble(profile.get(), orders.get(), prefs.get());
}
```
Compared with `CompletableFuture.allOf`, failure cancellation is automatic and no subtask can outlive the block — removing the leaked-work failure mode.

**Common production bugs:** With plain executors, a failed sibling leaves other subtasks running and consuming resources for a result nobody will use. At scale this wastes substantial capacity, and it's invisible because nothing errors — the work simply happens pointlessly.

**Memory considerations:** `ScopedValue` matters increasingly with virtual threads. A million virtual threads each carrying `ThreadLocal` values is a serious memory concern, and pooled-thread `ThreadLocal` leaks are both a memory and data-exposure risk (Group 7). Scoped values are immutable, automatically unbound, and inherited by structured subtasks — addressing all three.

**Migration guidance:** Where request context is currently propagated via `ThreadLocal` (security context, tenant ID, correlation ID), scoped values are the intended replacement in virtual-thread codebases. Note that MDC-based logging context does not propagate automatically across async boundaries either way, and needs explicit handling.

---

[[#📖 Master Table of Contents|⬆ Back to top]]

*End of Group 10. Next: Reflection & Annotations.*

---

## 11. Reflection & Annotations

### Table of Contents (this group)
- [[#11.1 What Is Reflection?]]
- [[#11.2 The Class Object]]
- [[#11.3 Inspecting Fields, Methods, and Constructors]]
- [[#11.4 Creating Objects and Invoking Methods Reflectively]]
- [[#11.5 Accessing Private Members]]
- [[#11.6 What Are Annotations?]]
- [[#11.7 Built-in Annotations]]
- [[#11.8 Creating Custom Annotations]]
- [[#11.9 Retention and Target]]
- [[#11.10 Reading Annotations at Runtime]]
- [[#11.11 Annotation Processing at Compile Time]]
- [[#11.12 Dynamic Proxies]]
- [[#11.13 MethodHandles and VarHandles]]

---

### 11.1 What Is Reflection?

**Best practices:** Treat reflection as a framework-building tool, not an application-code tool. In business logic it almost always signals a design that an interface, a factory, or a strategy map would express better — with compile-time checking intact.

**Performance considerations:** Cache reflective lookups aggressively. `getMethod()` searches the type hierarchy on every call, so a lookup inside a request path is a measurable cost:
```java
private static final Method HANDLER = resolveOnce();   // cached at class init
```

**Common production bugs:** Reflection breaking silently after a refactor. Renaming a field or method updates every compile-time reference but leaves reflective string lookups pointing at nothing — failing at runtime, often on a rarely-exercised path.

> ⚠️ **Warning:** Reflective code is invisible to IDE refactoring, "find usages," and static analysis. A field accessed only reflectively looks unused and gets deleted. Where reflection is unavoidable, add a test that exercises it so the failure surfaces in CI rather than production.

**Security implications:** Never build reflective lookups from untrusted input. `Class.forName(userSuppliedName)` allows loading and initializing arbitrary classes — a code-execution vector closely related to the deserialization risks in Group 9.

---

### 11.2 The Class Object

**Best practices:** Prefer class literals (`Foo.class`) over `Class.forName("com.example.Foo")` wherever the type is known at compile time. Literals are refactor-safe and fail at compile time rather than runtime.

**Common production bugs:** `Class.forName()` on a string from configuration, failing at startup after a package rename that the build didn't catch. This is a frequent cause of "works on my machine, fails in the deployed jar" issues, particularly with shaded or relocated dependencies.

**Real-world use case:** `Class<T>` tokens remain the standard workaround for erasure (Group 4) — `applicationContext.getBean(UserService.class)` and `mapper.readValue(json, User.class)` both carry runtime type information the signature alone has lost.

**Debugging tips:** When a `ClassCastException` reports that a type cannot be cast to itself, the cause is two class loaders having loaded the same class (Group 8). Compare `getClassLoader()` on both objects to confirm — this is common in application servers and hot-reload environments.

---

### 11.3 Inspecting Fields, Methods, and Constructors

**Best practices:** When walking a hierarchy for fields, always filter synthetic members. Bridge methods, lambda bodies, and inner-class back-references appear in results and will corrupt any generic mapping that processes them:
```java
Arrays.stream(clazz.getDeclaredFields())
      .filter(f -> !f.isSynthetic())
      .filter(f -> !Modifier.isStatic(f.getModifiers()))
      .forEach(this::map);
```

**Common production bugs:** Serializers relying on field declaration order, which the JLS does not guarantee. Code that produced stable output on one JDK version emits a different field order after an upgrade — breaking golden-file tests, cached checksums, or wire formats that assumed stability.

> ⚠️ **Warning:** Never depend on `getDeclaredFields()` ordering for anything persisted or transmitted. If field order matters, define it explicitly through annotations or a configured list.

**Performance considerations:** Full hierarchy traversal is expensive enough to matter at startup when applied to many classes. Cache the resolved field list per class in a `ConcurrentHashMap` — this is precisely what Jackson and Hibernate do internally.

**Maintainability:** Records expose `getRecordComponents()`, which is more precise and stable than field reflection for the DTO use cases from Group 10 — prefer it when handling records.

---

### 11.4 Creating Objects and Invoking Methods Reflectively

**Best practices:** Always unwrap `InvocationTargetException` before logging or rethrowing. The wrapper contributes nothing diagnostic and pushes the real cause a layer deeper in the stack trace, which matters during incident triage.

```java
catch (InvocationTargetException e) {
    Throwable cause = e.getCause();
    log.error("Handler {} failed", method.getName(), cause);
    throw new HandlerException("Invocation failed", cause);   // preserve the chain, Group 5
}
```

**Common production bugs:** Reflective instantiation of a class whose constructor signature changed, producing `NoSuchMethodException` at runtime. Since the lookup is by exact parameter types, an added parameter breaks it silently at compile time and loudly at runtime.

**Deprecated approaches to avoid:** `Class.newInstance()` is deprecated since Java 9 and should be replaced wherever it appears in legacy code. It propagated constructor exceptions unwrapped, defeating checked-exception analysis — the replacement is `getDeclaredConstructor().newInstance()`.

**Performance considerations:** Reflective invocation boxes all arguments into an `Object[]`, so primitive-heavy calls allocate per invocation. In hot paths this shows up as GC pressure (Group 8) rather than obvious CPU cost — another reason to prefer `MethodHandle` or generated code there.

---

### 11.5 Accessing Private Members

**Best practices:** Avoid `setAccessible(true)` in application code entirely. Its legitimate uses are framework-level — ORM field population, deserialization — and in your own code it usually means the class's API needs adjusting rather than bypassing.

> ⚠️ **Warning:** Since Java 16, deep reflection into JDK internal packages throws `InaccessibleObjectException` by default. This is the single most common cause of libraries breaking on JDK upgrades — older versions of Mockito, Spring, Hibernate, and various serialization libraries all needed updates. Before upgrading, verify dependency compatibility rather than reaching for `--add-opens`.

**Migration guidance:** When a library fails on a newer JDK with an access error:
1. Check for a newer library version — this is almost always the correct fix
2. Only if none exists, add a *narrowly scoped* `--add-opens` for the specific package
3. Record it as technical debt with a removal plan

```bash
# Narrow - acceptable as a temporary bridge
--add-opens java.base/java.lang=ALL-UNNAMED

# Avoid - reopens everything, defeating the encapsulation entirely
--add-opens java.base/ALL-UNNAMED=ALL-UNNAMED
```

**Security implications:** Access modifiers are a design mechanism, not a security boundary. Never rely on `private` to protect secrets from code running in the same JVM — reflection can reach them. Genuine isolation requires the module system, a separate process, or not holding the secret in memory longer than needed.

**Testing advice:** Reflection to access private members in tests is a common shortcut that couples tests to implementation detail. It makes refactoring harder and gives false confidence — prefer testing through the public API, or reconsider whether the method should be package-private for testability.

---

### 11.6 What Are Annotations?

**Best practices:** Keep annotation-driven behavior discoverable. A method whose behavior depends on three annotations from different frameworks is hard to reason about during an incident — document the non-obvious ones and prefer explicit code where the indirection outweighs the concision.

**Common production bugs:** Annotations that silently do nothing. The three recurring causes are all worth checking first when a declarative feature "isn't working":

| Symptom | Cause |
|---|---|
| `@Transactional` ignored | Self-invocation, or `final` method |
| `@Cacheable` ignored | Caching not enabled via `@EnableCaching` |
| Custom annotation ignored | Retention not `RUNTIME` |

> ⚠️ **Warning:** Annotation-based features fail *silently* by design — an unread annotation is just metadata. There's no error, no warning, and no log line. Write an integration test asserting the behavior actually occurs, not merely that the annotation is present.

**Maintainability:** Annotation-heavy configuration distributes behavior across the codebase. This is usually a net positive over XML, but it means understanding a class requires knowing what each annotation triggers — a real onboarding cost worth acknowledging in code review standards.

---

### 11.7 Built-in Annotations

**Best practices:** Enforce `@Override` via compiler settings or static analysis. It costs nothing and catches accidental overloads that would otherwise silently never run — a genuine correctness bug, not a style issue.

**Common production bugs:** Missing `@Override` on a method intended to override a superclass method whose signature later changed. The subclass method quietly becomes an unrelated overload, the parent's implementation runs instead, and behavior changes with no compilation error anywhere.

**Best practices for deprecation:** Use the full form when deprecating public API, so consumers can plan:
```java
@Deprecated(since = "3.2", forRemoval = true)
public void legacyMethod() { }
```
`forRemoval = true` produces a stronger compiler warning and communicates genuine scheduled removal rather than vague discouragement — meaningful when other teams depend on your library.

> ⚠️ **Warning:** `@SuppressWarnings` at class or method level silences warnings for everything within scope, including code added later. Apply it to the narrowest possible element — ideally a single local variable declaration — and add a comment explaining why the warning is safe to ignore.

**Maintainability:** Periodically audit `@SuppressWarnings("unchecked")` occurrences. Each represents a place where the compiler's type safety was overridden by assertion, and some will have become incorrect as the surrounding code evolved.

---

### 11.8 Creating Custom Annotations

**Best practices:** Before defining a custom annotation, confirm no standard one fits. Bean Validation (`@NotNull`, `@Size`), JSR-330 (`@Inject`, `@Named`), and framework annotations cover most needs, and standard annotations interoperate with existing tooling.

**Real-world use case:** Composed annotations reduce repetition and centralize convention:
```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Service
@Transactional
@Validated
public @interface DomainService { }
```
One annotation now carries three behaviors consistently, and changing the convention means editing one declaration rather than every service class. Note this relies on Spring's meta-annotation resolution — plain reflection won't see through it.

**Common production bugs:** Forgetting `@Retention(RUNTIME)` on an annotation a framework must read. The default `CLASS` retention means reflection finds nothing, and because annotations fail silently, the feature simply doesn't happen with no error to trace.

**Maintainability:** Design annotation elements for evolution. Adding an element with a default is backward compatible; adding one without a default breaks every existing usage. Always supply defaults on new elements added to a released annotation.

**Testing advice:** Test the annotation's *effect*, not its presence. Asserting `isAnnotationPresent` verifies nothing about whether the behavior actually occurs — which is precisely the failure mode that makes annotation bugs hard to catch.

---

### 11.9 Retention and Target

**Best practices:** Choose retention deliberately rather than accepting the default. `SOURCE` for compile-time-only markers, `RUNTIME` for anything a framework reads. `CLASS` is rarely what you want and is the default purely for historical reasons.

**Common production bugs:** The retention default catching people out is common enough to be worth a checklist item in code review: any annotation intended for reflective discovery needs `@Retention(RUNTIME)` explicitly stated.

**Best practices for targets:** Constrain `@Target` narrowly. An annotation applicable to `TYPE`, `METHOD`, and `FIELD` when it only makes sense on methods invites misapplication that fails silently at runtime rather than at compile time.

**Real-world use case:** `TYPE_USE` enables static analysis tooling — the Checker Framework and NullAway use it to verify nullness at compile time:
```java
@Nullable String name;                    // field annotation
List<@NonNull String> names;              // TYPE_USE - inside the generic argument
```
The second form requires `TYPE_USE` and is what makes generic-aware null checking possible.

**Common production bugs:** Expecting `@Inherited` to propagate method-level annotations to overriding methods. It applies only to class-level annotations via the superclass chain, so an overriding method must repeat any annotation it needs — a frequent source of `@Transactional` unexpectedly not applying in a subclass.

---

### 11.10 Reading Annotations at Runtime

**Best practices:** Perform annotation scanning once at startup and cache the result. Repeated reflective annotation lookups in a request path are pure overhead, since the metadata cannot change at runtime.

**Performance considerations:** Classpath scanning is a significant Spring Boot startup cost. Narrowing `@ComponentScan` to specific packages rather than scanning from a broad root measurably improves startup, which matters for autoscaling and scale-to-zero deployments (Group 8).

```java
@SpringBootApplication(scanBasePackages = "com.example.orders")   // narrow, not the whole root
```

**Real-world use case:** Micronaut and Quarkus resolve annotations at *build time* via annotation processors rather than runtime scanning. This is the primary reason their startup times are an order of magnitude faster than reflection-based Spring — a genuine architectural difference, not just optimization.

**Common production bugs:** Custom framework code using plain `getAnnotation()` and failing to find annotations applied via composed meta-annotations. Spring's `AnnotatedElementUtils.findMergedAnnotation()` performs the recursive resolution; plain reflection does not.

**Debugging tips:** When a framework doesn't detect your annotated class, check three things in order: retention policy, whether the package is scanned, and whether meta-annotation resolution is needed. That sequence resolves most cases quickly.

---

### 11.11 Annotation Processing at Compile Time

**Best practices:** Prefer compile-time generation over runtime reflection where the tooling exists. MapStruct instead of a reflective mapper, Dagger instead of reflective injection — you gain compile-time verification, debuggable code, and zero runtime cost.

**Real-world use case:** MapStruct generates plain assignment code, which is both faster and inspectable:
```java
@Mapper(componentModel = "spring")
public interface OrderMapper {
    OrderDto toDto(Order order);
}
// Generated: this.dto.setId(order.getId()); ... - no reflection, steps into the debugger
```
A mismatch between source and target fields becomes a *compile* error, catching mapping bugs that a reflective mapper would surface only at runtime with specific data.

**Common production bugs:** Lombok breaking on JDK upgrades. Because it manipulates compiler internals rather than using the public processing API, each major JDK release risks incompatibility until Lombok updates.

> ⚠️ **Warning:** Lombok is a build-critical dependency that depends on non-public compiler APIs. Verify Lombok compatibility *before* planning a JDK upgrade — it has repeatedly been the blocking item in migrations, and there's no workaround beyond waiting for a release or removing it.

**Debugging tips:** Configure your IDE to show generated sources (typically `target/generated-sources/annotations`). Without this, stepping into generated code fails and the build appears to produce classes from nowhere.

**Testing advice:** Generated code should still be covered by tests exercising the behavior. A mapper generated correctly can still map the wrong fields if the interface declares the wrong contract.

---

### 11.12 Dynamic Proxies

**Best practices:** Never mark Spring beans or their public methods `final`. CGLIB proxying works by subclassing, so `final` silently disables it — along with every annotation that depends on proxying.

> ⚠️ **Warning:** A `final` class or method in a Spring bean causes annotations like `@Transactional`, `@Cacheable`, and `@Async` to stop working, usually with no error at all. Static analysis rules flagging `final` on `@Component`-annotated classes are worth enabling, since the failure is otherwise invisible.

**Common production bugs:** Self-invocation defeating AOP. This is the single most frequent Spring surprise — a `@Transactional` method called internally runs without a transaction, so failures don't roll back and partial writes persist. In a financial or order-processing context this is a correctness bug with real consequences.

```java
// Broken - inner() runs without a transaction
public void outer() { this.inner(); }

// Fix 1 - move to a separate bean so the call crosses a proxy boundary
public void outer() { otherService.inner(); }

// Fix 2 - self-injection (works, but signals a design smell)
@Autowired private OrderService self;
public void outer() { self.inner(); }
```

**Debugging tips:** Proxy frames (`$Proxy`, `$$EnhancerBySpringCGLIB$$`) clutter stack traces. Configure the logging framework to shorten or filter framework packages so application frames stand out — the same guidance as reading traces in Group 5.

**Performance considerations:** Each proxied call adds handler dispatch plus reflective invocation. Negligible for service-layer calls, but meaningful if applied to a method invoked millions of times — worth checking before annotating something in a tight loop.

**Modern recommendations:** Where proxy limitations become genuinely problematic, AspectJ load-time or compile-time weaving modifies bytecode directly and intercepts self-invocation too. It costs build complexity, so reserve it for cases where proxying is demonstrably insufficient.

---

### 11.13 MethodHandles and VarHandles

**Best practices:** Store `MethodHandle` instances in `static final` fields. The JIT treats them as constants and can inline through them; a handle looked up repeatedly or held in an instance field forfeits most of the performance advantage.

**Real-world use case:** `VarHandle` replaces `sun.misc.Unsafe` for atomic field access without an `AtomicInteger` wrapper — useful in high-performance data structures where per-field allocation matters:
```java
private static final VarHandle COUNT;
static {
    try {
        COUNT = MethodHandles.lookup().findVarHandle(Node.class, "count", int.class);
    } catch (ReflectiveOperationException e) {
        throw new ExceptionInInitializerError(e);
    }
}
// CAS on a plain int field - no AtomicInteger object per instance
COUNT.compareAndSet(node, expected, updated);
```

**Migration guidance:** Code using `sun.misc.Unsafe` should move to `VarHandle`. `Unsafe` is an internal API subject to removal, and the module system already restricts access to it — this is a common blocker in JDK upgrades, connecting directly to the strong-encapsulation issues in 11.5.

**Common production bugs:** `WrongMethodTypeException` from `invokeExact` with mismatched types, including boxing differences. `invokeExact` is unforgiving by design; use `invoke` when types may need conversion, accepting the modest cost.

**Performance considerations:** Don't reach for method handles by default. Ordinary reflection with cached `Method` objects is adequate for the vast majority of framework code, and the verbosity of the handle API is a real maintenance cost. Reserve it for measured hot paths.

**Debugging tips:** Method handle stack traces are harder to read than reflective ones, since much of the machinery is JVM-internal. Factor into the decision when choosing between the two for code that will need production diagnosis.

---

[[#📖 Master Table of Contents|⬆ Back to top]]

*End of Group 11. Next: Java Platform Module System (JPMS).*

---

## 12. Java Platform Module System (JPMS)

### Table of Contents (this group)
- [[#12.1 What Is JPMS?]]
- [[#12.2 The module-info.java Descriptor]]
- [[#12.3 requires]]
- [[#12.4 exports]]
- [[#12.5 opens]]
- [[#12.6 Services: uses and provides]]
- [[#12.7 The Module Path vs the Classpath]]
- [[#12.8 Automatic and Unnamed Modules]]
- [[#12.9 Strong Encapsulation]]
- [[#12.10 jlink and Custom Runtimes]]
- [[#12.11 Migration Strategy]]

---

### 12.1 What Is JPMS?

**Best practices:** Make an explicit, documented decision about whether to modularize rather than drifting into it. For most applications the answer is no, and that's a legitimate engineering choice — not technical debt.

**Real-world use case:** Modules genuinely pay off in three situations: publishing a library where a small, enforced API surface matters; building minimal container runtimes with `jlink`; and large monorepos where architectural boundaries need compiler enforcement rather than convention.

**Maintainability:** Where modules aren't used, other tools enforce boundaries — ArchUnit tests, Maven module structure, or Gradle's `api` versus `implementation` configurations. These give much of the architectural benefit at a fraction of the cost.

> ✅ **Best Practice:** For a typical Spring Boot service, ArchUnit rules enforcing package dependencies deliver most of the architectural value of modules with none of the migration friction:
> ```java
> ArchRule rule = noClasses().that().resideInAPackage("..controller..")
>     .should().dependOnClassesThat().resideInAPackage("..repository..");
> ```

**Common production bugs:** Split packages surfacing only when someone attempts the module path. Legacy JARs frequently share package names, which is silently tolerated on the classpath and rejected outright on the module path.

---

### 12.2 The module-info.java Descriptor

**Best practices:** If you modularize, keep the descriptor minimal and deliberate. Export the API package and nothing else; add `opens` only for the specific packages a framework actually reflects into, qualified to that framework where possible.

**Maintainability:** The descriptor is genuinely useful documentation — a reader sees the entire dependency and API surface in twenty lines. That's a real benefit for libraries with many consumers.

**Common production bugs:** Build tools requiring configuration to place dependencies on the module path rather than the classpath. Maven's `maven-compiler-plugin` and Gradle both need explicit setup, and misconfiguration produces confusing "module not found" errors at compile time despite the dependency being declared.

**Testing advice:** Test code frequently needs access to non-exported packages. The standard approaches are a `module-info.java` in the test source set with `--add-opens` for tests, or placing tests on the classpath via the build tool's patch-module support. Plan this before modularizing, since retrofitting test access is awkward.

---

### 12.3 requires

**Best practices:** Use `requires transitive` deliberately and sparingly. Every transitive dependency becomes part of your API contract — removing one later is a breaking change for consumers, even if your own code no longer uses it.

**Common production bugs:** Cyclic dependencies discovered during modularization. Classpath code accumulates cycles freely; the module system rejects them, so migration often forces extracting a shared module. This is usually a genuine design improvement, but it's unplanned work.

**Real-world use case:** `requires static` suits compile-time-only dependencies such as annotation libraries:
```java
requires static org.jetbrains.annotations;   // needed to compile, absent at runtime
```
This keeps annotation JARs out of the runtime image, which matters when using `jlink`.

**Maintainability:** Run `jdeps` periodically to detect declared-but-unused `requires` entries. They inflate the module graph and, with `transitive`, expand your API contract without benefit.

---

### 12.4 exports

**Best practices:** Export the minimum. The whole value of modularizing a library is that `com.example.lib.internal` becomes genuinely unreachable, so consumers cannot build dependencies on your implementation details.

**Real-world use case:** Library authors gain the freedom to refactor internals without semver implications. On the classpath, any `public` class is effectively public API because someone will use it; with modules, non-exported packages are truly private.

**Common production bugs:** Qualified exports coupling a provider to named consumers. `exports com.example.spi to com.example.plugin` requires editing the provider whenever a new consumer appears — awkward when the provider and consumers ship on different schedules.

> ⚠️ **Warning:** Qualified exports create a build-order coupling: the provider must know its consumers' module names. For genuinely extensible SPI packages, an unqualified export plus documentation is usually more practical than a qualified one that needs constant updating.

**Maintainability:** Treat adding an export as an API change subject to the same review as adding a public method — because that's exactly what it is.

---

### 12.5 opens

**Best practices:** Use qualified `opens` targeting the specific framework rather than opening to everyone. `opens com.example.entity to org.hibernate.orm.core` documents precisely why the package is open and limits the exposure.

**Common production bugs:** `InaccessibleObjectException` at runtime after modularizing, because entity or DTO packages were exported but not opened. The error appears only when the framework first reflects into the class — often deep into a request path rather than at startup.

> ⚠️ **Warning:** This failure mode is deferred. Compilation succeeds, startup succeeds, and the error surfaces the first time Hibernate loads an entity or Jackson deserializes a payload. Integration tests exercising real serialization and persistence paths are essential when modularizing — unit tests will not catch it.

**Real-world use case:** For applications heavily dependent on reflective frameworks, `open module` is a pragmatic compromise:
```java
open module com.example.app {
    requires spring.boot;
    exports com.example.app.api;
}
```
You keep declared dependencies and a controlled compile-time API while sidestepping per-package `opens` maintenance. It forfeits reflective encapsulation, which for an application (as opposed to a library) is rarely the point.

**Debugging tips:** The `InaccessibleObjectException` message names both the module that must open the package and the module requesting access — it tells you the exact directive to add.

---

### 12.6 Services: uses and provides

**Best practices:** Prefer services for genuine plugin boundaries — payment providers, codecs, storage backends — where implementations vary by deployment. For ordinary dependency wiring inside an application, Spring's container is simpler and better understood by most teams.

**Real-world use case:** JDBC driver discovery is the most widely deployed example. Modern drivers register via `ServiceLoader`, which is why `Class.forName("com.mysql.jdbc.Driver")` is unnecessary and has been for years — though it still appears in tutorials and copied code.

**Common production bugs:** A provider present on the path but never discovered, because the consumer module omitted `uses`. There's no error — `ServiceLoader` simply returns nothing, so the feature silently doesn't work. This mirrors the silent-failure pattern of annotations in Group 11.

**Debugging tips:** When a provider isn't found, verify three things: the consumer declares `uses`, the provider declares `provides`, and the provider module is actually on the module path and resolved. `java --show-module-resolution` prints the resolved module graph, which settles the third quickly.

**Maintainability:** Because ordering is unspecified, selection logic must be explicit — filter by capability rather than assuming the first provider is correct.

---

### 12.7 The Module Path vs the Classpath

**Best practices:** Pick one model per application and stay with it. Mixed setups where some dependencies are modules and others are classpath JARs are legal but produce readability rules that are genuinely hard to reason about during an incident.

**Common production bugs:** Build tools silently placing a dependency on the wrong path. A dependency on the classpath is invisible to your explicit module, producing a compile error that looks like a missing dependency even though the JAR is present and declared in the build file.

**Debugging tips:** `java --show-module-resolution` prints which modules resolved and why. This is the fastest way to diagnose "module not found" and unexpected-resolution problems, and it's underused.

```bash
java --show-module-resolution --module-path mods -m com.example.app/com.example.Main
```

**Real-world use case:** Spring Boot's executable fat JAR is fundamentally classpath-based — it uses a nested-JAR class loader that doesn't fit the module model. This is a substantial practical reason most Spring applications remain on the classpath, and it's a legitimate constraint rather than an oversight.

---

### 12.8 Automatic and Unnamed Modules

**Best practices:** If you publish a library, add `Automatic-Module-Name` to the manifest even if you never write a descriptor. It costs one line, fixes the module name so consumers' `requires` clauses survive artifact renames, and is the recommended first step in the official migration guidance.

```xml
<manifestEntries>
    <Automatic-Module-Name>com.example.mylib</Automatic-Module-Name>
</manifestEntries>
```

**Common production bugs:** A consumer's `requires` breaking when an upstream JAR is renamed, because the module name was derived from the filename. Version bumps that change artifact naming conventions cause this, and the failure is at compile or startup time with a name that no longer exists.

> ⚠️ **Warning:** Never depend on a filename-derived automatic module name in published code. If the upstream project renames its artifact — or you switch to a shaded or relocated build — the module name changes and your `requires` fails. Only depend on modules with `Automatic-Module-Name` or a real descriptor.

**Maintainability:** Automatic modules provide no encapsulation whatsoever — they export and open everything. Treat their presence in a module graph as an indicator of incomplete migration, not a finished state.

**Migration guidance:** During migration, automatic modules let you modularize incrementally. Track which dependencies are still automatic so the remaining work is visible rather than forgotten.

---

### 12.9 Strong Encapsulation

**Best practices:** Run `jdeps --jdk-internals` against your full dependency set *before* planning a JDK upgrade. It identifies exactly which libraries reflect into internals, converting an unpredictable migration into a known task list.

```bash
jdeps --jdk-internals --multi-release 21 app.jar
```

**Common production bugs:** Library incompatibility discovered at deployment rather than in CI. Mockito, Spring, Hibernate, Lombok, and various serialization libraries all required updates for newer JDKs — and the failures appear at runtime, sometimes only on specific code paths.

> ⚠️ **Warning:** `--add-opens` flags accumulate. Teams add one to fix an error, then another, and eventually the application depends on a dozen JDK internals with no record of why. Document every flag with the library that requires it and a removal condition — otherwise the next upgrade repeats the entire investigation.

**Migration guidance — the correct order:**
1. Update the library to a version supporting the target JDK (almost always the right fix)
2. If none exists, evaluate replacing the library
3. Only then add a narrowly-scoped `--add-opens`, documented as debt

**Real-world use case:** Manifest-based flags avoid scattering them across launch scripts and container definitions:
```
Add-Opens: java.base/java.lang java.base/java.util
```
This keeps the requirement with the artifact that needs it.

**Testing advice:** Add the target JDK to your CI matrix well before the migration deadline. Discovering incompatibility months ahead is routine maintenance; discovering it at deployment is an incident.

---

### 12.10 jlink and Custom Runtimes

**Best practices:** Evaluate `jlink` where image size or startup matters — serverless, edge deployments, or large-scale container fleets where pull time and storage aggregate meaningfully. For a long-running service on a stable host, the benefit is modest.

**Real-world use case:** Multi-stage container builds are the standard pattern, and the size reduction is substantial — a full JDK image versus a minimal runtime is often a several-fold difference, which matters across thousands of pods.

**Common production bugs:** Reflection-dependent code failing in a `jlink` image because a required module wasn't included. `jdeps` performs static analysis and cannot see reflective usage, so modules loaded only via `Class.forName` or `ServiceLoader` are missed. Add them explicitly with `--add-modules`.

> ⚠️ **Warning:** `jdeps --print-module-deps` finds *static* dependencies only. JDBC drivers, charset providers, cryptographic providers, and anything loaded reflectively will be absent from the computed set. Test the resulting image against real workloads — a missing module surfaces as `ClassNotFoundException` at runtime, not at link time.

**Security implications:** Fewer modules means fewer classes and a smaller attack surface. Combined with a distroless base image, this measurably reduces the CVE surface that container scanners report — a real operational benefit beyond size.

**Modern recommendations:** Where startup time is the primary concern rather than size, compare against AppCDS (cheaper, keeps full JDK behavior) and GraalVM `native-image` (fastest startup, but requires reflection configuration and gives up JIT peak throughput). These are three different points on the same trade-off curve, as noted in Group 8.

---

### 12.11 Migration Strategy

**Best practices:** Treat JDK upgrades as continuous maintenance rather than periodic projects. Teams that move each LTS as it arrives rarely face difficulty; teams that skip several accumulate compounding breakage and end up with a multi-month effort.

**Real-world use case — a realistic Java 8 to 21 sequence:**

| Step | Action | Typical outcome |
|---|---|---|
| 1 | Upgrade build tooling and plugins | Often the largest hidden cost |
| 2 | Move to JDK 11 on the classpath | Java EE modules need explicit dependencies |
| 3 | Run `jdeps --jdk-internals` | Produces the library update list |
| 4 | Update libraries, remove `--add-opens` | Removes accumulated debt |
| 5 | Move to 17, then 21 | Usually straightforward |

**Common production bugs:** Removed Java EE modules after Java 11 — JAXB, JAX-WS, `javax.annotation`, CORBA — producing `ClassNotFoundException` for classes that were previously part of the JDK. The fix is adding explicit dependencies (Jakarta equivalents), but the failures often appear in rarely-exercised code paths.

**Testing advice:** Run the full test suite on the target JDK before committing to migration, and specifically exercise serialization, persistence, reflection-heavy, and date-handling paths. These are where JDK behavioral changes concentrate.

> ✅ **Best Practice:** Add the next LTS to your CI matrix as soon as it ships, even while production runs the current one. The build failing early is information; the build failing during a migration window is pressure.

**Maintainability:** Keep a documented record of `--add-opens` flags, pinned library versions blocking upgrades, and known incompatibilities. This turns each upgrade into an incremental task rather than a fresh investigation.

**Modern recommendations:** For most teams the honest end state is: current LTS, classpath, no `module-info.java`. That's a perfectly good outcome. Reach for modules when you're publishing a library that benefits from enforced encapsulation, or building minimal runtimes with `jlink` — not because the module system exists.

---

[[#📖 Master Table of Contents|⬆ Back to top]]

*End of Group 12 — curriculum complete.*

---

## 🎓 Curriculum Complete

You've now worked through all twelve groups at every level of depth:

| File | Goal | Outcome |
|---|---|---|
| `0_foundation.md` | Build the mental map | *"I know what every concept is."* |
| `1_understand.md` | Develop understanding | *"I understand how this works."* |
| `2_interview.md` | Prepare for interviews | *"I can answer confidently."* |
| `3_production.md` | Apply professionally | *"I know how professionals use this."* |

**Suggested next steps:**

- **Reinforce by building.** Pick a topic that felt shakiest and write code that exercises its failure modes — a deadlock, a memory leak, a `ConcurrentModificationException`. Understanding how something breaks is what makes the correct approach stick.
- **Read real source.** The JDK's `ArrayList`, `HashMap`, `ConcurrentHashMap`, and `CompletableFuture` are well-written and heavily commented. They connect several groups at once.
- **Revisit the interview file before interviews specifically.** The follow-up questions and edge cases are the parts most likely to differentiate a strong answer.
- **Treat the production file as a review checklist.** Its warnings map to the failure modes that actually cause incidents — unbounded thread pool queues, unclosed resources, `equals`/`hashCode` violations, and silent annotation failures.
