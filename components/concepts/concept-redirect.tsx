"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Client-side stand-in for a server redirect, so the route works in a static export.
 * `replace` keeps this page out of the back-button history.
 */
export function ConceptRedirect({ href, title }: { href: string; title: string }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(href);
  }, [href, router]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
      <p className="text-sm text-fg-muted">
        Opening <span className="font-medium text-fg">{title}</span>…
      </p>
      <Link
        href={href}
        className="mt-2 inline-block text-sm underline decoration-line-strong underline-offset-2"
      >
        Continue
      </Link>
    </div>
  );
}
