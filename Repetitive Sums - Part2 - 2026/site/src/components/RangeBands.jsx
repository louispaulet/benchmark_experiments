import React from "react";
import { pct } from "../lib/format";

export default function RangeBands({ ranges }) {
  return (
    <div className="range-bands">
      {ranges.map((range) => (
        <div key={range.id} className="range-band">
          <div className="range-band-meta">
            <span>{range.label}</span>
            <span>{range.accuracy === null ? "n/a" : pct(range.accuracy)}</span>
          </div>
          <div className="range-band-track">
            <div className="range-band-fill" style={{ width: `${range.accuracy ?? 0}%` }} />
          </div>
          <div className="range-band-detail">
            {range.total ? `${range.correct}/${range.total} correct` : "No row detail"}
          </div>
        </div>
      ))}
    </div>
  );
}
