"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import type { QaBlock } from "@/types/content";
import { InlineMarkdown } from "@/components/content/inline-markdown";
import { cn } from "@/lib/utils";

/**
 * An interview question as an expandable card. The answer is only shown when the source
 * supplies one — questions without a parenthetical answer stay questions, unanswered.
 */
export function QuestionCard({ block }: { block: QaBlock }) {
  const [open, setOpen] = useState(false);
  const hasAnswer = Boolean(block.answer);

  if (!hasAnswer) {
    return (
      <li className="flex gap-2.5 rounded-lg border border-line bg-panel px-3.5 py-2.5 text-sm">
        <span className="mt-[0.15rem] size-1.5 shrink-0 rounded-full bg-[var(--border-strong)]" />
        <span className="leading-relaxed">
          <InlineMarkdown>{block.question}</InlineMarkdown>
        </span>
      </li>
    );
  }

  return (
    <li className="overflow-hidden rounded-lg border border-line bg-panel">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-start gap-2.5 px-3.5 py-2.5 text-left text-sm transition-colors hover:bg-panel-raised"
      >
        <ChevronRight
          className={cn(
            "mt-0.5 size-3.5 shrink-0 text-fg-subtle transition-transform",
            open && "rotate-90",
          )}
          aria-hidden
        />
        <span className="leading-relaxed">
          <InlineMarkdown>{block.question}</InlineMarkdown>
        </span>
      </button>

      {open ? (
        <div className="border-t border-line px-3.5 py-3 pl-9 text-sm leading-relaxed text-fg-muted">
          <InlineMarkdown>{block.answer!}</InlineMarkdown>
        </div>
      ) : null}
    </li>
  );
}
