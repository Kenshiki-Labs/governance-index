import { createFileRoute, Link } from "@tanstack/react-router";

import { PageLayout } from "../components/PageLayout";
import { DIMENSIONS, type Dimension } from "../data/dimensions";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <PageLayout>
      <Hero />
      <SampleReportPreview />
      <Thesis />
      <Dimensions />
      <HowItWorks />
      <FinalCta />
    </PageLayout>
  );
}

function Hero() {
  return (
    <section className="px-6 py-20 md:py-28">
      <div className="max-w-5xl mx-auto">
        <div className="max-w-3xl">
          <div className="badge badge-outline mb-6">v0.1 · Launching Q3 2026</div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            The Governance Benchmark
          </h1>
          <p className="text-xl md:text-2xl opacity-80 leading-relaxed">
            The public benchmark for AI governance properties. The yardstick the industry argues
            about.
          </p>
        </div>
      </div>
    </section>
  );
}

function Thesis() {
  return (
    <section className="border-t border-base-300 px-6 py-16 bg-base-200/40">
      <div className="max-w-5xl mx-auto">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold mb-6">Governance has had no shared yardstick</h2>
          <div className="prose prose-lg dark:prose-invert max-w-none opacity-90">
            <p>
              Hallucination has HaluEval, FACTS Grounding, SimpleQA. Capability has MMLU and HELM.
              Procurement teams ask vendors "does your model stay within evidence?" and get
              marketing answers. Regulators ask "is this model auditable?" and get principles
              documents.
            </p>
            <p>
              <strong>The Governance Benchmark closes that gap.</strong> A public, methodology-open,
              continuously-published benchmark that measures whether a model's reasoning can be
              governed — whether it stays within evidence, attributes correctly, follows
              instructions, and abstains when it should. Open source. Apache 2.0. Reproducible
              builds. Cryptographically signed reports.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Dimensions() {
  return (
    <section className="border-t border-base-300 px-6 py-20">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Four dimensions of governed reasoning
        </h2>
        <p className="text-lg opacity-80 mb-12 max-w-3xl">
          Each probe carries inline regulatory source material and a question. The judge ensemble
          compiles the target model's response into a typed proof graph, then measures four
          first-order properties.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {DIMENSIONS.map((dim) => (
            <DimensionCard key={dim.label} dim={dim} />
          ))}
        </div>
      </div>
    </section>
  );
}

function DimensionCard({ dim }: { dim: Dimension }) {
  return (
    <article className="card bg-base-200 border border-base-300">
      <div className="card-body gap-3">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-mono font-bold text-primary">{dim.label}</span>
          <h3 className="text-xl font-semibold">{dim.name}</h3>
        </div>
        <p className="text-sm opacity-70 italic">{dim.question}</p>
        <p className="opacity-90">{dim.definition}</p>
        <div className="pt-3 mt-2 border-t border-base-300">
          <div className="text-xs uppercase tracking-wider opacity-50 mb-2">Formal method</div>
          <code className="text-xs font-mono opacity-80 block whitespace-pre-wrap break-words">
            {dim.formalMethod}
          </code>
          <div className="text-xs opacity-60 mt-2">{dim.primaryMeasurement}</div>
        </div>
      </div>
    </article>
  );
}

function HowItWorks() {
  return (
    <section className="border-t border-base-300 px-6 py-20 bg-base-200/40">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">How an evaluation runs</h2>
        <p className="text-lg opacity-80 mb-10 max-w-3xl">
          A KGB run is a chain of typed artifacts, each pinned by SHA-256.
        </p>
        <div className="grid md:grid-cols-4 gap-4">
          <Step
            n="1"
            title="Probe"
            body="Carries inline statutory or regulatory source material from Kenshiki's 30K-chunk governance corpus, plus a question."
          />
          <Step
            n="2"
            title="Target model"
            body="Reached through OpenRouter as the canonical adapter. Direct-provider shims exist for dispute-resolution replay."
          />
          <Step
            n="3"
            title="Judge ensemble"
            body="Two pinned external frontier judges from different provider families compile the response into a typed proof graph. No judge scores its own family."
          />
          <Step
            n="4"
            title="Signed report"
            body="Five-hash attestation chain: tool, probe registry, bridge catalog, schema, evaluator. RFC 8785 canonical form. Ed25519 signed."
          />
        </div>
      </div>
    </section>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm opacity-50 font-mono">Step {n}</div>
      <div className="font-semibold">{title}</div>
      <p className="text-sm opacity-80">{body}</p>
    </div>
  );
}

function SampleReportPreview() {
  return (
    <section className="border-t border-base-300 px-6 py-20 bg-base-200/40">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Every report is verifiable</h2>
            <p className="text-lg opacity-80 mb-6">
              A KGB report is not a marketing claim. It is a canonical JSON document with a
              five-hash attestation chain, Ed25519 signature, and a deterministic replay command.
              Any third party can re-run the exact published seeds against any model.
            </p>
            <Link to="/reports/sample" className="btn btn-primary">
              See a sample report →
            </Link>
          </div>
          <article className="flex-1 card bg-base-100 border border-base-300 font-mono text-xs">
            <div className="card-body gap-2">
              <div className="flex justify-between opacity-60">
                <span>report.json</span>
                <span>v0.1</span>
              </div>
              <div className="divider my-0" />
              <div>
                <span className="opacity-50">model:</span> <span>anthropic/claude-opus-4-7</span>
              </div>
              <div>
                <span className="opacity-50">classification:</span>{" "}
                <span className="text-success">BEHAVIORALLY_GOVERNED</span>
              </div>
              <div>
                <span className="opacity-50">EC:</span> 0.97{" "}
                <span className="opacity-50">SAS:</span> 0.93{" "}
                <span className="opacity-50">IF:</span> 0.91{" "}
                <span className="opacity-50">AUC:</span> 0.88
              </div>
              <div>
                <span className="opacity-50">attestation:</span> <span>5 hashes verified</span>
              </div>
              <div>
                <span className="opacity-50">signature:</span> <span>Ed25519 ✓</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="border-t border-base-300 px-6 py-20">
      <div className="max-w-5xl mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-semibold mb-6">
            KGB is to AI governance what HaluEval is to factuality —
            <br />
            the public yardstick the industry argues about.
          </h2>
          <div className="flex flex-wrap gap-3 justify-center mt-8">
            <Link to="/specs" className="btn btn-primary">
              Read the specifications
            </Link>
            <a
              href="https://github.com/Kenshiki-Labs/governance-index"
              className="btn btn-ghost"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
