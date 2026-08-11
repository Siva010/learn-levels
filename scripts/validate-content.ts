/**
 * Content integrity check.
 *
 * Two independent guarantees:
 *   1. Line attribution — every non-blank line of every source file is claimed by exactly one
 *      piece of the normalized model. Unclaimed lines mean content was silently dropped.
 *   2. Raw counts — code fences, tables, callouts and questions counted directly off the
 *      Markdown (fence-aware) must match what the model emitted.
 *
 * Run with `npm run validate-content`. Exits non-zero on any loss.
 */
import { LEVEL_IDS, type LevelId } from "../types/content";
import { loadLanguage } from "../lib/content/load";
import type { ParsedFile } from "../lib/content/parser";

interface RawCounts {
  codeFences: number;
  mermaidFences: number;
  tables: number;
  callouts: number;
  questionItems: number;
}

interface Problem {
  level: LevelId;
  kind: string;
  detail: string;
}

const problems: Problem[] = [];

function main() {
  const language = process.argv[2] ?? "java";
  const { curriculum, files, searchDocs } = loadLanguage(language);

  console.log("Content Integrity Check");
  console.log("────────────────────────────────────────────────────────────");
  console.log(`Source: content/${language}/  (${curriculum.language})`);
  console.log(
    `Curriculum: ${curriculum.stats.groupsComplete} groups complete, ` +
      `${curriculum.stats.groupsPlanned} planned, ${curriculum.stats.concepts} concepts\n`,
  );

  for (const level of LEVEL_IDS) {
    const file = files[level];
    const raw = countRaw(file.lines);
    const stats = curriculum.stats.perLevel.find((entry) => entry.level === level)!;
    const attribution = checkAttribution(file, level);

    console.log(`${file.file}  (${level})`);
    line("groups", stats.groups, file.toc.filter((entry) => entry.status === "complete").length, level, "groups");
    line("concepts", stats.concepts, dedupedConcepts(file), level, "concepts", true);
    line("code blocks", stats.codeBlocks, raw.codeFences, level, "code blocks", true);
    line("mermaid diagrams", stats.mermaidDiagrams, raw.mermaidFences, level, "diagrams", true);
    line("tables", stats.tables, raw.tables, level, "tables", true);
    line("callouts", stats.callouts, raw.callouts, level, "callouts", true);
    if (raw.questionItems > 0) {
      line("questions", stats.questions, raw.questionItems, level, "questions", true);
    }
    line(
      "attributed lines",
      attribution.attributed,
      attribution.nonBlank,
      level,
      "line attribution",
    );
    console.log(`  sections           ${stats.sections}`);

    if (attribution.unclaimed.length > 0) {
      console.log(`  ✗ ${attribution.unclaimed.length} unattributed lines:`);
      for (const entry of attribution.unclaimed.slice(0, 15)) {
        console.log(`      ${file.file}:${entry.line}  ${truncate(entry.text)}`);
      }
      if (attribution.unclaimed.length > 15) {
        console.log(`      … ${attribution.unclaimed.length - 15} more`);
      }
    }
    console.log();
  }

  const unresolved = countUnresolvedLinks(curriculum);
  const aliased = countAliased(curriculum);
  console.log(`Search documents: ${searchDocs.length}`);
  console.log(`Unresolved [[wiki-links]]: ${unresolved}`);
  console.log(
    `Aliased level views: ${aliased} (Group 1 merges two Foundation concepts into one ` +
      `Interview/Production section — see CONCEPT_ALIASES in lib/content/registry.ts)\n`,
  );

  if (problems.length === 0) {
    console.log("✓ CONTENT INTEGRITY PASSED");
    return;
  }

  console.log(`✗ CONTENT INTEGRITY FAILED — ${problems.length} discrepancies`);
  for (const problem of problems) {
    console.log(`  [${problem.level}] ${problem.kind}: ${problem.detail}`);
  }
  process.exitCode = 1;
}

/* ------------------------------------------------------------------ checks */

/**
 * Concepts counted once each. Aliased levels (Group 1 in Interview/Production) legitimately
 * back two canonical concepts, so the model's count is compared against the deduped source.
 */
