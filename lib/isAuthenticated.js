import Cookies from "js-cookie";
import crypto from "crypto";


const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET is undefined. Please check your environment variables."
  );
}

function base64UrlDecode(base64Url) {
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(base64, "base64").toString("utf-8");
}

export function decodeJWTManually(token) {
  if (!token) {
    console.warn("decodeJWTManually: Token is undefined or null.");
    return null;
  }

  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) {
    console.error("Malformed token.");
    return null;
  }

  try {
    const decodedHeader = JSON.parse(base64UrlDecode(header));
    const decodedPayload = JSON.parse(base64UrlDecode(payload));

    // Verify the signature
    const dataToVerify = `${header}.${payload}`;
    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(dataToVerify)
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    if (expectedSignature !== signature) {
      console.error("Invalid token signature.");
      return null;
    }

    return decodedPayload;
  } catch (error) {
    console.log("error fetching token", error);
    return null;
  }
}

export async function isAuthenticated() {
  const token = Cookies.get("token");
  if (!token) {
    console.warn("No token found in cookies.");
    return false;
  }

  const decodedToken = decodeJWTManually(token);
  if (!decodedToken) {
    console.warn("Decoded token is null or invalid.");
    return false;
  }

  const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
  if (decodedToken.exp && decodedToken.exp > currentTime) {
    return true; // Token is valid
  }

  console.warn("Token has expired or lacks expiration claim.");
  return false;
}
