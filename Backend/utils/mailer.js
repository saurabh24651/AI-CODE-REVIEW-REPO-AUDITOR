import nodemailer from "nodemailer";
import "dotenv/config";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export const sendOtpEmail = async (to, otp) => {
  await transporter.sendMail({
    from: `"AI Repo Auditor" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Verify your email — OTP",
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Verify your email</h2>
        <p>Your OTP code is:</p>
        <h1 style="letter-spacing: 4px;">${otp}</h1>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
  });
};

export const sendVerificationSuccessEmail = async (to, name) => {
  await transporter.sendMail({
    from: `"AI Repo Auditor" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Your email is verified ✅",
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Welcome, ${name}!</h2>
        <p>Your email has been successfully verified.</p>
        <p>Your account is now active and ready to use.</p>
        <br>
        <p style="color: #888; font-size: 12px;">This is an automated message — please do not reply.</p>
      </div>
    `,
  });
};