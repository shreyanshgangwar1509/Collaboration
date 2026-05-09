import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import ChatArea from "../../components/chat/ChatArea";
import Sidebar from "../../components/chat/Sidebar";

const ENDPOINT = import.meta.env.VITE_SERVER;

const Chat = () => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    const newSocket = io(ENDPOINT, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
    });

    newSocket.on("auth_error", () => {
      localStorage.removeItem("token");
      navigate("/login");
    });

    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, [navigate]);

  return (
    <div className="flex h-screen pt-16" style={{ background: "var(--bg-primary)" }}>
      <div className="w-72 flex-shrink-0 h-full">
        <Sidebar setSelectedGroup={setSelectedGroup} />
      </div>
      <div className="flex-1 flex h-full overflow-hidden">
        {socket && (
          <ChatArea
            selectedGroup={selectedGroup}
            socket={socket}
            setSelectedGroup={setSelectedGroup}
          />
        )}
      </div>
    </div>
  );
};

export default Chat;
