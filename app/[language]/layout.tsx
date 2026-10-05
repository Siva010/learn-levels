import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { Sidebar } from "@/components/navigation/sidebar";
import { getTracks, getTrackSkeleton } from "@/lib/content/curriculum";
import { ProgressProvider } from "@/lib/progress/provider";

export default async function LanguageLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ language: string }>;
}) {
  const { language } = await params;
  const track = getTrackSkeleton(language);
  if (!track) notFound();

  // The header switches between tracks; a multi-part track opens at its first part.
  const tracks = getTracks().map((entry) => ({
    id: entry.id,
    title: entry.title,
    href: `/${entry.parts[0]}`,
    parts: entry.parts,
  }));

  return (
    <ProgressProvider track={track} language={language}>
      <div className="flex min-h-screen flex-col">
        <SiteHeader language={language} tracks={tracks} />
        <div className="flex flex-1">
          <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-72 shrink-0 border-r border-line lg:block">
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
