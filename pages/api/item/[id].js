import { authenticate } from "lib/auth";
import { db } from "../../../lib/db";
import sendMail from "lib/mailService";
import { withMonitorLogger } from "utils/withMonitorLogger";

async function handleQRCode(req, res) {
  try {
    const qr_code = req.query.id;

    // Check if QR code existsssssss
    const qrCheckQuery = `SELECT * FROM qr_code WHERE qr_code = ? `;
    const [qrResult] = await db.query(qrCheckQuery, [qr_code]);

    console.log("qrResult", qrResult);


    const temp = `SELECT brand_id, sku_id FROM code_mining WHERE id = ?`
    const [tempresult] = await db.query(temp, [qrResult[0]?.template_id])


    const msgg = `SELECT *
FROM message_templates
WHERE (brand_id = ? AND sku_id = ?) OR is_default = 1
ORDER BY 
  CASE 
    WHEN brand_id = ? AND sku_id = ? THEN 1
    WHEN is_default = 1 THEN 2
    ELSE 3
  END
LIMIT 1;`
    const msgResponse = await db.query(msgg, [qrResult[0].brand_id, tempresult[0].sku_id, qrResult[0].brand_id, tempresult[0].sku_id])
    console.log("messi", msgResponse)
    // Parse the message template from the database
    const messages = msgResponse[0]?.[0]?.message ? JSON.parse(msgResponse[0][0].message) : {};
    console.log("messi2", messages)

    if (qrResult.length === 0) {

      return res.status(404).json({ message: "QR code is not valid." });
    }



    const qrData = qrResult[0];
    const templateId = qrData.template_id;
    let resTempMessage = '';
    if (qrData.status === 0) {
      resTempMessage = messages?.notActive || "QR code not activated";
      return res.status(203).json({ message: resTempMessage, type: "status" });
    }

    // Check for expiry date
    const currentDate = new Date();
    const expiryDate = new Date(qrData.expiry_date); // assuming expiry_date is in a valid format
    if (expiryDate < currentDate) {
      resTempMessage = messages?.expired || "QR code has expired.";
      return res.status(203).json({ message: resTempMessage, type: "expiry" });
    }
    // Get the brand name using the template_id from code_mining
    const brandQuery = `
      SELECT bm.welcome_message ,bm.name AS brand_name,bm.image AS brand_image
      FROM qr_code qc
      JOIN brand_master bm ON qc.brand_id = bm.id
      WHERE qc.id = ?
    `;
    const [brandResult] = await db.query(brandQuery, [qrResult[0].id]);

    if (brandResult.length === 0) {
      return res
        .status(404)
        .json({ message: "Brand not found for this QR code." });
    }
    // console.log("brandResult[0]",brandResult[0]);

    const brandWelcomeMessage = brandResult[0].welcome_message;
    const brandName = brandResult[0].brand_name;
    const brandImage = brandResult[0].brand_image;
    // console.log("brandWelcomeMessage",brandWelcomeMessage,brandName);

    // Check if item exists for the QR code
    const itemCheckQuery = `SELECT * FROM items WHERE qr_code_id = ?`;
    const [itemResult] = await db.query(itemCheckQuery, [qr_code]);

    if (itemResult.length === 0) {
      return res.status(205).json({
        message:
          "QR code is not assigned to an item. Proceed to assign this QR code to an item.",
      });
    }

    // Get item details

    const itemDetailsQuery = `
SELECT i.id AS item_id, i.item_name, i.message, i.category_id, i.image_url, i.description, i.status, i.created_at, i.user_id,
       ic.scan_limit,ic.scan_duration,q.is_lost,q.is_found
FROM items i
LEFT JOIN item_category ic ON i.category_id = ic.id
LEFT JOIN qr_code q ON i.qr_code_id = q.qr_code
WHERE i.qr_code_id = ? AND i.category_id IS NOT NULL
`;
    const [itemDetails] = await db.query(itemDetailsQuery, [qr_code]);


    console.log("itemDetails", itemDetails[0]);

    if (itemDetails.length === 0) {
      return res
        .status(404)
        .json({ message: "Item not found for this QR code." });
    }







    const scanLimit = itemDetails[0].scan_limit || 0;
    const scanDuration = itemDetails[0]?.scan_duration || 0; // in hours
    const cutoffTime = new Date(Date.now() - scanDuration * 60 * 60 * 1000); // e.g. now - 9 hours

    const [scanCountResult] = await db.query(
      `SELECT COUNT(*) AS scan_count, MAX(scan_timestamp) AS last_scan
       FROM qr_scans 
       WHERE qr_code = ? AND scan_timestamp >= ?`,
      [qr_code, cutoffTime]
    );

    const scanCount = scanCountResult?.[0]?.scan_count || 0;
    const lastScanTimestamp = scanCountResult?.[0]?.last_scan || null;

    let scanStatus = "OK";
    let scanMessage = "✅ OK";

    if (scanLimit > 0) {
      if (scanCount === 0) {
        scanStatus = "OK";
        scanMessage = "✅ First time scan.";
      } else if (scanCount < scanLimit) {
        scanStatus = "OK";
        scanMessage = `🔄 Repeated scan. Last scan: ${new Date(
          lastScanTimestamp
        ).toLocaleString()}`;
      } else {
        scanStatus = "NOT OK";
        scanMessage = "🚫 QR scan limit exceeded.";
      }
    }

    const itemOwnerId = itemDetails[0].user_id;
    const itemName = itemDetails[0].item_name;
    // console.log("itemOwnerId",itemOwnerId,itemName);/

    // Authenticate the user
    const decodedUser = authenticate(req, res, 1);
    if (decodedUser) {
      if (decodedUser.id === itemOwnerId) {
        return res.status(203).json({
          message: "This item is associated with your account.",
          itemDetails: itemDetails[0],
        });
      }
    }

    // Get owner's email
    const ownerQuery = `SELECT * FROM users WHERE id = ?`;
    const [ownerResult] = await db.query(ownerQuery, [itemOwnerId]);

    const allData = {
      ...itemDetails[0],
      brandWelcomeMessage,
      brandName,
      brandImage,
    };

    if (itemDetails[0].is_lost === 0 && ownerResult[0].allow_unreported_scan === 1) {
      return res
        .status(203)
        .json({ message: "You can't scan this QR because it hasn't been reported as lost yet.", type: "not_lost" });
    }

    return res.status(200).json({
      message:
        "The item is assigned to someone else. The owner has been notified.",
      itemDetails: allData,
      ownerResult,
      rr: resTempMessage,
      status: scanStatus,
      message: scanMessage,
      scanCount,
      scanLimit,
    });
  } catch (error) {
    console.log("error processing qr codes", error);
    res.status(404).json({ message: "QR code is not valid." });
    // res.status(500).json({ message: "Error processing QR code." });
    throw error
  }
}

async function handler(req, res) {
  switch (req.method) {
    case "GET":
      return handleQRCode(req, res);
    default:
      return res.status(405).json({ message: "Method Not Allowed" });
  }
}
export default withMonitorLogger(handler)