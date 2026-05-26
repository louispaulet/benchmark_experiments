import React from "react";

export default function Metric({ label, value }) {
  return (
    <div className="header-metric">
      <div className="header-metric-value">{value}</div>
      <div className="header-metric-label">{label}</div>
    </div>
  );
}
