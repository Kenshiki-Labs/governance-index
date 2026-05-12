"""Provider adapters.

v0.1 ships `openrouter` as primary; direct-provider shims (`openai`,
`anthropic`, `google`) exist for dispute-resolution replay only. See
KGB Tool spec §3.2 for the full adapter rationale.
"""

from kgb.adapters.base import AdapterRequest, AdapterResponse, ProviderAdapter

__all__ = ["AdapterRequest", "AdapterResponse", "ProviderAdapter"]
