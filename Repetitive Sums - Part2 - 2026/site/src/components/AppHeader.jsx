import React from "react";
import { Activity, BarChart3, Database, Home, Info, ListFilter, TrendingUp } from "lucide-react";
import { NavLink } from "react-router-dom";
import { pct } from "../lib/format";
import Metric from "./Metric";

const tabs = [
  { path: "/", label: "Home", icon: Home },
  { path: "/leaderboard", label: "Leaderboard", icon: BarChart3 },
  { path: "/results", label: "Results", icon: Activity },
  { path: "/matrix", label: "Matrix", icon: ListFilter },
  { path: "/insights", label: "Insights", icon: TrendingUp },
  { path: "/history", label: "History", icon: Database },
  { path: "/about", label: "About", icon: Info },
];

export default function AppHeader({ modelCount, rowCount, bestAccuracy }) {
  return (
    <header className="app-header">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <NavLink to="/" className="inline-block rounded-sm text-ink transition hover:text-steel focus:outline-none focus:ring-2 focus:ring-steel focus:ring-offset-2">
              <h1 className="app-title">Repetitive Sums Benchmark</h1>
            </NavLink>
            <p className="app-subtitle">
              Benchmark results for repetitive sums from 2 through 100 across current and archived model runs.
            </p>
          </div>
          <div className="header-metrics">
            <Metric label="Models" value={modelCount} />
            <Metric label="Rows" value={rowCount} />
            <Metric label="Best" value={pct(bestAccuracy)} />
          </div>
        </div>
        <nav className="app-nav">
          {tabs.map((route) => {
            const Icon = route.icon;
            return (
              <NavLink
                key={route.path}
                to={route.path}
                title={route.label}
                end={route.path === "/"}
                className={({ isActive }) => `nav-pill ${
                  isActive
                    ? "nav-pill-active"
                    : "nav-pill-idle"
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
