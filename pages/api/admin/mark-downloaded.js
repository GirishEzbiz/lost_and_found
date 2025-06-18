 
import { withMonitorLogger } from "utils/withMonitorLogger";
import { db } from "../../../lib/db";

 async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { brandId, skuId, batchId, qrCodes, downloadedDate } = req.body;

    // ✅ Ensure required parameters exist
    if (!qrCodes || qrCodes.length === 0) {
      return res.status(400).json({ error: "No QR codes provided." });
    }
    if (!downloadedDate) {
      return res.status(400).json({ error: "Downloaded date is missing." });
    }

    // ✅ Ensure `qrCodes` is an array before proceeding
    if (!Array.isArray(qrCodes)) {
      return res.status(400).json({ error: "Invalid QR codes format." });
    }

   

    
    await db.query(
      `UPDATE qr_code 
       SET is_downloaded = 1, download_date = ?
       WHERE qr_code IN (${qrCodes.map(() => "?").join(",")})`,
      [downloadedDate, ...qrCodes] // Using parameterized queries to prevent SQL injection
    );


    return res.status(200).json({ message: "QR codes marked as downloaded." });
  } catch (error) {
   
    console.log("internal server error", error);
     res.status(500).json({ error: "Failed to process request" });
     throw error
  }
}

export default withMonitorLogger(handler)

