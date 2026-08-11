"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import type { LevelId } from "@/types/content";
import { LEVEL_ORDER, LEVEL_UI, levelClass } from "@/lib/levels";
import { conceptRatio, groupLevelRatio, recommendedLevel } from "@/lib/progress/compute";
import { useProgress } from "@/lib/progress/provider";
import { ProgressBar } from "@/components/progress/progress-bar";
import { formatPercent } from "@/lib/utils";

/** The four level rollups shown at the top of a topic page. */
export function TopicLevelSummary({ groupSlug }: { groupSlug: string }) {
  const { skeleton, progress, ready } = useProgress();
  const group = skeleton.groups.find((entry) => entry.slug === groupSlug);
  if (!group) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {LEVEL_ORDER.map((level) => {
        const ratio = groupLevelRatio(group, progress, level);
        const ui = LEVEL_UI[level];
        return (
          <div
            key={level}
            className={`rounded-lg border border-line bg-panel p-3 ${levelClass(level)}`}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-2xs font-semibold uppercase tracking-[0.12em]"
                style={{ color: "var(--level)" }}
              >
                {ui.title}
              </span>
              <span className="tabular-nums text-xs text-fg-muted">
                {ready ? formatPercent(ratio.percent) : "—"}
              </span>
            </div>
            <ProgressBar className="mt-2" value={ready ? ratio.percent : 0} level={level} />
            <p className="mt-2 text-2xs text-fg-subtle">{ui.tagline}</p>
          </div>
        );
      })}
    </div>
  );
}

/** Concept list with per-level completion marks. */
export function TopicConcepts({ groupSlug }: { groupSlug: string }) {
  const { skeleton, progress, ready, isComplete } = useProgress();
  const group = skeleton.groups.find((entry) => entry.slug === groupSlug);
  if (!group) return null;

  return (
    <ul className="divide-y divide-[var(--border)] overflow-hidden rounded-lg border border-line bg-panel">
      {group.concepts.map((concept) => {
        const ratio = conceptRatio(concept, progress);
        const target = recommendedLevel(concept, progress);
        return (
          <li key={concept.id}>
            <Link
              href={`/${skeleton.language}/${group.slug}/${concept.slug}/${target}`}
              className="flex flex-col gap-3 p-4 transition-colors hover:bg-panel-raised sm:flex-row sm:items-center sm:gap-6"
            >
              <div className="flex min-w-0 flex-1 items-baseline gap-3">
                <span className="font-mono text-xs tabular-nums text-fg-subtle">
                  {concept.number}
                </span>
                <span className="truncate text-sm font-medium">{concept.title}</span>
              </div>

              <div className="flex shrink-0 items-center gap-4">
                {LEVEL_ORDER.map((level) => (
                  <LevelMark
                    key={level}
                    level={level}
                    available={concept.levels.includes(level)}
                    done={ready && isComplete(level, concept.id)}
                  />
                ))}
                <span className="w-10 shrink-0 text-right tabular-nums text-xs text-fg-subtle">
                  {ready ? formatPercent(ratio.percent) : "—"}
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function LevelMark({
  level,
  available,
  done,
}: {
  level: LevelId;
  available: boolean;
  done: boolean;
}) {
  const ui = LEVEL_UI[level];
  return (
    <span
      className={`flex w-14 flex-col items-center gap-1 ${levelClass(level)}`}
      title={available ? `${ui.title}${done ? " — complete" : ""}` : `${ui.title} — not covered`}
    >
      <span className="text-2xs text-fg-subtle">{ui.title.slice(0, 4)}</span>
      {!available ? (
        <span className="block h-3 text-2xs leading-3 text-fg-subtle">—</span>
      ) : done ? (
        <Check className="size-3" style={{ color: "var(--level)" }} />
      ) : (
        <span
          className="size-1.5 rounded-full"
          style={{ backgroundColor: "var(--border-strong)" }}
        />
      )}
    </span>
  );
}
