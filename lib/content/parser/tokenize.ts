import type { Block, TableAlign } from "@/types/content";
import { calloutVariantFor } from "../registry";

export interface TokenizeResult {
  blocks: Block[];
  /** 1-indexed lines deliberately not rendered (horizontal rules). */
  ignored: number[];
}

const FENCE = /^\s*```(\S*)\s*$/;
const HR = /^\s*---+\s*$/;
const UNORDERED_ITEM = /^[-*]\s+(.*)$/;
const ORDERED_ITEM = /^(\d+)\.\s+(.*)$/;
const CALLOUT_LABEL = /^(\p{Extended_Pictographic}️?)?\s*\*\*(.+?):\*\*\s*/u;
/** A line opening with `**Label:**` always starts a new section, never continues a paragraph. */
const INLINE_LABEL = /^\*\*[^*\n]+?:\*\*/;

/**
 * Turns a slice of Markdown lines into content blocks.
 *
 * `lines` is the full file (so line numbers stay absolute); `from`/`to` are 0-indexed and
 * exclusive of `to`. Every non-blank line in the range ends up inside a block's line span or
 * in `ignored` — that invariant is what the content validator checks.
 */
export function tokenize(lines: string[], from: number, to: number): TokenizeResult {
  const blocks: Block[] = [];
  const ignored: number[] = [];
  let i = from;

  const lineNo = (index: number) => index + 1;

  while (i < to) {
    const raw = lines[i];

    if (raw.trim() === "") {
      i++;
      continue;
    }

    // ---------------------------------------------------------------- fences
    const fence = FENCE.exec(raw);
    if (fence) {
      const lang = fence[1] || "text";
      const start = i;
      i++;
      const body: string[] = [];
      while (i < to && !FENCE.test(lines[i])) {
        body.push(lines[i]);
        i++;
      }
      if (i < to) i++; // closing fence
      const span = { start: lineNo(start), end: lineNo(i - 1) };
      const code = body.join("\n").replace(/\s+$/, "");
      blocks.push(
        lang === "mermaid"
          ? { type: "mermaid", code, lines: span }
          : { type: "code", lang, code, lines: span },
      );
      continue;
    }

    // ------------------------------------------------------------ horizontal
    if (HR.test(raw)) {
      ignored.push(lineNo(i));
      i++;
      continue;
    }

    // ----------------------------------------------------------------- table
    if (raw.trimStart().startsWith("|") && i + 1 < to && isAlignmentRow(lines[i + 1])) {
      const start = i;
      const head = splitRow(raw);
      const align = parseAlignment(lines[i + 1]);
      i += 2;
      const rows: string[][] = [];
      while (i < to && lines[i].trimStart().startsWith("|")) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      blocks.push({
        type: "table",
        head,
        align,
        rows,
        lines: { start: lineNo(start), end: lineNo(i - 1) },
      });
      continue;
    }

    // ------------------------------------------------------------- blockquote
    if (raw.trimStart().startsWith(">")) {
      const start = i;
      const body: string[] = [];
      while (i < to && lines[i].trimStart().startsWith(">")) {
        body.push(lines[i].trimStart().replace(/^>\s?/, ""));
        i++;
      }
      const text = body.join("\n").trim();
      const match = CALLOUT_LABEL.exec(text);
      const label = match ? match[2].trim() : "";
      blocks.push({
        type: "callout",
        variant: calloutVariantFor(label),
        label,
        markdown: match ? text.slice(match[0].length).trim() : text,
        lines: { start: lineNo(start), end: lineNo(i - 1) },
      });
      continue;
    }

    // ------------------------------------------------------------------ list
    if (UNORDERED_ITEM.test(raw) || ORDERED_ITEM.test(raw)) {
      const ordered = ORDERED_ITEM.test(raw);
      const start = i;
      const items: string[] = [];
      while (i < to) {
        const line = lines[i];
        const unordered = UNORDERED_ITEM.exec(line);
        const numbered = ORDERED_ITEM.exec(line);
        if (!ordered && unordered) items.push(unordered[1].trim());
        else if (ordered && numbered) items.push(numbered[2].trim());
        else if (line.trim() !== "" && /^\s+\S/.test(line) && items.length > 0) {
          // continuation of the previous item
          items[items.length - 1] += ` ${line.trim()}`;
        } else break;
        i++;
      }
      blocks.push({
        type: "list",
        ordered,
        items,
        lines: { start: lineNo(start), end: lineNo(i - 1) },
      });
      continue;
    }

    // ------------------------------------------------------------- paragraph
    const start = i;
    const body: string[] = [lines[i].trim()];
    i++;
    while (i < to && lines[i].trim() !== "" && !startsNewBlock(lines, i, to)) {
      body.push(lines[i].trim());
      i++;
    }
    blocks.push({
      type: "paragraph",
      markdown: body.join("\n"),
      lines: { start: lineNo(start), end: lineNo(i - 1) },
    });
  }

  return { blocks, ignored };
}

function startsNewBlock(lines: string[], index: number, to: number): boolean {
  const line = lines[index];
  if (FENCE.test(line) || HR.test(line)) return true;
  if (line.trimStart().startsWith(">")) return true;
  if (UNORDERED_ITEM.test(line) || ORDERED_ITEM.test(line)) return true;
  if (INLINE_LABEL.test(line.trimStart())) return true;
  if (line.trimStart().startsWith("|") && index + 1 < to && isAlignmentRow(lines[index + 1])) {
    return true;
  }
  return false;
}

function isAlignmentRow(line: string): boolean {
  if (!line) return false;
  const trimmed = line.trim();
  if (!trimmed.startsWith("|")) return false;
  const cells = splitRow(trimmed);
  return cells.length > 0 && cells.every((cell) => /^:?-{1,}:?$/.test(cell.trim()));
}

function parseAlignment(line: string): TableAlign[] {
  return splitRow(line).map((cell) => {
    const value = cell.trim();
    const left = value.startsWith(":");
    const right = value.endsWith(":");
    if (left && right) return "center";
    if (right) return "right";
    if (left) return "left";
    return null;
  });
}

/** Splits a table row, respecting escaped pipes and pipes inside inline code spans. */
export function splitRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  const cells: string[] = [];
  let current = "";
  let inCode = false;

  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i];
    if (char === "\\" && trimmed[i + 1] === "|") {
      current += "|";
      i++;
      continue;
    }
    if (char === "`") inCode = !inCode;
    if (char === "|" && !inCode) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current.trim());
  return cells;
}
