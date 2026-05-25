#!/usr/bin/env python3
"""Extract compact historical correctness maps from the original PNG charts."""

from __future__ import annotations

import argparse
import json
import shutil
from pathlib import Path
from typing import Any

from PIL import Image


EXPECTED_VALUES = list(range(2, 101))
BENCHMARK_NAME = "Original Repetitive Sums Benchmark Dataset"


def model_slug_candidates(model_name: str) -> set[str]:
    slug = model_name.lower()
    for prefix in (
        "meta-llama/",
        "mistralai/",
        "microsoft/",
        "nousresearch/",
        "zero-one-ai/",
        "google/",
        "qwen/",
        "wizardlm/",
    ):
        slug = slug.replace(prefix, "")

    candidates = {slug}
    candidates.add(slug.replace("/", "-"))
    candidates.add(slug.replace("claude-3-", "claude3-"))
    candidates.add(slug.replace("gpt-4o", "gpt4o"))
    candidates.add(slug.replace("gpt-4-1106", "gpt4-1106"))
    candidates.add(slug.replace("gpt-4-turbo", "gpt4-turbo"))
    candidates.add(slug.replace("gpt-4-0613", "gpt4-0613"))

    more = set(candidates)
    for candidate in candidates:
        more.add(candidate.replace("qwen1.5", "qwen-1.5"))
        more.add(candidate.replace("qwen-1.5-72b", "qwen1.5-72b"))
        more.add(candidate.replace("claude3-haiku-20240307", "claude3-haiku"))
        more.add(candidate.replace("claude3-opus-20240229", "claude3-opus"))
        more.add(candidate.replace("claude3-sonnet-20240229", "claude3-sonnet"))
    return more


def load_png_metadata(root: Path) -> dict[str, dict[str, str]]:
    leaderboard = json.loads((root / "results" / "historical_leaderboard.json").read_text())
    dates = json.loads((root / "results" / "historical_model_dates.json").read_text())
    metadata = {}
    for row in leaderboard:
        model_name = row["model_name"]
        for slug in model_slug_candidates(model_name):
            metadata[slug] = {
                "model_name": model_name,
                "test_date": dates.get(model_name, {}).get("test_date", ""),
            }
    return metadata


def classify_pixel(pixel: tuple[int, int, int]) -> str | None:
    red, green, blue = pixel
    if green > 120 and red < 120 and blue < 150:
        return "green"
    if red > 150 and green < 150 and blue < 150:
        return "red"
    return None


def color_runs(image: Image.Image, y: int) -> list[tuple[int, int, str]]:
    runs = []
    start = None
    current = None
    pixels = image.load()
    for x in range(image.width + 1):
        color = classify_pixel(pixels[x, y]) if x < image.width else None
        if color and start is None:
            start = x
            current = color
        elif start is not None and color != current:
            if x - start >= 3:
                runs.append((start, x - 1, current or ""))
            start = x if color else None
            current = color
    return runs


def extract_results(png_path: Path) -> dict[str, bool]:
    image = Image.open(png_path).convert("RGB")
    candidates = [color_runs(image, y) for y in range(55, min(image.height, 190), 5)]
    runs = min(candidates, key=lambda item: abs(len(item) - len(EXPECTED_VALUES)))
    if len(runs) != len(EXPECTED_VALUES):
        raise ValueError(f"{png_path.name}: expected 99 bars, found {len(runs)}")
    return {
        str(expected): color == "green"
        for expected, (_start, _end, color) in zip(EXPECTED_VALUES, runs)
    }


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


def run_payload(root: Path, png_path: Path) -> dict[str, Any]:
    metadata_by_slug = load_png_metadata(root)
    metadata = metadata_by_slug.get(png_path.stem, {
        "model_name": png_path.stem,
        "test_date": "",
    })
    return {
        "metadata": {
            "model_name": metadata["model_name"],
            "test_date": metadata["test_date"],
            "benchmark": BENCHMARK_NAME,
            "source_png": png_path.name,
        },
        "results": extract_results(png_path),
    }


def validate_against_leaderboard(root: Path, payloads: list[dict[str, Any]]) -> None:
    leaderboard = json.loads((root / "results" / "historical_leaderboard.json").read_text())
    expected_counts = {
        row["model_name"]: round(float(row["avg_accuracy"]) * len(EXPECTED_VALUES) / 100)
        for row in leaderboard
    }
    for payload in payloads:
        model_name = payload["metadata"]["model_name"]
        actual = sum(1 for value in payload["results"].values() if value)
        expected = expected_counts.get(model_name)
        if expected is None:
            raise ValueError(f"{model_name}: missing from historical leaderboard")
        if actual != expected:
            raise ValueError(f"{model_name}: extracted {actual} correct results, leaderboard has {expected}")


def write_payloads(payloads: list[dict[str, Any]], *targets: Path) -> None:
    for target in targets:
        if target.exists():
            shutil.rmtree(target)
        target.mkdir(parents=True, exist_ok=True)
        for payload in payloads:
            source_png = payload["metadata"]["source_png"]
            target_file = target / f"{Path(source_png).stem}.json"
            target_file.write_text(json.dumps(payload, indent=2) + "\n")


def combined_leaderboard(root: Path) -> list[dict[str, Any]]:
    current = json.loads((root / "results" / "part2_leaderboard.json").read_text())
    historical = json.loads((root / "results" / "historical_leaderboard.json").read_text())
    dates = json.loads((root / "results" / "historical_model_dates.json").read_text())
    run_dir = root / "results" / "historical_runs"
    streaks = {}
    for run_file in run_dir.glob("*.json"):
        payload = json.loads(run_file.read_text())
        streaks[payload["metadata"]["model_name"]] = longest_correct_streak(payload["results"])

    combined = []
    for row in current:
        combined.append({
            **row,
            "benchmark": "Part 2 - 2026",
            "has_detail": True,
        })
    for row in historical:
        model_name = row["model_name"]
        row = {key: value for key, value in row.items() if key != "rank"}
        combined.append({
            **row,
            **dates.get(model_name, {}),
            "evaluated_count": len(EXPECTED_VALUES),
            "has_detail": model_name in streaks,
            "longest_correct_streak": streaks.get(model_name),
        })
    return sorted(combined, key=lambda row: row["avg_accuracy"], reverse=True)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--validate-only", action="store_true", help="parse and validate without writing files")
    args = parser.parse_args()

    root = Path(__file__).resolve().parents[1]
    repo_root = root.parent
    source_dir = repo_root / "Repetitive Sums Benchmark Dataset" / "position of correct sums"
    pngs = sorted(source_dir.glob("*.png"))
    if len(pngs) != 33:
        raise ValueError(f"expected 33 historical PNG files, found {len(pngs)}")

    payloads = [run_payload(root, png_path) for png_path in pngs]
    validate_against_leaderboard(root, payloads)
    if args.validate_only:
        print(f"Validated {len(payloads)} historical PNG runs.")
        return 0

    results_dir = root / "results" / "historical_runs"
    site_dir = root / "site" / "src" / "data" / "historical_runs"
    write_payloads(payloads, results_dir, site_dir)
    (root / "results" / "combined_leaderboard.json").write_text(
        json.dumps(combined_leaderboard(root), indent=2) + "\n"
    )
    (root / "site" / "src" / "data" / "combined_leaderboard.json").write_text(
        json.dumps(combined_leaderboard(root), indent=2) + "\n"
    )
    print(f"Wrote {len(payloads)} historical run JSON files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
