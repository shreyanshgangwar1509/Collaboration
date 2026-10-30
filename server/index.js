import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import errorHandler from "./middlewares/error.middleware.js";
import activityRoutes from './routes/activity.routes.js';
import authroutes from './routes/auth.routes.js';
import chatroutes from './routes/chatbot.routes.js';
import coderoutes from './routes/code.routes.js';
import groupRouter from './routes/group.routes.js';
import messageRouter from './routes/message.routes.js';
import savedRoutes from './routes/saved.routes.js';
import { connectdb } from './utils/db.js';
import passport from './utils/passport.js';
import socketIo from './utils/socket.js';

dotenv.config();

// Global crash guards to keep the process alive
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

const app = express();
const server = http.createServer(app);

// Disable fingerprinting header
app.disable('x-powered-by');

const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"]
  : "*";

const io = new SocketServer(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middlewares
app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(passport.initialize());

// Connect Database
await connectdb();

// Initialize Socket Handlers
socketIo(io);

// REST API Routes
app.use("/api/auth", authroutes);
app.use("/api/groups", groupRouter);
app.use("/api/messages", messageRouter);
app.use("/api/chatbot", chatroutes);
app.use("/api/code", coderoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/saved", savedRoutes);

// Health check endpoint
app.get("/health", (req, res) => res.status(200).json({ status: "ok", timestamp: new Date().toISOString() }));

// Explicit 404 handler for unmatched routes (prevents framework leak)
app.use((req, res) => {
  res.status(404).json({ error: "Route not found", path: req.originalUrl });
});

// Centralized error handling middleware (must be registered last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`CollabSpace server listening on port ${PORT}`);
});

export { io };
