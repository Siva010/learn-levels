# Learn Levels

A learning platform that teaches the same concept through four increasing levels of practical depth:

**Foundation** (what is it) → **Understand** (how does it work) → **Interview** (can I explain it) → **Production** (can I use it correctly)

Three curricula ship today — **Java** (132 concepts), **Python** (126 concepts) and **Spring Boot**
(125 concepts, which assumes the Java curriculum) — each written as four Markdown files and rendered
by the same pipeline. The site presents Java and Spring Boot as one curriculum, **Java + Spring
Boot**, in two parts: one dashboard, sidebar, search and progress view, with navigation that runs
from the last Java concept straight into the first Spring Boot one.

## Content is the source of truth

Every piece of educational content is parsed from the Markdown in `content/<language>/`. Nothing is
transcribed into components, and nothing is invented — see
[docs/NON-NEGOTIABLE_ SOURCE CONTENT FIDELITY.md](docs/NON-NEGOTIABLE_%20SOURCE%20CONTENT%20FIDELITY.md).

```text
content/<language>/*.md  →  parser  →  data/generated/<language>.curriculum.json  →  React components
                              ↓
                        validate-content
```

Editing a source file and re-running `npm run build:content` updates the site. Adding a language is
a `content/<language>/` drop, an entry in [lib/content/languages.ts](lib/content/languages.ts) and
one static import in [lib/content/curriculum.ts](lib/content/curriculum.ts) — the routes, search,
sidebar and progress tracking are already language-scoped.

## Commands

```bash
npm run dev
```

```bash
npm run build
```

```bash
npm run validate-content
```

`dev` and `build` both regenerate the content model first, so editing a Markdown file and
reloading is all it takes.

`validate-content` is the fidelity gate, and `npm run build` runs it automatically. It runs for
every registered language (or just the ones you name: `npm run validate-content python`) and checks
two things independently:

1. **Line attribution** — every non-blank line of all four source files must be claimed by exactly
   one part of the content model. Unclaimed lines mean content was silently dropped.
2. **Raw counts** — code fences, tables, callouts and interview questions counted directly off the
   Markdown (skipping anything inside a code fence) must match what the model emitted.

Current state:

| Language | Groups | Concepts | Sections | Source lines attributed |
|---|---|---|---|---|
| Java | 12 | 132 | 3,388 | 13,295 / 13,295 |
| Python | 12 | 126 | 3,470 | 12,828 / 12,828 |
| Spring Boot | 12 | 125 | 3,636 | 13,557 / 13,557 |

## Layout

```text
content/java/        the four Java source Markdown files — the only place that content lives
content/python/      the four Python source Markdown files
content/spring-boot/ the four Spring Boot source Markdown files
docs/                product spec, fidelity rules, and SOURCE_ISSUES.md
lib/content/         parser, label registry, language registry, server-side lookups
lib/progress/        storage-agnostic ProgressStore + localStorage adapter
lib/search/          ranked search over the generated per-language index
scripts/             build-content.ts, validate-content.ts
data/generated/      parser output (generated, git-ignored, never edited by hand)
public/search-index/ per-language search index (generated, git-ignored)
```

## Notes on the source material

[docs/SOURCE_ISSUES.md](docs/SOURCE_ISSUES.md) records discrepancies found while parsing — the Java
`Build status` note that contradicts each file's own table of contents, the Java Group 1 concepts
that don't align across levels, and the fact that neither source contains concept-to-concept links.
None were silently corrected; each is handled explicitly and documented. The same file records where
the Python and Spring Boot curricula came from, how they differ structurally from the Java one, and
which Spring Boot version the Spring Boot material is written against.

## Deploying

`npm run build` writes a fully static site to `out/` — 2,344 HTML files (806 Java, 770 Python,
764 Spring Boot, plus the shared pages) and their assets. There is no server component to run: search happens in the
browser and progress lives in `localStorage`.

Preview the real thing locally:

```bash
npm run preview
```

Any static host works. Build command `npm run build`, output directory `out`:

| Host | Notes |
|---|---|
| Cloudflare Pages | Free, global CDN, no config needed |
| Netlify | Free tier, same settings |
| GitHub Pages | Free; set `NEXT_PUBLIC_BASE_PATH` and `basePath` if serving from a subpath |
| Vercel | Detects Next.js automatically and serves the export |
| S3 + CloudFront / nginx | Plain file hosting; `trailingSlash` means no rewrite rules are needed |

`trailingSlash: true` makes every route a directory with an `index.html`, so hosts that don't
rewrite extensionless URLs still resolve `/java/generics/wildcards/interview/`.

## Architecture notes

- **Parsing happens at build time.** Every page is prerendered, including Shiki syntax
  highlighting, so nothing parses Markdown per request. Build time and output size scale with the
  number of languages — the three curricula together prerender 2,344 pages.
- **Search runs in the browser** against a per-language static index (`public/search-index/<language>.json`,
  about 2 MB raw each and a fraction of that gzipped) fetched the first time the user searches in
  that language and held for the session. It is deliberately not truncated — the point of search is
  to reach any sentence in the curriculum, so trimming section text would make content unfindable.
- **Progress goes through `ProgressStore`.** Swapping localStorage for a backend is one new
  adapter; no component changes.
- **Predict-it sections fold their answer.** An Understand section labelled `Predict it` renders its
  first paragraph as the question and folds the rest behind a native `<details>` reveal, so the
  reader commits to an answer before checking it. No client JavaScript is involved.
- **Section labels are preserved verbatim.** The Understand files use a long tail of distinct
  labels, most appearing once. Known labels get bespoke presentation; the rest render generically
  rather than being dropped.
- **Tracks join languages without merging them.** A track in `lib/content/languages.ts` lists
  languages in reading order. Each part keeps its own content, URLs (`/java/...`,
  `/spring-boot/...`) and progress record, so nothing stored or linked changes; the track only
  decides how the parts are navigated, searched and summarised. A language in no track stands
  alone.
- **Languages are registry entries.** `lib/content/languages.ts` holds the display title, the
  home-page blurb, and the two per-language parser inputs that cannot be derived from the source —
  the concept alias table and the generic-title stoplist.
