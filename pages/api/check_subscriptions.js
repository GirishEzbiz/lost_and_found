import { db } from "../../lib/db";
import { authenticate } from "../../lib/auth";
import { withMonitorLogger } from "utils/withMonitorLogger";

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req, res) => {
  if (req.method === "GET") {
    try {
      // Authenticate user and get user_id
      const { id: user_id } = authenticate(req, res);
      console.log("Authenticated user ID:", user_id);

      // SQL query to fetch expiring items
      const expiryQuery = `
        SELECT i.id AS item_id, 
               i.item_name, 
               q.expiry_date as subscription_end_date
        FROM items i
        JOIN qr_code q ON i.qr_code_id = q.qr_code
        WHERE i.user_id = ? AND DATE(q.expiry_date) BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 14 DAY);`;

      // Execute query
      const [expiringItems] = await db.query(expiryQuery, [user_id]);

      if (expiringItems.length === 0) {
        return res
          .status(404)
          .json({ message: "No items expiring within two weeks" });
      }

      // Return result
      return res.status(200).json(expiringItems);
    } catch (error) {
      console.log("error fetching itmes expiring ", error);

       res.status(500).json({ message: "Internal server error" });
       
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
};

export default handler
