/**
 * derive(): pure-function transformation from route signals + frontmatter
 * to a complete AeoPageModel ready to be rendered into the document head.
 */

import {
  AEO_FAMILIES,
  DEFAULT_OG_IMAGE,
  FALLBACK_DATE,
  ORGANIZATION_SCHEMA,
  SITE_ORIGIN,
} from "./families";
import type { AeoFamily, AeoFrontmatter, AeoPageModel, Breadcrumb, SchemaNode } from "./types";

const BRAND_SUFFIX = "Governance Benchmark";

export interface DeriveInput {
  family: AeoFamily;
  path: string;
  frontmatter?: AeoFrontmatter;
  /** Override the derived breadcrumbs (some pages need custom trails). */
  breadcrumbs?: Breadcrumb[];
  /** Optional defaults supplied by the route (e.g., headline, fallback description). */
  defaults?: Partial<Pick<AeoPageModel, "title" | "description" | "ogImage">>;
}

export function deriveAeoPageModel(input: DeriveInput): AeoPageModel {
  const { family, path, frontmatter = {}, defaults = {} } = input;
  const familyConfig = AEO_FAMILIES[family];

  const title = resolveTitle(frontmatter, defaults, family);
  const description = resolveDescription(frontmatter, defaults);
  const canonical = absoluteUrl(path);
  const ogImage = frontmatter.seo?.ogImage ?? defaults.ogImage ?? DEFAULT_OG_IMAGE;
  const breadcrumbs = input.breadcrumbs ?? defaultBreadcrumbs(family, path, title);
  const datePublished = frontmatter.datePublished ?? FALLBACK_DATE;
  const dateModified = frontmatter.dateModified ?? FALLBACK_DATE;
  const author = frontmatter.author;
  const audience = frontmatter.aeo?.audience ?? [];
  const entityTerms = frontmatter.aeo?.entityTerms ?? [];
  const faqs = frontmatter.aeo?.faqs ?? [];

  const robots = frontmatter.seo?.noindex
    ? "noindex, follow"
    : "index, follow, max-snippet:-1, max-image-preview:large";

  const schema = buildSchema({
    family,
    path,
    canonical,
    title,
    description,
    breadcrumbs,
    datePublished,
    dateModified,
    ogImage,
    author,
    audience,
    faqs,
  });

  return {
    family,
    path,
    canonical,
    title,
    description,
    ogImage,
    ogType: familyConfig.ogType,
    breadcrumbs,
    datePublished,
    dateModified,
    author,
    audience,
    entityTerms,
    faqs,
    schema,
    robots,
  };
}

function resolveTitle(
  frontmatter: AeoFrontmatter,
  defaults: Partial<Pick<AeoPageModel, "title">>,
  family: AeoFamily,
): string {
  if (frontmatter.seo?.title) {
    return frontmatter.seo.title;
  }
  if (defaults.title) {
    return defaults.title;
  }
  if (family === "home") {
    return `${BRAND_SUFFIX} — Kenshiki Labs`;
  }
  return `Kenshiki ${BRAND_SUFFIX}`;
}

function resolveDescription(
  frontmatter: AeoFrontmatter,
  defaults: Partial<Pick<AeoPageModel, "description">>,
): string {
  return (
    frontmatter.seo?.description ??
    frontmatter.aeo?.summary ??
    defaults.description ??
    "The public benchmark for AI governance properties — methodology, open-source runner, and continuously-updated leaderboard."
  );
}

