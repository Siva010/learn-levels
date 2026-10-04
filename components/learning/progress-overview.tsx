"use client";

import { LEVEL_ORDER, LEVEL_UI, levelClass } from "@/lib/levels";
import { overallRatio, trackLevelRatio, trackOverallRatio } from "@/lib/progress/compute";
import { useProgress } from "@/lib/progress/provider";
import { ProgressBar } from "@/components/progress/progress-bar";
import { ResetProgress } from "@/components/progress/reset-progress";
import { formatPercent } from "@/lib/utils";

export function ProgressOverview() {
  const { track, progressFor, ready } = useProgress();
  const overall = trackOverallRatio(track, progressFor);
  const multiPart = track.parts.length > 1;

  return (
    <section className="rounded-lg border border-line bg-panel p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">Your progress</h2>
        <p className="text-xs text-fg-muted">
          Overall mastery{" "}
          <span className="tabular-nums font-medium text-fg">
            {ready ? formatPercent(overall.percent) : "—"}
          </span>
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {LEVEL_ORDER.map((level) => {
          const ratio = trackLevelRatio(track, progressFor, level);
          return (
            <div key={level} className={levelClass(level)}>
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-medium text-fg-muted">{LEVEL_UI[level].title}</span>
                <span className="tabular-nums text-fg-subtle">
                  {ready ? `${ratio.completed}/${ratio.total}` : "—"}
                  <span className="ml-2 text-fg-muted">
                    {ready ? formatPercent(ratio.percent) : ""}
                  </span>
                </span>
              </div>
              <ProgressBar
                className="mt-1.5"
                value={ready ? ratio.percent : 0}
                level={level}
                label={`${LEVEL_UI[level].title} progress`}
              />
            </div>
          );
        })}
      </div>

      {multiPart ? (
        <div className="mt-5 space-y-2 border-t border-line pt-4">
          {track.parts.map((part, index) => {
            const ratio = overallRatio(part, progressFor(part.language));
            return (
              <div key={part.language} className="flex items-center justify-between text-xs">
                <span className="text-fg-muted">
                  <span className="text-fg-subtle">Part {index + 1} · </span>
                  {part.title}
                </span>
                <span className="tabular-nums text-fg-subtle">
                  {ready ? formatPercent(ratio.percent) : "—"}
                </span>
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="mt-5 border-t border-line pt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="eyebrow">{track.title} mastery</span>
          <span className="tabular-nums font-medium">
            {ready ? formatPercent(overall.percent) : "—"}
          </span>
        </div>
        <ProgressBar className="mt-1.5" value={ready ? overall.percent : 0} label="Overall mastery" />
        <div className="mt-4 flex justify-end">
          <ResetProgress />
        </div>
      </div>
    </section>
  );
}
