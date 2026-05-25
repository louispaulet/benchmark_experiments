import React from "react";
import { CheckCircle2, ListFilter, XCircle } from "lucide-react";
import Metric from "../components/Metric";
import { combinedLeaderboard } from "../lib/benchmarkData";
import { benchmarkLabel, formatNumber, pct, streak, topTokenLabel } from "../lib/format";

export default function Results({ rows, selectedModel, setSelectedModel, summary }) {
  const failures = rows.filter((row) => !row.is_correct);
  const isHistorical = summary?.benchmark?.startsWith("Original");
  const hasRows = rows.length > 0;

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
          >
            {combinedLeaderboard.map((row) => (
              <option key={row.model_name} value={row.model_name}>
                {row.model_name}{row.has_detail ? "" : " (summary only)"}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-5">
        <Metric label="Accuracy" value={summary ? pct(summary.avg_accuracy) : "0%"} />
        <Metric label="Correct" value={hasRows ? rows.filter((row) => row.is_correct).length : "n/a"} />
        <Metric label="Wrong" value={hasRows ? failures.length : "n/a"} />
        <Metric label="Longest Streak" value={streak(summary?.longest_correct_streak)} />
        <Metric label="Parse Fails" value={summary?.parsing_failure_count ?? 0} />
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
          <div className="border-b border-slate-200 px-4 py-3">
            <h3 className="text-base font-semibold">{isHistorical ? "Row-Level Historical Results" : "Row-Level Logprob Results"}</h3>
          </div>
          <div className="max-h-[620px] overflow-auto">
            <table className="min-w-full text-left text-sm">
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
                {rows.map((row) => (
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
