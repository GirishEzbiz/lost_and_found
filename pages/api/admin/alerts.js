import { db } from "lib/db";
import { withMonitorLogger } from "utils/withMonitorLogger";
 

// Export the config object to set the bodyParser size limit for this specific route
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb", // You can set this to any size you need
    },
  },
};
 async function handler(req, res) {

  if (req.method === "POST") {
    try {
      const { brand_id, alerts } = req.body; // Get brand_id & alerts

      // Check for invalid input
      if (!brand_id || !alerts || alerts.length === 0) {
        return res.status(400).json({ error: "Invalid input data" });
      }

      // Step 1: Delete all existing records for the specified brand_id
      const deleteQuery = `
      DELETE FROM brand_messages WHERE brand_id = ?
    `;
      await db.query(deleteQuery, [brand_id]);

      // Step 2: Insert the new alerts
      const insertQuery = `
      INSERT INTO brand_messages (brand_id, message_key, message)
      VALUES (?, ?, ?)
    `;

      // Loop through each alert and insert it
      for (const alert of alerts) {
        const { message_key, message } = alert;

        // Ensure we are correctly passing the message_key and message
        if (message_key && message) {
          // Insert the new alert for the specified brand_id
          await db.query(insertQuery, [brand_id, message_key, message]);
        } else {
          console.log("Missing message_key or message, skipping alert:", alert);
        }
      }

      // Send success response after insertion
      return res
        .status(200)
        .json({ success: true, message: "Alerts updated successfully!" });
    } catch (error) {
      console.log("error saveing alerts", error);
       res.status(500).json({ error: "Internal Server Error" });
       throw error;
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
      const allKeys = `SELECT message_key FROM brand_messages GROUP BY message_key`;

      const [allKeysData] = await db.query(allKeys);

      return res
        .status(200)
        .json({ success: true, messages: alerts, allKeysData }); // ✅ Wrap messages in `messages`
    } catch (error) {
      console.log("error fetching alerts", error);
       res.status(500).json({ error: "Internal Server Error" });
       throw error;
  }
  
  } else {
    // Handles all other HTTP methods
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}


export default withMonitorLogger(handler)