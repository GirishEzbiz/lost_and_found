import crypto from "crypto";
import { db } from "../../../lib/db";
import { withMonitorLogger } from "utils/withMonitorLogger";

const calculateExpiryDate = () => {
  const expiry = new Date();
  expiry.setFullYear(expiry.getFullYear() + 2);
  return expiry.toISOString().slice(0, 19).replace("T", " ");
};
// Function to generate the next serial number
async function getStartingSerialNumber() {
  const [rows] = await db.query(
    "SELECT MAX(serial_number) AS max_serial FROM qr_code"
  );
  return rows[0].max_serial ? parseInt(rows[0].max_serial, 10) + 1 : 1; // Start ddddfrom 1 if no records exist
}

async function generateQRCodesInBatch(
  templateId,
  batchSize,
  totalCodes,
  startingSerial,
  skuCode,
  brandCode,
  service_to
) {
  const batch = [];
  for (let i = 0; i < batchSize; i++) {
    // Ensure serial number is padded to 11 digits
    const serialNumber = (startingSerial + i).toString().padStart(11, "0");

    // Generate brand serial number
    const brandSerialNumber = `${skuCode}${brandCode}${serialNumber}`;

    // Generate QR code
    const qrCode =
      crypto
        .createHash("sha256")
        .update(brandSerialNumber)
        .digest("hex")
        .substring(0, 16) + crypto.randomBytes(2).toString("hex");
    const expiry_date = service_to;
    batch.push([
      serialNumber,
      brandSerialNumber,
      qrCode,
      templateId,
      null,
      0,
      expiry_date,
    ]);
  }

  // Perform a bulk insert
  await db.query(
    "INSERT INTO qr_code (serial_number, brand_serial_number, qr_code, template_id, custom_message, status,expiry_date) VALUES ?",
    [batch]
  );

  // console.log(`Batch of ${batchSize} QR codes inserted.`);
}
// Function to generate all QR codes
async function generateAllQRCodes(
  templateId,
  totalCodes,
  skuCode,
  brandCode,
  service_to
) {
  const startingSerial = await getStartingSerialNumber();
  const batchSize = 10000; // Define batch size, e.g., 10,000 codes
  const batches = Math.ceil(totalCodes / batchSize); // Calculate number of batches

  for (let batch = 0; batch < batches; batch++) {
    const batchStart = startingSerial + batch * batchSize;
    const currentBatchSize = Math.min(
      batchSize,
      totalCodes - batch * batchSize
    );

    await generateQRCodesInBatch(
      templateId,
      currentBatchSize,
      totalCodes,
      batchStart,
      skuCode,
      brandCode,
      service_to
    );
  }
}

// Fetch SKU details
async function getTemplateData(temp_id) {
  const query = `
        SELECT 
            code_mining.id AS mining_id,
            brand_master.brand_code,
            brand_master.service_to,
            sku_master.name,
            sku_master.id AS sku_id,
            code_mining.total_codes
        FROM code_mining 
        INNER JOIN brand_master ON code_mining.brand_id = brand_master.id 
        INNER JOIN sku_master ON code_mining.sku_id = sku_master.id 
        WHERE code_mining.id = ?`;

  const [rows] = await db.query(query, [temp_id]);

  if (rows.length > 0) {
    const tempDetails = rows[0];
    return {
      brandCode: tempDetails.brand_code,
      service_to: tempDetails.service_to,
      skuName: tempDetails.name,
      totalCodes: tempDetails.total_codes,
      skuId: tempDetails.sku_id,
    };
  } else {
    throw new Error("SKU not found");
  }
}

// API route handler
 async function handler(req, res) {
  if (req.method === "POST") {
    const { temp_id } = req.body;

    if (!temp_id) {
      return res.status(400).json({ message: "Template ID is required" });
    }

    try {
      const templateDetails = await getTemplateData(temp_id);

      if (!templateDetails) {
        return res.status(404).json({ message: "Template details not found" });
      }

      const { brandCode, skuName, totalCodes, skuId, service_to } =
        templateDetails;
      const skuCode = skuName.slice(0, 3).toUpperCase() + skuId;

      await generateAllQRCodes(
        temp_id,
        totalCodes,
        skuCode,
        brandCode,
        service_to
      );

      return res.status(200).json({
        status: "success",
        message: "QR codes generated successfully.",
      });
    } catch (error) {
      console.log("internal server error", error);
       res.status(500).json({ message: "Internal Server Error" });
       throw error
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
export default withMonitorLogger(handler)