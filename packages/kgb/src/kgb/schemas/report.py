"""Report artifact schema.

The unsigned form. Cryptographic signing is layered on in week 3–4 once
the report shape settles around the DAG-judge outputs.

The canonical hash discipline lives here, not in the runner, so every
caller produces the same hash for the same content without having to
remember to exclude the right fields.
"""

from __future__ import annotations

from typing import Any

from kgb.canonical import canonicalize, sha256_hex
from kgb.schemas._base import StrictModel
from kgb.schemas.proof_graph import JudgeOutput


class Report(StrictModel):
    schema_version: str = "kgb-v0.1"
    probe_id: str
    target_model: str
    target_response: str
    adapter: str
    judge_outputs: list[JudgeOutput]

    # Attestation-chain fields (KGB Tool spec §4). v0.1 week-1 ships these
    # as optional so the walking skeleton can emit a report; subsequent
    # weeks make them required once the underlying components exist.
    tool_sha256: str | None = None
    registry_sha256: str | None = None
    catalog_sha256: str | None = None
    schema_sha256: str | None = None
    judge_prompt_sha256: str | None = None
    evaluator_id: str | None = None

    # Self-hash of the canonical bytes (excluding this field and the
    # forthcoming signature). Computed by `with_canonical_hash`, verified
    # by `verify_canonical_hash`.
    canonical_sha256: str | None = None

    def canonical_payload(self) -> dict[str, Any]:
        """The dict over which `canonical_sha256` is computed.

        Excludes `canonical_sha256` itself so the hash is self-referential
        in name only. When `evaluator_signature` lands (week 3–4) it is
        also excluded.
        """
        return self.model_dump(mode="json", exclude={"canonical_sha256"})

    def compute_canonical_hash(self) -> str:
        return sha256_hex(canonicalize(self.canonical_payload()))

    def with_canonical_hash(self) -> Report:
        """Return a copy with `canonical_sha256` set to the computed value."""
        return self.model_copy(update={"canonical_sha256": self.compute_canonical_hash()})

    def verify_canonical_hash(self) -> bool:
        """True iff `canonical_sha256` matches the computed value.

        A report parsed from disk with a hash field present can be
        round-trip-checked: if this returns False, the artifact has been
        tampered with or the canonicalizer disagrees with the writer.
        """
        return (
            self.canonical_sha256 is not None
            and self.canonical_sha256 == self.compute_canonical_hash()
        )
