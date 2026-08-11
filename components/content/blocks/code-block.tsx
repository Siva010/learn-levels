import type { CodeBlock as CodeBlockModel } from "@/types/content";
import { highlight } from "@/lib/shiki";
import { CopyButton } from "@/components/content/copy-button";
import { cn } from "@/lib/utils";

const LANG_LABELS: Record<string, string> = {
  java: "Java",
  bash: "Shell",
  text: "Text",
  ts: "TypeScript",
  typescript: "TypeScript",
};

/** Snippets longer than this get line numbers. */
const LINE_NUMBER_THRESHOLD = 6;

export async function CodeBlock({ block }: { block: CodeBlockModel }) {
  const html = await highlight(block.code, block.lang);
  const lineCount = block.code.split("\n").length;
  const numbered = lineCount > LINE_NUMBER_THRESHOLD;

  return (
    <figure className="group relative my-4 overflow-hidden rounded-lg border border-line bg-panel">
      <figcaption className="flex items-center justify-between border-b border-line px-3 py-1.5">
        <span className="font-mono text-2xs uppercase tracking-wider text-fg-subtle">
          {LANG_LABELS[block.lang] ?? block.lang}
        </span>
        <CopyButton value={block.code} />
      </figcaption>

      <div className={cn("code-scroll overflow-x-auto", numbered && "code-numbered")}>
        {html ? (
          <div className="shiki-host" dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <pre className="px-4 py-3 font-mono text-[0.8125rem] leading-relaxed">
            <code>{block.code}</code>
          </pre>
        )}
      </div>
    </figure>
  );
}
