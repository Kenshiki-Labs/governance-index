import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { PageLayout } from "./PageLayout";

export interface SpecMeta {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
}

export const SPECS: SpecMeta[] = [
  {
    slug: "exec-summary",
    title: "Executive Summary",
    shortTitle: "Exec Summary",
    description: "One-page positioning, moat, build plan, budget, risks. Start here.",
  },
  {
    slug: "kgb-public",
    title: "KGB-Public",
    shortTitle: "KGB-Public",
    description:
      "Behavioral probe methodology. The four first-order dimensions (EC / SAS / IF / AUC), the reliability profile, the judge ensemble, calibration, regulatory mapping.",
  },
  {
    slug: "kgb-structural",
    title: "KGB-Structural",
    shortTitle: "KGB-Structural",
    description:
      "Artifact-audit methodology. What a governance payload must contain, the five hard gates, the four predicate classes, the categorical compliance taxonomy.",
  },
  {
    slug: "kgb-tool",
    title: "KGB Tool",
    shortTitle: "KGB Tool",
    description:
      "Engineering reference. Tool architecture, OpenRouter adapter, multi-judge ensemble, signing chain, leaderboard governance. Canonical DAG-judge prompt template, bridge, and probe in Appendices A–C.",
  },
];

const GITHUB_BASE = "https://github.com/Kenshiki-Labs/governance-index/blob/main/docs/specs";

interface SpecLayoutProps {
  slug: string;
  children: ReactNode;
}

export function SpecLayout({ slug, children }: SpecLayoutProps) {
  const index = SPECS.findIndex((s) => s.slug === slug);
  const meta = SPECS[index];
  if (!meta) {
    throw new Error(`Unknown spec slug: ${slug}`);
  }
  const prev = index > 0 ? SPECS[index - 1] : null;
  const next = index < SPECS.length - 1 ? SPECS[index + 1] : null;
  const githubUrl = `${GITHUB_BASE}/${slug}.mdx`;

  return (
    <PageLayout>
      <section className="px-6 pt-6">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center gap-x-2 gap-y-1 text-sm opacity-70">
          <Link to="/specs" className="link link-hover">
            Specifications
          </Link>
          <span aria-hidden="true">/</span>
          <span>{meta.title}</span>
        </div>
      </section>

      <article className="px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-4xl prose dark:prose-invert lg:prose-lg">{children}</div>
        </div>
      </article>

      <nav className="border-t border-base-300 px-6 py-6">
        <div className="max-w-5xl mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-sm">
            {prev ? (
              <Link to="/specs/$slug" params={{ slug: prev.slug }} className="btn btn-ghost btn-sm">
                ← {prev.shortTitle}
              </Link>
            ) : (
              <span className="opacity-30 text-sm">First spec</span>
            )}
            {next ? (
              <Link to="/specs/$slug" params={{ slug: next.slug }} className="btn btn-ghost btn-sm">
                {next.shortTitle} →
              </Link>
            ) : (
              <span className="opacity-30 text-sm">Last spec</span>
            )}
          </div>
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm"
          >
            View source on GitHub
          </a>
        </div>
      </nav>
    </PageLayout>
  );
}
