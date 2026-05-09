import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { ACTIONS } from "../constants/Events.js";
import { io } from "../index.js";
import { User } from '../models/user.model.js';
import { logActivity } from './activity-logger.js';


dotenv.config();

const userSocketMap = {};

const getAllConnectedClients = (roomId) => {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => ({
      socketId,
      name: userSocketMap[socketId]?.name || "Anonymous",
    })
  );
};

const socketIo = (io) => {
  io.on("connection", async (socket) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        socket.emit("auth_error", { message: "No token provided" });
        socket.disconnect(true);
        return;
      }

      const decodedData = jwt.verify(token, process.env.JWT_SECERET);
      const user = await User.findById(decodedData.userId);
      if (!user) {
        socket.emit("auth_error", { message: "User not found" });
        socket.disconnect(true);
        return;
      }

      console.log("User connected:", user.name);

      // ─────────────────────────────────────────
      // CHAT ROOM EVENTS
      // ─────────────────────────────────────────
      socket.on("join room", (groupId) => {
        socket.join(groupId);
        userSocketMap[socket.id] = { user, name: user.name, room: groupId };

        const usersInRoom = getAllConnectedClients(groupId);
        io.in(groupId).emit("users in room", usersInRoom);
        io.in(groupId).emit("notification", {
          type: "USER_JOINED",
          message: `${user.name} has joined`,
          user,
        });
        logActivity(user._id, 'CHAT', 'Joined Group Chat', groupId);
      });

      socket.on("leave room", (groupId) => {
        socket.leave(groupId);
        if (userSocketMap[socket.id]) {
          delete userSocketMap[socket.id];
          io.in(groupId).emit("user left", user?._id);
        }
      });

      socket.on("new message", (message) => {
        io.in(message.groupId).emit("message received", message);
      });

      socket.on("typing", ({ groupId, username }) => {
        socket.to(groupId).emit("user typing", { username });
      });

      socket.on("stop typing", ({ groupId }) => {
        const userInfo = userSocketMap[socket.id];
        if (userInfo) {
          socket.to(groupId).emit("user stop typing", { username: userInfo.name });
        }
      });

      // ─────────────────────────────────────────
      // CODE EDITOR EVENTS
      // ─────────────────────────────────────────
      socket.on(ACTIONS.JOIN, ({ roomId, name }) => {
        userSocketMap[socket.id] = name;
        socket.join(roomId);
        const clients = getAllConnectedClients(roomId);
        clients.forEach(({ socketId }) => {
          io.to(socketId).emit(ACTIONS.JOINED, {
            clients,
            name,
            socketId: socket.id,
          });
        });
      });

      socket.on("join editor", (roomid) => {
        socket.join(roomid);
        userSocketMap[socket.id] = { user, name: user.name, room: roomid };
        const usersInRoom = getAllConnectedClients(roomid);
        io.in(roomid).emit("users in editor room", usersInRoom);
        io.in(roomid).emit("notification", {
          type: "USER_JOINED",
          message: `${user.name} has joined the editor`,
          user,
        });
        logActivity(user._id, 'CODE', 'Joined Collaborative Editor', roomid);
      });

      socket.on("editor_change", ({ roomid, code }) => {
        // FIX: broadcast only to that room, not all clients
        socket.to(roomid).emit("editor_change", { roomid, newCode: code });
      });

      socket.on("leave_editor", (roomid) => {
        socket.leave(roomid);
        if (userSocketMap[socket.id]) {
          delete userSocketMap[socket.id];
          io.in(roomid).emit("user left", user?._id);
        }
      });

      // ─────────────────────────────────────────
      // WHITEBOARD EVENTS
      // ─────────────────────────────────────────
      socket.on("join_whiteboard_room", (roomid) => {
        socket.join(roomid);
        userSocketMap[socket.id] = { user, name: user.name, room: roomid };
        const usersInRoom = getAllConnectedClients(roomid);
        io.in(roomid).emit("users in whiteboard room", usersInRoom);
        io.in(roomid).emit("notification", {
          type: "USER_JOINED",
          message: `${user.name} has joined the whiteboard`,
          user,
        });
        logActivity(user._id, 'WHITEBOARD', 'Joined Whiteboard Session', roomid);
      });

      // FIX: was "leave_whitwboard_room" (typo)
      socket.on("leave_whiteboard_room", (roomid) => {
        socket.leave(roomid);
        if (userSocketMap[socket.id]) {
          delete userSocketMap[socket.id];
          io.in(roomid).emit("user left", user?._id);
        }
      });

      socket.on("canvas-data", ({ roomid, data }) => {
        // FIX: was socket.broadcast.emit (sends to ALL) — now room-scoped
        socket.to(roomid).emit("canvas-data", data);
      });

      socket.on("whiteboard-clear", (roomid) => {
        socket.to(roomid).emit("whiteboard-clear");
      });

      // ─────────────────────────────────────────
      // DOC EDITOR EVENTS
      // ─────────────────────────────────────────
      socket.on("join_doc_room", (roomid) => {
        socket.join(roomid);
        userSocketMap[socket.id] = { user, name: user.name, room: roomid };
        const usersInRoom = getAllConnectedClients(roomid);
        io.in(roomid).emit("users in doc room", usersInRoom);
        io.in(roomid).emit("notification", {
          type: "USER_JOINED",
          message: `${user.name} has joined the document`,
          user,
        });
        logActivity(user._id, 'DOCS', 'Joined Document Studio', roomid);
      });

      socket.on("doc_change", ({ roomid, delta, content }) => {
        socket.to(roomid).emit("doc_change", { delta, content });
      });

      socket.on("doc_cursor", ({ roomid, range, name }) => {
        socket.to(roomid).emit("doc_cursor", { range, name, userId: user._id });
      });

      socket.on("leave_doc_room", (roomid) => {
        socket.leave(roomid);
        if (userSocketMap[socket.id]) {
          delete userSocketMap[socket.id];
          io.in(roomid).emit("user left", user?._id);
        }
      });

      // ─────────────────────────────────────────
      // PPT EDITOR EVENTS
      // ─────────────────────────────────────────
      socket.on("join_ppt_room", (roomid) => {
        socket.join(roomid);
        userSocketMap[socket.id] = { user, name: user.name, room: roomid };
        const usersInRoom = getAllConnectedClients(roomid);
        io.in(roomid).emit("users in ppt room", usersInRoom);
        io.in(roomid).emit("notification", {
          type: "USER_JOINED",
          message: `${user.name} has joined the presentation`,
          user,
        });
        logActivity(user._id, 'PPT', 'Joined PPT Presentation', roomid);
      });

      socket.on("ppt_slide_add", ({ roomid, slide }) => {
        socket.to(roomid).emit("ppt_slide_add", { slide });
      });

      socket.on("ppt_slide_update", ({ roomid, slide }) => {
        socket.to(roomid).emit("ppt_slide_update", { slide });
      });

      socket.on("ppt_slide_delete", ({ roomid, slideId }) => {
        socket.to(roomid).emit("ppt_slide_delete", { slideId });
      });

      socket.on("ppt_slide_reorder", ({ roomid, slides }) => {
        socket.to(roomid).emit("ppt_slide_reorder", { slides });
      });

      socket.on("ppt_current_slide", ({ roomid, slideIndex }) => {
        socket.to(roomid).emit("ppt_current_slide", { slideIndex });
      });

      socket.on("leave_ppt_room", (roomid) => {
        socket.leave(roomid);
        if (userSocketMap[socket.id]) {
          delete userSocketMap[socket.id];
          io.in(roomid).emit("user left", user?._id);
        }
      });

      // ─────────────────────────────────────────
      // PHOTO EDITOR EVENTS
      // ─────────────────────────────────────────
      socket.on("join_photo_room", (roomid) => {
        socket.join(roomid);
        userSocketMap[socket.id] = { user, name: user.name, room: roomid };
        const usersInRoom = getAllConnectedClients(roomid);
        io.in(roomid).emit("users in photo room", usersInRoom);
        io.in(roomid).emit("notification", {
          type: "USER_JOINED",
          message: `${user.name} has joined the photo editor`,
          user,
        });
        logActivity(user._id, 'PHOTO', 'Joined Photo Studio', roomid);
      });

      socket.on("photo_object_add", ({ roomid, obj }) => {
        socket.to(roomid).emit("photo_object_add", { obj });
      });

      socket.on("photo_object_modify", ({ roomid, obj }) => {
        socket.to(roomid).emit("photo_object_modify", { obj });
      });

      socket.on("photo_object_delete", ({ roomid, objId }) => {
        socket.to(roomid).emit("photo_object_delete", { objId });
      });

      socket.on("photo_canvas_state", ({ roomid, state }) => {
        socket.to(roomid).emit("photo_canvas_state", { state });
      });

      socket.on("leave_photo_room", (roomid) => {
        socket.leave(roomid);
        if (userSocketMap[socket.id]) {
          delete userSocketMap[socket.id];
          io.in(roomid).emit("user left", user?._id);
        }
      });

      // ─────────────────────────────────────────
      // DISCONNECT
      // ─────────────────────────────────────────
      socket.on("disconnect", () => {
        const userData = userSocketMap[socket.id];
        if (userData) {
          io.in(userData.room).emit("user left", userData.user?._id);
          delete userSocketMap[socket.id];
        }
        console.log(`User disconnected: ${userData?.name || "Unknown"}`);
      });

    } catch (error) {
      console.error("Socket auth error:", error.message);
      socket.emit("auth_error", { message: "Authentication failed" });
      socket.disconnect(true);
    }
  });
};

export default socketIo;
