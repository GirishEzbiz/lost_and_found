import { withMonitorLogger } from "utils/withMonitorLogger";
import { db, checkDbConnection } from "../../../lib/db";

// Fetch all code batches
async function getBatches(req, res) {
  const { page = 1, limit = 5, search = "" } = req.query;

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const searchTerm = `%${search}%`;
  try {
    // Get total count
    const [countResult] = await db.query(
      `SELECT COUNT(*) AS total FROM code_batch WHERE batch_name LIKE ?`,
      [searchTerm]
    );
    const total = countResult[0].total;
    const [rows] = await db.query(
      `SELECT cb.*, 
              cm.template_name, 
              b.id as brand_id, 
              s.id as sku_id
       FROM code_batch cb
       LEFT JOIN code_mining cm ON cb.template_id = cm.id
       LEFT JOIN brand_master b ON cm.brand_id = b.id  
       LEFT JOIN sku_master s ON cm.sku_id = s.id     
       WHERE cb.batch_name LIKE ?
       ORDER BY cb.id DESC
       LIMIT ? OFFSET ?`,
      [searchTerm, parseInt(limit), offset]
    );
    
    res.status(200).json({ batches: rows, total });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ message: "Failed to fetch code batches" });
    throw error;
  }
}

// Create a new code batch
async function createBatch(req, res) {
  try {
    const {
      batch_name,
      template_id,
      expiry_date,
      total_codes,
      start_sr_no,
      end_sr_no,
      created_by,
    } = req.body;

    if (
      !batch_name ||
      !template_id ||
      !expiry_date ||
      !total_codes ||
      !start_sr_no ||
      !end_sr_no
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const [result] = await db.query(
      `INSERT INTO code_batch 
        (batch_name, template_id, expiry_date, total_codes, start_sr_no, end_sr_no, process_status, created_at, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        batch_name,
        template_id,
        expiry_date,
        total_codes,
        start_sr_no,
        end_sr_no,
        0, // Default process_status
        new Date(),
        created_by || 0,
      ]
    );

    res.status(201).json({ message: "Batch created", id: result.insertId });
  } catch (error) {
    console.error("Insert error:", error);
    res.status(500).json({ message: "Failed to create batch" });
    throw error;

  }
}

async function updateBatch(req, res) {
  try {
    const { id, process_status } = req.body;

    if (!id || !process_status) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const [result] = await db.query(
      `UPDATE code_batch SET process_status = ? WHERE id = ?`,
      [process_status, id]
    );

    res.status(200).json({ message: "Batch updated" });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Failed to update batch" });
    throw error;

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
    return getBatches(req, res);
  } else if (req.method === "POST") {
    return createBatch(req, res);
  } else if (req.method === "PATCH") {
    return updateBatch(req, res);
  } else {
    res.setHeader("Allow", ["GET", "POST", "PATCH"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withMonitorLogger(handler)