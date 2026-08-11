"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import {
  applyTheme,
  getResolvedTheme,
  getStoredTheme,
  setTheme,
  subscribeTheme,
  systemTheme,
  type ResolvedTheme,
} from "@/lib/theme";

/**
 * Reads the current theme from the DOM class the pre-paint script set. The server snapshot is
 * "dark" (the default), which is safe because nothing renders theme-dependent *markup* — the
 * toggle switches icons with CSS, and Mermaid only draws on the client.
 */
export function useResolvedTheme(): ResolvedTheme {
  return useSyncExternalStore(subscribeTheme, getResolvedTheme, () => "dark" as const);
}

/** Keeps the theme following the OS while the user has expressed no preference. */
export function ThemeSync() {
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      if (getStoredTheme() === "system") applyTheme(systemTheme());
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return null;
}

/**
 * Icon visibility is driven by the `dark` class rather than React state, so the correct icon
 * shows on the very first paint — before hydration — with no mismatch.
 */
export function ThemeToggle() {
  return (
    <button
      type="button"
      onClick={() => setTheme(getResolvedTheme() === "dark" ? "light" : "dark")}
      className="grid size-8 place-items-center rounded-md border border-line text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
      aria-label="Toggle colour theme"
    >
      <Moon className="hidden size-4 dark:block" aria-hidden />
      <Sun className="size-4 dark:hidden" aria-hidden />
    </button>
  );
}
