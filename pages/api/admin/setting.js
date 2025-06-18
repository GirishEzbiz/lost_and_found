import { db } from "lib/db";
import { withMonitorLogger } from "utils/withMonitorLogger";

async function handler(req, res) {
  const { method } = req;

  try {
    if (method === "GET") {
      // Single row ko fetch karna
      const [settings] = await db.query("SELECT * FROM tbl_settings LIMIT 1");

      if (!settings.length) {
        return res.status(404).json({ message: "Settings not found" });
      }

      return res.status(200).json(settings[0]);
    } else if (method === "PUT") {
      const { records_per_page, fidner_consent } = req.body;

      if (
        typeof records_per_page === "undefined" ||
        typeof fidner_consent === "undefined"
      ) {
        return res.status(400).json({ message: "All fields are required." });
      }

      // Ek hi row hai, seedha update kar do bina WHERE condition
      await db.query(
        "UPDATE tbl_settings SET records_per_page = ?, fidner_consent = ?",
        [records_per_page, fidner_consent]
      );

      return res.status(200).json({ message: "Settings updated successfully" });
    } else {
      return res.status(405).json({ message: "Method Not Allowed" });
    }
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: error.message });
    throw error
  }
}
export default withMonitorLogger(handler)