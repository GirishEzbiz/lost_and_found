import crypto from "crypto";

const algorithm = "aes-256-cbc";
const secretKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;

// Validate the encryption key
if (!secretKey || Buffer.from(secretKey, "hex").length !== 32) {
  throw new Error(
    "Invalid ENCRYPTION_KEY. It must be a 64-character hexadecimal string (32 bytes)."
  );
}

const iv = crypto.randomBytes(16); // 16-byte initialization vector

// Encrypt Function
export function encrypt(text) {
  const cipher = crypto.createCipheriv(
    algorithm,
    Buffer.from(secretKey, "hex"),
    iv
  );
  let encrypted = cipher.update(text, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

// Decrypt Function
export function decrypt(encryptedText) {
  const [ivHex, encryptedHex] = encryptedText.split(":");
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(secretKey, "hex"),
    Buffer.from(ivHex, "hex")
  );
  let decrypted = decipher.update(Buffer.from(encryptedHex, "hex"));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString("utf8");
}
