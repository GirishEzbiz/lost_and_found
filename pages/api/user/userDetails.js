const cookie = require("cookie");
import jwt from "jsonwebtoken";
import { uploadToS3 } from "lib/s3";
import formidable from "formidable";
import { db } from "lib/db";
import { withMonitorLogger } from "utils/withMonitorLogger";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Utility function to check database connection
async function checkDbConnection() {
  try {
    await db.query("SELECT 1"); // Perform a simple query to check the connection
    return true;
  } catch (error) {
    console.log("database error", error);

    return false;
  }
}

// Get User Details API
async function getUserDetails(req, res) {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Token not provided" });
    }

    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Fetch user details from the database
    const query = "SELECT * FROM users WHERE id = ? ";
    //   const query = `
    //   SELECT users.*, brand_master.brand_id
    //   FROM users
    //   LEFT JOIN brand_master ON users.email = brand_master.email
    //   WHERE users.id = ?;
    // `;

    const [rows] = await db.query(query, [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];
    return res.status(200).json({ user });
  } catch (error) {
    console.log("error fetching userdetails", error);

    const isTokenError =
      error.name === "JsonWebTokenError" || error.name === "TokenExpiredError";
     res.status(isTokenError ? 401 : 500).json({
      message: isTokenError
        ? "Invalid or expired token"
        : "Internal server error",
    });
    throw error
  }
}

async function updateUser(req, res) {
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error during file parsing:", err);
      return res.status(500).json({ error: "Failed to parse form data." });
    }
    try {
      const { token } = req.cookies;

      if (!token) {
        return res
          .status(401)
          .json({ message: "Unauthorized: Token not provided" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;
      console.log("userId", userId);
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const {
        full_name,
        email,
        email_1,
        email_2,
        email_3,
        mobile,
        mobile_1,
        mobile_2,
        mobile_3,
        password,
        otp,
        privacy,
        otp_expires_at,
        is_verified,
        language,
        allow_unreported_scan
      } = fields;
      const image = files.image;

      // Email uniqueness check
      const emailFields = [email, email_1, email_2, email_3].filter(Boolean);
      if (emailFields.length > 0) {
        const placeholders = emailFields.map(() => "?").join(", ");
        const [emailCheck] = await db.query(
          `SELECT id FROM users WHERE (email IN (${placeholders}) OR email_1 IN (${placeholders}) OR email_2 IN (${placeholders}) OR email_3 IN (${placeholders})) AND id != ?`,
          [
            ...emailFields,
            ...emailFields,
            ...emailFields,
            ...emailFields,
            userId,
          ]
        );
        // if (emailCheck.length > 0) {
        //   return res
        //     .status(400)
        //     .json({ message: "Email already In Use", field: "email" });
        // }
      }

      // Mobile uniqueness check
      const mobileFields = [mobile, mobile_1, mobile_2, mobile_3].filter(
        Boolean
      );
      if (mobileFields.length > 0) {
        const placeholders = mobileFields.map(() => "?").join(", ");
        const [mobileCheck] = await db.query(
          `SELECT id FROM users WHERE (mobile IN (${placeholders}) OR mobile_1 IN (${placeholders}) OR mobile_2 IN (${placeholders}) OR mobile_3 IN (${placeholders})) AND id != ?`,
          [
            ...mobileFields,
            ...mobileFields,
            ...mobileFields,
            ...mobileFields,
            userId,
          ]
        );
        // if (mobileCheck.length > 0) {
        //   return res.status(400).json({
        //     message: "Mobile number already In Use",
        //     field: "mobile", // For mobile field error
        //   });
        // }
      }

      const fieldsData = [];
      const values = [];
      if (full_name !== undefined) {
        fieldsData.push("full_name = ?");
        values.push(fields.full_name);
      }
      if (email !== undefined) {
        fieldsData.push("email = ?");
        values.push(email);
      }
      if (email_1 !== undefined) {
        fieldsData.push("email_1 = ?");
        values.push(email_1);
      }
      if (email_2 !== undefined) {
        fieldsData.push("email_2 = ?");
        values.push(email_2);
      }
      if (email_3 !== undefined) {
        fieldsData.push("email_3 = ?");
        values.push(email_3);
      }
      if (mobile !== undefined) {
        fieldsData.push("mobile = ?");
        values.push(mobile);
      }
      if (mobile_1 !== undefined) {
        fieldsData.push("mobile_1 = ?");
        values.push(mobile_1);
      }
      if (mobile_2 !== undefined) {
        fieldsData.push("mobile_2 = ?");
        values.push(mobile_2);
      }
      if (mobile_3 !== undefined) {
        fieldsData.push("mobile_3 = ?");
        values.push(mobile_3);
      }
      if (password !== undefined) {
        fieldsData.push("password = ?");
        values.push(password);
      }
      if (otp !== undefined) {
        fieldsData.push("otp = ?");
        values.push(otp);
      }
      if (privacy !== undefined) {
        fieldsData.push("privacy = ?");
        values.push(privacy);
      }
      if (otp_expires_at !== undefined) {
        fieldsData.push("otp_expires_at = ?");
        values.push(otp_expires_at);
      }
      if (is_verified !== undefined) {
        fieldsData.push("is_verified = ?");
        values.push(is_verified);
      }if (language !== undefined) {
        fieldsData.push("language = ?");
        values.push(language);
      }if (allow_unreported_scan !== undefined) {
        fieldsData.push("allow_unreported_scan = ?");
        values.push(allow_unreported_scan);
      }

      if (image !== undefined) {
        const imageURL = await uploadToS3(image);
        if (imageURL !== undefined) {
          fieldsData.push("image = ?");
          values.push(imageURL);
        }
      }

      if (fieldsData.length === 0) {
        return res
          .status(400)
          .json({ message: "No fieldsData provided for update" });
      }

      values.push(userId);
      const query = `UPDATE users SET ${fieldsData.join(", ")} WHERE id = ?`;
      const [result] = await db.query(query, values);

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ message: "User not found or no changes made" });
      }

      return res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
      console.log("error upadateing users details", error);

       res
        .status(500)
        .json({ message: "Failed to update user", error: error.message });
        throw error
    }
  });
}
 async function handler(req, res) {
  const isDbConnected = await checkDbConnection();

  if (!isDbConnected) {
    return res.status(500).json({ message: "Database connection failed" });
  }

  const { token } = req.cookies;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Token not provided" });
  }

  // Verify the JWT token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const userId = decoded.id;

  if (req.method === "GET" && userId) {
    return getUserDetails(req, res);
  }

  if (req.method === "PATCH" && userId) {
    return updateUser(req, res);
  }

  return res.status(405).json({ message: "Method Not Allowed" });
}
export default withMonitorLogger(handler)