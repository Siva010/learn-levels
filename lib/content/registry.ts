import type {
  CalloutVariant,
  LevelId,
  LevelMeta,
  SectionKind,
  SourceFile,
} from "@/types/content";

/* -------------------------------------------------------------------- slugs */

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[&/]/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** "2.6 Polymorphism" -> { number: "2.6", title: "Polymorphism" } */
export function splitNumberedHeading(heading: string): { number: string; title: string } {
  // Group headings read "1. Java Fundamentals"; concept headings read "1.1 What is Java?".
  const match = /^(\d+(?:\.\d+)?)\.?\s+(.*)$/.exec(heading.trim());
  if (!match) return { number: "", title: heading.trim() };
  return { number: match[1], title: match[2].trim() };
}

/* ------------------------------------------------------------------- levels */

export const LEVEL_FILES: Record<LevelId, SourceFile> = {
  foundation: "0_foundation.md",
  understand: "1_understand.md",
  interview: "2_interview.md",
  production: "3_production.md",
};

/**
 * Level identity. `tag` / `tagline` / `question` are product UI copy from
 * docs/Core Product Concept.md — not educational content.
 */
export const LEVEL_META: Omit<LevelMeta, "goal">[] = [
  {
    id: "foundation",
    index: 0,
    title: "Foundation",
    tag: "MAP",
    tagline: "Know what it is.",
    question: "What is this?",
    file: "0_foundation.md",
  },
  {
    id: "understand",
    index: 1,
    title: "Understand",
    tag: "MECHANISM",
    tagline: "Know how it works.",
    question: "How does this actually work?",
    file: "1_understand.md",
  },
  {
    id: "interview",
    index: 2,
    title: "Interview",
    tag: "PROVE",
    tagline: "Know how to explain it.",
    question: "Can I explain it under pressure?",
    file: "2_interview.md",
  },
  {
    id: "production",
    index: 3,
    title: "Production",
    tag: "BUILD",
    tagline: "Know how professionals use it.",
    question: "Can I use it correctly in real software?",
    file: "3_production.md",
  },
];

/** Copy shown at the bottom of each level, from the product spec's progression section. */
export const LEVEL_HANDOFF: Record<LevelId, string> = {
  foundation: "You know what it is. Now understand how it actually works.",
  understand:
    "You understand the mechanism. Now test whether you can explain it under interview pressure.",
  interview: "You can explain it. Now learn how it can fail in production.",
  production: "You've completed the full learning cycle.",
};

/* ------------------------------------------------------------------ callouts */

const CALLOUT_VARIANTS: Array<[RegExp, CalloutVariant]> = [
  [/^common\s+misconception/i, "misconception"],
  [/^warning/i, "warning"],
  [/^best\s+practice/i, "best-practice"],
  [/^tip/i, "tip"],
  [/^(important\s+)?terminology/i, "terminology"],
  [/^common\s+mistake/i, "warning"],
  [/^note/i, "note"],
];

export function calloutVariantFor(label: string): CalloutVariant {
  for (const [pattern, variant] of CALLOUT_VARIANTS) {
    if (pattern.test(label)) return variant;
  }
  return label ? "note" : "quote";
}

/* ------------------------------------------------------------- section kinds */

/**
 * Maps source section labels onto presentation kinds. Anything not listed here keeps its
 * verbatim label and renders as a generic labelled section — the Understand file has a long
 * tail of one-off labels that must not be discarded.
 */
const SECTION_KINDS: Array<[RegExp, SectionKind]> = [
  // interview (fixed vocabulary)
  [/^definition$/i, "definition"],
  [/^why (it|this) exists$/i, "why-it-exists"],
  [/^interview explanation$/i, "interview-explanation"],
  [/^syntax/i, "syntax"],
  [/^example/i, "example"],
  [/^common interview questions$/i, "questions"],
  [/^follow-up questions$/i, "follow-ups"],
  [/^edge cases$/i, "edge-cases"],
  [/^common mistakes?$/i, "common-mistakes"],
  [/^comparisons?$/i, "comparisons"],
  [/^complexity/i, "complexity"],
  [/^frequently confused with$/i, "confused-with"],
  [/^important facts to remember$/i, "key-facts"],
  // understand
  [/^how (it|they|this) (works?|work)/i, "how-it-works"],
  [/^internal mechanism$/i, "how-it-works"],
  [/^advantages/i, "advantages"],
  [/^disadvantages/i, "disadvantages"],
  [/^best intuition$/i, "intuition"],
  [/^terminology$/i, "terminology"],
  [/^relationships/i, "relationships"],
  [/^time\/space complexity$/i, "complexity"],
  [/^time complexity$/i, "complexity"],
  // production
  [/^best practices/i, "best-practices"],
  [/^common production bugs$/i, "production-bugs"],
  [/^performance considerations$/i, "performance"],
  [/^scalability concerns$/i, "scalability"],
  [/^security implications$/i, "security"],
  [/^debugging tips$/i, "debugging"],
  [/^testing advice$/i, "testing"],
  [/^maintainability$/i, "maintainability"],
  [/^anti-patterns?$/i, "anti-pattern"],
  [/^real-world use case/i, "real-world"],
  [/^framework relevance$/i, "framework"],
  [/^monitoring$/i, "monitoring"],
  [/^logging$/i, "logging"],
  [/^memory considerations$/i, "memory"],
  [/^modern recommendations$/i, "modern-recommendations"],
  [/^deprecated approaches to avoid$/i, "deprecated"],
  [/^migration guidance$/i, "deprecated"],
  [/^readability$/i, "readability"],
];

export function sectionKindFor(label: string): SectionKind {
  if (!label) return "prose";
  for (const [pattern, kind] of SECTION_KINDS) {
    if (pattern.test(label)) return kind;
  }
  return "generic";
}

/** Sections whose list items are interview questions rather than plain bullets. */
export function isQuestionSection(kind: SectionKind): boolean {
  return kind === "questions" || kind === "follow-ups";
}
