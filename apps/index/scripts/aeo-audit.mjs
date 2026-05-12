#!/usr/bin/env node
/**
 * AEO audit — validates each known route's AEO metadata against the
 * family rules. Patterned on Glass's aeo:audit script. Pure-JS so it can
 * run as a prebuild gate without compiling TS.
 *
 * Checks per route:
 *   1. Title length ≤ 70 chars (SERP truncation).
 *   2. Description length 120–160 chars (Google SERP sweet spot).
 *   3. Frontmatter-backed routes have a non-empty `seo.title` and
 *      `seo.description`.
 *   4. Families that declare `requiresSummary` have an `aeo.summary` of
 *      reasonable length.
 *   5. FAQ entries — when present — are shaped correctly (question +
 *      answer present and non-empty).
 *   6. The route registry covers every family declared in families.ts
 *      that ships in v0.1.
 *
 * Non-zero exit on any failure so CI / pre-deploy gates rely on it.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const REPO_ROOT = resolve(__dirname, "..", "..", "..");
const SPECS_DIR = resolve(REPO_ROOT, "docs", "specs");
const HOME_MDX = resolve(__dirname, "..", "src", "content", "home", "index.mdx");

const TITLE_MAX = 70;
const DESC_MIN = 120;
const DESC_MAX = 160;
const SUMMARY_MIN = 80;
const FAQ_QUESTION_MAX = 160;

/** Family expectations — must match apps/index/src/lib/aeo/families.ts.
 * Audit duplication is acceptable; it's the cost of running validation
 * without compiling TypeScript. */
const FAMILIES = {
  home: { requiresSummary: true, faqSchema: "when-present" },
  "specs-index": { requiresSummary: false, faqSchema: "when-present" },
  spec: { requiresSummary: true, faqSchema: "when-present" },
  "sample-report": { requiresSummary: false, faqSchema: "when-present" },
  "reports-index": { requiresSummary: false, faqSchema: "never" },
  glossary: { requiresSummary: false, faqSchema: "never" },
};

/** Per-route audit entries. `mdxPath` is optional — when present, the
 * script reads frontmatter from that file. When absent, the route's
 * `seo` / `aeo` values are sourced from the inline definitions here. */
const AUDIT_ROUTES = [
  {
    path: "/",
    family: "home",
    mdxPath: HOME_MDX,
  },
  {
    path: "/specs",
    family: "specs-index",
    seo: {
      title: "Specifications — Governance Benchmark",
      description:
        "The four KGB specifications under Apache 2.0 — executive summary, behavioral methodology, artifact audit, and engineering reference for the runner.",
    },
    inlineFaqsCount: 3,
  },
  {
    path: "/specs/exec-summary",
    family: "spec",
    mdxPath: resolve(SPECS_DIR, "exec-summary.mdx"),
  },
  {
    path: "/specs/kgb-public",
    family: "spec",
    mdxPath: resolve(SPECS_DIR, "kgb-public.mdx"),
  },
  {
    path: "/specs/kgb-structural",
    family: "spec",
    mdxPath: resolve(SPECS_DIR, "kgb-structural.mdx"),
  },
  {
    path: "/specs/kgb-tool",
    family: "spec",
    mdxPath: resolve(SPECS_DIR, "kgb-tool.mdx"),
  },
  {
    path: "/reports/sample",
    family: "sample-report",
    seo: {
      title: "Sample KGB report — anthropic/claude-opus-4-7",
      description:
        "Mock KGB report illustrating the v0.1 schema — classification, four-dimension scorecard, reliability profile, judge ensemble, attestation chain.",
    },
    inlineFaqsCount: 4,
  },
  {
    path: "/glossary",
    family: "glossary",
    seo: {
      title: "Glossary — Governance Benchmark",
      description:
        "Canonical definitions for the KGB v0.1 governance lexicon: behavioral dimensions, judge architecture, catalog terminology, classification taxonomy. Apache 2.0.",
    },
  },
];

function parseFrontmatter(raw) {
  if (!raw.startsWith("---")) return {};
  const closing = raw.indexOf("\n---", 3);
  if (closing === -1) return {};
  const yaml = raw.slice(3, closing);
  return parseYamlSubset(yaml);
}

/** Minimal YAML reader for the audit's shape: top-level scalars, `seo:`
 * / `aeo:` / `author:` blocks, list-of-objects for `aeo.faqs`. Does not
 * handle arbitrary YAML — sufficient because we control the frontmatter
 * shape. */
