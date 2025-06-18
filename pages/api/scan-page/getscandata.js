import { db } from "lib/db";
import { withMonitorLogger } from "utils/withMonitorLogger";

async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  let filters =
    req.query.filters != "undefined" ? JSON.parse(req.query.filters) : {};


  // let { qrCode, serial, ip, browser, date, status } = filters

  let query = "SELECT * FROM qr_scans WHERE 1=1";

  if (filters.qrCode) {
    query += ` AND qr_code = '${filters.qrCode}'`;
  }
  if (filters.serial) {
    query += ` AND qr_code_serial = '${filters.serial}'`;
  }
  if (filters.ip) {
    query += ` AND ip_address = '${filters.ip}'`;
  }
  if (filters.browser) {
    query += ` AND browser_details = '${filters.browser}'`;
  }
  if (filters.date) {
    query += ` AND DATE(scan_timestamp) = '${filters.date}'`;
  }
  if (filters.status) {
    query += ` AND status = '${filters.status}'`;
  }


  const currentPage = parseInt(req.query.currentpage) || 1;
  const itemperpage = parseInt(req.query.itemperpage) || 10;



  try {
    // Fetch scan details from the databeeease
    // const [rows] = await db.query("SELECT * FROM qr_scans order by id desc limit ? offset ?", [itemperpage, (currentPage - 1) * itemperpage]);
    const [rows] = await db.query(
      `${query} order by id desc limit ? offset ?`,
      [itemperpage, (currentPage - 1) * itemperpage]
    );

    let total_records = "SELECT COUNT(*) as total FROM qr_scans WHERE 1=1";

    if (filters.qrCode) {
      total_records += ` AND qr_code = '${filters.qrCode}'`;
    }
    if (filters.serial) {
      total_records += ` AND qr_code_serial = '${filters.serial}'`;
    }
    if (filters.ip) {
      total_records += ` AND ip_address = '${filters.ip}'`;
    }
    if (filters.browser) {
      total_records += ` AND browser_details = '${filters.browser}'`;
    }
    if (filters.date) {
      total_records += ` AND DATE(scan_timestamp)= '${filters.date}'`;
    }
    if (filters.status) {
      total_records += ` AND status = '${filters.status}'`;
    }

    const [countResult] = await db.query(total_records);
    const totalRecords = countResult[0].total;

    if (rows.length === 0) {
      return res.status(404).json({ error: "No data found" });
    }

    return res.status(200).json({
      result: rows,
      total: totalRecords,
    }); // Return the firtttst matched result
  } catch (error) {
    console.log("error fetching scan data", error);

    res.status(500).json({ error: "Internal Server Error" });
    throw error
  }
}
export default withMonitorLogger(handler)