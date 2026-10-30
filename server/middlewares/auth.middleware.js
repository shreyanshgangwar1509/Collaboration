import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { getJwtSecret } from '../utils/token.js';

dotenv.config();

export const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const secret = getJwtSecret();
    const decodedData = jwt.verify(token, secret);
    const user = await User.findById(decodedData.userId);

    if (!user) {
      return res.status(401).json({ message: 'User session expired or user not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    console.error('Error in authentication middleware:', error);
    return res.status(500).json({ message: 'Authentication verification failed' });
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin role required' });
    }
    next();
  } catch (error) {
    console.error('Error in isAdmin middleware:', error);
    return res.status(500).json({ message: 'Authorization check failed' });
  }
};
