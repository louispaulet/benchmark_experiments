import React, { useMemo, useState } from "react";
import { ArrowDownUp, ChevronDown, Search } from "lucide-react";
import CompactRangeBars from "../components/CompactRangeBars";
import PageHeader from "../components/PageHeader";
import Panel from "../components/Panel";
import { getAllModelPerformance } from "../lib/analytics";
import { combinedLeaderboard } from "../lib/benchmarkData";
import { benchmarkLabel, formatNumber, pct, streak } from "../lib/format";
import { compareModelSizeDesc } from "../lib/modelSizes";

function compactBenchmarkLabel(benchmark) {
  return benchmark === "Part 2 - 2026" ? "Detailed run" : "Archive";
}

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
      <PageHeader
        title="Combined Leaderboard"
        description="Rank models by accuracy, size, error, or streak while preserving row-level range context."
        action={<span className="count-pill">{sorted.length} models</span>}
      />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <Panel
          className="overflow-hidden p-0"
          title={
            <span className="inline-flex items-center gap-2">
              <ArrowDownUp size={18} className="text-steel" />
              Ranked Models
            </span>
          }
          description="Primary metrics only; source and detail are folded into each model row."
        >
          <div className="toolbar">
              <label className="control-with-icon">
                <Search size={18} className="text-steel" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search models"
                  className="control-input w-48"
                />
              </label>
              <label className="control-with-icon">
                <ChevronDown size={18} className="text-steel" />
                <select
                  value={benchmarkFilter}
                  onChange={(event) => setBenchmarkFilter(event.target.value)}
                  className="control-select"
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
                className="control-select"
                aria-label="Detail filter"
              >
                <option value="all">All detail</option>
                <option value="rows">Rows only</option>
                <option value="summary">Summary only</option>
              </select>
              <select
                value={sortLeaderboard}
                onChange={(event) => setSortLeaderboard(event.target.value)}
                className="control-select"
                aria-label="Leaderboard sort"
              >
                <option value="accuracy">Accuracy</option>
                <option value="model_size">Model size</option>
                <option value="streak">Longest streak</option>
                <option value="error">Mean error</option>
                <option value="model">Model</option>
              </select>
          </div>
          <div className="table-scroll">
            <table className="data-table leaderboard-table" aria-label="Combined leaderboard">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Model</th>
                  <th>Size</th>
                  <th>Accuracy</th>
                  <th>Ranges</th>
                  <th>First Miss</th>
                  <th>Mean Error</th>
                  <th>Longest Streak</th>
                </tr>
              </thead>
              <tbody>
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
        </Panel>
        <Panel title="Accuracy Spread" description="Sorted with the table.">
          <div className="mt-4 max-h-[760px] space-y-4 overflow-auto pr-1">
            {sorted.map((row) => (
              <div key={row.model_name}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="min-w-0 truncate" title={row.model_name}>{row.model_name}</span>
                  <span className="font-medium">{pct(row.avg_accuracy)}</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill bar-fill-moss" style={{ width: `${row.avg_accuracy}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function LeaderboardRow({ row, index, selectedModel, openModel, performance }) {
  return (
    <tr
      onClick={() => openModel(row.model_name)}
      className={`cursor-pointer transition hover:bg-mist ${selectedModel === row.model_name ? "selected-row" : ""}`}
    >
      <td className="rank-cell">{index + 1}</td>
      <td className="model-cell">
        <div className="model-name" title={row.model_name}>{row.model_name}</div>
        <div className="model-meta">
          <span title={benchmarkLabel(row.benchmark)}>{compactBenchmarkLabel(row.benchmark)}</span>
          <span>{row.evaluated_count} rows</span>
          <span className={row.has_detail ? "status-good" : "status-muted"}>
          {row.has_detail ? "rows" : "summary"}
        </span>
        </div>
      </td>
      <td title={row.model_size_note}>{row.model_size_label}</td>
      <td className="metric-cell">{pct(row.avg_accuracy)}</td>
      <td className="ranges-cell">{performance ? <CompactRangeBars ranges={performance.ranges} /> : "n/a"}</td>
      <td>{performance?.firstMiss ?? "none"}</td>
      <td>{formatNumber(row.error_mean)}</td>
      <td>{streak(row.longest_correct_streak)}</td>
    </tr>
  );
}
