import type { SearchDoc } from "@/types/content";

/**
 * Loads the search index in the browser.
 *
 * The index is a static asset (~340 KB gzipped) fetched the first time the user searches, then
 * held for the session. It is deliberately *not* truncated: the whole point of search here is to
 * reach any sentence in the curriculum, so trimming section text would make content unfindable.
 */
const cache = new Map<string, Promise<SearchDoc[]>>();

export function loadSearchIndex(language: string): Promise<SearchDoc[]> {
  const existing = cache.get(language);
  if (existing) return existing;

  const request = fetch(`${basePath()}/search-index/${language}.json`)
    .then((response) => {
      if (!response.ok) throw new Error(`Search index unavailable: ${response.status}`);
      return response.json() as Promise<SearchDoc[]>;
    })
    .catch((error) => {
      // Don't poison the cache — a transient failure should be retryable.
      cache.delete(language);
      throw error;
    });

  cache.set(language, request);
  return request;
}

function basePath(): string {
  return process.env.NEXT_PUBLIC_BASE_PATH ?? "";
}
