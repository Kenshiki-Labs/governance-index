"""DAG-judge output schema.

Mirrors KGB Tool spec Appendix A.3. The JudgeOutput is what every judge
in the ensemble produces per probe response.
"""

from __future__ import annotations

from typing import Literal

from pydantic import Field, model_validator

from kgb.schemas._base import StrictModel

OntologyClass = Literal[
    "statutory_citation",
    "regulatory_citation",
    "definitional_text",
    "subject_attribute",
    "temporal_fact",
]

RefusalType = Literal[
    "refuse.no_evidence",
    "refuse.out_of_scope",
    "disclaim.uncertainty",
    "disclaim.policy",
]

ReasonCode = Literal[
    "unanchored_fact",
    "unknown_claim_type",
    "unknown_bridge_type",
    "undischarged_critical_question",
    "declared_defeater_fired",
    "hidden_premise",
    "circular_dependency",
    "output_not_parseable",
]

BurdenOutcome = Literal["satisfied", "partial", "failed"]

DischargeStatus = Literal["discharged", "not_discharged"]

# Patterns per the JSON schema in KGB Tool spec Appendix A.3.
_FACT_ID = r"^f\.[0-9]+$"
_CLAIM_ID = r"^c\.[0-9]+$"


class Fact(StrictModel):
    id: str = Field(pattern=_FACT_ID)
    ontology_class: OntologyClass
    value: str
    source_unit_uri: str
    content_sha256: str | None = None
    anchored: bool


class Claim(StrictModel):
    id: str = Field(pattern=_CLAIM_ID)
    claim_type: str
    assertion: str
    is_root: bool


class CriticalQuestionDischarge(StrictModel):
    cq_id: str
    discharge_evidence_node_id: str | None = None
    status: DischargeStatus


class DefeaterEvaluation(StrictModel):
    df_id: str
    fired: bool


class GraphBridge(StrictModel):
    bridge_type: str
    inputs: list[str]
    output: str = Field(pattern=_CLAIM_ID)
    critical_questions_discharged: list[CriticalQuestionDischarge]
    declared_defeaters_evaluated: list[DefeaterEvaluation]
    burden_outcome: BurdenOutcome


class ProofGraph(StrictModel):
    facts: list[Fact]
    claims: list[Claim]
    bridges: list[GraphBridge]
    root_claim_id: str = Field(pattern=_CLAIM_ID)

    @model_validator(mode="after")
    def _cross_references_resolve(self) -> ProofGraph:
        fact_ids = {f.id for f in self.facts}
        claim_ids = {c.id for c in self.claims}
        node_ids = fact_ids | claim_ids

        # root_claim_id must be a claim that exists AND is marked is_root.
        root = next((c for c in self.claims if c.id == self.root_claim_id), None)
        if root is None:
            raise ValueError(
                f"root_claim_id={self.root_claim_id!r} does not match any claim id"
            )
        if not root.is_root:
            raise ValueError(
                f"root_claim_id={self.root_claim_id!r} references a claim "
                "whose is_root is False"
            )

        # Every bridge's inputs and output must resolve into the graph.
        for i, bridge in enumerate(self.bridges):
            for input_id in bridge.inputs:
                if input_id not in node_ids:
                    raise ValueError(
                        f"bridges[{i}].inputs references unknown node {input_id!r}"
                    )
            if bridge.output not in claim_ids:
                raise ValueError(
                    f"bridges[{i}].output={bridge.output!r} does not match any claim id"
                )
            # critical-question discharge evidence must resolve when present.
            for j, cq in enumerate(bridge.critical_questions_discharged):
                if (
                    cq.discharge_evidence_node_id is not None
                    and cq.discharge_evidence_node_id not in node_ids
                ):
                    raise ValueError(
                        f"bridges[{i}].critical_questions_discharged[{j}]."
                        f"discharge_evidence_node_id={cq.discharge_evidence_node_id!r} "
                        "does not match any node id"
                    )

        return self


class TypedRefusal(StrictModel):
    refusal_type: RefusalType
    quote: str


class RefusalToCompile(StrictModel):
    reason_code: ReasonCode
    explanation: str
    offending_node_id: str | None = None
    offending_cq_id: str | None = None
    offending_df_id: str | None = None


Outcome = Literal["proof_graph", "typed_refusal", "refusal_to_compile"]


class JudgeOutput(StrictModel):
    outcome: Outcome
    proof_graph: ProofGraph | None = None
    typed_refusal: TypedRefusal | None = None
    refusal_to_compile: RefusalToCompile | None = None

    @model_validator(mode="after")
    def _exactly_one_payload(self) -> JudgeOutput:
        payloads = {
            "proof_graph": self.proof_graph,
            "typed_refusal": self.typed_refusal,
            "refusal_to_compile": self.refusal_to_compile,
        }
        present = [k for k, v in payloads.items() if v is not None]
        if present != [self.outcome]:
            raise ValueError(
                f"outcome={self.outcome!r} requires exactly that payload field; "
                f"present fields: {present}"
            )
        return self
