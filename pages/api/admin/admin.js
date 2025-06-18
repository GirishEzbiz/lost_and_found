import { db, checkDbConnection } from "../../../lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { withMonitorLogger } from "utils/withMonitorLogger";

const JWT_SECRET = process.env.JWT_SECRET;

// const getAdmins = async (req, res) => {
//   const { id, brand_id } = req.query;

//   console.log("brand_id", brand_id);

//   try {
//     // Agar id diya gaya ho
//     if (id) {
//       const [rows] = await db.query(
//         `SELECT
//           a.*,
//           c.name AS created_by_name,
//           roles.name as role_name
//         FROM admins a
//         LEFT JOIN admins c ON a.created_by = c.id
//         LEFT JOIN roles ON roles.id = a.role_id
//         WHERE a.id = ?`,
//         [id]
//       );

//       if (rows.length > 0) {
//         res.status(200).json(rows[0]);
//       } else {
//         res.status(404).json({ message: "Admin not found" });
//       }
//     } else {
//       // Agar brand_id diya gaya ho
//       let query = `
//         SELECT
//           a.*,
//           c.name AS created_by_name,
//           roles.name as role_name
//         FROM admins a
//         LEFT JOIN admins c ON a.created_by = c.id
//         LEFT JOIN roles ON roles.id = a.role_id
//       `;

//       const params = [];

//       // Agar brand_id null ho toh usi brand_id ke admins fetch karo
//       if (brand_id == "null") {
//         query += ` WHERE a.brand_id IS NULL`; // Use IS NULL for null checks
//       } else {
//         query += ` WHERE a.brand_id = ?`; // Brand ID pass kiya gaya hai
//         params.push(brand_id);
//       }

//       // Execute the query
//       const [rows] = await db.query(query, params);
//       res.status(200).json(rows);
//     }
//   } catch (error) {
//     console.log("error fetching admin", error);
//     return res.status(500).json({ message: "Database error" });
// }

// };

