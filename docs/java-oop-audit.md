# Java OOP audit — Group 2

Audit of https://learn-levels.ms-ivas010.workers.dev/java/object-oriented-programming/ and the source it is
built from (`content/java/0_foundation.md` … `3_production.md`, Group 2).

**What was read:** the live group page and a rendered concept page, to confirm the site matches the
source, then all 11 concepts × 4 levels (44 pages) line by line. Every Java claim below that names a
compiler or runtime behaviour was checked by compiling and running a test case on JDK 21
(`javac -Xlint:all`). Java 25 behaviour (flexible constructor bodies) was checked against JEP 513, and
`Object`'s contracts against the Java SE 25 API documentation.

**Classes:** A Incorrect · B Misleading · C Oversimplified · D Missing · E Redundant · F Poor sequencing ·
G Terminology · H JVM implementation leakage.
**Severity:** CRITICAL · HIGH · MEDIUM · LOW.

---

## 1. Inventory of the existing section

| # | Topic | Foundation | Understand | Interview | Production |
|---|---|---|---|---|---|
| 2.1 | Classes and Objects | 2 paragraphs + code | full | full | full |
| 2.2 | Constructors | 2 sentences, no code | full | full | full |
| 2.3 | The this and super Keywords | 2 sentences, no code | full | full | full |
| 2.4 | Encapsulation | 2 sentences, no code | full | full | full |
| 2.5 | Inheritance | 2 sentences, no code | full | full | full |
| 2.6 | Polymorphism | 2 sentences, no code | full | full | full |
| 2.7 | Abstraction & Abstract Classes | 3 sentences, no code | abstract classes only | mostly abstract classes | abstract classes only |
| 2.8 | Interfaces | 2 sentences, no code | full | full | full |
| 2.9 | Access Modifiers | 2 sentences, no code | full | full | full |
| 2.10 | Static vs Instance Members | 2 sentences, no code | full | full | full |
| 2.11 | The Object Class (equals, hashCode, toString) | 2 sentences + tip | full | full | full |

## 2. Systemic problems

| # | Problem | Class | Severity | Action |
|---|---|---|---|---|
| S1 | 12 Interview questions have no answer (2.1 ×2, 2.2, 2.3 ×2, 2.4, 2.5, 2.6 ×2, 2.7, 2.9, 2.11) — question-only notes | D | HIGH | ADD an answer to every one |
| S2 | Interview "explanations" are coaching ("Be ready to…", "Know cold…"), not model answers | D | MEDIUM | ADD a 30-second answer and a deeper answer; keep the coaching as "What they test" |
| S3 | No output-prediction questions, no interviewer follow-up chains | D | MEDIUM | ADD a prediction exercise and a 4-step chain per concept |
| S4 | 10 of 11 Foundation pages have no example | D | MEDIUM | ADD one minimal example each |
| S5 | Balances and amounts modelled as `double` in four examples (2.1 and 2.4 Understand, 2.4 and 2.8 Interview), and `BankAccount.withdraw` accepts negative amounts | B | MEDIUM | FIX — `BigDecimal` or `long` cents, validate amounts. Salaries in the `this`/`super` and abstract-class demos are incidental and kept |
| S6 | No problem-first framing (the house style used in the Spring Boot notes) | D | LOW | ADD a problem statement to new and modified pages |

## 3. Findings by statement

Only statements needing a change are listed; §4 lists what was checked and kept.

