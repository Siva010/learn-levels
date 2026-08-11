"use client";

import Link from "next/link";
import { LEVEL_ORDER, LEVEL_UI, levelClass } from "@/lib/levels";
import { groupLevelRatio, groupRatio } from "@/lib/progress/compute";
import { useProgress } from "@/lib/progress/provider";
import { ProgressBar } from "@/components/progress/progress-bar";
import { StatusPill } from "@/components/ui/pill";
import { formatPercent } from "@/lib/utils";

export function CurriculumList() {
  const { skeleton, progress, ready } = useProgress();

  return (
    <section>
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">Curriculum</h2>
        <p className="text-xs text-fg-subtle">
          {skeleton.groups.filter((group) => group.status === "complete").length} of{" "}
          {skeleton.groups.length} topic groups available
        </p>
      </div>

      <ul className="mt-3 divide-y divide-[var(--border)] overflow-hidden rounded-lg border border-line bg-panel">
        {skeleton.groups.map((group) => {
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
            <li key={group.slug}>
              {available ? (
                <Link
                  href={`/${skeleton.language}/${group.slug}`}
                  className="block transition-colors hover:bg-panel-raised"
                >
                  {row}
                </Link>
              ) : (
                <div className="opacity-60">{row}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
