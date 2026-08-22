"use client";

import React, { useState, useEffect } from "react";
import { post, get } from "../service";
import { useRouter } from "next/navigation";

const themeData = {
  "1": {
    image:
      "https://images.prismic.io/ieeemuj/aL0komGNHVfTOvF9_re.png?auto=format,compress",
    bgColor: "bg-[#501D27]",
    borderColor: "border-[#D37E01]",
    logo: "/g-1.png",
    name: "Track #1",
  },
  "2": {
    image:
      "https://images.prismic.io/ieeemuj/aL0komGNHVfTOvF9_re.png?auto=format,compress",
    bgColor: "bg-[#D37E01]",
    borderColor: "border-[#D37E01]",
    logo: "/h-1.png",
    name: "Track #2",
  },
  "3": {
    image:
      "https://images.prismic.io/ieeemuj/aL0komGNHVfTOvF9_re.png?auto=format,compress",
    bgColor: "bg-[#063E53]",
    borderColor: "border-[#D37E01]",
    logo: "/r-1.png",
    name: "Track #3",
  },
  "4": {
    image:
      "https://images.prismic.io/ieeemuj/aL0komGNHVfTOvF9_re.png?auto=format,compress",
    bgColor: "bg-[#134731]",
    borderColor: "border-[#D37E01]",
    logo: "/s-1.png",
    name: "Track #4",
  },
};

