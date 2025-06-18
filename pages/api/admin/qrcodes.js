import { withMonitorLogger } from "utils/withMonitorLogger";
import { db } from "../../../lib/db";

async function handler(req, res) {
  if (req.method === "GET") {
    const {
      brand_id,
      page = 1,
      limit = 10,
      brand,
      sku_id,
      fromDate,
      toDate,
      batch_id,
      serial_number,
      user_mobile,
      sku_name,
      tracking_status,
      registration_date,
      expiry_date,
    } = req.query;


    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const offset = (pageNumber - 1) * pageSize;



    let querys = `
      SELECT 
        qr_code.id,
        qr_code.serial_number,
        brand_master.name AS brand_name,
        brand_master.id AS brand_id,
        sku_master.name AS sku_name,
        sku_master.id AS sku_id,
        qr_code.expiry_date,
        qr_code.qr_code,
        qr_code.status,
        qr_code.is_activated,
        qr_code.is_lost,
        qr_code.is_found,
        qr_code.is_recovered,
        qr_code.is_downloaded,
        qr_code.download_date,
        qr_code.created_at,
        qr_code.registration_date,
        qr_code.template_id,
        users.mobile as user_mobile,
        users.email as user_email,
        items.item_name
      FROM qr_code 
      LEFT JOIN code_mining ON qr_code.template_id = code_mining.id 
      LEFT JOIN brand_master ON code_mining.brand_id = brand_master.id 
      LEFT JOIN items ON qr_code.qr_code = items.qr_code_id 
      LEFT JOIN users ON items.user_id = users.id 
      LEFT JOIN sku_master ON code_mining.sku_id = sku_master.id
      WHERE 1=1 
    `;

    let params = [];

    // ✅ Apply batch_id filter
    if (batch_id && batch_id !== "null" && batch_id !== "undefined") {
      querys += ` AND qr_code.template_id = ?`;
      params.push(batch_id);
    }

    // ✅ Apply brand_id filter
    if (brand_id && brand_id !== "null") {
      querys += ` AND code_mining.brand_id = ?`;
      params.push(brand_id);
    }

    // ✅ Apply additional filters
    if (brand) {
      querys += ` AND LOWER(brand_master.name) LIKE ?`;
      params.push(`%${brand.toLowerCase()}%`);
    }
    if (sku_id && sku_id !== "null" && sku_id !== "undefined") {
      querys += ` AND code_mining.sku_id = ?`;
      params.push(sku_id);
    }

    if (fromDate) {
      querys += ` AND qr_code.created_at >= ?`;
      params.push(fromDate);
    }
    if (toDate) {
      querys += ` AND qr_code.created_at <= ?`;
      params.push(toDate);
    }

    // ✅ Apply new filters
    if (serial_number) {
      querys += ` AND qr_code.serial_number = ?`;
      params.push(serial_number);
    }
    if (user_mobile) {
      querys += ` AND users.mobile = ?`;
      params.push(user_mobile);
    }
    if (sku_name) {
      querys += ` AND sku_master.name = ?`;
      params.push(sku_name);
    }
    if (tracking_status) {
      // "Registered" case
      if (tracking_status.toLowerCase() === "registered") {
        querys += ` AND qr_code.is_activated = 1 AND qr_code.is_lost = 0 AND qr_code.is_found = 0 AND qr_code.is_recovered = 0`;

        // "Item Lost" case
      } else if (tracking_status.toLowerCase() === "item lost") {
        querys += ` AND qr_code.is_activated = 1 AND qr_code.is_lost = 1 AND qr_code.is_found = 0 AND qr_code.is_recovered = 0`;

        // "Item Found" case
      } else if (tracking_status.toLowerCase() === "item found") {
        querys += ` AND qr_code.is_activated = 1 AND qr_code.is_lost = 1 AND qr_code.is_found = 1 AND qr_code.is_recovered = 0`;

        // "Item Recovered" case
      } else if (tracking_status.toLowerCase() === "item recovered") {
        querys += ` AND qr_code.is_activated = 1 AND qr_code.is_lost = 1 AND qr_code.is_found = 1 AND qr_code.is_recovered = 1`;

        // Default Case - Unregistered
      } else {
        querys += ` AND qr_code.status = ?`;
        params.push(tracking_status);
        querys += ` AND qr_code.is_activated = 0 AND qr_code.is_lost = 0 AND qr_code.is_found = 0 AND qr_code.is_recovered = 0`;
      }
    }

    if (registration_date) {
      querys += ` AND DATE(qr_code.registration_date) = ?`;
      params.push(registration_date);
    }
    if (expiry_date) {
      querys += ` AND DATE(qr_code.expiry_date) = ?`;
      params.push(expiry_date);
    }

    // ✅ Add pagination
    querys += ` LIMIT ? OFFSET ?`;
    params.push(pageSize, offset);

    try {
      const [result] = await db.query(querys, params);

      // ✅ Count Query with Correct Conditions
      let countQuery = `SELECT COUNT(*) as total_records FROM qr_code 
      LEFT JOIN code_mining ON qr_code.template_id = code_mining.id 
      LEFT JOIN brand_master ON code_mining.brand_id = brand_master.id 
      LEFT JOIN users ON qr_code.qr_code = users.id
      LEFT JOIN sku_master ON code_mining.sku_id = sku_master.id
      WHERE 1=1`;

      let countParams = [];

      if (batch_id && batch_id !== "null" && batch_id !== "undefined") {
        countQuery += ` AND qr_code.template_id = ?`;
        countParams.push(batch_id);
      }
      if (brand_id && brand_id !== "null") {
        countQuery += ` AND code_mining.brand_id = ?`;
        countParams.push(brand_id);
      }
      if (serial_number) {
        countQuery += ` AND qr_code.serial_number = ?`;
        countParams.push(serial_number);
      }
      if (user_mobile) {
        countQuery += ` AND users.mobile = ?`;
        countParams.push(user_mobile);
      }
      if (sku_name) {
        countQuery += ` AND sku_master.name = ?`;
        countParams.push(sku_name);
      }
      if (tracking_status) {
        countQuery += ` AND qr_code.status = ?`;
        countParams.push(tracking_status);
      }
      if (registration_date) {
        countQuery += ` AND DATE(qr_code.registration_date) = ?`;
        countParams.push(registration_date);
      }
      if (expiry_date) {
        countQuery += ` AND DATE(qr_code.expiry_date) = ?`;
        countParams.push(expiry_date);
      }

      const [countResult] = await db.query(countQuery, countParams);
      const totalRecords = countResult[0]?.total_records || 0;
      const totalPages = Math.ceil(totalRecords / pageSize);

      return res.status(200).json({
        qr_codes: result,
        total_pages: totalPages,
        total_records: totalRecords,
        current_page: pageNumber,
      });
    } catch (error) {
      console.log("internal server error  ", error);
      res.status(500).json({ message: "Internal Server Error" });
      throw error
    }
  }
}
export default withMonitorLogger(handler)