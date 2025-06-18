import { checkDbConnection, db } from "lib/db";
import { withMonitorLogger } from "utils/withMonitorLogger";


async function getData(req, res) {
    try {
        const { codeType, codeInput, page = 1, limit = 20 } = req.body;  // Page aur limit default values ke saath

        // Query base
        let baseQuery = `
          SELECT 
            qc.*, 
            cm.brand_id, 
            cm.sku_id,
            bm.name AS brand_name,
            cb.batch_name AS batch_name,
            sm.name AS sku_name,
            qc.status AS qr_code_status,
            u.full_name AS user_name,
            u.mobile AS user_mobile,
            u.email AS user_email,
            i.*,
            cat.name AS category_name
          FROM qr_code qc
          LEFT JOIN code_mining cm ON qc.template_id = cm.id
          LEFT JOIN brand_master bm ON cm.brand_id = bm.id
          LEFT JOIN sku_master sm ON cm.sku_id = sm.id
          LEFT JOIN code_batch cb ON qc.batch_id = cb.id
          LEFT JOIN items i ON qc.qr_code = i.qr_code_id
          LEFT JOIN users u ON i.user_id = u.id
          LEFT JOIN item_category cat ON i.category_id = cat.id
        `;

        let whereClause = '';
        let values = [];

        // Filter based on codeType
        if (codeType === 'code') {
            whereClause = 'WHERE qc.qr_code = ?';
            values.push(codeInput);
        } else if (codeType === 'mobile') {
            whereClause = 'WHERE qc.mobile = ?';
            values.push(codeInput);
        } else if (codeType === 'serial') {
            whereClause = 'WHERE qc.serial_number = ?';
            values.push(codeInput);
        }

        const finalQuery = `${baseQuery} ${whereClause}`;
        const [rows] = await db.query(finalQuery, values);

        if (!rows || rows.length === 0) {
            res.status(404).json({ message: 'No data found' });
            return;
        }

        // Calculate total count of scans
        let totalQuery = `SELECT COUNT(*) as totalCount FROM qr_scans qrs WHERE qrs.qr_code = ?`;
        const [totalCountRow] = await db.query(totalQuery, [rows[0].qr_code]);

        const totalCount = totalCountRow[0].totalCount;
        const totalPages = Math.ceil(totalCount / limit);  // Calculate total pages

        // Calculate OFFSET for pagination
        const offset = (page - 1) * limit;

        // Query for scanData with LIMIT and OFFSET
        let query2 = `SELECT * FROM qr_scans qrs WHERE qrs.qr_code = ? LIMIT ? OFFSET ?`;
        const [scanRows] = await db.query(query2, [rows[0].qr_code, limit, offset]);

        res.status(200).json({ data: rows[0], scanData: scanRows, totalPages: totalPages, totalCount: totalCount });
    } catch (error) {
        console.error('Error in getData:', error);
        res.status(500).json({ error: 'Server error' });
        throw error
    }
}




async function handler(req, res) {
    let isdbconnected = await checkDbConnection();

    if (!isdbconnected) {
        return res.status(200).json({ message: "Database is not established" });
    }
    if (req.method === "POST") {
        const data = await getData(req, res);

    }

}
export default withMonitorLogger(handler)