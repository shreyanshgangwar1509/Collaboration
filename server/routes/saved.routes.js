import express from 'express';
import { saveItem, getSavedItems, deleteSavedItem } from '../controllers/saved.js';
import { isAuthenticated } from '../middlewares/auth.js';

const router = express.Router();

router.use(isAuthenticated);

router.post("/", saveItem);
router.get("/", getSavedItems);
router.delete("/:id", deleteSavedItem);

export default router;
