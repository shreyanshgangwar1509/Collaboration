import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import WhiteBoard from "./WhiteBoard";
import JoinRoomTemplate from "../../components/JoinRoomTemplate";

const ENDPOINT = import.meta.env.VITE_SERVER;

function WhiteHome() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [board, setboard] = useState(false);
  const socketRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    const userinfo = JSON.parse(localStorage.getItem("userinfo") || "{}");
    if (userinfo.name) setUsername(userinfo.name);

    socketRef.current = io(ENDPOINT, { auth: { token } });
    return () => { if (socketRef.current) socketRef.current.disconnect(); };
  }, [navigate]);

  const joinRoom = () => {
    if (!roomId.trim() || !username.trim()) {
      toast.error("Both Room ID and username are required");
      return;
    }
    setboard(true);
  };

  if (board) return <WhiteBoard socketRef={socketRef} roomid={roomId} username={username} />;

  return (
    <JoinRoomTemplate
      title="Whiteboard"
      subtitle="Visual Collaboration Studio"
      icon="🎨"
      roomId={roomId}
      setRoomId={setRoomId}
      username={username}
      setUsername={setUsername}
      onJoin={joinRoom}
      accentColor="#06b6d4"
    />
  );
}

export default WhiteHome;
