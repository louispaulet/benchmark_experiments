#!/usr/bin/env python3
"""Rebuild combined historical leaderboard metadata from compact run files."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

EXPECTED_VALUES = list(range(2, 101))


def combined_leaderboard(root: Path) -> list[dict[str, Any]]:
    current = json.loads((root / "results" / "part2_leaderboard.json").read_text())
    historical = json.loads((root / "results" / "historical_leaderboard.json").read_text())
    historical_dates = json.loads((root / "results" / "historical_model_dates.json").read_text())
    detailed_streaks = historical_streaks(root / "results" / "historical_runs")
    combined = []
    for row in current:
        combined.append({
            **row,
            "benchmark": "Part 2 - 2026",
            "has_detail": True,
        })
    for row in historical:
        row = {k: v for k, v in row.items() if k != "rank"}
        combined.append({
            **row,
            **historical_dates.get(row["model_name"], {}),
            "evaluated_count": 99,
            "has_detail": row["model_name"] in detailed_streaks,
            "longest_correct_streak": detailed_streaks.get(row["model_name"]),
        })
    return sorted(combined, key=lambda row: row["avg_accuracy"], reverse=True)


def historical_streaks(run_dir: Path) -> dict[str, int]:
    streaks = {}
    for run_file in run_dir.glob("*.json"):
        payload = json.loads(run_file.read_text())
        streaks[payload["metadata"]["model_name"]] = longest_correct_streak(payload["results"])
    return streaks


def longest_correct_streak(results: dict[str, bool]) -> int:
    streak = 0
    best = 0
    for expected in EXPECTED_VALUES:
        if results[str(expected)]:
            streak += 1
            best = max(best, streak)
        else:
            streak = 0
    return best


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    results_dir = root / "results"
    (results_dir / "combined_leaderboard.json").write_text(json.dumps(combined_leaderboard(root), indent=2) + "\n")
    site_data = root / "site" / "src" / "data"
    site_data.mkdir(parents=True, exist_ok=True)
    (site_data / "combined_leaderboard.json").write_text(json.dumps(combined_leaderboard(root), indent=2) + "\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
