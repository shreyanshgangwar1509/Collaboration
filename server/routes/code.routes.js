import express from 'express';
import { compliecode } from '../controllers/code.js';
import { isAuthenticated } from '../middlewares/auth.js';

const router = express.Router();

router.post("/compile", isAuthenticated, compliecode);

export default router;