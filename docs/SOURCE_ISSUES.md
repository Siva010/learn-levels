# Source content issues

Discrepancies found while parsing `content/java/*.md`. Per the fidelity rules, none of these were
silently corrected in the source — they are recorded here and handled explicitly in the parser.

Last reviewed against the full 12-group curriculum (132 concepts, 13,295 non-blank source lines).

---

### 1. `Build status` contradicts the Master Table of Contents

All four files still carry a header note reading:

> **Build status:** Currently complete: **Group 1**. Groups 2–12 will be added in follow-up passes.

This is now clearly stale: each file's own Master Table of Contents marks **all twelve** groups with
✅, and the content for all twelve is present (132 concepts in Foundation/Understand, 131 in
Interview/Production).

**Handling:** the UI follows the Table of Contents and the actual parsed content — 12 groups
complete, 0 planned. The `Build status` note is preserved in the model but never drives curriculum
status. **Worth fixing in the source**, since it is the one place a reader is told the curriculum is
incomplete.

---

### 2. Group 1 concepts do not align across levels

| | Foundation / Understand | Interview | Production |
|---|---|---|---|
| Concepts in group 1 | 9 | 8 | 8 |
| 1.1 | What is Java? | What is Java? / JVM / JRE / JDK | JVM / JRE / JDK in Production |
| 1.2 | JVM, JRE, and JDK | Platform Independence & Bytecode | Bytecode & Platform Considerations |
| 1.5 | Operators | Control Flow Statements | Control Flow |

Interview and Production merge Foundation's `1.1` and `1.2` into a single section, which shifts every
later number in the group by one. **Groups 2–12 align exactly by number in all four files** — this
was re-verified after the curriculum was completed.

**Handling:** an explicit alias table (`CONCEPT_ALIASES` in `lib/content/registry.ts`) maps canonical
concept numbers to each level's source number. Both Foundation concepts resolve to the same merged
Interview/Production section; those level views are flagged `viaAlias` with the source title so the UI
says the concepts are covered together at that level. The validator reports 18 aliased level views.

---

### 3. Foundation has no labelled sections

The product spec describes a Foundation UI with `Definition`, `Why it exists`, `Key idea`,
`Simple example`, and `Related concepts` headings. `0_foundation.md` contains no such labels — each
concept is one or two plain prose paragraphs, and only 46 of 132 use the "It exists…" phrasing that
would let a "Why it exists" split be derived reliably.

**Handling:** Foundation renders as prose, exactly as written. No headings were invented to fill the
spec's template.

---

### 4. Concept relationships are not encoded in the source

The spec asks for a knowledge graph of related concepts. The source's `[[#...]]` wiki-links appear
**only** inside tables of contents and back-to-top links — there are no concept-to-concept links in
any concept body. Eleven concepts have an explicit `Relationships:` section in the Understand file.

**Handling:** `Relationships:` sections render as normal content. The "related concepts" navigation is
derived by detecting mentions of other concepts' titles in a concept's own text, with a stoplist for
titles too generic to be meaningful references (`Methods`, `Arrays`, `Operators`, …). 119 of 132
concepts get links, averaging 3.0. This is navigation derived from the source text — no relationship
is asserted that the source does not state.

---

### 5. Per-group navigation chrome sits inside the last concept

Every group now ends with two navigational lines placed *after* the last concept's content but
*before* the next `##` heading:

```text
[[#📖 Master Table of Contents|⬆ Back to top]]

*End of Group 12 — curriculum complete.*
```

Structurally these fall inside the final concept of each group — 48 occurrences across the four
files. Rendered literally, they would appear as stray paragraphs at the bottom of 48 concept pages.

**Handling:** the parser recognises link-only paragraphs and `*End of Group N …*` markers as
navigation, attributes them (so the integrity check still accounts for every line), and excludes them
from rendered content.

---

### 6. Each file closes with an unnumbered section

Every file ends with a `## 🎓 …` section — `Where to Go Next` in the first three, `Curriculum
Complete` in Production, the latter containing a summary table and suggested next steps. These sit
outside any numbered group, so the group/concept walk never reached them.

**Handling:** parsed as a file-level epilogue and surfaced on the dashboard under "About each level",
alongside each file's `Goal of this file` note.

---

### 7. The product spec's example counts are stale

`docs/Core Product Concept.md` §27 shows an example curriculum with 6 groups complete and
`07 Concurrency & Multithreading` as "Coming soon". The source files now contain all twelve groups.

**Handling:** the UI reads status from the source files, not from the spec's example.
