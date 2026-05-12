import { createFileRoute, Link } from "@tanstack/react-router";

import { PageLayout } from "../../components/PageLayout";
import { SPECS } from "../../components/SpecLayout";

export const Route = createFileRoute("/specs/")({ component: SpecsIndex });

function SpecsIndex() {
  return (
    <PageLayout>
      <section className="px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="badge badge-outline mb-6">Public Draft v0.1 · Apache 2.0</div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Specifications</h1>

          <p className="text-lg opacity-80 mb-10 leading-relaxed">
            The Kenshiki Governance Benchmark is defined by four open specifications. They are
            published under Apache 2.0, versioned independently, and pinned by SHA-256 in every
            signed report.
          </p>

          <div className="grid gap-4">
            {SPECS.map((spec, i) => (
              <Link
                key={spec.slug}
                to="/specs/$slug"
                params={{ slug: spec.slug }}
                className="card bg-base-200 border border-base-300 hover:border-primary transition-colors"
              >
                <div className="card-body">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm opacity-60">{i + 1}</span>
                    <h2 className="card-title">{spec.title}</h2>
                  </div>
                  <p className="opacity-80">{spec.description}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="divider my-12" />

          <h3 className="text-xl font-semibold mb-4">How to read them</h3>
          <p className="opacity-80 mb-4">
            Start with the <strong>Executive Summary</strong> for positioning, then{" "}
            <strong>KGB-Public</strong> for the behavioral methodology and the four-dimension
            scoring that drives the leaderboard. <strong>KGB-Structural</strong> covers the
            artifact-audit instrument. <strong>KGB Tool</strong> is engineering depth for
            implementers and includes the canonical DAG-judge prompt template plus a fully-worked
            bridge and probe in appendices A–C.
          </p>

          <h3 className="text-xl font-semibold mb-4 mt-8">Citation</h3>
          <p className="opacity-80 mb-4">
            When citing in academic work, reference both the methodology and the specific version of
            the runner you used.
          </p>
          <pre className="bg-base-200 p-4 rounded text-sm overflow-x-auto">
            <code>{`@misc{kgb-spec-v01-2026,
  title  = {Kenshiki Governance Benchmark — Specifications v0.1},
  author = {Kenshiki Labs},
  year   = {2026},
  url    = {https://github.com/Kenshiki-Labs/governance-index/tree/main/docs/specs},
  note   = {Public Draft v0.1, Apache 2.0}
}`}</code>
          </pre>
        </div>
      </section>
    </PageLayout>
  );
}
