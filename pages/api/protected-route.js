import jwt from "jsonwebtoken";
 

export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value; // Extract token from cookies
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    // Verify token
    const user = jwt.verify(token, process.env.JWT_SECRET);
    return new Response(JSON.stringify({ message: "Hello, " + user.email }), {
      status: 200,
    });
  } catch (error) {
    console.log("error token validation", error);
    return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
      status: 403,
    });
}

}
