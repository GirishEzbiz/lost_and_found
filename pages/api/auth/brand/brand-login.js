import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "lib/db";
import { withMonitorLogger } from "utils/withMonitorLogger";

const cookie = require("cookie");

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Check if the admin exists in the database
    const [rows] = await db.query(
      "SELECT * FROM admins WHERE email = ? and brand_id IS NOT NULL",
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Admin not found" });
    }

    const user = rows[0];


    // Compare the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate a JWT token for the admin
    const token = jwt.sign(
      {
        email: user.email,
        name: user.name,
        id: user.id,
        role: user.role_id,
        brand_id: user.brand_id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "11h", // Token expiration time
      }
    );

    // Set the token as a cookie
    const serializedCookie = cookie.serialize("adminToken", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 11 * 60 * 60, // 1 hour
      sameSite: "strict",
      path: "/",
    });

    res.setHeader("Set-Cookie", serializedCookie);

    const data = {
      id: user.id,
      name: user.name,
      email: user.email,
      role_id: user.role_id,
      mobile: user.mobile,
      status: user.status,
      created_by: user.created_by,
      indate: user.indate,
      token: token,
      brand_id: user.brand_id,
    };

    return res
      .status(200)
      .json({ message: "Brand logged in successfully", data });
  } catch (error) {
    console.log("error proccessing req", error);
    res.status(500).json({ message: "Error processing request" });
    throw error
  }
}
export default withMonitorLogger(handler)