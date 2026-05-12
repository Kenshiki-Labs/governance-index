import ExecSummary from "@specs/exec-summary.mdx";
import KgbPublic from "@specs/kgb-public.mdx";
import KgbStructural from "@specs/kgb-structural.mdx";
import KgbTool from "@specs/kgb-tool.mdx";
import { createFileRoute, notFound } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { SpecLayout } from "../../components/SpecLayout";

const components: Record<string, ComponentType> = {
  "exec-summary": ExecSummary,
  "kgb-public": KgbPublic,
  "kgb-structural": KgbStructural,
  "kgb-tool": KgbTool,
};

export const Route = createFileRoute("/specs/$slug")({
  component: SpecPage,
});

function SpecPage() {
  const { slug } = Route.useParams();
  const Component = components[slug];
  if (!Component) {
    throw notFound();
  }
  return (
    <SpecLayout slug={slug}>
      <Component />
    </SpecLayout>
  );
}
