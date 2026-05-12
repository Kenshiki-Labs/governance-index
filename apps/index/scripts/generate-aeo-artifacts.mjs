#!/usr/bin/env node
/**
 * Generates the three static AEO artifacts the Governance Benchmark site
 * publishes:
 *   - public/robots.txt   — crawl directives with explicit AI-crawler allow
 *   - public/sitemap.xml  — every known route with lastmod
 *   - public/llms.txt     — AI-discovery index (Anthropic-proposed format)
 *
 * Invoked by `pnpm build` via the prebuild script. Output is checked into
 * apps/index/public/ so it's available for the dev server too.
 *
 * The route registry below is hand-maintained. When a new route lands,
 * add it here and re-run `pnpm aeo:generate`.
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SITE_ORIGIN = "https://index.kenshikilabs.com";
const TODAY_ISO = new Date().toISOString().slice(0, 10);

const ROUTES = [
  {
    path: "/",
    title: "The Governance Benchmark",
    description:
      "The public benchmark for AI governance properties. The yardstick the industry argues about.",
    priority: "1.0",
    changefreq: "weekly",
  },
  {
    path: "/specs",
    title: "Specifications",
    description: "The four KGB specifications — methodology, runner, leaderboard governance.",
    priority: "0.9",
    changefreq: "monthly",
  },
  {
    path: "/specs/exec-summary",
    title: "KGB Executive Summary v0.1",
    description:
      "One-page methodology overview: what KGB measures, how evaluations run, conflict-of-interest disclosure.",
    priority: "0.9",
    changefreq: "monthly",
  },
  {
    path: "/specs/kgb-public",
    title: "KGB-Public v0.1 — Behavioral Methodology",
    description:
      "Behavioral probe methodology — EC / SAS / IF / AUC dimensions, multi-judge ensemble, calibration, regulatory mapping.",
    priority: "0.8",
    changefreq: "monthly",
  },
  {
    path: "/specs/kgb-structural",
    title: "KGB-Structural v0.1 — Artifact Audit Methodology",
    description:
      "Artifact-audit methodology — five hard gates, predicate classes, categorical compliance taxonomy.",
    priority: "0.8",
    changefreq: "monthly",
  },
  {
    path: "/specs/kgb-tool",
    title: "KGB Tool v0.1 — Engineering Reference",
    description:
      "Engineering reference for the runner — adapter, multi-judge ensemble, signing chain, canonical DAG-judge prompt template.",
    priority: "0.8",
    changefreq: "monthly",
  },
  {
    path: "/reports/sample",
    title: "Sample KGB report",
    description:
      "Realistic mock of a v0.1 signed report — classification, scorecard, attestation chain, replay command.",
    priority: "0.7",
    changefreq: "monthly",
  },
];

/** Robots.txt with explicit AI-crawler allowlist.
 *
 * Major AI crawlers as of mid-2026 (subject to change as bots evolve):
 *   - GPTBot          OpenAI training crawler
 *   - OAI-SearchBot   OpenAI search-result crawler
 *   - ChatGPT-User    OpenAI on-demand fetcher (user-triggered)
 *   - ClaudeBot       Anthropic training crawler
 *   - Claude-Web      Anthropic on-demand fetcher
 *   - Google-Extended Google AI training opt-in
 *   - PerplexityBot   Perplexity crawler
 *   - Applebot-Extended  Apple AI training opt-in
 *   - cohere-ai       Cohere crawler
 *   - Bytespider      ByteDance/TikTok crawler
 *   - Diffbot         Diffbot crawler (semantic-web extraction)
 *
 * A public benchmark site benefits from being indexed by every AI search
 * surface. The runner enforces evaluation, not citation policy.
 */
