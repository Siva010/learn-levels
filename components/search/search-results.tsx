"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { LEVEL_UI, levelClass } from "@/lib/levels";
import { useSearch } from "@/lib/search/use-search";
import { Highlight } from "@/components/search/highlight";

export function SearchResults({ language, parts }: { language: string; parts: string[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const initial = params.get("q") ?? "";
  const [query, setQuery] = useState(initial);
  const { hits, terms, total, loading } = useSearch(query, parts, 40);

  // Keep the URL shareable without pushing a history entry per keystroke.
  useEffect(() => {
    const trimmed = query.trim();
    const next = trimmed ? `?q=${encodeURIComponent(trimmed)}` : "";
    const current = params.get("q") ?? "";
    if (trimmed === current) return;
    const timer = setTimeout(() => router.replace(`/${language}/search${next}`, { scroll: false }), 300);
    return () => clearTimeout(timer);
  }, [query, language, params, router]);

  return (
    <div>
      <label className="flex items-center gap-3 rounded-lg border border-line bg-panel px-4 focus-within:border-line-strong">
        <SearchIcon className="size-4 shrink-0 text-fg-subtle" aria-hidden />
        <input
          type="search"
          value={query}
          autoFocus
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search concepts, questions, production problems…"
          aria-label="Search the curriculum"
          className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-fg-subtle"
        />
      </label>

      <p className="mt-3 text-xs text-fg-subtle" aria-live="polite">
        {query.trim().length < 2
          ? "Type at least two characters."
          : loading
            ? "Searching…"
            : `${total} ${total === 1 ? "result" : "results"}`}
      </p>

      <ul className="mt-4 space-y-2">
        {hits.map((hit) => (
          <li key={hit.id}>
            <Link
              href={`/${hit.language ?? language}/${hit.groupSlug}/${hit.conceptSlug}/${hit.level}`}
              className={`block rounded-lg border border-line bg-panel p-4 transition-colors hover:border-line-strong ${levelClass(hit.level)}`}
            >
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-2xs text-fg-subtle">
                <span>{hit.groupTitle}</span>
                <span aria-hidden>›</span>
                <span className="text-fg-muted">{hit.conceptTitle}</span>
                <span aria-hidden>›</span>
                <span
                  className="font-semibold uppercase tracking-[0.1em]"
                  style={{ color: "var(--level)" }}
                >
                  {LEVEL_UI[hit.level].title}
                </span>
              </div>

              {hit.sectionLabel ? (
                <p className="mt-2 text-sm font-medium">
                  <Highlight text={hit.sectionLabel} terms={terms} />
                </p>
              ) : null}

              <p className="mt-1 text-xs leading-relaxed text-fg-muted">
                <Highlight text={hit.snippet} terms={terms} />
              </p>
            </Link>
          </li>
        ))}
      </ul>

      {!loading && query.trim().length >= 2 && hits.length === 0 ? (
        <p className="mt-8 text-center text-sm text-fg-muted">
          Nothing in the curriculum matches “{query.trim()}”.
        </p>
      ) : null}
    </div>
  );
}
