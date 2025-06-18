 
import logger from "lib/logger";
import { db } from "../../../lib/db";
import { withMonitorLogger } from "utils/withMonitorLogger";

async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { email, mobile } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP

  try {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ? OR mobile = ?",
      [email, mobile]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    // Save OTP and expiry (5 minutes)
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await db.query(
      "UPDATE users SET otp = ?, otp_expires_at = ? WHERE email = ?",
      [otp, otpExpiresAt, email]
    );

    // Send OTP (via email or WhatsApp)

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    logger.error({
        message: "Something went wrong",
        stack: error.stack,
        function: "genericErrorHandler"
    });
    res.status(500).json({ error: "Something went wrong" });
    throw error
}

}
export default withMonitorLogger(handler)