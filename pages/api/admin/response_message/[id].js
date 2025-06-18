import { withMonitorLogger } from "utils/withMonitorLogger";
const { checkDbConnection, db } = require("lib/db");


// async function getResponseMessages(req, res) {
//     try {
//       // Main message template query
//       const messageQuery = `
//         SELECT 
//           sm.name AS sku,
//           msgtmp.message
//         FROM message_templates msgtmp
//         LEFT JOIN sku_master sm ON msgtmp.sku_id = sm.id
//         WHERE msgtmp.is_default = 1
//       `;

//       const [rows] = await db.query(messageQuery);

//       // Parse message JSON
//       const tbody = rows.map((row) => {
//         let messageJson = {};
//         try {
//           messageJson = JSON.parse(row.message);
//         } catch (err) {
//           console.warn("Invalid JSON in message field", err);
//         }

//         return {
//           sku: row.sku,
//           successMessage: messageJson.successMessage || '',
//           invalidMessage: messageJson.invalidMessage || '',
//           inactiveDisabledMessage: messageJson.inactiveDisabledMessage || '',
//           expiredMessage: messageJson.expiredMessage || '',
//           fakeCodeMessage: messageJson.fakeCodeMessage || '',
//           blackListedMessage: messageJson.blackListedMessage || ''
//         };
//       });

//       // Get all SKUs for dropdown/filter
//       const [skuList] = await db.query(`
//         SELECT id, name FROM sku_master ORDER BY name ASC
//       `);

//       // Final response
//       const response = {
//         thead: [
//           "SKU Name",
//           "Success Message",
//           "Invalid Message",
//           "Not Active-Disabled Message",
//           "Expired Code Message",
//           "Fake Code Message",
//           "BlackListed Message"
//         ],
//         tbody,
//         skuList
//       };

//       return res.status(200).json(response);
//     } catch (error) {
//       console.error("Error fetching response messages:", error);
//       return res.status(500).json({ message: "Failed to fetch response messages", error: error.message });
//     }
//   }
async function getResponseMessages(req, res) {
    try {
        console.log("Helloo", req.query)

        const {id} = req?.query;

        if (id) {
            const messageQuery = `
                SELECT 
                    msgtmp.id,
                    msgtmp.sku_id,
                    msgtmp.brand_id,
                    bm.name AS brand_name,
                    sm.name AS sku_name,
                    msgtmp.message,
                    msgtmp.is_default
                FROM message_templates msgtmp
                LEFT JOIN sku_master sm ON msgtmp.sku_id = sm.id
                LEFT JOIN brand_master bm ON msgtmp.brand_id = bm.id
                WHERE msgtmp.id = ?
            `;

            const [rows] = await db.query(messageQuery, [id]);

            if (rows.length === 0) {
                return res.status(404).json({ success: false, message: "Message template not found" });
            }
          
        
            // Prepare response data
            const data = rows.map((row) => ({
                id: row.id,
                sku_id: row.sku_id,
                message: row.message,
                default: row.is_default,
                sku_name: row.sku_name,
                brand_id: row.brand_id,
                brand_name: row.brand_name
            }));

            return res.status(200).json({
                success: true,

                data
            });
        } else {
            const messageQuery = `
SELECT 
  msgtmp.id,
  msgtmp.sku_id,
  msgtmp.brand_id,
  bm.name AS brand_name,
  sm.name AS sku_name,
  msgtmp.message,
  msgtmp.is_default
FROM message_templates msgtmp
LEFT JOIN sku_master sm ON msgtmp.sku_id = sm.id
LEFT JOIN brand_master bm ON msgtmp.brand_id = bm.id
`;


            const [rows] = await db.query(messageQuery);

            // Prepare response data in desired format
            const data = rows.map((row) => ({
                id: row.id,
                sku_id: row.sku_id,
                message: row.message,
                default: row.default,
                sku_name: row.sku_name,
                brand_id: row.brand_id,
                brand_name: row.brand_name
            }));

            // // You can enhance pagination based on actual requirements
            // const pagination = {
            //     total: data.length,
            //     per_page: 10,
            //     current_page: 1,
            //     last_page: 1,
            //     next_page_url: null,
            //     prev_page_url: null
            // };

            // Get all SKUs for dropdown/filter
            const [skuList] = await db.query(`
        SELECT id, name FROM sku_master ORDER BY name ASC
      `);

            const [brandList] = await db.query(`
        SELECT id, name FROM brand_master ORDER BY name ASC
      `);

            return res.status(200).json({
                success: true,
                data,

                skuList,
                brandList
            });
        }

    } catch (error) {
        console.error("Error fetching response messages:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch response messages", error: error.message });
    }
}


