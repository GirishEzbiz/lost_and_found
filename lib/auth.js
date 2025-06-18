import jwt from "jsonwebtoken";


export function authenticate(req, res, ty = 0) {
  const token = req.cookies?.token; // Check if cookies and token exist

  if (!token) {
    // Return a 401 Unauthorized response if no token is provided
    if (ty != 1) {
      res.status(401).json({ error: "Unauthorized" });
    }
    return null; // Return null to indicate failure
  }

  try {
    // Verify the token with the secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded; // Return the decoded user information
  } catch (error) {
    console.log( "Token validation failed",error);
    

    if (ty != 1) {
        res.status(401).json({ error: "Invalid or expired token" });
    }
    
    return null; // Return null to indicate failure
}
}
