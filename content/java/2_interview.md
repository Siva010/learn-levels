# Java — Interview Prep

> **Goal of this file:** Prepare you to confidently answer technical interview questions. Assumes you've completed `0_foundation.md` and `1_understand.md`.

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
- [[#1.1 What is Java? / JVM / JRE / JDK]]
- [[#1.2 Platform Independence & Bytecode]]
- [[#1.3 Variables and Data Types]]
- [[#1.4 Operators]]
- [[#1.5 Control Flow Statements]]
- [[#1.6 Arrays]]
- [[#1.7 Methods]]
- [[#1.8 Packages and Imports]]

---

### 1.1 What is Java? / JVM / JRE / JDK

#### Definition
Java is a statically-typed, object-oriented, platform-independent language whose source compiles to bytecode executed by a JVM. The **JVM** executes bytecode, the **JRE** is the JVM plus runtime libraries, and the **JDK** is the JRE plus development tools.

#### Why it exists
To decouple compiled code from any specific hardware/OS, enabling "write once, run anywhere," and to provide automatic memory management so developers don't manually manage allocation/deallocation.

#### Interview explanation
Explain it as a layered stack: **JDK ⊃ JRE ⊃ JVM**. If asked "can you run a Java program with just the JRE?" — yes, since the JRE contains everything needed to execute (not compile) code. If asked "can you compile with just the JVM?" — no, `javac` is a JDK tool.

#### Syntax
```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```
Compile: `javac HelloWorld.java` → produces `HelloWorld.class`
Run: `java HelloWorld` → JVM loads and executes the bytecode

#### Example
```java
// Demonstrates the compile-then-run lifecycle
public class Demo {
    public static void main(String[] args) {
        System.out.println("JVM version: " + System.getProperty("java.version"));
    }
}
```

#### Common interview questions
- "What's the difference between JDK, JRE, and JVM?"
- "Is Java compiled or interpreted?" (Answer: both — compiled to bytecode, then interpreted/JIT-compiled by the JVM.)
- "What makes Java platform-independent?"
- "What is JIT compilation?"

#### Follow-up questions
- "If bytecode is portable, why isn't the JVM itself portable?" (Because the JVM is a native binary that must be built per-OS/architecture to translate bytecode into that machine's instructions.)
- "What's the difference between the interpreter and the JIT compiler?" (Interpreter executes bytecode line-by-line; JIT detects "hot" methods and compiles them to native code for reuse, dramatically improving performance for long-running code paths.)

#### Edge cases
- Running a `.class` file compiled with a newer JDK on an older JVM fails with `UnsupportedClassVersionError`.
- Modern JDKs no longer ship a separate minimal JRE download by default (post Java 9 module system changes); custom minimal runtimes are built via `jlink` instead.

#### Common mistakes
- Saying "Java is purely interpreted" (ignores JIT compilation).
- Confusing JRE and JDK, e.g., saying you need the JDK just to *run* a jar file in production.

#### Comparisons

| | JVM | JRE | JDK |
|---|---|---|---|
| Purpose | Executes bytecode | Run programs | Build + run programs |
| Contains | Class loader, execution engine, GC | JVM + core libraries | JRE + compiler, debugger, tools |
| Needed to compile? | No | No | Yes |
| Needed to run? | Yes | Yes | Yes (contains a JRE) |

#### Complexity
Not applicable (conceptual topic, not an algorithm).

#### Frequently confused with
JVM vs JIT compiler — the JIT is a *component inside* the JVM's execution engine, not a separate thing.

#### Important facts to remember
- Bytecode is the portable artifact; the JVM is not.
- `javac` (compiler) lives in the JDK only.
- JIT compilation is why long-running Java processes can rival natively-compiled language performance.

---

### 1.2 Platform Independence & Bytecode

#### Definition
Bytecode is the intermediate, platform-neutral instruction set produced by `javac`, stored in `.class` files, and executed by any conforming JVM.

#### Why it exists
To separate the compilation target from any specific CPU/OS, so the same compiled artifact runs unmodified across platforms.

#### Interview explanation
Emphasize the distinction between "platform-independent code" (bytecode) and "platform-dependent runtime" (the JVM binary itself, which is compiled natively per OS/architecture).

#### Syntax
```bash
javac Main.java     # produces Main.class (bytecode)
javap -c Main.class # disassembles and shows raw bytecode instructions
```

#### Example
```java
public class Add {
    public static void main(String[] args) {
        int result = 2 + 3;
    }
}
```
Disassembling this with `javap -c` shows low-level opcodes like `iconst_2`, `iconst_3`, `iadd` — the actual bytecode instructions.

#### Common interview questions
- "What is bytecode and why does it matter?"
- "Explain 'write once, run anywhere.'"
- "What happens between writing `.java` and running the program?"

#### Follow-up questions
- "What verifies bytecode is safe before execution?" (The **bytecode verifier**, part of the JVM's class loading process, checks for illegal type casts, stack overflows, and access violations before execution.)
- "Can bytecode be decompiled back to readable Java?" (Yes, largely — tools like CFR/Procyon can reconstruct close-to-original source, which is why bytecode isn't a security boundary for hiding logic.)

#### Edge cases
- Bytecode compiled for a newer Java version (`--release 21`) cannot run on an older JVM.
- Reflection and dynamic proxies (used heavily by frameworks like Spring/Hibernate) manipulate or generate bytecode at runtime.

#### Common mistakes
- Assuming bytecode portability means *zero* platform-specific behavior (file separators, default charsets, and native library bindings can still differ).

#### Comparisons

| | Interpreted languages (e.g., raw Python) | Native-compiled (e.g., C) | Java |
|---|---|---|---|
| Compilation target | None / source read directly | Machine code | Bytecode |
| Portability | Source is portable, execution needs interpreter | Not portable across CPU/OS | Bytecode portable, JVM handles execution per-platform |
| Runtime optimization | Limited | Compile-time only | JIT recompiles hot paths at runtime |

#### Complexity
Not applicable.

#### Frequently confused with
"Interpreted" vs "compiled" languages — Java is technically **both**: compiled to bytecode, then that bytecode is interpreted/JIT-compiled at runtime.

#### Important facts to remember
- `.class` files contain bytecode, not machine code.
- The bytecode verifier is a security/safety gate that runs before execution.
- JIT compilation happens *after* the program starts running, based on observed "hot" code paths.

---

### 1.3 Variables and Data Types

#### Definition
A variable is a typed, named storage location. Java has 8 primitive types (raw values) and reference types (pointers to heap objects).

#### Why it exists
Static typing catches type errors at compile time rather than runtime; the primitive/reference split balances raw performance against a rich object model.

#### Interview explanation
Be ready to state all 8 primitives from memory with sizes and defaults, and clearly explain the stack-vs-heap distinction for primitives vs. references.

#### Syntax
```java
int age = 30;
double price = 19.99;
boolean active = true;
char grade = 'A';
String name = "Saiganesh"; // reference type
Integer boxedAge = age;    // autoboxing
```

#### Example
```java
int a = 10;
Integer b = a;       // autoboxing: int -> Integer
int c = b;           // unboxing: Integer -> int
Integer x = 127, y = 127;
System.out.println(x == y); // true (Integer cache -128 to 127)
Integer p = 200, q = 200;
System.out.println(p == q); // false (outside cache range, different objects)
```

#### Common interview questions
- "What are Java's 8 primitive types?"
- "What's the difference between `==` and `.equals()`?"
- "Explain autoboxing and unboxing."
- "Why does `Integer.valueOf(127) == Integer.valueOf(127)` return `true` but `200 == 200` (boxed) return `false`?"

#### Follow-up questions
- "What is the Integer cache and why does it exist?" (The JVM caches `Integer` objects for values -128 to 127 to avoid repeated object creation for commonly-used small numbers — a memory optimization.)
- "Is `String` a primitive?" (No — it's a reference type, though it behaves specially due to the String Pool, covered under Strings/OOP.)

#### Edge cases
- Autoboxing/unboxing inside loops silently creates many short-lived objects — a subtle performance trap.
- Comparing boxed types with `==` outside the cache range gives reference comparison, not value comparison — a classic bug source.

#### Common mistakes
- Using `==` to compare `Integer`, `Long`, or other wrapper objects for value equality instead of `.equals()`.
- Forgetting `float` literals need an `f` suffix (`3.14f`) or they default to `double` and fail to compile when assigned to a `float` variable without a cast.

#### Comparisons

| | Primitive | Reference (Wrapper/Object) |
|---|---|---|
| Stored | Value directly | Reference to heap object |
| Default value | `0`, `false`, etc. | `null` |
| Can be `null`? | No | Yes |
| Memory overhead | Minimal | Object header + fields |
| Used in generics? | No (must box) | Yes |

#### Complexity
Not applicable (declaration/storage, not an algorithm) — though autoboxing in loops has an O(n) hidden object-allocation cost worth flagging.

#### Frequently confused with
`==` vs `.equals()` — `==` compares references for objects (identity); `.equals()` compares logical content (unless the class hasn't overridden it, in which case it defaults to reference comparison too — see OOP group).

#### Important facts to remember
- Java has exactly 8 primitive types — memorize them with sizes.
- The Integer cache range is -128 to 127 by default (can widen but not shrink via `-XX:AutoBoxCacheMax`).
- Primitives can never be `null`; this is why collections cannot hold primitives directly (they hold boxed wrappers).

---

### 1.4 Operators

#### Definition
Symbols that perform arithmetic, relational, logical, bitwise, or assignment operations on operands.

#### Why it exists
To provide compact, efficient syntax for computation and decision-making that would otherwise require verbose function calls.

#### Interview explanation
Interviewers often probe short-circuit evaluation and integer division/overflow — know exactly when the right-hand operand of `&&`/`||` is skipped, and why `5/2` isn't `2.5`.

#### Syntax
```java
int result = (a > b) ? a : b;  // ternary
boolean valid = (obj != null) && obj.isReady(); // short-circuit
```

#### Example
```java
System.out.println(5 / 2);     // 2 (integer division truncates)
System.out.println(5.0 / 2);   // 2.5 (one operand is double)
System.out.println(5 % 2);     // 1 (modulo)
System.out.println(Integer.MAX_VALUE + 1); // overflows to Integer.MIN_VALUE
```

#### Common interview questions
- "What's the output of `5 / 2` in Java?"
- "Explain short-circuit evaluation with an example."
- "What happens on integer overflow in Java?" (It silently wraps around — no exception is thrown, unlike some other languages/checked arithmetic APIs.)

#### Follow-up questions
- "How would you detect overflow safely?" (Use `Math.addExact()`, `Math.multiplyExact()`, etc., which throw `ArithmeticException` on overflow instead of silently wrapping.)
- "Difference between `&` and `&&`?" (`&` is bitwise AND and always evaluates both operands, even for booleans; `&&` is logical AND with short-circuiting.)

#### Edge cases
- Dividing by zero: integer division by zero throws `ArithmeticException`; floating-point division by zero produces `Infinity` or `NaN`, no exception.
- `Integer.MIN_VALUE / -1` overflows (result can't be represented as a positive int of the same bit width).

#### Common mistakes
- Expecting `5 / 2` to produce a decimal without casting.
- Using `&`/`|` instead of `&&`/`||` for booleans and unintentionally evaluating both sides (causing NPEs if the first check was meant to guard the second).

#### Comparisons

| | `&&` / `\|\|` | `&` / `\|` |
|---|---|---|
| Short-circuits? | Yes | No — always evaluates both sides |
| Typical use | Boolean logic with guard conditions | Boolean logic without short-circuit *or* bitwise math on integers |

#### Complexity
Not applicable.

#### Frequently confused with
Bitwise vs. logical operators (`&` vs `&&`, `|` vs `||`).

#### Important facts to remember
- Integer division truncates toward zero; it doesn't round.
- Integer arithmetic overflows silently (wraps); use `Math.*Exact()` methods if you need overflow detection.
- `&&`/`||` short-circuit; `&`/`|` do not.

---

### 1.5 Control Flow Statements

#### Definition
Statements (`if/else`, `switch`, `for`, `while`, `do-while`) that determine execution order and repetition.

#### Why it exists
Programs need to branch on conditions and repeat work; without control flow, every program would be one straight, non-reusable sequence of instructions.

#### Interview explanation
Know the modern `switch` expression (Java 14+) cold — interviewers testing "modern Java knowledge" love asking you to rewrite a fall-through-prone `switch` statement as a safe `switch` expression.

#### Syntax
```java
// Traditional switch (statement) - fall-through risk
switch (x) {
    case 1: doA(); break;
    case 2: doB(); break;
    default: doDefault();
}

// Modern switch (expression) - Java 14+
int result = switch (x) {
    case 1 -> 10;
    case 2 -> 20;
    default -> 0;
};
```

#### Example
```java
for (int i = 0; i < 5; i++) {
    if (i == 3) continue; // skips rest of this iteration
    if (i == 4) break;    // exits the loop entirely
    System.out.println(i);
}
// Output: 0 1 2
```

#### Common interview questions
- "What's the difference between `break` and `continue`?"
- "When would you use `do-while` over `while`?"
- "Explain switch fall-through and how to avoid it."
- "What's new about the switch expression in modern Java?"

#### Follow-up questions
- "Can `switch` work on `String` and `enum`?" (Yes — `switch` supports `int`/`Integer`, `char`/`Character`, `String`, and `enum` types, plus sealed types with pattern matching in modern Java, covered in the Modern Features group.)
- "What does `yield` do in a switch expression block?" (Returns a value from a multi-statement `case` block when using `{ }` syntax instead of the single-expression `->` form.)

#### Edge cases
- Nested loops with unlabeled `break`/`continue` only affect the innermost loop — labeled breaks (`outer: for(...) { break outer; }`) are needed to escape outer loops directly.
- `switch` on a `null` String throws `NullPointerException` at the switch statement itself (must null-check beforehand, or use pattern-matching switch with a `case null` branch in modern Java).

#### Common mistakes
- Missing `break` in traditional switch statements, causing unintended fall-through.
- Off-by-one errors in `for` loop bounds (`<=` vs `<`).

#### Comparisons

| | `for` | `while` | `do-while` |
|---|---|---|---|
| Condition checked | Before each iteration | Before each iteration | After each iteration |
| Guarantees ≥1 run | No | No | Yes |
| Best for | Known iteration count | Unknown count, pre-check | Must-run-once logic (e.g., menus, retries) |

#### Complexity
Not applicable (control structures, not algorithms) — though loop nesting directly determines algorithmic time complexity (nested loops → O(n²), etc.), which interviewers often probe indirectly.

#### Frequently confused with
`switch` statement (old, fall-through-prone) vs. `switch` expression (new, safe, returns a value).

#### Important facts to remember
- `do-while` is the only loop guaranteed to execute at least once.
- Traditional `switch` falls through without `break`; the `->` switch expression never falls through.
- Labeled `break`/`continue` exist specifically to control nested loops.

---

### 1.6 Arrays

#### Definition
A fixed-size, contiguous, indexed collection of elements of a single type.

#### Why it exists
To group related values and provide O(1) indexed access without declaring separate variables.

#### Interview explanation
Arrays are the most common building block in DSA interviews — be fluent in declaration syntax, multi-dimensional/jagged arrays, and the fact that array length is immutable once created.

#### Syntax
```java
int[] a = new int[5];              // default-initialized to 0
int[] b = {1, 2, 3};               // array literal
int[][] jagged = new int[3][];     // jagged 2D array
jagged[0] = new int[]{1, 2};
```

#### Example
```java
int[] arr = {5, 3, 8, 1};
System.out.println(arr.length); // 4 (field, not a method!)
Arrays.sort(arr);
System.out.println(Arrays.toString(arr)); // [1, 3, 5, 8]
```

#### Common interview questions
- "How is a 2D array stored in memory in Java?" (As an array of references to separate 1D arrays — not a single contiguous block, unlike C.)
- "Why is `arr.length` not `arr.length()`?" (`length` is a public final field on array objects, not a method — unlike `String.length()` or `List.size()`, a classic gotcha.)
- "How do you copy an array?" (`Arrays.copyOf()`, `System.arraycopy()`, or `clone()` — the latter does a shallow copy.)

#### Follow-up questions
- "What's the time complexity of inserting into the middle of an array?" (O(n) — every subsequent element must shift.)
- "Is array cloning deep or shallow?" (Shallow — for arrays of objects, the references are copied, not the objects themselves.)

#### Edge cases
- Accessing an out-of-bounds index throws `ArrayIndexOutOfBoundsException` at runtime (not compile time).
- Arrays of primitives vs. arrays of objects behave differently on `clone()` — primitive array clones are fully independent; object array clones share the same referenced objects.

#### Common mistakes
- Confusing `arr.length` (field) with `str.length()` (method) with `list.size()` (method) — three different APIs for "how big is this."
- Assuming Java has true multi-dimensional arrays like C — it actually has arrays-of-arrays, which can be jagged.

#### Comparisons

| | Array | ArrayList (preview — full detail in Collections group) |
|---|---|---|
| Size | Fixed at creation | Dynamically resizable |
| Holds primitives? | Yes, directly | No — only boxed wrappers |
| Access speed | O(1) | O(1) |
| Type safety | Compile-time array type | Generic type parameter |

#### Complexity

| Operation | Time |
|---|---|
| Access by index | O(1) |
| Linear search | O(n) |
| Sort (`Arrays.sort` on primitives, dual-pivot quicksort) | O(n log n) average |
| Sort (`Arrays.sort` on objects, uses TimSort) | O(n log n) guaranteed |

#### Frequently confused with
`length` (array field) vs `length()` (String method) vs `size()` (Collection method).

#### Important facts to remember
- Array length is fixed and immutable after creation.
- `Arrays.sort()` uses dual-pivot quicksort for primitives (not stable) and TimSort for objects (stable, needed since objects may implement `Comparable` with equality-sensitive logic).
- Multi-dimensional arrays in Java are jagged arrays-of-arrays, not true matrices.

---

### 1.7 Methods

#### Definition
A named, reusable block of code accepting parameters and optionally returning a value.

#### Why it exists
To eliminate code duplication and organize logic into callable, testable units.

#### Interview explanation
The single most-tested concept here is **pass-by-value vs. pass-by-reference** — Java is *always* pass-by-value, even for objects (the value passed is the reference itself, not the object). Be ready to explain this with a code trace.

#### Syntax
```java
// Method overloading - same name, different signatures
void print(int x) { }
void print(String x) { }

// Varargs
void log(String... messages) {
    for (String m : messages) System.out.println(m);
}
```

#### Example
```java
void modify(int x, StringBuilder sb) {
    x = 100;                  // does NOT affect caller's variable
    sb.append(" modified");   // DOES affect caller's object (mutation)
    sb = new StringBuilder("new"); // does NOT affect caller's reference
}

public static void main(String[] args) {
    int num = 5;
    StringBuilder sb = new StringBuilder("original");
    modify(num, sb);
    System.out.println(num); // 5 (unchanged)
    System.out.println(sb);  // "original modified" (mutated)
}
```

#### Common interview questions
- "Is Java pass-by-value or pass-by-reference?" (Always pass-by-value — for objects, the *reference value* is copied.)
- "What's method overloading vs. overriding?" (Overloading = same name, different parameters, resolved at compile time; overriding = subclass redefines a parent method, resolved at runtime — full detail in OOP group.)
- "What are varargs and how are they implemented?" (Internally treated as an array; a method can have at most one varargs parameter, and it must be last.)

#### Follow-up questions
- "Why does mutating an object inside a method affect the caller, but reassigning it doesn't?" (Because the method has its own copy of the *reference*, pointing to the same object. Mutating via that reference changes shared state; reassigning the local copy only changes what the local variable points to.)
- "Can you overload methods by return type alone?" (No — Java resolves overloads by parameter list only; return type alone is not sufficient to distinguish overloads.)

#### Edge cases
- Overload resolution ambiguity when autoboxing/varargs could match multiple overloads — compiler picks the most specific exact match before considering boxing or varargs.
- Recursive methods without a proper base case cause `StackOverflowError`.

#### Common mistakes
- Believing Java supports pass-by-reference and expecting reassignment inside a method to reflect back to the caller.
- Overloading methods in a way that creates ambiguous calls (e.g., overloading with `Integer` and `int` alongside varargs).

#### Comparisons

| | Overloading | Overriding |
|---|---|---|
| Relationship | Same class (or unrelated) | Parent-child (inheritance) |
| Resolved | Compile time (static) | Runtime (dynamic dispatch) |
| Signature | Must differ (params) | Must be identical (same signature) |
| Also known as | Compile-time polymorphism | Runtime polymorphism |

#### Complexity
Not applicable directly, though recursive methods carry their own time/space complexity (call stack depth = space complexity).

#### Frequently confused with
Pass-by-value vs. pass-by-reference — the most commonly misstated Java fact in interviews.

#### Important facts to remember
- Java has no pass-by-reference — ever. Only pass-by-value, where the "value" for objects happens to be a reference.
- A varargs parameter must be the last parameter in the method signature.
- Overload resolution happens at compile time; it depends only on the declared parameter types, not runtime object types.

---

### 1.8 Packages and Imports

#### Definition
A package is a namespace grouping related classes; an import allows referencing classes from other packages by simple name.

#### Why it exists
To avoid class name collisions across large codebases/libraries and to organize code logically by feature or layer.

#### Interview explanation
Know the difference between `import java.util.*` (single-level wildcard, does not include sub-packages) and fully qualified name usage when two imported classes share a simple name.

#### Syntax
```java
package com.company.project.service;

import java.util.List;
import java.util.Map;
// import java.util.*; // wildcard - only that package's direct classes

public class OrderService { }
```

#### Example
```java
// Resolving a naming collision without an import, using fully qualified names
java.util.List<String> list = new java.util.ArrayList<>();
java.awt.List awtList; // same simple name "List", different package
```

#### Common interview questions
- "What's the difference between `import java.util.*` and importing sub-packages?" (Wildcard imports only cover classes directly in that package, not nested sub-packages — `java.util.*` does not include `java.util.concurrent.*`.)
- "Why is `java.lang` imported automatically?" (It contains core types — `String`, `Object`, `System`, `Math` — considered fundamental enough to always be available.)
- "How does the JVM find classes at runtime?" (Via the **classpath**, which lists directories/JARs the class loader searches, matching package structure to directory structure.)

#### Follow-up questions
- "What happens if two imported classes share the same simple name?" (Compile error due to ambiguity — resolved by using the fully qualified name for at least one of them.)
- "Does a wildcard import affect runtime performance?" (No — imports are purely a compile-time convenience; they don't affect the compiled bytecode or runtime speed at all.)

#### Edge cases
- Classes in the *default package* (no `package` declaration) cannot be imported by classes that do declare a package — a common beginner pitfall.
- Static imports (`import static java.lang.Math.*;`) import members (methods/fields), not types, letting you call `sqrt(x)` instead of `Math.sqrt(x)`.

#### Common mistakes
- Assuming `import package.*` recursively imports sub-packages too.
- Placing multiple public top-level classes in one `.java` file (only one public class is allowed per file, and it must match the filename).

#### Comparisons

| | Single-type import | Wildcard import | Static import |
|---|---|---|---|
| Imports | One class | All classes directly in a package | Static members (fields/methods) |
| Sub-packages included? | N/A | No | N/A |
| Example | `import java.util.List;` | `import java.util.*;` | `import static java.lang.Math.PI;` |

#### Complexity
Not applicable.

#### Frequently confused with
Package structure vs. classpath — the package is a logical/namespace concept; the classpath is the physical/runtime lookup mechanism that must match it.

#### Important facts to remember
- `java.lang.*` is the only package imported automatically everywhere.
- Wildcard imports (`.*`) don't include sub-packages and have zero runtime cost — it's purely a source-code convenience.
- Only one public top-level class/interface is allowed per `.java` file, and its name must match the filename.

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

#### Definition
A class is a blueprint defining fields and methods; an object is a runtime instance of that blueprint, created via `new` and allocated on the heap. A variable of a class type holds a reference to an object, never the object itself.

#### Why it exists
To bundle related data and behavior together, forming the basic building block of object-oriented modeling.

#### Interview explanation
**In 30 seconds** — A class declares fields and methods once; each `new` creates an independent object with its own copy of the instance fields and hands back a reference to it. Variables hold references, not objects: assigning one variable to another copies the reference, so both see the same object, and `null` means no object at all.

**If they push deeper** — `new` does its work in a fixed order: it initializes the class if this is its first use, allocates space for every instance field (inherited ones included) and sets each to its default, runs the constructor chain from `Object` downwards — each class's field initializers and instance initializer blocks run just before the rest of that class's constructor body — and yields the reference. Static fields belong to the class, so they exist once however many objects are created.

**What they test** — Be ready to trace exactly what happens during `new ClassName(...)`: memory allocation → default field initialization → constructor chain (superclass first, then field initializers, then the constructor body) → reference returned. This sequence is a common whiteboard question.

#### Syntax
```java
class Car {
    String model;
    int year;
    Car(String model, int year) {
        this.model = model;
        this.year = year;
    }
}
Car myCar = new Car("Civic", 2024);
```

#### Example
```java
class Counter {
    int count;
    void increment() { count++; }
}
Counter c1 = new Counter();
Counter c2 = new Counter();
c1.increment();
System.out.println(c1.count); // 1
System.out.println(c2.count); // 0 - independent state
```

Predict the output — a question below asks for it:

```java
class Box { int size; }

Box a = new Box();
Box b = a;
Box c = new Box();
b.size = 5;
c.size = 5;
System.out.println(a.size);
System.out.println(a == b);
System.out.println(a == c);
```

#### Common interview questions
- "What happens in memory when you create an object with `new`?" (The class is initialized if this is its first use; space for every instance field, inherited ones included, is allocated on the heap and set to defaults; the constructor chain runs from the top of the hierarchy down, each class running its field initializers and instance blocks before the rest of its constructor body; the reference becomes the value of the expression. Trap: saying the constructor allocates the object — allocation happens before any constructor code runs.)
- "What's the difference between a class and an object?" (A class is a definition — fields, methods, constructors — loaded once per class loader; an object is one instance with its own instance-field values and its own identity. One class, any number of objects. Trap: calling the variable the object — the variable holds a reference to it.)
- "Can a class exist without ever being instantiated? What's the point of that?" (Yes — utility classes with only static members, e.g. `Math`, are never instantiated.)
- "What does the snippet in the Example print?" (`5`, `true`, `false`. `b = a` copied the reference, so `a` and `b` are one object and `b.size = 5` is visible through `a`. `c` is a second object, so `a == c` is false even though both sizes are 5 — `==` compares identity, never contents.)
- "Why do Java variables hold references instead of objects?" (So objects can be shared and passed around cheaply and outlive the method that created them: copying a reference costs the same whatever the object's size, and the object stays alive until it is unreachable. The price is aliasing — a change through one reference is visible through all of them — and the possibility of `null`.)
- "A method receives a `List`, calls `clear()` on it, then assigns the parameter to a new list. What does the caller see?" (An empty list, still the original one. `clear()` acted on the shared object, but Java passes the reference by value, so reassigning the parameter changed only the method's copy of it. Group 1.8 covers pass-by-value.)

#### Follow-up questions
Interviewers rarely stop at "What happens in memory when you create an object with `new`?" — they drill down from your answer. Answer each step before opening it:

- "Which runs first — field initializers or the constructor body?" (The field initializers and instance initializer blocks, in textual order — but only after the superclass constructor has returned. So the order inside one constructor is `super(...)`, then initializers, then the rest of the body.)
- "What does a field hold before its initializer runs, and can any code see that value?" (Its default — 0, false or null. Code sees it when a superclass constructor calls an overridable method that the subclass overrides: the override runs before the subclass's initializers and reads the defaults. 2.22 traces the full order.)
- "If the constructor throws, does the object exist?" (It was allocated, but the `new` expression completes abruptly, so the caller never receives a reference and the object becomes unreachable — unless the constructor already leaked `this` somewhere reachable, in which case a half-built object is now visible. That is why constructors should not publish `this`.)
- "So is every Java object created by running its class's constructor?" (No. Every `new` runs one, but `clone()` copies an object without running a constructor, and deserializing a `Serializable` class skips that class's constructors — only the no-arg constructor of the first non-serializable superclass runs. Records are the exception: they are deserialized through their canonical constructor. Invariants enforced only in constructors can therefore be bypassed.)

Other follow-ups:

- "Where are objects stored — stack or heap?" (In the JVM specification's model, every object is allocated on the heap; a local variable holds only a reference, in the method's stack frame. HotSpot's escape analysis can avoid allocating an object that never leaves its method, but that optimisation never changes what the program observes.)
- "What happens to an object when no references point to it anymore?" (It becomes eligible for garbage collection once it is unreachable — no chain of references leads to it from a live thread or other GC root. Objects that only reference each other in a cycle are unreachable too. Eligible does not mean collected at once; the collector decides when. Full detail in the JVM Internals group.)

#### Edge cases
- Objects created but never assigned to a variable (`new Car("X", 2020);` with no assignment) are eligible for garbage collection as soon as the statement completes — provided the constructor did not store `this` somewhere reachable.
- Static nested classes vs. inner (non-static) classes behave differently — an inner class instance implicitly holds a reference to its enclosing instance; a static nested class does not.
- Calling an instance method through a `null` reference compiles and throws `NullPointerException` at runtime. Since Java 15 the message names the expression that was null (helpful NullPointerExceptions, JEP 358).

#### Common mistakes
- Assuming two separately-created objects with identical field values are `==` equal. They're not: for objects, `==` always compares references — whether both lead to the same object. Overriding `equals()` changes what `equals()` returns, never what `==` does.
- Confusing a utility class (all-static, never instantiated) with a normal class design.
- Assuming `Box b = a;` copies the object. It copies the reference; use a copy constructor or factory to get a second object.

#### Comparisons

| | Class | Object | Variable of class type |
|---|---|---|---|
| What it is | Blueprint/template | Runtime instance | A holder for a reference |
| Memory used | Class metadata plus static fields, once per class loader | Heap memory per instance | One reference-sized slot |
| Created with | `class` keyword definition | `new` keyword | A declaration (`Dog d;`) |

#### Complexity
Allocation is cheap in HotSpot — usually a pointer bump in a thread-local buffer, an implementation detail rather than a language guarantee. Setting the fields to defaults and running the constructor chain cost time in proportion to the object's size and the constructors' work.

#### Frequently confused with
Class vs. instance vs. object — "instance" and "object" are synonyms; "class" is the distinct blueprint concept. Object vs. reference — the variable holds the reference; the object lives elsewhere and may have several references to it.

#### Important facts to remember
- Objects are allocated on the heap in the JVM's model; a local variable holds only a reference.
- Static (class) members exist independently of any object instantiation.
- An object becomes eligible for GC when it is unreachable — not when "nothing points to it", since cycles count as unreachable — and eligible does not mean collected immediately.
- `==` on references compares identity, and nothing you write in a class changes that.

---

### 2.2 Constructors

#### Definition
A constructor is a special block, matching the class name with no return type, that initializes a newly created object.

#### Why it exists
A freshly allocated object holds only default values. Constructors run as part of normal object creation, so they are the one place a class can turn those defaults into a valid starting state and reject bad arguments before any caller receives the object.

#### Interview explanation
**In 30 seconds** — A constructor runs every time `new` creates an object of its class. It has the class's name and no return type, can be overloaded, and is not inherited. If a class declares none, the compiler supplies a no-arg default constructor with the class's access level; declaring any constructor removes it. Every constructor except `Object`'s first calls a superclass constructor — `super()` implicitly unless you write `this(...)` or `super(...)`.

**If they push deeper** — Inside a constructor the order is fixed: the superclass constructor runs to completion, then this class's field initializers and instance initializer blocks in textual order, then the rest of the body. Before Java 25 the explicit `this(...)`/`super(...)` call had to be the very first statement; Java 25 (JEP 513) allows code before it as long as that code does not touch the object under construction. Constructors guard normal creation only — `clone()` and deserialization of `Serializable` classes create objects without running that class's constructors.

**What they test** — Constructor chaining (`this(...)`/`super(...)`) and the implicit-default-constructor rule are the two most commonly tested facts. Also expect questions distinguishing constructors from regular methods.

#### Syntax
```java
class Point {
    int x, y;
    Point() { this(0, 0); }              // no-arg calls parameterized via this()
    Point(int x, int y) { this.x = x; this.y = y; }
}
```

#### Example
```java
class Vehicle {
    Vehicle() { System.out.println("Vehicle()"); }
}
class Car extends Vehicle {
    Car() {
        super(); // optional here - implicit anyway
        System.out.println("Car()");
    }
}
new Car(); // prints "Vehicle()" then "Car()"
```

Predict the output — a question below asks for it:

```java
class Base {
    Base() { System.out.println("Base()"); }
    Base(String s) { System.out.println("Base(" + s + ")"); }
}
class Derived extends Base {
    Derived() {
        this("x");
        System.out.println("Derived()");
    }
    Derived(String s) {
        super(s);
        System.out.println("Derived(" + s + ")");
    }
}

new Derived();
```

#### Common interview questions
- "What is a default constructor, and when does the compiler NOT provide one?" (The no-arg constructor the compiler adds when a class declares no constructor at all; its body is just `super()` and its access matches the class. It is not provided as soon as you declare any constructor — so adding `Dog(String name)` silently breaks every `new Dog()`. Trap: calling any hand-written no-arg constructor a default constructor — the term means the compiler's.)
- "Can a constructor be `private`? Why would you do that?" (Yes — used in Singleton pattern and static factory methods to control instantiation.)
- "Can constructors be overloaded?" (Yes, same rules as method overloading — different parameter lists.)
- "What does the snippet in the Example print?" (`Base(x)`, `Derived(x)`, `Derived()`. `Derived()` delegates to `Derived(String)` with `this("x")`, which calls `super(s)`, so `Base(String)` runs first, then the rest of `Derived(String)`, and only then the rest of `Derived()`. `Base()` never runs — exactly one superclass constructor runs per object.)
- "Why must the superclass constructor run before the subclass's code?" (Because the subclass's fields and constructor body may rely on inherited state being valid. Building from `Object` downwards means each level starts from a fully initialized parent part — the same reason Java 25's statements-before-`super(...)` may not touch `this`.)
- "You add `Order(String id)` to a class that other code creates with `new Order()`. What happens?" (Every `new Order()` stops compiling, and so does every subclass that relied on an implicit `super()`, because the default constructor no longer exists. Add an explicit no-arg constructor if that form is still wanted.)

#### Follow-up questions
Interviewers rarely stop at "What is a default constructor, and when does the compiler NOT provide one?" — they drill down from your answer. Answer each step before opening it:

- "What does the default constructor contain?" (Only an implicit `super()` call, and it has the same access modifier as its class — `public` for a `public` class, package-private for a package-private one.)
- "So what if the superclass has no no-arg constructor?" (A subclass that declares no constructor fails to compile, because its default constructor's `super()` has nothing to call. Every subclass constructor must call `super(args)` explicitly.)
- "Are constructors inherited, then?" (No. A subclass has only the constructors it declares, plus the default one if it declares none. `new Child(5)` does not compile just because `Parent(int)` exists — `Child` must declare `Child(int x) { super(x); }`.)
- "Can a subclass constructor run code before calling `super(...)`?" (Before Java 25, no — the call had to be the first statement, so argument checks went into a static helper inside the argument list. Since Java 25 (JEP 513), statements may come first if they do not use the object under construction: they can validate arguments and assign the class's own fields that have no initializer, but cannot call instance methods or read fields.)

Other follow-ups:

- "Can a constructor call another constructor in the same class, and another constructor in the parent class, at the same time?" (No — `this(...)` and `super(...)` are mutually exclusive: a constructor contains at most one explicit constructor invocation. Up to Java 24 it must be the very first statement; Java 25 relaxes that, not the one-call rule.)
- "Can a constructor be `abstract`, `static`, or `final`?" (No to all three — none of these modifiers apply to constructors.)

#### Edge cases
- If a parent class has *no* no-arg constructor (only parameterized ones), every subclass constructor **must** explicitly call `super(args)` — the implicit no-arg `super()` call fails to compile.
- Constructors are not inherited — a subclass gets only the constructors it declares (or the compiler's default one if it declares none), even when the parent has a matching signature.
- A constructor that leaks `this` (registers itself as a listener, stores itself in a static collection) before it finishes exposes a half-built object, and if it then throws, that broken object stays reachable. JDK 21's `javac -Xlint:this-escape` warns about such escapes.

#### Common mistakes
- Accidentally writing a "constructor" with a return type (even `void`) — this silently compiles as a regular method with the same name as the class, not a constructor, and is never called automatically.
- Forgetting that adding *any* constructor removes the free default no-arg constructor, breaking code elsewhere that relied on `new ClassName()`.

#### Comparisons

| | Constructor | Regular method |
|---|---|---|
| Name | Must match class name exactly | Any valid identifier |
| Return type | None (not even `void`) | Required (can be `void`) |
| Called | By `new`, or from another constructor via `this(...)`/`super(...)` | Explicitly by name |
| Inherited? | No | Yes, if accessible and not overridden or hidden — static methods included; private methods are never inherited |

#### Complexity
Not applicable.

#### Frequently confused with
Constructors vs. static factory methods (e.g., `List.of(...)`) — factory methods are ordinary static methods that *internally* call a constructor, but offer more flexibility (descriptive names, can return cached instances or a subtype).

#### Important facts to remember
- Every constructor except `Object`'s starts with a superclass constructor call — implicitly `super()` unless `this(...)` or an explicit `super(args)` is written.
- Constructors are never inherited and never marked `abstract`, `static`, or `final`.
- A `private` constructor is a valid, common technique (Singleton, utility classes, static factories).
- The default constructor has its class's access level, not always `public`.
- Constructors run for every `new`, but `clone()` and deserialization can create objects without them.

---

### 2.3 The this and super Keywords

#### Definition
`this` references the current object instance. `super` accesses the immediate parent class's version of a member — a field, method or constructor — for that same object; it is not a reference to a separate object.

#### Why it exists
To disambiguate names (shadowing) and to give subclasses explicit, controlled access to parent behavior they're extending or overriding.

#### Interview explanation
**In 30 seconds** — `this` is the current object: use it to reach a field hidden by a parameter (`this.name = name`), to pass or return the object, and as `this(...)` to call another constructor of the same class. `super` reaches the superclass's version of a member on the same object: `super.m()` runs the parent's implementation of an overridden method, and `super(...)` calls a parent constructor. Neither exists in static code.

**If they push deeper** — `this` is a real value; `super` is not — `Object o = super;` doesn't compile. `super.m()` starts method lookup in the direct superclass, so if the parent only inherited `m`, the grandparent's version runs; what you can't do is skip the parent's own override. A constructor contains at most one of `this(...)` or `super(...)`; up to Java 24 it had to be the first statement, and Java 25 allows earlier statements that don't use the object.

**What they test** — Interviewers commonly ask you to fix "shadowed field" bugs using `this`, and to explain exactly when `super()` is called implicitly vs. must be called explicitly.

#### Syntax
```java
class Employee {
    protected String name;
    Employee(String name) { this.name = name; }
    void show() { System.out.println("Employee: " + name); }
}
class Manager extends Employee {
    Manager(String name) { super(name); }
    @Override void show() {
        super.show();
        System.out.println("(Manager)");
    }
}
```

#### Example
```java
class Box {
    int size;
    Box(int size) { this.size = size; } // 'this.size' vs parameter 'size'
}
```

Predict the output — a question below asks for it:

```java
class A {
    String who() { return "A"; }
}
class B extends A {
    @Override String who() { return "B"; }
}
class C extends B {
    @Override String who() { return "C"; }
    void test() {
        System.out.println(this.who());
        System.out.println(super.who());
        System.out.println(((A) this).who());
    }
}

new C().test();
```

#### Common interview questions
- "What's the difference between `this()` and `super()` in a constructor?" (`this(...)` delegates to another constructor of the same class; `super(...)` calls a constructor of the direct superclass. Either way exactly one superclass constructor runs per object, because a `this(...)` chain must end in a constructor that calls `super(...)`, implicitly or explicitly.)
- "Can you use both `this()` and `super()` in the same constructor?" (No — at most one explicit constructor call per constructor. Up to Java 24 it must be the first line; Java 25 allows statements before it that don't use the object, but still only one call.)
- "Why would you need `super.method()` inside an overridden method?" (To extend the parent's behaviour instead of replacing it: the override runs the parent's logic and adds its own. Without `super`, calling `method()` inside the override would call the override itself — infinite recursion.)
- "What does the snippet in the Example print?" (`C`, `B`, `C`. `this.who()` dispatches on the runtime type, `C`. `super.who()` asks for `B`'s version. `((A) this).who()` still prints `C` — a cast changes the reference's static type, not the object, and overridden methods dispatch on the object. Only `super` can reach a parent's override.)
- "Why can you write `return this;` but not `return super;`?" (`this` is a reference to the current object; `super` is not a value at all — it only tells the compiler where to start looking up a member. There is one object, and `super` is a way of naming the parent's members on it.)
- "A subclass constructor assigns `name = name;` and the field stays null. What happened?" (The parameter `name` shadows the field, so the statement assigns the parameter to itself. Write `this.name = name;`. Many IDEs flag self-assignment.)

#### Follow-up questions
Interviewers rarely stop at "Why would you need `super.method()` inside an overridden method?" — they drill down from your answer. Answer each step before opening it:

- "Which version runs when the parent does not override the method itself?" (The nearest one up the hierarchy. `super.m()` starts the lookup in the direct superclass; if that class only inherited `m`, the inherited implementation runs.)
- "Can you call the grandparent's version when the parent does override it?" (No — there is no `super.super`. A class can reach only its parent's view of a member. If the parent's override must be bypassed, the design needs changing — for example the grandparent exposes a protected helper.)
- "Can `super` call an interface's default method?" (Yes, with a qualified form: `Flyable.super.takeOff()` calls the default method from interface `Flyable`, which the class must directly implement. This is how a class resolves two conflicting default methods (2.16).)
- "Can `this` leak out of a constructor, and why does that matter?" (Yes — passing `this` to another method or object, or calling an overridable method, exposes the object before construction finishes. Another thread or a subclass override may see unset fields. JDK 21's `javac -Xlint:this-escape` warns about it.)

Other follow-ups:

- "What happens if you call `super.method()` on a method that doesn't exist in the parent?" (Compile error — `super` only resolves to members actually declared/inherited in the parent class chain.)
- "Does `this` exist inside a static method?" (No — static methods have no implicit object context, so `this` cannot be used there.)

#### Edge cases
- In a chain of three or more classes (`A -> B -> C`), `super.m()` in `C` starts at `B`. If `B` declares `m`, `B`'s version runs; if `B` only inherits `m` from `A`, `A`'s version runs. What `C` can never do is skip `B`'s override to reach `A`'s.
- Using `this` inside a constructor before all fields are initialized can expose a partially-constructed object if passed to another method (a subtle bug in complex constructors).
- `super.field` reads the parent's field when the subclass declares a field with the same name — field hiding, covered in 2.11.

#### Common mistakes
- Forgetting `this.` when a constructor parameter shadows a field name, silently assigning the parameter to itself instead of setting the field.
- Assuming `super` can skip levels in a multi-level hierarchy — there is no `super.super`; `super` always starts the lookup one level up from here.
- Assuming a cast such as `((Parent) this).m()` calls the parent's override. It doesn't — overridden methods dispatch on the object, whatever the cast.

#### Comparisons

| | `this` | `super` |
|---|---|---|
| Refers to | Current object | The superclass's members, applied to the current object |
| Usable as a value? | Yes (`return this`, `register(this)`) | No |
| Used in | Any instance context | Any instance context of a class with a superclass |
| Common use | Disambiguate shadowed names, constructor chaining | Access overridden parent behavior, parent constructor |

#### Complexity
Not applicable.

#### Frequently confused with
`super` (parent class reference) vs. `Object` (the ultimate root class) — `super` is relative to the current class's direct parent, not always `Object`.

#### Important facts to remember
- A constructor contains at most one of `this()`/`super()`; up to Java 24 it must be the first statement, and Java 25 allows earlier statements that don't use the object.
- `super` always starts the lookup one level up — it can find an inherited implementation further up, but can never skip the parent's own override.
- Neither `this` nor `super` can be used inside a `static` context.
- `this` is a value; `super` is not.

---

### 2.4 Static vs Instance Members

#### Definition
Static members belong to the class itself (one copy total, shared); instance members belong to each object individually (one copy per instance).

#### Why it exists
To distinguish data/behavior that's naturally per-object from data/behavior that's naturally shared across the entire class.

#### Interview explanation
**In 30 seconds** — An instance field exists once per object; a static field exists once per class and is shared by every instance. A static method runs without an object, so it has no `this` and can't touch instance members except through an explicit reference. Static members are inherited but never overridden — a same-named static in a subclass hides the parent's.

**If they push deeper** — Static state is created when the class is *initialized*, which happens on first active use — creating an instance, calling a static method, or using a static field that isn't a compile-time constant — not merely when the class is loaded. Static field initializers and `static` blocks run once, in textual order. Strictly, a static field exists once per class per class loader, so a class loaded by two loaders has two copies.

**What they test** — A classic trick question: "can a static method access an instance field?" — always answer confidently: no, not directly, because static methods have no implicit `this`/object context.

#### Syntax
```java
class Counter {
    static int totalInstances = 0;   // static/class member
    int id;                          // instance member
    Counter() {
        id = ++totalInstances;
    }
}
```

#### Example
```java
class MathUtils {
    static int square(int x) { return x * x; } // no object needed
}
System.out.println(MathUtils.square(5)); // called on class, not an instance
```

Predict the output — a question below asks for it:

```java
class Ticket {
    static int next = 1;
    int number;
    Ticket() { number = next++; }
}

Ticket a = new Ticket();
Ticket b = new Ticket();
a.next = 10;
Ticket c = new Ticket();
System.out.println(a.number + " " + b.number + " " + c.number + " " + b.next);
```

#### Common interview questions
- "Can a static method call an instance method directly?" (No — it would need an explicit object reference to do so.)
- "When would you use a static block?" (For one-time static field initialization logic that's more complex than a simple assignment, run once when the class is initialized — on its first active use, not merely when it is loaded.)
- "Are static variables thread-safe by default?" (No — shared static mutable state requires explicit synchronization in multi-threaded code.)
- "What does the snippet in the Example print?" (`1 2 10 11`. There is one `next` for the whole class: `a.next = 10` changes the shared field even though it is written through `a`, so `c` gets 10 and `next` becomes 11, which is also what `b.next` reads. Trap: thinking `a.next` belongs to `a` — the compiler resolves it to `Ticket.next`.)
- "Why can't a static method use `this`?" (Because it isn't invoked on an object — `MathUtils.square(5)` has no receiver. With no current object there is nothing for `this` to refer to and no instance fields to read.)
- "A web service keeps the logged-in user in a `static` field. What goes wrong?" (Every request thread shares that one field, so concurrent requests overwrite each other's user and one user can see another's data. Per-request state belongs in request-scoped objects or method parameters, never in statics.)

#### Follow-up questions
Interviewers rarely stop at "Can a static method call an instance method directly?" — they drill down from your answer. Answer each step before opening it:

- "Can an instance method call a static method?" (Yes — instance code can use everything static, because the class's members are always available; only the reverse direction needs an object.)
- "Can you call a static method through an object reference?" (Yes, it compiles with a warning, but the object is ignored: the method is chosen from the reference's declared type at compile time. Even a `null` reference works without a `NullPointerException`.)
- "Then what happens when a subclass declares a static method with the same signature?" (It *hides* the parent's. The subclass version is chosen when the code names the subclass type; a call through a parent-typed reference still runs the parent's version, whatever the object. Overriding needs dispatch on an object, and a static call has none.)
- "Can a static method hide an instance method, or the reverse?" (Neither compiles. A subclass instance method can't override a static one, and a subclass static method can't hide an instance one — the compiler rejects both with "cannot override".)

Other follow-ups:

- "When exactly does static initialization happen?" (When the class is first *initialized*, which the JVM does immediately before the first instance creation, static method call, static field assignment, or read of a static field that is not a constant variable — and also when a subclass is initialized or `Class.forName` is called. Loading can happen earlier and does not run static code. Reading a `static final` compile-time constant such as `static final int MAX = 10` does not initialize the class, because the compiler copies the value into the caller.)
- "Can you override a static method?" (No — you can only *hide* it; the call is resolved at compile time based on the reference's declared type, not overridden polymorphically.)

#### Edge cases
- Static field initializers and static initialization blocks run once, in the order they appear in the source, when the class is initialized — before any instance is created.
- A `static` field in a class hierarchy is shared even between parent and child references if not redeclared in the child — easy to trip up on when debugging unexpected shared state.
- If a static initializer throws, the first use fails with `ExceptionInInitializerError` and every later use of the class fails with `NoClassDefFoundError` — the class is marked unusable for the life of its class loader.

#### Common mistakes
- Trying to access `this` inside a static method (compile error).
- Assuming each subclass gets its own independent copy of an inherited static field — it doesn't, unless explicitly redeclared in the subclass (which then hides, not shares, the parent's field).
- Writing `obj.staticMethod()` and expecting it to depend on `obj`'s runtime type — it never does.

#### Comparisons

| | Static (class) member | Instance member |
|---|---|---|
| Copies in memory | One per class (per class loader), shared by all | One per object |
| Access | `ClassName.member` (via an instance compiles, but is resolved by the reference's declared type — discouraged) | `instance.member` |
| Can use `this`? | No | Yes |
| Overridable? | No (can only be hidden) | Yes (if not private/static/final) |
| Created when | The class is initialized | The object is created |

#### Complexity
Not applicable.

#### Frequently confused with
Static method "hiding" vs. instance method "overriding" — these look syntactically similar but resolve completely differently (compile-time vs. runtime). Class *loading* vs class *initialization* — static code runs at initialization.

#### Important facts to remember
- Static members exist once per class (per class loader) and are created when the class is initialized, shared across all instances.
- Static methods cannot use `this` or directly call instance methods/fields.
- Static methods can be hidden, never truly overridden.
- Reading a compile-time constant does not initialize its class.

---

### 2.5 Encapsulation

#### Definition
Encapsulation is bundling an object's data with the methods that operate on it, while restricting direct external access to that data — typically via `private` fields and methods that expose meaningful operations rather than raw state.

#### Why it exists
To protect object invariants and allow internal implementation to evolve without breaking external code that depends on the class's public behavior.

#### Interview explanation
**In 30 seconds** — Encapsulation means the object owns its state: fields are private, and the only way to change them is through methods that enforce the object's rules. The point is invariants — a balance that can't go negative because `withdraw` checks it — and the freedom to change the representation later. Getters and setters for every field are not encapsulation; they hand control straight back to callers.

**If they push deeper** — It is distinct from information hiding, which is about concealing design decisions that might change, and from abstraction, which is about choosing the essential operations to expose. Encapsulation also leaks through references: a getter that returns an internal `List` lets callers mutate the object without touching a field, so mutable state must be copied on the way in and out. And `private` is enforced by the compiler and the JVM, but reflection can still bypass it for classpath code — it is a design boundary, not a security boundary.

**What they test** — Be ready to justify encapsulation beyond "just making fields private" — the real value is *validation* and *implementation freedom*, not the mechanical getter/setter pattern alone.

#### Syntax
```java
class Temperature {
    private double celsius;
    void setCelsius(double c) {
        if (c < -273.15) throw new IllegalArgumentException("Below absolute zero");
        this.celsius = c;
    }
    double getCelsius() { return celsius; }
}
```

#### Example
```java
class Account {
    private BigDecimal balance = BigDecimal.ZERO;
    void deposit(BigDecimal amt) {
        if (amt.signum() <= 0) throw new IllegalArgumentException("Deposit must be positive");
        balance = balance.add(amt);
    }
}
```

Predict the output — a question below asks for it:

```java
class Team {
    private final List<String> members;
    Team(List<String> members) { this.members = members; }
    List<String> members() { return members; }
    int size() { return members.size(); }
}

List<String> names = new ArrayList<>(List.of("Ann"));
Team team = new Team(names);
names.add("Bob");
team.members().add("Cid");
System.out.println(team.size());
```

#### Common interview questions
- "What is encapsulation, and how does Java enforce it?" (Keeping an object's state under its own control: callers change it only through methods that uphold the object's invariants. Java enforces the boundary with access modifiers — `private` fields are unreachable from other classes at compile time and at link time. The design part — which operations to expose — is up to you. Trap: answering only "private fields with getters and setters".)
- "Is a class with all-public fields encapsulated?" (No. Any code can put it into any state, so it can't guarantee a single invariant, and its representation can never change without breaking callers.)
- "Why prefer immutable objects (final fields, no setters) in some designs?" (Simpler reasoning, inherent thread-safety, no invalid intermediate states.)
- "What does the snippet in the Example print?" (`3`. The constructor stored the caller's list without copying, so `names.add("Bob")` changed the team; the getter returned the same list, so `add("Cid")` changed it again. `private final` protected the *field*, not the list it refers to. Fix: `this.members = List.copyOf(members)` and return the immutable copy.)
- "What is the difference between encapsulation, information hiding and abstraction?" (Encapsulation bundles state with behaviour and controls access to it. Information hiding conceals design decisions likely to change — the representation, the algorithm — behind a stable interface. Abstraction chooses which essential operations the interface offers. Encapsulation is usually the mechanism that achieves information hiding.)
- "A teammate adds `setBalance(BigDecimal)` so a report job can fix data. What is the risk?" (Every caller now can set any balance, bypassing the deposit and withdrawal rules and the audit trail they produce. Add a specific, validated operation for the correction — `applyAdjustment(amount, reason)` — instead of a general setter.)

#### Follow-up questions
Interviewers rarely stop at "What is encapsulation, and how does Java enforce it?" — they drill down from your answer. Answer each step before opening it:

- "If the field is private, how can a caller still corrupt the object?" (Through a reference to mutable internal state: a getter returning the internal `List`, `Date` or array, or a constructor that stored the caller's mutable argument. The caller mutates the object those references lead to without touching the field.)
- "How do you close that hole?" (Copy on the way in and on the way out — `List.copyOf`, `new Date(d.getTime())`, `array.clone()` — or store immutable types to begin with. Copy *before* validating, so the caller can't change the value between the check and the copy.)
- "Is `private` per object or per class?" (Per class. Code in `BankAccount` can read another `BankAccount`'s private fields — which is what makes `equals(Object other)` possible. Encapsulation protects the class's invariants from other classes, not one instance from another.)
- "Can reflection break encapsulation?" (For your own classpath code, yes — `setAccessible(true)` reads and writes private fields. Since Java 16/17, packages of a named module that are not opened refuse it, which is why the JDK's internals are no longer reachable that way. Treat encapsulation as a design guarantee, not a security mechanism.)

Other follow-ups:

- "If a getter just returns a private field with no logic, is that still 'encapsulation'?" (Technically yes — it hides the field behind a method, preserving the *option* to add logic later without changing the public API — but it provides no protection by itself.)
- "How does encapsulation relate to immutability?" (Immutability removes mutation altogether — no setters exist, so state can never change after construction. Encapsulation is what makes that enforceable: private final fields, no mutators and defensive copies of mutable components (2.21).)

#### Edge cases
- Returning a mutable field directly (a `List`, `Map`, array, or mutable custom object) from a getter breaks encapsulation even if the field itself is `private` — the caller gets a live handle to internal state.
- Reflection can bypass `private` access (`field.setAccessible(true)`) for classes on the classpath; since Java 16/17 it fails for packages a named module does not open, including all JDK internals. Encapsulation is a compile-time/language-level guarantee, not an absolute security boundary.
- `Collections.unmodifiableList(items)` is a read-only *view*: callers can't change it, but they see every later change the class makes to `items`. `List.copyOf(items)` is a snapshot.

#### Common mistakes
- Adding a public setter for every private field "just in case," which effectively defeats encapsulation.
- Forgetting to defensively copy mutable fields on the way in (constructor/setter) and out (getter).

#### Comparisons

| | Public fields | Encapsulated (private + accessors) |
|---|---|---|
| Validation possible? | No | Yes |
| Can change internal representation later? | No — breaks callers | Yes — public API stays stable |
| Thread-safety control | None | Can add synchronization inside accessors |

#### Complexity
Not applicable.

#### Frequently confused with
Encapsulation vs. abstraction — encapsulation is about *hiding data/state and controlling access*; abstraction is about *hiding implementation complexity and exposing only relevant behavior*. They're related but distinct. Encapsulation vs. information hiding — information hiding is the goal (conceal decisions that may change); encapsulation is the usual mechanism.

#### Important facts to remember
- Encapsulation ≠ "private fields + getters/setters for everything" — it's about controlled, validated access.
- Reflection can bypass encapsulation for classpath code; it's a design/compile-time guarantee, not a hard security wall.
- Defensive copying is required for mutable fields to preserve real encapsulation.
- `private` is per class, not per object.

---

### 2.6 Inheritance

#### Definition
Inheritance lets a subclass acquire the accessible fields and methods of a superclass using `extends`, modeling an "is-a" relationship: the subclass becomes a subtype of the superclass.

#### Why it exists
To establish type hierarchies in which a subclass object can stand in for its superclass — the basis of subtype polymorphism. Reuse of the superclass's code comes with it, but is not on its own a reason to inherit.

#### Interview explanation
**In 30 seconds** — `class Dog extends Animal` says a Dog *is an* Animal: a `Dog` can be used wherever an `Animal` is expected, and it inherits `Animal`'s accessible members, which it can extend or override. Java allows one superclass per class but any number of interfaces. Reuse alone doesn't justify inheritance — if "is a" isn't true, use composition.

**If they push deeper** — A subclass is coupled to its parent's implementation, not just its API: the fragile base class problem means a subclass can break when the parent changes how its own methods call each other (the `HashSet.addAll` → `add` double-count is the classic case). That is why parents should be designed and documented for extension or closed with `final` or `sealed`. Java forbids multiple class inheritance because classes carry state and constructors; interfaces carry neither, so multiple interface inheritance — including default methods since Java 8 — is allowed, with explicit conflict rules.

**What they test** — Know cold: Java allows single inheritance of classes but multiple inheritance of interfaces. Be ready to discuss "composition over inheritance" as a design principle interviewers love to probe.

#### Syntax
```java
class Vehicle {
    void move() { System.out.println("Moving"); }
}
class Car extends Vehicle {
    void honk() { System.out.println("Honk!"); }
}
```

#### Example
```java
class Shape {
    double area() { return 0; }
}
class Rectangle extends Shape {
    double width, height;
    Rectangle(double w, double h) { width = w; height = h; }
    @Override double area() { return width * height; }
}
```

Predict the output — a question below asks for it:

```java
class CountingSet<E> extends HashSet<E> {
    int added;
    @Override public boolean add(E e) { added++; return super.add(e); }
    @Override public boolean addAll(Collection<? extends E> c) {
        added += c.size();
        return super.addAll(c);
    }
}

CountingSet<String> s = new CountingSet<>();
s.addAll(List.of("x", "y", "z"));
System.out.println(s.added);
```

#### Common interview questions
- "Why doesn't Java support multiple inheritance of classes?" (Because classes carry state: two superclasses would each bring fields and constructors, with no single initialization order, and conflicting method implementations would need a resolution rule. Java keeps one superclass and allows multiple inheritance of type through interfaces, which have no instance state. The "diamond problem" is the usual name for the ambiguity, but state is the deeper reason.)
- "What is the 'diamond problem' and how does Java avoid/handle it for interfaces?" (For conflicting default methods, Java applies rules: a method from a superclass wins over any default; a more specific interface — one that extends the other — wins over its parent. Only if neither applies must the class override the method and choose, optionally calling `A.super.m()`. Java forces you to disambiguate rather than picking silently.)
- "Composition vs. inheritance — when would you choose one over the other?" (Inheritance when the subclass genuinely *is a* kind of the parent and can be used anywhere the parent is expected — and the parent is designed for extension. Composition when you only want to reuse behaviour: hold the other object in a field and call it. Composition depends only on the public API, so the parent's internals can't break you, and the part can be swapped. Trap: choosing inheritance because two classes share some code.)
- "What does the snippet in the Example print?" (`6`. `addAll` adds 3, then `super.addAll` — inherited from `AbstractCollection` — calls `add` once per element, which dispatches to the overriding `add` and adds 3 more. The subclass relied on an implementation detail of its parent: the fragile base class problem.)
- "Why is reuse alone not a good reason to inherit?" (Because inheritance also makes the subclass a subtype: it must honour every inherited method's contract and exposes the whole parent API. `Stack extends Vector` reused `Vector`'s storage and inherited `add(int, E)`, so callers can insert into the middle of a stack.)
- "You need a `Set` that logs every insertion. Do you extend `HashSet`?" (Better to wrap it: a class that implements `Set` and forwards to a private `HashSet`, logging in its own `add` and `addAll`. Forwarding depends only on `Set`'s contract, so it can't double-count however `HashSet` is implemented, and it works with any `Set`.)

#### Follow-up questions
Interviewers rarely stop at "Composition vs. inheritance — when would you choose one over the other?" — they drill down from your answer. Answer each step before opening it:

- "What exactly makes inheritance more tightly coupled?" (A subclass sees the parent's protected members and relies on how its methods call each other — its *self-use*. Composition sees only the public API. Changing a parent's internals can break a subclass; it cannot break a class that merely holds a reference.)
- "How can a class be made safe to extend?" (Document its self-use — which overridable methods each public method calls, as the JDK does with `@implSpec` — never call overridable methods from constructors, and keep the protected surface small. Effective Java's rule: design and document for inheritance, or prohibit it.)
- "And how do you prohibit it?" (Make the class `final`, or give it only private constructors and expose static factories. Since Java 17, `sealed` permits a fixed list of subclasses instead.)
- "Does Java's `final String` cost you anything?" (You can't subclass `String` to add behaviour — but you never needed to: a static utility or a wrapper does it. In exchange, every `String` is guaranteed immutable, which hash keys, security checks and string sharing all rely on.)

Other follow-ups:

- "Can a subclass access private members of its parent?" (No — `private` members are not inherited and not accessible from a subclass, which is why a subclass can't name them. The one exception is a subclass nested in the same top-level class: `private` is scoped to the top-level class, so nested classes can reach it.)
- "What is the 'fragile base class' problem?" (A seemingly safe change to a parent class breaks subclasses in unexpected ways because they depended on undocumented parent behavior.)

#### Edge cases
- `final` classes cannot be extended at all (e.g., `String`, `Integer`) — a deliberate design choice to prevent unsafe subclassing of core immutable types.
- Constructors are not inherited, so every level of a hierarchy needs its own constructor(s) — declared or the compiler's default — even if just delegating via `super(...)`.
- A `sealed` class (Java 17) can extend only to the classes it `permits`; each of those must be `final`, `sealed` or `non-sealed`.
- Every class has exactly one direct superclass except `Object`, which has none.

#### Common mistakes
- Using inheritance where there's no true "is-a" relationship, just to reuse code (classic anti-pattern: `Stack extends Vector` in the legacy JDK, now considered a design mistake).
- Forgetting that private fields aren't inherited, then being surprised a subclass "can't see" a parent's private field even though it's technically part of every instance's memory layout.

#### Comparisons

| | Inheritance ("is-a") | Composition ("has-a") |
|---|---|---|
| Coupling | Tight (subclass depends on parent internals/contract) | Loose (object holds a reference, uses its public API) |
| Flexibility | Fixed at compile time (single parent) | Can swap implementations at runtime |
| Preferred when | Genuine type hierarchy exists | Reusing behavior without a true "is-a" relationship |

#### Complexity
Not applicable.

#### Frequently confused with
Inheritance vs. interface implementation — inheritance (`extends`) shares state and implementation from one parent; interface implementation (`implements`) only guarantees a contract (plus optional default methods), with no shared instance state.

#### Important facts to remember
- Single inheritance for classes; multiple for interfaces.
- Private members are never inherited; a subclass reaches them only if it is nested in the same top-level class.
- "Composition over inheritance" is a widely-endorsed design principle, not just a slogan — favor it when there's no true "is-a" relationship.
- Inheritance is justified by IS-A and substitutability, not by reuse alone.

---

### 2.7 Access Modifiers

#### Definition
Keywords (`public`, `protected`, `private`, and package-private/default) that control the visibility scope of a class, field, method, or constructor.

#### Why it exists
To enforce encapsulation boundaries — checked by the compiler and again by the JVM at link time — controlling exactly which code can see and use a given member.

#### Interview explanation
**In 30 seconds** — Four levels, narrowest first: `private` (the class), package-private with no keyword (the package), `protected` (the package plus subclasses in other packages), `public` (everyone). Top-level classes can only be `public` or package-private. The compiler enforces them, and the JVM re-checks at link time.

**If they push deeper** — Two rules catch people out. `protected` across packages works only through the subclass's own type: `PremiumAccount` can read `balance` on itself or another `PremiumAccount`, but not on a plain `Account` reference. And `private` is per class, not per object — a method can read the private fields of any instance of its own class, which is how `equals` works. Reflection can bypass access for classpath code, but not for packages a named module doesn't open.

**What they test** — Memorize the visibility table cold. Interviewers often ask edge-case questions about `protected` visibility across packages specifically, since it's the most nuanced of the four.

#### Syntax
```java
public class Account {
    private double balance;         // only this class
    protected String accountType;   // package + subclasses
    String branch;                  // package-private (default) - only same package
    public String owner;            // everywhere
}
```

#### Example
```java
package com.bank;
public class Account {
    protected double balance;
}
```
```java
package com.bank.premium;
import com.bank.Account;
public class PremiumAccount extends Account {
    void show() {
        System.out.println(balance); // accessible: protected + subclass, different package
    }
}
```

Predict which lines compile — a question below asks for it:

```java
package com.bank;
public class Account {
    protected double balance;
    protected Account() {}
}
```
```java
package com.bank.premium;
import com.bank.Account;

public class PremiumAccount extends Account {
    void check(PremiumAccount mine, Account any) {
        System.out.println(this.balance);   // line 1
        System.out.println(mine.balance);   // line 2
        System.out.println(any.balance);    // line 3
        Account fresh = new Account();      // line 4
    }
}
```

#### Common interview questions
- "What's the difference between `protected` and default (package-private) access?" (Both allow any class in the same package. `protected` additionally lets subclasses in *other* packages use the member — through their own type. So `protected` is the wider of the two. Trap: ranking `protected` below package-private.)
- "Can a `private` method be overridden?" (No — `private` methods aren't inherited/visible to subclasses at all, so a subclass method with the same signature is a completely new, unrelated method, not an override.)
- "What access level should interface methods have?" (Implicitly `public` — except Java 9+ *private* interface methods, which exist purely as internal helpers for default methods, not part of the contract.)
- "Which lines in the Example compile?" (Lines 1 and 2 compile; lines 3 and 4 do not. A subclass in another package may use an inherited `protected` member only through `this` or a reference of its own type — `any` might be some other subclass's object. The `protected` constructor can be called only through `super(...)`, or by creating an anonymous subclass with `new Account() {}`.)
- "Why does `protected` restrict access through a superclass reference?" (Because that object may belong to a different subclass with its own invariants. `PremiumAccount` is trusted with *its own kind* of account, not with every `Account` in the system; the rule stops one subclass from reaching into another's state.)
- "You need a helper method that tests can call but other packages shouldn't. What access do you give it?" (Package-private, with the test in the same package — Maven and Gradle compile `src/test/java` into the same package as the class. Making it `public` just for tests turns it into API that someone will depend on.)

#### Follow-up questions
Interviewers rarely stop at "What's the difference between `protected` and default (package-private) access?" — they drill down from your answer. Answer each step before opening it:

- "Can a subclass in another package call a protected method on any instance of the parent?" (No — only on `this` or on references typed as the subclass or a subtype of it. `someAccount.recalculate()` with a plain `Account` reference does not compile.)
- "Can a method read the private fields of another object of the same class?" (Yes. Access is checked per class, not per object, so `other.balance` inside `Account` compiles. That is what lets `equals` and copy constructors work.)
- "If access is checked at compile time, can recompiling one class let another break the rules?" (No. The JVM checks access again when it links the calling class, so code compiled against a member that later became `private` fails with `IllegalAccessError` rather than reaching it.)
- "So is `private` a security boundary?" (Not on its own. Reflection with `setAccessible(true)` reaches private members of classpath code; since Java 16/17 that fails only for packages a named module does not open. Use modules and real access control for security, and treat `private` as a design boundary.)

Other follow-ups:

- "Can a top-level class be `private` or `protected`?" (No — top-level classes can only be `public` or package-private/default; `private`/`protected` are only valid for members and nested classes.)
- "Does `protected` allow access from a subclass in a different package via any reference, or only via inheritance?" (Only through inheritance-related access — specifically, through a reference of the subclass's own type or a subtype, not through an arbitrary `Account` reference obtained some other way, in a different package.)

#### Edge cases
- `protected` access across packages only applies through the subclass relationship itself — a subclass in another package can access an inherited `protected` member on *itself* or other instances of its own subclass type, but not on an arbitrary superclass-typed reference from that other package.
- Package-private members are invisible even to subclasses if those subclasses live in a different package — `protected` is required for that case. Such a method is not inherited there, so a same-signature method in that subclass does not override it.
- A `protected static` member is reachable from a subclass in another package through the class name, without the own-type restriction.

#### Common mistakes
- Assuming `protected` means "any subclass anywhere can freely access it via any reference" — the actual rule is more restrictive across packages (see edge case above).
- Making a top-level class `private`, not realizing it's disallowed by the compiler.

#### Comparisons

| Modifier | Same class | Same package | Subclass (diff. package) | Everywhere |
|---|---|---|---|---|
| `private` | ✅ | ❌ | ❌ | ❌ |
| default | ✅ | ✅ | ❌ | ❌ |
| `protected` | ✅ | ✅ | ✅ (restricted) | ❌ |
| `public` | ✅ | ✅ | ✅ | ✅ |

#### Complexity
Not applicable.

#### Frequently confused with
`protected` vs. default (package-private) — the key difference (subclass access across packages) is the single most-tested nuance.

#### Important facts to remember
- Top-level classes can only be `public` or package-private, never `private`/`protected`.
- `private` members are never inherited; outside their top-level class they are invisible to subclasses.
- `protected` cross-package access is restricted to access through the subclass's own type, not arbitrary superclass references.
- `private` is per class, not per object.

---

### 2.8 Composition, Aggregation and Association

#### Definition
Composition builds a class from other objects held in its fields (HAS-A) and delegates work to them, instead of inheriting from them (IS-A). Association, aggregation and composition are increasingly strong forms of HAS-A: knowing another object, grouping parts that can exist independently, and owning parts whose lifetime is tied to the whole.

#### Why it exists
Inheritance couples a class to its parent's implementation and makes it a subtype whether that is wanted or not. Most reuse only needs another object's behaviour, which a field provides with looser coupling and the freedom to swap the part.

#### Interview explanation
**In 30 seconds** — IS-A means inheritance: `Car extends Vehicle`, so a car can be used anywhere a vehicle is expected. HAS-A means composition: `Car` holds an `Engine` in a field and calls it. Composition is usually preferred for reuse because it depends only on the part's public API, the part can be swapped — often behind an interface — and the parent's internals can't break you. Use inheritance when the subtype relationship is real.

**If they push deeper** — Association, aggregation and composition differ by ownership and lifetime: association is a plain "uses" link, aggregation groups parts that can outlive the whole or be shared (a team and its players), and composition owns parts that die with it (an order and its lines). Java doesn't enforce any of that — all three are a reference in a field — so ownership is a convention: the class creates or copies its parts and never exposes them. The trade-off of composition is forwarding boilerplate, and the wrapper isn't a subtype of the part unless it implements the part's interface.

#### Syntax
```java
class Car {
    private final Engine engine;          // HAS-A
    Car(Engine engine) { this.engine = engine; }
    void start() { engine.start(); }      // delegation
}
class SportsCar extends Car {             // IS-A
    SportsCar(Engine engine) { super(engine); }
}
```

#### Example
```java
class Order {                                     // composition: Order owns its lines
    private final List<OrderLine> lines = new ArrayList<>();
    void addLine(String sku, int qty) { lines.add(new OrderLine(sku, qty)); }
    List<OrderLine> lines() { return List.copyOf(lines); }
}
class Team {                                      // aggregation: players exist independently
    private final List<Player> players;
    Team(List<Player> players) { this.players = List.copyOf(players); }
}
```

Predict the output — a question below asks for it:

```java
class CountingSet<E> {
    private final Set<E> inner;
    private int added;
    CountingSet(Set<E> inner) { this.inner = inner; }
    boolean add(E e) { added++; return inner.add(e); }
    boolean addAll(Collection<? extends E> c) { added += c.size(); return inner.addAll(c); }
    int added() { return added; }
}

CountingSet<String> s = new CountingSet<>(new HashSet<>());
s.addAll(List.of("x", "y", "z"));
System.out.println(s.added());
```

#### Common interview questions
- "What is the difference between IS-A and HAS-A?" (IS-A is a subtype relationship expressed with `extends` or `implements`: the subclass can be used wherever the parent is expected. HAS-A is a field: the class uses another object without becoming its kind. Test it with the sentence — a car *is a* vehicle, a car *has an* engine.)
- "Why is composition often preferred over inheritance?" (It couples you to the part's public contract instead of its implementation, so the fragile base class problem can't occur; the part can be swapped at runtime or in tests; and a class can compose many parts but extend only one class. Trap: concluding inheritance is always wrong — it's right for genuine, designed-for-extension hierarchies.)
- "What is the difference between aggregation and composition?" (Both are whole–part relationships. In aggregation the parts have their own lifetime and may be shared — a player can leave a team. In composition the whole owns the parts and they don't outlive it — an order line has no meaning without its order. Java code looks the same for both; the difference is whether the whole creates or copies its parts and keeps them private.)
- "What does the snippet in the Example print?" (`3`. The wrapper adds 3 in its own `addAll`, then delegates to `HashSet.addAll`, whose internal `add` calls go to the `HashSet`, not back to the wrapper. Compare the subclass version in 2.6, which prints 6.)
- "Does Java enforce composition's ownership?" (No. A field holds a reference, and nothing stops the same object being referenced elsewhere. Ownership holds only if the class creates or defensively copies its parts and never returns them; garbage collection then removes them together with the whole once both are unreachable.)
- "Your `ReportService` extends `EmailSender` to reuse its `send` method. What would you change?" (A report service is not an email sender, so it shouldn't expose `send` and every other inherited method to its callers. Give it a field — `private final EmailSender sender;` passed into the constructor — and call `sender.send(...)`. Now tests can pass a fake sender and the mail implementation can change freely.)

#### Follow-up questions
Interviewers rarely stop at "Why is composition often preferred over inheritance?" — they drill down from your answer. Answer each step before opening it:

- "If composition is better, how does the wrapper get used where the original type is expected?" (By implementing the same interface and forwarding each method to the wrapped object — the forwarding or decorator shape. Composition gives reuse; the interface gives substitutability.)
- "What does that forwarding cost you?" (Boilerplate — one method per interface method — and the self problem: the wrapped object knows nothing about the wrapper, so if it passes `this` to a callback, the callback gets the inner object and bypasses the wrapper.)
- "When is inheritance still the right choice?" (When the subclass truly is a kind of the parent, must be usable wherever the parent is, and the parent was designed and documented for extension — or is an abstract class meant to be extended, such as a framework's base class.)
- "And how does this connect to dependency injection?" (Dependency injection is composition with the parts supplied from outside: the class declares the collaborators it HAS in its constructor, and the caller or a container decides which implementations to pass. That is why constructor parameters are usually interfaces.)

Other follow-ups:

- "Is a method parameter a HAS-A relationship?" (It is an association — the method uses the object for the duration of the call. HAS-A usually means a field that the object keeps.)

#### Edge cases
- A class can be both: `class BoundedQueue<E> implements Queue<E>` IS-A `Queue` and HAS-A `ArrayDeque` inside — implementing an interface while composing an implementation is the most common healthy shape.
- An inner (non-static nested) class instance has an implicit reference to its outer instance — a hidden association that keeps the outer object reachable as long as the inner one is.
- Two wrappers around the same object share it: aggregation by accident. A decorator that "owns" the object it wraps must not let the caller keep using the unwrapped reference.

#### Common mistakes
- Inheriting to reuse a handful of methods, then inheriting dozens more that callers can misuse (`Stack extends Vector`).
- Exposing owned parts through getters, turning composition into shared mutable state.
- Treating UML's filled and hollow diamonds as something the compiler checks — they document intent only.

#### Comparisons

| | Inheritance (IS-A) | Composition (HAS-A) |
|---|---|---|
| Relationship | Subtype of the parent | Holds a reference to the part |
| Coupled to | Parent's implementation and protected members | Part's public API only |
| Can change at runtime | No | Yes — assign a different part |
| How many | One superclass | Any number of parts |
| Substitutability | Automatic | Only if the class also implements the part's interface |

#### Complexity
Delegation adds one method call per forwarded operation — negligible, and usually inlined by the JIT.

#### Frequently confused with
Aggregation vs. composition — same Java code, different ownership. Composition vs. dependency injection — DI is one way to supply composed parts, not a different relationship.

#### Important facts to remember
- IS-A → `extends`/`implements`; HAS-A → a field.
- Code reuse alone is not a reason to inherit; composition reuses without subtyping.
- Java doesn't enforce aggregation or composition semantics — ownership is a convention the class maintains.
- A wrapper is substitutable for the wrapped type only if it implements the same interface.

---

### 2.9 Method Overloading

#### Definition
Method overloading is declaring several methods with the same name and different parameter lists in one class (inherited methods included). The compiler selects one overload per call from the arguments' declared types — compile-time polymorphism.

#### Why it exists
So one natural name can cover related operations on different inputs (`println(int)`, `println(String)`) without giving up compile-time type checking.

#### Interview explanation
**In 30 seconds** — Overloads share a name and differ in parameter types, number or order; the return type alone can't distinguish them. The compiler picks the overload at compile time from the *declared* types of the arguments, so an argument's runtime type never changes the choice. Constructors overload the same way.

**If they push deeper** — Resolution runs in three phases and stops at the first that finds a match: widening only, then boxing/unboxing, then varargs. That's why `m(5)` prefers `m(long)` over `m(Integer)`, and `m(Integer)` over `m(int...)`. Within a phase the most specific overload wins; if none is most specific, the call is ambiguous and fails to compile — `s(null)` with `s(String)` and `s(StringBuilder)` is the classic case.

#### Syntax
```java
class Calculator {
    int add(int a, int b)          { return a + b; }
    double add(double a, double b) { return a + b; }
    int add(int a, int b, int c)   { return a + b + c; }
}
```

#### Example
```java
void print(int x)    { System.out.println("int"); }
void print(double x) { System.out.println("double"); }
void print(String x) { System.out.println("String"); }

print(5);      // int
print(5.0);    // double
print("5");    // String
print('a');    // int    — char widens to int
print(5L);     // double — long widens to double
```

Predict the output — a question below asks for it:

```java
static void m(long x)    { System.out.println("long"); }
static void m(Integer x) { System.out.println("Integer"); }
static void v(int... x)  { System.out.println("varargs"); }
static void v(Integer x) { System.out.println("Integer"); }
static void o(Object x)  { System.out.println("Object"); }
static void o(String x)  { System.out.println("String"); }

m(5);
v(5);
o(null);
Object s = "text";
o(s);
```

#### Common interview questions
- "What is method overloading?" (Several methods in one class sharing a name with different parameter lists; the compiler chooses one from the argument types at compile time. Example: `print(int)`, `print(double)`, `print(String)`.)
- "Can you overload a method by changing only its return type?" (No — it's a compile error ("method is already defined"). A call like `add(1, 2)` gives the compiler nothing to choose a return type by, so only parameter lists distinguish overloads.)
- "Can static methods and `main` be overloaded?" (Yes. Overloading is about signatures, so static methods overload like instance ones, and a class may declare several `main` methods. The launcher looks for `main(String[])` — and since Java 25 falls back to a no-argument `main` if there is none.)
- "What does the snippet in the Example print?" (`long`, `Integer`, `String`, `Object`. `m(5)` matches `m(long)` by widening in phase 1, before boxing is considered. `v(5)` boxes in phase 2, before varargs. `o(null)` fits both, and `String` is more specific. `o(s)` uses the declared type `Object`, whatever `s` holds at runtime.)
- "Why is overload resolution done at compile time rather than at runtime?" (Because the compiler knows the declared types and can check the call, and Java's runtime dispatch is single dispatch — it only looks at the receiver object. Choosing the overload up front keeps calls cheap and predictable; dispatching on argument types at runtime (multiple dispatch) is something Java doesn't do.)
- "A colleague calls `list.remove(1)` on a `List<Integer>` holding `[10, 20, 30]` to remove the value 1. What happens?" (It removes `20`, the element at index 1. `remove(int)` matches without boxing, so it wins over `remove(Object)`. Use `list.remove(Integer.valueOf(1))` to remove by value.)

#### Follow-up questions
Interviewers rarely stop at "What is method overloading?" — they drill down from your answer. Answer each step before opening it:

- "With `m(long)` and `m(Integer)`, which runs for `m(5)`?" (`m(long)`. Phase 1 allows widening but not boxing, and `int` widens to `long`, so the boxing candidate is never considered.)
- "And with `v(Integer)` and `v(int...)`, which runs for `v(5)`?" (`v(Integer)`. Varargs is the last resort, tried only if phases 1 and 2 find nothing.)
- "What if two overloads apply in the same phase?" (The most specific one wins — the one whose parameter types are assignable to the other's. If neither is, the call is ambiguous and won't compile: `s(null)` with `s(String)` and `s(StringBuilder)`.)
- "Can an argument's runtime type ever change which overload runs?" (No. Only the declared types matter. `Object x = "hi"; describe(x);` always calls `describe(Object)`. The only runtime choice Java makes is which *override* of the chosen signature runs, based on the receiver object.)

Other follow-ups:

- "Can a subclass overload a method it inherits?" (Yes. A subclass method with the same name and a different parameter list overloads the inherited one, and a subclass-typed reference can call either. With the same parameter list it would override instead.)

#### Edge cases
- `byte` and `short` arguments with only `print(int)` and `print(double)` choose `print(int)` — widening goes to the nearest wider type that has an overload.
- A method `take(int x)` called with a `null` `Integer` compiles — unboxing is allowed — and throws `NullPointerException` at runtime.
- `String.valueOf(null)` compiles and throws `NullPointerException`: `valueOf(char[])` is more specific than `valueOf(Object)`, so it is chosen and dereferences the null array.
- `Arrays.asList(intArray)` returns a list of size 1 holding the `int[]` itself — varargs over a generic `T...` can't take primitives, so the whole array becomes one element.

#### Common mistakes
- Expecting an overload to be chosen by the runtime type of an argument.
- Adding an overload that makes existing calls ambiguous — for example, adding `send(StringBuilder)` beside `send(String)` breaks every `send(null)` call site.
- Thinking a subclass "overrides" a method when its parameter type differs slightly — that's an overload, and the parent's version still runs for parent-typed calls. `@Override` catches it.

#### Comparisons

| | Overloading | Overriding |
|---|---|---|
| Where | Same class (inherited methods included) | Subclass redefines an inherited method |
| Signature | Same name, different parameter list | Same name and parameter list |
| Chosen | At compile time, from argument declared types | At runtime, from the receiver object's class |
| Return type | Free | Same or a subtype (covariant) |
| Applies to | Methods and constructors, static or instance | Instance methods only |
| Also called | Compile-time / static polymorphism | Runtime / dynamic polymorphism |

#### Complexity
Resolution happens entirely at compile time; overloading has no runtime cost.

#### Frequently confused with
Overloading vs. overriding — the most commonly confused pair of terms in Java OOP interviews (see the comparison table). Overloading vs. varargs — varargs is one parameter form an overload can use, and the last one the compiler tries.

#### Important facts to remember
- Overloads differ in parameter lists; return type alone is not enough.
- Choice is made at compile time from declared argument types.
- Phases: widening → boxing → varargs; then most specific; otherwise ambiguous.
- `List.remove(int)` vs `remove(Object)` is the classic overloading bug.

---

### 2.10 Method Overriding

#### Definition
Overriding is a subclass declaring an instance method with the same signature as an accessible inherited one, replacing it for objects of the subclass. Which implementation runs is decided at runtime from the receiver object's class.

#### Why it exists
So subclasses can specialise inherited behaviour while callers keep programming against the parent type — the mechanism behind runtime polymorphism.

#### Interview explanation
**In 30 seconds** — An override has the same name and parameter types as the inherited method. Its return type may be the same or a subtype; its access may be the same or wider; it may throw fewer or narrower checked exceptions but no new ones. `private`, `static` and `final` methods can't be overridden. Always annotate with `@Override` so the compiler catches accidental overloads.

**If they push deeper** — Every rule exists to keep the override substitutable: a caller written against the parent's signature, access and `throws` clause must still compile and behave correctly against any subclass. A `private` method isn't inherited, so a same-named subclass method is unrelated; a `static` one is hidden rather than overridden (2.11); a package-private method can be overridden only from the same package. Unchecked exceptions aren't restricted by the compiler, but throwing ones the parent's contract doesn't allow still breaks callers.

#### Syntax
```java
class Shape {
    double area() { return 0; }
}
class Circle extends Shape {
    private final double r;
    Circle(double r) { this.r = r; }
    @Override
    double area() { return Math.PI * r * r; }
}
```

#### Example
```java
class Parent {
    protected Number value() throws java.io.IOException { return 1; }
}
class Child extends Parent {
    @Override
    public Integer value() { return 2; }   // wider access, covariant return, drops the checked exception
}
// Not allowed in Child:
//   private Number value()                  — narrower access
//   Number value() throws Exception         — broader checked exception
//   static Number value()                   — static can't override an instance method
```

Predict the output — a question below asks for it:

```java
class P {
    private void hello() { System.out.println("P.hello"); }
    void greet() { hello(); }
}
class C extends P {
    void hello() { System.out.println("C.hello"); }
}

new C().greet();
new C().hello();
```

#### Common interview questions
- "What are the rules for overriding a method?" (Same name and parameter types; return type the same or a subtype; access the same or wider; no new or broader checked exceptions; the method must be an inherited instance method that isn't `final`. `@Override` makes the compiler verify all of it.)
- "Can you override a `private`, `static` or `final` method?" (No to all three. `private` isn't inherited, so a same-named method is new; `static` is hidden, chosen at compile time; `final` is forbidden by design.)
- "What is a covariant return type?" (An override may return a subtype of the parent method's return type — `Object clone()` can be overridden as `Point clone()`. Callers expecting the parent's type still get one, and callers using the subclass get the precise type without a cast. It applies to reference types only; a primitive return type must match exactly.)
- "What does the snippet in the Example print?" (`P.hello`, then `C.hello`. `P.hello` is private, so `C.hello` is a separate method, not an override; `greet()` was compiled inside `P` and calls `P`'s private method directly. Calling `hello()` on a `C` reference reaches `C`'s own method.)
- "Why can't an override narrow access or add checked exceptions?" (Because callers are compiled against the parent's declaration. If `Animal.speak()` is public and doesn't throw `IOException`, code calling `animal.speak()` has no `try` and assumes access — an override that hid the method or threw a new checked exception would break that code whenever a subclass object turned up.)
- "A subclass declares `boolean equals(Money other)` and `HashSet.contains` stops finding equal values. Why?" (That method overloads `equals(Object)` instead of overriding it; collections call `equals(Object)`, which still compares identity. Declare `equals(Object o)` with `@Override` — the annotation would have flagged the mistake.)

#### Follow-up questions
Interviewers rarely stop at "What are the rules for overriding a method?" — they drill down from your answer. Answer each step before opening it:

- "Why is the return type allowed to change at all?" (Because a subtype is still a valid instance of the declared return type, so substitutability holds. Before Java 5, return types had to match exactly and callers needed casts.)
- "Can an override throw a `RuntimeException` the parent doesn't declare?" (Yes — the compiler only restricts checked exceptions. Whether it *should* depends on the parent's documented contract; throwing `UnsupportedOperationException` from an override that promised to work is a Liskov violation even though it compiles.)
- "What does `@Override` actually guarantee?" (Only that the method overrides or implements a supertype method — otherwise it's a compile error. It changes nothing at runtime, and the method overrides with or without it; the annotation just turns a silent overload into an error.)
- "What happens if a parent constructor calls a method the child overrides?" (The child's override runs before the child's constructor body and field initializers, so it sees default values — `null`, `0`. 2.22 traces it. Don't call overridable methods from constructors.)

Other follow-ups:

- "Can a package-private method be overridden?" (Only by a subclass in the same package. In another package the method isn't inherited, so a same-signature method there is unrelated and the parent's own calls keep running the parent's version.)

#### Edge cases
- A subclass instance method can't have the same signature as a parent static method, and a subclass static method can't match a parent instance method — both are compile errors.
- Overriding a method of a generic superclass with a concrete type argument (`compareTo(Money other)` implementing `Comparable<Money>`) makes the compiler generate a *bridge method* `compareTo(Object)` that casts and forwards — which is why stack traces sometimes show a synthetic frame.
- An interface method implemented in a class must be `public`, because interface methods are implicitly public and an implementation can't narrow access.
- `synchronized` is not part of the signature — an override may add or drop it, so a parent's locking is not inherited by its overrides.

#### Common mistakes
- Overloading instead of overriding because of a parameter type mismatch (`equals(Point)`), then wondering why the new method never runs.
- Omitting `@Override`, so a later rename of the parent method silently disconnects every override.
- Assuming a cast changes which override runs — `((Animal) dog).sound()` still runs `Dog.sound()`.

#### Comparisons

| | Overriding | Hiding (2.11) |
|---|---|---|
| Applies to | Instance methods | Static methods and fields |
| Chosen by | Runtime class of the object | Declared type at compile time |
| `super` / qualified access | `super.m()` reaches the parent's version | `Parent.m()` or `super.field` reach the parent's member |
| `@Override` allowed | Yes | No — compile error on a static method |

#### Complexity
A call to an overridable method is resolved at runtime; HotSpot usually makes it as cheap as a direct call by inlining when only one or two implementations are seen at that call site (2.12).

#### Frequently confused with
Overriding vs. overloading (2.9) — same signature replaces, different parameter list adds. Overriding vs. hiding (2.11) — instance methods vs. static methods and fields.

#### Important facts to remember
- Same signature; covariant return allowed; access never narrower; no new/broader checked exceptions.
- `private`, `static`, `final` methods can't be overridden.
- `@Override` turns accidental overloads into compile errors.
- Overrides dispatch on the object's runtime class — casts don't change that.

---

### 2.11 Overriding vs Hiding

#### Definition
Overriding replaces an inherited *instance* method, and the version that runs is chosen at runtime from the object's class. Hiding happens when a subclass declares a *static* method or a *field* with the same name as an inherited one: both members exist, and the one used is chosen at compile time from the declared type.

#### Why it exists
Dynamic dispatch needs an object, and static members have none; fields are storage that the parent's compiled code depends on. So Java dispatches only instance methods and resolves static methods and fields by type.

#### Interview explanation
**In 30 seconds** — Only instance methods are overridden. With `Parent p = new Child();`, `p.instanceMethod()` runs `Child`'s version because the object is a `Child`; `p.staticMethod()` and `p.field` use `Parent`'s, because static methods and fields are resolved from the declared type at compile time. That is hiding: the subclass's member exists alongside the parent's rather than replacing it.

**If they push deeper** — A `Child` object carries both hidden fields, so `((Child) p).field` and `p.field` read different slots of the same object, and `Parent`'s own methods always read `Parent`'s field. Static methods are inherited — `Child.parentStatic()` compiles — but a static call through an instance is compiled against the declared type, so the object is ignored and even a `null` reference works. A static method can't hide an instance method or vice versa, and `@Override` on a static method is a compile error.

#### Syntax
```java
class Parent {
    static void staticMethod() { System.out.println("Parent static"); }
    void instanceMethod()       { System.out.println("Parent instance"); }
    String field = "Parent field";
}
class Child extends Parent {
    static void staticMethod() { System.out.println("Child static"); }      // hides
    @Override void instanceMethod() { System.out.println("Child instance"); } // overrides
    String field = "Child field";                                            // hides
}
```

#### Example
```java
Parent p = new Child();
p.instanceMethod();          // Child instance — runtime class decides
p.staticMethod();            // Parent static  — declared type decides
System.out.println(p.field); // Parent field   — declared type decides
```

Predict the output — a question below asks for it:

```java
class Base {
    int value = 1;
    static String tag() { return "Base"; }
    int doubled() { return value * 2; }
}
class Sub extends Base {
    int value = 10;
    static String tag() { return "Sub"; }
}

Base b = new Sub();
Sub s = (Sub) b;
System.out.println(b.value + " " + s.value);
System.out.println(b.tag() + " " + s.tag());
System.out.println(s.doubled());
Base nothing = null;
System.out.println(nothing.tag());
```

#### Common interview questions
- "Why can't Java override static methods?" (Overriding means picking an implementation from the object at runtime, and a static method is called on a class, with no object. The compiler fixes the target from the declared type — a static call names the class in the bytecode — so a subclass's same-signature static method can only hide the parent's. Trap: saying static methods aren't inherited; they are.)
- "What happens when a field is hidden?" (The subclass object gets a second field with the same name. Which one an expression reads depends on its declared type: `p.field` with `p` declared `Parent` reads the parent's, a `Child` reference reads the child's, and `super.field` reaches the parent's from inside `Child`. Methods compiled in `Parent` always read `Parent`'s field.)
- "What is the difference between overriding and hiding?" (Overriding applies to instance methods and is resolved at runtime from the object's class. Hiding applies to static methods and fields and is resolved at compile time from the declared type. Overriding replaces; hiding adds a second member alongside.)
- "What does the snippet in the Example print?" (`1 10`, `Base Sub`, `2`, `Base`. Fields: `b` is declared `Base`, `s` is declared `Sub`, so they read different slots of the same object. Static `tag()` follows the declared type too. `doubled()` is `Base`'s code reading `Base.value`, which is 1. The last call compiles to `Base.tag()`, so the `null` reference is never dereferenced.)
- "Why are fields resolved by declared type rather than by the object?" (Because a field is storage the declaring class's code depends on, possibly with a different type in the subclass. Behaviour is the polymorphic part of an object: if subclasses must vary a value, expose it through an overridable method, and the method dispatches.)
- "A subclass redeclares `protected int timeoutSeconds = 30;` to change the parent's default of 10, but requests still time out after 10 seconds. Why?" (It created a second field. The parent's timeout logic reads the parent's field, which is still 10. Assign the inherited field in the subclass constructor, or pass the value to the parent's constructor.)

#### Follow-up questions
Interviewers rarely stop at "Why can't Java override static methods?" — they drill down from your answer. Answer each step before opening it:

- "With `Parent p = new Child();`, what does `p.staticMethod()` run?" (`Parent.staticMethod()`. The compiler resolves it from `p`'s declared type, and `javac -Xlint` warns that a static method should be qualified by its type name.)
- "And if `p` is `null`?" (It still runs `Parent.staticMethod()` with no `NullPointerException` — the reference's value is never used for a static call. The same holds for a static field accessed through `null`.)
- "Is a parent's static method visible through the subclass at all?" (Yes — static methods are inherited, so `Child.parentOnlyStatic()` compiles. Hiding only happens when `Child` declares a method with the same signature.)
- "How do you get polymorphic behaviour for something that is currently static?" (Make it an instance method — on the object itself or on a strategy object that is passed in — or pass the behaviour as a lambda. Only instance methods dispatch on the object.)

Other follow-ups:

- "Can a subclass declare an instance method with the same signature as a parent static method?" (No — compile error: an instance method can't override a static one. The reverse, a static method matching a parent instance method, is also an error.)

#### Edge cases
- `@Override` on a static method fails to compile ("static methods cannot be annotated with @Override").
- A hiding static method must follow the same return-type and access rules as an override — it can't narrow access.
- A static field can hide an instance field and an instance field can hide a static one; the types needn't match.
- Interface static methods are not inherited by implementing classes at all — `ImplClass.staticFromInterface()` doesn't compile; call it as `InterfaceName.method()`.

#### Common mistakes
- Calling static methods through instances, which reads as polymorphic and isn't.
- Redeclaring a field to change its value for a subclass, which creates a second field instead.
- Forgetting that casts work the opposite way for the two rules: `((Child) p).field` and `((Child) p).staticMethod()` *do* switch to `Child`'s members, because the cast changes the declared type, while `((Parent) child).instanceMethod()` still runs `Child`'s override.

#### Comparisons

| | Instance method | Static method | Field |
|---|---|---|---|
| Same name in subclass | Overrides | Hides | Hides |
| Resolved by | Runtime class of the object | Declared type / class named | Declared type |
| Resolved when | Runtime | Compile time | Compile time |
| Through a `null` reference | `NullPointerException` | Works | Instance field: `NullPointerException`; static field: works |
| `@Override` | Allowed | Compile error | Not applicable |

#### Complexity
Not applicable — hidden members are bound at compile time.

#### Frequently confused with
Hiding vs. shadowing — *shadowing* is a local variable or parameter reusing a field's name inside one scope (`this.name = name`); *hiding* is a subclass member reusing an inherited member's name. Hiding vs. overriding — static/fields vs. instance methods.

#### Important facts to remember
- Only instance methods are polymorphic; static methods and fields are resolved by declared type.
- Hidden members coexist with the parent's — nothing is replaced.
- Static methods are inherited but never overridden.
- A static call through an instance ignores the instance, even `null`.

---

### 2.12 Polymorphism

#### Definition
Polymorphism is the ability for the same method call to behave differently depending on the actual runtime type of the object (runtime/dynamic polymorphism via overriding) or the compile-time argument types (compile-time/static polymorphism via overloading).

#### Why it exists
To let code operate generically against an abstraction, while the correct specific behavior is selected automatically at the appropriate time (compile time for overloads, runtime for overrides).

#### Interview explanation
**In 30 seconds** — Java has two kinds. Compile-time polymorphism is overloading: the compiler picks among same-named methods by argument types. Runtime polymorphism is overriding plus dynamic dispatch: with `Animal a = new Dog()`, `a.sound()` runs `Dog`'s version because the object is a `Dog`. The reference's declared type decides what you may call; the object's runtime class decides which override runs.

**If they push deeper** — Every call is resolved in two steps. The compiler checks the call against the declared type and fixes the signature, including the overload; at runtime the JVM finds that signature's implementation in the receiver's class. So `a.fetch()` fails to compile when `Animal` has no `fetch`, even though the object is a `Dog`, and an argument's runtime type never affects the choice — Java dispatches on the receiver only. Only instance methods dispatch: static methods and fields are resolved by declared type (hiding). The JVM's lookup technique — method tables, inline caches, JIT inlining — is an implementation detail, not part of the language.

**What they test** — This is one of the highest-yield OOP interview topics. Be ready to write code demonstrating dynamic dispatch, and clearly separate overloading (compile-time) from overriding (runtime) with a confident, precise explanation.

#### Syntax
```java
class Animal { void speak() { System.out.println("..."); } }
class Dog extends Animal { @Override void speak() { System.out.println("Woof"); } }

Animal a = new Dog(); // declared type Animal, actual type Dog
a.speak(); // "Woof" - decided at runtime by actual type
```

#### Example
```java
class Shape { double area() { return 0; } }
class Circle extends Shape {
    double r;
    Circle(double r) { this.r = r; }
    @Override double area() { return Math.PI * r * r; }
}
class Square extends Shape {
    double side;
    Square(double s) { side = s; }
    @Override double area() { return side * side; }
}
List<Shape> shapes = List.of(new Circle(2), new Square(3));
for (Shape s : shapes) System.out.println(s.area()); // correct area for each, via polymorphism
```

Predict the output — a question below asks for it:

```java
class Animal {
    void greet(Animal a) { System.out.println("Animal meets Animal"); }
    void greet(Dog d)    { System.out.println("Animal meets Dog"); }
}
class Dog extends Animal {
    @Override void greet(Animal a) { System.out.println("Dog meets Animal"); }
    @Override void greet(Dog d)    { System.out.println("Dog meets Dog"); }
}

Animal x = new Dog();
Animal y = new Dog();
Dog z = new Dog();
x.greet(y);
x.greet(z);
```

#### Common interview questions
- "Explain runtime polymorphism with an example." (`Animal a = new Dog(); a.speak();` prints `Woof`. The compiler accepts the call because `Animal` declares `speak()`; at runtime the JVM runs the override from the object's class, `Dog`. A loop over `List<Animal>` therefore gets each object's own behaviour with no type checks. Trap: saying the reference type decides — it decides only what is callable.)
- "What is dynamic method dispatch?" (The runtime mechanism behind overriding: for a call to an overridable instance method, the JVM selects the implementation from the receiver object's actual class — the nearest override walking up from that class — rather than from the reference's declared type. The language specifies the result; how the JVM does the lookup is an implementation detail.)
- "Can you achieve polymorphism with private or static methods?" (Not runtime polymorphism — both are resolved statically/at compile time. Only overridable instance methods dispatch dynamically: public or protected ones, and package-private ones only within their package; `final` ones can't be overridden. Static methods can still be overloaded, which is compile-time polymorphism.)
- "What does the snippet in the Example print?" (`Dog meets Animal`, then `Dog meets Dog`. The overload is chosen at compile time from the argument's declared type — `y` is declared `Animal`, `z` is declared `Dog`. The override is chosen at runtime from the receiver `x`, which is a `Dog`. Trap: answering `Dog meets Dog` for the first call because `y` is really a `Dog` — Java never dispatches on argument runtime types.)
- "Why does `a.fetch()` fail to compile when `a` holds a `Dog`?" (The compiler only knows the declared type, `Animal`, and must reject calls that wouldn't work for every `Animal` the variable could hold. The runtime object is irrelevant at compile time; to call `fetch()` you need a `Dog`-typed reference — a downcast after an `instanceof` check (2.13).)
- "A payment module has `if (p instanceof Card) … else if (p instanceof Wallet) …` in five places. How would you restructure it?" (Move the varying behaviour into the types: declare `charge()` on a `PaymentMethod` interface and implement it in each class, so callers write `p.charge()` once and a new payment type touches no existing code. If the set of types is closed and the logic belongs outside them, a `sealed` interface with an exhaustive `switch` is the modern alternative (Java 21).)

#### Follow-up questions
Interviewers rarely stop at "Explain runtime polymorphism with an example." — they drill down from your answer. Answer each step before opening it:

- "What decides whether `a.speak()` compiles, and what decides which code runs?" (The declared type of `a` decides whether it compiles — `Animal` must have a `speak()`. The runtime class of the object decides which implementation runs.)
- "Does the runtime type of an *argument* affect which method runs?" (No. Overloads are chosen at compile time from argument declared types; only the receiver is dispatched at runtime. Java is single dispatch. Double dispatch, when needed, is built by hand — the visitor pattern.)
- "What if `a` is `null`?" (The call compiles — `Animal` has the method — and throws `NullPointerException` at runtime, because there is no object to dispatch on. A static method called through a `null` reference would *not* throw (2.11).)
- "When the parent's own code calls an overridable method on `this`, which version runs?" (The subclass's override — dispatch uses the object, wherever the call is written. That is what makes the template method pattern work (2.15), and what makes calling overridable methods from a parent constructor dangerous (2.22).)

Other follow-ups:

- "If a field is 'overridden' in a subclass (same name), is that polymorphic too?" (No — field access is resolved at compile time based on the *declared* type of the reference, not the runtime type. Only methods exhibit dynamic dispatch; fields do not. This is a very popular trick question.)
- "What's the performance cost of virtual dispatch?" (A small indirect lookup cost vs. a direct call; modern JITs such as HotSpot's often eliminate this via inlining for monomorphic call sites — usually not a real-world bottleneck.)

#### Edge cases
- Static methods can be "hidden" by a subclass defining a method with the same signature, but this is **method hiding**, not overriding — resolved at compile time based on the reference's declared type, unlike true overriding.
- Calling an overridden method from within a parent constructor is dangerous: it dispatches to the *subclass's* override, which may run before the subclass's own fields are initialized, leading to surprising `null`/default values.
- A cast doesn't change which override runs: `((Animal) dog).speak()` still runs `Dog.speak()`. Only `super.speak()` inside `Dog` reaches the parent's version.
- Calling an instance method on a `null` reference compiles and throws `NullPointerException` at runtime.

#### Common mistakes
- Confusing field access with method dispatch — assuming a subclass's field "overrides" the parent's the same way a method would (fields are never polymorphic).
- Calling overridable instance methods from a constructor without realizing the subclass override might run against a not-yet-fully-initialized object.
- Expecting overload choice to follow the argument's runtime type.

#### Comparisons

| | Overloading | Overriding |
|---|---|---|
| Resolved | Compile time | Runtime |
| Relationship | Same class, including methods it inherits | Parent-child (inheritance) |
| Also called | Static/compile-time polymorphism | Dynamic/runtime polymorphism |
| Applies to | Methods (and constructors) | Instance methods only (not static, not fields) |

#### Complexity
The language specifies no cost. In HotSpot, call sites that see one or two receiver classes are inlined to roughly the cost of a direct call; class method calls otherwise use a constant-time table lookup, and interface calls a slightly more involved one.

#### Frequently confused with
Overloading vs. overriding (see comparisons above) — the single most commonly confused pair of terms in Java OOP interviews. Dynamic dispatch vs. runtime polymorphism — the mechanism vs. the behaviour it produces.

#### Important facts to remember
- Fields are never polymorphic — only instance methods are.
- Static methods are hidden, not overridden — resolved at compile time by declared type.
- Calling overridable methods from a constructor is a well-known anti-pattern due to partial-initialization risk.
- Declared type decides what compiles; runtime class decides which override runs; argument runtime types decide nothing.

---

### 2.13 Upcasting and Downcasting

#### Definition
Upcasting converts a reference to a supertype (implicit, always safe); downcasting converts a reference to a subtype (explicit, checked at runtime, may throw `ClassCastException`). Neither changes the object — only the type through which the compiler lets you use it.

#### Why it exists
Upcasting is what lets parent-typed code accept any subtype; downcasting is a checked way back to a subtype's own API when it is genuinely needed.

#### Interview explanation
**In 30 seconds** — `Animal a = new Dog();` is an upcast: implicit and always safe, because every `Dog` is an `Animal`. `Dog d = (Dog) a;` is a downcast: it must be explicit, and the JVM checks the actual object at runtime — if it's a `Cat`, you get `ClassCastException`. Use `instanceof`, ideally with a pattern (`a instanceof Dog d`), before downcasting.

**If they push deeper** — The compiler rejects only casts that could never succeed, such as `String` to `Integer`; any cast between related types compiles and is checked at runtime. Casts to interfaces are looser: from a non-`final` class they compile because some subclass might implement the interface. A cast never changes the object, so overridden methods still dispatch to the runtime class. `null` passes any cast and fails `instanceof`. Generic casts are unchecked beyond the raw type because of erasure.

#### Syntax
```java
Animal a = new Dog();            // upcast (implicit)
Dog d = (Dog) a;                 // downcast (explicit, runtime-checked)

if (a instanceof Dog dog) {      // pattern matching for instanceof (Java 16+)
    dog.fetch();
}
```

#### Example
```java
Animal a = new Cat();
try {
    Dog d = (Dog) a;             // compiles: Animal and Dog are related
} catch (ClassCastException e) {
    System.out.println(e.getMessage());   // class Cat cannot be cast to class Dog (...)
}
```

Predict the output — a question below asks for it:

```java
class Animal { String sound() { return "..."; } }
class Dog extends Animal { @Override String sound() { return "Woof"; } }
class Cat extends Animal { @Override String sound() { return "Meow"; } }

Animal a = new Dog();
Object o = a;
System.out.println(((Animal) o).sound());
System.out.println(o instanceof Cat);
Animal none = null;
Dog d = (Dog) none;
System.out.println(d == null);
System.out.println(none instanceof Animal);
```

#### Common interview questions
- "What happens during upcasting and downcasting?" (Upcasting assigns a subtype reference to a supertype variable — implicit and always safe. Downcasting goes the other way and must be explicit; the JVM checks the object's class at runtime and throws `ClassCastException` if it doesn't fit. In both cases the object is untouched — only the compile-time type of the reference changes.)
- "When does a downcast throw `ClassCastException`?" (When the object's runtime class is neither the target type nor a subclass of it — `(Dog)` applied to a reference that holds a `Cat`. The compiler can't know which object the reference will hold, so it inserts a runtime check instead.)
- "Why is upcasting implicit but downcasting explicit?" (An upcast can never fail: every `Dog` is an `Animal`. A downcast can fail, so Java makes you write it — the cast marks the place where you are claiming more than the compiler can verify.)
- "What does the snippet in the Example print?" (`Woof`, `false`, `true`, `false`. The cast to `Animal` changes only the reference type, so `Dog.sound()` runs. The object is a `Dog`, not a `Cat`. Casting `null` always succeeds, giving `null`. `instanceof` is always `false` for `null`.)
- "Which of these compile: `(Integer) someString`, `(Dog) someAnimal`, `(Runnable) someAnimal`?" (The first doesn't — `String` and `Integer` are unrelated classes, so no object could ever pass. The second compiles and is checked at runtime. The third compiles if `Animal` isn't `final`, because a subclass of `Animal` might implement `Runnable`; it fails at runtime unless the object does.)
- "An event handler receives `Event e` and does `((OrderEvent) e).orderId()`. It worked for months, then started throwing `ClassCastException`. What happened, and what is the fix?" (A new kind of `Event` started reaching the handler. The unchecked downcast assumed only one subtype would ever arrive. Fix: check with `instanceof OrderEvent oe` and handle the rest explicitly, or route events by type so the handler receives `OrderEvent` directly — or, for a closed set, use a `sealed` interface and an exhaustive `switch`.)

#### Follow-up questions
Interviewers rarely stop at "What happens during upcasting and downcasting?" — they drill down from your answer. Answer each step before opening it:

- "After `Animal a = new Dog();`, which `sound()` runs for `a.sound()`?" (`Dog`'s. The upcast changed what the compiler lets you call, not the object; overridden methods dispatch on the runtime class (2.12).)
- "Then why can't you call `a.fetch()`?" (Because calls are checked against the declared type, `Animal`, which has no `fetch()`. You'd need `((Dog) a).fetch()` or a pattern variable.)
- "How do you downcast safely?" (Test first: `if (a instanceof Dog d) d.fetch();` — the pattern binds `d` only when the test succeeds, so the cast can't drift away from the check. For several types, a `switch` with type patterns (Java 21) does the same.)
- "Why is frequent downcasting considered a design smell?" (It means type information was thrown away and is being recovered by guessing. Usually the varying behaviour belongs in a polymorphic method, or the API should keep the precise type — via generics or a narrower parameter type — so no cast is needed.)

Other follow-ups:

- "Can you cast between sibling classes such as `Dog` and `Cat`?" (No — `(Cat) someDog`, where the reference is declared `Dog`, doesn't compile: a `Dog` can never be a `Cat` because a class has one superclass chain. Through an `Animal` reference it compiles and fails at runtime.)

#### Edge cases
- `(Dog) null` succeeds; `null instanceof Dog` is `false` — so `instanceof` doubles as a null check.
- `(List<String>) obj` is an unchecked cast: only `List` is verified at runtime, and a wrong element type fails later, wherever an element is read.
- Arrays are covariant: `Object[] objs = new String[1]; objs[0] = 1;` compiles and throws `ArrayStoreException` — the runtime check happens on the store.
- Boxing is not casting: `(Integer) someObject` is a reference downcast, while `(int) someLong` converts a primitive value.

#### Common mistakes
- Downcasting without a check because "it's always that type here".
- Believing an upcast removes data or behaviour from the object.
- Using `getClass() == Dog.class` where a subclass of `Dog` should also qualify — `instanceof` accepts subclasses, `getClass()` doesn't.

#### Comparisons

| | Upcast | Downcast |
|---|---|---|
| Example | `Animal a = dog;` | `Dog d = (Dog) a;` |
| Explicit? | No | Yes |
| Can fail? | Never | At runtime, with `ClassCastException` |
| Compiler rejects | — | Casts between unrelated types |

| | `instanceof` | `getClass() ==` |
|---|---|---|
| Subclasses match? | Yes | No — exact class only |
| `null` | `false` | `NullPointerException` |

#### Complexity
A downcast is a constant-time type check at runtime; an upcast costs nothing.

#### Frequently confused with
Reference casts vs. primitive casts — `(Dog) a` only relabels a reference, while `(int) 3.9` produces a new value. `instanceof` vs. `getClass()` — subtype test vs. exact-class test.

#### Important facts to remember
- Upcast: implicit, always safe. Downcast: explicit, runtime-checked.
- Casts never change the object; overrides still dispatch on its runtime class.
- `null` passes every cast and fails every `instanceof`.
- The compiler rejects only casts that can never succeed.

---

### 2.14 Abstraction

#### Definition
Abstraction is the principle of exposing only essential behavior while hiding implementation detail: a type presents what it does, in its callers' terms, and conceals how. Interfaces and abstract classes are mechanisms for it, not its definition.

#### Why it exists
So callers depend on a small, stable set of operations instead of on implementation details, which keeps them simple and lets implementations change or be swapped without touching them.

#### Interview explanation
**In 30 seconds** — Abstraction means choosing the essential operations of a concept and hiding everything else behind them: `notifier.send(to, message)` instead of SMTP calls. Callers depend on *what*, never on *how*. In Java it's usually expressed with an interface or an abstract class, but a plain class with a well-chosen public API is an abstraction too.

**If they push deeper** — It differs from encapsulation: abstraction decides which operations to expose, encapsulation bundles state with behaviour and blocks outside access, and information hiding is the goal of concealing decisions likely to change. Abstractions leak — a remote call behind a local-looking method can be slow or fail — so a good one specifies errors and cost, not just signatures. And they have a price: an interface with one implementation forever, or a layer that only forwards, adds indirection without flexibility.

#### Syntax
```java
interface PaymentGateway {                      // the abstraction
    Receipt charge(Money amount, Card card);
}
class StripeGateway implements PaymentGateway { // one implementation
    @Override
    public Receipt charge(Money amount, Card card) { /* HTTP calls, retries, mapping */ return null; }
}
```

#### Example
```java
interface PriceSource {
    BigDecimal priceOf(String sku);
}

class Checkout {
    private final PriceSource prices;
    Checkout(PriceSource prices) { this.prices = prices; }
    BigDecimal total(List<String> skus) {
        return skus.stream().map(prices::priceOf).reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
```

Predict the output — a question below asks for it:

```java
interface Shape { double area(); }

class Square implements Shape {
    private final double side;
    Square(double side) { this.side = side; }
    public double area() { return side * side; }
}
class Rect implements Shape {
    private final double w, h;
    Rect(double w, double h) { this.w = w; this.h = h; }
    public double area() { return w * h; }
}

static double total(List<Shape> shapes) {
    double sum = 0;
    for (Shape s : shapes) sum += s.area();
    return sum;
}

System.out.println(total(List.of(new Square(2), new Rect(2, 3))));
```

#### Common interview questions
- "What is abstraction?" (Exposing a concept's essential operations and hiding how they're done. Callers program against the *what* — an interface such as `PaymentGateway.charge` — so the *how* can change. Trap: defining it as "using abstract classes and interfaces"; those are the mechanisms.)
- "What is the difference between encapsulation, abstraction and information hiding?" (Abstraction chooses which operations to present. Information hiding conceals design decisions that might change, such as the data representation. Encapsulation is the mechanism — state bundled with behaviour behind access control — that usually achieves the hiding. A class can be encapsulated but poorly abstracted, with private fields and dozens of methods mirroring them.)
- "How does Java support abstraction?" (Through interfaces (a type with no instance state), abstract classes (a partial implementation with abstract steps), and access control that keeps the rest of a class out of reach. A well-designed concrete class with a small public API also qualifies.)
- "What does the snippet in the Example print?" (`10.0`. `total` knows only the `Shape` abstraction; each object supplies its own `area()` — 4.0 and 6.0 — through dynamic dispatch. Adding a `Circle` would need no change to `total`.)
- "Why is abstraction worth the extra interface and indirection?" (Because it fixes the dependency at the level that changes least. Callers rely on a few operations, so implementations, data stores and external providers can change, and tests can substitute fakes, without editing callers. The cost is real, so it pays off at boundaries and where several implementations exist or are likely.)
- "Your `OrderRepository` interface has one implementation and mirrors its SQL methods one-to-one. Is that a good abstraction?" (Not really — it abstracts nothing if it exposes the implementation's shape, such as `executeOrderSelectWithJoin`. Name the operations in domain terms (`findOpenOrdersFor(customer)`), or drop the interface and use the class directly until a second implementation or a real boundary justifies one.)

#### Follow-up questions
Interviewers rarely stop at "What is abstraction?" — they drill down from your answer. Answer each step before opening it:

- "Is an interface automatically an abstraction?" (Only if it captures the concept rather than one implementation. An interface whose methods mirror a single class, or are named after the technology behind it, leaks the *how* and abstracts nothing.)
- "What is a leaky abstraction?" (One whose hidden details still affect callers — `List.get(i)` being linear on a `LinkedList`, or a local-looking method making a network call that can time out. Some leakage is unavoidable; the contract should state what callers can rely on: results, errors, cost.)
- "When would you not introduce an abstraction?" (When there is one implementation and no boundary to protect — inside a module, a concrete class is simpler, and it can be turned into an interface later when a second implementation appears. Premature abstraction costs indirection for flexibility nobody uses.)
- "How do abstract classes and interfaces differ as abstraction tools?" (An interface defines a type with no instance state and can be implemented by any class; an abstract class can hold state and partial implementation but uses up the single superclass slot. 2.17 compares them in full.)

Other follow-ups:

- "Can a method be an abstraction?" (Yes. `order.total()` hides the summing and rounding rules; a method that reads at one consistent level — `validate(order); charge(order); confirm(order);` — is an abstraction over the steps it calls.)

#### Edge cases
- An abstraction's contract includes more than signatures: thrown exceptions, `null` handling, thread-safety and performance expectations are part of what callers rely on.
- Changing the behaviour behind an abstraction can still break callers if they relied on undocumented behaviour (Hyrum's law) — the reason to document what's guaranteed.

#### Common mistakes
- Defining abstraction as "abstract classes and interfaces".
- Naming abstractions after their implementation (`MySqlUserStore`).
- Abstracting everything up front — an interface per class, each with one implementation.

#### Comparisons

| | Abstraction | Encapsulation | Information hiding |
|---|---|---|---|
| Question it answers | What should callers see? | How is state protected? | Which decisions stay secret? |
| Typical tool | Interface, abstract class, chosen public API | `private` fields + methods | Both of the others |
| Failure looks like | Callers depend on implementation details | Callers corrupt internal state | A representation change breaks callers |

#### Complexity
Not applicable — an extra interface call is typically inlined by the JIT.

#### Frequently confused with
Abstraction vs. encapsulation (see comparison). Abstraction (the principle) vs. abstract class (one Java mechanism, 2.15).

#### Important facts to remember
- Abstraction = expose the essential *what*, hide the *how*.
- Interfaces and abstract classes are mechanisms, not the definition.
- Abstractions leak; a good contract states errors and cost.
- One implementation and no boundary usually means no interface is needed yet.

---

### 2.15 Abstract Classes

#### Definition
An abstract class is a partially-implemented class (mixing concrete and abstract methods, and able to hold fields and constructors) that cannot be instantiated directly. It is one mechanism for abstraction (2.14).

#### Why it exists
To let related classes share common structure/implementation while forcing each subclass to fill in the parts that must differ.

#### Interview explanation
**In 30 seconds** — An `abstract` class can't be instantiated with `new`. It can have everything a normal class has — fields, constructors, concrete and static methods — plus abstract methods with no body. A concrete subclass must implement every abstract method; a subclass that doesn't must be abstract too. Use one when related classes share state and code but differ in a few steps.

**If they push deeper** — Its constructors run as part of every subclass object, so it can initialise and validate shared fields. Abstract methods can't be `private`, `static` or `final`, because each would prevent overriding, and a class can't be both `abstract` and `final`. Its classic use is the template method: a concrete, often `final`, method fixes an algorithm and calls abstract steps that subclasses supply. The cost is the single superclass slot and inheritance's coupling — 2.17 covers when an interface is the better choice.

**What they test** — Interviewers frequently ask you to choose between an abstract class and an interface for a given design scenario — know the decision criteria cold (shared state/implementation → abstract class; pure contract, possibly across unrelated types → interface).

#### Syntax
```java
abstract class PaymentProcessor {
    abstract void processPayment(double amount); // must be implemented by subclass
    void logTransaction(double amount) { // shared, concrete
        System.out.println("Logging: " + amount);
    }
}
```

#### Example
```java
abstract class Employee {
    String name;
    Employee(String name) { this.name = name; }
    abstract double calculateSalary();
    void printPaySlip() {
        System.out.println(name + ": " + calculateSalary());
    }
}
class SalariedEmployee extends Employee {
    double monthlySalary;
    SalariedEmployee(String name, double s) { super(name); monthlySalary = s; }
    @Override double calculateSalary() { return monthlySalary; }
}
```

Predict the output — a question below asks for it:

```java
abstract class Report {
    Report() { System.out.println("Report()"); }
    abstract String body();
    final void print() { System.out.println("[" + body() + "]"); }
}
class Sales extends Report {
    Sales() { System.out.println("Sales()"); }
    @Override String body() { return "sales"; }
}

Report r = new Sales();
r.print();
```

#### Common interview questions
- "When would you use an abstract class instead of an interface?" (When closely related classes share *state* and implementation — fields, constructor logic, helper methods — and you want to force them to supply a few specific steps. If you only need a contract, especially across unrelated classes, or a class may need several such types, use an interface. A common shape is both: an interface for the type plus an abstract class implementing most of it. Full comparison in 2.17.)
- "Can an abstract class have zero abstract methods?" (Yes, legally — though unusual; it's still marked `abstract` purely to prevent direct instantiation.)
- "Can you have a constructor in an abstract class if you can never instantiate it directly?" (Yes — it runs when a concrete subclass is instantiated, via implicit or explicit `super()`.)
- "What does the snippet in the Example print?" (`Report()`, `Sales()`, `[sales]`. Constructing a `Sales` runs the abstract parent's constructor first, then the subclass's. `print()` is a final template method in the abstract class; it calls `body()`, which dispatches to `Sales`.)
- "Why can't an abstract method be `private`, `static` or `final`?" (An abstract method exists only to be overridden. A `private` method isn't inherited, a `static` one is hidden rather than overridden, and a `final` one can't be overridden — so each combination would demand an implementation that can never be supplied. The compiler reports an illegal combination of modifiers.)
- "Three report types share header, footer and paging logic but differ in their body. How would you structure them?" (An abstract `Report` holding the shared fields and a `final` `render()` that writes header, calls an abstract `renderBody()`, then writes footer and paging; each report type extends it and implements only `renderBody()`. If the report types must also extend something else, use composition instead: a `ReportRenderer` that takes a `BodyWriter` interface.)

#### Follow-up questions
Interviewers rarely stop at "When would you use an abstract class instead of an interface?" — they drill down from your answer. Answer each step before opening it:

- "What can an abstract class hold that an interface can't?" (Instance fields, constructors, and non-public members such as `protected` methods. An interface can have only constants, and its methods are public or private.)
- "Why does that difference matter in practice?" (Shared state lets the base class own invariants — validating the `name` once in its constructor, keeping a counter — instead of every implementation repeating it. Interfaces can share behaviour through default methods, but those can only call other interface methods; they have no fields to work with.)
- "What do you give up by choosing the abstract class?" (The subclass's only superclass slot, and loose coupling: subclasses depend on the base class's implementation and suffer the fragile base class problem. A class can implement many interfaces but extend one class.)
- "How do the JDK's collections combine both?" (`List` is an interface; `AbstractList` is an abstract class implementing most of it on top of `get` and `size`. You implement `List` directly when you must, or extend `AbstractList` to write only two methods — a *skeletal implementation*.)

Other follow-ups:

- "What happens if a subclass doesn't implement all abstract methods?" (The subclass must itself be declared `abstract`, or it's a compile error.)
- "Can an abstract class implement an interface without implementing all its methods?" (Yes — an abstract class can leave interface methods unimplemented, deferring that obligation to its own concrete subclasses.)

#### Edge cases
- An abstract class can have `final` concrete methods (methods subclasses cannot override) alongside its abstract ones — mixing "fixed shared logic" with "must customize" logic in the same class.
- A class can be `abstract` even with zero abstract methods — sometimes done deliberately just to block direct instantiation of a "template" base class.
- An anonymous class can instantiate an abstract class on the spot by implementing its abstract methods: `new Report() { String body() { return "x"; } }`.
- An abstract class may have a `static` `main` method and be run as a program — "can't be instantiated" doesn't mean "can't execute".

#### Common mistakes
- Choosing an abstract class purely to share code between two unrelated types that don't have a genuine "is-a" relationship (interfaces with default methods, or composition, are often the better fit).
- Forgetting a subclass must be marked `abstract` itself if it doesn't implement every inherited abstract method.
- Calling an abstract method from the abstract class's constructor — it runs the subclass's implementation before the subclass's fields are set (2.22).

#### Comparisons

| | Abstract class | Concrete class |
|---|---|---|
| `new` allowed | No | Yes |
| Abstract methods | Allowed | Not allowed |
| Constructors, fields, concrete methods | Yes | Yes |
| Can be `final` | No | Yes |

The abstract class vs. interface comparison is in 2.17.

#### Complexity
Not applicable.

#### Frequently confused with
Abstract class vs. interface — the most classic "which would you choose" design interview question in Java (2.17). Abstract class vs. abstraction — the first is one mechanism for the second (2.14).

#### Important facts to remember
- Abstract classes can have constructors, instance fields, and concrete methods — much more than a pure interface.
- A subclass that doesn't implement all abstract methods must itself be declared abstract.
- Choose abstract class for "shared implementation + is-a," interface for "shared capability, possibly across unrelated types."
- Abstract methods can't be `private`, `static` or `final`; an abstract class can't be `final`.

---

### 2.16 Interfaces

#### Definition
An interface defines a type through a contract of method signatures that implementing classes must fulfill. Since Java 8 it may also contain default and static methods, and since Java 9 private methods — but never instance fields or constructors.

#### Why it exists
To decouple "what a type can do" from "how it does it," enabling multiple inheritance of behavior and flexible, testable designs (program to an interface, not an implementation).

#### Interview explanation
**In 30 seconds** — An interface is a type any class can implement, regardless of what it extends, and a class can implement many. Its abstract methods are implicitly `public abstract`, its fields `public static final`. Since Java 8 it can carry behaviour through `default` and `static` methods, and since Java 9 `private` helpers — so "interfaces have no implementation" is outdated. What it still can't have is instance state or constructors.

**If they push deeper** — Default methods brought a diamond problem, solved by three rules: a class's own or inherited method beats any default; a more specific interface beats the one it extends; otherwise the class must override and may call `A.super.m()`. Static interface methods aren't inherited by implementing classes — call them as `Interface.m()`. A default method can't override `equals`, `hashCode` or `toString`. Interface fields are final but not necessarily constants — `List<String> NAMES = new ArrayList<>()` is one shared, mutable list.

**What they test** — Know the evolution: pre-Java 8 (pure abstract contract) vs. post-Java 8 (default/static methods) vs. Java 9+ (private interface methods for internal code reuse between default methods). Also be fluent in functional interfaces (exactly one abstract method), the foundation for lambdas.

#### Syntax
```java
interface Notifier {
    void send(String message);              // abstract
    default void sendUrgent(String msg) {    // default method
        send("URGENT: " + msg);
    }
    static Notifier console() {              // static factory method
        return msg -> System.out.println(msg);
    }
}
```

#### Example
```java
interface Comparable2<T> {
    int compareTo(T other);
}
class Money implements Comparable2<Money> {
    long cents;
    Money(long cents) { this.cents = cents; }
    @Override public int compareTo(Money other) { return Long.compare(cents, other.cents); }
}
```

Predict the output — a question below asks for it:

```java
interface A { default String who() { return "A"; } }
interface B extends A { default String who() { return "B"; } }
class Base { public String who() { return "Base"; } }

class One implements A, B { }
class Two extends Base implements B { }
class Three implements A {
    @Override public String who() { return "Three+" + A.super.who(); }
}

System.out.println(new One().who());
System.out.println(new Two().who());
System.out.println(new Three().who());
```

#### Common interview questions
- "What's the difference between an abstract class and an interface?" (An abstract class can hold instance state, constructors and non-public members, and a class extends only one; an interface holds no instance state and a class can implement many. Both can contain implemented methods today. Full comparison in 2.17.)
- "What is a functional interface? Give an example from the JDK." (`Runnable`, `Comparator<T>`, `Function<T,R>` — each has exactly one abstract method.)
- "What is the 'diamond problem' with default methods, and how must a class resolve it?" (Two inherited default methods with the same signature. Java resolves it by rules: a method from the class hierarchy wins over any default; a more specific interface — one extending the other — wins over its parent. Only when neither applies must the class override the method, optionally calling `A.super.m()` or `B.super.m()`. Java refuses to guess.)
- "What does the snippet in the Example print?" (`B`, `Base`, `Three+A`. `One`: `B` extends `A`, so `B`'s default is more specific. `Two`: a method inherited from the superclass `Base` beats any default. `Three` overrides and calls the interface's default explicitly with `A.super.who()`.)
- "Can an interface contain implementation?" (Yes, since Java 8: default methods give every implementing class a body it can keep or override, static methods hold utility code, and private methods (Java 9) share code between them. What an interface still can't contain is instance state, so default methods work only through other interface methods.)
- "You need to add a method to an interface that 40 classes in other teams implement. What do you do?" (Add it as a `default` method with a sensible implementation built on the existing methods, so no implementation breaks — the reason default methods were added to Java 8, for `Collection.stream()`. Implementations that can do better override it.)

#### Follow-up questions
Interviewers rarely stop at "Can an interface contain implementation?" — they drill down from your answer. Answer each step before opening it:

- "If interfaces have method bodies now, what's left that only abstract classes can do?" (Hold instance fields and constructors, and declare `protected` or package-private members. An interface's defaults can't keep state between calls except through the methods the class implements.)
- "Are interface static methods inherited by implementing classes?" (No. `Comparator.naturalOrder()` must be called through `Comparator`, not through a class implementing it or an instance of one. As a result, two interfaces can declare static methods with the same signature without any conflict in a class that implements both.)
- "Can a default method override `toString()` or `equals()`?" (No — it's a compile error. A class always inherits those from `Object`, and a class method beats a default, so such a default could never run.)
- "Why did Java 8 add default methods at all?" (To evolve published interfaces. Adding `stream()` or `forEach()` as abstract methods to `Collection` and `Iterable` would have broken every collection class ever written; as defaults, existing classes compiled and ran unchanged.)

Other follow-ups:

- "Can an interface extend another interface? Can it extend multiple interfaces?" (Yes to both — unlike classes, interfaces support multiple inheritance of the contract itself.)
- "Can interface fields be non-final or non-static?" (No — all interface fields are implicitly `public static final`. They are compile-time constants only when initialised with a constant expression; `int SEED = new Random().nextInt();` is legal and computed when the interface is initialized.)

#### Edge cases
- Two default methods from different interfaces with the same signature force the implementing class to override and choose (or combine) behavior explicitly — otherwise it's a compile error — unless one interface extends the other or a superclass already provides the method.
- A functional interface can still have default/static methods — the "exactly one abstract method" rule only counts *abstract* methods, not default/static ones. Abstract methods matching `Object`'s public methods don't count either, which is why `Comparator` is functional despite declaring `equals`.
- A class implementing an interface method must declare it `public` — leaving out the modifier means package-private, which narrows access and doesn't compile.

#### Common mistakes
- Assuming an interface variable can hold per-instance mutable state — interface fields are always static and final, not instance data.
- Forgetting `@FunctionalInterface` doesn't *make* an interface functional — it's just a compiler-enforced check that the interface has exactly one abstract method; the annotation is optional but good practice.
- Calling an interface's static method through an implementing class.

#### Comparisons

| | Interface (pre-Java 8) | Interface (Java 8+) |
|---|---|---|
| Method bodies | None allowed | Default & static methods allowed |
| Multiple inheritance of behavior | No (contract only) | Yes (default methods provide shared behavior) |
| Private helper methods | N/A | Allowed since Java 9 |

#### Complexity
Not applicable.

#### Frequently confused with
Interfaces vs. abstract classes (see 2.17); functional interfaces vs. "any interface with one method someone happens to call using a lambda" (a functional interface is specifically defined as having exactly one abstract method — the formal term, not just an informal pattern).

#### Important facts to remember
- Interface fields are always `public static final` — final, but not necessarily constant.
- A class can implement any number of interfaces (multiple inheritance of type/behavior).
- A functional interface has exactly one abstract method (default/static methods don't count toward that total).
- Diamond rules: class wins → more specific interface wins → otherwise override.
- Interface static methods are not inherited by implementing classes.

---

### 2.17 Abstract Class vs Interface

#### Definition
Two ways to define a type that other classes complete. An abstract class is a partial class — fields, constructors, any member access, abstract and concrete methods — and a class extends at most one. An interface is a stateless type — abstract, default, static and private methods plus constants — and a class can implement many.

#### Why it exists
The question exists because Java separates inheritance of *state* (one superclass) from inheritance of *type* (many interfaces). Choosing well decides whether unrelated classes can share a role and where shared state lives.

#### Interview explanation
**In 30 seconds** — Use an interface for a role that any class can take on — a class can implement many, and none of them dictates its superclass. Use an abstract class when closely related classes share state and code: it can have instance fields, constructors, `protected` members and `final` methods, but a class can extend only one. Since Java 8 both can contain method bodies, so "interfaces have no code" is no longer the difference.

**If they push deeper** — The lasting differences are state, construction, member access and multiplicity. An interface's default methods can work only through its other methods — there are no fields — and can always be overridden, while an abstract class can hold invariants in fields and lock an algorithm with a `final` template method. A common professional design uses both: an interface as the public type and an abstract skeletal implementation for convenience (`List` and `AbstractList`), so callers depend only on the interface.

#### Syntax
```java
interface Shape { double area(); }

abstract class Polygon implements Shape {
    protected final int sides;
    protected Polygon(int sides) { this.sides = sides; }
}

class Square extends Polygon {
    private final double side;
    Square(double side) { super(4); this.side = side; }
    @Override public double area() { return side * side; }
}
```

#### Example
```java
interface Auditable { String auditId(); }          // a role: any class can take it on

abstract class Entity {                            // a family: shared state and invariants
    private final long id;
    protected Entity(long id) {
        if (id <= 0) throw new IllegalArgumentException("id");
        this.id = id;
    }
    public final long id() { return id; }
}

class Invoice extends Entity implements Auditable, Comparable<Invoice> {
    Invoice(long id) { super(id); }
    @Override public String auditId() { return "INV-" + id(); }
    @Override public int compareTo(Invoice o) { return Long.compare(id(), o.id()); }
}
```

Predict which of these declarations compile — a question below asks for it:

```java
interface I1 { int LIMIT = 10; }
interface I2 { protected void m(); }
interface I3 { private void helper() {} default void m() { helper(); } }
interface I4 { I4() {} }
abstract class A1 { protected abstract void m(); }
interface I5 { final default void m() {} }
```

#### Common interview questions
- "What's the difference between an abstract class and an interface?" (An abstract class can have instance fields, constructors, any access level and `final` methods, and a class extends only one. An interface has no instance state or constructors, its members are public (or private methods), and a class can implement many. Both can contain abstract methods and methods with bodies today. Trap: "interfaces can't have implementation" — untrue since Java 8.)
- "When would you choose an abstract class over an interface?" (When closely related classes share state or construction logic, need `protected` hooks, or must follow a fixed algorithm enforced by a `final` template method. Otherwise prefer an interface, because it doesn't consume the implementer's superclass.)
- "Did Java 8 make abstract classes unnecessary?" (No. Default methods let interfaces share behaviour, but not state: a default can't keep a field, run constructor validation, or be made `final`. Abstract classes still own those jobs; interfaces just took over "type with some convenience methods".)
- "Which declarations in the Example compile?" (`I1`, `I3` and `A1` compile; `I2`, `I4` and `I5` don't. Interface fields are implicitly `public static final`. `protected` isn't allowed on interface members. Private interface methods are allowed since Java 9. Interfaces have no constructors. Abstract classes may have `protected` abstract methods. Interface methods can't be `final`.)
- "Why do libraries often provide both an interface and an abstract class for the same concept?" (The interface is the type callers and implementers depend on — anyone can implement it whatever they extend. The abstract class is optional convenience that implements most methods in terms of a few, so an implementer writes only those few. `Collection`/`AbstractCollection`, `List`/`AbstractList`, `Map`/`AbstractMap`.)
- "A teammate made `Auditable` an abstract class with an `auditId()` method. Two existing entities that already extend `BaseEntity` now can't be auditable. What should change?" (Make `Auditable` an interface: it describes a role, and roles must be addable to classes that already have a superclass. If several auditable classes share code, put it in a default method or a helper they compose.)

#### Follow-up questions
Interviewers rarely stop at "What's the difference between an abstract class and an interface?" — they drill down from your answer. Answer each step before opening it:

- "If interfaces have default methods, can they replace abstract classes?" (Only where no state is involved. A default method can call the interface's other methods, but it can't store anything or enforce construction-time invariants, and an implementing class can always override it.)
- "Can an abstract class implement an interface without implementing its methods?" (Yes — an abstract class may leave interface methods abstract, passing the obligation to its concrete subclasses. That's how skeletal implementations work.)
- "Can an interface extend an abstract class?" (No. Interfaces extend only interfaces. A class can extend an abstract class and implement interfaces; an interface can extend many interfaces.)
- "Which one would you use as a constructor parameter type in a service?" (The interface, if one exists — the service then accepts any implementation, including a fake in tests. Depending on an abstract class instead ties callers to one family of implementations.)

Other follow-ups:

- "Is there any performance difference between calling through an abstract class and through an interface?" (Not in practice. HotSpot's interface call path is slightly more involved, but at call sites with one or two receiver classes both are inlined, and the difference disappears.)

#### Edge cases
- An interface may have a `private static` method (Java 9+), but no `protected` member of any kind.
- A default method can't be `final`, `synchronized`, or override a public method of `Object`.
- An abstract class can have no abstract methods at all; an interface can have no methods at all (a marker interface).
- A `sealed` interface (Java 17) or a `sealed` abstract class restricts who may implement or extend it — both can model a closed family.

#### Common mistakes
- Saying "interfaces can't have implementation" or "can't have static/private methods".
- Using an abstract class for a cross-cutting role (`Auditable`, `Cacheable`), which unrelated classes then can't adopt.
- Putting mutable shared "state" in an interface constant (`List<String> CACHE = new ArrayList<>()`), creating a global, unsynchronized variable.

#### Comparisons

| | Abstract class | Interface |
|---|---|---|
| Multiple inheritance | No (single parent only) | Yes (implement many) |
| Instance fields with state | Yes | No (only `public static final` fields) |
| Constructors | Yes | No |
| Method implementations | Yes (concrete + abstract mixed) | Yes (default/static methods, Java 8+; private, Java 9+) |
| `protected` / `final` methods | Yes | No |
| Best for | Closely related types sharing implementation | Unrelated types sharing a capability/contract |

#### Complexity
Not applicable.

#### Frequently confused with
Abstract class vs. interface — the most classic "which would you choose" design interview question in Java. Default method vs. abstract class method — a default can always be overridden and has no fields to work with.

#### Important facts to remember
- Abstract classes: state, constructors, any access, `final` methods — one per class.
- Interfaces: no instance state, public members (private helper methods allowed) — many per class.
- Both can contain method bodies since Java 8.
- Prefer interfaces for types; add an abstract skeletal class for implementers' convenience.

---

### 2.18 The final Keyword

#### Definition
`final` forbids one kind of change, depending on what it marks: a final variable or field can be assigned only once, a final method can't be overridden (or, if static, hidden), and a final class can't be extended.

#### Why it exists
To let a class state — and the compiler enforce — that a value, a behaviour or a type's guarantees won't change, which protects invariants and makes code safe to reason about and share.

#### Interview explanation
**In 30 seconds** — On a variable, `final` means "assigned once": a final field must be set by its initializer or by every constructor, and never after. On a method it means "can't be overridden"; on a class, "can't be extended" — `String` is final. A final reference is not an immutable object: `final List<String> names` can't be pointed elsewhere, but `names.add(...)` still works.

**If they push deeper** — The compiler checks definite assignment: a blank final field must be assigned exactly once on every constructor path. `static final` primitives and strings initialised with constant expressions are *constant variables* that the compiler inlines into callers — so changing one in a library needs callers recompiled, and reading one doesn't initialize its class. Final fields also carry a memory-model guarantee: after construction, every thread sees their constructed values without synchronization, provided `this` didn't escape. `final` isn't a performance tool — the JIT inlines non-final methods it can prove have one implementation.

#### Syntax
```java
final int x = 1;                    // final local variable
class Config {
    private final String url;       // blank final field: assigned in every constructor
    static final int MAX = 100;     // constant
    Config(String url) { this.url = url; }
    final String url() { return url; }   // can't be overridden
}
final class Money { }               // can't be extended
```

#### Example
```java
final List<String> names = new ArrayList<>();
names.add("Siva");          // allowed: the object changes
// names = new ArrayList<>();   // compile error: the reference can't change

final int[] counts = {1, 2};
counts[0] = 99;             // allowed: array elements aren't final
```

Predict which lines compile — a question below asks for it:

```java
class Box {
    private final int size;                  // line 1
    private final List<String> items = new ArrayList<>();

    Box(int size) { this.size = size; }
    Box() { }                                // line 2

    void grow() { size = size + 1; }         // line 3
    void add(String s) { items.add(s); }     // line 4
    final void seal() { }
}
class BigBox extends Box {
    BigBox() { super(10); }
    void seal() { }                          // line 5
}
```

#### Common interview questions
- "What is the difference between a final reference and an immutable object?" (A final reference can't be reassigned to point at another object. An immutable object can't have its state changed at all. `final List<String> l = new ArrayList<>()` is a final reference to a mutable list; `List.of("a")` is an immutable list, which could be held in a non-final variable. Immutability needs a class designed for it (2.21).)
- "What does `final` mean on a class, a method and a variable?" (Class: no subclasses. Method: no overriding — and for a static method, no hiding. Variable or field: assigned exactly once. They're separate rules that happen to share a keyword.)
- "Can a final field be assigned in a constructor?" (Yes — that's the usual way. A final field without an initializer (a blank final) must be assigned exactly once on every constructor path, or in an instance initializer; it can never be assigned in an ordinary method.)
- "Which lines in the Example fail to compile?" (Lines 2, 3 and 5. Line 2: the `Box()` constructor leaves the blank final `size` unassigned. Line 3: a final field can't be assigned in a method. Line 5: `seal()` is final in `Box`, so `BigBox` can't override it. Lines 1 and 4 are fine — `items.add` changes the list, not the final reference.)
- "Why is `String` final?" (Its guarantees — immutability, stable `hashCode`, safe use as map keys and in security checks such as file paths and class names — would be worthless if a subclass could add mutable state or override methods. Making the class final means every `String` really behaves like one.)
- "A library changes `public static final int TIMEOUT = 30;` to 60, and your service still times out after 30 seconds after upgrading the jar. Why?" (`TIMEOUT` is a constant variable, so its value was copied into your compiled classes. Swapping the jar doesn't change them; recompiling your code against the new version does. Library authors avoid this by exposing such values through a method or a non-constant field.)

#### Follow-up questions
Interviewers rarely stop at "What is the difference between a final reference and an immutable object?" — they drill down from your answer. Answer each step before opening it:

- "So what does it take to make an object immutable?" (A class with all fields `private final`, no mutators, no way for subclasses to add mutability (a `final` class or private constructors), and defensive copies of any mutable components on the way in and out. 2.21 covers it.)
- "Does `final` help with thread safety?" (Yes, specifically for fields: the memory model guarantees that once a constructor finishes, other threads see the constructed values of `final` fields without synchronization — as long as `this` didn't escape during construction. It doesn't make the objects those fields refer to thread-safe.)
- "What does effectively final mean?" (A local variable or parameter that is never reassigned after initialization, even without the keyword. Lambdas and anonymous or local classes can capture only final or effectively final locals, because they capture the value, not the variable.)
- "How is `final` different from `sealed`?" (`final` allows no subclasses at all. `sealed` (Java 17) allows exactly the subclasses listed in its `permits` clause, each of which must itself be `final`, `sealed` or `non-sealed`. Sealed suits closed hierarchies such as a fixed set of payment types.)

Other follow-ups:

- "Can an abstract method be final? Can an abstract class be final?" (No to both — `abstract` demands a subclass or override that `final` forbids. The compiler reports an illegal combination of modifiers.)

#### Edge cases
- A `private` method is implicitly impossible to override, so adding `final` to it changes nothing.
- A `static final` method can't be hidden by a subclass static method with the same signature.
- `final` parameters stop reassignment inside the method only; the caller's object can still be mutated through them.
- Reflection can't change a `static final` field or a final field of a record or hidden class. For ordinary classes, `setAccessible(true)` can still change a final instance field — though since JDK 26 (JEP 500) doing so prints a warning unless `--enable-final-field-mutation` allows it, on the way to forbidding it.

#### Common mistakes
- Calling a `final` field immutable when its type is mutable.
- Changing a public constant in a library and expecting dependents to see it without recompiling.
- Making every method `final` "for performance" — it doesn't help, and it blocks legitimate subclasses and proxies.

#### Comparisons

| Applied to | Forbids | Doesn't forbid |
|---|---|---|
| Variable / field | Reassignment | Mutating the object it refers to |
| Method | Overriding (and hiding, if static) | Overloading it; calling it |
| Class | Subclassing | Creating instances; mutable fields |

#### Complexity
Not applicable.

#### Frequently confused with
`final` vs. immutable — a variable property vs. an object property. `final` vs. `static` — "assigned once" vs. "one per class"; `static final` combines them into a constant. `final` vs. `finally` / `finalize` — unrelated keywords that only look alike (exception handling, and a deprecated `Object` method, 2.19).

#### Important facts to remember
- Final variable → no reassignment; final method → no overriding; final class → no subclassing.
- Final reference ≠ immutable object.
- Blank final fields must be assigned exactly once on every constructor path.
- Constant variables are inlined into callers.

---

### 2.19 The Object Class

#### Definition
`Object` is the implicit root superclass of every Java class (and of arrays). It provides identity-based defaults for `equals()`, `hashCode()` and `toString()`, plus `getClass()`, `clone()`, `finalize()` and the monitor methods `wait()`/`notify()`/`notifyAll()`.

#### Why it exists
To guarantee every object in Java has baseline, universal behavior for identity comparison, hashing, and string representation — which subclasses can override to provide meaningful, value-based semantics.

#### Interview explanation
**In 30 seconds** — Every class extends `Object`, directly or indirectly, so every object has `equals`, `hashCode`, `toString`, `getClass`, `clone`, `finalize`, `wait` and `notify`. The defaults are identity-based: `equals` is `==`, `hashCode` is the identity hash code, `toString` is the class name plus `@` plus the hash in hex. You routinely override `equals`, `hashCode` and `toString`; `getClass`, `wait` and `notify` are `final`.

**If they push deeper** — The identity hash code is not a memory address: the API promises only that it is stable for the object's lifetime and consistent with identity equality, and HotSpot generates and caches it because objects move. `clone()` is `protected`, makes a shallow copy without running a constructor, and needs the `Cloneable` marker — copy constructors are preferred. `finalize()` is deprecated for removal (JEP 421, Java 18); resources are released with try-with-resources.

#### Syntax
```java
class Point {
    private final int x, y;
    Point(int x, int y) { this.x = x; this.y = y; }

    @Override public String toString() { return "Point(" + x + ", " + y + ")"; }
    // equals and hashCode: see 2.20
}
```

#### Example
```java
Object o = new int[] {1, 2, 3};
System.out.println(o.getClass().getSimpleName());   // int[] — arrays are objects
System.out.println(o instanceof Object);            // true

Point p = new Point(1, 2);
System.out.println(p);                              // Point(1, 2) — println calls toString()
System.out.println(p.getClass() == Point.class);    // true
```

Predict the output — a question below asks for it:

```java
class Dog {
    @Override public int hashCode() { return 255; }
}

Dog d = new Dog();
String s = d.toString();
System.out.println(s.substring(s.indexOf('@')));
System.out.println(System.identityHashCode(d) == d.hashCode());
System.out.println(d.equals(new Dog()));
```

#### Common interview questions
- "What methods does `Object` provide?" (`equals`, `hashCode`, `toString`, `getClass`, `clone`, `finalize`, and `wait`, `notify`, `notifyAll`. The first three are the ones you override; `getClass` and the monitor methods are `final`; `clone` and `finalize` are historical and best avoided.)
- "What does the default `toString()` print?" (`getClass().getName() + "@" + Integer.toHexString(hashCode())` — the fully-qualified class name, `@`, and the hash code in hex. Because it calls `hashCode()`, overriding `hashCode` changes it.)
- "Is the default `hashCode()` the memory address?" (No. The contract only requires it to be stable for the object's lifetime and consistent with `equals`; distinct objects may even collide. HotSpot generates a value on first use and stores it in the object header, since the garbage collector moves objects.)
- "What does the snippet in the Example print?" (`@ff`, `false`, `false`. `toString()` uses the overridden `hashCode()`, 255 = `ff`. `System.identityHashCode` ignores the override and returns the identity hash, which almost certainly isn't 255. `equals` is still identity-based, and the two dogs are different objects.)
- "Why is `clone()` considered broken?" (It's `protected` in `Object`, so callers can't use it unless the class overrides it as `public`; it depends on `Cloneable`, an interface with no methods; it copies fields shallowly and runs no constructor, so invariants and `final` fields can't be re-established; and it throws a checked exception. Copy constructors and static factories avoid all of that. Arrays' `clone()` is the useful exception.)
- "A team relies on `finalize()` to close file handles, and the service runs out of file descriptors under load. Why?" (Finalizers run only when the garbage collector gets round to it — possibly never — and on a single finalizer thread that can fall behind. File handles pile up long after the objects are unreachable. Close resources deterministically with try-with-resources on an `AutoCloseable`.)

#### Follow-up questions
Interviewers rarely stop at "What methods does `Object` provide?" — they drill down from your answer. Answer each step before opening it:

- "Why is `getClass()` final?" (Because it reports a fact the JVM knows — the object's runtime class — and code such as `equals` implementations and frameworks depend on it being truthful. An override could lie.)
- "What's the difference between `obj.getClass()` and `Dog.class`?" (`getClass()` is the runtime class of a particular object — possibly a subclass, or a proxy class; `Dog.class` is a compile-time literal for exactly `Dog`. `animal.getClass() == Dog.class` is false for a `Puppy extends Dog`.)
- "Do interfaces extend `Object`?" (Not formally — an interface has no superclass. But every interface implicitly declares `Object`'s public methods as members, so you can call `toString()` or `equals()` on any interface-typed reference, and the implementing object's versions run.)
- "What replaces `finalize()` for cleanup?" (Explicit release through `AutoCloseable` and try-with-resources. `java.lang.ref.Cleaner` exists as a safety net for when a caller forgets — it runs a cleanup action after the object becomes phantom-reachable, without the resurrection and ordering problems of finalizers.)

Other follow-ups:

- "Are arrays objects?" (Yes. Every array type extends `Object`, so arrays have `getClass()`, `hashCode()` and so on — but their `equals` and `toString` are `Object`'s identity versions. Compare contents with `Arrays.equals` and print them with `Arrays.toString`.)

#### Edge cases
- `getClass()` on a framework proxy (Hibernate, Spring CGLIB) returns the generated proxy subclass, not your entity or bean class.
- `Object`'s `clone()` is `protected`, so `new Object().clone()` doesn't compile outside `java.lang` — a class must override it as `public` for callers to use it.
- Arrays' `equals` and `hashCode` are identity-based: two arrays with identical contents are not `equals`.

#### Common mistakes
- Believing the default `hashCode` is an address, or unique.
- Using `clone()` on classes with mutable fields and getting shallow copies that share internals.
- Relying on `finalize()` for any cleanup.

#### Comparisons

| | `getClass()` | `instanceof` |
|---|---|---|
| Asks | Exactly which class is this? | Is this the type or a subtype? |
| Subclass of the type | Different class | `true` |
| `null` receiver | `NullPointerException` | `false` |

#### Complexity
Not applicable.

#### Frequently confused with
`final`, `finally` and `finalize()` — a modifier, an exception-handling block, and a deprecated `Object` method. `getClass()` vs. the `.class` literal — runtime class of an object vs. a fixed type.

#### Important facts to remember
- Every class (and every array) extends `Object`; interfaces expose its public methods.
- Default `equals` is identity; default `hashCode` is the identity hash code — not an address.
- `getClass`, `wait`, `notify`, `notifyAll` are final.
- Avoid `clone()` (prefer copy constructors) and `finalize()` (deprecated for removal).

---

### 2.20 equals and hashCode

#### Definition
`equals()` defines when two objects are logically equal; `hashCode()` returns an `int` that hash-based collections use to choose a bucket. `Object`'s versions are identity-based. A class that overrides one must override the other so that equal objects always have equal hash codes.

#### Why it exists
Value-like classes need equality by content, and hash-based collections find elements by hash code first and `equals` second — so the two methods must agree for lookups to work.

#### Interview explanation
**In 30 seconds** — `==` compares references; `equals` compares whatever the class defines. Override `equals` for value-like classes, and always override `hashCode` with it using the same fields: equal objects must have equal hash codes, though unequal objects may collide. `equals` must be reflexive, symmetric, transitive, consistent, and return `false` for `null`.

**If they push deeper** — `HashMap` uses the hash code to pick a bucket and calls `equals` only within it, so an object with `equals` but no matching `hashCode` is looked for in the wrong bucket — lookups with a new, equal instance fail. Mutating a field used in `hashCode` after insertion strands the object in its old bucket. For the type check, `getClass()` gives exact-class equality and `instanceof` lets subclasses participate; each has a cost, and the clean answer is a `final` value class with `instanceof` — or a `record`, which generates all three methods from its components.

**What they test** — The equals/hashCode contract is one of the highest-frequency Java interview topics. Be ready to write a correct `equals()`/`hashCode()` override from scratch, and explain exactly *why* breaking the contract corrupts `HashMap`/`HashSet` behavior.

#### Syntax
```java
@Override
public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    MyClass other = (MyClass) o;
    return Objects.equals(field1, other.field1) && field2 == other.field2;
}

@Override
public int hashCode() {
    return Objects.hash(field1, field2);
}
```

#### Example
```java
Set<Point> points = new HashSet<>();
points.add(new Point(1, 2));
System.out.println(points.contains(new Point(1, 2)));
// true only if Point correctly overrides both equals() AND hashCode()
// almost certainly false (surprisingly, to many) if only equals() was overridden
```

Predict the output — a question below asks for it:

```java
String s1 = "hi", s2 = "hi", s3 = new String("hi");
System.out.println(s1 == s2);
System.out.println(s1 == s3);
System.out.println(s1.equals(s3));

Integer i1 = 127, i2 = 127, i3 = 1000, i4 = 1000;
System.out.println(i1 == i2);
System.out.println(i3 == i4);

System.out.println("Aa".hashCode() == "BB".hashCode());
System.out.println("Aa".equals("BB"));
```

#### Common interview questions
- "What is the equals/hashCode contract?" (If `a.equals(b)` then `a.hashCode() == b.hashCode()`; the reverse need not hold — collisions are legal. `hashCode` must be consistent within a run while the compared fields don't change. And `equals` itself must be reflexive, symmetric, transitive, consistent and `false` for `null`. Trap: saying equal hash codes imply equal objects.)
- "What happens if you override `equals()` but not `hashCode()`?" (Contract violation — equal objects can end up in different hash buckets, so `HashSet`/`HashMap` lookups silently fail even though `.equals()` would return `true`. Tests often miss it because they look up the very instance they inserted, which has the same identity hash.)
- "Why use `getClass() != o.getClass()` instead of `instanceof` in `equals()`?" (Each answers whether a subclass instance may equal a parent instance. `getClass()` forbids it, so symmetry survives subclasses that add fields — but a subclass that adds nothing, or a framework proxy subclass, can never equal its parent. `instanceof` allows it, which keeps substitutability but breaks symmetry if a subclass adds a field to its own `equals`. Neither is universally right; a `final` class with `instanceof` sidesteps the problem.)
- "What does the snippet in the Example print?" (`true`, `false`, `true`, `true`, `false`, `true`, `false`. String literals are interned, so `s1` and `s2` are one object; `new String` creates another. `Integer` boxing caches -128 to 127, so 127s share an object and 1000s usually don't. `"Aa"` and `"BB"` collide on hash code 2112 but are not equal — a collision is legal.)
- "Why must equal objects have equal hash codes, but not the reverse?" (A hash table looks only in the bucket chosen by the hash code; if equal objects could hash differently, the matching element would be in a bucket that is never searched. Unequal objects sharing a code just land in one bucket, where `equals` tells them apart — slower, but correct.)
- "An entity's `hashCode` uses its database ID, which is null until saved. Objects added to a `HashSet` before saving can't be found after. Why?" (Saving assigned the ID, changing the hash code while the objects sat in the set, so they're filed under their old hash. Use only fields that never change for hashing — for entities, often a constant hash code or a natural business key — or don't put unsaved entities in hash sets.)

#### Follow-up questions
Interviewers rarely stop at "What is the equals/hashCode contract?" — they drill down from your answer. Answer each step before opening it:

- "How does `HashMap.get` actually use the two methods?" (It computes the key's `hashCode`, spreads it to pick a bucket, then walks that bucket comparing hash codes and calling `equals` on candidates. `equals` is never called on entries in other buckets.)
- "So what breaks if `hashCode` isn't overridden?" (Two equal keys get different identity hash codes, so `get` with an equal-but-new key searches a different bucket and returns `null` — while `get` with the original instance still works.)
- "What if a key's fields change after it's inserted?" (Its stored bucket was chosen by the old hash; lookups use the new one, so `containsKey` returns `false` and `remove` can't find it — the entry is stranded until the map is rebuilt. Keys should be immutable.)
- "How would you write `equals` and `hashCode` today?" (For a plain data carrier, use a `record` — it generates both from all components. Otherwise let the IDE generate them from the identifying fields, make the class `final`, and verify with `EqualsVerifier`. Use `Objects.equals` and `Objects.hash` for nullable fields.)

Other follow-ups:

- "Can two unequal objects have the same hash code?" (Yes — that's a legal hash collision, not a contract violation. The contract only requires equal objects to share a hash code, not the reverse.)
- "Why does `Objects.hash()` exist, and what does it do internally?" (It's a convenience method that essentially wraps `Arrays.hashCode()` over the boxed arguments — combining multiple fields into one well-distributed hash value. The varargs array and boxing cost a little in very hot code, where a hand-written `31 * h + field` loop avoids them.)

#### Edge cases
- Mutable fields used in `hashCode()`/`equals()` are dangerous: if you mutate an object *after* inserting it into a `HashSet`/`HashMap`, its hash bucket becomes stale and the object may become "lost" (unfindable even via `contains()` on itself).
- Records (Java 16+, covered in the Modern Features group) auto-generate `equals()`/`hashCode()`/`toString()` based on all components — removing this entire class of bugs for simple data carriers. Array components are compared by identity, though: two records holding equal-content arrays are not equal.
- `BigDecimal.equals` compares scale too: `new BigDecimal("1.0").equals(new BigDecimal("1.00"))` is `false`, while `compareTo` returns 0 — so a `HashSet<BigDecimal>` and a `TreeSet<BigDecimal>` disagree about duplicates.
- `equals` must not throw: return `false` for `null` and for objects of other types.

#### Common mistakes
- Overriding `equals()` without `hashCode()` (or vice versa) — the single most common real-world violation.
- Using mutable fields as part of a hash key without understanding the "lost object in a HashSet" trap.
- Writing `equals(MyType other)` instead of `equals(Object o)`, which overloads rather than overrides.
- Comparing `String`s or `Integer`s with `==` and getting lucky in tests because of interning and the integer cache.

#### Comparisons

| | Default `Object` behavior | Properly overridden |
|---|---|---|
| `equals()` | Reference (`==`) comparison | Logical/value comparison |
| `hashCode()` | Identity hash code — stable for the object's lifetime; how it's produced is unspecified | Derived from the same fields used in `equals()` |
| `toString()` | `ClassName@hexHash` | Meaningful, readable representation |

#### Complexity
`Objects.hash()` is O(n) in the number of fields passed; well-implemented `hashCode()`/`equals()` keep `HashMap`/`HashSet` operations at their expected O(1) average case. A `hashCode` that returns a constant is legal but puts every element in one bucket.

#### Frequently confused with
`equals()` vs. `==` (see Group 1 fundamentals) — this topic revisits and formalizes that distinction at the OOP level. `equals` vs. `compareTo` — sorted collections use `compareTo`, so the two should agree (`compareTo` returning 0 exactly when `equals` is true).

#### Important facts to remember
- The equals/hashCode contract: equal objects MUST have equal hash codes; unequal objects MAY share a hash code.
- `equals` has five properties: reflexive, symmetric, transitive, consistent, `false` for `null`.
- Never use mutable fields in `hashCode()`/`equals()` for objects stored in hash-based collections, unless you can guarantee they won't be mutated while stored.
- Records auto-generate a contract-compliant `equals()`/`hashCode()`/`toString()` — with identity comparison for array components.

---

### 2.21 Immutability

#### Definition
An immutable object's state cannot change after construction. In Java that is a property of the class's design — private final fields, no mutators, no subclassing, and defensive copies of mutable components — not of any single keyword.

#### Why it exists
Immutable objects can be shared between threads, used as hash keys and cached without coordination, because nothing can ever change them; their invariants, checked once in the constructor, hold forever.

#### Interview explanation
**In 30 seconds** — An immutable class has `private final` fields set in the constructor, no setters, is `final` so subclasses can't add mutability, and defensively copies any mutable objects it takes in or gives out. `String`, `Integer`, `LocalDate` and `BigDecimal` are examples. "Modifying" one returns a new object. The payoff is thread safety without locks, safe hash keys and freely shareable values.

**If they push deeper** — A final reference isn't enough: `private final List<String> items` is still mutable through the list unless the class stores an unmodifiable copy and never leaks it. Copy before validating, so a caller can't change the argument between the check and the copy. Immutability is only as deep as the copying — `List.copyOf` of mutable `Date` objects protects the list, not the dates. Records are final with private final fields, but shallow: list components need `List.copyOf` in the compact constructor. Final-field semantics make a properly constructed immutable object safe to publish to other threads, provided `this` didn't escape the constructor.

#### Syntax
```java
public final class Money {
    private final long cents;
    private final Currency currency;

    public Money(long cents, Currency currency) {
        this.cents = cents;
        this.currency = Objects.requireNonNull(currency);
    }
    public Money plus(Money other) {
        if (!currency.equals(other.currency)) throw new IllegalArgumentException("currency mismatch");
        return new Money(cents + other.cents, currency);   // new object; this one is unchanged
    }
    public long cents() { return cents; }
}
```

#### Example
```java
record Team(String name, List<String> members) {
    Team {
        members = List.copyOf(members);   // compact constructor: copy the mutable component
    }
}
```

Predict the output — a question below asks for it:

```java
String s = "java";
s.toUpperCase();
System.out.println(s);

List<String> names = new ArrayList<>(List.of("Ann"));
List<String> view = Collections.unmodifiableList(names);
List<String> copy = List.copyOf(names);
names.add("Bob");
System.out.println(view.size() + " " + copy.size());

record Box(List<String> items) {}
Box box = new Box(names);
names.add("Cid");
System.out.println(box.items().size());
```

#### Common interview questions
- "How do you make a class immutable?" (Make the class `final` (or use private constructors with static factories), make every field `private final`, set them all in the constructor, provide no mutators, and defensively copy mutable inputs and never expose mutable internals. Methods that "change" it return a new instance. Trap: stopping at "make the fields final".)
- "What is the difference between a final reference and an immutable object?" (A final reference can't be reassigned; an immutable object can't change state. `final List<String> l = new ArrayList<>()` is a final reference to a mutable object. 2.18 has the full comparison.)
- "Why are immutable objects thread-safe?" (Because there are no writes after construction to race with, and the memory model guarantees that `final` fields are visible with their constructed values to any thread that obtains the reference — provided `this` didn't escape during construction. No locks or `volatile` are needed to share them.)
- "What does the snippet in the Example print?" (`java`, `2 1`, `3`. `toUpperCase()` returns a new string that is thrown away. The unmodifiable *view* reflects the later `add`; the `List.copyOf` snapshot doesn't. `Box` is a record without a defensive copy, so it holds the caller's list and sees `Cid` — records are only shallowly immutable.)
- "Why should the class be `final` if all its fields are final and private?" (A subclass could add its own mutable fields or override methods so the object appears to change, and code holding the parent type would trust it as immutable. Preventing subclassing keeps the guarantee for every instance of the type.)
- "A `Schedule` stores the caller's `List<LocalDate>` after checking it isn't empty. Later the schedule is empty. How?" (The constructor kept the caller's list, and the caller cleared it afterwards — or between the check and the assignment. Copy first (`this.dates = List.copyOf(dates)`), then validate the copy; `LocalDate` itself is immutable, so a shallow copy is enough.)

#### Follow-up questions
Interviewers rarely stop at "How do you make a class immutable?" — they drill down from your answer. Answer each step before opening it:

- "Is `Collections.unmodifiableList` enough for the getter?" (It stops callers from writing through the returned list, but it's a view: if the class still holds a mutable list and changes it — or the original caller kept a reference — the view shows those changes. Store an immutable copy (`List.copyOf`) and return that.)
- "What if the list's elements are mutable?" (Then the copy protects the list structure, not the elements; anyone holding an element can change it. Use immutable element types, or deep-copy each element.)
- "Are records immutable?" (Shallowly: fields are `private final`, the class is `final`, there are no setters. A component of a mutable type still needs a defensive copy in the compact constructor, and an array component is mutable no matter what.)
- "What does immutability cost, and how do you manage it?" (An allocation per change. That's usually negligible; for long sequences of changes, use a mutable builder (`StringBuilder`, a `Builder` class) and create the immutable object once at the end.)

Other follow-ups:

- "Can reflection change an immutable object?" (For ordinary classes on the classpath, reflection can still overwrite a final instance field — JDK 26 warns when it does (JEP 500) — but not the fields of records. Immutability is a design guarantee, not a defence against hostile code in the same JVM.)

#### Edge cases
- `String` caches its hash code in a non-final field, yet is immutable: the cached value is a pure function of the characters, so no caller can observe a change. Immutability is about observable state.
- A constructor that leaks `this` (registers a listener) can expose an "immutable" object before its fields are set, voiding the thread-safety guarantee.
- `BigInteger` and `BigDecimal` are not `final` — a historical mistake, so code that must trust them should copy arguments that might be untrusted subclasses.

#### Common mistakes
- Making fields `final` but returning a mutable internal collection or array from a getter.
- Copying after validating instead of before.
- Calling `s.trim()` or `date.plusDays(1)` and ignoring the returned object.

#### Comparisons

| | Mutable object | Immutable object |
|---|---|---|
| Thread safety | Needs synchronization | Safe to share without locks |
| As a hash key | Breaks if a hashed field changes | Always safe |
| Defensive copying when sharing | Required | Not needed |
| Cost of a change | In place | A new object |

| | `Collections.unmodifiableList(x)` | `List.copyOf(x)` |
|---|---|---|
| Kind | Read-only view of `x` | Independent unmodifiable list |
| Sees later changes to `x` | Yes | No |
| Null elements | Allowed | Rejected |

#### Complexity
Each modification allocates a new object, O(size of the object) to copy; reading is identical to a mutable object.

#### Frequently confused with
Immutable vs. unmodifiable — no one can change it vs. you can't change it through this reference. Immutable vs. `final` — an object property vs. a variable property.

#### Important facts to remember
- Recipe: final class, private final fields, no mutators, defensive copies in and out.
- Final reference ≠ immutable object; unmodifiable view ≠ immutable copy.
- Copy mutable inputs before validating them.
- Records are shallowly immutable — copy mutable components in the compact constructor.

---

### 2.22 Object Initialization Order

#### Definition
The fixed sequence in which Java runs initialization code: class initialization (static field initializers and `static` blocks, superclass first, once per class) before first use, then — for every `new` — the constructor chain from the top of the hierarchy down, each class running its instance field initializers and instance blocks just before the rest of its constructor body.

#### Why it exists
Each level of a hierarchy, and each piece of initialization code, may depend on earlier ones having run. A single deterministic order lets a subclass rely on its parent part being complete and on static state being ready.

#### Interview explanation
**In 30 seconds** — Two phases. Class initialization happens once, before first use: parent static initializers and blocks, then child's. Object initialization happens on every `new`: the parent's field initializers, instance blocks and constructor body, then the child's. So for `new Child()` the order is parent static, child static, parent instance, parent constructor, child instance, child constructor — and a second `new Child()` skips the static part.

**If they push deeper** — Field initializers and instance blocks run *inside* each constructor, after `super(...)` returns, in textual order. The hole in the order is dynamic dispatch: a parent constructor calling an overridable method runs the child's override before the child's fields are assigned, so it sees `null` or `0` — unless the field is a compile-time constant, which is inlined. Static initialization is triggered by first active use, not by loading; reading a constant variable doesn't trigger it; the JVM makes it thread-safe; and if it throws, the class is unusable — `ExceptionInInitializerError` first, `NoClassDefFoundError` after.

#### Syntax
```java
class Example {
    static int counter = 0;                       // static field initializer
    static { counter = 10; }                      // static initialization block
    int id = ++counter;                           // instance field initializer
    { System.out.println("instance block"); }     // instance initialization block
    Example() { System.out.println("constructor"); }
}
```

#### Example
```java
class Parent {
    Parent() { System.out.println("Parent"); }
}
class Child extends Parent {
    Child() { System.out.println("Child"); }      // implicit super() runs first
}
new Child();   // Parent, then Child
```

Predict the output — a question below asks for it:

```java
class Parent {
    static { System.out.println("A"); }
    { System.out.println("B"); }
    Parent() { System.out.println("C"); show(); }
    void show() { System.out.println("D"); }
}
class Child extends Parent {
    static { System.out.println("E"); }
    private String label = "F";
    { System.out.println("G"); }
    Child() { System.out.println("H " + label); }
    @Override void show() { System.out.println("I " + label); }
}

new Child();
new Child();
```

#### Common interview questions
- "What is the initialization order in an inheritance hierarchy?" (Once per class, before first use: superclass static initializers and static blocks, then the subclass's, each in textual order. Then for every object: memory zeroed; the superclass constructor chain completes first — for each class, its instance field initializers and instance blocks in textual order, then its constructor body — and the subclass's last. Trap: putting the child's field initializers before the parent's constructor.)
- "Why does the `Parent` constructor run before `Child`'s?" (Every constructor starts by calling a superclass constructor — `super()` implicitly if nothing is written — so `Child()` can't execute its own code until `Parent()` has finished. That guarantees the inherited part of the object is valid before the subclass builds on it.)
- "What is the difference between class initialization and object initialization?" (Class initialization runs static initializers and static blocks once per class, triggered by first active use. Object initialization runs instance initializers, instance blocks and constructors on every `new`. A class is initialized before its first object, but can be initialized without any object ever being created — by a static method call.)
- "What does the snippet in the Example print?" (First object: `A`, `E`, `B`, `C`, `I null`, `G`, `H F`. Second object: `B`, `C`, `I null`, `G`, `H F`. Static blocks run once, parent first. `Parent()` calls `show()`, which dispatches to `Child`'s override before `Child`'s initializer has assigned `label`, so it prints `null`.)
- "Why does an overridable method called from a constructor see `null`?" (Because dynamic dispatch picks the subclass's override as soon as the object exists, but the subclass's field initializers run only after the superclass constructor returns. The override runs in that gap. Constant fields are the exception — the compiler inlines them.)
- "A utility class's static block reads a config file. In production the first request fails with `ExceptionInInitializerError` and every later one with `NoClassDefFoundError`. What is happening?" (The static initializer threw during class initialization — the file was missing or malformed. The JVM marks the class as failed, so every later use reports `NoClassDefFoundError: Could not initialize class …` without the original cause. Find the first `ExceptionInInitializerError` in the logs, and move I/O out of static initializers.)

#### Follow-up questions
Interviewers rarely stop at "What is the initialization order in an inheritance hierarchy?" — they drill down from your answer. Answer each step before opening it:

- "When exactly is a class initialized?" (Immediately before its first active use: creating an instance, calling a static method, assigning a static field, or reading a static field that isn't a constant variable — or via reflection such as `Class.forName`. Initializing a class first initializes its superclass.)
- "Does reading `Config.MAX` always initialize `Config`?" (Not if `MAX` is a constant variable — a `static final` primitive or `String` initialised with a constant expression. The compiler copies the value into the caller, so `Config` isn't touched. A `static final Integer` or a computed value does trigger initialization.)
- "What if two threads use the class for the first time simultaneously?" (The JVM lets one thread run the static initializers while the other waits, so they run exactly once. The lazy holder idiom relies on that — and two classes whose static initializers each need the other, triggered from different threads, can deadlock.)
- "Where do instance initializer blocks fit relative to constructors?" (They are copied into every constructor that calls `super(...)` — right after that call, together with the field initializers, in textual order. A constructor that delegates with `this(...)` gets them through the constructor it delegates to, so they still run once.)

Other follow-ups:

- "In what order do static field initializers and static blocks run within one class?" (Top to bottom, interleaved exactly as written. A static block that reads a static field declared below it — through a method — sees the default value.)

#### Edge cases
- `static int a = b + 1; static int b = 5;` doesn't compile — an illegal forward reference — but reading `b` through a static method from `a`'s initializer compiles and sees `0`.
- A `final` instance field initialized with a constant (`final String name = "Rex"`) is inlined, so even an override called from the parent constructor sees the value; a non-constant `final` field still shows `null`.
- Initializing a class initializes its superclasses, but not the interfaces it implements — except interfaces that declare default methods, which are initialized along with it.
- An exception thrown by an instance initializer block propagates out of the constructor; instance blocks may throw checked exceptions only if every constructor declares them.

#### Common mistakes
- Assuming static blocks run when the class is loaded, or once per object.
- Calling overridable or abstract methods from constructors.
- Doing heavy work (I/O, network) in static initializers, which turns a transient failure into a permanently unusable class.

#### Comparisons

| | Class initialization | Object initialization |
|---|---|---|
| Runs | Static field initializers, `static` blocks | Instance field initializers, instance blocks, constructors |
| How often | Once per class (per class loader) | On every `new` |
| Triggered by | First active use of the class | `new` |
| Hierarchy order | Superclass first | Superclass part first |
| Failure | `ExceptionInInitializerError`, then `NoClassDefFoundError` | The exception propagates from `new` |

#### Complexity
Not applicable — but class initialization cost is paid on the first request that touches the class, which is why slow static initializers show up as first-request latency.

#### Frequently confused with
Class loading vs. class initialization — reading the bytecode vs. running static code. Field initializers vs. constructor body — initializers run inside the constructor, after `super(...)`.

#### Important facts to remember
- Static (once): parent → child. Instance (every `new`): parent's initializers + constructor → child's initializers + constructor.
- Instance initializers run after `super(...)` returns, before the rest of the constructor body.
- Overridable calls from constructors see the subclass's unassigned fields.
- Constant variables don't trigger class initialization.

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

#### Definition
The Java Collections Framework is a unified architecture of interfaces (`Collection`, `List`, `Set`, `Queue`, `Map`) and their implementing classes for storing and manipulating groups of objects.

#### Why it exists
To provide a standard, interoperable, pluggable set of data structures so code can depend on interfaces rather than specific implementations.

#### Interview explanation
Draw the hierarchy from memory: `Iterable` → `Collection` → `List`/`Set`/`Queue`, with `Map` as a completely separate top-level interface. This is one of the most commonly requested whiteboard diagrams in Java interviews.

#### Syntax
```java
List<String> list = new ArrayList<>();   // program to the interface
Set<String> set = new HashSet<>();
Map<String, Integer> map = new HashMap<>();
```

#### Example
```java
Collection<String> c = new ArrayList<>(); // ArrayList IS-A Collection
c.add("hello");
for (String s : c) System.out.println(s); // works via Iterable
```

#### Common interview questions
- "Is `Map` a `Collection`?" (No.)
- "Draw the Java Collections Framework hierarchy."
- "Why does `List` allow duplicates but `Set` doesn't?" (Different interface contracts, by design, for different use cases.)

#### Follow-up questions
- "Why isn't `Map` part of the `Collection` interface?" (Because its natural unit is a key-value pair, not a single element — it doesn't fit `Collection`'s single-element contract like `add(E e)`.)
- "What's the difference between `Collection` and `Collections`?" (`Collection` is an interface; `Collections` is an unrelated static utility class — a classic naming trap.)

#### Edge cases
- `Arrays.asList()` returns a fixed-size list backed by the original array — it's NOT a full `ArrayList` and throws `UnsupportedOperationException` on `add()`/`remove()`.
- Legacy classes (`Vector`, `Stack`, `Hashtable`) implement the modern interfaces but predate the framework and carry synchronized, slower implementations.

#### Common mistakes
- Confusing `Collection` (interface) with `Collections` (utility class).
- Assuming `Map` extends `Collection` — it doesn't.

#### Comparisons

| | Collection | Map |
|---|---|---|
| Base unit | Single element | Key-value pair |
| Extends `Iterable`? | Yes | No (but keySet()/values()/entrySet() return Collections that do) |
| Example implementations | List, Set, Queue | HashMap, TreeMap |

#### Complexity
Not applicable (structural topic).

#### Frequently confused with
`Collection` (interface) vs. `Collections` (utility class) — one letter apart, completely different purposes.

#### Important facts to remember
- `Map` is not a `Collection`.
- `Collection` extends `Iterable`; `Map` does not (directly).
- Legacy classes (`Vector`, `Stack`, `Hashtable`) are synchronized and generally discouraged in new code.

---

### 3.2 List Implementations (ArrayList vs LinkedList)

#### Definition
`List<E>` is an ordered `Collection` that permits duplicates and provides positional (indexed) access. `ArrayList` and `LinkedList` are the two primary implementations.

#### Why it exists
To provide flexible, resizable, ordered storage — solving the fixed-size limitation of raw arrays while preserving indexed access semantics.

#### Interview explanation
Be ready to justify "ArrayList is usually the better default" with the CPU cache-locality argument, not just Big-O — many candidates only cite complexity tables without understanding why ArrayList wins in practice despite LinkedList's theoretical O(1) insertions.

#### Syntax
```java
List<Integer> list = new ArrayList<>();
list.add(10);
list.add(0, 5); // insert at index 0 - O(n) for ArrayList
list.remove(Integer.valueOf(10)); // remove by value (careful: overload trap)
```

#### Example
```java
List<Integer> list = new ArrayList<>(List.of(1, 2, 3));
list.remove(1);       // removes INDEX 1 (element "2") - int overload
list.remove(Integer.valueOf(1)); // removes the VALUE 1 - Object overload
```

#### Common interview questions
- "ArrayList vs LinkedList — when would you use each?"
- "What's the time complexity of `ArrayList.get(i)` vs `LinkedList.get(i)`?"
- "How does ArrayList grow internally?" (Allocates a new, larger array — typically 1.5x current capacity — and copies elements over; this resize is O(n) but happens infrequently enough that `add()` is O(1) amortized.)

#### Follow-up questions
- "What's the classic `list.remove()` overload trap?" (`remove(int index)` vs `remove(Object o)` — calling `list.remove(1)` on a `List<Integer>` removes the element at index 1, NOT the value `1`; you must use `Integer.valueOf(1)` to remove by value.)
- "Is `ArrayList` thread-safe?" (No — needs external synchronization or `Collections.synchronizedList()`, or better, `CopyOnWriteArrayList` for read-heavy concurrent scenarios, covered in the Concurrency group.)

#### Edge cases
- Removing many elements from the front of an `ArrayList` is O(n) per removal (everything shifts left) — a real performance trap if done in a loop (O(n²) total).
- `LinkedList` implements both `List` and `Deque`, so it can be used as a stack/queue too, though `ArrayDeque` is generally preferred for that purpose.

#### Common mistakes
- The `remove(int)` vs `remove(Object)` overload trap (see above) — extremely common in interviews and real code both.
- Assuming LinkedList is always faster for insertions without accounting for the O(n) traversal needed to reach a middle position first.

#### Comparisons

| | ArrayList | LinkedList |
|---|---|---|
| Backing structure | Resizable array | Doubly-linked nodes |
| get(i) | O(1) | O(n) |
| add at end | O(1) amortized | O(1) |
| add/remove at front | O(n) | O(1) |
| Memory overhead | Lower | Higher (2 refs + object header per node) |
| Cache locality | Good | Poor |

#### Complexity
See table above — the headline numbers to memorize cold.

#### Frequently confused with
`remove(int)` vs `remove(Object)` overload ambiguity on `List<Integer>`.

#### Important facts to remember
- ArrayList resize is 1.5x growth (not doubling) in the JDK's implementation, giving O(1) amortized `add()`.
- `LinkedList` implements `Deque` as well as `List`.
- Prefer `ArrayList` by default unless you specifically need frequent insert/remove at both ends (use `ArrayDeque` for that instead of `LinkedList` in most cases).

---

### 3.3 Set Implementations (HashSet, LinkedHashSet, TreeSet)

#### Definition
`Set<E>` is a `Collection` that contains no duplicate elements. `HashSet`, `LinkedHashSet`, and `TreeSet` are the three standard implementations, each with different ordering and performance trade-offs.

#### Why it exists
To model the mathematical concept of a set (unique membership) with efficient duplicate detection, without needing to manually check for duplicates before every insert.

#### Interview explanation
Know exactly what each `Set` is backed by internally (`HashMap`, `LinkedHashMap`, `TreeMap` respectively) — this single fact unlocks almost every follow-up question about ordering and complexity.

#### Syntax
```java
Set<String> hashSet = new HashSet<>();
Set<String> linkedHashSet = new LinkedHashSet<>();
Set<String> treeSet = new TreeSet<>();
```

#### Example
```java
Set<Integer> unique = new HashSet<>(List.of(1, 2, 2, 3, 3, 3));
System.out.println(unique.size()); // 3 - duplicates silently dropped
```

#### Common interview questions
- "What's the difference between HashSet, LinkedHashSet, and TreeSet?"
- "How does HashSet ensure uniqueness?" (Uses the element's `equals()`/`hashCode()` — two elements are duplicates if `equals()` returns true, and both must be findable in the same bucket via consistent `hashCode()`.)
- "Can you store `null` in a `TreeSet`?" (No — throws `NullPointerException` since natural ordering can't compare against `null`.)

#### Follow-up questions
- "What happens if you add a mutable object to a HashSet, then mutate it?" (Its `hashCode()` may change, making it "lost" — `contains()` on the same (now-mutated) object may return `false` even though it's technically still in the set's internal array.)
- "Does TreeSet use `equals()` or `compareTo()` to determine uniqueness?" (`compareTo()` — if `compareTo()` returns 0 for two different objects, TreeSet treats them as duplicates, even if `equals()` would say they're different. This is a well-known contract subtlety.)

#### Edge cases
- `TreeSet` uniqueness is defined by `compareTo() == 0`, not `equals()` — these can disagree if `compareTo()` isn't consistent with `equals()`, causing surprising "silent duplicate rejection."
- `HashSet`/`LinkedHashSet` permit exactly one `null` element.

#### Common mistakes
- Assuming `Set` iteration order is meaningful/stable for `HashSet` (it isn't — only `LinkedHashSet`/`TreeSet` provide ordering guarantees).
- Forgetting that TreeSet's uniqueness check uses `compareTo()`, not `equals()`.

#### Comparisons

| | HashSet | LinkedHashSet | TreeSet |
|---|---|---|---|
| Backed by | HashMap | LinkedHashMap | TreeMap (red-black tree) |
| Order | None | Insertion order | Sorted order |
| add/remove/contains | O(1) avg | O(1) avg | O(log n) |
| Allows null | Yes (one) | Yes (one) | No |

#### Complexity
See table above.

#### Frequently confused with
`equals()`-based uniqueness (HashSet/LinkedHashSet) vs. `compareTo()`-based uniqueness (TreeSet) — these can silently disagree.

#### Important facts to remember
- HashSet/LinkedHashSet/TreeSet are backed by HashMap/LinkedHashMap/TreeMap respectively.
- TreeSet uniqueness uses `compareTo()`, not `equals()`.
- TreeSet throws NPE on inserting `null` with natural ordering.

---

### 3.4 Map Implementations (HashMap, LinkedHashMap, TreeMap, Hashtable)

#### Definition
`Map<K,V>` stores unique keys mapped to values. `HashMap`, `LinkedHashMap`, `TreeMap`, and the legacy `Hashtable` are the standard implementations.

#### Why it exists
To provide efficient key-based lookup, avoiding linear scans through a list every time you need to find something by a meaningful identifier.

#### Interview explanation
The HashMap internals question (bucket array, hashCode → bucket index, collision handling, treeification since Java 8) is one of the single highest-frequency deep-dive questions in Java interviews — be ready to explain it end-to-end, unprompted.

#### Syntax
```java
Map<String, Integer> map = new HashMap<>();
map.put("a", 1);
map.computeIfAbsent("b", k -> 0);
map.merge("a", 5, Integer::sum);
```

#### Example
```java
Map<String, Integer> wordCount = new HashMap<>();
for (String word : List.of("a", "b", "a", "c", "b", "a")) {
    wordCount.merge(word, 1, Integer::sum);
}
System.out.println(wordCount); // {a=3, b=2, c=1} (order not guaranteed)
```

#### Common interview questions
- "Explain how HashMap works internally."
- "What changed in HashMap's implementation in Java 8?" (Bucket collisions convert from a linked list to a red-black tree once a bucket exceeds 8 entries, capping worst-case lookup at O(log n) instead of O(n).)
- "HashMap vs Hashtable vs ConcurrentHashMap?" (See comparison table.)

#### Follow-up questions
- "What is the default load factor, and why 0.75?" (A balance between memory usage and collision rate — resizing (doubling capacity + rehashing) triggers once size exceeds capacity × load factor.)
- "Can HashMap have a null key?" (Yes, exactly one; `Hashtable` and `ConcurrentHashMap` do NOT allow null keys or values at all.)

#### Edge cases
- Using a mutable key that changes its `hashCode()` after insertion makes the entry unreachable via its original bucket — a "lost" entry.
- Iterating a `HashMap` while modifying it structurally (not via the iterator) throws `ConcurrentModificationException`.

#### Common mistakes
- Assuming `HashMap` iteration order reflects insertion order (only `LinkedHashMap` guarantees this).
- Using `Hashtable` in new code for thread safety — `ConcurrentHashMap` offers much better concurrent performance (full detail in Concurrency group).

#### Comparisons

| | HashMap | LinkedHashMap | TreeMap | Hashtable |
|---|---|---|---|---|
| Order | None | Insertion/access | Sorted by key | None |
| Thread-safe | No | No | No | Yes (fully synchronized) |
| Null key/value | 1 null key, many null values | Same | No null key | No null key/value |
| Typical use | General purpose | LRU caches (access-order mode) | Sorted/range queries | Legacy code only |

#### Complexity
`get`/`put`/`remove`: O(1) average, O(log n) worst case (post-Java 8 treeification) for HashMap/LinkedHashMap; O(log n) always for TreeMap.

#### Frequently confused with
HashMap vs Hashtable vs ConcurrentHashMap — a top-tier interview comparison question (full ConcurrentHashMap detail lives in the Concurrency group).

#### Important facts to remember
- Default load factor is 0.75; resizing doubles capacity and rehashes all entries.
- Since Java 8, buckets treeify (become red-black trees) past 8 entries, bounding worst-case lookup at O(log n).
- `Hashtable` is legacy and effectively superseded by `ConcurrentHashMap` for concurrent use.

---

### 3.5 Queue and Deque (ArrayDeque, PriorityQueue)

#### Definition
`Queue<E>` models FIFO processing order; `Deque<E>` (double-ended queue) supports insertion/removal at both ends and can serve as a stack or queue. `PriorityQueue<E>` orders elements by priority (natural ordering or a `Comparator`), not insertion order.

#### Why it exists
To model ordered-processing requirements directly — task queues, BFS traversal, undo stacks, and priority-based scheduling all map naturally onto these structures.

#### Interview explanation
`ArrayDeque` vs legacy `Stack`/`LinkedList` is a frequent "modern Java best practice" question. `PriorityQueue` internals (binary heap) come up often in heap-based algorithm questions (Top K elements, Dijkstra's algorithm, merge K sorted lists).

#### Syntax
```java
Deque<Integer> stack = new ArrayDeque<>();
stack.push(1); stack.pop();

Queue<Integer> queue = new ArrayDeque<>();
queue.offer(1); queue.poll();

PriorityQueue<Integer> minHeap = new PriorityQueue<>();
PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Comparator.reverseOrder());
```

#### Example
```java
// Classic "Top K" pattern using a min-heap of size K
PriorityQueue<Integer> minHeap = new PriorityQueue<>();
for (int num : new int[]{5, 1, 9, 3, 7}) {
    minHeap.offer(num);
    if (minHeap.size() > 3) minHeap.poll(); // remove smallest, keep top 3 largest
}
```

#### Common interview questions
- "Why is `ArrayDeque` preferred over `Stack` for stack behavior?" (`Stack` extends the legacy, fully-synchronized `Vector`, adding unnecessary locking overhead; `ArrayDeque` is faster and explicitly recommended by the JDK docs.)
- "How is a PriorityQueue implemented internally?" (A binary heap, stored in a resizable array — parent at index `i`, children at `2i+1` and `2i+2`.)
- "Is a PriorityQueue's iterator sorted?" (No — only repeated `poll()` calls guarantee sorted-order extraction.)

#### Follow-up questions
- "What's the time complexity of building a heap from n elements vs. inserting one at a time?" (Building from an existing array via `heapify` is O(n); inserting one-by-one is O(n log n) — a classic complexity nuance.)
- "How would you implement a max-heap using `PriorityQueue`, which is a min-heap by default?" (Pass `Comparator.reverseOrder()`, or negate/invert the natural ordering.)

#### Edge cases
- `ArrayDeque` does not allow `null` elements (throws `NullPointerException`) — unlike `LinkedList`, which does.
- Removing an arbitrary (non-head) element from a `PriorityQueue` is O(n), since the heap must be re-searched and re-heapified — only `poll()`/`peek()` on the head are efficient.

#### Common mistakes
- Assuming iterating a `PriorityQueue` directly gives sorted output.
- Using the legacy `Stack` class instead of `ArrayDeque` in new code.

#### Comparisons

| | ArrayDeque | PriorityQueue | Legacy Stack |
|---|---|---|---|
| Backing structure | Resizable circular array | Binary heap (array-backed) | Vector (synchronized array) |
| Order | Insertion (FIFO/LIFO via methods) | Priority order (via poll) | LIFO |
| Thread-safe | No | No | Yes (unnecessarily, for most uses) |
| Allows null | No | No | Yes |

#### Complexity
`offer`/`poll` on `PriorityQueue`: O(log n). `push`/`pop`/`offer`/`poll` on `ArrayDeque`: O(1) amortized.

#### Frequently confused with
Queue (FIFO) vs. Stack (LIFO) semantics when using the same `Deque` interface via different method pairs (`offer`/`poll` vs. `push`/`pop`).

#### Important facts to remember
- `ArrayDeque` is the modern, recommended replacement for both `Stack` and `LinkedList`-as-queue.
- `PriorityQueue` is a binary heap; only `poll()` guarantees priority order, not iteration.
- Neither `ArrayDeque` nor `PriorityQueue` permits `null` elements.

---

### 3.6 Iterator and Iterable

#### Definition
`Iterable<T>` provides an `iterator()` method, enabling for-each loop support. `Iterator<T>` provides `hasNext()`, `next()`, and `remove()` for controlled, stateful traversal.

#### Why it exists
To provide a uniform, structure-agnostic way to traverse any collection, and to support safe element removal during traversal.

#### Interview explanation
The `ConcurrentModificationException` question is nearly universal in Java interviews — know the `modCount`/fail-fast mechanism precisely, and know that `Iterator.remove()` is the sanctioned way to avoid it.

#### Syntax
```java
Iterator<String> it = list.iterator();
while (it.hasNext()) {
    String s = it.next();
    if (condition(s)) it.remove();
}
```

#### Example
```java
List<Integer> nums = new ArrayList<>(List.of(1, 2, 3, 4, 5));
Iterator<Integer> it = nums.iterator();
while (it.hasNext()) {
    if (it.next() % 2 == 0) it.remove(); // safely removes even numbers
}
System.out.println(nums); // [1, 3, 5]
```

#### Common interview questions
- "What is `ConcurrentModificationException` and when does it occur?"
- "How does the fail-fast mechanism work internally?" (Each structural modification increments a `modCount` field; the iterator captures `modCount` at creation and checks it matches on every `next()` call — a mismatch throws the exception.)
- "What's the difference between `Iterator` and `ListIterator`?"

#### Follow-up questions
- "Is fail-fast behavior guaranteed?" (No — the JDK documentation explicitly states fail-fast behavior is 'best effort' and should not be relied upon for correctness, only for bug detection during development.)
- "How would you safely remove elements from a `List` while iterating, other than using `Iterator.remove()`?" (Use `removeIf()` (a `Collection` default method, internally handles this safely), or iterate a copy and remove from the original.)

#### Edge cases
- Modifying a collection via a *different* iterator or the collection's own methods (not the one you're currently using) still triggers `ConcurrentModificationException`, even if functionally "safe" in your specific case.
- `ListIterator` allows backward traversal (`hasPrevious()`/`previous()`) and in-place replacement (`set()`), which the base `Iterator` does not support.

#### Common mistakes
- Calling `collection.remove()` directly inside a for-each loop over that same collection (the most common trigger of `ConcurrentModificationException` in real code).
- Assuming `ConcurrentModificationException` is thrown reliably in all cases — it's a best-effort safety net, not a hard guarantee, especially under concurrent multi-threaded modification.

#### Comparisons

| | Iterator | ListIterator |
|---|---|---|
| Direction | Forward only | Forward and backward |
| Remove | Yes | Yes |
| Add/Set | No | Yes |
| Available on | Any Collection | List only |

#### Complexity
Iteration itself is O(n) total for a full traversal; individual `next()`/`hasNext()` calls are O(1).

#### Frequently confused with
`ConcurrentModificationException` (single-threaded, fail-fast detection) vs. genuine thread-safety issues in concurrent collections (a completely different concern, covered in the Concurrency group).

#### Important facts to remember
- `Iterator.remove()` is the only safe way to remove elements mid-iteration without triggering `ConcurrentModificationException`.
- Fail-fast behavior is "best effort," not a guaranteed detection mechanism.
- `ListIterator` extends `Iterator` with backward traversal and in-place modification, available only on `List`.

---

### 3.7 Comparable vs Comparator

#### Definition
`Comparable<T>` defines a single natural ordering implemented by the class itself via `compareTo()`. `Comparator<T>` defines an external, swappable ordering via `compare()`, independent of the class.

#### Why it exists
To separate "the one true default ordering" (which a class might reasonably claim to have) from "however many alternative orderings callers might need" (which shouldn't require modifying the class).

#### Interview explanation
Be ready to write both from scratch, and to chain comparators (`thenComparing`) live — this is an extremely common practical coding exercise, not just a conceptual question.

#### Syntax
```java
class Person implements Comparable<Person> {
    int age;
    @Override public int compareTo(Person o) { return Integer.compare(age, o.age); }
}

Comparator<Person> byName = Comparator.comparing(p -> p.name);
Comparator<Person> byAgeThenName = Comparator.comparingInt((Person p) -> p.age).thenComparing(p -> p.name);
```

#### Example
```java
List<Person> people = new ArrayList<>(...);
Collections.sort(people); // natural order via Comparable
people.sort(byAgeThenName.reversed()); // custom, chained, reversed
```

#### Common interview questions
- "What's the difference between Comparable and Comparator?"
- "What must `compareTo()` return, and what do the return values mean?" (Negative if this < other, zero if equal, positive if this > other — exact magnitude is not significant, only the sign, by convention.)
- "Can you sort a list of objects that don't implement Comparable?" (Yes, using an explicit `Comparator` passed to `sort()`.)

#### Follow-up questions
- "What's the contract between `compareTo()` and `equals()`?" ("Consistent with equals" is recommended (not strictly enforced) — `x.compareTo(y) == 0` should imply `x.equals(y)`; violating it causes surprising behavior in sorted collections like `TreeSet`/`TreeMap`.)
- "How would you sort in descending order using a Comparator?" (`Comparator.reverseOrder()`, or `.reversed()` on an existing comparator.)

#### Edge cases
- If `compareTo()`/`compare()` is inconsistent with `equals()`, `TreeSet`/`TreeMap` will treat elements comparing as equal (`compareTo() == 0`) as duplicates, even if `.equals()` disagrees.
- Integer overflow in naive `compareTo()` implementations like `return a - b;` — this can silently produce a wrong sign due to overflow; always prefer `Integer.compare(a, b)`.

#### Common mistakes
- Writing `return a - b;` for numeric comparison instead of `Integer.compare(a, b)` — an overflow trap that's a favorite interview "spot the bug" exercise.
- Forgetting `Comparator` methods are chainable (`thenComparing`) and instead writing verbose nested if/else comparison logic manually.

#### Comparisons

| | Comparable | Comparator |
|---|---|---|
| Defined | Inside the class itself | External, separate object |
| Method | `compareTo(T o)` | `compare(T a, T b)` |
| Number of orderings | One (the "natural" one) | Unlimited |
| Modifies original class? | Yes (must implement interface) | No |

#### Complexity
Not applicable directly — though the choice of comparator affects the comparison cost per element during a sort, which itself is O(n log n) for `Collections.sort`/`List.sort` (TimSort).

#### Frequently confused with
`compareTo()` return value meaning — many mistakenly think it must return exactly -1/0/1, when only the *sign* matters.

#### Important facts to remember
- Only the sign of `compareTo()`/`compare()` matters, not the magnitude.
- Use `Integer.compare(a, b)` instead of `a - b` to avoid overflow bugs.
- `compareTo()` should ideally be consistent with `equals()`, especially for use in `TreeSet`/`TreeMap`.

---

### 3.8 The Collections Utility Class

#### Definition
`Collections` is a final utility class of static methods operating on or returning `Collection` objects — sorting, searching, shuffling, and creating special-purpose wrapper views (unmodifiable, synchronized, singleton, empty).

#### Why it exists
To centralize common collection algorithms and provide standard wrapper behaviors, avoiding repeated, error-prone reimplementation across codebases.

#### Interview explanation
Know the distinction between an "unmodifiable view" and a true immutable copy cold — this trips up even experienced developers and is a frequent "gotcha" interview question.

#### Syntax
```java
Collections.sort(list);
Collections.sort(list, comparator);
List<T> unmod = Collections.unmodifiableList(list);
List<T> sync = Collections.synchronizedList(list);
int idx = Collections.binarySearch(sortedList, key);
```

#### Example
```java
List<Integer> original = new ArrayList<>(List.of(3, 1, 2));
List<Integer> view = Collections.unmodifiableList(original);
original.add(4);
System.out.println(view); // [3, 1, 2, 4] - view reflects the change!
view.add(5); // throws UnsupportedOperationException
```

#### Common interview questions
- "What's the difference between `Collections.unmodifiableList()` and `List.copyOf()` (Java 10+)?" (`unmodifiableList` wraps and reflects changes to the original; `List.copyOf()` creates a true independent, immutable snapshot.)
- "Is `Collections.synchronizedList()` fully thread-safe?" (Only for individual method calls — compound operations (iteration, check-then-act) still require external synchronization on the returned list object.)
- "How does `Collections.binarySearch()` work, and what's required beforehand?" (The list must already be sorted according to the same ordering used for the search, or results are undefined.)

#### Follow-up questions
- "Why would `Collections.emptyList()` be preferable to `new ArrayList<>()`?" (Returns a shared, immutable singleton instance — avoids unnecessary allocation for a case that never needs mutation.)
- "What happens if you call `Collections.sort()` on a list of objects with no natural ordering and no comparator?" (Compile error if the type doesn't implement `Comparable` and no `Comparator` overload is used.)

#### Edge cases
- Iterating a `Collections.synchronizedList()`-wrapped list still requires manually synchronizing on the list object during iteration to avoid `ConcurrentModificationException` from concurrent structural changes.
- `Collections.unmodifiableList()` on an already-mutable list doesn't protect against changes made directly to the underlying original reference — only against changes attempted through the wrapper itself.

#### Common mistakes
- Believing `Collections.unmodifiableX()` produces a fully independent, tamper-proof copy — it's a live view, not a copy.
- Forgetting that `Collections.binarySearch()` requires pre-sorted input; running it on an unsorted list gives undefined (often wrong) results without throwing any error.

#### Comparisons

| | `Collections.unmodifiableList()` | `List.copyOf()` (Java 10+) |
|---|---|---|
| Reflects changes to original? | Yes (live view) | No (independent snapshot) |
| Creates new memory? | No (wrapper only) | Yes (actual copy) |
| Throws on mutation attempt? | Yes | Yes |

#### Complexity
`Collections.sort()`: O(n log n) (TimSort). `Collections.binarySearch()`: O(log n) (requires sorted input). `Collections.max()`/`min()`: O(n).

#### Frequently confused with
`Collection` (interface) vs. `Collections` (this utility class) — see 3.1.

#### Important facts to remember
- `Collections.unmodifiableX()` is a live, mutable-underneath view, NOT an immutable copy.
- `Collections.synchronizedX()` only protects individual calls, not compound/iteration operations.
- `Collections.binarySearch()` requires the input already be sorted consistently with the search's comparison logic.

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

#### Definition
Generics parameterize types, letting classes, interfaces, and methods operate over a type specified by the caller, with all checking performed at compile time.

#### Why it exists
To move `ClassCastException`s from runtime to compile time and eliminate manual casting when retrieving values from containers.

#### Interview explanation
Frame it as "compile-time type safety with zero runtime cost." Mention that generics were retrofitted in Java 5 via erasure specifically to preserve compatibility with existing libraries — this single fact explains most follow-up questions.

#### Syntax
```java
List<String> list = new ArrayList<>();
Map<String, List<Integer>> nested = new HashMap<>();
```

#### Example
```java
List raw = new ArrayList();
raw.add("text");
raw.add(42);
String s = (String) raw.get(1);  // compiles, ClassCastException at runtime

List<String> typed = new ArrayList<>();
typed.add("text");
// typed.add(42);                // compile error - caught immediately
```

#### Common interview questions
- "What problem do generics solve?"
- "What is a raw type and why should you avoid it?"
- "Do generics have any runtime performance cost?" (No — erasure means the bytecode is essentially what you'd have written manually with casts.)

#### Follow-up questions
- "Why were generics not added in Java 1.0?" (They came in Java 5; erasure was chosen so pre-existing compiled code and libraries kept working without recompilation.)
- "What's the difference between `List`, `List<?>`, and `List<Object>`?" (`List` is a raw type that disables all generic checking; `List<?>` is a typed list of unknown element type that mostly forbids adds; `List<Object>` explicitly holds any object and permits adds.)

#### Edge cases
- Using a raw type anywhere in an expression disables generic checking for *all* of that reference's operations, not just the one you skipped — an easy way to silently reintroduce runtime cast errors.
- Mixing generic and raw code produces "unchecked" warnings, which are warnings rather than errors purely for legacy-migration reasons.

#### Common mistakes
- Suppressing unchecked warnings with `@SuppressWarnings("unchecked")` without understanding why the warning appeared.
- Assuming generics provide any runtime type enforcement whatsoever.

#### Comparisons

| | Raw type (`List`) | Parameterized (`List<String>`) |
|---|---|---|
| Compile-time checking | Disabled | Full |
| Casts required | Yes, manual | No, compiler-inserted |
| Warnings | Unchecked warnings | Clean |

#### Complexity
No runtime complexity impact — generics are erased and add zero overhead.

#### Frequently confused with
Java generics (erased) vs. C++ templates (reified, generate distinct code per type) vs. C# generics (reified, type info available at runtime).

#### Important facts to remember
- Generics are compile-time only, fully erased in bytecode.
- Raw types disable generic checking entirely for that reference.
- Generics introduce no runtime performance penalty.

---

### 4.2 Generic Classes

#### Definition
A class declaring one or more type parameters after its name, usable throughout its body as field, parameter, and return types.

#### Why it exists
So a single class definition can serve unlimited type combinations without duplicating code or falling back to `Object`.

#### Interview explanation
Be ready to write a generic class live — `Pair<K,V>` or a generic `Stack<T>` are the two most common asks. Mention the diamond operator and why static members can't use T.

#### Syntax
```java
class Container<T> {
    private T value;
    public void set(T value) { this.value = value; }
    public T get() { return value; }
}
```

#### Example
```java
class Cache<K, V> {
    private final Map<K, V> store = new HashMap<>();
    public void put(K key, V value) { store.put(key, value); }
    public Optional<V> get(K key) { return Optional.ofNullable(store.get(key)); }
}

Cache<String, User> userCache = new Cache<>();
```

#### Common interview questions
- "Write a generic Pair class."
- "Why can't a generic class have a static field of type T?" (Static members belong to the class, shared across all parameterizations — there's no single T for them to reference.)
- "What does the diamond operator do?" (Infers type arguments on the right side of an assignment, added in Java 7.)

#### Follow-up questions
- "Can a generic class extend another generic class?" (Yes — `class IntBox extends Box<Integer>` fixes the parameter, or `class SubBox<T> extends Box<T>` propagates it.)
- "Can a class have both class-level and method-level type parameters?" (Yes — a method can declare its own `<R>` independent of the class's `<T>`.)

#### Edge cases
- A generic class *can* have static *methods* with their own type parameters — the restriction only applies to using the *class's* type parameters in static context.
- Instantiating with a raw type (`new Container()`) silently opts out of all type checking for that reference.

#### Common mistakes
- Trying to declare `static T instance;` inside a generic class.
- Omitting the diamond and writing the full type argument twice, which is verbose but harmless.

#### Comparisons

| | Generic class | Non-generic class using Object |
|---|---|---|
| Type safety | Compile-time enforced | None — runtime casts |
| Casting at call site | Not needed | Required |
| Can hold mixed types accidentally | No | Yes |

#### Complexity
Not applicable.

#### Frequently confused with
Class-level type parameters (`class Box<T>`) vs. method-level (`<T> void m()`) — the latter is scoped only to that method.

#### Important facts to remember
- Static fields and static methods cannot use the *class's* type parameters.
- The diamond operator infers type arguments (Java 7+), and works with anonymous classes since Java 9.
- A generic class can declare additional method-level type parameters freely.

---

### 4.3 Generic Methods

#### Definition
A method declaring its own type parameters before the return type, independent of whether its enclosing class is generic.

#### Why it exists
To enable type-safe utility methods without forcing the whole class to be parameterized.

#### Interview explanation
The syntax position of `<T>` is the most-missed detail — it goes after the modifiers, before the return type. Expect to write one live, often a `max()` or a collection-transform helper.

#### Syntax
```java
public static <T> List<T> repeat(T item, int times) {
    List<T> result = new ArrayList<>();
    for (int i = 0; i < times; i++) result.add(item);
    return result;
}
```

#### Example
```java
public static <T extends Comparable<T>> T max(List<T> list) {
    T best = list.get(0);
    for (T item : list) if (item.compareTo(best) > 0) best = item;
    return best;
}

Integer m = max(List.of(3, 9, 2));   // T inferred as Integer
```

#### Common interview questions
- "Write a generic method that finds the maximum element in a list."
- "Where does the type parameter declaration go in a generic method?" (Between the modifiers and the return type.)
- "What is a type witness?" (Explicit syntax like `Collections.<String>emptyList()` for the rare cases where inference fails or is ambiguous.)

#### Follow-up questions
- "Can a static method be generic?" (Yes — this is exactly how utility methods like `Collections.sort` and `Arrays.asList` are written.)
- "Can a generic method's type parameter shadow the class's?" (Yes, and it's a readability hazard — the method's `T` hides the class's `T` entirely inside that method.)

#### Edge cases
- If inference can't determine T from arguments (e.g., a method whose T only appears in the return type), the compiler infers from the assignment target, or you supply a type witness.
- Overloading two methods whose parameters erase to the same signature (`f(List<String>)` and `f(List<Integer>)`) is a compile error — "name clash: both methods have the same erasure."

#### Common mistakes
- Writing `public T <T> method()` — wrong order; the declaration comes first.
- Forgetting to declare `<T>` and getting "cannot find symbol: class T."

#### Comparisons

| | Generic class | Generic method |
|---|---|---|
| Scope of T | Entire class | That method only |
| Declared where | After class name | Before return type |
| Requires generic class? | N/A | No |

#### Complexity
Not applicable.

#### Frequently confused with
The `<T>` declaration vs. the `T` return type in `static <T> T pick(...)` — two different things on the same line.

#### Important facts to remember
- `<T>` goes between modifiers and return type.
- Generic methods work in non-generic classes.
- Type inference usually makes type witnesses unnecessary.

---

### 4.4 Type Parameters and Naming Conventions

#### Definition
Single-letter identifiers conventionally used as type parameter names, each carrying implied meaning by position and usage.

#### Why it exists
To make generic signatures instantly readable across every Java codebase and the JDK itself.

#### Interview explanation
Low-frequency as a standalone question, but using the wrong conventions in a live-coding exercise signals inexperience — get them right without thinking.

#### Syntax
```java
interface Function<T, R> { R apply(T t); }     // T=input, R=result
interface Map<K, V> { V get(K key); }          // K=key, V=value
interface Collection<E> { boolean add(E e); }  // E=element
```

#### Example
```java
class Repository<T, ID> {   // descriptive names are acceptable when clearer
    T findById(ID id) { return null; }
}
```

#### Common interview questions
- "What does E stand for in `List<E>`?" (Element.)
- "Why does `Function` use `<T, R>` instead of `<T, U>`?" (R communicates "result" explicitly, which reads better for a function type.)

#### Follow-up questions
- "Can type parameters have multi-letter names?" (Yes — Spring Data uses `<T, ID>`; readability should drive the choice, not dogma.)
- "Does the compiler treat `T` specially?" (No — it's an ordinary identifier; only position and bounds matter.)

#### Edge cases
- A type parameter can shadow a real class name (`class Box<String>` compiles, and inside it `String` means the type parameter, not `java.lang.String`) — legal but pathological.
- Nested generic classes can shadow the outer class's parameters, producing confusing compile errors.

#### Common mistakes
- Using `T` for a map's key type instead of `K`, which reads as an unrelated general type.
- Shadowing outer type parameters accidentally in inner classes.

#### Comparisons

| Letter | Convention |
|---|---|
| `T` | General type |
| `E` | Collection element |
| `K` / `V` | Map key / value |
| `R` | Function result |
| `N` | Number |
| `S`, `U` | Additional types |

#### Complexity
Not applicable.

#### Frequently confused with
A type parameter named `E` vs. an actual class named `E` — shadowing makes this genuinely ambiguous to readers.

#### Important facts to remember
- Conventions are compiler-irrelevant but reader-critical.
- The JDK follows them consistently, so matching them makes your code feel native.
- Descriptive multi-letter names are acceptable when they materially improve clarity.

---

### 4.5 Bounded Type Parameters

#### Definition
A type parameter constrained with `extends` to a supertype, restricting valid type arguments and unlocking that supertype's API inside the generic code.

#### Why it exists
An unbounded `T` is effectively `Object` inside the class body — bounds tell the compiler enough about T to call meaningful methods on it.

#### Interview explanation
The key insight to state: bounds are what make generic code *useful*, not just safe. Also mention that `extends` in a bound covers interfaces too — you never write `implements` in a bound.

#### Syntax
```java
<T extends Number>                        // upper bound, class
<T extends Comparable<T>>                 // recursive bound, interface
<T extends Number & Comparable<T>>        // multiple bounds
```

#### Example
```java
static <T extends Number & Comparable<T>> T clamp(T value, T min, T max) {
    if (value.compareTo(min) < 0) return min;
    if (value.compareTo(max) > 0) return max;
    return value;
}
```

#### Common interview questions
- "What does `<T extends Comparable<T>>` mean, and why the nested T?" (T must be comparable *to itself*, ensuring `a.compareTo(b)` is type-safe rather than accepting any Object.)
- "Can you have multiple bounds? What's the ordering rule?" (Yes, with `&`; a class bound must come first, followed by interfaces.)
- "Is there a lower bound for type parameters?" (No — lower bounds exist only for wildcards (`? super T`), never for type parameter declarations.)

#### Follow-up questions
- "Why does erasure replace T with the bound instead of Object?" (Because the compiler can safely assume T is at least the bound, allowing more efficient bytecode with fewer casts.)
- "What's the difference between `<T extends Number>` and `<? extends Number>`?" (The first declares a named type parameter you can reference throughout; the second is an anonymous wildcard usable only at a single use-site.)

#### Edge cases
- Only one class bound is permitted, and it must be listed first; all remaining bounds must be interfaces.
- `<T extends Comparable>` (raw bound) compiles but loses type safety in comparisons — always parameterize it.

#### Common mistakes
- Writing `<T implements Comparable<T>>` — `implements` is never valid in a bound.
- Using a raw `Comparable` bound instead of `Comparable<T>`.

#### Comparisons

| | Unbounded `<T>` | Bounded `<T extends Number>` |
|---|---|---|
| Methods callable on T | Object methods only | Number's methods too |
| Erases to | Object | Number |
| Accepted type arguments | Any reference type | Number and its subtypes |

#### Complexity
Not applicable.

#### Frequently confused with
Bounded type parameters (`<T extends Number>`, named and reusable) vs. bounded wildcards (`<? extends Number>`, anonymous and use-site).

#### Important facts to remember
- `extends` in bounds covers both classes and interfaces; `implements` is never used.
- Multiple bounds use `&`, class first.
- There is no `super` bound for type parameter declarations — only for wildcards.

---

### 4.6 Wildcards

#### Definition
`?` denotes an unknown type. `? extends T` bounds it above (covariance), `? super T` bounds it below (contravariance).

#### Why it exists
Invariance makes generic APIs too rigid — wildcards restore flexibility at method boundaries without sacrificing type safety.

#### Interview explanation
PECS (Producer Extends, Consumer Super) is the expected answer, but explain *why*: with `? extends T` the compiler can't know the exact element type, so adds are unsafe; with `? super T` it knows the list accepts at least T, so adds are safe but reads degrade to Object.

#### Syntax
```java
void read(List<? extends Number> src)   // producer - read only
void write(List<? super Integer> dest)  // consumer - write only
void inspect(List<?> any)               // unbounded - neither
```

#### Example
```java
// The JDK's own Collections.copy signature demonstrates PECS perfectly
public static <T> void copy(List<? super T> dest, List<? extends T> src) {
    for (int i = 0; i < src.size(); i++) dest.set(i, src.get(i));
}
```

#### Common interview questions
- "Explain PECS."
- "Why can't you add to a `List<? extends Number>`?" (The actual list might be `List<Integer>`; adding a `Double` would corrupt it, so the compiler forbids all adds except `null`.)
- "What can you read from a `List<? super Integer>`?" (Only `Object` — the actual type could be `List<Number>` or `List<Object>`, so nothing more specific is guaranteed.)

#### Follow-up questions
- "Can you add `null` to a `List<? extends Number>`?" (Yes — `null` is assignable to every reference type, so it's the single legal add.)
- "When would you use an unbounded `List<?>` instead of `List<Object>`?" (When the element type is genuinely irrelevant — e.g., a method that only calls `size()` or `clear()`. `List<Object>` would reject a `List<String>` argument entirely.)

#### Edge cases
- `List<?>` permits `add(null)` and nothing else; every other add is rejected.
- Wildcard capture: the compiler internally assigns a temporary name to `?`, which is why a private helper method with a real type parameter can sometimes work around a wildcard restriction.

#### Common mistakes
- Choosing `? extends T` on a parameter you need to write into, then fighting the compiler.
- Using wildcards on return types — generally discouraged, since it forces every caller to deal with wildcards too.

#### Comparisons

| | `? extends T` | `? super T` | `?` |
|---|---|---|---|
| Read as | T | Object | Object |
| Write | Only null | T and subtypes | Only null |
| Mnemonic | Producer | Consumer | Neither |
| Variance | Covariant | Contravariant | Unbounded |

#### Complexity
Not applicable.

#### Frequently confused with
`List<?>` vs. `List<Object>` — the former is "some unknown specific type," the latter is "explicitly holds Objects."

#### Important facts to remember
- PECS: Producer Extends, Consumer Super.
- `null` is the only value addable to `? extends T` collections.
- Avoid wildcards in return types; use them on parameters.

---

### 4.7 Type Erasure

#### Definition
The compile-time process that removes type parameters from generic code, replacing them with their bounds (or `Object`) and inserting casts and bridge methods as needed.

#### Why it exists
To guarantee binary compatibility with pre-Java-5 code, so existing libraries continued working when generics were introduced.

#### Interview explanation
This is the highest-yield generics question. State the mechanism, then immediately connect it to consequences: no `new T()`, no generic arrays, no `instanceof` with type arguments, no overloading on erased signatures. Interviewers want to see you derive the restrictions rather than memorize a list.

#### Syntax
```java
// Source
class Box<T extends Number> { T value; }

// After erasure (conceptually)
class Box { Number value; }
```

#### Example
```java
List<String> strings = new ArrayList<>();
List<Integer> ints = new ArrayList<>();
System.out.println(strings.getClass() == ints.getClass());  // true

// Overloading on erasure fails to compile:
// void process(List<String> l) {}
// void process(List<Integer> l) {}   // name clash: same erasure
```

#### Common interview questions
- "What is type erasure?"
- "What does `new ArrayList<String>().getClass()` return, and how does it compare to `new ArrayList<Integer>().getClass()`?" (Both return the same `ArrayList` class object.)
- "What is a bridge method?" (A synthetic method the compiler generates to preserve polymorphism when a subclass overrides a generic method with a more specific type after erasure.)

#### Follow-up questions
- "Can you ever recover generic type information at runtime?" (Yes, in specific cases — type arguments baked into a *declaration* (superclass, field, or method signature) are retained in class metadata and readable via `getGenericSuperclass()`/`getGenericType()`. This is how Jackson's `TypeReference` and Spring's `ParameterizedTypeReference` work — the anonymous subclass trick.)
- "What is heap pollution?" (When a parameterized variable refers to an object of a different parameterization, typically via raw types or unchecked casts — leading to `ClassCastException` at a seemingly unrelated location later.)

#### Edge cases
- `@SafeVarargs` exists specifically because generic varargs create a generic array internally, risking heap pollution — the annotation asserts the method doesn't store anything unsafe into it.
- Bridge methods appear in stack traces and reflection output, occasionally confusing debugging sessions.

#### Common mistakes
- Believing reflection can always recover type arguments (it can only do so for declaration-site information, not for a plain object's runtime state).
- Overloading methods whose parameters share an erasure.

#### Comparisons

| | Java (erasure) | C# / C++ (reification) |
|---|---|---|
| Runtime type info | Absent | Present |
| `new T()` | Illegal | Legal |
| Generic arrays | Illegal | Legal |
| Backward compatibility | Preserved | N/A |

#### Complexity
No runtime cost; erasure is purely a compile-time transformation.

#### Frequently confused with
Erasure vs. reification — the single most important conceptual distinction in Java generics.

#### Important facts to remember
- All parameterizations of a generic class share one runtime `Class` object.
- Type arguments in *declarations* survive in metadata; those on plain instances do not.
- Bridge methods are compiler-generated to preserve overriding across erasure.

---

### 4.8 Generics and Inheritance (Invariance)

#### Definition
Generic types are invariant: for any distinct types A and B, `List<A>` has no subtype relationship to `List<B>`, even when A extends B.

#### Why it exists
To close a type-safety hole. If `List<Integer>` were assignable to `List<Number>`, a caller could insert a `Double`, corrupting the list for its original owner.

#### Interview explanation
Always contrast with arrays, which *are* covariant. The array case demonstrates exactly what invariance prevents — arrays defer the same error to runtime via `ArrayStoreException`.

#### Syntax
```java
List<Integer> ints = new ArrayList<>();
// List<Number> nums = ints;                    // compile error
List<? extends Number> nums = ints;             // legal via wildcard
```

#### Example
```java
// Arrays are covariant - and that's a design flaw
Object[] arr = new Integer[3];
arr[0] = "string";   // compiles; throws ArrayStoreException at runtime

// Generics are invariant - error caught at compile time instead
List<Object> list = new ArrayList<Integer>();  // won't compile
```

#### Common interview questions
- "Is `List<Integer>` a subtype of `List<Number>`?" (No.)
- "Why are arrays covariant but generics invariant?" (Arrays predate generics and were made covariant for pre-generics API flexibility; the cost is runtime `ArrayStoreException` checks. Generics chose compile-time safety instead.)
- "How do you write a method accepting a list of any Number subtype?" (Use `List<? extends Number>`.)

#### Follow-up questions
- "Is `List<Integer>` a subtype of `Collection<Integer>`?" (Yes — inheritance among the *generic type declarations* works normally; only the type *arguments* are invariant.)
- "What is `ArrayStoreException` and when does it occur?" (Thrown when storing an object of an incompatible type into a covariant array reference — the runtime check that generics avoid needing.)

#### Edge cases
- Generic *inheritance* is normal: `ArrayList<String>` IS-A `List<String>` IS-A `Collection<String>`. Only the type argument position is invariant.
- Arrays of generic types (`List<String>[]`) are forbidden precisely because array covariance plus erasure would defeat the runtime store check.

#### Common mistakes
- Declaring parameters as `List<Number>` and discovering `List<Integer>` callers are rejected.
- Assuming invariance applies to the container hierarchy too (it doesn't — only to type arguments).

#### Comparisons

| | Arrays | Generics |
|---|---|---|
| Variance | Covariant | Invariant |
| Error timing | Runtime (`ArrayStoreException`) | Compile time |
| Type info at runtime | Retained (reified) | Erased |

#### Complexity
Not applicable.

#### Frequently confused with
Subtyping of the generic type itself (`ArrayList<T>` → `List<T>`, allowed) vs. subtyping of type arguments (`List<Integer>` → `List<Number>`, forbidden).

#### Important facts to remember
- Generics are invariant; arrays are covariant.
- Wildcards exist specifically to reintroduce controlled variance.
- Array covariance is widely regarded as a Java design mistake.

---

### 4.9 Restrictions and Limitations

#### Definition
The set of operations forbidden in generic code, all deriving from the absence of runtime type information after erasure.

#### Why it exists
Each restriction blocks an operation that would require knowing T at runtime — knowledge erasure has destroyed.

#### Interview explanation
Rather than listing restrictions, derive them: "T doesn't exist at runtime, therefore anything needing T at runtime is illegal." Then enumerate with the standard workarounds, which is what distinguishes a strong answer.

#### Syntax
```java
// All illegal:
// T instance = new T();
// T[] array = new T[10];
// List<int> primitives;
// if (obj instanceof List<String>) {}
// static T sharedField;
// class MyException<T> extends Exception {}
```

#### Example
```java
class Factory<T> {
    private final Class<T> type;                 // type token workaround
    Factory(Class<T> type) { this.type = type; }

    T create() throws Exception {
        return type.getDeclaredConstructor().newInstance();
    }
}

Factory<User> f = new Factory<>(User.class);
```

#### Common interview questions
- "Why can't you write `new T()`?" (T is erased; the JVM has no class to instantiate. Pass a `Class<T>` token or `Supplier<T>` instead.)
- "Why can't you create generic arrays?" (Arrays are reified and check element types at runtime; a `T[]` would have no type to check against, allowing heap pollution.)
- "Why can't a generic class extend Throwable?" (`catch` clauses are matched at runtime by exact type; with erasure, `catch (MyException<String> e)` and `catch (MyException<Integer> e)` would be indistinguishable.)

#### Follow-up questions
- "How does `Collections.emptyList()` return the right type without knowing T?" (It returns a shared instance cast to `List<T>` with an unchecked cast — safe only because the list is immutable and empty, so no element can ever be misused.)
- "What does `@SafeVarargs` assert?" (That the method does not perform unsafe operations on its generic varargs array — the compiler can't verify this, so the author takes responsibility.)

#### Edge cases
- `(T[]) new Object[10]` compiles with an unchecked warning and works internally, but returning it as `T[]` to a caller causes `ClassCastException` — this is exactly why `ArrayList` stores `Object[]` internally rather than `E[]`.
- Static *methods* may declare their own type parameters even though static *fields* cannot use the class's.

#### Common mistakes
- Casting `Object[]` to `T[]` and exposing it publicly, producing a delayed `ClassCastException` at the call site.
- Attempting `List<String>[]` instead of `List<List<String>>`.

#### Comparisons

| Restriction | Workaround |
|---|---|
| `new T()` | `Class<T>` token or `Supplier<T>` |
| `new T[n]` | `(T[]) new Object[n]`, kept private |
| `List<int>` | `List<Integer>` |
| `instanceof List<String>` | `instanceof List<?>` |
| `static T field` | Make the method generic instead |
| Generic exceptions | Non-generic exception with typed field |

#### Complexity
Not applicable.

#### Frequently confused with
Restrictions caused by erasure vs. restrictions that are arbitrary language choices — nearly all of them are erasure consequences.

#### Important facts to remember
- Every restriction traces to "T doesn't exist at runtime."
- `Class<T>` type tokens are the standard workaround for instantiation.
- `ArrayList` internally uses `Object[]`, not `E[]`, precisely because of the generic array restriction.

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

#### Definition
An exception is a `Throwable` object representing an abnormal condition that disrupts normal execution flow, triggering stack unwinding until a matching handler is found.

#### Why it exists
To separate error handling from business logic and to make failures impossible to silently ignore, unlike return-code-based error handling.

#### Interview explanation
Emphasize the cost model: `throw` is cheap, but constructing the exception calls `fillInStackTrace()`, which walks the entire stack. This is the reason exceptions must not be used for control flow — a point interviewers look for.

#### Syntax
```java
try {
    riskyOperation();
} catch (SpecificException e) {
    handle(e);
}
```

#### Example
```java
// Anti-pattern: exception as control flow
try {
    Integer.parseInt(input);
    return true;
} catch (NumberFormatException e) {
    return false;   // expensive in a hot loop
}

// Better: no exception on the expected path
return input.matches("-?\\d+");
```

#### Common interview questions
- "What happens when an exception is thrown and never caught?" (Stack unwinds to the thread's uncaught exception handler; the thread terminates and the trace prints.)
- "Are exceptions expensive?" (Construction is — stack capture. Throwing and catching are relatively cheap.)
- "Does an uncaught exception in one thread kill the JVM?" (No — only that thread dies, unless it's the last non-daemon thread.)

#### Follow-up questions
- "How would you make an exception cheap to construct?" (Override `fillInStackTrace()` to return `this`, or use the four-arg `Throwable` constructor with `writableStackTrace=false`. Used for high-frequency control-flow exceptions in frameworks, though it sacrifices diagnosability.)
- "What is stack unwinding?" (The process of popping stack frames while searching for a matching handler, running `finally` blocks and closing try-with-resources at each level.)

#### Edge cases
- An exception thrown inside a `catch` block replaces the original unless explicitly chained.
- An exception thrown in a `finally` block discards any in-flight exception from the `try` — a silent-failure trap.

#### Common mistakes
- Using exceptions for expected, routine outcomes in hot code paths.
- Catching an exception and continuing as if nothing happened, without logging.

#### Comparisons

| | Exceptions | Error return codes |
|---|---|---|
| Can be ignored | No (checked) / harder | Yes, silently |
| Carries context | Full stack trace | Usually just a code |
| Cost | Stack capture on construction | Near zero |
| Separates error path | Yes | No — interleaved with logic |

#### Complexity
Construction is O(depth of call stack) due to stack capture; catching is effectively O(1).

#### Frequently confused with
Throwing cost vs. construction cost — the expensive part is building the object, not the `throw` itself.

#### Important facts to remember
- `fillInStackTrace()` is what makes exceptions expensive.
- An uncaught exception kills only its own thread.
- Never use exceptions for expected control flow.

---

### 5.2 The Throwable Hierarchy

#### Definition
`Throwable` is the root of all throwable types, with two direct subclasses: `Error` (JVM-level failures) and `Exception` (application-level conditions).

#### Why it exists
To let catch blocks match at any granularity through normal inheritance, from a single leaf type up to a broad family.

#### Interview explanation
Draw it live. Interviewers frequently ask you to place specific exceptions in the tree — know that `NullPointerException` sits under `RuntimeException`, `IOException` directly under `Exception`, and `OutOfMemoryError` under `Error`.

#### Syntax
```java
try {
    operation();
} catch (FileNotFoundException e) {   // most specific first
} catch (IOException e) {              // broader
} catch (Exception e) {                // broadest
}
```

#### Example
```java
// Compile error: unreachable catch block
try {
    read();
} catch (IOException e) {
} catch (FileNotFoundException e) {   // ERROR - already caught above
}
```

#### Common interview questions
- "Draw the Throwable hierarchy."
- "Why must specific catch blocks come before general ones?" (Catch matching is top-down by assignability; a general block first makes later specific blocks unreachable — a compile error.)
- "Does `catch (Exception e)` catch `OutOfMemoryError`?" (No — `Error` is a sibling of `Exception`, not a subclass.)

#### Follow-up questions
- "What methods does `Throwable` provide?" (`getMessage()`, `getCause()`, `getStackTrace()`, `getSuppressed()`, `addSuppressed()`, `printStackTrace()`.)
- "Can you create a class extending `Throwable` directly?" (Yes, legally — but it's poor practice; extend `Exception` or `RuntimeException` so it fits established catch conventions.)

#### Edge cases
- Multi-catch types must not be in a subclass relationship — `catch (IOException | FileNotFoundException e)` is a compile error because one is redundant.
- Multi-catch parameters are implicitly final and cannot be reassigned.

#### Common mistakes
- Ordering catch blocks general-to-specific.
- Assuming `catch (Exception e)` is a complete safety net when `Error`s can still escape.

#### Comparisons

| Level | Type | Catch it? |
|---|---|---|
| Root | `Throwable` | Framework boundaries only |
| Branch | `Error` | Almost never |
| Branch | `Exception` | Yes |
| Sub-branch | `RuntimeException` | Selectively |

#### Complexity
Catch matching is O(number of catch clauses), evaluated in source order.

#### Frequently confused with
`Throwable` (true root) vs. `Exception` (only one branch) — a common misstatement.

#### Important facts to remember
- `Error` and `Exception` are siblings, both under `Throwable`.
- Catch blocks must go specific → general.
- Multi-catch types cannot be related by inheritance.

---

### 5.3 Checked vs Unchecked Exceptions

#### Definition
Checked exceptions extend `Exception` but not `RuntimeException`, and the compiler enforces catch-or-declare. Unchecked exceptions extend `RuntimeException` or `Error` and carry no such requirement.

#### Why it exists
To distinguish anticipated external failures the caller should plan for from programming defects the caller should fix rather than handle.

#### Interview explanation
This is a strong opportunity to show judgment rather than recitation. State the rule, then note the design debate honestly: Spring wraps `SQLException` into unchecked `DataAccessException`, and several JVM languages omit checked exceptions entirely — so "checked is always better" is not a defensible position.

#### Syntax
```java
void checkedExample() throws IOException { ... }   // caller must handle
void uncheckedExample() { throw new IllegalStateException(); }   // no declaration
```

#### Example
```java
// Checked exceptions break lambdas - a common real friction point
List<String> paths = List.of("a.txt", "b.txt");
// paths.stream().map(Files::readString)   // won't compile: IOException is checked
//      .toList();

// Workaround: wrap into unchecked
paths.stream().map(p -> {
    try { return Files.readString(Path.of(p)); }
    catch (IOException e) { throw new UncheckedIOException(e); }
}).toList();
```

#### Common interview questions
- "What's the difference between checked and unchecked exceptions?"
- "Give examples of each."
- "Why do checked exceptions cause problems with lambdas?" (Standard functional interfaces like `Function` declare no checked exceptions, so a lambda body cannot throw one without wrapping.)

#### Follow-up questions
- "Should new APIs use checked or unchecked exceptions?" (Contested. The modern trend favors unchecked for most application code — Spring is the canonical example — reserving checked for genuinely recoverable conditions the caller can act on. Be ready to argue either side.)
- "Is `NullPointerException` checked or unchecked?" (Unchecked — it extends `RuntimeException`, since it almost always indicates a bug.)

#### Edge cases
- `Error` subclasses are unchecked, even though they aren't `RuntimeException`s — the unchecked category is "RuntimeException OR Error."
- A method may declare `throws` for unchecked exceptions purely as documentation; it's legal but unenforced.

#### Common mistakes
- Declaring `throws Exception`, which erases all useful contract information.
- Catching a checked exception and swallowing it just to satisfy the compiler.

#### Comparisons

| | Checked | Unchecked |
|---|---|---|
| Compiler enforced | Yes | No |
| Base type | `Exception` (not Runtime) | `RuntimeException` / `Error` |
| Signals | Recoverable external condition | Programming bug |
| Lambda friendly | No | Yes |
| Examples | `IOException`, `SQLException` | `NPE`, `IllegalArgumentException` |

#### Complexity
Not applicable.

#### Frequently confused with
"Unchecked" meaning `RuntimeException` only — it also includes all `Error` types.

#### Important facts to remember
- Unchecked = `RuntimeException` subclasses *plus* `Error` subclasses.
- Checked exceptions don't compose with standard functional interfaces.
- The checked-vs-unchecked debate is genuinely unsettled; frameworks lean unchecked.

---

### 5.4 try-catch-finally

#### Definition
`try` delimits guarded code, `catch` handles matching throwables, and `finally` executes unconditionally on exit from the try block.

#### Why it exists
To provide structured, guaranteed cleanup and localized error handling around code that may fail partway through.

#### Interview explanation
The `finally`-with-`return` question appears constantly. Be ready to state that a `return` in `finally` silently discards both the try's return value and any in-flight exception.

#### Syntax
```java
try {
    risky();
} catch (IOException | SQLException e) {   // multi-catch, Java 7+
    log.error("failed", e);
} finally {
    cleanup();
}
```

#### Example
```java
static int puzzle() {
    int x = 1;
    try {
        return x;        // return value (1) is computed and held
    } finally {
        x = 99;          // does NOT change the held return value
    }
}
// returns 1, not 99 - the value was already evaluated
```

#### Common interview questions
- "What does this return?" (the puzzle above — answer: 1, because the return value is evaluated before `finally` runs.)
- "When does `finally` not execute?" (`System.exit()`, JVM crash, infinite loop or thread kill inside try, or daemon thread termination at JVM shutdown.)
- "What is multi-catch and what are its restrictions?" (One catch for several unrelated types; the types must not be in a subclass relationship, and the parameter is implicitly final.)

#### Follow-up questions
- "What happens if both `try` and `finally` throw?" (The `finally` exception wins and propagates; the try's exception is discarded entirely — unlike try-with-resources, which preserves it as suppressed.)
- "Can you have try without catch?" (Yes — `try`/`finally` alone is valid, as is try-with-resources with neither.)

#### Edge cases
- Returning a *mutable object* from `try` and mutating it in `finally` DOES affect the caller — only the reference is fixed at return time, not the object's contents.
- Nested try blocks each run their own `finally` during unwinding, innermost first.

#### Common mistakes
- Putting `return` or `throw` inside `finally`, silently swallowing exceptions.
- Assuming `finally` can modify a primitive return value already evaluated.

#### Comparisons

| Construct | Cleanup guaranteed | Preserves original exception |
|---|---|---|
| `try`/`finally` with manual close | Yes | No — close exception masks it |
| try-with-resources | Yes | Yes — as suppressed |

#### Complexity
Not applicable.

#### Frequently confused with
`finally` (always runs) vs. `finalize()` (deprecated GC hook, unrelated despite the similar name).

#### Important facts to remember
- Return values are evaluated *before* `finally` runs.
- A `return` in `finally` discards exceptions silently.
- `finally` is skipped only on `System.exit()`, JVM crash, or thread kill.

---

### 5.5 throw and throws

#### Definition
`throw` raises an exception instance at a specific point; `throws` declares in a signature which checked exceptions a method may propagate.

#### Why it exists
To let a method signal failure it cannot handle, and to make that possibility part of the method's compile-time contract.

#### Interview explanation
The override rule is the high-value detail: an overriding method may narrow or drop checked exceptions but never widen them, because callers holding a parent-typed reference must remain safe.

#### Syntax
```java
void process(String input) throws ValidationException, IOException {
    if (input == null) throw new IllegalArgumentException("input required");
}
```

#### Example
```java
class Base { void run() throws IOException {} }

class Derived extends Base {
    @Override void run() throws FileNotFoundException {}   // OK - narrower
}

class Bad extends Base {
    // @Override void run() throws Exception {}            // ILLEGAL - broader
}
```

#### Common interview questions
- "Difference between `throw` and `throws`?"
- "Can an overriding method throw a broader checked exception?" (No — only the same, narrower, or none. Unchecked exceptions are unrestricted.)
- "Can you throw multiple exceptions from one `throw` statement?" (No — one instance per statement; `throws` lists many, `throw` raises one.)

#### Follow-up questions
- "Can a constructor declare `throws`?" (Yes, and subclass constructors must handle or declare the parent constructor's checked exceptions.)
- "Does the override rule apply to unchecked exceptions?" (No — an override may throw any unchecked exception regardless of the parent's declaration, since the compiler doesn't track them.)

#### Edge cases
- Rethrowing with precise type analysis (Java 7+): catching `Exception` and rethrowing lets the compiler infer only the exceptions actually throwable in the try block, so a narrower `throws` clause compiles.
- A method declaring a checked exception it never actually throws is legal but forces pointless handling on callers.

#### Common mistakes
- Declaring `throws Exception` on every method as a shortcut.
- Attempting to widen the exception contract in an override.

#### Comparisons

| | `throw` | `throws` |
|---|---|---|
| Location | Method body | Method signature |
| Operand | One exception instance | List of exception types |
| Effect | Raises immediately | Declares possibility |

#### Complexity
Not applicable.

#### Frequently confused with
`throw` vs `throws` — the single most common terminology slip in Java interviews.

#### Important facts to remember
- Overrides may narrow but never widen checked exceptions.
- Unchecked exceptions are exempt from the override rule.
- Precise rethrow (Java 7+) lets you catch broadly and declare narrowly.

---

### 5.6 try-with-resources

#### Definition
A try form that automatically closes any `AutoCloseable` resource declared in its header, in reverse declaration order, before catch or finally executes.

#### Why it exists
To eliminate resource leaks and the exception-masking problem inherent in manual `finally`-based closing.

#### Interview explanation
The suppressed-exception mechanism is the detail that distinguishes a strong answer: when both the body and `close()` throw, the body's exception propagates and the close exception is attached via `addSuppressed()`, rather than being lost.

#### Syntax
```java
try (Connection conn = ds.getConnection();
     PreparedStatement ps = conn.prepareStatement(sql)) {
    return ps.executeQuery();
}
```

#### Example
```java
class Resource implements AutoCloseable {
    private final String name;
    Resource(String name) { this.name = name; System.out.println("open " + name); }
    @Override public void close() { System.out.println("close " + name); }
}

try (Resource a = new Resource("A"); Resource b = new Resource("B")) { }
// Output: open A, open B, close B, close A   <- reverse order
```

#### Common interview questions
- "How does try-with-resources differ from try-finally?"
- "In what order are multiple resources closed?" (Reverse of declaration.)
- "What is a suppressed exception?" (An exception from `close()` that occurred while another exception was already propagating; attached to the primary exception and retrievable via `getSuppressed()`.)

#### Follow-up questions
- "What's the difference between `AutoCloseable` and `Closeable`?" (`Closeable` predates it, extends `AutoCloseable`, and narrows `close()` to throw only `IOException`. `AutoCloseable.close()` may throw any `Exception`.)
- "Can you use a variable declared outside the try as a resource?" (Yes since Java 9, provided it is final or effectively final.)

#### Edge cases
- Resource variables are implicitly final — reassignment inside the block is a compile error.
- If the resource *constructor* throws, previously-opened resources in the same header are still closed correctly.

#### Common mistakes
- Manually calling `close()` inside a try-with-resources block, causing a double close.
- Assuming try-with-resources handles all cleanup — non-resource cleanup still needs `finally`.

#### Comparisons

| | try-finally | try-with-resources |
|---|---|---|
| Boilerplate | High (null checks, nested try) | Minimal |
| Close exception | Masks the original | Suppressed, original preserved |
| Close order | Manual, error-prone | Automatic, reverse |
| Requires | Nothing | `AutoCloseable` |

#### Complexity
Not applicable.

#### Frequently confused with
`AutoCloseable` vs `Closeable` — the latter is the older, `IOException`-specific subtype.

#### Important facts to remember
- Resources close in reverse declaration order, before catch/finally.
- The body's exception wins; `close()`'s becomes suppressed.
- Java 9+ permits effectively-final external variables in the resource list.

---

### 5.7 Custom Exceptions

#### Definition
User-defined classes extending `Exception` or `RuntimeException` to represent domain-specific failure conditions.

#### Why it exists
To give failures meaningful names and structured context, so callers can react programmatically rather than parsing message strings.

#### Interview explanation
Show that you'd provide all four standard constructors — especially the cause-accepting ones. Omitting them is the most common flaw interviewers look for in a custom exception.

#### Syntax
```java
public class OrderNotFoundException extends RuntimeException {
    private final String orderId;

    public OrderNotFoundException(String orderId) {
        super("Order not found: " + orderId);
        this.orderId = orderId;
    }

    public OrderNotFoundException(String orderId, Throwable cause) {
        super("Order not found: " + orderId, cause);
        this.orderId = orderId;
    }

    public String getOrderId() { return orderId; }
}
```

#### Example
```java
// Structured context beats string parsing
catch (OrderNotFoundException e) {
    metrics.increment("order.missing", "id", e.getOrderId());
}
```

#### Common interview questions
- "How do you create a custom exception, and how do you choose the base class?" (Extend `RuntimeException` for unrecoverable/business-rule violations, `Exception` when you want to force caller handling.)
- "What constructors should a custom exception provide?" (No-arg, message, message+cause, cause — mirroring `Throwable`.)
- "Should custom exceptions be checked or unchecked?" (Usually unchecked in modern application code; justify based on whether the caller can meaningfully recover.)

#### Follow-up questions
- "How would you make a custom exception cheap for high-frequency use?" (Use the `Throwable(String, Throwable, boolean, boolean)` constructor with `writableStackTrace=false`, or override `fillInStackTrace()` — at the cost of losing diagnostics.)
- "Should exceptions be serializable?" (`Throwable` implements `Serializable`, so custom fields should be serializable too, or marked transient — relevant for RMI and distributed systems.)

#### Edge cases
- Adding non-serializable fields to an exception can cause `NotSerializableException` if the exception crosses a serialization boundary.
- An exception class can be generic only if it doesn't extend `Throwable` with type parameters — generic throwables are forbidden by erasure.

#### Common mistakes
- Omitting the cause-accepting constructor, making proper chaining impossible.
- Creating one exception class per error message, producing dozens of near-identical types.

#### Comparisons

| Base class | When to use |
|---|---|
| `RuntimeException` | Business-rule violations, programming errors, most modern APIs |
| `Exception` | Caller can genuinely recover and should be forced to plan |
| `Error` | Never for application code |

#### Complexity
Not applicable.

#### Frequently confused with
Choosing `Exception` vs `RuntimeException` as base — drives whether callers are forced to handle it.

#### Important facts to remember
- Always provide a cause-accepting constructor.
- Carry structured fields, not just formatted message strings.
- Generic exception classes are illegal due to erasure.

---

### 5.8 Exception Chaining

#### Definition
Wrapping a lower-level exception inside a higher-level one via the `cause` mechanism, preserving the full causal chain.

#### Why it exists
To translate exceptions across abstraction boundaries without discarding the original diagnostic information.

#### Interview explanation
Name the anti-pattern explicitly: `throw new X(e.getMessage())` loses the cause and the original stack trace. Passing `e` itself is the fix, and interviewers watch for whether you notice.

#### Syntax
```java
try {
    lowLevelCall();
} catch (SQLException e) {
    throw new DataAccessException("Query failed for user " + id, e);
}
```

#### Example
```java
// Wrong - stack trace of the root cause is destroyed
catch (SQLException e) {
    throw new ServiceException("DB error: " + e.getMessage());
}

// Right - full chain preserved
catch (SQLException e) {
    throw new ServiceException("DB error loading user " + id, e);
}
```

#### Common interview questions
- "What is exception chaining and why does it matter?"
- "How do you retrieve the original exception?" (`getCause()`, recursively for multi-level chains.)
- "What's the difference between a cause and a suppressed exception?" (A cause is *why* this exception happened; a suppressed exception occurred *while* this one was propagating, typically from `close()`.)

#### Follow-up questions
- "How would you find the root cause of a deeply nested chain?" (Loop `getCause()` until it returns null; libraries like Apache Commons provide `ExceptionUtils.getRootCause()`.)
- "Can you set the cause after construction?" (Yes — `initCause()`, but only once and only if no cause was set via a constructor.)

#### Edge cases
- `initCause()` throws `IllegalStateException` if a cause was already set, including via the constructor.
- Self-referential causes (`e.initCause(e)`) throw `IllegalArgumentException`.

#### Common mistakes
- Concatenating `e.getMessage()` instead of passing `e` as the cause.
- Wrapping at every layer, producing five-deep chains that obscure rather than clarify.

#### Comparisons

| | Cause | Suppressed |
|---|---|---|
| Meaning | Why this exception occurred | Occurred during handling/closing |
| Set by | Constructor or `initCause()` | `addSuppressed()`, automatic in try-with-resources |
| Retrieved by | `getCause()` | `getSuppressed()` |
| Count | One | Zero or more |

#### Complexity
Not applicable.

#### Frequently confused with
Cause vs. suppressed exception — distinct mechanisms with different semantics.

#### Important facts to remember
- Always pass the original exception as the cause, never just its message.
- `initCause()` may be called only once.
- "Caused by:" sections in a trace represent the cause chain.

---

### 5.9 Stack Traces

#### Definition
An ordered snapshot of the call stack at the moment a `Throwable` was constructed, captured by `fillInStackTrace()`.

#### Why it exists
To identify precisely where a failure occurred and the full path of calls that led there.

#### Interview explanation
Mention helpful NullPointerExceptions (Java 14+, on by default since 15) — it signals current knowledge, since the JVM now names the exact null expression rather than only a line number.

#### Syntax
```java
StackTraceElement[] frames = e.getStackTrace();
String location = frames[0].getClassName() + "." + frames[0].getMethodName();
```

#### Example
```
java.lang.NullPointerException: Cannot invoke "User.getName()" because "user" is null
    at com.example.OrderService.process(OrderService.java:42)
    at com.example.OrderController.submit(OrderController.java:18)
Caused by: java.sql.SQLException: connection reset
    at ...
```

#### Common interview questions
- "How do you read a stack trace?" (Top frame is where it surfaced; scan down to the first frame in your own package — that's usually where to start.)
- "Why is `printStackTrace()` bad in production?" (Writes to `System.err`, bypassing the logging framework, log levels, structured fields, and log aggregation.)
- "What are helpful NullPointerExceptions?" (JVM feature naming the exact expression that was null; default from Java 15.)

#### Follow-up questions
- "Why might a stack trace be empty or truncated?" (The JIT can omit traces for repeatedly-thrown hot exceptions — the `OmitStackTraceInFastThrow` optimization. Disable with `-XX:-OmitStackTraceInFastThrow` when debugging.)
- "How do you capture a stack trace without throwing?" (`Thread.currentThread().getStackTrace()`, or `new Throwable().getStackTrace()`.)

#### Edge cases
- Framework proxies (Spring AOP, Hibernate) inject many synthetic frames, pushing the real cause deep into the trace.
- Lambdas appear as synthetic method names like `lambda$process$0`, which can be confusing on first encounter.

#### Common mistakes
- Calling `e.printStackTrace()` rather than `log.error("context", e)`.
- Assuming the topmost frame is the bug when it's usually inside library code.

#### Comparisons

| | `printStackTrace()` | `log.error(msg, e)` |
|---|---|---|
| Destination | `System.err` | Configured appenders |
| Log level control | None | Yes |
| Correlation IDs / MDC | No | Yes |
| Production suitable | No | Yes |

#### Complexity
Capture is O(stack depth).

#### Frequently confused with
The topmost frame vs. the root cause — often in entirely different layers.

#### Important facts to remember
- Traces are captured at *construction*, not at throw.
- The JIT may omit traces for hot, repeatedly-thrown exceptions.
- Always log with the exception object, never `printStackTrace()`.

---

### 5.10 Errors vs Exceptions

#### Definition
`Error` denotes serious JVM-level conditions an application should not attempt to handle; `Exception` denotes application-level conditions it reasonably can.

#### Why it exists
To encode recoverability into the type hierarchy, so `catch (Exception e)` naturally excludes unrecoverable failures.

#### Interview explanation
State the rule, then acknowledge the legitimate exception: framework and thread-pool boundaries sometimes catch `Throwable` purely to log before dying. That nuance separates a memorized answer from an experienced one.

#### Syntax
```java
catch (Exception e) { }    // application code - correct
catch (Throwable t) { }    // framework boundary only, must rethrow or exit
```

#### Example
```java
// Legitimate framework-boundary use
public void run() {
    try {
        task.execute();
    } catch (Throwable t) {
        log.error("Worker died", t);
        throw t;              // rethrow - do not continue in a damaged JVM
    }
}
```

#### Common interview questions
- "Difference between Error and Exception?"
- "Should you ever catch `OutOfMemoryError`?" (Essentially never — the handler itself may fail to allocate, and JVM state is already compromised.)
- "Is `StackOverflowError` recoverable?" (Technically the stack unwinds, so a catch can execute — but it signals a bug, usually unbounded recursion, so catching hides the real problem.)

#### Follow-up questions
- "Why is `OutOfMemoryError` an `Error` rather than an `Exception`?" (Because no application-level recovery is generally possible; the correct response is to fail fast and let a supervisor restart the process.)
- "What's `Thread.setUncaughtExceptionHandler` for?" (Handling throwables that escape a thread's run method — the standard place to log fatal failures before a thread dies.)

#### Edge cases
- `ExceptionInInitializerError` wraps an exception thrown during static initialization — an `Error` caused by an `Exception`.
- `NoClassDefFoundError` (an `Error`) differs from `ClassNotFoundException` (a checked `Exception`): the former means the class failed to load after being found at compile time, typically a classpath mismatch at runtime.

#### Common mistakes
- Using `catch (Throwable t)` as a general defensive net in application code.
- Confusing `NoClassDefFoundError` with `ClassNotFoundException` when diagnosing classpath issues.

#### Comparisons

| | `Error` | `Exception` |
|---|---|---|
| Checked | No | Checked unless `RuntimeException` |
| Recoverable | Generally no | Generally yes |
| Catch in app code | No | Yes |
| Examples | `OOME`, `StackOverflowError`, `NoClassDefFoundError` | `IOException`, `NPE`, `ClassNotFoundException` |

#### Complexity
Not applicable.

#### Frequently confused with
`NoClassDefFoundError` vs `ClassNotFoundException` — a very common interview trap.

#### Important facts to remember
- `catch (Exception e)` does not catch `Error`s.
- Catching `Throwable` is acceptable only at framework boundaries, and must rethrow.
- `NoClassDefFoundError` is a runtime linkage failure; `ClassNotFoundException` is a reflection-time lookup failure.

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

#### Definition
A declarative programming style, added in Java 8, where behavior is passed as values via functional interfaces and data transformations are expressed as composed operations.

#### Why it exists
To reduce boilerplate in data processing, improve readability of multi-step transformations, and make parallelization possible without manual thread management.

#### Interview explanation
Be precise that Java is not a functional language — it's OO with functional features. Immutability and purity are conventions here, not guarantees, which distinguishes Java from Haskell or Clojure.

#### Syntax
```java
list.stream().filter(x -> x > 5).map(x -> x * 2).toList();
```

#### Example
```java
// Imperative
Map<String, Integer> totals = new HashMap<>();
for (Order o : orders) totals.merge(o.getCustomer(), o.getAmount(), Integer::sum);

// Declarative
Map<String, Integer> totals = orders.stream()
    .collect(Collectors.groupingBy(Order::getCustomer,
             Collectors.summingInt(Order::getAmount)));
```

#### Common interview questions
- "What did Java 8 add for functional programming?" (Lambdas, method references, streams, `Optional`, default methods, `java.util.function`.)
- "Is Java a functional language?" (No — it's object-oriented with functional features; lambdas compile to functional interface instances.)
- "What is a pure function?" (Same input always yields same output, with no side effects. Java doesn't enforce this.)

#### Follow-up questions
- "Why were default methods necessary for streams?" (Adding `stream()` to `Collection` would have broken every existing implementation. Default methods allowed extending the interface without breaking binary compatibility.)
- "Are streams faster than loops?" (Generally no for simple operations — a `for` loop over an array typically wins. Streams are about clarity and parallelizability.)

#### Edge cases
- Lambdas capture variables by value, so mutation-based accumulation patterns from imperative code don't translate directly.
- Checked exceptions don't compose with standard functional interfaces, forcing wrapping.

#### Common mistakes
- Claiming streams are inherently faster than loops.
- Converting simple, readable loops into stream chains that are harder to read.

#### Comparisons

| | Imperative | Declarative (functional) |
|---|---|---|
| Describes | How (steps) | What (intent) |
| State | Mutable accumulators | Transformation pipeline |
| Parallelization | Manual | `.parallel()` |
| Debugging | Step-through friendly | Harder |

#### Complexity
No inherent change — a stream pipeline has the same asymptotic complexity as the equivalent loop, with a higher constant factor.

#### Frequently confused with
"Functional style" vs. "functional language" — Java supports the former, is not the latter.

#### Important facts to remember
- Default methods existed to let `Collection` gain `stream()` without breaking implementations.
- Purity and immutability are conventions in Java, not enforced.
- Streams optimize for readability, not raw speed.

---

### 6.2 Lambda Expressions

#### Definition
An anonymous function expressed as parameters, an arrow token, and a body, which the compiler converts into an instance of a functional interface.

#### Why it exists
To replace verbose anonymous inner classes when passing behavior as an argument.

#### Interview explanation
The high-value detail is the compilation mechanism: lambdas use `invokedynamic` and `LambdaMetafactory`, not anonymous class generation. Combine this with the `this` semantics difference and you've covered what most interviewers are probing.

#### Syntax
```java
() -> expr
x -> expr
(x, y) -> { statements; return value; }
```

#### Example
```java
public class Demo {
    private String name = "outer";

    void test() {
        Runnable lambda = () -> System.out.println(this.name);   // "outer"

        Runnable anon = new Runnable() {
            private String name = "inner";
            public void run() { System.out.println(this.name); } // "inner"
        };
    }
}
```

#### Common interview questions
- "What is effectively final, and why do lambdas require it?" (A local variable never reassigned after initialization. Required because lambdas capture by value — allowing mutation would create confusing or unsafe semantics, especially across threads.)
- "Are lambdas just anonymous inner classes?" (No — different compilation via `invokedynamic`, no generated class file per site, possible instance reuse.)
- "What does `this` refer to inside a lambda?" (The enclosing instance, unlike an anonymous class where it refers to the anonymous instance.)

#### Follow-up questions
- "Can a lambda be recursive?" (Not directly — it has no name to call. Assign it to a field, or use an array/holder trick, though a method reference is usually cleaner.)
- "Why can't lambdas modify captured local variables?" (Locals live on the stack and may be gone when the lambda runs; capture-by-value avoids dangling references and prevents data races across threads.)

#### Edge cases
- A lambda *can* mutate captured object *state* (fields of a captured reference) — only reassignment of the local variable itself is forbidden.
- Stateless lambdas may be cached and reused by the JVM, so identity comparison between two "equal" lambdas is unspecified.

#### Common mistakes
- Using a single-element array to work around effectively-final restrictions, introducing a side effect that breaks under parallelism.
- Assuming `this` inside a lambda refers to the lambda.

#### Comparisons

| | Lambda | Anonymous inner class |
|---|---|---|
| Compilation | `invokedynamic` | Separate `.class` file |
| `this` refers to | Enclosing instance | The anonymous instance |
| Can have state | No | Yes (fields) |
| Instance creation | May be reused | New instance each time |

#### Complexity
Not applicable.

#### Frequently confused with
Lambda vs. anonymous inner class — behaviorally different in `this` binding and compilation.

#### Important facts to remember
- Lambdas compile via `invokedynamic`, not to anonymous classes.
- Captured locals must be final or effectively final.
- `this` in a lambda is the enclosing instance.

---

### 6.3 Functional Interfaces

#### Definition
An interface declaring exactly one abstract method, serving as the target type for a lambda or method reference.

#### Why it exists
To give lambdas a type within Java's existing type system, avoiding the introduction of a separate function type.

#### Interview explanation
Stress that default and static methods don't count toward the single-abstract-method rule — `Comparator` is the canonical proof, being functional despite a large API surface.

#### Syntax
```java
@FunctionalInterface
interface Transformer<T, R> {
    R transform(T input);
}
```

#### Example
```java
@FunctionalInterface
interface Calculator {
    int calc(int a, int b);
    default Calculator negated() { return (a, b) -> -calc(a, b); }
    static Calculator adder() { return Integer::sum; }
}
Calculator c = (a, b) -> a * b;   // still functional: one abstract method
```

#### Common interview questions
- "What makes an interface functional?" (Exactly one abstract method; default/static methods don't count.)
- "Is `@FunctionalInterface` required?" (No — it's a compile-time check that prevents someone from later adding a second abstract method.)
- "Name pre-Java-8 interfaces that are functional." (`Runnable`, `Callable`, `Comparator`, `ActionListener`.)

#### Follow-up questions
- "Can a functional interface declare `equals` or `toString`?" (Yes — abstract methods matching public `Object` methods don't count toward the SAM total, since every implementation inherits them from `Object`.)
- "Can a functional interface extend another interface?" (Yes, provided the combined result still has exactly one abstract method.)

#### Edge cases
- Redeclaring `Object` methods (`equals`, `hashCode`, `toString`) as abstract doesn't disqualify an interface from being functional.
- A generic functional interface can be instantiated with different type arguments by different lambdas.

#### Common mistakes
- Writing a custom interface duplicating `Function<T,R>` or `Predicate<T>`.
- Assuming `@FunctionalInterface` is mandatory.

#### Comparisons

| | Functional interface | Regular interface |
|---|---|---|
| Abstract methods | Exactly one | Any number |
| Lambda-compatible | Yes | Only if SAM |
| Default/static methods | Allowed, unlimited | Allowed |

#### Complexity
Not applicable.

#### Frequently confused with
Whether default methods break functional status — they don't.

#### Important facts to remember
- Only abstract methods count; default and static don't.
- Public `Object` method redeclarations don't count either.
- `@FunctionalInterface` is optional but protects future maintainers.

---

### 6.4 Built-in Functional Interfaces

#### Definition
The standard interfaces in `java.util.function` covering common function shapes, plus primitive specializations.

#### Why it exists
To provide one shared vocabulary so libraries interoperate rather than each defining its own equivalent types.

#### Interview explanation
Know the four core shapes cold and be able to state the primitive-specialization rationale — boxing avoidance is the answer interviewers want for "why does `IntPredicate` exist?"

#### Syntax
```java
Function<String, Integer> length = String::length;
Predicate<String> empty = String::isEmpty;
Consumer<String> print = System.out::println;
Supplier<List<String>> factory = ArrayList::new;
```

#### Example
```java
Function<Integer, Integer> add2 = x -> x + 2;
Function<Integer, Integer> mul3 = x -> x * 3;

add2.andThen(mul3).apply(5);   // (5+2)*3 = 21
add2.compose(mul3).apply(5);   // (5*3)+2 = 17
```

#### Common interview questions
- "Name the four core functional interfaces and their methods." (`Function.apply`, `Predicate.test`, `Consumer.accept`, `Supplier.get`.)
- "Difference between `andThen` and `compose`?" (`f.andThen(g)` applies f first; `f.compose(g)` applies g first.)
- "Why do `IntFunction`, `IntPredicate`, etc. exist?" (To avoid autoboxing overhead in numeric-heavy code.)

#### Follow-up questions
- "What's `UnaryOperator` versus `Function`?" (`UnaryOperator<T>` extends `Function<T,T>` — same input and output type; used by `List.replaceAll`.)
- "Which interface does `reduce` use?" (`BinaryOperator<T>`, which extends `BiFunction<T,T,T>`.)

#### Edge cases
- `Predicate.negate()`, `.and()`, `.or()` enable composition without writing nested lambdas.
- `Function.identity()` returns `t -> t`, commonly used in `Collectors.toMap`.

#### Common mistakes
- Inverting `andThen` and `compose`.
- Using boxed `Function<Integer,Integer>` in numeric hot paths instead of `IntUnaryOperator`.

#### Comparisons

| Interface | Input | Output |
|---|---|---|
| `Function<T,R>` | T | R |
| `Predicate<T>` | T | boolean |
| `Consumer<T>` | T | void |
| `Supplier<T>` | — | T |
| `UnaryOperator<T>` | T | T |
| `BinaryOperator<T>` | T, T | T |

#### Complexity
Boxed variants add allocation per call; primitive specializations avoid it.

#### Frequently confused with
`andThen` vs `compose` ordering.

#### Important facts to remember
- `f.andThen(g)` = f first; `f.compose(g)` = g first.
- Primitive specializations exist purely to avoid boxing.
- `Function.identity()` is idiomatic in `toMap`.

---

### 6.5 Method References

#### Definition
Shorthand syntax (`::`) for a lambda whose body consists solely of invoking an existing method or constructor.

#### Why it exists
To eliminate redundant parameter naming when a lambda merely delegates to a method that already exists.

#### Interview explanation
The distinction interviewers probe is bound versus unbound receivers — `System.out::println` fixes the receiver, while `String::toUpperCase` makes the stream element the receiver. Being able to state that difference cleanly signals real fluency.

#### Syntax
```java
ClassName::staticMethod
instance::instanceMethod
ClassName::instanceMethod
ClassName::new
```

#### Example
```java
names.stream().map(String::toUpperCase);     // unbound: s -> s.toUpperCase()
names.forEach(System.out::println);           // bound: s -> System.out.println(s)
Supplier<List<String>> f = ArrayList::new;    // constructor
BiFunction<String,String,Boolean> eq = String::equalsIgnoreCase;  // unbound, 2 args
```

#### Common interview questions
- "What are the four kinds of method reference?"
- "Explain `String::toUpperCase` versus `System.out::println`." (Unbound versus bound receiver — first parameter becomes the receiver in the former.)
- "How does `String::compareTo` work as a `Comparator`?" (Unbound receiver: the first argument becomes the receiver, the second becomes the parameter.)

#### Follow-up questions
- "Can method references be ambiguous?" (Yes — with overloaded methods the compiler may fail to choose; an explicit lambda resolves it.)
- "Can you use a method reference for a method with different parameter order?" (No — the parameters must map positionally; use a lambda instead.)

#### Edge cases
- `Type::new` on an array is `int[]::new`, used by `toArray(String[]::new)`.
- A method reference to an instance method captures the receiver *at reference-creation time*, not at invocation.

#### Common mistakes
- Assuming a method reference can reorder or transform arguments.
- Using one where an added null check or conversion is needed, then having to expand it back.

#### Comparisons

| Form | Example | Receiver |
|---|---|---|
| Static | `Integer::parseInt` | None |
| Bound instance | `System.out::println` | Fixed object |
| Unbound instance | `String::length` | First parameter |
| Constructor | `ArrayList::new` | N/A |

#### Complexity
Not applicable.

#### Frequently confused with
Bound vs. unbound instance-method references — visually identical, semantically different.

#### Important facts to remember
- Unbound references turn the first argument into the receiver.
- Bound references capture the receiver at creation time.
- `String[]::new` is the standard array-constructor reference for `toArray`.

---

### 6.6 What Is a Stream?

#### Definition
A sequence of elements supporting sequential and parallel aggregate operations, characterized by no storage, laziness, and single-use consumption.

#### Why it exists
To express multi-stage data processing declaratively while enabling laziness, short-circuiting, and parallelization.

#### Interview explanation
State the three defining properties immediately, then demonstrate element-at-a-time flow with an infinite-stream example. That example proves you understand laziness rather than merely reciting the word.

#### Syntax
```java
collection.stream()
IntStream.range(0, 10)
Stream.of("a", "b")
Stream.iterate(1, n -> n * 2)
Arrays.stream(array)
```

#### Example
```java
Stream<Integer> s = list.stream();
s.forEach(System.out::println);
s.count();   // IllegalStateException: stream has already been operated upon or closed
```

#### Common interview questions
- "What are the key characteristics of a stream?" (No storage, lazy, single-use, may be sequential or parallel.)
- "Can you reuse a stream?" (No — `IllegalStateException`. Recreate from the source, or use a `Supplier<Stream<T>>`.)
- "How does a stream process elements — stage by stage or element by element?" (Element by element through the whole pipeline, except for stateful operations like `sorted` and `distinct`.)

#### Follow-up questions
- "How does `findFirst()` on an infinite stream terminate?" (Element-at-a-time processing plus short-circuiting — only enough elements are pulled to satisfy the terminal operation.)
- "What's a `Spliterator`?" (The traversal-and-splitting abstraction underneath streams; it defines how a source is partitioned for parallel processing.)

#### Edge cases
- `IntStream`/`LongStream`/`DoubleStream` are separate primitive streams with extra methods (`sum()`, `average()`) and no boxing.
- Streams over I/O sources (`Files.lines`) are `AutoCloseable` and must be closed in try-with-resources.

#### Common mistakes
- Reusing a consumed stream.
- Forgetting to close `Files.lines()` streams, leaking file handles.

#### Comparisons

| | Collection | Stream |
|---|---|---|
| Stores elements | Yes | No |
| Reusable | Yes | No, single-use |
| Evaluation | Eager | Lazy |
| Iteration | External | Internal |

#### Complexity
Same asymptotics as the equivalent loop; higher constant factor from pipeline overhead.

#### Frequently confused with
Streams (`java.util.stream`) vs. I/O streams (`InputStream`) — entirely unrelated concepts sharing a name.

#### Important facts to remember
- Streams are lazy, single-use, and don't store data.
- Elements flow one at a time, enabling short-circuiting on infinite sources.
- `Files.lines()` must be closed.

---

### 6.7 Intermediate Operations

#### Definition
Operations returning a new stream, evaluated lazily and executed only when a terminal operation runs.

#### Why it exists
To compose transformations declaratively while allowing the pipeline to optimize traversal and short-circuit.

#### Interview explanation
`map` versus `flatMap` is asked in essentially every stream interview. Have a concrete nested-collection example ready, and mention that `flatMap` is also the tool for flattening `Optional` streams.

#### Syntax
```java
.filter(Predicate)  .map(Function)  .flatMap(Function)
.distinct()  .sorted()  .limit(n)  .skip(n)  .peek(Consumer)
```

#### Example
```java
List<Order> orders = ...;
// Each order has List<Item> - flatten to all items across all orders
List<Item> allItems = orders.stream()
    .flatMap(o -> o.getItems().stream())
    .toList();
```

#### Common interview questions
- "Difference between `map` and `flatMap`?" (`map` is one-to-one; `flatMap` is one-to-many and flattens nested streams into one.)
- "Which intermediate operations are stateful?" (`sorted`, `distinct`, and to a degree `limit`/`skip` — they need knowledge beyond the current element.)
- "What happens if you call `sorted()` on an infinite stream?" (It hangs — sorting requires consuming every element first.)

#### Follow-up questions
- "Is `peek` reliable for debugging?" (No — the JDK permits skipping it when results aren't needed. Since Java 9, `stream.peek(...).count()` may not invoke `peek` at all.)
- "Does the order of `filter` and `map` matter?" (For correctness sometimes; for performance usually yes — filtering first reduces the number of elements mapped.)

#### Edge cases
- `distinct()` relies on `equals`/`hashCode`; objects without proper overrides won't deduplicate.
- `sorted()` on a parallel stream must buffer everything, often eliminating the parallelism benefit.

#### Common mistakes
- Using `map` where `flatMap` is required, producing `Stream<List<T>>`.
- Relying on `peek` for logging in production pipelines.

#### Comparisons

| | `map` | `flatMap` |
|---|---|---|
| Cardinality | 1 → 1 | 1 → 0..n |
| Return of mapper | A value | A stream |
| Use for | Transformation | Flattening nested structures |

#### Complexity
`filter`/`map` are O(n); `sorted` is O(n log n); `distinct` is O(n) with hashing plus memory for seen elements.

#### Frequently confused with
`map` vs `flatMap` — the most commonly asked stream distinction.

#### Important facts to remember
- `sorted` and `distinct` are stateful and break full laziness.
- `peek` is explicitly unreliable and unsuitable for production logging.
- Filter before map to reduce work.

---

### 6.8 Terminal Operations

#### Definition
Operations that consume the stream and produce a result or side effect, triggering execution of the entire pipeline.

#### Why it exists
To provide the trigger that makes a lazy pipeline actually run, and to define the output shape.

#### Interview explanation
The `toList()` versus `Collectors.toList()` distinction is a strong modern-knowledge signal — the former is unmodifiable, the latter mutable, and confusing them causes real `UnsupportedOperationException`s.

#### Syntax
```java
.collect(Collector)  .toList()  .forEach(Consumer)  .reduce(...)
.count()  .anyMatch/allMatch/noneMatch(Predicate)  .findFirst()/.findAny()
```

#### Example
```java
// reduce with identity never returns Optional
int sum = nums.stream().reduce(0, Integer::sum);

// reduce without identity returns Optional (empty stream case)
Optional<Integer> maybeSum = nums.stream().reduce(Integer::sum);
```

#### Common interview questions
- "Difference between `Stream.toList()` and `Collectors.toList()`?" (`toList()` (Java 16+) returns an unmodifiable list allowing nulls; `Collectors.toList()` returns a mutable `ArrayList`.)
- "Which terminal operations short-circuit?" (`anyMatch`, `allMatch`, `noneMatch`, `findFirst`, `findAny`.)
- "Difference between `findFirst` and `findAny`?" (`findFirst` respects encounter order; `findAny` may return any element and is faster in parallel.)

#### Follow-up questions
- "What does `allMatch` return on an empty stream?" (`true` — vacuous truth. `anyMatch` returns `false`, `noneMatch` returns `true`. A classic trick question.)
- "Why does `reduce` have a three-argument form?" (The third argument is a combiner for parallel execution, merging partial results from different threads.)

#### Edge cases
- `allMatch` and `noneMatch` both return `true` on an empty stream.
- `forEach` on a parallel stream gives no ordering guarantee; `forEachOrdered` preserves encounter order at a performance cost.

#### Common mistakes
- Mutating the result of `Stream.toList()`, which throws `UnsupportedOperationException`.
- Assuming `allMatch` returns `false` for an empty stream.

#### Comparisons

| | `Stream.toList()` | `Collectors.toList()` |
|---|---|---|
| Since | Java 16 | Java 8 |
| Mutability | Unmodifiable | Mutable `ArrayList` |
| Nulls | Allowed | Allowed |
| Guaranteed type | Unspecified | Effectively `ArrayList` |

#### Complexity
Generally O(n); short-circuiting operations may terminate far earlier.

#### Frequently confused with
`findFirst` vs `findAny`, and the empty-stream behavior of `allMatch`.

#### Important facts to remember
- `allMatch`/`noneMatch` return `true` on empty streams.
- `Stream.toList()` is unmodifiable.
- The three-arg `reduce` combiner exists for parallelism.

---

### 6.9 Collectors

#### Definition
Recipes describing how to accumulate stream elements into a summary result, supplied to the `collect` terminal operation.

#### Why it exists
To make aggregation composable and reusable rather than requiring bespoke mutable accumulation logic for each case.

#### Interview explanation
`groupingBy` with a downstream collector is the standard live-coding request. Also volunteer the `toMap` duplicate-key trap unprompted — it demonstrates production awareness.

#### Syntax
```java
Collectors.toList() / toSet() / toMap(k, v) / toMap(k, v, mergeFn)
Collectors.joining(delimiter, prefix, suffix)
Collectors.groupingBy(classifier [, downstream])
Collectors.partitioningBy(predicate)
Collectors.counting() / summingInt() / averagingInt() / summarizingInt()
```

#### Example
```java
// Multi-level grouping with downstream
Map<String, Map<String, Long>> byCityThenStatus = people.stream()
    .collect(Collectors.groupingBy(Person::getCity,
             Collectors.groupingBy(Person::getStatus, Collectors.counting())));

// toMap with a merge function to survive duplicates
Map<String, Integer> totals = orders.stream()
    .collect(Collectors.toMap(Order::getCustomer, Order::getAmount, Integer::sum));
```

#### Common interview questions
- "How do you group a list by a property?" (`Collectors.groupingBy`.)
- "What happens with duplicate keys in `Collectors.toMap`?" (Throws `IllegalStateException` unless a merge function is supplied.)
- "Difference between `groupingBy` and `partitioningBy`?" (`partitioningBy` takes a predicate and always produces exactly two keys, `true` and `false`, even if one bucket is empty.)

#### Follow-up questions
- "How do you build a custom collector?" (`Collector.of(supplier, accumulator, combiner, finisher)` — needed rarely, since composition usually suffices.)
- "What is `Collectors.teeing`?" (Java 12+; feeds the stream to two collectors simultaneously and merges their results — useful for computing min and max in one pass.)

#### Edge cases
- `partitioningBy` always returns both keys, so `map.get(true)` never returns null even when empty.
- `toMap` returns a `HashMap` by default; a fourth argument supplies a different map factory (`TreeMap::new`).

#### Common mistakes
- Omitting the merge function in `toMap` and hitting `IllegalStateException` in production.
- Using `groupingBy` with a boolean classifier instead of `partitioningBy`.

#### Comparisons

| | `groupingBy` | `partitioningBy` |
|---|---|---|
| Classifier | Any function | Predicate |
| Key count | Variable | Always exactly 2 |
| Missing keys | Absent from map | Always present |

#### Complexity
O(n) for most collectors, plus the cost of the downstream collector per element.

#### Frequently confused with
`groupingBy` vs `partitioningBy` — and `toMap`'s duplicate-key behavior.

#### Important facts to remember
- `toMap` throws on duplicate keys without a merge function.
- `partitioningBy` always yields both `true` and `false` keys.
- Downstream collectors enable arbitrary nesting.

---

### 6.10 Optional

#### Definition
A container object that either holds a non-null value or represents explicit absence, with a functional API for safe chaining.

#### Why it exists
To make potential absence explicit in a method's return type, prompting callers to handle the empty case deliberately.

#### Interview explanation
Know the intended scope: `Optional` was designed for **return types**. Stating that it's discouraged for fields and parameters — and that it isn't `Serializable` — separates informed answers from cargo-culted ones.

#### Syntax
```java
Optional.of(value)          // throws NPE if null
Optional.ofNullable(value)  // empty if null
Optional.empty()
opt.map(fn).filter(pred).orElseGet(supplier)
```

#### Example
```java
// Anti-pattern - reintroduces the null check
if (opt.isPresent()) { use(opt.get()); }

// Idiomatic
opt.ifPresent(this::use);
String result = opt.map(User::getName).orElse("Unknown");
```

#### Common interview questions
- "Difference between `orElse` and `orElseGet`?" (`orElse` always evaluates its argument, even when a value is present; `orElseGet` invokes the supplier only when empty.)
- "Difference between `Optional.of` and `Optional.ofNullable`?" (`of` throws `NullPointerException` on null; `ofNullable` returns empty.)
- "Should `Optional` be used for fields and parameters?" (No — it was designed for return types; it adds overhead, isn't `Serializable`, and complicates entity classes.)

#### Follow-up questions
- "When does `orElse` versus `orElseGet` actually matter?" (When the fallback is expensive or has side effects — `orElse(saveNewUser())` performs the save even when a value exists.)
- "Why isn't `Optional` `Serializable`?" (A deliberate design decision to discourage its use in fields of serializable classes.)

#### Edge cases
- `Optional.of(null)` throws immediately, which is often the desired fail-fast behavior.
- Nested `Optional<Optional<T>>` arises from using `map` where `flatMap` was needed.

#### Common mistakes
- `isPresent()` followed by `get()`, which is just a null check with extra steps.
- Using `orElse` with an expensive or side-effecting expression.

#### Comparisons

| | `orElse(v)` | `orElseGet(supplier)` |
|---|---|---|
| Evaluation | Always | Only if empty |
| Use for | Cheap constants | Expensive or side-effecting fallbacks |

#### Complexity
Not applicable; adds a small allocation per wrapper.

#### Frequently confused with
`orElse` vs `orElseGet` eager-versus-lazy evaluation.

#### Important facts to remember
- `orElse` always evaluates its argument.
- `Optional` is for return types, not fields or parameters.
- `Optional` is not `Serializable`.

---

### 6.11 Parallel Streams

#### Definition
Streams that partition their source and process chunks concurrently on the common ForkJoinPool, combining partial results.

#### Why it exists
To exploit multiple cores for aggregate operations without writing explicit thread-management code.

#### Interview explanation
The shared common pool is the detail that matters most in production, and interviewers at senior level look for it: every parallel stream in the JVM competes for the same pool, so one blocking pipeline can degrade unrelated code.

#### Syntax
```java
collection.parallelStream()
stream.parallel()
```

#### Example
```java
// Broken: non-associative operation gives different results in parallel
List.of(1,2,3,4).stream().reduce(0, (a,b) -> a - b);            // -10
List.of(1,2,3,4).parallelStream().reduce(0, (a,b) -> a - b);    // unpredictable

// Broken: shared mutable state
List<Integer> out = new ArrayList<>();
list.parallelStream().forEach(out::add);   // race condition
```

#### Common interview questions
- "When should you use a parallel stream?" (Large datasets, CPU-bound work, splittable source like `ArrayList` or array, no shared mutable state, no order dependence.)
- "What pool do parallel streams use?" (The common `ForkJoinPool`, sized `availableProcessors() - 1` by default and shared JVM-wide.)
- "Why must reduce operations be associative?" (Parallel execution splits and combines in arbitrary groupings; non-associative operators produce nondeterministic results.)

#### Follow-up questions
- "How do you run a parallel stream on a dedicated pool?" (Submit the pipeline as a task to your own `ForkJoinPool` — it executes on that pool. A known workaround, though not officially specified API behavior.)
- "Why is `LinkedList` bad for parallel streams?" (It can't be split efficiently — computing a midpoint requires traversal, so partitioning costs O(n).)

#### Edge cases
- `findAny` is genuinely faster than `findFirst` in parallel, because it needn't respect encounter order.
- Blocking I/O inside a parallel stream starves the shared pool, affecting every other parallel stream in the JVM.

#### Common mistakes
- Adding `.parallel()` reflexively, expecting speedup.
- Using parallel streams for I/O-bound work.
- Collecting into a non-thread-safe collection via `forEach`.

#### Comparisons

| | Sequential | Parallel |
|---|---|---|
| Threads | Caller's | Common ForkJoinPool |
| Ordering | Guaranteed | Depends on operation |
| Overhead | Minimal | Split + merge cost |
| Best for | Most cases | Large CPU-bound datasets |

#### Complexity
Same asymptotic complexity; wall-clock time may improve or worsen depending on data size and workload type.

#### Frequently confused with
Parallelism (multiple cores on one task) vs. concurrency (managing multiple tasks) — related but distinct.

#### Important facts to remember
- All parallel streams share one JVM-wide common ForkJoinPool.
- Reduce operations must be associative for correct parallel results.
- Parallel streams are wrong for I/O-bound work.

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

#### Definition
A process is an independently executing program with its own address space; a thread is a unit of execution within a process, sharing heap and static memory with sibling threads while keeping its own stack.

#### Why it exists
Threads allow concurrent work with cheap communication via shared memory, avoiding the cost of inter-process communication.

#### Interview explanation
State precisely what is shared versus private — heap and statics shared, stack and program counter private. That table answers most follow-ups about why local variables need no synchronization.

#### Syntax
```java
Runtime.getRuntime().availableProcessors();   // cores available to the JVM
Thread.currentThread().getName();
```

#### Example
```java
class Counter {
    private int shared = 0;          // heap - shared, needs protection
    void increment() {
        int local = shared;          // stack - private, safe
        shared = local + 1;          // shared write - race
    }
}
```

#### Common interview questions
- "What's the difference between a process and a thread?"
- "What memory do threads share?" (Heap, static fields, class metadata — not stacks.)
- "Do local variables need synchronization?" (No — each thread has its own stack frame.)

#### Follow-up questions
- "What about a local variable referencing a shared object?" (The *reference* is thread-local, but the object it points to is on the heap and shared — that object's state still needs protection.)
- "How many threads can a JVM create?" (Bounded by memory: each platform thread reserves roughly 1 MB of stack by default, so a few thousand is typical before exhaustion.)

#### Edge cases
- `ThreadLocal` gives per-thread storage for values that would otherwise be shared, but leaks in pooled threads if not cleaned up.
- Escaped references from a constructor can make an object visible to other threads before construction completes.

#### Common mistakes
- Synchronizing local variables unnecessarily.
- Assuming an immutable-looking object is safe when it holds a mutable field.

#### Comparisons

| | Process | Thread |
|---|---|---|
| Memory | Isolated address space | Shared heap |
| Creation cost | High | Moderate |
| Communication | IPC, sockets, pipes | Shared memory |
| Failure isolation | Strong | None — one thread can corrupt shared state |

#### Complexity
Not applicable.

#### Frequently confused with
Concurrency (managing multiple tasks) vs. parallelism (executing simultaneously on multiple cores).

#### Important facts to remember
- Heap and statics are shared; stacks are not.
- Local variables never need synchronization.
- Platform threads cost roughly 1 MB of stack each.

---

### 7.2 Creating Threads

#### Definition
Threads are created by extending `Thread`, implementing `Runnable`, or — in practice — submitting tasks to an `ExecutorService`.

#### Why it exists
To execute work concurrently without blocking the calling thread.

#### Interview explanation
The `start()` versus `run()` distinction is asked constantly and is a quick disqualifier if missed. Also be ready to explain why `Runnable` is preferred over extending `Thread`.

#### Syntax
```java
new Thread(() -> work()).start();
executor.submit(() -> work());
```

#### Example
```java
Thread t = new Thread(() -> System.out.println(Thread.currentThread().getName()));
t.start();   // prints "Thread-0"
t.run();     // prints "main" - executed synchronously, no new thread
t.start();   // IllegalThreadStateException - already started
```

#### Common interview questions
- "Difference between `start()` and `run()`?" (`start()` creates a new thread and invokes `run()` on it; calling `run()` directly executes synchronously on the current thread.)
- "Why prefer `Runnable` over extending `Thread`?" (Java allows one superclass; `Runnable` separates the task from the execution mechanism, enabling reuse by executors.)
- "Can you call `start()` twice?" (No — `IllegalThreadStateException`. A `Thread` object is single-use.)

#### Follow-up questions
- "What's a daemon thread?" (A thread that doesn't prevent JVM shutdown. Set via `setDaemon(true)` before `start()`. Used for background housekeeping like GC helpers.)
- "What happens to an uncaught exception in a thread?" (It goes to the thread's `UncaughtExceptionHandler`, or the default handler; the thread dies but the JVM continues.)

#### Edge cases
- `setDaemon()` must be called before `start()` or it throws.
- The JVM exits when only daemon threads remain, potentially killing work mid-execution.

#### Common mistakes
- Calling `run()` instead of `start()` and wondering why nothing runs concurrently.
- Creating threads per task in a loop, exhausting memory.

#### Comparisons

| | Extend `Thread` | Implement `Runnable` | `ExecutorService` |
|---|---|---|---|
| Inheritance used | Yes | No | No |
| Reusable thread | No | No | Yes |
| Returns a result | No | No | Yes (`Callable`) |
| Production suitable | No | Rarely | Yes |

#### Complexity
Thread creation is expensive — roughly 1 MB stack allocation plus an OS system call.

#### Frequently confused with
`Runnable` (no result, no checked exception) vs. `Callable` (returns a value, may throw checked exceptions).

#### Important facts to remember
- `run()` does not create a thread.
- `Thread` objects cannot be restarted.
- `setDaemon()` must precede `start()`.

---

### 7.3 Thread Lifecycle

#### Definition
The six states in `Thread.State`: `NEW`, `RUNNABLE`, `BLOCKED`, `WAITING`, `TIMED_WAITING`, `TERMINATED`.

#### Why it exists
To model why a thread isn't executing, which is the foundation of diagnosing hangs via thread dumps.

#### Interview explanation
The `BLOCKED` versus `WAITING` distinction is the discriminating question here — `BLOCKED` means contending for a monitor, `WAITING` means voluntarily suspended awaiting a signal.

#### Syntax
```java
thread.getState();
Thread.sleep(1000);      // TIMED_WAITING, holds locks
object.wait();           // WAITING, releases the monitor
thread.join();           // WAITING for another thread to finish
```

#### Example
```java
synchronized (lock) {
    Thread.sleep(5000);   // TIMED_WAITING but STILL HOLDS the lock
}

synchronized (lock) {
    lock.wait(5000);      // TIMED_WAITING and RELEASES the lock
}
```

#### Common interview questions
- "Name the thread states."
- "Difference between `BLOCKED` and `WAITING`?" (`BLOCKED` = waiting to acquire a monitor lock; `WAITING` = suspended until signalled.)
- "Difference between `sleep()` and `wait()`?" (`sleep` holds locks and is a `Thread` static method; `wait` releases the monitor and is an `Object` method requiring the lock.)

#### Follow-up questions
- "Does `RUNNABLE` mean the thread is executing?" (Not necessarily — it means eligible to run. The JVM doesn't distinguish between running and ready-to-run.)
- "What does `join()` do internally?" (Waits on the target thread's monitor; the JVM notifies all waiters when the thread terminates. This is why you should never call `wait()`/`notify()` on a `Thread` object yourself.)

#### Edge cases
- A thread in `TIMED_WAITING` from `sleep()` inside a `synchronized` block still blocks every other thread needing that lock.
- `Thread.yield()` is a hint only; the scheduler may ignore it entirely.

#### Common mistakes
- Using `sleep()` to wait for a condition instead of `wait()`/`await()`.
- Interpreting many `RUNNABLE` threads in a dump as high CPU usage — they may be blocked in native I/O, which the JVM still reports as `RUNNABLE`.

#### Comparisons

| | `sleep()` | `wait()` | `join()` |
|---|---|---|---|
| Declared in | `Thread` (static) | `Object` | `Thread` |
| Releases lock | No | Yes | No (releases nothing it holds) |
| Wakes on | Timeout | `notify`/`notifyAll`/timeout | Target thread ends |
| Requires monitor | No | Yes | No |

#### Complexity
Not applicable.

#### Frequently confused with
`BLOCKED` vs `WAITING`, and `sleep()` vs `wait()` lock semantics.

#### Important facts to remember
- `sleep()` never releases a lock; `wait()` always does.
- Native I/O appears as `RUNNABLE` in thread dumps.
- `wait()` requires holding the monitor or it throws `IllegalMonitorStateException`.

---

### 7.4 Race Conditions and Shared State

#### Definition
A race condition occurs when correctness depends on the relative timing of concurrent operations on shared mutable state.

#### Why it exists
It doesn't exist by design — it's the fundamental hazard introduced by sharing memory between threads.

#### Interview explanation
Separate the two distinct failure modes explicitly: atomicity (interleaved compound operations) and visibility (stale reads). Candidates who conflate them tend to reach for `volatile` where they need a lock.

#### Syntax
```java
count++;                                    // not atomic
if (!map.containsKey(k)) map.put(k, v);     // check-then-act
if (instance == null) instance = new X();   // lazy init race
```

#### Example
```java
class Unsafe {
    private int count = 0;
    void increment() { count++; }   // read, add, write - interleavable
}
// 1000 threads x 1000 increments rarely yields 1,000,000
```

#### Common interview questions
- "Why isn't `count++` atomic?" (It's read-modify-write — three separate operations that can interleave.)
- "What are the two main concurrency hazards?" (Atomicity violations and visibility failures.)
- "What is check-then-act?" (Testing a condition then acting on it, where another thread can change the condition in between.)

#### Follow-up questions
- "Can a race condition exist with only reads?" (No — at least one write is required. All-read access to immutable data is inherently safe.)
- "Does making a field `volatile` fix `count++`?" (No — it fixes visibility, not atomicity. `AtomicInteger` or a lock is required.)

#### Edge cases
- 64-bit `long` and `double` writes are not guaranteed atomic on 32-bit JVMs unless declared `volatile` — a rarely-encountered but real JLS provision.
- Object references escaping during construction (`this` published from a constructor) allow other threads to see partially-initialized objects.

#### Common mistakes
- Assuming code is thread-safe because tests pass — races are timing-dependent and often architecture-dependent.
- Reaching for `volatile` on compound operations.

#### Comparisons

| Hazard | Symptom | Fix |
|---|---|---|
| Atomicity | Lost updates | `synchronized`, `Lock`, atomics |
| Visibility | Stale reads, infinite loops | `volatile`, `synchronized` |
| Ordering | Partially constructed objects | `volatile`, `final` fields |

#### Complexity
Not applicable.

#### Frequently confused with
Atomicity vs. visibility — different problems requiring different tools.

#### Important facts to remember
- At least one write is required for a race.
- `volatile` fixes visibility only.
- 32-bit JVMs don't guarantee atomic non-volatile `long`/`double` writes.

---

### 7.5 synchronized

#### Definition
A keyword that acquires an object's intrinsic monitor lock for the duration of a method or block, providing mutual exclusion and memory visibility.

#### Why it exists
To make compound operations indivisible and to establish happens-before relationships between threads.

#### Interview explanation
State that `synchronized` provides both mutual exclusion *and* visibility — many candidates only mention the first. Also be precise about *what object* is locked in each form.

#### Syntax
```java
synchronized void m() { }           // locks 'this'
static synchronized void m() { }    // locks ClassName.class
synchronized (obj) { }              // locks obj
```

#### Example
```java
class Account {
    private final Object lock = new Object();
    private double balance;

    void transfer(Account to, double amt) {
        synchronized (lock) {           // fine-grained, private lock
            balance -= amt;
        }
        to.deposit(amt);
    }
}
```

#### Common interview questions
- "What does `synchronized` lock for an instance method versus a static method?" (`this` versus the `Class` object — they're different locks and don't exclude each other.)
- "Is `synchronized` reentrant?" (Yes — a thread holding a lock can reacquire it, which is required for synchronized methods calling each other.)
- "Does `synchronized` guarantee visibility?" (Yes — unlock flushes writes; lock invalidates cached reads.)

#### Follow-up questions
- "Can two threads execute the same synchronized instance method simultaneously?" (Yes, on *different instances* — the lock is per object, not per method.)
- "What happens if an exception is thrown inside a synchronized block?" (The lock is released automatically during unwinding, unlike `ReentrantLock` which requires a `finally`.)

#### Edge cases
- Synchronizing on a boxed `Integer` or interned `String` is dangerous — these are cached and shared JVM-wide, so unrelated code may contend on the same object.
- Synchronizing on a non-final field means reassignment causes threads to lock different objects, silently removing protection.

#### Common mistakes
- `synchronized(this)` in a public class, allowing external code to acquire your lock and cause unexpected contention or deadlock.
- Locking on a mutable or interned object.

#### Comparisons

| | Instance `synchronized` | Static `synchronized` |
|---|---|---|
| Lock object | `this` | `ClassName.class` |
| Excludes | Other instance-synchronized methods on same object | Other static-synchronized methods |
| Mutual exclusion between the two | No — different locks |

#### Complexity
Uncontended locks are cheap (JVM-optimized); contended locks require OS-level blocking.

#### Frequently confused with
Instance vs. static lock scope — they do not exclude each other.

#### Important facts to remember
- Static and instance synchronized methods use different locks.
- Locks release automatically on exception.
- Always lock on a `private final Object`.

---

### 7.6 volatile

#### Definition
A field modifier guaranteeing that reads see the most recent write from any thread and preventing instruction reordering across the access.

#### Why it exists
To provide visibility and ordering without the cost of locking, for cases where atomicity isn't needed.

#### Interview explanation
Lead with what it does *not* provide. The stop-flag example demonstrates the visibility problem concretely — the JIT hoisting a non-volatile read out of a loop is a real, reproducible failure.

#### Syntax
```java
private volatile boolean running = true;
private volatile Config config;   // safe publication of an immutable object
```

#### Example
```java
// Without volatile, this loop may never terminate
private volatile boolean stop = false;

public void run() {
    while (!stop) { work(); }    // JIT could cache 'stop' in a register
}
public void shutdown() { stop = true; }
```

#### Common interview questions
- "What does `volatile` guarantee?" (Visibility and ordering — not atomicity.)
- "Is `volatile count++` thread-safe?" (No — increment is read-modify-write.)
- "When is `volatile` sufficient?" (Single-writer flags, safe publication of immutable objects, and the double-checked-locking instance field.)

#### Follow-up questions
- "Why does double-checked locking require `volatile`?" (Without it, the reference assignment can be reordered before the constructor finishes, letting another thread observe a partially-constructed object.)
- "Is `volatile` cheaper than `synchronized`?" (Yes for reads — typically near the cost of a normal read on x86. Writes require a memory barrier and cost more.)

#### Edge cases
- `volatile` on an array reference protects the reference, not the elements. Element writes have no volatile semantics — use `AtomicIntegerArray`.
- `volatile` guarantees atomic reads and writes of `long`/`double` even on 32-bit JVMs.

#### Common mistakes
- Treating `volatile` as a lightweight lock.
- Using it on a mutable object reference and assuming the object's fields are safely visible.

#### Comparisons

| | `volatile` | `synchronized` | `AtomicInteger` |
|---|---|---|---|
| Visibility | Yes | Yes | Yes |
| Atomicity | No | Yes | Yes (single variable) |
| Blocking | No | Yes | No (CAS) |
| Compound operations | No | Yes | Limited |

#### Complexity
Volatile read is near-free on x86; write requires a store barrier.

#### Frequently confused with
`volatile` vs. atomic — visibility versus visibility-plus-atomicity.

#### Important facts to remember
- `volatile` never makes compound operations atomic.
- It makes `long`/`double` access atomic on 32-bit JVMs.
- It's required for correct double-checked locking.

---

### 7.7 The Java Memory Model

#### Definition
The specification defining when writes by one thread become visible to another, formalized through the happens-before relation.

#### Why it exists
Compilers, JITs, and CPUs reorder operations for performance; the JMM defines the minimum guarantees programs can rely on across all platforms.

#### Interview explanation
This is the deepest concurrency question typically asked. Name the happens-before rules and give one concrete reordering example — double-checked locking is the standard one.

#### Syntax
```java
// happens-before established by:
volatileField = x;        // volatile write → subsequent volatile read
synchronized (lock) { }   // unlock → subsequent lock
thread.start();           // start() → everything in the new thread
thread.join();            // everything in thread → join() returns
```

#### Example
```java
class SafeInit {
    private final int value;              // final field guarantee
    SafeInit(int v) { this.value = v; }
    // After construction completes, 'value' is visible to all threads
    // WITHOUT synchronization - the final field freeze guarantees it
}
```

#### Common interview questions
- "What is happens-before?" (A partial ordering guaranteeing that one action's effects are visible to another.)
- "List the main happens-before rules." (Program order, monitor lock/unlock, volatile write/read, thread start, thread join, transitivity.)
- "What is safe publication?" (Making an object visible to other threads such that they see it fully constructed — via `volatile`, `final` fields, a static initializer, or a concurrent collection.)

#### Follow-up questions
- "What special guarantee do `final` fields have?" (The final-field freeze: after a constructor completes without leaking `this`, all threads see correctly-initialized final fields with no synchronization — the basis for immutable-object thread safety.)
- "Why does buggy concurrent code often work on x86 but fail on ARM?" (x86 has a stronger hardware memory model with fewer permitted reorderings; ARM permits more, exposing latent JMM violations.)

#### Edge cases
- Leaking `this` from a constructor (registering a listener, starting a thread) breaks the final-field guarantee entirely.
- Data races are undefined behavior in the JMM sense — the result isn't merely "some interleaving," it can be values that no interleaving would produce.

#### Common mistakes
- Assuming testing on x86 validates memory-model correctness.
- Publishing objects via a non-volatile, non-final field.

#### Comparisons

| Mechanism | Establishes happens-before |
|---|---|
| `synchronized` | Unlock → later lock on same monitor |
| `volatile` | Write → later read of same field |
| `final` field | Constructor completion → all reads |
| `Thread.start()` | Before start → all actions in thread |
| Concurrent collections | Put → later get |

#### Complexity
Not applicable.

#### Frequently confused with
The JMM (a specification of guarantees) vs. actual hardware behavior (often stronger).

#### Important facts to remember
- Happens-before is the only visibility guarantee you have.
- `final` fields are safely published if `this` doesn't escape the constructor.
- x86 masks many JMM bugs that appear on ARM.

---

### 7.8 wait, notify, and notifyAll

#### Definition
`Object` methods enabling threads to suspend while holding a monitor and be signalled by other threads holding that same monitor.

#### Why it exists
To let a thread wait for a condition without busy-waiting, releasing the lock so another thread can make the condition true.

#### Interview explanation
The "always wait in a `while` loop" rule with both justifications — spurious wakeups and multiple waiters under `notifyAll` — is what interviewers listen for.

#### Syntax
```java
synchronized (lock) {
    while (!condition) lock.wait();
    // proceed
}

synchronized (lock) {
    condition = true;
    lock.notifyAll();
}
```

#### Example
```java
// Bounded buffer - the classic producer/consumer
synchronized (lock) {
    while (queue.size() == CAPACITY) lock.wait();
    queue.add(item);
    lock.notifyAll();
}
```

#### Common interview questions
- "Why must `wait()` be called in a loop rather than an `if`?" (Spurious wakeups are permitted by the spec, and with `notifyAll` multiple threads wake but only one can proceed.)
- "Difference between `notify()` and `notifyAll()`?" (`notify` wakes one arbitrary waiter; `notifyAll` wakes all. `notify` risks lost wakeups when waiters await different conditions.)
- "Why are these methods on `Object` rather than `Thread`?" (Because they operate on a monitor, and every object has one.)

#### Follow-up questions
- "What's a lost wakeup?" (A notification arrives before the thread starts waiting, or `notify` wakes a thread that can't proceed while the one that could remains asleep — the system hangs.)
- "What replaces `wait`/`notify` in modern code?" (`BlockingQueue` for producer-consumer, or `Condition` objects from `ReentrantLock` which support multiple independent wait queues.)

#### Edge cases
- Calling `wait`/`notify` without holding the monitor throws `IllegalMonitorStateException` at runtime, not compile time.
- Never call `wait`/`notify` on a `Thread` object — `join()` uses that monitor internally and you'd corrupt its behavior.

#### Common mistakes
- Using `if` instead of `while` around `wait()`.
- Preferring `notify()` for efficiency without verifying all waiters await the same condition.

#### Comparisons

| | `notify()` | `notifyAll()` |
|---|---|---|
| Wakes | One arbitrary waiter | All waiters |
| Risk | Lost wakeup | Thundering herd overhead |
| Safe default | No | Yes |

#### Complexity
`notifyAll` wakes O(n) waiters, each re-checking its condition.

#### Frequently confused with
`wait()` (releases the monitor) vs. `sleep()` (holds it).

#### Important facts to remember
- Always wait inside a `while` loop.
- `notifyAll` is the safe default.
- These require holding the monitor or they throw.

---

### 7.9 Locks and the java.util.concurrent Package

#### Definition
Explicit lock implementations (`ReentrantLock`, `ReadWriteLock`, `StampedLock`) and coordination primitives (`CountDownLatch`, `CyclicBarrier`, `Semaphore`) providing capabilities beyond `synchronized`.

#### Why it exists
`synchronized` cannot time out, be interrupted, offer fairness, or span method boundaries.

#### Interview explanation
Emphasize that the choice is about *features*, not performance — modern JVMs make `synchronized` competitive. Also note the mandatory `try/finally` structure, with `lock()` outside the try.

#### Syntax
```java
lock.lock();
try { critical(); } finally { lock.unlock(); }

if (lock.tryLock(1, TimeUnit.SECONDS)) {
    try { critical(); } finally { lock.unlock(); }
}
```

#### Example
```java
// CountDownLatch - wait for N parallel initializations
CountDownLatch latch = new CountDownLatch(3);
for (int i = 0; i < 3; i++)
    executor.submit(() -> { init(); latch.countDown(); });
latch.await();   // blocks until count reaches zero
```

#### Common interview questions
- "`ReentrantLock` versus `synchronized` — when would you choose each?" (Explicit lock for timeouts, interruptibility, fairness, or multiple conditions; `synchronized` for simplicity and automatic release.)
- "Difference between `CountDownLatch` and `CyclicBarrier`?" (Latch is one-shot and counts down to zero; barrier is reusable and releases when N threads arrive.)
- "What is a `Semaphore` for?" (Limiting concurrent access to a resource to N permits — connection throttling, rate limiting.)

#### Follow-up questions
- "What does a fair lock guarantee, and what does it cost?" (FIFO acquisition order, preventing starvation, at significantly reduced throughput due to lost barging optimizations.)
- "What's `StampedLock`'s advantage?" (Optimistic reads that don't lock at all — validate afterwards and retry if a write intervened. Note it is *not* reentrant, unlike `ReentrantLock`.)

#### Edge cases
- `StampedLock` is not reentrant; reacquiring it in the same thread deadlocks.
- `CyclicBarrier` throws `BrokenBarrierException` to all waiters if one thread is interrupted or times out.

#### Common mistakes
- Placing `lock()` inside the `try`, so a failed acquisition triggers `unlock()` on an unheld lock.
- Forgetting `unlock()` entirely, permanently blocking all other threads.

#### Comparisons

| Feature | `synchronized` | `ReentrantLock` |
|---|---|---|
| Timeout | No | `tryLock` |
| Interruptible | No | Yes |
| Fairness | No | Optional |
| Conditions | One | Many |
| Release | Automatic | Manual `finally` |

#### Complexity
Comparable to `synchronized` uncontended; fair locks reduce throughput measurably.

#### Frequently confused with
`CountDownLatch` (one-shot) vs. `CyclicBarrier` (reusable).

#### Important facts to remember
- `lock()` goes outside the `try`; `unlock()` inside `finally`.
- `StampedLock` is not reentrant.
- Fairness costs throughput.

---

### 7.10 Atomic Variables

#### Definition
Classes in `java.util.concurrent.atomic` providing lock-free, thread-safe operations on a single variable via compare-and-swap.

#### Why it exists
Locking for a single-variable update is disproportionately expensive when hardware offers an atomic CAS instruction.

#### Interview explanation
Explain the CAS retry loop mechanically, then mention `LongAdder` as the high-contention alternative — that pairing demonstrates practical depth beyond textbook knowledge.

#### Syntax
```java
AtomicInteger n = new AtomicInteger(0);
n.incrementAndGet();
n.compareAndSet(expected, updated);
n.accumulateAndGet(5, Integer::sum);
AtomicReference<Config> ref = new AtomicReference<>(config);
```

#### Example
```java
// Lock-free stack push using CAS retry
AtomicReference<Node> head = new AtomicReference<>();
void push(Node n) {
    Node old;
    do {
        old = head.get();
        n.next = old;
    } while (!head.compareAndSet(old, n));   // retry until nobody intervened
}
```

#### Common interview questions
- "How does `AtomicInteger` achieve thread safety without locks?" (CAS — an atomic hardware instruction that updates only if the current value matches the expected one, retrying otherwise.)
- "What's the ABA problem?" (A value changes from A to B and back to A; CAS succeeds despite intervening modifications. `AtomicStampedReference` adds a version stamp to detect it.)
- "When is `LongAdder` better than `AtomicLong`?" (Under high write contention — it stripes across per-thread cells rather than contending on one memory location.)

#### Follow-up questions
- "Is lock-free always faster?" (No — under heavy contention CAS loops spin and waste CPU. `LongAdder` exists precisely because `AtomicLong` degrades.)
- "Can you make two atomic variables update atomically together?" (Not with plain atomics — you'd need a lock, or an `AtomicReference` to an immutable object holding both values.)

#### Edge cases
- `LongAdder.sum()` is not atomic with respect to concurrent updates — it's an approximation suitable for metrics, not for exact invariants.
- CAS can livelock under pathological contention as threads perpetually invalidate each other.

#### Common mistakes
- Assuming atomicity composes across multiple atomic variables.
- Using `AtomicLong` for a hot metrics counter where `LongAdder` is far better suited.

#### Comparisons

| | `AtomicLong` | `LongAdder` |
|---|---|---|
| Structure | Single value | Striped cells |
| Write contention | Degrades | Scales well |
| Read cost | O(1) exact | O(cells), approximate under load |
| Best for | Low contention, exact reads | High-frequency counting |

#### Complexity
CAS is O(1) uncontended; retry loops are unbounded under contention.

#### Frequently confused with
`volatile` (visibility only) vs. atomics (visibility plus atomic read-modify-write).

#### Important facts to remember
- CAS retries in a loop until it succeeds.
- ABA is solved by `AtomicStampedReference`.
- `LongAdder` beats `AtomicLong` for contended counters.

---

### 7.11 Executors and Thread Pools

#### Definition
`ExecutorService` decouples task submission from thread management, maintaining a pool of reusable threads fed by a work queue.

#### Why it exists
Thread creation is expensive and unbounded thread creation exhausts memory; pools bound resources and amortize creation cost.

#### Interview explanation
The highest-value point is the task-flow rule: the queue fills *before* the pool grows beyond core size. This explains why `newFixedThreadPool` can OOM, which many candidates find surprising.

#### Syntax
```java
ExecutorService pool = new ThreadPoolExecutor(
    4, 8, 60L, TimeUnit.SECONDS,
    new ArrayBlockingQueue<>(100),
    new ThreadPoolExecutor.CallerRunsPolicy());
```

#### Example
```java
pool.shutdown();                                   // no new tasks, finish existing
if (!pool.awaitTermination(30, TimeUnit.SECONDS))
    pool.shutdownNow();                            // interrupt running tasks
```

#### Common interview questions
- "Explain how a `ThreadPoolExecutor` decides to create a thread versus queue a task." (Below core size → new thread; else queue if space; else create up to max; else reject.)
- "Why is `Executors.newFixedThreadPool` risky?" (Unbounded `LinkedBlockingQueue` — tasks accumulate until heap exhaustion; the thread count is bounded but memory isn't.)
- "Difference between `shutdown()` and `shutdownNow()`?" (`shutdown` stops accepting new tasks and drains the queue; `shutdownNow` also interrupts running tasks and returns queued ones.)

#### Follow-up questions
- "How would you size a pool?" (CPU-bound: roughly core count. I/O-bound: higher, guided by `cores × (1 + wait/compute)`. Measure rather than guess.)
- "What does `CallerRunsPolicy` achieve?" (The submitting thread executes the task, slowing the producer and providing natural backpressure instead of dropping work.)

#### Edge cases
- Submitting a task to a pool from within a task on the *same* fixed pool, then blocking on the result, deadlocks when all threads do so.
- `submit()` wraps exceptions in the returned `Future` — an exception thrown by the task is silently swallowed if the `Future` is never inspected, unlike `execute()` which propagates to the uncaught handler.

#### Common mistakes
- Never calling `shutdown()`, leaving non-daemon threads that prevent JVM exit.
- Using `submit()` and ignoring the returned `Future`, hiding all task exceptions.

#### Comparisons

| Factory | Threads | Queue | Risk |
|---|---|---|---|
| `newFixedThreadPool(n)` | Fixed | Unbounded | Memory exhaustion |
| `newCachedThreadPool()` | Unbounded | `SynchronousQueue` | Thread exhaustion |
| `newSingleThreadExecutor()` | 1 | Unbounded | Memory exhaustion |
| Explicit `ThreadPoolExecutor` | Configured | Bounded | Requires tuning |

#### Complexity
Task submission is O(1); queue behavior depends on the chosen implementation.

#### Frequently confused with
`submit()` (returns `Future`, swallows exceptions) vs. `execute()` (fire-and-forget, propagates to uncaught handler).

#### Important facts to remember
- The queue fills before the pool grows past core size.
- `submit()` hides exceptions inside the `Future`.
- Always `shutdown()` in a `finally` or use try-with-resources (Java 19+).

---

### 7.12 Callable, Future, and CompletableFuture

#### Definition
`Callable<V>` is a task returning a value and permitted to throw checked exceptions; `Future<V>` is a handle to its pending result; `CompletableFuture<V>` adds composition, chaining, and completion callbacks.

#### Why it exists
To retrieve results and exceptions from asynchronous work, and to compose asynchronous operations without blocking.

#### Interview explanation
The `thenApply` versus `thenCompose` distinction mirrors `map` versus `flatMap` from Group 6 — making that connection explicitly signals conceptual coherence rather than memorized API surface.

#### Syntax
```java
Future<Integer> f = pool.submit(() -> compute());
Integer result = f.get(5, TimeUnit.SECONDS);

CompletableFuture.supplyAsync(this::fetch, executor)
    .thenApply(this::transform)
    .thenCompose(this::fetchRelated)
    .exceptionally(ex -> fallback())
    .thenAccept(this::publish);
```

#### Example
```java
// Combining two independent async calls
CompletableFuture<User> user = CompletableFuture.supplyAsync(() -> loadUser(id), ex);
CompletableFuture<Orders> orders = CompletableFuture.supplyAsync(() -> loadOrders(id), ex);

user.thenCombine(orders, Profile::new).thenAccept(this::render);
```

#### Common interview questions
- "Difference between `Runnable` and `Callable`?" (`Callable` returns a value and may throw checked exceptions.)
- "Difference between `thenApply` and `thenCompose`?" (`thenApply` maps the value; `thenCompose` flattens a returned `CompletableFuture`, avoiding `CompletableFuture<CompletableFuture<T>>`.)
- "What are `Future`'s limitations?" (`get()` blocks, no callbacks, no chaining, no combining — hence `CompletableFuture`.)

#### Follow-up questions
- "Which executor do `*Async` methods use by default?" (The common `ForkJoinPool` — shared with parallel streams, so blocking work must be given an explicit executor.)
- "How do exceptions propagate through a chain?" (They short-circuit downstream stages until `exceptionally`, `handle`, or `whenComplete` intercepts. An unhandled failure surfaces only when someone calls `join`/`get`.)

#### Edge cases
- `get()` wraps task exceptions in `ExecutionException`; `join()` wraps them in unchecked `CompletionException`.
- `cancel(true)` interrupts the running thread only if the task is interruptible; it cannot forcibly stop CPU-bound code.

#### Common mistakes
- Never attaching an error handler, so failures vanish silently.
- Using default `*Async` methods for blocking I/O, starving the common pool.

#### Comparisons

| | `Future` | `CompletableFuture` |
|---|---|---|
| Retrieval | Blocking `get()` | Callbacks and chaining |
| Composition | None | `thenApply`, `thenCompose`, `thenCombine` |
| Error handling | Try/catch around `get()` | `exceptionally`, `handle` |
| Manual completion | No | Yes (`complete()`) |

#### Complexity
Not applicable.

#### Frequently confused with
`thenApply` vs `thenCompose` — the map/flatMap distinction applied to futures.

#### Important facts to remember
- `*Async` defaults to the common ForkJoinPool.
- `get()` throws `ExecutionException`; `join()` throws `CompletionException`.
- Unhandled `CompletableFuture` failures are silent.

---

### 7.13 Concurrent Collections

#### Definition
Thread-safe collection implementations in `java.util.concurrent` designed for concurrent access without external synchronization.

#### Why it exists
Standard collections corrupt under concurrent modification, and blanket synchronization serializes all access, destroying throughput.

#### Interview explanation
`ConcurrentHashMap`'s Java 8 redesign — per-bin CAS with lock-free reads, replacing segment locking — is a frequent deep-dive. Pair it with the point that atomic single operations still don't make check-then-act safe.

#### Syntax
```java
map.putIfAbsent(k, v);
map.computeIfAbsent(k, this::expensiveLoad);
map.merge(k, 1, Integer::sum);
BlockingQueue<Task> q = new ArrayBlockingQueue<>(100);
q.put(task);      // blocks if full
q.take();         // blocks if empty
```

#### Example
```java
// Correct concurrent counting
ConcurrentHashMap<String, LongAdder> counts = new ConcurrentHashMap<>();
counts.computeIfAbsent(key, k -> new LongAdder()).increment();
```

#### Common interview questions
- "How does `ConcurrentHashMap` differ from `Collections.synchronizedMap`?" (The former uses fine-grained per-bin locking with lock-free reads and provides atomic compound operations; the latter locks the entire map per call and still needs external synchronization for iteration.)
- "How does `ConcurrentHashMap` work internally in Java 8+?" (Bin-level CAS for insertion into empty bins, `synchronized` on the bin head for collisions, treeification past eight entries, and fully lock-free reads.)
- "When would you use `CopyOnWriteArrayList`?" (Read-dominated workloads with rare writes — listener registries being the canonical case.)

#### Follow-up questions
- "Does `ConcurrentHashMap` allow null keys or values?" (No — unlike `HashMap`. Null would make `get()` ambiguous between 'absent' and 'mapped to null' in a concurrent setting where `containsKey` can't be checked atomically.)
- "What does 'weakly consistent iterator' mean?" (It traverses without throwing `ConcurrentModificationException` and may or may not reflect modifications made after creation — it's not a point-in-time snapshot.)

#### Edge cases
- `size()` on a `ConcurrentHashMap` is an estimate under concurrent modification.
- `computeIfAbsent` holds a bin lock during the mapping function — a long-running or recursive mapping function can block other threads or deadlock.

#### Common mistakes
- Check-then-act on a concurrent map (`containsKey` then `put`) instead of `putIfAbsent`/`computeIfAbsent`.
- Using `CopyOnWriteArrayList` for write-heavy data, where every write copies the whole array.

#### Comparisons

| | `ConcurrentHashMap` | `synchronizedMap` | `Hashtable` |
|---|---|---|---|
| Lock granularity | Per bin | Whole map | Whole map |
| Reads | Lock-free | Locked | Locked |
| Null keys/values | No | Yes (delegates) | No |
| Atomic compounds | Yes | No | No |

#### Complexity
`get`/`put` are O(1) average; `CopyOnWriteArrayList` writes are O(n).

#### Frequently confused with
Individually atomic operations vs. atomic *sequences* — the former doesn't imply the latter.

#### Important facts to remember
- `ConcurrentHashMap` forbids null keys and values.
- Iterators are weakly consistent, not snapshots.
- `computeIfAbsent` holds a bin lock during computation.

---

### 7.14 Deadlock, Livelock, and Starvation

#### Definition
Three liveness failures: deadlock (circular waiting, no progress), livelock (active response, no progress), starvation (perpetual resource denial to a thread).

#### Why it exists
These are emergent failure modes of coordination, not features — naming them enables diagnosis.

#### Interview explanation
Name the four Coffman conditions and state that breaking any single one prevents deadlock; then give lock ordering as the practical fix. Interviewers commonly ask you to spot or fix a deadlock in code.

#### Syntax
```java
// Lock ordering to prevent deadlock
Object first  = id1 < id2 ? a : b;
Object second = id1 < id2 ? b : a;
synchronized (first) { synchronized (second) { transfer(); } }
```

#### Example
```java
// Deadlock: inconsistent acquisition order
void transferA(Account x, Account y) { synchronized(x) { synchronized(y) { } } }
void transferB(Account x, Account y) { synchronized(y) { synchronized(x) { } } }
// Called concurrently with the same two accounts, both hang
```

#### Common interview questions
- "What are the four conditions for deadlock?" (Mutual exclusion, hold-and-wait, no preemption, circular wait.)
- "How do you prevent deadlock?" (Consistent global lock ordering, lock timeouts via `tryLock`, reducing lock scope, or avoiding multiple locks entirely.)
- "Difference between deadlock and livelock?" (Deadlock threads are blocked and idle; livelock threads are actively running but making no progress.)

#### Follow-up questions
- "How do you detect a deadlock in production?" (Thread dump via `jstack` — the JVM explicitly reports "Found one Java-level deadlock" with the participating threads and locks.)
- "Can a thread pool deadlock without any explicit locks?" (Yes — tasks in a bounded pool submitting subtasks to the same pool and blocking on their results. All threads wait for tasks that can never be scheduled.)

#### Edge cases
- Deadlock can span the JVM and the database — a thread holding a JVM lock while awaiting a database row lock held by a transaction blocked on that JVM lock.
- `tryLock` without a backoff can produce livelock, as threads repeatedly acquire and release in lockstep.

#### Common mistakes
- Acquiring multiple locks in varying orders across methods.
- Calling foreign or callback code while holding a lock, since that code may acquire further locks unpredictably.

#### Comparisons

| | Deadlock | Livelock | Starvation |
|---|---|---|---|
| Thread state | Blocked | Runnable | Runnable/blocked |
| CPU usage | None | High | Varies |
| Detection | Thread dump | Profiling | Latency monitoring |
| Fix | Lock ordering, timeouts | Randomized backoff | Fair locks |

#### Complexity
Not applicable.

#### Frequently confused with
Livelock vs. deadlock — CPU usage is the quickest distinguishing signal.

#### Important facts to remember
- Breaking any one Coffman condition prevents deadlock.
- `jstack` detects and reports Java-level deadlocks explicitly.
- Thread pools can deadlock without any explicit lock.

---

### 7.15 Virtual Threads

#### Definition
Lightweight JVM-managed threads (Java 21+) that mount onto a small pool of carrier platform threads and unmount when blocked, enabling millions of concurrent threads.

#### Why it exists
Platform threads are scarce and expensive, which forced complex asynchronous programming models for high-concurrency I/O. Virtual threads restore simple blocking code at scale.

#### Interview explanation
Be precise that the benefit is for *blocking I/O*, not CPU-bound work, and raise pinning unprompted — it's the practical gotcha that distinguishes real usage from headline knowledge.

#### Syntax
```java
Thread.startVirtualThread(() -> handle(request));

try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    tasks.forEach(t -> executor.submit(t));
}
```

#### Example
```java
// 10,000 concurrent blocking calls - trivial with virtual threads
try (var ex = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 10_000; i++) {
        ex.submit(() -> { httpClient.send(request); return null; });
    }
}   // close() waits for all tasks
```

#### Common interview questions
- "What problem do virtual threads solve?" (The thread-per-request model's scalability ceiling, without resorting to reactive/async programming styles.)
- "What is pinning?" (A virtual thread that cannot unmount from its carrier — historically caused by `synchronized` blocks and native frames — which blocks the carrier platform thread.)
- "Should you pool virtual threads?" (No — they're cheap and designed to be created per task. Pooling reintroduces the constraint they eliminate.)

#### Follow-up questions
- "Why use `ReentrantLock` instead of `synchronized` in virtual-thread code?" (`ReentrantLock` permits unmounting while waiting; `synchronized` historically pinned the carrier. Recent JDK work has reduced `synchronized` pinning, but `ReentrantLock` remains the safer choice for code that must run across versions.)
- "Do virtual threads help CPU-bound work?" (No — throughput is bounded by cores. They increase concurrency for waiting, not computation.)

#### Edge cases
- `ThreadLocal` works but is memory-costly at a million threads; scoped values are the intended replacement.
- Existing thread-pool-based frameworks may not benefit automatically — the gain requires per-task virtual threads rather than pooled platform threads.

#### Common mistakes
- Pooling virtual threads.
- Expecting speedups on computational workloads.

#### Comparisons

| | Platform thread | Virtual thread |
|---|---|---|
| Scheduler | OS | JVM |
| Cost | ~1 MB stack | Bytes to KB, heap-allocated |
| Feasible count | Thousands | Millions |
| Blocking | Blocks OS thread | Unmounts carrier |
| Suits | CPU-bound | I/O-bound |

#### Complexity
Mount/unmount is far cheaper than an OS context switch.

#### Frequently confused with
Virtual threads (concurrency for blocking I/O) vs. parallel streams (parallelism for CPU work).

#### Important facts to remember
- Create per task; never pool.
- No benefit for CPU-bound work.
- Prefer `ReentrantLock` over `synchronized` around blocking calls.

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

#### Definition
The JVM comprises a class loader subsystem, runtime data areas, and an execution engine containing an interpreter, JIT compiler, and garbage collector.

#### Why it exists
To execute portable bytecode on any platform while providing automatic memory management and runtime optimization.

#### Interview explanation
Draw the three subsystems and name what sits in each. Then make the point that long-running JVMs execute mostly JIT-compiled native code — this preempts the "Java is interpreted and therefore slow" assumption.

#### Syntax
```bash
java -XX:+PrintFlagsFinal -version    # all JVM flags and their values
jcmd <pid> VM.info                     # full runtime picture
```

#### Example
```java
Runtime rt = Runtime.getRuntime();
rt.maxMemory();     // -Xmx value
rt.totalMemory();   // currently allocated heap
rt.freeMemory();    // free within allocated heap
```

#### Common interview questions
- "Describe the JVM's architecture."
- "Is Java compiled or interpreted?" (Both — compiled to bytecode, then interpreted and JIT-compiled at runtime.)
- "What does the execution engine contain?" (Interpreter, JIT compiler, garbage collector.)

#### Follow-up questions
- "What's the difference between the JVM specification and HotSpot?" (The spec defines required behavior; HotSpot is Oracle/OpenJDK's implementation. Others exist — OpenJ9, GraalVM — with different GC and JIT designs.)
- "Why does a JVM process use more memory than `-Xmx`?" (Heap is only one region — metaspace, thread stacks, code cache, direct buffers, and JVM internals all consume additional native memory.)

#### Edge cases
- GraalVM native-image compiles ahead-of-time, eliminating JIT and warm-up entirely at the cost of peak throughput and dynamic features.
- Different JVM implementations (OpenJ9) have materially different memory footprints and GC behavior.

#### Common mistakes
- Describing the JVM as purely an interpreter.
- Equating total JVM memory with heap size.

#### Comparisons

| Subsystem | Responsibility |
|---|---|
| Class loader | Load, verify, link, initialize classes |
| Runtime data areas | Heap, metaspace, stacks, code cache |
| Execution engine | Interpret, JIT compile, garbage collect |

#### Complexity
Not applicable.

#### Frequently confused with
JVM specification vs. HotSpot implementation.

#### Important facts to remember
- Long-running JVMs run mostly compiled native code.
- Total memory is heap plus metaspace plus stacks plus code cache.
- HotSpot is one implementation among several.

---

### 8.2 Class Loading

#### Definition
The process of locating bytecode, verifying it, linking it, and initializing the class — performed lazily by a hierarchy of class loaders using parent delegation.

#### Why it exists
To load code on demand, enforce bytecode safety, and prevent substitution of core JDK classes.

#### Interview explanation
Name the five phases in order, then explain parent delegation as a *security* mechanism. The class-identity point — that identity is name plus loader — is the detail that distinguishes strong answers.

#### Syntax
```java
Class.forName("com.example.Foo");                    // loads and initializes
Class.forName("com.example.Foo", false, loader);     // loads without initializing
getClass().getClassLoader();
```

#### Example
```java
// Same class file, two loaders - two distinct types
Class<?> a = loaderA.loadClass("com.example.Foo");
Class<?> b = loaderB.loadClass("com.example.Foo");
a.equals(b);   // false - identity is (name, classloader)
```

#### Common interview questions
- "What are the phases of class loading?" (Loading, verification, preparation, resolution, initialization.)
- "Explain parent delegation and why it exists." (A loader delegates upward before loading itself, so nobody can substitute a malicious `java.lang.String`.)
- "When is a class initialized?" (First instantiation, first static method call, first non-constant static field access, or reflection — but *not* for compile-time `static final` constants.)

#### Follow-up questions
- "Can two classes with the same fully-qualified name coexist in one JVM?" (Yes, if loaded by different loaders — this is how application servers isolate deployed applications, and the cause of confusing `ClassCastException`s where a type appears not castable to itself.)
- "What happens during verification?" (Bytecode is checked for type safety, valid stack operations, and correct access — this is what prevents hand-crafted malicious bytecode from breaking JVM invariants.)

#### Edge cases
- `static final` primitives and String constants are inlined at compile time, so referencing them does not trigger initialization — and changing them requires recompiling every dependent class.
- An exception in a static initializer throws `ExceptionInInitializerError`, and the class is permanently marked erroneous — every later use throws `NoClassDefFoundError`.

#### Common mistakes
- Confusing `ClassNotFoundException` (reflective lookup failed) with `NoClassDefFoundError` (present at compile time, absent or failed to initialize at runtime).
- Assuming class name alone determines identity.

#### Comparisons

| | `ClassNotFoundException` | `NoClassDefFoundError` |
|---|---|---|
| Type | Checked exception | Error |
| Cause | Explicit lookup failed (`Class.forName`) | Present at compile time, missing/failed at runtime |
| Typical root cause | Wrong name, missing dependency | Classpath mismatch, failed static init |

#### Complexity
Loading is O(1) per class, but the cumulative cost is a major startup contributor.

#### Frequently confused with
`ClassNotFoundException` vs `NoClassDefFoundError`.

#### Important facts to remember
- Class identity is (name, class loader).
- Parent delegation prevents core class spoofing.
- `static final` constants are inlined and don't trigger initialization.

---

### 8.3 Runtime Memory Areas

#### Definition
The JVM's memory regions: heap and metaspace (shared), plus stack, PC register, and native method stack (per thread), alongside the code cache.

#### Why it exists
Different data has different lifetime and sharing characteristics; separating regions simplifies management and eliminates synchronization for thread-local data.

#### Interview explanation
The high-value point is that `-Xmx` bounds only the heap. Being able to enumerate non-heap memory demonstrates real container-sizing experience.

#### Syntax
```bash
-Xmx4g              # max heap
-Xss512k            # per-thread stack
-XX:MaxMetaspaceSize=256m
-XX:ReservedCodeCacheSize=240m
-XX:MaxDirectMemorySize=1g
```

#### Example
```java
// Each of these lives in a different region
int local = 42;                        // stack
Object obj = new Object();             // heap
static final String NAME = "x";        // reference in heap, metadata in metaspace
ByteBuffer.allocateDirect(1024);       // native memory, outside heap
```

#### Common interview questions
- "What are the JVM memory areas, and which are shared?" (Heap and metaspace shared; stack, PC register, and native stack per thread.)
- "Where do local variables live versus objects?" (Locals on the thread's stack; objects on the heap, in the JVM specification's model. HotSpot's escape analysis can scalar-replace an object that never leaves its method, so it is never allocated at all — an optimisation the program cannot observe.)
- "Why does a container get OOM-killed when heap usage looks fine?" (Non-heap memory — metaspace, stacks, code cache, direct buffers — isn't counted in heap metrics but counts toward the container limit.)

#### Follow-up questions
- "What is the code cache and what happens if it fills?" (It stores JIT-compiled native code. When full, the JVM stops compiling and reverts to interpretation — causing a severe slowdown with no exception thrown, which is genuinely hard to diagnose without the warning in the logs.)
- "Where do direct `ByteBuffer`s allocate?" (Native memory outside the heap, bounded by `-XX:MaxDirectMemorySize`. They're freed only when the buffer object is collected, making them a common native-memory leak source.)

#### Edge cases
- String literals live in the heap since Java 7 (previously PermGen), so they're now subject to normal GC.
- Native Memory Tracking (`-XX:NativeMemoryTracking=summary` with `jcmd VM.native_memory`) is the tool for diagnosing non-heap growth.

#### Common mistakes
- Sizing a container equal to `-Xmx`.
- Assuming heap metrics represent total JVM memory usage.

#### Comparisons

| Region | Scope | Exhaustion error |
|---|---|---|
| Heap | Shared | `OutOfMemoryError: Java heap space` |
| Metaspace | Shared | `OutOfMemoryError: Metaspace` |
| Stack | Per thread | `StackOverflowError` |
| Code cache | Shared | No error — silent deoptimization |
| Direct memory | Shared | `OutOfMemoryError: Direct buffer memory` |

#### Complexity
Not applicable.

#### Frequently confused with
Heap size vs. total process memory (RSS).

#### Important facts to remember
- `-Xmx` bounds only the heap.
- A full code cache causes silent performance collapse, not an error.
- Direct buffers live outside the heap and leak easily.

---

### 8.4 The Heap and Object Allocation

#### Definition
The shared memory region where all objects and arrays are allocated, managed by the garbage collector and divided into generations by most collectors.

#### Why it exists
Objects must outlive the stack frame that created them, requiring a separately-managed region with automatic reclamation.

#### Interview explanation
Explain TLAB allocation as a pointer bump, then use that to explain why object pooling is usually counterproductive. That inversion of the common assumption tends to land well.

#### Syntax
```bash
-XX:+UseTLAB               # enabled by default
-XX:+PrintTLAB
-XX:+DoEscapeAnalysis      # enabled by default
```

#### Example
```java
void method() {
    StringBuilder sb = new StringBuilder();   // may never be allocated at all
    sb.append("hello");
    System.out.println(sb.toString());
}
// Escape analysis can prove sb never escapes, replacing it with scalar values
```

#### Common interview questions
- "How does object allocation work in the JVM?" (Bump-pointer allocation within a thread-local TLAB — no locking, roughly a pointer increment.)
- "What is escape analysis?" (JIT analysis proving an object doesn't escape its method, enabling scalar replacement and eliminating the allocation.)
- "How much memory does an object header take?" (Typically 12 bytes with compressed oops, 16 without, before any fields.)

#### Follow-up questions
- "Why is object pooling usually a bad idea in modern Java?" (Allocation is nearly free, while pooled objects survive longer, get promoted to the old generation, and cause more expensive full collections. Pool only genuinely costly resources like connections.)
- "What are compressed oops?" (32-bit object references on 64-bit JVMs with heaps under ~32 GB, halving reference size. Crossing that threshold disables them, so a 33 GB heap can hold *less* usable data than a 31 GB one.)

#### Edge cases
- The ~32 GB compressed-oops boundary means raising the heap past it can reduce effective capacity — a genuinely counterintuitive tuning cliff.
- Large objects may bypass Eden and be allocated directly into the old generation (G1 calls these humongous allocations).

#### Common mistakes
- Introducing object pools for ordinary domain objects.
- Setting a heap just above 32 GB, silently losing compressed oops.

#### Comparisons

| | Stack allocation | Heap allocation |
|---|---|---|
| Lifetime | Method scope | Until unreachable |
| Cleanup | Automatic on return | Garbage collector |
| Cost | Free | Pointer bump plus eventual GC |
| Shared across threads | No | Yes |

#### Complexity
Allocation is effectively O(1); GC cost scales with live data.

#### Frequently confused with
The assumption that allocation is expensive — it isn't; collection is.

#### Important facts to remember
- TLAB allocation is a lock-free pointer bump.
- Escape analysis can eliminate allocations entirely.
- Compressed oops are lost above roughly 32 GB of heap.

---

### 8.5 The Stack

#### Definition
A per-thread LIFO structure of frames, each holding a method invocation's local variables, operand stack, and constant-pool reference.

#### Why it exists
Method invocation is strictly nested, so a stack models it exactly and allows deterministic, GC-free cleanup.

#### Interview explanation
Connect it back to concurrency: stack confinement is precisely why local variables never need synchronization. That link demonstrates integrated understanding rather than isolated facts.

#### Syntax
```bash
-Xss1m              # per-thread stack size
```

#### Example
```java
int factorial(int n) {
    return n <= 1 ? 1 : n * factorial(n - 1);
}
factorial(100_000);   // StackOverflowError - no tail call optimization in Java
```

#### Common interview questions
- "What's stored in a stack frame?" (Local variable array, operand stack, reference to the runtime constant pool.)
- "What causes `StackOverflowError`?" (Exceeding stack depth — almost always unbounded or excessively deep recursion.)
- "Why don't local variables need synchronization?" (Each thread has its own stack, so locals are inherently thread-confined.)

#### Follow-up questions
- "Does Java optimize tail recursion?" (No — the JVM has no guaranteed tail-call optimization, so deeply recursive algorithms must be rewritten iteratively.)
- "What's the trade-off in raising `-Xss`?" (Every thread reserves that much, so raising it multiplies across the thread count. It also doesn't fix genuine infinite recursion.)

#### Edge cases
- A `StackOverflowError` can be caught, but doing so is inadvisable — the stack state is unreliable and the underlying bug remains.
- Deep recursion in a virtual thread behaves differently, since virtual thread stacks grow on the heap rather than being pre-reserved.

#### Common mistakes
- Raising `-Xss` to mask a recursion bug.
- Using recursion for large-input algorithms without an iterative fallback.

#### Comparisons

| | `StackOverflowError` | `OutOfMemoryError` |
|---|---|---|
| Region | Thread stack | Heap, metaspace, or native |
| Typical cause | Deep recursion | Retention leak or undersized heap |
| Per-thread | Yes | No |

#### Complexity
Push and pop are O(1).

#### Frequently confused with
`StackOverflowError` vs `OutOfMemoryError` — different regions and different causes.

#### Important facts to remember
- Java has no tail-call optimization.
- `-Xss` cost multiplies by thread count.
- Stack confinement is why locals are thread-safe.

---

### 8.6 Metaspace

#### Definition
The native-memory region storing class metadata, introduced in Java 8 to replace the heap-resident, fixed-size PermGen.

#### Why it exists
PermGen's fixed sizing caused frequent `OutOfMemoryError: PermGen space`, particularly in application servers doing repeated redeployment.

#### Interview explanation
The PermGen-to-metaspace migration is a standard question. State both the location change (heap to native) and the sizing change (fixed to dynamic), plus the risk the latter introduces.

#### Syntax
```bash
-XX:MaxMetaspaceSize=512m
-XX:MetaspaceSize=128m        # initial threshold triggering GC
```

#### Example
```java
// A class loader leak grows metaspace, not heap
// Each redeploy loads all classes again under a new loader;
// if the old loader is retained, its metadata is never released
```

#### Common interview questions
- "What replaced PermGen and why?" (Metaspace, in Java 8 — PermGen's fixed size caused frequent OOMs, especially with repeated redeployment.)
- "Where does metaspace live?" (Native memory, outside the heap.)
- "Is metaspace unbounded?" (By default yes, which means a leak grows until the OS or container kills the process.)

#### Follow-up questions
- "When is class metadata released?" (When the class loader becomes unreachable — all its classes unload together. This is why a single retained class pins an entire loader's metadata.)
- "Where did interned strings move?" (To the heap in Java 7, so they're now normally garbage collected rather than accumulating in PermGen.)

#### Edge cases
- Frameworks generating classes at runtime (CGLIB proxies, dynamic languages, mocking libraries) can grow metaspace substantially, especially with repeated generation.
- Setting `-XX:MaxMetaspaceSize` converts a silent OS kill into a diagnosable `OutOfMemoryError` with a heap dump.

#### Common mistakes
- Assuming metaspace can't be exhausted because it's unbounded by default.
- Diagnosing a metaspace leak by examining the heap, which looks healthy.

#### Comparisons

| | PermGen | Metaspace |
|---|---|---|
| Location | Heap | Native memory |
| Sizing | Fixed | Dynamic by default |
| Flag | `-XX:MaxPermSize` | `-XX:MaxMetaspaceSize` |
| Interned strings | Yes (≤ Java 6) | No — in heap |

#### Complexity
Not applicable.

#### Frequently confused with
Metaspace exhaustion vs. heap exhaustion — different regions and different diagnostic paths.

#### Important facts to remember
- Metaspace is native memory, not heap.
- It's unbounded by default; bound it deliberately.
- Metadata unloads only when its class loader becomes unreachable.

---

### 8.7 Garbage Collection Basics

#### Definition
Automatic reclamation of memory occupied by objects unreachable from any GC root, performed by tracing collectors using mark-sweep-compact.

#### Why it exists
To eliminate manual memory management and the bug classes it produces — double frees, dangling pointers, and leaks from missed frees.

#### Interview explanation
Lead with reachability rather than scope, and use a reference-cycle example to show why tracing beats reference counting. Then be direct that `System.gc()` should never appear in production code.

#### Syntax
```java
System.gc();                  // a suggestion, often harmful - avoid
Runtime.getRuntime().gc();    // same thing
```

#### Example
```java
Object a = new Object();
Object b = new Object();
// Suppose a references b and b references a
a = null;
b = null;
// Both are collected despite the cycle - tracing finds no path from any root
```

#### Common interview questions
- "When does an object become eligible for garbage collection?" (When it's unreachable from any GC root.)
- "What are GC roots?" (Active stack locals, static fields, JNI references, live thread objects.)
- "Does `System.gc()` force collection?" (No — it's a hint the JVM may ignore, and `-XX:+DisableExplicitGC` disables it entirely.)

#### Follow-up questions
- "Why can Java collect reference cycles when reference counting can't?" (Tracing starts from roots and marks what's reachable; an isolated cycle is never reached, so it's collected regardless of internal references.)
- "What happened to `finalize()`?" (Deprecated since Java 9 — unpredictable timing, could resurrect objects, and delayed collection. `Cleaner` and try-with-resources are the replacements.)

#### Edge cases
- Setting a reference to `null` rarely helps, since the object is typically already unreachable when the variable goes out of scope.
- An object can be resurrected inside `finalize()`, one of several reasons finalization was deprecated.

#### Common mistakes
- Calling `System.gc()` in production, forcing expensive full collections.
- Relying on `finalize()` for resource cleanup.

#### Comparisons

| | Tracing GC (Java) | Reference counting |
|---|---|---|
| Cycles | Handled | Leaked |
| Pauses | Yes | Amortized, no large pause |
| Overhead | Periodic tracing | Per-assignment counter updates |

#### Complexity
Marking cost scales with *live* data, not with garbage volume.

#### Frequently confused with
Scope-based eligibility vs. reachability-based eligibility.

#### Important facts to remember
- Reachability, not scope, determines collection.
- `System.gc()` is a suggestion and usually harmful.
- `finalize()` is deprecated; use `Cleaner` or try-with-resources.

---

### 8.8 Generational GC

#### Definition
A heap organization dividing objects into young and old generations based on age, collecting the young generation frequently and cheaply.

#### Why it exists
The weak generational hypothesis — most objects die young — makes age-based segregation dramatically more efficient than uniform collection.

#### Interview explanation
State the hypothesis, walk Eden → survivor → tenured, and make the key point that minor GC cost is proportional to *survivors*, not to Eden size. That explains why a large Eden is cheap when most objects die.

#### Syntax
```bash
-XX:NewRatio=2                 # old:young size ratio
-XX:SurvivorRatio=8            # Eden:survivor ratio
-XX:MaxTenuringThreshold=15    # cycles before promotion
```

#### Example
```java
// Typical short-lived object - allocated in Eden, collected at the next minor GC
for (int i = 0; i < 1_000_000; i++) {
    String temp = "item-" + i;   // garbage almost immediately
    process(temp);
}
```

#### Common interview questions
- "Explain the generational hypothesis." (Most objects become unreachable shortly after allocation, so collecting recent allocations reclaims the most memory for the least work.)
- "Walk through an object's journey from allocation to tenuring." (Eden → survivor space on surviving a minor GC → alternating survivor spaces, incrementing age → old generation after the tenuring threshold.)
- "Why is minor GC cheaper than full GC?" (Its cost scales with surviving objects, which are typically a small fraction, and it only traverses the young generation.)

#### Follow-up questions
- "What is premature promotion and why does it matter?" (Objects surviving into the old generation before dying, usually from an undersized young generation or medium-lived objects. It drives up full GC frequency, which is far more expensive.)
- "What are card tables / remembered sets for?" (Tracking references from the old generation into the young, so minor GC needn't scan the entire old generation to find roots.)

#### Edge cases
- Workloads where most objects survive (large in-memory caches) defeat generational assumptions, and non-generational or region-based collectors may perform better.
- Objects too large for Eden can be allocated directly in the old generation.

#### Common mistakes
- Assuming a larger heap always reduces GC cost — a larger old generation lengthens full GCs.
- Overlooking medium-lived objects as the cause of frequent full collections.

#### Comparisons

| | Minor GC | Full GC |
|---|---|---|
| Scope | Young generation | Entire heap |
| Frequency | Often | Rarely |
| Pause | Short | Long |
| Cost driver | Surviving objects | Total live data |

#### Complexity
Minor GC is O(survivors); full GC is O(live heap).

#### Frequently confused with
Minor GC vs. full GC cost — the distinction is what makes generational collection work.

#### Important facts to remember
- Minor GC cost scales with survivors, not Eden size.
- Premature promotion drives expensive full GCs.
- Remembered sets avoid scanning the old generation during minor GC.

---

### 8.9 Garbage Collector Implementations

#### Definition
The JVM's selectable collectors — Serial, Parallel, G1 (default since Java 9), ZGC, and Shenandoah — each optimizing a different balance of throughput, pause time, and footprint.

#### Why it exists
No single collector suits all workloads; batch processing and low-latency services have opposing requirements.

#### Interview explanation
Frame it as a three-way trade-off between throughput, latency, and footprint, then match collectors to workloads. Avoid claiming any collector is universally best — that's the trap in this question.

#### Syntax
```bash
-XX:+UseSerialGC / -XX:+UseParallelGC / -XX:+UseG1GC
-XX:+UseZGC -XX:+ZGenerational      # generational ZGC
-XX:+UseShenandoahGC
-XX:MaxGCPauseMillis=200
```

#### Example
```bash
# Low-latency service
java -XX:+UseZGC -Xmx16g -Xlog:gc*:gc.log MyService

# Throughput-oriented batch job
java -XX:+UseParallelGC -Xmx8g BatchJob
```

#### Common interview questions
- "Which collector is the default, and why?" (G1 since Java 9 — a balanced compromise between pause time and throughput for typical server workloads.)
- "How does G1 differ from earlier collectors?" (Region-based rather than contiguous generations; collects highest-garbage regions first; targets a configurable pause goal.)
- "When would you choose ZGC?" (Very large heaps and strict latency requirements, where sub-millisecond pauses justify the throughput cost.)

#### Follow-up questions
- "What does ZGC trade for its short pauses?" (Throughput and CPU — it does marking and relocation concurrently, using load barriers on every reference read, which adds steady overhead.)
- "Is Parallel GC ever the right choice today?" (Yes — for batch workloads where total wall-clock time matters and pauses don't, it often completes fastest.)

#### Edge cases
- ZGC became generational in recent JDK versions, substantially improving its throughput relative to the original single-generation design.
- In small containers, Serial GC can outperform G1 due to lower overhead and fewer GC threads.

#### Common mistakes
- Copying GC flags from blog posts without measuring against the actual workload.
- Assuming the lowest-pause collector is best regardless of requirements.

#### Comparisons

| Collector | Pause | Throughput | Best for |
|---|---|---|---|
| Serial | Long | Moderate | Small heaps, single core |
| Parallel | Long | Highest | Batch processing |
| G1 | Moderate | High | General purpose |
| ZGC | Sub-ms | Lower | Low latency, huge heaps |
| Shenandoah | Sub-ms | Lower | Low latency |

#### Complexity
Not applicable.

#### Frequently confused with
Throughput optimization vs. latency optimization — they're genuinely opposed.

#### Important facts to remember
- G1 is the default since Java 9.
- ZGC and Shenandoah trade throughput for pause time.
- Parallel GC still wins for pure batch throughput.

---

### 8.10 References (Strong, Soft, Weak, Phantom)

#### Definition
Four reachability strengths controlling when the collector may reclaim an object: strong (never while reachable), soft (under memory pressure), weak (at the next GC), and phantom (post-finalization, for cleanup).

#### Why it exists
To let application code build caches and cleanup logic that cooperate with the collector rather than pinning memory indefinitely.

#### Interview explanation
Name all four with their collection conditions, then be candid that `SoftReference` caches are unpredictable in practice — that judgment is more valuable than reciting the hierarchy.

#### Syntax
```java
WeakReference<Key> weak = new WeakReference<>(key);
SoftReference<Data> soft = new SoftReference<>(data);
ReferenceQueue<Res> q = new ReferenceQueue<>();
PhantomReference<Res> ph = new PhantomReference<>(res, q);
```

#### Example
```java
WeakHashMap<Key, Metadata> map = new WeakHashMap<>();
// Entries disappear once no strong reference to the key remains -
// UNLESS the value references the key, which defeats the weakness entirely
```

#### Common interview questions
- "Explain the four reference types." (Strong, soft, weak, phantom — in decreasing order of retention strength.)
- "How does `WeakHashMap` work?" (Keys are held weakly; entries are removed once the key is otherwise unreachable.)
- "What replaced `finalize()`?" (`Cleaner`, built on phantom references, plus try-with-resources for deterministic cleanup.)

#### Follow-up questions
- "Why is `SoftReference` a poor caching mechanism?" (Clearing behavior is JVM-dependent and typically happens abruptly under pressure, giving no size or time control. Purpose-built caches like Caffeine offer predictable bounds and eviction.)
- "What's a `ReferenceQueue` for?" (The collector enqueues references after clearing them, letting application code perform cleanup — this is how `Cleaner` operates.)

#### Edge cases
- A `WeakHashMap` whose values reference their keys never evicts, a classic subtle leak.
- Soft references extend GC work, since the collector must evaluate whether to clear them.

#### Common mistakes
- Building caches on `SoftReference` and expecting predictable behavior.
- Values referencing keys in a `WeakHashMap`.

#### Comparisons

| Type | Cleared when | Use |
|---|---|---|
| Strong | Never while reachable | Normal references |
| Soft | Memory pressure | Memory-sensitive caches (discouraged) |
| Weak | Next GC | Canonicalizing maps, metadata |
| Phantom | After finalization | Cleanup actions |

#### Complexity
Not applicable.

#### Frequently confused with
Soft vs. weak — soft survives until memory pressure; weak dies at the next collection.

#### Important facts to remember
- `SoftReference` behavior is unpredictable; prefer bounded caches.
- `WeakHashMap` leaks if values reference keys.
- `Cleaner` and try-with-resources replace `finalize()`.

---

### 8.11 Memory Leaks in Java

#### Definition
Unintentional retention of object references, keeping objects reachable and therefore uncollectable despite being no longer needed.

#### Why it exists
Not by design — it's the residual memory failure mode that garbage collection cannot address, since GC cannot infer intent.

#### Interview explanation
Define a leak as a *retention* bug, list the standard sources, then describe the heap-dump workflow — dominator tree, retained size, path to GC root. That workflow is what separates diagnosis from guesswork.

#### Syntax
```bash
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/var/log/dumps
jcmd <pid> GC.heap_dump /tmp/heap.hprof
```

#### Example
```java
// Listener leak - the publisher outlives the subscriber
publisher.addListener(this);     // never removed
// The publisher's list keeps 'this' alive for the JVM's lifetime
```

#### Common interview questions
- "Can Java have memory leaks?" (Yes — GC reclaims unreachable objects, but reachable-yet-unneeded objects are retained indefinitely.)
- "Name common leak sources." (Static collections, unregistered listeners, `ThreadLocal` in pooled threads, unclosed resources, inner class references, class loader leaks.)
- "How do you diagnose a leak?" (Capture a heap dump, open it in Eclipse MAT, examine the dominator tree and leak suspects, then trace the path to GC root for the retaining object.)

#### Follow-up questions
- "What's the difference between shallow and retained size?" (Shallow is the object itself; retained is everything that would be freed if it were collected — retained size identifies the true culprit.)
- "Why do `ThreadLocal`s leak in application servers?" (Pooled threads outlive requests, so an unremoved value persists on the thread indefinitely — and is visible to the next request on that thread, making it a data-leakage risk as well.)

#### Edge cases
- Class loader leaks retain every class the loader defined, growing metaspace while heap appears healthy.
- A leak may present only as increasing GC frequency long before any `OutOfMemoryError`.

#### Common mistakes
- Adding to static or long-lived collections without eviction.
- Diagnosing by intuition rather than heap dump analysis.

#### Comparisons

| Leak type | Symptom | Diagnostic |
|---|---|---|
| Heap retention | Rising heap, more frequent GC | Heap dump, MAT dominator tree |
| Metaspace | Rising native memory, healthy heap | `jcmd VM.native_memory`, class histogram |
| Direct buffer | Rising RSS, healthy heap | Native Memory Tracking |

#### Complexity
Heap dump analysis is proportional to heap size and can be slow for very large heaps.

#### Frequently confused with
A leak (retention bug) vs. an undersized heap (capacity problem) — both cause `OutOfMemoryError`.

#### Important facts to remember
- Every Java leak is a retention bug.
- Retained size, not shallow size, identifies the culprit.
- `ThreadLocal` in pooled threads leaks memory and can leak data.

---

### 8.12 JIT Compilation

#### Definition
Runtime compilation of frequently-executed bytecode into optimized native machine code, using profiling data collected during execution.

#### Why it exists
To combine bytecode portability with native execution speed, and to enable optimizations that depend on runtime behavior a static compiler cannot observe.

#### Interview explanation
Explain tiered compilation and inlining, then introduce deoptimization as the mechanism that makes speculative optimization safe. Deoptimization is the concept most candidates omit.

#### Syntax
```bash
-XX:+PrintCompilation
-XX:+UnlockDiagnosticVMOptions -XX:+PrintInlining
-XX:TieredStopAtLevel=1    # C1 only - faster startup, lower peak
```

#### Example
```java
// The JIT can inline this and prove only one implementation exists,
// devirtualizing the call entirely - until a second subclass loads,
// at which point the compiled code is discarded and recompiled
interface Handler { void handle(); }
```

#### Common interview questions
- "What is JIT compilation?" (Runtime compilation of hot bytecode into native code, guided by execution profiles.)
- "What is tiered compilation?" (Interpreter → C1 for fast, lightly-optimized code → C2 for aggressively optimized code, promoted as a method proves hot.)
- "What is deoptimization?" (Discarding compiled code when a speculative assumption is invalidated, falling back to the interpreter — this is what makes aggressive speculation safe.)

#### Follow-up questions
- "Why do benchmarks need warm-up?" (Early executions run interpreted or C1-compiled. Measuring without warm-up measures the interpreter, not steady-state performance — which is why JMH exists.)
- "What is OSR?" (On-stack replacement — swapping a long-running loop from interpreted to compiled code mid-execution, without waiting for the method to be re-entered.)

#### Edge cases
- A megamorphic call site (many implementations) prevents inlining and is measurably slower than a monomorphic one.
- A full code cache silently disables further compilation, causing severe slowdown with only a log warning.

#### Common mistakes
- Writing microbenchmarks without JMH, producing results dominated by warm-up and dead-code elimination.
- Assuming the JVM's performance profile at startup reflects steady state.

#### Comparisons

| | Interpreter | C1 | C2 |
|---|---|---|---|
| Compile speed | N/A | Fast | Slow |
| Code quality | Lowest | Moderate | Highest |
| Profiling | Collects | Collects | Uses |
| Role | Startup | Warm-up | Steady state |

#### Complexity
Compilation happens on background threads; it consumes CPU but doesn't pause the application.

#### Frequently confused with
JIT (runtime, profile-guided) vs. AOT/native-image (build-time, no warm-up but lower peak throughput).

#### Important facts to remember
- Deoptimization makes speculative optimization safe.
- Warm-up is mandatory for meaningful benchmarks — use JMH.
- A full code cache silently disables compilation.

---

### 8.13 JVM Tuning and Monitoring

#### Definition
Configuring JVM behavior through command-line flags and observing runtime behavior through logging, profiling, and diagnostic tooling.

#### Why it exists
Default settings target the general case; production workloads frequently need explicit heap sizing, collector selection, and failure diagnostics.

#### Interview explanation
The strongest answer starts by pushing back on the premise: measure before tuning, since most performance problems are code-level, not flag-level. Then name the flags that genuinely matter.

#### Syntax
```bash
-Xms4g -Xmx4g
-XX:MaxRAMPercentage=75          # preferred in containers
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/var/log/dumps
-Xlog:gc*:file=gc.log:time,uptime:filecount=5,filesize=10M
-XX:+ExitOnOutOfMemoryError      # fail fast for orchestrator restart
```

#### Example
```bash
jcmd <pid> GC.heap_info
jcmd <pid> Thread.print
jcmd <pid> VM.native_memory summary
jstat -gcutil <pid> 1000
```

#### Common interview questions
- "What flags would you always set in production?" (Heap bounds or `MaxRAMPercentage`, `HeapDumpOnOutOfMemoryError` with a path, GC logging, and an explicit collector choice.)
- "Why set `-Xms` equal to `-Xmx`?" (Avoids incremental heap growth and the resize pauses that accompany it, which matters during warm-up.)
- "How do you approach a memory problem?" (Reproduce, capture a heap dump, analyze retained sizes and dominators in MAT, fix the retention — tuning flags is a last resort.)

#### Follow-up questions
- "What is Java Flight Recorder and why is it valuable in production?" (A built-in, very low-overhead profiler capturing allocation, GC, lock contention, and I/O events with full context — safe to run continuously, unlike most profilers.)
- "How do JVM settings interact with container limits?" (Modern JVMs read cgroup limits; `MaxRAMPercentage` adapts automatically, while a fixed `-Xmx` doesn't. Non-heap memory must still be budgeted within the container limit.)

#### Edge cases
- `-XX:+UseContainerSupport` is on by default in current JVMs, but older versions ignored cgroup limits and sized the heap from host memory — a classic cause of OOM kills in containers.
- Capturing a heap dump pauses the JVM and can take minutes for a large heap, so it isn't free during an incident.

#### Common mistakes
- Tuning flags before profiling.
- Setting `-Xms` far below `-Xmx`, incurring repeated resize pauses.

#### Comparisons

| Tool | Use |
|---|---|
| `jcmd` | General diagnostics, dumps, flags |
| `jstat` | Live GC statistics |
| JFR | Continuous low-overhead production profiling |
| Eclipse MAT | Heap dump and leak analysis |
| `async-profiler` | CPU and allocation flame graphs |

#### Complexity
Not applicable.

#### Frequently confused with
Tuning (configuration) vs. optimization (code changes) — the latter usually matters more.

#### Important facts to remember
- Measure before tuning; most problems are code-level.
- Set `-Xms` equal to `-Xmx` for server workloads.
- JFR is safe for continuous production use.

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

#### Definition
The mechanisms by which a Java program exchanges data with external systems — files, networks, and processes — via three API generations: `java.io`, `java.nio`, and NIO.2.

#### Why it exists
Programs must read input and produce output; Java abstracts platform-specific system calls behind consistent interfaces.

#### Interview explanation
Distinguish the three generations clearly and correct the NIO naming trap up front — NIO is "New I/O," not "non-blocking I/O." That single clarification signals you've worked with the APIs rather than skimmed them.

#### Syntax
```java
java.io.InputStream        // blocking byte streams
java.nio.channels.Channel  // channels and buffers
java.nio.file.Files        // NIO.2 filesystem operations
```

#### Example
```java
// Same task, three eras
new BufferedReader(new FileReader("f.txt")).readLine();   // java.io
Files.readString(Path.of("f.txt"));                        // NIO.2, preferred
```

#### Common interview questions
- "What's the difference between `java.io` and `java.nio`?" (Streams versus channels/buffers; NIO adds non-blocking mode and memory mapping.)
- "Does NIO mean non-blocking?" (No — New I/O. `FileChannel` is always blocking.)
- "Which API should new code use for files?" (NIO.2 — `Path` and `Files`.)

#### Follow-up questions
- "Is NIO always faster than `java.io`?" (No. For sequential file reading, buffered streams are comparable and simpler. NIO wins for high-concurrency networking, memory mapping, and zero-copy transfers.)
- "How does virtual thread adoption change the blocking-versus-non-blocking calculus?" (Substantially — virtual threads make blocking I/O scale to high connection counts, reducing the need for callback-based non-blocking code in many services.)

#### Edge cases
- `java.io` streams remain the right choice for simple sequential processing; NIO adds complexity without benefit there.
- Asynchronous file I/O (`AsynchronousFileChannel`) exists but is rarely used, since most filesystems don't benefit.

#### Common mistakes
- Assuming NIO is universally faster.
- Mixing `File` and `Path` APIs inconsistently across a codebase.

#### Comparisons

| | `java.io` | `java.nio` | NIO.2 |
|---|---|---|---|
| Abstraction | Streams | Channels + buffers | Path + Files |
| Blocking | Always | Optional (sockets) | Mostly blocking |
| Best for | Sequential, simple | High-concurrency networking | All file operations |

#### Complexity
I/O cost is dominated by system calls and device latency, not algorithmic complexity.

#### Frequently confused with
NIO (New I/O) vs. non-blocking I/O — overlapping but distinct.

#### Important facts to remember
- NIO stands for New I/O.
- `FileChannel` is always blocking.
- NIO.2 is the correct default for file work.

---

### 9.2 Byte Streams

#### Definition
`InputStream` and `OutputStream` and their subclasses, providing sequential read and write of raw bytes.

#### Why it exists
Binary data — images, archives, protocol payloads — has no character semantics and must be handled as bytes.

#### Interview explanation
The detail worth volunteering is why `read()` returns `int` rather than `byte`: it needs a value outside the 0–255 range to signal EOF, and `-1` serves that purpose.

#### Syntax
```java
int b = in.read();                    // one byte, or -1
int n = in.read(buffer);              // up to buffer.length, returns count
int n = in.read(buffer, off, len);
in.transferTo(out);                    // Java 9+, efficient copy
```

#### Example
```java
try (InputStream in = Files.newInputStream(src);
     OutputStream out = Files.newOutputStream(dst)) {
    in.transferTo(out);   // Java 9+ - replaces the manual loop
}
```

#### Common interview questions
- "Why does `read()` return `int` instead of `byte`?" (To represent EOF as `-1`, distinct from any valid byte value 0–255.)
- "What does `read(byte[])` return?" (The number of bytes actually read, which may be fewer than the array length, or `-1` at EOF.)
- "What's the difference between byte streams and character streams?" (Byte streams handle raw binary; character streams decode bytes into characters using a charset.)

#### Follow-up questions
- "What does `available()` return?" (Bytes readable without blocking — *not* the total remaining size. Using it to size a buffer for a whole file is a common bug, especially on network streams where it often returns 0.)
- "What are `mark()` and `reset()` for?" (Marking a position to return to. Not all streams support it — check `markSupported()`. `BufferedInputStream` does.)

#### Edge cases
- Network streams routinely return partial reads; code assuming a full buffer fill is broken.
- `available()` on a socket often returns 0 even when data will arrive shortly.

#### Common mistakes
- Ignoring the return value of `read(byte[])` and processing stale array contents.
- Using `available()` to determine file size.

#### Comparisons

| | Byte stream | Character stream |
|---|---|---|
| Unit | `byte` (8-bit) | `char` (16-bit UTF-16 unit) |
| Base classes | `InputStream`/`OutputStream` | `Reader`/`Writer` |
| Charset aware | No | Yes |
| Use for | Binary data | Text |

#### Complexity
Unbuffered byte-at-a-time reading is O(n) system calls — the dominant cost.

#### Frequently confused with
`available()` as "remaining bytes" — it isn't.

#### Important facts to remember
- `read()` returns `int` so `-1` can mean EOF.
- `read(byte[])` may return fewer bytes than requested.
- `transferTo()` (Java 9+) replaces manual copy loops.

---

### 9.3 Character Streams (Readers and Writers)

#### Definition
`Reader` and `Writer` and their subclasses, which decode bytes to characters and encode characters to bytes using a specified charset.

#### Why it exists
Multi-byte encodings mean bytes and characters aren't interchangeable; naive byte-to-char casting corrupts non-ASCII text.

#### Interview explanation
The `char` versus code point distinction is the discriminating detail. Being able to explain why `"😀".length()` returns 2 demonstrates real understanding of Java's UTF-16 representation.

#### Syntax
```java
new InputStreamReader(inputStream, StandardCharsets.UTF_8)
new BufferedReader(reader)
Files.newBufferedReader(path)          // UTF-8 by default
```

#### Example
```java
String emoji = "😀";
emoji.length();              // 2 - it's a surrogate pair
emoji.codePointCount(0, emoji.length());   // 1 - one actual character
emoji.charAt(0);             // half a character - meaningless alone
```

#### Common interview questions
- "Why do we need both byte and character streams?" (Characters may span multiple bytes; readers handle the decoding correctly.)
- "How many bytes is a Java `char`?" (Two — a UTF-16 code unit, not necessarily a full character.)
- "Why does `"😀".length()` return 2?" (It's outside the Basic Multilingual Plane and requires a surrogate pair — two `char` values.)

#### Follow-up questions
- "How do you correctly count user-visible characters?" (`codePointCount()` handles surrogate pairs; even that doesn't handle grapheme clusters like flag emoji or combining accents — those need `BreakIterator`.)
- "What are `InputStreamReader` and `OutputStreamWriter` for?" (Bridge classes converting between byte streams and character streams, and where the charset is specified.)

#### Edge cases
- Iterating a string by `char` index can split a surrogate pair, producing invalid output.
- `String.substring()` at an arbitrary index can break a character in half.

#### Common mistakes
- Using `length()` to count characters in internationalized text.
- Omitting the charset in `InputStreamReader` on pre-Java-18 targets.

#### Comparisons

| | Code unit (`char`) | Code point |
|---|---|---|
| Size | 16 bits | Up to 21 bits |
| Represents | Half or all of a character | One full character |
| API | `charAt`, `length` | `codePointAt`, `codePointCount` |

#### Complexity
Decoding is O(n) in bytes processed.

#### Frequently confused with
`char` count vs. actual character count for non-BMP text.

#### Important facts to remember
- A `char` is a UTF-16 code unit, not a character.
- Non-BMP characters need surrogate pairs.
- Use `codePoints()` for correct character iteration.

---

### 9.4 Buffering

#### Definition
Accumulating data in an in-memory buffer so that many logical read/write operations map to few system calls.

#### Why it exists
System calls are expensive relative to memory access; batching them is the single largest available I/O optimization.

#### Interview explanation
Quantify the difference — one to two orders of magnitude for byte-at-a-time access. Then distinguish `flush()` from `fsync()`, which most candidates conflate.

#### Syntax
```java
new BufferedInputStream(in, 8192)
new BufferedReader(reader)
new BufferedWriter(writer)
```

#### Example
```java
// Without buffering: one syscall per byte
try (InputStream in = new FileInputStream("f")) {
    while (in.read() != -1) { }        // extremely slow
}

// With buffering: one syscall per 8 KB
try (InputStream in = new BufferedInputStream(new FileInputStream("f"))) {
    while (in.read() != -1) { }        // orders of magnitude faster
}
```

#### Common interview questions
- "Why does buffering improve I/O performance?" (It amortizes expensive system calls across many logical operations.)
- "What does `flush()` do?" (Pushes buffered data from the JVM to the operating system.)
- "Does `close()` flush?" (Yes — which is why an unclosed writer can lose its final buffered data.)

#### Follow-up questions
- "Does `flush()` guarantee data is durable on disk?" (No — it reaches the OS page cache, which may not have written to the device. Durability requires `FileChannel.force(true)` or `FileDescriptor.sync()`.)
- "When is buffering unnecessary?" (When the underlying source is already in memory — `ByteArrayInputStream` — or when reading large blocks directly, where the buffer adds only a copy.)

#### Edge cases
- The default buffer size (8 KB) is reasonable for most cases; very large sequential reads may benefit from more, but returns diminish quickly.
- Buffering a `ByteArrayInputStream` adds a pointless copy.

#### Common mistakes
- Assuming `flush()` provides durability.
- Forgetting to close a writer, silently truncating output.

#### Comparisons

| | `flush()` | `force()` / `fsync()` |
|---|---|---|
| Moves data to | OS page cache | Physical storage |
| Survives process crash | Yes | Yes |
| Survives power loss | No | Yes |
| Cost | Low | High |

#### Complexity
Reduces system calls from O(n) to O(n / bufferSize).

#### Frequently confused with
`flush()` vs. `fsync()` — process durability vs. hardware durability.

#### Important facts to remember
- Buffering gives one to two orders of magnitude improvement for small reads.
- `close()` flushes automatically.
- `flush()` is not durability.

---

### 9.5 The Decorator Pattern in Java I/O

#### Definition
The compositional design where each I/O class wraps another of the same interface type, adding one capability such as buffering, decoding, or compression.

#### Why it exists
To combine independent features without a class-per-combination explosion.

#### Interview explanation
This is the canonical real-world Decorator example, so it appears in design-pattern interviews as often as I/O ones. Mention the combinatorial argument — five features would need thirty-two subclasses.

#### Syntax
```java
new BufferedReader(
    new InputStreamReader(
        new GZIPInputStream(
            new FileInputStream(file)), StandardCharsets.UTF_8))
```

#### Example
```java
// Order matters for performance
new GZIPOutputStream(new BufferedOutputStream(fileOut));   // buffers compressed bytes
new BufferedOutputStream(new GZIPOutputStream(fileOut));   // buffers raw bytes
```

#### Common interview questions
- "Which design pattern does Java I/O demonstrate?" (Decorator.)
- "Why is it designed this way?" (Feature composition without combinatorial subclassing.)
- "If you close the outer stream, are inner streams closed?" (Yes — close propagates down the chain.)

#### Follow-up questions
- "Does wrapper order matter?" (Yes, for behavior and performance — buffering compressed versus decompressed data has different characteristics, and encoding must sit above compression, not below.)
- "What other JDK APIs use Decorator?" (`Collections.unmodifiableList` and `synchronizedList` wrap and add behavior in the same way.)

#### Edge cases
- Closing an inner stream directly can discard buffered data held by an outer wrapper.
- Some wrappers require specific ordering to function at all — a `Reader` cannot wrap a `Reader` for decoding purposes.

#### Common mistakes
- Closing the wrong stream in the chain.
- Assuming order is arbitrary.

#### Comparisons

| Approach | Classes needed for 5 features |
|---|---|
| Subclassing every combination | 32 |
| Decorator composition | 5 |

#### Complexity
Each layer adds a small constant per operation.

#### Frequently confused with
Decorator (adds behavior, same interface) vs. Adapter (converts between interfaces) — `InputStreamReader` is arguably both.

#### Important facts to remember
- Closing the outermost closes all.
- Order affects behavior and performance.
- This is the JDK's canonical Decorator example.

---

### 9.6 Character Encoding

#### Definition
A mapping between characters and byte sequences; UTF-8 is the modern default, and Java's `String` uses UTF-16 internally.

#### Why it exists
Text must be represented as bytes for storage and transmission, and different scripts require different byte-length strategies.

#### Interview explanation
State that Java 18 made UTF-8 the standard default charset — this is recent enough that mentioning it signals current knowledge. Then note that explicit charsets remain correct practice regardless.

#### Syntax
```java
StandardCharsets.UTF_8
new String(bytes, StandardCharsets.UTF_8)
str.getBytes(StandardCharsets.UTF_8)
Files.readString(path, StandardCharsets.UTF_8)
```

#### Example
```java
// The classic corruption path
byte[] utf8 = "café".getBytes(StandardCharsets.UTF_8);
new String(utf8, StandardCharsets.ISO_8859_1);   // "cafÃ©" - no exception thrown
```

#### Common interview questions
- "What's the difference between UTF-8 and UTF-16?" (UTF-8 is variable-width 1–4 bytes and ASCII-compatible; UTF-16 is 2 or 4 bytes and is Java's internal `String` representation.)
- "What happens if you decode with the wrong charset?" (Usually silent corruption, not an exception — ISO-8859-1 accepts any byte sequence.)
- "What changed in Java 18 regarding charsets?" (UTF-8 became the default charset for standard APIs, eliminating platform-dependent behavior.)

#### Follow-up questions
- "Why did the platform default cause so many bugs?" (It varied by OS and locale, so identical code produced different results on a Windows developer machine and a Linux server — often discovered only in production.)
- "What is a BOM and should you write one?" (A byte-order mark identifying encoding. For UTF-8 it's unnecessary and often harmful — many tools treat it as content.)

#### Edge cases
- ISO-8859-1 decoding never fails, since every byte value is a valid character — which is why corruption is silent.
- `String.getBytes()` without a charset used the platform default before Java 18.

#### Common mistakes
- Omitting the charset and relying on the default.
- Round-tripping text through a mismatched encoding pair, permanently corrupting it.

#### Comparisons

| | UTF-8 | UTF-16 | ISO-8859-1 |
|---|---|---|---|
| Bytes/char | 1–4 | 2 or 4 | 1 |
| ASCII compatible | Yes | No | Yes |
| Covers Unicode | Fully | Fully | 256 chars only |
| Fails on bad input | Substitutes | Substitutes | Never |

#### Complexity
Encoding and decoding are O(n).

#### Frequently confused with
Java's internal UTF-16 `String` representation vs. the UTF-8 used for I/O.

#### Important facts to remember
- Java 18 made UTF-8 the default charset.
- Wrong-charset decoding corrupts silently.
- Always specify the charset explicitly.

---

### 9.7 File Handling: File vs Path

#### Definition
`java.io.File` is the legacy filesystem API; `java.nio.file.Path` with `Files` is the modern replacement introduced in Java 7.

#### Why it exists
`File` returned booleans on failure with no diagnostic information and lacked symlink, attribute, and atomic-operation support.

#### Interview explanation
The strongest single argument is error reporting — `File.delete()` returns `false` with no reason, while `Files.delete()` throws a specific exception naming the cause. That difference matters enormously in production debugging.

#### Syntax
```java
Path p = Path.of("dir", "file.txt");      // Java 11+
Path p = Paths.get("dir", "file.txt");    // Java 7+
p.resolve("child");  p.normalize();  p.toAbsolutePath();
File f = p.toFile();  Path back = f.toPath();
```

#### Example
```java
File old = new File("data.txt");
old.delete();                    // returns false - permissions? missing? locked?

Files.delete(Path.of("data.txt"));
// throws NoSuchFileException / AccessDeniedException / DirectoryNotEmptyException
```

#### Common interview questions
- "Why was `File` replaced?" (Uninformative boolean returns, no symlink support, no attribute access, no atomic operations, no change notification.)
- "Does creating a `Path` touch the filesystem?" (No — it's a purely abstract location; it may not exist.)
- "How do you join path segments portably?" (`Path.of("a", "b")` or `path.resolve("b")` — never string concatenation with separators.)

#### Follow-up questions
- "What's the difference between `resolve` and `resolveSibling`?" (`resolve` appends to the path; `resolveSibling` replaces the final element — useful for renaming within the same directory.)
- "What does `normalize()` do?" (Removes redundant `.` and `..` elements syntactically, without touching the filesystem — note it doesn't resolve symlinks, which requires `toRealPath()`.)

#### Edge cases
- `normalize()` is purely textual; with symlinks it can produce a path that doesn't refer to the same location. Use `toRealPath()` when correctness matters.
- Path comparison via `equals()` is lexical — two different paths can reference the same file.

#### Common mistakes
- Building paths with hardcoded `/` or `\`.
- Assuming `Path` implies existence.

#### Comparisons

| | `File` | `Path` + `Files` |
|---|---|---|
| Error reporting | Boolean | Specific exceptions |
| Symlinks | No | Yes |
| Attributes | Minimal | Full (POSIX, DOS, owner) |
| Atomic move | No | Yes |
| Watching | No | `WatchService` |

#### Complexity
Not applicable.

#### Frequently confused with
`normalize()` (textual) vs. `toRealPath()` (resolves symlinks, requires existence).

#### Important facts to remember
- `Path` is a name, not a file.
- `Files` throws informative exceptions where `File` returned `false`.
- Never concatenate path separators manually.

---

### 9.8 NIO.2 and the Files API

#### Definition
The Java 7 filesystem API providing `Files` utility methods, directory streams, file attributes, atomic operations, and `WatchService`.

#### Why it exists
To give Java a filesystem API matching what modern operating systems actually support, with proper error reporting.

#### Interview explanation
The point most worth raising unprompted is that `Files.lines`, `walk`, `list`, and `find` return streams holding open file descriptors and must be closed. It's a real leak source and connects back to Group 5's resource discipline.

#### Syntax
```java
Files.readString(path)          Files.writeString(path, s)
Files.lines(path)               Files.walk(dir, maxDepth)
Files.copy(src, dst, opts)      Files.move(src, dst, ATOMIC_MOVE)
Files.createDirectories(path)   Files.readAttributes(path, BasicFileAttributes.class)
```

#### Example
```java
// Must be closed - holds a file handle
try (Stream<Path> files = Files.walk(root)) {
    files.filter(Files::isRegularFile)
         .filter(p -> p.toString().endsWith(".log"))
         .forEach(this::archive);
}
```

#### Common interview questions
- "How do you read a whole file as a string?" (`Files.readString(path)`, Java 11+.)
- "How do you process a file too large for memory?" (`Files.lines(path)` in try-with-resources — constant memory, provided no stateful stream operation buffers it.)
- "Why must `Files.lines()` be closed?" (It holds an open file descriptor; leaking it eventually exhausts the process limit.)

#### Follow-up questions
- "What does `ATOMIC_MOVE` guarantee?" (The move either completes fully or not at all, with no observable intermediate state. It generally requires source and destination on the same filesystem, and is the standard way to publish a file safely — write to a temp name, then atomically rename.)
- "What is `WatchService` for?" (Registering directories for create/modify/delete notifications — used for config hot-reload and drop-folder ingestion.)

#### Edge cases
- `ATOMIC_MOVE` across filesystems throws `AtomicMoveNotSupportedException`.
- `Files.walk` follows symlinks only with `FOLLOW_LINKS`, and can then loop infinitely on cyclic links.

#### Common mistakes
- Not closing stream-returning `Files` methods.
- `readAllLines()` on large files, exhausting heap.

#### Comparisons

| Task | Loads into memory | Streaming |
|---|---|---|
| Read all | `readAllLines`, `readString` | `Files.lines` |
| Traverse | `File.listFiles()` array | `Files.walk`, `Files.list` |

#### Complexity
Streaming variants are O(1) memory; whole-file variants are O(file size).

#### Frequently confused with
Which `Files` methods return closeable streams — `lines`, `walk`, `list`, `find` all do.

#### Important facts to remember
- Stream-returning `Files` methods must be closed.
- `ATOMIC_MOVE` enables safe publish-by-rename.
- `readString`/`writeString` arrived in Java 11.

---

### 9.9 Channels and Buffers

#### Definition
`Channel` is a bidirectional connection to an I/O source; `Buffer` is a fixed-capacity container with position, limit, and capacity markers through which all channel data flows.

#### Why it exists
To enable memory mapping, zero-copy transfer, and non-blocking operation — none of which the stream model supports.

#### Interview explanation
Buffer state is the core of this topic. Explain position/limit/capacity and what `flip()` does; forgetting `flip()` is the most common NIO bug and interviewers frequently probe it directly.

#### Syntax
```java
ByteBuffer buf = ByteBuffer.allocate(1024);       // heap
ByteBuffer direct = ByteBuffer.allocateDirect(1024);  // native
buf.flip();  buf.clear();  buf.rewind();  buf.compact();
```

#### Example
```java
try (FileChannel ch = FileChannel.open(path, StandardOpenOption.READ)) {
    ByteBuffer buf = ByteBuffer.allocate(1024);
    while (ch.read(buf) != -1) {
        buf.flip();                     // switch from filling to draining
        while (buf.hasRemaining()) process(buf.get());
        buf.clear();                    // reset for next fill
    }
}
```

#### Common interview questions
- "Explain position, limit, and capacity." (Position is the next index to access; limit is the first index not to access; capacity is the fixed total size.)
- "What does `flip()` do?" (Sets limit to the current position and position to zero — switching the buffer from write mode to read mode.)
- "Difference between heap and direct buffers?" (Heap buffers live in the Java heap and require a copy for I/O; direct buffers live in native memory allowing zero-copy, but cost more to allocate and are reclaimed unpredictably.)

#### Follow-up questions
- "What's the difference between `clear()` and `compact()`?" (`clear()` discards everything and resets; `compact()` moves unread bytes to the front and positions after them — use `compact()` when a partial read left unprocessed data.)
- "When is memory mapping worthwhile?" (Large files with random access — the OS pages data in on demand, avoiding explicit reads. Note that unmapping isn't deterministic in Java, which complicates deleting mapped files on Windows.)

#### Edge cases
- Direct buffers are freed only when the buffer object is collected, making per-request allocation a native memory leak pattern.
- `FileChannel.transferTo()` can achieve true zero-copy at the OS level for socket transfers.

#### Common mistakes
- Forgetting `flip()` and finding nothing to read.
- Allocating direct buffers per operation rather than reusing them.

#### Comparisons

| Method | Effect |
|---|---|
| `flip()` | limit = position, position = 0 (write → read) |
| `clear()` | position = 0, limit = capacity (discard all) |
| `rewind()` | position = 0, limit unchanged (re-read) |
| `compact()` | move unread to front, position after them |

#### Complexity
Buffer operations are O(1); `compact()` is O(remaining).

#### Frequently confused with
`clear()` vs `compact()` — one discards unread data, the other preserves it.

#### Important facts to remember
- `flip()` switches from filling to draining.
- Direct buffers are expensive to allocate and slow to reclaim.
- `clear()` doesn't erase data, it just resets the markers.

---

### 9.10 Non-Blocking I/O and Selectors

#### Definition
A model where channels are configured non-blocking and a `Selector` multiplexes readiness events across many channels, allowing one thread to service many connections.

#### Why it exists
Thread-per-connection doesn't scale to tens of thousands of clients due to stack memory and context-switching cost.

#### Interview explanation
Frame it as a scalability mechanism rather than a speed one, and connect it to virtual threads — Java 21 substantially changes when non-blocking complexity is worth paying for.

#### Syntax
```java
channel.configureBlocking(false);
channel.register(selector, SelectionKey.OP_READ);
selector.select();
Set<SelectionKey> ready = selector.selectedKeys();
```

#### Example
```java
while (running) {
    selector.select(1000);
    Iterator<SelectionKey> it = selector.selectedKeys().iterator();
    while (it.hasNext()) {
        SelectionKey key = it.next();
        it.remove();                      // MUST remove or it repeats
        if (key.isReadable()) read(key);
    }
}
```

#### Common interview questions
- "How does a `Selector` work?" (It blocks until one or more registered channels are ready, then reports the ready set — allowing one thread to handle many connections.)
- "What is the C10K problem?" (Serving ten thousand concurrent connections, which thread-per-connection cannot do economically — the original motivation for non-blocking I/O.)
- "What happens if you don't remove processed selection keys?" (They remain in the selected set and are reprocessed on the next iteration, typically causing a busy loop.)

#### Follow-up questions
- "Do virtual threads make non-blocking I/O obsolete?" (Not obsolete, but much less necessary. Virtual threads let simple blocking code scale to high connection counts, so the callback complexity of NIO is now justified mainly for extreme scale or existing frameworks like Netty.)
- "Why not do database calls inside an event-loop handler?" (Blocking the event loop stalls every connection it serves — offload blocking work to a separate executor.)

#### Edge cases
- The infamous epoll selector spin bug caused `select()` to return immediately with no ready keys; frameworks like Netty include workarounds.
- Writing is usually attempted directly, registering `OP_WRITE` only when the socket buffer is full — always registering it causes a busy loop.

#### Common mistakes
- Not clearing the selected key set.
- Performing blocking work in the event loop.

#### Comparisons

| | Thread-per-connection | Selector-based |
|---|---|---|
| Threads for 10k connections | 10,000 | 1–8 |
| Memory | ~10 GB stacks | Minimal |
| Code style | Sequential, simple | Callback, complex |
| Java 21 alternative | Virtual threads | — |

#### Complexity
`select()` is roughly O(ready channels) with epoll/kqueue, not O(registered).

#### Frequently confused with
Non-blocking (readiness-based) vs. asynchronous (completion-based) I/O.

#### Important facts to remember
- Selectors provide scalability, not per-operation speed.
- Always remove processed selection keys.
- Virtual threads reduce the need for this model.

---

### 9.11 Serialization

#### Definition
Java's built-in mechanism for converting object graphs to bytes via `Serializable`, `ObjectOutputStream`, and `ObjectInputStream`.

#### Why it exists
To persist and transmit objects without writing conversion code — though the design has proven fundamentally problematic.

#### Interview explanation
Explain the mechanism, then be clear that it's effectively deprecated in practice. Referencing JEP 290 filtering and the gadget-chain attack class demonstrates security awareness that interviewers value highly.

#### Syntax
```java
class Data implements Serializable {
    private static final long serialVersionUID = 1L;
    private transient String secret;      // excluded
}
```

#### Example
```java
// If you must deserialize, filter aggressively
ObjectInputFilter filter = ObjectInputFilter.Config.createFilter(
    "com.example.model.*;java.base/*;!*");    // allow-list, reject everything else
ois.setObjectInputFilter(filter);
```

#### Common interview questions
- "What is `serialVersionUID` and why declare it explicitly?" (A version identifier; if omitted, the JVM derives it from class structure, so any structural change breaks deserialization of existing data.)
- "What does `transient` do?" (Excludes a field from serialization — used for secrets, caches, and non-serializable references.)
- "Why is Java serialization considered dangerous?" (Deserialization instantiates arbitrary classes and runs code during reconstruction; crafted input can chain existing classes into remote code execution.)

#### Follow-up questions
- "How would you safely persist objects today?" (JSON via Jackson, Protocol Buffers, or Avro — data-only formats that don't instantiate arbitrary types or execute reconstruction logic.)
- "What is a gadget chain?" (A sequence of ordinary library classes whose deserialization side effects combine into an exploit — the reason libraries on the classpath expand your attack surface even if you never use them.)

#### Edge cases
- `readObject`/`writeObject` allow custom serialization logic, and `readResolve` can substitute instances — commonly used to preserve singleton identity.
- Serialization bypasses constructors entirely, so constructor invariants aren't enforced on deserialized objects.

#### Common mistakes
- Deserializing untrusted input without a filter.
- Omitting `serialVersionUID`, causing version incompatibility on any class change.

#### Comparisons

| | Java serialization | JSON | Protobuf |
|---|---|---|---|
| Cross-language | No | Yes | Yes |
| Human readable | No | Yes | No |
| Security risk | High | Low | Low |
| Schema evolution | Brittle | Flexible | Designed for it |

#### Complexity
Proportional to object graph size; typically slower and larger than modern alternatives.

#### Frequently confused with
Serialization (the Java mechanism) vs. marshalling to JSON — the security profiles are entirely different.

#### Important facts to remember
- Deserialization bypasses constructors.
- Gadget chains make classpath contents part of your attack surface.
- Prefer JSON or Protobuf for anything new.

---

### 9.12 Resource Management

#### Definition
Ensuring OS-level resources — file descriptors, sockets, channels — are released deterministically, primarily via try-with-resources.

#### Why it exists
Descriptors are a limited per-process OS resource; leaking them eventually breaks all I/O in the process.

#### Interview explanation
Emphasize that GC does not manage descriptors. Then name the specific NIO.2 stream methods that hold handles — that specificity is what distinguishes practical experience.

#### Syntax
```java
try (InputStream in = Files.newInputStream(src);
     OutputStream out = Files.newOutputStream(dst)) {
    in.transferTo(out);
}
```

#### Example
```java
// Leak - the stream holds a descriptor that is never released
Files.lines(path).forEach(this::process);

// Correct
try (Stream<String> lines = Files.lines(path)) {
    lines.forEach(this::process);
}
```

#### Common interview questions
- "Why must streams and files be closed explicitly?" (They hold OS file descriptors, which are a limited resource GC does not manage promptly or reliably.)
- "What error indicates descriptor exhaustion?" (`java.io.IOException: Too many open files`, typically surfacing in code unrelated to the leak.)
- "Which `Files` methods return resources needing closure?" (`lines`, `walk`, `list`, `find` — all return streams holding open handles.)

#### Follow-up questions
- "Doesn't the garbage collector eventually close files?" (Some classes had finalizers doing this, but finalization is deprecated, unpredictable, and may never run. Under low memory pressure GC may not run for a long time while descriptors are exhausted.)
- "What happens if both the body and `close()` throw?" (The body's exception propagates; the close exception is attached as suppressed and retrievable via `getSuppressed()` — see Group 5.)

#### Edge cases
- Declaring a resource outside the try-with-resources header means it isn't managed — it must be in the header (or be effectively final and referenced there, Java 9+).
- Descriptor limits (`ulimit -n`) are often far lower than expected in containers.

#### Common mistakes
- Chaining directly on `Files.lines()` without try-with-resources.
- Assuming GC handles descriptor cleanup.

#### Comparisons

| | Manual `finally` | try-with-resources |
|---|---|---|
| Verbosity | High | Low |
| Close order | Manual | Reverse of declaration |
| Original exception | Can be masked | Preserved, close suppressed |

#### Complexity
Not applicable.

#### Frequently confused with
Heap memory (GC-managed) vs. file descriptors (OS-managed, not GC's concern).

#### Important facts to remember
- GC does not reliably release file descriptors.
- `Files.lines`/`walk`/`list`/`find` must be closed.
- try-with-resources preserves the primary exception.

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

#### Definition
A six-month feature release cadence with LTS designations roughly every two years, plus a preview mechanism for features still subject to change.

#### Why it exists
The previous multi-year cycle delayed features badly and encouraged risky big-bang releases; frequent smaller releases ship value sooner with less risk per release.

#### Interview explanation
Knowing which features landed in which LTS is genuinely useful, because interviewers often ask what's available on the version their team runs. Also distinguish preview features from ordinary ones — that distinction shows practical awareness.

#### Syntax
```bash
javac --release 21 --enable-preview Main.java
java --enable-preview Main
```

#### Example
```java
// Available by LTS
// Java 11: var, HttpClient, String.isBlank
// Java 17: records, sealed classes, instanceof patterns, text blocks
// Java 21: virtual threads, switch patterns, record patterns, sequenced collections
```

#### Common interview questions
- "What are the recent LTS versions?" (8, 11, 17, 21.)
- "What's the difference between LTS and non-LTS releases?" (Support duration, not stability — non-LTS releases are production-quality but supported only until the next release.)
- "What is a preview feature?" (A finalized-design-pending feature requiring `--enable-preview`, which may change or be removed in later versions.)

#### Follow-up questions
- "Why do organizations stay on Java 8 or 11?" (Migration cost — mainly from the module system's stricter encapsulation, removed internal APIs, and third-party library compatibility. The jump from 8 to 11 is the hardest; later upgrades are typically much smoother.)
- "Should you use preview features in production?" (Generally no — they can change between releases, forcing rewrites. Use them to evaluate and prepare, not to ship.)

#### Edge cases
- Code compiled with `--enable-preview` requires the *same* version at runtime; preview class files are version-locked deliberately.
- Incubator modules (`jdk.incubator.*`) are a separate mechanism from preview features and carry similar instability caveats.

#### Common mistakes
- Assuming a feature exists on the deployed version without checking.
- Shipping preview features to production.

#### Comparisons

| | LTS | Non-LTS | Preview feature |
|---|---|---|---|
| Production quality | Yes | Yes | Design not final |
| Support window | Years | ~6 months | N/A |
| Requires flag | No | No | Yes |

#### Complexity
Not applicable.

#### Frequently confused with
Non-LTS releases (stable) vs. preview features (explicitly unstable) — very different risk profiles.

#### Important facts to remember
- LTS: 8, 11, 17, 21.
- Preview features need `--enable-preview` at both compile and run time.
- Non-LTS releases are production-quality, just short-supported.

---

### 10.2 var and Local Variable Type Inference

#### Definition
A reserved type name (Java 10) allowing local variable declarations without an explicit type, inferred by the compiler from the initializer.

#### Why it exists
To reduce redundancy where the type is already stated on the right-hand side, particularly with verbose generic types.

#### Interview explanation
State immediately that `var` is static typing with inference, not dynamic typing — this is the point interviewers probe. Then mention the concrete-versus-interface inference subtlety, which fewer candidates know.

#### Syntax
```java
var list = new ArrayList<String>();
for (var entry : map.entrySet()) { }
try (var in = Files.newInputStream(path)) { }
```

#### Example
```java
var list = new ArrayList<String>();   // inferred ArrayList<String>, NOT List<String>
// list = new LinkedList<>();          // won't compile - type is fixed as ArrayList
```

#### Common interview questions
- "Does `var` make Java dynamically typed?" (No — the type is inferred at compile time and fixed thereafter.)
- "Where can `var` be used?" (Local variables with initializers, for-loop variables, try-with-resources, and lambda parameters since Java 11.)
- "Where can it not be used?" (Fields, method parameters, return types, or without an initializer.)

#### Follow-up questions
- "What type does `var list = new ArrayList<String>()` infer?" (`ArrayList<String>` — the concrete type, not the interface. This works against programming-to-the-interface, which is one argument for explicit types in API-adjacent code.)
- "Why is `var x = null` illegal?" (`null` has the null type, which isn't denotable — there's nothing meaningful to infer.)

#### Edge cases
- `var` with an anonymous class infers the non-denotable anonymous type, allowing access to members declared only in that anonymous class — a type you cannot write explicitly.
- `var` in a lambda parameter exists mainly to allow annotations on the parameter.

#### Common mistakes
- Using `var` where the initializer doesn't reveal the type, harming readability.
- Expecting interface types to be inferred.

#### Comparisons

| | Explicit type | `var` |
|---|---|---|
| Type safety | Same | Same |
| Determined at | Compile time | Compile time |
| Inferred type | As written | Concrete type of initializer |
| Readability | Explicit | Depends on the initializer |

#### Complexity
No runtime effect whatsoever.

#### Frequently confused with
`var` in Java (static, inferred) vs. `var` in JavaScript (dynamic).

#### Important facts to remember
- `var` is compile-time inference, not dynamic typing.
- It infers the concrete type, not the interface.
- Not permitted for fields, parameters, or return types.

---

### 10.3 Text Blocks

#### Definition
Multi-line string literals delimited by `"""` (Java 15), which preserve line structure and strip incidental indentation.

#### Why it exists
Embedded SQL, JSON, HTML, and XML required concatenation and escaped quotes, producing unreadable and error-prone literals.

#### Interview explanation
The incidental-whitespace algorithm is the substantive detail — the closing delimiter participates in determining the common indent, which is how you control the left margin.

#### Syntax
```java
String s = """
    content
    """;
```

#### Example
```java
String query = """
        SELECT u.id, u.name
        FROM users u
        WHERE u.active = true
        """;
// The 8-space common indentation is stripped
```

#### Common interview questions
- "How does a text block handle indentation?" (It computes the minimum indentation across all non-blank lines *and* the closing delimiter, then strips that amount from each line.)
- "Do you still need to escape quotes?" (Not for single or double quotes; only for a sequence of three consecutive double quotes.)
- "What does a trailing `\` do in a text block?" (Suppresses the line terminator, joining that line with the next.)

#### Follow-up questions
- "How do you preserve a trailing space?" (`\s`, which is an escape for a space that also prevents trailing-whitespace stripping on that line.)
- "Does the closing delimiter's position matter?" (Yes — placing it further left reduces the stripped indentation, so content retains more leading whitespace. It's the margin control.)

#### Edge cases
- Trailing whitespace is stripped from every line unless `\s` is used, which can matter for fixed-width formats.
- Line terminators are normalized to `\n` regardless of the source file's line endings, so text blocks are consistent across platforms.

#### Common mistakes
- Placing the closing delimiter at column zero, retaining all source indentation.
- Assuming trailing spaces are preserved.

#### Comparisons

| | Concatenation | Text block |
|---|---|---|
| Readability | Poor | Good |
| Quote escaping | Required | Not required |
| Line endings | Manual `\n` | Implicit, normalized |
| Indentation control | Manual | Closing delimiter position |

#### Complexity
Compile-time only; produces an ordinary `String`.

#### Frequently confused with
Incidental whitespace (stripped) vs. essential whitespace (preserved).

#### Important facts to remember
- The closing delimiter participates in indentation calculation.
- Trailing whitespace is stripped unless `\s` is used.
- Line terminators are normalized to `\n`.

---

### 10.4 Records

#### Definition
A restricted class form (Java 16) declaring a transparent carrier for an immutable set of components, with constructor, accessors, `equals`, `hashCode`, and `toString` generated automatically.

#### Why it exists
Data-carrier classes required substantial boilerplate whose hand-written `equals`/`hashCode` frequently violated the contract described in Group 2.

#### Interview explanation
Volunteer the shallow-immutability caveat unprompted — it's the detail that separates people who've used records from those who've read about them. Also be ready on why records don't suit JPA entities.

#### Syntax
```java
record Point(int x, int y) { }
record Range(int lo, int hi) {
    Range { if (lo > hi) throw new IllegalArgumentException(); }   // compact constructor
}
```

#### Example
```java
record Team(String name, List<Player> players) {
    Team {
        players = List.copyOf(players);   // defensive copy for real immutability
    }
}
```

#### Common interview questions
- "What does a record generate?" (Canonical constructor, per-component accessors, `equals`, `hashCode`, `toString`.)
- "Can a record extend a class?" (No — records implicitly extend `java.lang.Record` and are final. They can implement interfaces.)
- "Are records immutable?" (Shallowly — the fields are final, but referenced mutable objects can still be modified.)

#### Follow-up questions
- "What is a compact constructor and when is it useful?" (A constructor without a parameter list that runs before field assignment — used for validation and normalization, including defensive copying.)
- "Why are records unsuitable as JPA entities?" (Hibernate requires a no-arg constructor and mutable fields for proxying and dirty checking; records provide neither. Use them as DTOs or query projections instead.)

#### Edge cases
- Accessors are named after components (`x()`), not JavaBean style (`getX()`), which some older frameworks expecting bean conventions can't bind to.
- A record can declare static fields but not additional instance fields — all state must be in the components.

#### Common mistakes
- Assuming deep immutability without defensive copying.
- Attempting to use records as JPA entities.

#### Comparisons

| | Record | Class | Lombok `@Value` |
|---|---|---|---|
| Boilerplate | None | High | None |
| Language feature | Yes | Yes | Annotation processor |
| Inheritance | No | Yes | Limited |
| Accessor style | `x()` | `getX()` | `getX()` |

#### Complexity
Not applicable.

#### Frequently confused with
Shallow vs. deep immutability in records.

#### Important facts to remember
- Records are implicitly final and cannot extend a class.
- Immutability is shallow — copy mutable components defensively.
- Accessors are `x()`, not `getX()`.

---

### 10.5 Sealed Classes

#### Definition
Classes and interfaces (Java 17) that restrict which types may extend or implement them via a `permits` clause.

#### Why it exists
To model closed domains explicitly and enable compile-time exhaustiveness checking in pattern-matching switches.

#### Interview explanation
Emphasize exhaustiveness as the real payoff, not extension prevention. The compile-time guarantee that adding a subtype breaks every incomplete switch is the practical value.

#### Syntax
```java
public sealed interface Result permits Success, Failure { }
public record Success(String value) implements Result { }
public record Failure(Exception error) implements Result { }
```

#### Example
```java
// No default needed - the compiler knows the set is complete
String handle(Result r) {
    return switch (r) {
        case Success s -> "ok: " + s.value();
        case Failure f -> "error: " + f.error().getMessage();
    };
}
```

#### Common interview questions
- "What problem do sealed classes solve?" (Modeling a closed set of subtypes, enabling exhaustiveness checking.)
- "What must permitted subtypes declare?" (Each must be `final`, `sealed`, or `non-sealed`.)
- "How do sealed classes differ from `final`?" (`final` prevents all extension; sealed permits a specific known set.)

#### Follow-up questions
- "Where must permitted subtypes live?" (In the same module, or the same package if in an unnamed module — which is why sealing doesn't suit extensible plugin APIs.)
- "What does `non-sealed` mean?" (It reopens the hierarchy — that subtype may be extended by anyone, deliberately breaking the closed set below that point.)

#### Edge cases
- The `permits` clause can be omitted if all subtypes are declared in the same source file, which the compiler then infers.
- Sealed types combined with records form Java's algebraic data types, mirroring sum types in functional languages.

#### Common mistakes
- Sealing an interface intended for third-party implementation.
- Forgetting that each permitted subtype needs an explicit modifier.

#### Comparisons

| | `final` | `sealed` | Open |
|---|---|---|---|
| Extension | None | Permitted list only | Anyone |
| Exhaustiveness checking | N/A | Yes | No |
| Use for | Value types | Closed domains | Extensible APIs |

#### Complexity
Not applicable.

#### Frequently confused with
Sealed (closed set, enables exhaustiveness) vs. final (no subtypes at all).

#### Important facts to remember
- Permitted subtypes must be `final`, `sealed`, or `non-sealed`.
- Subtypes must be in the same module or package.
- Sealed plus records gives algebraic data types.

---

### 10.6 Pattern Matching for instanceof

#### Definition
An extension of `instanceof` (Java 16) that binds a typed variable when the test succeeds, eliminating the redundant cast.

#### Why it exists
The test-then-cast idiom repeated the type name and introduced a cast that could theoretically fail despite the guard.

#### Interview explanation
Flow scoping is the substantive point — showing that the binding survives past a negated early return demonstrates understanding beyond the basic syntax.

#### Syntax
```java
if (obj instanceof String s) { }
if (obj instanceof String s && s.length() > 3) { }
if (!(obj instanceof String s)) return;
```

#### Example
```java
@Override
public boolean equals(Object o) {
    return o instanceof Point p && p.x == x && p.y == y;   // whole equals in one line
}
```

#### Common interview questions
- "What does pattern matching for `instanceof` do?" (Combines the type test with a binding, removing the explicit cast.)
- "What is flow scoping?" (The pattern variable is in scope wherever the compiler can prove the test succeeded — including after a negated test with an early return.)
- "Can you combine the binding with additional conditions?" (Yes — the variable is usable later in the same `&&` chain.)

#### Follow-up questions
- "Why is the binding not in scope after `if (obj instanceof String s) { }` with an empty body?" (Because after that block, the compiler can't prove the test succeeded — control may have arrived either way.)
- "How does this improve `equals()` implementations?" (It collapses the null check, type check, cast, and comparison into a single expression, since `instanceof` is false for null.)

#### Edge cases
- `instanceof` returns false for `null`, so the pattern form provides an implicit null check — useful in `equals`.
- Attempting to reassign a pattern variable is legal but discouraged, as it defeats the compiler's flow analysis.

#### Common mistakes
- Long `instanceof` chains where polymorphism or a sealed hierarchy would be cleaner.
- Assuming the binding is scoped only to the if-block.

#### Comparisons

| | Traditional | Pattern matching |
|---|---|---|
| Lines | 3 (test, cast, use) | 1 |
| Type repeated | Twice | Once |
| Cast failure possible | Theoretically | No |

#### Complexity
Not applicable.

#### Frequently confused with
Scope of the pattern variable — flow scoping is broader than block scoping.

#### Important facts to remember
- `instanceof` is false for null, giving an implicit null check.
- Flow scoping extends past negated tests with early returns.
- The binding is usable within the same condition expression.

---

### 10.7 Switch Expressions and Pattern Matching for switch

#### Definition
Switch expressions (Java 14) return values using arrow syntax without fall-through; pattern matching for switch (Java 21) allows matching on types, with guards and record deconstruction.

#### Why it exists
The traditional switch was fall-through-prone, statement-only, and limited to constants — inadequate for type-based dispatch.

#### Interview explanation
Cover both generations. The exhaustiveness interaction with sealed types is the highest-value point, since it converts a runtime concern into a compile-time guarantee.

#### Syntax
```java
var result = switch (x) {
    case A -> "a";
    case B -> { yield compute(); }
    default -> "other";
};

switch (shape) {
    case Circle c when c.radius() > 10 -> big(c);
    case Circle c -> small(c);
    case Square(double side) -> square(side);
}
```

#### Example
```java
// Record pattern with nesting
static String describe(Object o) {
    return switch (o) {
        case Point(int x, int y) when x == y -> "diagonal point";
        case Point(int x, int y) -> "point " + x + "," + y;
        case null -> "null";                    // explicit null case
        default -> "unknown";
    };
}
```

#### Common interview questions
- "Difference between a switch statement and a switch expression?" (The expression returns a value, uses arrow syntax without fall-through, and must be exhaustive.)
- "What does `yield` do?" (Returns a value from a block-bodied case in a switch expression.)
- "How does switch handle null?" (Traditional switch throws `NullPointerException`; a pattern switch may declare `case null` explicitly, and still throws if it doesn't.)

#### Follow-up questions
- "When is `default` unnecessary?" (When the selector is an enum covering all constants, or a sealed type covering all permitted subtypes — the compiler verifies exhaustiveness.)
- "Does case order matter with guards?" (Yes — the first match wins, so a general case placed before a guarded specific case makes the latter unreachable.)

#### Edge cases
- Adding a subtype to a sealed hierarchy breaks compilation of every non-exhaustive switch over it, which is the intended safety benefit.
- Record patterns nest arbitrarily, deconstructing nested structures in one expression.

#### Common mistakes
- Ordering a broad case before a narrower guarded one.
- Assuming a pattern switch tolerates null without an explicit `case null`.

#### Comparisons

| | Switch statement | Switch expression |
|---|---|---|
| Returns value | No | Yes |
| Fall-through | Yes without `break` | Never with `->` |
| Exhaustiveness required | No | Yes |
| Patterns supported | Java 21 | Java 21 |

#### Complexity
Typically compiles to efficient dispatch; pattern matching adds type checks in order.

#### Frequently confused with
Pattern matching vs. polymorphism — appropriate in different situations, not interchangeable.

#### Important facts to remember
- Switch expressions must be exhaustive.
- Case order matters when guards are involved.
- Sealed types plus switch gives compile-time exhaustiveness.

---

### 10.8 Enhanced Enums and Utility Methods

#### Definition
The accumulated convenience additions across Java 9–21: collection factories, `String` methods, `Optional` additions, and `Stream.toList()`.

#### Why it exists
To cover routine operations that previously required third-party libraries or verbose workarounds.

#### Interview explanation
Knowing which version introduced what is genuinely useful, since it determines what's available on a given codebase. The `strip()` versus `trim()` distinction is a common specific question.

#### Syntax
```java
List.of(...)  Map.of(...)  Set.of(...)  List.copyOf(...)
str.isBlank()  str.strip()  str.lines()  str.repeat(n)  str.formatted(args)
opt.ifPresentOrElse(a, b)  opt.or(supplier)  opt.stream()  opt.isEmpty()
stream.toList()
```

#### Example
```java
"  text  ".trim();     // ASCII whitespace only
"\u00A0text\u00A0".strip();   // handles non-breaking space correctly
```

#### Common interview questions
- "Difference between `trim()` and `strip()`?" (`trim()` removes characters at or below U+0020; `strip()` is Unicode-aware via `Character.isWhitespace`.)
- "Is `List.of()` mutable?" (No — immutable, and it rejects null elements.)
- "Difference between `Stream.toList()` and `Collectors.toList()`?" (`toList()` returns an unmodifiable list; the collector returns a mutable `ArrayList`.)

#### Follow-up questions
- "How does `List.of()` differ from `Arrays.asList()`?" (`Arrays.asList` returns a fixed-size list backed by the array — `set()` works, `add()` doesn't, and it permits nulls. `List.of()` is fully immutable and rejects nulls.)
- "What are sequenced collections (Java 21)?" (A unified interface hierarchy — `SequencedCollection`, `SequencedSet`, `SequencedMap` — giving ordered collections consistent `getFirst`, `getLast`, and `reversed()` methods, which the framework previously lacked.)

#### Edge cases
- `Map.of()` accepts at most 10 pairs; beyond that use `Map.ofEntries()`.
- `List.of()` throws `NullPointerException` on null elements, unlike `Arrays.asList()`.

#### Common mistakes
- Attempting to mutate a `List.of()` result.
- Using `trim()` on input that may contain Unicode whitespace.

#### Comparisons

| | `Arrays.asList` | `List.of` | `Collections.unmodifiableList` |
|---|---|---|---|
| Mutable | Fixed-size, `set` allowed | No | View of a mutable list |
| Nulls | Allowed | Rejected | Depends on source |
| Independent copy | No (array-backed) | Yes | No (live view) |

#### Complexity
Factory methods are O(n) in element count.

#### Frequently confused with
`Arrays.asList` vs `List.of` — different mutability and null semantics.

#### Important facts to remember
- `strip()` is Unicode-aware; `trim()` is not.
- `List.of()` is immutable and null-hostile.
- Sequenced collections (Java 21) unify first/last/reversed access.

---

### 10.9 The HTTP Client

#### Definition
The `java.net.http` client (Java 11) supporting HTTP/1.1, HTTP/2, WebSocket, and both synchronous and asynchronous request models.

#### Why it exists
`HttpURLConnection` was awkward, lacked HTTP/2, and had no async support, so nearly every project added a third-party HTTP library.

#### Interview explanation
The point most worth raising unprompted is that both timeouts default to infinite — which ties directly to the thread-exhaustion failure mode covered in Group 7.

#### Syntax
```java
HttpClient client = HttpClient.newBuilder()
    .connectTimeout(Duration.ofSeconds(5)).build();

HttpRequest req = HttpRequest.newBuilder(URI.create(url))
    .timeout(Duration.ofSeconds(10))
    .GET().build();

client.send(req, HttpResponse.BodyHandlers.ofString());
client.sendAsync(req, HttpResponse.BodyHandlers.ofString());
```

#### Example
```java
// Async fan-out, composing with CompletableFuture from Group 7
List<CompletableFuture<String>> futures = urls.stream()
    .map(u -> client.sendAsync(request(u), BodyHandlers.ofString())
                    .thenApply(HttpResponse::body))
    .toList();
```

#### Common interview questions
- "What HTTP client is built into modern Java?" (`java.net.http.HttpClient`, added in Java 11.)
- "Should you create an `HttpClient` per request?" (No — reuse a single instance; it holds a connection pool and multiplexes HTTP/2 connections.)
- "What are the two timeouts, and what do they default to?" (Connect timeout on the client and request timeout on the request; both default to infinite.)

#### Follow-up questions
- "How do you handle retries and circuit breaking?" (Not built in — use Resilience4j or a higher-level client. This is the main reason teams still choose OkHttp or Spring's `RestClient`/`WebClient`.)
- "Which executor do async requests use?" (The client's executor, defaulting to a cached thread pool. Supply your own for control over sizing and naming.)

#### Edge cases
- `HttpClient` is immutable and thread-safe once built, so a single instance is safe to share across the application.
- HTTP/2 multiplexes many requests over one connection, so connection-count-based tuning intuitions from HTTP/1.1 don't transfer.

#### Common mistakes
- Creating a client per request, discarding pooling.
- Omitting timeouts and hanging indefinitely on an unresponsive server.

#### Comparisons

| | `HttpURLConnection` | `HttpClient` | OkHttp / WebClient |
|---|---|---|---|
| HTTP/2 | No | Yes | Yes |
| Async | No | Yes | Yes |
| Retries/interceptors | No | No | Yes |
| Dependency | None | None | External |

#### Complexity
Not applicable.

#### Frequently confused with
Connect timeout (establishing the connection) vs. request timeout (the whole exchange).

#### Important facts to remember
- Reuse one `HttpClient`; it's immutable and thread-safe.
- Both timeouts default to infinite — always set them.
- No built-in retry or circuit breaking.

---

### 10.10 Structured Concurrency and Scoped Values

#### Definition
`StructuredTaskScope` binds the lifetime of concurrent subtasks to a lexical block with automatic cancellation and error propagation; `ScopedValue` shares immutable data with those subtasks.

#### Why it exists
Executor-spawned tasks have no relationship to their caller — they can outlive it, fail silently, or continue after siblings fail. Structure makes concurrent task lifetimes explicit and bounded.

#### Interview explanation
Frame it as try-with-resources for concurrency: everything forked inside the block is guaranteed finished before the block exits. Also note the preview status honestly, since the API has changed across rounds.

#### Syntax
```java
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    var a = scope.fork(() -> taskA());
    var b = scope.fork(() -> taskB());
    scope.join();
    scope.throwIfFailed();
    return combine(a.get(), b.get());
}
```

#### Example
```java
final static ScopedValue<RequestContext> CONTEXT = ScopedValue.newInstance();

ScopedValue.where(CONTEXT, ctx).run(() -> {
    handle();          // CONTEXT visible here and in structured subtasks
});                    // automatically unbound
```

#### Common interview questions
- "What problem does structured concurrency solve?" (Unbounded subtask lifetimes, silent failures, and lack of automatic cancellation when a sibling fails or the caller aborts.)
- "How does `ScopedValue` differ from `ThreadLocal`?" (Immutable, automatically scoped and unbound, inherited by structured subtasks, and far cheaper at virtual-thread scale — avoiding the leak and cleanup issues of `ThreadLocal` in pooled or high-count-thread environments.)
- "What is `ShutdownOnFailure`?" (A scope policy cancelling all remaining subtasks as soon as one fails.)

#### Follow-up questions
- "When is structured concurrency the wrong fit?" (For long-lived background workers or queue consumers with no parent-child lifetime relationship — executors remain appropriate there.)
- "Why does this matter more with virtual threads?" (Virtual threads make fan-out cheap enough to do everywhere, so unmanaged task lifetimes and per-thread state become a much larger correctness and memory concern.)

#### Edge cases
- `ShutdownOnSuccess` implements the opposite policy — take the first successful result and cancel the rest, useful for redundant requests to multiple providers.
- The API has changed across preview rounds; verify signatures against your target JDK rather than older documentation.

#### Common mistakes
- Using preview APIs in production without accounting for changes on upgrade.
- Treating it as a general executor replacement.

#### Comparisons

| | ExecutorService | StructuredTaskScope |
|---|---|---|
| Task lifetime | Independent | Bounded by the block |
| Failure handling | Manual via `Future` | Automatic propagation |
| Cancellation | Manual | Automatic for siblings |
| Best for | Long-lived work | Request-scoped fan-out |

#### Complexity
Not applicable.

#### Frequently confused with
Structured concurrency (lifetime scoping) vs. virtual threads (cheap threads) — complementary, not the same.

#### Important facts to remember
- Subtasks are guaranteed complete when the scope closes.
- `ScopedValue` is the `ThreadLocal` replacement for virtual-thread-scale code.
- Preview status means the API may change — check your JDK.

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

#### Definition
The API allowing a program to inspect and manipulate classes, fields, methods, and annotations at runtime, using metadata retained by the class loader.

#### Why it exists
Frameworks must operate on classes written after the framework itself, which requires discovering structure at runtime rather than compile time.

#### Interview explanation
Connect it to frameworks the interviewer knows — Spring, Hibernate, Jackson, JUnit all depend on it. Then be accurate about cost: lookup is expensive, cached invocation much less so.

#### Syntax
```java
Class<?> c = obj.getClass();
Method m = c.getMethod("name", String.class);
m.invoke(obj, "arg");
```

#### Example
```java
// How JUnit finds tests, in essence
for (Method m : testClass.getDeclaredMethods()) {
    if (m.isAnnotationPresent(Test.class)) {
        m.invoke(testClass.getDeclaredConstructor().newInstance());
    }
}
```

#### Common interview questions
- "What is reflection and why do frameworks need it?" (Runtime inspection and invocation; frameworks must work with classes they've never seen.)
- "What are reflection's downsides?" (Performance cost, no compile-time checking, breaks refactoring and static analysis, can violate encapsulation.)
- "Name frameworks that rely on it." (Spring, Hibernate, Jackson, JUnit, Mockito.)

#### Follow-up questions
- "Is reflection slow?" (Lookup is genuinely expensive; cached `Method` invocation is much closer to direct after JIT warm-up. The larger costs are lost inlining and the lookup itself, not the call.)
- "How would you make reflective code faster?" (Cache `Method`/`Field` objects, or move to `MethodHandle` stored in a `static final` field, which the JIT can inline.)

#### Edge cases
- Reflection sees synthetic members — bridge methods from erasure (Group 4), lambda bodies, inner-class references — which usually need filtering.
- Security managers historically restricted reflection; that mechanism is deprecated, with the module system now providing encapsulation instead.

#### Common mistakes
- Calling `getMethod()` inside a loop rather than caching the result.
- Using reflection where an interface or a factory would suffice.

#### Comparisons

| | Direct call | Reflection | MethodHandle |
|---|---|---|---|
| Compile-time checked | Yes | No | Partially |
| Performance | Fastest | Slower | Near-direct |
| Refactoring safe | Yes | No | No |

#### Complexity
`getMethod` performs a search over the type hierarchy; `invoke` is a constant-factor overhead on the call.

#### Frequently confused with
Reflection (runtime introspection) vs. annotation processing (compile-time generation).

#### Important facts to remember
- Cache `Method` and `Field` objects; lookup is the expensive part.
- Reflection defeats compile-time checking and refactoring tools.
- It's the foundation of essentially every major Java framework.

---

### 11.2 The Class Object

#### Definition
The runtime representation of a type, obtained via a class literal, an instance, or `Class.forName()`, and serving as the entry point for all reflection.

#### Why it exists
Reflection requires a handle on a type's metadata; `Class` is that handle.

#### Interview explanation
The detail worth adding is that `Class.forName()` initializes the class by default — running static initializers, which can have side effects. This is exactly how JDBC drivers registered themselves historically.

#### Syntax
```java
String.class
obj.getClass()
Class.forName("com.example.Foo")
Class.forName("com.example.Foo", false, loader)   // load without initializing
```

#### Example
```java
Class<?> c = List.class;
c.getName();            // "java.util.List"
c.isInterface();        // true
c.isRecord();           // false - Java 16+ query
```

#### Common interview questions
- "How do you obtain a `Class` object?" (Class literal, `getClass()`, or `Class.forName()`.)
- "Does `Class.forName()` initialize the class?" (Yes by default — static initializers run. The three-argument form can defer this.)
- "What's the difference between `getName()` and `getSimpleName()`?" (Fully qualified binary name versus the short name; arrays and nested classes have distinctive binary forms.)

#### Follow-up questions
- "How does `Class.forName` relate to the old JDBC driver registration idiom?" (Loading the driver class triggered its static initializer, which registered it with `DriverManager`. Since JDBC 4.0, `ServiceLoader` handles this automatically and the explicit call is unnecessary.)
- "Can you recover generic type arguments from a `Class`?" (Not from a plain instance, but declaration-site information survives — `getGenericSuperclass()` recovers it, which is how Jackson's `TypeReference` works, as covered in Group 4.)

#### Edge cases
- `int.class` and `Integer.class` are different `Class` objects; primitives have their own.
- `getName()` for an `int[]` is `[I` and for a nested class is `Outer$Inner` — use `getCanonicalName()` for source form.

#### Common mistakes
- Comparing `Class` objects across class loaders and expecting equality.
- Assuming `getName()` returns the source-form name.

#### Comparisons

| Approach | Checked at compile time | Fails how |
|---|---|---|
| `String.class` | Yes | Compile error |
| `obj.getClass()` | Yes | NPE if obj is null |
| `Class.forName("...")` | No | `ClassNotFoundException` |

#### Complexity
`Class.forName` may trigger loading and initialization — potentially expensive on first call.

#### Frequently confused with
`getName()` (binary name) vs `getCanonicalName()` (source name).

#### Important facts to remember
- `Class.forName` initializes by default.
- Primitives have distinct `Class` objects from their wrappers.
- Class identity includes the class loader.

---

### 11.3 Inspecting Fields, Methods, and Constructors

#### Definition
Reflection APIs returning `Field`, `Method`, and `Constructor` objects describing a class's members.

#### Why it exists
Frameworks need structural knowledge to map, serialize, inject, and validate arbitrary types.

#### Interview explanation
The `get*` versus `getDeclared*` distinction is the highest-frequency question here — and knowing that neither alone gives complete coverage (you must walk the hierarchy for private inherited fields) is what separates a precise answer.

#### Syntax
```java
c.getFields();            // public, including inherited
c.getDeclaredFields();    // all declared here, excluding inherited
c.getMethods();           // public, including inherited
c.getDeclaredMethods();   // all declared here
```

#### Example
```java
// Complete field set requires walking the hierarchy
for (Class<?> k = type; k != null && k != Object.class; k = k.getSuperclass()) {
    for (Field f : k.getDeclaredFields()) {
        if (!f.isSynthetic()) process(f);
    }
}
```

#### Common interview questions
- "Difference between `getFields()` and `getDeclaredFields()`?" (Public including inherited, versus all declared in this class excluding inherited.)
- "How do you get private fields from a superclass?" (Walk up via `getSuperclass()`, calling `getDeclaredFields()` at each level — neither single call covers it.)
- "How do you check whether a field is static or final?" (`Modifier.isStatic(field.getModifiers())`.)

#### Follow-up questions
- "Is field order guaranteed?" (No — the JLS explicitly leaves it unspecified, and it can differ across JVM versions. Never rely on it for ordered serialization.)
- "What are synthetic members and why do they appear?" (Compiler-generated: bridge methods from erasure, lambda bodies, `this$0` in inner classes. Filter with `isSynthetic()`.)

#### Edge cases
- Records expose components via `getRecordComponents()`, which is more precise than reflecting over fields.
- Bridge methods appear as duplicate-looking methods with different signatures — filter with `isBridge()`.

#### Common mistakes
- Expecting `getDeclaredFields()` to include inherited members.
- Relying on declaration order.

#### Comparisons

| | `getX()` | `getDeclaredX()` |
|---|---|---|
| Visibility | Public only | All modifiers |
| Inherited | Included | Excluded |
| Typical use | Public API inspection | Framework field mapping |

#### Complexity
`getDeclaredFields()` is O(members); full hierarchy traversal is O(total members across the chain).

#### Frequently confused with
The two axes involved — visibility and inheritance — which the naming does not make obvious.

#### Important facts to remember
- Neither call alone gives all fields including private inherited ones.
- Field order is unspecified.
- Filter synthetic and bridge members.

---

### 11.4 Creating Objects and Invoking Methods Reflectively

#### Definition
Instantiating classes via `Constructor.newInstance()` and calling methods via `Method.invoke()`, with targets resolved at runtime.

#### Why it exists
Frameworks must construct and call user classes whose names appear only in configuration or annotations.

#### Interview explanation
Mention that `Class.newInstance()` is deprecated and why — it propagated constructor exceptions without wrapping, defeating checked-exception analysis. That's a specific, verifiable detail.

#### Syntax
```java
clazz.getDeclaredConstructor().newInstance();
clazz.getDeclaredConstructor(String.class).newInstance("x");
method.invoke(instance, args);
method.invoke(null, args);        // static method
```

#### Example
```java
try {
    method.invoke(target, args);
} catch (InvocationTargetException e) {
    throw e.getCause();     // unwrap - the wrapper adds nothing useful
}
```

#### Common interview questions
- "Why is `Class.newInstance()` deprecated?" (It propagated constructor exceptions without wrapping, bypassing the compiler's checked-exception analysis. Use `getDeclaredConstructor().newInstance()`.)
- "What is `InvocationTargetException`?" (A wrapper around whatever the invoked method threw — the real exception is `getCause()`.)
- "How do you invoke a static method reflectively?" (Pass `null` as the instance argument.)

#### Follow-up questions
- "How does overload resolution work reflectively?" (It doesn't — you must specify exact parameter types when looking up the `Method`. The compiler's overload selection is unavailable at runtime.)
- "How are primitives handled in `invoke`?" (Arguments are boxed into `Object[]`, so an `int` parameter is passed as `Integer` and unboxed on invocation — one source of reflection's overhead.)

#### Edge cases
- Varargs methods are invoked by passing an array as the final argument, which is easy to get wrong.
- `newInstance` on an abstract class or interface throws `InstantiationException`.

#### Common mistakes
- Not unwrapping `InvocationTargetException`, burying the real cause.
- Using the deprecated `Class.newInstance()`.

#### Comparisons

| | `Class.newInstance()` | `getDeclaredConstructor().newInstance()` |
|---|---|---|
| Status | Deprecated since 9 | Current |
| Exception handling | Propagates unwrapped | Wrapped in `InvocationTargetException` |
| Non-public constructors | No | Yes with `setAccessible` |

#### Complexity
Lookup is O(hierarchy search); invocation is constant overhead over a direct call.

#### Frequently confused with
The exception thrown by `invoke` versus the exception thrown by the target method.

#### Important facts to remember
- `Class.newInstance()` is deprecated.
- Always unwrap `InvocationTargetException`.
- Reflective lookup requires exact parameter types.

---

### 11.5 Accessing Private Members

#### Definition
Using `setAccessible(true)` to suppress access checks, permitting reads, writes, and calls on non-public members.

#### Why it exists
Frameworks frequently need to populate fields that have no public setter — Hibernate entities and Jackson deserialization both depend on it.

#### Interview explanation
The current-knowledge signal here is strong encapsulation: since Java 16, deep reflection into JDK internals fails by default with `InaccessibleObjectException`. Mentioning `--add-opens` demonstrates real migration experience.

#### Syntax
```java
Field f = c.getDeclaredField("secret");
f.setAccessible(true);
f.get(instance);  f.set(instance, value);
```

#### Example
```bash
# Permitting deep reflection into a JDK package - a migration bridge, not a fix
java --add-opens java.base/java.lang=ALL-UNNAMED -jar app.jar
```

#### Common interview questions
- "Can reflection access private fields?" (Yes for your own classes via `setAccessible(true)`; JDK internals are blocked by default since Java 16.)
- "Does this mean `private` isn't real security?" (Correct — access modifiers are a design and compile-time mechanism, not a security boundary. Real isolation comes from the module system or a separate process.)
- "What is `InaccessibleObjectException`?" (Thrown when deep reflection targets a module that hasn't opened the package.)

#### Follow-up questions
- "Why did Java restrict this?" (Widespread reflection into internal APIs made the JDK impossible to evolve without breaking libraries. Strong encapsulation (Group 12) makes internals genuinely internal.)
- "Is `--add-opens` an acceptable production solution?" (As a temporary bridge during migration, yes. Long term it re-opens exactly what encapsulation was meant to close, and the dependency should be updated instead.)

#### Edge cases
- `setAccessible` on your own classpath classes still works normally — the restriction targets modules, primarily the JDK's.
- Setting a `static final` field reflectively is unreliable, since the compiler may have inlined its value at use sites.

#### Common mistakes
- Assuming `setAccessible(true)` always succeeds on modern JDKs.
- Treating `private` as a security guarantee.

#### Comparisons

| Java version | Deep reflection into JDK internals |
|---|---|
| 8 | Allowed |
| 9–15 | Warning, still permitted |
| 16+ | Denied by default; needs `--add-opens` |

#### Complexity
Not applicable.

#### Frequently confused with
Access modifiers (design intent) vs. security boundaries (module system, process isolation).

#### Important facts to remember
- `private` is not a security mechanism.
- Deep reflection into JDK internals fails by default since Java 16.
- `--add-opens` is a migration bridge, not a fix.

---

### 11.6 What Are Annotations?

#### Definition
Metadata attached to program elements, declared with `@interface`, stored in class files, and interpreted by compilers, tools, or frameworks.

#### Why it exists
To replace external XML configuration with metadata co-located with the code it describes.

#### Interview explanation
State clearly that annotations are inert — behavior comes entirely from the reader. This explains a class of real bugs, such as `@Transactional` silently doing nothing under self-invocation.

#### Syntax
```java
@Component
public class Service {
    @Autowired private Repository repo;
    @Transactional public void save() { }
}
```

#### Example
```java
// The annotation itself does nothing.
// Spring reads it, creates a proxy, and wraps the call in a transaction.
@Transactional
public void transfer(Account a, Account b, BigDecimal amount) { }
```

#### Common interview questions
- "Do annotations change program behavior by themselves?" (No — they're metadata; something must read and act on them.)
- "Why did annotations largely replace XML configuration?" (Co-location with the code, refactor safety, and type checking where applicable.)
- "How does Spring act on `@Transactional`?" (It creates a proxy around the bean that opens and commits a transaction around proxied calls.)

#### Follow-up questions
- "Why does `@Transactional` sometimes appear to do nothing?" (Self-invocation — an internal `this.method()` call bypasses the proxy entirely. Also applies to `final` methods, which can't be proxied by subclassing.)
- "What are the downsides of annotation-heavy configuration?" (Behavior becomes invisible at the call site, framework coupling spreads through the codebase, and debugging requires knowing what each annotation triggers.)

#### Edge cases
- Annotations can annotate other annotations (meta-annotations), which is how composed annotations like `@RestController` are built.
- An annotation with no elements is a marker annotation, used purely as a flag.

#### Common mistakes
- Expecting an annotation to work without its supporting infrastructure enabled.
- Assuming annotations are inherited by default — most are not.

#### Comparisons

| | XML configuration | Annotations |
|---|---|---|
| Location | Separate file | Adjacent to code |
| Refactoring | Breaks silently | Follows the code |
| Visibility of config | Centralized | Distributed |
| Framework coupling | Lower | Higher |

#### Complexity
Not applicable.

#### Frequently confused with
Annotations (inert metadata) vs. the framework machinery that interprets them.

#### Important facts to remember
- Annotations do nothing by themselves.
- Self-invocation bypasses proxy-based annotation behavior.
- Marker annotations carry no elements.

---

### 11.7 Built-in Annotations

#### Definition
The standard annotations in `java.lang`: `@Override`, `@Deprecated`, `@SuppressWarnings`, `@FunctionalInterface`, `@SafeVarargs`, plus the meta-annotations.

#### Why it exists
To let the compiler verify programmer intent that the type system alone cannot express.

#### Interview explanation
`@Override` catching accidental overloading is the concrete value story, and it connects to the overriding-versus-overloading distinction from Group 2.

#### Syntax
```java
@Override  @Deprecated(since="2.0", forRemoval=true)
@SuppressWarnings("unchecked")  @FunctionalInterface  @SafeVarargs
```

#### Example
```java
class Base { void handle(Object o) { } }
class Sub extends Base {
    @Override
    void handle(String s) { }   // compile error - catches the mistake
}
// Without @Override this silently compiles as an overload; handle(Object) is never overridden
```

#### Common interview questions
- "What does `@Override` actually do?" (Instructs the compiler to verify the method overrides a supertype method; catches signature mismatches that would otherwise become silent overloads.)
- "What does `@SafeVarargs` assert?" (That a generic varargs method doesn't perform unsafe operations on its varargs array — see the heap pollution discussion in Group 4.)
- "What was added to `@Deprecated` in Java 9?" (`since` and `forRemoval` elements, with `forRemoval=true` producing a stronger warning.)

#### Follow-up questions
- "Is `@FunctionalInterface` required for lambdas?" (No — it's a compile-time check that the interface has exactly one abstract method, protecting existing lambdas from a future second method.)
- "Why should `@SuppressWarnings` be scoped narrowly?" (Class-level application silences warnings across every member, hiding genuine problems that arise later.)

#### Edge cases
- `@Override` works for interface method implementations since Java 6, not only class overrides.
- `@SafeVarargs` may only be applied to methods that cannot be overridden — `static`, `final`, or `private`.

#### Common mistakes
- Omitting `@Override` and creating a silent overload.
- Broad `@SuppressWarnings` placement.

#### Comparisons

| Annotation | Retention | Verified by |
|---|---|---|
| `@Override` | Source | Compiler |
| `@Deprecated` | Runtime | Compiler warning + reflection |
| `@SuppressWarnings` | Source | Compiler |
| `@FunctionalInterface` | Runtime | Compiler |

#### Complexity
Not applicable.

#### Frequently confused with
`@Override` as documentation versus as a compile-time correctness check — it's the latter.

#### Important facts to remember
- `@Override` prevents accidental overloading.
- `@SafeVarargs` requires a non-overridable method.
- `forRemoval=true` signals scheduled removal, not mere discouragement.

---

### 11.8 Creating Custom Annotations

#### Definition
User-defined annotation types declared with `@interface`, optionally carrying elements with defaults.

#### Why it exists
To let application code and internal frameworks express domain-specific metadata declaratively.

#### Interview explanation
The permitted element types and the prohibition on `null` defaults are concrete facts interviewers check. Also mention the `value` shortcut, which explains why `@Role("ADMIN")` works.

#### Syntax
```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface Audited {
    String value();
    boolean includeArgs() default false;
}
```

#### Example
```java
@Repeatable(Roles.class)
public @interface Role { String value(); }
public @interface Roles { Role[] value(); }

@Role("ADMIN") @Role("AUDITOR")
public void privileged() { }
```

#### Common interview questions
- "What types can annotation elements have?" (Primitives, `String`, `Class`, enums, annotations, and arrays of those — nothing else.)
- "Can an element default to null?" (No — `null` is not permitted as a value or default. Use an empty string or empty array as a sentinel.)
- "What is the `value` element convention?" (An element named `value` can be supplied without a name when it's the only one being specified.)

#### Follow-up questions
- "How do repeatable annotations work?" (`@Repeatable` names a container annotation holding an array. The compiler wraps repeats into the container, and reflection can retrieve either form via `getAnnotationsByType`.)
- "What retention do custom annotations need for framework use?" (`RUNTIME` — the default `CLASS` is not visible to reflection.)

#### Edge cases
- An annotation can extend nothing — `@interface` types implicitly extend `java.lang.annotation.Annotation` and cannot declare a supertype.
- Arrays as elements use brace syntax, and a single-element array can omit the braces.

#### Common mistakes
- Forgetting `@Retention(RUNTIME)`, so reflection finds nothing.
- Attempting arbitrary object types as element types.

#### Comparisons

| Element type | Allowed |
|---|---|
| Primitives, `String` | Yes |
| `Class`, enum, annotation | Yes |
| Arrays of the above | Yes |
| Arbitrary objects, `null` | No |

#### Complexity
Not applicable.

#### Frequently confused with
The default retention (`CLASS`) versus what frameworks require (`RUNTIME`).

#### Important facts to remember
- `null` is never a valid annotation value or default.
- Default retention is `CLASS`, not `RUNTIME`.
- The `value` element enables shorthand syntax.

---

### 11.9 Retention and Target

#### Definition
Meta-annotations controlling an annotation's lifespan (`@Retention`) and permitted placement (`@Target`).

#### Why it exists
Different annotations serve compile-time, bytecode-tool, and runtime audiences, and applying them in nonsensical positions should be a compile error.

#### Interview explanation
The default retention being `CLASS` is the fact most worth stating — it's neither of the two useful options and causes a specific, common bug where reflection finds nothing.

#### Syntax
```java
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.METHOD})
@Inherited
@Documented
```

#### Example
```java
// Missing @Retention - defaults to CLASS, invisible to reflection
@Target(ElementType.METHOD)
public @interface Broken { }

method.isAnnotationPresent(Broken.class);   // always false
```

#### Common interview questions
- "What are the three retention policies?" (`SOURCE`, `CLASS`, `RUNTIME`.)
- "What is the default retention?" (`CLASS` — present in the class file but not readable via reflection.)
- "What does `@Inherited` do?" (Makes a class-level annotation visible on subclasses through `getAnnotation()`.)

#### Follow-up questions
- "Does `@Inherited` apply to interfaces or methods?" (No — only class-level annotations inherited through the superclass chain. Method-level annotations are never inherited by overriding methods.)
- "What is `TYPE_USE` for?" (Introduced in Java 8 to allow annotations wherever a type appears, enabling type checkers like `@NonNull String` in generic arguments and casts.)

#### Edge cases
- `SOURCE` retention annotations are invisible in the class file, which is how Lombok and `@Override` operate.
- `@Documented` only affects whether the annotation appears in generated Javadoc.

#### Common mistakes
- Omitting `@Retention(RUNTIME)` on framework annotations.
- Expecting `@Inherited` to propagate method annotations.

#### Comparisons

| Retention | Class file | Reflection | Example |
|---|---|---|---|
| `SOURCE` | No | No | `@Override` |
| `CLASS` (default) | Yes | No | Bytecode tools |
| `RUNTIME` | Yes | Yes | `@Autowired` |

#### Complexity
Not applicable.

#### Frequently confused with
`@Inherited` semantics — classes only, never methods or interfaces.

#### Important facts to remember
- Default retention is `CLASS`.
- `@Inherited` works only for class-level annotations via superclasses.
- `TYPE_USE` enables type-checker annotations.

---

### 11.10 Reading Annotations at Runtime

#### Definition
Retrieving annotation instances from `Class`, `Method`, `Field`, and other reflective elements using `getAnnotation` and related methods.

#### Why it exists
Metadata is only useful when something reads it; this is the mechanism frameworks use to translate markers into behavior.

#### Interview explanation
Volunteer that plain reflection does not resolve meta-annotations — Spring implements that recursion itself. It explains why composed annotations work in Spring but not with naive reflection code.

#### Syntax
```java
element.isAnnotationPresent(Ann.class);
element.getAnnotation(Ann.class);
element.getAnnotationsByType(Ann.class);    // repeatable annotations
element.getDeclaredAnnotations();
```

#### Example
```java
for (Method m : clazz.getDeclaredMethods()) {
    Scheduled s = m.getAnnotation(Scheduled.class);
    if (s != null) scheduler.register(m, s.cron());
}
```

#### Common interview questions
- "How do you find all methods with a given annotation?" (Iterate `getDeclaredMethods()` and test `isAnnotationPresent`.)
- "Does `getAnnotation` find meta-annotations?" (No — it doesn't recurse. Frameworks implement that search themselves.)
- "How do you read repeatable annotations?" (`getAnnotationsByType`, which unwraps the container.)

#### Follow-up questions
- "What is the startup cost of classpath scanning?" (Proportional to classes examined; large classpaths add seconds. Spring Boot mitigates this with restricted base packages and, for native images, build-time processing.)
- "How could you avoid runtime scanning entirely?" (Generate an index at build time with an annotation processor — the approach Micronaut and Quarkus take, which is why their startup is much faster.)

#### Edge cases
- Annotations on parameters require `Method.getParameterAnnotations()`, which returns a two-dimensional array.
- Annotation instances returned by reflection are dynamic proxies implementing the annotation interface.

#### Common mistakes
- Expecting meta-annotation resolution from plain reflection.
- Scanning the entire classpath rather than targeted packages.

#### Comparisons

| Approach | Cost | When resolved |
|---|---|---|
| Runtime reflection | Startup scan | At startup |
| Build-time index | Compile time | Before runtime |

#### Complexity
Scanning is O(classes × members) — a real startup cost at scale.

#### Frequently confused with
Direct annotations versus meta-annotations, which require explicit recursive lookup.

#### Important facts to remember
- Plain reflection doesn't resolve meta-annotations.
- Annotation instances are themselves proxies.
- Build-time indexing avoids startup scanning cost.

---

### 11.11 Annotation Processing at Compile Time

#### Definition
The `javax.annotation.processing` mechanism by which processors run during compilation to inspect annotated elements and generate sources or report errors.

#### Why it exists
To move framework work from runtime to build time, eliminating reflection cost and surfacing errors at compile time.

#### Interview explanation
Contrasting MapStruct with a reflective mapper makes the value concrete. Also note honestly that Lombok is not a conventional processor — it manipulates the compiler AST, which is why it breaks on JDK upgrades.

#### Syntax
```java
@SupportedAnnotationTypes("com.example.Entity")
@SupportedSourceVersion(SourceVersion.RELEASE_21)
public class MyProcessor extends AbstractProcessor {
    @Override
    public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment env) {
        // inspect elements, generate sources via processingEnv.getFiler()
        return true;
    }
}
```

#### Example
```java
// MapStruct: you declare the interface, the processor generates the implementation
@Mapper
public interface UserMapper {
    UserDto toDto(User user);
}
// Generated UserMapperImpl contains plain field assignments - no reflection at runtime
```

#### Common interview questions
- "What is annotation processing?" (Compile-time inspection of annotations, typically generating additional source files.)
- "Name tools that use it." (MapStruct, Dagger, Immutables, AutoValue, Micronaut.)
- "How does it compare with runtime reflection?" (Faster at runtime, verified at compile time, debuggable generated code — at the cost of build time and complexity.)

#### Follow-up questions
- "Is Lombok a standard annotation processor?" (No — it modifies the compiler's internal AST via non-public APIs. That's why it breaks on new JDK versions and needs IDE plugins, unlike MapStruct which uses only the public API.)
- "What are processing rounds?" (Generated sources are themselves compiled and may trigger further processing, so processors run in rounds until no new sources are produced.)

#### Edge cases
- Processors cannot modify existing source through the public API — only generate new files. Lombok's mutation is what makes it non-standard.
- Generated sources need IDE configuration to be visible, which is a common setup friction.

#### Common mistakes
- Choosing runtime reflection where generation would be faster and safer.
- Assuming Lombok's approach is representative of annotation processing generally.

#### Comparisons

| | Reflection | Annotation processing |
|---|---|---|
| When | Runtime | Compile time |
| Runtime cost | Yes | None |
| Error detection | Runtime | Compile time |
| Debuggable | Opaque | Generated source visible |

#### Complexity
Adds compile-time cost proportional to processed elements.

#### Frequently confused with
Lombok (AST manipulation) vs. standard processors (source generation).

#### Important facts to remember
- Processors generate new sources; they cannot modify existing ones through the public API.
- Lombok is a non-standard exception to this.
- Processing runs in rounds.

---

### 11.12 Dynamic Proxies

#### Definition
Runtime-generated objects implementing specified interfaces and routing all calls to an `InvocationHandler`, created via `Proxy.newProxyInstance`.

#### Why it exists
To add cross-cutting behavior — transactions, security, logging, caching — without modifying the target code.

#### Interview explanation
The JDK-proxies-interfaces-only limitation and the self-invocation problem are the two facts that explain most real Spring AOP confusion. Raising both unprompted signals practical experience.

#### Syntax
```java
Proxy.newProxyInstance(classLoader, new Class<?>[]{ Iface.class }, handler);
```

#### Example
```java
// Why @Transactional silently fails on self-invocation
@Service
public class OrderService {
    public void outer() {
        this.inner();          // direct call - bypasses the proxy entirely
    }
    @Transactional
    public void inner() { }    // no transaction when called via outer()
}
```

#### Common interview questions
- "What can JDK dynamic proxies proxy?" (Interfaces only — class proxying requires bytecode generation via CGLIB or ByteBuddy.)
- "Why can't Spring proxy `final` classes or methods?" (Class proxying creates a subclass overriding methods; `final` prevents both.)
- "Why does self-invocation bypass `@Transactional`?" (The call never leaves the target object, so it never passes through the proxy that applies the behavior.)

#### Follow-up questions
- "How do you work around self-invocation?" (Move the annotated method to a separate bean so the call crosses a proxy boundary, inject a self-reference, or use AspectJ compile-time or load-time weaving, which modifies the bytecode directly rather than proxying.)
- "What's the difference between JDK proxies and CGLIB?" (JDK proxies implement interfaces and are built into the JDK; CGLIB generates subclasses, works without interfaces, but cannot handle `final` members.)

#### Edge cases
- Proxy classes appear in stack traces as `$Proxy12` or `...$$EnhancerBySpringCGLIB$$...`, adding noise during debugging.
- `equals`, `hashCode`, and `toString` are routed through the handler and must be handled deliberately.

#### Common mistakes
- Marking Spring beans or their methods `final`.
- Expecting AOP to intercept internal calls.

#### Comparisons

| | JDK proxy | CGLIB / ByteBuddy |
|---|---|---|
| Requires interface | Yes | No |
| Mechanism | Implements interfaces | Generates subclass |
| `final` support | N/A | Cannot proxy |
| Built into JDK | Yes | External library |

#### Complexity
Each proxied call adds a handler dispatch plus reflective invocation.

#### Frequently confused with
Proxy-based AOP (call-boundary only) vs. AspectJ weaving (bytecode-level, intercepts internal calls too).

#### Important facts to remember
- JDK proxies handle interfaces only.
- `final` blocks subclass-based proxying.
- Self-invocation bypasses proxies entirely.

---

### 11.13 MethodHandles and VarHandles

#### Definition
`MethodHandle` (Java 7) is a typed, directly-executable reference to a method with access checks performed at lookup; `VarHandle` (Java 9) provides typed field and array access with explicit memory-ordering semantics.

#### Why it exists
Classic reflection checks access on every call and resists JIT optimization; these APIs perform checks once and are designed for inlining.

#### Interview explanation
The performance story is the access-check timing plus JIT inlining, and the strongest detail is that `VarHandle` is the supported replacement for `sun.misc.Unsafe`.

#### Syntax
```java
MethodHandles.Lookup lookup = MethodHandles.lookup();
MethodHandle mh = lookup.findVirtual(String.class, "length", MethodType.methodType(int.class));
int n = (int) mh.invokeExact("hello");

VarHandle vh = lookup.findVarHandle(Counter.class, "count", int.class);
vh.compareAndSet(counter, 0, 1);
```

#### Example
```java
// Volatile semantics on a plain field, without declaring it volatile
vh.getVolatile(obj);
vh.setRelease(obj, value);
vh.compareAndExchange(obj, expected, updated);
```

#### Common interview questions
- "How do `MethodHandle`s differ from reflection?" (Access checks happen once at lookup rather than per call, and the JIT can inline them — particularly when stored in a `static final` field.)
- "What is `VarHandle` for?" (Typed variable access with explicit memory ordering — the supported replacement for `sun.misc.Unsafe`.)
- "Difference between `invoke` and `invokeExact`?" (`invokeExact` requires exact type match and is fastest; `invoke` permits conversions and boxing at a cost.)

#### Follow-up questions
- "Where does `MethodHandle` appear implicitly in ordinary code?" (Lambdas — `invokedynamic` plus `LambdaMetafactory` builds implementations using method handles, as covered in Group 6.)
- "How does `VarHandle` relate to the memory model?" (It exposes the access modes from Group 7 directly — plain, opaque, acquire/release, and volatile — giving precise control over ordering guarantees.)

#### Edge cases
- `invokeExact` treats boxing differences as type mismatches, throwing `WrongMethodTypeException` at runtime.
- Performance benefits largely depend on the handle being a `static final` field the JIT can treat as a constant.

#### Common mistakes
- Storing handles in instance fields and expecting full JIT benefit.
- Type mismatches with `invokeExact`.

#### Comparisons

| | Reflection | MethodHandle | VarHandle |
|---|---|---|---|
| Access check | Per call | At lookup | At lookup |
| Inlinable | Poorly | Yes | Yes |
| Memory ordering | No | No | Yes |
| API ergonomics | Simple | Verbose | Verbose |

#### Complexity
Lookup is one-time; invocation approaches direct-call cost under favorable conditions.

#### Frequently confused with
`MethodHandle` as merely a faster `Method` — the execution model differs, and the benefit depends on how it's stored.

#### Important facts to remember
- `VarHandle` replaces `sun.misc.Unsafe` for variable access.
- `invokeExact` requires exact type matching, including boxing.
- Store handles in `static final` fields for JIT inlining.

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

#### Definition
The Java Platform Module System (Java 9, JEP 261) introduces modules — named groupings of packages that declare their dependencies and control which packages are accessible to others.

#### Why it exists
The classpath provided no encapsulation beyond `public`, no dependency verification before runtime, and no way to subdivide the JDK.

#### Interview explanation
Separate two things candidates commonly merge: strong encapsulation of JDK internals affects *everyone* on Java 9+, while modularizing your own code is optional and uncommon. That distinction is the mark of someone who has actually done a migration.

#### Syntax
```java
module com.example.app {
    requires com.example.lib;
    exports com.example.app.api;
}
```

#### Example
```java
// A public class in a non-exported package is unreachable from other modules
package com.example.internal;
public class Helper { }        // public, but not accessible outside the module
```

#### Common interview questions
- "What problems does JPMS solve?" (No encapsulation beyond `public`, runtime-only dependency errors, JAR hell, monolithic JDK.)
- "Is modularization mandatory on Java 9+?" (No — the classpath works unchanged and most applications never modularize.)
- "What is a split package?" (The same package present in two modules — legal on the classpath, rejected on the module path.)

#### Follow-up questions
- "Why has application adoption been limited?" (Effort is significant, benefits concentrate in libraries and `jlink` scenarios, and the classpath remains fully supported. Most teams take the JDK upgrade and skip modules.)
- "What changed for developers who never write `module-info.java`?" (Strong encapsulation — reflective access to JDK internals is denied by default since Java 16, which broke many libraries.)

#### Edge cases
- Cyclic module dependencies are forbidden, unlike classpath JARs which can reference each other freely.
- The JDK itself is modularized (~70 modules), which is what makes `jlink` possible.

#### Common mistakes
- Equating "migrate off Java 8" with "adopt modules."
- Assuming `public` still means universally accessible.

#### Comparisons

| | Classpath | Module path |
|---|---|---|
| Encapsulation | `public` only | Exported packages only |
| Missing dependency | Runtime error | Startup or compile error |
| Duplicate packages | Silently allowed | Rejected |
| Required | Default | Opt-in |

#### Complexity
Not applicable.

#### Frequently confused with
Adopting modules (optional) vs. strong encapsulation (unavoidable on modern JDKs).

#### Important facts to remember
- Modules are opt-in; the classpath still works.
- Strong encapsulation affects everyone regardless.
- Split packages are rejected on the module path.

---

### 12.2 The module-info.java Descriptor

#### Definition
A compilation unit at the source root declaring a module's name, dependencies, exported packages, opened packages, and service relationships.

#### Why it exists
To make a module's contract explicit and verifiable by the compiler and runtime.

#### Interview explanation
Be able to write one from memory covering `requires`, `exports`, `opens`, `uses`, and `provides` — interviewers frequently ask for exactly that.

#### Syntax
```java
module com.example.service {
    requires transitive com.example.model;
    requires static org.jetbrains.annotations;
    exports com.example.service.api;
    exports com.example.service.spi to com.example.plugin;
    opens com.example.service.entity to org.hibernate.orm.core;
    uses com.example.service.Extension;
    provides com.example.service.Extension with com.example.service.DefaultExtension;
}
```

#### Example
```
src/
  module-info.java          <- source root, not inside a package
  com/example/service/...
```

#### Common interview questions
- "Where does `module-info.java` live?" (At the source root, above all packages.)
- "What can it declare?" (`requires`, `exports`, `opens`, `uses`, `provides`, and the module name.)
- "Is the module name related to the JAR filename?" (No, for explicit modules — the descriptor defines it. Only automatic modules derive names from filenames.)

#### Follow-up questions
- "Can a module descriptor contain conditional logic?" (No — it's declarative only. There are no conditionals, though `requires static` expresses optional runtime presence.)
- "What is `open module`?" (Declaring `open module X { }` opens every package for deep reflection, useful as a pragmatic option for applications heavily using reflective frameworks.)

#### Edge cases
- `module-info.java` compiles to `module-info.class`, which sits in the JAR root.
- A module can declare `exports` and `opens` for the same package — they grant different things.

#### Common mistakes
- Placing the descriptor inside a package directory.
- Forgetting that `java.base` is implicit and never declared.

#### Comparisons

| Directive | Grants |
|---|---|
| `requires` | Ability to read another module |
| `exports` | Compile and public reflective access to a package |
| `opens` | Deep reflective access to a package |
| `uses` / `provides` | Service consumption and provision |

#### Complexity
Not applicable.

#### Frequently confused with
Module name vs. artifact/JAR name — independent for explicit modules.

#### Important facts to remember
- Lives at the source root.
- `java.base` is implicit.
- `open module` opens all packages at once.

---

### 12.3 requires

#### Definition
A directive establishing readability — declaring that this module depends on another, verified at compile time and startup.

#### Why it exists
To replace the classpath's unchecked, implicit dependencies with declared, verified ones.

#### Interview explanation
The `transitive` variant is the discriminating question. Explain it in terms of API leakage: if your exported API exposes another module's types, consumers must be able to read that module too.

#### Syntax
```java
requires com.example.lib;
requires transitive com.example.model;
requires static com.example.annotations;
```

#### Example
```java
// Without transitive, every consumer must add its own requires for com.example.model
requires transitive com.example.model;

public Order createOrder();   // Order comes from com.example.model
```

#### Common interview questions
- "What does `requires transitive` do?" (Grants implied readability — anyone reading this module also reads the transitively required one.)
- "What is `requires static`?" (Required at compile time, optional at runtime — used for annotations and optional integrations.)
- "Do you need to declare `requires java.base`?" (No — every module implicitly requires it.)

#### Follow-up questions
- "When is `transitive` necessary rather than merely convenient?" (When your exported API signatures reference types from that module. Without it, consumers can call the method but cannot name the return type.)
- "Are cyclic module dependencies allowed?" (No — the module graph must be acyclic, which sometimes forces extracting a shared module during migration.)

#### Edge cases
- `requires static` dependencies absent at runtime cause no error unless the code path touching them executes.
- The module graph is resolved at startup; a missing required module fails immediately rather than at first use.

#### Common mistakes
- Omitting `transitive` on API-exposed dependencies, pushing the burden onto every consumer.
- Assuming `requires` alone puts the JAR on the module path — the build tool must also provide it.

#### Comparisons

| | `requires` | `requires transitive` | `requires static` |
|---|---|---|---|
| Compile time | Yes | Yes | Yes |
| Runtime | Yes | Yes | Optional |
| Implied to consumers | No | Yes | No |

#### Complexity
Module resolution is a graph traversal performed once at startup.

#### Frequently confused with
Build-tool dependencies (Maven/Gradle) vs. module readability — you need both.

#### Important facts to remember
- `transitive` grants implied readability to consumers.
- `static` means compile-time-only.
- Cycles are forbidden.

---

### 12.4 exports

#### Definition
A directive declaring which packages are accessible to code outside the module.

#### Why it exists
So `public` no longer means universally accessible — modules can have genuinely internal implementation packages.

#### Interview explanation
The single most quotable fact: since Java 9, accessibility requires `public` *and* an exported package *and* a readable module. Stating all three conditions signals precision.

#### Syntax
```java
exports com.example.api;
exports com.example.spi to com.example.plugin, com.example.tools;
```

#### Example
```java
module com.example.lib {
    exports com.example.lib.api;        // public API
    // com.example.lib.internal is NOT exported - truly internal
}
```

#### Common interview questions
- "Does `public` still mean accessible?" (No — the package must also be exported and the module readable by the caller.)
- "What is a qualified export?" (`exports X to M` restricts access to named modules, useful for SPI packages shared with specific collaborators.)
- "What error occurs when accessing a non-exported package?" (`IllegalAccessError` at runtime, or a compile error at build time.)

#### Follow-up questions
- "Does `exports` permit reflection?" (On *public* members, yes. Deep reflection into private members requires `opens` — a distinction that causes many runtime failures.)
- "Why are qualified exports somewhat problematic?" (They name specific consumer modules, coupling the provider to its clients and requiring a change when a new consumer appears.)

#### Edge cases
- A package can be both exported and opened, granting compile-time access and deep reflection separately.
- Exporting a package containing only non-public classes is legal but pointless.

#### Common mistakes
- Exporting everything, discarding the encapsulation benefit.
- Using `exports` when the framework actually needs `opens`.

#### Comparisons

| Access needed | Directive |
|---|---|
| Compile against the API | `exports` |
| Reflect on public members | `exports` |
| `setAccessible` on private members | `opens` |

#### Complexity
Not applicable.

#### Frequently confused with
`exports` vs `opens` — compile-time API versus runtime deep reflection.

#### Important facts to remember
- Accessibility now requires public + exported + readable.
- Qualified exports restrict to named modules.
- `exports` does not enable deep reflection.

---

### 12.5 opens

#### Definition
A directive permitting deep reflective access (including `setAccessible`) into a package at runtime, without granting compile-time access.

#### Why it exists
Frameworks need to reflect into private members of application classes, and that need is distinct from compile-time API access.

#### Interview explanation
Connect it explicitly to Group 11 — `setAccessible(true)` fails with `InaccessibleObjectException` unless the package is open. This is the concrete link between the two groups and a very common real-world failure.

#### Syntax
```java
opens com.example.entity;
opens com.example.entity to com.fasterxml.jackson.databind;
open module com.example.app { }     // all packages open
```

#### Example
```java
// Hibernate populating private entity fields requires opens, not exports
module com.example.domain {
    exports com.example.domain.api;
    opens com.example.domain.entity to org.hibernate.orm.core;
}
```

#### Common interview questions
- "Difference between `exports` and `opens`?" (`exports` grants compile-time and public reflective access; `opens` grants deep reflective access at runtime only.)
- "Why do Hibernate and Jackson need `opens`?" (They set private fields directly, which requires `setAccessible(true)` and therefore an open package.)
- "What is an `open module`?" (A module declaring all its packages open, a pragmatic choice for reflection-heavy applications.)

#### Follow-up questions
- "Can you open a package without exporting it?" (Yes — that's the common case for entity packages: reflectively accessible to the ORM, but not part of the compile-time API.)
- "What runtime error indicates a missing `opens`?" (`InaccessibleObjectException`, stating that the module does not open the package to the requesting module.)

#### Edge cases
- `opens` has no compile-time effect at all; code cannot reference an opened-but-not-exported package.
- Automatic modules implicitly open everything, which is why unmodularized dependencies "just work."

#### Common mistakes
- Using `exports` where `opens` is required, producing runtime reflection failures.
- Opening packages to everyone when a qualified `opens` to the specific framework would suffice.

#### Comparisons

| | `exports` | `opens` | `open module` |
|---|---|---|---|
| Compile-time access | Yes | No | No |
| Deep reflection | No | Yes | Yes, all packages |
| Typical use | Public API | Entity/DTO packages | Reflection-heavy apps |

#### Complexity
Not applicable.

#### Frequently confused with
Which directive a given framework needs — ORMs and serializers need `opens`.

#### Important facts to remember
- `opens` is runtime-only; it grants no compile-time access.
- Deep reflection requires `opens`, not `exports`.
- `InaccessibleObjectException` is the signature error.

---

### 12.6 Services: uses and provides

#### Definition
Directives integrating modules with `ServiceLoader`: `uses` declares consumption of a service type, `provides ... with` declares an implementation.

#### Why it exists
To support plugin architectures where implementations are discovered at runtime, decoupling consumers from providers.

#### Interview explanation
Note that `ServiceLoader` predates modules (Java 6, via `META-INF/services`) — JPMS gives it a declarative, compiler-verified form. That history is a detail interviewers appreciate.

#### Syntax
```java
uses com.example.spi.Codec;
provides com.example.spi.Codec with com.example.impl.JsonCodec, com.example.impl.XmlCodec;
```

#### Example
```java
ServiceLoader<Codec> codecs = ServiceLoader.load(Codec.class);
Codec chosen = codecs.stream()
    .map(ServiceLoader.Provider::get)
    .filter(c -> c.supports(format))
    .findFirst()
    .orElseThrow();
```

#### Common interview questions
- "What do `uses` and `provides` do?" (Declare service consumption and provision, wired by `ServiceLoader` at runtime.)
- "Did `ServiceLoader` exist before Java 9?" (Yes, since Java 6, using `META-INF/services` files. JPMS added declarative, verified declarations.)
- "What happens if a consumer omits `uses`?" (The module system doesn't wire the service, and `ServiceLoader` returns nothing.)

#### Follow-up questions
- "How does JDBC driver loading relate to this?" (Modern JDBC uses `ServiceLoader` to discover drivers, which is why `Class.forName("com.mysql.jdbc.Driver")` has been unnecessary since JDBC 4.0 — connecting to the class-loading discussion in Group 11.)
- "Is provider ordering guaranteed?" (No — `ServiceLoader` gives no ordering guarantee, so selection logic must not depend on it.)

#### Edge cases
- A provider class needs a public no-arg constructor, or a static `provider()` method returning the instance.
- Both the module descriptor and `META-INF/services` mechanisms work; on the module path the descriptor takes effect.

#### Common mistakes
- Declaring `provides` without a corresponding `uses` in the consumer.
- Assuming providers load in a deterministic order.

#### Comparisons

| | Direct instantiation | ServiceLoader |
|---|---|---|
| Coupling | Consumer names the impl | Neither names the other |
| Adding an implementation | Code change | Add module to path |
| Discoverability | Explicit | Indirect |

#### Complexity
Provider discovery occurs at first load and is typically cached.

#### Frequently confused with
JPMS services vs. Spring dependency injection — similar decoupling goals, entirely different mechanisms.

#### Important facts to remember
- `ServiceLoader` predates JPMS.
- `uses` is required for the consumer, not just `provides`.
- Provider ordering is unspecified.

---

### 12.7 The Module Path vs the Classpath

#### Definition
Two distinct resolution mechanisms: the module path applies module rules; the classpath preserves the pre-Java-9 flat model.

#### Why it exists
Backward compatibility — existing code must run unchanged, so both models coexist.

#### Interview explanation
The asymmetry is the key insight: explicit modules cannot read the unnamed module. There's no way to express `requires unnamed`, so modularizing forces dependencies onto the module path.

#### Syntax
```bash
java --module-path mods --module com.example.app/com.example.Main
java --class-path "libs/*" com.example.Main
```

#### Example
```java
// This is impossible - there is no syntax for it
module com.example.app {
    // requires <the classpath>;   <- does not exist
}
```

#### Common interview questions
- "What's the difference between the module path and the classpath?" (Module path enforces module rules; classpath merges everything into the unnamed module with no encapsulation.)
- "Can an explicit module read classpath code?" (No — explicit modules cannot read the unnamed module.)
- "Does the same JAR behave identically on both?" (No — on the module path it becomes a module, on the classpath it joins the unnamed module.)

#### Follow-up questions
- "What does this asymmetry mean for migration?" (Modularizing is all-or-nothing for your dependency chain — every dependency must move to the module path, becoming at least an automatic module.)
- "What is `--add-modules` for?" (Adding modules to the resolved root set when they aren't reached through normal resolution, commonly needed for JDK modules not required by default.)

#### Edge cases
- Mixed setups are legal — some JARs on each path — but reasoning about them is error-prone.
- Root module resolution starts from the initial module and pulls in everything reachable; unreferenced modules aren't loaded.

#### Common mistakes
- Adding `module-info.java` while leaving dependencies on the classpath.
- Assuming path choice is a build detail rather than a semantic one.

#### Comparisons

| | Classpath | Module path |
|---|---|---|
| Encapsulation | None | Enforced |
| Missing dependency | Runtime failure | Startup failure |
| Readable by explicit modules | No | Yes |

#### Complexity
Module resolution is a one-time startup graph computation.

#### Frequently confused with
The same JAR having different semantics depending on which path it's on.

#### Important facts to remember
- Explicit modules cannot read the unnamed module.
- The classpath remains fully supported.
- Path placement changes behavior.

---

### 12.8 Automatic and Unnamed Modules

#### Definition
An automatic module is a non-modular JAR on the module path, given a derived name and exporting everything. The unnamed module is everything on the classpath.

#### Why it exists
As migration bridges, letting modularized code depend on libraries that aren't modularized.

#### Interview explanation
Explain the name derivation order — `Automatic-Module-Name` manifest entry first, filename second — and why depending on filename-derived names is fragile.

#### Syntax
```
Automatic-Module-Name: com.example.legacy      # in MANIFEST.MF
```

#### Example
```
commons-lang3-3.12.0.jar  ->  module name "org.apache.commons.lang3"
                              (from Automatic-Module-Name, not the filename)
```

#### Common interview questions
- "What is an automatic module?" (A plain JAR on the module path — name derived, exports everything, reads everything.)
- "How is its name determined?" (From `Automatic-Module-Name` in the manifest if present, otherwise derived from the filename.)
- "What is the unnamed module?" (All classpath code, which reads everything and is readable by no explicit module.)

#### Follow-up questions
- "Why is `Automatic-Module-Name` recommended for library authors?" (It fixes the module name independently of the filename, so consumers' `requires` clauses survive version and artifact renames — a low-cost first step before a full descriptor.)
- "Do automatic modules provide encapsulation?" (None — they export and open everything. They're scaffolding, not a destination.)

#### Edge cases
- Filename-derived names strip version numbers and replace non-alphanumeric characters, which can produce invalid or surprising names.
- Automatic modules can read the unnamed module, which is precisely how they bridge to classpath code.

#### Common mistakes
- Depending on a filename-derived name in published code, which breaks when the artifact is renamed.
- Assuming automatic modules enforce any encapsulation.

#### Comparisons

| | Explicit | Automatic | Unnamed |
|---|---|---|---|
| Descriptor | Yes | No | No |
| Encapsulation | Enforced | None | None |
| Reads unnamed module | No | Yes | Yes |

#### Complexity
Not applicable.

#### Frequently confused with
Automatic modules (module path) vs. unnamed module (classpath) — different mechanisms with different readability rules.

#### Important facts to remember
- `Automatic-Module-Name` beats filename derivation.
- Automatic modules provide no encapsulation.
- Only automatic modules can bridge to the unnamed module.

---

### 12.9 Strong Encapsulation

#### Definition
The enforcement, by default since Java 16, that JDK-internal packages are inaccessible to code outside their defining module.

#### Why it exists
Pervasive use of internal APIs made evolving the JDK impossible without breaking the ecosystem.

#### Interview explanation
This is the most practically important item in the group, because it affects every project regardless of modularization. Being able to name the version timeline and the `--add-opens` remedy demonstrates real migration experience.

#### Syntax
```bash
--add-opens java.base/java.lang=ALL-UNNAMED
--add-exports java.base/sun.nio.ch=ALL-UNNAMED
```

#### Example
```
java.lang.reflect.InaccessibleObjectException: Unable to make field private
final byte[] java.lang.String.value accessible: module java.base does not
"opens java.lang" to unnamed module @1b6d3586
```

#### Common interview questions
- "What is strong encapsulation?" (JDK internals are genuinely inaccessible from outside their module, enforced by default since Java 16.)
- "What's the difference between `--add-opens` and `--add-exports`?" (`--add-opens` permits deep reflection; `--add-exports` permits compile-time and normal access to a non-exported package.)
- "Why did the Java 8 to 11+ migration break so many libraries?" (They reflected into JDK internals — `Unsafe`, `ClassLoader` fields, `java.util` internals — which strong encapsulation blocks.)

#### Follow-up questions
- "Is `--add-opens` an acceptable permanent solution?" (No — it reopens what encapsulation exists to close, and each flag is a dependency on internals that may be removed. It's a bridge; updating the library is the fix.)
- "When did the default change?" (Warnings from Java 9, denied by default in Java 16, and the `--illegal-access` relaxation removed in Java 17.)

#### Edge cases
- `--add-opens` can be specified in a JAR manifest (`Add-Opens`) for executable JARs, avoiding command-line flags.
- The restriction applies to *JDK* modules by default; your own classpath classes remain reflectively accessible.

#### Common mistakes
- Adding broad `--add-opens` flags without identifying the responsible dependency.
- Assuming a Java 8 codebase will run unchanged on Java 17.

#### Comparisons

| Version | Internal access |
|---|---|
| 8 | Permitted |
| 9–15 | Warning, permitted |
| 16 | Denied by default |
| 17+ | Denied, relaxation removed |

#### Complexity
Not applicable.

#### Frequently confused with
`--add-opens` (reflection) vs `--add-exports` (normal access).

#### Important facts to remember
- Denied by default since Java 16.
- `--add-opens` is a migration bridge, not a fix.
- This affects projects that never modularize.

---

### 12.10 jlink and Custom Runtimes

#### Definition
A JDK tool that assembles a custom runtime image containing only the modules an application requires.

#### Why it exists
To ship a minimal runtime instead of a full JDK, reducing image size, startup cost, and attack surface.

#### Interview explanation
Be precise that `jlink` produces a *Java runtime*, not a native binary — the confusion with GraalVM `native-image` is common and worth pre-empting.

#### Syntax
```bash
jdeps --print-module-deps app.jar
jlink --add-modules java.base,java.sql --strip-debug --compress=2 --output runtime
```

#### Example
```dockerfile
FROM eclipse-temurin:21-jdk AS builder
RUN jlink --add-modules java.base,java.logging --strip-debug \
          --no-header-files --no-man-pages --compress=2 --output /runtime

FROM debian:stable-slim
COPY --from=builder /runtime /opt/java
# Image is a fraction of a full JDK image
```

#### Common interview questions
- "What does `jlink` produce?" (A custom Java runtime image with selected modules plus a launcher — not a native executable.)
- "What's the prerequisite?" (All dependencies must be modules; classpath JARs cannot be linked.)
- "How do you determine which modules are needed?" (`jdeps --print-module-deps`.)

#### Follow-up questions
- "How does `jlink` compare with GraalVM `native-image`?" (`jlink` produces a smaller JVM runtime, preserving JIT and dynamic features. `native-image` produces an actual native binary with near-instant startup but no JIT warm-up path and requires configuration for reflection — different trade-offs, connecting to the startup discussion in Group 8.)
- "Is the output cross-platform?" (No — images are platform-specific, so each target platform needs its own `jlink` run.)

#### Edge cases
- `jlink` cannot include automatic modules in some configurations, which is a frequent blocker for real applications.
- Combining `jlink` with AppCDS further improves startup by pre-parsing class metadata.

#### Common mistakes
- Attempting `jlink` with classpath dependencies.
- Expecting a native executable.

#### Comparisons

| | Full JDK | `jlink` image | `native-image` |
|---|---|---|---|
| Size | Largest | Small | Smallest |
| Startup | JIT warm-up | JIT warm-up | Near-instant |
| Peak throughput | Full | Full | Lower |
| Reflection | Unrestricted | Unrestricted | Needs configuration |

#### Complexity
Link time is proportional to included modules; runtime behavior is unchanged.

#### Frequently confused with
`jlink` (custom JVM runtime) vs `native-image` (ahead-of-time native binary).

#### Important facts to remember
- `jlink` output still runs on a JVM.
- All dependencies must be modules.
- Images are platform-specific.

---

### 12.11 Migration Strategy

#### Definition
The staged approach to moving a codebase onto modern Java: upgrade the JDK first, resolve internal-API usage, and modularize only if justified.

#### Why it exists
Full modularization is high-effort and optional; the valuable step for most teams is running on a supported JDK.

#### Interview explanation
The strongest answer separates the necessary work from the optional work, and states plainly that most applications stop after the JDK upgrade. That's an accurate reflection of industry practice, not a compromise.

#### Syntax
```bash
jdeps --jdk-internals app.jar          # find internal API usage
jdeps --print-module-deps app.jar      # determine module requirements
java --add-opens java.base/java.lang=ALL-UNNAMED -jar app.jar
```

#### Example
```
1. Upgrade JDK, remain on the classpath      <- most teams stop here
2. Fix or replace libraries using internals
3. Add Automatic-Module-Name (libraries)
4. Modularize leaves first, if worthwhile
```

#### Common interview questions
- "How would you migrate a Java 8 application to Java 17?" (Upgrade the JDK on the classpath, run `jdeps --jdk-internals`, update libraries reflecting into internals, add `--add-opens` temporarily where required, and test thoroughly. Modules are a separate decision.)
- "What is a split package and why does it block migration?" (The same package in two JARs — legal on the classpath, rejected on the module path.)
- "Should every project modularize?" (No — the benefits concentrate in libraries and `jlink` scenarios; most applications reasonably remain on the classpath.)

#### Follow-up questions
- "Why is 8-to-11 harder than 11-to-17?" (Java 9 introduced the module system, removed Java EE modules like JAXB and JAX-WS, and began restricting internal access. Later upgrades face far fewer structural changes.)
- "What ordering do you use when modularizing?" (Bottom-up — modularize leaf dependencies first, since a module cannot read the unnamed module and therefore cannot depend on unmodularized code.)

#### Edge cases
- Removed Java EE modules (JAXB, JAX-WS, `javax.annotation`) must be added as explicit dependencies after Java 11.
- Some libraries never modularized and never will, capping how far modularization can proceed.

#### Common mistakes
- Treating modularization as required for a JDK upgrade.
- Modularizing top-down, which fails because dependencies aren't yet modules.

#### Comparisons

| Step | Required | Benefit |
|---|---|---|
| JDK upgrade | Yes | Performance, GC, language features |
| Fix internal API usage | Yes | Runs on Java 16+ |
| `Automatic-Module-Name` | For libraries | Stable name for consumers |
| Full modularization | No | Encapsulation, `jlink` |

#### Complexity
Not applicable.

#### Frequently confused with
JDK migration (necessary) vs. modularization (optional).

#### Important facts to remember
- Most applications never write `module-info.java`.
- Modularize bottom-up if at all.
- 8-to-11 is the hard jump; later upgrades are much easier.

---

[[#📖 Master Table of Contents|⬆ Back to top]]

*End of Group 12 — curriculum complete.*

---

## 🎓 Where to Go Next

You can now answer interview questions across the full Java surface — definitions, mechanisms, edge cases, comparisons, and the traps interviewers use.

Continue to **`3_production.md`**, the final iteration, covering how professionals actually apply this: best practices, performance and memory considerations, real production bugs, anti-patterns, debugging, and modern versus deprecated approaches.
