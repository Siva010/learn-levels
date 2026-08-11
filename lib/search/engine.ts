import type { LevelId, SearchDoc } from "@/types/content";

export interface SearchHit {
  id: string;
  groupSlug: string;
  groupTitle: string;
  conceptSlug: string;
  conceptTitle: string;
  level: LevelId;
  sectionLabel: string;
  /** Excerpt around the first match, with a leading/trailing ellipsis where truncated. */
  snippet: string;
  score: number;
}

export interface SearchResponse {
  query: string;
  terms: string[];
  total: number;
  hits: SearchHit[];
}

const SNIPPET_RADIUS = 90;

/**
 * Ranked substring search over the generated section documents.
 *
 * Environment-agnostic on purpose: the same scoring runs in the browser (against the index
 * fetched on first search) and in Node (scripts, tests). Scoring favours concept titles over
 * section labels over body text, and rewards documents that match every term.
 */
export function search(
  docs: SearchDoc[],
  query: string,
  { limit = 30 }: { limit?: number } = {},
): SearchResponse {
  const terms = tokenize(query);
  if (terms.length === 0) {
    return { query, terms, total: 0, hits: [] };
  }

  const scored: SearchHit[] = [];

  for (const doc of docs) {
    const score = scoreDoc(doc, terms);
    if (score <= 0) continue;
    scored.push({
      id: doc.id,
      groupSlug: doc.groupSlug,
      groupTitle: doc.groupTitle,
      conceptSlug: doc.conceptSlug,
      conceptTitle: doc.conceptTitle,
      level: doc.level,
      sectionLabel: doc.sectionLabel,
      snippet: buildSnippet(doc.text, terms),
      score,
    });
  }

  scored.sort((a, b) => b.score - a.score || a.conceptTitle.localeCompare(b.conceptTitle));

  return { query, terms, total: scored.length, hits: scored.slice(0, limit) };
}

export function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^a-z0-9+#._-]+/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 2);
}

function scoreDoc(doc: SearchDoc, terms: string[]): number {
  const title = doc.conceptTitle.toLowerCase();
  const label = doc.sectionLabel.toLowerCase();
  const body = doc.text.toLowerCase();

  let score = 0;
  let matched = 0;

  for (const term of terms) {
    let termScore = 0;
    if (title === term) termScore += 60;
    else if (title.includes(term)) termScore += 30;
    if (doc.groupTitle.toLowerCase().includes(term)) termScore += 8;
    if (label.includes(term)) termScore += 10;

    const occurrences = countOccurrences(body, term);
    if (occurrences > 0) termScore += Math.min(8, 2 + occurrences);

    if (termScore > 0) matched += 1;
    score += termScore;
  }

  if (matched === 0) return 0;
  // Documents matching every term rank well above partial matches.
  if (matched === terms.length && terms.length > 1) score *= 1.6;
  return score;
}

function countOccurrences(haystack: string, needle: string): number {
  let count = 0;
  let index = haystack.indexOf(needle);
  while (index !== -1 && count < 20) {
    count += 1;
    index = haystack.indexOf(needle, index + needle.length);
  }
  return count;
}

function buildSnippet(text: string, terms: string[]): string {
  const flat = text.replace(/\s+/g, " ").trim();
  const lower = flat.toLowerCase();

  let position = -1;
  for (const term of terms) {
    const found = lower.indexOf(term);
    if (found !== -1 && (position === -1 || found < position)) position = found;
  }
  if (position === -1) return flat.slice(0, SNIPPET_RADIUS * 2).trim();

  const start = Math.max(0, position - SNIPPET_RADIUS);
  const end = Math.min(flat.length, position + SNIPPET_RADIUS);
  return `${start > 0 ? "…" : ""}${flat.slice(start, end).trim()}${end < flat.length ? "…" : ""}`;
}
