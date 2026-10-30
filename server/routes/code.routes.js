import express from 'express';
import { compliecode } from '../controllers/code.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post("/compile", isAuthenticated, compliecode);

export default router;