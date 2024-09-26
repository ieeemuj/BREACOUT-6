"use client";
import React, { useState, useEffect } from "react";
import { post } from "../service";
import { useRouter } from "next/router"; 

const themeData = {
  gr: {
    image: "/gryffindor.png",
    bgColor: "bg-[#501D27]",
    borderColor: "border-[#D37E01]",
    logo: "/g-1.png",
    name: "Gryffindor",
  },
  hu: {
    image: "/hufflepuff.png",
    bgColor: "bg-[#D37E01]",
    borderColor: "border-[#D37E01]",
    logo: "/h-1.png",
    name: "Hufflepuff",
  },
  ra: {
    image: "/ravenclaw.png",
    bgColor: "bg-[#063E53]",
    borderColor: "border-[#D37E01]",
    logo: "/r-1.png",
    name: "Ravenclaw",
  },
  sl: {
    image: "/slytherin.png",
    bgColor: "bg-[#134731]",
    borderColor: "border-[#D37E01]",
    logo: "/s-1.png",
    name: "Slytherin",
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

  

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/";
    }

    const team = JSON.parse(localStorage.getItem("team"));
    const clue = JSON.parse(localStorage.getItem("clue"));
    const theme = themeData[team.track];
    setTeam(team);
    setClue(clue);
    setTheme(theme);
    setRendering(false);
  }, []);

  useEffect(() => {
    let interval = null;

    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setLoading(false);
    }

    return () => clearInterval(interval);
  }, [countdown]);

  async function checkLocation() {
    setLoading(true);
    setCountdown(10);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async function (position) {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          console.log(userLocation);
          const res = await post("clue/submit", {
            lat: userLocation.lat,
            lan: userLocation.lng,
          });
          console.log(res);
          alert(JSON.stringify(res));
          if (res.name === "last") {
            router.push({
              pathname: "../team/eventend.js", 
              query: {
                teamName: team.name, 
                logo: theme.logo,
                bg:theme.image,
                bgColor:theme.bgColor
              },
            });
          } else {
            setCountdown(10);
          }
  
          setCountdown(10);
        },
        function (err) {
          console.log("error callback");
          if (err.code === 1) {
            alert(
              "Error: You have denied the location permission. Please allow location for this website."
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
      alert("Browser does not support geolocation");
      setLoading(false);
    }
  }

  if (rendering) {
    return <div>Loading...</div>;
  }

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen bg-center bg-cover bg-no-repeat ${theme.bgColor} custom-font`}
      style={{ backgroundImage: `url(${theme.image})` }}
    >
      {/* logo and name */}
      <div className="flex flex-col justify-center items-center">
        <img src={theme.logo} alt="Theme logo" className="w-40 h-40" />
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
            <p className="text-white text-center text-xl font-geist-mono">
              {clue.clue}
            </p>
          </div>
        </div>
      </div>

      {/* Check location */}
      <div className="mt-10">
        <div
          className={`rounded-2xl font-geist-mono w-auto text-md h-auto py-2 px-6 border-4 ${theme.borderColor} whitespace-nowrap`}
          onClick={loading ? null : checkLocation}
        >
          {loading ? `Please wait (${countdown})` : "Check location"}
        </div>
      </div>
    </div>
  );
};

export default ThemePages;
