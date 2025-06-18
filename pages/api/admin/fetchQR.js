import { withMonitorLogger } from "utils/withMonitorLogger";
import { db } from "../../../lib/db";

async function handler(req, res) {
  if (req.method === "GET") {
    const { ids } = req.query;

    let querys = `SELECT 
    COUNT(*) AS total_qr_codes,
    SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) AS Allocated,
    SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) AS Printed_and_Published,
    SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) AS Brand_Activated,
    SUM(CASE WHEN status = 3 THEN 1 ELSE 0 END) AS User_Activated,
    SUM(CASE WHEN status = 4 THEN 1 ELSE 0 END) AS Lost,
    SUM(CASE WHEN status = 5 THEN 1 ELSE 0 END) AS Found,
    SUM(CASE WHEN status = 6 THEN 1 ELSE 0 END) AS Disposed
FROM qr_code
WHERE template_id IN(?) `;

    let params = [ids];

    try {
      const [result] = await db.query(querys, params);


      return res.status(200).json(result);
    } catch (error) {
      console.log("error geanrateing qr codes", error);
      res.status(500).json({ message: "Internal Server Error" });
      throw error
    }
  } else if (req.method === "PATCH") {
    const { ids, type, data } = req.body; // Expecting ids as string, type, and data

    if (!ids || typeof ids !== "string") {
      return res.status(400).json({ message: "Invalid IDs provided" });
    }

    if (!type) {
      return res.status(400).json({ message: "Type is required" });
    }

    try {
      // Convert comma-separated string into an array of numbers
      const idsArray = ids.split(",").map((id) => parseInt(id.trim(), 10));

      if (idsArray.some(isNaN)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      // Create placeholders for query
      const idPlaceholders = idsArray.map(() => "?").join(",");
      const query = `UPDATE qr_code SET ${type} = ? WHERE template_id IN (${idPlaceholders})`;

      // Params: First data value, then all IDs spread
      const params = [data, ...idsArray];

      const [result] = await db.query(query, params);


      return res.status(200).json({
        message: "Records updated successfully",
        affectedRows: result.affectedRows,
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
