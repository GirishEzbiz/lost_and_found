import { checkDbConnection, db } from "lib/db";
import bcrypt from "bcryptjs";
import { withMonitorLogger } from "utils/withMonitorLogger";

const createAdmin = async (req, res) => {

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

  const {
    name,
    email,
    password,
    mobile,
    status = 1,
    created_by = null,
    brandId, // frontend se camelCase mein aa raha hai
    permission,
  } = body;

  if (!name || !email || !password || !mobile || !brandId || !permission) {
    return res.status(400).json({
      message:
        "Required fields (name, email, password, mobile, brandId , permission) are missing",
    });
  }

  try {
    // Check for duplicate email
    const [existingAdmin] = await db.query(
      "SELECT * FROM admins WHERE email = ?",
      [email]
    );

    if (existingAdmin.length > 0) {
      return res
        .status(400)
        .json({ message: "An admin with this email already exists" });
    }
    if (!Array.isArray(permission)) {
      return res.status(400).json({ message: "Permission must be an array" });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into DB
    const [result] = await db.query(
      "INSERT INTO admins (name, email, password, mobile, status, created_by, brand_id,permission) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        name,
        email,
        hashedPassword,
        mobile,
        Number(status),
        created_by,
        brandId, // mapped to brand_id in DB
        JSON.stringify(permission), // Convert permission to JSON string
      ]
    );


    res.status(201).json({
      id: result.insertId,
      message: "Admin created successfully",
    });
  } catch (error) {
    console.log("Error creating admin", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        message: "Duplicate entry: Email already exists",
      });
    }

    res.status(500).json({
      message: "An unexpected error occurred",
      error: error.message,
    });
    throw error
  }
};


const getAdminsByBrandId = async (req, res) => {
  const { brandId, page = 1, limit = 10 } = req.query;

  if (!brandId) {
    return res.status(400).json({ message: "brandId is required" });
  }

  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    // Count total admins
    const [countResult] = await db.query(
      "SELECT COUNT(*) as count FROM admins WHERE brand_id = ?",
      [brandId]
    );
    const totalCount = countResult[0].count;

    // Paginated fetch
    const [admins] = await db.query(
      "SELECT id, name, email, mobile, status,permission, created_by, brand_id FROM admins WHERE brand_id = ? ORDER BY id DESC LIMIT ? OFFSET ?",
      [brandId, parseInt(limit), offset]
    );

    res.status(200).json({ data: admins, totalCount });
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({
      message: "Failed to fetch admins",
      error: error.message,
    });
    throw error
  }
};

// const updateAdmin = async (req, res) => {
//   const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
//   const { id, name, email, mobile,password, status, brandId,permission } = body;

//   if (!id || !name || !email || !mobile || !brandId || !permission || !password) {
//     return res.status(400).json({
//       message: "Missing required fields (id, name, email, mobile, brandId, permission, password)",
//     });
//   }

//   try {
//     // Check if user exists
//     const [existing] = await db.query("SELECT * FROM admins WHERE id = ?", [
//       id,
//     ]);
//     if (existing.length === 0) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Update user
//    const getdata= await db.query(
//       "UPDATE admins SET name = ?, email = ?, mobile = ?, status = ?,password = ?, brand_id = ? ,permission = ? WHERE id = ?",
//       [name, email, mobile, status ,password, brandId , JSON.stringify(permission) , id]
//     );
//  console.log("dataaaaaaaaa",getdata)
//     res.status(200).json({ message: "Admin updated successfully" });
//   } catch (error) {
//     console.log("Error updating admin", error);
//     res
//       .status(500)
//       .json({ message: "Failed to update admin", error: error.message });
//       throw error
//   }
// };

// ----------- EXPORT HANDLER -------------

const updateAdmin = async (req, res) => {
  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const { id, name, email, mobile, password, status, brandId, permission } = body;

  if (!id || !name || !email || !mobile || !brandId || !permission) {
    return res.status(400).json({
      message: "Missing required fields (id, name, email, mobile, brandId, permission)",
    });
  }

  try {
    // Check if user exists
    const [existing] = await db.query("SELECT * FROM admins WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash password only if provided
    let updateQuery;
    let values;

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery = `
        UPDATE admins 
        SET name = ?, email = ?, mobile = ?, status = ?, password = ?, brand_id = ?, permission = ?
        WHERE id = ?
      `;
      values = [name, email, mobile, status, hashedPassword, brandId, JSON.stringify(permission), id];
    } else {
      updateQuery = `
        UPDATE admins 
        SET name = ?, email = ?, mobile = ?, status = ?, brand_id = ?, permission = ?
        WHERE id = ?
      `;
      values = [name, email, mobile, status, brandId, JSON.stringify(permission), id];
    }

    await db.query(updateQuery, values);

    res.status(200).json({ message: "Admin updated successfully" });
  } catch (error) {
    console.error("Error updating admin", error);
    res.status(500).json({
      message: "Failed to update admin",
      error: error.message,
    });
  }
};


async function handler(req, res) {
  const isDbConnected = await checkDbConnection();

  if (!isDbConnected) {
    return res.status(500).json({ message: "Database connection failed" });
  }

  switch (req.method) {
    case "POST":
      return createAdmin(req, res);
    case "GET":
      return getAdminsByBrandId(req, res); // 👈 GET for brand users
    case "PUT":
      return updateAdmin(req, res);

    default:
      return res.status(405).json({ message: "Method not allowed" });
  }
}

export default withMonitorLogger(handler)
