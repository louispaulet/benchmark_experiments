import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Navigate, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowDownUp,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Database,
  Info,
  ListFilter,
  XCircle,
} from "lucide-react";
import combinedLeaderboard from "./data/combined_leaderboard.json";
import results from "./data/part2_results.json";
import historicalModelDates from "./data/historical_model_dates.json";
import "./styles.css";

const tabs = [
  { path: "/", label: "Leaderboard", icon: BarChart3 },
  { path: "/results", label: "Results", icon: Activity },
  { path: "/matrix", label: "Matrix", icon: ListFilter },
  { path: "/history", label: "History", icon: Database },
  { path: "/about", label: "About", icon: Info },
];

const fmt = new Intl.NumberFormat("en", { maximumFractionDigits: 2 });
const historicalRunModules = import.meta.glob("./data/historical_runs/*.json", { eager: true });
const historicalRuns = Object.values(historicalRunModules).map((module) => module.default ?? module);
const historicalResults = historicalRuns.flatMap((run) =>
  Object.entries(run.results).map(([expected, isCorrect]) => ({
    model: run.metadata.model_name,
    sum: Array.from({ length: Number(expected) }, () => "1").join("+"),
    expected: Number(expected),
    raw_text: "n/a",
    parsed_answer: null,
    is_correct: Boolean(isCorrect),
    error_abs: null,
    tokens: [],
    token_logprobs: [],
    top_logprobs: [],
    latency_ms: null,
    api_endpoint: "historical PNG chart",
    created_at: run.metadata.test_date || "",
    error: "",
    benchmark: run.metadata.benchmark,
    detail_source: run.metadata.source_png,
  })),
);
const allResults = [...results, ...historicalResults];
const questionNumbers = Array.from({ length: 99 }, (_, index) => index + 2);
const modelResultsByName = new Map();
const modelFirstObservedAt = new Map();

for (const row of allResults) {
  const expected = Number(row.expected);
  const modelName = row.model;
  if (!modelResultsByName.has(modelName)) {
    modelResultsByName.set(modelName, new Map());
  }
  modelResultsByName.get(modelName).set(expected, row);

  const observedAt = row.created_at || row.test_date || "";
  if (observedAt) {
    const current = modelFirstObservedAt.get(modelName);
    if (!current || Date.parse(observedAt) < Date.parse(current)) {
      modelFirstObservedAt.set(modelName, observedAt);
    }
  }
}

function pct(value) {
  return `${fmt.format(value)}%`;
}

function streak(value) {
  return value === null || value === undefined ? "n/a" : value;
}

function dateValue(value) {
  return value || "n/a";
}

function displayDate(value) {
  if (!value) return "n/a";
  return value.includes("T") ? value.slice(0, 10) : value;
}

function buildMatrixRows(sortMatrix) {
  const rows = combinedLeaderboard.map((summary) => {
    const rowsForModel = modelResultsByName.get(summary.model_name) ?? new Map();
    const releaseDate = summary.release_date || summary.test_date || modelFirstObservedAt.get(summary.model_name) || "";
    return {
      summary,
      rowsForModel,
      releaseDate,
    };
  });

  return rows.sort((a, b) => {
    if (sortMatrix === "release_date") {
      const bDate = Date.parse(b.releaseDate || "");
      const aDate = Date.parse(a.releaseDate || "");
      const left = Number.isNaN(bDate) ? -Infinity : bDate;
      const right = Number.isNaN(aDate) ? -Infinity : aDate;
      if (left !== right) return left - right;
    }
    if (sortMatrix === "accuracy" && b.summary.avg_accuracy !== a.summary.avg_accuracy) {
      return b.summary.avg_accuracy - a.summary.avg_accuracy;
    }
    if (sortMatrix === "streak") {
      const bStreak = b.summary.longest_correct_streak ?? -1;
      const aStreak = a.summary.longest_correct_streak ?? -1;
      if (bStreak !== aStreak) return bStreak - aStreak;
    }
    return a.summary.model_name.localeCompare(b.summary.model_name);
  });
}

