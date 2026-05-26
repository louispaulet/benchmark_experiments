import React from "react";

export default function StatPanel({ label, value, detail }) {
  return (
    <div className="stat-panel">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {detail && <div className="stat-detail" title={typeof detail === "string" ? detail : undefined}>{detail}</div>}
    </div>
  );
}
