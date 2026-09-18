import type {
  Block,
  Concept,
  ConceptRef,
  Curriculum,
  CurriculumStats,
  Group,
  LevelContent,
  LevelId,
  LevelMeta,
  LevelStats,
  QaBlock,
  SearchDoc,
  Section,
} from "@/types/content";
import { LEVEL_IDS } from "@/types/content";
import { LEVEL_META, isQuestionSection, sectionKindFor, slugify } from "../registry";
import { languageConfig, sourceNumberFor, type LanguageConfig } from "../languages";
import type { ParsedConcept, ParsedFile, ParsedSection } from "./parse-file";

export { parseFile } from "./parse-file";
export type { ParsedFile } from "./parse-file";

export interface BuildResult {
  curriculum: Curriculum;
  searchDocs: SearchDoc[];
  files: Record<LevelId, ParsedFile>;
}

/**
 * Merges the four per-level parse results into one curriculum.
 *
 * The Foundation file is the canonical spine — it is the most granular, since a level may merge
 * two Foundation concepts into one section. Per-level lookup goes through that language's alias
 * table, so a merged source section can legitimately back two concepts.
 */
export function buildCurriculum(
  language: string,
  files: Record<LevelId, ParsedFile>,
): BuildResult {
  const config = languageConfig(language);
  const spine = files.foundation;
  const levels: LevelMeta[] = LEVEL_META.map((meta) => {
    const file = files[meta.id];
    return {
      ...meta,
      goal: file.goal,
      epilogue: file.epilogue
        ? {
            title: file.epilogue.title,
            blocks: file.epilogue.blocks,
            source: {
              file: file.file,
              headingPath: [file.epilogue.title],
              sourceId: `${meta.id}:epilogue`,
              lines: file.epilogue.lines,
            },
          }
        : undefined,
    };
  });

  const groups: Group[] = spine.toc.map((entry) => {
    const slug = slugify(entry.title);
    const parsedGroup = spine.groups.find((group) => group.number === entry.number);
    const concepts: Concept[] = (parsedGroup?.concepts ?? []).map((concept) =>
      buildConcept(concept, entry.number, slug, files, config),
    );
    return {
      id: `group-${entry.number}`,
      number: entry.number,
      title: entry.title,
      slug,
      status: entry.status,
      concepts,
    };
  });

  resolveRelated(groups, config);

  const searchDocs = buildSearchDocs(groups);
  const stats = buildStats(groups, files, levels);

  return {
    curriculum: {
      language,
      title: config?.title ?? language,
      groups,
      levels,
      stats,
      generatedAt: new Date().toISOString(),
    },
    searchDocs,
    files,
  };
}

/* ----------------------------------------------------------------- concepts */

function buildConcept(
  canonical: ParsedConcept,
  groupNumber: string,
  groupSlug: string,
  files: Record<LevelId, ParsedFile>,
  config: LanguageConfig | null,
): Concept {
  const slug = slugify(canonical.title);
  const levels: Partial<Record<LevelId, LevelContent>> = {};
  const wikiLinks = new Set(canonical.wikiLinks);

  for (const level of LEVEL_IDS) {
    const sourceNumber = sourceNumberFor(config, level, canonical.number);
    const parsedGroup = files[level].groups.find((group) => group.number === groupNumber);
    const parsed = parsedGroup?.concepts.find((concept) => concept.number === sourceNumber);
    if (!parsed) continue;

    parsed.wikiLinks.forEach((link) => wikiLinks.add(link));

    levels[level] = {
      level,
      sections: parsed.sections.map((section, index) =>
        buildSection(section, index, level, files[level], groupSlug, parsed),
      ),
      source: {
        file: files[level].file,
        headingPath: [
          `${groupNumber}. ${parsedGroup?.title ?? ""}`.trim(),
          `${parsed.number} ${parsed.title}`,
        ],
        sourceId: `${level}:${parsed.number}`,
        lines: parsed.lines,
      },
      viaAlias: sourceNumber !== canonical.number || parsed.title !== canonical.title,
      sourceTitle: parsed.title !== canonical.title ? parsed.title : undefined,
    };
  }

  return {
    id: `${groupSlug}/${slug}`,
    number: canonical.number,
    title: canonical.title,
    slug,
    groupSlug,
    levels,
    related: [...wikiLinks].map((link) => ({
      groupSlug: "",
      conceptSlug: "",
      title: link,
    })),
  };
}

