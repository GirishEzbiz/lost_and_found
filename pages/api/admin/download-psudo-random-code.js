import { format } from "@fast-csv/format";
import { db } from "lib/db";


export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const {
    brand,
    sku,
    from_range,
    to_range,
    status,
    user_id,
    remarks = "Downloaded QR Code Data",
  } = req.body;

  try {
    if (!brand || !sku) {
      return res.status(400).json({ message: "Brand and SKU are required" });
    }

    // Step 1: Fetch template_ids from code_mining
    const [templates] = await db.query(
      `SELECT id FROM code_mining WHERE brand_id = ? AND sku_id = ?`,
      [brand, sku]
    );

    if (!templates.length) {
      return res.status(404).json({ message: "No templates found" });
    }

    const templateIds = templates.map((t) => t.id);
    const placeholders = templateIds.map(() => "?").join(",");
    const queryParams = [...templateIds];

    // Step 2: Optional serial number filtering
    let serialCondition = "";
    if (from_range && to_range && from_range.trim() !== "" && to_range.trim() !== "") {
      serialCondition = " AND serial_number BETWEEN ? AND ?";
      queryParams.push(from_range, to_range);
    }

    // Step 3: Fetch matching QR Codes
    const [qrRows] = await db.query(
      `SELECT serial_number, qr_code, created_at, expiry_date 
       FROM qr_code 
       WHERE template_id IN (${placeholders}) ${serialCondition}
       ORDER BY serial_number ASC`,
      queryParams
    );

    if (!qrRows.length) {
      return res.status(404).json({ message: "No QR codes found for the given criteria" });
    }

    // Step 4: Set headers for CSV
    res.setHeader("Content-Disposition", "attachment; filename=qr_codes.csv");
    res.setHeader("Content-Type", "text/csv");

    // Step 5: Stream CSV response
    const csvStream = format({ headers: true });
    csvStream.pipe(res);

    qrRows.forEach((row) => {
      csvStream.write({
        serial_number: row.serial_number,
        qr_link: `https://qritagya.com/qr/${row.qr_code}`,
        created_at: row.created_at,
        expiry_date: row.expiry_date,
      });
    });

    csvStream.end();

    // Step 6: Log to code_ledgers
    const now = new Date();
    const mysqlDate = now.toISOString().slice(0, 19).replace("T", " ");
    const total = qrRows.length;

    await db.query(
      `INSERT INTO code_ledgers 
       (action, sku_id, user_id, brand_id, range_from, range_to, total, description, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "Download",
        sku,
        user_id,
        brand,
        from_range?.trim() || null,
        to_range?.trim() || null,
        total,
        remarks,
        mysqlDate,
      ]
    );
  } catch (error) {
    console.error("Download Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
