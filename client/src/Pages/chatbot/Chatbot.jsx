import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { FaRobot } from "react-icons/fa";
import { IoSend, IoTrash, IoRefresh } from "react-icons/io5";
import toast from "react-hot-toast";

const SUGGESTED = [
  "What is this app?",
  "How do I use socket.io?",
  "Explain React hooks",
  "Show me a Python example",
  "How to debug JavaScript?",
  "Best coding practices",
];

const formatMessage = (text) => {
  if (!text) return null;
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts.map((part, i) => {
    if (part.startsWith("```")) {
      const code = part.replace(/^```\w*\n?/, "").replace(/```$/, "");
      return (
        <pre key={i} className="chat-code">
          {code}
        </pre>
      );
    }
    // Handle **bold**, bullet points, line breaks
    const rendered = part
      .split("\n")
      .map((line, j) => {
        const boldLine = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        return (
          <span key={j} dangerouslySetInnerHTML={{ __html: boldLine }} style={{ display: "block", lineHeight: 1.6 }} />
        );
      });
    return <span key={i}>{rendered}</span>;
  });
};

const Chatbot = () => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversations, setConversations] = useState(() => {
    try {
      const saved = localStorage.getItem("chatbotConversations");
      return saved ? JSON.parse(saved) : [
        { role: "assistant", content: "👋 Hello! I'm **CollabBot**, your AI coding assistant.\n\nI can help you with:\n- **JavaScript**, Python, React, Node.js\n- Algorithms & debugging\n- CollabSpace features\n\nWhat would you like to know?" }
      ];
    } catch { return []; }
  });
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, isTyping]);

  useEffect(() => {
    localStorage.setItem("chatbotConversations", JSON.stringify(conversations));
  }, [conversations]);

  const sendMessage = async (text) => {
    const msg = (text || message).trim();
    if (!msg) return;

    setConversations(prev => [...prev, { role: "user", content: msg }]);
    setMessage("");
    setIsTyping(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER}/api/chatbot/ask`,
        { message: msg },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      setConversations(prev => [...prev, { role: "assistant", content: res.data.message }]);
    } catch {
      setConversations(prev => [...prev, {
        role: "assistant",
        content: "⚠️ I'm having trouble connecting. Please check if the server is running and try again!"
      }]);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    setConversations([{
      role: "assistant",
      content: "🔄 Chat cleared! How can I help you today?"
    }]);
    localStorage.removeItem("chatbotConversations");
    toast.success("Chat cleared");
  };

  return (
    <div className="flex flex-col h-screen pt-16" style={{ background: "var(--bg-primary)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center animate-pulse-glow">
            <FaRobot className="text-white text-sm" />
          </div>
          <div>
            <h1 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>CollabBot</h1>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1" />
              AI Assistant • Always Online
            </p>
          </div>
        </div>
        <button onClick={clearChat} className="btn-secondary flex items-center gap-1 px-3 py-1.5 text-xs">
          <IoTrash size={14} /> Clear
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {conversations.map((entry, i) => (
          <div
            key={i}
            className={`flex items-end gap-2 animate-message-in ${entry.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {entry.role === "assistant" && (
              <div className="avatar avatar-sm flex-shrink-0 mb-1">
                <FaRobot size={12} className="text-white" />
              </div>
            )}
            <div className={entry.role === "user" ? "chat-message-user" : "chat-message-bot"}>
              <div className="text-sm leading-relaxed">
                {formatMessage(entry.content)}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-end gap-2 justify-start animate-fade-in">
            <div className="avatar avatar-sm flex-shrink-0 mb-1">
              <FaRobot size={12} className="text-white" />
            </div>
            <div className="chat-message-bot flex items-center gap-1 py-3 px-4">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested Prompts */}
      {conversations.length <= 2 && (
        <div className="px-4 pb-2">
          <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>💡 Quick prompts:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED.map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s)}
                className="text-xs px-3 py-1.5 rounded-full border transition-all hover:scale-105"
                style={{
                  border: "1px solid var(--border)",
                  color: "#a78bfa",
                  background: "rgba(124,58,237,0.08)",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t" style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
        <div className="flex gap-2 items-center">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Ask me anything about coding..."
            className="input-dark flex-1"
            disabled={isTyping}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!message.trim() || isTyping}
            className="btn-primary px-4 py-3 flex-shrink-0"
          >
            {isTyping ? <div className="spinner" /> : <IoSend size={16} />}
          </button>
        </div>
        <p className="text-center text-xs mt-2" style={{ color: "var(--text-muted)" }}>
          Press Enter to send • Supports code examples & markdown
        </p>
      </div>
    </div>
  );
};

export default Chatbot;