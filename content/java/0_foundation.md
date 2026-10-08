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

Java is a general-purpose, statically typed, class-based object-oriented programming language. Code you write is compiled into an intermediate form called **bytecode**, which can run on any machine that has a Java Virtual Machine (JVM).

It exists because programs compiled directly to machine code run only on the kind of machine and operating system they were built for. Java solved this by adding a translation layer (the JVM) between your code and the machine: you compile once to bytecode, and a JVM built for each platform runs it.

> 💡 **Tip:** Java's famous slogan is "Write Once, Run Anywhere" (WORA). That's the problem it was built to solve — though details such as file paths and native libraries can still differ between platforms (1.3).

```java
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello, Java");
    }
}
// javac Hello.java   → produces Hello.class (bytecode)
// java Hello         → a JVM loads and runs that bytecode
```

---

### 1.2 JVM, JRE, and JDK

Running a Java program and building one need different things — a server only runs code, a developer also compiles it. These three terms are easy to confuse but represent three different things:

- **JVM (Java Virtual Machine):** The engine that actually runs your bytecode — it loads classes, checks them, executes them and frees memory you no longer use. It's what makes Java platform-independent.
- **JRE (Java Runtime Environment):** The JVM plus the standard libraries needed to *run* Java programs.
- **JDK (Java Development Kit):** The JRE plus tools needed to *build* Java programs (compiler, debugger, etc.).

They exist as separate layers because not everyone needs to do everything — someone only *running* a Java app doesn't need a compiler.

```
JDK  ⊃  JRE  ⊃  JVM
(build)  (run)  (execute)
```

This nesting is a conceptual model. Modern JDKs (9 and later) are built from modules, many vendors no longer ship a separate JRE download, and you can create a trimmed runtime containing only the modules your application uses with the JDK's `jlink` tool.

---

### 1.3 Platform Independence & Bytecode

When you compile a `.java` file, the compiler (`javac`) doesn't produce machine code — it produces `.class` files containing **bytecode**, a compact set of instructions designed for the JVM rather than for any real processor.

This exists to solve the "compile once per OS" problem. The JVM for Windows, Mac, or Linux each knows how to run the same bytecode on its own machine — interpreting it, or compiling it to that machine's native instructions as the program runs.

> 📝 **Note:** This is the core reason Java is called "platform-independent" — the *bytecode* is portable, even though the JVM itself is platform-specific. Your program can still depend on the platform through the things it touches: file paths, line endings, native libraries.

```
Hello.java  --javac-->  Hello.class (bytecode)  --JVM on Windows / macOS / Linux-->  runs
```

---

### 1.4 Variables and Data Types

Programs need to remember values — a count, a name, a price — and refer to them by name. A variable is a named storage location that holds one value of a fixed type. Java is **statically typed** — every variable has a fixed type decided at compile time, and the compiler rejects code that puts the wrong kind of value in it.

Java splits types into two families:
- **Primitive types** (`int`, `double`, `boolean`, `char`, and four more — 1.5) — the variable holds the value itself.
- **Reference types** (classes such as `String`, interfaces, arrays) — the variable holds a *reference*: a value that identifies an object, or `null` for no object. Two variables can hold references to the same object.

This split exists for performance: primitives are small, fixed-size, and fast, while reference types support the rich, extensible object model Java needs.

Variables come in four kinds: **local variables** inside methods, **parameters**, **instance fields** (one per object) and **static fields** (one per class). Fields get a default value (`0`, `false`, `null`) if you don't set one; a local variable must be assigned before it is read, or the code doesn't compile.

```java
int count = 3;          // primitive: the variable holds the number 3
String name = "Ada";    // reference: the variable holds a reference to a String object
String same = name;     // copies the reference — still one String object
String none = null;     // a reference variable can refer to no object; an int can't be null
```

---

### 1.5 Primitive Types and Literals

