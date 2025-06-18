import { withMonitorLogger } from "utils/withMonitorLogger";
import { db } from "../../../lib/db";
async function getSKUs(req, res) {
  try {
    const { id, page = 1, limit = 10, search = "" } = req.query;

    // If id is provided, return single SKU
    if (id) {
      const [rows] = await db.query(`SELECT * FROM sku_master WHERE id = ?`, [
        id,
      ]);
      return res.status(200).json(rows);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const searchTerm = `%${search}%`;

    // Get total count for pagination
    const [countRows] = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM sku_master
      WHERE name LIKE ?
      `,
      [searchTerm]
    );
    const total = countRows[0].total;

    // Fetch paginated + filtered results
    const [rows] = await db.query(
      `
      SELECT * FROM sku_master
      WHERE name LIKE ?
      ORDER BY id DESC
      LIMIT ? OFFSET ?
      `,
      [searchTerm, parseInt(limit), offset]
    );

    res.status(200).json({ skus: rows, total });
  } catch (error) {
    console.log("error fetching SKUs", error);
    res.status(500).json({ message: "Error fetching SKUs" });
    throw error
  }
}

async function getSKUsByBrand(req, res) {
  try {
    const { brandId } = req.query;
    // Check if brandId is provided
    if (!brandId) {
      return res.status(400).json({ message: "Brand ID is required" });
    }

    // Query to fetch sku_ids associated with the brand_id from code_mining
    const query = `
    SELECT * FROM sku_master 
    WHERE id IN (SELECT sku_id FROM code_mining WHERE brand_id = ?)
  `;

    // Execute the query with the provided brandId
    const [skus] = await db.query(query, [brandId]);

    // Check if SKUs were found
    if (skus.length === 0) {
      return res.status(404).json({ message: "No SKUs found for this brand" });
    }

    // Return the SKUs for the specified brand
    res.status(200).json(skus);
  } catch (error) {
    console.log("error fetching skus for brand", error);
    res
      .status(500)
      .json({ message: "Error fetching SKUs for the specified brand" });
      throw error;
  }
}

// Function to handle POST request (Create SKU)
async function createSKU(req, res) {
  const { category_id, subcategory_id, name } = req.body;


  // Validate required fields
  if (!category_id || !subcategory_id || !name) {
    return res.status(400).json({
      code: "ERR_MISSING_FIELDS",
      message:
        "Required fields are missing. Please provide category_id, subcategory_id, and name.",
    });
  }

  try {
    // Insert the SKU into the database
    const [result] = await db.query(
      `INSERT INTO sku_master (category_id, subcategory_id, name) VALUES (?, ?, ?)`,
      [category_id, subcategory_id, name]
    );

    res.status(201).json({
      code: "SUCCESS_SKU_CREATED",
      message: "SKU created successfully",
      skuId: result.insertId,
    });
  } catch (error) {
    console.log("error createing sku", error);

    // Handle duplicate entry error
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        code: "ERR_DUPLICATE_ENTRY",
        message: "A SKU with the provided name already exists.",
      });
    }

    // Handle foreign key constraint error
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({
        code: "ERR_INVALID_FOREIGN_KEY",
        message: "Invalid category_id or subcategory_id provided.",
      });
    }

    // Handle generic SQL error
     res.status(500).json({
      code: "ERR_DATABASE",
      message: "An error occurred while creating the SKU.",
      details: error.message, // Provide detailed error message for debugging
    });
    throw error
  }
}

// Function to handle PUT request (Update SKU)
async function updateSKU(req, res) {
  const { id } = req.query;
  const { category_id, subcategory_id, name } = req.body;

  // Validate required fields
  if (!category_id || !subcategory_id || !name || !id) {
    return res
      .status(400)
      .json({ message: "Required fields or SKU ID missing." });
  }

  try {
    const query = `
        UPDATE sku_master 
        SET category_id = ?, subcategory_id = ?, name = ? 
        WHERE id = ?
    `;
    const [result] = await db.query(query, [
      category_id,
      subcategory_id,
      name,
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "SKU not found" });
    }

    res.status(200).json({ message: "SKU updated successfully" });
  } catch (error) {
    console.log("error updateing skus", error);
    res.status(500).json({ message: "Error updating SKU" });
    throw error
  }
}

// Function to handle DELETE request (Delete SKU)
async function deleteSKU(req, res) {
  const { id } = req.query;

  // Validate that id is provided
  if (!id) {
    return res.status(400).json({ message: "SKU ID is required" });
  }

  try {
    const [result] = await db.query(`DELETE FROM sku_master WHERE id = ?`, [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "SKU not found" });
    }

    res.status(200).json({ message: "SKU deleted successfully" });
  } catch (error) {
    console.log("error deleting skus", error);
    res.status(500).json({ message: "Error deleting SKU" });
    throw error
  }
}

// Main API handler
 async function handler(req, res) {
  switch (req.method) {
    case "GET":
      const { brandId } = req.query;
      if (brandId) {
        return getSKUsByBrand(req, res);
      } else {
        return getSKUs(req, res);
      }
    case "POST":
      return createSKU(req, res); // Create a new SKU
    case "PUT":
      return updateSKU(req, res); // Update an existing SKU
    case "DELETE":
      return deleteSKU(req, res); // Delete a SKU
    default:
      return res.status(405).json({ message: "Method Not Allowed" }); // Method not allowed
  }
}
export default withMonitorLogger(handler)