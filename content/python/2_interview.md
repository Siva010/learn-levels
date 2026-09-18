# Python — Interview Prep

> **Goal of this file:** Prepare you to confidently answer technical interview questions about Python. Assumes you have completed `0_foundation.md` and `1_understand.md`.

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

#### Definition
Python is a high-level, dynamically typed, garbage-collected programming language whose reference implementation, CPython, compiles source to bytecode and executes it on a virtual machine.

#### Why it exists
To make a language that is fast to write and easy to read without giving up the ability to build large systems — the middle ground between shell scripting and a systems language.

#### Interview explanation
Say that Python is dynamically typed but strongly typed: types are checked at runtime and attached to objects rather than names, but Python will not silently coerce a string into a number the way a weakly typed language does. Then mention that "interpreted" is a simplification — CPython compiles to bytecode first, and understanding that is what makes performance conversations possible.

#### Syntax
```python
# Dynamic typing: the name has no type, the object does
value = 42
value = "now a string"

# Strong typing: no silent coercion
"count: " + 42      # TypeError: can only concatenate str (not "int") to str
```

#### Example
```python
from dataclasses import dataclass

@dataclass
class User:
    name: str
    age: int

users = [User("Ada", 36), User("Linus", 54)]
adults = [u.name for u in users if u.age >= 18]
```

#### Common interview questions
- "Is Python interpreted or compiled?" (Both, in a sense: CPython compiles source to bytecode, then interprets that bytecode. It is not compiled ahead of time to machine code.)
- "Is Python strongly or weakly typed?" (Strongly typed and dynamically typed — no implicit coercion between unrelated types, but types are checked at runtime.)
- "What is duck typing?" (Compatibility is decided by whether an object supports the operations used, not by its declared type: if it has `read()`, it can be used as a file-like object.)
- "What is the difference between CPython, PyPy and Jython?" (Different implementations of the same language: CPython is the C reference implementation, PyPy adds a tracing JIT, Jython targeted the JVM.)

#### Follow-up questions
- "If Python is strongly typed, why does `True + 1` work?" (Because `bool` is a subclass of `int` by design, so this is ordinary inheritance, not coercion.)
- "Why is Python slower than C for tight loops?" (Every operation dispatches dynamically through the interpreter, allocates boxed objects and checks types at runtime — work a C compiler does once, at compile time.)
- "When is Python fast enough?" (When the heavy work happens inside C extensions such as NumPy, or when the program is I/O-bound, where interpreter overhead is irrelevant.)

#### Edge cases
- `bool` being a subclass of `int` means `True == 1` and `{1: "a", True: "b"}` collapses into a single dict entry.
- Python's "strong typing" does not stop `"ab" * 3` from producing `"ababab"` — that is a defined operation, not a coercion.

#### Common mistakes
- Claiming Python is interpreted and stopping there, which signals no knowledge of the runtime.
- Confusing dynamic typing with weak typing in an interview answer — they are independent axes.

#### Comparisons

| | Python | Java |
|---|---|---|
| Typing | Dynamic, strong | Static, strong |
| Compilation | To bytecode, at import | To bytecode, ahead of time |
| Memory | Refcounting + cycle GC | Tracing GC |
| Generics | Type hints, erased at runtime | Compile-time, erased |

#### Frequently confused with
Dynamic typing vs. weak typing — the single most common terminology mix-up in Python interviews.

#### Important facts to remember
- Dynamically typed *and* strongly typed.
- CPython compiles to bytecode; it does not interpret source text line by line.
- `bool` is a subclass of `int`.

---

### 1.2 The Interpreter, Bytecode and CPython

#### Definition
CPython executes Python by compiling each module to a code object containing bytecode, then running that bytecode in a stack-based evaluation loop, caching the compiled result in `__pycache__`.

#### Why it exists
Compiling to a portable intermediate form keeps the language platform-independent and dynamic while avoiding re-parsing source on every import.

#### Interview explanation
Walk the pipeline: tokenise, parse to AST, compile to bytecode, execute. Mention `dis` as the tool that lets you see the result, and `__pycache__` as the on-disk cache keyed by source timestamp or hash. If asked about performance, connect it to per-instruction interpreter overhead.

#### Syntax
```python
import dis
dis.dis("x = a + 1")

# Inspect a function's compiled code object
def f(a): return a + 1
f.__code__.co_consts, f.__code__.co_varnames
```

#### Example
```python
import dis

def total(items):
    result = 0
    for item in items:
        result += item
    return result

dis.dis(total)   # shows GET_ITER / FOR_ITER / BINARY_OP / STORE_FAST
```

#### Common interview questions
- "What is a `.pyc` file?" (Cached bytecode for an imported module, stored in `__pycache__` and tagged with the interpreter version.)
- "Does deleting `__pycache__` change behaviour?" (No — it only forces recompilation on the next import.)
- "What is the GIL, briefly?" (A lock that allows only one thread to execute Python bytecode at a time in CPython; covered in depth in Group 9.)
- "How would you find out what Python does with `a + b`?" (Disassemble it with `dis` and read the bytecode.)

#### Follow-up questions
- "Why is the top-level script not cached as a `.pyc`?" (Only imported modules are cached; the entry-point script is compiled fresh every run.)
- "What changes between Python versions in bytecode?" (Instructions are added, removed and renumbered freely — bytecode has no compatibility guarantee, hence the version tag in the `.pyc` name.)
- "What does a JIT add?" (It compiles hot paths to machine code at runtime — PyPy does this generally, and CPython 3.13 added an experimental copy-and-patch JIT.)

#### Edge cases
- A read-only source directory means no `.pyc` can be written, so every import recompiles — a real start-up cost in some container images.
- `python -O` strips `assert` statements and sets `__debug__` to `False`, producing different bytecode from the same source.

#### Common mistakes
- Blaming stale `.pyc` files for bugs; cache invalidation is based on source metadata and is reliable.
- Assuming bytecode is portable across interpreter versions.

#### Comparisons

| | CPython | PyPy |
|---|---|---|
| Execution | Bytecode interpreter | Tracing JIT to machine code |
| Best at | C-extension compatibility | Long-running pure-Python loops |
| Memory | Lower baseline | Higher, with JIT overhead |

#### Complexity
Interpretation cost is roughly linear in the number of bytecode instructions executed; the constant factor per instruction is what separates Python from compiled languages.

#### Frequently confused with
Bytecode vs. machine code — bytecode targets the Python VM, machine code targets the CPU.

#### Important facts to remember
- Source → AST → bytecode → evaluation loop.
- `__pycache__` caches imported modules only.
- `dis` is the tool interviewers expect you to name.

---

### 1.3 Variables, Names and Objects

#### Definition
A Python variable is a name bound in a namespace to an object; assignment rebinds the name and never copies the object.

#### Why it exists
A single uniform model — everything is an object, every name is a reference — removes the need for separate primitive and reference semantics.

#### Interview explanation
State the model precisely: Python passes object references by value. Rebinding a parameter inside a function does not affect the caller; mutating the object does. Then give the mutable-default example, because interviewers almost always steer there.

#### Syntax
```python
a = [1, 2]
b = a           # second name, same object
b.append(3)     # visible through a
b = [4]         # rebinds b only
```

#### Example
```python
def add_item(items, item):
    items.append(item)      # mutates the caller's list

def replace(items, item):
    items = [item]          # rebinds the local name only — caller unaffected

data = [1]
add_item(data, 2)   # data == [1, 2]
replace(data, 9)    # data is still [1, 2]
```

#### Common interview questions
- "Is Python pass-by-value or pass-by-reference?" (Neither exactly — object references are passed by value, so rebinding a parameter does not affect the caller but mutation does.)
- "What does `b = a` do for a list?" (Binds a second name to the same list object; no copy is made.)
- "Why does a mutable default argument persist between calls?" (Defaults are evaluated once when the `def` executes, so every call shares that one object.)
- "How do you copy a list?" (`list(x)`, `x[:]` or `copy.copy(x)` for a shallow copy; `copy.deepcopy(x)` when nested objects must be copied too.)

#### Follow-up questions
- "What is the difference between a shallow and a deep copy?" (A shallow copy duplicates the container but shares the contained objects; a deep copy recursively duplicates everything, including cycles, which it tracks.)
- "How does `id()` relate to this?" (It returns the object's identity — its memory address in CPython — which is what `is` compares.)
- "When is `deepcopy` a bad idea?" (On large graphs, or objects holding file handles, sockets or locks, which cannot meaningfully be duplicated.)

#### Edge cases
- `a += b` on a list mutates in place (`__iadd__`), while `a = a + b` creates a new list — the difference is visible to any other name bound to the original.
- A tuple is immutable but can contain a mutable list, so `t[0].append(1)` succeeds while `t[0] = x` raises.

#### Common mistakes
- Using `def f(items=[])` and accumulating state across calls.
- Assuming `copy.copy` protects nested structures.

#### Comparisons

| | Rebinding (`x = ...`) | Mutation (`x.append(...)`) |
|---|---|---|
| Affects caller | No | Yes |
| Creates object | Yes | No |
| Works on immutables | Yes | No |

#### Frequently confused with
Assignment vs. mutation — and, in interviews, "pass by reference" as a description of Python's calling convention.

#### Important facts to remember
- Names are references; assignment never copies.
- Defaults are evaluated once, at definition time.
- `+=` on a mutable object usually mutates in place.

---

### 1.4 Numbers and Numeric Types

#### Definition
Python provides arbitrary-precision `int`, IEEE-754 double `float`, `complex`, and exact alternatives `decimal.Decimal` and `fractions.Fraction`.

#### Why it exists
Different problems need different guarantees: unbounded counting, fast approximate measurement, and exact decimal accounting cannot all be served by one representation.

#### Interview explanation
Lead with the float question, because it is what gets asked: `0.1 + 0.2 != 0.3` because binary floating point cannot represent those decimals exactly. Say that this is IEEE-754, not a Python quirk, and that money belongs in `Decimal` or in integer minor units (cents).

#### Syntax
```python
7 / 2       # 3.5   true division
7 // 2      # 3     floor division
-7 // 2     # -4    floors toward negative infinity
7 % 3       # 1
-7 % 3      # 2     sign follows the divisor
2 ** 10     # 1024
```

#### Example
```python
from decimal import Decimal, ROUND_HALF_UP

price = Decimal("19.99")
tax = (price * Decimal("0.2")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
total = price + tax      # Decimal('23.99') — exact, auditable
```

#### Common interview questions
- "Why is `0.1 + 0.2 != 0.3`?" (Binary floating point cannot represent those decimal fractions exactly, so the sum is very slightly off; this is IEEE-754 behaviour.)
- "How do you handle money in Python?" (Use `Decimal` with explicit rounding, or store integer minor units such as cents — never binary `float`.)
- "What is the difference between `/` and `//`?" (`/` is true division and always returns a float for ints; `//` floors the result toward negative infinity.)
- "What does `-7 % 3` return and why?" (`2` — Python's modulo takes the sign of the divisor, unlike C and Java, which return `-1`.)

#### Follow-up questions
- "How do you compare floats safely?" (With a tolerance — `math.isclose(a, b)` — rather than `==`.)
- "Can an `int` overflow?" (No. It grows to any size memory allows; very large values simply cost more time and space.)
- "Is `round()` doing what I expect?" (It uses banker's rounding — ties go to the nearest even number — so `round(0.5)` is `0` and `round(2.5)` is `2`.)

#### Edge cases
- `float("nan") != float("nan")` — NaN is unequal to everything, including itself.
- `int` division by zero raises `ZeroDivisionError`, but `float("inf")` arithmetic quietly propagates infinities.
- `0.1 + 0.2 == 0.30000000000000004` is `True`; the error is real, not a display artefact.

#### Common mistakes
- Using `float` for currency.
- Assuming `round()` rounds halves up.
- Using `==` on computed floats instead of `math.isclose`.

#### Comparisons

| | `float` | `Decimal` |
|---|---|---|
| Base | Binary (2) | Decimal (10) |
| Exact for `0.1` | No | Yes |
| Speed | Hardware-fast | Software, slower |
| Precision | Fixed 53-bit | Configurable |

#### Complexity
Arithmetic on machine-sized ints is O(1); on very large ints, addition is O(n) and schoolbook multiplication O(n²) in digit count.

#### Frequently confused with
`/` vs. `//`, and Python's modulo sign convention vs. C's.

#### Important facts to remember
- `int` never overflows.
- `/` always returns a float for ints.
- `%` takes the sign of the divisor.
- `round()` uses banker's rounding.

---

### 1.5 Strings and Text

#### Definition
`str` is an immutable sequence of Unicode code points; `bytes` is an immutable sequence of 8-bit values; conversion between them requires an explicit codec.

#### Why it exists
Python 3 separated text from binary data so that encoding errors surface at the boundary instead of corrupting data silently, as happened routinely in Python 2.

#### Interview explanation
Say that `str` holds text and `bytes` holds data, that `encode`/`decode` cross the boundary, and that there is no implicit conversion. Then mention immutability and why `"".join(...)` beats `+=` in a loop — interviewers use that to check whether you think about allocation.

#### Syntax
```python
s = "héllo"
b = s.encode("utf-8")       # b'h\xc3\xa9llo'  — 6 bytes
back = b.decode("utf-8")    # 'héllo'          — 5 characters

f"{value!r} at {ts:%H:%M}"  # conversion and format spec in an f-string
```

#### Example
```python
def normalise(rows):
    parts = []
    for row in rows:
        parts.append(row.strip().casefold())
    return "\n".join(parts)        # single allocation
```

#### Common interview questions
- "What is the difference between `str` and `bytes`?" (Text vs. raw data: `str` holds Unicode code points, `bytes` holds octets, and converting requires an explicit encoding.)
- "Why is string concatenation in a loop slow?" (Strings are immutable, so each `+=` allocates and copies a new string, making the loop quadratic; `str.join` allocates once.)
- "What does `len("héllo")` return?" (`5` — the number of code points, not bytes; the UTF-8 encoding is 6 bytes.)
- "What is string interning?" (CPython caches some short, identifier-like strings so equal literals share one object — an optimisation you must not rely on for correctness.)

#### Follow-up questions
- "When is `+=` on strings actually fine?" (For a handful of concatenations; CPython even has an in-place optimisation when the string has a single reference, but it is not guaranteed.)
- "How do you compare strings case-insensitively?" (`casefold()` on both sides — it is more aggressive than `lower()` and handles cases such as German ß.)
- "What is the difference between `str.format` and f-strings?" (F-strings are evaluated inline at compile time and are faster and clearer; `format` is still useful when the template comes from data.)

#### Edge cases
- `"".join()` on a generator is fine, but on a generator that yields non-strings it raises `TypeError` mid-way, after partial work.
- Slicing a string by index can split a multi-code-point grapheme, producing a half-rendered character.
- Default file encoding is platform-dependent; on Windows it is not UTF-8 unless Python 3.15's UTF-8 default or `PYTHONUTF8=1` is in effect.

#### Common mistakes
- Opening files without `encoding="utf-8"`.
- Building large strings with `+=` inside a loop.
- Assuming `len()` counts what a user perceives as characters.

#### Comparisons

| | `str` | `bytes` |
|---|---|---|
| Element type | 1-char `str` | `int` |
| Literal prefix | none / `f` / `r` | `b` |
| Encoding | Implicit Unicode | None — raw |
| Typical source | User input, JSON text | Sockets, files, protocols |

#### Complexity
Indexing is O(1); concatenation is O(n + m); `join` over k pieces is O(total length); `in` uses a mixed Boyer-Moore/Horspool search, sublinear in practice.

#### Frequently confused with
`str` vs. `bytes`, and `encode` vs. `decode` (encode goes *to* bytes).

#### Important facts to remember
- Strings are immutable; every change allocates.
- `len` counts code points.
- Always pass `encoding=` explicitly when opening text files.

---

### 1.6 Operators and Expressions

#### Definition
Operators are syntax that dispatches to special ("dunder") methods on the operand types, with a reflected fallback and a `NotImplemented` protocol for unsupported pairs.

#### Why it exists
So user-defined types can participate in the same notation as built-in types, rather than operators being reserved for the language's own types.

#### Interview explanation
Explain the dispatch order — `__add__`, then the right operand's `__radd__`, then `TypeError` — and note that special methods are looked up on the type, not the instance. Mention that `and`/`or` return operands rather than booleans, since that comes up constantly in code review questions.

#### Syntax
```python
a + b       # type(a).__add__(a, b), else type(b).__radd__(b, a)
a += b      # type(a).__iadd__ if defined, else a = a + b
a < b       # type(a).__lt__
x in c      # type(c).__contains__
0 <= x < 10 # chained: evaluates x once
```

#### Example
```python
class Vector:
    def __init__(self, x, y): self.x, self.y = x, y
    def __add__(self, other):
        if not isinstance(other, Vector): return NotImplemented
        return Vector(self.x + other.x, self.y + other.y)
    def __mul__(self, k): return Vector(self.x * k, self.y * k)
    __rmul__ = __mul__          # makes 3 * v work too

3 * Vector(1, 2)                # Vector(3, 6) via __rmul__
```

#### Common interview questions
- "What does `a + b` actually do?" (Calls `type(a).__add__`; if it returns `NotImplemented`, Python tries `type(b).__radd__`, and raises `TypeError` if both decline.)
- "What do `and` and `or` return?" (One of their operands, not a boolean — `x or default` returns `x` when `x` is truthy, otherwise `default`.)
- "What is the difference between `is` and `==`?" (Identity vs. value equality; `is` compares object identity and cannot be overridden.)
- "How does `a < b < c` differ from other languages?" (It is a chained comparison meaning `a < b and b < c`, with `b` evaluated once — in C it would compare a boolean with `c`.)

#### Follow-up questions
- "Why return `NotImplemented` instead of raising?" (It gives the other operand a chance to handle the operation; raising immediately would prevent cooperation between types.)
- "What is the walrus operator for?" (`:=` assigns inside an expression, so you can capture and test a value in one place — common in `while` loops and comprehension filters.)
- "How is `!=` derived?" (Python derives it from `__eq__` automatically unless you define `__ne__` explicitly.)

#### Edge cases
- `__iadd__` mutating in place means `t = ([1],); t[0] += [2]` both mutates the list *and* raises `TypeError` for the tuple assignment — a famous puzzle.
- Special methods bypass instance attributes: setting `obj.__len__` does not change `len(obj)`.
- Operator precedence puts `not` below comparison, so `not a == b` means `not (a == b)`.

#### Common mistakes
- Defining `__eq__` without `__hash__`, making the class unhashable.
- Using `is` to compare numbers or strings.
- Assuming `and`/`or` coerce to `bool`.

#### Comparisons

| | `__add__` | `__iadd__` |
|---|---|---|
| Triggered by | `a + b` | `a += b` |
| Typical behaviour | Returns a new object | Mutates and returns `self` |
| Defined for immutables | Yes | Usually not |

#### Complexity
Operator dispatch is a constant-time type lookup; the cost that matters is whatever the method does.

#### Frequently confused with
`NotImplemented` (a value) vs. `NotImplementedError` (an exception).

#### Important facts to remember
- Dunder lookups happen on the type, not the instance.
- `and`/`or` return operands and short-circuit.
- Chained comparisons evaluate the middle operand once.

---

### 1.7 Control Flow Statements

#### Definition
Python's control flow consists of `if`/`elif`/`else`, `while`, the iterator-driven `for`, the loop `else` clause, and `match`/`case` structural pattern matching.

#### Why it exists
To express branching and repetition over *iterables* rather than over index arithmetic, keeping loops uniform across lists, files, generators and streams.

#### Interview explanation
Say that `for` is sugar over `iter()`/`next()` with `StopIteration` ending the loop, mention the loop `else` as the flag-variable eliminator, and be ready to explain why mutating a list while iterating skips elements. If `match` comes up, stress that it matches structure, and that a bare name is a capture pattern.

#### Syntax
```python
for i, item in enumerate(items, start=1):
    ...
while (line := f.readline()):
    ...
match command.split():
    case ["go", direction]: move(direction)
    case ["quit"]: raise SystemExit
    case _: print("unknown")
```

#### Example
```python
def find_user(users, name):
    for user in users:
        if user.name == name:
            break
    else:
        raise LookupError(name)     # runs only if no break
    return user
```

#### Common interview questions
- "How does a `for` loop work internally?" (Python calls `iter()` on the iterable once, then `next()` repeatedly, catching `StopIteration` to finish.)
- "What does `else` on a `for` loop mean?" (It runs when the loop completed without hitting `break` — useful for search loops.)
- "What happens if you remove items from a list while iterating it?" (The internal index keeps advancing as the list shrinks, so elements are skipped; iterate over a copy or build a new list.)
- "What is `enumerate` for?" (Yielding index/value pairs without manual counters; it takes a `start` argument.)

#### Follow-up questions
- "Why does `match` need `case _` rather than `else`?" (`_` is the wildcard pattern; `match` is a pattern statement, not a conditional chain.)
- "What is the danger with `case status:`?" (A bare lowercase name is a capture pattern that matches anything and binds it — it does not compare against a constant. Use a dotted name such as `Status.OPEN`.)
- "How do you loop over two sequences together?" (`zip(a, b)`, and `zip(a, b, strict=True)` since 3.10 to reject mismatched lengths.)

#### Edge cases
- `zip` silently stops at the shortest input unless `strict=True`.
- `while True` with a `break` is idiomatic in Python — there is no `do ... while`.
- A generator consumed once is exhausted; looping over it a second time yields nothing, with no error.

#### Common mistakes
- `for i in range(len(x))` where direct iteration or `enumerate` is clearer.
- Mutating the sequence being iterated.
- Writing `case "open"` patterns and mixing them with unguarded capture patterns that shadow later cases.

#### Comparisons

| | `for` | `while` |
|---|---|---|
| Driven by | An iterator | A condition |
| Ends on | `StopIteration` | Condition false or `break` |
| Typical use | Collections, streams | Polling, retries, event loops |

#### Complexity
Loop overhead is O(n) in the number of iterations; the iterator protocol adds one method call per item, which is why C-level helpers such as `sum()` and `map()` beat hand-written loops.

#### Frequently confused with
Loop `else` (runs when no `break`) vs. `try/else` (runs when no exception) — related ideas, different triggers.

#### Important facts to remember
- `for` uses the iterator protocol.
- Loop `else` means "no `break` happened".
- Never mutate a sequence you are iterating.

---

### 1.8 Functions and Parameters

#### Definition
A function is a first-class object built by `def` or `lambda`, holding a compiled code object plus defaults, closure cells and metadata, and called by binding arguments into a fresh frame.

#### Why it exists
First-class functions make callbacks, decorators, higher-order functions and dependency injection possible without special language machinery.

#### Interview explanation
Cover argument binding order, `*args`/`**kwargs`, keyword-only and positional-only markers, and the once-evaluated default rule. The mutable-default question is near-certain; answer it with the `None` sentinel fix.

#### Syntax
```python
def f(pos_only, /, standard, *args, kw_only, **kwargs):
    ...

def g(a, b=1, *, c):        # c must be passed by keyword
    ...

h = lambda x: x * 2         # expression only, no statements
```

#### Example
```python
def retry(func, /, *args, attempts=3, **kwargs):
    last = None
    for _ in range(attempts):
        try:
            return func(*args, **kwargs)
        except Exception as exc:
            last = exc
    raise last

retry(fetch, "https://example.com", attempts=5, timeout=2)
```

#### Common interview questions
- "What is the mutable default argument problem?" (Defaults are evaluated once at definition time, so a mutable default is shared by every call; use `None` and create the object inside the function.)
- "What do `*args` and `**kwargs` do?" (Collect extra positional arguments into a tuple and extra keyword arguments into a dict.)
- "What is a keyword-only argument?" (A parameter after a bare `*` in the signature, which callers must pass by name.)
- "What is the difference between `return` and `yield`?" (`return` ends the call and produces a value; `yield` suspends the function and makes it a generator — covered in Group 6.)

#### Follow-up questions
- "Why would a library make parameters positional-only?" (So it can rename them later without breaking callers, and to match C-implemented builtins.)
- "Are function annotations enforced?" (No — they are metadata stored in `__annotations__`; enforcement requires a type checker or a runtime validator such as Pydantic.)
- "What is a closure?" (A function that captures variables from an enclosing scope in closure cells, keeping them alive after that scope returns.)

#### Edge cases
- A default of `datetime.now()` is frozen at import time.
- `lambda` can only contain a single expression, so no statements, assignments or `try` blocks.
- Parameters cannot be both positional-only and keyword-only, and `/` must precede `*` in the signature.

#### Common mistakes
- `def f(items=[])` or `def f(cfg={})`.
- Passing a mutable object as a default and then mutating it.
- Assuming annotations validate anything at runtime.

#### Comparisons

| | `def` | `lambda` |
|---|---|---|
| Body | Statements | One expression |
| Name | Has `__name__` | `<lambda>` |
| Docstring | Yes | No |
| Use for | Anything reusable | Tiny inline callbacks |

#### Complexity
Calling a Python function costs a frame allocation and argument binding — small but not free, which is why hot loops sometimes inline logic or hoist lookups.

#### Frequently confused with
`*args` (packing at definition, unpacking at call) — the same syntax means opposite things in the two positions.

#### Important facts to remember
- Defaults evaluate once, at `def` time.
- `/` marks positional-only, bare `*` marks keyword-only.
- Annotations are metadata, not enforcement.

---

### 1.9 Scope and Namespaces

#### Definition
Namespaces map names to objects, and Python resolves names through Local, Enclosing, Global and Built-in scopes in that order, with scope determined statically at compile time.

#### Why it exists
To keep names in different functions and modules independent, and to make name resolution predictable and fast.

#### Interview explanation
State the LEGB rule, then the key consequence: assigning to a name anywhere in a function makes it local *throughout* that function, so reading it before assignment raises `UnboundLocalError`. Mention `global` and `nonlocal` as the explicit write permissions, and the late-binding closure trap.

#### Syntax
```python
x = "global"

def outer():
    y = "enclosing"
    def inner():
        nonlocal y          # rebind outer's y
        global x            # rebind module-level x
        z = "local"
    inner()
```

#### Example
```python
# Late binding — all three call sites print 2
fs = [lambda: i for i in range(3)]
print([f() for f in fs])            # [2, 2, 2]

# Fix: bind the current value as a default
fs = [lambda i=i: i for i in range(3)]
print([f() for f in fs])            # [0, 1, 2]
```

#### Common interview questions
- "What is the LEGB rule?" (Name lookup order: Local, Enclosing, Global, Built-in.)
- "Why do I get `UnboundLocalError` when the variable clearly exists globally?" (Because the function assigns to that name somewhere, making it local for the entire function body.)
- "What does `nonlocal` do?" (Rebinds a name in the nearest enclosing function scope, as opposed to `global`, which targets module scope.)
- "Do loops and `if` blocks create scopes?" (No — only modules, functions, lambdas, comprehensions and classes do.)

#### Follow-up questions
- "Why are locals faster than globals?" (Locals are stored in a fixed-size array on the frame and accessed by index via `LOAD_FAST`; globals require a dictionary lookup.)
- "Does a comprehension leak its loop variable?" (Not in Python 3 — it runs in its own scope. It did leak in Python 2.)
- "How do closures keep values alive?" (Through closure cells referenced by the inner function, which keep the captured objects alive after the enclosing call returns.)

#### Edge cases
- Class bodies are a scope but are not part of the enclosing-scope chain for methods, so a method cannot see a class-level name without `self.` or the class name.
- `locals()` in a function returns a snapshot; writing to it does not reliably change the actual locals.
- A comprehension's first iterable is evaluated in the enclosing scope, but the rest of the comprehension runs in its own.

#### Common mistakes
- Creating closures in a loop and expecting per-iteration capture.
- Reaching for `global` where passing a parameter or returning a value would do.

#### Comparisons

| | `global` | `nonlocal` |
|---|---|---|
| Targets | Module scope | Nearest enclosing function |
| Creates the name | Yes, if missing | No — must already exist |
| Typical use | Module-level caches, sparingly | Closure counters, accumulators |

#### Complexity
Local access is O(1) array indexing; global and built-in lookups are O(1) dictionary lookups, but with a larger constant — measurable inside hot loops.

#### Frequently confused with
`global` vs. `nonlocal`, and class scope vs. enclosing function scope.

#### Important facts to remember
- LEGB, decided at compile time.
- Assignment anywhere in a function makes the name local everywhere in it.
- Closures capture variables, not values.

---

### 1.10 Truthiness, None and Equality

#### Definition
Truthiness is the boolean interpretation of any object via `__bool__` or `__len__`; `None` is the singleton "no value" object; `==` compares value while `is` compares identity.

#### Why it exists
Truthiness keeps guard clauses short, and a single `None` singleton gives every API one unambiguous way to say "nothing here".

#### Interview explanation
Give the rule (`__bool__`, else `__len__`, else true), then the identity-vs-equality distinction, then the practical warning: `if x:` and `if x is not None:` differ whenever `0`, `""`, `[]` or `{}` is valid data. Mention the `__eq__`/`__hash__` contract if hashing comes up.

#### Syntax
```python
if items:              # truthiness: non-empty
if value is None:      # identity: the singleton
if value == other:     # equality: __eq__
if flag is True:       # almost always wrong — just use `if flag:`
```

#### Example
```python
def scale(values, factor=None):
    if factor is None:          # correct: 0 is a valid factor
        factor = 1
    return [v * factor for v in values]

scale([1, 2], 0)                # [0, 0] — would break with `if not factor:`
```

#### Common interview questions
- "What is the difference between `==` and `is`?" (Value equality vs. object identity; `is` cannot be overridden and should be reserved for singletons.)
- "Why does `256 is 256` differ from `257 is 257`?" (CPython caches small integers from -5 to 256, so identity accidentally holds for them; it is an implementation detail, never a guarantee.)
- "What makes an object falsy?" (`__bool__` returning `False`, or `__len__` returning 0; otherwise the object is truthy.)
- "Why must `__hash__` agree with `__eq__`?" (Equal objects must hash equally or dicts and sets will fail to find keys; defining `__eq__` alone sets `__hash__` to `None`.)

#### Follow-up questions
- "What happens to `__hash__` when you define `__eq__`?" (It is set to `None`, making instances unhashable, unless you define `__hash__` yourself or use `@dataclass(frozen=True)`.)
- "How do you write a sentinel that is distinct from `None`?" (`MISSING = object()` — a unique object compared with `is`, used when `None` itself is a valid value.)
- "Is `x == None` ever right?" (Practically never; a custom `__eq__` can return `True` for it, which is exactly why `is None` is the rule.)

#### Edge cases
- `float("nan") == float("nan")` is `False`, but `nan is nan` is `True` for the same object — so a NaN stored in a list is found by `in` (which tries identity first) yet fails an equality test.
- A class defining `__len__` returning 0 is falsy even when it holds meaningful state.
- `bool` subclasses `int`, so `True == 1` and `sum([True, True])` is `2`.

#### Common mistakes
- `if x:` used to detect "argument not supplied".
- Comparing against `None` with `==`.
- Overriding `__eq__` without `__hash__` and then using instances as dict keys.

#### Comparisons

| | `if x:` | `if x is not None:` |
|---|---|---|
| Rejects `0`, `""`, `[]` | Yes | No |
| Calls user code | Yes (`__bool__`/`__len__`) | No |
| Right for optional args | No | Yes |

#### Complexity
`is` is a pointer comparison, O(1). `==` is whatever `__eq__` costs — O(n) for sequences, and potentially arbitrary for user types.

#### Frequently confused with
Truthiness vs. `is not None`, and `==` vs. `is` for cached values.

#### Important facts to remember
- `None` is a singleton — compare with `is`.
- Falsy means `__bool__` false or `__len__` zero.
- `__eq__` without `__hash__` makes a class unhashable.

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

#### Definition
A list is a mutable, ordered sequence implemented as a dynamic array of object pointers, with amortised O(1) append and O(1) indexing.

#### Why it exists
To provide the default general-purpose container: ordered, growable, and able to hold any mix of objects.

#### Interview explanation
Say "dynamic array, not linked list" early — it explains every complexity figure that follows. Then give the operation costs and the over-allocation mechanism behind amortised appends.

#### Syntax
```python
items = [1, 2, 3]
items.append(4)         # O(1) amortised
items.insert(0, 0)      # O(n)
items.pop()             # O(1) from the end
items.pop(0)            # O(n) from the front
items.extend(other)     # O(k)
```

#### Example
```python
def chunk(items, size):
    return [items[i:i + size] for i in range(0, len(items), size)]

chunk([1, 2, 3, 4, 5], 2)      # [[1, 2], [3, 4], [5]]
```

#### Common interview questions
- "How is a Python list implemented?" (As a dynamic array of pointers to objects, with over-allocation so that appends are amortised O(1).)
- "What is the complexity of `insert(0, x)`?" (O(n) — every existing pointer shifts one position.)
- "How do you remove duplicates from a list?" (`list(dict.fromkeys(items))` preserves order; `list(set(items))` does not.)
- "What is the difference between `append` and `extend`?" (`append` adds one object — possibly a list, nested; `extend` adds each item of an iterable.)

#### Follow-up questions
- "Why is append amortised O(1) rather than O(1)?" (Occasionally the array is full and must be reallocated and copied, which is O(n), but the growth is proportional so the cost spreads out.)
- "What does `list * 3` do?" (Repeats the references three times — for nested mutable items, all copies are the same object.)
- "How would you implement a queue?" (`collections.deque`, which is O(1) at both ends, rather than `list.pop(0)`.)

#### Edge cases
- `[[0] * 3] * 3` creates three references to one inner list.
- `list.remove(x)` removes the *first* match only and raises `ValueError` if absent.
- Slicing beyond the end is clamped, but indexing beyond it raises `IndexError`.

#### Common mistakes
- Using a list as a FIFO queue with `pop(0)`.
- Removing items from a list while iterating over it.
- Assuming `sort()` returns the sorted list.

#### Comparisons

| | `list` | `tuple` |
|---|---|---|
| Mutable | Yes | No |
| Hashable | No | If contents are |
| Memory | Larger (over-allocates) | Smaller, exact |
| Typical use | Growing collections | Fixed records, keys |

#### Complexity
Index O(1), append O(1) amortised, insert/delete at position O(n), membership O(n), `sort` O(n log n).

#### Frequently confused with
Lists vs. arrays — Python's `list` is a dynamic array of pointers; `array.array` and NumPy arrays store unboxed values.

#### Important facts to remember
- Dynamic array, not a linked list.
- `pop(0)` is O(n); use a `deque`.
- `append` is amortised O(1) thanks to over-allocation.

---

### 2.2 Tuples and Named Tuples

#### Definition
A tuple is an immutable, ordered sequence; a named tuple is a tuple subclass whose positions also have field names.

#### Why it exists
To represent fixed-length records that can be shared safely, used as dictionary keys, and unpacked — without the cost or ceremony of a class.

#### Interview explanation
Stress that immutability is shallow: the tuple's slots are fixed, but a mutable object inside one can still change. Then note that a tuple is hashable only if everything inside it is, which is what makes it usable as a composite dict key.

#### Syntax
```python
single = (5,)            # trailing comma required
pair = 3, 4              # parentheses are optional
x, y = pair              # unpacking

from typing import NamedTuple
class Point(NamedTuple):
    x: float
    y: float = 0.0
```

#### Example
```python
# Composite dictionary keys — only possible because tuples are hashable
sales = {}
sales[("2026-09", "EU")] = 1200
sales[("2026-09", "US")] = 3400
```

#### Common interview questions
- "What is the difference between a list and a tuple?" (Mutability, hashability, and memory: tuples are fixed, hashable if their contents are, and slightly smaller.)
- "Can a tuple contain a mutable object?" (Yes — and then the tuple itself is unhashable, though its slots still cannot be reassigned.)
- "Why does `(5)` not create a tuple?" (Parentheses are grouping; the comma makes the tuple, so you need `(5,)`.)
- "When would you use a named tuple over a dataclass?" (When you want tuple behaviour — unpacking, indexing, immutability, low memory — rather than a mutable record with methods.)

#### Follow-up questions
- "Are tuples always faster than lists?" (Construction is faster and memory is lower, but element access is essentially identical — the difference rarely decides a design.)
- "How do you update a named tuple?" (`instance._replace(field=value)` returns a new instance; the original is unchanged.)
- "What does `tuple(mylist)` cost?" (O(n) — it copies the pointer array.)

#### Edge cases
- `t = ([1],); t[0] += [2]` mutates the inner list *and* raises `TypeError` — the mutation happens before the failed assignment.
- A one-element tuple without the comma is a very common typo that silently produces a non-tuple.
- `namedtuple` field names cannot start with an underscore, since those are reserved for its own methods.

#### Common mistakes
- Assuming immutability is deep.
- Forgetting the trailing comma.
- Using a plain tuple with five positional fields where nobody can remember what index 3 means.

#### Comparisons

| | `namedtuple` | `@dataclass` | `dict` |
|---|---|---|---|
| Mutable | No | Yes (unless frozen) | Yes |
| Hashable | Yes | Only if frozen | No |
| Field access | Name and index | Name | Key |
| Memory | Lowest | Low with `slots=True` | Highest |

#### Complexity
Indexing O(1); construction O(n); hashing O(n) in the number of elements.

#### Frequently confused with
Immutability vs. deep immutability — the single most common tuple misunderstanding.

#### Important facts to remember
- Immutability is shallow.
- Hashable only if all contents are hashable.
- The comma makes the tuple, not the parentheses.

---

### 2.3 Dictionaries

#### Definition
A dict is a hash table mapping hashable keys to arbitrary values, with average O(1) lookup, insert and delete, and guaranteed insertion-ordered iteration since Python 3.7.

#### Why it exists
To answer "what value is associated with this key?" without scanning, and to serve as the language's own storage for namespaces, attributes and keyword arguments.

#### Interview explanation
Describe the hash-then-probe mechanism, mention the compact layout that gives ordering for free, and be precise that ordering is insertion order rather than sorted order. If asked about performance, mention the amortised resize.

#### Syntax
```python
d = {"a": 1, "b": 2}
d.get("c", 0)              # default instead of KeyError
d.setdefault("c", []).append(1)
d | {"c": 3}               # merge, 3.9+
d.keys(), d.values(), d.items()     # live views
```

#### Example
```python
def group_by(records, key):
    out = {}
    for record in records:
        out.setdefault(key(record), []).append(record)
    return out

group_by(users, lambda u: u.country)
```

#### Common interview questions
- "How does a Python dict work internally?" (A hash table: hash the key, index into a table, probe on collision, confirm with `==`; CPython stores entries in a compact insertion-ordered array with a separate index array.)
- "Are dicts ordered?" (Yes, insertion-ordered since 3.7 by language guarantee — 3.6 had it as an implementation detail. That is not sorted order.)
- "What can be a dict key?" (Any hashable object: immutable built-ins, tuples of hashables, or user objects with consistent `__eq__` and `__hash__`.)
- "What is the difference between `d[k]` and `d.get(k)`?" (`d[k]` raises `KeyError` when missing; `get` returns `None` or a supplied default.)

#### Follow-up questions
- "What are dict views?" (`keys()`, `values()` and `items()` return live views that reflect later changes and support set operations — they are not snapshots.)
- "What happens on a hash collision?" (CPython probes a deterministic sequence of alternative slots until it finds a free one or a matching key.)
- "How much memory does a dict use?" (Substantially more than a list of pairs — it keeps a sparse index table plus the entries array, sized to stay about two-thirds full.)

#### Edge cases
- `{1: "a", True: "b", 1.0: "c"}` collapses to one entry, because `1 == True == 1.0` and they hash equally.
- Mutating a dict during iteration raises `RuntimeError`.
- `dict.fromkeys(keys, [])` gives every key the *same* list object.

#### Common mistakes
- Using `d.keys()` where iteration over `d` would do.
- Assuming order means sorted.
- Mutating while iterating instead of iterating over a materialised copy.

#### Comparisons

| | `dict` | `list` of pairs |
|---|---|---|
| Lookup by key | O(1) | O(n) |
| Memory | Higher | Lower |
| Duplicate keys | Impossible | Allowed |
| Order | Insertion | Insertion |

#### Complexity
Average O(1) for get/set/delete; O(n) worst case under adversarial collisions; iteration O(n).

#### Frequently confused with
Insertion order vs. sorted order, and `setdefault` vs. `defaultdict`.

#### Important facts to remember
- Insertion-ordered since 3.7, guaranteed.
- Keys must be hashable.
- Views are live, not snapshots.

---

### 2.4 Sets and Frozensets

#### Definition
A set is an unordered collection of unique hashable objects with O(1) membership testing; a frozenset is its immutable, hashable counterpart.

#### Why it exists
To make membership, deduplication and set algebra cheap — the operations that lists perform in linear time.

#### Interview explanation
Say that a set is a dict without values, which explains both the O(1) membership and the hashability requirement. The practical point interviewers want is converting a list to a set before repeated membership tests.

#### Syntax
```python
s = {1, 2, 3}
empty = set()            # {} is an empty dict, not a set
s.add(4); s.discard(9)   # discard does not raise
s | t, s & t, s - t, s ^ t
frozenset([1, 2]) in {frozenset([1, 2]): "ok"}
```

#### Example
```python
def diff_permissions(current, desired):
    current, desired = set(current), set(desired)
    return {"grant": desired - current, "revoke": current - desired}
```

#### Common interview questions
- "Why is `in` faster for a set than a list?" (A set hashes the item and checks one bucket — O(1); a list compares element by element — O(n).)
- "How do you create an empty set?" (`set()`; `{}` creates an empty dict.)
- "Can a set contain a list?" (No — lists are unhashable. Use a tuple or a frozenset.)
- "Do sets preserve order?" (No, not even insertion order; iteration order depends on hashes and is affected by per-process hash randomisation for strings.)

#### Follow-up questions
- "What is the difference between `remove` and `discard`?" (`remove` raises `KeyError` when absent; `discard` does not.)
- "What is a frozenset for?" (When you need a set as a dict key or as a member of another set — for example, caching results keyed by a set of parameters.)
- "How costly is `set(list)`?" (O(n) time and a new allocation — worth it when you will test membership more than a couple of times.)

#### Edge cases
- `{1, True}` has one element, for the same reason `{1: ..., True: ...}` has one key.
- Sets of floats containing `nan` behave oddly: `nan` is unequal to itself, but the *same* `nan` object is found by identity.
- Set iteration order can change between runs due to hash randomisation, which breaks tests that assume a fixed order.

#### Common mistakes
- Using `{}` for an empty set.
- Deduplicating with a set when order must be preserved.
- Writing tests that depend on set iteration order.

#### Comparisons

| | `set` | `frozenset` |
|---|---|---|
| Mutable | Yes | No |
| Hashable | No | Yes |
| Usable as dict key | No | Yes |
| Set algebra | Yes | Yes |

#### Complexity
`add`, `remove`, `in`: O(1) average. Union O(n + m); intersection O(min(n, m)); difference O(n).

#### Frequently confused with
`{}` as an empty set vs. an empty dict — a genuine syntax trap.

#### Important facts to remember
- A set is a dict without values.
- `set()` for empty, `{}` is a dict.
- No ordering guarantee whatsoever.

---

### 2.5 Indexing and Slicing

#### Definition
Indexing retrieves one element by position via `__getitem__`; slicing retrieves a sub-sequence described by a `slice` object with start, stop and step.

#### Why it exists
To give every sequence type one uniform, readable way to address parts of itself, replacing manual loops and index arithmetic.

#### Interview explanation
Cover exclusive `stop`, negative indices, clamping of out-of-range slices, and the fact that slicing built-in sequences produces a shallow copy. The `a[:]` copy idiom and `a[::-1]` reversal come up constantly.

#### Syntax
```python
s[i]            # single element, IndexError if out of range
s[a:b]          # a inclusive, b exclusive
s[a:b:step]     # step may be negative
s[:]            # shallow copy
del s[a:b]      # delete a slice (mutable sequences)
s[a:b] = [...]  # replace a slice, possibly changing length
```

#### Example
```python
def last_n_lines(path, n=10):
    with open(path, encoding="utf-8") as fh:
        return fh.read().splitlines()[-n:]      # clamped: fine for short files
```

#### Common interview questions
- "What does `a[::-1]` do?" (Returns a reversed *copy* of the sequence.)
- "Why does `a[5:10]` not raise on a 3-element list?" (Slice bounds are clamped to the sequence; only integer indexing raises `IndexError`.)
- "How do you copy a list with slicing?" (`a[:]` — a shallow copy, so nested objects are still shared.)
- "What is the difference between `reversed(a)` and `a[::-1]`?" (`reversed` returns a lazy iterator with no allocation; the slice builds a full copy.)

#### Follow-up questions
- "How does slice assignment change length?" (`a[1:3] = [9]` replaces two items with one, shortening the list — it is a bulk splice.)
- "Do slices work on strings and tuples?" (Yes, identically — but they return new immutable objects, and slice assignment is not possible.)
- "What is `slice()` used for directly?" (Naming a reusable slice, and implementing `__getitem__` on custom sequence classes.)

#### Edge cases
- `a[::-1]` on a huge list doubles memory temporarily.
- A negative step with defaults reverses the start/stop meaning: `a[::-1]` covers the whole sequence, while `a[0:len(a):-1]` is empty.
- Slicing a NumPy array returns a *view*, not a copy — the opposite of built-in sequence behaviour, and a common cross-library trap.

#### Common mistakes
- Assuming `stop` is inclusive.
- Reversing large lists with slices inside loops.
- Expecting `list` slicing semantics from NumPy (or vice versa).

#### Comparisons

| | `a[::-1]` | `reversed(a)` |
|---|---|---|
| Allocates | Yes, full copy | No |
| Returns | New sequence | Iterator |
| Reusable | Yes | Once |

#### Complexity
Indexing O(1); slicing k items O(k); slice assignment O(n) when the length changes.

#### Frequently confused with
Copying vs. viewing — built-in slices copy; NumPy slices view.

#### Important facts to remember
- `stop` is exclusive.
- Slice bounds are clamped; indices are not.
- Slicing built-ins produces a shallow copy.

---

### 2.6 Hashing and Hashability

#### Definition
An object is hashable if `hash(obj)` is defined, constant for the object's lifetime, and consistent with `__eq__`; only hashable objects can be dict keys or set members.

#### Why it exists
Hash-based containers locate items by hash. A changing or inconsistent hash would make stored items unfindable, so Python makes hashability an explicit property.

#### Interview explanation
State the contract — equal objects must hash equally — and explain that defining `__eq__` sets `__hash__` to `None` so that Python does not guess. Mention hash randomisation for strings as the security measure it is.

#### Syntax
```python
hash("abc")          # int, salted per process
hash((1, 2))         # ok — tuple of hashables
hash([1, 2])         # TypeError: unhashable type: 'list'

class Key:
    def __eq__(self, other): ...
    def __hash__(self): return hash(self._identity())
```

#### Example
```python
from dataclasses import dataclass

@dataclass(frozen=True)          # frozen gives a correct __hash__ for free
class CacheKey:
    user_id: int
    scope: str

cache = {CacheKey(1, "read"): "..."}
```

#### Common interview questions
- "What makes an object hashable?" (A stable `__hash__` consistent with `__eq__`; immutability in practice.)
- "Why can't a list be a dict key?" (It is mutable, so its hash could not stay stable — Python therefore does not define `__hash__` for it.)
- "What happens if you define `__eq__` but not `__hash__`?" (The class becomes unhashable: Python sets `__hash__` to `None`.)
- "Do equal objects have to hash the same?" (Yes, that is the contract. The reverse is not required — different objects may collide.)

#### Follow-up questions
- "What is hash randomisation and why does it exist?" (Per-process salting of `str`/`bytes` hashes, added to defeat deliberate collision denial-of-service attacks.)
- "Can you cache a hash?" (CPython caches string hashes on the object; for your own classes, cache only if the fields are genuinely immutable.)
- "What breaks if a key mutates after insertion?" (The container looks in the wrong bucket, so the entry becomes invisible — no exception is raised.)

#### Edge cases
- `hash(-1)` is `-2` in CPython, because `-1` signals an error internally.
- `hash(1) == hash(1.0) == hash(True)`, so those three collapse to one dict key.
- Objects with default (identity-based) hashing compare unequal even when their contents match, which silently duplicates cache entries.

#### Common mistakes
- Mutating an object after using it as a key.
- Defining `__eq__` without `__hash__` and hitting the failure much later.
- Assuming equal hashes imply equal objects.

#### Comparisons

| | Default `object` | Value class done right |
|---|---|---|
| `__eq__` | Identity | Field comparison |
| `__hash__` | `id()`-based | Hash of the same fields |
| Two equal-looking instances | Different keys | Same key |

#### Complexity
Hashing a string or tuple is O(n) in its size, computed once for strings and cached.

#### Frequently confused with
Hash equality vs. object equality — a collision is normal, not a bug.

#### Important facts to remember
- `__eq__` without `__hash__` means unhashable.
- Hashes must stay constant while stored.
- String hashes are randomised per process.

---

### 2.7 Sorting and Ordering

#### Definition
Python sorts with Timsort — a stable, adaptive merge sort — exposed as `sorted()` (returns a new list) and `list.sort()` (in place), both taking `key` and `reverse`.

#### Why it exists
Ordering is ubiquitous, and a stable adaptive algorithm handles the partially ordered data that real programs actually produce.

#### Interview explanation
Name Timsort, say O(n log n) worst case and near O(n) on nearly-sorted input, and explain stability with the two-pass example. Mention that `key` is called once per element, unlike a comparison function.

#### Syntax
```python
sorted(data, key=len, reverse=True)
data.sort(key=lambda r: (r.dept, -r.salary))

from functools import cmp_to_key
sorted(data, key=cmp_to_key(my_comparator))     # legacy comparators
```

#### Example
```python
from operator import attrgetter, itemgetter

sorted(people, key=attrgetter("last_name", "first_name"))
sorted(rows, key=itemgetter(2))        # faster than an equivalent lambda
```

#### Common interview questions
- "What algorithm does Python use to sort?" (Timsort — a hybrid of merge sort and insertion sort that exploits existing runs; stable, O(n log n) worst case.)
- "What does 'stable' mean and why does it matter?" (Equal elements keep their relative order, which lets you sort by several keys in successive passes.)
- "What is the difference between `sorted()` and `.sort()`?" (`sorted` returns a new list and works on any iterable; `.sort()` mutates a list in place and returns `None`.)
- "How do you sort by multiple fields with mixed directions?" (Use a tuple key with negation for numbers, or two stable passes from least to most significant.)

#### Follow-up questions
- "Why was `cmp` removed in Python 3?" (Key functions are called n times rather than O(n log n) times and are easier to reason about; `functools.cmp_to_key` remains for legacy comparators.)
- "How would you get the 10 largest items?" (`heapq.nlargest(10, data)` — O(n log k) instead of sorting everything.)
- "Can you sort a dict?" (You sort its items: `sorted(d.items(), key=itemgetter(1))` returns a list of pairs; dicts themselves are insertion-ordered.)

#### Edge cases
- Sorting mixed types raises `TypeError` in Python 3 (`3 < "a"` is not defined).
- `reverse=True` preserves stability — it is not the same as sorting then reversing.
- Sorting by a key that raises for some elements fails part-way, leaving the list partially reordered when using `.sort()`.

#### Common mistakes
- `data = data.sort()`, which assigns `None`.
- Sorting an entire dataset to take the top 5.
- Assuming a `key` function is called lazily — it is applied to every element up front.

#### Comparisons

| | `sorted()` | `list.sort()` |
|---|---|---|
| Input | Any iterable | List only |
| Returns | New list | `None` |
| Memory | New list | In place (O(n) temp) |

#### Complexity
O(n log n) worst case, O(n) on already-ordered input, O(n) additional memory; `key` adds n calls.

#### Frequently confused with
`sorted()` vs. `.sort()`, and stability vs. the reverse flag.

#### Important facts to remember
- Timsort: stable and adaptive.
- `.sort()` returns `None`.
- `key` is evaluated once per element.

---

### 2.8 The collections Module

#### Definition
`collections` provides specialised containers — `deque`, `defaultdict`, `Counter`, `OrderedDict`, `ChainMap` — each tuned for an access pattern the general-purpose built-ins handle poorly.

#### Why it exists
So common patterns (queues, grouping, counting, layered lookup) get correct complexity and C-speed implementations instead of hand-rolled equivalents.

#### Interview explanation
Name the container, the pattern it solves, and its complexity: `deque` for O(1) ends, `defaultdict` for grouping without `setdefault`, `Counter` for tallies and `most_common`. Mention that `defaultdict` inserts on read, since that is the trap interviewers probe.

#### Syntax
```python
from collections import deque, defaultdict, Counter, ChainMap

q = deque([1, 2], maxlen=3)
q.appendleft(0); q.pop()
groups = defaultdict(list)
tally = Counter(words)
settings = ChainMap(overrides, defaults)
```

#### Example
```python
from collections import deque

def sliding_max(values, k):
    window, out = deque(), []
    for i, value in enumerate(values):
        while window and values[window[-1]] <= value:
            window.pop()
        window.append(i)
        if window[0] <= i - k:
            window.popleft()
        if i >= k - 1:
            out.append(values[window[0]])
    return out
```

#### Common interview questions
- "When would you use a `deque` instead of a list?" (Whenever you append or pop at the front: `deque` is O(1) there, a list is O(n).)
- "What does `defaultdict` do that `dict` does not?" (Calls a factory to create a value when a missing key is accessed, instead of raising `KeyError`.)
- "How do you count occurrences?" (`Counter(iterable)`, then `most_common(n)` for the top entries.)
- "Is `OrderedDict` still needed?" (Rarely — plain dicts keep insertion order since 3.7. `OrderedDict` still differs in that `==` is order-sensitive, and it has `move_to_end`.)

#### Follow-up questions
- "How is a `deque` implemented?" (A doubly linked list of fixed-size blocks, giving O(1) ends and O(n) middle access.)
- "What is a bounded deque used for?" (Sliding windows and 'last N events' buffers — it discards from the far end automatically.)
- "Can `Counter` hold negative counts?" (Yes — subtraction can produce negatives, and `most_common` will still report them, which surprises people.)

#### Edge cases
- `defaultdict(list)["missing"]` inserts the key, so a read inside a check silently grows the dict.
- `Counter` arithmetic (`+`, `-`) drops non-positive counts, while `subtract()` keeps them.
- `deque` supports indexing, but `d[len(d)//2]` is O(n) — it is not a random-access structure.

#### Common mistakes
- Membership-testing a `defaultdict` with `d[key]` instead of `key in d`.
- Using `list.pop(0)` in a queue instead of `deque.popleft()`.
- Reaching for `OrderedDict` out of habit in new code.

#### Comparisons

| | `list` | `deque` |
|---|---|---|
| Append/pop left | O(n) | O(1) |
| Random access | O(1) | O(n) |
| Slicing | Yes | No |
| Bounded mode | No | `maxlen` |

#### Complexity
`deque` ends O(1); `defaultdict`/`Counter` inherit dict's O(1) average operations; `Counter.most_common(k)` is O(n log k).

#### Frequently confused with
`defaultdict` vs. `dict.setdefault` — the factory runs only on a miss, `setdefault`'s default is built every call.

#### Important facts to remember
- `deque` is O(1) at both ends.
- `defaultdict` inserts on read.
- Plain dicts already preserve insertion order.

---

### 2.9 Unpacking and Star Expressions

#### Definition
Unpacking binds the items of an iterable to several targets at once; starred targets collect the remainder, and the same star syntax spreads iterables and mappings into calls and literals.

#### Why it exists
To eliminate index arithmetic and temporary variables when taking structures apart, passing them on, or merging them.

#### Interview explanation
Show `first, *rest`, nested unpacking and the call-site forms, then explain that the right-hand side of `a, b = b, a` is built as a tuple first — the reason swapping needs no temporary.

#### Syntax
```python
a, b = b, a
first, *rest = items
*init, last = items
f(*args, **kwargs)
merged = {**a, **b}
combined = [*a, *b]
```

#### Example
```python
def parse_line(line):
    key, *values = line.split(",")
    return key, [v.strip() for v in values]

parse_line("id, 1, 2, 3")      # ('id', ['1', '2', '3'])
```

#### Common interview questions
- "What does `a, *b = [1, 2, 3]` give?" (`a` is 1, `b` is `[2, 3]` — the starred target always produces a list.)
- "How do you swap two variables?" (`a, b = b, a`, which builds a tuple then unpacks it.)
- "What is the difference between `*` in a definition and in a call?" (In a definition it packs extra arguments; in a call it spreads an iterable into arguments.)
- "How do you merge two dicts?" (`{**a, **b}` or `a | b` in 3.9+, with later keys winning.)

#### Follow-up questions
- "Can you use two starred targets?" (No — it would be ambiguous; exactly one is allowed per assignment target list.)
- "Does unpacking work on generators?" (Yes, and it consumes them — after unpacking, the generator is exhausted.)
- "What happens on a length mismatch?" (`ValueError: not enough values to unpack` or `too many values to unpack` at runtime.)

#### Edge cases
- Unpacking a `dict` yields its keys, not items: `a, b = {"x": 1, "y": 2}` binds the strings.
- `{**a, **b}` is shallow — nested dicts are shared, not merged.
- Starred unpacking of an infinite generator never terminates.

#### Common mistakes
- Unpacking an iterator that is needed again later.
- Assuming `{**a, **b}` merges nested structures recursively.
- Forgetting that the starred name is always a list, even when unpacking a tuple.

#### Comparisons

| | Union operator | Star-merge literal | `a.update(b)` |
|---|---|---|---|
| Version | 3.9+ | 3.5+ | Any |
| Result | New dict | New dict | Mutates `a` |
| Precedence | `b` wins | `b` wins | `b` wins |

#### Complexity
O(n) in the number of items unpacked or spread.

#### Frequently confused with
Packing (definition site) vs. spreading (call site) — same symbol, opposite direction.

#### Important facts to remember
- The starred target is always a list.
- Unpacking consumes iterators.
- Dict merging is shallow.

---

### 2.10 Copying and Aliasing Containers

#### Definition
Assignment creates an alias; `copy.copy` creates a new outer object sharing inner references; `copy.deepcopy` recursively duplicates the whole object graph.

#### Why it exists
Copying costs time and memory, so Python never copies implicitly and makes the depth of a copy an explicit decision.

#### Interview explanation
Draw the three cases — alias, shallow, deep — and give the nested-list example that distinguishes them. Mention that `deepcopy` uses a memo dict so cycles terminate and shared references stay shared.

#### Syntax
```python
alias = original                # same object
shallow = original[:]           # or list(original), copy.copy(original)
deep = copy.deepcopy(original)
```

#### Example
```python
import copy

defaults = {"limits": {"cpu": 1}}
config = copy.copy(defaults)
config["limits"]["cpu"] = 4
defaults["limits"]["cpu"]        # 4 — shallow copy shared the inner dict
```

#### Common interview questions
- "What is the difference between a shallow and a deep copy?" (Shallow duplicates the container and shares its contents; deep recursively duplicates everything.)
- "How do you copy a list?" (`list(x)`, `x[:]` or `copy.copy(x)` — all shallow.)
- "Why does changing one row of my grid change them all?" (`[[0] * n] * m` repeats one inner list reference m times; build it with a comprehension instead.)
- "How does `deepcopy` handle cycles?" (A memo dict maps already-copied objects, so cycles are reproduced rather than looping forever.)

#### Follow-up questions
- "When is `deepcopy` a bad idea?" (Large graphs, or objects holding file handles, sockets, locks or database connections.)
- "How do you control copying for your own class?" (Implement `__copy__` and `__deepcopy__`, or make the class immutable so copies are unnecessary.)
- "Is `dict(d)` a deep copy?" (No — it is shallow, exactly like `copy.copy`.)

#### Edge cases
- `copy.copy` on an immutable object may return the same object — copying a tuple is a no-op.
- `deepcopy` of an object holding a lock raises or produces something unusable.
- Slicing NumPy arrays yields views, so the copy idioms that work for lists silently do not copy there.

#### Common mistakes
- Trusting `list(x)` to isolate nested data.
- Deep-copying defensively in hot paths.
- Building grids with list multiplication.

#### Comparisons

| | Alias | Shallow | Deep |
|---|---|---|---|
| New outer object | No | Yes | Yes |
| New inner objects | No | No | Yes |
| Cost | O(1) | O(n) | O(total) |

#### Complexity
Shallow O(n) in top-level items; deep O(total nodes) in time and memory.

#### Frequently confused with
`copy.copy` vs. `copy.deepcopy`, and list multiplication vs. comprehension.

#### Important facts to remember
- Assignment never copies.
- `[:]`, `list()` and `dict()` are shallow.
- `deepcopy` handles cycles via a memo.

---

### 2.11 Choosing the Right Data Structure

#### Definition
Selecting a container by matching its complexity profile to the operations a piece of code performs most often.

#### Why it exists
Because most Python performance problems are container-choice problems, and they are fixed by changing a data structure rather than the algorithm or the language.

#### Interview explanation
Interviewers usually hide an O(n²) membership test inside a plausible-looking loop. Name the pattern, convert the inner collection to a set, and state the new complexity. Then mention the memory trade-off, which is the follow-up.

#### Syntax
```python
lookup = set(ids)                 # O(n) once
present = [x for x in stream if x in lookup]     # O(1) per test

from collections import deque
queue = deque(initial)            # O(1) at both ends
```

#### Example
```python
# Before: O(n * m)
def missing(wanted, have):
    return [w for w in wanted if w not in have]        # have is a list

# After: O(n + m)
def missing(wanted, have):
    have = set(have)
    return [w for w in wanted if w not in have]
```

#### Common interview questions
- "This function is slow with large inputs — why?" (A membership test against a list inside a loop makes it quadratic; convert to a set.)
- "When is a list better than a set?" (When order matters, when items are unhashable, or when the collection is tiny and scanning is cheaper than hashing.)
- "Which structure for a queue?" (`collections.deque`, or `queue.Queue` when it must be thread-safe.)
- "How would you keep a running top-k?" (A heap via `heapq`, which is O(log k) per insertion.)

#### Follow-up questions
- "What does the set conversion cost?" (O(n) time plus significant memory per item — worth it beyond a couple of lookups, wasteful for one.)
- "How do you measure rather than guess?" (`timeit` for small comparisons, `cProfile` for call-level profiles, `py-spy` for live processes.)
- "What if items are unhashable?" (Make a hashable projection — a tuple of the identifying fields — and index on that.)

#### Edge cases
- For fewer than about ten items, a list scan often beats set construction.
- Sets and dicts use several times the memory of a list for the same items, which matters at scale.
- Sorting to enable binary search is worth it only when the collection is searched many times and rarely changes.

#### Common mistakes
- Defaulting to lists everywhere.
- Converting to a set inside the loop rather than once outside it.
- Optimising a structure the profiler never pointed at.

#### Comparisons

| Need | Reach for |
|---|---|
| Ordered, growable | `list` |
| Fixed record | `tuple` / `NamedTuple` |
| Lookup by key | `dict` |
| Membership / dedupe | `set` |
| Both ends fast | `deque` |
| Top-k / priority | `heapq` |

#### Complexity
The point of the exercise: turn O(n²) membership loops into O(n), and O(n) front-pops into O(1).

#### Frequently confused with
Micro-optimisation vs. complexity change — only the second one scales.

#### Important facts to remember
- `in` on a list is O(n), on a set O(1).
- `deque` for queues, `heapq` for priorities.
- Measure before optimising.

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

#### Definition
Functions in Python are objects: they can be bound to names, stored in containers, passed as arguments, returned from calls and given attributes.

#### Why it exists
So that behaviour can be treated as data — enabling callbacks, dispatch tables, decorators and dependency injection without special language support.

#### Interview explanation
Say "functions are objects" and immediately show a dispatch dict replacing an `if/elif` chain. Then note the classic error: passing `f()` instead of `f` registers the return value rather than the callback.

#### Syntax
```python
def handler(event): ...

callbacks = [handler]          # stored
register(handler)              # passed
handler.retries = 3            # attributes
def outer(): return handler    # returned
```

#### Example
```python
OPERATIONS = {
    "sum": sum,
    "max": max,
    "count": len,
}

def aggregate(name, values):
    if name not in OPERATIONS:
        raise ValueError(f"unknown operation {name!r}")
    return OPERATIONS[name](values)
```

#### Common interview questions
- "What does it mean that functions are first-class in Python?" (They are ordinary objects — assignable, storable, passable, returnable, and able to carry attributes.)
- "How would you replace a long if/elif dispatch?" (A dict mapping keys to functions, looked up and called.)
- "What is the difference between `f` and `f()`?" (`f` is the function object; `f()` calls it and evaluates to its return value.)
- "Can you add attributes to a function?" (Yes — functions have a `__dict__`, which is how registration decorators tag them.)

#### Follow-up questions
- "How does this relate to decorators?" (A decorator is just a function that takes a function and returns a replacement — it only works because functions are values.)
- "What are the downsides of dispatch tables?" (Indirection: control flow becomes data, so it is harder to grep and harder for static analysis to follow.)
- "Are methods first-class too?" (Yes — `obj.method` produces a bound method object that carries `self` with it.)

#### Edge cases
- A bound method holds a strong reference to its instance, so storing `obj.method` in a registry keeps `obj` alive.
- Function equality is identity: two identical `def`s are different objects and never compare equal.
- Attributes set on a function are lost if a decorator replaces it without `functools.wraps`.

#### Common mistakes
- `register(handler())` instead of `register(handler)`.
- Assuming `f is g` for two structurally identical functions.
- Storing bound methods in long-lived registries and leaking their instances.

#### Comparisons

| | Dispatch table | if/elif chain |
|---|---|---|
| Extension | Add a dict entry | Edit the function |
| Lookup cost | O(1) | O(n) branches |
| Readability | Indirect | Explicit |

#### Frequently confused with
A function object vs. its call result — the root of most callback bugs.

#### Important facts to remember
- Functions are objects with attributes.
- `f` passes, `f()` calls.
- Bound methods keep their instance alive.

---

### 3.2 Closures

#### Definition
A closure is a function that retains access to names from an enclosing function scope through closure cells, keeping them alive after the enclosing call has returned.

#### Why it exists
To let a function carry private, configured state without a class or a global variable.

#### Interview explanation
Explain cells: the compiler detects the free variable, the enclosing frame stores it in a cell, and the inner function references that cell. Then deliver the late-binding loop example, because it is the question that actually gets asked.

#### Syntax
```python
def multiplier(factor):
    def apply(value):
        return value * factor      # factor is a free variable
    return apply

double = multiplier(2)
double.__closure__[0].cell_contents     # 2
```

#### Example
```python
def make_counter(start=0):
    count = start
    def increment(step=1):
        nonlocal count
        count += step
        return count
    return increment
```

#### Common interview questions
- "What is a closure?" (A function plus the enclosing-scope variables it references, kept alive in closure cells.)
- "Why do all my loop-created lambdas return the same value?" (They share the loop variable's cell and read it at call time — late binding. Bind it with a default argument or `functools.partial`.)
- "What does `nonlocal` do?" (Rebinds a name in the nearest enclosing function scope, which a closure needs in order to *assign* rather than just read.)
- "How do you inspect a closure?" (`fn.__closure__` gives the cells, and `cell.cell_contents` the captured values.)

#### Follow-up questions
- "Do closures copy values?" (No — they share cells, so two closures from the same call observe each other's changes.)
- "Can a closure cause a memory leak?" (Yes: whatever it captures cannot be collected while the closure is reachable — a common cause of retained request objects.)
- "Closure or class?" (Closure for one function with a little state; class when there are several related operations or the state needs inspecting.)

#### Edge cases
- Assigning to a captured name without `nonlocal` creates a new local and raises `UnboundLocalError` on read.
- Closures over loop variables in comprehensions have the same late-binding behaviour as in `for` loops.
- A closure created in a generator captures the generator's frame, which stays alive until the generator is exhausted or closed.

#### Common mistakes
- Building callbacks in a loop without binding the variable.
- Forgetting `nonlocal` and getting `UnboundLocalError`.
- Capturing large objects (a whole request, a dataframe) in a long-lived closure.

#### Comparisons

| | Closure | Class with `__call__` |
|---|---|---|
| State | Hidden in cells | Visible attributes |
| Inspection | Awkward | Easy |
| Best for | One small behaviour | Several related ones |

#### Complexity
Cell access is O(1) — comparable to a local variable read, and faster than a global lookup.

#### Frequently confused with
Late binding vs. capture-by-value — closures do the former.

#### Important facts to remember
- Closures capture variables, not values.
- `nonlocal` is required to rebind.
- Captured objects stay alive as long as the closure does.

---

### 3.3 Lambda Expressions

#### Definition
A lambda is an anonymous function object whose body is a single expression, produced by the `lambda` keyword rather than `def`.

#### Why it exists
To define a trivial function exactly where it is used, when naming it would add noise rather than meaning.

#### Interview explanation
Say it produces the same function object as `def`, restricted to one expression, with no name or docstring. Then mention PEP 8's advice against assigning lambdas to names, and `operator` as the faster, picklable alternative for common cases.

#### Syntax
```python
lambda x: x * 2
lambda x, y=1, *args, **kwargs: ...
lambda: 42                       # no parameters
(lambda x: x + 1)(41)            # immediately invoked
```

#### Example
```python
from operator import itemgetter

rows.sort(key=lambda r: (r["dept"], -r["salary"]))
rows.sort(key=itemgetter("dept"))       # C-implemented, picklable, faster
```

#### Common interview questions
- "What is the difference between `lambda` and `def`?" (Only syntax and metadata: one expression, no statements, no docstring, `__name__` is `<lambda>` — the resulting object is the same kind of thing.)
- "When should you not use a lambda?" (When it needs a name, a docstring, more than one expression, or must be pickled.)
- "Can a lambda have default arguments?" (Yes, and that is the standard fix for the late-binding loop trap.)
- "Why can't a lambda contain a statement?" (Deliberate design: it keeps lambdas to a size that stays readable inline.)

#### Follow-up questions
- "Why are lambdas not picklable?" (Pickle stores functions by qualified name; an anonymous function has no importable name, so `multiprocessing` fails on it.)
- "Does a lambda create a closure?" (Yes, exactly like a nested `def`.)
- "What does the walrus operator change?" (It allows an assignment *expression* inside a lambda — but if you need it, the lambda is probably too big.)

#### Edge cases
- `lambda: x` inside a loop captures the variable, not its value.
- A lambda in a traceback shows as `<lambda>`, which makes errors harder to locate.
- `key=lambda x: x` is a no-op that still costs a Python call per element.

#### Common mistakes
- `f = lambda x: ...` instead of `def f(x): ...`.
- Passing lambdas to `multiprocessing` and hitting a pickling error.
- Multi-line lambdas simulated with tuples and conditional expressions.

#### Comparisons

| | `lambda` | `def` |
|---|---|---|
| Body | One expression | Any statements |
| `__name__` | `<lambda>` | Real name |
| Docstring | No | Yes |
| Picklable | No | Yes (module level) |

#### Frequently confused with
Lambdas as a distinct type — they are not; `type(lambda: 0)` is `function`.

#### Important facts to remember
- Same object type as `def`.
- Not picklable.
- PEP 8: do not assign them to names.

---

### 3.4 Higher-Order Functions

#### Definition
A higher-order function takes one or more functions as arguments, returns a function, or both — `map`, `filter`, `sorted(key=)`, `reduce` and every decorator.

#### Why it exists
To express an operation's structure once and supply the varying behaviour per call, which removes duplicated loop scaffolding.

#### Interview explanation
Mention that `map` and `filter` are lazy in Python 3, that comprehensions are usually preferred, and that `map` still wins when the function already exists. Laziness is the part interviewers test.

#### Syntax
```python
map(func, iterable)                 # lazy iterator
filter(predicate, iterable)         # lazy iterator
sorted(data, key=func)
functools.reduce(func, iterable, initial)
```

#### Example
```python
from functools import reduce
from operator import mul

list(map(int, ["1", "2", "3"]))              # [1, 2, 3]
reduce(mul, [1, 2, 3, 4], 1)                 # 24
list(filter(None, [0, 1, "", "a"]))          # [1, 'a'] — None means "keep truthy"
```

#### Common interview questions
- "What does `map` return in Python 3?" (A lazy iterator — not a list; nothing is computed until it is consumed.)
- "Comprehension or `map`/`filter`?" (Comprehension when a lambda would be required; `map` when the function already exists, such as `map(int, values)`.)
- "What does `reduce` do and where did it go?" (It folds a sequence into one value; it moved to `functools` in Python 3 because explicit loops are usually clearer.)
- "What does `filter(None, items)` do?" (Keeps only truthy items.)

#### Follow-up questions
- "What happens if you iterate a `map` object twice?" (The second pass yields nothing — iterators are exhausted once consumed.)
- "How do you compose functions in Python?" (There is no built-in `compose`; write one, use `functools.reduce`, or just nest the calls — most codebases nest.)
- "Is `map` faster than a comprehension?" (With an existing C function, yes; with a lambda, usually not — the lambda call dominates.)

#### Edge cases
- `map` with several iterables stops at the shortest, like `zip`.
- `reduce` on an empty sequence without an initial value raises `TypeError`.
- `sorted(key=...)` calls the key exactly once per element, but `max(key=...)` also does — so an expensive key is paid in full either way.

#### Common mistakes
- Printing a `map` object and seeing `<map object at 0x...>`.
- Reusing an exhausted iterator.
- Using `reduce` where `sum`, `math.prod` or `any` already exists.

#### Comparisons

| | `map`/`filter` | Comprehension |
|---|---|---|
| Laziness | Lazy | Eager (generator expr is lazy) |
| Readability with lambda | Lower | Higher |
| With existing function | Higher | Slightly lower |

#### Complexity
All are O(n); lazy forms use O(1) memory versus O(n) for a materialised list.

#### Frequently confused with
Python 2 `map` (returns a list) vs. Python 3 `map` (returns an iterator).

#### Important facts to remember
- `map`/`filter` are lazy iterators.
- Iterators exhaust after one pass.
- `reduce` lives in `functools`.

---

### 3.5 The functools Module

#### Definition
`functools` supplies higher-order utilities: `partial`, `wraps`, `lru_cache`/`cache`, `cached_property`, `reduce`, `singledispatch` and `total_ordering`.

#### Why it exists
These patterns appear in every codebase, and the standard library's versions are correct, fast and introspection-friendly.

#### Interview explanation
Pick the three that come up: `wraps` (why decorators need it), `lru_cache` (what it costs), and `partial` (why it beats a lambda for pickling). Be explicit that caching is a memory trade and that keys must be hashable.

#### Syntax
```python
from functools import wraps, lru_cache, cache, partial, cached_property

@lru_cache(maxsize=1024)
def expensive(n): ...

expensive.cache_info()      # hits, misses, maxsize, currsize
expensive.cache_clear()
```

#### Example
```python
from functools import wraps
import logging

def logged(func):
    @wraps(func)                     # preserves __name__, __doc__, signature
    def wrapper(*args, **kwargs):
        logging.debug("calling %s", func.__name__)
        return func(*args, **kwargs)
    return wrapper
```

#### Common interview questions
- "Why do decorators need `functools.wraps`?" (Without it the wrapper replaces the original's `__name__`, `__doc__`, annotations and signature, breaking introspection, docs and framework discovery.)
- "What does `lru_cache` cost?" (Memory proportional to the cached entries, plus strong references to arguments and results; keys must be hashable.)
- "`partial` or `lambda`?" (`partial` is picklable, introspectable and slightly faster; a lambda is fine for local one-offs.)
- "What is `singledispatch`?" (Type-based dispatch on the first argument, letting you extend behaviour for new types without editing the original function.)

#### Follow-up questions
- "What is wrong with `@cache` on a method?" (It caches on `self` too, keeping every instance alive for the process lifetime — use `cached_property` or cache a module-level function.)
- "How do you monitor a cache?" (`cache_info()` reports hits, misses and current size — export them as metrics.)
- "When is `cached_property` better?" (When the value belongs to the instance and should die with it; it is stored in the instance `__dict__`.)

#### Edge cases
- `lru_cache` requires hashable arguments — passing a dict raises `TypeError`.
- `cache` (unbounded) grows forever if the key space is unbounded.
- `cached_property` needs a `__dict__`, so it does not work with `__slots__`.

#### Common mistakes
- Omitting `@wraps` in a decorator.
- `@lru_cache` on methods.
- Caching functions whose results depend on time or external state.

#### Comparisons

| | `lru_cache` | `cache` | `cached_property` |
|---|---|---|---|
| Bounded | Yes (`maxsize`) | No | Per instance |
| Scope | Function-wide | Function-wide | One instance |
| Leak risk | Bounded | High | Dies with the object |

#### Complexity
Cache lookup is O(1); `lru_cache` adds constant bookkeeping per call for recency tracking.

#### Frequently confused with
`cache` vs. `lru_cache` — the former is unbounded, which is the dangerous default.

#### Important facts to remember
- Always `@wraps` in decorators.
- Cache arguments must be hashable.
- `@cache` on methods leaks instances.

---

### 3.6 Recursion

#### Definition
Recursion is a function calling itself on a smaller input until a base case is reached; CPython bounds it with a recursion limit and performs no tail-call optimisation.

#### Why it exists
Because recursive data — trees, nested structures, grammars — is most clearly processed by recursive code.

#### Interview explanation
State the limit (default 1000 frames, `RecursionError` beyond it), explain that Python deliberately has no tail-call elimination so tracebacks stay intact, and show memoisation turning exponential recursion linear.

#### Syntax
```python
import sys
sys.getrecursionlimit()          # 1000 by default
sys.setrecursionlimit(3000)      # rarely the right fix
```

#### Example
```python
from functools import cache

@cache
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

# Iterative version — no frames, no limit
def fib_iter(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a
```

#### Common interview questions
- "What is Python's recursion limit and why does it exist?" (About 1000 frames by default, to turn unbounded recursion into a catchable `RecursionError` instead of a C-stack overflow.)
- "Does Python optimise tail calls?" (No — deliberately, to preserve complete stack traces.)
- "How do you fix a `RecursionError`?" (Convert to iteration with an explicit stack, or make the recursion shallower; raising the limit risks a hard crash.)
- "How does memoisation change recursive Fibonacci?" (From O(2^n) to O(n) time, at O(n) memory.)

#### Follow-up questions
- "When is recursion the right choice in Python?" (Branching structures of bounded depth — file trees, JSON, ASTs — where the iterative version needs a hand-rolled stack.)
- "What is `yield from` good for here?" (Recursively yielding from sub-generators keeps tree traversal lazy and flat in memory.)
- "What actually breaks if you raise the limit too far?" (The C stack overflows and the process segfaults, with no Python traceback.)

#### Edge cases
- Mutual recursion counts against the same limit.
- Deep `__repr__` or `__eq__` chains can recurse further than you expect and raise inside logging.
- `RecursionError` can leave partially built state behind, so recursive builders need care.

#### Common mistakes
- Recursing over linear data.
- Missing or unreachable base case.
- `sys.setrecursionlimit(10**6)` as a "fix".

#### Comparisons

| | Recursion | Iteration |
|---|---|---|
| Depth limit | ~1000 frames | None |
| Memory | One frame per level | Constant |
| Clarity for trees | High | Lower |

#### Complexity
Naive recursive Fibonacci O(2^n); memoised O(n); space O(depth) for frames.

#### Frequently confused with
Recursion depth vs. input size — depth is what the limit constrains.

#### Important facts to remember
- Default limit ~1000 frames.
- No tail-call optimisation, by design.
- Memoise, or iterate.

---

### 3.7 Pure Functions and Side Effects

#### Definition
A pure function's result depends only on its inputs and it produces no observable effect elsewhere; anything else — mutation, I/O, clock or random access — is a side effect.

#### Why it exists
Purity makes code testable without mocks, safe to cache, safe to parallelise, and reasonable to read in isolation.

#### Interview explanation
Define both terms, then describe the "functional core, imperative shell" split: decisions in pure functions, effects at the boundary. Give the injected-clock example, which shows the testing payoff concretely.

#### Syntax
```python
def price_with_tax(amount, rate):          # pure
    return amount * (1 + rate)

def save_invoice(invoice, db):             # effectful, and named so
    db.insert(invoice)
```

#### Example
```python
def expire(items, now=None):
    now = now or datetime.now(timezone.utc)      # effect at the edge
    return [i for i in items if i.expires_at > now]     # pure core

expire(items, now=datetime(2026, 1, 1, tzinfo=timezone.utc))   # deterministic test
```

#### Common interview questions
- "What is a pure function?" (Same inputs always give the same output, with no side effects.)
- "Why does purity matter in practice?" (Deterministic tests, safe memoisation, safe concurrency, and local reasoning.)
- "Can you cache an impure function?" (Not safely — the cache will return stale or wrong results whenever the hidden input changes.)
- "How do you test time-dependent code?" (Inject the clock as a parameter, or freeze it with a library; do not read `datetime.now()` deep inside logic.)

#### Follow-up questions
- "Is a function that logs still pure?" (Strictly no, but logging is usually treated as a benign effect; the meaningful test is whether the result depends on it.)
- "How do you keep purity without copying everything?" (Return new objects only for the parts that change, and prefer immutable value types so sharing is safe.)
- "What is idempotence and how does it differ?" (Applying an operation twice has the same effect as once — an effectful operation can be idempotent without being pure.)

#### Edge cases
- A function mutating a *default* argument is impure and leaks state between calls.
- Reading module-level configuration makes a function impure even if nothing is mutated.
- Generators are lazy, so their side effects happen when consumed, not when created — a real source of ordering surprises.

#### Common mistakes
- Query functions that quietly sort or mutate their arguments.
- Caching a function that reads the clock or a database.
- Treating logging-only functions as untestable.

#### Comparisons

| | Pure | Impure |
|---|---|---|
| Testable without fixtures | Yes | Usually not |
| Cacheable | Yes | No |
| Thread-safe by construction | Yes | No |

#### Frequently confused with
Purity vs. idempotence — related, not the same.

#### Important facts to remember
- Same input, same output, no effects.
- Only pure functions are safe to memoise.
- Push effects to the edges.

---

### 3.8 Callable Objects

#### Definition
Any object whose type defines `__call__` is callable — functions, classes, bound methods, `partial` objects and user instances alike.

#### Why it exists
So "callable" is a protocol rather than a type, letting stateful objects be substituted anywhere a function is expected.

#### Interview explanation
Explain that `x()` resolves to `type(x).__call__`, list what is callable, then give a stateful example — a rate limiter or validator — showing why a callable class beats a closure when the state needs inspection.

#### Syntax
```python
class Adder:
    def __init__(self, n): self.n = n
    def __call__(self, x): return x + self.n

callable(Adder)        # True — calling a class constructs an instance
callable(Adder(1))     # True — instance defines __call__
```

#### Example
```python
class Retry:
    def __init__(self, attempts): self.attempts, self.failures = attempts, 0
    def __call__(self, func, *args):
        for _ in range(self.attempts):
            try:
                return func(*args)
            except Exception:
                self.failures += 1
        raise RuntimeError(f"failed after {self.attempts} attempts")
```

#### Common interview questions
- "What makes an object callable?" (Its type defines `__call__`; `callable(obj)` reports it.)
- "Why use a callable class instead of a closure?" (State becomes inspectable attributes, extra methods can be added, and it pickles and subclasses cleanly.)
- "Is a class callable?" (Yes — calling a class invokes its metaclass's `__call__`, which creates and initialises an instance.)
- "How do decorators use this?" (A decorator can return any callable, including an instance — class-based decorators are built exactly this way.)

#### Follow-up questions
- "Does defining `__call__` on an instance work?" (No — special methods are looked up on the type, so it must be defined on the class.)
- "What does `callable()` not tell you?" (Anything about the signature — you still need `inspect.signature` to know what arguments are accepted.)
- "How do bound methods fit in?" (`obj.method` produces a callable that carries `self`; it is created fresh on each attribute access.)

#### Edge cases
- `callable(x)` was removed in Python 3.0 and restored in 3.2 — old advice to use `hasattr(x, "__call__")` predates that.
- A class with `__call__` on the *metaclass* changes what calling the class itself does.
- Instances with `__call__` are not `types.FunctionType`, so naive type checks reject them.

#### Common mistakes
- Assigning `instance.__call__ = fn` and expecting `instance()` to change.
- Type-checking for functions instead of using `callable`.
- Hiding expensive work behind an innocuous-looking call.

#### Comparisons

| | Function | Callable instance |
|---|---|---|
| State | Closure cells | Attributes |
| Introspection | Signature | Signature plus attributes |
| Extra methods | No | Yes |

#### Frequently confused with
`callable(x)` vs. `isinstance(x, FunctionType)` — the latter rejects most valid callables.

#### Important facts to remember
- `__call__` must be on the class.
- Classes and bound methods are callable.
- `callable()` says nothing about arguments.

---

### 3.9 Function Introspection

#### Definition
Runtime access to a function's own metadata — name, docstring, defaults, annotations, signature and code object — primarily through the `inspect` module.

#### Why it exists
So frameworks and tools can adapt to arbitrary user code, and so decorators can reason about what they wrap.

#### Interview explanation
Name the dunder attributes, then `inspect.signature` as the API that ties them together. Connect it to real frameworks (pytest fixtures, FastAPI validation) and to why `functools.wraps` matters.

#### Syntax
```python
f.__name__, f.__qualname__, f.__doc__
f.__defaults__, f.__kwdefaults__, f.__annotations__
inspect.signature(f)
inspect.getsource(f)
inspect.get_annotations(f, eval_str=True)
```

#### Example
```python
import inspect

def bind_kwargs(func, data: dict):
    """Call func with only the keys it actually declares."""
    params = inspect.signature(func).parameters
    return func(**{k: v for k, v in data.items() if k in params})
```

#### Common interview questions
- "How do you inspect a function's parameters at runtime?" (`inspect.signature(func).parameters`, which handles defaults, kinds and annotations uniformly.)
- "Are annotations enforced?" (No — they are metadata in `__annotations__`; enforcement requires a static checker or a runtime validator.)
- "Why does a decorator break `help()`?" (The wrapper replaced the original's metadata; `functools.wraps` copies it back.)
- "How does pytest know which fixtures a test needs?" (It introspects the test function's parameter names.)

#### Follow-up questions
- "What is `__qualname__` for?" (The dotted path including class names — it disambiguates methods with the same short name in tracebacks and pickling.)
- "What changed with PEP 563 and PEP 649?" (`from __future__ import annotations` stores annotations as strings; PEP 649 in 3.14 makes them lazily evaluated, so `inspect.get_annotations` is the safe accessor.)
- "How do you introspect a `partial`?" (`inspect.signature` understands `partial` and reports the remaining parameters.)

#### Edge cases
- C-implemented builtins may not expose a signature, raising `ValueError`.
- `inspect.getsource` fails in a REPL or for dynamically generated code.
- A decorator using `wraps` copies the *wrapped* signature, which can mislead when the wrapper genuinely accepts different arguments.

#### Common mistakes
- Forgetting `@wraps` and breaking downstream tooling.
- Reading `__annotations__` directly when string annotations are in play.
- Relying on parameter names as a stable API without saying so.

#### Comparisons

| | `__annotations__` | `inspect.get_annotations` |
|---|---|---|
| Handles string annotations | No | Yes, with `eval_str` |
| Handles inheritance | Raw only | Resolves properly |

#### Frequently confused with
Annotations as documentation vs. annotations as enforcement — Python does the first only.

#### Important facts to remember
- Annotations are metadata, not checks.
- `inspect.signature` is the canonical API.
- `@wraps` preserves introspectability.

---

### 3.10 Functional Style in Python

#### Definition
Python is multi-paradigm: it offers first-class functions, closures, immutable types and lazy iteration, without enforced purity or tail-call optimisation.

#### Why it exists
To let programmers borrow functional techniques that reduce hidden state, while keeping the imperative and object-oriented tools that suit other problems.

#### Interview explanation
Say what Python has (first-class functions, comprehensions, generators, immutable types) and what it lacks (tail calls, enforced immutability, currying). Then state the practical rule: pure functions for decisions, effects at the edges, comprehensions over `map`/`filter` with lambdas.

#### Syntax
```python
# Preferred over map/filter with lambdas
[transform(x) for x in items if keep(x)]

# Lazy pipeline — constant memory
totals = sum(row.amount for row in rows if row.valid)
```

#### Example
```python
from dataclasses import dataclass, replace

@dataclass(frozen=True)
class Order:
    id: str
    amount: float
    status: str = "new"

def mark_paid(order: Order) -> Order:
    return replace(order, status="paid")       # new value, no mutation
```

#### Common interview questions
- "Is Python a functional language?" (No — it is multi-paradigm, with functional features but no enforced purity, immutability or tail-call elimination.)
- "Why are comprehensions preferred over `map`/`filter`?" (More readable when a lambda would be needed, and often faster because they avoid a Python-level call per item.)
- "How do you get immutability in Python?" (`tuple`, `frozenset`, `str`, `bytes`, `frozen=True` dataclasses, and `types.MappingProxyType` for read-only dict views.)
- "What is a generator pipeline?" (Chained lazy iterators that process one item at a time, keeping memory constant regardless of input size.)

#### Follow-up questions
- "Why no currying?" (`functools.partial` covers the practical need; full currying would conflict with Python's flexible argument binding.)
- "When does functional style hurt readability?" (Deeply nested `reduce`/`map`/`lambda` expressions, or comprehensions with several clauses and conditions.)
- "How does immutability help concurrency?" (Immutable data can be shared between threads with no locking, which removes the largest class of race conditions.)

#### Edge cases
- `frozen=True` dataclasses are shallowly immutable: a list field can still be mutated.
- `MappingProxyType` is a read-only *view* — the underlying dict can still change.
- Generator pipelines defer errors until consumption, so exceptions surface far from where the pipeline was built.

#### Common mistakes
- Writing unreadable one-liner chains in the name of "functional".
- Assuming frozen means deeply immutable.
- Rebuilding whole structures in hot loops where in-place mutation of a local is fine.

#### Comparisons

| | Functional style | Imperative style |
|---|---|---|
| State | Returned | Mutated |
| Testing | Direct | Often needs fixtures |
| Memory | More allocation | Less |
| Best for | Transformations | Stateful processes |

#### Frequently confused with
"Functional" meaning no loops — in Python it means no hidden mutation.

#### Important facts to remember
- Multi-paradigm, not functional.
- No tail-call optimisation.
- Frozen means shallow.

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

#### Definition
A class is an object created by executing a class body and passing the resulting namespace to a metaclass; calling it allocates an instance with `__new__` and initialises it with `__init__`.

#### Why it exists
To bind state and the behaviour that operates on it into one unit that can be created many times over.

#### Interview explanation
Separate `__new__` from `__init__` clearly — allocation versus initialisation — and mention that the class body runs once at definition time, which is what makes mutable class attributes shared.

#### Syntax
```python
class Account:
    rate = 0.02                        # class attribute

    def __init__(self, owner):         # initialiser, not constructor
        self.owner = owner             # instance attribute

    def __repr__(self):
        return f"Account({self.owner!r})"
```

#### Example
```python
class Singleton:
    _instance = None
    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance           # __init__ still runs on every call
```

#### Common interview questions
- "What is the difference between `__new__` and `__init__`?" (`__new__` creates and returns the instance; `__init__` initialises an instance that already exists and must return `None`.)
- "When would you override `__new__`?" (Immutable types like `tuple` or `str` subclasses, singletons, caching or interning instances.)
- "When does a class body execute?" (Once, when the `class` statement runs — not per instance.)
- "What is `self`?" (Just the first parameter, bound automatically when a method is accessed through an instance; the name is convention, not syntax.)

#### Follow-up questions
- "If `__new__` returns a different class's instance, does `__init__` run?" (Only if the returned object is an instance of the class being called.)
- "Are classes objects?" (Yes — instances of `type` by default, which is why they can be passed around and created dynamically.)
- "How do you create a class at runtime?" (`type(name, bases, namespace)`, which is exactly what the `class` statement does.)

#### Edge cases
- `__init__` returning anything other than `None` raises `TypeError`.
- A mutable class attribute is shared by all instances until one assigns over it.
- Defining `__slots__` changes whether instances have a `__dict__` at all.

#### Common mistakes
- Calling `__init__` the constructor in an interview and then being unable to explain `__new__`.
- Mutable class attributes used as per-instance state.
- Forgetting `self` in a method definition.

#### Comparisons

| | `__new__` | `__init__` |
|---|---|---|
| Role | Allocate | Initialise |
| First arg | `cls` | `self` |
| Returns | The instance | `None` |
| Static? | Implicit static method | Instance method |

#### Frequently confused with
Constructor vs. initialiser — Python splits what most languages merge.

#### Important facts to remember
- `__new__` creates, `__init__` configures.
- Class bodies run once.
- Classes are objects too.

---

### 4.2 Attributes and the Instance Dictionary

#### Definition
Attribute access follows `__getattribute__`'s fixed order: data descriptors on the type, the instance `__dict__`, then class and MRO attributes, with `__getattr__` as a last-resort fallback.

#### Why it exists
So classes can hold shared defaults while instances hold only their overrides, and so frameworks can intercept attribute access.

#### Interview explanation
Give the lookup order, then the difference between `__getattr__` (only on failure) and `__getattribute__` (every access). The shadowing question — assigning `self.x` when `x` is a class attribute — is almost guaranteed.

#### Syntax
```python
obj.attr            # __getattribute__ → descriptors → __dict__ → class → __getattr__
obj.attr = v        # __setattr__ → data descriptor or instance __dict__
del obj.attr        # __delattr__
vars(obj)           # the instance __dict__
```

#### Example
```python
class Lazy:
    def __getattr__(self, name):          # only called when normal lookup fails
        if name.startswith("get_"):
            return lambda: f"dynamic {name[4:]}"
        raise AttributeError(name)

Lazy().get_user()      # 'dynamic user'
```

#### Common interview questions
- "What is the attribute lookup order?" (Data descriptors on the type, instance `__dict__`, class and MRO attributes including non-data descriptors, then `__getattr__`.)
- "What is the difference between `__getattr__` and `__getattribute__`?" (`__getattribute__` intercepts every access; `__getattr__` runs only when the normal lookup raised `AttributeError`.)
- "Does `self.x = 1` change the class attribute `x`?" (No — it creates an instance attribute that shadows it.)
- "How do you list an object's attributes?" (`vars(obj)` for the instance dict, `dir(obj)` for everything reachable including class and inherited names.)

#### Follow-up questions
- "Why is overriding `__getattribute__` dangerous?" (It runs on every access, so any attribute access inside it recurses; you must delegate through `super().__getattribute__`.)
- "How do ORMs make columns look like attributes?" (Descriptors on the class, or `__getattr__` for dynamic fields.)
- "Can you prevent new attributes?" (Yes — `__slots__`, or a `__setattr__` that rejects unknown names.)

#### Edge cases
- Special methods bypass `__getattr__` entirely, since implicit dunder lookups go straight to the type.
- Deleting an instance attribute reveals the class attribute it was shadowing.
- `hasattr` swallows any exception raised inside a property, so a broken property looks like a missing attribute.

#### Common mistakes
- Infinite recursion in `__getattr__` or `__setattr__` by accessing `self.<name>` inside them.
- Expecting `__getattr__` to intercept existing attributes.
- Mutating a class attribute through an instance.

#### Comparisons

| | `__getattr__` | `__getattribute__` |
|---|---|---|
| Called | Only on failure | Every access |
| Risk | Low | Recursion, performance |
| Typical use | Dynamic/proxy attributes | Full interception |

#### Complexity
Instance dict lookup is O(1); MRO walking is O(depth) but cached by CPython's type attribute cache.

#### Frequently confused with
`__getattr__` vs. `__getattribute__` — the single most common attribute-protocol confusion.

#### Important facts to remember
- Data descriptors beat the instance dict.
- `__getattr__` is a fallback only.
- Assignment shadows, it does not update the class.

---

### 4.3 Instance, Class and Static Methods

#### Definition
Instance methods bind the instance as `self`; `@classmethod` binds the class as `cls`; `@staticmethod` binds nothing and behaves like a plain function in the class namespace.

#### Why it exists
Because operations differ in what context they need — an object, the class itself, or nothing at all — and alternative constructors must respect subclassing.

#### Interview explanation
Explain binding via the descriptor protocol: accessing a function through an instance returns a bound method. Then give the `cls(...)` factory argument for `classmethod` over `staticmethod`.

#### Syntax
```python
class C:
    def instance_method(self): ...
    @classmethod
    def class_method(cls): ...
    @staticmethod
    def static_method(): ...
```

#### Example
```python
class User:
    def __init__(self, name): self.name = name

    @classmethod
    def from_row(cls, row):              # works correctly for subclasses
        return cls(row["name"])

class Admin(User): pass
Admin.from_row({"name": "Ada"})          # returns an Admin, not a User
```

#### Common interview questions
- "What is the difference between a class method and a static method?" (A class method receives the class and can construct subclass instances; a static method receives nothing and is only namespaced inside the class.)
- "Why use `@classmethod` for alternative constructors?" (Because `cls` is the actual class used, so subclasses inherit the factory correctly.)
- "What is a bound method?" (The object produced by accessing a function through an instance — it stores the function and the instance, supplying `self` automatically.)
- "When is `@staticmethod` the right choice?" (When the function is logically part of the class's namespace but needs no state — otherwise a module-level function is usually better.)

#### Follow-up questions
- "Can you call an instance method on the class?" (Yes — `C.method(instance)`, which is what the bound method does for you.)
- "Do class methods see subclass overrides?" (Yes, because `cls` is the calling class.)
- "How are these implemented?" (As descriptors: `classmethod` and `staticmethod` are descriptor objects that change what `__get__` returns.)

#### Edge cases
- `staticmethod` objects became directly callable only in Python 3.10; before that, calling one off the class body failed.
- A `classmethod` called through an instance still receives the *class*, not the instance.
- Overriding a `classmethod` in a subclass changes behaviour for inherited callers too.

#### Common mistakes
- Using `@staticmethod` for a factory, which then ignores subclasses.
- Omitting `self` and getting a confusing `TypeError`.
- Calling `self.method()` inside `__init__` before the attributes it needs exist.

#### Comparisons

| | Instance | Class | Static |
|---|---|---|---|
| First arg | `self` | `cls` | none |
| Subclass-aware | Yes | Yes | No |
| Needs an instance | Yes | No | No |

#### Frequently confused with
`classmethod` vs. `staticmethod` for factories — only the first respects inheritance.

#### Important facts to remember
- Methods are descriptors; access produces a bound method.
- `cls` follows the subclass.
- `staticmethod` often belongs at module level.

---

### 4.4 Inheritance and the MRO

#### Definition
The method resolution order is the single linear sequence of classes, computed by C3 linearisation at class creation, that every attribute lookup follows.

#### Why it exists
To make multiple inheritance deterministic: one consistent order per class, or a `TypeError` if no consistent order exists.

#### Interview explanation
Name C3, state its guarantees (subclass before base, declaration order preserved, monotonic), and walk the diamond example showing `A` visited once, after both `B` and `C`.

#### Syntax
```python
class D(B, C): ...
D.__mro__                 # tuple of classes, in lookup order
D.mro()                   # same, as a list
isinstance(x, D); issubclass(D, B)
```

#### Example
```python
class A:
    def __init__(self): self.trace = ["A"]
class B(A):
    def __init__(self): super().__init__(); self.trace.append("B")
class C(A):
    def __init__(self): super().__init__(); self.trace.append("C")
class D(B, C): pass

D().trace       # ['A', 'C', 'B'] — A runs once, at the end of the chain
```

#### Common interview questions
- "What is the MRO?" (The linear order of classes searched for attributes, computed by C3 linearisation when the class is created.)
- "What is the diamond problem and how does Python solve it?" (Two parents sharing a base; C3 places the shared base once, after everything that inherits from it, so it runs exactly once in a cooperative chain.)
- "How do you inspect the MRO?" (`Cls.__mro__` or `Cls.mro()`.)
- "When does Python refuse to create a class?" (When no C3-consistent order exists — for example `class X(A, B)` where another class already requires `B` before `A`.)

#### Follow-up questions
- "Is the MRO computed per lookup?" (No — once, at class creation, and cached; lookups just walk it.)
- "What is a mixin?" (A small class providing behaviour, designed to be combined with others through multiple inheritance rather than instantiated alone.)
- "Where should mixins go in the bases list?" (Before the main base, so their methods take precedence and their `super()` calls reach it.)

#### Edge cases
- `object` is always last in every MRO.
- Changing a base class's bases at runtime does not recompute existing subclasses' MROs cleanly.
- `isinstance` can be customised via `__instancecheck__`, so it does not always reflect the literal MRO.

#### Common mistakes
- Assuming depth-first, left-to-right resolution.
- Deep hierarchies used to share utility methods.
- Putting mixins after the concrete base and wondering why their methods never run.

#### Comparisons

| | Single inheritance | Multiple inheritance |
|---|---|---|
| MRO | The chain | C3 linearisation |
| `super()` | The parent | Next in MRO, possibly a sibling |
| Risk | Low | Fragile coupling |

#### Complexity
C3 runs once per class creation; lookups are O(depth) and served by CPython's method cache in practice.

#### Frequently confused with
MRO order vs. declaration order — they differ as soon as a diamond appears.

#### Important facts to remember
- C3 linearisation, computed once.
- Shared bases are visited last, once.
- Inconsistent hierarchies fail at definition time.

---

### 4.5 super() and Cooperative Inheritance

#### Definition
`super()` returns a proxy that dispatches to the next class after the current one in the MRO of the instance's actual type.

#### Why it exists
So classes combined through multiple inheritance can each contribute to an operation and pass it along, without hard-coding which class comes next.

#### Interview explanation
The headline is that `super()` is not "the parent". Show a mixin chain where the call passes through several classes, and state the cooperative rules: everyone calls `super()`, signatures stay compatible, the chain ends at `object`.

#### Syntax
```python
super().__init__(*args, **kwargs)        # zero-arg form, inside a class body
super(ThisClass, self).method()          # explicit form, needed outside class bodies
```

#### Example
```python
class Serializer:
    def to_dict(self): return {}

class TimestampMixin(Serializer):
    def to_dict(self):
        return {**super().to_dict(), "ts": self.ts}

class IdMixin(Serializer):
    def to_dict(self):
        return {**super().to_dict(), "id": self.id}

class Record(TimestampMixin, IdMixin):
    ...            # to_dict collects from every class in the MRO
```

#### Common interview questions
- "What does `super()` actually return?" (A proxy object that looks up attributes starting after the current class in the instance's MRO.)
- "Is `super()` the parent class?" (Not necessarily — with multiple inheritance it is frequently a sibling class that the current class does not inherit from.)
- "Why prefer `super()` over `Parent.method(self)`?" (Hard-coding breaks cooperative chains: a class can be skipped or run twice.)
- "What does the zero-argument `super()` rely on?" (A compiler-provided `__class__` cell, which is why it only works inside a class body.)

#### Follow-up questions
- "What happens if one class in the chain forgets `super()`?" (Everything after it in the MRO is silently skipped.)
- "How should mixins handle arguments?" (Accept and forward `**kwargs`, so classes further along still receive what they need.)
- "Can `super()` be used in `__new__`?" (Yes — `super().__new__(cls)` is the standard form.)

#### Edge cases
- Calling `super()` in a nested function inside a method fails, because the `__class__` cell is not available there.
- `super()` inside a `staticmethod` has no instance to work from.
- With `__slots__` and multiple inheritance, layout conflicts can make a class impossible to create at all.

#### Common mistakes
- Hard-coding the parent class name.
- Mixin `__init__` signatures that do not accept `**kwargs`.
- Assuming `super().__init__()` runs every ancestor — it runs the next one, which must itself cooperate.

#### Comparisons

| | `super()` | `Parent.method(self)` |
|---|---|---|
| Follows MRO | Yes | No |
| Safe with mixins | Yes | No |
| Runs base once | Yes | Can run twice |

#### Frequently confused with
`super()` as "parent" — the misconception that produces most multiple-inheritance bugs.

#### Important facts to remember
- Next in MRO, not the parent.
- Everyone must cooperate.
- Zero-arg form only inside class bodies.

---

### 4.6 Special Methods and the Data Model

#### Definition
Special (dunder) methods implement the protocols Python's syntax and built-ins dispatch to — representation, comparison, containers, iteration, context management, calling and arithmetic.

#### Why it exists
So that built-in behaviour is an interface any class can implement, making user types indistinguishable from built-ins at the call site.

#### Interview explanation
Say that syntax is sugar for type-level protocol lookups, list the main protocol families, and stress the `__eq__`/`__hash__` contract and the `__repr__`/`__str__` split — both come up constantly.

#### Syntax
```python
len(x)        → type(x).__len__(x)
x[k]          → type(x).__getitem__(x, k)
for i in x    → type(x).__iter__(x)
with x:       → type(x).__enter__ / __exit__
x + y         → type(x).__add__ / type(y).__radd__
repr(x)       → type(x).__repr__(x)
```

#### Example
```python
from functools import total_ordering

@total_ordering
class Version:
    def __init__(self, *parts): self.parts = tuple(parts)
    def __eq__(self, other): return self.parts == other.parts
    def __lt__(self, other): return self.parts < other.parts
    def __hash__(self): return hash(self.parts)
    def __repr__(self): return f"Version{self.parts}"
```

#### Common interview questions
- "What is the difference between `__repr__` and `__str__`?" (`__repr__` is unambiguous output for developers and is the fallback for `__str__`; `__str__` is readable output for users.)
- "How do you make an object iterable?" (Implement `__iter__` returning an iterator, or implement `__getitem__` with integer indices for the legacy sequence protocol.)
- "What does `@total_ordering` do?" (Generates the remaining comparison methods from `__eq__` plus one ordering method.)
- "Why does defining `__eq__` break hashing?" (Python sets `__hash__` to `None` to prevent an inconsistent hash/equality pair.)

#### Follow-up questions
- "Are dunder methods looked up on the instance?" (No — implicit invocations look them up on the type, so per-instance assignment has no effect.)
- "What does `__contains__` fall back to?" (If undefined, `in` iterates the object and compares each element.)
- "Which protocol makes `with` work?" (`__enter__` and `__exit__`, or `contextlib.contextmanager` around a generator.)

#### Edge cases
- Returning `NotImplemented` from `__eq__` lets the other operand try; returning `False` wrongly asserts inequality.
- `__del__` is not a destructor you can rely on — it runs at an unpredictable time and can be skipped at interpreter shutdown.
- Implementing `__getattr__` does not affect dunder lookups.

#### Common mistakes
- `__eq__` without `__hash__`.
- Missing `__repr__`, making logs and tracebacks useless.
- Expensive work inside `__eq__` or `__hash__`, which containers call constantly.

#### Comparisons

| | `__repr__` | `__str__` |
|---|---|---|
| Audience | Developers | End users |
| Goal | Unambiguous | Readable |
| Fallback | — | Falls back to `__repr__` |

#### Frequently confused with
`__str__` as the one to implement — `__repr__` is the one that pays off first.

#### Important facts to remember
- Dunder lookups happen on the type.
- `__eq__` implies you must handle `__hash__`.
- Always write `__repr__`.

---

### 4.7 Properties

#### Definition
`property` is a built-in data descriptor that routes attribute reads, writes and deletes through methods while preserving plain attribute syntax.

#### Why it exists
So attributes can gain validation or computation later without changing any calling code, which is why Python does not write getters and setters pre-emptively.

#### Interview explanation
Say "data descriptor, so it takes priority over the instance dict". Then mention the recursion trap (backing field must have a different name) and `cached_property` for expensive derived values.

#### Syntax
```python
class C:
    @property
    def value(self): return self._value

    @value.setter
    def value(self, v): self._value = v

    @value.deleter
    def value(self): del self._value
```

#### Example
```python
from functools import cached_property

class Report:
    def __init__(self, rows): self.rows = rows

    @cached_property
    def summary(self):                 # computed once per instance
        return expensive_aggregate(self.rows)
```

#### Common interview questions
- "What is a property?" (A data descriptor that turns method calls into attribute access, allowing validation or computation behind a plain attribute.)
- "Why not write getters and setters in Python?" (Because a plain attribute can become a property later with no call-site changes, so the indirection has no up-front value.)
- "How does `cached_property` differ from `property`?" (It computes once and stores the result in the instance `__dict__`, so later reads bypass the descriptor entirely.)
- "Can a property be inherited and overridden?" (Yes, but overriding only the setter requires redefining the whole property or using `Parent.prop.setter`.)

#### Follow-up questions
- "Why does my property recurse infinitely?" (The setter assigns to the property's own name instead of a differently named backing field.)
- "Does `cached_property` work with `__slots__`?" (No — it needs an instance `__dict__` to store the cached value.)
- "Is a property thread-safe?" (Not inherently; `cached_property` in particular can compute twice under concurrent first access.)

#### Edge cases
- `hasattr` returns `False` when a property raises any exception, hiding real errors.
- A read-only property raises `AttributeError` on assignment, which surprises callers expecting a plain attribute.
- Properties are class-level, so `instance.__dict__` cannot shadow them (they are data descriptors).

#### Common mistakes
- Same name for property and backing field.
- Expensive or I/O-performing properties.
- Using properties where a method would be more honest about cost.

#### Comparisons

| | Attribute | `property` | `cached_property` |
|---|---|---|---|
| Cost per read | None | A call | First read only |
| Validation | No | Yes | No |
| Needs `__dict__` | No | No | Yes |

#### Frequently confused with
`property` vs. `cached_property` — one recomputes, the other memoises per instance.

#### Important facts to remember
- Properties are data descriptors.
- Backing field needs a different name.
- Keep them cheap.

---

### 4.8 Descriptors

#### Definition
A descriptor is a class attribute implementing `__get__`, `__set__` or `__delete__`; data descriptors (with `__set__`/`__delete__`) take precedence over the instance dict, non-data ones do not.

#### Why it exists
It is the shared mechanism behind properties, methods, `classmethod`, `staticmethod`, `slots` and ORM fields — reusable attribute behaviour, defined once.

#### Interview explanation
Define both kinds, state the precedence rule, and explain that functions are non-data descriptors — which is precisely why `self.method = something` can shadow a method but `self.prop = x` cannot shadow a property.

#### Syntax
```python
class Descriptor:
    def __set_name__(self, owner, name): self.name = name
    def __get__(self, obj, objtype=None): ...
    def __set__(self, obj, value): ...        # makes it a data descriptor
    def __delete__(self, obj): ...
```

#### Example
```python
class Typed:
    def __init__(self, kind): self.kind = kind
    def __set_name__(self, owner, name): self.attr = f"_{name}"
    def __get__(self, obj, objtype=None):
        return self if obj is None else getattr(obj, self.attr)
    def __set__(self, obj, value):
        if not isinstance(value, self.kind):
            raise TypeError(f"expected {self.kind.__name__}")
        setattr(obj, self.attr, value)

class Product:
    name = Typed(str)
    price = Typed(float)
```

#### Common interview questions
- "What is a descriptor?" (An object defining `__get__`/`__set__`/`__delete__`, stored on a class, that customises attribute access for instances.)
- "What is the difference between data and non-data descriptors?" (Data descriptors define `__set__` or `__delete__` and win over the instance dict; non-data ones only define `__get__` and lose to it.)
- "Where are descriptors already used?" (`property`, functions/methods, `classmethod`, `staticmethod`, `cached_property`, `__slots__`, ORM and form fields.)
- "What does `__set_name__` do?" (Called at class creation with the attribute's name, so a descriptor can derive its storage key without duplication.)

#### Follow-up questions
- "Where should a descriptor store per-instance data?" (On the instance — a name-mangled attribute or the instance `__dict__` — never on the descriptor, which is shared by all instances.)
- "Why is `cached_property` non-data?" (So that once it writes the computed value into the instance dict, later reads skip the descriptor entirely.)
- "How would you validate many fields the same way?" (One descriptor class instantiated per field — the pattern frameworks use.)

#### Edge cases
- `__get__` receives `obj=None` when accessed on the class; returning `self` is the convention.
- Descriptors only work on *classes* — placing one on an instance has no effect.
- A `WeakKeyDictionary` keyed by instance avoids leaks if a descriptor must store data outside the instance.

#### Common mistakes
- Storing state on the descriptor, so all instances share it.
- Forgetting `__set_name__` and hard-coding attribute names.
- Writing a descriptor when a property would do.

#### Comparisons

| | Data descriptor | Non-data descriptor |
|---|---|---|
| Defines | `__set__`/`__delete__` | `__get__` only |
| Beats instance dict | Yes | No |
| Examples | `property`, slots | Functions, `cached_property` |

#### Complexity
One extra Python-level call per access unless the value has been cached into the instance dict.

#### Frequently confused with
Descriptors vs. properties — a property *is* a descriptor, the reusable general case.

#### Important facts to remember
- Data descriptors beat the instance dict.
- Store per-instance state on the instance.
- `__set_name__` learns the field name.

---

### 4.9 Dataclasses

#### Definition
`@dataclass` generates `__init__`, `__repr__`, `__eq__` and optionally ordering, hashing and slots from a class's annotated fields.

#### Why it exists
To remove the repetitive and error-prone boilerplate of record-like classes while staying compatible with type checkers and standard tooling.

#### Interview explanation
List what is generated, then the three options that matter in practice — `frozen`, `slots`, `default_factory` — and note that dataclasses reject mutable defaults outright, unlike plain functions.

#### Syntax
```python
@dataclass(frozen=True, slots=True, order=True, kw_only=True)
class Item:
    sku: str
    qty: int = 1
    tags: list[str] = field(default_factory=list)
    internal: str = field(default="", repr=False, compare=False)
```

#### Example
```python
from dataclasses import dataclass, asdict, replace

@dataclass(frozen=True)
class Money:
    amount: int          # minor units
    currency: str = "EUR"

    def __post_init__(self):
        if self.amount < 0:
            raise ValueError("negative amount")

asdict(Money(100))       # {'amount': 100, 'currency': 'EUR'}
replace(Money(100), amount=250)
```

#### Common interview questions
- "What does `@dataclass` generate?" (`__init__`, `__repr__`, `__eq__` by default; `__lt__` and friends with `order=True`; `__hash__` with `frozen=True`.)
- "Why can't you write `tags: list = []`?" (It would be one shared mutable default for every instance; dataclasses raise `ValueError` and require `default_factory`.)
- "What does `frozen=True` really give you?" (Blocked attribute assignment and a generated `__hash__` — but only shallow immutability.)
- "Dataclass, NamedTuple or Pydantic?" (Dataclass for plain records; NamedTuple when tuple behaviour is wanted; Pydantic when runtime validation and parsing of external data are required.)

#### Follow-up questions
- "What is `__post_init__` for?" (Validation or derived fields after the generated `__init__` has assigned everything.)
- "How do defaults interact with inheritance?" (Fields are ordered base-first, so a base field with a default forces every later field to have one — `kw_only=True` avoids the problem.)
- "Does `asdict` deep-copy?" (Yes — it recurses into dataclasses, dicts, lists and tuples, which can be expensive.)

#### Edge cases
- `eq=False` leaves the inherited `__hash__` intact; `eq=True` with `frozen=False` sets `__hash__` to `None`.
- `slots=True` (3.10+) creates a *new* class object, so identity checks against the original fail.
- `field(compare=False)` removes a field from equality but keeps it in the `repr` unless you also set `repr=False`.

#### Common mistakes
- Mutable defaults without `default_factory`.
- Assuming `frozen` is deep.
- Using dataclasses to validate untrusted input, which they do not do.

#### Comparisons

| | `dataclass` | `NamedTuple` | `TypedDict` |
|---|---|---|---|
| Mutable | Yes (unless frozen) | No | Yes (a dict) |
| Methods | Yes | Yes | No |
| Runtime type check | No | No | No |

#### Frequently confused with
Dataclasses vs. Pydantic models — only the latter validates and coerces at runtime.

#### Important facts to remember
- `default_factory` for mutable defaults.
- `frozen` is shallow but gives you `__hash__`.
- `slots=True` cuts memory noticeably.

---

### 4.10 Abstract Base Classes and Protocols

#### Definition
ABCs provide nominal typing — explicit inheritance plus enforced implementation at instantiation. Protocols provide structural typing — compatibility by shape, checked by a static type checker.

#### Why it exists
To express interfaces in a language with duck typing: ABCs when you own and want to enforce a hierarchy, protocols when you only care what an object can do.

#### Interview explanation
Contrast nominal and structural typing in one sentence each, then note where each check happens: ABCs at instantiation, protocols at type-check time (with `runtime_checkable` giving a limited `isinstance` that only inspects attribute names).

#### Syntax
```python
from abc import ABC, abstractmethod
from typing import Protocol, runtime_checkable

class Store(ABC):
    @abstractmethod
    def get(self, k: str) -> bytes: ...

@runtime_checkable
class SupportsRead(Protocol):
    def read(self, n: int = -1) -> bytes: ...
```

#### Example
```python
import collections.abc

class Inventory(collections.abc.Mapping):     # implement 3, inherit ~10
    def __init__(self, data): self._data = dict(data)
    def __getitem__(self, k): return self._data[k]
    def __iter__(self): return iter(self._data)
    def __len__(self): return len(self._data)

inv = Inventory({"a": 1})
"a" in inv, list(inv.items()), inv.get("b", 0)     # all provided by the ABC
```

#### Common interview questions
- "What is an abstract base class?" (A class with abstract methods that cannot be instantiated until a subclass implements them all.)
- "When is the abstract check performed?" (At instantiation, not at class definition.)
- "What is a Protocol?" (A structural interface: any class with the right methods is compatible, without inheriting or registering.)
- "Why inherit from `collections.abc.Mapping`?" (You implement three methods and receive the rest of the mapping interface as mixin methods.)

#### Follow-up questions
- "What does `ABC.register` do?" (Declares a virtual subclass so `isinstance` passes, without inheritance and without any implementation check.)
- "What are the limits of `runtime_checkable`?" (It checks only that the attribute names exist — not signatures, not types.)
- "Which is better for library boundaries?" (Protocols, because callers need not depend on your base class at all.)

#### Edge cases
- A class with an unimplemented abstract method is created fine — it just cannot be instantiated.
- `@abstractmethod` must be the innermost decorator when combined with `classmethod` or `property`.
- Protocols with non-method members cannot be `runtime_checkable` for `isinstance` purposes in the usual way.

#### Common mistakes
- Believing ABC errors appear at import time.
- Trusting `isinstance` with a protocol to verify signatures.
- Writing an ABC where a single protocol or a plain callable argument would do.

#### Comparisons

| | ABC | Protocol |
|---|---|---|
| Typing | Nominal | Structural |
| Inheritance required | Yes | No |
| Checked | At instantiation | By the type checker |
| Shared implementation | Yes | No (unless default methods) |

#### Frequently confused with
ABCs vs. interfaces in Java — Python's are opt-in and can carry implementation.

#### Important facts to remember
- ABC enforcement happens at instantiation.
- Protocols need no inheritance.
- `collections.abc` gives mixin methods for free.

---

### 4.11 Slots and Memory Layout

#### Definition
`__slots__` declares a fixed set of attributes, replacing the per-instance `__dict__` with slot descriptors bound to fixed offsets.

#### Why it exists
To cut memory when a program holds very large numbers of small objects, where the per-instance dictionary dominates the footprint.

#### Interview explanation
State the trade: less memory and marginally faster access, in exchange for no dynamic attributes, no `__dict__`, no `cached_property`, and inheritance rules to respect. Mention `@dataclass(slots=True)` as the modern way to get it.

#### Syntax
```python
class Point:
    __slots__ = ("x", "y")
    def __init__(self, x, y): self.x, self.y = x, y

@dataclass(slots=True)
class Point2:
    x: float
    y: float
```

#### Example
```python
class WithDict:
    def __init__(self, a, b): self.a, self.b = a, b

class WithSlots:
    __slots__ = ("a", "b")
    def __init__(self, a, b): self.a, self.b = a, b

WithSlots(1, 2).c = 3        # AttributeError — not in __slots__
```

#### Common interview questions
- "What does `__slots__` do?" (Replaces the instance dictionary with fixed slots, reducing memory and blocking new attributes.)
- "When should you use it?" (When you create very many small instances and have measured the memory cost — not by default.)
- "What breaks with slots?" (Dynamic attributes, `cached_property`, some pickling and mocking patterns, and multiple inheritance with conflicting layouts.)
- "Does a subclass inherit the saving?" (Only if it also declares `__slots__`; otherwise it gets a `__dict__` and the benefit is lost.)

#### Follow-up questions
- "How do you measure the difference?" (`sys.getsizeof` for the object plus its dict, or `tracemalloc`/`pympler` for real aggregate usage.)
- "Can a slotted class still have weak references?" (Only if `"__weakref__"` is included in `__slots__`.)
- "Does it speed anything up?" (Attribute access is slightly faster; it is not an algorithmic improvement.)

#### Edge cases
- Adding `"__dict__"` to `__slots__` restores dynamic attributes and discards most of the benefit.
- Two base classes with non-empty slots cannot always be combined — "multiple bases have instance lay-out conflict".
- Class attributes cannot share a name with a slot.

#### Common mistakes
- Applying slots everywhere as a habit.
- Omitting slots in subclasses.
- Combining slots with `cached_property`.

#### Comparisons

| | With `__dict__` | With `__slots__` |
|---|---|---|
| Memory per instance | Higher | Lower |
| Dynamic attributes | Yes | No |
| Typos | Silent new attribute | `AttributeError` |

#### Complexity
No change in algorithmic terms; a constant-factor improvement in access and a significant constant reduction in memory.

#### Frequently confused with
Slots as a speed feature — it is primarily a memory feature.

#### Important facts to remember
- Removes `__dict__`.
- Subclasses must declare slots too.
- `@dataclass(slots=True)` is the easy route.

---

### 4.12 Composition and Delegation

#### Definition
Composition builds behaviour by holding collaborator objects; delegation forwards calls to them. Neither requires inheritance.

#### Why it exists
Because inheritance couples classes permanently and demands substitutability, while most reuse only needs "I want to use that object's behaviour".

#### Interview explanation
Frame it with Liskov: inherit only when the subtype can replace the base everywhere. Otherwise compose. Mention that subclassing built-ins is a classic trap and that `UserDict`/`UserList` exist for it.

#### Syntax
```python
class Service:
    def __init__(self, repo, clock=datetime.now):    # injected collaborators
        self.repo, self.clock = repo, clock

class Wrapper:
    def __getattr__(self, name):                     # dynamic delegation
        return getattr(self._inner, name)
```

#### Example
```python
class Cache:
    def __init__(self, store, ttl): self.store, self.ttl = store, ttl
    def get(self, key):
        entry = self.store.get(key)
        return entry.value if entry and not entry.expired(self.ttl) else None

# Testing needs no database — pass a dict-backed fake store
```

#### Common interview questions
- "Why prefer composition over inheritance?" (Looser coupling, easier substitution in tests, and no requirement that the parts be substitutable for a common base.)
- "When is inheritance right?" (When the subclass genuinely is-a base and satisfies Liskov substitution everywhere the base is used.)
- "What goes wrong when subclassing `dict` or `list`?" (Built-in methods are implemented in C and do not call your overrides, so `update` or `extend` bypass them; use `UserDict`/`UserList` or compose.)
- "How does `__getattr__` enable delegation?" (It is called only when normal lookup fails, so you can forward unknown attributes to a wrapped object.)

#### Follow-up questions
- "What are the downsides of `__getattr__` delegation?" (It is invisible to type checkers and IDEs, and it silently forwards attributes you never intended to expose.)
- "How does dependency injection look in Python?" (Constructor parameters with defaults — frameworks are rarely needed.)
- "What is the Liskov substitution principle?" (A subtype must be usable anywhere its base is, without weakening guarantees the base makes.)

#### Edge cases
- `__getattr__` does not forward dunder methods, because implicit lookups bypass it.
- Delegating `__eq__` or `__hash__` requires implementing them explicitly.
- Excessive forwarding methods are a signal that inheritance or a different boundary might be right after all.

#### Common mistakes
- Inheriting for code reuse rather than for substitutability.
- Subclassing built-in containers.
- Wrapping objects in proxies that silently expose everything.

#### Comparisons

| | Inheritance | Composition |
|---|---|---|
| Relationship | is-a | has-a |
| Coupling | Tight | Loose |
| Swap at runtime | No | Yes |
| Test isolation | Harder | Easy |

#### Frequently confused with
Delegation vs. inheritance — both reuse behaviour, only one claims substitutability.

#### Important facts to remember
- Inherit for is-a, compose for has-a.
- Built-in subclassing bypasses overrides.
- Inject collaborators for testability.

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

#### Definition
All exceptions derive from `BaseException`; ordinary errors derive from `Exception`, while `SystemExit`, `KeyboardInterrupt` and `GeneratorExit` sit outside it deliberately.

#### Why it exists
So handlers can be as broad or as narrow as the situation requires, and so control-flow signals are not caught by code trying to handle errors.

#### Interview explanation
State the split between `BaseException` and `Exception` and why it exists, then note that matching is `isinstance`-based and clauses are tested in order — so specific handlers must come first.

#### Syntax
```python
except FileNotFoundError:      # one specific error
except (KeyError, IndexError): # several
except OSError as exc:         # a family, bound to a name
except Exception:              # broad, but not KeyboardInterrupt
```

#### Example
```python
def read_setting(path, key):
    try:
        data = json.loads(Path(path).read_text(encoding="utf-8"))
    except FileNotFoundError:
        return None
    except json.JSONDecodeError as exc:
        raise ConfigError(f"{path} is not valid JSON") from exc
    return data.get(key)
```

#### Common interview questions
- "What is the difference between `Exception` and `BaseException`?" (`BaseException` is the root and includes `SystemExit`, `KeyboardInterrupt` and `GeneratorExit`; `Exception` is the base for ordinary errors and is what you should catch.)
- "Why should you never use a bare `except:`?" (It catches `KeyboardInterrupt` and `SystemExit` too, so Ctrl-C and clean shutdown stop working.)
- "What does `except OSError` cover?" (The whole I/O family — `FileNotFoundError`, `PermissionError`, `TimeoutError`, `ConnectionError` and more.)
- "Does clause order matter?" (Yes — the first matching clause wins, so a broad clause above a narrow one makes the narrow one unreachable.)

#### Follow-up questions
- "Which built-in should you raise for a bad argument value?" (`ValueError` for a wrong value, `TypeError` for a wrong type.)
- "What happened to `IOError`?" (It is an alias of `OSError` since Python 3.3; the whole family was merged.)
- "Is `StopIteration` an error?" (It derives from `Exception` but is control flow for iterators — and inside a generator it is converted to `RuntimeError` by PEP 479.)

#### Edge cases
- `KeyboardInterrupt` can arrive at any bytecode boundary, including inside a `finally` block.
- `SystemExit` propagates out of `sys.exit()` and is caught by an over-broad handler, turning an intended exit into a silent continuation.
- Catching `Exception` in a thread does not stop the process — an unhandled exception kills only that thread.

#### Common mistakes
- Bare `except:`.
- Ordering handlers broad-to-narrow.
- Raising `Exception` rather than something specific.

#### Comparisons

| | `except Exception` | `except BaseException` |
|---|---|---|
| Catches Ctrl-C | No | Yes |
| Catches `SystemExit` | No | Yes |
| Appropriate | Usually | Almost never |

#### Frequently confused with
`Exception` vs. `BaseException` — and the belief that the former catches everything.

#### Important facts to remember
- Catch `Exception`, never `BaseException`.
- Specific clauses first.
- `IOError` is `OSError`.

---

### 5.2 try, except, else and finally

#### Definition
`try` guards a block, `except` handles matching exceptions, `else` runs when no exception was raised, and `finally` runs on every exit path.

#### Why it exists
To separate the risky operation, the recovery, the happy path and the cleanup so each is written once, in the right place.

#### Interview explanation
Explain what `else` adds — code that is not protected by the handlers — and that `finally` runs even on `return`. Mention zero-cost exceptions in 3.11+: an untaken `try` costs nothing.

#### Syntax
```python
try:
    ...
except SpecificError as exc:
    ...
except (A, B):
    ...
else:
    ...          # only if no exception
finally:
    ...          # always
```

#### Example
```python
def transfer(account, amount, ledger):
    try:
        account.withdraw(amount)
    except InsufficientFunds:
        ledger.record_failure(account, amount)
        raise
    else:
        ledger.record_success(account, amount)
    finally:
        account.close_session()
```

#### Common interview questions
- "What is the `else` clause on a `try` for?" (Code that should run only if no exception occurred, and that should *not* be guarded by the handlers.)
- "When does `finally` run?" (Always — after success, after a handled exception, while an unhandled one propagates, and even when the block returns or breaks.)
- "What happens if `finally` contains a `return`?" (It swallows any in-flight exception and overrides the return value — a serious anti-pattern.)
- "What are zero-cost exceptions?" (Since 3.11 the `try` setup costs nothing at runtime; only raising and handling costs time.)

#### Follow-up questions
- "How should you size a `try` block?" (As small as possible — ideally the one call that can fail — with the rest in `else`.)
- "Can you have `finally` without `except`?" (Yes — `try`/`finally` is the classic cleanup pattern, and `with` is its more concise form.)
- "What if an exception is raised inside `finally`?" (It replaces the original, which is then attached as `__context__`.)

#### Edge cases
- `finally` runs even when the generator containing it is closed or garbage collected.
- A `break` or `continue` inside `finally` also discards the in-flight exception.
- `return` in `try` evaluates its expression first, then runs `finally`, then returns.

#### Common mistakes
- Large `try` blocks with a single broad handler.
- `return` inside `finally`.
- Cleanup written in both the `except` and the success path instead of in `finally`.

#### Comparisons

| | `else` | Code after `try` |
|---|---|---|
| Runs when | No exception | Always (if not propagated) |
| Guarded by handlers | No | No |
| Communicates intent | Yes | Less clearly |

#### Complexity
Setting up a handler is free in 3.11+; raising and catching costs roughly a microsecond, so exceptions should stay exceptional in hot loops.

#### Frequently confused with
`try/else` vs. loop `else` — one means "no exception", the other "no break".

#### Important facts to remember
- `finally` always runs.
- Never `return` from `finally`.
- Keep `try` blocks tiny.

---

### 5.3 Raising and Re-raising

#### Definition
`raise` signals an exception; a bare `raise` inside a handler re-raises the current exception with its traceback intact; `raise X from Y` raises a new exception with an explicit cause.

#### Why it exists
So failures propagate to code that can handle them, and so translating an error to a domain-level one does not discard the original evidence.

#### Interview explanation
Contrast bare `raise` with `raise exc` and `raise NewError() from exc`, and state the rule: handle only what you can act on, otherwise re-raise. Catch-and-log-without-re-raise is the anti-pattern interviewers look for.

#### Syntax
```python
raise ValueError("bad input")
raise                      # re-raise the current exception, inside except only
raise New() from exc       # explicit cause
raise New() from None      # suppress the chain
```

#### Example
```python
def fetch_user(user_id):
    try:
        return api.get(f"/users/{user_id}")
    except TimeoutError:
        metrics.increment("user_fetch.timeout")
        raise                                   # let the caller decide
    except HTTPError as exc:
        if exc.status == 404:
            raise UserNotFound(user_id) from exc
        raise
```

#### Common interview questions
- "What is the difference between `raise` and `raise exc`?" (Bare `raise` re-raises the active exception unchanged; `raise exc` raises that object again, adding the current frame.)
- "What does `from` do?" (Sets `__cause__`, so the traceback shows the original error as the direct cause of the new one.)
- "When should you catch an exception?" (Only when you can do something about it — recover, translate, add context, or clean up before re-raising.)
- "Why is catch-and-log an anti-pattern?" (The caller continues as if the operation succeeded, so the failure surfaces later somewhere unrelated.)

#### Follow-up questions
- "How do you add context without losing the original?" (Raise a new domain exception `from exc`, or attach notes with `exc.add_note()` in 3.11+.)
- "When is `from None` right?" (When the cause is an internal implementation detail that would only distract the caller.)
- "Can you raise a class instead of an instance?" (Yes — Python instantiates it with no arguments, though passing a message is better.)

#### Edge cases
- `raise` with no active exception raises `RuntimeError: No active exception to re-raise`.
- The `as exc` name is deleted at the end of the `except` block, so referencing it afterwards raises `NameError`.
- Raising inside `__del__` prints the error to stderr and is otherwise ignored.

#### Common mistakes
- Catching, logging and continuing.
- `raise exc` where bare `raise` was meant.
- Losing the cause by omitting `from`.

#### Comparisons

| | Bare `raise` | `raise New() from exc` |
|---|---|---|
| Exception type | Unchanged | New, domain-level |
| Traceback | Original | New plus cause |
| Use when | You only observed | You are translating |

#### Frequently confused with
Re-raising vs. raising a new exception — and whether either preserves the traceback.

#### Important facts to remember
- Bare `raise` preserves everything.
- `from` records the cause.
- Do not catch what you cannot handle.

---

### 5.4 Custom Exceptions

#### Definition
Exception classes defined in your own code, normally inheriting from `Exception` through one package-level base class.

#### Why it exists
So callers can catch precisely the failures they understand, and so a library presents a stable, documented error contract.

#### Interview explanation
Describe the one-base-per-package convention, then say that exceptions should carry structured attributes rather than only a message, so handlers can branch on data instead of parsing strings.

#### Syntax
```python
class AppError(Exception):
    """Base for this package."""

class RetryableError(AppError):
    def __init__(self, message, retry_after=None):
        super().__init__(message)
        self.retry_after = retry_after
```

#### Example
```python
class ValidationError(AppError):
    def __init__(self, field, reason):
        super().__init__(f"{field}: {reason}")
        self.field, self.reason = field, reason

try:
    validate(payload)
except ValidationError as exc:
    return {"error": exc.reason, "field": exc.field}, 400
```

#### Common interview questions
- "Why define custom exceptions?" (They let callers catch exactly what they can handle and make failure modes part of the API rather than of the log text.)
- "What should a custom exception inherit from?" (`Exception`, usually through a single package base; a specific built-in only when your error genuinely is one.)
- "How do you attach data to an exception?" (Set attributes in `__init__` after calling `super().__init__(message)`.)
- "How many exception classes should a library have?" (Enough to distinguish the cases callers handle differently — not one per raise site.)

#### Follow-up questions
- "Should exceptions inherit from `ValueError`?" (Only if code catching `ValueError` should reasonably catch yours too; otherwise it surprises callers.)
- "How do you keep exceptions picklable?" (Make `__init__` accept the same arguments it passes to `super().__init__`, or implement `__reduce__` — important for `multiprocessing`.)
- "Where should exceptions be defined?" (In one module — `exceptions.py` — so they can be imported without pulling in the implementation.)

#### Edge cases
- Custom exceptions with required constructor arguments can fail to unpickle across process boundaries.
- Overriding `__str__` without setting `args` breaks default formatting in some tools.
- An exception holding a large object keeps it alive for as long as the exception is referenced — including in a captured traceback.

#### Common mistakes
- Raising bare `Exception`.
- Message-only exceptions that force string matching.
- Hierarchies so deep nobody catches the leaves.

#### Comparisons

| | Built-in exception | Custom exception |
|---|---|---|
| Caller familiarity | High | Needs docs |
| Precision | Generic | Domain-specific |
| Best for | Generic misuse | Library error contract |

#### Frequently confused with
Error codes vs. exception types — Python idiom is types, not codes.

#### Important facts to remember
- One base exception per package.
- Carry structured data.
- Keep them picklable if they cross processes.

---

### 5.5 Exception Chaining

#### Definition
Python links exceptions through `__cause__` (explicit, via `from`) and `__context__` (implicit, when raised during handling), and prints the whole chain in the traceback.

#### Why it exists
So that converting a low-level failure into a domain-level one preserves the diagnostic detail instead of discarding it.

#### Interview explanation
Name both attributes, describe the two traceback messages they produce, and explain `from None` as deliberate suppression. Then connect it to error tracking: without a cause, the outer exception is often undiagnosable.

#### Syntax
```python
raise New() from exc      # __cause__  → "direct cause of"
raise New()               # __context__ → "during handling of"  (implicit)
raise New() from None     # suppress the chain entirely
exc.add_note("tenant=acme")   # 3.11+: extra context without a new exception
```

#### Example
```python
def parse_port(raw):
    try:
        return int(raw)
    except ValueError as exc:
        raise ConfigError(f"port must be an integer, got {raw!r}") from exc
```

#### Common interview questions
- "What is the difference between `__cause__` and `__context__`?" (`__cause__` is set explicitly with `from` and means "this caused that"; `__context__` is set automatically when an exception is raised while another is being handled.)
- "Why use `raise ... from exc`?" (To keep the original error visible in the traceback while presenting a meaningful domain-level exception.)
- "When would you use `from None`?" (When the underlying cause is an implementation detail that would confuse rather than inform.)
- "What is `add_note`?" (A 3.11 feature that attaches extra context strings to an existing exception, shown in the traceback.)

#### Follow-up questions
- "Does chaining affect how error trackers group errors?" (Yes — grouping is on the outermost exception, so the cause is what gives the group its diagnostic value.)
- "Can chains get long?" (Yes, in deeply layered code; each translation adds a link, which is why translating at layer boundaries only is the usual rule.)
- "Is the chain available programmatically?" (Yes — `exc.__cause__` and `exc.__context__` are ordinary attributes.)

#### Edge cases
- Implicit context can be misleading when the second exception is unrelated to the first.
- `from None` sets `__suppress_context__`, but `__context__` is still populated and inspectable.
- Chained exceptions all retain their tracebacks, and therefore their frames' locals.

#### Common mistakes
- Translating errors without `from`.
- Using `from None` reflexively to make tracebacks shorter.
- Logging only the outer exception's message.

#### Comparisons

| | `__cause__` | `__context__` |
|---|---|---|
| Set by | `raise … from …` | Automatic |
| Meaning | Direct cause | Concurrent context |
| Suppressible | Yes, `from None` | Via the same flag |

#### Frequently confused with
Chaining vs. wrapping — chaining keeps both exceptions, wrapping into a message keeps only text.

#### Important facts to remember
- `from` sets `__cause__`.
- Implicit context is automatic.
- `add_note` adds context without a new exception.

---

### 5.6 EAFP and LBYL

#### Definition
EAFP attempts an operation and handles the resulting exception; LBYL tests preconditions before acting. Python idiom favours EAFP.

#### Why it exists
Because preconditions can become stale between the check and the action, and because untaken `try` blocks are free while repeated checks are not.

#### Interview explanation
Give the TOCTOU argument first — the check-then-open race — then the cost argument: EAFP is free when failures are rare, LBYL is cheaper when they are common. Name `dict.get` and `contextlib.suppress` as idiomatic shortcuts.

#### Syntax
```python
try:                          # EAFP
    value = mapping[key]
except KeyError:
    value = fallback

value = mapping.get(key, fallback)          # EAFP without the syntax
with contextlib.suppress(FileNotFoundError):
    os.remove(path)
```

#### Example
```python
# LBYL — racy: the file can disappear between the two lines
if os.path.exists(path):
    os.remove(path)

# EAFP — atomic
try:
    os.remove(path)
except FileNotFoundError:
    pass
```

#### Common interview questions
- "What do EAFP and LBYL mean?" (Easier to ask forgiveness than permission — try and handle; look before you leap — check first.)
- "Why does Python prefer EAFP?" (It avoids time-of-check/time-of-use races and costs nothing when the operation succeeds.)
- "When is LBYL better?" (When failure is the common case, since raising is far more expensive than a check, or when several preconditions need distinct error messages.)
- "What is `contextlib.suppress`?" (A context manager that swallows the named exceptions — EAFP with less syntax.)

#### Follow-up questions
- "Is `if key in d: d[key]` a problem?" (It performs two lookups and is racy under concurrency; `d.get` or `try/except` is better.)
- "What is a TOCTOU bug?" (Time-of-check to time-of-use: the state changes between the check and the action, which matters for files, permissions and shared state.)
- "How expensive is an exception?" (Roughly a microsecond to raise and catch — negligible occasionally, significant in a tight loop where most iterations fail.)

#### Edge cases
- `hasattr` is LBYL that swallows exceptions from properties, hiding real errors.
- `contextlib.suppress` swallows the exception entirely, including from code you did not intend to guard — keep the block tiny.
- EAFP around a large block can mask unrelated failures of the same type.

#### Common mistakes
- Membership check followed by indexing.
- `os.path.exists` before opening a file.
- Using exceptions for expected, frequent control flow in hot loops.

#### Comparisons

| | EAFP | LBYL |
|---|---|---|
| Races | Immune | Vulnerable |
| Cost when it succeeds | Zero | A check |
| Cost when it fails | Higher | Lower |
| Idiomatic in Python | Yes | Sometimes |

#### Complexity
Untaken `try`: no runtime cost in 3.11+. Raise and catch: on the order of a microsecond.

#### Frequently confused with
EAFP as "use exceptions for everything" — it is about atomicity and the common path, not about replacing conditionals.

#### Important facts to remember
- EAFP avoids TOCTOU races.
- `try` is free until it raises.
- `get` / `suppress` are EAFP in disguise.

---

### 5.7 Tracebacks

#### Definition
A traceback is the linked record of stack frames between the entry point and the raise site, available as `exc.__traceback__` and formatted by the `traceback` module.

#### Why it exists
To make failures diagnosable without reproducing them, by preserving exactly where and in what call sequence the error occurred.

#### Interview explanation
Explain how to read one (bottom for the failure, upward for the path), mention 3.11's fine-grained anchors, and — most importantly — `logging.exception` versus `logging.error`, which is the practical difference between a usable and a useless log.

#### Syntax
```python
logging.exception("failed")            # inside except: message + traceback
logging.error("failed", exc_info=True) # the same, explicitly
traceback.format_exc()                 # the traceback as a string
traceback.print_exception(exc)
```

#### Example
```python
try:
    process(order)
except ProcessingError:
    logger.exception("order %s failed", order.id)   # full traceback in the log
    raise
```

#### Common interview questions
- "How do you read a traceback?" (Start at the bottom for the actual error, then read upward through the calls; in a chain, the earliest block is the root cause.)
- "What is the difference between `logging.error` and `logging.exception`?" (`exception()` includes the traceback automatically and must be called from a handler; `error()` does not unless you pass `exc_info=True`.)
- "What changed in 3.11 tracebacks?" (Fine-grained error locations: the exact sub-expression that failed is underlined.)
- "How do you get a traceback as a string?" (`traceback.format_exc()` inside the handler.)

#### Follow-up questions
- "Why does holding an exception object keep memory alive?" (Its traceback references every frame, and each frame holds its locals — which is why Python deletes the `as` name at the end of the block.)
- "How do you show a traceback across threads or processes?" (Capture and transmit the formatted text; traceback objects themselves do not pickle.)
- "What does `sys.excepthook` do?" (Handles otherwise-unhandled exceptions — the hook error trackers install to capture crashes.)

#### Edge cases
- Tracebacks can contain secrets from local variables when a tool renders locals (as many error trackers do).
- `RecursionError` produces thousands of nearly identical frames, which some log systems truncate.
- Exceptions raised in a thread do not reach the main thread's handler; use `threading.excepthook`.

#### Common mistakes
- `logging.error(str(exc))`, discarding the traceback.
- Printing tracebacks to stdout in a service instead of logging them.
- Storing exception objects long-term, pinning frames and their locals.

#### Comparisons

| | `logging.error` | `logging.exception` |
|---|---|---|
| Traceback | Only with `exc_info` | Always |
| Level | ERROR | ERROR |
| Valid outside a handler | Yes | No |

#### Frequently confused with
The error message vs. the traceback — the message is one line, the evidence is the rest.

#### Important facts to remember
- `logging.exception` inside handlers.
- Tracebacks pin frames and locals.
- 3.11 shows the exact failing expression.

---

### 5.8 Warnings

#### Definition
The `warnings` module reports non-fatal issues through categories and filters, which decide whether a warning is printed, ignored, shown once or raised as an error.

#### Why it exists
So libraries can announce deprecations and dubious usage without breaking running programs, and so those announcements can be escalated to errors in testing.

#### Interview explanation
Name the main categories, explain that `DeprecationWarning` is hidden by default outside `__main__` (so library users never see it unless they opt in), and stress `stacklevel=2` so the warning points at the caller.

#### Syntax
```python
warnings.warn("msg", DeprecationWarning, stacklevel=2)
warnings.simplefilter("error", DeprecationWarning)
python -W error::DeprecationWarning script.py
python -X dev script.py            # development mode: enables extra warnings
```

#### Example
```python
def legacy(x):
    warnings.warn(
        "legacy() is deprecated and will be removed in 3.0; use modern()",
        DeprecationWarning,
        stacklevel=2,
    )
    return modern(x)
```

#### Common interview questions
- "When do you use a warning instead of an exception?" (When the program can continue correctly but a developer should change something — deprecations, fallbacks, dubious arguments.)
- "Why are deprecation warnings hidden by default?" (They are aimed at developers, not end users; they are shown in `__main__` and in test runners, but suppressed elsewhere to avoid noise.)
- "What does `stacklevel` do?" (Chooses which frame the warning is attributed to — `2` points at the caller of your function rather than at your own line.)
- "How do you make warnings fail a build?" (`-W error::DeprecationWarning`, or `filterwarnings = error` in the pytest configuration.)

#### Follow-up questions
- "What is `ResourceWarning`?" (Raised when a file or socket is garbage collected without being closed; visible in development mode.)
- "Are warnings thread-safe?" (The filter state is global and mutable, so `catch_warnings` is not thread-safe — a real problem in concurrent test suites.)
- "Why show a warning only once?" (The default `default` filter shows one per unique location, to avoid flooding logs from a loop.)

#### Edge cases
- `catch_warnings()` restores global state, so parallel tests can interfere with each other.
- Warnings raised at import time may be suppressed before the application's filters are configured.
- A warning converted to an error changes the control flow of code that never expected it.

#### Common mistakes
- Omitting `stacklevel`.
- Using `print` for deprecations.
- Ignoring `DeprecationWarning` in CI until the upgrade breaks everything.

#### Comparisons

| | Warning | Exception |
|---|---|---|
| Stops execution | No | Yes |
| Audience | Developer | Program |
| Filterable | Yes | No |

#### Frequently confused with
`DeprecationWarning` vs. `UserWarning` — the first is for developers of calling code, the second for the caller at runtime.

#### Important facts to remember
- `stacklevel=2` points at the caller.
- Deprecations are hidden by default.
- Turn warnings into errors in CI.

---

### 5.9 Exception Groups

#### Definition
`ExceptionGroup` (3.11+) wraps multiple exceptions raised together, and `except*` clauses handle matching subsets while letting the rest propagate.

#### Why it exists
Because concurrent code can fail in several ways at once, and a single exception cannot represent that without discarding information.

#### Interview explanation
Explain the concurrency motivation, that several `except*` clauses can run for one `try`, and that plain `except` cannot be mixed with `except*`. Connect it to `asyncio.TaskGroup`, which is where most people meet it.

#### Syntax
```python
raise ExceptionGroup("failures", [ValueError("a"), TypeError("b")])

try:
    ...
except* ValueError as eg:      # eg is an ExceptionGroup of the matches
    ...
except* OSError as eg:
    ...
```

#### Example
```python
async def fetch_all(urls):
    try:
        async with asyncio.TaskGroup() as tg:
            tasks = [tg.create_task(fetch(u)) for u in urls]
    except* TimeoutError as eg:
        logger.warning("%d timed out", len(eg.exceptions))
    except* HTTPError as eg:
        logger.error("%d http failures", len(eg.exceptions))
    return [t.result() for t in tasks if not t.cancelled()]
```

#### Common interview questions
- "What problem do exception groups solve?" (Reporting every failure from concurrent tasks instead of only the first.)
- "How does `except*` differ from `except`?" (It matches inside a group, several clauses can run for one `try`, and unmatched exceptions continue to propagate.)
- "Where do you encounter them in practice?" (`asyncio.TaskGroup`, and `BaseExceptionGroup` when cancellation is involved.)
- "Can you mix `except` and `except*` in one `try`?" (No — that is a syntax error.)

#### Follow-up questions
- "What is `BaseExceptionGroup` for?" (Groups that may contain `BaseException` subclasses such as `CancelledError`, which must not be swallowed by `except Exception`.)
- "How do you split a group programmatically?" (`eg.split(predicate)` returns matching and non-matching subgroups; `eg.subgroup` returns just the matches.)
- "What does `TaskGroup` do when one task fails?" (It cancels the remaining tasks and raises a group containing every error that occurred.)

#### Edge cases
- `break`, `continue` and `return` are not allowed inside an `except*` block.
- A group with one exception is still a group — plain `except ValueError` will not match it.
- Nested groups preserve structure, so handlers may receive a group containing groups.

#### Common mistakes
- Migrating to `TaskGroup` while keeping plain `except` handlers.
- Catching `Exception` around a group and losing the individual errors.
- Assuming `asyncio.gather` behaves the same way — with `return_exceptions=True` it returns errors as values instead.

#### Comparisons

| | `gather(return_exceptions=True)` | `TaskGroup` + groups |
|---|---|---|
| Errors arrive as | Values in a list | Raised exception group |
| Remaining tasks | Keep running | Cancelled |
| Failure visibility | Easy to ignore | Explicit |

#### Frequently confused with
`except*` as "catch everything" — the star means "inside the group", not "wildcard".

#### Important facts to remember
- 3.11+, built for concurrency.
- Several `except*` clauses can run.
- Cannot be mixed with plain `except`.

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

#### Definition
The protocol pairing `__iter__`, which returns an iterator, with `__next__`, which returns the next value or raises `StopIteration`.

#### Why it exists
To give every sequence-like thing — containers, files, streams, infinite sources — one uniform interface that `for`, `in`, unpacking and comprehensions all use.

#### Interview explanation
Describe the desugaring of a `for` loop into `iter()` plus repeated `next()` with `StopIteration` caught, then mention the legacy `__getitem__` fallback and PEP 479 as the detail that shows depth.

#### Syntax
```python
it = iter(obj)          # obj.__iter__()
next(it)                # it.__next__()
next(it, default)       # default instead of StopIteration
```

#### Example
```python
class Fibonacci:
    def __init__(self, limit): self.limit = limit
    def __iter__(self):
        a, b = 0, 1
        for _ in range(self.limit):      # fresh state per iteration
            yield a
            a, b = b, a + b

f = Fibonacci(5)
list(f), list(f)        # works twice — __iter__ returns a new generator
```

#### Common interview questions
- "How does a `for` loop work internally?" (Calls `iter()` once, then `next()` repeatedly, catching `StopIteration`.)
- "What must a class implement to be iterable?" (`__iter__` returning an iterator — or `__getitem__` accepting integers from 0, the legacy protocol.)
- "What is `StopIteration`?" (The exception an iterator raises to signal exhaustion; it is control flow, not an error.)
- "What does PEP 479 change?" (A `StopIteration` that escapes the body of a generator becomes a `RuntimeError`, instead of silently ending iteration.)

#### Follow-up questions
- "Why return a generator from `__iter__` rather than `self`?" (So each call produces independent state and the object can be iterated more than once.)
- "How does `in` relate to this?" (`in` uses `__contains__`, and falls back to iterating and comparing when that is absent.)
- "How do you make `next()` not raise?" (Pass a default: `next(it, None)`.)

#### Edge cases
- An object with `__getitem__` but no `__iter__` is still iterable, and raising `IndexError` is what ends the loop.
- Mutating a container mid-iteration invalidates the iterator: dicts and sets raise `RuntimeError`, lists silently skip items.
- An iterator whose `__next__` raises anything other than `StopIteration` propagates that error out of the loop.

#### Common mistakes
- Returning `self` from a container's `__iter__`.
- Treating `StopIteration` as an error condition to log.
- Raising `StopIteration` inside a generator to end it (use `return`).

#### Comparisons

| | `__iter__` | `__getitem__` |
|---|---|---|
| Protocol | Modern | Legacy sequence |
| Ends on | `StopIteration` | `IndexError` |
| Works with generators | Yes | No |

#### Complexity
One method call per item; `iter()` is called once per loop.

#### Frequently confused with
`StopIteration` as an error vs. as control flow.

#### Important facts to remember
- `iter()` once, `next()` many.
- `StopIteration` is normal.
- PEP 479 converts leaked `StopIteration` to `RuntimeError`.

---

### 6.2 Iterables and Iterators

#### Definition
An iterable produces a new iterator on each `iter()` call; an iterator holds the position, returns itself from `__iter__`, and is exhausted after one pass.

#### Why it exists
To separate the collection from the cursor, so one collection can be traversed many times while each traversal has independent state.

#### Interview explanation
Give the table — reusable vs. single-use — and the file-object example, since a file is its own iterator and that is where the distinction bites people in real code.

#### Syntax
```python
iter(x)                 # iterable → iterator
iter(x) is x            # True for iterators, False for containers
itertools.tee(it, 2)    # two independent iterators from one (buffers!)
```

#### Example
```python
with open("data.txt", encoding="utf-8") as fh:
    first_pass = [line for line in fh]
    second_pass = [line for line in fh]      # [] — the file is its own iterator
```

#### Common interview questions
- "What is the difference between an iterable and an iterator?" (An iterable can produce many iterators; an iterator holds position and is consumed once.)
- "Is a list an iterator?" (No — it is an iterable; `iter(list)` gives a fresh list-iterator each time.)
- "Why does looping over a file twice give nothing the second time?" (The file object *is* its own iterator, and it is already at the end; `seek(0)` resets it.)
- "How do you iterate a generator twice?" (You cannot — materialise it into a list, or rebuild the generator.)

#### Follow-up questions
- "What does `itertools.tee` do and what does it cost?" (Produces n independent iterators, buffering items consumed by one but not the others — potentially as much memory as a list.)
- "How do you check whether something is an iterator?" (`iter(x) is x`, or `isinstance(x, collections.abc.Iterator)`.)
- "What returns iterators in Python 3 that returned lists in Python 2?" (`map`, `filter`, `zip`, `range` — plus `dict.keys/values/items`, which return views.)

#### Edge cases
- `zip` consumes one item from each input before discovering the shortest is exhausted, so partially consumed inputs lose an element.
- Dict views are iterable but not iterators, and they reflect later mutations.
- Calling `list()` twice on the same `map` object returns data then nothing, with no error.

#### Common mistakes
- Passing a generator to two consumers.
- Assuming `map`/`zip` results can be indexed or re-iterated.
- Using `tee` on a large stream and running out of memory.

#### Comparisons

| | Iterable | Iterator |
|---|---|---|
| `__next__` | No | Yes |
| Reusable | Yes | No |
| `iter(x) is x` | False | True |

#### Complexity
`tee` costs memory proportional to the largest gap between the fastest and slowest consumer.

#### Frequently confused with
Iterables vs. iterators — the distinction behind most "my data disappeared" bugs.

#### Important facts to remember
- Iterators are single-use.
- Files are their own iterators.
- `map`/`filter`/`zip` are lazy in Python 3.

---

### 6.3 Generator Functions

#### Definition
A function containing `yield`; calling it returns a generator object whose body executes lazily, suspending at each `yield` with its frame preserved.

#### Why it exists
To produce sequences without materialising them — constant memory, early termination, and code that reads like the loop it replaces.

#### Interview explanation
Say that calling the function runs no code, that state lives in a heap-allocated frame, and that `return` sets `StopIteration.value`. The memory argument is the one interviewers want quantified: O(1) instead of O(n).

#### Syntax
```python
def gen():
    yield 1
    value = yield 2       # can also receive
    return "done"         # becomes StopIteration.value
```

#### Example
```python
def chunks(iterable, size):
    chunk = []
    for item in iterable:
        chunk.append(item)
        if len(chunk) == size:
            yield chunk
            chunk = []
    if chunk:
        yield chunk
```

#### Common interview questions
- "What happens when you call a generator function?" (It returns a generator object; no code in the body runs until you iterate it.)
- "Why use a generator instead of building a list?" (Constant memory, work done only as needed, and the ability to stop early or represent infinite sequences.)
- "What does `return` do inside a generator?" (Ends it and sets `StopIteration.value`, which `yield from` can capture.)
- "Can you iterate a generator twice?" (No — it is an iterator and is exhausted after one pass.)

#### Follow-up questions
- "What happens to a `with` block inside a generator that is never exhausted?" (Cleanup runs when the generator is closed or collected — non-deterministic, which is why explicit `close()` or full consumption matters.)
- "How do generators differ from coroutines?" (Native coroutines use `async def`/`await` and are driven by an event loop; generator-based coroutines were the pre-3.5 mechanism.)
- "How much memory does a generator use?" (One frame plus whatever its locals reference — independent of how many items it will yield.)

#### Edge cases
- A generator that raises `StopIteration` internally triggers `RuntimeError` under PEP 479.
- Exceptions inside a generator surface at the consuming `next()`, not at creation.
- A generator holding a file open keeps it open until exhausted, closed or garbage collected.

#### Common mistakes
- Expecting side effects to happen at call time.
- Returning a generator from a function whose `with` block has already closed the resource.
- Building a list from a generator immediately, discarding the benefit.

#### Comparisons

| | Generator | List-returning function |
|---|---|---|
| Memory | O(1) | O(n) |
| Reusable | No | Yes |
| Starts work | On first `next()` | Immediately |
| Early exit | Free | Wasted work |

#### Complexity
O(1) space for the generator; per-item cost is one frame resume.

#### Frequently confused with
Generator functions vs. generator objects — calling the first produces the second.

#### Important facts to remember
- Calling it runs nothing.
- Single-use, constant memory.
- `return` sets `StopIteration.value`.

---

### 6.4 Generator Expressions

#### Definition
A comprehension-shaped expression in parentheses that produces a lazy generator instead of a materialised container.

#### Why it exists
Because most comprehension results are consumed exactly once, and building the full list first wastes memory for no benefit.

#### Interview explanation
Contrast memory and reusability with a list comprehension, and mention the one eager part: the outermost iterable is evaluated when the expression is created.

#### Syntax
```python
(x * 2 for x in items)
sum(x * 2 for x in items)          # parentheses optional as sole argument
any(p(x) for x in items)           # short-circuits
```

#### Example
```python
# Reads a 10 GB file without loading it
line_count = sum(1 for _ in open("huge.log", encoding="utf-8"))

# Stops at the first match
first_error = next((line for line in log if "ERROR" in line), None)
```

#### Common interview questions
- "What is the difference between `[x for x in y]` and `(x for x in y)`?" (The first builds a list immediately; the second is a lazy generator using constant memory and consumable once.)
- "When is a generator expression the wrong choice?" (When the result is needed more than once, needs indexing, or needs `len()`.)
- "Is anything evaluated eagerly?" (Yes — the outermost iterable is evaluated at creation time.)
- "Why does `any(...)` with a generator expression stop early?" (It consumes lazily and returns as soon as a truthy item appears.)

#### Follow-up questions
- "Which is faster for small collections?" (A list comprehension — generators add per-item resume overhead, so laziness only pays off when memory or early exit matters.)
- "Can you use a generator expression as a function argument without extra parentheses?" (Only when it is the sole argument.)
- "How do you debug one?" (Materialise a slice: `list(islice(gen, 5))`.)

#### Edge cases
- Printing a generator expression shows the object, not the data.
- Reusing one after it is exhausted yields nothing, silently.
- Closures inside generator expressions capture variables late, exactly like loops.

#### Common mistakes
- Iterating the same generator expression twice.
- Using one where a list is needed for indexing or repeated access.
- Building a generator expression from a variable that changes before consumption.

#### Comparisons

| | List comprehension | Generator expression |
|---|---|---|
| Memory | O(n) | O(1) |
| Reusable | Yes | No |
| `len()` | Yes | No |
| Early exit | No benefit | Full benefit |

#### Complexity
O(1) memory, O(n) total time when fully consumed.

#### Frequently confused with
Parentheses as grouping vs. as a generator expression.

#### Important facts to remember
- Lazy, single-use, constant memory.
- Outer iterable is eager.
- Perfect for `sum`, `any`, `next`.

---

### 6.5 yield from and Delegation

#### Definition
`yield from iterable` yields every item of the iterable, and for sub-generators also forwards `send`, `throw` and `close`, and evaluates to the sub-generator's return value.

#### Why it exists
To compose generators correctly — a manual loop forwards values but breaks two-way communication and discards the return value.

#### Interview explanation
Give the recursion example first (flattening a nested structure), then state what a plain loop loses. PEP 380's role in enabling `asyncio` is the follow-up worth knowing.

#### Syntax
```python
yield from iterable           # yield every item
result = yield from subgen()  # also capture its return value
```

#### Example
```python
def walk(node):
    yield node
    for child in node.children:
        yield from walk(child)          # depth-first, lazily
```

#### Common interview questions
- "What does `yield from` do?" (Delegates to another iterable — yielding its items — and, for generators, forwards two-way operations and captures the return value.)
- "How is it different from `for x in sub: yield x`?" (The loop forwards values only; it breaks `send`/`throw`/`close` and loses the sub-generator's return value.)
- "Why does it matter historically?" (PEP 380 made generator delegation correct, which allowed `asyncio` coroutines to be built on generators before `async`/`await`.)
- "What is the return value used for?" (Sub-generator protocols — the inner generator computes a result and the outer one uses it.)

#### Follow-up questions
- "Can you `yield from` a list?" (Yes — any iterable works, though only generators support the two-way forwarding.)
- "What is the cost of deep delegation?" (A suspended frame per level, so very deep chains use proportional memory; CPython optimises the common forwarding path.)
- "How does it interact with `close()`?" (Closing the outer generator closes the inner one too.)

#### Edge cases
- `yield from` inside an `async def` is a syntax error — use `async for` or `await`.
- Exceptions thrown into the outer generator are raised at the inner generator's suspension point.
- Delegating to an already-exhausted generator yields nothing and returns `None`.

#### Common mistakes
- Manual re-yield loops in coroutine-style code.
- Expecting `yield from` to flatten arbitrarily nested data automatically (you still write the recursion).
- Using it in async code.

#### Comparisons

| | `yield from sub` | `for x in sub: yield x` |
|---|---|---|
| Values | Forwarded | Forwarded |
| `send`/`throw`/`close` | Forwarded | Lost |
| Return value | Captured | Lost |

#### Complexity
O(1) extra per item in the common case; O(depth) suspended frames for recursion.

#### Frequently confused with
`yield from` vs. `await` — related lineage, different protocols.

#### Important facts to remember
- Forwards two-way operations.
- Captures the sub-generator's return value.
- Not valid inside `async def`.

---

### 6.6 Comprehensions

#### Definition
Expression syntax that builds a list, set or dict from an iterable, with optional filtering and multiple `for` clauses, executed in its own scope.

#### Why it exists
Because building a collection with an accumulator and `append` is so common that dedicated syntax is shorter, faster and less error-prone.

#### Interview explanation
Cover the three forms, clause order in nested comprehensions, the `if`-before-`for` filter versus the `if/else`-before-`for` conditional expression, and the fact that the loop variable does not leak in Python 3.

#### Syntax
```python
[expr for x in it]                # list
{expr for x in it}                # set
{k: v for x in it}                # dict
[expr for x in it if cond]        # filter
[a if cond else b for x in it]    # conditional expression
[expr for x in xs for y in ys]    # nested: xs outer, ys inner
```

#### Example
```python
users = [{"id": 1, "name": "Ada"}, {"id": 2, "name": "Linus"}]

by_id = {u["id"]: u["name"] for u in users}
initials = {u["name"][0] for u in users}
flagged = [u["name"] for u in users if u["id"] > 1]
```

#### Common interview questions
- "What types of comprehension exist?" (List, set and dict — plus generator expressions, which use parentheses.)
- "Where does the filter go?" (`if` after the `for` clause filters; an `if/else` before the `for` is a conditional expression applied to every item.)
- "Does the loop variable leak?" (Not in Python 3 — comprehensions have their own scope. It did leak in Python 2.)
- "What is the order of nested `for` clauses?" (Same as nested loops read top to bottom: the first `for` is the outer loop.)

#### Follow-up questions
- "Are comprehensions faster than loops?" (Usually, because the build step uses a specialised opcode rather than an attribute lookup and method call per item.)
- "When should you not use one?" (When it has side effects, when it needs more than one condition and a nested loop, or when the source is large enough to need laziness.)
- "What is a dict comprehension with `zip` good for?" (Building a mapping from two parallel sequences: `{k: v for k, v in zip(keys, values)}`.)

#### Edge cases
- The first iterable is evaluated in the enclosing scope; the rest inside the comprehension's scope.
- Using the walrus operator inside a comprehension binds the name in the *enclosing* scope — a deliberate exception.
- Very large comprehensions build the entire result in memory before anything else runs.

#### Common mistakes
- Side-effect-only comprehensions that discard a list of `None`.
- Deeply nested comprehensions that need a comment to decode.
- Confusing filter position with conditional-expression position.

#### Comparisons

| | Comprehension | `map`/`filter` | Loop |
|---|---|---|---|
| Readability | High | Medium | High |
| Speed | High | High with C funcs | Lower |
| Side effects | Avoid | Avoid | Fine |

#### Complexity
O(n) time and O(n) memory for the built container.

#### Frequently confused with
Filtering `if` vs. conditional-expression `if/else` — different positions, different meanings.

#### Important facts to remember
- Own scope; no leaking.
- Filter `if` goes after the `for`.
- Never use them for side effects.

---

### 6.7 The itertools Module

#### Definition
A standard-library module of lazy, C-implemented iterator building blocks for chaining, slicing, grouping, combining and generating infinite sequences.

#### Why it exists
To provide correct, fast implementations of iteration patterns that are easy to write subtly wrong by hand.

#### Interview explanation
Name the handful you actually use — `chain`, `islice`, `groupby`, `zip_longest`, `accumulate`, `batched`, `count`/`cycle` — and be ready with the `groupby` sorting requirement, which is the classic gotcha.

#### Syntax
```python
chain(a, b); chain.from_iterable(list_of_lists)
islice(it, start, stop, step)
groupby(sorted_data, key=func)
zip_longest(a, b, fillvalue=None)
accumulate(nums); batched(it, n)      # batched: 3.12+
count(start, step); cycle(seq); repeat(obj, times)
```

#### Example
```python
from itertools import chain, groupby, islice

rows = sorted(rows, key=lambda r: r.country)
summary = {
    country: sum(r.total for r in group)
    for country, group in groupby(rows, key=lambda r: r.country)
}

head = list(islice(chain.from_iterable(pages), 100))    # first 100 across pages
```

#### Common interview questions
- "What does `groupby` require?" (Input sorted by the same key — it groups *consecutive* equal keys only.)
- "How do you take the first n items of a generator?" (`itertools.islice(gen, n)` — slicing does not work on iterators.)
- "How do you flatten a list of lists?" (`itertools.chain.from_iterable(lists)`, or a nested comprehension.)
- "What is `tee` for and what does it cost?" (Independent iterators over one source, buffering the gap between consumers — potentially large.)

#### Follow-up questions
- "Why is `zip_longest` needed?" (`zip` stops at the shortest input; `zip_longest` pads, and `zip(strict=True)` raises on mismatch in 3.10+.)
- "What is `batched`?" (3.12's chunking helper — fixed-size tuples from any iterable, replacing the old `zip(*[iter(it)]*n)` recipe.)
- "How would you do a sliding window?" (A bounded `deque`, or the `sliding_window` recipe / `more-itertools`.)

#### Edge cases
- A `groupby` group is invalidated as soon as you advance to the next group — materialise it first.
- `cycle` stores every item it has seen, so cycling a huge iterable is not memory-free.
- Combinatoric functions grow factorially; `permutations` of 12 items is nearly half a billion tuples.

#### Common mistakes
- `groupby` on unsorted data.
- Keeping a reference to a group iterator after advancing.
- Slicing an iterator with `[:n]` instead of `islice`.

#### Comparisons

| | `zip` | `zip_longest` | `zip(strict=True)` |
|---|---|---|---|
| Uneven input | Truncates | Pads | Raises |
| Version | Always | Always | 3.10+ |

#### Complexity
All lazy: O(1) memory except `tee`, `cycle` and the combinatoric generators.

#### Frequently confused with
`groupby` as SQL GROUP BY — Python's only groups adjacent runs.

#### Important facts to remember
- Sort before `groupby`.
- `islice` for slicing iterators.
- `batched` in 3.12+.

---

### 6.8 Lazy Evaluation and Pipelines

#### Definition
A chain of generators in which each stage pulls one item from the previous stage on demand, so no stage materialises its output.

#### Why it exists
To process data larger than memory, to make early termination free, and to keep transformation steps separate and composable.

#### Interview explanation
Describe the pull model, state the memory guarantee (O(1) regardless of input size), and flag the two real traps: errors surface at consumption, and resources opened inside the pipeline must outlive it.

#### Syntax
```python
lines = (l.strip() for l in open(path, encoding="utf-8"))
rows  = (parse(l) for l in lines if l)
valid = (r for r in rows if r.ok)
total = sum(r.amount for r in valid)      # nothing ran before this line
```

#### Example
```python
def read_csv(path):
    with open(path, encoding="utf-8") as fh:     # stays open while yielding
        for line in fh:
            yield line.rstrip("\n").split(",")

def process(path):
    rows = read_csv(path)
    header = next(rows)
    return sum(float(r[2]) for r in rows)
```

#### Common interview questions
- "How do you process a file too large for memory?" (Iterate it lazily — a generator pipeline keeps one row in memory at a time.)
- "When does a generator pipeline actually execute?" (When a consumer pulls from it — `for`, `sum`, `list`, `next`.)
- "What is the danger of returning a generator from a function with a `with` block?" (If the `with` closes before consumption, you read from a closed file; keep the `with` *inside* the generator.)
- "How do you limit a pipeline?" (`itertools.islice`, `takewhile`, or `break` in the consuming loop.)

#### Follow-up questions
- "Where do exceptions appear?" (At the consumption site, with the pipeline's frames in the traceback — which can be confusing to read.)
- "How do you add progress reporting?" (Wrap a stage in a generator that counts and logs every n items — it composes like any other stage.)
- "What if you need two passes?" (Materialise once into a list or a temporary file — you cannot re-run a consumed pipeline.)

#### Edge cases
- Pipelines defer all work, so timing measurements around construction record nothing.
- A generator abandoned mid-way runs its `finally` blocks only when closed or garbage collected.
- Mixing an eager step (`sorted`) into a pipeline forces full materialisation at that point.

#### Common mistakes
- Closing a resource before consuming the generator that reads it.
- Assuming a pipeline can be iterated twice.
- Sorting mid-pipeline and losing the memory guarantee without realising.

#### Comparisons

| | Eager (lists) | Lazy (generators) |
|---|---|---|
| Memory | O(n) per stage | O(1) |
| Early exit | Wasted work | Free |
| Debuggability | Easy | Harder |
| Reuse | Yes | No |

#### Complexity
O(1) memory, O(n) time when fully consumed.

#### Frequently confused with
Pipeline definition vs. execution — defining does no work.

#### Important facts to remember
- Nothing runs until consumed.
- Keep resources open inside the generator.
- Single-pass only.

---

### 6.9 Two-way Generators

#### Definition
Generators that both produce and receive values: `send()` resumes with a value, `throw()` raises inside, and `close()` raises `GeneratorExit` at the suspension point.

#### Why it exists
Because a resumable function that can accept input is a coroutine — the model `asyncio` was originally built on, and still useful for accumulators and protocol handlers.

#### Interview explanation
Explain that `yield` is an expression whose value comes from `send`, cover priming with `next()`/`send(None)`, and mention `close()` and `try/finally` for deterministic cleanup.

#### Syntax
```python
gen = coro()
next(gen)            # prime: run to the first yield
gen.send(value)      # value becomes the result of that yield
gen.throw(ValueError("x"))
gen.close()          # raises GeneratorExit inside
```

#### Example
```python
def batcher(size, flush):
    batch = []
    try:
        while True:
            item = yield
            batch.append(item)
            if len(batch) >= size:
                flush(batch); batch = []
    finally:
        if batch:
            flush(batch)          # runs on close() — no data lost

b = batcher(100, write_to_db)
next(b)
for item in stream: b.send(item)
b.close()
```

#### Common interview questions
- "What does `gen.send(value)` do?" (Resumes the generator, making `value` the result of the `yield` it is suspended at.)
- "Why must you prime a generator before sending?" (It has not reached a `yield` yet, so there is nowhere for the value to go — `send(None)` or `next()` first.)
- "What does `close()` do?" (Raises `GeneratorExit` at the suspension point, letting `finally` blocks clean up.)
- "How do these relate to async?" (They are the mechanism generator-based coroutines used before `async`/`await`; modern async code should use native coroutines.)

#### Follow-up questions
- "What happens if a generator yields after `GeneratorExit`?" (`RuntimeError: generator ignored GeneratorExit`.)
- "When is `finally` in a generator guaranteed to run?" (On exhaustion, on explicit `close()`, or when garbage collected — the last of which is not deterministic.)
- "Is this still worth using?" (For accumulators and pipelines yes; for concurrency, native coroutines are clearer and better supported.)

#### Edge cases
- `send` on an unprimed generator raises `TypeError`.
- Garbage collection calls `close()` at an unpredictable time, so relying on it for flushing loses data at shutdown.
- `throw()` into a generator that does not catch the exception propagates it to the caller and ends the generator.

#### Common mistakes
- Forgetting to prime.
- Relying on garbage collection to flush buffers.
- Writing new async code with generator-based coroutines.

#### Comparisons

| | Generator coroutine | Native coroutine |
|---|---|---|
| Syntax | `yield` / `send` | `async def` / `await` |
| Driven by | Your code | Event loop |
| Status | Legacy | Current |

#### Complexity
O(1) per resume; the generator's frame persists for its lifetime.

#### Frequently confused with
`send` as "passing arguments" — arguments go in the creating call.

#### Important facts to remember
- Prime before sending.
- `close()` triggers `finally`.
- Native coroutines for async work.

---

### 6.10 Infinite Sequences

#### Definition
Iterators that never raise `StopIteration` — `itertools.count`, `cycle`, `repeat`, and `while True` generators — consumed safely only by bounding them.

#### Why it exists
To model genuinely unbounded processes (IDs, schedules, polling, round-robin) without picking an arbitrary limit.

#### Interview explanation
Make the safety rule explicit: every infinite source needs a limiter — `islice`, `takewhile`, a finite `zip` partner, or `break` — and any eager operation on one hangs the process.

#### Syntax
```python
count(start=0, step=1)       # 0, 1, 2, …
cycle(iterable)              # repeats forever, caching items
repeat(obj, times=None)      # obj forever, or n times
islice(infinite, n)          # bound it
takewhile(pred, infinite)    # bound it by condition
```

#### Example
```python
from itertools import count, islice

def backoff_delays(base=0.5, cap=30):
    for attempt in count():
        yield min(cap, base * 2 ** attempt)

for delay in islice(backoff_delays(), 5):     # 0.5, 1, 2, 4, 8
    time.sleep(delay)
```

#### Common interview questions
- "How do you safely use an infinite generator?" (Bound consumption with `islice`, `takewhile`, `zip` against something finite, or `break`.)
- "What happens if you call `list()` on one?" (It consumes memory until the process is killed — Python does not detect it.)
- "Where are infinite sequences genuinely useful?" (ID generation, retry back-off schedules, round-robin scheduling, simulation clocks, polling loops.)
- "Does `cycle` use memory?" (Yes — it caches every item of the source so it can repeat them.)

#### Follow-up questions
- "How would you implement `count` yourself?" (A `while True` generator incrementing a counter and yielding it.)
- "What is the difference between `takewhile` and `filter`?" (`takewhile` stops at the first false result; `filter` skips it and keeps going — on an infinite source `filter` never ends.)
- "How do you combine an infinite sequence with a finite one?" (`zip` — it stops when the finite one does.)

#### Edge cases
- `sorted`, `max`, `min`, `sum` and `len` all hang on infinite input.
- `filter` over an infinite source is still infinite even if nothing matches.
- `enumerate` on an infinite iterator is also infinite — it is not a bound.

#### Common mistakes
- Printing or listing an infinite generator while debugging.
- Using `filter` where `takewhile` was meant.
- Forgetting that `cycle` retains the whole source.

#### Comparisons

| | `takewhile` | `filter` |
|---|---|---|
| On first false | Stops | Skips |
| Safe on infinite input | Yes | No |

#### Complexity
O(1) memory for `count`/`repeat`; `cycle` is O(n) in the source length.

#### Frequently confused with
`takewhile` vs. `filter` — the difference between terminating and not.

#### Important facts to remember
- Always pair with a limiter.
- Eager functions never return.
- `cycle` caches everything.

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

#### Definition
A decorator is a callable that takes a function (or class) and returns a replacement; `@deco` above a definition is syntax for rebinding the name to `deco(original)`.

#### Why it exists
To apply cross-cutting behaviour — logging, caching, timing, authorisation, retries — without modifying the function it wraps.

#### Interview explanation
Show the desugaring first, then write a wrapper with `*args, **kwargs` and `@functools.wraps`, and explain what `wraps` preserves. Mention that the decorator runs at import time while the wrapper runs per call.

#### Syntax
```python
@deco
def f(): ...
# f = deco(f)

@a
@b
def g(): ...
# g = a(b(g)) — applied bottom-up
```

#### Example
```python
import functools

def requires_auth(func):
    @functools.wraps(func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            raise PermissionDenied
        return func(request, *args, **kwargs)
    return wrapper
```

#### Common interview questions
- "What is a decorator?" (A callable taking a function and returning a replacement, applied with `@` at definition time.)
- "Why is `functools.wraps` necessary?" (Without it the wrapper's `__name__`, `__doc__`, annotations and signature replace the original's, breaking introspection, documentation and frameworks.)
- "In what order do stacked decorators apply?" (Bottom-up at definition; the topmost wrapper is outermost, so it executes first at call time.)
- "When does the decorator itself run?" (Once, when the module is imported and the `def` executes.)

#### Follow-up questions
- "How do you decorate a method?" (The same way — the wrapper receives `self` as its first positional argument.)
- "How do you access the original function afterwards?" (`wrapper.__wrapped__`, set by `functools.wraps`.)
- "Can a decorator return something that is not a function?" (Yes — any object; `property`, `staticmethod` and class-based decorators all do.)

#### Edge cases
- Decorating with `@staticmethod` or `@classmethod` requires them to be outermost.
- A decorator that swallows exceptions changes the contract of everything it wraps.
- Decorators applied to generators wrap the *generator function*, not each yield.

#### Common mistakes
- Forgetting `@wraps`.
- Decorators that do expensive work at import time and slow start-up.
- Wrappers that drop `**kwargs` and break keyword callers.

#### Comparisons

| | Decorator | Manual wrapper call |
|---|---|---|
| Applied | Declaratively at definition | Explicitly at the call site |
| Visibility | Above the function | Wherever you remember |
| Composition | Stackable | Nested calls |

#### Complexity
One extra Python call per invocation — negligible unless the wrapped function is tiny and hot.

#### Frequently confused with
Decorator execution time vs. wrapper execution time.

#### Important facts to remember
- `@deco` is `f = deco(f)`.
- Always `functools.wraps`.
- Stacking applies bottom-up.

---

### 7.2 Decorators with Arguments

#### Definition
A decorator factory: a function that takes configuration and returns a decorator, which then takes the function and returns a wrapper.

#### Why it exists
Because cross-cutting behaviour usually needs parameters, and one configurable decorator is better than a family of near-identical ones.

#### Interview explanation
Name the three layers explicitly — factory, decorator, wrapper — and mention the classic `@retry` versus `@retry()` mistake plus the keyword-only trick that prevents it.

#### Syntax
```python
def factory(config):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs): ...
        return wrapper
    return decorator

@factory("value")
def f(): ...
```

#### Example
```python
def rate_limit(*, per_minute):          # keyword-only: @rate_limit fails loudly
    def decorator(func):
        calls = deque()
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            now = time.monotonic()
            while calls and now - calls[0] > 60:
                calls.popleft()
            if len(calls) >= per_minute:
                raise TooManyRequests
            calls.append(now)
            return func(*args, **kwargs)
        return wrapper
    return decorator
```

#### Common interview questions
- "How do you write a decorator that takes arguments?" (A function returning a decorator — three nested levels: configuration, function, call.)
- "What goes wrong with `@retry` instead of `@retry()`?" (The function itself is bound to the first configuration parameter, and the error appears later and makes no sense.)
- "How do you support both forms?" (Check whether the sole argument is callable and branch, or make configuration keyword-only so the mistake fails immediately.)
- "Where does per-decoration state live?" (In the closure created by the decorator — one copy per decorated function.)

#### Follow-up questions
- "Class-based or function-based?" (A class with `__init__` and `__call__` is often more readable and gives the decorator inspectable state.)
- "How do you test a parameterised decorator?" (Apply it to a trivial function in the test and assert on behaviour and on `__name__`/signature preservation.)
- "Does the configuration evaluate once?" (Yes — at import time, when the factory is called.)

#### Edge cases
- Mutable state in the closure is shared by every call to that decorated function, including across threads.
- Decorating methods means the closure state is shared across all instances.
- Stacking a parameterised decorator with `@staticmethod` requires careful ordering.

#### Common mistakes
- Missing parentheses.
- Shared mutable state that should have been per-instance.
- Rebuilding expensive configuration inside the wrapper instead of the factory.

#### Comparisons

| | Function factory | Class-based |
|---|---|---|
| Readability | Three nested defs | Two methods |
| State | Closure cells | Attributes |
| Introspection | Harder | Easy |

#### Frequently confused with
`@deco` vs. `@deco()` — the single most common decorator bug.

#### Important facts to remember
- Three layers: config, function, call.
- Keyword-only config prevents the missing-parens bug.
- Closure state is shared per decoration.

---

### 7.3 Class Decorators

#### Definition
A callable that receives a class object after it is created and returns what the class name should be bound to.

#### Why it exists
To modify or register classes at definition time with far less machinery than a metaclass.

#### Interview explanation
Give `@dataclass` and `@total_ordering` as the canonical examples, then the key distinction: class decorators are not inherited, metaclasses are.

#### Syntax
```python
def decorator(cls):
    cls.extra = "added"
    return cls          # forgetting this binds the name to None

@decorator
class C: ...
```

#### Example
```python
def singleton(cls):
    instances = {}
    @functools.wraps(cls, updated=())
    def get_instance(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)
        return instances[cls]
    return get_instance
```

#### Common interview questions
- "What is a class decorator?" (A function taking a class and returning a replacement — used for registration, adding methods or validation.)
- "Give a standard-library example." (`@dataclass`, `@functools.total_ordering`, `@typing.final`.)
- "Class decorator or metaclass?" (Decorator unless you need the behaviour inherited by subclasses or need to alter the class namespace during creation.)
- "What happens if the decorator forgets to return the class?" (The name becomes `None`, and the first use fails with a confusing `TypeError`.)

#### Follow-up questions
- "Do class decorators apply to subclasses?" (No — each subclass must be decorated, which is exactly when `__init_subclass__` is the better tool.)
- "Can a class decorator return a different type?" (Yes — the singleton example returns a function, which is legal but confuses type checkers.)
- "How do they compose?" (Stacked bottom-up, like function decorators.)

#### Edge cases
- Returning a non-class breaks `isinstance` checks and typing.
- Decorating a class whose metaclass validates may run the validation before your changes.
- `functools.wraps` on a class needs `updated=()` because classes have no writable `__dict__` attribute to update.

#### Common mistakes
- Missing `return cls`.
- Expecting inheritance.
- Using a decorator where the framework already offers a hook.

#### Comparisons

| | Class decorator | Metaclass | `__init_subclass__` |
|---|---|---|---|
| Inherited | No | Yes | Yes |
| Complexity | Low | High | Low |
| Alters namespace | No | Yes | No |

#### Frequently confused with
Class decorators vs. metaclasses — inheritance is the deciding difference.

#### Important facts to remember
- Runs after the class exists.
- Not inherited.
- Must return the class.

---

### 7.4 Context Managers

#### Definition
An object implementing `__enter__` and `__exit__`, used with `with` to guarantee paired setup and teardown on every exit path.

#### Why it exists
To make resource cleanup automatic and exception-safe, replacing error-prone `try/finally` repetition.

#### Interview explanation
Describe the protocol including `__exit__`'s three arguments and the suppression rule, then note that multiple managers in one `with` enter left to right and exit right to left.

#### Syntax
```python
with open(p) as f: ...
with a() as x, b() as y: ...          # nested ordering
with (
    open(p1) as f1,
    open(p2) as f2,
): ...                                 # parenthesised form, 3.10+
```

#### Example
```python
class FileLock:
    def __init__(self, path): self.path = path
    def __enter__(self):
        self.fd = os.open(self.path, os.O_CREAT | os.O_EXCL)
        return self
    def __exit__(self, exc_type, exc, tb):
        os.close(self.fd); os.unlink(self.path)
        return False            # do not suppress
```

#### Common interview questions
- "What methods does a context manager need?" (`__enter__`, returning the value bound by `as`, and `__exit__(exc_type, exc_value, traceback)`.)
- "How does a context manager suppress an exception?" (By returning a truthy value from `__exit__`.)
- "Does `__exit__` run if the block raises?" (Yes — and if it returns, breaks or continues.)
- "What order do multiple managers exit in?" (Reverse of entry: last entered, first exited.)

#### Follow-up questions
- "What happens if `__enter__` raises?" (`__exit__` is not called, because the block was never entered — resources acquired inside `__enter__` must be cleaned up there.)
- "How do you write one with a generator?" (`@contextlib.contextmanager` with exactly one `yield`.)
- "Are context managers reusable or reentrant?" (Not necessarily; generator-based ones are single-use, and reentrancy must be designed for — `threading.RLock` is reentrant, most managers are not.)

#### Edge cases
- Returning any truthy value from `__exit__` — including a value returned incidentally by the last statement — swallows exceptions.
- An exception raised in `__exit__` replaces the original, which becomes its `__context__`.
- `with` on an object lacking the protocol raises `TypeError` before running the block.

#### Common mistakes
- Accidentally suppressing exceptions.
- Acquiring a resource before `__enter__` and leaking it when `__enter__` fails.
- Using `try/finally` where a context manager already exists.

#### Comparisons

| | `with` | `try/finally` |
|---|---|---|
| Cleanup location | With the setup | At the call site, every time |
| Reusable | Yes | Copy-pasted |
| Suppression | Possible | Explicit |

#### Frequently confused with
`__exit__` returning `None` (propagate) vs. returning `True` (suppress).

#### Important facts to remember
- `__exit__` always runs once entered.
- Truthy return suppresses.
- Multiple managers unwind in reverse.

---

### 7.5 The contextlib Module

#### Definition
Standard-library helpers for context managers: `@contextmanager`, `suppress`, `closing`, `ExitStack`, `nullcontext`, `redirect_stdout` and async variants.

#### Why it exists
Because most context managers are a simple setup/teardown pair, and a generator expresses that more clearly than a two-method class.

#### Interview explanation
Explain the `@contextmanager` shape — before the `yield` is enter, after is exit, wrapped in `try/finally` — then `ExitStack` as the answer for a dynamic number of resources.

#### Syntax
```python
@contextmanager
def managed():
    setup()
    try:
        yield resource
    finally:
        teardown()

with suppress(FileNotFoundError): os.remove(p)
with ExitStack() as stack:
    files = [stack.enter_context(open(p)) for p in paths]
```

#### Example
```python
from contextlib import contextmanager

@contextmanager
def transaction(conn):
    conn.execute("BEGIN")
    try:
        yield conn
    except Exception:
        conn.execute("ROLLBACK")
        raise
    else:
        conn.execute("COMMIT")
```

#### Common interview questions
- "How do you turn a generator into a context manager?" (Decorate it with `@contextlib.contextmanager` and yield exactly once.)
- "Where does the `with` body run?" (At the `yield` — everything before is `__enter__`, everything after is `__exit__`.)
- "What is `ExitStack` for?" (Entering a number of context managers decided at runtime, unwinding them all correctly.)
- "What does `suppress` do?" (Ignores the listed exception types for the block — EAFP with less syntax.)

#### Follow-up questions
- "Why must the generator yield exactly once?" (Zero or more than one yield means `__exit__` cannot be defined, and Python raises `RuntimeError`.)
- "How do you handle exceptions in a generator-based manager?" (They are raised at the `yield`, so wrap it in `try/except/finally`.)
- "What is `nullcontext`?" (A no-op manager, used so optional resources do not require branching on the `with` statement.)

#### Edge cases
- A generator-based manager is single-use; reusing the same object raises `RuntimeError`.
- `suppress` swallows the exception for the whole block, so keep the block to one statement.
- `ExitStack.callback` registers plain functions, useful for cleanup that is not a context manager.

#### Common mistakes
- Reusing one `@contextmanager` instance twice.
- Overly broad `suppress` blocks.
- Writing a class where the generator form would be three lines.

#### Comparisons

| | Class-based | `@contextmanager` |
|---|---|---|
| Lines of code | More | Fewer |
| Reusable instance | Yes | No |
| Readability | Split across methods | Linear |

#### Frequently confused with
`suppress` vs. `except: pass` — same effect, but `suppress` names the exception and scopes it tightly.

#### Important facts to remember
- Exactly one `yield`.
- `ExitStack` for dynamic resources.
- Generator managers are single-use.

---

### 7.6 Metaclasses

#### Definition
The class of a class: the callable — `type` by default — that receives the name, bases and namespace produced by a `class` statement and builds the class object.

#### Why it exists
To let frameworks validate, register or transform classes at creation time, with the behaviour inherited by every subclass.

#### Interview explanation
Walk the creation sequence (body → namespace → `metaclass.__new__` → `__init__`), state that instantiation goes through `metaclass.__call__`, and then say plainly that `__init_subclass__` replaces most legitimate uses.

#### Syntax
```python
class Meta(type):
    def __new__(mcls, name, bases, ns, **kwargs): ...
    def __init__(cls, name, bases, ns, **kwargs): ...
    def __call__(cls, *args, **kwargs): ...     # controls instantiation

class C(metaclass=Meta): ...
```

#### Example
```python
class SingletonMeta(type):
    _instances = {}
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]

class Settings(metaclass=SingletonMeta): ...
```

#### Common interview questions
- "What is a metaclass?" (The class of a class — what builds the class object when a `class` statement executes.)
- "What is the default metaclass?" (`type`, which is also its own metaclass.)
- "When would you actually use one?" (ORM field collection, abstract-method enforcement via `ABCMeta`, enum creation, framework-wide class validation — and rarely anywhere else.)
- "What is a metaclass conflict?" (Combining bases whose metaclasses are unrelated; Python refuses to create the class.)

#### Follow-up questions
- "What is the difference between `__new__` on a metaclass and on a class?" (On a metaclass it creates the *class*; on a class it creates the *instance*.)
- "How does `__prepare__` help?" (It returns the mapping used for the class body, so ordering or duplicate detection can be customised — enums use it.)
- "Why prefer `__init_subclass__`?" (Same registration and validation power, no metaclass conflicts, far easier to read.)

#### Edge cases
- The metaclass is inherited, so every subclass gets it whether or not that was intended.
- `type(obj)` and `obj.__class__` can differ if `__class__` is overridden — reflection code must pick deliberately.
- Metaclasses interact awkwardly with `typing`, dataclasses and pickling.

#### Common mistakes
- Using a metaclass for something a class decorator would do.
- Forgetting to call `super().__new__` in the metaclass.
- Creating library classes with custom metaclasses that then conflict with users' base classes.

#### Comparisons

| | Metaclass | Class decorator |
|---|---|---|
| Runs | During creation | After creation |
| Inherited | Yes | No |
| Conflicts | Possible | None |

#### Frequently confused with
Metaclass `__call__` (instance creation) vs. `__new__` (class creation).

#### Important facts to remember
- A class is an instance of its metaclass.
- `type` is the default.
- Prefer `__init_subclass__`.

---

### 7.7 init_subclass and set_name

#### Definition
PEP 487 hooks: `__init_subclass__` runs on a base class each time it is subclassed; `__set_name__` runs on class attributes when the owning class is created.

#### Why it exists
To make subclass registration, validation and descriptor naming possible without writing a metaclass.

#### Interview explanation
Show registration with `__init_subclass__` — including the class keyword arguments it can accept — and descriptor naming with `__set_name__`, then state that together they cover the majority of former metaclass use cases.

#### Syntax
```python
class Base:
    def __init_subclass__(cls, /, key=None, **kwargs):
        super().__init_subclass__(**kwargs)
        ...

class Child(Base, key="abc"): ...      # keyword passed to the hook

class Field:
    def __set_name__(self, owner, name): self.name = name
```

#### Example
```python
class Serializer:
    registry = {}
    def __init_subclass__(cls, /, fmt, **kwargs):
        super().__init_subclass__(**kwargs)
        if not hasattr(cls, "dump"):
            raise TypeError(f"{cls.__name__} must define dump()")
        Serializer.registry[fmt] = cls

class JsonSerializer(Serializer, fmt="json"):
    def dump(self, obj): ...
```

#### Common interview questions
- "What is `__init_subclass__`?" (An implicit classmethod on a base class, called with each new subclass — used for registration and validation.)
- "What is `__set_name__` for?" (It tells a descriptor the attribute name it was assigned to, removing the need to repeat the name in its constructor.)
- "Why do these exist?" (PEP 487 — to replace the common metaclass patterns with simpler, conflict-free hooks.)
- "Must you call `super()` in `__init_subclass__`?" (Yes — otherwise other base classes' hooks are skipped.)

#### Follow-up questions
- "Is `__init_subclass__` called for the defining class itself?" (No — only for subclasses.)
- "Can it accept arguments?" (Yes — class keyword arguments, as in `class C(Base, key='x')`.)
- "What can it not do?" (Change the class namespace during creation — the class already exists when it runs.)

#### Edge cases
- It is implicitly a classmethod; decorating it with `@classmethod` is unnecessary and the signature uses `cls`.
- `__set_name__` failures are wrapped in a `RuntimeError` during class creation.
- Deep hierarchies run the hook once per subclass, including intermediate abstract ones.

#### Common mistakes
- Omitting the `super()` call.
- Expecting the hook on the base class itself.
- Registering abstract intermediates alongside concrete classes.

#### Comparisons

| | `__init_subclass__` | Metaclass |
|---|---|---|
| Complexity | Low | High |
| Conflicts | None | Possible |
| Namespace control | No | Yes |

#### Frequently confused with
`__init_subclass__` vs. `__subclasshook__` — the latter customises `issubclass` for ABCs.

#### Important facts to remember
- PEP 487, Python 3.6+.
- Always call `super()`.
- Covers most metaclass use cases.

---

### 7.8 Dynamic Attributes

#### Definition
Customising attribute access through `__getattr__` (fallback), `__getattribute__` (every access), `__setattr__`, `__delattr__` and `__dir__`.

#### Why it exists
Because some objects' attributes are determined at runtime — configuration, API responses, ORM rows, proxies — and attribute syntax is the natural interface for them.

#### Interview explanation
Draw the distinction between fallback and total interception, then warn about recursion inside `__setattr__`/`__getattribute__` and the fact that implicit dunder lookups bypass both.

#### Syntax
```python
def __getattr__(self, name): ...            # only when lookup fails
def __getattribute__(self, name): ...       # every access — use super() inside
def __setattr__(self, name, value):
    object.__setattr__(self, name, value)   # avoid recursion
```

#### Example
```python
class LazyClient:
    def __init__(self, factory):
        object.__setattr__(self, "_factory", factory)
        object.__setattr__(self, "_client", None)

    def __getattr__(self, name):
        if self._client is None:
            object.__setattr__(self, "_client", self._factory())
        return getattr(self._client, name)      # connect on first real use
```

#### Common interview questions
- "When is `__getattr__` called?" (Only when normal attribute lookup fails.)
- "How is `__getattribute__` different?" (It intercepts every access, including successful ones, and must delegate to `super()` to avoid infinite recursion.)
- "How do you avoid recursion in `__setattr__`?" (Use `object.__setattr__(self, name, value)` or write directly to `self.__dict__`.)
- "Do these hooks intercept dunder methods?" (No — implicit special-method lookups go straight to the type.)

#### Follow-up questions
- "What should `__getattr__` raise for a missing name?" (`AttributeError` — anything else breaks `hasattr`, `getattr` defaults, `copy` and `pickle`.)
- "How do you build a proxy that forwards everything?" (Forward ordinary attributes via `__getattr__` and define each needed dunder explicitly.)
- "What is the performance cost?" (`__getattr__` costs nothing on the success path; `__getattribute__` adds a Python call to *every* access.)

#### Edge cases
- `copy` and `pickle` call `__reduce_ex__` and `__getstate__`, which a careless `__getattr__` can intercept and break.
- Defining `__getattr__` can mask genuine `AttributeError`s raised inside properties.
- `dir()` will not list dynamic names unless `__dir__` is implemented.

#### Common mistakes
- Raising `KeyError` from `__getattr__`.
- Infinite recursion by touching `self.x` inside the hooks.
- Overriding `__getattribute__` where `__getattr__` was sufficient.

#### Comparisons

| | `__getattr__` | `__getattribute__` |
|---|---|---|
| Frequency | On miss | Always |
| Recursion risk | Low | High |
| Cost | None on hit | Per access |

#### Complexity
`__getattribute__` adds one Python-level call per attribute access — significant in hot code.

#### Frequently confused with
The two hooks' names — one letter apart, very different behaviour.

#### Important facts to remember
- `__getattr__` is a fallback.
- Raise `AttributeError`.
- Dunders bypass both hooks.

---

### 7.9 Reflection

#### Definition
Runtime inspection and manipulation of objects, types and functions through `type`, `getattr`/`setattr`, `dir`, `vars`, `isinstance` and the `inspect` module.

#### Why it exists
So generic tools — test runners, serialisers, injectors, admin interfaces — can work with code they were never written against.

#### Interview explanation
List the core built-ins and what each returns, then give a real framework example (pytest fixtures, dataclass field walking) and finish with the security rule: never build attribute names from untrusted input.

#### Syntax
```python
type(obj); isinstance(obj, C); issubclass(A, B)
getattr(obj, "name", default); setattr(obj, "name", v); hasattr(obj, "name")
vars(obj); dir(obj)
inspect.signature(f); inspect.getmembers(obj, predicate)
```

#### Example
```python
def diff(before, after):
    """Field-level diff of two objects of the same class."""
    return {
        name: (getattr(before, name), getattr(after, name))
        for name in vars(before)
        if getattr(before, name) != getattr(after, name, None)
    }
```

#### Common interview questions
- "What is the difference between `type(x) == C` and `isinstance(x, C)`?" (`isinstance` accepts subclasses and respects ABC registration; exact type checks reject subclasses and usually indicate a design problem.)
- "What does `vars(obj)` return?" (The instance `__dict__` — which does not exist for objects using `__slots__`.)
- "How do frameworks discover your code?" (Reflection: naming conventions, signature inspection, annotations and registration hooks.)
- "What is the risk of `getattr(obj, user_input)`?" (Attribute disclosure or mass assignment — an attacker chooses which attribute to read or write.)

#### Follow-up questions
- "Does `dir()` show everything?" (No — it shows what `__dir__` reports, and misses attributes produced dynamically by `__getattr__`.)
- "How do you inspect a class hierarchy?" (`cls.__mro__`, `cls.__subclasses__()`, `inspect.getmro`.)
- "When should reflection be avoided?" (In application logic, where explicit code is clearer and tooling can follow it.)

#### Edge cases
- `hasattr` swallows exceptions from properties, reporting `False` for a broken attribute.
- `vars()` fails on slotted objects with `TypeError`.
- `inspect.getsource` fails for code defined in the REPL or generated by `exec`.

#### Common mistakes
- `type(x) == SomeClass` instead of `isinstance`.
- Attribute names taken from request data.
- Reflection in hot loops, where it is far slower than direct access.

#### Comparisons

| | `getattr` with default | `hasattr` then access |
|---|---|---|
| Lookups | One | Two |
| Property errors | Propagated | Swallowed |
| Preferred | Yes | No |

#### Frequently confused with
Reflection vs. introspection — used interchangeably in Python; introspection reads, reflection also modifies.

#### Important facts to remember
- `isinstance` over exact type checks.
- Never use untrusted attribute names.
- `hasattr` hides real errors.

---

### 7.10 exec, eval and Code Generation

#### Definition
`eval` evaluates an expression string, `exec` executes statement strings, and `compile` produces the code objects both run — the basis of runtime code generation.

#### Why it exists
Because generated code runs at full speed, which is why `dataclasses`, `attrs`, `namedtuple` and Pydantic build methods as source text and compile them at class creation.

#### Interview explanation
State the difference between `exec` and `eval`, explain why the standard library uses them (performance of generated methods), and then be unambiguous: there is no safe way to `eval` untrusted input, and restricted globals do not fix it.

#### Syntax
```python
eval("2 + 2")                     # expression → value
exec("x = 2 + 2")                 # statements → None
compile(src, "<generated>", "exec")
ast.literal_eval("{'a': 1}")      # safe: literals only
```

#### Example
```python
import ast

# Safe parsing of a literal from configuration
value = ast.literal_eval(raw)       # dicts, lists, numbers, strings, bools, None

# Unsafe — never do this with external input
value = eval(raw)                   # arbitrary code execution
```

#### Common interview questions
- "What is the difference between `exec` and `eval`?" (`eval` takes a single expression and returns its value; `exec` runs statements and returns `None`.)
- "Why is `eval` dangerous?" (Any string it runs is code; with user input it is remote code execution, and restricting globals does not prevent escapes via object attributes.)
- "What should you use instead?" (`ast.literal_eval` for literals, `json.loads` for JSON, `int`/`float` for numbers, a dispatch dict for named operations.)
- "Why does `dataclasses` use `exec`?" (Generated `__init__` and `__eq__` run at full native speed, unlike reflective equivalents that would introspect on every call.)

#### Follow-up questions
- "How do sandbox escapes work?" (Through the object graph: from any object you can reach `__class__`, `__bases__`, `__subclasses__` and from there to builtins.)
- "What are the debugging costs?" (Tracebacks point at `<string>`, linters and type checkers see nothing, and debuggers cannot step into generated code.)
- "How do you make generated code debuggable?" (Give `compile` a meaningful filename and keep the generated source available, as `attrs` and `dataclasses` do with `linecache` tricks.)

#### Edge cases
- `exec` with separate `globals`/`locals` dicts behaves differently from module scope — comprehensions and closures may not see names you expect.
- `eval` of a very long numeric literal can be slow enough to be a denial-of-service vector.
- `ast.literal_eval` still parses, so deeply nested input can exhaust the stack.

#### Common mistakes
- Parsing configuration with `eval`.
- Believing restricted globals are a sandbox.
- Generating code where a dictionary of functions would do.

#### Comparisons

| | `eval` | `ast.literal_eval` |
|---|---|---|
| Accepts | Any expression | Literals only |
| Safe with untrusted input | No | Yes (bound the size) |
| Typical use | Code generation | Config and data parsing |

#### Frequently confused with
`eval` as "parse" — it is "execute".

#### Important facts to remember
- `eval` on external input is RCE.
- `ast.literal_eval` for data.
- Code generation is for *your* templates.

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

#### Definition
A module is a namespace produced by executing a `.py` file once; the import system finds it, loads it, caches it in `sys.modules` and binds it to a name.

#### Why it exists
To give code a reusable namespace and a caching layer, so a file's top-level work happens once per process no matter how many modules import it.

#### Interview explanation
Walk the sequence — `sys.modules` check, finders, loader, cache, bind — and then state the consequence interviewers are after: module-level code runs once, so module state is effectively a process-wide singleton.

#### Syntax
```python
import package.module
from package import module
from package.module import name as alias
importlib.import_module("package.module")     # dynamic, by string
```

#### Example
```python
# config.py — module-level state acts as a singleton
_settings = None

def get_settings():
    global _settings
    if _settings is None:
        _settings = load()          # runs once per process
    return _settings
```

#### Common interview questions
- "What happens the second time you import a module?" (It is found in `sys.modules` and simply bound — the file is not executed again.)
- "How do you implement a singleton in Python?" (A module-level object is the idiomatic answer; the module cache guarantees one instance per process.)
- "How do you import a module whose name is known only at runtime?" (`importlib.import_module(name)` — never `eval` or `__import__` string tricks.)
- "What is an import side effect?" (Work performed at module top level — connections, file reads, registrations — that happens merely because something imported the file.)

#### Follow-up questions
- "Does `importlib.reload` fully reload?" (No — existing references still point at the old objects, so it is unreliable outside interactive use.)
- "Can the same file be loaded twice?" (Yes — under two different module names, e.g. via different `sys.path` entries, producing two distinct classes that fail `isinstance`.)
- "Why is import time a production concern?" (Serverless cold starts and CLI responsiveness are dominated by imports; `-X importtime` measures it.)

#### Edge cases
- Failed imports can leave a partially initialised module in `sys.modules` in some scenarios, making the next import behave oddly.
- `from x import y` binds `y` immediately, so later rebinding of `x.y` is not seen by the importer.
- Modules imported under two names break `isinstance` checks against classes from "the other" copy.

#### Common mistakes
- Expensive work at import time.
- Relying on `reload` in a running service.
- Mutable module-level state shared across requests without synchronisation.

#### Comparisons

| | `import x` | `from x import y` |
|---|---|---|
| Binds | The module | The attribute, now |
| Sees later rebinding | Yes | No |
| Circular-import tolerance | Higher | Lower |

#### Complexity
First import: compile plus execute. Later imports: one dictionary lookup.

#### Frequently confused with
Module caching vs. reloading.

#### Important facts to remember
- Modules execute once per process.
- `sys.modules` is the cache.
- `from x import y` snapshots the name.

---

### 8.2 Packages

#### Definition
A directory importable as a unit; with `__init__.py` it is a regular package whose namespace is that file's namespace.

#### Why it exists
To organise large codebases hierarchically and to define a deliberate public surface rather than exposing every module.

#### Interview explanation
Explain that importing `a.b.c` executes each `__init__.py` down the chain, and that this is why heavy `__init__` files slow everything. Mention `__all__` as the export contract for `from package import *` and for documentation tools.

#### Syntax
```python
# myapp/__init__.py
from .client import Client
__all__ = ["Client"]
```

#### Example
```python
# Lazy attribute to keep a heavy optional dependency out of import time
def __getattr__(name):                 # module-level __getattr__, PEP 562
    if name == "DataFrameExporter":
        from .pandas_export import DataFrameExporter
        return DataFrameExporter
    raise AttributeError(name)
```

#### Common interview questions
- "What does `__init__.py` do?" (Runs when the package is first imported and defines the package namespace; it also marks a regular, non-namespace package.)
- "Is `__init__.py` still required?" (Not since PEP 420 — a directory without one becomes a namespace package — but regular packages are still the norm for applications.)
- "What is `__all__`?" (The list of names exported by `from package import *`, and a documented public API.)
- "Why keep `__init__.py` small?" (Everything it imports loads whenever any submodule is imported, inflating start-up cost and creating cycles.)

#### Follow-up questions
- "How do you make an import lazy?" (Module-level `__getattr__` (PEP 562), or importing inside the function that needs it.)
- "How should a library structure its public API?" (Re-export a small set of names in `__init__.py`, keep everything else private, and document the boundary.)
- "What is `__init__.py` versus `__main__.py`?" (The first runs on import, the second runs on `python -m package`.)

#### Edge cases
- A subpackage without `__init__.py` inside a regular package still imports as a namespace package — and often ships empty, because packaging tools skip it.
- Re-exporting in `__init__.py` can create cycles between submodules.
- `from package import *` without `__all__` exports every public name, including imported ones.

#### Common mistakes
- Heavyweight `__init__.py`.
- Missing `__init__.py` in a distributed package, so files are silently absent from the wheel.
- Treating `__all__` as enforcement rather than convention.

#### Comparisons

| | Regular package | Namespace package |
|---|---|---|
| `__init__.py` | Present | Absent |
| Split across dirs | No | Yes |
| Typical use | Applications, libraries | Shared org namespaces |

#### Frequently confused with
`__init__.py` (import) vs. `__main__.py` (execution).

#### Important facts to remember
- `__init__.py` runs on first import.
- Keep it light.
- PEP 562 gives lazy module attributes.

---

### 8.3 Absolute and Relative Imports

#### Definition
Absolute imports name the full dotted path from `sys.path`; relative imports use leading dots to resolve against the current module's package.

#### Why it exists
Absolute imports are explicit and searchable; relative imports keep a package self-contained when it is renamed or vendored.

#### Interview explanation
State PEP 8's preference for absolute imports with relative accepted inside a package, then explain the script-execution failure — `__package__` is `None`, so relative imports cannot resolve — and that `python -m` is the fix.

#### Syntax
```python
from myapp.models import User      # absolute
from .models import User           # same package
from ..core import settings        # parent package
```

#### Example
```bash
python myapp/api/routes.py        # relative imports fail: no parent package
python -m myapp.api.routes        # works: __package__ is 'myapp.api'
```

#### Common interview questions
- "What is the difference between absolute and relative imports?" (Absolute resolves from the path root; relative resolves from the importing module's package using dots.)
- "Why does a relative import fail when I run the file directly?" (Direct execution makes the module `__main__` with no parent package, so there is nothing to resolve the dots against.)
- "Which does PEP 8 recommend?" (Absolute, with relative imports acceptable for intra-package references, especially deep ones.)
- "What happened to implicit relative imports?" (Removed in Python 3 — `import models` inside a package no longer finds a sibling module.)

#### Follow-up questions
- "How many dots can you use?" (As many as the hierarchy allows; more than two is a sign the package structure is too deep.)
- "Do relative imports work at the top level of a project?" (No — a top-level module has no parent package.)
- "How do you test a package that uses relative imports?" (Install it, ideally with `pip install -e .`, and let the test runner import it as a package.)

#### Edge cases
- `python -m` adds the current directory to `sys.path`, which can change which copy of a package is imported.
- Relative imports in a module that is later moved to the top level break silently at import time.
- Mixing both styles for the same module can create two module objects if the paths differ.

#### Common mistakes
- Running package modules as scripts.
- Deep relative chains (`from ....core import x`).
- Assuming implicit relative imports still work.

#### Comparisons

| | Absolute | Relative |
|---|---|---|
| Grep-friendly | Yes | Less |
| Survives package rename | No | Yes |
| Works when run directly | Yes | No |

#### Frequently confused with
`python file.py` vs. `python -m package.module` — different `__package__`, different import behaviour.

#### Important facts to remember
- Prefer absolute; relative is fine inside a package.
- `-m` sets the package context.
- Implicit relative imports are gone.

---

### 8.4 sys.path and Module Resolution

#### Definition
The ordered list of directories Python searches for modules, consulted after the `sys.modules` cache and before raising `ModuleNotFoundError`.

#### Why it exists
To define one predictable search order across the project directory, environment packages and the standard library.

#### Interview explanation
Give the order, then the shadowing hazard: because the script's directory is first, a local file named after a standard-library module breaks imports process-wide. `module.__file__` is the diagnostic.

#### Syntax
```python
sys.path                       # the search list
module.__file__                # which file provided a module
python -c "import x; print(x.__file__)"
PYTHONPATH=/extra python app.py
```

#### Example
```python
# Diagnosing a shadowing problem
import json
print(json.__file__)
# .../myproject/json.py  ← local file is shadowing the standard library
```

#### Common interview questions
- "What is `sys.path` and how is it ordered?" (Script directory or cwd, then `PYTHONPATH`, then `site-packages`, then the standard library.)
- "What happens if you name a file `random.py`?" (It shadows the standard-library module for the whole process, including for libraries that import it.)
- "How do you find which file a module came from?" (`module.__file__`.)
- "What does `pip install -e .` change?" (It puts a link to your source tree on the path, so imports resolve to the working copy.)

#### Follow-up questions
- "Should you modify `sys.path` at runtime?" (Almost never — it makes resolution depend on execution order; install the package or set `PYTHONPATH` instead.)
- "Why can the same code import different versions locally and in CI?" (Different environments, different editable installs, or a different working directory adding a different first entry.)
- "What is `site-packages`?" (The directory where installed distributions land, one per environment.)

#### Edge cases
- The REPL and `-c` put the *current* directory first, so behaviour depends on where you launched Python.
- A `.pth` file in `site-packages` can add arbitrary paths at start-up.
- Two path entries pointing at the same package via different routes create two module objects.

#### Common mistakes
- Filenames that shadow standard-library modules.
- `sys.path.append` in application code.
- Assuming the CI environment resolves imports the same way as the developer's machine.

#### Comparisons

| | `PYTHONPATH` | `pip install -e .` |
|---|---|---|
| Scope | Per shell/process | Per environment |
| Reproducible | Fragile | Yes |
| Recommended | Rarely | Yes |

#### Frequently confused with
`sys.path` order vs. installation order — path position wins, not install time.

#### Important facts to remember
- Script directory comes first.
- `__file__` identifies the real source.
- Do not mutate `sys.path` in application code.

---

### 8.5 Circular Imports

#### Definition
Two or more modules that import each other, so at least one observes the other in a partially initialised state.

#### Why it exists
As a symptom, not a feature: it means two modules depend on each other's definitions at import time.

#### Interview explanation
Explain the partially executed module, why `import a` survives where `from a import Thing` fails, and give the real fixes — extract a shared module, invert the dependency, or use `TYPE_CHECKING` for annotation-only imports.

#### Syntax
```python
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from .models import User        # type checker only, no runtime import

def save(user: "User") -> None: ...
```

#### Example
```python
# Breaking the cycle by depending on the module, not the name
from . import services              # module object, resolved lazily

class Order:
    def confirm(self):
        services.notify(self)       # attribute looked up at call time
```

#### Common interview questions
- "What causes a circular import error?" (One module is still executing when another asks for a name it has not defined yet.)
- "Why does `import a` sometimes work when `from a import X` fails?" (Binding the module object works even when incomplete; the attribute is only needed later.)
- "How do you fix one properly?" (Extract the shared code, invert the dependency, or defer the import — with extraction being the real fix.)
- "How do you import something only for type hints?" (Under `if TYPE_CHECKING:` with a quoted annotation, or with `from __future__ import annotations`.)

#### Follow-up questions
- "Why can a cycle work in production but fail in tests?" (Import order differs; the cycle only breaks when the 'wrong' module is imported first.)
- "Is a function-level import a real fix?" (It defers the problem and is acceptable as a stopgap, but the dependency cycle remains.)
- "What tools detect cycles?" (Import-graph linters such as `import-linter`, and architecture tests that assert allowed dependency directions.)

#### Edge cases
- Adding a type annotation can create a runtime cycle for something only the checker needs.
- Cycles through `__init__.py` re-exports are especially common and especially confusing.
- A cycle can produce an `AttributeError` rather than an `ImportError`, depending on which name is missing.

#### Common mistakes
- Fixing cycles by moving imports into functions and calling it done.
- Re-exporting aggressively in `__init__.py`.
- Letting the domain layer import the infrastructure layer.

#### Comparisons

| | Deferred import | Extracted module |
|---|---|---|
| Effort | Minutes | Design work |
| Cycle removed | No | Yes |
| Durability | Fragile | Stable |

#### Frequently confused with
Circular imports vs. circular *references* (garbage collection) — unrelated problems.

#### Important facts to remember
- The module is partially initialised.
- `TYPE_CHECKING` for annotation-only imports.
- The real fix is structural.

---

### 8.6 main and Entry Points

#### Definition
`__name__ == "__main__"` identifies the module being run as the program; entry points declare commands a distribution installs.

#### Why it exists
So one file can serve as both a library and a script, and so installed packages expose real commands instead of file paths.

#### Interview explanation
Explain the guard, then the multiprocessing consequence: on spawn platforms the child imports the main module, so unguarded code re-spawns processes recursively. Follow with entry points as the installable-command mechanism.

#### Syntax
```python
if __name__ == "__main__":
    raise SystemExit(main())
```
```toml
[project.scripts]
myapp = "myapp.cli:main"
```

#### Example
```python
# myapp/__main__.py — enables `python -m myapp`
from .cli import main
raise SystemExit(main())
```

#### Common interview questions
- "What does `if __name__ == '__main__':` do?" (Runs the block only when the file is executed directly, not when imported.)
- "Why is it required with multiprocessing?" (On spawn platforms the child process imports the main module; without the guard it re-executes the spawning code and forks endlessly.)
- "What is an entry point?" (Metadata declaring a callable a distribution provides — console scripts and plugin hooks are both entry points.)
- "What is `__main__.py`?" (The module run by `python -m package`.)

#### Follow-up questions
- "Why return from `main()` rather than calling `sys.exit` inside?" (It keeps the function testable; the guard converts the return value into the exit code.)
- "How do entry-point scripts work on Windows?" (The installer generates a small executable shim that launches the interpreter with your callable.)
- "What is the exit code convention?" (0 for success, non-zero for failure; `SystemExit(str)` prints the message and exits with code 1.)

#### Edge cases
- Code under the guard is not imported, so coverage tools usually report it as unexecuted.
- Entry points exist only after installation — a source checkout has no command.
- `python -m package` requires `__main__.py`; `python -m package.module` runs that module directly.

#### Common mistakes
- Missing guard with `multiprocessing`.
- Business logic inside the guard where it cannot be tested.
- Assuming the console script exists without installing the package.

#### Comparisons

| | `python file.py` | `python -m package` |
|---|---|---|
| `__package__` | None | Set correctly |
| Relative imports | Fail | Work |
| Needs installation | No | No (but needs `__main__.py`) |

#### Frequently confused with
`__main__.py` vs. `__init__.py`.

#### Important facts to remember
- The guard is mandatory with multiprocessing.
- Entry points create installed commands.
- Keep `main()` thin.

---

### 8.7 Virtual Environments

#### Definition
A self-contained directory with its own `site-packages` and interpreter shims, selected by putting its `bin`/`Scripts` directory first on `PATH`.

#### Why it exists
Because projects need different, incompatible dependency sets, and installing into the system Python breaks operating-system tooling.

#### Interview explanation
Describe what `venv` actually creates and how activation works, then note that it isolates *packages*, not the interpreter version — which is what `pyenv`, `uv` or containers handle.

#### Syntax
```bash
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
deactivate
python -m pip install -r requirements.txt
```

#### Example
```python
import sys
sys.prefix != sys.base_prefix      # True inside a virtual environment
```

#### Common interview questions
- "What does a virtual environment isolate?" (Installed packages — each environment has its own `site-packages`.)
- "How does activation work?" (It prepends the environment's script directory to `PATH`, so `python` and `pip` resolve to its copies.)
- "Does it isolate the Python version?" (No — it links one interpreter; version management is a separate tool.)
- "How do you check you are inside one?" (`sys.prefix != sys.base_prefix`, or inspect `VIRTUAL_ENV`.)

#### Follow-up questions
- "Can you move a virtual environment?" (Not reliably — paths are recorded inside it; recreate instead.)
- "Should the environment be committed?" (No — commit the dependency declaration and lock file.)
- "What replaces it in modern workflows?" (`uv`, `poetry` and `pdm` manage environments automatically; containers isolate at the OS level. All build on the same idea.)

#### Edge cases
- `pip install` without activation silently installs elsewhere — often the system Python.
- `python -m venv --system-site-packages` deliberately leaks system packages in.
- Recent Linux distributions block system-wide pip installs (PEP 668) to protect OS tooling.

#### Common mistakes
- Forgetting to activate.
- Committing `.venv`.
- Assuming the environment pins the interpreter version.

#### Comparisons

| | `venv` | Container |
|---|---|---|
| Isolates | Packages | OS, interpreter, packages |
| Weight | Tiny | Larger |
| Reproducibility | Good with a lock file | Strongest |

#### Frequently confused with
Environment isolation vs. interpreter version management.

#### Important facts to remember
- Isolates packages only.
- Activation is a `PATH` change.
- Never commit the directory.

---

### 8.8 Dependency Management

#### Definition
Declaring supported version ranges in `pyproject.toml` and recording exact resolved versions in a lock file for reproducible installation.

#### Why it exists
So that installs are reproducible across machines and CI, while libraries remain co-installable with everything else.

#### Interview explanation
Draw the library/application distinction — ranges for libraries, ranges plus a committed lock file for applications — and explain why over-pinning in a library causes unresolvable conflicts for users.

#### Syntax
```toml
[project]
dependencies = ["httpx>=0.27,<1.0"]

[dependency-groups]
dev = ["pytest>=8", "ruff"]
```
```bash
pip install -e ".[dev]"
pip-compile / uv lock / poetry lock      # produce a lock file
```

#### Example
```toml
# Library: permissive, co-installable
dependencies = ["pydantic>=2.0"]

# Application: same declaration, plus a committed lock file recording
# pydantic==2.9.2 with hashes
```

#### Common interview questions
- "How do libraries and applications differ in pinning?" (Libraries declare ranges so they can co-exist; applications additionally commit a lock file for reproducibility.)
- "What is a lock file for?" (Recording the exact resolved versions and hashes that were tested, so every environment installs the same tree.)
- "Why does over-pinning in a library cause problems?" (Two libraries pinning different exact versions of a shared dependency cannot be installed together.)
- "What is `pyproject.toml`?" (The standard project configuration file: build system, metadata, dependencies and tool settings.)

#### Follow-up questions
- "What does a resolver do?" (Finds one version of each package satisfying all constraints — an NP-hard search in the general case, which is why it can be slow.)
- "How do you handle a transitive vulnerability?" (Add a constraint to force a fixed version, and update the lock file; long term, push the direct dependency to update.)
- "What does `requires-python` control?" (Which interpreter versions the package declares support for; installers refuse incompatible ones.)

#### Edge cases
- A lock file pins versions, not system libraries or compilers, so builds can still differ.
- Extras (`package[extra]`) pull optional dependency sets and are easy to forget in production images.
- Hash-checking mode rejects any artefact not listed, which breaks if an index re-hosts a file.

#### Common mistakes
- Exact pins in a library.
- No lock file in an application.
- Development tools listed as runtime dependencies.

#### Comparisons

| | `requirements.txt` | `pyproject.toml` + lock |
|---|---|---|
| Standardised | By convention | By PEP |
| Separates declared/resolved | No | Yes |
| Build metadata | No | Yes |

#### Frequently confused with
Declared ranges vs. locked versions.

#### Important facts to remember
- Libraries: ranges. Applications: lock files.
- `pyproject.toml` is the standard.
- Over-pinning breaks co-installation.

---

### 8.9 Distributing a Package

#### Definition
Building a distribution with a PEP 517 build backend, producing a wheel (`.whl`, pre-built) and an sdist (`.tar.gz`, source), and publishing them to an index.

#### Why it exists
So installation is fast and does not require a compiler or build tooling on the target machine.

#### Interview explanation
Contrast wheels and sdists, explain wheel tags (Python version, ABI, platform) and why they cause "works locally, fails in the container", then mention that publishing is immutable.

#### Syntax
```toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"
```
```bash
python -m build
python -m twine check dist/*
python -m twine upload dist/*
```

#### Example
```
myapp-1.0.0-py3-none-any.whl                    # pure Python, installs anywhere
numpy-2.0.0-cp312-cp312-manylinux_x86_64.whl    # compiled: CPython 3.12, Linux x86-64
```

#### Common interview questions
- "What is the difference between a wheel and an sdist?" (A wheel is pre-built and installs by unpacking; an sdist is source and must be built, possibly requiring a compiler.)
- "What do wheel tags mean?" (Python implementation and version, ABI, and platform — they determine whether a wheel can be installed on a given machine.)
- "Why does an install suddenly need a C compiler?" (No compatible wheel exists for that platform or Python version, so pip falls back to building the sdist.)
- "Can you re-upload a version to PyPI?" (No — versions are immutable; you can yank a release but must publish a new version to fix it.)

#### Follow-up questions
- "How do you build wheels for many platforms?" (`cibuildwheel` in CI, building on each target platform and architecture.)
- "What is `manylinux`?" (A standard defining which glibc symbols a Linux wheel may use, so it works across distributions.)
- "How should you verify a release?" (Install the built wheel into a clean environment, import it, and run a smoke test before uploading.)

#### Edge cases
- Missing `__init__.py` or an incorrect package discovery configuration ships an incomplete wheel that imports but is missing modules.
- Data files need explicit inclusion; they are not packaged automatically.
- Version strings must follow PEP 440, which rejects some semver pre-release spellings.

#### Common mistakes
- Publishing without testing the artefact.
- Forgetting data files or subpackages.
- Assuming an sdist alone is enough for users on platforms without a compiler.

#### Comparisons

| | Wheel | sdist |
|---|---|---|
| Install speed | Fast | Slow (builds) |
| Needs compiler | No | Maybe |
| Platform-specific | Possibly | No |

#### Frequently confused with
Wheels as "just zipped source" — they are the built artefact, with metadata and a defined layout.

#### Important facts to remember
- Wheels install by unpacking.
- Tags decide compatibility.
- PyPI versions are immutable.

---

### 8.10 Namespace Packages and Plugins

#### Definition
Namespace packages (PEP 420) let several distributions share one import prefix without `__init__.py`; entry points let installed packages advertise plugins the host can discover.

#### Why it exists
To support organisational package families and extensible applications without the host importing everything to find out what exists.

#### Interview explanation
Explain the union-of-directories behaviour, then entry points as metadata read via `importlib.metadata` — emphasising that discovery does not import candidate packages, only the chosen ones.

#### Syntax
```toml
[project.entry-points."myapp.plugins"]
csv = "myapp_csv:Plugin"
```
```python
from importlib.metadata import entry_points
plugins = entry_points(group="myapp.plugins")
```

#### Example
```python
def load_plugins(group="myapp.plugins"):
    loaded = {}
    for ep in entry_points(group=group):
        try:
            loaded[ep.name] = ep.load()       # imports just this one
        except Exception:
            logger.exception("plugin %s failed to load", ep.name)
    return loaded
```

#### Common interview questions
- "What is a namespace package?" (A package without `__init__.py` whose contents are the union of matching directories across `sys.path`, allowing separate distributions to share a prefix.)
- "How does plugin discovery work?" (Via entry points in installed package metadata, read with `importlib.metadata.entry_points`.)
- "Why not just scan installed packages?" (Importing every package to find plugins is slow and executes arbitrary code; entry points are declarative metadata.)
- "How does pytest find plugins?" (Through the `pytest11` entry-point group.)

#### Follow-up questions
- "What breaks a namespace package?" (An `__init__.py` in one of the directories — it becomes a regular package and hides the others.)
- "Do entry points work from a source checkout?" (Only after installation, including `pip install -e .`.)
- "How do you make plugin loading robust?" (Wrap each `load()` in a try/except so one broken plugin cannot take down the host.)

#### Edge cases
- `importlib.metadata.entry_points()` changed API between 3.9 and 3.12 — use the `group=` keyword form on modern versions.
- Two distributions providing the same entry-point name silently collide.
- A namespace package spanning directories makes `__file__` absent on the package object.

#### Common mistakes
- Adding `__init__.py` to a namespace package.
- Forgetting to install the package during development.
- Letting one failing plugin crash the application at start-up.

#### Comparisons

| | Entry points | Manual registry |
|---|---|---|
| Discovery | Automatic on install | Explicit import required |
| Coupling | None | Host imports plugins |
| Failure isolation | Per plugin | Import-time crash |

#### Frequently confused with
Namespace packages vs. a missing `__init__.py` by accident.

#### Important facts to remember
- PEP 420: no `__init__.py`.
- Entry points are metadata, not imports.
- Guard plugin loading with try/except.

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

#### Definition
Concurrency is interleaving multiple tasks so several are in progress at once; parallelism is executing multiple tasks simultaneously on multiple cores.

#### Why it exists
Because waiting and computing are different bottlenecks: interleaving solves the first, extra cores solve the second.

#### Interview explanation
Define both in one sentence each, then map them to Python's tools: threads and asyncio for concurrency over I/O, processes for parallel computation. Add that you would profile first to establish which bottleneck you have.

#### Syntax
```python
# concurrency over I/O
with ThreadPoolExecutor() as pool: pool.map(fetch, urls)
asyncio.run(main())

# parallelism over CPU
with ProcessPoolExecutor() as pool: pool.map(crunch, chunks)
```

#### Example
```python
# I/O-bound: 100 requests, ~1s each
# sequential: ~100s   threads(16): ~7s   asyncio: ~2s

# CPU-bound: 8 heavy computations
# threads: no speed-up (GIL)   processes(8): ~8x on 8 cores
```

#### Common interview questions
- "What is the difference between concurrency and parallelism?" (Concurrency is structure — tasks interleaved; parallelism is execution — tasks simultaneous on multiple cores.)
- "Which does Python support?" (Both: concurrency via threads and asyncio, parallelism via processes — or C extensions that release the GIL.)
- "How do you tell whether a workload is I/O-bound or CPU-bound?" (Profile: high CPU on one core means CPU-bound; long wall-clock time with low CPU means I/O-bound.)
- "Can you have parallelism without concurrency?" (Yes — data-parallel operations such as vectorised array maths run in parallel without any concurrent structure in your code.)

#### Follow-up questions
- "Why do threads not speed up CPU-bound Python?" (The GIL serialises bytecode execution, so only one thread computes at a time.)
- "When is asyncio better than threads?" (At high concurrency — thousands of connections — where thread stacks and context switching become the limit.)
- "What about NumPy?" (Many operations release the GIL and are internally vectorised or multi-threaded, so threads *can* help with array work.)

#### Edge cases
- Hyper-threading and container CPU limits mean "number of cores" is not always what `os.cpu_count()` reports; `len(os.sched_getaffinity(0))` is closer on Linux.
- A mostly-I/O workload with a small CPU component can still be dominated by that component under load.
- Concurrency can *increase* latency for a single request while improving total throughput.

#### Common mistakes
- Using processes for I/O-bound work.
- Using threads for CPU-bound work.
- Adding concurrency before profiling.

#### Comparisons

| | Threads | Processes | Asyncio |
|---|---|---|---|
| Parallel CPU | No | Yes | No |
| Memory sharing | Yes | No | Yes (one thread) |
| Cost per unit | Moderate | High | Very low |
| Best for | I/O, sync libs | CPU work | I/O at scale |

#### Frequently confused with
Concurrency as a synonym for parallelism.

#### Important facts to remember
- Concurrency is structure; parallelism is execution.
- I/O-bound → threads or asyncio.
- CPU-bound → processes.

---

### 9.2 The Global Interpreter Lock

#### Definition
A mutex in CPython that permits only one thread to execute Python bytecode at a time, released around blocking I/O and by C extensions that opt to.

#### Why it exists
Because reference counting is not atomic; one interpreter-wide lock keeps memory management correct without slowing single-threaded execution with fine-grained locks.

#### Interview explanation
Say what it locks, when it is released, and what it does *not* protect — your own invariants. Then mention the free-threaded build (experimental in 3.13, officially supported in 3.14, still opt-in) and the per-interpreter GIL added in 3.12.

#### Syntax
```python
import sys
sys.getswitchinterval()        # default 0.005 seconds
sys.setswitchinterval(0.001)   # how long a thread may hold the GIL
```

#### Example
```python
import threading

counter = 0
def bump():
    global counter
    for _ in range(100_000):
        counter += 1            # load, add, store — not atomic

threads = [threading.Thread(target=bump) for _ in range(4)]
[t.start() for t in threads]; [t.join() for t in threads]
counter                          # usually < 400_000 — lost updates
```

#### Common interview questions
- "What is the GIL?" (A lock allowing one thread at a time to execute Python bytecode in CPython.)
- "Why does it exist?" (CPython's reference counting is not thread-safe; a single lock was simpler and faster for single-threaded code than locking every object.)
- "When is it released?" (During blocking I/O, `time.sleep`, and inside C extensions that release it explicitly — plus periodically, every switch interval.)
- "Does the GIL make my code thread-safe?" (No — it protects interpreter internals, not your read-modify-write sequences.)

#### Follow-up questions
- "How do you get real parallelism in CPython?" (Multiple processes, C extensions that release the GIL, or the free-threaded build.)
- "What is the free-threaded build?" (PEP 703: a CPython build without the GIL — experimental in 3.13, officially supported in 3.14, still opt-in and requiring compatible extensions.)
- "What is the per-interpreter GIL?" (PEP 684, Python 3.12: each subinterpreter gets its own GIL, so subinterpreters can run in parallel in one process; PEP 734 exposes them in the standard library in 3.14.)

#### Edge cases
- A C extension that never releases the GIL blocks every thread for its whole runtime.
- Other implementations — Jython, IronPython — have no GIL at all; PyPy has one.
- Removing the GIL costs single-threaded performance, which is why the free-threaded build is not the default.

#### Common mistakes
- Believing the GIL provides thread safety.
- Claiming Python "cannot do concurrency".
- Expecting threads to parallelise pure-Python computation.

#### Comparisons

| | With GIL | Free-threaded build |
|---|---|---|
| Parallel Python threads | No | Yes |
| Single-thread speed | Baseline | Somewhat slower |
| Extension support | Universal | Must be rebuilt |
| Status in 3.14 | Default | Supported, opt-in |

#### Complexity
GIL hand-off is cheap, but contention between many CPU-bound threads adds overhead — often making threaded CPU code slower than sequential.

#### Frequently confused with
The GIL as a thread-safety guarantee.

#### Important facts to remember
- One thread executes bytecode at a time.
- Released on I/O and by C extensions.
- Free-threaded build: supported but opt-in in 3.14.

---

### 9.3 Threads

#### Definition
OS threads within one process, created with `threading.Thread`, sharing memory and subject to the GIL for bytecode execution.

#### Why it exists
To overlap waiting: while one thread blocks on I/O it releases the GIL, letting others run.

#### Interview explanation
State that threads help with I/O and not with CPU work in CPython, then cover the practical hazards: silent exceptions, no cancellation, and shared mutable state requiring locks.

#### Syntax
```python
t = threading.Thread(target=fn, args=(), daemon=True)
t.start(); t.join(timeout=5)
threading.current_thread().name
threading.excepthook = handler          # catch exceptions from threads
```

#### Example
```python
import queue, threading

def worker(q):
    while (item := q.get()) is not None:
        try:
            process(item)
        except Exception:
            logger.exception("item failed")     # otherwise it dies silently
        finally:
            q.task_done()
```

#### Common interview questions
- "When do threads help in Python?" (For I/O-bound work, because the GIL is released while waiting.)
- "What happens to an exception raised in a thread?" (It terminates that thread only; the main thread is unaffected and, without a hook, never learns about it.)
- "How do you stop a thread?" (You cannot force it — use a sentinel value, an `Event` the thread checks, or a queue shutdown; there is no kill.)
- "What is a daemon thread?" (One that does not prevent the process from exiting; it is killed abruptly at shutdown, so it must not hold unflushed state.)

#### Follow-up questions
- "How many threads is too many?" (Hundreds is usually the practical ceiling — each has an OS stack and adds scheduling and GIL contention; for thousands of connections use asyncio.)
- "How do you pass results back?" (A `queue.Queue`, or use `concurrent.futures`, which does it for you.)
- "What is thread-local storage?" (`threading.local()` — per-thread attribute storage, used for database sessions and request context.)

#### Edge cases
- `join(timeout=...)` returning does not mean the thread finished — check `is_alive()`.
- Daemon threads are terminated without running `finally` blocks at interpreter exit.
- Threads started at import time can deadlock against the import lock.

#### Common mistakes
- Unhandled exceptions swallowed per thread.
- Expecting to cancel a running thread.
- Sharing mutable state without a lock.

#### Comparisons

| | `threading` | `concurrent.futures` |
|---|---|---|
| Result handling | Manual | `Future.result()` |
| Exceptions | Silent | Re-raised on `result()` |
| Pooling | Manual | Built in |

#### Complexity
Each thread costs an OS stack plus scheduling; GIL contention grows with the number of CPU-bound threads.

#### Frequently confused with
Threads as a way to speed up computation.

#### Important facts to remember
- Good for I/O, useless for CPU.
- Exceptions die with the thread.
- No cancellation.

---

### 9.4 Thread Synchronisation

#### Definition
Primitives — `Lock`, `RLock`, `Event`, `Condition`, `Semaphore`, `Barrier`, `Queue` — that coordinate access to shared state between threads.

#### Why it exists
Because the GIL does not make multi-step operations atomic, so shared mutable state needs explicit protection.

#### Interview explanation
Show why `counter += 1` races, then present `Lock` as the fix and `queue.Queue` as the design that avoids most locking altogether. Mention deadlock and consistent lock ordering as the prevention.

#### Syntax
```python
lock = threading.Lock()
with lock: ...                          # always use the context manager

event = threading.Event(); event.set(); event.wait(timeout=1)
sem = threading.Semaphore(5)
q = queue.Queue(maxsize=100)            # bounded: provides back-pressure
```

#### Example
```python
class Counter:
    def __init__(self):
        self._lock = threading.Lock()
        self._value = 0
    def increment(self):
        with self._lock:
            self._value += 1
    @property
    def value(self):
        with self._lock:
            return self._value
```

#### Common interview questions
- "Why is `counter += 1` not thread-safe?" (It is load, add and store — a thread switch between them loses an update.)
- "What is a deadlock and how do you avoid it?" (Two threads each waiting for a lock the other holds; avoid by acquiring locks in a consistent global order and using timeouts.)
- "What is the difference between `Lock` and `RLock`?" (`RLock` can be acquired again by the thread that already holds it — needed for recursive or re-entrant code.)
- "Why prefer `queue.Queue`?" (It is thread-safe by design and turns shared-state problems into message passing, eliminating most manual locking.)

#### Follow-up questions
- "Which operations are atomic in CPython?" (Single-bytecode ones such as `list.append` — but that is an implementation detail, not a language guarantee.)
- "What does a bounded queue give you?" (Back-pressure: producers block when consumers fall behind, preventing unbounded memory growth.)
- "How do you detect a deadlock?" (`faulthandler.dump_traceback_later`, or `py-spy dump`, which shows every thread's stack in a hung process.)

#### Edge cases
- A lock released by a different thread than acquired it is an error for `Lock` and impossible for `RLock`.
- `Condition.wait()` can wake spuriously — always re-check the predicate in a loop.
- Holding a lock while doing I/O serialises the whole system on that I/O.

#### Common mistakes
- Manual `acquire`/`release` without `try/finally`.
- Inconsistent lock ordering.
- Unbounded queues that hide a throughput mismatch until memory runs out.

#### Comparisons

| | Locks | Queues |
|---|---|---|
| Model | Shared state | Message passing |
| Deadlock risk | Real | Much lower |
| Back-pressure | Manual | Built in (bounded) |

#### Complexity
Uncontended lock acquisition is cheap; contention costs context switches and serialises the protected section.

#### Frequently confused with
Atomicity of single operations vs. of read-modify-write sequences.

#### Important facts to remember
- `+=` is not atomic.
- Always `with lock:`.
- Prefer queues to shared state.

---

### 9.5 Multiprocessing

#### Definition
Running code in separate OS processes, each with its own interpreter, memory and GIL, communicating by pickling data through pipes or queues.

#### Why it exists
To achieve real CPU parallelism in CPython, which threads cannot provide.

#### Interview explanation
Cover start methods (fork versus spawn) and the `__main__` guard, then the cost model: process start-up plus serialisation per task means the work per task must be substantial.

#### Syntax
```python
from multiprocessing import Pool, Process, Queue, set_start_method
set_start_method("spawn")            # explicit; default varies by platform/version

if __name__ == "__main__":           # required for spawn
    with Pool() as pool:
        pool.map(fn, items)
```

#### Example
```python
from concurrent.futures import ProcessPoolExecutor

def count_words(path):               # module-level: picklable
    return path, sum(1 for _ in open(path, encoding="utf-8"))

if __name__ == "__main__":
    with ProcessPoolExecutor() as pool:
        for path, n in pool.map(count_words, paths):
            print(path, n)
```

#### Common interview questions
- "Why does multiprocessing give real parallelism?" (Each process has its own interpreter and its own GIL, so they execute bytecode simultaneously.)
- "What is the difference between fork and spawn?" (Fork copies the parent process cheaply but is unsafe with threads; spawn starts a fresh interpreter and re-imports the main module, so the `__main__` guard is required.)
- "What must be picklable?" (Everything sent to or returned from a worker — so no lambdas, no local functions, no open file handles or sockets.)
- "When is multiprocessing slower than a loop?" (When the per-task work is small relative to process start-up and serialisation cost.)

#### Follow-up questions
- "How do you share memory between processes?" (`multiprocessing.Value`/`Array`, a `Manager` proxy, or `shared_memory` for large buffers — not ordinary globals.)
- "What changed about start methods recently?" (Python 3.14 makes `spawn` the default on Linux too, because `fork` with threads is unsafe.)
- "How do you avoid sending large data?" (Send file paths, offsets or shared-memory handles and let each worker read its own slice.)

#### Edge cases
- Forking a process that holds locks or threads can deadlock the child.
- A worker killed by the OOM killer surfaces as a `BrokenProcessPool`, losing all in-flight work.
- Each process re-imports the main module under spawn, so import-time side effects run once per worker.

#### Common mistakes
- Missing `__main__` guard.
- Passing unpicklable objects.
- Using processes for I/O-bound work.

#### Comparisons

| | Threads | Processes |
|---|---|---|
| Memory | Shared | Isolated |
| CPU parallel | No | Yes |
| Data transfer | Free | Pickled |
| Crash blast radius | Whole process | One worker |

#### Complexity
Start-up in tens of milliseconds per process, plus O(size) serialisation per argument and result.

#### Frequently confused with
Globals being shared between processes — they are not.

#### Important facts to remember
- Own interpreter, own GIL.
- Everything is pickled.
- The `__main__` guard is mandatory.

---

### 9.6 concurrent.futures

#### Definition
A high-level API providing `ThreadPoolExecutor` and `ProcessPoolExecutor` with a common interface based on `Future` objects.

#### Why it exists
To remove manual pool management and make switching between threads and processes a one-line change.

#### Interview explanation
Describe `submit` returning a future, `result()` re-raising worker exceptions, and `as_completed` versus `map` for ordering. Flag the silent-failure trap: unexamined futures swallow errors.

#### Syntax
```python
with ThreadPoolExecutor(max_workers=8) as pool:
    fut = pool.submit(fn, arg)
    fut.result(timeout=10)            # blocks; re-raises exceptions
    list(pool.map(fn, items))         # ordered results
    for f in as_completed(futures): ...   # completion order
```

#### Example
```python
from concurrent.futures import ThreadPoolExecutor, as_completed

def fetch_all(urls, workers=16):
    results, errors = {}, {}
    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures = {pool.submit(fetch, u): u for u in urls}
        for fut in as_completed(futures):
            url = futures[fut]
            try:
                results[url] = fut.result()
            except Exception as exc:
                errors[url] = exc          # never silently dropped
    return results, errors
```

#### Common interview questions
- "What is a `Future`?" (A handle to a result that may not be ready; `result()` waits for it and re-raises any exception from the worker.)
- "What is the difference between `map` and `as_completed`?" (`map` yields results in input order; `as_completed` yields futures as they finish, so fast results are not held behind slow ones.)
- "How do exceptions propagate?" (They are stored in the future and raised when you call `result()` — if you never call it, the error disappears.)
- "How do you switch from threads to processes?" (Change the executor class; the constraints change — arguments and functions must be picklable.)

#### Follow-up questions
- "Is there back-pressure?" (No — `submit` queues without bound, so a fast producer can exhaust memory; use a semaphore or a bounded queue to throttle.)
- "Can you cancel a submitted task?" (Only if it has not started; `future.cancel()` returns `False` once it is running.)
- "How do you choose `max_workers`?" (For I/O, well above core count — tuned to the remote service's limits; for CPU, roughly the core count.)

#### Edge cases
- Exiting the `with` block waits for all pending work; `shutdown(wait=False, cancel_futures=True)` is available in 3.9+.
- A process pool worker that dies takes the whole pool down with `BrokenProcessPool`.
- `map` swallows nothing but delays everything: an exception surfaces only when iteration reaches that result.

#### Common mistakes
- Never calling `result()`.
- Unbounded `submit` loops.
- Using the default `max_workers` without considering the downstream service.

#### Comparisons

| | `submit` + `as_completed` | `map` |
|---|---|---|
| Ordering | Completion | Input |
| Error handling | Per future | On iteration |
| Best for | Heterogeneous work | Uniform work |

#### Frequently confused with
Futures here vs. asyncio futures — similar idea, different ecosystems, not interchangeable.

#### Important facts to remember
- `result()` re-raises.
- No back-pressure on `submit`.
- Switching pools is one line.

---

### 9.7 The Event Loop

#### Definition
The single-threaded scheduler at the core of asyncio that runs ready callbacks and coroutines, watching sockets and timers for readiness.

#### Why it exists
To support very high I/O concurrency with one thread, avoiding the memory and context-switch costs of a thread per connection.

#### Interview explanation
Describe the ready queue plus selector model, stress that it is single-threaded and cooperative, and state the consequence: any callback that does not await blocks everything.

#### Syntax
```python
asyncio.run(main())                    # create loop, run, clean up
asyncio.get_running_loop()             # inside a coroutine
loop.run_in_executor(pool, fn, *args)  # offload blocking work
asyncio.run(main(), debug=True)        # warns on slow callbacks
```

#### Example
```python
async def main():
    async with httpx.AsyncClient() as client:
        async with asyncio.TaskGroup() as tg:
            for url in urls:
                tg.create_task(fetch(client, url))

asyncio.run(main())
```

#### Common interview questions
- "Is asyncio multithreaded?" (No — one thread by default; parallelism requires explicit executors.)
- "How does the loop decide what to run?" (It runs ready callbacks to completion, then waits on the selector for I/O readiness and timers.)
- "Why is `asyncio.run` preferred over manual loop management?" (It creates the loop, runs the coroutine, cancels remaining tasks, shuts down async generators and closes the loop.)
- "What makes asyncio scale better than threads for connections?" (A task costs about a kilobyte and switches at explicit await points, versus an OS thread with its own stack and pre-emptive switching.)

#### Follow-up questions
- "Can you run an event loop in several threads?" (Each thread can have its own loop, but a loop is not thread-safe — use `run_coroutine_threadsafe` to submit work across threads.)
- "What is `uvloop`?" (A libuv-based drop-in replacement for the default loop, noticeably faster for network-heavy workloads.)
- "How do you detect blocking?" (Debug mode logs callbacks taking longer than 100 ms.)

#### Edge cases
- Calling `asyncio.run` from inside a running loop raises `RuntimeError`.
- Signal handling and subprocesses have platform differences, particularly on Windows.
- An exception in a callback scheduled with `call_soon` goes to the loop exception handler, not to your caller.

#### Common mistakes
- Manual loop creation instead of `asyncio.run`.
- Assuming thread-safety of loop objects.
- Running CPU-heavy code inside a coroutine.

#### Comparisons

| | Event loop | Thread pool |
|---|---|---|
| Switching | Cooperative, at awaits | Pre-emptive |
| Cost per unit | ~1 KB | OS stack |
| Locks needed | Rarely | Often |

#### Complexity
O(1) scheduling per ready task; scales to tens of thousands of concurrent connections.

#### Frequently confused with
Asyncio as parallelism — it is concurrency in one thread.

#### Important facts to remember
- Single-threaded and cooperative.
- `asyncio.run` for lifecycle.
- Blocking code stalls the loop.

---

### 9.8 Coroutines and await

#### Definition
`async def` defines a coroutine function; calling it returns a coroutine object that runs only when awaited or scheduled, and `await` suspends until an awaitable completes.

#### Why it exists
To express asynchronous operations in sequential-looking code with explicit, visible suspension points.

#### Interview explanation
Emphasise that `await` means "wait here", not "run in parallel", and show the difference between awaiting in a loop (sequential) and `gather`/`TaskGroup` (concurrent). Mention function colouring as the real design cost.

#### Syntax
```python
async def f(): ...
coro = f()              # nothing has run
await coro              # runs it, waits for the result
asyncio.create_task(f())  # schedules it to run concurrently
```

#### Example
```python
# Sequential — 3 seconds for three 1-second calls
for url in urls:
    await fetch(url)

# Concurrent — about 1 second
await asyncio.gather(*(fetch(url) for url in urls))
```

#### Common interview questions
- "What happens when you call a coroutine function without awaiting it?" (You get a coroutine object that never runs, plus a `RuntimeWarning` when it is garbage collected.)
- "Does `await` make things concurrent?" (No — it waits. Concurrency comes from scheduling multiple coroutines with `gather`, `create_task` or a `TaskGroup`.)
- "What is awaitable?" (Coroutines, Tasks, Futures, and objects implementing `__await__`.)
- "What is function colouring?" (Async spreads through the call graph: a synchronous function cannot await, so callers must become async too.)

#### Follow-up questions
- "How do you call async code from sync code?" (`asyncio.run` at the top level, or `run_coroutine_threadsafe` to submit into a loop running in another thread.)
- "Where can a context switch happen?" (Only at `await` points, which is why many race conditions common in threads cannot occur.)
- "Are coroutines faster than threads?" (Lighter, not faster per operation — the gain is in how many can be in flight at once.)

#### Edge cases
- Awaiting the same coroutine object twice raises `RuntimeError`; tasks can be awaited repeatedly for their result.
- A coroutine that never awaits anything monopolises the loop for its entire body.
- `asyncio.sleep(0)` yields control without waiting — occasionally useful to let other tasks progress.

#### Common mistakes
- Forgetting `await`.
- Awaiting in a loop where concurrency was intended.
- Mixing sync and async libraries for the same resource.

#### Comparisons

| | `await coro` | `create_task(coro)` |
|---|---|---|
| Starts now | Yes, and waits | Yes, runs concurrently |
| Returns | The result | A `Task` |
| Concurrency | None | Yes |

#### Complexity
Coroutine objects are small; switching at an await is far cheaper than an OS context switch.

#### Frequently confused with
`await` as "do this in the background".

#### Important facts to remember
- Calling a coroutine runs nothing.
- `await` waits; tasks make it concurrent.
- Async colours the call graph.

---

### 9.9 Tasks and Task Groups

#### Definition
A `Task` wraps a coroutine and schedules it on the loop; `TaskGroup` (3.11+) manages a set of tasks with structured lifetimes and aggregated errors.

#### Why it exists
Because concurrency requires several coroutines scheduled at once, and unmanaged tasks leak, vanish or lose their exceptions.

#### Interview explanation
Contrast `gather` with `TaskGroup` — cancellation on failure and `ExceptionGroup` reporting — and mention the strong-reference requirement for standalone tasks, which is a subtle real-world bug.

#### Syntax
```python
task = asyncio.create_task(coro())        # schedule
await task                                # await the result
task.cancel()                             # raises CancelledError inside

async with asyncio.TaskGroup() as tg:     # structured
    tg.create_task(coro())
```

#### Example
```python
_background = set()

def fire_and_forget(coro):
    task = asyncio.create_task(coro)
    _background.add(task)                     # keep a strong reference
    task.add_done_callback(_background.discard)
    return task
```

#### Common interview questions
- "What is the difference between `gather` and `TaskGroup`?" (`gather` keeps siblings running when one fails and reports the first exception; `TaskGroup` cancels siblings and raises an `ExceptionGroup` containing all of them.)
- "Why keep a reference to a task?" (The loop holds only a weak reference, so an unreferenced task can be garbage collected mid-execution.)
- "How does cancellation work?" (`task.cancel()` raises `CancelledError` at the task's next await point; it inherits from `BaseException` so `except Exception` does not swallow it.)
- "What happens to an exception in a task nobody awaits?" (It is reported only when the task is garbage collected — 'Task exception was never retrieved'.)

#### Follow-up questions
- "How do you add a timeout?" (`asyncio.timeout()` as a context manager in 3.11+, or `asyncio.wait_for`.)
- "Should cleanup code catch `CancelledError`?" (It may catch it to clean up, but must re-raise — swallowing cancellation breaks shutdown.)
- "What is structured concurrency?" (The principle that concurrent tasks have a lexical scope and cannot outlive it, which `TaskGroup` enforces.)

#### Edge cases
- Cancelling a task that is not awaiting anything has no effect until it next awaits.
- `gather(return_exceptions=True)` turns errors into values, which quietly hides failures.
- A task created before the loop runs raises `RuntimeError: no running event loop`.

#### Common mistakes
- Fire-and-forget tasks with no reference.
- Never awaiting tasks, so exceptions are lost.
- Catching `CancelledError` and not re-raising.

#### Comparisons

| | `gather` | `TaskGroup` |
|---|---|---|
| Sibling cancellation | No | Yes |
| Errors | First (or values) | `ExceptionGroup` |
| Scope | Manual | Lexical |

#### Frequently confused with
`gather(return_exceptions=True)` as good error handling — it converts errors into easily ignored values.

#### Important facts to remember
- Keep strong references to tasks.
- `TaskGroup` for structured concurrency.
- `CancelledError` derives from `BaseException`.

---

### 9.10 Async Iteration and Context Managers

#### Definition
`async for` consumes objects implementing `__aiter__`/`__anext__`; `async with` uses `__aenter__`/`__aexit__`; `async def` with `yield` defines an async generator.

#### Why it exists
Because ordinary `for` and `with` cannot await, so streaming and resource management in async code need their own protocols.

#### Interview explanation
Give a paginated API example, note that `async for` is still sequential, and mention that async generators need `aclose()` — which `asyncio.run` handles for you.

#### Syntax
```python
async for item in async_iterable: ...
async with async_manager as resource: ...

async def agen():
    yield value                     # async generator
```

#### Example
```python
async def stream_rows(pool, query):
    async with pool.acquire() as conn:          # async setup/teardown
        async for row in conn.cursor(query):    # async streaming
            yield dict(row)
```

#### Common interview questions
- "When do you need `async for`?" (When producing each item requires awaiting — database cursors, paginated APIs, streaming responses.)
- "What signals the end of async iteration?" (`StopAsyncIteration`.)
- "Does `async for` process items concurrently?" (No — it is sequential; schedule tasks per item for concurrency.)
- "Why do async generators need special cleanup?" (Their `finally` blocks run on `aclose()`, which the loop must call — `asyncio.run` does this during shutdown.)

#### Follow-up questions
- "Can you use `yield` and `return value` together in an async generator?" (A bare `return` is allowed; returning a value is not.)
- "How do you convert a sync iterable for async use?" (Just use a normal `for` — it does not block if the iteration itself is cheap; only awaiting needs `async for`.)
- "What is `contextlib.asynccontextmanager`?" (The async counterpart of `@contextmanager`, using `async def` and a single `yield`.)

#### Edge cases
- Using `with` instead of `async with` on an async manager binds the manager, not the resource, and fails later.
- Abandoning an async generator without closing it delays its cleanup to garbage collection.
- `async for` over a sync iterable raises `TypeError`.

#### Common mistakes
- Mixing sync and async protocols.
- Assuming async iteration is concurrent.
- Manual loop management that skips async-generator shutdown.

#### Comparisons

| | `for`/`with` | `async for`/`async with` |
|---|---|---|
| Can await | No | Yes |
| Usable in sync code | Yes | No |
| Protocol | `__iter__`/`__enter__` | `__aiter__`/`__aenter__` |

#### Frequently confused with
`async for` as parallel iteration.

#### Important facts to remember
- Async protocols mirror the sync ones.
- Still sequential.
- Async generators need `aclose`.

---

### 9.11 Blocking Calls in Async Code

#### Definition
Any operation inside a coroutine that runs without awaiting — synchronous I/O, heavy computation, `time.sleep` — occupying the single-threaded event loop for its full duration.

#### Why it exists
As a hazard, not a feature: async assumes cooperative yielding, and blocking code does not cooperate.

#### Interview explanation
State the consequence bluntly — one blocking call freezes every task — then give the three fixes: an async library, `asyncio.to_thread`, or a process pool for CPU work. Mention debug mode as the detection tool.

#### Syntax
```python
await asyncio.sleep(1)                       # not time.sleep
await asyncio.to_thread(blocking_io_call)    # 3.9+
await loop.run_in_executor(process_pool, cpu_work, arg)
```

#### Example
```python
async def handler(payload):
    # blocking DB driver, no async version available
    rows = await asyncio.to_thread(legacy_db.query, payload.sql)
    # CPU-heavy: threads will not help because of the GIL
    report = await loop.run_in_executor(PROCESS_POOL, render, rows)
    return report
```

#### Common interview questions
- "What happens if you call `time.sleep` in a coroutine?" (The whole event loop stops for that duration — every other task is frozen.)
- "How do you use a blocking library from async code?" (`asyncio.to_thread` for I/O-bound calls, a `ProcessPoolExecutor` for CPU-bound ones.)
- "Why does `to_thread` not help with CPU-bound work?" (The GIL still serialises bytecode, so a thread gives no parallelism for pure-Python computation.)
- "How do you detect blocking in production?" (Run with debug mode, which logs callbacks exceeding 100 ms, and profile with an async-aware profiler.)

#### Follow-up questions
- "What is a reasonable threshold before offloading?" (Anything over a few milliseconds is worth measuring; single-digit milliseconds are usually fine, tens of milliseconds are not.)
- "Does logging block?" (File and stdout handlers can, particularly with slow disks; high-throughput services use a queue handler.)
- "What about `requests` in async code?" (It blocks — use `httpx` or `aiohttp` instead.)

#### Edge cases
- `to_thread` does not cancel the underlying blocking call when the task is cancelled; the thread runs to completion.
- The default executor has a bounded thread pool, so many concurrent `to_thread` calls queue.
- Module import inside a coroutine blocks — pre-import heavy modules at start-up.

#### Common mistakes
- `time.sleep` instead of `asyncio.sleep`.
- Synchronous HTTP or database clients in coroutines.
- Offloading CPU work to threads.

#### Comparisons

| | `to_thread` | `run_in_executor(ProcessPool)` |
|---|---|---|
| Good for | Blocking I/O | CPU-bound work |
| GIL | Still shared | Bypassed |
| Data transfer | Free | Pickled |

#### Frequently confused with
`async def` as making code non-blocking.

#### Important facts to remember
- One blocking call stalls everything.
- `to_thread` for I/O, processes for CPU.
- Debug mode finds offenders.

---

### 9.12 Choosing a Concurrency Model

#### Definition
Selecting threads, processes or asyncio according to whether the workload is I/O-bound or CPU-bound, and whether the libraries involved are synchronous or asynchronous.

#### Why it exists
Because each model solves a different bottleneck, and the wrong choice yields either no improvement or unnecessary complexity.

#### Interview explanation
Work through the decision: profile first, classify the bottleneck, then match the model. Say that hybrids are normal — async at the edge, an executor for blocking or heavy work.

#### Syntax
```python
ThreadPoolExecutor()     # I/O-bound, sync libraries, moderate concurrency
ProcessPoolExecutor()    # CPU-bound
asyncio.run(main())      # I/O-bound, high concurrency, async libraries
```

#### Example
```python
# A realistic hybrid
async def endpoint(req):
    user = await db.fetch_user(req.id)                  # async I/O
    pdf = await asyncio.to_thread(render_pdf, user)     # blocking library
    await storage.upload(pdf)                           # async I/O
    return {"ok": True}
```

#### Common interview questions
- "How do you decide between threads, processes and asyncio?" (Classify the bottleneck by profiling: I/O with sync libraries → threads; I/O at high concurrency with async libraries → asyncio; CPU-bound → processes.)
- "Can you mix them?" (Yes, and most production systems do: an event loop with a thread pool for blocking calls and a process pool for CPU work.)
- "When is none of them the answer?" (When the real fix is caching, batching, a database index, or simply doing less work.)
- "How do you size pools?" (CPU pools at roughly core count; I/O pools by the downstream service's concurrency limits, not by guesswork.)

#### Follow-up questions
- "What changes with the free-threaded build?" (Threads could provide CPU parallelism, which would shift some workloads from processes to threads — once extensions support it widely.)
- "How do you measure improvement?" (Throughput and latency percentiles under realistic load, not a single timing of the happy path.)
- "What about multiple worker processes for a web service?" (Running several single-threaded or async worker processes behind a load balancer is often simpler than in-process parallelism.)

#### Edge cases
- Container CPU limits make `os.cpu_count()` misleading for pool sizing.
- Async plus threads reintroduces shared-state hazards that pure async avoids.
- Some libraries hold a lock internally, so concurrency does not help even when the model is right.

#### Common mistakes
- Choosing before profiling.
- Rewriting in async to fix a database problem.
- Sizing pools by intuition.

#### Comparisons

| Bottleneck | Model | Typical gain |
|---|---|---|
| Network I/O, few connections | Threads | Linear in workers |
| Network I/O, many connections | Asyncio | Very large |
| Pure-Python CPU | Processes | Up to core count |
| Array maths | NumPy / native | Often larger than either |

#### Frequently confused with
Concurrency as a general performance fix.

#### Important facts to remember
- Profile before choosing.
- Hybrids are normal.
- The best fix is often less work, not more workers.

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

#### Definition
Every Python value is a heap-allocated structure with a reference count and a type pointer; there are no primitive, unboxed values.

#### Why it exists
To give the language one uniform model for storage, typing and memory management, which is what makes dynamic typing and full introspection possible.

#### Interview explanation
State the header layout, then draw the consequence: boxing costs memory and indirection, which is precisely why NumPy stores unboxed values contiguously and is an order of magnitude faster for numeric work.

#### Syntax
```python
sys.getsizeof(1)          # ~28 bytes
id(obj)                   # address in CPython
type(obj); obj.__class__
```

#### Example
```python
import sys, array
nums = list(range(1_000_000))          # 1M pointers + 1M int objects
arr = array.array("q", range(1_000_000))  # 1M raw 8-byte integers
sys.getsizeof(arr) < sys.getsizeof(nums)  # and far less total memory
```

#### Common interview questions
- "Why is a Python integer 28 bytes?" (It is an object: reference count, type pointer, size field and digit payload — not a machine word.)
- "Why is NumPy faster than a list of numbers?" (It stores unboxed values contiguously, so operations avoid per-element objects, pointer chasing and interpreter dispatch.)
- "What is `id()`?" (The object's identity — its memory address in CPython — which is what `is` compares.)
- "Are classes objects?" (Yes — instances of `type`, which is why they can be passed around and created at runtime.)

#### Follow-up questions
- "What does `sys.getsizeof` include?" (The object's own size only, not the objects it references.)
- "Why does attribute access cost more than a local variable?" (A local is an array index; an attribute is a dictionary lookup plus descriptor checks.)
- "How do you reduce per-object overhead?" (`__slots__`, dataclasses with `slots=True`, `array.array`, NumPy, or restructuring to fewer, larger objects.)

#### Edge cases
- `id()` values can be reused after an object is freed, so caching identities is unsafe.
- Small integers and interned strings share objects, making identity comparisons misleadingly succeed.
- Objects with `__slots__` have no `__dict__`, so `vars()` fails on them.

#### Common mistakes
- Treating `getsizeof` as a deep size.
- Storing large numeric datasets in Python lists.
- Using `id()` as a stable key.

#### Comparisons

| | Python `int` | C `int64` |
|---|---|---|
| Size | ~28 bytes | 8 bytes |
| Overflow | Never | Wraps |
| Access | Pointer dereference | Direct |

#### Complexity
Allocation is O(1) but frequent; every operation on boxed values touches the heap.

#### Frequently confused with
Value semantics vs. object semantics.

#### Important facts to remember
- No primitives; everything is boxed.
- `getsizeof` is shallow.
- Classes are objects too.

---

### 10.2 Reference Counting

#### Definition
CPython's primary memory management: each object counts its references and is deallocated the moment that count reaches zero.

#### Why it exists
For immediate, predictable reclamation without a tracing collector pause on the common path.

#### Interview explanation
Describe increment and decrement points, note that deallocation is immediate and cascades, then state the two limitations: cycles, and the cost of reference updates in multi-threaded contexts.

#### Syntax
```python
sys.getrefcount(obj)      # one higher than you expect: the argument reference
del name                  # decrements; does not necessarily free
```

#### Example
```python
class Noisy:
    def __del__(self): print("freed")

x = Noisy()
y = x
del x            # nothing printed — refcount is still 1
del y            # "freed" — immediately
```

#### Common interview questions
- "How does Python manage memory?" (Reference counting for the common case, plus a generational cycle collector for reference cycles.)
- "What does `del x` do?" (Removes the name and decrements the count; the object is freed only if the count reaches zero.)
- "Why is `sys.getrefcount` always one higher?" (Passing the object to the function creates a temporary reference.)
- "What can reference counting not free?" (Cycles — objects referring to each other keep every count above zero.)

#### Follow-up questions
- "Is `__del__` a reliable destructor?" (No — timing depends on references, exceptions holding tracebacks, and shutdown; use context managers.)
- "Why does the free-threaded build complicate this?" (Every reference update becomes a contended shared write, so it uses biased and deferred reference counting to reduce the cost.)
- "Does PyPy work the same way?" (No — it uses a tracing collector, so objects are not freed deterministically and file handles are not closed promptly.)

#### Edge cases
- An exception stored anywhere keeps its traceback, which keeps every frame and local alive.
- Interpreter shutdown may not run all `__del__` methods.
- `__del__` raising an exception prints it to stderr and is otherwise ignored.

#### Common mistakes
- Relying on `__del__` for cleanup.
- Assuming `del` frees memory.
- Writing code that depends on CPython's prompt destruction and then running it on PyPy.

#### Comparisons

| | Reference counting | Tracing GC |
|---|---|---|
| Timing | Immediate | Periodic |
| Cycles | Cannot free | Handles them |
| Pauses | None (on this path) | Yes |
| Overhead | Per operation | Per collection |

#### Complexity
O(1) per reference change; freeing a large structure cascades in proportion to its size.

#### Frequently confused with
`del` deleting objects rather than names.

#### Important facts to remember
- Zero means immediate free.
- Cycles need the collector.
- `__del__` timing is not a contract.

---

### 10.3 The Cycle Collector

#### Definition
A generational tracing collector that finds groups of container objects reachable only from each other and frees them.

#### Why it exists
Because reference counting alone cannot reclaim cycles, which would otherwise leak permanently.

#### Interview explanation
Explain the generational scheme and thresholds, when collection is triggered, and that only container types are tracked. Mention `gc.freeze()` for forking servers as evidence of practical experience.

#### Syntax
```python
gc.collect(generation=2)
gc.get_threshold()        # (700, 10, 10)
gc.disable(); gc.enable()
gc.get_referrers(obj)
gc.freeze()               # move current objects out of collection
```

#### Example
```python
import gc

gc.disable()              # a latency-sensitive service may do this
try:
    serve_requests()
finally:
    gc.enable()
# Safe only if the code creates no cycles — otherwise memory grows
```

#### Common interview questions
- "Why does Python need a garbage collector if it has reference counting?" (To reclaim reference cycles, whose counts never reach zero.)
- "What are generations?" (Three age buckets; new objects start in generation 0 and survivors are promoted, with younger generations collected far more often.)
- "When does collection run?" (When allocations minus deallocations exceed the generation's threshold — not on a timer.)
- "Can you disable it?" (Yes, `gc.disable()` — appropriate only if your code creates no cycles, and it is a genuine technique for latency-sensitive services.)

#### Follow-up questions
- "Which objects are tracked?" (Containers that can reference other objects; atomic types such as integers and strings are not tracked.)
- "What is `gc.freeze` for?" (Moving already-loaded objects into a permanent generation — reduces collection work and protects copy-on-write pages in pre-fork servers.)
- "Are objects with `__del__` collectable in cycles?" (Yes since Python 3.4, PEP 442; before that they landed in `gc.garbage`.)

#### Edge cases
- A full generation-2 collection scans the whole tracked heap, causing pauses proportional to its size.
- Disabling the collector in code that does create cycles leaks steadily.
- `gc.get_referrers` itself creates references, so interpret its output carefully.

#### Common mistakes
- Calling `gc.collect()` routinely as a "fix".
- Disabling collection without auditing for cycles.
- Blaming the collector for growth that is actually a live reference.

#### Comparisons

| | Gen 0 | Gen 1 | Gen 2 |
|---|---|---|---|
| Frequency | Highest | Medium | Lowest |
| Objects | Newest | Survivors | Long-lived |
| Cost | Small | Medium | Whole heap |

#### Complexity
Proportional to the number of tracked objects in the generation being collected.

#### Frequently confused with
The cycle collector as Python's *only* garbage collection.

#### Important facts to remember
- Only for cycles.
- Three generations, allocation-triggered.
- `gc.freeze()` helps forking servers.

---

### 10.4 Memory Allocators

#### Definition
CPython's layered allocation: pymalloc serves objects up to 512 bytes from pools carved out of 1 MB arenas; larger requests go to the system allocator.

#### Why it exists
Because Python allocates enormous numbers of small short-lived objects, and a system call per allocation would be prohibitively slow.

#### Interview explanation
Describe arena → pool → block, then answer the question that always follows: freeing objects returns blocks to free lists, and only a completely empty arena can be returned to the OS — which is why RSS stays high.

#### Syntax
```python
sys.getallocatedblocks()         # live pymalloc blocks
PYTHONMALLOC=debug python app.py # allocator debugging
```

#### Example
```python
import sys
before = sys.getallocatedblocks()
data = [dict(i=i) for i in range(100_000)]
during = sys.getallocatedblocks()
del data
after = sys.getallocatedblocks()      # returns near `before`; RSS may not
```

#### Common interview questions
- "Why does memory usage not drop after freeing objects?" (Blocks return to pymalloc's free lists; an arena returns to the OS only when entirely empty, and fragmentation usually prevents that.)
- "What is pymalloc?" (CPython's small-object allocator, using arenas, pools and size-class blocks.)
- "What is the 512-byte threshold?" (Objects at or below it use pymalloc; larger ones go to the system allocator.)
- "What is fragmentation here?" (Scattered live objects keeping many arenas partially occupied, so little memory can be returned.)

#### Follow-up questions
- "How do you actually return memory to the OS?" (Do the memory-heavy work in a child process that exits, or use an allocator with different behaviour; within one process you have little control.)
- "What are free lists?" (Per-type caches of reusable objects that make churn cheap and further decouple freeing from OS memory.)
- "How would you measure this?" (`getallocatedblocks` for Python-level blocks, `tracemalloc` for attribution, RSS for the process.)

#### Edge cases
- `PYTHONMALLOC=malloc` disables pymalloc — useful with Valgrind, and slower.
- Long-running services with variable workloads often show a high-water mark that never recedes.
- Some extensions allocate outside pymalloc entirely, so Python-level tools do not see their memory.

#### Common mistakes
- Diagnosing a leak from RSS alone.
- Calling `gc.collect()` to reduce RSS.
- Assuming memory behaviour is identical across platforms.

#### Comparisons

| | pymalloc | System malloc |
|---|---|---|
| Object size | ≤ 512 bytes | Larger |
| Speed | Fast, no syscall | Slower |
| Returns to OS | Whole arenas only | Per allocation |

#### Complexity
O(1) allocation from a pool's free list in the common case.

#### Frequently confused with
Python-level memory freed vs. process memory returned.

#### Important facts to remember
- Arena → pool → block.
- 512-byte threshold.
- RSS rarely shrinks.

---

### 10.5 Interning and Object Caches

#### Definition
CPython reuses objects for small integers (-5 to 256) and for identifier-like string literals, so equal values can share one object.

#### Why it exists
To save memory and to make the constant comparisons of names and dict keys pointer-fast.

#### Interview explanation
Give the small-integer range and the literal-interning rule, then make the point that matters: these are implementation details, so `is` must never be used to compare values.

#### Syntax
```python
sys.intern("runtime string")     # explicit interning
a is b                            # identity, not equality
```

#### Example
```python
a, b = 256, 256
a is b            # True

a, b = 257, 257
a is b            # False in a fresh interpreter

# Inside one function body, constant folding can make even this True —
# which is exactly why `is` on values is unreliable.
```

#### Common interview questions
- "Why does `256 is 256` differ from `257 is 257`?" (CPython caches integers from -5 to 256; larger values are separate objects.)
- "Which strings are interned?" (Identifier-like literals at compile time; runtime-built strings are generally not, unless you call `sys.intern`.)
- "Why intern at all?" (Memory savings and pointer-speed comparison for names and keys.)
- "Should you ever rely on it?" (No — use `==` for values; reserve `is` for `None`, `True`, `False` and sentinels.)

#### Follow-up questions
- "When is explicit `sys.intern` worth it?" (Large numbers of repeated strings — parsed field names, log keys — where deduplication saves real memory.)
- "What is the risk of interning?" (The intern table is never trimmed, so interning many unique strings is itself a leak.)
- "What is constant folding?" (Compile-time evaluation of constant expressions, which can make identities coincide inside a single code object.)

#### Edge cases
- `-5` to `256` is the documented CPython range but not a language guarantee.
- The REPL and a script can behave differently because of per-code-object constant folding.
- Other implementations intern differently or not at all.

#### Common mistakes
- `if x is 0:` or `if s is "yes":`.
- Tests that assert identity on values.
- Interning unbounded user input.

#### Comparisons

| | `==` | `is` |
|---|---|---|
| Compares | Value | Identity |
| Overridable | Yes | No |
| Correct for values | Yes | No |

#### Frequently confused with
Identity coincidence as a language guarantee.

#### Important facts to remember
- -5 to 256 are cached.
- Identifier-like literals are interned.
- Never use `is` for values.

---

### 10.6 Measuring Memory

#### Definition
Attributing memory across three layers: individual objects (`sys.getsizeof`), Python allocations (`tracemalloc`) and process memory (RSS).

#### Why it exists
Because each layer answers a different question, and a number from the wrong layer leads to the wrong conclusion.

#### Interview explanation
Name the tool per question, stress that `getsizeof` is shallow, and describe the `tracemalloc` snapshot-diff workflow — which is how you turn "memory grows" into "this line grows".

#### Syntax
```python
sys.getsizeof(obj)
tracemalloc.start(); snap = tracemalloc.take_snapshot()
snap2.compare_to(snap, "lineno")
psutil.Process().memory_info().rss
```

#### Example
```python
import tracemalloc
tracemalloc.start(25)                       # keep 25 frames per allocation
base = tracemalloc.take_snapshot()
handle_requests(1000)
top = tracemalloc.take_snapshot().compare_to(base, "traceback")[0]
print("\n".join(top.traceback.format()))    # exact allocation site
```

#### Common interview questions
- "How do you find a memory leak in Python?" (Take `tracemalloc` snapshots around the suspect workload, diff them, and inspect the top growing allocation sites; then find what still references those objects.)
- "What does `sys.getsizeof` measure?" (Only the object itself — a list's size excludes the objects it points to.)
- "Why does RSS not match your calculations?" (It includes the interpreter, allocator free lists, fragmentation and extension memory.)
- "How do you measure a nested structure?" (A recursive walk tracking `id()`s, or `pympler.asizeof`.)

#### Follow-up questions
- "Is `tracemalloc` usable in production?" (With reduced frame depth and sampling, yes for a diagnostic window — it costs CPU and memory.)
- "How do you compare two deployments?" (Snapshot at the same lifecycle point in both and diff; absolute numbers vary too much to compare directly.)
- "What about memory in C extensions?" (Invisible to `tracemalloc` unless the extension uses Python's allocators — RSS and platform tools are the only view.)

#### Edge cases
- `getsizeof` on objects with `__slots__` excludes the slot storage in some versions.
- A snapshot taken during a garbage collection can attribute memory oddly.
- Container memory limits count page cache in some cgroup versions, distorting the picture.

#### Common mistakes
- Deep conclusions from a shallow measurement.
- Comparing RSS between different machines.
- Profiling memory with test-sized data.

#### Comparisons

| Tool | Layer | Overhead |
|---|---|---|
| `getsizeof` | One object | None |
| `tracemalloc` | Python allocations | Moderate |
| RSS | Whole process | None |

#### Frequently confused with
Python heap size vs. process RSS.

#### Important facts to remember
- `getsizeof` is shallow.
- `tracemalloc` diffs attribute growth.
- RSS includes far more than your objects.

---

### 10.7 Memory Leaks

#### Definition
In Python, memory that stays reachable — and therefore uncollectable — because something still references it, usually unintentionally.

#### Why it exists
Because the collector frees only what is unreachable; retention is a logic error, not an allocator failure.

#### Interview explanation
List the usual causes — unbounded caches, `lru_cache` on methods, registries of bound methods, stored exceptions, closures — and describe the diagnosis: snapshot diff to find what grows, then `gc.get_referrers` to find who holds it.

#### Syntax
```python
gc.get_referrers(obj)
objgraph.show_backrefs([obj], max_depth=5)
tracemalloc.take_snapshot().compare_to(base, "lineno")
```

#### Example
```python
class Service:
    @functools.lru_cache(maxsize=None)     # leak: caches self forever
    def compute(self, key): ...

# Fix: cache a module-level function, or use cached_property per instance
@functools.lru_cache(maxsize=1024)
def compute(key): ...
```

#### Common interview questions
- "Can Python leak memory?" (Yes — not unreachable memory, but reachable memory nobody intends to keep: caches, registries, closures, stored exceptions.)
- "What is wrong with `lru_cache` on a method?" (`self` is part of the cache key, so every instance ever passed stays alive for the life of the process.)
- "How do you find what is holding an object?" (`gc.get_referrers`, or `objgraph` to render the chain back to a root.)
- "Why do stored exceptions retain memory?" (The exception references its traceback, which references every frame and all their local variables.)

#### Follow-up questions
- "How do you prevent cache leaks?" (Bound every cache — `maxsize`, TTL eviction, or a `WeakValueDictionary` when entries should not extend lifetime.)
- "What about C extension leaks?" (A missed `Py_DECREF` leaks invisibly to Python tooling; RSS grows while `tracemalloc` shows nothing.)
- "How do you catch these before production?" (A soak test: run a realistic workload for an extended period and assert that memory plateaus rather than climbs.)

#### Edge cases
- A leak can be a slow climb over days, invisible in a ten-minute test.
- `logging` with a custom handler that stores records is a surprisingly common retention source.
- Module-level state in a worker process is retained across every request that process handles.

#### Common mistakes
- `lru_cache` on instance methods.
- Unbounded module-level dictionaries.
- Keeping exception objects in a retry queue.

#### Comparisons

| | C leak | Python leak |
|---|---|---|
| Cause | Forgotten `free` | Unwanted reference |
| Tooling | Valgrind | `tracemalloc`, `objgraph` |
| Fix | Free it | Remove the reference |

#### Frequently confused with
Leaks vs. fragmentation — one grows the heap, the other just fails to return it.

#### Important facts to remember
- Leaks are unwanted references.
- Bound every cache.
- Stored exceptions pin frames.

---

### 10.8 Weak References

#### Definition
References that do not increment the reference count, allowing the referent to be collected; `weakref.ref`, `WeakValueDictionary` and `WeakKeyDictionary` are the standard forms.

#### Why it exists
So caches, registries and back-references can observe objects without controlling their lifetime, and without creating cycles.

#### Interview explanation
Explain the non-owning semantics, give the `WeakValueDictionary` cache example, and note the two practical limits: not all types support weak references, and the referent can disappear between check and use.

#### Syntax
```python
ref = weakref.ref(obj)
ref()                        # the object, or None if collected
weakref.WeakValueDictionary()
weakref.finalize(obj, cleanup)
```

#### Example
```python
import weakref

class Connection:
    __slots__ = ("host", "__weakref__")      # required for weakref with slots
    def __init__(self, host): self.host = host

pool = weakref.WeakValueDictionary()
c = Connection("db1")
pool["db1"] = c
del c
pool.get("db1")      # None — not kept alive by the pool
```

#### Common interview questions
- "What is a weak reference?" (A reference that does not keep its target alive; when the last strong reference goes, the object is collected and the weak reference returns `None`.)
- "When would you use one?" (Caches that should not extend lifetime, parent links that would otherwise form cycles, observer registries.)
- "What cannot be referenced weakly?" (Built-in `int`, `str`, `tuple` and `list` instances; and slotted classes without `__weakref__` in their slots.)
- "What is `weakref.finalize`?" (A reliable way to register cleanup when an object is collected — safer than `__del__`.)

#### Follow-up questions
- "What is the race with weak caches?" (The value can be collected between the membership test and the access; use `.get()` and handle `None`.)
- "How do observers avoid leaks?" (Store weak references to listeners, or use `WeakMethod` for bound methods, which otherwise keep their instance alive.)
- "Do weak references prevent cycles?" (Yes — making the back-link weak turns a cycle into a tree, so reference counting alone can free it.)

#### Edge cases
- `WeakKeyDictionary` requires hashable keys that support weak references.
- A weak reference to a bound method dies immediately, because the bound method object is temporary — use `weakref.WeakMethod`.
- Finalizer callbacks run at unpredictable times, and possibly during interpreter shutdown.

#### Common mistakes
- Expecting a weak cache to retain entries.
- `weakref.ref(obj.method)` instead of `WeakMethod`.
- Using weak references on types that do not support them and getting `TypeError`.

#### Comparisons

| | Strong reference | Weak reference |
|---|---|---|
| Keeps alive | Yes | No |
| Can be `None` later | No | Yes |
| Use for | Ownership | Observation |

#### Frequently confused with
Weak references as a cache eviction policy — they evict only when the object dies elsewhere.

#### Important facts to remember
- Does not keep the object alive.
- Not all types support it.
- `WeakMethod` for bound methods.

---

### 10.9 Bytecode and the Evaluation Loop

#### Definition
The compiled instruction stream inside a code object, executed by CPython's evaluation loop against a value stack and the frame's fast locals.

#### Why it exists
As the execution model: it is where the cost of every Python construct is actually determined.

#### Interview explanation
Describe the fetch-decode-execute loop over a stack machine, show `dis` output for a small function, and connect it to practical facts — locals are array indices, globals are dictionary lookups, attributes are lookups plus descriptor checks.

#### Syntax
```python
dis.dis(func)
func.__code__.co_consts, co_varnames, co_names
compile(src, "<string>", "exec")
```

#### Example
```python
import dis
dis.dis("a.b.c")
#  LOAD_NAME  a
#  LOAD_ATTR  b
#  LOAD_ATTR  c        ← two attribute lookups, each with descriptor checks
```

#### Common interview questions
- "What is bytecode?" (A compact instruction set for CPython's stack-based virtual machine, produced by the compiler and stored in code objects.)
- "How do you inspect it?" (`dis.dis` on a function, a string or a code object.)
- "Why are locals faster than globals?" (`LOAD_FAST` is an array index; `LOAD_GLOBAL` is a dictionary lookup, though 3.11+ caches it.)
- "Is bytecode stable across versions?" (No — instructions are added, removed and renumbered freely, which is why `.pyc` files are version-tagged.)

#### Follow-up questions
- "What lives in a code object besides instructions?" (Constants, names, argument counts, flags, and the line-number table used for tracebacks.)
- "What is a frame?" (The per-call object holding the value stack and fast locals; cheaper to create since 3.11.)
- "When is reading bytecode genuinely useful?" (Settling semantic questions — whether something copies, how many lookups occur — not routine optimisation.)

#### Edge cases
- Comprehensions compile to their own code objects, which is why their scope is separate.
- `python -O` removes `assert` statements, producing different bytecode from identical source.
- Decorated functions disassemble to the wrapper unless you follow `__wrapped__`.

#### Common mistakes
- Micro-optimising instruction counts while an O(n²) loop dominates.
- Assuming bytecode portability.
- Reading `dis` output of a decorated function and drawing conclusions about the original.

#### Comparisons

| | `LOAD_FAST` | `LOAD_GLOBAL` | `LOAD_ATTR` |
|---|---|---|---|
| Mechanism | Array index | Dict lookup | Lookup + descriptors |
| Relative cost | Lowest | Higher | Highest |

#### Complexity
Roughly linear in instructions executed; the per-instruction constant is what separates Python from compiled languages.

#### Frequently confused with
Bytecode vs. machine code.

#### Important facts to remember
- Stack machine, fetch-decode-execute.
- Locals beat globals beat attributes.
- Bytecode is version-specific.

---

### 10.10 Interpreter Optimisations

#### Definition
Runtime specialisation of bytecode (PEP 659, Python 3.11+), in which generic instructions rewrite themselves into type-specific forms with guards, plus cheaper frames, zero-cost exceptions and an experimental JIT in 3.13+.

#### Why it exists
Because real code is overwhelmingly monomorphic — the same call site sees the same types — and exploiting that yields large speed-ups without source changes.

#### Interview explanation
Describe the observe-specialise-guard-deoptimise cycle, name the 3.11 wins (specialisation, cheaper frames, zero-cost exceptions), and note that the JIT introduced in 3.13 remains experimental.

#### Syntax
```python
python3.13 -X jit script.py       # experimental JIT, when built with it
dis.dis(func, adaptive=True)      # show specialised instructions
```

#### Example
```python
def add(a, b):
    return a + b

# Called repeatedly with ints, BINARY_OP specialises to an int-only form.
# Pass a string once and it de-optimises back to the generic instruction.
```

#### Common interview questions
- "Why is Python 3.11 faster than 3.10?" (Specialising adaptive interpreter, cheaper frame creation, and zero-cost exception handling.)
- "What is a specialising adaptive interpreter?" (One that observes the types at each instruction and rewrites it into a faster type-specific version, guarded so it can fall back.)
- "Do you need to change code to benefit?" (No — it is automatic, though consistent types at hot call sites specialise better.)
- "Is the JIT production-ready?" (It is experimental as of 3.13 and needs a special build; treat it as something to benchmark, not to assume.)

#### Follow-up questions
- "What is de-optimisation?" (When the guard fails because a different type appears, the instruction reverts to the generic form.)
- "Does polymorphic code hurt?" (Yes — repeatedly changing types at one site prevents stable specialisation.)
- "What did zero-cost exceptions change?" (`try` blocks now cost nothing when nothing raises; the cost moved entirely to the raising path.)

#### Edge cases
- Micro-benchmarks can show regressions on paths that de-optimise repeatedly.
- The JIT's benefit is highly workload-dependent and sometimes negative.
- Specialisation interacts with tracing tools, so profiler overhead can look different across versions.

#### Common mistakes
- Expecting interpreter improvements to help I/O-bound services.
- Reading published benchmark numbers as a promise for your workload.
- Writing deliberately polymorphic hot paths.

#### Comparisons

| | Before 3.11 | 3.11+ |
|---|---|---|
| Instructions | Generic | Specialised at runtime |
| `try` setup | Small cost | Zero |
| Frames | Heavier | Cheaper |

#### Complexity
No change in asymptotic terms; constant factors improve, sometimes substantially.

#### Frequently confused with
Specialisation as a JIT — it rewrites bytecode, it does not emit machine code.

#### Important facts to remember
- PEP 659, automatic.
- Zero-cost exceptions in 3.11.
- The JIT is still experimental.

---

### 10.11 Profiling

#### Definition
Measuring where a program spends time or memory, using deterministic profilers (`cProfile`), statistical samplers (`py-spy`, `scalene`) or targeted micro-benchmarks (`timeit`).

#### Why it exists
Because performance intuition is unreliable, and optimising the wrong code is wasted effort.

#### Interview explanation
Contrast deterministic and sampling profilers, explain `tottime` versus `cumtime`, and stress that a sampling profiler can attach to a live production process without a restart.

#### Syntax
```python
cProfile.run("main()", "out.prof")
pstats.Stats("out.prof").sort_stats("tottime").print_stats(20)
timeit.timeit("f()", globals=globals(), number=10_000)
```
```bash
py-spy top --pid 1234
py-spy record -o flame.svg --pid 1234 --duration 30
```

#### Example
```python
# Narrowing down: profile → hot function → line profile → fix → re-measure
python -m cProfile -o out.prof app.py
python -m pstats out.prof        # sort cumulative, then tottime
```

#### Common interview questions
- "How do you find a performance bottleneck?" (Profile with realistic data: `cProfile` in development, a sampling profiler in production, then drill into the hot function.)
- "What is the difference between `tottime` and `cumtime`?" (Total time is spent in the function itself; cumulative includes everything it calls.)
- "Why prefer a sampling profiler in production?" (Negligible overhead and no code changes or restarts — `py-spy` attaches to a running process.)
- "What does profiling not show?" (Time spent waiting on other services, unless you also have distributed tracing.)

#### Follow-up questions
- "Why is `cProfile` misleading for fast functions?" (Its per-call instrumentation overhead can exceed the function's own cost, inflating its apparent share.)
- "How do you benchmark reliably?" (`timeit` with enough repetitions, a quiet machine, and comparison of medians — not single runs.)
- "What about async code?" (Standard profilers attribute time oddly across awaits; use async-aware tools and the event-loop lag metric.)

#### Edge cases
- Profiling changes timing, so race conditions may appear or vanish under a profiler.
- Flame graphs aggregate across threads and can hide per-thread stalls.
- A profile of a warm cache differs completely from one of a cold start.

#### Common mistakes
- Profiling toy data.
- Optimising the top entry without checking call counts.
- Skipping the re-measure after the change.

#### Comparisons

| | `cProfile` | `py-spy` |
|---|---|---|
| Method | Instrumentation | Sampling |
| Overhead | High | Very low |
| Production-safe | No | Yes |
| Accuracy | Exact counts | Statistical |

#### Frequently confused with
Benchmarking (comparing alternatives) vs. profiling (locating cost).

#### Important facts to remember
- Measure, change, measure again.
- Sampling profilers are production-safe.
- `tottime` for hot code, `cumtime` for hot paths.

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

#### Definition
`open()` acquires an OS file descriptor and returns a layered file object; `with` guarantees it is closed on every exit path.

#### Why it exists
File descriptors are a limited, process-wide resource whose lifetime must be managed explicitly.

#### Interview explanation
Describe the layers (raw, buffered, text), then the mode table — especially that `w` truncates — and finish with descriptor exhaustion as the practical failure when files are not closed.

#### Syntax
```python
open(path, mode="r", encoding=None, newline=None, buffering=-1)
with open(path, "x") as fh: ...       # fails if it already exists
Path(path).read_text(encoding="utf-8")
```

#### Example
```python
from pathlib import Path

def append_line(path: Path, line: str) -> None:
    with path.open("a", encoding="utf-8") as fh:
        fh.write(line + "\n")
```

#### Common interview questions
- "Why use `with` when opening files?" (It closes the file on every exit path, including exceptions, releasing the descriptor deterministically.)
- "What does mode `w` do to an existing file?" (Truncates it to zero length immediately on open.)
- "What is mode `x` for?" (Exclusive creation — it raises `FileExistsError` rather than overwriting, which avoids a check-then-open race.)
- "What happens if you never close files?" (Descriptors accumulate until the process hits its limit and raises `OSError: Too many open files`.)

#### Follow-up questions
- "Does CPython close files automatically?" (Reference counting usually does promptly, but not if a traceback holds the frame, not in a cycle, and not deterministically on other implementations.)
- "How do you open a file relative to the module?" (`Path(__file__).parent / "data.json"` — the working directory is not reliable.)
- "What is `ResourceWarning`?" (A warning emitted when a file is garbage collected unclosed; visible in development mode.)

#### Edge cases
- Opening with `w` and then failing mid-write leaves a truncated file.
- On Windows, an open file cannot always be renamed or deleted.
- Reading a file while another process rewrites it can yield a mix of old and new content unless the writer is atomic.

#### Common mistakes
- Opening without `with`.
- Using `w` to test existence.
- Relying on garbage collection to close files.

#### Comparisons

| | `open()` | `Path.read_text()` |
|---|---|---|
| Streaming | Yes | No — loads all |
| Closes itself | With `with` | Always |
| Best for | Large or incremental | Small files |

#### Complexity
Open and close are system calls; reads are buffered, so cost is dominated by bytes transferred.

#### Frequently confused with
`w` versus `a` — one destroys the file, the other extends it.

#### Important facts to remember
- Always use `with`.
- `w` truncates.
- Descriptors are finite.

---

### 11.2 Text and Binary I/O

#### Definition
Text mode decodes bytes to `str` with a codec and translates newlines; binary mode transfers `bytes` unchanged.

#### Why it exists
Because text needs an encoding and non-text data must not be interpreted at all.

#### Interview explanation
State that the encoding is never stored in the file, so it must be supplied; mention that the default is platform-dependent (UTF-8 mode becomes the default in 3.15); and explain `errors=` as the choice between failing loudly and surviving.

#### Syntax
```python
open(p, encoding="utf-8")                 # text
open(p, "rb")                             # binary
open(p, encoding="utf-8", errors="replace")
open(p, newline="")                       # no newline translation (CSV)
b.decode("utf-8"); s.encode("utf-8")
```

#### Example
```python
# Detect a BOM and strip it while reading
with open(path, encoding="utf-8-sig") as fh:
    data = fh.read()

# Copy a binary file in chunks
with open(src, "rb") as fin, open(dst, "wb") as fout:
    while chunk := fin.read(1 << 20):
        fout.write(chunk)
```

#### Common interview questions
- "What is the difference between text and binary mode?" (Text decodes to `str` and translates newlines; binary returns raw `bytes`.)
- "What encoding does Python use by default?" (The locale's preferred encoding — not necessarily UTF-8 — which is why you should always pass it explicitly.)
- "What does `errors='replace'` do?" (Substitutes U+FFFD for undecodable bytes instead of raising, letting processing continue with visible corruption.)
- "Why does the `csv` module need `newline=''`?" (It handles line endings itself; text-mode translation on top of that produces blank rows.)

#### Follow-up questions
- "What is `utf-8-sig`?" (UTF-8 with the BOM stripped on read — common for files exported from Excel.)
- "What is `surrogateescape`?" (An error handler that round-trips undecodable bytes, so a file can be read and rewritten byte-for-byte.)
- "How do you detect an unknown encoding?" (You guess — `charset-normalizer` or `chardet` — or you require the producer to declare it. Detection is never reliable.)

#### Edge cases
- Reading UTF-16 as UTF-8 often succeeds with garbage rather than raising.
- Line iteration in binary mode splits on `\n` only, ignoring `\r\n`.
- A file written with `errors="ignore"` silently loses data with no record of what was dropped.

#### Common mistakes
- Omitting `encoding=`.
- Using text mode for binary data.
- Choosing `ignore` where `replace` or `strict` was appropriate.

#### Comparisons

| | Text mode | Binary mode |
|---|---|---|
| Returns | `str` | `bytes` |
| Encoding | Required | None |
| Newlines | Translated | Untouched |

#### Frequently confused with
`encode` versus `decode` — encode goes to bytes.

#### Important facts to remember
- Always pass `encoding="utf-8"`.
- `newline=""` for CSV.
- Binary mode never translates.

---

### 11.3 Paths with pathlib

#### Definition
An object-oriented path API where `/` joins components and methods perform filesystem operations.

#### Why it exists
To replace error-prone string manipulation and the scattered `os.path` functions with one portable, readable abstraction.

#### Interview explanation
Show joining with `/`, the component properties, and `resolve()` for normalisation — then connect `resolve` to path-traversal validation, which is the security angle interviewers like.

#### Syntax
```python
Path("/a") / "b" / "c.txt"
p.name, p.stem, p.suffix, p.parent, p.parts
p.exists(), p.is_file(), p.mkdir(parents=True, exist_ok=True)
p.glob("*.py"), p.rglob("**/*.json")
p.resolve(), p.expanduser(), p.relative_to(root)
```

#### Example
```python
def safe_join(root: Path, user_path: str) -> Path:
    candidate = (root / user_path).resolve()
    if not candidate.is_relative_to(root.resolve()):    # 3.9+
        raise ValueError("path escapes the root directory")
    return candidate
```

#### Common interview questions
- "Why use `pathlib` over `os.path`?" (Readable joining, richer methods on one object, platform-correct behaviour, and paths that carry structure rather than being strings.)
- "How do you join paths safely?" (The `/` operator, never string concatenation — and validate with `resolve()` plus `is_relative_to` for untrusted input.)
- "What is the difference between `glob` and `rglob`?" (`rglob` recurses into subdirectories; `glob` matches one level unless the pattern says otherwise.)
- "How do you prevent path traversal?" (Resolve the candidate and confirm it is still inside the intended root.)

#### Follow-up questions
- "What is `PurePath`?" (Path manipulation without touching the filesystem — useful for handling foreign-platform paths.)
- "Does `Path` work with libraries expecting strings?" (Most accept path-like objects via `os.fspath`; otherwise pass `str(path)`.)
- "How do you iterate a huge directory?" (`os.scandir` or `Path.iterdir` — both lazy, unlike building a list of everything.)

#### Edge cases
- `Path("")` is `Path(".")`, which surprises validation code.
- `resolve()` follows symlinks, which may leave the intended root.
- Case sensitivity differs by filesystem, so two paths can compare unequal but refer to the same file.

#### Common mistakes
- String concatenation for paths.
- Trusting user input without resolving.
- Materialising a huge directory listing.

#### Comparisons

| | `os.path` | `pathlib` |
|---|---|---|
| Style | Functions on strings | Methods on objects |
| Joining | `os.path.join` | `/` |
| Readability | Lower | Higher |

#### Frequently confused with
`resolve()` versus `absolute()` — only the first normalises and follows symlinks.

#### Important facts to remember
- Join with `/`.
- `resolve` before validating.
- `is_relative_to` guards traversal.

---

### 11.4 Buffering and Flushing

#### Definition
Writes accumulate in a Python buffer, then in the OS page cache; `flush()` empties the first, `os.fsync()` forces the second to storage.

#### Why it exists
Because system calls are expensive and batching writes is dramatically faster — at the cost of durability on abnormal termination.

#### Interview explanation
Draw the three layers, explain why logs are truncated when a process is killed, and distinguish `flush` from `fsync` — the distinction interviewers use to separate familiarity from understanding.

#### Syntax
```python
open(p, "w", buffering=1)        # line-buffered (text mode)
fh.flush()
os.fsync(fh.fileno())
print(msg, flush=True)
```

#### Example
```python
# Durable append for an audit log
with open("audit.log", "a", encoding="utf-8") as fh:
    fh.write(record + "\n")
    fh.flush()
    os.fsync(fh.fileno())        # survives a power loss; costs an I/O round trip
```

#### Common interview questions
- "Why is output missing when a process is killed?" (It was still in the buffer and never written.)
- "What is the difference between `flush` and `fsync`?" (`flush` moves data from Python's buffer to the OS; `fsync` asks the OS to write it to physical storage.)
- "When is stdout line-buffered?" (When attached to a terminal; when redirected to a file it is block-buffered, which is why piped output appears in bursts.)
- "What does `buffering=0` do?" (Unbuffered — binary mode only; every write becomes a system call.)

#### Follow-up questions
- "How do you make logs durable without destroying throughput?" (Flush at meaningful boundaries rather than per line, or use a queue handler with a dedicated writer.)
- "Is `fsync` enough for durability?" (On most systems yes for the file's data; the containing directory also needs syncing after a rename for the entry itself to be durable.)
- "What is `PYTHONUNBUFFERED`?" (An environment variable forcing unbuffered stdout/stderr — standard in containers so logs appear immediately.)

#### Edge cases
- Several processes appending to one file can interleave writes unless each write is smaller than the atomic append size.
- `fsync` on some network filesystems does not guarantee what it does locally.
- Closing a file flushes it but does not `fsync` it.

#### Common mistakes
- Assuming `write` means durable.
- Flushing every line in a hot loop.
- Forgetting `PYTHONUNBUFFERED` in containers and losing crash logs.

#### Comparisons

| | `flush()` | `os.fsync()` |
|---|---|---|
| Moves data to | OS cache | Storage device |
| Cost | Low | High |
| Survives process kill | Yes | Yes |
| Survives power loss | No | Yes |

#### Complexity
Buffering turns many small writes into few large ones; `fsync` costs a device round trip.

#### Frequently confused with
Flush versus fsync.

#### Important facts to remember
- Buffers lose data on a kill.
- `flush` then `fsync` for durability.
- Containers want unbuffered output.

---

### 11.5 JSON

#### Definition
A text interchange format with a fixed type mapping to Python objects, handled by the `json` module.

#### Why it exists
As a language-neutral, human-readable format for APIs, configuration and logs.

#### Interview explanation
Give the type mapping and its lossy points — tuples to lists, keys to strings, no dates, sets or bytes — then cover `default=`/`object_hook` for extension and the memory problem with very large documents.

#### Syntax
```python
json.dumps(obj, default=fn, ensure_ascii=False, indent=2, sort_keys=True)
json.loads(text, object_hook=fn, parse_float=Decimal)
json.dump(obj, fh); json.load(fh)
```

#### Example
```python
from decimal import Decimal
import json

# Exact money through JSON
text = json.dumps({"total": "19.99"})                       # store as a string
data = json.loads(text, parse_float=Decimal)                # or parse to Decimal
```

#### Common interview questions
- "Which Python types does JSON not support?" (`datetime`, `set`, `bytes`, `Decimal`, tuples as distinct from lists, and non-string dict keys.)
- "How do you serialise a `datetime`?" (Convert to an ISO 8601 string, usually via the `default=` hook.)
- "What happens to tuples and integer keys?" (Tuples become lists; dict keys are converted to strings.)
- "How do you handle a JSON file larger than memory?" (Line-delimited JSON with one object per line, or a streaming parser such as `ijson`.)

#### Follow-up questions
- "What is `ensure_ascii`?" (When `True`, the default, non-ASCII characters are escaped; `False` writes real UTF-8, which is smaller and readable.)
- "Is `json` fast?" (The C accelerator is reasonable; `orjson` or `msgspec` are several times faster for high-throughput services.)
- "How do you validate parsed JSON?" (A schema layer — Pydantic, `jsonschema` — since `json.loads` only guarantees well-formed syntax.)

#### Edge cases
- `NaN` and `Infinity` are emitted by Python but are not valid JSON, and other parsers reject them.
- Very deeply nested documents can exhaust the recursion limit — a denial-of-service vector.
- Large integers round-trip in Python but lose precision in JavaScript consumers beyond 2^53.

#### Common mistakes
- Using floats for money in JSON.
- Assuming the parsed structure matches expectations without validation.
- Parsing multi-gigabyte documents in one call.

#### Comparisons

| | JSON | MessagePack | Protobuf |
|---|---|---|---|
| Human-readable | Yes | No | No |
| Size | Largest | Smaller | Smallest |
| Schema | None | None | Required |

#### Complexity
O(n) in document size, with the whole document in memory for the standard parser.

#### Frequently confused with
Well-formed JSON versus valid data — parsing is not validation.

#### Important facts to remember
- No dates, sets, bytes or tuples.
- Keys become strings.
- Validate after parsing.

---

### 11.6 CSV and Tabular Data

#### Definition
A delimited text format handled by Python's `csv` module, which implements dialects, quoting and embedded newlines correctly.

#### Why it exists
Because CSV remains the universal tabular exchange format, and naive splitting cannot parse it correctly.

#### Interview explanation
Explain why `split(",")` fails on quoted fields, show `DictReader`, and state the two practical requirements: `newline=""` and explicit type conversion, since every value arrives as a string.

#### Syntax
```python
csv.reader(fh, delimiter=",", quotechar='"')
csv.DictReader(fh)                      # rows as dicts keyed by the header
csv.DictWriter(fh, fieldnames=[...]); writer.writeheader()
csv.Sniffer().sniff(sample)             # guess the dialect
```

#### Example
```python
import csv
from decimal import Decimal

with open("orders.csv", newline="", encoding="utf-8-sig") as fh:
    for row in csv.DictReader(fh):
        total = Decimal(row["total"] or "0")       # empty fields are "" not None
        process(row["id"], total)
```

#### Common interview questions
- "Why not parse CSV with `split(',')`?" (Quoted fields may contain commas, newlines and escaped quotes; the module handles all of it.)
- "Why is `newline=''` required?" (The module performs its own line-ending handling; text-mode translation on top produces blank rows.)
- "What types come out of a CSV?" (Strings, always — every conversion is yours to perform.)
- "How do you handle a file too large to load?" (Iterate the reader row by row; it is already streaming.)

#### Follow-up questions
- "What is `utf-8-sig` for?" (Stripping the byte-order mark that Excel writes at the start of exported files.)
- "How do you handle inconsistent column counts?" (`DictReader` has `restkey` and `restval`; otherwise validate the row length explicitly.)
- "When would you choose Parquet instead?" (Whenever both ends are programs: typed, compressed, columnar and far faster to read.)

#### Edge cases
- A field containing a newline is legal and breaks any line-based preprocessing.
- `csv.field_size_limit` caps field size; huge fields raise unless it is raised.
- Excel's dialect differs by locale — semicolons are the delimiter in several regions.

#### Common mistakes
- Omitting `newline=""`.
- Assuming empty means `None`.
- Writing CSV by string formatting instead of the writer.

#### Comparisons

| | `csv` | `pandas.read_csv` | Parquet |
|---|---|---|---|
| Memory | Streaming | Whole frame | Columnar, selective |
| Types | Strings | Inferred | Declared |
| Dependency | Standard library | Heavy | Library needed |

#### Complexity
O(n) streaming; memory is one row at a time.

#### Frequently confused with
CSV as a typed format — it has no types at all.

#### Important facts to remember
- Use the `csv` module, never `split`.
- `newline=""` always.
- Everything is a string.

---

### 11.7 Pickle and Serialization Formats

#### Definition
`pickle` serialises Python objects into a byte stream whose unpickling reconstructs them by executing embedded instructions; other formats trade generality for safety, size or interoperability.

#### Why it exists
For convenient Python-to-Python transfer of arbitrary objects where both ends are trusted.

#### Interview explanation
Lead with the security property — unpickling executes code, so untrusted input is remote code execution — then compare formats on interoperability, typing and size.

#### Syntax
```python
pickle.dumps(obj, protocol=pickle.HIGHEST_PROTOCOL)
pickle.loads(data)                 # trusted sources only
json.dumps / msgpack.packb / pa.parquet.write_table
```

#### Example
```python
# Legitimate: an ML model artefact produced and consumed by your own pipeline
with open("model.pkl", "wb") as fh:
    pickle.dump(model, fh, protocol=pickle.HIGHEST_PROTOCOL)

# Illegitimate: anything arriving from a user, a queue you do not control,
# or a cache an attacker could influence.
```

#### Common interview questions
- "Why is `pickle.loads` dangerous?" (Unpickling executes instructions embedded in the data, so crafted input runs arbitrary code.)
- "When is pickle acceptable?" (Fully trusted Python-to-Python contexts: local caches, `multiprocessing`, model artefacts you produced.)
- "What cannot be pickled?" (Lambdas, local functions, open file handles, sockets, and objects holding OS resources.)
- "What would you use instead?" (JSON for interoperability, MessagePack for compactness, Protobuf or Avro for schema'd pipelines, Parquet for analytics.)

#### Follow-up questions
- "How does `multiprocessing` use pickle?" (Arguments and return values are pickled to cross the process boundary, which is why they must be picklable.)
- "What breaks pickles over time?" (They embed module and class paths, so any rename or move invalidates stored pickles.)
- "How do you make a class picklable?" (Ensure it is importable at module level and implement `__reduce__` or `__getstate__`/`__setstate__` if the default is insufficient.)

#### Edge cases
- Pickle protocol versions are not backwards compatible — a newer protocol cannot be read by older Python.
- Pickling a large object graph can be slower and larger than a purpose-built format.
- A "safe" restricted unpickler is difficult to get right and is not a supported security boundary.

#### Common mistakes
- Accepting pickles from any external source.
- Using pickle for long-term storage.
- Pickling objects holding connections.

#### Comparisons

| | Pickle | JSON |
|---|---|---|
| Arbitrary objects | Yes | No |
| Cross-language | No | Yes |
| Safe on untrusted input | No | Yes |
| Human-readable | No | Yes |

#### Frequently confused with
Pickle as a data format — it is a serialised program.

#### Important facts to remember
- Never unpickle untrusted data.
- Python-only and refactor-fragile.
- Used internally by `multiprocessing`.

---

### 11.8 Temporary Files and Atomic Writes

#### Definition
`tempfile` creates uniquely named files securely; an atomic write completes into a temporary file and then `os.replace()`s it over the target.

#### Why it exists
So that a crash or a concurrent reader never observes a partially written file, and so temporary names cannot be predicted and hijacked.

#### Interview explanation
Describe write-temp, flush, fsync, replace — and note that the temporary file must be on the same filesystem, because only then is the rename atomic.

#### Syntax
```python
tempfile.NamedTemporaryFile(dir=..., delete=False)
tempfile.TemporaryDirectory()
tempfile.mkstemp(dir=target_dir)
os.replace(tmp, target)          # atomic within a filesystem
```

#### Example
```python
import json, os, tempfile
from pathlib import Path

def write_json_atomic(path: Path, data) -> None:
    fd, tmp = tempfile.mkstemp(dir=path.parent)
    with os.fdopen(fd, "w", encoding="utf-8") as fh:
        json.dump(data, fh)
        fh.flush(); os.fsync(fh.fileno())
    os.replace(tmp, path)
```

#### Common interview questions
- "How do you write a file atomically?" (Write to a temporary file in the same directory, flush and fsync it, then `os.replace` it over the target.)
- "Why must the temporary file be in the same directory?" (`os.replace` is atomic only within one filesystem; across filesystems it becomes a copy and delete.)
- "Why use `tempfile` rather than a fixed name?" (Unique names and restrictive permissions prevent symlink and race attacks on predictable paths.)
- "Does this give you transactions?" (For one file, yes; several files still need a coordination mechanism.)

#### Follow-up questions
- "What about the directory entry's durability?" (After the rename, `fsync` on the containing directory makes the entry durable too.)
- "How do you clean up if the write fails?" (Delete the temporary file in an `except` or `finally` block — otherwise stray temporaries accumulate.)
- "What does `TemporaryDirectory` give you?" (A directory removed automatically on exit, ideal for tests and for staging multi-file output.)

#### Edge cases
- On Windows, `os.replace` can fail if the target is open in another process.
- `NamedTemporaryFile(delete=True)` cannot usually be reopened by name on Windows.
- A `/tmp` on a separate filesystem silently breaks atomicity if you rename from it.

#### Common mistakes
- Writing directly over a live file.
- Using a predictable temporary name.
- Renaming across filesystems and assuming atomicity.

#### Comparisons

| | Direct write | Atomic write |
|---|---|---|
| Partial state visible | Yes | No |
| Crash safety | Poor | Old or new, never both |
| Cost | Lower | Extra fsync and rename |

#### Frequently confused with
`os.rename` versus `os.replace` — the latter overwrites an existing target on every platform.

#### Important facts to remember
- Temp file in the same directory.
- flush, fsync, replace.
- `tempfile` for secure names.

---

### 11.9 Streaming Large Files

#### Definition
Processing a file incrementally — line by line or in fixed chunks — so memory is bounded by the chunk rather than by the file.

#### Why it exists
Because files routinely exceed available memory, and streaming lets work begin before the last byte is read.

#### Interview explanation
Show line iteration and the walrus-based chunk loop, state the memory guarantee, and add the caveat that one line is still one allocation, so unbounded lines are a risk.

#### Syntax
```python
for line in fh: ...                     # line at a time
while chunk := fh.read(65536): ...      # fixed-size chunks
itertools.islice(fh, 1000)              # first n lines
mmap.mmap(fh.fileno(), 0, access=ACCESS_READ)
```

#### Example
```python
import hashlib

def file_digest(path, algo="sha256"):
    h = hashlib.new(algo)
    with open(path, "rb") as fh:
        while chunk := fh.read(1 << 20):     # 1 MB at a time
            h.update(chunk)
    return h.hexdigest()
```

#### Common interview questions
- "How do you process a file larger than memory?" (Stream it — iterate lines or read fixed-size chunks — so memory stays proportional to the chunk.)
- "Is line iteration always safe?" (No — a file with no newlines makes one line the whole file; bound the read for untrusted input.)
- "What is `mmap` for?" (Mapping a file into the address space for random access without loading it, letting the OS page data in on demand.)
- "How do you read a compressed file without decompressing it to disk?" (`gzip.open` and friends provide the same file-like interface.)

#### Follow-up questions
- "What chunk size should you use?" (64 KB to 1 MB typically — large enough to amortise system calls, small enough to bound memory.)
- "How do you parallelise a large file?" (Split by byte ranges aligned to record boundaries, and process ranges in separate workers.)
- "What does the walrus operator add here?" (It assigns and tests in one expression, which is the idiomatic chunk loop since 3.8.)

#### Edge cases
- Reading and writing the same file simultaneously requires care with buffering and position.
- `mmap` on a file that another process truncates can raise or produce a bus error.
- Compressed streams do not support seeking efficiently.

#### Common mistakes
- `fh.read()` on unbounded input.
- Assuming lines are bounded.
- Loading a whole file to compute something incremental.

#### Comparisons

| | `read()` | Iteration | `mmap` |
|---|---|---|---|
| Memory | Whole file | One line | Virtual, paged |
| Random access | Yes | No | Yes |
| Best for | Small files | Text records | Large binary |

#### Complexity
O(n) time, O(chunk) memory.

#### Frequently confused with
Streaming versus lazy loading — streaming still reads everything, just not all at once.

#### Important facts to remember
- Bound the read.
- One line is one allocation.
- `mmap` for random access.

---

### 11.10 Network I/O

#### Definition
Reading and writing over sockets, in practice through protocol libraries — HTTP clients, database drivers, async streams — with timeouts, retries and pooling.

#### Why it exists
Because most Python programs spend their waiting time on the network, and that waiting is what concurrency addresses.

#### Interview explanation
Contrast local and network I/O failure modes, insist on explicit timeouts, and cover connection pooling plus retry-with-back-off as the two things that make a client production-ready.

#### Syntax
```python
httpx.Client(timeout=httpx.Timeout(5.0, connect=2.0), limits=httpx.Limits(...))
response.raise_for_status()
socket.setdefaulttimeout(10)
async with httpx.AsyncClient() as client: await client.get(url)
```

#### Example
```python
import httpx, time

def get_with_retry(client, url, attempts=3):
    for attempt in range(attempts):
        try:
            r = client.get(url)
            r.raise_for_status()
            return r.json()
        except (httpx.TimeoutException, httpx.HTTPStatusError) as exc:
            if attempt == attempts - 1:
                raise
            time.sleep(min(30, 2 ** attempt))     # exponential back-off
```

#### Common interview questions
- "What is the most common mistake in network code?" (No timeout — the call can hang for minutes, holding a worker.)
- "Why reuse an HTTP client?" (Connection pooling avoids repeating TCP and TLS handshakes, which dominate the cost of small requests.)
- "How should retries be implemented?" (Only for idempotent operations, with exponential back-off and jitter, and a cap on attempts.)
- "What does `raise_for_status` do?" (Raises for 4xx and 5xx responses, which are otherwise returned as ordinary responses and easily ignored.)

#### Follow-up questions
- "What is jitter for?" (Randomising back-off so many clients do not retry in lockstep and create a thundering herd.)
- "How do you handle a slow dependency?" (Timeouts plus a circuit breaker, so a failing service is skipped rather than consuming every worker.)
- "Which timeouts matter?" (Connect, read and total — a read timeout alone does not bound a slow trickle of bytes.)

#### Edge cases
- A socket read can return fewer bytes than requested; protocol code must loop.
- DNS resolution is often synchronous and can block even in async code.
- Retrying a non-idempotent POST can duplicate a payment or an order.

#### Common mistakes
- Omitting timeouts.
- A new client per request.
- Blind retries on non-idempotent operations.

#### Comparisons

| | File I/O | Network I/O |
|---|---|---|
| Failure rate | Low | High |
| Failure speed | Fast | Slow without timeouts |
| Partial reads | Rare | Normal |

#### Complexity
Latency-dominated; concurrency, not CPU, is what improves throughput.

#### Frequently confused with
Timeouts as an optional refinement rather than a requirement.

#### Important facts to remember
- Always set timeouts.
- Reuse pooled clients.
- Retry only idempotent operations.

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

#### Definition
Annotations recorded in `__annotations__` that describe expected types; the interpreter stores them and does not enforce them.

#### Why it exists
To give tools and readers the type information dynamic typing omits, without changing runtime behaviour.

#### Interview explanation
Say clearly that hints are metadata, not checks, then cover modern syntax (`list[int]`, `X | None`), gradual typing, and the annotation-evaluation changes from PEP 563 to PEP 649.

#### Syntax
```python
def f(x: int, y: str = "a") -> bool: ...
values: list[int] = []
maybe: str | None = None
from typing import Final, ClassVar, TypeAlias
```

#### Example
```python
from collections.abc import Iterable, Sequence

def summarise(rows: Iterable[dict[str, int]]) -> dict[str, int]:
    totals: dict[str, int] = {}
    for row in rows:
        for key, value in row.items():
            totals[key] = totals.get(key, 0) + value
    return totals
```

#### Common interview questions
- "Are type hints enforced at runtime?" (No — they are metadata; enforcement requires a checker like mypy or a validator like Pydantic.)
- "How do you express an optional value?" (`X | None` since 3.10, or `Optional[X]` before that.)
- "What is gradual typing?" (Annotating incrementally; unannotated code is treated as `Any` and not checked.)
- "Why would a forward reference need quotes?" (Annotations are evaluated at definition time, so a name defined later must be a string — unless `from __future__ import annotations` or PEP 649 lazy evaluation applies.)

#### Follow-up questions
- "What changed in PEP 649?" (Python 3.14 evaluates annotations lazily, only when read, which removes both the runtime cost and most forward-reference problems.)
- "Do hints slow code down?" (No meaningful runtime cost; the only cost was evaluating annotation expressions at definition time.)
- "What should you annotate first?" (Public function signatures and module boundaries — the highest value per annotation.)

#### Edge cases
- `Final` and `ClassVar` are checker-only hints with no runtime effect.
- `Any` silences checking through it, so one untyped dependency can hide many errors.
- Annotations on module-level variables are recorded but the variable need not exist.

#### Common mistakes
- Expecting runtime enforcement.
- Annotating `str` where `str | None` is possible.
- Using `typing.List` in new code.

#### Comparisons

| | Type hint | Runtime validation |
|---|---|---|
| Checked | By a separate tool | During execution |
| Cost | None | Real |
| Scope | Your code | External data |

#### Frequently confused with
Type hints as runtime type checking.

#### Important facts to remember
- Metadata, not enforcement.
- `X | None` in modern code.
- PEP 649 makes annotations lazy.

---

### 12.2 Generics and Type Variables

#### Definition
Parameterised types (`list[int]`, `Stack[T]`) and type variables that let a signature express relationships between input and output types.

#### Why it exists
So containers and utilities can be typed once and remain precise for every element type.

#### Interview explanation
Explain a type variable as a placeholder bound per call, show PEP 695 syntax alongside the older `TypeVar` form, and mention variance with the `list[Dog]` is not `list[Animal]` example.

#### Syntax
```python
def first[T](items: Sequence[T]) -> T | None: ...       # 3.12+
class Box[T]: ...

T = TypeVar("T")                                        # pre-3.12
def first_old(items: Sequence[T]) -> T | None: ...
```

#### Example
```python
from collections.abc import Callable, Iterable

def group_by[T, K](items: Iterable[T], key: Callable[[T], K]) -> dict[K, list[T]]:
    out: dict[K, list[T]] = {}
    for item in items:
        out.setdefault(key(item), []).append(item)
    return out
```

#### Common interview questions
- "What is a type variable?" (A placeholder the checker binds per call, letting a signature say the return type matches the argument type.)
- "Why is `list[Dog]` not a `list[Animal]`?" (Lists are mutable: code expecting `list[Animal]` could append a `Cat`, breaking the original. Read-only `Sequence[Animal]` does accept `Sequence[Dog]`.)
- "What is PEP 695?" (Python 3.12's inline generic syntax — `def f[T](...)` and `class C[T]` — replacing explicit `TypeVar` declarations.)
- "Do generics exist at runtime?" (No — they are erased; `isinstance(x, list[int])` raises `TypeError`.)

#### Follow-up questions
- "What should a function accept and return?" (Accept the widest usable type — `Iterable` or `Sequence` — and return the most concrete one you can promise.)
- "What is a bounded type variable?" (One restricted to subtypes of a given type, so the function may use that type's operations.)
- "What is `ParamSpec` for?" (Preserving a wrapped function's parameter signature in a decorator, so the decorated function stays correctly typed.)

#### Edge cases
- `Callable[..., T]` erases parameter information; `ParamSpec` preserves it.
- Deeply nested generics become unreadable — a type alias usually helps.
- Runtime introspection of generics needs `typing.get_type_hints` and `get_args`/`get_origin`.

#### Common mistakes
- Annotating `list[X]` for a parameter that is only iterated.
- Assuming generics are checked at runtime.
- Reaching for `Any` instead of a type variable.

#### Comparisons

| | `list[T]` | `Sequence[T]` | `Iterable[T]` |
|---|---|---|---|
| Mutable | Yes | No | No |
| Indexable | Yes | Yes | No |
| Accepts generators | No | No | Yes |

#### Frequently confused with
Generics as runtime constraints.

#### Important facts to remember
- Erased at runtime.
- Accept wide, return narrow.
- PEP 695 is the modern syntax.

---

### 12.3 Static Type Checking

#### Definition
Analysing annotated source without executing it to find inconsistencies — mypy and pyright being the standard tools.

#### Why it exists
To catch type errors, missing `None` handling and signature mismatches before the code runs, and to make large refactors safe.

#### Interview explanation
Describe narrowing through control flow, the practical adoption path (lenient first, tighten per module), and the honest limit: `Any` from untyped dependencies silences checking.

#### Syntax
```bash
mypy src/
pyright src/
```
```toml
[tool.mypy]
strict = true
[[tool.mypy.overrides]]
module = "legacy.*"
ignore_errors = true
```

#### Example
```python
def parse_port(raw: str | None) -> int:
    if raw is None:
        return 8080          # narrowed: below here raw is str
    return int(raw)
```

#### Common interview questions
- "What does a type checker catch?" (Wrong argument and return types, missing `None` handling, unreachable branches, misspelled attributes and incompatible overrides.)
- "What is type narrowing?" (The checker following control flow, so after `if x is None: return` the remaining code sees the non-`None` type.)
- "How do you introduce typing into a large untyped codebase?" (Start lenient, annotate boundaries first, tighten settings per module, and run the checker in CI so it cannot regress.)
- "What are the limits?" (It proves type consistency only — logic errors, wrong values and untyped dependencies remain invisible.)

#### Follow-up questions
- "mypy or pyright?" (pyright is much faster and is what VS Code uses; mypy is the reference implementation with a large plugin ecosystem. Many teams run pyright in the editor and mypy in CI.)
- "What is a stub file?" (A `.pyi` file providing types for code you cannot annotate directly, including C extensions.)
- "How do you handle a dynamic pattern the checker cannot express?" (A narrow `# type: ignore[code]` with a comment, or `typing.cast` where you genuinely know better.)

#### Edge cases
- Decorators without `ParamSpec` erase the wrapped signature.
- `Any` propagates silently through expressions.
- Checkers disagree in places, so pick one as authoritative for CI.

#### Common mistakes
- Turning on strict mode from day one and disabling it a week later.
- Blanket `# type: ignore`.
- Not running the checker in CI, so annotations quietly drift.

#### Comparisons

| | mypy | pyright |
|---|---|---|
| Speed | Slower | Very fast |
| Editor | Plugin | Native (Pylance) |
| Defaults | Lenient | Stricter |

#### Frequently confused with
Type checking as proof of correctness.

#### Important facts to remember
- Narrowing follows control flow.
- `Any` disables checking.
- It must run in CI.

---

### 12.4 Runtime Validation

#### Definition
Checking and coercing external data at runtime against a declared schema — in Python, most commonly with Pydantic, which derives the schema from annotations.

#### Why it exists
Because type hints are not enforced, and data from outside the program is exactly where wrong types and missing fields arrive.

#### Interview explanation
Draw the boundary: validate once at the edge, then trust typed objects internally. Contrast dataclass (no checks), TypedDict (shape only) and Pydantic (validation and coercion), and mention the "parse, don't validate" principle.

#### Syntax
```python
class Payload(BaseModel):
    id: int
    email: EmailStr
    tags: list[str] = []

Payload.model_validate(data)        # raises ValidationError
Payload.model_validate_json(raw)
model.model_dump(); model.model_dump_json()
```

#### Example
```python
from pydantic import BaseModel, ValidationError

class Config(BaseModel):
    host: str
    port: int = 5432
    timeout: float = 5.0

try:
    config = Config.model_validate(toml.load(path))
except ValidationError as exc:
    raise SystemExit(f"invalid config:\n{exc}")
```

#### Common interview questions
- "Why validate at runtime if you have type hints?" (Hints are not checked, and external data can be anything — validation is what makes the annotations true.)
- "Where should validation happen?" (At trust boundaries: requests, queue messages, config files, third-party responses — once, then trust the types.)
- "Dataclass or Pydantic model?" (Dataclass for internal structures with no validation cost; Pydantic where data enters the system.)
- "What does 'parse, don't validate' mean?" (Convert unstructured input into a typed object once, so downstream code cannot receive invalid data at all.)

#### Follow-up questions
- "What changed in Pydantic v2?" (A Rust core making validation several times faster, and a renamed API — `model_validate`, `model_dump`.)
- "What is the risk of coercion?" (Silently converting `"5"` to `5` can hide an upstream bug; strict mode disables it where that matters.)
- "How does FastAPI use this?" (Endpoint annotations become request models, so validation and OpenAPI schema generation come from the same declaration.)

#### Edge cases
- Validation errors can leak input values into logs — sensitive fields need masking.
- Recursive models need careful forward references.
- Validating very large payloads is itself a cost worth measuring.

#### Common mistakes
- Treating a dataclass as validated.
- Re-validating the same data at every layer.
- Using models for everything internal, adding overhead where a dataclass suffices.

#### Comparisons

| | `dataclass` | `TypedDict` | Pydantic |
|---|---|---|---|
| Validates | No | No | Yes |
| Coerces | No | No | Yes |
| Runtime cost | Low | None | Higher |

#### Frequently confused with
Static typing versus runtime validation — they solve different halves of the problem.

#### Important facts to remember
- Validate at boundaries only.
- Dataclasses check nothing.
- Parse into typed objects once.

---

### 12.5 Structural Pattern Matching

#### Definition
`match`/`case` (Python 3.10+) compares a subject against structural patterns — literals, sequences, mappings, classes — binding parts of it as it matches.

#### Why it exists
To replace chains of `isinstance` checks and index lookups when dispatching on the shape of data.

#### Interview explanation
Show sequence, mapping and class patterns, explain that mapping patterns match partially, and warn about the bare-name capture pattern — the detail that separates people who have used it from people who have read about it.

#### Syntax
```python
match subject:
    case 200 | 201: ...                 # alternatives
    case [x, y, *rest]: ...             # sequence
    case {"type": t, **extra}: ...      # mapping (partial match)
    case Point(x=0, y=y): ...           # class pattern
    case str() as s if s.strip(): ...   # guard plus capture
    case _: ...                         # wildcard
```

#### Example
```python
def handle(message: dict):
    match message:
        case {"kind": "ping"}:
            return "pong"
        case {"kind": "sum", "values": [*nums]} if all(isinstance(n, int) for n in nums):
            return sum(nums)
        case {"kind": kind}:
            raise ValueError(f"unknown kind {kind!r}")
        case _:
            raise ValueError("malformed message")
```

#### Common interview questions
- "How does `match` differ from a switch statement?" (It matches structure and destructures it, rather than comparing a value against constants.)
- "What is the capture-pattern trap?" (A bare lowercase name matches anything and binds it — `case status:` does not compare against a variable called `status`.)
- "Do mapping patterns require an exact match?" (No — extra keys are allowed; capture them with `**rest` if you need them.)
- "How do class patterns work?" (`Point(x=0, y=y)` matches an instance whose attributes match, binding `y`; positional patterns require `__match_args__`.)

#### Follow-up questions
- "When is `match` the wrong tool?" (Simple value dispatch, where a dict of handlers is clearer and faster.)
- "Can a type checker verify exhaustiveness?" (Yes — over enums and unions it can report a missing case, which is a strong argument for using it with typed data.)
- "What is `__match_args__`?" (A class attribute naming the attributes used for positional class patterns; dataclasses generate it automatically.)

#### Edge cases
- `case (x)` is a capture, not a one-element sequence pattern — `case (x,)` is the sequence.
- Sequence patterns do not match strings, which is deliberate.
- A wildcard `case _` placed early makes every later case unreachable, with no error.

#### Common mistakes
- Comparing against a variable with a bare name.
- Using `match` where a dict lookup is clearer.
- Omitting the fallback case and letting unmatched data pass silently.

#### Comparisons

| | `match` | `if/elif` | Dict dispatch |
|---|---|---|---|
| Structure matching | Yes | Manual | No |
| Destructuring | Yes | Manual | No |
| Best for | Shaped data | Conditions | Key to handler |

#### Frequently confused with
`match` as a switch statement.

#### Important facts to remember
- Matches shape, not just value.
- Bare names capture, they do not compare.
- Mapping patterns are partial.

---

### 12.6 Modern Syntax Features

#### Definition
Syntax added in recent releases that is now standard: f-strings, the walrus operator, union syntax, built-in generics, dict merging and positional-only parameters.

#### Why it exists
To remove recurring boilerplate and make common intent directly expressible.

#### Interview explanation
Name the feature, the version and what it replaced. `f"{x=}"` for debugging and the walrus operator in read loops are the two most likely to come up in practice.

#### Syntax
```python
f"{value!r:>10}"; f"{count=}"
while (chunk := f.read(8192)): ...
def f(a, /, b, *, c): ...
merged = defaults | overrides
values: list[int]; maybe: str | None
```

#### Example
```python
# Before
match = pattern.search(line)
if match:
    use(match.group(1))

# After
if (match := pattern.search(line)):
    use(match.group(1))
```

#### Common interview questions
- "What is the walrus operator for?" (Assigning within an expression, so a value can be computed once and both tested and used — typical in read loops and comprehension filters.)
- "What does `f'{x=}'` produce?" (The expression text and its value, e.g. `x=42` — a debugging shortcut added in 3.8.)
- "What replaced `Optional[X]`?" (`X | None`, since 3.10.)
- "Why do positional-only parameters exist?" (So a library can rename parameters without breaking callers, and to match the behaviour of C-implemented builtins.)

#### Follow-up questions
- "What changed about f-strings in 3.12?" (PEP 701 moved them into the main grammar, allowing nested quotes of the same type, backslashes and nested f-strings.)
- "Is `|` merging the same as `update`?" (`a | b` returns a new dict; `a |= b` and `a.update(b)` mutate in place.)
- "When does the walrus operator hurt readability?" (When it packs two unrelated ideas into one line — it exists to remove duplication, not to shorten code.)

#### Edge cases
- The walrus operator inside a comprehension binds in the enclosing scope, deliberately.
- `f"{x=}"` includes surrounding whitespace exactly as written inside the braces.
- Each feature raises the minimum supported Python version, which matters for libraries.

#### Common mistakes
- Using legacy `typing.List` and `Optional` in new code.
- Overusing the walrus operator.
- Assuming new syntax is available on older runtimes.

#### Comparisons

| | `%` | `.format()` | f-string |
|---|---|---|---|
| Readability | Low | Medium | High |
| Speed | Slow | Slow | Fastest |
| Template from data | Yes | Yes | No |

#### Frequently confused with
f-strings as safe for user templates — they execute expressions and must never be built from untrusted text.

#### Important facts to remember
- `f"{x=}"` for debugging.
- Walrus removes duplicate calls.
- `X | None` over `Optional[X]`.

---

### 12.7 Testing with pytest

#### Definition
A test framework that collects `test_*` functions, rewrites assertions for informative failures, and injects fixtures by parameter name.

#### Why it exists
To make writing a test as cheap as writing a function, so tests actually get written.

#### Interview explanation
Cover fixtures with `yield` teardown, scopes, and parametrisation. If asked about design, connect mock count to coupling: a test needing many patches is describing a design problem.

#### Syntax
```python
@pytest.fixture(scope="module")
def client(): yield make_client()

@pytest.mark.parametrize("value,expected", [(1, 2), (2, 4)])
def test_double(value, expected): assert double(value) == expected

with pytest.raises(ValueError, match="invalid"): parse("x")
```

#### Example
```python
@pytest.fixture
def user(db):                       # fixtures can depend on fixtures
    u = db.create_user(email="a@example.com")
    yield u
    db.delete_user(u.id)

def test_login(client, user):
    assert client.post("/login", json={"email": user.email}).status_code == 200
```

#### Common interview questions
- "What is a fixture?" (A function providing test dependencies, requested by parameter name, with teardown after `yield`.)
- "What do fixture scopes control?" (How often the fixture is created — per function, class, module or session — trading setup cost against isolation.)
- "How do you test many inputs?" (`@pytest.mark.parametrize`, which reports each case separately.)
- "How do you assert an exception?" (`with pytest.raises(ExcType)`, optionally with `match=` for the message, and inspecting `exc_info.value` for attributes.)

#### Follow-up questions
- "What is `conftest.py`?" (A file of fixtures and hooks shared by every test in that directory and below, with no import needed.)
- "How do you test async code?" (`pytest-asyncio` with `@pytest.mark.asyncio`, or `anyio`'s plugin.)
- "What built-in fixtures do you use most?" (`tmp_path`, `monkeypatch`, `caplog`, `capsys` — they replace most hand-written helpers.)

#### Edge cases
- Session-scoped mutable fixtures create order-dependent tests.
- `pytest.raises(match=...)` takes a regex, so special characters must be escaped.
- Parametrised IDs come from the values; give explicit `ids=` when they are unreadable.

#### Common mistakes
- Asserting on log or exception message text rather than types and attributes.
- Over-mocking instead of injecting collaborators.
- Shared state between tests through module-level globals.

#### Comparisons

| | `unittest` | `pytest` |
|---|---|---|
| Style | Classes, `assertEqual` | Functions, plain `assert` |
| Setup | `setUp` | Fixtures |
| Failure output | Basic | Rich, shows values |

#### Frequently confused with
Fixtures versus mocks — one provides dependencies, the other fakes behaviour.

#### Important facts to remember
- Fixtures inject by name.
- `yield` marks teardown.
- Parametrise instead of looping inside a test.

---

### 12.8 Linting and Formatting

#### Definition
Automated style enforcement (formatter) and static bug detection (linter), commonly `ruff` — which does both — alongside or in place of `black` and flake8.

#### Why it exists
To end style discussion and to catch mechanical mistakes before a human reads the code.

#### Interview explanation
Distinguish the two roles, name the rule families worth enabling, and stress running them in pre-commit and CI — a check that is not enforced is a check that erodes.

#### Syntax
```bash
ruff check --fix .
ruff format .
mypy src/
pre-commit install
```

#### Example
```toml
[tool.ruff.lint]
select = ["E", "F", "I", "B", "UP", "SIM", "RUF"]
ignore = ["E501"]

[tool.ruff.lint.per-file-ignores]
"tests/*" = ["S101"]        # asserts are fine in tests
```

#### Common interview questions
- "What is the difference between a linter and a formatter?" (A formatter rewrites layout deterministically; a linter reports likely bugs and style violations.)
- "What real bugs does a linter catch?" (Mutable default arguments, bare `except`, unused variables, shadowed builtins, `== None` comparisons, f-strings with no placeholders.)
- "Why has `ruff` displaced the older tools?" (It implements flake8 plus many plugins and a `black`-compatible formatter in one Rust binary that runs in milliseconds.)
- "Where should these run?" (Pre-commit locally and CI on every pull request, so formatting never appears in a review diff.)

#### Follow-up questions
- "How do you adopt a formatter on a large codebase?" (One formatting-only commit, recorded in `.git-blame-ignore-revs` so it does not pollute blame.)
- "What is `# noqa` for?" (Suppressing a specific rule on a line — always with the rule code, so the suppression is reviewable.)
- "Do you enforce type checking too?" (Yes — mypy or pyright in CI, since annotations that are not checked drift out of date.)

#### Edge cases
- Formatter and linter rules can conflict; disable the overlapping linter rules (line length in particular).
- Auto-fix can change behaviour in rare cases — review the diff rather than committing blindly.
- Very large rule sets generate enough noise that people stop reading the output.

#### Common mistakes
- Enabling every rule at once.
- Bare `# noqa` with no code.
- Running the tools only locally, so CI never enforces them.

#### Comparisons

| | `ruff` | `flake8` + plugins | `black` |
|---|---|---|---|
| Speed | Milliseconds | Seconds | Seconds |
| Lints | Yes | Yes | No |
| Formats | Yes | No | Yes |

#### Frequently confused with
Formatting versus linting — one is layout, the other is correctness.

#### Important facts to remember
- Formatter for layout, linter for bugs.
- Enforce in CI.
- Start with a small rule set.

---

### 12.9 Logging

#### Definition
The standard library's event-recording system: named hierarchical loggers, severity levels, handlers, formatters and propagation, configured independently of the code that logs.

#### Why it exists
Because production requires filtering, routing, levels and context — none of which `print` provides.

#### Interview explanation
Describe the record's path from logger to handler to formatter, explain `logger.exception` versus `logger.error`, and note why libraries must use `getLogger(__name__)` rather than the root logger.

#### Syntax
```python
logger = logging.getLogger(__name__)
logger.info("user %s logged in", user_id)          # lazy interpolation
logger.exception("failed")                          # inside except: adds traceback
logging.config.dictConfig(CONFIG)
```

#### Example
```python
LOGGING = {
    "version": 1,
    "formatters": {"json": {"()": "pythonjsonlogger.jsonlogger.JsonFormatter"}},
    "handlers": {"console": {"class": "logging.StreamHandler", "formatter": "json"}},
    "root": {"handlers": ["console"], "level": "INFO"},
}
logging.config.dictConfig(LOGGING)
```

#### Common interview questions
- "Why not use `print`?" (No levels, no routing, no filtering, no timestamps, no structure and no traceback support.)
- "What is the difference between `logger.error` and `logger.exception`?" (`exception` must be called from a handler and attaches the traceback automatically.)
- "Why `getLogger(__name__)`?" (It places the logger in the hierarchy under your package, so applications can configure or silence it without affecting everything else.)
- "Why pass arguments rather than f-strings?" (Interpolation is deferred until the record is emitted, and structured handlers can keep the fields separate.)

#### Follow-up questions
- "How do you add request context?" (A `LoggerAdapter`, a contextvar-based filter, or a structured logging library that carries bound context.)
- "What is propagation?" (Records travel up the logger hierarchy to ancestor handlers — the usual cause of duplicated log lines.)
- "How do you log in a library?" (Get a module logger and add a `NullHandler`; never configure handlers or levels on behalf of the application.)

#### Edge cases
- Configuring logging twice adds handlers twice, duplicating every line.
- Logging inside a hot loop can dominate runtime even at a disabled level, because the call still happens.
- File handlers block; high-throughput services use `QueueHandler` with a background writer.

#### Common mistakes
- `logging.info(...)` on the root logger from library code.
- f-strings in log calls.
- `logger.error(str(exc))` inside an `except` block, discarding the traceback.

#### Comparisons

| | `print` | `logging` |
|---|---|---|
| Levels | No | Yes |
| Routing | stdout only | Any handler |
| Traceback support | No | Yes |
| Configurable | No | Yes |

#### Frequently confused with
`logger.error` versus `logger.exception`.

#### Important facts to remember
- `getLogger(__name__)`.
- Lazy `%s` arguments.
- `exception()` inside handlers.

---

### 12.10 Debugging Tools

#### Definition
Interactive and post-mortem inspection: `breakpoint()`/`pdb`, post-mortem mode, `faulthandler`, and sampling tools such as `py-spy` for live processes.

#### Why it exists
Because reading code cannot show actual values in the actual failing state.

#### Interview explanation
Cover `breakpoint()` and the core `pdb` commands, then post-mortem debugging and production tools that attach without stopping the process — the second half is what distinguishes practical experience.

#### Syntax
```python
breakpoint()                          # honours PYTHONBREAKPOINT
python -m pdb -c continue script.py   # post-mortem on unhandled exception
faulthandler.enable()
```
```bash
py-spy dump --pid 1234
py-spy record -o flame.svg --pid 1234
```

#### Example
```python
import faulthandler, signal
faulthandler.enable()
faulthandler.register(signal.SIGUSR1)     # kill -USR1 <pid> dumps every thread's stack
```

#### Common interview questions
- "How do you debug a Python program?" (`breakpoint()` for interactive inspection, post-mortem `pdb` for unhandled exceptions, and a sampling profiler for live processes.)
- "How do you debug a hung production process?" (`py-spy dump` shows every thread's stack without stopping it; `faulthandler` registered on a signal does the same from inside.)
- "What does `PYTHONBREAKPOINT` do?" (Selects which debugger `breakpoint()` launches, or disables it entirely with `0`.)
- "How do you inspect the state at the point of failure?" (Post-mortem debugging — `pdb.post_mortem()` or `python -m pdb -c continue` — where the frames and locals are still intact.)

#### Follow-up questions
- "What is development mode?" (`python -X dev`: extra warnings, `ResourceWarning` enabled, faulthandler on — recommended for staging.)
- "How do you debug async code?" (Debug mode for slow callbacks, `asyncio.all_tasks()` to inspect pending tasks, and task names to identify them.)
- "Why not just use `print`?" (It requires editing and re-running, clutters output, and frequently gets committed.)

#### Edge cases
- `breakpoint()` in a server with many workers stops one worker and confuses the others.
- `pdb` cannot attach to an already-running process without a remote-debugging package.
- Sampling profilers may need elevated privileges to read another process.

#### Common mistakes
- Committing `breakpoint()` or debug prints.
- Debugging with restarts where a live dump would have answered it.
- Ignoring `ResourceWarning` and other development-mode signals.

#### Comparisons

| | `pdb` | `py-spy` |
|---|---|---|
| Stops the process | Yes | No |
| Works in production | No | Yes |
| Shows locals | Yes | Limited |

#### Frequently confused with
Debugging versus profiling — one inspects state, the other measures time.

#### Important facts to remember
- `breakpoint()` over `import pdb`.
- Post-mortem keeps the failing frames.
- `py-spy` works on live processes.

---

### 12.11 Recent Python Releases

#### Definition
Python's yearly October release cycle, with roughly five years of support per version, and the feature set each recent version added.

#### Why it exists
So the language can evolve predictably while giving users a known support window.

#### Interview explanation
Name what each recent version brought and why it matters: 3.10 pattern matching and unions, 3.11 the large speed-up and exception groups, 3.12 PEP 695 generics, 3.13 free-threading and the JIT as experiments, 3.14 free-threading officially supported and lazy annotations.

#### Syntax
```bash
python -VV                       # exact version and build
python -X dev script.py
python -X importtime script.py
```

#### Example
```toml
[project]
requires-python = ">=3.11"       # declares the floor for your package
```

#### Common interview questions
- "What is new in recent Python versions?" (3.10 pattern matching and `X | Y`; 3.11 the interpreter speed-up, zero-cost exceptions and exception groups; 3.12 PEP 695 generics and per-interpreter GIL; 3.13 experimental free-threading and JIT; 3.14 free-threading officially supported and lazy annotations.)
- "How long is a version supported?" (About five years: roughly two of bug fixes and three of security-only patches.)
- "What usually blocks an upgrade?" (Compiled dependencies without wheels for the new version, not the interpreter itself.)
- "Why upgrade at all?" (Free performance, better error messages, security patches, and avoiding a multi-version jump later.)

#### Follow-up questions
- "What is the free-threaded build's status?" (Experimental in 3.13, officially supported in 3.14, still opt-in and requiring compatible extensions.)
- "How do you prepare for an upgrade?" (Run the test suite against release candidates in CI, and check `-W error::DeprecationWarning` output on the current version.)
- "What is a PEP?" (A Python Enhancement Proposal — the design document and decision record for a language or standard-library change.)

#### Edge cases
- Standard-library modules do get removed — several went in 3.12 and 3.13 under PEP 594.
- Behaviour changes can be subtle: dictionary ordering, `asyncio` defaults, and start-method defaults have all shifted.
- Performance improvements are uneven; I/O-bound services see little from interpreter speed-ups.

#### Common mistakes
- Running an end-of-life version in production.
- Skipping several versions and upgrading in one jump.
- Assuming published benchmark figures apply to your workload.

#### Comparisons

| Version | Headline |
|---|---|
| 3.10 | Pattern matching, `X | Y` |
| 3.11 | Speed, exception groups |
| 3.12 | PEP 695 generics |
| 3.13 | Free-threaded and JIT builds (experimental) |
| 3.14 | Free-threading supported, lazy annotations |

#### Frequently confused with
Release features versus the default build — free-threading exists but is not the default.

#### Important facts to remember
- Yearly releases, ~5 years support.
- 3.11 brought the big speed-up.
- Free-threading is supported but opt-in.

---

[[#📖 Master Table of Contents|⬆ Back to top]]

*End of Group 12 — curriculum complete.*

---

## 🎓 Where to Go Next

You can now answer interview questions across the full Python surface — definitions, mechanisms, edge cases, comparisons and the traps interviewers use to separate reading from experience.

Continue to **`3_production.md`**, the final iteration: how professionals actually apply this — best practices, performance and memory, the bugs that reach incident reviews, anti-patterns, debugging and the modern-versus-deprecated split.
