#!/usr/bin/env python3
"""Extract the historical leaderboard table from the original benchmark README."""

from __future__ import annotations

import json
from pathlib import Path


def parse_markdown_table(readme: Path) -> list[dict[str, str | float | int]]:
    lines = readme.read_text().splitlines()
    start = next(i for i, line in enumerate(lines) if line.startswith("|   | model_name"))
    rows = []
    for line in lines[start + 2:]:
        if not line.startswith("|"):
            break
        parts = [part.strip() for part in line.strip("|").split("|")]
        if len(parts) != 9:
            continue
        rows.append({
            "rank": int(parts[0]),
            "model_name": parts[1],
            "avg_accuracy": float(parts[2]),
            "error_mean": float(parts[3]),
            "error_median": float(parts[4]),
            "error_std": float(parts[5]),
            "error_min": int(float(parts[6])),
            "error_max": int(float(parts[7])),
            "parsing_failure_count": int(float(parts[8])),
            "benchmark": "Original Repetitive Sums Benchmark Dataset",
        })
    return rows


def main() -> int:
    root = Path(__file__).resolve().parents[2]
    source = root / "Repetitive Sums Benchmark Dataset" / "readme.md"
    target = Path(__file__).resolve().parents[1] / "results" / "historical_leaderboard.json"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(parse_markdown_table(source), indent=2) + "\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
