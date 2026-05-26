import React from "react";
import { formatNumber } from "../lib/format";

export default function BarList({ items, valueKey = "value", labelKey = "label", maxValue, suffix = "", tone = "moss" }) {
  const maximum = maxValue ?? Math.max(1, ...items.map((item) => Number(item[valueKey]) || 0));
  const barClass = tone === "coral" ? "bar-fill-coral" : tone === "steel" ? "bar-fill-steel" : "bar-fill-moss";

  return (
    <div className="bar-list">
      {items.map((item) => {
        const value = Number(item[valueKey]) || 0;
        return (
          <div key={item[labelKey]} className="bar-row">
            <div className="bar-row-meta">
              <span className="bar-label" title={item[labelKey]}>{item[labelKey]}</span>
              <span className="bar-value">{formatNumber(value)}{suffix}</span>
            </div>
            <div className="bar-track">
              <div className={`bar-fill ${barClass}`} style={{ width: `${Math.max(0, Math.min(100, (value / maximum) * 100))}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