function generateRobotsTxt() {
  const aiCrawlers = [
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "ClaudeBot",
    "Claude-Web",
    "Google-Extended",
    "PerplexityBot",
    "Applebot-Extended",
    "cohere-ai",
    "Bytespider",
    "Diffbot",
  ];
  const lines = [
    "# Governance Benchmark — crawl directives",
    `# Generated ${TODAY_ISO} by apps/index/scripts/generate-aeo-artifacts.mjs`,
    "",
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "",
  ];
  for (const ua of aiCrawlers) {
    lines.push(`User-agent: ${ua}`);
    lines.push("Allow: /");
    lines.push("");
  }
  lines.push(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`);
  lines.push(`# AI-discovery index`);
  lines.push(`# ${SITE_ORIGIN}/llms.txt`);
  lines.push("");
  return lines.join("\n");
}

function generateSitemapXml() {
  const entries = ROUTES.map(
    (r) =>
      `  <url>\n` +
      `    <loc>${SITE_ORIGIN}${r.path}</loc>\n` +
      `    <lastmod>${TODAY_ISO}</lastmod>\n` +
      `    <changefreq>${r.changefreq}</changefreq>\n` +
      `    <priority>${r.priority}</priority>\n` +
      `  </url>`,
  ).join("\n");

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries +
    `\n</urlset>\n`
  );
}

/** llms.txt — Anthropic-proposed AI-discovery index format.
 *
 * Format: markdown with H1 title, optional blockquote summary, then sections
 * of bulleted links. Designed for LLM crawlers and on-demand fetchers to
 * orient quickly without parsing the full sitemap or navigation. */
function generateLlmsTxt() {
  const specs = ROUTES.filter((r) => r.path.startsWith("/specs/"));
  const reports = ROUTES.filter((r) => r.path.startsWith("/reports/"));
  const top = ROUTES.find((r) => r.path === "/");
  const specsIndex = ROUTES.find((r) => r.path === "/specs");

  const topLevelEntries = [
    ...(top ? [`- [${top.title}](${SITE_ORIGIN}${top.path}): ${top.description}`] : []),
    ...(specsIndex
      ? [`- [${specsIndex.title}](${SITE_ORIGIN}${specsIndex.path}): ${specsIndex.description}`]
      : []),
  ];

  const lines = [
    "# The Governance Benchmark",
    "",
    "> The Kenshiki Governance Benchmark (KGB) is the public benchmark for AI governance properties. It measures whether a model's reasoning can be governed — whether it stays within evidence, attributes correctly, follows instructions, and abstains when it should. Open methodology, open-source runner, cryptographically signed reports, continuously-updated leaderboard.",
    "",
    "## Top-level pages",
    "",
    ...topLevelEntries,
    "",
    "## Methodology specifications",
    "",
    ...specs.map((r) => `- [${r.title}](${SITE_ORIGIN}${r.path}): ${r.description}`),
    "",
    "## Reports",
    "",
    ...reports.map((r) => `- [${r.title}](${SITE_ORIGIN}${r.path}): ${r.description}`),
    "",
    "## Source repository",
    "",
    "- [governance-index on GitHub](https://github.com/Kenshiki-Labs/governance-index): the reference Python runner (Apache 2.0), the four MDX methodology specifications, and the TanStack site source.",
    "- [Methodology specs (raw MDX)](https://github.com/Kenshiki-Labs/governance-index/tree/main/docs/specs)",
    "- [Apache 2.0 license](https://github.com/Kenshiki-Labs/governance-index/blob/main/LICENSE)",
    "",
  ];
  return `${lines.join("\n")}\n`;
}

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const PUBLIC_DIR = resolve(__dirname, "..", "public");

writeFileSync(resolve(PUBLIC_DIR, "robots.txt"), generateRobotsTxt());
writeFileSync(resolve(PUBLIC_DIR, "sitemap.xml"), generateSitemapXml());
writeFileSync(resolve(PUBLIC_DIR, "llms.txt"), generateLlmsTxt());

console.log(`✓ wrote robots.txt, sitemap.xml, llms.txt to ${PUBLIC_DIR}`);
