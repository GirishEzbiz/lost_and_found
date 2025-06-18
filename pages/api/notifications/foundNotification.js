import { db } from "../../../lib/db";
import { authenticate } from "../../../lib/auth";
import { withMonitorLogger } from "utils/withMonitorLogger";

const handler = async (req, res) => {
  if (req.method === "GET") {
    try {
      const userData = authenticate(req); // Make sure to get user ID from auth logic
      // console.log("userId",userData.id);

      // Query to fetch notifications for the authenticated user
      const query = `SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC;`;
      const [result] = await db.query(query, [userData.id]);

      return res.status(200).json(result); // Return notifications for the user
    } catch (error) {
      console.log("error fetching notificatiom", error);

       res.status(500).json({ message: "Error fetching notifications" });
       throw error
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
};

export default withMonitorLogger(handler)
