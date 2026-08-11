"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { Sidebar } from "@/components/navigation/sidebar";
import { ThemeToggle } from "@/components/layout/theme";
import { CommandPalette } from "@/components/search/command-palette";
import { Kbd } from "@/components/ui/pill";

export function SiteHeader({ language }: { language: string }) {
  const [navOpen, setNavOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Cmd/Ctrl+K anywhere, except while typing in a field.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "k" || !(event.metaKey || event.ctrlKey)) return;
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      event.preventDefault();
      setPaletteOpen((open) => !open);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Drawer: lock scroll, trap focus, close on Escape, restore focus on close.
  useEffect(() => {
    if (!navOpen) return;

    const previousOverflow = document.body.style.overflow;
    const menuButton = menuButtonRef.current;
    document.body.style.overflow = "hidden";

    const focusables = () =>
      Array.from(
        drawerRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );

    focusables()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setNavOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      menuButton?.focus();
    };
  }, [navOpen]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-fg focus:px-3 focus:py-2 focus:text-xs focus:font-medium focus:text-bg"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur">
        <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setNavOpen(true)}
            aria-expanded={navOpen}
            className="grid size-8 place-items-center rounded-md border border-line text-fg-muted lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="size-4" />
          </button>

          <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <span className="grid size-6 place-items-center rounded bg-fg text-2xs font-bold text-bg">
              LL
            </span>
            Learn Levels
          </Link>

          <span className="hidden text-fg-subtle sm:inline">/</span>
          <Link
            href={`/${language}`}
            className="hidden text-sm text-fg-muted transition-colors hover:text-fg sm:inline"
          >
            Java
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="flex h-8 items-center gap-2 rounded-md border border-line px-2.5 text-xs text-fg-subtle transition-colors hover:border-line-strong hover:text-fg-muted"
              aria-label="Search"
            >
              <Search className="size-3.5" />
              <span className="hidden sm:inline">Search</span>
              <span className="hidden sm:inline">
                <Kbd>⌘K</Kbd>
              </span>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {navOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close navigation"
            tabIndex={-1}
            onClick={() => setNavOpen(false)}
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Curriculum navigation"
            className="absolute inset-y-0 left-0 flex w-[85%] max-w-xs flex-col border-r border-line bg-panel"
          >
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4">
              <span className="text-sm font-semibold">Curriculum</span>
              <button
                type="button"
                onClick={() => setNavOpen(false)}
                className="grid size-8 place-items-center rounded-md border border-line text-fg-muted"
                aria-label="Close navigation"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1">
              <Sidebar onNavigate={() => setNavOpen(false)} />
            </div>
          </div>
        </div>
      ) : null}

      {paletteOpen ? <CommandPalette onClose={() => setPaletteOpen(false)} /> : null}
    </>
  );
}
