"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CornerDownLeft,
  FileText,
  Layers,
  Play,
  Search as SearchIcon,
  type LucideIcon,
} from "lucide-react";
import type { LevelId } from "@/types/content";
import { LEVEL_ORDER, LEVEL_UI, levelClass } from "@/lib/levels";
import { findTrackNextUp } from "@/lib/progress/compute";
import { useProgress } from "@/lib/progress/provider";
import { useSearch } from "@/lib/search/use-search";
import { Highlight } from "@/components/search/highlight";
import { cn } from "@/lib/utils";

interface Command {
  id: string;
  label: string;
  hint?: string;
  group: string;
  href: string;
  icon: LucideIcon;
  level?: LevelId;
  snippet?: string;
}

/** Mounted only while open, so every invocation starts from a clean state. */
export function CommandPalette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { skeleton, track, progressFor } = useProgress();
  const [query, setQuery] = useState("");
  // The active row is stored with the query it belongs to, so a new query resets the
  // highlight during render instead of through an effect.
  const [cursor, setCursor] = useState<{ query: string; index: number }>({ query: "", index: 0 });
  const listRef = useRef<HTMLUListElement>(null);
  const parts = track.parts.map((part) => part.language);
  const { hits, terms } = useSearch(query, parts, 12);
  const multiPart = track.parts.length > 1;

  const commands = useMemo<Command[]>(() => {
    const trimmed = query.trim().toLowerCase();
    const results: Command[] = [];
    // Every group and concept of the track, each with the part it belongs to.
    const entries = track.parts.flatMap((part) =>
      part.groups.map((group) => ({ part, group })),
    );

    if (!trimmed) {
      const next = findTrackNextUp(track, progressFor);
      if (next) {
        results.push({
          id: "continue",
          label: `Continue — ${next.concept.title}`,
          hint: LEVEL_UI[next.level].title,
          group: "Actions",
          href: `/${next.language}/${next.group.slug}/${next.concept.slug}/${next.level}`,
          icon: Play,
          level: next.level,
        });
      }
      results.push({
        id: "dashboard",
        label: "Open dashboard",
        group: "Actions",
        href: `/${skeleton.language}`,
        icon: Layers,
      });
    }

    // Topic groups
    for (const { part, group } of entries) {
      if (group.concepts.length === 0) continue;
      if (trimmed && !group.title.toLowerCase().includes(trimmed)) continue;
      results.push({
        id: `group-${part.language}-${group.slug}`,
        label: group.title,
        hint: multiPart
          ? `${part.title} · ${group.concepts.length} concepts`
          : `${group.concepts.length} concepts`,
        group: "Topics",
        href: `/${part.language}/${group.slug}`,
        icon: BookOpen,
      });
    }

    // Concepts, matched on title
    if (trimmed) {
      for (const { part, group } of entries) {
        for (const concept of group.concepts) {
          if (!concept.title.toLowerCase().includes(trimmed)) continue;
          results.push({
            id: `concept-${part.language}-${concept.id}`,
            label: concept.title,
            hint: multiPart ? `${part.title} · ${group.title}` : group.title,
            group: "Concepts",
            href: `/${part.language}/${group.slug}/${concept.slug}/${concept.levels[0] ?? "foundation"}`,
            icon: FileText,
          });
        }
      }
    } else {
      // "Go to <Level>" jumps to the first concept not yet completed at that level, across parts.
      for (const level of LEVEL_ORDER) {
        const target = entries
          .flatMap(({ part, group }) => group.concepts.map((concept) => ({ part, group, concept })))
          .find(
            (entry) =>
              entry.concept.levels.includes(level) &&
              !progressFor(entry.part.language).levels?.[level]?.[entry.concept.id],
          );
        if (!target) continue;
        results.push({
          id: `level-${level}`,
          label: `Go to ${LEVEL_UI[level].title}`,
          hint: target.concept.title,
          group: "Levels",
          href: `/${target.part.language}/${target.group.slug}/${target.concept.slug}/${level}`,
          icon: ArrowRight,
          level,
        });
      }
    }

    return results.slice(0, 24);
  }, [multiPart, progressFor, query, skeleton.language, track]);

  const fullText = useMemo<Command[]>(
    () =>
      hits.map((hit) => ({
        id: `hit-${hit.id}`,
        label: hit.conceptTitle,
        hint: hit.sectionLabel || LEVEL_UI[hit.level].title,
        group: "In the content",
        href: `/${hit.language ?? skeleton.language}/${hit.groupSlug}/${hit.conceptSlug}/${hit.level}`,
        icon: SearchIcon,
        level: hit.level,
        snippet: hit.snippet,
      })),
    [hits, skeleton.language],
  );

  const all = useMemo(() => [...commands, ...fullText], [commands, fullText]);
  const activeIndex = cursor.query === query ? cursor.index : 0;

  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setCursor((current) => {
          const index = current.query === query ? current.index : 0;
          return { query, index: all.length === 0 ? 0 : (index + 1) % all.length };
        });
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setCursor((current) => {
          const index = current.query === query ? current.index : 0;
          return { query, index: all.length === 0 ? 0 : (index - 1 + all.length) % all.length };
        });
      } else if (event.key === "Enter") {
        const target = all[activeIndex];
        if (!target) return;
        event.preventDefault();
        onClose();
        router.push(target.href);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, all, onClose, query, router]);

  useEffect(() => {
    listRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  let lastGroup = "";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh]">
      <button
        type="button"
        aria-label="Close search"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search and commands"
        className="relative flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-line-strong bg-panel shadow-[var(--shadow-panel)]"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <SearchIcon className="size-4 shrink-0 text-fg-subtle" aria-hidden />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search concepts, questions, production problems…"
            aria-label="Search concepts"
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-fg-subtle"
          />
          <kbd className="hidden shrink-0 rounded border border-line px-1.5 py-0.5 text-2xs text-fg-subtle sm:block">
            Esc
          </kbd>
        </div>

        <ul ref={listRef} className="min-h-0 flex-1 overflow-y-auto p-2 scrollbar-thin">
          {all.length === 0 ? (
            <li className="px-3 py-8 text-center text-sm text-fg-muted">
              {query.trim().length >= 2 ? "No matches." : "Type to search."}
            </li>
          ) : null}

          {all.map((command, index) => {
            const Icon = command.icon;
            const isActive = index === activeIndex;
            const showGroup = command.group !== lastGroup;
            lastGroup = command.group;

            return (
              <li key={command.id}>
                {showGroup ? (
                  <p className="eyebrow px-2 pb-1 pt-3 first:pt-1">{command.group}</p>
                ) : null}
                <button
                  type="button"
                  data-active={isActive}
                  onMouseEnter={() => setCursor({ query, index })}
                  onClick={() => go(command.href)}
                  className={cn(
                    "flex w-full items-start gap-2.5 rounded-md px-2 py-2 text-left transition-colors",
                    command.level && levelClass(command.level),
                    isActive ? "bg-panel-raised" : "hover:bg-panel-raised",
                  )}
                >
                  <Icon
                    className="mt-0.5 size-3.5 shrink-0 text-fg-subtle"
                    style={command.level ? { color: "var(--level)" } : undefined}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="truncate text-sm">
                        <Highlight text={command.label} terms={terms} />
                      </span>
                      {command.hint ? (
                        <span className="shrink-0 text-2xs text-fg-subtle">{command.hint}</span>
                      ) : null}
                    </span>
                    {command.snippet ? (
                      <span className="mt-0.5 block truncate text-2xs text-fg-subtle">
                        <Highlight text={command.snippet} terms={terms} />
                      </span>
                    ) : null}
                  </span>
                  {isActive ? (
                    <CornerDownLeft className="mt-0.5 size-3 shrink-0 text-fg-subtle" aria-hidden />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
