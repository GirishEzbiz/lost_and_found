// pages/api/logger.js

import { checkDbConnection, db } from "lib/db";


async function GetMonitorLogs(req, res) {
    try {
        let today = new Date().toISOString().slice(0, 10); // Get today's date
        let query = `SELECT * FROM tbl_monitor WHERE DATE(timestamp) = ?`; // Filter logs by today's date
        let [rows] = await db.query(query, [today]);

        return res.json({ status: 201, data: rows });
    } catch (error) {
        return res.json({ status: 404, error: error.message });
    }
}


async function AddMonitorLogs(req, res) {

    console.log("body", req.body)
    const { method, url, status, type, duration, error, timestamp } = req.body;
    const date = new Date(timestamp);
    const pad = (n) => n.toString().padStart(2, '0');

    const mysqlFormattedDate = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

    console.log("timeStamp", timestamp)
    console.log("date", date)
    console.log("mysql", mysqlFormattedDate)
    try {
        await db.query(
            'INSERT INTO tbl_monitor (method, url, status, type, duration, error, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [method, url, status, type, duration, error, mysqlFormattedDate]
        );

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('DB Insert Failed:', err);
        res.status(500).json({ error: 'Logging failed' });
    }

}


export default async function handler(req, res) {

    let isDbConnected = await checkDbConnection()
    if (!isDbConnected) {
        return res.status(500).json({ message: "Database connection failed" });
    }
    if (req.method == "GET") {
        return GetMonitorLogs(req, res)
    }
    else if (req.method == "POST") {
        return AddMonitorLogs(req, res)
    } else {
        res.setHeader("Allow", ["GET", "POST"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}


