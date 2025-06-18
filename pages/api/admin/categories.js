import { withMonitorLogger } from "utils/withMonitorLogger";
import { db, checkDbConnection } from "../../../lib/db";

// Fetch categories or a specific category
const getCategories = async (req, res) => {
  const { id, page = 1, limit = 10, search = "" } = req.query;
  const offset = (page - 1) * limit;

  try {
    if (id) {
      // Fetch single category by ID
      const [rows] = await db.query(
        "SELECT * FROM category_master WHERE id = ?",
        [id]
      );
      if (rows.length > 0) {
        res.status(200).json(rows[0]);
      } else {
        res.status(404).json({ message: "Category not found" });
      }
    } else {
      // Building query with optional search
      let query = "SELECT * FROM category_master";
      let countQuery = "SELECT COUNT(*) as total FROM category_master";
      const params = [];
      const countParams = [];

      if (search) {
        query += " WHERE name LIKE ?";
        countQuery += " WHERE name LIKE ?";
        params.push(`%${search}%`);
        countParams.push(`%${search}%`);
      }

      query += " ORDER BY id DESC LIMIT ? OFFSET ?";
      params.push(parseInt(limit), parseInt(offset));

      // Correctly use the filtered query here:
      const [rows] = await db.query(query, params);
      const [countResult] = await db.query(countQuery, countParams);
      const total = countResult[0]?.total || 0;

      res.status(200).json({
        data: rows,
        total,
        current_page: parseInt(page),
        per_page: parseInt(limit),
      });
    }
  } catch (error) {
    console.log("Database error", error);
    res.status(500).json({ message: "Database error" });
    throw error
  }
};


// Create category
const createCategory = async (req, res) => {
  const { name, description } = req.body;

  try {
    // Validate required fields
    if (!name) {
      return res.status(400).json({
        code: "ERR_MISSING_FIELDS",
        message: "Required fields are missing. Please provide category name.",
      });
    }
    const [existingCategory] = await db.query(
      "SELECT id FROM category_master WHERE name = ?",
      [name]
    );

    if (existingCategory.length > 0) {
      return res.status(400).json({ message: "Category name already exists" });
    }

    const [result] = await db.query(
      "INSERT INTO category_master (name, description) VALUES (?, ?)",
      [name, description]
    );

    res.status(201).json({ id: result.insertId, name, description }); // Return the new category with ID
  } catch (error) {
    console.log("data base error ", error);
    res.status(500).json({ message: "Database error" });
    throw error
  }
};

// Update category by ID
const updateCategory = async (req, res) => {
  const { id } = req.query;
  const { name, description } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Category ID is required" });
  }

  if (!name || !description) {
    return res
      .status(400)
      .json({ message: "Name and description are required" });
  }

  try {
    // Check if the category exists by ID
    const [existingCategory] = await db.query(
      "SELECT * FROM category_master WHERE id = ?",
      [id]
    );

    if (existingCategory.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if the new name is already used by another category
    const [duplicateCategory] = await db.query(
      "SELECT * FROM category_master WHERE name = ? AND id != ?",
      [name, id]
    );

    if (duplicateCategory.length > 0) {
      return res.status(400).json({ message: "Category name already exists" });
    }

    // Proceed to update the category
    const [result] = await db.query(
      "UPDATE category_master SET name = ?, description = ? WHERE id = ?",
      [name, description, id]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Category updated successfully" });
    } else {
      res.status(500).json({ message: "Failed to update the category" });
    }
  } catch (error) {
    console.log("database error", error);
    res.status(500).json({ message: "An unexpected error occurred" });
    throw error
  }
};

// Delete category by ID
const deleteCategory = async (req, res) => {
  const { id } = req.query;
  try {
    const [result] = await db.query(
      "DELETE FROM category_master WHERE id = ?",
      [id]
    );
    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Category deleted successfully" });
    } else {
      res.status(404).json({ message: "Category not found" });
    }
  } catch (error) {
    console.log("database error", error);
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