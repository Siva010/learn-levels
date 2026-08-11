export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "learn-levels:theme";

/**
 * Applies the stored theme before first paint, so there is no flash of the wrong theme.
 *
 * Injected via next/script with `beforeInteractive` — deliberately outside React's tree.
 * Rendering a <script> inside a component makes React insert it a second time during
 * hydration, which fails hydration for the whole page.
 */
export const THEME_SCRIPT = `(function(){try{
var k=${JSON.stringify(THEME_STORAGE_KEY)};
var s=localStorage.getItem(k);
var sys=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";
var t=(s==="light"||s==="dark")?s:sys;
var e=document.documentElement;
e.classList.toggle("dark",t!=="light");
e.classList.toggle("light",t==="light");
e.style.colorScheme=t;
}catch(err){document.documentElement.classList.add("dark");}})();`;

/**
 * The `dark`/`light` class on <html> is the single source of truth for the current theme —
 * set by the script above before paint, and by setTheme afterwards.
 */
export function getResolvedTheme(): ResolvedTheme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : "system";
}

export function systemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function applyTheme(resolved: ResolvedTheme): void {
  const element = document.documentElement;
  element.classList.toggle("dark", resolved === "dark");
  element.classList.toggle("light", resolved === "light");
  element.style.colorScheme = resolved;
}

export function setTheme(theme: Theme): void {
  if (theme === "system") window.localStorage.removeItem(THEME_STORAGE_KEY);
  else window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  applyTheme(theme === "system" ? systemTheme() : theme);
}

/** Notifies when the theme class changes, from this tab or another. */
export function subscribeTheme(listener: () => void): () => void {
  const observer = new MutationObserver(listener);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY) return;
    applyTheme(getStoredTheme() === "system" ? systemTheme() : getStoredTheme() === "light" ? "light" : "dark");
    listener();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    observer.disconnect();
    window.removeEventListener("storage", onStorage);
  };
}
