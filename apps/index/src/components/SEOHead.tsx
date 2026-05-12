/**
 * SEOHead — sets per-page meta, OG, Twitter, robots, and JSON-LD by
 * mutating document.head. Patterned on Glass's SEOHead.astro, adapted for
 * a client-rendered SPA.
 *
 * On the initial render, document.head has the static fallback from
 * index.html. SEOHead replaces title and per-page meta when the route
 * mounts. For full crawlability at first paint, a future pass adds Vite
 * prerendering — at which point the meta gets baked into the served HTML.
 */

import { useEffect } from "react";

import type { AeoPageModel, SchemaNode } from "../lib/aeo/types";

interface SEOHeadProps {
  model: AeoPageModel;
}

const MANAGED_ATTR = "data-aeo-managed";
const JSON_LD_ATTR = "data-aeo-json-ld";

export function SEOHead({ model }: SEOHeadProps) {
  useEffect(() => {
    document.title = model.title;
    setMetaName("description", model.description);
    setMetaName("robots", model.robots);

    setLink("canonical", model.canonical);

    setMetaProperty("og:title", model.title);
    setMetaProperty("og:description", model.description);
    setMetaProperty("og:url", model.canonical);
    setMetaProperty("og:type", model.ogType);
    setMetaProperty("og:image", model.ogImage);
    setMetaProperty("og:site_name", "The Governance Benchmark");
    setMetaProperty("og:locale", "en_US");

    if (model.ogType === "article") {
      setMetaProperty("article:published_time", model.datePublished);
      setMetaProperty("article:modified_time", model.dateModified);
    } else {
      removeMetaProperty("article:published_time");
      removeMetaProperty("article:modified_time");
    }

    setMetaName("twitter:card", "summary_large_image");
    setMetaName("twitter:title", model.title);
    setMetaName("twitter:description", model.description);
    setMetaName("twitter:image", model.ogImage);

    renderJsonLd(model.schema);
  }, [model]);

  return null;
}

function setMetaName(name: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    el.setAttribute(MANAGED_ATTR, "true");
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setMetaProperty(property: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    el.setAttribute(MANAGED_ATTR, "true");
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function removeMetaProperty(property: string) {
  const el = document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (el) el.remove();
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    el.setAttribute(MANAGED_ATTR, "true");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Render JSON-LD as one or more <script type="application/ld+json"> tags.
 * We replace ALL previously-managed JSON-LD nodes on every render to
 * avoid duplication across route changes. The static block in index.html
 * (if any) is left alone because it doesn't carry MANAGED_ATTR.
 */
function renderJsonLd(schema: SchemaNode[]) {
  const existing = document.head.querySelectorAll(`script[${JSON_LD_ATTR}="true"]`);
  for (const node of existing) node.remove();

  if (schema.length === 0) return;

  const payload = {
    "@context": "https://schema.org",
    "@graph": schema,
  };

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.setAttribute(JSON_LD_ATTR, "true");
  script.text = JSON.stringify(payload, null, 0);
  document.head.appendChild(script);
}
