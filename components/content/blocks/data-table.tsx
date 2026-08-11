import type { TableBlock } from "@/types/content";
import { InlineMarkdown } from "@/components/content/inline-markdown";
import { cn } from "@/lib/utils";

const ALIGN_CLASS = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

/**
 * Comparison tables carry a lot of the Interview level's value, so they render as real tables.
 * The wrapper scrolls rather than letting a wide table push the page sideways on mobile.
 */
export function DataTable({ block }: { block: TableBlock }) {
  const hasHeader = block.head.some((cell) => cell.trim() !== "");

  return (
    <div className="my-4 overflow-x-auto rounded-lg border border-line scrollbar-thin">
      <table className="w-full min-w-max border-collapse text-sm">
        {hasHeader ? (
          <thead>
            <tr className="border-b border-line bg-panel-raised">
              {block.head.map((cell, index) => (
                <th
                  key={index}
                  scope="col"
                  className={cn(
                    "px-3 py-2 text-xs font-semibold text-fg",
                    ALIGN_CLASS[block.align[index] ?? "left"],
                  )}
                >
                  <InlineMarkdown>{cell}</InlineMarkdown>
                </th>
              ))}
            </tr>
          </thead>
        ) : null}
        <tbody>
          {block.rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-line last:border-b-0">
              {row.map((cell, cellIndex) => {
                const isRowHeader = cellIndex === 0 && !hasHeader;
                const Cell = isRowHeader ? "th" : "td";
                return (
                  <Cell
                    key={cellIndex}
                    scope={isRowHeader ? "row" : undefined}
                    className={cn(
                      "px-3 py-2 align-top leading-relaxed",
                      ALIGN_CLASS[block.align[cellIndex] ?? "left"],
                      cellIndex === 0 ? "font-medium text-fg" : "text-fg-muted",
                    )}
                  >
                    <InlineMarkdown>{cell}</InlineMarkdown>
                  </Cell>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
