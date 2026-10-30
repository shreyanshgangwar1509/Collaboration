import VerificationToken from "../models/token.model.js";
import { sendOtpEmail } from "./mailer.js";

export default async function sendVerificationEmail(req, email) {
  try {
    // Check for existing verification token and delete it
    const existingToken = await VerificationToken.findOne({ email });
    if (existingToken) {
      await existingToken.deleteOne(); // Await the deletion
    }

    // Generate a random OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Create a new verification token
    
    const newToken = new VerificationToken({
      email: email,
      token: otp,
    });
    await newToken.save(); // Save the new token to the database

    await sendOtpEmail(email, otp);
    console.log(`Verification OTP successfully sent to ${email}`);
  } catch (error) {
    console.error("Error in sendVerificationEmail:", error); // Log error for debugging
    throw new Error("Failed to send verification email"); // Throw an error to be handled in the calling function
  }
}
