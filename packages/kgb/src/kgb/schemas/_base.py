"""Shared Pydantic base for KGB schema artifacts."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class StrictModel(BaseModel):
    """Every KGB schema rejects unknown fields and rejects mutation after parse.

    `extra="forbid"` is mandatory: silent ignoring of unknown fields would
    let a malformed artifact pass through the signing chain without
    matching the canonical hash a third party would compute.
    """

    model_config = ConfigDict(extra="forbid", populate_by_name=True)
