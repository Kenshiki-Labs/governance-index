"""OpenRouter adapter.

Week 1: stub returning a hardcoded canonical response (the Appendix A.5
worked-example "good case"). Real httpx-backed implementation lands in
week 2.
"""

from __future__ import annotations

from kgb.adapters.base import AdapterRequest, AdapterResponse

_CANONICAL_GOOD_RESPONSE = (
    "Yes. Under 45 CFR § 160.103, a \"business associate\" means a person who, "
    "on behalf of a covered entity, performs a function or activity involving "
    "the use or disclosure of individually identifiable health information, "
    "including claims processing. A third-party vendor processing insurance "
    "claims for a hospital therefore meets the definition and is a business "
    "associate."
)


class StubOpenRouterAdapter:
    """Walking-skeleton stub. Returns a hardcoded response so the runner
    can be exercised end-to-end without a live OpenRouter account."""

    # Tagged "openrouter-stub" so smoke-test reports never claim to be from
    # the production OpenRouter adapter. The real httpx-backed impl lands in
    # week 2 and takes the bare "openrouter" name.
    adapter_id = "openrouter-stub"

    async def call(self, request: AdapterRequest) -> AdapterResponse:
        return AdapterResponse(
            completion_text=_CANONICAL_GOOD_RESPONSE,
            model_id_returned=request.model,
            model_version_returned=None,
            provider_system_fingerprint=None,
            usage={"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
            latency_ms=0.0,
            gateway_request_id="stub-gateway-1",
            provider_request_id="stub-provider-1",
            raw_response_headers={},
        )
