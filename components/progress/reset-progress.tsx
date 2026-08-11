"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { useProgress } from "@/lib/progress/provider";

export function ResetProgress() {
  const { reset, ready } = useProgress();
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        disabled={!ready}
        onClick={() => setConfirming(true)}
        className="inline-flex items-center gap-1.5 text-2xs text-fg-subtle transition-colors hover:text-fg-muted disabled:opacity-50"
      >
        <RotateCcw className="size-3" aria-hidden />
        Reset progress
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 text-2xs">
      <span className="text-fg-muted">Clear all progress?</span>
      <button
        type="button"
        onClick={() => {
          reset();
          setConfirming(false);
        }}
        className="rounded border border-line px-2 py-0.5 font-medium text-[var(--tone-danger)] transition-colors hover:border-[var(--tone-danger)]"
      >
        Reset
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="rounded border border-line px-2 py-0.5 text-fg-subtle transition-colors hover:text-fg-muted"
      >
        Cancel
      </button>
    </span>
  );
}
