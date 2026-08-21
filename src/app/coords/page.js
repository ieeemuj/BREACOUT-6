"use client";

import { useState } from "react";

export default function CoordsPage() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });

        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const copyCoords = () => {
    if (!location) return;

    navigator.clipboard.writeText(
      `${location.lat}, ${location.lng}`
    );
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-950 text-white">
      <h1 className="text-3xl font-bold mb-8">
        Precise Coordinate Extractor
      </h1>

      <button
        onClick={getLocation}
        disabled={loading}
        className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500"
      >
        {loading ? "Getting GPS location..." : "Get My Coordinates"}
      </button>

      {error && (
        <p className="mt-6 text-red-400">
          {error}
        </p>
      )}

      {location && (
        <div className="mt-8 p-6 rounded-xl bg-gray-800 w-full max-w-md">
          <p className="mb-3">
            <strong>Latitude:</strong> {location.lat}
          </p>

          <p className="mb-3">
            <strong>Longitude:</strong> {location.lng}
          </p>

          <p className="mb-5">
            <strong>GPS Accuracy:</strong>{" "}
            ±{Math.round(location.accuracy)} meters
          </p>

          <button
            onClick={copyCoords}
            className="w-full px-4 py-2 rounded-lg bg-green-600"
          >
            Copy Coordinates
          </button>
        </div>
      )}
    </main>
  );
}