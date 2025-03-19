import jwt from 'jsonwebtoken';
import { User } from "../models/user.model.js";
import VerificationToken from '../models/VerificationToken.js';
import sendverificationemail from '../utills/send-otp.js';
import { setToken } from '../utills/token.js';

const SignUp = async (req, res) => {

  const { name, email, password } = req.body; // Added role
  
  console.log("Received email:", email);

  try {
  //   const publicId = req.file.filename || req.file.public_id; 
  // const imageUrl = req.file.path;
    const Model =  User;

    const existingUser = await Model.findOne({ email });
    console.log("Existing user:", existingUser);
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    
      const user = new Model({
        name, email, password, isVerified: false
        // , avatar: {
        //         public_id: publicId,
        //         url: imageUrl,
        ,
      });
    
    await user.save();

    await sendverificationemail(req, email);
    return res.status(200).json({ message: "User/Worker registered successfully", user });
  } catch (error) {
    console.error("Error in Register function:", error);
    return res.status(500).json({ message: 'Server error', error });
  }
};
const Login = async (req, res) => {
  const { email, password  } = req.body; // Added role
  // const role = req.role;
  console.log("Login attempt for email:", email);
  
  try {
    const Model =  User;

    const user = await Model.findOne(
        { email },
        "password isVerified"
    ).select("password isVerified");
    if (!user) {
          return res.status(400).json({ message: 'Invalid credentials: user/worker not found' });
        }
    
    const isMatch = (password === user.password); // Replace with bcrypt.compare
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials: password does not match' });
    }

    if (!user.isVerified) {
      await sendverificationemail(req, email); 
      return res.status(403).json({ message: 'User/Worker not verified. Verification email sent.' });
    }

    const accessToken = setToken(user);
    const refreshToken = jwt.sign({ user}, process.env.JWT_SECERET || '', { expiresIn: "1d" });
  
    res.cookie(process.env.ACCESS_TOKEN, accessToken, { httpOnly: true, secure: true });
    res.cookie(process.env.REFERESH_TOKEN, refreshToken, { httpOnly: true, secure: true });

    return res.status(200).json({ message: "User/Worker logged in successfully", accesstoken:accessToken });
  } catch (error) {
    console.error("Error in Login function:", error);
    return res.status(500).json({ message: 'Server error', error });
  }
};


const logoutUser = async (req, res) => {
  try {
    console.log('logout  function is called ');
    // Clear the cookie; ensure to match the options used when setting the cookie
    res.clearCookie('access-token', {
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'Strict', 
    });
    console.log('logout function is called ');
    
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error', error });
  }
};
const verifyemail = async (req, res) => {
  const { email, otp ,role} = req.body;
  console.log('Email verification is happening');

  try {
    const verificationToken = await VerificationToken.findOne({ email });

    if (!verificationToken || otp !== verificationToken.token) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    // Use role from token
    const Model = role === 'user' ? User : Worker;

    const user = await Model.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User/Worker not found." });
    }

    user.isVerified = true;
    await user.save();

    await VerificationToken.deleteOne({ email });

    res.status(200).json({ message: "Email verified successfully." });
  } catch (error) {
    console.error("Error in verifyOtp:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

const tokencontroller = async (req, res) => {
  const { refereshToken } = res.cookies;

  try {
    if (!refereshToken) {
      return res.status(400).json({ message: "Verification erro" });
    }
    jwt.verify(refereshToken, process.env.JET_SECERET, (err,user) => {
      if (err) {
        res.status(403).json({ message: "Verification failed" })
        const accesstoken = setToken(user);
        res.cookie(process.env.ACCESS_TOKEN, accesstoken, {
      httpOnly: true,
      secure: true,
    
    });
    // Set token and respond
    
    return res.status(200).json({ message: "token refereshed successfully" });
      }
    })
  } catch (error) {
    return res.status(500).json({message:"Erro in refresh token making"})
  }
}
const getProfile = async (req, res) => {
  try {
    
    const user = await User.findById(req.user).select('-password'); 
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('User profile has been send successfully');

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export { getProfile, Login, logoutUser, SignUp, tokencontroller, verifyemail };

