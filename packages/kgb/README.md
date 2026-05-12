# kgb — Kenshiki Governance Benchmark runner

The reference Python runner for the Kenshiki Governance Benchmark. Open source under Apache 2.0.

## Status

**v0.1 build in progress.** Public launch target: Q3 2026.

## Install (dev)

```bash
cd packages/kgb
python3.13 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

## Run tests

```bash
pytest
```

## Layout

```text
src/kgb/
├── canonical.py        RFC 8785 JSON Canonicalization (load-bearing primitive)
├── corpus.py           CorpusClient Protocol
├── runner.py           Run orchestrator (probe → adapter → judge → report)
├── cli.py              Entry point
├── adapters/
│   ├── base.py         ProviderAdapter Protocol
│   └── openrouter.py   Stub (real impl in week 2)
├── judge/
│   ├── base.py         Judge Protocol
│   └── stub.py         Stub (real DAG-judge impl in week 3)
└── schemas/
    ├── probe.py        Probe artifact
    ├── bridge.py       Bridge type definition
    ├── proof_graph.py  Fact / Claim / GraphBridge / ProofGraph / JudgeOutput
    └── report.py       Report artifact
```

See the KGB Tool specification for the full architecture.
