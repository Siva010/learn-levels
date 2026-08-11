import { Fragment, type ReactNode } from "react";

/**
 * Renders the inline Markdown the source actually uses: code spans, bold, italic, links and
 * Obsidian `[[#...]]` references. Block structure is handled by the parser, so this only ever
 * sees the inside of a paragraph, list item, table cell or callout.
 */
export function InlineMarkdown({ children }: { children: string }) {
  return <>{renderInline(children)}</>;
}

export function renderInline(text: string, keyPrefix = "i"): ReactNode[] {
  return splitCode(text, keyPrefix);
}

/** Code spans win over every other marker — their contents are never re-parsed. */
function splitCode(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /`([^`]+)`/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(...splitEmphasis(text.slice(lastIndex, match.index), `${keyPrefix}-${index}`));
    }
    nodes.push(
      <code
        key={`${keyPrefix}-code-${index}`}
        className="rounded border border-line bg-panel-raised px-[0.3em] py-[0.1em] font-mono text-[0.85em] text-fg"
      >
        {match[1]}
      </code>,
    );
    lastIndex = match.index + match[0].length;
    index += 1;
  }

  if (lastIndex < text.length) {
    nodes.push(...splitEmphasis(text.slice(lastIndex), `${keyPrefix}-${index}`));
  }
  return nodes;
}

type Rule = {
  pattern: RegExp;
  render: (match: RegExpExecArray, key: string, recurse: (value: string, key: string) => ReactNode[]) => ReactNode;
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
    render: (match, key) => (
      <span key={key} className="text-fg-muted">
        {(match[2] ?? match[1]).replace(/^\d+(\.\d+)?\.?\s*/, "")}
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

function splitEmphasis(text: string, keyPrefix: string): ReactNode[] {
  for (const rule of RULES) {
    const match = rule.pattern.exec(text);
    if (!match) continue;

    const before = text.slice(0, match.index);
    const after = text.slice(match.index + match[0].length);

    return [
      ...(before ? splitEmphasis(before, `${keyPrefix}b`) : []),
      rule.render(match, `${keyPrefix}m`, (value, key) => splitEmphasis(value, `${key}r`)),
      ...(after ? splitEmphasis(after, `${keyPrefix}a`) : []),
    ];
  }

  return text.includes("\n")
    ? text.split("\n").flatMap((line, index, all) =>
        index < all.length - 1
          ? [<Fragment key={`${keyPrefix}n${index}`}>{line} </Fragment>]
          : [<Fragment key={`${keyPrefix}n${index}`}>{line}</Fragment>],
      )
    : [text];
}
