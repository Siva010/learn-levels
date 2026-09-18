import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LEVEL_ORDER, LEVEL_UI, levelClass } from "@/lib/levels";
import { DEFAULT_LANGUAGE, LANGUAGES, getCurriculum, getLanguages } from "@/lib/content/curriculum";
import { ThemeToggle } from "@/components/layout/theme";
import { StatusPill } from "@/components/ui/pill";

export default function HomePage() {
  const curriculum = getCurriculum(DEFAULT_LANGUAGE);
  const stats = curriculum?.stats;

  const languages = getLanguages().flatMap((id) => {
    const entry = getCurriculum(id);
    const config = LANGUAGES.find((language) => language.id === id);
    return entry && config ? [{ id, config, curriculum: entry }] : [];
  });
  const totalConcepts = languages.reduce((sum, entry) => sum + entry.curriculum.stats.concepts, 0);

  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-4 lg:px-8">
          <span className="grid size-6 place-items-center rounded bg-fg text-2xs font-bold text-bg">
            LL
          </span>
          <span className="text-sm font-semibold tracking-tight">Learn Levels</span>
          <div className="ml-auto flex items-center gap-2">
            {languages.map((entry) => (
              <Link
                key={entry.id}
                href={`/${entry.id}`}
                className="rounded-md px-3 py-1.5 text-xs text-fg-muted transition-colors hover:text-fg"
              >
                {entry.curriculum.title}
              </Link>
            ))}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 lg:px-8">
        {/* ---------------------------------------------------------------- hero */}
        <section className="py-20 lg:py-28">
          <p className="eyebrow">A progressive learning system</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Learn a language in Levels.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-fg-muted">
            From knowing what a concept is → understanding how it works → surviving the interview →
            using it in production.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {languages.map((entry, index) => (
              <Link
                key={entry.id}
                href={`/${entry.id}`}
                className={
                  index === 0
                    ? "inline-flex h-10 items-center gap-2 rounded-md bg-fg px-5 text-sm font-medium text-bg transition-opacity hover:opacity-90"
                    : "inline-flex h-10 items-center gap-2 rounded-md border border-line px-5 text-sm font-medium text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
                }
              >
                {entry.curriculum.title}
                <ArrowRight className="size-4" />
              </Link>
            ))}
            {stats ? (
              <p className="text-xs text-fg-subtle">
                {totalConcepts} concepts across {languages.length} languages · 4 levels each
              </p>
            ) : null}
          </div>
        </section>

        {/* -------------------------------------------------------------- levels */}
        <section className="border-t border-line py-14">
          <h2 className="text-sm font-semibold">The four levels</h2>
          <p className="mt-1 text-sm text-fg-muted">
            The same topic, taught four times over — each pass answering a harder question.
          </p>

          <ol className="mt-8 grid gap-px overflow-hidden rounded-lg border border-line bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-4">
            {LEVEL_ORDER.map((level, index) => {
              const ui = LEVEL_UI[level];
              return (
                <li
                  key={level}
                  className={`flex flex-col bg-panel p-5 ${levelClass(level)}`}
                >
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-2xs text-fg-subtle">
                      Level {index + 1}
                    </span>
                    <span
                      className="text-2xs font-semibold uppercase tracking-[0.12em]"
                      style={{ color: "var(--level)" }}
                    >
                      {ui.tag}
                    </span>
                  </div>

                  <h3 className="mt-3 text-lg font-semibold tracking-tight">{ui.title}</h3>
                  <p className="mt-1 text-sm font-medium text-fg-muted">{ui.tagline}</p>
                  <p className="mt-3 text-xs text-fg-subtle">{ui.summary}</p>

                  <ul className="mt-4 space-y-1 border-t border-line pt-4 text-xs text-fg-muted">
                    {ui.focus.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span
                          className="size-1 shrink-0 rounded-full"
                          style={{ backgroundColor: "var(--level)" }}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div
                    className="mt-5 h-0.5 w-full rounded-full"
                    style={{ backgroundColor: "var(--level)", opacity: 0.35 }}
                  />
                </li>
              );
            })}
          </ol>
        </section>

        {/* ---------------------------------------------------------- philosophy */}
        <section className="border-t border-line py-14">
          <blockquote className="max-w-2xl space-y-2 text-lg font-medium leading-snug tracking-tight">
            <p>Knowing a concept is not the same as understanding it.</p>
            <p className="text-fg-muted">
              Understanding it is not the same as explaining it.
            </p>
            <p className="text-fg-subtle">
              Explaining it is not the same as using it correctly in production.
            </p>
          </blockquote>
          <p className="mt-5 max-w-2xl text-sm text-fg-muted">
            The four levels exist specifically to close those gaps.
          </p>
        </section>

        {/* ---------------------------------------------------------- curricula */}
        {languages.map((entry) => (
          <section key={entry.id} className="border-t border-line py-14">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-sm font-semibold">{entry.curriculum.title} curriculum</h2>
              <Link
                href={`/${entry.id}`}
                className="text-xs text-fg-muted transition-colors hover:text-fg"
              >
                Open dashboard →
              </Link>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-fg-muted">{entry.config.blurb}</p>
            <p className="mt-1 text-xs text-fg-subtle">
              {entry.curriculum.stats.concepts} concepts ·{" "}
              {entry.curriculum.stats.groupsComplete}{" "}
              {entry.curriculum.stats.groupsComplete === 1 ? "topic group" : "topic groups"} written
              {entry.curriculum.stats.groupsPlanned > 0
                ? ` · ${entry.curriculum.stats.groupsPlanned} still being written`
                : ""}
            </p>

            <ul className="mt-4 grid gap-x-8 gap-y-px sm:grid-cols-2">
              {entry.curriculum.groups.map((group) => (
                <li
                  key={group.slug}
                  className="flex items-center gap-3 border-b border-line py-2.5 text-sm last:border-b-0"
                >
                  <span className="font-mono text-xs tabular-nums text-fg-subtle">
                    {group.number.padStart(2, "0")}
                  </span>
                  {group.concepts.length > 0 ? (
                    <Link
                      href={`/${entry.id}/${group.slug}`}
                      className="min-w-0 flex-1 truncate transition-colors hover:text-fg"
                    >
                      {group.title}
                    </Link>
                  ) : (
                    <span className="min-w-0 flex-1 truncate text-fg-subtle">{group.title}</span>
                  )}
                  {group.concepts.length > 0 ? (
                    <span className="shrink-0 text-2xs text-fg-subtle">
                      {group.concepts.length} concepts
                    </span>
                  ) : (
                    <StatusPill status={group.status} />
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}

        <footer className="border-t border-line py-8 text-2xs text-fg-subtle">
          All educational content is rendered from the source Markdown curriculum. Groups marked
          &ldquo;coming soon&rdquo; are shown as written — nothing is filled in.
        </footer>
      </main>
    </div>
  );
}