Numbers, characters and true/false values are so common that Java builds them into the language instead of making them objects. Java has exactly eight **primitive types**: four whole-number types (`byte`, `short`, `int`, `long`), two floating-point types (`float`, `double`), `char` for a single 16-bit UTF-16 code unit, and `boolean` for `true`/`false`. Each has a fixed size and range on every platform. A **literal** is a value written directly in code — `42`, `3.14`, `'A'`, `true`.

They exist so arithmetic and comparisons are fast and predictable everywhere. Two behaviours surprise beginners: whole-number arithmetic that goes past the type's range *wraps around* instead of failing, and floating-point numbers are binary approximations, so `0.1 + 0.2` is not exactly `0.3`.

```java
int count = 42;                 // whole numbers default to int
long population = 8_000_000_000L; // L suffix for long; _ for readability
double price = 19.99;           // decimals default to double
float ratio = 0.5f;             // f suffix for float
char letter = 'A';              // one character in single quotes
boolean done = false;           // only true or false

int max = Integer.MAX_VALUE;
max++;                          // wraps around to -2147483648
```

---

### 1.6 Type Conversion, Casting and Boxing

Values often need to move between types — an `int` count into a `long` total, a `double` average into an `int` score, a number into a collection that only holds objects. Java converts automatically when nothing can be lost (**widening**: `int` → `long`), and makes you write an explicit **cast** when information might be lost (**narrowing**: `(int) 3.9` is `3`). In arithmetic, smaller types are first promoted: `byte + byte` gives an `int`.

**Boxing** converts a primitive to its wrapper object (`int` → `Integer`) and **unboxing** converts back; Java does both automatically. It exists because collections and generics work only with objects. Two consequences: unboxing `null` throws `NullPointerException`, and `==` on two wrapper objects compares references, not numbers — use `equals()`.

```java
int count = 10;
long total = count;          // widening: automatic
double avg = 7.8;
int score = (int) avg;       // narrowing: explicit cast, gives 7 (truncates)

byte a = 10, b = 20;
int sum = a + b;             // byte + byte is an int
// byte s = a + b;           // compile error: possible lossy conversion from int to byte

Integer boxed = count;       // boxing
int back = boxed;            // unboxing
Integer missing = null;
// int n = missing;          // compiles, but throws NullPointerException
```

---

### 1.7 Operators

Operators are symbols that perform operations on values: arithmetic (`+ - * / %`), relational (`== != > < >= <=`), logical (`&& || !`), assignment (`= += -=`), increment and decrement (`++ --`), the ternary `?:`, bitwise and shift operators, and others. Combined with values they form *expressions*, which Java evaluates left to right.

They exist simply because every language needs a compact way to express computation and comparisons — writing `a + b` is far more usable than calling a function for every addition. Two rules catch beginners: dividing two integers drops the remainder (`5 / 2` is `2`), and `&&`/`||` stop as soon as the answer is known, so the right-hand side may never run.

```java
int a = 7, b = 2;
System.out.println(a / b);     // 3   — integer division
System.out.println(a % b);     // 1   — remainder
System.out.println(a / 2.0);   // 3.5 — one double operand makes it floating point

int count = 5;
count++;                       // count is now 6
String label = count > 3 ? "many" : "few";   // ternary: "many"

String name = null;
if (name != null && name.length() > 3) { }   // safe: length() is never called when name is null
```

---

### 1.8 Control Flow Statements

Control flow statements decide *which* code runs and *how many times*. Java provides:
- **Conditional:** `if / else if / else`, and `switch` — as a statement, or as an expression that produces a value
- **Looping:** `for`, `while`, `do-while`, and the enhanced `for` that walks through every element of an array or collection
- **Jumping:** `break` (leave a loop or switch), `continue` (skip to the next iteration), `return` (leave the method)

They exist because real programs aren't a straight line of instructions — they need to branch based on data and repeat work without rewriting code.

```java
int[] scores = {72, 95, 48};
for (int s : scores) {                       // enhanced for: each element in turn
    if (s >= 90) System.out.println("A");
    else if (s >= 60) System.out.println("Pass");
    else System.out.println("Fail");
}

String size = switch (scores.length) {       // switch expression: produces a value
    case 0 -> "empty";
    case 1, 2, 3 -> "small";
    default -> "large";
};
```

