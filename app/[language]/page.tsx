import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContinueLearning } from "@/components/learning/continue-learning";
import { CurriculumList } from "@/components/learning/curriculum-list";
import { LevelGuides } from "@/components/learning/level-guides";
import { ProgressOverview } from "@/components/learning/progress-overview";
import { getCurriculum, getLanguages } from "@/lib/content/curriculum";

export function generateStaticParams() {
  return getLanguages().map((language) => ({ language }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ language: string }>;
}): Promise<Metadata> {
  const { language } = await params;
  const curriculum = getCurriculum(language);
  return { title: curriculum ? `${curriculum.title} — Dashboard` : "Dashboard" };
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ language: string }>;
}) {
  const { language } = await params;
  const curriculum = getCurriculum(language);
  if (!curriculum) notFound();

  const { stats } = curriculum;
  const totalSections = stats.perLevel.reduce((sum, level) => sum + level.sections, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8 lg:py-12">
      <header>
        <p className="eyebrow">Curriculum</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{curriculum.title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-fg-muted">
          {stats.concepts} concepts across {stats.groupsComplete} topic groups, each taught through
          four levels — {totalSections.toLocaleString()} sections drawn from the source material.
        </p>
      </header>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_20rem]">
        <ContinueLearning />
        <ProgressOverview />
      </div>

      <div className="mt-10">
        <CurriculumList />
      </div>

      <div className="mt-12">
        <LevelGuides levels={curriculum.levels} />
      </div>
    </div>
  );
}
