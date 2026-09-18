# Python — Production

> **Goal of this file:** Show how professionals actually use each concept in real systems. After reading, you should be able to say *"I can use this correctly in production code."* Best practices, the bugs that reach incident reviews, performance, security, debugging and the modern-versus-deprecated split.

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

**Best practices:** Pin the interpreter version for every deployment — in `pyproject.toml` via `requires-python`, in the container image tag, and in CI. "Works on my machine" in Python is usually a version difference, because each minor release changes standard-library behaviour somewhere.

**Real-world use case:** Python's production footprint is overwhelmingly glue and I/O: web services, data pipelines, ML training and inference orchestration, and internal tooling. The compute-heavy parts almost always run inside a C or Rust extension — NumPy, Polars, PyTorch — with Python coordinating them.

**Performance considerations:** Before optimising Python, establish whether the workload is I/O-bound or CPU-bound. I/O-bound services scale with concurrency (threads or asyncio); CPU-bound work needs vectorised libraries, multiple processes or a native extension. Rewriting Python loops in "faster Python" rarely produces more than a small constant-factor win.

**Modern recommendations:** Target a supported release — each minor version gets roughly five years of support, and running an end-of-life interpreter means no security patches. Upgrading also brings free speed: the CPython 3.11 release alone delivered large interpreter speed-ups over 3.10.

**Anti-pattern:** Treating Python's dynamism as a design tool — patching attributes onto objects at runtime, rebinding module-level functions in library code, or relying on `eval` for configuration. It works until the day someone has to debug it.

---

### 1.2 The Interpreter, Bytecode and CPython

**Best practices:** Ship a lock file and a fixed base image so that the interpreter, the packages and the compiled extensions match what you tested against. Compiled wheels are built per Python minor version and per platform, which is why "it installed locally but not in the container" is so common.

**Debugging tips:** `python -X importtime` finds slow imports, `dis.dis` settles arguments about semantics, and `sys.settrace`-based tools (coverage, debuggers) work at the bytecode level. For production, prefer sampling profilers such as `py-spy`, which attach to a running process without modifying it.

**Performance considerations:** Start-up cost is dominated by imports, not compilation. A CLI that imports a scientific stack takes hundreds of milliseconds before it prints anything; deferring heavy imports into the functions that need them is the standard fix.

**Common production bugs:** A read-only or non-writable application directory prevents `.pyc` caching, so every process start recompiles every module — visible as slow container start-up under autoscaling. Precompile with `compileall` at image build time.

> 💡 **Tip:** `python -m compileall -q /app` during the Docker build turns repeated start-up compilation into a one-off build cost.

**Modern recommendations:** Prefer official slim images or a managed builder over compiling CPython yourself. If you do need the JIT or free-threaded builds introduced in 3.13, treat them as opt-in experiments with their own benchmarks — they are not drop-in performance upgrades for every workload.

---

### 1.3 Variables, Names and Objects

**Best practices:** Make mutation explicit and local. Functions should either return a new object or mutate one clearly named argument — never both, and never mutate a caller's collection as a side effect of a function that looks like a query.

**Common production bugs:** The mutable default argument is the classic: a cache or accumulator declared as `def handler(items=[])` slowly fills with data from every previous request, producing a memory leak and cross-request data leakage in the same bug. Use `None` and build the object inside the call.

**Debugging tips:** When two values change together unexpectedly, compare `id()` to confirm aliasing before theorising. `gc.get_referrers(obj)` shows what is holding a reference, which is how you find out why an object outlived the request that created it.

**Security implications:** Aliasing across request boundaries is a data-leakage vector, not just a correctness bug. Shared mutable module-level state in a web application — a dict used as a cache, a list of "current items" — can expose one user's data to another under concurrency.

**Anti-pattern:** Defensive `copy.deepcopy` everywhere to avoid thinking about ownership. It is slow, breaks on objects holding handles or locks, and hides the design problem rather than fixing it. Prefer immutable data at boundaries — tuples, frozen dataclasses — and copy deliberately.

---

### 1.4 Numbers and Numeric Types

**Best practices:** Represent money as integer minor units (cents) or `Decimal` with an explicit context, never as `float`. Decide the rounding mode once, centrally, and make it explicit — `ROUND_HALF_UP` for most invoicing, banker's rounding where a standard requires it.

**Common production bugs:** Float drift in aggregates: summing a million small `float` amounts accumulates error that shows up as a ledger that is a few cents off and cannot be reconciled. The same class of bug appears in percentage calculations that are compared for exact equality.

**Performance considerations:** `Decimal` is roughly an order of magnitude slower than `float`, which is irrelevant for per-transaction work and very relevant inside numeric inner loops. For bulk numeric work, use NumPy's float64 arrays and accept floating point, or keep integer cents.

**Testing advice:** Assert on floats with a tolerance — `pytest.approx` or `math.isclose` — never `==`. For money, test the rounding boundaries explicitly: `2.675`, `0.5`, negative amounts, and the smallest representable unit.

**Security implications:** Numeric input from users must be bounded before use. Python's unbounded `int` means `int(user_input) ** int(other_input)` can allocate gigabytes and stall the process — a denial-of-service vector that does not exist in fixed-width languages.

> ⚠️ **Warning:** `int("...")` on attacker-controlled strings is also quadratic for very long inputs. CPython caps integer-to-string conversion length by default (configurable via `sys.set_int_max_str_digits`) — do not raise that limit to handle untrusted input.

---

### 1.5 Strings and Text

**Best practices:** Always pass `encoding="utf-8"` when opening text files, and set `errors=` deliberately when the input is untrusted — `"replace"` to survive bad bytes, `"strict"` when corruption must fail loudly. Never rely on the platform default.

**Common production bugs:** `UnicodeDecodeError` in a background job that processed the same file type for months, because one record arrived in a different encoding. The second most common: quadratic string building in a loop that was fine for 100 rows and times out at 100,000.

**Performance considerations:** Use `str.join` for concatenation, `io.StringIO` for incremental building, and avoid repeated `.replace()` chains over large documents — compile a single `re` pattern instead. For very large text processing, reading in chunks keeps memory flat.

**Security implications:** Never build SQL, shell commands or HTML with f-strings. Use parameterised queries, `subprocess` argument lists, and a templating engine with autoescaping. Also normalise Unicode (`unicodedata.normalize("NFC", s)`) before comparing user-supplied identifiers, since visually identical strings can differ byte-for-byte.

**Logging:** Pass log arguments lazily — `logger.info("user %s failed", user_id)` rather than an f-string — so the interpolation cost is only paid when the record is actually emitted, and structured handlers can keep the fields separate.

**Testing advice:** Include non-ASCII data in fixtures as a matter of course: accented names, emoji, right-to-left text. Encoding bugs are invisible to ASCII-only test data.

---

### 1.6 Operators and Expressions

**Best practices:** Implement `__eq__` and `__hash__` together, and prefer `@dataclass(frozen=True)` or `functools.total_ordering` over writing six comparison methods by hand. Keep operator implementations cheap and side-effect free — callers assume `a + b` does not hit a database.

**Common production bugs:** A class with `__eq__` but no `__hash__` becomes unhashable, and the failure appears far from the definition — the first time someone puts an instance in a set or uses it as a dict key, often in a different service.

**Anti-pattern:** Operator overloading for domain meaning that the symbol does not carry — `user1 + user2` to merge records, or `>>` to build a pipeline. Clever DSLs built on operators are unreadable to everyone who did not write them and are hard to type-check.

**Debugging tips:** When an operation raises `TypeError: unsupported operand type(s)`, both sides declined. Check whether a reflected method (`__radd__`) is missing on the right-hand operand's type, especially when mixing your class with NumPy scalars, which have their own dispatch rules.

**Framework relevance:** SQLAlchemy, pandas and Django query objects overload comparison operators to build expression trees rather than compute booleans. That means `if query_column == 5:` is a truth-value test on an expression object, not a comparison — a well-known source of silent bugs.

---

### 1.7 Control Flow Statements

**Best practices:** Iterate over items, not indices; use `enumerate` when the index is genuinely needed and `zip(..., strict=True)` when two sequences must be the same length. Keep loop bodies small enough that the exit conditions are visible at a glance.

**Common production bugs:** Mutating a list while iterating it, which silently skips records — the resulting "some rows were not processed" bug is hard to reproduce because it depends on which items matched. Building a new list or iterating over a copy removes the entire class of bug.

**Performance considerations:** Push loops into C where possible: `sum()`, `any()`, `all()`, `map()` and comprehensions run their iteration in the interpreter's C code rather than in Python bytecode. For large data, a vectorised NumPy or Polars operation replaces the loop entirely.

**Debugging tips:** For loops that occasionally do the wrong thing on one input, log the loop variable and the decision, not just the outcome. Structural pattern matching in particular deserves a fallback `case _:` that logs the unmatched shape rather than silently ignoring it.

**Anti-pattern:** Deep nesting of `if` inside `for` inside `try`. Extract the body into a function and use guard clauses — Python's indentation makes nesting cost immediately visible, and reviewers will flag it.

> ⚠️ **Warning:** In a `match` statement, `case Status:` binds anything to the name `Status` instead of comparing against it. Always use a dotted name (`case Status.OPEN:`) or a literal for constants.

---

### 1.8 Functions and Parameters

**Best practices:** Keep signatures small and make optional behaviour keyword-only, so call sites read as documentation. Use `None` as the default for any mutable parameter, and annotate types even when nothing enforces them — reviewers and IDEs both use them.

**Common production bugs:** Mutable defaults accumulating state between calls, and defaults computed at import time (`timestamp=datetime.now()`) that freeze for the process lifetime. Both look correct in review unless you know the rule.

**Testing advice:** Test the boundary of the signature, not just the happy path: no optional arguments, all of them, and the falsy-but-valid values (`0`, `""`, `[]`) that a careless `if not value:` would reject.

**Maintainability:** A function with more than a handful of parameters is usually hiding a missing object. Group related parameters into a dataclass — it makes the call site readable and gives you one place to validate.

**Framework relevance:** Frameworks read signatures through `inspect.signature`: FastAPI derives request validation from parameter annotations, pytest injects fixtures by parameter name, and Click builds CLI options from them. That is why renaming a parameter in framework-facing code is a breaking change, and why positional-only markers matter in libraries.

---

### 1.9 Scope and Namespaces

**Best practices:** Pass state in and return it out. Module-level mutable globals are shared by every request, thread and coroutine in the process, so treat them as the concurrency hazard they are — if you need process-wide state, wrap it in something with an explicit lock or use a proper cache.

**Common production bugs:** Late-binding closures in loops — registering handlers or building partial functions inside a `for` loop and having every one of them capture the final value. The symptom is "all my callbacks act on the last item".

**Debugging tips:** `UnboundLocalError` always means the name is assigned somewhere in that function. Search the function body for the assignment rather than looking outward for a missing global; the fix is usually a rename, not a `global` declaration.

**Performance considerations:** In a genuinely hot loop, binding a global or an attribute to a local first (`append = out.append`) removes a dictionary lookup per iteration. Do this only where a profiler pointed you, since it trades readability for a small constant factor.

**Anti-pattern:** Using `global` to share state between functions in a module, then adding threads. What was a readability problem becomes a race condition, and the resulting bugs only reproduce under load.

---

### 1.10 Truthiness, None and Equality

**Best practices:** Use `is None` for optional values and reserve truthiness checks for cases where "empty" and "absent" genuinely mean the same thing. When `None` itself is valid data, introduce an explicit sentinel (`MISSING = object()`).

**Common production bugs:** `if not value:` rejecting `0`, `""` or an empty list — a quantity of zero treated as "not supplied", a blank-but-intentional field replaced by a default, or an empty result set treated as a failure and retried forever.

**Testing advice:** For any optional parameter, include a test with the falsy-but-valid value. This one test catches the entire class of truthiness bugs and takes two lines.

**Security implications:** Comparing secrets with `==` leaks timing information. Use `hmac.compare_digest` for tokens, signatures and password hashes — it compares in constant time regardless of where the first difference occurs.

**Monitoring:** Distinguish "no data" from "zero" in metrics and dashboards. A gauge that reports `0` when the value is actually missing turns a broken collector into a plausible-looking flat line, and nobody pages on a flat line.

> 💡 **Tip:** `@dataclass(frozen=True)` gives you a correct `__eq__`/`__hash__` pair for free, which removes the most common source of unhashable-instance bugs.

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

**Best practices:** Build lists with comprehensions or `extend` rather than repeated `append` in nested loops, and pre-size with a generator plus `list()` when the length is known. Return lists from functions; accept any iterable as input.

**Common production bugs:** `list.pop(0)` used as a queue turns a background worker into a quadratic loop that only shows up once the backlog grows. The related bug is `while items: item = items.pop(0)` inside a request handler, which looks harmless in review.

**Performance considerations:** For large numeric data, a Python list of floats stores a pointer plus a boxed object per element — several times the memory of a NumPy `float64` array, and far slower to iterate. Use `array.array` or NumPy when the data is homogeneous and large.

**Memory considerations:** Over-allocation means a list can hold up to roughly 12% more capacity than its length. Long-lived lists built by appending never shrink automatically; rebuild with `list(items)` if you trimmed a large list and need the memory back.

**Anti-pattern:** Accumulating an entire dataset in a list when you only stream over it once. Generators keep memory flat; a list of every row is how batch jobs get OOM-killed.

---

### 2.2 Tuples and Named Tuples

**Best practices:** Use tuples for fixed records that cross module boundaries, and upgrade to `NamedTuple` or a frozen dataclass as soon as there are more than two fields. Positional access in application code is a maintenance tax.

**Real-world use case:** Composite cache and dictionary keys — `(tenant_id, resource, action)` — rely on tuple hashability. So do coordinates, version numbers and database primary keys made of several columns.

**Common production bugs:** Assuming a tuple is deeply immutable and sharing it between threads, then discovering a mutable list inside it is being modified. Immutability guarantees only apply one level deep.

**Maintainability:** A function returning a bare 4-tuple forces every caller to know the order. Returning a `NamedTuple` costs one class definition and makes every call site self-documenting — and it stays backwards compatible with code that unpacks positionally.

**Testing advice:** Named tuples compare equal to plain tuples with the same values, which makes assertions readable: `assert parse(line) == ("id", 1, 2)` keeps working after you upgrade the return type.

---

### 2.3 Dictionaries

**Best practices:** Use `get` with a default for optional keys, `setdefault` or `defaultdict` for grouping, and dict views for iteration. Prefer `dict | other` (3.9+) over mutation when building derived configuration, so the original stays intact.

**Common production bugs:** Mutating a dict while iterating it raises `RuntimeError` under load but not in a small test; and caching in a module-level dict without eviction is one of the most common memory leaks in long-running Python services.

**Performance considerations:** Dict lookups are fast but not free — in hot loops, hoist repeated `config["key"]` lookups into locals. At scale, the memory overhead matters: a million small dicts cost far more than a million tuples or a dataclass with `slots=True`.

**Security implications:** Never build a dict directly from untrusted input without bounding its size — an attacker controlling keys can grow memory without limit. Hash randomisation protects against deliberate collision attacks, which is why `PYTHONHASHSEED=0` should never be set in production.

