import { db } from "../../lib/db";
import { authenticate } from "../../lib/auth";
import { withMonitorLogger } from "utils/withMonitorLogger";
 

const handler = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const connection = await db.getConnection(); // Start transaction
  await connection.beginTransaction();

  try {
    // Authenticate user
    const { id: user_id } = authenticate(req, res);

    // Parse request body
    const { item_id, status } = req.body;

    if (!item_id || !["lost", "found"].includes(status)) {
      return res.status(400).json({ error: "Invalid item_id or status." });
    }

    // Step 1: Get qr_code_id from items table
    const [itemResult] = await connection.execute(
      "SELECT qr_code_id FROM items WHERE id = ? AND user_id = ?",
      [item_id, user_id]
    );

    if (itemResult.length === 0) {
      return res.status(404).json({ error: "Item not found or unauthorized." });
    }

    const qr_code_id = itemResult[0].qr_code_id;
    if (!qr_code_id) {
      return res
        .status(400)
        .json({ error: "No QR Code associated with this item." });
    }

    const currentTimestamp = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " "); // YYYY-MM-DD HH:MM:SS format

    // Step 2: Check if "lost" is already recorded in history
    if (status === "found") {
      const [lostCheck] = await connection.execute(
        "SELECT COUNT(*) AS lost_count FROM qr_code_history WHERE qr_code_id = ? AND status_type = 'lost'",
        [qr_code_id]
      );

      const alreadyLost = lostCheck[0].lost_count > 0;

      // If not marked as lost before, force insert "lost" record
      if (!alreadyLost) {
        await connection.execute(
          "INSERT INTO qr_code_history (qr_code_id, status_type, status_value, change_date) VALUES (?, 'lost', 1, ?)",
          [qr_code_id, currentTimestamp]
        );
      }
    }

    // Step 3: Update `qr_code` status (real-time tracking)
    if (status === "lost") {
      await connection.execute(
        "UPDATE qr_code SET is_lost = 1,is_found = 0, lost_date = CURRENT_TIMESTAMP WHERE qr_code = ?",
        [qr_code_id]
      );

      // Insert history record
      await connection.execute(
        "INSERT INTO qr_code_history (qr_code_id, status_type, status_value, change_date) VALUES (?, 'lost', 1, ?)",
        [qr_code_id, currentTimestamp]
      );

      await connection.commit(); // Commit transaction
      return res
        .status(200)
        .json({ message: "Item marked as lost successfully." });
    }

    if (status === "found") {
      await connection.execute(
        "UPDATE qr_code SET is_found = 1,is_lost = 0, recovery_date = CURRENT_TIMESTAMP WHERE qr_code = ?",
        [qr_code_id]
      );

      // Insert history record
      await connection.execute(
        "INSERT INTO qr_code_history (qr_code_id, status_type, status_value, change_date) VALUES (?, 'found', 1, ?)",
        [qr_code_id, currentTimestamp]
      );

      await connection.commit(); // Commit transaction
      return res
        .status(200)
        .json({ message: "Item marked as recovered successfully." });
    }
  } catch (error) {
    console.log("error updateing status", error);
    await connection.rollback(); // Rollback on error
     res.status(500).json({ error: "Internal server error." });
     throw error
}
finally {
    connection.release();
  }
};

export default withMonitorLogger(handler)
