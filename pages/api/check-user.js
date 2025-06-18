import { sendWhatsapp } from "lib/sendWhatsapp";
import { db } from "../../lib/db";
import sendMail from "../../lib/mailService"; // Assuming you have a mail service for sending OTP
import bcrypt from "bcryptjs";
import logger from "lib/logger";
import { emailOtpTemplate } from "lib/emailOtpTemplate";
import { withMonitorLogger } from "utils/withMonitorLogger";

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { contact } = req.body;

  if (!contact) {
    return res.status(400).json({ message: "Email or mobile is required" });
  }

  try {
    // Check if contact is an email or mobile number
    let query;
    let queryParams;

    if (contact.includes("@")) {
      // If it's an email, check for email in the database
      query = "SELECT * FROM users WHERE email = ?";
      queryParams = [contact];
    } else {
      // If it's a mobile number, check for mobile in the database
      query = "SELECT * FROM users WHERE mobile = ?";
      queryParams = [contact];
    }

    // Execute the query to check if the user exists
    const [user] = await db.query(query, queryParams);

    if (user.length === 0) {
      return res.status(404).json({ message: "Email or mobile not found" });
    }

    const fullName = user[0].full_name; // Fetch fullName from the user data

    const language = user[0].language || "en"; // Default to English if language is not set

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Store OTP and expiry time in the database
    await db.query(
      `UPDATE users SET otp = ?, otp_expires_at = DATE_ADD(NOW(), INTERVAL 10 MINUTE) WHERE id = ?`,
      [otp, user[0].id]
    );

    const payload = {
      to: `91${user[0].mobile}`,
      template_name: process.env.WA_TEMPLATE,
      body: [{ type: "text", text: `${otp}` }],
      button: [
        {
          type: "button",
          sub_type: "url", // Ensure it's set as a URL button
          index: 0,
          parameters: [
            {
              type: "text",
              text: `aa`, // Shorten the URL to ≤ 15 characters
            },
          ],
        },
      ],
      meta: {
        action: "User Authentication",
        type: "OTP"
      },
      otp: otp,
      message:`Your OTP is ${otp}`,
    };

    const responsewa = await sendWhatsapp(payload);

    const emailContent = await emailOtpTemplate(fullName, otp, language);
    const mailResponse = await sendMail({
      to: user[0].email,
      subject: emailContent.subject,
      html: emailContent.html,
      meta: {
        action: "Sign In",
        type: "OTP"
      },
      otp: otp,
    });

    // if (!mailResponse.success) {
    //   throw new Error(mailResponse.message);
    // }

    return res.status(200).json({
      message: "OTP sent successfully",
      email: user[0].email,
      mobile: user[0].mobile,
    });
  } catch (error) {
    logger.error({
      message: "Error sending otp to user while login",
      stack: error.stack,
      function: "processRequest",
    });
    res.status(500).json({ message: "Error processing request" });
    throw error
  }
}
export default withMonitorLogger(handler)