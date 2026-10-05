"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronRight, LayoutGrid } from "lucide-react";
import type { GroupSkeleton, LevelId, TrackSkeleton } from "@/types/content";
import { LEVEL_ORDER, LEVEL_UI, levelClass } from "@/lib/levels";
import { groupLevelRatio, trackLevelRatio } from "@/lib/progress/compute";
import { useProgress } from "@/lib/progress/provider";
import type { LanguageProgress, LastVisited } from "@/lib/progress/types";
import { cn, formatPercent } from "@/lib/utils";

/**
 * The curriculum tree, level first: pick a level, then every topic and concept at that level.
 *
 * It follows the reader. Each navigation switches to the page's level, opens the page's topic and
 * scrolls the page's concept into view; on the overview it does the same for the last concept
 * read. Any topic can also be opened by hand to see its concepts without leaving the page.
 */
export function Sidebar({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const { track, progressFor, ready } = useProgress();
  const pathname = usePathname();
  const multiPart = track.parts.length > 1;
  const listRef = useRef<HTMLDivElement>(null);

  const route = parsePath(pathname);
  const resume = ready ? lastVisit(track, progressFor) : null;
  const here = locate(track, route, resume);
  const hereKey = here
    ? [here.kind, here.language, here.groupSlug, here.conceptSlug, here.level].join("/")
    : "";

  const [level, setLevel] = useState<LevelId>(here?.level ?? "foundation");
  const [open, setOpen] = useState<ReadonlySet<string>>(
    () => new Set(here ? [groupKey(here.language, here.groupSlug)] : []),
  );
  const [syncedKey, setSyncedKey] = useState(hereKey);

  // A new location re-centres the tree on it. Adjusted during render rather than in an effect,
  // so the tree never paints a frame that still shows the previous page.
  if (hereKey !== syncedKey) {
    setSyncedKey(hereKey);
    if (here?.level) setLevel(here.level);
    if (here) setOpen(new Set([groupKey(here.language, here.groupSlug)]));
  }

  // Bring the location into view — only when it moves, so browsing the tree is never yanked back.
  // Low in the list counts as out of view: what comes next should be visible too.
  useEffect(() => {
    const list = listRef.current;
    const target =
      list?.querySelector<HTMLElement>("[data-here]") ??
      list?.querySelector<HTMLElement>("[data-here-group]");
    if (!list || !target) return;
    const box = list.getBoundingClientRect();
    const item = target.getBoundingClientRect();
    if (item.top >= box.top + 8 && item.bottom <= box.bottom - box.height / 4) return;
    list.scrollTop += item.top - box.top - box.height / 3;
  }, [hereKey]);

  const toggle = (key: string) =>
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  const expand = (key: string) =>
    setOpen((current) => (current.has(key) ? current : new Set(current).add(key)));

  return (
    <nav className={cn("flex h-full flex-col", className)} aria-label="Curriculum">
      <div className="shrink-0 space-y-3 border-b border-line px-3 pb-3 pt-4">
        <div>
          <p className="eyebrow px-2 pb-1.5">{track.title}</p>
          <Link
            href={`/${route.language ?? track.parts[0].language}`}
            onClick={onNavigate}
            aria-current={route.isOverview ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
              route.isOverview
                ? "bg-panel-raised text-fg"
                : "text-fg-muted hover:bg-panel-raised hover:text-fg",
            )}
          >
            <LayoutGrid className="size-3.5" />
            Overview
          </Link>
        </div>

        <div>
          <p className="eyebrow px-2 pb-1.5">Level</p>
          <div className="grid grid-cols-2 gap-1">
            {LEVEL_ORDER.map((id) => {
              const selected = id === level;
              const percent = ready ? trackLevelRatio(track, progressFor, id).percent : 0;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setLevel(id)}
                  aria-pressed={selected}
                  className={cn(
                    levelClass(id),
                    "flex items-center justify-between gap-2 rounded-md border px-2 py-1.5 text-left text-xs transition-colors",
                    selected
                      ? "border-[var(--level)] bg-panel-raised font-medium text-fg"
                      : "border-line text-fg-muted hover:bg-panel-raised hover:text-fg",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span
                      aria-hidden
                      className="size-1.5 shrink-0 rounded-full"
                      style={{ background: "var(--level)" }}
                    />
                    {LEVEL_UI[id].title}
                  </span>
                  <span className="shrink-0 tabular-nums text-2xs font-normal text-fg-subtle">
                    {formatPercent(percent)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div
        ref={listRef}
        className={cn("min-h-0 flex-1 overflow-y-auto scrollbar-thin px-3 pb-6 pt-2", levelClass(level))}
      >
        {track.parts.map((part, partIndex) => {
          const progress = progressFor(part.language);
          return (
            <section key={part.language} aria-label={multiPart ? part.title : undefined}>
              {/* A multi-part track names each part, so the boundary is visible but not a wall. */}
              {multiPart ? (
                <p
                  className={cn(
                    "px-2 pb-1 text-2xs font-medium uppercase tracking-[0.1em] text-fg-subtle",
                    partIndex > 0 ? "pt-4" : "pt-1",
                  )}
                >
                  Part {partIndex + 1} · {part.title}
                </p>
              ) : null}
              <ul className="space-y-px">
                {part.groups.map((group) => {
                  const key = groupKey(part.language, group.slug);
                  const inGroup =
                    here?.language === part.language && here.groupSlug === group.slug;
                  return (
                    <SidebarGroup
                      key={group.slug}
                      group={group}
                      level={level}
                      language={part.language}
                      progress={ready ? progress : undefined}
                      isOpen={open.has(key)}
                      onToggle={() => toggle(key)}
                      onOpen={() => expand(key)}
                      isCurrentGroup={inGroup && here.kind === "page"}
                      isGroupPage={inGroup && here.kind === "page" && !here.conceptSlug}
                      currentConcept={inGroup && here.kind === "page" ? here.conceptSlug : undefined}
                      resumeConcept={
                        resume?.language === part.language &&
                        resume.groupSlug === group.slug &&
                        resume.level === level
                          ? resume.conceptSlug
                          : undefined
                      }
                      scrollToResume={here?.kind === "resume"}
                      onNavigate={onNavigate}
                    />
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </nav>
  );
}

function SidebarGroup({
  group,
  level,
  language,
  progress,
  isOpen,
  onToggle,
  onOpen,
  isCurrentGroup,
  isGroupPage,
  currentConcept,
  resumeConcept,
  scrollToResume,
  onNavigate,
}: {
  group: GroupSkeleton;
  level: LevelId;
  language: string;
  /** Undefined until progress has loaded. */
  progress?: LanguageProgress;
  isOpen: boolean;
  onToggle: () => void;
  onOpen: () => void;
  /** The page being read is this topic or one of its concepts. */
  isCurrentGroup: boolean;
  /** The page being read is this topic's own overview. */
  isGroupPage: boolean;
  currentConcept?: string;
  /** The concept last read at this level, if it is in this topic. */
  resumeConcept?: string;
  scrollToResume: boolean;
  onNavigate?: () => void;
}) {
  const concepts = group.concepts.filter((concept) => concept.levels.includes(level));

  if (concepts.length === 0) {
    return (
      <li className="flex items-baseline justify-between gap-2 rounded-md py-1 pl-7 pr-2 text-xs leading-snug text-fg-subtle">
        <span className="min-w-0">{group.title}</span>
        <span className="shrink-0 text-2xs">Coming soon</span>
      </li>
    );
  }

  const ratio = progress ? groupLevelRatio(group, progress, level) : null;

  return (
    <li>
      <div
        className={cn(
          "flex items-start rounded-md transition-colors hover:bg-panel-raised",
          isCurrentGroup && !isOpen && "bg-panel-raised",
        )}
        data-here-group={isCurrentGroup || undefined}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-label={`${isOpen ? "Hide" : "Show"} concepts in ${group.title}`}
          className="grid h-7 w-6 shrink-0 place-items-center rounded-md text-fg-subtle transition-colors hover:text-fg"
        >
          <ChevronRight className={cn("size-3 transition-transform", isOpen && "rotate-90")} />
        </button>
        <Link
          href={`/${language}/${group.slug}`}
          onClick={() => {
            onOpen();
            onNavigate?.();
          }}
          aria-current={isGroupPage ? "page" : undefined}
          data-here={isGroupPage || undefined}
          className={cn(
            "flex min-w-0 flex-1 items-baseline justify-between gap-2 py-1.5 pr-2 text-xs leading-snug transition-colors",
            isCurrentGroup ? "font-medium text-fg" : "text-fg-muted hover:text-fg",
          )}
        >
          <span className="min-w-0">{group.title}</span>
          {ratio && ratio.completed > 0 ? (
            ratio.completed === ratio.total ? (
              <Check
                className="size-3 shrink-0 self-center"
                style={{ color: "var(--level)" }}
                aria-label="Complete"
              />
            ) : (
              <span className="shrink-0 tabular-nums text-2xs font-normal text-fg-subtle">
                {formatPercent(ratio.percent)}
              </span>
            )
          ) : null}
        </Link>
      </div>

      {isOpen ? (
        <ul className="mb-1.5 ml-3 space-y-px border-l border-line pl-1.5">
          {concepts.map((concept) => {
            const isCurrent = currentConcept === concept.slug;
            const isResume = !isCurrent && resumeConcept === concept.slug;
            const isDone = Boolean(progress?.levels?.[level]?.[concept.id]);
            return (
              <li key={concept.id} className="relative">
                {isCurrent ? (
                  <span
                    aria-hidden
                    className="absolute inset-y-1 -left-[7.5px] w-0.5 rounded-full"
                    style={{ background: "var(--level)" }}
                  />
                ) : null}
                <Link
                  href={`/${language}/${group.slug}/${concept.slug}/${level}`}
                  onClick={onNavigate}
                  aria-current={isCurrent ? "page" : undefined}
                  data-here={isCurrent || (isResume && scrollToResume) || undefined}
                  className={cn(
                    "flex items-baseline gap-2 rounded-md py-1 pl-1.5 pr-2 text-xs leading-snug transition-colors",
                    isCurrent
                      ? "bg-[color-mix(in_oklab,var(--level)_14%,transparent)] font-medium text-fg"
                      : "text-fg-muted hover:bg-panel-raised hover:text-fg",
                  )}
                >
                  <span
                    className={cn(
                      "w-8 shrink-0 font-mono text-2xs tabular-nums",
                      isCurrent ? "" : "text-fg-subtle",
                    )}
                    style={isCurrent ? { color: "var(--level)" } : undefined}
                  >
                    {concept.number}
                  </span>
                  <span className="min-w-0 flex-1">{concept.title}</span>
                  {isDone ? (
                    <Check
                      className="size-3 shrink-0 self-center"
                      style={{ color: "var(--level)" }}
                      aria-label="Completed"
                    />
                  ) : isResume ? (
                    <span
                      className="size-1.5 shrink-0 self-center rounded-full"
                      style={{ background: "var(--level)" }}
                      title="Where you left off"
                      aria-label="Where you left off"
                    />
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </li>
  );
}

interface ActivePath {
  isOverview: boolean;
  language?: string;
  groupSlug?: string;
  conceptSlug?: string;
  level?: LevelId;
}

function parsePath(pathname: string): ActivePath {
  const [, language, groupSlug, conceptSlug, level] = pathname.split("/");
  return {
    isOverview: !groupSlug,
    language: language || undefined,
    groupSlug,
    conceptSlug,
    level: LEVEL_ORDER.includes(level as LevelId) ? (level as LevelId) : undefined,
  };
}

/** Where the tree should centre: the page being read, or on the overview the last concept read. */
interface Location {
  kind: "page" | "resume";
  language: string;
  groupSlug: string;
  conceptSlug?: string;
  level?: LevelId;
}

function locate(
  track: TrackSkeleton,
  route: ActivePath,
  resume: (LastVisited & { language: string }) | null,
): Location | null {
  const { language, groupSlug } = route;
  const part = track.parts.find((entry) => entry.language === language);
  if (language && groupSlug && part?.groups.some((group) => group.slug === groupSlug)) {
    return {
      kind: "page",
      language,
      groupSlug,
      conceptSlug: route.conceptSlug,
      level: route.level,
    };
  }
  if (route.isOverview && resume) {
    return {
      kind: "resume",
      language: resume.language,
      groupSlug: resume.groupSlug,
      conceptSlug: resume.conceptSlug,
      level: resume.level,
    };
  }
  return null;
}

/** The most recent visit across every part of the track. */
function lastVisit(
  track: TrackSkeleton,
  progressFor: (language: string) => LanguageProgress,
): (LastVisited & { language: string }) | null {
  let latest: (LastVisited & { language: string }) | null = null;
  for (const part of track.parts) {
    const visit = progressFor(part.language).lastVisited;
    if (visit && (!latest || visit.at > latest.at)) latest = { ...visit, language: part.language };
  }
  return latest;
}

function groupKey(language: string, groupSlug: string): string {
  return `${language}/${groupSlug}`;
}
