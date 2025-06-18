import { withMonitorLogger } from "utils/withMonitorLogger";
import { db, checkDbConnection } from "../../../lib/db";

// Fetch all code batches
async function getContactData(req, res) {
  const { page = 1, limit = 5, search = "" } = req.query;

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const searchTerm = `%${search}%`;
  try {
    // Get total count
    const [countResult] = await db.query(
      `SELECT COUNT(*) AS total FROM contact_submissions`,
      [searchTerm]
    );
    const total = countResult[0].total;

    const [rows] = await db.query(`SELECT * FROM contact_submissions`, [
      searchTerm,
      parseInt(limit),
      offset,
    ]);
    res.status(200).json({ result: rows, total });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ message: "Failed to fetch code batches" });
    throw error
  }
}

// Handle both GET and POST
 async function handler(req, res) {
  const isDbConnected = await checkDbConnection();
  // console.log("req", req.method);

  if (!isDbConnected) {
    return res.status(500).json({ message: "Database connection failed" });
  } else {
    // console.log("db connection okay");
  }

  if (req.method === "GET") {
    return getContactData(req, res);
  } else {
    res.setHeader("Allow", ["GET", "POST", "PATCH"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
export default withMonitorLogger(handler)