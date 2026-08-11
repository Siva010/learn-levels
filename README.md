# Learn Levels

A Java learning platform that teaches the same concept through four increasing levels of practical depth:

**Foundation** (what is it) → **Understand** (how does it work) → **Interview** (can I explain it) → **Production** (can I use it correctly)

## Content is the source of truth

Every piece of educational content is parsed from the Markdown in `content/java/`. Nothing is
transcribed into components, and nothing is invented — see
[docs/NON-NEGOTIABLE_ SOURCE CONTENT FIDELITY.md](docs/NON-NEGOTIABLE_%20SOURCE%20CONTENT%20FIDELITY.md).

```text
content/java/*.md  →  parser  →  data/generated/*.json  →  React components
                        ↓
                   validate-content
```

Editing a source file and re-running `npm run build:content` updates the site. Adding a language
is a `content/<language>/` drop plus a registry entry — the routes are already language-scoped.

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

`validate-content` is the fidelity gate, and `npm run build` runs it automatically. It checks two
things independently:

1. **Line attribution** — every non-blank line of all four source files must be claimed by exactly
   one part of the content model. Unclaimed lines mean content was silently dropped.
2. **Raw counts** — code fences, tables, callouts and interview questions counted directly off the
   Markdown (skipping anything inside a code fence) must match what the model emitted.

Current state: 13,295 of 13,295 source lines attributed across the four files — 12 topic groups,
132 concepts, 3,388 sections.

## Layout

```text
content/java/        the four source Markdown files — the only place content lives
docs/                product spec, fidelity rules, and SOURCE_ISSUES.md
lib/content/         parser, label registry, Group 1 alias table, server-side lookups
lib/progress/        storage-agnostic ProgressStore + localStorage adapter
lib/search/          server-side ranked search over the generated index
scripts/             build-content.ts, validate-content.ts
data/generated/      parser output (committed; never edited by hand)
```

## Notes on the source material

[docs/SOURCE_ISSUES.md](docs/SOURCE_ISSUES.md) records discrepancies found while parsing — the
`Build status` note that contradicts each file's own table of contents, the Group 1 concepts that
don't align across levels, and the fact that the source contains no concept-to-concept links.
None were silently corrected; each is handled explicitly and documented.

## Deploying

`npm run build` writes a fully static site to `out/` — 810 HTML files plus assets. There is no
server component to run: search happens in the browser and progress lives in `localStorage`.

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

- **Parsing happens at build time.** All 678 pages are prerendered, including Shiki syntax
  highlighting, so nothing parses Markdown per request.
- **Search runs in the browser** against a static index (`public/search-index/java.json`, 323 KB
  gzipped) fetched the first time the user searches and held for the session. It is deliberately
  not truncated — the point of search is to reach any sentence in the curriculum, so trimming
  section text would make content unfindable.
- **Progress goes through `ProgressStore`.** Swapping localStorage for a backend is one new
  adapter; no component changes.
- **Section labels are preserved verbatim.** The Understand file alone uses ~130 distinct labels,
  most appearing once. Known labels get bespoke presentation; the rest render generically rather
  than being dropped.
