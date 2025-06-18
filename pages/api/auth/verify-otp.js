import sessionMiddleware from "../../../lib/session";
import { db } from "../../../lib/db";
import logger from "lib/logger";
import { withMonitorLogger } from "utils/withMonitorLogger";


async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  await sessionMiddleware(req, res);

  const { email, otp } = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    const user = rows[0];
    if (
      user.otp !== parseInt(otp) ||
      new Date(user.otp_expires_at) < new Date()
    ) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // Clear OTP and create session
    await db.query("UPDATE users SET otp = NULL WHERE email = ?", [email]);
    req.session.user = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
    };

    res
      .status(200)
      .json({ message: "Login successful", user: req.session.user });
  } catch (error) {
    logger.error({
      message: "login failed otp dosent match",
      stack: error.stack,
      function: "verifyotpHandler"
    });
    res.status(500).json({ error: "Something went wrong" });
    throw error
  }

}
export default withMonitorLogger(handler)