import { withMonitorLogger } from "utils/withMonitorLogger";
import { db, checkDbConnection } from "../../../lib/db";

// Fetch brands or a specific codeMining
async function getCodeMining(req, res) {
  try {
    // Extract query parameters
    const { id, page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;
    const params = [];
    let query = `SELECT code_mining.*, brand_master.name AS brand_name,brand_master.service_to, sku_master.name AS sku_name FROM code_mining LEFT JOIN brand_master ON code_mining.brand_id = brand_master.id LEFT JOIN sku_master ON code_mining.sku_id = sku_master.id`;
    // Add condition if `id` is provided

    if (id) {
      query += ` WHERE code_mining.id = ?`;
      params.push(id);
    }

    // Add GROUP BY to group data by `code_mining.id` if necessary
    query += ` GROUP BY code_mining.id ORDER BY code_mining.id DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    // Order by `code_mining.id` in descending order

    // Execute the query
    const [rows] = await db.execute(query, params);

    // Get total count for pagination
    let countQuery = `SELECT COUNT(DISTINCT code_mining.id) AS total FROM code_mining`;
    const [countResult] = await db.execute(countQuery);
    const total = countResult[0]?.total || 0;

    // Return the result
    res.status(200).json({
      data: rows,
      total,
      current_page: parseInt(page),
      per_page: parseInt(limit),
    });
  } catch (error) {
    console.log("error fetching codemining data", error);
    res.status(500).json({
      message:
        "An error occurred while fetching code mining data. Please try again later.",
    });
    throw error
  }
}

async function getCodeMiningByBrand(req, res) {
  try {
    // Extract query parameters
    const { brand_id, page = 1, limit } = req.query;

    const params = [];

    // Base Query
    let query = `
      SELECT 
        code_mining.*, 
        brand_master.name AS brand_name, 
        brand_master.service_to AS service_to, 
        sku_master.name AS sku_name       
      FROM code_mining 
      LEFT JOIN brand_master ON code_mining.brand_id = brand_master.id 
      LEFT JOIN sku_master ON code_mining.sku_id = sku_master.id       
    `;

    // Query parameters

    // Apply brand_id filter if provided
    if (brand_id) {
      query += ` WHERE code_mining.brand_id = ?`;
      params.push(brand_id);
    }

    // Group by code_mining.id
    query += ` GROUP BY code_mining.id ORDER BY code_mining.id DESC `;

    let total = 0;
    if (limit && !isNaN(limit)) {
      const offset = (parseInt(page) - 1) * parseInt(limit);
      query += ` LIMIT ? OFFSET ?`;
      params.push(parseInt(limit), offset);

      // Get total count for pagination
      let countQuery = `SELECT COUNT(DISTINCT code_mining.id) AS total FROM code_mining`;
      if (brand_id) {
        countQuery += ` WHERE code_mining.brand_id = ?`;
      }

      const [countResult] = await db.execute(
        countQuery,
        brand_id ? [brand_id] : []
      );
      total = countResult[0]?.total || 0;
    }

    // Execute the query
    const [rows] = await db.execute(query, params);

    // Return the result
    res.status(200).json({
      data: rows,
      total: limit ? total : rows.length,
      current_page: limit ? parseInt(page) : 1,
      per_page: limit ? parseInt(limit) : rows.length,
    });
  } catch (error) {
    console.log("error fetching code mining data", error);
    res.status(500).json({
      message:
        "An error occurred while fetching code mining data. Please try again later.",
    });
    throw error
  }
}

const createCodeMining = async (req, res) => {
  try {
    const { template_name, brand_id, description, sku_id, total_codes } =
      req.body;

    // Validation
    if (!template_name || !brand_id || !sku_id || !total_codes) {
      return res.status(400).json({
        code: "ERR_MISSING_FIELDS",
        message:
          "Missing required fields. Please provide template_name, brand_id, description, sku_id, and total_codes.",
      });
    }

    const indate = new Date().toISOString().slice(0, 19).replace("T", " ");

    const [result] = await db.execute(
      `INSERT INTO code_mining (template_name, brand_id, description, sku_id, total_codes, indate)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [template_name, brand_id, description, sku_id, total_codes, indate]
    );

    return res.status(201).json({
      code: "SUCCESS_CODE_MINING_CREATED",
      message: "Code Mining data created successfully",
      codeMiningId: result.insertId,
    });
  } catch (error) {
    console.error("❌ Error inserting Code Mining data:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        code: "ERR_DUPLICATE_ENTRY",
        message: "Code Mining entry with the provided data already exists.",
      });
    }

     res.status(500).json({
      code: "ERR_DATABASE",
      message: "Database error while creating Code Mining entry.",
      details: error.message,
    });
    throw error
  }
};

