"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { get, post } from "../service";

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const login = async () => {
    const username = "sam";
    const password = "sam";
    try {
      const data = await post("admin/login", { username, password });
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-10">
  <div className="bg-white shadow-lg rounded-lg p-5 max-w-md w-full">
    <h1 className="text-2xl font-semibold text-center mb-6 text-gray-700">
      Admin Panel Login
    </h1>

    {!isLoggedIn ? (
      <button
        onClick={login}
        className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition duration-300 ease-in-out"
      >
        Login
      </button>
    ) : (
      <p className="text-center text-gray-500 mt-4">Redirecting...</p>
    )}
  </div>
</div>

  );
}