| # | Topic · level | Existing statement | Class | Problem | Severity | Action → correct version |
|---|---|---|---|---|---|---|
| 1 | Polymorphism · Production | "a subclass should never weaken preconditions or strengthen postconditions" | A | Liskov is stated backwards: weakening preconditions and strengthening postconditions is *allowed*; the reverse is the violation | CRITICAL | FIX → "must not strengthen preconditions (demand more of callers) or weaken postconditions (promise less)" |
| 2 | Object class · Production | equals-without-hashCode causes missing entries "only once real, larger datasets with hash collisions are involved" | A | Wrong mechanism. Equal objects get different identity hashes, so lookups with a new equal instance fail at any size; tests pass only because they reuse the inserted instance | HIGH | FIX → explain the same-instance vs equal-instance cause (verified: `contains(sameInstance)=true`, `contains(equalInstance)=false`) |
| 3 | Constructors · Understand | "the compiler silently inserts a **public** no-argument default constructor" | A | The default constructor has the class's access (JLS 8.8.9): package-private for a package-private class (verified with `javap`) | HIGH | FIX → "with the same access as the class" |
| 4 | Access Modifiers · Understand | "enforced entirely at compile time … no runtime access-control check" | A | The JVM re-checks access when it links a class (`IllegalAccessError`); reflection checks at runtime; modules can refuse `setAccessible` | HIGH | FIX → compiler + link-time + reflection checks |
| 5 | Classes and Objects · Interview | "`==` compares references, not content, **unless equals() is overridden**" | B | Implies overriding `equals` changes `==`. It never does | HIGH | FIX → "`==` always compares references; overriding `equals()` changes only `equals()`" |
| 6 | Object class · Foundation | "`==` compares object references **by default**" | B | Same false implication — `==` has no non-default behaviour | HIGH | FIX → "`==` always compares references for objects" |
| 7 | Constructors · Foundation, Interview, Understand | "an object can never exist in a broken, half-set-up state — every object is guaranteed to pass through its constructor"; "Guarantees valid object initialization"; "nothing leaves the factory without going through it" | A | `clone()` and deserialization create objects without running that class's constructors, and a constructor can leak `this` | HIGH | REPHRASE → "Constructors run as part of normal object creation and are where a class establishes its initial invariants" |
| 8 | Polymorphism · Foundation | "Polymorphism means the same method call can produce different behavior … at runtime" | B | Defines polymorphism as runtime overriding only | HIGH | REPHRASE → compile-time (overloading) + runtime (overriding / dynamic dispatch) |
| 9 | Inheritance · Foundation, Interview | "lets one class reuse … It exists to avoid duplicating shared logic"; "To enable code reuse and establish type hierarchies" | B | Teaches reuse as the purpose; reuse alone does not justify inheritance | HIGH | REPHRASE → "models an IS-A relationship and enables subtype polymorphism; reuse is a secondary benefit" |
| 10 | Interfaces · Foundation | "a contract that lists what methods a class must implement, without dictating how" | B | Interfaces can contain default, static and private methods since Java 8/9 | HIGH | REPHRASE → contract that may also carry behaviour but never instance state |
| 11 | Object class · Understand, Interview | "`hashCode()` derives a number from the object's memory identity"; "identity-derived (JVM-specific)" | H | Not an address; the API documentation only says Object's hashCode is consistent with identity equality and distinct "as far as is reasonably practical" | HIGH | FIX → "identity hash code: fixed for the object's lifetime; how it is produced is unspecified" |
| 12 | Encapsulation · Understand | "access is mediated through public getter/setter methods (or … records)" | B | Presents getters/setters as the mechanism; records are deliberately transparent and hide no representation | MEDIUM | REPHRASE → private state + methods that express behaviour and enforce invariants |
| 13 | this/super · Foundation, Interview | "`super` refers to the parent class"; "super references the immediate parent class" | G | `super` is not a reference to another object or to a class: it selects the superclass's member for *this* object, and cannot be used as a value | MEDIUM | REPHRASE |
| 14 | this/super · Understand, Interview | "`super` always refers to exactly one level up … never further"; "calling super from C only reaches B, not A" | B | `super.m()` starts lookup at the direct superclass; if B does not declare `m`, A's implementation runs. What is impossible is skipping B's override (`super.super`) | MEDIUM | REPHRASE |
| 15 | Constructors · Interview | Comparisons: regular methods inherited "Yes (unless private/static)" | A | Static methods *are* inherited (`Child.parentStatic()` compiles — verified) | MEDIUM | FIX |
| 16 | Constructors · Interview | "Constructors are not inherited — a subclass must define its own" | B | A subclass that declares none gets the default constructor | MEDIUM | REPHRASE |
| 17 | Constructors / this-super · Understand, Interview | "Every constructor's first line implicitly calls super()"; "`this()`/`super()` must be the first statement" | C | True up to Java 24. Java 25 (JEP 513) allows statements before the call that do not use `this`; `Object` has no `super()` | MEDIUM | REPHRASE with version |
| 18 | Interfaces · Understand, Interview | "If two interfaces provide conflicting defaults, the implementing class MUST override" | C | Only when neither interface is more specific and no superclass declares the method (class wins, subinterface wins — verified) | MEDIUM | REPHRASE → the three resolution rules + `X.super.m()` |
| 19 | Interfaces · Interview | "interface fields are … public static final, i.e., compile-time constants" | A | Final, not necessarily constant: `int R = new Random().nextInt();` and a mutable `static final List` compile (verified) | MEDIUM | FIX |
| 20 | Object class · Understand | "reflexive/symmetric/transitive/consistent (the four formal properties)" | A | The contract has five: plus `x.equals(null) == false` | MEDIUM | FIX |
| 21 | Static · Interview | static init happens "when the class is first loaded … first static field access"; static blocks run "when the class is loaded" | G/C | Loading ≠ initialization; reading a constant variable does not initialize the class (verified: `Consts.MAX` printed without the static block running) | MEDIUM | REPHRASE |
| 22 | Polymorphism · Interview | Overloading relationship: "Same class (or unrelated classes)" | A | Methods in unrelated classes are not overloads of each other; overloads are members of one class, inherited ones included | MEDIUM | FIX |
| 23 | Polymorphism · Understand, Interview | "a vtable-style lookup"; "Virtual dispatch is effectively O(1)" | H | Java specifies dynamic dispatch (JLS 15.12.4.4), not vtables; cost model is HotSpot's | MEDIUM | REPHRASE → language rule first, HotSpot technique labelled as such |
| 24 | Polymorphism · Understand | "Runtime polymorphism (also called dynamic dispatch)"; method "decided at runtime based on the object's actual type" | G/C | Dispatch is the mechanism, not a synonym; the *signature* is fixed at compile time from the reference type, only the implementation is chosen at runtime | MEDIUM | REPHRASE |
| 25 | Encapsulation · Interview, Production | "Reflection can bypass `private` access entirely" | C | Since Java 16/17, `setAccessible` fails on packages a named module does not open (all JDK internals) | MEDIUM | REPHRASE |
| 26 | Access Modifiers · Understand | Intuition: "`protected` (my family/descendants)" | B | `protected` also grants the whole package — it is wider than package-private | MEDIUM | REPHRASE |
| 27 | Interfaces · Production | DI and mocking need interfaces: "a class that only accepts concrete types is significantly harder to test" | B | Spring injects concrete classes; Mockito mocks concrete (and, since Mockito 5, final) classes | MEDIUM | REPHRASE → interfaces earn their place at boundaries with several implementations |
| 28 | Interfaces · Production | "Avoid marker interfaces … annotations are now preferred" | B | Effective Java Item 41: a marker interface defines a type the compiler checks; annotations suit members and framework metadata | MEDIUM | REPHRASE |
| 29 | Polymorphism · Production | `instanceof` chains are an anti-pattern (unqualified) | C | Since Java 21, an exhaustive `switch` over a sealed hierarchy is a supported design | MEDIUM | REPHRASE |
| 30 | Object class · Interview | `getClass()` vs `instanceof`: only the `instanceof` downside is given | C | One-sided: `getClass()` breaks substitutability (a subclass never equals its parent; proxies) | MEDIUM | REPHRASE → both trade-offs |
| 31 | Object class · Understand | `Point` example: non-final class, mutable fields, `instanceof` | C | Mutable fields in `hashCode` + an extendable class is exactly the setup that breaks symmetry and hash lookup | MEDIUM | FIX → final class, final fields |
| 32 | Classes and Objects · Understand, Interview | `new` = allocate → defaults → constructor → reference | C | Omits class initialization and the superclass-first constructor chain with field initializers | MEDIUM | REPHRASE |
| 33 | Inheritance · Understand | "`Dog` automatically has all non-private fields/methods of `Animal`" | C | Package-private members are inherited only within the package; constructors never | MEDIUM | REPHRASE |
| 34 | Inheritance · Interview | Multiple class inheritance banned "to avoid the diamond problem" | C | The real cost is inheriting *state* and constructors from two parents; Java allows multiple inheritance of type and, since 8, behaviour | MEDIUM | REPHRASE |
| 35 | Encapsulation · Understand | `withdraw(double)` example | B | Money as `double`; a negative amount increases the balance | MEDIUM | FIX |
| 36 | Classes and Objects · Interview | "When no references point to it" → GC; "eligible … immediately" | G | The criterion is *unreachable* (cycles count); eligible ≠ collected now | LOW | REPHRASE |
| 37 | Classes and Objects · Interview | "Objects always live on the heap" | H | Fine as the JVM-specification model; escape analysis may avoid the allocation | LOW | REPHRASE (also fixed in JVM 8.3 Interview) |
| 38 | Classes and Objects · Production | Header "typically 12-16 bytes with compressed oops" | H | HotSpot-specific; JDK 25's opt-in compact headers are 8 bytes (JEP 519) | LOW | REPHRASE |
| 39 | Static · Understand, Interview | Statics "associated with the `Class` object (loaded once)"; "loaded once per class" | H/G | Once per class *per class loader*; where they are stored is a JVM detail | LOW | REPHRASE |
| 40 | Static · Interview | Redeclared static field "shadows" the parent's | G | JLS term is *hides* | LOW | FIX |
| 41 | Constructors · Understand | Wrong casing "silently becomes a regular method" | A | Without a return type it is a compile error ("return type required" — verified) | LOW | FIX |
| 42 | Object class · Understand | `toString()` = "class name plus a hash in hex" | C | Fully-qualified name + hex of `hashCode()` (so an overridden `hashCode` shows up) | LOW | REPHRASE |
| 43 | Object class · Interview | Records "auto-generate correct equals()" | C | Array components compare by identity (verified: two equal-content records are not equal) | LOW | REPHRASE |
| 44 | Encapsulation · Production | "always return `Collections.unmodifiableList(items)`" | C | That is a read-only *view*: callers see later internal changes (verified); `List.copyOf` is a snapshot | LOW | REPHRASE |
| 45 | Polymorphism · Interview | Only "public/protected/package-private instance methods" dispatch dynamically | C | Package-private ones are overridable only within the package; `final` ones not at all | LOW | REPHRASE |
| 46 | Constructors · Production | Constructor injection means "no reflection-based mocking framework needed" | B | It removes reflection-based *injection*; mocks may still come from a framework | LOW | REPHRASE |
| 47 | Interview 1.4 (Fundamentals) · Understand | "`==` compares references (memory addresses)" | H | A reference is not an address your program can see | LOW | REPHRASE (same misstatement outside Group 2) |

