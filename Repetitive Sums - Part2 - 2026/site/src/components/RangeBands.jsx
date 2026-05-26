import React from "react";
import { pct } from "../lib/format";

export default function RangeBands({ ranges }) {
  return (
    <div className="grid gap-2 sm:grid-cols-4">
      {ranges.map((range) => (
        <div key={range.id} className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between gap-2 text-xs font-semibold uppercase text-slate-500">
            <span>{range.label}</span>
            <span>{range.accuracy === null ? "n/a" : pct(range.accuracy)}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-sm bg-white ring-1 ring-slate-200">
            <div className="h-full bg-moss" style={{ width: `${range.accuracy ?? 0}%` }} />
          </div>
          <div className="mt-2 text-xs text-slate-600">
            {range.total ? `${range.correct}/${range.total} correct` : "No row detail"}
          </div>
        </div>
      ))}
    </div>
  );
}
