"""Stub judge for the walking-skeleton smoke test.

Returns the hardcoded valid proof graph from KGB Tool spec Appendix A.5
so the runner can be exercised end-to-end before the real DAG-judge
prompt is wired through the adapter layer (week 3–4).
"""

from __future__ import annotations

from kgb.schemas.bridge import Bridge
from kgb.schemas.probe import Probe
from kgb.schemas.proof_graph import (
    Claim,
    CriticalQuestionDischarge,
    DefeaterEvaluation,
    Fact,
    GraphBridge,
    JudgeOutput,
    ProofGraph,
)


class StubJudge:
    judge_id = "stub-judge"

    async def compile(
        self,
        *,
        probe: Probe,
        target_response: str,
        catalog_excerpt: dict[str, Bridge],
    ) -> JudgeOutput:
        del target_response, catalog_excerpt

        return JudgeOutput(
            outcome="proof_graph",
            proof_graph=ProofGraph(
                facts=[
                    Fact(
                        id="f.1",
                        ontology_class="regulatory_citation",
                        value=probe.source_unit.citation,
                        source_unit_uri=probe.source_unit.corpus_uri,
                        content_sha256=probe.source_unit.content_sha256,
                        anchored=True,
                    ),
                    Fact(
                        id="f.2",
                        ontology_class="definitional_text",
                        value=(
                            "business associate means a person who, on behalf of a "
                            "covered entity, performs a function or activity involving "
                            "the use or disclosure of individually identifiable health "
                            "information, including claims processing"
                        ),
                        source_unit_uri=probe.source_unit.corpus_uri,
                        content_sha256=probe.source_unit.content_sha256,
                        anchored=True,
                    ),
                    Fact(
                        id="f.3",
                        ontology_class="subject_attribute",
                        value="a third-party vendor processes insurance claims on behalf of a hospital",
                        source_unit_uri="probe.user_message",
                        content_sha256=None,
                        anchored=True,
                    ),
                ],
                claims=[
                    Claim(
                        id="c.1",
                        claim_type="definitional.hipaa.business_associate",
                        assertion="the third-party vendor is a business associate under HIPAA",
                        is_root=True,
                    ),
                ],
                bridges=[
                    GraphBridge(
                        bridge_type="definitional.hipaa.business_associate.v1",
                        inputs=["f.3", "f.2"],
                        output="c.1",
                        critical_questions_discharged=[
                            CriticalQuestionDischarge(
                                cq_id="cq.activity_enumeration_check",
                                discharge_evidence_node_id="f.2",
                                status="discharged",
                            ),
                            CriticalQuestionDischarge(
                                cq_id="cq.on_behalf_of_check",
                                discharge_evidence_node_id="f.3",
                                status="discharged",
                            ),
                        ],
                        declared_defeaters_evaluated=[
                            DefeaterEvaluation(df_id="df.workforce_exclusion", fired=False),
                            DefeaterEvaluation(df_id="df.conduit_exception", fired=False),
                            DefeaterEvaluation(df_id="df.covered_entity_itself", fired=False),
                        ],
                        burden_outcome="satisfied",
                    ),
                ],
                root_claim_id="c.1",
            ),
        )
