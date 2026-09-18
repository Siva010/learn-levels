/**
 * Parses content/<language>/*.md into the normalized content model consumed by the app.
 *
 * Run with `npm run build:content`, optionally with language ids to limit the run. Output lands
 * in data/generated/ and public/search-index/ — both generated, neither committed — so the app
 * never parses Markdown at request time.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadLanguage } from "../lib/content/load";
import { languageIds } from "../lib/content/languages";

const OUT_DIR = join(process.cwd(), "data", "generated");
/** The search index ships as a static asset — the browser fetches it on first search. */
const SEARCH_DIR = join(process.cwd(), "public", "search-index");

function build(language: string) {
  const { curriculum, searchDocs } = loadLanguage(language);

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(
    join(OUT_DIR, `${language}.curriculum.json`),
    `${JSON.stringify(curriculum, null, 2)}\n`,
  );

  mkdirSync(SEARCH_DIR, { recursive: true });
  writeFileSync(join(SEARCH_DIR, `${language}.json`), JSON.stringify(searchDocs));

  const { stats } = curriculum;
  console.log(`Generated ${language} curriculum`);
  console.log(
    `  ${stats.groupsComplete} groups complete, ${stats.groupsPlanned} planned, ${stats.concepts} concepts`,
  );
  for (const level of stats.perLevel) {
    console.log(
      `  ${level.level.padEnd(11)} ${String(level.concepts).padStart(3)} concepts  ` +
        `${String(level.sections).padStart(4)} sections  ` +
        `${String(level.codeBlocks).padStart(3)} code  ` +
        `${String(level.mermaidDiagrams).padStart(3)} diagrams  ` +
        `${String(level.tables).padStart(3)} tables  ` +
        `${String(level.callouts).padStart(3)} callouts  ` +
        `${String(level.questions).padStart(4)} questions`,
    );
  }
  console.log(`  ${searchDocs.length} search documents`);
}

function main() {
  const requested = process.argv.slice(2);
  const languages = requested.length > 0 ? requested : languageIds();
  languages.forEach((language, index) => {
    if (index > 0) console.log();
    build(language);
  });
}

main();
