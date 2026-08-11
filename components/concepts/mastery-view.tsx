"use client";

import Link from "next/link";
import { ArrowRight, Check, Circle } from "lucide-react";
import type { LevelId } from "@/types/content";
import { LEVEL_ORDER, LEVEL_UI, levelClass } from "@/lib/levels";
import { conceptRatio } from "@/lib/progress/compute";
import { useProgress } from "@/lib/progress/provider";
import { ProgressBar } from "@/components/progress/progress-bar";
import { formatPercent } from "@/lib/utils";

/**
 * What completing each level means, in plain terms. This is UI copy describing the level, not
 * a claim about the concept — the educational content lives on the level pages.
 */
const CAPABILITY: Record<LevelId, (title: string) => string> = {
  foundation: (title) => `Define ${title} and say why it exists`,
  understand: (title) => `Explain how ${title} actually works`,
  interview: (title) => `Answer interview questions on ${title}`,
  production: (title) => `Use ${title} correctly in production`,
};

export function MasteryView({
  language,
  groupSlug,
  conceptSlug,
}: {
  language: string;
  groupSlug: string;
  conceptSlug: string;
}) {
  const { skeleton, progress, ready, isComplete } = useProgress();
  const group = skeleton.groups.find((entry) => entry.slug === groupSlug);
  const concept = group?.concepts.find((entry) => entry.slug === conceptSlug);
  if (!group || !concept) return null;

  const ratio = conceptRatio(concept, progress);
  const nextLevel = concept.levels.find((level) => !isComplete(level, concept.id));

  return (
    <div className="mt-8 space-y-8">
      <section className="rounded-lg border border-line bg-panel p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold">Your understanding</h2>
          <span className="tabular-nums text-xs text-fg-muted">
            {ready ? formatPercent(ratio.percent) : "—"}
          </span>
        </div>

        <ul className="mt-4 space-y-3">
          {LEVEL_ORDER.map((level) => {
            const available = concept.levels.includes(level);
            const done = ready && available && isComplete(level, concept.id);
            return (
              <li key={level} className={levelClass(level)}>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <Link
                    href={`/${language}/${groupSlug}/${conceptSlug}/${level}`}
                    className="font-medium text-fg-muted transition-colors hover:text-fg"
                  >
                    {LEVEL_UI[level].title}
                  </Link>
                  <span className="text-fg-subtle">
                    {!available ? "Not covered" : done ? "Complete" : "Not started"}
                  </span>
                </div>
                <ProgressBar
                  className="mt-1.5"
                  value={done ? 100 : 0}
                  level={level}
                  label={`${LEVEL_UI[level].title} progress`}
                />
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="text-sm font-semibold">What you can do</h2>
        <ul className="mt-3 space-y-2">
          {LEVEL_ORDER.filter((level) => concept.levels.includes(level)).map((level) => {
            const done = ready && isComplete(level, concept.id);
            return (
              <li
                key={level}
                className={`flex items-center gap-2.5 text-sm ${levelClass(level)}`}
              >
                {done ? (
                  <Check className="size-4 shrink-0" style={{ color: "var(--level)" }} />
                ) : (
                  <Circle className="size-4 shrink-0 text-fg-subtle" />
                )}
                <span className={done ? "text-fg" : "text-fg-subtle"}>
                  {CAPABILITY[level](concept.title)}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {nextLevel ? (
        <Link
          href={`/${language}/${groupSlug}/${conceptSlug}/${nextLevel}`}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-fg px-4 text-sm font-medium text-bg transition-opacity hover:opacity-90"
        >
          Continue {LEVEL_UI[nextLevel].title}
          <ArrowRight className="size-4" />
        </Link>
      ) : (
        <p className="text-sm text-fg-muted">
          {ready
            ? "You've completed the full learning cycle for this concept."
            : "Loading your progress…"}
        </p>
      )}
    </div>
  );
}
