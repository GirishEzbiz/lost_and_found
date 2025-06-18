import { NextResponse } from "next/server";

export function middleware(request) {
  const { method, url } = request;
  const parsedUrl = new URL(url);
  const pathname = parsedUrl.pathname;
  const ip = request.headers.get("x-forwarded-for") || "unknown";

  // ✅ Skip token check on these public routes
  const publicRoutes = [
    "/admin/login",
    "/brand/login",
    "/brand/forgot-password",
    "/authentication/sign-in",
    "/api/admin/api-request-logs",
  ];

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // ✅ Logging for all API requests except the log API
  if (
    pathname.startsWith("/api") &&
    pathname !== "/api/admin/api-request-logs"
  ) {
    const logData = {
      method,
      url,
      ip,
      timestamp: new Date().toISOString(),
    };

    fetch(`${process.env.NEXTAUTH_URL}/api/admin/api-request-logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(logData),
    }).catch((err) => console.error("Logging Error:", err));
  }

  // ✅ Admin route auth
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("adminToken")?.value;
    if (!token)
      return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // ✅ Brand route auth
  if (pathname.startsWith("/brand")) {
    const token = request.cookies.get("adminToken")?.value;
    if (!token)
      return NextResponse.redirect(new URL("/brand/login", request.url));
  }

  // ✅ User route auth
  if (pathname.startsWith("/dashboard")) {
    console.log("dashboard00");
    const token = request.cookies.get("token")?.value;
    if (!token)
      return NextResponse.redirect(
        new URL("/authentication/sign-in", request.url)
      );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/admin/:path*",
    "/brand/:path*",
    "/user/:path*",
    "/dashboard/:path*", // ✅ Added this line
  ],
};
