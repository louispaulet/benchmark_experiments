import React from "react";

export default function DistributionStrip({ buckets }) {
  const total = buckets.reduce((sum, bucket) => sum + bucket.count, 0) || 1;

  return (
    <div className="space-y-3">
      <div className="flex h-4 overflow-hidden rounded-sm bg-slate-100">
        {buckets.map((bucket, index) => (
          <div
            key={bucket.label}
            title={`${bucket.label}: ${bucket.count}`}
            className={["bg-coral", "bg-[#d89a55]", "bg-steel", "bg-moss", "bg-[#24552b]"][index] ?? "bg-slate-400"}
            style={{ width: `${(bucket.count / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="grid gap-2 text-xs text-slate-600 sm:grid-cols-5">
        {buckets.map((bucket) => (
          <div key={bucket.label} className="flex justify-between gap-2 rounded-sm bg-slate-50 px-2 py-1">
            <span>{bucket.label}</span>
            <span className="font-semibold text-ink">{bucket.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
