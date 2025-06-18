import { withMonitorLogger } from "utils/withMonitorLogger";
const { checkDbConnection, db } = require("lib/db");

async function getCodeLedger(req, res) {
  try {
    const { from_date, to_date, user, action,serial, sku, limit, offset } = req.query;

    // Set defaults for limit and offset if not provided
    const pageLimit = limit ? parseInt(limit) : 10; // Default to 10 records per page
    const pageOffset = offset ? parseInt(offset) : 0; // Default to offset of 0 (first page)

    // Build conditions dynamically
    const conditions = [];
    const values = [];

    if (from_date) {
      conditions.push(`DATE(cl.created_at) >= ?`);
      values.push(from_date);
    }

    if (to_date) {
      conditions.push(`DATE(cl.created_at) <= ?`);
      values.push(to_date);
    }
    if (serial) {
      conditions.push(`(cl.range_from LIKE ? OR cl.range_to LIKE ?)`);
      values.push(`%${serial}%`, `%${serial}%`);
    }
    
    if (user) {
      conditions.push(`a.name = ?`);
      values.push(user);
    }
    let actions = action ? action.split(",") : []; // Split the 'action' query parameter into an array

    if (actions.length > 0) {
      const likeClauses = actions.map(() => `REPLACE(LOWER(cl.action), ' ', '') LIKE ?`);
      conditions.push(`(${likeClauses.join(" OR ")})`);
      values.push(...actions.map(val => `%${val.toLowerCase().replace(/\s/g, '')}%`));
    }
    if (sku) {
      conditions.push(`sm.name = ?`);
      values.push(sku);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    // Query to fetch data with pagination (limit and offset)
    const query = `
        SELECT 
          cl.*, 
          bm.name AS brand_name, 
          sm.name AS sku_name,
          a.name AS user_name
        FROM 
          code_ledgers cl
        LEFT JOIN brand_master bm ON cl.brand_id = bm.id
        LEFT JOIN sku_master sm ON cl.sku_id = sm.id
        LEFT JOIN admins a ON cl.user_id = a.id
        ${whereClause}
        ORDER BY cl.created_at DESC
        LIMIT ? OFFSET ?
      `;
      console.log("🟡 Final SQL Query:", query);
      console.log("🟡 SQL Values:", [...values, pageLimit, pageOffset]);
      
    // Execute the main query with pagination
    const [data] = await db.query(query, [...values, pageLimit, pageOffset]);

    // Query to get the total number of records (without pagination)
    const countQuery = `
        SELECT COUNT(*) AS total_count
        FROM 
          code_ledgers cl
        LEFT JOIN brand_master bm ON cl.brand_id = bm.id
        LEFT JOIN sku_master sm ON cl.sku_id = sm.id
        LEFT JOIN admins a ON cl.user_id = a.id
        ${whereClause}
      `;

    const [[{ total_count }]] = await db.query(countQuery, values);

    // Query to get all admins (for the dropdown)
    const [users] = await db.query(`
        SELECT id, name FROM admins ORDER BY name ASC
      `);

    // Query to get all SKUs (for the dropdown)
    const [skus] = await db.query(`
        SELECT id, name FROM sku_master ORDER BY name ASC
      `);

    // Return the data along with pagination info
    return res.json({
      data,
      users,
      skus,
      totalPages: Math.ceil(total_count / pageLimit), // Calculate total pages
      currentPage: Math.floor(pageOffset / pageLimit) + 1, // Current page
      totalCount: total_count, // Total number of records
    });
  } catch (error) {
    console.error("Error fetching code ledger:", error);
    return res.status(500).json({ message: "Failed to fetch code ledger", error: error.message });
  }
}


async function handler(req, res) {
  // Check DB connection
  let isDbConnected = await checkDbConnection();
  if (!isDbConnected) {
    return res.status(500).json({ message: "Database connection failed" });
  }

  // Handle GET requests
  if (req.method === "GET") {
    return getCodeLedger(req, res); // Call the function to get code ledger
  }

  // If method is not GET, return a 405 Method Not Allowed
  return res.status(405).json({ message: "Method Not Allowed" });
}

export default withMonitorLogger(handler);
