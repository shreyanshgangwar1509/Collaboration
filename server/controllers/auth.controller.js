import jwt from 'jsonwebtoken';
import { User } from "../models/user.model.js";
import VerificationToken from '../models/token.model.js';
import sendverificationemail from '../utils/send-otp.js';
import { getJwtSecret, setToken } from '../utils/token.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SignUp = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ message: 'Name is required' });
  }

  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!normalizedEmail || !EMAIL_REGEX.test(normalizedEmail)) {
    return res.status(400).json({ message: 'A valid email address is required' });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password,
      isVerified: false,
    });

    await user.save();
    
    try {
      await sendverificationemail(req, normalizedEmail);
    } catch (emailErr) {
      console.error("Failed to send verification email:", emailErr.message);
      return res.status(201).json({
        message: "User registered, but verification email failed to send. Please request a new OTP on login.",
        user: { _id: user._id, name: user.name, email: user.email },
      });
    }

    return res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Error in SignUp:", error);
    return res.status(500).json({ message: 'Server error during registration' });
  }
};

const Login = async (req, res) => {
  const { email, password } = req.body;

  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!normalizedEmail || !password || typeof password !== 'string') {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email: normalizedEmail }).select("+password");
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials: user not found' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials: incorrect password' });
    }

    if (!user.isVerified) {
      try {
        await sendverificationemail(req, normalizedEmail);
      } catch (err) {
        console.error("Failed to resend verification email:", err.message);
      }
      return res.status(403).json({ message: 'Email not verified. A new verification email has been sent.' });
    }

    const secret = getJwtSecret();
    const accessToken = setToken(user);
    const refreshToken = jwt.sign({ userId: user._id }, secret, { expiresIn: "7d" });

    const userInfo = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return res.status(200).json({
      message: "Logged in successfully",
      accesstoken: accessToken,
      refreshToken,
      user: userInfo,
    });
  } catch (error) {
    console.error("Error in Login:", error);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

const logoutUser = async (req, res) => {
  try {
    res.clearCookie('access-token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    });
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error("Error in logoutUser:", error);
    return res.status(500).json({ message: 'Server error during logout' });
  }
};

const verifyemail = async (req, res) => {
  const { email, otp } = req.body;

  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!normalizedEmail || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    const verificationToken = await VerificationToken.findOne({ email: normalizedEmail });
    if (!verificationToken || String(otp).trim() !== String(verificationToken.token).trim()) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    user.isVerified = true;
    await user.save();
    await VerificationToken.deleteOne({ email: normalizedEmail });

    return res.status(200).json({ message: "Email verified successfully." });
  } catch (error) {
    console.error("Error in verifyemail:", error);
    return res.status(500).json({ message: "Server error during verification" });
  }
};

const tokencontroller = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    const secret = getJwtSecret();
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, secret);
    } catch (jwtErr) {
      return res.status(403).json({ message: "Invalid or expired refresh token" });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const accessToken = setToken(user);
    return res.status(200).json({ message: "Token refreshed successfully", accesstoken: accessToken });
  } catch (error) {
    console.error("Error in tokencontroller:", error);
    return res.status(500).json({ message: "Error refreshing token" });
  }
};

const getProfile = async (req, res) => {
  try {
    // req.user was already loaded by isAuthenticated middleware without password
    if (!req.user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userInfo = {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      avatar: req.user.avatar,
      createdAt: req.user.createdAt,
    };

    return res.status(200).json({ user: userInfo });
  } catch (error) {
    console.error("Error in getProfile:", error);
    return res.status(500).json({ message: 'Server error retrieving profile' });
  }
};

const oauthSuccess = (req, res) => {
  try {
    const user = req.user;
    const secret = getJwtSecret();
    const accessToken = setToken(user);
    const refreshToken = jwt.sign({ userId: user._id }, secret, { expiresIn: "7d" });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const userInfo = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return res.redirect(`${frontendUrl}/login?token=${accessToken}&refreshToken=${refreshToken}&user=${encodeURIComponent(JSON.stringify(userInfo))}`);
  } catch (error) {
    console.error("Error in oauthSuccess:", error);
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`);
  }
};

export { getProfile, Login, logoutUser, SignUp, tokencontroller, verifyemail, oauthSuccess };
