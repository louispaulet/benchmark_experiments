#!/usr/bin/env python3
"""Run the Repetitive Sums Part 2 benchmark with OpenAI Responses logprobs."""

from __future__ import annotations

import argparse
import csv
import json
import math
import os
import random
import re
import statistics
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

MODELS = ("gpt-5.4-mini", "gpt-5.4", "gpt-5.5")
API_ENDPOINT = "v1/responses"


def build_dataset(limit: int | None = None) -> list[dict[str, Any]]:
    rows = [
        {"sum": "+".join(["1"] * value), "expected": value}
        for value in range(2, 101)
    ]
    return rows[:limit] if limit else rows


def parse_answer(text: str) -> int:
    match = re.search(r"-?\d+", text or "")
    return int(match.group(0)) if match else 0


def flatten_logprobs(value: Any) -> list[dict[str, Any]]:
    """Find token logprob objects in the SDK response without assuming one shape."""
    if value is None:
        return []
    if hasattr(value, "model_dump"):
        value = value.model_dump()
    if isinstance(value, dict):
        tokens: list[dict[str, Any]] = []
        if {"token", "logprob"}.issubset(value.keys()):
            top = value.get("top_logprobs") or []
            return [{
                "token": value.get("token"),
                "logprob": value.get("logprob"),
                "bytes": value.get("bytes"),
                "top_logprobs": top,
            }]
        for child in value.values():
            tokens.extend(flatten_logprobs(child))
        return tokens
    if isinstance(value, list):
        tokens = []
        for child in value:
            tokens.extend(flatten_logprobs(child))
        return tokens
    return []


def response_text(response: Any) -> str:
    if getattr(response, "output_text", None):
        return response.output_text
    data = response.model_dump() if hasattr(response, "model_dump") else response
    texts: list[str] = []

    def walk(value: Any) -> None:
        if isinstance(value, dict):
            if value.get("type") in {"output_text", "text"} and isinstance(value.get("text"), str):
                texts.append(value["text"])
            for child in value.values():
                walk(child)
        elif isinstance(value, list):
            for child in value:
                walk(child)

    walk(data)
    return "".join(texts).strip()


def call_model(model: str, row: dict[str, Any], max_retries: int = 4) -> dict[str, Any]:
    from openai import OpenAI

    client = OpenAI()
    prompt = f"What is the result of the following sum? {row['sum']}\nAnswer with digits only."
    started = time.perf_counter()
    last_error = ""

    for attempt in range(max_retries):
        try:
            response = client.responses.create(
                model=model,
                input=[
                    {
                        "role": "developer",
                        "content": "Return only the integer answer. Do not explain.",
                    },
                    {"role": "user", "content": prompt},
                ],
                max_output_tokens=16,
                temperature=0,
                top_logprobs=20,
                include=["message.output_text.logprobs"],
                reasoning={"effort": "none"},
            )
            raw_text = response_text(response)
            parsed = parse_answer(raw_text)
            logprob_items = flatten_logprobs(response)
            tokens = [item.get("token") for item in logprob_items]
            token_logprobs = [item.get("logprob") for item in logprob_items]
            top_logprobs = [item.get("top_logprobs") for item in logprob_items]
            expected = int(row["expected"])
            return {
                "model": model,
                "sum": row["sum"],
                "expected": expected,
                "raw_text": raw_text,
                "parsed_answer": parsed,
                "is_correct": parsed == expected,
                "error_abs": abs(parsed - expected) if parsed else None,
                "tokens": tokens,
                "token_logprobs": token_logprobs,
                "top_logprobs": top_logprobs,
                "latency_ms": round((time.perf_counter() - started) * 1000, 2),
                "api_endpoint": API_ENDPOINT,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "error": "",
            }
        except Exception as exc:  # The benchmark should record API support issues.
            last_error = f"{type(exc).__name__}: {exc}"
            if attempt == max_retries - 1:
                break
            time.sleep(min(45, 2 ** attempt + random.random()))

    expected = int(row["expected"])
    return {
        "model": model,
        "sum": row["sum"],
        "expected": expected,
        "raw_text": "",
        "parsed_answer": 0,
        "is_correct": False,
        "error_abs": None,
        "tokens": [],
        "token_logprobs": [],
        "top_logprobs": [],
        "latency_ms": round((time.perf_counter() - started) * 1000, 2),
        "api_endpoint": API_ENDPOINT,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "error": last_error,
    }


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    return [json.loads(line) for line in path.read_text().splitlines() if line.strip()]


