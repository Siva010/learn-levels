Build a **production-quality Java learning platform website** based entirely on the four attached Markdown knowledge files:

- `0_foundation.md`
- `1_understand.md`
- `2_interview.md`
- `3_production.md`

The core idea is a progressive learning system called **Learn Levels**.

The user should learn the **same Java topic through four increasingly practical levels**:

1. **Foundation** — What is it?
2. **Understand** — How does it work?
3. **Interview** — How do I explain and defend it?
4. **Production** — How do professionals use it?

Do NOT build this as a simple Markdown/document viewer. Turn the content into an interactive learning product.

---

# 1. Core Product Concept

The primary navigation should be:

**Java → Topic → Learning Level**

For example:

```text
Java
 └── Object-Oriented Programming
      ├── Foundation
      ├── Understand
      ├── Interview
      └── Production
```

The four levels should feel like a progression rather than four unrelated documents.

A user should be able to start at Foundation and progressively unlock/complete:

```text
FOUNDATION
"What is this?"

        ↓

UNDERSTAND
"How does this actually work?"

        ↓

INTERVIEW
"Can I explain it under pressure?"

        ↓

PRODUCTION
"Can I use it correctly in real software?"
```

---

# 2. Content Architecture

Parse the Markdown files and identify their shared topic hierarchy.

The current structure contains major groups such as:

- Java Fundamentals & Syntax
- Object-Oriented Programming
- Collections Framework
- Generics
- Exception Handling
- Streams, Lambdas & Functional Programming
- Concurrency & Multithreading
- JVM Internals & Memory Management
- I/O & NIO
- Modern Java Features
- Reflection & Annotations
- Java Platform Module System (JPMS)

The four files intentionally cover the same conceptual groups from different perspectives.

Preserve the terminology and structure from the source files.

Do not invent large amounts of additional educational content.

---

# 3. Homepage

Create a polished landing/dashboard page.

Hero:

**Learn Java in Levels.**

Subtitle:

**From knowing what a concept is → understanding how it works → surviving the interview → using it in production.**

Show the four levels as a visually connected progression.

### Level cards

#### Level 1 — Foundation
**Know what it is.**

Build the mental map.

Focus:
- Definitions
- Purpose
- Terminology
- Basic examples
- Concept relationships

#### Level 2 — Understand
**Know how it works.**

Go beneath the surface.

Focus:
- Internal mechanisms
- Memory behavior
- Relationships
- Execution flow
- Common misconceptions
- Deeper examples

#### Level 3 — Interview
**Know how to explain it.**

Prepare for technical interviews.

Focus:
- Interview questions
- Follow-up questions
- Edge cases
- Common mistakes
- Comparisons
- Important facts
- Interview explanations

#### Level 4 — Production
**Know how professionals use it.**

Apply knowledge to real engineering.

Focus:
- Best practices
- Production bugs
- Performance
- Scalability
- Security
- Debugging
- Anti-patterns
- Real-world usage

---

# 4. Learning Dashboard

After entering Java, show a dashboard like:

```text
Java

Your Progress
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Foundation     ███████████░░  78%
Understand     ████████░░░░░  61%
Interview      █████░░░░░░░░  42%
Production     ███░░░░░░░░░░  25%

Overall mastery: 51%
```

Below that, show the curriculum.

Example:

```text
01  Java Fundamentals & Syntax
    ├── Foundation      ✓
    ├── Understand      ✓
    ├── Interview       70%
    └── Production      35%

02  Object-Oriented Programming
    ├── Foundation      100%
    ├── Understand      82%
    ├── Interview       45%
    └── Production      20%

03  Collections Framework
    ...
```

Each topic should have its own progress.

---

# 5. Topic Page

When a user selects:

**Object-Oriented Programming**

show a topic overview.

```text
Object-Oriented Programming

11 concepts
4 learning levels

Foundation     ✓
Understand     82%
Interview      45%
Production     20%
```

Then display the concepts:

```text
Classes and Objects
Constructors
this and super
Encapsulation
Inheritance
Polymorphism
Abstraction
Interfaces
Access Modifiers
Static vs Instance
Object Class
```

These should come directly from the source Markdown structure.

---

# 6. Concept Page

This is the most important page.

For example:

**Polymorphism**

At the top:

```text
Object-Oriented Programming
        /
Polymorphism

Level 2 of 4
UNDERSTAND
```

Then show a clean progress indicator:

```text
Foundation → Understand → Interview → Production
             ●
```

