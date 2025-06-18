import crypto from "crypto";
import { authenticate } from "lib/auth";
import { db, checkDbConnection } from "lib/db";
import logger from "lib/logger";
import { withMonitorLogger } from "utils/withMonitorLogger";

 async function handler(req, res) {
  const { id } = authenticate(req, res); // Authenticate user and get ID
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
  try {
    const { paymentId, orderId, signature, itemId, years, totalAmount, gstin } =
      req.body;


    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(orderId + "|" + paymentId)
      .digest("hex");

    if (generatedSignature === signature) {
      // ✅ Update Payment Status in Database
      // (You can save the transaction details here)
      const item = await getItemById(itemId);

      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }


      let { expiry_date } = item;

      let newExpiryDate = expiry_date ? new Date(expiry_date) : new Date();

      newExpiryDate.setFullYear(newExpiryDate.getFullYear() + years);

      const updateQuery = `UPDATE qr_code SET expiry_date = ? WHERE qr_code = ?`;
      await db.query(updateQuery, [
        newExpiryDate.toISOString().split("T")[0],
        item.qr_code_id,
      ]);

      const payer_type = "user";
      const payment_method = "online";
      const status = "completed";

      if (!payer_type || !id || !totalAmount || !payment_method || !status) {
        return res.status(400).json({ message: "All fields are required" });
      }

      let data = await db.query(
        `INSERT INTO payments (payer_type, payer_id, amount, payment_method,txn_id, status,gstin) 
         VALUES (?, ?, ?, ?, ?, ? ,?)`,
        [payer_type, id, totalAmount, payment_method, paymentId, status, gstin]
      );

      return res.status(200).json({
        message: "Payment verified and expiry updated",
        newExpiryDate: newExpiryDate.toISOString().split("T")[0],
        data: data,
      });
      // return res.status(200).json({ message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ message: "Invalid payment signature" });
    }
  } catch (error) {
    logger.error({
      message: "Payment verification error",
      stack: error.stack,
      function: "verifyPayment",
    });
    res.status(500).json({ message: "Internal Server Error" });
    throw error
  }
}

const getItemById = async (itemId) => {
  const query = `
    SELECT 
      i.*, 
      q.is_lost, 
      q.is_found, 
      q.is_recovered, 
      q.lost_date,
      q.recovery_date,
      q.found_date, 
      q.expiry_date 
    FROM items i
    LEFT JOIN qr_code q ON i.qr_code_id = q.qr_code 
    WHERE i.id = ?
  `;

  try {
    const [result] = await db.query(query, [itemId]);
    return result.length ? result[0] : null;
  } catch (error) {
    logger.error({
      message: "Error fetching item by ID",
      stack: error.stack,
      function: "fetchItemById",
    });
    throw new Error("Database error while fetching item");
  }
};
export default withMonitorLogger(handler)