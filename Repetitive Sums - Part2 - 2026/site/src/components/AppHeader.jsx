import React from "react";
import { Activity, BarChart3, Database, Home, Info, ListFilter } from "lucide-react";
import { NavLink } from "react-router-dom";
import { pct } from "../lib/format";
import Metric from "./Metric";

const tabs = [
  { path: "/", label: "Home", icon: Home },
  { path: "/leaderboard", label: "Leaderboard", icon: BarChart3 },
  { path: "/results", label: "Results", icon: Activity },
  { path: "/matrix", label: "Matrix", icon: ListFilter },
  { path: "/history", label: "History", icon: Database },
  { path: "/about", label: "About", icon: Info },
];

export default function AppHeader({ modelCount, rowCount, bestAccuracy }) {
  return (
    <header className="border-b border-slate-200 bg-white/90">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <NavLink to="/" className="inline-block rounded-sm text-ink transition hover:text-steel focus:outline-none focus:ring-2 focus:ring-steel focus:ring-offset-2">
              <h1 className="text-3xl font-semibold sm:text-4xl">Repetitive Sums Benchmark</h1>
            </NavLink>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Benchmark results for repetitive sums from 2 through 100 across current and archived model runs.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <Metric label="Models" value={modelCount} />
            <Metric label="Rows" value={rowCount} />
            <Metric label="Best" value={pct(bestAccuracy)} />
          </div>
        </div>
        <nav className="flex gap-2 overflow-x-auto">
          {tabs.map((route) => {
            const Icon = route.icon;
            return (
              <NavLink
                key={route.path}
                to={route.path}
                title={route.label}
                end={route.path === "/"}
                className={({ isActive }) => `inline-flex min-h-10 items-center gap-2 rounded-md border px-3 text-sm font-medium transition ${
                  isActive
                    ? "border-steel bg-steel text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-steel"
                }`}
              >
                <Icon size={17} />
                <span>{route.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
