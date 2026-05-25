import React from "react";

export default function LegendSwatch({ label, className }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block size-3 rounded-[3px] ring-1 ring-inset ${className}`} />
      {label}
    </span>
  );
}
