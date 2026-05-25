import React from "react";
import { BookOpen } from "lucide-react";
import Metric from "../components/Metric";
import { combinedLeaderboard, historicalModelDates } from "../lib/benchmarkData";

export default function About() {
  const detailedRunCount = combinedLeaderboard.filter((row) => row.benchmark === "Part 2 - 2026").length;
  const originalCount = combinedLeaderboard.filter((row) => row.benchmark?.startsWith("Original")).length;
  const detailCount = combinedLeaderboard.filter((row) => row.has_detail).length;
  const summaryOnlyCount = combinedLeaderboard.length - detailCount;
  const datedHistoryCount = Object.keys(historicalModelDates).length;

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-slate-200 bg-white p-5">
        <div className="flex items-start gap-3">
          <BookOpen className="mt-1 text-steel" />
          <div>
            <h2 className="text-xl font-semibold">About The Benchmark Collection</h2>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">
              This app presents the Repetitive Sums benchmark across current detailed runs and the original benchmark archive.
              Every benchmark asks models to answer repeated additions of one, with expected answers from 2 through 100.
              The combined leaderboard ranks all models together, and the Matrix view lets you inspect every available answer as a green or red tile.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Total Models" value={combinedLeaderboard.length} />
        <Metric label="Detailed Runs" value={detailedRunCount} />
        <Metric label="Archive Rows" value={originalCount} />
        <Metric label="With Row Detail" value={detailCount} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-md border border-slate-200 bg-white p-5">
          <h3 className="text-base font-semibold">Detailed Benchmark Runs</h3>
          <div className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
            <p>Models: gpt-5.4-mini, gpt-5.4, and gpt-5.5. The pro variant is intentionally excluded.</p>
            <p>Endpoint: OpenAI Responses API with output text logprobs included and top token alternatives captured.</p>
            <p>Detail: all 99 row-level answers are stored for every detailed model run, including parsed answer, correctness, latency, token logprobs, and top-token alternatives.</p>
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-5">
          <h3 className="text-base font-semibold">Original Benchmark Archive</h3>
          <div className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
            <p>The archive contributes {originalCount} previous leaderboard rows from the original Repetitive Sums benchmark.</p>
            <p>{detailCount - detailedRunCount} archived models include per-expected-value correctness recovered from the archived PNG charts.</p>
            <p>{summaryOnlyCount} archived models are shown as leaderboard summaries only because row-level answer tables were not published for them.</p>
            <p>History includes test and release dates for {datedHistoryCount} archived models; hover a model name in the History table for the date source note.</p>
          </div>
        </div>
      </section>

      <section className="rounded-md border border-slate-200 bg-white p-5">
        <h3 className="text-base font-semibold">Metrics Shown</h3>
        <div className="mt-3 grid gap-3 text-sm leading-6 text-slate-600 sm:grid-cols-2">
          <p>Accuracy is the percent of rows where the parsed integer answer equals the expected count of ones.</p>
          <p>Error metrics are computed from absolute answer distance for wrong, parseable answers.</p>
          <p>Longest streak is the longest consecutive run of correct answers when results are ordered from 2 through 100.</p>
          <p>Parsing failures count rows where no integer answer could be extracted; summary-only rows show unavailable row-level metrics as n/a.</p>
        </div>
      </section>
    </div>
  );
}
