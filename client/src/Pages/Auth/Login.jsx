import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// --- Floating Orb background ---
const FloatingOrbs = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-[100px] bg-violet-600 -top-32 -left-32 animate-orb" />
    <div className="absolute w-[400px] h-[400px] rounded-full opacity-15 blur-[100px] bg-indigo-600 bottom-0 right-0 animate-orb" style={{ animationDelay: "3s" }} />
    <div className="absolute w-[300px] h-[300px] rounded-full opacity-10 blur-[80px] bg-purple-500 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-orb" style={{ animationDelay: "6s" }} />
  </div>
);

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER}/api/auth/login`,
        { email, password }
      );

      const { accesstoken, user } = response.data;
      localStorage.setItem("token", accesstoken);
      if (user) localStorage.setItem("userinfo", JSON.stringify(user));

      toast.success(`Welcome back, ${user?.name || "User"}! 🎉`);
      navigate("/profile");
    } catch (error) {
      const msg = error.response?.data?.message || "Invalid credentials. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-animated-gradient relative p-4">
      <FloatingOrbs />

      <div className="room-card animate-slide-up z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mb-4 animate-pulse-glow">
            <span className="text-2xl">⚡</span>
          </div>
          <h1 className="text-2xl font-bold gradient-text">Welcome Back</h1>
          <p style={{ color: "var(--text-secondary)" }} className="text-sm mt-1">
            Sign in to CollabSpace
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="Enter your password"
                required
                className="input-dark pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2"
          >
            {loading ? (
              <>
                <div className="spinner" />
                Signing in...
              </>
            ) : (
              <>
                <span>Sign In</span>
                <span>→</span>
              </>
            )}
          </button>
        </form>

        <div className="divider" />

        <p className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold" style={{ color: "#a78bfa" }}>
            Create one →
          </Link>
        </p>
      </div>
    </div>
  );
}
