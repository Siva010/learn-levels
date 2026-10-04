import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { TopicConcepts, TopicLevelSummary } from "@/components/learning/topic-concepts";
import { StatusPill } from "@/components/ui/pill";
import { SequenceNav, type SequenceItem } from "@/components/concepts/sequence-nav";
import {
  getCurriculum,
  getGroup,
  getGroupNeighbours,
  getLanguages,
  getTrack,
  trackCrumbs,
} from "@/lib/content/curriculum";

export function generateStaticParams() {
  return getLanguages().flatMap((language) =>
    (getCurriculum(language)?.groups ?? []).map((group) => ({ language, group: group.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ language: string; group: string }>;
}): Promise<Metadata> {
  const { language, group } = await params;
  return { title: getGroup(language, group)?.title ?? "Topic" };
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ language: string; group: string }>;
}) {
  const { language, group: groupSlug } = await params;
  const curriculum = getCurriculum(language);
  const group = getGroup(language, groupSlug);
  if (!curriculum || !group) notFound();

  // Previous/next topic across the whole track, so the last Java topic leads into Spring Boot.
  const track = getTrack(language);
  const neighbours = getGroupNeighbours(language, groupSlug);
  const toItem = (ref: typeof neighbours.next): SequenceItem | null =>
    ref
      ? {
          href: `/${ref.language}/${ref.group.slug}`,
          title: ref.group.title,
          context: `${ref.group.concepts.length} concepts`,
          language: ref.language,
          partTitle: `Part ${track.parts.indexOf(ref.language) + 1} · ${ref.partTitle}`,
        }
      : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8 lg:py-12">
      <Breadcrumbs
        items={[
          ...trackCrumbs(language),
          { label: group.title },
        ]}
      />

      <header className="mt-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-sm text-fg-subtle">
            {group.number.padStart(2, "0")}
          </span>
          <h1 className="text-3xl font-semibold tracking-tight">{group.title}</h1>
          <StatusPill status={group.status} />
        </div>
        <p className="mt-2 text-sm text-fg-muted">
          {group.concepts.length} concepts · 4 learning levels
        </p>
      </header>

      {group.concepts.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-line bg-panel p-8 text-center">
          <p className="text-sm font-medium">Coming soon</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-fg-muted">
            This topic group is listed in the curriculum but has not been written yet. Nothing is
            shown here rather than filling the gap with invented material.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-8">
            <TopicLevelSummary groupSlug={group.slug} />
          </div>

          <section className="mt-10">
            <h2 className="mb-3 text-sm font-semibold">Concepts</h2>
            <TopicConcepts groupSlug={group.slug} />
          </section>
        </>
      )}

      <div className="mt-10">
        <SequenceNav
          label="topic"
          language={language}
          previous={toItem(neighbours.previous)}
          next={toItem(neighbours.next)}
        />
      </div>
    </div>
  );
}
