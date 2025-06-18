import { checkDbConnection, db } from "lib/db";
import { withMonitorLogger } from "utils/withMonitorLogger";

// 🔹 Function to get brands and SKUs
const getDropdownData = async () => {
  const [brands] = await db.query("SELECT id, name FROM brand_master ORDER BY name ASC");
  const [skus] = await db.query("SELECT id, name FROM sku_master ORDER BY name ASC");
  return { brands, skus };
};

// const getQrData = async ({ sku, brand, from_range, to_range, limit = 10, page = 1 }) => {
//   let whereClauses = [];
//   let queryParams = [];

//   // Filter for code_mining
//   if (sku) {
//     whereClauses.push("sku_id = ?");
//     queryParams.push(sku);
//   }

//   if (brand) {
//     whereClauses.push("brand_id = ?");
//     queryParams.push(brand);
//   }

//   const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

//   // Step 1: Get matching code_mining rows
//   const [codeMiningRows] = await db.query(
//     `SELECT * FROM code_mining ${whereSql}`,
//     queryParams
//   );

//   if (!codeMiningRows.length) {
//     return { qrData: [], totalCount: 0 };
//   }

//   // Step 2: Collect template IDs
//   const templateIds = codeMiningRows.map((row) => row.id);
//   const placeholders = templateIds.map(() => '?').join(',');
//   const qrQueryParams = [...templateIds];

//   let serialCondition = '';
//   if (from_range) {
//     serialCondition += ` AND qc.serial_number >= ?`;
//     qrQueryParams.push(from_range);
//   }
//   if (to_range) {
//     serialCondition += ` AND qc.serial_number <= ?`;
//     qrQueryParams.push(to_range);
//   }

//   // Step 3: Count total records
//   const [countResult] = await db.query(
//     `SELECT COUNT(*) as count 
//      FROM qr_code qc 
//      WHERE qc.template_id IN (${placeholders}) ${serialCondition}`,
//     qrQueryParams
//   );
//   const totalCount = countResult[0].count;

//   // Step 4: Fetch QR data with brand and SKU names
//   const offset = (page - 1) * limit;
//   qrQueryParams.push(Number(limit), Number(offset));

//   const [qrData] = await db.query(
//     `SELECT 
//         qc.*, 
//         bm.name AS brand_name, 
//         sm.name AS sku_name
//      FROM qr_code qc
//    LEFT JOIN brand_master bm ON qc.brand_id = bm.id
// LEFT JOIN code_mining cm ON qc.template_id = cm.id
// LEFT JOIN sku_master sm ON cm.sku_id = sm.id
//      WHERE qc.template_id IN (${placeholders}) ${serialCondition}
//      ORDER BY qc.id DESC
//      LIMIT ? OFFSET ?`,
//     qrQueryParams
//   );

//   return { qrData, totalCount };
// };


const getQrData = async ({ sku, brand, from_range, to_range, limit = 10, page = 1 }) => {
  let whereClauses = [];
  let queryParams = [];

  if (sku) {
    whereClauses.push("cm.sku_id = ?");
    queryParams.push(sku);
  }

  if (brand) {
    whereClauses.push("qc.brand_id = ?");
    queryParams.push(brand);
  }

  if (from_range) {
    whereClauses.push("qc.serial_number >= ?");
    queryParams.push(from_range);
  }

  if (to_range) {
    whereClauses.push("qc.serial_number <= ?");
    queryParams.push(to_range);
  }

  const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

  // Count
  const [countResult] = await db.query(
    `SELECT COUNT(*) as count
     FROM qr_code qc
     LEFT JOIN code_mining cm ON qc.template_id = cm.id
     ${whereSql}`,
    queryParams
  );

  const totalCount = countResult[0].count;
  const offset = (page - 1) * limit;
  queryParams.push(Number(limit), Number(offset));

  const [qrData] = await db.query(
    `SELECT 
        qc.*, 
        bm.name AS brand_name, 
        sm.name AS sku_name
     FROM qr_code qc
     LEFT JOIN code_mining cm ON qc.template_id = cm.id
     LEFT JOIN brand_master bm ON qc.brand_id = bm.id
     LEFT JOIN sku_master sm ON cm.sku_id = sm.id
     ${whereSql}
     ORDER BY qc.id DESC
     LIMIT ? OFFSET ?`,
    queryParams
  );

  return { qrData, totalCount };
};


