import { withMonitorLogger } from "utils/withMonitorLogger";

const { checkDbConnection, db } = require("lib/db");

async function getData(req, res) {

    try {

        let query = `
        SELECT tf.name as finder_name,tf.mobile AS finder_contact,tf.city AS finder_city,tf.message AS finder_message,i.item_name AS item_name,tf.image AS finder_image,u.full_name AS owner_name,qs.owner_email_status AS owner_notified,qs.owner_email_time AS notified_at,tf.indate AS message_send_on
        FROM tbl_finder tf
        LEFT JOIN items i ON tf.item_id = i.id
        LEFT JOIN users u ON i.user_id = u.id
        LEFT JOIN qr_scans qs ON tf.unique_user_id=qs.unique_user_id
         ORDER BY tf.indate DESC
      `;
      
        let [rows] = await db.query(query)

        return res.status(200).json({ success: true, data: rows });
    } catch (error) {
        return res.status(404).json({ success: false, error: error.message });
    }






}

async function handler(req, res) {

    try {
        let isDbConnected = await checkDbConnection()

        if (!isDbConnected) {
            return res.json({ message: "Db connection failed" })
        }

        if (req.method === "GET") {
            return getData(req, res)
        }

    } catch (error) {
        return res.status(404).json({ success: false, error: error.message });
    }
}

export default withMonitorLogger(handler)