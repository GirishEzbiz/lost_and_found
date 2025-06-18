import logger from "lib/logger";
import Razorpay from "razorpay";
import { withMonitorLogger } from "utils/withMonitorLogger";

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { amount, currency, receipt } = req.body;

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt,
    });

    res.status(200).json({ orderId: order.id });
  } catch (error) {
    console.log("error", error);
    logger.error({
      message: "Error creating Razorpay order",
      stack: error.stack,
      function: "createRazorpayOrder",
    });
    res.status(500).json({ message: "Internal Server Error" });
    throw error
  }
}
export default withMonitorLogger(handler)