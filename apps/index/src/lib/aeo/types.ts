/**
 * AEO (Answer Engine Optimization) type system.
 *
 * Models the metadata an AI crawler / LLM-search engine / academic citation
 * engine / human reader needs to parse a page accurately. Patterned on the
 * Glass repo's `lib/aeo` triad (types / families / derive), trimmed to the
 * four surfaces governance-index ships in v0.1.
 */

export type AeoFamily =
  | "home"
  | "specs-index"
  | "spec"
  | "sample-report"
  | "reports-index"
  | "glossary";

export type SchemaNode = Record<string, unknown>;

export interface Breadcrumb {
  /** Display name. */
  name: string;
  /** Absolute or root-relative path. */
  path: string;
}

export interface AuthorMeta {
  type?: "Organization" | "Person";
  name: string;
  jobTitle?: string;
  sameAs?: string[];
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export interface AeoPageModel {
  /** The page's semantic family — drives which schema types are required. */
  family: AeoFamily;

  /** The route path this model applies to (e.g., "/", "/specs/kgb-public"). */
  path: string;

  /** Absolute canonical URL. */
  canonical: string;

  /** Document <title>. */
  title: string;

  /** <meta name="description"> — target length 120–160 chars. */
  description: string;

  /** Open Graph image URL (absolute). */
  ogImage: string;

  /** OG type: "website" for home/index pages, "article" for specs/reports. */
  ogType: "website" | "article";

  /** Breadcrumb trail terminating at the current page. */
  breadcrumbs: Breadcrumb[];

  /** ISO 8601. Falls back to a build-time fallback when no per-page date exists. */
  datePublished: string;
  dateModified: string;

  /** Author of the page (defaults to the Organization when omitted). */
  author?: AuthorMeta;

  /** Audience personas — used to seed `audience` schema fields. */
  audience: string[];

  /** Key concept terms the page is about — fuels DefinedTerm cross-refs. */
  entityTerms: string[];

  /** FAQs sourced from frontmatter; emit as FAQPage JSON-LD when present. */
  faqs: FaqEntry[];

  /** JSON-LD nodes to emit on the page. Includes Organization always. */
  schema: SchemaNode[];

  /** Robots directive ("index, follow" / "noindex, follow" / etc.). */
  robots: string;
}

/**
 * The shape of the `aeo` and `seo` frontmatter blocks the derive() function
 * reads from each MDX file. All fields optional — derive() supplies defaults.
 */
export interface AeoFrontmatter {
  seo?: {
    title?: string;
    description?: string;
    ogImage?: string;
    noindex?: boolean;
  };
  aeo?: {
    summary?: string;
    audience?: string[];
    entityTerms?: string[];
    faqs?: FaqEntry[];
  };
  /** Page-level dates (override the build-time fallback). */
  datePublished?: string;
  dateModified?: string;
  /** Article-shaped pages (specs, reports). */
  author?: AuthorMeta;
}
