import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContinueLearning } from "@/components/learning/continue-learning";
import { CurriculumList } from "@/components/learning/curriculum-list";
import { LevelGuides } from "@/components/learning/level-guides";
import { ProgressOverview } from "@/components/learning/progress-overview";
import { getCurriculum, getLanguages, getTrack } from "@/lib/content/curriculum";
import type { Curriculum } from "@/types/content";

export function generateStaticParams() {
  return getLanguages().map((language) => ({ language }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ language: string }>;
}): Promise<Metadata> {
  const { language } = await params;
  return getCurriculum(language)
    ? { title: `${getTrack(language).title} — Dashboard` }
    : { title: "Dashboard" };
}

/**
 * The dashboard of a whole track. Every part of a multi-part track renders the same dashboard —
 * the parts are one curriculum to the learner — so /java and /spring-boot both show
 * Java + Spring Boot.
 */
export default async function DashboardPage({
  params,
}: {
  params: Promise<{ language: string }>;
}) {
  const { language } = await params;
  if (!getCurriculum(language)) notFound();

  const track = getTrack(language);
  const parts = track.parts.flatMap((part) => {
    const curriculum = getCurriculum(part);
    return curriculum ? [curriculum] : [];
  });

  const concepts = sum(parts, (part) => part.stats.concepts);
  const groups = sum(parts, (part) => part.stats.groupsComplete);
  const sections = sum(parts, (part) =>
    part.stats.perLevel.reduce((total, level) => total + level.sections, 0),
  );
  const multiPart = parts.length > 1;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8 lg:py-12">
      <header>
        <p className="eyebrow">Curriculum</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{track.title}</h1>
        {multiPart ? (
          <p className="mt-2 max-w-2xl text-sm text-fg-muted">{track.blurb}</p>
        ) : null}
        <p className="mt-2 max-w-2xl text-sm text-fg-muted">
          {multiPart
            ? `${concepts} concepts across ${groups} topic groups in ${parts.length} parts — ${parts
                .map((part) => part.title)
                .join(", then ")}. Each is taught through four levels: ${sections.toLocaleString()} sections drawn from the source material.`
            : `${concepts} concepts across ${groups} topic groups, each taught through four levels — ${sections.toLocaleString()} sections drawn from the source material.`}
        </p>
      </header>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_20rem]">
        <ContinueLearning />
        <ProgressOverview />
      </div>

      <div className="mt-10">
        <CurriculumList />
      </div>

      <div className="mt-12 space-y-10">
        {parts.map((part, index) => (
          <LevelGuides
            key={part.language}
            levels={part.levels}
            title={multiPart ? `About each level — Part ${index + 1}, ${part.title}` : undefined}
          />
        ))}
      </div>
    </div>
  );
}

function sum(parts: Curriculum[], value: (part: Curriculum) => number): number {
  return parts.reduce((total, part) => total + value(part), 0);
}
