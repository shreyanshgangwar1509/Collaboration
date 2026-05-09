import React, { useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FiDownload, FiCopy, FiUsers, FiSave } from "react-icons/fi";

import JoinRoomTemplate from "../../components/JoinRoomTemplate";

const ENDPOINT = import.meta.env.VITE_SERVER;

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ["code-block", "link"],
    ["clean"],
  ],
};

const getInitials = (name = "") =>
  name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

function DocEditor() {
  const [phase, setPhase] = useState("join"); // join | editor
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [content, setContent] = useState("");
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [showUsers, setShowUsers] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const socketRef = useRef(null);
  const isRemoteChange = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { toast.error("Please login"); navigate("/login"); return; }
    const userinfo = JSON.parse(localStorage.getItem("userinfo") || "{}");
    if (userinfo.name) setUsername(userinfo.name);

    const socket = io(ENDPOINT, { auth: { token }, reconnection: true });
    socketRef.current = socket;
    socket.on("auth_error", () => { navigate("/login"); });
    return () => socket.disconnect();
  }, [navigate]);

  const joinRoom = () => {
    if (!roomId.trim() || !username.trim()) { toast.error("Room ID and username required"); return; }
    const socket = socketRef.current;
    socket.emit("join_doc_room", roomId);
    socket.on("users in doc room", setConnectedUsers);
    socket.on("user left", (id) => setConnectedUsers(prev => prev.filter(u => u.socketId !== id)));
    socket.on("notification", (n) => toast.success(n.message, { icon: "📝" }));
    socket.on("doc_change", ({ content: newContent }) => {
      isRemoteChange.current = true;
      setContent(newContent);
    });
    setPhase("editor");
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(`${import.meta.env.VITE_SERVER}/api/saved`, {
        type: "DOCS",
        title: `Doc from ${roomId.slice(0, 6)}`,
        content: content,
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Saved to profile!");
    } catch {
      toast.error("Failed to save");
    }
  };

  const handleContentChange = (value) => {

    if (isRemoteChange.current) {
      isRemoteChange.current = false;
      return;
    }
    setContent(value);
    const text = value.replace(/<[^>]+>/g, "").trim();
    setWordCount(text ? text.split(/\s+/).length : 0);
    socketRef.current?.emit("doc_change", { roomid: roomId, content: value });
  };

  const downloadDoc = () => {
    const text = content.replace(/<[^>]+>/g, "");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `doc-${roomId.slice(0, 8)}.txt`;
    a.click();
    toast.success("Document downloaded!");
  };

  if (phase === "join") {
    return (
      <JoinRoomTemplate
        title="CollabDocs"
        subtitle="Real-time Document Editor"
        icon="📄"
        roomId={roomId}
        setRoomId={setRoomId}
        username={username}
        setUsername={setUsername}
        onJoin={joinRoom}
        accentColor="#10b981"
      />
    );
  }

  return (
    <div className="flex flex-col h-screen pt-16" style={{ background: "var(--bg-primary)" }}>
      <div className="flex items-center justify-between px-4 py-2 border-b flex-shrink-0" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3">
          <span className="font-bold gradient-text text-sm">📄 CollabDocs</span>
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg text-xs font-mono" style={{ background: "rgba(124,58,237,0.08)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
            {roomId.slice(0, 12)}...
            <button onClick={() => { navigator.clipboard.writeText(roomId); toast.success("Copied!"); }}><FiCopy size={11} /></button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs hidden sm:block" style={{ color: "var(--text-muted)" }}>{wordCount} words</span>
          <button onClick={handleSave} className="btn-secondary flex items-center gap-1.5 text-xs px-3 py-1.5"><FiSave size={13} /> Save</button>
          <button onClick={downloadDoc} className="btn-secondary flex items-center gap-1.5 text-xs px-3 py-1.5"><FiDownload size={13} /> Export</button>
          <button onClick={() => setShowUsers(!showUsers)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg" style={{ background: showUsers ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.05)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
            <FiUsers size={13} /> {connectedUsers.length}
          </button>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "var(--bg-primary)" }}>
          <style>{`
            .ql-toolbar { background: var(--bg-secondary) !important; border-color: var(--border) !important; }
            .ql-toolbar .ql-stroke { stroke: var(--text-secondary) !important; }
            .ql-toolbar .ql-fill { fill: var(--text-secondary) !important; }
            .ql-toolbar .ql-picker { color: var(--text-secondary) !important; }
            .ql-toolbar .ql-picker-options { background: var(--bg-card) !important; border-color: var(--border) !important; }
            .ql-container { border-color: var(--border) !important; flex:1; overflow:auto; }
            .ql-editor { font-family: 'Inter', sans-serif; font-size: 15px; line-height: 1.8; color: var(--text-primary) !important; background: var(--bg-primary); min-height: 100%; padding: 2rem; text-align: left; }
          `}</style>
          <ReactQuill theme="snow" value={content} onChange={handleContentChange} modules={quillModules} placeholder="Start typing..." style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }} />
        </div>
        {showUsers && (
          <div className="w-48 border-l flex-shrink-0 animate-slide-right" style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}><p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Collaborators</p></div>
            <div className="p-3 space-y-2">
              {connectedUsers.map(u => (
                <div key={u.socketId} className="flex items-center gap-2">
                  <div className="relative"><div className="avatar avatar-sm">{getInitials(u.name)}</div><div className="online-dot absolute -bottom-0.5 -right-0.5" /></div>
                  <span className="text-xs truncate" style={{ color: "var(--text-primary)" }}>{u.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocEditor;