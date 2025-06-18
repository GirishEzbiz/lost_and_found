import { withMonitorLogger } from "utils/withMonitorLogger";
import { db } from "../../../lib/db";

async function handler(req, res) {
  if (req.method === "GET") {
    const { template_id } = req.query;

    if (!template_id) {
      return res.status(400).json({ message: "template_id is required" });
    }

    try {
      // Fetch QR Codes with SKU ID and SKU Name
      const query = `
                SELECT 
                    qr_code.*,
                    brand_master.id AS brand_id,
                    brand_master.name AS brand_name,
                    sku_master.id AS sku_id,
                    sku_master.name AS sku_name
                FROM qr_code  
                INNER JOIN code_mining ON qr_code.template_id = code_mining.id 
                INNER JOIN brand_master ON code_mining.brand_id = brand_master.id 
                INNER JOIN sku_master ON code_mining.sku_id = sku_master.id 
                WHERE qr_code.template_id = ?
            `;

      const [result] = await db.query(query, [template_id]);

      return res.status(200).json({ qr_codes: result });
    } catch (error) {
      console.log("internal server erorr", error);
      res.status(500).json({ message: "Internal Server Error" });
      throw error
    }
  }
}
export default withMonitorLogger(handler)