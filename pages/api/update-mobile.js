import { sendWhatsapp } from "lib/sendWhatsapp";
import { withMonitorLogger } from "utils/withMonitorLogger";

const { checkDbConnection, db } = require("lib/db");



async function sendOtpTOMobile(req, res) {
    try {
        const { mobile, userId } = req.body;
        const otp = Math.floor(100000 + Math.random() * 900000);


        let [rows] = await db.query(`UPDATE users SET otp = ? WHERE id = ?`, [otp, userId]);


        const payload = {
            to: `91${mobile}`,
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
                action: "Update Mobile Number",
                type: "OTP"
            },
            otp: otp,
            message: `Your OTP is ${otp} to verify your mobile number`,
        };

        let whatsapp = await sendWhatsapp(payload)
        return res.status(200).json({ message: "OTP sent successfully", whatsapp });

    } catch (error) {
        console.error("Error sending OTP:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

async function updateMobileNumber(req, res) {
    try {
        const { otp, userId, mobile } = req.body;

        let [rows] = await db.query(`UPDATE users SET mobile = ?, otp = NULL WHERE id = ?  AND otp = ?`, [mobile, userId, otp]);

        return res.status(200).json({ message: "Mobile number updated successfully" });

    } catch (error) {
        console.error("Error updating mobile number:", error);
        return res.status(500).json({ message: "Internal server error" });

    }
}




async function handler(req, res) {

    let isDbConnected = await checkDbConnection();

    if (!isDbConnected) {
        return res.status(500).json({ message: "Database connection error" });
    }

    if (req.method == "POST") {
        return sendOtpTOMobile(req, res);
    }
    if (req.method === "PATCH") {

        return updateMobileNumber(req, res);

    }

}

export default withMonitorLogger(handler);