async function createMessageTemplate(req, res) {
    try {
        const { sku, brand, success, invalid, notActive, expired, fake, blacklisted } = req.body;

        console.log("req", req.body)

        // Validate required fields
        if (!sku?.value || !brand?.value) {
            return res.status(400).json({ success: false, message: "sku and brand are required" });
        }

        const message = {
            success,
            invalid,
            notActive,
            expired,
            fake,
            blacklisted
        };

        // Optional: Validate message is valid JSON
        try {
            JSON.stringify(message); // Just ensuring it's serializable
        } catch (err) {
            return res.status(400).json({ success: false, message: "Invalid message structure" });
        }

        const insertQuery = `
            INSERT INTO message_templates (sku_id, brand_id, message)
            VALUES (?, ?, ?)
        `;

        const [result] = await db.query(insertQuery, [
            sku.value,
            brand.value,
            JSON.stringify(message)
        ]);

        return res.status(201).json({
            success: true,
            message: "Message template created successfully",
            data: {
                id: result.insertId,
                sku_id: sku.value,
                brand_id: brand.value,
                message
            }
        });
    } catch (error) {
        console.error("Error creating message template:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create message template",
            error: error.message
        });
    }
}


async function updateMessageTemplate(req, res) {
    try {
        const { id } = req.query;
        const { sku, brand, success, invalid, notActive, expired, fake, blacklisted } = req.body;

        console.log("req", req.body);

        // Validate required fields
        if (!sku?.value || !brand?.value) {
            return res.status(400).json({ success: false, message: "sku and brand are required" });
        }

        const message = {
            success,
            invalid,
            notActive,
            expired,
            fake,
            blacklisted
        };

        // Optional: Validate message is valid JSON
        try {
            JSON.stringify(message); // Just ensuring it's serializable
        } catch (err) {
            return res.status(400).json({ success: false, message: "Invalid message structure" });
        }

        // Check if the message template with the given ID exists
        const selectQuery = `SELECT * FROM message_templates WHERE id = ?`;
        const [existingTemplate] = await db.query(selectQuery, [id]);

        if (existingTemplate.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Message template not found"
            });
        }

        // Update the message template
        const updateQuery = `
            UPDATE message_templates 
            SET sku_id = ?, brand_id = ?, message = ?
            WHERE id = ?
        `;
        const [updateResult] = await db.query(updateQuery, [
            sku.value,
            brand.value,
            JSON.stringify(message),
            id
        ]);

        return res.status(200).json({
            success: true,
            message: "Message template updated successfully",
            data: {
                id,
                sku_id: sku.value,
                brand_id: brand.value,
                message
            }
        });
    } catch (error) {
        console.error("Error updating message template:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update message template",
            error: error.message
        });
    }
}



async function handler(req, res) {
    
    const isDbConnected = await checkDbConnection();
    if (!isDbConnected) {
        return res.status(500).json({ message: "Database connection failed" });
    }

    if (req.method === "GET") {
        const { id } = req.query;
        console.log('idxd9',id)
        return getResponseMessages(req, res);
    }
    else if (req.method === "POST") {
        return createMessageTemplate(req, res);
    }
    else if (req.method === "PATCH") {
        return updateMessageTemplate(req, res);
    }
    return res.status(405).json({ message: "Method Not Allowed" });
}

export default withMonitorLogger(handler);