## 4. Checked and kept

KEEP — technically correct (every other statement in the 44 pages falls here). Highlights:

- 2.2: the default constructor disappears once any constructor is declared; a parent without a no-arg constructor forces `super(args)`; constructors cannot be `abstract`, `static` or `final`; a return type turns a constructor into a method.
- 2.3: shadowed-field bug; `this` is unavailable in static code; the partially-constructed-`this` warning.
- 2.4: getters/setters for every field are not encapsulation; defensive copies; "private field + returned live `List`" bug.
- 2.5: single class inheritance; `Stack extends Vector`; fragile base class; final classes.
- 2.6: fields are never polymorphic; static methods are hidden; calling overridable methods from constructors.
- 2.7: abstract classes have constructors; a subclass that leaves an abstract method unimplemented must be abstract.
- 2.8: interface fields are `public static final`; functional-interface rules; `@FunctionalInterface` is a check, not a requirement.
- 2.9: the access table; top-level classes are `public` or package-private; the `protected` cross-package restriction (verified).
- 2.10: static methods cannot touch instance members; mutable static state is a concurrency hazard.
- 2.11: equal objects must have equal hash codes, not the reverse; mutable keys get lost in a `HashSet` (verified).

## 5. Missing concepts

| ADD | Location | Why |
|---|---|---|
| References vs objects, `null`, aliasing, identity | 2.1 | `Person p;` vs `new Person()` was never taught |
| Composition, aggregation, association (HAS-A) | new 2.8 | Only a one-line "prefer composition" existed |
| Method overloading (resolution phases, widening/boxing/varargs, ambiguity) | new 2.9 | Only a bullet in 1.8 |
| Method overriding rules (signature, covariant returns, access, exceptions, `final`, `private`, `@Override`) | new 2.10 | Rules were scattered or absent |
| Overriding vs hiding (static methods, fields) | new 2.11 | Only edge-case bullets |
| Upcasting, downcasting, `ClassCastException`, `null` receivers | new 2.13 | Absent |
| Abstraction as a principle (vs encapsulation vs information hiding) | new 2.14 | Merged into abstract classes |
| Abstract class vs interface as a decision | new 2.17 | One table inside 2.7 |
| The `final` keyword (variable, reference, method, class; vs immutability) | new 2.18 | Absent |
| `Object`'s full method set (`getClass`, `clone`, `finalize`, `toString`) | 2.19 | Only three methods |
| Immutability | new 2.21 | Scattered across encapsulation and records |
| Object initialization order (class vs object initialization, instance initializer blocks) | new 2.22 | Absent |
| Instance initializer blocks, static nested classes | 2.4 | One edge-case line |
| `private` is per class, not per object | 2.7 | A common interview trap |
| `this`-escape (`javac -Xlint:this-escape`, JDK 21) | 2.2, 2.3 | Mentioned without the tool |

