import React, { useMemo, useState } from "react";
import { CheckCircle2, ListFilter, XCircle } from "lucide-react";
import RangeBands from "../components/RangeBands";
import StatPanel from "../components/StatPanel";
import {
  getConfidenceStats,
  getLatencyStats,
  getModelPerformance,
} from "../lib/analytics";
import { combinedLeaderboard } from "../lib/benchmarkData";
import { benchmarkLabel, formatNumber, pct, streak, topTokenLabel } from "../lib/format";

export default function Results({ rows, selectedModel, setSelectedModel, summary }) {
  const [rowFilter, setRowFilter] = useState("all");
  const failures = rows.filter((row) => !row.is_correct);
  const isHistorical = summary?.benchmark?.startsWith("Original");
  const hasRows = rows.length > 0;
  const performance = useMemo(() => (summary ? getModelPerformance(summary, rows) : null), [summary, rows]);
  const latency = getLatencyStats(rows);
  const confidence = getConfidenceStats(rows);
  const visibleRows = rows.filter((row) => {
    if (rowFilter === "correct") return row.is_correct;
    if (rowFilter === "miss") return !row.is_correct;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Model Results</h2>
          <p className="text-sm text-slate-600">{selectedModel}</p>
        </div>
        <label className="inline-flex items-center gap-2 text-sm">
          <ListFilter size={18} className="text-steel" />
          <select
            value={selectedModel}
            onChange={(event) => setSelectedModel(event.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2"
            aria-label="Model selector"
          >
            {combinedLeaderboard.map((row) => (
              <option key={row.model_name} value={row.model_name}>
                {row.model_name}{row.has_detail ? "" : " (summary only)"}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <StatPanel label="Accuracy" value={summary ? pct(summary.avg_accuracy) : "0%"} />
        <StatPanel label="Model Size" value={summary?.model_size_label ?? "n/a"} detail={summary?.model_size_note} />
        <StatPanel label="Correct" value={hasRows ? performance.correct : "n/a"} />
        <StatPanel label="Wrong" value={hasRows ? failures.length : "n/a"} />
        <StatPanel label="First Miss" value={hasRows ? performance.firstMiss ?? "none" : "n/a"} />
        <StatPanel label="Longest Streak" value={streak(summary?.longest_correct_streak)} />
      </div>

      {summary && (
        <section className="rounded-md border border-slate-200 bg-white p-4">
          <h3 className="text-base font-semibold">{benchmarkLabel(summary.benchmark)}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {hasRows
              ? isHistorical
                ? "Historical correctness positions are available for this model from the archived PNG charts. Answers and logprob columns are unavailable for the original runs."
                : "Detailed row-level answers include Responses API token logprobs and top token alternatives."
              : "Only the historical leaderboard summary is available for this model."}
          </p>
        </section>
      )}

      {hasRows && (
        <section className="rounded-md border border-slate-200 bg-white p-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-base font-semibold">Range Breakdown</h3>
              <p className="text-sm text-slate-600">Correctness grouped into answer ranges.</p>
            </div>
            <span className="text-sm text-slate-600">Longest miss run: {performance.longestMissRun ? `${performance.longestMissRun.start}-${performance.longestMissRun.end}` : "none"}</span>
          </div>
          <div className="mt-4">
            <RangeBands ranges={performance.ranges} />
          </div>
        </section>
      )}

      {hasRows && (
        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-md border border-slate-200 bg-white p-4">
            <h3 className="text-base font-semibold">Failure Clusters</h3>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              {performance.failureClusters.length ? (
                performance.failureClusters.slice(0, 5).map((cluster) => (
                  <div key={`${cluster.start}-${cluster.end}`} className="flex justify-between gap-3 rounded-sm bg-slate-50 px-3 py-2">
                    <span>{cluster.start === cluster.end ? cluster.start : `${cluster.start}-${cluster.end}`}</span>
                    <span className="font-medium text-ink">{cluster.count} miss{cluster.count === 1 ? "" : "es"}</span>
                  </div>
                ))
              ) : (
                <p>No misses in row-level detail.</p>
              )}
            </div>
          </div>
          <div className="rounded-md border border-slate-200 bg-white p-4">
            <h3 className="text-base font-semibold">Latency</h3>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              {latency ? (
                <>
                  <div className="flex justify-between"><span>Median</span><span className="font-medium text-ink">{formatNumber(latency.median)} ms</span></div>
                  <div className="flex justify-between"><span>P95</span><span className="font-medium text-ink">{formatNumber(latency.p95)} ms</span></div>
                  <div className="flex justify-between"><span>Range</span><span className="font-medium text-ink">{formatNumber(latency.min)}-{formatNumber(latency.max)} ms</span></div>
                </>
              ) : (
                <p>Latency is unavailable for this benchmark source.</p>
              )}
            </div>
          </div>
          <div className="rounded-md border border-slate-200 bg-white p-4">
            <h3 className="text-base font-semibold">Logprob Confidence</h3>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              {confidence ? (
                <>
                  <div className="flex justify-between"><span>Median</span><span className="font-medium text-ink">{pct(confidence.medianProbability)}</span></div>
                  <div className="flex justify-between"><span>Average</span><span className="font-medium text-ink">{pct(confidence.averageProbability)}</span></div>
                  <div className="flex justify-between"><span>Lowest</span><span className="font-medium text-ink">{pct(confidence.lowestProbability)}</span></div>
                </>
              ) : (
                <p>Token confidence is unavailable for this benchmark source.</p>
              )}
            </div>
          </div>
        </section>
      )}

      {hasRows && (
        <section className="rounded-md border border-slate-200 bg-white p-4">
          <h3 className="text-base font-semibold">Correctness By Expected Result</h3>
          <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(2.25rem,1fr))] gap-1">
            {rows.map((row) => (
              <div
                key={`${row.model}-${row.expected}`}
                title={`${row.sum} = ${row.expected}; model answered ${row.raw_text || "nothing"}`}
                className={`flex aspect-square min-h-9 items-center justify-center rounded-sm text-xs font-semibold ${
                  row.is_correct ? "bg-[#dcedd6] text-[#24552b]" : "bg-[#f4d9d5] text-[#81291f]"
                }`}
              >
                {row.expected}
              </div>
            ))}
          </div>
        </section>
      )}

      {hasRows && (
        <section className="overflow-hidden rounded-md border border-slate-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-base font-semibold">{isHistorical ? "Row-Level Historical Results" : "Row-Level Logprob Results"}</h3>
            <select
              value={rowFilter}
              onChange={(event) => setRowFilter(event.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
              aria-label="Row filter"
            >
              <option value="all">All rows</option>
              <option value="miss">Misses only</option>
              <option value="correct">Correct only</option>
            </select>
          </div>
          <div className="max-h-[620px] overflow-auto">
            <table className="min-w-full text-left text-sm" aria-label="Row-level results">
              <thead className="sticky top-0 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Expected</th>
                  <th className="px-4 py-3">Answer</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Token Logprobs</th>
                  <th className="px-4 py-3">Top Token</th>
                  <th className="px-4 py-3">Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleRows.map((row) => (
                  <tr key={`${row.model}-${row.expected}`}>
                    <td className="px-4 py-3">{row.expected}</td>
                    <td className="px-4 py-3 font-medium">{row.raw_text}</td>
                    <td className="px-4 py-3">
                      {row.is_correct ? (
                        <span className="inline-flex items-center gap-1 text-[#2d6a32]"><CheckCircle2 size={16} /> Correct</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-coral"><XCircle size={16} /> Miss</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{row.token_logprobs.length ? row.token_logprobs.map((value) => formatNumber(value)).join(", ") : "n/a"}</td>
                    <td className="px-4 py-3 font-mono text-xs">{topTokenLabel(row)}</td>
                    <td className="px-4 py-3">{row.latency_ms === null ? "n/a" : `${formatNumber(row.latency_ms)} ms`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
