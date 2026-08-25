import nodemailer from "nodemailer";

export async function sendOtpEmail(recipientEmail, otp) {
  const emailUser = process.env.EMAIL_USER?.trim();
  const emailPass = process.env.EMAIL_PASS?.replace(/\s/g, "");

  if (!recipientEmail?.trim()) {
    throw new Error("Recipient email is required");
  }

  if (!emailUser || !emailPass) {
    console.error("Missing email credentials in environment variables");
    throw new Error("Email configuration error");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  const mailOptions = {
    from: "CollabSpace" <${emailUser}>,
    to: recipientEmail.trim(),
    subject: "Your OTP for Email Verification",
    text: Your OTP for verification is: ${otp},
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #7c3aed; text-align: center;">Email Verification</h2>
        <p>Hello,</p>
        <p>Thank you for joining CollabSpace. Please use the following One-Time Password (OTP) to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4f46e5; background: #f3f4f6; padding: 10px 20px; border-radius: 5px;">${otp}</span>
        </div>
        <p>This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="font-size: 12px; color: #666; text-align: center;">&copy; 2026 CollabSpace Team. All rights reserved.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(OTP email sent: ${info.messageId});
  } catch (error) {
    console.error("Nodemailer Error Debug:", error);
    throw new Error(Failed to send OTP email: ${error.message});
  }
}