---

### 1.9 Arrays

An array is a fixed-size, ordered collection of elements of the same type. In Java an array is an object: it is created with `new` (or an initializer), it knows its own `length`, and its elements are numbered from `0` to `length - 1`.

Arrays exist to let you group related values together and access any one of them instantly using an index, instead of creating a separate variable for each value. The size is fixed when the array is created; elements start at default values (`0`, `false`, `null`) until you set them.

```java
int[] scores = {90, 85, 77};
System.out.println(scores[1]);       // 85
System.out.println(scores.length);   // 3 — a field, not a method

String[] names = new String[2];      // elements start as null
names[0] = "Ada";

int[][] grid = new int[2][3];        // an array of 2 arrays, each holding 3 ints
grid[1][2] = 7;
```

---

### 1.10 Strings

Almost every program handles text — names, messages, JSON, SQL. In Java, text is a `String`: an object (a reference type, not a primitive) holding a sequence of `char`s. Strings are **immutable** — once created, a `String` never changes; methods such as `toUpperCase()` or `replace()` return a *new* string. String literals in double quotes (`"hello"`) are shared: every identical literal refers to the same `String` object.

It exists as a built-in, immutable type so text can be shared safely between any parts of a program, used as a map key, and passed around without copying. Compare strings with `equals()`, never `==`, which only checks whether two references point to the same object. To build a string piece by piece, use a `StringBuilder`.

```java
String greeting = "Hello";
String name = "Ada";
String message = greeting + ", " + name + "!";   // + concatenates: "Hello, Ada!"
System.out.println(message.length());            // 11

String upper = name.toUpperCase();               // "ADA" — name itself is unchanged
System.out.println(name.equals("Ada"));          // true — compare content with equals

StringBuilder sb = new StringBuilder();
for (int i = 1; i <= 3; i++) sb.append(i).append(' ');
System.out.println(sb.toString());               // "1 2 3 "
```

---

### 1.11 Methods

A method is a named, reusable block of code that performs a task, optionally taking inputs (parameters) and producing an output (return value). The values a caller passes in are *arguments*; the method receives copies of them in its *parameters*. A method that returns nothing is declared `void`.

Methods exist to avoid repeating the same logic everywhere it's needed — you write the logic once and *call* it wherever required. Java always passes arguments **by value**: the method gets a copy of each value — and for an object, that value is a copy of the *reference*, so the method can change the object but not which object the caller's variable refers to.

```java
static int add(int a, int b) {        // name, parameters, return type
    return a + b;
}

static void greet(String name) {      // void: returns nothing
    System.out.println("Hello, " + name);
}

int sum = add(2, 3);                  // arguments 2 and 3 → sum is 5
greet("Ada");                         // prints Hello, Ada
```

---

### 1.12 Packages and Imports

A package is a namespace that groups related classes together (e.g., `java.util`). An `import` statement lets a file use classes from another package without writing their full name every time. Importing doesn't download, load or run anything — it only lets you write `List` instead of `java.util.List`. Classes in `java.lang` (`String`, `System`, `Math`) are available everywhere without an import.

Packages exist to avoid naming collisions (two classes named `List` from different libraries) and to organize large codebases logically. A class's full name includes its package — `java.util.List` — and package-private members are visible only inside their package (2.7).

```java
package com.shop.orders;                 // this file's classes belong to com.shop.orders

import java.util.List;                   // now "List" means java.util.List in this file
import java.time.LocalDate;

public class OrderService {
    List<String> ids = List.of("A1");
    LocalDate today = LocalDate.now();
    java.util.Map<String, Integer> stock; // or use the fully qualified name, no import needed
}
```

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

A program that tracks dogs needs each dog's data and the code that works on it kept together. A class is a blueprint describing what data (fields) and behavior (methods) something has. An object is a concrete instance created from that blueprint using `new`.

Classes exist because real-world modeling needs data and the logic that operates on it to travel together, instead of being scattered across unrelated functions and variables.

