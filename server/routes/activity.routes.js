import express from 'express';
import { clearUserActivity, getUserActivity } from '../controllers/activity.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(isAuthenticated); // All activity routes require login

router.get("/", getUserActivity);
router.delete("/clear", clearUserActivity);

export default router;
