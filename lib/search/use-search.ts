"use client";

import { useEffect, useState } from "react";
import type { LevelId } from "@/types/content";
import { loadSearchIndex } from "./client-index";
import { search } from "./engine";

export interface SearchHit {
  id: string;
  groupSlug: string;
  groupTitle: string;
  conceptSlug: string;
  conceptTitle: string;
  level: LevelId;
  sectionLabel: string;
  snippet: string;
  score: number;
}

export interface SearchState {
  hits: SearchHit[];
  terms: string[];
  total: number;
  loading: boolean;
  /** Set when the index itself could not be fetched. */
  error: boolean;
}

interface Snapshot {
  query: string;
  hits: SearchHit[];
  terms: string[];
  total: number;
  error: boolean;
}

const EMPTY: Snapshot = { query: "", hits: [], terms: [], total: 0, error: false };

export const MIN_QUERY_LENGTH = 2;

/**
 * Debounced search against the client-side index.
 *
 * State is only written once a result is ready; "loading" and the empty case are derived during
 * render, so there is no synchronous setState in an effect.
 */
export function useSearch(query: string, language: string, limit = 30): SearchState {
  const [snapshot, setSnapshot] = useState<Snapshot>(EMPTY);
  const trimmed = query.trim();

  useEffect(() => {
    const target = query.trim();
    if (target.length < MIN_QUERY_LENGTH) return;

    let active = true;
    const timer = setTimeout(async () => {
      try {
        const docs = await loadSearchIndex(language);
        if (!active) return;
        const result = search(docs, target, { limit });
        setSnapshot({
          query: target,
          hits: result.hits,
          terms: result.terms,
          total: result.total,
          error: false,
        });
      } catch {
        if (!active) return;
        setSnapshot({ ...EMPTY, query: target, error: true });
      }
    }, 160);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, language, limit]);

  if (trimmed.length < MIN_QUERY_LENGTH) {
    return { hits: [], terms: [], total: 0, loading: false, error: false };
  }

  const fresh = snapshot.query === trimmed;
  return {
    hits: fresh ? snapshot.hits : [],
    terms: fresh ? snapshot.terms : [],
    total: fresh ? snapshot.total : 0,
    loading: !fresh,
    error: fresh && snapshot.error,
  };
}
