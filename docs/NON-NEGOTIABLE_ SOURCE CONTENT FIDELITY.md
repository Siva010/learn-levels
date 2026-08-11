## NON-NEGOTIABLE: SOURCE CONTENT FIDELITY

The four provided Markdown files are the **single source of truth for all educational content**.

The website must remain **100% synchronized with the supplied Markdown files**.

### Files

- `0_foundation.md`
- `1_understand.md`
- `2_interview.md`
- `3_production.md`

### Absolute requirements

**Do not omit content.**

Every piece of educational information present in the Markdown files must be represented somewhere in the website.

This includes, but is not limited to:

- Every major topic
- Every subsection
- Every concept
- Definitions
- Explanations
- "Why it exists" sections
- Interview explanations
- Syntax examples
- Code examples
- Diagrams
- Tables
- Advantages
- Disadvantages
- Common misconceptions
- Common mistakes
- Follow-up questions
- Edge cases
- Comparisons
- Complexity information
- Frequently confused concepts
- Important facts
- Best practices
- Performance considerations
- Scalability concerns
- Security implications
- Production bugs
- Anti-patterns
- Debugging tips
- Testing advice
- Maintainability guidance
- Framework relevance
- Real-world use cases
- Notes, tips, warnings, and other callouts

If the Markdown contains information that does not fit neatly into the initial UI model, **extend the UI/data model to accommodate it**.

Do NOT remove information simply because it is inconvenient to render.

---

### Preserve the four-level distinction

Do not mix content between levels.

The meaning of each file must remain intact:

**Foundation**
> What is this concept?

**Understand**
> How does this concept actually work?

**Interview**
> How do I explain and defend this concept in an interview?

**Production**
> How is this concept used, optimized, debugged, and managed in real software?

For example, if the Foundation file gives a simple explanation while the Understand file provides deeper internals, both must be displayed at their respective levels.

Do not replace the Foundation explanation with the Understand explanation.

Do not replace the Interview material with a shorter summary.

Do not replace Production guidance with generic best practices.

---

### Preserve source wording and meaning

The content should be rendered from the Markdown rather than manually rewritten into abbreviated summaries.

Preserve:

- Technical terminology
- Section titles
- Meaning
- Examples
- Relationships between concepts
- Warnings
- Nuances
- Caveats
- Comparisons

Minor UI formatting changes are allowed, but **semantic content must not be lost**.

Do not silently "improve" technically questionable statements in the source.

If the source says something specific, preserve what the source says.

If you believe something needs correction, do not silently modify it. Flag it separately as a potential source-content issue.

---

### No hallucinated curriculum

Do not invent educational content and present it as if it came from the Markdown files.

If the source does not contain information about something:

```text
Content not available yet.
```

or

```text
Coming soon
```

may be displayed.

Do NOT fill the gap with your own explanation.

The application may contain UI copy such as navigation labels, progress descriptions, and onboarding text, but educational material must originate from the provided Markdown files unless explicitly marked as additional/non-source content.

---

### Preserve incomplete content

The Markdown files currently indicate that some groups are still incomplete.

For example, the curriculum contains completed groups followed by groups marked as:

```text
coming next
coming
```

Do not fabricate those missing sections.

Represent their actual status in the UI.

If a group is present in a file but only partially built, preserve exactly what is currently available.

---

### Automated content validation

Build a **content integrity validation system** into the project.

The application/build process should be able to detect:

- Markdown sections missing from the website
- Concepts missing from a level
- Code blocks missing
- Tables missing
- Callouts missing
- Questions missing
- Diagrams missing
- Sections accidentally removed
- Content present in Markdown but absent from the normalized data model

Ideally provide a development command such as:

```bash
npm run validate-content
```

which parses the four Markdown files and reports discrepancies.

Example output:

```text
Content Integrity Check
────────────────────────────────────

Foundation
✓ 6/6 topic groups
✓ 42/42 concepts
✓ 118/118 sections
✓ 23/23 code blocks
✓ 8/8 tables

Understand
✓ 6/6 topic groups
✓ 42/42 concepts
✓ 164/164 sections
✓ 31/31 code blocks
✓ 12/12 diagrams

Interview
✓ 6/6 topic groups
✓ 42/42 concepts
✓ 201/201 sections
✓ 47/47 interview questions

Production
✓ 6/6 topic groups
✓ 42/42 concepts
✓ 187/187 sections
✓ 29/29 production callouts

✓ CONTENT INTEGRITY PASSED
```

The numbers above are only an example. **Calculate the actual counts from the supplied Markdown files.**

---

### Markdown should remain the source

Prefer this architecture:

```text
Markdown files
      ↓
Markdown parser
      ↓
Normalized content model
      ↓
React components
      ↓
Website
```

NOT:

```text
Markdown files
      ↓
Developer manually copies content
      ↓
Hardcoded React components
```

The second approach will inevitably cause content drift.

The Markdown files should remain the canonical content source so that when a Markdown file changes, the website can be regenerated or updated without manually rewriting the UI.

---

### Preserve source ordering

Unless there is a strong UX reason otherwise, preserve:

1. Topic order
2. Section order
3. Concept order
4. Question order
5. Table order
6. Example order

The website should feel like a structured representation of the original learning material, not a rearranged summary.

---

### Source-to-UI traceability

Every rendered educational section should have an identifiable relationship to its source Markdown section.

Internally, maintain metadata such as:

```ts
interface ContentSource {
  file:
    | "0_foundation.md"
    | "1_understand.md"
    | "2_interview.md"
    | "3_production.md";

  headingPath: string[];
  sourceId: string;
}
```

This allows future validation and debugging.

For example:

```text
Java
→ OOP
→ Polymorphism
→ Interview
→ Common Interview Questions
→ source: 2_interview.md
```

---

### Final acceptance criterion

The website is **not complete** merely because it looks good.

It is complete only when:

> **Every piece of educational content in the four supplied Markdown files can be located and accessed in the website, under the correct topic and correct learning level, without loss of meaning or detail.**

Visual quality, animations, search, progress tracking, and UX are secondary to **content fidelity**.

When in doubt:

**Preserve the source content rather than simplifying it.**