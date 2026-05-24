# Repetitive Sums Part 2 - 2026

This folder is a clean Part 2 copy of the original repetitive sums benchmark. Legacy notebook outputs and copied legacy result charts were removed from this workspace; historical leaderboard data is preserved in `results/historical_leaderboard.json` for the website.

## Current Leaderboard

| Rank | Model | Accuracy | Mean Error | Parsing Failures | Evaluated |
|---:|---|---:|---:|---:|---:|
| 1 | gpt-5.4 | 100.00% | 0.00 | 0 | 99 |
| 2 | gpt-5.5 | 100.00% | 0.00 | 0 | 99 |
| 3 | gpt-5.4-mini | 87.88% | 1.33 | 0 | 99 |

## Artifacts

- `scripts/benchmark_part2.py` runs the Responses API logprob benchmark.
- `scripts/extract_historical_leaderboard.py` extracts the original README leaderboard for static history.
- `results/part2_raw_results.jsonl` stores row-level raw benchmark records.
- `results/part2_results.csv` and `results/part2_results.json` store row-level static results.
- `results/part2_leaderboard.csv` and `results/part2_leaderboard.json` store the new leaderboard.
- `results/charts/*.svg` contains Part 2 correctness charts only.
- `site/` contains the Vite + React + Tailwind website.

## Run

```bash
OPENAI_API_KEY=... python3 scripts/benchmark_part2.py --resume --output-dir results
```

Smoke test:

```bash
OPENAI_API_KEY=... python3 scripts/benchmark_part2.py --limit 3 --output-dir results
```

Website:

```bash
make up
make build
make test
make deploy
```

The site uses hash routing so the deployed GitHub Pages build can serve every page from the static `index.html`.
