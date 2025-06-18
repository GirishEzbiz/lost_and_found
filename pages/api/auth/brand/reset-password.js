import { db } from "lib/db";
import logger from "lib/logger";
import bcrypt from "bcryptjs";
import { withMonitorLogger } from "utils/withMonitorLogger";

 async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { identity, password } = req.body;

  if (!identity || !password) {
    return res
      .status(400)
      .json({ error: "Identity and password are required" });
  }

  try {
    const [rows] = await db.query(
      "SELECT id FROM admins WHERE (email = ? OR mobile = ?) AND brand_id IS NOT NULL",
      [identity, identity]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "UPDATE admins SET password = ?, otp = NULL, otp_expires_at = NULL WHERE (email = ? OR mobile = ?) AND brand_id IS NOT NULL",
      [hashedPassword, identity, identity]
    );

    res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    logger.error({
      message: "Error resetting password",
      stack: error.stack,
      function: "reset-password",
    });
    res.status(500).json({ error: "Internal server error" });
    throw error
  }
}
export default withMonitorLogger(handler)