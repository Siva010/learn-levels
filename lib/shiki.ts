import "server-only";

import { createHighlighter, type Highlighter } from "shiki";

const LANGS = ["java", "bash", "typescript", "json", "xml", "properties", "sql"] as const;

const ALIASES: Record<string, string> = {
  ts: "typescript",
  sh: "bash",
  shell: "bash",
  console: "bash",
  yaml: "properties",
  yml: "properties",
};

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  highlighterPromise ??= createHighlighter({
    themes: ["github-light", "github-dark-default"],
    langs: [...LANGS],
  });
  return highlighterPromise;
}

export function normalizeLang(lang: string): string | null {
  const key = ALIASES[lang] ?? lang;
  return (LANGS as readonly string[]).includes(key) ? key : null;
}

/**
 * Highlights a snippet for both themes at once. Shiki emits `--shiki-light` / `--shiki-dark`
 * custom properties per token, and globals.css picks the right one — so theme switching costs
 * nothing at runtime and there is no flash on load.
 */
export async function highlight(code: string, lang: string): Promise<string | null> {
  const language = normalizeLang(lang);
  if (!language) return null;

  const highlighter = await getHighlighter();
  return highlighter.codeToHtml(code, {
    lang: language,
    themes: { light: "github-light", dark: "github-dark-default" },
    defaultColor: false,
  });
}
