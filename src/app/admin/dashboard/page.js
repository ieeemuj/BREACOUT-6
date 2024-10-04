"use client";

import { get, post } from "@/app/service";
import { useState } from "react";

export default function Dashboard() {
  const [track, setTrack] = useState("");
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch teams
  const fetchTeams = async (selectedTrack) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token not found, please login first");
      return;
    }

    setIsLoading(true);
    try {
      const data = await get(`admin/teams?track=${selectedTrack}`);
      setTeams(data);
      setTrack(selectedTrack);
    } catch (error) {
      console.error("Error fetching teams:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startTrack = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token not found, please login first");
      return;
    }

    try {
      await post(`admin/start`, { track });

      console.log(`${track} started successfully`);
    } catch (error) {
      console.error("Error starting track:", error);
    }
  };

  const stopTrack = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token not found, please login first");
      return;
    }

    try {
      await post(`admin/stop`, { track });

      console.log(`${track} stopped successfully`);
    } catch (error) {
      console.error("Error stopping track:", error);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        Select a Track
      </h2>
      <div className=" mb-6 ">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition mb-2 mx-3"
          onClick={() => fetchTeams("gr")}
        >
          Get Teams for Track GR
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition mb-2 mx-3"
          onClick={() => fetchTeams("hu")}
        >
          Get Teams for Track HU
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition mb-2 mx-3"
          onClick={() => fetchTeams("sl")}
        >
          Get Teams for Track SL
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition mb-2 mx-3"
          onClick={() => fetchTeams("re")}
        >
          Get Teams for Track RE
        </button>
      </div>

      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        Teams for Track {track.toUpperCase()}:
      </h3>
      {isLoading ? (
        <p className="text-gray-600">Loading teams...</p>
      ) : (
        <ul className="list-disc list-inside bg-white p-4 rounded shadow-md">
          {teams.map((team, index) => (
            <li key={index} className="text-gray-800">
              {team.name} - On Clue no {team.clueno}
            </li>
          ))}
        </ul>
      )}

      {track && (
        <>
          <h3 className="text-lg font-semibold text-gray-700 mt-6">
            Start/Stop Track {track.toUpperCase()}
          </h3>
          <div className="space-x-4 mt-4">
            <button
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
              onClick={startTrack}
            >
              Start Track
            </button>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition "
              onClick={stopTrack}
            >
              Stop Track
            </button>
          </div>
        </>
      )}
    </div>
  );
}
