import { Fragment, type ReactNode } from "react";

/**
 * Renders the inline Markdown the source actually uses: code spans, bold, italic, links and
 * Obsidian `[[#...]]` references. Block structure is handled by the parser, so this only ever
 * sees the inside of a paragraph, list item, table cell or callout.
 */
export function InlineMarkdown({ children }: { children: string }) {
  return <>{renderInline(children)}</>;
}

const CODE_SPAN = /`([^`]+)`/g;
/** Stand-in for a lifted code span; NUL never appears in the source text. */
const CODE_MARK = /\u0000(\d+)\u0000/g;

/**
 * Code spans are lifted out before any other marker is read, so their contents are never
 * re-parsed — `**` inside code stays literal — and restored wherever they land, including
 * inside a bold or italic run that contains code (`**No — a `final` method.**`).
 */
export function renderInline(text: string, keyPrefix = "i"): ReactNode[] {
  const codes: string[] = [];
  const masked = text.replace(CODE_SPAN, (_, code: string) => `\u0000${codes.push(code) - 1}\u0000`);
  return splitEmphasis(masked, keyPrefix, codes);
}

type Recurse = (value: string, key: string) => ReactNode[];

type Rule = {
  pattern: RegExp;
  render: (match: RegExpExecArray, key: string, recurse: Recurse) => ReactNode;
};

const RULES: Rule[] = [
  {
    pattern: /\*\*([^*]+)\*\*/,
    render: (match, key, recurse) => (
      <strong key={key} className="font-semibold text-fg">
        {recurse(match[1], key)}
      </strong>
    ),
  },
  {
    // `[[#Target]]` or `[[#Target|Alias]]` — show the alias when the source gives one.
    pattern: /\[\[#([^\]|]+)(?:\|([^\]]*))?\]\]/,
    render: (match, key, recurse) => (
      <span key={key} className="text-fg-muted">
        {recurse((match[2] ?? match[1]).replace(/^\d+(\.\d+)?\.?\s*/, ""), key)}
      </span>
    ),
  },
  {
    pattern: /\[([^\]]+)\]\(([^)\s]+)\)/,
    render: (match, key, recurse) => (
      <a
        key={key}
        href={match[2]}
        className="underline decoration-line-strong underline-offset-2 transition-colors hover:decoration-current"
        {...(/^https?:/.test(match[2]) ? { target: "_blank", rel: "noreferrer" } : {})}
      >
        {recurse(match[1], key)}
      </a>
    ),
  },
  {
    pattern: /(?<![*\w])\*([^*\n]+)\*(?!\*)/,
    render: (match, key, recurse) => (
      <em key={key} className="italic">
        {recurse(match[1], key)}
      </em>
    ),
  },
];

function splitEmphasis(text: string, keyPrefix: string, codes: string[]): ReactNode[] {
  for (const rule of RULES) {
    const match = rule.pattern.exec(text);
    if (!match) continue;

    const before = text.slice(0, match.index);
    const after = text.slice(match.index + match[0].length);

    return [
      ...(before ? splitEmphasis(before, `${keyPrefix}b`, codes) : []),
      rule.render(match, `${keyPrefix}m`, (value, key) => splitEmphasis(value, `${key}r`, codes)),
      ...(after ? splitEmphasis(after, `${keyPrefix}a`, codes) : []),
    ];
  }

  return plainText(text, keyPrefix, codes);
}

/** Leaf text: restores lifted code spans and turns soft line breaks into spaces. */
function plainText(text: string, keyPrefix: string, codes: string[]): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let index = 0;

  for (const match of text.matchAll(CODE_MARK)) {
    if (match.index > lastIndex) {
      nodes.push(...softBreaks(text.slice(lastIndex, match.index), `${keyPrefix}-t${index}`));
    }
    nodes.push(
      <code
        key={`${keyPrefix}-code-${index}`}
        className="rounded border border-line bg-panel-raised px-[0.3em] py-[0.1em] font-mono text-[0.85em] text-fg"
      >
        {codes[Number(match[1])]}
      </code>,
    );
    lastIndex = match.index + match[0].length;
    index += 1;
  }

  if (lastIndex < text.length) {
    nodes.push(...softBreaks(text.slice(lastIndex), `${keyPrefix}-t${index}`));
  }
  return nodes;
}

function softBreaks(text: string, keyPrefix: string): ReactNode[] {
  return text.includes("\n")
    ? text.split("\n").flatMap((line, index, all) =>
        index < all.length - 1
          ? [<Fragment key={`${keyPrefix}n${index}`}>{line} </Fragment>]
          : [<Fragment key={`${keyPrefix}n${index}`}>{line}</Fragment>],
      )
    : [text];
}
