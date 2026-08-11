import type { GroupStatus, LevelId } from "@/types/content";
import { LEVEL_UI, levelClass } from "@/lib/levels";
import { cn } from "@/lib/utils";

export function LevelTag({
  level,
  showTitle = false,
  className,
}: {
  level: LevelId;
  showTitle?: boolean;
  className?: string;
}) {
  const ui = LEVEL_UI[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-[0.12em]",
        levelClass(level),
        className,
      )}
      style={{ color: "var(--level)" }}
    >
      <span className="size-1.5 rounded-full" style={{ backgroundColor: "var(--level)" }} />
      {showTitle ? ui.title : ui.tag}
    </span>
  );
}

export function StatusPill({ status }: { status: GroupStatus }) {
  if (status === "complete") {
    return (
      <span className="inline-flex items-center rounded-full border border-line px-2 py-0.5 text-2xs font-medium text-fg-subtle">
        Complete
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-dashed border-line px-2 py-0.5 text-2xs font-medium text-fg-subtle">
      {status === "coming-next" ? "Coming next" : "Coming soon"}
    </span>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-line bg-panel-raised px-1.5 py-0.5 font-sans text-2xs text-fg-subtle">
      {children}
    </kbd>
  );
}
