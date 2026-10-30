import express from 'express';
import { saveItem, getSavedItems, deleteSavedItem } from '../controllers/saved.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(isAuthenticated);

router.post("/", saveItem);
router.get("/", getSavedItems);
router.delete("/:id", deleteSavedItem);

export default router;
