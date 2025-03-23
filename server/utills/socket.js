

import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { ACTIONS } from "../constants/Events.js";
import { io } from "../index.js"; // Adjust path based on your project structure
import { User } from '../models/user.model.js';
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
        throw new Error("No token provided");
      }

      const decodedData = jwt.verify(token, process.env.JWT_SECERET);
      console.log(process.env.JWT_SECERET);
      
      console.log("User connected:", decodedData.userId);

      const user = await User.findById(decodedData.userId);
      if (!user) {
        console.log("User does not exist");
        return;
      }
      
      
      socket.on("join room", (groupId) => {
        console.log("Joining group", groupId);
        console.log(user?.name);
        socket.join(groupId);
        userSocketMap[socket.id] = { user,name:user.name, room: groupId };

        const usersInRoom = getAllConnectedClients(groupId);
        io.in(groupId).emit("users in room", usersInRoom);

        io.in(groupId).emit("notification", {
          type: "USER_JOINED",
          message: `${user.name} has joined`,
          user,
        });
      });

      socket.on("leave room", (groupId) => {
        console.log(`${user?.name || "Unknown User"} leaving room:`, groupId);
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
        io.in(groupId).emit("user typing", { username });
      });

      socket.on("stop typing", ({ groupId }) => {
        const userInfo = userSocketMap[socket.id];
        if (userInfo) {
          io.in(groupId).emit("user stop typing", { username: userInfo.name });
        }
      });

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

    
      // for whiteboard
      socket.on('join_whiteboard_room', (roomid) => {
        console.log("Joining group", roomid);
        console.log(user?.name);
        socket.join(roomid);
        userSocketMap[socket.id] = { user,name:user.name, room: roomid };

        const usersInRoom = getAllConnectedClients(roomid);
        io.in(roomid).emit("users in whiteboard room", usersInRoom);

        io.in(roomid).emit("notification", {
          type: "USER_JOINED",
          message: `${user.name} has joined`,
          user,
        });
      })
      socket.on('leave_whitwboard_room', (roomid) => {
        console.log(`${user?.name || "Unknown User"} leaving room:`, roomid);
        socket.leave(roomid);

        if (userSocketMap[socket.id]) {
          delete userSocketMap[socket.id];
          io.in(roomid).emit("user left", user?._id);
        }
      })
      socket.on('canvas-data', (data) =>{
        socket.broadcast.emit("canvas-data", data)
      })

      
      // for editor 
      socket.on("join editor", (roomid) => {
        console.log("Joining group", roomid);
        console.log(user?.name);
        socket.join(roomid);
        userSocketMap[socket.id] = { user,name:user.name, room: roomid };

        const usersInRoom = getAllConnectedClients(roomid);
        io.in(roomid).emit("users in editor room", usersInRoom);

        io.in(roomid).emit("", {
          type: "USER_JOINED",
          message: `${user.name} has joined`,
          user,
        });
      })

      socket.on("editor_change", ({ roomid, code }) => {
        // console.log("Changing the code")
        socket.broadcast.emit("editor_change", {roomid,newCode:code});
});


      socket.on("leave_editor", (roomid) => {
        console.log(`${user?.name || "Unknown User"} leaving room:`, roomid);
        socket.leave(roomid);

        if (userSocketMap[socket.id]) {
          delete userSocketMap[socket.id];
          io.in(roomid).emit("user left", user?._id);
        }
      })


      socket.on("disconnect", () => {
        const userData = userSocketMap[socket.id];
        if (userData) {
          io.in(userData.room).emit("user left", userData.user?._id);
          delete userSocketMap[socket.id];
        }
        console.log(`User disconnected: ${userData?.user?.name || "Unknown User"}`);
      });

    } catch (error) {
      console.error("Error during connection:", error.message);
      socket.disconnect(true); // Force disconnect the user on authentication failure
    }
  });
};

export default socketIo;
