// utils/getLayout.js
import DefaultAdminDashboardLayout from "layouts/DefaultAdminDashboardLayout";
import DefaultFrontendLayout from "layouts/DefaultFrontendLayout";
import CustomUserLayout from "layouts/CustomUserLayout"; // Example additional layout
import AuthLayout from "layouts/AuthLayout";
import AuthUserLayout from "layouts/AuthUserLayout";
import DefaultBrandDashboardLayout from "layouts/DefaultBrandDashboardLayout";

export function getLayout(pathname) {
  if (
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/brand/login") ||
    pathname.startsWith("/brand/forgot-password")
  ) {
    return AuthLayout;
  }
  if (pathname.startsWith("/admin")) {
    return DefaultAdminDashboardLayout;
  } else if (pathname.startsWith("/brand")) {
    return DefaultBrandDashboardLayout;
  } else if (pathname.startsWith("/dashboard")) {
    return CustomUserLayout; // Example route for a user dashboard
  } else if (pathname.startsWith("/authentication")) {
    return AuthUserLayout; // Example route for a user dashboard
  } else {
    return DefaultFrontendLayout;
  }
}
