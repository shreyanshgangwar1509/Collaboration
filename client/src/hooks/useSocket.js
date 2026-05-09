import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const ENDPOINT = import.meta.env.VITE_SERVER;

/**
 * Custom hook for socket management with auto-reconnect.
 * @param {boolean} connect - Whether to attempt connection
 * @returns {React.MutableRefObject} socketRef
 */
const useSocket = (connect = true) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!connect) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(ENDPOINT, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("auth_error", ({ message }) => {
      console.error("Socket auth error:", message);
      socket.disconnect();
    });

    socket.on("connect_error", (err) => {
      console.warn("Socket connect error:", err.message);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [connect]);

  return socketRef;
};

export default useSocket;
