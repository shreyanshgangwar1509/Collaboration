import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { ACTIONS } from "../constants/Events.js";
import { io } from "../index.js";
import { User } from '../models/user.model.js';
import { logActivity } from './activity-logger.js';
import { getJwtSecret } from './token.js';

dotenv.config();

const userSocketMap = {};
const globalOnlineUsers = new Map(); // Store userId -> { userId, name, socketId }

const broadcastPresence = (ioInstance) => {
  try {
    const users = Array.from(globalOnlineUsers.values());
    ioInstance.emit(ACTIONS.GLOBAL_PRESENCE, users);
  } catch (err) {
    console.error("Error broadcasting presence:", err.message);
  }
};

const getAllConnectedClients = (roomId) => {
  try {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
      (socketId) => ({
        socketId,
        name: userSocketMap[socketId]?.name || "Anonymous",
        userId: userSocketMap[socketId]?.user?._id,
      })
    );
  } catch (err) {
    console.error("Error getting connected clients:", err.message);
    return [];
  }
};

const socketIo = (ioInstance) => {
  ioInstance.on("connection", async (socket) => {
    let currentUser = null;

    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        socket.emit("auth_error", { message: "No token provided" });
        socket.disconnect(true);
        return;
      }

      const secret = getJwtSecret();
      let decodedData;
      try {
        decodedData = jwt.verify(token, secret);
      } catch (jwtErr) {
        socket.emit("auth_error", { message: "Invalid or expired token" });
        socket.disconnect(true);
        return;
      }

      currentUser = await User.findById(decodedData.userId);
      if (!currentUser) {
        socket.emit("auth_error", { message: "User not found" });
        socket.disconnect(true);
        return;
      }

      const user = currentUser;

      // Add to global presence
      globalOnlineUsers.set(user._id.toString(), {
        userId: user._id,
        name: user.name,
        socketId: socket.id,
      });
      broadcastPresence(ioInstance);

      // Safe handler wrapper to prevent unhandled socket events from crashing server
      const safeHandler = (fn) => (...args) => {
        try {
          fn(...args);
        } catch (err) {
          console.error(`Socket event error (${socket.id}):`, err.message);
        }
      };

      // ─────────────────────────────────────────
      // CHAT ROOM EVENTS
      // ─────────────────────────────────────────
      socket.on(ACTIONS.JOIN_ROOM || "join room", safeHandler((groupId) => {
        if (!groupId) return;
        socket.join(groupId);
        userSocketMap[socket.id] = { user, name: user.name, room: groupId };

        const usersInRoom = getAllConnectedClients(groupId);
        ioInstance.in(groupId).emit(ACTIONS.USERS_IN_ROOM, usersInRoom);
        ioInstance.in(groupId).emit(ACTIONS.NOTIFICATION, {
          type: "USER_JOINED",
          message: `${user.name} has joined`,
          user,
        });
        logActivity(user._id, 'CHAT', 'Joined Group Chat', groupId);
      }));

      socket.on(ACTIONS.LEAVE_ROOM || "leave room", safeHandler((groupId) => {
        if (!groupId) return;
        socket.leave(groupId);
        if (userSocketMap[socket.id]) {
          delete userSocketMap[socket.id];
          ioInstance.in(groupId).emit(ACTIONS.USER_LEFT, user?._id);
        }
      }));

      socket.on(ACTIONS.NEW_MESSAGE || "new message", safeHandler((message) => {
        if (message?.groupId) {
          ioInstance.in(message.groupId).emit(ACTIONS.MESSAGE_RECEIVED, message);
        }
      }));

      socket.on(ACTIONS.TYPING || "typing", safeHandler(({ groupId, username }) => {
        if (groupId) {
          socket.to(groupId).emit(ACTIONS.USER_TYPING, { username: username || user.name });
        }
      }));

      socket.on(ACTIONS.STOP_TYPING || "stop typing", safeHandler(({ groupId }) => {
        if (groupId) {
          const userInfo = userSocketMap[socket.id];
          socket.to(groupId).emit(ACTIONS.USER_STOP_TYPING, { username: userInfo?.name || user.name });
        }
      }));

      // ─────────────────────────────────────────
      // CODE EDITOR EVENTS
      // ─────────────────────────────────────────
      socket.on(ACTIONS.JOIN, safeHandler(({ roomId, name }) => {
        if (!roomId) return;
        const displayName = name || user.name;
        userSocketMap[socket.id] = { user, name: displayName, room: roomId };
        socket.join(roomId);
        const clients = getAllConnectedClients(roomId);
        clients.forEach(({ socketId }) => {
          ioInstance.to(socketId).emit(ACTIONS.JOINED, {
            clients,
            name: displayName,
            socketId: socket.id,
          });
        });
      }));

      socket.on(ACTIONS.JOIN_EDITOR, safeHandler((roomid) => {
        if (!roomid) return;
        socket.join(roomid);
        userSocketMap[socket.id] = { user, name: user.name, room: roomid };
        const usersInRoom = getAllConnectedClients(roomid);
        ioInstance.in(roomid).emit(ACTIONS.USERS_IN_EDITOR || "users in editor room", usersInRoom);
        ioInstance.in(roomid).emit(ACTIONS.NOTIFICATION, {
          type: "USER_JOINED",
          message: `${user.name} has joined the editor`,
          user,
        });
        logActivity(user._id, 'CODE', 'Joined Collaborative Editor', roomid);
      }));

      socket.on(ACTIONS.EDITOR_CHANGE, safeHandler(({ roomid, code }) => {
        if (roomid) {
          socket.to(roomid).emit(ACTIONS.EDITOR_CHANGE, { roomid, newCode: code });
        }
      }));

      socket.on(ACTIONS.LEAVE_EDITOR, safeHandler((roomid) => {
        if (!roomid) return;
        socket.leave(roomid);
        if (userSocketMap[socket.id]) {
          delete userSocketMap[socket.id];
          ioInstance.in(roomid).emit(ACTIONS.USER_LEFT, user?._id);
        }
      }));

      // ─────────────────────────────────────────
      // WHITEBOARD EVENTS
      // ─────────────────────────────────────────
      socket.on("join_whiteboard_room", safeHandler((roomid) => {
        if (!roomid) return;
        socket.join(roomid);
        userSocketMap[socket.id] = { user, name: user.name, room: roomid };
        const usersInRoom = getAllConnectedClients(roomid);
        ioInstance.in(roomid).emit("users in whiteboard room", usersInRoom);
        ioInstance.in(roomid).emit(ACTIONS.NOTIFICATION, {
          type: "USER_JOINED",
          message: `${user.name} joined Whiteboard`,
          user,
        });
        logActivity(user._id, 'WHITEBOARD', 'Joined Whiteboard Session', roomid);
      }));

      socket.on("canvas-data", safeHandler((data) => {
        const userData = userSocketMap[socket.id];
        if (userData?.room) {
          socket.to(userData.room).emit("canvas-data", data);
        }
      }));

      socket.on("whiteboard-clear", safeHandler((roomid) => {
        if (roomid) {
          socket.to(roomid).emit("whiteboard-clear");
        }
      }));

      socket.on("leave_whiteboard_room", safeHandler((roomid) => {
        if (!roomid) return;
        socket.leave(roomid);
        if (userSocketMap[socket.id]) {
          delete userSocketMap[socket.id];
          ioInstance.in(roomid).emit(ACTIONS.USER_LEFT, user?._id);
        }
      }));

      // ─────────────────────────────────────────
      // DOCS EVENTS
      // ─────────────────────────────────────────
      socket.on("join_docs_room", safeHandler((roomid) => {
        if (!roomid) return;
        socket.join(roomid);
        userSocketMap[socket.id] = { user, name: user.name, room: roomid };
        const usersInRoom = getAllConnectedClients(roomid);
        ioInstance.in(roomid).emit("users in docs room", usersInRoom);
        ioInstance.in(roomid).emit(ACTIONS.NOTIFICATION, {
          type: "USER_JOINED",
          message: `${user.name} has joined Docs`,
          user,
        });
        logActivity(user._id, 'DOCS', 'Joined Docs Studio', roomid);
      }));

      socket.on("docs_content_change", safeHandler(({ roomid, delta }) => {
        if (roomid) {
          socket.to(roomid).emit("docs_content_change", { delta });
        }
      }));

      socket.on("leave_docs_room", safeHandler((roomid) => {
        if (!roomid) return;
        socket.leave(roomid);
        if (userSocketMap[socket.id]) {
          delete userSocketMap[socket.id];
          ioInstance.in(roomid).emit(ACTIONS.USER_LEFT, user?._id);
        }
      }));

      // ─────────────────────────────────────────
      // PPT EVENTS
      // ─────────────────────────────────────────
      socket.on("join_ppt_room", safeHandler((roomid) => {
        if (!roomid) return;
        socket.join(roomid);
        userSocketMap[socket.id] = { user, name: user.name, room: roomid };
        const usersInRoom = getAllConnectedClients(roomid);
        ioInstance.in(roomid).emit("users in ppt room", usersInRoom);
        ioInstance.in(roomid).emit(ACTIONS.NOTIFICATION, {
          type: "USER_JOINED",
          message: `${user.name} joined PPT Studio`,
          user,
        });
        logActivity(user._id, 'PPT', 'Joined PPT Studio', roomid);
      }));

      socket.on("ppt_state_change", safeHandler(({ roomid, slides, currentSlide }) => {
        if (roomid) {
          socket.to(roomid).emit("ppt_state_change", { slides, currentSlide });
        }
      }));

      socket.on("leave_ppt_room", safeHandler((roomid) => {
        if (!roomid) return;
        socket.leave(roomid);
        if (userSocketMap[socket.id]) {
          delete userSocketMap[socket.id];
          ioInstance.in(roomid).emit(ACTIONS.USER_LEFT, user?._id);
        }
      }));

      // ─────────────────────────────────────────
      // PHOTO STUDIO EVENTS
      // ─────────────────────────────────────────
      socket.on("join_photo_room", safeHandler((roomid) => {
        if (!roomid) return;
        socket.join(roomid);
        userSocketMap[socket.id] = { user, name: user.name, room: roomid };
        const usersInRoom = getAllConnectedClients(roomid);
        ioInstance.in(roomid).emit("users in photo room", usersInRoom);
        ioInstance.in(roomid).emit(ACTIONS.NOTIFICATION, {
          type: "USER_JOINED",
          message: `${user.name} joined Photo Studio`,
          user,
        });
        logActivity(user._id, 'PHOTO', 'Joined Photo Studio', roomid);
      }));

      socket.on(ACTIONS.PHOTO_OBJECT_ADD, safeHandler(({ roomid, obj }) => {
        if (roomid) socket.to(roomid).emit(ACTIONS.PHOTO_OBJECT_ADD, { obj });
      }));

      socket.on(ACTIONS.PHOTO_OBJECT_MODIFY, safeHandler(({ roomid, obj }) => {
        if (roomid) socket.to(roomid).emit(ACTIONS.PHOTO_OBJECT_MODIFY, { obj });
      }));

      socket.on(ACTIONS.PHOTO_OBJECT_DELETE, safeHandler(({ roomid, objId }) => {
        if (roomid) socket.to(roomid).emit(ACTIONS.PHOTO_OBJECT_DELETE, { objId });
      }));

      socket.on(ACTIONS.PHOTO_CANVAS_STATE, safeHandler(({ roomid, state }) => {
        if (roomid) socket.to(roomid).emit(ACTIONS.PHOTO_CANVAS_STATE, { state });
      }));

      socket.on(ACTIONS.LEAVE_PHOTO, safeHandler((roomid) => {
        if (!roomid) return;
        socket.leave(roomid);
        if (userSocketMap[socket.id]) {
          delete userSocketMap[socket.id];
          ioInstance.in(roomid).emit(ACTIONS.USER_LEFT, user?._id);
        }
      }));

      // ─────────────────────────────────────────
      // DISCONNECT
      // ─────────────────────────────────────────
      socket.on("disconnect", () => {
        try {
          const userData = userSocketMap[socket.id];
          if (userData?.room) {
            ioInstance.in(userData.room).emit(ACTIONS.USER_LEFT, userData.user?._id);
          }
          delete userSocketMap[socket.id];

          if (user?._id) {
            globalOnlineUsers.delete(user._id.toString());
            broadcastPresence(ioInstance);
          }
        } catch (discErr) {
          console.error("Error during socket disconnect cleanup:", discErr.message);
        }
      });

    } catch (error) {
      console.error("Socket auth error:", error.message);
      socket.emit("auth_error", { message: "Authentication failed" });
      socket.disconnect(true);
    }
  });
};

export default socketIo;
