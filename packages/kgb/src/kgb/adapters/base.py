"""ProviderAdapter Protocol — the contract every adapter implements.

Mirrors KGB Tool spec §3.2.3.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Protocol


@dataclass(frozen=True)
class AdapterRequest:
    model: str
    system_prompt: str
    user_messages: list[dict]
    temperature: float
    max_tokens: int
    seed: int | None
    request_id: str


@dataclass(frozen=True)
class AdapterResponse:
    completion_text: str
    model_id_returned: str
    model_version_returned: str | None
    provider_system_fingerprint: str | None
    usage: dict
    latency_ms: float
    gateway_request_id: str | None
    provider_request_id: str | None
    raw_response_headers: dict = field(default_factory=dict)


class ProviderAdapter(Protocol):
    """The interface every adapter implements.

    `adapter_id` is the literal name recorded in reports (`"openrouter"`,
    `"openai"`, `"anthropic"`, ...). See KGB Tool spec §4 attestation chain.
    """

    adapter_id: str

    async def call(self, request: AdapterRequest) -> AdapterResponse: ...
