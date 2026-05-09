import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const FloatingOrbs = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-[100px] bg-violet-600 -top-32 -right-32 animate-orb" />
    <div className="absolute w-[400px] h-[400px] rounded-full opacity-15 blur-[100px] bg-indigo-600 bottom-0 -left-20 animate-orb" style={{ animationDelay: "4s" }} />
  </div>
);

const STEPS = ["Account", "Verify Email"];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0 = account info, 1 = OTP verify
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  // Step 1: Register
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_SERVER}/api/auth/signup`, {
        name,
        email,
        password,
      });
      toast.success("Account created! Check your email for the OTP 📧");
      setStep(1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      toast.error("Please enter a valid OTP");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_SERVER}/api/auth/verifyemail`, {
        email,
        otp,
      });
      toast.success("Email verified! Welcome to CollabSpace 🎉");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-animated-gradient relative p-4">
      <FloatingOrbs />

      <div className="room-card animate-slide-up z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mb-4 animate-pulse-glow">
            <span className="text-2xl">✨</span>
          </div>
          <h1 className="text-2xl font-bold gradient-text">Create Account</h1>
          <p style={{ color: "var(--text-secondary)" }} className="text-sm mt-1">
            Join CollabSpace for free
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all duration-300"
                style={{
                  background: i <= step ? "linear-gradient(135deg, #7c3aed, #4f46e5)" : "rgba(255,255,255,0.08)",
                  color: i <= step ? "white" : "var(--text-muted)",
                }}
              >
                {i < step ? "✓" : i + 1}
              </div>
              <span className="text-xs" style={{ color: i === step ? "var(--text-primary)" : "var(--text-muted)" }}>
                {s}
              </span>
              {i < STEPS.length - 1 && (
                <div className="w-8 h-px" style={{ background: i < step ? "#7c3aed" : "var(--border-subtle)" }} />
              )}
            </div>
          ))}
        </div>

        {/* Step 0: Account Info */}
        {step === 0 && (
          <form onSubmit={handleRegister} className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="input-dark"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="input-dark"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  className="input-dark pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2">
              {loading ? <><div className="spinner" /> Creating...</> : "Create Account →"}
            </button>
          </form>
        )}

        {/* Step 1: OTP Verification */}
        {step === 1 && (
          <form onSubmit={handleVerify} className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-xl text-center" style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                We sent a verification code to
              </p>
              <p className="font-semibold mt-1" style={{ color: "#a78bfa" }}>{email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Verification Code (OTP)
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP from email"
                required
                className="input-dark text-center text-xl tracking-widest font-mono"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {loading ? <><div className="spinner" /> Verifying...</> : "✓ Verify & Continue"}
            </button>
            <button
              type="button"
              onClick={() => setStep(0)}
              className="btn-secondary w-full py-2 text-sm"
            >
              ← Back
            </button>
          </form>
        )}

        <div className="divider" />
        <p className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold" style={{ color: "#a78bfa" }}>
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  );
}
