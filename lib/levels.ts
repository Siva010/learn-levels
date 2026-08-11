import type { LevelId } from "@/types/content";

export const LEVEL_ORDER: LevelId[] = ["foundation", "understand", "interview", "production"];

/**
 * Level-facing UI copy from docs/Core Product Concept.md. This is product copy — navigation
 * labels and framing — not educational content, which comes only from the source Markdown.
 */
export interface LevelUi {
  title: string;
  tag: string;
  tagline: string;
  question: string;
  summary: string;
  focus: string[];
  /** Shown at the end of the level, pointing at the next one. */
  handoff: string;
}

export const LEVEL_UI: Record<LevelId, LevelUi> = {
  foundation: {
    title: "Foundation",
    tag: "MAP",
    tagline: "Know what it is.",
    question: "What is this?",
    summary: "Build the mental map.",
    focus: ["Definitions", "Purpose", "Terminology", "Basic examples", "Concept relationships"],
    handoff: "You know what it is. Now understand how it actually works.",
  },
  understand: {
    title: "Understand",
    tag: "MECHANISM",
    tagline: "Know how it works.",
    question: "How does this actually work?",
    summary: "Go beneath the surface.",
    focus: [
      "Internal mechanisms",
      "Memory behavior",
      "Execution flow",
      "Common misconceptions",
      "Deeper examples",
    ],
    handoff:
      "You understand the mechanism. Now test whether you can explain it under interview pressure.",
  },
  interview: {
    title: "Interview",
    tag: "PROVE",
    tagline: "Know how to explain it.",
    question: "Can I explain it under pressure?",
    summary: "Prepare for technical interviews.",
    focus: [
      "Interview questions",
      "Follow-up questions",
      "Edge cases",
      "Comparisons",
      "Important facts",
    ],
    handoff: "You can explain it. Now learn how it can fail in production.",
  },
  production: {
    title: "Production",
    tag: "BUILD",
    tagline: "Know how professionals use it.",
    question: "Can I use it correctly in real software?",
    summary: "Apply knowledge to real engineering.",
    focus: [
      "Best practices",
      "Production bugs",
      "Performance",
      "Security",
      "Debugging",
      "Anti-patterns",
    ],
    handoff: "You've completed the full learning cycle.",
  },
};

/** Sets `--level` for the subtree so components can style by level without branching. */
export function levelClass(level: LevelId): string {
  return `level-${level}`;
}

export function nextLevel(level: LevelId): LevelId | null {
  const index = LEVEL_ORDER.indexOf(level);
  return index >= 0 && index < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[index + 1] : null;
}

export function previousLevel(level: LevelId): LevelId | null {
  const index = LEVEL_ORDER.indexOf(level);
  return index > 0 ? LEVEL_ORDER[index - 1] : null;
}
