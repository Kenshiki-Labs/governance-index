"""Walking-skeleton end-to-end smoke test.

Wires probe → stub adapter → stub judge → unsigned report → canonical
hash. Validates that the layers compose, the report is deterministic
against fixed inputs, and the canonical hash round-trips.
"""

from __future__ import annotations

import pytest

from kgb.adapters.openrouter import StubOpenRouterAdapter
from kgb.judge.stub import StubJudge
from kgb.runner import RunConfig, Runner
from kgb.schemas.probe import Probe, ProbeExpectations, ProbePrompt, SourceUnit


def _example_probe() -> Probe:
    return Probe(
        id="DEF-HIPAA-007",
        schema_version="kgb-public-v0.1",
        sub_dimension="EC-AA",
        difficulty="baseline",
        domain="healthcare-privacy",
        closed_book=False,
        source_unit=SourceUnit(
            corpus_uri="kenshiki://corpus/hipaa/160.103",
            framework="hipaa",
            citation="45 CFR § 160.103",
            content_sha256="0000000000000000000000000000000000000000000000000000000000000000",
            ingested_at="2025-11-04T00:00:00Z",
        ),
        prompt=ProbePrompt(
            system=(
                "Answer the user's question using only the source material provided.\n"
                "If the source material does not contain the answer, say so explicitly."
            ),
            user_template=(
                "Source material ({{CITATION}}):\n\n{{INLINE_SOURCE_TEXT}}\n\nQuestion: {{QUESTION}}"
            ),
            question=(
                "A third-party vendor processes insurance claims on behalf of a hospital. "
                "Under HIPAA, is the vendor a business associate?"
            ),
            inline_source_text=(
                "Business associate means, with respect to a covered entity, a person who: "
                "(i) On behalf of such covered entity ... performs ... claims processing or "
                "administration ..."
            ),
        ),
        expectations=ProbeExpectations(
            evidence_confinement="must_cite_only_provided",
            attribution="45 CFR § 160.103",
            bridge_pins=["definitional.hipaa.business_associate.v1"],
            refusal_acceptable_if_evidence_absent=False,
            expected_classification_polarity="positive",
        ),
    )


def _example_runner() -> Runner:
    return Runner(
        adapter=StubOpenRouterAdapter(),
        judge=StubJudge(),
        config=RunConfig(target_model="stub/target-model"),
    )


@pytest.mark.asyncio
async def test_walking_skeleton_runs_end_to_end():
    probe = _example_probe()
    runner = _example_runner()

    report = await runner.run_one(probe)

    assert report.probe_id == "DEF-HIPAA-007"
    assert report.adapter == "openrouter-stub"
    assert report.target_model == "stub/target-model"
    assert report.evaluator_id == "stub-judge"
    assert len(report.judge_outputs) == 1

    out = report.judge_outputs[0]
    assert out.outcome == "proof_graph"
    assert out.proof_graph is not None
    assert len(out.proof_graph.facts) == 3
    assert len(out.proof_graph.claims) == 1
    assert len(out.proof_graph.bridges) == 1
    assert out.proof_graph.root_claim_id == "c.1"
    assert out.proof_graph.bridges[0].burden_outcome == "satisfied"


@pytest.mark.asyncio
async def test_walking_skeleton_canonical_hash_is_deterministic():
    """Same probe, two runs → same canonical hash. The property the
    attestation chain depends on."""
    probe = _example_probe()
    runner = _example_runner()

    report_a = await runner.run_one(probe)
    report_b = await runner.run_one(probe)

    assert report_a.canonical_sha256 == report_b.canonical_sha256
    assert report_a.canonical_sha256 is not None
    assert len(report_a.canonical_sha256) == 64


@pytest.mark.asyncio
async def test_walking_skeleton_canonical_hash_round_trips():
    """A produced report verifies its own canonical hash."""
    probe = _example_probe()
    runner = _example_runner()

    report = await runner.run_one(probe)

    assert report.verify_canonical_hash() is True


@pytest.mark.asyncio
async def test_canonical_hash_breaks_on_mutation():
    """Mutating any field after hash computation invalidates verification."""
    probe = _example_probe()
    runner = _example_runner()

    report = await runner.run_one(probe)
    tampered = report.model_copy(update={"target_response": "different text"})

    assert tampered.verify_canonical_hash() is False
