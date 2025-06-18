import { db } from "lib/db";
import { withMonitorLogger } from "utils/withMonitorLogger";

 async function handler(req, res) {
  const { method } = req; // Get the HTTP method

  // Common try-catch block to handle errors
  try {
    if (method === "GET") {
      const { page = 1, limit = 10, search = "" } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // 1. Get total categories count
      const [countResult] = await db.query(
        `SELECT COUNT(*) AS total FROM item_category WHERE name LIKE ?`,
        [`%${search}%`]
      );
      const total = countResult[0].total;

      // 2. Get paginated categories
      const [categories] = await db.query(
        `SELECT * FROM item_category
         WHERE name LIKE ?
         ORDER BY id DESC
         LIMIT ? OFFSET ?`,
        [`%${search}%`, parseInt(limit), offset]
      );

      if (!categories.length) {
        return res.status(200).json({ categories: [], total });
      }

      const categoryIds = categories.map((cat) => cat.id);

      // 3. Get all messages for the fetched categories
      const [messages] = await db.query(
        `SELECT category_id, message, id AS massageId
         FROM category_msg_template
         WHERE category_id IN (${categoryIds.map(() => "?").join(",")})
         ORDER BY id DESC`,
        categoryIds
      );

      // 4. Group messages by category
      const grouped = categories.map((cat) => ({
        id: cat.id,
        category: cat.name,
        messages: messages
          .filter((msg) => msg.category_id === cat.id)
          .map((msg) => ({
            message: msg.message,
            massageId: msg.massageId,
          })),
        scan_limit: cat.scan_limit,
        scan_duration: cat.scan_duration,
      }));

      return res.status(200).json({ categories: grouped, total });
    } else if (method === "POST") {
      // Handle POST request to add new category and messages

      const { name, messages } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Category name is required" });
      }

      // Insert new category
      const [categoryResult] = await db.query(
        "INSERT INTO item_category (name) VALUES (?)",
        [name]
      );

      const categoryId = categoryResult.insertId; // Get the inserted category ID

      // Insert associated messages into the category_msg_template table
      if (messages && Array.isArray(messages)) {
        await Promise.all(
          messages.map(async (message) => {
            await db.query(
              "INSERT INTO category_msg_template (category_id, message) VALUES (?, ?)",
              [categoryId, message]
            );
          })
        );
      }

      return res.status(201).json({
        message: "Category and messages created successfully",
        categoryId: categoryId,
        name: name, // Return the name for dropdown update
      });
    } else if (method === "PUT") {
      // Handle updating category name and messages
      const { categoryId, name, messages, scan_limit, scan_duration } =
        req.body;
      if (!categoryId) {
        return res.status(400).json({ error: "Category ID is required" });
      }


      // Update the category name only if 'name' is provided
      if (name) {
        await db.query("UPDATE item_category SET name = ? WHERE id = ?", [
          name,
          categoryId,
        ]);
      }
      // ✅ Update scan_limit if provided
      if (typeof scan_limit !== "undefined") {
        await db.query("UPDATE item_category SET scan_limit = ? WHERE id = ?", [
          scan_limit,
          categoryId,
        ]);
      }
      // ✅ Update scan_limit if provided
      if (typeof scan_duration !== "undefined") {
        await db.query(
          "UPDATE item_category SET scan_duration = ? WHERE id = ?",
          [scan_duration, categoryId]
        );
      }
      if (messages && Array.isArray(messages)) {

        // Insert new messages for the selected category
        await Promise.all(
          messages.map(async (message) => {
            await db.query(
              "INSERT INTO category_msg_template (category_id, message) VALUES (?, ?)",
              [categoryId, message]
            );
          })
        );
      }

      return res
        .status(200)
        .json({ message: "Category and messages updated successfully" });
    } else if (method === "DELETE") {
      // Handle DELETE request to remove a category and its associated messages
      const { id } = req.query; // Get the category ID from query parameters

      if (!id) {
        return res.status(400).json({ error: "massage ID is required" });
      }

      // Delete messages associated with the category first
      await db.query("DELETE FROM category_msg_template WHERE id = ?", [id]);

      return res
        .status(200)
        .json({
          message: "Category and associated messages deleted successfully",
        });
    } else {
      // Method not allowed
      return res.status(405).json({ error: "Method Not Allowed" });
    }
  } catch (error) {
    console.error("Error:", error);
     res.status(500).json({ error: error.message });
     throw error
  }
}
export default withMonitorLogger(handler)