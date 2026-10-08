import type { LevelId } from "@/types/content";

/**
 * The language registry — the one place a new language is declared.
 *
 * Everything else about a language lives in `content/<id>/`: four Markdown files, parsed by the
 * same pipeline. The entries here are the parts that cannot be derived from the source text —
 * the display title, the home-page blurb, and two per-language parser inputs (concept aliases
 * and the generic-title blocklist) that depend on how that language's source material is written.
 */
export interface LanguageConfig {
  id: string;
  /** Curriculum title shown in breadcrumbs, the sidebar and page metadata. */
  title: string;
  /** One line for the home-page language picker. */
  blurb: string;
  /**
   * Levels whose source concept numbering drifts from the Foundation spine.
   * Keys are canonical (Foundation) concept numbers; values are that level's source number.
   * Omit entirely when all four files align — which is the normal case.
   */
  conceptAliases?: Partial<Record<LevelId, Record<string, string>>>;
  /**
   * Concept titles too generic to treat as a cross-reference. They appear constantly as ordinary
   * prose ("...the methods of the class..."), and without this they swamp the related list.
   * Values are slugs.
   */
  genericTitles?: string[];
}

export const LANGUAGES: LanguageConfig[] = [
  {
    id: "java",
    title: "Java",
    blurb: "The JVM, OOP, collections, concurrency and the production traps behind them.",
    // All four Java files are numbered identically, so no alias table is needed. (Group 1 used to
    // merge two Foundation concepts at Interview and Production; it was realigned in October 2026.)
    genericTitles: [
      "arrays",
      "methods",
      "operators",
      "control-flow-statements",
      "variables-and-data-types",
      "packages-and-imports",
      "classes-and-objects",
      "what-is-java",
      "strings",
      "what-are-generics",
      "what-is-a-stream",
      "what-is-an-exception",
      "what-is-functional-programming-in-java",
    ],
  },
  {
    id: "python",
    title: "Python",
    blurb: "The object model, generators, decorators, asyncio, CPython internals and typing.",
    // All four Python files are numbered identically, so no alias table is needed.
    genericTitles: [
      "what-is-python",
      "variables-names-and-objects",
      "operators-and-expressions",
      "control-flow-statements",
      "functions-and-parameters",
      "lists",
      "dictionaries",
      "sets-and-frozensets",
      "strings-and-text",
      "tuples-and-namedtuples",
      "modules-and-the-import-system",
      "classes-and-instances",
      "exceptions-and-the-exception-hierarchy",
      "type-hints-and-annotations",
    ],
  },
  {
    id: "spring-boot",
    title: "Spring Boot",
    blurb:
      "Dependency injection, REST APIs, JPA, transactions, security, testing and the production concerns behind them.",
    // All four Spring Boot files are numbered identically, so no alias table is needed.
    // Assumes the Java curriculum as a prerequisite rather than repeating it.
    // Each of these titles also appears as an ordinary word in other contexts, for example
    // "context propagation" in tracing or "metric aggregation" in monitoring.
    genericTitles: ["logging", "constraints", "profiles", "propagation", "aggregation"],
  },
];

const BY_ID = new Map(LANGUAGES.map((language) => [language.id, language]));

export const DEFAULT_LANGUAGE = LANGUAGES[0].id;

export function languageIds(): string[] {
  return LANGUAGES.map((language) => language.id);
}

export function languageConfig(id: string): LanguageConfig | null {
  return BY_ID.get(id) ?? null;
}

/**
 * A track is what the site presents as one curriculum: one or more languages read in order.
 *
 * Each part keeps its own content, URLs and progress record — a track changes only how the parts
 * are navigated, searched and summarised, so a learner moves from the last concept of one part
 * straight into the first concept of the next. A language not listed in a track stands alone.
 */
export interface TrackConfig {
  id: string;
  /** Shown wherever the site names the curriculum: header, dashboard, breadcrumbs. */
  title: string;
  blurb: string;
  /** Language ids in reading order. */
  parts: string[];
}

const MULTI_PART_TRACKS: TrackConfig[] = [
  {
    id: "java-spring-boot",
    title: "Java + Spring Boot",
    blurb:
      "The language first, then the framework built on it — one path from the JVM to production Spring services.",
    parts: ["java", "spring-boot"],
  },
];

/** The track a language belongs to: its multi-part track, or a track of its own. */
export function trackFor(languageId: string): TrackConfig {
  const shared = MULTI_PART_TRACKS.find((track) => track.parts.includes(languageId));
  if (shared) return shared;
  const config = BY_ID.get(languageId);
  return {
    id: languageId,
    title: config?.title ?? languageId,
    blurb: config?.blurb ?? "",
    parts: [languageId],
  };
}

/** Every track once, in the registry order of its first part. */
export function trackConfigs(): TrackConfig[] {
  const seen = new Map<string, TrackConfig>();
  for (const language of LANGUAGES) {
    const track = trackFor(language.id);
    if (!seen.has(track.id)) seen.set(track.id, track);
  }
  return [...seen.values()];
}

/** Resolves a canonical concept number to the source concept number for a given level. */
export function sourceNumberFor(
  config: LanguageConfig | null,
  level: LevelId,
  canonicalNumber: string,
): string {
  return config?.conceptAliases?.[level]?.[canonicalNumber] ?? canonicalNumber;
}
