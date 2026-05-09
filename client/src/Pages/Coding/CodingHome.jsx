import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import CodingEditor from "./CodingEditor";
import JoinRoomTemplate from "../../components/JoinRoomTemplate";

const ENDPOINT = import.meta.env.VITE_SERVER;

function CodingHome() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [editor, seteditor] = useState(false);
  const socketRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to access the code editor");
      navigate("/login");
      return;
    }
    const userinfo = JSON.parse(localStorage.getItem("userinfo") || "{}");
    if (userinfo.name) setUsername(userinfo.name);

    socketRef.current = io(ENDPOINT, { auth: { token } });
    return () => { if (socketRef.current) socketRef.current.disconnect(); };
  }, [navigate]);

  const joinRoom = () => {
    if (!roomId.trim() || !username.trim()) {
      toast.error("Please enter both Room ID and name");
      return;
    }
    seteditor(true);
  };

  if (editor) return (
    <CodingEditor seteditor={seteditor} socketRef={socketRef} roomid={roomId} username={username} />
  );

  return (
    <JoinRoomTemplate
      title="CodeLab"
      subtitle="Universal Collaborative IDE"
      icon="🖊️"
      roomId={roomId}
      setRoomId={setRoomId}
      username={username}
      setUsername={setUsername}
      onJoin={joinRoom}
      accentColor="#7c3aed"
    />
  );
}

export default CodingHome;
