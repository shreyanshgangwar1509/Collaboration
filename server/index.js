import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import { Server as socket } from 'socket.io';
import { default as authroutes, default as userRouter } from './routes/auth.routes.js';
import chatroutes from './routes/chatbot.routes.js';
import groupRouter from './routes/group.routes.js';
import messageRouter from './routes/message.routes.js';
import { connectdb } from './utills/connectdb.js';
import socketIo from './utills/socket.js';

dotenv.config();

const app = express();
const server=http.createServer(app);
const io=new socket(server,{
    cors:{
        origin:"*"
    },
});
//middlewares
app.use(cors());
app.use(express.json());
//connect to db
await connectdb();

//initialize
socketIo(io);
//our routes
app.use("/api/auth", authroutes);
app.use("/api/users",userRouter);
app.use("/api/groups",groupRouter);
app.use("/api/messages",messageRouter);
app.use("api/chatbot/ask", chatroutes);
//start server
const PORT=process.env.PORT || 3000;
server.listen(PORT, console.log(`server is up and running on port,${PORT}`));

export { io };