**Monitoring:** Expose the size of any process-level dict cache as a metric. An unbounded cache looks like a slow memory leak on a dashboard, and the size gauge is what turns "the pods restart every few hours" into a five-minute diagnosis.

> ⚠️ **Warning:** `functools.lru_cache` on a method keeps `self` alive in the cache, so every instance ever passed through it is retained for the process lifetime. Cache module-level functions, or use `cached_property` for per-instance values.

---

### 2.4 Sets and Frozensets

**Best practices:** Convert to a set once, outside the loop, whenever a collection is membership-tested more than a couple of times. Use set algebra to express reconciliation (`to_add`, `to_remove`) instead of nested loops — it reads like the requirement.

**Real-world use case:** Permission and feature-flag checks, deduplicating IDs before a bulk database call, and diffing desired versus actual state in any sync or reconciliation loop.

**Common production bugs:** Tests that assert on the iteration order of a set pass locally and fail in CI, because string hashing is salted per process. Sort before asserting, or compare sets to sets.

**Performance considerations:** Set membership is O(1) but with a higher constant than a list scan for very small collections and a much higher memory cost per item. For a handful of items a tuple scan can win; for thousands, the set always does.

**Anti-pattern:** Using a set to deduplicate user-visible data and then displaying it, which reorders the output unpredictably between runs. Use `dict.fromkeys` when order is part of the contract.

---

### 2.5 Indexing and Slicing

**Best practices:** Prefer slicing over index loops, and name meaningful slices as `slice` constants when parsing fixed-width records. When working with large sequences, prefer `itertools.islice` over slicing to avoid materialising a copy.

**Common production bugs:** Clamped slice bounds silently return fewer items than expected, so a paging function that slices past the end returns an empty page instead of raising — the "last page is blank" bug. Validate offsets explicitly when they come from user input.

**Performance considerations:** Every slice of a built-in sequence allocates. Slicing inside a loop over a large list is a quiet O(n²) in memory traffic; `memoryview` for bytes and `islice` for iterables avoid the copies.

**Security implications:** Slicing untrusted offsets never raises, which means a bug can silently disclose or drop data rather than failing loudly. Range-check offsets from requests before using them.

**Framework relevance:** NumPy, pandas and PyTorch all return *views* from slices rather than copies, so mutating a slice mutates the original. Code moved between plain Python and these libraries needs that difference checked deliberately.

---

### 2.6 Hashing and Hashability

**Best practices:** Prefer `@dataclass(frozen=True)` for value objects — it generates a consistent `__eq__`/`__hash__` pair. If you write `__hash__` by hand, hash a tuple of exactly the fields `__eq__` compares, and never include mutable fields.

**Common production bugs:** An entity used as a cache key mutates after insertion, so lookups miss and the cache grows without ever hitting — a slow leak plus a silent performance regression. The second classic is an `__eq__`-only class blowing up the first time it reaches a `set()`.

**Security implications:** Never disable hash randomisation (`PYTHONHASHSEED`) to make output reproducible. It exists to prevent attackers from crafting keys that all collide, degrading dict operations to O(n) and stalling the process.

**Testing advice:** For any class you make hashable, assert the contract directly: equal instances hash equally, and an instance survives a round trip through a `set` and a `dict`. It is three lines and catches the whole bug class.

**Debugging tips:** When a lookup that "should" hit is missing, compare `hash(key)` and `key == stored_key` separately. Exactly one of them is usually wrong, and which one tells you whether the bug is in `__hash__` or `__eq__`.

---

### 2.7 Sorting and Ordering

**Best practices:** Sort with a `key` rather than a comparator, use `operator.itemgetter`/`attrgetter` in hot paths, and make sorts deterministic by including a tie-breaking field — otherwise equal-key output order depends on input order and confuses users.

**Common production bugs:** Sorting mixed types raises `TypeError` in Python 3, so a single `None` in a column of numbers crashes a report that ran for months. Handle it in the key: `key=lambda r: (r.value is None, r.value)`.

**Performance considerations:** Sorting is O(n log n) and materialises the whole sequence. For top-k use `heapq.nlargest`; for already-sorted sources use `heapq.merge`; for very large datasets sort in the database, which has indexes you do not.

**Scalability concerns:** Sorting in application memory does not scale past what one process can hold. Push ordering into the datastore or into a streaming merge as soon as the dataset outgrows a comfortable fraction of container memory.

**Testing advice:** Test sorts with duplicate keys to pin down stability, and with locale-sensitive strings if users see the output — `sorted()` on text is codepoint order, which is not alphabetical order in most languages.

> 💡 **Tip:** For human-facing alphabetical ordering, normalise and casefold the key (`unicodedata.normalize("NFKD", s).casefold()`), or use a proper collation library. Codepoint order puts "Zebra" before "apple".

---

### 2.8 The collections Module

**Best practices:** Reach for `deque(maxlen=n)` for rolling buffers, `Counter` for tallies, and `defaultdict` for grouping — then keep the result as a plain dict when returning it from a public function, so callers do not inherit the default-factory behaviour.

**Common production bugs:** A `defaultdict` returned from an API grows every time a caller checks a missing key, turning a read-only inspection into a memory leak. Convert with `dict(result)` at the boundary.

**Real-world use case:** `deque` backs rate limiters and sliding-window metrics; `Counter` backs log-frequency and cardinality reports; `ChainMap` layers CLI flags over environment variables over file defaults without copying dictionaries.

**Performance considerations:** `deque` operations are O(1) at both ends but it does not support slicing, and indexing near the middle is O(n). If code both queues and random-accesses, hold the data twice or reconsider the structure.

**Anti-pattern:** Hand-rolling an LRU cache with an `OrderedDict` when `functools.lru_cache` already exists, is C-implemented, and reports hit rates through `cache_info()`.

---

### 2.9 Unpacking and Star Expressions

**Best practices:** Use unpacking to keep call sites and parsing readable, but cap the nesting — one level of `(a, (b, c)) = ...` is expressive, two is unreadable. Prefer `*_` to name explicitly the parts you are discarding.

**Common production bugs:** `key, value = line.split("=")` raises `ValueError` the first time a value contains an `=`. Use `split("=", 1)` or `partition` for anything parsed from real-world input.

**Debugging tips:** "not enough values to unpack" always names the expected and actual counts — log the offending input, not just the traceback, because the input is what tells you which upstream producer changed.

**Maintainability:** `f(*args, **kwargs)` pass-through wrappers hide the real signature from readers, IDEs and type checkers. Spell out parameters in code others call; keep star pass-through for genuinely transparent decorators.

**Security implications:** Spreading untrusted data into a call — `f(**payload)` where `payload` came from a request — lets a caller reach parameters you never meant to expose. Validate into a known schema first.

---

### 2.10 Copying and Aliasing Containers

**Best practices:** Prefer immutable data at boundaries over defensive copying: frozen dataclasses, tuples, and functions that return new objects. When you do copy, copy at the point of handover, not repeatedly inside the work.

**Common production bugs:** A shared module-level default dict or list, shallow-copied per request, where one request mutates a nested structure and every subsequent request sees it. Under concurrency this reads as random cross-user data corruption.

**Performance considerations:** `deepcopy` is slow — it walks the entire graph and maintains a memo dict. In request paths it shows up directly in latency percentiles. Copy only the mutable parts you intend to change.

**Debugging tips:** When two structures change together, print `id()` at each level to find where the sharing starts. `gc.get_referrers` then tells you who else is holding it.

**Anti-pattern:** `deepcopy` as a substitute for understanding ownership. It breaks on connections, locks and file handles, and quietly duplicates megabytes when someone later adds a big field to the object.

---

### 2.11 Choosing the Right Data Structure

**Best practices:** Write down the two or three operations the code does most, choose the container whose complexity matches, and leave a comment saying why. The next person will otherwise "simplify" the `deque` back into a list.

**Common production bugs:** Quadratic membership tests that pass CI with 50 test records and time out with 50,000 real ones. This is the most common Python scaling failure and the cheapest to fix.

**Performance considerations:** Complexity beats micro-optimisation: converting a list to a set changes the growth curve, while renaming variables and inlining calls only shifts the constant. Profile with real data volumes, not fixture volumes.

**Scalability concerns:** Any structure that holds the whole dataset in memory has a ceiling. Beyond it, stream with generators, page through the database, or move the aggregation into the datastore.

**Testing advice:** Add a performance-shaped test for the hot path — not a benchmark assertion, but a test that runs the function against a realistically sized input so an accidental O(n²) fails CI instead of production.

> 💡 **Tip:** `py-spy top --pid <pid>` attaches to a running Python process and shows where time is going, with no code changes and negligible overhead. It is the fastest route from "the service is slow" to "this loop is the problem".

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

**Best practices:** Use dispatch dictionaries for stable, data-driven branching (protocol handlers, message types, export formats), and keep the table next to the functions it names so the two do not drift.

**Real-world use case:** Plugin systems and task registries: a decorator adds the function to a registry at import time, and the application later looks it up by name. Celery, Flask routes and pytest marks all work this way.

**Common production bugs:** Registering `handler()` instead of `handler`, which stores `None` and silently does nothing at runtime. A second classic: a registry of bound methods that keeps every instance — and everything it references — alive for the process lifetime.

**Maintainability:** Indirection has a cost. When a reader cannot find the caller of a function by searching, add a comment naming the registry, or keep an explicit mapping in one obvious module rather than scattering decorators across the codebase.

**Anti-pattern:** Building dispatch tables from user input — `globals()[name](payload)` or `eval` — which is remote code execution with extra steps. Map allowed names explicitly.

---

### 3.2 Closures

**Best practices:** Prefer closures for small configured behaviours and classes when the state needs inspecting, testing or reporting. Keep what a closure captures small and obvious — a config value, not a whole request object.

**Common production bugs:** Late binding in loops, which registers N callbacks that all act on the final item. In async code the same bug appears when tasks are created in a loop over a mutated variable.

**Memory considerations:** A closure keeps its captured objects alive. Callbacks retained in a long-lived registry are a common cause of steadily growing memory — the closure is small, but the dataframe it captured is not.

**Debugging tips:** `fn.__closure__` plus `cell.cell_contents` shows exactly what a closure captured. When memory grows unexpectedly, this is how you confirm a callback is pinning a large object.

**Testing advice:** Test the returned function, not the factory: call `make_handler(config)` and then exercise the result with the inputs it will see. Closures created per request also deserve a test that two instances do not share state.

---

### 3.3 Lambda Expressions

**Best practices:** Keep lambdas to a single short expression used immediately. Replace common ones with `operator.itemgetter`/`attrgetter`, which are C-implemented, picklable and clearer about intent.

**Common production bugs:** `multiprocessing` and any `pickle`-based queue (Celery, joblib, Dask) fail on lambdas with an unhelpful pickling error — often only in the production path that actually uses multiple processes.

**Debugging tips:** Tracebacks through lambdas show `<lambda>` with no context. When an error surfaces inside a sorting key or a callback, converting the lambda to a named `def` immediately makes the traceback useful.

**Maintainability:** A lambda assigned to a name is strictly worse than a `def` — no docstring, worse tracebacks, and linters flag it (`E731`). Reviewers will ask, so write the `def`.

**Anti-pattern:** Simulating multi-statement lambdas with tuples, `and`/`or` chains or conditional expressions to fit inside one expression. That is a `def` avoiding its own definition.

---

### 3.4 Higher-Order Functions

**Best practices:** Use generator expressions for pipelines over large inputs so memory stays flat, and materialise with `list()` only at the point where you genuinely need a sequence twice.

**Common production bugs:** Consuming a lazy `map`/`filter`/generator twice — the second pass silently yields nothing, so a downstream count is zero with no error. The fix is to materialise once and reuse, or rebuild the pipeline.

**Performance considerations:** A Python-level callable per item is the dominant cost in these pipelines. `map(int, values)` stays in C; `map(lambda v: int(v), values)` adds a Python call per element. For heavy numeric work, vectorise instead.

**Scalability concerns:** Lazy pipelines let a worker stream a dataset far larger than memory, but they also defer all the work — and all the errors — to the consumer. Make sure the consumer has the error handling, timeouts and metrics.

**Testing advice:** Assert on materialised results (`list(pipeline)`), and add a test that the pipeline is lazy where laziness matters — for example that constructing it performs no I/O.

---

### 3.5 The functools Module

**Best practices:** Always `@wraps` in decorators. Bound caches (`lru_cache(maxsize=...)`) over unbounded ones, `cached_property` for per-instance values, and `partial` over lambdas wherever the result crosses a process or a queue.

**Common production bugs:** `@lru_cache` on an instance method, which keys on `self` and keeps every instance alive — a textbook memory leak that looks like a slow container OOM. `@cache` on a function keyed by user input has the same shape with an unbounded key space.

**Monitoring:** Export `cache_info()` — hits, misses and `currsize` — as metrics. A hit rate that collapses after a deploy is usually a key-shape change, and a `currsize` that only grows is an unbounded cache.

**Security implications:** Caching keyed on user-controlled values lets an attacker fill memory with distinct keys. Bound every cache that touches request data, and never cache authorisation decisions across users.

**Testing advice:** Call `cache_clear()` between tests, or the second test observes the first test's results. This is a frequent source of tests that pass alone and fail as a suite.

> ⚠️ **Warning:** `@lru_cache` holds strong references to both arguments and return values. Anything cached is effectively immortal until eviction — never cache objects holding connections, file handles or request context.

---

### 3.6 Recursion

**Best practices:** Recurse over branching structures of bounded depth; iterate over linear ones. When input depth is attacker-controlled or unbounded, use an explicit stack so the limit is yours rather than the interpreter's.

**Common production bugs:** Parsing deeply nested JSON or XML from an external source and hitting `RecursionError` — or worse, a segfault after someone raised the limit. Depth limits belong in input validation.

**Security implications:** Deeply nested input is a denial-of-service vector: `json.loads` on thousands of nested arrays can exhaust the stack. Validate nesting depth and payload size before parsing untrusted data.

**Debugging tips:** A `RecursionError` traceback is enormous and repetitive. Look at the first few frames and the repeating cycle — the cycle identifies the missing base case or the unexpected self-reference in the data.

**Anti-pattern:** `sys.setrecursionlimit(100000)` to make a symptom go away. The C stack has its own hard limit, so a crash replaces a catchable exception — and it crashes the whole process, not just the request.

---

### 3.7 Pure Functions and Side Effects

**Best practices:** Structure modules as a pure core with an effectful shell: parse, validate, decide and transform in pure functions; do I/O, logging and persistence at the boundary. It is the single highest-leverage structural habit in Python services.

**Real-world use case:** Pricing, permission and rules engines. Written pure, they can be unit-tested exhaustively, replayed against production inputs, and safely cached — none of which is possible once they read a database internally.

**Testing advice:** Pure functions need no mocks, so mock count is a useful design signal: a test with five patches is telling you the function under test is doing five things it should not.

**Debugging tips:** When a bug reproduces only sometimes, list the hidden inputs — clock, random, environment, shared mutable state. Making one of them explicit usually makes the bug deterministic.

**Framework relevance:** Django signals, Flask `g`, Celery task state and FastAPI dependencies all introduce hidden inputs. They are useful, but every one of them makes the code that touches it harder to test in isolation — keep business logic out of them.

---

