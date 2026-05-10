import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import { Server as socket } from 'socket.io';
import errorHandler from "./middlewares/error.js";
import authroutes from './routes/auth.routes.js';
import chatroutes from './routes/chatbot.routes.js';
import groupRouter from './routes/group.routes.js';
import messageRouter from './routes/message.routes.js';
import activityRoutes from './routes/activity.routes.js';
import savedRoutes from './routes/saved.routes.js';
import { connectdb } from './utills/connectdb.js';
import coderoutes from './routes/code.routes.js';
import socketIo from './utills/socket.js';
import passport from './utills/passport.js';
import session from 'express-session';


dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new socket(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
});

// Middlewares
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.JWT_SECERET || 'collab-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));
app.use(passport.initialize());
app.use(passport.session());

// Connect DB
await connectdb();

// Initialize Socket
socketIo(io);

// Routes
app.use("/api/auth", authroutes);
app.use("/api/groups", groupRouter);
app.use("/api/messages", messageRouter);
// FIX: was "api/chatbot/ask" — missing leading slash
app.use("/api/chatbot", chatroutes);
app.use("/api/code", coderoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/saved", savedRoutes);




// Health check
app.get("/health", (req, res) => res.json({ status: "ok", timestamp: new Date() }));

// Error handling middleware (must be LAST)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export { io };
