import React from "react";
import Leaderboard from "./Leaderboard";
import Matrix from "./Matrix";

export default function Home({ selectedModel, openModel, rows, sortMatrix, setSortMatrix }) {
  return (
    <div className="space-y-8">
      <Matrix rows={rows} sortMatrix={sortMatrix} setSortMatrix={setSortMatrix} />
      <Leaderboard selectedModel={selectedModel} openModel={openModel} />
    </div>
  );
}