### 3.8 Callable Objects

**Best practices:** Use a callable class when behaviour needs configuration plus inspectable state — rate limiters, retry policies, validators, model wrappers. Give it a clear `__repr__` so logs and tracebacks identify it.

**Real-world use case:** Middleware and hook systems: frameworks accept "any callable", so a configured instance drops into the same slot as a plain function while also exposing counters and a `reset()` method for tests.

**Common production bugs:** Type checks that reject valid callables (`isinstance(x, types.FunctionType)`) break the moment someone passes a `partial`, a bound method or a callable instance. Use `callable(x)` or just call it.

**Testing advice:** Because the state lives in attributes, assert on it directly after exercising the object — no need to reach into closure cells or patch globals.

**Anti-pattern:** Hiding heavy work behind `__call__` so that innocuous-looking code performs network or database calls. Name the method (`fetch()`, `run()`) when the cost is not obvious from the call site.

---

### 3.9 Function Introspection

**Best practices:** Use `inspect.signature` rather than parsing `__code__` by hand, and always decorate with `@wraps` so downstream introspection keeps working. Treat parameter names as public API in any signature a framework reads.

**Common production bugs:** A decorator added without `@wraps` breaks pytest fixture resolution, FastAPI request parsing or Celery task naming — and the failure appears in an unrelated part of the system, long after the decorator was merged.

**Framework relevance:** FastAPI builds validation and OpenAPI schemas from annotations; pytest injects fixtures by parameter name; Click and Typer derive CLI options from signatures; dependency injection resolves constructors. Renaming a parameter is therefore a breaking change in all of them.

**Modern recommendations:** Read annotations with `inspect.get_annotations(obj, eval_str=True)` rather than touching `__annotations__`, because `from __future__ import annotations` and PEP 649's lazy evaluation both change what the raw attribute contains.

**Debugging tips:** When a framework "cannot find" something about your function, print `inspect.signature(fn)` and `fn.__wrapped__`. One of them almost always shows a decorator that replaced the metadata.

---

### 3.10 Functional Style in Python

**Best practices:** Favour immutable value objects at module boundaries, pure functions for decisions, and lazy iteration for large data. Use loops and classes wherever they read better — Python rewards clarity over paradigm purity.

**Real-world use case:** ETL and event processing: a lazy generator pipeline reads, parses, filters and transforms records one at a time, so memory stays flat whether the input is a thousand rows or ten million.

**Performance considerations:** Immutability means allocation. In hot inner loops, mutating a local accumulator is faster than rebuilding a structure each iteration — keep the immutable style at the boundaries and allow local mutation inside a function that owns its data.

**Maintainability:** The readability ceiling is real. One comprehension with a single condition is clear; three nested ones with conditions are a defect waiting to be misread. Break them into named steps.

**Modern recommendations:** `@dataclass(frozen=True, slots=True)` gives immutable, memory-efficient value objects with generated equality and hashing — the most practical way to get functional-style data in a Python codebase today.

> 💡 **Tip:** `dataclasses.replace(obj, field=value)` is the idiomatic "change one field" for frozen objects, and it keeps the original intact for logging and comparison.

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

**Best practices:** Keep `__init__` cheap and side-effect free — assign attributes, validate, and nothing else. Anything that opens a connection, reads a file or calls a service belongs in a classmethod factory or an explicit `connect()`, so objects stay constructible in tests.

**Common production bugs:** A mutable class attribute used as per-instance state, which shares data across every instance in the process — in a web server, across every request. It presents as one user seeing another's data.

**Debugging tips:** `vars(obj)` shows the instance dict, `type(obj).__mro__` shows where inherited behaviour comes from, and `obj.__class__.__module__` tells you which copy of a class you actually have when a reload or duplicate import is suspected.

**Testing advice:** If constructing your object in a test requires patching, the constructor is doing too much. Constructor parameters with defaults make the class testable without any mocking framework.

**Anti-pattern:** Classes that exist only to hold functions with no state. In Python that is what a module is — a namespace with no instantiation ceremony.

---

### 4.2 Attributes and the Instance Dictionary

**Best practices:** Declare every attribute in `__init__` even when it starts as `None`, so readers and type checkers can see the object's shape. Use a leading underscore for internals — convention is the only access control Python offers.

**Common production bugs:** A typo creating a new attribute instead of raising (`self.usrname = x`), which fails silently and surfaces as a missing value much later. `__slots__` or a dataclass turns that into an immediate `AttributeError`.

**Performance considerations:** Attribute access is a dict lookup plus descriptor checks. In hot loops, bind `self.method` or `self.value` to a local once rather than resolving it per iteration — measurable when the loop runs millions of times.

**Debugging tips:** Infinite recursion in `__getattr__` or `__setattr__` produces a `RecursionError` with thousands of identical frames. The fix is always to go through `object.__setattr__` or `super().__getattribute__` inside those methods.

**Anti-pattern:** Dynamic attribute magic in application code — `setattr(obj, name, value)` loops that build objects from arbitrary input. It defeats type checking, IDE completion and code search, and it is a security problem when the names come from users.

> ⚠️ **Warning:** Building objects from untrusted keys with `setattr` is mass assignment. An attacker who can set `is_admin` gets exactly what you would expect. Map fields explicitly.

---

### 4.3 Instance, Class and Static Methods

**Best practices:** Use `@classmethod` for alternative constructors (`from_json`, `from_row`, `from_env`) and return `cls(...)` so subclasses inherit them correctly. Keep `@staticmethod` rare — if it needs nothing from the class, a module function is usually clearer.

**Real-world use case:** Registries built with `__init_subclass__` plus a classmethod factory — the pattern behind plugin systems, serialiser lookups and strategy selection in many frameworks.

**Common production bugs:** A `@staticmethod` factory hard-coding the class name, so subclasses silently produce base-class instances. The bug hides until someone subclasses the type months later.

**Maintainability:** Method type is documentation. A reader seeing `@classmethod` knows the method does not touch instance state, which makes refactoring and concurrency reasoning easier.

**Testing advice:** Classmethod factories are the natural seam for test data: `Order.from_row(fixture_row)` keeps construction in one place, so changing the schema updates every test at once.

---

### 4.4 Inheritance and the MRO

**Best practices:** Keep hierarchies shallow — two levels is usually enough. Use mixins for genuinely orthogonal behaviour (logging, serialisation, timestamps) and document the expected order of bases, since it determines which methods win.

**Common production bugs:** A mixin placed after the concrete base, so its overrides never run. The code looks right, the tests that exercise the base pass, and the mixin behaviour is simply absent.

**Debugging tips:** When a method is not the one you expected, print `type(obj).__mro__` and walk it. That one line answers almost every "where is this coming from?" question in an inherited hierarchy.

**Maintainability:** Deep hierarchies make changes non-local: a fix in a base class ripples into every subclass, including ones you did not know existed. Composition keeps blast radius small.

**Anti-pattern:** Inheriting from a framework base class purely to get a few helper methods, then being locked into its lifecycle, its constructor signature and its upgrade schedule.

---

### 4.5 super() and Cooperative Inheritance

**Best practices:** Always use zero-argument `super()`, have every class in a mixin chain call it, and accept `**kwargs` in mixin `__init__` methods so classes further down the MRO still receive their arguments.

**Common production bugs:** One class in the chain calling `Parent.__init__(self)` directly, which skips siblings. In a Django or DRF hierarchy that presents as a field or permission check that silently never runs.

**Debugging tips:** Add a temporary print or log of `type(self).__mro__` inside the failing method, then trace which classes actually executed. A truncated chain is immediately visible.

**Testing advice:** Test mixin combinations, not just individual mixins. Bugs live in the ordering, so the test that matters is the concrete class that combines them.

**Anti-pattern:** Cooperative multiple inheritance across package boundaries, where you do not control every class in the chain. One upstream class that forgets `super()` breaks your behaviour and you cannot fix it.

---

### 4.6 Special Methods and the Data Model

**Best practices:** Implement `__repr__` on every domain class — it is the highest return-on-effort method in Python. Keep `__eq__` and `__hash__` consistent, keep both cheap, and prefer `@dataclass` so they are generated correctly.

**Common production bugs:** Objects logging as `<Order object at 0x7f9...>` during an incident, costing time exactly when it is most expensive. Close behind: an `__eq__` that hits the database, making an innocent `in` check a hundred queries.

**Performance considerations:** Containers call `__hash__` and `__eq__` constantly. An expensive implementation turns dict and set operations into the bottleneck, and the profile blames the container rather than your class.

**Security implications:** `__repr__` and `__str__` end up in logs and error trackers. Never include secrets, tokens or full payment details — mask them in the `repr` itself, since that is what gets captured automatically.

**Framework relevance:** `__enter__`/`__exit__` back database transactions and file handling; `__iter__` backs streaming responses; `__eq__`/`__hash__` back ORM identity maps and caches. Getting these right is what makes a class feel native to the ecosystem.

> 💡 **Tip:** `@dataclass(repr=True)` plus `field(repr=False)` on sensitive fields gives you useful logging output with secrets excluded by construction.

---

### 4.7 Properties

**Best practices:** Keep properties cheap and free of I/O. Use them for validation and derived values; use an ordinary method when the work is significant, so the call site shows the cost.

**Common production bugs:** A property that performs a query, called inside a loop over a thousand objects — the classic N+1 problem, invisible in review because the call site looks like an attribute read.

**Performance considerations:** Every property access is a Python-level call. In tight loops, read the value once into a local. For expensive per-instance values, `cached_property` computes once — but remember it needs a `__dict__`, so it is incompatible with `__slots__`.

**Debugging tips:** `hasattr` returns `False` when a property raises, which disguises real errors as missing attributes. Use `getattr(obj, name)` inside a `try` when you need to see the underlying exception.

**Anti-pattern:** Writing Java-style `get_x`/`set_x` pairs for every field. Python's answer is a plain attribute now, and a property later if it ever needs logic — with no change at any call site.

---

### 4.8 Descriptors

**Best practices:** Reach for a descriptor only when the same attribute behaviour repeats across several fields or classes. Use `__set_name__` to learn the field name, and store per-instance values on the instance.

**Real-world use case:** ORM columns, form and serialiser fields, settings objects with validation, and unit-carrying attributes that convert on assignment. Django, SQLAlchemy and Pydantic all rely on this machinery.

**Common production bugs:** A descriptor storing state on itself, so every instance of the owning class shares one value. In a web process that is cross-request data leakage, and it only appears under concurrency.

**Memory considerations:** Descriptors that keep a side-table keyed by instance must use `WeakKeyDictionary`, or they pin every object that ever touched the attribute for the process lifetime.

**Maintainability:** Descriptors move behaviour away from where it is used, which makes code harder to follow. Document the descriptor class well and keep the number of them small.

---

### 4.9 Dataclasses

**Best practices:** `@dataclass(frozen=True, slots=True)` for value objects, `field(default_factory=...)` for anything mutable, and `field(repr=False)` for secrets. Use `__post_init__` for validation and derived fields.

**Real-world use case:** Configuration objects, domain value types (money, coordinates, identifiers), and the boundary DTOs between layers of a service — everywhere a dict was previously passed around with no schema.

**Common production bugs:** Treating a dataclass as validated input. It performs no type checking at runtime, so `Item(sku=None, qty="3")` constructs happily and fails much later. Parse untrusted input with Pydantic or explicit validation, then convert to a dataclass.

**Performance considerations:** `slots=True` reduces memory substantially for large collections of instances, and `asdict()` is a deep recursive copy — avoid it in hot paths and serialise explicitly instead.

**Modern recommendations:** Prefer dataclasses over hand-written record classes and over dicts-as-records. For anything crossing a trust boundary, use Pydantic v2 (validation, coercion, JSON schema) and keep dataclasses for internal structures.

> ⚠️ **Warning:** Annotations alone do not create fields. `x: int` is a field; `x = 5` without an annotation is just a class attribute, and `@dataclass` will not include it in `__init__` or `__eq__`.

---

### 4.10 Abstract Base Classes and Protocols

**Best practices:** Define what you *consume* as a Protocol, so callers need not import your base class. Use ABCs for hierarchies you own where shared implementation and a runtime guarantee both matter.

**Real-world use case:** Repository and gateway interfaces in hexagonal architectures: the domain declares a Protocol, the infrastructure supplies an implementation, and tests supply a fake — with no inheritance linking them.

**Common production bugs:** An ABC subclass with a missing method that is never instantiated in tests, so the failure appears in production at the first instantiation. A CI check that instantiates every concrete subclass catches it.

**Testing advice:** Protocols make fakes trivial — a small class with the right methods satisfies the type checker with no base class. That removes most of the reason to reach for `unittest.mock.patch`.

**Framework relevance:** `collections.abc` interfaces are what make custom containers work with the standard library; `typing.Protocol` is what lets libraries accept "file-like" or "closeable" objects without importing anything from you.

---

### 4.11 Slots and Memory Layout

**Best practices:** Apply slots where instance counts are large — parsed records, graph nodes, event objects — and measure before and after. `@dataclass(slots=True)` is the least intrusive way to get them.

**Real-world use case:** Pipelines that hold millions of parsed records in memory, simulation entities, and long-lived caches of small objects. The saving is often the difference between fitting in a container's memory limit and not.

**Common production bugs:** Adding slots to a class that a library later tries to attach attributes to — some mocking tools, serialisers and debuggers fail with an opaque `AttributeError`. Check your dependencies before slotting a widely used class.

**Memory considerations:** Measure with `tracemalloc` or a memory profiler rather than `sys.getsizeof` alone, which does not account for the instance dict or referenced objects.

**Anti-pattern:** Slotting every class by default. It costs flexibility everywhere to save memory in the few places that hold many instances, and it complicates multiple inheritance.

---

### 4.12 Composition and Delegation

**Best practices:** Inject collaborators through the constructor with sensible defaults, keep interfaces narrow (a Protocol with two methods beats a base class with twenty), and forward explicitly rather than with catch-all `__getattr__`.

**Real-world use case:** Swapping a real payment gateway for a fake in tests, a Redis cache for an in-memory dict in development, or a clock function for a fixed timestamp — all by passing a different object.

**Common production bugs:** Subclassing `dict` to add behaviour, then finding that `update()`, `setdefault()` and the `|` operator bypass the override. Use `collections.UserDict` or hold a dict internally.

**Maintainability:** Composition makes dependencies visible in the signature, which is the single best documentation of what a class actually needs. Inheritance hides them in the hierarchy.

**Framework relevance:** FastAPI's `Depends`, pytest fixtures and Django's pluggable backends are all composition mechanisms. Following that grain — passing collaborators rather than inheriting them — keeps your code idiomatic in those ecosystems.

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

**Best practices:** Catch the narrowest exception that you can actually handle, and reserve `except Exception` for a top-level boundary — a request handler, a worker loop, a CLI entry point — where it logs with a traceback and converts the failure into a response or an exit code.

**Common production bugs:** A bare `except:` in a worker loop swallowing `KeyboardInterrupt` and `SystemExit`, so the process refuses to stop and the orchestrator has to kill it. The same handler usually hides real bugs as "transient errors".

**Debugging tips:** When an error is being caught somewhere unexpected, search for `except Exception` and bare `except` first. In an emergency, `python -X dev` and raising the log level often reveal the swallowed original.

