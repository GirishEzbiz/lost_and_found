import { withMonitorLogger } from "utils/withMonitorLogger";
import { db } from "../../../lib/db";

async function handler(req, res) {
  if (req.method === "GET") {
    const { brand_id, brand, sku_id, fromDate, toDate, batch_id } = req.query;

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
        qr_code.created_at,
        qr_code.registration_date,
        qr_code.template_id,
        users.mobile as user_mobile,users.email as user_email,
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

    // ✅ Agar batch_id ho toh sirf matching template_id ka data fetch karo
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
    if (sku_id && sku_id !== "null") {
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

    try {
      const [result] = await db.query(querys, params);

      // ✅ Count Query with Correct Conditions
      let countQuery = `SELECT COUNT(*) as total_records FROM qr_code left join code_mining ON (qr_code.template_id=code_mining.id) WHERE 1=1`;
      let countParams = [];

      if (batch_id && batch_id !== "null" && batch_id !== "undefined") {
        countQuery += ` AND template_id = ?`;
        countParams.push(batch_id);
      }

      if (brand_id && brand_id !== "null") {
        countQuery += ` AND code_mining.brand_id = ?`;
        countParams.push(brand_id);
      }

      // console.log("result", result);

      return res.status(200).json({
        qr_codes: result,
      });
    } catch (error) {
      console.log("internal server error", error);
      res.status(500).json({ message: "Internal Server Error" });
      throw error
    }
  }
}
export default withMonitorLogger(handler)