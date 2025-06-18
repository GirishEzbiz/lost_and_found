import { uploadToS3 } from "lib/s3";
import { db, checkDbConnection } from "../../../lib/db";
import formidable from "formidable";
import bcrypt from "bcryptjs";

import sendMail from "lib/mailService";
import { generateEmailForBrand } from "lib/mailTemplates";
import { withMonitorLogger } from "utils/withMonitorLogger";

// Disable Next.js built-in body parsing for this API route
export const config = {
  api: {
    bodyParser: false,
  },
};
// Fetch brands or a specific brand
const getBrands = async (req, res) => {
  const { id, page = 1, limit, search = "" } = req.query;

  try {
    if (id) {
      const [rows] = await db.query("SELECT * FROM brand_master WHERE id = ?", [
        id,
      ]);
      if (rows.length > 0) {
        return res.status(200).json(rows[0]);
      } else {
        return res.status(404).json({ message: "Brand not found" });
      }
    }

    const searchTerm = `%${search}%`;

    // If limit is not provided, return all matching records (no pagination)
    if (!limit || isNaN(limit)) {
      const [rows] = await db.query(
        `
        SELECT *
        FROM brand_master
        WHERE name LIKE ? OR email LIKE ? OR mobile LIKE ?
        ORDER BY id DESC
        `,
        [searchTerm, searchTerm, searchTerm]
      );
      return res.status(200).json({ brands: rows, total: rows.length });
    }

    // Else handle paginated fetch
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [countResult] = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM brand_master
      WHERE name LIKE ? OR email LIKE ? OR mobile LIKE ?
      `,
      [searchTerm, searchTerm, searchTerm]
    );
    const total = countResult[0].total;

    const [rows] = await db.query(
      `
      SELECT *
      FROM brand_master
      WHERE name LIKE ? OR email LIKE ? OR mobile LIKE ?
      ORDER BY id DESC
      LIMIT ? OFFSET ?
      `,
      [searchTerm, searchTerm, searchTerm, parseInt(limit), offset]
    );

    return res.status(200).json({ brands: rows, total });
  } catch (error) {
    console.log("error database", error);
    res.status(500).json({ message: "Database error" });
    throw error
  }
};

// Create brand with ID-based brand code
const createBrand = async (req, res) => {
  const form = new formidable.IncomingForm({
    maxFileSize: 500 * 1024, // 500 KB
  });
  

  form.parse(req, async (err, fields, files) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "Image size should be under 500KB" });
      }
      console.error("Error during file parsing:", err);
      return res.status(500).json({ error: "Failed to parse form data." });
    }
  
  

    const {
      name,
      email,
      mobile,
      address,
      welcome_message,
      password,
      created_by,
      role_id,
      status,
      payment_option,
      service_start_date,
      service_end_date,
      subscription_payment_option,
      enable_alerts,
      price_per_code,
    } = fields;
    const image = files.image;
    if (!name || !email || !mobile) {
      return res.status(400).json({ message: "All fields are required" });
    }

    try {
      // Check if a brand with the same name or email already exists
      const [existingBrand] = await db.query(
        "SELECT * FROM brand_master WHERE name = ? OR email = ?",
        [name, email]
      );

      if (existingBrand.length > 0) {
        const duplicateField =
          existingBrand[0].name === name ? "Brand name" : "Email";
        return res
          .status(400)
          .json({ message: `${duplicateField} already exists` });
      }

      const imageURL = await uploadToS3(image); // Get S3 URL

      const [result] = await db.query(
        "INSERT INTO brand_master (name, email, mobile, address,welcome_message,image,payment_option,service_from,service_to,subscription_payment_option,alert_subscription_end,price_per_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          name,
          email,
          mobile,
          address,
          welcome_message,
          imageURL,
          payment_option,
          service_start_date,
          service_end_date,
          subscription_payment_option,
          enable_alerts,
          price_per_code,
        ]
      );

      // Get the auto-generated ID of the inserted brand
      const brandId = result.insertId;

      // Prefix for the brand code (first 3 characters of name, uppercased)
      const brandPrefix = name.slice(0, 3).toUpperCase();

      const brandCode = `${brandPrefix}${brandId}`;

      // Update the brand with the generated brand code
      await db.query("UPDATE brand_master SET brand_code = ? WHERE id = ?", [
        brandCode,
        brandId,
      ]);

      const hashedPassword = await bcrypt.hash(password, 10);

      const [resul] = await db.query(
        "INSERT INTO admins (name, email, password, mobile, role_id, status, created_by, brand_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          name,
          email,
          hashedPassword,
          mobile,
          role_id,
          status,
          created_by,
          brandId,
        ]
      );

      // Fetch role name
      const [existingRole] = await db.query(
        "SELECT * FROM roles WHERE id = ?",
        [role_id]
      );
      const roleName = existingRole.length > 0 ? existingRole[0].name : null;

      console.log("result", result);

      const emailContent = generateEmailForBrand({
        name,
        email,
        password,
        mobile,
        imageURL,
      });
      // console.log("message", message);
      // Send OTP via email (assuming a mailService is available)
      const mailResponse = await sendMail({
        to: email,
        subject: "Your Login Password ",
        text: `Your Password is ${password}.Don't share with anyone .`,
        html: emailContent.html,
        meta: {
          action: "Send Password",
          type: "Password",
        },
      });

      if (!mailResponse.success) {
        throw new Error(mailResponse.message);
      } else {
        // return res
        //   .status(200)
        //   .json({ message: "Password sent successfully", email: email });
      }

      // Return the new brand with the brand code
      res.status(201).json({
        id: brandId,
        name,
        email,
        mobile,
        address,
        welcome_message,
        brand_code: brandCode,
        message: "Brand created successfully",
        roleName: roleName,
        userId: resul.insertId,
      });
    } catch (error) {
      console.log("unexpected error ocurred", error);
      res.status(500).json({ message: "An unexpected error occurred" });
      throw error
    }
  });
};

