import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Concept, Group, LevelId } from "@/types/content";

/**
 * Concept relationships.
 *
 * The source's `[[#...]]` links only ever appear in tables of contents, so `related` is derived
 * at build time from concepts this one actually mentions by name (see resolveRelated in
 * lib/content/parser). Siblings come from the source's own group structure.
 */
export function RelatedConcepts({
  language,
  group,
  concept,
  level,
}: {
  language: string;
  group: Group;
  concept: Concept;
  level: LevelId;
}) {
  const siblings = group.concepts.filter((entry) => entry.id !== concept.id).slice(0, 6);
  if (concept.related.length === 0 && siblings.length === 0) return null;

  return (
    <section className="mt-12 border-t border-line pt-6">
      {concept.related.length > 0 ? (
        <div>
          <h2 className="eyebrow">Related concepts</h2>
          <p className="mt-1 text-2xs text-fg-subtle">
            Concepts this one refers to in the source material.
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {concept.related.map((ref) => (
              <li key={`${ref.groupSlug}/${ref.conceptSlug}`}>
                <Link
                  href={`/${language}/${ref.groupSlug}/${ref.conceptSlug}/${level}`}
                  className="inline-flex items-center gap-1 rounded-md border border-line bg-panel px-2.5 py-1.5 text-xs text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
                >
                  {ref.title}
                  <ArrowUpRight className="size-3 text-fg-subtle" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {siblings.length > 0 ? (
        <div className="mt-6">
          <h2 className="eyebrow">More in {group.title}</h2>
          <ul className="mt-3 grid gap-x-6 gap-y-px sm:grid-cols-2">
            {siblings.map((sibling) => (
              <li key={sibling.id} className="border-b border-line last:border-b-0">
                <Link
                  href={`/${language}/${group.slug}/${sibling.slug}/${
                    sibling.levels[level] ? level : "foundation"
                  }`}
                  className="flex items-baseline gap-2.5 py-2 text-xs text-fg-muted transition-colors hover:text-fg"
                >
                  <span className="font-mono tabular-nums text-fg-subtle">{sibling.number}</span>
                  <span className="truncate">{sibling.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
