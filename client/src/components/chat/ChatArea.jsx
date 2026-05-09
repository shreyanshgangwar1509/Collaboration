import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { FiSend, FiUsers, FiMessageCircle, FiInfo, FiX } from "react-icons/fi";
import UsersList from "./UsersList";

const getInitials = (name = "") =>
  name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

const formatTime = (date) =>
  new Date(date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

const ChatArea = ({ selectedGroup, socket, setSelectedGroup }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [showUsers, setShowUsers] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem("userinfo")) || {}; }
    catch { return {}; }
  })();

  const fetchMessages = async () => {
    const token = localStorage.getItem("token");
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_SERVER}/api/messages/${selectedGroup?._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // API returns newest first, reverse to show oldest first
      setMessages(Array.isArray(data) ? data.reverse() : []);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  useEffect(() => {
    if (!selectedGroup || !socket) return;
    setMessages([]); // FIXED: don't set sampleMessages here
    fetchMessages();
    socket.emit("join room", selectedGroup._id);

    socket.on("message received", (msg) => {
      setMessages(prev => prev.some(m => m._id === msg._id) ? prev : [...prev, msg]);
    });
    socket.on("users in room", setConnectedUsers);
    socket.on("user left", (userId) => {
      setConnectedUsers(prev => prev.filter(u => u?.socketId !== userId));
    });
    socket.on("notification", (n) => {
      if (n.type === "USER_JOINED") {
        // show subtle toast
        const event = new CustomEvent("collab-notification", { detail: n });
        window.dispatchEvent(event);
      }
    });
    socket.on("user typing", ({ username }) => {
      setTypingUsers(prev => new Set(prev).add(username));
    });
    socket.on("user stop typing", ({ username }) => {
      setTypingUsers(prev => { const s = new Set(prev); s.delete(username); return s; });
    });

    return () => {
      socket.emit("leave room", selectedGroup._id);
      socket.off("message received");
      socket.off("users in room");
      socket.off("user left");
      socket.off("notification");
      socket.off("user typing");
      socket.off("user stop typing");
    };
  }, [selectedGroup, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const token = localStorage.getItem("token");
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER}/api/messages`,
        { content: newMessage, groupId: selectedGroup?._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      socket.emit("new message", { ...data, groupId: selectedGroup?._id });
      setMessages(prev => [...prev, data]);
      setNewMessage("");
    } catch (err) {
      console.error("Send error:", err);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!isTyping && selectedGroup) {
      setIsTyping(true);
      socket.emit("typing", { groupId: selectedGroup._id, username: currentUser.name });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (selectedGroup) socket.emit("stop typing", { groupId: selectedGroup._id });
      setIsTyping(false);
    }, 2000);
  };

  const isOwn = (msg) => msg.sender?._id === currentUser?._id;

  if (!selectedGroup) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center" style={{ background: "var(--bg-primary)" }}>
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 flex items-center justify-center mb-4 border" style={{ borderColor: "var(--border)" }}>
          <FiMessageCircle size={32} style={{ color: "#7c3aed" }} />
        </div>
        <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Welcome to Chat</h2>
        <p style={{ color: "var(--text-secondary)" }}>Select a group from the sidebar to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full" style={{ background: "var(--bg-primary)" }}>
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0" style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-1.5 rounded-lg mr-1"
            style={{ color: "var(--text-secondary)", background: "rgba(255,255,255,0.05)" }}
            onClick={() => setSelectedGroup && setSelectedGroup(null)}
          >
            ←
          </button>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-sm font-bold text-white">
            {getInitials(selectedGroup.name)}
          </div>
          <div>
            <h2 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{selectedGroup.name}</h2>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {connectedUsers.length} online · {selectedGroup.description}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowUsers(!showUsers)}
          className="p-2 rounded-lg transition-colors"
          style={{ color: showUsers ? "#a78bfa" : "var(--text-secondary)", background: showUsers ? "rgba(124,58,237,0.15)" : "transparent" }}
        >
          <FiUsers size={18} />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Messages */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-8" style={{ color: "var(--text-muted)" }}>
                <FiMessageCircle size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No messages yet. Say hello! 👋</p>
              </div>
            )}

            {messages.map((msg) => {
              const own = isOwn(msg);
              return (
                <div key={msg._id || Math.random()} className={`flex items-end gap-2 animate-message-in ${own ? "justify-end" : "justify-start"}`}>
                  {!own && (
                    <div className="avatar avatar-sm flex-shrink-0 mb-1">
                      {getInitials(msg.sender?.name || "?")}
                    </div>
                  )}
                  <div className={`max-w-[70%] flex flex-col ${own ? "items-end" : "items-start"}`}>
                    {!own && (
                      <span className="text-xs mb-1 font-medium" style={{ color: "#a78bfa" }}>
                        {msg.sender?.name}
                      </span>
                    )}
                    <div
                      className="px-4 py-2.5 rounded-2xl text-sm"
                      style={{
                        background: own ? "linear-gradient(135deg, #7c3aed, #4f46e5)" : "var(--bg-card)",
                        color: own ? "white" : "var(--text-primary)",
                        borderRadius: own ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                        border: own ? "none" : "1px solid var(--border)",
                      }}
                    >
                      {msg.content}
                    </div>
                    <span className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                  {own && (
                    <div className="avatar avatar-sm flex-shrink-0 mb-1">
                      {getInitials(currentUser.name || "Me")}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Indicators */}
            {Array.from(typingUsers).filter(u => u !== currentUser?.name).map(username => (
              <div key={username} className="flex items-end gap-2 justify-start animate-fade-in">
                <div className="avatar avatar-sm flex-shrink-0 mb-1">{getInitials(username)}</div>
                <div className="px-4 py-2.5 rounded-2xl flex items-center gap-1" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                  <span className="text-xs mr-1" style={{ color: "#a78bfa" }}>{username}</span>
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t flex-shrink-0" style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={newMessage}
                onChange={handleTyping}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="input-dark flex-1"
              />
              <button onClick={sendMessage} disabled={!newMessage.trim()} className="btn-primary px-3 py-2.5 flex-shrink-0">
                <FiSend size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Users Panel */}
        {showUsers && (
          <div className="w-56 border-l flex-shrink-0 animate-slide-right" style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
            <UsersList users={connectedUsers} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatArea;
