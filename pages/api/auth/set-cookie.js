import { serialize } from "cookie";
import jwt from "jsonwebtoken";
import { withMonitorLogger } from "utils/withMonitorLogger";

const JWT_SECRET = process.env.JWT_SECRET;

 async function handler(req, res) {
  try {
    if (req.method === "POST") {
      const { email } = req.body;
  
      const token = jwt.sign({ email }, JWT_SECRET, {
        expiresIn: "7d", // Token expiration time
      });
  
      res.setHeader(
        "Set-Cookie",
        serialize("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 7 * 24 * 60 * 60, // 7 days
          sameSite: "strict",
          path: "/",
        })
      );
  
      res.status(200).json({ message: "Logged in" });
    } else {
      res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    throw error
  }
 
}
export default withMonitorLogger(handler)