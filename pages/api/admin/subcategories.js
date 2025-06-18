import { withMonitorLogger } from "utils/withMonitorLogger";
import { db, checkDbConnection } from "../../../lib/db";

// Fetch categories or a specific SubCategory
const getCategories = async (req, res) => {
  const { id, page = 1, limit = 10, search = "" } = req.query;

  try {
    if (id) {
      // Fetch a single SubCategory by id
      const [rows] = await db.query(
        "SELECT * FROM subcategory_master WHERE id = ?",
        [id]
      );
      if (rows.length > 0) {
        res.status(200).json(rows[0]); // Return the specific SubCategory
      } else {
        res.status(404).json({ message: "SubCategory not found" });
      }
    } else {
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Get total count with optional search
      const [countResult] = await db.query(
        `
        SELECT COUNT(*) AS total
        FROM subcategory_master
        WHERE name LIKE ? OR description LIKE ?
        `,
        [`%${search}%`, `%${search}%`]
      );
      const total = countResult[0].total;

      // Fetch all categories
      const [rows] = await db.query(
        `
        SELECT *
        FROM subcategory_master
        WHERE name LIKE ? OR description LIKE ?
        ORDER BY id DESC
        LIMIT ? OFFSET ?
        `,
        [`%${search}%`, `%${search}%`, parseInt(limit), offset]
      );

      res.status(200).json({
        subcategories: rows,
        total,
      }); // Send all categories as JSON response
    }
  } catch (error) {
    console.log("error fetching subcategories", error);
    res.status(500).json({ message: "Database error" });
    throw error
  }
};

// Create SubCategory
const createCategory = async (req, res) => {
  const { name, description } = req.body;
  // console.log(name, description );

  if (!name ) {
    return res
      .status(400)
      .json({ message: "Name is required" });
  }

  try {
    // Check if the SubCategory name already exists
    const [existingCategory] = await db.query(
      "SELECT * FROM subcategory_master WHERE name = ?",
      [name]
    );

    if (existingCategory.length > 0) {
      return res
        .status(400)
        .json({ message: "Subcategory name already exists" });
    }

    // Insert the new SubCategory
    const [result] = await db.query(
      "INSERT INTO subcategory_master (name, description) VALUES (?, ?)",
      [name, description]
    );

    // Return the newly created SubCategory
    res.status(201).json({ id: result.insertId, name, description });
  } catch (error) {
    console.log("error createing subcategories", error);
    res.status(500).json({ message: "Database error" });
    throw error
  }
};

// Update SubCategory by ID
const updateCategory = async (req, res) => {
  const { id } = req.query;
  const { name, description } = req.body;

  if (!name || !description) {
    return res
      .status(400)
      .json({ message: "Name and description are required" });
  }

  try {
    // Check if the SubCategory name already exists (but not for the current SubCategory)
    const [existingCategory] = await db.query(
      "SELECT * FROM subcategory_master WHERE name = ? AND id != ?",
      [name, id]
    );

    if (existingCategory.length > 0) {
      return res
        .status(400)
        .json({ message: "SubCategory name already exists" });
    }

    // Update the SubCategory if it exists
    const [result] = await db.query(
      "UPDATE subcategory_master SET name = ?, description = ? WHERE id = ?",
      [name, description, id]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "SubCategory updated successfully" });
    } else {
      res.status(404).json({ message: "SubCategory not found" });
    }
  } catch (error) {
    console.log("error updateing sub categories", error);
    res.status(500).json({ message: "Database error" });
    throw error
  }
};

// Delete SubCategory by ID
const deleteCategory = async (req, res) => {
  const { id } = req.query;
  try {
    const [result] = await db.query(
      "DELETE FROM subcategory_master WHERE id = ?",
      [id]
    );
    if (result.affectedRows > 0) {
      res.status(200).json({ message: "SubCategory deleted successfully" });
    } else {
      res.status(404).json({ message: "SubCategory not found" });
    }
  } catch (error) {
    console.log("error deleteing subcategories", error);
    res.status(500).json({ message: "Database error" });
    throw error
  }
};

// API handler
 async function handler(req, res) {
  const isDbConnected = await checkDbConnection();

  if (!isDbConnected) {
    return res.status(500).json({ message: "Database connection failed" });
  } else {
    console.log("db connection okay");
  }

  const { id } = req.query;

  if (req.method === "GET") {
    return getCategories(req, res);
  }

  if (req.method === "POST") {
    return createCategory(req, res);
  }

  if (req.method === "PUT" && id) {
    return updateCategory(req, res);
  }

  if (req.method === "DELETE" && id) {
    return deleteCategory(req, res);
  }

  res.status(405).json({ message: "Method Not Allowed" });
}
export default withMonitorLogger(handler)