import { checkDbConnection, db } from "lib/db";

const GetQRBrandDetails = async (req, res) => {
  try {
    const { qr } = req.query;

    if (!qr) {
      return res.status(400).json({ error: "Missing QR code parameter." });
    }

    // Step 1: Check QR code and get template_id
    const qrCheckQuery = `SELECT * FROM qr_code WHERE qr_code = ?`;
    const [qrResult] = await db.query(qrCheckQuery, [qr]);

    if (!qrResult.length) {
      return res.status(404).json({ message: "QR code not found." });
    }

    const qrCodeRow = qrResult[0];

    // Step 2: Get brand_id and sku_id from code_mining
    const miningQuery = `SELECT brand_id, sku_id FROM code_mining WHERE id = ?`;
    const [miningResult] = await db.query(miningQuery, [qrCodeRow.template_id]);

    if (!miningResult.length) {
      return res.status(404).json({ message: "Template mapping not found." });
    }

    const { brand_id, sku_id } = miningResult[0];

    // Step 3: Get brand details
    const brandQuery = `
      SELECT bm.id, bm.name AS brand_name, bm.image AS brand_image, bm.welcome_message
      FROM brand_master bm
      WHERE bm.id = ?
    `;
    const [brandData] = await db.query(brandQuery, [brand_id]);

    // ✅ Final response without `messages`
    return res.status(200).json({
      status: true,
      qr_code: qr,
      brand: brandData[0] || {},
      brand_id,
      sku_id,
      template_id: qrCodeRow.template_id,
    });
  } catch (error) {
    console.error("Error in GetQRBrandDetails:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

async function handler(req, res) {
  const isDbConnected = await checkDbConnection();
  if (!isDbConnected) {
    return res.status(500).json({ error: "Database connection failed" });
  }

  if (req.method === "GET") {
    return GetQRBrandDetails(req, res);
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}

export default handler;