function buildSection(
  section: ParsedSection,
  index: number,
  level: LevelId,
  file: ParsedFile,
  groupSlug: string,
  concept: ParsedConcept,
): Section {
  const kind = sectionKindFor(section.label);
  const blocks = isQuestionSection(kind) ? toQuestionBlocks(section.blocks) : section.blocks;
  const id = section.label ? slugify(section.label) : `part-${index + 1}`;

  return {
    id,
    label: section.label,
    kind,
    blocks,
    source: {
      file: file.file,
      headingPath: [
        `${concept.number} ${concept.title}`,
        ...(section.label ? [section.label] : []),
      ],
      sourceId: `${level}:${concept.number}:${id}`,
      lines: section.lines,
    },
  };
}

/**
 * Interview questions are written as `- "Question?" (Answer.)`. The answer, when present,
 * comes from the source — nothing is generated to fill an empty one.
 */
function toQuestionBlocks(blocks: Block[]): Block[] {
  return blocks.flatMap((block) => {
    if (block.type !== "list") return [block];
    return block.items.map((item): QaBlock => {
      const quoted = /^"(.*)"\s*(.*)$/s.exec(item.trim());
      if (!quoted) return { type: "qa", question: item, lines: block.lines };
      const remainder = quoted[2].trim();
      const answer = /^\((.*)\)$/s.exec(remainder);
      return {
        type: "qa",
        question: quoted[1].trim(),
        answer: answer ? answer[1].trim() : remainder || undefined,
        lines: block.lines,
      };
    });
  });
}

/* --------------------------------------------------- cross-concept resolution */

const MAX_RELATED = 8;

/**
 * Resolves concept relationships.
 *
 * The source's `[[#...]]` wiki-links only ever appear in tables of contents, so genuine
 * cross-references have to come from the prose itself: a concept is "related" when another
 * concept's title is mentioned in its text. This is navigation derived from the source, not
 * new educational content — nothing is asserted that the source does not already say.
 */
function resolveRelated(groups: Group[], config: LanguageConfig | null): void {
  const byNumber = new Map<string, { group: Group; concept: Concept }>();
  const byTitle = new Map<string, { group: Group; concept: Concept }>();
  const matchers: Array<{ pattern: RegExp; id: string }> = [];
  // Titles too generic to treat as a concept reference — they appear constantly as ordinary
  // prose ("...the methods of the class...") and would swamp the related list with noise.
  const generic = new Set(config?.genericTitles ?? []);

  for (const group of groups) {
    for (const concept of group.concepts) {
      byNumber.set(concept.number, { group, concept });
      byTitle.set(slugify(concept.title), { group, concept });
      if (generic.has(slugify(concept.title))) continue;
      for (const alias of titleAliases(concept.title)) {
        matchers.push({ pattern: new RegExp(`\\b${escapeRegExp(alias)}\\b`, "i"), id: concept.id });
      }
    }
  }

  const byId = new Map<string, { group: Group; concept: Concept }>();
  for (const group of groups) {
    for (const concept of group.concepts) byId.set(concept.id, { group, concept });
  }

  for (const group of groups) {
    for (const concept of group.concepts) {
      const resolved: ConceptRef[] = [];
      const seen = new Set<string>();

      // Explicit wiki-links first, so any that do exist keep their source ordering.
      for (const raw of concept.related) {
        const text = raw.title.trim();
        const numbered = /^(\d+\.\d+)\s+(.*)$/.exec(text);
        const hit = numbered
          ? byNumber.get(numbered[1])
          : byTitle.get(slugify(text.replace(/^\d+\.\s*/, "")));
        if (!hit || hit.concept.id === concept.id || seen.has(hit.concept.id)) continue;
        seen.add(hit.concept.id);
        resolved.push(toRef(hit.group, hit.concept));
      }

      const text = conceptText(concept);
      for (const matcher of matchers) {
        if (matcher.id === concept.id || seen.has(matcher.id)) continue;
        if (!matcher.pattern.test(text)) continue;
        const hit = byId.get(matcher.id);
        if (!hit) continue;
        seen.add(matcher.id);
        resolved.push(toRef(hit.group, hit.concept));
      }

      concept.related = resolved.slice(0, MAX_RELATED);
    }
  }
}

