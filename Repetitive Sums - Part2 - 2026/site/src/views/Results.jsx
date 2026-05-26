import React, { useMemo, useState } from "react";
import { CheckCircle2, ListFilter, XCircle } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Panel from "../components/Panel";
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
      <PageHeader
        title="Model Results"
        description={selectedModel}
        action={
          <label className="control-with-icon">
            <ListFilter size={18} className="text-steel" />
            <select
              value={selectedModel}
              onChange={(event) => setSelectedModel(event.target.value)}
              className="control-select max-w-full sm:w-72"
              aria-label="Model selector"
            >
              {combinedLeaderboard.map((row) => (
                <option key={row.model_name} value={row.model_name}>
                  {row.model_name}{row.has_detail ? "" : " (summary only)"}
                </option>
              ))}
            </select>
          </label>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <StatPanel label="Accuracy" value={summary ? pct(summary.avg_accuracy) : "0%"} />
        <StatPanel label="Model Size" value={summary?.model_size_label ?? "n/a"} detail={summary?.model_size_note} />
        <StatPanel label="Correct" value={hasRows ? performance.correct : "n/a"} />
        <StatPanel label="Wrong" value={hasRows ? failures.length : "n/a"} />
        <StatPanel label="First Miss" value={hasRows ? performance.firstMiss ?? "none" : "n/a"} />
        <StatPanel label="Longest Streak" value={streak(summary?.longest_correct_streak)} />
      </div>

      {summary && (
        <Panel title={benchmarkLabel(summary.benchmark)}>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {hasRows
              ? isHistorical
                ? "Historical correctness positions are available for this model from the archived PNG charts. Answers and logprob columns are unavailable for the original runs."
                : "Detailed row-level answers include Responses API token logprobs and top token alternatives."
              : "Only the historical leaderboard summary is available for this model."}
          </p>
        </Panel>
      )}

      {hasRows && (
        <Panel
          title="Range Breakdown"
          description="Correctness grouped into answer ranges."
          action={<span className="count-pill">Longest miss run: {performance.longestMissRun ? `${performance.longestMissRun.start}-${performance.longestMissRun.end}` : "none"}</span>}
        >
          <div className="mt-4">
            <RangeBands ranges={performance.ranges} />
          </div>
        </Panel>
      )}

      {hasRows && (
        <section className="grid gap-4 lg:grid-cols-3">
          <Panel title="Failure Clusters">
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
          </Panel>
          <Panel title="Latency">
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
          </Panel>
          <Panel title="Logprob Confidence">
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
          </Panel>
        </section>
      )}

      {hasRows && (
        <Panel title="Correctness By Expected Result">
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
        </Panel>
      )}

      {hasRows && (
        <Panel
          className="overflow-hidden p-0"
          title={isHistorical ? "Row-Level Historical Results" : "Row-Level Logprob Results"}
          action={
            <select
              value={rowFilter}
              onChange={(event) => setRowFilter(event.target.value)}
              className="control-select"
              aria-label="Row filter"
            >
              <option value="all">All rows</option>
              <option value="miss">Misses only</option>
              <option value="correct">Correct only</option>
            </select>
          }
        >
          <div className="max-h-[620px] overflow-auto">
            <table className="data-table" aria-label="Row-level results">
              <thead className="sticky top-0">
                <tr>
                  <th>Expected</th>
                  <th>Answer</th>
                  <th>Status</th>
                  <th>Token Logprobs</th>
                  <th>Top Token</th>
                  <th>Latency</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => (
                  <tr key={`${row.model}-${row.expected}`}>
                    <td>{row.expected}</td>
                    <td className="font-medium">{row.raw_text}</td>
                    <td>
                      {row.is_correct ? (
                        <span className="inline-flex items-center gap-1 text-[#2d6a32]"><CheckCircle2 size={16} /> Correct</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-coral"><XCircle size={16} /> Miss</span>
                      )}
                    </td>
                    <td className="font-mono text-xs">{row.token_logprobs.length ? row.token_logprobs.map((value) => formatNumber(value)).join(", ") : "n/a"}</td>
                    <td className="font-mono text-xs">{topTokenLabel(row)}</td>
                    <td>{row.latency_ms === null ? "n/a" : `${formatNumber(row.latency_ms)} ms`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
  );
}