The user can switch levels with tabs.

---

# 7. Foundation UI

Foundation should feel simple and approachable.

Display:

### Definition

### Why it exists

### Key idea

### Simple example

### Related concepts

Keep this level visually clean.

Do not overwhelm the user with implementation details.

The Foundation source explicitly aims to build a mental map rather than deep internals. Preserve that distinction.

---

# 8. Understand UI

The Understand level should visually become more technical.

Sections can include:

- How it works
- Internal mechanism
- Execution flow
- Memory model
- Relationships
- Advantages
- Disadvantages
- Common misconceptions
- Common mistakes
- Best intuition
- Terminology

Where the source contains Mermaid diagrams or flow diagrams, render them as proper visual diagrams rather than displaying raw Mermaid syntax.

For example:

```text
.java
   ↓
javac
   ↓
.class bytecode
   ↓
Class Loader
   ↓
JVM
   ↓
Interpreter / JIT
   ↓
Native Instructions
```

The Understand source contains this type of execution-flow material. Preserve it.

---

# 9. Interview UI

Make this level feel like an interview preparation environment.

For every concept, surface:

### Interview Explanation

A concise explanation that a candidate could actually say to an interviewer.

### Common Interview Questions

Display questions as expandable cards.

Example:

```text
▸ What's the difference between JVM, JRE and JDK?

▸ Is Java compiled or interpreted?

▸ What makes Java platform-independent?

▸ What is JIT compilation?
```

Clicking a question reveals the answer.

### Follow-up Questions

Put these in a separate section.

### Edge Cases

### Common Mistakes

### Comparisons

Render comparison tables properly.

### Important Facts to Remember

### Frequently Confused With

---

# 10. Production UI

Make this level feel like an engineering handbook.

Sections:

### Best Practices

### Performance Considerations

### Scalability Concerns

### Security Implications

### Common Production Bugs

### Anti-patterns

### Debugging Tips

### Testing Advice

### Maintainability

### Real-world Use Cases

### Framework Relevance

Use visual warning/callout components:

- Best Practice
- Warning
- Production Bug
- Security
- Performance
- Debugging Tip
- Anti-pattern

The Production source contains concrete examples such as JVM runtime selection, container memory considerations, `BigDecimal` for monetary calculations, defensive copies, dependency/classpath issues, etc. These should remain attached to their respective concepts rather than becoming generic advice.

---

# 11. Cross-Level Navigation

This is a key feature.

At the bottom of every level, show:

```text
← Previous Level

Foundation
Understand
Interview
Production

Next Level →
```

For example:

At Foundation:

**You've learned what polymorphism is.**

Next:

> Understand how runtime polymorphism actually works.

At Understand:

> You understand the mechanism. Now test whether you can explain it under interview pressure.

At Interview:

> You can explain it. Now learn how it can fail in production.

At Production:

> You've completed the full learning cycle.

---

# 12. Progress Tracking

Persist user progress locally.

Track:

```text
concept completion
level completion
topic completion
last visited concept
last visited level
overall progress
```

Use localStorage initially.

Structure progress so it can later be replaced by a backend without rewriting the application.

Example:

```ts
progress = {
  java: {
    foundation: {
      "what-is-java": true,
      "jvm-jre-jdk": true
    },
    understand: {
      "what-is-java": true
    },
    interview: {},
    production: {}
  }
}
```

Add:

- Mark as complete
- Reset progress
- Continue learning
- Resume last position

---

# 13. "Continue Learning"

The dashboard should prominently show:

```text
Continue Learning

Object-Oriented Programming
→ Polymorphism
→ Interview

[ Continue ]
```

If the user has never started:

```text
Start Learning
```

---

# 14. Search

Implement global search.

Search should find:

- Topics
- Concepts
- Definitions
- Interview questions
- Production problems
- Important terminology

Example:

Searching:

`hashmap`

should surface:

```text
Collections → Map Implementations
Foundation
Understand
Interview
Production
```

Searching:

`autoboxing`

should show all relevant occurrences across levels.

Highlight the matched text.

---

# 15. Command Palette

Add a keyboard-accessible command palette:

```text
⌘ K

Search concepts...
Go to Foundation
Go to Understand
Go to Interview
Go to Production
Continue learning
Open Collections
Open OOP
```

Support:

- `Ctrl/Cmd + K`
- keyboard navigation
- Enter to open
- Escape to close

---

# 16. Sidebar

Desktop layout:

