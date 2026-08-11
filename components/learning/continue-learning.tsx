"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LEVEL_UI, levelClass } from "@/lib/levels";
import { findNextUp } from "@/lib/progress/compute";
import { useProgress } from "@/lib/progress/provider";
import { LevelTag } from "@/components/ui/pill";

export function ContinueLearning() {
  const { skeleton, progress, ready } = useProgress();
  const next = findNextUp(skeleton, progress);
  const hasStarted = Boolean(progress.lastVisited);

  if (!next) {
    return (
      <section className="rounded-lg border border-line bg-panel p-5">
        <p className="eyebrow">Complete</p>
        <h2 className="mt-2 text-lg font-semibold tracking-tight">
          You&apos;ve completed the full learning cycle.
        </h2>
        <p className="mt-1 text-sm text-fg-muted">{LEVEL_UI.production.handoff}</p>
      </section>
    );
  }

  const href = `/${skeleton.language}/${next.group.slug}/${next.concept.slug}/${next.level}`;

  return (
    <section className={`rounded-lg border border-line bg-panel p-5 ${levelClass(next.level)}`}>
      <p className="eyebrow">{ready && hasStarted ? "Continue learning" : "Start learning"}</p>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs text-fg-muted">{next.group.title}</p>
          <h2 className="mt-0.5 truncate text-lg font-semibold tracking-tight">
            {next.concept.title}
          </h2>
          <div className="mt-2">
            <LevelTag level={next.level} showTitle />
          </div>
        </div>

        <Link
          href={href}
          className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md bg-fg px-4 text-sm font-medium text-bg transition-opacity hover:opacity-90"
        >
          {ready && hasStarted ? "Continue" : "Start"}
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
