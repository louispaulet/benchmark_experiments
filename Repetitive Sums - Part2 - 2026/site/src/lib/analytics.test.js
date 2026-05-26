import { describe, expect, it } from "vitest";
import {
  buildModelResultsForTest,
  getConfidenceStats,
  getFailureClusters,
  getHardestQuestions,
  getLatencyStats,
  getRangeAccuracy,
} from "./analytics.testHelpers";

describe("analytics helpers", () => {
  it("ranks hardest questions by correctness rate", () => {
    const rowsByModel = buildModelResultsForTest([
      { model: "a", expected: 2, is_correct: true },
      { model: "b", expected: 2, is_correct: false },
      { model: "a", expected: 3, is_correct: false },
      { model: "b", expected: 3, is_correct: false },
    ]);

    expect(getHardestQuestions(rowsByModel, 2).map((row) => row.expected)).toEqual([3, 2]);
  });

  it("calculates accuracy by fixed answer ranges", () => {
    const ranges = getRangeAccuracy([
      { expected: 2, is_correct: true },
      { expected: 25, is_correct: false },
      { expected: 26, is_correct: true },
      { expected: 100, is_correct: false },
    ]);

    expect(ranges.map((range) => [range.label, range.correct, range.total, range.accuracy])).toEqual([
      ["2-25", 1, 2, 50],
      ["26-50", 1, 1, 100],
      ["51-75", 0, 0, null],
      ["76-100", 0, 1, 0],
    ]);
  });

  it("detects contiguous failure clusters", () => {
    const clusters = getFailureClusters([
      { expected: 2, is_correct: true },
      { expected: 3, is_correct: false },
      { expected: 4, is_correct: false },
      { expected: 6, is_correct: false },
    ]);

    expect(clusters.map((cluster) => [cluster.start, cluster.end, cluster.count])).toEqual([
      [3, 4, 2],
      [6, 6, 1],
    ]);
  });

  it("calculates latency median and p95", () => {
    const stats = getLatencyStats([
      { latency_ms: 10 },
      { latency_ms: 30 },
      { latency_ms: 20 },
      { latency_ms: null },
    ]);

    expect(stats).toEqual(expect.objectContaining({ min: 10, max: 30, median: 20, p95: 30 }));
  });

  it("falls back from token logprobs to top logprobs for confidence", () => {
    const stats = getConfidenceStats([
      { token_logprobs: [], top_logprobs: [[{ logprob: Math.log(0.5) }]] },
      { token_logprobs: [Math.log(0.25)], top_logprobs: [] },
    ]);

    expect(stats.count).toBe(2);
    expect(stats.lowestProbability).toBeCloseTo(25);
    expect(stats.highestProbability).toBeCloseTo(50);
  });
});
