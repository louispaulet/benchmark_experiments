import React from "react";
import { formatNumber } from "../lib/format";

export default function BarList({ items, valueKey = "value", labelKey = "label", maxValue, suffix = "", tone = "moss" }) {
  const maximum = maxValue ?? Math.max(1, ...items.map((item) => Number(item[valueKey]) || 0));
  const barClass = tone === "coral" ? "bg-coral" : tone === "steel" ? "bg-steel" : "bg-moss";

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const value = Number(item[valueKey]) || 0;
        return (
          <div key={item[labelKey]} className="space-y-1">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0 truncate font-medium text-ink">{item[labelKey]}</span>
              <span className="shrink-0 text-slate-600">{formatNumber(value)}{suffix}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-sm bg-slate-100">
              <div className={`h-full ${barClass}`} style={{ width: `${Math.max(0, Math.min(100, (value / maximum) * 100))}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
