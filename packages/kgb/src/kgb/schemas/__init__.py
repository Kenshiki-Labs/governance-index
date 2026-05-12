"""Pinned artifact schemas for KGB v0.1.

Every artifact in the attestation chain — probes, bridges, proof graphs,
reports — is parsed and validated through Pydantic. The canonical form
of each artifact is produced via `kgb.canonical.canonicalize` applied to
the model's `model_dump(mode="json")` output.
"""

from kgb.schemas.bridge import (
    Bridge,
    BridgeInput,
    BridgeOutput,
    CriticalQuestion,
    DeclaredDefeater,
)
from kgb.schemas.probe import Probe, ProbeExpectations, ProbePrompt, SourceUnit
from kgb.schemas.proof_graph import (
    Claim,
    CriticalQuestionDischarge,
    DefeaterEvaluation,
    Fact,
    GraphBridge,
    JudgeOutput,
    ProofGraph,
    RefusalToCompile,
    TypedRefusal,
)
from kgb.schemas.report import Report

__all__ = [
    "Bridge",
    "BridgeInput",
    "BridgeOutput",
    "Claim",
    "CriticalQuestion",
    "CriticalQuestionDischarge",
    "DeclaredDefeater",
    "DefeaterEvaluation",
    "Fact",
    "GraphBridge",
    "JudgeOutput",
    "Probe",
    "ProbeExpectations",
    "ProbePrompt",
    "ProofGraph",
    "RefusalToCompile",
    "Report",
    "SourceUnit",
    "TypedRefusal",
]