A variable of a class type never holds the object itself — it holds a **reference** that leads to the object. `Dog rex;` creates a variable and no dog; only `new` creates an object. Two variables can refer to the same object, and a variable that refers to no object holds `null`.

```java
class Dog {
    String name;
    void bark() { System.out.println(name + " says woof"); }
}
Dog rex = new Dog();   // new creates the object; rex holds a reference to it
rex.name = "Rex";
rex.bark();            // Rex says woof

Dog same = rex;        // copies the reference, not the dog — still one object
same.name = "Max";
rex.bark();            // Max says woof
```

---

### 2.2 Constructors

An object straight out of `new` has only default values — `0`, `false`, `null` — and most objects are meaningless that way. A constructor is a special block of code that runs automatically when an object is created with `new`, used to set up its starting state. It has the class's name and no return type.

Constructors exist so a class has one place to put every new object into a valid starting state: they run as part of normal object creation, which is why they are where a class checks its arguments and establishes its rules (its *invariants*). If you write no constructor at all, the compiler supplies an empty no-argument one, called the **default constructor**.

```java
class Dog {
    String name;
    Dog(String name) {                 // constructor: same name as the class, no return type
        if (name == null || name.isBlank()) throw new IllegalArgumentException("name required");
        this.name = name;
    }
}
Dog rex = new Dog("Rex");              // runs the constructor
```

---

### 2.3 The this and super Keywords

Inside a class's own code you often need to name the object the code is running on — and, in a class that extends another (2.6), to reach the version of a member the parent class provides. `this` refers to the current object. `super` reaches the parent-class part of that same object: `super.method()` runs the parent's version of a method, and `super(...)` calls a parent constructor. There is still only one object — `super` is not a second one.

They exist to resolve naming conflicts (like a constructor parameter sharing a name with a field) and to let a subclass explicitly reach up into its parent's constructor or methods.

```java
class Animal {
    void describe() { System.out.println("An animal"); }
}
class Dog extends Animal {
    String name;
    Dog(String name) {
        super();            // parent constructor runs first
        this.name = name;   // this.name is the field; name is the parameter
    }
    @Override
    void describe() {
        super.describe();   // the parent's version, on this same object
        System.out.println("and its name is " + name);
    }
}
```

---

### 2.4 Static vs Instance Members

Some data describes one object and some describes the class as a whole — and a counter of all dogs stored inside each dog would give a different count per dog. An instance member belongs to each individual object; a static member belongs to the class itself and is shared by every instance.

