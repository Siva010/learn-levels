# Source content issues

Discrepancies found while parsing the source Markdown. Per the fidelity rules, none of these were
silently corrected in the source — they are recorded here and handled explicitly in the parser.

Sections 1–7 concern `content/java/*.md`, last reviewed against the full 12-group curriculum
(132 concepts, 13,295 non-blank source lines). Section 8 concerns `content/python/*.md`
(126 concepts, 12,828 non-blank source lines). Section 9 concerns `content/spring-boot/*.md`
(125 concepts, 13,570 non-blank source lines).

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

**Handling:** an explicit alias table (`conceptAliases` in `lib/content/languages.ts`) maps canonical
concept numbers to each level's source number. Both Foundation concepts resolve to the same merged
Interview/Production section; those level views are flagged `viaAlias` with the source title so the UI
says the concepts are covered together at that level. The validator reports 18 aliased level views.

**Resolved (October 2026):** the Fundamentals rebuild (`docs/java-fundamentals-audit.md`) split the
merged sections and renumbered Interview and Production to match Foundation, so all four files now
have the same 12 concepts. Java's alias table was removed; the alias mechanism stays for other
languages.

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

---

### 8. The Python curriculum was written for this repository

The four Java files were supplied and are treated as immutable source. `content/python/*.md` were
not supplied — they were authored in this repository, in the same four dialects the parser already
understood, and they are the source of truth for the Python curriculum in exactly the same way: the
site renders them, and `validate-content` proves nothing is dropped.

That difference in origin is worth recording, because it is the reason the Python files have none of
the structural problems listed above:

| | Java | Python |
|---|---|---|
| Origin | Supplied, immutable | Authored here |
| Groups / concepts | 12 / 132 | 12 / 126 |
| Concept numbering across levels | Group 1 diverges | Identical in all four files |
| Alias table needed | Yes (`conceptAliases`) | No |
| `Build status` note | Stale, contradicts the TOC | Kept accurate at every step |
| Foundation sections | Unlabelled prose | Unlabelled prose (same convention) |
| Interview section labels | Fixed 13-label vocabulary | Same vocabulary |
| Understand / Production labels | Open-ended `**Label:**` | Same convention |

Two consequences for the parser:

1. **No aliases.** `lib/content/languages.ts` carries an empty alias entry for Python because all
   four files number concepts identically. Group 1 in Java needs its map; Python does not.
2. **Same generic-title stoplist mechanism.** Related-concept navigation is still derived from title
   mentions in the text, with a per-language stoplist (`genericTitles`) for titles too common to be
   meaningful references — `Lists`, `Dictionaries`, `Strings and Text`, and similar.

The Python source also contains no concept-to-concept wiki-links, for the same reason as the Java
source: `[[#...]]` appears only in tables of contents and back-to-top links. The related-concepts
navigation is derived, not asserted. 98 of 126 concepts get links, averaging 1.5.

**Known limitation of the derived links.** Title matching is case-insensitive and word-bounded, so a
concept title that also appears inside a common compound term collects false positives. In the
Python curriculum the clearest case is `Descriptors` (4.8), which matches the phrase "file
descriptors" in the I/O, concurrency and memory groups — 12 concepts link to it, of which roughly
half are that collision. Stoplisting the title would remove the genuine links along with the noise,
so it is left in place and recorded here. The same trade-off produced the Java stoplist entries for
`Methods`, `Arrays` and `Operators`.

---

### 9. The Spring Boot curriculum was written for this repository and builds on Java

Like Python, `content/spring-boot/*.md` was authored here rather than supplied, in the same four
dialects, and is the source of truth for the Spring Boot curriculum. It has the same structural
properties as the Python files — identical numbering in all four files, an accurate `Build status`
note, the same label conventions — so the parser needs no alias table for it.

| | Java | Python | Spring Boot |
|---|---|---|---|
| Origin | Supplied, immutable | Authored here | Authored here |
| Groups / concepts | 12 / 132 | 12 / 126 | 12 / 125 |
| Alias table needed | Yes | No | No |
| Prerequisite | None | None | The Java curriculum |
| In-text concept links | None | None | 19 |

Four things differ from the other two curricula and are recorded here:

1. **It assumes Java.** The Spring Boot files do not re-teach the language. The Foundation and
   Interview `Goal of this file` notes say so, and topics such as generics, collections, concurrency and the JVM are left to
   the Java curriculum rather than duplicated. There are no cross-curriculum links, because the
   parser resolves `[[#...]]` within one language only.
2. **It contains some in-text concept links.** Nineteen `[[#N.M Title]]` references appear in body
   text, each pointing at an earlier concept that explains a mechanism the current one relies on —
   for example caching and transactions both point back to `1.10 Proxies and AOP`. The parser already
   resolves explicit wiki-links before title matching, so these become related-concept links directly.
   Together with derived title matches, 79 of 125 concepts get links, averaging 1.6.
3. **It is written against Spring Boot 3.x, and Spring Boot 4 now exists.** The curriculum targets
   Spring Boot 3.x on Java 17+, the generation in widest use while it was written. Spring Boot 4.0
   (on Spring Framework 7) was released in November 2025. Where behaviour differs, the text says so
   explicitly. Examples include native API versioning in Spring Framework 7, the core `@Retryable`
   and `@ConcurrencyLimit` annotations, and `@MockitoBean` replacing the deprecated `@MockBean`.
   Concept 12.10, *Upgrading Spring Boot*, covers the 3.x-to-4.0 path. Version-specific claims are
   tagged with the version that introduced them (for example "Boot 3.4+"), so they can be checked
   when the material is next revised.

4. **It is written cause-first.** Every concept states the problem that forced it to exist before its
   mechanism. In the Understand file that takes two labels the other curricula do not use:
   `**The problem:**`, which opens the concept, and `**Predict it:**`, a question whose answer follows
   from the mechanism. The site renders `Predict it` with the answer folded behind a reveal. The
   parser needs no change for either — Understand labels are open-ended — and the registry maps them
   to their own presentation. All 125 concepts carry both sections.

The Spring Boot generic-title stoplist is short and data-driven: `Logging`, `Constraints`,
`Profiles`, `Propagation` and `Aggregation`. Each title also appears as an ordinary word in an
unrelated context — "context propagation" in tracing, "metric aggregation" in monitoring, "JFR
profiles" in performance work — and would otherwise link those concepts to the wrong place.
