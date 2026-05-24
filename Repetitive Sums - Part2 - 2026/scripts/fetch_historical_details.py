#!/usr/bin/env python3
"""Fetch row-level historical benchmark results from the public HF dataset."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import requests

DATASET = "the-french-artist/repetitive_sums_benchmark_20_models_results"
ROWS_URL = "https://datasets-server.huggingface.co/rows"


def fetch_rows() -> dict[str, Any]:
    response = requests.get(
        ROWS_URL,
        params={"dataset": DATASET, "config": "default", "split": "train", "offset": 0, "length": 100},
        timeout=30,
    )
    response.raise_for_status()
    return response.json()


def normalize(payload: dict[str, Any]) -> list[dict[str, Any]]:
    model_names = [
        feature["name"]
        for feature in payload["features"]
        if feature["name"] not in {"sum", "result"}
    ]
    details = []
    for item in payload["rows"]:
        row = item["row"]
        expected = int(row["result"])
        for model in model_names:
            parsed = int(row[model])
            details.append({
                "model": model,
                "sum": row["sum"],
                "expected": expected,
                "raw_text": str(parsed),
                "parsed_answer": parsed,
                "is_correct": parsed == expected,
                "error_abs": abs(parsed - expected) if parsed else None,
                "tokens": [],
                "token_logprobs": [],
                "top_logprobs": [],
                "latency_ms": None,
                "api_endpoint": "historical dataset",
                "created_at": "2024-06-12T15:16:43Z",
                "error": "",
                "benchmark": "Original Repetitive Sums Benchmark Dataset",
                "detail_source": DATASET,
            })
    return details


def combined_leaderboard(root: Path) -> list[dict[str, Any]]:
    current = json.loads((root / "results" / "part2_leaderboard.json").read_text())
    historical = json.loads((root / "results" / "historical_leaderboard.json").read_text())
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
            "evaluated_count": 99,
            "has_detail": False,
        })
    detailed_models = {row["model"] for row in json.loads((root / "results" / "historical_detailed_results.json").read_text())}
    for row in combined:
        if row["model_name"] in detailed_models:
            row["has_detail"] = True
    return sorted(combined, key=lambda row: row["avg_accuracy"], reverse=True)


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    results_dir = root / "results"
    details = normalize(fetch_rows())
    (results_dir / "historical_detailed_results.json").write_text(json.dumps(details, indent=2) + "\n")
    (results_dir / "combined_leaderboard.json").write_text(json.dumps(combined_leaderboard(root), indent=2) + "\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
