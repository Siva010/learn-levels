"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { Check, ChevronRight, LayoutGrid } from "lucide-react";
import type { GroupSkeleton, LevelId } from "@/types/content";
import { LEVEL_ORDER, LEVEL_UI, levelClass } from "@/lib/levels";
import { groupLevelRatio } from "@/lib/progress/compute";
import { useProgress } from "@/lib/progress/provider";
import { cn, formatPercent } from "@/lib/utils";

export function Sidebar({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const { skeleton, progress, ready } = useProgress();
  const pathname = usePathname();

  const active = useMemo(() => parsePath(pathname), [pathname]);
  const [openLevel, setOpenLevel] = useState<LevelId | null>(active.level ?? "foundation");

  return (
    <nav className={cn("flex h-full flex-col gap-1 overflow-y-auto scrollbar-thin px-3 py-4", className)} aria-label="Curriculum">
      <div className="px-2 pb-2">
        <p className="eyebrow">{skeleton.title}</p>
      </div>

      <Link
        href={`/${skeleton.language}`}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
          active.isOverview
            ? "bg-panel-raised text-fg"
            : "text-fg-muted hover:bg-panel-raised hover:text-fg",
        )}
      >
        <LayoutGrid className="size-3.5" />
        Overview
      </Link>

      <div className="mt-3 space-y-1">
        {LEVEL_ORDER.map((level) => {
          const ui = LEVEL_UI[level];
          const isOpen = openLevel === level;
          return (
            <div key={level} className={levelClass(level)}>
              <button
                type="button"
                onClick={() => setOpenLevel(isOpen ? null : level)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-panel-raised"
              >
                <ChevronRight
                  className={cn(
                    "size-3 shrink-0 text-fg-subtle transition-transform",
                    isOpen && "rotate-90",
                  )}
                />
                <span
                  className="text-2xs font-semibold uppercase tracking-[0.12em]"
                  style={{ color: "var(--level)" }}
                >
                  {ui.title}
                </span>
              </button>

              {isOpen ? (
                <ul className="mb-2 ml-[1.1rem] space-y-0.5 border-l border-line pl-2">
                  {skeleton.groups.map((group) => (
                    <SidebarGroup
                      key={group.slug}
                      group={group}
                      level={level}
                      language={skeleton.language}
                      ratio={ready ? groupLevelRatio(group, progress, level).percent : 0}
                      isActiveGroup={active.groupSlug === group.slug && active.level === level}
                      activeConcept={active.conceptSlug}
                      onNavigate={onNavigate}
                      completed={(conceptId) => ready && Boolean(progress.levels?.[level]?.[conceptId])}
                    />
                  ))}
                </ul>
              ) : null}
            </div>
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
  ratio,
  isActiveGroup,
  activeConcept,
  completed,
  onNavigate,
}: {
  group: GroupSkeleton;
  level: LevelId;
  language: string;
  ratio: number;
  isActiveGroup: boolean;
  activeConcept?: string;
  completed: (conceptId: string) => boolean;
  onNavigate?: () => void;
}) {
  const concepts = group.concepts.filter((concept) => concept.levels.includes(level));
  const unavailable = concepts.length === 0;

  if (unavailable) {
    return (
      <li className="flex items-center justify-between gap-2 rounded-md px-2 py-1 text-xs text-fg-subtle">
        <span className="truncate">{group.title}</span>
        <span className="shrink-0 text-2xs">Coming soon</span>
      </li>
    );
  }

  return (
    <li>
      <Link
        href={`/${language}/${group.slug}`}
        onClick={onNavigate}
        className={cn(
          "flex items-center justify-between gap-2 rounded-md px-2 py-1 text-xs transition-colors",
          isActiveGroup ? "bg-panel-raised text-fg" : "text-fg-muted hover:bg-panel-raised hover:text-fg",
        )}
      >
        <span className="truncate">{group.title}</span>
        <span className="shrink-0 tabular-nums text-2xs text-fg-subtle">
          {formatPercent(ratio)}
        </span>
      </Link>

      {isActiveGroup ? (
        <ul className="my-1 ml-2 space-y-0.5 border-l border-line pl-2">
          {concepts.map((concept) => {
            const isActive = activeConcept === concept.slug;
            const isDone = completed(concept.id);
            return (
              <li key={concept.id}>
                <Link
                  href={`/${language}/${group.slug}/${concept.slug}/${level}`}
                  onClick={onNavigate}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors",
                    isActive
                      ? "text-fg"
                      : "text-fg-subtle hover:bg-panel-raised hover:text-fg-muted",
                  )}
                  style={isActive ? { color: "var(--level)" } : undefined}
                >
                  <Check
                    className={cn("size-3 shrink-0", isDone ? "opacity-100" : "opacity-0")}
                    style={{ color: "var(--level)" }}
                  />
                  <span className="truncate">{concept.title}</span>
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
  groupSlug?: string;
  conceptSlug?: string;
  level?: LevelId;
}

function parsePath(pathname: string): ActivePath {
  const [, , groupSlug, conceptSlug, level] = pathname.split("/");
  return {
    isOverview: !groupSlug,
    groupSlug,
    conceptSlug,
    level: LEVEL_ORDER.includes(level as LevelId) ? (level as LevelId) : undefined,
  };
}
