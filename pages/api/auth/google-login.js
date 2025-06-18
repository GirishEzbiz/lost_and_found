import { OAuth2Client } from "google-auth-library";
import { db } from "../../../lib/db";
import { generateToken } from "utils/jwt";
import logger from "lib/logger";
import { withMonitorLogger } from "utils/withMonitorLogger";
 

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

 async function handler(req, res) {
  try {
    // Allow only POST requests
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { token } = req.body;

    // Verify Google ID token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, picture } = ticket.getPayload();

    // Check if the user exists in the database
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    let user;
    if (rows.length === 0) {
      // If the user doesn't exist, create a new one (signup)
      const [result] = await db.query(
        "INSERT INTO users (full_name, email, image, is_verified) VALUES (?, ?, ?, ?)",
        [name, email, picture, 1]
      );
      user = { id: result.insertId, email, fullName: name };
    } else {
      // If the user exists, proceed with login
      user = rows[0];
    }

    const tokenUser = { id: user.id, email: user.email };

    // Generate a JWT token for the user
    const jwtToken = generateToken(tokenUser);

    res.setHeader(
      "Set-Cookie",
      `token=${jwtToken}; Path=/; SameSite=None; Secure`
    );

    // Send a response back to the client
    res.status(200).json({
      message: rows.length === 0 ? "Signup successful" : "Login successful",
      token: jwtToken,
    });
  } catch (error) {
    logger.error({
        message: "Google authentication error",
        stack: error.stack,
        function: "googleAuthHandler"
    });
    res.status(500).json({ error: "Internal server error" });
    throw error
}

}
export default withMonitorLogger(handler)