function toRef(group: Group, concept: Concept): ConceptRef {
  return { groupSlug: group.slug, conceptSlug: concept.slug, title: concept.title };
}

/** "The Object Class (equals, hashCode, toString)" -> ["Object Class", ...] */
function titleAliases(title: string): string[] {
  const aliases = new Set<string>();
  const withoutParens = title.replace(/\s*\([^)]*\)\s*/g, " ").trim();
  for (const base of [title, withoutParens]) {
    if (!base) continue;
    aliases.add(base);
    aliases.add(base.replace(/^The\s+/i, ""));
  }
  return [...aliases].filter((alias) => alias.length >= 5);
}

function conceptText(concept: Concept): string {
  return LEVEL_IDS.map((level) => {
    const content = concept.levels[level];
    if (!content) return "";
    return content.sections.map((section) => blocksToText(section.blocks)).join("\n");
  }).join("\n");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/* ------------------------------------------------------------------ search */

function buildSearchDocs(groups: Group[]): SearchDoc[] {
  const docs: SearchDoc[] = [];
  for (const group of groups) {
    for (const concept of group.concepts) {
      for (const level of LEVEL_IDS) {
        const content = concept.levels[level];
        if (!content) continue;
        for (const section of content.sections) {
          docs.push({
            id: `${concept.id}/${level}/${section.id}`,
            groupSlug: group.slug,
            groupTitle: group.title,
            conceptSlug: concept.slug,
            conceptTitle: concept.title,
            level,
            sectionLabel: section.label,
            sectionKind: section.kind,
            text: blocksToText(section.blocks),
          });
        }
      }
    }
  }
  return docs;
}

export function blocksToText(blocks: Block[]): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case "paragraph":
          return block.markdown;
        case "code":
        case "mermaid":
          return block.code;
        case "callout":
          return `${block.label} ${block.markdown}`;
        case "list":
          return block.items.join("\n");
        case "qa":
          return `${block.question}${block.answer ? ` ${block.answer}` : ""}`;
        case "table":
          return [block.head.join(" "), ...block.rows.map((row) => row.join(" "))].join("\n");
        default:
          return "";
      }
    })
    .join("\n")
    .trim();
}

/* ------------------------------------------------------------------- stats */

function buildStats(
  groups: Group[],
  files: Record<LevelId, ParsedFile>,
  levels: LevelMeta[],
): CurriculumStats {
  const perLevel: LevelStats[] = LEVEL_IDS.map((level) => {
    const stats: LevelStats = {
      level,
      groups: 0,
      concepts: 0,
      sections: 0,
      codeBlocks: 0,
      mermaidDiagrams: 0,
      tables: 0,
      callouts: 0,
      questions: 0,
      sourceLines: files[level].lines.filter((line) => line.trim() !== "").length,
      attributedLines: new Set(files[level].claims.map((claim) => claim.line)).size,
    };

    const groupsWithContent = new Set<string>();
    for (const group of groups) {
      for (const concept of group.concepts) {
        const content = concept.levels[level];
        if (!content) continue;
        groupsWithContent.add(group.slug);
        stats.concepts += 1;
        stats.sections += content.sections.length;
        for (const section of content.sections) countBlocks(section.blocks, stats);
      }
    }

    // The file's closing section is part of the model too, and carries its own blocks.
    const epilogue = levels.find((entry) => entry.id === level)?.epilogue;
    if (epilogue) countBlocks(epilogue.blocks, stats);

    stats.groups = groupsWithContent.size;
    return stats;
  });

  function countBlocks(blocks: Block[], stats: LevelStats) {
    for (const block of blocks) {
      if (block.type === "code") stats.codeBlocks += 1;
      if (block.type === "mermaid") stats.mermaidDiagrams += 1;
      if (block.type === "table") stats.tables += 1;
      if (block.type === "callout") stats.callouts += 1;
      if (block.type === "qa") stats.questions += 1;
    }
  }

  return {
    groupsComplete: groups.filter((group) => group.status === "complete").length,
    groupsPlanned: groups.filter((group) => group.status !== "complete").length,
    concepts: groups.reduce((total, group) => total + group.concepts.length, 0),
    perLevel,
  };
}
