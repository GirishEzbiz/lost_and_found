import { db } from "lib/db";
import logger from "lib/logger";
import { withMonitorLogger } from "utils/withMonitorLogger";

 async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { identity, otp } = req.body;

  if (!identity || !otp) {
    return res.status(400).json({ error: "Identity and OTP are required" });
  }

  try {
    const [rows] = await db.query(
      "SELECT otp, otp_expires_at FROM admins WHERE (email = ? OR mobile = ?) AND brand_id IS NOT NULL",
      [identity, identity]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = rows[0];
    const currentTime = new Date();

    if (!user.otp || !user.otp_expires_at) {
      return res.status(400).json({ error: "OTP not generated" });
    }

    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
    // console.log("🔍 Now:", currentTime);
    // console.log("⌛ Expires At:", otpExpiresAt);

    if (currentTime > otpExpiresAt) {
      return res.status(400).json({ error: "OTP has expired" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // OTP is valid — clear it
    await db.query(
      "UPDATE admins SET otp = ?, otp_expires_at = ? WHERE (email = ? OR mobile = ?) AND brand_id IS NOT NULL",
      [otp, otpExpiresAt, identity, identity]
    );

    res.status(200).json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    logger.error({
      message: "Error verifying OTP",
      stack: error.stack,
      function: "verify-otp",
    });
    res.status(500).json({ error: "Internal server error" });
    throw error
  }
}
export default withMonitorLogger(handler)