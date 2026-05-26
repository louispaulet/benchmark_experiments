import React from "react";
import { ChevronDown } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Panel from "../components/Panel";
import { dateValue, formatNumber, pct, streak } from "../lib/format";
import { compareModelSizeDesc } from "../lib/modelSizes";

export function sortHistoryRows(rows, sortHistory) {
  return [...rows].sort((a, b) => {
    if (sortHistory === "accuracy") return b.avg_accuracy - a.avg_accuracy;
    if (sortHistory === "model_size") return compareModelSizeDesc(a, b);
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
      <PageHeader
        title="Previous Benchmarks"
        description="Original archive rows, sortable alongside current detailed runs."
        action={
          <label className="control-with-icon">
            <ChevronDown size={18} className="text-steel" />
            <select
              value={sortHistory}
              onChange={(event) => setSortHistory(event.target.value)}
              className="control-select"
            >
              <option value="accuracy">Accuracy</option>
              <option value="model_size">Model size</option>
              <option value="streak">Longest streak</option>
              <option value="test_date">Test date</option>
              <option value="release_date">Release date</option>
              <option value="error">Mean error</option>
              <option value="model">Model</option>
            </select>
          </label>
        }
      />
      <Panel className="overflow-hidden p-0">
        <div className="table-scroll">
          <table className="data-table" aria-label="Previous benchmarks">
            <thead>
              <tr>
                <th>Model</th>
                <th>Size</th>
                <th>Test Date</th>
                <th>Release Date</th>
                <th>Accuracy</th>
                <th>Mean Error</th>
                <th>Longest Streak</th>
                <th>Median Error</th>
                <th>Max Error</th>
                <th>Failures</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr key={row.model_name}>
                  <td className="model-name max-w-64" title={row.date_source || row.model_name}>{row.model_name}</td>
                  <td title={row.model_size_note}>{row.model_size_label}</td>
                  <td>{dateValue(row.test_date)}</td>
                  <td>{dateValue(row.release_date)}</td>
                  <td>{pct(row.avg_accuracy)}</td>
                  <td>{formatNumber(row.error_mean)}</td>
                  <td>{streak(row.longest_correct_streak)}</td>
                  <td>{formatNumber(row.error_median)}</td>
                  <td>{row.error_max}</td>
                  <td>{row.parsing_failure_count}</td>
                  <td>{row.has_detail ? "rows" : "summary"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
