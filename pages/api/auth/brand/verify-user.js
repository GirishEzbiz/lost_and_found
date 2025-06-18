import { db } from "lib/db";
import logger from "lib/logger";
import sendMail from "lib/mailService";
import { sendWhatsapp } from "lib/sendWhatsapp";
import { withMonitorLogger } from "utils/withMonitorLogger";

async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { identity } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP

  try {
    const [rows] = await db.query(
      "SELECT * FROM admins WHERE (email = ? OR mobile = ?) AND brand_id IS NOT NULL",
      [identity, identity]
    );

    if (rows.length === 0)
      return res.status(203).json({ error: "User not found" });

    const user = rows[0];
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await db.query(
      "UPDATE admins SET otp = ?, otp_expires_at = ? WHERE (email = ? OR mobile = ?) AND brand_id IS NOT NULL",
      [otp, otpExpiresAt, identity, identity]
    );

    // console.log("userr", user)

    await sendMail({
      to: user.email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
      meta: {
        action: "Brand Verify User",
        type: "OTP",
      },
      
    });



    const payload = {
      to: `91${user.mobile}`,
      template_name: process.env.WA_TEMPLATE,
      body: [{ type: "text", text: `${otp}` }],
      button: [
        {
          type: "button",
          sub_type: "url",
          index: 0,
          parameters: [
            {
              type: "text",
              text: `${otp}`,
            },
          ],
        },
      ],
      meta: {
        action: "Brand Verify User",
        type: "OTP",
      },
      otp: otp,
      message: `Your OTP is ${otp}`,
    };

    await sendWhatsapp(payload);

    res.status(200).json({ success: true, message: "OTP sent successfully", user: user });
  } catch (error) {
    logger.error({
      message: "Something went wrong",
      stack: error.stack,
      function: "verify-user",
    });
    res.status(500).json({ error: "Something went wrong" });
    throw error
  }
}
export default withMonitorLogger(handler)