```text
┌───────────────────────────────────────────────┐
│ Learn Levels                                  │
├───────────────┬───────────────────────────────┤
│ JAVA          │                               │
│               │      Content                  │
│ Overview      │                               │
│               │                               │
│ FOUNDATION    │                               │
│ ✓ Fundamentals│                               │
│ ✓ OOP         │                               │
│ Collections   │                               │
│               │                               │
│ UNDERSTAND    │                               │
│ Fundamentals  │                               │
│ OOP           │                               │
│               │                               │
│ INTERVIEW     │                               │
│               │                               │
│ PRODUCTION    │                               │
│               │                               │
└───────────────┴───────────────────────────────┘
```

Sidebar should indicate:

- completed concepts
- current concept
- locked/unlocked state if applicable
- progress percentage

---

# 17. Level Progression Logic

Do NOT force users to finish an entire level before accessing the next.

Instead, visually recommend progression.

Example:

```text
Foundation
100% complete
       ↓
Recommended
       ↓
Understand
73% complete
       ↓
Interview
41% complete
       ↓
Production
18% complete
```

Users may navigate freely, but the UI should make the intended progression obvious.

---

# 18. Visual Design

Make this look like a serious modern developer education product.

Avoid:

- generic SaaS gradients
- excessive glassmorphism
- childish gamification
- huge colorful illustrations
- excessive animations
- clutter
- giant cards everywhere

Design direction:

**Linear × Vercel × modern technical documentation × premium developer tool**

Use:

- dark-first interface
- excellent typography
- subtle borders
- restrained accent color
- monospace typography for code
- excellent code blocks
- subtle hover states
- smooth transitions
- strong spacing hierarchy
- compact information density
- responsive layout

The content should remain the hero.

---

# 19. Level Identity

Give each level a subtle visual identity without making the UI childish.

Foundation:

`MAP`

Understand:

`MECHANISM`

Interview:

`PROVE`

Production:

`BUILD`

Use these as secondary labels.

Example:

```text
FOUNDATION
MAP THE LANGUAGE

Understand
MECHANISM

Interview
PROVE YOUR KNOWLEDGE

Production
BUILD WITH IT
```

---

# 20. Code Blocks

All Java code should have:

- syntax highlighting
- copy button
- line numbers for larger snippets
- language label
- horizontal scrolling
- clean formatting

Example:

```text
Java                                  Copy

1  public class HelloWorld {
2      public static void main(String[] args) {
3          System.out.println("Hello");
4      }
5  }
```

---

# 21. Tables

Convert Markdown tables into polished responsive tables.

For example, comparisons like:

```text
              JVM        JRE        JDK
Purpose       Execute    Run        Build + Run
Compiler      No         No         Yes
```

must become actual HTML tables.

On mobile, allow horizontal scrolling rather than breaking the layout.

---

# 22. Callouts

Convert Markdown blockquotes containing semantic labels into proper components.

Examples:

```text
┌─────────────────────────────────────┐
│ ⚠ Common Misconception              │
│ Java is purely interpreted.          │
└─────────────────────────────────────┘
```

and:

```text
┌─────────────────────────────────────┐
│ ✓ Best Practice                     │
│ Prefer constructor injection...      │
└─────────────────────────────────────┘
```

Support at least:

- Tip
- Note
- Warning
- Common Misconception
- Best Practice
- Anti-pattern
- Production Bug

---

# 23. Mobile

The site must be fully responsive.

On mobile:

- collapse sidebar
- use bottom/slide navigation
- keep level navigation accessible
- preserve code readability
- make tables horizontally scrollable
- avoid horizontal page overflow

The learning experience should work properly on a phone, not simply shrink the desktop UI.

---

# 24. Technical Requirements

Build it as a real application, not a static mockup.

Preferred stack:

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide icons

Use clean component architecture.

Suggested structure:

```text
app/
components/
  layout/
  navigation/
  learning/
  levels/
  concepts/
  progress/
  search/
  code/
  callouts/
lib/
content/
data/
types/
```

Separate:

1. content
2. content parsing
3. application state
4. UI components

Do not hardcode the entire curriculum into individual React components.

---

# 25. Content Data Model

Create a normalized structure similar to:

```ts
type Level =
  | "foundation"
  | "understand"
  | "interview"
  | "production";

interface Concept {
  id: string;
  title: string;
  slug: string;
  groupId: string;

  foundation?: Content;
  understand?: Content;
  interview?: Content;
  production?: Content;
}

interface Content {
  sections: Section[];
}

interface Section {
  type:
    | "definition"
    | "text"
    | "code"
    | "table"
    | "callout"
    | "diagram"
    | "questions"
    | "comparison";

  title?: string;
  content: unknown;
}
```

