import { db } from "../../lib/db";
import { authenticate } from "../../lib/auth";
import { withMonitorLogger } from "utils/withMonitorLogger";

/**
 * Fetch QR Code statistics for a user
 * @param {number} userId - ID of the authenticated user
 * @returns {Promise<Object>} - Object containing QR counts
 */
const fetchQRStats = async (usrId) => {
  const query = `
 SELECT 
    COUNT(DISTINCT i.qr_code_id) AS total_qr_assigned,
    COUNT(CASE WHEN qh.status_type = 'lost' THEN 1 END) AS total_lost_count,
    COUNT(CASE WHEN qh.status_type = 'found' THEN 1 END) AS total_found_count,
    ROUND(
        (COUNT(CASE WHEN qh.status_type = 'found' THEN 1 END) * 100.0) / 
        NULLIF(COUNT(CASE WHEN qh.status_type = 'lost' THEN 1 END), 0), 
        2
    ) AS recovery_rate
FROM items i
LEFT JOIN qr_code qc ON qc.qr_code = i.qr_code_id
LEFT JOIN qr_code_history qh ON qh.qr_code_id = qc.qr_code
WHERE i.user_id = ?;
  `;

  try {
    const [result] = await db.query(query, [usrId]);
    return result[0]; // Single row expected
  } catch (error) {
    console.log("error fetching qr statastic", error);
    throw new Error("Error fetching QR statistics");
  }
};

const handler = async (req, res) => {
  if (req.method === "GET") {
    const user = authenticate(req, res);

    if (!user) {
      return; // Authentication failed, response already sent in authenticate
    }
    console.log(user)
    const { id: userId } = user;

    try {
      const qrStats = await fetchQRStats(userId);
      return res.status(200).json(qrStats);
    } catch (error) {
      console.log("error proccessing req ", error);
      res.status(500).json({ message: error.message });
      throw error
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
};

export default withMonitorLogger(handler)
