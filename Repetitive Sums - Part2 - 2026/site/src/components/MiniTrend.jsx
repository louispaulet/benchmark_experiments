import React from "react";

export default function MiniTrend({ points, height = 44 }) {
  const width = 140;
  const usableHeight = height - 8;
  const safePoints = points.length ? points : [0];
  const max = Math.max(100, ...safePoints);
  const step = safePoints.length > 1 ? width / (safePoints.length - 1) : width;
  const path = safePoints
    .map((point, index) => {
      const x = index * step;
      const y = 4 + usableHeight - (point / max) * usableHeight;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-12 w-full" role="img" aria-label="Accuracy trend">
      <path d={path} fill="none" stroke="#43677a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
