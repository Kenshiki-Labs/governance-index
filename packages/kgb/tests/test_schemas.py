"""Schema validation tests."""

from __future__ import annotations

import pytest
from pydantic import ValidationError

from kgb.schemas import (
    Claim,
    Fact,
    JudgeOutput,
    ProofGraph,
    RefusalToCompile,
    TypedRefusal,
)


def _example_proof_graph() -> ProofGraph:
    return ProofGraph(
        facts=[
            Fact(
                id="f.1",
                ontology_class="statutory_citation",
                value="45 CFR § 160.103",
                source_unit_uri="kenshiki://corpus/hipaa/160.103",
                content_sha256="abc",
                anchored=True,
            ),
        ],
        claims=[
            Claim(
                id="c.1",
                claim_type="definitional.hipaa.business_associate",
                assertion="yes",
                is_root=True,
            ),
        ],
        bridges=[],
        root_claim_id="c.1",
    )


def test_judge_output_proof_graph_ok():
    out = JudgeOutput(outcome="proof_graph", proof_graph=_example_proof_graph())
    assert out.outcome == "proof_graph"
    assert out.typed_refusal is None
    assert out.refusal_to_compile is None


def test_judge_output_typed_refusal_ok():
    out = JudgeOutput(
        outcome="typed_refusal",
        typed_refusal=TypedRefusal(refusal_type="disclaim.uncertainty", quote="I cannot..."),
    )
    assert out.typed_refusal is not None
    assert out.typed_refusal.refusal_type == "disclaim.uncertainty"


def test_judge_output_refusal_to_compile_ok():
    out = JudgeOutput(
        outcome="refusal_to_compile",
        refusal_to_compile=RefusalToCompile(
            reason_code="unanchored_fact",
            explanation="response cites unprovided source",
        ),
    )
    assert out.refusal_to_compile is not None
    assert out.refusal_to_compile.reason_code == "unanchored_fact"


def test_judge_output_rejects_outcome_without_payload():
    with pytest.raises(ValidationError):
        JudgeOutput(outcome="proof_graph")


def test_judge_output_rejects_wrong_payload_for_outcome():
    with pytest.raises(ValidationError):
        JudgeOutput(
            outcome="typed_refusal",
            proof_graph=_example_proof_graph(),
        )


def test_judge_output_rejects_multiple_payloads():
    with pytest.raises(ValidationError):
        JudgeOutput(
            outcome="proof_graph",
            proof_graph=_example_proof_graph(),
            typed_refusal=TypedRefusal(refusal_type="disclaim.policy", quote="no"),
        )


def test_fact_rejects_unknown_ontology_class():
    with pytest.raises(ValidationError):
        Fact(
            id="f.1",
            ontology_class="not_a_real_class",  # type: ignore[arg-type]
            value="x",
            source_unit_uri="x",
            anchored=True,
        )


def test_typed_refusal_rejects_unknown_refusal_type():
    with pytest.raises(ValidationError):
        TypedRefusal(refusal_type="refuse.something_new", quote="...")  # type: ignore[arg-type]


def test_fact_id_pattern_enforced():
    with pytest.raises(ValidationError):
        Fact(
            id="fact-one",  # wrong pattern; must be ^f\.[0-9]+$
            ontology_class="statutory_citation",
            value="x",
            source_unit_uri="x",
            anchored=True,
        )


def test_claim_id_pattern_enforced():
    with pytest.raises(ValidationError):
        Claim(id="root", claim_type="foo", assertion="x", is_root=True)


def test_proof_graph_rejects_root_id_with_no_matching_claim():
    with pytest.raises(ValidationError):
        ProofGraph(
            facts=[],
            claims=[Claim(id="c.1", claim_type="t", assertion="a", is_root=True)],
            bridges=[],
            root_claim_id="c.99",  # no such claim
        )


def test_proof_graph_rejects_non_root_claim_as_root():
    with pytest.raises(ValidationError):
        ProofGraph(
            facts=[],
            claims=[Claim(id="c.1", claim_type="t", assertion="a", is_root=False)],
            bridges=[],
            root_claim_id="c.1",
        )


def test_proof_graph_rejects_bridge_input_pointing_at_nothing():
    from kgb.schemas.proof_graph import GraphBridge

    with pytest.raises(ValidationError):
        ProofGraph(
            facts=[
                Fact(
                    id="f.1",
                    ontology_class="statutory_citation",
                    value="x",
                    source_unit_uri="x",
                    anchored=True,
                ),
            ],
            claims=[Claim(id="c.1", claim_type="t", assertion="a", is_root=True)],
            bridges=[
                GraphBridge(
                    bridge_type="b.v1",
                    inputs=["f.999"],  # no such fact
                    output="c.1",
                    critical_questions_discharged=[],
                    declared_defeaters_evaluated=[],
                    burden_outcome="satisfied",
                ),
            ],
            root_claim_id="c.1",
        )


def test_proof_graph_rejects_bridge_output_pointing_at_nothing():
    from kgb.schemas.proof_graph import GraphBridge

    with pytest.raises(ValidationError):
        ProofGraph(
            facts=[
                Fact(
                    id="f.1",
                    ontology_class="statutory_citation",
                    value="x",
                    source_unit_uri="x",
                    anchored=True,
                ),
            ],
            claims=[Claim(id="c.1", claim_type="t", assertion="a", is_root=True)],
            bridges=[
                GraphBridge(
                    bridge_type="b.v1",
                    inputs=["f.1"],
                    output="c.99",  # no such claim
                    critical_questions_discharged=[],
                    declared_defeaters_evaluated=[],
                    burden_outcome="satisfied",
                ),
            ],
            root_claim_id="c.1",
        )


def test_probe_expectations_rejects_unknown_polarity():
    from kgb.schemas.probe import ProbeExpectations

    with pytest.raises(ValidationError):
        ProbeExpectations(
            evidence_confinement="must_cite_only_provided",
            attribution="x",
            bridge_pins=[],
            refusal_acceptable_if_evidence_absent=False,
            expected_classification_polarity="ambiguous",  # type: ignore[arg-type]
        )
