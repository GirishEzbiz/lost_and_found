import { checkDbConnection, db } from "lib/db";
import { withMonitorLogger } from "utils/withMonitorLogger";

// Define the function first
const getPermissions = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM permissions order by id desc");
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching permissions:", error);
    res.status(500).json({ message: "Failed to fetch permissions" });
    throw error
  }
};

const createPermission = async (req, res) => {
  try {
    const { name, type } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: "Missing or invalid fields" });
    }

    const [result] = await db.query(
      "INSERT INTO permissions (name, type) VALUES (?, ?)",
      [name, type]
    );

    res
      .status(201)
      .json({ message: "Permission created", id: result.insertId });
  } catch (error) {
    console.error("Error creating permission:", error);
    res.status(500).json({ message: "Failed to create permission" });
    throw error
  }
};

async function handler(req, res) {
  const isDbConnected = await checkDbConnection();

  if (!isDbConnected) {
    return res.status(500).json({ message: "Database connection failed" });
  }

  if (req.method === "GET") {
    return getPermissions(req, res); // Now getPermissions is defined above
  } else if (req.method === "POST") {
    return createPermission(req, res); // Implement createPermission as needed
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
export default withMonitorLogger(handler)