import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LEVEL_UI, LEVEL_ORDER, levelClass } from "@/lib/levels";
import {
  availableLevels,
  getConcept,
  getCurriculum,
  getLanguages,
  isLevelId,
  getConceptNeighbours,
  getTrack,
  trackCrumbs,
} from "@/lib/content/curriculum";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { ConceptProgress } from "@/components/concepts/concept-progress";
import { LevelFooter, LevelSwitcher } from "@/components/concepts/level-nav";
import { OnThisPage } from "@/components/concepts/on-this-page";
import { RelatedConcepts } from "@/components/concepts/related-concepts";
import { SequenceNav, type SequenceItem } from "@/components/concepts/sequence-nav";
import { SectionRenderer, sectionAnchor } from "@/components/content/section-renderer";
import { LevelTag } from "@/components/ui/pill";

interface RouteParams {
  language: string;
  group: string;
  concept: string;
  level: string;
}

/** Every concept-level page is prerendered — the content is static and Shiki runs at build time. */
export function generateStaticParams() {
  return getLanguages().flatMap((language) =>
    (getCurriculum(language)?.groups ?? []).flatMap((group) =>
      group.concepts.flatMap((concept) =>
        LEVEL_ORDER.map((level) => ({
          language,
          group: group.slug,
          concept: concept.slug,
          level,
        })),
      ),
    ),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { language, group, concept, level } = await params;
  const found = getConcept(language, group, concept);
  if (!found || !isLevelId(level)) return { title: "Concept" };
  return {
    title: `${found.concept.title} — ${LEVEL_UI[level].title}`,
    description: `${LEVEL_UI[level].question} ${found.concept.title} in ${found.group.title}.`,
  };
}

export default async function ConceptLevelPage({ params }: { params: Promise<RouteParams> }) {
  const { language, group: groupSlug, concept: conceptSlug, level } = await params;
  const curriculum = getCurriculum(language);
  const found = getConcept(language, groupSlug, conceptSlug);
  if (!curriculum || !found || !isLevelId(level)) notFound();

  const { group, concept } = found;
  const content = concept.levels[level];
  const available = availableLevels(concept);
  const ui = LEVEL_UI[level];

  const conceptRef = {
    language,
    groupSlug,
    conceptSlug,
    conceptId: concept.id,
    available,
  };

  // Previous/next concept at this level, across the whole track — Java runs on into Spring Boot.
  const track = getTrack(language);
  const neighbours = getConceptNeighbours(language, concept.id, level);
  const toItem = (ref: typeof neighbours.next): SequenceItem | null =>
    ref
      ? {
          href: `/${ref.language}/${ref.group.slug}/${ref.concept.slug}/${level}`,
          title: ref.concept.title,
          context: ref.group.title,
          language: ref.language,
          partTitle: `Part ${track.parts.indexOf(ref.language) + 1} · ${ref.partTitle}`,
        }
      : null;

  const pageSections = (content?.sections ?? [])
    .map((section, index) => ({ anchor: sectionAnchor(section, index), label: section.label }))
    .filter((entry) => entry.label);

  return (
    <div className={`mx-auto flex max-w-5xl gap-10 px-4 py-8 lg:px-8 lg:py-12 ${levelClass(level)}`}>
      <div className="min-w-0 max-w-3xl flex-1">
      <Breadcrumbs
        items={[
          ...trackCrumbs(language),
          { label: group.title, href: `/${language}/${groupSlug}` },
          { label: concept.title },
          { label: ui.title },
        ]}
      />

      <header className="mt-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <LevelTag level={level} />
          <span className="text-2xs text-fg-subtle">
            Level {LEVEL_ORDER.indexOf(level) + 1} of {LEVEL_ORDER.length}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight">{concept.title}</h1>
          <ConceptProgress
            language={language}
            groupSlug={groupSlug}
            groupTitle={group.title}
            conceptSlug={conceptSlug}
            conceptId={concept.id}
            conceptTitle={concept.title}
            level={level}
          />
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="text-sm text-fg-muted">{ui.question}</p>
          <Link
            href={`/${language}/${groupSlug}/${conceptSlug}/mastery`}
            className="text-2xs text-fg-subtle underline decoration-line-strong underline-offset-2 transition-colors hover:text-fg-muted"
          >
            View mastery
          </Link>
        </div>
      </header>

      {/* Sticky so level switching stays reachable while reading a long section. */}
      <div className="sticky top-14 z-30 -mx-4 mt-6 bg-bg/90 px-4 py-2 backdrop-blur lg:static lg:mx-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        <LevelSwitcher concept={conceptRef} current={level} />
      </div>

      {content ? (
        <>
          {content.viaAlias && content.sourceTitle ? (
            <p className="mt-6 rounded-lg border border-dashed border-line bg-panel px-4 py-3 text-xs text-fg-muted">
              At this level the source covers this concept under{" "}
              <span className="font-medium text-fg">{content.sourceTitle}</span>, which combines it
              with a neighbouring concept. The full section is shown below.
            </p>
          ) : null}

          <article className="mt-8 space-y-7">
            {content.sections.map((section, index) => (
              <SectionRenderer
                key={section.source.sourceId}
                section={section}
                index={index}
                level={level}
              />
            ))}
          </article>

          <p className="mt-10 text-2xs text-fg-subtle">
            Source: {content.source.file} · {content.source.headingPath.join(" → ")}
          </p>
        </>
      ) : (
        <div className="mt-8 rounded-lg border border-dashed border-line bg-panel p-8 text-center">
          <p className="text-sm font-medium">Coming soon</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-fg-muted">
            The source material does not cover {concept.title} at the {ui.title} level yet.
          </p>
          {available.length > 0 ? (
            <Link
              href={`/${language}/${groupSlug}/${conceptSlug}/${available[0]}`}
              className="mt-4 inline-flex items-center rounded-md border border-line px-3 py-1.5 text-xs text-fg-muted transition-colors hover:text-fg"
            >
              Go to {LEVEL_UI[available[0]].title}
            </Link>
          ) : null}
        </div>
      )}

        <RelatedConcepts
          language={language}
          group={group}
          concept={concept}
          level={level}
        />

        <LevelFooter concept={conceptRef} current={level} />

        <SequenceNav
          label={`concept at ${ui.title}`}
          language={language}
          previous={toItem(neighbours.previous)}
          next={toItem(neighbours.next)}
        />
      </div>

      <aside className="hidden w-48 shrink-0 xl:block">
        <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin">
          <OnThisPage sections={pageSections} level={level} />
        </div>
      </aside>
    </div>
  );
}
