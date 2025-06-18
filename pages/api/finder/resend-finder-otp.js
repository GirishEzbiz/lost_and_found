import { checkDbConnection, db } from "lib/db";
import sendMail from "lib/mailService";
import { sendWhatsapp } from "lib/sendWhatsapp";
import { withMonitorLogger } from "utils/withMonitorLogger";

const resendOtp = async (req, res) => {
  try {
    const { unique_user_id, mobile } = JSON.parse(req.body);

    if (!mobile) {
      return res.status(400).json({ message: "Mobile number is required." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    // Fetch user
    const [rows] = await db.query(
      `SELECT * FROM tbl_finder WHERE mobile = ? and unique_user_id=?`,
      [mobile, unique_user_id]
    );
    const user = rows[0];

    if (!user) {
      return res.status(404).json({ message: "Finder not found" });
    }

    // Update OTP and expiry (fix in SQL)
    await db.query(
      `UPDATE tbl_finder SET lnf_otp = ?, otp_expires_at = DATE_ADD(NOW(), INTERVAL 5 MINUTE) WHERE mobile = ? and unique_user_id = ?`,
      [otp, mobile, unique_user_id]
    );

    // Send WhatsApp message
    const payload = {
      to: `91${mobile}`,
      template_name: process.env.WA_TEMPLATE,
      body: [{ type: "text", text: `${otp}` }],
      button: [
        {
          type: "button",
          sub_type: "url",
          index: 0,
          parameters: [{ type: "text", text: `${otp}` }],
        },
      ],
      meta: {
        action: "Finder Resend OTP",
        type: "OTP",
      },
      otp: otp,
      message: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
    };

    try {
      await sendWhatsapp(payload);
    } catch (waErr) {
      console.error("WhatsApp sending failed:", waErr);
      // Don't fail OTP flow just because WhatsApp failed
    }

    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Error in resendOtp:", err);
    return res
      .status(500)
      .json({ message: "Something went wrong while sending OTP." });
  }
};

const handler = async (req, res) => {
  try {
    const isDbConnected = await checkDbConnection();
    if (!isDbConnected) {
      return res.status(500).json({ message: "Database connection failed" });
    }

    if (req.method === "POST") {
      await resendOtp(req, res);
    } else {
      return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (err) {
    console.error("Unhandled error in handler:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default withMonitorLogger(handler);
