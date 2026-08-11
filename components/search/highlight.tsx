import { Fragment } from "react";

/** Highlights every matched term in a snippet. Terms are plain tokens, escaped before use. */
export function Highlight({ text, terms }: { text: string; terms: string[] }) {
  if (terms.length === 0) return <>{text}</>;

  const lowered = new Set(terms.map((term) => term.toLowerCase()));
  const parts = text.split(new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi"));

  return (
    <>
      {parts.map((part, index) =>
        lowered.has(part.toLowerCase()) ? (
          <mark
            key={index}
            className="rounded-[2px] bg-[color-mix(in_oklab,var(--accent)_30%,transparent)] px-0.5 text-fg"
          >
            {part}
          </mark>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </>
  );
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