def write_jsonl(path: Path, rows: Iterable[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w") as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=False) + "\n")


def to_float(value: Any) -> float:
    return float(value) if value not in ("", None) else float("nan")


def summarize(results: list[dict[str, Any]], models: Iterable[str]) -> list[dict[str, Any]]:
    summary = []
    for model in models:
        rows = [row for row in results if row["model"] == model]
        evaluated = len(rows)
        parsing_failures = sum(1 for row in rows if not row.get("parsed_answer"))
        accuracy = (sum(1 for row in rows if row.get("is_correct")) / evaluated * 100) if evaluated else 0
        wrong_errors = [
            row["error_abs"]
            for row in rows
            if row.get("parsed_answer") and not row.get("is_correct") and row.get("error_abs") is not None
        ]
        summary.append({
            "model_name": model,
            "avg_accuracy": accuracy,
            "error_mean": statistics.mean(wrong_errors) if wrong_errors else 0,
            "error_median": statistics.median(wrong_errors) if wrong_errors else 0,
            "error_std": statistics.stdev(wrong_errors) if len(wrong_errors) > 1 else 0,
            "error_min": min(wrong_errors) if wrong_errors else 0,
            "error_max": max(wrong_errors) if wrong_errors else 0,
            "parsing_failure_count": parsing_failures,
            "evaluated_count": evaluated,
        })
    return sorted(summary, key=lambda row: row["avg_accuracy"], reverse=True)


def write_csv(path: Path, rows: list[dict[str, Any]], fieldnames: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow({
                key: json.dumps(row.get(key), ensure_ascii=False) if isinstance(row.get(key), (list, dict)) else row.get(key)
                for key in fieldnames
            })


def write_chart(path: Path, model: str, rows: list[dict[str, Any]]) -> None:
    rows = sorted(rows, key=lambda row: row["expected"])
    cell_w, cell_h = 8, 30
    width = cell_w * len(rows)
    height = 64
    bars = []
    for idx, row in enumerate(rows):
        color = "#2f9e44" if row.get("is_correct") else "#d64545"
        bars.append(f'<rect x="{idx * cell_w}" y="16" width="7" height="{cell_h}" fill="{color}" />')
    path.write_text(
        '<svg xmlns="http://www.w3.org/2000/svg" '
        f'viewBox="0 0 {width} {height}" role="img" aria-label="{model} correctness chart">'
        f'<title>{model} correctness by expected result</title>'
        '<rect width="100%" height="100%" fill="#f8fafc" />'
        + "".join(bars)
        + f'<text x="0" y="58" font-size="9" fill="#475569">2</text>'
        + f'<text x="{width - 20}" y="58" font-size="9" fill="#475569">100</text>'
        + "</svg>\n"
    )


def write_outputs(output_dir: Path, results: list[dict[str, Any]], models: Iterable[str]) -> None:
    leaderboard = summarize(results, models)
    write_jsonl(output_dir / "part2_raw_results.jsonl", results)
    (output_dir / "part2_leaderboard.json").write_text(json.dumps(leaderboard, indent=2) + "\n")
    (output_dir / "part2_results.json").write_text(json.dumps(results, indent=2) + "\n")
    write_csv(
        output_dir / "part2_results.csv",
        results,
        ["model", "sum", "expected", "raw_text", "parsed_answer", "is_correct", "error_abs", "tokens", "token_logprobs", "top_logprobs", "latency_ms", "api_endpoint", "created_at", "error"],
    )
    write_csv(
        output_dir / "part2_leaderboard.csv",
        leaderboard,
        ["model_name", "avg_accuracy", "error_mean", "error_median", "error_std", "error_min", "error_max", "parsing_failure_count", "evaluated_count"],
    )
    chart_dir = output_dir / "charts"
    chart_dir.mkdir(exist_ok=True)
    for model in models:
        write_chart(chart_dir / f"{model}.svg", model, [row for row in results if row["model"] == model])


def run(args: argparse.Namespace) -> int:
    if not os.getenv("OPENAI_API_KEY") and not args.no_api:
        print("OPENAI_API_KEY is required unless --no-api is used.", file=sys.stderr)
        return 2

    output_dir = Path(args.output_dir)
    models = tuple(args.models.split(",")) if args.models else MODELS
    dataset = build_dataset(args.limit)
    raw_path = output_dir / "part2_raw_results.jsonl"
    existing = read_jsonl(raw_path) if args.resume else []
    done = {(row["model"], row["sum"]) for row in existing}
    tasks = [(model, row) for model in models for row in dataset if (model, row["sum"]) not in done]
    results = existing[:]

    if args.no_api:
        for model, row in tasks:
            expected = int(row["expected"])
            results.append({
                "model": model,
                "sum": row["sum"],
                "expected": expected,
                "raw_text": "",
                "parsed_answer": 0,
                "is_correct": False,
                "error_abs": None,
                "tokens": [],
                "token_logprobs": [],
                "top_logprobs": [],
                "latency_ms": 0,
                "api_endpoint": API_ENDPOINT,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "error": "not_run",
            })
    else:
        with ThreadPoolExecutor(max_workers=args.concurrency) as executor:
            futures = [executor.submit(call_model, model, row) for model, row in tasks]
            for index, future in enumerate(as_completed(futures), start=1):
                result = future.result()
                results.append(result)
                print(f"[{index}/{len(futures)}] {result['model']} {result['expected']} -> {result['raw_text'] or result['error'][:80]}")
                write_outputs(output_dir, results, models)

    results.sort(key=lambda row: (row["model"], row["expected"]))
    write_outputs(output_dir, results, models)
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--models", default=",".join(MODELS), help="Comma-separated model IDs.")
    parser.add_argument("--limit", type=int, default=None, help="Limit dataset rows for smoke tests.")
    parser.add_argument("--concurrency", type=int, default=3, help="Parallel API requests.")
    parser.add_argument("--output-dir", default="results", help="Directory for benchmark artifacts.")
    parser.add_argument("--resume", action="store_true", help="Skip rows already present in raw JSONL.")
    parser.add_argument("--no-api", action="store_true", help="Write not_run rows without API calls.")
    return run(parser.parse_args())


if __name__ == "__main__":
    raise SystemExit(main())
