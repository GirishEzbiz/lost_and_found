import { checkDbConnection, db } from "lib/db";

const AddLogs = async (req, res) => {
    try {
        const { method, url, ip, timestamp } = req.body;

    // Parse the URL to extract query parameters
    const parsedUrl = new URL(url);
    const queryParams = Object.fromEntries(parsedUrl.searchParams.entries());

    const newUrl = parsedUrl.pathname;
   

    const mysqlTimestamp = new Date(timestamp)
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');


    const query = `INSERT INTO api_logs (method, url, ip_address, requested_at, params) VALUES (?, ?, ?, ?, ?)`;
    const values = [method, newUrl, ip, mysqlTimestamp, JSON.stringify(queryParams)];
    const [result] = await db.query(query, values);
    // console.log('Insert result:', result);
    return res.status(200).json({ message: 'Log saved successfully' });  
    } catch (error) {
        throw error
    }
  
}


const getData = async (req, res) => {
    const { page = 1, limit = 10, fromDate, toDate } = req.query;

    const offset = (page - 1) * limit;

    // Base query
    let query = `SELECT * FROM api_logs`;
    let countQuery = `SELECT COUNT(*) as total FROM api_logs`;

    // Conditions array
    let conditions = [];
    let params = [];

    // Check if fromDate and toDate are provided
    if (fromDate && toDate) {
        conditions.push(`DATE(requested_at) BETWEEN ? AND ?`);
        params.push(fromDate, toDate);
    }

    // Add conditions to query if available
    if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(' AND ');
        countQuery += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY requested_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    try {
        const [rows] = await db.query(query, params);
        const [countResult] = await db.query(countQuery, params.slice(0, -2));  // Remove limit & offset for count query
        const totalCount = countResult[0].total;

        return res.status(200).json({
            logs: rows,
            total: totalCount,
        });
    } catch (error) {
        console.error('Error fetching data:', error);
         res.status(500).json({ message: 'Internal Server Error' });
         throw error;
    }
};



export default async function handler(req, res) {

    let isDbConnected = await checkDbConnection();

    if (!isDbConnected) {
        return res.status(500).json({ message: 'Database connection error' });
    }

    if (req.method === 'GET') {
        return getData(req, res);
    }

    if (req.method === 'POST') {
        const { method, url, ip, timestamp } = req.body;

        // Here you would typically save the log to a database
        // console.log('API Request Log:', { method, url, ip, timestamp });
        await AddLogs(req, res)

    } else {
        return res.status(405).json({ message: 'Method not allowed' });
    }
}

