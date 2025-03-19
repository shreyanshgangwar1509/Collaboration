// import jwt from 'jsonwebtoken';
// import { ACTIONS } from "../constants/Events.js";
// import { io } from "../index.js"; // Adjust path based on your project structure
// import { User } from '../models/user.model.js';
// const userSocketMap = {};

// const getAllConnectedClients = (roomId) => {
//   return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
//     (socketId) => ({
//       socketId,
//       name: userSocketMap[socketId]?.name || "Anonymous",
//     })
//   );
// };


// const socketIo = (io) => {

//   io.on("connection", async(socket) => {
//     // Get user from authentication
//     // console.log(socket);
    
//     const token = socket.handshake.auth?.token;

//     // console.log(token);
//     // console.log(JSON.stringify(user));
//     const decodedData = jwt.verify(token, process.env.JWT_SECERET);
    
//     console.log("User connected:", decodedData.userId);
//     const user =await User.findById(decodedData.userId);
//     if (!user) {
//       console.log('User not exist');
      
//     }
//     // Join room handler
//     socket.on("join room", (groupId) => {
//       console.log("Joining group ",groupId);
      
//       socket.join(groupId);
//       userSocketMap[socket.id] = { user, room: groupId };

//       // Get all connected users in the room
//       const usersInRoom = getAllConnectedClients(groupId);
//       io.in(groupId).emit("users in room", usersInRoom);

//       socket.to(groupId).emit("notification", {
//         type: "USER_JOINED",
//         message: `${user?.name} has joined`,
//         user,
//       });
//     });

//     // Leave room handler
//     socket.on("leave room", (groupId) => {
//       console.log(`${user?.name} leaving room:`, groupId);
//       socket.leave(groupId);

//       if (userSocketMap[socket.id]) {
//         delete userSocketMap[socket.id];
//         socket.to(groupId).emit("user left", user?._id);
//       }
//     });

//     // New message handler
//     socket.on("new message", (message) => {
//       socket.to(message.groupId).emit("message received", message);
//     });

//     // Typing indicators
//     socket.on("typing", ({ groupId, name }) => {
//       socket.to(groupId).emit("user typing", { name });
//     });

//     socket.on("stop typing", ({ groupId }) => {
//       const userInfo = userSocketMap[socket.id];
//       if (userInfo) {
//         socket.to(groupId).emit("user stop typing", {
//           name: userInfo.user?.name,
//         });
//       }
//     });

//     // Coding events
//     socket.on(ACTIONS.JOIN, ({ roomId, name }) => {
//       userSocketMap[socket.id] = name;
//       socket.join(roomId);
//       const clients = getAllConnectedClients(roomId);

//       // Notify all clients about new user
//       clients.forEach(({ socketId }) => {
//         io.to(socketId).emit(ACTIONS.JOINED, {
//           clients,
//           name,
//           socketId: socket.id,
//         });
//       });
//     });

//     socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
//       socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
//     });

//     socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
//       io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
//     });

//     // Handle disconnection
//     socket.on("disconnecting", () => {
//       const rooms = [...socket.rooms];

//       rooms.forEach((roomId) => {
//         socket.to(roomId).emit(ACTIONS.DISCONNECTED, {
//           socketId: socket.id,
//           name: userSocketMap[socket.id]?.name || "Anonymous",
//         });
//       });

//       delete userSocketMap[socket.id];
//     });

//     socket.on("disconnect", () => {
//       console.log(`${user?.name} disconnected`);
//       if (userSocketMap[socket.id]) {
//         const userData = userSocketMap[socket.id];
//         socket.to(userData.room).emit("user left", user?._id);
//         delete userSocketMap[socket.id];
//       }
//     });
//   });
// };

// export default socketIo;


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

      socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
      });

      socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
      });

      socket.on("disconnecting", () => {
        const rooms = [...socket.rooms];

        rooms.forEach((roomId) => {
          socket.to(roomId).emit(ACTIONS.DISCONNECTED, {
            socketId: socket.id,
            name: userSocketMap[socket.id]?.name || "Anonymous",
          });
        });
      });

      // for code editor
      

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });





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
