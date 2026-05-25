import React from "react";
import { HashRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import Results from "./views/Results";

afterEach(() => {
  cleanup();
  window.location.hash = "";
});

function renderApp(route = "/") {
  window.location.hash = route;
  return render(
    <HashRouter>
      <App />
    </HashRouter>,
  );
}

function firstBodyRow(tableName) {
  const table = screen.getByRole("table", { name: tableName });
  return within(table).getAllByRole("row").at(1);
}

describe("App", () => {
  it("renders the app header, navigation, and homepage sections in order", () => {
    renderApp("/");

    expect(screen.getByRole("heading", { name: "Repetitive Sums Benchmark" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Repetitive Sums Benchmark" })).toHaveAttribute("href", "#/");
    expect(screen.getByRole("link", { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /leaderboard/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /louispaulet\/benchmark_experiments/i })).toHaveAttribute(
      "href",
      "https://github.com/louispaulet/benchmark_experiments",
    );
    const matrixHeading = screen.getByRole("heading", { name: "Dot Matrix" });
    const leaderboardHeading = screen.getByRole("heading", { name: "Combined Leaderboard" });
    expect(matrixHeading.compareDocumentPosition(leaderboardHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Accuracy Spread" })).toBeInTheDocument();
  });

  it("returns home when the benchmark title is clicked", async () => {
    const user = userEvent.setup();
    renderApp("/matrix");

    await user.click(screen.getByRole("link", { name: "Repetitive Sums Benchmark" }));

    expect(window.location.hash).toBe("#/");
    expect(screen.getByRole("heading", { name: "Dot Matrix" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Combined Leaderboard" })).toBeInTheDocument();
  });

  it("opens model results when a leaderboard row is clicked", async () => {
    const user = userEvent.setup();
    renderApp("/");

    const table = screen.getByRole("table", { name: "Combined leaderboard" });
    await user.click(within(table).getByText("gpt-5.5"));

    expect(screen.getByRole("heading", { name: "Model Results" })).toBeInTheDocument();
    expect(screen.getByText("Detailed row-level answers include Responses API token logprobs and top token alternatives.")).toBeInTheDocument();
    expect(window.location.hash).toBe("#/results");
  });

  it("sorts the leaderboard by estimated model size", async () => {
    const user = userEvent.setup();
    renderApp("/leaderboard");

    expect(within(firstBodyRow("Combined leaderboard")).getByText("gpt-5.4")).toBeInTheDocument();

    await user.selectOptions(screen.getByRole("combobox"), "model_size");

    const firstSizeRow = firstBodyRow("Combined leaderboard");
    expect(within(firstSizeRow).getByText("~2.2T")).toBeInTheDocument();
    expect(within(firstSizeRow).getByText("gpt-5.5")).toBeInTheDocument();
  });

  it("shows the selected model size in model results", () => {
    renderApp("/results");

    expect(screen.getByText("Model Size")).toBeInTheDocument();
    expect(screen.getByText("~1.8T")).toBeInTheDocument();
  });

  it("renders historical result messaging for archived detail rows", async () => {
    const user = userEvent.setup();
    renderApp("/results");

    await user.selectOptions(screen.getByRole("combobox"), "claude-3-opus-20240229");

    expect(screen.getByRole("heading", { name: "Row-Level Historical Results" })).toBeInTheDocument();
    expect(screen.getByText("Historical correctness positions are available for this model from the archived PNG charts. Answers and logprob columns are unavailable for the original runs.")).toBeInTheDocument();
  });

  it("renders summary-only messaging for historical rows without details", async () => {
    render(
      <Results
        rows={[]}
        selectedModel="summary-only-model"
        setSelectedModel={() => {}}
        summary={{ benchmark: "Original Repetitive Sums Benchmark Dataset", avg_accuracy: 12.5, longest_correct_streak: null, parsing_failure_count: 0 }}
      />,
    );

    expect(screen.getByText("Only the historical leaderboard summary is available for this model.")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /Row-Level/ })).not.toBeInTheDocument();
  });

  it("renders the matrix and changes ordering when the sort select changes", async () => {
    const user = userEvent.setup();
    renderApp("/matrix");

    expect(screen.getByText(/36 models · 99 questions per model/)).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Model correctness dot matrix" })).toBeInTheDocument();

    const firstAccuracyRow = firstBodyRow("Model correctness dot matrix");
    expect(within(firstAccuracyRow).getByText("gpt-5.5")).toBeInTheDocument();

    await user.selectOptions(screen.getByRole("combobox"), "release_date");

    const firstReleaseDateRow = firstBodyRow("Model correctness dot matrix");
    expect(within(firstReleaseDateRow).getByText("gpt-5.4")).toBeInTheDocument();

    await user.selectOptions(screen.getByRole("combobox"), "model_size");

    const firstSizeRow = firstBodyRow("Model correctness dot matrix");
    expect(within(firstSizeRow).getByText("claude-3-opus-20240229")).toBeInTheDocument();
  });

  it("sorts history rows by the selected criterion", async () => {
    const user = userEvent.setup();
    renderApp("/history");

    expect(screen.getByRole("heading", { name: "Previous Benchmarks" })).toBeInTheDocument();
    expect(within(firstBodyRow("Previous benchmarks")).getByText("claude-3-opus-20240229")).toBeInTheDocument();

    await user.selectOptions(screen.getByRole("combobox"), "model");

    expect(within(firstBodyRow("Previous benchmarks")).getByText("claude-3-haiku-20240307")).toBeInTheDocument();

    await user.selectOptions(screen.getByRole("combobox"), "model_size");

    expect(within(firstBodyRow("Previous benchmarks")).getByText("claude-3-opus-20240229")).toBeInTheDocument();
  });

  it("redirects unknown routes back to the homepage", () => {
    renderApp("/missing");

    expect(screen.getByRole("heading", { name: "Dot Matrix" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Combined Leaderboard" })).toBeInTheDocument();
  });
});
