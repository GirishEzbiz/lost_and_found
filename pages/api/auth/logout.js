import { withMonitorLogger } from "utils/withMonitorLogger";
import sessionMiddleware from "../../../lib/session";

async function handler(req, res) {
  try {
    await sessionMiddleware(req, res);

    req.session.destroy((err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to log out" });
      }

      res.setHeader(
        "Set-Cookie",
        "user_sid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
      );
      res.status(200).json({ message: "Logged out successfully" });
    });
  } catch (error) {
    throw error
  }

}

export default withMonitorLogger(handler)