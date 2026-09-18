# Python — Foundation

> **Goal of this file:** Build a complete mental map of Python. After reading, you should be able to say *"I know what every concept is."* No deep internals, no implementation detail — just what things are, why they exist, and what problem they solve.

> **Build status:** All twelve topic groups are written. Every group in the table of contents below is complete.

---

## 📖 Master Table of Contents

1. [[#1. Python Fundamentals & Syntax]] ✅
2. [[#2. Built-in Data Structures]] ✅
3. [[#3. Functions & Functional Programming]] ✅
4. [[#4. Object-Oriented Programming & the Data Model]] ✅
5. [[#5. Exceptions & Error Handling]] ✅
6. [[#6. Iterators, Generators & Comprehensions]] ✅
7. [[#7. Decorators, Context Managers & Metaprogramming]] ✅
8. [[#8. Modules, Packages & Environments]] ✅
9. [[#9. Concurrency, Parallelism & Asyncio]] ✅
10. [[#10. CPython Internals & Memory Management]] ✅
11. [[#11. Files, I/O & Serialization]] ✅
12. [[#12. Typing, Tooling & Modern Python]] ✅

---

## 1. Python Fundamentals & Syntax

### Table of Contents (this group)
- [[#1.1 What is Python?]]
- [[#1.2 The Interpreter, Bytecode and CPython]]
- [[#1.3 Variables, Names and Objects]]
- [[#1.4 Numbers and Numeric Types]]
- [[#1.5 Strings and Text]]
- [[#1.6 Operators and Expressions]]
- [[#1.7 Control Flow Statements]]
- [[#1.8 Functions and Parameters]]
- [[#1.9 Scope and Namespaces]]
- [[#1.10 Truthiness, None and Equality]]

---

### 1.1 What is Python?

Python is a general-purpose, high-level programming language built around readability. You write plain source text, and an interpreter reads it, translates it into an internal instruction format, and runs it — there is no separate compile step you have to perform yourself.

It exists because the languages available in the late 1980s forced a choice: low-level languages that were fast but slow to write, or shell scripting that was quick to write but collapsed under anything complex. Python was designed to sit between the two — quick enough for a ten-line script, structured enough for a large system.

> 💡 **Tip:** "Pythonic" is the word the community uses for code that follows Python's own idioms instead of transliterating habits from another language. It is a real review comment you will receive.

---

### 1.2 The Interpreter, Bytecode and CPython

When you run `python script.py`, your source is not handed straight to the processor. The interpreter parses it, compiles it to **bytecode** — a compact sequence of instructions for a virtual machine — and then executes that bytecode instruction by instruction.

**CPython** is the reference implementation of this interpreter, written in C, and it is what almost everyone means by "Python". Other implementations exist, such as PyPy (which adds a just-in-time compiler) and GraalPy, and they run the same language with different execution strategies.

Bytecode exists so the language stays portable and flexible: the same `.py` file runs anywhere an interpreter exists, and the compile step is fast enough to happen transparently every time you run the program.

```
script.py  →  compile  →  bytecode (__pycache__/*.pyc)  →  interpreter loop  →  effects
```

---

### 1.3 Variables, Names and Objects

In Python a variable is a **name bound to an object**, not a box that holds a value. Assignment never copies anything — `b = a` makes a second name refer to the very same object.

Every value is an object with an identity, a type, and a value. Integers, functions, classes and modules are all objects, which is why you can pass a function as an argument or store a class in a list.

This model exists to keep the language uniform: once everything is an object and every variable is a reference, there is one rule to learn instead of separate rules for primitives, references and functions.

---

### 1.4 Numbers and Numeric Types

Python's built-in numeric types are `int`, `float` and `complex`. An `int` has arbitrary precision — it grows as large as memory allows, with no overflow — while a `float` is a standard 64-bit IEEE-754 double with the usual precision limits.

The standard library adds `decimal.Decimal` for exact decimal arithmetic (money) and `fractions.Fraction` for exact rational arithmetic. `bool` is not a separate kind of thing: `True` and `False` are a subclass of `int`, equal to 1 and 0.

These exist as distinct types because no single numeric representation is right for everything — counting, measuring and accounting each need different guarantees.

---

### 1.5 Strings and Text

A `str` is an immutable sequence of Unicode code points — text. A `bytes` object is an immutable sequence of raw 8-bit values — data. Converting between them requires an explicit encoding, usually UTF-8.

The separation exists because Python 3 deliberately ended the Python 2 habit of treating text and bytes as interchangeable, which silently produced corrupt output the moment a non-ASCII character appeared.

Strings are immutable, so every "modification" produces a new string. f-strings (`f"{name} is {age}"`) are the standard way to build one from values.

---

### 1.6 Operators and Expressions

Operators in Python are syntax over method calls. `a + b` is a request for `a.__add__(b)`, `a[i]` calls `a.__getitem__(i)`, and `a < b` calls `a.__lt__(b)`. This is why `+` concatenates lists and strings but adds numbers — different types implement the same operator differently.

They exist in this form so that your own classes can support the same notation the built-in types use, rather than operators being a closed, privileged feature of the language.

Python also has operators that many other languages lack: `in` for membership, `is` for identity, `//` for floor division, `**` for exponentiation, and chained comparisons like `0 <= x < 10`.

---

### 1.7 Control Flow Statements

Control flow is expressed with `if` / `elif` / `else`, the `while` loop and the `for` loop. Blocks are delimited by indentation rather than braces, which makes layout part of the grammar instead of a style preference.

Python's `for` is a **for-each** loop: it walks over the items of an iterable, not over an index counter. `break`, `continue` and `pass` control flow inside a loop, and loops may carry an `else` clause that runs only when the loop was not broken out of.

`match` / `case` — structural pattern matching, added in Python 3.10 — is the newest control-flow statement, matching values against patterns and destructuring them in one step.

```python
for item in ["a", "b", "c"]:
    if item == "b":
        continue
    print(item)
```

---

### 1.8 Functions and Parameters

`def` creates a function object and binds it to a name. Because the result is an ordinary object, functions can be passed as arguments, returned from other functions and stored in data structures.

Parameters are flexible: they can be positional, given by keyword, carry default values, collect extra positional arguments with `*args`, or collect extra keyword arguments with `**kwargs`. A function always returns something — `None` if you do not say otherwise.

That flexibility exists so one signature can serve simple and advanced callers, since Python has no overloading.

```python
def greet(name, greeting="Hello", *, punctuation="!"):
    return f"{greeting}, {name}{punctuation}"

greet("Ada")                    # "Hello, Ada!"
greet("Ada", punctuation="?")   # "Hello, Ada?"
```

---

### 1.9 Scope and Namespaces

A namespace is a mapping from names to objects, and a scope is the region of code where a namespace is directly reachable. Python resolves a name by searching **local**, then **enclosing**, then **global** (module), then **built-in** scopes — remembered as the LEGB rule.

Scopes exist so that a name used inside a function cannot silently clash with an unrelated name elsewhere in the program. Assigning to a name inside a function makes it local to that function unless you say otherwise with `global` or `nonlocal`.

---

### 1.10 Truthiness, None and Equality

Every Python object can be used in a boolean context. Empty containers, zero, empty strings and `None` are falsy; essentially everything else is truthy. That is what allows `if items:` instead of `if len(items) > 0:`.

`None` is Python's single "no value" object — a singleton, meaning there is exactly one `None` in a running program, which is why it is compared with `is` rather than `==`.

Equality (`==`) asks whether two objects have the same value; identity (`is`) asks whether they are the same object in memory. Confusing the two is one of the most common beginner errors, and one of the most common interview questions.

> ⚠️ **Common misconception:** `==` and `is` are interchangeable. They are not — they may agree by accident because the interpreter caches small integers and short strings, so the bug only appears once the values get larger.

---

[[#📖 Master Table of Contents|⬆ Back to top]]

*End of Group 1. Next: Built-in Data Structures.*

---

## 2. Built-in Data Structures

### Table of Contents (this group)
- [[#2.1 Lists]]
- [[#2.2 Tuples and Named Tuples]]
- [[#2.3 Dictionaries]]
- [[#2.4 Sets and Frozensets]]
- [[#2.5 Indexing and Slicing]]
- [[#2.6 Hashing and Hashability]]
- [[#2.7 Sorting and Ordering]]
- [[#2.8 The collections Module]]
- [[#2.9 Unpacking and Star Expressions]]
- [[#2.10 Copying and Aliasing Containers]]
- [[#2.11 Choosing the Right Data Structure]]

---

### 2.1 Lists

A list is an ordered, mutable sequence that can hold objects of any type. It is Python's default container — when you do not have a reason to use something else, you use a list.

It exists to cover the common case: a growable ordered collection with fast access by position and fast appends at the end.

```python
items = [3, "text", None]
items.append(4)
items[0] = 99
```

---

### 2.2 Tuples and Named Tuples

A tuple is an ordered, **immutable** sequence. Once created its contents cannot be reassigned, which makes it usable as a dictionary key and safe to share between parts of a program.

A named tuple adds field names to the same structure, so `point.x` works alongside `point[0]`. It exists to give small fixed records a readable shape without writing a class.

Tuples exist because a lot of data is fixed-length and heterogeneous — a coordinate, a database row, a function returning two values — where "you cannot change this" is a useful guarantee.

---

### 2.3 Dictionaries

A dictionary maps keys to values with near-constant-time lookup. Keys must be hashable; values can be anything. Since Python 3.7 dictionaries preserve insertion order as a language guarantee.

Dictionaries exist to answer "what is associated with this key?" without scanning. They are also the backbone of the language itself: module namespaces, object attributes and keyword arguments are all dictionaries underneath.

```python
user = {"name": "Ada", "age": 36}
user["email"] = "ada@example.com"
user.get("phone", "unknown")
```

---

### 2.4 Sets and Frozensets

A set is an unordered collection of unique, hashable items with fast membership tests. A frozenset is the immutable version, which can itself be a dictionary key or a member of another set.

They exist for the questions lists answer badly: "is this present?", "what do these two collections have in common?", "what is in A but not B?".

---

### 2.5 Indexing and Slicing

Indexing retrieves one item by position, counting from 0, with negative indices counting from the end. Slicing (`items[start:stop:step]`) retrieves a whole sub-sequence and never includes the `stop` position.

Slicing exists so that extracting part of a sequence is a single readable expression rather than a loop, and it works identically for lists, tuples, strings, ranges and bytes.

```python
items[2]       # third item
items[-1]      # last item
items[1:4]     # items 1, 2, 3
items[::-1]    # reversed copy
```

---

### 2.6 Hashing and Hashability

An object is hashable if it has a hash value that never changes during its lifetime and can be compared for equality. Hashable objects can be dictionary keys and set members; unhashable ones cannot.

Immutable built-ins (numbers, strings, tuples of hashables, frozensets) are hashable; lists, dicts and sets are not. This exists because a hash-based container places items by their hash — if an item's hash changed after insertion, the container could never find it again.

---

### 2.7 Sorting and Ordering

`sorted(iterable)` returns a new sorted list; `list.sort()` sorts in place. Both accept a `key` function that extracts the value to compare, and a `reverse` flag.

Sorting exists as a built-in because ordering is so common, and Python's sort is *stable*: items that compare equal keep their original relative order, which is what makes multi-pass sorting work.

```python
people.sort(key=lambda p: p.age)
sorted(words, key=str.casefold)
```

---

### 2.8 The collections Module

The standard library's `collections` module adds specialised containers: `deque` for fast appends and pops at both ends, `defaultdict` for automatic default values, `Counter` for tallying, and `OrderedDict` for order-sensitive equality.

They exist because the general-purpose built-ins are not the best fit for every access pattern, and hand-rolling these structures is both slower and more error-prone than using the C implementations provided.

---

### 2.9 Unpacking and Star Expressions

Unpacking assigns several names at once from a sequence: `a, b = pair`. A starred name (`first, *rest = items`) absorbs everything not matched by the other names.

The same syntax works in function calls (`f(*args, **kwargs)`) and inside literals (`[*a, *b]`, `{**d1, **d2}`). It exists to remove index bookkeeping from code that takes structures apart or merges them.

---

### 2.10 Copying and Aliasing Containers

Assigning a container to a new name creates an alias, not a copy — both names see every change. `list(x)`, `x[:]` and `copy.copy(x)` create a *shallow* copy: a new outer container holding the same inner objects.

`copy.deepcopy(x)` recursively copies everything. The distinction exists because copying is not free, so Python makes you say how deep you need it to go.

---

### 2.11 Choosing the Right Data Structure

Each built-in container is fast at some operations and slow at others: lists are fast at the end and slow in the middle, dicts and sets are fast for lookup but hold no order beyond insertion, and deques are fast at both ends but slow in the middle.

Choosing well exists as a skill because the wrong container turns a linear algorithm into a quadratic one — the single most common cause of "it worked in testing and timed out in production".

> 💡 **Tip:** If you find yourself writing `if item in some_list` inside a loop, you almost certainly want a set.

---

[[#📖 Master Table of Contents|⬆ Back to top]]

*End of Group 2. Next: Functions & Functional Programming.*

---

## 3. Functions & Functional Programming

### Table of Contents (this group)
- [[#3.1 First-Class Functions]]
- [[#3.2 Closures]]
- [[#3.3 Lambda Expressions]]
- [[#3.4 Higher-Order Functions]]
- [[#3.5 The functools Module]]
- [[#3.6 Recursion]]
- [[#3.7 Pure Functions and Side Effects]]
- [[#3.8 Callable Objects]]
- [[#3.9 Function Introspection]]
- [[#3.10 Functional Style in Python]]

---

### 3.1 First-Class Functions

A function in Python is an ordinary object. It can be assigned to a name, stored in a list or dict, passed as an argument, and returned from another function.

This exists because treating functions as data removes the need for special-case machinery: callbacks, plugin registries, strategy selection and decorators are all just ordinary values being moved around.

```python
handlers = {"json": parse_json, "csv": parse_csv}
handlers["json"](payload)
```

---

### 3.2 Closures

A closure is a function that remembers variables from the scope where it was defined, even after that scope has finished executing.

Closures exist so a function can carry a little private state without needing a class or a global variable — a configured callback, a counter, or a function built for a specific parameter.

---

### 3.3 Lambda Expressions

A lambda is an anonymous function written as a single expression: `lambda x: x * 2`. It produces exactly the same kind of object as `def`, minus a name and a docstring.

Lambdas exist for the cases where naming a function would add noise rather than clarity — typically a one-line `key` for sorting or a tiny callback passed directly to another function.

---

### 3.4 Higher-Order Functions

A higher-order function is one that takes a function as an argument, returns one, or both. `map`, `filter`, `sorted(key=...)`, `min`/`max` with a key, and every decorator are examples.

They exist so that the *shape* of an operation can be written once and the specific behaviour supplied per call — iterate-and-transform, iterate-and-select, iterate-and-compare.

---

### 3.5 The functools Module

`functools` is the standard library's toolkit for working with functions: `partial` for pre-filling arguments, `reduce` for folding a sequence into one value, `wraps` for writing well-behaved decorators, `lru_cache`/`cache` for memoisation, and `singledispatch` for type-based dispatch.

It exists because these patterns recur in every codebase, and correct implementations are subtler than they look.

```python
from functools import lru_cache

@lru_cache(maxsize=256)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)
```

---

### 3.6 Recursion

Recursion is a function calling itself to solve a smaller version of the same problem, with a base case that stops the descent.

Python supports recursion but limits its depth — by default around a thousand frames — because each call consumes a real stack frame. It exists as a technique for naturally recursive structures such as trees, parsers and nested data.

---

### 3.7 Pure Functions and Side Effects

A pure function returns the same result for the same arguments and changes nothing outside itself. A side effect is any change it makes to the world: mutating an argument, writing a file, updating a global, printing.

The distinction exists because pure functions are easy to test, safe to cache, safe to run in parallel and easy to reason about, while side effects are where most bugs live.

---

### 3.8 Callable Objects

Anything implementing `__call__` can be called with parentheses — not just functions. A class instance with `__call__` behaves like a function while also holding state and having methods.

This exists so "a thing you can call" is a protocol rather than a single type: functions, classes, methods, partials and instances all satisfy it.

---

### 3.9 Function Introspection

Python can describe its own functions at runtime: `__name__`, `__doc__`, `__defaults__`, `__annotations__` and `inspect.signature()` expose a function's name, documentation, defaults, type hints and parameter structure.

Introspection exists so tools can work with code they were never told about — test runners that inject fixtures by parameter name, web frameworks that build validation from annotations, and CLI builders that derive options from signatures.

---

### 3.10 Functional Style in Python

Python supports functional programming without being a functional language: comprehensions, generators, `map`/`filter`, immutable types and first-class functions are all available, but there is no tail-call optimisation and most data structures are mutable.

The practical style that emerged is a blend — comprehensions instead of `map`/`filter`, pure helper functions, immutable value objects, and ordinary loops where they read better.

> 💡 **Tip:** In Python, "functional" usually means "avoid hidden mutation", not "avoid loops and classes".

---

[[#📖 Master Table of Contents|⬆ Back to top]]

*End of Group 3. Next: Object-Oriented Programming & the Data Model.*

---

## 4. Object-Oriented Programming & the Data Model

### Table of Contents (this group)
- [[#4.1 Classes and Instances]]
- [[#4.2 Attributes and the Instance Dictionary]]
- [[#4.3 Instance, Class and Static Methods]]
- [[#4.4 Inheritance and the MRO]]
- [[#4.5 super() and Cooperative Inheritance]]
- [[#4.6 Special Methods and the Data Model]]
- [[#4.7 Properties]]
- [[#4.8 Descriptors]]
- [[#4.9 Dataclasses]]
- [[#4.10 Abstract Base Classes and Protocols]]
- [[#4.11 Slots and Memory Layout]]
- [[#4.12 Composition and Delegation]]

---

### 4.1 Classes and Instances

A class is a blueprint that describes what its instances know and can do. Creating an instance calls the class, which allocates an object and runs `__init__` to set it up.

Classes exist to bundle data with the operations that belong to it, so that related state and behaviour travel together instead of being scattered across functions and dictionaries.

```python
class Account:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

acct = Account("Ada", 100)
```

---

### 4.2 Attributes and the Instance Dictionary

An attribute is a name attached to an object. Most objects keep theirs in a dictionary called `__dict__`, so attributes can be added, changed and removed at runtime.

Attribute lookup checks the instance first, then its class, then the classes the class inherits from. This layered lookup exists so shared defaults can live on the class while per-object values live on the instance.

---

### 4.3 Instance, Class and Static Methods

An instance method receives the instance as its first argument, conventionally named `self`. A `@classmethod` receives the class instead, named `cls`. A `@staticmethod` receives neither — it is a plain function that happens to live in the class body.

The three exist because not every operation needs an instance: alternative constructors belong on the class, and helpers that only group logically with the class need nothing at all.

```python
class Temperature:
    def __init__(self, celsius): self.celsius = celsius

    @classmethod
    def from_fahrenheit(cls, f): return cls((f - 32) / 1.8)

    @staticmethod
    def is_valid(celsius): return celsius >= -273.15
```

---

### 4.4 Inheritance and the MRO

Inheritance lets a class reuse and extend another class. Python allows multiple inheritance, so a class can have several parents, and the **method resolution order** (MRO) is the fixed sequence in which those classes are searched for an attribute.

The MRO exists so that multiple inheritance is predictable: for any class, there is exactly one linear order, computed once, that every lookup follows.

---

### 4.5 super() and Cooperative Inheritance

`super()` calls the next class in the MRO rather than a hard-coded parent. In a single-inheritance chain that is simply the parent; with multiple inheritance it is whatever comes next in the order.

It exists so that classes designed to be mixed together can each do their part of an operation and pass the call along, without any of them needing to know the full hierarchy.

---

### 4.6 Special Methods and the Data Model

Special methods — the ones with double underscores, like `__len__`, `__iter__`, `__eq__` and `__enter__` — are how a class plugs into Python's syntax and built-in functions. Together they form the **data model**.

They exist so that built-in behaviour is a protocol rather than a privilege: define the right methods and your object works with `len()`, `for`, `in`, `with`, `+` and everything else exactly as a built-in type would.

---

### 4.7 Properties

A property is an attribute backed by methods. Reading `obj.total` can run code that computes the value, and assigning to it can validate before storing.

Properties exist so that a plain attribute can gain logic later without changing any calling code — which is why Python codebases rarely write Java-style getters and setters up front.

```python
class Circle:
    def __init__(self, radius): self.radius = radius

    @property
    def area(self): return 3.14159 * self.radius ** 2
```

---

### 4.8 Descriptors

A descriptor is an object that defines `__get__`, `__set__` or `__delete__` and is stored as a class attribute. When you access an attribute backed by one, Python calls the descriptor instead of returning it.

Descriptors exist because they are the mechanism behind properties, methods, `classmethod`, `staticmethod` and `slots` — the shared machinery of attribute access, exposed for you to use directly.

---

### 4.9 Dataclasses

A dataclass is a class whose boilerplate — `__init__`, `__repr__`, `__eq__` and optionally ordering and hashing — is generated from its annotated fields by the `@dataclass` decorator.

It exists because an enormous share of classes are simply records, and writing those five methods by hand is repetitive and easy to get subtly wrong.

```python
from dataclasses import dataclass

@dataclass(frozen=True, slots=True)
class Point:
    x: float
    y: float = 0.0
```

---

### 4.10 Abstract Base Classes and Protocols

An abstract base class declares methods that subclasses must implement, and refuses to instantiate a subclass that has not. A protocol describes a set of methods and lets *any* class that has them count as compatible, with no inheritance required.

Both exist to describe expectations: ABCs when you want explicit opt-in and shared implementation, protocols when you want duck typing that a type checker can verify.

---

### 4.11 Slots and Memory Layout

Adding `__slots__` to a class replaces its per-instance dictionary with a fixed set of slots. Instances then use noticeably less memory and attribute access is slightly faster, but no new attributes can be added at runtime.

Slots exist for the case where a program creates a very large number of small objects, and the dictionary per instance becomes the dominant memory cost.

---

### 4.12 Composition and Delegation

Composition builds behaviour by holding other objects and calling them, rather than by inheriting from them. Delegation is the act of forwarding a call to a held object.

It exists as the default alternative to inheritance: it couples classes loosely, avoids fragile hierarchies, and is far easier to change later — which is why "prefer composition over inheritance" is standard advice.

> 💡 **Tip:** Inherit when the subclass genuinely *is* the parent and can be used anywhere it can. Otherwise hold the object and forward what you need.

---

[[#📖 Master Table of Contents|⬆ Back to top]]

*End of Group 4. Next: Exceptions & Error Handling.*

---

## 5. Exceptions & Error Handling

### Table of Contents (this group)
- [[#5.1 The Exception Hierarchy]]
- [[#5.2 try, except, else and finally]]
- [[#5.3 Raising and Re-raising]]
- [[#5.4 Custom Exceptions]]
- [[#5.5 Exception Chaining]]
- [[#5.6 EAFP and LBYL]]
- [[#5.7 Tracebacks]]
- [[#5.8 Warnings]]
- [[#5.9 Exception Groups]]

---

### 5.1 The Exception Hierarchy

Every exception in Python is an object, and every one inherits from `BaseException`. Almost all the ones you catch inherit from `Exception`, which sits below it — the few that do not are the ones you are not supposed to swallow, such as `KeyboardInterrupt` and `SystemExit`.

The hierarchy exists so you can catch at whatever level of precision you need: one specific error, a family of related errors, or anything at all.

```
BaseException
 ├── SystemExit, KeyboardInterrupt, GeneratorExit
 └── Exception
      ├── ArithmeticError → ZeroDivisionError
      ├── LookupError → KeyError, IndexError
      ├── OSError → FileNotFoundError, PermissionError
      └── ValueError, TypeError, AttributeError, …
```

---

### 5.2 try, except, else and finally

A `try` block marks code that might fail. `except` handles specific failures, `else` runs only when nothing was raised, and `finally` always runs — whether the block succeeded, failed, or returned early.

The four parts exist so the happy path, the failure path and the cleanup path can each be written exactly once, in the place that belongs to them.

```python
try:
    value = data[key]
except KeyError:
    value = default
else:
    log("found existing value")
finally:
    close_resources()
```

---

### 5.3 Raising and Re-raising

`raise SomeError("message")` signals a problem. A bare `raise` inside an `except` block re-raises the exception being handled, preserving its original traceback.

Raising exists so a function can refuse to return a wrong answer. Re-raising exists so intermediate code can react to a failure — log it, clean up, add context — without pretending to have handled it.

---

### 5.4 Custom Exceptions

A custom exception is a class inheriting from `Exception` (or a more specific built-in) that names a failure in your own domain: `InsufficientFunds`, `ConfigMissing`, `RetryableError`.

They exist so callers can catch exactly the condition they know how to handle, instead of matching on error message text or catching something far too broad.

```python
class PaymentError(Exception):
    """Base for every payment failure."""

class CardDeclined(PaymentError):
    pass
```

---

### 5.5 Exception Chaining

When one exception is raised while another is being handled, Python links them. `raise New() from original` sets the cause explicitly, and the traceback shows both.

Chaining exists so that translating a low-level error into a domain one does not destroy the evidence — you see both the `ConfigError` you raised and the `FileNotFoundError` underneath it.

---

### 5.6 EAFP and LBYL

**EAFP** — "easier to ask forgiveness than permission" — means attempting the operation and handling the exception if it fails. **LBYL** — "look before you leap" — means checking first.

Python leans EAFP because checks can be wrong by the time you act on them, and because exceptions cost nothing when nothing goes wrong. Both exist; the choice depends on how likely the failure is.

```python
try:                        # EAFP
    return config["port"]
except KeyError:
    return 8080

if "port" in config:        # LBYL
    return config["port"]
return 8080
```

---

### 5.7 Tracebacks

A traceback is the record of where an exception came from: the chain of calls from the entry point down to the line that failed, read from oldest at the top to the failure at the bottom.

Tracebacks exist to make failures diagnosable. Python's carry the source line for every frame, and since 3.11 they also mark the exact expression that failed.

---

### 5.8 Warnings

A warning reports something that is not an error but deserves attention — a deprecated function, a suspicious argument, a fallback being used. `warnings.warn()` issues one, and the warnings filter decides whether it is shown, ignored or raised as an error.

Warnings exist so libraries can flag problems without breaking a running program, and so upgrades can be announced ahead of the release that removes something.

---

### 5.9 Exception Groups

An exception group holds several exceptions raised together — typical when many concurrent tasks fail at once. `except*` handles the ones matching a type and leaves the rest to propagate.

They exist because a single `except` clause cannot represent "three of these ten tasks failed, for two different reasons", which is exactly what concurrent code produces.

> 💡 **Tip:** Exception groups (Python 3.11+) are what make `asyncio.TaskGroup` able to report every failure rather than only the first.

---

[[#📖 Master Table of Contents|⬆ Back to top]]

*End of Group 5. Next: Iterators, Generators & Comprehensions.*

---

## 6. Iterators, Generators & Comprehensions

### Table of Contents (this group)
- [[#6.1 The Iterator Protocol]]
- [[#6.2 Iterables and Iterators]]
- [[#6.3 Generator Functions]]
- [[#6.4 Generator Expressions]]
- [[#6.5 yield from and Delegation]]
- [[#6.6 Comprehensions]]
- [[#6.7 The itertools Module]]
- [[#6.8 Lazy Evaluation and Pipelines]]
- [[#6.9 Two-way Generators]]
- [[#6.10 Infinite Sequences]]

---

### 6.1 The Iterator Protocol

The iterator protocol is the agreement that makes `for` loops work: an object provides `__iter__` to hand back an iterator, and that iterator provides `__next__` to produce the next item or raise `StopIteration` when there are none left.

It exists so that every form of sequence — lists, files, database cursors, network streams, infinite sequences — can be walked with the same syntax, and so the loop never needs to know how many items there are in advance.

---

### 6.2 Iterables and Iterators

An **iterable** is anything you can loop over. An **iterator** is the object that does the actual walking and remembers its position. Lists, strings and dicts are iterables; calling `iter()` on one produces a fresh iterator.

The split exists because position is state. A list can be looped over many times because each loop asks for a new iterator, while an iterator itself is consumed once and then empty.

```python
numbers = [1, 2, 3]      # iterable
it = iter(numbers)       # iterator
next(it)                 # 1
```

---

### 6.3 Generator Functions

A generator function contains `yield` instead of (or as well as) `return`. Calling it does not run the body — it returns a generator object, and the body runs one piece at a time as values are requested.

Generators exist to produce sequences lazily: they hold one item in memory instead of the whole result, and they can represent sequences that are expensive or endless.

```python
def countdown(n):
    while n > 0:
        yield n
        n -= 1
```

---

### 6.4 Generator Expressions

A generator expression looks like a list comprehension with parentheses: `(x * 2 for x in items)`. It produces a generator rather than a list, so values are computed on demand.

They exist for the very common case where a comprehension's result is consumed once — by `sum`, `any`, `max` or a `for` loop — and building the whole list first would be wasted memory.

---

### 6.5 yield from and Delegation

`yield from iterable` yields every item of another iterable from inside a generator, and when that iterable is itself a generator it also forwards values sent into it and exceptions thrown at it.

It exists so generators can be composed and recursion over nested structures stays simple — one line instead of a manual loop, with the delegation semantics handled correctly.

---

### 6.6 Comprehensions

A comprehension builds a container from an iterable in one expression: list `[...]`, set `{...}`, dict `{k: v ...}`. Each supports filtering with `if` and nesting with multiple `for` clauses.

They exist because building a collection by looping and appending is so common that Python gives it dedicated syntax — shorter, faster, and free of the accumulator variable.

```python
squares = [n * n for n in range(10)]
evens = {n for n in numbers if n % 2 == 0}
by_id = {user.id: user for user in users}
```

---

### 6.7 The itertools Module

`itertools` is the standard library's collection of iterator building blocks: `chain` to join sequences, `islice` to take a slice lazily, `groupby` to group consecutive items, `product`/`permutations`/`combinations` for combinatorics, and `count`/`cycle`/`repeat` for infinite sources.

It exists because these patterns are universal, and the C implementations are both faster and less error-prone than the loops they replace.

---

### 6.8 Lazy Evaluation and Pipelines

Lazy evaluation means computing a value only when it is needed. Chaining generators produces a pipeline where each stage pulls one item from the stage before it, so the whole dataset is never in memory at once.

Pipelines exist so that programs can process files and streams far larger than memory, and so early termination costs nothing — stopping after ten results does not compute the eleventh.

---

### 6.9 Two-way Generators

Generators can receive as well as produce. `gen.send(value)` resumes a generator with a value that becomes the result of its `yield` expression, `gen.throw()` raises an exception inside it, and `gen.close()` shuts it down.

This exists because a suspended function that can be resumed with new input is the foundation of coroutines — the machinery that `async`/`await` was eventually built on.

---

### 6.10 Infinite Sequences

An infinite sequence produces values forever — `itertools.count()`, `cycle()`, a `while True` generator. It is only usable because consumers can stop early, with `islice`, `takewhile`, `zip` against a finite sequence, or a `break`.

They exist to model genuinely unbounded things — sequential IDs, polling loops, repeating schedules — without inventing an arbitrary upper limit.

> ⚠️ **Common misconception:** Calling `list()` on an infinite generator will not raise an error. It will consume memory until the process dies.

---

[[#📖 Master Table of Contents|⬆ Back to top]]

*End of Group 6. Next: Decorators, Context Managers & Metaprogramming.*

---

## 7. Decorators, Context Managers & Metaprogramming

### Table of Contents (this group)
- [[#7.1 Decorators]]
- [[#7.2 Decorators with Arguments]]
- [[#7.3 Class Decorators]]
- [[#7.4 Context Managers]]
- [[#7.5 The contextlib Module]]
- [[#7.6 Metaclasses]]
- [[#7.7 init_subclass and set_name]]
- [[#7.8 Dynamic Attributes]]
- [[#7.9 Reflection]]
- [[#7.10 exec, eval and Code Generation]]

---

### 7.1 Decorators

A decorator is a function that takes a function and returns a replacement for it. The `@decorator` line above a `def` is shorthand for reassigning the name to the decorator's result.

Decorators exist so that cross-cutting behaviour — logging, timing, caching, authentication, retries — can be added around a function without editing the function itself.

```python
@log_calls
def charge(amount): ...

# exactly the same as
def charge(amount): ...
charge = log_calls(charge)
```

---

### 7.2 Decorators with Arguments

A decorator that takes arguments is a function that returns a decorator. `@retry(attempts=3)` calls `retry(attempts=3)` first, and the decorator it returns is then applied to the function.

They exist because most cross-cutting behaviour needs configuration — how many retries, which cache size, which permission — and hard-coding that into the decorator would mean one decorator per setting.

---

### 7.3 Class Decorators

A class decorator takes a class and returns a replacement, usually the same class with additions. `@dataclass` is the best-known example: it reads the class's fields and attaches generated methods.

They exist as the lighter-weight alternative to metaclasses: for most "modify a class at definition time" tasks, a decorator is simpler to write, read and debug.

---

### 7.4 Context Managers

A context manager defines what happens when a `with` block is entered and left. `__enter__` runs at the top, `__exit__` runs at the bottom — including when an exception is raised inside the block.

They exist to make cleanup automatic and impossible to forget: files close, locks release, transactions commit or roll back, exactly once, on every path out of the block.

```python
with open("data.txt", encoding="utf-8") as fh:
    contents = fh.read()
# file is closed here, even if read() raised
```

---

### 7.5 The contextlib Module

`contextlib` provides shortcuts for working with `with`: `@contextmanager` turns a generator into a context manager, `suppress` ignores chosen exceptions, `closing` calls `close()`, and `ExitStack` manages a variable number of context managers at once.

It exists because most context managers are "set up, yield, tear down" and writing a class with two methods for that is more ceremony than the job needs.

---

### 7.6 Metaclasses

A metaclass is the class of a class. When a `class` statement runs, the metaclass — `type` by default — is what actually builds the class object, so a custom metaclass can inspect or modify every class that uses it.

Metaclasses exist for framework-level work: registering subclasses, validating that required methods exist, or rewriting a class's namespace before it comes into being.

---

### 7.7 init_subclass and set_name

`__init_subclass__` is a hook called on a base class whenever it is subclassed. `__set_name__` is called on a class attribute when the class is created, telling the attribute its own name.

They exist because most of what metaclasses were used for — registration, validation, giving descriptors their names — can be done with these two hooks, with far less complexity.

---

### 7.8 Dynamic Attributes

`__getattr__`, `__setattr__` and `__delattr__` let a class decide what happens when an attribute is missing, assigned or deleted. This makes proxies, lazy loaders and attribute-style access to dynamic data possible.

They exist because not every object's attributes are known when the class is written — configuration objects, API clients and ORM rows discover their fields at runtime.

---

### 7.9 Reflection

Reflection is a program examining itself: `type()`, `isinstance()`, `getattr()`, `setattr()`, `hasattr()`, `dir()`, `vars()` and the `inspect` module all report on objects and classes at runtime.

It exists so that tools can work with code they were never written against — test runners finding tests, serialisers walking fields, dependency injectors reading constructors.

---

### 7.10 exec, eval and Code Generation

`eval()` evaluates an expression from a string, `exec()` executes statements from a string, and `compile()` turns source into a code object. Some libraries use them to generate methods faster than reflection can dispatch them.

They exist for genuine code-generation needs — and they are the most dangerous functions in the language, because a string from an untrusted source becomes executable code.

> ⚠️ **Common misconception:** `eval` is not made safe by restricting its globals. Treat any `eval` of external input as remote code execution.

---

[[#📖 Master Table of Contents|⬆ Back to top]]

*End of Group 7. Next: Modules, Packages & Environments.*

---

## 8. Modules, Packages & Environments

### Table of Contents (this group)
- [[#8.1 Modules and the Import System]]
- [[#8.2 Packages]]
- [[#8.3 Absolute and Relative Imports]]
- [[#8.4 sys.path and Module Resolution]]
- [[#8.5 Circular Imports]]
- [[#8.6 main and Entry Points]]
- [[#8.7 Virtual Environments]]
- [[#8.8 Dependency Management]]
- [[#8.9 Distributing a Package]]
- [[#8.10 Namespace Packages and Plugins]]

---

### 8.1 Modules and the Import System

A module is a single `.py` file, and importing it runs its code once and binds the resulting module object to a name. Every subsequent import of the same module returns the object that is already in memory.

Modules exist to give code a namespace and a unit of reuse: names defined inside one do not collide with names elsewhere, and a module is the natural boundary for organising a program.

```python
import json                 # bind the module
from pathlib import Path    # bind one name from it
import numpy as np          # bind under another name
```

---

### 8.2 Packages

A package is a directory of modules that is importable as a unit. Traditionally it contains an `__init__.py`, which runs when the package is first imported and defines what the package itself exposes.

Packages exist so that a large codebase can be organised into a hierarchy — `myapp.api.routes` — instead of a flat pile of modules with long prefixed names.

---

### 8.3 Absolute and Relative Imports

An absolute import names the full path from the top of the package tree: `from myapp.models import User`. A relative import is written from the current module's position: `from .models import User`.

Both exist because packages can be renamed or nested; relative imports keep intra-package references working when the package moves, while absolute imports are explicit and easier to read.

---

### 8.4 sys.path and Module Resolution

When you import something, Python searches a list of locations held in `sys.path`: the script's directory (or the current directory), then installed packages, then the standard library locations.

It exists so that the same import statement can find code from the project you are working in, from a virtual environment, or from the standard library, according to a documented order.

---

### 8.5 Circular Imports

A circular import happens when module A imports B while B imports A. Python handles it partially — one of them ends up seeing a half-initialised module — which usually surfaces as an `ImportError` or a missing attribute.

The problem exists because importing runs code top to bottom: if A is still executing when B asks for one of its names, that name may not exist yet.

---

### 8.6 main and Entry Points

`if __name__ == "__main__":` runs a block only when the file is executed directly, not when it is imported. An entry point is the declared command a package provides once installed, such as `pytest` or `black`.

They exist to separate "this file is a library" from "this file is a program", and to let installed packages provide real commands rather than instructions to run a path.

```python
def main():
    ...

if __name__ == "__main__":
    main()
```

---

### 8.7 Virtual Environments

A virtual environment is an isolated directory with its own Python interpreter link and its own installed packages, so each project has exactly the dependencies it needs at the versions it needs.

They exist because a single shared set of system packages cannot satisfy two projects that need different versions of the same library — and because installing project dependencies system-wide breaks the operating system's own Python.

---

### 8.8 Dependency Management

Dependencies are declared in `pyproject.toml`, the standard project configuration file, and pinned in a lock file so that every machine installs exactly the same versions.

This exists to make installations reproducible: declared ranges express what the project supports, and the lock file records what was actually tested.

---

### 8.9 Distributing a Package

A distributable Python package takes two forms: a **wheel** (`.whl`), a pre-built archive that installs by unpacking, and an **sdist** (`.tar.gz`), the source form that must be built first.

They exist so that installing a library is fast and predictable. Wheels in particular avoid compiling C extensions on every machine that installs them.

---

### 8.10 Namespace Packages and Plugins

A namespace package is a package split across several directories or distributions that share one import name — `company.auth` and `company.billing` installed separately, both importable under `company`.

Plugin discovery uses *entry points*: a package declares that it provides a plugin, and the host application asks the installed metadata which plugins exist, without importing every package to find out.

> 💡 **Tip:** Entry points are how `pytest` finds plugins and how CLI commands appear on your PATH after `pip install`.

---

[[#📖 Master Table of Contents|⬆ Back to top]]

*End of Group 8. Next: Concurrency, Parallelism & Asyncio.*

---

## 9. Concurrency, Parallelism & Asyncio

### Table of Contents (this group)
- [[#9.1 Concurrency and Parallelism]]
- [[#9.2 The Global Interpreter Lock]]
- [[#9.3 Threads]]
- [[#9.4 Thread Synchronisation]]
- [[#9.5 Multiprocessing]]
- [[#9.6 concurrent.futures]]
- [[#9.7 The Event Loop]]
- [[#9.8 Coroutines and await]]
- [[#9.9 Tasks and Task Groups]]
- [[#9.10 Async Iteration and Context Managers]]
- [[#9.11 Blocking Calls in Async Code]]
- [[#9.12 Choosing a Concurrency Model]]

---

### 9.1 Concurrency and Parallelism

**Concurrency** is structuring a program so that several tasks are in progress at once — they take turns. **Parallelism** is actually executing several tasks at the same instant, which requires several CPU cores.

The distinction exists because the two solve different problems: concurrency hides waiting (for a network, a disk, a database), while parallelism divides computation. Python offers different tools for each.

---

### 9.2 The Global Interpreter Lock

The GIL is a lock inside CPython that allows only one thread to execute Python bytecode at a time. Threads still run truly concurrently while waiting on I/O, because the GIL is released during those waits.

It exists because CPython's memory management — reference counting in particular — is not thread-safe, and a single interpreter-wide lock was the simplest way to make the interpreter correct and single-threaded code fast.

---

### 9.3 Threads

A thread is a separate flow of execution inside one process, sharing all of that process's memory. Python's `threading` module creates and manages them.

Threads exist to keep a program responsive while parts of it wait. In Python they are the right tool for I/O-bound work — network calls, file access, database queries — where the waiting, not the computing, is the bottleneck.

```python
import threading

t = threading.Thread(target=download, args=(url,))
t.start()
t.join()
```

---

### 9.4 Thread Synchronisation

When threads share data, they need coordination. A `Lock` ensures only one thread enters a critical section, an `Event` lets one thread signal others, a `Semaphore` limits how many proceed at once, and a `Queue` passes work between them safely.

These exist because shared mutable state accessed from several threads produces race conditions — results that depend on timing rather than logic.

---

### 9.5 Multiprocessing

Multiprocessing runs code in separate operating-system processes, each with its own interpreter and its own memory. Because each has its own GIL, they achieve genuine parallelism on multiple cores.

It exists for CPU-bound work: image processing, numerical simulation, parsing large datasets — anything where the program is computing rather than waiting.

---

### 9.6 concurrent.futures

`concurrent.futures` provides one interface over both threads and processes: submit work to an executor, get back a `Future`, and collect results as they complete. Switching between `ThreadPoolExecutor` and `ProcessPoolExecutor` is a one-word change.

It exists to hide pool management — creating workers, distributing tasks, collecting results and propagating exceptions — behind an API that is much harder to get wrong than raw threads.

```python
from concurrent.futures import ThreadPoolExecutor

with ThreadPoolExecutor(max_workers=8) as pool:
    results = list(pool.map(fetch, urls))
```

---

### 9.7 The Event Loop

The event loop is the scheduler at the heart of `asyncio`. It keeps a queue of ready tasks, runs one until it awaits something, then switches to another — all in a single thread.

It exists so that thousands of waiting operations can be managed at once without thousands of threads, which is what makes async suitable for high-concurrency network servers and clients.

---

### 9.8 Coroutines and await

A coroutine is a function defined with `async def`. Calling it returns a coroutine object that does nothing until it is awaited or scheduled. `await` suspends the coroutine until the awaited operation completes, letting the event loop run something else meanwhile.

They exist to make asynchronous code read like ordinary sequential code, while still releasing control at every waiting point.

```python
async def fetch(url):
    async with session.get(url) as response:
        return await response.text()
```

---

### 9.9 Tasks and Task Groups

A **task** wraps a coroutine and schedules it on the event loop so it runs concurrently with others. A **task group** (`asyncio.TaskGroup`) runs several tasks together, waits for all of them, and cancels the rest if one fails.

They exist because awaiting coroutines one after another is still sequential — concurrency starts when several are scheduled at once.

---

### 9.10 Async Iteration and Context Managers

`async for` iterates something that produces values asynchronously, such as a stream of rows or paginated API responses. `async with` manages a resource whose setup or teardown involves waiting, such as a connection pool.

They exist because the ordinary `for` and `with` statements cannot await anything, and an async program needs the same constructs without blocking the event loop.

---

### 9.11 Blocking Calls in Async Code

A blocking call is any operation that does not yield control back to the event loop — a synchronous HTTP request, a heavy computation, `time.sleep`. Inside a coroutine, it freezes every other task in the loop.

This matters because a single blocking call undoes the benefit of async entirely. The fix is to use an async equivalent, or to push the blocking work to a thread or process pool.

> ⚠️ **Common misconception:** Adding `async` to a function does not make blocking code inside it non-blocking.

---

### 9.12 Choosing a Concurrency Model

Threads suit I/O-bound work with existing synchronous libraries. Asyncio suits I/O-bound work at high concurrency with async libraries. Processes suit CPU-bound work. Most real systems use more than one.

The choice exists because Python's models have genuinely different trade-offs, and picking the wrong one produces either no speed-up at all or far more complexity than the problem needed.

---

[[#📖 Master Table of Contents|⬆ Back to top]]

*End of Group 9. Next: CPython Internals & Memory Management.*

---

## 10. CPython Internals & Memory Management

### Table of Contents (this group)
- [[#10.1 Everything is an Object]]
- [[#10.2 Reference Counting]]
- [[#10.3 The Cycle Collector]]
- [[#10.4 Memory Allocators]]
- [[#10.5 Interning and Object Caches]]
- [[#10.6 Measuring Memory]]
- [[#10.7 Memory Leaks]]
- [[#10.8 Weak References]]
- [[#10.9 Bytecode and the Evaluation Loop]]
- [[#10.10 Interpreter Optimisations]]
- [[#10.11 Profiling]]

---

### 10.1 Everything is an Object

In CPython every value is a C structure with at least two fields: a reference count and a pointer to its type. Integers, strings, functions, classes and modules all share that layout.

This exists to give the language one uniform model. Because every value carries its own type, the interpreter can handle any value with the same machinery — and because every value carries a reference count, memory management is uniform too.

---

### 10.2 Reference Counting

Every object records how many references point to it. Binding a name increases the count, rebinding or deleting a name decreases it, and when the count reaches zero the object is freed immediately.

Reference counting exists because it is simple and predictable: memory is reclaimed as soon as it becomes unreachable, without waiting for a collection cycle.

---

### 10.3 The Cycle Collector

Reference counting cannot free objects that reference each other — a cycle keeps every count above zero even when nothing outside can reach them. The cycle collector exists to find and free exactly those groups.

It runs periodically, sorts objects into three generations, and inspects the youngest most often, on the assumption that most objects die young.

---

### 10.4 Memory Allocators

CPython does not ask the operating system for memory object by object. It requests large blocks called arenas, divides them into pools, and serves small allocations from those — a system called **pymalloc**.

It exists because Python programs allocate enormous numbers of small, short-lived objects, and going to the operating system each time would be far too slow.

---

### 10.5 Interning and Object Caches

CPython caches some objects rather than creating new ones: small integers from -5 to 256, and strings that look like identifiers. Asking for the same value returns the same object.

This exists to save memory and speed up comparison, because equal cached objects are also identical — which is why `is` sometimes appears to work on values it should not be used for.

---

### 10.6 Measuring Memory

`sys.getsizeof()` reports the size of one object, not of what it references. `tracemalloc` records where allocations came from, and external tools report the process's total footprint.

Measuring exists as its own skill because Python's memory is layered — object, allocator, process — and a number from one layer answers questions about that layer only.

---

### 10.7 Memory Leaks

Python has a garbage collector, so a "leak" here means something is still referenced when it should not be: a growing cache, a registry of objects, a closure holding a large value, or an exception stored with its traceback.

Understanding this exists as a topic because the fix is never "free the memory" — it is always "find and remove the reference".

---

### 10.8 Weak References

A weak reference points at an object without keeping it alive. If every remaining reference is weak, the object is collected and the weak reference reports `None`.

They exist for caches and registries that should not prolong the life of what they track — the standard tool for observing objects without owning them.

---

### 10.9 Bytecode and the Evaluation Loop

Python source is compiled to bytecode, and the evaluation loop executes those instructions one at a time against a stack of values. The `dis` module shows exactly which instructions a piece of code produces.

This exists as the layer where Python's performance characteristics actually live: the cost of a line of Python is the cost of the instructions it compiles into.

---

### 10.10 Interpreter Optimisations

Since Python 3.11 the interpreter *specialises* bytecode as it runs: an instruction that keeps seeing integers is quietly replaced with a faster integer-specific version. Python 3.13 added an experimental just-in-time compiler.

These exist because most code uses the same types at the same place every time, and exploiting that regularity makes the interpreter substantially faster without any change to your code.

---

### 10.11 Profiling

Profiling measures where a program actually spends its time or memory. `cProfile` counts function calls and durations, `timeit` measures small snippets accurately, and sampling profilers such as `py-spy` inspect a running process without modifying it.

Profiling exists because intuition about performance is reliably wrong, and the bottleneck is usually somewhere nobody suspected.

> 💡 **Tip:** Measure first, optimise second, measure again. Without the third step you cannot know whether the change helped.

---

[[#📖 Master Table of Contents|⬆ Back to top]]

*End of Group 10. Next: Files, I/O & Serialization.*

---

## 11. Files, I/O & Serialization

### Table of Contents (this group)
- [[#11.1 Opening Files]]
- [[#11.2 Text and Binary I/O]]
- [[#11.3 Paths with pathlib]]
- [[#11.4 Buffering and Flushing]]
- [[#11.5 JSON]]
- [[#11.6 CSV and Tabular Data]]
- [[#11.7 Pickle and Serialization Formats]]
- [[#11.8 Temporary Files and Atomic Writes]]
- [[#11.9 Streaming Large Files]]
- [[#11.10 Network I/O]]

---

### 11.1 Opening Files

`open(path, mode, encoding=...)` returns a file object. The mode says what you intend: `r` read, `w` write (truncating), `a` append, `x` create-only, with `+` for read and write. Using it in a `with` block closes it automatically.

Opening exists as an explicit step because a file is a limited operating-system resource: the handle must be acquired, used and released, and Python makes that lifetime visible.

```python
with open("data.txt", "r", encoding="utf-8") as fh:
    text = fh.read()
```

---

### 11.2 Text and Binary I/O

Text mode returns `str`, decoding bytes with an encoding and translating line endings. Binary mode (`rb`, `wb`) returns `bytes` exactly as stored, with no decoding or translation.

The split exists because some data is text that needs an encoding, and some is not text at all — images, archives, protocol frames — where any interpretation would corrupt it.

---

### 11.3 Paths with pathlib

`pathlib.Path` represents a filesystem path as an object with methods: `read_text()`, `exists()`, `mkdir()`, `glob()`, and the `/` operator for joining.

It exists to replace string manipulation of paths, which breaks across operating systems, and the scattered `os.path` functions, which are harder to read and to compose.

```python
from pathlib import Path

config = Path.home() / ".config" / "app.toml"
if config.exists():
    text = config.read_text(encoding="utf-8")
```

---

### 11.4 Buffering and Flushing

Writes do not go straight to disk. Python holds them in a buffer and writes in larger chunks, because one large write is far cheaper than many small ones. `flush()` pushes the buffer out, and closing a file flushes it.

Buffering exists for speed, and flushing exists because speed is not the only concern: a crash before the buffer is written loses the data it held.

---

### 11.5 JSON

JSON is the default interchange format for structured data. `json.dumps` turns Python objects into a JSON string, `json.loads` parses one back, and the `dump`/`load` variants work with files.

It exists because text-based, language-neutral, human-readable data is what APIs, configuration and logs need — at the cost of supporting only a small set of types.

---

### 11.6 CSV and Tabular Data

CSV is rows of delimited values. Python's `csv` module handles the details that break naive string splitting: quoted fields containing commas, embedded newlines, and configurable dialects.

It exists because CSV remains the universal tabular exchange format — imperfect, inconsistently implemented, and present in every data pipeline regardless.

---

### 11.7 Pickle and Serialization Formats

`pickle` serialises almost any Python object to bytes and reconstructs it later. It is Python-specific, and loading a pickle executes code — so it must never be used on untrusted data.

Formats exist on a spectrum: JSON for interoperability, pickle for Python-to-Python convenience, and binary formats such as Protocol Buffers, MessagePack or Parquet for size and speed.

---

### 11.8 Temporary Files and Atomic Writes

The `tempfile` module creates temporary files and directories safely, with unique names and correct permissions. An **atomic write** writes to a temporary file and then renames it over the target, so readers never see a half-written file.

Both exist because partial state is dangerous: a crash mid-write leaves a corrupt file, and predictable temporary names are a classic security hole.

---

### 11.9 Streaming Large Files

Streaming reads a file piece by piece — line by line, or in fixed-size chunks — instead of loading all of it. Memory then depends on the chunk size rather than on the file size.

It exists because files routinely exceed available memory, and because processing can start on the first chunk rather than after the last byte arrives.

```python
with open("huge.log", encoding="utf-8") as fh:
    for line in fh:            # one line at a time
        process(line)
```

---

### 11.10 Network I/O

Network I/O is reading and writing over a socket. Almost all application code works above that level: `httpx` or `requests` for HTTP, database drivers for databases, `asyncio` streams for custom protocols.

It matters because network calls fail in ways local files do not — timeouts, partial reads, retries, connection limits — and because that waiting is what concurrency in Python is mostly for.

> ⚠️ **Common misconception:** A network call without an explicit timeout does not fail quickly. It can hang for minutes, holding a worker the whole time.

---

[[#📖 Master Table of Contents|⬆ Back to top]]

*End of Group 11. Next: Typing, Tooling & Modern Python.*

---

## 12. Typing, Tooling & Modern Python

### Table of Contents (this group)
- [[#12.1 Type Hints and Annotations]]
- [[#12.2 Generics and Type Variables]]
- [[#12.3 Static Type Checking]]
- [[#12.4 Runtime Validation]]
- [[#12.5 Structural Pattern Matching]]
- [[#12.6 Modern Syntax Features]]
- [[#12.7 Testing with pytest]]
- [[#12.8 Linting and Formatting]]
- [[#12.9 Logging]]
- [[#12.10 Debugging Tools]]
- [[#12.11 Recent Python Releases]]

---

### 12.1 Type Hints and Annotations

A type hint declares what a function expects and returns: `def total(items: list[int]) -> int:`. Python stores the annotation and otherwise ignores it — nothing is checked when the program runs.

Hints exist because dynamic typing scales badly in large codebases. They give readers, editors and type checkers the information the interpreter never needed, without changing how the code executes.

```python
def greet(name: str, times: int = 1) -> str:
    return f"Hello, {name}! " * times
```

---

### 12.2 Generics and Type Variables

A generic type is one parameterised by another: `list[int]`, `dict[str, User]`, or your own `Stack[T]`. A type variable such as `T` stands for "whatever type the caller uses", so a function can say that its output type matches its input type.

They exist so containers and utilities can be described precisely without writing a separate version per element type.

---

### 12.3 Static Type Checking

A type checker — mypy, pyright or a similar tool — reads the annotations and reports inconsistencies before the code runs. It never changes execution; it is a separate program you run like a linter.

It exists to catch a large class of errors early: wrong argument types, forgotten `None` handling, renamed attributes and impossible branches.

---

### 12.4 Runtime Validation

Type hints do not check anything at runtime, so data arriving from outside the program — a request body, a config file, an API response — still needs validating. Libraries such as Pydantic do that, using the annotations as the schema.

This exists because the boundary between your program and the outside world is where wrong data enters, and that is the one place checking genuinely pays for itself.

---

### 12.5 Structural Pattern Matching

`match` compares a value against patterns and destructures it at the same time. Patterns can match literals, sequences, mappings, classes and combinations of them, binding names as they go.

Added in Python 3.10, it exists because dispatching on the *shape* of data — a message, an event, a parsed node — was previously a chain of `isinstance` checks and index lookups.

```python
match event:
    case {"type": "click", "pos": (x, y)}:
        handle_click(x, y)
    case _:
        ignore(event)
```

---

### 12.6 Modern Syntax Features

Recent Python releases added syntax that has become normal in new code: f-strings for formatting, the walrus operator `:=` for assigning inside expressions, `|` for union types, dictionary merging with `|`, and positional-only parameters.

These exist to remove recurring friction — the boilerplate around formatting, the duplicated call in a loop condition, the verbosity of `Optional[X]` — rather than to add capability.

---

### 12.7 Testing with pytest

`pytest` runs functions named `test_*`, reports failures with the actual values involved, and injects reusable setup through **fixtures** requested by parameter name. Parametrisation runs the same test over many inputs.

It exists because testing must be cheap enough to do constantly. A plain assert, a plain function, and no class hierarchy is what makes that true.

```python
import pytest

@pytest.mark.parametrize("value,expected", [(1, 2), (2, 4)])
def test_double(value, expected):
    assert double(value) == expected
```

---

### 12.8 Linting and Formatting

A **formatter** rewrites code into a canonical style so nobody argues about layout. A **linter** flags likely mistakes — unused imports, shadowed names, suspicious comparisons. `ruff` does both, very quickly, and `black` is the established formatter.

They exist to remove whole categories of review comments and to catch simple errors before a human reads the code.

---

### 12.9 Logging

The `logging` module records events with a severity level, a logger name and structured context. Configuration decides where records go and which levels are kept, separately from the code that emits them.

It exists because `print` cannot be filtered, routed, levelled or correlated — and in production, those are the only properties that matter.

---

### 12.10 Debugging Tools

`breakpoint()` drops into the debugger at that line. `pdb` steps through code, inspects variables and moves up and down the stack. For running processes, `py-spy` shows what a live program is doing without stopping it.

They exist because reading code can only take you so far: at some point you need to see the actual values in the actual failing state.

---

### 12.11 Recent Python Releases

Python releases yearly, in October, and each version is supported for roughly five years. Recent releases brought large interpreter speed-ups, better error messages, exception groups, structural pattern matching and an officially supported build without the GIL.

Keeping current exists as a practice because upgrades deliver performance and security fixes for free, and because falling several versions behind turns a routine upgrade into a project.

> 💡 **Tip:** Read the "What's New" page for each version you skip. It is short, and it is the fastest way to learn what changed.

---

[[#📖 Master Table of Contents|⬆ Back to top]]

*End of Group 12 — curriculum complete.*

---

## 🎓 Where to Go Next

You now have a complete mental map of Python. You should be able to say: *"I know what every concept is."*

Continue to **`1_understand.md`**, which expands every topic in this same order with mechanisms, diagrams, trade-offs and the misconceptions that survive years of writing Python — so you can say *"I understand how this works."*
