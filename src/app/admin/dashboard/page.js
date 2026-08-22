"use client";

import { get, post } from "@/app/service";
import { useState } from "react";
import Modal from "./modal";

const trackMap = {
  1: "Path A: The Citadel",
  2: "Path B: The Sovereign",
  3: "Path C: The Nexus",
  4: "Path D: The Frontier",
};

export default function Dashboard() {
  const [track, setTrack] = useState("");
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Team modal
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamTrack, setTeamTrack] = useState("");

  // Clue modal
  const [isClueModalOpen, setIsClueModalOpen] = useState(false);
  const [clueTrack, setClueTrack] = useState("1");
  const [clueNo, setClueNo] = useState("");
  const [clueName, setClueName] = useState("");
  const [clueText, setClueText] = useState("");
  const [storyline, setStoryline] = useState("");

  const [points, setPoints] = useState([
    { lat: "", lng: "" },
    { lat: "", lng: "" },
    { lat: "", lng: "" },
    { lat: "", lng: "" },
  ]);

  const [response, setResponse] = useState(null);
  const [responseType, setResponseType] = useState("success");

  const showResponse = (message, type = "success") => {
    setResponse(message);
    setResponseType(type);

    setTimeout(() => {
      setResponse(null);
    }, 5000);
  };

  // Fetch teams
  const fetchTeams = async (selectedTrack) => {
    const token = localStorage.getItem("token");

    if (!token) {
      showResponse(
        "Admin session not found. Please login again.",
        "error"
      );
      return;
    }

    setTrack(selectedTrack);
    setTeams([]);
    setIsLoading(true);
    setResponse(null);

    try {
      const data = await get(
        `admin/teams?track=${selectedTrack}`
      );

      console.log("Teams response:", data);

      if (data?.success === false) {
        throw new Error(
          data.message || "Failed to fetch teams"
        );
      }

      const fetchedTeams = Array.isArray(data)
        ? data
        : data?.data || [];

      setTeams(fetchedTeams);
    } catch (error) {
      console.error("Error fetching teams:", error);
      setTeams([]);

      showResponse(
        error.message || "Could not fetch teams",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Mark team as arrived at Old Mess
  const finishTeam = async (team) => {
    const confirmed = window.confirm(
      `Confirm that ${team.name} has physically arrived at Old Mess?`
    );

    if (!confirmed) return;

    try {
      const res = await post("admin/finish-team", {
        credential: team.credential,
      });

      if (res.success) {
        showResponse(res.message);

        // Refresh the current track immediately
        if (track) {
          fetchTeams(track);
        }
      } else {
        showResponse(
          res.message || "Failed to finish team.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error finishing team:", error);

      showResponse(
        error.message || "Failed to finish team.",
        "error"
      );
    }
  };

  // Create team
  const createTeam = async () => {
    if (!teamName.trim() || !teamTrack) {
      showResponse(
        "Please enter team name and select a track.",
        "error"
      );
      return;
    }

    try {
      const res = await post("admin/new", {
        track: teamTrack,
        name: teamName.trim(),
      });

      if (res.success) {
        showResponse(
          `Team created successfully. Credential: ${res.data.team.credential}`
        );

        setTeamName("");
        setTeamTrack("");
        setIsTeamModalOpen(false);

        if (track === res.data.team.track) {
          fetchTeams(track);
        }
      } else {
        showResponse(
          res.message || "Error creating team.",
          "error"
        );
      }
    } catch (error) {
      console.error(error);

      showResponse(
        error.message || "Error creating team.",
        "error"
      );
    }
  };

  // Update GPS point
  const updatePoint = (index, field, value) => {
    setPoints((prev) => {
      const updated = [...prev];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return updated;
    });
  };

  // Create clue
  const createClue = async () => {
    if (!clueTrack || !clueNo || !clueText.trim()) {
      showResponse(
        "Please select a track and enter clue number and clue text.",
        "error"
      );
      return;
    }

    const formattedPoints = points.map((point) => ({
      lat: Number(point.lat),
      lng: Number(point.lng),
    }));

    const invalidPoint = formattedPoints.some(
      (point) =>
        Number.isNaN(point.lat) ||
        Number.isNaN(point.lng)
    );

    if (invalidPoint) {
      showResponse(
        "Please enter valid latitude and longitude for all 4 points.",
        "error"
      );
      return;
    }

    try {
      const res = await post("admin/clue", {
        track: clueTrack,
        clueno: Number(clueNo),
        storyline,
        clue: clueText,
        name: clueName,
        co1: [
          Number(points[0].lat),
          Number(points[0].lng),
        ],
        co2: [
          Number(points[1].lat),
          Number(points[1].lng),
        ],
        co3: [
          Number(points[2].lat),
          Number(points[2].lng),
        ],
        co4: [
          Number(points[3].lat),
          Number(points[3].lng),
        ],
      });

      if (res.success) {
        showResponse(
          `Clue ${clueNo} added successfully to ${trackMap[clueTrack]}.`
        );

        setClueNo("");
        setClueName("");
        setClueText("");
        setStoryline("");

        setPoints([
          { lat: "", lng: "" },
          { lat: "", lng: "" },
          { lat: "", lng: "" },
          { lat: "", lng: "" },
        ]);

        setIsClueModalOpen(false);
      } else {
        showResponse(
          res.message || "Error creating clue.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error creating clue:", error);

      showResponse(
        error.message || "Error creating clue.",
        "error"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">

      {/* Header */}
      <div className="mb-8 rounded-xl bg-white p-6 shadow">
        <h1 className="text-4xl font-extrabold text-gray-800">
          Admin Dashboard
        </h1>

        <p className="mt-2 text-gray-500">
          Manage teams, tracks and clues
        </p>
      </div>

      {/* Response */}
      {response && (
        <div
          className={`mb-6 rounded-lg border p-4 font-semibold ${
            responseType === "success"
              ? "border-green-300 bg-green-100 text-green-700"
              : "border-red-300 bg-red-100 text-red-700"
          }`}
        >
          {response}
        </div>
      )}

      {/* Action buttons */}
      <div className="mb-8 flex flex-wrap gap-4">
        <button
          type="button"
          className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white shadow transition hover:bg-green-700"
          onClick={() => setIsTeamModalOpen(true)}
        >
          + Create New Team
        </button>

        <button
          type="button"
          className="rounded-lg bg-purple-600 px-5 py-3 font-semibold text-white shadow transition hover:bg-purple-700"
          onClick={() => setIsClueModalOpen(true)}
        >
          + Add New Clue
        </button>
      </div>

      {/* Track selector */}
      <div className="mb-8 rounded-xl bg-white p-6 shadow">
        <h2 className="mb-5 text-2xl font-semibold text-gray-700">
          Select a Track
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Object.entries(trackMap).map(
            ([trackId, trackName]) => (
              <button
                key={trackId}
                type="button"
                onClick={() => fetchTeams(trackId)}
                disabled={isLoading}
                className={`
                  rounded-xl px-6 py-4
                  font-bold text-white
                  shadow-md transition-all duration-200
                  hover:scale-[1.02] hover:shadow-lg
                  disabled:cursor-not-allowed disabled:opacity-60
                  ${
                    track === trackId
                      ? "ring-4 ring-offset-2"
                      : ""
                  }
                  ${
                    trackId === "1"
                      ? "bg-blue-600 hover:bg-blue-700 ring-blue-300"
                      : trackId === "2"
                      ? "bg-green-600 hover:bg-green-700 ring-green-300"
                      : trackId === "3"
                      ? "bg-purple-600 hover:bg-purple-700 ring-purple-300"
                      : "bg-orange-600 hover:bg-orange-700 ring-orange-300"
                  }
                `}
              >
                {trackName}
              </button>
            )
          )}
        </div>
      </div>

      {/* Teams */}
      <div className="rounded-xl bg-white p-6 shadow">
        <h3 className="mb-4 text-xl font-semibold text-gray-700">
          {track
            ? `Teams for ${trackMap[track]}`
            : "Select a track to view teams"}
        </h3>

        {isLoading ? (
          <p className="text-gray-600">
            Loading teams...
          </p>
        ) : teams.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-600">
                  <th className="p-3">Team</th>
                  <th className="p-3">Credential</th>
                  <th className="p-3">Current Clue</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {teams.map((team) => (
                  <tr
                    key={team.id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="p-3 font-medium text-gray-800">
                      {team.name}
                    </td>

                    <td className="p-3">
                      <code className="rounded bg-gray-100 px-2 py-1 text-black">
                        {team.credential}
                      </code>
                    </td>

                    <td className="p-3 text-gray-800">
                      {team.clueno}
                    </td>

                    <td className="p-3 text-center">
                      {team.finished ? (
                        team.qualified ? (
                          <span className="font-bold text-green-600">
                            QUALIFIED
                          </span>
                        ) : (
                          <span className="font-bold text-gray-500">
                            FINISHED
                          </span>
                        )
                      ) : team.returning ? (
                        <span className="font-bold text-orange-600">
                          RETURNED TO OLD MESS
                        </span>
                      ) : (
                        <span className="font-bold text-blue-600">
                          IN PROGRESS
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-center">
                      {team.finished ? (
                        <span className="text-sm text-gray-400">
                          Completed
                        </span>
                      ) : team.returning ? (
                        <button
                          type="button"
                          onClick={() => finishTeam(team)}
                          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
                        >
                          Mark Arrived
                        </button>
                      ) : (
                        <span className="text-sm text-gray-400">
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : track ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-600">
            No teams found for {trackMap[track]}.
          </div>
        ) : null}
      </div>

      {/* CREATE TEAM MODAL */}
      <Modal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
      >
        <h2 className="mb-5 text-2xl font-bold text-black">
          Create New Team
        </h2>

        <input
          type="text"
          placeholder="Enter Team Name"
          className="mb-4 w-full rounded border px-4 py-3 text-black outline-none focus:ring-2 focus:ring-green-500"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
        />

        <select
          className="mb-4 w-full rounded border px-4 py-3 text-black outline-none focus:ring-2 focus:ring-green-500"
          value={teamTrack}
          onChange={(e) => setTeamTrack(e.target.value)}
        >
          <option value="">Select Track</option>

          {Object.entries(trackMap).map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
            onClick={() => setIsTeamModalOpen(false)}
          >
            Cancel
          </button>

          <button
            type="button"
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            onClick={createTeam}
          >
            Create Team
          </button>
        </div>
      </Modal>

      {/* CREATE CLUE MODAL */}
      <Modal
        isOpen={isClueModalOpen}
        onClose={() => setIsClueModalOpen(false)}
      >
        <div className="max-h-[85vh] overflow-y-auto pr-2">
          <h2 className="mb-5 text-2xl font-bold text-black">
            Add New Clue
          </h2>

          <select
            className="mb-4 w-full rounded border px-4 py-3 text-black"
            value={clueTrack}
            onChange={(e) => setClueTrack(e.target.value)}
          >
            <option value="">Select Track</option>

            {Object.entries(trackMap).map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="1"
            placeholder="Clue Number"
            className="mb-4 w-full rounded border px-4 py-3 text-black"
            value={clueNo}
            onChange={(e) => setClueNo(e.target.value)}
          />

          <input
            type="text"
            placeholder="Checkpoint Name (optional)"
            className="mb-4 w-full rounded border px-4 py-3 text-black"
            value={clueName}
            onChange={(e) => setClueName(e.target.value)}
          />

          <textarea
            placeholder="Enter storyline for this checkpoint"
            className="mb-4 min-h-32 w-full rounded border px-4 py-3 text-black"
            value={storyline}
            onChange={(e) => setStoryline(e.target.value)}
          />

          <textarea
            placeholder="Enter clue text"
            className="mb-6 min-h-28 w-full rounded border px-4 py-3 text-black"
            value={clueText}
            onChange={(e) => setClueText(e.target.value)}
          />

          <h3 className="mb-3 text-lg font-bold text-black">
            Geofence — 4 Corner Points
          </h3>

          <p className="mb-4 text-sm text-gray-500">
            Enter the latitude and longitude for all four
            corners of the rectangle.
          </p>

          {points.map((point, index) => (
            <div
              key={index}
              className="mb-4 rounded-lg border bg-gray-50 p-4"
            >
              <p className="mb-3 font-semibold text-black">
                Point {index + 1}
              </p>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <input
                  type="number"
                  step="any"
                  placeholder="Latitude"
                  className="rounded border px-3 py-2 text-black"
                  value={point.lat}
                  onChange={(e) =>
                    updatePoint(
                      index,
                      "lat",
                      e.target.value
                    )
                  }
                />

                <input
                  type="number"
                  step="any"
                  placeholder="Longitude"
                  className="rounded border px-3 py-2 text-black"
                  value={point.lng}
                  onChange={(e) =>
                    updatePoint(
                      index,
                      "lng",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
          ))}

          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
              onClick={() => setIsClueModalOpen(false)}
            >
              Cancel
            </button>

            <button
              type="button"
              className="rounded bg-purple-600 px-5 py-2 text-white hover:bg-purple-700"
              onClick={createClue}
            >
              Add Clue
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}