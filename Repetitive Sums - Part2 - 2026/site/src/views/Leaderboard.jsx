import React from "react";
import { ArrowDownUp, ChevronDown } from "lucide-react";
import { combinedLeaderboard } from "../lib/benchmarkData";
import { benchmarkLabel, formatNumber, pct, streak } from "../lib/format";
import { compareModelSizeDesc } from "../lib/modelSizes";

export function sortLeaderboardRows(rows, sortLeaderboard) {
  return [...rows].sort((a, b) => {
    if (sortLeaderboard === "accuracy") return b.avg_accuracy - a.avg_accuracy;
    if (sortLeaderboard === "model_size") return compareModelSizeDesc(a, b);
    if (sortLeaderboard === "error") return a.error_mean - b.error_mean;
    if (sortLeaderboard === "streak") return (b.longest_correct_streak ?? -1) - (a.longest_correct_streak ?? -1);
    if (sortLeaderboard === "model") return a.model_name.localeCompare(b.model_name);
    return b.avg_accuracy - a.avg_accuracy;
  });
}

export default function Leaderboard({ selectedModel, openModel, sortLeaderboard = "accuracy", setSortLeaderboard = () => {} }) {
  const sorted = sortLeaderboardRows(combinedLeaderboard, sortLeaderboard);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.5fr_0.5fr]">
        <section className="overflow-hidden rounded-md border border-slate-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <ArrowDownUp size={18} className="text-steel" />
              <h2 className="text-base font-semibold">Combined Leaderboard</h2>
            </div>
            <label className="inline-flex items-center gap-2 text-sm">
              <ChevronDown size={18} className="text-steel" />
              <select
                value={sortLeaderboard}
                onChange={(event) => setSortLeaderboard(event.target.value)}
                className="rounded-md border border-slate-300 bg-white px-3 py-2"
              >
                <option value="accuracy">Accuracy</option>
                <option value="model_size">Model size</option>
                <option value="streak">Longest streak</option>
                <option value="error">Mean error</option>
                <option value="model">Model</option>
              </select>
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm" aria-label="Combined leaderboard">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Model</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Accuracy</th>
                  <th className="px-4 py-3">Mean Error</th>
                  <th className="px-4 py-3">Longest Streak</th>
                  <th className="px-4 py-3">Failures</th>
                  <th className="px-4 py-3">Evaluated</th>
                  <th className="px-4 py-3">Benchmark</th>
                  <th className="px-4 py-3">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sorted.map((row, index) => (
                  <tr
                    key={row.model_name}
                    onClick={() => openModel(row.model_name)}
                    className={`cursor-pointer transition hover:bg-mist ${selectedModel === row.model_name ? "bg-[#edf5ee]" : ""}`}
                  >
                    <td className="px-4 py-3 font-semibold">{index + 1}</td>
                    <td className="px-4 py-3 font-medium">{row.model_name}</td>
                    <td className="px-4 py-3" title={row.model_size_note}>{row.model_size_label}</td>
                    <td className="px-4 py-3">{pct(row.avg_accuracy)}</td>
                    <td className="px-4 py-3">{formatNumber(row.error_mean)}</td>
                    <td className="px-4 py-3">{streak(row.longest_correct_streak)}</td>
                    <td className="px-4 py-3">{row.parsing_failure_count}</td>
                    <td className="px-4 py-3">{row.evaluated_count}</td>
                    <td className="px-4 py-3 text-slate-600">{benchmarkLabel(row.benchmark)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-sm px-2 py-1 text-xs font-semibold ${row.has_detail ? "bg-[#dcedd6] text-[#24552b]" : "bg-slate-100 text-slate-500"}`}>
                        {row.has_detail ? "rows" : "summary"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="rounded-md border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Accuracy Spread</h2>
          <div className="mt-4 max-h-[760px] space-y-4 overflow-auto pr-1">
            {sorted.map((row) => (
              <div key={row.model_name}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{row.model_name}</span>
                  <span className="font-medium">{pct(row.avg_accuracy)}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-sm bg-slate-100">
                  <div className="h-full bg-moss" style={{ width: `${row.avg_accuracy}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
