import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { MasteryView } from "@/components/concepts/mastery-view";
import { getConcept, getCurriculum, getLanguages, trackCrumbs } from "@/lib/content/curriculum";

interface RouteParams {
  language: string;
  group: string;
  concept: string;
}

export function generateStaticParams() {
  return getLanguages().flatMap((language) =>
    (getCurriculum(language)?.groups ?? []).flatMap((group) =>
      group.concepts.map((concept) => ({
        language,
        group: group.slug,
        concept: concept.slug,
      })),
    ),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { language, group, concept } = await params;
  const found = getConcept(language, group, concept);
  return { title: found ? `${found.concept.title} — Mastery` : "Mastery" };
}

export default async function MasteryPage({ params }: { params: Promise<RouteParams> }) {
  const { language, group: groupSlug, concept: conceptSlug } = await params;
  const curriculum = getCurriculum(language);
  const found = getConcept(language, groupSlug, conceptSlug);
  if (!curriculum || !found) notFound();

  const { group, concept } = found;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-8 lg:py-12">
      <Breadcrumbs
        items={[
          ...trackCrumbs(language),
          { label: group.title, href: `/${language}/${groupSlug}` },
          { label: concept.title, href: `/${language}/${groupSlug}/${conceptSlug}` },
          { label: "Mastery" },
        ]}
      />

      <header className="mt-4">
        <p className="eyebrow">Mastery</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{concept.title}</h1>
      </header>

      <MasteryView language={language} groupSlug={groupSlug} conceptSlug={conceptSlug} />
    </div>
  );
}
