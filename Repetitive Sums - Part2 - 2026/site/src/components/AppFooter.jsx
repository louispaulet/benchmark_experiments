import React from "react";
import { Github } from "lucide-react";

export default function AppFooter() {
  return (
    <footer className="app-footer">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <span>Repetitive Sums Benchmark</span>
        <a
          href="https://github.com/louispaulet/benchmark_experiments"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 font-medium text-steel transition hover:text-ink"
        >
          <Github size={17} />
          <span>louispaulet/benchmark_experiments</span>
        </a>
      </div>
    </footer>
  );
}
