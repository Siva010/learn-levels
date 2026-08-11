import { notFound } from "next/navigation";
import {
  availableLevels,
  getConcept,
  getCurriculum,
  getLanguages,
} from "@/lib/content/curriculum";
import { ConceptRedirect } from "@/components/concepts/concept-redirect";

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

/**
 * A concept has no page of its own — it opens at its first available level.
 *
 * The redirect happens on the client rather than through `redirect()` because a static export has
 * no server to issue a 3xx. The page still prerenders, and includes a plain link so it works
 * without JavaScript.
 */
export default async function ConceptIndexPage({ params }: { params: Promise<RouteParams> }) {
  const { language, group, concept } = await params;
  const found = getConcept(language, group, concept);
  if (!found) notFound();

  const levels = availableLevels(found.concept);
  if (levels.length === 0) notFound();

  return (
    <ConceptRedirect
      href={`/${language}/${group}/${concept}/${levels[0]}`}
      title={found.concept.title}
    />
  );
}
