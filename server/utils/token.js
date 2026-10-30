import dotenv from 'dotenv';
import jwt from "jsonwebtoken";

dotenv.config();

export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET || process.env.JWT_SECERET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error("JWT_SECRET environment variable is missing in production");
    }
    return "dev_fallback_secret_key_collaborative_workspace_2026";
  }
  return secret;
};

export const cookieopt = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'Strict',
  maxAge: 60 * 60 * 1000,
};

export const setToken = (user) => {
  const secret = getJwtSecret();
  return jwt.sign(
    {
      role: user.role,
      userId: user._id,
      name: user.name,
    },
    secret,
    { expiresIn: '1h' }
  );
};

export default cookieopt;
