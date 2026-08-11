import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Fully static output: every page is prerendered to HTML at build time and the result in `out/`
   * can be served by any static host. Nothing in this app needs a server — search runs in the
   * browser against a static index, and progress lives in localStorage.
   */
  output: "export",

  /**
   * Emit `page/index.html` rather than `page.html`, so every route resolves on hosts that don't
   * rewrite extensionless URLs (GitHub Pages, plain S3, nginx without try_files).
   */
  trailingSlash: true,


  images: {
    // No image optimisation server in a static export.
    unoptimized: true,
  },
};

export default nextConfig;
