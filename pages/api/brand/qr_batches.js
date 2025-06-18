import { checkDbConnection, db } from "lib/db";
import { withMonitorLogger } from "utils/withMonitorLogger";

 async function handler(req, res) {
  const isDbConnected = await checkDbConnection();
  if (!isDbConnected)
    return res.status(500).json({ message: "Database connection failed" });

  const { brandId, page = 1, limit = 10 } = req.query;

  // Validate page and limit to be integers
  const parsedPage = parseInt(page);
  const parsedLimit = parseInt(limit);

  if (isNaN(parsedPage) || parsedPage < 1) {
    return res.status(400).json({ message: "Invalid page number" });
  }

  if (isNaN(parsedLimit) || parsedLimit < 1) {
    return res.status(400).json({ message: "Invalid limit" });
  }

  const offset = (parsedPage - 1) * parsedLimit;

  if (!brandId) return res.status(400).json({ message: "brandId is required" });

  try {
    // Count total records
    const [countResult] = await db.query(
      `SELECT COUNT(*) AS count
       FROM code_batch cb
       LEFT JOIN code_mining cm ON cb.template_id = cm.id
       WHERE cm.brand_id = ?`,
      [brandId]
    );

    const totalCount = countResult[0].count;

    // Fetch paginated batches with batch_name
    const [results] = await db.query(
      `SELECT cb.id, cb.batch_name, cb.start_sr_no, cb.end_sr_no, cb.expiry_date, cb.total_codes AS total_qrs
       FROM code_batch cb
       INNER JOIN code_mining cm ON cb.template_id = cm.id
       WHERE cm.brand_id = ?
       ORDER BY cb.id DESC
       LIMIT ? OFFSET ?`,
      [brandId, parsedLimit, offset]
    );

    res.status(200).json({ data: results, totalCount });
  } catch (error) {
    console.error("Batch Fetch Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
    throw error
  }
}
export default withMonitorLogger(handler)