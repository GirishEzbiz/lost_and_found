import { withMonitorLogger } from "utils/withMonitorLogger";

const { checkDbConnection, db } = require("lib/db");


async function updatescanData(req, res) {

    try {
        let { unique_user_id, name, mobile, role } = req.body

        // Update query
    const [result] = await db.execute(
        `UPDATE qr_scans 
         SET scanner_name = ?,  mobile = ?, user_role = ?
         WHERE unique_user_id = ?`,
        [name, mobile, role, unique_user_id]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "No record found for this unique_user_id" });
      }

      return res.status(200).json({ message: "Scan data updated successfully" });
    } catch (error) {
        console.error("Update error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }

}





async function handler(req, res) {
    try {
        let isdbConnected = await checkDbConnection()

        if (!isdbConnected) {
            return res.json({ message: "Db connection failed" })
        }

        if (req.method === "PATCH") {
            return updatescanData(req, res)
        }

    } catch (error) {

    }
}

export default withMonitorLogger(handler)