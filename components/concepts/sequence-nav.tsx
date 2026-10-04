import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SequenceItem {
  href: string;
  title: string;
  /** Where the item sits, e.g. its topic group. */
  context: string;
  language: string;
  partTitle: string;
}

/**
 * Previous/next links through a track. When a link leads into a different part — the last Java
 * concept into the first Spring Boot one — it says so, so crossing the boundary feels like turning
 * a page rather than leaving the curriculum.
 */
export function SequenceNav({
  label,
  language,
  previous,
  next,
}: {
  /** What the sequence steps through, e.g. "concept at Foundation" or "topic". */
  label: string;
  language: string;
  previous: SequenceItem | null;
  next: SequenceItem | null;
}) {
  if (!previous && !next) return null;

  return (
    <nav aria-label={`Previous and next ${label}`} className="mt-6 grid gap-2 sm:grid-cols-2">
      {previous ? (
        <SequenceLink item={previous} direction="previous" label={label} language={language} />
      ) : (
        <span className="hidden sm:block" />
      )}
      {next ? (
        <SequenceLink item={next} direction="next" label={label} language={language} />
      ) : null}
    </nav>
  );
}

function SequenceLink({
  item,
  direction,
  label,
  language,
}: {
  item: SequenceItem;
  direction: "previous" | "next";
  label: string;
  language: string;
}) {
  const crossesPart = item.language !== language;
  const isNext = direction === "next";

  return (
    <Link
      href={item.href}
      className={cn(
        "group flex flex-col gap-1 rounded-lg border border-line bg-panel px-4 py-3 transition-colors hover:border-line-strong",
        isNext && "sm:items-end sm:text-right",
        crossesPart && "border-dashed",
      )}
    >
      <span className="flex items-center gap-1.5 text-2xs text-fg-subtle">
        {isNext ? null : <ArrowLeft className="size-3" aria-hidden />}
        {crossesPart
          ? isNext
            ? `Continue into ${item.partTitle}`
            : `Back to ${item.partTitle}`
          : `${isNext ? "Next" : "Previous"} ${label}`}
        {isNext ? <ArrowRight className="size-3" aria-hidden /> : null}
      </span>
      <span className="text-sm font-medium text-fg">{item.title}</span>
      <span className="text-2xs text-fg-subtle">{item.context}</span>
    </Link>
  );
}
