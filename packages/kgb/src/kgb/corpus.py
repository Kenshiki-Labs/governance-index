"""CorpusClient Protocol.

Build-time dependency only — the corpus is queried at probe-authoring
time, not at runtime. Mirrors KGB Tool spec §3.9.3.
"""

from __future__ import annotations

from typing import Protocol

from kgb.schemas.probe import SourceUnit


class CorpusClient(Protocol):
    async def search(
        self,
        *,
        query: str,
        framework: str | None = None,
        limit: int = 20,
    ) -> list[SourceUnit]: ...

    async def get(self, *, source_unit_id: str) -> SourceUnit: ...
