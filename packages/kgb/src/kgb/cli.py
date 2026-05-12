"""kgb CLI — entry point.

Week 1: skeleton only. The four canonical verbs (run, compare, verify,
replay) land in weeks 2–4 alongside the adapters, signing chain, and
result store.
"""

from __future__ import annotations

import sys


def main(argv: list[str] | None = None) -> int:
    argv = argv if argv is not None else sys.argv[1:]
    if not argv:
        _usage()
        return 0
    cmd = argv[0]
    if cmd in {"-h", "--help", "help"}:
        _usage()
        return 0
    if cmd == "version":
        from kgb import __version__

        print(__version__)
        return 0
    print(f"kgb: unknown command {cmd!r}", file=sys.stderr)
    _usage(file=sys.stderr)
    return 2


def _usage(file=sys.stdout) -> None:
    print(
        "kgb — Kenshiki Governance Benchmark runner\n"
        "\n"
        "usage:\n"
        "  kgb version           print the installed version\n"
        "  kgb run    <args>     (week 2) run a benchmark\n"
        "  kgb verify <report>   (week 4) verify a signed report\n"
        "  kgb replay <report>   (week 4) deterministic replay\n",
        file=file,
    )


if __name__ == "__main__":
    raise SystemExit(main())
