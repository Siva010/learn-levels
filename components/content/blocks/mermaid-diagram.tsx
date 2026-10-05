"use client";

import { useEffect, useId, useState } from "react";
import { CopyButton } from "@/components/content/copy-button";
import { useResolvedTheme } from "@/components/layout/theme";

/**
 * Renders a Mermaid diagram as SVG.
 *
 * Mermaid is ~500 KB, so it is imported dynamically — pages without diagrams never load it, and
 * only the Understand level has any. The raw source stays visible until the SVG is ready, so a
 * failed render degrades to readable content rather than a blank box.
 */
export function MermaidDiagram({ code }: { code: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const resolvedTheme = useResolvedTheme();
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: resolvedTheme === "light" ? "neutral" : "dark",
          fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
          // SVG text labels, not HTML ones. Mermaid wraps an HTML label only when its measured
          // width exactly equals the wrapping limit, and at a non-100% browser zoom or display
          // scale that measurement comes back fractional — so long labels stay on one line and
          // are clipped. SVG text is measured in the diagram's own units, which zoom cannot skew.
          htmlLabels: false,
          flowchart: { htmlLabels: false },
        });
        const { svg: rendered } = await mermaid.render(`mermaid-${id}`, code);
        if (active) setSvg(rendered);
      } catch {
        if (active) setFailed(true);
      }
    })();

    return () => {
      active = false;
    };
  }, [code, id, resolvedTheme]);

  return (
    <figure className="group relative my-4 overflow-hidden rounded-lg border border-line bg-panel">
      <figcaption className="flex items-center justify-between border-b border-line px-3 py-1.5">
        <span className="font-mono text-2xs uppercase tracking-wider text-fg-subtle">Diagram</span>
        <CopyButton value={code} label="Copy source" />
      </figcaption>

      {svg ? (
        <div
          className="mermaid-host overflow-x-auto px-4 py-5"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <div className="overflow-x-auto px-4 py-3">
          <pre className="font-mono text-[0.8125rem] leading-relaxed text-fg-muted">
            <code>{code}</code>
          </pre>
          {failed ? (
            <p className="mt-2 text-2xs text-fg-subtle">
              Diagram could not be rendered — the source is shown instead.
            </p>
          ) : null}
        </div>
      )}
    </figure>
  );
}