## 6. Concepts moved

| MOVE | From → to | Why |
|---|---|---|
| Static vs Instance Members | 2.10 → 2.4 | Builds directly on "no `this` in static code" (2.3) and is needed before static hiding (2.11) |
| Access Modifiers | 2.9 → 2.7 | Encapsulation (2.5) relies on it, and overriding's "cannot reduce visibility" rule (2.10) needs the order of access levels; `protected` needs inheritance (2.6), so it goes right after it |
| Polymorphism | 2.6 → 2.12 | The umbrella comes after its two mechanisms (overloading 2.9, overriding 2.10) so dynamic dispatch can be explained, not asserted |
| Abstract class vs interface comparison table | 2.7 Interview → 2.17 | It needs both concepts first (E: it was also referenced from 2.8) |

Kept despite a forward reference: **2.3 this and super** stays before inheritance (the order requested). Its pages introduce `extends` in one line and point to 2.6.

## 7. Concepts merged

None merged. Overloading-vs-overriding and static hiding were each explained in two or three places (E); the full explanations now live in 2.9–2.11, and the old places keep a one-line statement plus a pointer.

## 8. Concepts split

| SPLIT | Into | Why |
|---|---|---|
| 2.7 Abstraction & Abstract Classes | 2.14 Abstraction · 2.15 Abstract Classes | Abstraction is a principle; abstract classes are one mechanism for it |
| 2.11 The Object Class (equals, hashCode, toString) | 2.19 The Object Class · 2.20 equals and hashCode | The contract is the most-tested topic in the group and was crowding out `getClass`, `clone`, `finalize` |

