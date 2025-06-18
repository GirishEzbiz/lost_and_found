import { db } from "lib/db";
import { withMonitorLogger } from "utils/withMonitorLogger";

const UAParser = require("ua-parser-js");

 async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { qr_code, unique_user_id, ipAddress, location = {}, itemCategoryId,scanDuration } = req.body;

  const userAgent = req.headers["user-agent"] || "Unknown";
  const parser = new UAParser();
  parser.setUA(userAgent);

  const browserDetails = parser.getBrowser();
  const osDetails = parser.getOS();
  const deviceType = parser.getDevice().type || "Desktop";

  const browserInfo = `${browserDetails.name || "Unknown"} ${browserDetails.version || ""
    }`;
  const osInfo = `${osDetails.name || "Unknown"} ${osDetails.version || ""}`;
  const deviceInfo = deviceType.charAt(0).toUpperCase() + deviceType.slice(1);
  const scanTimestamp = new Date();
  const mobile = deviceInfo === "Mobile" ? "Yes" : "No";

  try {
    let serialNumber = "";
    let scanStatus = "";
    let finalQr = qr_code;
    let message = "";

    // Ensure `existingQR` is always an array
    const [existingQR] = (await db.query(
      "SELECT qr_code, serial_number FROM qr_code WHERE qr_code = ? LIMIT 1",
      [qr_code]
    )) || [[]];

    if (existingQR.length > 0) {
      serialNumber = existingQR[0].serial_number;
      finalQr = existingQR[0].qr_code;

      // Ensure `scanCountResult` is handled safely
      const [scanCountResult] = (await db.query(
        "SELECT COUNT(*) AS scan_count, MAX(scan_timestamp) AS last_scan FROM qr_scans WHERE qr_code = ?",
        [finalQr]
      )) || [[]];
      const [itemsCategories] = await db.query("SELECT * FROM item_category where id = ?", [itemCategoryId]);

      let scanLimit = itemsCategories[0]?.scan_limit ;

      const scanCount = scanCountResult?.[0]?.scan_count || 0;
      const lastScanTimestamp = scanCountResult?.[0]?.last_scan || null;

      if (scanCount === 0) {
        scanStatus = "OK";
        message = "✅ OK";
      } else if (scanCount < scanLimit) {
        scanStatus = "OK";
        message = `🔄 Repeated Authentication! ✅✅ Last Scan: ${new Date(
          lastScanTimestamp
        ).toLocaleString()}`;
      } else {
        scanStatus = "NOT OK";
        message = "🚫 QR scan limit exceeded! ❌";
      }
    } else {
      scanStatus = "NOT FOUND";
      message = "Unkown Code";
    }

    // Insert into `qr_scans` table safely
    await db.query(
      `INSERT INTO qr_scans 
        (qr_code, qr_code_serial, unique_user_id, ip_address, browser_details, device, scan_timestamp, status, mobile, city, state, country, latitude, longitude, asn, isp, locationSource,execution_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        finalQr,
        serialNumber,
        unique_user_id,
        ipAddress || "",
        browserInfo,
        deviceInfo,
        scanTimestamp,
        scanStatus,
        mobile,
        location.city || "",
        location.state || "",
        location.country || "",
        location.latitude || 0,
        location.longitude || 0,
        location.asn || "",
        location.isp || "",
        location.locationSource || "Unknown",
        scanDuration || 0
      ]
    );

    return res.status(200).json({
      success: true,
      // message: message,
      // status: scanStatus,
    });
  } catch (error) {
    console.log("error saveing scan data", error);

     res.status(500).json({ error: "Internal Server Error" });
     throw error
  }

}
export default withMonitorLogger(handler)