They exist because some data is naturally per-object (a dog's name) while other data is naturally shared across all objects (how many dogs have been created in total). Because a static method runs without any particular object, it has no `this` and cannot use instance fields directly.

```java
class Dog {
    static int created = 0;  // one copy, shared by the class
    String name;             // one copy per Dog object

    Dog(String name) { this.name = name; created++; }

    static int count() {
        return created;      // fine: static
        // return name.length();  // compile error: which dog's name?
    }
}
new Dog("Rex"); new Dog("Max");
System.out.println(Dog.count()); // 2
```

---

### 2.5 Encapsulation

If any code anywhere can write `account.balance = -500`, no rule about balances can ever be relied on. Encapsulation means bundling data together with the methods that operate on it, and hiding the internal details behind a controlled public interface.

It exists to protect an object's internal state from being changed in invalid, unexpected ways by code outside the class. The usual mechanism is `private` fields plus methods that express what callers may *do* — `withdraw(amount)`, not `setBalance(anything)` — so every change passes through code that checks the rules. Generating a getter and a setter for every field is not encapsulation: it lets callers change anything, just more verbosely.

```java
class BankAccount {
    private BigDecimal balance = BigDecimal.ZERO;   // nobody outside can touch it directly

    void withdraw(BigDecimal amount) {
        if (amount.signum() <= 0) throw new IllegalArgumentException("amount must be positive");
        if (amount.compareTo(balance) > 0) throw new IllegalStateException("insufficient funds");
        balance = balance.subtract(amount);         // the only way the balance goes down
    }
}
```

---

### 2.6 Inheritance

Code that works with "any animal" needs dogs and cats to *be* animals — usable anywhere an `Animal` is expected. Inheritance lets one class (the child/subclass) declare that it **is a** kind of another class (the parent/superclass) with `extends`: the subclass gets the parent's accessible fields and methods, can add its own, and can override the parent's methods.

It exists to model genuine IS-A relationships — a `Dog` *is an* `Animal` — so that a subclass object can be used wherever the parent type is expected (polymorphism, 2.12). Reusing the parent's code comes along with that, but reuse alone is not a reason to inherit: if "is a" isn't true, use composition (2.8). A Java class extends exactly one class; every class without `extends` extends `Object`.

```java
class Animal {
    void eat() { System.out.println("Eating..."); }
}
class Dog extends Animal {            // a Dog IS-A Animal
    void bark() { System.out.println("Woof"); }
}
Animal pet = new Dog();               // allowed: every Dog is an Animal
pet.eat();                            // inherited from Animal
```

---

### 2.7 Access Modifiers

Encapsulation needs a way to say "only this class may touch this field". Access modifiers (`public`, `protected`, `private`, and package-private/default) control which parts of a program are allowed to see or use a class, field, method, or constructor.

They exist to enforce encapsulation at the language level, so accidental or unwanted access from unrelated code is a compile error, not a runtime surprise. From narrowest to widest: `private` (this class only), package-private — no keyword — (this package), `protected` (this package *plus* subclasses elsewhere), `public` (everyone).

```java
package com.shop;

public class Order {
    private long totalCents;          // only code inside Order
    String status;                    // package-private: any class in com.shop
    protected void recalculate() {}   // com.shop, plus subclasses in other packages
    public long total() { return totalCents; }  // anyone
}
```

---

### 2.8 Composition, Aggregation and Association

A `Car` is not a kind of `Engine`, but it needs one. **Composition** means building a class out of other objects it holds in fields — a **HAS-A** relationship — instead of inheriting from them (**IS-A**, 2.6). The class delegates work to those parts by calling their methods.

Design vocabulary names three strengths of HAS-A: **association** (one object knows or uses another — a `Driver` and a `Car`), **aggregation** (a whole groups parts that can exist without it — a `Team` and its `Player`s) and **composition** (the whole owns parts that live and die with it — an `Order` and its `OrderLine`s). Java has one mechanism for all three — a field holding a reference — so the difference lies in how the class treats the part, not in syntax. "Composition over inheritance" means: when you only want another class's behaviour, hold an instance of it rather than extend it.

```java
class Engine {
    void start() { System.out.println("Engine started"); }
}
class Car {                            // Car HAS-A Engine
    private final Engine engine;
    Car(Engine engine) { this.engine = engine; }
    void start() { engine.start(); }   // delegate the work to the part
}
```

---

### 2.9 Method Overloading

`System.out.println` prints an `int`, a `String` or a `double` — one verb for different inputs. **Method overloading** means a class has several methods with the same name but different parameter lists (a different number, types or order of parameters). The compiler picks which one to call from the types of the arguments, at compile time.

It exists so related operations can share one natural name instead of `printInt`, `printString`, `printDouble`. Only the parameter list tells overloads apart — a different return type alone is not allowed. Constructors are overloaded the same way (2.2).

```java
class Printer {
    void print(int x)    { System.out.println("int: " + x); }
    void print(double x) { System.out.println("double: " + x); }
    void print(String x) { System.out.println("String: " + x); }
}
Printer p = new Printer();
p.print(5);       // int: 5
p.print(5.0);     // double: 5.0
p.print("five");  // String: five
```

---

### 2.10 Method Overriding

Every `Animal` can make a sound, but a dog and a cat make different ones. **Method overriding** means a subclass provides its own implementation of an instance method it inherits, keeping the same name and parameter list. When the method is called on an object, the object's own class decides which version runs — even if the variable's type is the parent (2.12).

It exists so a subclass can specialise inherited behaviour while callers keep using the parent type. Mark every override with `@Override`: the compiler then checks that the method really overrides something. `private`, `static` and `final` methods cannot be overridden.

```java
class Animal {
    void sound() { System.out.println("..."); }
}
class Dog extends Animal {
    @Override
    void sound() { System.out.println("Woof"); }   // replaces Animal's version for Dogs
}
Animal a = new Dog();
a.sound();   // Woof — the object is a Dog
```

---

### 2.11 Overriding vs Hiding

Overriding (2.10) works only for instance methods, because it needs an object to decide which version runs. When a subclass declares a **static method** or a **field** with the same name as one in its parent, it doesn't replace the parent's — it **hides** it. Both versions exist, and which one you get depends on the type written in the code (the declared type), fixed at compile time — not on the object.

It matters because the two look alike in source but behave differently. With `Parent p = new Child();`, `p.who()` runs the child's instance method, while `p.kind()` (static) and `p.name` (a field) give the parent's.

```java
class Parent {
    String name = "parent";
    static String kind() { return "Parent.kind"; }
    String who() { return "Parent.who"; }
}
class Child extends Parent {
    String name = "child";                          // hides Parent.name
    static String kind() { return "Child.kind"; }   // hides Parent.kind()
    @Override String who() { return "Child.who"; }  // overrides Parent.who()
}
Parent p = new Child();
System.out.println(p.who());    // Child.who   — overriding: the object decides
System.out.println(p.kind());   // Parent.kind — hiding: the declared type decides
System.out.println(p.name);     // parent      — hiding: the declared type decides
```

---

### 2.12 Polymorphism

Code that draws "a shape" should work for circles, squares and shapes invented next year, without asking which one it has. **Polymorphism** ("many forms") means one piece of code works with values of many types. Java has two kinds: **compile-time polymorphism** — method overloading (2.9), where the compiler picks among same-named methods by argument types — and **runtime polymorphism** — method overriding (2.10), where a call on a parent-typed reference runs the version belonging to the actual object, decided while the program runs (*dynamic dispatch*).

It exists so code can work generically with a whole family of related types, without needing to know or check each object's exact class. The variable's declared type decides which methods you may *call*; the object's actual class decides which overriding implementation *runs*.

```java
class Shape  { double area() { return 0; } }
class Circle extends Shape {
    double r = 1;
    @Override double area() { return Math.PI * r * r; }
}
class Square extends Shape {
    double side = 2;
    @Override double area() { return side * side; }
}

for (Shape s : List.of(new Circle(), new Square())) {
    System.out.println(s.area());   // 3.14159..., then 4.0 — each object's own area()
}
```

---

### 2.13 Upcasting and Downcasting

A variable of a parent type can hold any subclass object. **Upcasting** is treating a subclass object as its parent type — `Animal a = new Dog();` — and it is automatic and always safe, because every `Dog` is an `Animal`. **Downcasting** goes the other way — `Dog d = (Dog) a;` — and needs an explicit cast, because not every `Animal` is a `Dog`.

A cast never changes the object; it changes only the type through which the compiler lets you use it. If the object isn't really of the target type, a downcast fails at runtime with `ClassCastException`, so check first with `instanceof`.

```java
Animal a = new Dog();        // upcast: automatic, always safe
Dog d = (Dog) a;             // downcast: explicit; works because the object is a Dog

Animal c = new Cat();
// Dog wrong = (Dog) c;      // compiles, but throws ClassCastException at runtime

if (c instanceof Dog dog) {  // test first (Java 16+ binds the variable too)
    dog.fetch();             // not reached: c is a Cat
}
```

---

### 2.14 Abstraction

Driving a car means using a wheel and two pedals, not timing the fuel injection. Abstraction means exposing only what's necessary and hiding the complexity underneath: a type offers the essential operations of a concept — *what* it does — and leaves out *how*.

It exists so code can depend on what something does rather than how it does it, which keeps callers simple and lets the implementation change without touching them. Abstraction is a design principle, not a keyword. Java offers several mechanisms for it — interfaces (2.16), abstract classes (2.15), and even an ordinary class whose public methods are well chosen.

```java
interface Notifier {
    void send(String to, String message);      // what: all a caller needs to know
}
class EmailNotifier implements Notifier {
    @Override
    public void send(String to, String message) {
        // how: SMTP connection, templates, retries — invisible to callers
    }
}
```

---

### 2.15 Abstract Classes

Some classes share real code but one step has no sensible default — every shape can print its area, but there is no "area of a shape in general". An abstract class is a class that can't be instantiated directly and can leave some methods unimplemented (`abstract`, with no body) for subclasses to fill in. It can still have fields, constructors and ordinary methods.

It exists to define a shared template while forcing every subclass to supply its own specific details. A concrete subclass must implement every abstract method, or be declared abstract itself.

```java
abstract class Shape {
    abstract double area();                          // no body: each subclass decides
    void printArea() { System.out.println("Area: " + area()); }   // shared code
}
class Square extends Shape {
    private final double side;
    Square(double side) { this.side = side; }
    @Override double area() { return side * side; }
}
// new Shape();              // compile error: Shape is abstract
new Square(3).printArea();   // Area: 9.0
```

---

### 2.16 Interfaces

A duck, a plane and a drone share nothing as classes, yet code that launches "anything that flies" should accept all three. An interface is a type that defines a contract — the methods a class promises to provide — which any class can sign with `implements`, whatever it extends. Most interface methods are abstract (no body, each class implements them), but since Java 8 an interface may also carry `default` and `static` methods with bodies, and since Java 9 `private` helper methods. What an interface can never hold is per-object state: its fields are always `public static final` constants.

It exists to let unrelated classes agree to behave the same way (implement the same contract), enabling flexible, decoupled designs. A class extends one class but can implement any number of interfaces.

```java
interface Flyable {
    void fly();                                              // abstract: each class decides how
    default void takeOff() { System.out.println("Taking off"); fly(); }   // shared behaviour
}
class Duck implements Flyable {
    @Override public void fly() { System.out.println("Flapping"); }
}
class Drone implements Flyable {
    @Override public void fly() { System.out.println("Spinning rotors"); }
}
Flyable f = new Drone();
f.takeOff();   // Taking off, Spinning rotors
```

---

### 2.17 Abstract Class vs Interface

Both define a type that other classes complete, and since Java 8 both can contain method bodies — so the choice needs a better rule than "one has code, one doesn't". An **abstract class** is a partial class: it can hold fields, constructors and code, and a class can extend only one. An **interface** is a pure type: it holds no per-object state, can still carry default methods, and a class can implement many.

Choose an interface to describe a role that unrelated classes can share (`Comparable`, `Runnable`, `AutoCloseable`), and an abstract class when closely related classes share state and code. They combine well: an interface for the type, plus an abstract class that implements the common part of it.

```java
interface Shape { double area(); }                  // the type: any class can be a Shape

abstract class Polygon implements Shape {           // shared state and code for one family
    protected final int sides;
    protected Polygon(int sides) { this.sides = sides; }
    int sides() { return sides; }
}
class Square extends Polygon {
    private final double side;
    Square(double side) { super(4); this.side = side; }
    @Override public double area() { return side * side; }
}
class Circle implements Shape {                     // not a polygon, still a Shape
    private final double r;
    Circle(double r) { this.r = r; }
    @Override public double area() { return Math.PI * r * r; }
}
```

---

### 2.18 The final Keyword

Some things must not change once set — an order's ID, the order of steps in a security check, the guarantees of `String`. `final` tells the compiler to forbid one particular kind of change, and what it forbids depends on what it marks:
- a **final variable or field** can be assigned only once;
- a **final method** can't be overridden by subclasses;
- a **final class** can't be extended at all (`String` and `Integer` are final).

A final *reference* is not an immutable *object*. `final List<String> names` can never be pointed at another list, but the list it points to can still change. Making the object itself unchangeable is immutability (2.21).

```java
final int max = 10;
// max = 11;                         // compile error: cannot assign a value to final variable max

final List<String> names = new ArrayList<>();
names.add("Siva");                   // allowed: the list object changes
// names = new ArrayList<>();        // compile error: the reference can't change

class Account {
    final void audit() { }           // subclasses can't override audit()
}
final class Money { }                // no class can extend Money
```

---

### 2.19 The Object Class

Any object might be printed, compared, stored in a hash table or asked what class it is — so Java needs those operations to exist on *every* object. Every class in Java automatically inherits from `Object`, which provides default behavior for comparing objects (`equals`), hashing them (`hashCode`), and describing them as text (`toString`), and also `getClass()` (the object's runtime class), the rarely-wanted `clone()`, and thread-coordination methods (`wait`/`notify`).

This exists so every object — no matter its type — has some baseline behavior for these universal operations, which a class can override to make more meaningful. The defaults are based on identity: by default an object equals only itself, and its `toString()` is just its class name and a hash code.

```java
class Dog { }
Dog d = new Dog();
System.out.println(d);              // something like Dog@1b6d3586 — the default toString()
System.out.println(d.getClass());   // class Dog
System.out.println(d.equals(d));    // true — by default an object equals only itself
```

---

### 2.20 equals and hashCode

Two `Money` objects that both hold €5 are different objects, yet a program should treat them as the same value. `equals()` is the method a class overrides to define when two of its objects count as equal; `hashCode()` returns a number that hash-based collections (`HashMap`, `HashSet`) use to find an object quickly. The two must agree: objects that are equal must return the same hash code, or hash collections can't find them.

`==` is different and can't be changed. For primitives it compares values; for objects it always compares references — whether two expressions refer to the very same object. So for strings and other values, use `equals()`.

> 💡 **Tip:** `==` always compares object references; `.equals()` compares whatever the class defines — identity, unless the class overrides it to compare actual content.

```java
String a = new String("hi");
String b = new String("hi");
System.out.println(a == b);        // false — two different objects
System.out.println(a.equals(b));   // true  — String overrides equals() to compare characters
```

---

### 2.21 Immutability

If an object can't change after it's created, nobody can corrupt it, every thread sees the same thing, and it can be shared freely. An **immutable object** is one whose state can't change once it has been constructed — `String`, `Integer`, `LocalDate` and `BigDecimal` are all immutable. "Changing" one actually produces a new object and leaves the original untouched.

Java has no `immutable` keyword; a class is immutable by design. Its fields are `private final` and set once in the constructor; it has no setters or other methods that change state; the class is `final`, so no subclass can add mutable behaviour; and it copies any mutable objects it receives or hands out. A `final` field alone is not enough (2.18). A `record` gives you most of this automatically.

```java
public final class Person {
    private final String name;
    private final List<String> nicknames;

    public Person(String name, List<String> nicknames) {
        this.name = name;
        this.nicknames = List.copyOf(nicknames);   // our own unmodifiable copy
    }
    public String name() { return name; }
    public List<String> nicknames() { return nicknames; }     // safe: can't be modified
    public Person withName(String newName) {                   // "change" = a new object
        return new Person(newName, nicknames);
    }
}
```

---

### 2.22 Object Initialization Order

`new Child()` on a class that extends `Parent` runs several pieces of code — static blocks, field initializers, instance blocks, constructors — and their order explains many surprising bugs. Java does the work in two phases:
1. **Class initialization** — once per class, just before its first use: its static field initializers and `static` blocks run, the parent class's before the child's.
2. **Object initialization** — on every `new`: the parent's part of the object is completed first (its field initializers, instance blocks, then the rest of its constructor), then the child's.

So a parent always finishes before its child starts, and static setup happens once while instance setup happens per object. The one surprise: if a parent constructor calls a method the child overrides, the child's version runs before the child's fields are set.

```java
class Parent {
    static { System.out.println("1 Parent static block"); }
    { System.out.println("3 Parent instance block"); }
    Parent() { System.out.println("4 Parent constructor"); }
}
class Child extends Parent {
    static { System.out.println("2 Child static block"); }
    { System.out.println("5 Child instance block"); }
    Child() { System.out.println("6 Child constructor"); }
}
new Child();   // prints 1, 2, 3, 4, 5, 6
new Child();   // prints 3, 4, 5, 6 — each class is initialized only once
```

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
