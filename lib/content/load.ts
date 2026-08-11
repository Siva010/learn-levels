import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { LevelId } from "@/types/content";
import { LEVEL_IDS } from "@/types/content";
import { LEVEL_FILES } from "./registry";
import { buildCurriculum, parseFile, type BuildResult, type ParsedFile } from "./parser";

export const CONTENT_ROOT = join(process.cwd(), "content");

/** Parses every level file for a language. Node-only — used by build scripts, not the browser. */
export function loadLanguage(language = "java"): BuildResult {
  const files = {} as Record<LevelId, ParsedFile>;

  for (const level of LEVEL_IDS) {
    const file = LEVEL_FILES[level];
    const path = join(CONTENT_ROOT, language, file);
    files[level] = parseFile(readFileSync(path, "utf8"), file, level);
  }

  return buildCurriculum(language, files);
}
