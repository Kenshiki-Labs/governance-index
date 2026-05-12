/**
 * AEO family registry — one config per page family.
 *
 * `expectedSchemaTypes` is what the family MUST emit as JSON-LD. The audit
 * script (future) checks these. Glass uses 14 families; governance-index
 * v0.1 ships four.
 */

import type { AeoFamily } from "./types";

export interface AeoFamilyConfig {
  ogType: "website" | "article";
  requiresSummary: boolean;
  faqSchema: "required" | "when-present" | "never";
  expectedSchemaTypes: readonly string[];
}

export const AEO_FAMILIES: Record<AeoFamily, AeoFamilyConfig> = {
  home: {
    ogType: "website",
    requiresSummary: true,
    faqSchema: "when-present",
    expectedSchemaTypes: ["Organization", "WebSite", "Dataset"],
  },
  "specs-index": {
    ogType: "website",
    requiresSummary: false,
    faqSchema: "when-present",
    expectedSchemaTypes: ["WebPage", "BreadcrumbList"],
  },
  spec: {
    ogType: "article",
    requiresSummary: true,
    faqSchema: "when-present",
    expectedSchemaTypes: ["TechArticle", "BreadcrumbList"],
  },
  "sample-report": {
    ogType: "article",
    requiresSummary: false,
    faqSchema: "when-present",
    expectedSchemaTypes: ["Report", "BreadcrumbList"],
  },
  "reports-index": {
    ogType: "website",
    requiresSummary: false,
    faqSchema: "never",
    expectedSchemaTypes: ["WebPage", "BreadcrumbList", "ItemList"],
  },
  glossary: {
    ogType: "website",
    requiresSummary: false,
    faqSchema: "never",
    expectedSchemaTypes: ["WebPage", "BreadcrumbList", "DefinedTermSet"],
  },
} as const;

/** Build-time-stable canonical site origin. */
export const SITE_ORIGIN = "https://index.kenshikilabs.com";

/** Default OG image, served from public/. */
export const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/og-default.png`;

/** Build-time fallback for datePublished / dateModified when no per-page
 * date is supplied. Bumped when the methodology version changes. */
export const FALLBACK_DATE = "2026-05-11";

/** Organization JSON-LD — emitted on every page. */
export const ORGANIZATION_SCHEMA = {
  "@type": "Organization",
  "@id": `${SITE_ORIGIN}/#organization`,
  name: "Kenshiki Labs",
  legalName: "Kenshiki Labs, Inc.",
  url: "https://kenshikilabs.com",
  logo: `${SITE_ORIGIN}/icon-512.png`,
  sameAs: ["https://github.com/Kenshiki-Labs", "https://kenshikilabs.com"],
} as const;
