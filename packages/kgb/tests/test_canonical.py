"""RFC 8785 canonicalizer tests.

These tests are load-bearing for the attestation chain. Failure here
means signed reports will diverge across implementations.
"""

from __future__ import annotations

import pytest

from kgb.canonical import canonicalize, sha256_hex


def test_empty_object():
    assert canonicalize({}) == b"{}"


def test_empty_array():
    assert canonicalize([]) == b"[]"


def test_null():
    assert canonicalize(None) == b"null"


def test_booleans():
    assert canonicalize(True) == b"true"
    assert canonicalize(False) == b"false"


def test_integer():
    assert canonicalize(42) == b"42"
    assert canonicalize(-17) == b"-17"
    assert canonicalize(0) == b"0"


def test_whole_float_renders_as_int():
    assert canonicalize(1.0) == b"1"
    assert canonicalize(0.0) == b"0"


def test_simple_string():
    assert canonicalize("hello") == b'"hello"'


def test_string_with_quotes():
    assert canonicalize('say "hi"') == b'"say \\"hi\\""'


def test_string_with_backslash():
    assert canonicalize("a\\b") == b'"a\\\\b"'


def test_string_with_control_chars():
    assert canonicalize("\n\t\r") == b'"\\n\\t\\r"'


def test_string_with_low_unicode():
    # 0x01 is a non-printable that must be escaped as 
    assert canonicalize("\x01") == b'"\\u0001"'


def test_array_simple():
    assert canonicalize([1, 2, 3]) == b"[1,2,3]"


def test_array_preserves_order():
    """RFC 8785: array order is preserved; only object keys are sorted."""
    assert canonicalize([3, 1, 2]) == b"[3,1,2]"


def test_object_keys_sorted():
    assert canonicalize({"b": 1, "a": 2}) == b'{"a":2,"b":1}'


def test_object_keys_sorted_utf16():
    # Key sort order matters for stability.
    assert canonicalize({"z": 1, "a": 2, "m": 3}) == b'{"a":2,"m":3,"z":1}'


def test_nested_object():
    payload = {"z": {"b": 1, "a": 2}, "a": [3, 2, 1]}
    assert canonicalize(payload) == b'{"a":[3,2,1],"z":{"a":2,"b":1}}'


def test_key_ordering_independence():
    """Same logical content, different insertion order → same canonical bytes."""
    a = {"x": 1, "y": 2, "z": 3}
    b = {"z": 3, "x": 1, "y": 2}
    assert canonicalize(a) == canonicalize(b)


def test_sha256_stability():
    payload = {"a": 1, "b": [2, 3], "c": "test"}
    h1 = sha256_hex(canonicalize(payload))
    h2 = sha256_hex(canonicalize(payload))
    assert h1 == h2
    assert len(h1) == 64
    assert all(c in "0123456789abcdef" for c in h1)


def test_sha256_changes_with_value():
    h1 = sha256_hex(canonicalize({"a": 1}))
    h2 = sha256_hex(canonicalize({"a": 2}))
    assert h1 != h2


def test_rejects_nan():
    with pytest.raises(ValueError):
        canonicalize(float("nan"))


def test_rejects_infinity():
    with pytest.raises(ValueError):
        canonicalize(float("inf"))


def test_rejects_non_string_keys():
    with pytest.raises(TypeError):
        canonicalize({1: "value"})


def test_rejects_unsupported_type():
    with pytest.raises(TypeError):
        canonicalize({"a", "b"})  # a set, not a JSON-compatible type
