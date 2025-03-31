import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { v4 as uuid } from "uuid";
import WhiteBoard from "./WhiteBoard";

const ENDPOINT = import.meta.env.VITE_SERVER;

function WhiteHome() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [board, setboard] = useState(false);
  const socketRef = useRef(null); // Use useRef instead of useState

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found!");
      return;
    }

    const newSocket = io(ENDPOINT, {
      auth: { token },
    });

    socketRef.current = newSocket; // Correctly assign the socket reference

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const generateRoomId = (e) => {
    e.preventDefault();
    const Id = uuid();
    setRoomId(Id);
    toast.success("Room ID generated!");
  };

  const joinRoom = () => {
    setboard(true);
    if (!roomId || !username) {
      toast.error("Both fields are required");
      return;
    }

    // navigate(`${roomId}`, {
    //   state: { username, socketRef: socketRef.current }, // Pass the actual socket instance
    // });

    toast.success("Room created successfully!");
  };

  const handleInputEnter = (e) => {
    if (e.key === "Enter") {
      joinRoom();
    }
  };

  return board?( <WhiteBoard socketRef={socketRef} roomid={roomId} username={username} />):(
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-6">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg shadow-lg p-6 rounded-2xl text-center border border-white/20">
        {/* Logo */}
        <img
          src="/images/codecast.png"
          alt="Logo"
          className="mx-auto w-24 h-24 mb-4 animate-pulse"
        />

        <h2 className="text-2xl font-bold text-white mb-2">Enter the Room ID</h2>
        <p className="text-gray-300 mb-4">Collaborate in real-time</p>

        {/* Input Fields */}
        <div className="space-y-3">
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="ROOM ID"
            onKeyDown={handleInputEnter}
            className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="USERNAME"
            onKeyDown={handleInputEnter}
            className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          />
          {/* Join Button */}
          <button
            onClick={joinRoom}
            className="w-full p-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition transform hover:scale-105"
          >
            JOIN ROOM 🚀
          </button>
        </div>

        {/* Generate Room Link */}
        <p className="mt-4 text-gray-300">
          Don't have a room ID?{" "}
          <span
            onClick={generateRoomId}
            className="text-indigo-400 font-semibold cursor-pointer hover:underline"
          >
            Create New Room
          </span>
        </p>
      </div>
    </div>
  );
}

export default WhiteHome;
