import React from "react";
import BarList from "../components/BarList";
import DistributionStrip from "../components/DistributionStrip";
import MiniTrend from "../components/MiniTrend";
import RangeBands from "../components/RangeBands";
import StatPanel from "../components/StatPanel";
import {
  answerRanges,
  getAccuracyDistribution,
  getDetailedRunStats,
  getEasiestQuestions,
  getGlobalStats,
  getHardestQuestions,
  getQuestionDifficulty,
} from "../lib/analytics";
import { combinedLeaderboard } from "../lib/benchmarkData";
import { formatNumber, pct } from "../lib/format";

function rangeDifficulty() {
  const questions = getQuestionDifficulty();
  return answerRanges.map((range) => {
    const entries = questions.filter((row) => row.expected >= range.min && row.expected <= range.max);
    const correct = entries.reduce((sum, row) => sum + row.correct, 0);
    const total = entries.reduce((sum, row) => sum + row.total, 0);
    return { ...range, correct, total, accuracy: total ? (correct / total) * 100 : null };
  });
}

export default function Insights() {
  const stats = getGlobalStats();
  const hardest = getHardestQuestions(undefined, 10).map((row) => ({ label: `${row.expected}`, accuracy: row.accuracy }));
  const easiest = getEasiestQuestions(undefined, 10).map((row) => ({ label: `${row.expected}`, accuracy: row.accuracy }));
  const detailed = getDetailedRunStats();
  const distribution = getAccuracyDistribution();
  const archiveCount = combinedLeaderboard.filter((row) => row.benchmark?.startsWith("Original")).length;
  const detailedCount = combinedLeaderboard.length - archiveCount;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Benchmark Insights</h2>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
          Aggregate patterns across model accuracy, answer difficulty, row-level confidence, latency, and historical coverage.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatPanel label="Mean Accuracy" value={pct(stats.meanAccuracy)} detail="All leaderboard rows" />
        <StatPanel label="Median Accuracy" value={pct(stats.medianAccuracy)} detail="Middle model accuracy" />
        <StatPanel label="Perfect Models" value={stats.perfectModelCount} detail="No misses in evaluated rows" />
        <StatPanel label="Detail Coverage" value={pct(stats.detailCoverage)} detail="Models with row-level data" />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <h3 className="text-base font-semibold">Hardest Expected Answers</h3>
          <div className="mt-4">
            <BarList items={hardest} valueKey="accuracy" suffix="%" maxValue={100} tone="coral" />
          </div>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <h3 className="text-base font-semibold">Easiest Expected Answers</h3>
          <div className="mt-4">
            <BarList items={easiest} valueKey="accuracy" suffix="%" maxValue={100} />
          </div>
        </div>
      </section>

      <section className="rounded-md border border-slate-200 bg-white p-4">
        <h3 className="text-base font-semibold">Accuracy Distribution</h3>
        <div className="mt-4">
          <DistributionStrip buckets={distribution} />
        </div>
      </section>

      <section className="rounded-md border border-slate-200 bg-white p-4">
        <h3 className="text-base font-semibold">Range Difficulty</h3>
        <p className="mt-1 text-sm text-slate-600">Correctness grouped by expected-answer ranges.</p>
        <div className="mt-4">
          <RangeBands ranges={rangeDifficulty()} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {detailed.map(({ summary, latency, confidence, performance }) => (
          <div key={summary.model_name} className="rounded-md border border-slate-200 bg-white p-4">
            <h3 className="text-base font-semibold">{summary.model_name}</h3>
            <div className="mt-3 grid gap-3 text-sm text-slate-600">
              <div className="flex justify-between gap-3"><span>Latency median</span><span className="font-medium text-ink">{latency ? `${formatNumber(latency.median)} ms` : "n/a"}</span></div>
              <div className="flex justify-between gap-3"><span>Latency p95</span><span className="font-medium text-ink">{latency ? `${formatNumber(latency.p95)} ms` : "n/a"}</span></div>
              <div className="flex justify-between gap-3"><span>Median confidence</span><span className="font-medium text-ink">{confidence ? pct(confidence.medianProbability) : "n/a"}</span></div>
            </div>
            <div className="mt-4">
              <MiniTrend points={performance.ranges.map((range) => range.accuracy ?? 0)} />
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-md border border-slate-200 bg-white p-4">
        <h3 className="text-base font-semibold">Archive Comparison</h3>
        <div className="mt-3 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
          <p><span className="font-semibold text-ink">{detailedCount}</span> detailed current benchmark rows are shown with latency and confidence.</p>
          <p><span className="font-semibold text-ink">{archiveCount}</span> archived benchmark rows preserve the historical leaderboard context.</p>
          <p><span className="font-semibold text-ink">{formatNumber(stats.rowCount)}</span> row-level records feed matrix and difficulty stats.</p>
        </div>
      </section>
    </div>
  );
}
