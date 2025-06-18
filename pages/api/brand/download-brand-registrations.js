import { checkDbConnection, db } from "lib/db";
import { format } from "@fast-csv/format";
import { withMonitorLogger } from "utils/withMonitorLogger";

 async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { brandId, mobile = "", serial = "" } = req.query;

  if (!brandId) {
    return res.status(400).json({ message: "brandId is required" });
  }

  const isDbConnected = await checkDbConnection();
  if (!isDbConnected) {
    return res.status(500).json({ message: "Database connection failed" });
  }

  try {
    res.setHeader("Content-Disposition", `attachment; filename="registered_users.csv"`);
    res.setHeader("Content-Type", "text/csv");

    const csvStream = format({ headers: ["name", "email", "mobile", "registration_date"] });
    csvStream.pipe(res);

    // ✅ Same filter logic
    let whereConditions = [];
    let params = [];

    whereConditions.push(`qr_code.brand_id = ?`);
    params.push(brandId);

    if (mobile.trim()) {
      whereConditions.push(`users.mobile LIKE ?`);
      params.push(`%${mobile.trim()}%`);
    }

    if (serial.trim()) {
      whereConditions.push(`qr_code.serial_number LIKE ?`);
      params.push(`%${serial.trim()}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

    // ✅ Use db.query instead of stream
    const [rows] = await db.query(
      `
      SELECT users.full_name, users.email, users.mobile, users.created_at
      FROM users
      INNER JOIN items ON users.id = items.user_id
      INNER JOIN qr_code ON items.qr_code_id = qr_code.qr_code
      INNER JOIN code_mining ON qr_code.template_id = code_mining.id
      ${whereClause}
      ORDER BY users.id DESC
      `,
      params
    );

    rows.forEach((row) => {
      csvStream.write({
        name: row.full_name,
        email: row.email,
        mobile: row.mobile,
        registration_date: row.created_at,
      });
    });

    csvStream.end();
  } catch (err) {
    console.error("CSV Download Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
    throw err
  }
}
export default withMonitorLogger(handler)