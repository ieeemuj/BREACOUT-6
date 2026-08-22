"use client";

import React, { useState, useEffect } from "react";
import { post, get } from "../service";
import { useRouter } from "next/navigation";

const themeData = {
  a: {
    image:
      "https://images.prismic.io/ieeemuj/aL0komGNHVfTOvF9_re.png?auto=format,compress",
    bgColor: "bg-[#501D27]",
    borderColor: "border-[#D37E01]",
    name: "Path A: The Citadel",
  },

  b: {
    image:
      "https://images.prismic.io/ieeemuj/aL0komGNHVfTOvF9_re.png?auto=format,compress",
    bgColor: "bg-[#4A2C14]",
    borderColor: "border-[#D37E01]",
    name: "Path B: The Sovereign",
  },

  c: {
    image:
      "https://images.prismic.io/ieeemuj/aL0komGNHVfTOvF9_re.png?auto=format,compress",
    bgColor: "bg-[#063E53]",
    borderColor: "border-[#D37E01]",
    name: "Path C: The Nexus",
  },

  d: {
    image:
      "https://images.prismic.io/ieeemuj/aL0komGNHVfTOvF9_re.png?auto=format,compress",
    bgColor: "bg-[#134731]",
    borderColor: "border-[#D37E01]",
    name: "Path D: The Frontier",
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

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/");
      return;
    }

    async function getClue() {
      try {
        const res = await get("clue");

        console.log("CLUE RESPONSE:", res);

        if (!res.success) {
          localStorage.removeItem("token");
          localStorage.removeItem("team");
          localStorage.removeItem("clue");

          router.push("/");
          return;
        }

        if (res.code === 2000) {
          setFinished(true);
        }

        if (res.data?.clue) {
          localStorage.setItem(
            "clue",
            JSON.stringify(res.data.clue)
          );
        }

        const storedTeam = JSON.parse(
          localStorage.getItem("team") || "{}"
        );

        const currentClue = res.data?.clue ||
          JSON.parse(localStorage.getItem("clue") || "{}");

        const currentTheme =
          themeData[String(storedTeam.track).toLowerCase()];

        if (!currentTheme) {
          console.error(
            "Theme not found for track:",
            storedTeam.track
          );

          setMessage({
            type: "error",
            text: `Invalid path: ${storedTeam.track}`,
          });

          setRendering(false);
          return;
        }

        setTeam(storedTeam);
        setClue(currentClue);
        setTheme(currentTheme);
      } catch (error) {
        console.error("Error loading clue:", error);

        setMessage({
          type: "error",
          text: "Unable to load your current clue.",
        });
      } finally {
        setRendering(false);
      }
    }

    getClue();
  }, [router]);

  useEffect(() => {
    if (countdown <= 0) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown]);

  const showMessage = (type, text) => {
    setMessage({ type, text });

    setTimeout(() => {
      setMessage(null);
    }, 3500);
  };

  async function checkLocation() {
    setLoading(true);

    if (!navigator.geolocation) {
      showMessage(
        "error",
        "Your browser does not support location services."
      );

      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          console.log("GPS location:", lat, lng);

          const res = await post("clue/submit", {
            lat,
            lng,
          });

          console.log("SUBMIT RESPONSE:", res);

          if (res.success) {
            /*
              Support both possible backend response formats:
              res.data.clue
              OR
              res.clue
            */
            const nextClue =
              res.data?.clue || res.clue;

            if (nextClue) {
              setClue(nextClue);

              localStorage.setItem(
                "clue",
                JSON.stringify(nextClue)
              );
            }

            if (res.code === 2000) {
              setFinished(true);
            }

            showMessage(
              "success",
              res.message ||
              "Location verified! The next part of your journey has been unlocked."
            );
          } else {
            showMessage(
              "error",
              res.message ||
              "You are not at the correct location."
            );

            if (res.code === 1000) {
              setTimeout(() => {
                localStorage.removeItem("token");
                localStorage.removeItem("team");
                localStorage.removeItem("clue");

                router.push("/");
              }, 2000);
            }
          }

          setCountdown(10);
        } catch (error) {
          console.error("Location submission error:", error);

          showMessage(
            "error",
            error.message ||
            "Something went wrong while checking your location."
          );
        } finally {
          setLoading(false);
        }
      },

      (err) => {
        console.error("Geolocation error:", err);

        if (err.code === 1) {
          showMessage(
            "error",
            "Location permission was denied. Please allow location access and try again."
          );
        } else if (err.code === 2) {
          showMessage(
            "error",
            "Your location could not be determined. Please try again."
          );
        } else if (err.code === 3) {
          showMessage(
            "error",
            "Location request timed out. Please try again."
          );
        } else {
          showMessage(
            "error",
            "Unable to access your location."
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

  if (rendering) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black">
        <div className="text-2xl text-white font-geist-mono">
          Loading your journey...
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen bg-center bg-cover bg-no-repeat ${theme.bgColor} custom-font px-4`}
      style={{
        backgroundImage: `url(${theme.image})`,
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
            ${message.type === "success"
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
      <div className="flex flex-col justify-center items-center mt-8">
        <p className="font-bold text-3xl text-center font-geist-sans text-[#D37E01]">
          Team
        </p>

        <p className="font-bold text-4xl text-center pt-2 text-[#D37E01] font-astrolab">
          {team.name}
        </p>

        <p className="text-white/70 text-sm mt-3 font-geist-mono">
          {theme.name}
        </p>
      </div>

      {/* STORYLINE */}
      {clue.storyline && (
        <div className="flex justify-center items-center mt-10 w-full">
          <div className="w-full max-w-xl rounded-2xl p-5 bg-black/50 border-2 border-white/20 backdrop-blur-md shadow-xl">
            <p className="text-[#D37E01] text-center text-xs font-bold uppercase tracking-widest mb-3">
              The Story Continues
            </p>

            <p className="text-white text-center text-sm md:text-base font-geist-mono leading-relaxed whitespace-pre-line">
              {clue.storyline}
            </p>
          </div>
        </div>
      )}

      {/* Clue */}
      <div className="flex justify-center items-center px-8 mt-6 w-full">
        <div className="w-full max-w-2xl">
          <div
            className={`rounded-2xl p-6 ${theme.bgColor} border-4 ${theme.borderColor} shadow-xl`}
          >
            <p className="text-[#D37E01] text-xs font-geist-mono uppercase tracking-[0.2em] mb-3 text-center">
              Your Clue
            </p>

            <p className="text-white text-center text-sm md:text-base leading-relaxed font-geist-mono select-none">
              {clue.clue}
            </p>
          </div>
        </div>
      </div>

      {/* FINISHED MESSAGE */}
      {finished && (
        <div className="flex justify-center items-center mt-8 w-full mb-10">
          <div className="w-full max-w-xl rounded-2xl p-6 bg-[#D37E01]/20 border-2 border-[#D37E01] backdrop-blur-md shadow-xl">
            <p className="text-[#D37E01] text-center text-xl font-bold mb-3">
              Path Complete
            </p>

            <p className="text-white text-center text-sm font-geist-mono leading-relaxed">
              You have completed your path. Report to the final common location.
              The first four teams to arrive will qualify for the next round.
            </p>
          </div>
        </div>
      )}

      {/* CHECK LOCATION */}
      {!finished && (
        <div className="mt-10 mb-16">
          <button
            className={`
              rounded-2xl font-geist-mono
              text-md py-3 px-8
              border-4 ${theme.borderColor}
              whitespace-nowrap
              transition-all duration-200
              ${countdown > 0 || loading
                ? "opacity-70 cursor-not-allowed"
                : "cursor-pointer hover:scale-105"
              }
            `}
            onClick={checkLocation}
            disabled={countdown > 0 || loading}
          >
            {loading
              ? "Checking location..."
              : countdown > 0
                ? `Please wait (${countdown})`
                : "Check Location"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ThemePages;