**Security implications:** Broad handlers that return a generic "something went wrong" hide security-relevant failures — permission errors, signature mismatches, auth timeouts. Log the specific exception type and code internally even when the user-facing message stays generic.

**Anti-pattern:** `except Exception: pass`. If a failure genuinely does not matter, use `contextlib.suppress(SpecificError)` so the intent is explicit and the scope is one statement.

---

### 5.2 try, except, else and finally

**Best practices:** Keep `try` blocks to the smallest failing operation, put the follow-up in `else`, and use `with` instead of `try`/`finally` whenever a context manager exists. Cleanup belongs in exactly one place.

**Common production bugs:** A `return` inside `finally` that silently discards an in-flight exception — the operation reports success while having failed. Linters flag it (`B012`), and it is worth enforcing.

**Performance considerations:** Since 3.11 an untaken `try` is free, so guarding hot code costs nothing. What does cost is raising: a loop where most iterations raise and catch is measurably slower than one that checks a condition.

**Debugging tips:** If an exception "disappears", look for a `finally` that returns, a handler that logs without re-raising, or a `with` whose `__exit__` returns a truthy value — all three suppress exceptions.

**Testing advice:** Test the failure path explicitly with `pytest.raises`, and assert that cleanup ran. Untested `except` blocks are where the second bug hides.

---

### 5.3 Raising and Re-raising

**Best practices:** Translate exceptions at layer boundaries — infrastructure errors into domain errors, always with `from exc`. Inside a layer, let them propagate. Log at the boundary that handles the failure, not at every level it passes through.

**Common production bugs:** Duplicate logging, where every layer logs the same exception, filling the log with five stack traces for one failure and making the real frequency impossible to measure.

**Debugging tips:** `exc.add_note(f"order_id={order.id}")` in 3.11+ attaches request context to an exception without wrapping it, so the traceback carries the identifiers you need.

**Monitoring:** Count exceptions by type, not by message. Messages contain variable data and fragment the metric; types are stable and make alert thresholds meaningful.

**Anti-pattern:** Catching, logging and continuing — the "log and swallow" pattern. It converts a loud failure into a quiet data-corruption bug that surfaces hours later.

> ⚠️ **Warning:** A handler that ends without `raise` and without a genuine recovery is a decision to continue with unknown state. Make that decision deliberately, and comment why.

---

### 5.4 Custom Exceptions

**Best practices:** Give every package one base exception, define the specific ones in a single `exceptions.py`, and attach the data handlers need (`field`, `retry_after`, `status`). Document which exceptions each public function can raise.

**Real-world use case:** Mapping domain exceptions to HTTP responses in one place — a single handler translating `NotFound` to 404, `ValidationError` to 400 and `RetryableError` to 503 keeps the status-code logic out of every view.

**Common production bugs:** Exceptions that fail to unpickle across process boundaries because `__init__` takes arguments that `Exception.__reduce__` cannot reconstruct. In Celery or `multiprocessing` this replaces your clear error with an opaque one.

**Maintainability:** Exception classes are public API. Renaming or re-parenting one is a breaking change for every caller catching it, so treat them with the same care as function signatures.

**Testing advice:** Assert on exception *types* and attributes, never on message text. `pytest.raises(ValidationError)` plus `exc.value.field == "email"` survives message rewording; `match="invalid email"` does not.

---

### 5.5 Exception Chaining

**Best practices:** Always `raise ... from exc` when translating. Reserve `from None` for cases where the cause is a genuine implementation detail, and only after logging it.

**Common production bugs:** A domain exception raised without `from`, so the error tracker shows `ConfigError: invalid configuration` with a two-frame traceback and no indication of which file, key or underlying error was involved.

**Monitoring:** Error trackers group by the outermost exception and fingerprint on the stack. Chaining gives every group a usable root cause, which is the difference between a one-minute and a one-hour diagnosis.

**Debugging tips:** Walk `exc.__cause__` and `exc.__context__` in an interactive session to see the full history programmatically — useful when logs have truncated the printed traceback.

**Security implications:** The cause may contain sensitive detail — file paths, connection strings, fragments of payloads. Mask what is shown to users, while keeping the full chain in internal logs.

---

### 5.6 EAFP and LBYL

**Best practices:** Prefer EAFP for anything touching the filesystem, the network or shared state, where a check can go stale. Use LBYL for validating user input up front, where you want to report several problems at once.

**Common production bugs:** TOCTOU races — checking a file exists, checking a permission, or checking a balance, then acting on stale information. Under concurrency these appear as rare, unreproducible failures.

**Security implications:** TOCTOU is a genuine vulnerability class, not just a correctness issue: privilege checks performed before an action can be invalidated between the check and the action. Perform the operation and handle failure, or hold a lock across both.

**Performance considerations:** In loops where failure is the common case — parsing millions of rows where most are malformed — exception overhead dominates. Restructure to a check, or filter first and let the exceptional path stay exceptional.

**Testing advice:** Test the exception path with the same weight as the happy path. EAFP code is only correct if the handler is correct, and the handler is the part nobody exercises manually.

---

### 5.7 Tracebacks

**Best practices:** Use `logger.exception(...)` inside handlers, configure structured logging so the traceback is a field rather than interleaved lines, and install an error tracker that captures `sys.excepthook` and the equivalents for threads and asyncio.

**Common production bugs:** Logs full of one-line errors with no stack, because the code called `logger.error(str(exc))`. The incident then takes hours instead of minutes for want of one method name.

**Security implications:** Never render tracebacks to end users. In web frameworks, disable debug mode in production — a debug traceback page exposes source code, local variables, configuration and often secrets.

**Memory considerations:** Exception objects reference their traceback, which references frames and their locals. Storing exceptions in a retry queue or a result object can pin large amounts of memory; store the formatted string instead.

**Monitoring:** Alert on exception rate by type and by service, and treat a new exception type appearing in production as a signal in itself — it usually means a code path that has never run before is now running.

> 💡 **Tip:** `faulthandler.enable()` at start-up dumps a Python traceback on a segfault or a hard hang — the one case where the normal machinery gives you nothing.

---

### 5.8 Warnings

**Best practices:** Emit `DeprecationWarning` with `stacklevel=2` for anything you plan to remove, document the replacement in the message, and give users at least one release before removal. In your own CI, turn warnings into errors.

**Real-world use case:** Library deprecation cycles — the warning appears in the release that introduces the replacement, removal happens two releases later, and the message names the exact substitute so upgrading is mechanical.

**Common production bugs:** Deprecated APIs used for years without anyone noticing, because `DeprecationWarning` is hidden by default outside `__main__`. The upgrade that removes them then breaks a dozen call sites at once.

**Testing advice:** Set `filterwarnings = error` in the pytest configuration, with targeted `ignore` entries for known third-party noise. That way your own deprecations fail tests while the fix is still small.

**Modern recommendations:** Run services with `-X dev` in staging. It enables `ResourceWarning` and other development checks, which catch unclosed files and sockets before they become production file-descriptor leaks.

---

### 5.9 Exception Groups

**Best practices:** Use `asyncio.TaskGroup` for concurrent work and `except*` to handle its failures by type. Log the whole group — count and types — rather than only the first exception, so partial failures are visible.

**Real-world use case:** Fan-out requests to several services: some time out, some return bad data, and the caller needs to distinguish "all failed" from "two of ten failed" in order to decide between retrying, degrading and failing.

**Common production bugs:** Migrating from `gather` to `TaskGroup` without updating handlers — existing `except TimeoutError` clauses no longer match because the error now arrives wrapped in a group, so failures become unhandled crashes.

**Monitoring:** Emit one metric per contained exception type, not one per group. A group of five timeouts and one validation error should increment two counters appropriately, or dashboards will under-report.

**Modern recommendations:** Prefer `TaskGroup` over bare `gather` in new code: it cancels siblings on failure, propagates every error, and makes structured concurrency the default. Keep `gather(return_exceptions=True)` only where you genuinely want errors as values.

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

**Best practices:** Accept any iterable in public functions and return iterators or lists deliberately — document which. If a function returns a lazy iterator, say so in the docstring, because callers will otherwise assume they can iterate it twice.

**Common production bugs:** A custom container returning `self` from `__iter__`, which works in the first test and fails the moment anything iterates it twice. The symptom is empty results downstream, with no exception.

**Debugging tips:** `iter(x) is x` tells you instantly whether you hold a single-use iterator. When data "disappears" between two consumers, that one expression usually explains it.

**Testing advice:** Test that your iterable supports two independent passes, and that a partially consumed iterator does not corrupt the container. Both are one-line tests that catch the whole class of bug.

**Framework relevance:** Database cursors, HTTP streaming responses and message-queue consumers are all single-pass iterators. Code written against lists breaks subtly when swapped onto one of these.

---

### 6.2 Iterables and Iterators

**Best practices:** Materialise once, at a clear boundary, when data will be used more than once — `rows = list(cursor)` — and keep it lazy everywhere else. Never pass the same iterator to two collaborators.

**Common production bugs:** A generator passed to a logging call that consumes it, so the real consumer downstream receives nothing. It is invisible in review because the log line looks harmless.

**Debugging tips:** When a count is zero but the source clearly had data, check for an earlier `len(list(...))`, a truthiness test, or a log statement that already consumed the iterator.

**Performance considerations:** `itertools.tee` looks like a cheap way to iterate twice but buffers the gap between consumers — often more memory than a list, plus overhead. If you need two passes, make a list.

**Anti-pattern:** Functions that sometimes return a list and sometimes a generator depending on their arguments. Callers cannot write correct code against that, and tests will not catch which path they hit.

---

### 6.3 Generator Functions

**Best practices:** Keep the `with` block *inside* the generator so the resource is open exactly as long as the generator is. Document that the result is single-use, and provide an eager variant when callers need a list.

**Common production bugs:** A generator holding a database connection or file handle that is never fully consumed, leaving the resource open until garbage collection. Under load this exhausts connection pools and file descriptors.

**Memory considerations:** A suspended generator keeps its frame — and everything its locals reference — alive. A generator capturing a large dataframe or request object keeps that alive for as long as the generator is reachable.

**Debugging tips:** Exceptions from generators point at the consumption site. To find the real origin, look further up the traceback for the generator's own frame, which appears as the function containing the `yield`.

**Testing advice:** Assert on `list(gen())` for content, and separately test that the generator is lazy where it matters — for example that creating it opens no file. Both behaviours are contracts callers depend on.

> ⚠️ **Warning:** Never `return` a generator from inside a `with` block. The block closes when the function returns, and consumption then fails with "I/O operation on closed file" — usually in production, on the large input that made someone stream in the first place.

---

### 6.4 Generator Expressions

**Best practices:** Use generator expressions inside `sum`, `any`, `all`, `min`, `max` and `next`, and list comprehensions when the result is reused. The choice should reflect how the result is consumed, not personal style.

**Common production bugs:** Passing a generator expression to something that iterates it twice — a serialiser, a template, or a retry wrapper — producing correct output the first time and empty output on the retry.

**Performance considerations:** For small collections a list comprehension is faster; the generator's benefit is memory and early exit. Below a few hundred items the difference rarely matters either way.

**Debugging tips:** Never `print(gen)` — it shows the object. Use `list(itertools.islice(gen, 5))` to peek without consuming everything, and remember that peeking consumes those five items.

**Anti-pattern:** Generator expressions with side effects. Because they are lazy, the side effects happen at an unpredictable time — or not at all if the result is never consumed.

---

### 6.5 yield from and Delegation

**Best practices:** Use `yield from` whenever delegating to another generator, including in recursive traversals. Keep delegation chains shallow — three or four levels is plenty, and deeper chains make tracebacks hard to read.

**Real-world use case:** Recursive traversal of trees, directory walks, nested JSON flattening, and composing pipeline stages where an inner generator handles a sub-format.

**Common production bugs:** A manual `for ... yield` loop used where a sub-generator needs `close()` propagation, so cleanup in the inner generator never runs and resources leak.

**Debugging tips:** Deep delegation produces long tracebacks with one frame per level. Look for the frame whose function name is not part of the recursion — that is usually where the real failure is.

**Performance considerations:** Each level adds a suspended frame and a small forwarding cost. For very deep recursion, an explicit stack with a single generator avoids both the frames and the recursion limit.

---

### 6.6 Comprehensions

**Best practices:** One `for` and at most one `if` per comprehension. Beyond that, write the loop — the cost of two extra lines is far lower than the cost of a reader misparsing the nesting order.

**Common production bugs:** A comprehension that builds the whole result set in memory where a generator would have streamed it, turning a job that used to fit in a container into an OOM kill as data grows.

**Performance considerations:** Comprehensions beat explicit `append` loops because the append is a dedicated opcode. Inside a comprehension, hoist repeated work — a lookup, an attribute, a compiled regex — out of the expression.

**Maintainability:** Nested comprehensions are a recurring review complaint. If a comprehension needs a comment to explain what it produces, it has already failed the readability test that motivated the syntax.

**Anti-pattern:** `[do_something(x) for x in items]` executed for side effects. It allocates a list of `None` and misleads the reader into thinking the result matters.

---

### 6.7 The itertools Module

**Best practices:** Reach for `islice` instead of slicing iterators, `chain.from_iterable` instead of nested loops, and `batched` (3.12+) for chunking API calls and bulk inserts. They are faster, clearer and already correct.

**Real-world use case:** Chunking records for bulk database writes or batch API limits, round-robin distribution across workers with `cycle`, and windowed metrics with a bounded `deque`.

**Common production bugs:** `groupby` over unsorted data, producing many fragments per key. The aggregate looks plausible in a small test and is silently wrong at scale — one of the hardest bugs in this group to notice.

**Performance considerations:** `tee` and `cycle` both buffer, so they are not memory-free on large sources. `product` and `permutations` grow factorially — guard the input size before calling them on user-supplied data.

**Testing advice:** Test grouping code with deliberately unsorted input. If the implementation forgot to sort, the test fails immediately rather than in a monthly report nobody reconciles.

---

### 6.8 Lazy Evaluation and Pipelines

**Best practices:** Build pipelines as small named generator functions rather than one long chain of expressions, so each stage can be tested alone and appears by name in tracebacks. Consume at exactly one place.

**Real-world use case:** Log and event processing, ETL over files larger than memory, streaming exports, and paginated API traversal — each page fetched only when the consumer reaches it.

**Common production bugs:** Resources closed before consumption; and pipelines consumed inside a `try` whose handler assumes the work already happened. Because nothing runs until consumption, timing and error handling both end up in the wrong place.

**Monitoring:** Add a counting stage that logs every n items. Without it, a lazy pipeline gives no progress signal at all, and a stalled job is indistinguishable from a slow one.

**Scalability concerns:** Laziness fixes memory, not throughput. When a single-threaded pipeline becomes the bottleneck, parallelise by sharding the source across processes — generators themselves do not pickle.

> 💡 **Tip:** `itertools.islice(pipeline, 100)` gives you a fast smoke test over real data without processing the whole file — the cheapest way to validate a pipeline before a long run.

---

### 6.9 Two-way Generators

**Best practices:** If you use a generator as a consumer, wrap the body in `try/finally` so `close()` flushes buffered work, and call `close()` explicitly rather than relying on garbage collection.

