"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { post } from "../service";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  const login = async () => {
    try {
      const data = await post(`admin/login`, { username, password });
      if (data.success) {
        localStorage.setItem("token", data.data.token);
        setIsLoggedIn(true);
        console.log("Login successful");
        router.push("/admin/dashboard");
      } else {
        console.log("Login failed");
      }
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login();
  };

  return (
    <div className="flex items-center justify-center w-screen h-screen bg-[#624E88] p-5">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-center max-w-md w-full mx-auto p-10 bg-[url('/image.png')] bg-cover rounded-lg shadow-lg items-center"
      >
        <h2 className="text-3xl font-bold text-center mb-6 text-black ">
          🎀 Login 🎀
        </h2>
        <div className="mb-6 w-full">
          <label
            htmlFor="username"
            className="block text-xl text-black font-bold"
          >
            Username:
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="mt-2 block w-full  rounded-md shadow-sm  p-2"
          />
        </div>
        <div className="mb-6 w-full">
          <label
            htmlFor="password"
            className="block text-xl font-bold text-black"
          >
            Password:
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-2 block w-full rounded-md shadow-sm  p-2"
          />
        </div>
        <button
          type="submit"
          className="w-auto text-black bg-white  font-bold px-5 py-3 rounded-md "
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
