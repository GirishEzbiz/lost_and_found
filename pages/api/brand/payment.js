
import logger from "lib/logger";
import Razorpay from "razorpay";
import { withMonitorLogger } from "utils/withMonitorLogger";

async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }
    try {
        const { amount, currency } = req.body;

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });


        const options = {
            amount: Math.round(amount * 100),
            currency,
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        res.status(200).json({ orderId: order.id });
    } catch (error) {
        logger.error({
            message: "Something went wrong",
            stack: error.stack,
            function: "paymentHandleer" // Replace with the actual function name
        });
        res.status(500).json({ message: "Something went wrong", error });
        throw error
    }

}
export default withMonitorLogger(handler)