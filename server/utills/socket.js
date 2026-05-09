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
      socket.on(ACTIONS.JOIN_ROOM || "join room", (groupId) => {
        socket.join(groupId);
        userSocketMap[socket.id] = { user, name: user.name, room: groupId };

        const usersInRoom = getAllConnectedClients(groupId);
        io.in(groupId).emit(ACTIONS.USERS_IN_ROOM, usersInRoom);
        io.in(groupId).emit(ACTIONS.NOTIFICATION, {
          type: "USER_JOINED",
          message: `${user.name} has joined`,
          user,
        });
        logActivity(user._id, 'CHAT', 'Joined Group Chat', groupId);
      });

      socket.on(ACTIONS.LEAVE_ROOM || "leave room", (groupId) => {
        socket.leave(groupId);
        if (userSocketMap[socket.id]) {
          delete userSocketMap[socket.id];
          io.in(groupId).emit(ACTIONS.USER_LEFT, user?._id);
        }
      });

      socket.on(ACTIONS.NEW_MESSAGE || "new message", (message) => {
        io.in(message.groupId).emit(ACTIONS.MESSAGE_RECEIVED, message);
      });

      socket.on(ACTIONS.TYPING || "typing", ({ groupId, username }) => {
        socket.to(groupId).emit(ACTIONS.USER_TYPING, { username });
      });

      socket.on(ACTIONS.STOP_TYPING || "stop typing", ({ groupId }) => {
        const userInfo = userSocketMap[socket.id];
        if (userInfo) {
          socket.to(groupId).emit(ACTIONS.USER_STOP_TYPING, { username: userInfo.name });
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

      socket.on(ACTIONS.JOIN_EDITOR, (roomid) => {
        socket.join(roomid);
        userSocketMap[socket.id] = { user, name: user.name, room: roomid };
        const usersInRoom = getAllConnectedClients(roomid);
        io.in(roomid).emit(ACTIONS.USERS_IN_EDITOR || "users in editor room", usersInRoom);
        io.in(roomid).emit(ACTIONS.NOTIFICATION, {
          type: "USER_JOINED",
          message: `${user.name} has joined the editor`,
          user,
        });
        logActivity(user._id, 'CODE', 'Joined Collaborative Editor', roomid);
      });

      socket.on(ACTIONS.EDITOR_CHANGE, ({ roomid, code }) => {
        socket.to(roomid).emit(ACTIONS.EDITOR_CHANGE, { roomid, newCode: code });
      });

      socket.on(ACTIONS.LEAVE_EDITOR, (roomid) => {
        socket.leave(roomid);
        if (userSocketMap[socket.id]) {
          delete userSocketMap[socket.id];
          io.in(roomid).emit(ACTIONS.USER_LEFT, user?._id);
        }
      });

      // ─────────────────────────────────────────
      // WHITEBOARD EVENTS
      // ─────────────────────────────────────────
      socket.on(ACTIONS.JOIN_WHITEBOARD, (roomid) => {
        socket.join(roomid);
        userSocketMap[socket.id] = { user, name: user.name, room: roomid };
        const usersInRoom = getAllConnectedClients(roomid);
        io.in(roomid).emit(ACTIONS.USERS_IN_WHITEBOARD || "users in whiteboard room", usersInRoom);
        io.in(roomid).emit(ACTIONS.NOTIFICATION, {
          type: "USER_JOINED",
          message: `${user.name} has joined the whiteboard`,
          user,
        });
        logActivity(user._id, 'WHITEBOARD', 'Joined Whiteboard Session', roomid);
      });

      socket.on(ACTIONS.LEAVE_WHITEBOARD, (roomid) => {
        socket.leave(roomid);
        if (userSocketMap[socket.id]) {
          delete userSocketMap[socket.id];
          io.in(roomid).emit(ACTIONS.USER_LEFT, user?._id);
        }
      });

      socket.on(ACTIONS.CANVAS_DATA, ({ roomid, data }) => {
        socket.to(roomid).emit(ACTIONS.CANVAS_DATA, data);
      });

      socket.on(ACTIONS.WHITEBOARD_CLEAR, (roomid) => {
        socket.to(roomid).emit(ACTIONS.WHITEBOARD_CLEAR);
      });

      // ─────────────────────────────────────────
      // DOC EDITOR EVENTS
      // ─────────────────────────────────────────
      socket.on(ACTIONS.JOIN_DOC, (roomid) => {
        socket.join(roomid);
        userSocketMap[socket.id] = { user, name: user.name, room: roomid };
        const usersInRoom = getAllConnectedClients(roomid);
        io.in(roomid).emit(ACTIONS.USERS_IN_DOC || "users in doc room", usersInRoom);
        io.in(roomid).emit(ACTIONS.NOTIFICATION, {
          type: "USER_JOINED",
          message: `${user.name} has joined the document`,
          user,
        });
        logActivity(user._id, 'DOCS', 'Joined Document Studio', roomid);
      });

      socket.on(ACTIONS.DOC_CHANGE, ({ roomid, delta, content }) => {
        socket.to(roomid).emit(ACTIONS.DOC_CHANGE, { delta, content });
      });

      socket.on(ACTIONS.DOC_CURSOR, ({ roomid, range, name }) => {
        socket.to(roomid).emit(ACTIONS.DOC_CURSOR, { range, name, userId: user._id });
      });

      socket.on(ACTIONS.LEAVE_DOC, (roomid) => {
        socket.leave(roomid);
        if (userSocketMap[socket.id]) {
          delete userSocketMap[socket.id];
          io.in(roomid).emit(ACTIONS.USER_LEFT, user?._id);
        }
      });

      // ─────────────────────────────────────────
      // PPT EDITOR EVENTS
      // ─────────────────────────────────────────
      socket.on(ACTIONS.JOIN_PPT, (roomid) => {
        socket.join(roomid);
        userSocketMap[socket.id] = { user, name: user.name, room: roomid };
        const usersInRoom = getAllConnectedClients(roomid);
        io.in(roomid).emit(ACTIONS.USERS_IN_PPT || "users in ppt room", usersInRoom);
        io.in(roomid).emit(ACTIONS.NOTIFICATION, {
          type: "USER_JOINED",
          message: `${user.name} has joined the presentation`,
          user,
        });
        logActivity(user._id, 'PPT', 'Joined PPT Presentation', roomid);
      });

      socket.on(ACTIONS.PPT_SLIDE_ADD, ({ roomid, slide }) => {
        socket.to(roomid).emit(ACTIONS.PPT_SLIDE_ADD, { slide });
      });

      socket.on(ACTIONS.PPT_SLIDE_UPDATE, ({ roomid, slide }) => {
        socket.to(roomid).emit(ACTIONS.PPT_SLIDE_UPDATE, { slide });
      });

      socket.on(ACTIONS.PPT_SLIDE_DELETE, ({ roomid, slideId }) => {
        socket.to(roomid).emit(ACTIONS.PPT_SLIDE_DELETE, { slideId });
      });

      socket.on(ACTIONS.PPT_SLIDE_REORDER, ({ roomid, slides }) => {
        socket.to(roomid).emit(ACTIONS.PPT_SLIDE_REORDER, { slides });
      });

      socket.on(ACTIONS.PPT_CURRENT_SLIDE, ({ roomid, slideIndex }) => {
        socket.to(roomid).emit(ACTIONS.PPT_CURRENT_SLIDE, { slideIndex });
      });

      socket.on(ACTIONS.LEAVE_PPT, (roomid) => {
        socket.leave(roomid);
        if (userSocketMap[socket.id]) {
          delete userSocketMap[socket.id];
          io.in(roomid).emit(ACTIONS.USER_LEFT, user?._id);
        }
      });

      // ─────────────────────────────────────────
      // PHOTO EDITOR EVENTS
      // ─────────────────────────────────────────
      socket.on(ACTIONS.JOIN_PHOTO, (roomid) => {
        socket.join(roomid);
        userSocketMap[socket.id] = { user, name: user.name, room: roomid };
        const usersInRoom = getAllConnectedClients(roomid);
        io.in(roomid).emit(ACTIONS.USERS_IN_PHOTO || "users in photo room", usersInRoom);
        io.in(roomid).emit(ACTIONS.NOTIFICATION, {
          type: "USER_JOINED",
          message: `${user.name} has joined the photo editor`,
          user,
        });
        logActivity(user._id, 'PHOTO', 'Joined Photo Studio', roomid);
      });

      socket.on(ACTIONS.PHOTO_OBJECT_ADD, ({ roomid, obj }) => {
        socket.to(roomid).emit(ACTIONS.PHOTO_OBJECT_ADD, { obj });
      });

      socket.on(ACTIONS.PHOTO_OBJECT_MODIFY, ({ roomid, obj }) => {
        socket.to(roomid).emit(ACTIONS.PHOTO_OBJECT_MODIFY, { obj });
      });

      socket.on(ACTIONS.PHOTO_OBJECT_DELETE, ({ roomid, objId }) => {
        socket.to(roomid).emit(ACTIONS.PHOTO_OBJECT_DELETE, { objId });
      });

      socket.on(ACTIONS.PHOTO_CANVAS_STATE, ({ roomid, state }) => {
        socket.to(roomid).emit(ACTIONS.PHOTO_CANVAS_STATE, { state });
      });

      socket.on(ACTIONS.LEAVE_PHOTO, (roomid) => {
        socket.leave(roomid);
        if (userSocketMap[socket.id]) {
          delete userSocketMap[socket.id];
          io.in(roomid).emit(ACTIONS.USER_LEFT, user?._id);
        }
      });

      // ─────────────────────────────────────────
      // DISCONNECT
      // ─────────────────────────────────────────
      socket.on("disconnect", () => {
        const userData = userSocketMap[socket.id];
        if (userData) {
          io.in(userData.room).emit(ACTIONS.USER_LEFT, userData.user?._id);
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
