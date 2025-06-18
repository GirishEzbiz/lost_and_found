import crypto from "crypto";
import { db } from "../../../lib/db";
import { withMonitorLogger } from "utils/withMonitorLogger";

async function getBatchDetails(batch_id) {
  const query = `
    SELECT 
      cb.id,
      cb.start_sr_no,
      cb.end_sr_no,
      cb.total_codes,
      cb.expiry_date,
      cb.template_id,
      cm.brand_id,
      bm.brand_code,
      bm.service_to,
      sm.name AS sku_name,
      sm.id AS sku_id
    FROM code_batch cb
    JOIN code_mining cm ON cb.template_id = cm.id
    JOIN brand_master bm ON cm.brand_id = bm.id
    JOIN sku_master sm ON cm.sku_id = sm.id
    WHERE cb.id = ?`;

  const [rows] = await db.query(query, [batch_id]);
  return rows.length > 0 ? rows[0] : null;
}
async function generateQRCodesFromBatch({
  batchId,
  startSerial,
  endSerial,
  skuCode,
  brandCode,
  templateId,
  expiryDate,
  brandId, // Add brandId to the payload
  skuId, // Add skuId to the payload
  userId, // Add userId to the payload
}) {
  const start = parseInt(startSerial);
  const end = parseInt(endSerial);
  const total = end - start + 1;
  const chunkSize = 5000; // Insert 5000 at a time
  let currentIndex = 0;

  while (currentIndex < total) {
    const batch = [];

    for (
      let i = currentIndex;
      i < Math.min(currentIndex + chunkSize, total);
      i++
    ) {
      const serialNumber = (start + i).toString().padStart(11, "0");
      const brandSerialNumber = `${skuCode}${brandCode}${serialNumber}`;
      const qrCode =
        crypto
          .createHash("sha256")
          .update(brandSerialNumber)
          .digest("hex")
          .substring(0, 16) + crypto.randomBytes(2).toString("hex");

      batch.push([
        serialNumber,
        brandSerialNumber,
        qrCode,
        brandId,
        batchId,
        templateId,
        null,
        0,
        expiryDate,
      ]);
    }

    await db.query(
      `INSERT INTO qr_code 
       (serial_number, brand_serial_number, qr_code, brand_id, batch_id, template_id, custom_message, status, expiry_date) 
       VALUES ?`,
      [batch]
    );

    currentIndex += chunkSize;
    // console.log(
    //   `Inserted ${Math.min(currentIndex, total)} / ${total} QR codes`
    // );
  }

  await db.query(`UPDATE code_batch SET process_status = 1 WHERE id = ?`, [
    batchId,
  ]);

  const createdAt = new Date().toISOString().slice(0, 19).replace("T", " "); // '2025-05-13 10:48:43'

  // Insert into code_ledgers table
  const ledgerValues = [
    "Allocation",
    skuId,
    userId,
    brandId,
    startSerial,
    endSerial,
    total,
    "QR code generation for batch",
    createdAt,
  ];

  const insertLedgerQuery = `
    INSERT INTO code_ledgers 
      (action, sku_id, user_id, brand_id, range_from, range_to, total, description, created_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await db.query(insertLedgerQuery, ledgerValues);

  console.log(`Ledger entry inserted for batch ${batchId}`);
}

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { batch_id, user_id } = req.body;
  if (!batch_id) {
    return res.status(400).json({ message: "Batch ID is required" });
  }

  try {
    const details = await getBatchDetails(batch_id);
    if (!details) {
      return res.status(404).json({ message: "Batch details not found" });
    }

    const {
      id,
      start_sr_no,
      end_sr_no,
      expiry_date,
      total_codes,
      brand_code,
      service_to,
      sku_name,
      sku_id,
      brand_id,
      template_id,
    } = details;

    const skuCode = sku_name.slice(0, 3).toUpperCase() + sku_id;

    await generateQRCodesFromBatch({
      batchId: id,
      startSerial: start_sr_no,
      endSerial: end_sr_no,
      skuCode,
      brandCode: brand_code,
      templateId: template_id,
      expiryDate: expiry_date,
      skuId: sku_id,
      brandId: brand_id,
      userId: user_id,
    });

    return res.status(200).json({
      status: "success",
      message: `QR Codes Generated for Batch ID ${batch_id}`,
    });
  } catch (error) {
    console.error("QR Generation Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
export default withMonitorLogger(handler);