## 9. Final structure

| New | Title | Status | Old |
|---|---|---|---|
| 2.1 | Classes and Objects | Modified | 2.1 |
| 2.2 | Constructors | Modified | 2.2 |
| 2.3 | The this and super Keywords | Modified | 2.3 |
| 2.4 | Static vs Instance Members | Modified, moved | 2.10 |
| 2.5 | Encapsulation | Modified, moved | 2.4 |
| 2.6 | Inheritance | Modified, moved | 2.5 |
| 2.7 | Access Modifiers | Modified, moved | 2.9 |
| 2.8 | Composition, Aggregation and Association | New | — |
| 2.9 | Method Overloading | New | — |
| 2.10 | Method Overriding | New | — |
| 2.11 | Overriding vs Hiding | New | — |
| 2.12 | Polymorphism | Modified, moved | 2.6 |
| 2.13 | Upcasting and Downcasting | New | — |
| 2.14 | Abstraction | Split from 2.7 | 2.7 |
| 2.15 | Abstract Classes | Split from 2.7 | 2.7 |
| 2.16 | Interfaces | Modified, moved | 2.8 |
| 2.17 | Abstract Class vs Interface | New | — |
| 2.18 | The final Keyword | New | — |
| 2.19 | The Object Class | Split from 2.11 | 2.11 |
| 2.20 | equals and hashCode | Split from 2.11 | 2.11 |
| 2.21 | Immutability | New | — |
| 2.22 | Object Initialization Order | New | — |

The order runs objects → class members → encapsulation → inheritance and its access rules → composition →
the two polymorphism mechanisms → polymorphism → casting → abstraction mechanisms → `final` → `Object` →
equality → immutability → initialization order, which needs nearly everything before it.

**URL changes:** two concept slugs change because their titles change —
`abstraction-abstract-classes` → `abstract-classes` and `the-object-class-equals-hashcode-tostring` →
`the-object-class`. `public/_redirects` sends the old URLs to the new pages. Completion ticks that
learners stored for those two old concepts do not carry over.

