import { createFileRoute, Link } from "@tanstack/react-router";

import { PageLayout } from "../../components/PageLayout";
import { SEOHead } from "../../components/SEOHead";
import { SPECS } from "../../components/SpecLayout";
import { deriveAeoPageModel } from "../../lib/aeo/derive";

export const Route = createFileRoute("/specs/")({ component: SpecsIndex });

function SpecsIndex() {
  const aeo = deriveAeoPageModel({
    family: "specs-index",
    path: "/specs",
    frontmatter: {
      aeo: {
        faqs: [
          {
            question: "Which specification should I read first?",
            answer:
              "Start with the Executive Summary (one page, positioning + methodology overview). Then read KGB-Public for the behavioral methodology that drives the leaderboard. KGB-Structural covers the artifact-audit instrument and reads independently. KGB Tool is engineering depth for implementers and includes the canonical DAG-judge prompt template plus fully-worked bridge and probe artifacts in Appendices A–C.",
          },
          {
            question: "How do I cite a KGB specification?",
            answer:
              "Reference both the methodology and the specific version of the runner you used. The recommended BibTeX entry is included on the specifications index page. When citing specific findings, reference the full report ID and runner version; reports embed `tool_sha256` and `registry_sha256` for unambiguous identification.",
          },
          {
            question: "Are the specifications stable?",
            answer:
              "v0.1 is a Public Draft. Major versions (v1.0+) freeze the methodology so any published report can be replayed and verified indefinitely. Minor versions (v0.2, v0.3) add probes, bridge classes, and regulatory mappings; old reports remain valid within their version. Patch versions (v0.1.x) are clarifications and errata.",
          },
        ],
      },
    },
    defaults: {
      title: "Specifications — Governance Benchmark",
      description:
        "The four KGB specifications under Apache 2.0 — executive summary, behavioral methodology, artifact audit, and engineering reference for the runner.",
    },
  });

  return (
    <>
      <SEOHead model={aeo} />
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
              When citing in academic work, reference both the methodology and the specific version
              of the runner you used.
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
    </>
  );
}
