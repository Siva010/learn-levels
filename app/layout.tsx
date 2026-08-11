import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { ThemeSync } from "@/components/layout/theme";
import { THEME_SCRIPT } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Learn Levels — Learn Java in Levels",
    template: "%s · Learn Levels",
  },
  description:
    "From knowing what a concept is, to understanding how it works, to surviving the interview, to using it in production.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full">
        {/*
          beforeInteractive puts this in the initial HTML ahead of hydration and outside React's
          reconciliation, so the theme applies before first paint without a hydration mismatch.
        */}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }}
        />
        <ThemeSync />
        {children}
      </body>
    </html>
  );
}
