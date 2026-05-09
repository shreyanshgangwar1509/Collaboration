import React from "react";
import { FiPlus, FiCopy, FiZap } from "react-icons/fi";
import { v4 as uuid } from "uuid";
import toast from "react-hot-toast";

const JoinRoomTemplate = ({ 
  title, 
  subtitle, 
  icon, 
  roomId, 
  setRoomId, 
  username, 
  setUsername, 
  onJoin, 
  accentColor = "#7c3aed" 
}) => {
  const generateRoomId = () => {
    const id = uuid();
    setRoomId(id);
    toast.success("Room ID generated! 🚀");
  };

  const copyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      toast.success("Room ID copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-animated-gradient relative p-6 pt-20">
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute w-[400px] h-[400px] rounded-full opacity-10 blur-[100px] -top-20 -left-20 animate-orb" 
          style={{ background: accentColor }} 
        />
        <div 
          className="absolute w-[300px] h-[300px] rounded-full opacity-5 blur-[80px] bottom-0 right-0 animate-orb" 
          style={{ background: accentColor, animationDelay: "4s" }} 
        />
      </div>

      <div className="room-card z-10 animate-slide-up max-w-md w-full">
        <div className="flex flex-col items-center mb-8">
          <div className="text-4xl mb-4 animate-float">{icon}</div>
          <h2 className="text-2xl font-bold gradient-text">{title}</h2>
          <p className="text-sm mt-1 opacity-60 uppercase tracking-widest">{subtitle}</p>
        </div>

        <div className="space-y-5">
          {/* Room ID Section */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 ml-1">
              Room ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onJoin()}
                placeholder="Enter or generate ID"
                className="input-dark flex-1"
              />
              <button 
                onClick={generateRoomId} 
                className="p-3 rounded-xl transition-all border border-white/5 hover:border-white/20 bg-white/5"
                title="Generate New ID"
              >
                <FiPlus style={{ color: accentColor }} />
              </button>
              {roomId && (
                <button 
                  onClick={copyRoomId} 
                  className="p-3 rounded-xl transition-all border border-white/5 hover:border-white/20 bg-white/5"
                  title="Copy ID"
                >
                  <FiCopy />
                </button>
              )}
            </div>
          </div>

          {/* Username Section */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 ml-1">
              Your Display Name
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onJoin()}
              placeholder="How others see you"
              className="input-dark"
            />
          </div>

          <button 
            onClick={onJoin} 
            className="btn-primary w-full py-3.5 mt-2 flex items-center justify-center gap-2 group"
            style={{ 
               background: `linear-gradient(135deg, ${accentColor}, #4f46e5)`,
               boxShadow: `0 8px 25px -5px ${accentColor}40`
            }}
          >
            <FiZap className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            Enter Room
          </button>

          <div className="divider" />

          <p className="text-[11px] text-center opacity-50 px-4">
             Collaborate in real-time with your team. Changes are synced instantly across all members.
          </p>
        </div>
      </div>
    </div>
  );
};

export default JoinRoomTemplate;