## 10. Change log by page

Every page lives at `java/object-oriented-programming/<slug>/<level>`, with levels `foundation`, `understand`,
`interview` and `production`. The corrected content is in `content/java/0_foundation.md` … `3_production.md`
(Group 2). Modified pages were edited in place. Every original statement either remains or is listed in §3 as a
deliberate correction; this was checked by diffing the old and new sentence sets.

| # | Slug | Foundation | Understand | Interview | Production | Reason |
|---|---|---|---|---|---|---|
| 2.1 | `classes-and-objects` | Modified | Modified | Modified | Modified | References vs objects, `null`, identity; `new` sequence (#32); GC and heap wording (#36, #37); `==` (#5); header sizes (#38) |
| 2.2 | `constructors` | Modified | Modified | Modified | Modified | Constructor guarantee (#7); default constructor access (#3); Java 25 prologue (#17); inheritance of constructors and static methods (#15, #16) |
| 2.3 | `the-this-and-super-keywords` | Modified | Modified | Modified | Modified | What `super` is (#13); grandparent lookup (#14); `this` as a value; `X.super.m()`; this-escape |
| 2.4 | `static-vs-instance-members` | Modified | Modified | Modified | Modified | Moved from 2.10; initialization vs loading (#21); per class loader (#39); hides, not shadows (#40); initializer blocks, nested classes |
| 2.5 | `encapsulation` | Modified | Modified | Modified | Modified | Getter/setter framing and records (#12); vs information hiding vs abstraction; reflection (#25); `BigDecimal` example (#35); views vs copies (#44) |
| 2.6 | `inheritance` | Modified | Modified | Modified | Modified | IS-A first, reuse second (#9); what is inherited (#33); why one superclass (#34); fragile base class example; `sealed` |
| 2.7 | `access-modifiers` | Modified | Modified | Modified | Modified | Moved from 2.9; runtime checks (#4); `protected` with code; per-class `private`; intuition (#26) |
| 2.8 | `composition-aggregation-and-association` | New | New | New | New | Missing concept |
| 2.9 | `method-overloading` | New | New | New | New | Missing concept |
| 2.10 | `method-overriding` | New | New | New | New | Missing concept |
| 2.11 | `overriding-vs-hiding` | New | New | New | New | Missing concept |
| 2.12 | `polymorphism` | Modified | Modified | Modified | Modified | Moved from 2.6; definition (#8); dispatch terminology and JLS vs JVM (#23, #24); overloading relationship (#22); Liskov (#1); `instanceof` chains (#29) |
| 2.13 | `upcasting-and-downcasting` | New | New | New | New | Missing concept |
| 2.14 | `abstraction` | Split | New | New | New | Split from 2.7; principle vs mechanism |
| 2.15 | `abstract-classes` | Split | Modified | Modified | Modified | Split from 2.7; modifier rules, template method; comparison moved to 2.17 |
| 2.16 | `interfaces` | Modified | Modified | Modified | Modified | Moved from 2.8; definition (#10); conflict rules (#18); constants (#19); DI, mocking, markers (#27, #28) |
| 2.17 | `abstract-class-vs-interface` | New | New | New | New | Missing concept; absorbs the 2.7 comparison table |
| 2.18 | `the-final-keyword` | New | New | New | New | Missing concept |
| 2.19 | `the-object-class` | Split | Split | New | Split | Split from 2.11; identity hash (#11); `toString` (#42); `getClass`, `clone`, `finalize` |
| 2.20 | `equals-and-hashcode` | Split | Split | Split | Split | Split from 2.11; five properties (#20); `getClass` vs `instanceof` (#30); `Point` (#31); `==` tip (#6); production cause (#2); records (#43) |
| 2.21 | `immutability` | New | New | New | New | Missing concept |
| 2.22 | `object-initialization-order` | New | New | New | New | Missing concept |

Outside Group 2, two copies of the same misstatements were fixed: Understand 1.4 (`==` as "memory addresses",
#47) and Interview 8.3 ("objects always on the heap", #37).

## 11. Second-pass validation

**How the result was checked**

- **Code:** all 117 Java code blocks in the group were extracted and compiled with JDK 21.
  - 93 compile on their own.
  - 7 declare packages; they were compiled as real packages and compile, except one deliberate exercise that fails on exactly the two lines its answer names.
  - 12 are fragments that use classes defined elsewhere on the page or in an earlier concept (`Animal`, `Dog`, `Engine`, `Order`). They compile once minimal versions of those classes are supplied.
  - 2 are "which lines compile?" exercises that are meant to fail; their expected errors were confirmed one by one.
  - 3 are illustrative fragments: bare `equals`/`print` methods and a builder call.
- **Predictions:** all 22 output-prediction exercises, and every "Predict it" in Understand, were run on JDK 21. The printed output matches the stated answers.
- **Interview pages:** 253 questions, all answered; 22 prediction exercises; 22 four-step follow-up chains.
- **Pipeline:**
  - `npm run build` passes ("CONTENT INTEGRITY PASSED — java, python, spring-boot", 2,410 pages).
  - All 88 OOP pages return 200 with no leftover Markdown.
  - Mermaid diagrams render, and pages don't scroll sideways at 375 px.
- **Not compiled:** Java 25's flexible constructor bodies (JEP 513). The installed JDK is 21, so that wording was checked against the JEP text.

**Java correctness**

| Check | Result |
|---|---|
| Every statement describes Java accurately | Yes, after the 47 corrections in §3 |
| Outdated Java 7/8 assumptions | None left. Interface rules include Java 8 defaults/statics and Java 9 private methods; constructors note Java 25; finalization notes JEP 421; reflection notes JDK 16/17 encapsulation and JDK 26 (JEP 500) |
| Modern interface rules | Implicit modifiers, conflict rules, `X.super.m()`, static methods not inherited, no `Object`-method defaults — all compile-verified |
| Access modifiers | Matrix plus cross-package `protected` (compile-verified), per-class `private`, link-time and reflection checks |
| Overriding rules | Signature, covariant return, access, checked exceptions, `final`/`private`/`static` — compile-verified |
| Constructors | Default constructor access (verified with `javap`), chaining, first-statement rule with Java 25, not inherited |
| `equals`/`hashCode` | Five properties, three-part `hashCode` contract, no address claims, both type-check strategies |
| Static and field hiding vs overriding | Separate concept 2.11, with null-receiver and cast behaviour verified |
| `final` | Variable / method / class / reference vs immutability; constant inlining; final-field semantics |
| Initialization order | Class vs object initialization; full parent/child trace verified; constant variables; failure behaviour verified |

**Pedagogy**

- **Foundation** stays short: a problem sentence, a definition, why it exists, and one minimal example.
- **Understand** adds mechanics: a problem-first opening, rule tables, edge cases, misconceptions and a "Predict it".
- **Interview** drills the way an interviewer does:
  - a 30-second answer and a deeper one;
  - a prediction exercise;
  - "why" and scenario questions;
  - a 4-step follow-up chain;
  - the trap named in each answer.
- **Production** stays on design decisions: boundaries, coupling, ownership, failure modes and framework interactions.

**Scope**

- Still an OOP section. SOLID, patterns, DI and Spring appear only where an OOP decision depends on them.
- No JVM-internals material was added. The only additions are short, labelled notes where the language rule and HotSpot's technique needed separating.

**Success-criteria questions and where they are answered**

| Question | Answered in |
|---|---|
| Explain all four pillars of OOP in Java | 2.5, 2.6, 2.12, 2.14 |
| Overloading vs overriding | 2.9 (comparison), 2.10, 2.12 |
| Why can't Java override static methods? | 2.11 Interview |
| What happens when a field is hidden? | 2.11 |
| What is dynamic dispatch? | 2.12 |
| Reference type vs runtime type | 2.12, 2.13 |
| Why is composition often preferred over inheritance? | 2.8, 2.6 |
| What exactly does `protected` mean across packages? | 2.7 |
| Why must `equals` and `hashCode` agree? | 2.20 |
| `getClass()` vs `instanceof` in `equals` | 2.20 |
| Can an interface contain implementation? | 2.16, 2.17 |
| Final reference vs immutable object | 2.18, 2.21 |
| What is constructor chaining? | 2.2, 2.3 |
| Initialization order in an inheritance hierarchy | 2.22 |
| Upcasting and downcasting | 2.13 |
| Encapsulation vs abstraction vs information hiding | 2.5, 2.14 |
