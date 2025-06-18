import { db, checkDbConnection } from "../../../lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { withMonitorLogger } from "utils/withMonitorLogger";

const JWT_SECRET = process.env.JWT_SECRET;

const getRoles = async (req, res) => {
  const { id } = req.query;

  try {
    if (id) {
      // Fetch specific admin with created_by name
      const [rows] = await db.query(
        `SELECT 
          a.*, 
          c.name AS created_by_name 
        FROM roles a
        LEFT JOIN admins c ON a.created_by = c.id
        WHERE a.id = ?`,
        [id]
      );

      if (rows.length > 0) {
        res.status(200).json(rows[0]);
      } else {
        res.status(404).json({ message: "Admin not found" });
      }
    } else {
      // Fetch all admins with created_by names
      const [rows] = await db.query(
        `SELECT 
          a.*, 
          c.name AS created_by_name 
          FROM roles a
          LEFT JOIN admins c ON a.created_by = c.id`
      );

      res.status(200).json(rows);
    }
  } catch (error) {
    console.log("error fetching roles", error);
    res.status(500).json({ message: "Database error" });
    throw error
  }
};

const createRoles = async (req, res) => {
  const { name, created_by, permissions } = req.body; // Frontend se sirf role aa raha hai
  const indate = new Date(); // Ab ka time generate kar raha hoon


  // Check for missing fields
  if (!name || !created_by) {
    return res.status(400).json({
      message: "Name is required",
      message: "Permissions is required",
    });
  }

  try {
    // Insert into database
    const [result] = await db.query(
      "INSERT INTO roles (name, indate,created_by,permissions) VALUES (?, ?, ?, ?)",
      [name, indate, created_by, JSON.stringify(permissions)]
    );

    // Success response
    res.status(201).json({
      id: result.insertId,
      message: "Role created successfully",
    });
  } catch (error) {
    console.log("error createing roles", error);

    // Handle known errors
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        message: "Duplicate entry error: Role already exists",
      });
    }

    if (error.code === "ER_BAD_NULL_ERROR") {
      return res
        .status(400)
        .json({ message: "Required field is missing or null" });
    }

    // Unexpected errors
    res.status(500).json({
      message: "An unexpected error occurred. Please try again later.",
    });
    throw error
  }
};

// Update an admin
const updateRoles = async (req, res) => {
  const { id } = req.query;
  const { name, created_by, permissions } = req.body;
  const indate = new Date();


  if (!id || (!name && !created_by && !permissions == null)) {
    return res.status(400).json({ message: "Invalid input" });
  }

  try {
    // Check if the admin exists
    const [existingAdmin] = await db.query("SELECT * FROM roles WHERE id = ?", [
      id,
    ]);
    if (existingAdmin.length === 0) {
      return res.status(404).json({ message: "Role not found" });
    }

    // Hash the password if provided

    // Update the admin
    const [result] = await db.query(
      "UPDATE roles SET name = ?, created_by = ?, indate = ?, permissions = ? WHERE id = ?",
      [
        name || existingAdmin[0].name,
        created_by || existingAdmin[0].created_by,
        indate || existingAdmin[0].indate,
        JSON.stringify(permissions) || existingAdmin[0].permissions,
        id,
      ]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Roles updated successfully" });
    } else {
      res.status(500).json({ message: "Failed to update Roles" });
    }
  } catch (error) {
    console.log("error unxpected", error);
    res.status(500).json({ message: "An unexpected error occurred" });
    throw error
  }
};

// Delete an admin
const deleteRoles = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: "Role ID is required" });
  }

  try {
    const [result] = await db.query("DELETE FROM roles WHERE id = ?", [id]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Role deleted successfully" });
    } else {
      res.status(404).json({ message: "Role not found" });
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
  }

  if (req.method === "GET") {
    return getRoles(req, res);
  }

  if (req.method === "POST") {
    return createRoles(req, res);
  }

  if (req.method === "PUT") {
    return updateRoles(req, res);
  }

  if (req.method === "DELETE") {
    return deleteRoles(req, res);
  }

  res.status(405).json({ message: "Method Not Allowed" });
}
export default withMonitorLogger(handler)