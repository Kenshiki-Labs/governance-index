import ExecSummary, { frontmatter as execSummaryFm } from "@specs/exec-summary.mdx";
import KgbPublic, { frontmatter as kgbPublicFm } from "@specs/kgb-public.mdx";
import KgbStructural, { frontmatter as kgbStructuralFm } from "@specs/kgb-structural.mdx";
import KgbTool, { frontmatter as kgbToolFm } from "@specs/kgb-tool.mdx";
import { createFileRoute, notFound } from "@tanstack/react-router";
import type { ComponentType } from "react";

import { SEOHead } from "../../components/SEOHead";
import { SPECS, SpecLayout } from "../../components/SpecLayout";
import { deriveAeoPageModel } from "../../lib/aeo/derive";
import type { AeoFrontmatter } from "../../lib/aeo/types";

interface SpecEntry {
  Component: ComponentType;
  frontmatter: AeoFrontmatter | undefined;
}

const SPEC_MODULES: Record<string, SpecEntry> = {
  "exec-summary": { Component: ExecSummary, frontmatter: execSummaryFm },
  "kgb-public": { Component: KgbPublic, frontmatter: kgbPublicFm },
  "kgb-structural": { Component: KgbStructural, frontmatter: kgbStructuralFm },
  "kgb-tool": { Component: KgbTool, frontmatter: kgbToolFm },
};

export const Route = createFileRoute("/specs/$slug")({
  component: SpecPage,
});

function SpecPage() {
  const { slug } = Route.useParams();
  const entry = SPEC_MODULES[slug];
  if (!entry) {
    throw notFound();
  }
  const meta = SPECS.find((s) => s.slug === slug);
  const aeo = deriveAeoPageModel({
    family: "spec",
    path: `/specs/${slug}`,
    frontmatter: entry.frontmatter,
    defaults: {
      title: meta?.title ?? slug,
      description: meta?.description,
    },
  });

  const { Component } = entry;
  return (
    <>
      <SEOHead model={aeo} />
      <SpecLayout slug={slug}>
        <Component />
      </SpecLayout>
    </>
  );
}
