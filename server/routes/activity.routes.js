import express from 'express';
import { clearUserActivity, getUserActivity } from '../controllers/activity.js';
import { isAuthenticated } from '../middlewares/auth.js';

const router = express.Router();

router.use(isAuthenticated); // All activity routes require login

router.get("/", getUserActivity);
router.delete("/clear", clearUserActivity);

export default router;
