
import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const api = axios.create({
  baseURL:  "http://localhost:3000", 
});

export default function Register() {
  const [email, setEmail] = useState("");
  const [name, setname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [isOtpScreen, setIsOtpScreen] = useState(false); // Determines if OTP screen should show

  // Worker-specific fields
  const [workerName, setWorkerName] = useState("");
  const [service, setService] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [avatar, setAvatar] = useState("");
  const [identityType, setIdentityType] = useState("");
  const [identityNumber, setIdentityNumber] = useState("");

  const navigate = useNavigate();

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const identity = {
        identityNumber,
        identityType,
      }
      const payload = { email, password, name };

      const response = await api.post("/api/auth/signup", payload);

      if (response.status === 200) {
        setIsOtpScreen(true); 
      }
      if (response.status === 403) setError("Account already exists");
    } catch (err) {
      setError("Registration failed");
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/api/auth/verifyemail", { otp, email });
      setMessage(response.data.message);
      navigate("/"); // Redirect to home on successful OTP verification
    } catch (error) {
      console.error("Error during OTP verification:", error.response?.data);
      setMessage(error.response?.data?.message || "Invalid OTP. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        {isOtpScreen ? (
          <>
            {/* OTP Verification Form */}
            <h1 className="text-2xl font-bold text-center mb-6">Enter OTP</h1>
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <label className="block text-gray-700 font-semibold">OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="bg-white w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className=" w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Verify OTP
              </button>
            </form>
            {message && <p className="mt-4 text-center text-red-500">{message}</p>}
          </>
        ) : (
          <>
            {/* Role Selection */}
            <h1 className="text-2xl font-bold text-center mb-6">Register</h1>
            {error && <p className="text-red-500">{error}</p>}
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setname(e.target.value)}
                  className=" bg-white border p-2 w-full"
                  required
                />
              </div>
              <div>
                <label className="block mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white border p-2 w-full"
                  required
                />
              </div>
              <div>
                <label className="block mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white border p-2 w-full"
                  required
                />
              </div>
              <div>
                <label className="block mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-white border p-2 w-full"
                  required
                />
              </div>

              
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
              >
                Register
              </button>
            </form>
            <p className="text-center mt-4 text-gray-500">
              Already have an account?{" "}
              <a href="/login" className="text-blue-600 hover:underline">
                Login
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
