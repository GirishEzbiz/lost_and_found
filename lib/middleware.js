import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";


export function middleware(req) {
  const token = req.cookies.get("token")?.value; // Get token from cookies

  if (!token) {
    // Redirect to login if no token is found
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    // Verify the token
    const user = jwt.verify(token, process.env.JWT_SECRET); // Replace with your secret
    req.user = user; // Attach user details to the request (optional)
    return NextResponse.next(); // Proceed to the requested route
  } catch (error) {
    console.log("Token verification failed",error);
    

    return NextResponse.redirect(new URL("/login", req.url));
}
}

// Apply middleware to specific routes
export const config = {
  matcher: ["/api/protected/:path*", "/dashboard/:path*"], // Add your protected routes here
};
