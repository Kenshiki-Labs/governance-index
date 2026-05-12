#!/usr/bin/env node
/**
 * Prerenders every known route to static HTML after `vite build`.
 *
 * Why: the TanStack Router SPA renders client-side, so non-JS-executing
 * crawlers (and some AI fetchers) see only the metadata shell from
 * index.html. This script captures the post-hydration HTML — including
 * the SEOHead-injected `<title>`, `<meta>`, and JSON-LD `<script>` tags
 * — and writes per-route HTML files Vercel serves as static pages.
 *
 * Approach: serve dist/ on a local port, drive a headless Chromium
 * through every known route, wait for the SEOHead `useEffect` to fire,
 * snapshot `document.documentElement.outerHTML`, write to
 * dist/<route>/index.html.
 *
 * Runs in `postbuild`. Adds ~30 seconds per build for 8 routes.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import puppeteer from "puppeteer";
import sirv from "sirv";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DIST = resolve(__dirname, "..", "dist");
const PORT = 4173;

const ROUTES = [
  "/",
  "/specs",
  "/specs/exec-summary",
  "/specs/kgb-public",
  "/specs/kgb-structural",
  "/specs/kgb-tool",
  "/reports/sample",
  "/glossary",
];

async function startServer() {
  const handler = sirv(DIST, { single: true, dev: false });
  const server = createServer((req, res) => handler(req, res));
  await new Promise((resolveListen) => server.listen(PORT, "127.0.0.1", resolveListen));
  return server;
}

async function captureRoute(browser, path) {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (err) => errors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`[console.error] ${msg.text()}`);
  });
  await page.goto(`http://127.0.0.1:${PORT}${path}`, { waitUntil: "networkidle0" });

  // Hydration signal: every PageLayout-wrapped route renders the
  // SiteFooter, which carries the "© 2026 Kenshiki Labs" string. That
  // text exists nowhere in the static index.html shell, so its presence
  // is a reliable post-hydration signal. Long-spec routes (kgb-public,
  // kgb-structural, kgb-tool) deserialize ~50 pages of MDX so the
  // commit can take several seconds.
  await page
    .waitForFunction(() => document.body.textContent?.includes("© 2026 Kenshiki Labs") ?? false, {
      timeout: 30000,
    })
    .catch(() => {
      console.warn(`  ! ${path}: footer signal not observed within 30s — capturing as-is`);
    });

  // Settle: let any in-flight SEOHead useEffect mutations land before
  // we snapshot.
  await new Promise((r) => setTimeout(r, 750));

  const html = await page.content();
  await page.close();

  if (errors.length > 0) {
    console.warn(`  ! ${path}: ${errors.length} runtime error(s):`);
    for (const e of errors.slice(0, 3)) console.warn(`      • ${e.slice(0, 240)}`);
  }

  if (!html.includes('type="module"') || !html.includes("/assets/")) {
    throw new Error(
      `Captured HTML for ${path} appears incomplete (no module script or no /assets/ reference)`,
    );
  }
  return { path, html, errors };
}

function writeCapture(path, html) {
  // Phase-2 writes: write into per-route sibling files so the home page
  // dist/index.html (the original SPA shell sirv serves to puppeteer for
  // every route fallback) is the LAST thing we touch.
  const targetDir = path === "/" ? DIST : resolve(DIST, path.replace(/^\//, ""));
  mkdirSync(targetDir, { recursive: true });
  const targetFile = resolve(targetDir, "index.html");
  writeFileSync(targetFile, html);
  return targetFile;
}

async function main() {
  console.log("Prerender — Governance Benchmark");
  console.log(`  serving ${DIST} on http://127.0.0.1:${PORT}`);

  const server = await startServer();
  const browser = await puppeteer.launch({ headless: "new" });

  const captures = [];
  try {
    // Phase 1: capture every route's post-hydration HTML against the
    // *unmodified* SPA shell. If we wrote each output as we went, the
    // home capture would overwrite dist/index.html and corrupt the SPA
    // shell sirv serves on the next route's request.
    for (const path of ROUTES) {
      const { html } = await captureRoute(browser, path);
      captures.push({ path, html });
      console.log(`  ✓ captured ${path.padEnd(28)} ${html.length.toLocaleString()} bytes`);
    }
  } finally {
    await browser.close();
    server.close();
  }

  // Phase 2: write all captures. Order doesn't matter; nothing reads
  // from dist/ anymore.
  for (const { path, html } of captures) {
    const file = writeCapture(path, html);
    const rel = file.replace(`${DIST}/`, "");
    console.log(`  → wrote ${rel}`);
  }

  console.log(`\n✓ prerendered ${ROUTES.length} routes`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
