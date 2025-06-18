import { authenticate } from "lib/auth";
import { checkDbConnection, db } from "lib/db";
import logger from "lib/logger";
import { withMonitorLogger } from "utils/withMonitorLogger";

const getPayments = async (req, res) => {
  try {
    const { id } = authenticate(req, res);
    if (!id) {
      return res.status(400).json({ message: "userId is required" });
    }

    const [rows] = await db.query(
      `
      SELECT
        id AS invoice_id,
        payer_type,
        payer_id,
        amount,
        payment_method,
        txn_id,
        status,
        created_at
      FROM payments
      WHERE payer_id = ?
      `,
      [id]
    );

    if (rows.length > 0) {
      res.status(200).json(rows);
    } else {
      res
        .status(202)
        .json({ message: "No payment history found for this user" });
    }
  } catch (error) {
    logger.error({
      message: "Database error",
      stack: error.stack,
      function: "databaseOperation",
    });
    res.status(500).json({ message: "Database error" });
    throw error
  }
};

 async function handler(req, res) {
  const isDbConnected = await checkDbConnection();

  if (!isDbConnected) {
    return res.status(500).json({ message: "Database connection failed" });
  }

  if (req.method === "GET") {
    return getPayments(req, res);
  }

  res.status(405).json({ message: "Method Not Allowed" });
}
export default withMonitorLogger(handler)