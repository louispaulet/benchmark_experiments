import combinedLeaderboardData from "../data/combined_leaderboard.json";
import historicalModelDatesData from "../data/historical_model_dates.json";
import part2ResultsData from "../data/part2_results.json";
import { compareModelSizeDesc, withModelSize } from "./modelSizes";

const historicalRunModules = import.meta.glob("../data/historical_runs/*.json", { eager: true });
const historicalRuns = Object.values(historicalRunModules).map((module) => module.default ?? module);

export const combinedLeaderboard = combinedLeaderboardData.map(withModelSize);
export const results = part2ResultsData;
export const historicalModelDates = historicalModelDatesData;
export const questionNumbers = Array.from({ length: 99 }, (_, index) => index + 2);

export function normalizeHistoricalRun(run) {
  return Object.entries(run.results).map(([expected, isCorrect]) => ({
    model: run.metadata.model_name,
    sum: Array.from({ length: Number(expected) }, () => "1").join("+"),
    expected: Number(expected),
    raw_text: "n/a",
    parsed_answer: null,
    is_correct: Boolean(isCorrect),
    error_abs: null,
    tokens: [],
    token_logprobs: [],
    top_logprobs: [],
    latency_ms: null,
    api_endpoint: "historical PNG chart",
    created_at: run.metadata.test_date || "",
    error: "",
    benchmark: run.metadata.benchmark,
    detail_source: run.metadata.source_png,
  }));
}

export const historicalResults = historicalRuns.flatMap(normalizeHistoricalRun);
export const allResults = [...results, ...historicalResults];
export const modelResultsByName = buildModelResultsByName(allResults);
export const modelFirstObservedAt = buildModelFirstObservedAt(allResults);

export function buildModelResultsByName(rows) {
  const byName = new Map();

  for (const row of rows) {
    const expected = Number(row.expected);
    const modelName = row.model;
    if (!byName.has(modelName)) {
      byName.set(modelName, new Map());
    }
    byName.get(modelName).set(expected, row);
  }

  return byName;
}

export function buildModelFirstObservedAt(rows) {
  const firstObservedAt = new Map();

  for (const row of rows) {
    const modelName = row.model;
    const observedAt = row.created_at || row.test_date || "";
    if (!observedAt) continue;

    const current = firstObservedAt.get(modelName);
    if (!current || Date.parse(observedAt) < Date.parse(current)) {
      firstObservedAt.set(modelName, observedAt);
    }
  }

  return firstObservedAt;
}

export function buildMatrixRows(sortMatrix, leaderboard = combinedLeaderboard, resultsByName = modelResultsByName, firstObservedAt = modelFirstObservedAt) {
  const rows = leaderboard.map((summary) => {
    const rowsForModel = resultsByName.get(summary.model_name) ?? new Map();
    const releaseDate = summary.release_date || summary.test_date || firstObservedAt.get(summary.model_name) || "";
    return {
      summary,
      rowsForModel,
      releaseDate,
    };
  });

  return rows.sort((a, b) => compareMatrixRows(a, b, sortMatrix));
}

export function compareMatrixRows(a, b, sortMatrix) {
  if (sortMatrix === "model_size") {
    return compareModelSizeDesc(a.summary, b.summary);
  }
  if (sortMatrix === "release_date") {
    const bDate = Date.parse(b.releaseDate || "");
    const aDate = Date.parse(a.releaseDate || "");
    const left = Number.isNaN(bDate) ? -Infinity : bDate;
    const right = Number.isNaN(aDate) ? -Infinity : aDate;
    if (left !== right) return left - right;
  }
  if (sortMatrix === "accuracy" && b.summary.avg_accuracy !== a.summary.avg_accuracy) {
    return b.summary.avg_accuracy - a.summary.avg_accuracy;
  }
  if (sortMatrix === "streak") {
    const bStreak = b.summary.longest_correct_streak ?? -1;
    const aStreak = a.summary.longest_correct_streak ?? -1;
    if (bStreak !== aStreak) return bStreak - aStreak;
  }
  return a.summary.model_name.localeCompare(b.summary.model_name);
}

export function getRowsForModel(modelName) {
  return allResults.filter((row) => row.model === modelName).sort((a, b) => a.expected - b.expected);
}

export function getSummaryForModel(modelName) {
  return combinedLeaderboard.find((row) => row.model_name === modelName);
}
