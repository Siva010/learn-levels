import type {
  CurriculumSkeleton,
  GroupSkeleton,
  LevelId,
  ConceptSkeleton,
} from "@/types/content";
import { LEVEL_IDS } from "@/types/content";
import type { LanguageProgress } from "./types";

export interface Ratio {
  completed: number;
  total: number;
  percent: number;
}

const EMPTY: Ratio = { completed: 0, total: 0, percent: 0 };

function ratio(completed: number, total: number): Ratio {
  return { completed, total, percent: total === 0 ? 0 : (completed / total) * 100 };
}

export function isComplete(
  progress: LanguageProgress | undefined,
  level: LevelId,
  conceptId: string,
): boolean {
  return Boolean(progress?.levels?.[level]?.[conceptId]);
}

/** Progress for one level within one group. Concepts a level doesn't cover aren't counted. */
export function groupLevelRatio(
  group: GroupSkeleton,
  progress: LanguageProgress | undefined,
  level: LevelId,
): Ratio {
  const applicable = group.concepts.filter((concept) => concept.levels.includes(level));
  if (applicable.length === 0) return EMPTY;
  const done = applicable.filter((concept) => isComplete(progress, level, concept.id)).length;
  return ratio(done, applicable.length);
}

/** Progress for one level across the whole curriculum. */
export function levelRatio(
  skeleton: CurriculumSkeleton,
  progress: LanguageProgress | undefined,
  level: LevelId,
): Ratio {
  let completed = 0;
  let total = 0;
  for (const group of skeleton.groups) {
    const entry = groupLevelRatio(group, progress, level);
    completed += entry.completed;
    total += entry.total;
  }
  return ratio(completed, total);
}

/** A group's progress across all four levels combined. */
export function groupRatio(
  group: GroupSkeleton,
  progress: LanguageProgress | undefined,
): Ratio {
  let completed = 0;
  let total = 0;
  for (const level of LEVEL_IDS) {
    const entry = groupLevelRatio(group, progress, level);
    completed += entry.completed;
    total += entry.total;
  }
  return ratio(completed, total);
}

/** A single concept's mastery across the levels it has. */
export function conceptRatio(
  concept: ConceptSkeleton,
  progress: LanguageProgress | undefined,
): Ratio {
  const done = concept.levels.filter((level) => isComplete(progress, level, concept.id)).length;
  return ratio(done, concept.levels.length);
}

/** Overall mastery: every concept-level pair that exists, weighted equally. */
export function overallRatio(
  skeleton: CurriculumSkeleton,
  progress: LanguageProgress | undefined,
): Ratio {
  let completed = 0;
  let total = 0;
  for (const level of LEVEL_IDS) {
    const entry = levelRatio(skeleton, progress, level);
    completed += entry.completed;
    total += entry.total;
  }
  return ratio(completed, total);
}

export interface NextUp {
  group: GroupSkeleton;
  concept: ConceptSkeleton;
  level: LevelId;
}

/**
 * What to suggest next: resume the last visited position if it is still incomplete, otherwise
 * the first incomplete concept in curriculum order, level by level.
 */
export function findNextUp(
  skeleton: CurriculumSkeleton,
  progress: LanguageProgress | undefined,
): NextUp | null {
  const last = progress?.lastVisited;
  if (last) {
    const group = skeleton.groups.find((entry) => entry.slug === last.groupSlug);
    const concept = group?.concepts.find((entry) => entry.slug === last.conceptSlug);
    if (group && concept && !isComplete(progress, last.level, concept.id)) {
      return { group, concept, level: last.level };
    }
  }

  for (const level of LEVEL_IDS) {
    for (const group of skeleton.groups) {
      for (const concept of group.concepts) {
        if (!concept.levels.includes(level)) continue;
        if (!isComplete(progress, level, concept.id)) return { group, concept, level };
      }
    }
  }
  return null;
}

/** The level a concept page should open at: the first one not yet completed. */
export function recommendedLevel(
  concept: ConceptSkeleton,
  progress: LanguageProgress | undefined,
): LevelId {
  const next = concept.levels.find((level) => !isComplete(progress, level, concept.id));
  return next ?? concept.levels[0] ?? "foundation";
}
