import { db } from "lib/db";
import { withMonitorLogger } from "utils/withMonitorLogger";

 async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Query to fetch items with category messages
    const query = `
      SELECT 
        i.id AS item_id,
        i.item_name,
        i.qr_code_id,
        i.category_id,
        i.description,
        i.latitude,
        i.longitude,
        i.image_url,
        i.user_id,
        cm.message AS category_message
      FROM items i
      LEFT JOIN category_msg_template cm 
        ON i.category_id = cm.category_id
    `;

    const [rows] = await db.query(query);

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching items with category messages:", error);
     res.status(500).json({ error: "Internal Server Error" });
     throw error
  }
}
export default withMonitorLogger(handler)