import type { LevelId } from "@/types/content";
import { levelClass } from "@/lib/levels";
import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  level,
  className,
  label,
}: {
  /** 0-100 */
  value: number;
  level?: LevelId;
  className?: string;
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn(
        "h-1 w-full overflow-hidden rounded-full bg-[var(--border)]",
        level && levelClass(level),
        className,
      )}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out"
        style={{
          width: `${clamped}%`,
          backgroundColor: level ? "var(--level)" : "var(--accent)",
        }}
      />
    </div>
  );
}

/** Five-dot mastery indicator — the spec's alternative to XP-style gamification. */
export function MasteryDots({
  value,
  level,
  className,
}: {
  value: number;
  level?: LevelId;
  className?: string;
}) {
  const filled = Math.round((Math.max(0, Math.min(100, value)) / 100) * 5);
  return (
    <span
      className={cn("inline-flex items-center gap-1", level && levelClass(level), className)}
      aria-hidden
    >
      {Array.from({ length: 5 }, (_, index) => (
        <span
          key={index}
          className="size-1.5 rounded-full"
          style={{
            backgroundColor:
              index < filled ? (level ? "var(--level)" : "var(--accent)") : "var(--border-strong)",
          }}
        />
      ))}
    </span>
  );
}
