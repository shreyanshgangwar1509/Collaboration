import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER,
});

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid email or password. Please try again.");
      }

      const data = await response.json();
      console.log(data.accesstoken);

      // Save token in local storage
      localStorage.setItem("token", data.accesstoken);
      
      // Navigate to profile
      navigate("/profile");
    } catch (error) {
      console.error(error);
      setErrorMessage("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full animate-fade-in">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>

        {errorMessage && (
          <div className="text-red-500 text-center mb-4">{errorMessage}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none bg-white focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-black"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="text-black w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white focus:ring-blue-500 transition-all duration-200"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-semibold py-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? (
              <span className="animate-spin border-t-2 border-white rounded-full w-5 h-5"></span>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-500">
          Don't have an account?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
