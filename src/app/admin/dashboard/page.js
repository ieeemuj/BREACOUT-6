"use client";

import { get, post } from "@/app/service";
import { useState } from "react";
import Modal from "./modal";

const trackMap = {
  gr: "Gryffindor",
  hu: "Hufflepuff",
  sl: "Slytherin",
  re: "Ravenclaw",
}

export default function Dashboard() {
  const [track, setTrack] = useState("");
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamTrack, setTeamTrack] = useState("");
  const [response, setResponse] = useState(null);
  const [stopped, setStopped] = useState(false);

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
      const stopped = !!data[0]?.stopped;
      setTeams(data);
      setTrack(selectedTrack);
    } catch (error) {
      console.error("Error fetching teams:", error);
    } finally {
      setIsLoading(false);
    }
  };

  //Start Track
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

  //Stop Track
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

  //Modal
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  //Create new team
  const createTeam = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token not found, please login first");
      return;
    }

    try {
      const response = await post(`admin/new`, {
        track: teamTrack,
        name: teamName,
      });

      setResponse(`Credentials: ${response.data.team.credential}`);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating team:", error);
      setResponse("Error creating team");
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 shadow rounded-lg mb-8">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
          Dashboard
        </h1>
      </div>

      {/* Create New Team Button */}
      <button
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition mb-6"
        onClick={openModal}
      >
        Create New Team
      </button>

      {response && <p className="text-green-500">{response}</p>}

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <h2 className="text-2xl font-bold mb-4 text-black ">Create New Team</h2>
        <input
          type="text"
          placeholder="Enter Team Name"
          className="border px-4 py-2 mb-4 w-full text-black"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter Team Track"
          className="border px-4 py-2 mb-4 w-full text-black"
          value={teamTrack}
          onChange={(e) => setTeamTrack(e.target.value)}
        />
        <div className="flex justify-end space-x-4">
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={createTeam}
          >
            Create
          </button>
        </div>
      </Modal>

      {/* Tracks */}
      <div className="bg-white p-6 shadow rounded-lg mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Select a Track
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            onClick={() => fetchTeams("gr")}
          >
            Get Teams for Track GR
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            onClick={() => fetchTeams("hu")}
          >
            Get Teams for Track HU
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            onClick={() => fetchTeams("sl")}
          >
            Get Teams for Track SL
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            onClick={() => fetchTeams("re")}
          >
            Get Teams for Track RE
          </button>
        </div>
      </div>

      {/* Teams List */}
      <div className="bg-white p-6 shadow rounded-lg">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Teams for Track {track.toUpperCase()}:
        </h3>
        {isLoading ? (
          <p className="text-gray-600">Loading teams...</p>
        ) : teams.length > 0 ? (
          <ul className="list-disc list-inside bg-white p-4 rounded shadow-md">
            {teams.map((team, index) => (
              <li key={index} className="flex flex-row items-center justify-between w-full text-gray-800">
                <div>Team {team.name} : <code>{team.credential}</code></div>
                <div>{team.clueno}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No teams found for this track.</p>
        )}
      </div>

      {/* Start/Stop Track */}
      {track && (
        <>
          <h3 className="text-lg font-semibold text-gray-700 mt-6">
            Start/Stop <strong>{trackMap[track]}</strong> Track
          </h3>
          <div className="flex gap-4">
            <button
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
              disabled={!stopped}
              onClick={startTrack}
            >
              Start Track
            </button>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition "
              disabled={stopped}
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
