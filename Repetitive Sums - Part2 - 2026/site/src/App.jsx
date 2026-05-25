import React, { useMemo, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import AppHeader from "./components/AppHeader";
import {
  allResults,
  buildMatrixRows,
  combinedLeaderboard,
  getRowsForModel,
  getSummaryForModel,
} from "./lib/benchmarkData";
import About from "./views/About";
import History from "./views/History";
import Leaderboard from "./views/Leaderboard";
import Matrix from "./views/Matrix";
import Results from "./views/Results";

export default function App() {
  const navigate = useNavigate();
  const [selectedModel, setSelectedModel] = useState(combinedLeaderboard[0]?.model_name ?? "");
  const [sortMatrix, setSortMatrix] = useState("accuracy");
  const [sortHistory, setSortHistory] = useState("accuracy");
  const matrixRows = useMemo(() => buildMatrixRows(sortMatrix), [sortMatrix]);
  const currentRows = useMemo(() => getRowsForModel(selectedModel), [selectedModel]);
  const selectedSummary = getSummaryForModel(selectedModel);
  const historyRows = combinedLeaderboard.filter((row) => row.benchmark?.startsWith("Original"));
  const bestAccuracy = Math.max(...combinedLeaderboard.map((row) => row.avg_accuracy));

  const openModel = (modelName) => {
    setSelectedModel(modelName);
    navigate("/results");
  };

  return (
    <main className="min-h-screen bg-[#f6f8f5] text-ink">
      <AppHeader modelCount={combinedLeaderboard.length} rowCount={allResults.length} bestAccuracy={bestAccuracy} />

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Leaderboard selectedModel={selectedModel} openModel={openModel} />} />
          <Route
            path="/results"
            element={
              <Results
                rows={currentRows}
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                summary={selectedSummary}
              />
            }
          />
          <Route path="/matrix" element={<Matrix rows={matrixRows} sortMatrix={sortMatrix} setSortMatrix={setSortMatrix} />} />
          <Route
            path="/history"
            element={<History rows={historyRows} sortHistory={sortHistory} setSortHistory={setSortHistory} />}
          />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </section>
    </main>
  );
}
