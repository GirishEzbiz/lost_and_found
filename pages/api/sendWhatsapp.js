 
import logger from "lib/logger";
import { sendWhatsapp } from "lib/sendWhatsapp";
import { act } from "react";
import { withMonitorLogger } from "utils/withMonitorLogger";

const otpStore = new Map();

 async function handler(req, res) {
  if (req.method === "POST") {
    const { mobile, name } = req.body;

    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ error: "Invalid mobile number" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP

    // Save OTP in memory with expiration
    otpStore.set(mobile, otp);
    setTimeout(() => otpStore.delete(mobile), 5 * 60 * 1000); // Remove OTP after 5 minutes

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
        { type: "text", text: `${name}` },
        { type: "text", text: `${otp}` },
      ],
    meta:{
        action: "Send OTP",
        type: "OTP"
    },
      otp: otp,
      message: `Your OTP is ${otp}`,
    
    };

    try {
      const response = await sendWhatsapp(payload);
      res.status(200).json({
        success: true,
        message: "OTP sent successfully via WhatsApp",
        response,
      });
    } catch (error) {
      logger.error({
          message: "Error sending OTP on whatsaap",
          stack: error.stack,
          function: "sendOTP"
      });
      res.status(500).json({ success: false, error: "Failed to send OTP" });
      throw error
  }
  
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
export default withMonitorLogger(handler)