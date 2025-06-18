import { withMonitorLogger } from "utils/withMonitorLogger";
import { db, checkDbConnection } from "../../../lib/db";

// Fetch brands or a specific brand
const getDashboardData = async (req, res) => {
  const { id } = req.query;

  try {
    const [rows] = await db.query(`
  SELECT 'total_sku' AS label, COUNT(*) AS count FROM sku_master
  UNION
  SELECT 'total_brands', COUNT(*) FROM brand_master
  UNION
  SELECT 'total_active_qr', COUNT(*) FROM qr_code WHERE status = '1'
  UNION
  SELECT 'total_inactive_qr', COUNT(*) FROM qr_code WHERE status = '0';
`);

    if (rows.length > 0) {
      // Create an object to structure the response neatly
      const result = rows.reduce((acc, row) => {
        acc[row.label] = row.count;
        return acc;
      }, {});

      res.status(200).json(result);
    } else {
      res.status(404).json({ message: "No data found" });
    }
  } catch (error) {
    console.log("database error", error);
    res.status(500).json({ message: "Database error" });
    throw error
  }
};

// API handler
async function handler(req, res) {
  const isDbConnected = await checkDbConnection();

  if (!isDbConnected) {
    return res.status(500).json({ message: "Database connection failed" });
  } else {
    console.log("db connection okay");
  }

  const { id } = req.query;

  if (req.method === "GET") {
    return getDashboardData(req, res);
  }

  res.status(405).json({ message: "Method Not Allowed" });
}
export default withMonitorLogger(handler)