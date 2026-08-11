import {
  emptySnapshot,
  PROGRESS_VERSION,
  type ProgressSnapshot,
  type ProgressStore,
} from "./types";

const STORAGE_KEY = "learn-levels:progress:v1";

/**
 * localStorage-backed progress. Deliberately the only place that knows about the browser —
 * a server-backed store implements the same `ProgressStore` interface.
 */
export function createLocalProgressStore(): ProgressStore {
  const listeners = new Set<(snapshot: ProgressSnapshot) => void>();

  const parse = (raw: string | null): ProgressSnapshot => {
    if (!raw) return emptySnapshot();
    try {
      const parsed = JSON.parse(raw) as ProgressSnapshot;
      if (parsed?.version !== PROGRESS_VERSION || typeof parsed.languages !== "object") {
        return emptySnapshot();
      }
      return parsed;
    } catch {
      return emptySnapshot();
    }
  };

  return {
    async read() {
      if (typeof window === "undefined") return emptySnapshot();
      return parse(window.localStorage.getItem(STORAGE_KEY));
    },

    async write(snapshot) {
      if (typeof window === "undefined") return;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    },

    subscribe(listener) {
      listeners.add(listener);
      const onStorage = (event: StorageEvent) => {
        if (event.key !== STORAGE_KEY) return;
        listener(parse(event.newValue));
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", onStorage);
      };
    },
  };
}
