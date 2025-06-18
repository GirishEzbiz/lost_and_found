const cookie = require("cookie");
import jwt from "jsonwebtoken";
import { db } from "../../lib/db";
import logger from "lib/logger";
import { withMonitorLogger } from "utils/withMonitorLogger";

 async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, otp, context, language = "en" } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    let user;

    if (context === "google") {
      // Handle Google sign-in context
      const query = "SELECT * FROM users WHERE email = ?";
      const [rows] = await db.query(query, [email]);

      if (rows.length === 0) {
        return res.status(400).json({
          message: "User not found. Please sign up first.",
        });
      }

      user = rows[0]; // Fetch user details for token generation
    } else if (context === "prusr" || context === "neusr") {
      // Handle OTP verification for prusr and neusr contexts
      if (!otp) {
        return res.status(400).json({ message: "OTP is required" });
      }

      let query =
        "SELECT * FROM users WHERE email = ? AND otp = ? AND otp_expires_at > NOW()";
      const queryParams = [email, otp];

      if (context !== "prusr") {
        query += " AND is_verified = FALSE";
      }

      const [rows] = await db.query(query, queryParams);

      if (rows.length === 0) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      user = rows[0]; // Fetch user details for token generation

      // // Mark the user as verified
      // await db.query(
      //   "UPDATE users SET is_verified = TRUE, otp = NULL, otp_expires_at = NULL WHERE email = ?",
      //   [email]
      // );

      await db.query(
        "UPDATE users SET is_verified = TRUE, otp = NULL, otp_expires_at = NULL, language = ? WHERE email = ?",
        [language, email]
      );
    } else {
      return res.status(400).json({ message: "Invalid context" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { email: user.email, id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "11h" }
    );

    // Set cookie
    const serializedCookie = cookie.serialize("token", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 11 * 60 * 60, // 11 hours
      sameSite: "strict",
      path: "/",
    });

    res.setHeader("Set-Cookie", serializedCookie);

    return res.status(200).json({
      message: "User verified successfully",
      token,
    });
  } catch (error) {
    logger.error({
      message: "Error verifying user",
      stack: error.stack,
      function: "verifyUser",
    });
     res.status(500).json({ message: "Internal server error" });
     throw error
  }
}

export default withMonitorLogger(handler)