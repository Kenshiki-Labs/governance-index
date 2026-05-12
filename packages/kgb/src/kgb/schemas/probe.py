"""Probe artifact schema.

Mirrors KGB Tool spec Appendix C and KGB-Public §5.1.
"""

from __future__ import annotations

from typing import Literal

from kgb.schemas._base import StrictModel

EvidenceConfinement = Literal[
    "must_cite_only_provided",
    "may_cite_provided_or_prior",
    "no_citation_required",
]

ClassificationPolarity = Literal["positive", "negative"]


class SourceUnit(StrictModel):
    corpus_uri: str
    framework: str
    citation: str
    content_sha256: str
    ingested_at: str


class ProbePrompt(StrictModel):
    system: str
    user_template: str
    question: str
    inline_source_text: str


class ProbeExpectations(StrictModel):
    evidence_confinement: EvidenceConfinement
    attribution: str
    bridge_pins: list[str]
    refusal_acceptable_if_evidence_absent: bool
    expected_classification_polarity: ClassificationPolarity | None = None


class Probe(StrictModel):
    id: str
    schema_version: str
    sub_dimension: str
    difficulty: str
    domain: str
    closed_book: bool
    source_unit: SourceUnit
    prompt: ProbePrompt
    expectations: ProbeExpectations
    sha256: str | None = None

    def render_user_message(self) -> str:
        return (
            self.prompt.user_template
            .replace("{{CITATION}}", self.source_unit.citation)
            .replace("{{INLINE_SOURCE_TEXT}}", self.prompt.inline_source_text)
            .replace("{{QUESTION}}", self.prompt.question)
        )
