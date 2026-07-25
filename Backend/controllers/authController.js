
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendOtpEmail, sendVerificationSuccessEmail } from "../utils/mailer.js";
 
const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
 
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
 
// Only allows emails ending in @gmail.com
const isGmail = (email) => /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
 
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
 
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
 
    if (!isGmail(email)) {
      return res.status(400).json({ message: "Only @gmail.com email addresses are allowed" });
    }
 
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
 
    const existing = await User.findOne({ email });
    if (existing && existing.isVerified) {
      return res.status(400).json({ message: "Email already registered" });
    }
 
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
 
    let user;
    if (existing) {
      existing.name = name;
      existing.password = hashedPassword;
      existing.otp = hashedOtp;
      existing.otpExpiry = otpExpiry;
      user = await existing.save();
    } else {
      user = await User.create({
        name, email, password: hashedPassword,
        otp: hashedOtp, otpExpiry, authProvider: "local",
      });
    }
 
    await sendOtpEmail(email, otp);
 
    res.status(201).json({ message: "OTP sent to your email. Please verify to continue." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
 
export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP required" });
 
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "Already verified" });
    if (!user.otp || !user.otpExpiry || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "OTP expired. Please request a new one." });
    }
 
    const isMatch = await bcrypt.compare(otp, user.otp);
    if (!isMatch) return res.status(400).json({ message: "Invalid OTP" });
 
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
 
    // Fire-and-forget: don't let a mail hiccup block the login response
    sendVerificationSuccessEmail(user.email, user.name).catch((err) =>
      console.error("Failed to send verification success email:", err.message)
    );
 
    const token = generateToken(user._id);
    res.status(200).json({
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
 
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "Already verified" });
 
    const otp = generateOtp();
    user.otp = await bcrypt.hash(otp, 10);
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
 
    await sendOtpEmail(email, otp);
    res.status(200).json({ message: "OTP resent" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
 
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
 
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email first" });
    }
 
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
 
    const token = generateToken(user._id);
    res.status(200).json({
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
 
