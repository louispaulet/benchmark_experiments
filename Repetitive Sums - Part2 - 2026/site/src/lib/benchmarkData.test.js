import { describe, expect, it } from "vitest";
import {
  buildMatrixRows,
  buildModelFirstObservedAt,
  buildModelResultsByName,
  normalizeHistoricalRun,
} from "./benchmarkData";

const leaderboard = [
  { model_name: "Beta", avg_accuracy: 25, longest_correct_streak: 9, release_date: "2025-01-01" },
  { model_name: "Alpha", avg_accuracy: 90, longest_correct_streak: 2, release_date: "2024-01-01" },
  { model_name: "Gamma", avg_accuracy: 25, longest_correct_streak: 4, release_date: "" },
];

describe("benchmark data helpers", () => {
  it("normalizes historical PNG run data into result rows", () => {
    const rows = normalizeHistoricalRun({
      metadata: {
        model_name: "archive-model",
        test_date: "2024-06-01",
        benchmark: "Original benchmark",
        source_png: "chart.png",
      },
      results: {
        2: true,
        3: false,
      },
    });

    expect(rows).toEqual([
      expect.objectContaining({
        model: "archive-model",
        sum: "1+1",
        expected: 2,
        raw_text: "n/a",
        is_correct: true,
        api_endpoint: "historical PNG chart",
      }),
      expect.objectContaining({
        model: "archive-model",
        sum: "1+1+1",
        expected: 3,
        is_correct: false,
        benchmark: "Original benchmark",
        detail_source: "chart.png",
      }),
    ]);
  });

  it("builds model result lookup maps", () => {
    const map = buildModelResultsByName([
      { model: "Alpha", expected: "2", created_at: "2025-01-01" },
      { model: "Alpha", expected: 3, created_at: "2024-01-01" },
    ]);

    expect(map.get("Alpha").get(2)).toEqual(expect.objectContaining({ expected: "2" }));
    expect(map.get("Alpha").get(3)).toEqual(expect.objectContaining({ expected: 3 }));
  });

  it("tracks the earliest observed result date per model", () => {
    const firstObserved = buildModelFirstObservedAt([
      { model: "Alpha", expected: 2, created_at: "2025-01-01" },
      { model: "Alpha", expected: 3, created_at: "2024-01-01" },
      { model: "Beta", expected: 2, test_date: "2023-02-01" },
    ]);

    expect(firstObserved.get("Alpha")).toBe("2024-01-01");
    expect(firstObserved.get("Beta")).toBe("2023-02-01");
  });

  it("sorts matrix rows by accuracy and falls back to model name", () => {
    const rows = buildMatrixRows("accuracy", leaderboard, new Map(), new Map());

    expect(rows.map((row) => row.summary.model_name)).toEqual(["Alpha", "Beta", "Gamma"]);
  });

  it("sorts matrix rows by release date and streak", () => {
    const byReleaseDate = buildMatrixRows("release_date", leaderboard, new Map(), new Map());
    const byStreak = buildMatrixRows("streak", leaderboard, new Map(), new Map());

    expect(byReleaseDate.map((row) => row.summary.model_name)).toEqual(["Beta", "Alpha", "Gamma"]);
    expect(byStreak.map((row) => row.summary.model_name)).toEqual(["Beta", "Gamma", "Alpha"]);
  });
});