function absoluteUrl(path: string): string {
  if (path === "/" || path === "") {
    return `${SITE_ORIGIN}/`;
  }
  const normalised = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_ORIGIN}${normalised}`;
}

function defaultBreadcrumbs(family: AeoFamily, path: string, title: string): Breadcrumb[] {
  const home: Breadcrumb = { name: "Governance Benchmark", path: "/" };
  if (family === "home") {
    return [home];
  }
  if (family === "specs-index") {
    return [home, { name: "Specifications", path: "/specs" }];
  }
  if (family === "spec") {
    return [home, { name: "Specifications", path: "/specs" }, { name: title, path }];
  }
  if (family === "sample-report" || family === "reports-index") {
    return [home, { name: "Sample report", path }];
  }
  return [home];
}

interface SchemaContext {
  family: AeoFamily;
  path: string;
  canonical: string;
  title: string;
  description: string;
  breadcrumbs: Breadcrumb[];
  datePublished: string;
  dateModified: string;
  ogImage: string;
  author?: AeoFrontmatter["author"];
  audience: string[];
  faqs: { question: string; answer: string }[];
}

function buildSchema(ctx: SchemaContext): SchemaNode[] {
  const nodes: SchemaNode[] = [ORGANIZATION_SCHEMA];

  if (ctx.family === "home") {
    nodes.push(websiteSchema());
    nodes.push(datasetSchema());
  }

  if (ctx.family !== "home" && ctx.breadcrumbs.length >= 2) {
    nodes.push(breadcrumbListSchema(ctx.breadcrumbs));
  }

  if (ctx.family === "specs-index" || ctx.family === "reports-index") {
    nodes.push(webPageSchema(ctx));
  }

  if (ctx.family === "spec") {
    nodes.push(techArticleSchema(ctx));
  }

  if (ctx.family === "sample-report") {
    nodes.push(reportSchema(ctx));
  }

  if (ctx.faqs.length > 0) {
    nodes.push(faqPageSchema(ctx.faqs));
  }

  return nodes;
}

function websiteSchema(): SchemaNode {
  return {
    "@type": "WebSite",
    "@id": `${SITE_ORIGIN}/#website`,
    url: `${SITE_ORIGIN}/`,
    name: "The Governance Benchmark",
    description:
      "The public benchmark for AI governance properties. Continuously-updated leaderboard scoring frontier model APIs.",
    publisher: { "@id": `${SITE_ORIGIN}/#organization` },
    inLanguage: "en",
  };
}

function datasetSchema(): SchemaNode {
  return {
    "@type": "Dataset",
    "@id": `${SITE_ORIGIN}/#index-dataset`,
    name: "Kenshiki Governance Index — frontier-model behavioral scores",
    description:
      "Continuously-updated dataset of behavioral governance scores for frontier AI model APIs across the EC / SAS / IF / AUC dimensions.",
    url: `${SITE_ORIGIN}/`,
    license: "https://www.apache.org/licenses/LICENSE-2.0",
    creator: { "@id": `${SITE_ORIGIN}/#organization` },
    keywords: [
      "AI governance",
      "benchmark",
      "evidence confinement",
      "source attribution",
      "instruction fidelity",
      "abstention calibration",
      "LLM evaluation",
    ],
    isAccessibleForFree: true,
  };
}

function breadcrumbListSchema(breadcrumbs: Breadcrumb[]): SchemaNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((bc, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: bc.name,
      item: absoluteUrl(bc.path),
    })),
  };
}

function webPageSchema(ctx: SchemaContext): SchemaNode {
  return {
    "@type": "WebPage",
    "@id": `${ctx.canonical}#webpage`,
    url: ctx.canonical,
    name: ctx.title,
    description: ctx.description,
    isPartOf: { "@id": `${SITE_ORIGIN}/#website` },
    inLanguage: "en",
    datePublished: ctx.datePublished,
    dateModified: ctx.dateModified,
  };
}

function techArticleSchema(ctx: SchemaContext): SchemaNode {
  return {
    "@type": "TechArticle",
    "@id": `${ctx.canonical}#article`,
    headline: ctx.title,
    description: ctx.description,
    url: ctx.canonical,
    image: ctx.ogImage,
    datePublished: ctx.datePublished,
    dateModified: ctx.dateModified,
    inLanguage: "en",
    author: authorSchema(ctx.author),
    publisher: { "@id": `${SITE_ORIGIN}/#organization` },
    audience: ctx.audience.length
      ? { "@type": "Audience", audienceType: ctx.audience.join(", ") }
      : undefined,
    license: "https://www.apache.org/licenses/LICENSE-2.0",
    isPartOf: { "@id": `${SITE_ORIGIN}/#website` },
  };
}

function reportSchema(ctx: SchemaContext): SchemaNode {
  return {
    "@type": "Report",
    "@id": `${ctx.canonical}#report`,
    headline: ctx.title,
    description: ctx.description,
    url: ctx.canonical,
    image: ctx.ogImage,
    datePublished: ctx.datePublished,
    dateModified: ctx.dateModified,
    inLanguage: "en",
    publisher: { "@id": `${SITE_ORIGIN}/#organization` },
    license: "https://www.apache.org/licenses/LICENSE-2.0",
  };
}

function faqPageSchema(faqs: { question: string; answer: string }[]): SchemaNode {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

function authorSchema(author: AeoFrontmatter["author"]): SchemaNode {
  if (!author) {
    return { "@id": `${SITE_ORIGIN}/#organization` };
  }
  const node: SchemaNode = {
    "@type": author.type ?? "Person",
    name: author.name,
  };
  if (author.jobTitle) node.jobTitle = author.jobTitle;
  if (author.sameAs?.length) node.sameAs = author.sameAs;
  return node;
}
