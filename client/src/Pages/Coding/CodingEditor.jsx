import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FiCopy, FiUsers, FiPlay, FiX, FiSave } from "react-icons/fi";

import Editor from "./component/Editor";

const CODE_SNIPPETS = {
  python3: `print("Hello, World!")`,
  java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
  cpp: `#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello, World!";\n    return 0;\n}`,
  nodejs: `console.log("Hello, World!");`,
  c: `#include <stdio.h>\nint main() {\n    printf("Hello, World!");\n    return 0;\n}`,
  rust: `fn main() {\n    println!("Hello, World!");\n}`,
};

const getInitials = (name = "") =>
  name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

function CodingEditor({ username, socketRef, roomid, seteditor }) {
  const [selectedLanguage, setSelectedLanguage] = useState("python3");
  const [code, setCode] = useState(CODE_SNIPPETS["python3"]);
  const [output, setOutput] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [showUsers, setShowUsers] = useState(false);

  useEffect(() => {
    if (!socketRef?.current || !roomid) return;
    const socket = socketRef.current;

    socket.emit("join editor", roomid);

    socket.on("users in editor room", setConnectedUsers);
    socket.on("user left", (userId) => {
      setConnectedUsers(prev => prev.filter(u => u?.socketId !== userId));
    });
    socket.on("notification", (n) => {
      toast.success(n.message, { icon: "👋" });
    });

    return () => {
      socket.emit("leave_editor", roomid);
      socket.off("users in editor room");
      socket.off("user left");
      socket.off("notification");
    };
  }, [socketRef, roomid]);

  const runCode = async () => {
    setIsCompiling(true);
    setOutput("⏳ Compiling...");
    try {
      const response = await axios.post(`${import.meta.env.VITE_SERVER}/api/code/compile`, {
        code, language: selectedLanguage,
      });
      setOutput(response.data.output || "✅ No output");
    } catch (error) {
      setOutput(error.response?.data?.error || "❌ Server error: Unable to compile. Check your jDoodle credentials.");
    } finally {
      setIsCompiling(false);
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(`${import.meta.env.VITE_SERVER}/api/saved`, {
        type: "CODE",
        title: `Code from ${roomid.slice(0, 6)}`,
        content: code,
        metadata: { language: selectedLanguage }
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Saved to profile!");
    } catch {
      toast.error("Failed to save");
    }
  };

  const handleLanguageChange = (e) => {

    const lang = e.target.value;
    setSelectedLanguage(lang);
    setCode(CODE_SNIPPETS[lang] || "");
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomid);
    toast.success("Room ID copied!");
  };

  return (
    <div className="flex flex-col h-screen pt-16" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b flex-shrink-0" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3">
          <div className="text-lg font-bold gradient-text hidden sm:block">⚡ CodeLab</div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono" style={{ background: "rgba(124,58,237,0.08)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
            <span className="truncate max-w-[140px]">{roomid}</span>
            <button onClick={copyRoomId} className="hover:text-violet-400 transition-colors">
              <FiCopy size={12} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language selector */}
          <select
            className="text-sm rounded-lg px-3 py-1.5 outline-none transition-all"
            style={{ background: "var(--bg-card)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
            value={selectedLanguage}
            onChange={handleLanguageChange}
          >
            {Object.keys(CODE_SNIPPETS).map(lang => (
              <option key={lang} value={lang}>{lang.toUpperCase()}</option>
            ))}
          </select>

          {/* Users toggle */}
          <button
            onClick={() => setShowUsers(!showUsers)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
            style={{
              background: showUsers ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.05)",
              border: "1px solid var(--border)",
              color: showUsers ? "#a78bfa" : "var(--text-secondary)",
            }}
          >
            <FiUsers size={14} />
            <span>{connectedUsers.length}</span>
          </button>

          {/* Save */}
          <button onClick={handleSave} className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 text-sm">
            <FiSave size={14} />
            <span className="hidden sm:inline">Save</span>
          </button>

          {/* Run */}
          <button onClick={runCode} disabled={isCompiling} className="btn-primary flex items-center gap-1.5 px-3 py-1.5 text-sm">
            {isCompiling ? <div className="spinner" /> : <FiPlay size={14} />}
            {isCompiling ? "Running..." : "Run"}
          </button>

          {/* Close */}
          <button onClick={() => seteditor(false)} className="p-1.5 rounded-lg transition-colors hover:text-red-400" style={{ color: "var(--text-secondary)" }}>
            <FiX size={18} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <Editor
              passcode={code}
              roomid={roomid}
              onCodeChange={setCode}
              language={selectedLanguage}
              socketRef={socketRef}
            />
          </div>

          {/* Output Panel */}
          <div className="border-t flex-shrink-0" style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
                Output · {selectedLanguage}
              </span>
              {output && (
                <button onClick={() => setOutput("")} className="text-xs" style={{ color: "var(--text-muted)" }}>Clear</button>
              )}
            </div>
            <pre
              className="px-4 pb-4 text-sm font-mono overflow-auto"
              style={{
                color: output.startsWith("❌") ? "#f87171" : "#34d399",
                maxHeight: "160px",
                minHeight: "60px",
              }}
            >
              {output || <span style={{ color: "var(--text-muted)" }}>Run code to see output here...</span>}
            </pre>
          </div>
        </div>

        {/* Users Sidebar */}
        {showUsers && (
          <div className="w-52 border-l flex-shrink-0 animate-slide-right overflow-y-auto" style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>Online in Room</p>
            </div>
            <div className="p-3 space-y-2">
              {connectedUsers.map((u) => (
                <div key={u.socketId} className="flex items-center gap-2">
                  <div className="relative">
                    <div className="avatar avatar-sm">{getInitials(u.name)}</div>
                    <div className="online-dot absolute -bottom-0.5 -right-0.5" />
                  </div>
                  <span className="text-xs" style={{ color: "var(--text-primary)" }}>{u.name}</span>
                </div>
              ))}
              {connectedUsers.length === 0 && (
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Only you in this room</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CodingEditor;
