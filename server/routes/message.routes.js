import express from 'express';
import { createMessage, getGroupMessages } from '../controllers/message.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';

const messageRouter = express.Router();
messageRouter.use(isAuthenticated);
messageRouter.post('/', createMessage);
messageRouter.get('/:groupId', getGroupMessages);

export default messageRouter;