function dedupedConcepts(file: ParsedFile): number {
  return file.groups.reduce((total, group) => total + group.concepts.length, 0);
}

function checkAttribution(file: ParsedFile, level: LevelId) {
  const claimed = new Set(file.claims.map((claim) => claim.line));
  const unclaimed: Array<{ line: number; text: string }> = [];
  let nonBlank = 0;

  file.lines.forEach((text, index) => {
    if (text.trim() === "") return;
    nonBlank += 1;
    if (!claimed.has(index + 1)) unclaimed.push({ line: index + 1, text });
  });

  if (unclaimed.length > 0) {
    problems.push({
      level,
      kind: "content loss",
      detail: `${unclaimed.length} source lines are not represented in the model`,
    });
  }

  return { nonBlank, attributed: nonBlank - unclaimed.length, unclaimed };
}

/**
 * Counts constructs straight off the Markdown, ignoring anything inside a code fence.
 * Starts at the first `## ` heading so the file preamble (the "Goal of this file" and
 * "Build status" blockquotes, which are file metadata rather than educational callouts)
 * is not counted.
 */
function countRaw(lines: string[]): RawCounts {
  const counts: RawCounts = {
    codeFences: 0,
    mermaidFences: 0,
    tables: 0,
    callouts: 0,
    questionItems: 0,
  };

  let inFence = false;
  let inCallout = false;
  let inTable = false;
  let questionSection = false;

  const bodyStart = lines.findIndex((line) => /^##\s+\S/.test(line));

  for (let i = bodyStart < 0 ? lines.length : bodyStart; i < lines.length; i++) {
    const line = lines[i];
    const fence = /^\s*```(\S*)\s*$/.exec(line);

    if (fence) {
      if (!inFence) {
        if (fence[1] === "mermaid") counts.mermaidFences += 1;
        else counts.codeFences += 1;
      }
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const isQuote = line.trimStart().startsWith(">");
    if (isQuote && !inCallout) counts.callouts += 1;
    inCallout = isQuote;

    const isRow = line.trimStart().startsWith("|");
    if (isRow && !inTable) counts.tables += 1;
    inTable = isRow;

    if (/^####\s+/.test(line)) {
      questionSection = /^####\s+(Common interview questions|Follow-up questions)\s*$/.test(line);
    } else if (/^###?\s+/.test(line)) {
      questionSection = false;
    }
    if (questionSection && /^[-*]\s+/.test(line)) counts.questionItems += 1;
  }

  return counts;
}

function countAliased(curriculum: ReturnType<typeof loadLanguage>["curriculum"]): number {
  let aliased = 0;
  for (const group of curriculum.groups) {
    for (const concept of group.concepts) {
      for (const level of LEVEL_IDS) {
        if (concept.levels[level]?.viaAlias) aliased += 1;
      }
    }
  }
  return aliased;
}

function countUnresolvedLinks(curriculum: ReturnType<typeof loadLanguage>["curriculum"]): number {
  let unresolved = 0;
  for (const group of curriculum.groups) {
    for (const concept of group.concepts) {
      unresolved += concept.related.filter((ref) => !ref.conceptSlug).length;
    }
  }
  return unresolved;
}

/* ------------------------------------------------------------------ output */

function line(
  label: string,
  actual: number,
  expected: number,
  level: LevelId,
  kind: string,
  /** Aliased Group 1 concepts duplicate their source content, so the model may exceed source. */
  allowDuplicates = false,
) {
  const ok = allowDuplicates ? actual >= expected : actual === expected;
  const mark = ok ? "✓" : "✗";
  const suffix = actual === expected ? "" : `  (source: ${expected})`;
  console.log(`  ${mark} ${label.padEnd(18)} ${actual}${suffix}`);
  if (!ok) {
    problems.push({ level, kind, detail: `model has ${actual}, source has ${expected}` });
  }
}

function truncate(text: string, max = 90): string {
  const clean = text.trim();
  return clean.length > max ? `${clean.slice(0, max)}…` : clean;
}

main();
