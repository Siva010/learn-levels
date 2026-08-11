import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { SearchResults } from "@/components/search/search-results";
import { getCurriculum, getLanguages } from "@/lib/content/curriculum";

export const metadata: Metadata = { title: "Search" };

export function generateStaticParams() {
  return getLanguages().map((language) => ({ language }));
}

export default async function SearchPage({
  params,
}: {
  params: Promise<{ language: string }>;
}) {
  const { language } = await params;
  const curriculum = getCurriculum(language);
  if (!curriculum) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-8 lg:py-12">
      <Breadcrumbs
        items={[{ label: curriculum.title, href: `/${language}` }, { label: "Search" }]}
      />
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Search</h1>
      <p className="mt-1 mb-6 text-sm text-fg-muted">
        Across every concept and all four levels — definitions, interview questions, production
        problems and terminology.
      </p>

      <Suspense fallback={null}>
        <SearchResults language={language} />
      </Suspense>
    </div>
  );
}
