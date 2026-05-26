import React from "react";
import { pct } from "../lib/format";

export default function CompactRangeBars({ ranges }) {
  if (!ranges?.length) return <span className="text-slate-500">n/a</span>;

  return (
    <div className="compact-ranges" aria-label="Range accuracy summary">
      {ranges.map((range) => (
        <div key={range.id} className="compact-range" title={`${range.label}: ${range.accuracy === null ? "n/a" : pct(range.accuracy)} · ${range.correct}/${range.total} correct`}>
          <div className="compact-range-meta">
            <span>{range.label}</span>
            <span>{range.accuracy === null ? "n/a" : pct(range.accuracy)}</span>
          </div>
          <div className="compact-range-track">
            <div className="compact-range-fill" style={{ width: `${range.accuracy ?? 0}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
