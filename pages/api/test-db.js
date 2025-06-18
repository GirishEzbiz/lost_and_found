import { checkDbConnection } from "../../lib/db";

export default async function handler(req, res) {
  const connectionStatus = await checkDbConnection();
  if (connectionStatus) {
    res.status(200).json({ message: "Database connected successfully!" });
  } else {
    res.status(500).json({ error: "Failed to connect to the database." });
  }
}
