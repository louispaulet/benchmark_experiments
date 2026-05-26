import React, { useMemo, useState } from "react";
import { ArrowDownUp, ChevronDown, Search } from "lucide-react";
import RangeBands from "../components/RangeBands";
import { getAllModelPerformance } from "../lib/analytics";
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
  const [query, setQuery] = useState("");
  const [benchmarkFilter, setBenchmarkFilter] = useState("all");
  const [detailFilter, setDetailFilter] = useState("all");
  const performanceByModel = useMemo(
    () => new Map(getAllModelPerformance().map((performance) => [performance.summary.model_name, performance])),
    [],
  );
  const filtered = combinedLeaderboard.filter((row) => {
    const matchesQuery = row.model_name.toLowerCase().includes(query.trim().toLowerCase());
    const matchesBenchmark =
      benchmarkFilter === "all" ||
      (benchmarkFilter === "detailed" && row.benchmark === "Part 2 - 2026") ||
      (benchmarkFilter === "archive" && row.benchmark?.startsWith("Original"));
    const matchesDetail =
      detailFilter === "all" ||
      (detailFilter === "rows" && row.has_detail) ||
      (detailFilter === "summary" && !row.has_detail);
    return matchesQuery && matchesBenchmark && matchesDetail;
  });
  const sorted = sortLeaderboardRows(filtered, sortLeaderboard);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.5fr_0.5fr]">
        <section className="overflow-hidden rounded-md border border-slate-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <ArrowDownUp size={18} className="text-steel" />
              <h2 className="text-base font-semibold">Combined Leaderboard</h2>
              <span className="text-sm text-slate-500">{sorted.length} models</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex items-center gap-2 text-sm">
                <Search size={18} className="text-steel" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search models"
                  className="w-44 rounded-md border border-slate-300 bg-white px-3 py-2"
                />
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <ChevronDown size={18} className="text-steel" />
                <select
                  value={benchmarkFilter}
                  onChange={(event) => setBenchmarkFilter(event.target.value)}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2"
                  aria-label="Benchmark filter"
                >
                  <option value="all">All benchmarks</option>
                  <option value="detailed">Detailed runs</option>
                  <option value="archive">Archive</option>
                </select>
              </label>
              <select
                value={detailFilter}
                onChange={(event) => setDetailFilter(event.target.value)}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                aria-label="Detail filter"
              >
                <option value="all">All detail</option>
                <option value="rows">Rows only</option>
                <option value="summary">Summary only</option>
              </select>
              <select
                value={sortLeaderboard}
                onChange={(event) => setSortLeaderboard(event.target.value)}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                aria-label="Leaderboard sort"
              >
                <option value="accuracy">Accuracy</option>
                <option value="model_size">Model size</option>
                <option value="streak">Longest streak</option>
                <option value="error">Mean error</option>
                <option value="model">Model</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm" aria-label="Combined leaderboard">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Model</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Accuracy</th>
                  <th className="px-4 py-3">Ranges</th>
                  <th className="px-4 py-3">First Miss</th>
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
                  <LeaderboardRow
                    key={row.model_name}
                    row={row}
                    index={index}
                    selectedModel={selectedModel}
                    openModel={openModel}
                    performance={performanceByModel.get(row.model_name)}
                  />
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

function LeaderboardRow({ row, index, selectedModel, openModel, performance }) {
  return (
    <tr
      onClick={() => openModel(row.model_name)}
      className={`cursor-pointer transition hover:bg-mist ${selectedModel === row.model_name ? "bg-[#edf5ee]" : ""}`}
    >
      <td className="px-4 py-3 font-semibold">{index + 1}</td>
      <td className="px-4 py-3 font-medium">{row.model_name}</td>
      <td className="px-4 py-3" title={row.model_size_note}>{row.model_size_label}</td>
      <td className="px-4 py-3">{pct(row.avg_accuracy)}</td>
      <td className="min-w-64 px-4 py-3">{performance ? <RangeBands ranges={performance.ranges} /> : "n/a"}</td>
      <td className="px-4 py-3">{performance?.firstMiss ?? "none"}</td>
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
  );
}
