import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const refreshToken = params.get("refreshToken");
    const userInfo = params.get("user");

    if (token) {
      localStorage.setItem("token", token);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      if (userInfo) localStorage.setItem("userinfo", userInfo);
      
      const user = JSON.parse(userInfo || "{}");
      toast.success(`Welcome, ${user.name || "User"}! 🎉`);
      navigate("/profile");
    }

    const error = params.get("error");
    if (error) {
      toast.error("Authentication failed. Please try again.");
    }
  }, [navigate]);

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

      const { accesstoken, user, refreshToken } = response.data;
      localStorage.setItem("token", accesstoken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
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

  const handleOAuthLogin = (provider) => {
    window.location.href = `${import.meta.env.VITE_SERVER}/api/auth/${provider}`;
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

        <div className="flex items-center gap-4 my-6">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-white/30 uppercase tracking-widest font-medium">Or continue with</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <button
          onClick={() => handleOAuthLogin('google')}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all group"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="text-sm font-medium">Continue with Google</span>
        </button>

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
