import { withMonitorLogger } from "utils/withMonitorLogger";
import { db, checkDbConnection } from "../../../lib/db";

const getPayments = async (req, res) => {
  const { brandId } = req.query;


  try {
    let query = `
  SELECT
    p.id AS invoice_id,
    p.payer_type,
    p.payer_id,
    p.txn_id,
    p.amount,
    p.payment_method,
    p.status,
    p.created_at,
    u.full_name As user_name

  FROM payments p
  LEFT JOIN users u ON p.payer_id = u.id
`;

    const params = [];

    if (brandId) {
      query += " WHERE payer_id = ?";
      params.push(brandId);
    }

    const [rows] = await db.query(query, params);

    if (rows.length > 0) {
      res.status(200).json(rows);
    } else {
      res.status(202).json({ message: "No payment history found" });
    }
  } catch (error) {
    console.log("database error", error);
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