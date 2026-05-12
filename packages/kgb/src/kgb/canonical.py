"""RFC 8785 JSON Canonicalization Scheme (JCS).

Reference: https://datatracker.ietf.org/doc/html/rfc8785

This is the load-bearing primitive for the KGB attestation chain. Every
hash in the chain — tool, registry, catalog, schema, evaluator, report —
is computed over the RFC 8785 canonical form of the underlying object.
Implementation is owned in-tree rather than depending on a third-party
library because deviations break the signing chain.

v0.1 scope: dicts, lists, strings, ints, finite floats whose values are
whole numbers, booleans, and null. Floats with fractional parts use
Python's repr() as an approximation of ECMAScript ToString; full
ECMAScript ToString (RFC 8785 §3.2.2.3) is a v0.2 hardening item.
"""

from __future__ import annotations

import hashlib
import math
from typing import Any

__all__ = ["canonicalize", "sha256_hex"]


def canonicalize(value: Any) -> bytes:
    """Return the RFC 8785 canonical UTF-8 bytes for a JSON-compatible value."""
    return _encode(value).encode("utf-8")


def sha256_hex(canonical_bytes: bytes) -> str:
    """SHA-256 of canonical bytes as lowercase hex (64 chars)."""
    return hashlib.sha256(canonical_bytes).hexdigest()


def _encode(value: Any) -> str:
    if value is None:
        return "null"
    # bool MUST be matched before int (bool is a subclass of int in Python,
    # so isinstance(True, int) is True). Identity comparison against the
    # singletons is unambiguous.
    if value is True:
        return "true"
    if value is False:
        return "false"
    if isinstance(value, str):
        return _encode_string(value)
    if isinstance(value, int):
        return str(value)
    if isinstance(value, float):
        return _encode_float(value)
    if isinstance(value, (list, tuple)):
        return "[" + ",".join(_encode(item) for item in value) + "]"
    if isinstance(value, dict):
        return _encode_object(value)
    raise TypeError(f"cannot canonicalize value of type {type(value).__name__}")


def _encode_object(obj: dict[Any, Any]) -> str:
    items = []
    for key in obj:
        if not isinstance(key, str):
            raise TypeError(f"JSON object keys must be strings; got {type(key).__name__}")
        items.append(key)
    # RFC 8785 §3.2.3: keys sorted by UTF-16 code unit ordering.
    items.sort(key=_utf16_sort_key)
    parts = [_encode_string(k) + ":" + _encode(obj[k]) for k in items]
    return "{" + ",".join(parts) + "}"


def _utf16_sort_key(s: str) -> tuple[int, ...]:
    """UTF-16 code unit sequence for sort ordering (RFC 8785 §3.2.3)."""
    return tuple(s.encode("utf-16-be"))


def _encode_string(s: str) -> str:
    """Encode a string per RFC 8785 §3.2.2.2."""
    parts = ['"']
    for ch in s:
        cp = ord(ch)
        if ch == '"':
            parts.append('\\"')
        elif ch == "\\":
            parts.append("\\\\")
        elif cp == 0x08:
            parts.append("\\b")
        elif cp == 0x09:
            parts.append("\\t")
        elif cp == 0x0A:
            parts.append("\\n")
        elif cp == 0x0C:
            parts.append("\\f")
        elif cp == 0x0D:
            parts.append("\\r")
        elif cp < 0x20:
            parts.append(f"\\u{cp:04x}")
        else:
            parts.append(ch)
    parts.append('"')
    return "".join(parts)


def _encode_float(value: float) -> str:
    """Encode a float per RFC 8785 §3.2.2.3 (ECMAScript ToString).

    v0.1 covers whole-number floats and simple decimals via repr().
    NaN and Infinity are rejected (RFC 8785 forbids them in JSON).
    """
    if not math.isfinite(value):
        raise ValueError("RFC 8785 forbids NaN and Infinity in JSON")
    if value == int(value):
        return str(int(value))
    return repr(value)
