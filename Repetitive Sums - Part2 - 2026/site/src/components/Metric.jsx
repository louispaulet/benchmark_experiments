import React from "react";

export default function Metric({ label, value }) {
  return (
    <div className="min-w-24 rounded-md border border-slate-200 bg-mist px-3 py-2">
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-xs uppercase text-slate-500">{label}</div>
    </div>
  );
}