**Real-world use case:** Batching writes, incremental parsers fed chunk by chunk, and state machines that receive events — all cases where the coroutine holds position between inputs.

**Common production bugs:** Data lost at shutdown because a buffering generator was never closed, and the interpreter exited before garbage collection ran its `finally` block.

**Debugging tips:** `inspect.getgeneratorstate(gen)` reports `GEN_CREATED`, `GEN_SUSPENDED`, `GEN_RUNNING` or `GEN_CLOSED` — the fastest way to find an unprimed or already-closed generator.

**Modern recommendations:** For anything concurrent, use native coroutines and `asyncio`, not generator-based ones. Keep two-way generators for synchronous accumulator and parser patterns, where they are still the clearest tool.

---

### 6.10 Infinite Sequences

**Best practices:** Bound every infinite source at the point of use, and prefer a named generator (`backoff_delays()`) over an inline `while True`, so the termination condition lives with the producer's documentation.

**Real-world use case:** Retry back-off schedules, sequential ID allocation, round-robin worker selection, and heartbeat or polling loops with a cancellation check.

**Common production bugs:** A polling loop with no exit condition and no cancellation check, which keeps a worker alive through shutdown and forces the orchestrator to kill it. Always check a stop event inside the loop.

**Security implications:** Never derive an unbounded iteration count from user input. A request that makes the server iterate "until done" is a denial-of-service vector — cap iterations and duration explicitly.

**Monitoring:** Instrument loops that are meant to run forever with a heartbeat metric. A loop that has silently stopped looks identical to a healthy one unless something is reporting each pass.

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

**Best practices:** Always `@functools.wraps`, always accept and forward `*args, **kwargs`, and keep decorators free of import-time side effects beyond registration. A decorator should be transparent: same signature, same return, plus one concern.

**Common production bugs:** A decorator without `wraps` breaking Celery task names, FastAPI request models or pytest fixture resolution — the failure appears in a different subsystem entirely, long after the decorator was added.

**Performance considerations:** Every decorator adds a Python-level call per invocation. On a function called millions of times in a loop, three stacked decorators are measurable; on a request handler they are irrelevant.

**Debugging tips:** Tracebacks show wrapper frames. `func.__wrapped__` unwraps one layer, and `inspect.unwrap(func)` goes all the way to the original — the fastest way to confirm what is actually being called.

**Anti-pattern:** Decorators that silently swallow exceptions or change the return type. Cross-cutting concerns should be invisible to correct callers; a decorator that changes semantics belongs in the function, where it is visible.

---

### 7.2 Decorators with Arguments

**Best practices:** Make configuration keyword-only so a missing `()` fails immediately, validate the configuration in the factory rather than in the wrapper, and document the defaults — decorator configuration is easy to forget at the call site.

**Common production bugs:** Mutable state in the decorator closure shared across threads — a rate limiter or cache built from a plain list or dict without a lock, producing races under concurrency.

**Real-world use case:** Retry with back-off, rate limiting, caching with a TTL, permission checks scoped to a role, and feature flags — all configured per decorated function.

**Testing advice:** Test the decorated function's behaviour *and* the configuration boundary — zero retries, the limit exactly reached, the limit exceeded. Decorator edge cases are rarely exercised by the tests of the function itself.

**Anti-pattern:** Decorators that read configuration at import time from the environment, so behaviour cannot be changed in tests without re-importing the module.

---

### 7.3 Class Decorators

**Best practices:** Use them for registration and small additions; keep them idempotent so re-import or re-decoration does not duplicate registry entries. Always return the class.

**Real-world use case:** Registering serialisers, routes, plugins or task handlers by decorating the class, and generating boilerplate methods the way `@dataclass` does.

**Common production bugs:** A registry populated by decorators that is incomplete because the module defining the classes was never imported. Registration by import side effect requires an explicit import somewhere — usually a package `__init__` or an entry-point scan.

**Maintainability:** Because decorators are not inherited, a subclass silently misses the behaviour. When behaviour must apply to a hierarchy, `__init_subclass__` is the correct tool and reviewers should push for it.

**Framework relevance:** Django's `@admin.register`, Celery's `@app.task` on classes, and `@dataclass` are all class decorators — the pattern is idiomatic and reviewers expect it.

---

### 7.4 Context Managers

**Best practices:** Wrap every acquire/release pair in a context manager: connections, locks, transactions, temporary files, changed global state. Return `False` (or nothing) from `__exit__` unless suppression is the deliberate purpose.

**Common production bugs:** An `__exit__` that ends with a call returning a truthy value, silently swallowing every exception in the block. Transactions then "succeed" while the work inside failed.

**Real-world use case:** Database transactions with commit/rollback, distributed locks with lease release, temporary directories in tests, and timing or tracing spans around a block of work.

**Debugging tips:** When exceptions vanish, audit `__exit__` return values and `contextlib.suppress` blocks first — those are the only two places Python silently discards an exception.

**Testing advice:** Test that cleanup runs when the block raises, not only on the happy path. `with pytest.raises(...)` inside the `with` block, then assert the resource was released.

> ⚠️ **Warning:** If `__enter__` acquires several resources and one acquisition fails, `__exit__` never runs — the block was never entered. Clean up inside `__enter__`, or use `ExitStack` so each resource is registered as it is acquired.

---

### 7.5 The contextlib Module

**Best practices:** Prefer `@contextmanager` for simple pairs, `ExitStack` when the resource count is dynamic, and `nullcontext` to avoid duplicating a block for the optional case. Create a fresh manager per use.

**Real-world use case:** Opening a variable number of files or connections, conditionally acquiring a lock, capturing stdout in tests, and wrapping legacy objects that have `close()` but no context-manager protocol.

**Common production bugs:** Module-level `@contextmanager` objects reused across requests, failing with `RuntimeError: generator didn't yield` the second time. The manager must be *called* each time, not stored.

**Testing advice:** `contextlib.ExitStack` in fixtures makes multi-resource setup and teardown reliable, and `redirect_stdout`/`redirect_stderr` let you assert on console output without monkey-patching.

**Modern recommendations:** For async code use `@asynccontextmanager` and `AsyncExitStack`, which mirror the synchronous API. Mixing the two — an async resource in a sync `with` — silently does nothing useful.

---

### 7.6 Metaclasses

**Best practices:** Do not write one unless a class decorator and `__init_subclass__` both genuinely cannot do the job. If you must, document it prominently — every future reader will need the explanation.

**Common production bugs:** Metaclass conflicts when your class is combined with another library's base class, producing "metaclass conflict" errors that users cannot resolve without changing your code.

**Maintainability:** Metaclasses obscure where behaviour comes from. New team members cannot find it by reading the class, and static analysis often cannot either — which makes refactoring risky.

**Framework relevance:** SQLAlchemy's declarative base, Django models, `abc.ABCMeta` and enums all use metaclasses. Understanding them is mostly about debugging those frameworks rather than writing your own.

**Anti-pattern:** Using a metaclass to enforce a coding convention (naming, required methods) that a linter, a test, or `__init_subclass__` could enforce more cheaply and more visibly.

---

### 7.7 init_subclass and set_name

**Best practices:** Use `__init_subclass__` for registration and structural validation, always calling `super().__init_subclass__(**kwargs)`. Use `__set_name__` in every descriptor so field names are never duplicated.

**Real-world use case:** Plugin registries keyed by a class keyword, enforcing that every handler implements a method, and descriptor-based field systems in internal frameworks.

**Common production bugs:** Registration that fires on abstract intermediates as well as concrete classes, so the registry contains base classes that cannot be instantiated. Guard with `inspect.isabstract(cls)` or an explicit flag.

**Testing advice:** Test the hook directly by defining a subclass inside the test — including a deliberately invalid one — and asserting the registry entry or the `TypeError`. Class-creation-time behaviour is easy to test and rarely is.

**Modern recommendations:** Treat PEP 487 hooks as the default answer to "I need something to happen when this class is subclassed". Reach for a metaclass only when the class *namespace* must change during creation.

---

### 7.8 Dynamic Attributes

**Best practices:** Keep dynamic attribute access at the edges — API clients, configuration wrappers, proxies — and use explicit attributes or dataclasses in the domain model where tooling and readers benefit from knowing the shape.

**Common production bugs:** `__getattr__` raising `KeyError` instead of `AttributeError`, which breaks `hasattr`, `copy`, `pickle` and `deepcopy` in confusing ways — often first seen when an object crosses a process boundary.

**Performance considerations:** `__getattribute__` runs on every access and can dominate a hot path. `__getattr__` costs nothing when attributes exist, so prefer it whenever a fallback is all you need.

**Security implications:** Attribute access driven by external data is dangerous: a proxy that forwards `getattr(self._target, name)` for any `name` exposes private attributes and methods of the wrapped object. Restrict to an allow-list.

**Maintainability:** Dynamic attributes defeat IDE completion, type checking and code search. A `TypedDict`, dataclass or Pydantic model gives the same convenience with none of the opacity — prefer them whenever the schema is actually known.

---

### 7.9 Reflection

**Best practices:** Use reflection in tooling and frameworks, not in business logic. Where it is necessary, validate names against an explicit allow-list and prefer `getattr(obj, name, default)` over `hasattr` plus access.

**Common production bugs:** Mass assignment — building objects from request data with `setattr` in a loop, letting a caller set fields such as `is_admin` or `balance` that were never meant to be writable.

**Security implications:** Any path from user input to an attribute name, a module name or a class name is a privilege-escalation vector. Map external names to internal ones through an explicit dictionary.

**Performance considerations:** `getattr` with a computed string is slower than direct access, and `inspect` calls are slow enough to matter at import time. Cache signature lookups rather than repeating them per request.

**Framework relevance:** Understanding reflection is what lets you debug framework magic — why pytest did not collect a test, why FastAPI rejected a parameter, why a serialiser missed a field. The answer is almost always in what the framework introspected.

---

### 7.10 exec, eval and Code Generation

**Best practices:** Do not use `eval` or `exec` on anything a user can influence. For data, use `ast.literal_eval` or `json.loads`; for named behaviour, use an explicit dispatch dictionary; for plugins, use entry points or `importlib` with an allow-list.

**Common production bugs:** Configuration parsed with `eval` "because it is convenient", which turns a config file, an environment variable or a database column into a remote code execution path the moment anything upstream is compromised.

**Security implications:** This is the highest-severity item in this group. Restricted globals do not create a sandbox — the object graph provides paths back to builtins. Treat `eval` of external input exactly as you would `os.system` of external input.

**Debugging tips:** Generated code appears as `<string>` in tracebacks. Compile with a descriptive filename and, if you must generate frequently, keep the source available so errors can be read.

**Modern recommendations:** Prefer generating code at build time (a script that writes a real `.py` file you can read, lint, type-check and review) over generating it at runtime. When runtime generation is genuinely needed, follow the standard library's example and generate only from templates you control.

> ⚠️ **Warning:** `pickle.loads` carries the same risk as `eval` — deserialising untrusted pickle data executes arbitrary code. Use JSON for anything crossing a trust boundary.

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

**Best practices:** Keep module top level free of side effects — define things, do not do things. Configuration, connections and clients should be created by a function or at application start-up, not at import.

**Common production bugs:** A module that connects to a database at import time, so importing it in a test, a migration or a worker opens a connection nobody wanted. It also makes import order load-bearing, which is a fragile dependency to have.

**Performance considerations:** Cold start is dominated by imports. `python -X importtime app.py` ranks them; deferring heavy optional imports into the functions that use them often halves CLI start-up and serverless cold starts.

**Debugging tips:** `sys.modules` shows what is loaded, `module.__file__` shows from where, and `-X importtime` shows the cost. Those three answer nearly every import question in production.

**Anti-pattern:** Module-level mutable state used as a cache without bounds or locks. It is shared by every request and thread in the process, so it is simultaneously a memory leak and a race condition.

---

### 8.2 Packages

**Best practices:** Keep `__init__.py` to a small set of re-exports and metadata. Use module-level `__getattr__` (PEP 562) to make heavy optional integrations lazy, so importing the package does not import every backend.

**Common production bugs:** A missing `__init__.py` in a subdirectory, which builds and installs as an empty namespace package — the wheel imports fine but the modules are simply absent, and it only shows up in production.

**Maintainability:** Treat the names in `__init__.py` as the public API and everything else as internal. Without that boundary, users import from private modules and every internal refactor becomes a breaking change.

**Testing advice:** Add a test that imports the installed package from a clean environment and touches each public name. It catches packaging mistakes that unit tests, running from the source tree, never see.

**Framework relevance:** Django apps, pytest plugins and Celery task modules all rely on package structure and import side effects for discovery, so package layout is functional, not merely organisational.

---

### 8.3 Absolute and Relative Imports

**Best practices:** Use absolute imports across package boundaries and relative imports for tight intra-package references. Be consistent — mixing both for the same target is how you end up with two module objects.

**Common production bugs:** A module imported under two different names — once as `myapp.models` and once as `models` — producing two distinct class objects, so `isinstance` fails and ORM registries contain duplicates.

**Debugging tips:** When `isinstance` fails on objects that clearly look right, compare `type(obj).__module__` on both. Two different module paths means double import, almost always from a `sys.path` layout problem.

**Maintainability:** Absolute imports are searchable, which matters when you need to find every user of a module before changing it. That searchability is worth more than the brevity of a relative import.

**Anti-pattern:** Running package modules as scripts in production entry points. Use `python -m package.module` or an installed console script so the package context is correct.

---

### 8.4 sys.path and Module Resolution

**Best practices:** Install your package (`pip install -e .` in development) rather than relying on the current directory. Never call `sys.path.append` in application code — it makes behaviour depend on where the process happened to start.

**Common production bugs:** A module file shadowing a standard-library or dependency name — `logging.py`, `types.py`, `queue.py` in the project root — breaking imports for the whole process with an error that names an unrelated library.

**Debugging tips:** In an incident, `python -c "import x; print(x.__file__, x.__version__)"` inside the running container answers "which version is actually loaded" faster than reading any manifest.

**Security implications:** A writable directory early on `sys.path` is a code-injection vector: an attacker who can drop a file there shadows a legitimate module. Keep application directories read-only in production images.

**Anti-pattern:** Path manipulation in `conftest.py` or a bootstrap script to make imports work. It hides a packaging problem and behaves differently in CI, in the IDE and in production.

---

### 8.5 Circular Imports

**Best practices:** Keep dependencies pointing one way — domain does not import infrastructure, models do not import services. When a cycle appears, extract the shared piece rather than deferring the import.

**Common production bugs:** A cycle that works in the application because of import order and fails in a test that imports one module first. It presents as "tests fail in CI but pass locally", which wastes a great deal of time.

**Debugging tips:** Read the traceback from the bottom: the last frame before the error shows which module was mid-import. `python -v` prints every import in order, which makes the loop visible.

**Maintainability:** Enforce the direction with an architecture test — `import-linter` or a simple test asserting that certain packages never appear in others' imports. Cycles then fail in CI instead of at 3 a.m.

**Modern recommendations:** Use `if TYPE_CHECKING:` plus quoted annotations for imports needed only by the type checker. With PEP 649 in 3.14, annotations are lazily evaluated, which removes many annotation-driven cycles entirely.

---

### 8.6 main and Entry Points

