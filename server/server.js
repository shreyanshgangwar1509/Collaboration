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
import OpenAI from 'openai';
dotenv.config();

const app = express();
const server=http.createServer(app);
const openai = new OpenAI({
    apiKey:process.env.OPEN_AI_SECRET_KEY,
});
const io=new socket(server,{
    cors:{
        origin:["http://localhost:5173"],
        methods:["GET","POST"],
        credentials:true,
    },
});
//chatbot
//middlewares
app.use(cors());
app.use(express.json());
const corsOptions={
    origin:["http://localhost:5174","http://localhost:5173"],
};
app.use(cors(corsOptions));
//Global variable to hold the conversation history
let conversationHistory=[
    {role:"system",content:"you are a helpful assistant"},
];
//chatbot
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
//chatbot
app.post('/ask',async(req,res)=>{
    const userMessage=req.body.message;
    //Update the conversation history with the users message
    conversationHistory.push({role:"user",content:userMessage});
    try {
        const completion=await openai.chat.completions.create({
            messages:conversationHistory,
            model:"gpt-3.5-turbo",
        });
        //Extract the response
        const botResponse = completion.choices[0].message.content;
        //send the response
        res.json({message:botResponse});
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Error generating response from OpenAI");
    }
});

//start server
const PORT=process.env.PORT || 5000;
server.listen(PORT,console.log('server is up and running on port,${PORT}'));