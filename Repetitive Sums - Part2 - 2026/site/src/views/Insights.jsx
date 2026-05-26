import React from "react";
import BarList from "../components/BarList";
import DistributionStrip from "../components/DistributionStrip";
import MiniTrend from "../components/MiniTrend";
import PageHeader from "../components/PageHeader";
import Panel from "../components/Panel";
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
      <PageHeader
        title="Benchmark Insights"
        description="Aggregate accuracy, difficulty, confidence, latency, and historical coverage."
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatPanel label="Mean Accuracy" value={pct(stats.meanAccuracy)} detail="All leaderboard rows" />
        <StatPanel label="Median Accuracy" value={pct(stats.medianAccuracy)} detail="Middle model accuracy" />
        <StatPanel label="Perfect Models" value={stats.perfectModelCount} detail="No misses in evaluated rows" />
        <StatPanel label="Detail Coverage" value={pct(stats.detailCoverage)} detail="Models with row-level data" />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Panel title="Hardest Expected Answers">
          <div className="mt-4">
            <BarList items={hardest} valueKey="accuracy" suffix="%" maxValue={100} tone="coral" />
          </div>
        </Panel>
        <Panel title="Easiest Expected Answers">
          <div className="mt-4">
            <BarList items={easiest} valueKey="accuracy" suffix="%" maxValue={100} />
          </div>
        </Panel>
      </section>

      <Panel title="Accuracy Distribution">
        <div className="mt-4">
          <DistributionStrip buckets={distribution} />
        </div>
      </Panel>

      <Panel title="Range Difficulty" description="Correctness grouped by expected-answer ranges.">
        <div className="mt-4">
          <RangeBands ranges={rangeDifficulty()} />
        </div>
      </Panel>

      <section className="grid gap-4 lg:grid-cols-3">
        {detailed.map(({ summary, latency, confidence, performance }) => (
          <Panel key={summary.model_name} title={<span title={summary.model_name} className="block truncate">{summary.model_name}</span>}>
            <div className="mt-3 grid gap-3 text-sm text-slate-600">
              <div className="flex justify-between gap-3"><span>Latency median</span><span className="font-medium text-ink">{latency ? `${formatNumber(latency.median)} ms` : "n/a"}</span></div>
              <div className="flex justify-between gap-3"><span>Latency p95</span><span className="font-medium text-ink">{latency ? `${formatNumber(latency.p95)} ms` : "n/a"}</span></div>
              <div className="flex justify-between gap-3"><span>Median confidence</span><span className="font-medium text-ink">{confidence ? pct(confidence.medianProbability) : "n/a"}</span></div>
            </div>
            <div className="mt-4">
              <MiniTrend points={performance.ranges.map((range) => range.accuracy ?? 0)} />
            </div>
          </Panel>
        ))}
      </section>

      <Panel title="Archive Comparison">
        <div className="mt-3 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
          <p><span className="font-semibold text-ink">{detailedCount}</span> detailed current benchmark rows are shown with latency and confidence.</p>
          <p><span className="font-semibold text-ink">{archiveCount}</span> archived benchmark rows preserve the historical leaderboard context.</p>
          <p><span className="font-semibold text-ink">{formatNumber(stats.rowCount)}</span> row-level records feed matrix and difficulty stats.</p>
        </div>
      </Panel>
    </div>
  );
}
