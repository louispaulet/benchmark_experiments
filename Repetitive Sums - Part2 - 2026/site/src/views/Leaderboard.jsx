import React from "react";
import { ArrowDownUp } from "lucide-react";
import { combinedLeaderboard } from "../lib/benchmarkData";
import { benchmarkLabel, formatNumber, pct, streak } from "../lib/format";

export default function Leaderboard({ selectedModel, openModel }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.5fr_0.5fr]">
        <section className="overflow-hidden rounded-md border border-slate-200 bg-white">
          <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
            <ArrowDownUp size={18} className="text-steel" />
            <h2 className="text-base font-semibold">Combined Leaderboard</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm" aria-label="Combined leaderboard">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Model</th>
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
                {combinedLeaderboard.map((row, index) => (
                  <tr
                    key={row.model_name}
                    onClick={() => openModel(row.model_name)}
                    className={`cursor-pointer transition hover:bg-mist ${selectedModel === row.model_name ? "bg-[#edf5ee]" : ""}`}
                  >
                    <td className="px-4 py-3 font-semibold">{index + 1}</td>
                    <td className="px-4 py-3 font-medium">{row.model_name}</td>
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
            {combinedLeaderboard.map((row) => (
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
