import { db } from "lib/db";
import { withMonitorLogger } from "utils/withMonitorLogger";



async function getLogsEntry(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Fetch paginated logs
    const [logs] = await db.query(
      `SELECT * FROM email_whatsapp_delivery ORDER BY id DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    // Total count for pagination
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM email_whatsapp_delivery`
    );

    const total = countResult[0].total;

    return res.status(200).json({
      logs,
      total,
    });

  } catch (error) {
    console.error("Error fetching logs:", error);
    return res.status(500).json({ message: "Failed to fetch logs" });
  }
}




async function createLogEntry(req, res) {



    try {
        const { action, channel, type, message, status, duration } = req.body;


        // ✅ Store this in DB
        console.log("Log saved:", { action, channel, type, message, status, duration });

        let [rows] = await db.query(
            `INSERT INTO email_whatsapp_delivery (action, channel, type, message, status, duration) VALUES (?, ?, ?, ?, ?, ?)`,
            [action, channel, type, message, status, duration]
        );


        // Replace with DB insert logic

        return res.status(200).json({ message: "Logged successfully" });

    } catch (error) {
        console.error("Error logging message:", error);
        return res.status(500).json({ message: "Failed to log" });
    }
}



// pages/api/admin/emailWhatsappLogs.js
async function handler(req, res) {
    
    if (req.method === "POST") {
        return createLogEntry(req, res);
    }
    if (req.method === "GET") {
        return getLogsEntry(req, res);
    }


}



export default withMonitorLogger(handler)