**Best practices:** Declare console scripts in `[project.scripts]` rather than telling users to run a path. Keep `main()` to argument parsing plus a call into a normal function that returns a value, and let the guard translate it to an exit code.

**Common production bugs:** Missing `if __name__ == "__main__":` in a script that uses `multiprocessing`, which on spawn platforms forks recursively until the machine is out of memory.

**Real-world use case:** CLI tools, management commands, worker processes and migration scripts — each installed as an entry point so deployment does not depend on file layout.

**Testing advice:** Test `main()` directly by passing an argument list, and assert the return code. Testing through `subprocess` is slower and hides the traceback you actually need.

**Modern recommendations:** Return an exit code from `main()` and use `raise SystemExit(main())`. It avoids `sys.exit` scattered inside library functions, where it turns a recoverable error into a process exit.

---

### 8.7 Virtual Environments

**Best practices:** One environment per project, created from a pinned interpreter version, recreated from the lock file rather than mutated in place. In containers, install into the system Python of the image — the container is the isolation.

**Common production bugs:** A deployment that installs dependencies outside the environment the service actually runs with, so the service starts with a stale or missing package. Always invoke the interpreter explicitly (`.venv/bin/python -m pip`) in scripts.

**Debugging tips:** `python -c "import sys; print(sys.executable, sys.prefix)"` inside the failing process identifies which interpreter and environment is really in use — often not the one the deploy script touched.

**Modern recommendations:** `uv` creates environments and resolves dependencies far faster than `pip` plus `venv`, with a compatible lock format, and has become the default choice for new projects. The underlying model is unchanged.

**Anti-pattern:** Committing a virtual environment, or copying one between machines. Paths are baked in, and the result fails in ways that look like Python bugs.

---

### 8.8 Dependency Management

**Best practices:** Declare ranges in `pyproject.toml`, commit a lock file for applications, separate development dependencies into a group, and update on a schedule rather than only when something breaks.

**Common production bugs:** An unpinned transitive dependency releasing a breaking change, so a rebuild of the same commit produces a different, broken image. A committed lock file makes builds reproducible and turns that into a deliberate update.

**Security implications:** Run a vulnerability scanner (`pip-audit`, or the equivalent in your platform) in CI, and treat dependency updates as a security activity. Also beware typosquatting: verify package names before adding them.

**Scalability concerns:** Large dependency trees slow every build, every image pull and every cold start. Periodically ask whether a dependency is earning its place — a single-function library rarely is.

**Monitoring:** Record the resolved dependency versions in your build artefact or image labels. When behaviour changes after a deploy, comparing dependency sets is often the fastest route to the cause.

> ⚠️ **Warning:** `pip install` without a lock file resolves fresh every time. Two builds of the same commit, a week apart, can install different versions — which is how a "no-code-change" deploy breaks production.

---

### 8.9 Distributing a Package

**Best practices:** Build with a standard PEP 517 backend, publish both a wheel and an sdist, test the built wheel in a clean environment before uploading, and automate releases from CI with trusted publishing rather than a long-lived token.

**Common production bugs:** An incomplete wheel — missing subpackages or data files — that imports successfully but fails at the first use of the missing module. Installing the artefact in a clean environment catches it in seconds.

**Security implications:** Publish with OIDC trusted publishing where available, so no API token exists to leak. Never build releases from a developer machine without verification; a compromised local environment can inject code into the artefact.

**Real-world use case:** Internal libraries shared between services, published to a private index. The same discipline — versioning, lock files, changelogs — applies, and matters more because consumers are colleagues who cannot easily debug your package.

**Modern recommendations:** Use `hatchling` or `setuptools` with a declarative `pyproject.toml`, `cibuildwheel` for compiled extensions, and calendar or semantic versioning applied consistently. Document the deprecation policy — users depend on it more than on features.

---

### 8.10 Namespace Packages and Plugins

**Best practices:** Prefer entry points over import-time scanning for extensibility, wrap each plugin load in error handling, and version the plugin interface explicitly so a host upgrade does not silently break third-party plugins.

**Real-world use case:** pytest plugins, Airflow providers, CLI extensions and internal platform plugins where teams ship capabilities independently of the host's release cycle.

**Common production bugs:** One broken plugin crashing the host at start-up because loading was not guarded, taking down a service for a dependency that was optional by design.

**Security implications:** Loading entry points executes code from every installed distribution that declares one. In environments where dependencies are not fully controlled, that is a supply-chain risk — validate which plugins are permitted rather than loading everything found.

**Monitoring:** Log the plugin names and versions loaded at start-up. When behaviour differs between two deployments of the same application, the plugin set is frequently the difference.

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

**Best practices:** Profile before adding concurrency, and state the target explicitly — throughput, latency or cost. Concurrency that improves throughput often worsens tail latency, and it is better to choose that trade deliberately than to discover it in production.

**Common production bugs:** Adding workers to a system whose bottleneck is downstream — a database with a connection limit, or a rate-limited API. Concurrency then converts a slow service into a failing one by exhausting the shared resource.

**Scalability concerns:** Every concurrency model has a saturation point. Past it, adding workers increases queueing and context switching without improving throughput, and latency percentiles climb sharply.

**Monitoring:** Track queue depth, in-flight request count, worker utilisation and latency percentiles together. Throughput alone hides the moment a system tips from busy into overloaded.

**Anti-pattern:** Concurrency as the first optimisation. Caching, batching, a better query or doing less work usually yield more, with far less operational risk.

---

### 9.2 The Global Interpreter Lock

**Best practices:** Design around it rather than fighting it — processes for CPU work, native libraries that release it for numeric work, threads only where waiting dominates. Measure rather than assume where your time goes.

**Real-world use case:** Data pipelines that look CPU-bound are often dominated by NumPy, Polars or a database driver — all of which release the GIL — so threads genuinely help. Pure-Python parsing loops do not.

**Common production bugs:** A C extension holding the GIL through a long call, stalling an otherwise healthy service. It presents as sporadic, unexplained latency spikes affecting every request at once.

**Modern recommendations:** Treat the free-threaded build as an option to evaluate, not a default. It is officially supported from Python 3.14, but every compiled dependency must support it, and single-threaded performance differs — benchmark your own workload before switching.

**Debugging tips:** `py-spy dump --pid <pid>` shows every thread's stack in a running process, which is how you find the thread holding the GIL during a stall — without modifying or restarting the service.

---

### 9.3 Threads

**Best practices:** Prefer `ThreadPoolExecutor` over raw threads, bound the pool, and pass work through a bounded queue so a fast producer cannot exhaust memory. Install `threading.excepthook` so failures are never silent.

**Common production bugs:** A worker thread dying on an unhandled exception while the queue keeps filling. The service looks healthy — the process is alive — but the work quietly stops being done.

**Performance considerations:** Thread count is not a free parameter. Too few underuses the waiting capacity, too many wastes memory and adds contention. Size to the downstream limit — the database pool, the API's rate limit — not to core count.

**Debugging tips:** For a hung process, `faulthandler.dump_traceback_later(30, exit=False)` or `py-spy dump` gives every thread's stack. Deadlocks are obvious once you can see two threads waiting on each other's locks.

**Anti-pattern:** Daemon threads doing work that matters. They are killed at interpreter exit without running `finally` blocks, so buffered writes and in-flight work are lost on every restart.

---

### 9.4 Thread Synchronisation

**Best practices:** Prefer message passing through a bounded `queue.Queue` over shared state. Where locks are necessary, keep critical sections tiny, never perform I/O while holding a lock, and always use `with`.

**Common production bugs:** Deadlock from inconsistent lock ordering, which appears only under a specific interleaving — typically at peak load, and never in testing. A consistent global lock order and acquisition timeouts turn it into a logged error instead of a hang.

**Performance considerations:** A lock held during a network call serialises the entire system on that call. Compute inside the lock, do I/O outside it — or copy what you need and release before the slow part.

**Monitoring:** Export queue depth and lock wait time. Rising queue depth is the earliest signal that consumers cannot keep up, well before latency alerts fire.

**Testing advice:** Race conditions rarely reproduce under normal test conditions. Add stress tests with many threads and deliberate delays at suspicious points, and run them with a short `sys.setswitchinterval` to widen the windows.

> ⚠️ **Warning:** Do not rely on operations being atomic "because of the GIL". `list.append` happens to be atomic in CPython today; `x += 1`, `if key not in d: d[key] = v` and every read-modify-write sequence are not.

---

### 9.5 Multiprocessing

**Best practices:** Use `ProcessPoolExecutor` rather than raw processes, set the start method explicitly, keep task granularity coarse enough to dominate overhead, and pass references (paths, ranges, shared-memory handles) rather than large objects.

**Common production bugs:** A worker killed by the OOM killer, producing `BrokenProcessPool` and losing every in-flight task. Bound memory per worker, checkpoint progress, and make tasks idempotent so a retry is safe.

**Performance considerations:** Serialisation frequently dominates. Sending a 500 MB dataframe to four workers costs more than the computation saves; memory-mapping the file or using `shared_memory` avoids the copies entirely.

**Debugging tips:** Exceptions from workers arrive with the worker's traceback attached, but the parent's frames are missing. Log the task identifier alongside the error so you can reproduce that single task in-process.

**Modern recommendations:** Python 3.14 makes `spawn` the default on Linux, because `fork` in a process with threads is unsafe. Set `set_start_method("spawn")` explicitly today so behaviour is identical across platforms and versions.

---

### 9.6 concurrent.futures

**Best practices:** Always consume results — iterate `as_completed` or call `result()` — so exceptions surface. Bound the number of outstanding submissions with a semaphore, and set timeouts on `result()` so a hung task cannot block a request forever.

**Common production bugs:** Futures submitted and never examined, so every worker exception is silently discarded and the job reports success while producing nothing.

**Scalability concerns:** `submit` has no back-pressure. A loop submitting a million items queues a million callables and their arguments in memory before the first result is read. Chunk the input or throttle with a semaphore.

**Monitoring:** Instrument submission and completion counts, and export the difference as in-flight work. That single gauge distinguishes "slow" from "stuck" faster than any log.

**Testing advice:** Test the failure path: a task that raises, a task that times out, and a pool that is shut down mid-flight. All three occur in production and none occur in the happy-path test.

---

### 9.7 The Event Loop

**Best practices:** Use `asyncio.run()` as the single entry point, keep the loop free of blocking work, and set explicit timeouts on every external call. Prefer `uvloop` for network-heavy services when the dependency is acceptable.

**Common production bugs:** One blocking call — a synchronous DNS lookup, a large JSON parse, a logging handler writing to a slow disk — freezing every concurrent request. The symptom is that *all* latencies spike together, which is the fingerprint of loop starvation.

**Debugging tips:** Run with `PYTHONASYNCIODEBUG=1` in staging. It logs slow callbacks and coroutines that were never awaited — the two most common async faults — with the offending code location.

**Monitoring:** Export event-loop lag: schedule a callback every second and record how late it runs. Lag above a few tens of milliseconds means the loop is starved, and it is the single most valuable async metric.

**Scalability concerns:** One loop uses one core. Scale across cores by running several worker processes, each with its own loop, behind a load balancer — the standard deployment for async web services.

---

### 9.8 Coroutines and await

**Best practices:** Await concurrently where operations are independent — `gather` or a `TaskGroup` — and sequentially where one depends on the other. Wrap every external await in a timeout so a slow dependency cannot pin a request indefinitely.

**Common production bugs:** Sequential awaits in a loop over independent calls, turning a 200 ms operation into 20 seconds at scale. It is the most common async performance mistake, and it looks perfectly reasonable in review.

**Performance considerations:** Concurrency must be bounded. Ten thousand simultaneous outbound requests will exhaust file descriptors or overwhelm the target; a semaphore around the awaits caps it at a sane number.

**Debugging tips:** "Coroutine was never awaited" warnings indicate real, silently skipped work. Treat them as errors in CI — they almost always mean a call that never happened.

**Framework relevance:** FastAPI runs `async def` endpoints on the loop and `def` endpoints in a thread pool. Declaring a blocking function `async` removes that safety net and blocks the loop — a very common production incident in FastAPI services.

---

### 9.9 Tasks and Task Groups

**Best practices:** Use `TaskGroup` for concurrent work with a clear scope, keep strong references to any standalone task, and always pair long-running tasks with a cancellation path checked at shutdown.

**Common production bugs:** Fire-and-forget tasks that are garbage collected mid-execution because nothing referenced them — work simply disappears under load, with an occasional "Task was destroyed but it is pending" message as the only clue.

**Real-world use case:** Fan-out to several services with a deadline, background refresh of a cache, and graceful shutdown that cancels in-flight work and waits briefly for it to unwind.

**Monitoring:** Count active tasks and report unhandled task exceptions to your error tracker through the loop's exception handler. Without that hook, task failures are logged to stderr at garbage-collection time, if at all.

**Modern recommendations:** Prefer `TaskGroup` and `asyncio.timeout()` (3.11+) over `gather` and `wait_for`. Structured concurrency makes lifetimes lexical, which removes the whole class of leaked-task bugs.

> ⚠️ **Warning:** `except Exception` does not catch `CancelledError`, which is deliberate. If you catch it explicitly for cleanup, re-raise — swallowing cancellation makes shutdown hang and is a common cause of stuck pods.

---

### 9.10 Async Iteration and Context Managers

**Best practices:** Stream with `async for` rather than materialising large result sets, manage every async resource with `async with`, and let `asyncio.run` handle async-generator shutdown.

**Real-world use case:** Server-sent events and WebSocket streams, database cursors over large result sets, and paginated API traversal where each page is fetched only when the consumer reaches it.

**Common production bugs:** An async generator abandoned without closing, leaving a database cursor or HTTP connection open until garbage collection. Under load this exhausts the connection pool.

**Performance considerations:** Streaming keeps memory flat but holds a connection for the duration. For long-running consumers, fetch in bounded batches instead so the connection is returned to the pool between batches.

**Testing advice:** Test cancellation mid-stream: cancel the consuming task and assert the underlying resource was released. That path is exercised constantly in production — every client disconnect — and almost never in tests.

---

### 9.11 Blocking Calls in Async Code

**Best practices:** Keep an explicit list of the blocking calls in an async codebase and wrap each one in `to_thread` or an executor. Audit new dependencies for whether they are genuinely async.

**Common production bugs:** A synchronous HTTP or database client used inside coroutines, so the service handles requests one at a time under the appearance of concurrency. Throughput collapses exactly when load arrives.

**Debugging tips:** Event-loop lag plus a stack sample during a spike identifies the blocking call within minutes. Without the lag metric, the same investigation takes days because every symptom points elsewhere.

**Performance considerations:** `to_thread` uses the default executor with a bounded thread pool, so many concurrent offloads queue. Size a dedicated executor for known-heavy paths rather than sharing the default one.

**Anti-pattern:** Marking a function `async def` to "make it async" while its body is entirely synchronous. It adds coroutine overhead, blocks the loop just as before, and misleads every reader.

---

### 9.12 Choosing a Concurrency Model

**Best practices:** Decide from profile data, document the reasoning near the code, and keep the model consistent within a service. Mixed models are fine at boundaries and confusing in the middle of a module.

