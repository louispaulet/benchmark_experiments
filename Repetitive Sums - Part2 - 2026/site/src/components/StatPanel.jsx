import React from "react";

export default function StatPanel({ label, value, detail }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-ink">{value}</div>
      {detail && <div className="mt-1 text-sm text-slate-600">{detail}</div>}
    </div>
  );
}
