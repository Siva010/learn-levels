"use client";

import { useEffect } from "react";
import { Check, Circle } from "lucide-react";
import type { LevelId } from "@/types/content";
import { levelClass } from "@/lib/levels";
import { useProgress } from "@/lib/progress/provider";
import { cn } from "@/lib/utils";

interface Props {
  language: string;
  groupSlug: string;
  groupTitle: string;
  conceptSlug: string;
  conceptId: string;
  conceptTitle: string;
  level: LevelId;
}

/** Marks the level complete, and records the visit so "Continue learning" can resume here. */
export function ConceptProgress(props: Props) {
  const { isComplete, toggleComplete, recordVisit, ready } = useProgress();
  const { conceptId, level } = props;
  const done = ready && isComplete(level, conceptId);

  useEffect(() => {
    if (!ready) return;
    recordVisit({
      groupSlug: props.groupSlug,
      groupTitle: props.groupTitle,
      conceptSlug: props.conceptSlug,
      conceptTitle: props.conceptTitle,
      level: props.level,
    });
    // Recording depends only on which page this is, not on the callback identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, props.groupSlug, props.conceptSlug, props.level]);

  return (
    <button
      type="button"
      onClick={() => toggleComplete(level, conceptId)}
      aria-pressed={done}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors",
        levelClass(level),
        done
          ? "border-transparent text-bg"
          : "border-line text-fg-muted hover:border-line-strong hover:text-fg",
      )}
      style={done ? { backgroundColor: "var(--level)", color: "var(--bg)" } : undefined}
    >
      {done ? <Check className="size-3.5" /> : <Circle className="size-3.5" />}
      {done ? "Completed" : "Mark as complete"}
    </button>
  );
}
