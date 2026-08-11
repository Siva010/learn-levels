import type { Block, GroupStatus, LineRange, LevelId, SourceFile } from "@/types/content";
import { calloutVariantFor, sectionKindFor, slugify, splitNumberedHeading } from "../registry";
import { tokenize } from "./tokenize";

/* --------------------------------------------------------------- attribution */

export type ClaimOwner =
  | "file-title"
  | "file-note"
  | "master-toc"
  | "group-heading"
  | "group-toc"
  | "group-nav"
  | "concept-heading"
  | "section-label"
  | "epilogue-heading"
  | "block"
  | "rule";

export interface Claim {
  line: number;
  owner: ClaimOwner;
}

/* -------------------------------------------------------------- parsed shape */

export interface ParsedSection {
  label: string;
  blocks: Block[];
  lines: LineRange;
}

export interface ParsedConcept {
  number: string;
  title: string;
  sections: ParsedSection[];
  lines: LineRange;
  wikiLinks: string[];
}

export interface ParsedGroup {
  number: string;
  title: string;
  concepts: ParsedConcept[];
  lines: LineRange;
}

export interface TocEntry {
  number: string;
  title: string;
  status: GroupStatus;
}

export interface ParsedEpilogue {
  title: string;
  blocks: Block[];
  lines: LineRange;
}

export interface ParsedFile {
  file: SourceFile;
  level: LevelId;
  title: string;
  goal: string;
  buildStatus: string;
  toc: TocEntry[];
  groups: ParsedGroup[];
  epilogue?: ParsedEpilogue;
  claims: Claim[];
  lineCount: number;
  lines: string[];
}

