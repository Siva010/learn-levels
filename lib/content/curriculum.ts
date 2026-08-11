import "server-only";

import type {
  Concept,
  Curriculum,
  CurriculumSkeleton,
  Group,
  LevelId,
  LevelMeta,
} from "@/types/content";
import { LEVEL_IDS } from "@/types/content";
import curriculumJson from "@/data/generated/java.curriculum.json";

/**
 * Server-side access to the generated content model.
 *
 * The JSON is produced by `npm run build:content` from content/<language>/*.md — the app never
 * parses Markdown at request time. Adding a language is a content drop plus an entry here.
 */
const CURRICULA: Record<string, Curriculum> = {
  java: curriculumJson as unknown as Curriculum,
};

export const DEFAULT_LANGUAGE = "java";

export function getLanguages(): string[] {
  return Object.keys(CURRICULA);
}

export function getCurriculum(language = DEFAULT_LANGUAGE): Curriculum | null {
  return CURRICULA[language] ?? null;
}

export function getGroup(language: string, groupSlug: string): Group | null {
  return getCurriculum(language)?.groups.find((group) => group.slug === groupSlug) ?? null;
}

export function getConcept(
  language: string,
  groupSlug: string,
  conceptSlug: string,
): { group: Group; concept: Concept } | null {
  const group = getGroup(language, groupSlug);
  const concept = group?.concepts.find((entry) => entry.slug === conceptSlug);
  return group && concept ? { group, concept } : null;
}

export function getLevelMeta(language: string, level: LevelId): LevelMeta | null {
  return getCurriculum(language)?.levels.find((entry) => entry.id === level) ?? null;
}

export function isLevelId(value: string): value is LevelId {
  return (LEVEL_IDS as readonly string[]).includes(value);
}

/** Every concept in curriculum order — the reading sequence within a level. */
export function getAllConcepts(
  language: string,
): Array<{ group: Group; concept: Concept }> {
  const curriculum = getCurriculum(language);
  if (!curriculum) return [];
  return curriculum.groups.flatMap((group) =>
    group.concepts.map((concept) => ({ group, concept })),
  );
}

export interface ConceptNeighbours {
  previous: { group: Group; concept: Concept } | null;
  next: { group: Group; concept: Concept } | null;
}

/** Previous/next concept at the same level, skipping concepts that level does not cover. */
export function getConceptNeighbours(
  language: string,
  conceptId: string,
  level: LevelId,
): ConceptNeighbours {
  const all = getAllConcepts(language).filter((entry) => entry.concept.levels[level]);
  const index = all.findIndex((entry) => entry.concept.id === conceptId);
  if (index < 0) return { previous: null, next: null };
  return {
    previous: index > 0 ? all[index - 1] : null,
    next: index < all.length - 1 ? all[index + 1] : null,
  };
}

/** The levels a concept actually has content for, in progression order. */
export function availableLevels(concept: Concept): LevelId[] {
  return LEVEL_IDS.filter((level) => Boolean(concept.levels[level]));
}

/**
 * Compact projection sent to client components (sidebar, dashboard, progress maths).
 * Roughly 10 KB, versus several megabytes for the full curriculum.
 */
export function getSkeleton(language = DEFAULT_LANGUAGE): CurriculumSkeleton | null {
  const curriculum = getCurriculum(language);
  if (!curriculum) return null;
  return {
    language: curriculum.language,
    title: curriculum.title,
    levels: curriculum.levels,
    groups: curriculum.groups.map((group) => ({
      slug: group.slug,
      number: group.number,
      title: group.title,
      status: group.status,
      concepts: group.concepts.map((concept) => ({
        id: concept.id,
        slug: concept.slug,
        title: concept.title,
        number: concept.number,
        levels: availableLevels(concept),
      })),
    })),
  };
}

export function conceptHref(
  language: string,
  groupSlug: string,
  conceptSlug: string,
  level?: LevelId,
): string {
  const base = `/${language}/${groupSlug}/${conceptSlug}`;
  return level ? `${base}/${level}` : base;
}
