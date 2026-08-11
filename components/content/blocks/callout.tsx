import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Info,
  Lightbulb,
  Quote,
  type LucideIcon,
} from "lucide-react";
import type { CalloutBlock, CalloutVariant } from "@/types/content";
import { InlineMarkdown } from "@/components/content/inline-markdown";

const VARIANTS: Record<
  CalloutVariant,
  { icon: LucideIcon; tone: string; fallbackLabel: string }
> = {
  misconception: {
    icon: AlertTriangle,
    tone: "var(--tone-danger)",
    fallbackLabel: "Common misconception",
  },
  warning: { icon: AlertTriangle, tone: "var(--tone-warning)", fallbackLabel: "Warning" },
  "best-practice": {
    icon: CheckCircle2,
    tone: "var(--tone-success)",
    fallbackLabel: "Best practice",
  },
  tip: { icon: Lightbulb, tone: "var(--tone-info)", fallbackLabel: "Tip" },
  note: { icon: Info, tone: "var(--tone-info)", fallbackLabel: "Note" },
  terminology: { icon: BookOpen, tone: "var(--tone-info)", fallbackLabel: "Terminology" },
  quote: { icon: Quote, tone: "var(--fg-subtle)", fallbackLabel: "" },
};

export function Callout({ block }: { block: CalloutBlock }) {
  const variant = VARIANTS[block.variant] ?? VARIANTS.note;
  const Icon = variant.icon;
  const label = block.label || variant.fallbackLabel;

  return (
    <aside
      className="my-4 rounded-lg border border-line bg-panel p-4"
      style={{ borderLeftWidth: 2, borderLeftColor: variant.tone }}
    >
      {label ? (
        <p
          className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-[0.1em]"
          style={{ color: variant.tone }}
        >
          <Icon className="size-3.5" aria-hidden />
          {label}
        </p>
      ) : null}
      <div className="mt-1.5 text-sm leading-relaxed text-fg-muted [&>p+p]:mt-2">
        {block.markdown.split(/\n{2,}/).map((paragraph, index) => (
          <p key={index}>
            <InlineMarkdown>{paragraph}</InlineMarkdown>
          </p>
        ))}
      </div>
    </aside>
  );
}