const getAdmins = async (req, res) => {
  let { id, brand_id, page, limit, search = "" } = req.query;

  // Fallbacks and conversion
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const offset = (page - 1) * limit;

  try {
    // Fetch single user by ID
    if (id) {
      const [rows] = await db.query(
        `SELECT 
          a.*, 
          c.name AS created_by_name,
          roles.name as role_name
        FROM admins a
        LEFT JOIN admins c ON a.created_by = c.id        
        LEFT JOIN roles ON roles.id = a.role_id
        WHERE a.id = ?`,
        [id]
      );

      if (rows.length > 0) {
        return res.status(200).json(rows[0]);
      } else {
        return res.status(404).json({ message: "Admin not found" });
      }
    }

    // Start base query
    let baseQuery = `
      FROM admins a
      LEFT JOIN admins c ON a.created_by = c.id        
      LEFT JOIN roles ON roles.id = a.role_id
    `;

    const whereClauses = [];
    const params = [];

    if (brand_id === "null") {
      whereClauses.push("a.brand_id IS NULL");
    } else if (brand_id !== undefined) {
      whereClauses.push("a.brand_id = ?");
      params.push(brand_id);
    }

    if (search) {
      whereClauses.push(`
        (
          a.name LIKE ? OR 
          a.email LIKE ? OR 
          roles.name LIKE ?
        )
      `);
      const keyword = `%${search}%`;
      params.push(keyword, keyword, keyword);
    }

    if (whereClauses.length > 0) {
      baseQuery += " WHERE " + whereClauses.join(" AND ");
    }

    // Get total count
    const [countRows] = await db.query(
      `SELECT COUNT(*) as total ${baseQuery}`,
      params
    );
    const total = countRows[0]?.total || 0;

    // Get paginated results
    const [rows] = await db.query(
      `SELECT 
        a.*, 
        c.name AS created_by_name,
        roles.name as role_name
      ${baseQuery}
      ORDER BY a.id DESC
      LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return res.status(200).json({
      users: rows,
      total,
      currentPage: page,
      perPage: limit,
    });
  } catch (error) {
    console.error("error fetching admin", error);
    res.status(500).json({ message: "Database error" });
    throw error;
  }
};

const createAdmin = async (req, res) => {
  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

  const { name, email, password, mobile, role_id } = body;
  const status = body.status ?? 1;
  const created_by = body.created_by ?? null;
  const brand_id = body.brand_id ?? null;

  // Check for missing fields
  if (!name || !email || !password || !mobile || !role_id) {
    return res.status(400).json({
      message:
        "All required fields (name, email, password, mobile, role) must be provided",
    });
  }

  try {
    // Check if an admin with the same email already exists
    const [existingAdmin] = await db.query(
      "SELECT * FROM admins WHERE email = ?",
      [email]
    );

    if (existingAdmin.length > 0) {
      return res
        .status(400)
        .json({ message: "An admin with this email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new admin into the database
    const [result] = await db.query(
      "INSERT INTO admins (name, email, password, mobile, role_id, status, created_by, brand_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        name,
        email,
        hashedPassword,
        mobile,
        role_id,
        status,
        created_by,
        brand_id,
      ]
    );

    // Fetch role name
    const [existingRole] = await db.query("SELECT * FROM roles WHERE id = ?", [
      role_id,
    ]);
    const roleName = existingRole.length > 0 ? existingRole[0].name : null;

    res.status(201).json({
      id: result.insertId,
      roleName: roleName,
      message: "Admin created successfully",
    });
  } catch (error) {
    console.log("error  createing admin", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        message: "Duplicate entry error: Email or other field already exists",
      });
    }

    if (error.code === "ER_BAD_NULL_ERROR") {
      return res
        .status(400)
        .json({ message: "Required field is missing or null" });
    }

    res.status(500).json({
      message: "An unexpected error occurred. Please try again later.",
      error: error.message,
    });
    throw error;
  }
};

// Update an admin
const updateAdmin = async (req, res) => {
  const { id } = req.query;
  const { name, email, password, mobile, role_id, status } = req.body;


  if (
    !id ||
    (!name && !email && !password && !mobile && !role_id && status == null)
  ) {
    return res.status(400).json({ message: "Invalid input" });
  }

  try {
    // Check if the admin exists
    const [existingAdmin] = await db.query(
      "SELECT * FROM admins WHERE id = ?",
      [id]
    );
    if (existingAdmin.length === 0) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Hash the password if provided
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;


    // Update the admin
    const [result] = await db.query(
      "UPDATE admins SET name = ?, email = ?, password = ?, mobile = ?, role_id = ?, status = ? WHERE id = ?",
      [
        name || existingAdmin[0].name,
        email || existingAdmin[0].email,
        hashedPassword || existingAdmin[0].password,
        mobile || existingAdmin[0].mobile,
        role_id || existingAdmin[0].role_id,
        status != null ? status : existingAdmin[0].status,
        id,
      ]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Admin updated successfully" });
    } else {
      res.status(500).json({ message: "Failed to update admin" });
    }
  } catch (error) {

    console.log("error unexpected error occurred ", error);
    res.status(500).json({ message: "An unexpected error occurred" });
    throw error;
  }
};

// Delete an admin
const deleteAdmin = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: "Admin ID is required" });
  }

  try {
    const [result] = await db.query("DELETE FROM admins WHERE id = ?", [id]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Admin deleted successfully" });
    } else {
      res.status(404).json({ message: "Admin not found" });
    }
  } catch (error) {
    console.log("database connection faild", error);
    res.status(500).json({ message: "Database error" });
    throw error;
  }
};

// Admin login
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const [admins] = await db.query("SELECT * FROM admins WHERE email = ?", [
      email,
    ]);

    if (admins.length === 0) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const admin = admins[0];

    const isPasswordMatch = await bcrypt.compare(password, admin.password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: admin.id, role: admin.role }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ token, message: "Login successful" });
  } catch (error) {
    console.log("unexpected error occured", error);
    res.status(500).json({ message: "An unexpected error occurred" });
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
    return getAdmins(req, res);
  }

  // if (req.method === "POST") {
  //   if (req.query.action === "login") {
  //     return loginAdmin(req, res);
  //   }
  //   return createAdmin(req, res);
  // }
  if (req.method === "POST") {
    if (req.query.action === "login") {
      return loginAdmin(req, res);
    }
    return createAdmin(req, res);
  }

  if (req.method === "PUT") {
    return updateAdmin(req, res);
  }

  if (req.method === "DELETE") {
    return deleteAdmin(req, res);
  }

  res.status(405).json({ message: "Method Not Allowed" });
}

export default withMonitorLogger(handler)