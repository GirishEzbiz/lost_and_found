import { checkDbConnection, db } from "lib/db";
import { withMonitorLogger } from "utils/withMonitorLogger";

 async function handler(req, res) {
  const isDbConnected = await checkDbConnection();
  if (!isDbConnected)
    return res.status(500).json({ message: "Database connection failed" });

  const { brandId, page = 1, limit = 10, status = "", search = "" } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  if (!brandId) return res.status(400).json({ message: "brandId is required" });

  try {
    let filters = `WHERE qr.brand_id = ?`;
    const params = [brandId];

    if (status) {
      if (status.toLowerCase() === "active") {
        filters += ` AND qr.status = 1`;
      } else if (status.toLowerCase() === "expiring soon") {
        filters += ` AND qr.expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 14 DAY)`;
      } else {
        // fallback: if you're sending exact db value like 'expired', use it
        filters += ` AND qr.status = ?`;
        params.push(status);
      }
    }
    
    if (search) {
      filters += ` AND (qr.qr_code LIKE ? OR qr.serial_number LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    const [countResult] = await db.query(
      `SELECT COUNT(*) AS count
       FROM qr_code qr
       INNER JOIN code_mining cm ON qr.template_id = cm.id
       INNER JOIN code_batch cb ON qr.batch_id = cb.id
       ${filters}`,
      params
    );

    const totalCount = countResult[0].count;

    const [results] = await db.query(
      `SELECT qr.id, qr.qr_code, qr.serial_number, cb.batch_name AS batch_name, qr.expiry_date, qr.status, qr.template_id as batch_id
       FROM qr_code qr
       INNER JOIN code_mining cm ON qr.template_id = cm.id
       INNER JOIN code_batch cb ON qr.batch_id = cb.id
       ${filters}
       ORDER BY qr.id DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.status(200).json({ data: results, totalCount });
  } catch (error) {
    console.error("QR Code Fetch Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
    throw error
  }
}

export default withMonitorLogger(handler)