The four Markdown files should map into this shared structure.

This is important because the same concept exists across all four levels.

---

# 26. Content Integrity

Treat the four Markdown files as the source of truth.

Do not silently:

- rewrite facts
- merge concepts incorrectly
- remove sections
- invent missing content
- replace source terminology
- change the intended progression

Preserve the distinction between the four levels.

If a topic exists in Foundation but not yet in Production, show:

```text
Production
Coming soon
```

rather than fabricating production material.

The files themselves explicitly mark later groups as "coming" and currently indicate Group 1 as complete, so the UI should represent incomplete curriculum honestly.

---

# 27. Curriculum Status

Show completion status from the actual source structure.

For example:

```text
01 Java Fundamentals & Syntax       ✓
02 Object-Oriented Programming      ✓
03 Collections Framework            ✓
04 Generics                         ✓
05 Exception Handling               ✓
06 Streams & Functional Programming ✓
07 Concurrency & Multithreading     Coming soon
08 JVM Internals                    Coming soon
09 I/O & NIO                        Coming soon
10 Modern Java Features             Coming soon
11 Reflection & Annotations         Coming soon
12 JPMS                             Coming soon
```

The same twelve-group structure is present across the source files.

---

# 28. Gamification — Minimal

Do NOT turn this into a points/XP-heavy game.

Use mastery instead.

Example:

```text
Concept Mastery

Foundation     ●●●●●
Understand     ●●●●○
Interview      ●●●○○
Production     ●●○○○
```

Optionally show:

```text
Java Mastery
████████████░░░░ 72%
```

No fake XP, coins, streaks, or meaningless badges.

---

# 29. Knowledge Graph / Concept Relationships

Where the source content identifies relationships between concepts, expose them.

Example:

```text
Streams
   │
   ├── Lambda Expressions
   │       │
   │       └── Functional Interfaces
   │
   ├── Intermediate Operations
   │
   ├── Terminal Operations
   │
   └── Collectors
```

Clicking a related concept should navigate directly to it.

---

# 30. Breadcrumbs

Every concept page should have:

```text
Java
/
Object-Oriented Programming
/
Polymorphism
/
Understand
```

---

# 31. Reading Experience

The actual content area should have a comfortable maximum width.

Use a documentation-style reading layout:

```text
                Content

         Polymorphism
         ─────────────

         Definition

         ...

         How it works

         ...

         Example

         ...

                              On this page
                              Definition
                              How it works
                              Example
                              Common mistakes
```

Desktop can have a right-side "On this page" mini-navigation.

---

# 32. Finish With a Mastery Page

Each topic should have a final mastery view:

```text
Polymorphism

Your understanding

Foundation       ✓ Complete
Understand       ✓ Complete
Interview        82%
Production       54%

What you can do:

✓ Define polymorphism
✓ Explain runtime dispatch
✓ Answer common interview questions
○ Explain production pitfalls
○ Identify design tradeoffs

[ Continue Interview ]
```

---

# 33. Important Product Principle

The website should communicate this philosophy everywhere:

> **Knowing a concept is not the same as understanding it.**
>
> **Understanding it is not the same as explaining it.**
>
> **Explaining it is not the same as using it correctly in production.**

The four levels exist specifically to close those gaps.

Build the product around that idea.

---

# 34. Final Deliverable

Create the complete working website with:

- polished homepage
- Java dashboard
- curriculum navigation
- four-level learning system
- topic pages
- concept pages
- level switching
- progress tracking
- search
- command palette
- responsive sidebar
- code blocks
- tables
- diagrams
- callouts
- related concepts
- mastery tracking
- responsive mobile UI
- dark/light theme support
- accessible keyboard navigation
- clean URL routing

Do not stop at a visual prototype.

Build the actual application architecture so that adding another language later is possible:

```text
Java
 ├── Foundation
 ├── Understand
 ├── Interview
 └── Production

Python
 ├── Foundation
 ├── Understand
 ├── Interview
 └── Production

JavaScript
 ├── Foundation
 ├── Understand
 ├── Interview
 └── Production
```

Java is the first curriculum.

The architecture should make additional languages a content/data problem rather than a frontend rewrite.

Start by inspecting all four Markdown files, extracting their common curriculum hierarchy, normalizing the content into the data model, and then implementing the application.