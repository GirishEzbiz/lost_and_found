import formidable from "formidable";
import { db } from "../../lib/db";
import { authenticate } from "../../lib/auth";
import { uploadToS3 } from "lib/s3";
import { withMonitorLogger } from "utils/withMonitorLogger";

// Disable Next.js built-in body parsing for this API route
export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req, res) => {
  if (req.method === "PUT") {
    const { id } = authenticate(req, res); // Authenticate user and get ID
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Error during file parsing:", err);
        return res.status(500).json({ error: "Failed to parse form data." });
      }

      // Extract form fields
      const {
        itemId,
        itemName,
        category,
        description,
        categoryMsg,
        latitude,
        longitude,
      } = fields;

      // Validate required fields
      if (
        !itemId ||
        !itemName ||
        !category ||
        !description ||

        !id
      ) {
        return res.status(400).json({ error: "Missing required fields." });
      }

      try {
        let imageURL = null;
        const image = files.image;

        if (image) {
          // Upload new image to S3
          imageURL = await uploadToS3(image);
        }

        // Update item details in the database
        const query = `
        UPDATE items 
        SET item_name = ?, category_id = ?, message = ?, description = ?, latitude = ?, longitude = ?, image_url = COALESCE(?, image_url)
        WHERE id = ? AND user_id = ?
      `;

        const [result] = await db.query(query, [
          itemName,
          category,
          categoryMsg,
          description,
          latitude,
          longitude,
          imageURL,
          itemId,
          id,
        ]);
        if (result.affectedRows === 0) {
          return res
            .status(404)
            .json({ message: "Item not found or unauthorized." });
        }

        return res.status(200).json({ message: "Item updated successfully" });
      } catch (error) {
        console.log("error updateing item", error);
        res.status(500).json({ message: "Error updating item" });
        throw error
      }
    });
  } else if (req.method === "GET") {
    let query = `SELECT * FROM item_category`;
    const [categories] = await db.query(query);

    if (categories.length === 0) {
      return res.status(404).json({ message: "No categories found." });
    }

    return res.status(200).json({ categories });
  } else {
    // Handle unsupported methods
    return res.status(405).json({ error: "Method not allowed" });
  }
};

export default withMonitorLogger(handler)
