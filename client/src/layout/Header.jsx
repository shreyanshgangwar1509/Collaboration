import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { ACTIONS } from "../constants/Events";

const ENDPOINT = import.meta.env.VITE_SERVER;

const navItems = [
  { id: "code",   title: "Code",       url: "/home/editor", icon: "" },
  { id: "wb",     title: "Whiteboard", url: "/whiteboard",  icon: "" },
  { id: "docs",   title: "Docs",       url: "/docs",        icon: "" },
  { id: "ppt",    title: "PPT",        url: "/ppt",         icon: "" },
  { id: "photo",  title: "Photo",      url: "/photoshop",   icon: "" },
  { id: "chat",   title: "Chat",       url: "/chat",        icon: "" },
];

const getInitials = (name = "") =>
  name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const info = localStorage.getItem("userinfo");
    if (info) setUser(JSON.parse(info));
  }, [token]);

  useEffect(() => {
    if (!token) {
      setOnlineUsers([]);
      return;
    }

    const socket = io(ENDPOINT, { auth: { token } });

    socket.on(ACTIONS.GLOBAL_PRESENCE, (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off(ACTIONS.GLOBAL_PRESENCE);
      socket.disconnect();
    };
  }, [token]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userinfo");
    setUser(null);
    toast.success("Logged out successfully");
    navigate("/");
    window.location.reload();
  };

  return (
    <header
      className="fixed top-0 left-0 z-50 w-full transition-all duration-300"
      style={{
        background: scrolled ? "rgba(7,7,15,0.92)" : "rgba(7,7,15,0.6)",
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${scrolled ? "rgba(124,58,237,0.3)" : "rgba(124,58,237,0.1)"}`,
        boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.3)" : "none",
      }}
    >
      <div className="flex justify-between items-center px-4 lg:px-8 h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 no-underline">
          <span className="font-bold text-lg gradient-text">CollabSpace</span>
          {onlineUsers.length > 0 && (
            <div className="flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-green-500 uppercase tracking-tight">{onlineUsers.length} Online</span>
            </div>
          )}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = item.url === "/" 
              ? location.pathname === "/" 
              : location.pathname.startsWith(item.url);
            return (
              <Link
                key={item.id}
                to={item.url}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all duration-200 no-underline"
                style={{
                  color: isActive ? "#a78bfa" : "var(--text-secondary)",
                  background: isActive ? "rgba(124,58,237,0.15)" : "transparent",
                  borderBottom: isActive ? "2px solid #7c3aed" : "2px solid transparent",
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.background = "transparent"; }}
              >
                <span>{item.icon}</span>
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-2">
          {token ? (
            <div className="flex items-center gap-2">
              <Link to="/profile" className="flex items-center gap-2 no-underline group">
                <div className="avatar avatar-sm group-hover:scale-105 transition-transform">
                  {getInitials(user?.name || "U")}
                </div>
                <span className="text-sm font-medium hidden sm:block" style={{ color: "var(--text-secondary)" }}>
                  {user?.name?.split(" ")[0] || "Profile"}
                </span>
              </Link>
              <button onClick={logout} className="btn-danger text-xs px-3 py-1.5 hidden sm:block">
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-2">
              <button onClick={() => navigate("/login")} className="btn-secondary text-sm px-4 py-2">
                Login
              </button>
              <button onClick={() => navigate("/login")} className="btn-primary text-sm px-4 py-2">
                Get Started
              </button>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="lg:hidden p-2 rounded-lg transition-colors"
            style={{ color: "var(--text-primary)", background: drawerOpen ? "rgba(124,58,237,0.15)" : "transparent" }}
          >
            {drawerOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="lg:hidden animate-fade-in" style={{ background: "rgba(7,7,15,0.97)", borderTop: "1px solid var(--border)" }}>
          <div className="px-4 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = item.url === "/" 
                ? location.pathname === "/" 
                : location.pathname.startsWith(item.url);
              return (
                <Link
                  key={item.id}
                  to={item.url}
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all no-underline"
                  style={{ color: isActive ? "#a78bfa" : "var(--text-secondary)" }}
                >
                  <span>{item.icon}</span>
                  {item.title}
                </Link>
              );
            })}
            <div className="divider" />
            {token ? (
              <button onClick={() => { logout(); setDrawerOpen(false); }} className="btn-danger w-full py-2 text-sm">
                Logout
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <button onClick={() => { navigate("/login"); setDrawerOpen(false); }} className="btn-primary w-full py-2 text-sm">
                  Get Started
                </button>
                <button onClick={() => { navigate("/login"); setDrawerOpen(false); }} className="btn-secondary w-full py-2 text-sm">
                  Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
