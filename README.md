<div align="center">

# Kenshiki Governance Index

**The public benchmark for AI governance properties.**

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Python 3.13+](https://img.shields.io/badge/python-3.13+-blue.svg)](https://www.python.org/downloads/)
[![Status: v0.1 pre-alpha](https://img.shields.io/badge/status-v0.1_pre--alpha-orange.svg)](#status)
[![Methodology: open](https://img.shields.io/badge/methodology-open-green.svg)](#documentation)

[The Index](https://index.kenshikilabs.com) · [Methodology](#documentation) · [How it works](#how-it-works) · [Reproducibility](#reproducibility) · [Citing KGB](#citing-kgb)

</div>

---

## What this is

Hallucination has HaluEval, FACTS Grounding, SimpleQA. Capability has MMLU and HELM. **Governance had nothing.** Procurement teams ask vendors "does your model stay within evidence?" and get marketing answers; regulators ask "is this model auditable?" and get principles documents. There was no shared yardstick.

`governance-index` is that yardstick:

- **KGB** — the **Kenshiki Governance Benchmark** methodology and reference runner. Open source. Apache 2.0. Reproducible builds. Cryptographically signed reports.
- **The Index** — the continuously-updated public leaderboard at `index.kenshikilabs.com`. Free to read. Free to verify. Free to re-run.

The methodology measures four behavioral properties of a model under realistic open-book governance inputs:

| Dimension | What it measures |
| --------- | ---------------- |
| **Evidence Confinement (EC)** | Does the model stay within the source material it was given? |
| **Source Attribution Stability (SAS)** | Does it cite the right sources, the same way, across paraphrased asks? |
| **Instruction Fidelity (IF)** | Does it follow the open-book instruction even when its training data could support an unprovided answer? |
| **Abstention/Uncertainty Calibration (AUC)** | Does it decline when the provided evidence does not support an answer? |

Plus a structural audit (KGB-Structural) of any governance payload the model emits and a cross-cutting reliability profile (response stability, temperature sensitivity, calibration agreement, prompt sensitivity).

## Status

**v0.1 pre-alpha.** Public launch target: **Q3 2026.**

| Milestone | Target |
| --------- | ------ |
| Walking skeleton (probe → adapter → judge → signed report) | ✅ Week 1 |
| Real OpenRouter adapter, real DAG-judge against pinned frontier models | Week 2–3 |
| Catalog Registry of bridge types (v0.1 vocabulary) | Week 3–5 |
| Ed25519 signing + verification + reproducible builds | Week 4–6 |
| Public Index site at `index.kenshikilabs.com` | Week 7–9 |
| Human-annotator calibration study (κ ≥ 0.80 per dimension) | Week 10–11 |
| First-cut Index publication (5–10 frontier models) | Week 12–13 |
| **v0.1 public launch** | Q3 2026 |

The development is in the open. Issues and discussions land on GitHub once the repo is public.

## How it works

A KGB evaluation is a chain of typed artifacts, each pinned by SHA-256:

```text
┌──────────┐    ┌─────────────┐    ┌────────────────┐    ┌────────────────┐
│  Probe   │───►│   Target    │───►│ Judge Ensemble │───►│ Signed Report  │
│ + inline │    │   Model     │    │  (DAG compile) │    │ + 5-hash       │
│  source  │    │ (OpenRouter)│    │ primary +      │    │   attestation  │
└──────────┘    └─────────────┘    │ secondary, no  │    └────────────────┘
                                   │ self-judging   │
                                   └────────────────┘
```

**Probes are built from real regulatory text.** Each probe carries inline statutory or regulatory source material from Kenshiki Labs' 30,000-chunk governance corpus (HIPAA, GDPR, EU AI Act, ISO 42001, NIST RMF, FedRAMP, state AI laws). The probe is open-book by default: the source is in the prompt, the target model answers using only that source. No model has corpus access at evaluation time — including Kenshiki's own.

**Judges compile typed proof graphs.** Instead of rubric-style scoring, each judge in the ensemble compiles the target's response into a typed graph: `facts` (anchored to the inline source), `claims` (typed from a versioned taxonomy), `bridges` (typed inferential edges from the Catalog Registry, each with discharged critical questions and evaluated defeaters). The judge emits one of three structural outcomes: a valid proof graph, a typed refusal, or a refusal-to-compile with a specific failure code. The architecture follows the Reasoning Trace Integrity work in Kenshiki Labs' SSRN paper (Foley, 2026).

**No judge scores its own family.** The ensemble uses anti-conflict routing: if the target model is from the primary judge's provider family, the secondary judge handles that row. Inter-judge agreement is measured per-fact, per-claim, per-bridge — disagreements localize to specific structural elements rather than dissolving into an aggregate score, and they publish alongside the report.

**Every report is signed and attestation-chained.** Each report carries five SHA-256 hashes pinning the tool binary, the probe registry, the bridge catalog, the methodology schemas, and the evaluator. The report itself is canonicalized via RFC 8785 and signed with Ed25519. Any third party can independently re-run the runner against any model and produce a verifiable replay.

## Repository layout

This is a monorepo.

```text
governance-index/
├── packages/
│   └── kgb/                    Python library — the reference runner (Apache 2.0)
│       ├── pyproject.toml
│       ├── src/kgb/
│       │   ├── canonical.py    RFC 8785 JSON canonicalization (owned in-tree)
│       │   ├── corpus.py       CorpusClient Protocol (probe-authoring time only)
│       │   ├── runner.py       Run orchestrator
│       │   ├── cli.py          Entry point: kgb run / verify / replay / compare
│       │   ├── adapters/       ProviderAdapter Protocol + implementations
│       │   ├── judge/          Judge Protocol + DAG-judge implementations
│       │   └── schemas/        Pydantic v2 strict models for every artifact
│       └── tests/
└── apps/
    └── index/                  TanStack Router (Vite) SPA — the public Index
                                leaderboard (deploys to Vercel at
                                index.kenshikilabs.com)
```

The Python library has zero coupling to the web app — it runs anywhere, including on a laptop with no network beyond OpenRouter. The Vercel deployment is Kenshiki's canonical operational environment, not the build artifact third parties verify against.

## Quick start

### Prerequisites

- Python 3.13+
- An OpenRouter API key ([openrouter.ai](https://openrouter.ai)) for evaluating frontier models, _or_ a local Python venv for stub-mode development

### Install (development)

```bash
git clone https://github.com/kenshiki-labs/governance-index.git
cd governance-index/packages/kgb

python3.13 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"

pytest                    # 42 tests, ~0.1s
kgb version               # 0.1.0.dev0
```

### Run a benchmark (week 2+)

Once the real OpenRouter adapter and judge wiring land:

```bash
export OPENROUTER_API_KEY=sk-or-...
export KGB_EVALUATOR_SIGNING_KEY=~/.kgb/keys/operator.ed25519.priv

kgb run \
    --target openai/gpt-4o \
    --target anthropic/claude-opus-4-7 \
    --target google/gemini-2.5-pro \
    --suite full \
    --mode standard \
    --max-cost-usd 100 \
    --output-dir reports/
```

### Verify a published Index report

```bash
kgb verify --report report.json
# → VALID / INVALID_SIGNATURE / INVALID_TOOL / INVALID_REGISTRY / ...
```

Verification is local once you've fetched the published key registry, build manifest, and registry hash list from `keys.kenshikilabs.com/kgb/`.

## Reproducibility

KGB is built around the assumption that a published score is only meaningful if a third party can reproduce it. Three properties together make that work:

1. **Reproducible builds.** The Python tool builds deterministically — same source + same lock file + same toolchain → byte-identical binary → matching `tool_sha256`. A third party with the canonical source can produce a binary that matches the published hash exactly.
2. **Pinned probe registry and bridge catalog.** Both are versioned Merkle trees with single signed roots (`registry_sha256`, `catalog_sha256`). A mismatch anywhere aborts the run before any model is called.
3. **Deterministic replay.** Every report records the exact seeds, temperatures, probe IDs, judge identities, and adapter routes used. `kgb replay --report prior.json` produces a fresh run against the same configuration. If the replay matches the original (modulo measured provider non-determinism), the dispute is resolved.

**Vendor dispute resolution** works the same way: any model vendor can take a published report, run `kgb replay` against their own direct provider API (bypassing OpenRouter), and produce a signed replay report. Both reports publish side-by-side.

## Documentation

The four KGB specifications live in [`docs/specs/`](docs/specs/) under Apache 2.0:

| Document | What it covers |
| -------- | -------------- |
| [Executive summary](docs/specs/exec-summary.mdx) | One-page positioning, moat, build plan, budget, risks. Start here. |
| [KGB-Public](docs/specs/kgb-public.mdx) | Behavioral probe methodology — EC / SAS / IF / AUC dimensions, multi-judge ensemble, calibration, regulatory mapping |
| [KGB-Structural](docs/specs/kgb-structural.mdx) | Artifact-audit methodology — five hard gates, four predicate classes, categorical compliance taxonomy |
| [KGB Tool](docs/specs/kgb-tool.mdx) | Engineering reference — tool architecture, DAG-judge prompt template, canonical bridge and probe (Appendices A–C) |

See [`docs/README.md`](docs/README.md) for reading order, versioning policy, citation guidance, and the patent/prior-art notice.

## What KGB is not

- **Not a capability benchmark.** KGB does not test accuracy on MMLU-style questions, helpfulness on chatbot evaluations, or factuality in the SimpleQA sense. It tests process properties.
- **Not a compliance certificate.** A KGB report is evidence that can support a compliance audit. It is not itself a regulatory filing or certification.
- **Not a static benchmark.** The probe registry and bridge catalog evolve as model behavior evolves. Scores are versioned: a v0.1 score is not interchangeable with a v0.3 score.
- **Not Goober.** Goober is Kenshiki Labs' runtime governance product. KGB scores Goober the same way it scores every other listed model — by the same external judge ensemble, against the same probes, with no Kenshiki-internal evaluator in the chain.

## Conflict of interest

Kenshiki Labs authors the KGB methodology and curates the probe registry. This is the same conflict every benchmark publisher carries — HaluEval, MMLU, FACTS Grounding, SimpleQA are all authored by interested parties. KGB manages the conflict by being explicit about it:

- **Kenshiki Labs is not the judge of any single evaluation.** The judge ensemble is external (frontier models from at least two provider families).
- **No judge scores its own provider family.** Anti-conflict routing is recorded in every report.
- **Goober is held to a higher bar.** When Goober enters the Index, its results require at least one third-party-operator signed replay before publication; the published score is the lower of the two when they disagree.
- **External validation runs annually.** Kenshiki commissions an academic or auditing group to re-run the full Index using independent infrastructure and judge configurations.
- **No pay-to-delay.** Kenshiki does not accept funding from model vendors in exchange for delayed publication, removed reports, or altered methodology.

## Contributing

The v0.1 build is closed to external contribution while the core methodology stabilizes. Once v0.1 ships, the contribution surfaces are:

- **Probe submissions** (v0.2+): documented submission process for external authors. Submitted probes must calibrate to κ ≥ 0.80 against the human-annotator panel before admission.
- **Bridge type proposals**: extensions to the Catalog Registry follow the same calibration discipline as probes, plus counsel review for legal accuracy.
- **Bug reports and methodology critique**: open at any time once the GitHub repo is public.
- **Federated leaderboards** (v0.3+): third parties may publish their own KGB-conforming leaderboards. Cross-leaderboard comparison is supported as long as both name their probe registry and catalog hashes.

A `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md` will land with the public launch.

## Security and responsible disclosure

KGB handles API keys, signing keys, and signed reports. If you find a security issue — key handling, signature bypass, adapter injection, evaluator manipulation, attestation-chain break — please report it privately to `security@kenshikilabs.com` rather than opening a public issue.

A `SECURITY.md` policy lands with the public launch.

## Patent and prior-art notice

KGB's judge architecture uses the **architectural pattern** from Kenshiki Labs' Reasoning Trace Integrity work (Foley, 2026 SSRN) — candidate → typed graph → kernel verification → artifact-or-refusal — under an explicit Apache 2.0 grant for benchmark use.

KGB does **not** practice the methods of Kenshiki Labs' provisional patent application _Deterministic Inference Compiler_ (2026), which are scoped to runtime governance products (specifically: Fact Register binding, ledger-anchored cryptographic attestation, lattice access control, the three-tier deployment contract). Third-party operators running KGB do not practice the patent. Third parties building runtime governance products on top of the benchmark's architectural pattern do, and require a separate license — contact `legal@kenshikilabs.com`.

## Citing KGB

If you use KGB in academic work, please cite both the methodology and the specific version of the runner you used.

```bibtex
@misc{kgb2026,
  title        = {Kenshiki Governance Benchmark (KGB)},
  author       = {Kenshiki Labs},
  year         = {2026},
  howpublished = {\url{https://index.kenshikilabs.com}},
  note         = {Version 0.1}
}

@misc{foley2026rti,
  title        = {Reasoning Trace Integrity: Synthesis-Preserving Governance for Generative AI},
  author       = {Foley, Stephen},
  year         = {2026},
  howpublished = {SSRN},
  note         = {Methodological substrate for KGB judge architecture}
}
```

## License

Apache License 2.0. See [LICENSE](LICENSE).

Copyright © 2026 Kenshiki Labs, Inc.

---

<div align="center">

**KGB is to AI governance what HaluEval is to factuality:**
**the public yardstick the industry argues about.**

</div>