const updateQrData = async (req, res) => {
  try {
    console.log("reqqq", req.query)
    console.log("body", req.body)
    let { from_range, to_range, brand, sku, user } = req.query;
    const { expiry_date, status, production_batch_no, remarks, new_brand,condition_status } = req.body;

    const fields = [];
    const values = [];

    if (expiry_date && expiry_date.trim() !== "") {
      fields.push("expiry_date = ?");
      values.push(expiry_date);
    }

    if (status !== undefined && status !== "") {
      fields.push("status = ?");
      values.push(status);
    }
    if (condition_status !== undefined && condition_status !== "") {
      fields.push("condition_status = ?");
      values.push(condition_status);
    }
    if (new_brand !== undefined && new_brand !== null && new_brand !== "") {
      fields.push("brand_id = ?");
      values.push(new_brand);
    }


    if (production_batch_no && production_batch_no.trim() !== "") {
      fields.push("production_batch_no = ?");
      values.push(production_batch_no);
    }
    const updatedFields = [];
    if (expiry_date && expiry_date.trim() !== "") updatedFields.push("Expiry Date");
    if (status !== undefined && status !== "") {
      if (status === "1" || status === 1) {
        updatedFields.push("Activation");
      } else if (status === "0" || status === 0) {
        updatedFields.push("Deactivation");
      } else {
        updatedFields.push("Status");
      }
    }
    if (production_batch_no && production_batch_no.trim() !== "") updatedFields.push("Production Batch");

    const action = updatedFields.length ? updatedFields.join(",") : "Update";

    // No fields to update
    if (fields.length === 0) {
      return res.status(400).json({ message: "No fields provided to update." });
    }

    let whereClause = '';
    const rangeValues = [];

    // 🧠 Add range condition only if range is provided
    if (from_range && to_range && from_range.trim() !== "" && to_range.trim() !== "") {
      whereClause = `WHERE serial_number BETWEEN ? AND ?`;
      rangeValues.push(from_range, to_range);
    }

    const updateQuery = `
      UPDATE qr_code 
      SET ${fields.join(", ")} 
      ${whereClause}
    `;

    // 1. Execute UPDATE query and get affected row count
    const [updateResult] = await db.query(updateQuery, [...values, ...rangeValues]);

    // 2. Get current timestamp for ledger entry
    const now = new Date();
    const mysqlDate = now.toISOString().replace('T', ' ').slice(0, 19);

    // 3. Compute total safely
    let total = 0;
    if (from_range && to_range && !isNaN(from_range) && !isNaN(to_range)) {
      total = parseInt(to_range) - parseInt(from_range) + 1;
    } else {
      total = updateResult.affectedRows;
    }

    // 4. Prepare values for code_ledgers table
    const ledgerValues = [
      action,                                        // action
      sku,                                             // sku_id
      user,                                            // user_id
      brand,                                           // brand_id
      from_range && !isNaN(from_range) ? parseInt(from_range) : null,  // ✅ null if blank
      to_range && !isNaN(to_range) ? parseInt(to_range) : null,        // ✅ null if blank
      total,                                           // total count
      remarks || "Update this field",                 // description
      mysqlDate                                        // created_at
    ];

    // 5. Insert into code_ledgers
    const insertLedgerQuery = `
  INSERT INTO code_ledgers 
    (action, sku_id, user_id, brand_id, range_from, range_to, total, description, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

    await db.query(insertLedgerQuery, ledgerValues);

    return { affectedRows: updateResult.affectedRows, total };

  } catch (error) {
    console.error("Error updating QR data:", error);

  }
};








async function handler(req, res) {
  const isDbConnected = await checkDbConnection();

  if (!isDbConnected) {
    return res.status(500).json({ message: "Database connection failed" });
  }

  const { method, query, body } = req;

  try {
    if (method === "GET") {
      const { action, sku, brand, from_range, to_range, limit, page } = query;

      if (action === "qr") {
        const result = await getQrData({ sku, brand, from_range, to_range, limit, page });
        return res.status(200).json(result);
      }

      const result = await getDropdownData();
      return res.status(200).json(result);
    }
    if (method === "PATCH") {
      const result = await updateQrData(req, res);
      return res.status(200).json({ message: "QR data updated", result });
    }
    

    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    console.error("Error in API handler:", error);
    res.status(500).json({ message: "Internal Server Error" });
    throw error
  }
}
export default withMonitorLogger(handler)