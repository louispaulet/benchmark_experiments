from pathlib import Path
import importlib.util
import pytest


MODULE_PATH = Path(__file__).resolve().parents[1] / "scripts" / "benchmark_part2.py"
SPEC = importlib.util.spec_from_file_location("benchmark_part2", MODULE_PATH)
benchmark_part2 = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(benchmark_part2)


def test_parse_answer_uses_first_integer():
    assert benchmark_part2.parse_answer("The answer is 42.") == 42
    assert benchmark_part2.parse_answer("no digits") == 0


def test_summarize_counts_accuracy_and_errors():
    rows = [
        {"model": "m1", "parsed_answer": 2, "expected": 2, "is_correct": True, "error_abs": 0},
        {"model": "m1", "parsed_answer": 5, "expected": 3, "is_correct": False, "error_abs": 2},
        {"model": "m1", "parsed_answer": 0, "expected": 4, "is_correct": False, "error_abs": None},
    ]

    [summary] = benchmark_part2.summarize(rows, ["m1"])

    assert summary["model_name"] == "m1"
    assert summary["avg_accuracy"] == pytest.approx(100 / 3)
    assert summary["error_mean"] == 2
    assert summary["parsing_failure_count"] == 1
    assert summary["evaluated_count"] == 3


def test_flatten_logprobs_finds_nested_tokens():
    payload = {
        "output": [
            {
                "content": [
                    {
                        "text": "4",
                        "logprobs": [
                            {"token": "4", "logprob": -0.01, "top_logprobs": []}
                        ],
                    }
                ]
            }
        ]
    }

    assert benchmark_part2.flatten_logprobs(payload) == [
        {"token": "4", "logprob": -0.01, "bytes": None, "top_logprobs": []}
    ]
