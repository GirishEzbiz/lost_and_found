import { checkDbConnection, db } from "lib/db";
import { withMonitorLogger } from "utils/withMonitorLogger";

async function getBrandWiseCount(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const brandFilter = req.query.brand || "all";

    let whereClause = "";
    let whereParams = [];

    if (brandFilter !== "all") {
      whereClause = "WHERE bm.name = ?";
      whereParams.push(brandFilter);
    }

    // 1. Total count (with optional filter)
    const countQuery = `SELECT COUNT(*) AS total FROM brand_master bm ${whereClause}`;
    const [countRows] = await db.query(countQuery, whereParams);
    const total = countRows[0]?.total || 0;

    // 2. Paginated data
    const dataQuery = `
      SELECT 
        bm.name,
        COALESCE(qc.total_released, 0) AS total_released,
        COALESCE(qc.printed_count, 0) AS printed_count,
        COALESCE(i.total_registered, 0) AS total_registered,
        COALESCE(qch_lost.lost_reported, 0) AS lost_reported,
        COALESCE(qch_found.found_reported, 0) AS found_reported,
        COALESCE(qs.finder_scans, 0) AS finder_scans
      FROM 
        brand_master bm
      LEFT JOIN (
        SELECT 
          brand_id,
          COUNT(*) AS total_released,
          COUNT(CASE WHEN condition_status = 'printed' THEN 1 END) AS printed_count
        FROM qr_code
        GROUP BY brand_id
      ) qc ON bm.id = qc.brand_id
      LEFT JOIN (
        SELECT 
          qc.brand_id,
          COUNT(*) AS total_registered
        FROM items i
        INNER JOIN qr_code qc ON i.qr_code_id = qc.qr_code
        GROUP BY qc.brand_id
      ) i ON bm.id = i.brand_id
      LEFT JOIN (
        SELECT 
          qc.brand_id,
          COUNT(*) AS lost_reported
        FROM qr_code_history qch
        INNER JOIN qr_code qc ON qch.qr_code_id = qc.qr_code
        WHERE qch.status_type = 'lost'
        GROUP BY qc.brand_id
      ) qch_lost ON bm.id = qch_lost.brand_id
      LEFT JOIN (
        SELECT 
          qc.brand_id,
          COUNT(*) AS found_reported
        FROM qr_code_history qch
        INNER JOIN qr_code qc ON qch.qr_code_id = qc.qr_code
        WHERE qch.status_type = 'found'
        GROUP BY qc.brand_id
      ) qch_found ON bm.id = qch_found.brand_id
      LEFT JOIN (
        SELECT 
          qc.brand_id,
          COUNT(*) AS finder_scans
        FROM qr_scans qs
        INNER JOIN qr_code qc ON qs.qr_code = qc.qr_code
        WHERE qs.user_role = 'Finder'
        GROUP BY qc.brand_id
      ) qs ON bm.id = qs.brand_id
      ${whereClause}
      ORDER BY bm.name ASC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await db.query(dataQuery, [...whereParams, limit, offset]);

    // 3. Unique brand names (for dropdown)
    const [brandNames] = await db.query(`SELECT DISTINCT name FROM brand_master ORDER BY name`);

    return res.status(200).json({
      data: rows,
      total,
      uniqueBrands: brandNames.map(b => b.name),
    });

  } catch (error) {
    console.error("DB error in getBrandWiseCount:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}






async function handler(req, res) {
    let isDbConnected = await checkDbConnection();
    if (!isDbConnected) {
        return res.status(500).json({ error: "Database connection failed" });
    }
    if (req.method == "GET") {
        return getBrandWiseCount(req, res);

    }
}

export default withMonitorLogger(handler);