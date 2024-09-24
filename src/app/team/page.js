"use client";
import React, { useState, useEffect } from "react";
import { get } from "../service";

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
  const [theme, setTheme] = useState(themeData[JSON.parse(localStorage.getItem("team"))?.track]);
  const [team, setTeam] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/";
    }

    const team = JSON.parse(localStorage.getItem("team"));
    setTeam(team);
  }, []);

  if (!theme) {
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
            className={`font-bold text-3xl text-center font-sans text-[#D37E01]`}
          >
            Team
          </p>
          <p
            className={`font-bold text-4xl text-center pt-2 text-[#D37E01]`}
          >
            {team.name}
          </p>
        </div>
      </div>

      {/* clue box */}
      <div className="flex justify-center items-center px-8 mt-10">
        <div className="pt-5 px-4">
          <div
            className={`rounded-2xl p-4 ${theme.bgColor} border-4 ${theme.borderColor}`}
          >
            <p className="text-white text-center text-xl font-sans">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
              vehicula lacus ut eros tempor, ac facilisis odio.
            </p>
          </div>
        </div>
      </div>

      {/* Check location */}
      <div className="mt-10">
        <div
          className={`rounded-2xl w-auto text-md h-auto py-2 px-6 border-4 ${theme.borderColor} whitespace-nowrap`}
        >
          Check location
        </div>
      </div>
    </div>
  );
};

export default ThemePages;

