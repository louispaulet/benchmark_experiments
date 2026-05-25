# Project Agent Instructions

- Always read this file before starting any task in this repository.
- Always commit and push changes, even if on main.

## Repetitive Sums Part 2 Site Structure

- The Vite app lives in `Repetitive Sums - Part2 - 2026/site`.
- `src/main.jsx` should stay limited to React root mounting and the router wrapper.
- `src/App.jsx` owns the app shell, shared route state, and route definitions.
- `src/views/` contains route-level screens: `Leaderboard`, `Results`, `Matrix`, `History`, and `About`.
- `src/components/` contains reusable UI pieces shared by views, such as the app header, metrics, and legend swatches.
- `src/lib/` contains pure formatting and benchmark data helpers; note that the root `.gitignore` ignores `lib/`, so new files under `site/src/lib/` may need `git add -f`.
- `src/data/` contains generated benchmark JSON inputs and should not be manually reshaped when working on UI structure.
- Frontend tests use Vitest, jsdom, and React Testing Library. Run `npm test` from `Repetitive Sums - Part2 - 2026/site`.
