import { db } from "lib/db";
import { withMonitorLogger } from "utils/withMonitorLogger";


// Export the config object to set the bodyParser size limit for this specific route
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // You can set this to any size you need
    },
  },
};

async function handler(req, res) {


  if (req.method === "POST") {
    try {
      const { brand_id, alerts } = req.body; // Get brand_id & alerts

      if (!brand_id || !alerts || alerts.length === 0) {
        return res.status(400).json({ error: "Invalid input data" });
      }

      // Loop through each alert and check if the message_key already exists
      for (const alert of alerts) {
        const { header, message } = alert;

        // Check if this alert's message_key already exists for the given brand_id
        const checkQuery = `
          SELECT id FROM brand_messages WHERE brand_id = ? AND message_key = ?
        `;
        const [existingAlert] = await db.query(checkQuery, [brand_id, header]);

        if (existingAlert.length > 0) {
          // If alert exists, update the existing message
          const updateQuery = `
            UPDATE brand_messages SET message = ? WHERE id = ?
          `;
          await db.query(updateQuery, [message, existingAlert[0].id]);
        } else {
          // If alert doesn't exist, insert a new alert
          const insertQuery = `
            INSERT INTO brand_messages (brand_id, message_key, message)
            VALUES (?, ?, ?)
          `;
          await db.query(insertQuery, [brand_id, header, message]);
        }
      }

      return res.status(200).json({ success: true, message: "Alerts saved successfully!" });

    } catch (error) {
      console.log("error saveing alerts", error);
      res.status(500).json({ error: "Internal Server Error" });
      throw error
    }

  } else if (req.method === "GET") {
    try {
      const { brand_id } = req.query;

      if (!brand_id) {
        return res.status(400).json({ error: "Brand ID is required" });
      }

      // Fetch alerts for the given brand_id
      const fetchQuery = `
        SELECT id, message_key, message FROM brand_messages WHERE brand_id = ?
      `;
      const [alerts] = await db.query(fetchQuery, [brand_id]);

      return res.status(200).json({ success: true, messages: alerts }); // ✅ Wrap messages in `messages`
    } catch (error) {
      console.log("error fetching alerts", error);
      res.status(500).json({ error: "Internal Server Error" });
      throw error
    }

  } else {
    // Handles all other HTTP methods
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
export default withMonitorLogger(handler)