const BOLD_LABEL = /^\*\*([^*\n]+?):\*\*\s*/;
/** `[[#Target]]` or `[[#Target|Alias]]` — only the target identifies the concept. */
const WIKI_LINK = /\[\[#([^\]|]+)(?:\|[^\]]*)?\]\]/g;
/** A paragraph that is nothing but a wiki-link — i.e. a "back to top" jump. */
const NAV_LINK_ONLY = /^\[\[#[^\]]+\]\]$/;
/** The `*End of Group 7 — …*` marker that closes each group. */
const END_OF_GROUP = /^\*End of Group\s+\d+\b.*\*$/;

/**
 * Navigation chrome rather than content: back-to-top links and end-of-group markers. They sit
 * inside the last concept of every group, so without this they would render as stray paragraphs
 * on 48 concept pages.
 */
function isNavigationBlock(block: Block): boolean {
  if (block.type !== "paragraph") return false;
  const text = block.markdown.trim();
  return NAV_LINK_ONLY.test(text) || END_OF_GROUP.test(text);
}

export function parseFile(
  content: string,
  file: SourceFile,
  level: LevelId,
): ParsedFile {
  const lines = content.split(/\r?\n/);
  const claims: Claim[] = [];
  const claim = (line: number, owner: ClaimOwner) => claims.push({ line, owner });

  let title = "";
  let goal = "";
  let buildStatus = "";
  const toc: TocEntry[] = [];
  const groups: ParsedGroup[] = [];
  let epilogue: ParsedEpilogue | undefined;

  // Index the structural headings once; everything else is derived from these boundaries.
  const h1 = indicesOf(lines, /^#\s+\S/);
  const h2 = indicesOf(lines, /^##\s+\S/);
  const h3 = indicesOf(lines, /^###\s+\S/);

  if (h1.length > 0) {
    title = lines[h1[0]].replace(/^#\s+/, "").trim();
    claim(h1[0] + 1, "file-title");
  }

  // ---------------------------------------------------------------- preamble
  const preambleEnd = h2.length > 0 ? h2[0] : lines.length;
  for (let i = (h1[0] ?? -1) + 1; i < preambleEnd; i++) {
    const line = lines[i];
    if (line.trim() === "") continue;
    if (/^---+$/.test(line.trim())) {
      claim(i + 1, "rule");
      continue;
    }
    if (line.trimStart().startsWith(">")) {
      const text = line.trimStart().replace(/^>\s?/, "").trim();
      if (/^\*\*Goal of this file:\*\*/.test(text)) {
        goal = text.replace(/^\*\*Goal of this file:\*\*\s*/, "");
      } else if (/^\*\*Build status:\*\*/.test(text)) {
        buildStatus = text.replace(/^\*\*Build status:\*\*\s*/, "");
      }
      claim(i + 1, "file-note");
      continue;
    }
    claim(i + 1, "file-note");
  }

  // ---------------------------------------------------------------- sections
  for (let g = 0; g < h2.length; g++) {
    const start = h2[g];
    const end = g + 1 < h2.length ? h2[g + 1] : lines.length;
    const heading = lines[start].replace(/^##\s+/, "").trim();
    claim(start + 1, "group-heading");

    if (/Master Table of Contents/i.test(heading)) {
      toc.push(...parseMasterToc(lines, start + 1, end, claim));
      continue;
    }

    const { number, title: groupTitle } = splitNumberedHeading(heading);

    // A non-numbered heading that isn't the table of contents closes the file
    // ("Where to Go Next", "Curriculum Complete").
    if (!number) {
      const { blocks, ignored } = tokenize(lines, start + 1, end);
      ignored.forEach((line) => claim(line, "rule"));
      blocks.forEach((block) => claimRange(block.lines, "block", claim));
      if (blocks.length > 0) {
        epilogue = {
          title: heading,
          blocks,
          lines: { start: start + 1, end: blocks[blocks.length - 1].lines.end },
        };
      }
      continue;
    }

    const conceptHeadings = h3.filter((index) => index > start && index < end);
    const concepts: ParsedConcept[] = [];

    for (let c = 0; c < conceptHeadings.length; c++) {
      const cStart = conceptHeadings[c];
      const cEnd = c + 1 < conceptHeadings.length ? conceptHeadings[c + 1] : end;
      const cHeading = lines[cStart].replace(/^###\s+/, "").trim();

      if (/^Table of Contents/i.test(cHeading)) {
        claim(cStart + 1, "group-toc");
        for (let i = cStart + 1; i < cEnd; i++) {
          if (lines[i].trim() !== "") claim(i + 1, "group-toc");
        }
        continue;
      }

      claim(cStart + 1, "concept-heading");
      const parsedHeading = splitNumberedHeading(cHeading);
      const sections = splitSections(lines, cStart + 1, cEnd, claim);

      concepts.push({
        number: parsedHeading.number,
        title: parsedHeading.title,
        sections,
        lines: { start: cStart + 1, end: cEnd },
        wikiLinks: collectWikiLinks(lines.slice(cStart, cEnd).join("\n")),
      });
    }

    groups.push({
      number,
      title: groupTitle,
      concepts,
      lines: { start: start + 1, end },
    });
  }

  return {
    file,
    level,
    title,
    goal,
    buildStatus,
    toc,
    groups,
    epilogue,
    claims,
    lineCount: lines.length,
    lines,
  };
}

/* ------------------------------------------------------------------ helpers */

function indicesOf(lines: string[], pattern: RegExp): number[] {
  const found: number[] = [];
  let inFence = false;
  lines.forEach((line, index) => {
    if (/^\s*```/.test(line)) inFence = !inFence;
    if (!inFence && pattern.test(line)) found.push(index);
  });
  return found;
}

function parseMasterToc(
  lines: string[],
  from: number,
  to: number,
  claim: (line: number, owner: ClaimOwner) => void,
): TocEntry[] {
  const entries: TocEntry[] = [];
  for (let i = from; i < to; i++) {
    const line = lines[i];
    if (line.trim() === "") continue;
    claim(i + 1, /^---+$/.test(line.trim()) ? "rule" : "master-toc");

    const match = /^(\d+)\.\s+(.*)$/.exec(line.trim());
    if (!match) continue;

    const [, number, rest] = match;
    const linked = /\[\[#([^\]]+)\]\]/.exec(rest);
    const rawTitle = linked ? linked[1] : rest.replace(/—.*$/, "").trim();
    const { title } = splitNumberedHeading(rawTitle);

    let status: GroupStatus = "complete";
    if (/coming next/i.test(rest)) status = "coming-next";
    else if (/coming/i.test(rest)) status = "coming";

    entries.push({ number, title: title || rawTitle, status });
  }
  return entries;
}

/**
 * Splits a concept body into labelled sections.
 *
 * Three source dialects are handled by one pass:
 *   `#### Label`      (2_interview.md — fixed 13-label vocabulary)
 *   `**Label:** text` (1_understand.md / 3_production.md — open-ended vocabulary)
 *   unlabelled prose  (0_foundation.md)
 *
 * Content before the first label becomes an implicit unlabelled section so nothing is orphaned.
 */
function splitSections(
  lines: string[],
  from: number,
  to: number,
  claim: (line: number, owner: ClaimOwner) => void,
): ParsedSection[] {
  const h4: number[] = [];
  let inFence = false;
  for (let i = from; i < to; i++) {
    if (/^\s*```/.test(lines[i])) inFence = !inFence;
    if (!inFence && /^####\s+\S/.test(lines[i])) h4.push(i);
  }

  if (h4.length > 0) {
    const sections: ParsedSection[] = [];
    if (h4[0] > from) {
      const intro = buildSection("", lines, from, h4[0], claim);
      if (intro) sections.push(intro);
    }
    for (let i = 0; i < h4.length; i++) {
      const start = h4[i];
      const end = i + 1 < h4.length ? h4[i + 1] : to;
      const label = lines[start].replace(/^####\s+/, "").trim();
      claim(start + 1, "section-label");
      const section = buildSection(label, lines, start + 1, end, claim);
      if (section) sections.push(section);
      else {
        sections.push({
          label,
          blocks: [],
          lines: { start: start + 1, end: start + 1 },
        });
      }
    }
    return sections;
  }

  // Bold-label dialect: tokenize first, then cut at paragraphs that open with a label.
  const { blocks, ignored } = tokenize(lines, from, to);
  ignored.forEach((line) => claim(line, "rule"));

  const sections: ParsedSection[] = [];
  let current: ParsedSection | null = null;

  for (const block of blocks) {
    if (isNavigationBlock(block)) {
      claimRange(block.lines, "group-nav", claim);
      continue;
    }

    const label = block.type === "paragraph" ? BOLD_LABEL.exec(block.markdown) : null;

    if (label && block.type === "paragraph") {
      current = {
        label: label[1].trim(),
        blocks: [],
        lines: { start: block.lines.start, end: block.lines.end },
      };
      sections.push(current);

      const remainder = block.markdown.slice(label[0].length).trim();
      if (remainder) {
        current.blocks.push({ ...block, markdown: remainder });
        claimRange(block.lines, "block", claim);
      } else {
        claimRange(block.lines, "section-label", claim);
      }
      continue;
    }

    if (!current) {
      current = { label: "", blocks: [], lines: { ...block.lines } };
      sections.push(current);
    }
    current.blocks.push(block);
    current.lines.end = Math.max(current.lines.end, block.lines.end);
    claimRange(block.lines, "block", claim);
  }

  return sections;
}

function buildSection(
  label: string,
  lines: string[],
  from: number,
  to: number,
  claim: (line: number, owner: ClaimOwner) => void,
): ParsedSection | null {
  const { blocks: raw, ignored } = tokenize(lines, from, to);
  ignored.forEach((line) => claim(line, "rule"));

  const blocks: Block[] = [];
  for (const block of raw) {
    if (isNavigationBlock(block)) {
      claimRange(block.lines, "group-nav", claim);
      continue;
    }
    claimRange(block.lines, "block", claim);
    blocks.push(block);
  }

  if (blocks.length === 0) return null;
  return {
    label,
    blocks,
    lines: { start: blocks[0].lines.start, end: blocks[blocks.length - 1].lines.end },
  };
}

function claimRange(
  range: LineRange,
  owner: ClaimOwner,
  claim: (line: number, owner: ClaimOwner) => void,
): void {
  for (let line = range.start; line <= range.end; line++) claim(line, owner);
}

function collectWikiLinks(text: string): string[] {
  const found = new Set<string>();
  for (const match of text.matchAll(WIKI_LINK)) found.add(match[1].trim());
  return [...found];
}

export { BOLD_LABEL, calloutVariantFor, sectionKindFor, slugify };
