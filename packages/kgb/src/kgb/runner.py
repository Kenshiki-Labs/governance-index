"""Run orchestrator — composes probe + adapter + judge into a report.

Mirrors KGB Tool spec §3.3. Walking-skeleton scope: single probe call,
single judge, single adapter, unsigned report. Multi-judge ensemble,
anti-conflict routing, retries, cost ceiling, and Ed25519 signing land
in subsequent weeks.
"""

from __future__ import annotations

from dataclasses import dataclass

from kgb.adapters.base import AdapterRequest, ProviderAdapter
from kgb.judge.base import Judge
from kgb.schemas.bridge import Bridge
from kgb.schemas.probe import Probe
from kgb.schemas.report import Report


@dataclass(frozen=True)
class RunConfig:
    """Per-call parameters. Pulled out of the runner so reliability-profile
    measurement (N runs per probe, varying seed) is a configuration concern
    rather than a code change."""

    target_model: str
    temperature: float = 0.0
    max_tokens: int = 2000
    seed: int | None = 42
    run_index: int = 0


class Runner:
    def __init__(
        self,
        *,
        adapter: ProviderAdapter,
        judge: Judge,
        config: RunConfig,
        catalog: dict[str, Bridge] | None = None,
    ) -> None:
        self._adapter = adapter
        self._judge = judge
        self._config = config
        self._catalog = catalog or {}

    async def run_one(self, probe: Probe) -> Report:
        cfg = self._config

        request = AdapterRequest(
            model=cfg.target_model,
            system_prompt=probe.prompt.system,
            user_messages=[{"role": "user", "content": probe.render_user_message()}],
            temperature=cfg.temperature,
            max_tokens=cfg.max_tokens,
            seed=cfg.seed,
            request_id=f"{probe.id}::{cfg.target_model}::run-{cfg.run_index}",
        )

        response = await self._adapter.call(request)

        catalog_excerpt = {
            bridge_type: self._catalog[bridge_type]
            for bridge_type in probe.expectations.bridge_pins
            if bridge_type in self._catalog
        }

        judge_output = await self._judge.compile(
            probe=probe,
            target_response=response.completion_text,
            catalog_excerpt=catalog_excerpt,
        )

        report = Report(
            probe_id=probe.id,
            target_model=cfg.target_model,
            target_response=response.completion_text,
            adapter=self._adapter.adapter_id,
            judge_outputs=[judge_output],
            evaluator_id=self._judge.judge_id,
        )

        return report.with_canonical_hash()
