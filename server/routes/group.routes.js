import express from 'express';
import {
  createGroup,
  getGroups,
  joinGroup,
  leaveGroup,
} from '../controllers/group.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';

const groupRouter = express.Router();

groupRouter.use(isAuthenticated);

groupRouter.post('/create', createGroup);
groupRouter.get('/', getGroups);
groupRouter.post('/:groupId/join', joinGroup);
groupRouter.post('/:groupId/leave', leaveGroup);

export default groupRouter;