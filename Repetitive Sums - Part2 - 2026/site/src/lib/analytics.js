import { allResults, combinedLeaderboard, getRowsForModel, modelResultsByName, questionNumbers } from "./benchmarkData";

export const answerRanges = [
  { id: "low", label: "2-25", min: 2, max: 25 },
  { id: "midLow", label: "26-50", min: 26, max: 50 },
  { id: "midHigh", label: "51-75", min: 51, max: 75 },
  { id: "high", label: "76-100", min: 76, max: 100 },
];

function byNumber(a, b) {
  return a - b;
}

export function mean(values) {
  const numeric = values.filter((value) => Number.isFinite(value));
  if (!numeric.length) return null;
  return numeric.reduce((total, value) => total + value, 0) / numeric.length;
}

export function median(values) {
  const numeric = values.filter((value) => Number.isFinite(value)).sort(byNumber);
  if (!numeric.length) return null;
  const middle = Math.floor(numeric.length / 2);
  if (numeric.length % 2) return numeric[middle];
  return (numeric[middle - 1] + numeric[middle]) / 2;
}

export function percentile(values, percentileValue) {
  const numeric = values.filter((value) => Number.isFinite(value)).sort(byNumber);
  if (!numeric.length) return null;
  const index = Math.ceil((percentileValue / 100) * numeric.length) - 1;
  return numeric[Math.max(0, Math.min(index, numeric.length - 1))];
}

export function getGlobalStats(leaderboard = combinedLeaderboard, rows = allResults) {
  const detailedModels = new Set(rows.map((row) => row.model));
  const accuracies = leaderboard.map((row) => row.avg_accuracy);

  return {
    modelCount: leaderboard.length,
    rowCount: rows.length,
    detailedModelCount: detailedModels.size,
    archiveModelCount: leaderboard.filter((row) => row.benchmark?.startsWith("Original")).length,
    perfectModelCount: leaderboard.filter((row) => row.avg_accuracy === 100).length,
    meanAccuracy: mean(accuracies),
    medianAccuracy: median(accuracies),
    detailCoverage: leaderboard.length ? (detailedModels.size / leaderboard.length) * 100 : 0,
  };
}

export function getQuestionDifficulty(rowsByModel = modelResultsByName) {
  return questionNumbers.map((expected) => {
    const results = [...rowsByModel.values()].map((rowsForModel) => rowsForModel.get(expected)).filter(Boolean);
    const correct = results.filter((row) => row.is_correct).length;
    const total = results.length;

    return {
      expected,
      correct,
      wrong: total - correct,
      total,
      accuracy: total ? (correct / total) * 100 : 0,
    };
  });
}

export function getHardestQuestions(rowsByModel = modelResultsByName, limit = 8) {
  return getQuestionDifficulty(rowsByModel)
    .filter((row) => row.total > 0)
    .sort((a, b) => a.accuracy - b.accuracy || b.total - a.total || a.expected - b.expected)
    .slice(0, limit);
}

export function getEasiestQuestions(rowsByModel = modelResultsByName, limit = 8) {
  return getQuestionDifficulty(rowsByModel)
    .filter((row) => row.total > 0)
    .sort((a, b) => b.accuracy - a.accuracy || b.total - a.total || a.expected - b.expected)
    .slice(0, limit);
}

export function getRangeAccuracy(rows) {
  return answerRanges.map((range) => {
    const inRange = rows.filter((row) => row.expected >= range.min && row.expected <= range.max);
    const correct = inRange.filter((row) => row.is_correct).length;

    return {
      ...range,
      correct,
      total: inRange.length,
      accuracy: inRange.length ? (correct / inRange.length) * 100 : null,
    };
  });
}

export function getFailureClusters(rows) {
  const sorted = [...rows].sort((a, b) => a.expected - b.expected);
  const clusters = [];
  let active = null;

  for (const row of sorted) {
    if (!row.is_correct) {
      if (!active) {
        active = { start: row.expected, end: row.expected, count: 1, rows: [row] };
      } else if (row.expected === active.end + 1) {
        active.end = row.expected;
        active.count += 1;
        active.rows.push(row);
      } else {
        clusters.push(active);
        active = { start: row.expected, end: row.expected, count: 1, rows: [row] };
      }
    } else if (active) {
      clusters.push(active);
      active = null;
    }
  }

  if (active) clusters.push(active);
  return clusters.sort((a, b) => b.count - a.count || a.start - b.start);
}

export function getModelPerformance(summary, rows = getRowsForModel(summary.model_name)) {
  const correct = rows.filter((row) => row.is_correct).length;
  const wrong = rows.length - correct;
  const failures = getFailureClusters(rows);
  const firstMiss = rows.find((row) => !row.is_correct)?.expected ?? null;
  const longestMissRun = failures[0] ?? null;

  return {
    modelName: summary.model_name,
    summary,
    rows,
    correct,
    wrong,
    firstMiss,
    longestMissRun,
    failureClusters: failures,
    ranges: getRangeAccuracy(rows),
  };
}

export function getAllModelPerformance(leaderboard = combinedLeaderboard) {
  return leaderboard.map((summary) => getModelPerformance(summary, getRowsForModel(summary.model_name)));
}

export function getLatencyStats(rows) {
  const latencies = rows.map((row) => row.latency_ms).filter((value) => Number.isFinite(value));
  if (!latencies.length) return null;

  return {
    count: latencies.length,
    min: Math.min(...latencies),
    max: Math.max(...latencies),
    median: median(latencies),
    p95: percentile(latencies, 95),
  };
}

function firstLogprob(row) {
  const direct = row.token_logprobs?.find((value) => Number.isFinite(value));
  if (Number.isFinite(direct)) return direct;
  const top = row.top_logprobs?.[0]?.[0]?.logprob;
  return Number.isFinite(top) ? top : null;
}

export function getConfidenceStats(rows) {
  const logprobs = rows.map(firstLogprob).filter((value) => Number.isFinite(value));
  if (!logprobs.length) return null;
  const probabilities = logprobs.map((value) => Math.exp(value) * 100);

  return {
    count: probabilities.length,
    medianProbability: median(probabilities),
    averageProbability: mean(probabilities),
    lowestProbability: Math.min(...probabilities),
    highestProbability: Math.max(...probabilities),
  };
}

export function getDetailedRunStats(leaderboard = combinedLeaderboard) {
  return leaderboard
    .filter((summary) => summary.benchmark === "Part 2 - 2026")
    .map((summary) => {
      const rows = getRowsForModel(summary.model_name);
      return {
        summary,
        latency: getLatencyStats(rows),
        confidence: getConfidenceStats(rows),
        performance: getModelPerformance(summary, rows),
      };
    });
}

export function getAccuracyDistribution(leaderboard = combinedLeaderboard) {
  const buckets = [
    { label: "0-24%", min: 0, max: 24.999 },
    { label: "25-49%", min: 25, max: 49.999 },
    { label: "50-74%", min: 50, max: 74.999 },
    { label: "75-99%", min: 75, max: 99.999 },
    { label: "100%", min: 100, max: 100 },
  ];

  return buckets.map((bucket) => ({
    ...bucket,
    count: leaderboard.filter((row) => row.avg_accuracy >= bucket.min && row.avg_accuracy <= bucket.max).length,
  }));
}
