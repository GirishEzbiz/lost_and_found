export async function fetchDashboardData() {
  const res = await fetch("/api/protected/data", {
    method: "GET",
    credentials: "include", // Ensures cookies are sent with the request
  });

  if (res.status === 401 || res.status === 403) {
    // Redirect to login if unauthorized
    window.location.href = "/login";
    return null;
  }

  const data = await res.json();
  return data;
}