const ThemePages = () => {
  const [theme, setTheme] = useState({});
  const [team, setTeam] = useState({});
  const [clue, setClue] = useState({});
  const [loading, setLoading] = useState(false);
  const [rendering, setRendering] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [finished, setFinished] = useState(false);
  const [message, setMessage] = useState(null);

  const router = useRouter();

  /*
  |--------------------------------------------------------------------------
  | SHOW MESSAGE
  |--------------------------------------------------------------------------
  */

  const showMessage = (type, text) => {
    setMessage({ type, text });

    setTimeout(() => {
      setMessage(null);
    }, 3500);
  };

  /*
  |--------------------------------------------------------------------------
  | LOAD TEAM AND CURRENT CLUE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    async function loadTeamData() {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          router.replace("/");
          return;
        }

        const storedTeam = JSON.parse(localStorage.getItem("team"));

        if (!storedTeam) {
          localStorage.removeItem("token");
          router.replace("/");
          return;
        }

        const res = await get("clue");

        if (!res.success) {
          console.error("CLUE RESPONSE:", res);

          localStorage.removeItem("token");
          localStorage.removeItem("team");
          localStorage.removeItem("clue");

          router.replace("/");
          return;
        }

        /*
        | If backend reports completion
        */

        if (res.completed) {
          setFinished(true);
          setTeam(storedTeam);

          showMessage(
            "success",
            res.message || "Congratulations! You have completed all checkpoints."
          );

          setRendering(false);
          return;
        }

        /*
        | Store current clue returned by backend
        */

        const currentClue = res.data?.clue;

        if (!currentClue) {
          console.error("No clue returned by backend:", res);
          setRendering(false);
          return;
        }

        localStorage.setItem("clue", JSON.stringify(currentClue));

        /*
        | Load theme
        */

        const selectedTheme = themeData[String(storedTeam.track)];

        if (!selectedTheme) {
          console.error(
            "Theme not found for track:",
            storedTeam.track
          );

          showMessage(
            "error",
            `Theme not found for track: ${storedTeam.track}`
          );

          setRendering(false);
          return;
        }

        setTeam(storedTeam);
        setClue(currentClue);
        setTheme(selectedTheme);
        setRendering(false);

      } catch (error) {
        console.error("Failed to load team data:", error);

        showMessage(
          "error",
          error.message || "Failed to load your checkpoint."
        );

        setRendering(false);
      }
    }

    loadTeamData();
  }, [router]);

  /*
  |--------------------------------------------------------------------------
  | COUNTDOWN
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (countdown <= 0) return;

    const interval = setInterval(() => {
      setCountdown((previous) => previous - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown]);

  /*
  |--------------------------------------------------------------------------
  | CHECK LOCATION
  |--------------------------------------------------------------------------
  */

  async function checkLocation() {
    if (!navigator.geolocation) {
      showMessage(
        "error",
        "Your browser does not support location services."
      );
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          console.log("GPS location:", lat, lng);

          const res = await post("clue/submit", {
            lat,
            lan: lng,
          });

          console.log("LOCATION RESPONSE:", res);

          /*
          |--------------------------------------------------------------------------
          | SUCCESS
          |--------------------------------------------------------------------------
          */

          if (res.success) {
            /*
            | Hunt completed
            */

            if (res.completed) {
              setFinished(true);

              showMessage(
                "success",
                res.message ||
                  "Congratulations! You have completed all checkpoints."
              );

              setLoading(false);
              return;
            }

            /*
            | Next clue unlocked
            */

            if (res.clue) {
              localStorage.setItem(
                "clue",
                JSON.stringify(res.clue)
              );

              setClue(res.clue);
            }

            showMessage(
              "success",
              res.message ||
                "Correct location! Next checkpoint unlocked."
            );

            setCountdown(10);
          }

          /*
          |--------------------------------------------------------------------------
          | FAILURE
          |--------------------------------------------------------------------------
          */

          else {
            showMessage(
              "error",
              res.message ||
                "You are not at the correct location."
            );

            setCountdown(10);
          }

        } catch (error) {
          console.error("LOCATION CHECK ERROR:", error);

          showMessage(
            "error",
            error.message ||
              "Failed to check your location. Please try again."
          );
        } finally {
          setLoading(false);
        }
      },

      (error) => {
        console.error("GEOLOCATION ERROR:", error);

        if (error.code === 1) {
          showMessage(
            "error",
            "Location permission was denied. Please allow location access and try again."
          );
        } else if (error.code === 2) {
          showMessage(
            "error",
            "Your location could not be determined. Please try again."
          );
        } else if (error.code === 3) {
          showMessage(
            "error",
            "Location request timed out. Please try again."
          );
        } else {
          showMessage(
            "error",
            "Unable to get your location."
          );
        }

        setLoading(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }

  /*
  |--------------------------------------------------------------------------
  | LOADING SCREEN
  |--------------------------------------------------------------------------
  */

  if (rendering) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <div className="text-3xl">
          Loading... Please wait.
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | PAGE
  |--------------------------------------------------------------------------
  */

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen bg-center bg-cover bg-no-repeat ${theme.bgColor || ""} custom-font`}
      style={{
        backgroundImage: theme.image
          ? `url(${theme.image})`
          : "none",
      }}
    >
      {/* SUCCESS / ERROR MESSAGE */}

      {message && (
        <div
          className={`
            fixed top-6 left-1/2 -translate-x-1/2 z-50
            w-[90%] max-w-md px-6 py-4 rounded-2xl
            border-2 backdrop-blur-md shadow-2xl
            text-center font-geist-mono
            transition-all duration-300
            ${
              message.type === "success"
                ? "bg-green-900/90 border-green-400 text-green-100"
                : "bg-red-950/90 border-red-400 text-red-100"
            }
          `}
        >
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl font-bold">
              {message.type === "success" ? "✓" : "✕"}
            </span>

            <p className="text-sm font-semibold">
              {message.text}
            </p>
          </div>
        </div>
      )}

      {/* TEAM NAME */}

      <div className="flex flex-col justify-center items-center">
        <div className="pt-10">
          <p className="font-bold text-3xl text-center font-geist-sans text-[#D37E01]">
            Team
          </p>

          <p className="font-bold text-4xl text-center pt-2 text-[#D37E01] font-astrolab">
            {team.name || "Unknown Team"}
          </p>
        </div>
      </div>

      {/* CLUE */}

      <div className="flex justify-center items-center px-8 mt-10">
        <div className="pt-5 px-4">
          <div
            className={`rounded-2xl p-4 ${theme.bgColor || ""} border-4 ${theme.borderColor || ""}`}
          >
            <p className="text-white text-center text-sm font-geist-mono select-none">
              {finished
                ? "All checkpoints completed."
                : clue.clue || "No checkpoint available."}
            </p>
          </div>
        </div>
      </div>

      {/* COMPLETION MESSAGE */}

      {finished && (
        <div className="mt-8 px-8 text-center">
          <p className="text-white font-geist-mono">
            Congratulations! You have completed the hunt.
          </p>
        </div>
      )}

      {/* CHECK LOCATION BUTTON */}

      {!finished && (
        <div className="mt-10">
          <button
            className={`
              rounded-2xl font-geist-mono
              w-auto text-md h-auto py-2 px-6
              border-4 ${theme.borderColor || ""}
              whitespace-nowrap mb-20
              transition-all duration-200
              ${
                countdown > 0 || loading
                  ? "opacity-70 cursor-not-allowed"
                  : "cursor-pointer"
              }
            `}
            onClick={checkLocation}
            disabled={countdown > 0 || loading}
          >
            {loading
              ? "Checking..."
              : countdown > 0
              ? `Please wait (${countdown})`
              : "Check location"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ThemePages;