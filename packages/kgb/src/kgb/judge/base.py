"""Judge Protocol — the contract every judge in the ensemble implements.

Mirrors KGB Tool spec §3.4 and Appendix A.
"""

from __future__ import annotations

from typing import Protocol

from kgb.schemas.bridge import Bridge
from kgb.schemas.probe import Probe
from kgb.schemas.proof_graph import JudgeOutput


class Judge(Protocol):
    """The interface every judge in the ensemble implements.

    `judge_id` is the literal name recorded in reports
    (`"openai/gpt-4o-2024-08-06"`, `"anthropic/claude-opus-4-7"`, ...).
    The orchestrator's anti-conflict routing reads this to avoid having
    a judge score its own provider family. See KGB Tool spec §3.4.
    """

    judge_id: str

    async def compile(
        self,
        *,
        probe: Probe,
        target_response: str,
        catalog_excerpt: dict[str, Bridge],
    ) -> JudgeOutput: ...
