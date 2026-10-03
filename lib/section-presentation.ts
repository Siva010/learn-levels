import type { SectionKind } from "@/types/content";

/**
 * How a section is presented.
 *
 *   lead  — no label, larger type. Used for opening definitions and Foundation prose.
 *   plain — label above the blocks. The default.
 *   panel — bordered, tinted, icon-led. Used where the section *is* a semantic warning:
 *           the whole Production level reads as an engineering handbook of these.
 *   reveal — a panel whose first block is a question and whose remaining blocks stay folded
 *            until the reader asks for them, so they can commit to a prediction first.
 */
export type SectionVariant = "lead" | "plain" | "panel" | "reveal";

export type SectionTone = "neutral" | "info" | "success" | "warning" | "danger" | "accent";

export interface SectionPresentation {
  variant: SectionVariant;
  tone: SectionTone;
  /** Key into SECTION_ICONS; kept as a string so this module stays free of JSX. */
  icon?: string;
}

const PANEL = (tone: SectionTone, icon: string): SectionPresentation => ({
  variant: "panel",
  tone,
  icon,
});

const PRESENTATION: Partial<Record<SectionKind, SectionPresentation>> = {
  // ---------------------------------------------------------------- foundation
  prose: { variant: "lead", tone: "neutral" },

  // ----------------------------------------------------------------- interview
  definition: { variant: "lead", tone: "neutral" },
  "why-it-exists": PANEL("accent", "target"),
  "interview-explanation": PANEL("accent", "mic"),
  "key-facts": PANEL("info", "pin"),
  "confused-with": PANEL("warning", "shuffle"),
  "edge-cases": PANEL("warning", "corner"),

  // ---------------------------------------------------------------- understand
  problem: PANEL("accent", "target"),
  predict: { variant: "reveal", tone: "success", icon: "brain" },
  intuition: PANEL("info", "lightbulb"),
  terminology: PANEL("neutral", "book"),
  "common-mistakes": PANEL("warning", "alert"),
  relationships: PANEL("neutral", "network"),

  // ---------------------------------------------------------------- production
  "best-practices": PANEL("success", "check"),
  "production-bugs": PANEL("danger", "bug"),
  "anti-pattern": PANEL("danger", "ban"),
  security: PANEL("danger", "shield"),
  performance: PANEL("info", "gauge"),
  scalability: PANEL("info", "trending"),
  debugging: PANEL("info", "search"),
  testing: PANEL("neutral", "flask"),
  maintainability: PANEL("neutral", "wrench"),
  "real-world": PANEL("neutral", "building"),
  framework: PANEL("neutral", "layers"),
  monitoring: PANEL("info", "activity"),
  logging: PANEL("neutral", "scroll"),
  memory: PANEL("info", "cpu"),
  "modern-recommendations": PANEL("success", "sparkles"),
  deprecated: PANEL("warning", "archive"),
  readability: PANEL("neutral", "eye"),
};

export function presentationFor(kind: SectionKind): SectionPresentation {
  return PRESENTATION[kind] ?? { variant: "plain", tone: "neutral" };
}

export const TONE_COLOR: Record<SectionTone, string> = {
  neutral: "var(--fg-subtle)",
  info: "var(--tone-info)",
  success: "var(--tone-success)",
  warning: "var(--tone-warning)",
  danger: "var(--tone-danger)",
  accent: "var(--level, var(--accent))",
};
