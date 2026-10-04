"use client";

import Link from "next/link";
import type { CurriculumSkeleton, GroupSkeleton } from "@/types/content";
import type { LanguageProgress } from "@/lib/progress/types";
import { LEVEL_ORDER, LEVEL_UI, levelClass } from "@/lib/levels";
import { groupLevelRatio, groupRatio, overallRatio } from "@/lib/progress/compute";
import { useProgress } from "@/lib/progress/provider";
import { ProgressBar } from "@/components/progress/progress-bar";
import { StatusPill } from "@/components/ui/pill";
import { partAnchor } from "@/lib/tracks";
import { formatPercent } from "@/lib/utils";

export function CurriculumList() {
  const { track, progressFor, ready } = useProgress();
  const multiPart = track.parts.length > 1;
  const allGroups = track.parts.flatMap((part) => part.groups);

  return (
    <section>
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">Curriculum</h2>
        <p className="text-xs text-fg-subtle">
          {allGroups.filter((group) => group.status === "complete").length} of {allGroups.length}{" "}
          topic groups available
        </p>
      </div>

      <div className="mt-3 space-y-6">
        {track.parts.map((part, index) => (
          <PartList
            key={part.language}
            part={part}
            heading={multiPart ? { index: index + 1, follows: track.parts[index - 1]?.title } : null}
            progress={progressFor(part.language)}
            ready={ready}
          />
        ))}
      </div>
    </section>
  );
}

function PartList({
  part,
  heading,
  progress,
  ready,
}: {
  part: CurriculumSkeleton;
  heading: { index: number; follows?: string } | null;
  progress: LanguageProgress;
  ready: boolean;
}) {
  const overall = overallRatio(part, progress);

  return (
    <div id={partAnchor(part.language)} className="scroll-mt-20">
      {heading ? (
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-xs">
            <span className="eyebrow">Part {heading.index}</span>
            <span className="ml-2 font-semibold text-fg">{part.title}</span>
            {heading.follows ? (
              <span className="ml-2 text-fg-subtle">builds on {heading.follows}</span>
            ) : null}
          </p>
          <p className="text-2xs tabular-nums text-fg-subtle">
            {ready ? formatPercent(overall.percent) : "—"} mastered
          </p>
        </div>
      ) : null}

      <ul className="divide-y divide-[var(--border)] overflow-hidden rounded-lg border border-line bg-panel">
        {part.groups.map((group) => (
          <GroupRow
            key={group.slug}
            language={part.language}
            group={group}
            progress={progress}
            ready={ready}
          />
        ))}
      </ul>
    </div>
  );
}

function GroupRow({
  language,
  group,
  progress,
  ready,
}: {
  language: string;
  group: GroupSkeleton;
  progress: LanguageProgress;
  ready: boolean;
}) {
  const available = group.concepts.length > 0;
  const overall = groupRatio(group, progress);

  const row = (
    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-6">
      <div className="flex min-w-0 flex-1 items-baseline gap-3">
        <span className="font-mono text-xs tabular-nums text-fg-subtle">
          {group.number.padStart(2, "0")}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{group.title}</p>
          <p className="mt-0.5 text-xs text-fg-subtle">
            {available
              ? `${group.concepts.length} concepts · ${ready ? formatPercent(overall.percent) : "—"} mastered`
              : "Not yet written"}
          </p>
        </div>
      </div>

      {available ? (
        <div className="grid w-full shrink-0 grid-cols-4 gap-3 sm:w-72">
          {LEVEL_ORDER.map((level) => {
            const ratio = groupLevelRatio(group, progress, level);
            return (
              <div key={level} className={levelClass(level)} title={LEVEL_UI[level].title}>
                <p className="mb-1 text-2xs font-medium text-fg-subtle">
                  {LEVEL_UI[level].title.slice(0, 4)}
                </p>
                <ProgressBar
                  value={ready ? ratio.percent : 0}
                  level={level}
                  label={`${group.title} — ${LEVEL_UI[level].title}`}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="shrink-0">
          <StatusPill status={group.status} />
        </div>
      )}
    </div>
  );

  return (
    <li>
      {available ? (
        <Link href={`/${language}/${group.slug}`} className="block transition-colors hover:bg-panel-raised">
          {row}
        </Link>
      ) : (
        <div className="opacity-60">{row}</div>
      )}
    </li>
  );
}