function App() {
  const navigate = useNavigate();
  const [selectedModel, setSelectedModel] = useState(combinedLeaderboard[0]?.model_name ?? "");
  const [sortMatrix, setSortMatrix] = useState("accuracy");
  const [sortHistory, setSortHistory] = useState("accuracy");
  const matrixRows = useMemo(() => buildMatrixRows(sortMatrix), [sortMatrix]);
  const currentRows = useMemo(
    () => allResults.filter((row) => row.model === selectedModel).sort((a, b) => a.expected - b.expected),
    [selectedModel],
  );
  const selectedSummary = combinedLeaderboard.find((row) => row.model_name === selectedModel);
  const openModel = (modelName) => {
    setSelectedModel(modelName);
    navigate("/results");
  };

  return (
    <main className="min-h-screen bg-[#f6f8f5] text-ink">
      <header className="border-b border-slate-200 bg-white/90">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-moss">Part 2 · 2026</p>
              <h1 className="mt-1 text-3xl font-semibold text-ink sm:text-4xl">Repetitive Sums Benchmark</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                OpenAI Responses API logprob evaluation for repetitive sums from 2 through 100.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <Metric label="Models" value={combinedLeaderboard.length} />
              <Metric label="Rows" value={allResults.length} />
              <Metric label="Best" value={pct(Math.max(...combinedLeaderboard.map((row) => row.avg_accuracy)))} />
            </div>
          </div>
          <nav className="flex gap-2 overflow-x-auto">
            {tabs.map((route) => {
              const Icon = route.icon;
              return (
                <NavLink
                  key={route.path}
                  to={route.path}
                  title={route.label}
                  end={route.path === "/"}
                  className={({ isActive }) => `inline-flex min-h-10 items-center gap-2 rounded-md border px-3 text-sm font-medium transition ${
                    isActive
                      ? "border-steel bg-steel text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-steel"
                  }`}
                >
                  <Icon size={17} />
                  <span>{route.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Leaderboard selectedModel={selectedModel} openModel={openModel} />} />
          <Route
            path="/results"
            element={<Results rows={currentRows} selectedModel={selectedModel} setSelectedModel={setSelectedModel} summary={selectedSummary} />}
          />
          <Route path="/matrix" element={<Matrix rows={matrixRows} sortMatrix={sortMatrix} setSortMatrix={setSortMatrix} />} />
          <Route
            path="/history"
            element={
              <History
                rows={combinedLeaderboard.filter((row) => row.benchmark?.startsWith("Original"))}
                sortHistory={sortHistory}
                setSortHistory={setSortHistory}
              />
            }
          />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </section>
    </main>
  );
}

function Metric({ label, value }) {
  return (
    <div className="min-w-24 rounded-md border border-slate-200 bg-mist px-3 py-2">
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-xs uppercase text-slate-500">{label}</div>
    </div>
  );
}

function Leaderboard({ selectedModel, openModel }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.5fr_0.5fr]">
        <section className="overflow-hidden rounded-md border border-slate-200 bg-white">
          <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
            <ArrowDownUp size={18} className="text-steel" />
            <h2 className="text-base font-semibold">Combined Leaderboard</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
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
                    <td className="px-4 py-3">{fmt.format(row.error_mean)}</td>
                    <td className="px-4 py-3">{streak(row.longest_correct_streak)}</td>
                    <td className="px-4 py-3">{row.parsing_failure_count}</td>
                    <td className="px-4 py-3">{row.evaluated_count}</td>
                    <td className="px-4 py-3 text-slate-600">{row.benchmark}</td>
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

function Results({ rows, selectedModel, setSelectedModel, summary }) {
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
          <h3 className="text-base font-semibold">{summary.benchmark}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {hasRows
              ? isHistorical
                ? "Historical correctness positions are available for this model from the archived PNG charts. Answers and logprob columns are unavailable for the original runs."
                : "Part 2 row-level answers include Responses API token logprobs and top token alternatives."
              : "Only the historical leaderboard summary is available for this model."}
          </p>
        </section>
      )}

      {hasRows && <section className="rounded-md border border-slate-200 bg-white p-4">
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
      </section>}

      {hasRows && <section className="overflow-hidden rounded-md border border-slate-200 bg-white">
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
                  <td className="px-4 py-3 font-mono text-xs">{row.token_logprobs.length ? row.token_logprobs.map((value) => fmt.format(value)).join(", ") : "n/a"}</td>
                  <td className="px-4 py-3 font-mono text-xs">{topTokenLabel(row)}</td>
                  <td className="px-4 py-3">{row.latency_ms === null ? "n/a" : `${fmt.format(row.latency_ms)} ms`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>}
    </div>
  );
}

function Matrix({ rows, sortMatrix, setSortMatrix }) {
  const modelCount = rows.length;
  const cellsPerModel = questionNumbers.length;
  const matrixTemplateColumns = `minmax(9.5rem, 18rem) repeat(${cellsPerModel}, minmax(0, 1fr))`;
  const axisLabels = [2, 25, 50, 75, 100];
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Dot Matrix</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            Green tiles are correct answers and red tiles are wrong answers. The matrix merges the full historical archive with the latest Part 2 runs, one row per model and one column per expected answer from 2 to 100.
          </p>
        </div>
        <label className="inline-flex items-center gap-2 text-sm">
          <ChevronDown size={18} className="text-steel" />
          <select
            value={sortMatrix}
            onChange={(event) => setSortMatrix(event.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2"
          >
            <option value="accuracy">Accuracy</option>
            <option value="release_date">Model release date</option>
            <option value="streak">Longest streak</option>
          </select>
        </label>
      </div>

      <section className="rounded-md border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div className="text-sm text-slate-600">
            {modelCount} models · {cellsPerModel} questions per model
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <LegendSwatch label="Correct" className="bg-[#dcedd6] ring-[#b5d7ae]" />
            <LegendSwatch label="Wrong" className="bg-[#f4d9d5] ring-[#e7b5ac]" />
            <LegendSwatch label="Missing" className="bg-slate-100 ring-slate-200" />
          </div>
        </div>

        <div className="matrix-scroll" data-testid="dot-matrix-scroll">
          <div
            className="matrix-grid matrix-grid-header sticky top-0 z-20"
            style={{ gridTemplateColumns: matrixTemplateColumns }}
            role="row"
          >
            <div className="matrix-model-header" role="columnheader">
              Model
            </div>
            <div
              className="matrix-axis"
              style={{ gridColumn: `span ${cellsPerModel}`, gridTemplateColumns: `repeat(${cellsPerModel}, minmax(0, 1fr))` }}
              role="columnheader"
            >
              {axisLabels.map((label) => (
                <span key={label} className="matrix-axis-label" style={{ gridColumn: String(label - 1) }}>
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="matrix-body" role="table" aria-label="Model correctness dot matrix">
            {rows.map((row) => (
              <div
                key={row.summary.model_name}
                className="matrix-grid matrix-row"
                style={{ gridTemplateColumns: matrixTemplateColumns }}
                role="row"
              >
                <div className="matrix-model-cell" role="rowheader">
                  <span className="matrix-model-name" title={row.summary.model_name}>
                    {row.summary.model_name}
                  </span>
                  <span className="matrix-model-meta">
                    {pct(row.summary.avg_accuracy)} · {displayDate(row.releaseDate)}
                  </span>
                </div>
                {questionNumbers.map((question) => {
                  const result = row.rowsForModel.get(question);
                  const isCorrect = result?.is_correct;
                  const swatchClass =
                    isCorrect === true
                      ? "matrix-dot-correct"
                      : isCorrect === false
                        ? "matrix-dot-wrong"
                        : "matrix-dot-missing";
                  const tooltip = result
                    ? `${row.summary.model_name} · Expected result: ${result.expected} · ${result.is_correct ? "Correct" : "Wrong"}${result.raw_text ? ` · Answer: ${result.raw_text}` : ""}`
                    : `${row.summary.model_name} · Expected result: ${question} · Missing result`;
                  return (
                    <div key={question} className="matrix-dot-cell" title={tooltip} aria-label={tooltip} role="cell">
                      <span title={tooltip} aria-label={tooltip} className={`matrix-dot ${swatchClass}`} />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function LegendSwatch({ label, className }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block size-3 rounded-[3px] ring-1 ring-inset ${className}`} />
      {label}
    </span>
  );
}

function topTokenLabel(row) {
  const first = row.top_logprobs?.[0]?.[0];
  if (!first) return "n/a";
  return `${JSON.stringify(first.token)} (${fmt.format(first.logprob)})`;
}

function History({ rows, sortHistory, setSortHistory }) {
  const sorted = [...rows].sort((a, b) => {
    if (sortHistory === "accuracy") return b.avg_accuracy - a.avg_accuracy;
    if (sortHistory === "error") return a.error_mean - b.error_mean;
    if (sortHistory === "streak") return (b.longest_correct_streak ?? -1) - (a.longest_correct_streak ?? -1);
    if (sortHistory === "test_date") return dateValue(b.test_date).localeCompare(dateValue(a.test_date));
    if (sortHistory === "release_date") return dateValue(b.release_date).localeCompare(dateValue(a.release_date));
    return a.model_name.localeCompare(b.model_name);
  });
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
          <table className="min-w-full text-left text-sm">
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
                  <td className="px-4 py-3">{fmt.format(row.error_mean)}</td>
                  <td className="px-4 py-3">{streak(row.longest_correct_streak)}</td>
                  <td className="px-4 py-3">{fmt.format(row.error_median)}</td>
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

function About() {
  const part2Count = combinedLeaderboard.filter((row) => row.benchmark === "Part 2 - 2026").length;
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
              This app presents the Repetitive Sums benchmark across the new Part 2 run and the original benchmark archive.
              Every benchmark asks models to answer repeated additions of one, with expected answers from 2 through 100.
              The combined leaderboard ranks all models together while preserving which benchmark each row came from, and the Matrix view lets you inspect every answer as a green or red tile.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Total Models" value={combinedLeaderboard.length} />
        <Metric label="Part 2 Models" value={part2Count} />
        <Metric label="Original Models" value={originalCount} />
        <Metric label="With Row Detail" value={detailCount} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-md border border-slate-200 bg-white p-5">
          <h3 className="text-base font-semibold">Part 2 - 2026</h3>
          <div className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
            <p>Models: gpt-5.4-mini, gpt-5.4, and gpt-5.5. The pro variant is intentionally excluded.</p>
            <p>Endpoint: OpenAI Responses API with output text logprobs included and top token alternatives captured.</p>
            <p>Detail: all 99 row-level answers are stored for every Part 2 model, including parsed answer, correctness, latency, token logprobs, and top-token alternatives.</p>
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-5">
          <h3 className="text-base font-semibold">Original Benchmark Archive</h3>
          <div className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
            <p>The archive contributes {originalCount} previous leaderboard rows from the original Repetitive Sums benchmark.</p>
            <p>{detailCount - part2Count} archived models include per-expected-value correctness recovered from the archived PNG charts.</p>
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

createRoot(document.getElementById("root")).render(
  <HashRouter>
    <App />
  </HashRouter>,
);
