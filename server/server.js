import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import http from 'http';
import {Server as socket} from 'socket.io';
import userRouter from './routes/userRoutes.js';
import socketIo from './socket.js';
import cors from 'cors';
// import { Server as socket } from "socket.io";
import groupRouter from './routes/groupRoutes.js';
import messageRouter from './routes/messageRoutes.js';
dotenv.config();

const app = express();
const server=http.createServer(app);
const io=new socket(server,{
    cors:{
        origin:["http://localhost:5173"],
        methods:["GET","POST"],
        credentials:true,
    },
});
//middlewares
app.use(cors());
app.use(express.json());
//connect to db
mongoose
.connect(process.env.MONGO_URL)
.then(()=>console.log("connected to db"))
.catch((err) => console.log(err));

//initialize
socketIo(io);
//our routes
app.use("/api/users",userRouter);
app.use("/api/groups",groupRouter);
app.use("/api/messages",messageRouter);

//start server
const PORT=process.env.PORT || 5000;
server.listen(PORT,console.log('server is up and running on port,${PORT}'));