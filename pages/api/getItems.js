import { db } from "../../lib/db";
import { authenticate } from "../../lib/auth";
import { withMonitorLogger } from "utils/withMonitorLogger";

/**
 * Fetch items by user ID with QR Code details
 * @param {number} userId - ID of the authenticated user
 * @param {number|null} itemId - Optional item ID to filter
 * @returns {Promise<Array>} - Array of items with QR details
 */
const fetchItems = async (userId, itemId = null) => {
  // const query = `
  //   SELECT 
  //     i.*, 
  //     q.is_lost, 
  //     q.is_found, 
  //     q.is_recovered, 
  //     q.lost_date,
  //     q.recovery_date,
  //     q.found_date, 
  //     q.expiry_date 
  //   FROM items i
  //   LEFT JOIN qr_code q ON i.qr_code_id = q.qr_code 
  //   WHERE i.user_id = ? ${itemId ? "AND i.id = ?" : ""}
  // `;

  const query = `
  SELECT 
    i.*, 
    q.is_lost, 
    q.is_found, 
    q.is_recovered, 
    q.lost_date,
    q.recovery_date,
    q.found_date, 
    q.expiry_date,
    c.name AS category_name
  FROM items i
  LEFT JOIN qr_code q ON i.qr_code_id = q.qr_code 
  LEFT JOIN item_category c ON i.category_id = c.id
  WHERE i.user_id = ? ${itemId ? "AND i.id = ?" : ""}
  ORDER BY i.id DESC
`;


  const params = itemId ? [userId, itemId] : [userId];

  try {
    const [result] = await db.query(query, params);

    console.log("result", result);                                                                                      
    return result;
  } catch (error) {
    console.log("error fetching items", error);
    throw new Error("Error fetching items");
  }
};

const handler = async (req, res) => {

  console.log("getItems api called");
  if (req.method === "GET") {
    const user = authenticate(req, res);

    if (!user) {
      return; // Authentication failed, response already sent in authenticate
    }

    const { id: userId } = user;
    const { item_id: itemId } = req.query;

    try {
      const items = await fetchItems(userId, itemId || null);
      return res.status(200).json(items);
    } catch (error) {
      console.log("error fetching item", error);
       res.status(500).json({ message: error.message });
       throw error
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
};

export default withMonitorLogger(handler)
