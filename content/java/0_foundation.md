# Java — Foundation

> **Goal of this file:** Build a complete mental map of Java. After reading, you should be able to say *"I know what every concept is."* No deep internals, no implementation detail — just what things are, why they exist, and what problem they solve.

> **Build status:** This is a living document, built one topic-group at a time. Currently complete: **Group 1**. Groups 2–12 will be added in follow-up passes.

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
- [[#1.5 Operators]]
- [[#1.6 Control Flow Statements]]
- [[#1.7 Arrays]]
- [[#1.8 Methods]]
- [[#1.9 Packages and Imports]]

---

### 1.1 What is Java?

Java is a general-purpose, object-oriented programming language. Code you write is compiled into an intermediate form called **bytecode**, which can run on any machine that has a Java Virtual Machine (JVM).

It exists because early languages compiled directly to machine code, which meant a program built for one operating system wouldn't run on another. Java solved this by adding a translation layer (the JVM) between your code and the machine.

> 💡 **Tip:** Java's famous slogan is "Write Once, Run Anywhere" (WORA). That's the problem it was built to solve.

---

### 1.2 JVM, JRE, and JDK

These three terms are easy to confuse but represent three different things:

- **JVM (Java Virtual Machine):** The engine that actually runs your bytecode. It's what makes Java platform-independent.
- **JRE (Java Runtime Environment):** The JVM plus the standard libraries needed to *run* Java programs.
- **JDK (Java Development Kit):** The JRE plus tools needed to *build* Java programs (compiler, debugger, etc.).

They exist as separate layers because not everyone needs to do everything — someone only *running* a Java app doesn't need a compiler.

```
JDK  ⊃  JRE  ⊃  JVM
(build)  (run)  (execute)
```

---

### 1.3 Platform Independence & Bytecode

When you compile a `.java` file, the compiler (`javac`) doesn't produce machine code — it produces `.class` files containing **bytecode**, a set of instructions understood only by the JVM.

This exists to solve the "compile once per OS" problem. The JVM for Windows, Mac, or Linux each know how to translate the same bytecode into instructions their own machine understands.

> 📝 **Note:** This is the core reason Java is called "platform-independent" — the *bytecode* is portable, even though the JVM itself is platform-specific.

---

### 1.4 Variables and Data Types

A variable is a named container for a value. Java is **statically typed** — every variable has a fixed type decided at compile time.

Java splits types into two families:
- **Primitive types** (`int`, `double`, `boolean`, `char`, etc.) — hold raw values directly.
- **Reference types** (`String`, arrays, objects) — hold a reference (pointer) to an object elsewhere in memory.

This split exists for performance: primitives are small, fixed-size, and fast, while reference types support the rich, extensible object model Java needs.

---

### 1.5 Operators

Operators are symbols that perform operations on values: arithmetic (`+ - * / %`), relational (`== != > <`), logical (`&& || !`), assignment (`= += -=`), and others.

They exist simply because every language needs a compact way to express computation and comparisons — writing `a + b` is far more usable than calling a function for every addition.

---

### 1.6 Control Flow Statements

Control flow statements decide *which* code runs and *how many times*. Java provides:
- **Conditional:** `if / else`, `switch`
- **Looping:** `for`, `while`, `do-while`

They exist because real programs aren't a straight line of instructions — they need to branch based on data and repeat work without rewriting code.

---

### 1.7 Arrays

An array is a fixed-size, ordered collection of elements of the same type, stored in one contiguous memory block.

Arrays exist to let you group related values together and access any one of them instantly using an index, instead of creating a separate variable for each value.

```java
int[] scores = {90, 85, 77};
System.out.println(scores[1]); // 85
```

---

### 1.8 Methods

A method is a named, reusable block of code that performs a task, optionally taking inputs (parameters) and producing an output (return value).

Methods exist to avoid repeating the same logic everywhere it's needed — you write the logic once and *call* it wherever required.

---

### 1.9 Packages and Imports

A package is a namespace that groups related classes together (e.g., `java.util`). An `import` statement lets a file use classes from another package without writing their full name every time.

Packages exist to avoid naming collisions (two classes named `List` from different libraries) and to organize large codebases logically.

---

[[#📖 Master Table of Contents|⬆ Back to top]]

*End of Group 1. Next: Object-Oriented Programming.*

---

## 2. Object-Oriented Programming

### Table of Contents (this group)
- [[#2.1 Classes and Objects]]
- [[#2.2 Constructors]]
- [[#2.3 The this and super Keywords]]
- [[#2.4 Encapsulation]]
- [[#2.5 Inheritance]]
- [[#2.6 Polymorphism]]
- [[#2.7 Abstraction & Abstract Classes]]
- [[#2.8 Interfaces]]
- [[#2.9 Access Modifiers]]
- [[#2.10 Static vs Instance Members]]
- [[#2.11 The Object Class (equals, hashCode, toString)]]

---

### 2.1 Classes and Objects

A class is a blueprint describing what data (fields) and behavior (methods) something has. An object is a concrete instance created from that blueprint using `new`.

Classes exist because real-world modeling needs data and the logic that operates on it to travel together, instead of being scattered across unrelated functions and variables.

```java
class Dog {
    String name;
    void bark() { System.out.println(name + " says woof"); }
}
Dog rex = new Dog();
rex.name = "Rex";
rex.bark();
```

---

### 2.2 Constructors

A constructor is a special block of code that runs automatically when an object is created, used to set up its starting state.

Constructors exist so an object can never exist in a broken, half-set-up state — every object is guaranteed to pass through its constructor before anyone can use it.

---

### 2.3 The this and super Keywords

`this` refers to the current object; `super` refers to the parent class an object inherits from.

They exist to resolve naming conflicts (like a constructor parameter sharing a name with a field) and to let a subclass explicitly reach up into its parent's constructor or methods.

---

### 2.4 Encapsulation

Encapsulation means bundling data together with the methods that operate on it, and hiding the internal details behind a controlled public interface.

It exists to protect an object's internal state from being changed in invalid, unexpected ways by code outside the class.

---

### 2.5 Inheritance

Inheritance lets one class (the child/subclass) reuse and extend the fields and methods of another class (the parent/superclass).

It exists to avoid duplicating shared logic across closely related classes — common behavior is written once in a parent and shared downward.

---

### 2.6 Polymorphism

Polymorphism means the same method call can produce different behavior depending on the actual object type at runtime.

It exists so code can work generically with a whole family of related types, without needing to know or check each object's exact class.

---

### 2.7 Abstraction & Abstract Classes

Abstraction means exposing only what's necessary and hiding the complexity underneath. An abstract class is a class that can't be instantiated directly and can leave some methods unimplemented for subclasses to fill in.

It exists to define a shared template while forcing every subclass to supply its own specific details.

---

### 2.8 Interfaces

An interface is a contract that lists what methods a class must implement, without dictating how.

It exists to let unrelated classes agree to behave the same way (implement the same contract), enabling flexible, decoupled designs.

---

### 2.9 Access Modifiers

Access modifiers (`public`, `protected`, `private`, and package-private/default) control which parts of a program are allowed to see or use a class, field, or method.

They exist to enforce encapsulation at the language level, so accidental or unwanted access from unrelated code is a compile error, not a runtime surprise.

---

### 2.10 Static vs Instance Members

An instance member belongs to each individual object; a static member belongs to the class itself and is shared by every instance.

They exist because some data is naturally per-object (a dog's name) while other data is naturally shared across all objects (how many dogs have been created in total).

---

### 2.11 The Object Class (equals, hashCode, toString)

Every class in Java automatically inherits from `Object`, which provides default behavior for comparing objects (`equals`), hashing them (`hashCode`), and describing them as text (`toString`).

This exists so every object — no matter its type — has some baseline behavior for these universal operations, which a class can override to make more meaningful.

> 💡 **Tip:** `==` compares object references by default; `.equals()` is what you override to compare actual content.

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

The Java Collections Framework is a set of interfaces and classes for storing and manipulating groups of objects. At the top sit two separate hierarchies: `Collection` (List, Set, Queue) and `Map` (which is a completely separate interface, not a `Collection`).

It exists because arrays are fixed-size and limited — real programs need flexible, resizable, feature-rich ways to group data (searching, sorting, removing duplicates, key-value lookup, and more).

---

### 3.2 List Implementations (ArrayList vs LinkedList)

A `List` is an ordered collection that allows duplicates and indexed access. `ArrayList` is backed by a resizable array; `LinkedList` is backed by a doubly-linked chain of nodes.

Lists exist because arrays can't grow, and different backing structures make different operations (random access vs. insertion/removal) fast or slow.

```java
List<String> names = new ArrayList<>();
names.add("Ana");
names.add("Bob");
System.out.println(names.get(0)); // Ana
```

---

### 3.3 Set Implementations (HashSet, LinkedHashSet, TreeSet)

A `Set` is a collection that stores unique elements only — no duplicates allowed. `HashSet` offers fast lookup with no ordering guarantee, `LinkedHashSet` preserves insertion order, and `TreeSet` keeps elements sorted.

Sets exist because many real-world problems just need "does this already exist?" checks without caring about duplicates.

---

### 3.4 Map Implementations (HashMap, LinkedHashMap, TreeMap, Hashtable)

A `Map` stores key-value pairs, where each key is unique and maps to exactly one value. `HashMap` is unordered but fast, `LinkedHashMap` preserves insertion order, `TreeMap` keeps keys sorted, and `Hashtable` is an older, synchronized version.

Maps exist because looking things up by a meaningful key (like a username or ID) is far more natural and efficient than searching through a list every time.

---

### 3.5 Queue and Deque (ArrayDeque, PriorityQueue)

A `Queue` processes elements in a defined order (typically first-in-first-out). A `Deque` (double-ended queue) allows adding/removing from both ends. A `PriorityQueue` always returns the "highest priority" element first, not the oldest.

These exist to model real-world processing order requirements — task scheduling, breadth-first search, and priority-based processing all need this kind of structure.

---

### 3.6 Iterator and Iterable

`Iterable` is the interface that lets an object be used in a for-each loop. `Iterator` is the object that actually walks through elements one at a time, and can safely remove elements during iteration.

They exist to provide a uniform way to traverse any collection, without needing to know its internal structure (array vs. linked list vs. tree).

---

### 3.7 Comparable vs Comparator

`Comparable` lets a class define its own single, natural ordering (`compareTo`). `Comparator` defines an external, separate ordering (`compare`) that can be swapped in without changing the class itself.

They exist because sorting needs a defined notion of "which comes first," and sometimes that definition belongs to the object itself, and sometimes it needs to be flexible and external.

---

### 3.8 The Collections Utility Class

`Collections` is a utility class full of static helper methods for collections — sorting, searching, reversing, making them read-only or thread-safe, and more.

It exists so common, repetitive operations on collections don't need to be reimplemented by every developer from scratch.

> 💡 **Tip:** `Collection` (the interface) and `Collections` (this utility class) are easy to mix up by name — they are completely different things.

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

Generics let you write classes, interfaces, and methods that work with a *type you specify later*, rather than being locked to one specific type or falling back to `Object`.

They exist to catch type errors at compile time instead of runtime, and to remove the need for manual casting when reading values back out of a container.

```java
List<String> names = new ArrayList<>();
names.add("Ana");
String first = names.get(0); // no cast needed
```

---

### 4.2 Generic Classes

A generic class declares one or more type parameters in angle brackets after the class name, then uses those parameters throughout its body as if they were real types.

They exist so one class definition can serve many types safely — you write `Box<T>` once instead of writing `StringBox`, `IntegerBox`, and so on separately.

```java
class Box<T> {
    private T item;
    void set(T item) { this.item = item; }
    T get() { return item; }
}
```

---

### 4.3 Generic Methods

A generic method declares its own type parameter, independent of whether the enclosing class is generic. The type parameter goes before the return type.

They exist so a single utility method can operate on many types without sacrificing type safety or requiring the whole class to be generic.

---

### 4.4 Type Parameters and Naming Conventions

Type parameters are placeholder names for types. By convention Java uses single capital letters: `T` (type), `E` (element), `K` (key), `V` (value), `N` (number), `R` (result).

These conventions exist purely for readability — the compiler doesn't care about the name, but consistent naming makes generic code far easier to read across codebases.

---

### 4.5 Bounded Type Parameters

A bounded type parameter restricts which types can be substituted, using `extends`: `<T extends Number>` means T must be `Number` or a subclass of it.

Bounds exist because unbounded type parameters can only use `Object` methods — bounding tells the compiler more about T so you can actually call useful methods on it.

---

### 4.6 Wildcards

A wildcard `?` represents an unknown type. `? extends T` means "T or any subtype" (read-only), and `? super T` means "T or any supertype" (write-friendly).

Wildcards exist to make method parameters flexible — without them, a method accepting `List<Number>` would reject a `List<Integer>`, which is often too restrictive.

---

### 4.7 Type Erasure

Type erasure is how Java implements generics: type parameters exist only at compile time and are removed (erased) from the bytecode, replaced by their bounds (usually `Object`).

It exists so generic code stays binary-compatible with older pre-generics Java code and libraries, which was a hard requirement when generics were introduced.

> 💡 **Tip:** Erasure is why `List<String>` and `List<Integer>` are the *same class* at runtime.

---

### 4.8 Generics and Inheritance (Invariance)

Even though `Integer` is a subtype of `Number`, `List<Integer>` is **not** a subtype of `List<Number>`. Generic types are said to be *invariant*.

This rule exists to prevent type-safety holes — if it were allowed, you could add a `Double` into a list that was supposed to hold only `Integer`s.

---

### 4.9 Restrictions and Limitations

Because of type erasure, several things aren't allowed: you can't create `new T()`, can't create generic arrays (`new T[10]`), can't use primitives as type arguments (`List<int>`), and can't use `instanceof` with a specific type argument.

These restrictions exist as direct consequences of type information not being present at runtime.

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

An exception is an object representing something that went wrong during program execution — a missing file, a bad network call, invalid input.

Exceptions exist so error handling can be separated from normal logic. Without them, every method would have to return error codes that callers might silently ignore.

```java
try {
    int result = 10 / 0;
} catch (ArithmeticException e) {
    System.out.println("Cannot divide by zero");
}
```

---

### 5.2 The Throwable Hierarchy

Everything that can be thrown in Java descends from `Throwable`. Below it sit two branches: `Error` (serious problems the program shouldn't handle) and `Exception` (problems the program reasonably can handle).

The hierarchy exists so `catch` blocks can be as broad or as narrow as needed — catching a specific type, or a whole family of related failures.

---

### 5.3 Checked vs Unchecked Exceptions

Checked exceptions must be either caught or declared with `throws` — the compiler enforces it. Unchecked exceptions (`RuntimeException` and its subclasses) carry no such requirement.

This split exists to distinguish recoverable external failures (a file might genuinely be missing) from programming bugs (a null reference you should have prevented).

---

### 5.4 try-catch-finally

`try` wraps risky code, `catch` handles a specific failure, and `finally` runs regardless of whether an exception occurred.

`finally` exists to guarantee cleanup — closing files, releasing locks — even when something goes wrong partway through.

---

### 5.5 throw and throws

`throw` actually raises an exception at a point in your code. `throws` is a declaration in a method signature announcing that the method may raise a particular checked exception.

They exist to let a method signal failure upward when it cannot sensibly handle the problem itself.

---

### 5.6 try-with-resources

A form of `try` that automatically closes resources (files, connections, streams) when the block exits, whether normally or via an exception.

It exists because manual cleanup in `finally` blocks was verbose and easy to get wrong — resource leaks were a common bug.

```java
try (BufferedReader r = new BufferedReader(new FileReader("data.txt"))) {
    System.out.println(r.readLine());
} // r is closed automatically
```

---

### 5.7 Custom Exceptions

You can define your own exception classes by extending `Exception` or `RuntimeException`, giving failures meaningful, domain-specific names.

They exist so errors describe *what went wrong in your business domain* — `InsufficientFundsException` communicates far more than a generic `IllegalStateException`.

---

### 5.8 Exception Chaining

Chaining means wrapping one exception inside another, preserving the original as the "cause" while presenting a more meaningful exception to the caller.

It exists so you can translate a low-level failure into a higher-level one without losing the original diagnostic information.

---

### 5.9 Stack Traces

A stack trace is the record of which method calls were in progress when an exception occurred, printed from the failure point back to the program's entry.

It exists to tell you exactly where a failure happened and how the program got there — the single most useful debugging artifact in Java.

---

### 5.10 Errors vs Exceptions

`Error` represents serious problems outside your program's control — running out of memory, or the stack overflowing. `Exception` represents conditions your program can reasonably anticipate and handle.

The distinction exists to signal intent: you're expected to catch exceptions, and generally expected *not* to catch errors.

> 💡 **Tip:** Catching `Throwable` catches errors too, which is almost never what you want.

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

Functional programming means treating behavior as data — passing functions around like values, and describing *what* you want rather than *how* to loop through it step by step.

Java 8 added this style because loops with mutable counters were verbose and hard to parallelize. Describing intent lets the library handle the mechanics.

```java
// Imperative: how
List<String> result = new ArrayList<>();
for (String s : names) if (s.length() > 3) result.add(s.toUpperCase());

// Functional: what
List<String> result = names.stream()
    .filter(s -> s.length() > 3)
    .map(String::toUpperCase)
    .toList();
```

---

### 6.2 Lambda Expressions

A lambda is a short, anonymous function written inline — parameters, an arrow, and a body.

Lambdas exist to replace bulky anonymous inner classes. Passing behavior to a method used to take five lines of boilerplate; now it takes one.

```java
Runnable r = () -> System.out.println("running");
```

---

### 6.3 Functional Interfaces

A functional interface is any interface with exactly one abstract method. That single method is what a lambda supplies an implementation for.

They exist because Java needed lambdas to have a type. Rather than inventing a new function type, Java reused interfaces.

---

### 6.4 Built-in Functional Interfaces

Java ships a standard set in `java.util.function`: `Function` (takes one value, returns another), `Predicate` (returns true/false), `Consumer` (takes a value, returns nothing), and `Supplier` (takes nothing, produces a value).

They exist so every library doesn't invent its own near-identical interfaces for the same four shapes of behavior.

---

### 6.5 Method References

A method reference is shorthand for a lambda that does nothing but call one existing method: `String::toUpperCase` instead of `s -> s.toUpperCase()`.

They exist to remove the last bit of noise when the lambda adds nothing beyond naming a method that already exists.

---

### 6.6 What Is a Stream?

A stream is a pipeline for processing a sequence of elements. It doesn't store data — it pulls elements from a source and passes them through operations.

Streams exist to let you express multi-step data processing as a readable chain, instead of nested loops with temporary variables.

> 💡 **Tip:** A stream is single-use. Once consumed, you need a fresh one.

---

### 6.7 Intermediate Operations

Intermediate operations transform a stream into another stream — `filter` keeps matching elements, `map` converts each element, `sorted` orders them.

They exist as building blocks you chain together. Crucially, they're lazy: nothing actually runs until a terminal operation asks for results.

---

### 6.8 Terminal Operations

A terminal operation ends the pipeline and produces a result — a list, a number, a boolean, or a side effect. Examples: `collect`, `forEach`, `count`, `anyMatch`.

They exist because the pipeline needs a trigger. Without a terminal operation, a stream does nothing at all.

---

### 6.9 Collectors

Collectors describe how to gather stream elements into a final result — a list, a set, a map, a joined string, or grouped buckets.

They exist because "collect the results" has many possible meanings, and each needs its own recipe.

```java
Map<String, List<Person>> byCity = people.stream()
    .collect(Collectors.groupingBy(Person::getCity));
```

---

### 6.10 Optional

`Optional` is a container that either holds a value or is explicitly empty. It's a way of saying "this might legitimately have no result."

It exists to make absence visible in the type signature, so callers think about the empty case instead of being surprised by a `null`.

---

### 6.11 Parallel Streams

A parallel stream splits work across multiple CPU cores automatically, by adding `.parallel()` or calling `parallelStream()`.

It exists so you can use multiple cores without writing thread management code yourself. It's rarely the right choice, but it's one method call away when it is.

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

A process is a running program with its own isolated memory. A thread is a unit of execution *inside* a process — multiple threads in one process share the same memory.

This distinction exists because sharing memory makes communication between threads fast, but it's also the entire source of concurrency's difficulty.

---

### 7.2 Creating Threads

Java offers several ways to start a thread: extend `Thread`, implement `Runnable`, or (preferably) hand tasks to an `ExecutorService`.

They exist so you can run work in the background — handling many requests at once, or doing slow work without freezing everything else.

```java
Thread t = new Thread(() -> System.out.println("in a thread"));
t.start();
```

---

### 7.3 Thread Lifecycle

A thread moves through states: `NEW` (created), `RUNNABLE` (eligible to run), `BLOCKED`/`WAITING`/`TIMED_WAITING` (paused for some reason), and `TERMINATED` (finished).

The lifecycle exists because threads constantly pause — waiting for locks, for data, or for time to pass — and the JVM tracks why.

---

### 7.4 Race Conditions and Shared State

A race condition happens when two threads access shared data at the same time and the final result depends on which one happens to win.

This is the core problem concurrency creates. Everything else in this group exists to prevent it.

```java
count++;  // looks like one step; actually read, add, write - three steps
```

---

### 7.5 synchronized

`synchronized` marks a method or block so that only one thread can execute it at a time, using a lock built into every Java object.

It exists as the simplest way to make a sequence of operations indivisible, so no other thread can observe a half-finished change.

---

### 7.6 volatile

`volatile` marks a field so that every read sees the most recent write from any thread, rather than a stale cached copy.

It exists because threads may cache values locally for speed, which means one thread's update can be invisible to another indefinitely.

---

### 7.7 The Java Memory Model

The Java Memory Model (JMM) is the set of rules defining when one thread's writes become visible to another thread.

It exists because compilers and CPUs reorder instructions for speed. The JMM defines the guarantees you can actually rely on.

---

### 7.8 wait, notify, and notifyAll

These `Object` methods let threads coordinate: `wait()` pauses a thread and releases its lock, `notify()`/`notifyAll()` wake waiting threads back up.

They exist so a thread can pause until some condition becomes true, instead of wastefully checking in a loop.

---

### 7.9 Locks and the java.util.concurrent Package

`java.util.concurrent` provides explicit lock objects like `ReentrantLock`, plus coordination tools such as `CountDownLatch` and `Semaphore`.

They exist because `synchronized` is rigid — it can't time out, can't be interrupted, and can't be acquired in one method and released in another.

---

### 7.10 Atomic Variables

Atomic classes (`AtomicInteger`, `AtomicLong`, `AtomicReference`) provide thread-safe updates to a single value without using locks.

They exist because locking for a simple counter increment is heavy-handed; hardware offers a cheaper instruction for exactly this.

---

### 7.11 Executors and Thread Pools

An `ExecutorService` manages a pool of reusable threads and a queue of tasks, so you submit work rather than creating threads yourself.

Pools exist because creating a thread is expensive, and creating one per task will eventually exhaust the machine.

---

### 7.12 Callable, Future, and CompletableFuture

`Callable` is a task that returns a value. `Future` is a handle to a result that isn't ready yet. `CompletableFuture` extends this with chaining and combining.

They exist so you can start slow work, continue doing other things, and collect the result later.

---

### 7.13 Concurrent Collections

Collections such as `ConcurrentHashMap`, `CopyOnWriteArrayList`, and `BlockingQueue` are designed for safe use by many threads at once.

They exist because ordinary collections like `HashMap` corrupt silently under concurrent modification.

---

### 7.14 Deadlock, Livelock, and Starvation

Deadlock: two threads each hold a lock the other needs, so both wait forever. Livelock: threads keep reacting to each other and make no progress. Starvation: a thread never gets enough resources to run.

These names exist because they're the classic ways concurrent programs fail without crashing.

---

### 7.15 Virtual Threads

Virtual threads (Java 21+) are lightweight threads managed by the JVM rather than the operating system. You can have millions of them.

They exist because traditional threads are expensive, forcing complex asynchronous code. Virtual threads let you write simple blocking code that still scales.

> 💡 **Tip:** Virtual threads help with waiting (I/O), not with heavy computation.

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

The JVM has three main parts: a **class loader** that brings code in, **runtime memory areas** that hold data, and an **execution engine** that runs bytecode.

This structure exists so the same bytecode can run anywhere — the JVM handles all machine-specific details behind a fixed interface.

---

### 8.2 Class Loading

Class loading is how the JVM finds a `.class` file, verifies it's safe, and prepares it for use. It happens lazily — a class loads the first time it's actually needed.

It exists so programs can start fast and load only what they use, and so untrusted code can be checked before it runs.

---

### 8.3 Runtime Memory Areas

The JVM divides memory into distinct regions: the heap (objects), stacks (method calls), metaspace (class information), and a few smaller areas.

They exist because different kinds of data have different lifetimes, so separating them makes cleanup and management far simpler.

---

### 8.4 The Heap and Object Allocation

The heap is the shared memory region where all objects live. Every `new` allocates here, and the garbage collector reclaims space here.

It exists because objects need to outlive the method that created them, so they can't live on a stack that disappears when the method returns.

---

### 8.5 The Stack

Each thread gets its own stack. Every method call pushes a frame holding local variables and the return address; returning pops it off.

It exists because method calls are strictly nested — last called, first finished — which is exactly what a stack models.

```java
void a() { b(); }   // frame for a(), then frame for b() on top
```

---

### 8.6 Metaspace

Metaspace stores class metadata — the structure of your classes, method signatures, and similar information. It lives in native memory, outside the heap.

It exists because class information has a different lifetime from ordinary objects. It replaced the old fixed-size PermGen in Java 8.

---

### 8.7 Garbage Collection Basics

Garbage collection automatically frees memory used by objects nothing refers to any more.

It exists so developers don't manually free memory — eliminating an entire class of bugs like double-frees and dangling pointers.

> 💡 **Tip:** An object becomes collectable when it's *unreachable*, not when it goes out of scope.

---

### 8.8 Generational GC

Generational GC splits the heap into a **young generation** (new objects) and an **old generation** (long-lived ones), collecting the young area far more often.

It exists because of a consistent observation: most objects die very young. Focusing effort there makes collection much cheaper.

---

### 8.9 Garbage Collector Implementations

Java offers several collectors — Serial, Parallel, G1 (the default), ZGC, and Shenandoah — each trading throughput against pause time.

They exist because applications differ. A batch job wants maximum throughput; a trading system wants the shortest possible pauses.

---

### 8.10 References (Strong, Soft, Weak, Phantom)

A normal reference is *strong* and keeps an object alive. *Soft*, *weak*, and *phantom* references let the collector reclaim an object under varying conditions.

They exist to build caches and cleanup logic that cooperate with the collector instead of fighting it.

---

### 8.11 Memory Leaks in Java

Java can still leak memory — not by forgetting to free, but by holding references to objects you no longer need.

Understanding this matters because garbage collection prevents *some* memory bugs, not all of them.

---

### 8.12 JIT Compilation

The Just-In-Time compiler watches which code runs frequently and compiles those "hot" paths from bytecode into native machine code while the program runs.

It exists so Java gets both portability (bytecode) and speed (native code) rather than choosing one.

---

### 8.13 JVM Tuning and Monitoring

Tuning means configuring the JVM — heap size, collector choice, and similar options — through command-line flags. Monitoring means observing what it's actually doing.

They exist because defaults suit the average case, and production workloads are rarely average.

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

I/O (input/output) is how a program exchanges data with the outside world — files, networks, keyboards, other processes.

It exists because a program that can't read or write anything is useless. Java models all of this through a small set of consistent abstractions.

---

### 9.2 Byte Streams

Byte streams read and write raw bytes, one at a time or in chunks. The base classes are `InputStream` and `OutputStream`.

They exist because at the lowest level all data is bytes — images, executables, compressed archives, anything not meant to be read as text.

```java
try (InputStream in = new FileInputStream("photo.jpg")) {
    int b = in.read();   // one byte, or -1 at end
}
```

---

### 9.3 Character Streams (Readers and Writers)

Character streams read and write text, handling the conversion between bytes and characters. The base classes are `Reader` and `Writer`.

They exist because text isn't simply bytes — a character may occupy one byte or several, depending on the encoding. Readers handle that translation.

---

### 9.4 Buffering

Buffering means reading or writing a large chunk at once into a temporary memory area, instead of making a separate system call per byte.

It exists because each individual system call is slow. Grouping thousands of bytes into one call makes I/O dramatically faster.

---

### 9.5 The Decorator Pattern in Java I/O

Java I/O classes wrap each other, each adding a capability — buffering, encoding, compression — to the stream underneath.

This design exists so features combine freely, instead of needing a separate class for every possible combination.

```java
new BufferedReader(new InputStreamReader(new FileInputStream("f.txt")))
```

---

### 9.6 Character Encoding

An encoding is the rule mapping characters to bytes. UTF-8 is the modern standard; older schemes like ASCII and ISO-8859-1 handle fewer characters.

Encodings exist because computers store bytes, but humans write in many scripts. The mapping between them must be agreed on by both writer and reader.

> 💡 **Tip:** Always state the encoding explicitly. Relying on the platform default causes bugs that only appear on other machines.

---

### 9.7 File Handling: File vs Path

`File` is the original API for working with files and directories. `Path`, with the `Files` helper class, is the modern replacement.

`Path` exists because `File` was limited — its methods returned `false` on failure without explaining why, and it lacked support for symbolic links and file attributes.

---

### 9.8 NIO.2 and the Files API

NIO.2 (Java 7) introduced `Path`, `Files`, directory walking, file watching, and proper exceptions for filesystem operations.

It exists to replace the weaker `File` API with something that reports real errors and covers what modern filesystems actually support.

---

### 9.9 Channels and Buffers

A channel is a connection to a file or socket; a buffer is a fixed-size container that data is read into or written from.

They exist as a lower-level, higher-performance alternative to streams, and are the foundation for non-blocking I/O.

---

### 9.10 Non-Blocking I/O and Selectors

Non-blocking I/O lets one thread manage many connections. A `Selector` watches multiple channels and reports which ones are ready.

It exists because a thread per connection doesn't scale to tens of thousands of clients — the threads cost too much memory and switching time.

---

### 9.11 Serialization

Serialization converts an object into bytes so it can be saved or sent, and deserialization turns those bytes back into an object.

It exists to let objects persist beyond a program's lifetime or travel between machines.

> ⚠️ **Warning:** Java's built-in serialization has serious security problems. Modern code uses formats like JSON instead.

---

### 9.12 Resource Management

Files, sockets, and streams hold operating system resources that must be released. `try-with-resources` closes them automatically.

It exists because the operating system limits how many files a process may hold open, and leaked handles eventually break everything.

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

Since Java 9, a new version ships every six months, with a **Long-Term Support (LTS)** release roughly every two years — Java 11, 17, and 21 being recent ones.

This exists because the old multi-year release cycle delayed features badly. Frequent small releases deliver improvements sooner, while LTS versions give production systems a stable target.

---

### 10.2 var and Local Variable Type Inference

`var` lets you declare a local variable without writing its type; the compiler infers it from the assigned value.

It exists to reduce repetitive typing where the type is already obvious from the right-hand side.

```java
var names = new ArrayList<String>();   // inferred as ArrayList<String>
```

> 💡 **Tip:** `var` is still statically typed. The type is fixed at compile time — it just isn't written out.

---

### 10.3 Text Blocks

A text block is a multi-line string literal written between triple quotes, preserving line breaks without escape characters.

They exist because embedding JSON, SQL, or HTML in Java used to require concatenation and escaped quotes, which was painful to read and easy to get wrong.

```java
String json = """
    {"name": "Ana", "role": "engineer"}
    """;
```

---

### 10.4 Records

A record is a concise way to declare a class that simply holds data. One line generates the constructor, accessors, `equals`, `hashCode`, and `toString`.

They exist because ordinary data-carrier classes required dozens of lines of boilerplate that was easy to write incorrectly.

```java
record Point(int x, int y) { }
```

---

### 10.5 Sealed Classes

A sealed class or interface explicitly lists which types are allowed to extend or implement it.

It exists so you can define a closed set of possibilities — useful when you want the compiler to know every case has been handled.

---

### 10.6 Pattern Matching for instanceof

Pattern matching lets you test a type and bind a variable in one step, removing the separate cast.

It exists because the old test-then-cast pattern repeated the type name and added a line for no benefit.

```java
if (obj instanceof String s) {
    System.out.println(s.length());   // no cast needed
}
```

---

### 10.7 Switch Expressions and Pattern Matching for switch

Switch expressions return a value and use arrow syntax with no fall-through. Pattern matching extends switch to match on types, not just constants.

They exist to remove the fall-through bugs of the old switch statement and to make type-based branching readable.

---

### 10.8 Enhanced Enums and Utility Methods

Modern Java added many small conveniences: collection factory methods (`List.of`), `Optional` improvements, new `String` methods (`isBlank`, `strip`, `repeat`), and `Stream.toList()`.

They exist to cover everyday tasks that previously needed helper libraries or awkward workarounds.

---

### 10.9 The HTTP Client

Java 11 added a built-in HTTP client supporting HTTP/2, both synchronous and asynchronous requests, and WebSocket.

It exists because the old `HttpURLConnection` was awkward and outdated, forcing most projects to add a third-party library for basic HTTP calls.

---

### 10.10 Structured Concurrency and Scoped Values

Structured concurrency treats a group of related concurrent tasks as a single unit, so they start and finish together. Scoped values share data with those tasks safely.

They exist because unstructured concurrent tasks can leak, outlive their purpose, or be forgotten — problems structure prevents by design.

> ⚠️ **Warning:** These arrived as preview features. Check whether they're finalized in your target Java version before using them in production.

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

Reflection lets a program examine and modify itself at runtime — discovering what classes exist, what methods they have, and calling those methods without knowing them at compile time.

It exists because frameworks must work with code they've never seen. Spring can inject into your classes, and Jackson can serialize them, only because reflection lets them inspect arbitrary types.

---

### 11.2 The Class Object

Every type in Java has a corresponding `Class` object describing it. It's the entry point for all reflection.

It exists because reflection needs somewhere to ask questions about a type, and the `Class` object is that starting point.

```java
Class<?> c = "hello".getClass();   // class java.lang.String
Class<?> d = String.class;          // same thing, without an instance
```

---

### 11.3 Inspecting Fields, Methods, and Constructors

Reflection can list a class's fields, methods, and constructors, along with their names, types, and modifiers.

This exists so tools can understand a class's structure — which is how an ORM knows what columns to map, or a test framework knows which methods to run.

---

### 11.4 Creating Objects and Invoking Methods Reflectively

Reflection can construct objects and call methods chosen at runtime, using names resolved from configuration or annotations.

It exists so frameworks can instantiate your classes and call your methods without those names being written into the framework's code.

---

### 11.5 Accessing Private Members

Reflection can bypass access modifiers, reading and writing private fields and calling private methods.

It exists because frameworks sometimes need to set fields that have no setter — though it's also why access modifiers are a design guideline rather than a security boundary.

> ⚠️ **Warning:** Modern Java restricts this more tightly than older versions did.

---

### 11.6 What Are Annotations?

An annotation is metadata attached to code — a label on a class, method, or field that doesn't change behavior by itself.

Annotations exist to let tools and frameworks find and act on marked code, replacing the XML configuration files that older frameworks required.

```java
@Override
public String toString() { return "example"; }
```

---

### 11.7 Built-in Annotations

Java ships several standard annotations: `@Override`, `@Deprecated`, `@SuppressWarnings`, `@FunctionalInterface`, and `@SafeVarargs`.

They exist to let the compiler verify your intent — catching typos in overridden method names, warning about outdated APIs, and similar.

---

### 11.8 Creating Custom Annotations

You can define your own annotations with `@interface`, optionally giving them parameters.

They exist so your own frameworks and tools can mark code meaningfully, in your own vocabulary rather than borrowed conventions.

---

### 11.9 Retention and Target

Retention controls how long an annotation survives — source only, in the class file, or available at runtime. Target controls where it can be applied.

These exist because annotations serve different purposes: some only guide the compiler, while others must be readable when the program runs.

---

### 11.10 Reading Annotations at Runtime

Annotations marked for runtime retention can be discovered through reflection, letting a framework find every method or class carrying a given marker.

This exists because a marker nobody reads is useless — this is the step that turns metadata into behavior.

---

### 11.11 Annotation Processing at Compile Time

An annotation processor runs during compilation, reading annotations and generating additional source code or reporting errors.

It exists as a faster, safer alternative to runtime reflection — the work happens once at build time rather than repeatedly while the program runs.

---

### 11.12 Dynamic Proxies

A dynamic proxy is an object created at runtime that implements an interface and forwards calls to a handler you supply.

They exist so behavior can be added around existing code without modifying it — logging, transactions, and security checks are typical uses.

---

### 11.13 MethodHandles and VarHandles

`MethodHandle` and `VarHandle` are a modern, faster alternative to classic reflection for calling methods and accessing fields.

They exist because traditional reflection is slow; these are designed so the JVM can optimize them nearly as well as ordinary code.

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

The Java Platform Module System, introduced in Java 9, groups packages into **modules** that declare what they need and what they expose.

It exists because the classpath had no structure — any class could access any other public class, dependencies were unchecked until runtime, and the JDK itself couldn't be split into smaller pieces.

---

### 12.2 The module-info.java Descriptor

A module is defined by a file named `module-info.java` at the root of its source, declaring the module's name and its relationships.

It exists to make dependencies explicit and machine-checkable, rather than implied by whatever happens to be on the classpath.

```java
module com.example.orders {
    requires com.example.common;
    exports com.example.orders.api;
}
```

---

### 12.3 requires

`requires` declares that this module depends on another. The compiler and JVM both verify the dependency is present.

It exists so missing dependencies fail immediately at startup, instead of surfacing as `NoClassDefFoundError` much later.

---

### 12.4 exports

`exports` declares which packages are visible to other modules. Anything not exported is inaccessible from outside, even if its classes are `public`.

It exists so a library can have genuine internal packages — implementation details nobody outside can depend on.

---

### 12.5 opens

`opens` permits deep reflection into a package at runtime, which `exports` alone does not allow.

It exists because frameworks like Spring and Hibernate need reflective access to your classes, and that access is separate from ordinary compile-time visibility.

---

### 12.6 Services: uses and provides

`uses` declares that a module consumes a service interface; `provides` declares that a module supplies an implementation of one.

They exist to support plugin-style architectures where implementations are discovered at runtime rather than named directly.

---

### 12.7 The Module Path vs the Classpath

Code placed on the **module path** participates in the module system. Code on the **classpath** behaves as it always has.

Both exist because billions of lines of existing Java predate modules, and that code must keep working unchanged.

---

### 12.8 Automatic and Unnamed Modules

A plain JAR placed on the module path becomes an **automatic module**, getting a name derived from its filename. Code on the classpath lives in the single **unnamed module**.

These exist as bridges, letting modularized code depend on libraries that aren't modularized yet.

---

### 12.9 Strong Encapsulation

Strong encapsulation means the JDK's internal packages are genuinely inaccessible — not merely discouraged.

It exists because widespread use of internal APIs made the JDK nearly impossible to change without breaking libraries.

> ⚠️ **Warning:** This is the main reason upgrading from Java 8 is harder than later upgrades.

---

### 12.10 jlink and Custom Runtimes

`jlink` builds a custom Java runtime containing only the modules an application actually uses.

It exists so applications can ship a small runtime instead of a full JDK — valuable for containers and embedded systems.

---

### 12.11 Migration Strategy

Migrating to modules is incremental: move to a newer Java version first on the classpath, then modularize gradually if there's benefit.

A strategy exists because full modularization is optional. Most applications adopt the newer JDK without ever writing a `module-info.java`.

---

[[#📖 Master Table of Contents|⬆ Back to top]]

*End of Group 12 — curriculum complete.*

---

## 🎓 Where to Go Next

You now have a complete mental map of Java. You should be able to say: *"I know what every concept is."*

Continue to **`1_understand.md`**, which expands every topic in this same order with mechanisms, diagrams, trade-offs, and common misconceptions — so you can say *"I understand how this works."*