**Real-world use case:** An async web service with a thread pool for a blocking legacy driver and a separate process pool for report generation — three models, each where it belongs, with clear boundaries between them.

**Common production bugs:** A team migrates a service to async for performance, but the database driver stays synchronous. The result is more complexity, the same throughput, and a new class of loop-starvation incidents.

**Scalability concerns:** Concurrency inside one process eventually hits a single-core or single-GIL ceiling. Horizontal scaling — more processes, more instances — is usually simpler operationally and is what production systems rely on.

**Monitoring:** Whichever model you choose, export the same three signals: in-flight work, queue depth and latency percentiles. They make different models comparable and make saturation visible before it becomes an incident.

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

**Best practices:** For large homogeneous data, leave the Python object model behind: `array.array`, NumPy, Polars or Arrow store values unboxed and contiguously. For many small records, use `@dataclass(slots=True)` or named tuples rather than dicts.

**Memory considerations:** A dict per record costs several times what a slotted object does, and an order of magnitude more than a packed array row. At a million records that difference decides whether the job fits in its container.

**Common production bugs:** Loading a large CSV into a list of dicts and hitting the container memory limit. The same data in a dataframe or in slotted objects often fits comfortably.

**Performance considerations:** Pointer chasing defeats CPU caches. Operations that stay inside C — vectorised array maths, `str.join`, `sum` over a generator — avoid per-element interpreter work and are usually the real fix.

**Anti-pattern:** Micro-optimising Python-level object churn in a hot loop instead of moving the loop into a library that processes the whole array at once.

---

### 10.2 Reference Counting

**Best practices:** Do not rely on prompt destruction for correctness. Close files, connections and locks with context managers, so behaviour is identical on CPython, PyPy and under exception paths.

**Common production bugs:** Code that assumes a file closes when a variable goes out of scope, then leaks file descriptors when an exception holds the frame alive — or when the code runs on a different implementation.

**Debugging tips:** `sys.getrefcount(obj)` is a quick sanity check, and `gc.get_referrers(obj)` shows who is holding it. Remember the count is inflated by one for the call itself.

**Memory considerations:** An exception object stored anywhere pins its traceback, every frame in it, and all their locals. In retry queues and error aggregation this retains far more than the error message implies — store the formatted string instead.

**Anti-pattern:** Implementing `__del__` to release resources. It runs at an unpredictable time, is skipped at shutdown, and swallows its own exceptions; use `contextlib` or `weakref.finalize`.

---

### 10.3 The Cycle Collector

**Best practices:** Leave the collector enabled unless you have measured a problem. If you do tune it, `gc.freeze()` after start-up is the low-risk option; raising thresholds trades memory for fewer pauses.

**Real-world use case:** Pre-forking servers (Gunicorn, uWSGI) call `gc.freeze()` in the parent after loading the application, so the collector does not touch — and therefore does not dirty — copy-on-write pages shared with the workers.

**Common production bugs:** Latency spikes correlated with generation-2 collections in services holding large in-memory structures. The p99 moves while the p50 does not, which is the signature.

**Monitoring:** `gc.callbacks` lets you record collection counts and durations as metrics. Without them, GC pauses are indistinguishable from mysterious slow requests.

**Performance considerations:** Disabling the collector entirely is a legitimate technique for short-lived batch processes that create no cycles — and a slow leak in anything long-running that does.

> 💡 **Tip:** Before tuning the collector, check whether the large structure needs to be in memory at all. Streaming or an external store usually beats GC tuning.

---

### 10.4 Memory Allocators

**Best practices:** Do memory-heavy work in a process that exits when it is done. Process boundaries are the only reliable way to return memory to the operating system in a Python service.

**Common production bugs:** A container OOM-killed because a periodic job's peak allocation never returns to the OS, so RSS stays at the high-water mark and the next peak exceeds the limit.

**Memory considerations:** Set container limits from the observed high-water mark, not the steady state. Python's allocator behaviour makes the peak the number that matters.

**Debugging tips:** When RSS is high but `tracemalloc` shows little live memory, the cause is allocator retention or fragmentation rather than a leak — and the fix is architectural (worker recycling), not a code change.

**Modern recommendations:** Recycle workers periodically (`--max-requests` in Gunicorn, `max_tasks_per_child` in pool executors). It is the standard, boring answer to gradual memory growth in long-running Python services.

---

### 10.5 Interning and Object Caches

**Best practices:** Use `==` for values, always. Reserve `is` for `None`, `True`, `False` and unique sentinels. Consider `sys.intern` only for deliberate deduplication of many repeated strings.

**Real-world use case:** Parsing millions of records with repeated field names or category values — interning collapses them to one object each, which can cut memory noticeably in log and event processing.

**Common production bugs:** Comparisons written with `is` that pass on small test data and fail in production once values exceed the cached range or are built at runtime.

**Memory considerations:** The intern table is never trimmed. Interning unbounded user-supplied strings converts a memory optimisation into a permanent leak.

**Testing advice:** Test with values outside the cached ranges — integers above 256, strings built at runtime. Identity bugs are invisible to fixtures that use small literals.

---

### 10.6 Measuring Memory

**Best practices:** Export RSS as a metric for every service, and keep a `tracemalloc` diagnostic path that can be enabled on demand. Measure at the same lifecycle point when comparing runs.

**Real-world use case:** Investigating gradual growth in a long-running worker: snapshot at start-up and again after n hours, diff by traceback, and the top entries name the offending line directly.

**Common production bugs:** Alerting on RSS alone and paging for normal allocator behaviour. Alert on sustained growth over hours, not on a single high reading.

**Monitoring:** Track RSS, `gc` counts and, where feasible, `sys.getallocatedblocks()`. Together they distinguish a genuine leak from fragmentation from an unusually large workload.

**Debugging tips:** In containers, read the cgroup memory limit and current usage rather than host-level metrics — a process can be OOM-killed while the host has plenty of free memory.

---

### 10.7 Memory Leaks

**Best practices:** Bound every cache — `maxsize`, a TTL, or weak values. Prefer `cached_property` to `lru_cache` on methods. Unregister callbacks and listeners in teardown, and never store exception objects long-term.

**Common production bugs:** A module-level dict keyed by user or request identifier, growing forever. It is the single most common Python memory leak, and it looks entirely innocuous in review.

**Monitoring:** Alert on sustained RSS growth across a deploy-to-deploy window. A leak that takes days to matter is invisible in any short test, so production monitoring is the only place it will be caught.

**Testing advice:** Add a soak test that runs a realistic workload for a long period and asserts memory plateaus. It is the only test that catches this class of bug before users do.

**Debugging tips:** `objgraph.show_backrefs` renders the chain from a leaked object back to its root, which usually identifies the owning structure in one picture — far faster than reading `gc.get_referrers` output by hand.

> ⚠️ **Warning:** `@lru_cache` and `@cache` on instance methods keep every instance alive for the process lifetime. In a web service, that is one retained object graph per request that ever touched the method.

---

### 10.8 Weak References

**Best practices:** Use `WeakValueDictionary` for caches that must not extend lifetime, `weakref.WeakMethod` for callbacks bound to instances, and `weakref.finalize` for cleanup instead of `__del__`.

**Real-world use case:** Observer registries, connection or session pools that should not resurrect dead objects, and parent links in tree structures where a strong back-reference would create a cycle.

**Common production bugs:** An event system holding strong references to bound methods, so every subscriber — and everything it references — is retained after the subscriber should have been discarded.

**Debugging tips:** If a weak cache appears to lose entries "too early", something else was the only strong reference and it went away. That is the cache working as designed; the fix is to hold a strong reference for the duration of the work.

**Anti-pattern:** Using weak references to paper over unclear ownership. They are a tool for deliberate non-ownership, not a way to avoid deciding who owns what.

---

### 10.9 Bytecode and the Evaluation Loop

**Best practices:** Use `dis` to answer semantic questions during review and debugging, not as a routine optimisation step. Optimise algorithms and data structures first; instruction-level tuning is the last few percent.

**Real-world use case:** Settling disagreements — whether a slice copies, how many attribute lookups a line performs, what a decorator actually wrapped. One disassembly ends the discussion.

**Performance considerations:** In a genuinely hot loop, hoisting attribute and global lookups into locals removes a dictionary lookup per iteration. Do it where a profiler pointed, and leave a comment saying why.

**Debugging tips:** When behaviour differs between environments, compare `python -VV` and the module's `__file__` before suspecting bytecode. Version-specific instruction differences almost never cause application bugs.

**Anti-pattern:** Shipping bytecode-level tricks — manipulating code objects, patching instructions — in application code. It breaks on every minor upgrade and nobody else can maintain it.

---

### 10.10 Interpreter Optimisations

**Best practices:** Keep interpreter versions current; each recent release has brought measurable CPU improvements for free. Benchmark your own workload before and after an upgrade, and record the numbers.

**Real-world use case:** Teams have seen double-digit percentage CPU reductions moving from 3.10 to 3.11+ on CPU-heavy services — a cost saving with no code change, which is rare enough to prioritise.

**Common production bugs:** Not the interpreter's — upgrades break on C extensions that have not been rebuilt for the new ABI. Test the whole dependency tree, not just your code.

**Performance considerations:** Benefits land on CPU time. An I/O-bound service will see little change, so set expectations from a profile rather than from release notes.

**Modern recommendations:** Treat the JIT (3.13+) and the free-threaded build (supported from 3.14) as things to evaluate with your own benchmarks and your own dependencies — not as defaults to adopt on principle.

---

### 10.11 Profiling

**Best practices:** Profile with production-shaped data, in an environment resembling production, and re-measure after every change. Keep a sampling profiler available for live processes so investigation does not require a redeploy.

**Real-world use case:** `py-spy top --pid` on a struggling pod identifies the hot function in under a minute, with no restart and no lost state — the single most valuable production Python debugging tool.

**Common production bugs:** Optimising the wrong thing. The classic is tuning serialisation while the real cost is an N+1 query pattern that a profiler would have shown as thousands of small database calls.

**Monitoring:** Continuous profiling — periodic low-overhead samples shipped to a store — turns performance from a reactive investigation into a trend you can watch, and makes regressions visible at the deploy that caused them.

**Testing advice:** Add a benchmark for genuinely hot paths and track it in CI. It will not catch every regression, but it catches the accidental O(n²) that unit tests happily pass.

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

**Best practices:** Always use `with`, always pass `encoding=`, and anchor paths to a configured root or `Path(__file__).parent` rather than the working directory, which differs between your shell, systemd and a container.

**Common production bugs:** File-descriptor exhaustion from files opened in a loop without `with` — `OSError: Too many open files` appears under load, long after the code that leaked them.

**Monitoring:** Track open descriptors per process (`/proc/<pid>/fd` on Linux, or `psutil.Process().num_fds()`). A steady climb is an unambiguous leak signal well before the limit is hit.

**Security implications:** Never build a path from user input without validating it against an intended root. Path traversal through `../` remains one of the most exploited web vulnerabilities.

**Anti-pattern:** Opening files at import time. It makes importing the module fail in environments where the file is absent — tests, migrations, documentation builds — for no benefit.

---

### 11.2 Text and Binary I/O

**Best practices:** Pass `encoding="utf-8"` everywhere, choose `errors=` deliberately per data source, and use binary mode for anything that is not text. Record the encoding in your data contract, since the file cannot carry it.

**Common production bugs:** A pipeline that has processed UTF-8 for a year receiving one Latin-1 file and failing with `UnicodeDecodeError`. Decide in advance whether that should fail the batch or be replaced and logged.

**Security implications:** Normalise Unicode (`unicodedata.normalize("NFC", s)`) before comparing identifiers, usernames or file names. Visually identical strings with different code points are a real impersonation vector.

**Testing advice:** Include non-ASCII, emoji and right-to-left text in fixtures as standard. ASCII-only test data cannot detect any encoding bug.

**Modern recommendations:** Set `PYTHONUTF8=1` in containers now; Python 3.15 makes UTF-8 mode the default, and adopting it early removes a class of platform differences.

---

### 11.3 Paths with pathlib

**Best practices:** Use `Path` throughout, resolve and validate any path derived from external input, and keep a single module that defines the application's directories rather than scattering path construction.

**Common production bugs:** Code that works locally and fails in a container because it assumed the working directory. Anchor to `Path(__file__).resolve().parent` or to configuration.

**Security implications:** `safe_join` — resolve, then confirm the result is inside the root with `is_relative_to` — is the standard defence against path traversal in upload and download endpoints. Filenames from users should also be sanitised, never used directly.

**Performance considerations:** `rglob("**/*")` over a large tree is slow and memory-hungry. Use `os.scandir` for large directories, and bound the traversal depth when the tree is user-controlled.

**Testing advice:** `tmp_path` in pytest gives each test a real, isolated directory. It is faster and far more faithful than mocking the filesystem.

---

### 11.4 Buffering and Flushing

**Best practices:** Run with unbuffered output in containers (`PYTHONUNBUFFERED=1`), flush at meaningful boundaries rather than per line, and reserve `fsync` for data whose loss would be unacceptable.

**Common production bugs:** Logs that stop just before a crash because the last lines were buffered. In an incident, that missing window is exactly the part you needed.

**Performance considerations:** `fsync` per record can reduce throughput by orders of magnitude on spinning disks and is still significant on SSDs. Batch records, sync once, and acknowledge after the sync.

**Monitoring:** If a service writes files, alert on write latency as well as errors. A slow disk manifests as rising request latency with no application-level cause.

**Anti-pattern:** `print` for application logging. It goes to stdout with its own buffering, carries no level, timestamp or structure, and cannot be filtered — use the `logging` module.

---

### 11.5 JSON

**Best practices:** Validate parsed JSON against a schema at trust boundaries, serialise money as strings or integer minor units, and use ISO 8601 for timestamps with an explicit timezone.

**Common production bugs:** A float used for a monetary field, accumulating rounding differences across systems. The second most common: a consumer in another language losing precision on integers beyond 2^53.

**Security implications:** Bound the size of JSON accepted from clients and cap nesting depth. Deeply nested documents can exhaust the stack, and huge ones exhaust memory — both are denial-of-service vectors.

**Performance considerations:** For high-throughput services, `orjson` or `msgspec` are several times faster than the standard library and also handle `datetime` natively. Measure before adding a dependency, but the difference is usually real.

**Modern recommendations:** Pair JSON with Pydantic v2 at the edges: parse, validate and coerce in one step, then work with typed objects internally rather than passing raw dicts around.

---

### 11.6 CSV and Tabular Data

**Best practices:** Always `newline=""`, read with `utf-8-sig` when files may come from Excel, convert types explicitly at the boundary, and validate the header before processing rows.

**Common production bugs:** A supplier changing column order or adding a column, silently shifting values in code that indexes by position. `DictReader` plus a header check turns that into an immediate, clear failure.

**Performance considerations:** The `csv` module streams and is memory-safe; `pandas.read_csv` is faster but loads everything. For large files, stream with `csv` or use chunked reads in pandas.

**Security implications:** CSV injection is real: a field beginning with `=`, `+`, `-` or `@` is interpreted as a formula when opened in a spreadsheet. Prefix such fields with an apostrophe when writing files that humans will open.

**Modern recommendations:** Use CSV for exchange with humans and spreadsheets; use Parquet between programs. Typed, compressed and columnar beats untyped text for every machine-to-machine case.

