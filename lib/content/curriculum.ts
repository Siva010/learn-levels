import "server-only";

import type {
  Concept,
  Curriculum,
  CurriculumSkeleton,
  Group,
  LevelId,
  LevelMeta,
  TrackSkeleton,
} from "@/types/content";
import { LEVEL_IDS } from "@/types/content";
import {
  DEFAULT_LANGUAGE,
  LANGUAGES,
  languageIds,
  trackConfigs,
  trackFor,
  type TrackConfig,
} from "./languages";
import { partAnchor } from "@/lib/tracks";
import javaJson from "@/data/generated/java.curriculum.json";
import pythonJson from "@/data/generated/python.curriculum.json";
import springBootJson from "@/data/generated/spring-boot.curriculum.json";

/**
 * Server-side access to the generated content model.
 *
 * The JSON is produced by `npm run build:content` from content/<language>/*.md — the app never
 * parses Markdown at request time. Adding a language is a content drop, an entry in
 * lib/content/languages.ts, and one static import here (bundlers need a literal path).
 */
const CURRICULA: Record<string, Curriculum> = {
  java: javaJson as unknown as Curriculum,
  python: pythonJson as unknown as Curriculum,
  "spring-boot": springBootJson as unknown as Curriculum,
};

export { DEFAULT_LANGUAGE, LANGUAGES };

/** Registry order, limited to languages whose model is actually generated. */
export function getLanguages(): string[] {
  return languageIds().filter((language) => language in CURRICULA);
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

/** A concept located within its track: which part it is in, as well as where in that part. */
export interface TrackConceptRef {
  language: string;
  partTitle: string;
  group: Group;
  concept: Concept;
}

export interface ConceptNeighbours {
  previous: TrackConceptRef | null;
  next: TrackConceptRef | null;
}

/**
 * Previous/next concept at the same level, across the whole track — so the last concept of one
 * part leads straight into the first concept of the next. Concepts a level does not cover are
 * skipped.
 */
export function getConceptNeighbours(
  language: string,
  conceptId: string,
  level: LevelId,
): ConceptNeighbours {
  const all = getTrack(language).parts.flatMap((part) => {
    const curriculum = getCurriculum(part);
    if (!curriculum) return [];
    return getAllConcepts(part)
      .filter((entry) => entry.concept.levels[level])
      .map((entry) => ({ language: part, partTitle: curriculum.title, ...entry }));
  });
  const index = all.findIndex(
    (entry) => entry.language === language && entry.concept.id === conceptId,
  );
  if (index < 0) return { previous: null, next: null };
  return {
    previous: index > 0 ? all[index - 1] : null,
    next: index < all.length - 1 ? all[index + 1] : null,
  };
}

/** A topic group located within its track. */
export interface TrackGroupRef {
  language: string;
  partTitle: string;
  group: Group;
}

/** Previous/next written topic group across the whole track. */
export function getGroupNeighbours(
  language: string,
  groupSlug: string,
): { previous: TrackGroupRef | null; next: TrackGroupRef | null } {
  const all = getTrack(language).parts.flatMap((part) => {
    const curriculum = getCurriculum(part);
    if (!curriculum) return [];
    return curriculum.groups
      .filter((group) => group.concepts.length > 0)
      .map((group) => ({ language: part, partTitle: curriculum.title, group }));
  });
  const index = all.findIndex(
    (entry) => entry.language === language && entry.group.slug === groupSlug,
  );
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

/** The track a language belongs to, limited to parts whose model is generated. */
export function getTrack(language: string): TrackConfig {
  const track = trackFor(language);
  return { ...track, parts: track.parts.filter((part) => part in CURRICULA) };
}

/** Every track with at least one generated part, in registry order. */
export function getTracks(): TrackConfig[] {
  return trackConfigs()
    .map((track) => ({ ...track, parts: track.parts.filter((part) => part in CURRICULA) }))
    .filter((track) => track.parts.length > 0);
}

/** The skeletons of every part of a language's track, in reading order, for client components. */
export function getTrackSkeleton(language: string): TrackSkeleton | null {
  const track = getTrack(language);
  const parts = track.parts.flatMap((part) => {
    const skeleton = getSkeleton(part);
    return skeleton ? [skeleton] : [];
  });
  return parts.length > 0 ? { id: track.id, title: track.title, parts } : null;
}

/**
 * The leading breadcrumbs for any page inside a part: the track, then — when the track has several
 * parts — the part itself, linking to its section of the shared dashboard.
 */
export function trackCrumbs(language: string): Array<{ label: string; href: string }> {
  const track = getTrack(language);
  const title = getCurriculum(language)?.title ?? language;
  if (track.parts.length <= 1) return [{ label: title, href: `/${language}` }];
  return [
    { label: track.title, href: `/${track.parts[0]}` },
    { label: title, href: `/${language}#${partAnchor(language)}` },
  ];
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
