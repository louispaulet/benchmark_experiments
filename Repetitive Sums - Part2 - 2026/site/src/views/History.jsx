import React from "react";
import { ChevronDown } from "lucide-react";
import { dateValue, formatNumber, pct, streak } from "../lib/format";

export function sortHistoryRows(rows, sortHistory) {
  return [...rows].sort((a, b) => {
    if (sortHistory === "accuracy") return b.avg_accuracy - a.avg_accuracy;
    if (sortHistory === "error") return a.error_mean - b.error_mean;
    if (sortHistory === "streak") return (b.longest_correct_streak ?? -1) - (a.longest_correct_streak ?? -1);
    if (sortHistory === "test_date") return dateValue(b.test_date).localeCompare(dateValue(a.test_date));
    if (sortHistory === "release_date") return dateValue(b.release_date).localeCompare(dateValue(a.release_date));
    return a.model_name.localeCompare(b.model_name);
  });
}

export default function History({ rows, sortHistory, setSortHistory }) {
  const sorted = sortHistoryRows(rows, sortHistory);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Previous Benchmarks</h2>
          <p className="text-sm text-slate-600">Extracted from the original benchmark README and kept separate from Part 2 execution artifacts.</p>
        </div>
        <label className="inline-flex items-center gap-2 text-sm">
          <ChevronDown size={18} className="text-steel" />
          <select
            value={sortHistory}
            onChange={(event) => setSortHistory(event.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2"
          >
            <option value="accuracy">Accuracy</option>
            <option value="streak">Longest streak</option>
            <option value="test_date">Test date</option>
            <option value="release_date">Release date</option>
            <option value="error">Mean error</option>
            <option value="model">Model</option>
          </select>
        </label>
      </div>
      <section className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm" aria-label="Previous benchmarks">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Model</th>
                <th className="px-4 py-3">Test Date</th>
                <th className="px-4 py-3">Release Date</th>
                <th className="px-4 py-3">Accuracy</th>
                <th className="px-4 py-3">Mean Error</th>
                <th className="px-4 py-3">Longest Streak</th>
                <th className="px-4 py-3">Median Error</th>
                <th className="px-4 py-3">Max Error</th>
                <th className="px-4 py-3">Failures</th>
                <th className="px-4 py-3">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((row) => (
                <tr key={row.model_name}>
                  <td className="px-4 py-3 font-medium" title={row.date_source || ""}>{row.model_name}</td>
                  <td className="px-4 py-3">{dateValue(row.test_date)}</td>
                  <td className="px-4 py-3">{dateValue(row.release_date)}</td>
                  <td className="px-4 py-3">{pct(row.avg_accuracy)}</td>
                  <td className="px-4 py-3">{formatNumber(row.error_mean)}</td>
                  <td className="px-4 py-3">{streak(row.longest_correct_streak)}</td>
                  <td className="px-4 py-3">{formatNumber(row.error_median)}</td>
                  <td className="px-4 py-3">{row.error_max}</td>
                  <td className="px-4 py-3">{row.parsing_failure_count}</td>
                  <td className="px-4 py-3">{row.has_detail ? "rows" : "summary"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
