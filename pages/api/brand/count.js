import { checkDbConnection, db } from "lib/db";
import { withMonitorLogger } from "utils/withMonitorLogger";

async function handler(req, res) {
  const isDbConnected = await checkDbConnection();
  if (!isDbConnected)
    return res.status(500).json({ message: "Database connection failed" });

  const { brandId, from, to } = req.query;

  if (!brandId || !from || !to) {
    return res
      .status(400)
      .json({ message: "brandId, from and to are required" });
  }

  try {
    // ✅ Generate today's date in YYYY-MM-DD
    const todayDate = new Date();
    const today = todayDate.toISOString().split("T")[0];

    // ✅ Generate date after 2 days in YYYY-MM-DD
    const twoDaysLaterDate = new Date();
    twoDaysLaterDate.setDate(todayDate.getDate() + 2);
    const dayAfterTomorrow = twoDaysLaterDate.toISOString().split("T")[0];
    // Total codes in range (renewable ones)
    const [total] = await db.query(
      `SELECT COUNT(qr.id) AS total 
   FROM qr_code qr 
   LEFT JOIN code_mining cm ON qr.template_id = cm.id 
   WHERE qr.brand_id = ? 
     AND qr.serial_number BETWEEN ? AND ?
     AND qr.status = 1
     AND qr.expiry_date <= CURDATE() + INTERVAL 14 DAY;`,
      [brandId, from, to]
    );

    res.status(200).json({
      total_codes: total[0].total,
    });
  } catch (error) {
    console.error("QR Code Count Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
    throw error
  }
}
export default withMonitorLogger(handler)