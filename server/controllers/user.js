import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from "../models/user.model.js";
import VerificationToken from '../models/VerificationToken.js';
import sendverificationemail from '../utills/send-otp.js';
import { setToken } from '../utills/token.js';

const SignUp = async (req, res) => {
  const { name, email, password } = req.body;
  console.log("Received signup for email:", email);

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
    });

    await user.save();
    await sendverificationemail(req, email);
    return res.status(200).json({ message: "User registered successfully. Please verify your email.", user: { _id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error("Error in SignUp:", error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const Login = async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt for:", email);

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials: user not found' });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials: incorrect password' });
    }

    if (!user.isVerified) {
      await sendverificationemail(req, email);
      return res.status(403).json({ message: 'Email not verified. Verification email sent.' });
    }

    const accessToken = setToken(user);
    const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_SECERET, { expiresIn: "7d" });

    // Return user info so client can store it
    const userInfo = {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin || false,
    };

    return res.status(200).json({
      message: "Logged in successfully",
      accesstoken: accessToken,
      refreshToken,
      user: userInfo,
    });
  } catch (error) {
    console.error("Error in Login:", error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const logoutUser = async (req, res) => {
  try {
    res.clearCookie('access-token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const verifyemail = async (req, res) => {
  const { email, otp } = req.body;
  console.log('Verifying email for:', email);

  try {
    const verificationToken = await VerificationToken.findOne({ email });
    if (!verificationToken || otp !== verificationToken.token) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    user.isVerified = true;
    await user.save();
    await VerificationToken.deleteOne({ email });

    res.status(200).json({ message: "Email verified successfully." });
  } catch (error) {
    console.error("Error in verifyemail:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const tokencontroller = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    jwt.verify(refreshToken, process.env.JWT_SECERET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired refresh token" });
      }
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const accessToken = setToken(user);
      return res.status(200).json({ message: "Token refreshed successfully", accesstoken: accessToken });
    });
  } catch (error) {
    return res.status(500).json({ message: "Error refreshing token", error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export { getProfile, Login, logoutUser, SignUp, tokencontroller, verifyemail };
