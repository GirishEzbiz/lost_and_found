import { withMonitorLogger } from "utils/withMonitorLogger";
const { checkDbConnection, db } = require("lib/db");



async function getResponseMessages(req, res) {
  try {
    const id = req?.params?.id;

    if (id) {
      const messageQuery = `
        SELECT 
          msgtmp.id,
          msgtmp.sku_id,
          msgtmp.brand_id,
          bm.name AS brand_name,
          sm.name AS sku_name,
          msgtmp.message,
          msgtmp.id_default
        FROM message_templates msgtmp
        LEFT JOIN sku_master sm ON msgtmp.sku_id = sm.id
        LEFT JOIN brand_master bm ON msgtmp.brand_id = bm.id
        WHERE msgtmp.id = ?
      `;

      const [rows] = await db.query(messageQuery, [id]);

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Message template not found",
        });
      }

      const data = rows.map((row) => ({
        id: row.id,
        sku_id: row.sku_id,
        message: row.message,
        default: row.is_default,
        sku_name: row.sku_name,
        brand_id: row.brand_id,
        brand_name: row.brand_name,
      }));

      return res.status(200).json({
        success: true,
        data,
      });
    } else {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const skuFilter = req.query.sku_id ? `AND msgtmp.sku_id = ?` : "";
      const brandFilter = req.query.brand_id ? `AND msgtmp.brand_id = ?` : "";

      const values = [];
      if (req.query.sku_id) values.push(req.query.sku_id);
      if (req.query.brand_id) values.push(req.query.brand_id);

      const baseQuery = `
        FROM message_templates msgtmp
        LEFT JOIN sku_master sm ON msgtmp.sku_id = sm.id
        LEFT JOIN brand_master bm ON msgtmp.brand_id = bm.id
        WHERE 1=1 ${skuFilter} ${brandFilter}
      `;

      // Count total records
      const [countRows] = await db.query(
        `SELECT COUNT(*) as total ${baseQuery}`,
        values
      );
      const total = countRows[0]?.total || 0;

      // Fetch paginated data
      const messageQuery = `
        SELECT 
          msgtmp.id,
          msgtmp.sku_id,
          msgtmp.brand_id,
          bm.name AS brand_name,
          sm.name AS sku_name,
          msgtmp.message,
          msgtmp.is_default
        ${baseQuery}
        ORDER BY msgtmp.id DESC
        LIMIT ? OFFSET ?
      `;
      const [dataRows] = await db.query(messageQuery, [...values, limit, offset]);

      const data = dataRows.map((row) => ({
        id: row.id,
        sku_id: row.sku_id,
        message: row.message,
        default: row.default,
        sku_name: row.sku_name,
        brand_id: row.brand_id,
        brand_name: row.brand_name,
      }));

      const [skuList] = await db.query(
        `SELECT id, name FROM sku_master ORDER BY name ASC`
      );
      const [brandList] = await db.query(
        `SELECT id, name FROM brand_master ORDER BY name ASC`
      );

      return res.status(200).json({
        success: true,
        data,
        total,
        skuList,
        brandList,
      });
    }
  } catch (error) {
    console.error("Error fetching response messages:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch response messages",
      error: error.message,
    });
  }
}



async function createMessageTemplate(req, res) {
    try {
        const { sku, brand, success, invalid, notActive, expired, fake, blacklisted } = req.body;

        if (!sku?.value || !brand?.value) {
            return res.status(400).json({ success: false, message: "sku and brand are required" });
        }

        const skuId = sku.value;
        const brandId = brand.value;

        // Check if a template already exists for this SKU and Brand
        const checkQuery = `
            SELECT id FROM message_templates
            WHERE sku_id = ? AND brand_id = ?
            LIMIT 1
        `;
        const [existingRows] = await db.query(checkQuery, [skuId, brandId]);

        if (existingRows.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Template for this SKU and Brand already exists"
            });
        }

        const message = { success, invalid, notActive, expired, fake, blacklisted };

        const insertQuery = `
            INSERT INTO message_templates (sku_id, brand_id, message)
            VALUES (?, ?, ?)
        `;

        const [result] = await db.query(insertQuery, [
            skuId,
            brandId,
            JSON.stringify(message)
        ]);

        return res.status(201).json({
            success: true,
            message: "Message template created successfully",
            data: {
                id: result.insertId,
                sku_id: skuId,
                brand_id: brandId,
                message
            }
        });
    } catch (error) {
        console.error("Error creating message template:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create message template",
            error: error.message
        });
    }
}


async function updateMessageTemplate(req, res) {
    try {
        const { id } = req.params;
        const { sku, brand, success, invalid, notActive, expired, fake, blacklisted } = req.body;

        console.log("req", req.body);

        // Validate required fields
        if (!sku?.value || !brand?.value) {
            return res.status(400).json({ success: false, message: "sku and brand are required" });
        }

        const message = {
            success,
            invalid,
            notActive,
            expired,
            fake,
            blacklisted
        };

        // Optional: Validate message is valid JSON
        try {
            JSON.stringify(message); // Just ensuring it's serializable
        } catch (err) {
            return res.status(400).json({ success: false, message: "Invalid message structure" });
        }

        // Check if the message template with the given ID exists
        const selectQuery = `SELECT * FROM message_templates WHERE id = ?`;
        const [existingTemplate] = await db.query(selectQuery, [id]);

        if (existingTemplate.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Message template not found"
            });
        }

        // Update the message template
        const updateQuery = `
            UPDATE message_templates 
            SET sku_id = ?, brand_id = ?, message = ?
            WHERE id = ?
        `;
        const [updateResult] = await db.query(updateQuery, [
            sku.value,
            brand.value,
            JSON.stringify(message),
            id
        ]);

        return res.status(200).json({
            success: true,
            message: "Message template updated successfully",
            data: {
                id,
                sku_id: sku.value,
                brand_id: brand.value,
                message
            }
        });
    } catch (error) {
        console.error("Error updating message template:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update message template",
            error: error.message
        });
    }
}



async function handler(req, res) {
    
    const isDbConnected = await checkDbConnection();
    if (!isDbConnected) {
        return res.status(500).json({ message: "Database connection failed" });
    }

    if (req.method === "GET") {
        const { id } = req.query;
        console.log('idxd9',id)
        return getResponseMessages(req, res);
    }
    else if (req.method === "POST") {
        return createMessageTemplate(req, res);
    }
    else if (req.method === "PATCH") {
        return updateMessageTemplate(req, res);
    }
    return res.status(405).json({ message: "Method Not Allowed" });
}

export default withMonitorLogger(handler);
