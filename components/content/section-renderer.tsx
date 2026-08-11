import type { Block, LevelId, QaBlock, Section } from "@/types/content";
import { presentationFor, TONE_COLOR } from "@/lib/section-presentation";
import { Callout } from "@/components/content/blocks/callout";
import { CodeBlock } from "@/components/content/blocks/code-block";
import { DataTable } from "@/components/content/blocks/data-table";
import { MermaidDiagram } from "@/components/content/blocks/mermaid-diagram";
import { QuestionCard } from "@/components/content/blocks/question-card";
import { SECTION_ICONS } from "@/components/content/section-icons";
import { InlineMarkdown } from "@/components/content/inline-markdown";
import { cn } from "@/lib/utils";

export function sectionAnchor(section: Section, index: number): string {
  return section.label ? `${section.id}-${index}` : `section-${index}`;
}

/**
 * Renders one parsed section in its level's idiom.
 *
 * Sections whose meaning *is* a warning — production bugs, anti-patterns, security — render as
 * icon-led panels, which is what gives the Production level its handbook feel. Everything else
 * keeps its verbatim source label above the blocks. No section is ever skipped for lacking a
 * bespoke layout: unrecognised labels fall through to the plain variant.
 */
export function SectionRenderer({
  section,
  index,
  level,
}: {
  section: Section;
  index: number;
  level: LevelId;
}) {
  const anchor = sectionAnchor(section, index);
  const presentation = presentationFor(section.kind);
  const Icon = presentation.icon ? SECTION_ICONS[presentation.icon] : undefined;
  const tone = TONE_COLOR[presentation.tone];

  if (presentation.variant === "lead") {
    return (
      <section id={anchor} className="scroll-mt-24">
        {section.label ? <SectionLabel anchor={anchor} label={section.label} /> : null}
        <div
          className={cn(
            "[&>p]:text-base [&>p]:leading-[1.75] [&>p]:text-fg",
            level === "foundation" && "[&>p]:text-[1.0625rem]",
          )}
        >
          <BlockList blocks={section.blocks} />
        </div>
      </section>
    );
  }

  if (presentation.variant === "panel") {
    return (
      <section
        id={anchor}
        className="scroll-mt-24 rounded-lg border border-line bg-panel p-4 sm:p-5"
        style={{ borderLeftWidth: 2, borderLeftColor: tone }}
      >
        <h2 className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-[0.1em]">
          {Icon ? <Icon className="size-3.5 shrink-0" aria-hidden style={{ color: tone }} /> : null}
          <a href={`#${anchor}`} className="no-underline" style={{ color: tone }}>
            {section.label}
          </a>
        </h2>
        <div className="mt-2 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
          <BlockList blocks={section.blocks} />
        </div>
      </section>
    );
  }

  return (
    <section id={anchor} className="scroll-mt-24">
      {section.label ? <SectionLabel anchor={anchor} label={section.label} /> : null}
      <div className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
        <BlockList blocks={section.blocks} />
      </div>
    </section>
  );
}

function SectionLabel({ anchor, label }: { anchor: string; label: string }) {
  return (
    <h2 className="group/label mb-2 text-sm font-semibold tracking-tight text-fg">
      <a href={`#${anchor}`} className="no-underline">
        {label}
        <span
          className="ml-1.5 text-fg-subtle opacity-0 transition-opacity group-hover/label:opacity-100"
          aria-hidden
        >
          #
        </span>
      </a>
    </h2>
  );
}

export function BlockList({ blocks }: { blocks: Block[] }) {
  const nodes: React.ReactNode[] = [];
  let index = 0;

  while (index < blocks.length) {
    const block = blocks[index];

    // Consecutive questions become one card list.
    if (block.type === "qa") {
      const run: QaBlock[] = [];
      const start = index;
      while (index < blocks.length && blocks[index].type === "qa") {
        run.push(blocks[index] as QaBlock);
        index += 1;
      }
      nodes.push(
        <ul key={`qa-${start}`} className="my-3 space-y-2">
          {run.map((entry, position) => (
            <QuestionCard key={position} block={entry} />
          ))}
        </ul>,
      );
      continue;
    }

    nodes.push(<BlockRenderer key={index} block={block} />);
    index += 1;
  }

  return <>{nodes}</>;
}

function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case "paragraph":
      return (
        <p className="my-3 text-sm leading-relaxed text-fg-muted">
          <InlineMarkdown>{block.markdown}</InlineMarkdown>
        </p>
      );

    case "code":
      return <CodeBlock block={block} />;

    case "mermaid":
      return <MermaidDiagram code={block.code} />;

    case "table":
      return <DataTable block={block} />;

    case "callout":
      return <Callout block={block} />;

    case "list": {
      const ListTag = block.ordered ? "ol" : "ul";
      return (
        <ListTag
          className={cn(
            "my-3 space-y-1.5 pl-5 text-sm leading-relaxed text-fg-muted marker:text-fg-subtle",
            block.ordered ? "list-decimal" : "list-disc",
          )}
        >
          {block.items.map((item, index) => (
            <li key={index} className="pl-0.5">
              <InlineMarkdown>{item}</InlineMarkdown>
            </li>
          ))}
        </ListTag>
      );
    }

    case "qa":
      return (
        <ul className="my-3 space-y-2">
          <QuestionCard block={block} />
        </ul>
      );

    default:
      return null;
  }
}
