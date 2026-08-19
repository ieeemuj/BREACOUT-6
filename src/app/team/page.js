"use client";
import React, { useState, useEffect } from "react";
import { post } from "../service";
import { useRouter } from "next/navigation";
import { get } from "../service";

const themeData = {
  gr: {
    image:
      "https://images.prismic.io/ieeemuj/aL0komGNHVfTOvF9_re.png?auto=format,compress",
    bgColor: "bg-[#501D27]",
    borderColor: "border-[#D37E01]",
    logo: "/g-1.png",
    name: "Track #1",
  },
  hu: {
    image:
      "https://images.prismic.io/ieeemuj/aL0komGNHVfTOvF9_re.png?auto=format,compress",
    bgColor: "bg-[#D37E01]",
    borderColor: "border-[#D37E01]",
    logo: "/h-1.png",
    name: "Track #2",
  },
  re: {
    image:
      "https://images.prismic.io/ieeemuj/aL0komGNHVfTOvF9_re.png?auto=format,compress",
    bgColor: "bg-[#063E53]",
    borderColor: "border-[#D37E01]",
    logo: "/r-1.png",
    name: "Track #3",
  },
  sl: {
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
  const [userLocation, setUserLocation] = useState({
    lat: 26.9124,
    lng: 75.7873,
  });
  const [loading, setLoading] = useState(false);
  const [rendering, setRendering] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [finished, setFinished] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/";
    }
    async function getClue() {
      const res = await get('clue');
      if (res.success) {
        if (res.code === 2000) {
          setFinished(true);
        }
        localStorage.setItem("clue", JSON.stringify(res.data.clue));
      } else {
        alert('Session expired! Please login again.');
        localStorage.removeItem("token");
        window.location.href = "/";
      }
      const team = JSON.parse(localStorage.getItem("team"));
      const clue = JSON.parse(localStorage.getItem("clue"));
      const theme = themeData[team.track];
      setTeam(team);
      setClue(clue);
      setTheme(theme);
      setRendering(false);
    }

    getClue();
  }, []);

  useEffect(() => {
    let interval = null;

    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [countdown]);

  async function checkLocation() {
    setLoading(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async function (position) {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          setUserLocation({
            lat,
            lng,
          });

          console.log("GPS location:", lat, lng);

          const res = await post("clue/submit", {
            lat,
            lan: lng,
          });
          console.log(res);
          if (res.success) {
            localStorage.setItem("clue", JSON.stringify(res.clue));
            if (res.code === 2000) {
              setFinished(true);
            }
            setClue(res.clue);
            alert('Correct location! Next clue unlocked.');
          } else {
            alert(res.message);
            if (res.code === 1000) {
              router.push("/");
            }
          }
          setCountdown(10);
          setLoading(false);
        },
        function (err) {
          console.log("error callback");
          if (err.code === 1) {
            alert(
              "Error: You have denied the location permission. Please allow location for this website and refresh the webpage."
            );
            setLoading(false);
            return;
          }
          alert(err.message);
          alert(err.code);
          setLoading(false);
        }
      );
    } else {
      // Browser doesn't support Geolocation
      console.log("Browser does not support geolocation");
      alert("Browser does not support geolocation. Please try another browser.");
      setLoading(false);
    }
  }

  if (rendering) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <div className="text-3xl">Loading.. Please wait.</div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen bg-center bg-cover bg-no-repeat ${theme.bgColor} custom-font`}
      style={{ backgroundImage: `url(${theme.image})` }}
    >
      {/* logo and name */}
      <div className="flex flex-col justify-center items-center">
        {/*<img src={theme.logo} alt="Theme logo" className="w-40 h-40" />*/}
        <div className="pt-10">
          <p
            className={`font-bold text-3xl text-center font-geist-sans text-[#D37E01]`}
          >
            Team
          </p>
          <p
            className={`font-bold text-4xl text-center pt-2 text-[#D37E01] font-astrolab`}
          >
            {team.name}
          </p>
        </div>
      </div>

      {/* clue box */}
      <div className="flex justify-center items-center px-8 mt-10 f">
        <div className="pt-5 px-4">
          <div
            className={`rounded-2xl p-4 ${theme.bgColor} border-4 ${theme.borderColor}`}
          >
            <p className="text-white text-center text-sm font-geist-mono select-none">
              {clue.clue}
            </p>
          </div>
        </div>
      </div>

      {/* Check location */}
      <div className={`mt-10 ${finished ? 'hidden' : 'block'}`}>
        <button
          className={`rounded-2xl font-geist-mono w-auto text-md h-auto py-2 px-6 border-4 ${theme.borderColor} 
          whitespace-nowrap cursor-pointer ${(countdown > 0 || loading) ? 'disabled:opacity-70' : ''} mb-20`}
          onClick={loading ? null : checkLocation}
          disabled={countdown > 0 || loading}
        >
          {loading ? `Checking...` : countdown > 0 ? `Please wait (${countdown})` : "Check location"}
        </button>
      </div>
    </div>
  );
};

export default ThemePages;
