import { withMonitorLogger } from "utils/withMonitorLogger";
import { streamDB } from "../../../lib/dbStream";
import { format } from "@fast-csv/format";

function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { batch_id , batch_name} = req.query;
 

  if (!batch_id) {
    return res.status(400).json({ message: "Batch ID is required" });
  }

  try {
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${batch_name}_${batch_id}_qr_codes.csv"`
    );
    res.setHeader("Content-Type", "text/csv");

    const csvStream = format({
      headers: ["serial_number", "qr_link", "created_at", "expiry_date"],
    });
    csvStream.pipe(res);

    const qrStream = streamDB
      .query(
        `SELECT serial_number, qr_code, created_at, expiry_date 
         FROM qr_code 
         WHERE batch_id = ?`,
        [batch_id]
      )
      .stream();

    qrStream.on("data", (row) => {
      csvStream.write({
        serial_number: row.serial_number,
        qr_link: `https://qritagya.com/qr/${row.qr_code}`,
        created_at: row.created_at,
        expiry_date: row.expiry_date,
      });
    });

    qrStream.on("end", () => {
      csvStream.end();
    });

    qrStream.on("error", (streamErr) => {
      console.error("QR Stream Error:", streamErr);
      res.status(500).end("Streaming Error");
    });
  } catch (err) {
    console.error("CSV Download Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
    throw err
  }
}

export default withMonitorLogger(handler)