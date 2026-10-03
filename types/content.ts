/**
 * Content model for the Learn Levels platform.
 *
 * Everything here is produced by parsing the source Markdown files in `content/<language>/`.
 * No educational content is authored in code — see docs/NON-NEGOTIABLE_ SOURCE CONTENT FIDELITY.md.
 */

export const LEVEL_IDS = ["foundation", "understand", "interview", "production"] as const;
export type LevelId = (typeof LEVEL_IDS)[number];

export type SourceFile =
  | "0_foundation.md"
  | "1_understand.md"
  | "2_interview.md"
  | "3_production.md";

/** 1-indexed, inclusive line span in the source file. */
export interface LineRange {
  start: number;
  end: number;
}

/** Traceability metadata: where in the source this piece of content came from. */
export interface ContentSource {
  file: SourceFile;
  /** e.g. ["2. Object-Oriented Programming", "2.6 Polymorphism", "Common interview questions"] */
  headingPath: string[];
  sourceId: string;
  lines: LineRange;
}

/* ------------------------------------------------------------------ blocks */

export type CalloutVariant =
  | "misconception"
  | "warning"
  | "best-practice"
  | "tip"
  | "note"
  | "terminology"
  | "quote";

export type TableAlign = "left" | "center" | "right" | null;

export interface BaseBlock {
  lines: LineRange;
}

export interface ParagraphBlock extends BaseBlock {
  type: "paragraph";
  markdown: string;
}

export interface CodeBlock extends BaseBlock {
  type: "code";
  lang: string;
  code: string;
}

export interface MermaidBlock extends BaseBlock {
  type: "mermaid";
  code: string;
}

export interface TableBlock extends BaseBlock {
  type: "table";
  head: string[];
  align: TableAlign[];
  rows: string[][];
}

export interface CalloutBlock extends BaseBlock {
  type: "callout";
  variant: CalloutVariant;
  /** Verbatim source label, e.g. "Common misconception". Empty for unlabelled quotes. */
  label: string;
  markdown: string;
}

export interface ListBlock extends BaseBlock {
  type: "list";
  ordered: boolean;
  items: string[];
}

/** An interview question, optionally with the parenthetical answer the source supplies. */
export interface QaBlock extends BaseBlock {
  type: "qa";
  question: string;
  answer?: string;
}

export type Block =
  | ParagraphBlock
  | CodeBlock
  | MermaidBlock
  | TableBlock
  | CalloutBlock
  | ListBlock
  | QaBlock;

/* ---------------------------------------------------------------- sections */

/**
 * Known section kinds get bespoke presentation. The source label vocabulary is open-ended
 * (the Understand file alone uses ~130 distinct labels), so anything unrecognised becomes
 * "generic" and renders with its verbatim source label — never dropped.
 */
export type SectionKind =
  // shared / foundation
  | "prose"
  | "definition"
  | "why-it-exists"
  | "example"
  | "syntax"
  | "terminology"
  | "relationships"
  // understand
  | "problem"
  | "predict"
  | "how-it-works"
  | "advantages"
  | "disadvantages"
  | "intuition"
  | "common-mistakes"
  | "complexity"
  // interview
  | "interview-explanation"
  | "questions"
  | "follow-ups"
  | "edge-cases"
  | "comparisons"
  | "confused-with"
  | "key-facts"
  // production
  | "best-practices"
  | "production-bugs"
  | "performance"
  | "scalability"
  | "security"
  | "debugging"
  | "testing"
  | "maintainability"
  | "anti-pattern"
  | "real-world"
  | "framework"
  | "monitoring"
  | "logging"
  | "memory"
  | "modern-recommendations"
  | "deprecated"
  | "readability"
  | "generic";

export interface Section {
  id: string;
  /** Verbatim label from the source. Empty string for Foundation's unlabelled prose. */
  label: string;
  kind: SectionKind;
  blocks: Block[];
  source: ContentSource;
}

export interface LevelContent {
  level: LevelId;
  sections: Section[];
  source: ContentSource;
  /** True when this level's content came from a merged/aliased source concept. */
  viaAlias?: boolean;
  /** Title of the source concept, when it differs from the canonical concept title. */
  sourceTitle?: string;
}

/* ---------------------------------------------------------------- concepts */

export interface ConceptRef {
  groupSlug: string;
  conceptSlug: string;
  title: string;
}

export interface Concept {
  id: string;
  /** e.g. "2.6" from the source heading. */
  number: string;
  title: string;
  slug: string;
  groupSlug: string;
  levels: Partial<Record<LevelId, LevelContent>>;
  /** Concepts referenced from this one via [[#...]] wiki-links in the source. */
  related: ConceptRef[];
}

export type GroupStatus = "complete" | "coming-next" | "coming";

export interface Group {
  id: string;
  /** e.g. "2" */
  number: string;
  title: string;
  slug: string;
  status: GroupStatus;
  concepts: Concept[];
}

/** A file's closing section (`## Where to Go Next`, `## Curriculum Complete`). */
export interface LevelEpilogue {
  title: string;
  blocks: Block[];
  source: ContentSource;
}

export interface LevelMeta {
  id: LevelId;
  index: number;
  title: string;
  /** Secondary identity label from the product spec: MAP / MECHANISM / PROVE / BUILD. */
  tag: string;
  tagline: string;
  question: string;
  file: SourceFile;
  /** The "Goal of this file" blockquote, verbatim from the source header. */
  goal: string;
  epilogue?: LevelEpilogue;
}

export interface Curriculum {
  language: string;
  title: string;
  groups: Group[];
  levels: LevelMeta[];
  stats: CurriculumStats;
  generatedAt: string;
}

export interface LevelStats {
  level: LevelId;
  groups: number;
  concepts: number;
  sections: number;
  codeBlocks: number;
  mermaidDiagrams: number;
  tables: number;
  callouts: number;
  questions: number;
  sourceLines: number;
  attributedLines: number;
}

export interface CurriculumStats {
  groupsComplete: number;
  groupsPlanned: number;
  concepts: number;
  perLevel: LevelStats[];
}

/* ---------------------------------------------------------------- skeleton */

/**
 * A compact projection of the curriculum — ids, titles and which levels exist — safe to send
 * to the client. The full model is several megabytes and stays on the server.
 */
export interface ConceptSkeleton {
  id: string;
  slug: string;
  title: string;
  number: string;
  levels: LevelId[];
}

export interface GroupSkeleton {
  slug: string;
  number: string;
  title: string;
  status: GroupStatus;
  concepts: ConceptSkeleton[];
}

export interface CurriculumSkeleton {
  language: string;
  title: string;
  groups: GroupSkeleton[];
  levels: LevelMeta[];
}

/* ------------------------------------------------------------------ search */

export interface SearchDoc {
  id: string;
  groupSlug: string;
  groupTitle: string;
  conceptSlug: string;
  conceptTitle: string;
  level: LevelId;
  sectionLabel: string;
  sectionKind: SectionKind;
  text: string;
}
