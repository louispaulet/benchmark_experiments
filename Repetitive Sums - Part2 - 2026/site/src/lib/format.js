const fmt = new Intl.NumberFormat("en", { maximumFractionDigits: 2 });

export function formatNumber(value) {
  return fmt.format(value);
}

export function pct(value) {
  return `${formatNumber(value)}%`;
}

export function streak(value) {
  return value === null || value === undefined ? "n/a" : value;
}

export function dateValue(value) {
  return value || "n/a";
}

export function displayDate(value) {
  if (!value) return "n/a";
  return value.includes("T") ? value.slice(0, 10) : value;
}

export function benchmarkLabel(value) {
  if (value === "Part 2 - 2026") return "Detailed benchmark run";
  if (value?.startsWith("Original")) return "Benchmark archive";
  return value || "Benchmark run";
}

export function topTokenLabel(row) {
  const first = row.top_logprobs?.[0]?.[0];
  if (!first) return "n/a";
  return `${JSON.stringify(first.token)} (${formatNumber(first.logprob)})`;
}
