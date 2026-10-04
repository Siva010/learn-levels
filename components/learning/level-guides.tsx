import type { LevelMeta } from "@/types/content";
import { levelClass } from "@/lib/levels";
import { BlockList } from "@/components/content/section-renderer";

/**
 * Each source file opens with a "Goal of this file" note and closes with a section telling the
 * reader where to go next. Both are source content, so both are surfaced here rather than being
 * parsed and then dropped.
 */
export function LevelGuides({ levels, title }: { levels: LevelMeta[]; title?: string }) {
  const withContent = levels.filter((level) => level.goal || level.epilogue);
  if (withContent.length === 0) return null;

  return (
    <section>
      <h2 className="text-sm font-semibold">{title ?? "About each level"}</h2>
      <p className="mt-1 text-xs text-fg-subtle">
        Taken from the source files — what each level is for, and where it leads.
      </p>

      <div className="mt-4 space-y-3">
        {withContent.map((level) => (
          <details
            key={level.id}
            className={`group overflow-hidden rounded-lg border border-line bg-panel ${levelClass(level.id)}`}
          >
            <summary className="flex cursor-pointer list-none items-baseline gap-3 p-4 transition-colors hover:bg-panel-raised">
              <span
                className="shrink-0 text-2xs font-semibold uppercase tracking-[0.12em]"
                style={{ color: "var(--level)" }}
              >
                {level.title}
              </span>
              <span className="min-w-0 flex-1 text-xs leading-relaxed text-fg-muted">
                {stripMarkdown(level.goal)}
              </span>
              <span className="shrink-0 text-2xs text-fg-subtle transition-transform group-open:rotate-90">
                ›
              </span>
            </summary>

            {level.epilogue ? (
              <div className="border-t border-line px-4 pb-4 pt-3">
                <p className="eyebrow mb-2">{level.epilogue.title}</p>
                <div className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                  <BlockList blocks={level.epilogue.blocks} />
                </div>
                <p className="mt-4 text-2xs text-fg-subtle">Source: {level.file}</p>
              </div>
            ) : null}
          </details>
        ))}
      </div>
    </section>
  );
}

/** The goal line is a one-sentence blockquote; emphasis markers only add noise at this size. */
function stripMarkdown(value: string): string {
  return value.replace(/\*\*/g, "").replace(/(^|\s)\*(\S[^*]*)\*/g, "$1$2").trim();
}
