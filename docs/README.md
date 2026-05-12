# Documentation

The four KGB specifications live here under [Apache License 2.0](../LICENSE). All four are published as **v0.1 public drafts** — the methodology is open, the methodology will evolve, and changes are tracked in versioned releases.

## Read in this order

| Order | Document | What it covers | Length |
| ----- | -------- | -------------- | ------ |
| 1 | [`exec-summary.mdx`](specs/exec-summary.mdx) | One-page positioning. The thesis, the moat, the build plan, the budget, the risks. Start here. | ~1 page |
| 2 | [`kgb-public.mdx`](specs/kgb-public.mdx) | **KGB-Public** — behavioral probe methodology. The four first-order dimensions (EC / SAS / IF / AUC), the reliability profile, the judge ensemble, calibration, regulatory mapping. | ~50 pages |
| 3 | [`kgb-structural.mdx`](specs/kgb-structural.mdx) | **KGB-Structural** — artifact-audit methodology. What a governance payload must contain, the five hard gates, the four predicate classes, the categorical compliance taxonomy. | ~30 pages |
| 4 | [`kgb-tool.mdx`](specs/kgb-tool.mdx) | **KGB Tool** — engineering reference. Tool architecture, OpenRouter adapter, multi-judge ensemble, signing chain, public-leaderboard governance, the canonical DAG-judge prompt template and bridge/probe artifacts (appendices A–C). | ~60 pages |

## What "Public Draft v0.1" means

These specifications are **published openly** under Apache 2.0. Anyone can read them, redistribute them, build implementations against them, or cite them in academic work. They are **drafts** in the sense that v0.1 is the first published version: subsequent versions (v0.2, v0.3) will refine probe scope, judge architecture, and operational details as the benchmark accumulates calibration data and external feedback.

Versioning discipline:

- **Major versions** (v1.0+) — methodology stable; any published report can be replayed and verified indefinitely.
- **Minor versions** (v0.2, v0.3) — additive probes, additional bridge classes in the Catalog Registry, expanded regulatory mappings. Old reports remain valid within their version.
- **Patch versions** (v0.1.x) — clarifications, errata, and typos. No semantic change.

## How to cite

```bibtex
@misc{kgb-spec-v01-2026,
  title        = {Kenshiki Governance Benchmark — Specifications v0.1},
  author       = {Kenshiki Labs},
  year         = {2026},
  howpublished = {\url{https://github.com/kenshiki-labs/governance-index/tree/main/docs/specs}},
  note         = {Public Draft v0.1, Apache 2.0}
}
```

When citing a specific spec, reference both the spec name and the version: e.g., "KGB-Public v0.1, §5.6 (AUC)".

## Patent and prior-art notice

The benchmark's judge architecture is built on the **architectural pattern** from Kenshiki Labs' Reasoning Trace Integrity work (Foley, 2026 SSRN), under an explicit Apache 2.0 grant for benchmark use.

The specifications do **not** describe and the open-source runner does **not** practice the methods of Kenshiki Labs' provisional patent application _Deterministic Inference Compiler_ (2026), which are scoped to runtime governance products. Third-party operators running KGB do not practice the patent. Third parties building runtime governance products on top of the benchmark's architectural pattern do, and require a separate license — see the root [`README.md`](../README.md).

## Feedback

Issues, critique, and methodology questions land on GitHub Issues once the repo is public. Confidential methodology-defect reports (e.g., gaming vectors that should be addressed before public disclosure) can be sent privately to `methodology@kenshikilabs.com`.
