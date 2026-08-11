import type { LevelId } from "@/types/content";

export interface LastVisited {
  groupSlug: string;
  conceptSlug: string;
  conceptTitle: string;
  groupTitle: string;
  level: LevelId;
  at: string;
}

export interface LanguageProgress {
  /** level -> concept id -> completed */
  levels: Record<LevelId, Record<string, true>>;
  lastVisited?: LastVisited;
}

export interface ProgressSnapshot {
  version: number;
  languages: Record<string, LanguageProgress>;
}

/**
 * Storage boundary. The app only ever talks to this interface, so swapping localStorage for a
 * backend later is one new adapter — no component changes.
 */
export interface ProgressStore {
  read(): Promise<ProgressSnapshot>;
  write(snapshot: ProgressSnapshot): Promise<void>;
  /** Notifies on external changes (another tab, or a future server push). */
  subscribe(listener: (snapshot: ProgressSnapshot) => void): () => void;
}

export const PROGRESS_VERSION = 1;

export function emptyLanguageProgress(): LanguageProgress {
  return {
    levels: { foundation: {}, understand: {}, interview: {}, production: {} },
  };
}

export function emptySnapshot(): ProgressSnapshot {
  return { version: PROGRESS_VERSION, languages: {} };
}
