import React from "react";
import { ChevronDown } from "lucide-react";
import LegendSwatch from "../components/LegendSwatch";
import { questionNumbers } from "../lib/benchmarkData";
import { displayDate, pct } from "../lib/format";

export default function Matrix({ rows, sortMatrix, setSortMatrix }) {
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