// Update brand by ID
const updateBrand = async (req, res) => {
  const { id } = req.query;
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error during file parsing:", err);
      return res.status(500).json({ error: "Failed to parse form data." });
    }

    const {
      name,
      email,
      mobile,
      address,
      welcome_message,
      payment_option,
      service_start_date,
      service_end_date,
      subscription_payment_option,
      enable_alerts,
      price_per_code,
    } = fields;
    const image = files.image;
    if (!name || !email || !mobile) {
      return res.status(400).json({ message: "All fields are required" });
    }

    try {
      // Check if the brand exists
      const [existingBrand] = await db.query(
        "SELECT * FROM brand_master WHERE id = ?",
        [id]
      );

      if (existingBrand.length === 0) {
        return res.status(404).json({ message: "Brand not found" });
      }

      // Check if the name or email already exists for another brand
      const [duplicateBrand] = await db.query(
        "SELECT * FROM brand_master WHERE (name = ? OR email = ?) AND id != ?",
        [name, email, id]
      );

      if (duplicateBrand.length > 0) {
        const duplicateField =
          duplicateBrand[0].name === name ? "Brand name" : "Email";
        return res
          .status(400)
          .json({ message: `${duplicateField} already exists` });
      }

      const imageURL = await uploadToS3(image); // Get S3 URL

      // Update the brand
      const [result] = await db.query(
        "UPDATE brand_master SET name = ?, email = ?, mobile = ?, address = ?, welcome_message=?,image=?, payment_option = ?,service_from = ?,service_to = ?,subscription_payment_option = ?,alert_subscription_end = ?,price_per_code = ? WHERE id = ?",
        [
          name,
          email,
          mobile,
          address,
          welcome_message,
          imageURL,
          payment_option,
          service_start_date,
          service_end_date,
          subscription_payment_option,
          enable_alerts,
          price_per_code,
          id,
        ]
      );

      if (result.affectedRows > 0) {
        res.status(200).json({ message: "Brand updated successfully" });
      } else {
        res.status(500).json({ message: "Failed to update the brand" });
      }
    } catch (error) {
      console.log("unexpected error", error);
      res.status(500).json({ message: "An unexpected error occurred" });
      throw error
    }
  });
};

// Delete brand by ID
const deleteBrand = async (req, res) => {
  const { id } = req.query;
  try {
    const [result] = await db.query("DELETE FROM brand_master WHERE id = ?", [
      id,
    ]);
    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Brand deleted successfully" });
    } else {
      res.status(404).json({ message: "Brand not found" });
    }
  } catch (error) {
    console.log("database connection faild", error);
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
    return getBrands(req, res);
  }

  if (req.method === "POST") {
    return createBrand(req, res);
  }

  if (req.method === "PUT" && id) {
    return updateBrand(req, res);
  }

  if (req.method === "DELETE" && id) {
    return deleteBrand(req, res);
  }

  res.status(405).json({ message: "Method Not Allowed" });
}

export default withMonitorLogger(handler)