> ⚠️ **Warning:** Never build CSV by string formatting. A field containing a comma, a quote or a newline corrupts every downstream parse, and user-supplied text contains all three eventually.

---

### 11.7 Pickle and Serialization Formats

**Best practices:** Restrict pickle to fully trusted, same-version, Python-to-Python contexts, and prefer an explicit format everywhere else. Record the format version in the payload so migrations are possible.

**Common production bugs:** Pickled objects stored in a cache or database that fail to load after a refactor renames a class — a deploy that breaks on reading data written by the previous deploy.

**Security implications:** This is the highest-severity item in this group. `pickle.loads` on attacker-influenced bytes is remote code execution, and caches, queues and session stores are all attacker-influenced more often than teams assume.

**Real-world use case:** `multiprocessing` and `joblib` use pickle internally; ML model artefacts are commonly pickled. Both are acceptable because the producer and consumer are the same trusted pipeline.

**Modern recommendations:** For service-to-service messaging, use a schema format (Protobuf, Avro) or MessagePack; for analytics, Parquet; for configuration and APIs, JSON. Keep pickle for local, transient, trusted data.

---

### 11.8 Temporary Files and Atomic Writes

**Best practices:** Write every configuration, state or output file atomically. Create the temporary file in the destination directory, fsync before the rename, and clean up the temporary file if anything fails.

**Common production bugs:** A truncated config or state file after a crash or a full disk, so the service fails to start. The atomic pattern makes that impossible — you keep the previous version instead.

**Real-world use case:** Writing cache manifests, exported reports, generated configuration and checkpoint files. Anywhere a reader may run concurrently with a writer, atomicity is the requirement.

**Security implications:** Predictable temporary file names in shared directories enable symlink attacks. `tempfile` creates files with restrictive permissions and unpredictable names, which is why it should always be used rather than a hand-built path.

**Debugging tips:** Stray `.tmp` files in an output directory indicate failed writes. Include the process ID and a timestamp in the suffix so you can correlate them with logs.

---

### 11.9 Streaming Large Files

**Best practices:** Stream by default. Bound every read that comes from outside your system, and make chunk size a named constant so it can be tuned without hunting through the code.

**Common production bugs:** An endpoint that reads an uploaded file into memory, working fine until someone uploads a large one and the container is OOM-killed. Enforce a size limit before reading, not after.

**Security implications:** Unbounded reads are a denial-of-service vector — decompression bombs are the classic case, where a small archive expands to gigabytes. Limit both the compressed input and the decompressed output.

**Scalability concerns:** A single Python process streaming a huge file is single-threaded. Parallelise by splitting on record boundaries across workers, or move the transformation to a tool built for it.

**Monitoring:** Emit progress for long-running file jobs — bytes or records processed per interval. A stalled stream is otherwise indistinguishable from a slow one until the job times out.

---

### 11.10 Network I/O

**Best practices:** Set explicit connect, read and total timeouts on every call; reuse a pooled client; retry only idempotent operations with exponential back-off and jitter; and add a circuit breaker for dependencies that fail repeatedly.

**Common production bugs:** A call without a timeout holding a worker for minutes, so a slow dependency exhausts the pool and takes down a service that was otherwise healthy. This is the single most common cascading-failure pattern in Python services.

**Security implications:** Verify TLS certificates — never disable verification to make an error go away. Also validate any URL derived from user input against an allow-list, or the service becomes an SSRF proxy into your internal network.

**Monitoring:** Track per-dependency latency percentiles, error rates and timeout counts. Aggregate application-level metrics hide which dependency is degrading, which is what you need first during an incident.

**Modern recommendations:** Use `httpx` for both sync and async with the same API, set limits on the connection pool, and propagate a request identifier header so traces cross service boundaries.

> ⚠️ **Warning:** `requests` has no default timeout. A single call can hang until the operating system gives up. Pass `timeout=` on every request, or use a client wrapper that sets it for you.

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

**Best practices:** Annotate public function signatures and module boundaries first, use modern syntax (`list[int]`, `X | None`), and treat annotations as part of the API — changing one is a contract change even though nothing enforces it.

**Common production bugs:** A parameter annotated `str` that receives `None` in one code path, so the missing `None` branch is never flagged and fails at runtime with `AttributeError`. Annotating the truth — `str | None` — is what lets the checker help.

**Maintainability:** Annotations are documentation the checker keeps honest. Docstring type descriptions drift within months; annotations cannot, because CI fails when they stop matching.

**Framework relevance:** FastAPI, Pydantic, Typer, pytest and dependency-injection containers all read annotations at runtime. In those codebases annotations are not optional metadata — they are the configuration.

**Modern recommendations:** Adopt PEP 649 semantics when moving to 3.14: lazy annotation evaluation removes the runtime cost and most forward-reference awkwardness. Read annotations with `inspect.get_annotations` rather than touching `__annotations__`.

---

### 12.2 Generics and Type Variables

**Best practices:** Accept the widest type the function actually uses (`Iterable`, `Sequence`, `Mapping`) and return a concrete one. Keep generic signatures readable; when they are not, introduce a type alias with a meaningful name.

**Common production bugs:** A function annotated to take `list[X]` that callers must convert generators and tuples for — producing needless materialisation of large sequences purely to satisfy a type.

**Maintainability:** Over-general generic code is as hard to read as untyped code. If a signature needs three type variables and two bounds, consider whether two concrete functions would serve better.

**Framework relevance:** `ParamSpec` matters in shared decorators: without it, every decorated function loses its signature for the checker and the editor, which degrades the whole codebase silently.

**Modern recommendations:** Use PEP 695 syntax (`def f[T](...)`) on Python 3.12+. It removes the `TypeVar` boilerplate and makes scoping explicit, which is materially clearer in review.

---

### 12.3 Static Type Checking

**Best practices:** Run the checker in CI from day one, start with lenient settings, and tighten per module as annotations land. Pin the checker version so an upgrade does not fail unrelated pull requests.

**Real-world use case:** Large refactors — renaming a field, changing a return type, splitting a module — become tractable because the checker enumerates every affected call site before the code runs.

**Common production bugs:** Not the checker's, but what it would have caught: unhandled `None`, a renamed attribute, an argument passed in the wrong position after a signature change.

**Maintainability:** Typed boundaries make services safer to change by people who did not write them, which is the situation most production code is in within a year.

**Anti-pattern:** Blanket `# type: ignore` at the top of files to make CI green. Use the specific error code and a comment, so the suppression is reviewable and removable.

---

### 12.4 Runtime Validation

**Best practices:** Validate once at each trust boundary and pass typed objects inward. Mask sensitive fields in validation errors, and version your schemas so producers and consumers can evolve independently.

**Common production bugs:** Silent coercion hiding an upstream defect — a client sending `"0"` where `0` was meant, accepted as an integer, so the real problem surfaces much later somewhere unrelated. Strict mode at the boundary makes it visible.

**Security implications:** Validation is a security control. Bound string lengths, collection sizes and numeric ranges; reject unknown fields where mass assignment is a risk; and never echo raw input back in an error message.

**Performance considerations:** Pydantic v2's Rust core is fast, but validating very large payloads still costs measurable time. Validate the envelope eagerly and defer heavy nested parsing until you need it.

**Modern recommendations:** Pydantic v2 at the edges, plain dataclasses internally. Using models everywhere adds overhead and ceremony in places that never see external data.

> ⚠️ **Warning:** A `@dataclass` validates nothing. `Item(quantity="three")` constructs happily and fails later in arithmetic — which is why unvalidated dataclasses must not be built directly from request data.

---

### 12.5 Structural Pattern Matching

**Best practices:** Use `match` for data whose *shape* varies — protocol messages, parsed nodes, events — and always include a fallback case that logs the unmatched input rather than ignoring it.

**Common production bugs:** The capture-pattern mistake: `case Status.OPEN:` compares, `case status:` binds and matches everything. The second silently makes every later case unreachable, and no tool warns by default.

**Real-world use case:** Dispatching on webhook payloads, handling protocol frames, walking an AST, and converting a discriminated union into typed handling — all places where `isinstance` chains used to live.

**Maintainability:** Pattern matching reads well for genuinely structural cases and poorly for simple value dispatch. A dict mapping keys to handlers stays clearer, and reviewers will say so.

**Testing advice:** Test the fallback case explicitly with a malformed payload. It is the branch that runs in production when an upstream service changes, and it is almost never covered.

---

### 12.6 Modern Syntax Features

**Best practices:** Adopt modern syntax in new code and leave working code alone unless you are already changing it. Set `requires-python` honestly, and let `ruff`'s `UP` rules modernise mechanically where it is safe.

**Common production bugs:** Not the syntax itself but the version floor — using `X | Y` unions or `match` in a library declaring `requires-python = ">=3.8"` produces a `SyntaxError` at import for users on older interpreters.

**Maintainability:** Consistency matters more than novelty. A codebase mixing `Optional[X]` and `X | None`, `%` formatting and f-strings, costs more attention than either style alone.

**Security implications:** f-strings are not templates. Building SQL, shell commands or HTML with them is injection; use parameterised queries, argument lists and an autoescaping template engine.

**Modern recommendations:** `f"{value=}"` for debugging, walrus in read loops, `X | None` for optionals, PEP 695 generics on 3.12+ — a small set that covers most day-to-day gains.

---

### 12.7 Testing with pytest

**Best practices:** Fast, isolated unit tests around pure logic; a smaller set of integration tests over real dependencies; fixtures for setup; parametrisation instead of loops. Keep the suite fast enough that people run it before pushing.

**Common production bugs:** Tests that pass in isolation and fail together, caused by shared session-scoped state. Randomising test order in CI (`pytest-randomly`) surfaces the coupling immediately.

**Real-world use case:** Contract tests around external services — record the real response once, assert your parsing against it — catch upstream changes long before a customer does.

**Testing advice:** Cover the failure paths: timeouts, malformed input, empty results, and the falsy-but-valid values (`0`, `""`, `[]`). That is where production bugs live, and where coverage is usually thinnest.

**Anti-pattern:** Mock-heavy tests that assert on call counts rather than behaviour. They pass while the system is broken and fail on every harmless refactor — the worst combination available.

---

### 12.8 Linting and Formatting

**Best practices:** `ruff check` and `ruff format` in pre-commit and CI, a type checker alongside them, and one formatting-only commit recorded in `.git-blame-ignore-revs` when adopting.

**Common production bugs:** Genuine ones that linters catch routinely: mutable default arguments, bare `except`, unused variables masking a typo, `== None` comparisons, and f-strings missing their placeholders.

**Maintainability:** Automated formatting removes an entire category of review comment and makes diffs minimal, which means reviewers look at behaviour rather than at whitespace.

**Security implications:** Rule families such as `S` (bandit) flag `eval`, `subprocess(shell=True)`, weak hashes and hardcoded secrets. Enabling them is a cheap, continuous security review.

**Modern recommendations:** One tool (`ruff`) for lint and format, one type checker in CI, pinned versions, and a small, deliberately chosen rule set that the team actually reads.

---

### 12.9 Logging

**Best practices:** `getLogger(__name__)` everywhere, configure once at start-up with `dictConfig`, log in structured JSON in production, use lazy `%s` arguments, and include a correlation identifier on every record.

**Common production bugs:** Duplicate log lines from configuring logging twice or from propagation plus a local handler; and `logger.error(str(exc))` inside handlers, which discards the traceback exactly when it is needed.

**Security implications:** Logs are frequently the largest uncontrolled store of sensitive data. Never log passwords, tokens, full card numbers or complete request bodies; mask at the formatter so it cannot be forgotten at a call site.

**Performance considerations:** File and network handlers block the calling thread — and, in async code, the event loop. Use `QueueHandler` with a background listener for high-throughput services, and keep DEBUG logging out of hot loops.

**Monitoring:** Log levels are an operational interface. ERROR should mean "a human may need to act"; if ERROR is noisy, alerting on it becomes useless and real failures are missed.

> 💡 **Tip:** Structured logs with a `request_id` bound through a contextvar turn "find what happened to this user" from grep archaeology into a single query.

---

### 12.10 Debugging Tools

**Best practices:** `breakpoint()` locally, post-mortem debugging for unhandled exceptions, `faulthandler` registered on a signal in production, and a sampling profiler available for live processes.

**Real-world use case:** A pod that stops serving: `py-spy dump --pid 1` shows exactly which line every thread is on. That single command resolves most hangs in minutes rather than hours.

**Common production bugs:** A committed `breakpoint()` blocking a worker in production. A CI grep for `breakpoint(`, `pdb.set_trace` and stray `print(` costs nothing and prevents it.

**Debugging tips:** Run staging with `-X dev` so `ResourceWarning`, deprecation warnings and the faulthandler are all active. Most production surprises announce themselves there first.

**Monitoring:** Ship exceptions to an error tracker with `sys.excepthook`, `threading.excepthook` and the asyncio exception handler all wired up. Unhandled errors in threads and tasks are otherwise invisible.

---

### 12.11 Recent Python Releases

**Best practices:** Track a supported version, test against the next release candidate in CI, and treat upgrades as scheduled maintenance. Pin the version in `pyproject.toml`, the image tag and CI so all three agree.

**Common production bugs:** Running an end-of-life interpreter with no security patches, and discovering it during an audit rather than a planning cycle. The second: a compiled dependency without wheels for the new version, blocking an upgrade at the worst moment.

**Real-world use case:** Moving a CPU-heavy service from 3.10 to 3.11+ has delivered double-digit percentage CPU reductions for many teams — a real cost saving that requires no code change.

**Security implications:** Only supported versions receive security fixes. An unsupported interpreter is an unpatched dependency at the base of the stack, and no amount of application-level hardening compensates.

**Modern recommendations:** Evaluate the free-threaded build (supported from 3.14) and the JIT with your own benchmarks and your own dependency set. Both are genuine advances and neither is automatically a win for a given workload.

---

[[#📖 Master Table of Contents|⬆ Back to top]]

*End of Group 12 — curriculum complete.*

---

## 🎓 Curriculum Complete

You have now worked through all twelve groups at every level of depth:

| File | Goal | Outcome |
|---|---|---|
| `0_foundation.md` | Build the mental map | *"I know what every concept is."* |
| `1_understand.md` | Develop understanding | *"I understand how this works."* |
| `2_interview.md` | Prepare for interviews | *"I can answer confidently."* |
| `3_production.md` | Apply professionally | *"I know how professionals use this."* |

**Suggested next steps:**

- **Reinforce by breaking things.** Pick the group that felt shakiest and write code that triggers its failure modes — a mutable default accumulating state, a blocked event loop, a memory leak from an unbounded cache, a `UnicodeDecodeError` from a mis-declared encoding. Watching something fail is what makes the correct approach stick.
- **Read real source.** `dataclasses.py`, `functools.py`, `contextlib.py` and `asyncio/tasks.py` in the standard library are readable, heavily commented, and each connects several groups at once.
- **Revisit the interview file before interviews specifically.** The follow-up questions and edge cases are where a good answer becomes a convincing one.
- **Treat the production file as a review checklist.** Its warnings map to the failures that actually cause incidents — missing timeouts, unbounded caches, blocking calls in async code, `pickle` on untrusted input, and mutable state shared across requests.
