import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { Sidebar } from "@/components/navigation/sidebar";
import { getCurriculum, getLanguages, getSkeleton } from "@/lib/content/curriculum";
import { ProgressProvider } from "@/lib/progress/provider";

export default async function LanguageLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ language: string }>;
}) {
  const { language } = await params;
  const skeleton = getSkeleton(language);
  if (!skeleton) notFound();

  const languages = getLanguages().map((id) => ({
    id,
    title: getCurriculum(id)?.title ?? id,
  }));

  return (
    <ProgressProvider skeleton={skeleton}>
      <div className="flex min-h-screen flex-col">
        <SiteHeader language={language} languages={languages} />
        <div className="flex flex-1">
          <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 border-r border-line lg:block">
            <Sidebar />
          </aside>
          <main id="main" className="min-w-0 flex-1">
            {children}
          </main>
        </div>
      </div>
    </ProgressProvider>
  );
}
