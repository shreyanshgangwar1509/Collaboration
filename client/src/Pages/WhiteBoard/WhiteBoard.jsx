import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FiDownload, FiTrash2, FiRotateCcw, FiUsers, FiEdit2, FiSquare, FiCircle, FiMinus, FiMove } from "react-icons/fi";

const TOOLS = [
  { id: "pen",    label: "Pen",    icon: <FiEdit2 size={18} />,     cursor: "crosshair" },
  { id: "line",   label: "Line",   icon: <FiMinus size={18} />,     cursor: "crosshair" },
  { id: "rect",   label: "Rect",   icon: <FiSquare size={18} />,    cursor: "crosshair" },
  { id: "circle", label: "Circle", icon: <FiCircle size={18} />,    cursor: "crosshair" },
  { id: "eraser", label: "Eraser", icon: <FiMove size={18} />,      cursor: "cell" },
];

const getInitials = (name = "") =>
  name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

function WhiteBoard({ socketRef, roomid, username }) {
  const canvasRef = useRef(null);
  const timeoutRef = useRef(null);
  const ctxRef = useRef(null);
  const [color, setColor] = useState("#a78bfa");
  const [lineWidth, setLineWidth] = useState(4);
  const [tool, setTool] = useState("pen");
  const [history, setHistory] = useState([]);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [showUsers, setShowUsers] = useState(false);
  
  const isDrawing = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const snapshot = useRef(null);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    socket.emit("join_whiteboard_room", roomid);
    socket.on("canvas-data", (data) => {
      if (!canvasRef.current) return;
      const image = new Image();
      const ctx = canvasRef.current.getContext("2d");
      image.onload = () => ctx.drawImage(image, 0, 0);
      image.src = data;
    });
    socket.on("whiteboard-clear", () => {
      if (canvasRef.current && ctxRef.current) {
        ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    });
    socket.on("users in whiteboard room", setConnectedUsers);
    socket.on("user left", (userId) => setConnectedUsers(prev => prev.filter(u => u?.socketId !== userId)));
    socket.on("notification", (n) => toast.success(n.message, { icon: "🎨" }));
    return () => {
      socket.emit("leave_whiteboard_room", roomid);
      socket.off("canvas-data");
      socket.off("whiteboard-clear");
      socket.off("users in whiteboard room");
      socket.off("user left");
      socket.off("notification");
    };
  }, [socketRef, roomid]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    ctxRef.current = canvas.getContext("2d");
    ctxRef.current.lineCap = "round";
    ctxRef.current.lineJoin = "round";
  }, []);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    if (e.touches) return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e) => {
    isDrawing.current = true;
    const pos = getPos(e);
    startPos.current = pos;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(pos.x, pos.y);
    setHistory(prev => [...prev, canvasRef.current.toDataURL()]);
    snapshot.current = ctxRef.current.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const drawingAction = (e) => {
    if (!isDrawing.current) return;
    const pos = getPos(e);
    const ctx = ctxRef.current;
    
    if (tool !== "pen" && tool !== "eraser") {
      ctx.putImageData(snapshot.current, 0, 0);
    }

    ctx.strokeStyle = tool === "eraser" ? "#0d0d1a" : color;
    ctx.lineWidth = tool === "eraser" ? lineWidth * 5 : lineWidth;

    if (tool === "pen" || tool === "eraser") {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (tool === "rect") {
      ctx.strokeRect(startPos.current.x, startPos.current.y, pos.x - startPos.current.x, pos.y - startPos.current.y);
    } else if (tool === "circle") {
      const radius = Math.sqrt(Math.pow(pos.x - startPos.current.x, 2) + Math.pow(pos.y - startPos.current.y, 2));
      ctx.beginPath();
      ctx.arc(startPos.current.x, startPos.current.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (tool === "line") {
      ctx.beginPath();
      ctx.moveTo(startPos.current.x, startPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  };

  const endDraw = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    ctxRef.current.closePath();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("canvas-data", { roomid, data: canvasRef.current.toDataURL("image/png") });
    }, 400);
  };

  const clearCanvas = () => {
    ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    socketRef.current?.emit("whiteboard-clear", roomid);
    toast.success("Canvas cleared");
  };

  const undoLast = () => {
    if (history.length === 0) return;
    const newHist = [...history];
    const prev = newHist.pop();
    setHistory(newHist);
    const img = new Image();
    img.src = prev;
    img.onload = () => {
      ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctxRef.current.drawImage(img, 0, 0);
      socketRef.current?.emit("canvas-data", { roomid, data: canvasRef.current.toDataURL("image/png") });
    };
  };

  return (
    <div className="flex h-screen overflow-hidden pt-16" style={{ background: "var(--bg-primary)" }}>
      {/* LEFT SIDEBAR TOOLS */}
      <div className="w-16 flex-shrink-0 flex flex-col items-center py-4 gap-4 border-r" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
        {TOOLS.map(t => (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            className="p-3 rounded-xl transition-all duration-200"
            style={{
              background: tool === t.id ? "linear-gradient(135deg,#7c3aed,#4f46e5)" : "transparent",
              color: tool === t.id ? "white" : "var(--text-secondary)",
              boxShadow: tool === t.id ? "0 4px 12px rgba(124,58,237,0.3)" : "none"
            }}
            title={t.label}
          >
            {t.icon}
          </button>
        ))}
        
        <div className="w-8 h-px bg-white/10 my-2" />
        
        {/* Color Picker Input */}
        <div className="relative group">
          <div className="w-10 h-10 rounded-lg border-2" style={{ backgroundColor: color, borderColor: "rgba(255,255,255,0.2)" }} />
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>

        {/* Undo/Clear */}
        <button onClick={undoLast} className="p-3 text-violet-400 hover:bg-white/5 rounded-xl" title="Undo"><FiRotateCcw size={18} /></button>
        <button onClick={clearCanvas} className="p-3 text-red-400 hover:bg-white/5 rounded-xl" title="Clear All"><FiTrash2 size={18} /></button>
      </div>

      {/* MAIN CANVAS AREA */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Mini Bar (Small settings) */}
        <div className="flex items-center gap-4 px-4 py-2 border-b text-xs uppercase tracking-widest font-semibold" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)", color: "var(--text-muted)" }}>
          <div className="flex items-center gap-2">
            <span>Size</span>
            <input type="range" min="1" max="50" value={lineWidth} onChange={e => setLineWidth(+e.target.value)} className="w-24 accent-violet-600" />
            <span className="w-4">{lineWidth}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setShowUsers(!showUsers)} className="flex items-center gap-1.5 px-2 py-1 rounded border border-white/10 hover:border-violet-500/50 transition-colors">
              <FiUsers size={12} /> {connectedUsers.length}
            </button>
            <button onClick={() => {
               const link = document.createElement("a");
               link.download = `whiteboard-${roomid.slice(0, 6)}.png`;
               link.href = canvasRef.current.toDataURL();
               link.click();
            }} className="flex items-center gap-1.5 px-2 py-1 rounded bg-violet-600/20 text-violet-400 border border-violet-500/20">
              <FiDownload size={12} /> Save
            </button>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          onMouseDown={startDraw}
          onMouseMove={drawingAction}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={drawingAction}
          onTouchEnd={endDraw}
          className="flex-1 cursor-crosshair touch-none"
          style={{ background: "#0d0d1a" }}
        />

        {/* Online List Overlay */}
        {showUsers && (
          <div className="absolute top-12 right-4 w-48 rounded-xl border animate-slide-right p-3 z-10" style={{ background: "rgba(20,20,31,0.9)", borderColor: "var(--border)", backdropFilter: "blur(10px)" }}>
            <p className="text-[10px] uppercase font-bold mb-3 opacity-50">Online Now</p>
            <div className="space-y-2">
              {connectedUsers.map(u => (
                <div key={u.socketId} className="flex items-center gap-2">
                  <div className="avatar avatar-sm border border-violet-500/30">{getInitials(u.name)}</div>
                  <span className="text-xs truncate">{u.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WhiteBoard;
