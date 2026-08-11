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
import type { CurriculumSkeleton, LevelId } from "@/types/content";
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
  skeleton: CurriculumSkeleton;
  progress: LanguageProgress;
  /** False until the store has been read — render progress UI only after this flips. */
  ready: boolean;
  isComplete: (level: LevelId, conceptId: string) => boolean;
  setComplete: (level: LevelId, conceptId: string, complete: boolean) => void;
  toggleComplete: (level: LevelId, conceptId: string) => void;
  recordVisit: (visit: Omit<LastVisited, "at">) => void;
  reset: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({
  skeleton,
  children,
  store,
}: {
  skeleton: CurriculumSkeleton;
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

  const language = skeleton.language;
  const progress = snapshot.languages[language] ?? emptyLanguageProgress();

  const update = useCallback(
    (mutate: (draft: LanguageProgress) => LanguageProgress) => {
      setSnapshot((current) => {
        const existing = current.languages[language] ?? emptyLanguageProgress();
        const next: ProgressSnapshot = {
          ...current,
          languages: { ...current.languages, [language]: mutate(structuredClone(existing)) },
        };
        void storeRef.current.write(next);
        return next;
      });
    },
    [language],
  );

  const value = useMemo<ProgressContextValue>(
    () => ({
      skeleton,
      progress,
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
        update(() => emptyLanguageProgress()),
    }),
    [progress, ready, skeleton, update],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const context = useContext(ProgressContext);
  if (!context) throw new Error("useProgress must be used inside <ProgressProvider>");
  return context;
}
