import { checkDbConnection, db } from "lib/db";
import sendMail from "lib/mailService";
import { sendWhatsapp } from "lib/sendWhatsapp";
import { withMonitorLogger } from "utils/withMonitorLogger";

const resendOtp = async (req, res) => {
  // console.log(req.query)
  try {
    const { email, mobile } = JSON.parse(req.body);
    const otp = Math.floor(100000 + Math.random() * 900000);

    if (!email && !mobile) {
      return res.status(400).json({ message: "Email or mobile is required" });
    }

    // Determine which condition to use
    let query = `SELECT * FROM users`;
    let params = [];

    if (email) {
      query += ` WHERE email = ?`;
      params.push(email);
    } else if (mobile) {
      query += ` WHERE mobile = ?`;
      params.push(mobile);
    }

    const [rows] = await db.query(query, params);
    const user = rows[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update OTP in `users` table
    await db.query(
      `UPDATE users SET otp = ?, otp_expires_at = DATE_ADD(NOW(), INTERVAL 10 MINUTE) WHERE id = ?`,
      [otp, user.id]
    );

    // Update OTP in `tbl_finder` table too (optional, based on mobile)
    // if (mobile && req.query == "finder") {
    //   await db.query(
    //     `UPDATE tbl_finder SET lnf_otp = ? WHERE mobile = ?`,
    //     [otp, mobile]
    //   );
    // }

    // Send OTP via email or WhatsApp
    if (email) {
      await sendMail({
        to: user.email,
        subject: "Your OTP Code",
        text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
        meta: {
          action: "Resend OTP",
          type: "OTP"
        },
        otp: otp

      });
    }
    if (mobile) {
      const payload = {
        to: `91${mobile}`,
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
                text: `aa`,
              },
            ],
          },
        ],
        meta: {
          action: "Resend OTP",
          type: "OTP"
        },
        otp: otp,
        message: `Your OTP is ${otp}`,
      };

      const responsewa = await sendWhatsapp(payload);
      // console.log("WhatsApp response:", responsewa);
    }

    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Error resending OTP:", err);
    res.status(500).json({ message: "Something went wrong" });
    throw err;
  }
};

async function handler(req, res) {
  //  console.log("resend otp")

  // console.log(req.method)
  const isDbConnected = await checkDbConnection();

  if (!isDbConnected) {
    return res.status(500).json({ message: "Database connection failed" });
  }

  if (req.method == "POST") {
    resendOtp(req, res);
  }
}
export default withMonitorLogger(handler);
