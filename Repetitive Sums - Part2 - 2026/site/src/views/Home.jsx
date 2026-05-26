import React from "react";
import BarList from "../components/BarList";
import RangeBands from "../components/RangeBands";
import StatPanel from "../components/StatPanel";
import {
  getAllModelPerformance,
  getGlobalStats,
  getHardestQuestions,
  getQuestionDifficulty,
} from "../lib/analytics";
import { combinedLeaderboard } from "../lib/benchmarkData";
import { formatNumber, pct } from "../lib/format";
import Leaderboard from "./Leaderboard";
import Matrix from "./Matrix";

export default function Home({ selectedModel, openModel, sortLeaderboard, setSortLeaderboard, rows, sortMatrix, setSortMatrix }) {
  const stats = getGlobalStats();
  const hardest = getHardestQuestions(undefined, 6).map((row) => ({
    label: `Expected ${row.expected}`,
    accuracy: row.accuracy,
    detail: `${row.correct}/${row.total} correct`,
  }));
  const topModels = combinedLeaderboard.slice(0, 5).map((row) => ({
    label: row.model_name,
    accuracy: row.avg_accuracy,
  }));
  const modelPerformance = getAllModelPerformance().find((row) => row.summary.model_name === selectedModel) ?? getAllModelPerformance()[0];
  const difficulty = getQuestionDifficulty();
  const averageDifficulty = [
    { id: "low", label: "2-25", min: 2, max: 25 },
    { id: "midLow", label: "26-50", min: 26, max: 50 },
    { id: "midHigh", label: "51-75", min: 51, max: 75 },
    { id: "high", label: "76-100", min: 76, max: 100 },
  ].map((range) => {
    const entries = difficulty.filter((row) => row.expected >= range.min && row.expected <= range.max);
    const correct = entries.reduce((sum, row) => sum + row.correct, 0);
    const total = entries.reduce((sum, row) => sum + row.total, 0);
    return { ...range, correct, total, accuracy: total ? (correct / total) * 100 : null };
  });

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Benchmark Dashboard</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            A dense readout of model accuracy, brittle answer ranges, row-level detail coverage, and current leaderboard leaders.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatPanel label="Mean Accuracy" value={pct(stats.meanAccuracy)} detail={`${stats.modelCount} ranked models`} />
          <StatPanel label="Median Accuracy" value={pct(stats.medianAccuracy)} detail={`${stats.perfectModelCount} perfect models`} />
          <StatPanel label="Row Detail" value={pct(stats.detailCoverage)} detail={`${stats.detailedModelCount} models with rows`} />
          <StatPanel label="Rows Analyzed" value={formatNumber(stats.rowCount)} detail={`${stats.archiveModelCount} archive models`} />
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1.2fr]">
          <section className="rounded-md border border-slate-200 bg-white p-4">
            <h3 className="text-base font-semibold">Top Models</h3>
            <div className="mt-4">
              <BarList items={topModels} valueKey="accuracy" suffix="%" maxValue={100} />
            </div>
          </section>
          <section className="rounded-md border border-slate-200 bg-white p-4">
            <h3 className="text-base font-semibold">Hardest Sums</h3>
            <div className="mt-4">
              <BarList items={hardest} valueKey="accuracy" suffix="%" maxValue={100} tone="coral" />
            </div>
          </section>
          <section className="rounded-md border border-slate-200 bg-white p-4">
            <h3 className="text-base font-semibold">Answer Range Accuracy</h3>
            <p className="mt-1 text-sm text-slate-600">Average correctness across all models with row-level detail.</p>
            <div className="mt-4">
              <RangeBands ranges={averageDifficulty} />
            </div>
          </section>
        </div>
        {modelPerformance && (
          <section className="rounded-md border border-slate-200 bg-white p-4">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-base font-semibold">Selected Model Range Profile</h3>
                <p className="text-sm text-slate-600">{modelPerformance.summary.model_name}</p>
              </div>
              <span className="text-sm text-slate-600">First miss: {modelPerformance.firstMiss ?? "none"}</span>
            </div>
            <RangeBands ranges={modelPerformance.ranges} />
          </section>
        )}
      </section>
      <Matrix rows={rows.slice(0, 12)} sortMatrix={sortMatrix} setSortMatrix={setSortMatrix} compact />
      <Leaderboard
        selectedModel={selectedModel}
        openModel={openModel}
        sortLeaderboard={sortLeaderboard}
        setSortLeaderboard={setSortLeaderboard}
      />
    </div>
  );
}
