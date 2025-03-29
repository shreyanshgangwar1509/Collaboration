import express from 'express';
import { asking } from '../controllers/chatbot';
const router = express.Router();

router.post("/ask", asking);