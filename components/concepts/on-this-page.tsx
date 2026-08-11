"use client";

import { useEffect, useState } from "react";
import type { LevelId } from "@/types/content";
import { levelClass } from "@/lib/levels";
import { cn } from "@/lib/utils";

export interface PageSection {
  anchor: string;
  label: string;
}

/**
 * Documentation-style section rail. Uses a scroll listener rather than IntersectionObserver so
 * the active entry stays correct while scrolling fast and through short sections.
 */
export function OnThisPage({
  sections,
  level,
}: {
  sections: PageSection[];
  level: LevelId;
}) {
  const [active, setActive] = useState<string | null>(sections[0]?.anchor ?? null);

  useEffect(() => {
    if (sections.length === 0) return;

    const update = () => {
      // The section whose top has most recently passed the reading line.
      const line = 140;
      let current = sections[0].anchor;
      for (const section of sections) {
        const node = document.getElementById(section.anchor);
        if (!node) continue;
        if (node.getBoundingClientRect().top <= line) current = section.anchor;
      }
      setActive(current);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [sections]);

  if (sections.length < 2) return null;

  return (
    <nav
      className={cn("text-xs", levelClass(level))}
      aria-label="On this page"
    >
      <p className="eyebrow mb-3">On this page</p>
      <ul className="space-y-0.5 border-l border-line">
        {sections.map((section) => {
          const isActive = active === section.anchor;
          return (
            <li key={section.anchor}>
              <a
                href={`#${section.anchor}`}
                aria-current={isActive ? "location" : undefined}
                className={cn(
                  "-ml-px block border-l py-1 pl-3 transition-colors",
                  isActive
                    ? "border-current font-medium"
                    : "border-transparent text-fg-subtle hover:text-fg-muted",
                )}
                style={isActive ? { color: "var(--level)" } : undefined}
              >
                {section.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
