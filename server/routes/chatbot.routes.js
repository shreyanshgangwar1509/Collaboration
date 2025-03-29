import express from 'express';
import { asking } from '../controllers/chatbot.js';
const router = express.Router();

router.post("/ask", asking);
export default router;