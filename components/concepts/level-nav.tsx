"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import type { LevelId } from "@/types/content";
import { LEVEL_ORDER, LEVEL_UI, levelClass, nextLevel, previousLevel } from "@/lib/levels";
import { useProgress } from "@/lib/progress/provider";
import { cn } from "@/lib/utils";

interface ConceptRef {
  language: string;
  groupSlug: string;
  conceptSlug: string;
  conceptId: string;
  available: LevelId[];
}

/** The four-level tab strip. Levels are never locked — progression is shown, not enforced. */
export function LevelSwitcher({
  concept,
  current,
}: {
  concept: ConceptRef;
  current: LevelId;
}) {
  const { isComplete, ready } = useProgress();

  return (
    <div
      className="flex gap-1 overflow-x-auto rounded-lg border border-line bg-panel p-1 scrollbar-thin"
      role="tablist"
      aria-label="Learning level"
    >
      {LEVEL_ORDER.map((level) => {
        const ui = LEVEL_UI[level];
        const isCurrent = level === current;
        const available = concept.available.includes(level);
        const done = ready && isComplete(level, concept.conceptId);

        const inner = (
          <>
            <span className="flex items-center gap-1.5">
              {done ? (
                <Check className="size-3" style={{ color: "var(--level)" }} aria-hidden />
              ) : (
                <span
                  className="size-1.5 rounded-full"
                  style={{
                    backgroundColor: isCurrent ? "var(--level)" : "var(--border-strong)",
                  }}
                  aria-hidden
                />
              )}
              <span className="text-xs font-medium">{ui.title}</span>
            </span>
            <span className="mt-0.5 hidden text-2xs text-fg-subtle sm:block">
              {available ? ui.tag : "Coming soon"}
            </span>
          </>
        );

        const className = cn(
          "flex min-w-[7rem] flex-1 flex-col items-center rounded-md px-3 py-2 transition-colors",
          levelClass(level),
          isCurrent ? "bg-panel-raised text-fg" : "text-fg-muted hover:bg-panel-raised",
          !available && "cursor-not-allowed opacity-45",
        );

        if (!available) {
          return (
            <span key={level} className={className} aria-disabled role="tab" aria-selected={false}>
              {inner}
            </span>
          );
        }

        return (
          <Link
            key={level}
            href={`/${concept.language}/${concept.groupSlug}/${concept.conceptSlug}/${level}`}
            role="tab"
            aria-selected={isCurrent}
            aria-current={isCurrent ? "page" : undefined}
            className={className}
          >
            {inner}
          </Link>
        );
      })}
    </div>
  );
}

/** Bottom-of-page progression: where you've been, and what the next level is for. */
export function LevelFooter({
  concept,
  current,
}: {
  concept: ConceptRef;
  current: LevelId;
}) {
  const previous = previousLevel(current);
  const next = nextLevel(current);
  const base = `/${concept.language}/${concept.groupSlug}/${concept.conceptSlug}`;
  const nextAvailable = next && concept.available.includes(next);

  return (
    <footer className={cn("mt-12 border-t border-line pt-6", levelClass(current))}>
      <p className="text-sm text-fg-muted">{LEVEL_UI[current].handoff}</p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {previous && concept.available.includes(previous) ? (
          <Link
            href={`${base}/${previous}`}
            className="inline-flex items-center gap-2 rounded-md border border-line px-3 py-2 text-xs text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
          >
            <ArrowLeft className="size-3.5" />
            <span>
              Previous level
              <span className="ml-1.5 text-fg-subtle">{LEVEL_UI[previous].title}</span>
            </span>
          </Link>
        ) : (
          <span />
        )}

        {nextAvailable ? (
          <Link
            href={`${base}/${next}`}
            className="inline-flex items-center gap-2 rounded-md bg-fg px-3 py-2 text-xs font-medium text-bg transition-opacity hover:opacity-90"
          >
            <span>
              Next level
              <span className="ml-1.5 opacity-70">{LEVEL_UI[next].title}</span>
            </span>
            <ArrowRight className="size-3.5" />
          </Link>
        ) : null}
      </div>
    </footer>
  );
}
