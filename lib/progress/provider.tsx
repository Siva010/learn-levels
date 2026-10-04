"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CurriculumSkeleton, LevelId, TrackSkeleton } from "@/types/content";
import { createLocalProgressStore } from "./local-store";
import {
  emptyLanguageProgress,
  emptySnapshot,
  type LanguageProgress,
  type LastVisited,
  type ProgressSnapshot,
  type ProgressStore,
} from "./types";

interface ProgressContextValue {
  /** The part this page belongs to. */
  skeleton: CurriculumSkeleton;
  /** Every part of the curriculum, in reading order — one part for a standalone language. */
  track: TrackSkeleton;
  /** Progress for this page's part. */
  progress: LanguageProgress;
  /** Progress for any part of the track. */
  progressFor: (language: string) => LanguageProgress;
  /** False until the store has been read — render progress UI only after this flips. */
  ready: boolean;
  isComplete: (level: LevelId, conceptId: string) => boolean;
  setComplete: (level: LevelId, conceptId: string, complete: boolean) => void;
  toggleComplete: (level: LevelId, conceptId: string) => void;
  recordVisit: (visit: Omit<LastVisited, "at">) => void;
  /** Clears progress for every part of the track. */
  reset: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({
  track,
  language,
  children,
  store,
}: {
  track: TrackSkeleton;
  /** The part this page belongs to; must be one of `track.parts`. */
  language: string;
  children: React.ReactNode;
  store?: ProgressStore;
}) {
  const storeRef = useRef<ProgressStore>(store ?? createLocalProgressStore());
  const [snapshot, setSnapshot] = useState<ProgressSnapshot>(emptySnapshot);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    storeRef.current.read().then((loaded) => {
      if (!active) return;
      setSnapshot(loaded);
      setReady(true);
    });
    const unsubscribe = storeRef.current.subscribe((external) => setSnapshot(external));
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const skeleton = track.parts.find((part) => part.language === language) ?? track.parts[0];
  const progress = snapshot.languages[language] ?? emptyLanguageProgress();

  // Each part keeps its own progress record, so a track never changes what is stored.
  const updateLanguages = useCallback(
    (languages: string[], mutate: (draft: LanguageProgress) => LanguageProgress) => {
      setSnapshot((current) => {
        const updated = { ...current.languages };
        for (const id of languages) {
          updated[id] = mutate(structuredClone(current.languages[id] ?? emptyLanguageProgress()));
        }
        const next: ProgressSnapshot = { ...current, languages: updated };
        void storeRef.current.write(next);
        return next;
      });
    },
    [],
  );

  const update = useCallback(
    (mutate: (draft: LanguageProgress) => LanguageProgress) => updateLanguages([language], mutate),
    [language, updateLanguages],
  );

  const value = useMemo<ProgressContextValue>(
    () => ({
      skeleton,
      track,
      progress,
      progressFor: (id) => snapshot.languages[id] ?? emptyLanguageProgress(),
      ready,
      isComplete: (level, conceptId) => Boolean(progress.levels?.[level]?.[conceptId]),
      setComplete: (level, conceptId, complete) =>
        update((draft) => {
          const levels = { ...draft.levels, [level]: { ...draft.levels[level] } };
          if (complete) levels[level][conceptId] = true;
          else delete levels[level][conceptId];
          return { ...draft, levels };
        }),
      toggleComplete: (level, conceptId) =>
        update((draft) => {
          const levels = { ...draft.levels, [level]: { ...draft.levels[level] } };
          if (levels[level][conceptId]) delete levels[level][conceptId];
          else levels[level][conceptId] = true;
          return { ...draft, levels };
        }),
      recordVisit: (visit) =>
        update((draft) => ({
          ...draft,
          lastVisited: { ...visit, at: new Date().toISOString() },
        })),
      reset: () =>
        updateLanguages(
          track.parts.map((part) => part.language),
          () => emptyLanguageProgress(),
        ),
    }),
    [progress, ready, skeleton, snapshot.languages, track, update, updateLanguages],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const context = useContext(ProgressContext);
  if (!context) throw new Error("useProgress must be used inside <ProgressProvider>");
  return context;
}
