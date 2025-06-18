import Cookies from "js-cookie";

function decodeJWT(token) {
  try {
    const base64Url = token.split(".")[1]; // Get the payload part of the JWT
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/"); // Replace URL-safe characters
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload); // Return the parsed JSON payload
  } catch (error) {
    console.log("error fetching token", error);
    return null; // Return null if decoding fails
  }
}

export function isAuthenticatedAdmin() {
  const token = Cookies.get("adminToken"); // Retrieve the token from cookies
  if (!token) {
    console.warn("No token found in cookies");
    return false;
  }

  try {
    const decodedToken = decodeJWT(token); // Decode the token
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

    if (decodedToken.exp && decodedToken.exp < currentTime) {
      console.warn("Token expired");
      return false; // Token expired
    }
    return true; // Token valid
  } catch (error) {
       console.log("error fetching token", error);
    return false; // Invalid token
  }
}
