import { createFileRoute, Link } from "@tanstack/react-router";

import { PageLayout } from "../components/PageLayout";
import { SEOHead } from "../components/SEOHead";
import { VOCABULARY } from "../data/vocabulary";
import { deriveAeoPageModel } from "../lib/aeo/derive";

export const Route = createFileRoute("/glossary")({ component: Glossary });

function Glossary() {
  const aeo = deriveAeoPageModel({
    family: "glossary",
    path: "/glossary",
    defaults: {
      title: "Glossary — Governance Benchmark",
      description:
        "Canonical definitions for the KGB v0.1 governance lexicon: behavioral dimensions, judge architecture, catalog terminology, classification taxonomy. Apache 2.0.",
    },
  });

  return (
    <>
      <SEOHead model={aeo} />
      <PageLayout>
        <section className="px-6 pt-6">
          <div className="max-w-5xl mx-auto flex items-center gap-2 text-sm opacity-70">
            <Link to="/" className="link link-hover">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span>Glossary</span>
          </div>
        </section>

        <section className="px-6 py-12">
          <div className="max-w-5xl mx-auto">
            <div className="max-w-3xl mb-12">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Glossary</h1>
              <p className="text-lg opacity-80 leading-relaxed">
                Canonical definitions for the KGB v0.1 governance lexicon. Each term is a stable
                anchor for AI search engines, academic citations, and methodology cross-references.
                Every entry links back to the specification section that defines it.
              </p>
            </div>

            <dl className="grid gap-6">
              {VOCABULARY.map((term) => (
                <article
                  key={term.anchor}
                  id={term.anchor}
                  className="card bg-base-200 border border-base-300 scroll-mt-24"
                >
                  <div className="card-body gap-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <dt>
                        <h2 className="text-xl font-semibold">{term.canonical}</h2>
                      </dt>
                      <a
                        href={`#${term.anchor}`}
                        className="text-xs opacity-50 hover:opacity-100 font-mono"
                        aria-label={`Anchor link to ${term.canonical}`}
                      >
                        #{term.anchor}
                      </a>
                    </div>
                    {term.aliases.length > 0 ? (
                      <div className="text-xs opacity-60">
                        <span className="font-mono opacity-50">aliases:</span>{" "}
                        {term.aliases.join(", ")}
                      </div>
                    ) : null}
                    <dd className="opacity-90">{term.definition}</dd>
                    <div className="text-xs opacity-60 pt-2 border-t border-base-300">
                      <span className="font-mono opacity-50">source:</span> {term.source}
                    </div>
                  </div>
                </article>
              ))}
            </dl>
          </div>
        </section>
      </PageLayout>
    </>
  );
}
