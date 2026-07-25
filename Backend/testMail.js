import { sendOtpEmail } from "./utils/mailer.js";
import "dotenv/config";

sendOtpEmail("schooltime9123@gmail.com", "123456")
  .then(() => console.log("✅ Email sent successfully"))
  .catch((err) => console.error("❌ Email failed:", err.message));
