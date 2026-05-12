"""Catalog Registry bridge type schema.

Mirrors KGB Tool spec §3.9.8 and Appendix B.
"""

from __future__ import annotations

from typing import Literal

from pydantic import Field

from kgb.schemas._base import StrictModel


class BridgeInput(StrictModel):
    role: str
    type: str
    description: str | None = None


class BridgeOutput(StrictModel):
    type: str
    description: str | None = None


class CriticalQuestion(StrictModel):
    id: str
    text: str
    discharge_rule: str


class DeclaredDefeater(StrictModel):
    id: str
    text: str
    condition: str


class Bridge(StrictModel):
    bridge_type: str
    schema_version: str
    bridge_class: str = Field(alias="class")
    framework: str
    authority_citation: str
    description: str | None = None
    inputs: list[BridgeInput]
    output: BridgeOutput
    critical_questions: list[CriticalQuestion]
    declared_defeaters: list[DeclaredDefeater]
    burden_rule: Literal["hard_discharge", "soft_discharge"]
    sha256: str | None = None