// Update codeMining by ID
const updateCodeMining = async (req, res) => {
  const { id } = req.query;
  const {
    brand_id,
    code_length,
    code_type,
    description,
    sku_id,
    total_codes,
    indate,
  } = req.body;
  // Validate required fields
  if (
    !brand_id ||
    !code_length ||
    !code_type ||
    !description ||
    !sku_id ||
    !total_codes
  ) {
    return res.status(400).json({
      code: "ERR_MISSING_FIELDS",
      message:
        "Required fields are missing. Please provide brand_id, code_length, code_type, description, sku_id, and total_codes.",
    });
  }

  try {
    // Format the indate to a valid datetime format for the database

    // Insert the data into the database
    const [result] = await db.execute(
      `UPDATE code_mining SET brand_id = ?, code_length = ?, code_type  = ?, description  = ?, sku_id  = ?, total_codes  = ?, indate  = ? WHERE id = ?`,
      [
        brand_id,
        code_length,
        code_type,
        description,
        sku_id,
        total_codes,
        indate,
        id,
      ]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "codeMining updated successfully" });
    } else {
      res.status(404).json({ message: "codeMining not found" });
    }
  } catch (error) {
    console.log("database error", error);
    res.status(500).json({ message: "Database error" });
    throw error
  }
};
const updateBilling = async (req, res) => {
  const { billingDate, invoiceDetails, id } = req.body;

  // console.log("Received Data:", req.body); // Debugging ke liye

  if (!billingDate || !invoiceDetails || !id) {
    return res.status(401).json({
      code: "ERR_MISSING_FIELDS",
      message:
        "Required fields are missing. Please provide invoiceDetails, billingDate, and id.",
    });
  }

  try {
    const [result] = await db.execute(
      `UPDATE code_mining SET bill_date = ?, invoice_detail = ? WHERE id = ?`,
      [billingDate, invoiceDetails, id]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "codeMining updated successfully" });
    } else {
      res.status(404).json({ message: "codeMining not found" });
    }
  } catch (error) {
    console.log("database error", error);
    res.status(500).json({ message: "Database error" });
    throw error
  }
};

// Delete codeMining by ID
const deleteCodeMining = async (req, res) => {
  const { id } = req.query;
  try {
    const [result] = await db.execute("DELETE FROM code_mining WHERE id = ?", [
      id,
    ]);
    if (result.affectedRows > 0) {
      res.status(200).json({ message: "codeMining deleted successfully" });
    } else {
      res.status(404).json({ message: "codeMining not found" });
    }
  } catch (error) {
    console.log("database  error", error);
    res.status(500).json({ message: "Database error" });
    throw error
  }
};

// Patch function to update status in qr_code table
const patchQrCodeStatus = async (req, res) => {
  const { from_range, to_range, status } = req.body;

  // Validate required fields
  if (!from_range || !to_range || status === undefined) {
    return res.status(400).json({
      code: "ERR_MISSING_FIELDS",
      message:
        "Required fields are missing. Please provide from_range, to_range, and status.",
    });
  }

  try {
    // Update the status for the specified range
    const [result] = await db.execute(
      `UPDATE qr_code 
        SET status = ? 
        WHERE serial_number BETWEEN ? AND ?`,
      [status, from_range, to_range]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({
        message: `Status updated successfully for ${result.affectedRows} records.`,
      });
    } else {
      res.status(404).json({
        message: "No records found in the specified range.",
      });
    }
  } catch (error) {
    console.log("error updateing qr code data", error);
    res.status(500).json({
      code: "ERR_DATABASE",
      message: "An error occurred while updating QR Code status.",
      details: error.message,
    });
    throw error
  }
};

// API handler
 async function handler(req, res) {
  const isDbConnected = await checkDbConnection();
  // console.log("req", req.method);

  if (!isDbConnected) {
    return res.status(500).json({ message: "Database connection failed" });
  } else {
    // console.log("db connection okay");
  }
  const { id } = req.query;

  // if (req.method === "GET") {
  //   return getCodeMining(req, res);
  // }

  if (req.method === "GET") {
    const { brand_id } = req.query;

    // console.log("brand_iddd", brand_id);
    if (brand_id !== "null") {
      return getCodeMiningByBrand(req, res); // Brand-specific data fetch karega
    } else {
      return getCodeMining(req, res); // Saara data fetch karega
    }
  }

  if (req.method === "POST") {
    return createCodeMining(req, res);
  }

  if (req.method === "PUT" && id) {
    return updateCodeMining(req, res);
  }

  if (req.method === "DELETE" && id) {
    return deleteCodeMining(req, res);
  }
  if (req.method === "PATCH") {
    const { action } = req.query;
    // console.log("action", action);
    if (action === "updateBilling") {
      return updateBilling(req, res);
    } else {
      return patchQrCodeStatus(req, res);
    }
    // return patchQrCodeStatus(req, res);
  }

  res.status(405).json({ message: "Method Not Allowed" });
}
export default withMonitorLogger(handler)