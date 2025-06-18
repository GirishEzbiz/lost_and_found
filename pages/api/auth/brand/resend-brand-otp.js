import { checkDbConnection, db } from "lib/db"
import sendMail from "lib/mailService"
import { sendWhatsapp } from "lib/sendWhatsapp";
import { withMonitorLogger } from "utils/withMonitorLogger";


const resendBrandOtp = async (req, res) => {
    try {
        const { email, mobile } = JSON.parse(req.body);
        const otp = Math.floor(100000 + Math.random() * 900000);

        if (!email && !mobile) {
            return res.status(400).json({ message: "Email or mobile is required" });
        }

        // Determine which condition to use
        let query = `SELECT * FROM admins`;
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
        // console.log("user", user)
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
        const otpExpiresAtFormatted = otpExpiresAt.toISOString().slice(0, 19).replace('T', ' ');

        // Update OTP in `users` table
        await db.query(
            `UPDATE admins SET otp = ?, otp_expires_at = ? WHERE brand_id = ?`,
            [otp, otpExpiresAtFormatted, user.brand_id]
        );




        // Send OTP via email or WhatsApp
        if (email) {
            await sendMail({
                to: user.email,
                subject: "Your OTP Code",
                text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
                meta: {
                    action: "Brand Resend OTP",
                    type: "OTP"
                },
                otp: otp,
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
                    action: "Brand Resend OTP",
                    type: "OTP"
                },
                otp: otp,
                message: `Your Resend OTP is ${otp} `,
            };

            const responsewa = await sendWhatsapp(payload);
            // console.log("WhatsApp response:", responsewa);
        }

        return res.status(200).json({ message: "OTP sent successfully" });

    } catch (err) {
        console.error("Error resending OTP:", err);
        res.status(500).json({ message: "Something went wrong" });
        throw err
    }
};



async function handler(req, res) {
    // console.log("resend otp")

    // console.log(req.method)
    const isDbConnected = await checkDbConnection();

    if (!isDbConnected) {
        return res.status(500).json({ message: "Database connection failed" });
    }

    if (req.method == "POST") {
        resendBrandOtp(req, res)
    }


}
export default withMonitorLogger(handler)