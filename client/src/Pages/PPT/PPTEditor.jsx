import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiTrash2, FiUsers, FiCopy, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { v4 as uuid } from "uuid";
import JoinRoomTemplate from "../../components/JoinRoomTemplate";

const ENDPOINT = import.meta.env.VITE_SERVER;

const SLIDE_THEMES = [
  { id: "dark", label: "Dark", bg: "linear-gradient(135deg,#0a0a0f,#14141f)", text: "#f1f5f9" },
  { id: "violet", label: "Violet", bg: "linear-gradient(135deg,#4c1d95,#1e1b4b)", text: "#e9d5ff" },
  { id: "ocean", label: "Ocean", bg: "linear-gradient(135deg,#0c4a6e,#0e7490)", text: "#cffafe" },
  { id: "light", label: "Light", bg: "linear-gradient(135deg,#f8fafc,#e2e8f0)", text: "#0f172a" },
];

const createSlide = () => ({ id: uuid(), title: "New Slide", content: "Click to edit...", theme: "dark" });

const getInitials = (name = "") =>
  name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

function PPTEditor() {
  const [phase, setPhase] = useState("join");
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [slides, setSlides] = useState([createSlide()]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [showUsers, setShowUsers] = useState(false);
  const [editing, setEditing] = useState(null);
  const socketRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    const userinfo = JSON.parse(localStorage.getItem("userinfo") || "{}");
    if (userinfo.name) setUsername(userinfo.name);

    socketRef.current = io(ENDPOINT, { auth: { token } });
    return () => socketRef.current.disconnect();
  }, [navigate]);

  const joinRoom = () => {
    if (!roomId.trim() || !username.trim()) { toast.error("Room ID and username required"); return; }
    const socket = socketRef.current;
    socket.emit("join_ppt_room", roomId);
    socket.on("users in ppt room", setConnectedUsers);
    socket.on("user left", (id) => setConnectedUsers(prev => prev.filter(u => u.socketId !== id)));
    socket.on("notification", (n) => toast.success(n.message));
    socket.on("ppt_slide_add", ({ slide }) => setSlides(prev => [...prev, slide]));
    socket.on("ppt_slide_update", ({ slide }) => setSlides(prev => prev.map(s => s.id === slide.id ? slide : s)));
    socket.on("ppt_slide_delete", ({ slideId }) => setSlides(prev => prev.filter(s => s.id !== slideId)));
    socket.on("ppt_current_slide", ({ slideIndex }) => setCurrentIndex(slideIndex));
    setPhase("editor");
  };

  const updateSlide = (field, value) => {
    const updated = { ...slides[currentIndex], [field]: value };
    setSlides(prev => prev.map((s, i) => i === currentIndex ? updated : s));
    socketRef.current?.emit("ppt_slide_update", { roomid: roomId, slide: updated });
  };

  const navigate_slide = (dir) => {
    const next = Math.max(0, Math.min(currentIndex + dir, slides.length - 1));
    setCurrentIndex(next);
    socketRef.current?.emit("ppt_current_slide", { roomid: roomId, slideIndex: next });
  };

  if (phase === "join") {
    return (
      <JoinRoomTemplate
        title="Presentation"
        subtitle="Real-time Slide Designer"
        icon="📊"
        roomId={roomId}
        setRoomId={setRoomId}
        username={username}
        setUsername={setUsername}
        onJoin={joinRoom}
        accentColor="#f59e0b"
      />
    );
  }

  const currentSlide = slides[currentIndex] || slides[0];
  const currentTheme = SLIDE_THEMES.find(t => t.id === currentSlide?.theme) || SLIDE_THEMES[0];

  return (
    <div className="flex flex-col h-screen pt-16" style={{ background: "var(--bg-primary)" }}>
      <div className="flex items-center justify-between px-4 py-2 border-b flex-shrink-0" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3">
          <span className="font-bold gradient-text text-sm">📊 Presentation</span>
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg text-xs font-mono" style={{ background: "rgba(124,58,237,0.08)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
            {roomId.slice(0, 12)}...
            <button onClick={() => { navigator.clipboard.writeText(roomId); toast.success("Copied!"); }}><FiCopy size={11} /></button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowUsers(!showUsers)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg" style={{ background: showUsers ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.05)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
            <FiUsers size={13} /> {connectedUsers.length}
          </button>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-40 flex-shrink-0 border-r overflow-y-auto p-2 space-y-2" style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
          {slides.map((slide, i) => (
            <div key={slide.id} onClick={() => { setCurrentIndex(i); socketRef.current?.emit("ppt_current_slide", { roomid: roomId, slideIndex: i }); }} className="rounded-lg p-2 cursor-pointer transition-all border-2" style={{ background: SLIDE_THEMES.find(t => t.id === slide.theme)?.bg, borderColor: i === currentIndex ? "#7c3aed" : "transparent" }}>
              <p className="text-[8px] font-bold truncate text-white">{slide.title}</p>
            </div>
          ))}
          <button onClick={() => { const s = createSlide(); setSlides([...slides, s]); socketRef.current?.emit("ppt_slide_add", { roomid: roomId, slide: s }); }} className="w-full py-2 rounded-lg text-xs flex items-center justify-center gap-1 bg-white/5 border border-dashed border-white/20 text-gray-400 font-bold"><FiPlus/> Add</button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
           <div className="w-full max-w-4xl aspect-video rounded-3xl overflow-hidden shadow-2xl flex flex-col p-12" style={{ background: currentTheme.bg, color: currentTheme.text }}>
              {editing === 'title' ? (
                <input autoFocus value={currentSlide.title} onChange={e => updateSlide('title', e.target.value)} onBlur={() => setEditing(null)} className="text-4xl font-bold bg-transparent border-b outline-none" />
              ) : (
                <h1 onClick={() => setEditing('title')} className="text-4xl font-bold mb-4 cursor-pointer">{currentSlide.title}</h1>
              )}
              {editing === 'content' ? (
                <textarea autoFocus value={currentSlide.content} onChange={e => updateSlide('content', e.target.value)} onBlur={() => setEditing(null)} className="flex-1 bg-transparent border rounded p-2 outline-none" />
              ) : (
                <p onClick={() => setEditing('content')} className="text-xl opacity-80 cursor-pointer whitespace-pre-wrap">{currentSlide.content}</p>
              )}
           </div>
           
           <div className="absolute bottom-10 flex items-center gap-4">
              <button onClick={() => navigate_slide(-1)} disabled={currentIndex === 0} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all disabled:opacity-30"><FiChevronLeft size={24}/></button>
              <div className="px-4 py-1.5 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest">{currentIndex + 1} / {slides.length}</div>
              <button onClick={() => navigate_slide(1)} disabled={currentIndex === slides.length - 1} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all disabled:opacity-30"><FiChevronRight size={24}/></button>
           </div>
        </div>
      </div>
    </div>
  );
}

export default PPTEditor;