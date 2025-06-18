import { sendWhatsapp } from "lib/sendWhatsapp";
import { db } from "../../lib/db";
import sendMail from "../../lib/mailService";
import bcrypt from "bcryptjs";
import logger from "lib/logger";
import { emailOtpTemplate } from "lib/emailOtpTemplate";
import { withMonitorLogger } from "utils/withMonitorLogger";

 async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { fullName, email, mobile } = req.body;

  if (!fullName || !email  || !mobile) {
    return res
      .status(400)
      .json({ message: "Name, email, mobile, and password are required" });
  }

  try {
    // Check if email or mobile already exists
    const [existingUser] = await db.query(
      `SELECT email, mobile FROM users WHERE email = ? OR mobile = ?`,
      [email, mobile]
    );

    if (existingUser.length > 0) {
      const existsField = existingUser[0].email === email ? "email" : "mobile";
      return res.status(409).json({
        error: `${existsField}_exists`,
        message: `This ${existsField} is already registered`,
      });
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

 

    // Insert the new user into the database
    await db.query(
      `INSERT INTO users (full_name, email, mobile, otp, otp_expires_at, is_verified)
       VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE), FALSE)`,
      [fullName, email, mobile, otp]
    );
    
    const payload = {
      to: `91${mobile}`,
      template_name: "oac_account_verify_v2",
      header: [
        {
          type: "image",
          image: {
            link: "https://www.oacasia.org/assets/app/OAC-Logo-WA.png",
          },
        },
      ],
      body: [
        { type: "text", text: `${fullName}` },
        { type: "text", text: `${otp}` },
      ],
       meta: {
        action: "Send OTP",
        type: "OTP",
      },
      otp: otp,
      message:`Your OTP code is ${otp}. It is valid for 10 minutes.`,
    };

    const responsewa = await sendWhatsapp(payload);

    // // Send OTP email
        const mailResponse = await sendMail({
          to: email,
          subject: "Your OTP Code",
          text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
          meta: {
            action: "Send OTP",
            type: "OTP",
          },
          otp: otp,
        });
    
   

    // if (!mailResponse.success) {
    //   throw new Error(mailResponse.message);
    // }

    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    logger.error({
      message: "Error sending otp",
      stack: error.stack,
      function: "otpsending",
    });
     res.status(500).json({ message: "Error processing request" });
     throw error
  }
}


export default withMonitorLogger(handler)