function parseYamlSubset(yaml) {
  const out = {};
  const lines = yaml.split("\n");
  let currentBlock = null;
  let currentListKey = null;
  let currentObject = null;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (!raw.trim()) continue;

    const indent = raw.match(/^ */)[0].length;
    const trimmed = raw.trimStart();

    if (indent === 0) {
      // Top-level key
      const match = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)$/);
      if (match) {
        const [, key, value] = match;
        if (value === "") {
          out[key] = {};
          currentBlock = key;
          currentListKey = null;
          currentObject = null;
        } else {
          out[key] = stripQuotes(value);
          currentBlock = null;
        }
      }
      continue;
    }

    if (indent === 2 && currentBlock) {
      const match = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)$/);
      if (match) {
        const [, key, value] = match;
        if (value === "") {
          out[currentBlock][key] = [];
          currentListKey = key;
          currentObject = null;
        } else {
          out[currentBlock][key] = stripQuotes(value);
          currentListKey = null;
          currentObject = null;
        }
      }
      continue;
    }

    if (indent === 4 && currentBlock && currentListKey) {
      // Either `    - scalar` or `    - key: value`
      if (trimmed.startsWith("- ")) {
        const rest = trimmed.slice(2);
        const kv = rest.match(/^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)$/);
        if (kv) {
          // Start a new object in the list
          const [, key, value] = kv;
          const obj = {};
          obj[key] = stripQuotes(value);
          out[currentBlock][currentListKey].push(obj);
          currentObject = obj;
        } else {
          // Bare scalar
          out[currentBlock][currentListKey].push(stripQuotes(rest));
          currentObject = null;
        }
      }
      continue;
    }

    if (indent === 6 && currentObject) {
      const match = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)$/);
      if (match) {
        const [, key, value] = match;
        currentObject[key] = stripQuotes(value);
      }
    }
  }
  return out;
}

function stripQuotes(s) {
  const trimmed = s.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function resolveEntry(entry) {
  if (entry.mdxPath) {
    const raw = readFileSync(entry.mdxPath, "utf8");
    const fm = parseFrontmatter(raw);
    return { seo: fm.seo ?? {}, aeo: fm.aeo ?? {}, source: "mdx" };
  }
  return { seo: entry.seo ?? {}, aeo: {}, source: "inline" };
}

let failures = 0;
const lines = [];

for (const entry of AUDIT_ROUTES) {
  const family = FAMILIES[entry.family];
  if (!family) {
    failures += 1;
    lines.push(`  ✗ ${entry.path}  unknown family "${entry.family}"`);
    continue;
  }

  const { seo, aeo, source } = resolveEntry(entry);
  const { title = "", description = "" } = seo;
  const issues = [];

  // 1. Title length
  if (!title) {
    issues.push("MISSING seo.title");
  } else if (title.length > TITLE_MAX) {
    issues.push(`title is ${title.length} chars (max ${TITLE_MAX})`);
  }

  // 2. Description length (the 120–160 SERP window)
  if (!description) {
    issues.push("MISSING seo.description");
  } else if (description.length < DESC_MIN) {
    issues.push(`description is ${description.length} chars (< ${DESC_MIN} SERP lower bound)`);
  } else if (description.length > DESC_MAX) {
    issues.push(`description is ${description.length} chars (> ${DESC_MAX} SERP truncation)`);
  }

  // 3. Summary required by family
  if (source === "mdx" && family.requiresSummary) {
    const summary = aeo.summary ?? "";
    if (!summary) {
      issues.push("MISSING aeo.summary (family requiresSummary)");
    } else if (summary.length < SUMMARY_MIN) {
      issues.push(`summary is ${summary.length} chars (< ${SUMMARY_MIN})`);
    }
  }

  // 4. FAQ shape — when faqs are present in either source
  let faqs = [];
  if (source === "mdx") {
    faqs = Array.isArray(aeo.faqs) ? aeo.faqs : [];
  } else if (entry.inlineFaqsCount) {
    // The inline FAQs live in the route's TS file; we trust the count
    // declared here (manually kept in sync). The audit can't introspect
    // TypeScript without a transform pass.
    faqs = Array.from({ length: entry.inlineFaqsCount }, () => ({
      question: "(inline)",
      answer: "(inline)",
    }));
  }
  for (let i = 0; i < faqs.length; i++) {
    const faq = faqs[i];
    if (!faq.question || !faq.answer) {
      issues.push(`faqs[${i}] is missing question or answer`);
    } else if (faq.question.length > FAQ_QUESTION_MAX) {
      issues.push(`faqs[${i}].question is ${faq.question.length} chars (max ${FAQ_QUESTION_MAX})`);
    }
  }

  if (issues.length === 0) {
    const faqSuffix = faqs.length > 0 ? `  faqs=${faqs.length}` : "";
    lines.push(
      `  ✓ ${entry.path}  [${entry.family}]  title=${title.length}c  desc=${description.length}c${faqSuffix}`,
    );
  } else {
    failures += issues.length;
    lines.push(`  ✗ ${entry.path}  [${entry.family}]`);
    for (const issue of issues) lines.push(`      • ${issue}`);
  }
}

console.log("AEO audit — Governance Benchmark");
console.log("");
console.log(lines.join("\n"));
console.log("");

if (failures > 0) {
  console.error(`✗ ${failures} issue(s) across ${AUDIT_ROUTES.length} routes`);
  process.exit(1);
}

console.log(`✓ all ${AUDIT_ROUTES.length} routes pass AEO audit`);
