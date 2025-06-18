import { checkDbConnection, db } from "lib/db";
import bcrypt from "bcryptjs";
import { withMonitorLogger } from "utils/withMonitorLogger";
const getUserRegstration = async (req, res) => {
  const { brandId, page = 1, limit = 10, serial = "", mobile = "" } = req.query;

  if (!brandId) {
    return res.status(400).json({ message: "brandId is required" });
  }

  const offset = (parseInt(page) - 1) * parseInt(limit);
  // Validate limit and offset
  let whereConditions = [];
let params = [];

whereConditions.push(`qr_code.brand_id = ?`);
params.push(brandId);

if (req.query.mobile) {
  whereConditions.push(`users.mobile LIKE ?`);
  params.push(`%${req.query.mobile}%`);
}

if (req.query.serial) {
  whereConditions.push(`qr_code.serial_number LIKE ?`);
  params.push(`%${req.query.serial}%`);
}

const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

  try {
    // Count total users for pagination
    const [countResult] = await db.query(
      `SELECT COUNT(DISTINCT users.id) AS count
       FROM users
       INNER JOIN items ON users.id = items.user_id
       INNER JOIN qr_code ON items.qr_code_id = qr_code.qr_code
       INNER JOIN code_mining ON qr_code.template_id = code_mining.id
       ${whereClause}`,
  params
    );

    const totalCount = countResult[0].count;

    // Fetch paginated users
    const [users] = await db.query(
      `SELECT DISTINCT users.id, users.full_name, users.email, users.mobile, users.status,users.created_at FROM users
       INNER JOIN items ON users.id = items.user_id
       INNER JOIN qr_code ON items.qr_code_id = qr_code.qr_code
       INNER JOIN code_mining ON qr_code.template_id = code_mining.id
       ${whereClause}
   ORDER BY users.id DESC
   LIMIT ? OFFSET ?`,
  [...params, parseInt(limit), offset]
    );

    res.status(200).json({ data: users, totalCount });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message,
    });
    throw error
  }
};

// ----------- EXPORT HANDLER -------------
 async function handler(req, res) {
  const isDbConnected = await checkDbConnection();

  if (!isDbConnected) {
    return res.status(500).json({ message: "Database connection failed" });
  }

  switch (req.method) {
    case "GET":
      return getUserRegstration(req, res); // 👈 GET for brand users
    default:
      return res.status(405).json({ message: "Method not allowed" });
  }
}
export default withMonitorLogger(handler)