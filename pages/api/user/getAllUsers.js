import { db } from "lib/db";
import { withMonitorLogger } from "utils/withMonitorLogger";

async function checkDbConnection() {
  try {
    await db.query("SELECT 1");
    return true;
  } catch (error) {
    console.log("database error", error);

    return false;
  }
}

// Get all users from the database with pagination
async function getAllUsers(brand_id = null, page = 1, limit = 10) {
  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);
  const offset = (pageNumber - 1) * pageSize;

  let query = `
    SELECT 
      u.id AS user_id,
      u.full_name,
      u.email,
      u.mobile AS user_mobile,
      COUNT(q.qr_code) AS total_qr_codes,
      SUM(CASE WHEN q.is_activated = 1 THEN 1 ELSE 0 END) AS activated_count,
      (SELECT COUNT(*) FROM qr_code_history h WHERE h.status_type = 'lost' AND h.qr_code_id = q.qr_code) AS lost_count,
      (SELECT COUNT(*) FROM qr_code_history h WHERE h.status_type = 'found' AND h.qr_code_id = q.qr_code) AS found_count,
      (SELECT COUNT(*) FROM qr_code_history h WHERE h.status_type = 'recovered' AND h.qr_code_id = q.qr_code) AS recovered_count
    FROM users u
    LEFT JOIN items i ON i.user_id = u.id
    LEFT JOIN qr_code q ON q.qr_code = i.qr_code_id
    LEFT JOIN code_mining cm ON cm.id = q.template_id
  `;

  let queryParams = [];

  // ✅ Apply Brand Filter only if brand_id is NOT null or "null"
  if (brand_id && brand_id !== "null") {
    query += ` WHERE cm.brand_id = ? `;
    queryParams.push(brand_id);
  }

  query += ` GROUP BY u.id `; // Group by user to count QR codes per user

  // ✅ Add pagination
  query += ` LIMIT ? OFFSET ?`;
  queryParams.push(pageSize, offset);

  const [rows] = await db.query(query, queryParams);

  // ✅ Count Query for total users
  let countQuery = `SELECT COUNT(DISTINCT u.id) AS total FROM users u
    LEFT JOIN items i ON i.user_id = u.id
    LEFT JOIN qr_code q ON q.qr_code = i.qr_code_id
    LEFT JOIN code_mining cm ON cm.id = q.template_id`;

  let countParams = [];
  if (brand_id && brand_id !== "null") {
    countQuery += ` WHERE cm.brand_id = ?`;
    countParams.push(brand_id);
  }

  const [[countResult]] = await db.query(countQuery, countParams);

  return {
    users: rows,
    totalPages: Math.ceil(countResult.total / pageSize),
  };
}

// Main API handler
 async function handler(req, res) {
  try {
    const isDbConnected = await checkDbConnection();
    if (!isDbConnected) {
      return res
        .status(500)
        .json({ success: false, message: "Database connection failed" });
    }

    if (req.method === "GET") {
      const { brand_id, page = 1, limit = 10 } = req.query;
      const { users, totalPages } = await getAllUsers(brand_id, page, limit);
      return res
        .status(200)
        .json({ success: true, data: users, total_pages: totalPages });
    }

    return res
      .status(405)
      .json({ success: false, message: "Method Not Allowed" });
  } catch (error) {
    console.log("error fetching alla users", error);

     res
      .status(500)
      .json({ success: false, message: "Internal server error" });
      throw error
  }
}
export default withMonitorLogger(handler)