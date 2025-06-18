// import { checkDbConnection, db } from "lib/db";

// export default async function handler(req, res) {
//   const isDbConnected = await checkDbConnection();
//   if (!isDbConnected) {
//     return res.status(500).json({ message: "Database connection failed" });
//   }

//   const { id, page = 1, limit, search = "" } = req.query;

//   if (req.method === "GET") {
//     try {
//       if (id) {
//         const [rows] = await db.query("SELECT * FROM tbl_finder WHERE id = ?", [
//           id,
//         ]);
//         if (rows.length > 0) {
//           return res.status(200).json(rows[0]);
//         } else {
//           return res.status(404).json({ message: "Finder not found" });
//         }
//       }

//       const searchTerm = `%${search}%`;

//       if (!limit || isNaN(limit)) {
//         const [rows] = await db.query(
//           `
//           SELECT *
//           FROM tbl_finder
//           WHERE name LIKE ? OR email LIKE ? OR mobile LIKE ? OR item_id LIKE ?
//           ORDER BY id DESC
//           `,
//           [searchTerm, searchTerm, searchTerm, searchTerm]
//         );
//         return res.status(200).json({ finders: rows, total: rows.length });
//       }

//       const offset = (parseInt(page) - 1) * parseInt(limit);

//       const [countResult] = await db.query(
//         `
//         SELECT COUNT(*) AS total
//         FROM tbl_finder
//         WHERE name LIKE ? OR email LIKE ? OR mobile LIKE ? OR item_id LIKE ?  GROUP BY mobile
//         `,
//         [searchTerm, searchTerm, searchTerm, searchTerm]
//       );
//       const total = countResult[0].total;

//       const [rows] = await db.query(
//         `
//         SELECT *
//         FROM tbl_finder
//         WHERE name LIKE ? OR email LIKE ? OR mobile LIKE ? OR item_id LIKE ?
//          GROUP BY mobile
//         ORDER BY id DESC       
//         LIMIT ? OFFSET ?
//         `,
//         [
//           searchTerm,
//           searchTerm,
//           searchTerm,
//           searchTerm,
//           parseInt(limit),
//           offset,
//         ]
//       );

//       return res.status(200).json({ finders: rows, total });
//     } catch (error) {
//       console.error("GET /finder error:", error);
//       return res.status(500).json({ message: "Database error" });
//     }
//   }

//   res.status(405).json({ message: "Method Not Allowed" });
// }

import { checkDbConnection, db } from "lib/db";
import { withMonitorLogger } from "utils/withMonitorLogger";

 async function handler(req, res) {
  // Check DB connection
  const isDbConnected = await checkDbConnection();
  if (!isDbConnected) {
    return res.status(500).json({ message: "Database connection failed" });
  }

  const { id, page = 1, limit = 10, search = "" } = req.query;

  if (req.method === "GET") {
    try {
      // Fetch a single finder if 'id' is provided
      if (id) {
        const [rows] = await db.query("SELECT * FROM tbl_finder WHERE id = ?", [
          id,
        ]);
        if (rows.length > 0) {
          return res.status(200).json(rows[0]);
        } else {
          return res.status(404).json({ message: "Finder not found" });
        }
      }

      const searchTerm = `%${search}%`; // Prepare search term for LIKE queries

      // If limit is not specified, return all matching records (not paginated)
      if (!limit || isNaN(limit)) {
        const [rows] = await db.query(
          `
          SELECT *
          FROM tbl_finder
          WHERE name LIKE ? OR email LIKE ? OR mobile LIKE ? OR item_id LIKE ?
          ORDER BY id DESC
          `,
          [searchTerm, searchTerm, searchTerm, searchTerm]
        );
        return res.status(200).json({ finders: rows, total: rows.length });
      }

      // Calculate offset for pagination
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Get the total count of records matching the search query
      const [countResult] = await db.query(
        `
        SELECT COUNT(*) AS total
        FROM tbl_finder
        WHERE name LIKE ? OR email LIKE ? OR mobile LIKE ? OR item_id LIKE ?
        `,
        [searchTerm, searchTerm, searchTerm, searchTerm]
      );
      const total = countResult[0].total;

      // Fetch paginated records
      const [rows] = await db.query(
        `
        SELECT *
        FROM tbl_finder
        WHERE name LIKE ? OR email LIKE ? OR mobile LIKE ? OR item_id LIKE ?
        ORDER BY id DESC       
        LIMIT ? OFFSET ?
        `,
        [
          searchTerm,
          searchTerm,
          searchTerm,
          searchTerm,
          parseInt(limit),
          offset,
        ]
      );

      return res.status(200).json({ finders: rows, total });
    } catch (error) {
      console.error("GET /finder error:", error);
       res.status(500).json({ message: "Database error", error: error.message });
       throw error
    }
  }

  // If method is not GET, return Method Not Allowed
  res.status(405).json({ message: "Method Not Allowed" });
}


export default withMonitorLogger(handler)