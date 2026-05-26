export {
  getConfidenceStats,
  getFailureClusters,
  getHardestQuestions,
  getLatencyStats,
  getRangeAccuracy,
} from "./analytics";

export function buildModelResultsForTest(rows) {
  const byModel = new Map();
  for (const row of rows) {
    if (!byModel.has(row.model)) byModel.set(row.model, new Map());
    byModel.get(row.model).set(row.expected, row);
  }
  return byModel;
}
